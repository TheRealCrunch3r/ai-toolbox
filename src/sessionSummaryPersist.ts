/**
 * Session Summary Persistence — Arc C (07.10): forced structured session-memory save at the compression trigger.
 *
 * When ContextGuard's compression threshold is reached, promptPreprocessor() PART B calls this module to
 * persist a canonical SessionSummaryData BEFORE compressHistory() destroys the un-summarized history
 * (ordering pinned by tests/precompressSnapshot.test.ts for the telemetry snapshot; this path is its
 * structured successor, gated by config contextGuardForceSummaryOnCompress).
 *
 * The writer contract below mirrors save_session_summary (src/tools/contextManagementTools.ts) EXACTLY:
 *   1. Truncate every field at 2048 chars (safe slice = 2048 − suffix.length computed AT RUNTIME — the
 *      '\n… (truncated for size)' suffix is 23 UTF-16 units, so the safe slice is 2025; never re-hardcode).
 *   2. Evict ONLY the authoritative key 'session_summary_latest' (never memory_* or other records).
 *   3. set() the new summary BEFORE forceSave() — atomic state transition (writer FIX #1).
 *   4. A durable forceSave() failure = whole persistence failed (the RAM-only write would be lost on reload).
 *   5. SessionIndexManager.addEntry() runs AFTER the durable flush, in its own try/catch — non-fatal by design:
 *      a summary that is safe on disk must not fail because the lightweight index could not be updated.
 *
 * Import-graph note (cycle-free by construction): toolsProvider.ts + every src/tools/* module never import
 * contextGuard/promptPreprocessor/sessionSummaryPersist, so this edge set adds no cycle — only index.ts
 * imports both sides of the graph.
 */

import { getStateManager } from './toolsProvider.js';
// SessionIndexManager (class) + SessionSummaryData (type): the single-dot specifier './tools/contextManagementTools.js'
// is SHARED with src/promptPreprocessor.ts's own value-import of this module, and jest.config.cjs maps it to the __mocks__
// stub (<rootDir>/tests/__mocks__/contextManagementTools.ts) for suite isolation — that stub exports ONLY
// registerContextManagementTools, so under jest the SessionIndexManager binding in THIS module is undefined: `new`
// throws before any fs access and the non-fatal index try/catch below absorbs it (pinned by tests/sessionSummaryPersist.test.ts).
// In production builds the specifier resolves to the real module as usual. Re-scoping that shared mapper entry to real src
// would activate exact-once + post-flush coverage of the REAL class but changes resolution for every suite mapping this
// specifier — explicit owner decision, do not change without GO.
import { SessionIndexManager } from './tools/contextManagementTools.js';
import type { SessionSummaryData } from './tools/contextManagementTools.js';

/** Hard per-field cap — byte-identical to the save_session_summary writer (P0 FIX: 2 KB per field). */
const MAX_FIELD_LENGTH = 2048;
const TRUNCATION_SUFFIX = '\n… (truncated for size)'; // 23 UTF-16 units ('\n' + '…' + space + '(truncated for size)') — measured, never re-hardcode
const SAFE_SLICE_LEN = MAX_FIELD_LENGTH - TRUNCATION_SUFFIX.length; // runtime: 2048 − 23 = 2025 (derived at load, so a future suffix edit stays cap-exact)

/** Mirrors the save_session_summary truncate() helper: cap + suffix + warn. Exported for hermetic unit tests. */
export function truncateSessionSummaryField(text?: string): { content: string; truncated: boolean } {
  if (!text || text.length <= MAX_FIELD_LENGTH) return { content: text ?? '', truncated: false };
  console.warn(`[sessionSummaryPersist] Truncated field from ${text.length} to ${MAX_FIELD_LENGTH} chars.`);
  return {
    content: text.slice(0, SAFE_SLICE_LEN) + TRUNCATION_SUFFIX,
    truncated: true,
  };
}

// ==================== ARC C2 (15.10, owner GO): pipeline contamination guards ====================
// Observed live in .session_context/sessions.json on 14.10 — rows that are NOT summaries:
//   • "No user request was provided in the conversation history."        ← model narrating an empty history
//   • 'maybe "No task was provided..." But format requires one or two sentences ...'  ← raw reasoning fragment
//   • "<one or two sentences...>"                                        ← prompt placeholder echoed verbatim
//   • __LM_STUDIO_INTERNAL_LSEP_* host separators leaking into consumed text (never produced in src/ — grep-verified)

/** Strip LM Studio internal message-separator tokens (__LM_STUDIO_INTERNAL_LSEP_*) from summary text. */
function stripLsepTokens(text: string): string {
  return text.replace(/__LM_STUDIO_INTERNAL_LSEP_[^\s"]*/g, '');
}

/** True when at least one USER-role message carries non-trivial text (≥8 chars after trim).
 * Covers both plain-string content and the SDK content-block array shape ({type:'text',text}); non-user roles
 * (system/assistant/tool) never count. 8 chars is deliberately low: real tasks are short ("fix both" = 9), but a
 * pure empty/agent turn (whitespace-only user messages, tool traffic only) has nothing for the continuity prompt
 * to work from — observed failure class above. Exported for hermetic unit tests (exact production shapes). */
export function hasMeaningfulUserContent(
  messages: ReadonlyArray<{ role?: string; content?: unknown }>,
): boolean {
  for (const m of messages) {
    if ((m.role ?? '').toLowerCase() !== 'user') continue;
    let text = '';
    if (typeof m.content === 'string') {
      text = m.content;
    } else if (Array.isArray(m.content)) {
      for (const block of m.content as Array<Record<string, unknown>>) {
        // 15.10 gate: no `as string` — the typeof guard already narrows block.text in this branch (stable const ref); cast was @typescript-eslint/no-unnecessary-type-assertion
        const t = typeof block?.text === 'string' ? block.text : '';
        if (t.length > 0) text += `${t}\n`;
      }
    }
    if (text.trim().length >= 8) return true;
  }
  return false;
}

/** Strip known contamination artifacts from ONE summary field: LSEP tokens, the continuity prompt's own
 * placeholder ("&lt;one or two sentences...>" and kin), and model reasoning preamble — leading prose that ends at
 * the first fixed section heading (a small local model asked to summarize an empty history answers about its task
 * instead of doing it). Returns text with every removed span replaced by whitespace (positions stay stable for
 * any downstream parsing) then re-trimmed. Exported for hermetic unit tests. */
export function stripSummaryArtifacts(text: string): string {
  if (!text || text.length === 0) return '';
  let out = stripLsepTokens(text);
  // Prompt placeholders echoed verbatim (any bracketed angle-bracket placeholder, e.g. "<one or two sentences...>")
  out = out.replace(/<[^<>]{0,120}\.\.\.[^<>]{0,120}>/g, ' ');
  // Reasoning preamble: leading text up to the FIRST known section heading (only when a heading actually exists)
  const headIdx = Math.min(
    ...['TASK:', 'ACCOMPLISHMENTS:', 'PENDING TASKS:', 'DECISIONS MADE:', 'CONTEXT FOR NEXT SESSION:']
      .map(h => out.indexOf(h))
      .filter(i => i !== -1),
  );
  if (Number.isFinite(headIdx) && headIdx > 0) {
    out = `${' '.repeat(headIdx)}${out.slice(headIdx)}`;
  }
  return out.trim();
}

/**
 * Persist a generated session-continuity summary through the canonical save_session_summary writer path.
 *
 * Non-throwing by contract: callers (the compression trigger in promptPreprocessor PART B) treat any failure as
 * "not persisted" and fall back to telemetry-only logging — compression must never be blocked or aborted here.
 */
export async function persistGeneratedSessionSummary(summary: SessionSummaryData): Promise<{ saved: boolean; error?: string }> {
  const memoryStore = getStateManager();
  if (!memoryStore) {
    // Mirrors the tool's FIX #4 fail-loud contract — RAM-only would be silently lost on reload.
    console.error('[sessionSummaryPersist] ❌ No StateManager registered — persistence DISABLED.');
    return { saved: false, error: 'StateManager not available. Session summary could not be persisted.' };
  }

  // ARC C2b (15.10, owner GO): strip contamination artifacts from every field BEFORE truncation — the persisted
  // summary is the last place a junk row may be born (observed live 14.10). Order matters: strip first so the 2 KB
  // cap is never spent on LSEP tokens / echoed placeholders / reasoning preamble.
  const strippedTaskDescription = stripSummaryArtifacts(summary.task_description ?? '');
  if (strippedTaskDescription === '') {
    console.warn('[sessionSummaryPersist] ⚠️ Skipping persistence: task description empty after artifact strip — nothing meaningful to persist (mirrors the anyNonEmpty parser contract)');
    return { saved: false, error: 'no meaningful content' };
  }

  const taskDesc = truncateSessionSummaryField(strippedTaskDescription);
  const accomplishmentsTrunc = truncateSessionSummaryField(stripSummaryArtifacts(summary.accomplishments ?? ''));
  const pendingTasksTrunc = truncateSessionSummaryField(stripSummaryArtifacts(summary.pending_tasks ?? ''));
  const decisionsMadeTrunc = truncateSessionSummaryField(stripSummaryArtifacts(summary.decisions_made ?? ''));
  const contextForNextSessionTrunc = truncateSessionSummaryField(stripSummaryArtifacts(summary.context_for_next_session ?? ''));

  const summaryData: SessionSummaryData = {
    task_description: taskDesc.content,
    accomplishments: accomplishmentsTrunc.content,
    pending_tasks: pendingTasksTrunc.content,
    decisions_made: decisionsMadeTrunc.content,
    context_for_next_session: contextForNextSessionTrunc.content,
    timestamp: summary.timestamp ?? Date.now(),
    date: summary.date ?? new Date().toLocaleString(),
  };

  try {
    // Evict ALL previous session summaries before saving the new one (writer P0 FIX) — but ONLY the
    // authoritative key; memory_* facts and every other record stay untouched.
    const allKeys = await memoryStore.getAllKeys();
    let evictedCount = 0;
    for (const key of allKeys) {
      if (key === 'session_summary_latest') {
        memoryStore.delete(key);
        evictedCount++;
      }
    }
    if (evictedCount > 0) {
      console.log(`[sessionSummaryPersist] Evicted ${evictedCount} old session summary(s).`);
    }

    // Set the new summary BEFORE forceSave to guarantee an atomic state transition (writer FIX #1).
    memoryStore.set('session_summary_latest', summaryData);

    // Durable flush is MANDATORY — a throw here means the summary is NOT safe on disk.
    await memoryStore.forceSave();

    // Now safely update the lightweight index (disk is already durable) — non-fatal by design.
    try {
      const sessionIndex = new SessionIndexManager();
      await sessionIndex.addEntry(summaryData.task_description, Date.now(), new Date().toLocaleString());
    } catch (indexErr) {
      const msg = indexErr instanceof Error ? indexErr.message : String(indexErr);
      console.warn(`[sessionSummaryPersist] Session index update failed (summary already persisted): ${msg}`);
    }

    console.log('[sessionSummaryPersist] ✅ Generated session summary persisted (durable).');
    return { saved: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[sessionSummaryPersist] ❌ Persistence failed: ${message}`);
    return { saved: false, error: `Failed to persist session summary: ${message}` };
  }
}

/** Lenient parser for generateSessionContinuity() model output — see contextGuard.ts (Arc C). */

const SECTION_HEADINGS = [
  ['TASK:', 'task_description'],
  ['ACCOMPLISHMENTS:', 'accomplishments'],
  ['PENDING TASKS:', 'pending_tasks'],
  ['DECISIONS MADE:', 'decisions_made'],
  ['CONTEXT FOR NEXT SESSION:', 'context_for_next_session'],
] as const;

type SummaryFieldKey = (typeof SECTION_HEADINGS)[number][1];

/** Strip a single balanced pair of Markdown code fences (``` … ```) if the model wrapped its answer. */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```[a-zA-Z0-9]*\s*\n([\s\S]*)\n```\s*$/);
  return match ? match[1].trim() : trimmed;
}

/** Extract one fixed section's body: the text after its heading up to the next known heading (or end). */
function extractSection(body: string, headings: ReadonlyArray<readonly [string, SummaryFieldKey]>): Record<SummaryFieldKey, string> {
  const result = {} as Record<SummaryFieldKey, string>;
  // NOTE: tuple shape is [headingText, fieldKey] — the Record key lives at index 1 (see SummaryFieldKey);
  // destructuring element 0 here would type as plain `string` AND leave every real field key uninitialized.
  for (const [, key] of headings) {
    result[key] = '';
  }

  let cursor = 0;
  for (let i = 0; i < headings.length; i++) {
    const headingIdx = body.indexOf(headings[i][0], cursor);
    if (headingIdx === -1) continue; // missing section → stays '' (lenient contract)

    const nextHeadings = headings.slice(i + 1).map(([h]) => h);
    let endIdx = body.length;
    for (const next of nextHeadings) {
      const candidate = body.indexOf(next, headingIdx + headings[i][0].length);
      if (candidate !== -1 && candidate < endIdx) endIdx = candidate;
    }

    const sectionBody = body.slice(headingIdx + headings[i][0].length, endIdx).trim();
    result[headings[i][1]] = sectionBody === '(none)' ? '' : sectionBody;
  }

  return result;
}

/**
 * Lenient parser for the structured continuity prompt's model output (Arc C).
 *
 * Accepts BOTH shapes a local model may produce:
 *   1. PLAIN SECTION FORMAT (the requested one): fixed headings TASK: / ACCOMPLISHMENTS: / PENDING TASKS: /
 *      DECISIONS MADE: / CONTEXT FOR NEXT SESSION:, each followed by short bullets or prose until the next heading.
 *   2. JSON MODE fallback: a JSON object with keys task_description / accomplishments / pending_tasks /
 *      decisions_made / context_for_next_session (optionally wrapped in ```json … ``` fences).
 *
 * Missing sections map to '' (never throw); returns null only when NEITHER shape yields any usable section —
 * the caller then skips persistence and keeps the deterministic telemetry fallback.
 */
export function parseSessionContinuity(raw: string): SessionSummaryData | null {
  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) return null;

  const cleaned = stripCodeFences(raw);

  // JSON-mode attempt first when the (fence-stripped) text looks like a JSON object.
  if (cleaned.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const o = parsed as Record<string, unknown>;
        const fields = {} as Record<SummaryFieldKey, string>;
        let anyNonEmpty = false;
        for (const [, key] of SECTION_HEADINGS) {
          const v = o[key];
          const text = typeof v === 'string' ? v.trim() : '';
          fields[key] = text;
          if (text.length > 0) anyNonEmpty = true;
        }
        if (anyNonEmpty) return fields;
      }
    } catch {
      // Not valid JSON — fall through to section mode.
    }
  }

  const fields = extractSection(cleaned, SECTION_HEADINGS);
  const anyNonEmpty = SECTION_HEADINGS.some(([, key]) => fields[key].length > 0);
  if (!anyNonEmpty) return null; // neither shape yielded anything usable

  return fields;
}
