# Changelog — ai_toolbox (active)

> **This file supersedes `CHANGELOG.md`.** The old changelog is preserved as archived history only.
> New entries are added at the top of this file. Details below were compiled from verified session records and bundle-level verification (`dist/index.js` + `index.mjs` are unminified, so shipped content was confirmed byte-exact).

**Current release: v1.9.17** (`package.json` + `manifest.json`, revision 29; version + revision bumped 08.09 ~21:5x): Tool Gating Profile — persistent user tool-toggle memory across new chats (entry below). **Previous release v1.9.16** (`package.json` + `manifest.json`, revision 28; version + revision bumped 08.09): `web_search` zero-result fallback fix — a dead or empty engine no longer stops the multi-engine search chain. **Earlier release v1.9.15** (`package.json` + `manifest.json`, revision 27; version bumped 02.09, rev re-bumped 03.09 for the Hub-dependency hotfix): `pattern_scan` ripgrep phase-1 candidate prefilter (B', Option A port from grep_files v1.9.13+) with guaranteed full-JS fallback. **Previous release v1.9.14** (`package.json` + `manifest.json`, revision 25; bumped 02.09): `get_memory` local-file parse guard — mixed-shape memory file no longer aborts the PRIORITY-1 read (top entry). **Previous release v1.9.13** (revision 24, bumped 02.09): `grep_files` ripgrep-backed regex engine with JS fallback. **Previous release v1.9.12** (revision 23, bumped 31.08): `pattern_scan` tool + puppeteer `connected` fix + dead-file removal (entry below). **Previous release v1.9.11** (revision 22) — contained the consolidated maintenance work of the v1.9.10 window: duplicate-tool-removal + grep_files log-level hotfixes (24.08), the OOM-hardening suite (web-fetch guards, search-fallback & HTTP-client caps, heap watchdog), the rag_web_content fix suite, the chunking fixed-point OOM termination (25.08), the StateManager B1/B2/B3 data-loss fixes (28.08), and REV-24 bare-& false-positive fix for `grep_files` (hotfix deployed via direct src-sync + full restart 28.08; installed copy runs from `src/`). **Version bumped v1.9.10 → v1.9.11 on 28.08 (~20:45)** — user-directed release decision supersedes the "no bump" policy of 25.08.
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
## [12.09.2026 ~23:xx] — READS-EXTENSION: `manage_projects` absorbs registry reads (`info` / `list` / `search`)

**Context:** same-evening follow-up to the MANAGE remodel — user asked which further tools could be merged into a unified action tool; candidate analysis by entity-lifecycle + parameter-overlap criteria picked extending `manage_projects` with read-only actions as the top fit (same entity `ProjectRegistryData`, same file, zero new state).

**Changes (`src/tools/contextManagementTools.ts`):**
- **`manageProjectsImpl()` gains 3 read actions:** `info` (→ `getProjectByPath`; not-found error text unchanged), `list` (→ `getAllProjects`; F1' self-describing empty result carried over verbatim), `search` (→ `search(query, maxResults)`; default 10 kept; F1' diagnostics attached only when status ≠ `has_projects` — logic moved from tool body into impl without semantic change).
- **`manage_projects` schema:** enum extended to `register|unregister|update|clear_all|info|list|search`; new optional params `query` + `max_results` (1–50, default 10); `working_dir_path` now documented as required for register/unregister/update/info; description restructured into MUTATIONS/READS sections — consent contract preserved. One stale hint updated (unregister's "use list_projects/search_projects" → `action=list`/`action=search`).
- **Deprecated aliases (kept one release cycle, per house precedent):** `get_project_info`→`info`, `list_projects`→`list`, `search_projects`→`search`. All delegate to the shared impl and preserve LEGACY response shapes exactly (bare project object / `{projects}` ± registry diagnostics; no `action` key), so existing callers/prompts keep working.
- **Docs/locales sync:** TOOLS_REFERENCE.md tool table (manage_projects row updated + 3 deprecation marks); all five locale files en/de/es/zh-CN/zh-TW (manage_projects entry rewritten, 3 entries marked deprecated). `toolPriority.ts` untouched — none of the four tools has a tier entry there (scan-verified).

**Tests:** new manager-level suite block in `tests/manageProjects.test.ts` ("READS-EXTENSION", **9 tests**): getProjectByPath known/unknown (pins the info not-found branch), getAllProjects fresh→[] + round-trip, search name-substring (case-insensitive) / path-only branch / maxResults cap / no-match → [] with `has_projects` status vs fresh registry `missing` status (F1' gate inputs pinned). F1' status semantics themselves remain pinned in `projectRegistryStatusMigration.test.ts` — deliberately not re-asserted. No existing test pins the tool-level response shapes of the absorbed tools (scan-verified) → alias shape-preservation is by construction; expect the prior green baseline + 9 new cases, zero churn elsewhere.

**Verification:** ✅ CLOSED 12.09 ~23:29 — user confirmed "all tests PASS" (typecheck + jest green; one syntax error in the NEW test block itself was caught on first run and fixed pre-confirmation: `F1'` apostrophe inside single-quoted test titles → reworded to `F1-prime`; zero product-code impact). No version bump — folds into the pending v1.9.18 proposal (rev 30) alongside MANAGE + FIX #32; release decision remains with user. Adds to the release `.bak` sweep: `src/tools/contextManagementTools.ts.bak`, `src/locales/{en,de,es,zh-CN,zh-TW}.ts.bak`, `tests/manageProjects.test.ts.bak`.

---
## [12.09.2026 ~22:35] — FIX #32: `updateSessionIndex` silent skip for orphaned per-copy legacy index (recurring log-noise class)

**Context:** user spotted a recurring `[ERROR]` line in LM Studio's logs at 12.09 ~22:22 (`[StateManager.updateSessionIndex] Project 'ai_toolbox' is not yet registered in index…`). Forensics (all live-verified same session): `updateSessionIndex()` — invoked after EVERY state save — requires an entry for the current project in `<PLUGIN_ROOT>/.session_index.json`, a PER-COPY file next to the running bundle. The install dir holds no such file, and since REG-MOVE **no code path seeds one anymore**: registration lives exclusively in the persistent data-dir registry (`~\.lmstudio\extensions\data\crunch3r\ai-toolbox\project_registry.json`). Consequence: on every fresh copy (i.e., after each `lms dev --install` wipe) the warn fired on every `save_memory`/`save_session_summary`, and its suggested remedy was unperformable — `manage_projects(action='register')` never writes to that file. **Zero data impact:** memory + summaries persist via working-dir msgpack stores, `sessions.json` index unaffected; only the legacy `last_session_saved` bookkeeping in the orphaned file was skipped (its sole consumer is ProjectRegistryManager's READ-ONLY migration fallback `_loadFromSessionIndex`). Side finding: the 22:22 line predates a 22:23:23 reinstall (`install-state.json` at=1789244603563), so it came from a stale in-memory bundle (old `register_project(...)` wording); on-disk `.lmstudio/production.js` already carried today's code.

**Change (`src/stateManager.ts`, else-branch of `updateSessionIndex()`, ~10 lines):** warn → silent `return` with a FIX #32 comment documenting the orphaned-by-design state and pointing at Option C (full mechanism removal) as tracked follow-up. Registered-entry behavior unchanged (timestamp update + registered→active promotion).

**Tests:** no test pinned the old warn (scan-verified across `tests/`); existing session-index suites cover the registry's read-only legacy fallback, which is untouched → expected to stay **779/49 green with zero test changes**.

**Verification:** ⏳ user-run: `npm run typecheck` + targeted `npx jest tests/stateManager.test.ts tests/manageProjects.test.ts --silent` (or full `npm test`, expect 779/779 · 49/49). Live proof after sync+restart: any `save_memory` in a live chat → NO `[StateManager.updateSessionIndex]` line in main.log.

**Versioning:** no bump — folds into the pending v1.9.18 proposal (rev 30) alongside MANAGE; release decision remains with user.

---
## [12.09.2026 ~21:4x] — MANAGE feature (Option B): `register_project` → `manage_projects`, with unregister/update/clear_all + tombstone protection

**Context:** user request "register project" surfaced that the registry had no way to REMOVE a project once registered, and stale cross-stamped session-memory entries could silently resurrect unregistered paths via `_syncFromSessionMemory()`. Design decision (user-approved Option B): remodel `register_project` into one mutation tool `manage_projects` with four actions; `register_project` stays as a deprecated alias for one release cycle.

**Changes:**
- **New `manage_projects` tool (`src/tools/contextManagementTools.ts`)** — flat params + per-action validation (no zod discriminated union, by design): `action=register|unregister|update|clear_all`; destructive actions require `confirm=true`. Shared implementation closure; the deprecated `register_project` alias delegates to it.
- **`ProjectRegistryManager.unregisterProject()`** — removes an entry via canonical path match (F1 pattern) and records the path in a new bounded `unregistered` tombstone list (`UNREGISTERED_TOMBSTONE_MAX = 50`, newest-at-end). `_syncFromSessionMemory()` now skips tombstoned paths, so stale cross-stamped memory entries can no longer resurrect explicitly removed projects.
- **`ProjectRegistryManager.updateProject()`** — rename and/or sourceDirs replacement for an EXISTING registration only (never creates; unknown path → `{updated:false}`).
- **Tombstone lifecycle:** explicit re-registration clears the tombstone (user intent wins); `clearAll()` PRESERVES tombstones (a full wipe must not resurrect everything in one sweep). Backward compatible: pre-MANAGE registry files simply lack the field.
- **Docs/locales sync:** TOOLS_REFERENCE.md table + note, DOCUMENTATION.md, src/index.ts header rule 2d, stateManager.ts message/comments, projectAutoDetect.ts comments/warn, all five locale files (new `manage_projects` entry + deprecation note on `register_project`).

**Tests:** new suite `tests/manageProjects.test.ts` (7 tests: unregister+tombstone, no-op for unknown path, re-registration clears tombstone, update rename/sourceDirs without creation, update no-creation contract, clearAll preserves tombstones, resurrection-block test with a control proving the sync path is exercised). One pre-existing assertion updated (`projectRegistryStatusMigration.test.ts` F1' note now routes to `manage_projects`).

**Verification:** ✅ Full `npm test` green 12.09 ~22:15 — **779/779 tests, 49/49 suites**. During this run one fixture defect surfaced in the new suite itself (implementation was correct): the resurrection-block cross-stamp memory file had been written as raw JSON bytes into a `.ai_toolbox_memory.msgpack` that `_syncFromSessionMemory()` decodes via `@msgpack/msgpack` — first byte 0x5B decoded as fixint → non-array → source skipped silently, so the "ghost NOT resurrected" assertion passed VACUOUSLY while the no-tombstone control (which must pass to prove the sync path is live) failed. Fix: fixture now written with `encode()` from the same library (`tests/manageProjects.test.ts`); post-fix the tombstone logic is genuinely exercised on both sides. ✅ User-run gates all green by ~22:17: `npm test` **779/779 · 49/49** (22:15) + `npm run typecheck` clean (analyzer tsc integration inert here — filesChecked 0, hence user-run). All verification gates closed. No version bump yet — release decision pending (proposal on table: v1.9.18 / rev 30 per house convention).

---
## [12.09.2026] — Post-reinstall registry survival arc: FIX #29 (bootstrap reorder) + REG-MOVE (registry → persistent data dir), with test-infra fixes #30/#31b

**Context:** 11.09 reinstall forensics proved `lms dev --install` wipes the plugin dir — including BOTH registry sources (`project_registry.json` + `.session_index.json`) — while `.ai_toolbox_state.json` can still hold a VALID workingDir. Two live defects followed: (a) post-reinstall, `list_projects()`/`search_projects()` returned `[]` for the whole session although durable session-memory stamps existed; (b) test runs leaked fake tmp working dirs into `<repoRoot>/.ai_toolbox_state.json`, which `lms dev --install` shipped into the plugin snapshot and broke boot CWD resolution live (canary d).

**Changes:**
- **FIX #29 (`src/workingDir.ts`):** `restoreLastActiveProjectCwd()` now runs `bootstrapRegistryFromSessionMemory()` BEFORE the idempotent guard, on every boot. The 11.09 bootstrap call sat BELOW the guard and was therefore only reachable when persisted CWD state was missing — exactly the post-reinstall hazard (valid stale state → early return → empty registry for the whole session; observed live 12.09: both tools returned `[]` although durable stamps existed in plugin-dir + project msgpack stores). Bootstrap is self-conservative: no-op when EITHER registry source yields ≥1 project, materializes only directories that still exist on disk (no ghosts, no auto-registration — index.ts rule #2 intact); healthy-case cost = two small JSON reads per boot.
- **REG-MOVE (user decision):** `project_registry.json` (+`.bak`) relocated from the plugin dir to LM Studio's persistent data dir `%USERPROFILE%\.lmstudio\extensions\data\crunch3r\ai-toolbox\` — survives every `lms dev --install` wipe. New module `src/dataDir.ts` (`getDataDir()`, jest-guarded). Writers: boot-time bootstrap (workingDir.ts) + ProjectRegistryManager (contextManagementTools.ts) now target the data-dir primary with atomic tmp+rename (Windows file-lock fallback); plugin-dir copies kept as read-fallback for the migration window. Readers: `listRegisteredProjects()` priority = data-dir registry → plugin-dir registry → legacy `.session_index.json`.
- **FIX #30 (`jest.config.cjs`):** REG-MOVE's new `../dataDir.js` import crashed contextSearch.test.ts ("Cannot find module ../dataDir.js") — the inserted mapper entry was double-escaped and matched NEITHER spec form. Both dataDir entries (double-dot + single-dot) regenerated byte-for-byte from known-good siblings, verified via require(config)+RegExp.test against every specifier form (hand-typed escapes corrupt across JSON/tool layers).
- **FIX #31/#31b (`src/workingDir.ts` + tests):** test-hygiene leak — `workingDir.test.ts`'s `setWorkingDir(tmpdir)` persisted fake working dirs into the REAL `<repoRoot>/.ai_toolbox_state.json`. State-file location is now jest-guarded to a per-run temp dir, resolved LAZY and mock-safe via new exported seam `getStateFilePath()` (one location per process; try/catch around `os.tmpdir` with `fs.mkdtempSync('')` fallback + pid-suffixed last resort that never touches the production file) — module-scope side effects eliminated. First attempt (FIX #31, module-scope mkdtemp) broke 2 suites: utilityTools.test.ts crashed at setup ("os.tmpdir is not a function" — its full `jest.mock('os')` factory lacked tmpdir), cwdConsistency failed against its hardcoded repo-root path. FIX #31b remixed both: utilityTools' `'os'` mock gained `tmpdir`; cwdConsistency asserts against the module-owned path (imports `getStateFilePath()`). **Rule for future on-disk-state assertions: import `getStateFilePath()` — never re-derive.** Production path unchanged.
- **Tests:** new suites `tests/registryDataDirMove.test.ts` + `tests/projectRegistryStatusMigration.test.ts`; badge updated to 772 tests / 48 suites (badge count cross-confirmed by jest's own "48 total" line).

**Verification:** user-run full `npm test` **772 passed / 48 suites** at 20:21 and again 21:01 after FIX #31b. Anti-leak verified without re-running (delegated-proof): dev `.ai_toolbox_state.json` content = valid dev path + mtime 18:42Z (pre-test-run) → untouched during the green run. Deployed live ~20:35; canary a ✓ (data-dir registry primary+.bak written by the live process, content verified), b unreachable by design this cycle, c code-reviewed only.

**Versioning:** no bump — **v1.9.17 rev 29 stays current**; `package.json` description updated to "772 passing tests across 48 suites". Canary d ✓ closed 12.09 ~21:2x: plain LM Studio restart → fresh chat WITHOUT `cd` — tool-process CWD already resolved to the dev tree before any explicit pin (`previous_directory` = dev path at session start), relative ops landed in the dev tree. All four canaries now closed (a ✓ live-verified, b unreachable by design this cycle, c code-reviewed, d ✓).

---
## [08.09.2026 ~21:5x] — v1.9.17 rev 29: Tool Gating Profile (persistent user tool-toggle memory across new chats)

**Context:** LM Studio's `getPluginConfig()` is PER-CHAT scoped and falls back to schematic defaults for values the host has not explicitly persisted, so a toggle flipped in one chat could reset in the next — user tool choices had no plugin-side memory. Agreed design (08.09): auto-capture + sparse storage + conservative "sticky keys" contract; booleans only (never paths/tokens/secrets).

**Changes:**
- **New `src/tools/toolGatingProfile.ts` (~320 LOC):** user-level sparse profile at `%USERPROFILE%\.ai_toolbox\tool_gating_profile.json` — outside the plugin dir on purpose, so it survives reinstalls/updates; written via shared `atomicWriteFile` (temp + rename → crash-proof); missing/corrupt file degrades to empty profile (defaults apply), never breaks registration.
- **Single-entry-pass semantics (`syncToolGatingProfile`)** applied in `toolsProvider.ts`: ① RECONCILE — only a live NON-default value that differs from storage is an unambiguous re-toggle and beats sticky storage; default-valued differences (fresh-chat fallback vs explicit revert are byte-indistinguishable per the SDK's per-chat scope) keep the stored value. ② OVERLAY — all other stored values win over host defaults in new chats. ③ FINALIZE — storage rebuilt from final config, keys at default evicted (sparse), persisted exactly once on change (no steady-state disk I/O); cache ends equal to disk.
- **Hook hardening (`toolsProvider.ts`):** fire-and-forget capture + drain before return; `.catch(err => {…; return false}).then(() => undefined)` keeps the chain `Promise<void>`-typed WITHOUT a cast (user-caught TS2322 fixed per session rule — no-cast), wrapped in try/catch so synchronous throws (e.g. path resolution) can never break tool registration. GOD MODE untouched: capture is independent of gating, and `godMode=true` itself is captured like any other toggle.
- **Tests:** new suite `tests/toolGatingProfile.test.ts` (+12 cases; 46 suites total); two round-2 root causes fixed during gate runs: (a) a case assumed `webSearch` default=false — schema default is TRUE, so the scenario was flipped to a truly non-default seed (`{webSearch:true}`, live=false), module behavior proven correct by hand-trace of reconcile/overlay/finalize; (b) cross-test sticky-toggle leakage via the pid-scoped redirect file → hermetic `beforeEach` (`resetGatingProfileCache()` + unlink of redirected profile path).

**Verification:** all four gates green (user-run 08.09): typecheck 0 errors · ESLint 0 warnings · targeted jest both suites green · full `npm test` **761/761 PASS**. Live proof: installed source-run plugin captured real user toggles into `%USERPROFILE%\.ai_toolbox\tool_gating_profile.json` (`browserAutomation`, `executionShell`, `executionTests` = true, written 08.09 ~21:28 local).

**Versioning:** released as **v1.9.17** — `package.json` v1.9.16 → v1.9.17 (description "761 passing tests across 46 suites"); `manifest.json` revision 28 → 29 so LM Studio detects the update; installed-copy metadata mirrored same session (live install runs from source, verified byte-identical to dev pre-bump). Pending: re-compress `tests.7z` before Hub publish (`lms push`) — tests/ changed since last archive.

---
## [08.09.2026 ~17:40] — v1.9.16 rev 28: `web_search` zero-result fallback fix (dead engine no longer stops the chain)

**Context:** live network probe (08.09, datacenter IP) showed `ddg-api` blocked by DDG anomaly detection and Google returning an HTTP-200 JS-shell/consent page with **zero parseable results**. The old `searchWithFallbackChain` treated a 0-result engine response as success (`success:true, count:0`) and STOPPED the chain there — Bing (verified working from this IP, 11 results) was never reached.

**Change (`src/tools/webResearchTools.ts`, minimal):**
- An engine returning `results.length === 0` is now logged and treated like a failed engine → chain continues to the next engine (previously: success-with-zero terminated the search).
- New `anyEngineEmpty` flag distinguishes the final error wording when all engines responded but yielded nothing parseable ("No search results found — engines responded but returned no parseable results (possibly bot-blocked)") from hard total failure ("All search engines failed"). The `<2` sparse-but-real success threshold is unchanged.
- Regression tests: new `describe 'web_search zero-result fallback'` block in `tests/webResearchTools.test.ts` — mid-chain shell pages must not stop the chain (expect `engine=bing`, `count=2`, 3 fetch calls) + all-empty → new wording. Suite **11/11 PASS** (9 pre-existing unmodified + 2 new), user-run locally; ESLint 0 problems, tsc clean.

**Post-install verification (same day, this session):** rebuild + reinstall ~17:28–17:30 (install-state `at`=today 17:29:50; shipped bundle `.lmstudio/production.js` contains all fix markers ×1). Live test `web_search("Node.js latest LTS version")` → **success, count=10, engine=`ddg-fetch`** — log line L3268 @17:36:28 shows `Search engine "ddg-api" failed: DDG detected an anomaly…` followed by correct chain advance (today the dead first engine took the hard-fail path; the zero-result soft-fail line is covered by the regression tests + bundle markers). Zero worker-pool rollback-trigger lines post-restart.

**Versioning:** released as **v1.9.16** — `package.json` bumped v1.9.15 → v1.9.16 (description: "748 passing tests across 45 suites") and `manifest.json` revision advanced 27 → 28 so LM Studio detects the update; reinstall + restart completed same day, fix verified live above.

---
## [03.09.2026 ~17:25] — v1.9.15 rev 27 hotfix re-publish: `ripgrep` promoted to runtime dependency for Hub installs

**Context:** post-rev-26 live verification on the user's machine (03.09) confirmed B' phase-1 LIVE locally — then exposed a packaging gap for everyone else. The ripgrep fast path (`pattern_scan` B' + `grep_files` rg engine) resolves the npm package `ripgrep` via lazy dynamic import at tool-call time, but it was declared in **devDependencies**. Official LM Studio docs (verified 03.09): a Hub install auto-downloads dependencies from `package.json`+`package-lock.json` with bundled Node v22.21.1 and never runs postinstall scripts — so any production-scoped (`--omit=dev`) install would omit the dev-flagged package → first engine call resolves `{status:'fallback-required', reason:'missing-dependency'}` → every Hub user silently pinned to pure-JS fallback forever (stdout invisible in main.log, no error surface). Local dev installs mask this because a full `npm install` populates devDeps too.

**Change (commit ec783a8):** `"ripgrep": "^0.3.1"` moved `devDependencies` → `dependencies`; lock entry loses its `"dev": true` flag — pin stays **exactly 0.3.1** (the build live-verified this session; no version chase mid-release). Same commit's npm normalization also synced the stale lock root version (v1.9.12 → v1.9.15, stale since C3) and applied within-range transitive patch bumps only (browserslist chain [dev] + `@xmldom/xmldom` 0.8.13→0.8.15).

**Verification:** lock diff audited = exactly the planned flips; smoke suites after refresh: `ripgrepEngine.test.ts` + `patternScanBPrime.test.ts` **39/39 PASS** incl. real-WASM integration (resolution unaffected). End-user proof only exists on a clean Hub install — one-line check when testable: does `node_modules/ripgrep/` exist after first download?

**Versioning:** no version-number change — **v1.9.15 stays current**; `manifest.json` revision advanced 26 → 27 so LM Studio detects the update (pure rev-bump precedent: v1.9.10 rev 20→21, 28.08). Re-publish via `lms push`.

---



---
## [v1.9.15] — 02.09.2026: `pattern_scan` ripgrep phase-1 candidate prefilter (B')

**Context:** plan_1788368034162_2jkd1nvxv. B' ports the grep_files v1.9.13 Option A architecture verbatim to `pattern_scan`: regex-mode directory scans first run an in-process WASM ripgrep prefilter that names the files whose content can match; ALL line shaping and every resource gate stay in the existing JS worker pipeline, so any non-ok engine outcome leaves output byte-identical to the pre-B' behavior. Goal: cut per-line `.test()` CPU cost (and ReDoS exposure) on regex-mode scans **without changing any visible output field, cap, or skip-record contract**.

**Changes:**
- **`src/tools/patternScan.ts` (RIPGREP-PHASE-1 block)** — `searchCandidates` from the shared module (`../utils/ripgrepEngine.js`, same import identity as fileSystemTools; lazy dynamic import, never breaks boot). Inputs: absolute root, raw trimmed pattern, mode `'literal'` iff explicit literal or demoted (else `'regex'`), `caseInsensitive = !(options.caseSensitive ?? true)` — SENSITIVE default, deliberately NOT mirroring grep_files' hardcoded `-i`; exclude globs = `DEFAULT_EXCLUDE_DIRS` only (user globs keep this module's custom semantics in the JS filter); `maxDepth` for dir roots. Candidate paths are normalized from BOTH rg output formats (absolute and root-relative). On `'ok'`: named targets go to the workers; every non-named target still passes stat + size gate + a Buffer newline-count read, so `'size'`/`'line-cap'` skip records AND `stats.filesScanned` stay byte-identical to the full walk (increment at the worker's exact position). **ANY** non-ok status (`no-matches`, `fallback-required`, throw) → full pre-B' pipeline; no short-circuit even on a clean negative.
- **Documented divergence (pinned, not a regression):** NO `'binary'` skip record for a file rg proved pattern-absent — binary detection needs content inspection, and such a file is unobservable in every output field except `skipped[]`.
- **Tests** — new `tests/patternScanBPrime.test.ts` (liveness-gated live battery + unconditional dep-absent reference tests; unique `BPRIME_*` tmpdir fixtures, TARGET_COUNT=7). Existing `tests/patternScan.test.ts` binary test rewritten tolerant-style: accepts `'binary'` record (fallback regime) OR absent record (live regime), still fails on any third outcome — a documented divergence, not a silent weakening.
- **Docs** — `patternScan.ts` header corrected (the "no dependency on any other tool module" claim is superseded by the ripgrepEngine import) + `TOOLS_REFERENCE.md` `pattern_scan` entry gained the B' section with the divergence note.

**Session triage (02.09, two new-feature defects fixed during verification):**
- **TS literal-type inference:** `let effectiveMaxDepth = SCAN_DEFAULTS.maxDepth;` carried a narrowed literal type (`10`) from the frozen defaults object → TS2322 at the dir-branch reassignment. Fixed with an explicit `number` annotation (type-level only, zero runtime effect).
- **Suite compile break:** an unescaped apostrophe in a test title (`pre-B'` inside a single-quoted string) terminated the literal early → 7-cascade TS1005/TS1128. Fixed by escaping to `B\'`, matching the file's own convention.

**Verification (user-run, 02.09):** typecheck / lint / build all PASS; full Jest suite **ALL PASS GREEN**. Both engine regimes were empirically exercised on the dev machine: a targeted two-file run downgraded under jest (ESM import) → byte-exact fallback path proven (46/46); the subsequent FULL-suite run proved phase-1 LIVE in the same environment — the pre-analyzed binary-test failure appeared exactly once with precisely the documented divergence, confirming live behavior before the tolerant rewrite. Host-runtime performance follows the grep_files precedent (3.4x/2.8x on hosts b/c/d/e); per pinned observability facts, post-install engine state is verified via tool-response fields (`stats.filesScanned` differential), since plugin stdout never reaches `main.log`.

**Versioning:** released as **v1.9.15** — `package.json` + `manifest.json` bumped v1.9.14 → v1.9.15 on 02.09, revision advanced 25 → 26 so LM Studio detects the update (user-directed). Suggested commit: `pattern_scan B': ripgrep phase-1 candidate prefilter (Option A parity, fallback-guaranteed)`.

## [v1.9.14] — 02.09.2026: `get_memory` local-file parse guard (hotfix)

**Context:** post-v1.9.13 reinstall verification surfaced a pre-existing defect in `get_memory`'s PRIORITY-1 read path (`src/tools/contextManagementTools.ts`). Every call logged to plugin stderr: `[ContextManagement.get_memory] Local file parse failed: TypeError: Cannot read properties of undefined (reading 'startsWith'). Falling back.` — first observed 02.09 ~17:43, reproducing on the fresh v1.9.13 process at ~18:07 after reinstall.

**Root cause:** `.session_context/.ai_toolbox_memory.msgpack` in a working dir is shared storage for two record families: `save_memory` facts (`{key,value,timestamp}`) and auto-context entries from the context-management/auto-summarize stream (`{id,title,type,content,tags,scope,frequency,project_path,timestamp[,date]}`). This project's file held 154 records — only 3 with a string `key`; the other 151 have none. The reader filtered with `e.key.startsWith('memory_')` → `TypeError` on the first keyless record → the whole try-block aborted and PRIORITY-1 (local project file, the documented #1 source) silently died; every read fell through to plugin-root/RAM fallbacks. Writes were never affected (`save_memory` kept persisting); only reads degraded — facts looked present in RAM but would not survive a process restart from disk.

**Fix (2 lines, `contextManagementTools.ts` only):** the key filter is now null-safe at both read sites — local project file and plugin-root fallback:
```ts
// before
.filter(e => e.key.startsWith('memory_'))
// after
.filter(e => typeof e.key === 'string' && e.key.startsWith('memory_'))
```
No schema change, no migration, no new storage separation; context-shaped records are now skipped by the filter (their purpose) instead of throwing. The third `startsWith('memory_')` occurrence in the same function (over string keys from `Object.keys`) was already safe and is untouched.

**Verification:** static re-read of both patched lines + CRLF integrity audit (file remains 100% CRLF); user-run gate pending: `npm run typecheck`, `npm run test:quiet`, `npm run build`, then reinstall v1.9.14 → `get_memory` expected to return all 3 local `memory_*` facts with **no** parse-failure line in `main.log`.

**Versioning:** released as **v1.9.14** — `package.json` + `manifest.json` bumped v1.9.13 → v1.9.14 on 02.09, revision advanced 24 → 25 so LM Studio detects the update (user-directed).

## [v1.9.13] — 02.09.2026: New `grep_files` ripgrep-backed regex engine with JS fallback (Option A)

**Context:** plan_1788282568340_z5a4r521c, gated end-to-end by P0 spike data (`scripts/rg_spike.mjs`, T1–T4 — kept as the diagnostic/evidence generator) and a pre-change characterization battery. Goal: cut per-line CPU cost of regex-mode scans (and ReDoS exposure on the inline path) **without changing any visible output field, hang guard, or skip-record contract**.

**Changes:**
- **New `src/utils/ripgrepEngine.ts` (~250 LOC)** — self-contained candidate-file filter: lazy dynamic `import('ripgrep')` (pithings/ripgrep-node 0.3.1, ESM-only WASM build of rg) on first use only — mirrors the FIX-HANG-5 lazy-load discipline, so a missing/broken dep **never breaks plugin boot**; exit-code mapping per the package's documented contract (`0 → ok+files` · `1 → no-matches` clean negative · `2 → fallback-required`, incl. Rust-dialect parse errors such as lookarounds/backreferences, detected at compile time in ~2–3 ms); flag mirroring of production walker semantics (`--no-ignore --no-require-git --hidden`; `-i` passed as a parameter because grep_files compiles every regex with 'i'; caller-supplied exclusion globs; `--max-depth=cap+1` depth-budget parity quirk, unit-asserted — cap 0 → no flag); **no** `--max-filesize` (exact-byte size skip records stay phase-2-only). Contract: the function **never throws** — every failure mode resolves to a typed fallback signal.
- **Wiring in `src/tools/fileSystemTools.ts` (regex-mode + directory target only)** — two-phase split: **phase 1** awaits the engine before scan start (its cost sits outside the 15 s `GREP_SCAN_DEADLINE_MS` window) and builds an allow-set of rg-named candidates; **phase 2** runs the EXISTING `processWithRegex` shaping unchanged on that set (line-split, >20k-char line gate, `.trim()`, truncation + '…', 1-based line numbers, include_context, result caps). Single-file targets and AST mode are byte-for-byte untouched paths; any phase-1 non-'ok' outcome leaves the candidate set null → **full-JS walk runs exactly as before**, every existing hang guard intact (15 s deadline, per-regex 500 ms abandon-and-continue, worker isolation + 2 s kill for ReDoS-suspect patterns, 30 s fallback timeout, wall-clock backstop).
- **Pre-approved behavior deltas** (documented decisions from the P0 checkpoint, not regressions): `-i` always applies in regex mode (existing production semantics, now explicit); rg `--hidden` mirrors the walker's dot-dir scanning whenever no include pattern is given; the >20k-char line gate and all caps/skip-record contracts are preserved verbatim.
- **Skip-record contract statement:** a file above `max_file_size` or over the `max_lines` cap is reported in `skipped_files` with byte/line counts identical to the pre-swap records — pinned by `grep_files_hang_backstop`, `grepFilesParity` and the golden baseline.
- **Tests:** new `tests/ripgrepEngine.test.ts` (incl. real-WASM integration, skipIf-guarded when the dep is absent) + characterization battery `tests/grepFilesParity.test.ts` against frozen golden baseline `tests/fixtures/grepFilesBaseline.json` generated BEFORE any src change; AST-mode smoke coverage closed in the same phase.

**Verification (user-run, G9):** four verification rounds — round-1 triage → fixes on disk → round 2: **two root causes found and minimally fixed**:
- **RC-C:** the round-1 generic jest `moduleNameMapper` rule (`^\.\/utils/(.*)\.js$`) matched ANY utils require and broke the @babel/* CJS packages (they ship `lib/` with `.js`-suffixed requires) → replaced by per-file exact mapper entries only.
- **RC-D:** rg runs with an absolute rootDir, so it reports matches by absolute path while the phase-2 gate compares targetDir-relative paths → candidate set never intersected (`matches: []`, `filesScanned: 0`); fixed by relativizing every candidate against `targetDir` before allow-set construction (paths outside the tree keep normalized absolute form and can never match — safe no-op).
Round 3: **sole failure 705/706 → RC-E** (round-trip triage): with the rg prefilter 'ok', `processFile` early-returned non-named files BEFORE both gates, so non-matching over-cap files were silently absent from `skipped_files`. Fixed in `fileSystemTools.ts` ONLY: stat + size gate first, then a branch for prefilter-active non-named files → Buffer read + newline-byte count (`lineCount = newlines + 1`, exact `split('\n')` semantics) → byte-identical line-cap skip record; named-candidate and fallback paths unchanged. Perf trade-off documented honestly: the probe restores pre-swap I/O for gate-passing non-matching files — the remaining ripgrep win is per-line `.test()` CPU + ReDoS exposure on the inline path (the spike's ~22× figure predates parity restoration on an uncontrolled tree, so docs state speed qualitatively).
Round 4: **ALL PASS** — typecheck 0 errors / full jest green / build success; parity re-run vs golden baseline = zero unexplained diffs (no one-time baseline special case triggered).

**Versioning:** released as **v1.9.13** — `package.json` + `manifest.json` bumped v1.9.12 → v1.9.13 on 02.09, revision advanced 23 → 24 so LM Studio detects the update (user-directed). Suggested commit: `feat(grep_files): ripgrep-backed regex engine with JS fallback`.

## [01.09.2026 ~18:30] — Tier-1 dead-code removal (~90 KB / 1739 LOC; user-GO-gated phases with before/after parity checks)

**Context:** full dead-code audit of all 140 TS files in `src/` + `tests/` (AST unused-export detection cross-validated by import-graph reconstruction). Tier-1 = confirmed orphans with **zero referencers anywhere**. Removal executed stepwise per user constraint (≤5 destructive ops/phase, checkpoint after each phase; plan_1788278947185).

**Deleted — 13 files (~90.3 KB / ~1739 LOC):**
- **Orphans:** `src/utils/simulation.ts` (self-exec dev script), `src/toolsDocumentation.ts`, `src/tools/imageAnalysisTools.ts` (superseded by live `imageProcessingTools.ts`), `src/tools/backupUtils.ts`, `src/tools/toolProtocolWarnings.ts`
- **Registries:** `src/tools/executionRegistry.ts`, `src/tools/utilityRegistry.ts` (duplicate of live 3-arg `registerUtilityTools` in `utilityTools.ts`; no jest mapper targeted them)
- **Dead recodeTool rules:** `rules/{deadCodeDetection,asyncModernizer,typeInference,modulePathNormalization}.ts` — engine (`recodeEngine.ts`), types (`recodeTypes.ts`) and the LIVE rule `rules/unusedImports.ts` verified untouched in the same directory listings
- **Stale artifacts:** `src/toolsProvider.ts.bak`, `tests/executedToolTransparency.test.ts.bak`

**Behavior-neutral by construction:** tsup entry is `src/index.ts` only → none of these modules were ever in the shipped bundle. Zero config edits (`jest.config.cjs` re-read in full: live `./tools/utilityTools.js` mock mapper intact; no entry referenced a deleted path).

**Evidence-gate lesson (no blind deletion):** audit initially flagged `tests/grep_files.test.ts` as importing nonexistent `../src/utils/helper`. Full-file read proved the string exists **only inside test-fixture template literals** (`fs.writeFile` fixture content) — an import-graph false positive from matching file text, not real imports. Gate held: green baseline + clean imports ⇒ test **kept**.

**Verification (user-executed):** BEFORE — typecheck 0 errors / Jest all-green / build success; AFTER (all 13 deletions) — identical results (`npm run typecheck`, `npm run test:quiet`, `npm run build`). No suite added/removed/broken.

**Docs sync (same session):** current-state docs aligned with code — `ARCHITECTURE.md` module tree + recode-rule sections, `TOOLS_REFERENCE.md` rule table; historical entries in CHANGELOG/RELEASE_NOTES left intact as history.

**Versioning:** no bump — **v1.9.12 rev 23 stays current.** Folds into the pending user deploy (together with the `executedTool` transparency stamp from the entry below). Suggested commit: `chore: remove audited Tier-1 dead code (~90 KB)`.

## [01.09.2026 ~17:05] — `executedTool` transparency stamp in the toolsProvider wrapper (silent-substitution incident follow-up, option B)

**Context:** "silent tool substitution" incident (user's own LM Studio logs 2026-09-01, 16:18–16:23): with `grep_files` disabled, a chart ran instead; after disabling `generate_chart`, `run_python` ran — plus false success narration and stray PNGs. Attribution closed from log evidence: **model/generation-side tool substitution + transcript observability gap** — NOT an ai_toolbox routing defect (host remapping unproven; a 16:20 tool-card screenshot would be the only remaining way to fully exclude it). The wrapper already logged the true executed name (`[AutoTracker] [DELTA] … from <name>`), but that ground truth never reached the chat transcript.

**Change (`src/toolsProvider.ts`, `instrumentedImplementation`):** after the measurement/guard try-catch, plain-object results gain one additive field — `executedTool` = **the registered (minified) name of the implementation that actually executed**: `{ ...result, executedTool }`. Strictly additive:
- Plain objects (`Object.prototype`) gain exactly ONE key. No tool emits this key today (grep-verified across `src/` before introduction); if a collision ever appeared, the wrapper value is authoritative (spread order).
- Strings, numbers, booleans, arrays, null, undefined and non-plain objects (class instances, Buffer, Date) pass through **byte-identical** — nothing can attach to them; their shape never changes. `src/tools/` contains no class definitions, so every real payload is covered by the plain-object branch or an unchanged passthrough.
- Zero routing/behavior change: same implementation executes; timing, side effects and error propagation untouched. FIX #20 A1 bookkeeping (`TokenStatsManager.recordToolResult`) still fires exactly once per successful call — with the ORIGINAL (unstamped) payload and the SAME ground-truth name the stamp now carries.

**Tests:** new suite `tests/executedToolTransparency.test.ts` (8 tests) runs the REAL pipeline (registration → `minifyTools` → instrumentation wrapper) with six side-effect-free probe tools injected through one registry module — mocked at the moduleNameMapper'd stub path (`../__mocks__/markdownPreviewTools.js`) so it intercepts the provider's actual dependency graph. Coverage: stamp === registered name; per-tool identity across probes in a single run; additive-only key contract (original fields verbatim, exactly one key added); byte-identical passthrough for string/number/array/null; FIX #20 A1 regression guard (`recordToolResult` once per success, zero on failure — pre-existing semantics preserved); error propagation unchanged; godMode sweep (unique non-empty names + wrapper contract across every exposed tool).

**Verification status:**
- ✅ Guard logic verified offline (plain-Node mirror of the exact expression): 14/14 edge cases pass (object / `{}` / array / string / number / boolean / null / undefined / class instance / Buffer / Date / source non-mutation / collision precedence / `unknown_tool` fallback).
- ⏳ User-side: `npx jest tests/executedToolTransparency.test.ts`, then full baseline `npm test` — expect 657 existing + 8 new green. Sandbox cannot execute (child_process blocked by policy).

**Deployment:** the live install runs from **source** (`src/`) → sync `src/toolsProvider.ts` into the LM Studio install folder and fully restart LM Studio. No rebuild/reinstall required (bundles carry no version strings).

**Versioning:** **no bump — v1.9.12 rev 23 stays current.** Candidate for a future release decision (v1.9.13 or fold-in); manifest untouched in this session.

## [v1.9.12] — 31.08.2026: New `pattern_scan` tool + puppeteer `connected` property-read fix + dead-file removal

**Changes:**
- **New `pattern_scan` tool (`src/tools/fileSystemTools.ts`; clean-room engine in new module `src/tools/patternScan.ts`) — recursive content search returning matching lines as `{file, line, content}`.** Diff vs `grep_files`: unsafe/syntactically-invalid regexes fail fast and are auto-demoted to literal mode (reported via `demotedToLiteral`); fully async with bounded concurrency (`concurrency` 1–16, default 4). Hard caps: per-file size gate **256 KB** + line-cap gate **10,000 lines** (oversize/over-line files reported in `skipped[]`, never scanned), `maxMatchesPerFile` default **50**, global cap **200** (`stats.truncated=true` when hit); `matchLineLength` truncation default 300 chars; `root` accepts a directory **or single file**, relative roots resolve against the plugin working directory. Jest mock `tests/__mocks__/patternScan.ts` + mapper entry in `jest.config.cjs`; full suite green post-wiring (**657/657 tests, 38 suites** — user-verified); live probe: visible in running-plugin tool list, stress-probed against the 12.7 MB / 296k-line dist bundle (user-declared SUCCESS).
- **Puppeteer `connected` property-read fix (`src/tools/browserAutomationTools.ts` + `src/types.d.ts`)** — puppeteer 24 exposes `Browser.connected` at runtime as a **getter property, not a method** (installed 24.43.1); the local module augmentation now declares it `readonly connected: boolean` and session-liveness checks read it as a property. Live probe passed same window (`browser_open_page` → screenshot save, PNG magic-verified).
- **Dead file removed** — orphaned root-level `src/browserAutomationTools.ts` (zero imports) deleted behind verified backup `ai_toolbox-pre-deadfile-delete-20260831.zip` in `.ai_toolbox_backups/`; typecheck + full jest green post-deletion (user-confirmed). Housekeeping: seven stale `.bak` files project-wide deleted and re-verified zero.
- **Docs sync (same session):** ARCHITECTURE / TOOLS_REFERENCE / DOCUMENTATION aligned with current code — `pattern_scan` entries added, File System count 22→23, unique-tool totals 130→131, Git & GitHub table count corrected to the code's 15; dead-file tree reference removed; `screenshot_desktop` write lines re-attributed from `browserAutomationTools.ts` to `imageProcessingTools.ts` (platform-native subprocess writes the file directly — no Node-side write; its only atomic-write path is attachment temp-file materialization via `resolveAttachmentFile`).

**Versioning:** released as **v1.9.12** — `package.json` + `manifest.json` bumped v1.9.11 → v1.9.12 on 31.08 (user-directed); manifest `revision` advanced 22 → 23 so LM Studio detects the update.

## [30.08.2026 ~17:45] — `grep_files` completion telemetry (live-verified same day; closed counter audit + exonerated plugin in LM Studio freeze incident)

**Change (`src/tools/fileSystemTools.ts`):** two per-call wall-clock lines added to the grep scan, both via `console.warn` → stderr — the ONLY channel LM Studio persists to `%APPDATA%\LM Studio\logs\main.log` (stdout is dropped), accepted cost: one `[error]`-tagged line per grep call.

- Normal completion (~L2782): `[grep_files] completed in <N>ms — <filesScanned> file(s) scanned, <matches> match(es), <skipped> skipped` (appends `[ABORTED — partial results]` when the internal controller is set).
- Abort catch path (~L2751): `[grep_files] aborted in <N>ms (host/timeout) … [partial results]`.

**Why:** log forensics should be able to separate *scan time* from *model-generation time* per call — the "60 s+ grep waits" class of reports. Telemetry proved the engine fast (2–17 ms observed in production on 30.08) and localized perceived wait to LLM generation around sub-tenth-of-a-second tool calls + LM Studio host-side cancel behavior.

**Verification (same day, post-rebuild/reload):** five consecutive production lines matched their JSON results exactly — `4ms/8 files/20 matches` · `2ms/0 scanned-1 skipped` (correct: size-skipped file never reaches the search gate) · `3ms/1/14` · `17ms/77/0/2 skipped` · `5ms/1/16`. Full counter audit closed: `filesScanned++` only after the size gate (~L2391) and line-cap gate (~L2452); skip-push sites L2376 (size) / L2444 (line cap) / L2469 (worker kill).

**Incident context (same evening):** an LM Studio 0.4.23 app freeze at ~17:49 (prediction-loop stall on tool dispatch; `Canceling predictions timed out` unhandled rejection + engine SIGTERM; recurring 08-26→08-30) was root-caused as **host-side** — the orphaned call left zero trace in the plugin, and every call that reached the plugin logged correctly. Upstream issue draft: `LM_STUDIO_ISSUE_2026-08-30_prediction_loop_stall.md`.

## [29.08.2026] — FIX-HANG-5: worker-isolated regex evaluation for ReDoS-prone patterns (+ 5b triage anchor fix, + 5c Node-worker API fix; offline-verified)

**Problem (residual hang class after FIX-HANG-1..4):** a single catastrophic-backtracking `RegExp.test()` on the main thread blocks the event loop and starves EVERY timer — including the 15 s scan deadline, the 30 s fallback AND the 20 s wall-clock backstop. No cooperative gate can preempt synchronous JS; only another thread can.

**Fixes (`src/tools/fileSystemTools.ts`):**
- **New `patternNeedsWorkerIsolation()` triage gate:** STRICTER than `isSafeRegex` (which misses brace-bounded nested quantifiers, backreferences, deeply nested groups). Anything the gate cannot PROVE cheap is evaluated for that whole file inside a `node:worker_threads` Worker (single round-trip; hard-killed via `worker.terminate()` after `WORKER_KILL_MS = 2000 ms`). Safe patterns keep the inline fast path → zero overhead on the common case. Kill/failure ⇒ file recorded in `skipped_files`, scan continues.
- **FIX-HANG-5b:** unanchored prefix test for brace quantifiers — the old `$`-anchored check let `((a+){3}){4}x` defeat triage (T1b double-freeze root cause). Any valid `{n[,m]}` on an unbounded `+/*` group body now routes to the worker at any position.
- **FIX-HANG-5c:** worker source corrected from browser-Web-Worker API (`self.onmessage`) to Node contract (`parentPort` direct payload) — the old shape threw `self is not defined` at boot, so every risky pattern "crashed" and was misreported as a 2000 ms kill (zero regex work). Verified offline in this runtime: safe pattern returns exact indices; T1b-exact catastrophic payload hard-killed at 2000 ms.

**Evidence:** probe artifacts + results archived to `docs/history/GATE_PROBE_EVIDENCE_fixhang5c.md` and `docs/history/FIXHANG5_REDOS_RESULTS.md` (code comments reference the new locations; **both files removed from disk 08.09** — recover from git history, e.g. `git show d319c92~1:docs/history/FIXHANG5_REDOS_RESULTS.md`).

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
