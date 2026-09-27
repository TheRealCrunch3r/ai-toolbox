/**
 * toolPayloadCompaction — C compaction family (24.09): PURE pre-summarization pruning policy for
 * oversized tool payloads in chat history, plus the opaque-locator format shared with the storage
 * backend (./toolPayloadStorage.ts).
 *
 * WHY (DeepSeek harness item C, memory 24.09 re-analysis): ContextGuard.compressHistory() summarizes
 * everything but the last `keepLast` messages and keeps those verbatim in the rebuilt history. A single
 * oversized tool result (giant read_file / web_fetch payload) therefore (a) dominates the summarization
 * prompt — pushing it toward/over the SUMMARY model's own context window, a leading cause of the
 * documented fallback path ("Original content unavailable") that loses all detail — and (b) survives in
 * `keepLast` verbatim forever, so the very next compression threshold check re-fires almost immediately.
 * Pruning BEFORE summarization shrinks both at once; nothing is lost because every pruned payload is
 * stored verbatim on disk with an opaque SHA-256 locator (retrieval hint).
 *
 * PURE BY DESIGN: no fs, no SDK, no globals. The policy functions take plain values and return plain
 * values so they are jest-testable without mocks (established F1-helper pattern — see
 * buildCheckpointSavedNotice in promptPreprocessor.ts and its suite tests/promptPreprocessor.test.ts).
 */

// ==================== Message shape (matches ContextGuard.ContextMessage) ====================

/** Structural message type identical to contextGuard's internal `ContextMessage` (role + opaque content). */
export interface CompactableMessage {
  role?: string;
  content?: unknown;
}

// ==================== Tuning constants ====================

/** Default max payload bytes before a tool-result message gets pruned (16 KiB ≈ ~4.5k tokens at ×0.25+10%). */
export const DEFAULT_MAX_BYTES_PER_RESULT = 16 * 1024;

/** Preview budget: head slice of a pruned payload (chars). */
const HEAD_PREVIEW_CHARS = 2_048;
/** Preview budget: tail slice of a pruned payload (chars). */
const TAIL_PREVIEW_CHARS = 512;

/** Marker prefix written by {@link buildCompactedContent} — also the idempotency guard. */
export const COMPACTED_MARKER_PREFIX = '[ai_toolbox compaction]';

/** Working-directory-relative store directory for pruned payloads (single source of truth; the storage
 * backend imports this instead of redefining it). Slash form: consumed as a user-visible path fragment. */
export const COMPACTED_STORE_REL = '.ai_toolbox/compaction';

// ==================== Locator format (branded opaque id — E house rule) ====================

const LOCATOR_SCHEME = 'compaction://';

/** SHA-256 digest length in hex chars. */
export const LOCATOR_DIGEST_HEX_LENGTH = 64;

/** Build the opaque locator for a pruned payload from its raw bytes (or a string, hashed as UTF-8). */
export function buildLocator(digestHex: string): string {
  return `${LOCATOR_SCHEME}${digestHex}`;
}

/** Extract the SHA-256 hex digest from a well-formed locator. Returns null for anything else. */
export function parseLocator(locator: string): string | null {
  if (typeof locator !== 'string' || !locator.startsWith(LOCATOR_SCHEME)) return null;
  const hex = locator.slice(LOCATOR_SCHEME.length);
  return /^[a-f0-9]{64}$/.test(hex) ? hex : null;
}

/** True when `text` is a single well-formed compaction locator (guards re-pruning of pruned text). */
export function isLocator(text: unknown): boolean {
  return parseLocator(typeof text === 'string' ? text : '') !== null;
}

// ==================== Preview / truncation helpers ====================

/** True when the UTF-8 byte length of `text` exceeds `maxBytes`. Shared by both prune entry points. */
export function isOversized(text: string, maxBytes: number): boolean {
  return typeof text === 'string' && Buffer.byteLength(text, 'utf8') > maxBytes;
}

/** Head + tail preview with an elision marker — never throws on binary-ish content. */
export function buildPreview(text: string, hiddenBytes: number): string {
  const head = text.slice(0, HEAD_PREVIEW_CHARS);
  const tailStart = Math.max(head.length, text.length - TAIL_PREVIEW_CHARS);
  const tail = tailStart > head.length ? text.slice(tailStart) : '';
  return `${head}\n… [${hiddenBytes} bytes omitted — full payload stored] \n${tail}`.trimEnd();
}

/** Compose the pruned content: marker + retrieval hint with opaque locator + head/tail preview. */
export function buildCompactedContent(text: string, digestHex: string, maxBytes: number): string {
  const total = Buffer.byteLength(text, 'utf8');
  const hidden = Math.max(0, total - HEAD_PREVIEW_CHARS - TAIL_PREVIEW_CHARS);
  return (
    `${COMPACTED_MARKER_PREFIX} Tool payload too large for context (${total.toLocaleString('en-US')} bytes > ${maxBytes.toLocaleString('en-US')} limit). ` +
    `Full result is stored verbatim at ${COMPACTED_STORE_REL}/${digestHex}.payload (working-directory relative —` +
    ` retrieve it with the file-reading tools using that path; locator="${buildLocator(digestHex)}").\n` +
    buildPreview(text, hidden)
  );
}

// ==================== Prune policy (the C step-1 deliverable) ====================

export interface ToolPayloadPruneOptions {
  /** Byte budget per tool-result payload (default {@link DEFAULT_MAX_BYTES_PER_RESULT}). */
  maxBytesPerResult?: number;
  /**
   * SHA-256 hex digests of the payloads that WILL be pruned, in array order — `digests[i]` pairs with the
   * i-th oversized tool message. Computed by the storage backend (toolPayloadStorage) over the exact bytes
   * this function will replace. When fewer than required are supplied, the unmatched messages are SKIPPED
   * and a loud error is logged — never minted with a fake digest (opaque-id contract: only real SHA-256).
   */
  digests: string[];
}

export interface PruneOutcome {
  /** Number of messages whose payload was replaced by preview + locator. */
  prunedCount: number;
  /** Byte savings measured on the serialized message array (JSON length before − after). */
  bytesSaved: number;
  /** Locators minted during this pass, in prune order (storage backend uses this for ordering). */
  locators: string[];
  /** Messages detected as oversized but skipped because no digest was paired (fail-loud; see options). */
  skippedCount: number;
}

/** Recognized payload shapes — deliberately the SAME surface ContextGuard reads when it builds the
 * summarization prompt and counts tokens, so pruning shrinks exactly what compressHistory() ships. */
type PayloadShape =
  | { kind: 'string'; text: string }
  | { kind: 'blocks'; blocks: Array<Record<string, unknown>> }
  | { kind: 'textObject'; record: Record<string, unknown>; text: string };

function extractPayloadShape(content: unknown): PayloadShape | null {
  if (typeof content === 'string') return { kind: 'string', text: content };
  if (Array.isArray(content)) return { kind: 'blocks', blocks: content as Array<Record<string, unknown>> };
  if (content !== null && typeof content === 'object' && !Array.isArray(content)) {
    const rec = content as Record<string, unknown>;
    if (typeof rec.text === 'string') return { kind: 'textObject', record: rec, text: rec.text };
  }
  return null;
}

/**
 * The texts this message WILL have pruned — the single source of truth for BOTH the policy pass and the
 * storage backend's digest pairing (toolPayloadStorage.digestsForPrune must scan with THIS function so
 * digests[i] always matches the i-th message the policy actually rewrites). Returns null when nothing is
 * prunable. ONLY role 'tool' is ever rewritten — user/assistant/system content is sacred (system carries
 * our own compression indicators; rewriting those would corrupt the audit trail); if the host embeds tool
 * results in another shape/role this degrades to a no-op for them: safe, and logged upstream.
 */
export function getPrunablePayloadTexts(msg: CompactableMessage, maxBytes: number): string[] | null {
  if ((msg.role ?? '') !== 'tool') return null;

  const shape = extractPayloadShape(msg.content);
  if (!shape) return null; // unrecognized content → cannot preview safely → leave untouched

  switch (shape.kind) {
    case 'string':
      // Idempotency: already pruned by a previous pass? Never re-prune compacted text.
      return !shape.text.startsWith(COMPACTED_MARKER_PREFIX) && isOversized(shape.text, maxBytes) ? [shape.text] : null;
    case 'textObject':
      if (shape.record.__compacted === true) return null; // idempotency marker
      return isOversized(shape.text, maxBytes) ? [shape.text] : null;
    case 'blocks': {
      const out: string[] = [];
      for (const b of shape.blocks) {
        const t = b?.text;
        if (typeof t === 'string' && !t.startsWith(COMPACTED_MARKER_PREFIX) && isOversized(t, maxBytes)) out.push(t);
      }
      return out.length > 0 ? out : null;
    }
  }
}

/** True when `msg` is a tool RESULT carrying at least one oversized payload worth pruning. */
function shouldPruneMessage(msg: CompactableMessage, maxBytes: number): boolean {
  return getPrunablePayloadTexts(msg, maxBytes) !== null;
}

/** Replaces `msg`'s oversized payload(s) with preview + opaque locator. Returns true when it wrote. */
function pruneMessageInPlace(msg: CompactableMessage, digestHex: string, maxBytes: number): boolean {
  const shape = extractPayloadShape(msg.content);
  if (!shape) return false;

  switch (shape.kind) {
    case 'string':
      msg.content = buildCompactedContent(shape.text, digestHex, maxBytes);
      return true;
    case 'textObject':
      shape.record.text = buildCompactedContent(shape.text, digestHex, maxBytes);
      shape.record.__compacted = true; // idempotency marker — a later pass must not re-prune this message
      return true;
    case 'blocks': {
      let wrote = false;
      for (const b of shape.blocks) {
        const t = b?.text;
        if (typeof t === 'string' && !t.startsWith(COMPACTED_MARKER_PREFIX) && isOversized(t, maxBytes)) {
          // All pruned blocks in one message share the message's single locator (one storage object).
          b.text = buildCompactedContent(t, digestHex, maxBytes);
          wrote = true;
        }
      }
      return wrote;
    }
  }
}

/**
 * Prunes oversized tool payloads from a message array IN PLACE (only pruned messages' content mutates).
 * See {@link ToolPayloadPruneOptions.digests} for the pairing contract and fail-loud behavior.
 */
export function pruneOversizedToolPayloads(
  messages: CompactableMessage[],
  options: ToolPayloadPruneOptions,
): PruneOutcome {
  const maxBytes = options.maxBytesPerResult ?? DEFAULT_MAX_BYTES_PER_RESULT;
  const before = measureMessagesBytes(messages);

  let prunedCount = 0;
  let skippedCount = 0;
  let digestCursor = 0;
  const locators: string[] = [];

  for (const msg of messages) {
    if (!shouldPruneMessage(msg, maxBytes)) continue;

    const supplied = options.digests[digestCursor];
    digestCursor += 1; // ALWAYS advance — the storage backend computed digests in the same scan order

    if (typeof supplied !== 'string' || !/^[a-f0-9]{64}$/.test(supplied)) {
      skippedCount += 1;
      console.error(
        `[toolPayloadCompaction] FAIL-LOUD: oversized tool payload at index ${messages.indexOf(msg)} has no paired ` +
        'SHA-256 digest (digests array too short or malformed) — message left UNTOUCHED. Storage backend must supply one digest per pruned message.',
      );
      continue; // fail loud, degrade safe: identical behavior to not having this feature at all
    }

    if (pruneMessageInPlace(msg, supplied, maxBytes)) {
      prunedCount += 1;
      locators.push(buildLocator(supplied));
    } else {
      skippedCount += 1; // digest paired but shape no longer prunable — keep counts honest for tests
    }
  }

  return { prunedCount, bytesSaved: Math.max(0, before - measureMessagesBytes(messages)), locators, skippedCount };
}

/** Serialized byte size of a message array — same measurement the prune pass reports. */
export function measureMessagesBytes(messages: CompactableMessage[]): number {
  return JSON.stringify(messages).length;
}
