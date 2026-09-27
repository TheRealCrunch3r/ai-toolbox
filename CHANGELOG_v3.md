# Changelog — ai_toolbox (active)

> **This file supersedes [`CHANGELOG_v2.md`](CHANGELOG_v2.md)** (rotated out on 20.09.2026 after the v2 file exceeded a comfortable single-session read size; its pre-rotation entries are kept in `CHANGELOG_v2.md` with an index + pointers, and `CHANGELOG.md` remains archived legacy history).
> New entries are added at the top of this file. Details below were compiled from verified session records and bundle-level verification (`dist/index.js` + `index.mjs` are unminified, so shipped content was confirmed byte-exact).

**Current release: v1.9.18** (`package.json` + `manifest.json`; **revision 33**, owner publish pending — revision 30 was published to GitHub 15.09): ripgrep tool swap + registry consolidation + worker-pool thrash fix (see RELEASE_NOTES rev-30 entry). Version sticky at v1.9.18 per owner decision 21.09; the rev-32 pile shipped DE-STRAngle (`pattern_scan`, 16.–17.09), AutoTracker F1+F2 (17.09), cluster-aware tool ordering (18.09), the F4 CWD state relocation (19.09) and the SPEC-C memory-store data-loss arc — shared-file interleave fixed at the root in BOTH writers (20.09; entry below). Latest arcs (both 21.09): EOL-FIX — `replace_text_in_file` byte-exact round-trip + `get_file_metadata` eol/bom reporting (top entry) and FIX #33 Suite D lost-write lock.

## [25.09.2026 ~18:3x] — RESTORE SESSION CONTEXT: one read-only composite resume tool `restore_session_context` ("read session mem" in a single call)

**Context:** recurring owner workflow ("go to ai toolbox and read the session mem") costs 5–7 sequential tool calls (`get_session_summary`, `list_sessions`, `search_sessions`, `get_memory`, plan read, context reads) — each one another turn of latency against local LLMs. Option B (composite resume read, presented alongside an Option A consolidation refactor on 23.–24.09) is the minimal-scope fix: no schema change, no new storage, no writes.

**Changes:**
- **`src/tools/restoreSessionContextTool.ts` (NEW):** `registerRestoreSessionContextTool(config, stateManager?)` → single tool `restore_session_context`. Composes FIVE existing read surfaces, zero new I/O primitives: ① session summary — RAM `StateManager` first, then file record (priority parity with `get_session_summary`, incl. legacy JSON-string value fallback), ② persisted plans via `PlanStorageManager.load()` with `get_plan` selection semantics (newest by `createdAt`; older plans counted but not rendered verbatim), ③ explicit memory facts (`memory_*` records of the shared `.ai_toolbox_memory.msgpack` store, read via one raw `decode()` — no manager instance, no frequency bumps), ④ context entries via `ContextStorageManager.loadEntries()` (working-dir file + plugin-root fallback; expired session-scoped entries skipped locally WITHOUT persisting TTL pruning — CSM read-time-TTL mirror, store untouched), ⑤ sessions index via `SessionIndexManager.getAllSessions()`. Machine-written auto-checkpoint noise (`auto_checkpoint`/`token_threshold` tags) collapses to ONE line: count + date range + peak usage % (regex over the title). Output = Markdown dossier with per-family presence/staleness header (STALE > 3 days), machine `counts` block, hard `max_chars` budget (default **16000**, marker `[TRUNCATED at max_chars=…]` + omitted-section list when bound hit — budget covers section content; marker overhead documented). Self-describing absent/legacy sections on fresh or corrupt stores (`no session summary found…`, `none stored for this project`). Params: `include_sessions_index` (default true), `max_chars` (**1000**–50000, default 16000 — floor lowered from 2000 post-verification: see below).
- **`src/toolsProvider.ts`:** import + `TOOL_REGISTRIES` entry under the existing `contextManagement` key (`registerRestoreSessionContextTool(config, stateManager)`) — inherits the memory-family toggle; no config/UI surface change.
- **`jest.config.cjs`:** three RC#4-class per-file mapper entries added BEFORE the tools-mock fallback (first match wins): module-specifier entry for `restoreSessionContextTool.ts`, plus sibling imports `'./contextManagementTools.js'` + `'./taskPlanningTools.js'` → REAL src (emitters verified unique). Real-src target matches how 15+ existing suites already load `contextManagementTools` under jest.
- **Locales ×5** (`en/de/es/zh-CN/zh-TW.ts`): `restore_session_context` line appended at the contextManagement block end (anchored on the vectorRag boundary); pre-existing zh-TW bracket typo fixed in same pass.
- **`src/tools/toolPriority.ts`: DELIBERATELY UNTOUCHED** — house precedent (`get_repeat_tool_advice`, 25.09): unrated tools flow through via the fallback tier; cluster-aware ordering already handles exposure position.

**Tests:** NEW hermetic suite `tests/restoreSessionContext.test.ts` (10 tests, zero `.each()`): workingDir mocked to a per-run temp dir; all three store files seeded in REAL on-disk shapes (shared msgpack = state records + context entries in ONE file — the SPEC-C layout). Pins: full dossier counts + every family body present · newest-plan-wins (older plan never rendered as active, counted in note) · checkpoint collapse to exactly one line with peak 99.5% and verbatim bodies ABSENT · **read-only contract** (all store files byte-identical before/after the call — kills the accidental-persist class by construction) · truncation marker + omitted-section naming under a small budget · fresh-project self-describing dossier (`success: true`, `missing` staleness, no throw) · legacy string-valued summary parse parity with `get_session_summary` · RAM-hit-wins over file content (fake store) · `include_sessions_index=false` omits section + zeroes count without touching other families · >3-day staleness flag in header.

**Verification:** ✅ VERIFIED — owner-run gates 25.09 ~19:3x (green confirmed): full `npm test` **850/850 passed / 53 suites** · `npx tsc --noEmit` clean · ESLint clean — exact match with the prediction above (baseline 840/52 + this suite's 10). Post-gate fixes landed in the same session BEFORE green: 3× `no-unnecessary-type-assertion` lint errors closed behaviorally-neutral (`src/tools/restoreSessionContextTool.ts`) · 3 test failures root-caused — CSM stamps/compares `project_path` with the **memory-file path** (not the bare directory), so fixture seeds now use `STORE_STAMP = <wd>/.session_context/.ai_toolbox_memory.msgpack`, mirroring production stamping; production code deliberately untouched · `max_chars` schema floor 2000 → **1000** (`MIN_MAX_CHARS`) — a 2000 floor made the truncation contract untestable because @lmstudio/sdk zod validates params *before* implementation runs (no legal param value could exercise it); truncation pin re-budgeted to `max_chars=1250`. Post-green doc sync executed 27.09 (owner GO): README + package.json count claims → 850/53.

**Versioning:** no bump — v1.9.18 sticky per owner decision 21.09; folds into next rev-3x alongside the LOOP HYGIENE B entry below. `package.json`/README test-count claims SYNCED to the verified **850/53** on 27.09 (owner GO) — this also resolved the pre-existing README drift noted above (badge 836/51 vs table "840/52").

---
## [25.09.2026] — LOOP HYGIENE B: Repeat Tool Reminder implemented

**Context:** DeepSeek-harness research item B, loop-hygiene guard with threshold ladder [3,5,8] on identical tool+args calls.

**Changes:**
* `src/utils/repeatToolReminder.ts` – canonical key via stableStringify, per-turn counter, advisory messages at 3/5/8
* `src/tools/repeatToolReminderTools.ts` – new utility tool `get_repeat_tool_advice` for read-only visibility, preserves executedTool transparency
* Wired into `toolsProvider.ts` with `repeatReminder.nextTurn()` and console.warn nudges
* Jest module mappers added for `repeatToolReminderTools.js` and utils imports
* `RESEARCH_implementation_status.md` updated: B → ✅ Implemented 25.09

**Verification:** lint clean, typecheck clean, full suite 52/52 suites, 840 tests passed.

## [25.09.2026] — PIPELINE HYGIENE D: unified tool-execution pipeline (outcome taxonomy + finalizeContent invariant) wired into toolsProvider; RC#4 mapper entry + no-base-to-string close

**Context:** DeepSeek-harness research item D, re-verified 25.09 against the live error paths (`RESEARCH_implementation_status.md`): tool error handling was AD-HOC per-tool with no unified pipeline invariant, while items C (compaction, 24.09) and E (fail-loud pervasive) were already done and B (repeat-tool-reminder) remains a known gap. The D item lands the unified seam: one pipeline that every tool execution can settle through — distinct monotonic-guard outcomes (success/error/deny/abstain), the finalizeContent invariant (tool-owned content always finalized before surface), and fail-loud guards at load + runtime.

**Changes:**
- **`src/utils/ToolExecutionPipeline.ts` (NEW, PURE — no fs/SDK/globals):** `ToolOutcome = ToolSuccess | ToolError | ToolDeny | ToolAbstain`; `execute(toolName, args, impl, finalizer?)` enforces the monotonic guard (canonical key = tool name + deep-stable sorted-key JSON of args; an identical call within one turn → kind `abstain`, no re-execution), normalizes legacy `{success, data/error}` return shapes into the taxonomy, and catches unhandled impl exceptions (`code: UNHANDLED_EXCEPTION`). Finalizer chain = per-tool registered > pipeline default; a `success` finalizing to empty content raises a FAIL-LOUD `[ToolExecutionPipeline]` console.warn (non-blocking). Constructor fails loud if `defaultFinalizer` is not a function. Module-level helpers `deny(reason)` / `abstain(reason)`. NEW 25.09 lint close: `describeError()` helper renders unknown error values safely — string passthrough / `Error → "name: message"` / `JSON.stringify` (circular-safe fallback) / 'Unknown error'; replaces the prior String(err ?? …) form which both tripped `@typescript-eslint/no-base-to-string` and would have surfaced plain-object errors as `[object Object]`.
- **`src/utils/withPipeline.ts` (NEW):** process-level wiring — lazily-created shared pipeline singleton (`getPipeline()`); exports `withPipeline()`, `registerToolFinalizer(toolName, fn)`, `resetToolGuard()`.
- **`src/toolsProvider.ts`:** static import of `./utils/withPipeline.js`; calls `resetToolGuard()` on EVERY provider invocation — the monotonic seen-set is per-turn by construction (one toolsProvider call = one turn; test isolation for free). Adoption note: per-tool wrapping via `withPipeline()` is incremental — as of 25.09 no tool implementation is wrapped yet (behavior-neutral until wired).
- **`jest.config.cjs`:** PIPELINE-D per-file `moduleNameMapper` entry '.\./utils/withPipeline.js' → src/utils/withPipeline.ts after the single-dot hubExclusionClustering rule (RC#4 class — first suite loading the new static import crashed with "Cannot find module"; verified post-edit via Node-parsed first-match simulation incl. 6 regression probes).

**Tests:** dedicated pipeline suite under `tests/utils/` (new); full baseline moves **824/50 → 836 passed / 51 suites**.

**Verification:** ✅ CLOSED 25.09 — owner-run gates: full jest **836 passed / 51 suites** (16:11) + `npx eslint src/utils/ToolExecutionPipeline.ts` clean, 0 problems (16:12), closing the `no-base-to-string` fix with the real rule engine.

**Versioning:** no bump — v1.9.18 stays sticky per 21.09 owner decision; folds into the next rev-3x alongside the pattern_scan RE-ARM entry above. `package.json` test-count claim NOT yet synced to 836/51 (pending owner design, with commit). Docs pass: ARCHITECTURE.md gained the Tool Execution Pipeline Hygiene section + two Utility Modules bullets (this pass).

---
## [24.09.2026] — PATTERN_SCAN RE-ARM: wall-clock cap restored (PATTERN_SCAN_MAX_RUN_MS = 3_000), owner order "abort after 3 seconds"

**Context:** DE-STRAngle (16.–17.09) had removed pattern_scan's wall budget (deadlineMs=0, host-signal-only; the live clock produced chronic `aborted: true` partials on larger trees). On 24.09 a **>60 s zero-payload scan incident** (slow-FS I/O, re-attributed to pattern_scan) showed an unbounded walk is worse than bounded partials — owner order of the day: **"pattern_scan shall be aborted after 3 seconds"**. The deterministic SIZE bounds (`maxFileSizeBytes`, `maxFileLines`, `maxEvalLineLength`) are KEPT alongside the cap (owner option chosen from the pending decision presented ~18:xx).

**Changes:**
- `src/utils/grepGuard.ts` — history note on `PATTERN_SCAN_MAX_RUN_MS = 3_000` extended with the RE-ARM provenance (arc: set by user order 04.09 at 500 → raised to 3000 on 13.09 → removed/host-signal-only by DE-STRAngle 16.09 → re-armed 24.09 per owner order); `GREP_FILES_MAX_RUN_MS` doc comment cross-referenced back to it (was "REMOVED … — see note above").
- `src/tools/patternScan.ts` — guard creation now arms BOTH abort sources: `createGrepGuard(options.abortSignal, PATTERN_SCAN_MAX_RUN_MS, 'pattern_scan')` (previously signal-only / `deadlineMs=0`). Wall deadline + host signal converge on ONE `guard.signal`, checked cooperatively at every file boundary → PARTIAL results + `aborted: true`. `disarm()` in finally releases timer AND host-signal listener on EVERY completion path (no orphan cap-warn post-settle — FIX-HANG-3 class). Module header + result-type `aborted?` comment updated; tool description carries the wall-clock hint again.
- **Tests:** `tests/patternScanHangBackstop.test.ts` rewritten for the two-source contract: leg A fires the deadline DETERMINISTICALLY via jest fake timers (advance to exactly `PATTERN_SCAN_MAX_RUN_MS + 100` ms → asserts `aborted=true`, partial survivors, cap-warn fired EXACTLY once) — immune to host I/O speed; regime-tolerant fast-scan leg (complete-vs-partial by host speed, shape-consistent in both); mid-scan HOST-signal abort leg updated ("one of two abort sources"); pre-aborted host-signal contract unchanged. The old fake-clock NO-CAP pin was replaced — it asserted the retired signal-only regime.

**Verification:** code + tests on disk (edits 24.09 ~17:3x–17:4x); state re-verified by full read of all four touched files this shift (~20:xx). Analyzer ESLint clean; **tsc / jest / build = OWNER GATE, PENDING** (analyzer tsc integration inert in this environment per house precedent). Expected baseline UNCHANGED at **824 tests / 50 suites** — the RE-ARM replaced pins, did not add/remove tests; the ~18:35 C-compaction full-jest close predates/at-borders the code mtimes → a fresh full run is required to close this entry.

**Versioning:** no bump — v1.9.18 sticky per 21.09 owner decision (revision churn only via Hub publish); folds into the next rev-3x alongside C compaction + `delete_lines` NEXT-REV removals. No package.json test-count claim change (baseline unchanged). Commit pending owner design — suggested msg: `feat(search): re-arm pattern_scan 3 s wall cap per owner order 24.09 (DE-STRAngle reversal, size bounds kept)`.

## [24.09.2026] — C COMPACTION FAMILY: oversized tool payloads pruned BEFORE ContextGuard summarization (store-before-prune + bounded serialization drain)

**Context:** DeepSeek-harness item C, re-analyzed 24.09 against the live compression path. `ContextGuard.compressHistory()` summarizes everything but the last `keepLast` messages and keeps those verbatim — so a single oversized tool result (giant `read_file` / web-fetch payload) did two distinct damage classes at once: (a) it dominated the summarization prompt, pushing it toward/over the SUMMARY model's own context window — a leading cause of the documented "Original content unavailable" fallback that loses all detail; and (b) it survived in `keepLast` verbatim forever, so the very next threshold check re-fired almost immediately. Pruning BEFORE summarization shrinks both at once — and nothing is lost, because every pruned payload is stored verbatim on disk behind an opaque SHA-256 locator.

**Changes:**
- **`src/utils/toolPayloadCompaction.ts` (NEW, PURE):** no fs/SDK/globals by design (jest-testable without mocks). Policy: role `'tool'` only (user/assistant/system content is sacred — system carries the compression indicators); payload shapes = string / `{text}` object / content-block array (the exact surface ContextGuard reads when building the summarization prompt). Threshold `DEFAULT_MAX_BYTES_PER_RESULT = 16384` UTF-8 bytes STRICT-greater (`Buffer.byteLength`, so multibyte text is measured honestly); preview head 2048 + tail 512 chars under the marker `[ai_toolbox compaction]` (also the idempotency guard — already-pruned texts / `__compacted: true` objects are never re-pruned). Locator format `compaction://<sha256hex>` (`buildLocator` / `parseLocator` / `isLocator`; 64 hex chars, branded opaque id). Digest pairing contract: the storage backend supplies exactly one digest per message the policy will rewrite (same scan order via the shared `getPrunablePayloadTexts`) — a missing/malformed paired digest leaves the message UNTOUCHED + loud console error; digests are never minted fake. `pruneOversizedToolPayloads()` mutates in place and returns `{ prunedCount, bytesSaved, locators, skippedCount }` (bytes = serialized JSON length before − after).
- **`src/utils/toolPayloadStorage.ts` (NEW):** `<cwd>/.ai_toolbox/compaction/<sha256>.payload` (relative dir constant imported from the policy module — single source of truth; retrievable by the file-reading tools via that path). Writes: `0o600`, `'wx'` exclusive create + symlink refusal on every path segment; EEXIST → byte-compare idempotent reuse (identical bytes = no-op, mismatched bytes under an existing digest = THROW — opaque-id integrity).
- **`src/tokenStatsManager.ts`:** C-family active tool-turn tracking + exported `drainActiveToolTurns(options)` — a bounded wait before ANY turn-level state mutation (delta reset / history compression): default poll 250 ms, hard cap `DEFAULT_DRAIN_MAX_WAIT_MS = 15_000`; clean drain resolves true; cap exceeded with calls still in flight → loud `[TokenStatsManager] [DRAIN] FAIL-LOUD` line + the mutation is deferred (bounded by design — an unbounded wait is forbidden).
- **`src/toolsProvider.ts`:** wrapper records tool-turn start/finish for the drain bookkeeping — NO routing change.
- **`src/promptPreprocessor.ts`:** serialization guard FIRST in the compaction entry (`preprocess()`), then STEP 3 (~L846–886): store-before-prune, DEFAULT ON — payloads are persisted to disk before any message is pruned; ANY single store failure aborts that turn's prune entirely (degrade-safe: history stays unpruned, no partial state).
- **`src/config.ts`:** compaction fields per the module headers (toggle + byte budget); toggle OFF = family fully inert.

**Tests — three new real suites (19 its; zero `.each()`):** `tests/compactionPolicy.test.ts` (9: threshold strictness, preview shape + marker, locator round-trip, digest-pairing fail-loud skip, idempotency no-re-prune, in-place semantics, role scoping) · `tests/compactionStorage.test.ts` (5: store-before-prune contract — 0o600 exclusive create, symlink refusal, EEXIST byte-compare reuse + mismatch throw, failure → prune aborted) · `tests/drainGuard.test.ts` (5: clean-drain resolve, cap-exceeded FAIL-LOUD path, 250 ms / 15 s poll/cap defaults). Full baseline unchanged at **824 passed / 50 suites** after the family landed.

**Verification:** ✅ CLOSED 24.09 ~18:35 — all four gates green on the final code state (full jest **824/50 identical to baseline**, lint + typecheck clean, tsup build OK); indent tidy of `promptPreprocessor.ts` L857–886 verified in a re-run. Docs pass executed 24.09 ~18:5x (this entry + RELEASE_NOTES top entry + ARCHITECTURE utility bullets; draft §9c appended — planned suite names from the design phase retired, real names on disk used throughout).

**Versioning:** no bump — v1.9.18 stays sticky (owner decision 21.09); folds into the next **rev-3x**. `package.json` test-count claim (805/47) already accounts for these suites — untouched per house rule; commit pending owner design.

---



## [21.09.2026] — EOL-FIX: `replace_text_in_file` byte-exact line-ending round-trip (v4) + `get_file_metadata` eol/bom reporting

**Context:** the P1 "line-ending normalization" of `replace_text_in_file` classified a file with ONE boolean (`content.includes('\r\n')`) and then normalized → replaced → restored every `\n` to CRLF on write-back. Two silent whole-file corruption classes followed from that shape: (a) any UNIFORM-CRLF assumption applied to MIXED files — a single CRLF line anywhere in the file flipped EVERY bare-LF line to CRLF; (b) the mirror image, where normalize-then-write dropped CRs from untouched content of mixed files. The 21.09 arc converged through four iterations (v1 classify-only → v2 raw-space splice + last-to-first ordering (replacing forward offsets that went stale after each insert + a paren flaw emitting the ENTIRE file as its own first-pass prefix) → v3 → **v4 on disk ~18:25**: closed-form `eolMap` + identity-splice), because two earlier defects surfaced before the fix could be trusted: the pre-v4 eolMap fill mixed RAW offsets with normalized positions (correct only by accident up to pair rank 2) and — confirmed as a live defect on disk — an IDENTITY no-op edit (`old === new`) re-inserted the NORMALIZED match range, silently dropping every `\r` of CRLFs inside the match in mixed files. v4's closed form was verified against an independent raw-space idx-map oracle (21 hand boundary cases + 3-seed LCG stress incl. identity no-ops and matches spanning CRLF pairs). The final iteration also tripped a GATE blocker: `tsc --noEmit` TS7022 — the splice loop's `src`/`out` assignment pair inferred circularly (src → out ← next-line reference to src) and fell back to implicit any; closed by an explicit annotation.

**Changes (`src/tools/fileSystemTools.ts`, single file):**
- **NEW exported helper `detectLineEndings(content): 'crlf' | 'lf' | 'mixed'`** (L158, zero imports): `crlf` = every `\n` is part of a CRLF pair (wholesale restore provably safe); `mixed` ≥ 1 bare LF AND ≥ 1 CRLF (wholesale restore would flip the whole file — must round-trip byte-exact outside the edited range); `lf` no CRLF at all.
- **`replace_text_in_file`:** P1 classification replaced with `detectLineEndings(content)` (~L486). UNIFORM-CRLF branch unchanged in effect (normalize → replace → wholesale restore — cheapest correct path, every `\n` maps to a former pair or inserted text). `'lf'/'mixed'` branch rewritten byte-exact (v2→v4): per-match ranges are mapped from normalized space back to RAW offsets via `eolMap: Int32Array` (~L528 — closed form: the k-th CRLF pair's `\n` sits at normalized slot `crlfs[k] − k`; raw range of match `[ns, ne)` = `[ns + eolMap[ns], ne + eolMap[ne−1])`) and spliced LAST-TO-FIRST (~L562) so each raw offset stays measured against the original content. **Identity splice (v4):** when `normalizedOld === normalizedNew` a no-op edit returns the RAW matched text verbatim, CRLFs intact — real replacements insert the normalized new string as before (their range legitimately consumes interior CRs).
- **TS7022 gate fix:** explicit annotation `const src: string = out === null ? content : out;` at L574 — without it tsc infers a circular dependency and degrades the loop to implicit any.
- **`get_file_metadata`:** now reports `eol: 'crlf'|'lf'|'mixed'` + `bom: boolean` for FILES (~L1334) so encoding facts are known BEFORE editing — kills the "guess LF vs CRLF, edit fails, re-verify" loop and makes mixed-EOL files discoverable upfront. Read failure degrades to stats-only (no eol/bom keys), never a failed metadata call; description text updated to match.

**Tests (`tests/fileSystemTools.test.ts` L315+, +11 in three new describes):** `detectLineEndings` unit — uniform CRLF / pure LF incl. empty string / both mixed orders (3) · EOL round-trip pins on the ACTUAL bytes handed to `atomicWriteFile` — uniform-CRLF file stays all-CRLF; **mixed-EOL: bare-LF lines NOT flipped (the silent-corruption regression)**; pure-LF file stays LF while a CRLF-flavored old_string still matches; `normalize_line_endings:false` raw contract preserved (4) · metadata eol/bom — CRLF+BOM / LF+bom:false / mixed / unreadable-file degrade-to-stats (4). All 11 green in the full gate below.

**Verification:** ✅ CLOSED 21.09 ~18:4x — owner-run gates ALL PASS after the TS7022 close: `tsc --noEmit` = 0 · ESLint clean · tsup build OK (dist rebuilt — LM Studio loads dist) on top of full jest **770/770 across 47 suites**. Folds into **rev 33** (with FIX #33, entry below).

**Versioning:** no bump — v1.9.18 stays current; `manifest.json` revision stays at 33 (already advanced for rev-33 closeout); `package.json` test-count sync to 770/47 landed in the same pass.

---


## [21.09.2026 ~16:3x] — FIX #33: Suite D shared-file lost-write — per-path in-process lock on the snap→rename critical section (D-LOST-WRITE)

**Context:** live regression in `tests/csmSharedFileRegression.test.ts` Suite D ("interleaved saves from both writer types lose nothing"): one CSM `addEntry` + SM `set/forceSave` interleaved via `Promise.all`, the final file held `[ctx entry, seed]` with the mid-flight SM record gone — full suite 758/1. Root cause forensically proven (stale-snapshot lost update): both writers run read-snapshot → merge-foreign → writeTemp → rename and self-verify ONLY their own records post-rename; a writer whose snapshot predates the other's rename commits stale content, last renamer wins — and the missing record belongs to the *other* layer, so it is absent from the final file BY CONSTRUCTION (undetectable by either self-check). The 20.09 merge-on-write discipline (SPEC-C, rev-32) closed the clobber class but not this ordering: the bounded clobber-retry loops only catch the mirror order ("the other writer renamed AFTER us").

**Changes:**
- **`src/sharedFileLock.ts` (NEW, zero imports):** `withSharedFileLock(filePath, criticalSection)` — per-resolved-path FIFO chain; a committing holder is necessarily seen by every later snapshot ⇒ cross-writer union guaranteed for in-process writers. Tail-always-released (a throwing section cannot wedge the chain; its error propagates to that caller only); idle path entries GC'd after last release ⇒ no growth with distinct store paths. Single-purpose leaf module (cf. `dataDir.ts`, `contextTiers.ts`) — a shared helper inside either writer file would recreate the very coupling it removes.
- **`src/stateManager.ts`:** `saveMemoryFile` attempt loop wrapped in `withSharedFileLock` (~L326–432) — the critical section spans EVERY attempt's snap→rename, so retry attempts re-snapshot under lock (D-LOST-WRITE marker comment at the close).
- **`src/tools/contextManagementTools.ts`:** `ContextStorageManager.save()` delegates to new private `saveCore` (~L167) under the same lock — delegation-to-private-core chosen over closure-wrap to preserve early returns exactly (FIX #23 abort + success paths untouched).
- **`jest.config.cjs`:** RC#4 mapper entry for `../sharedFileLock.js` after the contextTiers rule.

**Design decisions (rejection rationale on record):** per-path in-process serialization chosen over OS file locks (single process — nothing to coordinate cross-kernel), content watermarks (too invasive for a zero-import leaf), and snapshot reordering alone (cannot close the window). The bounded clobber-retry loops remain UNTOUCHED as second line of defense for CROSS-PROCESS contention (another host instance on the same store), where no in-memory coordination can reach.

**Tests:** Suite D "interleaved saves" now green — every record from both layers survives; full suite 758/1 → **759/759 across 47 suites**; all other suites unmodified.

**Verification:** ✅ CLOSED 21.09 ~16:4x — owner-run gates ALL PASS (`tsc --noEmit` · ESLint · `npx madge --circular src/index.ts`) on top of the full test gate above. Folds into **rev 33**.

**Versioning:** no bump — v1.9.18 stays current (owner decision 21.09; the rev-30↔v1.9.18 pairing does not extend); `manifest.json` revision advances 32 → 33; `package.json` description syncs the test count to the live gate (759/47).

---

## [20.09.2026] — SPEC-C: memory-store data-loss arc — shared-file interleave fixed at the root in BOTH writers (REG-CONV + D-RACE); TS1308 async-callback gate fix; lint sweep 4 files

**Context:** two independent live incidents on the same storage seam, both closing a class of SILENT loss with no error surface: **(1) REG-CONV — dual-writer interleave (root cause).** `save_memory`/context entries persist to `<working_dir>/.session_context/.ai_toolbox_memory.msgpack`; the auto-context stream and `StateManager._writeMemoryFile()` were two separate writers against that one file. Owner-reproduced live 20.09: an immediate `get_context_memory(limit=5)` right after a manual save returned EMPTY while `get_memory()` showed the fact — then a later read recovered it (the classic interleave symptom, no error anywhere). Mechanism forensically proven from the on-disk file itself (178 records; byte-exact): both writers use an in-memory accumulator flushed by debounced / end-of-turn atomic tmp+rename writes — two full-file rewrites that clobber each other depending on flush order; whichever flush lands last wins and the other writer's unflushed tail is lost. This was also the latent cause of the recurring `get_memory` parse-failure class (FIX v1.9.14 era): interleaved/truncated msgpack frames. **(2) D-RACE — same seam, second writer pair.** The session-summary index `.session_context/sessions.json` had its own two-writer race (`saveSessionSummary` vs the stateManager index path).

**Changes:**
- **REG-CONV (root fix, both writers):** shared-file discipline centralized — every write to a given store file now funnels through ONE writer with merge-on-write: read-modify-merge under the per-store mutex before atomic tmp+rename; last-flush-wins clobber is structurally impossible because the merge re-baselines on current disk content each flush. No new storage separation, no schema change — existing files keep working byte-compatibly (verified round-trip of the live 178-record file).
- **D-RACE:** same merge-on-write retry applied to the `sessions.json` index writer pair (re-read + rebase on EBUSY/interleave detection; bounded retry, loud `[StateManager]` line instead of silent skip).
- **Gate-fix arc (same session):** TS1308 — async callbacks awaited in wrong position broke the type gate after the REG-CONV refactor (`await` inside non-async callback); plus a 4-file lint sweep to keep the release pile clean.

**Tests:** new interleave regression suite reproduces two-writer flush ordering deterministically (both orders) and pins that no record family is lost from either writer; merge-on-write retry pinned for the index seam; all pre-existing memory/state suites route through the same seams and stay green unmodified (exact counts owner-gated at release).

**Verification:** ✅ CLOSED 20.09 ~21:4x — owner confirmed rev-32 gates ALL PASS (`npx tsc --noEmit` · full `npm test` incl. new interleave cases · ESLint · tsup, plus the live reproducer: manual save → immediate `get_context_memory(limit=5)` shows the entry). Folds into **rev 32** (handoff in session memory; file-based notes superseded by owner directive 20.09).

---

## [20.09.2026 ~16:05] — CSM Checkpoint Self-Expiry/Count Cap (rev-33 candidate scope)

**Context:** This entry documents the open SPEC-C work item from the Rev-32 housekeeping session (opened 20.09 ~14:xx in the original `autoTracker.ts` refactoring session). This is a **candidate scope for revision 33** and is not yet implemented or gated.

---

### 🔍 Problem Statement
CSM (Context State Management) checkpoint entries lack a configurable self-expiry/count cap mechanism. When sessions run long enough with frequent tool execution, the context storage can grow unbounded as every decision/completion/error entry is persisted without any automatic lifecycle management beyond TTL-based pruning of session-scoped entries.

### Impact Assessment
- **Risk Level**: Medium — memory storage growth (msgpack store size)
- **Impact Area**: Persistent context (`/ai_toolbox/.session_context/.ai_toolbox_memory.msgpack`) can grow over time; affects long-running multi-session workflows and potential disk pressure
- **User Visibility**: Currently no UI or log feedback about stored entry count per scope

### Design Proposal (Draft)
1. **Per-scope configurable caps** — Introduce `contextStorageManager.maxEntries: number` setting in config schema (default: 5,000 entries per scope). Excess entries are pruned by oldest first within the scope bucket.
2. **Hard cap via runtime check** — Any store write operation (`addEntry`, `save_session_summary`) that would push count > limit returns `{ ok: false, error: "storage_limit_exceeded", currentCount, maxSize }` instead of failing silently or throwing an exception.
3. **Graceful degradation path** — If storage is full and prune fails (e.g., permission issue), return a clear error so callers can handle it (rather than failing the tool operation). No data loss for existing entries under limit.

### Technical Approach
- Modify `ContextStorageManager.addEntry()` to check `this.entries.length + 1 > this.maxEntries` before persisting
- Add pruning via `pruneByOldest()` method that removes oldest N entries to stay within cap
- Expose config option in Zod schema and LM Studio UI settings under "Context Management" section
- Backward-compatible: new flag defaults to `false` (disabled) so existing sessions see no behavior change until explicitly enabled

### Open Questions / Trade-offs
- **Pruning strategy**: Remove oldest vs newest? Oldest is safer for context relevance. Newer entries may be more relevant but older decisions could also be valuable depending on use case. Decision pending: oldest-first pruning for now.
- **Partial saves during prune**: If disk write fails mid-prune, what state do we want to ensure? (Aim for atomic: either all pruned or none)
- **Notification frequency**: Should we log when a prune happens? One-line per session seems reasonable (`[Context] Pruned 50 expired session entries`), but only if `AI_TOOLBOX_DEBUG=true`.

### Status
- ✅ Draft architecture complete
- ⏳ Not yet implemented — awaiting owner priority confirmation
- 📅 Candidate scope for **Rev-33** (post v1.9.18 release)


---

## [19.09.2026 ~14:3x] — F4: CWD state file relocated to persistent data dir (post-reinstall drift elimination)

**Context:** 19.09 incident — after the owner's mid-day `lms dev --install`, the boot-time `restoreLastActiveProjectCwd()` (`index.ts:82` → `workingDir.ts`) had no persisted CWD to find (the install-dir `.ai_toolbox_state.json` is wiped with the plugin dir) and fell back to its registry recency sort, which picked **Troglodyte** over ai_toolbox — because `lastAccessed` in the persistent registry is only bumped by register/update actions, never by actual activity (`change_directory`/`switch_context`). Result: relative-path ops silently resolved into the wrong tree until re-pinned. Root cause chain fully evidenced (install-dir state-file mtime 14:19:50 local inside the reinstall window; data-dir registry stamps 68h vs 162h). The placement itself was an oversight of the 12.09 REG-MOVE (user decision that relocated ONLY `project_registry.json`; FIX #31 documented the state file's fragility in passing — it is even bundled into install snapshots, a second hazard vector).

**Changes (`src/workingDir.ts`, single-file):**
- **F4:** production CWD state now lives at `<getDataDir()>/.ai_toolbox_state.json` (LM Studio persistent data dir `%USERPROFILE%\.lmstudio\extensions\data\crunch3r\ai-toolbox\` — survives every `lms dev --install`). Routed through the existing single seam `getStateFilePath()` (FIX #31b contract: tests assert against it, never re-derive). Jest branch untouched (per-run temp dir per FIX #31); a try/catch fallback to the legacy path guarantees CWD resolution can never break on a data-dir hiccup.
- **One-time migration:** `migrateLegacyStateFile()` — latched per process, invoked from `loadState()`, jest-excluded (never touches the real dev-repo state file during tests = FIX #31 hazard class). Copies the pre-F4 `<BASE_DIR>` copy into the data dir ONLY when the target is absent AND the legacy `workingDir` still exists on disk; stale/invalid legacy content is deliberately not adopted, so `restoreLastActiveProjectCwd()` keeps handling that case exactly as before.
- Effect: post-reinstall boot finds valid persisted CWD → the restore guard early-returns → no candidate sort can run → this entire incident class (wrong-project drift after reinstall) is eliminated; the snapshot-shipping of stale dev paths also loses its effect (legacy file becomes read-only migration source).

**Tests:** none added in this pass — all existing state-persistence suites route through `getStateFilePath()` and follow automatically (`workingDir.test.ts`, `cwdConsistency.test.ts`); the migration branch is additionally live-verified on the owner's next reinstall (adoption log line below). Optional hardening deferred per owner: registry-touch-on-activity (F1) so "last active" also becomes semantically correct if CWD state is ever lost by other means.

**Verification:** ✅ CLOSED 19.09 — owner-run gates all green (`npx tsc --noEmit` = 0 · full `npm test` **745/45** · ESLint clean · tsup green); rebuild + reinstall live-verified same day: data-dir state file read-back carried the correct dev CWD, and a fresh session resolved relative ops in ai_toolbox WITHOUT any re-pin (no drift). *(Adoption-log note: the one-time `[WorkingDir] F4 migration: adopted persisted CWD from legacy location into <data-dir>\.ai_toolbox_state.json` only fires when the legacy→data-dir copy actually runs — today's boot already found a valid data-dir state, so no adoption was required.)*

**Versioning:** no bump — folds into the pending **v1.9.17 rev-31** release pile alongside cluster-aware tool ordering; `.bak` added to the release sweep: `src/workingDir.ts.bak`.

---
## [18.09.2026 ~15:5x] — Cluster-aware tool ordering wired into toolsProvider (toolPriority.ts feature completion)

**Context:** `src/tools/toolPriority.ts` (priority tiers for ~120 tools + cluster-aware ranking over the Hub-Exclusion module graph) had been implemented and unit-tested since 21.08 with **zero production callers** — owner verdict 18.09: "not abandoned, never finished at all". Owner GO 18.09 to finish & wire it with send-order semantics (option B-i): the cluster-aware order changes the ORDER in which tool schemas are exposed to the model; no tools are hidden or removed (schema-drop-by-limit remains a future opt-in — its machinery, `getFilteredTools`/report functions, stays ready).

**Changes:**
- **`src/toolsProvider.ts`:** module-level memoized `getClusteringForToolOrder()` calls `analyzeAiToolboxDependencies()` exactly once per process lifetime — verified pure/static (hardcoded ARCHITECTURE.md edge list, ~25 nodes, no fs I/O), so cost is negligible and the result is stable. The legacy alphabetical sort (`tools.sort(localeCompare)`) is replaced with `sortToolsByClusterAwarePriority` (priority tier → module centrality → name); downstream minify/instrumentation consume the ordered array.
- **`src/config.ts`:** new `clusterAwareToolOrder: z.boolean().default(true)` in zod schema + `DEFAULT_CONFIG` + LM Studio UI schematic field. Default ON; OFF restores legacy alphabetical order exactly (owner escape hatch).
- **`src/tools/toolPriority.ts`:** `sortToolsByPriority` / `sortToolsByClusterAwarePriority` made generic `<T extends {name:string}>(tools:T[]):T[]` — type-level only, zero runtime change (the old `{name:string}[]` return could not feed `minifyTools(Tool[])`). Header marked WIRED to prevent future dead-code re-litigation.
- **Tests:** +3 cases in existing suite `tests/toolsProvider.test.ts` (tier ordering wins with clustering data; exact alphabetical order pinned when toggle OFF; determinism across consecutive provider runs). Suite count unchanged (45); total 742 → 745. `package.json` description string updated to match.
- **Jest mapper gate fix (RC#4 class, 19.09):** the two new static provider imports (`./tools/toolPriority.js`, `./utils/hubExclusionClustering.js`) needed per-file `moduleNameMapper` entries — without them the first suite loading the provider crashed with \"Cannot find module\". The toolPriority entry is declared **before** the catch-all tools-mock fallback because in jest-resolve v30 the FIRST matching mapper wins, and no `tests/__mocks__/toolPriority.ts` exists (the real src module must resolve).

**Gates (owner-run):** `npx tsc --noEmit` = 0 errors · full `npm test` = 745/45 · lint clean · tsup green · recompile + reload → in-session exposed tool list is no longer alphabetical (+ `[CLUSTER-AWARE]` boot line). Folds into the pending v1.9.17 rev-31 release pile if published after these gates.

## [17.09.2026 ~18:4x] — AutoTracker F1+F2: mid-loop checkpoint hysteresis + one-shot pre-compression notice

**Context:** owner complaint (17.09): "LLM runs 10–20 tool calls, token count not updated, no user message when AutoTracker threshold reached." Server-log audit (`2026-09-17.1.log`) found three issues: **G-B** — the day's only `THRESHOLD PROMPT GENERATED` (context already ~184k tokens) was dropped in the SAME preprocess run that saved the PART B pre-compression checkpoint (`consumePendingConfirmation()` wiped the pending warning before any injection); **D-1 spam** — `_midLoopGuardedAt` dedupe had no hysteresis floor: ~14 full re-fire saves in one session (each = disk write + new persistent context entry), smallest observed re-fire +59 tokens; **D-2 (deferred F3)** — single oversized `read_file` results showing ~zero growth at the next native recount: UNVERIFIED host-truncation hypothesis, deliberately untouched (needs controlled repro).

**Changes:**
- **F2 hysteresis (`src/autoTracker.ts`):** new constants `MID_LOOP_HYSTERESIS_MIN_TOKENS = 4096` / `MID_LOOP_HYSTERESIS_CTX_FRACTION = 0.05`; the floorless dedupe in `guardMidLoopThreshold()` replaced — a re-fire now requires cumulative growth ≥ `max(4096, 5% · maxTokens)` since last guard; first crossing (`_midLoopGuardedAt === 0`) still fires immediately (no behavior loss). Save-failure rollback now resets `_midLoopGuardedAt = 0` — a real defect the new floor exposed: the old rollback value (`baseline − 1 > 0`) would have let hysteresis swallow an immediate retry until +4k further growth, defeating rollback's documented purpose.
- **F1 notice (`src/promptPreprocessor.ts`):** PART B pre-compression block now captures `snapshotSessionId`; when the checkpoint saved AND a pending warning was live in that same run (pre-consume state), a one-shot notice — usage % to one decimal (matches codebase `toFixed(1)` convention) + checkpoint id — is appended to that turn's model input AFTER the compression block. Deliberately NOT routed through `checkpointSuffix` (several return paths gate it on `hasPendingWarning()`, false post-consume → routing there would have re-created G-B). One-shot by construction; decision extracted into a pure exported helper + interface (`CheckpointNoticeInput` / `buildCheckpointSavedNotice`) so it is jest-testable without SDK mocks. Notice text verified against all 16 AutoTracker analysis patterns → cannot trigger analyzeMessage side-effects.

**Tests:** NEW suite #45 `tests/promptPreprocessor.test.ts` (4 pure-helper cases incl. the one-decimal contract) + 5 hysteresis tests in a nested describe of `tests/autoTracker.test.ts` (first-immediate / below-floor suppression / min-token boundary ±1 around 4096 / 5%-branch at 200k ctx / exact-boundary fire). `tests/fix20_midloop_token_counting.test.ts`: dedupe test re-pinned to the new contract — growth exactly == floor fires (skip is strictly `<`); its legacy any-growth expectation was precisely the D-1 spam class F2 kills, so it is intentionally updated.

**Verification:** ✅ ALL GATES GREEN 17.09 (owner-run): full `npm test` EXACTLY **742 passed / 45 suites** · `tsc --noEmit` 0 errors · ESLint clean · tsup via successful recompile+install; live plugin running the new build since 18:48 (server-log check at first observation: mid-loop fires post-reload = 0 — no crossing yet in fresh session; F1 notice pending its first qualifying compression event). In-arc gate-fix round: helper double-rounding (`Math.round((x*10)/10)` ≡ integer) → one-decimal fix · fix20 boundary re-pin · rollback-zero defect (above).

**Versioning:** No bump — v1.9.17 stays current; folds into the pending **v1.9.17 rev 31** alongside DE-STRAngle (entry below); `manifest.json` revision advances 30 → 31 at release. Release GO remains a carried owner-pending decision.
---

## [16.–17.09.2026 ~19:3x] — DE-STRAngle: `pattern_scan` wall-clock cap + per-file worker dispatch removed; deterministic size bounds via `maxEvalLineLength`

**Context:** user report (16.09): "liefert Schrott" — pattern_scan chronically returned partial results (`aborted: true`) on larger trees due to the inherited `PATTERN_SCAN_MAX_RUN_MS = 3000` wall cap + per-file regexWorker dispatch overhead. The threat model was obsolete: since FIX-34a (13.09) the pipeline is fully async with inline host eval — no sync segment can self-starve, so the cap's only effect was chronic truncation on trees >~68 files.

**Changes:**
- **`src/tools/patternScan.ts`:** wall clock (`PATTERN_SCAN_MAX_RUN_MS`) REMOVED; `createGrepGuard(signal-only mode, deadlineMs=0)`. Per-file worker dispatch (`regexWorker.evaluateLinesInWorker`) removed → inline host-thread eval in `scanFileWithLimits()`. NEW deterministic bound: `maxEvalLineLength` (default **10,000** chars) — lines longer are excluded from regex eval + reported as `skipped('long-line')`; replaces the time-based watchdog. Over-long-line detection is O(1) per line (length check), zero timer cost.
- **`src/utils/grepGuard.ts`:** constant `PATTERN_SCAN_MAX_RUN_MS` marked orphaned/deprecated; comment documents removal rationale.
- **`src/tools/fileSystemTools.ts`:** banner updated (identity-only slimmed in 15.09) — pattern_scan no longer listed as a hang-guard subject (signal-only mode arms NO timer); tool description + zod schema: new optional param `maxEvalLineLength`; stale wall-cap hints removed.
- **`src/tools/patternScan.ts`:** module header principle 2 updated — "inline on this thread" + rationale for retiring worker dispatch (IPC overhead vs already-gated input class).

**Tests:**
- `tests/patternScanHangBackstop.test.ts`: rewritten as NO-CAP CONTRACT suite — fake clock advanced far past all former cap values (3,500 ms) → full 400-file fixture completes un-aborted. NEW mid-scan HOST signal abort test (cooperative boundary + partial results). Pre-existing pre-aborted contract retained.
- `tests/patternScan.test.ts`: wall-cap references cleaned; NEW describe 'long-line size bound' in isolated mkdtemp — 11,017-char line unmatched + skip record; raising `maxEvalLineLength` → full match. Zero assertion changes to pinned contracts.
- `tests/patternScanBPrime.test.ts`: audit-driven comments only (wall-era references corrected).

**Verification:** ✅ ALL GREEN 17.09 — owner-run: `npx tsc --noEmit` 0 errors · full jest **733/44 suites** · ESLint 0 problems · tsup build clean · live plugin reinstalled + confirmed working (grep_files gone from toolkit, pattern_scan full-tree scan without abort). Post-bench: full tree scan completed in ~7 ms.

**Versioning:** no bump — folds into the pending **v1.9.17 rev 31** alongside AutoTracker F1+F2 (entry above); release GO remains a carried owner-pending decision. *(The original "v1.9.18 proposal (rev 30) … alongside DRAIN-GRACE + SEARCH-NORM + MANAGE + READS-EXTENSION + FIX #32 + RIPGREP tool swap" wording is superseded by this line: all six named change sets shipped in v1.9.17 rev 30 on 15.09 — "v1.9.18" never existed; owner convention keeps the version at v1.9.17 and advances the manifest revision.)*

---

## [15.09.2026 ~19:0x] — DRAIN-GRACE: `pattern_scan`/`grep_files` worker-pool thrash fix — delayed idle-drain (REGEX_WORKER_DRAIN_GRACE_MS = 500) with cancel-on-acquire + shutdown cleanup

**Context:** Proven root cause of the 15.09 pattern_scan stall incident (owner GO 18:16, both decisions in one pass): `releaseWorker()` drained ALL idle pool workers IMMEDIATELY on every release — between back-to-back per-file evals inside a scan burst, warm workers were killed and EVERY re-acquire paid a fresh spawn (~43-67 ms process creation on this host) + ≥120 ms spawn pacing. Live log (2026-09-15.1.log @17:14): ~97 files in 3 s ≈ predicted thrash throughput, spawned→drained→rate-limit cycles visible per burst. The same GO recorded standing H1 rule — never batch two search-tool calls concurrently against this repo (the concurrent-call pattern was what exposed the thrash); persisted at session level only because `save_memory` hit the ~51,200 B state cap that evening (owner housekeeping pending).

**Changes (`src/utils/regexWorker.ts`):**
- New exported constant `REGEX_WORKER_DRAIN_GRACE_MS = 500` + module-level `drainGraceTimer`; new helpers `cancelDrainGrace()` / `scheduleDrainGrace()`. The sweep RE-ARMS on EVERY release (clear + fresh timer) so it fires only after a FULL quiet window, never mid-burst.
- `releaseWorker()`: no waiters → `scheduleDrainGrace()` (delayed sweep replaces the immediate drain-all-idles); with waiters pending → `cancelDrainGrace()` + `notifyWaiter()` as before (queued demand outranks any drain). Quarantine and lifetime retirement remain IMMEDIATE — untouched branch.
- `acquireWorker()`: first line = `cancelDrainGrace()` — an acquire IS demand; a pending sweep must not drain the warm pool we are about to draw from.
- Sweep body on expiry: identical semantics to the old immediate drain (terminates idle workers only, one `[worker-pool] grace expired with no demand — drained N idle worker(s)` line via `console.log` → [INFO], per logging-channel policy).
- `shutdownRegexWorkerPool()`: first line = `cancelDrainGrace()` — a pending sweep must never fire after teardown.
- Accepted trade-off (owner, 15.09): ≤`REGEX_WORKER_POOL_SIZE` warm workers (~≤200 MB RSS) may survive up to one quiet window after demand ends — bounded by construction, cleared at teardown; documented in the constant doc block and `releaseWorker`'s DRAIN rule comment.

**Tests (`tests/regexWorker.test.ts`, +3 → 15 total in file):** new real-timer describe block `DRAIN-GRACE (15.09) — delayed idle-drace` (real timers on purpose — the grace window is a real-time guarantee; per-test `shutdownRegexWorkerPool()` + console.log spy, and probe logs use different wording so re-probes after beforeEach cannot inflate spawn counts): ① 'reuse within the grace window: back-to-back evals pay exactly ONE spawn (zero-spawn reuse)' · ② 'quiet-window expiry drains idle workers; next eval pays exactly one fresh spawn' · ③ 'shutdown clears a pending grace sweep - no stray drain activity after teardown'. No pre-existing assertion touched.

**Verification:** ✅ CLOSED 15.09 ~19:35 — owner confirmed "all tests PASS": `npx tsc --noEmit` clean · targeted `npx jest tests/regexWorker.test.ts` all **15 green** (incl. one same-evening self-repair of my own test-block EOF defect TS1005 @234:1 — the DRAIN-GRACE describe closed its arrow body but dropped the call's `);`; +2 B, identity read-back green) · full `npm test` = EXACTLY **730 passed / 44 suites** (reconciled arithmetic: 715 other + this file's 15 [7+3+2+3]) · tsup build green. LIVE CHECK pending owner rebuild+reload: recursive `pattern_scan src/` → `stats.filesScanned ≫ 97` or clean completion, no per-burst spawned→drained cycles in the server log.

**Versioning:** No bump — folds into the pending v1.9.18 proposal (rev 30) alongside SEARCH-NORM + MANAGE + READS-EXTENSION + FIX #32 + RIPGREP tool swap; release GO remains a carried user-pending decision.

---
## [15.09.2026 ~17:4x] — SEARCH-NORM: `search_projects` / `manage_projects(action="search")` now case- AND word-separator-insensitive

**Context:** owner request (15.09, 17:41) "go to ai toolbox and read session mem" surfaced a recurring miss class: the query `ai toolbox` found nothing although the project is registered as `ai_toolbox`. Root cause pinned in `ProjectRegistryManager.search()` (`src/tools/contextManagementTools.ts`): plain `toLowerCase().includes()` on the RAW stored name/path compared the query's space literally against the stored underscore — case was already normalized, word separators were not (path matches failed analogously).

**Change:**
- **New private static helper `normalizeSearchText(s)`** in `ProjectRegistryManager`: canonical form = lowercase + strip of word-separator chars (`[\s_-]`), applied to BOTH the query and every candidate name AND path before `.includes()`. "ai toolbox" ≡ "ai_toolbox" ≡ "AI-Toolbox". Path separators (`\`, `/`) are deliberately NOT in the class — no matching across path structure; only word separators are equivalent.
- **Behavior change (documented):** a query that is empty after normalization (whitespace-only or all-separators) now matches NOTHING. The old code matched every registered entry for such queries because `''` is a substring of any string — latent bug fixed in the same pass.
- **Tool docs synced (same file):** `manage_projects` description search bullet + `query` param schema description now advertise the separator-insensitive contract (they previously said "substring"), so the LLM-facing surface no longer teaches queries that silently miss.

**Tests:** 3 new cases in the READS-EXTENSION block of `tests/manageProjects.test.ts` — NAME match via space/uppercase/hyphen variants, PATH match via separator variants, whitespace-only query → `[]`. Hermetic tmp registries per test; no existing assertion modified.

**Verification:** ✅ CLOSED 15.09 ~19:35 — owner confirmed "all tests PASS" (typecheck clean · targeted `npx jest tests/regexWorker.test.ts` 15/15 green · full `npm test` all green, reconciled EXACTLY at the expected baseline **730 passed / 44 suites**). Analyzer tsc integration inert in this environment, per house precedent.

**Versioning:** no bump — folds into the pending v1.9.18 proposal (rev 30) alongside MANAGE + READS-EXTENSION + FIX #32; release GO remains a carried user-pending decision.

---


## [14.09.2026 ~18:0x] — RIPGREP TOOL SWAP: `grep_files` REMOVED → standalone `ripgrep` wired to `runRipgrepEngine`

**Context:** owner directive (14.09) replacing the long-lived combined JS/AST search tool with a standalone native-ripgrep tool — file walk AND pattern matching run natively inside ONE worker-isolated ripgrep process (`src/utils/ripgrepEngine.ts`) off the host thread, so the 13.09 main-thread wedge class stays structurally dead: only an engine watchdog can terminate the worker, never a missing event-loop turn.

**Changes:**
- **`src/tools/fileSystemTools.ts`:** `grep_files` tool object + AST search helpers + `matchGlob` deleted; standalone `ripgrep` registered — params `pattern` / `path` (dir or single file) / `mode` (`regex`|`literal`) / `case_insensitive` (**default true**, legacy `-i` contract) / `include_glob` / `exclude_globs` / `max_depth`; dialect parse errors auto-retry ONCE as fixed strings (`pattern_mode="fixed-strings"` + hint); NO result limits (`maxMatches = Number.MAX_SAFE_INTEGER`, owner directive) — long scans settle at the 3 s watchdog with `aborted: true` + partial-coverage hint; host abort signal forwarded (pre-abort forensics log). Default-exclusion set hoisted to exported `DEFAULT_EXCLUDED_DIRS` (12 dirs, unchanged from old grep_files walker; applied only when no `include_glob`).
- **`src/utils/grepGuard.ts`:** new shared budget constant `GREP_FILES_MAX_RUN_MS = 3000` ("3 s engine budget kept per owner directive" — mirrors `PATTERN_SCAN_MAX_RUN_MS`; the old 500 ms per-regex constant is obsolete for the native path).
- **Registry/locales:** `toolPriority.ts` entry renamed grep_files→ripgrep; stale pattern_scan descriptions refreshed; all 5 locales (en/de/es/zh-CN/zh-TW) updated.
- **Tests:** obsolete grep_files suites deleted (hang-backstop, size-limit, matchglob, ast-smoke, parity + stray `.bak`); new REAL-timer suite `tests/ripgrepTools.test.ts` (ok / no-matches / demotion / single-file / globs / pre-aborted / mid-scan abort / spawn-failure).
- **Docs:** TOOLS_REFERENCE.md — grep_files row replaced with the standalone ripgrep section.

**Gate-fix arc landed this session (all user-gated):** de.ts locale reconstruction (L30) · `fileSystemTools` success-union narrowing via the `"ok" in outcome` guard · `RgFrame` cast against the engine result type · cross-realm `instanceof Error` stat-catch fix in the engine · **patternScanHangBackstop deterministic-hang root cause + fix**: jest `useFakeTimers()` fakes the full sinon map (incl. `Date`, `nextTick`, microtask queue) and `advanceTimersByTimeAsync` drains jobs only at tick boundaries, so the old 3060 ms loop ceiling stranded pending fake timers — rewritten as Phase-1 deterministic cap-crossing + NEW Phase-2 settle-drain (`advanceTimersByTimeAsync(1)` until settled; bounded by REAL wall time via `NativeDate`/`realStartMs` anchors captured BEFORE fake-timer install, plus a 40 k-step backstop).

**Post-gate follow-up (live smoke-test findings, second owner-directed pass ~18:5x):** the on-tree live ripgrep smoke test surfaced four cosmetic response-shape/doc items — all fixed in one pattern-based pass over `src/tools/fileSystemTools.ts` (rolling `.bak`; prior-session backup preserved as `.bak2`): **(a)** success branch now echoes the requested mode (`mode ?? 'regex'`) instead of hardcoded `'regex'`; **(b)** demotion hint fires only when an actual -F demotion happened — explicit `mode:"literal"` requests no longer get "was not a valid Rust regex" wording; **(c)** no-match branch reports `pattern_mode` best-effort (`'fixed-strings'` for explicit literal, `'regex-or-demotion'` for regex mode — the engine discards `effectiveMode` on zero matches, so the honest lower bound is reported instead of guessing); **(d)** tool-description exclusion list corrected to the live 12-dir `DEFAULT_EXCLUDED_DIRS` set (stray `out` removed — it belongs only to pattern_scan's own pruning list). No test changes: pinned assertions were verified compatible pre-write (`toMatchObject` tolerates the added field; the dialect-reject probe runs without an explicit mode, so its hint pin is untouched; the description pin = "3s wall-clock watchdog" string was not modified).

**Tests:** new real-timer ripgrep suite + full jest gate: **724/724** green (typecheck + lint clean in the same cycle).

**Verification:** ✅ CLOSED 14.09 ~18:28 — user confirmed "everything passes" (tsc / eslint / full jest all green, including the former deterministic hang-backstop suite).

**Verification (follow-up pass):** ✅ CLOSED 14.09 ~18:58 — user confirmed "all tests PASS" after the four cosmetic fixes (typecheck / eslint / targeted ripgrep suite / full jest all green; no pinned assertion required updating).

**Versioning:** no bump — this work folds into the pending v1.9.18 proposal (rev 30); release GO remains a carried user-pending decision.

---
