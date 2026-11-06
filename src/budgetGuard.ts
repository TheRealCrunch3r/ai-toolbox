/**
 * budgetGuard — Budget-Guard-Arc decision core (owner GO 04.11): M1 pre-call cost gate on the READ path +
 * M2 budget-aware spill decision for the wrapper's 'A spill pattern' block (toolsProvider.ts). Both decisions are
 * pure and hermetically testable; they consume the SAME shared projection source as the wrapper's other three consumers.
 *
 * Deterministic context-limit protection for the READ path: BEFORE a read tool produces its payload,
 * predict the token cost of that payload (file size × bounded high-entropy density) and compare it against
 * the turn's remaining budget from TokenStatsManager — the SAME shared projection source M2 (budget-aware
 * spill, toolsProvider.ts) consumes. When the projected post-read usage would cross the advisory threshold,
 * the read tool returns a self-describing ADVISORY instead of dumping the file into context.
 *
 * Invariants (plan step 2):
 * - READ-ONLY: consults fs.stat + TokenStatsManager state; never mutates any store or shared turn state.
 * - FAIL-OPEN: stat errors, unknown/unclear sizes and every unexpected exception degrade to `allowed` —
 *   a guard must never break an otherwise valid read (legacy behavior stays reachable).
 * - NO FALSE-POSITIVE FLOOD: with no published baseline/limit (maxContextTokens = 0 before the first
 *   preprocess() run) the gate is silent, exactly like the wrapper mid-loop gates.
 *
 * Config wiring (step 5): thresholds arrive via register*(config); when config.budgetGuard.enabled !== true
 * every entry point short-circuits to `allowed` — byte-identical legacy behavior without a code revert.
 */

import type { PluginConfig } from './config.js';
import { TokenStatsManager, estimateTokensFromCharsOfClass, getHighEntropyCharsPerToken } from './tokenStatsManager.js';
// M2 (05.11): the CTX-FOOTER's fixed self-size — the same term the wrapper's shared projection adds for its other consumers;
// reserved inside M2's budget so a post-spill preview plus a later gated footer still lands under the gate edge.
import { FOOTER_TOKEN_ESTIMATE } from './utils/contextUsageFooter.js';

/** Advisory threshold default: 80% of the context limit (owner ruling 04.11 — "80"). */
export const BUDGET_GUARD_ADVISORY_THRESHOLD_PCT = 80;

/** Outcome of a pre-call cost evaluation for one read tool. */
export interface BudgetGateResult {
  /** false → the caller MUST return the advisory instead of the file payload. */
  allowed: boolean;
  /** Predicted token cost of the payload this call would produce (bounded high-entropy class). */
  estimatedTokens?: number;
  /** Turn baseline + mid-loop tool-payload delta (shared projection source, M2 same). */
  usedTokens?: number;
  /** Model context limit from TokenStatsManager (0 = not published yet → gate stays silent). */
  limitTokens?: number;
  /** Predicted usage after this call lands: baseline + delta + estimatedTokens. */
  projectedTokens?: number;
}

export interface PreCallCostInput {
  /** Bounded character count of the payload THIS call would actually inject (see per-tool bounds below). */
  expectedChars: number;
  /** Human label for log lines / advisory text, e.g. "read_file". */
  toolName?: string;
}

export interface BudgetGuardOptions {
  /** Config object from register*(config); budgetGuard block may be absent on legacy saved configs. */
  config?: PluginConfig | null;
  /** Injectable (tests): defaults to the live TokenStatsManager turn state. */
  getState?: () => { baselineTokens: number; midLoopDeltaTokens: number; maxContextTokens: number };
}

/** Resolve the advisory threshold from config with the ruling default as fallback (legacy-safe). */
export function resolveAdvisoryThresholdPct(config?: PluginConfig | null): number {
  const pct = config?.budgetGuard?.advisory_threshold_pct;
  return typeof pct === 'number' && Number.isFinite(pct) && pct > 0 ? pct : BUDGET_GUARD_ADVISORY_THRESHOLD_PCT;
}

/** Read TokenStatsManager turn state (single seam so tests can stub it). */
function defaultGateState(): { baselineTokens: number; midLoopDeltaTokens: number; maxContextTokens: number } {
  return {
    baselineTokens: TokenStatsManager.getTurnBaseline(),
    midLoopDeltaTokens: TokenStatsManager.getMidLoopDeltaTokens(),
    maxContextTokens: TokenStatsManager.getMaxContextTokens(),
  };
}

/**
 * M1 core decision — pure and hermetically testable.
 *
 * projected = baseline + midLoopDelta + estimate(expectedChars, 'highEntropy')
 * advisory fires when limit > 0 AND projected > limit × (advisory_threshold_pct / 100).
 *
 * 'highEntropy' is the bounded conservative class (applied density floor 1.0 c/tok; default ≈1.44): read
 * payloads are tool content — exactly the log/hex-dense family that undercounted in the 29.10 incident, so
 * they price identically to M2's shared projection and to TokenStatsManager.recordToolResult deltas.
 */
export function evaluatePreCallCost(input: PreCallCostInput, options: BudgetGuardOptions = {}): BudgetGateResult {
  const enabled = options.config?.budgetGuard?.enabled === true;
  if (!enabled) return { allowed: true }; // byte-identical legacy path — no math, no log, no behavior change

  const state = (options.getState ?? defaultGateState)();
  const limitTokens = Number.isFinite(state.maxContextTokens) ? Math.max(0, state.maxContextTokens) : 0;
  if (!(limitTokens > 0)) return { allowed: true }; // silent before the first preprocess() publishes a limit

  const chars = Number.isFinite(input.expectedChars) && input.expectedChars > 0 ? Math.floor(input.expectedChars) : 0;
  const estimatedTokens = estimateTokensFromCharsOfClass(chars, 'highEntropy');
  const usedTokens = (Number.isFinite(state.baselineTokens) ? state.baselineTokens : 0)
    + (Number.isFinite(state.midLoopDeltaTokens) ? state.midLoopDeltaTokens : 0);
  const projectedTokens = usedTokens + estimatedTokens;
  const thresholdPct = resolveAdvisoryThresholdPct(options.config ?? null);

  if (projectedTokens > limitTokens * (thresholdPct / 100)) {
    console.log(
      `[BudgetGuard] [M1-ADVISORY] ${input.toolName ?? 'read'} pre-call gate: projected ` +
      `${projectedTokens.toLocaleString('en-US')} tok exceeds ${thresholdPct}% of limit ` +
      `${limitTokens.toLocaleString('en-US')} (baseline+delta ≈ ${usedTokens.toLocaleString('en-US')}, payload est. ` +
      `≈ ${estimatedTokens.toLocaleString('en-US')} tok from ${chars.toLocaleString('en-US')} chars) — advisory returned instead of full read`,
    );
    return { allowed: false, estimatedTokens, usedTokens, limitTokens, projectedTokens };
  }
  return { allowed: true, estimatedTokens, usedTokens, limitTokens, projectedTokens };
}

/**
 * Self-describing advisory body — explains WHAT was withheld, WHY (numbers), and HOW the caller can still
 * get the data in a controlled way. Returned verbatim as `data` so no information is lost for the model.
 */
export function buildBudgetAdvisory(gate: BudgetGateResult, thresholdPct: number = BUDGET_GUARD_ADVISORY_THRESHOLD_PCT): string {
  const used = gate.usedTokens ?? 0;
  const est = gate.estimatedTokens ?? 0;
  const limit = gate.limitTokens ?? 0;
  return (
    `[BUDGET GUARD — context budget advisory]\n` +
    `This read was withheld: the file's content (~${est.toLocaleString('en-US')} estimated tokens) would push the ` +
    `context window to ~${(gate.projectedTokens ?? used + est).toLocaleString('en-US')} tokens, beyond the configured ` +
    `budget threshold of ${limit > 0 ? Math.round(limit * (thresholdPct / 100)).toLocaleString('en-US') : '—'} tokens ` +
    `(turn baseline + accumulated tool results ≈ ${used.toLocaleString('en-US')} tokens). Reading it in full would risk a context overflow.\n` +
    `To proceed, read the data in controlled steps instead:\n` +
    `- use read_file_chunked with a SMALL chunk_size and max_chunks (e.g. 20000 / 1) for the part you actually need;\n` +
    `- use ripgrep or pattern_scan to locate specific content first, then target only that region;\n` +
    `- summarize what you already know about this file before requesting more of it.`
  );
}



// ==================== M2 Budget-aware Spill — budget-relative cap for the wrapper's 'A spill pattern' block (05.11) ====================
//
// The toolsProvider instrumentation wrapper computes ONE shared projection per tool result and hands it to consumers with INDEPENDENT
// gates: the CTX-FOOTER (≥50%), tier-2 forced save (user-configured %, default 90), FIX-B pre-emptive compaction (95%) — and, from this
// arc on, M2 below as their fourth consumer. M2's job (spike order 04.11): when the shared projection would cross
// limit×(1−safety_margin_pct/100) (default ⇒ 92% of the window), cap the INLINE spill at a budget-relative char count —
// floor(remainingBudgetTokens / applied high-entropy density) — so the post-spill preview still fits inside the remaining budget.
// The stricter bound always wins: effectiveMax = min(absolute compaction cap, budgetChars). The existing spillTextIfNeeded() already
// stores the full payload verbatim on disk and returns head/tail preview + opaque SHA-256 locator (the pointer requirement), so this
// module only adds the BUDGET decision + its self-describing marker line; nothing here mutates shared turn state.

/** Safety-margin default (%): reserve kept out of the context limit for all M2 math — derived from the owner ruling "92" on 04.11:
 * limit×(1−8/100)=limit×0.92, i.e. structurally consistent with DEFAULT_CONFIG.spill_threshold_pct=92 (see config.ts provenance). */
export const BUDGET_GUARD_SAFETY_MARGIN_PCT = 8;

/** Marker written into compacted content by M2 — model-visible self-description distinguishing a budget spill from an absolute-cap spill. */
export const BUDGET_GUARD_SPILL_MARKER = 'SPILLED by budget guard';

export interface BudgetSpillInput {
  /** Character count of the string result about to be spill-checked (the wrapper's `result.length` at its 'A spill pattern' block). */
  payloadChars: number;
  /** Human label for log lines, e.g. "read_file". */
  toolName?: string;
}

export interface BudgetSpillDecision {
  /** true → the caller MUST spill with `effectiveMax = min(absoluteCap, budgetChars)` and attach the M2 marker. */
  shouldBudgetSpill: boolean;
  /** Budget-relative char cap floor(remainingTokens / applied high-entropy density); meaningful only when shouldBudgetSpill is true. */
  budgetChars?: number;
  /** limit×(1−margin/100) − baseline − midLoopDelta (footer self-size already reserved in the edge math). */
  remainingBudgetTokens?: number;
  /** Model context limit from TokenStatsManager (0 = not published yet → gate stays silent). */
  limitTokens?: number;
  /** Predicted usage after this result lands: baseline + delta + payload estimate + footer self-size. */
  projectedTokens?: number;
}

/** Resolve the safety margin from config with the ruling default as fallback (legacy-safe, same shape as resolveAdvisoryThresholdPct). */
export function resolveSafetyMarginPct(config?: PluginConfig | null): number {
  const pct = config?.budgetGuard?.safety_margin_pct;
  return typeof pct === 'number' && Number.isFinite(pct) && pct >= 0 ? pct : BUDGET_GUARD_SAFETY_MARGIN_PCT;
}

/** Read TokenStatsManager turn state (single seam so tests can stub it). */
function defaultSpillState(): { baselineTokens: number; midLoopDeltaTokens: number; maxContextTokens: number } {
  return {
    baselineTokens: TokenStatsManager.getTurnBaseline(),
    midLoopDeltaTokens: TokenStatsManager.getMidLoopDeltaTokens(),
    maxContextTokens: TokenStatsManager.getMaxContextTokens(),
  };
}

export interface BudgetSpillOptions extends BudgetGuardOptions {
  /** Injectable (tests): the CTX-FOOTER self-size reserved inside the budget; defaults to FOOTER_TOKEN_ESTIMATE. */
  footerTokenEstimate?: number;
}

/**
 * M2 core decision — pure and hermetically testable. Mirrors the wrapper's shared projection term-for-term (the 4th consumer):
 * projected = baseline + midLoopDelta + estimate(payloadChars, 'highEntropy') + footer self-size.
 * Fires when limit > 0 AND projected > limit × (1 − safetyMargin/100) (default margin 8 ⇔ the owner-ruled "92" edge).
 * budgetChars = floor(remaining / applied high-entropy density), remaining = edgeTokens − baseline − midLoopDelta − footer;
 * clamped to 0 when nothing fits. The wrapper then applies the STRICTER bound: min(absolute compaction cap, budgetChars).
 */
export function evaluateBudgetSpill(input: BudgetSpillInput, options: BudgetSpillOptions = {}): BudgetSpillDecision {
  if (options.config?.budgetGuard?.enabled !== true) return { shouldBudgetSpill: false }; // byte-identical legacy path

  const state = (options.getState ?? defaultSpillState)();
  const limitTokens = Number.isFinite(state.maxContextTokens) ? Math.max(0, state.maxContextTokens) : 0;
  if (!(limitTokens > 0)) return { shouldBudgetSpill: false }; // silent before the first preprocess() publishes a limit

  const margin = resolveSafetyMarginPct(options.config ?? null);
  const baseline = Number.isFinite(state.baselineTokens) ? state.baselineTokens : 0;
  const delta = Number.isFinite(state.midLoopDeltaTokens) ? state.midLoopDeltaTokens : 0;
  const chars = Number.isFinite(input.payloadChars) && input.payloadChars > 0 ? Math.floor(input.payloadChars) : 0;
  const payloadEstimate = estimateTokensFromCharsOfClass(chars, 'highEntropy');
  const footerTokens = typeof options.footerTokenEstimate === 'number' && Number.isFinite(options.footerTokenEstimate) && options.footerTokenEstimate >= 0 ? options.footerTokenEstimate : FOOTER_TOKEN_ESTIMATE;

  const edgeTokens = limitTokens * (1 - margin / 100);
  const usedTokens = baseline + delta;
  const projectedTokens = usedTokens + payloadEstimate + footerTokens; // same shared projection as the wrapper's consumers 1–3
  if (!(projectedTokens > edgeTokens)) return { shouldBudgetSpill: false };

  const remaining = Math.max(0, edgeTokens - usedTokens - footerTokens); // reserve the gated footer self-size inside the budget
  const density = getHighEntropyCharsPerToken();                        // exact applied high-entropy class pricing — never a duplicated clamp
  const budgetChars = Math.max(0, Math.floor(remaining / density));

  console.log(
    `[BudgetGuard] [M2-SPILL] ${input.toolName ?? 'tool'} budget-aware cap: projected ` +
    `${Math.round(projectedTokens).toLocaleString('en-US')} tok > edge ${Math.round(edgeTokens).toLocaleString('en-US')} tok ` +
    `(${margin}% reserve of ${limitTokens.toLocaleString('en-US')}; baseline+delta ≈ ${usedTokens.toLocaleString('en-US')}, payload est. ` +
    `≈ ${payloadEstimate.toLocaleString('en-US')} tok) — capping inline preview at ≈${budgetChars.toLocaleString('en-US')} chars (full payload still stored verbatim)`,
  );
  return { shouldBudgetSpill: true, budgetChars, remainingBudgetTokens: remaining, limitTokens, projectedTokens };
}



/** Self-describing M2 marker line for compacted content — explains WHY this payload was spilled (budget edge, not absolute size) with the
 * numbers, and points at controlled re-reads. The wrapper attaches it ONLY when shouldBudgetSpill is true; absolute-cap spills keep their
 * existing compaction text byte-identical. */
export function buildBudgetSpillMarker(decision: BudgetSpillDecision, config?: PluginConfig | null): string {
  const margin = resolveSafetyMarginPct(config);
  const limit = decision.limitTokens ?? 0;
  const edge = Math.round(limit * (1 - margin / 100));
  return (
    `[Budget guard] ${BUDGET_GUARD_SPILL_MARKER}: projected usage ~${(decision.projectedTokens ?? 0).toLocaleString('en-US')} tokens would cross ` +
    `the budget edge of ${edge.toLocaleString('en-US')} tokens (${margin}% reserve kept out of the ${limit > 0 ? limit.toLocaleString('en-US') : '—'}-token window), ` +
    `so only a ~${(decision.budgetChars ?? 0).toLocaleString('en-US')}-char preview is kept inline. The full result is stored verbatim — re-read what you need with ` +
    `read_file_chunked (small chunk_size/max_chunks) or ripgrep/pattern_scan on the stored path.`
  );
}


// ==================== M3 Auto-Persist — insurance checkpoint at the autopause edge (05.11, owner GO 04.11) ====================
//
// Third mechanism of Budget-Guard-Arc: when the wrapper's shared projection crosses limit×(autopause_threshold_pct/100)
// — default 85 %, one rung BELOW tier-2's user-configured forced save (~90 %) and FIX B's fixed pre-emptive compression
// (95 %) — a structured session-continuity summary is persisted AUTOMATICALLY, so context loss can never happen without
// a trail. The deliberate 85/90/95 rung order stays intact: M3 only checkpoints (Arc-C save); it caps nothing and never
// compresses. This module contributes the pure parts — threshold resolution + self-describing marker; the session-scoped
// one-shot latch, the Arc-C pipeline call and all gate wiring live in toolsProvider.ts next to its tier-2/FIX-B siblings.
// Nothing here mutates shared state (READ / FAIL-OPEN invariants of this module unchanged).

/** Auto-persist threshold default (%): owner ruling "85" on 04.11 — first rung below tier-2's ~90 % forced save. */
export const BUDGET_GUARD_AUTOPAUSE_THRESHOLD_PCT = 85;

/** Resolve the auto-persist threshold from config with the ruling default as fallback (legacy-safe, same shape as resolveSafetyMarginPct). */
export function resolveAutopauseThresholdPct(config?: PluginConfig | null): number {
  const pct = config?.budgetGuard?.autopause_threshold_pct;
  return typeof pct === 'number' && Number.isFinite(pct) && pct > 0 ? pct : BUDGET_GUARD_AUTOPAUSE_THRESHOLD_PCT;
}

/** Self-describing M3 marker — PREPENDED to the summary's task_description so the NEXT restore_session_context dossier shows it as its own note
 * (RESEARCH_budget-guard.md §M3: "im nächsten Restore-Dossier als eigene Notiz sichtbar"). `auto_saved=true` is the machine-visible flag;
 * the numbers stay human-readable. Pure string build — no I/O, never throws. */
export function buildBudgetAutoPersistMarker(pct: number, projectedTokens?: number, limitTokens?: number): string {
  const projected = Math.round(projectedTokens ?? 0);
  // Direct typeof-narrowing ternary (not an aliased flag): `limitTokens` is optional, so the window fragment must be built where TS can see the guard.
  const windowPart = typeof limitTokens === 'number' && limitTokens > 0
    ? ` ≈ ${Math.round(limitTokens * (pct / 100)).toLocaleString('en-US')} tok of the ${limitTokens.toLocaleString('en-US')}-tok window`
    : '';
  return (
    `[Budget guard] auto_saved=true — M3 session summary auto-persisted at ~${projected.toLocaleString('en-US')} projected tokens ` +
    `(≥ ${pct}% autopause edge${windowPart}). ` +
    `This was an AUTOMATIC insurance save by the budget guard — not a user-requested summary; tier-2 (~90 %) and pre-emptive compression (95 %) rungs are unaffected. ` +
    `End of auto-marker.\n\n`
  );
}
