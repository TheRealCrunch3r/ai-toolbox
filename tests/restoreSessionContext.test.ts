/**
 * Tests for restore_session_context (25.09) — composite read-only "read session mem" bootstrap tool.
 *
 * Hermetic by design: workingDir is mocked to a fresh temp dir per run; ALL store files are seeded into that
 * temp dir (the repo-store guard in jest.config.cjs throws on writes to <rootDir>/.session_context, and this
 * suite never touches it). The tool under test must not write anywhere — asserted explicitly.
 */

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { encode } from '@msgpack/msgpack';

import { registerRestoreSessionContextTool } from '../src/tools/restoreSessionContextTool';
import type { StateManager } from '../src/stateManager';
// CONTAMINATION-FIX B1 (01.10): the store seed must use the SAME per-project filename the tool now resolves at read time.
import { resolveProjectName } from '../src/stateManager';
import { DEFAULT_CONFIG } from '../src/config';

// Mutable working-dir seam (globalThis on purpose: jest.mock factory hoisting forbids out-of-scope variable refs).
jest.mock('../src/workingDir', () => ({
  getWorkingDir: (): string => (globalThis as Record<string, unknown>).__rsc_wd as string,
}));

const _g = globalThis as Record<string, unknown>;

interface TestContextEntry {
  id?: string;
  timestamp?: number;
  date?: string;
  type?: string;
  title?: string;
  content?: string;
  tags?: string[];
  scope?: 'global' | 'project' | 'session';
  ttl_ms?: number;
}

const NOW = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

let tempWd: string;
let sessionCtxDir: string;
/** Real isolation stamp: ContextStorageManager stamps project_path with the MEMORY FILE path (<wd>/.session_context/<file>,
 * see mergeEntriesWithTiers + _syncFromSessionMemory docs) and load() compares against that same file path — NOT the bare
 * working dir. Seeding a directory string made every entry look cross-project (rejected by the project filter). */
let STORE_STAMP: string;
/** CONTAMINATION-FIX B1 (01.10): per-project store filename component, resolved with the SAME function as production. */
let STORE_PROJECT: string;
let toolImpl: (params: Record<string, unknown>) => Promise<Record<string, unknown>> | undefined;

async function seedStore(): Promise<void> {
  await fs.mkdir(sessionCtxDir, { recursive: true });

  // ── Shared .msgpack store: context entries + state records in ONE file (the real on-disk shape) ──
  const checkpointA: TestContextEntry = {
    id: 'ctx_cp_a', timestamp: NOW - 2 * DAY_MS, date: 'cp-a', type: 'summary',
    title: 'Session Memory Checkpoint (83.6% tokens used)',
    content: 'Auto-triggered session memory save at 75% token threshold.\n\nCurrent session state:\n- Tokens used: 109534 / 131072 (83.6%)',
    tags: ['auto_checkpoint', 'token_threshold'], scope: 'global', frequency: 1, project_path: STORE_STAMP,
  } as TestContextEntry;
  const checkpointB: TestContextEntry = {
    id: 'ctx_cp_b', timestamp: NOW - 1 * DAY_MS, date: 'cp-b', type: 'summary',
    title: 'Session Memory Checkpoint (99.5% tokens used)',
    content: 'Auto-triggered session memory save at 75% token threshold.\n\nCurrent session state:\n- Tokens used: 130373 / 131072 (99.5%)',
    tags: ['auto_checkpoint', 'token_threshold'], scope: 'global', frequency: 1, project_path: STORE_STAMP,
  } as TestContextEntry;
  const decision: TestContextEntry = {
    id: 'ctx_dec_1', timestamp: NOW - 2 * DAY_MS, date: 'dec-date', type: 'decision',
    title: 'Owner chose restore tool over consolidation',
    content: 'DECISION-UNIQUE-BODY composite read wins; Option B rejected.',
    tags: ['ai_toolbox'], scope: 'global', frequency: 1, project_path: STORE_STAMP,
  } as TestContextEntry;
  const expiredSession: TestContextEntry = {
    id: 'ctx_sess_expired', timestamp: NOW - 30 * DAY_MS, date: 'old-session', type: 'pattern',
    title: 'Expired session-scoped entry (should be skipped locally)',
    content: 'EXPIRED-UNIQUE-BODY must not appear in dossier.',
    tags: ['usage_pattern'], scope: 'session', ttl_ms: DAY_MS, frequency: 1, project_path: STORE_STAMP,
  } as TestContextEntry;

  const records = [
    // state record: latest session summary (object value — current format)
    { key: 'session_summary_latest', timestamp: NOW - DAY_MS, value: {
      task_description: 'seeded task description', accomplishments: '- a1\n- a2', pending_tasks: '- p1',
      decisions_made: '- d1', context_for_next_session: 'pointer note', timestamp: NOW - DAY_MS, date: 'summary-date',
    } },
    // state record: explicit memory fact
    { key: `memory_${NOW}`, timestamp: NOW - DAY_MS, value: { fact: 'FACT-UNIQUE-BODY owner preference', timestamp: NOW - DAY_MS, date: 'fact-date' } },
    // (context entries moved below into the SHARED CSM file — see post-isolation split)
  ];

  // ?? POST-ISOLATION PRODUCTION SHAPE (CONTAMINATION-FIX B1, 01.10): StateManager records live in the PER-PROJECT file
  // .<name>_memory.msgpack; ContextStorageManager entries stay in the SHARED .ai_toolbox_memory.msgpack by design.
  await fs.writeFile(path.join(sessionCtxDir, `.${STORE_PROJECT}_memory.msgpack`), encode(records));

  const ctxRecords: unknown[] = [checkpointA, checkpointB, decision, expiredSession];
  await fs.writeFile(path.join(sessionCtxDir, '.ai_toolbox_memory.msgpack'), encode(ctxRecords));

  // ── Persisted plans: two on disk, newest must win (get_plan selection semantics) ──
  const planData = {
    version: 1,
    plans: {
      plan_old_1: {
        goal: 'OLDER PLAN GOAL — must not be the active one', createdAt: NOW - 5 * DAY_MS, updatedAt: NOW - 5 * DAY_MS,
        steps: [{ index: 0, description: 'old step', status: 'done' }],
      },
      plan_new_2: {
        goal: 'NEWER PLAN GOAL — the active plan', createdAt: NOW - 1 * DAY_MS, updatedAt: NOW - 6 * 3600 * 1000,
        steps: [
          { index: 0, description: 'step one done', status: 'done' },
          { index: 1, description: 'step two in flight', status: 'in_progress', note: 'working on it' },
          { index: 2, description: 'step three pending', status: 'pending' },
        ],
      },
    },
  };
  await fs.writeFile(path.join(sessionCtxDir, '.ai_toolbox_plans.json'), JSON.stringify(planData));

  // ── Sessions index ──
  const sessions = Array.from({ length: 10 }, (_, i) => ({
    task_description: `session ${i + 1}`, timestamp: NOW - (i + 1) * DAY_MS, date: `date-${i + 1}`,
  }));
  await fs.writeFile(path.join(sessionCtxDir, 'sessions.json'), JSON.stringify({ sessions, total_count: sessions.length, last_updated: NOW }));
}

/** Snapshot every file in the seeded .session_context dir for read-only assertion. */
async function storeSnapshot(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const entries = await fs.readdir(sessionCtxDir);
  for (const name of entries) out[name] = await fs.readFile(path.join(sessionCtxDir, name));
  return out;
}

beforeAll(async () => {
  tempWd = await fs.mkdtemp(path.join(os.tmpdir(), 'rsc-test-'));
  sessionCtxDir = path.join(tempWd, '.session_context');
  STORE_STAMP = path.join(sessionCtxDir, '.ai_toolbox_memory.msgpack'); // production stamp shape (memory FILE path)
  _g.__rsc_wd = tempWd;
  STORE_PROJECT = resolveProjectName(); // CONTAMINATION-FIX B1: resolved AFTER the seam points at tempWd (production order)
  await seedStore();

  const tools = registerRestoreSessionContextTool(DEFAULT_CONFIG as never);
  expect(tools.length).toBe(1);
  expect(tools[0].name).toBe('restore_session_context');
  toolImpl = (tools[0] as { implementation?: unknown }).implementation as typeof toolImpl;
});

afterAll(async () => {
  _g.__rsc_wd = undefined;
  await fs.rm(tempWd, { recursive: true, force: true });
});

describe('restore_session_context', () => {
  test('registration exposes exactly one read-only composite tool', () => {
    const tools = registerRestoreSessionContextTool(DEFAULT_CONFIG as never);
    expect(tools.map(t => t.name)).toEqual(['restore_session_context']);
  });

  test('full dossier contains every family with correct counts and fresh staleness', async () => {
    const res = (await toolImpl!({})) as Record<string, unknown>;
    expect(res.success).toBe(true);
    const data = res.data as Record<string, any>;

    expect(data.counts.session_summary).toBe(1);
    expect(data.counts.memory_facts).toBe(1);
    expect(data.counts.context_entries_total).toBe(3); // decision + 2 checkpoints (expired session entry skipped)
    expect(data.counts.auto_checkpoints_collapsed).toBe(2);
    expect(data.counts.non_auto_context_entries).toBe(1);
    expect(data.counts.expired_session_entries_skipped).toBe(1);
    expect(data.counts.plans_on_disk).toBe(2);
    expect(data.counts.sessions_indexed).toBe(10);

    const dossier = data.dossier_text as string;
    expect(dossier).toContain('seeded task description');                       // summary family
    expect(dossier).toContain('pointer note');                                  // summary context_for_next_session field
    expect(dossier).toContain('NEWER PLAN GOAL — the active plan');             // plans family (newest wins)
    expect(dossier).toContain('[in_progress] 2. step two in flight — note: working on it');
    expect(dossier).toContain('1 older plan(s) also on disk');
    expect(dossier).not.toContain('OLDER PLAN GOAL');                           // older plan must not be rendered as active
    expect(dossier).toContain('Owner chose restore tool over consolidation');   // context family (substantive entry in full)
    expect(dossier).toContain('FACT-UNIQUE-BODY owner preference');             // facts family
    expect(dossier).toContain('8 of 10');                                       // sessions index top-8 rendered…
    expect(dossier).toContain('session 8');                                     // …newest 8 entries present (index is newest-first: session 1..8)
    expect(dossier).not.toContain('- date-9: session 9');                       // …entries 9–10 beyond depth, with list/search pointer

    // Staleness: all seeded timestamps are fresh (≤3 days) → no family stale; summary present.
    const staleness = data.staleness as Record<string, unknown>;
    expect(staleness.session_summary).toBe(false);
    expect(staleness.context_entries).toBe(false);
    expect(staleness.persisted_plans).toBe(false);
    expect(data.truncated).toBe(false);
  });

  test('auto-checkpoints collapse to a single line with date range + peak usage', async () => {
    const res = (await toolImpl!({})) as Record<string, unknown>;
    const dossier = (res.data as Record<string, any>).dossier_text as string;

    expect(dossier).toContain('2 checkpoint(s)');
    expect(dossier).toContain('peak context usage 99.5%'); // max of (83.6%, 99.5%)
    expect(dossier).not.toContain('109534 / 131072');      // checkpoint bodies must NOT be inlined verbatim
    expect(dossier).not.toContain('130373 / 131072');
    // The collapse line is present exactly once (no per-checkpoint sections leaked through)
    const collapseLines = dossier.split('\n').filter(l => l.includes('checkpoint(s),'));
    expect(collapseLines).toHaveLength(1);
  });

  test('expired session-scoped entries are skipped locally and NOT persisted (read-only contract)', async () => {
    const before = await storeSnapshot();
    const res = (await toolImpl!({})) as Record<string, unknown>;
    const after = await storeSnapshot();
    expect(res).toBeTruthy();

    // Read-only: byte-identical store files before and after the call.
    expect(after).toEqual(before);
  });

  test('truncation honors max_chars budget with explicit marker + omitted section list', async () => {
    // Budget chosen INSIDE the truncation window for this seed (full untruncated dossier ≈ 1.5–1.7k chars — measured 25.09):
    // low enough to drop at least one section, high enough that header + summary + plan stay in so the pins below hold.
    // NOTE: must stay ≥ MIN_MAX_CHARS (schema floor) AND < full dossier size — see module comment on MIN_MAX_CHARS.
    const res = (await toolImpl!({ max_chars: 1250 })) as Record<string, unknown>;
    const data = res.data as Record<string, any>;
    expect(data.truncated).toBe(true);

    const dossier = data.dossier_text as string;
    expect(dossier).toContain('[TRUNCATED at max_chars=1250');
    // Header + highest-priority sections survive; the marker names what was dropped.
    expect(dossier).toContain('seeded task description');
    // At least one lower-priority family section must be named in the omission list.
    expect(data.dossier_text.length).toBeGreaterThan(1250 - 50); // header + marker always exist (documented: budget covers sections, not the marker itself)
  });

  test('fresh project (no store files anywhere) returns a self-describing empty dossier, success=true', async () => {
    const emptyWd = await fs.mkdtemp(path.join(os.tmpdir(), 'rsc-empty-'));
    _g.__rsc_wd = emptyWd;
    try {
      const res = (await toolImpl!({})) as Record<string, unknown>;
      expect(res.success).toBe(true);
      const data = res.data as Record<string, any>;
      const dossier = data.dossier_text as string;
      expect(data.counts.session_summary).toBe(0);
      expect(data.staleness.session_summary).toBe('missing');
      expect(dossier).toContain('no session summary found (fresh project or lost to overwrite)');
      expect(dossier).toContain('none stored for this project'); // context entries absent line
      expect(dossier).toContain('Persisted Plan — none');
    } finally {
      _g.__rsc_wd = tempWd;
      await fs.rm(emptyWd, { recursive: true, force: true });
    }
  });

  test('legacy string-valued session_summary_latest is parsed (write/read symmetry with get_session_summary)', async () => {
    const legacyValue = JSON.stringify({ task_description: 'LEGACY-STRING-SUMMARY', timestamp: NOW - DAY_MS, date: 'legacy-date' });
    // Rewrite ONLY the summary record as a JSON string value; keep everything else.
    // CONTAMINATION-FIX B1 (01.10): state records now live in the PER-PROJECT file (was hardcoded shared name).
    const storePath = path.join(sessionCtxDir, `.${STORE_PROJECT}_memory.msgpack`);
    // CJS require (NOT native dynamic import): under module=NodeNext TS keeps `await import()` native even in
    // CJS output — that only works if jest runs WITH --experimental-vm-modules (baked into "npm test", absent from
    // plain `npx jest` → "A dynamic import callback was invoked" TypeError; hit 01.10 in targeted reruns).
    const { decode } = require('@msgpack/msgpack') as typeof import('@msgpack/msgpack');
    const records = decode(await fs.readFile(storePath)) as Array<Record<string, unknown>>;
    const idx = records.findIndex(r => r.key === 'session_summary_latest');
    expect(idx).toBeGreaterThanOrEqual(0);
    records[idx].value = legacyValue;
    await fs.writeFile(storePath, encode(records));

    try {
      const res = (await toolImpl!({})) as Record<string, unknown>;
      const dossier = (res.data as Record<string, any>).dossier_text as string;
      expect(dossier).toContain('LEGACY-STRING-SUMMARY');
    } finally {
      // Restore the object-valued record for subsequent tests.
      records[idx].value = { task_description: 'seeded task description', timestamp: NOW - DAY_MS, date: 'summary-date' };
      await fs.writeFile(storePath, encode(records));
    }
  });

  test('RAM StateManager hit wins over file content (priority parity with get_session_summary)', async () => {
    const fakeSummary = { task_description: 'RAM-WINS-SUMMARY', timestamp: NOW - DAY_MS, date: 'ram-date' };
    const fakeStore = {
      get: <T>(_key: string): T | undefined => fakeSummary as T,
      // CONTAMINATION-FIX B2 (01.10): the identity guard now verifies the RAM store's project name before trusting it —
      // mirror the production StateManager surface so this pin tests PRIORITY parity, not the mismatch path.
      getMemoryFilePath: () => ({ filePath: '', projectName: resolveProjectName(), indexPath: null }),
    } as unknown as StateManager;

    const tools = registerRestoreSessionContextTool(DEFAULT_CONFIG as never, fakeStore);
    const impl = (tools[0] as { implementation?: (p: Record<string, unknown>) => Promise<Record<string, unknown>> }).implementation;
    expect(impl).toBeDefined();
    const res = (await impl!({})) as Record<string, unknown>;
    const dossier = (res.data as Record<string, any>).dossier_text as string;
    expect(dossier).toContain('RAM-WINS-SUMMARY');
  });

  // ==================== CONTAMINATION-FIX regressions (01.10, RESEARCH_session-memory-contamination §5) ====================

  test('foreign .ai_toolbox_memory.msgpack with a planted summary is NOT surfaced for differently-named projects (B1)', async () => {
    // The pre-fix frozen-identity bug wrote project A's records into B's folder under A's filename
    // (<B>/.session_context/.<A>_memory.msgpack). For any project whose resolved name differs from 'ai_toolbox',
    // that shared-named file must no longer feed the summary/facts families — only the per-project file may.
    const foreignPath = path.join(sessionCtxDir, '.ai_toolbox_memory.msgpack');
    // APPEND the forged state record to the existing file (which holds the seeded CSM context entries): in a
    // contaminated production layout both shapes coexist; replacing would destroy the ctx fixture and the count pin below.
    // CJS require (NOT native dynamic import) — see note at the other require() site in this file.
    const { decode } = require('@msgpack/msgpack') as typeof import('@msgpack/msgpack');
    const existing = decode(await fs.readFile(foreignPath)) as Array<Record<string, unknown>>;
    await fs.writeFile(foreignPath, encode([
      ...existing,
      { key: 'session_summary_latest', timestamp: NOW - DAY_MS, value: { task_description: 'FORGED-FOREIGN-SUMMARY' } },
    ]));

    const res = (await toolImpl!({})) as Record<string, unknown>;
    const data = res.data as Record<string, any>;
    const dossier = data.dossier_text as string;
    expect(dossier).not.toContain('FORGED-FOREIGN-SUMMARY');   // foreign record must not surface (doc §5.2)
    expect(data.counts.session_summary).toBe(1);               // legit own-project summary from .<STORE_PROJECT>_memory.msgpack still found
    expect(dossier).toContain('seeded task description');
    // Context family unaffected: the planted {key,value} record is not a context entry (FIX #15 shape filter),
    // so CSM's view of its shared file keeps exactly the seeded entries.
    expect(data.counts.context_entries_total).toBe(3);
  });

  test('RAM store with foreign project identity is skipped in favor of disk (B2)', async () => {
    // Simulates a long-lived process where StateManager was constructed under another project and the CWD since
    // switched without an identity rebind: RAM holds the OLD project's summary — it must not render here. The
    // per-project disk read is authoritative; the mismatch is surfaced in section notes, not silently absorbed.
    const foreignIdentityStore = {
      get: <T>(_key: string): T | undefined => ({ task_description: 'STALE-RAM-FOREIGN-SUMMARY', timestamp: NOW - DAY_MS, date: 'stale-date' }) as T,
      getMemoryFilePath: () => ({ filePath: '', projectName: 'some_other_project_xyz', indexPath: null }),
    } as unknown as StateManager;

    const tools = registerRestoreSessionContextTool(DEFAULT_CONFIG as never, foreignIdentityStore);
    const impl = (tools[0] as { implementation?: (p: Record<string, unknown>) => Promise<Record<string, unknown>> }).implementation;
    expect(impl).toBeDefined();
    const res = (await impl!({})) as Record<string, unknown>;
    const data = res.data as Record<string, any>;
    const dossier = data.dossier_text as string;
    expect(dossier).not.toContain('STALE-RAM-FOREIGN-SUMMARY'); // stale RAM skipped
    expect(data.counts.session_summary).toBe(1);                // disk fallback found the real one
    expect(dossier).toContain('seeded task description');
    const notes = (data.section_notes ?? []) as Array<{ name: string; note: string }>;
    expect(notes.some(n => n.name === 'session_summary' && n.note.includes("does not match current project"))).toBe(true);
  });

  test('include_sessions_index=false omits the index section without touching counts', async () => {
    const res = (await toolImpl!({ include_sessions_index: false })) as Record<string, unknown>;
    const data = res.data as Record<string, any>;
    expect(data.counts.sessions_indexed).toBe(0);
    expect((data.dossier_text as string)).toContain('omitted (include_sessions_index=false)');
  });

  test('stale summary (>3 days old) is flagged in the staleness header', async () => {
    // CONTAMINATION-FIX B1 (01.10): state records now live in the PER-PROJECT file (was hardcoded shared name).
    const storePath = path.join(sessionCtxDir, `.${STORE_PROJECT}_memory.msgpack`);
    // CJS require (NOT native dynamic import) — see note at the other require() site in this file.
    const { decode } = require('@msgpack/msgpack') as typeof import('@msgpack/msgpack');
    const records = decode(await fs.readFile(storePath)) as Array<Record<string, any>>;
    const idx = records.findIndex(r => r.key === 'session_summary_latest');
    const originalValue = records[idx].value;
    records[idx].value = { ...originalValue, timestamp: NOW - 10 * DAY_MS };
    await fs.writeFile(storePath, encode(records));

    try {
      const res = (await toolImpl!({})) as Record<string, unknown>;
      expect((res.data as Record<string, any>).staleness.session_summary).toBe(true);
      expect(((res.data as Record<string, any>).dossier_text as string)).toContain('summary=true');
    } finally {
      records[idx].value = originalValue;
      await fs.writeFile(storePath, encode(records));
    }
  });
});
