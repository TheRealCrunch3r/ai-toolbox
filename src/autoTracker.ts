/**
 * Auto-Tracking Module (Refactored with Finite State Machine)
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

// ==================== CONSTANTS ====================

/** Fixed token overhead added by ContextGuard.countTokens() for BOS/system structure */
const CONTEXT_GUARD_OVERHEAD = 8;

/** Maximum buffer size before forced auto-flush (safety cap) */
const MAX_BUFFER_SIZE = 50;

// 🔹 P1 Optimization #3: Conditional logging to reduce stderr I/O in production
const DEBUG_MODE = !!process.env.AI_TOOLBOX_DEBUG;

function debugLog(...args: unknown[]): void {
  if (DEBUG_MODE) console.warn('[AutoTracker]', ...args);
}

// ==================== FSM TYPES ====================

/**
 * Finite State Machine states for AutoTracker's checkpoint flow.
 * Replaces boolean flags (`lastTokenThresholdCheck`) with explicit, traceable state transitions.
 */
export enum AutoTrackState {
  /** Normal operation — threshold not reached this session */
  IDLE = 'IDLE',
  /** Threshold hit, warning generated, awaiting user reply (YES/NO) */
  THRESHOLD_REACHED = 'THRESHOLD_REACHED',
  /** User replied YES to checkpoint prompt; processing save */
  CONFIRMED = 'CONFIRMED',
  /** User replied NO to checkpoint prompt; will reset for next session */
  DECLINED = 'DECLINED',
}

/** Records a state transition for debugging/audit trails */
export interface AutoTrackTransition {
  from: AutoTrackState;
  to: AutoTrackState;
  reason?: string;
  timestamp: number;
}

// ==================== TYPES ====================

export interface IContextStorage {
  addEntry(entry: unknown): Promise<void>;
}

export const AutoTrackConfigSchema = z.object({
  autoTrackingEnabled: z.boolean().default(false),
  autoTrackTokenThreshold: z.number().min(10).max(100).default(75),
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

// ==================== AUTO-TRACKER CLASS (FSM) ====================

export class AutoTracker {
  private config: AutoTrackConfig;
  private messageCount = 0;
  private readonly MIN_CONFIDENCE = 0.6; // Minimum confidence to trigger tracking
  
  // 🔹 FSM State — replaces boolean `lastTokenThresholdCheck`
  private currentState: AutoTrackState = AutoTrackState.IDLE;
  
  // 🔹 Transition history for debugging (capped at 100 entries)
  private transitionHistory: AutoTrackTransition[] = [];

  // 🔹 In-memory buffer for detected actions (flushed on threshold or manually)
  private actionBuffer: AutoTrackAction[] = [];
  
  // 🔹 Guard to prevent concurrent flushes (I/O concurrency, not FSM state)
  private isFlushing = false;
  
  // 🔹 Holds the pending checkpoint warning prompt until consumed by user
  private pendingCheckpointWarning: string | undefined = undefined;

  // 🔹 Optional injected storage manager for testing (avoids dynamic import issues)
  private testStorageManager: unknown = null;

  // 🔹 P1 Optimization #4: Pre-resolved ContextStorageManager module to avoid per-flush overhead
  private contextStorageModule: { ContextStorageManager: new () => IContextStorage } | null = null;

  // 🔹 Prevent repeated near-threshold console spam — only warn once per IDLE→THRESHOLD cycle
  private _nearThresholdWarned = false;

  constructor(config?: Partial<AutoTrackConfig>, testStorageManager?: unknown) {
    this.config = {
      autoTrackingEnabled: true, // ← Matches schema & DEFAULT_CONFIG default (true)
      autoTrackTokenThreshold: 75,
      autoTrackDecisions: true,
      autoTrackCompletions: true,
      autoTrackErrors: true,
      autoSummaryInterval: 50,
      ...config,
    };
    this.testStorageManager = testStorageManager || null; // For testing
    
    debugLog('[INIT] Initialized with config:', this.config);

    // 🔹 P1 #4: Pre-resolve module on construction (cached by V8/module system)
    import('./tools/contextManagementTools.js').then(m => {
      this.contextStorageModule = m;
    }).catch(err => {
      console.error('[AutoTracker] Failed to pre-load ContextStorageManager:', err);
    });
  }

  /** Update configuration dynamically */
  updateConfig(partial: Partial<AutoTrackConfig>): void {
    this.config = { ...this.config, ...partial };
    debugLog('[CONFIG] Config updated:', this.config);
  }

  // ==================== FSM TRANSITION LOGIC ====================

  /**
   * Transition to a new state with logging and history tracking.
   */
  private transitionTo(newState: AutoTrackState, reason?: string): void {
    const oldState = this.currentState;
    
    if (oldState !== newState) {
      debugLog('[STATE]', `${oldState} → ${newState}${reason ? ` (${reason})` : ''}`);
      
      // Append to transition history (capped at 100 entries for memory safety)
      this.transitionHistory.push({ from: oldState, to: newState, reason, timestamp: Date.now() });
      if (this.transitionHistory.length > 100) {
        this.transitionHistory.shift();
      }

      // Reset pending warning on any state change (safety net)
      if (newState !== AutoTrackState.THRESHOLD_REACHED && this.pendingCheckpointWarning) {
        this.pendingCheckpointWarning = undefined;
      }

      // Reset near-threshold warning flag when leaving IDLE or cycling back to it
      if (this.currentState === AutoTrackState.IDLE || newState === AutoTrackState.IDLE) {
        this._nearThresholdWarned = false;
      }

      this.currentState = newState;
    }
  }

  /**
   * Get current FSM state.
   */
  getState(): AutoTrackState {
    return this.currentState;
  }

  /**
   * Get transition history for debugging/audit (last N entries).
   */
  getTransitionHistory(maxEntries?: number): AutoTrackTransition[] {
    const limit = maxEntries ?? 100;
    return this.transitionHistory.slice(-limit);
  }

  // ==================== TOKEN THRESHOLD CHECKS ====================

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

    // Subtract ContextGuard's fixed BOS/system overhead for accurate percentage calculation
    const effectiveTokens = Math.max(0, currentTokens - CONTEXT_GUARD_OVERHEAD);
    const usagePercentage = (effectiveTokens / maxTokens) * 100;
    const threshold = this.config.autoTrackTokenThreshold ?? 75;

    // 🔹 P1 #3: Conditional logging in debug mode or near threshold (once per cycle)
    if (DEBUG_MODE) {
      console.warn(`[AutoTracker] [THRESHOLD] Check: ${usagePercentage.toFixed(2)}% effective (${currentTokens}/${maxTokens}), limit=${threshold}%`);
    } else if (this.currentState === AutoTrackState.IDLE && usagePercentage >= threshold * 0.95 && !this._nearThresholdWarned) {
      console.warn(`[AutoTracker] [THRESHOLD] Near threshold: ${usagePercentage.toFixed(1)}%`);
      this._nearThresholdWarned = true; // Prevent repeated warnings in the same IDLE cycle
    }

    // FSM: IDLE → THRESHOLD_REACHED
    if (this.currentState === AutoTrackState.IDLE && usagePercentage >= threshold) {
      debugLog('[THRESHOLD]', `Threshold reached — transitioning to THRESHOLD_REACHED state`);
      this.transitionTo(AutoTrackState.THRESHOLD_REACHED, `usage=${usagePercentage.toFixed(1)}%`);
      return true;
    }
    // Already in THRESHOLD_REACHED or other states (CONFIRMED, DECLINED) — do not re-trigger per FSM design
    if (this.currentState !== AutoTrackState.IDLE) {
      debugLog('[THRESHOLD]', `Skipped: already in ${this.currentState} state`);
    }

    return false;
  }

  /**
   * Reset token threshold flag (call on new session or after trigger fires).
   */
  resetTokenThreshold(): void {
    if (this.currentState !== AutoTrackState.IDLE) {
      debugLog('[RESET]', `Explicit reset from ${this.currentState} → IDLE`);
      this.transitionTo(AutoTrackState.IDLE, 'explicit_reset');
    } else {
      debugLog('[RESET]', 'Already in IDLE state — no action needed');
    }
  }

  /**
   * Check threshold and generate a user-facing prompt if triggered.
   * Returns { triggered, warning? } instead of auto-saving immediately.
   */
  checkAndGeneratePrompt(currentTokens: number, maxTokens: number): { triggered: boolean; warning?: string } {
    // Subtract ContextGuard's fixed BOS/system overhead for accurate percentage calculation
    const effectiveTokens = Math.max(0, currentTokens - CONTEXT_GUARD_OVERHEAD);
    const usagePercentage = (effectiveTokens / maxTokens) * 100;
    const threshold = this.config.autoTrackTokenThreshold ?? 75;

    if (!this.config.autoTrackingEnabled || !maxTokens || maxTokens <= 0 || usagePercentage < threshold) {
      return { triggered: false };
    }

    // FSM transition handled by checkTokenThreshold (called before or in parallel)
    // If we're already in THRESHOLD_REACHED, just return the existing warning
    if (this.currentState === AutoTrackState.THRESHOLD_REACHED && this.pendingCheckpointWarning) {
      debugLog('[PROMPT]', `Returning existing pending warning (${usagePercentage.toFixed(1)}%)`);
      return { triggered: true, warning: this.pendingCheckpointWarning };
    }

    // First trigger — generate new prompt
    this.transitionTo(AutoTrackState.THRESHOLD_REACHED, `first_trigger=${usagePercentage.toFixed(1)}%`);
    
    const bufferedCount = this.actionBuffer.length;
    const warning = `⚠️ SESSION WARNING: You have reached ${usagePercentage.toFixed(0)}% of your token limit. It is highly recommended to create a session backup before continuing.\n\nAuto-tracked events in buffer (will be saved with checkpoint): ${bufferedCount}\n\nDo you want to proceed with a backup? Reply 'YES' to trigger the backup tool, or 'NO' to continue.`;
    
    this.pendingCheckpointWarning = warning;
    debugLog('[PROMPT]', 'Generated checkpoint prompt for user confirmation');

    return { triggered: true, warning };
  }

  /** 
   * Consume and clear the pending warning (call after user replies YES/NO).
   * Returns the warning text so caller can process it.
   */
  consumePendingConfirmation(): string | undefined {
    const warn = this.pendingCheckpointWarning;
    if (warn) {
      debugLog('[CONSUME]', 'Pending warning consumed');
      this.pendingCheckpointWarning = undefined; // 🔹 Clear so it doesn't repeat every turn
    }
    return warn;
  }

  /** Check if a checkpoint warning is currently waiting for user response */
  hasPendingWarning(): boolean {
    const result = !!this.pendingCheckpointWarning && this.currentState === AutoTrackState.THRESHOLD_REACHED;
    debugLog('[HAS_WARNING]', `${result ? 'Yes' : 'No'} (state=${this.currentState})`);
    return result;
  }

  /**
   * Process user reply to checkpoint prompt. Handles FSM transitions for YES/NO paths.
   * @param reply 'YES' or 'NO'
   */
  processUserReply(reply: 'YES' | 'NO'): void {
    if (this.currentState !== AutoTrackState.THRESHOLD_REACHED) {
      debugLog('[REPLY]', `Ignoring ${reply} — not in THRESHOLD_REACHED state`);
      return;
    }

    const replyUpper = reply.toUpperCase();
    
    if (replyUpper === 'YES') {
      // User confirmed → transition to CONFIRMED, caller will trigger checkpoint save
      debugLog('[REPLY]', `YES received — transitioning to CONFIRMED state`);
      this.transitionTo(AutoTrackState.CONFIRMED, 'user_confirmed');
    } else {
      // User declined → transition to DECLINED, then immediately back to IDLE (Bug #3 fix)
      debugLog('[REPLY]', `NO received — transitioning to DECLINED, then IDLE`);
      this.transitionTo(AutoTrackState.DECLINED, 'user_declined');
      this.transitionTo(AutoTrackState.IDLE, 'post_decline_reset');
    }

    // Clear warning regardless of reply
    this.pendingCheckpointWarning = undefined;
  }

  /**
   * Flush buffered actions to persistent context storage.
   * Called automatically when token threshold is reached, or manually via tool call.
   */
  async flushActionsToMemory(): Promise<number> {
    // 🔹 FIX #4: Prevent concurrent flushes (race condition with checkpoint save)
    if (this.isFlushing || this.actionBuffer.length === 0) {
      debugLog('[FLUSH]', `Skipped: isFlushing=${this.isFlushing}, bufferLen=${this.actionBuffer.length}`);
      return 0;
    }

    const preFlushCount = this.actionBuffer.length;
    this.isFlushing = true;
    const flushed = this.actionBuffer.splice(0); // 🔹 Clear buffer safely before async I/O
    
    debugLog('[FLUSH]', `Starting flush of ${preFlushCount} action(s)`);

    let savedCount = 0;

    try {
      // Use injected storage manager for testing, otherwise pre-resolved module
      let storage;
      if (this.testStorageManager) {
        const Ctor = this.testStorageManager as unknown as new () => { addEntry(e: unknown): Promise<void> };
        storage = new Ctor();
      } else {
        // 🔹 P1 #4: Direct access — no dynamic import overhead!
        if (!this.contextStorageModule) {
          throw new Error('ContextStorageManager module not loaded');
        }
        const { ContextStorageManager } = this.contextStorageModule;
        storage = new ContextStorageManager();
      }

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

      debugLog('[FLUSH]', `Completed: ${savedCount}/${preFlushCount} actions flushed to persistent memory`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[AutoTracker] [FLUSH] Failed: ${message}`);
    } finally {
      // 🔹 Always reset guard, even on failure
      this.isFlushing = false;
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
      debugLog('[CHECKPOINT]', 'Skipped: autoTracking disabled');
      return { saved: false };
    }

    // Subtract ContextGuard's fixed BOS/system overhead for accurate display
    const effectiveTokens = Math.max(0, currentTokens - CONTEXT_GUARD_OVERHEAD);
    const usagePercentage = ((effectiveTokens / maxTokens) * 100).toFixed(1);
    const threshold = this.config.autoTrackTokenThreshold ?? 75;

    debugLog('[CHECKPOINT]', `Generating checkpoint at ${usagePercentage}% (${currentTokens}/${maxTokens})`);

    // Generate a session checkpoint entry
    const entryId = `ctx_${Date.now()}_checkpoint`;
    const timestamp = Date.now();

    const contextEntry = {
      id: entryId,
      timestamp,
      type: 'summary' as const,
      title: `Session Memory Checkpoint (${usagePercentage}% tokens used)`,
      content: `Auto-triggered session memory save at ${threshold}% token threshold.\n\nCurrent session state:\n- Tokens used: ${currentTokens} / ${maxTokens} (${usagePercentage}%)\n- Messages in session: ${messageCount}\n- Threshold configured: ${threshold}%\n- Auto-tracked events in buffer: ${this.actionBuffer.length}\n\nThis checkpoint preserves critical context before potential overflow.`,
      tags: ['auto_checkpoint', 'token_threshold'],
    };

    // Save to persistent memory via the storage manager (injected for testing or pre-resolved)
    try {
      let storage;
      if (this.testStorageManager) {
        const Ctor = this.testStorageManager as unknown as new () => { addEntry(e: unknown): Promise<void> };
        storage = new Ctor();
      } else {
        // 🔹 P1 #4: Pre-resolved module access
        if (!this.contextStorageModule) {
          throw new Error('ContextStorageManager module not loaded');
        }
        const { ContextStorageManager } = this.contextStorageModule;
        storage = new ContextStorageManager();
      }
      await storage.addEntry(contextEntry);

      debugLog('[CHECKPOINT]', `Saved: ${entryId}`);
      return { saved: true, sessionId: entryId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[AutoTracker] [CHECKPOINT] Failed to save checkpoint: ${message}`);
      return { saved: false };
    }
  }

  async checkAndSaveTokenThreshold(
    currentTokens: number,
    maxTokens: number,
    messageCount?: number,
  ): Promise<{ triggered: boolean; saved: boolean; sessionId?: string }> {
    const thresholdTriggered = this.checkTokenThreshold(currentTokens, maxTokens);

    if (!thresholdTriggered) {
      return { triggered: false, saved: false };
    }

    // Threshold triggered — flush buffered actions and save session memory
    debugLog('[CHECKANDSAVE]', 'Threshold triggered — proceeding to checkpoint');
    
    // Flush any buffered actions as part of the checkpoint save
    const flushedCount = await this.flushActionsToMemory();
    if (flushedCount > 0) {
      debugLog('[CHECKANDSAVE]', `Flushed ${flushedCount} buffered action(s)`);
    }

    const msgCount = messageCount ?? 0;
    const saveResult = await this.autoSaveSessionMemory(currentTokens, maxTokens, msgCount);

    if (saveResult.saved) {
      debugLog('[CHECKANDSAVE]', 'Checkpoint saved successfully — transitioning to CONFIRMED');
      // FSM: THRESHOLD_REACHED → CONFIRMED (checkpoint completed)
      this.transitionTo(AutoTrackState.CONFIRMED, 'auto_checkpoint_saved');
      return { triggered: true, saved: true, sessionId: saveResult.sessionId };
    } else {
      console.error(`[AutoTracker] [CHECKANDSAVE] Checkpoint failed — transitioning to DECLINED`);
      // FSM: THRESHOLD_REACHED → DECLINED (save failed, treat as declined)
      this.transitionTo(AutoTrackState.DECLINED, 'auto_checkpoint_failed');
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
      debugLog('[BUFFER]', `Added ${actions.length} action(s), total=${this.actionBuffer.length}, state=${this.currentState}`);
      
      // 🔹 Safety cap: auto-flush if buffer grows too large (>50 entries)
      if (this.actionBuffer.length > MAX_BUFFER_SIZE && !this.isFlushing) {
        debugLog('[BUFFER]', `Exceeded safety limit (${MAX_BUFFER_SIZE}), flushing early...`);
        this.flushActionsToMemory().catch(err => console.error('[AutoTracker] [BUFFER] Early flush failed:', err)); // Catch to prevent unhandled rejection
      }
    }

    // Increment message counter for session summaries
    this.messageCount++;
    if (this.messageCount % this.config.autoSummaryInterval === 0) {
      debugLog('[COUNT]', `Session summary interval reached: ${this.messageCount} messages`);
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
    debugLog('[RESET]', 'Message counter reset');
    // Also reset FSM to IDLE on new session
    if (this.currentState !== AutoTrackState.IDLE) {
      this.transitionTo(AutoTrackState.IDLE, 'new_session');
    }
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

  /**
   * Get diagnostic summary for monitoring/debugging.
   */
  getDiagnosticSummary(): string {
    return [
      `[AutoTracker] Diagnostic:`,
      `  State: ${this.currentState}`,
      `  Buffer: ${this.actionBuffer.length} actions`,
      `  Messages: ${this.messageCount}`,
      `  Flushing: ${this.isFlushing}`,
      `  Pending Warning: ${this.pendingCheckpointWarning ? 'Yes' : 'No'}`,
      `  Transition History (last ${this.transitionHistory.length}): ${JSON.stringify(this.transitionHistory.slice(-5))}`
    ].join('\n');
  }
}

// ==================== SINGLETON INSTANCE ====================

export const autoTracker = new AutoTracker();
