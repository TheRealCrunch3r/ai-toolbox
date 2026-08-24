/**
 * Regression suite: search_context crash on mixed-shape msgpack stores (FIX #15, 2026-08-19).
 *
 * ROOT CAUSE UNDER TEST:
 * .ai_toolbox_memory.msgpack is shared by TWO writers — ContextStorageManager writes context
 * entries ({id,type,title,content,...}) while StateManager/save_memory writes state records
 * ({key,value,timestamp}). ContextStorageManager.load() applied a blind cast to ContextEntry[]
 * and only filtered on project_path; state records (no project_path) passed the "legacy" rule,
 * reached searchEntries' filter, and its unguarded entry.title.toLowerCase()/entry.content
 * .toLowerCase() threw "Cannot read properties of undefined (reading 'toLowerCase')" — killing
 * EVERY search_context call once any save_memory record existed in the store.
 *
 * FIX UNDER TEST:
 *  - load() now requires structural context-entry shape (isContextEntry) before project filtering,
 *    so state records never reach any consumer.
 *  - searchEntries' filter uses typeof-guards on title/content/tags elements (defense-in-depth).
 *
 * Conventions: resetWorkingDir() in afterEach to clear persisted CWD state (see cwdConsistency.test.ts);
 * fixtures written to os.tmpdir so the repo's own .session_context is never touched.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { encode } from '@msgpack/msgpack';
import { ContextStorageManager } from '../src/tools/contextManagementTools';
import { getWorkingDir, setWorkingDir, resetWorkingDir } from '../src/workingDir';

// ==================== Fixture builders ====================

let seq = 0;

/** Well-formed context entry (the shape ContextEntry requires). */
function ctxEntry(overrides: Partial<{ title: string; content: string; tags?: string[]; type?: string }> = {}): Record<string, unknown> {
  return {
    id: `ctx_fixture_${++seq}`,
    timestamp: Date.now(),
    date: new Date().toLocaleString(),
    type: 'decision',
    title: overrides.title ?? 'Fixture Decision',
    content: overrides.content ?? 'Default fixture decision content.',
    tags: overrides.tags ?? ['fixture'],
  };
}

/** StateManager record — the shape save_memory writes ({key, value, timestamp}). */
function stateRecord(key: string, value: unknown): Record<string, unknown> {
  return { key, value, timestamp: Date.now() };
}

/** Write a mixed-shape msgpack fixture into the temp project dir. */
function writeFixture(tmpDir: string, records: Array<Record<string, unknown>>): void {
  const dir = path.join(tmpDir, '.session_context');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, '.ai_toolbox_memory.msgpack');
  fs.writeFileSync(file, encode(records));
}

// ==================== Tests ====================

describe('ContextStorageManager.searchEntries — mixed-shape store (FIX #15 regression)', () => {
  let tmpDir: string;

  beforeEach(() => {
    seq = 0;
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctxsearch-'));
    setWorkingDir(tmpDir);
  });

  afterEach(() => {
    resetWorkingDir(); // established convention — never leak CWD state between tests
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best-effort */ }
  });

  describe('live crash scenario (state records + context entries in one file)', () => {
    test('does not throw when store mixes StateManager records with context entries', async () => {
      writeFixture(tmpDir, [
        ctxEntry({ title: 'Smoke Test Decision', content: 'User confirmed the smoke test passed; cleanup authorized.', tags: ['smoke_test'] }),
        stateRecord('memory_100', 'Important fact'), // legacy bare-string value (the shape that crashed search)
        stateRecord('session_summary_latest', { task_description: 'Doc-sync session complete.', timestamp: Date.now(), date: '' }),
        ctxEntry({ title: 'Install Location', content: 'Plugin loads via .lmstudio/entry.ts — dist is ignored by the loader.' }),
      ]);

      const manager = new ContextStorageManager();
      let result;
      // 🔹 FIX (19.08.2026): the fixture intentionally contains ONE entry whose title+content match 'smoke test', so exactly one hit is correct — the old `results: []` contradicted both searchEntries' documented case-insensitive substring semantics and this test's own assertions below. Resolving without throwing + metadata are what FIX #15 protects.
      await expect(manager.searchEntries('smoke test')).resolves.toMatchObject({ isStale: false, confidence: 'INFERRED' });
      // The call above must have RESOLVED (pre-fix it REJECTED with the TypeError). Capture for assertions:
      result = await manager.searchEntries('smoke test');

      // State records are excluded from context consumers entirely...
      expect(result.results.every(r => typeof r.title === 'string' && typeof r.type === 'string')).toBe(true);

      // ...but real matching still works: query present in entry content is found.
      const hit = await manager.searchEntries('confirmed the smoke test passed');
      expect(hit.results).toHaveLength(1);
      expect((hit.results[0] as { title?: string }).title).toBe('Smoke Test Decision');

      // Query matching only inside a state record's value yields NO context results (by design —
      // memory facts are retrieved via get_memory, not search_context).
      const none = await manager.searchEntries('Important fact');
      expect(none.results).toHaveLength(0);
    });

    test('load() itself returns only structurally valid context entries', async () => {
      writeFixture(tmpDir, [
        ctxEntry({ title: 'A' }),
        stateRecord('memory_200', 'Important fact'),
        { key: 'session_summary_latest', value: null, timestamp: Date.now() }, // null-value state record
        { foo: 'bar' }, // arbitrary malformed record — must be dropped, not crash anything
      ]);

      const manager = new ContextStorageManager();
      const entries = await manager.load();
      expect(entries).toHaveLength(1);
      expect((entries[0] as { title?: string }).title).toBe('A');
    });
  });

  describe('searchEntries field guards (defense-in-depth, even if a malformed entry slipped past load())', () => {
    test('skips entries whose title/content/tags are missing or non-string without throwing', async () => {
      // Construct the manager, then bypass load() by feeding searchEntries' filter inputs directly
      // via a store that passes isContextEntry (id+timestamp+type present) but lacks title/content:
      const bare = {
        id: 'ctx_bare_1', timestamp: Date.now(), date: '', type: 'decision',
        tags: ['ok_tag', null, 42], // tag array with non-string elements
        // NO title, NO content — the exact fields searchEntries dereferences
      };
      const wellformed = ctxEntry({ title: 'Guard Probe', content: 'matchable content here' });

      writeFixture(tmpDir, [bare, wellformed]);

      const manager = new ContextStorageManager();
      // Pre-fix: first record (title undefined) → TypeError "Cannot read properties of undefined".
      let result;
      await expect(manager.searchEntries('matchable')).resolves.toBeDefined();
      result = await manager.searchEntries('matchable');
      expect(result.results).toHaveLength(1);
      expect((result.results[0] as { title?: string }).title).toBe('Guard Probe');

      // Tag matching still works for well-formed string tags...
      const tagHit = await manager.searchEntries('ok_tag');
      expect(tagHit.results.some(r => (r as { id?: string }).id === 'ctx_bare_1')).toBe(true);

      // ...and non-string tag elements are ignored, not fatal.
      const tagQuery = await manager.searchEntries('tag that no entry has');
      expect(Array.isArray(tagQuery.results)).toBe(true);
    });

    test('case-insensitive matching is preserved by the guards', async () => {
      writeFixture(tmpDir, [ctxEntry({ title: 'Smoke TEST decision', content: 'CONFIRMED in CHAT' })]);
      const manager = new ContextStorageManager();
      expect((await manager.searchEntries('smoke test')).results).toHaveLength(1);
      const caseHit = await manager.searchEntries('confirmed in chat');
      // 🔹 FIX (19.08.2026): 'CONFIRMED in CHAT'.toLowerCase() === query, so the entry MUST match — the old expected length 0 contradicted this test's own comment and searchEntries' case-insensitive substring semantics. Guards must filter shape, not matches.
      expect(caseHit.results).toHaveLength(1);
      expect((caseHit.results[0] as { title?: string }).title).toBe('Smoke TEST decision');
    });

    test('empty store and empty-ish behavior remain graceful', async () => {
      writeFixture(tmpDir, []); // valid msgpack: empty array
      const manager = new ContextStorageManager();
      const result = await manager.searchEntries('anything');
      expect(result.results).toHaveLength(0);
    });

    test('missing storage file resolves to an empty result set (no throw)', async () => {
      // No .session_context at all in tmpDir; plugin-root fallback also absent of context entries.
      const manager = new ContextStorageManager();
      const wdFile = path.join(getWorkingDir(), '.session_context', '.ai_toolbox_memory.msgpack');
      expect(fs.existsSync(wdFile)).toBe(false);

      let result;
      await expect(manager.searchEntries('anything')).resolves.toBeDefined();
      result = await manager.searchEntries('anything');
      expect(Array.isArray(result.results)).toBe(true);
    });
  });
});
