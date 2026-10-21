## Update-check arc family · recursive .bak scan · docs canon 77/1119

### 📡 Update checks, re-architected (HUB .VERSION source)

- Production update check now reads the **published LM Studio hub `.VERSION` file** instead of GitHub `releases/latest` — the marketplace page is the deep link in every notification. Install/update from here: https://lmstudio.ai/crunch3r/ai-toolbox
- **Exactly one update notice per session via ONE selected channel**: the plugin-panel "Desktop Notifications" toggle picks desktop-toast OR in-chat announcement (mutually exclusive, version-latched) — no double-pings, no silent hosts.
- Fixed state-file write churn: `update-check.json` is only touched when its content actually changes (no more per-model-step rewrites).

### 🧹 Recursive `.bak` scanning

- `cleanup_backups` + `list_available_bak_backups` now walk the full working-tree depth via a shared walker (`src/utils/bakScan.ts`) — nested baselines under `src/`, `tests/` etc. are no longer invisible; prunes `node_modules` / `.git` / plugin-state dirs by construction, symlink-safe, case-insensitive suffix match.

### 🧰 Tools & docs

- 2 new tools + full locale parity across all 5 locales → **115 distinct tools** (parity 115/115).
- Version move to v1.9.21 (`manifest.json` revision reset to 0 per version-move precedent) with complete docs re-stamp: badges, TOC, arsenal sections, changelog across six README variants.

### ✅ Verification

- Gate trio GREEN ×3 (owner + close-out audit): `tsc --noEmit` clean · ESLint 0 problems · jest **77 suites / 1119 tests** (~28 s).
- Run locally: `npm test` after `npm install`.

> Note per house convention: this tag marks the source milestone. Distribution & auto-updates run through the LM Studio hub artifact, not GitHub downloads.
