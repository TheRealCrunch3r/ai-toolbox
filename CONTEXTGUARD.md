# ContextGuard: Infinite Context Management

**Version:** 1.3.2  
**Status:** Stable  
**Component:** `src/contextGuard.ts`

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

## 3. Configuration

ContextGuard is enabled via the LM Studio Plugin Settings panel.

| Setting Name | Type | Default | Description |
|--------------|------|---------|-------------|
| `contextGuard` | `boolean` | `false` | Enable the ContextGuard module. |
| `tokenLimit` | `number` | `110,000` | The maximum token count before compression triggers. |
| `smartReading` | `boolean` | `true` | Enable heuristic keyword-grep for file reads. |
| `summaryModel` | `string` | `gemma-2b` | The model used to summarize older history. |
| `terminalFilterEnabled` | `boolean` | `true` | Enable terminal output filtering to save context. |
| `terminalFilterLength` | `number` | `2000` | Max characters for terminal output before filtering. |

---

## 4. Technical Implementation

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

## 5. Performance Considerations

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

## 6. Future Roadmap

1. **Multi-Model Summarization**: Use a larger model for summarization if the conversation is complex, and a smaller model if it is simple.
2. **Visual Context Map**: Add a UI panel in LM Studio showing a "graph" of which files are currently active in the context.
3. **Adaptive Thresholds**: Automatically adjust the compression threshold based on conversation complexity.
4. **Context Persistence**: Save compressed history to disk for session recovery across restarts.
