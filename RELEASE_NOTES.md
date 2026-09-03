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