/**
 * 🔹 SPEC-C (20.09, memory-store incident) — StateManager overflow-contract regression tests:
 * 1. Bounded eviction: oldest memory_* keys dropped first on overflow; write still lands.
 * 2. Protected records are NEVER evicted: session_summary_latest, id-shaped (ctx_*) records,
 *    and any non-memory_* key (plan state etc.) — even when they are the oldest entries.
 * 3. Last resort stays a THROWS (honest failure): overflow no eviction can satisfy must not be silent.
 * Isolation follows tests/stateManager.test.ts convention: { ...DEFAULT_CONFIG, statePersistenceEnabled: false } + clear().
 */

import { StateManager } from '../src/stateManager';
import { DEFAULT_CONFIG } from '../src/config';

function makeManager(maxSize: number): StateManager {
  const m = new StateManager({ ...DEFAULT_CONFIG, statePersistenceEnabled: false, stateMaxSize: maxSize });
  m.clear();
  return m;
}

/** Seed entries with explicit (deterministic) timestamps — importState honors entry.timestamp. */
function seed(m: StateManager, entries: Array<[key: string, value: string, ts: number]>): void {
  m.importState(JSON.stringify(entries.map(([key, value, timestamp]) => ({ key, value, timestamp }))));
}

describe('StateManager SPEC-C overflow contract (20.09)', () => {
  test('evicts OLDEST memory_* first on overflow; newer records and the new write survive', () => {
    const m = makeManager(100);
    seed(m, [
      ['memory_1', 'a'.repeat(30), 1000], // oldest → evicted
      ['memory_2', 'b'.repeat(30), 2000], // kept
      ['memory_3', 'c'.repeat(30), 3000], // newest → kept
    ]);
    m.set('memory_new', 'x'.repeat(39)); // 90+39=129>100 → evict memory_1 (30) → 60+39=99≤100 fits

    expect(m.get<string>('memory_1')).toBeUndefined();
    expect(m.get<string>('memory_2')).toBe('b'.repeat(30));
    expect(m.get<string>('memory_3')).toBe('c'.repeat(30));
    expect(m.get<string>('memory_new')).toBe('x'.repeat(39));
  });

  test('NEVER evicts session_summary_latest / id-shaped / non-memory_* keys — even when oldest', () => {
    const m = makeManager(150);
    seed(m, [
      ['session_summary_latest', 's'.repeat(40), 1000], // protected (oldest)
      ['ctx_1789658191031_checkpoint', 'c'.repeat(20), 2000], // protected id-shaped
      ['some_plan_state', 'p'.repeat(20), 3000], // protected non-memory_*
      ['memory_old', 'm'.repeat(40), 4000], // evictable
      ['memory_mid', 'n'.repeat(30), 5000], // evictable (only if one drop is not enough)
    ]);
    m.set('memory_new', 'x'.repeat(40)); // 150+40=190>150 → evict OLDEST EVICTABLE (memory_old, 40B) → 150≤150 exactly one eviction

    expect(m.get<string>('session_summary_latest')).toBe('s'.repeat(40));
    expect(m.get<string>('ctx_1789658191031_checkpoint')).toBe('c'.repeat(20));
    expect(m.get<string>('some_plan_state')).toBe('p'.repeat(20));
    expect(m.get<string>('memory_old')).toBeUndefined(); // the only eviction
    expect(m.get<string>('memory_mid')).toBe('n'.repeat(30)); // not over-evicted
    expect(m.get<string>('memory_new')).toBe('x'.repeat(40));
  });

  test('replacing an existing memory_* key in place never evicts itself', () => {
    const m = makeManager(60);
    seed(m, [
      ['memory_a', 'a'.repeat(30), 1000],
      ['memory_b', 'b'.repeat(25), 2000],
    ]);
    m.set('memory_a', 'y'.repeat(45)); // net delta +15 → evicts OLDEST-OTHER (none other fits? memory_a is oldest)

    // excludeKey=memory_a: the only other candidate is memory_b. 55+15>60 → evict memory_b, replace a in place.
    expect(m.get<string>('memory_a')).toBe('y'.repeat(45));
    expect(m.get<string>('memory_b')).toBeUndefined();
  });

  test('last resort: overflow no eviction can satisfy THROWS (honest failure for tool callers)', () => {
    const m = makeManager(30);
    seed(m, [
      ['session_summary_latest', 's'.repeat(15), 1000], // protected — never a victim even though oldest
      ['memory_1', 'm'.repeat(15), 2000],               // evictable, but evicting it (30-15+40=55>30) still cannot fit → planned, NOT committed
    ]);
    expect(() => m.set('key', 'z'.repeat(40))).toThrow(/State size exceeds maximum/);
    // state is untouched — no partial write:
    expect(m.get<string>('session_summary_latest')).toBe('s'.repeat(15));
    expect(m.get<string>('memory_1')).toBe('m'.repeat(15));
  });

  test('evicting everything evictable frees exactly what it must (no over-eviction loop)', () => {
    const m = makeManager(70);
    seed(m, [
      ['memory_a', 'a'.repeat(20), 1000],
      ['memory_b', 'b'.repeat(20), 2000],
    ]);
    m.set('key', 'k'.repeat(45)); // 40+45=85>70 → evict a (20) → 65+... wait: after evict runningSize=20, need 20-0+45=65≤70 fits

    expect(m.get<string>('memory_a')).toBeUndefined();
    expect(m.get<string>('memory_b')).toBe('b'.repeat(20)); // exactly one eviction
    expect(m.get<string>('key')).toBe('k'.repeat(45));
  });
});
