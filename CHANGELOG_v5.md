# Changelog — ai_toolbox v1.9.21

> Supersedes `CHANGELOG_v4.md`. Active changelog for version 1.9.21.

## [21.10.2026 ~19:4x–19:5x] — RECURSIVE `.bak` SCAN: `cleanup_backups` + `list_available_bak_backups` walk the full working-dir tree (fix for missed nested backups) · canon 76/1109 → **77 suites / 1119 tests**

**Scope:** owner-order fix ("found that cleanup_backups only scans the root directory and missed nested backups"): both `.bak` scan sites used a single-level `fs.readdir(workingDir)` — nested edit backups (e.g. `src/config.ts.bak`) were invisible to listing AND deletion; live-observed the same session (edits under `src/tools/` left `.bak` baselines no sweep could ever see).

**Changes:**
- **New shared walker (`src/utils/bakScan.ts`):** `findBakFiles(rootDir)` — recursive, async, deterministic relPath sort; never descends into `node_modules`, `.git`, or plugin-state dirs (`.session_context` session-memory stores · `.ai_toolbox_backups` zip archives) so a confirm-true sweep cannot touch third-party or session state; `isFile()` gate → symlinks never followed (no cycles); case-insensitive `.bak` suffix match (Windows-FS precedent, cf. `backupTools.ts` zip matching); unreadable dir/file skipped non-fatally (legacy lenient contract preserved).
- **`cleanup_backups` (`src/tools/cleanupBackupsTool.ts`):** scan rewired onto the walker — output shapes byte-compatible for consumers (absolute paths · sizeBytes/sizeHuman/modifiedAt · dry-run/delete contract unchanged); description now documents recursive scope + exclusions.
- **`list_available_bak_backups` / `restore_from_bak` hint (`src/tools/restoreFromBak.ts`):** scan rewired onto the walker; `file`/`backupFile` are now working-dir-relative paths (root-level keeps the legacy bare-filename form — backward compatible, and matches the tool's own documented example which predated the implementation); dead `path` import removed.
- **Docs sync in the same pass:** all six README variants re-stamped to canon 77/1119 (test badge URL + alt · quote block · head-to-head row · `npm test` comment pin), GLOSSARY's two "currently" canon lines, TOOLS_REFERENCE's two tool rows + header stamp — dated historical entries untouched per house rule.

**Tests:** NEW suite `tests/bakScanRecursive.test.ts` (+1 suite / +10 tests): walker unit (nested discovery at 3 depths · excluded-dir decoys · dir-named-`.bak` edge · missing/empty root → [] · case-insensitive suffix) + `cleanup_backups` dry-run read-only / confirm deletes-root+nest with excluded-decoy survival + clean-dir envelopes + list-shape backward-compat + restore-hint surface. No existing pins touched — zero tests or src files asserted the old canon (audited pre-edit).

**Verification:** GATE TRIO GREEN 21.10: `npx tsc --noEmit` clean · ESLint clean (tests/ is ignore-patterned by house config) · full jest **77 suites / 1119 tests — agent run AND owner re-run ~19:51 both exactly 77/1119 in ~27 s** (prior canon 76/1109 zero drift + exactly the new suite).

**Canon:** 77 suites / **1119** tests (the arc-family entry's 76/1109 + exactly 10 = `tests/bakScanRecursive.test.ts`; delta fully explained, zero drift on both gate runs).

**Still owed (owner-gated):** commit set for this pass (`M` cleanupBackupsTool.ts + restoreFromBak.ts · `??` bakScan.ts + bakScanRecursive.test.ts · `.bak` baselines incl. the 6 READMEs + GLOSSARY + TOOLS_REFERENCE awaiting sweep) · publish-arc items from the arc-family entry UNCHANGED (dist rebuild + live run · hub pack-time preconditions · post-publish `/files/.VERSION` verify · repo-knob decision).

**Close-out (21.10 ~20:2x, owner order \"do all on the queue\"):** 9 `.bak` baselines swept, zero residue · commit set landed with the standard house split (code+tests · config one-liner · docs-only; hashes in `git log`) · THIRD independent owner gate observed same window: jest **77/1119** in ~28.6 s, exact-match again · close-out audit found ONE residual canon pin outside the docs pass scope — `package.json` description field (\"… 1109 passing tests across 76 suites …\") re-stamped to 77/1119 in this window (docs-only byte; gate trio N/A). Publish-arc items remain open, unchanged.

**Pack-time hardening (21.10 ~20:4x, owner queue order \"do all on the queue\"):** repo-root `.VERSION` dev knob blanked to whitespace — publish-safe default: `readTestLatestVersion()` early-returns ONLY when STRICTLY newer than LOCAL_VERSION, so an equal-valued bundled knob is harmless (falls through to the real hub check) but a leftover strictly-newer dummy would shadow real updates with dead GitHub-tag URLs → blanking removes that hazard class from pack-time entirely. GLOSSARY version-bump-rule entry corrected in the same pass (the old \"short-circuits\" clause described a strictly-newer dummy state, not an equal-valued knob; the codified bump rule is 3 files per `tests/updateChecker.test.ts` — `.VERSION` is dev-test seam only). **Superseded 21.10 ~20:57 (owner order):** repo `.VERSION` restored to `v1.9.21` on owner GO — artifacts ship the file EQUAL-valued (the hub-served copy IS this file as uploaded; a blank one is unparseable → every user's update check goes silent), and it is **never left empty**; only strictly-newer DUMMIES are forbidden inside an artifact. See GLOSSARY `version-bump rule` for the corrected publish clause.
## [19.–21.10.2026] — UPDATE-CHECK ARC FAMILY: SPEC A XOR announce channel selection + DEFECT #2 state-file write churn + HUB .VERSION source switch (owner-GO'd 19.10 ~23:3x) · version move v1.9.20 → **v1.9.21**; canon **76 suites / 1109 tests**

**Scope:** closes the owner-GO'd update-check arc pile that landed after ARC-RESTORE (canon gap 74/1064 → 76/1109 fully accounted below): (A) SPEC A XOR — in-chat announce honors channel selection; (B) DEFECT #2 — `update-check.json` rewritten on EVERY model step of an agentic turn; (C) HUB .VERSION ARC — production version source switched from GitHub `releases/latest` to the published LM Studio hub `.VERSION` file (`https://lmstudio.ai/crunch3r/ai-toolbox/files/.VERSION`) with marketplace deep link. The v1.9.20 → **v1.9.21** version move (package.json + manifest rev 0) landed in the same window and is recorded here because it was never logged on its own; the 17.–18.10 sessions are not individually itemized (lineage gap on record).

**Changes:**
- **Prelude (19.10, REPO-LINK A+B + `.VERSION` knob arcs):** dev-test seed simplified to ONE const per owner feedback ("simple file with a version number… you are overengineering"); RC#4 jest mapper fix landed; the compiled-in `updateCheckTestSeed.ts` const was replaced by a runtime-read local `.VERSION` knob per owner "full stop" order (a non-empty local file short-circuits the remote check — dev-machine override, path still intact); no-toast mystery root-caused to a stale dist bundle.
- **(A) SPEC A XOR (`src/updateChecker.ts`, `src/promptPreprocessor.ts`, `src/toolsProvider.ts`):** channel-aware `getPendingUpdateAnnouncement()` + call site passing the toggle — the plugin-panel "Desktop Notifications" setting picks EXACTLY ONE surface per session: ON → desktop toast (and `markToastDispatched` latches the chat layer quiet for that version); OFF → NO notify hop and NO latches written, so the once-per-process in-chat UPDATE-ANNOUNCE line may fire even for a previously-toasted version. Gate is explicit-OFF semantics (`!== false` / strict per house convention): undefined/partial harness configs keep ON behavior — never both channels.
- **(B) DEFECT #2 (`src/updateChecker.ts`):** the channel feed rewrote `<dataDir>/update-check.json` on every model step of an agentic turn (the host re-invokes the provider per step — same fact class as NOTIF-DEDUPE's per-step notify churn); the fix removes that per-step write so the state file is only touched when its content actually changes. TTL / dedupe / latch semantics untouched.
- **(C) HUB .VERSION ARC (`src/updateChecker.ts` + 4 test files):** new `PUBLISHED_VERSION_URL` = published hub `.VERSION` file + `HUB_ARTIFACT_PAGE` deep link (notifications' and state's `url` now point at the marketplace page). Live pre-conditions verified 19.10: `/files/package.json` on the hub serves a ~400 KB Next.js HTML page with the JSON embedded in the SSR flight payload; a clean JSON API exists (`/api/v1/artifacts/crunch3r/ai-toolbox`, rev 86 = v1.9.20); the GitHub repo is anonymous-404 with no public releases — hence the switch away from `releases/latest`. `parsePublishedVersionBody()` handles shape-1 raw body (STRICT `v?x.y.z`, trim-only — quoted/malformed → null, NO quote tolerance: behavioral verification showed quote-normalization would persist corrupted version strings into state) and shape-2 HTML page (distinct v-prefixed candidate wins over single distinct bare; CF beacon `2024.11.0` + schema.org revision noise excluded). Fetch reads `res.text()` (text() contract propagated to the file-level fetch mocks in 3 sibling suites); warn messages reworded to hub phrasing.
- **Version move v1.9.20 → v1.9.21:** `package.json` + `manifest.json` (`revision: 0`, version-move precedent), `LOCAL_VERSION = 'v1.9.21'` in `src/updateChecker.ts`, and repo `.VERSION` = `v1.9.21` (7 bytes, v-prefixed x.y.z no trailing newline — house format chosen because shape-2 extraction prefers the distinct v-prefixed candidate over bare).

**Tests:** +45 total across the arc window: XOR cases (+3 in `tests/updateChecker.test.ts`, superseding pin) · DEFECT #2 churn regression (to 76/**1107**) · HUB ARC shape-1/shape-2 extraction incl. noise exclusion, HTML-with-no-version → null, and malformed-body strictness (to 76/**1109**; the +2 delta is exactly the two new shape tests) plus file-level fetch-mock re-points to the `text()` contract in `tests/{toolsProvider,updateReminderTools,executedToolTransparency}.test.ts`. Intermediate suites for the REPO-LINK/knob work landed with their own gates (19.10 ~22:5x gate GREEN at 76/1107).

**Verification:** OWNER GATE GREEN 21.10 ~17:1x: `npx tsc --noEmit` clean + jest **76 suites / 1109 tests all passed in ~27 s**, zero drift (prediction 76/1109 = prior canon 1107 + exactly the two shape tests — matched). Agent-side pre-gate: 8/8 behavioral cases verbatim incl. a quote-corruption edge caught and fixed during verification (shape-1 strictness); TS transpile clean on all touched files.

**Canon:** 76 suites / **1109** tests (ARC-RESTORE's 74/1064 + 2 update-check suites + 45 tests, all deltas itemized; zero drift).

**Still owed (owner-gated):** live one-shot verification that the REAL published `/files/.VERSION` page extracts correctly after publish (worst case = console.warn + quiet skip, never throws) · PUBLISH PRECONDITION — the published artifact must NOT ship a non-empty `.VERSION` inside the plugin dir or every install self-shadows and the check is forever silent · decide whether to blank the repo `.VERSION` afterwards (non-empty knob currently short-circuits the remote check on this machine) · dist rebuild + LM Studio reload · commit set incl. the 21.10 `.bak` sweep (13 files, zero residue) · docs sync v1.9.21 (badges/counts/stamps) lands with this entry.

**Close-out (23.10 ~18:4x, owner GO):** all window-closing items landed 21.10 — commits + push (main `d420912`) · tag `v1.9.21` @ `fc33a5c` (+ GitHub Release w/ host-hash-verified tests.7z asset) · dist rebuild + hub publish → **artifact rev 88 = v1.9.21** (API `updatedAt` 2026-10-21T19:13:43Z, local 21:13; was rev 86 = v1.9.20) · **live one-shot verification CLOSED**: anonymous live fetch of the real `/files/.VERSION` page (HTTP 200, ~345 KB Next.js HTML) parsed in-Node with the verbatim production `parsePublishedVersionBody()` → `{via: shape-2-vprefixed, version: "1.9.21"}` — exactly one distinct v-prefixed candidate = house format working as designed; self-shadow hazard class confirmed absent (published `.VERSION` is EQUAL-valued to LOCAL_VERSION per the corrected 20.57 rule → matching installs fall through to the normal quiet state, older installs get the correct update notice). Items superseded/decided in-window: publish-precondition restated (artifacts ship a non-empty equal-valued v-prefixed `.VERSION`, never blank — only strictly-newer dummies are forbidden) and repo-knob decision = `v1.9.21` retained; both recorded in the top entry's "Pack-time hardening" paragraph. Doc-sync items landed with their own dated entries below.

---

## [16.10.2026 ~19:1x–20:3x] — ARC-RESTORE: one-shot `verification_checkpoint` lifecycle + restore-side hardening (F3) + reader-alarm / checkpoint-write house rules (F1/F2); canon 74 suites / **1064** tests

**Scope:** close of the owner-GO'd "do all the fixes and optimizations" arc. F1 = reader-alarm discipline, F2 = checkpoint write protocol (invariant + precondition + expiry + closure-on-read; under it, the stale C1 count-checkpoint was evaluated and closed as benign per protocol and `sessions.json` re-anchored at total_count=28), F3 = code: tag-driven one-shot lifecycle for `verification_checkpoint` entries plus restore-side renderer hardening.

**Changes:**
- **F3 checkpoint lifecycle (`src/tools/contextManagementTools.ts`):** new export `VERIFICATION_CHECKPOINT_TAG='verification_checkpoint'`; `mergeEntriesWithTiers` defaults no-scope, checkpoint-tagged entries to scope:'session' (SESSION_TTL_MS 24 h) with inline reap in `addEntry`; explicit writer scope respected, no silent override.
- **F3 restore-side hardening (`src/tools/restoreSessionContextTool.ts`):** per-entry age labels (`· age Nd` / fresh); `TOP_N_SUBSTANTIVE=10` cap on substantives plus a pointer line for older entries; additive JSON field `context_stale_fraction` (fraction of entries >3 d) replaces newest-only boolean math while preserving the boolean contract and the "context=true" text pin, header now renders e.g. `context=false · 0% of entries >3d`; live verification_checkpoint entries get a one-shot staleness warning; tool description updated.
- **F1/F2:** persisted as house rules (memory entries) - no code.

**Tests:** +6 inside existing suites (74/1058 -> 74/1064): `tests/contextLifecycleFixA.test.ts` F3.1-F3.3 (default scope + exact-24 h TTL on disk; explicit scope respected with no TTL attached; expired checkpoint reaped inline, fresh survives) and `tests/restoreSessionContext.test.ts` F3.R1-R3 (fraction staleness + age label, top-N cap + pointer, one-shot labeling); hermetic temp-store rewrites with byte-restore in finally.

**Verification:** OWNER GATE GREEN 16.10 ~20:3x: `npx tsc --noEmit` clean, lint 0 problems, jest **74 suites / 1064 tests all passed in ~21 s**. Round 1 of the gate loop closed one production TDZ defect (staleFractionPct used before declaration; fixed by hoisting above headerLines construction); residual round-2 items were test-side only (fixture shapes re-stamped to post-fix disk shape, age-label pin corrected 'age 0d' -> 'age fresh') - zero product-behavior gaps remained after the TDZ fix.

**Canon:** 74 suites / **1064** tests (prev entry's 74/1058 + exactly 6 = the new F3/F3.R tests; both deltas explained, zero drift).

---

## [15.10.2026 ~19:2x–20:0x] — Arc C log-channel fix + agentic density made user-editable (default 3.4 → 3.6) + changelog rotation to history

**Scope:** source-side close of the owner request "make AGENTIC_CHARS_PER_TOKEN user editable" plus the follow-on default raise, a two-notice stderr→log reroute for Arc C operational lines, and the CHANGELOG_v4 rotation into `docs/history/` (v5 active). Yesterday's ARC-A/B/C session-memory work remains documented in the now-archived v4.

**Changes:**
- **Log channels (Arc C operational notices):** `contextGuard.ts` gate-skip notice + `promptPreprocessor.ts` PART B telemetry-fallback notice rerouted `console.warn → console.log` (text byte-identical — owner greps stay valid); sibling warns (unparsable / TIER-2 no usable model / persistence failed) deliberately left on stderr.
- **Density user-editable:** `tokenStatsManager.ts` — `AGENTIC_CHARS_PER_TOKEN` demoted to DEFAULT const, live module state + `setAgenticCharsPerToken()` (NaN/≤0 → safe no-op) / `getAgenticCharsPerToken()`; every estimation path reads the LIVE value via `estimateTokensFromChars()`. New config field `contextGuardAgenticDensity` (`config.ts`: zod 1–20, numeric UI step 0.1 under ContextGuard Settings) reseeded per turn by `promptPreprocessor.preprocess()` (compressionPercent precedent); stale `/3.2` TokenDebug label fixed.
- **DEFAULT RAISED 3.4 → 3.6** on owner instruction (~19:4x), ONE dated batch edit per provenance protocol: const + provenance entry, zod `.default()`, `DEFAULT_CONFIG`, menu hint, reseed comment. Documented trade-off: value sits ABOVE the live-measured ~3.2–3.4 band ⇒ estimates drop ~5% (est(204 chars): 60 → 57), tier gates / mid-loop guard fire slightly later — owner's accepted call; first lever to revisit on any 100%-fill stall.
- **Tests:** `tests/fix20_midloop_token_counting.test.ts` density-adaptive rewrite (+1 setter test) — expectations derived from `getAgenticCharsPerToken()` at runtime; structural pins EXACT (fire line floor(75%·limit)+8 = 7508, one-below no-fire, hysteresis max(4096, 5%), re-fire at floor, rollback-on-failed-save). Default raise required ZERO test edits (adaptive design verified live).
- **tsc TS2741:** `toolsProvider.ts` exhaustive `PluginConfig` literal gained `contextGuardAgenticDensity`; final missing-import fix in the fix20 suite.
- **Rotation + docs:** `CHANGELOG_v4.md` → `docs/history/` (archived v3-style banner; v3 superseded-link repaired), all six READMEs re-pointed to "CHANGELOG_v5 — active; v1–v4 in docs/history/" (localized), GLOSSARY agentic-density entry fixed (stale since 10.11: claimed `= 3.2`). `.gitignore` += `README.MD_LMS_HUB_SIMPLE.md` (owner-local). Quarantine dir from the 14.10 memory-wipe removed by owner.

**Canon:** 74 suites / **1058** tests (yesterday's ARC-C canon 74/1057 + exactly 1 = new setter test; both deltas explained, zero drift).

**Verification:** OWNER GATES GREEN twice (15.10 ~19:3x and ~19:52): `npx tsc --noEmit && npm run lint && npx jest` → 0/0 + **74/1058 in ~21 s**, incl. the density default raise with zero test edits. Pre-commit re-run at commit time (docs-only additions since — no code delta).

**Next owner-side steps:** dist rebuild + LM Studio reload → verify [TokenDebug] est drops ~5% for same content, Arc C skip lines at INFO not ERROR; Hub/GitHub publish decision. (CLOSED 16.10: README Release-Highlights rows v1.9.20/v1.9.19 landed in all five live README tables + the release summary below; rotation-missed stale changelog links repaired in the same pass — see entry appended under Previous entries.)

---

## [15.10.2026 ~18:54] — Version bump v1.9.19 → v1.9.20 + full MD doc sync

**Scope:** manifest / package version bump with revision reset, global MD doc sweep, and changelog rotation to v5.

**Changes:**
- `manifest.json`: `"version": "v1.9.19"` → `"v1.9.20"`, `"revision": 1` → `0` (version-move precedent)
- `package.json`: `"version": "v1.9.19"` → `"v1.9.20"`
- Global MD sweep: replaced all occurrences of `v1.9.19` with `v1.9.20` in:
  - README.md, README.de.md, README.es.md, README.zh-CN.md, README.zh-TW.md, README.MD_LMS_HUB_SIMPLE.md
  - ARCHITECTURE.md, DOCUMENTATION.md, TOOLS_REFERENCE.md, CHANGELOG_v4.md
- `TOOLS_REFERENCE.md` header stamp updated to `version stamp v1.9.20 / manifest rev 0 (version bump 15.10)`
- `.bak` baselines created for modified files per house rule

**Versioning:** Current release v1.9.20 (`package.json` + `manifest.json`; revision 0). Previous state v1.9.19 rev 1 was unstuck on 15.10 ~18:4x; this bump folds the accumulated pile into v1.9.20.

**Canon unchanged:** 74 suites / 1057 tests (docs/manifest-only entry, no gate trio required)

**Next owner-side steps:** dist rebuild + LM Studio reload; Hub/GitHub publish decision.

---

## Previous entries

Full history up to v1.9.19: [`docs/history/CHANGELOG_v4.md`](docs/history/CHANGELOG_v4.md) (archived 15.10 rotation; older volumes in `docs/history/`).

### [21.10.2026 ~17:5x] — README v1.9.21 doc-sync completion: Release-Highlights `v1.9.21` row added to all five live READMEs + owner-local hub-simple · stale tool-count (113→115) and test-canon (74/1064 → 76/1109) surfaces reconciled

**Scope:** docs-only — zero code/tests touched, gate trio not applicable by construction. Closes the carried item "Release Highlights table missing v1.9.21 row": f108f35's doc-sync was scoped to 'README x6 badges+counts' only (no highlights-row step existed in the arc plan), and the consolidated arc entry has no per-version section to mirror — the table therefore lagged by design until this pass.

**Changes:**
- **All five live READMEs** (`README.md`, `.de`, `.es`, `.zh-CN`, `.zh-TW`) + owner-local `README.MD_LMS_HUB_SIMPLE.md` (on disk, git-excluded): new top-of-table row `v1.9.21` (arc-family digest: SPEC A XOR toast↔chat mutual exclusion · DEFECT #2 per-step write churn · HUB .VERSION source switch with marketplace deep link · +2 tools / locale parity in all 5 sets · version move rev 0 · canon **76 suites / 1109 tests**, owner gate GREEN twice on 21.10, zero drift), each localized to match that file's existing row style; `.bak` baseline per edit (house rule).
- **Stale current-state surfaces reconciled in the same pass** (f108f35 had re-stamped version badge + quote block only): tool count 113 → 115 and test canon 74 suites / 1064 → 76 suites / 1109 across badges, TOC anchors + arsenal headings, the confidence-tag WHY-row, head-to-head row, quick-start step, `npm test` comment pin (dated history tail preserved), and closing footer lines — in all six files.
- v1.9.20/v1.9.19 rows and dated gate history untouched per house rule (historical).

**Verification:** pattern-scan audit — zero residual `113` hits across the six READMEs · `| **v1.9.21** |` present in all six tables, each immediately above its v1.9.20 row · badge URLs byte-verified intact (`tools-115%20ready--made`, `tests-76%20suites…1109`) · zero NBSP/ZWSP introduced · EOL style preserved (CRLF ×5 / LF hub-simple, no lone-LF lines). Gate trio: NOT applicable — zero src/tests bytes changed.

### [16.10.2026 ~17:5x] — README Release-Highlights close-out (pending #2): v1.9.20 + v1.9.19 rows added to all six locales · release summary pinned here · rotation-missed stale changelog links repaired

**Scope:** docs-only — zero code/tests touched, gate trio not applicable by construction. Closes the carried item "README Release-Highlights table still missing v1.9.20/v1.9.19 rows (+ localized mirrors)".

**Release summary (source for the README table rows):** **v1.9.20** — version-move release (`manifest.json` `version` → v1.9.20 on 15.10 ~18:54, revision reset to 0; current state per manifest/package) folding the ENTIRE rev-3x pile since the last GitHub publish (rev 30, 15.09): FIX-35c + WALK-ABORT (28.09 — archived in `docs/history/CHANGELOG_v3.md`), CONTAMINATION-FIX + jest flag independence (01.10), CTX-FOOTER family (02.–04.10: footer → object surface → fail-loud warn → publish hardening), 05.10 arcs (SM-VERIFY · THRESHOLD-MARKER · PLAN-REMOVAL), 06.10 arcs (PLAN-SEAM · A3 close-out · F1 wording · i18n-CONFIRM + the rev-lock lift to v1.9.20 rev 0 itself), the unlogged Arc-C sweep of 07.10 (+3 suites / +35 tests — lineage gap on record in the ARC-B digest), LEVER-1 (08.10, wire −1,326 chars / −3.55%), FIX #21 two-tier mid-loop forced save (09.10), TWO-TIER close-out Fix A user-visible threshold notice + Fix B pre-emptive 95% compression (10.10 — shipped live ~13:1x), TOKEN-DIVERGENCE measured estimator `AGENTIC_CHARS_PER_TOKEN` = 3.2 (10.11) and SESSION-MEMORY ARCS A/B/C full 3-defect remediation closed owner-GREEN (14.–15.10; C1 dedupe verified live on disk + in the owner log); canon **74 suites / 1058 tests** since this file's top entry (density-adaptive test rewrite, zero test edits for the 3.4 → 3.6 default raise). **v1.9.19** — UNRELEASED LABEL: package.json moved v1.9.18 → v1.9.20 directly on 06.10 (rev-lock lift), so no code shipped under v1.9.19; the manifest's `version` field carried it until the 15.10 version move, and its rev-0 unstick flip (owner order 15.10 ~18:4x — recorded in `docs/history/CHANGELOG_v4.md`) made the pile detectable for the Hub publish. The README rows state exactly this (no invented v1.9.19 feature list).

**Changes:**
- **All five live READMEs** (`README.md`, `.de`, `.es`, `.zh-CN`, `.zh-TW`; the owner-local `README.MD_LMS_HUB_SIMPLE.md` was removed from disk 15.10 and is git-excluded — out of scope): two new rows inserted at the TOP of the Release-Highlights table (`v1.9.20` release-move digest + `v1.9.19` unreleased-label row), each localized to match that file's existing style; `.bak` baseline per edit (house rule).
- **Rotation-missed stale links repaired in the same pass** (the 15.10 rotation re-pointed only the section headers — audit found these leftovers): (a) broken Docs-row href `<a href="CHANGELOG_v4.md">Changelog</a>` → `CHANGELOG_v5.md` in all six READMEs (target file no longer exists at root); (b) stale TOC entry "…CHANGELOG_v4.md (active/aktiv/activo/活跃), v1–v3…" re-pointed to CHANGELOG_v5 + v1–v4 in de/es/zh-CN/zh-TW, and README.md's broken in-page anchor (`#release-highlights-full-history--changelog_v4md--…`) shortened to `#release-highlights` (resolves against the current header).
- **This file:** top entry's "Next owner-side steps" gains a dated CLOSED note for the doc item only (dist-reload/publish items remain open, unverified details not claimed); this release summary appended under Previous entries.

**Verification:** pattern-scan audit — `| **v1.9.20** |` present in all six READMEs · zero remaining `href="CHANGELOG_v4.md"` or "v1–v3" TOC wording in live docs (residual hits confined to dated historical entries in `docs/history/*`, untouched per house rule) · EOL/BOM re-check post-edit on each touched file. Gate trio: NOT applicable — zero src/tests bytes changed.
