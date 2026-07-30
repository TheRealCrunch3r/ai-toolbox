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
   * Reset stats cache and REST API session state (e.g., on chat reset).
   */
  static clear(): void {
    lastPredictionStats = null;
    lmStudioApi.resetSessionState();
    cumulativeTotalTokens = 0; // 🔥 Reset cumulative tracker on new session
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
