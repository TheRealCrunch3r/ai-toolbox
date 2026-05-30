# ContextGuard: Infinite Context Management

**Version:** 1.4.0  
**Status:** Stable  
**Component:** `src/contextGuard.ts`

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Key Features](#2-key-features)
3. [Configuration (UI Controls)](#3-configuration-ui-controls)
   - [3.1 Master Toggle](#31-master-toggle)
   - [3.2 Token Limit Settings](#32-token-limit-settings)
   - [3.3 Smart File Reading](#33-smart-file-reading)
   - [3.4 Summary Model Selection](#34-summary-model-selection)
   - [3.5 Terminal Output Filtering](#35-terminal-output-filtering)
   - [3.6 Quick Reference Table](#36-quick-reference-table)
4. [Visual Indicator (Compression Status)](#4-visual-indicator-compression-status)
5. [Technical Implementation](#5-technical-implementation)
6. [Performance Considerations](#6-performance-considerations)
7. [Future Roadmap](#7-future-roadmap)

---

## 1. Executive Summary

The **ContextGuard** module is designed to solve the "Context Window Explosion" problem common in agentic workflows. By intercepting tool calls and managing the token budget dynamically, it allows the local LLM to maintain a clean, efficient context window, effectively simulating an "infinite" context without crashing RAM or losing inference speed.

---

## 2. Key Features

### A. Smart Reader (Heuristic Grep)
*   **Mechanism:** Instead of blindly loading large files, ContextGuard extracts keywords from the user's current prompt (e.g., `calculateTax`, `Payment`) and performs a targeted search within the file.
*   **Benefit:** Provides **high precision** (exact code snippets) and **high speed** (instant regex search) without requiring heavy RAG infrastructure.
*   **Fallback:** If no keywords are found, it defaults to a Header/Footer view of the file.

### B. Threshold-Based Compression (The Brain)
*   **Mechanism:** The system monitors the total token count of the conversation history. It only triggers a "Brain" compression (summarization) when the context reaches **90%** of the configured `tokenLimit`.
*   **Benefit:** Prevents unnecessary model calls on every turn, keeping the system fast and responsive.
*   **Implementation:** Uses a local model (e.g., `gemma-2b`) via the LM Studio SDK to generate concise technical summaries of older messages.

### C. Terminal Output Filtering (The Eyes)
*   **Mechanism:** Intercepts terminal output from tools like `execute_command` and `run_in_terminal`. If output exceeds the `terminalFilterLength` threshold, it truncates to the first/last 5 lines.
*   **Benefit:** Prevents terminal logs (stack traces, `npm install` output) from consuming context rapidly without adding value to the LLM's reasoning.
*   **Configuration:** Controlled by `terminalFilterEnabled` (boolean) and `terminalFilterLength` (number) settings.

### D. Re-RAG Trigger (The Nose)
*   **Mechanism:** Added `reload_context_for_file` tool that allows the LLM to force a fresh read of a file that was previously compressed or truncated.
*   **Benefit:** Prevents "context hallucination" or "I forgot what was in that file" errors by providing a mechanism to recover lost context.
*   **Usage:** The LLM can call this tool when it realizes it needs more information about a specific file.

### E. Token Budget Visualization (The Fuel Gauge)
*   **Mechanism:** Injects current token usage information into `read_file` outputs when ContextGuard is active.
*   **Benefit:** Helps the LLM make better decisions about what to read or summarize by providing real-time context awareness.
*   **Format:** `[ContextGuard] Budget: 85k/110k tokens (77% used)`

---

## 3. Configuration (UI Controls)

ContextGuard settings are accessible via **LM Studio → Plugins → AI Toolbox → ⚙️ Settings**.

Scroll down to the **🧠 ContextGuard Token Management** section:

### 3.1 Master Toggle

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **🧠 ContextGuard Token Management** | Toggle | ✅ Enabled | Master switch for all ContextGuard features (compression, smart reading, terminal filtering). |

---

### 3.2 Token Limit Settings

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| **📊 Token Limit Before Compression** | Numeric | 1,000 – 200,000 | `80,000` | Maximum tokens before compression triggers. **Compression activates at 90%** of this value (e.g., 72k for 80k limit). |

> 💡 **Tip**: Lower values = more frequent compression but slower responses. Higher values = less compression but risk hitting model limits.

---

### 3.3 Smart File Reading

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **🔍 Smart File Reading** | Toggle | ✅ Enabled | Extracts keywords from user queries to read only relevant portions of files. Saves tokens and speeds up responses. |

> 📖 **How it works**: When you ask about `calculateTax`, ContextGuard searches for that keyword in files instead of reading everything.

---

### 3.4 Summary Model Selection

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **🤖 Summary Model Name** | Text Input | *(empty)* | LM Studio model name used for history summarization. Leave empty to use your current chat model. |

> 🎯 **Recommended models**: `gemma-2b`, `phi-3-mini`, or any small fast model optimized for summarization tasks.

---

### 3.5 Terminal Output Filtering

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| **📌 Terminal Output Filtering** | Toggle | ✅ Enabled | Automatically truncates long terminal outputs (npm install, stack traces) to save tokens. |
| **📏 Max Terminal Output Length** | Numeric | 100 – 20,000 | `2,000` | Maximum characters before terminal output is truncated and summarized. |

> ⚡ **Example**: An npm install output of 50,000 chars becomes ~200 chars (first/last 5 lines + summary).

---

### 3.6 Quick Reference Table

| Config Key | UI Name | Type | Default |
|------------|---------|------|----------|
| `contextGuardEnabled` | 🧠 ContextGuard Token Management | Boolean | `true` |
| `contextGuardTokenLimit` | 📊 Token Limit Before Compression | Number (1K-200K) | `80,000` |
| `contextGuardSmartReading` | 🔍 Smart File Reading | Boolean | `true` |
| `contextGuardSummaryModel` | 🤖 Summary Model Name | String | `""` (current chat model) |
| `contextGuardTerminalFilterEnabled` | 📌 Terminal Output Filtering | Boolean | `true` |
| `contextGuardTerminalFilterLength` | 📏 Max Terminal Output Length | Number (100-20K) | `2,000` |

---

## 4. Visual Indicator (Compression Status)

When ContextGuard compresses chat history, a **visual indicator** is injected into the conversation:

```
🧠 **ContextGuard Compression Active**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Compressed 15 message(s) into summary
• Tokens before: ~85k → after: ~42k
• **Saved ~43,000 tokens (~51%)**
• Timestamp: 19:15:32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### CONTEXT SUMMARY (from 15 messages)
[Summary content here...]
```

### Indicator Components:

| Element | Description |
|---------|-------------|
| 🧠 Emoji | Identifies the message as ContextGuard-generated |
| Messages compressed | Number of chat turns that were summarized |
| Token comparison | Before/after token counts (approximate) |
| Percentage saved | Efficiency metric for compression |
| Timestamp | When compression occurred |

### Fallback Mode Indicator:

If summarization fails or no model is configured:

```
🧠 **ContextGuard Compression Active (Fallback Mode)**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Compressed 15 message(s)
• Estimated tokens saved: ~30,000
• Note: Full summarization unavailable (model not configured or error occurred)
• Timestamp: 19:15:32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 5. Technical Implementation

### Token Counting with Hash-Based Cache Invalidation

ContextGuard uses a sophisticated token counting mechanism that:

1. **Hashes all messages** to detect changes (not just the last message)
2. **Caches results** to avoid re-counting on every turn
3. **Accounts for message structure**: role prefixes, separators, and BOS tokens

```typescript
// Hash-based cache invalidation - validates ALL messages, not just last one
if (this.cachedTokenCount !== null) {
  const currentHash = this.computeMessageHash(messages);
  
  if (this._lastMessageHash === currentHash) {
    return this.cachedTokenCount;
  }
}

// Token counting with structured text format
const structuredText = `<|start|>assistant<|name|>${role}<|end|>\n${content}`;
count += this.encoder.encode(structuredText).length;
```

### Compression Logic

When token count exceeds threshold (90% of `tokenLimit`):

1. **Identifies messages to compress**: All except last 10 turns
2. **Sends to local model**: Uses configured `summaryModel` for summarization
3. **Preserves key information**: File paths, function names, and logic are maintained
4. **Fallback behavior**: If no model available, generates generic summary

```typescript
async compressHistory(messages: any[]): Promise<any[]> {
  const currentTokens = await this.countTokens(messages);
  const threshold = this.config.tokenLimit * 0.9;

  if (currentTokens < threshold) return messages;

  const keepLast = 10;
  const toCompress = messages.slice(0, -keepLast);
  
  // Use local model for summarization
  if (this.lmClient && this.config.summaryModel) {
    const model = await this.lmClient.llm.model(this.config.summaryModel);
    const summaryPrompt = `Summarize the following conversation history...`;
    
    const response = await model.complete(summaryPrompt, { maxTokens: 1024, temperature: 0.1 });
    return [
      { role: 'system', content: response.content },
      ...messages.slice(-keepLast)
    ];
  }

  // Fallback if no model or error
  return [
    { role: 'system', content: `[ContextGuard Summary: ${toCompress.length} older messages compressed.]` },
    ...messages.slice(-keepLast)
  ];
}
```

### Smart File Reading

The Smart Reader provides intelligent file content extraction:

1. **Keyword Extraction**: Uses regex to identify meaningful identifiers from user prompt
2. **Targeted Search**: Finds lines matching keywords with context margin (±5 lines)
3. **Fallback View**: Header/footer view if no keywords match
4. **Size Limits**: Respects `maxLength` parameter and file size thresholds

```typescript
smartRead(filePath: string, userPrompt?: string, maxLength?: number): string {
  // Extract keywords from prompt
  const keywords = this.extractKeywords(userPrompt || '');
  
  // Search for matching lines with context margin
  if (keywords.length > 0) {
    const relevantLines = lines.filter((line, index) => 
      keywords.some(kw => line.toLowerCase().includes(kw.toLowerCase()))
    );
    
    return this.formatRelevantLines(lines, relevantLines);
  }
  
  // Fallback: header/footer view for large files
  const header = lines.slice(0, 50).join('\n');
  const footer = lines.slice(-50).join('\n');
  return `// [ContextGuard] File truncated...`;
}
```

### Integration with Prompt Preprocessor

ContextGuard integrates with the prompt preprocessor for automatic context management:

```typescript
// In promptPreprocessor.ts
if (contextGuard) {
  const history = await ctl.pullHistory();
  history.append(userMessage);
  const messages = history.getMessagesArray();
  
  const tokenCount = await contextGuard.countTokens(messages);
  const threshold = contextGuard.getThreshold();
  
  if (tokenCount > threshold) {
    // Auto-compress when approaching limit
    const compressedMessages = await contextGuard.compressHistory(messages);
    
    // Replace history with compressed version
    while (history.getLength() > 0) history.pop();
    compressedMessages.forEach(msg => history.append(msg));
    
    contextGuard.resetTokenCache();
  }
}
```

---

## 6. Performance Considerations

### Speed Optimizations

1. **Hash-Based Caching**: Token counting results cached with hash invalidation (O(1) lookup)
2. **Early Exit in Keyword Search**: Stops searching if minimum possible score drops below threshold
3. **Lazy Encoder Loading**: Tiktoken encoder loaded only on first use
4. **Batch Processing**: Embedding generation uses batch processing for efficiency

### Memory Efficiency

1. **Terminal Filtering**: Prevents large outputs from bloating context window
2. **Smart Reading**: Only loads relevant file sections instead of entire files
3. **Compression**: Reduces conversation history size when approaching limits
4. **Entry Limiting**: Context storage limited to 1000 entries to prevent unbounded growth

### Token Budget Management

| Metric | Description |
|--------|-------------|
| `tokenLimit` | Maximum tokens before compression triggers (default: 110,000) |
| `threshold` | Compression trigger point (90% of tokenLimit) |
| `currentTokens` | Cached token count for current conversation |
| `budgetInfo` | Human-readable budget status string |

---

## 7. Future Roadmap

1. **Multi-Model Summarization**: Use a larger model for summarization if the conversation is complex, and a smaller model if it is simple.
2. **Visual Context Map**: Add a UI panel in LM Studio showing a "graph" of which files are currently active in the context.
3. **Adaptive Thresholds**: Automatically adjust the compression threshold based on conversation complexity.
4. **Context Persistence**: Save compressed history to disk for session recovery across restarts.
