# 🧰 AI Toolbox — the all-in-one AI agent toolkit for LM Studio

**Give your LLM real hands.** It reads and edits files *safely*. Searches entire codebases without ever hanging. Runs long builds in the background while you keep chatting. Drives a headless browser, chats with Git & GitHub, OCRs screenshots, charts data from raw numbers — and **manages its own context** so marathon sessions never die.

**120+ ready-made tools — one plugin, zero glue code.**

> `v1.9.12` · `24 modules` · `MIT` · `Node 20+` · `600+ tests green`

---

## 🏆 Why this wins — Standout capabilities you won't find in other Hub plugins

*Compared against an Aug 2026 survey of ~115 LM Studio Hub plugins (~40 toolboxes, only 9 with real file tools).*
**Legend:** 🥇 unique across the entire field · ⭐ rare (≤ a handful) · 🛡️ standout safety engineering

| ✨ Capability | What it does for you | Field position |
|---|---|---|
| 🧠 **Self-managing context** (`AutoTracker` + `ContextGuard`) | Token thresholds fire *mid-tool-chain* (75% / 90%), auto-summarizes and compresses the conversation before overflow — long sessions keep working instead of dying. Project-keyword detection in the prompt pipeline. | ⭐ **No surveyed rival has any context/token management** — every other "memory" tool is bare save/list/search CRUD |
| 🌐 **Cross-project memory** (`switch_context`, project registry) | Recall what *another* registered project decided last week. Recency×frequency scoring, TTL pruning, confirm-first switching (Step 0.7). | ⭐ **Absent from every surveyed plugin** |
| 🏷️ **Confidence-tagged results + cluster-aware tool selection** (`confidenceTypes`, `toolPriority`) | Every auto-tracked fact is labeled EXTRACTED vs INFERRED vs AMBIGUOUS — so you can separate what the agent *knows* from what it's guessing; and when 120+ tools compete for a turn, cluster-aware priority keeps the right ones in reach under grammar limits. | 🥇 **No surveyed rival tags result confidence** — and none fits this many tools without dropping them at context limits |
| 🧬 **AST-based code refactoring** (`refactor_code`) | Rename / move-function / extract-function / dead-import cleanup — syntax-safe AST transforms with **auto-rollback on failure**, not regex text hacking. | 🥇 **The only AST-based refactoring across ~115 surveyed plugins** |
| 🔍 **Search that cannot hang** (`grep_files`, `find_replace_all`) | ReDoS-safe, deadline-capped search returning partial results + an explicit `aborted` flag; dry-run multi-file replace. | 🛡️ Rivals ship unbounded grep loops — this one physically can't spin forever |
| 💾 **Safe file editing** (`replace_text_in_file`, `line_operations`) | `.bak` backup on every edit, pattern-anchored inserts, line-fingerprint verification, MD5 post-write integrity check. Restore any file in one call (`restore_from_bak`). | 🛡️ **3-layer guardrails** against stale-line-number corruption — rivals offer at best rename-backup shims |
| ⏸️ **Non-blocking background commands** (`run_background_command` + monitor/cancel) | Kick off long builds & jobs, keep chatting, check status anytime, cancel when needed. No Docker. | ⭐ Nearest rivals **require Docker**; this runs natively in the plugin host |
| 🌍 **Real browser automation** (Puppeteer suite) | Headless browsing with persistent sessions and UI interaction — not a one-shot "fetch page" call. | Rival "visit-website" plugins are ⚠️ *static scrapers only* |
| 📊 **Local semantic RAG, any format** (`rag_index_pdf/docx/xlsx`, `rag_query_vector`, `rag_web_content`) | Index PDFs, Word docs and spreadsheets for vector search — plus query-relevant web extraction. One box replaces rivals' 2–4 separate plugins. | 🛡️ Bounded chunking: **no OOM on poison-length documents** (verified vs a 1690-page PDF) |
| 🧪 **Run your test suite for you** (`run_tests`) | Auto-detects Jest / Mocha / Vitest from `package.json` and executes it, returns results. | ⭐ No other toolbox in the field does this |
| 🔐 **Secret scanning before shipping** (`secret_scan`) | Scans files for leaked API keys, passwords & tokens. | ⭐ Not found in **any surveyed competitor** |
| 📈 **Data visualization as a tool call** (`generate_chart`) | Bar / line / pie / doughnut / scatter / radar → image file, with HTML fallback when the renderer is unavailable. | 🥇 **Zero data-viz plugins existed in the entire field** at survey time |
| 🗺️ **Structured planning with live progress** (`create_plan`, `get_plan`, `update_plan_step`) | Multi-step plans tracked through a real state machine (pending → in_progress → done, blocked-retry) with completion metrics. | ⭐ Rare — most toolboxes have no planning primitive at all |

---

## 🆚 Head-to-head — vs Beledarian's LM Studio Tools

The closest direct competitor on the Hub: same job (tools for local LLMs), very different build. Where we pull ahead:

| You get here that they don't have |
|---|
| ✅ **AST-level refactoring** (rename, move functions, dead-import cleanup) — syntax-safe transforms with auto-rollback, not string edits |
| ✅ **Real RAG:** vector index over PDF / DOCX / XLSX with page-level provenance — not just keyword search |
| ✅ **Image & data viz:** OCR, vision-model image analysis, chart generation |
| ✅ **120+ tools** vs ~49 — backed by 657 tests across 38 suites (~12× the test bench) |
| ✅ **Crash-resilient writes + rollback on failure:** a botched edit can never corrupt your file |

And one honest note: their i18n covers 4 languages, we cover 2 — that's the gap we're closing first. We'd rather tell you than pretend it doesn't exist.

---

## ▶️ One turn, ten tools — watch it work

> **You:** *"Refactor `auth.ts` — extract the token-refresh logic into its own module, move the helper next to it, run our test suite, and open a PR if it's green."*
>
> → `refactor_code` (AST extract + function move, auto-rollback armed) → `run_tests` (auto-detected **Jest**: 628 ✅) → `gh_create_pr` — **one turn. Zero copy-paste. Zero hand-holding.**

---

## ⚡ What you get — the full feature set

### 📁 Files — edit them *safely*
In-place replace · line-anchored inserts · chunked reads on huge files · diffs · directory trees — and **every write is backed up first** (`.bak`, one-call restore). Project-wide search that physically cannot hang (`grep_files`: deadline-capped, node_modules excluded) plus dry-run multi-file replace.

### 🧬 Refactoring that respects syntax
AST-driven renames, function moves & extractions with auto-rollback — the agent refactors like a developer, not like `sed`.

### ⏳ Long jobs without losing the thread
Kicks off builds and watchers in the **background**, keeps chatting, polls or cancels on demand. Sandboxed JS/Python for quick logic; full shell (pipes, redirects, env vars) when needed — but *off by default*. Your test suite runs itself: auto-detected runner, results back in chat.

### 🌐 The web, on tap
Multi-engine search with automatic fallback · clean page-text extraction · a **real headless browser** with persistent sessions (not a one-shot scraper) · HTTP client for any GET/POST JSON call.

### 🐙 Git & GitHub, hands-free
Local: status, diff, add, commit, log, checkout, **stash**, **blame**. Remote: issues, PRs, comments, diffs, push — through the `gh` CLI you already trust.

### 🗃️ Data it can actually read
PDFs, Word docs & spreadsheets → **semantic vector search** (local, nothing leaves your machine). OCR on screenshots and desktop captures; image comparison. Read-only SQLite with SQL validation. Your agent literally *sees* screens.

### 🧠 Memory that outlives the chat window
Decisions, patterns and configs persist per project — **and across projects**: type-scoped, TTL-pruned, recency×frequency-scored recall, confirm-first switching (`switch_context`). ContextGuard keeps marathon sessions alive: auto-summarize at 75%, compress at 90% — mid-chain.

### 📈 Output you can *see*
Charts rendered to image files from raw data (bar/line/pie/scatter/radar). Live HTML/CSS/JS components generated and previewed in-browser, with data extracted back into the chat.

---

## 🚀 Quick start (2 minutes)

**Prerequisites:** LM Studio (latest) · Node.js 20+ · *optional:* `gh` CLI for GitHub remote operations → https://cli.github.com/

1. **Install** — drop the folder in, enable the plugin in LM Studio's settings
2. **Toggle** — flip on the tool categories you want (Execution & Browser start disabled by design)
3. *(Optional)* `gh auth login` once in a terminal to unlock GitHub remote tools
4. **Chat** — your agent now has **120+ tools** in reach, gated exactly as you configured

```bash
# Developing instead of using?
npm install && npm run build   # ESM + CJS via tsup
npm test                        # full suite: 36+ suites green
```

---

## ⚙️ Configuration — total control, zero code

| Control | What it does |
|---|---|
| 🎛️ **Granular gating** | Every one of the 24 modules toggles independently in LM Studio's settings UI |
| 👑 **God Mode** | One switch enables everything (power users only — Execution is disabled by default for a reason) |
| 🔁 **ContextGuard** | Set token thresholds + summarization model; watch auto-compression keep long sessions alive |
| 🧮 **Auto-Tracking** | Background decision & task-completion tracking with confidence-tagged results |

---

## 🔒 Built like it matters: security posture

- 🛡️ Every file-modifying tool writes a `.bak` first — restore is one call (`restore_from_bak`)
- 🛡️ `grep_files` / `find_replace_all`: ReDoS-safe regex screening, deadline hard stops, partial results with explicit `aborted` flag
- 🛡️ RAG & web paths: bounded reads (250K–500K char budgets), 30 s aborts per fetch attempt, chunking loops that *terminate* — no plugin-host OOM from poison documents
- 🛡️ Sandboxed JS/Python execution; full shell available but **off by default**
- 🧪 `secret_scan` finds leaked keys before they ship
- Full threat model & disclosure process → [SECURITY.md](SECURITY.md)

---

## 🏗️ Under the hood (for the curious)

Declarative tool registry with closure-based dependency injection · full async + crash-resilient atomic writes (`atomicWrite` utility, rollback-on-failure) · dynamic context-window detection via native SDK APIs · confidence-tagged results (`EXTRACTED | INFERRED | AMBIGUOUS`) · cluster-aware tool priority for grammar-limit pruning.

Deep dive → [ARCHITECTURE.md](ARCHITECTURE.md) · Dev guide in this file below

---

## 🧰 The arsenal — **120+ tools across 24 modules**, all yours to toggle

One plugin replaces an entire shelf. Here's every family, what it covers, and its default state:

| Family | Count | What it gives your agent | Default |
|---|---|---|---|
| 📁 **File System** | 23 | Read/write/edit/search — path-validated, backed up, chunked reads on huge files, diffs, project trees, unbounded-feel (but deadline-capped) search + structured content scanning (`pattern_scan`) | ✅ |
| 🧬 **Refactoring & Recode engine** | `refactor_code` + rules | AST rename · move-function · extract · dead-import cleanup — plus a pluggable rule engine (dead-code hints, type inference, async modernizer) with dry-run diffs | ✅ |
| 🔍 **Text Processing** | 4 | Regex transforms (`sed`-class), structured extraction (`awk`-class), line surgery with fingerprint guards, instant Markdown tables | ✅ |
| 📋 **Task Planning** | 3 | Goal + step plans through a real state machine with live completion metrics — blocked steps retry cleanly | ✅ |
| ⚡ **Execution** | 5 | Sandboxed JS & Python (eval/require blocked) · full shell & native terminal (opt-in) · **auto-runs your project's test suite** (Jest/Mocha/Vitest detected) | mixed |
| 🧠 **Context & Memory** | 20 | Auto-summarization, typed memory with TTL pruning & heuristic recall, event tracking — **plus cross-project**: register/search/switch between projects, session index browser | ✅ |
| 📊 **Vector RAG** | 7 | Semantic search over your codebase *and* PDFs · Word docs · spreadsheets + query-relevant web extraction — local, bounded, OOM-proof | ✅ |
| 🔧 **Utilities** | ~29 | System info & monitoring · process lists · clipboard · notifications · MD5/SHA checksums · token counting · JSON↔CSV/base64 · **`secret_scan` for leaked keys** · port checks · package manager control (npm/pip/cargo) · jq-style `json_query` · safe `.env` editing | ✅ |
| 💾 **Backup & Restore** | 5 | Full-directory ZIP snapshots (`create_backup`/`restore_backup`), listing, cleanup — plus the per-edit `.bak` system underneath everything | ✅ |
| 📈 **Data Visualization** | 1 | `generate_chart`: bar / line / pie / doughnut / scatter / radar → image file with HTML fallback | ✅ |
| 🖼️ **Image Processing + Analysis** | 4+1 | OCR (`image_to_text`) · metadata inspection · desktop capture · comparison — and vision-model analysis via your loaded LM Studio model (`analyze_image`) | ✅ |
| 📄 **Document Parsing** | 1 | PDF / DOCX / TXT straight into the conversation, binary-safe | ✅ |
| 🌐 **Web Research** | 3 | Multi-engine search with fallback · clean page-text extraction | ✅ |
| 🌍 **Browser Automation** | 5 | Real headless Chromium: open pages, persistent sessions, UI interaction, preview HTML | ✗ opt-in |
| 🐙 **Git & GitHub** | 15 | Full local git incl. **stash & blame** · issues/PRs/comments/diffs/push via your `gh` CLI | ✗ opt-in |
| ⏳ **Background Commands** | 3 | Run long jobs without blocking the chat — monitor stdout/stderr, cancel anytime. No Docker. | ✗ opt-in |
| 📡 **HTTP Client** | 3 | Any-method requests with retry/timeout, JSON GET/POST helpers — SSRF-guarded | ✗ opt-in |
| 🎨 **UI Generation** | 3 | Build & preview live HTML/CSS/JS components in-browser · extract data back out | ✗ opt-in |
| 🗃️ **Database** | 1 | Read-only SQLite with injection-proof parameterized queries | ✗ opt-in |

> *Per-tool parameters, defaults and examples → [TOOLS_REFERENCE.md](TOOLS_REFERENCE.md) (audited against source). Walkthroughs: [DOCUMENTATION.md](DOCUMENTATION.md) · [QUICK_START.md](QUICK_START.md)*



---

## 📜 Release highlights (full history → [CHANGELOG_v2.md](CHANGELOG_v2.md))

| Version | Headline |
|---|---|
| **v1.9.12** | 🆕 `pattern_scan` recursive content search (unsafe regex auto-demotes to literal; 256 KB / 10k-line hard caps) · puppeteer `connected` property-read fix · dead-file removal — full MD docs sync |
| **v1.9.10** | 🔧 OOM-hardening suite: bounded web/RAG reads, chunking fixed-point termination, `rag_web_content` dedup — plugin-host heap is now safe under poison payloads |
| **v1.9.9** | ⏱️ Deadline-capped `grep_files` (partial results + `aborted` flag) · AutoTracker token deltas fire thresholds *inside* long tool chains · live `chat used ≈ N tok` DELTA log |
| **v1.9.8** | 🔒 Explicit project registration only · hang prevention (`max_depth`, line caps) · Step-0.7 keyword detection + lazy registry sync kills the "project not found" loop |
| **v1.9.7** | 💾 Crash-resilient atomic writes everywhere — randomized temp filenames, rollback-on-failure, zero blocking I/O |
| **v1.9.5–6** | 🧠 Graphify-inspired intelligence: confidence-tagged results, hub-exclusion clustering, cluster-aware tool priority · `shell:true` deprecation eliminated |
| **v1.8.x** | 🛡️ 3-layer line-edit guardrails · SDK v1.x token-counting accuracy (matches sidebar within <0.3%) · declarative registry refactor (~80 lines of if/else → 20-entry registry) |

---

## 📦 Core dependencies

`@lmstudio/sdk` ^1.5.0 · `puppeteer` ^24 · `isomorphic-git` ^1.38 · `sharp` ^0.33+ · `tesseract.js` ^7 · `pdf-parse` / `mammoth` / `xlsx` (document pipeline) · `@dqbd/tiktoken` (ContextGuard) · `zod` (runtime validation)

---

## 📄 License

**MIT** — free to use, modify, ship. See [LICENSE](LICENSE).

---

*AI Toolbox — the LM Studio plugin that gives your AI actual hands.* ✋🧰
