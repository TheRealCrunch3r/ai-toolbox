/**
 * ContextGuard Module (Optimized for Speed & Precision)
 * Implements Summarization, Smart Reading, and Re-RAG tracking.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion */
// The above disables are required because the LM Studio SDK (@lmstudio/sdk v1.5.0) 
// internally uses `any` for model objects and their methods (respond(), result(), countTokens()).
// This propagates through our code when interacting with SDK types. Suppressing is safer than 
// casting every single interaction, matching established patterns in this codebase (e.g., refactorCodeTools.ts).

import { get_encoding } from '@dqbd/tiktoken';
import type { Tiktoken } from '@dqbd/tiktoken';
import { readFileSync, statSync } from 'fs';

// 🔹 P1 Optimization #2: JSON serialization cache to avoid redundant stringify() calls in loops
const jsonCache = new WeakMap<object, string>();
function cachedJSONStringify(obj: unknown): string {
  if (typeof obj === 'string') return obj;
  const cacheKey = typeof obj === 'object' && obj !== null ? obj : null;
  if (cacheKey) {
    let cached = jsonCache.get(cacheKey);
    if (!cached) {
      cached = JSON.stringify(obj);
      jsonCache.set(cacheKey, cached);
    }
    return cached;
  }
  return String(obj);
}

import type { LMStudioClient, LLMPredictionStats } from '@lmstudio/sdk';
import { TokenStatsManager } from './tokenStatsManager.js';

// Common English words to exclude from keyword extraction (false positives)
const STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', "aren't", 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', "couldn't", 'could', 'did', "didn't", 'do',
  'does', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'get', 'got', 'had', "hadn't", 'has', "hasn't", 'have', "haven't", 'having', 'he',
  'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', "isn't", 'it', "it's", 'its', 'itself', 'just', 'let', 'me', 'might',
  'more', 'most', "mustn't", 'my', 'myself', 'new', 'no', 'nor', 'not', 'now', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'out', 'over', 'own',
  'same', "shan't", 'she', "she's", 'should', "shouldn't", 'so', 'some', 'such',
  'than', 'that', "that'll", 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', "wasn't", 'we', 'were', "weren't", 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', "won't", 'would',
  "wouldn't", 'you', "you'd", "you'll", "you're", "you've", 'your', 'yours',
  'yourself', 'yourselves', 'able', 'also', 'back', 'come', 'could', 'day', 'even',
  'give', 'good', 'know', 'last', 'long', 'look', 'make', 'many', 'may', 'much',
  'need', 'next', 'part', 'put', 'say', 'see', 'show', 'take', 'time', 'use',
  'want', 'way', 'work', 'year', 'yes', 'yet', 'you',
  // Technical false positives
  'function', 'variable', 'context', 'guard', 'config', 'module', 'class', 'const',
  'let', 'var', 'async', 'await', 'return', 'throw', 'catch', 'try', 'finally',
  'import', 'export', 'default', 'from', 'type', 'interface', 'enum', 'implements',
  'extends', 'super', 'this', 'new', 'delete', 'typeof', 'instanceof', 'void',
]);

// 🔹 P1 Optimization #3: Conditional logging to reduce stderr I/O in production
const DEBUG_MODE = !!process.env.AI_TOOLBOX_DEBUG;

/**
 * Calibration factor — MUST stay 1 (no scaling).
 *
 * History: was once set to 65, derived from a single observation
 * ("Real Usage ~184k at 81% / Plugin Count ~2616 ≈ 70x"). That gap was NOT tokenizer drift:
 * the sidebar counts the FULL request (chat history + ALL serialized tool definitions
 * + chat template), while that measurement only counted a small message fragment.
 * Multiplying real token counts by 65 inflated every SDK/tiktoken-based estimate ~65×
 * (e.g., a normal conversation read as "412k tokens"), which triggered premature
 * compression, wrong AutoTracker warnings and misleading logs.
 */
const TOKEN_SCALING_FACTOR = 1;

function debugLog(...args: unknown[]): void {
  if (DEBUG_MODE) console.log('[ContextGuard]', ...args);
}

export interface ContextGuardConfig {
  tokenLimit: number;
  smartReading: boolean;
  summaryModel: string;
  terminalFilterEnabled: boolean;
  terminalFilterLength: number;
}

/** Message type for context guard operations */
type ContextMessage = {
  role?: string;
  content?: unknown;
  [key: string]: unknown;
};

/** Minimal interface for LM Studio model objects with optional SDK methods */
interface LLMModelWithOptionalMethods {
  getContextLength?(): Promise<number>;
  config?: Record<string, unknown>;
}

export class ContextGuard {
  private encoder: Tiktoken | null = null;
  private config: ContextGuardConfig;
  private lmClient: LMStudioClient | null = null;
  private cachedTokenCount: number | null = null;
  private _lastMessageHash: string | null = null;  // FIX #1: Hash-based cache invalidation
  private trackedFiles: Map<string, { compressed: boolean; truncated: boolean; originalSize: number }> = new Map();

  // 🔹 P2 Optimization #4: Cache model reference to avoid repeated IPC calls
  private cachedModelRef: any = null;
  private cachedModelId: string | null = null;

  // 🔹 Optional callback invoked when compression occurs (for coordinating with AutoTracker)
  onCompression?: () => void;

  constructor(config: ContextGuardConfig, lmClient: LMStudioClient | null = null) {
    this.config = config;
    this.lmClient = lmClient;
  }

  /** 🔹 P2 #4: Get or create a cached model reference */
  private async getCachedModel(modelId: string): Promise<any> {
    if (this.cachedModelId === modelId && this.cachedModelRef) return this.cachedModelRef;
    const model = await this.lmClient!.llm.model(modelId);
    this.cachedModelRef = model;
    this.cachedModelId = modelId;
    return model;
  }

  /**
   * Counts tokens efficiently with caching.
   * Uses History Text Length × 0.25 + 10% buffer → SDK native counting → Tiktoken estimation.
   * 
   * 🔥 PRIORITY ORDER:
   * 1. History Text Length × 0.25 × 1.10 (effective ~0.264) — Matches LM Studio sidebar exactly (+10% safety buffer)
   * 2. SDK PredictionResult.stats — From model.respond().result().stats
   * 3. SDK native countTokens() — Model-specific tokenization
   * 4. Tiktoken estimation — Fallback when all above unavailable
   */
  async countTokens(
    messages: ContextMessage[], 
    imageCount: number = 0, 
    modelId?: string, 
    systemPrompt?: string,
    historyTextLength?: number // ✅ New parameter: pre-calculated char count from native API
  ): Promise<number> {
    // 🔹 P1 #3: Conditional logging
    debugLog('[COUNT]', `Processing ${messages.length} messages.`);

    // ✅ PRIMARY METHOD: If historyTextLength is provided (from native API), use ×0.25 + 10% buffer ratio
    // This matches LM Studio's sidebar exactly and avoids SDK overestimation (~124k vs ~80k)
    if (historyTextLength != null && historyTextLength > 0) {
      const primaryTokenCount = Math.ceil(historyTextLength * 0.25 * 1.10); // base × +10% buffer
      
      // Add image tokens if applicable (SDK doesn't account for multi-modal images automatically)
      let totalTokens = primaryTokenCount;
      if (imageCount > 0) {
        totalTokens += imageCount * 500; // Conservative estimate per LM Studio convention
      }
      
      this.cachedTokenCount = totalTokens;
      this._lastMessageHash = this.computeMessageHash(messages);
      console.log(`[ContextGuard] ✅ Primary count: ${historyTextLength.toLocaleString('en-US')} chars → ${primaryTokenCount.toLocaleString('en-US')} tokens (×0.25 + 10% buffer)`);
      return totalTokens;
    }

    // Count System Prompt tokens if provided (reserved for future use)
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const _accumulatedTokens = systemPrompt ? await this._countStringTokens(systemPrompt, modelId) : 0;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    
    // 🔥 FALLBACK: Use SDK-native countTokens() on the FULL message array.
    // This matches LM Studio's sidebar exactly because it counts the entire context window usage,
    // not just the delta of the last prediction.
    if (this.lmClient && modelId) {
      try {
        debugLog('[COUNT]', `Using SDK-native countTokens for model: ${modelId}`);
        const model = await this.getCachedModel(modelId);
        
        // Defensive check: ensure model object is valid before calling countTokens
        if (!model || typeof model.countTokens !== 'function') {
          debugLog('[COUNT]', 'Model or countTokens not available, falling back to manual encoding');
          throw new Error('Model or countTokens method not available');
        }

        // ✅ FIX #3: Serialize ALL message fields (including tool_calls, files) into the tokenization string.
        // LM Studio's sidebar counts tokens for the FULL prompt including tool definitions and file attachments.
        // We must include these in our count to match what the model actually consumes.
        const promptString = messages.map(m => {
          const role = m.role || 'user';
          let contentStr: string;

          // Extract actual text content from various message formats (SDK v1.x compatibility)
          if (typeof m.content === 'string') {
            contentStr = m.content;
          } else if (Array.isArray(m.content)) {
            // Handle array of content blocks (e.g., [{"type": "text", "text": "..."}])
            contentStr = (m.content as Array<Record<string, unknown>>).map(block => {
              const textVal = typeof block.text === 'string' ? block.text : '';
              return textVal;
            }).join('\n');
          } else if (typeof m.content === 'object' && m.content !== null) {
            // Handle ChatMessage objects or other structured content
            const typedContent = m.content as Record<string, unknown>;
            // Try .getText() method first (common in LM Studio SDK messages)
            const getTextFn = typedContent.getText;
            if (typeof getTextFn === 'function') {
              try {
                contentStr = ((getTextFn as () => string)()) || '';
              } catch {
                contentStr = cachedJSONStringify(m.content);
              }
            } else if (typeof typedContent.text === 'string') {
              contentStr = typedContent.text;
            } else if (typedContent.text != null && typeof typedContent.text !== 'object') {
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              contentStr = String(typedContent.text);
            } else {
              contentStr = cachedJSONStringify(m.content);
            }
          } else {
            contentStr = '';
          }

          // Extract and serialize additional fields that contribute to token count
          const typedMsg = m as Record<string, unknown>;
          let extras: string[] = [];

          // ⚠️ Tool calls are DELIBERATELY NOT serialized into the SDK countTokens() prompt.
          // @lmstudio/sdk (v1.8.x) LLM.countTokens() throws ToolCallRequestError when the input
          // contains tool-call structures ("Cannot count tokens for messages that contain tool
          // calls"). The existing try/catch below falls back to tiktoken on that error, but it is
          // better not to trigger it in the first place. Cost of omitted tool-call text is covered:
          // the preprocessor's primary heuristic (historyTextLength × 0.25 × 1.10) already includes
          // full getToolCallRequests()/getToolCallResults() payloads via the native history API, and
          // this fallback only runs when that primary path was unavailable for this turn.

          // Files / attachments
          const files = typedMsg.files || typedMsg.images;
          if (files && Array.isArray(files)) {
            for (const f of files as Record<string, unknown>[]) {
              const name = typeof f.name === 'string' ? f.name : 'unknown';
              extras.push(`[FILE: ${name}]`);
            }
          }

          // Combine role prefix with content and all extra fields
          const fullBlock = `<|start|>${role}<|end|>\n${contentStr}${extras.join('\n')}`;
          return fullBlock;
        }).join('\n\n');

        let rawResult: unknown = await model.countTokens(promptString);
        
        // Defensive handling for SDK response structure variations
        // The SDK might return { data: number } or similar wrapper object
        if (typeof rawResult === 'object' && rawResult !== null) {
          const objResult = rawResult as Record<string, unknown>;
          
          // Check if result has a .data property (common in newer SDK versions)
          if ('data' in objResult && typeof objResult.data !== 'undefined') {
            rawResult = objResult.data;
          } else if ('value' in objResult && typeof objResult.value !== 'undefined') {
            // Some SDKs use .value instead
            rawResult = objResult.value;
          } else {
            debugLog('[COUNT]', 'Unexpected SDK response structure, falling back to manual encoding');
            throw new Error('Unexpected response structure: no data/value property found');
          }
        }

        // Now process the result (which should be a number or array)
        let sdkCount: number;
        if (Array.isArray(rawResult)) {
          const numArray = rawResult as unknown[];
          sdkCount = numArray.reduce((sum: number, val: unknown) => sum + (typeof val === 'number' ? val : 0), 0);
        } else if (typeof rawResult === 'number') {
          sdkCount = rawResult;
        } else {
          debugLog('[COUNT]', `Unexpected result type: ${typeof rawResult}, falling back to manual encoding`);
          throw new Error(`Unexpected result type: ${typeof rawResult}`);
        }
        
        // Add image token estimation (SDK doesn't always account for multi-modal images automatically)
        let totalTokens = sdkCount;
        if (imageCount > 0) {
          const imageTokens = imageCount * 500; // Conservative estimate per LM Studio convention
          totalTokens += imageTokens;
          debugLog('[COUNT]', `Adding ${imageTokens} tokens for ${imageCount} images.`);
        }
        
        // Apply calibration factor to account for LM Studio sidebar overhead (tool defs, BOS/EOS, chat templates)
        const calibratedTotal = Math.round(totalTokens * TOKEN_SCALING_FACTOR);

        this.cachedTokenCount = calibratedTotal;
        this._lastMessageHash = this.computeMessageHash(messages);
        console.log(`[ContextGuard] ✅ SDK count: ${totalTokens.toLocaleString('en-US')} tokens (Calibrated: ${calibratedTotal.toLocaleString('en-US')})`);
        return calibratedTotal;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`[ContextGuard] SDK token counting failed for "${modelId}", falling back to manual encoding. Reason: ${errorMsg}` +
          ` (known causes: model not loaded / countTokens unavailable, or ToolCallRequestError when the prompt contains tool-call structures)`);
        // Fall through to manual tiktoken below
      }
    }

    // Fallback: Manual Tiktoken encoding (preserves backward compatibility)
    if (!this.encoder) {
      this.encoder = get_encoding('cl100k_base');
    }

    let count = 0;
    for (const msg of messages) {
      const role = msg.role || 'user';
      
      // Try to get content string, fallback to getText() if content is empty
      let contentStr: string = '';
      if (typeof msg.content === 'string') {
        contentStr = msg.content;
      } else if (msg.content != null && typeof msg.content !== 'string') {
        contentStr = JSON.stringify(msg.content);
      } else {
        // Fallback for ChatMessage objects with empty content
        const typedMsg = msg as Record<string, unknown>;
        const getTextFn = typedMsg.getText;
        if (typeof getTextFn === 'function') {
          try {
            contentStr = ((getTextFn as unknown as () => string)()) || '';
          } catch (e) {
            debugLog('[COUNT]', `getText() failed: ${(e as Error).message}`);
            contentStr = '';
          }
        }
      }
      
      // 🔹 P1 #3: Conditional logging for debugging message integrity
      debugLog('[COUNT]', `Message content length: ${contentStr.length} chars (role: ${role})`);
      
      // Account for message structure: role prefix + separator + content
      // This matches how LLMs actually consume tokens in chat completion API
      const structuredText = `<|start|>assistant<|name|>${role}<|end|>\n${contentStr}`;
      count += this.encoder.encode(structuredText).length;
    }
    
    // Add estimated tokens for images (LM Studio uses ~500-1000 tokens per image)
    if (imageCount > 0) {
      const imageTokens = imageCount * 500; // Conservative estimate
      count += imageTokens;
      debugLog('[COUNT]', `Adding ${imageTokens} tokens for ${imageCount} images.`);
    }
    
    // Add a small overhead for system prompt and BOS token (typically ~4-8 tokens)
    count += 8; 
    
    // Apply calibration factor to match LM Studio sidebar
    const calibratedCount = Math.round(count * TOKEN_SCALING_FACTOR);

    this.cachedTokenCount = calibratedCount;
    this._lastMessageHash = this.computeMessageHash(messages);  // FIX #1: Store hash
    
    debugLog('[COUNT]', `Tiktoken count: ${count.toLocaleString('en-US')} tokens (Calibrated: ${calibratedCount.toLocaleString('en-US')})`);
    return calibratedCount;
  }

  /**
   * Tracks whether compression was performed in the last operation.
   */
  private _lastCompressionInfo: {
    compressed: boolean;
    originalTokens?: number;
    compressedTokens?: number;
    messagesCompressed?: number;
    timestamp?: Date;
  } | null = null;

  /**
   * Gets information about the last compression operation.
   */
  getLastCompressionInfo(): typeof this._lastCompressionInfo {
    return this._lastCompressionInfo;
  }

  /**
   * Compresses history by sending oldest messages to a local model.
   */
  async compressHistory(messages: ContextMessage[]): Promise<ContextMessage[]> {
    // 🔹 FIX #2: Pass summaryModel to countTokens so SDK-native counting is used during threshold check
    const currentTokens = await this.countTokens(messages, 0, this.config.summaryModel);
    const threshold = this.config.tokenLimit * 0.9;

    if (currentTokens < threshold) {
      debugLog('[COMPRESS]', `Token count (${currentTokens}) below threshold (${threshold}). No compression needed.`);
      this._lastCompressionInfo = { compressed: false };
      return messages;
    }

    const originalTokenCount = currentTokens;

    // Reset token counter and notify user as requested when context limit is exceeded
    debugLog('[COMPRESS]', `Compressing history: ${messages.length} messages, ${currentTokens} tokens (threshold: ${threshold})`);
    
    // Notify user in chat via system prompt instead of stderr logging
    const thresholdWarning = `⚠️ Context window threshold reached (${originalTokenCount.toLocaleString('en-US')} tokens). Token counter reset. Please start a completely new session.`;
    console.log(`[ContextGuard] ${thresholdWarning}`);

    const keepLast = 10;
    const toCompress = messages.slice(0, -keepLast);
    
    if (toCompress.length === 0) {
      debugLog('[COMPRESS]', `No messages to compress (only ${messages.length} total, keeping last ${keepLast})`);
      return messages;
    }

    // Inject warning into chat history as a persistent system message (visible to LLM)
    const chatWarningMessage = {
      role: 'system' as const,
      content: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
               `⚠️ **CONTEXT WINDOW THRESHOLD REACHED** ⚠️\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
               `${thresholdWarning}\n\n` +
               `### ACTION TAKEN:\n` +
               `- Oldest ${toCompress.length} message(s) have been compressed into a summary below.\n` +
               `- Token counter has been reset to zero.\n` +
               `- Please start a completely new session for optimal performance.\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
               `### CONTEXT SUMMARY (compressed from ${toCompress.length} messages)\n`
    };

    // Use local model for summarization
    if (this.lmClient && this.config.summaryModel) {
      try {
        debugLog('[COMPRESS]', `Loading model: ${this.config.summaryModel}`);
        const model = await this.getCachedModel(this.config.summaryModel);
        
        // Build summary prompt with conversation history
        const historyText = toCompress.map(m => {
          const role = (m.role || 'user').toUpperCase();
          const contentStr: string = typeof m.content === 'string'
            ? m.content
            : m.content != null && typeof m.content !== 'string'
              ? JSON.stringify(m.content)
              : '';
          return `[${role}] ${contentStr}`;
        }).join('\n\n');
        
        const summaryPrompt = `You are an intelligent context compressor. Summarize the following conversation history into a concise technical summary.

INSTRUCTIONS:
1. Preserve ALL file paths, function names, class names, and variable names exactly as written
2. Keep key logic descriptions and architectural decisions
3. Discard verbose code blocks — describe them instead
4. Remove terminal noise, progress indicators, and repetitive output
5. Maintain chronological flow of the conversation
6. Be precise but brief (max 500 words)

CONVERSATION HISTORY TO SUMMARIZE:
${historyText}

SUMMARY:`;
        
        debugLog('[COMPRESS]', `Sending summarization request for ${toCompress.length} messages...`);
        
        // Use respond() for chat-based interaction (more reliable than complete())
        const response = model.respond(
          [{ role: 'user', content: summaryPrompt }],
          { maxTokens: 1024, temperature: 0.1 }
        );
        
        // Wait for the result
        const result = await response.result();
        const summary = result.content || `[ContextGuard Summary: ${toCompress.length} older messages compressed.]`;
        
        debugLog('[COMPRESS]', `Summarization complete. Generated ${summary.length} chars.`);
        
        // Count tokens after compression using SDK-native method
        const compressedPreview = [
          { role: 'system', content: `### CONTEXT SUMMARY (compressed from ${toCompress.length} messages)\n${summary}` },
          ...messages.slice(-keepLast)
        ];
        const compressedTokenCount = await this.countTokens(compressedPreview, 0, this.config.summaryModel);
        
        // Track compression info
        this._lastCompressionInfo = {
          compressed: true,
          originalTokens: originalTokenCount,
          compressedTokens: compressedTokenCount,
          messagesCompressed: toCompress.length,
          timestamp: new Date()
        };

        // 🔹 Notify listeners (e.g., AutoTracker) that compression occurred
        if (this.onCompression) {
          this.onCompression();
        }
        
        const tokensSaved = originalTokenCount - compressedTokenCount;
        const percentageSaved = Math.round((tokensSaved / originalTokenCount) * 100);
        
        // Visual indicator message
        const visualIndicator = {
          role: 'system' as const,
          content: `🧠 **ContextGuard Compression Active**\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                   `• Compressed ${toCompress.length} message(s) into summary\n` +
                   `• Tokens before: ~${Math.round(originalTokenCount / 1000)}k → after: ~${Math.round(compressedTokenCount / 1000)}k\n` +
                   `• **Saved ~${tokensSaved.toLocaleString('en-US')} tokens (~${percentageSaved}%)**\n` +
                   `• Timestamp: ${new Date().toLocaleTimeString('en-US')}\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `### CONTEXT SUMMARY (from ${toCompress.length} messages)\n${summary}`
        };
        
        return [
          chatWarningMessage,
          visualIndicator,
          ...messages.slice(-keepLast)
        ];
      } catch (error) {
        console.error(`[ContextGuard] Summarization failed: ${(error as Error).message}`);
        console.error(`[ContextGuard] Stack: ${(error as Error).stack}`);
      }
    } else {
      debugLog('[COMPRESS]', 'No LM client or summary model configured. Using fallback.');
    }

    // Fallback if no model, error, or summarization failed
    const fallbackSummary = `[ContextGuard Summary: ${toCompress.length} older messages compressed to save context. Original content unavailable due to compression failure or missing model.]`;
    debugLog('[COMPRESS]', `Using fallback summary for ${toCompress.length} messages`);
    
    // Track compression info (estimate tokens saved)
    const estimatedTokensSaved = Math.round(originalTokenCount * 0.7); // Estimate ~70% savings
    this._lastCompressionInfo = {
      compressed: true,
      originalTokens: originalTokenCount,
      compressedTokens: originalTokenCount - estimatedTokensSaved,
      messagesCompressed: toCompress.length,
      timestamp: new Date()
    };

    // 🔹 Notify listeners (e.g., AutoTracker) that compression occurred
    if (this.onCompression) {
      this.onCompression();
    }
    
    // Visual indicator for fallback
    const fallbackIndicator = {
      role: 'system' as const,
      content: `🧠 **ContextGuard Compression Active (Fallback Mode)**\n\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
               `• Compressed ${toCompress.length} message(s)\n` +
               `• Estimated tokens saved: ~${estimatedTokensSaved.toLocaleString('en-US')}\n` +
               `• Note: Full summarization unavailable (model not configured or error occurred)\n` +
               `• Timestamp: ${new Date().toLocaleTimeString('en-US')}\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
               `### CONTEXT SUMMARY\n${fallbackSummary}`
    };
    
    return [
      chatWarningMessage,
      fallbackIndicator,
      ...messages.slice(-keepLast)
    ];
  }

  /**
   * Helper to count tokens for a specific string using SDK or fallback.
   */
  private async _countStringTokens(text: string, modelId?: string): Promise<number> {
    if (this.lmClient && modelId) {
      try {
        const model = await this.getCachedModel(modelId);
        if (model && typeof model.countTokens === 'function') {
           
          const rawResult = await model.countTokens(text);
          let count: number;
          if (typeof rawResult === 'object' && rawResult !== null) {
             
            const obj = rawResult as Record<string, unknown>;
             
            count = ('data' in obj ? Number(obj.data) : 'value' in obj ? Number(obj.value) : 0);
          } else if (Array.isArray(rawResult)) {
             
            const arr = rawResult as unknown[];
            count = arr.reduce((s: number, v) => s + (typeof v === 'number' ? v : 0), 0);
          } else {
             
            count = Number(rawResult) || 0;
          }
          return count;
        }
      } catch {}
    }
    
    // Fallback to tiktoken
    if (!this.encoder) this.encoder = get_encoding('cl100k_base');
    const structuredText = `<|start|>system<|end|>\n${text}`;
    return this.encoder.encode(structuredText).length + 8; // +8 for overhead/BOS
  }

  getThreshold(): number {
    return this.config.tokenLimit * 0.9;
  }

  /**
   * Resets the token cache when history changes.
   */
  resetTokenCache() {
    this.cachedTokenCount = null;
  }

  /**
   * Gets the current token budget information as a human-readable string.
   */
  getTokenBudgetInfo(): string {
    const current = this.cachedTokenCount ?? 0;
    const limit = this.config.tokenLimit;
    const percentage = Math.round((current / limit) * 100);
    
    return `[ContextGuard] Budget: ${Math.round(current / 1000)}k/${Math.round(limit / 1000)}k tokens (${percentage}% used)`;
  }

  /**
   * Gets the configured token limit.
   */
  getTokenLimit(): number {
    return this.config.tokenLimit;
  }

  /**
   * Receives prediction stats from LM Studio's inference engine.
   * This replaces estimation with actual token counts from PredictionResult.stats,
   * matching exactly what LM Studio's sidebar displays.
   * 
   * Call this after awaiting on model.respond() or model.complete().result()
   * to update the cached token count with authoritative SDK data.
   *
   * DORMANT WIRING (FIX #20, 23.08): no caller in src/ — this path is only fed by a registered
   * prediction-loop handler / model.respond() consumer. LM Studio Core REJECTS plugins that register
   * BOTH a tools provider and a predictionLoopHandler ("Tools provider cannot be used with a
   * predictionLoopHandler" — boot crash verified 21.08; SDK v1.5.0 was latest as of 22.08, no upgrade
   * path). ai_toolbox is a tools plugin, so this hook stays inactive by design until core changes.
   * The mid-loop gap it would have closed is now covered by TokenStatsManager A1 delta bookkeeping +
   * AutoTracker.guardMidLoopThreshold (see future_improvements/autoTracker_midloop_fix_plan.md).
   * 
   * @param stats - LLMPredictionStats from PredictionResult.stats
   */
  receivePredictionStats(stats: LLMPredictionStats): void {
    // Update the TokenStatsManager so other components can access it
    TokenStatsManager.updateFromPredictionResult(stats);
    
    // Also update our cached count if totalTokensCount is available
    if (stats.totalTokensCount != null && stats.totalTokensCount > 0) {
      this.cachedTokenCount = stats.totalTokensCount;
      console.log(`[ContextGuard] ✅ Updated token count from LM Studio SDK: ${stats.totalTokensCount.toLocaleString('en-US')} tokens`);
      
      // Log the full summary for debugging
      const summary = TokenStatsManager.getSummary();
      if (summary) {
        debugLog('[ContextGuard]', summary);
      }
    } else {
      console.warn(`[ContextGuard] ⚠️ Prediction stats received but totalTokensCount is invalid:`, stats);
    }
  }

  /**
   * Get the latest prediction summary from LM Studio's inference engine.
   * Returns null if no predictions have been made yet.
   */
  getPredictionStatsSummary(): string | null {
    return TokenStatsManager.getSummary();
  }

  /**
   * Updates the configuration dynamically.
   */
  updateConfig(newConfig: Partial<ContextGuardConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Sets or updates the LM Studio client reference for dynamic model queries.
   */
  setLMClient(client: LMStudioClient | null): void {
    this.lmClient = client;
  }

  /**
   * Dynamically fetches and applies the actual context window length from the active LM Studio model.
   */
  async setTokenLimitFromModel(modelId?: string): Promise<void> {
    if (!this.lmClient) return; // Cannot query without client
    
    try {
      let model;
      
      if (modelId && typeof modelId === 'string' && modelId.trim() !== '') {
        // User provided explicit model ID — load it directly
        console.log(`[ContextGuard] Loading specified model: ${modelId}`);
        model = await this.getCachedModel(modelId);
      } else {
        // No model ID provided — use SDK's official pattern: call .model() without arguments
        // This returns the currently loaded/active model (see LM Studio plugin examples)
        debugLog('[ContextGuard] No explicit model ID. Using SDK auto-detection...');
        
        try {
          // Call .model() without arguments to get the currently active model
          model = await this.lmClient.llm.model();
          
          if (model) {
            console.log(`[ContextGuard] ✅ Auto-detected active model via SDK`);
          } else {
            debugLog('[ContextGuard] No active model detected. Using default tokenLimit.');
          }
        } catch (err) {
          debugLog(`[ContextGuard] Failed to detect active model: ${(err as Error).message}. Using default tokenLimit.`);
        }
      }
      
      if (!model) {
        // If auto-detection fails, use the config's contextGuardTokenLimit instead of hardcoded fallback
        const configLimit = this.config.tokenLimit;
        console.log(`[ContextGuard] ⚠️ Auto-detection failed. Using configured tokenLimit: ${configLimit}.`);
        return; // Keep existing config.tokenLimit (which should come from plugin settings)
      }

      // ✅ Use SDK's native getContextLength() API (LM Studio TS v1.x+)
      const typedModel = model as LLMModelWithOptionalMethods;

      if (typeof typedModel.getContextLength === 'function') {
        const actualContextLength = await typedModel.getContextLength();
        if (actualContextLength > 0) {
          this.config.tokenLimit = actualContextLength;
          console.log(`[ContextGuard] ✅ Updated tokenLimit from SDK: ${actualContextLength}`);
        } else {
          const configLimit = this.config.tokenLimit;
          console.warn(`[ContextGuard] getContextLength() returned ${actualContextLength}. Using configured limit: ${configLimit}`);
        }
      } else if (typedModel.config?.contextSize != null) {
        // Fallback: read from model config if available
        const fallbackLimit = typedModel.config.contextSize as number;
        this.config.tokenLimit = fallbackLimit;
        console.log(`[ContextGuard] ✅ Fetched contextSize from model config: ${fallbackLimit}`);
      }
    } catch (err) {
      const configLimit = this.config.tokenLimit;
      console.error(`[ContextGuard] Failed to fetch actual context length. Using configured limit: ${configLimit} (${(err as Error).message})`);
    }
  }

  /**
   * Gets the current cached token count (for external monitoring).
   */
  getCurrentTokenCount(): number {
    return this.cachedTokenCount ?? 0;
  }

  /**
   * Smartly reads a file using Keyword-Grep for precision.
   * FIX #3: Added max_length parameter to respect caller's truncation limits.
   */
  smartRead(filePath: string, userPrompt?: string, maxLength?: number): string {
    if (!this.config.smartReading) {
      const content = readFileSync(filePath, 'utf-8');
      return maxLength ? content.substring(0, maxLength) : content;
    }

    try {
      const stats = statSync(filePath);
      this.trackedFiles.set(filePath, { compressed: false, truncated: true, originalSize: stats.size });

      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // FIX #3: Use caller's maxLength if provided, otherwise use defaults
      const effectiveMaxLength = maxLength || 5000;
      const maxLines = 2000;
      const maxBytes = 100 * 1024;

      // Return full content only if file is small AND within caller's limit
      if (stats.size < maxBytes && lines.length < maxLines && content.length <= effectiveMaxLength) {
        return content;
      }

      const keywords = this.extractKeywords(userPrompt || '');
      let relevantLines: number[] = [];

      if (keywords.length > 0) {
        lines.forEach((line, index) => {
          if (keywords.some(kw => line.toLowerCase().includes(kw.toLowerCase()))) {
            relevantLines.push(index);
          }
        });

        if (relevantLines.length > 0) {
          const result = this.formatRelevantLines(lines, relevantLines);
          // FIX #3: Truncate to maxLength even for smart-read results
          return result.length > effectiveMaxLength 
            ? result.substring(0, effectiveMaxLength) + `\n// [ContextGuard] Output truncated to ${effectiveMaxLength} chars`
            : result;
        }
      }

      // Fallback: header/footer view
      const header = lines.slice(0, 50).join('\n');
      const footer = lines.slice(-50).join('\n');
      
      let fallbackResult = `// [ContextGuard] File truncated due to size (${stats.size} bytes)\n// --- HEADER (First 50 lines) ---\n${header}\n// --- FOOTER (Last 50 lines) ---\n${footer}\n// [ContextGuard] Content truncated for context efficiency.`;
      
      // FIX #3: Respect maxLength on fallback too
      if (fallbackResult.length > effectiveMaxLength) {
        fallbackResult = fallbackResult.substring(0, effectiveMaxLength) + `\n// [ContextGuard] Output truncated to ${effectiveMaxLength} chars`;
      }
      return fallbackResult;
    } catch (error) {
      return `Error reading file: ${(error as Error).message}`;
    }
  }

  /**
   * Filters terminal output to prevent context bloat.
   */
  filterTerminalOutput(output: string): string {
    if (!this.config.terminalFilterEnabled) return output;
    
    const threshold = this.config.terminalFilterLength || 2000;
    if (output.length <= threshold) return output;

    const lines = output.split('\n');
    const head = lines.slice(0, 5).join('\n');
    const tail = lines.slice(-5).join('\n');

    return `${head}\n... [Output truncated: ${lines.length - 10} lines hidden] ...\n${tail}`;
  }

  /**
   * Forces a fresh read of a tracked file (Re-RAG Trigger).
   */
  reloadContextForFile(filePath: string): string {
    if (this.trackedFiles.has(filePath)) {
      this.trackedFiles.delete(filePath);
      return `// [ContextGuard] Context reloaded for ${filePath}. Previous compression/truncation cleared.`;
    }
    return `// [ContextGuard] No tracked context for ${filePath}. Reading normally.`;
  }

  /**
   * Compresses a specific file's tracked context (marks it as compressed).
   */
  markFileAsCompressed(filePath: string): void {
    if (this.trackedFiles.has(filePath)) {
      const info = this.trackedFiles.get(filePath);
      if (info) {
        this.trackedFiles.set(filePath, { ...info, compressed: true });
      }
    } else {
      // If not tracked yet, add it as compressed
      try {
        const stats = statSync(filePath);
        this.trackedFiles.set(filePath, { compressed: true, truncated: false, originalSize: stats.size });
      } catch {
        console.error(`[ContextGuard] Cannot mark file as compressed - file not found: ${filePath}`);
      }
    }
  }

  /**
   * Computes a simple hash of messages for cache invalidation.
   * FIX #1: Ensures cache is invalidated when every message changes, not just the last one.
   */
  private computeMessageHash(messages: ContextMessage[]): string {
    return messages.map(m => {
      const contentStr: string = typeof m.content === 'string'
        ? m.content
        : m.content != null && typeof m.content !== 'string'
          ? JSON.stringify(m.content)
          : '';
      return `${m.role}:${contentStr}`;
    }).join('||');
  }

  /**
   * Extracts meaningful keywords from a prompt for smart file reading.
   */
  private extractKeywords(prompt: string): string[] {
    const matches = prompt.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g);
    if (!matches) return [];
    
    // Filter out stop words and keep only meaningful identifiers (length > 4)
    return [...new Set(matches)]
      .filter(w => w.length > 4 && !STOP_WORDS.has(w.toLowerCase()));
  }

  /**
   * Formats relevant lines with context margins for smart reading.
   */
  private formatRelevantLines(lines: string[], indices: number[]): string {
    let result = '';
    const margin = 5;
    indices.forEach(index => {
      const start = Math.max(0, index - margin);
      const end = Math.min(lines.length, index + margin + 1);
      result += `// ... [Match at line ${index + 1}] ... \n`;
      result += lines.slice(start, end).join('\n') + '\n';
    });
    return result;
  }
}

/**
 * Hub-Exclusion Clustering Integration for ContextGuard
 * 
 * Provides architectural transparency insights during context analysis:
 * - Identifies which modules are hubs vs regular members
 * - Tracks cluster membership for tracked files
 * - Enables cluster-aware compression strategies
 */

import type { HubExclusionResult } from './utils/hubExclusionClustering.js';
import { analyzeAiToolboxDependencies } from './utils/hubExclusionClustering.js';

/**
 * Cache for clustering analysis results (avoid recomputation).
 */
let cachedClusteringResult: HubExclusionResult | null = null;
let clusteringCacheTimestamp = 0;

/**
 * Get or compute the Hub-Exclusion Clustering result.
 * Cached for performance — invalidates after 5 minutes.
 */
function getClusteringResult(): HubExclusionResult {
  const now = Date.now();
  if (cachedClusteringResult && (now - clusteringCacheTimestamp) < 5 * 60 * 1000) {
    return cachedClusteringResult;
  }

  cachedClusteringResult = analyzeAiToolboxDependencies();
  clusteringCacheTimestamp = now;
  
  debugLog('[CLUSTERING]', `Computed Hub-Exclusion Clustering: ${cachedClusteringResult.nodes.length} modules, ${cachedClusteringResult.clusters.length} clusters`);
  return cachedClusteringResult;
}

/**
 * Get the cluster membership for a given file/module path.
 */
export function getFileClusterInfo(filePath: string): {
  isHub: boolean;
  clusterId?: number;
  moduleDegree: number;
  clusterSize?: number;
  clusterDensity?: number;
} | null {
  const result = getClusteringResult();
  
  // Normalize the file path to match node IDs in the clustering result
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^.*\/src\//, '');
  
  const matchingNode = result.nodes.find(n => n.id.includes(normalizedPath) || normalizedPath.includes(n.id));
  if (!matchingNode) return null;

  const isHub = result.hubs.includes(matchingNode.id);
  let clusterId: number | undefined;
  let clusterSize: number | undefined;
  let clusterDensity: number | undefined;

  // Find the cluster this node belongs to (or a hub's assigned cluster)
  for (const cluster of result.clusters) {
    if (cluster.members.includes(matchingNode.id)) {
      clusterId = cluster.clusterId;
      clusterSize = cluster.size;
      clusterDensity = cluster.density;
      break;
    }
  }

  // If it's a hub, check its assignment
  if (!clusterId && result.hubAssignments[matchingNode.id] != null) {
    const assignedClusterId = result.hubAssignments[matchingNode.id];
    if (assignedClusterId >= 0) {
      clusterId = assignedClusterId;
      const assignedCluster = result.clusters.find(c => c.clusterId === assignedClusterId);
      clusterSize = assignedCluster?.size;
      clusterDensity = assignedCluster?.density;
    }
  }

  return {
    isHub,
    clusterId,
    moduleDegree: matchingNode.degree,
    clusterSize,
    clusterDensity
  };
}

/**
 * Generate an architectural insight summary for the current context.
 * 
 * Used during compression to provide users with insights about which
 * modules are being affected and their roles in the architecture.
 */
export function getArchitecturalInsights(): string {
  const result = getClusteringResult();

  let insights = '\n🏗️ Architectural Context Summary\n';
  insights += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  // Module distribution
  insights += `Modules analyzed: ${result.nodes.length}\n`;
  insights += `Clusters identified: ${result.clusters.length}\n`;
  insights += `Hub modules: ${result.hubs.length}\n\n`;

  // Hub roles
  if (result.hubs.length > 0) {
    insights += '🔶 Architectural Hubs:\n';
    for (const hubId of result.hubs.slice(0, 5)) {
      const node = result.nodes.find(n => n.id === hubId);
      if (node) {
        insights += `  • ${node.label || hubId} — connects ${node.degree} modules\n`;
      }
    }
    if (result.hubs.length > 5) {
      insights += `  ... and ${result.hubs.length - 5} more hubs\n`;
    }
    insights += '\n';
  }

  // Cluster summary
  insights += '📦 Module Clusters:\n';
  for (const cluster of result.clusters.slice(0, 3)) {
    const densityStr = cluster.density != null ? ` | density: ${cluster.density.toFixed(2)}` : '';
    insights += `  Cluster ${cluster.clusterId}: ${cluster.size} modules${densityStr}\n`;
    
    // Show representative members
    for (const member of cluster.members.slice(0, 3)) {
      const node = result.nodes.find(n => n.id === member);
      if (node) {
        insights += `    • ${node.label || member}\n`;
      }
    }
  }

  // Modularity quality
  if (result.modularity != null) {
    const quality = result.modularity > 0.3 ? 'Strong' : result.modularity > 0.2 ? 'Moderate' : 'Weak';
    insights += `\n📊 Clustering quality: ${quality} (${result.modularity.toFixed(3)})\n`;
  }

  return insights;
}

/**
 * Check if a file belongs to a hub module — useful for compression priority.
 * Hub modules should be preserved during context compression as they are
 * architecturally critical.
 */
export function isHubModule(filePath: string): boolean {
  const info = getFileClusterInfo(filePath);
  return info?.isHub ?? false;
}

/**
 * Get the cluster ID for a file — useful for cluster-aware compression strategies.
 * Files in the same cluster can be compressed together to reduce redundancy.
 */
export function getModuleClusterId(filePath: string): number | null {
  const info = getFileClusterInfo(filePath);
  return info?.clusterId ?? null;
}

/**
 * Compress files from the same cluster together (optimization).
 * 
 * When multiple tracked files belong to the same cluster, they can be
 * compressed in a single operation rather than individually.
 */
export function groupTrackedFilesByCluster(trackedPaths: string[]): Map<number, string[]> {
  const clusters = new Map<number, string[]>();

  for (const filePath of trackedPaths) {
    const clusterId = getModuleClusterId(filePath);
    if (clusterId != null && clusterId >= 0) {
      if (!clusters.has(clusterId)) {
        clusters.set(clusterId, []);
      }
      clusters.get(clusterId)!.push(filePath);
    } else {
      // Files not in any cluster or hubs go to a special group
      const unclustered = clusters.get(-1);
      if (!unclustered) {
        clusters.set(-1, [filePath]);
      } else {
        unclustered.push(filePath);
      }
    }
  }

  return clusters;
}
