# AutoTracker Mid-Loop Token Counting — Fix Plan (FIX #20 candidate)

Status: PLANNED (2026-08-22). Not implemented. Supersedes the abandoned predictionLoopHandler approach of 21.08.

## Problem (root cause, evidenced)
Token counting + threshold checks run ONLY in `promptPreprocessor.ts → preprocess()`, which LM Studio calls exclusively on user messages — never mid tool-loop:
- Only call site for threshold check: `src/promptPreprocessor.ts:767` (`autoTracker.checkAndGeneratePrompt`).
- Compression trigger `tokenCount > threshold`: same function, directly below.
- Event detection `analyzeMessage()`: L905, user text only.

Consequences during agentic turns (this project's tools return up to 50k chars ≈ ~14k tokens per call):
1. 75% checkpoint prompt fires one full turn late (stale count).
2. Worst case: context overflow MID-TURN — compression can never run because it only exists in preprocess().
3. `analyzeMessage()` misses all assistant/tool-loop text (decisions/completions/error fixes not buffered).

## Why the "clean" hook is blocked (evidenced, 21.08. crash)
- LM Studio Core rejects registering BOTH a tools provider AND a prediction loop handler:
  `Error: Tools provider cannot be used with a predictionLoopHandler` at plugin boot (`main()` → `withToolsProvider`).
- Verified in installed SDK v1.5.0 type defs: both exist (`index.d.ts` L6539/L6549), no doc about exclusivity — enforced server-side, invisible to tsc/Jest (why tests passed but install crashed).
- SDK check 22.08.2026: npm latest = **1.5.0** (same as installed), not deprecated → no upgrade path; exclusivity stands.
- ai_toolbox is a tools plugin ⇒ `withToolsProvider` must stay ⇒ per-prediction hook unavailable for now.
- Leftover dead wiring from that attempt (0 callers in src/): `ContextGuard.receivePredictionStats()` (`src/contextGuard.ts:640`) → `TokenStatsManager.updateFromPredictionResult()` (`src/tokenStatsManager.ts:39`).

## Plan
### A1 — Delta bookkeeping (foundation)
- Every tool return measures its own payload size and adds a running delta to the existing `TokenStatsManager` (it already models cumulative session tokens "matches sidebar").
- Next `preprocess()` evaluates threshold/compression against `historyCount + deltas` instead of history-only.
- Fixes stale stats; late-but-now-correct evaluation at next user message.

### A2 — Mid-loop safety (side effect, no UI prompt possible mid-loop)
- If cumulative count crosses the compression threshold DURING a tool loop → proactively run `autoTracker.autoSaveSessionMemory()` checkpoint (no user prompt — nobody can answer mid-turn).
- Closes the overflow window PART B was meant to guard.

### Dormant wiring
- Keep `receivePredictionStats` as documented interface for a future SDK/core change; add comment: activatable only WITHOUT tools provider (core exclusivity, 21.08. crash evidence above).

### Option B — Background polling (optional, verify first)
- Check whether `src/backgroundCommands.ts` controllers expose chat history/client access in this SDK stand. Only "nice to have"; A1/A2 do not depend on it.

## Verification (measurable)
1. Unit: simulated tool-loop (5 × ~30k-char returns) → asserts threshold fire point, mid-loop snapshot trigger, boundary cases 74%/75% (`autoTrackTokenThreshold`).
2. Integration in LMS: session with 8+ tool calls/turn; log markers `[AutoTracker] [DELTA] +N tok` per tool return and `[CHECKPOINT] mid-loop saved: ctx_…` on crossing. Expected: sidebar vs plugin count divergence <5% (est. factor chars×0.25×1.10) instead of current several-thousand-token gap; overflow-mid-turn scenario no longer possible unguarded.

## Constraints
- Minimal scope: no changes outside token counting / tracker trigger path. No new UI hooks (none exist mid-loop). Estimate stays estimation until SDK exposes authoritative per-step stats usable with tools provider.
