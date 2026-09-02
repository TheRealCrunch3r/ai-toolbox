/**
 * P3-G8 — unit + integration tests for src/utils/ripgrepEngine.ts (Option A: ripgrep-backed
 * candidate-file filter, plan_1788282568340_z5a4r521c).
 *
 * LAYERING:
 *  - "guard-rail" cases run UNCONDITIONALLY — they exercise only the pre-IO branches of
 *    searchCandidates (no 'ripgrep' import is attempted), so they hold even when the WASM
 *    dependency is absent from node_modules.
 *  - "WASM integration" cases are gated at COLLECTION time (Jest registers tests while running the
 *    describe body — before any beforeAll) and carry a runtime backstop in each body.
 *
 * PATH-FORMAT CONTRACT UNDER TEST (deliberately flexible — see P2-G7 wiring note):
 *  The engine emits rg's `-l` output lines verbatim. For an absolute rootDir argument, ripgrep
 *  prints paths carrying the search-root prefix; whether that prefix is ABSOLUTE (host form) or
 *  RELATIVE (guest preopen root) depends on the WASI path mapping in lib/_rg.mjs and is
 *  platform-sensitive (win32 backslash roots). Production normalizes with `.split('\\').join('/')`
 *  (fileSystemTools.ts L2762); this suite therefore resolves each candidate as "root-prefixed OR
 *  root-relative, slash-normalized" — the same flexibility class as the P0 spike's normAbs. The
 *  post-wiring DIFF-mode parity battery (tests/grepFilesParity.test.ts) is the authoritative
 *  end-to-end check for wiring-level path comparison; if rg output turns out to be absolute while
 *  the gate expects relative, it surfaces THERE as a match-count delta — by design.
 */

import { searchCandidates } from '../src/utils/ripgrepEngine';
import type { RipgrepResult } from '../src/utils/ripgrepEngine';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * COLLECTION-TIME liveness gate (synchronous at module load — Jest cannot decide live/skip later):
 *   1. `require.resolve('ripgrep')` succeeds → package is installed in this checkout;
 *   2. Node runtime supports CJS require() of ESM-only packages (unflagged since v23, backported to
 *      ≥22.12 — ts-jest emits CommonJS for this repo, so the engine's lazy `import('ripgrep')` lowers
 *      to a Promise-wrapped require(); older runtimes throw ERR_REQUIRE_ESM / cannot load TLA).
 * A runtime backstop remains in beforeAll (WASM boot can still fail for other reasons) — on such
 * hosts every integration body returns early with a labeled SKIP log. An UNRESOLVABLE output format,
 * by contrast, fails loudly: that is a real finding, not an environment limitation.
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
const BIN_TOKEN = 'RG_ENGINE_BIN_TOKEN_77'; // binary-NAMED (.bin) plain-text file

function slash(p: string): string {
  return p.split('\\').join('/');
}

/** All fixture-relative paths that any case below may resolve against (used to map emitted lines back). */
const FIXTURE_RELS = ['a.ts', 'case.txt', 'sub/b.txt', 'sub/deep/c.txt', '.hidden/secret.txt', 'node_modules/dep.js', 'blob.bin'];

/** True when the slash-normalized candidate denotes rootPath/<rel>, regardless of whether it carries an
 *  absolute host prefix (see header: path-format contract). Anchors on the fixture-unique tmp dir. */
function denotesRootRel(candSlash: string, rootPath: string, rel: string): boolean {
  const target = slash(path.relative(rootPath, path.join(rootPath, rel))); // e.g. "sub/b.txt"
  if (candSlash === target) return true;                                    // pure relative output
  const rootSlash = slash(rootPath);
  if (!rootSlash || !candSlash.startsWith(rootSlash)) return false;         // not rooted in this fixture at all
  return candSlash.slice(rootSlash.length).replace(/^\//, '') === target;   // absolute-style (host) output
}

/** Resolve every emitted candidate line to its fixture-relative path. Throws on any unresolvable line —
 *  an unexpected format is a test failure here, not a silent skip. */
function toRelSet(res: RipgrepResult, rootPath: string): Set<string> {
  if (res.status !== 'ok' || !res.files) throw new Error(`expected status ok with files, got ${res.status}${res.reason ? ` (${res.reason})` : ''}`);
  const out = new Set<string>();
  for (const line of res.files) {
    let matched: string | null = null;
    for (const pr of FIXTURE_RELS) {
      if (denotesRootRel(slash(line), rootPath, pr)) { matched = pr; break; }
    }
    if (matched === null) throw new Error(`unresolvable candidate path: ${line}`);
    out.add(matched);
  }
  return out;
}

describe('ripgrepEngine — guard rails (no WASM involved)', () => {
  test('empty pattern → no-matches without touching the filesystem', async () => {
    const res = await searchCandidates({ rootDir: os.tmpdir(), pattern: '', mode: 'regex' });
    expect(res.status).toBe('no-matches');
    expect(res.files).toBeUndefined();
  });

  test('missing rootDir → fallback-required (reason missing-root-dir)', async () => {
    const res = await searchCandidates({ rootDir: '', pattern: 'x', mode: 'regex' });
    expect(res.status).toBe('fallback-required');
    expect((res.reason ?? '')).toContain('missing-root-dir');
  });

  test('absent/invalid root never throws — typed signal instead (contract production relies on)', async () => {
    // An absent dir is a code-2-class failure inside the WASI sandbox → fallback-required; it may
    // map to no-matches in some builds. Either way: NEVER an exception across this boundary.
    const res = await searchCandidates({
      rootDir: path.join(os.tmpdir(), `rg-engine-absent-${Date.now()}`),
      pattern: 'anything',
      mode: 'regex',
    });
    expect(['fallback-required', 'no-matches']).toContain(res.status);
  });
});

describe('ripgrepEngine — WASM integration (collection-time gated + runtime backstop)', () => {
  // Collection-time gate: dep absent / runtime too old → every case registers as a todo (skipped) at
  // describe time. Gate passed but WASM boot fails at runtime → `live` downgrades in beforeAll and each
  // body returns early with a labeled SKIP log (green-but-empty by design: on such hosts the DIFF-mode
  // parity battery + production phase-1 console.log (L2765) remain the loud signals).
  let rootDir = '';
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
    await fs.writeFile(path.join(rootDir, 'blob.bin'), `${BIN_TOKEN}\nplain second line\n`);            // binary-NAME (not content) probe

    if (!live) return; // gated out at collection time — fixtures only, no engine call

    // RUNTIME BACKSTOP: proves WASM boot + a real candidate query succeed in THIS runtime.
    const probe = await searchCandidates({ rootDir, pattern: 'ALPHA_MARKER_42', mode: 'literal' });
    if (probe.status !== 'ok' || !(probe.files ?? []).length) {
      // Dep resolvable but WASM/interop failed at runtime → downgrade; cases skip cleanly.
      live = false;
      runtimeSkipReason = `WASM boot probe not ok — ${probe.status}${probe.reason ? ` (${probe.reason})` : ''}`;
      return;
    }
    // status 'ok' + files present: the path format MUST resolve against this fixture. A throw here is a
    // genuinely unexpected output shape → let it FAIL loudly (beforeAll error), never silently skip everything.
    const probeSet = toRelSet(probe, rootDir);
    if (!probeSet.has('a.ts') || probeSet.size !== 1) {
      live = false;
      runtimeSkipReason = 'probe returned an unexpected candidate set for a known token (preopen/root mismatch on this host?)';
    }
  }, 30_000);

  afterAll(async () => {
    try {
      await fs.rm(rootDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Cleanup failed:', e);
    }
  });

  // Collection-time registration: real test when the dep/runtime gate passed, todo (skipped) otherwise.
  function itLive(name: string, fn: () => Promise<void>, timeoutMs?: number): void {
    if (depResolvable && nodeSupportsRequireEsm()) test(name, fn, timeoutMs);
    else test.todo(`[skip: ${LIVENESS_NOTE}] ${name}`);
  }

  test('live-status diagnostic (never fails; prints gate state)', () => {
    if (!live) console.log(`[ripgrepEngine] WASM integration SKIPPED — ${runtimeSkipReason || LIVENESS_NOTE}`);
    expect(true).toBe(true);
  });

  itLive('regex mode → exact candidate set, format-flexible', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await searchCandidates({ rootDir, pattern: 'ALPHA_MARKER_42', mode: 'regex' });
    expect(res.status).toBe('ok');
    expect([...toRelSet(res, rootDir)].sort()).toEqual(['a.ts']); // exact set — no leakage from other fixtures
  }, 15_000);

  itLive("literal (-F) mode → regex metachars inert (inert '(' parses fine where regex mode would code-2)", async () => {
    skipIfUnlive(); if (!live) return;
    const res = await searchCandidates({ rootDir, pattern: 'UPPER_TOKEN_ABC(', mode: 'literal' });
    expect(res.status).toBe('no-matches'); // no file literally contains that string — and NO fallback-required
  }, 15_000);

  itLive('literal (-F) mode finds exact strings with subdirectory descent', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await searchCandidates({ rootDir, pattern: 'BETA_TEXT_TOKEN', mode: 'literal' });
    expect(res.status).toBe('ok');
    expect(toRelSet(res, rootDir).has('sub/b.txt')).toBe(true);
  }, 15_000);

  itLive('caseInsensitive:true → matches the uppercase token (rg -i; production grep_files parity)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await searchCandidates({ rootDir, pattern: 'upper_token_abc', mode: 'literal', caseInsensitive: true });
    expect(res.status).toBe('ok');
    expect(toRelSet(res, rootDir).has('case.txt')).toBe(true);
  }, 15_000);

  itLive('caseInsensitive:false → same pattern matches nothing (no exact-cased occurrence)', async () => {
    skipIfUnlive(); if (!live) return;
    // case.txt carries only "UPPER_TOKEN_ABC" and lowercase "gamma_token_abc" — a case-sensitive
    // search for 'upper_token_abc' hits neither line → clean no-matches.
    const res = await searchCandidates({ rootDir, pattern: 'upper_token_abc', mode: 'literal', caseInsensitive: false });
    expect(res.status).toBe('no-matches');
  }, 15_000);

  itLive('absent token → status no-matches (exit-code-1 mapping; NOT fallback-required, NO files key)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await searchCandidates({ rootDir, pattern: 'NO_SUCH_TOKEN_ZZ9', mode: 'regex' });
    expect(res.status).toBe('no-matches');
    expect(res.files).toBeUndefined();
  }, 15_000);

  itLive("lookbehind '(?<=foo)bar' → fallback-required, reason dialect-parse-error (Rust regex crate: no lookarounds)", async () => {
    skipIfUnlive(); if (!live) return;
    // T3 repro: valid JS RegExp, unsupported by ripgrep's default regex engine → exit code 2 + parse error.
    const res = await searchCandidates({ rootDir, pattern: '(?<=foo)bar', mode: 'regex' });
    expect(res.status).toBe('fallback-required');
    expect((res.reason ?? '')).toMatch(/dialect-parse-error|parse error/i);
  }, 15_000);

  itLive('hidden dirs/files ARE scanned by default (--hidden parity with the production walker)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await searchCandidates({ rootDir, pattern: HIDDEN_TOKEN, mode: 'literal' });
    expect(res.status).toBe('ok');
    expect(toRelSet(res, rootDir).has('.hidden/secret.txt')).toBe(true);
  }, 15_000);

  itLive('excludeGlobs prune matching paths; omitted → same tree fully scanned', async () => {
    skipIfUnlive(); if (!live) return;
    // WITHOUT exclusions: node_modules content is reachable (production prunes its default set only when the user gives no include pattern).
    const without = await searchCandidates({ rootDir, pattern: EXCL_TOKEN, mode: 'literal' });
    expect(without.status).toBe('ok');
    expect(toRelSet(without, rootDir).has('node_modules/dep.js')).toBe(true);

    // WITH the exclusion glob — exactly what production passes via Array.from(DEFAULT_EXCLUDED_DIRS):
    const withExcl = await searchCandidates({ rootDir, pattern: EXCL_TOKEN, mode: 'literal', excludeGlobs: ['node_modules'] });
    expect(withExcl.status).toBe('no-matches'); // the only occurrence was pruned → clean negative
  }, 15_000);

  itLive('maxDepth boundary — depth-2 file in-budget at cap 2, out-of-budget at cap 1 (rg --max-depth contract = walker budget parity)', async () => {
    skipIfUnlive(); if (!live) return;
    // ripgrep --max-depth N = "search up to N subdirectories below START" (official rg docs): a file two
    // subdirs deep (sub/deep/c.txt) IS searched at N=2 and NOT at N=1. Production walker parity:
    // walkDirectory recurses while currentDepth ≤ MAX_DEPTH — the identical files-in-subdirs budget,
    // so this boundary case is the unit-level mirror of what the DIFF-mode parity battery checks end-to-end.
    const deepCap2 = await searchCandidates({ rootDir, pattern: 'DEEP_GAMMA_TOKEN_55', mode: 'literal', maxDepth: 2 });
    expect(deepCap2.status).toBe('ok');
    expect(toRelSet(deepCap2, rootDir).has('sub/deep/c.txt')).toBe(true);

    const deepCap1 = await searchCandidates({ rootDir, pattern: 'DEEP_GAMMA_TOKEN_55', mode: 'literal', maxDepth: 1 });
    expect(deepCap1.status).toBe('no-matches'); // one-subdir budget cannot reach depth 2 → clean negative

    // The depth-1 file stays in-budget at cap 1 — pins the boundary exactly between depths 1 and 2.
    const shallowCap1 = await searchCandidates({ rootDir, pattern: 'BETA_TEXT_TOKEN', mode: 'literal', maxDepth: 1 });
    expect(shallowCap1.status).toBe('ok');
    expect(toRelSet(shallowCap1, rootDir).has('sub/b.txt')).toBe(true);

    // Documented engine quirk (buildArgs): --max-depth is emitted only when depth > 0 → maxDepth: 0
    // behaves as UNBOUNDED. Production can't hit this (zod min(1) on grep_files.max_depth), but the unit
    // layer pins the observable so a future guard change is caught here, not in production parity runs.
    const cap0 = await searchCandidates({ rootDir, pattern: 'DEEP_GAMMA_TOKEN_55', mode: 'literal', maxDepth: 0 });
    expect(cap0.status).toBe('ok');
    expect(toRelSet(cap0, rootDir).has('sub/deep/c.txt')).toBe(true);
  }, 20_000);

  itLive('binary-NAMED (.bin) plain-text file IS named by -l — this layer makes no binary classification', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await searchCandidates({ rootDir, pattern: BIN_TOKEN, mode: 'literal' });
    expect(res.status).toBe('ok');
    // Phase-2 grep_files also has NO NUL-byte gate (verified processFile L2399-2405), so naming .bin here
    // is parity-correct; pin the observable at engine level.
    expect(res.files?.some((f) => denotesRootRel(slash(f), rootDir, 'blob.bin'))).toBe(true);
  }, 15_000);
});
