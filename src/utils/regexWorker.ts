/**
 * regexWorker — worker_threads isolation for synchronous regex evaluation (ITEM-B, 05.09).
 *
 * WHY THIS MODULE EXISTS:
 * A single catastrophic-backtracking RegExp.prototype.test() blocks the JS event loop synchronously and NO
 * timer on that thread can fire while it spins — a host-side AbortController cap (grepGuard.ts) therefore
 * cannot preempt it, only stop further work at the next boundary. On 05.09 this exact class wedged LM Studio
 * ("busy" until full restart; event-loop starvation). The only mechanism proven to preempt an unpreemptible
 * .test() is worker.terminate() on a spinning isolated worker (proven live 30.08, FIX-HANG-5c §5.2:
 * WATCHDOG_KILL at 2010 ms — see docs/history/GATE_PROBE_EVIDENCE_fixhang5c.md). ITEM-B restores that
 * isolation at the two incident hotspots (grep_files processWithRegex + pattern_scan scanFileWithLimits) by
 * routing ALL regex file evaluation through this module: no synchronous .test() ever runs on the host thread.
 *
 * DESIGN POSTURE (carried over from FIX-HANG-5): every evaluation is isolated — there is NO risk classifier
 * deciding inline-vs-worker, because a mis-triaged-safe pattern can hang the host while a mis-triaged-risky
 * one only costs ~one 10–30 ms worker spawn. The cost is paid unconditionally; the guarantee is absolute.
 *
 * LIFECYCLE (per evaluation — no pool state, nothing to leak):
 *   1. Spawn an eval-mode Worker from REGEX_EVAL_WORKER_SOURCE below (self-contained ES5 string).
 *   2. Arm a host-side watchdog setTimeout(budgetMs); on fire it calls worker.terminate() and resolves with
 *      kind:'budget' — terminate() preempts the spin even mid-.test().
 *   3. An optional externalSignal (e.g. the grepGuard signal) terminates the in-flight eval early on cap/host
 *      abort → kind:'aborted'.
 *   4. On EVERY settle path the worker is terminated and listeners cleared (finally-equivalent via finish()).
 *
 * WORKER SOURCE CONTRACT (FIX-HANG-5c — do not "modernize" without re-probing):
 *   - node:worker_threads has NO `self` global → must use require("worker_threads").parentPort (require-guarded).
 *   - The message handler receives the payload VALUE directly (no MessageEvent envelope; no e.data).
 *   - Internal try/catch posts {ok:false,error} and RETURNS — it never falls through to posting indices.
 *   - First-match-per-line semantics: a line matching any pattern is reported exactly once, in input order.
 */

import { Worker as NodeWorker } from 'worker_threads';

/** Default per-evaluation budget (ms). Single tunable, same convention as GREP_MAX_RUN_MS in grepGuard.ts.
 *  Value carried over from FIX-HANG-5's proven live watchdog (2000 ms). */
export const REGEX_WORKER_BUDGET_MS = 2000;

/** Self-contained worker source (ES5, eval-mode launch — no module resolution inside the worker). */
const REGEX_EVAL_WORKER_SOURCE: string = [
  'var parentPort = null;',
  'try { parentPort = require("worker_threads").parentPort; } catch (e) {}',
  'if (parentPort) {',
  '  parentPort.on("message", function (data) {',
  '    try {',
  '      var patterns = [];',
  '      for (var p = 0; p < data.patterns.length; p++) { patterns.push(new RegExp(data.patterns[p].source, data.patterns[p].flags)); }',
  '      var lines = data.lines;',
  '      var matched = [];',
  '      for (var i = 0; i < lines.length; i++) {',
  '        var line = lines[i];',
  '        for (var j = 0; j < patterns.length; j++) {',
  '          patterns[j].lastIndex = 0;', // /g-flagged patterns: reset per line — first-match-per-line, stateless across lines
  '          if (patterns[j].test(line)) { matched.push(i); break; }',
  '        }',
  '      }',
  '      parentPort.postMessage({ ok: true, matched: matched });',
  '    } catch (err) {',
  '      var msg = "worker eval error";',
  '      try { if (err && err.message) { msg = String(err.message); } else { msg = String(err); } } catch (e2) {}',
  '      try { parentPort.postMessage({ ok: false, error: msg }); } catch (e3) {}', // post-and-RETURN — never fall through to indices
  '    }',
  '  });',
  '}',
].join('\n');

/** One pattern as reconstructed inside the worker from its source + flags (RegExp instances are not structured-cloneable). */
export interface RegexPatternSpec { source: string; flags: string; }

/** Outcome of one isolated evaluation. `ok:false` kinds are mutually exclusive and fully describe what happened. */
export type RegexEvalOutcome =
  | { ok: true; matchedLineIndices: number[] } // indices into the input lines array, ascending, first-match-per-line
  | { ok: false; kind: 'budget'; budgetMs: number }   // watchdog terminated a spinning .test() — ReDoS containment (the load-bearing path)
  | { ok: false; kind: 'error'; detail: string }      // spawn failure / worker boot or eval error (rare post-5c) / malformed response
  | { ok: false; kind: 'aborted' };                   // externalSignal fired during the eval — caller's cap/host abort is authoritative

export interface RegexEvalOptions {
  /** Per-evaluation watchdog budget in ms. Default REGEX_WORKER_BUDGET_MS. Must be >= 1. */
  budgetMs?: number;
  /** One-way signal (e.g. grepGuard.signal) that terminates the in-flight eval early → kind:'aborted'. Already-aborted signals skip the worker entirely. */
  externalSignal?: AbortSignal;
}

/**
 * Evaluate `lines` against `patterns` inside an isolated worker thread.
 * Never throws — every failure mode resolves to a RegexEvalOutcome. The host event loop is never blocked by regex work:
 * at worst it waits (asynchronously) for the watchdog budget to expire.
 */
export function evaluateLinesInWorker(
  patterns: RegexPatternSpec[],
  lines: string[],
  opts: RegexEvalOptions = {},
): Promise<RegexEvalOutcome> {
  const budgetMs = Math.max(1, Math.floor(opts.budgetMs ?? REGEX_WORKER_BUDGET_MS));

  return new Promise<RegexEvalOutcome>((resolve) => {
    // Fast path: nothing to evaluate — no worker needed (also keeps zero-line files off the spawn cost).
    if (lines.length === 0 || patterns.length === 0) {
      resolve({ ok: true, matchedLineIndices: [] });
      return;
    }

    let worker: NodeWorker;
    try {
      worker = new NodeWorker(REGEX_EVAL_WORKER_SOURCE, { eval: true });
    } catch (err) {
      resolve({ ok: false, kind: 'error', detail: `worker spawn failed: ${err instanceof Error ? err.message : String(err)}` });
      return;
    }

    let settled = false;
    let watchdogId: ReturnType<typeof setTimeout> | undefined;
    const externalSignal = opts.externalSignal;

    const onExternalAbort = (): void => {
      finish({ ok: false, kind: 'aborted' }); // terminate() inside cleanup preempts any in-flight spin
    };

    function cleanup(): void {
      if (watchdogId !== undefined) clearTimeout(watchdogId);
      if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
      // terminate() returns Promise<void> that REJECTS asynchronously if the worker has already exited (Node docs) —
      // .catch() handles that async path; `void` marks intentional non-settling per no-floating-promises.
      void worker.terminate().catch(() => { /* already terminated — idempotent by contract */ });
    }

    function finish(outcome: RegexEvalOutcome): void {
      if (settled) return; // first settle wins — watchdog/message/abort/error can race
      settled = true;
      cleanup();
      resolve(outcome);
    }

    if (externalSignal) {
      if (externalSignal.aborted) { finish({ ok: false, kind: 'aborted' }); return; } // pre-aborted → no worker work at all
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }

    watchdogId = setTimeout(() => {
      // THE load-bearing mechanism (proven live 30.08): terminate() preempts an unpreemptible .test().
      void worker.terminate().catch(() => { /* already terminated — idempotent by contract */ });
      finish({ ok: false, kind: 'budget', budgetMs });
    }, budgetMs);

    // Listeners attached BEFORE postMessage — a fast worker could otherwise message before we are listening.
    worker.on('message', (msg: { ok?: boolean; matched?: number[]; error?: string } | undefined) => {
      if (msg && msg.ok === true && Array.isArray(msg.matched)) {
        finish({ ok: true, matchedLineIndices: msg.matched });
      } else {
        finish({ ok: false, kind: 'error', detail: (msg && typeof msg.error === 'string' ? msg.error : 'malformed worker response') });
      }
    });

    worker.on('error', (err: unknown) => {
      // Boot/eval crash inside the worker (post-5c this should be near-impossible; keep the path for forensics).
      finish({ ok: false, kind: 'error', detail: err instanceof Error ? err.message : String(err) });
    });

    try {
      worker.postMessage({ patterns, lines }); // direct values both directions (FIX-HANG-5c contract)
    } catch (err) {
      finish({ ok: false, kind: 'error', detail: `postMessage failed: ${err instanceof Error ? err.message : String(err)}` });
    }
  });
}

export default evaluateLinesInWorker;
