/**
 * Auto-Tracking Module
 * 
 * Automatically detects and tracks important events in conversation:
 * - Decisions ("I decided", "conclusion")
 * - Completions ("successfully completed", "finished")
 * - Error fixes ("fixed the bug", "resolved")
 * 
 * Runs silently in background when enabled. Detected actions are buffered in-memory
 * and flushed to persistent context storage either:
 * 1. Automatically when token threshold is reached (with user confirmation prompt)
 * 2. Manually via flushActionsToMemory() if needed
 */

import { z } from 'zod';

// ==================== TYPES ====================

export const AutoTrackConfigSchema = z.object({
  autoTrackingEnabled: z.boolean().default(false),
  autoTrackTokenThreshold: z.number().min(10).max(100).default(75),
  autoTrackDecisions: z.boolean().default(true),
  autoTrackCompletions: z.boolean().default(true),
  autoTrackErrors: z.boolean().default(true),
  autoSummaryInterval: z.number().min(10).max(200).default(50),
});

export type AutoTrackConfig = z.infer<typeof AutoTrackConfigSchema> & {
  lastTokenThresholdCheck?: boolean; // Track if threshold was already triggered this session
};

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
  
  // 🔹 NEW: In-memory buffer for detected actions (flushed on threshold or manually)
  private actionBuffer: AutoTrackAction[] = [];
  
  // 🔹 NEW: Holds the pending checkpoint warning prompt until consumed by user
  private pendingCheckpointWarning: string | undefined = undefined;

  constructor(config?: Partial<AutoTrackConfig>) {
    this.config = {
      autoTrackingEnabled: false,
      autoTrackTokenThreshold: 75,
      autoTrackDecisions: true,
      autoTrackCompletions: true,
      autoTrackErrors: true,
      autoSummaryInterval: 50,
      lastTokenThresholdCheck: false,
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
   * Check if token threshold has been reached.
   * @param currentTokens Current token count in the session
   * @param maxTokens Maximum allowed tokens (context window size)
   * @returns true if threshold was triggered and auto-tracking is enabled
   */
  checkTokenThreshold(currentTokens: number, maxTokens: number): boolean {
    if (!this.config.autoTrackingEnabled || !maxTokens || maxTokens <= 0) {
      return false;
    }

    const usagePercentage = (currentTokens / maxTokens) * 100;
    const threshold = this.config.autoTrackTokenThreshold ?? 75;

    // Only trigger once per session (reset on resetCounter or new session)
    if (!this.config.lastTokenThresholdCheck && usagePercentage >= threshold) {
      console.warn(`[AutoTracker] Token threshold reached: ${usagePercentage.toFixed(1)}% (${currentTokens}/${maxTokens}) — triggering user confirmation prompt`);
      this.config.lastTokenThresholdCheck = true; // Mark as triggered for this session
      return true;
    }

    return false;
  }

  /**
   * Reset token threshold flag (call on new session or after trigger fires).
   */
  resetTokenThreshold(): void {
    if (this.config.lastTokenThresholdCheck) {
      this.config.lastTokenThresholdCheck = false;
      console.warn(`[AutoTracker] Token threshold flag reset`);
    }
  }

  /**
   * Check threshold and generate a user-facing prompt if triggered.
   * Returns { triggered, warning? } instead of auto-saving immediately.
   */
  checkAndGeneratePrompt(currentTokens: number, maxTokens: number): { triggered: boolean; warning?: string } {
    const usagePercentage = (currentTokens / maxTokens) * 100;
    const threshold = this.config.autoTrackTokenThreshold ?? 75;

    if (!this.config.autoTrackingEnabled || !maxTokens || maxTokens <= 0 || usagePercentage < threshold) {
      return { triggered: false };
    }

    // Only trigger once per session (reset on resetCounter or new session)
    if (!this.config.lastTokenThresholdCheck) {
      this.config.lastTokenThresholdCheck = true;
      
      const bufferedCount = this.actionBuffer.length;
      const warning = `⚠️ SESSION WARNING: You have reached ${usagePercentage.toFixed(0)}% of your token limit. It is highly recommended to create a session backup before continuing.\n\nAuto-tracked events in buffer (will be saved with checkpoint): ${bufferedCount}\n\nDo you want to proceed with a backup? Reply 'YES' to trigger the backup tool, or 'NO' to continue.`;
      
      this.pendingCheckpointWarning = warning;
      console.warn(`[AutoTracker] Threshold reached: ${usagePercentage.toFixed(1)}% — waiting for user confirmation`);
    }

    return { triggered: true, warning: this.pendingCheckpointWarning };
  }

  /** 
   * Consume and clear the pending warning (call after user replies YES/NO).
   */
  consumePendingConfirmation(): string | undefined {
    const warn = this.pendingCheckpointWarning;
    if (warn) {
      this.pendingCheckpointWarning = undefined; // 🔹 Clear so it doesn't repeat every turn
    }
    return warn;
  }

  /** Check if a checkpoint warning is currently waiting for user response */
  hasPendingWarning(): boolean {
    return !!this.pendingCheckpointWarning;
  }

  /** 
   * Consume and clear the pending warning (legacy alias — call after injection into prompt).
   */
  getAndClearPendingWarning(): string | undefined {
    const warn = this.pendingCheckpointWarning;
    if (warn) {
      this.pendingCheckpointWarning = undefined; // 🔹 Consume it so it doesn't repeat every turn
    }
    return warn;
  }

  /**
   * Flush buffered actions to persistent context storage.
   * Called automatically when token threshold is reached, or manually via tool call.
   */
  async flushActionsToMemory(): Promise<number> {
    if (this.actionBuffer.length === 0) return 0;
    
    const flushed = this.actionBuffer.splice(0); // 🔹 Clear buffer safely before async I/O
    let savedCount = 0;

    try {
      const { ContextStorageManager } = await import('./tools/contextManagementTools.js');
      const storage = new ContextStorageManager();

      for (const action of flushed) {
        await storage.addEntry({
          id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: action.type === 'error_fix' ? 'error' : 
                (action.type === 'completion' ? 'summary' : 'decision'),
          title: `${action.type.charAt(0).toUpperCase() + action.type.slice(1)} Auto-Track`,
          content: `Auto-detected ${action.type}: "${action.content}"\nConfidence: ${(action.confidence * 100).toFixed(0)}%\nOriginal context: "${action.originalMessage.slice(0, 200)}"`,
          tags: ['auto_track', action.type],
        });
        savedCount++;
      }

      console.warn(`[AutoTracker] Flushed ${savedCount} auto-tracked event(s) to persistent memory`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[AutoTracker] Failed to flush actions: ${message}`);
    }

    return savedCount;
  }

  /**
   * Auto-save session memory when token threshold is reached.
   * This creates a context entry capturing the session state to prevent data loss.
   */
  async autoSaveSessionMemory(
    currentTokens: number,
    maxTokens: number,
    messageCount: number,
  ): Promise<{ saved: boolean; sessionId?: string }> {
    if (!this.config.autoTrackingEnabled) {
      return { saved: false };
    }

    // 🔹 NEW: Flush buffered detections before checkpointing
    const flushedCount = await this.flushActionsToMemory();

    const usagePercentage = ((currentTokens / maxTokens) * 100).toFixed(1);
    const threshold = this.config.autoTrackTokenThreshold ?? 75;

    // Generate a session checkpoint entry
    const entryId = `ctx_${Date.now()}_checkpoint`;
    const timestamp = Date.now();
    
    // 🔹 NEW: Include flushed action count in checkpoint content
    const contextEntry = {
      id: entryId,
      timestamp,
      type: 'summary' as const,
      title: `Session Memory Checkpoint (${usagePercentage}% tokens used)`,
      content: `Auto-triggered session memory save at ${threshold}% token threshold.\n\nCurrent session state:\n- Tokens used: ${currentTokens} / ${maxTokens} (${usagePercentage}%)\n- Messages in session: ${messageCount}\n- Threshold configured: ${threshold}%\n- Auto-tracked events flushed this checkpoint: ${flushedCount}\n\nThis checkpoint preserves critical context before potential overflow.`,
      tags: ['auto_checkpoint', 'token_threshold'],
    };

    // Save to persistent memory via the storage manager (imported dynamically)
    try {
      const { ContextStorageManager } = await import('./tools/contextManagementTools.js');
      const storage = new ContextStorageManager();
      await storage.addEntry(contextEntry);
      
      console.warn(`[AutoTracker] Session checkpoint saved: ${entryId}`);
      return { saved: true, sessionId: entryId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[AutoTracker] Failed to save session checkpoint: ${message}`);
      return { saved: false };
    }
  }

  /**
   * Full token threshold check with auto-save.
   * Returns the result including whether a checkpoint was saved.
   */
  async checkAndSaveTokenThreshold(
    currentTokens: number,
    maxTokens: number,
    messageCount?: number,
  ): Promise<{ triggered: boolean; saved: boolean; sessionId?: string }> {
    const thresholdTriggered = this.checkTokenThreshold(currentTokens, maxTokens);

    if (!thresholdTriggered) {
      return { triggered: false, saved: false };
    }

    // Threshold triggered — now auto-save session memory
    const msgCount = messageCount ?? 0;
    const saveResult = await this.autoSaveSessionMemory(currentTokens, maxTokens, msgCount);

    if (saveResult.saved) {
      console.warn(`[AutoTracker] Session memory checkpoint saved successfully`);
      return { triggered: true, saved: true, sessionId: saveResult.sessionId };
    } else {
      console.error(`[AutoTracker] Token threshold reached but session memory save failed`);
      return { triggered: true, saved: false };
    }
  }

  /**
   * Analyze a message for auto-tracking triggers.
   * Returns array of detected actions (can be multiple).
   * Actions are ALSO buffered in-memory for later flush to persistent storage.
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

    // 🔹 NEW: Buffer detected actions for later flush to persistent storage
    if (actions.length > 0) {
      this.actionBuffer.push(...actions);
      console.warn(`[AutoTracker] Buffered ${actions.length} action(s). Total in buffer: ${this.actionBuffer.length}`);
      
      // 🔹 Safety cap: auto-flush if buffer grows too large (>50 entries)
      if (this.actionBuffer.length > 50) {
        console.warn('[AutoTracker] Buffer exceeded safety limit, flushing early...');
        void this.flushActionsToMemory(); // Fire-and-forget — intentionally unawaited to avoid blocking preprocessor
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
  
  /**
   * Get the current number of buffered actions (for UI/logging).
   */
  getBufferedActionCount(): number {
    return this.actionBuffer.length;
  }
}

// ==================== SINGLETON INSTANCE ====================

export const autoTracker = new AutoTracker();
