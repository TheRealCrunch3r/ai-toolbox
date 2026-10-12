/**
 * Tool-Definition Overhead Estimator
 *
 * LM Studio's sidebar counts the FULL request prompt — chat history PLUS all serialized tool
 * definitions registered via withToolsProvider() plus the chat template. The preprocessor cannot
 * reach the SDK-serialized payload directly, but toolsProvider has it in hand:
 *   1. toolsProvider reports its final (minified) array here after building it.
 *   2. promptPreprocessor adds the reported char count to historyTextLength, so the shared
 *      agentic-density estimate (estimateTokensFromChars - tokenStatsManager) covers the same
 *      span LM Studio actually counts.
 *
 * CLASS B (10.11 TOKEN-DIVERGENCE arc): the SDK serializes each tool's parameters as a JSON SCHEMA
 * (zod-to-json-schema on the live zod tree — see wire_harness.cjs and @lmstudio/sdk), so the legacy
 * `JSON.stringify(tool)` credit counted the whole raw entry (schema objects + internal props) instead
 * of the wire text. Per reported tool we now serialize { name, description, parameters } where
 * parameters is zodToJsonSchema(live schema) — the SAME call chain the host uses, with the same
 * `parametersSchema ?? parameters` key convention, so this figure stays byte-parity with what the
 * host meter counts (10.11: npm ls proves one zod-to-json-schema 3.24.1 + single zod 3.25.76 tree-wide).
 * Entries without a live schema fall back to the legacy full-JSON credit unchanged.
 *
 * This is still a chars×ratio estimate — not exact tokenization: the SDK's countTokens() cannot
 * tokenize prompts containing tool calls (ToolCallRequestError, @lmstudio/sdk v1.8.x), so an
 * independent char-based figure for this overhead is the pragmatic approach.
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
// Type-only import — erased at compile time, no runtime cycle edge into zod.
import type { ZodTypeAny } from 'zod';

let cachedChars = 0;
let cachedSignature = '';
let hasCache = false;

/** True for a live v3/v4 zod schema (duck-check — works whether the SDK builds v3 or v4 objects). */
function isLiveZodSchema(schema: unknown): boolean {
  if (!schema || typeof schema !== 'object') return false;
  const s = schema as Record<string, unknown>;
  return typeof s.parse === 'function' && (typeof s.safeParse === 'function' || typeof s._def === 'object');
}

/** Wire-shape char credit for one tool: the JSON text the host would actually send. */
function wireShapeChars(t: unknown): number {
  if (!t || typeof t !== 'object') return 0;
  const entry = t as Record<string, unknown>;
  const name = typeof entry.name === 'string' ? entry.name : '';
  const description = typeof entry.description === 'string' ? entry.description : '';
  // Index access on Record<string, unknown> already yields unknown — no assertion needed for the duck check below.

  let parameters: unknown; // whatever z2js yields — only its serialized text size matters here
  const schema = entry.parametersSchema ?? entry.parameters; // host key convention (already unknown-typed)
  if (isLiveZodSchema(schema)) {
    try {
      // Mirrors the host serialization chain (wire_harness.cjs / @lmstudio/sdk): live zod → JSON schema.
      // Scoped disable: z2js declares its parameter as ZodSchema<any>, so a duck-checked unknown MUST be
      // asserted to typecheck (TS2345 otherwise) — and any such argument trips no-unsafe-argument by design.
      // Same boundary class as contextGuard.ts's file-level SDK disables; keep it scoped to this call only.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      parameters = zodToJsonSchema(schema as ZodTypeAny);
    } catch {
      // Unconvertible schema — drop parameters rather than break reporting for the whole set.
    }
  }

  const wire: Record<string, unknown> = {};
  if (name !== '') wire.name = name;
  if (description !== '') wire.description = description;
  if (parameters != null) wire.parameters = parameters;
  const s = JSON.stringify(wire);
  return typeof s === 'string' ? s.length : 0;
}

/** Legacy credit for entries without a live schema — preserves the pre-Class-B behavior. */
function legacyChars(t: unknown): number {
  try {
    const s = JSON.stringify(t);
    if (typeof s === 'string') return s.length;
  } catch {
    // Non-serializable entry — skip it.
  }
  return 0;
}

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
      const entry = (t && typeof t === 'object') ? (t as Record<string, unknown>) : null;
      const schema = entry ? (entry.parametersSchema ?? entry.parameters) : undefined;
      // Live zod schema → credit the wire shape only. Plain objects / JSON schemas keep legacy credit:
      // for those, stringify(t) already approximates the wire text and this preserves old behavior.
      chars += isLiveZodSchema(schema) ? wireShapeChars(t) : legacyChars(t);
    } catch {
      // Non-serializable entry — skip it (never break the provider).
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
