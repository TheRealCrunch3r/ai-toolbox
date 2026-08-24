# Changelog — ai_toolbox (active)

> **This file supersedes `CHANGELOG.md`.** The old changelog is preserved as archived history only.
> New entries are added at the top of this file. Details below were compiled from verified session records and bundle-level verification (`dist/index.js` + `index.mjs` are unminified, so shipped content was confirmed byte-exact).

**Current release: v1.9.10** (`package.json` + `manifest.json`, revision 20) — maintenance release for the two cosmetic hotfixes below (duplicate tool registration + grep_files log level), on top of v1.9.9 (revision 19, first tagged release after the v1.9.8 era).

---

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
