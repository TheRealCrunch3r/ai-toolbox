# 🧰 AI Toolbox — LM Studio Plugin

> **130 unique tools** across 24 modules, fully integrated and ready for use.  
*All tools dynamically registered with category-level gating.*
> *All tools registered via direct SDK pattern (no gateway indirection).*
---

## 📋 Table of Contents

- [Features](#-features)
- [Tool Categories](#-tool-categories)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Security](#-security)
- [Architecture](#-architecture)
- [Development](#-development)
- [Release History](#-release-history)
- [Dependencies](#-dependencies)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📁 **File System** | Read, write, search, and manage files with path validation & backup support |
| 🌐 **Web Research** | Multi-engine search (DDG, Google, Bing) with automatic fallback |
| 🖥️ **Browser Automation** | Headless Puppeteer browser with persistent sessions & UI interaction |
| 🐙 **Git & GitHub** | Full Git operations (including stash/blame) + GitHub API integration |
| 🗃️ **Database** | Read-only SQLite queries with SQL validation |
| ⏳ **Background Commands** | Long-running process management and status tracking |
| ⚡ **Code Execution** | Sandboxed JS/Python + full shell commands (pipes, redirects, env vars) |
| 🔧 **Utilities** | Clipboard, notifications, system info, memory, session summaries, and environment management |
| 🖼️ **Image Processing** | OCR (Tesseract.js), screenshots, and image comparison |
| 📊 **Vector RAG** | Semantic search with vector embeddings for intelligent document retrieval |
| 🎨 **UI Generation** | Generate and render interactive HTML/CSS/JS components in-browser |
| 🧠 **Context Management** | Automatic session tracking, decision logging, and memory management |
| 📝 **Text Processing** | Advanced regex-based text transformations (sed/awk equivalents) |
| 📋 **Task Planning** | Structured multi-step workflow tools (`create_plan`, `get_plan`, `update_plan_step`) |

---

## 🗂️ Tool Categories

### File System Tools (22 tools — enabled by default)
`list_directory` · `read_file` · `read_file_chunked` · `save_file` · `replace_text_in_file` · `insert_at_line` · `append_file` · `delete_lines_in_file` · `make_directory` · `move_file` · `copy_file` · `delete_path` · `delete_files_by_pattern` · `find_files` · `fuzzy_find_local_files` · `get_file_metadata` · `change_directory` · `analyze_project` · `file_diff` · `directory_tree` · `grep_files` · `find_replace_all`

### Web Research Tools (3 tools — enabled by default; `rag_web_content` served by the Vector RAG module since v1.9.10)
`web_search` · `wikipedia_search` · `fetch_web_content`

### Browser Automation Tools (5 tools — disabled by default)
`browser_open_page` · `browser_session_control` · `browser_session_close` · `preview_html` · `open_file`

### Git & GitHub Tools (15 tools — disabled by default)
**Local Operations (`isomorphic-git`)**: `git_status` · `git_diff` · `git_commit` · `git_log` · `git_add` · `git_checkout` · `git_stash` · `git_blame`

**Remote API (GitHub CLI `gh`)**: `gh_create_issue` · `gh_list_issues` · `gh_view_comments` · `gh_create_pr` · `gh_list_prs` · `gh_push`

> **Note**: Remote operations require the [GitHub CLI](https://cli.github.com/) to be installed and authenticated (`gh auth login`).

### Database (1 tool — disabled by default)
`query_database`

### Document Parsing (1 tool — enabled by default)
`read_document`

### Background Commands (3 tools — disabled by default)
`run_background_command` · `check_background_command` · `cancel_background_command`

### Image Processing (4 tools — enabled by default)
`image_to_text` · `describe_image` · `screenshot_desktop` · `compare_images`

### HTTP Client Tools (3 tools — disabled by default)
`http_request` · `http_get_json` · `http_post_json`

### Vector RAG / Semantic Search (7 tools — enabled by default)
`rag_index_files` · `rag_index_pdf` · `rag_index_docx` · `rag_index_xlsx` · `rag_query_vector` · `rag_clear_index` · `rag_web_content`

### UI Generation Tools (3 tools — disabled by default)
`generate_ui_component` · `render_and_preview_ui` · `extract_ui_data`

### Context Management Tools (12 tools — enabled by default)
`auto_summarize_context` · `get_context_memory` · `search_context` · `context_summary` · `delete_context_entry` · `clear_context_memory` · `track_important_event` · `save_session_summary` · `get_session_summary` · `save_memory` · `get_memory` · `delete_memory`

### Text Processing Tools (4 tools — enabled by default)
`text_transform` · `text_extract` · `line_operations` · `markdown_table_gen`

### AST Code Refactoring Tools (2 tools — enabled by default)
`refactor_code` · `unusedImports`

### Task Planning Tools (3 tools — enabled by default)
`create_plan` · `get_plan` · `update_plan_step`

### Execution Tools (5 tools — mixed defaults: JS/Python enabled, Terminal/Shell disabled)
`run_javascript` · `run_python` · `execute_command` · `run_in_terminal` · `run_tests`

---

## 🚀 Quick Start

### Installation

The plugin is installed as an LM Studio plugin. Ensure you have:

- **LM Studio** (latest version)
- **Node.js 20+** installed on your system
- **GitHub CLI (`gh`)** — required for remote GitHub operations (Issues, PRs). Install at https://cli.github.com/

### First Use

1. **Load the plugin** in LM Studio's plugin settings
2. **Configure tool access** — individual tool categories can be toggled on/off via the Settings panel. Note that some tools (like Execution) are disabled by default for security.
3. **Authenticate with GitHub**: Run `gh auth login` in your terminal once to enable remote operations (`gh_create_issue`, `gh_list_prs`, etc.). The plugin will detect authentication status automatically.
4. **Start a chat** and the AI can now use any of the **130** registered tools based on configuration settings (configurable per user, organized across 24 modules).

---

## ⚙️ Configuration

The plugin uses a comprehensive configuration schema (`src/config.ts`) which is exposed in LM Studio's settings UI. Key features include:

- **God Mode**: Instantly enables all tool categories.
- **Granular Gating**: Toggle individual categories (Git, Web, File System, etc.).
- **Execution Control**: Separate toggles for JavaScript, Python, Terminal, and Shell execution.
- **ContextGuard**: Configure token limits and summarization models to prevent context overflow.
- **Auto-Tracking**: Enable background tracking of decisions and task completions.

---

## 🔒 Security

Comprehensive documentation of security features, threat models, and responsible disclosure of the AI Toolbox plugin. See [SECURITY.md](SECURITY.md) for details.

---

## 🏗️ Architecture

Deep dive into the AI Toolbox plugin's system architecture, design patterns, and internal workflows. See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

---

## 👩‍💻 Development

### Prerequisites

- **Node.js 20+**
- **npm**

### Setup

```bash
# Install dependencies
npm install

# Build the project (ESM + CJS via Tsup)
npm run build

# Run type checking
npm run typecheck

# Run test suite
npm test
```

---

## 📜 Release History

### [1.5.37] - 2026-07-10 — 🔧 Grammar Parser Hardening & ContextGuard SDK Defensive Fixes
**Resolved critical grammar parser failure and added defensive error handling for SDK token counting.**

### [1.5.39] - 2026-07-10 — 🔧 Grammar Parser Fix: Production Deployment & Debug Cleanup
**Resolved critical grammar parser failure in production — tool count capping now enforced at 25 tools (was 50), minifier properly wired up.**

### [1.6.2] - 2026-07-14 — 🛠️ Utility Tools Registration & Cleanup
**Registered utility tools and cleaned up orphaned gateway pattern code.**
- ✅ Registered `backupTools` (create_backup, list_backups, restore_backup, delete_backup)
- ✅ Registered `cleanupBackupsTool` (cleanup_backups)
- ✅ Registered `dataVisualizationTools` (generate_chart)
- ✅ Registered `lineOperations` (delete_lines)
- ✅ Registered `markdownPreviewTools` (markdown_preview)
- ✅ Added `utility` config toggle to enable/disable all utility tools

### [1.6.4] - 2026-07-14 — 🔒 Strict Typing & Config Resolution Hardening
**Eliminated all `any` type usage and fixed config resolution for ParsedConfig wrapper.**
- ✅ **Strict typing policy enforced**: Replaced all `z.any()` with `z.unknown()` in Zod schemas
- ✅ **Removed non-null assertions**: Replaced `latest.timestamp!` with `latest.timestamp ?? 0`
- ✅ **Fixed config resolution**: Constructed proper `PluginConfig` object from `.get()` calls instead of direct property access on `ParsedConfig` wrapper
- ✅ **Eliminated AST parser type mismatch**: Applied safe `as unknown as` double-cast for `@typescript-eslint/parser` return type
- ✅ **Lint & typecheck clean**: Zero ESLint errors, zero TypeScript errors, 371/371 tests passing

### [1.7.0] - 2026-07-25 — 🧠 Dynamic Context Window Detection & line_operations Safety Guardrails
**Resolved critical token limit hardcoding, fixed JSON serialization crashes, and added comprehensive safety guardrails to `line_operations` tool.**

#### Dynamic Context Window Detection
- ✅ **Dynamic token limits**: Replaced hardcoded 30k/16k fallbacks with dynamic SDK `getContextLength()` API (accurately detects up to 224k+ tokens)
- ✅ **JSON crash fix**: Resolved plugin crashes from non-JSON-safe properties in model objects; reverted to stable `summaryModel` configuration approach
- ✅ **ContextGuard hardening**: Added defensive checks around SDK token counting and model metadata fetching

#### 🛡️ line_operations Safety Guardrails (NEW)
**Resolved recurring issues where LLMs inserted content at wrong lines due to stale line numbers.**

Three-layer defense-in-depth strategy:

| Layer | Parameter | Purpose |
|-------|-----------|---------|
| **Content-Aware Insertion** | `insert_after_pattern` / `insert_before_pattern` | Find insertion point by searching file content instead of trusting line numbers |
| **Line Fingerprinting** | `verify_before_insert` | Content expected at target_line — blocks operation if mismatch and shows actual context |
| **Bounds Validation** | Auto-detection + limits | Rejects out-of-range lines, multi-line content splitting, large insert blocking (>5 lines) |

**Example usage:**
```typescript
// Pattern-based (line-number-agnostic):
line_operations(file_name, operation: "insert", 
  insert_after_pattern: "if (width <= 0 || height <= 0)",
  content: "// fix"
)

// Verification-based (prevents drift errors):
line_operations(file_name, operation: "insert", target_line: 84, 
  content: "// fix",
  verify_before_insert: "return;" // Content expected at line 84
)
```

**Impact**: All guardrails tested and verified — 9/9 test scenarios passed with zero regressions.

### [1.8.0] - 2026-07-26 — 🔥 SDK v1.x Content Block Extraction & Token Counting Fix
**Resolved critical token undercounting bug caused by incomplete message content extraction when LM Studio SDK v1.x returns array-based content blocks or ChatMessage objects.**

#### What Changed
- ✅ **SDK v1.x compatibility**: `ContextGuard.countTokens()` now properly extracts text from arrays of content blocks `[{"type": "text", "text": "..."}]` instead of stringifying entire arrays
- ✅ **ChatMessage support**: Falls back to `.getText()` method or `.text` property before JSON serialization for structured message objects
- ✅ **ESLint hardening**: Resolved `@typescript-eslint/no-base-to-string` error with explicit type checks and scoped suppression

### [1.8.1] - 2026-07-27 — 🔧 grep_files Performance Fix: Default Directory Exclusions
**Fixed critical performance issue where `grep_files` searched ALL directories including node_modules, .git, and build artifacts.**

#### What Changed
- ✅ Added `DEFAULT_EXCLUDED_DIRS` Set in `walkDirectory()` function within `src/tools/fileSystemTools.ts`
- ✅ Automatically excludes by default: `node_modules`, `.git`, `dist`, `build`, `.next`, `.nuxt`, `__pycache__`, `.cache`, `vendor`, `.vscode`, `.idea`, `.vs`
- ✅ Exclusions are bypassed when user specifies explicit `include` pattern (backward compatible)

### [1.8.2] - 2026-07-27 — 🏗️ `toolsProvider.ts` Refactoring: Declarative Registry Pattern
**Architectural overhaul of tool registration system — replaced repetitive gating logic with a clean, maintainable registry pattern using closures.**
- ✅ **Replaced ~80 lines of repetitive if/else blocks** with a single declarative registry array (`TOOL_REGISTRIES`) containing 20 entries
- ✅ **Closure-based dependency injection**: Each registry entry captures `config`, `stateManager`, and `backgroundCommandManager` at definition time via arrow functions, eliminating parameter-passing complexity
- ✅ **Strict TypeScript compliance**: Eliminated all `any[]` types, replaced with typed closures (`() => Tool[]`) that satisfy strict ESLint rules
- ✅ **Simplified registry loop**: Single `for...of` iteration replaces scattered conditional blocks — adds tools based on config keys or GOD MODE bypass

### [1.8.3] - 2026-07-30 — 🧹 Final Cleanup & ContextGuard Calibration
**Resolved critical token undercounting bug caused by incomplete message content extraction when LM Studio SDK v1.x returns array-based content blocks.**
- ✅ **SDK v1.x compatibility overhaul**: `ContextGuard.countTokens()` now properly extracts text from arrays of content blocks, ChatMessage objects.

### [1.8.4] - 2026-07-31 — 🐛 ContextGuard Crash Fix: Safe History Text Length Calculation
**Resolved critical `TypeError: Cannot read properties of undefined (reading 'length')` crash in `promptPreprocessor.ts`.**
- ✅ **Fixed history text length calculation**: Added safe type checking and try/catch around the loop calculating `historyTextLength`.

### [1.8.5] - 2026-07-31 — 🧠 Accurate Token Counting via Native History API & Checkpoint Injection Fix
**Resolved critical token counting inaccuracy and missing checkpoint prompt injection issues.**
- ✅ **History Text Length calculation overhaul**: Replaced broken `.content` casting with LM Studio's native history API (`getLength()`, `at(i)`, `getText()`).
- ✅ **Token counting method change**: Switched from SDK-native `countTokens() × 65` to History Text Length `× 0.24` ratio — matches sidebar exactly.

### [1.8.6] - 2026-07-31 — 📋 Task Planning Tools: Structured Multi-Step Workflow Management
**Added three new tools for creating, tracking, and updating execution plans with persistent storage.**
- ✅ `create_plan` — Create execution plans with goal + ordered steps (1–30 steps). Returns `planId`, `goal`, `stepCount`.
- ✅ `get_plan` — Return active plan details including step statuses, completion %, elapsed time.
- ✅ `update_plan_step` — Update step status per state machine rules (`pending→in_progress→done`, any→blocked).

### [1.8.7] - 2026-08-01 — 🔧 Token Counting Calibration, Config Exports, Drift Detection & Version Bump
**Applied five critical fixes: token ratio calibration, missing config exports, test console suppression, insert_at_line read-back drift detection.**
- ✅ **Token counting ratio ×0.24 → ×0.25**: Updated in `contextGuard.ts` and `promptPreprocessor.ts`. Effective ratio ~0.275 with +10% buffer — matches LM Studio sidebar within <0.3% deviation.
- ✅ **Missing config exports**: Added `validateConfig()` and `isToolEnabled()` to `src/config.ts` public API.
- ✅ **Read-back drift detection on insert_at_line**: After inserting content, tool re-reads file and searches ±3 lines for inserted content. Returns structured warning instead of silently corrupting files.

### [1.8.8] - 2026-08-02 — 🛡️ .bak Backup Discovery & Restoration Tools + LLM Awareness
**Added explicit LLM-accessible tools for discovering and restoring from `.bak` backup files created by file-modifying operations.**
- ✅ **NEW `restore_from_bak(file_name)`** — Restores any file from its `.bak` backup; scans working directory, copies back original, deletes `.bak`. Returns list of available backups if none found.
- ✅ **NEW `list_available_bak_backups()`** — Scans for all `.bak` files and returns structured data: `{file, backupFile, sizeBytes}` array.
- ✅ **Backup announcements in tool responses**: All file-modifying tools now include explicit `backupMessage` field announcing the `.bak` location to LLM.

### [1.9.0] - 2026-08-06 — 🛠️ Jest Mock Compatibility Fix & Documentation Version Updates
**Resolved Jest `moduleNameMapper` catch-all regex conflict with tool imports and synchronized version references across all documentation files.**
- ✅ **Jest mock compatibility**: Resolved configuration error where the catch-all regex matched barrel file imports (`./tools/index.js`) and attempted to resolve them to non-existent mock files. Reverted to individual tool imports for Jest compatibility.
- ✅ **Documentation synchronization**: Updated v1.8.9 → v1.9.0 across all MD files

### [1.9.1] - 2026-08-06 — 🧠 Context Management Architecture: Scoping, Heuristic Scoring & TTL Pruning
**Three architectural improvements to the memory system with context isolation and intelligent retrieval.**
- ✅ **Context scoping**: Added `MemoryScope` type (`global`/`project`/`session`) to prevent cross-project memory bleed
- ✅ **Heuristic scoring**: Deterministic composite score (Recency 70% + Frequency 30%) replaces raw insertion order for smarter retrieval
- ✅ **TTL pruning**: 24-hour expiration for session-scoped entries; pruned automatically before every read operation

### [1.9.2] - 2026-08-07 — 🔥 grep_files ReDoS Fix & RAG System Overhaul: PDF/DOCX/XLSX Indexing Tools
**Resolved critical Regex Denial of Service (ReDoS) vulnerability in `grep_files` AND completed comprehensive RAG system overhaul with new indexing tools for PDF, DOCX, and XLSX formats.**

#### grep_files ReDoS Fix
- ✅ **Top-level alternation detection**: Added `hasTopLevelAlternation()` scanner tracking parenthesis depth to catch `\|` at root level
- ✅ **Split-regex processing**: Pattern split into independent `RegExp[]` branches — each tested separately with early-exit, eliminating cross-branch backtracking in V8's NFA engine

#### RAG System Overhaul (NEW)
- ✅ **Added 3 new indexing tools** (`rag_index_pdf`, `rag_index_docx`, `rag_index_xlsx`) expanding Vector RAG from 4 → 7 total tools
- ✅ **PDF indexing**: Extracts PDF text via `pdf-parse`, chunks by page boundary with ~300 words/chunk — traceable results per page number; verified against 25MB/1690-page programming guide without OOM/crash
- ✅ **DOCX indexing**: Uses existing `mammoth` dependency for DOCX extraction — word-bounded chunks (default 300 words, 50 overlap); semantic search working correctly
- ✅ **XLSX indexing**: Added `xlsx ^0.18.5` dependency; extracts all sheets as row arrays with configurable sheet-name prefix; verified programmatic smoke test showing correct ranking of API vs Test Data sheets
- ✅ **ESLint fixes in `vectorRagTools.ts`**: Resolved 4 issues (unused catch param, unsafe return cast, dead eslint-disable directives) — zero errors/warnings after fix

#### Other Fixes
- ✅ **371 tests pass** across 23 suites including 11 `grep_files`-specific tests — zero regressions

### [v1.9.3] - 2026-08-09 — 🔧 ESLint `no-unsafe-assignment` Hardening & Type-Safety Refinement
**Resolved unused eslint-disable directives and eliminated implicit `any` assignments in HTTP client tools through explicit type annotations.**

#### What Changed
- ✅ **Removed 4 unused suppression directives**: In `src/tools/httpClientTools.ts` and `src/tools/networkToolsRegistry.ts`, `eslint-disable-next-line @typescript-eslint/no-unsafe-assignment` comments were flagged as unused because assigning `response.json()` to variables with explicit `: unknown` type is already safe per TypeScript/ESLint rules.
- ✅ **Added explicit `unknown` annotations**: Replaced implicit `any` assignments (`const data = await response.json();`) with typed declarations (`const data: unknown = await response.json();`) across all HTTP response parsing paths — 10 warnings resolved total.
- ✅ **Version bump**: Updated all project metadata from v1.9.2 → v1.9.3.

#### Root Cause Addressed
Prior to this fix, ESLint's `@typescript-eslint/no-unsafe-assignment` rule flagged assignments where the source expression was `any` (from `response.json()`) and the target variable was implicitly typed as `any`. TypeScript infers `any` when no explicit type annotation is provided, which defeats compile-time safety checks. The previous session added suppression directives with justifications, but ESLint correctly reported them as unused because assigning `any` → explicit `unknown` satisfies the rule without needing suppression.

#### Impact
- ✅ **Zero ESLint warnings**: All 10 `no-unsafe-assignment` warnings resolved across both files
- ✅ **Strict type safety preserved**: Explicit `: unknown` annotations force downstream consumers to perform type guards or assertions before using HTTP response payloads
- ✅ **No functional changes**: Only static analysis directives and type annotations adjusted; runtime behavior identical

### [v1.9.4] - 2026-08-09 — 🧠 Context Management Architecture: Disk Fallback Restoration & Comprehensive Bug Fix Suite (14 Fixes)

**Fixed critical `get_session_summary()` disk fallback bug + applied 14 comprehensive fixes across P0-P3 severity levels for context management tools.**

#### What Changed
- ✅ **FIX #5 — Disk fallback schema alignment**: `get_session_summary()` reads `.msgpack` as `ContextEntry[]` and parses JSON content from `summaryEntry.content` or falls back to legacy text format — prevents data loss on plugin reload
- ✅ **FIX #1 — Duplicate prevention**: `addEntry()` now merges updated data into existing entry instead of creating duplicates via `unshift()`
- ✅ **FIX #2 — Inline pruning**: `getRecentEntries()` and `searchEntries()` prune expired entries inline after load → save (single I/O)
- ✅ **FIX #6 — Collision resistance**: `generateId()` uses `crypto.randomBytes(9)` (72-bit entropy) instead of `Math.random().substr(2, 9)`
- ✅ **ESLint fix**: Replaced dynamic `require('crypto')` with static ESM import `import * as crypto from 'crypto'`

### [v1.9.5] - 2026-08-10 — 🧠 Graphify-Inspired Architectural Intelligence Suite

**Five major architectural improvements inspired by graphify repository analysis — confidence-tagged results, hub-exclusion clustering, project auto-detection, context tier provenance, and cluster-aware tool priority ranking.**

#### What Changed
- ✅ **Confidence-Tagged Results (`src/types/confidenceTypes.ts`)**: Typed metadata (`EXTRACTED | INFERRED | AMBIGUOUS`) with provenance tracking for all tool outputs — enables LLMs to distinguish deterministic results from semantic inferences.
- ✅ **Hub-Exclusion Clustering (`src/utils/hubExclusionClustering.ts`)**: Louvain community detection with hub-exclusion for architectural transparency; identifies high-degree modules, calculates cluster density/modularity, and reattaches hubs via majority-vote. 83 tests covering graph construction, convergence, and edge cases.
- ✅ **Project Auto-Detection (`src/projectAutoDetect.ts`)**: Automatically detects and registers projects in the cross-project registry when searches return empty results; uses confidence scoring (`package.json +0.4`, `src/ +0.3`) with name normalization for fuzzy matching. (⚠️ Superseded in v1.9.8 — silent auto-registration removed, explicit confirmation required.)
- ✅ **Context Tier Provenance (`src/contextTiers.ts`)**: Typed `_origin: 'ast' | 'semantic'` markers for tier-scoped context replacement — prevents silent overwrites of unchanged nodes during incremental updates.
- ✅ **Cluster-Aware Tool Priority (`src/tools/toolPriority.ts`)**: Five-tier priority ranking (Critical → Background) with hub-exclusion clustering integration; ensures architecturally important modules are retained first when grammar parser limits require tool pruning.

### [v1.9.6] - 2026-08-11 — 🔒 DEP0190 Fix: Eliminate `shell:true` Deprecation Warning

**Replaced all `child_process.exec()` calls with explicit shell spawning via `spawn(cmd.exe /c, ...)` in `gitGithubTools.ts`. Zero behavioral changes.**

#### What Changed
- ✅ **Removed `exec` import + `promisify`**: Replaced with single `import { spawn } from 'child_process'`
- ✅ **Added `safeExec()` helper function**: Explicit shell spawning using `cmd.exe /c` (Windows) or `/bin/sh -c` (Unix/macOS) — never uses `{ shell: true }`, avoiding Node.js DEP0190 warning
- ✅ **All 12 git command invocations updated**: `git diff`, `git commit`, `git checkout -b`, `git push`, `git stash push/pop/drop/list`, `git blame` now use `safeExec()` instead of `execPromise()`

### [v1.9.7] - 2026-08-16 — 🔒 Crash-Resilient Atomic Writes: Shared `atomicWrite` Utility & Full Async Conversion

**Eliminated all synchronous file writes from the codebase; introduced shared crash-resilient atomic write utility with randomized temp filenames and rollback-on-failure protection.**

#### What Changed
##### 🔒 Crash-Resilient Atomic Writes (`src/utils/atomicWrite.ts`)
- ✅ **Shared `atomicWrite` utility**: Randomized temporary filenames via `crypto.randomBytes(9)` — prevents collisions, survives process crashes. Binary file support via dedicated `atomicWriteBinaryFile()`.
- ✅ **Full async conversion (9 modules)**: lineOperations, refactorCodeTools, utilityTools, dataVisualizationTools, imageProcessingTools, markdownPreviewTools, browserAutomationTools, uiGenerationTools, recodeEngine — all converted from sync writes to async atomic pattern.
- ✅ **Rollback-on-failure in `refactorCodeTools` & `recodeEngine`**: Source code protection — failed AST transformations automatically restore original file from `.bak` backup.
- ✅ **Zero sync writes remaining**: All `writeFileSync`/`renameSync` eliminated from `src/tools/`.

#### Impact
- ✅ **Crash resilience**: Randomized temp filenames + atomic rename survive process crashes; original file intact even if write interrupted mid-operation.
- ✅ **Event-loop non-blocking**: All 9 modules now async — no more sync writes blocking during LLM tool chains.
- ✅ **Binary integrity**: `atomicWriteBinaryFile()` uses raw buffer writes — image/chart output preserves exact binary content.

### [v1.9.8] - 2026-08-16 — 🔒 Silent Auto-Registration Fix + grep_files/find_replace_all Hang Prevention + Keyword Detection & Registry Sync (v1.9.8+)

**Three major fixes: eliminated silent auto-registration of wrong project paths, hang prevention for grep_files/find_replace_all, and elimination of the "project not found" clarification loop via Step 0.7 keyword detection + lazy registry sync.**

#### What Changed

##### 🔒 Silent Auto-Registration Fix (`src/index.ts`, `src/projectAutoDetect.ts`)
- **Root Cause**: `main()` called `initializeProjectDetection(cwd)` unconditionally during plugin startup → silently registered whatever directory it found instead of the actual project path.
- **Fix**: Removed both the import and the call from `index.ts`. Added explanatory comment documenting that projects must be registered explicitly via the `register_project` tool.
- **Safety Gate**: Added `explicitConfirmation: boolean = false` parameter to `autoDetectAndRegister()` and `searchWithAutoRegister()` — both now block registration when flag is not set to `true`.
- **DEPRECATED**: `initializeProjectDetection()` marked as deprecated; no longer calls any registration logic.

##### ⚡ grep_files / find_replace_all Hang Prevention (`src/tools/fileSystemTools.ts`, `src/security.ts`)
- ✅ **Added `max_depth` parameter** (default: 10, range: 1–50) to both tools with depth enforcement in `walkDirectory`/`walkDir` — prevents infinite recursion into nested directories.
- ✅ **Added `MAX_LINES_PER_FILE = 5000` limit** inside file processing loops — prevents hanging on large files.
- ✅ **Improved `isSafeRegex()`**: Added quantifier count check (>5 returns false) and consecutive quantified character class detection (`[[^]]+]+[+*]`) to catch additional ReDoS patterns.

##### 🧠 Project Keyword Detection & Cross-Project Registry Sync (`src/promptPreprocessor.ts`, `src/tools/contextManagementTools.ts`) — added 2026-08-17 (v1.9.8+)
- **Root Cause**: The cross-project registry was never synced from session memory decisions → mentioning a registered project (e.g., "switch to ai-toolbox") produced empty `search_projects` results and a clarification loop.
- **Step 0.7 — Keyword detection** (`promptPreprocessor.ts`): `detectProjectKeyword()` reads `project_registry.json`, fuzzy-matches message words against registered projects (hyphen↔underscore normalization), and injects a confirmation prompt before falling through to directory-path detection or RAG.
- **Lazy registry sync** (`contextManagementTools.ts`): `_syncFromSessionMemory()` scans `.ai_toolbox_memory.msgpack` for `project_path` fields and auto-registers missing projects — called lazily inside `search_projects` / `get_project_info`, so no startup overhead.

#### Impact
- ✅ **No more silent registration**: Projects can only be registered via explicit `register_project` tool call with confirmed path — no accidental registration of wrong/stale paths.
- ✅ **Hang prevention**: `max_depth` and `MAX_LINES_PER_FILE=5000` prevent infinite recursion and large-file hangs in grep_files/find_replace_all.
- ✅ **Enhanced ReDoS protection**: Quantifier count check (>5) and consecutive quantified character class detection catch additional dangerous patterns.
- ✅ **Clarification loop eliminated**: Projects detected via keyword matching now surface in `search_projects`/`get_project_info` without manual re-registration.
- ✅ **No startup overhead**: Lazy sync pattern — registry only synced when a search or lookup actually happens.
- ✅ **Backward compatible**: Explicit `register_project` (confirmed path) remains the primary registration method; auto-sync is additive.

### [v1.9.9] - 2026-08-24 — ⚡ grep_files Hard Limits & Hang Fix + AutoTracker Mid-Loop Token Counting + DELTA "chat used" Log

**Deadline-based hard limits for `grep_files` (escape-aware alternation splitting, partial results with `aborted` flag), mid-loop per-tool token deltas so thresholds fire inside long tool loops, and a live `| chat used ≈ N tok` field in `[AutoTracker] [DELTA]` lines.**

#### What Changed
- ✅ **grep_files hang fix** (`src/tools/fileSystemTools.ts`): escape-aware top-level alternation splitting + real deadline-based hard stops on the sync regex loop. New limits: `GREP_SCAN_DEADLINE_MS=15000`, `MAX_LINE_CHARS_REGEX_MODE=20000` (long lines skipped in regex mode), `PER_REGEX_TIMEOUT_MS=500` (abandon-and-continue per candidate), single-file backstop via `Promise.race` at deadline+5 s; over-cap files reported in `skipped_files`.
- ✅ **AutoTracker mid-loop delta bookkeeping** (FIX #20, `src/tokenStatsManager.ts` + 4 further source files): every tool result is measured into a running per-turn delta — threshold/compression decisions now evaluate history count + deltas instead of waiting for the next full count.
- ✅ **DELTA log enhancement**: `[AutoTracker] [DELTA]` lines append `| chat used ≈ N tok`, where N = turn-start TokenCheck baseline + mid-loop estimate (nested semantics: tool delta ⊆ turn total ⊆ chat used; field omitted when the ContextGuard recount fails).
- ✅ **Same wind-down, same day**: `[TokenCheck]` log values rounded via `Math.round`; en-US locale pins for model-facing strings.

#### Impact
- ✅ `grep_files` can no longer block indefinitely — worst case is deadline + 5 s with partial results flagged `aborted: true`.
- ✅ Token-threshold triggers (75% / 90%) now also fire *inside* multi-tool turns, not only between messages.
- ✅ Better observability: per-turn chat-used estimates directly in the DELTA logs.

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@lmstudio/sdk` | ^1.5.0 | Core SDK for LM Studio plugin development |
| `@dqbd/tiktoken` | ^1.0.22 | Accurate token counting for ContextGuard |
| `puppeteer` | ^24.0.0 | Browser automation |
| `isomorphic-git` | ^1.38.6 | Pure JS Git operations (migrated from simple-git in v1.5.25) |
| `sharp` | ^0.33.5 | Image processing |
| `tesseract.js` | ^7.0.0 | OCR engine |
| `pdf-parse` | ^1.1.1 | PDF document parsing |
| `mammoth` | ^1.6.0 | DOCX document parsing |
| `xlsx` | ^0.18.5 | XLS/XLSX spreadsheet parsing |
| `archiver` | ^8.0.0 | ZIP archive creation |
| `unzipper` | ^0.12.3 | ZIP extraction |
| `zod` | ^3.25.0 | Runtime type validation |

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
