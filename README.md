# 🧰 AI Toolbox — LM Studio Plugin

> **101 tools** across 16 categories: file system, web research, browser automation, Git/GitHub, database, document parsing, background commands, code execution, utilities, image processing, HTTP client, vector RAG, text processing, interactive UI generation, auto-context management, and backup & restore.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tool Categories](#-tool-categories)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Security](#-security)
- [Architecture](#-architecture)
- [Development](#-development)
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
3. **Start a chat** and the LLM can now use any of the 101 tools

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

### Safe Edit Workflow (v1.5.11+)

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

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
