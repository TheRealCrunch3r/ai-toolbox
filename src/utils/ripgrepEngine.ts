/**
 * ripgrepEngine — self-contained ripgrep-backed candidate-file filter for grep_files (P2-G6) and,
 * later, pattern_scan (queued follow-up B'; the API is deliberately shaped for BOTH consumers).
 *
 * DESIGN CONTRACTS (from P0 spike evidence + verified source reads, 01.09.2026):
 *
 * 1) TWO-PHASE SPLIT — this module returns CANDIDATE FILES ONLY (-l semantics). It never shapes
 *    match lines: the existing processWithRegex shaping layer (line-split, >20k-char line gate,
 *    .trim(), max_content_length truncation + '…', 1-based line numbers, include_context,
 *    MAX_RESULTS early exit) runs UNCHANGED on the candidate set. That is what makes P3 parity
 *    trivially verifiable: every visible output field is produced by code that already exists.
 *
 * 2) LAZY DEPENDENCY — 'ripgrep' (pithings/ripgrep-node v0.3.1, ESM-only WASM build of rg 15.x)
 *    is imported ONLY on first use via dynamic import() inside try/catch (mirrors the FIX-HANG-5
 *    lazy-load discipline): a missing/broken dep degrades to { status:'fallback-required' } and
 *    NEVER breaks plugin boot, because no top-level require/import of it exists.
 *
 * 3) EXIT-CODE MAPPING (documented in ripgrep/lib/index.d.mts: "0 = matches found,
 *    1 = no matches, 2 = error"):
 *        code 0 → { status:'ok', files }          — candidates found
 *        code 1 → { status:'no-matches' }         — clean negative; NOT an error
 *        code 2 → { status:'fallback-required', reason } — includes Rust-dialect parse errors
 *                  (lookarounds/backreferences), which the caller serves from the FULL JS pipeline.
 *    The dialect gap is detected here at compile time (~2-3ms per T3) and converted into a typed
 *    signal; no exception crosses this boundary.
 *
 * 4) FLAG MIRRORING — the current grep_files walker (fileSystemTools.ts L2626-2692, verified):
 *        - prunes DEFAULT_EXCLUDED_DIRS by NAME only when NO include pattern is given
 *        - scans dot-dirs / hidden files otherwise (no gitignore semantics at all)
 *      → rg mirror = --no-ignore --no-require-git --hidden + one -g '!<name>' per exclusion the
 *      caller supplies. Exclusions are CALLER-SUPPLIED on purpose: grep_files' 12-name set and
 *      pattern_scan's set DIFFER (the P0 spike script mirrored pattern_scan, not grep_files — do
 *      not "fix" this toward symmetry). Depth is bounded via --max-depth to the caller's cap.
 *      Case sensitivity is a PARAMETER: grep_files compiles every regex with 'i' (verified L2322/
 *      2325/2354/2357) → passes caseInsensitive:true; pattern_scan defaults caseSensitive:true →
 *      will pass false. Never hardcode -i here.
 *
 * 5) SIZE GATE STAYS IN PHASE 2 — no --max-filesize flag: the production size gate reports
 *    skipped_files entries with exact byte counts (L2374-2379), and rg's --max-filesize uses a
 *    different unit/rounding model. Candidates may include over-size files; processFile re-applies
 *    its own stat gate and emits the identical skip record as today.
 *
 * 6) BOOLEAN-EQUIVALENCE NOTE — phase 2 records per-line PRESENCE only (which branch of a split
 *    alternation matched never appears in output), so giving rg the UN-splitted top-level pattern
 *    yields exactly the same candidate file set as N separate branch regexes. Branch splitting stays
 *    on the JS fallback path where it was originally introduced (backtracking protection).
 */

/** Search mode: 'regex' = compiled Rust-regex, 'literal' = ripgrep fixed-string (-F), used for the
 *  auto_escaped / isSafeRegex-demoted literal paths today and pattern_scan's demotion later. */
export interface RipgrepSearchParams {
  /** Absolute target — a directory to scan OR a single file (mirrors grep_files' dual-target mode). */
  rootDir: string;
  /** Raw user pattern, unmodified by this module. */
  pattern: string;
  /** 'regex' or 'literal' (fixed-string). Callers decide via the existing classification pipeline. */
  mode: 'regex' | 'literal';
  /** True → rg -i. grep_files always passes true today. */
  caseInsensitive?: boolean;
  /** Directory/file exclusion globs, one entry each — emitted as separate `-g '!<glob>'` flags.
   *  grep_files passes its DEFAULT_EXCLUDED_DIRS names ONLY when the user gave no include pattern. */
  excludeGlobs?: string[];
  /** Max directory depth below rootDir (rg --max-depth). Default 10 mirrors production MAX_DEPTH. */
  maxDepth?: number;
}

export type RipgrepStatus = 'ok' | 'no-matches' | 'fallback-required';

export interface RipgrepResult {
  status: RipgrepStatus;
  /** Candidate files (rg -l output, one per line) — present only when status === 'ok'. */
  files?: string[];
  /** Why a fallback is needed ('dialect-parse-error' | 'missing-dependency' | ...). Diagnostic. */
  reason?: string;
}

/** Module-level lazy-import state: cached promise so the WASM boot cost (~11ms cold per T1) is paid
 *  once per process. `typeof import('ripgrep')` reuses the package's own .d.mts — no hand-rolled
 *  signature to drift out of sync (verified against node_modules/ripgrep/lib/index.d.mts, v0.3.1). */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type RipgrepModule = typeof import('ripgrep');

let rgImportPromise: Promise<RipgrepModule> | null = null;

function loadRipgrep(): Promise<RipgrepModule> {
  if (!rgImportPromise) {
    rgImportPromise = import('ripgrep').catch((err) => {
      // Reset so a transient failure (e.g. first-boot race) can be retried on the next call, while a
      // genuinely missing package stays cheap: re-import of an absent ESM module fails immediately.
      rgImportPromise = null;
      throw err instanceof Error ? err : new Error(String(err));
    });
  }
  return rgImportPromise;
}

/** Build the argument vector mirroring production walker semantics (see header §4). */
function buildArgs(params: RipgrepSearchParams): string[] {
  const args: string[] = [
    // Parity flags — scan-everything, no gitignore, hidden included (verified walker behavior L2643-2654)
    '--no-ignore',
    '--no-require-git',
    '--hidden',
    '--color=never',
    '-l', // one line per matching FILE (candidate set only — shaping stays in phase 2)
  ];
  if (params.mode === 'literal') args.push('--fixed-strings');
  if (params.caseInsensitive) args.push('-i');
  // DEPTH-BUDGET PARITY (G9, 01.09.2026 — P3 live evidence): the production JS walker includes files whose
  // CONTAINING DIRECTORY sits at depth <= MAX_DEPTH (fileSystemTools.ts walkDirectory guard
  // `if (currentDepth > MAX_DEPTH) return;`, root dir = depth 0). Measured behavior of rg 15.x WASM here:
  // --max-depth=N includes only directories of depth < N — one level SHORTER at the boundary than the walker's
  // budget (tests/ripgrepEngine.test.ts maxDepth case: sub/deep/c.txt missed at cap 2). Emitting cap+1 restores
  // exact budget parity; rg can then name files in exactly the directories the JS walk would scan. The +1 never
  // over-includes at production's default (cap 10 → --max-depth=11, both budgets cover depth <= 10), and a future
  // change to walker boundary semantics is pinned by that unit test rather than discovered in parity runs.
  // Pinned quirk (kept from P2, asserted by the unit test): maxDepth: 0 emits NO flag at all → unbounded.
  const budget = params.maxDepth ?? 10;
  if (Number.isFinite(budget) && budget > 0) args.push(`--max-depth=${budget + 1}`);
  for (const g of params.excludeGlobs ?? []) {
    // Negation inside the glob value: -g '!node_modules' prunes matching paths.
    args.push('--glob', `!${g}`);
  }
  args.push(params.pattern, params.rootDir);
  return args;
}

/**
 * Run the ripgrep candidate-file filter.
 * NEVER throws — every failure mode resolves to { status:'fallback-required' }.
 */
export async function searchCandidates(params: RipgrepSearchParams): Promise<RipgrepResult> {
  // --- Guard rails (cheap, before any IO) ---------------------------------------------
  if (!params.pattern || params.pattern.length === 0) {
    return { status: 'no-matches' }; // empty pattern is a no-op in production too (isSafeRegex rejects; caller would have demoted — belt & braces)
  }
  if (!params.rootDir) {
    return { status: 'fallback-required', reason: 'missing-root-dir' };
  }

  let mod: RipgrepModule;
  try {
    mod = await loadRipgrep();
  } catch (err) {
    // Missing/broken dependency → full JS pipeline. Boot is never at risk (lazy import, header §2).
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 'fallback-required', reason: `missing-dependency: ${msg.slice(0, 160)}` };
  }

  const args = buildArgs(params);
  let res: { code: number; stdout?: string; stderr?: string };
  try {
    // buffer:true captures both streams (no TTY color injection — verified in lib/index.mjs).
    // preopens: make the target visible inside the WASI sandbox explicitly rather than relying on
    // the arg-scanning auto-preopen alone (deterministic under any process cwd).
    res = await mod.ripgrep(args, {
      buffer: true,
      preopens: { [params.rootDir]: params.rootDir },
    });
  } catch (err) {
    // Runtime/WASI-level failure (not an rg exit code) — treat as fallback; the JS pipeline is safe.
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 'fallback-required', reason: `wasi-runtime-error: ${msg.slice(0, 160)}` };
  }

  // --- Exit-code mapping (header §3; codes per ripgrep/lib/index.d.mts + T3 evidence) ----
  if (res.code === 2) {
    const detail = String(res.stderr || '').trim().slice(0, 160);
    // Dialect parse errors ('rg: regex parse error') are the EXPECTED common cause; other code-2
    // conditions (IO/permission inside the sandboxed tree) fall back identically.
    const reason = /parse error/i.test(detail) ? `dialect-parse-error: ${detail}` : `exit-code-2: ${detail || 'no stderr'}`;
    return { status: 'fallback-required', reason };
  }
  if (res.code === 1) {
    return { status: 'no-matches' };
  }
  // code 0 — parse stdout into candidate paths.
  const raw = String(res.stdout || '');
  const files: string[] = [];
  for (const line of raw.split('\n')) {
    if (line.length > 0) files.push(line);
  }
  return { status: 'ok', files };
}
