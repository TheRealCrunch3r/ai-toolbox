/**
 * grepGuard — the single cancellation primitive for ai_toolbox's search tools (04.09, de-bloat).
 *
 * Replaces the former stacked per-tool timeout machinery (15 s scan deadline + 20 s wall-clock
 * backstop race + 30 s fallback timer + FIX-HANG-5 worker kill layer) with ONE authoritative
 * AbortController per tool call:
 *
 *   1. The host's one-way AbortSignal (@lmstudio/sdk ToolCallContext.signal — user cancel / host
 *      timeout) is forwarded INTO the internal controller (per WHATWG DOM spec a signal has no
 *      reverse .abort(), so forwarding means listening).
 *   2. A single setTimeout arms a wall-clock cap; at `deadlineMs` it calls abortController.abort().
 *
 * Every cooperative check in the caller reads guard.signal.aborted — there is exactly one abort
 * state, no secondary flags, no race promises, no orphaned timers (disarm() clears the deadline).
 *
 * DE-STRAngle (16.09): pattern_scan no longer routes regex eval through src/utils/regexWorker.ts — it now evaluates
 * gate-surviving patterns INLINE on the host thread: an ungated ReDoS-capable pattern cannot reach eval by construction
 * (isSafeRegex demotes unsafe/invalid regexes to escaped literal BEFORE any I/O; see src/tools/patternScan.ts), so the
 * former per-eval worker watchdog protected a class that is structurally unreachable while costing one IPC round-trip +
 * pool spawn pacing per file. The worker module and its watchdog are retained for other/future consumers (still tested).
 * Residual inline exposure: find_replace_all’s whole-file .match()/.replace() segments still run under pre-call cooperative
 * gates only — that tool modifies files and keeps its FIND_REPLACE_ALL_MAX_RUN_MS wall budget as a mid-batch cut point.

/** Default wall-clock cap for ONE grep_files call (ms). Set by user order 04.09: keep it tunable in one place. */
export const GREP_MAX_RUN_MS = 500;

// DE-STRAngle (16.09): the former PATTERN_SCAN_MAX_RUN_MS wall cap for pattern_scan was REMOVED — its threat model
// (a sync segment starving this thread) has been gone since FIX-34a (13.09). A fully async pipeline cannot
// self-starve, so the cap’s only remaining effect was chronic `aborted: true` partial results on larger trees.
// Cancellation is host-signal-only now; see createGrepGuard signal-only mode (deadlineMs <= 0) below.

/** find_replace_all keeps its historical full-scan budget — it modifies files, so a short cap would cut batches mid-apply. */
export const FIND_REPLACE_ALL_MAX_RUN_MS = 15_000;

/**
 * Wall-clock cap for ONE ripgrep-engine call (ms) — constant name kept from the removed grep_files tool (14.09 TOOL SWAP):
 * a wedged rg worker is terminated at this budget, so results are PARTIAL and reported as such. One tunable constant per
 * tool class in this file; the pattern_scan equivalent was REMOVED by DE-STRAngle (16.09) — see the note above.
 */
export const GREP_FILES_MAX_RUN_MS = 3000;

export interface GrepGuard {
  readonly signal: AbortSignal;
  /** Manual abort (deadline-firing is automatic via the internal timer). Idempotent. */
  abort(): void;
  /** Disarm the deadline timer — call on EVERY completion path to avoid a stray timer firing post-return. */
  disarm(): void;
}

/**
 * @param hostSignal one-way host AbortSignal (SDK tool-call context); already-aborted signals apply immediately.
 * @param deadlineMs wall-clock cap in ms; <= 0 disables the internal timer (host-signal-only mode).
 * @param logTag     console prefix for the deadline warn line (log forensics parity with prior HANG-GUARD output).
 */
export function createGrepGuard(
  hostSignal: AbortSignal | undefined,
  deadlineMs: number,
  logTag: string,
): GrepGuard {
  const controller = new AbortController();

  if (hostSignal) {
    if (hostSignal.aborted) {
      controller.abort();
    } else {
      hostSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  let deadlineId: ReturnType<typeof setTimeout> | undefined;
  if (deadlineMs > 0) {
    deadlineId = setTimeout(() => {
      console.warn(`[${logTag}] wall-clock cap (${deadlineMs}ms) reached — aborting, returning partial results`);
      controller.abort();
    }, deadlineMs);
  }

  return {
    signal: controller.signal,
    abort(): void {
      controller.abort();
    },
    disarm(): void {
      if (deadlineId !== undefined) clearTimeout(deadlineId);
    },
  };
}
