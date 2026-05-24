# Changelog

All notable changes to the AI Toolbox plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.2.0] — 2026-05-24

### 🐛 Bug Fixes & Improvements

#### ✨ `read_document` — TXT Support for Disk Paths
- **Now supports `.txt` files from disk paths** (previously only supported attachments)
- Added text extraction and preview for local `.txt` files

#### 🖼️ `screenshot_desktop` — Windows Fix
- **Fixed**: Windows screenshot was creating a blank 1920x1080 bitmap instead of capturing the screen
- Now uses Win32 API via PowerShell to capture actual desktop content

#### 🖼️ `compare_images` — Multi-Format Support
- **Now supports JPEG, BMP, and other formats** (previously crashed on non-PNG files)
- Integrated `sharp` library for robust image decoding before comparison

#### 📦 Dependencies
- Added `sharp@^0.33.2` for multi-format image processing support

---

### 🔄 Merged `up_to_date` Plugin
### 🔧 Major Improvements

#### ✨ `execute_command` — Full Shell Support
- **Now uses `shell: true`** for complete shell interpretation (pipes, redirects, environment variables)
- Removed manual command parsing and Windows-specific handling
- Security maintained through `sanitizeCommand()` which blocks dangerous patterns before execution
- Supports complex commands like `npm run build && echo "Done!" > output.txt`

#### 🐛 Critical Bug Fix — Configuration System
- **Fixed**: ToolsProvider was always using hardcoded defaults instead of user settings
- Added global config state that updates when `main()` runs
- All execution tool toggles (`executionJavaScript`, `executionPython`, `executionTerminal`, `executionShell`) now properly respect UI settings
- Removed broken `context.getConfig()` call that caused TS2339 compilation errors

#### 🛠️ Logger Enhancement
- Added missing `logger.warn()` method to index.ts (was causing build failures)

#### ✨ Added — Temporal Awareness
- **Automatic Date/Time Injection** — Every user message now receives the current date/time appended at the end.
- **Session Caching** — Timestamp is cached for 5 minutes to ensure consistency during a conversation.
- **Configurable Formats**:
  - `Standard`: `[Zeit: DD.MM.YYYY, HH:mm]` (default)
  - `HEUTE IST Mode`: `HEUTE IST Wochentag, DD. MMMM YYYY um HH:mm Uhr` (prominent for document generation)
- **UI Configuration** — Toggle "Temporal Awareness" and select format style via LM Studio plugin settings.

#### 🛠️ Modified
- **Prompt Preprocessor** (`src/promptPreprocessor.ts`) — Integrated temporal awareness logic into the main preprocessor pipeline.
- **Configuration Schema** (`src/config.ts`) — Added `temporalAwareness` (boolean) and `dateFormatStyle` ('standard' | 'heuteIst') fields.

---

## [1.0.0] — 2026-05-22

### 🎉 Initial Release

#### ✨ Added — Core Architecture
- **Plugin Entry Point** (`src/index.ts`) — LM Studio SDK integration with lifecycle management
- **Tool Registry System** (`src/toolsProvider.ts`) — Central `ToolRegistry` class managing 45+ tools
- **Configuration System** (`src/config.ts`) — Zod-based schema with LM Studio UI schematics
- **State Manager** (`src/stateManager.ts`) — Persistent JSON state with debounced saves and corruption recovery
- **Working Directory Manager** (`src/workingDir.ts`) — Mutable working directory with path resolution
- **Performance Utilities** (`src/performanceUtils.ts`) — Levenshtein with early exit, caching, async file search
- **Prompt Preprocessor** (`src/promptPreprocessor.ts`) — Document RAG for "Chat with Files" feature

#### 📁 Added — File System Tools (18 tools)
- `list_directory` — List files and directories with file type detection
- `read_file` — Read files with size check, binary detection, and truncation support
- `save_file` — Save files with batch mode support
- `replace_text_in_file` — String replacement with exact matching
- `insert_at_line` — Insert content at specific line numbers
- `append_file` — Append content to files (creates if not exists)
- `delete_lines_in_file` — Delete lines or line ranges
- `make_directory` — Create directories with recursive support
- `move_file` — Move/rename files and directories
- `copy_file` — Copy files to new locations
- `delete_path` — Delete files or directories
- `delete_files_by_pattern` — Delete files matching regex patterns
- `find_files` — Async recursive file search with concurrency control
- `fuzzy_find_local_files` — Levenshtein-based fuzzy file search with caching
- `get_file_metadata` — File statistics (size, dates, type)
- `change_directory` — Change working directory with validation
- `read_document` — PDF and DOCX text extraction
- `analyze_project` — TypeScript diagnostics, circular dependency detection, ESLint, config analysis

#### 🌐 Added — Web Research Tools (4 tools)
- `web_search` — Multi-engine search with automatic fallback chain (DDG API → DDG Fetch → Google → Bing)
- `wikipedia_search` — Wikipedia search with language support
- `fetch_web_content` — Clean text extraction from webpages
- `rag_web_content` — Keyword-based relevance matching from web content

#### 🖥️ Added — Browser Automation Tools (5 tools)
- `browser_open_page` — Headless Puppeteer page loading with screenshot support
- `browser_session_control` — Persistent browser session with scripted actions
- `browser_session_close` — Explicit browser session cleanup
- `preview_html` — HTML preview in system browser
- `open_file` — Open files/URLs in default application

#### 🐙 Added — Git & GitHub Tools (13 tools)
- `git_status` — Repository status check
- `git_diff` — Diff with file-specific and staged change support
- `git_commit` — Commit staged changes
- `git_log` — Commit history with configurable count
- `git_add` — Stage files or all changes
- `git_checkout` — Branch switching with new branch creation
- `gh_auth` — GitHub authentication status check
- `gh_create_issue` — Create GitHub issues
- `gh_list_issues` — List issues with state/label filters
- `gh_view_comments` — View issue/PR comments
- `gh_create_pr` — Create pull requests
- `gh_list_prs` — List pull requests
- `gh_view_pr_diff` — Fetch PR diffs
- `gh_push` — Push commits to remote

#### 🗄️ Added — Database Tools (1 tool)
- `query_database` — Read-only SQLite queries with SQL validation (Node.js 23+ `node:sqlite`)

#### ⏳ Added — Background Command Tools (3 tools)
- `run_background_command` — Start long-running background processes
- `check_background_command` — Check status and output of background commands
- `cancel_background_command` — Kill running background commands

#### ⚡ Added — Execution Tools (4 tools)
- `run_javascript` — Sandboxed JavaScript execution with dangerous pattern detection
- `run_python` — Sandboxed Python execution with import restrictions
- `execute_command` — Shell command execution with sanitization
- `run_in_terminal` — Launch commands in interactive terminal windows

#### 🔧 Added — Utility Tools (7 tools)
- `save_memory` — Persistent memory storage
- `get_system_info` — System information (OS, CPU, memory)
- `read_clipboard` — Cross-platform clipboard read (Windows/macOS/Linux)
- `write_clipboard` — Cross-platform clipboard write with shell injection prevention
- `send_notification` — Desktop notifications via node-notifier
- `findLMStudioHome` — Locate LM Studio installation directory
- `get_enabled_tools` — List currently enabled tools

#### 🖼️ Added — Image Processing Tools (4 tools)
- `image_to_text` — OCR text extraction using Tesseract.js
- `describe_image` — Image metadata and format detection
- `screenshot_desktop` — Cross-platform desktop screenshot capture
- `compare_images` — Pixel-level image comparison with similarity scoring

#### 🔌 Added — HTTP Client Tools (3 tools)
- `http_request` — Generic HTTP client with SSRF protection
- `http_get_json` — GET request with JSON parsing
- `http_post_json` — POST request with JSON body

#### 📊 Added — Vector RAG Tools (3 tools)
- `rag_index_files` — Index files for semantic search with TF-IDF embeddings
- `rag_query_vector` — Query vector index for similar documents
- `rag_clear_index` — Clear vector search index

#### 🔒 Added — Security Features
- **Path Validation** — Directory traversal prevention with allowed base directories
- **Binary File Detection** — Null byte detection in first 8KB
- **ReDoS Protection** — Regex structure analysis for dangerous patterns
- **Command Sanitization** — Blocks sudo, rm -rf, eval, IFS tampering, null byte injection
- **SQL Validation** — Read-only SELECT/PRAGMA enforcement
- **SSRF Protection** — Private IP blocking for HTTP requests
- **Code Sandboxing** — Dangerous import/pattern blocking in JS/Python execution

#### ⚙️ Added — Configuration Features
- **God Mode** — Toggle to enable all tools at once
- **Granular Tool Gating** — Per-category and per-execution-tool toggles
- **Document RAG Settings** — Retrieval limit and affinity threshold
- **Search Fallback Chain** — Configurable primary search engine
- **Browser Settings** — Timeout and headless mode configuration
- **Git Settings** — Auto-commit and default branch
- **i18n Support** — English, German, Simplified Chinese, Traditional Chinese
- **State Persistence** — Configurable state size and persistence toggle
- **Desktop Notifications** — Toggle for system notifications

#### 🔧 Added — Build & Development
- **tsup** bundler configuration for CommonJS output
- **TypeScript 5.9** with strict mode and ES2020 target
- **Jest** test suite with 19 test files
- **ESLint 9.x** with TypeScript ESLint
- **Performance diagnostics** scripts (`perf:diagnose`, `perf:trace`)
- **Circular dependency detection** script (`check:circular`)

#### 🎯 Performance Optimizations
- Levenshtein distance with early exit threshold
- Fuzzy search result caching (60s TTL)
- Web request caching with exponential backoff retry
- Async file search with concurrency control
- Debounced state persistence (500ms delay)
- Dynamic timeout scaling based on project size
- Lazy loading for heavy dependencies (Puppeteer, Tesseract, SQLite)

---

## [Unreleased]

### 🐛 Fixed
- **Attachment Reading Logic**: Fixed `attachment.read is not a function` error in `documentTools.ts` by supporting various file handle types (string paths, FileHandles, objects with path property).
- **Build Errors**: Resolved TypeScript compilation errors caused by references to the removed `config.execution` property. Code now correctly uses granular execution toggles (`executionJavaScript`, `executionPython`, etc.).
- **Documentation Sync**: Updated `package.json` description and changelog to reflect current tool count (54+) and category structure.

### 🆕 Added — Interactive UI Generation Tools (3 tools)
- `generate_ui_component` — Generate HTML/CSS/JS code for interactive UI components (buttons, forms, charts, dashboards)
- `render_and_preview_ui` — Render generated HTML in browser with optional Puppeteer screenshot capture
- `extract_ui_data` — Extract structured data from HTML content (tables, forms, lists)

### 🆕 Added — Auto-Context Management Tools (6 tools)
- `auto_summarize_context` — Analyze session activity and automatically save important patterns/decisions to persistent memory
- `get_context_memory` — Retrieve auto-saved context entries from persistent memory with type filtering
- `search_context` — Search through saved context using text matching across titles, content, and tags
- `context_summary` — Get summary statistics of all saved context entries including counts by type
- `delete_context_entry` — Remove a specific auto-saved context entry by its unique ID
- `track_important_event` — Manually record an important event or decision to persistent memory

### 🆕 Added — Context Storage System
- **ContextStorageManager** (`src/tools/contextManagementTools.ts`) — Persistent JSON storage for session tracking with atomic writes and corruption recovery
- Automatic entry limiting (max 1000 entries) to prevent unbounded growth
- Text-based search across context titles, content, and tags
- Session pattern detection (>3 tool uses = frequent pattern flag)

### ⚙️ Configuration Updates
- Added `uiGeneration` config toggle (disabled by default) for Interactive UI Generation tools
- Added `contextManagement` config toggle (enabled by default) for Auto-Context Management tools
- Updated all documentation to reflect 54+ total tools across 14 categories

### 📚 Documentation Updates
- Updated README.md with new tool categories and configuration tables
- Updated ARCHITECTURE.md with context management flow diagrams
- Updated TOOLS_REFERENCE.md with complete documentation for all 9 new tools
- Updated CONTRIBUTING.md with project structure reference including new modules
- Updated SECURITY.md with default posture table reflecting new tool categories

---

## Version Scheme

- **Major**: Breaking changes to tool interfaces or plugin API
- **Minor**: New tools, features, or significant improvements
- **Patch**: Bug fixes, security patches, documentation updates

## Categories

- **Added**: New features and tools
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements and patches
