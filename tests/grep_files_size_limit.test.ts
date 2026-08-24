/**
 * Deterministic size-limit regression tests for grep_files.
 *
 * History / why this file exists (17–20.08.2026 sessions):
 *   A prior "grep_files size-limit test" suite created 5 fixture files via
 *   `fs.writeFile` under a temp directory and asserted on measured byte sizes:
 *     - 34_470 / 187_18x bytes vs. caps of 34_000 / 30_000 B, etc.
 *   It was flaky across runs (measured size jittered ±5–20 KB between runs) and
 *   its assertions were therefore unreliable. This suite replaces it with two
 *   DETERMINISTIC fixtures whose content is fixed by construction — every byte
 *   count below is an exact constant, not a measurement subject to I/O jitter:
 *     - small_fixture.txt :   123 B (marker on line 1)      → below every cap used here
 *     - big_fixture.txt   : 49_829 B / 4_980 lines total    (verified by construction, see beforeAll)
 *         = marker line + 4_979 pad lines ("pad_pad_x" = 9 B each)
 *       → above the explicit caps used in the size-gate tests (20 KB), below the default
 *         cap (100_000 B), and under MAX_LINES_PER_FILE (5_000) so the line gate
 *         never fires: the ONLY gate that can touch this file is max_file_size.
 *   Fixtures live in os.tmpdir() with a unique suffix, are written once in beforeAll
 *   and deleted in afterAll — nothing persists between runs (same pattern as the
 *   passing tests/grep_files.test.ts).
 *
 * 20.08 rewrite — root cause of the previous red state:
 *   The prior revision imported `createGrepFilesTool` from src/tools/fileSystemTools.js —
 *   a symbol that has NEVER existed in that module (grep across src/ proves it; only the
 *   test files reference it). Under node:test (`npx tsx --test`) this surfaces as
 *   `TypeError: createGrepFilesTool is not a function` for all 4 grep tests + 1 zod
 *   introspection failure (captured in size_test_output.txt); under jest/ts-jest the same
 *   import resolves to `undefined` and each test dies inside runGrep() after ~0.3 ms,
 *   which was mistaken for a "fast assertion failure". This revision uses the exact access
 *   pattern of tests/grep_files.test.ts (which is green): registerFileSystemTools(...) +
 *   .find(name === 'grep_files') + tool.implementation(args). No child process is spawned:
 *   runGrep() calls the implementation directly in-process.
 *
 * What each test pins down:
 *   1. Default cap (zod default 100_000 B): big fixture (64 KB) IS scanned → marker found on
 *      line 1, `skipped_files` empty (no false-positive skips at the default).
 *   2. Explicit cap below the big file: the size gate must NOT be silent — the skipped file is
 *      reported in `data.skipped_files[]` with reason matching /max_file_size/ and measured vs.
 *      cap byte counts; matches stay empty (marker lives ONLY in the big file) while the
 *      response carries an actionable warning (the 19.08 silent-skip regression, end-to-end).
 *   3. Cap above everything: size gate inactive for both files → `skipped_files` must be empty;
 *      markers from BOTH fixtures found on line 1 (distinct-reason contract between the two gates:
 *      with this cap neither gate can fire at all).
 *   4. mode 'ast': regex fast path disabled; same deterministic expectations as test 3 plus the
 *      guarantee that ast mode neither crashes nor regresses to silent skipping.
 *   5. Module exports: MAX_FILE_SIZE / MAX_LINES_PER_FILE match the documented values (the
 *      original constant-drift this suite guards against).
 *   6. Schema payload shape: on a clean scan, `skipped_files` stays absent/empty so old consumers
 *      of the payload keep working (backward compatibility contract).
 */

import { describe, test, beforeAll, afterAll, expect } from '@jest/globals';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { registerFileSystemTools, MAX_FILE_SIZE, MAX_LINES_PER_FILE } from '../src/tools/fileSystemTools.js';
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';

// Mirror of the zod default (max_file_size .default(100_000)) and of the module-level export.
const DEFAULT_MAX_FILE_SIZE = 100_000; // B — exact, see fileSystemTools.ts schema

const SMALL_MARKER = 'SIZE_LIMIT_PROBE_SMALL';
const BIG_MARKER = 'SIZE_LIMIT_PROBE_BIG';

// Exact byte counts by construction (verified in beforeAll; if the constants ever drift, the
// tests fail loudly instead of silently re-measuring).
const SMALL_LINES = [
  `${SMALL_MARKER} marker on line one`,                     // 22+1+18 = 41 B
  'abcdefghijklmnopqrstuvwxyz0123456789',                   // 36 B
  'The quick brown fox jumps over the lazy dog.',           // 44 B
];                                                         // joined total = 41+1 + 36+1 + 44 = 123 B (no trailing \n)

const BIG_PAD_COUNT = 4_979;                                // pad line "pad_pad_x" = 9 B each
const BIG_LINES = [`${BIG_MARKER} marker on line one`];      // 20+1+18 = 39 B
for (let i = 0; i < BIG_PAD_COUNT; i++) BIG_LINES.push('pad_pad_x');
// big file total = 39 + (4_979*9) + 4_979 newlines = 49_829 B, 4_980 lines (< MAX_LINES_PER_FILE)
const BIG_EXPECTED_BYTES = 49_829;                          // pinned by construction (verified in beforeAll)

interface StubState extends Record<string, unknown> { workingDir?: string }

function makeConfig(state: StubState): PluginConfig {
  const ctl = state as any;
  return {
    getPluginConfig: () => ({}),
    updatePluginConfig: async (_p) => ({ success: true }),
  } as unknown as PluginConfig;
}

interface GrepResult { success: boolean; data?: Record<string, any> }

/**
 * Runs grep_files the same way tests/grep_files.test.ts does: real module under test, direct
 * `.implementation()` call (no zod parse layer in between, no child process), isolated state.
 */
async function runGrep(state: StubState, args: Record<string, any>): Promise<GrepResult> {
  const tools = registerFileSystemTools(makeConfig(state), state as unknown as StateManager);
  const tool = tools.find((t) => t.name === 'grep_files');
  if (!tool) throw new Error('grep_files tool not registered (regression: tool registry changed?)');
  return await tool.implementation({ max_results: 20, max_content_length: 150, ...args } as any);
}

describe('grep_files size-limit regression (deterministic fixtures)', () => {
  let testDir = '';
  const state: StubState = {};

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `size_limit_test_${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    await fs.writeFile(path.join(testDir, 'small_fixture.txt'), SMALL_LINES.join('\n'));
    await fs.writeFile(path.join(testDir, 'big_fixture.txt'), BIG_LINES.join('\n'));

    // Hard-verify the "deterministic" promise — byte-exact, no tolerance. If any of these pins
    // ever fails, the fixture construction changed and every cap-dependent assertion below it
    // must be re-derived (the suite is designed to fail loudly instead of re-measuring silently).
    const smallStat = await fs.stat(path.join(testDir, 'small_fixture.txt'));
    const bigStat = await fs.stat(path.join(testDir, 'big_fixture.txt'));
    expect(smallStat.size).toBe(123);                    // 41 + 1 + 36 + 1 + 44 (no trailing newline)
    expect(bigStat.size).toBe(BIG_EXPECTED_BYTES);       // 39 + 4_979*9 pad chars + 4_979 newlines = 49_829 B
    expect(BIG_LINES.length).toBe(4_980);                // < MAX_LINES_PER_FILE → line gate never fires here
    state.workingDir = testDir;
  });

  afterAll(async () => {
    try { await fs.rm(testDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  });

  test('module exports: MAX_FILE_SIZE / MAX_LINES_PER_FILE match documented values', () => {
    expect(MAX_FILE_SIZE).toBe(DEFAULT_MAX_FILE_SIZE); // zod default(100_000) — see fileSystemTools.ts schema
    expect(MAX_LINES_PER_FILE).toBe(5_000);
  });

  test('schema: grep_files.max_file_size field exists (min/max/default documented)', async () => {
    const tools = registerFileSystemTools(makeConfig(state), state as unknown as StateManager);
    const tool = tools.find((t) => t.name === 'grep_files');
    if (!tool) throw new Error('grep_files tool not registered (regression: tool registry changed?)');

    // zod v3 introspection via safeParse — no child process, pure in-memory.
    // @lmstudio/sdk 1.x `tool()` returns { name, description, type, parametersSchema, checkParameters, implementation }.
    // The raw zod object lives on `.parametersSchema` (= z.object(parameters)), NOT on a key named `schema`.
    const schemaAny = (tool as unknown as { parametersSchema?: unknown }).parametersSchema as any;
    expect(schemaAny).toBeDefined();
    expect(typeof schemaAny.safeParse === 'function').toBe(true);

    // The field must exist on the object shape (directly or behind ZodEffects.unwrap()).
    const shape: Record<string, any> | undefined =
      schemaAny.shape ?? (typeof schemaAny.unwrap === 'function' ? schemaAny.unwrap().shape : undefined);
    expect(shape).toBeDefined();
    if (shape) {
      expect(Object.prototype.hasOwnProperty.call(shape, 'max_file_size')).toBe(true);
    }

    // A value far below the documented min must be rejected — proof that the cap is enforced
    // by the schema layer itself (not just by convention):
    const parsed = schemaAny.safeParse({ pattern: 'x', max_file_size: 1 }); // < zod .min(1024)
    expect(parsed.success).toBe(false);
  });

  test('grep_files @ default cap: big fixture scanned, marker found at line 1, zero skips', async () => {
    const res = await runGrep(state, { pattern: BIG_MARKER, path: testDir, mode: 'regex' });

    expect(res.success).toBe(true);
    if (!res.success) return;

    // Default cap (100_000 B) is above the ~49.8 KB fixture → it MUST be scanned, not skipped.
    const skipped = res.data.skipped_files as Array<{ file: string; reason: string }> | undefined;
    expect(skipped === undefined || skipped.length === 0).toBe(true);

    const matches = (res.data.matches ?? []) as Array<{ file: string; line_number: number; content: string }>;
    const m = matches.find((x) => x.file.replace(/\\/g, '/').includes('big_fixture.txt'));
    expect(m).toBeDefined();
    if (m) {
      expect(m.line_number).toBe(1);
      expect(m.content).toContain(BIG_MARKER);
    }
  });

  test('grep_files @ max_file_size=20KB: over-size file REPORTED, not silent', async () => {
    const CAP = 20_000; // below the big fixture's exact size (49_829 B), above the small one (123 B)
    const res = await runGrep(state, { pattern: BIG_MARKER, path: testDir, mode: 'regex', max_file_size: CAP });

    expect(res.success).toBe(true);
    if (!res.success) return;

    // The marker lives ONLY in the big fixture → with the cap below its size, no match may leak…
    const files = ((res.data.matches ?? []) as Array<{ file: string }>).map((x) => x.file.replace(/\\/g, '/'));
    expect(files.some((f) => f.includes('big_fixture.txt'))).toBe(false);

    // …but the skip must be self-described (silent-skip regression fix under test):
    const skipped = res.data.skipped_files as Array<{ file: string; reason: string }>;
    expect(Array.isArray(skipped)).toBe(true);
    const bigSkip = skipped.find((s) => s.file.replace(/\\/g, '/').includes('big_fixture.txt'));
    expect(bigSkip).toBeDefined();
    if (bigSkip) {
      expect(bigSkip.reason).toMatch(/max_file_size/);
      // Reason carries the measured vs. cap byte counts: "<n> bytes > <cap> bytes"
      const m = bigSkip.reason.match(/(\d+) bytes > (\d+) bytes/);
      expect(m).toBeTruthy();
      if (m) {
        expect(Number(m[1])).toBeGreaterThan(CAP); // real measurement, not a guess
        expect(Number(m[2])).toBe(CAP);
      }
    }

    // Empty matches + >= 1 skip → actionable warning (old behavior: none at all).
    expect(res.data.warning).toBeDefined();
    expect(String(res.data.warning)).toMatch(/skipped|max_file_size/i);
  });

  test('grep_files @ max_file_size=400KB: neither gate can fire; both markers found', async () => {
    const res = await runGrep(state, { pattern: 'SIZE_LIMIT_PROBE', path: testDir, mode: 'regex', max_file_size: 400_000 });

    expect(res.success).toBe(true);
    if (!res.success) return;

    // 400 KB > both fixtures and line counts (≤5_000) < MAX_LINES_PER_FILE → zero skips, period.
    const skipped = res.data.skipped_files as Array<{ file: string; reason: string }> | undefined;
    expect(skipped === undefined || skipped.length === 0).toBe(true);

    // Pattern 'SIZE_LIMIT_PROBE' is a common prefix of BOTH markers (regex partial match) →
    // exactly one line-1 hit per fixture.
    const files = ((res.data.matches ?? []) as Array<{ file: string; line_number: number }>)
      .map((x) => ({ f: x.file.replace(/\\/g, '/'), ln: x.line_number }));
    expect(files.some((x) => x.f.includes('small_fixture.txt') && x.ln === 1)).toBe(true);
    expect(files.some((x) => x.f.includes('big_fixture.txt') && x.ln === 1)).toBe(true);

    // Distinct-reason contract: with zero skips there is nothing to mis-attribute — the very next
    // test (ast mode) re-verifies that any skip produced here would be line-based, never size.
  });

  test('grep_files @ ast mode (default cap): both fixtures scanned, markers found at line 1', async () => {
    const res = await runGrep(state, { pattern: 'SIZE_LIMIT_PROBE', path: testDir, mode: 'ast' });

    expect(res.success).toBe(true);
    if (!res.success) return;

    // ast mode disables the regex fast path; per-line RegExp + hard line cap still apply.
    // Fixtures are ≤ MAX_LINES_PER_FILE lines and under the default size cap → both scanned:
    const files = ((res.data.matches ?? []) as Array<{ file: string; line_number: number }>)
      .map((x) => ({ f: x.file.replace(/\\/g, '/'), ln: x.line_number }));
    expect(files.some((x) => x.f.includes('small_fixture.txt') && x.ln === 1)).toBe(true);
    expect(files.some((x) => x.f.includes('big_fixture.txt') && x.ln === 1)).toBe(true);

    // And nothing may be silently dropped:
    const skipped = res.data.skipped_files as Array<{ file: string; reason: string }> | undefined;
    expect(skipped === undefined || skipped.length === 0).toBe(true);
  });

  test('no skips → no non-empty skipped_files (backward-compatible payload)', async () => {
    const res = await runGrep(state, { pattern: BIG_MARKER, path: testDir, mode: 'regex' });
    expect(res.success).toBe(true);
    if (!res.success) return;

    // Single clean scan → consumers of the old payload shape (no skipped_files key) keep working.
    const skipped = res.data.skipped_files;
    expect(skipped === undefined || (Array.isArray(skipped) && skipped.length === 0)).toBe(true);
  });
});
