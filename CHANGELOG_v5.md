# Changelog — ai_toolbox v1.9.20

> Supersedes `CHANGELOG_v4.md`. Active changelog for version 1.9.20.

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

**Next owner-side steps:** dist rebuild + LM Studio reload → verify [TokenDebug] est drops ~5% for same content, Arc C skip lines at INFO not ERROR; Hub/GitHub publish decision; README Release-Highlights table still missing v1.9.20/v1.9.19 rows (+ localized mirrors).

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
