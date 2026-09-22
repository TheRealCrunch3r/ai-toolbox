/**
 * Regression suite: CSM ↔ StateManager shared-file preservation + corruption recovery (20.09).
 *
 * INCIDENT UNDER TEST (observed live 20.09): <wd>/.session_context/.ai_toolbox_memory.msgpack is
 * SHARED by two writers with different record shapes — ContextStorageManager writes context entries
 * ({id,type,title,content,...}) while StateManager/save_memory|save_session_summary write state records
 * ({key,value,timestamp}). Evidence left on disk at the time: TWO .corrupt-* quarantines plus a stale
 * .tmp (the fixed-name cross-writer hazard SPEC-C removed). The wipe class this file guards against has
 * recurred three times before 30.08 (FIX #23 CSM-side, FIX #25 SM-side) — both directions are covered here.
 *
 * WHAT IS PINNED:
 *  Suite A — ContextStorageManager.save()/clearAll() preserve foreign (non-context-shaped) records in the
 *            shared file (CSM side of the wipe class; live bug: track_important_event once wiped every
 *            memory_* fact + session_summary_latest).
 *  Suite B — StateManager.loadMemoryFile corruption recovery (SPEC-C Primary 1, 20.09):
 *              - corrupt primary + valid last-known-good mirror (.backup.json) → quarantine corrupt bytes,
 *                restore the mirror into the slot, RAM holds exactly the state-shaped records;
 *              - corrupt primary + NO mirror      → plain quarantine (F3), empty store, NO DELETE — file
 *                preserved for inspection;
 *            plus: a fresh StateManager instance must NOT resurrect quarantined data, and CSM.save() against
 *            the restored slot works normally.
 *  Suite C — the inverse direction in a single shared file: SM writes (set + forceSave) preserve foreign
 *            CONTEXT entries (CSM-shaped records) on write-back (FIX #25 side of the wipe class), and a CSM
 *            clearAll() over that mixed store removes only context entries.
 *
 * CONVENTIONS (cloned from tests/contextSearch.test.ts + cwdConsistency):
 *  - Import real classes WITHOUT .js suffix — established mock-bypass convention in this suite family.
 *  - resetWorkingDir() in afterEach; fixtures under os.tmpdir so the repo's own .session_context is never touched.
 *  - ContextStorageManager captures getWorkingDir() AT CONSTRUCTION (contextManagementTools.ts) → set the
 *    working dir BEFORE `new ContextStorageManager()`; same for StateManager (its _ready IIFE resolves it).
 *  - Working-dir basename must be EXACTLY "ai_toolbox" so StateManager's file name
 *    `<wd>/.session_context/.<sanitized-basename>_memory.msgpack` matches CSM's hardcoded
 *    `.ai_toolbox_memory.msgpack` — that is the shared-file identity this suite exists to pin.
 *
 * KNOWN ENVIRONMENT DEPENDENCY (documented, not fixable in-repo): both managers' load paths READ-FALLBACK to
 * <repoRoot>/.session_context/ (CSM: legacy entries only; get_session_summary's disk fallback). This suite keeps
 * that path non-interfering by design — every test writes its own wd file first, so the wd branch always wins.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { encode, decode } from '@msgpack/msgpack';
import { ContextStorageManager } from '../src/tools/contextManagementTools';
import { StateManager } from '../src/stateManager';
import { setWorkingDir, resetWorkingDir } from '../src/workingDir';

// ==================== Fixture builders (shapes cloned from contextSearch.test.ts) ====================

let seq = 0;

/** Well-formed context entry (the shape ContextEntry requires — CSM's isContextEntry guard). */
function ctxFixture(overrides: Partial<{ title: string; content: string; tags?: string[] }> = {}): Record<string, unknown> {
  return {
    id: `ctx_csmfixture_${++seq}`,
    timestamp: Date.now(),
    date: new Date().toLocaleString(),
    type: 'decision',
    title: overrides.title ?? 'CSM Fixture Decision',
    content: overrides.content ?? 'Default CSM fixture decision content.',
    tags: overrides.tags ?? ['csmfixture'],
  };
}

/** StateManager record — the shape save_memory/save_session_summary writes ({key, value, timestamp}). */
function stateFixture(key: string, value: unknown): Record<string, unknown> {
  return { key, value, timestamp: Date.now() };
}

/** The shared file path for a working dir named exactly "ai_toolbox". */
function sharedFileFor(wdDir: string): string {
  return path.join(wdDir, '.session_context', '.ai_toolbox_memory.msgpack');
}

/** Write records (msgpack) to the shared file inside tmpRoot/ai_toolbox/. Returns [wdDir, filePath]. */
function writeSharedFixture(tmpRoot: string, records: Array<Record<string, unknown>>): { wdDir: string; filePath: string } {
  const wdDir = path.join(tmpRoot, 'ai_toolbox'); // basename MUST stay "ai_toolbox" — see header
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

/** 🔹 PATH-DRIFT GUARD (20.09 PM): after each manager construction, pin the ACTUAL resolved storage path to
 * the tmp fixture. If resolution ever drifts (working-dir capture order, fallback paths), subsequent
 * assertions fail with an explicit "resolved X vs expected Y" diff instead of the old silent signature
 * ("expected 1 quarantine file, got 0"). This suite's whole premise is that BOTH writers target exactly
 * this one shared file — asserting it once per construction is what makes any regression self-explaining. */
function expectPathsPinned(
  label: string,
  sm: StateManager | null,
  csm: ContextStorageManager | null,
  expectedFile: string,
): void {
  if (sm) {
    const viaSm = path.resolve(sm.getMemoryFilePath().filePath); // live getter — mirrors getProjectMemoryFilePath() resolution (I/O-free), fixed 20.09 PM: it previously returned the frozen PLUGIN_ROOT field and drifted to <repo> under jest
    expect({ [`${label}: StateManager`]: viaSm }).toEqual({ [`${label}: StateManager`]: expectedFile });
  }
  if (csm) {
    const wdPath = (csm as unknown as { workingDirPath: string }).workingDirPath; // ctor-captured field — no public getter exists
    expect({ [`${label}: CSM`]: path.resolve(wdPath) }).toEqual({ [`${label}: CSM`]: expectedFile });
  }
}

// ==================== Suite A — CSM.save()/clearAll() preserve foreign records ====================

describe('CSM ↔ StateManager shared file (20.09) — Suite A: ContextStorageManager preserves state records', () => {
  let tmpRoot: string;
  let wdDir: string;

  beforeEach(() => {
    seq = 0;
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'csmshared-A-'));
  });

  afterEach(() => {
    resetWorkingDir(); // established convention — never leak CWD state between tests
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch { /* best-effort */ }
  });

  test('addEntry over a store that already holds StateManager records keeps those records on disk', async () => {
    const fact = 'Foreign state record seeded before CSM write.';
    ({ wdDir } = writeSharedFixture(tmpRoot, [stateFixture('memory_A_seed', { fact })]));

    setWorkingDir(wdDir); // BEFORE construction — CSM captures getWorkingDir() in its constructor
    const csm = new ContextStorageManager();
    await csm.addEntry(ctxFixture({ title: 'A1 decision', content: 'First CSM entry on top of seeded state.' }));

    const records = rawRecords(sharedFileFor(wdDir));
    expect(records).toHaveLength(2); // both layers present — the shared file is exactly this mix
    expect(records.find(r => r.key === 'memory_A_seed')).toMatchObject({ key: 'memory_A_seed', value: { fact } });
    expect(records.filter(contextShaped)).toHaveLength(1);

    // CSM's own consumer view still sees its entry (foreign records are invisible to it, by design):
    const loaded = await csm.load();
    expect(loaded).toHaveLength(1);
  });

  test('clearAll() removes ONLY context entries — memory_* and session_summary_latest survive intact', async () => {
    ({ wdDir } = writeSharedFixture(tmpRoot, [
      ctxFixture({ title: 'A2 to-be-cleared entry' }),
      stateFixture('memory_A_fact', { fact: 'Must survive clearAll.', timestamp: Date.now(), date: '' }),
      stateFixture('session_summary_latest', { task_description: 'Must also survive clearAll.' }),
    ]));

    setWorkingDir(wdDir);
    const csm = new ContextStorageManager();
    await expect(csm.clearAll()).resolves.toBeUndefined();

    const records = rawRecords(sharedFileFor(wdDir));
    expect(records.filter(contextShaped)).toHaveLength(0); // context layer wiped — that is clearAll's job
    expect(records).toHaveLength(2);                       // …and ONLY the context layer
    expect(records.find(r => r.key === 'memory_A_fact')?.value).toEqual({ fact: 'Must survive clearAll.', timestamp: expect.any(Number), date: '' });
    expect((records.find(r => r.key === 'session_summary_latest') as { value?: { task_description?: string } })?.value?.task_description)
      .toBe('Must also survive clearAll.');

    // End-to-end through the REAL StateManager consumer (proves survival at the read layer, not just raw bytes):
    const sm = new StateManager();
    await sm.forceLoad(); // ensureReady must settle before any save path — projectContextDir is set in _ready
    expect(sm.get<{ fact?: string }>('memory_A_fact')?.fact).toBe('Must survive clearAll.');
    expect(typeof sm.get<unknown>('session_summary_latest')).toBe('object');

    await sm.forceSave(); // the SM write-back over the cleared store must itself preserve both records
    const afterSm = rawRecords(sharedFileFor(wdDir));
    expect(afterSm).toHaveLength(2);
    expect(afterSm.filter(contextShaped)).toHaveLength(0);
  });

  test('addEntry() id-overwrite and deleteEntry() leave foreign records untouched (full CSM write path)', async () => {
    const seeded = ctxFixture({ title: 'A3 seed', content: 'seeded via raw encode' });
    ({ wdDir } = writeSharedFixture(tmpRoot, [seeded, stateFixture('memory_A_keep', { fact: 'keep me' })]));

    setWorkingDir(wdDir);
    const csm = new ContextStorageManager();

    // 1) Overwrite the seeded entry in place (same id) — foreign record must survive the load→merge→save round-trip.
    await csm.addEntry({ ...seeded, content: 'overwritten by addEntry' });
    let records = rawRecords(sharedFileFor(wdDir));
    expect(records.filter(r => contextShaped(r))).toHaveLength(1);
    expect((records.find(contextShaped)?.content as string)).toBe('overwritten by addEntry');
    expect(records.find(r => r.key === 'memory_A_keep')).toBeDefined();

    // 2) Delete the entry — foreign record still survives.
    await expect(csm.deleteEntry(seeded.id as string)).resolves.toBe(true);
    records = rawRecords(sharedFileFor(wdDir));
    expect(records).toHaveLength(1);
    expect(records[0].key).toBe('memory_A_keep');
  });
});

// ==================== Suite B — StateManager corruption recovery (SPEC-C Primary 1) ====================

describe('CSM ↔ StateManager shared file (20.09) — Suite B: loadMemoryFile quarantine + mirror recovery', () => {
  let tmpRoot: string;
  let wdDir: string;
  let filePath: string;

  beforeEach(() => {
    seq = 0;
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'csmshared-B-'));
    ({ wdDir, filePath } = writeSharedFixture(tmpRoot, [
      stateFixture('memory_B_pre', { fact: 'Pre-corruption fact.' }),
      ctxFixture({ title: 'B pre-existing context entry' }),
    ]));
  });

  afterEach(() => {
    resetWorkingDir();
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch { /* best-effort */ }
  });

  /** Corrupt the primary IN PLACE (valid msgpack bytes → garbage), keeping the mirror path explicit. */
  function corruptPrimary(corruptBytes = Buffer.from('not-msgpack-torn-write-garbage')): void {
    fs.writeFileSync(filePath, corruptBytes); // valid decode() now throws — the incident's trigger condition
  }

  test('corrupt primary + VALID mirror → quarantine corrupt bytes, restore slot from mirror, RAM = state records only', async () => {
    // A legitimate prior save wrote the last-known-good mirror (this is what saveMemoryFile does after each success):
    fs.writeFileSync(`${filePath}.backup.json`, JSON.stringify(rawRecords(filePath)), 'utf-8');

    corruptPrimary();
    expect(() => decode(fs.readFileSync(filePath))).toThrow(); // precondition: primary really is undecodable

    setWorkingDir(wdDir);
    const sm = new StateManager();
    await sm.forceLoad(); // ensureReady + disk reload — recovery runs inside loadMemoryFile on this path
    expectPathsPinned('B1', sm, null, filePath); // path-drift guard (20.09 PM)

    // 1) RAM holds EXACTLY the state-shaped records from the mirror (context records are CSM's, not SM's):
    expect(sm.get<{ fact?: string }>('memory_B_pre')?.fact).toBe('Pre-corruption fact.');
    const keys = await sm.getAllKeys();
    expect(keys).toEqual(['memory_B_pre']);

    // 2) The corrupt bytes were QUARANTINED, not deleted (F3 contract). Quarantine name is
    // `<primary>.corrupt-<Date.now()>` (stateManager.ts loadMemoryFile) — i.e. it ENDS with the ms
    // timestamp suffix, so match by PREFIX `.msgpack.corrupt-`, never by endsWith (the old predicate
    // could not match a real quarantine name and masked B1/B2 as "0 quarantines for a corrupt primary").
    const quarantined = fs.readdirSync(path.dirname(filePath)).filter(n => n.includes('.msgpack.corrupt-'));
    expect(quarantined).toHaveLength(1);
    expect(fs.readFileSync(path.join(path.dirname(filePath), quarantined[0]), 'utf-8')).toContain('torn-write-garbage');

    // 3) The slot was RESTORED with valid msgpack carrying the full last-known-good content (both record classes):
    const restored = rawRecords(filePath);
    expect(restored).toHaveLength(2);
    expect(restored.find(r => r.key === 'memory_B_pre')).toBeDefined();
    expect(restored.filter(contextShaped)).toHaveLength(1);

    // 4) The mirror itself is untouched (still available for manual inspection):
    expect(fs.existsSync(`${filePath}.backup.json`)).toBe(true);
  });

  test('corrupt primary + NO mirror → plain quarantine, EMPTY store, no throw — and a fresh instance does NOT resurrect data', async () => {
    corruptPrimary();

    setWorkingDir(wdDir);
    const sm = new StateManager();
    await expect(sm.forceLoad()).resolves.toBeUndefined(); // recovery path must never surface an exception
    expectPathsPinned('B2', sm, null, filePath); // path-drift guard (20.09 PM)

    expect(await sm.getAllKeys()).toEqual([]); // empty, fresh-install behavior
    expect(sm.get('memory_B_pre')).toBeUndefined();

    // The corrupt file is preserved on disk as .corrupt-* — no delete, nothing restored:
    const files = fs.readdirSync(path.dirname(filePath));
    // Prefix match — see B1 note: the quarantine name ends with the `-<ts>` suffix, never a bare hyphen.
    expect(files.filter(n => n.includes('.msgpack.corrupt-'))).toHaveLength(1);
    expect(fs.existsSync(filePath)).toBe(false); // slot freed by quarantine rename
    expect(sm.getMemoryFilePath().projectName).toBe('ai_toolbox'); // naming contract pinned (header)

    // A SECOND fresh instance over the same dir sees nothing — quarantined data is never re-read:
    const sm2 = new StateManager();
    await sm2.forceLoad();
    expect(await sm2.getAllKeys()).toEqual([]);
  });

  test('CSM.save() against a RESTORED slot works normally (recovery leaves the file in a writable state)', async () => {
    fs.writeFileSync(`${filePath}.backup.json`, JSON.stringify(rawRecords(filePath)), 'utf-8');
    corruptPrimary();

    setWorkingDir(wdDir);
    const sm = new StateManager();
    await sm.forceLoad(); // recovery: slot restored from mirror
    expect(sm.get('memory_B_pre')).toBeDefined();

    // The CSM consumer must be able to write into the recovered shared file (no "refusing to save" abort):
    const csm = new ContextStorageManager();
    expectPathsPinned('B3', sm, csm, filePath); // path-drift guard (20.09 PM) — both writers on the recovered slot
    await csm.addEntry(ctxFixture({ title: 'B post-recovery entry' }));

    const records = rawRecords(filePath);
    expect(records).toHaveLength(3); // restored 2 + new context entry — SM's record preserved by CSM save (Suite A rule)
    expect(records.find(r => r.key === 'memory_B_pre')).toBeDefined();
    expect(records.filter(contextShaped)).toHaveLength(2);
  });
});

// ==================== Suite C — inverse direction: SM writes preserve foreign CONTEXT entries (FIX #25) ====================

describe('CSM ↔ StateManager shared file (20.09) — Suite C: StateManager preserves context records on save', () => {
  let tmpRoot: string;
  let wdDir: string;

  beforeEach(() => {
    seq = 0;
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'csmshared-C-'));
  });

  afterEach(() => {
    resetWorkingDir();
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch { /* best-effort */ }
  });

  test('SM set()+forceSave() over a store holding context entries preserves those entries (and writes the mirror)', async () => {
    const ctx = ctxFixture({ title: 'C1 context entry must survive SM save' });
    ({ wdDir } = writeSharedFixture(tmpRoot, [ctx]));

    setWorkingDir(wdDir);
    const sm = new StateManager();
    await sm.forceLoad(); // settle _ready — projectContextDir is only usable afterwards
    sm.set('memory_C_fact', { fact: 'SM side of the shared file.' });
    await sm.forceSave();

    const records = rawRecords(sharedFileFor(wdDir));
    expect(records).toHaveLength(2); // state record + preserved context entry — the 30.08/20.09 wipe class in one assertion
    expect(records.find(r => r.key === 'memory_C_fact')).toMatchObject({ key: 'memory_C_fact', value: { fact: 'SM side of the shared file.' } });
    const preserved = records.find(contextShaped);
    expect(preserved?.id).toBe(ctx.id as string); // same record, not a re-created copy

    // The last-known-good mirror reflects the REAL file content (state + foreign) — Suite B's recovery depends on it:
    const mirror: unknown = JSON.parse(fs.readFileSync(`${sharedFileFor(wdDir)}.backup.json`, 'utf-8'));
    expect(Array.isArray(mirror)).toBe(true);
    expect((mirror as Array<Record<string, unknown>>).filter(contextShaped)).toHaveLength(1);

    // The CSM consumer still sees its entry through the real load path:
    const csm = new ContextStorageManager();
    const loaded = await csm.load();
    expect(loaded.map(e => e.id)).toEqual([ctx.id as string]);
  });

  test('CSM.clearAll() over a SM+CSM mixed store removes only the context layer (both protection rules compose)', async () => {
    ({ wdDir } = writeSharedFixture(tmpRoot, [
      ctxFixture({ title: 'C2 entry to be cleared' }),
      stateFixture('memory_C_keep', { fact: 'SM record across clearAll.' }),
    ]));

    setWorkingDir(wdDir);
    const sm = new StateManager();
    await sm.forceLoad(); // RAM now holds the state record (and, by design, nothing else)
    expect(await sm.getAllKeys()).toEqual(['memory_C_keep']);

    const csm = new ContextStorageManager();
    await csm.clearAll();

    const records = rawRecords(sharedFileFor(wdDir));
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ key: 'memory_C_keep' }); // CSM's clearAll must not reach into SM's layer

    // And the SM instance reads its own record straight back after the CSM write-back:
    await sm.forceLoad();
    expect(sm.get<{ fact?: string }>('memory_C_keep')?.fact).toBe('SM record across clearAll.');
  });
});


// ==================== Suite D — dual-writer interleave: no record loss (SPEC-C hazard class) ====================

describe('CSM ↔ StateManager shared file (20.09) — Suite D: interleaved saves from both writer types lose nothing', () => {
  let tmpRoot: string;
  let wdDir: string;

  beforeEach(() => {
    seq = 0;
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'csmshared-D-'));
  });

  afterEach(() => {
    resetWorkingDir();
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch { /* best-effort */ }
  });

  test('Promise.all of one CSM addEntry + SM set/forceSave interleaved → every record from both layers survives', async () => {
    // This pins the SPEC-C hazard class (shared fixed-name temp, cross-writer unlink, drop-on-write-back) in a
    // single process: each save performs read→decode→merge→writeTemp(UNIQUE name)→rename with awaits between steps,
    // so the operations genuinely interleave at file-I/O boundaries inside Promise.all. The final file must contain
    // the union — any writer that dropped or clobbered the other LAYER's records fails this assertion.
    // NOTE: deliberately ONE addEntry per layer — concurrent same-layer addEntry() calls race on CSM's own
    // read-modify-write (last rename wins; documented limitation, out of scope here: production serializes tool calls).
    ({ wdDir } = writeSharedFixture(tmpRoot, [stateFixture('memory_D_seed', { fact: 'seed state record' })]));

    setWorkingDir(wdDir);
    const csm = new ContextStorageManager();
    const sm = new StateManager();
    await sm.forceLoad(); // settle _ready before any SM save path runs
    expectPathsPinned('D', sm, csm, sharedFileFor(wdDir)); // path-drift guard (20.09 PM) — BOTH writers must target the fixture

    const w1 = csm.addEntry(ctxFixture({ title: 'D entry 1', content: 'interleaved CSM write' }));
    const w2 = (async () => {
      sm.set('memory_D_new', { fact: 'new SM record written mid-flight' });
      return sm.forceSave();
    })();

    await Promise.all([w1, w2]);

    const records = rawRecords(sharedFileFor(wdDir));
    // Both layers present in the final file — the union contract:
    expect(records.filter(contextShaped)).toHaveLength(1);
    expect((records.find(contextShaped)?.title as string)).toBe('D entry 1');
    expect(records.find(r => r.key === 'memory_D_seed')?.value).toEqual({ fact: 'seed state record' });
    expect(records.find(r => r.key === 'memory_D_new')?.value).toEqual({ fact: 'new SM record written mid-flight' });

    // Each consumer's own view is intact too (re-read from disk — no stale in-memory masks):
    const csmView = await csm.load();
    expect(csmView.map(e => e.title)).toEqual(['D entry 1']);

    await sm.forceLoad(); // fresh read of the shared file through SM's real load path
    expect(sm.get<{ fact?: string }>('memory_D_seed')?.fact).toBe('seed state record');
    expect(sm.get<{ fact?: string }>('memory_D_new')?.fact).toBe('new SM record written mid-flight');

    // No orphaned temp files left behind (unique per-write names must all have been renamed away):
    const leftovers = fs.readdirSync(path.dirname(sharedFileFor(wdDir))).filter(n => n.includes('.tmp-'));
    expect(leftovers).toHaveLength(0);
  });
});
