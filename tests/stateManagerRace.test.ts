/**
 * Regression Tests — StateManager Race Conditions (B1 & B2) + _origin persistence (B3)
 *
 * PROOF OF VULNERABILITY tests. These tests FAIL against the current implementation,
 * demonstrating that data loss is possible. After fixes are applied they should PASS.
 *
 * B1: Load-vs-Save race — constructor's async load has not finished when set() fires;
 *      the debounced save flushes a shrunken state map to disk, overwriting prior entries.
 *
 * B2: _rebuildKeysCache mid-window clear — getAllKeys() triggers state.clear() + reload
 *     from disk, destroying unflushed in-RAM entries that set() just wrote.
 *
 * B3: saveMemoryFile drops _origin on serialization → tier provenance lost after restart.
 */

import * as path from 'path';
import * as os from 'os';
import { encode, decode } from '@msgpack/msgpack';

// ────────────────────────────────────────────────────────────────────────────
// B1 CONTROL: Global flags so the fs/promises mock factory can conditionally
// hold pending the memory-file read without needing test-scope closures.
// ────────────────────────────────────────────────────────────────────────────
(globalThis as any).__SM_TEST_HOLD_READFILE = false;
(globalThis as any).__SM_TEST_HOLD_PROMISE = null;
(globalThis as any).__SM_TEST_RESOLVE_HOLD = null;

// Mock fs/promises — pass-through by default, HOLD for memory file when flag is set.
// This intercepts stateManager.ts's `import * as fs from 'fs/promises'`.
jest.mock('fs/promises', () => {
  const actual = jest.requireActual('fs/promises');
  return {
    ...actual,
    readFile: (p: any, opts?: any) => {
      if ((globalThis as any).__SM_TEST_HOLD_READFILE && String(p).includes('_memory.msgpack')) {
        // First call: create the held promise. Subsequent calls: return same one.
        if (!(globalThis as any).__SM_TEST_HOLD_PROMISE) {
          (globalThis as any).__SM_TEST_HOLD_PROMISE = new Promise<Buffer>(resolve => {
            (globalThis as any).__SM_TEST_RESOLVE_HOLD = resolve;
          });
        }
        return (globalThis as any).__SM_TEST_HOLD_PROMISE;
      }
      return actual.readFile(p, opts);
    },
  };
});

// Mock workingDir → point at our temp dir
let TMP_DIR: string;
(globalThis as any).__TEST_TMP_DIR = '';

jest.mock('../src/workingDir', () => ({
  getWorkingDir: jest.fn(() => (globalThis as any).__TEST_TMP_DIR),
  setWorkingDir: jest.fn(),
  resetWorkingDir: jest.fn(),
  resolvePath: jest.fn((p: string) => path.join((globalThis as any).__TEST_TMP_DIR, p)),
}));

// Import AFTER mocks are registered (hoisted by Jest anyway due to jest.mock placement)
import { StateManager } from '../src/stateManager';
import { DEFAULT_CONFIG } from '../src/config';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Create a msgpack buffer encoding N dummy entries */
function makeMemoryFile(n: number): Buffer {
  const entries = Array.from({ length: n }, (_, i) => ({
    key: `pre_existing_${i}`,
    value: `stored_value_${i}`,
    timestamp: Date.now() - (n - i) * 1000,
  }));
  return encode(entries);
}

/** Read and decode a msgpack file from disk using REAL fs (bypasses mock) */
async function readMemoryFile(filePath: string): Promise<any[]> {
  const realFs = require('fs/promises'); // This gets the ACTUAL module via requireActual path
  // NOTE: since jest.mock intercepts 'fs/promises', we need a workaround.
  // Use child_process or direct binding — simplest: just use Node's built-in via eval
  return new Promise((resolve, reject) => {
    const fsReal = (globalThis as any).process.binding?.('fs') ; 
    // Actually the cleanest approach in Jest CJS context:
    // Since we spread ...actual in our mock factory, all OTHER methods still point to real.
    // readFile is the only intercepted one — and ONLY when the flag is set + path matches.
    // For reading verification AFTER the test scenario, clear the hold flag first.
    (globalThis as any).__SM_TEST_HOLD_READFILE = false;
    const actual = jest.requireActual('fs/promises');
    actual.readFile(filePath).then(
      (buf: Buffer) => resolve(decode(buf) as any[]),
      reject
    );
  });
}

/** Get the memory file path for a given working dir */
function getMemoryPath(workingDir: string): string {
  const projectName = path.basename(workingDir).toLowerCase().replace(/[^a-z0-9]/g, '_');
  return path.join(workingDir, '.session_context', `.${projectName}_memory.msgpack`);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('StateManager Race Conditions (B1 & B2)', () => {

  beforeEach(() => {
    TMP_DIR = path.join(os.tmpdir(), `sm_race_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
    (globalThis as any).__TEST_TMP_DIR = TMP_DIR;
    // Reset B1 control flags
    (globalThis as any).__SM_TEST_HOLD_READFILE = false;
    (globalThis as any).__SM_TEST_HOLD_PROMISE = null;
    (globalThis as any).__SM_TEST_RESOLVE_HOLD = null;
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    const actualFs = jest.requireActual('fs/promises');
    try { await actualFs.rm(TMP_DIR, { recursive: true, force: true }); } catch {}
  });

  describe('B1 — Load-vs-Save race (constructor load still pending when set() fires)', () => {

    it('SHOULD preserve prior disk entries after a fast set() + save cycle', async () => {
      const actualFs = jest.requireActual('fs/promises');

      // Setup: create temp dir with pre-existing memory file containing 3 entries
      await actualFs.mkdir(path.join(TMP_DIR, '.session_context'), { recursive: true });
      const memPath = getMemoryPath(TMP_DIR);
      await actualFs.writeFile(memPath, makeMemoryFile(3));

      // ENABLE hold — all subsequent readFile calls for *_memory.msgpack will be held pending
      (globalThis as any).__SM_TEST_HOLD_READFILE = true;

      // Create StateManager — constructor kicks off async load which is NOW HELD PENDING
      const sm = new StateManager({ ...DEFAULT_CONFIG });

      // Immediately set a new key (simulates save_memory tool firing before load completes)
      sm.set('new_entry', 'written_before_load_completed');

      // Wait for the debounced save to fire (500ms + 250ms buffer)
      await new Promise(r => setTimeout(r, 800));

      // At this point: if B1 is present, the file on disk has only 1 entry (new_entry)
      // because saveToFile() serialized a state map that never received the original 3 entries.

      // NOW release the hold — let constructor's load finally complete into RAM
      const resolver = (globalThis as any).__SM_TEST_RESOLVE_HOLD;
      if (resolver) {
        resolver(makeMemoryFile(3));
        await new Promise(r => setTimeout(r, 200));
      }

      // ── ASSERTION: Disk file should contain BOTH original + new entry ──
      const diskEntries = await readMemoryFile(memPath);

      expect(diskEntries.length).toBeGreaterThanOrEqual(4);
      const keys = diskEntries.map(e => e.key);
      expect(keys).toContain('new_entry');
      expect(keys.filter(k => k.startsWith('pre_existing_')).length).toBe(3);
    });

    it('SHOULD NOT lose prior entries when burst set() calls fire before load settles', async () => {
      const actualFs = jest.requireActual('fs/promises');

      await actualFs.mkdir(path.join(TMP_DIR, '.session_context'), { recursive: true });
      const memPath = getMemoryPath(TMP_DIR);
      await actualFs.writeFile(memPath, makeMemoryFile(5));

      (globalThis as any).__SM_TEST_HOLD_READFILE = true;

      const sm = new StateManager({ ...DEFAULT_CONFIG });
      // Fire 3 sets in rapid succession — simulates burst tool calls at plugin start
      sm.set('burst_a', 'val_a');
      sm.set('burst_b', 'val_b');
      sm.set('burst_c', 'val_c');

      await new Promise(r => setTimeout(r, 800)); // debounced save fires here with incomplete state

      const resolver = (globalThis as any).__SM_TEST_RESOLVE_HOLD;
      if (resolver) {
        resolver(makeMemoryFile(5));
        await new Promise(r => setTimeout(r, 200));
      }

      // Verify disk: should have original 5 + 3 burst = 8 entries
      const diskEntries = await readMemoryFile(memPath);

      expect(diskEntries.length).toBe(8);
      const keys = diskEntries.map(e => e.key);
      for (const k of ['burst_a', 'burst_b', 'burst_c']) {
        expect(keys).toContain(k);
      }
    });
  });

  describe('B2 — _rebuildKeysCache mid-flush-window destroys unflushed entries', () => {

    it('SHOULD preserve a set() entry when getAllKeys() is called before debounce fires', async () => {
      const actualFs = jest.requireActual('fs/promises');

      await actualFs.mkdir(path.join(TMP_DIR, '.session_context'), { recursive: true });
      const memPath = getMemoryPath(TMP_DIR);

      // Pre-seed disk with 2 entries so _rebuildKeysCache has something to reload
      await actualFs.writeFile(memPath, makeMemoryFile(2));

      const sm = new StateManager({ ...DEFAULT_CONFIG });

      // Wait for constructor load to settle (no hold — let it finish naturally)
      await new Promise(r => setTimeout(r, 150));

      // NOW set a new entry — queues debounced save at +500ms but does NOT flush immediately
      sm.set('unflushed_entry', 'should_survive_rebuild');

      // Immediately call getAllKeys() — triggers _rebuildKeysCache() which does:
      //   state.clear() → loadMemoryFile() from disk (which doesn't have the unflushed entry)
      const keys = await sm.getAllKeys();

      // The unflushed entry should still be present in RAM/keys
      expect(keys).toContain('unflushed_entry');
    });

    it('SHOULD preserve state after getAllKeys() + subsequent forced save', async () => {
      const actualFs = jest.requireActual('fs/promises');

      await actualFs.mkdir(path.join(TMP_DIR, '.session_context'), { recursive: true });
      const memPath = getMemoryPath(TMP_DIR);
      await actualFs.writeFile(memPath, makeMemoryFile(2));

      const sm = new StateManager({ ...DEFAULT_CONFIG });
      await new Promise(r => setTimeout(r, 150)); // let constructor load settle

      sm.set('critical_data', 'must_not_be_lost');

      // Trigger the rebuild path (getAllKeys with cache invalidated)
      await sm.getAllKeys();

      // Force-save to persist whatever is in RAM after the rebuild
      await sm.forceSave();

      // Read disk — critical_data should be there
      const diskEntries = await readMemoryFile(memPath);
      const keys = diskEntries.map(e => e.key);
      expect(keys).toContain('critical_data');
    });
  });

  describe('_origin persistence (B3 — provenance lost on save/reload)', () => {

    it('SHOULD preserve _origin tier across a save+reload cycle', async () => {
      const actualFs = jest.requireActual('fs/promises');

      await actualFs.mkdir(path.join(TMP_DIR, '.session_context'), { recursive: true });

      // First instance: set tiered entry and persist it
      const sm1 = new StateManager({ ...DEFAULT_CONFIG });
      await new Promise(r => setTimeout(r, 150));

      sm1.setWithTier('tiered_entry', { data: 'some_ast_extraction' }, 'ast');
      await sm1.forceSave();

      // Second instance (simulates plugin restart) — reloads from disk
      const sm2 = new StateManager({ ...DEFAULT_CONFIG });
      await new Promise(r => setTimeout(r, 150));

      // Check if tiered_entry still has 'ast' origin after the round-trip
      const astEntries = sm2.getByOrigin('ast');
      expect(astEntries.length).toBeGreaterThanOrEqual(1);
      expect(astEntries[0].key).toBe('tiered_entry');
    });
  });
});
