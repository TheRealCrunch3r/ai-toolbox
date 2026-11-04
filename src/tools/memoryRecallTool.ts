/**
 * MEMORY-RECALL (03.11, owner GO on plan_1793720920523_vzz5ou9vs): read-only, ID-first detail-fetch tool for the
 * session-memory layer - the ai_toolbox answer to the Claude-Mem pattern (compact index, then fetch-by-ID), cutting
 * token spend ~10x versus all-or-nothing get_memory() / restore_session_context() re-reads.
 *
 * DESIGN INVARIANTS (locked 03.11, Option A):
 * - READ-ONLY: reads via DIRECT msgpack decode of the shared store file with load()'s filter predicate INLINED
 *   (see isContextEntryShape/loadContextEntriesRaw) plus SessionIndexManager.load() (which never prunes/saves).
 *   It NEVER calls ContextStorageManager.getRecentEntries() (whose inline TTL prune mutates state) or any
 *   save/add/clear path - no manager instance is even constructed, so the read path cannot drift into a write.
 *   The hermetic test suite pins STORE BYTE-IDENTITY before/after every call.
 * - ADDITIVE: no storage-schema change, no migration; reuses existing ids (context ctx_, memory facts memory_,
 *   and the pseudo-id session:<epoch-ms> form). NOTE: this comment deliberately avoids any adjacent "star-slash"
 *   pair in its prose - an embedded sequence would terminate the block comment early (gate incident 03.11, tsc RED).
 * - PROJECT ISOLATION: context entries via load()'s project_path filter (foreign stamps never visible); the raw
 *   store decode is bounded to the same two locations load() reads (WD file first, plugin-root legacy fallback).
 * - SELF-DESCRIBING (FIX 18/21 class): empty or missing results carry a note; fetch misses are per-id objects
 *   with not_found.reason one of: no_such_entry | expired_session_ttl | summary_never_persisted.
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { decode } from '@msgpack/msgpack';

import type { PluginConfig } from '../config.js';
import { getWorkingDir } from '../workingDir.js';
// NOTE: NO cross-tool imports on purpose (25.09/11.09 jest precedent) — under jest most './tools/*.js' requests resolve to
// tests/__mocks__/ stubs, so the load() semantics of ContextStorageManager and SessionIndexManager are INLINED below as
// pure read-only mirrors instead of imported manager instances. Zero manager construction = zero write-side surface.

/** Structural shape guard — MIRROR of ContextStorageManager.isContextEntry (FIX #15, 20.08): the shared file holds BOTH
 *  context entries ({id,type,title,content,...}) AND StateManager records ({key,value,timestamp}). Inlined here so this
 *  tool needs no manager instance at all — pure raw decode = read-only by construction and fully hermetic-testable via
 *  __setMemoryRecallTestOverrides (the G3 seam). Semantics stay byte-identical to ContextStorageManager.load(). */
function isContextEntryShape(e: unknown): e is { id: string; timestamp: number; date?: string; type: string; title?: string; content?: string; tags?: string[]; scope?: 'global' | 'project' | 'session'; project_path?: string } {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return false;
  const o = e as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.timestamp === 'number' &&
    typeof o.type === 'string' &&
    ['decision', 'pattern', 'configuration', 'file_change', 'error', 'summary'].includes(o.type)
  );
}

/** Context entries from the FIRST readable store, with EXACTLY load()'s filter predicate: stamp-equal to the primary
 *  (working-dir) location OR legacy-unstamped. Foreign-stamped records are never returned (project isolation). */
function loadContextEntriesRaw(records: unknown[], primaryPath: string | undefined): Array<{ id: string; timestamp: number; date?: string; type: string; title?: string; content?: string; tags?: string[]; scope?: 'global' | 'project' | 'session'; project_path?: string }> {
  return records
    .filter(isContextEntryShape)
    .filter(e => e.project_path === primaryPath || !e.project_path);
}

// ── Types ────────────────────────────────────────────────────────────────────────────────────────────────

/** 🔹 G3-style (11.09) hermetic-test override — production code never sets these; tests point the decoders at
 *  temp-dir fixtures so the suite touches no real .session_context file (same precedent as PlanStorageManager). */
interface MemoryRecallTestOverrides {
  storePaths?: string[];        // candidate shared-store file paths, in priority order (mirrors load()'s WD→root)
  sessionsIndexPathOverride?: string;
}

let _testOverrides: MemoryRecallTestOverrides | undefined;

/** TEST-ONLY seam. Production never calls this. */
export function __setMemoryRecallTestOverrides(overrides?: MemoryRecallTestOverrides): void {
  _testOverrides = overrides;
}

type RecalledKind = 'context' | 'memory_fact' | 'session';

interface IndexRowBase {
  id: string;
  kind: RecalledKind;
  type: string;          // context entry type / 'fact' / 'summary'
  title: string;         // ≤80 chars, truncated_title flag set when cut
  date: string;
  age_days: number;      // floor((now - timestamp) / 86400000), min 0
  est_detail_chars: number; // size of the FULL record mode=fetch would return (best-effort, pre any per_item_chars cut)
}

interface ContextIndexRow extends IndexRowBase {
  kind: 'context';
  expired?: boolean;     // session-scoped entry past its TTL — still returned by load() (pruning happens elsewhere), flagged here
}

interface FactIndexRow extends IndexRowBase {
  kind: 'memory_fact';
}

interface SessionIndexRow extends IndexRowBase {
  kind: 'session';
  detail_available: boolean; // true only for the row whose full summary record currently persists (P0-FIX: latest only)
}

type IndexRow = ContextIndexRow | FactIndexRow | SessionIndexRow;

const TITLE_MAX = 80;

function cutTitle(title: string): { title: string; truncated_title?: boolean } {
  if (title.length <= TITLE_MAX) return { title };
  return { title: title.slice(0, TITLE_MAX), truncated_title: true };
}

// ── Raw store access (DIRECT decode — read-only by construction) ────────────────────────────────────────

/** The shared .ai_toolbox_memory.msgpack locations in the SAME priority order ContextStorageManager.load() uses
 *  (working dir first, plugin-root legacy fallback). Test overrides replace this list wholesale. */
function storePathCandidates(): string[] {
  if (_testOverrides?.storePaths) return _testOverrides.storePaths;
  const wd = getWorkingDir();
  return [
    path.join(wd, '.session_context', '.ai_toolbox_memory.msgpack'),
    path.join(path.resolve(__dirname, '..'), '.session_context', '.ai_toolbox_memory.msgpack'),
  ];
}

/** Sessions-index locations in SessionIndexManager.load() order (WD first, plugin-root legacy read-only since FIX #24). */
function sessionsIndexPathCandidates(): string[] {
  if (_testOverrides?.sessionsIndexPathOverride) return [_testOverrides.sessionsIndexPathOverride];
  const wd = getWorkingDir();
  return [
    path.join(wd, '.session_context', 'sessions.json'),
    path.join(path.resolve(__dirname, '..'), '.session_context', 'sessions.json'),
  ];
}

interface SessionRow { task_description: string; timestamp: number; date: string }
interface SessionsIndexData { sessions: SessionRow[]; total_count: number; last_updated: number }

/** READ-ONLY mirror of SessionIndexManager.load() — shape-guarded JSON parse, same WD→legacy-root fallback. Inlined so
 *  this tool needs no manager instance (hermetic under jest's tools-mock redirect; zero write-side surface). */
async function loadSessionsIndexRaw(): Promise<SessionsIndexData | null> {
  for (const candidate of sessionsIndexPathCandidates()) {
    try {
      if (await fs.access(candidate).then(() => true).catch(() => false)) {
        const parsed: unknown = JSON.parse(await fs.readFile(candidate, 'utf-8'));
        if (!parsed || typeof parsed !== 'object') continue;
        const o = parsed as Record<string, unknown>;
        if (Array.isArray(o.sessions) && typeof o.total_count === 'number' && typeof o.last_updated === 'number') {
          return o as unknown as SessionsIndexData;
        }
      }
    } catch { /* malformed/missing — fall through like SessionIndexManager.load() does */ }
  }
  return null;
}

interface StateEntry { key: string; value: unknown; timestamp: number }

async function firstReadableStore(): Promise<{ filePath: string; records: unknown[] } | null> {
  for (const candidate of storePathCandidates()) {
    try {
      if (await fs.access(candidate).then(() => true).catch(() => false)) {
        const buffer = await fs.readFile(candidate);
        const decoded = decode(buffer);
        if (!Array.isArray(decoded)) continue;
        return { filePath: candidate, records: decoded as unknown[] };
      }
    } catch { /* unreadable/corrupt — fall through to next candidate (never mutates) */ }
  }
  return null;
}

/** Memory-fact StateEntry records ({key: 'memory_<ts>', value}) from the raw store. Shape-guarded like FIX #15. */
function extractMemoryFacts(records: unknown[]): { key: string; value: unknown; timestamp: number }[] {
  const facts: StateEntry[] = [];
  for (const r of records) {
    if (!r || typeof r !== 'object' || Array.isArray(r)) continue;
    const o = r as Record<string, unknown>;
    if (typeof o.key === 'string' && o.key.startsWith('memory_') && typeof o.timestamp === 'number') {
      facts.push({ key: o.key, value: o.value, timestamp: o.timestamp });
    }
  }
  return facts.sort((a, b) => b.timestamp - a.timestamp);
}

/** The authoritative latest session summary record (StateEntry key 'session_summary_latest'), if persisted. */
function extractLatestSummary(records: unknown[]): { value: unknown; timestamp: number } | null {
  for (const r of records) {
    if (!r || typeof r !== 'object' || Array.isArray(r)) continue;
    const o = r as Record<string, unknown>;
    if (o.key === 'session_summary_latest' && typeof o.timestamp === 'number') {
      return { value: o.value, timestamp: o.timestamp };
    }
  }
  return null;
}

function summaryTimestampMs(value: unknown): number | undefined {
  // SessionSummaryData carries `timestamp?: number` and/or `date?: string`; legacy values may be JSON strings.
  let v = value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return undefined; } }
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  if (typeof o.timestamp === 'number') return o.timestamp;
  if (typeof o.date === 'string' && !Number.isNaN(Date.parse(o.date))) return Date.parse(o.date);
  return undefined;
}

function detailCharsOf(value: unknown): number {
  if (value == null) return 0;
  try {
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    return s?.length ?? 0;
  } catch { return 0; }
}

// ── Index mode ───────────────────────────────────────────────────────────────────────────────────────────

async function buildIndex(params: { kind?: RecalledKind; nowMs: number }): Promise<{
  rows: IndexRow[]; totals: Record<RecalledKind, number>; store_file: string | null;
}> {
  // READ-ONLY by construction: pure raw decode with load()'s filter predicate inlined — no manager instance, hence no
  // TTL-prune side effects (that lives exclusively in getRecentEntries()), and hermetic via the G3-style override seam.
  const store = await firstReadableStore();
  const contextEntries = loadContextEntriesRaw(store?.records ?? [], storePathCandidates()[0]);
  const indexData = await loadSessionsIndexRaw(); // read-only mirror of SessionIndexManager.load() (never prunes/saves)

  const nowMs = params.nowMs;
  const ageDays = (ts: number): number => Math.max(0, Math.floor((nowMs - ts) / 86400000));
  const wantKind = (k: RecalledKind): boolean => !params.kind || params.kind === k;

  const latestSummary = store ? extractLatestSummary(store.records) : null;
  const latestSummaryTs = latestSummary ? summaryTimestampMs(latestSummary.value) ?? undefined : undefined;
  const latestDetailChars = latestSummary ? detailCharsOf(latestSummary.value) : 0;

  // — context rows (kind='context') —
  const contextRows: ContextIndexRow[] = [];
  if (wantKind('context')) {
    for (const e of contextEntries) {
      const expired = e.scope === 'session' && nowMs - e.timestamp > 24 * 60 * 60 * 1000; // SESSION_TTL_MS parity (L81 in cm)
      const t = cutTitle(e.title || '(untitled)');
      contextRows.push({
        id: e.id,
        kind: 'context',
        type: e.type,
        title: t.title,
        ...(t.truncated_title ? { truncated_title: true } : {}),
        date: e.date ?? new Date(e.timestamp).toISOString().slice(0, 10), // fallback mirrors fact-rows when the entry carries no date stamp
        age_days: ageDays(e.timestamp),
        est_detail_chars: e.content?.length ?? 0, // content-field length = the dominant payload of a fetched context record (best-effort by design)
        ...(expired ? { expired: true } : {}) });
    }
  }

  // — memory-fact rows (kind='memory_fact') — direct decode of StateEntry records
  const factRows: FactIndexRow[] = [];
  if (wantKind('memory_fact')) {
    for (const f of store ? extractMemoryFacts(store.records) : []) {
      const t = cutTitle(typeof f.value === 'string' ? f.value : `(structured value, ${detailCharsOf(f.value)} chars)`);
      factRows.push({
        id: f.key,
        kind: 'memory_fact',
        type: 'fact',
        title: t.title,
        ...(t.truncated_title ? { truncated_title: true } : {}),
        date: new Date(f.timestamp).toISOString().slice(0, 10),
        age_days: ageDays(f.timestamp),
        est_detail_chars: detailCharsOf(f.value),
      });
    }
  }

  // — session rows (kind='session') — pseudo-ids session:<epoch-ms> from the lightweight index
  const sessionRows: SessionIndexRow[] = [];
  if (wantKind('session')) {
    for (const s of indexData?.sessions ?? []) {
      const tsMs = typeof s.timestamp === 'number' ? s.timestamp : Date.parse(s.date);
      const hasDetail = latestSummaryTs != null && tsMs !== undefined && Math.abs(tsMs - latestSummaryTs) < 60 * 1000; // same logical summary write (dedupe window is 30 min; 60 s tolerance covers ms jitter)
      const t = cutTitle(s.task_description || '(untitled session)');
      sessionRows.push({
        id: `session:${tsMs ?? ''}`,
        kind: 'session',
        type: 'summary',
        title: t.title,
        ...(t.truncated_title ? { truncated_title: true } : {}),
        date: s.date,
        age_days: tsMs !== undefined ? ageDays(tsMs) : 0,
        est_detail_chars: hasDetail ? latestDetailChars : 0,
        detail_available: hasDetail,
      });
    }
  }

  const rows = [...sessionRows, ...factRows, ...contextRows].sort((a, b) => {
    // newest first; stable within a family by id as tiebreak
    const ta = Date.parse(a.date) || 0, tb = Date.parse(b.date) || 0;
    return tb === ta ? a.id.localeCompare(b.id) : tb - ta;
  });

  const totals: Record<RecalledKind, number> = { context: contextEntries.length, memory_fact: store ? extractMemoryFacts(store.records).length : 0, session: indexData?.sessions.length ?? 0 };
  return { rows, totals, store_file: store?.filePath ?? null };
}

// ── Fetch mode ───────────────────────────────────────────────────────────────────────────────────────────

interface FetchMiss { id: string; reason: 'no_such_entry' | 'expired_session_ttl' | 'summary_never_persisted'; note?: string }
interface FetchHit { id: string; kind: RecalledKind; record: unknown; truncated_by_per_item_chars?: boolean; original_chars?: number }

async function buildFetch(ids: string[], perItemChars?: number): Promise<{ found: FetchHit[]; not_found: FetchMiss[] }> {
  // READ-ONLY by construction — same raw-decode + inlined load() filter as buildIndex (no manager instance, no prune side effects).
  const store = await firstReadableStore();
  const contextEntries = loadContextEntriesRaw(store?.records ?? [], storePathCandidates()[0]);
  const indexData = await loadSessionsIndexRaw(); // read-only mirror of SessionIndexManager.load() (never prunes/saves)

  // Pre-compute the persisted-latest summary ONCE (shared by every session:<ts> hit/miss).
  const latestSummary = store ? extractLatestSummary(store.records) : null;
  const latestTs = latestSummary ? summaryTimestampMs(latestSummary.value) ?? undefined : undefined;
  const indexByTs = new Map<number, { task_description: string; date: string }>();
  for (const s of indexData?.sessions ?? []) {
    if (typeof s.timestamp === 'number') indexByTs.set(s.timestamp, s);
  }

  const applyPerItemCut = (id: string, kind: RecalledKind, record: unknown): FetchHit => {
    if (!perItemChars) return { id, kind, record };
    let payload: unknown = record;
    let chars = detailCharsOf(record);
    if (chars <= perItemChars) return { id, kind, record };
    // Cut the DOMINANT string field(s) so the shape stays usable (content for context, value for facts/summaries).
    const obj = (record ?? {}) as Record<string, unknown>;
    for (const key of ['content', 'value']) {
      if (typeof obj[key] === 'string' && obj[key].length > perItemChars) {
        payload = { ...obj, [key]: obj[key].slice(0, perItemChars), _truncated_field: key };
        break;
      }
    }
    return { id, kind, record: payload, truncated_by_per_item_chars: true, original_chars: chars };
  };

  const found: FetchHit[] = [];
  const not_found: FetchMiss[] = [];
  const nowMs = Date.now();

  for (const id of ids) {
    if (id.startsWith('session:')) {
      const tsMs = Number(id.slice('session:'.length));
      // The LATEST summary persists by design (P0-FIX eviction). A fetch is satisfiable iff the requested row IS
      // that latest persisted record — every older full summary was evicted on its write and can never be reconstituted.
      const matchesLatest = latestSummary && latestTs != null && Math.abs(tsMs - latestTs) < 60 * 1000; // 60 s covers ms-jitter between index row & summary write (dedupe window itself is 30 min, so no cross-session bleed risk at this tolerance)
      if (matchesLatest) {
        // Legacy persisted summaries may carry their payload as a JSON-encoded STRING — decode defensively with a shape guard;
        // undecodable/foreign shapes collapse to {} so the hit stays well-typed and self-describing via _index_row/persisted_at.
        const rawValue: unknown = latestSummary.value;
        let decoded: Record<string, unknown>;
        if (typeof rawValue === 'string') {
          try {
            const parsed: unknown = JSON.parse(rawValue);
            decoded = (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}) as Record<string, unknown>;
          } catch {
            decoded = {};
          }
        } else if (rawValue !== null && typeof rawValue === 'object') {
          decoded = Array.isArray(rawValue) ? {} : (rawValue as Record<string, unknown>);
        } else {
          decoded = {};
        }
        const row = indexByTs.get(tsMs);
        found.push(applyPerItemCut(id, 'session', { ...decoded, _index_row: row ?? undefined, persisted_at: latestSummary.timestamp }));
      } else if (indexByTs.has(Number.isNaN(tsMs) ? -1 : tsMs)) {
        const row = indexByTs.get(Number.isNaN(tsMs) ? -1 : tsMs);
        not_found.push({ id, reason: 'summary_never_persisted', note: `Session index row exists (${row ? row.date : 'unknown date'}) but its full summary record is NOT the persisted latest — it was evicted on a later save_session_summary write (P0-FIX keeps only the LATEST). The row's task_description is the durable residue.` });
      } else {
        not_found.push({ id, reason: 'no_such_entry', note: `No session index row with timestamp ${id.slice('session:'.length)}${latestSummary ? '' : ' and no session summary persisted at all'}.` });
      }
      continue;
    }

    if (id.startsWith('memory_')) {
      const fact = store ? extractMemoryFacts(store.records).find(f => f.key === id) : undefined;
      if (!fact) { not_found.push({ id, reason: 'no_such_entry', note: 'No memory_* StateEntry record with this key in the project store.' }); continue; }
      found.push(applyPerItemCut(id, 'memory_fact', { id: fact.key, value: fact.value, timestamp: fact.timestamp, date: new Date(fact.timestamp).toISOString().slice(0, 10) }));
      continue;
    }

    // ctx_* ids (or any other id → resolved against context entries by exact id match only — no fuzzy prefix guessing)
    const entry = contextEntries.find(e => e.id === id);
    if (!entry) { not_found.push({ id, reason: 'no_such_entry', note: `No in-scope context entry with this id (project filter applies — foreign-stamped entries are invisible by design).` }); continue; }
    const expired = entry.scope === 'session' && nowMs - entry.timestamp > 24 * 60 * 60 * 1000;
    if (expired) {
      found.push(applyPerItemCut(id, 'context', { ...entry, _status: 'expired_session_ttl', note: 'Session-scoped entry past its 24h TTL — served on explicit request only; other read paths prune it.' }));
      // ALSO report the reason so self-description stays machine-readable even though we served the record.
      not_found.push({ id, reason: 'expired_session_ttl', note: `Served despite expiry (explicit fetch): ${(entry.title ?? '(untitled)').slice(0, 80)}` });
      continue;
    }
    found.push(applyPerItemCut(id, 'context', entry));
  }

  return { found, not_found };
}

// ── Tool factory ─────────────────────────────────────────────────────────────────────────────────────────

export function registerMemoryRecallTool(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  tools.push(tool({
    name: 'memory_recall',
    description: `ID-first, READ-ONLY recall over the session-memory layer (context entries + memory facts + sessions index).

WHEN TO USE:
• You need ONE or a few specific records by ID without re-pulling everything (saves ~10x tokens vs get_memory/restore_session_context)
• First step of any targeted recall: mode=index to list compact id/title/date lines, then mode=fetch with the chosen ids

TWO MODES:
• mode="index" — compact rows {id, kind, type, title≤80, date, age_days, est_detail_chars} across all three families (kind filter optional; limit ≤100)
• mode="fetch" — full records for up to 10 ids per call; misses are self-describing: not_found[].reason ∈ {no_such_entry, expired_session_ttl, summary_never_persisted}

IDS: ctx_* and memory_* come from index rows (or save/delete responses); sessions use pseudo-ids session:<epoch-ms>.
Only the LATEST session summary persists by design — older session ids resolve to summary_never_persisted.`,
    parameters: {
      mode: z.enum(['index', 'fetch']).describe('"index" = compact ID list; "fetch" = full records for explicit ids (requires ids)'),
      kind: z.enum(['context', 'memory_fact', 'session']).optional().describe('Index mode only — restrict to one family'),
      limit: z.number().int().min(1).max(100).optional().default(50).describe('Index mode — max rows returned (newest first)'),
      ids: z.array(z.string().min(1)).min(1).max(10).optional().describe('Fetch mode — up to 10 record ids per call (ctx_*, memory_*, session:<epoch-ms>)'),
      per_item_chars: z.number().int().min(1).optional().describe('Fetch mode — cap dominant string fields of each record at this many chars; reports original_chars when cut'),
    },
    implementation: async ({ mode, kind, limit = 50, ids, per_item_chars }: {
      readonly mode: 'index' | 'fetch';
      readonly kind?: RecalledKind;
      readonly limit?: number;
      readonly ids?: string[];
      readonly per_item_chars?: number;
    }) => {
      try {
        if (mode === 'fetch') {
          if (!ids || ids.length === 0) {
            return { success: false, error: 'mode="fetch" requires a non-empty "ids" array (up to 10 ids per call). Use mode="index" first to list available ids.' };
          }
          // Runtime guard mirroring the zod .max(10) contract — keeps the cap self-enforcing even if the tool is
          // invoked with a pre-validated-but-mutated array (defense in depth; tests pin this exact envelope).
          if (ids.length > 10) {
            return { success: false, error: `Batch cap exceeded: ${ids.length} ids submitted — max is 10 per call. Split the batch across multiple memory_recall fetch calls.` };
          }
          const { found, not_found } = await buildFetch(ids, per_item_chars);
          return {
            success: true,
            data: {
              mode: 'fetch' as const,
              requested: ids.length,
              found_count: found.length,
              not_found_count: not_found.length,
              found,
              not_found,
              ...(found.length === 0 && not_found.length > 0 ? { note: 'All requested ids missed — see not_found[].reason for the self-describing why (expired_session_ttl / summary_never_persisted are EXPECTED outcomes by design, not errors).' } : {}),
            },
          };
        }

        const { rows, totals, store_file } = await buildIndex({ kind, nowMs: Date.now() });
        const limited = rows.slice(0, limit);
        return {
          success: true,
          data: {
            mode: 'index' as const,
            returned: limited.length,
            totals,                       // per-family counts BEFORE the limit — so "50 of 213" is never a mystery
            truncated: rows.length > limited.length,
            rows: limited,
            store_file,
            hint: 'Pick ids from these rows and call memory_recall with mode="fetch", ids=[...] (max 10 per call) to retrieve full records.',
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[memory_recall] ERROR: ${message}`);
        return { success: false, error: `memory_recall failed: ${message}` };
      }
    },
  }));

  return tools;
}
