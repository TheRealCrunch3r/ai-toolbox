# AI Toolbox — LM Studio Plugin

## Description

**AI Toolbox** is a comprehensive, production-grade plugin for **LM Studio** that extends LLM capabilities by exposing **100 system tools** directly to the model via function calling. It bridges the gap between conversational AI and real-world host system operations, enabling autonomous file management, web research, browser automation, code execution, database queries, document parsing, image processing, Git/GitHub integration, HTTP client operations, vector/document RAG, interactive UI generation, auto-context management, backup & restore functionality—all within a secure, sandboxed environment.

---

## 🎯 Core Philosophy

> "Give your LLM hands to interact with the real world—safely."

AI Toolbox transforms passive language models into **active problem-solvers** by providing:
- 🔧 **Direct system access** — Files, shell commands, environment variables
- 🌐 **Web connectivity** — Multi-engine search, HTTP client, browser automation  
- 💾 **Data operations** — SQLite queries, document parsing (PDF/DOCX), image OCR
- 🔄 **State management** — Backup/restore, persistent memory, session tracking
- ⚡ **Autonomous workflows** — Background processes, long-running tasks
- 🛡️ **Security-first design** — Sandboxed execution, path validation, SSRF protection

---

## 📊 Capabilities at a Glance

| Category | Tools | Key Features |
|----------|-------|-------------|
| 📁 **File System** | 21 | Read/write/search files, directory operations, metadata, batch save, atomic writes with 10MB size limits, project analysis, file diff, directory tree visualization, and grep search |
| 🌐 **Web Research** | 4 | Multi-engine search (DDG/Google/Bing), auto-fallback chain (`ddg-api` → `ddg-fetch` → `google` → `bing`), Wikipedia, semantic RAG querying |
| 🖥️ **Browser Automation** | 5 | Headless Puppeteer v24, persistent sessions, screenshot capture, DOM interaction, HTML preview, and cross-platform file URL handling (`pathToFileURL`) |
| 🐙 **Git & GitHub** | 13 | Full Git CLI operations via `simple-git` (v3+), repository management, GitHub API integration (issues, PRs, comments), configurable auto-commit and default branch |
| 🗄️ **Database** | 1 | Read-only SQLite queries with SQL validation and parameter binding |
| ⏳ **Background Commands** | 3 | Long-running process management, output streaming, and cancellation |
| ⚡ **Code Execution** | 5 | Sandboxed JS/Python execution (`run_javascript`, `run_python`), terminal mode (`run_in_terminal`), full shell commands (`execute_command`), test suite runner (`run_tests`) — all with cross-platform executable detection and safe pattern filtering |
| 🔧 **Utilities** | 23 | Clipboard I/O, system notifications (via `node-notifier`), memory CRUD (`save_memory`, `get_memory`, `search_memory`, `delete_memory`), session summaries (`save_session_summary`, `get_session_summary`) for cross-session continuity, project analysis, current working directory query, system monitoring, process listing, environment inspection, file hashing, token counting, format conversion, secret scanning, port checking, package management, OS detection |
| 🖼️ **Image Processing** | 4 | OCR (Tesseract.js v7), desktop screenshots (Win32/macOS/Linux via `gnome-screenshot`/PowerShell), image comparison (`pixelmatch` + `pngjs`) |
| 🔌 **HTTP Client** | 3 | REST API client with SSRF protection and timeout handling |
| 📊 **Vector RAG** | 4 | Semantic search with local embeddings, persistent state via singleton pattern (`getSharedStore()`), web content fetching (`rag_web_content`), actual query results (no more placeholders) |
| 📚 **Document RAG** | 1 | Chat with attached files or disk paths (PDF via `pdf-parse`, DOCX via `mammoth`, TXT, MD) via prompt preprocessing |
| 🎨 **Interactive UI Generation** | 3 | Generate and render HTML/CSS/JS components: buttons, forms, charts (Chart.js), dashboards — cross-platform file URL handling with Puppeteer preview |
| 💾 **Backup & Restore** | 4 | Create compressed ZIP backups of plugin state (`archiver` v8) with path traversal protection; explicit confirmation required for destructive operations |
| 🧠 **Auto-Context Management** | 7 | Automatic session tracking, decision logging, persistent memory retrieval, configurable auto-summary intervals via `auto_summarize_context`, `get_context_memory`, `search_context`, `context_summary`, `delete_context_entry`, `clear_context_memory`, `track_important_event` |

---

## 🔐 Security Features

- ✅ **Sandboxed execution** — Code runs in isolated environments with dangerous pattern detection (`eval`, `exec`, `child_process`, network access blocked; safe standard library `require()` allowed)
- ✅ **Path validation** — All file operations validated against working directory (traversal patterns, UNC paths blocked)
- ✅ **SSRF protection** — HTTP client blocks internal/network access
- ✅ **Read-only database mode** — SQLite queries are SELECT-only by default
- ✅ **Explicit confirmation required** — Destructive operations (delete, restore) requi
