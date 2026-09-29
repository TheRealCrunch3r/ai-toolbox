/**
 * pattern_scan — standalone recursive content search (clean-room module; FULL-JS pipeline only since FIX-34a, 13.09).
 *
 * Design principles:
 *  1. Fail fast on unsafe patterns (ReDoS) via isSafeRegex BEFORE any disk I/O.
 *     Unsafe or syntactically-invalid regexes are auto-demoted to literal mode;
 *     the result reports which (`demotedToLiteral`). A call therefore always
 *     yields signal instead of hanging or throwing.
 *  2. Never block the event loop: fully async I/O with bounded file-read concurrency, and regex evaluation running INLINE
 *     on this thread — but ONLY over patterns that survived the isSafeRegex gate (escaped literals + gated-safe regexes).
 *     An ungated ReDoS-capable pattern cannot reach eval by construction, so a catastrophic-backtracking spin is excluded
 *     at the source instead of being policed after the fact. DE-STRAngle (16.09) retired the former per-file worker dispatch
 *     (src/utils/regexWorker.ts): its 250ms watchdog protected exactly this already-impossible class while costing one IPC
 *     round-trip + pool spawn pacing per file; fs awaits between files keep the event loop turning throughout. The sync
 *     rg-WASM B' segment that once made wall caps mandatory was removed earlier by FIX-34a (13.09) — wedge repro in git history.
 *  3. Hard resource ceilings with explicit reporting: oversized files ('size'),
 *     line-capped files ('line-cap'), over-long lines excluded from eval ('long-line') and binary files ('binary') land in
 *     `skipped` — they are never silently stalled on or truncated. DE-STRAngle (16.09) replaced time-based watchdogs with
 *     deterministic SIZE bounds: what is bounded is the input, not the clock.
 *  4. Deterministic ordering: BFS by depth, then name; final matches sorted by
 *     (file, line) regardless of worker scheduling.
 *  5. Lean deps: node builtins + shared isSafeRegex only — no ripgrepEngine dependency since FIX-34a (13.09); the full-JS
 *     pipeline below is now the ONLY scan path. A worker-isolated re-introduction of rg speed, if ever wanted, is a separate arc (FIX-34b).
 * PREFERENCE (project convention, 31.08; refreshed 14.09 TOOL SWAP): for bounded content searches use THIS tool — pattern_scan gives capped, deterministic results with explicit skipped[] reporting and per-file limits; ripgrep (native, worker-isolated) is the unbounded engine when full-coverage raw matches are wanted.
 */

import fs from 'fs/promises';
import path from 'path';
import type { Dirent } from 'fs';
import { isSafeRegex } from '../security';
// FIX-34a (13.09): the ripgrep B' phase-1 import was removed with its prefilter block — see header principles 2/5 for why.
// HANG-GUARD (05.09) → DE-STRAngle (16.09) → RE-ARM 24.09: the whole scan runs under ONE shared grepGuard armed with a
// PATTERN_SCAN_MAX_RUN_MS wall-clock deadline — owner order 24.09 ("abort after 3 seconds") after the >60 s zero-payload
// incident on slow FS, re-attributed to pattern_scan. DE-STRAngle had removed the cap (deadlineMs=0, host-signal-only): a fully
// async pipeline cannot self-starve this thread, but an UNBOUNDED walk over slow IO proved worse than bounded partials. Both
// abort sources — the wall deadline and any HOST signal (user cancel / host timeout via ToolCallContext.signal) — converge on
// guard.signal and are checked cooperatively at every file boundary → PARTIAL results + `aborted: true`.
import { createGrepGuard, PATTERN_SCAN_MAX_RUN_MS } from '../utils/grepGuard.js';

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
  maxEvalLineLength: 10_000, // DE-STRAngle (16.09): lines longer than this are excluded from regex eval + reported as 'long-line' — deterministic size bound for inline host eval
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
  maxEvalLineLength?: number; // DE-STRAngle (16.09): per-line eval length bound in chars; longer lines are excluded from matching + recorded as 'long-line'
  abortSignal?: AbortSignal; // host one-way signal (ToolCallContext.signal) forwarded into the shared abort guard — user cancel / host timeout
}

export interface ScanMatch { file: string; line: number; content: string; }
export interface SkippedEntry { file: string; reason: 'size' | 'line-cap' | 'binary' | 'long-line'; } // DE-STRAngle (16.09): 'regex-timeout' retired with the worker watchdog (no producer remains); 'long-line' = over-long line excluded from eval

export interface PatternScanResult {
  ok: boolean;
  matches: ScanMatch[]; // sorted by (file, line)
  skipped: SkippedEntry[]; // files touched but not fully scanned — with why
  excludedDirs: string[]; // directory names pruned via DEFAULT_EXCLUDE_DIRS / excludeGlobs (deduped, sorted)
  stats: { filesScanned: number; totalMatches: number; durationMs: number; truncated: boolean };
  aborted?: boolean; // RE-ARM 24.09: true when the PATTERN_SCAN_MAX_RUN_MS deadline OR a HOST signal (user cancel / host timeout) fired mid-scan — matches/skipped are then PARTIAL
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

interface ScanLimits { maxLines: number; perFileCap: number; lineLenCap: number; sizeLimit: number; totalCap: number; evalLineLen: number; } // DE-STRAngle (16.09): +evalLineLen — deterministic long-line bound replacing time-based watchdogs

export interface FileScanOutcome {
  matches: ScanMatch[];
  skipReason?: 'line-cap' | 'binary'; // 'size' is decided by caller from stat, before read
  longLines?: number; // DE-STRAngle (16.09): over-long lines excluded from eval — caller records ONE skipped('long-line') per affected file
}

/**
 * Reads one file and collects matching lines.
 * DE-STRAngle (16.09): the per-line .test() loop now runs INLINE on this thread instead of in an isolated worker — only
 * gate-surviving patterns reach it (escaped literals or isSafeRegex-cleared regexes), so the catastrophic-backtracking
 * class is excluded at the source and no watchdog budget is needed; fs I/O around each file keeps the event loop turning.
 * The former per-eval worker round-trip (IPC + pool spawn pacing) was pure overhead against an already-impossible input
 * class — see module header principle 2. Over-long lines are excluded by a DETERMINISTIC LENGTH BOUND instead of being
 * policed on a clock: lim.evalLineLen, reported via `longLines` → skipped('long-line'). First-match-per-line and per-file
 * cap semantics are unchanged from the worker era (the authoritative global cap is enforced post-scan by patternScan's
 * sort+slice, as before).
 */
async function scanFileWithLimits(absolutePath: string, relPath: string, rx: RegExp, lim: ScanLimits): Promise<FileScanOutcome> {
  const buf = await fs.readFile(absolutePath);
  if (looksBinary(buf, Math.min(8192, buf.length))) return { matches: [], skipReason: 'binary' };

  const lines = buf.toString('utf-8').split(/\r?\n/); // split FIRST — line-cap works even on unbounded-line files
  const scanned = Math.min(lines.length, lim.maxLines);
  const out: ScanMatch[] = [];
  let longLines = 0;

  if (scanned > 0) {
    // Stateless eval copy without the 'g' flag — a global .test() would carry lastIndex across lines and drop matches.
    const evalRx = new RegExp(rx.source, rx.flags.replace(/g/g, ''));
    for (let i = 0; i < scanned && out.length < lim.perFileCap; i++) {
      const line = lines[i];
      if (line.length > lim.evalLineLen) { longLines++; continue; } // deterministic size bound — no timer (DE-STRAngle 16.09)
      if (evalRx.test(line)) {
        let content = line.trim();
        if (content.length > lim.lineLenCap) content = content.slice(0, Math.max(0, lim.lineLenCap - 1)) + '…';
        out.push({ file: relPath, line: i + 1, content });
      }
    }
  }

  const result: FileScanOutcome = { matches: out };
  if (scanned < lines.length) result.skipReason = 'line-cap';
  if (longLines > 0) result.longLines = longLines;
  return result;
}

// ---------------------------------------------------------------------------
// Directory walk (BFS, bounded depth, exclude-pruned, deterministic order)
// ---------------------------------------------------------------------------

interface WalkTarget { abs: string; rel: string; } // rel = posix path relative to root

async function walkDirectory(rootAbs: string, maxDepth: number, excludeGlobs: readonly string[], signal?: AbortSignal): Promise<{ files: WalkTarget[]; excludedDirs: Set<string>; }> {
  const files: WalkTarget[] = [];
  const excluded = new Set<string>();
  interface QEntry { dirAbs: string; rel: string; depth: number; } // depth of THIS directory below root (root = 0)
  const queue: QEntry[] = [{ dirAbs: rootAbs, rel: '', depth: 0 }];

  for (;;) {
    // WALK-ABORT (28.09): the walk phase previously ran to completion with NO deadline check — in directory mode
    // no file boundary exists until the BFS finishes, so a slow-FS/deep-tree walk sailed past PATTERN_SCAN_MAX_RUN_MS
    // and only the post-walk workers noticed the flag (the 28.09 >3 s abort incidents; cf. RE-ARM 24.09's >60 s incident).
    // One cooperative check per directory boundary: deadline or host signal → stop walking, return PARTIAL targets.
    if (signal?.aborted) break;
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

  // RE-ARM 24.09 (owner order): ONE shared CANCELLATION primitive for the whole scan — wall-clock deadline
  // PATTERN_SCAN_MAX_RUN_MS (3 s) + host-signal forwarding (see src/utils/grepGuard.ts). The deadline was removed by DE-STRAngle
  // (16.09, deadlineMs=0) with its sync-starvation threat model and re-armed after the >60 s zero-payload incident on slow FS:
  // a bounded partial beats an unbounded walk. Firing is cooperative at every file boundary below → PARTIAL results +
  // `aborted: true`. disarm() in the finally block releases the timer AND any host-signal listener on EVERY completion path
  // (healthy or aborted) so no stray cap-warn can fire after settle.
  const guard = createGrepGuard(options.abortSignal, PATTERN_SCAN_MAX_RUN_MS, 'pattern_scan');

  let rootAbs: string;
  try { rootAbs = path.resolve(process.cwd(), rootRaw); } catch { return { ok: false, matches: [], skipped: [], excludedDirs: [], ...base(), error: `invalid root path: ${rootRaw}` }; }

  const built = buildMatcher(pattern, options.mode ?? 'regex', options.caseSensitive ?? true);
  const excludeGlobs = options.excludeGlobs ?? [];

  // --- Resolve target set ------------------------------------------------------
  interface Target { abs: string; rel: string; } // rel: cwd-relative for single-file roots, root-relative in directory mode (documented)
  let targets: Target[] = [];
  const excludedDirs = new Set<string>();
  try {
    const st = await fs.stat(rootAbs);
    if (st.isFile()) {
      targets = [{ abs: rootAbs, rel: path.relative(process.cwd(), rootAbs).split(path.sep).join('/') || path.basename(rootAbs) }];
    } else if (st.isDirectory()) {
      const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? SCAN_DEFAULTS.maxDepth));
      // WALK-ABORT (28.09): forward the shared guard signal so the BFS itself stops at the 3 s deadline / host cancel
      // instead of running to completion before any file-boundary check could see it (see walkDirectory).
      const walked = await walkDirectory(rootAbs, maxDepth, excludeGlobs, guard.signal);
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
    evalLineLen: Math.max(8, Math.floor(options.maxEvalLineLength ?? SCAN_DEFAULTS.maxEvalLineLength)), // DE-STRAngle (16.09): deterministic long-line bound
  };

  // FIX-34a (13.09): the RIPGREP PHASE-1 candidate prefilter (B') that lived here was REMOVED — its rg-WASM search ran
  // synchronously on the main thread (`await wasi.start()`; all WASI syscalls are sync fs), so while it ran no event-loop
  // turn occurred, HANG-GUARD caps could never fire and abort signals were inert (live wedge repro 13.09). The full-JS walk
  // below is now the only scan path; src/utils/ripgrepEngine.ts is retained but orphaned (a worker-isolated re-introduction
  // would be a separate arc — FIX-34b).
  const matches: ScanMatch[] = [];
  const skipped: SkippedEntry[] = [];
  let filesScanned = 0;
  let truncated = false;
  let cursor = 0; // only mutated synchronously inside worker loops — single-threaded safe

  // --- Scan with bounded concurrency ---------------------------------------------

  async function worker(): Promise<void> {
    // ABORT CHECK — one cooperative gate per file boundary: wall deadline (PATTERN_SCAN_MAX_RUN_MS, RE-ARM 24.09) and host signal converge on guard.signal.
    while (!truncated && !guard.signal.aborted && cursor < targets.length) {
      const t = targets[cursor++];
      try {
        const fst = await fs.stat(t.abs);
        if (!fst.isFile()) continue; // vanished / raced — skip
        filesScanned++;
        if (fst.size > lim.sizeLimit) { skipped.push({ file: t.rel, reason: 'size' }); continue; }
        // DE-STRAngle (16.09): inline host-thread eval inside scanFileWithLimits — no worker dispatch round-trip; the
        // AUTHORITATIVE global cap stays post-scan sort+slice below (unchanged semantics).
        const outcome = await scanFileWithLimits(t.abs, t.rel, built.rx, lim);
        for (const m of outcome.matches) {
          matches.push(m);
          if (matches.length >= lim.totalCap) { truncated = true; break; }
        }
        // Over-long lines were excluded from eval deterministically — one explicit record per affected file.
        if (!truncated && outcome.longLines) skipped.push({ file: t.rel, reason: 'long-line' });
        if (!truncated && outcome.skipReason) skipped.push({ file: t.rel, reason: outcome.skipReason });
      } catch { /* unreadable file — skip silently */ }
    }
  }

  const requestedWorkers = Math.floor(options.concurrency ?? SCAN_DEFAULTS.concurrency);
  const nWorkers = Math.max(1, Math.min(Math.min(requestedWorkers, 16), targets.length || 1));
  try {
    await Promise.all(Array.from({ length: nWorkers }, () => worker()));
  } finally {
    // DISARM (05.09 HANG-GUARD): release the cap timer on EVERY completion path — healthy, aborted or thrown — so no
    // stray "wall-clock cap reached" warn can fire after this call has returned (same contract as grep_files).
    guard.disarm();
  }

  matches.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line); // deterministic despite worker scheduling
  skipped.sort((a, b) => a.file.localeCompare(b.file) || (a.reason < b.reason ? -1 : 1));

  // AUTHORITATIVE global cap: sort first (deterministic survivor set), then slice.
  const truncatedFinal = matches.length >= lim.totalCap || truncated; // cap hit → report (more may exist beyond scanned files)
  if (matches.length > lim.totalCap) matches.length = lim.totalCap;

  const result: PatternScanResult = { ok: true, matches, skipped, excludedDirs: [...excludedDirs].sort(), ...base() };
  result.stats.filesScanned = filesScanned;
  result.stats.totalMatches = matches.length;
  result.stats.truncated = truncatedFinal;
  // HANG-GUARD (05.09): surface a cap/host abort that fired during the scan — partial-results contract, mirrors grep_files' `aborted` field.
  if (guard.signal.aborted) result.aborted = true;
  if (built.demotedToLiteral) result.demotedToLiteral = built.demotedToLiteral;
  return result;
}

export default patternScan;
