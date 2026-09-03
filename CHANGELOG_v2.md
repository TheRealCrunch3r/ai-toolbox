# Changelog — ai_toolbox (active)

> **This file supersedes `CHANGELOG.md`.** The old changelog is preserved as archived history only.
> New entries are added at the top of this file. Details below were compiled from verified session records and bundle-level verification (`dist/index.js` + `index.mjs` are unminified, so shipped content was confirmed byte-exact).

**Current release: v1.9.15** (`package.json` + `manifest.json`, revision 27; version bumped 02.09, rev re-bumped 03.09 for the Hub-dependency hotfix — see entry below): `pattern_scan` ripgrep phase-1 candidate prefilter (B', Option A port from grep_files v1.9.13+) with guaranteed full-JS fallback. **Previous release v1.9.14** (`package.json` + `manifest.json`, revision 25; bumped 02.09): `get_memory` local-file parse guard — mixed-shape memory file no longer aborts the PRIORITY-1 read (top entry). **Previous release v1.9.13** (revision 24, bumped 02.09): `grep_files` ripgrep-backed regex engine with JS fallback. **Previous release v1.9.12** (revision 23, bumped 31.08): `pattern_scan` tool + puppeteer `connected` fix + dead-file removal (entry below). **Previous release v1.9.11** (revision 22) — contained the consolidated maintenance work of the v1.9.10 window: duplicate-tool-removal + grep_files log-level hotfixes (24.08), the OOM-hardening suite (web-fetch guards, search-fallback & HTTP-client caps, heap watchdog), the rag_web_content fix suite, the chunking fixed-point OOM termination (25.08), the StateManager B1/B2/B3 data-loss fixes (28.08), and REV-24 bare-& false-positive fix for `grep_files` (hotfix deployed via direct src-sync + full restart 28.08; installed copy runs from `src/`). **Version bumped v1.9.10 → v1.9.11 on 28.08 (~20:45)** — user-directed release decision supersedes the "no bump" policy of 25.08.
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

**Evidence:** probe artifacts + results archived to `docs/history/GATE_PROBE_EVIDENCE_fixhang5c.md` and `docs/history/FIXHANG5_REDOS_RESULTS.md` (code comments reference the new locations).

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
