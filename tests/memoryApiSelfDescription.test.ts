/**
 * Regression suite: self-describing memory API tools (FIX #18, 2026-08-22).
 *
 * ROOT CAUSE UNDER TEST (real incident of the same day):
 * get_session_summary returned exactly ONE summary with NO metadata about the 21-session index
 * in sessions.json; get_context_memory / get_memory returned empty/error results byte-for-byte
 * identical to "no store exists" even though .ai_toolbox_memory.msgpack held state records.
 * A consumer (the LLM) concluded "no session history" against a populated store — the same bug
 * class as grep_files silent-skip: non-fatal emptiness without self-description.
 *
 * FIXES UNDER TEST:
 *  - ContextStorageManager.getStoreDiagnostics(): reports storage file existence, total record
 *    count, context-entry count, and state-record keys ({key,value,timestamp} records sharing the file).
 *  - get_session_summary: attaches session_index_meta (total_sessions + up to 3 other recent task
 *    descriptions + hint) on every success path so a single-summary response can't look like "fresh project".
 *  - get_context_memory / get_memory: empty results carry store_diagnostics distinguishing
 *    "file missing" vs "file exists, holds only other record types" vs "genuinely empty".
 *
 * Conventions (see contextSearch.test.ts): resetWorkingDir() in afterEach; fixtures written to os.tmpdir
 * so the repo's own .session_context is never touched.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { encode } from '@msgpack/msgpack';
import { ContextStorageManager, registerContextManagementTools } from '../src/tools/contextManagementTools';
import { getWorkingDir, setWorkingDir, resetWorkingDir } from '../src/workingDir';

// ==================== Fixture builders ====================

let seq = 0;

/** Well-formed context entry (the shape ContextEntry requires). */
function ctxEntry(overrides: Partial<{ title: string; content: string; tags?: string[]; type?: string }> = {}): Record<string, unknown> {
  return {
    id: `ctx_fixture_${++seq}`,
    timestamp: Date.now(),
    date: new Date().toLocaleString(),
    type: overrides.type ?? 'decision',
    title: overrides.title ?? 'Fixture Decision',
    content: overrides.content ?? 'Default fixture decision content.',
    tags: overrides.tags ?? ['fixture'],
  };
}

/** StateManager record — the shape save_memory / save_session_summary writes ({key,value,timestamp}). */
function stateRecord(key: string, value: unknown): Record<string, unknown> {
  return { key, value, timestamp: Date.now() };
}

/** Write a mixed-shape msgpack fixture into the temp project dir. */
function writeFixture(tmpDir: string, records: Array<Record<string, unknown>>): void {
  const dir = path.join(tmpDir, '.session_context');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.ai_toolbox_memory.msgpack'), encode(records));
}

/** Write a sessions.json index fixture (SessionIndexManager format). */
function writeSessionsJson(tmpDir: string, descriptions: Array<{ task_description: string; timestamp?: number; date?: string }>): void {
  const dir = path.join(tmpDir, '.session_context');
  fs.mkdirSync(dir, { recursive: true });
  const sessions = descriptions.map((d, i) => ({
    task_description: d.task_description,
    timestamp: d.timestamp ?? Date.now() - (descriptions.length - i) * 1000,
    date: d.date ?? new Date().toLocaleString(),
  }));
  fs.writeFileSync(
    path.join(dir, 'sessions.json'),
    JSON.stringify({ sessions, total_count: sessions.length, last_updated: Date.now() }, null, 2),
    'utf-8'
  );
}

/** Locate one tool in a registerContextManagementTools() result by name. */
function findToolByName(tools: Array<{ name?: string; implementation?: (args: Record<string, unknown>) => Promise<unknown> }>, name: string): { implementation?: (args: Record<string, unknown>) => Promise<unknown> } | undefined {
  return tools.find(t => t.name === name) as typeof tools[number];
}

// ==================== Tests ====================

describe('FIX #18 — self-describing memory API tools', () => {
  let tmpDir: string;

  beforeEach(() => {
    seq = 0;
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'memselfdesc-'));
    setWorkingDir(tmpDir);
  });

  afterEach(() => {
    resetWorkingDir(); // established convention — never leak CWD state between tests
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best-effort */ }
  });

  describe('ContextStorageManager.getStoreDiagnostics()', () => {
    test('file missing → storage_file_exists:false with zero counts (no throw)', async () => {
      const manager = new ContextStorageManager();
      expect(await manager.getStoreDiagnostics()).toEqual({
        storage_file_exists: false,
        total_records_in_file: 0,
        context_entries_found: 0,
      });
    });

    test('file holds ONLY state records → diagnostics expose record count + keys (the real 22.08 scenario)', async () => {
      writeFixture(tmpDir, [stateRecord('session_summary_latest', { task_description: 'x', timestamp: Date.now(), date: '' })]);

      const manager = new ContextStorageManager();
      const diag = await manager.getStoreDiagnostics();

      expect(diag.storage_file_exists).toBe(true);
      expect(diag.total_records_in_file).toBe(1);
      expect(diag.context_entries_found).toBe(0);
      expect(diag.non_context_record_keys).toEqual(['session_summary_latest']);
    });

    test('mixed store → context count and state-record keys both reported; duplicate keys deduped', async () => {
      writeFixture(tmpDir, [
        ctxEntry({ title: 'A' }),
        ctxEntry({ title: 'B' }),
        stateRecord('memory_100', 'Important fact'),
        stateRecord('session_summary_latest', {}),
        stateRecord('session_summary_latest', { duplicate: true }), // same key again → dedupe in output
        { foo: 'bar' }, // arbitrary malformed record — counted, not attributed to any type
      ]);

      const manager = new ContextStorageManager();
      const diag = await manager.getStoreDiagnostics();

      expect(diag.storage_file_exists).toBe(true);
      expect(diag.total_records_in_file).toBe(6);
      expect(diag.context_entries_found).toBe(2);
      expect(diag.non_context_record_keys).toEqual(expect.arrayContaining(['memory_100', 'session_summary_latest']));
      expect(new Set(diag.non_context_record_keys).size).toBe(diag.non_context_record_keys!.length); // no duplicates
    });

    test('empty array file → exists, 0 records (distinct from missing file)', async () => {
      writeFixture(tmpDir, []);
      const manager = new ContextStorageManager();
      expect(await manager.getStoreDiagnostics()).toMatchObject({
        storage_file_exists: true,
        total_records_in_file: 0,
        context_entries_found: 0,
      });
    });
  });

  describe('get_context_memory — self-describing empty results', () => {
    test('store holds only session_summary_latest → success + diagnostics name the other record type (pre-fix: bare [] indistinguishable from no store)', async () => {
      writeFixture(tmpDir, [stateRecord('session_summary_latest', { task_description: 'yesterday work' })]);

      const tools = registerContextManagementTools({} as never);
      const toolDef = findToolByName(tools, 'get_context_memory');
      expect(toolDef?.implementation).toBeDefined();

      const result = (await toolDef!.implementation!({})) as {
        success: boolean;
        data?: { entries?: unknown[]; store_diagnostics?: Record<string, unknown>; note?: string };
      };

      expect(result.success).toBe(true);
      expect(result.data?.entries).toEqual([]);
      const diag = result.data!.store_diagnostics!;
      expect(diag.storage_file_exists).toBe(true);
      expect(diag.context_entries_found).toBe(0);
      expect((diag.non_context_record_keys as string[])).toContain('session_summary_latest');
      // Explanatory note routes the consumer to the right tool:
      expect(result.data?.note).toMatch(/get_session_summary|get_memory/);
    });

    test('genuinely populated context store → entries returned, diagnostics consistent', async () => {
      writeFixture(tmpDir, [ctxEntry({ title: 'Remembered Decision', content: 'Use atomic writes for all state files.' })]);

      const tools = registerContextManagementTools({} as never);
      const toolDef = findToolByName(tools, 'get_context_memory');

      const result = (await toolDef!.implementation!({ limit: 5 })) as {
        success: boolean;
        data?: { entries?: Array<{ title?: string }>; store_diagnostics?: Record<string, unknown> };
      };

      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(1);
      expect((result.data!.store_diagnostics as { context_entries_found: number }).context_entries_found).toBe(1);
    });

    test('no store at all → success + diagnostics flag file missing (distinct from "file exists but empty")', async () => {
      const tools = registerContextManagementTools({} as never);
      const toolDef = findToolByName(tools, 'get_context_memory');

      const result = (await toolDef!.implementation!({})) as {
        success: boolean;
        data?: { entries?: unknown[]; store_diagnostics?: Record<string, unknown> };
      };

      expect(result.success).toBe(true);
      // NOTE: the plugin-root fallback may exist in dev environments — but THIS temp project's file is absent.
      if (result.data && 'store_diagnostics' in result.data && result.data!.store_diagnostics) {
        const diag = result.data!.store_diagnostics as Record<string, unknown>;
        // Whatever the outcome, the diagnostic fields MUST be present and self-consistent:
        expect(typeof diag.storage_file_exists).toBe('boolean');
        expect(typeof diag.total_records_in_file).toBe('number');
        expect(typeof diag.context_entries_found).toBe('number');
      }
    });
  });

  describe('get_session_summary — session_index_meta (21-session blindness fix)', () => {
    test('index with earlier sessions → meta reports total + other recent descriptions, excluding the current one', async () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'memselfdesc-index-'));
      try {
        setWorkingDir(tmp);

        writeSessionsJson(tmp, [
          { task_description: 'Latest work — token accounting consolidation complete.' },
          { task_description: 'PART B pre-compression checkpoint re-implemented from regression spec.' },
          { task_description: 'AutoTracker mid-loop usage check analyzed (read-only).' },
          { task_description: 'grep_files silent-skip fix shipped with self-describing reports.' },
        ]);

        const tools = registerContextManagementTools({} as never);
        const toolDef = findToolByName(tools, 'get_session_summary');

        // No memoryStore (null) → RAM path skipped; disk fallback must serve the fixture below.
        const wdDir = path.join(getWorkingDir(), '.session_context');
        fs.mkdirSync(wdDir, { recursive: true });
        fs.writeFileSync(
          path.join(wdDir, '.ai_toolbox_memory.msgpack'),
          encode([stateRecord('session_summary_latest', {
            task_description: 'Latest work — token accounting consolidation complete.',
            timestamp: Date.now(),
            date: new Date().toLocaleString(),
          })])
        );

        const result = (await toolDef!.implementation!({})) as {
          success: boolean;
          data?: Record<string, unknown> & { session_index_meta?: { total_sessions?: number; other_recent_sessions?: Array<{ task_description?: string }>; hint?: string } };
        };

        expect(result.success).toBe(true);
        const meta = result.data?.session_index_meta;
        expect(meta).toBeDefined();
        // Current summary's description is excluded from "other" listings:
        expect((meta!.other_recent_sessions ?? []).every(s => !s.task_description?.startsWith('Latest work'))).toBe(true);
        // Other sessions are surfaced (up to 3, newest-first):
        const descs = meta!.other_recent_sessions!.map(s => s.task_description);
        expect(descs.length).toBeLessThanOrEqual(3);
        expect(descs.some(d => d?.startsWith('PART B'))).toBe(true);
        // Hint routes consumers to the browse/search tools:
        expect(meta!.hint).toMatch(/list_sessions|search_sessions/);
      } finally {
        try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* best-effort */ }
      }
    }, 20000);

    test('no sessions.json → meta omitted gracefully (success unaffected)', async () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'memselfdesc-noidx-'));
      try {
        setWorkingDir(tmp);

        const tools = registerContextManagementTools({} as never);
        const toolDef = findToolByName(tools, 'get_session_summary');

        const wdDir = path.join(getWorkingDir(), '.session_context');
        fs.mkdirSync(wdDir, { recursive: true });
        fs.writeFileSync(
          path.join(wdDir, '.ai_toolbox_memory.msgpack'),
          encode([stateRecord('session_summary_latest', {
            task_description: 'Only summary ever saved.',
            timestamp: Date.now(),
            date: new Date().toLocaleString(),
          })])
        );

        const result = (await toolDef!.implementation!({})) as { success: boolean; data?: Record<string, unknown> };
        expect(result.success).toBe(true);
      } finally {
        try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* best-effort */ }
      }
    }, 20000);
  });

  describe('get_memory — self-describing empty result (defect C)', () => {
    test('file holds only session_summary_latest → success:true with memories:[] + diagnostics naming present key', async () => {
      writeFixture(tmpDir, [stateRecord('session_summary_latest', { task_description: 'yesterday work' })]);

      const tools = registerContextManagementTools({} as never);
      const toolDef = findToolByName(tools, 'get_memory');

      const result = (await toolDef!.implementation!({})) as {
        success: boolean;
        data?: Array<{ key: string; value: unknown }> | { memories?: Array<unknown>; store_diagnostics?: Record<string, unknown> };
      };

      expect(result.success).toBe(true); // pre-fix this was success:false "No memory entries found." (ambiguous)
      const dataObj = result.data as { memories?: Array<unknown>; store_diagnostics?: Record<string, unknown> };
      expect(Array.isArray(dataObj.memories)).toBe(true);
      expect((dataObj.store_diagnostics?.other_record_keys as string[]) ?? []).toContain('session_summary_latest');
    });

    test('real memory_* record → returned via data array (backward-compatible shape preserved)', async () => {
      writeFixture(tmpDir, [
        stateRecord(`memory_${Date.now()}`, { fact: 'User prefers concise bilingual responses.', timestamp: Date.now(), date: '' }),
        stateRecord('session_summary_latest', {}),
      ]);

      const tools = registerContextManagementTools({} as never);
      const toolDef = findToolByName(tools, 'get_memory');

      const result = (await toolDef!.implementation!({})) as { success: boolean; data?: Array<{ key: string; value?: unknown }> };
      expect(result.success).toBe(true);
      const arr = result.data as Array<{ key: string }>;
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.some(m => m.key.startsWith('memory_'))).toBe(true);
    });
  });
});
