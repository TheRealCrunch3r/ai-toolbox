/**
 * ContextGuard Module (Optimized for Speed & Precision)
 * Implements Summarization, Smart Reading, and Re-RAG tracking.
 */

import { get_encoding } from '@dqbd/tiktoken';
import type { Tiktoken } from '@dqbd/tiktoken';
import { readFileSync, statSync } from 'fs';
import type { LMStudioClient } from '@lmstudio/sdk';

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

export class ContextGuard {
  private encoder: Tiktoken | null = null;
  private config: ContextGuardConfig;
  private lmClient: LMStudioClient | null = null;
  private cachedTokenCount: number | null = null;
  private _lastMessageHash: string | null = null;  // FIX #1: Hash-based cache invalidation
  private trackedFiles: Map<string, { compressed: boolean; truncated: boolean; originalSize: number }> = new Map();

  constructor(config: ContextGuardConfig, lmClient: LMStudioClient | null = null) {
    this.config = config;
    this.lmClient = lmClient;
  }

  /**
   * Counts tokens efficiently with caching.
   * Accounts for message structure (role prefixes, separators) to match actual LLM token consumption.
   */
  async countTokens(messages: ContextMessage[]): Promise<number> {
    // FIX #1: Hash-based cache invalidation - validates ALL messages, not just last one
    if (this.cachedTokenCount !== null) {
      const currentHash = this.computeMessageHash(messages);
      
      if (this._lastMessageHash === currentHash) {
        return this.cachedTokenCount;
      }
    }

    if (!this.encoder) {
      this.encoder = get_encoding('cl100k_base');
    }

    let count = 0;
    for (const msg of messages) {
      const role = msg.role || 'user';
      const content: string = typeof msg.content === 'string' 
        ? msg.content 
        : msg.content != null && typeof msg.content !== 'string'
          ? JSON.stringify(msg.content)
          : '';
      
      // Account for message structure: role prefix + separator + content
      // This matches how LLMs actually consume tokens in chat completion API
      const structuredText = `<|start|>assistant<|name|>${role}<|end|>\n${content}`;
      count += this.encoder.encode(structuredText).length;
    }
    
    // Add a small overhead for system prompt and BOS token (typically ~4-8 tokens)
    count += 8; 
    
    this.cachedTokenCount = count;
    this._lastMessageHash = this.computeMessageHash(messages);  // FIX #1: Store hash
    
    return count;
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
    const currentTokens = await this.countTokens(messages);
    const threshold = this.config.tokenLimit * 0.9;

    if (currentTokens < threshold) {
      console.warn(`[ContextGuard] Token count (${currentTokens}) below threshold (${threshold}). No compression needed.`);
      this._lastCompressionInfo = { compressed: false };
      return messages;
    }

    const originalTokenCount = currentTokens;

    console.warn(`[ContextGuard] Compressing history: ${messages.length} messages, ${currentTokens} tokens (threshold: ${threshold})`);

    const keepLast = 10;
    const toCompress = messages.slice(0, -keepLast);
    
    if (toCompress.length === 0) {
      console.warn(`[ContextGuard] No messages to compress (only ${messages.length} total, keeping last ${keepLast})`);
      return messages;
    }

    // Use local model for summarization
    if (this.lmClient && this.config.summaryModel) {
      try {
        console.warn(`[ContextGuard] Loading model: ${this.config.summaryModel}`);
        const model = await this.lmClient.llm.model(this.config.summaryModel);
        
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
        
        console.warn(`[ContextGuard] Sending summarization request for ${toCompress.length} messages...`);
        
        // Use respond() for chat-based interaction (more reliable than complete())
        const response = model.respond(
          [{ role: 'user', content: summaryPrompt }],
          { maxTokens: 1024, temperature: 0.1 }
        );
        
        // Wait for the result
        const result = await response.result();
        const summary = result.content || `[ContextGuard Summary: ${toCompress.length} older messages compressed.]`;
        
        console.warn(`[ContextGuard] Summarization complete. Generated ${summary.length} chars.`);
        
        // Count tokens after compression
        const compressedPreview = [
          { role: 'system', content: `### CONTEXT SUMMARY (compressed from ${toCompress.length} messages)\n${summary}` },
          ...messages.slice(-keepLast)
        ];
        const compressedTokenCount = await this.countTokens(compressedPreview);
        
        // Track compression info
        this._lastCompressionInfo = {
          compressed: true,
          originalTokens: originalTokenCount,
          compressedTokens: compressedTokenCount,
          messagesCompressed: toCompress.length,
          timestamp: new Date()
        };
        
        const tokensSaved = originalTokenCount - compressedTokenCount;
        const percentageSaved = Math.round((tokensSaved / originalTokenCount) * 100);
        
        // Visual indicator message
        const visualIndicator = {
          role: 'system' as const,
          content: `🧠 **ContextGuard Compression Active**\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                   `• Compressed ${toCompress.length} message(s) into summary\n` +
                   `• Tokens before: ~${Math.round(originalTokenCount / 1000)}k → after: ~${Math.round(compressedTokenCount / 1000)}k\n` +
                   `• **Saved ~${tokensSaved.toLocaleString()} tokens (~${percentageSaved}%)**\n` +
                   `• Timestamp: ${new Date().toLocaleTimeString()}\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `### CONTEXT SUMMARY (from ${toCompress.length} messages)\n${summary}`
        };
        
        return [
          visualIndicator,
          ...messages.slice(-keepLast)
        ];
      } catch (error) {
        console.error(`[ContextGuard] Summarization failed: ${(error as Error).message}`);
        console.error(`[ContextGuard] Stack: ${(error as Error).stack}`);
      }
    } else {
      console.warn(`[ContextGuard] No LM client or summary model configured. Using fallback.`);
    }

    // Fallback if no model, error, or summarization failed
    const fallbackSummary = `[ContextGuard Summary: ${toCompress.length} older messages compressed to save context. Original content unavailable due to compression failure or missing model.]`;
    console.warn(`[ContextGuard] Using fallback summary for ${toCompress.length} messages`);
    
    // Track compression info (estimate tokens saved)
    const estimatedTokensSaved = Math.round(originalTokenCount * 0.7); // Estimate ~70% savings
    this._lastCompressionInfo = {
      compressed: true,
      originalTokens: originalTokenCount,
      compressedTokens: originalTokenCount - estimatedTokensSaved,
      messagesCompressed: toCompress.length,
      timestamp: new Date()
    };
    
    // Visual indicator for fallback
    const fallbackIndicator = {
      role: 'system' as const,
      content: `🧠 **ContextGuard Compression Active (Fallback Mode)**\n\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
               `• Compressed ${toCompress.length} message(s)\n` +
               `• Estimated tokens saved: ~${estimatedTokensSaved.toLocaleString()}\n` +
               `• Note: Full summarization unavailable (model not configured or error occurred)\n` +
               `• Timestamp: ${new Date().toLocaleTimeString()}\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
               `### CONTEXT SUMMARY\n${fallbackSummary}`
    };
    
    return [
      fallbackIndicator,
      ...messages.slice(-keepLast)
    ];
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
        console.warn(`[ContextGuard] Cannot mark file as compressed - file not found: ${filePath}`);
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
