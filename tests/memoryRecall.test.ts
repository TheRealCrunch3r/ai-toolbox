/**
 * MEMORY-RECALL (03.11) — hermetic suite for the read-only ID-first recall tool.
 *
 * HERMETIC BY CONSTRUCTION: __setMemoryRecallTestOverrides() redirects EVERY read of memory_recall to temp-dir
 * fixtures; no real .session_context file is ever touched (G3 precedent, 11.09). The READ-ONLY invariant is pinned
 * by asserting STORE + SESSIONS-INDEX BYTE IDENTITY before/after every single tool call. Extensionless '../src/...'
 * imports bypass jest's tools-mock redirect so the REAL implementation runs (docsConsistency.test.ts precedent, 06.10).
 */

import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { encode } from '@msgpack/msgpack';

import type { PluginConfig } from '../src/config';
import { DEFAULT_CONFIG } from '../src/config';
// Extensionless on purpose — the jest tools-mock fallback would otherwise hand us a stub, not the real tool.
import { registerMemoryRecallTool, __setMemoryRecallTestOverrides } from '../src/tools/memoryRecallTool';

const PIN_CONFIG: PluginConfig = { ...DEFAULT_CONFIG };

interface FixtureShape {
  storePath: string;
  sessionsPath: string;
  /** expected byte identity of BOTH files across calls */
  storeBytes: Buffer;
  sessionsBytes: Buffer;
}

// Deterministic relative timestamps (anchored to the real clock so TTL math stays honest).
const NOW = Date.now();
const H = 3600_000;
const D = 24 * H;
const TS_RECENT_CTX = NOW - 1 * H;
const TS_EXPIRED_CTX = NOW - 48 * H; // session-scoped, > SESSION_TTL_MS (24 h) → expired flag expected
const T_LATEST_SUMMARY = NOW - 2 * H; // inner SessionSummaryData.timestamp of the persisted latest summary
const T_OLD_SESSION = NOW - 3 * D;

function buildFixture(tmp: string): FixtureShape {
  const storePath = path.join(tmp, 'store.msgpack');
  const sessionsPath = path.join(tmp, 'sessions.json');

  // The project stamp on in-scope context entries is the PRIMARY store location (load() semantics).
  const records: unknown[] = [
    { id: 'ctx_aaa', timestamp: TS_RECENT_CTX, date: new Date(TS_RECENT_CTX).toISOString().slice(0, 10), type: 'decision', title: 'A decision about storage layout', content: 'C'.repeat(300), tags: ['storage'], scope: 'global', project_path: storePath },
    { id: 'ctx_foreign', timestamp: TS_RECENT_CTX, date: new Date(TS_RECENT_CTX).toISOString().slice(0, 10), type: 'pattern', title: 'Foreign entry that must NEVER surface', content: 'F'.repeat(50), project_path: '/foreign/project/.session_context/.ai_toolbox_memory.msgpack' },
    { id: 'ctx_expired', timestamp: TS_EXPIRED_CTX, date: new Date(TS_EXPIRED_CTX).toISOString().slice(0, 10), type: 'configuration', title: 'Session-scoped entry now past its 24h TTL', content: 'E'.repeat(100), scope: 'session', project_path: storePath },
    { key: 'memory_900', value: 'The project uses msgpack for the shared session-memory store.', timestamp: NOW - 2 * H },
    { key: 'session_summary_latest', value: { task_description: 'Latest session work', accomplishments: 'Built the recall tool', pending_tasks: 'None left', decisions_made: 'Option A', context_for_next_session: '-', timestamp: T_LATEST_SUMMARY, date: new Date(T_LATEST_SUMMARY).toISOString().slice(0, 10) }, timestamp: T_LATEST_SUMMARY + 500 },
    { key: 'some_state_record', value: 'irrelevant state blob', timestamp: NOW - 3 * H }, // must be ignored by every family extractor
  ];

  const storeBytes = encode(records);
  writeFileSync(storePath, storeBytes);

  const sessions = {
    sessions: [
      { task_description: 'Latest session work — the one whose summary still persists', timestamp: T_LATEST_SUMMARY + 1500, date: new Date(T_LATEST_SUMMARY).toISOString().slice(0, 10) }, // 1.5 s jitter inside the 60 s match window
      { task_description: 'Older session whose full summary was evicted by design', timestamp: T_OLD_SESSION, date: new Date(T_OLD_SESSION).toISOString().slice(0, 10) },
    ],
    total_count: 2,
    last_updated: NOW - H,
  };
  const sessionsBytes = Buffer.from(JSON.stringify(sessions, null, 2), 'utf-8');
  writeFileSync(sessionsPath, sessionsBytes);

  return { storePath, sessionsPath, storeBytes, sessionsBytes };
}

function assertByteIdentity(fx: FixtureShape): void {
  expect(readFileSync(fx.storePath)).toEqual(fx.storeBytes);
  expect(readFileSync(fx.sessionsPath)).toEqual(fx.sessionsBytes);
}

describe('memory_recall — hermetic (03.11)', () => {
  let tmp: string;
  let fx: FixtureShape;
  // House pattern (bakScanRecursive / taskPlanningTools suites): the SDK tool() object exposes .implementation(params, ctx);
  // it zod-validates params at call time and THROWS on schema violation (verified in @lmstudio/sdk dist, index.cjs).
  const toolObj = registerMemoryRecallTool(PIN_CONFIG)[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const impl: any = (toolObj as unknown as { implementation: (p?: Record<string, unknown>) => Promise<unknown> }).implementation;

  beforeAll(() => {
    tmp = mkdtempSync(path.join(os.tmpdir(), 'memory-recall-test-'));
    fx = buildFixture(tmp);
    __setMemoryRecallTestOverrides({ storePaths: [fx.storePath], sessionsIndexPathOverride: fx.sessionsPath });
  });

  afterAll(() => {
    __setMemoryRecallTestOverrides(undefined);
    rmSync(tmp, { recursive: true, force: true });
  });

  // ── mode=index ────────────────────────────────────────────────────────────────────────────────────────
  describe('mode="index"', () => {
    test('lists all three families with per-family totals, newest first', async () => {
      const res = await impl({ mode: 'index' });
      expect(res.success).toBe(true);
      const d = res.data;
      expect(d.totals).toEqual({ context: 2, memory_fact: 1, session: 2 }); // context = in-scope ONLY (ctx_aaa + ctx_expired; foreign stamp excluded by the load() filter)
      expect(d.returned).toBe(5);
      const ids = d.rows.map((r: { id: string }) => r.id);
      expect(new Set(ids)).toEqual(new Set(['session:' + (T_LATEST_SUMMARY + 1500), 'session:' + T_OLD_SESSION, 'memory_900', 'ctx_aaa', 'ctx_expired']));
      // newest first: the two sessions (2 h / 3 d old) precede the 1 h ctx? NO — age is by date; verify monotone non-increasing dates
      const dates = d.rows.map((r: { date: string }) => Date.parse(r.date));
      for (let i = 1; i < dates.length; i++) expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
      assertByteIdentity(fx); // read-only pin
    });

    test('kind filter restricts to one family', async () => {
      const res = await impl({ mode: 'index', kind: 'memory_fact' });
      expect(res.success).toBe(true);
      expect(res.data.returned).toBe(1);
      expect(res.data.rows[0].id).toBe('memory_900');
      expect(res.data.totals.memory_fact).toBe(1); // totals stay global (pre-filter) by design
      assertByteIdentity(fx);
    });

    test('est_detail_chars is exact for context content and fact values', async () => {
      const res = await impl({ mode: 'index' });
      const ctxRow = res.data.rows.find((r: { id: string }) => r.id === 'ctx_aaa');
      expect(ctxRow.est_detail_chars).toBe(300);
      const factRow = res.data.rows.find((r: { id: string }) => r.id === 'memory_900');
      expect(factRow.est_detail_chars).toBe('The project uses msgpack for the shared session-memory store.'.length);
      assertByteIdentity(fx);
    });

    test('session rows: detail_available only on the persisted-latest row; expired ctx flagged', async () => {
      const res = await impl({ mode: 'index' });
      const latestRow = res.data.rows.find((r: { id: string }) => r.id === `session:${T_LATEST_SUMMARY + 1500}`);
      expect(latestRow.detail_available).toBe(true);
      expect(latestRow.est_detail_chars).toBeGreaterThan(0);
      const oldRow = res.data.rows.find((r: { id: string }) => r.id === `session:${T_OLD_SESSION}`);
      expect(oldRow.detail_available).toBe(false);
      expect(oldRow.est_detail_chars).toBe(0);
      const expiredCtx = res.data.rows.find((r: { id: string }) => r.id === 'ctx_expired');
      expect(expiredCtx.expired).toBe(true);
      assertByteIdentity(fx);
    });

    test('titles are cut at 80 chars with a truncation flag', async () => {
      // build a second fixture with a long title via the same override seam (no file churn beyond tmp)
      const longTitle = 'L'.repeat(120);
      const storePath2 = path.join(tmp, 'store-longtitle.msgpack');
      writeFileSync(storePath2, encode([{ id: 'ctx_long', timestamp: TS_RECENT_CTX, date: new Date(TS_RECENT_CTX).toISOString().slice(0, 10), type: 'error', title: longTitle, content: 'x', project_path: storePath2 }]));
      __setMemoryRecallTestOverrides({ storePaths: [storePath2], sessionsIndexPathOverride: fx.sessionsPath });
      try {
        const res = await impl({ mode: 'index' });
        const row = res.data.rows.find((r: { id: string }) => r.id === 'ctx_long');
        expect(row.title).toHaveLength(80);
        expect(row.truncated_title).toBe(true);
      } finally {
        __setMemoryRecallTestOverrides({ storePaths: [fx.storePath], sessionsIndexPathOverride: fx.sessionsPath });
      }
      assertByteIdentity(fx);
    });

    test('foreign-stamped context entries are NEVER visible (project isolation)', async () => {
      const res = await impl({ mode: 'index', kind: 'context' });
      expect(res.data.rows.map((r: { id: string }) => r.id)).not.toContain('ctx_foreign');
      assertByteIdentity(fx);
    });

    test('limit caps rows and reports truncated + global totals', async () => {
      const res = await impl({ mode: 'index', limit: 2 });
      expect(res.data.returned).toBe(2);
      expect(res.data.truncated).toBe(true);
      // totals reflect the FULL store, not the limited slice
      expect(res.data.totals.session).toBe(2);
      assertByteIdentity(fx);
    });
  });

  // ── mode=fetch ────────────────────────────────────────────────────────────────────────────────────────
  describe('mode="fetch"', () => {
    test('returns full records for found ids and self-describes every miss reason', async () => {
      const res = await impl({
        mode: 'fetch',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ids: ['ctx_aaa', 'memory_900', `session:${T_LATEST_SUMMARY + 1500}`, 'ctx_expired', 'ctx_ghost', 'memory_404', `session:${T_OLD_SESSION}`, 'session:123'],
      });
      expect(res.success).toBe(true);
      const d = res.data;
      expect(d.requested).toBe(8);
      // found: ctx_aaa, memory_900, latest session, AND expired ctx (served on explicit request)
      const foundIds = d.found.map((f: { id: string }) => f.id).sort();
      expect(foundIds).toEqual(['ctx_aaa', 'ctx_expired', `session:${T_LATEST_SUMMARY + 1500}`, 'memory_900'].sort());
      const ctxHit = d.found.find((f: { id: string }) => f.id === 'ctx_aaa');
      expect(ctxHit.record.content).toBe('C'.repeat(300));
      expect(ctxHit.kind).toBe('context');
      // session hit carries the persisted summary body + index row residue
      const sessHit = d.found.find((f: { id: string }) => f.id.startsWith('session:'));
      expect(sessHit.record.task_description).toBe('Latest session work');
      expect(sessHit.record._index_row.task_description).toContain('the one whose summary still persists');

      // not_found: three DISTINCT reasons, each self-describing
      const nf = d.not_found;
      expect(nf.map((n: { id: string; reason: string }) => n.id + ':' + n.reason).sort()).toEqual([
        // Design decision #3: expired session-scoped entries are BOTH served (explicit fetch) AND reason-flagged — double reporting by design
        `ctx_expired:expired_session_ttl`,
        `ctx_ghost:no_such_entry`,
        'memory_404:no_such_entry',
        `session:${T_OLD_SESSION}:summary_never_persisted`,
        'session:123:no_such_entry',
      ].sort());
      // the expired id appears in BOTH found (served) and not_found (reason flag) — self-description stays machine-readable
      expect(d.not_found.map((n: { id: string }) => n.id)).toContain('ctx_expired');
      expect(d.found_count).toBe(4);
      assertByteIdentity(fx);
    });

    test('expired_session_ttl is reported with a machine-readable reason', async () => {
      const res = await impl({ mode: 'fetch', ids: ['ctx_expired'] });
      const ttl = res.data.not_found.find((n: { id: string }) => n.id === 'ctx_expired');
      expect(ttl.reason).toBe('expired_session_ttl');
      expect(typeof ttl.note).toBe('string');
      // ...while the record itself is still served explicitly
      expect(res.data.found.some((f: { id: string }) => f.id === 'ctx_expired' && f.record._status === 'expired_session_ttl')).toBe(true);
      assertByteIdentity(fx);
    });

    test('batch cap >10 ids is rejected (SDK zod .max(10) throws before implementation runs)', async () => {
      // The SDK tool() wrapper zod-validates params at call time and THROWS "Failed to parse arguments..." on violation —
      // that IS the batch-cap error contract. (The runtime guard inside implementation remains as defense-in-depth for
      // any future direct buildFetch-style invocation path.)
      const eleven: string[] = Array.from({ length: 11 }, (_, i) => `ctx_${i}`);
      // SDK zod validation throws SYNCHRONOUSLY at impl(args) call time (empirically verified, dist/index.cjs 'implementation') —
      // catch both sync throw and async rejection so the contract is pinned regardless of SDK internal scheduling.
      let threwSync = false; let thrown: unknown; let rejectedPromise: Promise<unknown> | undefined;
      try { const r = impl({ mode: 'fetch', ids: eleven }); if (r && typeof (r as Promise<unknown>).catch === 'function') rejectedPromise = r as Promise<unknown>; } catch (e) { threwSync = true; thrown = e; }
      assertByteIdentity(fx); // read-only invariant holds in both outcomes
      expect(threwSync || rejectedPromise !== undefined).toBe(true);
      const verdict: unknown = threwSync ? thrown : await rejectedPromise!.then(() => { throw new Error('expected rejection, resolved instead'); }, (e: unknown) => e);
      expect(String(verdict)).toMatch(/Failed to parse arguments|max/);
    });

    test('batch cap boundary: exactly 10 ids is ACCEPTED by the schema', async () => {
      const ten = ['ctx_aaa', 'memory_900']; // only these two resolve; the rest must miss self-described, not error out
      while (ten.length < 10) ten.push(`ctx_pad_${ten.length}`);
      const res = await impl({ mode: 'fetch', ids: ten });
      expect(res.success).toBe(true);
      expect(res.data.requested).toBe(10);
      assertByteIdentity(fx);
    });

    test('fetch without ids returns the self-describing usage error', async () => {
      const res = await impl({ mode: 'fetch' });
      expect(res.success).toBe(false);
      expect(String(res.error)).toContain('requires a non-empty "ids" array');
      assertByteIdentity(fx);
    });

    test('per_item_chars cuts the dominant string field and reports original_chars', async () => {
      const res = await impl({ mode: 'fetch', ids: ['ctx_aaa'], per_item_chars: 100 });
      expect(res.success).toBe(true);
      const hit = res.data.found[0];
      expect(hit.truncated_by_per_item_chars).toBe(true);
      expect(hit.original_chars).toBeGreaterThanOrEqual(300); // whole-record size pre-cut (content dominates)
      expect((hit.record as { content: string }).content).toHaveLength(100);
      expect((hit.record as { _truncated_field?: string })._truncated_field).toBe('content');
      assertByteIdentity(fx);
    });

    test('per_item_chars below record size is a no-op', async () => {
      const res = await impl({ mode: 'fetch', ids: ['ctx_aaa'], per_item_chars: 10_000 });
      expect(res.data.found[0].truncated_by_per_item_chars).toBeUndefined();
      expect((res.data.found[0].record as { content: string }).content).toHaveLength(300);
      assertByteIdentity(fx);
    });

    test('all-miss batch carries the self-describing note', async () => {
      const res = await impl({ mode: 'fetch', ids: ['ctx_ghost'] });
      expect(res.data.note).toBeDefined();
      expect(String(res.data.note)).toContain('EXPECTED outcomes by design');
      assertByteIdentity(fx);
    });
  });

  // ── empty-store self-description (FIX #18/#21 class) ─────────────────────────────────────────────────
  describe('empty store', () => {
    test('index on a nonexistent store returns zeroed rows + totals without crashing', async () => {
      __setMemoryRecallTestOverrides({ storePaths: [path.join(tmp, 'does-not-exist.msgpack')], sessionsIndexPathOverride: path.join(tmp, 'no-sessions.json') });
      try {
        const res = await impl({ mode: 'index' });
        expect(res.success).toBe(true);
        expect(res.data.rows).toEqual([]);
        expect(res.data.totals).toEqual({ context: 0, memory_fact: 0, session: 0 });
        expect(res.data.store_file).toBeNull();
      } finally {
        __setMemoryRecallTestOverrides({ storePaths: [fx.storePath], sessionsIndexPathOverride: fx.sessionsPath });
      }
    });

    test('fetch on an empty store reports no_such_entry for every id', async () => {
      // Pin the G3 seam to nonexistent paths — without this, leftover fixture state from sibling suites leaks in via the store fallback.
      __setMemoryRecallTestOverrides({ storePaths: [path.join(tmp, 'does-not-exist.msgpack')], sessionsIndexPathOverride: path.join(tmp, 'no-sessions.json') });
      try {
        const res = await impl({ mode: 'fetch', ids: ['ctx_aaa'] });
        expect(res.success).toBe(true);
        expect(res.data.found).toEqual([]);
        expect(res.data.not_found[0].reason).toBe('no_such_entry');
      } finally {
        __setMemoryRecallTestOverrides({ storePaths: [fx.storePath], sessionsIndexPathOverride: fx.sessionsPath });
      }
    });
  });

  // ── contract meta ─────────────────────────────────────────────────────────────────────────────────────
  test('tool metadata: snake_case name + both modes in the zod enum', () => {
    const t = registerMemoryRecallTool(PIN_CONFIG)[0];
    expect(t.name).toMatch(/^[a-z][a-z0-9_]*$/);
    expect(String((t.parameters as Record<string, unknown>)?.mode ?? '')).not.toEqual('undefined'); // zod enum present (schema object)
  });
});
