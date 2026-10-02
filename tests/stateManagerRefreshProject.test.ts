/**
 * Tests for StateManager.refreshProject() — CONTAMINATION-FIX Part A (01.10).
 *
 * RESEARCH_session-memory-contamination_2026-10-01.md §5.1: temp dirs A/B → construct under WD=A, set(), switch CWD +
 * refreshProject() → assert the pending record lands in <A>/.session_context/."a"_memory.msgpack (A's OWN file), NOT
 * anywhere under B; post-rebind RAM holds only B's data. The pre-fix behavior instead wrote
 * <B>/.session_context/."A"_memory.msgpack — a foreign file planted in B's folder under A's name.
 *
 * Hermetic by design: all I/O goes to os.tmpdir() (the repo-store guard in jest.config.cjs throws on any write to
 * <rootDir>/.session_context; this suite never touches it). The working-dir seam mirrors restoreSessionContext.test.ts.
 */

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { encode, decode } from '@msgpack/msgpack';

import { StateManager, resolveProjectName } from '../src/stateManager';
import { DEFAULT_CONFIG } from '../src/config';

// Mutable working-dir seam (globalThis on purpose: jest.mock factory hoisting forbids out-of-scope variable refs).
jest.mock('../src/workingDir', () => ({
  getWorkingDir: (): string => (globalThis as Record<string, unknown>).__srm_wd as string,
}));

const _g = globalThis as Record<string, unknown>;

interface StoreRecord { key: string; value: unknown; timestamp: number }

async function readRecords(file: string): Promise<StoreRecord[] | null> {
  try {
    await fs.access(file);
    return decode(await fs.readFile(file)) as StoreRecord[];
  } catch {
    return null;
  }
}

describe('StateManager.refreshProject (CONTAMINATION-FIX Part A)', () => {
  let rootDir: string;
  let dirA: string;
  let dirB: string;

  beforeAll(async () => {
    // Controlled basenames so resolveProjectName() yields deterministic identities 'alpha'/'beta'.
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'smrefresh-'));
    dirA = path.join(rootDir, 'alpha');
    dirB = path.join(rootDir, 'beta');
    await fs.mkdir(dirA, { recursive: true });
    await fs.mkdir(dirB, { recursive: true });
  });

  afterAll(async () => {
    _g.__srm_wd = undefined;
    await fs.rm(rootDir, { recursive: true, force: true });
  });

  test('flushes pending RAM into the PREVIOUS project file and rebinds identity (A→B)', async () => {
    // Pre-seed B with its own record so post-rebind RAM is verifiably non-empty.
    const bCtx = path.join(dirB, '.session_context');
    await fs.mkdir(bCtx, { recursive: true });
    await fs.writeFile(path.join(bCtx, `.beta_memory.msgpack`), encode([
      { key: 'b_record', value: 'from-b', timestamp: Date.now() },
    ]));

    // Construct under A — the name FREEZES to A's basename (the defect being fixed).
    _g.__srm_wd = dirA;
    expect(resolveProjectName()).toBe('alpha');
    const manager = new StateManager({ ...DEFAULT_CONFIG, statePersistenceEnabled: true });
    await manager.forceLoad(); // settle constructor init
    expect(manager.getMemoryFilePath().projectName).toBe('alpha');

    // Pending RAM write (debounced 500ms — deliberately NOT flushed manually; refreshProject must own it).
    manager.set('a_record', 'from-a-pending-ram');

    // Simulate change_directory: the CWD switch has ALREADY happened before the rebind is invoked.
    _g.__srm_wd = dirB;
    await manager.refreshProject(dirA);

    // Identity rebound to B…
    expect(manager.getMemoryFilePath().projectName).toBe('beta');
    // …and RAM now serves ONLY B's records (doc §5.1: "post-rebind RAM holds only B's data").
    expect(manager.get<string>('a_record')).toBeUndefined();
    expect(manager.get<string>('b_record')).toBe('from-b');

    // A's pending RAM landed in A's OWN file…
    const aRecords = await readRecords(path.join(dirA, '.session_context', `.alpha_memory.msgpack`));
    expect(Array.isArray(aRecords)).toBe(true);
    expect((aRecords as StoreRecord[]).some(r => r.key === 'a_record' && r.value === 'from-a-pending-ram')).toBe(true);

    // …and NO foreign file exists in B's folder under A's name — the exact pre-fix artifact.
    await expect(fs.access(path.join(dirB, '.session_context', `.alpha_memory.msgpack`))).rejects.toThrow();
  });

  test('reverse switch (B→A) flushes B state to B and re-serves A from disk', async () => {
    _g.__srm_wd = dirB;
    const manager = new StateManager({ ...DEFAULT_CONFIG, statePersistenceEnabled: true });
    await manager.forceLoad(); // loads B's pre-seeded record into RAM
    expect(manager.getMemoryFilePath().projectName).toBe('beta');

    manager.set('b_pending', 'from-b-pending-ram');
    _g.__srm_wd = dirA;
    await manager.refreshProject(dirB);

    expect(manager.getMemoryFilePath().projectName).toBe('alpha');
    expect(manager.get<string>('a_record')).toBe('from-a-pending-ram'); // A's store re-loaded from disk
    expect(manager.get<string>('b_pending')).toBeUndefined();

    const bRecords = await readRecords(path.join(dirB, '.session_context', `.beta_memory.msgpack`));
    expect(Array.isArray(bRecords)).toBe(true);
    expect((bRecords as StoreRecord[]).some(r => r.key === 'b_pending' && r.value === 'from-b-pending-ram')).toBe(true);

    // Still no cross-project file in A's folder under B's name.
    await expect(fs.access(path.join(dirA, '.session_context', `.beta_memory.msgpack`))).rejects.toThrow();
  });

  test('same-project switch is a no-op (no rewrite churn, RAM untouched)', async () => {
    _g.__srm_wd = dirA;
    const manager = new StateManager({ ...DEFAULT_CONFIG, statePersistenceEnabled: true });
    await manager.forceLoad();
    expect(manager.get<string>('a_record')).toBe('from-a-pending-ram');

    // Switching "back" to the same resolved identity must not reload or drop RAM.
    const before = new Date().getTime();
    await manager.refreshProject(dirA); // previous dir = current dir (same project)
    expect(manager.get<string>('a_record')).toBe('from-a-pending-ram');
    expect(new Date().getTime() - before).toBeLessThan(1000); // no full file round-trip required to observe; pin cheapness loosely
  });

  test('writes after the rebind target ONLY the new project file (doc §5.4: zero cross-project records)', async () => {
    _g.__srm_wd = dirA;
    const manager = new StateManager({ ...DEFAULT_CONFIG, statePersistenceEnabled: true });
    await manager.forceLoad(); // identity 'alpha' (RAM: A's persisted records)
    manager.set('a_pre_switch', 'ram-before-switch');

    _g.__srm_wd = dirB;
    await manager.refreshProject(dirA); // rebind → 'beta'; everything pending for A flushed to A's own file first
    expect(manager.getMemoryFilePath().projectName).toBe('beta');

    manager.set('b_after', 'written-after-rebind'); // pending RAM under the NEW identity
    await manager.forceSave();                      // deterministic flush (debounce bypassed)

    const bRecords = await readRecords(path.join(dirB, '.session_context', `.beta_memory.msgpack`));
    expect((bRecords as StoreRecord[]).some(r => r.key === 'b_after' && r.value === 'written-after-rebind')).toBe(true);
    // No A record may have leaked into B's store (RAM was cleared by the rebind's forceLoad before any write here).
    expect((bRecords as StoreRecord[]).every(r => !String(r.key ?? '').startsWith('a_'))).toBe(true);

    const aRecords = await readRecords(path.join(dirA, '.session_context', `.alpha_memory.msgpack`));
    expect((aRecords as StoreRecord[] ?? []).some(r => r.key === 'b_after')).toBe(false); // A's store untouched by B-phase write
  });
});
