/**
 * TokenStatsManager - Bridges ContextGuard token counting with LM Studio SDK PredictionResult.stats & REST API
 * 
 * Three-tier token counting strategy (prioritized):
 * 1. 🔥 REST API (/v1/chat/completions) — Authoritative source, matches sidebar exactly
 * 2. ⚡ SDK PredictionResult.stats — From model.respond().result().stats
 * 3. 📊 Tiktoken estimation — Fallback when both above are unavailable
 * 
 * According to official LM Studio SDK docs:
 * https://lmstudio.ai/docs/typescript/api-reference/llm-prediction-config-input
 */

import type { LLMPredictionStats } from '@lmstudio/sdk';
import * as lmStudioApi from './lmStudioApi.js';

/** Cached prediction stats from the most recent prediction */
let lastPredictionStats: LLMPredictionStats | null = null;

/** Cumulative token count across all predictions in this session (matches sidebar) */
let cumulativeTotalTokens: number = 0;

/** Callback to notify ContextGuard when new stats are available */
type StatsChangeListener = (stats: LLMPredictionStats) => void;
const listeners: Set<StatsChangeListener> = new Set();

// ==================== FIX #20 (A1): Mid-loop tool payload delta bookkeeping ====================
//
// LM Studio calls promptPreprocessor.preprocess() exclusively on USER messages — never during the
// agentic tool loop of a turn. Tool results generated mid-turn therefore stay invisible to the token
// threshold until the NEXT user message, when they are counted natively again (the history iteration
// in preprocess() sums getToolCallRequests()/getToolCallResults() over ALL messages). Hence this delta
// is strictly per-TURN: it must be reset at every preprocess() start or the next turn's native count
// would double-count last turn's tool payloads.

/** Raw character sum of all tool results returned since the last preprocess() call */
let midLoopDeltaChars = 0;

/** Estimated token sum (same ratio as ContextGuard primary method: chars × 0.25 + 10% buffer) */
let midLoopEstTokens = 0;

// FIX #20 A2 — turn-start baseline for the mid-loop guard, plus the model context limit it is
// evaluated against. Set from promptPreprocessor.preprocess() right after ContextGuard computed
// the authoritative count for this turn.
let turnBaselineTokens = 0;
let maxContextTokens = 0;

/** Shared estimation ratio — MUST stay in sync with the ContextGuard.countTokens() primary path */
const CHARS_PER_TOKEN = 0.25;
const TOKEN_BUFFER_FACTOR = 1.10;

export function estimateTokensFromChars(chars: number): number {
  return Math.ceil(Math.max(0, chars) * CHARS_PER_TOKEN * TOKEN_BUFFER_FACTOR);
}

/** Measure the character size of an arbitrary tool result payload (string | string[] | object → JSON). */
function measurePayloadChars(payload: unknown): number {
  if (typeof payload === 'string') return payload.length;
  if (Array.isArray(payload)) {
    let sum = 0;
    for (const item of payload) {
      sum += typeof item === 'string' ? item.length : JSON.stringify(item)?.length ?? 0;
    }
    return sum;
  }
  try {
    return JSON.stringify(payload)?.length ?? 0;
  } catch {
    // Non-serializable (e.g., circular refs) — fall back to a rough size estimate
    return String(payload).length;
  }
}

export class TokenStatsManager {
  /**
   * Get the most recent prediction stats from LM Studio's inference engine.
   * Returns null if no prediction has been made yet.
   */
  static getLastPredictionStats(): LLMPredictionStats | null {
    return lastPredictionStats;
  }

  /**
   * Update with fresh stats from a PredictionResult.
   * Call this after awaiting on model.respond() or model.complete().result()
   */
  static updateFromPredictionResult(stats: LLMPredictionStats): void {
    lastPredictionStats = stats;

    // 🔥 Cumulative tracking: add to session total so it matches LM Studio's sidebar
    if (stats.totalTokensCount != null && stats.totalTokensCount > 0) {
      cumulativeTotalTokens += stats.totalTokensCount;
    }
    
    // Notify all listeners about the new stats
    for (const listener of listeners) {
      try {
        listener(stats);
      } catch (error) {
        console.error('[TokenStatsManager] Error in stats change listener:', error);
      }
    }
  }

  /**
   * Register a callback to receive updates when new prediction stats become available.
   * Returns a cleanup function that removes the listener.
   */
  static addChangeListener(listener: StatsChangeListener): () => void {
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }

  /**
   * Calculate total tokens from the most recent prediction.
   * Falls back to REST API → estimation if no stats available.
   */
  static getTotalTokens(estimatedCount: number): number {
    // Priority 1: SDK PredictionResult.stats
    if (lastPredictionStats?.totalTokensCount != null) {
      return lastPredictionStats.totalTokensCount;
    }

    // Priority 2: REST API accumulated session total
    const restApiTotal = lmStudioApi.getSessionTotalTokens();
    if (restApiTotal > 0) {
      return restApiTotal;
    }

    // Fallback: estimation
    return estimatedCount;
  }

  /**
   * Calculate prompt tokens from the most recent prediction.
   * Falls back to REST API → estimation if no stats available.
   */
  static getPromptTokens(estimatedCount: number): number {
    if (lastPredictionStats?.promptTokensCount != null) {
      return lastPredictionStats.promptTokensCount;
    }

    // Priority 2: REST API last request prompt tokens
    const lastRestApi = lmStudioApi.getLastTokenData();
    if (lastRestApi?.promptTokens != null) {
      return lastRestApi.promptTokens;
    }

    // Fallback: estimation
    return estimatedCount;
  }

  /**
   * Calculate predicted tokens from the most recent prediction.
   */
  static getPredictedTokens(): number | undefined {
    if (lastPredictionStats?.predictedTokensCount != null) {
      return lastPredictionStats.predictedTokensCount;
    }

    // Priority 2: REST API last request completion tokens
    const lastRestApi = lmStudioApi.getLastTokenData();
    if (lastRestApi?.completionTokens != null) {
      return lastRestApi.completionTokens;
    }

    return undefined;
  }

  /**
   * Get the cumulative token count across all predictions in this session.
   * Matches LM Studio's sidebar total exactly.
   */
  static getCumulativeTotal(): number {
    return cumulativeTotalTokens;
  }

  /**
   * Record the payload size of a tool result returned mid-turn (FIX #20 A1).
   * Call this for every tool invocation so the AutoTracker's mid-loop guard can see how much
   * context each tool call is consuming BEFORE the next user message triggers a recount.
   * @returns estimated tokens added to the current turn's delta
   */
  static recordToolResult(toolName: string, payload: unknown): number {
    const chars = measurePayloadChars(payload);
    midLoopDeltaChars += chars;
    const estTokens = estimateTokensFromChars(chars);
    midLoopEstTokens += estTokens;
    const deltaLogBase = `[AutoTracker] [DELTA] +${estTokens} tok from ${toolName} (${chars.toLocaleString('en-US')} chars, turn total ≈ ${midLoopEstTokens.toLocaleString('en-US')} tok`;
    if (turnBaselineTokens > 0) {
      // Live whole-chat estimate: authoritative TokenCheck baseline for this turn + estimated tool payloads since.
      console.log(`${deltaLogBase} | chat used ≈ ${(turnBaselineTokens + midLoopEstTokens).toLocaleString('en-US')} tok)`);
    } else {
      // No baseline published (ContextGuard recount failed -> safe no-op guard): omit combined value to avoid misleading numbers.
      console.log(`${deltaLogBase})`);
    }
    return estTokens;
  }

  /** Estimated tokens accumulated by tool results since the last preprocess() call. */
  static getMidLoopDeltaTokens(): number {
    return midLoopEstTokens;
  }

  /** Raw character sum of tool results this turn (diagnostics / tests). */
  static getMidLoopDeltaChars(): number {
    return midLoopDeltaChars;
  }

  /**
   * Reset per-turn evaluation state. MUST be called at the start of every preprocess() run: by that point
   * the previous turn's tool results are part of pullHistory() and counted natively — keeping the old
   * delta would double-count them (FIX #20 A1 invariant). Also zeroes baseline/limit so a turn in which
   * ContextGuard fails to recount gets a SAFE no-op mid-loop guard (maxTokens = 0) instead of one that
   * evaluates growth against stale numbers from the previous turn.
   */
  static resetMidLoopDelta(): void {
    if (midLoopEstTokens > 0) {
      console.log(`[AutoTracker] [DELTA] Resetting turn delta (~${midLoopEstTokens.toLocaleString()} tok now counted natively via history)`);
    }
    midLoopDeltaChars = 0;
    midLoopEstTokens = 0;
    turnBaselineTokens = 0;
    maxContextTokens = 0;
  }

  /**
   * FIX #20 A2 — publish the turn's evaluation baseline + model context limit for the mid-loop guard.
   * Called from promptPreprocessor.preprocess() right after ContextGuard computed both values.
   */
  static setTurnEvaluation(baselineTokens: number, maxTokens: number): void {
    turnBaselineTokens = Math.max(0, baselineTokens);
    maxContextTokens = Math.max(0, maxTokens);
  }

  /** FIX #20 A2 — token count at the start of the current turn (before any tool calls). */
  static getTurnBaseline(): number {
    return turnBaselineTokens;
  }

  /** FIX #20 A2 — model context limit used by the mid-loop guard percentage math. */
  static getMaxContextTokens(): number {
    return maxContextTokens;
  }

  /**
   * Reset stats cache and REST API session state (e.g., on chat reset).
   */
  static clear(): void {
    lastPredictionStats = null;
    lmStudioApi.resetSessionState();
    cumulativeTotalTokens = 0; // 🔥 Reset cumulative tracker on new session
    midLoopDeltaChars = 0; // FIX #20 A1 — fresh session, no in-flight tool loop
    midLoopEstTokens = 0;
    turnBaselineTokens = 0; // FIX #20 A2 — baseline/limit republished at next preprocess()
    maxContextTokens = 0;
  }

  /**
   * Get a human-readable summary of the latest prediction.
   * Includes both SDK stats, REST API data, and cumulative session total.
   */
  static getSummary(): string | null {
    const parts: string[] = [];
    
    // Add SDK stats if available
    if (lastPredictionStats) {
      if (lastPredictionStats.promptTokensCount != null) {
        parts.push(`Prompt: ${lastPredictionStats.promptTokensCount.toLocaleString()} tokens`);
      }
      if (lastPredictionStats.predictedTokensCount != null) {
        parts.push(`Generated: ${lastPredictionStats.predictedTokensCount.toLocaleString()} tokens`);
      }
      if (lastPredictionStats.totalTokensCount != null) {
        parts.push(`Total: ${lastPredictionStats.totalTokensCount.toLocaleString()} tokens`);
      }
      if (lastPredictionStats.tokensPerSecond != null && isFinite(lastPredictionStats.tokensPerSecond)) {
        parts.push(`Speed: ${lastPredictionStats.tokensPerSecond.toFixed(1)} tok/s`);
      }
    }

    // Add REST API summary if available (separate prefix)
    const restApiSummary = lmStudioApi.getTokenSummary();
    if (restApiSummary) {
      // Remove the "[LM Studio REST API]" prefix to merge cleanly
      parts.push(restApiSummary.replace('[LM Studio REST API] ', ''));
    }

    // 🔥 Add cumulative session total for sidebar matching
    const cumTotal = this.getCumulativeTotal();
    if (cumTotal > 0) {
      parts.push(`Session Total: ${cumTotal.toLocaleString()} tokens`);
    }

    return parts.length > 0 ? `[LM Studio Stats] ${parts.join(' | ')}` : null;
  }

  /**
   * Check if we have fresh stats available (less than 30 seconds old).
   */
  static hasFreshStats(): boolean {
    // Since we don't track timestamps, just check if stats exist
    return lastPredictionStats !== null;
  }
}
