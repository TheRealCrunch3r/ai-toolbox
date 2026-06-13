# AI Toolbox — LM Studio Plugin

## Description

**AI Toolbox** is a comprehensive, production-grade plugin for **LM Studio** that extends LLM capabilities by exposing **106 system tools** directly to the model via function calling. It bridges the gap between conversational AI and real-world host system operations, enabling autonomous file management, web research, browser automation, code execution, database queries, document parsing, image processing, Git/GitHub integration, HTTP client operations, vector/document RAG, interactive UI generation, auto-context management, backup & restore functionality, and **ContextGuard** (infinite context window management)—all within a secure, sandboxed environment.

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
| 🖼️ **Image Processing** | ~4 | OCR (Tesseract.js v7), desktop screenshots (Win32/macOS/Linux via `gnome-screenshot`/PowerShell), image comparison (`pixelmatch` + `pngjs`) |
| 🔌 **HTTP Client** | 1 | REST API client with SSRF protection and timeout handling |
| 📊 **Vector RAG** | 4 | Semantic search with local embeddings, persistent state via singleton pattern (`getSharedStore()`), web content fetching (`rag_web_content`), actual query results (no more placeholders) |
| 📚 **Document RAG** | 1 | Chat with attached files or disk paths (PDF via `pdf-parse`, DOCX via `mammoth`, TXT, MD) via prompt preprocessing |
| 🎨 **Interactive UI Generation** | 4 | Generate and render HTML/CSS/JS components: buttons, forms, charts (Chart.js), dashboards — cross-platform file URL handling with Puppeteer preview |
| 💾 **Backup & Restore** | 4 | Create compressed ZIP backups of plugin state (`archiver` v8) with path traversal protection; explicit confirmation required for destructive operations |
| 🧠 **Auto-Context Management** | ~3+ | Automatic session tracking, decision logging, persistent memory retrieval, configurable auto-summary intervals |

---

## 🔐 Security Features

- ✅ **Sandboxed execution** — Code runs in isolated environments with dangerous pattern detection (`eval`, `exec`, `child_process`, network access blocked; safe standard library `require()` allowed)
- ✅ **Path validation** — All file operations validated against working directory (traversal patterns, UNC paths blocked)
- ✅ **SSRF protection** — HTTP client blocks internal/network access
- ✅ **Read-only database mode** — SQLite queries are SELECT-only by default
- ✅ **Explicit confirmation required** — Destructive operations (delete, restore) require user approval
- ✅ **Atomic file writes** — `save_file` uses temp-file + rename pattern to prevent corruption on crashes; 10MB payload limit enforced via Zod `.max()`
- ✅ **Terminal output filtering** — Automatic truncation of long outputs (configurable: 100–20K chars)
- ✅ **Safe shell execution** — `execute_command` disabled by default; all execution tools gated behind explicit opt-in toggles
- ✅ **Cross-platform executable detection** — `run_python` and `run_javascript` use multi-candidate PATH resolution (`py` → `python3` → `python`; `npx` → `node`) with shell fallbacks

---

## 🏗️ Architecture Highlights

```
┌─────────────────────────────────────────────────────┐
│                  LM Studio                          │
│              (LLM Inference)                        │
└──────────────────┬──────────────────────────────────┘
                   │ Function Calling Protocol
                   ▼
┌─────────────────────────────────────────────────────┐
│              AI Toolbox Plugin                       │
│  ┌─────────────┬─────────────┬─────────────────┐   │
│  │ Tools       │ ContextGuard│ Auto-Tracker    │   │
│  │ Provider    │             │                │   │
│  └─────────────┴─────────────┴─────────────────┘   │
│  ┌─────────────┬─────────────┬─────────────────┐   │
│  │ Prompt      │ Attachment  │ Config          │   │
│  │ Preprocessor│ Manager     │ (Zod)          │   │
│  └─────────────┴─────────────┴─────────────────┘   │
└──────────────────┬──────────────────────────────────┘
                   │ Node.js Runtime
                   ▼
┌─────────────────────────────────────────────────────┐
│              Host System                            │
│  • File System  • Network  • Git    • SQLite       │
│  • Shell        • Browser  • Images • Clipboard    │
└─────────────────────────────────────────────────────┘
```

### Module Structure (`src/`)
- `index.ts` — Plugin entry point; registers config schematics, ContextGuard, prompt preprocessor, and tools provider
- `toolsProvider.ts` — Central registry (110+ tools across 16 categories); dynamic config binding via `ctl.getPluginConfig()`
- `config.ts` — Zod-based configuration schema with 50+ settings; default-safe values (e.g., shell execution disabled)
- `contextGuard.ts` — Token-limit-aware context compression, smart file reading, terminal filtering
- `promptPreprocessor.ts` — Document RAG injection, attachment handling
- `stateManager.ts` — Persistent JSON state backed by `.ai_toolbox_state.json`
- `backgroundCommands.ts` — Long-running process lifecycle management
- `security.ts` — Path traversal validation, SSRF guards
- `src/tools/` — 15 category modules: `fileSystemTools`, `webResearchTools`, `browserAutomationTools`, `gitGithubTools`, `databaseTools`, `documentTools`, `backgroundCommandTools`, `executionTools`, `utilityTools`, `imageProcessingTools`, `httpClientTools`, `vectorRagTools`, `uiGenerationTools`, `contextManagementTools`, `backupTools`
- `src/locales/` — i18n support (English, German, Chinese Simplified/Traditional)

---

## 🚀 Quick Start

### Installation
```bash
# Clone or download the plugin repository
cd ai_toolbox

# Install dependencies
npm install

# Build the plugin
npm run build

# Load in LM Studio Plugins panel
```

### First Use
1. Open LM Studio → **Plugins** → Enable **AI Toolbox**
2. Configure tools via settings panel (God Mode or selective enabling)
3. Start chatting — tools are automatically available via function calling!

---

## 📈 Version History Highlights

| Version | Date | Key Features |
|---------|------|-------------|
| **1.4.10** | 2026-06-04 | `save_file` atomic writes (temp-file + rename), 10MB payload limit, auto parent directory creation, batch mode per-file error handling, Zod schema `.max()` constraints |
| **1.4.9** | 2026-06-04 | TypeScript compilation fix — zero strict-mode errors; `read_file_chunked` optional params handled with explicit null-coalescing defaults |
| **1.4.8** | 2026-06-04 | Memory system CRUD completed: added `get_memory`, `search_memory`, `delete_memory`; full persistence across restarts via stateManager |
| **1.4.7** | 2026-06-04 | UI generation cross-platform fix — replaced naive `file://` URL construction with Node.js built-in `pathToFileURL()`; works on Windows/macOS/Linux |
| **1.4.6** | 2026-06-04 | Execution tools critical fix: cross-platform Python & Node.js executable detection (`py`→`python3`→`python`; `npx`→`node`), safe dangerous pattern filtering (blocks `eval`, `exec`, `child_process`, network; allows standard library `require()`) |
| **1.4.5** | 2026-06-01 | Tool description improvements: `read_file` → `read_file_chunked` fallback trigger embedded in schema; Vector RAG persistent state (singleton), `rag_query_vector` returns real results, `rag_web_content` fully implemented |
| **1.4.3** | 2026-05-31 | `analyze_project` Windows compatibility — added `shell: true` to spawn options, switched typecheck from `'tsc'` to `'npx tsc'`; all 5 analysis categories working (TypeCheck, Circular, ESLint, Config, Imports) |
| **1.4.2** | 2026-05-31 | Test suite fixes — 265/265 tests passing; rewrote `workingDir.test.ts`, simplified `validatePath()` for edge cases, Jest mocks for ESM packages (`archiver`) |
| **Unreleased / 1.4.1** | 2026-05-30 | TypeScript compilation fixes (14 errors resolved), documentation updates, build stability improvements; Vector RAG initial persistent state implementation |

---

## 🛠️ For Developers

### Extending the Plugin
```typescript
// Example: Adding a new tool category
import { type Tool } from '@lmstudio/sdk';
import { z } from 'zod';

export function registerMyTools(config: PluginConfig): Tool[] {
  return [
    {
      name: 'my_custom_tool',
      description: 'What this tool does...',
      parameters: z.object({
        param1: z.string().describe('Parameter description'),
      }),
      implementation: async ({ param1 }) => {
        // Tool logic here
        return { success: true, data: /* ... */ };
      },
    },
  ];
}
```

### Configuration Schema (Zod)
All plugin settings use Zod for type-safe validation. Key categories include:
- **Tool toggles**: `fileSystem`, `webSearch`, `browserAutomation`, `gitOperations`, `databaseQueries`, `documentParsing`, `backgroundCommands`, `imageProcessing`, `httpClient`, `vectorRAG`, `uiGeneration`, `contextManagement`
- **Execution gates** (all disabled by default): `executionJavaScript`, `executionPython`, `executionTerminal`, `executionShell`
- **ContextGuard**: `contextGuardEnabled`, `contextGuardTokenLimit`, `contextGuardSmartReading`, `contextGuardSummaryModel`, `contextGuardTerminalFilterEnabled`, `contextGuardTerminalFilterLength`
- **Auto-tracking**: `autoTrackingEnabled`, `autoTrackDecisions`, `autoTrackCompletions`, `autoTrackErrors`, `autoSummaryInterval`
- **Search**: `searchFallbackChain` (`'ddg-api' | 'ddg-fetch' | 'google' | 'bing'`), `maxSearchResults`, `safesearch`
- **Browser**: `browserTimeout`, `headlessMode`
- **Git**: `gitAutoCommit`, `defaultBranch`
- **Security**: `pathValidationEnabled`, `binaryFileDetection`, `regexReDoSProtection`, `maxRegexLength`
- **State**: `statePersistenceEnabled`, `stateMaxSize`
- **Localization**: `language` (`'en' | 'de' | 'zh-CN' | 'zh-TW'`)
- **Temporal**: `temporalAwareness`, `dateFormatStyle` (`'standard' | 'heuteIst'`)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Quick start, feature overview, installation |
| `ARCHITECTURE.md` | System design, data flow, component interactions |
| `TOOLS_REFERENCE.md` | Complete API reference for all 110+ tools |
| `SECURITY.md` | Security model, threat mitigation, best practices |
| `CHANGELOG.md` | Version history following Keep a Changelog format |
| `CONTRIBUTING.md` | Guidelines for contributors and maintainers |

---

## 🎯 Use Cases

### 1. **Autonomous Research Assistant**
```markdown
User: "Research the latest developments in quantum computing and summarize key findings"
→ Plugin uses: web_search → fetch_web_content → rag_query_vector → summary generation
```

### 2. **Code Debugging & Fixing**
```markdown
User: "Fix the TypeScript errors in my project"
→ Plugin uses: analyze_project (typecheck) → read_file → replace_text_in_file → verify fix
```

### 3. **Database Analysis**
```markdown
User: "Show me sales trends from our SQLite database"
→ Plugin uses: execute_sqlite_query → generate_chart_ui → display results
```

### 4. **Document Q&A**
```markdown
User: [Attaches PDF] "What are the main conclusions?"
→ Plugin uses: read_document (PDF parsing) → RAG retrieval → answer generation
```

---

## 🌟 Notable Features

### ContextGuard — Dynamic Context Window Management
- **Smart Reader**: Heuristic keyword-grep for large files (toggleable via `contextGuardSmartReading`)
- **Threshold-Based Compression**: Auto-summarizes history at configurable token limit (default 30K, range: 1K–200K tokens)
- **Terminal Output Filtering**: Truncates long outputs (configurable: 100–20K chars via `contextGuardTerminalFilterLength`)
- **Token Budget Visualization**: Real-time token usage display when compression activates

### Backup & Restore System
- Create compressed ZIP backups of `.ai_toolbox_state.json` and `.ai_toolbox_context.json` using `archiver` v8
- Automatic timestamped filenames: `backup-YYYY-MM-DD-HH-MM-SS.zip`
- Path traversal protection during extraction via `unzipper`
- Explicit confirmation required for destructive operations

### Interactive UI Generation
Generate rich HTML/CSS/JS components directly in chat with live preview:
- Buttons, forms, cards, modals
- Charts (Chart.js integration) — rendered and captured via Puppeteer
- Dashboards with real-time data
- Custom interactive widgets — cross-platform file URL handling

### Memory System (CRUD)
Complete persistent fact storage across conversations:
- `save_memory(fact)` → persist to stateManager
- `get_memory()` → retrieve all entries sorted by timestamp
- `search_memory(query)` → case-insensitive partial matching
- `delete_memory(entry_id)` → remove specific entry

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| **Total Tools** | 110+ across 16 categories |
| **Dependencies** | 20 production (e.g., Puppeteer v24, Tesseract.js v7, archiver v8, sharp, mammoth) + dev tooling (TypeScript v5.9, Jest v30, tsup, madge) |
| **Supported Formats** | PDF, DOCX, TXT, MD, JSON, YAML, PNG, JPG, GIF, BMP, TIFF, WebP, SQLite |
| **Search Engines** | DuckDuckGo (API + fetch), Google, Bing, Wikipedia, SearXNG |
| **Languages Supported** | English (primary), German, Chinese (Simplified/Traditional) via i18n module |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Adding new tools
- Extending existing functionality
- Reporting bugs
- Submitting pull requests

---

## 📄 License

MIT License — See LICENSE file for details.

---

## 🔗 Links

- **LM Studio**: https://lmstudio.ai/
- **Documentation**: See docs folder above
- **Issues**: Report bugs or request features

---

> **Built with ❤️ for the LM Studio community**  
> *Empowering LLMs to do real work on your machine — safely.*
