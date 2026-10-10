# GLOSSARY — ai_toolbox shared language

The project vocabulary for sessions, agents, and humans working in this repo. Goal: one precise word where ten vague ones would do (per the "ubiquitous language" pattern — concision compounds session after session). Read this before decoding a CHANGELOG_v4 entry, session summary, or memory fact; update it when a new term earns a slot.

**Status:** v1 · created 10.10.2026 ~16:3x · canon at time of writing: 71 suites / 1020 tests (GREEN round 3)
**Conventions:** LF line endings, no BOM (house style). New entries go in the right section, alphabetically; when a term dies, strike it through rather than deleting (provenance).

---

## Process & workflow

| Term | Meaning |
|---|---|
| **owner** | The human who owns the project and grants scope. Agents work under owner GO; nothing ships or expands without it. |
| **owner GO** | Explicit permission from the owner to execute a specific action ("GO on X", "GO/leave" = do it or leave it, your call). A blanket GO does not override documented exceptions unless stated — when in doubt, keep the exception and report it. |
| **house rule / house order** | Standing project decision with mandatory force (e.g., "CHANGELOG_v4 entry ONLY after owner gates GREEN"). Cited as-is; no re-debate without owner GO. |
| **house stance** | A position held but less rigid than a rule — the default unless the owner explicitly redirects (e.g., "No new config key" from the 08.10 two-tier spec). |
| **house convention** | Shared informal practice that keeps behavior consistent (e.g., "new turn = toolsProvider() entry" for re-arming per-turn latches and counters). |
| **house precedent** | A past decision used as template style for a new one (e.g., in-sentence "SHIPPED LIVE" changelog note). |
| **house lesson** | A durable insight extracted from an incident, ideally embodied in tests so it survives without memory. |
| **arc** | A named multi-session work stream with its own plan, fixes, close-out, and changelog entry (e.g., "Arc C" = forced session-memory save at compression; "two-tier ARC" = the 08.–10.10 mid-loop protection effort). Arcs ship as units. |
| **close-out** | The bookkeeping that closes an arc AFTER the code is verified: plan steps flipped done (plan auto-removes at N/N per house rule), CHANGELOG_v4 top entry written + read-back verified, provenance recorded, own `.bak` swept. "Fully closed" = all of it; ship ≠ close-out until this lands. |
| **SHIPPED LIVE** | Changelog status phrase: the rebuilt artifact is installed in LM Studio's live plugin dir and both fixes grep-verified inside `dist/index.js`. Written in-sentence at close-out (house precedent). |
| **gate trio** | The three verification gates: `npx tsc --noEmit` → `npm run lint` (0 problems) → full `jest`. Agents self-audit first, then hand off the trio to the owner. |
| **self-audit** | Pre-handoff review of one's own diff per file against its `.bak` (or a git ref when `.bak`s are stale by design): logic check + EOL/BOM integrity. |
| **GREEN round** | A full gate-trio pass that established a verified baseline state; numbered ("GREEN round 3"). |
| **canon** | The canonical test-suite count at the last GREEN round (currently **71 suites / 1020 tests**). Docs-only edits do not move it; any code change requires re-gating before the canon changes. |
| **provenance** | The evidence trail proving a state: artifact mtime, byte-level grep anchors (e.g., `Fix A 🔔 notice @L56991`), git refs, memory-fact IDs. Provenance without shell access is an accepted verification method. |
| **handoff** | Closing a session with the next one ready to resume: session summary saved, pending tasks listed, context pointers exact (paths + anchors, no transcripts). |
| **dossier** | What `restore_session_context` returns — the per-project resume pack (latest summary + persisted plans + decisions + memory facts), budgeted and truncation-aware. |

## Two-tier arc & context management

The mid-loop context-protection stack (shipped 10.10). Three thresholds, three distinct mechanisms:

| Term | Meaning |
|---|---|
| **tier-1** | The ~75% interactive layer: YES/NO session-save prompt at user-message boundaries; when crossed inside a tool loop nobody can answer mid-loop — the notification defers to the next message (🔔 MID-LOOP CONTEXT THRESHOLD NOTICE, Fix A). Live-signal expectation: exactly one 🔔 ack per successful tier-1 crossing. |
| **tier-2** | The forced SAVE at `contextGuardCompressionPercent` of the model window (default 90; schema 50–100): structured session-continuity summary persisted MID-LOOP, once per turn, non-fatal. Save only — it never shrinks context. Live-signal: `[TIER-2] ✅ … persisted` line. |
| **tier-2 compact / pre-emptive compaction** | The fixed 95% rung (`PREEMPTIVE_COMPRESSION_PERCENT`, a constant by design — deliberately not derived from the configurable percent): runs the FULL PART-B pipeline mid-loop (store-before-prune → snapshot → Arc-C save → `compressHistory`), once per turn. Closes the gap between tier-2's save and the model's 100% wall where run-away turns used to die (twice on 09.10). Live-signal: `[TIER-2-COMPACT] ✅ Pre-emptive mid-loop compression complete — baseline republished at N tokens`. |
| **turn baseline** | Token count of the current turn's context, published at `preprocess()`'s single `setTurnEvaluation` publish point. `0` = never published this turn → usage footer suppressed by design + one FAIL-LOUD warn (no-misleading-numbers rule). A missing 🔔 on an obvious >75% crossing ⇒ first suspect is a failed baseline publish (FIX #3 class). |
| **mid-loop delta** | Cumulative token estimate of tool results recorded this turn (`recordToolResult`), reset at the new-turn convention. Feeds the projection, never displayed directly. |
| **projection / shared projection** | `baseline + midLoopDelta + payloadChars→tokens + FOOTER_TOKEN_ESTIMATE`, computed ONCE per wrapper pass and consumed by BOTH gate families (CTX-FOOTER display gates AND tier forced-save/compaction gates) with independent conditions — one computation keeps both trigger decisions provably identical. |
| **latch / one-shot flag** | Per-turn boolean that fires exactly once then holds (`forcedSaveFiredThisTurn`, `midLoopCompactionFiredThisTurn`, footer suppression warn). Latched BEFORE the first await so a throw cannot re-arm mid-turn; re-armed at EVERY provider entry (new turn). The two tier latches are independent on purpose: a 90% save must not suppress the 95% compaction. |
| **PART B** | The pre-compression checkpoint inside `preprocess()`, awaited BEFORE `compressHistory()` destroys history: telemetry snapshot + Arc-C forced save; non-fatal by design (a failure logs, compression still runs). "PART B parity" = a later code path must reproduce this exact ordering and behavior. |
| **PART B-2** | The settlement step right after PART B: any pending YES/NO warning prompt is resolved ("last-chance note") because the context it referred to is about to be replaced by compression. |
| **F1 notice** | One-shot notice text produced inside PART B (17.09 G-B fix) and appended to the user prompt after compression, so the user learns their history was compressed. |
| **keepLast = 10** | The last 10 messages survive verbatim — deliberately excluded from summarization (`slice(0, len-10)` on the caller side). Also the minimum-span gate: tier-2/compact fire only when ≥10 messages lie past that exclusion (a turn list of exactly 20 fires; shorter = deterministic skip, latch still holds). |
| **store-before-prune** | C-compaction-family ordering: oversized payloads are spilled to disk BEFORE pruning removes them from context. Any store failure aborts pruning for that pass only — compress with verbatim payloads (PART B parity). |
| **non-fatal by design / by owner spec** | A failure mode classed as log-and-continue: it must never break, delay, or alter the outcome of a successful tool call. The default contract for every measurement/guard/side effect in the wrapper. |
| **FIX #N / FIX A–B** | Numbered/lettered fixes within an arc (FIX #20 = mid-loop context-growth instrumentation; FIX #21 = tier-2 forced save; FIX B 09.10 = pre-emptive compaction; "Fix A" = the 🔔 notice). Cited in code comments and changelog for cross-referencing. |
| **new turn (house convention)** | `toolsProvider()` entry is the canonical turn boundary: reset monotonic guard, advance repeat-tool reminder, re-arm all per-turn latches + mid-loop delta together. |

## Tool-result envelope & transparency

What every tool result carries and why:

| Term | Meaning |
|---|---|
| **wrapper** | The instrumentation layer in `toolsProvider` (FIX #20) that wraps every registered implementation once per registration: payload recording, footer, tier gates, stamping. It never alters routing or non-object payloads. |
| **transparency stamp / executedTool** | Additive field on plain-object results naming the registered implementation that ACTUALLY ran. Follow-up to the 01.09 silent-substitution incident: if the model believes it called X but `executedTool` says Y, substitution is visible in the transcript instead of hidden behind a plausible success. Wrapper value is authoritative; strictly additive (grep-verified no key collisions before introduction). |
| **E house rule** | The invariant stamped with each result: *model-visible ⟺ logged* — what the model sees in `executedTool` and what the log records must match exactly (`[AI Toolbox] [E HOUSE RULE] …`). The FAIL-LOUD variant is an error, not a warning. |
| **CTX-FOOTER** | LLM-side limit awareness (02.10, widened 03.10 option B): compact usage footer at ≥50% projected window usage, sharper clause near/over the limit. Additive in both forms — appended to strings; new `ctx_footer` key on plain objects (a tool-owned `ctx_footer` always wins). Suppressed entirely when no turn baseline was published; exactly ONE warn per suppression window names that silence. |
| **spill pattern A** | Immediate inline spill of oversized string results at the wrapper, thresholded by `compactionMaxResultBytes` — before the payload ever enters the projection math. |
| **GOD MODE** | Config toggle bypassing every individual family switch and activating all tools. |

## Config vocabulary (ContextGuard & friends)

Full field reference lives in ARCHITECTURE.md; here are the load-bearing ones:

- `contextGuardEnabled` — master gate for guard behavior (`=== true` strict, never truthy).
- `contextGuardCompressionPercent` — % of model window at which PART B compresses / tier-2 force-saves (default 90, schema min 50 / max 100).
- `contextGuardForceSummaryOnCompress` — Arc C: structured session-memory save at the compression trigger (boolean, default true; STRICT `=== true` gate).
- `compactionEnabled` / `compactionMaxResultBytes` — C compaction family (24.09): turn-level ops serialized against live loops via `drainActiveToolTurns()`.
- `contextUsageFooter` — the CTX-FOOTER toggle (`!== false` = on).

## Engineering practice

| Term | Meaning |
|---|---|
| **Lever-N** | A numbered optimization with its own measurement and close-out (Lever-1 = property-level `describe` truncation in toolsSchemaMinifier, 80-char sentence-boundary cap; shipped 08.10 at −3.55% wire-payload param mass after two silent no-op rounds). Levers ship with a measured delta — zero-delta rounds are reported as such and re-diagnosed, never skipped. |
| **Option A / Option B** | Named alternatives on the table for owner choice; "closed at Option A" = that option was executed and scope explicitly bounded (the rest PARKED). |
| **PARKED** | Deliberately deferred work with a named re-entry condition ("PARKED behind llama.cpp PR #17381 exposure audit + explicit owner GO"). Not dead — suspended with its prerequisites written down. |
| **RC#N class** | Root-cause classification for recurring failure shapes (e.g., RC#4 = jest `Cannot find module` from a missing `moduleNameMapper` entry). Naming the class makes recurrence instant to recognize and fix. |
| **silent no-op round** | An edit that passed all gates yet changed nothing in production — the classic blind spot where unit tests exercise a different input shape than reality. House lesson: unit gates must pin the EXACT production input shape; a non-zero measurement delta is part of the definition of "shipped". |
| **byte-identical** | Change class guarantee: existing behavior/bytes unchanged in every scenario outside the intended one (used for suppression paths, gate additions, re-nests). Claimed only with a concrete argument + test pins. |
| **strictly additive** | New keys/stamps that can never collide or mutate tool-owned values; the wrapper's own values are authoritative on collision by construction. |
| **exhaustive literal** | A config-literal list in `toolsProvider` kept complete against every schema field so adding a key is a compile-visible obligation, not an optional memory. |
| **pinned harness / precompressSnapshot-style harness** | Jest fixtures that pin exact production shapes (config stubs whose `.get()` returns pinned values; guard stubs with/without real methods) — the anti-silent-no-op discipline in test form. "Pinned" also means a call site kept byte-identical on purpose. |
| **call-order array** | Test assertion style recording the actual sequence of awaited calls (e.g., `flush → generate → persist → compress`) to prove pipeline ordering, not just occurrence. |
| **repo-store guard** | Jest-side protection that THROWS on any write under `.session_context/`, so suites can never corrupt real session memory; tests use tmp working dirs + reset in `afterEach`. |

## Memory & persistence layer

The store behind the tools (all under `.session_context/`):

- **memory fact** (`save_memory`) — a durable atomic fact with an ID (`memory_…`); the long-term, cross-session record.
- **context entry / auto-checkpoint** — machine-written telemetry (e.g., threshold-reached snapshots "no one can answer mid-loop"); collapsed into aggregates in dossiers to save budget.
- **session summary** (`save_session_summary`) — structured close-out: task, accomplishments, pending tasks, decisions, next-session context; fields hard-cap at ~2048 chars (truncation tails get a supplement memory fact).
- **sessions index / sessions.json** — the browsable list of past sessions (via `SessionIndexManager`).
- **plans store** (`.ai_toolbox_plans.json`) — persisted execution plans; auto-removes at N/N per house rule; file vanishes when the last plan leaves.
- **dossier** — see Process & workflow (`restore_session_context` output).
- **`.bak` rotation** — every editing tool drops a `.bak` that ROTATES per edit (the newest .bak is one edit old, not the arc baseline) — which is why self-audits diff against git refs when an arc spans many edits.

## Shipping & wire

| Term | Meaning |
|---|---|
| **dist/index.js** | The built plugin bundle; after 10.10 the `.lmstudio/` dir holds only `entry.ts` — the LIVE artifact is in LM Studio's own plugin dir outside this repo. Stale-bundle checks must never look for `.lmstudio/production.js`. |
| **wire harness / wire-payload mass** | Off-line measurement of the serialized tool schema payload sent to the model (chars/token estimates); the yardstick for Lever-N deltas. Current scale: ~81 tools, ~37k param chars pre-Lever-1. |
| **schema minifier** (`toolsSchemaMinifier`) | Shrinks tool JSON-Schema descriptions/params before exposure — defense against llama.cpp EBNF grammar-parser crashes (PR #17381 enforces a 2000 repetition-bound limit). Operates in-place on live Zod objects; the discriminator for root-level params is `_def.typeName === 'ZodObject'` + `typeof _def.shape === 'function'`. |
| **cluster-aware ordering** | Tool send-order = priority tier → module centrality (static ARCHITECTURE.md dependency graph) → name; toggle `clusterAwareToolOrder`, OFF restores legacy alphabetical. |

---

*Terms in use but not yet slotted here get a slot the next time they appear in an arc — one entry, two lines max, provenance link if non-obvious.*
