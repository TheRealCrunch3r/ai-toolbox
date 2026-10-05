/**
 * Regression suite (A3, 04.10 — plan_1791030993833 A-arc): ContextStorageManager write-back must be
 * NON-DESTRUCTIVE for context records whose project_path stamp does not match the current store path.
 *
 * WIPe CLASS UNDER TEST (03.10 fact-loss incident, pinned by A2 code forensics): load() returns only ctx
 * entries with project_path === workingDirPath (or legacy no-stamp); saveCore() previously wrote back
 * `[...loadedEntries, ...preservedForeign]` where preservedForeign kept NON-context shapes ONLY. Any
 * context entry stamped with a foreign/other path therefore failed BOTH lists and was silently DELETED by
 * EVERY CSM save — addEntry / deleteEntry / clearAll / pruneExpiredSessionEntries / the inline read-prune in
 * getRecentEntries & searchEntries. This suite pins that every default save preserves all existing ctx_*
 * records, while explicit layer wipes (clearAll / removeCrossProjectEntries) keep their deletion contract.
 *
 * Conventions: cloned from tests/csmSharedFileRegression.test.ts — real classes without .js suffix, tmp-dir
 * fixtures under a dir named EXACTLY "ai_toolbox" (shared-file identity), setWorkingDir BEFORE construction,
 * resetWorkingDir in afterEach, path-drift guard after every manager construction.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { encode, decode } from '@msgpack/msgpack';
import { ContextStorageManager } from '../src/tools/contextManagementTools';
import { StateManager } from '../src/stateManager';
import { setWorkingDir, resetWorkingDir } from '../src/workingDir';

// ==================== Fixture builders (shapes cloned from csmSharedFileRegression.test.ts) ====================

let seq = 0;
const NOW = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

function ctxFixture(stamp: string, overrides: Partial<{ id: string; title: string; content: string; scope?: 'global' | 'session'; ttl_ms?: number; timestamp?: number }> = {}): Record<string, unknown> {
  return {
    id: overrides.id ?? `ctx_e_${++seq}`,
    timestamp: overrides.timestamp ?? NOW,
    date: new Date(overrides.timestamp ?? NOW).toLocaleString(),
    type: 'decision',
    title: overrides.title ?? 'E Fixture Decision',
    content: overrides.content ?? 'Default E fixture decision content.',
    tags: ['efixture'],
    scope: overrides.scope ?? 'global',
    ...(overrides.ttl_ms !== undefined ? { ttl_ms: overrides.ttl_ms } : {}), // 🔹 E2 FIX (04.10) + E7-VERIFY-FIX (04.10): emit the key ONLY when a TTL is set — without an explicit value this line produced `ttl_ms: undefined`
                             // on every non-session fixture, and @msgpack/msgpack encodes that as nil → decodes to null while JSON.stringify drops the key:
                             // CSM's post-rename verify then false-positived a clobber on its own commit (E7 stale-mirror failure). E2 keeps an explicit TTL byte-for-byte.
    frequency: 1,
    project_path: stamp, // canonical stamp shape = the memory FILE path (see mergeEntriesWithTiers)
  };
}

function stateFixture(key: string, value: unknown): Record<string, unknown> {
  return { key, value, timestamp: NOW };
}

/** The shared file path for a working dir named exactly "ai_toolbox". */
function sharedFileFor(wdDir: string): string {
  return path.join(wdDir, '.session_context', '.ai_toolbox_memory.msgpack');
}

/** Create <tmpRoot>/ai_toolbox (basename MUST stay "ai_toolbox") and write records into its shared store. */
function writeSharedFixture(tmpRoot: string, records: Array<Record<string, unknown>>): { wdDir: string; filePath: string } {
  const wdDir = path.join(tmpRoot, 'ai_toolbox');
  fs.mkdirSync(path.join(wdDir, '.session_context'), { recursive: true });
  const filePath = sharedFileFor(wdDir);
  fs.writeFileSync(filePath, encode(records));
  return { wdDir, filePath };
}

function rawRecords(filePath: string): Array<Record<string, unknown>> {
  const decoded = decode(fs.readFileSync(filePath));
  if (!Array.isArray(decoded)) throw new Error(`fixture at ${filePath} is not an array`);
  return decoded as Array<Record<string, unknown>>;
}

const contextShaped = (r: Record<string, unknown>): boolean =>
  typeof r.id === 'string' && typeof r.type === 'string' && typeof r.content === 'string';

/** 🔹 PATH-DRIFT GUARD (cloned from csmSharedFileRegression): pin the ACTUAL resolved storage path to the tmp
 * fixture so any resolution drift fails with an explicit diff instead of writing into the live repo store. */
function expectPathsPinned(label: string, sm: StateManager | null, csm: ContextStorageManager | null, expectedFile: string): void {
  if (sm) {
    const viaSm = path.resolve(sm.getMemoryFilePath().filePath);
    expect({ [`${label}: StateManager`]: viaSm }).toEqual({ [`${label}: StateManager`]: expectedFile });
  }
  if (csm) {
    const wdPath = (csm as unknown as { workingDirPath: string }).workingDirPath; // ctor-captured field — no public getter
    expect({ [`${label}: CSM`]: path.resolve(wdPath) }).toEqual({ [`${label}: CSM`]: expectedFile });
  }
}

// ==================== Suite E — A3 non-destructive write-back (04.10, wipe-class regressions) ====================

describe('CSM non-destructive save (A3, 04.10) — out-of-scope context records survive every default save', () => {
  let tmpRoot: string;
  let wdDir: string;
  const foreignWd = path.join(os.tmpdir(), 'e-foreign-proj'); // never created on disk — stamp only
  const FOREIGN_STAMP = path.join(foreignWd, '.session_context', '.ai_toolbox_memory.msgpack');

  beforeEach(() => {
    seq = 0;
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'csmnondestructive-'));
  });

  afterEach(() => {
    resetWorkingDir(); // established convention — never leak CWD state between tests
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch { /* best-effort */ }
  });

  test('E1 addEntry over a store holding foreign-stamped ctx entries keeps them (the 03.10 wipe class)', async () => {
    const own = ctxFixture(sharedFileFor(path.join(tmpRoot, 'ai_toolbox')), { id: 'ctx_e_own', title: 'Own entry' });
    const foreign = ctxFixture(FOREIGN_STAMP, { id: 'ctx_e_foreign', title: 'Foreign-stamped entry that A2 forensics pinned as the wipe victim' });
    ({ wdDir } = writeSharedFixture(tmpRoot, [foreign, stateFixture('memory_E_seed', { fact: 'seed state record' })]));

    setWorkingDir(wdDir); // BEFORE construction — CSM captures getWorkingDir() in its constructor
    const csm = new ContextStorageManager();
    expectPathsPinned('E1', null, csm, sharedFileFor(wdDir));
    await csm.addEntry({ ...own } as never);

    const records = rawRecords(sharedFileFor(wdDir));
    // The exact pre-fix failure: foreign ctx entry dropped (not in load()'s view, not non-context-shaped either).
    expect(records.find(r => r.id === 'ctx_e_foreign')?.title).toBe('Foreign-stamped entry that A2 forensics pinned as the wipe victim');
    // Own layer + state layer intact too:
    expect(records.find(r => r.id === 'ctx_e_own')).toBeDefined();
    expect(records.find(r => r.key === 'memory_E_seed')?.value).toEqual({ fact: 'seed state record' });

    // READ ISOLATION is unchanged: CSM's consumer view still sees ONLY this project's stamp (plus legacy no-stamp).
    const loaded = await csm.load();
    expect(loaded.map(e => e.id)).toEqual(['ctx_e_own']);
  });

  test('E2 inline read-prune in getRecentEntries preserves foreign records while dropping the expired own entry', async () => {
    const stamp = sharedFileFor(path.join(tmpRoot, 'ai_toolbox'));
    const expiredOwn = ctxFixture(stamp, { id: 'ctx_e_expired', title: 'Expired session entry', scope: 'session', ttl_ms: DAY_MS, timestamp: NOW - 2 * DAY_MS });
    const liveOwn = ctxFixture(stamp, { id: 'ctx_e_live', title: 'Live own entry' });
    const foreign = ctxFixture(FOREIGN_STAMP, { id: 'ctx_e_foreign2', title: 'Foreign entry across inline prune' });
    ({ wdDir } = writeSharedFixture(tmpRoot, [expiredOwn, liveOwn, foreign, stateFixture('memory_E_keep', { fact: 'keep me' })]));

    setWorkingDir(wdDir);
    const csm = new ContextStorageManager();
    expectPathsPinned('E2', null, csm, sharedFileFor(wdDir));
    await csm.getRecentEntries(10); // triggers the FIX #2 inline prune save (expiredOwn removed)

    const records = rawRecords(sharedFileFor(wdDir));
    expect(records.some(r => r.id === 'ctx_e_expired')).toBe(false);      // designed expiry removal still happens…
    expect(records.find(r => r.id === 'ctx_e_foreign2')).toBeDefined();   // …but the foreign record is NOT collateral damage
    expect(records.find(r => r.id === 'ctx_e_live')).toBeDefined();
    expect(records.find(r => r.key === 'memory_E_keep')?.value).toEqual({ fact: 'keep me' });
  });

  test('E3 deleteEntry removes only the targeted id — foreign + state layers untouched', async () => {
    const stamp = sharedFileFor(path.join(tmpRoot, 'ai_toolbox'));
    ({ wdDir } = writeSharedFixture(tmpRoot, [
      ctxFixture(stamp, { id: 'ctx_e_delete_me' }),
      ctxFixture(FOREIGN_STAMP, { id: 'ctx_e_foreign3' }),
      stateFixture('session_summary_latest', { task_description: 'must survive deleteEntry.' }),
    ]));

    setWorkingDir(wdDir);
    const csm = new ContextStorageManager();
    await expect(csm.deleteEntry('ctx_e_delete_me')).resolves.toBe(true);

    const records = rawRecords(sharedFileFor(wdDir));
    expect(records.some(r => r.id === 'ctx_e_delete_me')).toBe(false);
    expect(records.find(r => r.id === 'ctx_e_foreign3')).toBeDefined();
    expect((records.find(r => r.key === 'session_summary_latest') as { value?: { task_description?: string } })?.value?.task_description)
      .toBe('must survive deleteEntry.');
  });

  test('E4 clearAll() is the explicit wipe: removes ALL context entries (incl. foreign), keeps state records', async () => {
    const stamp = sharedFileFor(path.join(tmpRoot, 'ai_toolbox'));
    ({ wdDir } = writeSharedFixture(tmpRoot, [
      ctxFixture(stamp, { id: 'ctx_e_own4' }),
      ctxFixture(FOREIGN_STAMP, { id: 'ctx_e_foreign4' }),
      stateFixture('memory_E_fact', { fact: 'state survives clearAll.' }),
    ]));

    setWorkingDir(wdDir);
    const csm = new ContextStorageManager();
    await expect(csm.clearAll()).resolves.toBeUndefined();

    const records = rawRecords(sharedFileFor(wdDir));
    expect(records.filter(contextShaped)).toHaveLength(0); // explicit layer wipe still works (contract preserved)
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ key: 'memory_E_fact' });
  });

  test('E5 removeCrossProjectEntries() stays a no-op for foreign stamps (load()-view delta is empty) — and never damages anything', async () => {
    const stamp = sharedFileFor(path.join(tmpRoot, 'ai_toolbox'));
    ({ wdDir } = writeSharedFixture(tmpRoot, [
      ctxFixture(stamp, { id: 'ctx_e_keep5' }),
      // legacy no-stamp entry — the "lost/corrupted working dir storage" class load() still serves; must be kept.
      { id: 'ctx_e_legacy', timestamp: NOW, date: new Date(NOW).toLocaleString(), type: 'pattern', title: 'Legacy unstamped', content: 'legacy body', tags: ['legacy'] },
      ctxFixture(FOREIGN_STAMP, { id: 'ctx_e_foreign5a' }),
    ]));

    setWorkingDir(wdDir);
    const csm = new ContextStorageManager();
    const removed = await csm.removeCrossProjectEntries();

    // load() already excludes foreign stamps (same predicate as the internal filter) → view delta is 0, no save fires.
    // Pinning ACTUAL current semantics: the method must neither report nor delete what it cannot see — and under A3 a
    // hypothetical future view change would route through the explicit clearContextLayer wipe instead of the default save.
    expect(removed).toBe(0);
    const records = rawRecords(sharedFileFor(wdDir));
    expect(records.find(r => r.id === 'ctx_e_foreign5a')).toBeDefined(); // untouched — nothing was written at all
    expect(records.find(r => r.id === 'ctx_e_keep5')).toBeDefined();
    expect(records.find(r => r.id === 'ctx_e_legacy')).toBeDefined(); // legacy rule untouched by the fix
  });

  test('E6 id-collision dedupe: an incoming entry supersedes its on-disk twin even under a foreign stamp (no duplicate ids)', async () => {
    ({ wdDir } = writeSharedFixture(tmpRoot, [ctxFixture(FOREIGN_STAMP, { id: 'ctx_e_dup', title: 'old body' })]));

    setWorkingDir(wdDir);
    const csm = new ContextStorageManager();
    await csm.addEntry({ ...ctxFixture(sharedFileFor(wdDir), { id: 'ctx_e_dup', title: 'new body wins' }) } as never);

    const records = rawRecords(sharedFileFor(wdDir));
    const dupes = records.filter(r => r.id === 'ctx_e_dup');
    expect(dupes).toHaveLength(1); // replace-semantics preserved — the union must not write both versions
    expect((dupes[0].title as string)).toBe('new body wins');
  });

  test('E7 dual-writer composition: SM forceSave and CSM addEntry both preserve foreign-stamped ctx records', async () => {
    const stamp = sharedFileFor(path.join(tmpRoot, 'ai_toolbox'));
    ({ wdDir } = writeSharedFixture(tmpRoot, [
      ctxFixture(stamp, { id: 'ctx_e_own7' }),
      ctxFixture(FOREIGN_STAMP, { id: 'ctx_e_foreign7' }),
    ]));

    setWorkingDir(wdDir);
    const sm = new StateManager();
    await sm.forceLoad(); // settle _ready — projectContextDir is only usable afterwards
    const csm = new ContextStorageManager();
    expectPathsPinned('E7', sm, csm, sharedFileFor(wdDir)); // BOTH writers pinned to the fixture (no repo leak)

    // 🔹 TEMP-CLEANUP (04.10 close-out): E7DIAG/E7-CAPTURE instrumentation removed after both gates GREEN — evidence set is on disk
    // (csm_e7verify_gate.log + the pre-fix e7diag-csm.txt capture); the test body below is assertions-only (writer order unchanged).
    sm.set('memory_E_new', { fact: 'state written mid-flight' });
    await sm.forceSave();
    await csm.addEntry(ctxFixture(stamp, { id: 'ctx_e_added7' }) as never);

    const records = rawRecords(sharedFileFor(wdDir));
    expect(records.find(r => r.key === 'memory_E_new')?.value).toEqual({ fact: 'state written mid-flight' });
    expect(records.find(r => r.id === 'ctx_e_foreign7')).toBeDefined(); // foreign ctx survives BOTH writers
    expect(records.filter(r => contextShaped(r))).toHaveLength(3);

    // The last-known-good mirror reflects the full union (Suite B recovery depends on it):
    const mirror: unknown = JSON.parse(fs.readFileSync(`${sharedFileFor(wdDir)}.backup.json`, 'utf-8'));
    expect(Array.isArray(mirror)).toBe(true);
    expect((mirror as Array<Record<string, unknown>>).filter(contextShaped)).toHaveLength(3);
  });
});
