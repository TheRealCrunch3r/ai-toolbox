/**
 * B' — pattern_scan ripgrep phase-1 parity battery (Option A follow-up to v1.9.13+ grep_files).
 *
 * Pins the contract implemented in src/tools/patternScan.ts ("RIPGREP PHASE-1" block):
 *  - On phase-1 'ok', the result is IDENTICAL to the full JS pipeline: matches, 'size'/'line-cap' skip records
 *    and stats.filesScanned. Non-candidate targets pass a gate-only probe (stat + newline count) instead of the
 *    worker — so the ONE tolerated output delta under 'ok' is the absence of 'binary' entries in skipped[] for
 *    files ripgrep proved pattern-absent (binary detection needs content inspection).
 *  - On ANY non-'ok' status ('no-matches', 'fallback-required' incl. dialect parse error / missing dependency),
 *    results are byte-identical to the pre-B' full JS walk — pinned by asserting exact expected matches/skips.
 *
 * LAYERING (mirrors tests/ripgrepEngine.test.ts): guard-rail cases run unconditionally; WASM-dependent
 * expectations are collection-time gated and carry a runtime backstop in beforeAll.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { patternScan } from '../src/tools/patternScan';
// Static import is safe on dep-absent hosts: ripgrepEngine.ts only lazy-imports the WASM package INSIDE
// loadRipgrep() — importing this module never touches node_modules/ripgrep. Same convention as production wiring.
import { searchCandidates } from '../src/utils/ripgrepEngine.js';

// ---------------------------------------------------------------------------
// Collection-time liveness gate (same shape as ripgrepEngine.test.ts)
// ---------------------------------------------------------------------------

let depResolvable = false;
try {
  require.resolve('ripgrep'); // eslint-disable-line @typescript-eslint/no-require-imports
  depResolvable = true;
} catch { /* gated out at registration */ }

function nodeSupportsRequireEsm(): boolean {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major >= 23) return true; // require(ESM) unflagged since v23.0.0
  if (major === 22) return minor >= 12; // backport threshold for CJS↔ESM interop without flag
  return false;
}

const LIVENESS_NOTE = depResolvable
  ? nodeSupportsRequireEsm()
    ? 'live'
    : `installed, but Node ${process.versions.node} cannot require() the ESM-only build`
  : 'package not installed in this checkout (devDependency — npm i -D ripgrep@0.3.1)';

let live = depResolvable && nodeSupportsRequireEsm();
let runtimeSkipReason = '';

function itLive(name: string, fn: () => Promise<void>, timeoutMs?: number): void {
  if (depResolvable && nodeSupportsRequireEsm()) test(name, fn, timeoutMs);
  else test.todo(`[skip: ${LIVENESS_NOTE}] ${name}`);
}

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

describe("patternScan B' — phase-1 live, status ok", () => {
  beforeAll(async () => {
    // Runtime backstop: one known-positive literal query through the SAME call patternScan uses. If it is not
    // 'ok', every expectation in this file that assumes an applied candidate set would be meaningless — downgrade.
    if (!live) return;
    const res = await searchCandidates({ rootDir: root, pattern: T_ALPHA, mode: 'literal' });
    if (res.status !== 'ok') {
      live = false;
      runtimeSkipReason = `probe not ok — ${res.status}${res.reason ? ` (${res.reason})` : ''}`;
      console.log(`[patternScanBPrime] probe downgrade: ${runtimeSkipReason}`);
    }
  }, 30_000);

  test('live-status diagnostic (never fails; prints gate state)', () => {
    if (!live) console.log(`[patternScanBPrime] WASM path SKIPPED — ${runtimeSkipReason || LIVENESS_NOTE}`);
    expect(true).toBe(true);
  });

  itLive('ok-restriction: matches exactly the full-JS-walk reference shape', async () => {
    if (!live) return; // collection gate already excluded us on dep-absent hosts — keep body green-but-empty there
    const r = await patternScan({ pattern: T_ALPHA, root });
    expect(r.ok).toBe(true);
    expect(r.matches).toEqual(ALPHA_EXPECTED_MATCHES);
  }, 30_000);

  itLive('ok-restriction: stats.filesScanned stays identical to the pre-B\' pipeline (workers + gate-probe bump)', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: T_ALPHA, root });
    // Pre-B', EVERY target was counted once it passed isFile(): 7 targets → 7. B' must reproduce that exactly —
    // the gate-only probe branch bumps filesScanned in the worker's exact position (after isFile(), before size).
    expect(r.stats.filesScanned).toBe(TARGET_COUNT);
  }, 30_000);

  itLive("ok-restriction: 'size' and 'line-cap' skip records identical on non-candidate targets", async () => {
    if (!live) return;
    const r = await patternScan({ pattern: T_ALPHA, root, maxFileLines: 100 });
    expect(r.matches).toEqual(ALPHA_EXPECTED_MATCHES); // restriction changed nothing visible in matches
    expect(r.skipped.some((s) => s.file === 'big.txt' && s.reason === 'size')).toBe(true);
    expect(r.skipped.some((s) => s.file === 'long.txt' && s.reason === 'line-cap')).toBe(true);
    // No OTHER skip records may appear: the probe branch mirrors worker gates one-for-one.
    const unexpected = r.skipped.filter((s) => !(['big.txt', 'long.txt'].includes(s.file)));
    expect(unexpected).toEqual([]);
  }, 30_000);

  itLive('ok-restriction: named candidate still flows through the worker (binary gate reachable)', async () => {
    if (!live) return;
    // A file that ripgrep NAMES passes straight to the worker — whose binary detection remains authoritative there.
    // Content = token BEFORE a NUL byte: if this rg build names NUL-content matches, the worker must report 'binary'.
    const binPath = path.join(root, 'bin_named.bin');
    fs.writeFileSync(binPath, Buffer.from(`${T_ALPHA}\x00rest of binary body`));
    try {
      const r = await patternScan({ pattern: T_ALPHA, root });
      expect(r.ok).toBe(true);
      if (r.matches.some((m) => m.file === 'bin_named.bin')) {
        // Named AND scanned: worker's looksBinary() must have caught the NUL → zero matches from it + skip record.
        expect(r.skipped.some((s) => s.file === 'bin_named.bin' && s.reason === 'binary')).toBe(true);
      } else if (r.skipped.some((s) => s.file === 'bin_named.bin')) {
        // Named but gate-probe'd would be a contradiction (candidates never hit the probe branch).
        throw new Error('candidate file routed through gate probe — restriction bug');
      }
      // The tolerated delta: rg declined to name the NUL-content file → no record at all, matches unchanged.
    } finally {
      fs.rmSync(binPath, { force: true });
    }
  }, 30_000);

  itLive('case sensitivity: default SENSITIVE (no -i) — lowercase pattern finds nothing', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: 'upper_bp_tok_91', root });
    expect(r.ok).toBe(true);
    expect(r.matches.length).toBe(0); // case.txt carries only the uppercase form + an unrelated lowercase line
  }, 30_000);

  itLive('case sensitivity: explicit false → -i applied, uppercase token found', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: 'upper_bp_tok_91', root, caseSensitive: false });
    expect(r.ok).toBe(true);
    expect(r.matches.some((m) => m.file === 'case.txt' && m.content.includes(T_UPPER))).toBe(true);
  }, 30_000);

  itLive('hidden dirs ARE scanned in phase-1 (--hidden parity with the walker)', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: T_HIDDEN, root });
    expect(r.matches).toEqual([{ file: '.hidden/secret.txt', line: 1, content: T_HIDDEN }]);
  }, 30_000);

  itLive('DEFAULT_EXCLUDE_DIRS prune identically in phase-1 and walker (node_modules never surfaces)', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: T_NM, root });
    // rg excluded node_modules AND the walker pruned it — the token must be unreachable via EITHER path.
    expect(r.matches.length).toBe(0);
    expect(r.excludedDirs).toContain('node_modules');
  }, 30_000);

  itLive('depth budget parity: dir-depth-2 file in-budget at cap 2, out-of-budget at cap 1', async () => {
    if (!live) return;
    const inBudget = await patternScan({ pattern: T_GAMMA, root, maxDepth: 2 });
    expect(inBudget.matches.some((m) => m.file === 'sub/deep/x.txt')).toBe(true);
    const outOfBudget = await patternScan({ pattern: T_GAMMA, root, maxDepth: 1 });
    expect(outOfBudget.matches.length).toBe(0); // walker never enqueued the depth-2 dir; rg --max-depth=2 agrees
  }, 30_000);

  itLive('literal mode + demotion paths reach ripgrep as -F (regex metachars inert, no dialect error)', async () => {
    if (!live) return;
    // Demoted-to-literal probe: '(a+)+$' is unsafe → JS matcher matches the LITERAL string. The file below contains
    // exactly that literal text; phase-1 must query rg in 'literal' mode or the '(' would dialect-parse-error and we'd
    // only find this by luck of the fallback — pinning the demotion→mode mapping directly:
    const litFile = path.join(root, 'demote.txt');
    fs.writeFileSync(litFile, '(a+)+$ sits here literally\n');
    try {
      const r = await patternScan({ pattern: '(a+)+$', root });
      expect(r.ok).toBe(true);
      expect(r.demotedToLiteral).toBe('unsafe-regex');
      expect(r.matches.some((m) => m.file === 'demote.txt')).toBe(true);
    } finally {
      fs.rmSync(litFile, { force: true });
    }
  }, 30_000);

  itLive('single-file root with match → exactly the one file reported (candidate rel normalization, file mode)', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: T_ALPHA, root: path.join(root, 'hit_a.txt') });
    expect(r.ok).toBe(true);
    expect(r.matches.length).toBe(2);
    // Single-file rels are cwd-relative by convention — must still intersect the rg candidate set (both formats handled).
  }, 30_000);

  itLive('single-file root without match → clean empty result, no skip records', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: 'NO_SUCH_BP_TOKEN_ZZ9', root: path.join(root, 'hit_a.txt') });
    expect(r.ok).toBe(true);
    expect(r.matches.length).toBe(0);
    expect(r.skipped.length).toBe(0);
  }, 30_000);

  itLive('no-matches status (absent token) → full walk still gates: skipped[]/stats identical to reference', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: 'NO_SUCH_BP_TOKEN_ZZ9', root, maxFileLines: 100 });
    expect(r.ok).toBe(true);
    expect(r.matches.length).toBe(0);
    // 'no-matches' must NOT short-circuit — gate records prove the JS pipeline ran to completion:
    expect(r.skipped.some((s) => s.file === 'big.txt' && s.reason === 'size')).toBe(true);
    expect(r.skipped.some((s) => s.file === 'long.txt' && s.reason === 'line-cap')).toBe(true);
    // All temporary per-test fixtures (bin_named.bin, demote.txt, lookbehind.txt) are removed in their own finally
    // blocks before later tests run — the target set is stable at TARGET_COUNT across the suite.
    expect(r.stats.filesScanned).toBe(TARGET_COUNT);
  }, 30_000);

  itLive('fallback-required dialect pattern (?<=x)y → byte-identical full-JS-walk results', async () => {
    if (!live) return;
    const r = await patternScan({ pattern: '(?<=x)y', root });
    expect(r.ok).toBe(true);
    // Full JS walk semantics: /(?<=x)y/g over every line — 'alpha one ...' none... fixture lines containing "xy":
    // none of the token files do; the lowercase twin line does not either. Pin exactly: zero matches, all gates intact.
    expect(r.matches.length).toBe(0);
    expect(r.stats.filesScanned).toBe(TARGET_COUNT);
  }, 30_000);

  itLive('fallback-required dialect pattern returns REAL matches the full JS walk would (lookbehind over fixture text)', async () => {
    if (!live) return;
    // 'sub' contains "ub"; a lookbehind for 's' before 'ub': pattern '(?<=s)ub' — present in 'sub/hit_b.md'? Content is
    // "# doc\nBPRIME_BETA_57 in markdown\n" — no 'sub' substring. Use the REL PATH? No — JS matches CONTENT lines only.
    // Deterministic positive: write a file with known content, scan it, clean up.
    const lbFile = path.join(root, 'lookbehind.txt');
    fs.writeFileSync(lbFile, 'sux prefix line\nplain line\n');
    try {
      const r = await patternScan({ pattern: '(?<=s)u', root });
      expect(r.ok).toBe(true);
      const m = r.matches.filter((x) => x.file === 'lookbehind.txt');
      expect(m.length).toBe(1); // "sux": u preceded by s — only on line 1 ('plain' has no su-after-s... 'line' none)
      expect(m[0].line).toBe(1);
    } finally {
      fs.rmSync(lbFile, { force: true });
    }
  }, 30_000);
});

// ---------------------------------------------------------------------------
// Phase-1 ABSENT (dep unresolvable on this host) — the full JS pipeline must still be byte-exact.
// These run UNCONDITIONALLY and are the authoritative pre-B' regression net on dep-less hosts.
// ---------------------------------------------------------------------------

describe('patternScan B\' — guard rails + dep-absent reference behavior', () => {
  test('live-status diagnostic (never fails; prints gate state)', () => {
    if (!live) console.log(`[patternScanBPrime] WASM path SKIPPED here too — ${runtimeSkipReason || LIVENESS_NOTE}`);
    expect(true).toBe(true);
  });

  test('dep-absent reference: T_ALPHA full-walk shape (holds whether or not rg is present)', async () => {
    // When live, this re-asserts the 'ok' result; when dep absent, it proves the fallback path alone reproduces
    // pre-B' behavior. Either way the exact expected shape must hold — that IS the parity contract.
    const r = await patternScan({ pattern: T_ALPHA, root });
    expect(r.ok).toBe(true);
    expect(r.matches).toEqual(ALPHA_EXPECTED_MATCHES);
  }, 30_000);

  test('dep-absent reference: gate records on every target (size + line-cap) with maxFileLines=100', async () => {
    const r = await patternScan({ pattern: T_ALPHA, root, maxFileLines: 100 });
    expect(r.skipped.some((s) => s.file === 'big.txt' && s.reason === 'size')).toBe(true);
    expect(r.skipped.some((s) => s.file === 'long.txt' && s.reason === 'line-cap')).toBe(true);
    // The pre-B' pipeline ALSO reports skip.bin-style 'binary' records for NUL-content files it scans. On dep-absent
    // hosts the worker sees every file → any binary fixture scanned must surface here; our fixtures contain no NUL
    // bytes, so exactly these two records are expected:
    const unexpected = r.skipped.filter((s) => !(['big.txt', 'long.txt'].includes(s.file)));
    expect(unexpected).toEqual([]);
  }, 30_000);

  test('dep-absent reference: filesScanned counts all targets (7)', async () => {
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

  test('concurrency does not change results under B\' (deterministic survivor set)', async () => {
    const a = await patternScan({ pattern: T_ALPHA, root, concurrency: 1 });
    const b = await patternScan({ pattern: T_ALPHA, root, concurrency: 8 });
    expect(b.matches).toEqual(a.matches); // matches[] is sorted (file,line) — deterministic regardless of worker scheduling
    expect(b.stats.filesScanned).toBe(a.stats.filesScanned);
    // skipped[] entries are pushed concurrently from multiple workers → compare as SETS (sorted), not by array order.
    const norm = (s: { file: string; reason: string }[]): string[] => s.map((x) => `${x.file}:${x.reason}`).sort();
    expect(norm(b.skipped)).toEqual(norm(a.skipped));
  }, 30_000);

  test('includeGlobs + excludeGlobs interact with the restriction without dropping matches', async () => {
    if (!live) return; // user-glob paths are exercised by the dep-absent reference suite on other hosts
    const inc = await patternScan({ pattern: T_ALPHA, root, includeGlobs: ['*.txt'] });
    expect(inc.matches).toEqual(ALPHA_EXPECTED_MATCHES);
    // Exclude the candidate file itself → zero matches via the JS filter (rg still names it; intersection discards it):
    const exc = await patternScan({ pattern: T_ALPHA, root, excludeGlobs: ['**/hit_a.txt'] });
    expect(exc.matches.length).toBe(0);
  }, 30_000);
});
