# Release Notes  ai_toolbox

Current: **v1.9.24** (16.11.2026) ý 117 tools ý MIT ý Node 20+
Full history: [`CHANGELOG_v5.md`](CHANGELOG_v5.md) (active) ý `docs/history/` (v1v4)

| Version | Date | What shipped |
|---|---|---|
| **v1.9.24** | 06.11.2026 | Budget-Guard context-limit protection: M1 pre-read advisory, M2 spill cap (92 %), M3 insurance auto-persist at 85 %. Master switch ON by default; OFF restores legacy behavior byte-identically. Settings rows localized in all 5 locales. |
| **v1.9.23** | 04.11.2026 | New read-only `memory_recall` tool (ID-first index/fetch over context entries, memory facts, sessions index). Docs line-ending + table repair sweep across all five READMEs. |
| **v1.9.22** | 01.11.2026 | Version-move release closing the CTX-EST A arc: shared-density estimator settled by live probe (band 1.3071.670 chars/token). Docs synced to canon 80/1193; updateChecker suite made baseline-independent. |
| **v1.9.21** | 21.10.2026 | Update-check arc: desktop toast ý in-chat announce mutually exclusive per version; `update-check.json` write churn removed; production check now reads the published hub `.VERSION` (marketplace deep link). +2 tools with locale parity in all 5 sets. |
| **v1.9.20** | 15.10.2026 | Version-move release folding the rev-3x pile since the last GitHub publish: session-memory arc A/B/C (TTL lifecycle, supersede-on-close-out, index dedupe), mid-loop compaction at 95 %, user-editable token density default 3.6. |
| **v1.9.19** |  | Unreleased label: no code shipped under this version (manifest-only, see v1.9.20). |
| **v1.9.18** | 14.15.09.2026 (publish pending) | Shared-file lost-write fix (`sharedFileLock`) ý EOL byte-exact round-trip for `replace_text_in_file` on mixed/CRLF files ý Tool Execution Pipeline outcome taxonomy + finalizeContent invariant ý ripgrep tool swap, unified project registry, worker-pool thrash fix. |
| **v1.9.17** | 14.09.2026 (rev 29) | Persistent tool gating profiles ý `pattern_scan` phase-1 prefilter ý `ripgrep` promoted to runtime dependency (fixes silent fast-path loss on Hub installs). |
| **v1.9.16** |  | `web_search`: dead/empty engine no longer stops the fallback chain. |
| **v1.9.15** |  | `get_memory` parse guard: keyless auto-context records no longer abort reads (hotfix). |
| **v1.9.14** |  | ripgrep-backed regex engine for `grep_files` (in-process WASM, transparent fallback) ý `executedTool` ground-truth stamp on all results ý ~90 KB dead code removed. |
| **v1.9.13** |  | New recursive content search `pattern_scan` (hard caps 256 KB / 10k lines; unsafe regex auto-demotes) ý puppeteer fix ý full MD docs sync. |
| **v1.9.12** |  | OOM-hardening: bounded web/RAG reads, terminating chunking loops, `rag_web_content` dedup. |
| **v1.9.1011** |  | Deadline-capped searches (partial results + `aborted` flag) ý token thresholds fire inside long tool chains ý live token delta log. |
| **v1.9.89** |  | Explicit project registration only ý hang prevention (`max_depth`, line caps) ý crash-resilient atomic writes everywhere. |
| **v1.9.56** |  | Confidence-tagged results (EXTRACTED / INFERRED / AMBIGUOUS) ý hub-exclusion clustering ý cluster-aware tool priority ý `shell:true` deprecation removed. |
| **v1.8.x** |  | 3-layer line-edit guardrails ý SDK v1.x token-counting accuracy (<0.3 % vs sidebar) ý declarative registry refactor (~80 lines if/else ý 20-entry registry). |
