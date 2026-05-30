# AI Toolbox — LM Studio Plugin

## Description

**AI Toolbox** is a comprehensive, production-grade plugin for **LM Studio** that extends LLM capabilities by exposing **84+ system tools** directly to the model via function calling. It bridges the gap between conversational AI and real-world host system operations, enabling autonomous file management, web research, browser automation, code execution, database queries, document parsing, image processing, Git/GitHub integration, HTTP client operations, vector/document RAG, interactive UI generation, auto-context management, backup & restore functionality, and **ContextGuard** (infinite context window management)—all within a secure, sandboxed environment.

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
| 📁 **File System** | 17 | Read/write/search files, directory operations, metadata, batch save |
| 🌐 **Web Research** | 8 | Multi-engine search (DDG/Google/Bing), auto-fallback, Wikipedia, web content fetching |
| 🖥️ **Browser Automation** | 4 | Headless Puppeteer, persistent sessions, screenshot capture, DOM interaction |
| 🐙 **Git & GitHub** | 12 | Full Git CLI operations, GitHub API integration, repo discovery |
| 🗄️ **Database** | 3 | Read-only SQLite queries with SQL validation and parameter binding |
| ⏳ **Background Commands** | 4 | Long-running process management, output streaming, cancellation |
| ⚡ **Code Execution** | 2 | Sandboxed JS/Python execution + full shell commands (pipes, redirects, env vars) |
| 🔧 **Utilities** | 10 | Clipboard I/O, system notifications, memory tracking, project analysis |
| 🖼️ **Image Processing** | 4 | OCR (Tesseract.js), desktop screenshots (Win32/macOS/Linux), image comparison |
| 🔌 **HTTP Client** | 1 | REST API client with SSRF protection and timeout handling |
| 📊 **Vector RAG** | 3 | Semantic search with local embeddings, vector indexing, query optimization |
| 📚 **Document RAG** | 1 | Chat with attached files or disk paths (PDF, DOCX, TXT, MD) via prompt preprocessing |
| 🎨 **Interactive UI Generation** | 4 | Generate and render HTML/CSS/JS components: buttons, forms, charts, dashboards |
| 💾 **Backup & Restore** | 4 | Create compressed ZIP backups of plugin state with path traversal protection |
| 🧠 **Auto-Context Management** | 3 | Automatic session tracking, decision logging, persistent memory retrieval |
| ⏰ **Temporal Awareness** | — | Injects current date/time into every message for accurate time-sensitive tasks |
| 🛡️ **ContextGuard** | — | Dynamic context window management with smart reader, threshold-based compression, terminal filtering, re-RAG trigger, token budget visualization, visual indicator, and 6 explicit UI controls |

---

## 🔐 Security Features

- ✅ **Sandboxed execution** — Code runs in isolated environments
- ✅ **Path validation** — All file operations validated against working directory
- ✅ **SSRF protection** — HTTP client blocks internal/network access
- ✅ **Read-only database mode** — SQLite queries are SELECT-only by default
- ✅ **Explicit confirmation required** — Destructive operations (delete, restore) require user approval
- ✅ **Terminal output filtering** — Automatic truncation of long outputs (configurable)
- ✅ **Smart file reading** — Keyword-based selective reading for large files (toggleable)

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
│  │ Provider    │ (v1.4.1)    │                │   │
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
| **1.4.1** | 2026-05-30 | TypeScript compilation fixes (14 errors resolved), documentation updates, build stability improvements |
| **1.3.x** | 2026-05-29 | execute_command disabled by default (security), enhanced validation |
| **1.2.x** | — | Interactive UI generation, auto-context management |
| **1.0.x** | — | Initial release with core tool categories |

---

## 🛠️ For Developers

### Extending the Plugin
```typescript
// Example: Adding a new tool category
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';

export function registerMyTools(config: PluginConfig): Tool[] {
  return [
    tool({
      name: 'my_custom_tool',
      description: 'What this tool does...',
      parameters: {
        param1: z.string().describe('Parameter description'),
      },
      implementation: async ({ param1 }) => {
        // Tool logic here
        return { success: true, data: /* ... */ };
      },
    }),
  ];
}
```

### Configuration Schema (Zod)
All plugin settings use Zod for type-safe validation:
```typescript
const configSchematics = z.object({
  godMode: z.boolean().default(false),
  documentRAG: z.boolean().default(true),
  autoTrackingEnabled: z.boolean().default(false),
  // ... 50+ more settings
});
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Quick start, feature overview, installation |
| `ARCHITECTURE.md` | System design, data flow, component interactions |
| `TOOLS_REFERENCE.md` | Complete API reference for all 84+ tools |
| `CONTEXTGUARD.md` | Deep dive into ContextGuard v1.4.1 features and configuration |
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

### ContextGuard v1.4.1 — Infinite Context Management
- **Smart Reader**: Heuristic keyword-grep for large files (toggleable)
- **Threshold-Based Compression**: Auto-summarizes history at 90% token limit (configurable: 1K–200K tokens)
- **Terminal Output Filtering**: Truncates long outputs (configurable: 100–20K chars)
- **Re-RAG Trigger**: `reload_context_for_file` tool for fresh reads
- **Token Budget Visualization**: Real-time token usage display
- **Visual Indicator**: Rich status display when compression activates
- **6 Explicit UI Controls** in LM Studio settings panel (no code changes needed!)

### Backup & Restore System
- Create compressed ZIP backups of `.ai_toolbox_state.json` and `.ai_toolbox_context.json`
- Automatic timestamped filenames: `backup-YYYY-MM-DD-HH-MM-SS.zip`
- Path traversal protection during extraction
- Explicit confirmation required for destructive operations

### Interactive UI Generation
Generate rich HTML/CSS/JS components directly in chat:
- Buttons, forms, cards, modals
- Charts (Chart.js integration)
- Dashboards with real-time data
- Custom interactive widgets

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| **Total Tools** | 84+ across 16 categories |
| **Lines of Code** | ~15,000+ TypeScript |
| **Dependencies** | 200+ (production) |
| **Supported Formats** | PDF, DOCX, TXT, MD, JSON, YAML, PNG, JPG, GIF, BMP, TIFF, WebP, SQLite |
| **Search Engines** | DuckDuckGo, Google, Bing, Wikipedia, SearXNG |
| **Languages Supported** | English (primary), German, Chinese (Simplified/Traditional) via config |

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

- **Repository**: [GitHub](https://github.com/your-repo/ai_toolbox) (placeholder)
- **LM Studio**: https://lmstudio.ai/
- **Documentation**: See docs folder above
- **Issues**: Report bugs or request features

---

## 🎓 Learning Resources

### For Users
1. Start with `README.md` for installation
2. Browse `TOOLS_REFERENCE.md` to discover capabilities
3. Read `CONTEXTGUARD.md` for advanced context management
4. Check `CHANGELOG.md` for latest features

### For Developers
1. Study `ARCHITECTURE.md` for system design
2. Review `src/toolsProvider.ts` for tool registration patterns
3. Examine `src/config.ts` for configuration schema
4. Look at existing tools in `src/tools/` for implementation examples

---

## 💬 Support

- **Documentation**: Comprehensive docs in repository
- **Examples**: Tool usage examples throughout `TOOLS_REFERENCE.md`
- **Community**: LM Studio Discord/forum
- **Issues**: GitHub issues tracker

---

> **Built with ❤️ for the LM Studio community**  
> *Empowering LLMs to do real work on your machine — safely.*
