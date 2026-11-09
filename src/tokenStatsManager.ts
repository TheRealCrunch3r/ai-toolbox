/**
 * TokenStatsManager - Bridges ContextGuard token counting with LM Studio SDK PredictionResult.stats & REST API
 * 
 * Three-tier token counting strategy (prioritized):
 * 1. 🔥 REST API (/v1/chat/completions) — Authoritative source, matches sidebar exactly
 * 2. ⚡ SDK PredictionResult.stats — From model.respond().result().stats
 * 3. 📊 Tiktoken estimation — Fallback when both above are unavailable
 * 
 * According to official LM Studio SDK docs:
 * https://lmstudio.ai/docs/typescript/api-reference/llm-prediction-config-input
 */

import type { LLMPredictionStats } from '@lmstudio/sdk';
import * as lmStudioApi from './lmStudioApi.js';

/** Cached prediction stats from the most recent prediction */
let lastPredictionStats: LLMPredictionStats | null = null;

/** Cumulative token count across all predictions in this session (matches sidebar) */
let cumulativeTotalTokens: number = 0;

/** Callback to notify ContextGuard when new stats are available */
type StatsChangeListener = (stats: LLMPredictionStats) => void;
const listeners: Set<StatsChangeListener> = new Set();

// ==================== FIX #20 (A1): Mid-loop tool payload delta bookkeeping ====================
//
// LM Studio calls promptPreprocessor.preprocess() exclusively on USER messages — never during the
// agentic tool loop of a turn. Tool results generated mid-turn therefore stay invisible to the token
// threshold until the NEXT user message, when they are counted natively again (the history iteration
// in preprocess() sums getToolCallRequests()/getToolCallResults() over ALL messages). Hence this delta
// is strictly per-TURN: it must be reset at every preprocess() start or the next turn's native count
// would double-count last turn's tool payloads.

/** Raw character sum of all tool results returned since the last preprocess() call */
let midLoopDeltaChars = 0;

/** Estimated token sum (shared agentic-density ratio — see estimateTokensFromChars() below) */
let midLoopEstTokens = 0;

// FIX #20 A2 — turn-start baseline for the mid-loop guard, plus the model context limit it is
// evaluated against. Set from promptPreprocessor.preprocess() right after ContextGuard computed
// the authoritative count for this turn.
let turnBaselineTokens = 0;
let maxContextTokens = 0;

// FIX #21 (09.10, two-tier mid-loop save): the current turn's LIVE message list (post-compression when a
// same-turn compression ran), published alongside the token baseline for the wrapper-side forced 90%
// session-memory save. Reference semantics: it is a live view of the host history array — the host owns and
// may mutate it; consumers must treat it as read-only, never splice or reassign it (the last-10 keepLast
// exclusion is applied caller-side at consumption time). null = no list published for this turn yet.
let publishedTurnMessages: ReadonlyArray<Record<string, unknown>> | null = null;

// ACTIVE-CHAT-MODEL FALLBACK (09.11, owner GO "fixen sofort"): last auto-detected chat model ID, published by
// promptPreprocessor's per-turn detection so the wrapper-side mid-loop saves (TIER-2 ~90% / M3 ~85%) can resolve a
// usable summary model when contextGuardSummaryModel is EMPTY. The SDK ToolCallContext exposes no model id (verified
// against the installed @lmstudio/sdk d.ts: only status/warn/signal/callId), so this cache — written where the chat
// model IS visible and read where it is not — is the only in-band channel. generateSessionContinuity() prefers config
// over fallback, so a configured summaryModel never sees this value; when detection fails on a later turn a stale id at
// worst degrades to the pre-fix null outcome (model load error → catch → skip). Cleared by clear() on chat reset
// (identity boundary); deliberately NOT cleared per-turn — see getActiveChatModelId docs.
let activeChatModelId = '';

// LATCH SUB-ITEM (30.10, owner GO — FIX #1 Part A guard): proven-unrecoverable window latch. Set by PART B in
// promptPreprocessor once a FRESH pullHistory() post-compression recount is still >= the compression threshold:
// at that point the host conversation history CANNOT be shrunk in-band (SDK contract — plugins only ever see a
// copy), so every mid-loop re-fire of TIER-2's forced save and FIX B's pre-emptive compression pipeline inside the
// agentic turn is provably no-op work (summarization spend, Arc-C regenerations/persists, host-history swaps over
// an immutable history) that repeats PER MODEL STEP — the host re-invokes toolsProvider() on every model step and
// each entry resets both wrapper latches (forcedSaveFiredThisTurn / midLoopCompactionFiredThisTurn). While set,
// the wrapper's two gate blocks skip with a one-time FAIL-LOUD log line instead. Lifecycle: cleared by clear()
// (chat reset — the only true in-band recovery) and re-evaluated at every PART B boundary run (each user message
// re-compresses + fresh-recounts; still >= threshold → re-set, below → clearUnrecoverableWindow() inside the same
// run). Deliberately NOT cleared by resetMidLoopDelta(): within one turn no legitimate path can shrink host history
// back under the threshold. Provenance (set tokens/limit) is retained for log lines only — never feeds gate math.
let unrecoverableWindow = false;
let unrecoverableSetTokens = 0;
let unrecoverableLimit = 0;
/** LATCH SUB-ITEM (30.10) — per-gate skip-log latch: once logUnrecoverableSkip(gate) has logged for the CURRENT window, later model steps stay silent (one line per gate per transition). Reset by every set/clear so a fresh window re-logs. */
let unrecoverableSkipLoggedTier2 = false;
let unrecoverableSkipLoggedFixb = false;
let unrecoverableSkipLoggedM3 = false; // M3-LATCH-GAP (09.11, owner GO A): the M3 auto-persist rung joins the per-gate skip-log one-shot family

// ==================== Token estimation ratio — SINGLE SOURCE OF TRUTH (TOKEN-DIVERGENCE arc, 10.11 owner GO) ====================
//
// MEASURED density of this plugin's agentic content mix: a verbatim session sample (prose + JSON tool output +
// code + log lines; 2,527 chars) probed against the live LM Studio server (/v1/chat/completions usage.prompt_tokens,
// max_output_tokens=1; qwen3.8-27b-ud; 10.10 probe at ~88% window fill): 787 prompt tokens = 3.21 chars/token.
// The prior ×0.25 (+10% buffer) assumed ~3.64 chars/token and undercounted dense agentic payloads by ~12–18%,
// the history-span half of the measured ctx_footer-vs-host-meter gap (the host meter counts EXACT model-tokenizer
// output; this estimate drives tier-1/tier-2 gates, the CTX-FOOTER projection and mid-loop delta bookkeeping).
// We divide by the FLOOR of the measured 3.2–3.4 band: conservative on exactly this workload (÷3.2 gives +0.4% vs
// probe truth), and prose-heavy content (~4 c/tok) overcounts slightly — deliberately, earlier compaction beats a
// 100% stall. The former separate +10% buffer is dropped because the base is now MEASURED rather than guessed;
// the band floor already carries the safety margin. contextGuard.ts and promptPreprocessor.ts import this function
// instead of hardcoding their own ratio (supersedes the old "MUST stay in sync" comment).

/** Agentic chars-per-token density (14.10 owner-set interim value — incident log below). */
// ⚠️ 14.10 (THREE EVENTS, ALL NOW RECORDED): (1) ~17:19 flip to 3.5 — authorship UNRESOLVED, sat ABOVE the measured
// band ceiling; (2) restore to 3.2 at ~17:46, VERIFIED by the owner's full gate GREEN ~17:49; (3) 3.45 written at
// 17:53:41 (file mtime; atomic .bak pair in the same second) — RESOLVED at owner handoff 18:06: the OWNER was
// rewriting this line themselves, not an external writer ("i was rewiting it to 3.45"). Value now set to 3.4 ON
// OWNER INSTRUCTION (18:0x, "for now") — INSIDE the live-measured 3.2–3.4 band (at its CEILING; slightly less
// conservative than the floor choice in the provenance block above) but NOT a probe-justified value: no new probe
// exists for it yet. tests/fix20_midloop_token_counting.test.ts expectations updated in THIS SAME dated edit per
// protocol below. When 3.4 is made permanent or a NEW probe justifies another density: change value + provenance
// block + fix20 expectations in ONE dated edit — never the value alone (that exact pattern produced today's three
// incidents). Do NOT touch this line outside that protocol; if it moves again, sweep src/ mtimes before anything else.
// 15.10 owner request ("make it user editable"): the density is now a plugin-menu setting (contextGuardAgenticDensity in
// config.ts), reseeded into this module state EVERY turn by promptPreprocessor.preprocess() and set directly in tests via
// setAgenticCharsPerToken(). The const below stays as the DEFAULT / fallback value — every estimation path goes through
// estimateTokensFromChars(), which reads the LIVE state, so a menu change takes effect next turn with zero source edits.
// 15.10 (~19:4x) DEFAULT RAISED 3.4 → 3.6 ON OWNER INSTRUCTION ("adjust the agentic chars per token scaler to 3.6 as default"):
// NOT probe-justified — it sits ABOVE the live-measured ~3.2–3.4 band, i.e. less conservative than both the measured floor choice and
// the prior interim; est() yields FEWER estimated tokens for identical chars ⇒ gates fire slightly LATER (owner's accepted trade).
// fix20 test edit: NONE — the 15.10 density-adaptive rewrite derives every expectation from getAgenticCharsPerToken() at runtime,
// which is exactly what the protocol's third step exists for; value + provenance moved in ONE dated edit per protocol above.
export const AGENTIC_CHARS_PER_TOKEN = 3.6; // DEFAULT only (raised 3.4 → 3.6 on 15.10 owner instruction ~19:4x) — live value is agenticCharsPerToken below

/** Live agentic chars-per-token density, user-editable via the contextGuardAgenticDensity menu field (15.10). */
let agenticCharsPerToken = AGENTIC_CHARS_PER_TOKEN;

export function setAgenticCharsPerToken(value: number): void {
  if (!Number.isFinite(value) || value <= 0) return; // reject non-finite/non-positive — keep last valid density (safe no-op)
  agenticCharsPerToken = value;
}

export function getAgenticCharsPerToken(): number {
  return agenticCharsPerToken;
}

/** Content pricing class for the shared estimator (CTX-EST A, 31.10). 'prose' = today's exact math;
 * 'highEntropy' applies a bounded conservative bias for log/hex/base64-dense tool payloads — the class that
 * undercounted ~3.2–3.9× in the 29.10 incident (guard est 41,116 tok vs LM Studio reject band 130,959–161,745). */
export type TokenEstimateClass = 'prose' | 'highEntropy';

// CTX-EST A (31.10, owner GO "Do A"): bounded high-entropy bias constants — SETTLED 01.11 via live probe
// (scripts/ctx_est_a_dense_payload_probe.mjs, /v1/chat/completions usage.prompt_tokens − wrapper-only baseline,
// max_tokens=1): effective band 1.307–1.670 c/tok on qwen3.8-27b-ud across 4 deterministic dense families @8k chars —
// HEXDUMP densest 1.307 · BASE64 1.352 · JSON_TOOL_RESULT 1.558 · LOGSTORM 1.670 (two byte-identical owner runs,
// ~18:20 + ~18:36 → determinism confirmed; run-1's empty model label was a script bug, since fixed). CONFIRMED at the
// default menu density: applied max(FLOOR 1.0, 3.6×BIAS 0.4)=1.44 c/tok sits INSIDE the measured band — no family below
// FLOOR (densest holds ~24% headroom) and worst-case residual undercount vs applied ≈9%, orders of magnitude better than
// the incident-derived 29.10 root-cause-C ratio (~0.9–1.1 c/tok, a 3.2–3.9× undercount that motivated this class). The
// density-provenance protocol (same discipline as the 15.10 agentic-density raise) is satisfied: BIAS/FLOOR are now
// PROBE-JUSTIFIED for qwen3.8-27b-ud; if a materially different tokenizer is probed, or the user's menu density leaves
// the measured band, re-run the script and revisit in ONE dated edit (value + provenance together — never one alone).
export const HIGH_ENTROPY_DENSITY_BIAS = 0.4;   // applied density = live density × 0.4 (default 3.6 ⇒ 1.44 c/tok)
export const HIGH_ENTROPY_DENSITY_FLOOR = 1.0;  // hard floor (c/tok) — estimator output is BOUNDED: est ≤ chars/1.0

export function estimateTokensFromChars(chars: number): number {
  return estimateTokensFromCharsOfClass(Math.max(0, chars), 'prose');
}

/** CTX-EST A — the APPLIED high-entropy chars-per-token density for the live menu value: min(live, max(FLOOR, live×BIAS)).
 * Extracted (Budget-Guard-Arc 05.11, M2) so the budget-aware spill cap in toolsProvider can invert tokens→chars with EXACTLY this class's
 * pricing instead of duplicating the clamp — single source of truth for both directions of the density math. */
export function getHighEntropyCharsPerToken(): number {
  // One-directional bias: only ever MORE conservative than the live menu value, never less — and bounded by
  // the floor so worst-case output for any input is chars / HIGH_ENTROPY_DENSITY_FLOOR. The user-editable
  // contextGuardAgenticDensity stays authoritative (15.10 contract preserved).
  return Math.min(agenticCharsPerToken, Math.max(HIGH_ENTROPY_DENSITY_FLOOR, agenticCharsPerToken * HIGH_ENTROPY_DENSITY_BIAS));
}

/** Class-aware variant (CTX-EST A). 'prose' is byte-identical to the pre-A estimator for every input. */
export function estimateTokensFromCharsOfClass(chars: number, cls: TokenEstimateClass): number {
  const density = cls === 'highEntropy' ? getHighEntropyCharsPerToken() : agenticCharsPerToken;
  return Math.ceil(Math.max(0, chars) / density);
}

/** Conditional verbose log for turn-state transitions (AI_TOOLBOX_DEBUG-gated; contextGuard convention). */
function debugDeltaLog(msg: string): void {
  if (process.env.AI_TOOLBOX_DEBUG) console.log(`[TokenStatsManager] [TURN]${msg}`);
}

// ==================== C compaction family (24.09): active tool-turn tracking + serialization drain ====================
//
// LM Studio calls preprocess() on user messages — and a new user message can arrive WHILE the previous
// turn's agentic tool loop is still executing (tool implementations run in this process; single-threaded
// event-loop interleaving). Without coordination, preprocess()'s resetMidLoopDelta() wipes the in-flight
// loop's payload delta and auto-compression may replace history underneath live tools. This counter is
// incremented/decremented by the toolsProvider instrumentation wrapper around EVERY tool implementation;
// a value > 0 means at least one tool call has started but not settled, so turn-level operations that
// mutate shared state (delta reset, history compression) must first DRAIN with a bounded wait.

/** Number of tool invocations currently in flight (started, not yet settled — success or throw). */
let activeToolCalls = 0;

export interface DrainWaitOptions {
  /** Poll interval in ms (default 250). */
  pollMs?: number;
  /** Hard wall-clock cap for the whole wait in ms (default 15000 — see docs on why bounded is mandatory). */
  maxWaitMs?: number;
  /** Injectable sampler (tests); defaults to TokenStatsManager.getActiveToolCalls. */
  sampleActive?: () => number;
  /** Injectable sleeper (tests); defaults to a real setTimeout promise. */
  sleep?: (ms: number) => Promise<void>;
}

/** Default drain cap: one polling cycle per tool call is typical; 15s covers slow web/file tools without
 * ever being able to block a user message indefinitely (fail-loud on timeout, documented below). */
export const DEFAULT_DRAIN_MAX_WAIT_MS = 15_000;

/** Pure decision: should a turn-level state mutation wait? (active > 0 → yes.) Exported for tests. */
export function shouldDeferForActiveTools(activeToolCalls: number): boolean {
  return activeToolCalls > 0;
}

/**
 * Bounded drain: polls until no tool calls are in flight, then resolves true; if the cap is reached with
 * work still running, it logs LOUD and resolves false (caller proceeds — compression must never deadlock
 * a user message; the race is recorded in the log per fail-loud house rule). Injectable clock/sampler make
 * this testable without SDK mocks (F1-helper style).
 */
export async function drainActiveToolTurns(options: DrainWaitOptions = {}): Promise<boolean> {
  const pollMs = options.pollMs ?? 250;
  const maxWaitMs = options.maxWaitMs ?? DEFAULT_DRAIN_MAX_WAIT_MS;
  const sampleActive = options.sampleActive ?? (() => TokenStatsManager.getActiveToolCalls());
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  if (!shouldDeferForActiveTools(sampleActive())) return true; // fast path — nothing in flight

  const startedAt = Date.now();
  console.warn(`[TokenStatsManager] [DRAIN] tool turn(s) still active (${sampleActive()}) — deferring turn-level state mutation (bounded wait ≤ ${maxWaitMs}ms)`);
  for (;;) {
    if (!shouldDeferForActiveTools(sampleActive())) {
      console.log('[TokenStatsManager] [DRAIN] tool loop drained cleanly before compression/reset');
      return true;
    }
    if (Date.now() - startedAt >= maxWaitMs) {
      console.error(
        `[TokenStatsManager] [DRAIN] FAIL-LOUD: cap (${maxWaitMs}ms) reached with ${sampleActive()} tool call(s) STILL in flight — ` +
        'proceeding anyway; history/delta state for this turn may race. Inspect logs and consider raising compactionDrainMaxWaitMs.',
      );
      return false; // fail loud, degrade safe — NEVER block the user's message forever
    }
    await sleep(pollMs);
  }
}

/** Measure the character size of an arbitrary tool result payload (string | string[] | object → JSON). */
function measurePayloadChars(payload: unknown): number {
  if (typeof payload === 'string') return payload.length;
  if (Array.isArray(payload)) {
    let sum = 0;
    for (const item of payload) {
      sum += typeof item === 'string' ? item.length : JSON.stringify(item)?.length ?? 0;
    }
    return sum;
  }
  try {
    return JSON.stringify(payload)?.length ?? 0;
  } catch {
    // Non-serializable (e.g., circular refs) — fall back to a rough size estimate
    return String(payload).length;
  }
}

export class TokenStatsManager {
  /**
   * Get the most recent prediction stats from LM Studio's inference engine.
   * Returns null if no prediction has been made yet.
   */
  static getLastPredictionStats(): LLMPredictionStats | null {
    return lastPredictionStats;
  }

  /**
   * Update with fresh stats from a PredictionResult.
   * Call this after awaiting on model.respond() or model.complete().result()
   */
  static updateFromPredictionResult(stats: LLMPredictionStats): void {
    lastPredictionStats = stats;

    // 🔥 Cumulative tracking: add to session total so it matches LM Studio's sidebar
    if (stats.totalTokensCount != null && stats.totalTokensCount > 0) {
      cumulativeTotalTokens += stats.totalTokensCount;
    }
    
    // Notify all listeners about the new stats
    for (const listener of listeners) {
      try {
        listener(stats);
      } catch (error) {
        console.error('[TokenStatsManager] Error in stats change listener:', error);
      }
    }
  }

  /**
   * Register a callback to receive updates when new prediction stats become available.
   * Returns a cleanup function that removes the listener.
   */
  static addChangeListener(listener: StatsChangeListener): () => void {
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }

  /**
   * Calculate total tokens from the most recent prediction.
   * Falls back to REST API → estimation if no stats available.
   */
  static getTotalTokens(estimatedCount: number): number {
    // Priority 1: SDK PredictionResult.stats
    if (lastPredictionStats?.totalTokensCount != null) {
      return lastPredictionStats.totalTokensCount;
    }

    // Priority 2: REST API accumulated session total
    const restApiTotal = lmStudioApi.getSessionTotalTokens();
    if (restApiTotal > 0) {
      return restApiTotal;
    }

    // Fallback: estimation
    return estimatedCount;
  }

  /**
   * Calculate prompt tokens from the most recent prediction.
   * Falls back to REST API → estimation if no stats available.
   */
  static getPromptTokens(estimatedCount: number): number {
    if (lastPredictionStats?.promptTokensCount != null) {
      return lastPredictionStats.promptTokensCount;
    }

    // Priority 2: REST API last request prompt tokens
    const lastRestApi = lmStudioApi.getLastTokenData();
    if (lastRestApi?.promptTokens != null) {
      return lastRestApi.promptTokens;
    }

    // Fallback: estimation
    return estimatedCount;
  }

  /**
   * Calculate predicted tokens from the most recent prediction.
   */
  static getPredictedTokens(): number | undefined {
    if (lastPredictionStats?.predictedTokensCount != null) {
      return lastPredictionStats.predictedTokensCount;
    }

    // Priority 2: REST API last request completion tokens
    const lastRestApi = lmStudioApi.getLastTokenData();
    if (lastRestApi?.completionTokens != null) {
      return lastRestApi.completionTokens;
    }

    return undefined;
  }

  /**
   * Get the cumulative token count across all predictions in this session.
   * Matches LM Studio's sidebar total exactly.
   */
  static getCumulativeTotal(): number {
    return cumulativeTotalTokens;
  }

  /**
   * Record the payload size of a tool result returned mid-turn (FIX #20 A1).
   * Call this for every tool invocation so the AutoTracker's mid-loop guard can see how much
   * context each tool call is consuming BEFORE the next user message triggers a recount.
   * @returns estimated tokens added to the current turn's delta
   * CTX-EST A (31.10): deltas are priced in the 'highEntropy' class (bounded by HIGH_ENTROPY_DENSITY_FLOOR) —
   * tool payloads are exactly the log/hex-dense content that undercounted 29.10; native recounts stay prose-priced.
   */
  static recordToolResult(toolName: string, payload: unknown): number {
    const chars = measurePayloadChars(payload);
    midLoopDeltaChars += chars;
    const estTokens = estimateTokensFromCharsOfClass(chars, 'highEntropy'); // CTX-EST A — bounded high-entropy pricing (see class docblock)
    midLoopEstTokens += estTokens;
    const deltaLogBase = `[AutoTracker] [DELTA] +${estTokens} tok from ${toolName} (${chars.toLocaleString('en-US')} chars, turn total ≈ ${midLoopEstTokens.toLocaleString('en-US')} tok`;
    if (turnBaselineTokens > 0) {
      // Live whole-chat estimate: authoritative TokenCheck baseline for this turn + estimated tool payloads since.
      console.log(`${deltaLogBase} | chat used ≈ ${(turnBaselineTokens + midLoopEstTokens).toLocaleString('en-US')} tok)`);
    } else {
      // No baseline published (ContextGuard recount failed -> safe no-op guard): omit combined value to avoid misleading numbers.
      console.log(`${deltaLogBase})`);
    }
    return estTokens;
  }

  /** Estimated tokens accumulated by tool results since the last preprocess() call. */
  static getMidLoopDeltaTokens(): number {
    return midLoopEstTokens;
  }

  /** Raw character sum of tool results this turn (diagnostics / tests). */
  static getMidLoopDeltaChars(): number {
    return midLoopDeltaChars;
  }

  // --- C compaction family: active tool-turn tracking (serialization guard) ---

  /** Mark a tool call as in flight. Called by the toolsProvider wrapper BEFORE the implementation runs. */
  static beginToolCall(toolName?: string): void {
    activeToolCalls += 1;
    debugDeltaLog(`[BEGIN] ${toolName ?? 'unknown_tool'} (active=${activeToolCalls})`);
  }

  /** Mark a tool call as settled (success OR throw — MUST run in the wrapper's finally). */
  static endToolCall(toolName?: string): void {
    activeToolCalls = Math.max(0, activeToolCalls - 1);
    debugDeltaLog(`[END] ${toolName ?? 'unknown_tool'} (active=${activeToolCalls})`);
  }

  /** True while at least one tool call is executing — the serialization guard's turn-state signal. */
  static getActiveToolCalls(): number {
    return activeToolCalls;
  }

  /** Test/teardown hook: forget any in-flight calls (mirrors resetMidLoopDelta semantics). */
  static clearActiveToolCallsForTests(): void {
    activeToolCalls = 0;
  }

  /**
   * Reset per-turn evaluation state. MUST be called at the start of every preprocess() run: by that point
   * the previous turn's tool results are part of pullHistory() and counted natively — keeping the old
   * delta would double-count them (FIX #20 A1 invariant). Also zeroes baseline/limit so a turn in which
   * ContextGuard fails to recount gets a SAFE no-op mid-loop guard (maxTokens = 0) instead of one that
   * evaluates growth against stale numbers from the previous turn.
   */
  static resetMidLoopDelta(): void {
    if (midLoopEstTokens > 0) {
      console.log(`[AutoTracker] [DELTA] Resetting turn delta (~${midLoopEstTokens.toLocaleString()} tok now counted natively via history)`);
    }
    midLoopDeltaChars = 0;
    midLoopEstTokens = 0;
    turnBaselineTokens = 0;
    maxContextTokens = 0;
    publishedTurnMessages = null; // FIX #21 (09.10) — stale-list hazard: previous turn's array would otherwise survive the reset window
  }

  /**
   * FIX #20 A2 — publish the turn's evaluation baseline + model context limit for the mid-loop guard.
   * Called from promptPreprocessor.preprocess() right after ContextGuard computed both values.
   */
  static setTurnEvaluation(baselineTokens: number, maxTokens: number): void {
    turnBaselineTokens = Math.max(0, baselineTokens);
    maxContextTokens = Math.max(0, maxTokens);
  }

  /**
   * FIX #21 (09.10) — publish the current turn's live message list for the mid-loop forced session-memory
   * save. Called from promptPreprocessor.preprocess() at the SAME single finally point as setTurnEvaluation()
   * (post-compression when a same-turn compression ran; null whenever this turn did not reach that point).
   * The stored reference is LIVE — callers must treat it as read-only and never hold onto it across turns:
   * resetMidLoopDelta()/clear() drop it, so anything captured before the next preprocess() start is stale.
   */
  static setTurnMessages(messages: ReadonlyArray<Record<string, unknown>> | null): void {
    publishedTurnMessages = messages;
  }

  /** FIX #21 (09.10) — message list published by this turn's preprocess(); null until the publish point runs. */
  static getTurnMessages(): ReadonlyArray<Record<string, unknown>> | null {
    return publishedTurnMessages;
  }

  /**
   * ACTIVE-CHAT-MODEL FALLBACK (09.11) — publish the auto-detected chat model ID for mid-loop save fallback. Called
   * from promptPreprocessor's per-turn detection IMMEDIATELY after a successful auto-detect (the only branch where a
   * real chat-model id exists: configured-summaryModel branches resolve inside generateSessionContinuity() itself).
   * Non-empty ids overwrite; empty is rejected so an undetected turn can never erase a previous, still-valid id.
   */
  static setActiveChatModelId(id: string): void {
    if (id) activeChatModelId = id;
  }

  /**
   * ACTIVE-CHAT-MODEL FALLBACK (09.11) — last successfully auto-detected chat model ID ('' until the first detect).
   * Consumed by toolsProvider's TIER-2 / M3 mid-loop save calls as generateSessionContinuity's fallbackModelId when
   * contextGuardSummaryModel is empty. NOT reset per-turn (unlike turnBaselineTokens etc.): both consumers only run
   * AFTER this turn's preprocess published a baseline, so the value is same-turn-fresh whenever it matters; clearing
   * on a detection failure would lose a working fallback for no gate-visible benefit. Stale-id worst case = model
   * load error → catch → null (identical outcome to pre-fix behavior). Chat reset (clear()) erases it — identity boundary.
   */
  static getActiveChatModelId(): string {
    return activeChatModelId;
  }

  /** Test hook: force/erase the cached chat-model id (mirrors setUnrecoverableWindowForTests). */
  static setActiveChatModelIdForTests(id: string): void {
    activeChatModelId = id;
  }

  // --- LATCH SUB-ITEM (30.10): proven-unrecoverable window state for the wrapper-side mid-loop gates ---

  /**
   * LATCH SUB-ITEM (30.10) — mark this chat's context window as PROVEN UNRECOVERABLE: called from PART B in
   * promptPreprocessor when its FRESH pullHistory() post-compression recount is still >= the compression threshold.
   * While set, toolsProvider's TIER-2 forced-save gate and FIX B pre-emptive compression gate skip with a one-time
   * FAIL-LOUD log line (both would otherwise re-fire on EVERY model step — per-step provider re-entry resets their
   * own latches — spending summarization predictions + Arc-C regenerations on work that cannot shrink host history).
   * The provenance numbers are retained for the skip log lines only, never fed into gate math. Setting is idempotent;
   * non-finite/≤0 values keep the previously recorded provenance (callers may pass what they lack as 0).
   */
  static setUnrecoverableWindow(tokens: number, limit: number): void {
    const firstTime = !unrecoverableWindow;
    unrecoverableWindow = true;
    unrecoverableSkipLoggedTier2 = false; // fresh transition ⇒ the per-gate skip line may fire exactly once in this window
    unrecoverableSkipLoggedFixb = false;
    unrecoverableSkipLoggedM3 = false;
    if (Number.isFinite(tokens) && tokens > 0) unrecoverableSetTokens = Math.round(tokens);
    if (Number.isFinite(limit) && limit > 0) unrecoverableLimit = Math.round(limit);
    console.log(
      `[TokenStatsManager] [LATCH-UNRECOVERABLE] ${firstTime ? 'SET' : 're-affirmed'} — post-compression fresh recount ` +
      `${unrecoverableSetTokens.toLocaleString('en-US')} tok vs limit ${unrecoverableLimit.toLocaleString('en-US')} tok (>= threshold): ` +
      'mid-loop TIER-2 save + FIX B compression suppressed until chat reset or a PART B boundary recounts below threshold',
    );
  }

  /**
   * LATCH SUB-ITEM (30.10) — clear the proven-unrecoverable latch: called from PART B when its FRESH post-compression
   * recount lands BELOW the compression threshold (recovery by a bigger window / model switch is the only legitimate
   * in-band path), and by clear() on chat reset. Logs once per transition so log lines never repeat every boundary.
   */
  static clearUnrecoverableWindow(): void {
    if (!unrecoverableWindow) return; // no-op when already clear — keeps the log line one-shot per transition
    unrecoverableWindow = false;
    unrecoverableSetTokens = 0;
    unrecoverableLimit = 0;
    unrecoverableSkipLoggedTier2 = false;
    unrecoverableSkipLoggedFixb = false;
    unrecoverableSkipLoggedM3 = false;
    console.log('[TokenStatsManager] [LATCH-UNRECOVERABLE] CLEARED — mid-loop gates re-arm (PART B recounted below threshold or chat reset)');
  }

  /** LATCH SUB-ITEM (30.10) — true while the host history is proven unrecoverable; consumed by both wrapper gate blocks. */
  static getUnrecoverableWindow(): boolean {
    return unrecoverableWindow;
  }

  /**
   * LATCH SUB-ITEM (30.10) — one-time-per-window FAIL-LOUD skip log for a suppressed mid-loop gate: the FIRST call
   * after any set/clear transition logs; every later call in the same window is a no-op (per-gate state
   * unrecoverableSkipLoggedTier2/Fixb), so at most one line per gate per unrecoverable window lands in the host log
   * while later model steps stay silent instead of re-spending the pipeline. Exported for tests to pin the exact
   * line contract and to prove silence-on-repeat.
   */
  static logUnrecoverableSkip(gate: 'tier2' | 'fixb' | 'm3'): void {
    // LATCH SUB-ITEM (30.10 gate-4 fix): the skip line is only meaningful WHILE the latch holds — a call after any
    // clear (PART B recovery or chat reset) would claim an unrecoverable window that no longer exists, and its static
    // phrasing ("window proven unrecoverable this chat") would leave a misleading record with zero provenance behind.
    // Production reach in the CLEAR state is real, not hypothetical: with latch clear the wrapper's mirror else-if can
    // still be reached on a pass where the original gate was already consumed (its per-entry flag set) while the
    // threshold remains crossed — exactly why this guard returns silent without consuming one-shot state.
    if (!unrecoverableWindow) return;
    // One-shot enforcement (the docblock contract): the per-gate flag is set by the first call after any transition,
    // so later model steps in the same window stay silent. Both flags reset on every set/clear above.
    if (gate === 'tier2') {
      if (unrecoverableSkipLoggedTier2) return; // one-shot consumed for this transition — silence thereafter
      unrecoverableSkipLoggedTier2 = true;
    } else if (gate === 'fixb') {
      if (unrecoverableSkipLoggedFixb) return;
      unrecoverableSkipLoggedFixb = true;
    } else {
      // M3-LATCH-GAP (09.11, owner GO A): the M3 auto-persist rung takes its own one-shot flag — same contract as its siblings.
      if (unrecoverableSkipLoggedM3) return;
      unrecoverableSkipLoggedM3 = true;
    }
    const provenance =
      unrecoverableSetTokens > 0 && unrecoverableLimit > 0
        ? ` (proven ${unrecoverableSetTokens.toLocaleString('en-US')}/${unrecoverableLimit.toLocaleString('en-US')} tok at set)`
        : '';
    console.warn(
      `[TokenStatsManager] [LATCH-UNRECOVERABLE] FAIL-LOUD: mid-loop ${gate === 'tier2' ? 'TIER-2 forced save' : gate === 'fixb' ? 'FIX B compression' : 'M3 auto-persist rung'} ` +
      `skipped — window proven unrecoverable this chat${provenance}; the pipeline cannot shrink host history in-band (plugin-API limitation). ` +
      'Re-arm is owned by a PART B boundary recount or chat reset only. Suppressed until then.',
    );
  }

  /** Test hook: force the latch to a known state (mirrors clearActiveToolCallsForTests; resets provenance too). */
  static setUnrecoverableWindowForTests(value: boolean): void {
    unrecoverableWindow = value;
    unrecoverableSetTokens = 0;
    unrecoverableLimit = 0;
    unrecoverableSkipLoggedTier2 = false;
    unrecoverableSkipLoggedFixb = false;
    unrecoverableSkipLoggedM3 = false;
  }

  /** FIX #20 A2 — token count at the start of the current turn (before any tool calls). */
  static getTurnBaseline(): number {
    return turnBaselineTokens;
  }

  /** FIX #20 A2 — model context limit used by the mid-loop guard percentage math. */
  static getMaxContextTokens(): number {
    return maxContextTokens;
  }

  /**
   * Reset stats cache and REST API session state (e.g., on chat reset).
   */
  static clear(): void {
    lastPredictionStats = null;
    activeChatModelId = ''; // ACTIVE-CHAT-MODEL FALLBACK (09.11) — chat reset is the identity boundary for the cached id
    lmStudioApi.resetSessionState();
    cumulativeTotalTokens = 0; // 🔥 Reset cumulative tracker on new session
    midLoopDeltaChars = 0; // FIX #20 A1 — fresh session, no in-flight tool loop
    midLoopEstTokens = 0;
    turnBaselineTokens = 0; // FIX #20 A2 — baseline/limit republished at next preprocess()
    maxContextTokens = 0;
    publishedTurnMessages = null; // FIX #21 (09.10) — chat reset ⇒ previous conversation's array must not leak into the new one
    activeToolCalls = 0; // C compaction (24.09) — fresh session ⇒ no in-flight tool loop
    unrecoverableWindow = false; // LATCH SUB-ITEM (30.10) — chat reset is the only true in-band recovery: fresh history, gates re-arm (direct assign keeps clear() silent like every other state zero here)
    unrecoverableSetTokens = 0;
    unrecoverableLimit = 0;
    // LATCH SUB-ITEM (30.10 gate-4 fix): the per-gate skip-log latches are PART of the reset — a fresh chat's
    // first suppressed gate must be able to log again exactly like every other one-shot in this method. clear()
    // is silent by design here too, so the flags alone carry the re-arm; no line change.
    unrecoverableSkipLoggedTier2 = false;
    unrecoverableSkipLoggedFixb = false;
    unrecoverableSkipLoggedM3 = false; // M3-LATCH-GAP (09.11): chat reset re-arms the M3 skip line with its siblings
  }

  /**
   * Get a human-readable summary of the latest prediction.
   * Includes both SDK stats, REST API data, and cumulative session total.
   */
  static getSummary(): string | null {
    const parts: string[] = [];
    
    // Add SDK stats if available
    if (lastPredictionStats) {
      if (lastPredictionStats.promptTokensCount != null) {
        parts.push(`Prompt: ${lastPredictionStats.promptTokensCount.toLocaleString()} tokens`);
      }
      if (lastPredictionStats.predictedTokensCount != null) {
        parts.push(`Generated: ${lastPredictionStats.predictedTokensCount.toLocaleString()} tokens`);
      }
      if (lastPredictionStats.totalTokensCount != null) {
        parts.push(`Total: ${lastPredictionStats.totalTokensCount.toLocaleString()} tokens`);
      }
      if (lastPredictionStats.tokensPerSecond != null && isFinite(lastPredictionStats.tokensPerSecond)) {
        parts.push(`Speed: ${lastPredictionStats.tokensPerSecond.toFixed(1)} tok/s`);
      }
    }

    // Add REST API summary if available (separate prefix)
    const restApiSummary = lmStudioApi.getTokenSummary();
    if (restApiSummary) {
      // Remove the "[LM Studio REST API]" prefix to merge cleanly
      parts.push(restApiSummary.replace('[LM Studio REST API] ', ''));
    }

    // 🔥 Add cumulative session total for sidebar matching
    const cumTotal = this.getCumulativeTotal();
    if (cumTotal > 0) {
      parts.push(`Session Total: ${cumTotal.toLocaleString()} tokens`);
    }

    return parts.length > 0 ? `[LM Studio Stats] ${parts.join(' | ')}` : null;
  }

  /**
   * Check if we have fresh stats available (less than 30 seconds old).
   */
  static hasFreshStats(): boolean {
    // Since we don't track timestamps, just check if stats exist
    return lastPredictionStats !== null;
  }
}
