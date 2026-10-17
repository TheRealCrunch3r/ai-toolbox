# Changelog — ai_toolbox v1.9.20

> Supersedes `CHANGELOG_v4.md`. Active changelog for version 1.9.20.

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

### [16.10.2026 ~17:5x] — README Release-Highlights close-out (pending #2): v1.9.20 + v1.9.19 rows added to all six locales · release summary pinned here · rotation-missed stale changelog links repaired

**Scope:** docs-only — zero code/tests touched, gate trio not applicable by construction. Closes the carried item "README Release-Highlights table still missing v1.9.20/v1.9.19 rows (+ localized mirrors)".

**Release summary (source for the README table rows):** **v1.9.20** — version-move release (`manifest.json` `version` → v1.9.20 on 15.10 ~18:54, revision reset to 0; current state per manifest/package) folding the ENTIRE rev-3x pile since the last GitHub publish (rev 30, 15.09): FIX-35c + WALK-ABORT (28.09 — archived in `docs/history/CHANGELOG_v3.md`), CONTAMINATION-FIX + jest flag independence (01.10), CTX-FOOTER family (02.–04.10: footer → object surface → fail-loud warn → publish hardening), 05.10 arcs (SM-VERIFY · THRESHOLD-MARKER · PLAN-REMOVAL), 06.10 arcs (PLAN-SEAM · A3 close-out · F1 wording · i18n-CONFIRM + the rev-lock lift to v1.9.20 rev 0 itself), the unlogged Arc-C sweep of 07.10 (+3 suites / +35 tests — lineage gap on record in the ARC-B digest), LEVER-1 (08.10, wire −1,326 chars / −3.55%), FIX #21 two-tier mid-loop forced save (09.10), TWO-TIER close-out Fix A user-visible threshold notice + Fix B pre-emptive 95% compression (10.10 — shipped live ~13:1x), TOKEN-DIVERGENCE measured estimator `AGENTIC_CHARS_PER_TOKEN` = 3.2 (10.11) and SESSION-MEMORY ARCS A/B/C full 3-defect remediation closed owner-GREEN (14.–15.10; C1 dedupe verified live on disk + in the owner log); canon **74 suites / 1058 tests** since this file's top entry (density-adaptive test rewrite, zero test edits for the 3.4 → 3.6 default raise). **v1.9.19** — UNRELEASED LABEL: package.json moved v1.9.18 → v1.9.20 directly on 06.10 (rev-lock lift), so no code shipped under v1.9.19; the manifest's `version` field carried it until the 15.10 version move, and its rev-0 unstick flip (owner order 15.10 ~18:4x — recorded in `docs/history/CHANGELOG_v4.md`) made the pile detectable for the Hub publish. The README rows state exactly this (no invented v1.9.19 feature list).

**Changes:**
- **All five live READMEs** (`README.md`, `.de`, `.es`, `.zh-CN`, `.zh-TW`; the owner-local `README.MD_LMS_HUB_SIMPLE.md` was removed from disk 15.10 and is git-excluded — out of scope): two new rows inserted at the TOP of the Release-Highlights table (`v1.9.20` release-move digest + `v1.9.19` unreleased-label row), each localized to match that file's existing style; `.bak` baseline per edit (house rule).
- **Rotation-missed stale links repaired in the same pass** (the 15.10 rotation re-pointed only the section headers — audit found these leftovers): (a) broken Docs-row href `<a href="CHANGELOG_v4.md">Changelog</a>` → `CHANGELOG_v5.md` in all six READMEs (target file no longer exists at root); (b) stale TOC entry "…CHANGELOG_v4.md (active/aktiv/activo/活跃), v1–v3…" re-pointed to CHANGELOG_v5 + v1–v4 in de/es/zh-CN/zh-TW, and README.md's broken in-page anchor (`#release-highlights-full-history--changelog_v4md--…`) shortened to `#release-highlights` (resolves against the current header).
- **This file:** top entry's "Next owner-side steps" gains a dated CLOSED note for the doc item only (dist-reload/publish items remain open, unverified details not claimed); this release summary appended under Previous entries.

**Verification:** pattern-scan audit — `| **v1.9.20** |` present in all six READMEs · zero remaining `href="CHANGELOG_v4.md"` or "v1–v3" TOC wording in live docs (residual hits confined to dated historical entries in `docs/history/*`, untouched per house rule) · EOL/BOM re-check post-edit on each touched file. Gate trio: NOT applicable — zero src/tests bytes changed.
