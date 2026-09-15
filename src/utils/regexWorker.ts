/**
 * regexWorker — worker-isolated regex line evaluation (ITEM-B 05.09) + bounded pool rework (05.09).
 *
 * WHY ISOLATED EVALUATION: a synchronous catastrophic-backtracking `.test()` cannot be preempted on the host
 * thread (JS is single-threaded; no signal can interrupt it), and a spinning loop starves the event loop AND
 * every timer with it — so an abort/cap timer armed on the host thread never fires while the spin runs. This was
 * the root mechanism of the 05.09 wedge: grep_files' inline per-line .test() spun for minutes, freezing all
 * subsequent tool calls (their Promises queued behind a saturated event loop). The FIX-HANG-5c fix moved ALL regex
 * line evaluation into an isolated worker_threads worker with a watchdog timer: the host thread only AWAITS — it
 * never runs `.test()` — and `terminate()` preempts even an unpreemptible .test() (proven live 30.08).
 *
 * POOL REWORK (05.09, incident follow-up): ITEM-B v1 spawned a NEW worker per evaluation. Under contention the
 * host machine cannot service that spawn rate — workers queue in a stuck half-init state, and each `new Worker()`
 * is a full process creation (~43-67ms+ on this host per session forensics) plus ~50MB RSS: grep_files batches up
 * to 8 files concurrently (Promise.all over max_concurrent_files), pattern_scan up to 16, so bursts of fresh
 * spawns stalled the scan without terminating any spin. This rework keeps ITEM-B's exact isolation guarantee but
 * serves evaluations from a BOUNDED pool:
 *   - MAX REGEX_WORKER_POOL_SIZE live workers (default 4) — matches pattern_scan's default file concurrency;
 *     contention beyond capacity waits in a queue instead of spawning. The wait is bounded by construction: every
 *     in-flight eval is terminated within max(REGEX_WORKER_BUDGET_MS, externalSignal), so some worker frees up.
 *   - Spawn RATE LIMIT (REGEX_WORKER_SPAWN_MIN_INTERVAL_MS): replaces are spaced ≥120ms apart (tuned 06.09 from the
 *     live probe: warm spawn+first-message measured 14-19ms on user host; incident-era default was 250) — a host that cannot
 *     keep up with spawn bursts gets a slow refill instead of another queue buildup. Every spawn is logged with its
 *     measured duration so the live per-session numbers appear in main.log (replaces session-memory-only forensics).
 *   - QUARANTINE: budget-terminated, abort-terminated and erroring workers are removed from service; a fresh worker
 *     replaces them lazily on next acquire. A recycled worker never carries evaluation state across calls: the
 *     message protocol sends {id, regexes, lines} per eval and the worker RECOMPILES regexes per message — no stale
 *     compiled instance survives (this is also what keeps /g-flag lastIndex evolution byte-identical to v1, which
 *     compiled once per fresh worker).
 *   - Lifetime RETIRE after REGEX_WORKER_MAX_EVALS_PER_LIFE successful evals: long-lived plugin sessions never keep
 *     one worker accumulating heap for hours; retirement is logged.
 *   - ONE-TIME STARTUP PROBE on first pool use in this process: 5 sequential spawn+ready measurements are logged so
 *     the per-session host baseline (worker-creation latency) is a log fact, not an assumption.
 *
 * The eval loop itself (first-match-per-line over compiled regexes), the watchdog contract and the result union
 * type are UNCHANGED from ITEM-B v1 — callers (grep_files processWithRegex, pattern_scan scanFileWithLimits, tests)
 * see identical { ok } | { kind: 'budget' } | { kind: 'error' } | { kind: 'aborted' } outcomes.
 */

import { Worker } from 'worker_threads';

/**
 * Default watchdog budget for ONE worker eval (ms) — set to 250 per owner order 05.09 18:12 (incident context: on a
 * contended host even benign per-line .test() loops balloon past 2 s, so the default must fail FAST and let callers
 * re-scope instead of stalling; the load-bearing guarantee is that ANY spin terminates by this deadline).
 * NOTE: this replaces the FIX-HANG-5-carryover value (2000 ms) — tests/regexWorker.test.ts pin was updated in the same
 * change. Both production call sites can override per eval via options.budgetMs (grep_files/pattern_scan currently use
 * the default). Consequence to know: a LEGITIMATELY slow eval (> 250 ms on this host under load) is terminated and its
 * file reported as skipped:'regex-timeout' — faster containment, less headroom for big line windows.
 */
export const REGEX_WORKER_BUDGET_MS = 250;

/** Max concurrently LIVE pool workers (busy + idle). Contention waits in the queue — it never spawns unboundedly. */
export const REGEX_WORKER_POOL_SIZE = 4;

/**
 * DRAIN-GRACE (15.09): quiet window (ms) after a release before the delayed idle-drain sweep fires — back-to-back evals within it REUSE warm workers instead of paying a fresh spawn (~43-67ms on this host)
 * + ≥120ms pacing each re-acquire; the pre-grace immediate drain was the proven pool-thrash root cause of the 15.09 pattern_scan stall (owner GO 18:16). Any acquire cancels the pending
 * sweep — see cancelDrainGrace / scheduleDrainGrace in the pool-state section and releaseWorker's tail. Trade-off (accepted): ≤REGEX_WORKER_POOL_SIZE warm workers (~≤200MB RSS) may survive up to
 * one quiet window after demand ends; shutdownRegexWorkerPool() clears the pending timer at teardown.
 */
export const REGEX_WORKER_DRAIN_GRACE_MS = 500;

/**
 * Minimum spacing between worker spawns (ms) — protects a contended host from spawn-burst queue buildup.
 * Tuned 06.09: 250 → 120 after the live startup probe measured warm spawn+first-message at 14-19 ms on the user
 * host; worst-case burst ramp drops ~750ms → ~360ms for a full 4-worker top-up. Pool cap (4), eval budget
 * (REGEX_WORKER_BUDGET_MS) and quarantine are UNCHANGED — only the refill rate moved. Revert to 250 if
 * 'at capacity'/'queue wait … host worker contention' lines appear under load post-install.
 */
const REGEX_WORKER_SPAWN_MIN_INTERVAL_MS = 120;

/** Successful evals per worker lifetime before retirement (heap hygiene in long-lived plugin sessions). */
const REGEX_WORKER_MAX_EVALS_PER_LIFE = 200;

/** Startup probe sample count on first pool use in this process. */
const PROBE_SPAWN_COUNT = 5;

export type RegexWorkerOutcome =
  | { ok: true; matchedLineIndices: number[] }
  | { kind: 'budget'; budgetMs: number } // watchdog fired → worker terminated (possible ReDoS)
  | { kind: 'error'; detail: string }    // worker boot/eval failure — NO inline fallback (same posture as v1)
  | { kind: 'aborted' };                 // externalSignal aborted mid-eval

interface PooledWorker {
  id: number;
  worker: Worker;
  state: 'idle' | 'busy';
  evals: number; // successful eval count toward lifetime retirement
}

/**
 * Worker-side code — inline string per ITEM-B v1 (no path-resolution risk in the LM Studio bundle), parentPort API.
 * 05.09 FIX (regression caught by in-sandbox probe at 18:24, same day): a pool draft had written this payload with
 * Web-Worker globals (`self.onmessage` / `self.postMessage`). Node worker_threads provides NEITHER — every fresh
 * worker died at boot with "self is not defined" before answering a single message (proven empirically in-sandbox:
 * timers OK, Worker ctor OK, code eval throws). ITEM-B v1 shipped the correct parentPort API; this restores it.
 * 05.09 SECOND FIX (same day — smoke harness + official docs): even with parentPort restored, reading `ev.data || {}`
 * was still wrong for real Node: parentPort.on('message') receives the posted value RAW, not a {data} wrapper (see the
 * worker.once('message', (message) => …) example in nodejs.org/api/worker_threads.html; v1 REGEX_EVAL_WORKER_SOURCE used
 * raw `data` and worked live since 30.08). Under real Node every eval would have read undefined: silent empty match sets,
 * invalid regexes never surfacing as { ok:false }, and /g lastIndex drift across lines — v1's explicit per-line reset is
 * therefore also restored in the loop below (an earlier "byte-identical to v1" comment was incorrect on that point). The
 * handler now normalizes raw-vs-wrapped payloads with one defensive line.
 * `require('worker_threads')` inside {eval:true} worker code is valid — the module system scopes the payload as a
 * CommonJS body (verified live in-sandbox on this runtime, 05.09).
 */
const WORKER_CODE = `
var parentPort = require('worker_threads').parentPort;
parentPort.on('message', function (raw) {
  // Node's parentPort/worker 'message' handlers receive the posted value RAW (nodejs.org/api/worker_threads.html);
  // unwrap only if a hypothetical host wraps it in an event object; v1 REGEX_EVAL_WORKER_SOURCE read the raw arg directly (no backticks allowed inside this template literal).
  var msg = (raw && typeof raw === 'object' && Object.prototype.hasOwnProperty.call(raw, 'data')) ? raw.data : raw;
  msg = msg || {};
  var lines = Array.isArray(msg.lines) ? msg.lines : [];
  try {
    // RECOMPILE per message: a pooled worker is recycled across calls with different patterns — no compiled state
    // may survive one eval. Fresh instances also reset /g lastIndex to 0 exactly like v1's fresh-per-eval workers,
    // so within-eval lastIndex evolution (and therefore the match set) is byte-identical to the pre-pool code.
    var rxs = (Array.isArray(msg.regexes) ? msg.regexes : []).map(function (r) {
      return new RegExp(r.source || '', r.flags || '');
    });
    var matchedLineIndices = [];
    for (var i = 0; i < lines.length; i++) {
      for (var j = 0; j < rxs.length; j++) {
        rxs[j].lastIndex = 0; // v1 semantics: /g patterns must not carry lastIndex across lines (v1 REGEX_EVAL_WORKER_SOURCE reset explicitly)
        if (rxs[j].test(lines[i])) { matchedLineIndices.push(i); break; } // first match per line (v1 semantics)
      }
    }
    parentPort.postMessage({ id: msg.id, ok: true, matchedLineIndices: matchedLineIndices });
  } catch (err) {
    parentPort.postMessage({ id: msg.id, ok: false, error: err && err.message ? String(err.message) : 'regex evaluation failed in worker' });
  }
});
`;

// ==================== Pool state (module-level; one pool per process = one plugin session) ====================

let pool: PooledWorker[] = [];         // all LIVE workers (idle + busy)
let spawnSeq = 0;                      // monotonic id source for correlation
let lastSpawnAtMs = 0;                 // rate-limit anchor
let probeRan = false;                  // one-time startup probe per process
const waiters: Array<() => void> = []; // FIFO queue of acquires blocked on capacity

/* DRAIN-GRACE (15.09): delayed idle-drain — state + sweep helpers (replace releaseWorker's immediate drain-all-idles). Provenance: the immediate drain killed warm workers between back-to-back
 * per-file evals, so every re-acquire in a pattern_scan burst paid a fresh spawn (~43-67ms) + ≥120ms pacing — proven thrash root cause of the 15.09 stall (live log 2026-09-15.1.log @17:14).
 * The sweep RE-ARMS on every release (clear + fresh timer) so it fires only after the pool has been quiet for a FULL REGEX_WORKER_DRAIN_GRACE_MS window; ANY acquire in that window cancels it
 * outright (an acquire IS demand). Expiry runs the SAME sweep as the old immediate drain. Quarantine/retirement stay IMMEDIATE — unchanged. */
let drainGraceTimer: ReturnType<typeof setTimeout> | null = null;

function cancelDrainGrace(): void {
  if (drainGraceTimer !== null) clearTimeout(drainGraceTimer);
  drainGraceTimer = null;
}

/** Re-arm the delayed sweep (clear + fresh timer) — call on EVERY release so the grace window restarts from each one. */
function scheduleDrainGrace(): void {
  cancelDrainGrace();
  drainGraceTimer = setTimeout(() => {
    drainGraceTimer = null; // fired — do not re-arm from inside the sweep (a later release will, if idles remain)
    const drained: PooledWorker[] = [];
    for (const w of pool) {
      if (w.state === 'idle') { terminateQuietly(w.worker); drained.push(w); } // busy workers complete + are swept on their own later release
    }
    if (drained.length > 0) {
      const ids = new Set(drained.map((w) => w.id));
      pool = pool.filter((w) => !ids.has(w.id));
      console.log(`[worker-pool] grace expired with no demand — drained ${drained.length} idle worker(s) (live=${pool.length})`);
    }
  }, REGEX_WORKER_DRAIN_GRACE_MS);
}

// FIX-33a (13.09): thrown from acquireWorker when the CALLER'S abort signal fires while a capacity slot is being waited for.
// A real Error subclass (not a bare sentinel) so @typescript-eslint/only-throw-error + prefer-promise-reject-errors hold; callers
// distinguish it from spawn failures (which map to {kind:'error'}) — an aborted wait maps to {kind:'aborted'} with no worker work.
class AcquireAbortedError extends Error {
  constructor() {
    super('acquire aborted by caller signal');
    this.name = 'AcquireAbortedError';
  }
}

// LOGGING CHANNEL POLICY (06.09): benign lifecycle/diagnostic lines use console.log (stdout — LM Studio renders it
// as [INFO]; eslint no-console allows debug/log/warn/error, NOT info). console.warn goes to stderr and renders as
// [ERROR] in server logs, which masked normal pool churn (spawn pacing/drains) behind error noise.
// console.warn is reserved for failure and degradation classes only: probe failures and the 'at capacity' /
// 'queue wait … host worker contention' lines — the latter two are the documented pacing-120 rollback triggers.

/** Wake the next queued waiter (if any) after a worker is released/quarantined. */
function notifyWaiter(): void {
  const wake = waiters.shift();
  if (wake) setTimeout(wake, 0); // never resume inside terminate()'s callback stack
}

/** FIX-33a (13.09): detach a queued waiter that is bailing on caller abort — an aborted acquire must not keep occupying the
 * FIFO slot, or a later notifyWaiter() would consume its wake-up and skip the next real waiter. */
function removeWaiter(resolve: () => void): void {
  const i = waiters.indexOf(resolve);
  if (i >= 0) waiters.splice(i, 1);
}

/**
 * FIX-33a (13.09): wait for a capacity slot or caller abort — whichever comes first; on abort the waiter detaches from the FIFO
 * queue and rejects with AcquireAbortedError. Push BEFORE listener attach: in single-threaded dispatch an 'abort' event cannot fire
 * between the two, so no wake-up can be lost (an already-aborted signal never queues at all). A listener that outlives a WON slot
 * is a harmless one-shot no-op against an already-settled Promise.
 */
function waitForSlotOrAbort(abortSignal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const onAbort = (): void => {
      removeWaiter(resolve);
      reject(new AcquireAbortedError());
    };
    waiters.push(resolve); // push FIRST — then attach (see doc above for why the order matters)
    if (!abortSignal || !abortSignal.aborted) {
      abortSignal?.addEventListener('abort', onAbort, { once: true });
    } else {
      onAbort(); // already aborted at queue entry — never wait in the first place (no listener attached, nothing to clean up)
    }
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Boot/ready contract (changed from v1, deliberately): v1 sent a 'ready-ping' message that the worker echoed back as
 * 'ready'. The pooled protocol has no ping branch — for a FRESH worker the caller's very first postMessage IS the boot
 * round-trip: the worker cannot reply until it booted + evaluated WORKER_CODE, so the eval reply itself proves readiness.
 * Listener-attach safety: from `new Worker()` (in acquireWorker) through postMessage + `on('message'/'error')` attach
 * there is NO await — microtask continuation only — and worker 'error'/'message' delivery requires an event-loop turn,
 * so no reply or error can be lost between spawn and listener attach.
 */

function terminateQuietly(worker: Worker): void {
  // terminate() returns Promise<number> (exit code); intentionally NOT awaited — helper is sync by contract and no
  // caller can await here; `void` marks the fire-and-forget explicitly for @typescript-eslint/no-floating-promises.
  try { void worker.terminate(); } catch { /* already terminated */ }
}

// FIX-33b (13.09): hard TOTAL budget for the ENTIRE startup probe (all samples combined). Pre-fix design had no total
// bound — an unresponsive host could burn up to PROBE_SPAWN_COUNT × 5s = ~25s on the FIRST pool use, and that first
// acquire blocks every search-tool caller in process while it runs. Now: ≤ this budget (+ one 50ms timeout-floor at the boundary).
export const PROBE_TOTAL_BUDGET_MS = 1000;

/**
 * One-time host baseline probe (first pool use in this process): spawn+ready up to PROBE_SPAWN_COUNT workers sequentially,
 * log the measured ms values. The spawned probes are NOT added to the pool — they exist only to put live per-session
 * worker-creation numbers into main.log (session forensics previously lived only in cross-session memory notes).
 * FIX-33b (13.09): total wall-clock bound PROBE_TOTAL_BUDGET_MS with an inconclusive fallback — the probe degrades gracefully
 * instead of stalling the first search-tool call for up to ~25s on a wedged/unresponsive host. The probe is DIAGNOSTIC ONLY:
 * skipping remaining samples never changes eval correctness (the first real eval runs its own watchdog budget regardless).
 */
async function runStartupProbe(): Promise<void> {
  const startedAt = Date.now();
  const samples: number[] = [];
  let inconclusive = false;
  for (let i = 0; i < PROBE_SPAWN_COUNT; i++) {
    if (Date.now() - startedAt >= PROBE_TOTAL_BUDGET_MS) { // total-bound check BEFORE each sample — the probe never starts one past its budget
      inconclusive = true;
      break;
    }
    let probeWorker: Worker | undefined;
    const t0 = Date.now();
    try {
      probeWorker = new Worker(WORKER_CODE, { eval: true });
      // FIX-33b (13.09): per-sample timeout derives from the REMAINING total budget — no sample can push the whole
      // probe past PROBE_TOTAL_BUDGET_MS by more than the 50ms timeout floor at the boundary.
      const remaining = Math.max(50, PROBE_TOTAL_BUDGET_MS - (Date.now() - startedAt));
      await firstEvalRoundTrip(probeWorker, remaining); // any message from the worker proves boot+message-path works
      samples.push(Date.now() - t0);
    } catch (err) {
      console.warn(`[worker-pool] startup probe sample ${i + 1} failed: ${err instanceof Error ? err.message : String(err)}`);
      break; // host cannot spawn at all — stop probing, let acquire report the real failure
    } finally {
      if (probeWorker) terminateQuietly(probeWorker);
    }
  }
  if (inconclusive) {
    console.warn(`[worker-pool] startup probe INCONCLUSIVE: ${PROBE_TOTAL_BUDGET_MS}ms total budget hit after n=${samples.length}/${PROBE_SPAWN_COUNT} sample(s) ms=[${samples.join(', ')}…] — skipping remaining samples (diagnostic only; the first real eval still runs its own watchdog)`);
  } else if (samples.length > 0) {
    console.log(`[worker-pool] startup probe n=${samples.length} spawn+first-message ms=[${samples.join(', ')}] — per-session host worker-creation baseline`);
  } else {
    console.warn('[worker-pool] startup probe: worker creation FAILED on this host — regex eval will report errors until spawns succeed');
  }
}

/** Minimal ready round-trip used by the probe: post one trivial eval, resolve on first message or `timeoutMs`, whichever comes first. */
function firstEvalRoundTrip(worker: Worker, timeoutMs?: number): Promise<void> {
  // FIX-33b (13.09): caller-supplied remaining budget replaces the old flat 5s; the 50ms floor keeps the timer from collapsing at the boundary.
  const cap = Math.max(50, timeoutMs ?? PROBE_TOTAL_BUDGET_MS);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`startup-probe timeout (${cap}ms)`)), cap);
    worker.on('message', () => { clearTimeout(timer); resolve(); });
    worker.on('error', (err: Error) => { clearTimeout(timer); reject(err); });
    worker.postMessage({ id: 'probe', regexes: [{ source: '^x$', flags: '' }], lines: ['nope'] });
  });
}

/**
 * Acquire one exclusive busy worker for an evaluation.
 * Order: reuse idle (under lifetime cap) → spawn within capacity+rate-limit → queue-wait on capacity.
 * The wait is bounded by construction — every in-flight eval self-terminates within the watchdog/abort window.
 * FIX-33a (13.09): also aborts on caller signal when one is passed — throws AcquireAbortedError instead of continuing to queue-wait
 * (evaluateLinesInWorker maps it to {kind:'aborted'}; pre-fix, waiters stayed in the FIFO until capacity freed and then consumed
 * a slot for an eval that was already meaningless at dispatch time).
 */
async function acquireWorker(abortSignal?: AbortSignal): Promise<PooledWorker> {
  if (!probeRan) {
    probeRan = true;
    await runStartupProbe(); // one-time, process-scoped; logged
  }

  cancelDrainGrace(); // DRAIN-GRACE (15.09): an acquire IS demand — a pending sweep must not drain the warm pool we are about to draw from
  for (;;) {
    // FIX-33a (13.09): honor caller abort on EVERY loop iteration — covers the pre-wait recheck and the post-wake path (a wake from a
    // freed slot must not hand that slot to an already-aborted call).
    if (abortSignal?.aborted) throw new AcquireAbortedError();
    const reusable = pool.find((w) => w.state === 'idle' && w.evals < REGEX_WORKER_MAX_EVALS_PER_LIFE);
    if (reusable) { reusable.state = 'busy'; return reusable; }

    // Retired-but-idle workers (lifetime cap hit) are removed here so capacity reflects live serviceable slots.
    pool = pool.filter((w) => !(w.state === 'idle' && w.evals >= REGEX_WORKER_MAX_EVALS_PER_LIFE));

    if (pool.length < REGEX_WORKER_POOL_SIZE) {
      const waitMs = REGEX_WORKER_SPAWN_MIN_INTERVAL_MS - (Date.now() - lastSpawnAtMs);
      if (waitMs > 0) {
        console.log(`[worker-pool] spawn rate-limit — waiting ${Math.round(waitMs)}ms between worker creations`);
        await sleep(waitMs);
      }
      const t0 = Date.now();
      let spawned: PooledWorker;
      try {
        const w = new Worker(WORKER_CODE, { eval: true });
        spawnSeq += 1;
        spawned = { id: spawnSeq, worker: w, state: 'busy', evals: 0 }; // busy from birth — first message is its eval
        pool.push(spawned);
        lastSpawnAtMs = Date.now();
        console.log(`[worker-pool] spawned worker #${spawned.id} in ${Date.now() - t0}ms (live=${pool.length}/${REGEX_WORKER_POOL_SIZE})`);
        return spawned; // NO extra ready round-trip: the caller's postMessage is the boot probe (see protocol note)
      } catch (err) {
        throw err instanceof Error ? err : new Error(`worker spawn failed: ${String(err)}`);
      }
    }

    // At capacity — queue. Bounded wait: in-flight evals terminate within max(REGEX_WORKER_BUDGET_MS, externalSignal).
    const queuedAt = Date.now();
    console.warn(`[worker-pool] at capacity (${REGEX_WORKER_POOL_SIZE}) — queuing (live=${pool.length}, busy=${pool.filter((w) => w.state === 'busy').length})`);
    try {
      await waitForSlotOrAbort(abortSignal); // FIX-33a (13.09): throws AcquireAbortedError if the caller's signal fires while waiting for a slot
    } catch (err) {
      throw err instanceof AcquireAbortedError ? err : new Error(`unexpected queue-wait rejection: ${String(err)}`); // rethrow as-is; nothing else should reject
    }
    const waitedMs = Date.now() - queuedAt;
    if (waitedMs > 100) {
      console.warn(`[worker-pool] queue wait ${waitedMs}ms — host worker contention`);
    }
  }
}

/**
 * Return a healthy worker to idle service, or retire it (lifetime cap / quarantine). Wakes one waiter when queued.
 * DRAIN rule — DRAIN-GRACE (15.09): with NO waiters pending the idle-drain is DELAYED by REGEX_WORKER_DRAIN_GRACE_MS
 * instead of immediate — back-to-back per-file evals (pattern_scan/grep_files bursts) must REUSE warm workers rather than
 * pay a fresh spawn (~43-67ms) + ≥120ms pacing on every re-acquire; the pre-grace immediate drain was the proven thrash root
 * cause of the 15.09 pattern_scan stall (live log 2026-09-15.1.log @17:14, ~97 files/3s ≈ predicted thrash throughput). The sweep
 * re-arms on EVERY release and fires only after a FULL quiet window; any acquire cancels it outright (an acquire IS demand), so
 * `npm test` teardown stays clean — shutdownRegexWorkerPool() clears the pending timer before terminating workers. Trade-off
 * (owner-accepted 15.09): ≤REGEX_WORKER_POOL_SIZE warm workers (~≤200MB RSS) may survive up to one grace window after demand ends.
 * Quarantine and lifetime retirement remain IMMEDIATE — unchanged in the branch below.
 */
function releaseWorker(entry: PooledWorker, healthy: boolean): void {
  if (!healthy || entry.evals >= REGEX_WORKER_MAX_EVALS_PER_LIFE) {
    // Quarantine/retire (branch chosen by !healthy = quarantine, else lifetime cap hit).
    pool = pool.filter((w) => w !== entry); // removal alone is atomic — no reassignment of a live worker needed
    terminateQuietly(entry.worker);
  } else {
    entry.state = 'idle';
  }

  if (waiters.length > 0) {
    cancelDrainGrace(); // DRAIN-GRACE (15.09): demand is pending — a queued acquire takes the freed slot, no sweep may race it
    notifyWaiter(); // queued acquires take priority over drain — they will find the freed slot/idle worker
    return;
  }
  scheduleDrainGrace(); // DRAIN-GRACE (15.09): delayed sweep instead of immediate idle-drain — see state + helpers in the pool-state section above
}

/**
 * Evaluate `lines` against `regexes` in an isolated pooled worker — a spinning catastrophic-backtracking `.test()`
 * can no longer starve the host thread. The watchdog (setTimeout on the HOST) fires while the event loop is free and
 * terminates the dedicated worker — preempting even an unpreemptible spin. First match per line; line indices ascending.
 *
 * @param externalSignal optional one-way AbortSignal: when it aborts mid-eval, the worker is terminated and the
 *   outcome is `{ kind:'aborted' }` (grep_files passes its guard signal here; pattern_scan does not — its guard
 *   checks at file boundaries instead). v1 contract preserved.
 */
export async function evaluateLinesInWorker(
  regexes: Array<{ source: string; flags: string }>,
  lines: string[],
  options?: { budgetMs?: number; externalSignal?: AbortSignal }, // budgetMs = per-eval override of REGEX_WORKER_BUDGET_MS (v1 contract)
): Promise<RegexWorkerOutcome> {
  // Pre-aborted signal → immediate aborted outcome with NO worker work at all (pinned test contract: the guard's
  // abort is honored instantly — no probe, no acquire, no spawn window). Must run BEFORE any pool interaction.
  if (options?.externalSignal?.aborted) return { kind: 'aborted' };

  const effectiveBudgetMs = options?.budgetMs ?? REGEX_WORKER_BUDGET_MS;

  let entry: PooledWorker;
  try {
    // FIX-33a (13.09): pass the caller's abort signal into the acquire — a capacity queue-wait now honors it too, not only in-eval waits.
    entry = await acquireWorker(options?.externalSignal);
  } catch (err) {
    if (err instanceof AcquireAbortedError) return { kind: 'aborted' }; // FIX-33a: aborted while waiting for capacity — no worker was ever used
    return { kind: 'error', detail: err instanceof Error ? `worker spawn failed — ${err.message}` : String(err) };
  }

  // FIX-33a (13.09): recheck AFTER the acquire — a host signal may have fired during the one-time startup probe or a slow spawn; running an
  // eval that was already aborted at dispatch time would burn a worker slot for up to the full budget. Quarantine: never hand this freshly
  // acquired worker back into service after an abort race.
  if (options?.externalSignal?.aborted) {
    releaseWorker(entry, false);
    return { kind: 'aborted' };
  }

  // Watchdog + external abort arms BEFORE the postMessage (v1 ordering): both terminate the DEDICATED worker of this
  // eval and quarantine it from the pool. A terminated/dying worker must never be recycled into another call.
  const budgetTimer = setTimeout(() => {
    console.warn(`[regex-worker] watchdog: terminating pooled worker #${entry.id} after ${effectiveBudgetMs}ms (possible ReDoS)`);
    settle({ kind: 'budget', budgetMs: effectiveBudgetMs }, /* quarantine */ true);
  }, effectiveBudgetMs);

  const onAbort = (): void => {
    console.warn(`[regex-worker] aborted mid-eval (external signal) — terminating pooled worker #${entry.id}`);
    settle({ kind: 'aborted' }, /* quarantine */ true);
  };
  if (options?.externalSignal) {
    options.externalSignal.addEventListener('abort', onAbort, { once: true });
  }

  let settled = false;
  const settle = (outcome: RegexWorkerOutcome, quarantine: boolean): void => {
    if (settled) return; // watchdog/abort/postMessage race — first settles wins (v1 semantics)
    settled = true;
    clearTimeout(budgetTimer);
    if (options?.externalSignal) options.externalSignal.removeEventListener('abort', onAbort);
    releaseWorker(entry, !quarantine);
    resolveOutcome(outcome);
  };

  let resolveOutcome!: (o: RegexWorkerOutcome) => void;
  const outcomePromise = new Promise<RegexWorkerOutcome>((r) => { resolveOutcome = r; });

  try {
    // The postMessage is the boot round-trip for fresh workers AND the eval itself — one message, no extra ping.
    entry.worker.postMessage({ id: entry.id, regexes, lines });

    const onMessage = (data: unknown): void => {
      const msg = data as { id?: number; ok?: boolean; matchedLineIndices?: number[]; error?: string } | null;
      if (!msg || typeof msg !== 'object') return; // ignore anything not our protocol reply
      entry.worker.off('message', onMessage);
      entry.worker.off('error', onError);
      if (typeof msg.id === 'number' && msg.id !== entry.id) return; // stale/foreign id — defensive, should be impossible
      if (msg.ok && Array.isArray(msg.matchedLineIndices)) {
        entry.evals += 1; // lifetime retirement counter (healthy path only)
        settle({ ok: true, matchedLineIndices: msg.matchedLineIndices }, /* quarantine */ false);
      } else {
        const detail = typeof msg.error === 'string' ? msg.error : 'regex evaluation failed in worker';
        console.warn(`[regex-worker] pooled worker #${entry.id} eval error: ${detail}`);
        settle({ kind: 'error', detail }, /* quarantine */ true);
      }
    };
    const onError = (err: Error): void => {
      entry.worker.off('message', onMessage);
      entry.worker.off('error', onError);
      console.warn(`[regex-worker] pooled worker #${entry.id} thread error: ${err.message}`);
      settle({ kind: 'error', detail: err.message }, /* quarantine */ true);
    };

    entry.worker.on('message', onMessage);
    entry.worker.on('error', onError);
  } catch (err) {
    // postMessage failed (worker died between acquire and post, or payload too large / serialization failure).
    const detail = err instanceof Error ? `postMessage failed — ${err.message}` : String(err);
    console.warn(`[regex-worker] ${detail}`);
    settle({ kind: 'error', detail }, /* quarantine */ true);
  }

  return outcomePromise;
}

/**
 * Terminate every pool worker and reset pool state (tests + plugin teardown). Idempotent.
 * NOTE: does not reject in-flight evals' Promises — callers mid-eval will observe their watchdog/quarantine paths as
 * usual once the terminated workers produce no reply… which they won't, so this is intended for QUIESCENT use only
 * (jest afterAll / shutdown), never under live load.
 */
export function shutdownRegexWorkerPool(): void {
  cancelDrainGrace(); // DRAIN-GRACE (15.09): never let a pending sweep fire after teardown — it would run against the pool about to be reset below
  for (const w of pool) terminateQuietly(w.worker);
  pool = [];
  waiters.length = 0;
  probeRan = false; // allow a re-probe in the next process-lifetime phase (e.g. fresh test suite)
  lastSpawnAtMs = 0;
}
