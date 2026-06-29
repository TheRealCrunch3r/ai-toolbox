# 🧰 AI Toolbox — LM Studio Plugin

> **109 tools** across 17 categories: file system, web research, browser automation, Git/GitHub, database, document parsing, background commands, code execution, utilities, image processing, HTTP client, vector RAG, text processing, interactive UI generation, auto-context management, backup & restore, and line operations.

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
| 📁 **File System** | Read, write, search, and manage files with path validation |
| 🌐 **Web Research** | Multi-engine search (DDG, Google, Bing) with automatic fallback |
| 🖥️ **Browser Automation** | Headless Puppeteer browser with persistent sessions |
| 🐙 **Git & GitHub** | Full Git operations + GitHub API integration |
| 🗄️ **Database** | Read-only SQLite queries with SQL validation |
| ⏳ **Background Commands** | Long-running process management |
| ⚡ **Code Execution** | Sandboxed JS/Python + full shell commands (pipes, redirects, env vars) |
| 🔧 **Utilities** | Clipboard, notifications, system info, memory, session summaries for cross-session continuity |
| 🖼️ **Image Processing** | OCR (Tesseract.js), screenshots (Win32 API), image comparison (JPEG/BMP/PNG via Sharp) |
| 🔌 **HTTP Client** | REST API client with SSRF protection |
| 📊 **Vector RAG** | Semantic search with local embeddings, persistent state, web content fetching |
| 📚 **Document Parsing** | Chat with attached files or disk paths (PDF, DOCX, TXT) |
| 📝 **Text Processing** | Regex substitutions (`text_transform`), field extraction from delimited files (`text_extract`), line insert/delete/move operations (`line_operations`) - sed/awk-like functionality without shell dependencies |
| 🎨 **Interactive UI Generation** | Generate and render HTML/CSS/JS components (buttons, forms, charts, dashboards) |
| 💾 **Backup & Restore** | Create compressed ZIP backups of plugin state with path traversal protection |
| 🧠 **Auto-Context Management** | Automatic session tracking, decision logging, and persistent memory retrieval |

---

## 🗂️ Tool Categories

### File System (21 tools)
`list_directory` · `read_file` · `save_file` · `replace_text_in_file` · `insert_at_line` · `append_file` · `delete_lines_in_file` · `make_directory` · `move_file` · `copy_file` · `delete_path` · `delete_files_by_pattern` · `find_files` · `fuzzy_find_local_files` · `get_file_metadata` · `change_directory` · `analyze_project` · `file_diff` · `directory_tree` · `grep_files`

### Web Research (4 tools)
`web_search` · `wikipedia_search` · `fetch_web_content` · `rag_web_content`

### Browser Automation (5 tools)
`browser_open_page` · `browser_session_control` · `browser_session_close` · `preview_html` · `open_file`

### Git & GitHub (13 tools)
`git_status` · `git_diff` · `git_commit` · `git_log` · `git_add` · `git_checkout` · `gh_create_issue` · `gh_list_issues` · `gh_view_comments` · `gh_create_pr` · `gh_list_prs` · `gh_view_pr_diff` · `gh_push`

### Database (1 tool)
`query_database`

### Document Parsing (1 tool)
`read_document`

### Background Commands (3 tools)
`run_background_command` · `check_background_command` · `cancel_background_command`

### Execution (5 tools)
`run_javascript` · `run_python` · `execute_command` · `run_in_terminal` · `run_tests`

### Utilities (28 tools)
`save_memory` · `get_memory` · `search_memory` · `delete_memory` · `save_session_summary` · `get_session_summary` · `get_system_info` · `read_clipboard` · `write_clipboard` · `send_notification` · `findLMStudioHome` · `get_enabled_tools` · `system_monitor` · `process_list` · `env_inspect` · `hash_file` · `token_count` · `convert_format` · `secret_scan` · `port_check` · `package_manage` · `detect_os_environment` · `get_current_working_directory`

> **💡 Session Summary Compression (v1.5.15+):**  
> Session summaries are now automatically compressed using `zlib.gzipSync(level: 9)` before storage, bypassing LM Studio's 10k character SDK parameter limit while reducing token consumption by ~30%. Legacy uncompressed summaries continue to work seamlessly via backward-compatible fallback parser.

### Image Processing (4 tools)
`image_to_text` · `describe_image` · `screenshot_desktop` · `compare_images`

### HTTP Client (3 tools)
`http_request` · `http_get_json` · `http_post_json`

### Vector RAG (4 tools)
`rag_index_files` · `rag_query_vector` · `rag_clear_index` · `rag_web_content`

### Text Processing (3 tools)
`text_transform` · `text_extract` · `line_operations`

### Interactive UI Generation (3 tools)
`generate_ui_component` · `render_and_preview_ui` · `extract_ui_data`

### Auto-Context Management (7 tools)
`auto_summarize_context` · `get_context_memory` · `search_context` · `context_summary` · `delete_context_entry` · `track_important_event` · `clear_context_memory`

### Backup & Restore (4 tools)
`create_backup` · `list_backups` · `restore_backup` · `delete_backup`

---

## 🚀 Quick Start

### Installation

The plugin is installed as an LM Studio plugin. Ensure you have:

- **LM Studio** (latest version)
- **Node.js 20+** installed on your system

### First Use

1. **Load the plugin** in LM Studio's plugin settings
2. **Configure tool access** — individual tool categories can be toggled on/off
3. **Start a chat** and the LLM can now use any of the 109 tools

### Example: Search the Web

The LLM can call the `web_search` tool:
```
Tool: web_search
Params: { "query": "latest TypeScript features 2025" }
```

### Example: Read a File

```
Tool: read_file
Params: { "file_name": "src/index.ts", "max_length": 5000 }
```

### Example: Change Working Directory

```
Tool: change_directory
Params: { "directory": "C:\\Projects\\my-app" }
```

---

## ⚙️ Configuration

All settings are accessible through LM Studio's plugin settings panel.

### Tool Gating

| Setting | Default | Description |
|---------|---------|-------------|
| `godMode` | `false` | ⚠️ Enables ALL tools at once |
| `fileSystem` | `true` | File read/write/search operations |
| `webSearch` | `true` | Web research tools |
| `browserAutomation` | `false` | Headless browser control & automation |
| `gitOperations` | `false` | Git operations and GitHub API access |
| `databaseQueries` | `false` | Read-only SQLite queries |
| `documentParsing` | `true` | PDF/DOCX document reading |
| `backgroundCommands` | `false` | Long-running process tracking |
| `imageProcessing` | `true` | Image OCR, screenshot, and comparison tools |
| `httpClient` | `false` | Generic REST API client |
| `vectorRAG` | `true` | Semantic search with vector embeddings |
| `uiGeneration` | `false` | Interactive UI generation and rendering tools |
| `contextManagement` | `true` | Automatic context tracking and memory management |
| `textProcessing` | `true` | Text processing tools (sed/awk equivalents) |

### Execution Tools

All execution tools are disabled by default for security:

| Setting | Default | Description |
|---------|---------|-------------|
| `executionJavaScript` | `false` | Allow run_javascript tool |
| `executionPython` | `false` | Allow run_python tool |
| `executionTerminal` | `false` | Allow run_in_terminal tool |
| `executionShell` | `false` | Allow execute_command tool |

### Search Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `searchFallbackChain` | `ddg-api` | Primary search engine (auto-fallback to others) |
| `maxSearchResults` | `10` | Maximum number of results per query |
| `safesearch` | `1` | Safe search filter: 0=Off, 1=Moderate, 2=Strict |

### Browser Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `browserTimeout` | `5000` | Maximum time (ms) to wait for browser operations |
| `headlessMode` | `false` | Run browser without GUI |

### Document RAG Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `documentRAG` | `true` | Enable file indexing and semantic search for chat |
| `retrievalLimit` | `5` | Maximum number of relevant chunks to retrieve |
| `retrievalAffinityThreshold` | `0.5` | Minimum similarity score (0-1) for relevance |

### Security Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `pathValidationEnabled` | `true` | Prevent directory traversal attacks |
| `binaryFileDetection` | `true` | Detect binary files via null byte check |
| `regexReDoSProtection` | `true` | Protect against regex denial-of-service |

### ContextGuard Settings

| Setting Name | Type | Default | Description |
|--------------|------|---------|-------------|
| `contextGuardEnabled` | `boolean` | `true` | Enable the ContextGuard module. |
| `contextGuardTokenLimit` | `number` | `30,000` | The maximum token count before compression triggers (90% threshold). |
| `contextGuardSmartReading` | `boolean` | `true` | Enable heuristic keyword-grep for file reads. |
| `contextGuardSummaryModel` | `string` | `""` (current chat model) | The model used to summarize older history. |
| `contextGuardTerminalFilterEnabled` | `boolean` | `true` | Auto-truncates long terminal outputs to save tokens. |
| `contextGuardTerminalFilterLength` | `number` | `2,000` | Max characters before terminal output is truncated. |

### Auto-Tracking Settings

| Setting Name | Type | Default | Description |
|--------------|------|---------|-------------|
| `autoTrackingEnabled` | `boolean` | `true` | Automatically tracks decisions, completions, and bug fixes in the background. |
| `autoTrackTokenThreshold` | `number` | `75` | Trigger session memory save when token usage reaches this percentage (default: 75%). |
| `autoTrackDecisions` | `boolean` | `true` | Auto-track decisions and conclusions ("I decided", "conclusion") |
| `autoTrackCompletions` | `boolean` | `true` | Auto-track task completions ("successfully completed", "finished") |
| `autoTrackErrors` | `boolean` | `true` | Auto-track bug fixes and error resolutions ("fixed the bug") |
| `autoSummaryInterval` | `number` | `50` | Messages between automatic session summaries |

---

## 🔒 Security

Comprehensive documentation of security features, threat models, and responsible disclosure for the AI Toolbox plugin. See [SECURITY.md](SECURITY.md) for details.

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
npm install
npm run build
```

### Safe Edit Workflow (v1.5.12+)

Prevent file corruption during LLM-assisted editing with our backup-first strategy:

```bash
# 1. Backup before editing:
node scripts/safe_edit.js backup src/index.ts

# 2. Make your edits...

# 3. Verify after editing:
node scripts/safe_edit.js verify src/index.ts

# 4. Remove backups when satisfied:
node scripts/safe_edit.js cleanup --keep=0
```

📖 **Full Guide:** See [SAFE_EDIT_GUIDE.md](./SAFE_EDIT_GUIDE.md) for complete workflow details, decision trees, and emergency recovery procedures.

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@lmstudio/sdk` | ^1.5.0 | Core SDK for LM Studio plugin development |
| `@dqbd/tiktoken` | ^1.0.22 | Accurate token counting for ContextGuard |
| `puppeteer` | ^24.0.0 | Browser automation |
| `simple-git` | ^3.22.0 | Git operations |
| `sharp` | ^0.33.5 | Image processing |
| `tesseract.js` | ^7.0.0 | OCR engine |
| `pdf-parse` | ^1.1.1 | PDF document parsing |
| `mammoth` | ^1.6.0 | DOCX document parsing |
| `archiver` | ^8.0.0 | ZIP archive creation |
| `unzipper` | ^0.12.3 | ZIP extraction |
| `zod` | ^3.25.0 | Runtime type validation |

---

## 📜 Release History

### v1.5.20 — `grep_files` AST Mode Fallback Fix (2026-06-29)

**Fixed 3 failing AST mode tests caused by missing `regex` parameter in AST fallback path.**

When `mode: 'ast'` was used with `grep_files` and AST parsing failed (e.g., for invalid TypeScript), the fallback to regex mode crashed silently due to a missing `regex` parameter being passed to `processWithRegex()`. The fix passes the pre-validated regex variable, enabling proper fallback behavior.

- `grep_files` (fileSystemTools.ts) — AST fallback now correctly passes regex parameter
- All 19/19 tests now pass (3 previously failing AST mode tests)

---

### v1.5.19 — Windows CRLF Line Ending Preservation Fix (2026-06-28)

**Fixed silent line ending corruption across 5 file-modifying tools on Windows systems.**

All tools that split file content into lines (`insert_at_line`, `delete_lines_in_file`, `text_transform` line-range mode, `line_operations`, `delete_lines`) now detect `\r\n` (CRLF) before splitting and preserve it on output. Files with Windows-style line endings are no longer silently converted to LF.

- `insert_at_line` — CRLF preserved on insert
- `delete_lines_in_file` — CRLF preserved on delete
- `text_transform` (line-range mode) — CRLF preserved when using `lines` parameter
- `line_operations` — CRLF preserved on insert/delete/move
- `delete_lines` — CRLF preserved on delete

**Total**: 10 code changes across 3 files, zero breaking changes.

---

### v1.5.18 — Cross-Platform Test Fix & AutoTracker FSM Logic Correction (2026-06-27)

**Fixed `grep_files` test path separator normalization and corrected AutoTracker FSM re-trigger logic.**

#### What Changed
- **Test Isolation**: Updated `tests/grep_files.test.ts` assertions to normalize Windows backslashes (`\`) to forward slashes (`/`) before comparison, ensuring reliable cross-platform test execution.
- **AutoTracker FSM Fix**: Removed incorrect state re-evaluation block in `src/autoTracker.ts` `checkTokenThreshold()`. The method now correctly returns `true` *only* during the initial IDLE → THRESHOLD_REACHED transition, preventing duplicate checkpoint prompts and redundant memory saves.

---

### v1.5.15 — Session Summary Compression & Token Savings (2026-06-22)

**Session summaries now use `zlib.gzipSync()` compression to bypass the 10k SDK parameter limit and reduce token consumption by ~30%.**

#### What Changed
- Added zlib compression to `save_session_summary` — JSON payload is gzipped (level 9) before base64 encoding
- Added decompression logic to `get_session_summary` with backward-compatible fallback for legacy uncompressed summaries
- Fixed ESLint errors: removed unnecessary `await` from void-returning `stateManager.set()`, added type narrowing, fixed try-catch structure

#### Why This Matters
LM Studio's SDK enforces a 10k character limit on tool parameters. Session summaries containing large amounts of context (accomplishments, pending tasks, decisions) would fail to save when exceeding this limit — even though the actual content was valid JSON well under any reasonable size constraint. The limitation applied at the transport layer, not storage capacity.

#### Compression Statistics
| Payload Size | Compressed Size | Reduction | Storage Format |
|--------------|-----------------|-----------|----------------|
| ~1,600 chars (small summary) | ~1,200 chars | **26%** | Base64-encoded gzip stream |
| ~2,500 chars (large summary) | ~1,800 chars | **30%** | Base64-encoded gzip stream |

**Estimated for 25k+ char summaries:** Would compress to ~7.5–12.5k characters — well within the SDK limit while preserving all original content perfectly.

#### Backward Compatibility
- Legacy uncompressed summaries (saved before v1.5.15) continue to work seamlessly via fallback parser
- The fallback checks if data starts with `{` and attempts direct `JSON.parse()` instead of decompression
- Error messages clearly distinguish between legacy parsing failures and corrupted data

---

### v1.5.14 — Test Isolation Fix for StateManager getAllKeys() (2026-06-20)

**`getAllKeys()` now correctly respects the `statePersistenceEnabled` configuration flag.**

#### What Changed
- Fixed `src/stateManager.ts` `getAllKeys()` to skip disk reload when `persistenceEnabled === false`
- Previously, `getAllKeys()` unconditionally reloaded from disk on every call — even in tests where persistence was disabled — causing stale data contamination from previous runs
- Now returns in-memory keys directly when persistence is off (test isolation), while still reloading from disk when persistence is enabled (handles working directory changes mid-session)

#### Why This Matters
Before this fix, running `getAllKeys()` after calling `clear()` would immediately reload any `.ai_toolbox_memory.msgpack` file left on disk from a previous session — making tests fail and breaking test isolation. The fix ensures the method behaves correctly based on the actual persistence configuration rather than always touching the filesystem.

**Total**: 1-line guard added in `getAllKeys()`, zero breaking changes, backward compatible.

---

### v1.5.13 — Jest moduleNameMapper Regex Fix (2026-06-20)

**Test suite now passes after fixing MODULE_NOT_FOUND errors for dynamically imported tool modules.**

#### What Changed
- Fixed all tool module dynamic import patterns in `jest.config.cjs` from two-dot to single-dot regex matching
- Removed conflicting ESM config file (`jest.config.js`)
- Added missing module mappings and fallback catch-all rule

---

### v1.5.12 — Session Summary Persistence Fix (2026-06-20)

**Critical🔥 Session summary tool now correctly saves data to the current working directory, even if directories are changed mid-session via `change_directory`.**

#### What Changed
- **Fixed**: `src/stateManager.ts` re-evaluates memory file path on every write via `getMemoryFilePath()` in the `saveToFile()` method (line ~340)
- Added single line: `this.memoryFile = await getMemoryFilePath();` at start of `saveToFile()`

#### Why This Matters
Before this fix, StateManager captured its target file path only once during initialization. If you ran `change_directory` mid-session to switch from the plugin root to a workspace directory, all subsequent saves (including session summaries) would silently land in the old location — meaning data appeared "lost" when checking the current working directory's filesystem directly.

#### How It Works
```typescript
// src/stateManager.ts (AFTER fix)
private async saveToFile(): Promise<void> {
  try {
    // 🔥 ** Re-resolve memory file path on EVERY save 
    this.memoryFile = await getMemoryFilePath(); 
    
    const data = Array.from(this.state.entries()).map(([_key, entry]) => ({...}));
    // ... rest of method
  }
}
```

**Total**: 1-line fix in zero breaking changes. Back `stateManager.ts`, zero breaking changes.

---

### v1.5.11 — Explicit Rollback Pattern (2026-06-19)

All file-editing tools now include automatic .bak rollback on atomic write failure:
- **Fixed**: `replace_text_in_file` — automatic restore from `.bak` backup if atomic write fails
- **Fixed**: `insert_at_line` — same rollback pattern applied
- **Fixed**: `append_file` — same rollback pattern applied
- **Fixed**: `delete_lines_in_file` — same rollback pattern applied

---

### v1.5.10 — Text Transformation Tools Security Hardening (2026-06-18)

All text transformation tools now include comprehensive safety features:
- ✅ Binary file detection (null byte check in first 8KB)
- ✅ File size limits (10MB maximum)
- ✅ Atomic writes (temp file + rename pattern)
- ✅ Optional backup mechanism (.bak files)
- ✅ Parameter validation (non-empty strings, max sizes)

---

### v1.5.9 — Auto-Track Token Threshold System (2026-06-18)

Automatic session memory saving when context window approaches capacity:
- **Auto-tracking enabled by default**: `autoTrackingEnabled` changed from `false` → `true`
- **Configurable token threshold**: New `autoTrackTokenThreshold` setting (default: 75%) triggers automatic session memory save
- **Full auto-save implementation** (now msgpack since v1.5.7): Added `checkAndSaveTokenThreshold()` and `autoSaveSessionMemory()` methods

---

### v1.5.0 — Major101 tools across 16 categories:
- File system operations
- Web research and browser automation
- Git/GitHub integration
- Text processing utilities
- System monitoring and diagnostics

📖 **Full Changelog:** See [CHANGELOG.md](./CHANGELOG.md) for all release details.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
