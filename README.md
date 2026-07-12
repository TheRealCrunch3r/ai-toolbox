# 🧰 AI Toolbox — LM Studio Plugin

> **111+ tools** across 18 core categories + Gateway Tools (2). (22 Git/GitHub tools + 89 others)

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

---

## 🗂️ Tool Categories

### File System (~21 tools)
`list_directory` · `read_file` · `save_file` · `replace_text_in_file` · `insert_at_line` · `append_file` · `delete_lines_in_file` · `make_directory` · `move_file` · `copy_file` · `delete_path` · `delete_files_by_pattern` · `find_files` · `fuzzy_find_local_files` · `get_file_metadata` · `change_directory` · `read_document` · `analyze_project`

### Web Research (4 tools)
`web_search` · `wikipedia_search` · `fetch_web_content` · `rag_web_content`

### Browser Automation (5 tools)
`browser_open_page` · `browser_session_control` · `browser_session_close` · `preview_html` · `open_file`

### Git & GitHub (22 tools)
**Local Operations (`isomorphic-git`)**: `git_status` · `git_diff` · `git_commit` · `git_log` · `git_add` · `git_checkout` · `git_stash` · `git_blame`
  
**Remote API (GitHub CLI `gh`)**: `gh_auth` · `gh_create_issue` · `gh_list_issues` · `gh_view_comments` · `gh_create_pr` · `gh_list_prs` · `gh_push`

> **Note**: Remote operations require the [GitHub CLI](https://cli.github.com/) to be installed and authenticated (`gh auth login`).

### Database (1 tool)
`query_database`

### Background Commands (3 tools)
`run_background_command` · `check_background_command` · `cancel_background_command`

### Execution (5 tools)
`run_javascript` · `run_python` · `execute_command` · `run_in_terminal` · `run_tests`

### Utilities (~29 tools)
`save_memory` · `get_system_info` · `read_clipboard` · `write_clipboard` · `send_notification` · `findLMStudioHome` · `get_enabled_tools` · `system_monitor` · `process_list` · `env_inspect` · `hash_file` · `token_count` · `convert_format` · `secret_scan` · `port_check` · `package_manage` · `detect_os_environment` · `json_query` · `env_update` · `get_current_working_directory` · `markdown_table_gen` · `refactor_code`

- ✅ Engine supports backup & rollback via `.bak` file creation before modifications  
### Image Processing (4 tools)
`image_to_text` · `compare_images` · `describe_image` · `screenshot_desktop`

### Vector RAG (4 tools)
`vector_rag_search` (and related semantic retrieval functions)

### UI Generation (3 tools)
`ui_generate_component` · `ui_render_html` · `ui_preview_element`

### Context Management (7 tools)
`auto_summarize_context` · `get_context_memory` · `search_context` · `context_summary` · `delete_context_entry` · `clear_context_memory` · `add_context_entry`

### Text Processing (4 tools)
`text_transform` · `line_operations` · `text_extract` · `markdown_table_gen`

### Backup & Line Ops (Always Available)
`create_backup` · `list_backups` · `delete_backup` · `line_operations`

### Gateway Tools (v1.6.0+ — Always Enabled)
**Purpose**: Single entry point for tool discovery and execution to prevent LLM tool-bloat crashes.
- ✅ `explore_tools` — Discovers available tools and their categories without exposing all 111+ tools at once
- ✅ `execute_gateway_tool` — Delegates execution to any registered tool by name with built-in validation

**Why Gateway?** Sending ~111 tools directly to llama.cpp's grammar parser causes EBNF recursion limit errors. The Gateway pattern reduces initial schema payload from 111 → 2 tools while maintaining full functionality on-demand.

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
4. **Start a chat** and the LLM can now use any of the 111+ available tools via the Gateway pattern (v1.6.0+) — AI discovers categories first, then executes specific tools on-demand.

### [1.5.36] — 🔧 Grammar Parser Fix: Schema Minification for llama.cpp Compatibility  \n**Resolved critical grammar parsing failure that prevented tool registration with ~109 tools enabled.** When sending the first chat message, LM Studio threw `Engine protocol predict request returned 400 ... failed to parse grammar` due to llama.cpp's EBNF grammar generator exceeding recursion limits.  \\n- ✅ Created `src/toolsSchemaMinifier.ts` — new module that compresses tool schemas before registration (truncates descriptions >200 chars → ~150 chars, caps string `.max()` at 10KB, caps array `.max()` at 100 items)  \\n- ✅ Integrated minification into `toolsProvider.ts` — runs right before tool registration with LM Studio SDK  \\n- ✅ Grammar parsing error resolved — no more `failed to parse grammar` errors when sending first chat message with plugin enabled  \\n- ✅ Schema payload reduced by ~40% through description truncation and constraint capping  \\n- ✅ Zero breaking changes — validation logic preserved, only schema metadata compressed  \\n- ✅ Runtime constraints still enforced — Zod schemas validate actual limits at execution time
### [1.5.35] — 🔧 ContextGuard SDK-Native Tokenization & TypeScript Hardening  \n**Replaced manual Tiktoken encoding with LM Studio SDK-native token counting for accurate compression threshold triggering.**  \\n- ✅ `countTokens()` now accepts optional `modelId?: string` parameter → uses `await model.countTokens(promptString)` when SDK available  \\n- ✅ Messages formatted into compatible prompt strings bridging array-based messages to SDK's `string` signature  \\n- ✅ Graceful fallback to manual Tiktoken encoding with clear warning logs if SDK fails  \\n- ✅ Resolved `TS2345`, `no-unnecessary-type-assertion`, and `no-unsafe-*` ESLint violations via explicit casting + standard `if/else` narrowing  \\n- ✅ AutoTracker synergy confirmed: receives accurate counts directly from ContextGuard → threshold checks fire precisely at configured percentages

---

### [1.5.34] — 🗂️ Hidden Session Context & Import Path Fixes  \n**Renamed session context directory to hidden `.session_context/` and fixed import path resolutions.**  \\n- ✅ Renamed `session_context/` → `.session_context/` (hidden, excluded from git)  \\n- ✅ Updated `.gitignore` to exclude `.session_context/` — session/context memory files now stored in hidden directory  \\n- ✅ Fixed import paths in `refactorCodeTools.ts` — removed `.js` extensions for proper Jest resolution  \\n- ✅ Fixed Babel traversal in `unusedImportsRule` — properly excludes import identifiers from usage detection using `getAncestry()` check  \\n- ✅ StateManager & ContextStorageManager updated to use `.session_context/` path consistently  \\n\n### [1.5.33] — 🏗️ Recode Tool Architecture & Modular Rule Engine  
**Implemented modular "Recode" tool architecture for AST-driven code transformations.**  \n- ✅ Created `src/tools/recodeTool/` with unified rule engine (`recodeEngine.ts`) supporting sequential rule application and dry-run diff output  \n- ⚠️ **Experimental/Placeholder**: `deadCodeDetection.ts` is currently a **single-file analyzer only**. Cross-directory scanning returns empty results (`{ deadExports: [] }`) and requires full project-wide integration. True "dead code" detection must account for cross-module imports to avoid false positives on exported symbols.  \n- ✅ Shared interfaces (`RuleContext`, `RuleResult`, `RecodeRule`) enable future plugins without coupling to core engine  \n- ✅ Updated Jest config with moduleNameMapper for RecodeTool module resolution — all tests pass  \n- ⏳ Pending: asyncModernizer, securityHardener rules (Tier 2 features)

> ⚠️ **GitHub Tools Require CLI**: Local Git operations (status, commit, diff) work without `gh`. Remote API operations (create issues, list PRs, push to origin) require `gh` installed and authenticated on your system.

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

### [1.6.0] — 🚀 Gateway Tools: Single Entry Point for Tool Discovery & Execution (2026-07-12)
**Introduced the Gateway Pattern to prevent LLM tool-bloat crashes and provide controlled access to all 111+ tools.**
- ✅ `explore_tools` — Discovers available tool categories without exposing all tools at once (prevents grammar parser crashes)
- ✅ `execute_gateway_tool` — Delegates execution to any registered tool by name with built-in validation
- ✅ Grammar parser crashes eliminated — Only 2 tools sent to llama.cpp initially instead of ~111
- ✅ AI workflow improved — Structured discovery → execution pattern prevents tool confusion
- ✅ Full functionality preserved — All tools still accessible via `execute_gateway_tool`
- ✅ Zero breaking changes — Existing tool registry and config system unchanged

### [1.5.32] — 🔧 `refactor_code` Babel Parser & Strict Type Hardening  
**Resolved Jest test failures and TypeScript strict mode violations in the AST refactoring engine.**  \n- ✅ Replaced dynamic `@babel/parser` import with static namespace import → eliminates Jest CJS/ESM interop errors, ensures parser availability across all environments  \n- ✅ Removed unused type imports, explicitly typed array fallbacks to prevent implicit `any[]` inference — zero ESLint/TS strict mode violations  \n- ✅ Fixed duplicate variable declaration (`resolvedTarget`) that caused SyntaxError at module load time  \n\n### [1.5.31] — 🐛 Session Persistence Fix & ESLint/TS Hardening  
**Resolved critical session summary data loss bug and cleaned up TypeScript strict mode violations.**  
- ✅ `save_session_summary` / `save_memory`: Added immediate disk write (`forceSave()`) to bypass 500ms debounce delay → summaries now persist across process exits and LM Studio context switches without data loss  
- ✅ `refactorCodeTools.ts`: Removed dead code (unused variables), fixed TS2322 type mismatches, properly scoped Babel typing directives — zero ESLint/TS errors  

### [1.5.30] — 🔧 `refactor_code` AST Modernization & ESLint Hardening  
**Upgraded the refactoring engine from a basic placeholder to a production-ready, Babel AST-driven tool.**  
- ✅ `extract_function`: Replaced fragile line-based string splitting with proper AST parsing → no more syntax errors on partial constructs  
- ✅ `move_function`: Now supports Arrow Functions (`const fn = async () => {}`), Class Methods, and Variable Declarations (was: only FunctionDeclaration/Expression)  
- ✅ ESLint cleanup: Removed redundant `eslint-disable-line` comments; consolidated global file-level disable blocks for Babel's dynamic typing  
- ⚠️ Schema update: `extraction_lines` parameter deprecated — pass extracted code via `old_name` instead  

### [1.5.29] — 🔥 Major Performance Optimization Suite (P0–P3)
**Comprehensive overhaul targeting disk I/O reduction, cache utilization, and event-loop contention.**
- ✅ P0: Debounced state saves (`_queueSave()` with 500ms coalescing → ~90% fewer writes during bulk ops)
- ✅ P0: Key cache with invalidation (`getAllKeys()` O(1) cache hit vs. O(n) disk reads, 1s TTL + auto-invalidate on mutation)
- ✅ P1: Conditional logging via `AI_TOOLBOX_DEBUG` env var (~80% less stderr I/O in production)
- ✅ P1: Pre-resolved module imports in constructor (eliminates 5–10ms per-flush dynamic import overhead)
- ✅ P2: Size estimation cache for complex objects (`JSON.stringify()` memoization via `sizeValueCache`)
- ✅ P2: Project path TTL cache (5s staleness check on `getProjectMemoryFilePath()`, eliminates duplicate `fs.stat()`)
- ✅ P3: LRU fuzzy search cache (delete + re-insert on access; Map order ensures oldest entries evicted)
- ✅ Zero breaking changes. 369 tests pass, TypeScript/ESLint clean, build succeeds.

### [1.5.28] — `refactor_code` Full AST-Based `extract_function` Implementation

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
| `archiver` | ^8.0.0 | ZIP archive creation |
| `unzipper` | ^0.12.3 | ZIP extraction |
| `zod` | ^3.25.0 | Runtime type validation |

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
