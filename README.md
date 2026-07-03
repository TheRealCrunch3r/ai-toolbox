# 🧰 AI Toolbox — LM Studio Plugin

> **108 tools** across 17 core categories identified in current source code.

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

### Git & GitHub (15 tools)
`git_status` · `git_diff` · `git_commit` · `git_log` · `git_add` · `git_checkout` · `gh_auth` · `gh_create_issue` · `gh_list_issues` · `gh_view_comments` · `gh_create_pr` · `gh_list_prs` · `gh_view_pr_diff` · `gh_push` · `git_stash` · `git_blame`

### Database (1 tool)
`query_database`

### Background Commands (3 tools)
`run_background_command` · `check_background_command` · `cancel_background_command`

### Execution (5 tools)
`run_javascript` · `run_python` · `execute_command` · `run_in_terminal` · `run_tests`

### Utilities (~29 tools)
`save_memory` · `get_system_info` · `read_clipboard` · `write_clipboard` · `send_notification` · `findLMStudioHome` · `get_enabled_tools` · `system_monitor` · `process_list` · `env_inspect` · `hash_file` · `token_count` · `convert_format` · `secret_scan` · `port_check` · `package_manage` · `detect_os_environment` · `json_query` · `env_update` · `get_current_working_directory` · `markdown_table_gen` · `refactor_code`

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

---

## 🚀 Quick Start

### Installation

The plugin is installed as an LM Studio plugin. Ensure you have:

- **LM Studio** (latest version)
- **Node.js 20+** installed on your system

### First Use

1. **Load the plugin** in LM Studio's plugin settings
2. **Configure tool access** — individual tool categories can be toggled on/off via the Settings panel. Note that some tools (like Execution) are disabled by default for security.
3. **Start a chat** and the LLM can now use any of the ~108 available tools.

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

*(See existing history in CHANGELOG.md)*

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
