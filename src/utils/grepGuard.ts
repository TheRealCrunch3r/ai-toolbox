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
 * KNOWN RESIDUAL RISK (documented trade-off of this simplification): a single catastrophic-
 * backtracking RegExp.prototype.test() blocks the JS event loop synchronously and NO timer —
 * including the cap above — can fire while it spins; the abort then applies at the next file/line
 * boundary instead. Upstream mitigations that remain: isSafeRegex denial + literal auto-demotion,
 * per-file size (default 100 KB) / line-count (default 5000) gates, and the 20k-char line skip in
 * regex mode. If a live hang recurs, restore worker isolation (git history, FIX-HANG-5) rather than
 * stacking another timer layer here.
 */

/** Default wall-clock cap for ONE grep_files call (ms). Set by user order 04.09: keep it tunable in one place. */
export const GREP_MAX_RUN_MS = 500;

/** find_replace_all keeps its historical full-scan budget — it modifies files, so a short cap would cut batches mid-apply. */
export const FIND_REPLACE_ALL_MAX_RUN_MS = 15_000;

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
