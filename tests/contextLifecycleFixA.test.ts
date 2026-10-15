/**
 * FIX-A (14.10) — context-entry lifecycle regression suite.
 *
 * Defect class pinned by this file (owner-observed 14.10: stale entries resurfacing on every restore_session_context):
 * pre-fix, auto-checkpoints were written with the implicit default scope 'global' + no TTL (autoTracker.ts), and the
 * only live TTL enforcement was getRecentEntries()' read-side inline prune — pruneExpiredSessionEntries() had ZERO
 * callers. Result: 401 stored records, all global-scope, no ttl_ms; 92% older than a week, every one of them rendered
 * on each restore. This suite pins the two write-funnel behaviors added to ContextStorageManager.addEntry():
 *   (1) expired session-scoped entries are reaped inline on the next addEntry (same _isExpired predicate), and
 *   (2) substantive entries beyond MAX_SUBSTANTIVE_CONTEXT_ENTRIES (=100) are pruned oldest-first by timestamp —
 *       checkpoint-tagged + session-scoped records never count against the cap, and type 'decision' is exempt so an
 *       owner decision can never be silently dropped.
 *
 * Conventions: cloned from tests/csmNonDestructiveSave.test.ts — real classes, tmp fixture under a dir named EXACTLY
 * "ai_toolbox" (shared-file identity), setWorkingDir BEFORE construction, resetWorkingDir in afterEach, path-drift
 * guard after manager construction. Fixture stamps use the canonical project_path shape = the memory FILE path.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { encode, decode } from '@msgpack/msgpack';
import { ContextStorageManager } from '../src/tools/contextManagementTools';
import { setWorkingDir, resetWorkingDir } from '../src/workingDir';

const DAY_MS = 24 * 60 * 60 * 1000;
let seq = 0;

// Structural twin of ContextEntry (NOT exported by contextManagementTools.ts — house minimal-scope rule: no new
// production exports just for a test). Assignability is structural, so this satisfies addEntry()'s parameter type.
type CtxFixtureType = 'decision' | 'pattern' | 'configuration' | 'file_change' | 'error' | 'summary';
interface CtxFixture {
  id: string;
  timestamp: number;
  date: string;
  type: CtxFixtureType;
  title: string;
  content: string;
  tags?: string[];
  scope?: 'global' | 'project' | 'session';
  ttl_ms?: number;
  project_path?: string;
  frequency?: number;
}

function entryFixture(overrides: { id?: string; timestamp?: number; type?: CtxFixtureType; title?: string; content?: string; tags?: string[]; scope?: 'global' | 'project' | 'session'; ttl_ms?: number; project_path?: string } = {}): CtxFixture {
  const ts = overrides.timestamp ?? Date.now();
  return {
    id: overrides.id ?? `ctx_fixa_${++seq}`,
    timestamp: ts,
    date: new Date(ts).toLocaleString(),
    type: overrides.type ?? 'pattern',
    title: overrides.title ?? 'FIX-A Fixture Pattern',
    content: overrides.content ?? `Fixture pattern body ${seq}.`,
    ...(overrides.tags !== undefined ? { tags: overrides.tags } : {}), // emit ONLY when set — msgpack nil/undefined drift (E2 lesson)
    scope: overrides.scope ?? 'global',
    ...(overrides.ttl_ms !== undefined ? { ttl_ms: overrides.ttl_ms } : {}),
    frequency: 1,
    project_path: overrides.project_path, // canonical stamp shape = the memory FILE path (see mergeEntriesWithTiers)
  };
}

function contextShaped(r: unknown): r is Record<string, unknown> {
  return !!r && typeof r === 'object' && !Array.isArray(r)
    && typeof (r as Record<string, unknown>).id === 'string'
    && typeof (r as Record<string, unknown>).type === 'string'
    && typeof (r as Record<string, unknown>).content === 'string';
}

describe('FIX-A (14.10) — ContextStorageManager.addEntry lifecycle', () => {
  let tmpRoot: string;
  let wdDir: string;
  let filePath: string;
  let csm: ContextStorageManager;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fixa-'));
    // basename MUST stay "ai_toolbox" — shared-file identity resolution (resolveProjectName) keys on it.
    wdDir = path.join(tmpRoot, 'ai_toolbox');
    fs.mkdirSync(path.join(wdDir, '.session_context'), { recursive: true });
    filePath = path.join(wdDir, '.session_context', '.ai_toolbox_memory.msgpack');
    setWorkingDir(wdDir); // BEFORE construction — ctor captures getWorkingDir()
    csm = new ContextStorageManager();
    // PATH-DRIFT GUARD (house convention): pin the actual resolved storage path so any drift fails loudly instead of writing into a live repo store.
    const wdPath = (csm as unknown as { workingDirPath: string }).workingDirPath;
    expect(path.resolve(wdPath)).toBe(filePath);
  });

  afterEach(() => {
    resetWorkingDir();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  // object[] on purpose — fixtures are typed CtxFixture (no index signature), and encode() takes any plain object.
  function seed(records: object[]): void {
    fs.writeFileSync(filePath, encode(records));
  }

  function liveContextIds(): string[] {
    const decoded = decode(fs.readFileSync(filePath));
    if (!Array.isArray(decoded)) throw new Error('store is not a record array');
    return (decoded as Array<unknown>).filter(contextShaped).map(r => r.id as string);
  }

  it('(1) reaps expired session-scoped entries inline on the next addEntry', async () => {
    const stamp = filePath; // canonical project_path stamp for this store
    const now = Date.now();
    const expiredId = 'ctx_fixa_expired_session';
    const freshSessionId = 'ctx_fixa_fresh_session';
    const globalId = 'ctx_fixa_global_decision';
    seed([
      entryFixture({ id: expiredId, timestamp: now - 2 * 60 * 60 * 1000, scope: 'session', ttl_ms: 60 * 1000, project_path: stamp }), // age 2h > ttl 60s
      entryFixture({ id: freshSessionId, timestamp: now, scope: 'session', ttl_ms: DAY_MS, project_path: stamp }),
      entryFixture({ id: globalId, type: 'decision', scope: 'global', project_path: stamp }),
    ]);

    await csm.addEntry(entryFixture({ id: 'ctx_fixa_new_entry', timestamp: now, scope: 'global', project_path: stamp }));

    const ids = liveContextIds();
    expect(ids).toContain(freshSessionId);                 // fresh session entry survives the reap (age < ttl)
    expect(ids).not.toContain(expiredId);                  // expired session entry reaped inline — pre-fix it would stay until some getRecentEntries read
    expect(ids).toContain(globalId);                       // non-session records untouched by the TTL pass
    expect(ids).toContain('ctx_fixa_new_entry');
  });

  it('(2) retention cap: oldest non-decision substantive entries pruned beyond MAX (100); decisions exempt even when oldest', async () => {
    const stamp = filePath;
    const now = Date.now();
    // Seed: 100 global patterns with ascending timestamps + 4 DECISIONS older than every pattern.
    const patternIds: string[] = [];
    for (let i = 0; i < 100; i++) {
      const id = `ctx_fixa_pattern_${i}`;
      patternIds.push(id);
    }
    const decisionIds = ['ctx_fixa_old_dec_1', 'ctx_fixa_old_dec_2', 'ctx_fixa_old_dec_3', 'ctx_fixa_old_dec_4'];
    const records: object[] = [];
    for (const d of decisionIds) {
      records.push(entryFixture({ id: d, type: 'decision', scope: 'global', timestamp: now - 6 * DAY_MS, project_path: stamp }));
    }
    patternIds.forEach((id, i) => {
      records.push(entryFixture({ id, type: 'pattern', scope: 'global', timestamp: now - 3 * DAY_MS + i * 1000, project_path: stamp }));
    });
    seed(records);

    // New entry is itself substantive (untyped-tag summary) → live substantive = 105 > 100 → excess 5.
    await csm.addEntry(entryFixture({ id: 'ctx_fixa_new_summary', type: 'summary', scope: 'global', timestamp: now, project_path: stamp }));

    const ids = liveContextIds();
    // All four decisions survive — they hold the OLDEST timestamps in the store (exemption is what saves them).
    for (const d of decisionIds) expect(ids).toContain(d);
    // Exactly 5 oldest patterns dropped; newest pattern + new entry present.
    const expectedDropped = new Set(patternIds.slice(0, 5));
    for (const id of patternIds) {
      if (expectedDropped.has(id)) expect(ids).not.toContain(id);
      else expect(ids).toContain(id);
    }
    expect(ids).toContain('ctx_fixa_new_summary');
    // Final substantive count is exactly at cap: 95 patterns + 4 decisions + 1 new summary.
    expect(ids.length).toBe(100);
  });

  it('(3) checkpoint-tagged entries never count against the substantive cap AND are TTL-reaped like any session entry', async () => {
    const stamp = filePath;
    const now = Date.now();
    // Seed: exactly 100 patterns (at cap, nothing pruned by itself once the new summary lands... see expectation below)
    // + 3 EXPIRED auto-checkpoints (session-scoped with short TTL — the pre-fix immortal class).
    const patternIds: string[] = [];
    for (let i = 0; i < 100; i++) patternIds.push(`ctx_fixa_cap_pattern_${i}`);
    const checkpointIds = ['ctx_fixa_cp_1', 'ctx_fixa_cp_2', 'ctx_fixa_cp_3'];
    const records: object[] = [];
    for (const c of checkpointIds) {
      records.push(entryFixture({
        id: c, type: 'summary', scope: 'session', ttl_ms: 60 * 1000, timestamp: now - 2 * 60 * 60 * 1000,
        tags: ['auto_checkpoint', 'token_threshold'], project_path: stamp,
      }));
    }
    patternIds.forEach((id, i) => {
      records.push(entryFixture({ id, type: 'pattern', scope: 'global', timestamp: now - 3 * DAY_MS + i * 1000, project_path: stamp }));
    });
    seed(records);

    await csm.addEntry(entryFixture({ id: 'ctx_fixa_new_summary2', type: 'summary', scope: 'global', timestamp: now, project_path: stamp }));

    const ids = liveContextIds();
    // Checkpoints gone via the TTL pass (they are session-scoped) — not via the cap, and they never counted against it.
    for (const c of checkpointIds) expect(ids).not.toContain(c);
    // Substantive after merge = 100 patterns + 1 new summary = 101 > 100 → exactly ONE oldest pattern pruned.
    const expectedDropped = new Set([patternIds[0]]);
    for (const id of patternIds) {
      if (expectedDropped.has(id)) expect(ids).not.toContain(id);
      else expect(ids).toContain(id);
    }
    expect(ids).toContain('ctx_fixa_new_summary2');
    // 99 patterns + 1 new summary = 100 records total.
    expect(ids.length).toBe(100);
  });

  it('(4) fresh session-scoped entries pass through addEntry untouched (TTL not yet elapsed)', async () => {
    const stamp = filePath;
    const now = Date.now();
    const freshId = 'ctx_fixa_still_fresh';
    seed([entryFixture({ id: freshId, timestamp: now - 60 * 1000, scope: 'session', ttl_ms: DAY_MS, project_path: stamp })]);

    await csm.addEntry(entryFixture({ id: 'ctx_fixa_other_new', timestamp: now, scope: 'global', project_path: stamp }));

    const ids = liveContextIds();
    expect(ids).toContain(freshId); // age 60s < ttl 24h — must survive the inline reap
    expect(ids).toContain('ctx_fixa_other_new');
    expect(ids.length).toBe(2);
  });
});
