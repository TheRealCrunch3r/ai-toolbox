/**
 * Auto-Tracking Module
 * 
 * Automatically detects and tracks important events in conversation:
 * - Decisions ("I decided", "conclusion")
 * - Completions ("successfully completed", "finished")
 * - Error fixes ("fixed the bug", "resolved")
 * 
 * Runs silently in background when enabled.
 */

import { z } from 'zod';

// ==================== TYPES ====================

export const AutoTrackConfigSchema = z.object({
  autoTrackingEnabled: z.boolean().default(false),
  autoTrackDecisions: z.boolean().default(true),
  autoTrackCompletions: z.boolean().default(true),
  autoTrackErrors: z.boolean().default(true),
  autoSummaryInterval: z.number().min(10).max(200).default(50),
});

export type AutoTrackConfig = z.infer<typeof AutoTrackConfigSchema>;

export interface AutoTrackAction {
  type: 'decision' | 'completion' | 'error_fix';
  content: string;
  originalMessage: string;
  confidence: number; // 0-1 match confidence
}

export interface TrackResult {
  tracked: boolean;
  action?: AutoTrackAction;
  message?: string;
}

// ==================== PATTERN DEFINITIONS ====================

const DECISION_PATTERNS = [
  { pattern: /decided\s+(to|upon)/i, weight: 0.9 },
  { pattern: /conclusion[:\s]+/i, weight: 0.85 },
  { pattern: /final\s+decision/i, weight: 0.9 },
  { pattern: /going\s+with/i, weight: 0.7 },
  { pattern: /settled\s+on/i, weight: 0.75 },
  { pattern: /chose\s+to/i, weight: 0.7 },
];

const COMPLETION_PATTERNS = [
  { pattern: /successfully\s+(completed|finished)/i, weight: 0.9 },
  { pattern: /done\s+with/i, weight: 0.6 },
  { pattern: /completed\s+the/i, weight: 0.75 },
  { pattern: /finished\s+implementing/i, weight: 0.8 },
  { pattern: /implementation\s+complete/i, weight: 0.85 },
];

const ERROR_FIX_PATTERNS = [
  { pattern: /fixed\s+(the|a)/i, weight: 0.8 },
  { pattern: /resolved\s+the/i, weight: 0.8 },
  { pattern: /bug\s+fix/i, weight: 0.75 },
  { pattern: /error.*solved/i, weight: 0.7 },
  { pattern: /issue\s+(resolved|addressed)/i, weight: 0.75 },
];

// ==================== AUTO-TRACKER CLASS ====================

export class AutoTracker {
  private config: AutoTrackConfig;
  private messageCount = 0;
  private readonly MIN_CONFIDENCE = 0.6; // Minimum confidence to trigger tracking

  constructor(config?: Partial<AutoTrackConfig>) {
    this.config = {
      autoTrackingEnabled: false,
      autoTrackDecisions: true,
      autoTrackCompletions: true,
      autoTrackErrors: true,
      autoSummaryInterval: 50,
      ...config,
    };
    console.warn(`[AutoTracker] Initialized with config:`, this.config);
  }

  /** Update configuration dynamically */
  updateConfig(partial: Partial<AutoTrackConfig>): void {
    this.config = { ...this.config, ...partial };
    console.warn(`[AutoTracker] Config updated:`, this.config);
  }

  /**
   * Analyze a message for auto-tracking triggers.
   * Returns array of detected actions (can be multiple).
   */
  analyzeMessage(message: string): AutoTrackAction[] {
    const actions: AutoTrackAction[] = [];

    if (!this.config.autoTrackingEnabled) {
      return actions;
    }

    // Track decisions
    if (this.config.autoTrackDecisions) {
      const decisionMatch = this.detectPattern(message, DECISION_PATTERNS);
      if (decisionMatch) {
        actions.push({
          type: 'decision',
          content: this.extractContent(message, decisionMatch.pattern),
          originalMessage: message.slice(0, 500), // Truncate for storage
          confidence: decisionMatch.weight ?? 0,
        });
      }
    }

    // Track completions
    if (this.config.autoTrackCompletions) {
      const completionMatch = this.detectPattern(message, COMPLETION_PATTERNS);
      if (completionMatch) {
        actions.push({
          type: 'completion',
          content: this.extractContent(message, completionMatch.pattern),
          originalMessage: message.slice(0, 500),
          confidence: completionMatch.weight ?? 0,
        });
      }
    }

    // Track error fixes
    if (this.config.autoTrackErrors) {
      const errorMatch = this.detectPattern(message, ERROR_FIX_PATTERNS);
      if (errorMatch) {
        actions.push({
          type: 'error_fix',
          content: this.extractContent(message, errorMatch.pattern),
          originalMessage: message.slice(0, 500),
          confidence: errorMatch.weight ?? 0,
        });
      }
    }

    // Increment message counter for session summaries
    this.messageCount++;
    if (this.messageCount % this.config.autoSummaryInterval === 0) {
      console.warn(`[AutoTracker] Session summary interval reached: ${this.messageCount} messages`);
    }

    return actions;
  }

  /**
   * Detect if any pattern matches the text.
   * Returns highest-weight match or null.
   */
  private detectPattern(
    text: string,
    patterns: Array<{ pattern: RegExp; weight: number }>
  ): { pattern: RegExp; weight?: number } | null {
    let bestMatch: { pattern: RegExp; weight?: number } | null = null;

    for (const { pattern, weight } of patterns) {
      if (pattern.test(text)) {
        if (!bestMatch || weight > (bestMatch.weight ?? 0)) {
          bestMatch = { pattern, weight };
        }
      }
    }

    return bestMatch?.weight !== undefined && bestMatch.weight >= this.MIN_CONFIDENCE ? bestMatch : null;
  }

  /**
   * Extract meaningful content around the matched pattern.
   */
  private extractContent(text: string, pattern: RegExp): string {
    const match = text.match(pattern);
    if (!match) return text.slice(0, 200);

    // Get context around the match (up to end of sentence)
    const startPos = Math.max(0, (match as RegExpExecArray).index - 50);
    const endPos = text.indexOf('.', match[0].length) + 1;
    
    return text.slice(startPos, endPos || startPos + 200).trim();
  }

  /**
   * Get current message count (for session summary tracking).
   */
  getMessageCount(): number {
    return this.messageCount;
  }

  /**
   * Reset message counter (e.g., new chat session).
   */
  resetCounter(): void {
    this.messageCount = 0;
    console.warn(`[AutoTracker] Message counter reset`);
  }

  /**
   * Get configuration.
   */
  getConfig(): AutoTrackConfig {
    return { ...this.config };
  }
}

// ==================== SINGLETON INSTANCE ====================

export const autoTracker = new AutoTracker();
