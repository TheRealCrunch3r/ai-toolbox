/**
 * Deterministic regression tests for two grep_files defects (22.08.2026 session):
 *
 *   FIX-G1 — matchGlob anchor bug: the glob→regex converter prepended "^" BEFORE its
 *            escape pass, so the escape regex turned the anchor into a LITERAL \^ character
 *            match. Every include pattern therefore matched nothing → grep_files(include=…)
 *            silently scanned 0 files with no skipped_files and no warning (indistinguishable
 *            from "no matches"). These tests pin the public-surface contract: which fixtures
 *            get scanned for a given include glob, including negative/anchoring cases.
 *
 *   FIX-G3 — non-configurable 5,000-line hard cap: index.d.ts (9,921 lines) was unsearchable
 *            no matter what max_file_size said. The line cap is now a parameter (max_lines,
 *            default MAX_LINES_PER_FILE=5000). These tests pin the gate boundary at exactly
 *            5,000 vs 5,001 lines (strict >), the skip-reporting contract (reason + warning),
 *            and that max_lines raises the cap.
 *
 * Approach: same pattern as tests/grep_files_size_limit.test.ts — registerFileSystemTools(...)
 * + .find(name === 'grep_files') + tool.implementation(args); direct in-process calls, no child
 * process, deterministic fixtures by construction (verified in beforeAll).
 */

import { describe, test, beforeAll, afterAll, expect } from '@jest/globals';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { registerFileSystemTools, MAX_LINES_PER_FILE } from '../src/tools/fileSystemTools.js';
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';

interface StubState extends Record<string, unknown> { workingDir?: string }

function makeConfig(_state: StubState): PluginConfig {
  return {} as unknown as PluginConfig;
}

interface GrepResult { success: boolean; data?: Record<string, any>; error?: string }

async function runGrep(state: StubState, args: Record<string, any>): Promise<GrepResult> {
  const tools = registerFileSystemTools(makeConfig(state), state as unknown as StateManager);
  const tool = tools.find((t) => t.name === 'grep_files');
  if (!tool) throw new Error('grep_files tool not registered (regression: tool registry changed?)');
  return await tool.implementation({ max_results: 50, max_content_length: 150, ...args } as any);
}

/** Extract the set of fixture filenames that produced at least one match. */
function matchedFiles(res: GrepResult): Set<string> {
  const matches = (res.data?.matches ?? []) as Array<{ file: string }>;
  return new Set(matches.map((m) => m.file.replace(/\\/g, '/').split('/').pop() as string));
}

describe('grep_files include-glob regression (FIX-G1)', () => {
  let testDir = '';
  const state: StubState = {};

  // Fixture layout (deterministic):
  //   a/one.ts       → MARKER_TS_A
  //   a/two.js       → MARKER_JS_A
  //   a/one.ts.bak   → MARKER_BAK          (anchoring negative for *.ts)
  //   b/three.txt    → MARKER_TXT_B
  //   c/d/deep.ts    → MARKER_DEEP         (nested, for ** patterns)
  const FIXTURES: Array<{ rel: string; marker: string }> = [
    { rel: path.join('a', 'one.ts'), marker: 'MARKER_TS_A' },
    { rel: path.join('a', 'two.js'), marker: 'MARKER_JS_A' },
    { rel: path.join('a', 'one.ts.bak'), marker: 'MARKER_BAK' },
    { rel: path.join('b', 'three.txt'), marker: 'MARKER_TXT_B' },
    { rel: path.join('c', 'd', 'deep.ts'), marker: 'MARKER_DEEP' },
  ];

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `matchglob_test_${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    for (const f of FIXTURES) {
      const p = path.join(testDir, f.rel);
      await fs.mkdir(path.dirname(p), { recursive: true });
      // Each marker on line 1 so any scan that reaches the file yields a match.
      await fs.writeFile(p, `${f.marker} marker on line one\npad_pad_x`);
    }
    state.workingDir = testDir;
  });

  afterAll(async () => {
    try { await fs.rm(testDir, { recursive: true, force: true }); } catch { /* best effort */ }
  });

  async function run(args: Record<string, any>): Promise<GrepResult> {
    const res = await runGrep(state, args);
    expect(res.success).toBe(true);
    if (res.error) throw new Error(`grep_files failed: ${res.error}`);
    return res;
  }

  test('FIX-G1 core regression: include="*.ts" scans exactly the .ts fixtures', async () => {
    // BEFORE the fix this returned filesScanned=0 and zero matches for EVERY pattern —
    // silently. Now the basename glob must match both .ts fixtures (incl. nested deep.ts)
    // and nothing else.
    const res = await run({ pattern: 'MARKER', path: testDir, mode: 'regex', include: '*.ts' });

    const files = matchedFiles(res);
    expect(files.has('one.ts')).toBe(true);
    expect(files).toContain('deep.ts');
    expect(files.has('two.js')).toBe(false);
    expect(files.has('three.txt')).toBe(false);
  });

  test('FIX-G1 anchoring: "*.ts" must NOT match "one.ts.bak"', async () => {
    const res = await run({ pattern: 'MARKER', path: testDir, mode: 'regex', include: '*.ts' });
    const files = matchedFiles(res);
    expect(files.has('one.ts.bak')).toBe(false);

    // …but a scan WITHOUT include finds the .bak marker (file itself is searchable).
    const res2 = await run({ pattern: 'MARKER_BAK', path: testDir, mode: 'regex' });
    expect(matchedFiles(res2).has('one.ts.bak')).toBe(true);
  });

  test('FIX-G1 multi-segment: include="**/*.js" matches nested .js only', async () => {
    const res = await run({ pattern: 'MARKER', path: testDir, mode: 'regex', include: '**/*.js' });
    const files = matchedFiles(res);
    expect(files.has('two.js')).toBe(true);
    expect(files.has('one.ts')).toBe(false);
  });

  test('FIX-G1 ? wildcard + explicit segments (a/o?e.ts → exactly one.ts)', async () => {
    // relPath "a/one.ts" vs glob "a/o?e.ts": ? must map to [^/] and match the single 'n';
    // the anchored full-path regex excludes every other fixture.
    const res = await run({ pattern: 'MARKER', path: testDir, mode: 'regex', include: 'a/o?e.ts' });
    expect(res.success).toBe(true);
    const files = matchedFiles(res);
    expect(files.has('one.ts')).toBe(true);
    expect(files.size).toBe(1);
  });

  test('no-include default scan still finds every fixture (no regression to the happy path)', async () => {
    const res = await run({ pattern: 'MARKER', path: testDir, mode: 'regex' });
    const files = matchedFiles(res);
    expect(files.has('one.ts')).toBe(true);
    expect(files.has('two.js')).toBe(true);
    expect(files.has('three.txt')).toBe(true);
    expect(files.has('deep.ts')).toBe(true);
  });

  test('include="*.tsx" matches nothing AND no match is invented (clean empty, filesScanned=0 allowed)', async () => {
    const res = await run({ pattern: 'MARKER', path: testDir, mode: 'regex', include: '*.tsx' });
    expect(res.success).toBe(true);
    expect(((res.data?.matches ?? []) as unknown[]).length).toBe(0);
  });
});

describe('grep_files line-cap gate (FIX-G3)', () => {
  let testDir = '';
  const state: StubState = {};

  const MARKER_5001 = 'LINEGATE_5001_MARKER_ON_LINE_ONE';
  const MARKER_5000 = 'LINEGATE_5000_MARKER_ON_LINE_ONE';

  // Deterministic fixtures by construction (verified in beforeAll):
  //   big_lines.txt : exactly MAX_LINES_PER_FILE + 1 (5,001) lines → default cap MUST skip it
  //   edge_lines.txt: exactly MAX_LINES_PER_FILE    (5,000) lines → gate is strict '>' → scanned
  let lines5001: string[];
  let lines5000: string[];

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `linecap_test_${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    const PAD = 'pad_pad_x'; // 9 B pad line (same convention as size_limit suite)
    lines5001 = [`${MARKER_5001} marker on line one`, ...new Array(MAX_LINES_PER_FILE).fill(PAD)]; // 5,001
    lines5000 = [`${MARKER_5000} marker on line one`, ...new Array(MAX_LINES_PER_FILE - 1).fill(PAD)]; // 5,000

    await fs.writeFile(path.join(testDir, 'big_lines.txt'), lines5001.join('\n'));
    await fs.writeFile(path.join(testDir, 'edge_lines.txt'), lines5000.join('\n'));

    // Hard-verify construction — fail loudly if the cap constant ever drifts.
    const readBack = (name: string) => fs.readFile(path.join(testDir, name), 'utf8').then((c) => c.split('\n'));
    expect((await readBack('big_lines.txt')).length).toBe(MAX_LINES_PER_FILE + 1);
    expect((await readBack('edge_lines.txt')).length).toBe(MAX_LINES_PER_FILE);
    state.workingDir = testDir;
  });

  afterAll(async () => {
    try { await fs.rm(testDir, { recursive: true, force: true }); } catch { /* best effort */ }
  });

  test('default cap (5,000): 5,001-line file is SKIPPED with line-limit reason + warning', async () => {
    // Common prefix matches BOTH fixtures (each file's marker is unique to it — probing one
    // file with the other's marker can never yield a match for that file):
    const res = await runGrep(state, { pattern: 'LINEGATE_', path: testDir, mode: 'regex' });
    expect(res.success).toBe(true);

    // The 5,000-line edge fixture must still be scanned (strict > gate) → its marker is found.
    const files = matchedFiles(res as GrepResult);
    expect(files.has('edge_lines.txt')).toBe(true);

    // …while the 5,001-line file is reported, not silent:
    const skipped = res.data?.skipped_files as Array<{ file: string; reason: string }> | undefined;
    expect(Array.isArray(skipped)).toBe(true);
    const bigSkip = (skipped ?? []).find((s) => s.file.replace(/\\/g, '/').includes('big_lines.txt'));
    expect(bigSkip).toBeDefined();
    if (bigSkip) {
      expect(bigSkip.reason).toMatch(/line limit/);
      expect(bigSkip.reason).toMatch(String(MAX_LINES_PER_FILE));
    }

    // 5,001-line marker is absent from matches (file never searched):
    expect(files.has('big_lines.txt')).toBe(false);
  });

  test('max_lines=6,000: both fixtures scanned, markers found, zero skips', async () => {
    const res = await runGrep(state, { pattern: 'LINEGATE_', path: testDir, mode: 'regex', max_lines: MAX_LINES_PER_FILE + 1_000 });
    expect(res.success).toBe(true);

    const files = matchedFiles(res as GrepResult);
    expect(files.has('big_lines.txt')).toBe(true);   // raised cap → previously unsearchable file is found
    expect(files.has('edge_lines.txt')).toBe(true);

    const skipped = res.data?.skipped_files as Array<unknown> | undefined;
    expect(skipped === undefined || skipped.length === 0).toBe(true);
  });

  test('schema: max_lines field exists with documented default (MAX_LINES_PER_FILE)', async () => {
    const tools = registerFileSystemTools(makeConfig(state), state as unknown as StateManager);
    const tool = tools.find((t) => t.name === 'grep_files');
    if (!tool) throw new Error('grep_files tool not registered');

    const schemaAny = (tool as unknown as { parametersSchema?: unknown }).parametersSchema as any;
    expect(typeof schemaAny?.safeParse).toBe('function');
    const shape: Record<string, any> | undefined =
      schemaAny.shape ?? (typeof schemaAny.unwrap === 'function' ? schemaAny.unwrap().shape : undefined);
    expect(shape).toBeDefined();
    if (shape) {
      expect(Object.prototype.hasOwnProperty.call(shape, 'max_lines')).toBe(true);
    }

    // Default applied by zod: omitting max_lines must resolve to MAX_LINES_PER_FILE.
    const parsed = schemaAny.safeParse({ pattern: 'x' });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect((parsed.data as any).max_lines).toBe(MAX_LINES_PER_FILE);
    }

    // Values below the documented minimum are rejected by the schema itself.
    const tooSmall = schemaAny.safeParse({ pattern: 'x', max_lines: 50 });
    expect(tooSmall.success).toBe(false);
  });
});


describe('grep_files exclude-glob regression (FIX-G4)', () => {
  let testDir = '';
  const state: StubState = {};

  // Same deterministic layout as the FIX-G1 suite (each marker on line 1):
  //   a/one.ts, a/two.js, a/one.ts.bak, b/three.txt, c/d/deep.ts
  const FIXTURES_G4: Array<{ rel: string; marker: string }> = [
    { rel: path.join('a', 'one.ts'), marker: 'MARKER_TS_A' },
    { rel: path.join('a', 'two.js'), marker: 'MARKER_JS_A' },
    { rel: path.join('a', 'one.ts.bak'), marker: 'MARKER_BAK' },
    { rel: path.join('b', 'three.txt'), marker: 'MARKER_TXT_B' },
    { rel: path.join('c', 'd', 'deep.ts'), marker: 'MARKER_DEEP' },
  ];

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `exclglob_test_${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    for (const f of FIXTURES_G4) {
      const p = path.join(testDir, f.rel);
      await fs.mkdir(path.dirname(p), { recursive: true });
      // Each marker on line 1 so any scan that reaches the file yields a match.
      await fs.writeFile(p, `${f.marker} marker on line one\npad_pad_x`);
    }
    state.workingDir = testDir;
  });

  afterAll(async () => {
    try { await fs.rm(testDir, { recursive: true, force: true }); } catch { /* best effort */ }
  });

  test('exclude="*.bak": glob now excludes the .bak fixture (before FIX-G4 the substring check excluded nothing)', async () => {
    // BEFORE: entry.name.includes("*.bak") was always false (literal '*' char) → one.ts.bak got scanned.
    const res = await runGrep(state, { pattern: 'MARKER', path: testDir, mode: 'regex', exclude: '*.bak' });
    expect(res.success).toBe(true);
    const files = matchedFiles(res as GrepResult);
    expect(files.has('one.ts.bak')).toBe(false);   // excluded by glob
    expect(files.has('one.ts')).toBe(true);        // sibling unaffected
    expect(files.has('two.js')).toBe(true);
    expect(files.has('three.txt')).toBe(true);
    expect(files.has('deep.ts')).toBe(true);
  });

  test('exclude="one.ts" is an EXACT glob: one.ts excluded, but one.ts.bak NOT (substring over-match removed)', async () => {
    // BEFORE: name.includes("one.ts") also skipped "one.ts.bak"; now only the exact basename matches.
    const res = await runGrep(state, { pattern: 'MARKER', path: testDir, mode: 'regex', exclude: 'one.ts' });
    expect(res.success).toBe(true);
    const files = matchedFiles(res as GrepResult);
    expect(files.has('one.ts')).toBe(false);
    expect(files.has('one.ts.bak')).toBe(true);
  });

  test('exclude="c" prunes an entire directory subtree (deep.ts gone, siblings kept)', async () => {
    const res = await runGrep(state, { pattern: 'MARKER', path: testDir, mode: 'regex', exclude: 'c' });
    expect(res.success).toBe(true);
    const files = matchedFiles(res as GrepResult);
    expect(files.has('deep.ts')).toBe(false);      // whole c/ subtree pruned at the directory level
    expect(files.has('one.ts')).toBe(true);
    expect(files.has('three.txt')).toBe(true);
  });

  test('include + exclude compose: include="*.ts", exclude="deep.ts" → exactly a/one.ts remains', async () => {
    const res = await runGrep(state, { pattern: 'MARKER', path: testDir, mode: 'regex', include: '*.ts', exclude: 'deep.ts' });
    expect(res.success).toBe(true);
    const files = matchedFiles(res as GrepResult);
    expect(files.has('one.ts')).toBe(true);
    expect(files.has('deep.ts')).toBe(false);
    expect(files.size).toBe(1);
  });
});

describe('find_replace_all line-cap gate (FIX-G3b)', () => {
  let testDir = '';
  const state: StubState = {};

  const MARKER_FR_5001 = 'FRLINE_5001_MARKER_ON_LINE_ONE';
  const MARKER_FR_5000 = 'FRLINE_5000_MARKER_ON_LINE_ONE';

  // Deterministic fixtures by construction (verified in beforeAll):
  //   big_lines.ts : exactly MAX_LINES_PER_FILE + 1 (5,001) lines → default cap MUST report it in "skipped"
  //   edge_lines.ts: exactly MAX_LINES_PER_FILE    (5,000) lines → gate is strict '>' → processed
  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `frcap_test_${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    const PAD = 'pad_pad_x'; // 9 B pad line (same convention as the other suites)
    const lines5001 = [`${MARKER_FR_5001} marker on line one`, ...new Array(MAX_LINES_PER_FILE).fill(PAD)];   // 5,001
    const lines5000 = [`${MARKER_FR_5000} marker on line one`, ...new Array(MAX_LINES_PER_FILE - 1).fill(PAD)]; // 5,000

    await fs.writeFile(path.join(testDir, 'big_lines.ts'), lines5001.join('\n'));
    await fs.writeFile(path.join(testDir, 'edge_lines.ts'), lines5000.join('\n'));

    // Hard-verify construction — fail loudly if the cap constant ever drifts.
    const readBack = (name: string) => fs.readFile(path.join(testDir, name), 'utf8').then((c) => c.split('\n'));
    expect((await readBack('big_lines.ts')).length).toBe(MAX_LINES_PER_FILE + 1);
    expect((await readBack('edge_lines.ts')).length).toBe(MAX_LINES_PER_FILE);
    state.workingDir = testDir;
  });

  afterAll(async () => {
    try { await fs.rm(testDir, { recursive: true, force: true }); } catch { /* best effort */ }
  });

  async function runReplace(args: Record<string, any>): Promise<GrepResult> {
    const tools = registerFileSystemTools(makeConfig(state), state as unknown as StateManager);
    const tool = tools.find((t) => t.name === 'find_replace_all');
    if (!tool) throw new Error('find_replace_all tool not registered (regression: tool registry changed?)');
    return await tool.implementation({ directory: testDir, dry_run: true, ...args } as any);
  }

  test('default cap (5,000): 5,001-line file lands in "skipped" with line-limit reason; 5,000-line file processed', async () => {
    const res = await runReplace({ pattern: 'FRLINE_' });
    expect(res.success).toBe(true);

    // The edge fixture must have been PROCESSED (strict > gate) → present in "files" with matches.
    const filesArr = (res.data?.files ?? []) as Array<{ file: string; matches: number }>;
    const byName = new Set(filesArr.map((f) => f.file.replace(/\\/g, '/').split('/').pop() as string));
    expect(byName.has('edge_lines.ts')).toBe(true);

    // …while the 5,001-line file is reported in "skipped", not silent:
    const skipped = res.data?.skipped as Array<{ file: string; reason: string }> | undefined;
    expect(Array.isArray(skipped)).toBe(true);
    const bigSkip = (skipped ?? []).find((s) => s.file.replace(/\\/g, '/').includes('big_lines.ts'));
    expect(bigSkip).toBeDefined();
    if (bigSkip) {
      expect(bigSkip.reason).toMatch(/line limit/);
      expect(bigSkip.reason).toMatch(String(MAX_LINES_PER_FILE));
    }

    // 5,001-line marker never reached the replace pipeline:
    expect(byName.has('big_lines.ts')).toBe(false);
  });

  test('max_lines=6,000: both fixtures processed (previously-unprocessable file becomes reachable), zero skips', async () => {
    const res = await runReplace({ pattern: 'FRLINE_', max_lines: MAX_LINES_PER_FILE + 1_000 });
    expect(res.success).toBe(true);

    const filesArr = (res.data?.files ?? []) as Array<{ file: string; matches: number }>;
    const byName = new Set(filesArr.map((f) => f.file.replace(/\\/g, '/').split('/').pop() as string));
    expect(byName.has('big_lines.ts')).toBe(true);   // raised cap → previously unreachable file is processed
    expect(byName.has('edge_lines.ts')).toBe(true);

    const skipped = res.data?.skipped as Array<unknown> | undefined;
    expect(skipped === undefined || skipped.length === 0).toBe(true);
  });

  test('schema: max_lines exists with documented default (MAX_LINES_PER_FILE) and rejects values below min(100)', async () => {
    const tools = registerFileSystemTools(makeConfig(state), state as unknown as StateManager);
    const tool = tools.find((t) => t.name === 'find_replace_all');
    if (!tool) throw new Error('find_replace_all tool not registered');

    const schemaAny = (tool as unknown as { parametersSchema?: unknown }).parametersSchema as any;
    expect(typeof schemaAny?.safeParse).toBe('function');

    // Default applied by zod: omitting max_lines must resolve to MAX_LINES_PER_FILE.
    const parsed = schemaAny.safeParse({ pattern: 'x' });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect((parsed.data as any).max_lines).toBe(MAX_LINES_PER_FILE);
    }

    // Values below the documented minimum are rejected by the schema itself.
    const tooSmall = schemaAny.safeParse({ pattern: 'x', max_lines: 50 });
    expect(tooSmall.success).toBe(false);
  });
});
