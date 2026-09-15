/**
 * ripgrepEngine — FIX-34b full engine (13.09). ripgrep IS the grep_files search engine: file walking AND
 * pattern matching run natively inside ONE worker-isolated `mod.ripgrep(...)` call, and the host thread only
 * awaits + parses JSON. This replaces the pre-fix phase-1/phase-2 design (rg candidate prefilter on top of a
 * full JS walk pipeline), which is stripped per owner directive 13.09 ~15:28 ("FULLY STRIP grep_files — NO
 * legacy baggage: timers, patterns and crap like that").
 *
 * WHY WORKER ISOLATION (non-negotiable — proven root cause of the 13.09 wedge class):
 *   `await wasi.start(instance)` runs the ENTIRE rg scan synchronously on the calling thread. Every WASI
 *   syscall in this build is a synchronous node:fs call under the shim (verified against
 *   node_modules/ripgrep@0.3.1 lib/index.mjs + _wasi.mjs): while it runs there are NO event-loop turns, so no
 *   host timer/cap can fire and an aborted AbortSignal is inert — a hostile tree (multi-MB single-line maps)
 *   wedged the LM Studio plugin host until manual kill (13.09 11:04 + ~12:0x repros; FIX-34a removed this from
 *   pattern_scan for exactly that reason). Running the call inside a worker_threads worker relocates the entire
 *   synchronous segment off the main thread: the host watchdog (plain setTimeout on the live event loop) fires
 *   and terminate() preempts it — the same mechanism proven live in regexWorker.ts (ITEM-B 05.09, FIX-HANG-5c).
 *
 * MECHANISM FACTS PROBED IN-SANDBOX ON THIS EXACT RUNTIME + DEPENDENCY VERSION (13.09 ~15:4x):
 *   • `import('ripgrep')` AND `require('ripgrep')` both resolve from a `{ eval: true }` worker thread — the
 *     payload exports { rgPath, ripgrep }. The worker code below uses dynamic import() (ESM dep).
 *   • JSON output (`--json`) is NDJSON; every match event carries data.path.text with the ABSOLUTE HOST PATH
 *     as passed in the argument vector + preopens ({[root]: root}) — deterministic across cwd/preopen variants,
 *     so path handling needs no colon-splitting heuristics (Windows drive colons make text-format parsing unsafe).
 *   • CRLF files: data.lines.text preserves "\r\n" verbatim → host shaping trims both.
 *   • Exit codes per the package contract (lib/index.d.mts): 0 = matches, 1 = no matches (clean negative),
 *     2 = error — including "rg: regex parse error" on stderr for Rust-dialect rejects (lookarounds, backrefs).
 *   • `--glob '!name'` prunes a matching DIRECTORY subtree wholesale; include globs without '/' match file
 *     basenames at any depth (verified live in-sandbox 13.09).
 *
 * ONE-TIME PARSE RETRY (replaces ALL legacy pattern heuristics — looksLikeCodeSignature / auto-escape /
 * top-level alternation splitting, all stripped): the raw user pattern is first compiled by rg as a Rust regex.
 * Only if compilation FAILS (exit 2 parse error) does this engine re-run the SAME worker with --fixed-strings
 * (literal semantics). This is compiler-driven demotion — deterministic and observable via
 * outcome.effectiveMode — instead of string-sniffing heuristics that silently changed what a pattern meant.
 *
 * BUDGET: ONE wall-clock watchdog for the ENTIRE call (worker boot + scan 1 [+ parse retry]) on the host event
 * loop; expiry terminates the worker and settles { kind:'timeout' }. The tool passes its own cap constant here —
 * this module owns no caps of its own. No pool: a grep_files call makes ≤2 sequential scans, so one fresh worker
 * per call is simpler than pooling (fresh spawn ≈ 40-70ms cold on the user host; acceptable for content search).
 */

import { Worker } from 'worker_threads';

/** A single matched line as reported by rg --json. */
export interface RipgrepMatchEntry {
  /** '/'-separated path relative to the scan root (rg prints absolute paths; this module resolves them back and
   *  drops anything escaping the root). For a single-file target: the file's basename. Matches the display shape
   *  callers have always seen in grep_files results. */
  file: string;
  line_number: number; // 1-based, straight from rg's match event
  content: string; // trimmed line text (CRLF terminators stripped), truncated to maxContentLength + '…' when longer
}

/** What the pattern was actually searched as once this call settled ok (demotion observability). */
export type RipgrepEffectiveMode = 'regex' | 'fixed-strings';

export type RipgrepEngineOutcome =
  /** Scan succeeded; matches in rg's natural order (file, then line). effectiveMode reports a -F demotion when one happened. */
  | { ok: true; matches: RipgrepMatchEntry[]; effectiveMode: RipgrepEffectiveMode }
  /** rg exit 1 — zero matching files in scope. NOT an error (clean negative fast path). */
  | { kind: 'no-matches' }
  /** Worker boot / dependency failure on the worker side (import('ripgrep') rejected, WASM init crash, postMessage
   *  serialization failure). The host is never wedged; the tool reports a degraded error instead of scanning. */
  | { kind: 'spawn-failure'; detail: string }
  /** Host watchdog fired → wedged worker terminated. This is the live proof that the wedge class is contained:
   *  the caller gets a typed partial-state signal in budgetMs wall-clock, and the plugin stays responsive. */
  | { kind: 'timeout'; budgetMs: number }
  /** Caller's AbortSignal fired (host cancel / tool-level deadline) → worker terminated before or mid-scan. */
  | { kind: 'aborted' };

export interface RipgrepEngineParams {
  /** Absolute target — a directory to scan recursively OR a single file (mirrors grep_files dual-target mode). */
  rootDir: string;
  /** Raw user pattern, unmodified by this module. Empty patterns are rejected up front ({kind:'no-matches'}). */
  pattern: string;
  /** Caller intent: 'regex' compiles via Rust regex first (with one -F parse-retry); 'literal' goes straight to -F. */
  mode: 'regex' | 'literal';
  /** True → rg -i. grep_files always passes true (legacy contract compiled every regex with the 'i' flag). */
  caseInsensitive?: boolean;
  /** Positive file filter → `--glob <g>`. When absent, callers are expected to supply their default exclusions via excludeGlobs. */
  includeGlob?: string;
  /** Negative filters (default excluded dir names and/or the user's exclude param) → one `--glob '!<g>'` each. */
  excludeGlobs?: string[];
  /** Max directory depth below rootDir. Mirrors the production walker budget with the +1 quirk pinned by the old
   *  parity test: rg --max-depth=N includes only directories of depth < N, so cap+1 restores exact parity.
   *  Values ≤ 0 or non-finite emit NO flag (unbounded) — same quirk as before. */
  maxDepth?: number;
  /** ONE host-side wall-clock budget for the whole call in ms. The watchdog terminates the worker on expiry. */
  budgetMs: number;
  /** Collect at most this many match events (early-exit during parse; the scan itself runs to completion). */
  maxMatches?: number;
  /** Max characters kept per matched line before truncation + '…' (default 150 = grep_files default shape). */
  maxContentLength?: number;
  /** One-way abort signal: pre-aborted → immediate {kind:'aborted'} with no worker spawned; mid-call → terminate. */
  abortSignal?: AbortSignal;
}

// ==================== Worker payload (inline string — no path-resolution risk in the LM Studio bundle) ====================
// Conventions copied verbatim from regexWorker.ts (verified live on this runtime, 05.09):
//   • parentPort API ONLY — Node worker_threads provides NO self.onmessage/self.postMessage (Web-Worker globals);
//     every draft using them died at boot with "self is not defined" before answering a single message.
//   • parentPort 'message' handlers receive the posted value RAW, not wrapped in an event object — one defensive
//     normalization line handles both shapes.
//   • `require('worker_threads')` inside {eval:true} worker code is valid: the payload is scoped as a CommonJS body;
//     dynamic import() of ESM deps from that scope also works (probed on this exact runtime + ripgrep@0.3.1, 13.09).
const RG_WORKER_SOURCE = [
  'var parentPort = require("worker_threads").parentPort;',
  'import("ripgrep").then(function (mod) {',
  '  var rg = mod && mod.ripgrep ? mod.ripgrep : null;',
  '  if (!rg) { parentPort.postMessage({ ok: false, error: "ripgrep module loaded without a ripgrep export" }); return; }',
  '  parentPort.on("message", function (raw) {',
  '    var msg = raw && typeof raw === "object" && Object.prototype.hasOwnProperty.call(raw, "data") ? raw.data : raw;',
  '    msg = msg || {};',
  '    rg(msg.args || [], { buffer: true, preopens: msg.preopens || {} })',
  '      .then(function (res) {',
  '        parentPort.postMessage({ ok: true, id: msg.id, code: res.code, stdout: String(res.stdout == null ? "" : res.stdout), stderr: String(res.stderr == null ? "" : res.stderr) });',
  '      })',
  '      .catch(function (err) {',
  '        parentPort.postMessage({ ok: false, id: msg.id, error: err && err.message ? String(err.message).slice(0, 300) : "ripgrep call rejected in worker" });',
  '      });',
  '  });',
  '}, function (err) {',
  '  parentPort.postMessage({ ok: false, error: err && err.message ? String(err.message).slice(0, 300) : "failed to import ripgrep in worker" });',
  '});',
].join('\n');

/** Build the rg argument vector. Pattern + root are appended LAST (rg treats trailing non-flag args that way: pattern, then paths). */
function buildArgs(p: RipgrepEngineParams): string[] {
  const args: string[] = [
    // Scan-everything parity flags (verified walker behavior in the old fileSystemTools pipeline; keep identical coverage)
    '--no-ignore',
    '--no-require-git',
    '--hidden',
    '--color=never',
    '--json',
  ];
  if (p.mode === 'literal') args.push('--fixed-strings');
  if (p.caseInsensitive) args.push('-i');
  const budget = p.maxDepth;
  if (typeof budget === 'number' && Number.isFinite(budget) && budget > 0) {
    // +1 depth-budget parity quirk — see interface doc (pin preserved from the old module's unit test).
    args.push(`--max-depth=${budget + 1}`);
  }
  if (p.includeGlob) args.push('--glob', p.includeGlob);
  for (const g of p.excludeGlobs ?? []) {
    if (!g) continue;
    args.push('--glob', `!${g}`); // negation lives INSIDE the glob value: -g '!node_modules' prunes matching paths/dirs
  }
  args.push(p.pattern, p.rootDir);
  return args;
}

/** Preopens mapping — make the target visible inside the WASI sandbox explicitly (proven deterministic with this dep). */
function buildPreopens(rootDir: string, isFile: boolean): Record<string, string> {
  if (!isFile) return { [rootDir]: rootDir };
  // Single-file target: preopen BOTH the containing directory and the file itself — covers either open path
  // rg might take (verified in-sandbox 13.09 with exactly this shape on a Windows absolute path).
  const parent = rootDir.slice(0, Math.max(rootDir.lastIndexOf('\\'), rootDir.lastIndexOf('/')));
  return { [parent]: parent, [rootDir]: rootDir };
}

/**
 * Run one ripgrep search in an isolated worker and return the typed outcome. NEVER throws — every failure mode
 * settles into a union arm; the host thread can never be wedged (watchdog + terminate is the load-bearing proof).
 */
export async function runRipgrepEngine(p: RipgrepEngineParams): Promise<RipgrepEngineOutcome> {
  // --- Guard rails (cheap, before any worker exists) ---------------------------------------------
  if (!p.pattern || p.pattern.length === 0) return { kind: 'no-matches' }; // empty pattern is a no-op in every engine mode
  if (!p.rootDir) return { kind: 'spawn-failure', detail: 'missing-root-dir' };
  if (p.abortSignal?.aborted) return { kind: 'aborted' }; // pre-aborted → zero worker work (pinned contract from the guard era)

  const maxMatches = p.maxMatches ?? 500;
  const maxContentLength = p.maxContentLength ?? 150;

  let isFileTarget = false;
  try {
    // The host-side stat is one cheap async call — it also gives the tool-level "path not found" error surface.
    const { stat } = await import('node:fs/promises');
    const st = await stat(p.rootDir);
    isFileTarget = st.isFile();
  } catch (err) {
    // Cross-realm-safe message extraction: under jest's per-file sandbox context, native fs errors can fail
    // `instanceof Error` (different realm), which silently demoted the prefixed contract to a bare String(err).
    const msg = typeof err === 'object' && err !== null && typeof (err as { message?: unknown }).message === 'string'
      ? String((err as { message: string }).message)
      : String(err);
    return { kind: 'spawn-failure', detail: `target not found or inaccessible — ${msg}` };
  }

  let worker: Worker;
  try {
    worker = new Worker(RG_WORKER_SOURCE, { eval: true });
  } catch (err) {
    return { kind: 'spawn-failure', detail: err instanceof Error ? `worker spawn failed — ${err.message}` : String(err) };
  }

  let settled = false;
  let watchdogId: ReturnType<typeof setTimeout> | undefined;

  let resolveOutcome!: (o: RipgrepEngineOutcome) => void;
  const outcomePromise = new Promise<RipgrepEngineOutcome>((r) => { resolveOutcome = r; });

  /** First settle wins — clears the watchdog, detaches the abort listener and ALWAYS terminates the worker.
   *  A live worker thread keeps the parent event loop alive (it would hang `npm test` — regexWorker DRAIN rule),
   *  so even healthy completions terminate it: a fresh call pays one cheap spawn instead of leaking threads. */
  function settle(outcome: RipgrepEngineOutcome): void {
    if (settled) return; // watchdog / abort / message race
    settled = true;
    if (watchdogId !== undefined) clearTimeout(watchdogId);
    p.abortSignal?.removeEventListener('abort', onAbort);
    try { void worker.terminate(); } catch { /* already terminated */ }
    resolveOutcome(outcome);
  }

  const onAbort = (): void => settle({ kind: 'aborted' });
  if (p.abortSignal) p.abortSignal.addEventListener('abort', onAbort, { once: true });

  watchdogId = setTimeout(() => {
    console.warn(`[ripgrep-engine] watchdog: terminating wedged rg worker after ${p.budgetMs}ms wall-clock (host stays responsive)`);
    settle({ kind: 'timeout', budgetMs: p.budgetMs });
  }, Math.max(1, p.budgetMs));

  const preopens = buildPreopens(p.rootDir, isFileTarget);
  let pendingId = 1;
  let effectiveMode: RipgrepEffectiveMode = p.mode === 'literal' ? 'fixed-strings' : 'regex';

  const onMessage = (data: unknown): void => {
    const msg = data as { ok?: boolean; id?: number; code?: number; stdout?: string; stderr?: string; error?: string } | null;
    if (!msg || typeof msg !== 'object') return; // ignore anything not our protocol reply

    // Boot failure (import('ripgrep') rejected BEFORE the message handler exists — arrives as an unsolicited frame).
    if (typeof msg.error === 'string' && msg.id === undefined) {
      worker.off('message', onMessage);
      settle({ kind: 'spawn-failure', detail: msg.error });
      return;
    }

    const stdout = String(msg.stdout ?? '');
    let parseOutcome: RipgrepEngineOutcome;
    if (msg.ok && typeof msg.code === 'number') {
      // Exit-code mapping per package contract: 0 matches / 1 no matches / 2 error.
      if (msg.code === 2) {
        const detail = String(msg.stderr ?? '').trim().slice(0, 240);
        if (/regex parse error/i.test(detail)) {
          // Dialect reject (lookarounds/backrefs/invalid quantifier…). ONE retry as fixed-strings on the SAME warm worker.
          if (effectiveMode === 'regex') {
            effectiveMode = 'fixed-strings';
            pendingId += 1;
            const retryArgs = buildArgs({ ...p, mode: 'literal' });
            try {
              worker.postMessage({ id: pendingId, args: retryArgs, preopens });
              return; // outcome decided by the next frame — do NOT settle now
            } catch (err) {
              // Settle IMMEDIATELY: pendingId was already incremented above, so the trailing
              // `msg.id === pendingId` gate can never match this frame's original id.
              worker.off('message', onMessage);
              const detail = err instanceof Error ? `fixed-strings retry dispatch failed — ${err.message}` : String(err);
              console.warn(`[ripgrep-engine] ${detail}`);
              settle({ kind: 'spawn-failure', detail });
              return;
            }
          } else {
            // Already in literal mode and still code 2 → genuine runtime error (IO inside sandbox etc.)
            parseOutcome = { kind: 'spawn-failure', detail: `ripgrep exit-code-2 in fixed-string mode — ${detail || 'no stderr'}` };
          }
        } else {
          parseOutcome = { kind: 'spawn-failure', detail: `ripgrep exit-code-2 — ${detail || 'no stderr'}` };
        }
      } else if (msg.code === 1) {
        // Clean negative ONLY when this frame is the FINAL one. After a -F retry, code 1 means "demotion found nothing".
        parseOutcome = { kind: 'no-matches' };
      } else {
        const matches = parseJsonMatches(stdout, p.rootDir, maxMatches, maxContentLength);
        if (matches === null) {
          // stdout was not usable JSON despite code 0 — treat as engine failure rather than fabricating an empty result.
          parseOutcome = { kind: 'spawn-failure', detail: `ripgrep exited 0 but produced unparseable output (${stdout.length} bytes)` };
        } else {
          parseOutcome = { ok: true, matches, effectiveMode };
        }
      }
    } else if (typeof msg.error === 'string') {
      parseOutcome = { kind: 'spawn-failure', detail: `worker-side ripgrep failure — ${msg.error}` };
    } else {
      parseOutcome = { kind: 'spawn-failure', detail: 'malformed worker reply' };
    }

    if (parseOutcome !== undefined && msg.id === pendingId) {
      worker.off('message', onMessage);
      settle(parseOutcome);
    }
  };

  const onError = (err: Error): void => {
    worker.off('message', onMessage);
    console.warn(`[ripgrep-engine] worker thread error: ${err.message}`);
    settle({ kind: 'spawn-failure', detail: err.message });
  };

  try {
    // Listener attach → postMessage with NO await in between (worker message delivery needs an event-loop turn, so
    // nothing can be lost — same ordering contract as regexWorker's boot-probe protocol).
    worker.on('message', onMessage);
    worker.on('error', onError);
    worker.postMessage({ id: pendingId, args: buildArgs(p), preopens });
  } catch (err) {
    const detail = err instanceof Error ? `postMessage failed — ${err.message}` : String(err);
    console.warn(`[ripgrep-engine] ${detail}`);
    settle({ kind: 'spawn-failure', detail });
  }

  return outcomePromise;
}

/** Parse rg --json NDJSON into shaped match entries. Returns null when the output is structurally unusable. */
function parseJsonMatches(
  stdout: string,
  rootDir: string,
  maxMatches: number,
  maxContentLength: number,
): RipgrepMatchEntry[] | null {
  if (stdout.length === 0) return []; // code 0 with empty stdout — degenerate but valid (e.g. zero-length match edge)
  const matches: RipgrepMatchEntry[] = [];
  let sawAnyJsonLine = false;
  for (const line of stdout.split('\n')) {
    if (!line.startsWith('{"type"') && !line.startsWith('{\u0022type\u0022')) continue; // skip summary/begin/end fast without JSON.parse
    if (!line.includes('"match"')) continue; // only match events carry line data — cheap prefilter avoids parsing begin/end/summary frames
    sawAnyJsonLine = true;
    // rg --json frame shape — asserted at the parse site (JSON.parse returns any; no-unsafe-assignment).
    type RgFrame = { type?: string; data?: { path?: { text?: string }; lines?: { text?: string }; line_number?: number } };
    let evt: RgFrame;
    try {
      evt = JSON.parse(line) as RgFrame; // trust boundary is this cast — every downstream read stays typeof-guarded
    } catch {
      continue; // malformed frame — skip defensively, keep scanning the rest
    }
    if (evt.type !== 'match' || !evt.data) continue;
    const rawPath = typeof evt.data.path?.text === 'string' ? evt.data.path.text : '';
    if (!rawPath) continue;

    // Resolve to an absolute path. rg prints ABSOLUTE paths when the root arg is absolute (probed 13.09 on this
    // runtime + dependency version); a relative shape is still resolved defensively against the target root, and
    // toRelative drops anything escaping the root (its null return = skip).
    const sep = rootDir.includes('\\') ? '\\' : '/';
    const resolved = rawPath.includes(':') || rawPath.startsWith('/') || rawPath.startsWith('\\')
      ? rawPath
      : `${rootDir}${rawPath.startsWith(sep) ? '' : sep}${rawPath}`;
    const rel = toRelative(resolved, rootDir);
    if (rel === null) continue;

    const rawLineText = typeof evt.data.lines?.text === 'string' ? evt.data.lines.text : '';
    // CRLF files preserve "\r\n" verbatim in lines.text — trim both terminators before shaping.
    let content = rawLineText.replace(/\r?\n$/, '').trim();
    if (content.length > maxContentLength) content = `${content.slice(0, maxContentLength)}…`;

    matches.push({ file: rel, line_number: typeof evt.data.line_number === 'number' ? evt.data.line_number : 0, content });
    if (matches.length >= maxMatches) break; // early-exit during parse — the worker runs to completion regardless
  }
  // code-0 with structurally usable NDJSON but zero match events → legitimately empty (e.g. degenerate pattern);
  // code-0 with output that is NOT recognizable NDJSON at all → engine failure, never fabricate an empty result.
  return sawAnyJsonLine ? matches : null;
}

/**
 * Resolve an rg-displayed path back to a relative display form. Returns null when the path ESCAPES the target
 * root (defense against any unexpected display variant). Hand-rolled instead of importing node:path because this
 * module is also bundled into the plugin and must keep its static import surface minimal for tsup.
 */
function toRelative(resolvedAbs: string, rootDir: string): string | null {
  // Normalize separators on both sides so mixed-guest outputs compare correctly (case stays platform-true).
  const norm = (s: string) => s.replace(/\\/g, '/');
  const r = norm(resolvedAbs);
  const baseNoSlash = norm(rootDir).replace(/\/+$/, '');
  if (r === baseNoSlash) {
    // Single-file target: rg reports the file's own path — display its basename (legacy contract shape).
    return baseNoSlash.split('/').pop() || baseNoSlash;
  }
  if (!r.startsWith(baseNoSlash + '/')) return null; // escape guard — never report files outside the requested root
  const rest = r.slice(baseNoSlash.length + 1);
  // Keep display paths '/'-separated on every platform (legacy relativePath consumers expected POSIX-style output).
  return rest || 'root';
}
