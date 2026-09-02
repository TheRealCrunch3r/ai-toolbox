/**
 * P3-G8 — AST-mode SMOKE test for grep_files (closes the existing coverage gap: tests/grep_files.test.ts
 * exercises regex mode only, and the Option A engine swap must leave `mode:'ast'` byte-for-byte intact).
 *
 * Scope is deliberately SMOKE-level, not a searchAST semantics re-implementation: prove that through the
 * real registerFileSystemTools wiring (same shim as tests/grep_files.test.ts L51), mode:'ast'
 *   1. executes without crashing and returns structurally valid match entries,
 *   2. is case-insensitive at the query level (patternLower in searchAST),
 *   3. resolves module-name import queries to ImportDeclaration nodes with node_type tagging,
 *   4. degrades gracefully on unparseable files → per-file regex fallback (no crash, plain matches).
 *
 * Single-FILE targets are used throughout: deterministic (no walker concurrency scheduling), and they also
 * pin that AST mode never triggers the ripgrep phase-1 prefilter (production guard is `mode === 'regex' &&
 * targetStats.isDirectory()`, fileSystemTools.ts L2746 — AST on a directory would be an untested path, so
 * this suite does not claim it either).
 */

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('grep_files mode:"ast" smoke (P3-G8 coverage gap closer)', () => {
  let tools: ReturnType<typeof registerFileSystemTools>;
  let testDir: string;

  const TS_SOURCE = [
    `/** Finds the widget by id. */`,
    `export function findWidget(id: number): string {`,
    `  return \`widget-\${id}\`;`,
    `}`,
    ``,
    `const lookupAsync = (q: string) => Promise.resolve(q.toUpperCase());`,
    ``,
    `class WidgetRegistry {`,
    `  register(name: string) {`,
    `    return name;`,
    `  }`,
    `}`,
    ``,
    `export default findWidget;`,
  ].join('\n');

  const FALLBACK_MARKER = 'HELLO_FROM_FALLBACK_31415';

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `grep-ast-smoke-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(path.join(testDir, 'widgets.ts'), TS_SOURCE);
    // Not parseable as code → AST parse must fail for this file and the regex fallback path must serve it.
    await fs.writeFile(
      path.join(testDir, 'notes.txt'),
      `plain prose line one\n${FALLBACK_MARKER} — marker in non-code text\nthird line\n`
    );

    tools = registerFileSystemTools({} as PluginConfig, {} as StateManager);
  });

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Cleanup failed:', e);
    }
  });

  const getGrepTool = () => tools.find((t) => t.name === 'grep_files');

  type MatchEntry = { file: string; line_number: number; content: string; node_type?: string };

  test('function-query on a real TS file → valid entries, every one carrying node_type', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'function',
      path: path.join(testDir, 'widgets.ts'), // single-file target — deterministic, no walker involved
      mode: 'ast',
      include_context: false,
      max_content_length: 150,
      max_file_size: 100_000,
      max_results: 20,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const data = result.data as { mode?: string; patternMode?: string; count: number; matches: MatchEntry[] };
    expect(data.mode).toBe('ast'); // payload reports the executed mode (AST path is untouched by the engine swap)
    expect(Array.isArray(data.matches)).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(1);

    const totalLines = TS_SOURCE.split('\n').length;
    data.matches.forEach((m) => {
      expect(typeof m.file).toBe('string');
      expect(m.file.replace(/\\/g, '/')).toContain('widgets.ts'); // single-file target reports the basename (path.join-safe on win32 too)
      expect(Number.isInteger(m.line_number)).toBe(true);
      expect(m.line_number).toBeGreaterThanOrEqual(1);
      expect(m.line_number).toBeLessThanOrEqual(totalLines); // line number is real, not a parser artifact
      expect(typeof m.content).toBe('string');
      expect(m.content.length).toBeGreaterThan(0); // an entry with no source text at all would be meaningless
      expect(typeof m.node_type === 'string').toBe(true); // node_type tagging present (smoke: structural matches are tagged)
    });
  });

  test('AST queries are case-insensitive at the query level ("FUNCTION" ≡ "function")', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const common = { path: path.join(testDir, 'widgets.ts'), mode: 'ast' as const, include_context: false, max_content_length: 150, max_file_size: 100_000, max_results: 20 };

    const lower = await grepTool.implementation({ ...common, pattern: 'function' });
    const upper = await grepTool.implementation({ ...common, pattern: 'FUNCTION' });

    expect(lower.success).toBe(true);
    expect(upper.success).toBe(true);
    if (lower.success && upper.success) {
      const key = (m: MatchEntry) => `${m.file}:${m.line_number}`;
      const a = ((lower.data as { matches: MatchEntry[] }).matches).map(key).sort();
      const b = ((upper.data as { matches: MatchEntry[] }).matches).map(key).sort();
      expect(b).toEqual(a); // searchAST lowercases the pattern — byte-identical (file,line) sets required
    }
  });

  test('module-name query resolves to ImportDeclaration-tagged match', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // Fresh fixture so this case is self-contained (no cross-test file mutation).
    const importFile = path.join(testDir, 'imports.ts');
    await fs.writeFile(importFile, `import { alpha } from 'alpha-lib';\nexport const beta = 1;\n`);
    try {
      const result = await grepTool.implementation({
        pattern: "'alpha-lib'",
        path: importFile,
        mode: 'ast',
        include_context: false,
        max_content_length: 150,
        max_file_size: 100_000,
        max_results: 20,
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      const matches = (result.data as { matches: MatchEntry[] }).matches;
      expect(matches.length).toBeGreaterThanOrEqual(1);
      const importMatch = matches.find((m) => m.node_type === 'ImportDeclaration');
      expect(importMatch).toBeDefined(); // module-name query path is live and tagged
      expect((importMatch!.content ?? '').toLowerCase()).toContain('alpha-lib');
    } finally {
      await fs.unlink(importFile).catch(() => undefined);
    }
  });

  test('unparseable file degrades to per-file regex fallback (no crash, no node_type on those entries)', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: FALLBACK_MARKER,
      path: path.join(testDir, 'notes.txt'), // .txt — AST parse fails → processWithRegex fallback (L2410-2412)
      mode: 'ast',
      include_context: false,
      max_content_length: 150,
      max_file_size: 100_000,
      max_results: 20,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const matches = (result.data as { matches: MatchEntry[] }).matches;
    expect(matches.length).toBeGreaterThanOrEqual(1); // the marker WAS found — via the regex fallback path
    const m = matches.find((x) => x.content.includes(FALLBACK_MARKER));
    expect(m).toBeDefined();
    // Fallback-path entries carry no AST tagging (processWithRegex never sets node_type):
    for (const entry of matches) {
      expect(entry.node_type).toBeUndefined();
    }
  });

  test('AST mode + include_context:true runs without error and preserves the entry shape', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'function',
      path: path.join(testDir, 'widgets.ts'),
      mode: 'ast',
      include_context: true, // exercises the context-branching payload assembly (L2429-2435) without asserting its content depth
      max_content_length: 150,
      max_file_size: 100_000,
      max_results: 20,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const matches = (result.data as { matches: Array<MatchEntry & { context?: object }> }).matches;
    expect(matches.length).toBeGreaterThanOrEqual(1);
    for (const entry of matches) {
      // If a context object is present it must be an object, never a stringified/undefined garbage value.
      if ('context' in entry && entry.context !== undefined) {
        expect(typeof entry.context).toBe('object');
        expect(entry.context).not.toBeNull();
      }
    }
  });
});
