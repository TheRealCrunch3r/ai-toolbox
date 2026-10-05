/**
 * Context Usage Footer — LLM-side limit awareness for ai_toolbox
 *
 * Builds the compact usage footer appended to tool results by the toolsProvider
 * instrumentation wrapper, so the model sees current context usage on every
 * (gated) tool call instead of discovering the window limit as an engine error.
 *
 * Design decisions (owner-confirmed 02.10.2026):
 *  - feature ON by default; footer appears once projected usage crosses 50%
 *    of the context window and then on every subsequent tool result;
 *  - format A: `[ctx ~48.3k/64k = 76%]` (~10 tokens); at >=90% a short
 *    escalation clause is added (fact + one advisory, no steering prose).
 *
 * Contract: pure function, no imports — the caller owns data acquisition
 * (TokenStatsManager baseline/delta/limit) and string mutation. Returns
 * undefined whenever usage or limit is unavailable so a footer with missing
 * numbers can never reach the model (same no-misleading-numbers rule as
 * TokenStatsManager.recordToolResult's baseline guard). Estimates use `~`;
 * over-limit readings are shown unclamped (an honest "we are past the window"
 * signal beats a cosmetic 100% cap).
 */

/** Default gate: footer appears at >= this percent of the context window. */
export const DEFAULT_FOOTER_MIN_PERCENT = 50;

/** Usage level (percent) from which the near-limit escalation clause is added. */
export const NEAR_LIMIT_PERCENT = 90;

/**
 * Self-size of the longest possible footer in tokens (worst case: over-limit
 * reading + escalation clause, ~72 chars x the repo's 0.264 chars->tokens
 * ratio). Callers add this to their projected delta so the accounting that
 * decides whether THIS footer appears includes its own cost.
 */
export const FOOTER_TOKEN_ESTIMATE = 25;

/** Stable prefix of every emitted footer — for assertions/grep, not parsing. */
export const CONTEXT_USAGE_FOOTER_MARKER = '[ctx ';

/** k-format: >=1000 renders as `64k` / `48.3k`; below that a plain integer. */
function formatTokens(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return String(Math.round(value));
}

/**
 * Build the context-usage footer for one tool result, or undefined when no
 * footer is due.
 *
 * @param usedTokens   Projected whole-chat usage in tokens (turn baseline +
 *                     mid-loop tool-payload delta + this payload's estimate).
 * @param limitTokens  Model context window in tokens (>0; from ContextGuard's
 *                     model-derived tokenLimit / TokenStatsManager maxContext).
 * @param minPercent   Gate threshold, inclusive (default 50 = owner decision:
 *                     "append when usage crosses 50%").
 */
export function buildContextUsageFooter(
  usedTokens: number,
  limitTokens: number,
  minPercent: number = DEFAULT_FOOTER_MIN_PERCENT,
): string | undefined {
  if (!Number.isFinite(usedTokens) || !Number.isFinite(limitTokens)) return undefined;
  if (limitTokens <= 0 || usedTokens < 0) return undefined;

  const percent = Math.round((usedTokens / limitTokens) * 100);
  if (percent < minPercent) return undefined; // below the gate — silent, by design

  let footer = `[ctx ~${formatTokens(usedTokens)}/${formatTokens(limitTokens)} = ${percent}%]`;
  if (percent >= NEAR_LIMIT_PERCENT) {
    footer = `[ctx ~${formatTokens(usedTokens)}/` + `${formatTokens(limitTokens)} = ${percent}% | ` +
      'NEAR LIMIT - prefer small reads; wrap up if done]';
  }
  return footer;
}
