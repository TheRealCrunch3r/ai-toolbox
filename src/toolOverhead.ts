/**
 * Tool-Definition Overhead Estimator
 *
 * LM Studio's sidebar counts the FULL request prompt — chat history PLUS all serialized tool
 * definitions registered via withToolsProvider() plus the chat template. The preprocessor cannot
 * reach the SDK-serialized payload directly, but toolsProvider has it in hand:
 *   1. toolsProvider reports its final (minified) array here after building it.
 *   2. promptPreprocessor adds the reported char count to historyTextLength, so the primary
 *      heuristic (chars × 0.25 × 1.10) covers the same span LM Studio actually counts.
 *
 * This is a chars×ratio estimate by design — not exact tokenization: the SDK's countTokens()
 * cannot tokenize prompts containing tool calls (ToolCallRequestError, @lmstudio/sdk v1.8.x),
 * so an independent char-based figure for this overhead is the pragmatic approach.
 */

let cachedChars = 0;
let cachedSignature = '';
let hasCache = false;

/**
 * Report the final list of tools exposed to the LLM (call with the minified array).
 * Cached by a cheap signature (tool count + names); repeated calls are O(1) unless the
 * tool set actually changed, in which case the char sum is recomputed.
 */
export function reportToolSchemas(tools: unknown[]): void {
  let signature = '';
  try {
    const names: string[] = [];
    for (const t of tools) {
      const name = t && typeof t === 'object' ? (t as Record<string, unknown>).name : undefined;
      names.push(typeof name === 'string' ? name.slice(0, 64) : '?');
    }
    signature = `${tools.length}:${names.join(',')}`;
  } catch {
    // Never break the provider — fall through and recompute unconditionally.
  }

  if (hasCache && signature === cachedSignature) return;

  let chars = 0;
  for (const t of tools) {
    try {
      const s = JSON.stringify(t);
      if (typeof s === 'string') chars += s.length;
    } catch {
      // Non-serializable entry — skip it.
    }
  }

  cachedChars = chars;
  cachedSignature = signature;
  hasCache = true;
}

/** Reported overhead in characters (0 until the provider has run at least once this session). */
export function getToolOverheadChars(): number {
  return cachedChars;
}
