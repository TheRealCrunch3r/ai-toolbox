# Changelog — ai_toolbox (active)

> **This file supersedes `CHANGELOG.md`.** The old changelog is preserved as archived history only.
> New entries are added at the top of this file. Details below were compiled from verified session records and bundle-level verification (`dist/index.js` + `index.mjs` are unminified, so shipped content was confirmed byte-exact).

**Current release: v1.9.10** (`package.json` + `manifest.json`, revision 20) — consolidated maintenance release: duplicate-tool-removal + grep_files log-level hotfixes (24.08), then the OOM-hardening suite (web-fetch guards, search-fallback & HTTP-client caps, heap watchdog), the rag_web_content fix suite, and the chunking fixed-point OOM termination (25.08). **Version stays at v1.9.10** per maintainer decision 25.08 — no bump to v1.9.11.

---


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
