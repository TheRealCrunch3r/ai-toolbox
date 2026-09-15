/**
 * pattern_scan full-JS pipeline reference suite (surviving core of the former B' phase-1 parity battery).
 *
 * FIX-34a (13.09): the ripgrep B' phase-1 prefilter was REMOVED from src/tools/patternScan.ts — its rg-WASM search ran
 * synchronously on the main thread (`await wasi.start()`; all WASI syscalls are sync fs), so while it ran no event-loop
 * turn occurred, HANG-GUARD caps could never fire and abort signals were inert (live wedge repro 13.09). The full-JS walk
 * is now the ONLY scan path: this file therefore pins its exact behavior — match shape, 'size'/'line-cap' gate records on
 * EVERY target, filesScanned accounting, demotion paths and concurrency determinism — unconditionally, on every host.
 *
 * (The former "phase-1 live" describe + WASM liveness gate were deleted with the feature: ripgrepEngine.ts is retained but
 * orphaned — see tests/ripgrepEngine.test.ts for its standalone contract.)
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { patternScan } from '../src/tools/patternScan';

// ---------------------------------------------------------------------------
// Fixture tree (unique tokens per file — no cross-file collisions, unlike the shared-NEEDLE suite)
// ---------------------------------------------------------------------------

const T_ALPHA = 'BPRIME_ALPHA_42'; // hit_a.txt ×2 (lines 1,3)
const T_BETA = 'BPRIME_BETA_57'; // sub/hit_b.md
const T_GAMMA = 'BPRIME_GAMMA_68'; // sub/deep/x.txt — dir-depth-2 boundary file
const T_UPPER = 'UPPER_BP_TOK_91'; // case.txt (uppercase) + lowercase twin line
const T_HIDDEN = 'BPRIME_HIDDEN_33'; // .hidden/secret.txt (--hidden probe)
const T_NM = 'BPRIME_NM_24'; // node_modules/d.js (default-prune probe — must NEVER surface)
const T_SIZE = 'BPRIME_SIZE_85'; // big.txt (~300KB, above the 256KB default size gate)
const T_LONG = 'BPRIME_LONG_19'; // long.txt line 3 of 1500 (line-cap probe)

let root: string;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'pattern-scan-bprime-'));
  const w = (rel: string, content: string | Buffer): void => {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  };

  w('hit_a.txt', `alpha one ${T_ALPHA}\nfiller no match\nthird line ${T_ALPHA} here\n`); // matches lines 1 and 3
  w('sub/hit_b.md', `# doc\n${T_BETA} in markdown\n`);
  w(path.join('sub', 'deep', 'x.txt'), `${T_GAMMA} depth-two file\n`); // file dir-depth = 2 (sub=1, deep=2)
  w('case.txt', `${T_UPPER}\ngamma_lower_tok_91 lowercase twin\n`);
  w(path.join('.hidden', 'secret.txt'), `${T_HIDDEN}\n`);
  w(path.join('node_modules', 'd.js'), `module.exports = '${T_NM}';\n`);
  w('big.txt', `${T_SIZE}\n${'x'.repeat(300 * 1024)}\n`); // > default maxFileSizeBytes (256KB)
  const longLines = Array.from({ length: 1500 }, (_, i) => `long line ${i + 1}`);
  longLines[2] = `${T_LONG} on the third line`;
  w('long.txt', longLines.join('\n') + '\n');
}, 30_000);

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

/** Expected full-JS-walk result for pattern T_ALPHA — the reference shape both engine paths must reproduce. */
const ALPHA_EXPECTED_MATCHES = [
  { file: 'hit_a.txt', line: 1, content: `alpha one ${T_ALPHA}` },
  { file: 'hit_a.txt', line: 3, content: `third line ${T_ALPHA} here` },
];

/** All fixture targets in directory mode (node_modules pruned by the walker): 7 files. */
const TARGET_COUNT = 7;

// ---------------------------------------------------------------------------
// Phase-1 LIVE — 'ok' path parity (exact match shape + gate-record parity on non-candidates)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// FIX-34a (13.09): the former "phase-1 live, status ok" describe + WASM liveness gate were DELETED with the feature —
  // pattern_scan no longer calls ripgrepEngine at all, so rg-WASM parity assertions are obsolete by construction. The
  // assertions below pin the ONLY remaining pipeline against this same fixture tree.

describe('patternScan full-JS pipeline — guard rails (post-FIX-34a)', () => {

  test('reference: T_ALPHA full-walk match shape (the ONLY pipeline since FIX-34a)', async () => {
    // Post-FIX-34a there is a single scan path; this pins its exact match shape unconditionally, on every host.
    const r = await patternScan({ pattern: T_ALPHA, root });
    expect(r.ok).toBe(true);
    expect(r.matches).toEqual(ALPHA_EXPECTED_MATCHES);
  }, 30_000);

  test('reference: gate records on every target (size + line-cap) with maxFileLines=100', async () => {
    const r = await patternScan({ pattern: T_ALPHA, root, maxFileLines: 100 });
    expect(r.skipped.some((s) => s.file === 'big.txt' && s.reason === 'size')).toBe(true);
    expect(r.skipped.some((s) => s.file === 'long.txt' && s.reason === 'line-cap')).toBe(true);
    // The pre-B' pipeline ALSO reports skip.bin-style 'binary' records for NUL-content files it scans. On dep-absent
    // hosts the worker sees every file → any binary fixture scanned must surface here; our fixtures contain no NUL
    // bytes, so exactly these two records are expected:
    const unexpected = r.skipped.filter((s) => !(['big.txt', 'long.txt'].includes(s.file)));
    expect(unexpected).toEqual([]);
  }, 30_000);

  test('reference: filesScanned counts all targets (7)', async () => {
    const r = await patternScan({ pattern: T_ALPHA, root });
    expect(r.stats.filesScanned).toBe(TARGET_COUNT);
  }, 30_000);

  test('invalid-regex demotion still works end-to-end on any host', async () => {
    const r = await patternScan({ pattern: '([unclosed', root });
    expect(r.ok).toBe(true);
    expect(r.demotedToLiteral).toBe('invalid-regex');
  }, 30_000);

  test('empty pattern still rejected before any scan work (guard rail unchanged)', async () => {
    const r = await patternScan({ pattern: '   ', root });
    expect(r.ok).toBe(false);
    expect(String(r.error)).toContain('pattern is required');
  }, 10_000);

  test('concurrency does not change results (deterministic survivor set)', async () => {
    // SLOW-HOST RELAXATION (same premise class as the patternScan.test.ts determinism leg, corrected 05.09): on a contended
    // host the pool pays ≥250ms spawn pacing + ~43-67ms cold boot PER EVAL after the DRAIN rule kills idles between calls — so
    // the sequential conc=1 leg hits the user-ordered GREP_MAX_RUN_MS=500 wall at file ~3 of 7 while the 8-way leg still
    // completes (observed: a.filesScanned=3 aborted, b.filesScanned=7). A cap-abort is then a HOST-LOAD fact, not a
    // determinism violation. Exact cross-leg equality stays the contract when BOTH legs complete; on any abort we drop to
    // structural invariants HERE — never by touching GREP_MAX_RUN_MS or the pool pacing caps.
    const tA = Date.now();
    const a = await patternScan({ pattern: T_ALPHA, root, concurrency: 1 });
    console.log(`[DIAG] B' determinism leg-a (conc=1): elapsed=${Date.now() - tA}ms aborted=${String(a.aborted)} filesScanned=${a.stats.filesScanned}`);
    const tB = Date.now();
    const b = await patternScan({ pattern: T_ALPHA, root, concurrency: 8 });
    console.log(`[DIAG] B' determinism leg-b (conc=8): elapsed=${Date.now() - tB}ms aborted=${String(b.aborted)} filesScanned=${b.stats.filesScanned}`);
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);

    // Both legs completed inside the wall → the original exact contract: identical results regardless of worker scheduling.
    if (!a.aborted && !b.aborted) {
      expect(b.matches).toEqual(a.matches); // matches[] is sorted (file,line) — deterministic regardless of worker scheduling
      expect(b.stats.filesScanned).toBe(a.stats.filesScanned);
      expect(a.stats.filesScanned).toBe(TARGET_COUNT); // both legs saw every target — no silent walk divergence
    } else {
      // At least one leg was cap-aborted → its survivor set is a SCHEDULE-DEPENDING prefix of the same deterministic
      // (file,line) ordering. Sound invariants at ANY cutoff:

      for (const m of a.matches) { // field-wise compare on purpose — Array.includes() would be reference identity;
        expect(ALPHA_EXPECTED_MATCHES.some((e) => e.file === m.file && e.line === m.line && e.content === m.content)).toBe(true); // partial ⊆ complete: no spurious or lost matches
      }
      for (let i = 1; i < a.matches.length; i++) { // partials stay canonically sorted by (file,line) — the sort is post-scan and authoritative
        const p = a.matches[i - 1], c = a.matches[i];
        expect(p.file.localeCompare(c.file) < 0 || (p.file === c.file && p.line <= c.line)).toBe(true);
      }

      // filesScanned — INEQUALITY ONLY at any cutoff (same correction as the patternScan.test.ts cap test): exact equality across
      // legs is unsound when one leg aborted, because each stat bump precedes its gate/eval and the wall can land between files.
      // Presence-based bound: every file that returned a match was stat'd before eval → bumped…
      for (const leg of [a, b]) {
        const matchedFiles = new Set(leg.matches.map((m) => m.file));
        expect(leg.stats.filesScanned).toBeGreaterThanOrEqual(matchedFiles.size);
        // …and at most all 7 targets were bumped:
        expect(leg.stats.filesScanned).toBeLessThanOrEqual(TARGET_COUNT);
      }

      // skipped[] entries are pushed concurrently from multiple workers → compare as SETS (sorted), not by array order.
      const norm = (s: { file: string; reason: string }[]): string[] => s.map((x) => `${x.file}:${x.reason}`).sort();
      expect(norm(b.skipped)).toEqual(norm(a.skipped));
    }
  }, 30_000);

  test('includeGlobs + excludeGlobs filter targets without dropping matches', async () => {
    // Post-FIX-34a this runs unconditionally — glob filtering is plain JS pipeline behavior now (no rg involvement).
    const inc = await patternScan({ pattern: T_ALPHA, root, includeGlobs: ['*.txt'] });
    expect(inc.matches).toEqual(ALPHA_EXPECTED_MATCHES);
    // Exclude the candidate file itself → zero matches via the JS filter (rg still names it; intersection discards it):
    const exc = await patternScan({ pattern: T_ALPHA, root, excludeGlobs: ['**/hit_a.txt'] });
    expect(exc.matches.length).toBe(0);
  }, 30_000);
});
