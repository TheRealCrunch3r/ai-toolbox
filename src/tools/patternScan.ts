/**
 * pattern_scan — standalone recursive content search (clean-room module).
 *
 * Design principles:
 *  1. Fail fast on unsafe patterns (ReDoS) via isSafeRegex BEFORE any disk I/O.
 *     Unsafe or syntactically-invalid regexes are auto-demoted to literal mode;
 *     the result reports which (`demotedToLiteral`). A call therefore always
 *     yields signal instead of hanging or throwing.
 *  2. Never block the event loop: fully async I/O, bounded file-read concurrency.
 *  3. Hard resource ceilings with explicit reporting: oversized files ('size'),
 *     line-capped files ('line-cap') and binary files ('binary') land in `skipped` —
 *     they are never silently stalled on or truncated.
 *  4. Deterministic ordering: BFS by depth, then name; final matches sorted by
 *     (file, line) regardless of worker scheduling.
 *  5. Lean deps: node builtins + shared isSafeRegex (+ ripgrepEngine ONLY for the optional B' phase-1 prefilter —
 *     it never gates correctness: any non-ok engine status falls back to the byte-identical full-JS pipeline).
 * PREFERENCE (project convention, 31.08): for content search use THIS tool over grep_files; grep_files only for AST-mode queries.
 * B' (Option A port from grep_files v1.9.13+): ripgrep phase-1 names matching files (-l); workers scan the named candidates and gate-probe
 *     non-named ones, so 'size'/line-cap skip records stay byte-identical to the full walk. Documented divergence: NO 'binary' skip record for a file rg proved pattern-absent (binary detection needs content inspection).
 */

import fs from 'fs/promises';
import path from 'path';
import type { Dirent } from 'fs';
import { isSafeRegex } from '../security';
// B': ripgrep phase-1 candidate prefilter (Option A architecture — same fallback guarantee as grep_files v1.9.13+).
// The engine module lazy-imports its WASM dep and never throws, so this import costs nothing at boot.
// Import path mirrors fileSystemTools.ts L16 exactly ('../utils/ripgrepEngine.js') to keep one module identity.
import { searchCandidates } from '../utils/ripgrepEngine.js';

// ---------------------------------------------------------------------------
// Defaults (frozen; every field overridable per-call via options)
// ---------------------------------------------------------------------------

export const SCAN_DEFAULTS = Object.freeze({
  mode: 'regex' as const, // 'regex' | 'literal'
  caseSensitive: true,
  maxDepth: 10, // files up to this many dirs below root are scanned (root-level files = depth 0, always scanned)
  maxFileSizeBytes: 256 * 1024, // larger files are skipped + reported
  maxFileLines: 10_000, // scanning stops after this many lines per file (file still reported as 'line-cap' if longer)
  maxMatchesPerFile: 50, // cap matches within one file (prevents single-file result floods)
  maxTotalMatches: 200, // global cap — `stats.truncated` is true when hit
  matchLineLength: 300, // reported line content truncated beyond this ('…' appended)
  concurrency: 4, // files read in parallel (clamped to 1..16)
});

export type ScanMode = 'regex' | 'literal';

export interface PatternScanOptions {
  pattern: string; // required — non-empty after trim
  root?: string; // directory or single file (default '.'). Single-file roots ignore globs by design.
  mode?: ScanMode; // default 'regex'
  caseSensitive?: boolean; // default true
  includeGlobs?: string[]; // directory mode only — e.g. ['*.ts', 'src/**/*.md']; matched against relative path AND basename
  excludeGlobs?: string[]; // directory mode only — merged with DEFAULT_EXCLUDE_DIRS semantics; a matching dir is pruned whole
  maxDepth?: number;
  maxFileSizeBytes?: number;
  maxFileLines?: number;
  maxMatchesPerFile?: number;
  maxTotalMatches?: number;
  matchLineLength?: number;
  concurrency?: number; // clamped to 1..16
}

export interface ScanMatch { file: string; line: number; content: string; }
export interface SkippedEntry { file: string; reason: 'size' | 'line-cap' | 'binary'; }

export interface PatternScanResult {
  ok: boolean;
  matches: ScanMatch[]; // sorted by (file, line)
  skipped: SkippedEntry[]; // files touched but not fully scanned — with why
  excludedDirs: string[]; // directory names pruned via DEFAULT_EXCLUDE_DIRS / excludeGlobs (deduped, sorted)
  stats: { filesScanned: number; totalMatches: number; durationMs: number; truncated: boolean };
  demotedToLiteral?: 'unsafe-regex' | 'invalid-regex';
  error?: string; // only when ok === false
}

/** Directory names never scanned (build/dep/runtime artifacts). Applied to every call. */
export const DEFAULT_EXCLUDE_DIRS: readonly string[] = [
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '__pycache__', '.venv', 'coverage', '.ai_toolbox_backups',
];

// ---------------------------------------------------------------------------
// Glob matching (clean-room, minimal): *, ? and ** (any number of segments incl. zero)
// ---------------------------------------------------------------------------

function globToRegExp(glob: string): RegExp {
  const g = glob.replace(/\\/g, '/'); // normalize to posix-style for matching
  let re = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') {
        re += '.*'; // '**' crosses segment boundaries (incl. matching zero segments)
        i++;
        if (g[i + 1] === '/') i++; // consume following '/' so leading/trailing ** don't require one
      } else {
        re += '[^/]*'; // single * never crosses a segment boundary
      }
    } else if (c === '?') {
      re += '[^/]';
    } else if ('\\.^$+(){}[]|'.includes(c)) {
      re += '\\' + c; // escape regex metacharacters — globs can never produce a ReDoS-capable regex
    } else {
      re += c;
    }
  }
  return new RegExp(`^${re}$`);
}

function matchesAnyGlobs(globs: readonly string[], relPath: string, basename: string): boolean {
  for (const glob of globs) {
    const rx = globToRegExp(glob);
    if (rx.test(relPath) || rx.test(basename)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Binary detection + per-file scanning
// ---------------------------------------------------------------------------

function looksBinary(buf: Buffer, sampleBytes: number): boolean {
  const n = Math.min(sampleBytes, buf.length);
  if (n === 0) return false;
  let suspicious = 0;
  for (let i = 0; i < n; i++) {
    const b = buf[i];
    if (b === 0) return true; // NUL anywhere in sample — conclusive
    if (b < 9 || (b > 13 && b < 27)) suspicious++; // other C0 controls (except \t, \n, \r) — heuristic
  }
  return suspicious / n > 0.05;
}

interface ScanLimits { maxLines: number; perFileCap: number; lineLenCap: number; sizeLimit: number; totalCap: number; }

export interface FileScanOutcome {
  matches: ScanMatch[];
  skipReason?: 'line-cap' | 'binary'; // 'size' is decided by caller from stat, before read
}

/**
 * Reads one file and collects matching lines.
 * `rx` always carries /g — lastIndex is reset immediately before each .test(),
 * and no await happens between reset and test, so sharing one instance across
 * concurrent workers is safe on the single-threaded event loop.
 * `remaining` = best-effort global quota (early stop; the authoritative cap is
 * enforced by patternScan via sort+slice after all files complete).
 */
async function scanFileWithLimits(absolutePath: string, relPath: string, rx: RegExp, lim: ScanLimits, remaining: number): Promise<FileScanOutcome> {
  const buf = await fs.readFile(absolutePath);
  if (looksBinary(buf, Math.min(8192, buf.length))) return { matches: [], skipReason: 'binary' };

  const lines = buf.toString('utf-8').split(/\r?\n/); // split FIRST — line-cap works even on unbounded-line files
  const scanned = Math.min(lines.length, lim.maxLines);
  const out: ScanMatch[] = [];
  for (let i = 0; i < scanned && remaining > 0; i++) {
    rx.lastIndex = 0;
    if (!rx.test(lines[i])) continue;
    let content = lines[i].trim();
    if (content.length > lim.lineLenCap) content = content.slice(0, Math.max(0, lim.lineLenCap - 1)) + '…';
    out.push({ file: relPath, line: i + 1, content });
    remaining--; // hard global cap — takes priority over per-file cap
    if (out.length >= lim.perFileCap) break;
  }
  return scanned < lines.length ? { matches: out, skipReason: 'line-cap' } : { matches: out };
}

// ---------------------------------------------------------------------------
// Directory walk (BFS, bounded depth, exclude-pruned, deterministic order)
// ---------------------------------------------------------------------------

interface WalkTarget { abs: string; rel: string; } // rel = posix path relative to root

async function walkDirectory(rootAbs: string, maxDepth: number, excludeGlobs: readonly string[]): Promise<{ files: WalkTarget[]; excludedDirs: Set<string>; }> {
  const files: WalkTarget[] = [];
  const excluded = new Set<string>();
  interface QEntry { dirAbs: string; rel: string; depth: number; } // depth of THIS directory below root (root = 0)
  const queue: QEntry[] = [{ dirAbs: rootAbs, rel: '', depth: 0 }];

  for (;;) {
    const cur = queue.shift();
    if (!cur) break; // BFS complete
    let entries: Dirent[];
    try { entries = await fs.readdir(cur.dirAbs, { withFileTypes: true }); } catch { continue; // unreadable dir — skip
    }
    for (const e of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
      if (DEFAULT_EXCLUDE_DIRS.includes(e.name)) { excluded.add(e.name); continue; }
      const rel = cur.rel === '' ? e.name : `${cur.rel}/${e.name}`;
      // A directory matching an exclude glob is pruned whole.
      if (matchesAnyGlobs(excludeGlobs, rel, e.name)) { excluded.add(e.name); continue; }

      let isDir = e.isDirectory();
      let isFile = e.isFile();
      if (!isDir && !isFile) {
        if (e.isSymbolicLink()) {
          try { const st = await fs.stat(path.join(cur.dirAbs, e.name)); isDir = st.isDirectory(); isFile = st.isFile(); } catch { continue; // broken link — skip
          }
        } else { continue; } // sockets/fifos/etc.
      }
      if (isDir) {
        // Descend into a child at depth d only while d <= maxDepth → files up to file-depth maxDepth are scanned.
        const child = { dirAbs: path.join(cur.dirAbs, e.name), rel, depth: cur.depth + 1 };
        if (child.depth <= maxDepth) queue.push(child);
      } else {
        files.push({ abs: path.join(cur.dirAbs, e.name), rel });
      }
    }
  }
  return { files, excludedDirs: excluded };
}

// ---------------------------------------------------------------------------
// Matcher construction (ReDoS-gated)
// ---------------------------------------------------------------------------

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildMatcher(pattern: string, mode: ScanMode, caseSensitive: boolean): { rx: RegExp; demotedToLiteral?: 'unsafe-regex' | 'invalid-regex'; } {
  const flags = (caseSensitive ? '' : 'i') + 'g';
  if (mode === 'literal') return { rx: new RegExp(escapeRegExp(pattern), flags) };

  if (!isSafeRegex(pattern)) { // ReDoS gate — BEFORE constructing anything
    return { rx: new RegExp(escapeRegExp(pattern), flags), demotedToLiteral: 'unsafe-regex' };
  }
  try {
    return { rx: new RegExp(pattern, flags) };
  } catch {
    return { rx: new RegExp(escapeRegExp(pattern), flags), demotedToLiteral: 'invalid-regex' };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search file contents under `root` (or a single file) for `pattern`.
 * Never throws — all failures are returned as `{ ok: false, error }`.
 */
export async function patternScan(options: PatternScanOptions): Promise<PatternScanResult> {
  const started = Date.now();
  const base = (): Pick<PatternScanResult, 'stats'> => ({ stats: { filesScanned: 0, totalMatches: 0, durationMs: Date.now() - started, truncated: false } });

  // --- Input validation -------------------------------------------------------
  if (!options || typeof options.pattern !== 'string' || options.pattern.trim() === '') {
    return { ok: false, matches: [], skipped: [], excludedDirs: [], ...base(), error: 'pattern is required (non-empty string)' };
  }
  const pattern = options.pattern.trim(); // intentional: search patterns are not whitespace-anchored by user intent
  const rootRaw = String(options.root ?? '.').trim() || '.';

  let rootAbs: string;
  try { rootAbs = path.resolve(process.cwd(), rootRaw); } catch { return { ok: false, matches: [], skipped: [], excludedDirs: [], ...base(), error: `invalid root path: ${rootRaw}` }; }

  const built = buildMatcher(pattern, options.mode ?? 'regex', options.caseSensitive ?? true);
  const excludeGlobs = options.excludeGlobs ?? [];

  // --- Resolve target set ------------------------------------------------------
  interface Target { abs: string; rel: string; } // rel: cwd-relative for single-file roots, root-relative in directory mode (documented)
  let targets: Target[] = [];
  const excludedDirs = new Set<string>();
  // B': phase-1 inputs captured during resolution (consumed by the RIPGREP PHASE-1 block below).
  let targetKind: 'file' | 'dir' = 'dir';
  let effectiveMaxDepth: number = SCAN_DEFAULTS.maxDepth; // explicit number — initializer carries a narrowed literal type (TS2322 at the dir-branch reassignment below)
  try {
    const st = await fs.stat(rootAbs);
    if (st.isFile()) {
      targetKind = 'file';
      targets = [{ abs: rootAbs, rel: path.relative(process.cwd(), rootAbs).split(path.sep).join('/') || path.basename(rootAbs) }];
    } else if (st.isDirectory()) {
      const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? SCAN_DEFAULTS.maxDepth));
      effectiveMaxDepth = maxDepth; // B': phase-1 depth budget — same clamp the walker applies below
      const walked = await walkDirectory(rootAbs, maxDepth, excludeGlobs);
      walked.excludedDirs.forEach((d) => excludedDirs.add(d));
      targets = walked.files.filter((t) => {
        const b = path.basename(t.abs);
        if ((options.includeGlobs?.length ?? 0) > 0 && !matchesAnyGlobs(options.includeGlobs as string[], t.rel, b)) return false;
        if (excludeGlobs.length > 0 && matchesAnyGlobs(excludeGlobs, t.rel, b)) return false; // file-level exclude (dir pruning already done in walk)
        return true;
      });
    } else {
      return { ok: false, matches: [], skipped: [], excludedDirs: [...excludedDirs].sort(), ...base(), error: `root is neither a file nor directory: ${rootRaw}` };
    }
  } catch (err) {
    return { ok: false, matches: [], skipped: [], excludedDirs: [...excludedDirs].sort(), ...base(), error: err instanceof Error ? `cannot stat root: ${err.message}` : 'cannot stat root' };
  }

  // --- Effective limits ---------------------------------------------------------
  const lim: ScanLimits = {
    maxLines: Math.max(1, Math.floor(options.maxFileLines ?? SCAN_DEFAULTS.maxFileLines)),
    perFileCap: Math.max(1, Math.floor(options.maxMatchesPerFile ?? SCAN_DEFAULTS.maxMatchesPerFile)),
    lineLenCap: Math.max(8, Math.floor(options.matchLineLength ?? SCAN_DEFAULTS.matchLineLength)),
    sizeLimit: Math.max(1024, Math.floor(options.maxFileSizeBytes ?? SCAN_DEFAULTS.maxFileSizeBytes)),
    totalCap: Math.max(1, Math.floor(options.maxTotalMatches ?? SCAN_DEFAULTS.maxTotalMatches)),
  };

  // --- RIPGREP PHASE-1 — candidate-file prefilter (B', mirrors grep_files Option A) -------------
  // rg returns only files whose content matches (-l); ALL line shaping and every resource gate stay in the worker
  // pipeline below, so on 'ok' the only behavioral change is that non-named targets are never READ for match work.
  // Skip-record parity (required): non-named targets still pass the stat size gate AND a newline-count read (Buffer,
  // no utf8 decode — same technique as grep_files), so 'size' and 'line-cap' records are emitted exactly as in the
  // pre-B' pipeline. The one documented divergence: 'binary' skips are NOT emitted for files rg proved pattern-absent
  // (binary detection needs content inspection; such a file is unobservable in every output field except skipped[]).
  // Gate order mirrors the worker: size first, then line count.
  // ANY status other than 'ok' ('no-matches', 'fallback-required' incl. dialect parse error / missing dep / WASI
  // error, or an unexpected throw) leaves rgCandidateRels null → the FULL JS pipeline runs exactly as before. No
  // short-circuit: even a clean 'no-matches' still walks and gates so skipped[]/excludedDirs/stats stay identical.
  let rgCandidateRels: Set<string> | null = null;
  try {
    const phase1Mode: ScanMode = (options.mode ?? 'regex') === 'literal' || built.demotedToLiteral ? 'literal' : 'regex';
    // Exclusions handed to rg are the always-applied DEFAULT_EXCLUDE_DIRS names ONLY. User excludeGlobs use this
    // module's custom glob semantics (basename match, '^'-anchored, '**'), which differ from rg -g handling — over-
    // exclusion there could drop files the walker would scan, breaking parity; under-exclusion is harmless because
    // the JS filter below already re-applies user globs to targets. includeGlobs are deliberately NOT symmetrized.
    const phase1 = await searchCandidates({
      rootDir: rootAbs,
      pattern, // raw trimmed user input — boolean-equivalent to the demoted/literal matcher (engine header §6)
      mode: phase1Mode,
      caseInsensitive: !(options.caseSensitive ?? true), // pattern_scan defaults SENSITIVE — grep_files' hardcoded 'i' must NOT be mirrored here
      excludeGlobs: [...DEFAULT_EXCLUDE_DIRS],
      maxDepth: targetKind === 'dir' ? effectiveMaxDepth : undefined, // engine emits --max-depth=cap+1 per pinned G9 parity; inert for file roots
    });
    if (phase1.status === 'ok') {
      const set = new Set<string>();
      for (const p of phase1.files ?? []) {
        // PATH-FORMAT CONTRACT (ripgrepEngine.test.ts header): rg's -l lines carry the search-root prefix, whether that is
        // ABSOLUTE (host form) or already ROOT-RELATIVE (guest preopen root) — platform-sensitive. Resolve both: absolute
        // lines are relativized against the target base; relative lines are taken as-is. A candidate that resolves to ''
        // (line equals the base itself, file mode) falls back to basename so it can still intersect the single target rel.
        const cand = p.split('/').join(path.sep);
        const base = targetKind === 'file' ? process.cwd() : rootAbs; // single-file targets carry cwd-relative rels by convention
        let norm: string;
        if (path.isAbsolute(cand)) {
          norm = path.relative(base, cand).split(path.sep).join('/');
        } else {
          norm = cand.split(path.sep).join('/');
        }
        set.add(norm || path.basename(p));
      }
      rgCandidateRels = set;
      console.log(`[pattern_scan] ripgrep phase-1 → ok (${set.size} candidate file(s))`);
    } else {
      console.log(`[pattern_scan] ripgrep phase-1 → ${phase1.status}${phase1.reason ? ` (${phase1.reason})` : ''} — full-JS pipeline (fallback path)`);
    }
  } catch {
    rgCandidateRels = null; // searchCandidates is contractually non-throwing; belt & braces for the fallback guarantee
  }

  // B': scan state is declared HERE (above the phase-1 gate-record loop) so that loop can write 'size'/'line-cap'
  // skip records with exactly the same ordering semantics as the worker below.
  const matches: ScanMatch[] = [];
  const skipped: SkippedEntry[] = [];
  let filesScanned = 0;
  let truncated = false;
  let cursor = 0; // only mutated synchronously inside worker loops — single-threaded safe

  if (rgCandidateRels !== null) {
    const scanTargets: Target[] = [];
    for (const t of targets) {
      if (rgCandidateRels.has(t.rel)) { scanTargets.push(t); continue; }
      // Non-named target: cannot match by construction, but MUST still produce identical gate records AND stats.
      // The filesScanned bump mirrors the worker's increment position (AFTER isFile(), BEFORE the size gate) so that
      // stats.filesScanned is byte-identical to the pre-B' pipeline; only 'binary' skip records differ (documented).
      try {
        const fst = await fs.stat(t.abs);
        if (!fst.isFile()) continue; // vanished/raced — same silent skip as the worker
        filesScanned++;
        if (fst.size > lim.sizeLimit) { skipped.push({ file: t.rel, reason: 'size' }); continue; }
        const probe = await fs.readFile(t.abs); // Buffer: newline counting needs no utf8 decode of content
        let newlines = 0;
        for (let k = 0; k < probe.length; k++) if (probe[k] === 10) newlines++;
        // split(/\r?\n/) yields exactly N+1 elements for N newline bytes (a trailing separator produces one final empty
        // element), so this reproduces the worker's `lines.length > lim.maxLines` check without any content decode.
        if (newlines + 1 > lim.maxLines) skipped.push({ file: t.rel, reason: 'line-cap' });
      } catch { /* unreadable — worker skips silently too */ }
    }
    targets = scanTargets;
  }

  // --- Scan with bounded concurrency ---------------------------------------------

  async function worker(): Promise<void> {
    while (!truncated && cursor < targets.length) {
      const t = targets[cursor++];
      try {
        const fst = await fs.stat(t.abs);
        if (!fst.isFile()) continue; // vanished / raced — skip
        filesScanned++;
        if (fst.size > lim.sizeLimit) { skipped.push({ file: t.rel, reason: 'size' }); continue; }
        // remaining-quota is a BEST-EFFORT early stop (concurrent workers snapshot the shared counter at dispatch —
        // inherently racy). The AUTHORITATIVE cap is enforced below by sort+slice after all workers finish.
        const outcome = await scanFileWithLimits(t.abs, t.rel, built.rx, lim, Math.max(0, lim.totalCap - matches.length));
        for (const m of outcome.matches) {
          matches.push(m);
          if (matches.length >= lim.totalCap) { truncated = true; break; }
        }
        if (!truncated && outcome.skipReason) skipped.push({ file: t.rel, reason: outcome.skipReason });
      } catch { /* unreadable file — skip silently */ }
    }
  }

  const requestedWorkers = Math.floor(options.concurrency ?? SCAN_DEFAULTS.concurrency);
  const nWorkers = Math.max(1, Math.min(Math.min(requestedWorkers, 16), targets.length || 1));
  await Promise.all(Array.from({ length: nWorkers }, () => worker()));

  matches.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line); // deterministic despite worker scheduling
  skipped.sort((a, b) => a.file.localeCompare(b.file) || (a.reason < b.reason ? -1 : 1));

  // AUTHORITATIVE global cap: sort first (deterministic survivor set), then slice.
  const truncatedFinal = matches.length >= lim.totalCap || truncated; // cap hit → report (more may exist beyond scanned files)
  if (matches.length > lim.totalCap) matches.length = lim.totalCap;

  const result: PatternScanResult = { ok: true, matches, skipped, excludedDirs: [...excludedDirs].sort(), ...base() };
  result.stats.filesScanned = filesScanned;
  result.stats.totalMatches = matches.length;
  result.stats.truncated = truncatedFinal;
  if (built.demotedToLiteral) result.demotedToLiteral = built.demotedToLiteral;
  return result;
}

export default patternScan;
