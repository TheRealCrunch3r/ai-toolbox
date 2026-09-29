### [28.09.2026 ~19:3x] — v1.9.18 rev-3x pile (uncommitted): FIX-35c — ReDoS gate hang-proof by linear-by-construction scans; bench 56/860

**The 28.09 evening lockups were the GATE itself, and it is now structurally incapable of hanging.** The 18:22/19:15 LM Studio freezes (pattern_scan over ARCHITECTURE.md / a benign alternation probe on src/security.ts) traced to `isSafeRegex`'s own clause-1 meta-regex catastrophically backtracking on ANY pattern text with one lone unpaired raw `(` — the hang sat inside buildMatcher, so no wall cap or abort could ever react. Clause 1 is replaced by two O(n) pure scans in `src/security.ts`: nested-repetition detection (a quantified group whose body holds an unescaped quantifier; `{n,m}` after a group stays exempt per D2 '(a*){50}') + the adjacent-quantified-token incident class no prior clause caught (\d+\s*\d+). No meta-pattern remains in the gate → hang-proof by construction.

- **What changed:** `src/security.ts` only — everything else in `isSafeRegex` (alternation-inside-group clause, substring list, >5-quantifier cap, char-class adjacency, REV-24/D2 code-signature heuristic) byte-for-byte unchanged; all other tools' contracts untouched.
- **Tests:** +3 FIX-35c pins in `tests/security.test.ts` (incident patterns rejected on both rule arms · 19:15 benign alternation stays safe · linearity budget: 200 worst-case runs < 50 ms).
- **Verified (owner-run gates, 28.09 ~19:3x):** `tsc --noEmit` clean · security 34/34 · patternScan 25/25 · full `npm test` EXACTLY **860 passed / 56 suites** (delta exactly +3 vs the same-evening 857 gate — zero regressions). Live-instance proof after rebuild+reload 29.09 ~16:5x: incident-class input → 8 ms scan, demoted pre-I/O, no hang (old clause-1 locked >3 s on this class).
- **Docs sync (same pass + 29.09 sweep):** `package.json` description → verified 860/56 · CHANGELOG_v3 new top entry + header arc line · README badge/table/test-command at 860 · ARCHITECTURE tree test-count comment · DOCUMENTATION module-map parenthetical · SECURITY.md ReDoS layers: vanished mechanisms (layers 2–3 split-regex, layer 8 legacy constants) marked SUPERSEDED with replacements named + gate hang-proof note added.
- **Versioning:** no bump — v1.9.18 sticky per 21.09 owner decision; `manifest.json` revision stays at **33**; folds into the next rev pile alongside WALK-ABORT. Commit pending owner design — suggested msg: `fix(security): isSafeRegex hang-proof linear gate (FIX-35c) + regression pins`.

---
### [28.09.2026 ~17:1x] — v1.9.18 rev-3x pile (uncommitted): pattern_scan WALK-ABORT — walk-phase abort at directory boundaries + A/B regression suites

**The last "deadline dead zone" of the 24.09 RE-ARM arc is closed.** Post-RE-ARM live incidents today: `pattern_scan` directory-mode calls settled ABOVE the armed 3 s deadline — because the guard's cooperative check ran only at FILE boundaries, and in directory mode no file boundary exists until a BFS walk over slow FS / deep tree completes. The fix arms the WALK phase itself with one shared abort check per directory boundary (deadline OR host signal), so target collection now honors the 3 s contract: PARTIAL targets + `aborted: true`, never unbounded.

- **What changed:** `src/tools/patternScan.ts` only — `walkDirectory()` takes the shared `guard.signal` and checks it once per directory boundary (top of BFS loop; fired → stop walking, return collected partial target set); call site forwards the signal. File-boundary checks, deterministic size bounds, ReDoS demotion gate and the `aborted: true` contract unchanged.
- **Tests:** two new real suites — `tests/patternScanWalkAbort.test.ts` (mid-walk host-signal abort → partial targets + `aborted`) and `tests/patternScanWalkAbortSlowTree.test.ts` (A/B slow walk, DIR_COUNT=400: arm A = fixed impl on the incident shape → clean-completion regime 400/400 under deadline; arm B = PRE-FIX reconstruction as contrast → full unbounded walk despite fire mark at ~50 ms, fail-loud gate ≥ 45 ms). Convention on record: branch on contract field `r.aborted`, never elapsed proximity.
- **Verified (owner-run gates ×2, 28.09):** full `npm test` EXACTLY **857 passed / 56 suites** (~17:0x and ~17:13; ~21.5 s / ~22.2 s) · delta vs the same-day pre-WALK-ABORT gate (855/55, ~16:47) exactly +1 suite / +2 tests as predicted · zero regressions. Live stress panel on the fresh rebuild all bounded <30 ms — dir-mode `src` full walk 21 ms · single-file runs 1–7 ms (incl. exact positive-control hit) · recon root `'.'` depth≤2 = 209 files / 26 ms with size/binary/long-line skips + default excludes correct; owner's VERBATIM recalled incident pattern proven gate-demoted (`demoted_to_literal: 'unsafe-regex'`) settling ~13 ms on the fixed build.
- **Docs sync (same pass):** README badge/table/test-command · `package.json` description → verified 857/56 ×2 · CHANGELOG_v3 new top entry + header arc line · ARCHITECTURE tree test-count comment + pattern_scan RE-ARM note extended with WALK-ABORT · TOOLS_REFERENCE pattern_scan cell + date stamps (full per-module re-audit still pending) · SECURITY.md ReDoS layer 9 marked SUPERSEDED for pattern_scan (per-file worker dispatch retired 16.09 — zero `WORKER_KILL_MS`/`patternNeedsWorkerIsolation` refs remain in `src/`) + native-engine-path note corrected to the structural guarantee (literal demotion pre-I/O + file-AND-directory-boundary guard).
- **Versioning:** no bump — v1.9.18 sticky per 21.09 owner decision; `manifest.json` revision stays at **33** until Hub publish (WALK-ABORT folds into the next rev pile alongside EOL-FIX / FIX #33). Commit pending owner design — suggested msg: `fix(search): pattern_scan walk-phase abort at directory boundaries (WALK-ABORT, deadline dead zone) + A/B regression suites`. Residual known gap on record: caller-inflated `maxFileSizeBytes` vs same-thread timer.

---
### [27.09.2026] — v1.9.18 rev-3x consolidated release entry (post-rev-33 pile, commit `00683c7`)

**Six verified arcs shipped as one release-style commit per the rev-30 precedent** (`release(v1.9.18 rev 3x): post-rev-33 pile — NEXT-REV cleanup · pattern_scan RE-ARM · C compaction · Pipeline D · Repeat Tool Reminder B · restore_session_context + docs sync (bench 850/53)`, pushed to origin/main). The per-arc entries below carry the details; this entry records the consolidated state and gates.

- **Bench:** 850/850 passed / 53 suites — owner-run `npm test` 27.09 ~15:31, AFTER the docs pass (docs-only changes cannot affect tests); `tsc --noEmit` clean; ESLint clean (25.09 ~19:3x). Arc-time baselines in chronological order: NEXT-REV/Q6 gates 805/47 → RE-ARM + C compaction 824/50 → Pipeline D 836/51 → LOOP HYGIENE B 840/52 → restore_session_context (+10 tests) = final **850/53**.
- **Docs sync (27.09, post-green owner GO):** README badge/table/test-command + `package.json` description → verified 850/53 (also resolved pre-existing README drift: badge 836/51 vs table 840/52); CHANGELOG_v3 top entry PENDING→VERIFIED with post-fix notes; TOOLS_REFERENCE `max_chars` floor corrected to 1000–50000; stale utilityTools one-liner removed from README.
- **Housekeeping in the same commit:** package-lock refresh (version stamp v1.9.18 + in-range patches, no direct-dep declaration changes) and tests.7z re-sync with the current suite. Follow-up 27.09: allowScripts `sharp` pin drift closed — `package.json` L68 aligned `sharp@0.33.5` → **`sharp@0.35.4`** to match installed/lock state (commit `21c9368`; dep range ^0.35.3 untouched).
- **Versioning:** no version-number change — v1.9.18 stays sticky per owner decision 21.09; `manifest.json` revision still **33** (revision churn only via Hub publish); **Hub publish pending owner GO**. Post-publish smoke for the sharp pin fix: fresh Hub install → image tools work + `npm run build`.

---
### [25.09.2026 ~18:3x] — v1.9.18 rev 3x: restore_session_context — one-call composite resume dossier ("read session mem" in a single call)

**The recurring "go to ai toolbox and read the session mem" workflow no longer costs 5–7 sequential tool calls.** Option B (composite resume READ — presented against an Option A consolidation refactor on 23.–24.09; no schema change, no new storage, zero writes) composes FIVE existing read surfaces into one Markdown dossier: ① session summary (RAM `StateManager` first, file record second — priority parity with `get_session_summary`, legacy string-value fallback kept), ② persisted plans via `PlanStorageManager.load()` (`get_plan` selection semantics: newest by `createdAt`; older plans counted but not rendered verbatim), ③ explicit `memory_*` facts (one raw decode of the shared store — no manager instance, no frequency bumps), ④ context entries with local TTL handling that skips expired session-scoped entries WITHOUT persisting pruning (store untouched), ⑤ sessions index. Machine-written auto-checkpoint noise (`auto_checkpoint` / `token_threshold`) collapses to ONE line: count + date range + peak usage %. Output carries a per-family presence/staleness header (STALE > 3 days), a machine `counts` block, and a hard `max_chars` budget (default **16000**, marker `[TRUNCATED at max_chars=…]` + omitted-section list). Params: `include_sessions_index` (default true) · `max_chars` (**1000**–50000 — floor lowered from 2000 post-verification because zod validates params before implementation runs, making the truncation contract untestable at 2000; truncation pin re-budgeted to 1250).

- **What changed:** `src/tools/restoreSessionContextTool.ts` (NEW) · registration in `toolsProvider.ts` under the existing `contextManagement` key (inherits the memory-family toggle — no config/UI surface change) · three RC#4-class jest mapper entries BEFORE the tools-mock fallback (module specifier + two sibling imports resolved to REAL src, matching how 15+ suites already load contextManagementTools) · locales ×5 (`en/de/es/zh-CN/zh-TW`, zh-TW bracket typo fixed in same pass) · `toolPriority.ts` DELIBERATELY UNTOUCHED (house precedent: unrated tools flow through the fallback tier).
- **Tests:** new hermetic suite `tests/restoreSessionContext.test.ts` — 10 tests, zero `.each()`: per-run temp working dir; all three store files seeded in REAL on-disk shapes (SPEC-C layout); pins include full dossier counts + every family body · newest-plan-wins · checkpoint collapse to exactly one line (peak %, verbatim bodies ABSENT) · **read-only contract — all store files byte-identical before/after the call** · truncation marker + omitted-section naming · fresh-project self-describing dossier · legacy summary parse parity · RAM-hit-wins over file · `include_sessions_index=false` scoping · staleness flag.
- **Verified:** owner-run gates 25.09 ~19:3x ALL GREEN — full `npm test` exactly **840→850 / 53** (baseline 840/52 + this suite's 10) · `tsc --noEmit` clean · ESLint clean; post-gate fixes landed in the same session BEFORE green: 3× `no-unnecessary-type-assertion` closed behaviorally-neutral, fixture `STORE_STAMP` corrected to CSM's memory-file-path stamping (production code untouched), and the `max_chars` floor fix above.

---
### [25.09.2026] — v1.9.18 rev 3x: PIPELINE HYGIENE D — unified tool-execution pipeline (outcome taxonomy + finalizeContent invariant)

**Tool error handling stops being ad-hoc per-tool.** DeepSeek-harness research item D lands the unified seam every tool execution can settle through: one pure pipeline with distinct monotonic-guard outcomes (`success` / `error` / `deny` / `abstain`) and the **finalizeContent invariant** (tool-owned content is always finalized before surfacing; a `success` finalizing to empty content raises a FAIL-LOUD `[ToolExecutionPipeline]` console.warn). An identical call within one turn settles as `kind: 'abstain'` (no re-execution); legacy `{success, data/error}` return shapes normalize into the taxonomy; unhandled impl exceptions become `code: UNHANDLED_EXCEPTION`.

- **What changed:** `src/utils/ToolExecutionPipeline.ts` (NEW — PURE, no fs/SDK/globals; finalizer chain = per-tool registered > pipeline default; constructor fails loud on a non-function `defaultFinalizer`) · `src/utils/withPipeline.ts` (NEW process-level wiring: lazy shared singleton, `withPipeline()` / `registerToolFinalizer()` / `resetToolGuard()`) · `toolsProvider.ts` calls `resetToolGuard()` on EVERY provider invocation — the monotonic seen-set is per-turn by construction. Adoption note: per-tool wrapping via `withPipeline()` is INCREMENTAL — as of 25.09 no tool implementation is wrapped yet (behavior-neutral until wired) · one RC#4-class jest mapper entry for the new static import (first suite loading it had crashed "Cannot find module").
- **Lint close in same arc:** `describeError()` renders unknown error values safely (string passthrough / `Error → "name: message"` / circular-safe JSON fallback) — replaces the prior form that tripped `@typescript-eslint/no-base-to-string` and would have surfaced plain-object errors as `[object Object]`.
- **Tests + verified:** dedicated suite `tests/utils/ToolExecutionPipeline.test.ts`; owner-run gates 25.09: full jest exactly **836 passed / 51 suites** (baseline 824/50 → +12) + ESLint clean on the new module (16:12).

---
### [25.09.2026] — v1.9.18 rev 33: LOOP HYGIENE B Repeat Tool Reminder implemented

**Research item B complete.** Loop-hygiene guard counts identical tool+args calls and nudges at thresholds [3,5,8].

- `src/utils/repeatToolReminder.ts` – canonical key, per-turn counter, advisory messages
- `src/tools/repeatToolReminderTools.ts` – new utility tool `get_repeat_tool_advice` for read-only visibility
- Integration in `toolsProvider.ts` with console.warn nudges, executedTool transparency preserved
- Tests green: 52 suites / 840 tests

### [24.09.2026] — v1.9.18 rev 3x: pattern_scan wall cap RE-ARMED (`PATTERN_SCAN_MAX_RUN_MS = 3_000`, owner order "abort after 3 seconds")

**The >60 s zero-payload scan class is closed.** After the DE-STRAngle arc removed the budget (host-signal-only), a >60-second `pattern_scan` on slow FS returned nothing — an unbounded walk over slow I/O proved worse than bounded partials. Owner order of the day re-armed it: pattern_scan now runs under ONE shared grep guard with TWO abort sources — the **3-second wall deadline** and any **host signal** (user cancel / host timeout) — converging on one cooperative `guard.signal`, checked at every file boundary. A fired deadline returns a successful PARTIAL result (`aborted: true` + exactly one cap warn), never a hang or throw; `disarm()` in finally releases the timer AND the listener on EVERY completion path, so no stray warn can fire after settle (FIX-HANG-3 class).

- **What changed:** `src/utils/grepGuard.ts` — history note on `PATTERN_SCAN_MAX_RUN_MS = 3_000` documents the full arc (set by user order 04.09 at 500 → raised to 3000 on 13.09 → removed/host-signal-only by DE-STRAngle 16.09 → re-armed 24.09 per owner order) + the `GREP_FILES_MAX_RUN_MS` doc cross-reference fixed (was "REMOVED … — see note above"). `src/tools/patternScan.ts` — guard creation arms both sources: `createGrepGuard(options.abortSignal, PATTERN_SCAN_MAX_RUN_MS, 'pattern_scan')` (previously signal-only / `deadlineMs=0`); module header + `aborted?` result-type comments updated; the tool description carries the wall-clock hint again.
- **What did NOT change:** the deterministic SIZE bounds are KEPT alongside the cap (`maxFileSizeBytes` / `maxFileLines` / `maxEvalLineLength` → size / line-cap / long-line skips — bounded input plus bounded time); ripgrep's engine watchdog (`GREP_FILES_MAX_RUN_MS = 3000`, ripgrep-engine path only) and find_replace_all's 15 s budget untouched; registration surface unchanged (still one tool, no new params).
- **Tests:** `tests/patternScanHangBackstop.test.ts` rewritten for the two-source contract — leg A fires the deadline DETERMINISTICALLY via jest fake timers at exactly `PATTERN_SCAN_MAX_RUN_MS + 100` ms (`aborted=true`, genuine partial survivors, cap warn fired EXACTLY once; immune to host I/O speed); regime-tolerant fast-scan leg (complete-vs-partial by host speed, shape-consistent in both); mid-scan HOST-signal abort leg updated ("one of two abort sources"); pre-aborted host-signal contract unchanged. The old fake-clock no-cap pin was replaced — it asserted the retired signal-only regime.
- **Verified:** code + tests on disk (edits 24.09 ~17:3x–17:4x); state re-verified by full read this shift; analyzer ESLint clean, tsc integration inert in this environment per house precedent. **OWNER GATE PENDING:** fresh `npx jest` (expected baseline UNCHANGED at **824 passed / 50 suites** — the RE-ARM replaced pins, did not add/remove tests) + `tsc --noEmit` + build; the ~18:35 C-compaction close predates/borders this code state.
- **Versioning:** no bump — v1.9.18 sticky (revision churn only via Hub publish); folds into the next **rev-3x** release pile alongside C compaction + `delete_lines` NEXT-REV removals; commit pending owner design (suggested msg: `feat(search): re-arm pattern_scan 3 s wall cap per owner order 24.09 (DE-STRAngle reversal, size bounds kept)`).

---

### [24.09.2026] — v1.9.18 rev 3x: C compaction family — oversized tool payloads pruned BEFORE summarization (folds into next release)

**One giant `read_file` no longer can eat the summarizer's context.** The C compaction family (24.09, DeepSeek-harness item C) prunes oversized role-`tool` payloads from chat history BEFORE ContextGuard summarization: a single >16 KiB tool result previously dominated the summarization prompt — pushing it toward/over the summary model's own window and into the documented "Original content unavailable" fallback that loses all detail — and then survived verbatim in `keepLast`, re-firing the compression threshold almost immediately. Now such payloads are replaced with a compact preview plus an opaque locator, while the full result is stored verbatim on disk (`<cwd>/.ai_toolbox/compaction/<sha256>.payload`) behind it — retrievable by the file-reading tools, nothing lost.

- **Policy (`src/utils/toolPayloadCompaction.ts`, pure):** role-tool-only texts (string / text-object / content-block shapes — exactly what ContextGuard ships to the summarizer); prune threshold 16384 UTF-8 bytes strict-greater; preview head 2048 + tail 512 chars under the `[ai_toolbox compaction]` marker (also the idempotency guard — already-pruned text is never re-pruned); opaque locator `compaction://<sha256hex>` as retrieval hint; in-place prune with honest byte-savings accounting; a missing/malformed paired digest fails loud and leaves the message untouched (never mints a fake digest).
- **Storage (`src/utils/toolPayloadStorage.ts`):** 0o600 exclusive create + symlink refusal; EEXIST → byte-compare idempotent reuse, mismatched bytes under an existing digest throw. Store-before-prune is default ON in `promptPreprocessor` — ANY store failure aborts that turn's prune (degrade-safe: history stays unpruned).
- **Serialization drain (`src/tokenStatsManager.ts`, 24.09):** turn-level state mutation (delta reset / history compression) now first drains active tool turns with a bounded wait (poll 250 ms, hard cap 15 s; cap-exceeded → loud FAIL-LOUD log + deferred mutation). `toolsProvider` records the active turns — no routing change.
- **Verified (owner-run gates, all green on final code):** full jest baseline unchanged at exactly **824 passed / 50 suites** · `tsc --noEmit` 0 errors · ESLint clean · tsup build OK. New suites: `tests/compactionPolicy.test.ts` (9) + `tests/compactionStorage.test.ts` (5) + `tests/drainGuard.test.ts` (5).
- **Versioning:** no bump — v1.9.18 stays sticky; folds into the next **rev-3x** release pile (package.json test-count claim 805/47 already accounts for these suites; commit pending owner design).

---

### [19.–23.09.2026] — v1.9.18 rev 3x: NEXT-REV cleanup / Q5=A+Q6 — dead-stub class removed, line-editing family consolidated to one module

**The `utilityTools` dead-stub class is gone and the line-editing family has a single home.** Three linked consolidations (decisions recorded in `docs/tool-consolidation-draft.md` §8a/§9–§9b): **(Q5=A, owner 23.09 @18:06)** `delete_lines`' unique capability — content-anchored deletion with ±3-line drift re-anchoring (`verify_before_delete`) — absorbed into its successor `delete_lines_in_file`, shipped as a ⚠️ DEPRECATED one-cycle alias (§4 house pattern); **(NEXT-REV, 23.09 @19:4x)** the alias channel + stub module removed per the one-cycle plan; **(Q6, owner 23.09, executed ~@21:0x)** `line_operations` moved from textProcessingTools.ts → fileSystemTools.ts (category repointed; tier intentionally kept 'standard' — flag CLOSED by owner decision 27.09: keep 'standard'). The same arc removed the dead `utilityTools.ts` module class (~1878 LOC + its tests/mocks) and trimmed stale locale lines.

- **What changed:** `src/tools/lineOperations.ts` DELETED (stub → gone; alias block in fileSystemTools.ts stripped) · `fileSystemTools.ts` gains the EOL-accurate line engine (`segmentLines` / `joinWithoutSegments` / `findVerifyWindow`) behind `delete_lines_in_file.verify_before_delete`, and now hosts `line_operations` (binary check inlined per file-system house pattern; post-write MD5 read-back) · jest mapper cleanup + `jest.setup.ts` mock block removed · locales ×5 trimmed/repointed · `toolPriority.ts` rows repointed, orphaned category map entry dropped.
- **Defect found while writing the tests (DRIFT-FIX v2 class):** files WITHOUT a trailing newline made the engine undercount lines by one (`floor(parts.length/2)` on an odd parts list) — last line unreachable, off-by-one `remainingLines`, truncated drift window; closed with the ceil-formula fix verified against editor-truth line counts for 8 EOL shapes.
- **Tests:** new suite `tests/lineOpsCrlf.test.ts` (byte-exact CRLF / mixed-EOL / pure-LF deletes incl. THE mixed-EOL regression, verify re-anchor/block semantics, removal guard); alias coverage replaced by error-payload-contract pins on the primary.
- **Verified (owner-run gates 23.09):** Q5=A gate closed @19:22 — **806 passed / 4 todo** · after NEXT-REV removal (@20:15–20:20) and after Q6 fold (~@21:26): full `npx jest` exactly **805/805 across 47 suites**, each with `tsc --noEmit` zero diagnostics, lint clean, build CJS+ESM+DTS success; `.bak` chains purged per owner instruction.

---
### [16.–19.09.2026] — v1.9.17 rev 31: pattern_scan cap removal (DE-STRAngle) + AutoTracker F1+F2 + cluster-aware tool ordering + CWD state relocation (F4)

**Search no longer truncates itself on large trees, tools now reach the model in dependency order instead of alphabetically, a reinstall can no longer strand your working directory — and the token-threshold machinery finally tells you when it acts.** This revision ships four verified change sets accumulated 16.–19.09 (version number deliberately unchanged by owner decision; pure rev-bump so LM Studio detects the update).

- **DE-STRAngle (16.–17.09):** `pattern_scan`'s inherited 3 s wall-clock cap REMOVED — it chronically aborted larger trees with `aborted: true` partial results, while since FIX-34a the pipeline is fully async and no sync segment can self-starve, so the cap's only effect was chronic truncation on trees >~68 files. Per-file worker dispatch replaced by inline host-thread eval (IPC overhead gone); the time-based watchdog is replaced by a deterministic size bound via new optional param `maxEvalLineLength` (default **10,000** chars) — over-long lines are excluded from regex eval and reported as `skipped('long-line')`. Host abort signals remain fully honored (mid-scan cooperative abort + partial results).
- **F2 — mid-loop checkpoint hysteresis (17.09):** the AutoTracker's mid-loop threshold guard re-fired on ANY token growth since its last save (~14 full disk writes + near-duplicate memory entries in one 17.09 session; smallest observed re-fire was +59 tokens). A re-fire now requires cumulative growth ≥ `max(4,096 est tokens, 5% of model context)`; the first threshold crossing still fires immediately (no behavior loss). Save-failure rollback resets the guard to zero so a retry behaves as a first crossing.
- **F1 — one-shot pre-compression notice (17.09):** previously a generated threshold prompt could be wiped in the same preprocess run that saved the pre-compression checkpoint (`consumePendingConfirmation` cleared the pending warning before any injection) — users saw nothing while context crossed ~100%+. Now, when a checkpoint is saved and a threshold warning was live in that same run, a one-shot notice (usage % + checkpoint id) is appended to that turn's model input. One-shot by construction; decision logic extracted into a pure exported helper (`buildCheckpointSavedNotice`) and jest-tested without SDK mocks.
- **Cluster-aware tool ordering (18.09):** `toolPriority.ts`'s long-finished cluster-aware ranking finally wired into production — exposed tool schemas now reach the model in priority-tier → module-centrality order instead of alphabetical, behind a `clusterAwareToolOrder` config toggle (default ON; OFF restores exact legacy alpha order). No tools hidden or removed. +3 tests in `tests/toolsProvider.test.ts`; F1/F2 follow-ups from the same gate round: `[CLUSTER-AWARE]` send-order log line for forensics, and `ripgrep`'s matched-line shape default aligned to the pattern_scan contract (300 chars).\r\n- **F4 — CWD state file relocated to persistent data dir (19.09):** the install-dir `.ai_toolbox_state.json` is wiped by every `lms dev --install`, and post-reinstall boot had no persisted CWD to restore, so the registry recency sort could pick a different project — relative ops silently resolved into the wrong tree until re-pinned. The production state now lives in LM Studio's persistent data dir (survives reinstalls), routed through the existing `getStateFilePath()` seam with a legacy-path try/catch fallback and one-time migration for pre-F4 copies. Live-verified on the 19.09 reinstall: fresh session resolved in ai_toolbox WITHOUT any re-pin.\r\n- **Verified (owner-run gates):** green at every arc gate; final full re-verification 19.09 — `npm test` exactly **745 passed / 45 suites** · `tsc --noEmit` 0 errors · ESLint clean · tsup build green via successful recompile+install. The running plugin IS this rev-31 surface: `[CLUSTER-AWARE]` send-order line observed in the server log, pattern_scan runs capless with size bounds (DE-STRAngle), and no CWD drift across reinstalls.
- **Versioning:** owner decision 17.09 — version number STAYS at v1.9.17; `manifest.json` revision advanced 30 → 31 so LM Studio detects the update (pure rev-bump precedent: v1.9.17 rev 30, 15.09); `package.json` description refreshed at each arc gate — final state **745/45** (19.09).

---
### [15.09.2026] — v1.9.17 rev 30: ripgrep TOOL SWAP shipped + registry consolidation + worker-pool thrash fix

**The `grep_files` era ends — search is now native ripgrep, the project registry has one unified tool, and back-to-back scans no longer pay a cold spawn per file.** This revision ships six verified changes accumulated 12.–15.09 (version number deliberately unchanged by owner decision; pure rev-bump so LM Studio detects the update).

- **RIPGREP TOOL SWAP (14.09):** `grep_files` REMOVED → standalone `ripgrep`: file walk AND pattern matching run natively in ONE worker-isolated ripgrep process off the host thread; 3 s wall-clock watchdog (`GREP_FILES_MAX_RUN_MS = 3000`) terminates wedged workers with `aborted: true` + partial results; **no result limits** (owner directive); invalid Rust patterns auto-retry ONCE as fixed strings. The 13.09 main-thread wedge class is structurally dead — only an engine watchdog can terminate the worker.
- **MANAGE remodel (12.09):** `register_project` → unified `manage_projects` (`register` / `unregister` / `update` / `clear_all`) with tombstone protection against stale session-memory resurrection; deprecated aliases kept one release cycle.
- **READS-EXTENSION (12.09):** `manage_projects` absorbs registry reads (`info` / `list` / `search`) — legacy alias tools delegate to the shared impl and preserve response shapes exactly.
- **FIX #32 (12.09):** recurring `[ERROR] [StateManager.updateSessionIndex]` log-noise class eliminated via silent skip of the orphaned per-copy legacy index (zero data impact; memory + session summaries unaffected).
- **SEARCH-NORM (15.09):** registry search now case- AND word-separator-insensitive — query `ai toolbox` finds registered project `ai_toolbox`; whitespace-only / all-separator queries match nothing (latent empty-substring bug fixed in the same pass).
- **DRAIN-GRACE (15.09):** delayed idle-drain of the regex worker pool (`REGEX_WORKER_DRAIN_GRACE_MS = 500`, cancel-on-acquire, shutdown cleanup) — closes the pattern_scan stall root cause: every release used to kill warm workers immediately, so each serial re-acquire paid a fresh spawn (~43–67 ms process creation plus pacing overhead); the live log had shown per-file spawned→drained cycles capped at ~97 files in 3 s.
- **Verified (owner-run gates, all green):** full `npm test` EXACTLY **730 passed / 44 suites** / tsc clean / tsup build green; LIVE check 15.09 after rebuild+reload — recursive `pattern_scan src/` completed cleanly (69 files, 147 ms), no per-burst spawn/drain cycles.
- **Versioning:** owner decision 15.09 — version number STAYS at v1.9.17; `manifest.json` revision advanced 29 → 30 so LM Studio detects the update (pure rev-bump precedent: v1.9.15 Hub-dependency hotfix, 03.09); `package.json` description refreshed to the current 730/44 test baseline.

---
### [08.09.2026] — v1.9.17 rev 29: Tool Gating Profile — your tool toggles now remember themselves

**Tool choices you make in one chat no longer vanish in the next.** LM Studio's per-chat config falls back to defaults for anything not explicitly persisted, so flipping e.g. `browserAutomation` on in one chat could silently reset it in a fresh one. The plugin now keeps its own user-level memory of your tool toggles: any toggle you set away from its default is captured automatically (no extra UI — the flip itself persists) into `%USERPROFILE%\.ai_toolbox\tool_gating_profile.json`, and applied back over per-chat defaults on every new chat ("sticky keys").

- **What changed:** new `src/tools/toolGatingProfile.ts` + one hard-wired, non-fatal pass in the tools provider (reconcile → overlay → finalize; atomic writes; booleans only — never paths/tokens/secrets). Sparse storage: toggles at their default are evicted, so defaults can evolve across versions without corrupting saved intent.
- **One deliberate nuance:** because a fresh chat's defaults are byte-indistinguishable from an explicit revert-to-default, re-flipping a toggle *back* to its default applies for that chat but does not clear the stored choice — clearing it means deleting/replacing that one JSON file (a `clear_tool_config` tool is on the roadmap).
- **Verified:** all gates green (typecheck / ESLint / full jest **761/761 across 46 suites**); live capture proven — real user toggles written to the profile file by the running plugin on 08.09.
- **Versioning:** `package.json` v1.9.16 → **v1.9.17**; `manifest.json` revision 28 → **29**.

---
### [08.09.2026] — v1.9.16 rev 28: `web_search` zero-result fallback fix

**A dead or empty search engine no longer stops the whole search.** When a bot-blocked engine (e.g. DuckDuckGo's API path under anomaly detection) responds with an unparseable shell page and **zero results**, `web_search` previously stopped there and returned nothing — even though later engines in the chain (Bing, verified working) would have succeeded. Now a zero-result engine is logged and skipped; only if *every* engine comes back empty does the search fail, with wording that distinguishes "engines responded but returned no parseable results (possibly bot-blocked)" from hard total failure.

- **What changed:** `src/tools/webResearchTools.ts` — 0-result response → log + continue to next engine; new `anyEngineEmpty` flag for the final error wording; `<2` sparse-but-real success threshold unchanged. Two regression tests added (`tests/webResearchTools.test.ts`, suite now 11/11).
- **Why it matters:** on bot-blocked IPs (datacenter/cloud), searches could silently return zero results while a working engine sat later in the chain. Same tool call, same parameters — now they succeed.
- **Verified:** jest 11/11 + ESLint 0 + tsc clean pre-rebuild; post-install live test on 08.09 — `web_search` returned 10 results via `ddg-fetch` after the blocked first engine was skipped (fallback logged in server log); no worker-pool anomalies post-restart.
- **Versioning:** `package.json` v1.9.15 → **v1.9.16** ("748 passing tests across 45 suites"); `manifest.json` revision 27 → **28**.

---
### [03.09.2026] — v1.9.15 rev 27: Hub-install dependency fix (hotfix re-publish)

**The ripgrep fast path now installs correctly on the LM Studio Hub.** `pattern_scan`'s B' prefilter and `grep_files`' rg engine load the npm package `ripgrep` lazily at tool-call time — but it was declared as a devDependency, so any production-scoped install would have silently disabled the fast path for every Hub user (permanent pure-JS fallback, no visible error).

- **What changed:** one-line declaration move (`devDependencies` → `dependencies`) + lock refresh; version pin unchanged at 0.3.1 — the build verified live this session on a fresh reinstall.
- **Why it matters:** official LM Studio docs confirm Hub installs auto-download dependencies from `package.json`/`package-lock.json`; a dependency required at runtime must sit in `dependencies`. Graceful fallback behavior is untouched either way — this removes the silent-degradation risk, not code.
- **Verified:** lock diff audited to exactly the planned flag flip (plus npm's own normalization of a stale lock version and within-range transitive patch bumps); post-refresh smoke suites 39/39 green incl. real-WASM integration (commit ec783a8).
- **Versioning:** no version-number change — revision advanced 26 → 27 so LM Studio detects the update; re-published via `lms push`.

---


### [v1.9.15] — 02.09.2026: `pattern_scan` ripgrep phase-1 prefilter (B')

**Faster regex-mode scanning for directory targets — same contract, same fallback guarantee.** The Option A architecture that v1.9.13 shipped to `grep_files` now runs in `pattern_scan`: an in-process WASM ripgrep pass names the files whose content can match; only those go through the worker pipeline, while every non-named file still produces byte-identical gate records and scan stats.

- **What changed:** regex-mode directory scans resolve candidates via one rg pass first (shared `src/utils/ripgrepEngine.ts` module — same instance and lazy-load discipline as grep_files, so a missing dep can never break plugin boot). Literal mode is honored for explicit-literal or demoted patterns; case-sensitivity follows the call (`caseSensitive`, default **true** — unlike grep_files' hardcoded `-i`).
- **Fallback is transparent:** Rust-dialect patterns (e.g. lookarounds), a missing dependency, or any engine failure → the full pre-B' JS walk runs byte-for-byte with every cap and skip-record contract intact. No short-circuit even on a clean "no matches".
- **One documented divergence:** a file rg proved pattern-absent no longer yields a `'binary'` skip record (detection needs content inspection; such files are unobservable in all other output fields). Pinned by tests that accept both regimes and fail on anything else.
- **Verified (user-run, 02.09):** typecheck / lint / build PASS + full Jest suite ALL GREEN after two minimal triage fixes (a literal-type annotation; an unescaped apostrophe in a test title). Both engine regimes exercised live on the dev machine — fallback byte-exactness and live phase-1 behavior each empirically confirmed.
- **Versioning:** released as **v1.9.15** — `package.json`/`manifest.json` bumped v1.9.14 → v1.9.15 on 02.09, revision advanced 25 → 26 so LM Studio detects the update (user-directed).

### [v1.9.14] — 02.09.2026: `get_memory` local-file parse guard (hotfix)

**Memory reads no longer silently abandon the project-local store.** After reinstalling v1.9.13, verification showed every `get_memory` call in projects with auto-context history logging a parse error to plugin stderr and falling back away from the documented #1 source (the working-dir memory file).

- **Why it happened:** that file is shared storage — `save_memory` facts (`{key,value,timestamp}`) sit next to auto-context entries (`{id,title,type,content,tags,…}`), which carry no `key`. The reader's `e.key.startsWith('memory_')` filter threw on the first such record, aborting the entire read. Writes were never affected; only reads degraded — facts lived in RAM but not from disk across a restart.
- **Fix:** 2-line null-safe guard in `src/tools/contextManagementTools.ts` at both read sites (local project file + plugin-root fallback) — keyless records are now skipped by the filter instead of throwing. No schema change, no new files, no behavior change for valid facts; all other output fields untouched.
- **Verified:** static re-read of patched lines + CRLF integrity audit; user-run gate: typecheck / jest / build green on v1.9.14, then reinstall → `get_memory` returns all local `memory_*` facts with no parse-failure line in `main.log`.
- **Versioning:** released as **v1.9.14** — `package.json`/`manifest.json` bumped v1.9.13 → v1.9.14 on 02.09, revision advanced 24 → 25 so LM Studio detects the update (user-directed).

### [v1.9.13] — 02.09.2026: New `grep_files` ripgrep-backed regex engine with JS fallback

**Faster regex-mode scanning for directory targets — same contract, same guards.** A new self-contained module (`src/utils/ripgrepEngine.ts`) runs an in-process WASM ripgrep (pithings/ripgrep-node 0.3.1, lazy-loaded on first use) as a **phase-1 candidate-file prefilter** before `grep_files` scans; phase 2 shapes matches with the existing code, byte-for-byte.

- **What changed:** regex-mode + directory targets now resolve which files can match in one rg pass (rg 15.x WASM), then only those candidates go through the proven shaping pipeline — line-splitting, >20k-char line gate, truncation + ellipses, context lines and all caps stay exactly as before. Single-file targets and AST mode are untouched code paths.
- **Fallback is transparent:** Rust-dialect patterns rg cannot parse (lookarounds/backreferences), a missing dependency, or any engine failure → the full-JS walk runs byte-for-byte with every hang guard intact (15 s deadline, worker isolation + 2 s kill for ReDoS-suspect patterns, wall-clock backstop). Missing dep can never break plugin boot.
- **No behavior regressions:** `skipped_files` records stay byte-identical to pre-change output (size-gate and line-cap entries included — verified by the parity suite vs a frozen golden baseline); `-i` always applies in regex mode as before; hidden-file scanning mirrors previous walker semantics.
- **Verified (user-run, 4 rounds):** typecheck 0 errors + full jest green + build success on round 4 after two triaged root-cause fixes (RC-C test-mapper, RC-D candidate-path relativization) and one skip-record parity fix (RC-E); zero unexplained parity diffs.
- **Versioning:** released as **v1.9.13** — `package.json`/`manifest.json` bumped v1.9.12 → v1.9.13 on 02.09, revision advanced 23 → 24 so LM Studio detects the update (user-directed).

### [01.09.2026 ~18:30] — Tier-1 dead-code removal (~90 KB / 1739 LOC; parity-verified)

**Removed 13 audited orphan files after a full AST + import-graph audit of all 140 TS files (zero referencers confirmed for each):** `src/utils/simulation.ts`, `src/toolsDocumentation.ts`, `src/tools/imageAnalysisTools.ts` (superseded by live `imageProcessingTools.ts`), `src/tools/{backupUtils,toolProtocolWarnings,executionRegistry,utilityRegistry}.ts`, dead recodeTool rules `rules/{deadCodeDetection,asyncModernizer,typeInference,modulePathNormalization}.ts`, plus stale artifacts `src/toolsProvider.ts.bak` + `tests/executedToolTransparency.test.ts.bak`.

- **Why it's safe:** none of these modules were reachable from the tsup entry (`src/index.ts`) → zero shipped-bundle impact; live equivalents kept and verified present in the same listings (`recodeEngine.ts`, `recodeTypes.ts`, `rules/unusedImports.ts`); `jest.config.cjs` needed no edits (full re-read confirmed).
- **No blind deletion:** an audit false-positive flagged `tests/grep_files.test.ts` as importing a missing module; full-file read showed the string exists only in test-fixture template literals → gate held, test kept.
- **Verification (user-executed):** typecheck 0 errors + full Jest suite green + tsup build success — identical BEFORE and AFTER all deletions.
- **Docs synced:** `ARCHITECTURE.md` module tree & recode-rule sections and `TOOLS_REFERENCE.md` rule table updated to current code state; historical changelog entries left as history.
- **Versioning:** no bump — v1.9.12 rev 23 stays current; folds into the pending user deploy (alongside the `executedTool` transparency stamp below).

### [01.09.2026 ~17:05] — Tool-result transparency stamp: `executedTool` (silent-substitution incident follow-up)

**Every plain-object tool result now carries the ground truth of what actually ran.** Follow-up to the 2026-09-01 "silent tool substitution" incident (model called a disabled tool name; log evidence attributed it to model-side substitution, not an ai_toolbox routing defect — but the transcript had no way to verify which implementation executed).

- **What changed** (`src/toolsProvider.ts`): the instrumentation wrapper stamps `executedTool` = registered name of the implementation that actually executed into every plain-object result. Additive-only: strings/numbers/arrays/null and non-plain objects pass through byte-identical; routing, side effects, timing and error propagation unchanged; FIX #20 token bookkeeping semantics preserved (records the original payload with the same ground-truth name).
- **Why it matters:** if a model believes it called tool X but the result says `executedTool: "Y"`, substitution is visible in the transcript instead of hidden behind a plausible-looking success narrative.
- **Tests:** new 8-test suite `tests/executedToolTransparency.test.ts` runs the real registration→minify→instrument pipeline with six side-effect-free probe tools (mocked at the jest-mapped stub path); includes a regression guard for FIX #20 A1 bookkeeping and unchanged error propagation. Guard logic additionally verified offline: 14/14 edge cases pass.
- **Status:** ⏳ pending user-side `npx jest tests/executedToolTransparency.test.ts` + full baseline (`657 + 8 new expected green`). Live activation = sync `src/toolsProvider.ts` into the LM Studio install (source-run) + full restart.
- **Versioning:** no bump — v1.9.12 rev 23 stays current; candidate for a future release decision.

### [v1.9.12] — 31.08.2026: New `pattern_scan` tool + puppeteer `connected` fix + dead-file removal

**Ships three code changes from the post-v1.9.11 (28.08) window, plus a full MD docs sync against current code.**

- **New `pattern_scan` tool** (`src/tools/fileSystemTools.ts`; clean-room engine `src/tools/patternScan.ts`) — recursive content search `{file, line, content}`; unsafe/invalid regexes auto-demote to literal mode (`demotedToLiteral`); caps: 256 KB / 10k lines per file (skips reported), 50 matches/file, global 200; single-file or directory root. Jest mock + mapper added; full suite green **657/657** (user-verified); live probe on the running plugin passed incl. dist-bundle stress test.
- **Puppeteer `connected` property-read fix** (`browserAutomationTools.ts` + `types.d.ts`) — puppeteer 24 exposes `Browser.connected` as a getter property, not a method; d.ts now declares `readonly connected: boolean`. Live probe passed (screenshot PNG magic-verified).
- **Dead file removed**: orphaned root-level `src/browserAutomationTools.ts` deleted behind backup `.ai_toolbox_backups/ai_toolbox-pre-deadfile-delete-20260831.zip`; seven stale `.bak` files cleaned, re-verified zero. Typecheck + jest green post-deletion (user-confirmed).
- **Docs sync**: `ARCHITECTURE.md`, `TOOLS_REFERENCE.md`, `DOCUMENTATION.md`, `QUICK_START.md` aligned with code — `pattern_scan` documented, File System 22→23 tools, unique totals 130→131, Git & GitHub table corrected to 15 (code-verified), dead-file reference removed, `screenshot_desktop` write lines re-attributed to `imageProcessingTools.ts` (external platform process writes the file — no Node-side atomic write there). `.bak` backups created for every edited MD.
- **README.md sync (31.08):** File System count 22→23 (+ `pattern_scan`) and test-bench figure updated to 657 tests / 38 suites — completes the MD alignment; version badge + release-highlights row now read v1.9.12

**Versioning:** released as **v1.9.12** — `package.json` + `manifest.json` bumped v1.9.11 → v1.9.12 on 31.08 (user-directed); manifest `revision` advanced 22 → 23 so LM Studio detects the update. *(The "folds into next release" framing in this entry was written pre-decision and is superseded by this line.)*

### [28.08.2026 ~21:15] — Documentation Sync: README Standout Tools + TOOLS_REFERENCE `grep_files` limits (docs-only, folds into v1.9.11)

**Added a "🏆 Standout Tools" highlight table to `README.md` directly under the 130-tools hero block**, plus corrected `TOOLS_REFERENCE.md` so its `grep_files` entry matches the current tool contract.

- **README.md** — 13-tool comparison table based on the Aug 2026 competitive survey (~115 hub plugins, beledarian/puppytucker/kyle-chen et al.): AST refactoring (`refactor_code`, unique in field), **AutoTracker + ContextGuard pipeline** (mid-loop 75%/90% token thresholds, automatic checkpoint summarization & compression — absent from every surveyed plugin), hang-safe `grep_files`/`find_replace_all`, guarded `line_operations`, background-command suite, browser automation, integrated multi-format RAG (PDF/DOCX/XLSX), `run_tests`, planning state machine, `secret_scan`, data visualization (`generate_chart` — zero in field), cross-project memory registry, backup/restore suite.
- **TOOLS_REFERENCE.md** — `grep_files`: added missing params `max_depth` (default 10, range 1–50) and `max_lines` (default 5000); documented deadline behavior (`aborted: true` + partial results per v1.9.9) and REV-24 prose-alternation handling.
- Docs-only change — no code, test, or version impact; `.bak` backups created for both files before edit.

### [30.08.2026] — `grep_files` per-call completion telemetry (live-verified; folds into next release)

**Every `grep_files` call now logs a one-line wall-clock summary to the plugin's stderr channel** (`%APPDATA%\LM Studio\logs\main.log`): `completed in <N>ms — <files scanned>, <matches>, <skipped>` (abort path logs `aborted in … [partial results]`).

- **Why:** cleanly separates scan time from model-generation time in log forensics — the "slow grep" reports turned out to be 2–17 ms scans wrapped by LLM generation.
- **Live-verified same day:** five consecutive production calls logged, all matching their returned JSON exactly (counter audit closed).
- Same evening's LM Studio app-freeze investigation used these lines to prove the plugin side was healthy end-to-end; issue filed upstream as host-side bug (`Canceling predictions timed out` class, recurring 08-26→08-30).

### [29.08.2026] — FIX-HANG-5: ReDoS-prone regex patterns now run in a killable worker (+ 5b/5c fixes)

**Closes the last hang class of `grep_files`:** catastrophic-backtracking patterns can no longer block the event loop (and with it every timeout guard).

- New triage gate (`patternNeedsWorkerIsolation`) routes only patterns that *cannot be proven cheap* into an isolated `node:worker_threads` Worker — hard-killed after 2 s budget, recorded in `skipped_files`, scan continues. Safe patterns keep the inline fast path (zero overhead).
- **5b:** triage anchor fix — `((a+){3}){4}x`-style quantified subgroups now route correctly (old `$`-anchored check was defeatable by trailing content; T1b double-freeze root cause).
- **5c:** Node-worker API contract fixed (`parentPort`; the browser-style shape threw `self is not defined`, misreporting every risky pattern as a 2 s kill with zero work done). Offline repro: catastrophic payload hard-killed at exactly 2000 ms.

---


---

## v1.9.11 — Released 2026-08-28: grep_files Bare-& Fix (REV-24)

**Closes the v1.9.10 maintenance window with a version bump to v1.9.11 (user-directed decision, supersedes the 25.08 "no bump" policy).** Headline fix eliminates a class of silent 0-match failures in `grep_files`.

### What Changed
- **Bare-`&` alternations stay in regex mode (REV-24)** (`src/security.ts`, `isSafeRegex()`): prose patterns like `"Backup & Restore|Git & GitHub"` were silently forced into literal mode → 0 matches → LLM retry loops. Root cause: the code-signature heuristic paired a bare `&` with `*+?` indicators — though `&` is not a JS regex metacharacter (zero ReDoS risk). Clause-1 char class now excludes bare `&`.
- **Explanatory hints on forced-literal decisions** (`src/tools/fileSystemTools.ts`): forced-literal outcomes now return `patternMode:"auto_escaped"` with a human-readable hint string — no more silent failures.

### Impact
- ✅ Prose alternations containing `&` match correctly (live-verified: 4/4 expected matches in TOOLS_REFERENCE.md)
- ✅ Genuine C++-style code-signature patterns are still auto-escaped when paired with an unescaped `*`, `+` or `?`
- ✅ No API, parameter or response-shape changes to any other tool

### Verification
- ✅ tsc / tsup build / lint all OK; Jest **36/36 suites + 628/628 tests** green (incl. 3 new REV-24 regression specs)
- ✅ Live runtime: first smoke run RED → forensics proved a stale installed copy (not a code defect); after src-sync into the LM Studio install + full restart, the exact symptom pattern returned `patternMode:"regex"` + exactly 4 matches

**Versioning:** released as **v1.9.11** — `package.json` + `manifest.json` bumped v1.9.10 → v1.9.11 on 28.08 (~20:45) per user decision; baseline backup taken (`.ai_toolbox_backups/ai_toolbox-v1.9.11-release-baseline-2026-08-28.zip`).

---

### Chunking Fixed-Point OOM Termination + Test-Isolation Hardening

**Fixed a deterministic multi-day V8 heap OOM (`Ineffective mark-compacts near heap limit`) in the vector-RAG text chunkers — and closed the last failing test (cross-test mock contamination) in `tests/webResearchTools.test.ts`.**

#### What Changed
- **Chunking termination guarantee** (`src/tools/vectorRagTools.ts`): `chunkText`, `chunkDocxText`, and `chunkPdfText` could loop forever when a partial final chunk was shorter than the overlap word budget — for certain text lengths the window start reached a fixed point (`startIndex === endIndex`). All three now enforce strict forward progress: `startIndex = Math.max(endIndex, startIndex + 1)`.
- **Regression coverage** (`tests/vectorRagTools.ragWebContent.test.ts`): the oversized-page spec exercises the poison-remainder path end-to-end; heading assertion aligned with `html-to-text`'s default heading uppercasing (case-insensitive).
- **Test isolation** (`tests/webResearchTools.test.ts`): shared mocks are now reset in `beforeEach` and re-seeded explicitly — no more state leaking between tests.

#### Impact
- ✅ No API, parameter, or response-shape changes to any tool.
- ✅ Vector-RAG tools on large/odd-length documents can no longer exhaust the host heap via an unterminated chunking loop.
- ✅ Deterministic full test suite (no order-dependent failures).

#### Verification
- ✅ Full Jest suite green — user confirmed 25.08.2026 ~00:13 (`npm test`).
- ⏳ Rebuild + reinstall before the next live vector-RAG use on large documents (`npm run build`; bundles carry no version strings).

**Versioning:** stayed at v1.9.10 (no bump) — maintainer decision 25.08 *(superseded by the v1.9.11 release of 28.08)*.

---

## Web-Fetch OOM Guard: Size Caps Now Enforced During Transfer

**Eliminated a class of plugin-host crashes (`JavaScript heap out of memory`) caused by unbounded page-body buffering in the web tools.**

### What Changed
1. **`fetch_web_content`**: previously buffered the full page with `response.text()` and only *then* checked its 50 KB cap — oversized pages exhausted the host's heap first. The cap is now enforced while streaming; the socket is cancelled the moment the budget trips.
2. **`rag_web_content`** (vectorRAG): previously a raw, uncapped, unbounded fetch plus ~5–10× memory amplification in chunking. Now bounded to 500 KB and routed through the shared timeout/retry helper.
3. **All `fetchWithRetry` paths**: every attempt is now time-bounded (30 s AbortController timeout), matching the existing `http_*` tools' convention — slow or stalled transfers can no longer hang indefinitely.

### Impact
- ✅ Oversized pages produce a clean, fast error instead of risking host death (`Page too large (…) … Use searxng_search + summary_only`).
- ✅ Memory growth for oversized-page handling is bounded to ~the cap size, not the page size.
- ✅ Tool names, parameters and response shapes unchanged — no LLM-visible behavior change beyond faster/cleaner failure on huge pages.

## Silent Auto-Registration Bug Fixed: Explicit Confirmation Required for Project Registration

**Eliminated silent auto-registration of wrong/stale project paths without user confirmation.**

### What Changed

#### 1. Startup Auto-Registration Removed (src/index.ts)
- **Root Cause**: main() called initializeProjectDetection(cwd) unconditionally during plugin startup - silently registered whatever directory it found instead of the actual project path.
- **Fix**: Removed both the import and the call from index.ts. Added explanatory comment documenting that projects must be registered explicitly via the register_project tool.

#### 2. Safety Gate: explicitConfirmation Parameter (src/projectAutoDetect.ts)
- **Root Cause**: autoDetectAndRegister() and searchWithAutoRegister() had no confirmation gate - they would register any valid project directory without user input.
- **Fix**: Added explicitConfirmation: boolean = false parameter to both functions. Both now return { registered: false } when the flag is not explicitly set to true.

#### 3. initializeProjectDetection() Marked DEPRECATED (src/projectAutoDetect.ts)
- The function still exists for backward compatibility but no longer calls any registration logic - only detects and logs project info + deprecation warning.

### Root Cause Addressed
Prior to this fix, the silent auto-registration bug occurred because:
1. User said "let's work on ai-toolbox" → registry search returned empty (project not yet registered in current session)
2. initializeProjectDetection(cwd) was called unconditionally at startup
3. It detected whatever directory happened to be active and silently registered it
4. The correct project path was never used

### Impact
- ✅ **No more silent registration**: Projects can only be registered via explicit `register_project` tool call with confirmed path
- ✅ **Startup is clean**: main() no longer auto-registers — only logs detection info + deprecation warning if initializeProjectDetection() is called externally
- ✅ **Search is safe**: searchWithAutoRegister() returns empty without registering unless explicitly confirmed
- ✅ **Backward compatible**: All existing APIs preserved; new parameters default to false (blocked) which prevents accidental registration

---

### Crash-Resilient Atomic Writes: Shared atomicWrite Utility and Full Async Conversion Across 9 Modules

**Eliminated all synchronous file writes from the codebase; introduced shared crash-resilient atomic write utility with randomized temp filenames and rollback-on-failure protection.**

#### What Changed

##### New Shared atomicWrite Utility (src/utils/atomicWrite.ts)
- ✅ **Randomized temporary filenames**: Uses `crypto.randomBytes(9)` for unique temp file names — prevents collisions even under rapid concurrent writes, eliminates stale temp files from prior crashes
- ✅ **Atomic write pattern**: Write to temp file → atomic rename → delete temp on failure. Survives process termination mid-write (temp file orphaned but original intact)
- ✅ **Binary file support**: Dedicated `atomicWriteBinaryFile()` function uses raw buffer writes with no text encoding — preserves exact binary content for image processing and other non-text operations

##### Full Async Conversion (9 Modules)
All previously synchronous file-write tools converted to async with shared atomicWrite:
| Module | Tools Affected | Previous State | New State |
|--------|---------------|----------------|-----------|
| lineOperations.ts | delete_lines, line_operations | Sync writes via fs.writeFileSync | Async → atomicWrite |
| refactorCodeTools.ts | rename_identifier, move_function, extract_function, unused_import_cleanup | Sync writes | Async → atomicWrite + **rollback-on-failure** |
| utilityTools.ts | ~25 utility tools (backup, chart, line ops) | Mixed sync/async | All async → atomicWrite |
| dataVisualizationTools.ts | generate_chart | Sync PNG write | Async → atomicWriteBinaryFile |
| imageProcessingTools.ts | describe_image, compare_images output saves | Sync writes | Async → atomicWriteBinaryFile |
| markdownPreviewTools.ts | markdown_preview HTML save | Sync write | Async → atomicWrite |
| browserAutomationTools.ts | screenshot_desktop PNG save | Sync write | Async → atomicWriteBinaryFile |
| uiGenerationTools.ts | UI component saves | Sync writes | Async → atomicWrite |
| recodeEngine.ts (recodeTool/) | AST transformation output | Sync writes | Async → atomicWrite + rollback-on-failure |

##### Rollback-on-Failure in refactorCodeTools and recodeEngine
- ✅ **Source code protection**: When atomic write fails during AST refactoring, tool automatically restores original file from `.bak` backup before returning error — prevents corrupted source files

### Impact
- ✅ **Crash resilience**: Randomized temp filenames + atomic rename survive process crashes; original file intact even if write interrupted mid-operation
- ✅ **Event-loop non-blocking**: All 9 modules now async — no more `writeFileSync` blocking the event loop during LLM tool chains
- ✅ **Binary integrity**: `atomicWriteBinaryFile()` uses raw buffer writes — image processing and chart generation preserve exact binary content
- ✅ **Source code safety**: Rollback-on-failure in refactorCodeTools prevents corrupted source files from failed AST transformations
- ✅ **Zero sync writes remaining**: All file operations use shared async atomic write pattern — consistent error handling across entire codebase

---

### DEP0190 Fix: Eliminate shell:true Deprecation Warning

**Replaced all child_process.exec() calls with explicit shell spawning via spawn(cmd.exe /c, ...) in gitGithubTools.ts. Zero behavioral changes; zero breaking changes.**

#### What Changed
- ✅ **Removed exec import + promisify**: Replaced with single `import { spawn } from 'child_process'`
- ✅ **Added safeExec() helper function**: Explicit shell spawning using `cmd.exe /c` (Windows) or `/bin/sh -c` (Unix/macOS) — never uses `{ shell: true }`, avoiding Node.js DEP0190 warning
- ✅ **All 12 git command invocations updated**: git diff, git commit, git checkout -b, git push, git stash push/pop/drop/list, git blame now use safeExec() instead of execPromise()

### Impact
- ✅ **DEP0190 warning eliminated**: No more shell:true deprecation warnings in logs when using any git/GitHub tools
- ✅ **Behavioral parity preserved**: safeExec() replicates exact semantics of the original execPromise() — same stdout/stderr capture, same cwd support, same error propagation via rejection
- ✅ **Cross-platform correct**: Windows uses cmd.exe /c, Unix/macOS uses /bin/sh -c — matches Node.js's internal exec behavior

---

### Auto-Tracker Chat-Warning Regression Fix + Confirm-First Project Switching (v1.9.8+)

**Fixed the checkpoint warning that was generated but never surfaced in chat; restored confirm-first working-directory switching and added German JA/NEIN reply support.**

#### Root Cause
A Step 0.7 refactor silently switched the working directory on project-keyword match — burying the pending checkpoint warning (logs: "THRESHOLD PROMPT GENERATED"; chat: nothing) and bypassed Step 0.6 reply handling. Reply detection accepted only English YES/NO, and transitionTo() cleared pending warnings on any state change.

#### Fixes
- **Fix A** (`promptPreprocessor.ts`): confirm-first banner — no CWD change on detection; one-shot switch only after an explicit YES/JA reply in a later message, then resets
- **Fix B** (`promptPreprocessor.ts`): JA/NEIN normalized onto canonical YES/NO FSM inputs for checkpoint replies
- **Fix C** (`autoTracker.ts`): transitionTo() no longer clears pendingCheckpointWarning on unrelated state changes; warning injected into all preprocessor return paths while pending

#### Verification
- ✅ 536 Jest tests passing across 26 suites — zero regressions
- ✅ dist/ rebuilt post-fix with zero dynamic-import patterns; manifest v1.9.8 rev 18 unchanged

---

### Project Keyword Detection + Cross-Project Registry Sync Fix (v1.9.8+)

**Eliminated the "ai-toolbox not found" clarification loop by adding Step 0.7 project keyword detection in promptPreprocessor.ts and _syncFromSessionMemory() lazy registry sync.**

#### Problem: Clarification Loop
When users mentioned a registered project name (e.g., "switch to ai-toolbox"), the AI would:
1. Call `search_projects(query="ai-toolbox")` → empty results (stale registry)
2. Ask user for confirmation path → clarification loop

**Root Cause**: The cross-project registry was never synced from session memory decisions. Projects detected via keyword matching in Step 0.7 were registered once but not auto-synced when search_projects was called later.

#### Fix: Two-Layer Approach
- **Layer 1 — promptPreprocessor.ts (Step 0.7)**: detectProjectKeywords() reads project_registry.json, fuzzy-matches message words against registered projects (hyphen↔underscore normalization), and injects a confirmation prompt before falling through to directory-path detection or RAG.
- **Layer 2 — registryManager.ts (_syncFromSessionMemory())**: Scans .ai_toolbox_memory.msgpack for project_path fields and auto-registers missing projects — called lazily inside search_projects / get_project_info, so no startup overhead.

#### Trigger Points (v1.9.8+)
| Tool | Sync Trigger | Purpose |
|------|-------------|---------|
| search_projects | _syncFromSessionMemory() before query | Ensures registry includes projects from past decisions |
| get_project_info | _syncFromSessionMemory() before lookup | Same — prevents stale registry entries |

#### Impact
- ✅ **Eliminated clarification loop**: Projects detected via keyword matching now auto-sync to registry on next search call
- ✅ **Lazy sync pattern**: No startup overhead — registry only synced when actually needed (search_projects/get_project_info)
- ✅ **Backward compatible**: Existing register_project tool with explicitConfirmation=true still works as primary registration method

---

### Image Analysis Tool Type-Safety Fixes (v1.9.8+)

**Resolved TypeScript compilation errors and ESLint warnings through ESM conversion and proper type assertions.**

#### What Changed in src/tools/imageAnalysisTools.ts
- ✅ **ESM import conversion**: Replaced `require('../attachmentManager.js')` (CommonJS) with static ESM import — eliminates @typescript-eslint/no-require-imports warning
- ✅ **FileHandle type assertion**: Added local type FileHandleWithReadFile = { name: string; readFile?: () => Promise<Buffer> } and cast via as unknown as FileHandleWithReadFile | undefined — resolves TS2339 error where SDK's FileHandle type lacks .readFile() declaration (matching pattern from promptPreprocessor.ts:218-247)
- ✅ **Removed unused eslint-disable directive**: Deleted dead Tesseract.js disable block (@typescript-eslint/no-unsafe-*) — file no longer imports Tesseract

### Impact
- ✅ **Zero TypeScript errors**: tsc --noEmit passes clean
- ✅ **Zero ESLint warnings**: All @typescript-eslint/* rules satisfied
- ✅ **Build verified**: npm run build succeeds (ESM 11.99MB, CJS 12.63MB)

---

### Documentation Sync (v1.9.8+)

**Synchronized version references and added missing module documentation across project files.**

#### What Changed
- ✅ **DOCUMENTATION.md**: Added v1.9.8+ module additions section (+6KB) covering executionRegistry, fileModTracker, toolProtocolWarnings, utilityRegistry, simulation, imageAnalysisTools
- ✅ **TOOLS_REFERENCE.md**: Added Image Analysis tool documentation with parameter specs and type-safety notes (+1.8KB)
- ✅ **CHANGELOG.md**: Inserted v1.9.8+ changelog entry at top of file (+6.3KB)

### Impact
- ✅ All project documentation now reflects current codebase state
- ✅ Zero stale version references found across all MD files
- ✅ New modules properly documented for LLM tool discovery and user reference
