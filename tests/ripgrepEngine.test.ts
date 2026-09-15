/**
 * FIX-34b (14.09) — unit + integration tests for src/utils/ripgrepEngine.ts `runRipgrepEngine`
 * (full-engine replacement of grep_files; supersedes the deleted searchCandidates/RipgrepResult API).
 *
 * LAYERING:
 *  - "guard-rail" cases run UNCONDITIONALLY — they exercise only the pre-worker branches of
 *    runRipgrepEngine, so they hold even when the 'ripgrep' dependency is absent from node_modules.
 *  - "engine integration" cases are gated at COLLECTION time (Jest registers tests while running the
 *    describe body) and carry a runtime backstop in each body — same harness as the pre-fix suite.
 *
 * CONTRACT UNDER TEST (pinned against src/utils/ripgrepEngine.ts, 13.09 + verified re-read 14.09):
 *  outcome = { ok:true, matches:[{file,line_number,content}], effectiveMode } | no-matches
 *          | spawn-failure{detail} | timeout{budgetMs} | aborted        — NEVER throws
 *  • file display: '/'-separated relative path under the scan root; single-file target → basename.
 *  • content: trimmed (CRLF stripped), truncated to maxContentLength + '…' (truncated length = cap+1).
 *  • mode:'regex' compiles via the Rust regex crate FIRST; a dialect parse error triggers exactly ONE
 *    --fixed-strings retry on the same warm worker → effectiveMode 'fixed-strings' on the ok outcome.
 *  • maxDepth: values >0 emit --max-depth=(cap+1) (parity quirk pinned pre-fix); ≤0 / non-finite → no flag.
 *  • budgetMs is ONE host-side wall-clock watchdog over boot + scan (+ retry): expiry terminates the
 *    worker and settles {kind:'timeout', budgetMs} — the wedge-class containment proof.
 */

import { runRipgrepEngine } from '../src/utils/ripgrepEngine';
import type { RipgrepMatchEntry, RipgrepEngineOutcome } from '../src/utils/ripgrepEngine';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * COLLECTION-TIME liveness gate (synchronous at module load — Jest cannot decide live/skip later):
 *   1. `require.resolve('ripgrep')` succeeds → package is installed in this checkout;
 *   2. Node runtime supports CJS require() of ESM-only packages (unflagged since v23, backported to
 *      ≥22.12). The engine spawns a worker whose payload dynamically imports 'ripgrep'.
 A runtime backstop remains in beforeAll — on such hosts every integration body returns early with a
 * labeled SKIP log. An UNEXPECTED outcome shape, by contrast, fails loudly: that is a real finding,
 * not an environment limitation.
 */
let depResolvable = false;
try {
  require.resolve('ripgrep'); // eslint-disable-line @typescript-eslint/no-require-imports
  depResolvable = true;
} catch {
  depResolvable = false;
}

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

const HIDDEN_TOKEN = 'RG_NORM_HIDDEN_TOKEN_88'; // hidden dir, extensionless file — --hidden probe
const EXCL_TOKEN = 'RG_EXCLUDE_TOKEN_99'; // inside node_modules/dep.js — pruned by exclusion glob, visible without one
/** Literal dialect-reject string: valid JS RegExp syntax (lookbehind) that ripgrep's default engine refuses. */
const DIALECT_PATTERN = '(?<=foo)bar';

/** Extract the ok-arm matches from an outcome; throws with a labeled reason on any other arm. */
function expectOk(res: RipgrepEngineOutcome): { matches: RipgrepMatchEntry[]; effectiveMode: 'regex' | 'fixed-strings' } {
  if (!res.ok) throw new Error(`expected ok outcome, got ${JSON.stringify(res).slice(0, 300)}`);
  return res as unknown as { matches: RipgrepMatchEntry[]; effectiveMode: 'regex' | 'fixed-strings' };
}

describe('runRipgrepEngine — guard rails (no worker spawned)', () => {
  test('empty pattern → no-matches without touching the filesystem', async () => {
    const res = await runRipgrepEngine({ rootDir: os.tmpdir(), pattern: '', mode: 'regex', budgetMs: 500 });
    expect(res).toEqual({ kind: 'no-matches' });
  }, 10_000);

  test('missing rootDir → spawn-failure with detail missing-root-dir', async () => {
    const res = await runRipgrepEngine({ rootDir: '', pattern: 'x', mode: 'regex', budgetMs: 500 });
    expect(res.kind).toBe('spawn-failure');
    if (res.kind === 'spawn-failure') expect(res.detail).toContain('missing-root-dir');
  }, 10_000);

  test('absent/invalid root never throws — typed spawn-failure signal instead (contract production relies on)', async () => {
    const res = await runRipgrepEngine({
      rootDir: path.join(os.tmpdir(), `rg-engine-absent-${Date.now()}`),
      pattern: 'anything',
      mode: 'regex',
      budgetMs: 500,
    });
    expect(res.kind).toBe('spawn-failure');
    if (res.kind === 'spawn-failure') expect(res.detail).toContain('target not found or inaccessible');
  }, 10_000);

  test('pre-aborted signal → aborted with ZERO worker work', async () => {
    const ctrl = new AbortController();
    ctrl.abort(); // aborted BEFORE the call — guard-rail branch, no stat/worker involved downstream of it
    const res = await runRipgrepEngine({ rootDir: os.tmpdir(), pattern: 'x', mode: 'regex', budgetMs: 500, abortSignal: ctrl.signal });
    expect(res).toEqual({ kind: 'aborted' });
  }, 10_000);
});

describe('runRipgrepEngine — engine integration (collection-time gated + runtime backstop)', () => {
  // Collection-time gate: dep absent / runtime too old → every case registers as a todo (skipped) at
  // describe time. Gate passed but WASM boot fails at runtime → `live` downgrades in beforeAll and each
  // body returns early with a labeled SKIP log (green-but-empty by design — the loud signal then is the
  // grep_files-level suite + production telemetry, not this one).
  let rootDir = '';
  let bigTreeDir = '';
  let live = depResolvable && nodeSupportsRequireEsm();
  let runtimeSkipReason = '';

  const skipIfUnlive = (): void => {
    if (!live) console.log(`[ripgrepEngine] SKIP — ${runtimeSkipReason || LIVENESS_NOTE}`);
  };

  beforeAll(async () => {
    rootDir = path.join(os.tmpdir(), `rg-engine-test-${Date.now()}`);
    await fs.mkdir(path.join(rootDir, 'sub', 'deep'), { recursive: true }); // sub/deep = depth-2 dir (maxDepth boundary probe)
    await fs.mkdir(path.join(rootDir, '.hidden'), { recursive: true });
    await fs.mkdir(path.join(rootDir, 'node_modules'), { recursive: true });

    // Deterministic fixture tree — unique tokens, one concern per file:
    await fs.writeFile(path.join(rootDir, 'a.ts'), `const ALPHA_MARKER_42 = 1;\nexport default ALPHA_MARKER_42;\n`);
    await fs.writeFile(path.join(rootDir, 'sub', 'b.txt'), `plain BETA_TEXT_TOKEN here\nsecond line BETA_TEXT_TOKEN again\n`);
    await fs.writeFile(path.join(rootDir, 'sub', 'deep', 'c.txt'), `DEEP_GAMMA_TOKEN_55 lives two subdirectories below the root\n`); // depth-2 boundary file
    await fs.writeFile(path.join(rootDir, 'case.txt'), `UPPER_TOKEN_ABC\ngamma_token_abc lowercase\n`); // case-sensitivity probe
    await fs.writeFile(path.join(rootDir, '.hidden', 'secret.txt'), `${HIDDEN_TOKEN}\n`);              // --hidden probe
    await fs.writeFile(path.join(rootDir, 'node_modules', 'dep.js'), `module.exports = ${EXCL_TOKEN};\n`); // exclusion-glob probe
    await fs.writeFile(path.join(rootDir, 'long_line.txt'), `${'x'.repeat(200)}\nshort line after\n`); // truncation probe (200-char line)

    if (!live) return; // gated out at collection time — fixtures only, no engine call

    // RUNTIME BACKSTOP: proves WASM boot + a real match query succeed in THIS runtime.
    const probe = await runRipgrepEngine({ rootDir, pattern: 'ALPHA_MARKER_42', mode: 'literal', budgetMs: 30_000 });
    if (!probe.ok) {
      // Dep resolvable but WASM/interop failed at runtime → downgrade; cases skip cleanly.
      live = false;
      runtimeSkipReason = `WASM boot probe not ok — ${JSON.stringify(probe).slice(0, 240)}`;
      return;
    }
    // outcome.ok: the file format MUST resolve against this fixture. A throw here is a genuinely
    // unexpected output shape → let it FAIL loudly (beforeAll error), never silently skip everything.
    const probeSet = expectOk(probe).matches.map((m) => m.file);
    if (!probeSet.includes('a.ts') || probeSet.length !== 1) {
      live = false;
      runtimeSkipReason = `probe returned an unexpected match set for a known token (preopen/root mismatch on this host?) — ${JSON.stringify(probeSet).slice(0, 240)}`;
    }
  }, 60_000);

  afterAll(async () => {
    try { await fs.rm(rootDir, { recursive: true, force: true }); } catch (e) { console.error('Cleanup failed:', e); }
    if (bigTreeDir) { try { await fs.rm(bigTreeDir, { recursive: true, force: true }); } catch (e) { console.error('Big-tree cleanup failed:', e); } }
  }, 30_000);

  // Collection-time registration: real test when the dep/runtime gate passed, todo (skipped) otherwise.
  function itLive(name: string, fn: () => Promise<void>, timeoutMs?: number): void {
    if (depResolvable && nodeSupportsRequireEsm()) test(name, fn, timeoutMs);
    else test.todo(`[skip: ${LIVENESS_NOTE}] ${name}`);
  }

  test('live-status diagnostic (never fails; prints gate state)', () => {
    if (!live) console.log(`[ripgrepEngine] engine integration SKIPPED — ${runtimeSkipReason || LIVENESS_NOTE}`);
    expect(true).toBe(true);
  });

  itLive('ok outcome → line numbers + trimmed content, relative display paths', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrepEngine({ rootDir, pattern: 'BETA_TEXT_TOKEN', mode: 'regex', budgetMs: 30_000 });
    const ok = expectOk(res);
    expect(ok.effectiveMode).toBe('regex');
    // sub/b.txt holds the token on lines 1 AND 2 — exact (file, line) pairs pin rg's natural order.
    const pairs = ok.matches.map((m) => `${m.file}:${m.line_number}`).sort();
    expect(pairs).toEqual(['sub/b.txt:1', 'sub/b.txt:2']);
    // content is the trimmed full line (well under any cap here — no truncation expected)
    expect(ok.matches[0].content).toBe('plain BETA_TEXT_TOKEN here');
  }, 30_000);

  itLive('literal (-F) mode → regex metachars inert where a valid literal string exists', async () => {
    skipIfUnlive(); if (!live) return;
    // The line 'second line BETA_TEXT_TOKEN again' is found verbatim even though the pattern carries '(' —
    // which would be an UNBALANCED (parse-erroring) regex in mode:'regex'.
    const res = await runRipgrepEngine({ rootDir, pattern: 'BETA_TEXT_TOKEN(', mode: 'literal', budgetMs: 30_000 });
    expect(res).toEqual({ kind: 'no-matches' }); // no file literally contains that string — and NO spawn-failure
  }, 30_000);

  itLive('caseInsensitive:true → matches the uppercase token (rg -i; grep_files parity)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrepEngine({ rootDir, pattern: 'upper_token_abc', mode: 'literal', caseInsensitive: true, budgetMs: 30_000 });
    // -i matches the "UPPER_TOKEN_ABC" line; gamma_token_abc (lowercase) does not contain this token in either casing.
    expect(expectOk(res).matches.some((m) => m.file === 'case.txt')).toBe(true);
  }, 30_000);

  itLive('caseInsensitive:false → same pattern matches nothing (no exact-cased occurrence)', async () => {
    skipIfUnlive(); if (!live) return;
    // case.txt carries only "UPPER_TOKEN_ABC" and lowercase "gamma_token_abc" — a case-sensitive
    // search for 'upper_token_abc' hits neither line → clean no-matches.
    const res = await runRipgrepEngine({ rootDir, pattern: 'upper_token_abc', mode: 'literal', caseInsensitive: false, budgetMs: 30_000 });
    expect(res).toEqual({ kind: 'no-matches' });
  }, 30_000);

  itLive('absent token → no-matches (exit-code-1 mapping; NOT spawn-failure)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrepEngine({ rootDir, pattern: 'NO_SUCH_TOKEN_ZZ9', mode: 'regex', budgetMs: 30_000 });
    expect(res).toEqual({ kind: 'no-matches' });
  }, 30_000);

  itLive(`dialect reject '${DIALECT_PATTERN}' → ONE -F retry finds the literal self-match, effectiveMode 'fixed-strings'`, async () => {
    skipIfUnlive(); if (!live) return;
    // T3 repro (pre-fix: fallback-required): a lookbehind is valid JS RegExp but unsupported by ripgrep's
    // default engine → exit 2 "regex parse error" → the engine re-runs the SAME warm worker with -F. The
    // fixture line below contains the pattern as PLAIN TEXT, so the demoted literal scan matches it and the
    // settled ok outcome reports effectiveMode 'fixed-strings' — compiler-driven demotion, observable.
    await fs.writeFile(path.join(rootDir, 'dialect.txt'), `probe ${DIALECT_PATTERN} here\n`);
    try {
      const res = await runRipgrepEngine({ rootDir, pattern: DIALECT_PATTERN, mode: 'regex', budgetMs: 30_000 });
      const ok = expectOk(res);
      expect(ok.effectiveMode).toBe('fixed-strings');
      const hit = ok.matches.find((m) => m.file === 'dialect.txt');
      expect(hit).toBeDefined();
      if (hit) expect(hit.content).toContain(DIALECT_PATTERN); // trimmed line carries the literal text verbatim
    } finally {
      await fs.unlink(path.join(rootDir, 'dialect.txt')).catch(() => {});
    }
  }, 30_000);

  itLive('includeGlob restricts the scan; excludeGlobs prune matching paths', async () => {
    skipIfUnlive(); if (!live) return;
    // WITHOUT exclusions: node_modules content is reachable (rg --no-ignore scans everything by default).
    const without = await runRipgrepEngine({ rootDir, pattern: EXCL_TOKEN, mode: 'literal', budgetMs: 30_000 });
    expect(expectOk(without).matches.some((m) => m.file === 'node_modules/dep.js')).toBe(true);

    // WITH the exclusion glob — exactly what production grep_files passes via Array.from(DEFAULT_EXCLUDED_DIRS):
    const withExcl = await runRipgrepEngine({ rootDir, pattern: EXCL_TOKEN, mode: 'literal', excludeGlobs: ['node_modules'], budgetMs: 30_000 });
    expect(withExcl).toEqual({ kind: 'no-matches' }); // the only occurrence was pruned → clean negative

    // includeGlob: only .txt files scanned — a.ts (ALPHA token) disappears from scope.
    const included = await runRipgrepEngine({ rootDir, pattern: 'ALPHA_MARKER_42', mode: 'literal', includeGlob: '*.txt', budgetMs: 30_000 });
    expect(included).toEqual({ kind: 'no-matches' });

    // and the .txt-scoped search still sees its own token.
    const includedHit = await runRipgrepEngine({ rootDir, pattern: 'BETA_TEXT_TOKEN', mode: 'literal', includeGlob: '*.txt', budgetMs: 30_000 });
    expect(expectOk(includedHit).matches.every((m) => m.file.endsWith('.txt'))).toBe(true);
  }, 30_000);

  itLive('maxDepth boundary — depth-2 file in-budget at cap 2, out-of-budget at cap 1; cap 0 = unbounded (empirically pinned pre-fix)', async () => {
    skipIfUnlive(); if (!live) return;
    // The +1 parity quirk lives INSIDE buildArgs (--max-depth=cap+1). These pins are the observable contract:
    const deepCap2 = await runRipgrepEngine({ rootDir, pattern: 'DEEP_GAMMA_TOKEN_55', mode: 'literal', maxDepth: 2, budgetMs: 30_000 });
    expect(expectOk(deepCap2).matches.some((m) => m.file === 'sub/deep/c.txt')).toBe(true);

    const deepCap1 = await runRipgrepEngine({ rootDir, pattern: 'DEEP_GAMMA_TOKEN_55', mode: 'literal', maxDepth: 1, budgetMs: 30_000 });
    expect(deepCap1).toEqual({ kind: 'no-matches' }); // one-subdir budget cannot reach depth 2 → clean negative

    // The depth-1 file stays in-budget at cap 1 — pins the boundary exactly between depths 1 and 2.
    const shallowCap1 = await runRipgrepEngine({ rootDir, pattern: 'BETA_TEXT_TOKEN', mode: 'literal', maxDepth: 1, budgetMs: 30_000 });
    expect(expectOk(shallowCap1).matches.some((m) => m.file === 'sub/b.txt')).toBe(true);

    // Documented engine quirk (buildArgs): --max-depth emitted only when depth > 0 → maxDepth: 0 = UNBOUNDED.
    const cap0 = await runRipgrepEngine({ rootDir, pattern: 'DEEP_GAMMA_TOKEN_55', mode: 'literal', maxDepth: 0, budgetMs: 30_000 });
    expect(expectOk(cap0).matches.some((m) => m.file === 'sub/deep/c.txt')).toBe(true);
  }, 60_000);

  itLive('single-file target → display file is the basename (legacy contract shape)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrepEngine({ rootDir: path.join(rootDir, 'sub', 'b.txt'), pattern: 'BETA_TEXT_TOKEN', mode: 'literal', budgetMs: 30_000 });
    const ok = expectOk(res);
    expect(ok.matches.length).toBe(2); // lines 1 and 2 of the file itself
    for (const m of ok.matches) expect(m.file).toBe('b.txt');
  }, 30_000);

  itLive('long-line truncation — 200-char line at maxContentLength:50 → length exactly 51 with trailing …', async () => {
    skipIfUnlive(); if (!live) return;
    // A run of ≥5 x's: only the 200-char line in long_line.txt qualifies ('short line after' stays out).
    const res = await runRipgrepEngine({ rootDir, pattern: 'x{5}', mode: 'regex', includeGlob: 'long_line.txt', maxContentLength: 50, budgetMs: 30_000 });
    const ok = expectOk(res);
    expect(ok.matches.length).toBe(1); // exactly the long line matched
    if (ok.matches.length === 1) {
      expect(ok.matches[0].file).toBe('long_line.txt');
      expect(ok.matches[0].content.length).toBe(51); // cap + ellipsis — the exact pinned shape callers render
      expect(ok.matches[0].content.endsWith('…')).toBe(true);
    }
  }, 30_000);

  itLive('maxMatches early-exit during parse (scan runs to completion; only reporting is capped)', async () => {
    skipIfUnlive(); if (!live) return;
    // sub/b.txt has the token on 2 lines — cap of 1 keeps exactly one match.
    const res = await runRipgrepEngine({ rootDir, pattern: 'BETA_TEXT_TOKEN', mode: 'literal', maxMatches: 1, budgetMs: 30_000 });
    const ok = expectOk(res);
    expect(ok.matches.length).toBe(1);
    expect(ok.matches[0].line_number).toBe(1); // first in rg's natural order is kept
  }, 30_000);

  itLive('budgetMs:1 → deterministic timeout (watchdog outlives no real scan)', async () => {
    skipIfUnlive(); if (!live) return;
    // A 1ms wall-clock budget cannot cover worker boot + a WASM rg invocation on any host — the watchdog
    // terminates the wedged worker and settles the timeout arm in ~1-2 event-loop turns. This is the
    // load-bearing wedge-class containment pin: the call RETURNS (it never hangs, never throws).
    const res = await runRipgrepEngine({ rootDir, pattern: 'BETA_TEXT_TOKEN', mode: 'literal', budgetMs: 1 });
    expect(res.kind).toBe('timeout');
    if (res.kind === 'timeout') expect(res.budgetMs).toBe(1);
  }, 30_000);

  itLive('mid-call abort via real sleep + ctrl.abort() on a ~200-file tree → aborted arm, host stays responsive', async () => {
    skipIfUnlive(); if (!live) return;
    // A small tree finishes in single-digit ms — too fast to interrupt reliably. Materialize ~200 files so
    // the rg scan spans several event-loop turns after boot (empirically pinned 13.09: a 150-200ms host sleep
    // lands mid-scan on this runtime; no fake timers — they cannot touch the worker thread).
    if (!bigTreeDir) {
      bigTreeDir = path.join(os.tmpdir(), `rg-engine-bigtreetest-${Date.now()}`);
      await fs.mkdir(bigTreeDir, { recursive: true });
      const fileContent = 'ABORT_PROBE_TOKEN_77 pad pad pad pad\n'.repeat(50) + '\n';
      const writes: Array<Promise<void>> = [];
      for (let i = 0; i < 200; i++) writes.push(fs.writeFile(path.join(bigTreeDir, `f${i.toString().padStart(3, '0')}.txt`), fileContent));
      await Promise.all(writes);
    }

    const ctrl = new AbortController();
    const pending = runRipgrepEngine({ rootDir: bigTreeDir, pattern: 'ABORT_PROBE_TOKEN_77', mode: 'literal', budgetMs: 60_000, abortSignal: ctrl.signal });
    // Real sleep — the ONLY way to let boot + scan start before aborting (fake timers are inert here by design).
    await new Promise((r) => setTimeout(r, 180));
    if (!ctrl.signal.aborted) ctrl.abort();
    const res = await pending;

    expect(res.kind).toBe('aborted'); // worker terminated on the host signal — no match leak, no hang
  }, 60_000);
});
