# Changelog — ai_toolbox (active)

> **This file supersedes `CHANGELOG.md`.** The old changelog is preserved as archived history only.
> New entries are added at the top of this file. Details below were compiled from verified session records and bundle-level verification (`dist/index.js` + `index.mjs` are unminified, so shipped content was confirmed byte-exact).

**Current release: v1.9.11** (`package.json` + `manifest.json`, revision 22) — contains the consolidated maintenance work of the v1.9.10 window: duplicate-tool-removal + grep_files log-level hotfixes (24.08), the OOM-hardening suite (web-fetch guards, search-fallback & HTTP-client caps, heap watchdog), the rag_web_content fix suite, the chunking fixed-point OOM termination (25.08), the StateManager B1/B2/B3 data-loss fixes (28.08), and REV-24 bare-& false-positive fix for `grep_files` (hotfix deployed via direct src-sync + full restart 28.08; installed copy runs from `src/`). **Version bumped v1.9.10 → v1.9.11 on 28.08 (~20:45)** — user-directed release decision supersedes the "no bump" policy of 25.08.

---

## [28.08.2026 ~21:15] — Docs sync: README "Standout Tools" highlight + TOOLS_REFERENCE `grep_files` limits (docs-only, no code change)

- **README.md**: new **"🏆 Standout Tools"** table inserted directly under the *"130 unique tools across 24 modules"* hero block — highlights 13 capabilities verified as unique or rare in the LM Studio plugin hub by the Aug 2026 competitive survey (~115 plugins surveyed: beledarian, puppytucker, kyle-chen et al.): `refactor_code`/Recode Engine (only AST-based refactoring in field), **AutoTracker + ContextGuard** session/token management (mid-loop token deltas firing 75%/90% thresholds inside long tool chains, automatic checkpoint summarization & compression — absent from every surveyed plugin beyond basic memory CRUD), hang-safe `grep_files`/`find_replace_all`, guarded `line_operations` (MD5 post-write check), background-command suite, browser automation with persistent sessions, integrated multi-format RAG (PDF/DOCX/XLSX + web extraction), `run_tests` (auto-detects Jest/Mocha/Vitest), planning state machine (`create_plan` family), `secret_scan`, data visualization via `generate_chart` (**zero** data-viz plugins in field), cross-project memory registry, and the backup/restore suite.
- **TOOLS_REFERENCE.md**: `grep_files` entry corrected to the current contract — added missing params **`max_depth`** (default 10, range 1–50) and **`max_lines`** (default 5000); documented deadline behavior (partial results + `aborted: true`, per v1.9.9 hard limits) and REV-24 prose-alternation handling (`patternMode:"auto_escaped"` hints).
- **Scope:** documentation only — no source, test, or version change; folds into the already-released **v1.9.11** (no further bump needed). `.bak` backups created for both files before editing (pending post-commit cleanup sweep alongside `README.md.bak`).

## [28.08.2026 ~20:15] — REV-24: bare-& false-positive fix for `grep_files` (code-verified + LIVE VERIFIED same day)

**Problem:** prose alternations containing a bare `&` — e.g. `"Backup & Restore|Git & GitHub"` over `TOOLS_REFERENCE.md`, which contains both phrases — were silently forced into **literal mode → 0 matches**, triggering LLM retry loops. Root cause pinned in `isSafeRegex()` (`src/security.ts`): the code-signature heuristic pair `/([*+?&]/` + `/[\w][*&]|[\*&]\s+\w/` fired on `"& Restore"` / `"& GitHub"` even though **`&` is not a JS regex metacharacter** (zero backtracking risk) — i.e. a pure false positive.

**Fixes:**
- **`src/security.ts` (`isSafeRegex`, ~L92–100):** bare `&` removed from clause 1's char class → `/([*+?]/`. Clause 2 (code-signature detection) intentionally kept, so C++-style searches containing `&` are still auto-escaped — but only when paired with a genuine unescaped `*`, `+` or `?`. Inline comment documents the rationale (REV-24).
- **`src/tools/fileSystemTools.ts` (~L2462/2491):** inline heuristic aligned to the same char class; double-quoted hint strings added at the forced-literal sites so a future literal-mode decision is *explained to the caller* instead of failing silently (mid-session string-quoting compile defect on these lines was caught by user's `tsc` and fixed, line-level compile-proven).

**Tests:** 3 new regression specs in `tests/security.test.ts` covering the REV-24 decision boundary; full suite re-run green at **628/628**.

**Verification status:**
- ✅ Code level (user-executed, 28.08 ~19:49): `tsc --noEmit` OK · tsup build OK · typecheck OK · lint OK · jest **36/36 suites + 628/628 tests**.
- ⚠️→✅ Live runtime (28.08 ~20:09, after full LM Studio restart): first smoke run returned the pre-fix signature (`patternMode:"literal"`, 0 matches) — forensics proved the active process was executing a **stale installed copy** (its `src/security.ts` mtime 21.08 = pre-fix). Both fixed source files synced into the install (`C:\Users\root.MPITS\.lmstudio\extensions\plugins\crunch3r\ai-toolbox\src\`, marker verified), then: `grep_files("Backup & Restore|Git & GitHub", TOOLS_REFERENCE.md)` → **`patternMode:"regex"` + exactly 4 matches** (L15/L25 overview rows, L220/L495 headings). Incident closed.

**Deployment note:** the live install runs from **source** (`src/` via `entry.ts`, no `dist/` in that folder) — a direct src-file sync + full restart is sufficient; **no rebuild/reinstall required**. Lesson logged: `patternMode:"literal"` on a known-containing fixture → suspect stale runtime first, compare installed-copy mtimes before re-opening the code.

**Versioning (updated 28.08 ~20:45):** shipped as part of **v1.9.11** — `package.json` + `manifest.json` bumped v1.9.10 → v1.9.11 per user decision, superseding the 25.08 "no bump" policy; manifest revision field stands at **22**. (No dist rebuild required for this hotfix itself — installed copy runs from `src/`; baseline backup `ai_toolbox-v1.9.11-release-baseline-2026-08-28.zip` taken pre-cleanup.)

## [28.08.2026] — StateManager B1/B2/B3 data-loss fixes + rev 21 rebuild & live re-deploy (user-verified)

**Problem:** persistent-memory round-trips silently lost — `get_session_summary()` / `get_memory()` returned empty despite all 50 sessions existing in `.session_context/sessions.json`. Root cause: `StateManager` fresh-start overwrote `.ai_toolbox_memory.msgpack` before/during initialization, plus two related races in the cache-rebuild and origin-tracking paths.

**Fixes (`src/stateManager.ts`):**
- **B1 — init/save race:** `saveToFile()` can run before readiness → added `ensureReady` gating at the save site (~L345) so writes never race initialization.
- **B2 — cache rebuild dropped keys:** `_rebuildKeysCache()` now **merges** into the existing key set instead of replacing it, preserving entries observed pre-rebuild.
- **B3 — origin misattribution:** `saveMemoryFile`'s `_origin` handling made conditional so a re-saved file is not falsely flagged as fresh-start data (which triggered the overwrite path).

**Tests:** new deterministic regression suite `tests/stateManagerRace.test.ts` (5 tests) reproducing each race without timing luck; full Jest suite green pre-deploy, lint clean.

**Build & deploy:** rebuilt `dist/` via tsup (worker-thread sandbox workaround for the no-shell session environment); bundle-verified B1/B2/B3 markers present in fresh build (`ensureReady` at save site, `_rebuildKeysCache` merge, conditional `_origin`). `manifest.json` revision **20 → 21** (pre-bump state preserved as `manifest.json.bak`). User re-deployed ~16:34 same day.

**Live verification:** context write/read round-trip proven in the new process — milestone entry persisted across restart, store diagnostic reports 1 record; no further memory-loss events reported.

**Versioning:** **no version bump — v1.9.10 stays current** (maintainer policy); only `manifest.json` revision advanced to 21 so LM Studio reloads the plugin.

## [25.08.2026 ~00:15] — Chunking fixed-point OOM termination + test-suite isolation fixes (full suite green; user-verified)

**Problem:** deterministic multi-day V8 heap OOM (`Ineffective mark-compacts near heap limit`) in the vector-RAG chunkers. Root cause proven by plain-Node repro: `chunkText` / `chunkDocxText` / `chunkPdfText` (`src/tools/vectorRagTools.ts`, ~L212/277/331) advanced with a fixed stride while the partial final chunk was shorter than the overlap budget — for certain word-count remainders the window start reached a **fixed point** (`startIndex === endIndex`) and the loop never terminated (repro: len=34,209 words, size=500/overlap=50 → stalls at start=len−50). Most real documents terminate "by luck"; poison remainders do not.

**Fixes:**
- **`src/tools/vectorRagTools.ts`**: 3-line termination guarantee in all three chunkers — `startIndex = Math.max(endIndex, startIndex + 1)` — strict forward progress on every iteration. No API/behavior change for well-formed inputs; the stall case now simply emits its final partial chunk and stops.
- **`tests/vectorRagTools.ragWebContent.test.ts`**: regression spec (oversized page) covers the poison-remainder path end-to-end; heading assertion made case-insensitive (`html-to-text` uppercases `<h*>` headings by default — test expectation aligned with library behavior, no source change).
- **`tests/webResearchTools.test.ts`** (test infra only): `beforeEach` mock isolation fixed — `mockReset()` + explicit re-application of base values for the duck-duck-scrape search and `performanceUtils.fetchWithRetry` mocks. Closed the last failing test, proven to be cross-test order contamination (single-test run with `-t` passes 1/1; full suite failed without this).

**Verification:**
- ✅ Full Jest suite green — user confirmed **ALL GREEN** (25.08.2026 ~00:13), including `tests/webResearchTools.test.ts` and the new oversized-page regression spec.
- ⏳ Rebuild + reinstall before the next live use of vector-RAG tools on large/odd-length documents (`npm run build`; bundles carry no version strings, so a normal rebuild suffices).

**Versioning:** **no version bump — v1.9.10 stays current.** This supersedes the "candidate for v1.9.11" notes in the three 24.08 entries below (maintainer decision 25.08: version number stays at 1.9.10).

## [24.08.2026 ~22:10] — rag_web_content fix suite: dead-code removal + soft cap + markup stripping + wikipedia bound

**Context:** screenshot failure (`Tool call failed … Errors: WebSocket closed by the client` on `rag_web_content()` + `fetch_web_content()`, Weinstein Wikipedia URL). Forensic verdict: that string exists NOWHERE in `src/` (grep-verified) — it is LM Studio's transport-level report for an in-flight tool when the **plugin host process dies** (same-day exit-134 heap-fatals). Both tools failed within ~5 s → common cause = host, not two independent bugs. `rag_web_content` was still the worst transient allocator on web paths and guaranteed-to-fail on real Wikipedia articles (page > hard cap → max allocation consumed, then `success:false`).

**Changes:**
1. **Dead code removed** — `src/tools/networkToolsRegistry.ts` + its Jest mock `tests/__mocks__/networkToolsRegistry.ts` deleted. Certainty: zero references in `src/`, `tests/`, `scripts/`; tsup bundles from `src/index.ts` only (file never shipped); no jest mapper entry for it; both changelog entries of today already tracked its deletion as backlog. The dead file held an *unbounded* `response.text()` rag_web_content — re-wiring risk eliminated.
2. **`rag_web_content` (`tools/vectorRagTools.ts`)**:
   - **Soft cap** via existing `readCappedText`: budget 500_000 → **250_000 chars**; oversized pages now return `success:true` + `truncated:true` with usable partial chunks instead of a hard "Page too large" failure after consuming the full allocation (same pattern as the search engines).
   - **Markup stripping before chunking/embedding**: new `htmlToText()` pass — previously raw HTML was chunked as "text" (tag soup scored into embeddings; ~40–60% of budget consumed by markup; `bestMatch.text` returned unreadable HTML to the LLM).
   - **Result payload upgraded**: top-5 chunks ranked by cosine score (`chunks: [{text, score, metadata}]`) + `truncated` flag; `bestMatch` key preserved (now = topChunks[0]) for backward compatibility. Peak transient allocation per call drops from ~5–8 MB to ~2–3 MB.
3. **`wikipedia_search` (`tools/webResearchTools.ts`)**: last unbounded read in the web-research path bounded — `await response.json()` → `JSON.parse(await readBoundedText(response, 200_000))`.

**Tests:**
- New suite `tests/vectorRagTools.ragWebContent.test.ts` (4 tests + sanity): markup-stripping contract (`bestMatch.text` contains prose, no `<`), soft-cap contract (oversized stream → `success:true`, `truncated:true`, stripped chunks), error contract preserved (`RAG search failed: …`), real-`html-to-text` guard.
- `tests/webResearchTools.test.ts`: shared fetch mock's default body switched from HTML to a **JSON stream** (required by change 3; all other assertions unaffected — htmlToText stays mocked, oversized-page regression tests use their own dedicated mocks).

**Verification status:**
- ⏳ Session environment has no shell and the analyzer's tsc integration is inert (`filesChecked: 0`) → run locally: `npm run typecheck`, then `npx jest tests/vectorRagTools.ragWebContent.test.ts tests/webResearchTools.test.ts --silent` (or full `npm test`). Expect green; the two rag suites are the only behavior changes.
- ⏳ Then rebuild + reinstall + live retest of the exact Weinstein query: expected `success:true` with readable chunks (page now truncates softly instead of failing), no "WebSocket closed by the client". If a host OOM recurs, the `[HEAP-GUARD]` line names the next suspect.

**Known residuals (tracked, NOT changed):** `LocalVectorStore` in `vectorRagTools.ts` grows unbounded with repeated `rag_index_*` calls (no size cap like the other LRU caches got) — candidate for OOM part 3 if indexing-heavy sessions recur. GitHub-API `.json()` reads (`gitGithubTools.ts`) remain unbounded (small internal payloads, unchanged since part 2).

**Versioning:** no version bump — folds into v1.9.11 together with the OOM parts 1+2; bump `package.json` + `manifest.json` at release time. Bundle check after rebuild: `name:"rag_web_content"` must remain exactly **1×** per dist file (dedup invariant since v1.9.10).

## [24.08.2026 ~21:50] — OOM part 2: bound the search fallbacks + HTTP client, add heap-pressure watchdog (version bump pending release decision)

**Problem:** two more `Ineffective mark-compacts near heap limit` host kills today (~20:24 and ~21:10), both **~40 s after a fresh plugin start while web-search tools were in flight**. The part-1 guard was live and working (both windows show its `Page too large (> 48.8 KB streamed)` size-cap error firing correctly) — but it only covered `fetch_web_content` + `rag_web_content`.

Evidence from server log (`2026-08-24.1.log`) for the ~20:24 crash: `Search engine "ddg-api" failed: DDG detected an anomaly…` → **fallback chain took over** (unbounded `.text()` paths) → death. The same correlation holds for ~21:10 (web_search in flight, no DELTA completion logged).

Fixes (all minimal, error contracts preserved):
- **`src/performanceUtils.ts`**: new `readCappedText(response, maxChars)` — soft cap, stops reading at budget + cancels socket, returns partial content (a truncated search page still yields its top results), never throws on size. Plus **`checkHeapPressure(toolName)`** watchdog: pre-call heap probe; logs one `[HEAP-GUARD] ⚠️ N MB BEFORE "<tool>" started` line when usage crosses 1 GB — if another OOM happens, this names the suspect call in the log immediately before the crash.
- **`tools/webResearchTools.ts`**: all three fallback engines (`searchDDGFetch`, `searchGoogle`, `searchBing`) now use `readCappedText(…, MAX_SEARCH_HTML_CHARS = 300_000)` instead of unbounded `.text()`. Worst-case allocation per engine run is now bounded.
- **`tools/httpClientTools.ts`**: all five response-body reads in `http_request` / `http_get_json` / `http_post_json` now go through `readBoundedText(…, MAX_HTTP_BODY_CHARS = 500_000)` (JSON parsed from the bounded text; oversized bodies fail loudly like `fetch_web_content`).
- **`toolsProvider.ts`**: wrapper calls `checkHeapPressure()` before every tool execution.

Known residuals (tracked, NOT changed — out of scope for this fix): `gitGithubTools.ts` GitHub-API `.json()` reads, `lmStudioApi.ts` local-API reads (small internal payloads), dead file `tools/networkToolsRegistry.ts` (still zero imports — deletion remains backlog). The exact GB-scale allocator is not yet proven from static analysis alone; the watchdog exists precisely to identify it in one more crash if they recur.

Verification status:
- ⏳ User-side: `npm run typecheck`, `npx jest tests/webResearchTools.test.ts --silent`, then rebuild + reinstall, then live web-search test (user testing immediately).
- If another OOM occurs: the `[HEAP-GUARD]` line + the last `[DELTA]` lines in the server log identify the responsible tool without a debugger.

Versioning: **no version bump** — candidate for v1.9.11 alongside the part-1 OOM guard; bump `package.json` + `manifest.json` revision at release time.

## [24.08.2026] — OOM guard for web-fetch tools (implemented + live-probed; version bump pending release decision)

**Fixes a class of hard plugin-host crashes: `FATAL ERROR: Ineffective mark-compacts near heap limit` when fetching large page bodies.**

Root causes (proven by code read, session 24.08.2026):
1. **`fetch_web_content`**: `await response.text()` materialized the ENTIRE body before its 50 KB check ran — oversized pages allocated their full size regardless of the cap.
2. **`rag_web_content`** (`tools/vectorRagTools.ts`): raw unbounded `fetch()`, no cap at all, plus ~5–10× memory amplification in word-array chunking/embedding, and no timeout.
3. All `fetchWithRetry` paths had **no per-attempt timeout** — slow/stalled transfers held buffers indefinitely.

Fixes:
- New shared infrastructure (`src/performanceUtils.ts`): **`readBoundedText(response, maxChars)`** (Content-Length fast-reject with zero reads + streaming chunked read that enforces the budget and cancels the socket early) and **`WEB_FETCH_TIMEOUT_MS = 30_000`**; `fetchWithRetry` now bounds every attempt via AbortController timeout (caller-supplied signals respected).
- `fetch_web_content`: 50,000-char cap enforced DURING transfer; error contract preserved (`Page too large (…) … Use searxng_search + summary_only`).
- `rag_web_content`: new 500,000-char budget + shared timeout/backoff helper; error contract preserved (`RAG search failed: …`).
- Regression tests in `tests/webResearchTools.test.ts` (suite **oversized page protection**): Content-Length fast path asserts zero chunks read + socket cancelled; chunked over-cap stream aborts after exactly 2 of 3 chunks.

Verification status:
- ✅ Live probe on real network traffic after user rebuild+reinstall: oversized Wikipedia fetch returned `Page too large (> 48.8 KB streamed)` — the bounded reader is active in the installed build and the host stayed alive (pre-fix wording would have been `(177.2 KB)` from full buffering).
- ⏳ `npm run typecheck` + `npx jest tests/webResearchTools.test.ts --silent` to be run locally (session environment has no shell).

Versioning: **no version bump in this change** — candidate for v1.9.11; bump `package.json` + `manifest.json` revision at release time.
Out of scope (tracked): the three search-engine fallback functions still use raw `.text()` on known-small result pages; dead file `tools/networkToolsRegistry.ts` removal.

## [v1.9.10] — 24.08.2026: duplicate tool removal + log-level fix (live-accepted & bundle-verified)

**Fixes:**

1. **Duplicate `rag_web_content` registration in LM Studio's tool list.** Root cause: the `vectorRAG` registry (`tools/vectorRagTools.ts`) and the `webSearch` registry (`tools/webResearchTools.ts`) both registered a tool with that name, and `toolsProvider.ts` pushes all registry output without any name-dedup → duplicate UI entry + non-deterministic dispatch between two different implementations. The keyword "placeholder" implementation (50 KB cap, top-5 sentence filter) was removed from `webResearchTools.ts` (tool block + now-unused `RagWebContentParams` interface); the tool is now provided exclusively by the real-RAG version in `vectorRagTools.ts`.
   **Verification:** user rebuild + reinstall → UI shows exactly one entry; bundle grep = exactly 1× `name:"rag_web_content"` each (`dist/index.js` L290769, `dist/index.mjs` L288744); size deltas −823 B / −804 B vs. the accepted v1.9.9 build. No tests touched (suite has no assertion on the removed block; count check stays true).
   *Note:* a third definition exists in dead code `tools/networkToolsRegistry.ts` (orphan file, zero imports — verified) — its removal is tracked as backlog, not part of this fix.
2. **grep_files skip log level** (`fileSystemTools.ts`, sync-regex path): the per-file line-cap skip message used `console.warn` → stderr → displayed as `[ERROR]` in LM Studio dev logs despite being an expected, informational event (it is already reported to the caller via `skipped_files`). Changed to `console.log` ([INFO]). Genuine anomaly warnings elsewhere were intentionally left untouched.

**Versioning:** `package.json` v1.9.10 + `manifest.json` revision 20. Bundles do not embed version strings (proven in the v1.9.9 release), so a normal rebuild suffices.

## [23.08.2026] — evening: grep_files hang fix (shipped & bundle-verified)

**Problem:** `grep_files` could effectively hang on certain patterns/files in the sync regex scanning path.

**Root causes (two defect classes, fixed across two sessions):**
1. **Escape-blind alternation splitter** — alternations were split on every literal `|`, including escaped occurrences (`\|`) and inside groups with escaped parentheses → malformed/partial regexes. Fixed with an escape-aware splitter. *(Optional jest regression test for the splitter: still open, see "Open items" in session notes.)*
2. **No real hard-stop on the synchronous regex loop** — added deadline-based aborts so a runaway pattern cannot block indefinitely.

**New hard limits (grep_files):**
- `GREP_SCAN_DEADLINE_MS = 15000` — total scan deadline; results returned as partial + `aborted: true`.
- `MAX_LINE_CHARS_REGEX_MODE = 20000` — lines longer than this are skipped in regex mode.
- `PER_REGEX_TIMEOUT_MS = 500` — per-regex budget; exceeded → abandon that candidate and continue.
- Single-file backstop via `Promise.race` at deadline + 5 s.

**Verification:** build produced after 23.08.19:22, reinstalled by user, verified byte-exact in installed `dist/index.js` + `index.mjs`.

## [23.08.2026] — evening: DELTA "chat used" log enhancement (shipped & bundle-verified)

**Change:** `[AutoTracker] [DELTA]` log lines now include a live chat-used token estimate, e.g.:
`… | chat used ≈ N tok …`

- Computed in `src/tokenStatsManager.ts` (`recordToolResult`): **turnBaselineTokens** (TokenCheck baseline captured at turn start) **+ midLoopEstTokens**.
- Nested-count semantics: tool `+delta` ⊆ turn total ⊆ `chat used`.
- Gating: only emitted when baseline > 0; field omitted if the ContextGuard recount fails.

## [23.08.2026] — earlier wind-down (same day)

- **FIX #20 close-out (AutoTracker mid-loop token counting):** fully implemented & live-verified in production (user confirmation 11:49). Session closed the last gaps: fixed 2 false-positive-boundary test expectations and added 2 jest mapper entries.
- **Cosmetic item 1/2 — [TokenCheck] log rounding:** float values now rounded (`Math.round`) at the log site only; rebuilt as build#3, bundle-verified by exact +12 B size delta + content grep, reinstalled by user.
- **Cosmetic item 2/2 — en-US locale pins for model-facing strings:** all pins applied; rebuilt as **build#4 = live known-good install** (includes all locale pins + Math.round fix). App tests passed; tree clean at end of session.

## [22.08.2026] — grep_files contract fixes & sibling-defect audit (all user-verified)

*(One-line pointers only — full details remain in the archived `CHANGELOG.md`.)*

- **G1:** `matchGlob` anchored the regex before its escape pass → every include pattern matched 0 files silently. Fixed.
- **G3:** hard per-file line gate (5,000) made configurable via `max_lines`; skipped files reported in `skipped_files`. New regression suite `tests/grep_files_matchglob.test.ts` (+1 test-defect fix the same evening: marker existed only in `big_lines.txt`).
- **FIX-G4 / FIX-G3b:** sibling defects found by audit — `find_replace_all` hardcoded 5,000-line cap now parameterized; `grep_files.exclude`/`include` glob contract aligned. +7 regression tests; user confirmed all build & tests OK.

## [21.–22.08.2026] — FIX #19 verification & cleanup (pointers)

- **FIX #19 verified by user** ("fix 19 funktioniert"); cleanup session deleted all 11 `.bak` files project-wide + fresh full backup; both fixes live in installed plugin (checkpoint 22.08, 20:30).
- AutoTracker mid-loop issue documented as FIX #20 candidate (`future_improvements/autoTracker_midloop_fix_plan.md`) after the earlier `predictionLoopHandler` approach failed on LM Studio core exclusivity (tools provider XOR prediction loop handler).

---

### Open items carried into next sessions
1. Optional jest regression test for the escaped-paren alternation splitter.
2. Docs sync: TOOLS_REFERENCE grep_files limits, DOCUMENTATION/ARCHITECTURE DELTA format & tokenStats sections (tracked by plan `plan_...wybqqwk1v`).
