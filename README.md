# 🧰 AI Toolbox — LM Studio Plugin

> ****116 tools** / **Total: 116** (context-aware replacement handled below per file)** across 15 core categories, fully integrated and ready for use.  
> **116 tools** across ~20 core categories, fully integrated and ready for use.  
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

---

## 🗂️ Tool Categories

### File System Tools (22 tools — enabled by default)
`list_directory` · `read_file` · `read_file_chunked` · `save_file` · `replace_text_in_file` · `insert_at_line` · `append_file` · `delete_lines_in_file` · `make_directory` · `move_file` · `copy_file` · `delete_path` · `delete_files_by_pattern` · `find_files` · `fuzzy_find_local_files` · `get_file_metadata` · `change_directory` · `analyze_project` · `file_diff` · `directory_tree` · `grep_files` · `find_replace_all`

### Web Research Tools (4 tools — enabled by default)
`web_search` · `wikipedia_search` · `fetch_web_content` · `rag_web_content`

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

### Vector RAG / Semantic Search (4 tools — enabled by default)
`rag_index_files` · `rag_query_vector` · `rag_clear_index` · `rag_web_content`

### UI Generation Tools (3 tools — disabled by default)
`generate_ui_component` · `render_and_preview_ui` · `extract_ui_data`

### Context Management Tools (12 tools — enabled by default)
`auto_summarize_context` · `get_context_memory` · `search_context` · `context_summary` · `delete_context_entry` · `clear_context_memory` · `track_important_event` · `save_session_summary` · `get_session_summary` · `save_memory` · `get_memory` · `delete_memory`

### Text Processing Tools (4 tools — enabled by default)
`text_transform` · `text_extract` · `line_operations` · `markdown_table_gen`

### AST Code Refactoring Tools (2 tools — enabled by default)
`refactor_code` · `unusedImports`

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
4. **Start a chat** and the AI can now use any of the **116** available tools based on configuration settings.

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

### [1.6.4] - 2026-07-14 — 🔒 Strict Typing & Config Resolution Hardening
**Eliminated all `any` type usage and fixed config resolution for ParsedConfig wrapper.**
- ✅ **Strict typing policy enforced**: Replaced all `z.any()` with `z.unknown()` in Zod schemas
- ✅ **Removed non-null assertions**: Replaced `latest.timestamp!` with `latest.timestamp ?? 0`
- ✅ **Fixed config resolution**: Constructed proper `PluginConfig` object from `.get()` calls instead of direct property access on `ParsedConfig` wrapper
- ✅ **Eliminated AST parser type mismatch**: Applied safe `as unknown as` double-cast for `@typescript-eslint/parser` return type
- ✅ **Lint & typecheck clean**: Zero ESLint errors, zero TypeScript errors, 371/371 tests passing

### [1.6.2] - 2026-07-14 — 🛠️ Utility Tools Registration & Cleanup
**Registered 8 new utility tools and removed orphaned gateway pattern code.**
- ✅ Registered `backupTools` (create_backup, list_backups, restore_backup, delete_backup)
- ✅ Registered `cleanupBackupsTool` (cleanup_backups)
- ✅ Registered `dataVisualizationTools` (generate_chart)
- ✅ Registered `lineOperations` (delete_lines)
- ✅ Registered `markdownPreviewTools` (markdown_preview)
- ✅ Added `utility` config toggle to enable/disable all utility tools
- ❌ Deleted `gatewayTools.ts`, `devOpsTools.ts`, `gitHubTools.ts` (dead code)
- 🐛 Fixed: Added missing `markdown-it` dependency for markdown preview tool

### [1.6.0] — 🚀 Gateway Tools: Single Entry Point for Tool Discovery & Execution (2026-07-12)
**Introduced the Gateway Pattern to prevent LLM tool-bloat crashes and provide controlled access to all registered tools.**
- ✅ `explore_tools` — Discovers available tool categories without exposing all tools at once (prevents grammar parser crashes)
- ✅ `execute_gateway_tool` — Delegates execution to any registered tool by name with built-in validation
- ⚠️ **Note**: Tool files (`gatewayTools.ts`) exist but are NOT yet imported/registered in `toolsProvider.ts`. Full integration pending.

### [1.5.39] - 2026-07-10 — 🔧 Grammar Parser Fix: Production Deployment & Debug Cleanup
**Resolved critical grammar parser failure in production — tool count capping now enforced at 25 tools (was 50), minifier properly wired up.**

### [1.5.37] - 2026-07-10 — 🔧 Grammar Parser Hardening & ContextGuard SDK Defensive Fixes
**Resolved critical grammar parser failure and added defensive error handling for SDK token counting.**

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
