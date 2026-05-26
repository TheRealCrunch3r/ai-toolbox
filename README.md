# 🧰 AI Toolbox — LM Studio Plugin

> **80 tools** across 14 categories: file system, web research, browser automation, Git/GitHub, database, document parsing, background commands, code execution, utilities, image processing, HTTP client, vector RAG, interactive UI generation, and auto-context management.

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
| 🔧 **Utilities** | Clipboard, notifications, system info, memory |
| 🖼️ **Image Processing** | OCR (Tesseract.js), screenshots (Win32 API), image comparison (JPEG/BMP/PNG via Sharp) |
| 🔌 **HTTP Client** | REST API client with SSRF protection |
| 📊 **Vector RAG** | Semantic search with local embeddings |
| 📚 **Document RAG** | Chat with attached files or disk paths (PDF, DOCX, TXT) |
| 🎨 **Interactive UI Generation** | Generate and render HTML/CSS/JS components (buttons, forms, charts, dashboards) |
| 🧠 **Auto-Context Management** | Automatic session tracking, decision logging, and persistent memory retrieval |
| ⏰ **Temporal Awareness** | Injects current date/time into every message for accurate time-sensitive tasks (merged from `up_to_date`) |

---

## 🗂️ Tool Categories

### File System (17 tools)
`list_directory` · `read_file` · `save_file` · `replace_text_in_file` · `insert_at_line` · `append_file` · `delete_lines_in_file` · `make_directory` · `move_file` · `copy_file` · `delete_path` · `delete_files_by_pattern` · `find_files` · `fuzzy_find_local_files` · `get_file_metadata` · `change_directory`

### Web Research (4 tools)
`web_search` · `wikipedia_search` · `fetch_web_content` · `rag_web_content`

### Browser Automation (5 tools)
`browser_open_page` · `browser_session_control` · `browser_session_close` · `preview_html` · `open_file`

### Git & GitHub (14 tools)
`git_status` · `git_diff` · `git_commit` · `git_log` · `git_add` · `git_checkout` · `gh_auth` · `gh_create_issue` · `gh_list_issues` · `gh_view_comments` · `gh_create_pr` · `gh_list_prs` · `gh_view_pr_diff` · `gh_push`

### Database (1 tool)
`query_database`

### Document Parsing (1 tool)
`read_document`

### Background Commands (3 tools)
`run_background_command` · `check_background_command` · `cancel_background_command`

### Execution (4 tools)
`run_javascript` · `run_python` · `execute_command` · `run_in_terminal`

### Utilities (7 tools)
`save_memory` · `get_system_info` · `read_clipboard` · `write_clipboard` · `send_notification` · `findLMStudioHome` · `get_enabled_tools`

### Image Processing (4 tools)
`image_to_text` · `describe_image` · `screenshot_desktop` · `compare_images`

### HTTP Client (3 tools)
`http_request` · `http_get_json` · `http_post_json`

### Vector RAG (3 tools)
`rag_index_files` · `rag_query_vector` · `rag_clear_index`

### Interactive UI Generation (3 tools)
`generate_ui_component` · `render_and_preview_ui` · `extract_ui_data`

### Auto-Context Management (7 tools)
`auto_summarize_context` · `get_context_memory` · `search_context` · `context_summary` · `delete_context_entry` · `track_important_event` · `clear_context_memory`

---

## 🚀 Quick Start

### Installation

The plugin is installed as an LM Studio plugin. Ensure you have:

- **LM Studio** (latest version)
- **Node.js 20+** installed on your system

### First Use

1. **Load the plugin** in LM Studio's plugin settings
2. **Configure tool access** — individual tool categories can be toggled on/off
3. **Start a chat** and the LLM can now use any of the 54+ tools

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
| `webSearch` | `true` | DuckDuckGo/Wikipedia search |
| `browserAutomation` | `false` | Puppeteer headless browser |
| `gitOperations` | `false` | Git + GitHub API access |
| `databaseQueries` | `false` | Read-only SQLite queries |
| `documentParsing` | `true` | PDF/DOCX document reading |
| `backgroundCommands` | `false` | Long-running process tracking |
| `imageProcessing` | `true` | OCR, screenshots, comparison |
| `httpClient` | `false` | Generic REST API client |
| `vectorRAG` | `true` | Semantic search with embeddings |
| `uiGeneration` | `false` | Interactive UI generation tools |
| `contextManagement` | `true` | Auto-context tracking and memory management |

### Execution Tools (disabled by default ⚠️)

| Setting | Default | Description |
|---------|---------|-------------|
| `executionJavaScript` | `false` | Allow `run_javascript` |
| `executionPython` | `false` | Allow `run_python` |
| `executionTerminal` | `false` | Allow `run_in_terminal` |
| `executionShell` | `false` | Allow `execute_command` |

### Search Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `searchFallbackChain` | `ddg-api` | Primary search engine |
| `maxSearchResults` | `10` | Max results per search |
| `safesearch` | `1` | Safe search level (0-2) |

### Document RAG

| Setting | Default | Description |
|---------|---------|-------------|
| `documentRAG` | `false` | Enable Chat with Files |
| `retrievalLimit` | `5` | Max chunks per query |
| `retrievalAffinityThreshold` | `0.5` | Min similarity score (0-1) |

### Browser Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `browserTimeout` | `5000` | Browser operation timeout (ms) |
| `headlessMode` | `true` | Run browser without GUI |

### Security Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `pathValidationEnabled` | `true` | Prevent directory traversal |
| `binaryFileDetection` | `true` | Detect binary files |
| `regexReDoSProtection` | `true` | Protect against ReDoS |
| `maxRegexLength` | `500` | Max regex pattern length |

### Other Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `language` | `en` | UI language (en/de/zh-CN/zh-TW) |
| `notificationsEnabled` | `true` | Desktop notifications |
| `statePersistenceEnabled` | `true` | Persist state between sessions |
| `stateMaxSize` | `10240` | Max state size in bytes |

### Temporal Awareness (merged from `up_to_date`)

| Setting | Default | Description |\n|---------|---------|-------------|\n| `temporalAwareness` | `true` | Inject current date/time into every message |\n| `dateFormatStyle` | `standard` | Format style: `standard` ([Zeit: ...]) or `heuteIst` (HEUTE IST Mode) |

---

## 🔒 Security

The plugin uses a **2-Layer Command Sanitization Pipeline** to prevent dangerous operations and enforce tool-category toggles:
1. **Layer 1**: Blocks dangerous patterns (`rm -rf`, `sudo`, injection, etc.)
2. **Layer 2 (S6)**: Classifies commands by tool category (e.g., `duckduckgo` → Web Search) and blocks them if the category is disabled in config (bypassed only by God Mode).

Additional protections include path containment, binary file detection, SQL validation, and JavaScript sandboxing.

### SQL Validation
Database queries are restricted to `SELECT` and `PRAGMA` statements only. Dangerous keywords (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `CREATE`) are blocked.

### SSRF Protection
HTTP client tools block requests to:
- Private IP ranges (127.x, 10.x, 172.16-31.x, 192.168.x)
- `file:` and `data:` protocols
- localhost

### Code Sandboxing
JavaScript and Python execution tools block dangerous imports:
- **JS**: `require()`, `eval()`, `fs`, `child_process`, `Function()`
- **Python**: `os`, `subprocess`, `shutil`, `__import__()`, `eval()`, `exec()`

### ReDoS Protection
Regex patterns are analyzed for dangerous structures (nested quantifiers, repetition of repetition, alternation with repetition).

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LM Studio Plugin                      │
│                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │   index.ts   │───▶│toolsProvider │───▶│ToolRegistry│ │
│  │  (entry pt)  │    │   (factory)  │    │  (central) │ │
│  └─────────────┘    └──────────────┘    └─────┬──────┘ │
│                                               │        │
│    ┌──────────────────────────────────────────┼────────┐│
│    │              Tool Modules                │        ││
│    │  ┌──────────┐  ┌──────────┐  ┌────────┐ │        ││
│    │  │fileSystem│  │webSearch │  │browser │ │        ││
│    │  │  (18)    │  │  (4)     │  │ (5)    │ │        ││
│    │  └──────────┘  └──────────┘  └────────┘ │        ││
│    │  ┌──────────┐  ┌──────────┐  ┌────────┐ │        ││
│    │  │    git   │  │database  │  │execution│ │        ││
│    │  │  (13)    │  │  (1)     │  │  (4)   │ │        ││
│    │  └──────────┘  └──────────┘  └────────┘ │        ││
│    │  ┌──────────┐  ┌──────────┐  ┌────────┐ │        ││
│    │  │  utility │  │   image  │  │  http  │ │        ││
│    │  │  (7)     │  │  (4)     │  │  (3)   │ │        ││
│    │  └──────────┘  └──────────┘  └────────┘ │        ││
│    │  ┌──────────┐  ┌──────────┐  ┌────────┐ │        ││
│    │  │backgndCmd│  │ vectorRAG│  │   UI   │ │        ││
│    │  │  (3)     │  │  (3)     │  │ Gen(3) │ │        ││
│    │  └──────────┘  └──────────┘  └────────┘ │        ││
│    │  ┌──────────┐                          │        ││
│    │  │ Context  │                          │        ││
│    │  │ Mgmt(6)  │                          │        ││
│    │  └──────────┘                          │        ││
│    └──────────────────────────────────────────┴────────┘│
│                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │  config.ts   │    │  security.ts │    │stateManager│ │
│  │ (Zod schema) │    │  (validators)│    │ (persistence│ │
│  └─────────────┘    └──────────────┘    │  JSON file) │ │
│                                         └────────────┘ │
│                                                         │
│  ┌──────────────┐    ┌───────────────┐                  │
│  │promptPreproc │    │performanceUtils│                  │
│  │(Document RAG)│    │(caching, async)│                  │
│  └──────────────┘    └───────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### Key Design Patterns

- **Singleton** — `BrowserSessionManager` for Puppeteer browser reuse
- **Lazy Loading** — Heavy dependencies (Puppeteer, Tesseract, SQLite) loaded on first use
- **Tool Registry** — Central `ToolRegistry` class manages all tool instances
- **Debounced Persistence** — State saved to disk with 500ms debounce
- **Caching** — Fuzzy search results and web requests cached with TTL
- **Async Concurrency** — File searches use batched async operations

---

## 🛠️ Development

### Prerequisites

- Node.js 20+
- TypeScript 5.9+

### Setup

```bash
npm install
```

### Build

```bash
npm run build          # Build with tsup
npm run typecheck      # TypeScript type checking
npm run lint           # ESLint
npm run lint:fix       # ESLint auto-fix
```

### Test

```bash
npm test               # Run Jest tests
```

### Project Structure

```
ai_toolbox/
├── src/
│   ├── index.ts                 # Plugin entry point
│   ├── toolsProvider.ts         # Tool registration factory
│   ├── config.ts                # Zod schema + UI schematics
│   ├── security.ts              # Path/SQL/command validators
│   ├── stateManager.ts          # Persistent state management
│   ├── workingDir.ts            # Working directory manager
│   ├── performanceUtils.ts      # Caching, async search, Levenshtein
│   ├── promptPreprocessor.ts    # Document RAG + dir detection
│   ├── backgroundCommands.ts    # Background process manager
│   ├── fuzzySearch.ts           # Fuzzy file search
│   ├── locales/                 # i18n translations
│   ├── tools/                   # Tool category modules
│   │   ├── fileSystemTools.ts
│   │   ├── webResearchTools.ts
│   │   ├── browserAutomationTools.ts
│   │   ├── gitGithubTools.ts
│   │   ├── databaseTools.ts
│   │   ├── backgroundCommandTools.ts
│   │   ├── executionTools.ts
│   │   ├── utilityTools.ts
│   │   ├── imageProcessingTools.ts
│   │   ├── httpClientTools.ts
│   │   ├── vectorRagTools.ts
│   │   ├── uiGenerationTools.ts      # 🆕 Interactive UI Generation
│   │   └── contextManagementTools.ts # 🆕 Auto-Context Management
│   └── types/                   # Type definitions
├── tests/                       # Jest test files
├── dist/                        # Build output
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── eslint.config.mjs
```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@lmstudio/sdk` | ^1.5.0 | LM Studio plugin framework |
| `duck-duck-scrape` | ^2.2.7 | DuckDuckGo search |
| `puppeteer` | ^24.0.0 | Headless browser automation |
| `simple-git` | ^3.22.0 | Git operations |
| `tesseract.js` | ^7.0.0 | OCR text recognition |
| `pdf-parse` | ^1.1.1 | PDF text extraction |
| `mammoth` | ^1.6.0 | DOCX text extraction |
| `pixelmatch` | ^7.2.0 | Image pixel comparison |
| `sharp` | ^0.33.2 | Multi-format image processing (JPEG, BMP, etc.) |
| `pngjs` | ^7.0.0 | PNG image processing |
| `node-notifier` | ^10.0.1 | Desktop notifications |
| `zod` | ^3.25.0 | Schema validation |
| `html-to-text` | ^9.0.5 | HTML to text conversion |
| `open` | ^8.4.2 | Open files/URLs |

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

Copyright (c) 2026 crunch3r & AI Toolbox Contributors
