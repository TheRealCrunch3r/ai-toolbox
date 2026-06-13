# Architecture

Deep dive into the AI Toolbox plugin's system architecture, design patterns, and internal workflows.

---

## 🧪 Test Infrastructure (v1.4.2+)

### Test Architecture

```
tests/
├── *.test.ts              — Unit tests for each module
├── __mocks__/             — Jest mocks for ESM packages
│   ├── archiver.ts        — Mock for archiver@8.x (ESM-only)
│   └── unzipper.ts        — Mock for unzipper (ESM syntax)
└── fixtures/              — Test data files (if needed)
```

### Jest Configuration (`jest.config.cjs`)

```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^archiver

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LM Studio Host                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Plugin Runner (Node.js)                    │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                   AI Toolbox Plugin                     │  │  │
│  │  │                                                         │  │  │
│  │  │  ┌──────────────┐                                      │  │  │
│  │  │  │  index.ts     │◄─── Entry Point (main function)      │  │  │
│  │  │  │  (entry)      │                                      │  │  │
│  │  │  └──────┬───────┘                                      │  │  │
│  │  │         │                                              │  │  │
│  │  │         ▼                                              │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐   │  │  │
│  │  │  │              Core Services                       │   │  │  │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │  │  │
│  │  │  │  │ config.ts│ │security  │ │stateManager.ts   │ │   │  │  │
│  │  │  │  │(Zod+UI) │ │ .ts      │ │(persistence)      │ │   │  │  │
│  │  │  │  └──────────┘ │(validators)│ └──────────────────┘ │   │  │  │
│  │  │  │               └──────────┘                        │   │  │  │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │  │  │
│  │  │  │  │workingDir│ │performanc│ │promptPreprocessor │ │   │  │  │
│  │  │  │  │ .ts      │ │eUtils.ts │ │     .ts          │ │   │  │  │
│  │  │  │  │(path mgmt│ │(caching) │ │(Document RAG +    │ │   │  │  │
│  │  │  │  └──────────┘ └──────────┘ │ ContextGuard)     │ │   │  │  │
│  │  │  │                            └──────────────────┘ │   │  │  │
│  │  │  └─────────────────────────────────────────────────┘   │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │             Tool Registration Layer               │  │  │  │
│  │  │  │  ┌─────────────────┐  ┌──────────────────────┐  │  │  │  │
│  │  │  │  │ toolsProvider.ts │  │   ToolRegistry       │  │  │  │  │
│  │  │  │  │  (factory fn)    │  │   (central map)      │  │  │  │  │
│  │  │  │  └────────┬────────┘  └──────────┬───────────┘  │  │  │  │
│  │  │  └───────────┼──────────────────────┼─────────────┘  │  │  │
│  │  │              │                      │                │  │  │
│  │  │  ┌───────────┴──────────────────────┴─────────────┐  │  │  │
│  │  │  │              Tool Modules (16 files)            │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │fileSys │ │webRes  │ │browser │ │  git   │ │  │  │  │
│  │  │  │  │ (20)   │ │ (4)    │ │  (5)   │ │ (14)   │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ datab  │ │backgnd │ │exec    │ │ utility│ │  │  │  │
│  │  │  │  │ (1)    │ │ cmd(3) │ │  (5)   │ │ (~20+) │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ image  │ │ http   │ │ vector │ │   UI   │ │  │  │  │
│  │  │  │  │ (4)    │ │ (3)    │ │ RAG(4) │ │ Gen(3) │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐                                   │  │  │  │
│  │  │  │  │ Backup │                                   │  │  │  │
│  │  │  │  │ (4)    │                                   │  │  │  │
│  │  │  │  └────────┘                                   │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐                                   │  │  │  │
│  │  │  │  │ Context │                                   │  │  │  │
│  │  │  │  │ Mgmt(7) │                                   │  │  │  │
│  │  │  │  └────────┘                                   │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │  │
│  ┌─────────────────────────────────────────────────────────┐  │  │
│  │                  External Dependencies                  │  │  │
│  │  Puppeteer │ simple-git │ Tesseract.js │ pdf-parse      │  │  │
│  │  duck-duck-scrape │ node:sqlite │ node-notifier        │  │  │
│  └─────────────────────────────────────────────────────────┘  │  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 Plugin Lifecycle

### 1. Initialization

```typescript
// index.ts
export function main(context: PluginContext) {
  // 1. Register config schematics (UI toggles)
  context.withConfigSchematics(configSchematics);
  
  // 2. Register prompt preprocessor (Document RAG + ContextGuard)
  context.withPromptPreprocessor(preprocess);
  
  // 3. Register tools provider (all 110+ tools)
  context.withToolsProvider(toolsProvider);
  
  // 4. Setup cleanup handlers
  process.on('SIGTERM', cleanupBrowserSession);
  process.on('SIGINT', cleanupBrowserSession);
}
```

### 2. Tool Registration Flow

```
toolsProvider() called by LM Studio SDK
    │
    ▼
createToolsProvider(config)
    │
    ▼
new ToolsProvider(config)
    │
    ├── StateManager(config) ──────► Load state from disk
    ├── BackgroundCommandManager ──► Initialize process tracker
    └── ToolRegistry.registerAll()
            │
            ├── registerFileSystemTools()    ──► 20 tools
            ├── registerWebResearchTools()   ──► 4 tools
            ├── registerBrowserTools()       ──► 5 tools
            ├── registerGitTools()           ──► 14 tools
            ├── registerDatabaseTools()      ──► 1 tool
            ├── registerDocumentTools()      ──► 1 tool
            ├── registerBackgroundCommandTools() ─► 3 tools
            ├── registerExecutionTools()     ──► 5 tools (filtered)
            ├── registerUtilityTools()       ──► ~20+ tools
            ├── registerImageProcessingTools() ─► 4 tools
            ├── registerHttpClientTools()    ──► 3 tools
            ├── registerRagTools()           ──► 4 tools
            ├── registerUiGenerationTools()  ──► 3 tools (🆕)
            ├── registerContextManagementTools() ─► 7 tools (🆕)
            └── registerBackupTools()        ──► 4 tools
            │
            ▼
        ToolRegistry.toolMap (Map<string, TypedTool>)
            │
            ▼
        Return Tool[] to SDK ──► SDK registers with LLM
```

### 3. Context Management Flow (🆕)

```
Session Activity Occurs
    │
    ▼
auto_summarize_context() called
    │
    ├── Analyze tool usage patterns
    ├── Detect configuration changes
    ├── Identify important decisions
    └── Generate summary
    
    ▼
ContextStorageManager.addEntry(entry)
    │
    ├── Load existing entries from .ai_toolbox_context.json
    ├── Append new entry to beginning of array
    ├── Limit to 1000 entries (prevent unbounded growth)
    └── Save atomically (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_context.json)
    │
    ├── get_context_memory() → Retrieve recent entries
    ├── search_context(query) → Text-based search
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) → Remove specific entry
```

---

## 🏗️ Core Modules

### ToolRegistry (`src/toolsProvider.ts`)

Central registry managing all tool instances:

```typescript
class ToolRegistry {
  private toolMap = new Map<string, TypedTool>();
  
  registerAll(config, stateManager, bgCommandManager): void
  getAll(): Tool[]
  get(name: string): TypedTool | undefined
  has(name: string): boolean
}
```

**Key Design Decisions:**
- Tools created **once** at module load time (not per-request)
- Config-based filtering at registration time
- God Mode bypasses individual category toggles

### StateManager (`src/stateManager.ts`)

Persistent state with debounced disk writes:

```typescript
class StateManager {
  private state: Map<string, StateEntry>;
  private runningSize: number;  // O(1) size tracking
  
  set(key, value): void         // Debounced save (500ms)
  get<T>(key): T | undefined
  delete(key): boolean
  getAllKeys(): string[]
  clear(): void
}
```

**Key Features:**
- Atomic file writes (temp file + rename)
- Corruption recovery with backup file
- Size limit enforcement with running totals
- Debounced persistence to avoid excessive disk I/O

### ContextStorageManager (`src/tools/contextManagementTools.ts`) 🆕

Persistent context storage for session tracking:

```typescript
class ContextStorageManager {
  private storagePath: string; // .ai_toolbox_context.json
  
  load(): ContextEntry[]
  save(entries: ContextEntry[]): void
  addEntry(entry: ContextEntry): void
  getRecentEntries(limit, type?): ContextEntry[]
  searchEntries(query, maxResults): ContextEntry[]
  deleteEntry(id): boolean
  clearAll(): void
  getSummary(): ContextSummary
}
```

**Key Features:**
- JSON-based persistent storage in working directory
- Atomic writes with corruption recovery
- Automatic entry limiting (max 1000 entries)
- Text-based search across titles, content, and tags

### Security Module (`src/security.ts`)

Multi-layer security pipeline:

```
Input → Path Validation → Binary Detection → Command Sanitization → SQL Validation
         (validatePath)    (isBinaryFile)     (sanitizeCommand)      (validateSQLQuery)
```

### Working Directory Manager (`src/workingDir.ts`)

Mutable base path for all file operations:

```typescript
let currentWorkingDir: string = BASE_DIR;

getWorkingDir(): string
setWorkingDir(newDir: string): boolean
resetWorkingDir(): void
resolvePath(userPath: string): string
getAllowedBases(): string[]
```

---

## 🔐 Security Pipeline

### Path Validation

```
User Path Input
    │
    ├── Empty check ────────────────► Reject
    │
    ├── UNC path check (\\\\) ──────► Reject
    │
    ├── Relative path?
    │   │
    │   ├── Yes: Resolve against basePath
    │   │         │
    │   │         ├── Within base? ───► Allow
    │   │         └── Outside base? ──► Reject
    │   │
    │   └── No (absolute):
    │         │
    │         ├── In allowed bases? ──► Allow
    │         └── Outside allowed? ───► Reject
```

### Command Sanitization

```
Command String
    │
    ▼
Layer 1: Dangerous Pattern Blocking
    │
    ├── Null byte injection ─────────► Reject
    ├── IFS tampering ───────────────► Reject
    ├── Dangerous patterns (rm -rf, sudo, etc.) ─► Reject
    ├── Too many pipes (>2) ─────────► Reject
    ├── Multiple semicolons (>1) ─────► Reject
    ├── Command substitution ($(), ``) ─► Reject
    ├── Environment modification ─────► Reject
    │
    ▼
Layer 2: Tool-Category Enforcement (S6)
    │
    ├── classifyCommand() → Set<string>
    │       │
    │       ├── git * / api.github.com → 'gitOperations'
    │       ├── duckduckgo / google / bing → 'webSearch'
    │       ├── puppeteer / playwright / chromium → 'browserAutomation'
    │       ├── sqlite3 / mysql / psql → 'databaseQueries'
    │       ├── curl / wget / http → 'httpClient'
    │       └── nohup / disown / & → 'backgroundCommands'
    │       │
    │       ▼
    │   Check against config toggles
    │       │
    │       ├── Category disabled + !godMode ─► Reject
    │       └── Category enabled or godMode ──► Allow
    │
    ▼
    Allow Execution
```

### Code Sandboxing (JavaScript)

```
JavaScript Code
    │
    ├── require() detection ─────────► Reject
    ├── eval() detection ────────────► Reject
    ├── fs/child_process access ─────► Reject
    ├── Function constructor ────────► Reject
    ├── Dynamic import() ────────────► Reject
    └── __proto__ access ────────────► Reject
```

---

## ⚡ Performance Optimizations

### 1. Levenshtein with Early Exit

```typescript
// Stops calculating if minimum possible score drops below threshold
function levenshteinSimilarity(a: string, b: string, minScore: number): number | null {
  // Quick rejection for very different lengths
  if (lenDiff / maxLen > (1 - minScore)) return null;
  
  // Two-row optimization (saves memory vs full matrix)
  // Early exit when row minimum exceeds threshold
}
```

### 2. Caching Strategy

| Cache | TTL | Max Entries | Purpose |
|-------|-----|-------------|---------|
| Fuzzy Search | 60s | 100 | File name similarity results |
| Web Requests | 30s | 50 | HTTP responses |

### 3. Async File Search

```typescript
// Concurrency-controlled batch processing
async function findFilesAsync(dirPath, pattern, maxDepth, concurrencyLimit = 4) {
  // Process directories in batches
  for (const batch of batches) {
    await Promise.all(batch.map(dir => searchDir(dir, depth + 1)));
  }
}
```

### 4. Lazy Loading

Heavy dependencies loaded on first use:
- **Puppeteer** — Browser automation (50MB+)
- **Tesseract.js** — OCR engine
- **SQLite** — Database engine (Node 23+)
- **pdf-parse / mammoth** — Document parsing

---

## 📊 Data Flow

### Temporal Awareness Flow (merged from `up_to_date`)

```
User Message
    │
    ▼
promptPreprocessor()
    │
    ├── Check temporalAwareness config
    │   │
    │   └── Enabled?
    │       │
    │       ├── Yes: Get cached datetime (5min TTL)
    │       │         │
    │       │         ├── Format: Standard ([Zeit: ...]) or HEUTE IST Mode
    │       │         │
    │       │         └── Append timestamp to message end
    │       │
    │       └── No: Skip
    │
    ▼
Final Prompt sent to LLM (with timestamp suffix)
```

### Document RAG Flow

```
User Message + Attached Files
    │
    ▼
promptPreprocessor()
    │
    ├── Detect directory paths ─────────► Inject confirmation prompt
    │
    └── Document RAG enabled?
            │
            ├── Yes: Load embedding model
            │         │
            │         ├── Process files → chunks
            │         │
            │         ├── Semantic retrieval
            │         │
            │         ├── Filter by affinity threshold
            │         │
            │         └── Inject relevant chunks into prompt
            │
            └── No: Pass through unchanged
```

### Browser Session Flow

```
browser_open_page(url)
    │
    ▼
BrowserSessionManager.getBrowser()
    │
    ├── Browser exists & connected? ───► Reuse
    │
    └── No: Launch new Puppeteer instance
            │
            ├── Retry with exponential backoff (max 2)
            │
            └── Reset inactivity timer (5 min)
            │
            ▼
        Navigate to URL
            │
            ├── Wait for selector (optional)
            │
            ├── Take screenshot (optional)
            │
            └── Extract text content
```

### Context Management Flow 🆕

```
Session Activity Detected
    │
    ▼
auto_summarize_context(sessionEvents, configChanges)
    │
    ├── Analyze tool usage patterns (>3 uses = frequent pattern)
    ├── Track configuration changes
    ├── Identify important decisions
    └── Generate session summary
    
    ▼
ContextStorageManager.addEntry(entry)
    │
    ├── Load existing entries from .ai_toolbox_context.json
    ├── Prepend new entry to array
    ├── Enforce 1000-entry limit
    └── Atomic save (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_context.json)
    │
    ├── get_context_memory(limit, type?) → Retrieve entries
    ├── search_context(query, maxResults) → Text-based search
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) / clearContextMemory(confirm) → Management
```

### ContextGuard Compression Flow (v1.4.2)

```
User Message Arrives
    │
    ▼
promptPreprocessor()
    │
    ├── Check contextGuardEnabled config
    │   │
    │   └── Enabled?
    │       │
    │       ├── Yes: Count tokens in history
    │       │         │
    │       │         ├── Below 90% threshold? ──► Skip compression
    │       │         │
    │       │         └── Above 90% threshold?
    │       │                 │
    │       │                 ▼
    │       │             compressHistory(messages)
    │       │                 │
    │       │                 ├── Identify messages to compress (all except last 10)
    │       │                 ├── Send to summary model
    │       │                 │   └── Use contextGuardSummaryModel or current chat model
    │       │                 │
    │       │                 ├── Generate summary with preserved file paths/names
    │       │                 │
    │       │                 ├── Calculate tokens saved
    │       │                 │
    │       │                 └── Inject visual indicator:
    │       │                         │
    │       │                         ├── 🧠 Emoji header
    │       │                         ├── Messages compressed count
    │       │                         ├── Tokens before → after (e.g., "~35k → ~18k")
    │       │                         ├── Percentage saved (e.g., "Saved ~17,000 tokens (~49%)")
    │       │                         ├── Timestamp
    │       │                         └── Visual separator lines
    │       │
    │       └── No: Skip ContextGuard processing
    │
    ▼
Final Prompt sent to LLM (with or without compression indicator)
```

**Visual Indicator Example:**
```
🧠 **ContextGuard Compression Active**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Compressed 15 message(s) into summary
• Tokens before: ~35k → after: ~18k
• **Saved ~17,000 tokens (~49%)**
• Timestamp: 19:15:32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### CONTEXT SUMMARY (from 15 messages)
[Summary content here...]
```

---

## 🧩 Module Dependencies

```
index.ts
├── toolsProvider.ts
│   ├── config.ts
│   ├── stateManager.ts
│   ├── backgroundCommands.ts
│   └── tools/*.ts (16 modules)
│       ├── security.ts (shared)
│       ├── workingDir.ts (shared)
│       └── performanceUtils.ts (shared)
├── config.ts
├── promptPreprocessor.ts
│   └── config.ts
└── browserAutomationTools.ts (for cleanup)
```

### Circular Dependency Prevention

- `security.ts` imports from `workingDir.ts` (not vice versa)
- `stateManager.ts` has minimal logger (no index.ts import)
- Tool modules import only from shared utilities

---

## 🎯 Configuration Schema

The Zod schema (`src/config.ts`) defines all plugin settings:

```
ConfigSchema (Zod)
├── Tool Gating (13 booleans)
├── Execution Tools (4 booleans)
├── Search Settings (3 fields)
├── Browser Settings (2 fields)
├── Git Settings (2 fields)
├── Document RAG (3 fields)
├── Security Settings (4 fields)
├── State Management (2 fields)
├── i18n (1 field)
├── Notifications (1 field)
├── Temporal Awareness (2 fields: temporalAwareness, dateFormatStyle)
└── ContextGuard (6 fields): 🆕 v1.4.2
    ├── contextGuardEnabled (boolean) — Master toggle
    ├── contextGuardTokenLimit (number 1K-200K) — Compression threshold
    ├── contextGuardSmartReading (boolean) — Keyword-based file reading
    ├── contextGuardSummaryModel (string) — Dedicated summary model name
    ├── contextGuardTerminalFilterEnabled (boolean) — Terminal output filtering
    └── contextGuardTerminalFilterLength (number 100-20K) — Max terminal chars
```

Each field maps to a UI element in LM Studio's settings panel via `createConfigSchematics()`.

### ContextGuard Configuration Details (v1.4.2)

| Config Key | UI Name | Type | Range | Default | Description |
|------------|---------|------|-------|---------|-------------|
| `contextGuardEnabled` | 🧠 ContextGuard Token Management | Boolean | — | `true` | Master switch for all ContextGuard features |
| `contextGuardTokenLimit` | 📊 Token Limit Before Compression | Number | 1,000–200,000 | `30,000` | Compression triggers at **90%** of this value (e.g., 27k for 30k limit) |
| `contextGuardSmartReading` | 🔍 Smart File Reading | Boolean | — | `true` | Extracts keywords from queries to read only relevant file portions |
| `contextGuardSummaryModel` | 🤖 Summary Model Name | String | Any model name | `""` (current chat model) | Dedicated LM Studio model for summarization tasks |
| `contextGuardTerminalFilterEnabled` | 📌 Terminal Output Filtering | Boolean | — | `true` | Auto-truncates long terminal outputs to save tokens |
| `contextGuardTerminalFilterLength` | 📏 Max Terminal Output Length | Number | 100–20,000 | `2,000` | Characters before terminal output is truncated |

**Access Path:** LM Studio → Plugins → AI Toolbox → ⚙️ Settings → Scroll to "🧠 ContextGuard Token Management" section

---

## 📁 File Structure Reference

```
src/
├── index.ts                    # Plugin entry point
├── toolsProvider.ts            # Tool registration + ToolRegistry class
├── config.ts                   # Zod schema + UI schematics
├── security.ts                 # Path/SQL/command validators
├── stateManager.ts             # Persistent state management
├── workingDir.ts               # Working directory manager
├── performanceUtils.ts         # Caching, async search, Levenshtein
├── promptPreprocessor.ts       # Document RAG + ContextGuard integration
├── backgroundCommands.ts       # Background process manager
├── fuzzySearch.ts              # Fuzzy file search implementation
├── locales/                    # i18n translation files
│   ├── en.ts
│   ├── de.ts
│   ├── zh-CN.ts
│   └── zh-TW.ts
├── tools/                      # Tool category modules (16 files)
│   ├── fileSystemTools.ts      # 20 file system tools
│   ├── webResearchTools.ts     # 4 web research tools
│   ├── browserAutomationTools.ts # 5 browser tools
│   ├── gitGithubTools.ts       # 14 Git/GitHub tools
│   ├── databaseTools.ts        # 1 database tool
│   ├── documentTools.ts        # 1 document parsing tool
│   ├── backgroundCommandTools.ts # 3 background command tools
│   ├── executionTools.ts       # 5 execution tools (incl. run_tests)
│   ├── utilityTools.ts         # ~20+ utility tools
│   ├── imageProcessingTools.ts # 4 image processing tools
│   ├── httpClientTools.ts      # 3 HTTP client tools
│   ├── vectorRagTools.ts       # 4 vector RAG tools
│   ├── uiGenerationTools.ts    # 🆕 Interactive UI Generation (3 tools)
│   ├── contextManagementTools.ts # 🆕 Auto-Context Management (7 tools)
│   └── backupTools.ts          # 💾 Backup & Restore (4 tools)
└── types/                      # Type definitions
    └── types.d.ts

tests/                          # Jest test suite
├── security.test.ts
├── security.edge-cases.test.ts
├── config.test.ts
├── stateManager.test.ts
├── fileSystemTools.test.ts
├── webResearchTools.test.ts
├── browserAutomationTools.test.ts
├── gitGithubTools.test.ts
├── databaseTools.test.ts
├── executionTools.test.ts
├── utilityTools.test.ts
├── backgroundCommands.test.ts
├── toolsProvider.test.ts
├── performanceUtils.test.ts
├── fuzzySearch.test.ts
├── workingDir.test.ts
├── findLMStudioHome.test.ts
└── i18n.test.ts
```
: '<rootDir>/tests/__mocks__/archiver.ts',
    '^unzipper

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LM Studio Host                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Plugin Runner (Node.js)                    │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                   AI Toolbox Plugin                     │  │  │
│  │  │                                                         │  │  │
│  │  │  ┌──────────────┐                                      │  │  │
│  │  │  │  index.ts     │◄─── Entry Point (main function)      │  │  │
│  │  │  │  (entry)      │                                      │  │  │
│  │  │  └──────┬───────┘                                      │  │  │
│  │  │         │                                              │  │  │
│  │  │         ▼                                              │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐   │  │  │
│  │  │  │              Core Services                       │   │  │  │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │  │  │
│  │  │  │  │ config.ts│ │security  │ │stateManager.ts   │ │   │  │  │
│  │  │  │  │(Zod+UI) │ │ .ts      │ │(persistence)      │ │   │  │  │
│  │  │  │  └──────────┘ │(validators)│ └──────────────────┘ │   │  │  │
│  │  │  │               └──────────┘                        │   │  │  │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │  │  │
│  │  │  │  │workingDir│ │performanc│ │promptPreprocessor │ │   │  │  │
│  │  │  │  │ .ts      │ │eUtils.ts │ │     .ts          │ │   │  │  │
│  │  │  │  │(path mgmt│ │(caching) │ │(Document RAG +    │ │   │  │  │
│  │  │  │  └──────────┘ └──────────┘ │ ContextGuard)     │ │   │  │  │
│  │  │  │                            └──────────────────┘ │   │  │  │
│  │  │  └─────────────────────────────────────────────────┘   │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │             Tool Registration Layer               │  │  │  │
│  │  │  │  ┌─────────────────┐  ┌──────────────────────┐  │  │  │  │
│  │  │  │  │ toolsProvider.ts │  │   ToolRegistry       │  │  │  │  │
│  │  │  │  │  (factory fn)    │  │   (central map)      │  │  │  │  │
│  │  │  │  └────────┬────────┘  └──────────┬───────────┘  │  │  │  │
│  │  │  └───────────┼──────────────────────┼─────────────┘  │  │  │
│  │  │              │                      │                │  │  │
│  │  │  ┌───────────┴──────────────────────┴─────────────┐  │  │  │
│  │  │  │              Tool Modules (14 files)            │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │fileSys │ │webRes  │ │browser │ │  git   │ │  │  │  │
│  │  │  │  │ (17)   │ │ (4)    │ │  (5)   │ │ (14)   │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ datab  │ │backgnd │ │exec    │ │ utility│ │  │  │  │
│  │  │  │  │ (1)    │ │ cmd(3) │ │  (4)   │ │  (7)   │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ image  │ │ http   │ │ vector │ │   UI   │ │  │  │  │
│  │  │  │  │ (4)    │ │ (3)    │ │ RAG(3) │ │ Gen(3) │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐                                   │  │  │  │
│  │  │  │  │ Context │                                   │  │  │  │
│  │  │  │  │ Mgmt(7) │                                   │  │  │  │
│  │  │  │  └────────┘                                   │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │  │
│  ┌─────────────────────────────────────────────────────────┐  │  │
│  │                  External Dependencies                  │  │  │
│  │  Puppeteer │ simple-git │ Tesseract.js │ pdf-parse      │  │  │
│  │  duck-duck-scrape │ node:sqlite │ node-notifier        │  │  │
│  └─────────────────────────────────────────────────────────┘  │  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 Plugin Lifecycle

### 1. Initialization

```typescript
// index.ts
export function main(context: PluginContext) {
  // 1. Register config schematics (UI toggles)
  context.withConfigSchematics(configSchematics);
  
  // 2. Register prompt preprocessor (Document RAG + ContextGuard)
  context.withPromptPreprocessor(preprocess);
  
  // 3. Register tools provider (all 80+ tools)
  context.withToolsProvider(toolsProvider);
  
  // 4. Setup cleanup handlers
  process.on('SIGTERM', cleanupBrowserSession);
  process.on('SIGINT', cleanupBrowserSession);
}
```

### 2. Tool Registration Flow

```
toolsProvider() called by LM Studio SDK
    │
    ▼
createToolsProvider(config)
    │
    ▼
new ToolsProvider(config)
    │
    ├── StateManager(config) ──────► Load state from disk
    ├── BackgroundCommandManager ──► Initialize process tracker
    └── ToolRegistry.registerAll()
            │
            ├── registerFileSystemTools()    ──► 17 tools
            ├── registerWebResearchTools()   ──► 4 tools
            ├── registerBrowserTools()       ──► 5 tools
            ├── registerGitTools()           ──► 14 tools
            ├── registerDatabaseTools()      ──► 1 tool
            ├── registerDocumentTools()      ──► 1 tool
            ├── registerBackgroundCommandTools() ─► 3 tools
            ├── registerExecutionTools()     ──► 4 tools (filtered)
            ├── registerUtilityTools()       ──► 7 tools
            ├── registerImageProcessingTools() ─► 4 tools
            ├── registerHttpClientTools()    ──► 3 tools
            ├── registerRagTools()           ──► 3 tools
            ├── registerUiGenerationTools()  ──► 3 tools (🆕)
            └── registerContextManagementTools() ─► 7 tools (🆕)
            │
            ▼
        ToolRegistry.toolMap (Map<string, TypedTool>)
            │
            ▼
        Return Tool[] to SDK ──► SDK registers with LLM
```

### 3. Context Management Flow (🆕)

```
Session Activity Occurs
    │
    ▼
auto_summarize_context() called
    │
    ├── Analyze tool usage patterns
    ├── Detect configuration changes
    ├── Identify important decisions
    └── Generate summary
    
    ▼
ContextStorageManager.addEntry(entry)
    │
    ├── Load existing entries from .ai_toolbox_context.json
    ├── Append new entry to beginning of array
    ├── Limit to 1000 entries (prevent unbounded growth)
    └── Save atomically (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_context.json)
    │
    ├── get_context_memory() → Retrieve recent entries
    ├── search_context(query) → Text-based search
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) → Remove specific entry
```

---

## 🏗️ Core Modules

### ToolRegistry (`src/toolsProvider.ts`)

Central registry managing all tool instances:

```typescript
class ToolRegistry {
  private toolMap = new Map<string, TypedTool>();
  
  registerAll(config, stateManager, bgCommandManager): void
  getAll(): Tool[]
  get(name: string): TypedTool | undefined
  has(name: string): boolean
}
```

**Key Design Decisions:**
- Tools created **once** at module load time (not per-request)
- Config-based filtering at registration time
- God Mode bypasses individual category toggles

### StateManager (`src/stateManager.ts`)

Persistent state with debounced disk writes:

```typescript
class StateManager {
  private state: Map<string, StateEntry>;
  private runningSize: number;  // O(1) size tracking
  
  set(key, value): void         // Debounced save (500ms)
  get<T>(key): T | undefined
  delete(key): boolean
  getAllKeys(): string[]
  clear(): void
}
```

**Key Features:**
- Atomic file writes (temp file + rename)
- Corruption recovery with backup file
- Size limit enforcement with running totals
- Debounced persistence to avoid excessive disk I/O

### ContextStorageManager (`src/tools/contextManagementTools.ts`) 🆕

Persistent context storage for session tracking:

```typescript
class ContextStorageManager {
  private storagePath: string; // .ai_toolbox_context.json
  
  load(): ContextEntry[]
  save(entries: ContextEntry[]): void
  addEntry(entry: ContextEntry): void
  getRecentEntries(limit, type?): ContextEntry[]
  searchEntries(query, maxResults): ContextEntry[]
  deleteEntry(id): boolean
  clearAll(): void
  getSummary(): ContextSummary
}
```

**Key Features:**
- JSON-based persistent storage in working directory
- Atomic writes with corruption recovery
- Automatic entry limiting (max 1000 entries)
- Text-based search across titles, content, and tags

### Security Module (`src/security.ts`)

Multi-layer security pipeline:

```
Input → Path Validation → Binary Detection → Command Sanitization → SQL Validation
         (validatePath)    (isBinaryFile)     (sanitizeCommand)      (validateSQLQuery)
```

### Working Directory Manager (`src/workingDir.ts`)

Mutable base path for all file operations:

```typescript
let currentWorkingDir: string = BASE_DIR;

getWorkingDir(): string
setWorkingDir(newDir: string): boolean
resetWorkingDir(): void
resolvePath(userPath: string): string
getAllowedBases(): string[]
```

---

## 🔐 Security Pipeline

### Path Validation

```
User Path Input
    │
    ├── Empty check ────────────────► Reject
    │
    ├── UNC path check (\\\\) ──────► Reject
    │
    ├── Relative path?
    │   │
    │   ├── Yes: Resolve against basePath
    │   │         │
    │   │         ├── Within base? ───► Allow
    │   │         └── Outside base? ──► Reject
    │   │
    │   └── No (absolute):
    │         │
    │         ├── In allowed bases? ──► Allow
    │         └── Outside allowed? ───► Reject
```

### Command Sanitization

```
Command String
    │
    ▼
Layer 1: Dangerous Pattern Blocking
    │
    ├── Null byte injection ─────────► Reject
    ├── IFS tampering ───────────────► Reject
    ├── Dangerous patterns (rm -rf, sudo, etc.) ─► Reject
    ├── Too many pipes (>2) ─────────► Reject
    ├── Multiple semicolons (>1) ─────► Reject
    ├── Command substitution ($(), ``) ─► Reject
    ├── Environment modification ─────► Reject
    │
    ▼
Layer 2: Tool-Category Enforcement (S6)
    │
    ├── classifyCommand() → Set<string>
    │       │
    │       ├── git * / api.github.com → 'gitOperations'
    │       ├── duckduckgo / google / bing → 'webSearch'
    │       ├── puppeteer / playwright / chromium → 'browserAutomation'
    │       ├── sqlite3 / mysql / psql → 'databaseQueries'
    │       ├── curl / wget / http → 'httpClient'
    │       └── nohup / disown / & → 'backgroundCommands'
    │       │
    │       ▼
    │   Check against config toggles
    │       │
    │       ├── Category disabled + !godMode ─► Reject
    │       └── Category enabled or godMode ──► Allow
    │
    ▼
    Allow Execution
```

### Code Sandboxing (JavaScript)

```
JavaScript Code
    │
    ├── require() detection ─────────► Reject
    ├── eval() detection ────────────► Reject
    ├── fs/child_process access ─────► Reject
    ├── Function constructor ────────► Reject
    ├── Dynamic import() ────────────► Reject
    └── __proto__ access ────────────► Reject
```

---

## ⚡ Performance Optimizations

### 1. Levenshtein with Early Exit

```typescript
// Stops calculating if minimum possible score drops below threshold
function levenshteinSimilarity(a: string, b: string, minScore: number): number | null {
  // Quick rejection for very different lengths
  if (lenDiff / maxLen > (1 - minScore)) return null;
  
  // Two-row optimization (saves memory vs full matrix)
  // Early exit when row minimum exceeds threshold
}
```

### 2. Caching Strategy

| Cache | TTL | Max Entries | Purpose |
|-------|-----|-------------|---------|
| Fuzzy Search | 60s | 100 | File name similarity results |
| Web Requests | 30s | 50 | HTTP responses |

### 3. Async File Search

```typescript
// Concurrency-controlled batch processing
async function findFilesAsync(dirPath, pattern, maxDepth, concurrencyLimit = 4) {
  // Process directories in batches
  for (const batch of batches) {
    await Promise.all(batch.map(dir => searchDir(dir, depth + 1)));
  }
}
```

### 4. Lazy Loading

Heavy dependencies loaded on first use:
- **Puppeteer** — Browser automation (50MB+)
- **Tesseract.js** — OCR engine
- **SQLite** — Database engine (Node 23+)
- **pdf-parse / mammoth** — Document parsing

---

## 📊 Data Flow

### Temporal Awareness Flow (merged from `up_to_date`)

```
User Message
    │
    ▼
promptPreprocessor()
    │
    ├── Check temporalAwareness config
    │   │
    │   └── Enabled?
    │       │
    │       ├── Yes: Get cached datetime (5min TTL)
    │       │         │
    │       │         ├── Format: Standard ([Zeit: ...]) or HEUTE IST Mode
    │       │         │
    │       │         └── Append timestamp to message end
    │       │
    │       └── No: Skip
    │
    ▼
Final Prompt sent to LLM (with timestamp suffix)
```

### Document RAG Flow

```
User Message + Attached Files
    │
    ▼
promptPreprocessor()
    │
    ├── Detect directory paths ─────────► Inject confirmation prompt
    │
    └── Document RAG enabled?
            │
            ├── Yes: Load embedding model
            │         │
            │         ├── Process files → chunks
            │         │
            │         ├── Semantic retrieval
            │         │
            │         ├── Filter by affinity threshold
            │         │
            │         └── Inject relevant chunks into prompt
            │
            └── No: Pass through unchanged
```

### Browser Session Flow

```
browser_open_page(url)
    │
    ▼
BrowserSessionManager.getBrowser()
    │
    ├── Browser exists & connected? ───► Reuse
    │
    └── No: Launch new Puppeteer instance
            │
            ├── Retry with exponential backoff (max 2)
            │
            └── Reset inactivity timer (5 min)
            │
            ▼
        Navigate to URL
            │
            ├── Wait for selector (optional)
            │
            ├── Take screenshot (optional)
            │
            └── Extract text content
```

### Context Management Flow 🆕

```
Session Activity Detected
    │
    ▼
auto_summarize_context(sessionEvents, configChanges)
    │
    ├── Analyze tool usage patterns (>3 uses = frequent pattern)
    ├── Track configuration changes
    ├── Identify important decisions
    └── Generate session summary
    
    ▼
ContextStorageManager.addEntry(entry)
    │
    ├── Load existing entries from .ai_toolbox_context.json
    ├── Prepend new entry to array
    ├── Enforce 1000-entry limit
    └── Atomic save (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_context.json)
    │
    ├── get_context_memory(limit, type?) → Retrieve entries
    ├── search_context(query, maxResults) → Text-based search
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) / clearContextMemory(confirm) → Management
```

### ContextGuard Compression Flow (v1.4.2)

```
User Message Arrives
    │
    ▼
promptPreprocessor()
    │
    ├── Check contextGuardEnabled config
    │   │
    │   └── Enabled?
    │       │
    │       ├── Yes: Count tokens in history
    │       │         │
    │       │         ├── Below 90% threshold? ──► Skip compression
    │       │         │
    │       │         └── Above 90% threshold?
    │       │                 │
    │       │                 ▼
    │       │             compressHistory(messages)
    │       │                 │
    │       │                 ├── Identify messages to compress (all except last 10)
    │       │                 ├── Send to summary model
    │       │                 │   └── Use contextGuardSummaryModel or current chat model
    │       │                 │
    │       │                 ├── Generate summary with preserved file paths/names
    │       │                 │
    │       │                 ├── Calculate tokens saved
    │       │                 │
    │       │                 └── Inject visual indicator:
    │       │                         │
    │       │                         ├── 🧠 Emoji header
    │       │                         ├── Messages compressed count
    │       │                         ├── Tokens before → after (e.g., "~85k → ~42k")
    │       │                         ├── Percentage saved (e.g., "Saved ~43,000 tokens (~51%)")
    │       │                         ├── Timestamp
    │       │                         └── Visual separator lines
    │       │
    │       └── No: Skip ContextGuard processing
    │
    ▼
Final Prompt sent to LLM (with or without compression indicator)
```

**Visual Indicator Example:**
```
🧠 **ContextGuard Compression Active**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Compressed 15 message(s) into summary
• Tokens before: ~85k → after: ~42k
• **Saved ~43,000 tokens (~51%)**
• Timestamp: 19:15:32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### CONTEXT SUMMARY (from 15 messages)
[Summary content here...]
```

---

## 🧩 Module Dependencies

```
index.ts
├── toolsProvider.ts
│   ├── config.ts
│   ├── stateManager.ts
│   ├── backgroundCommands.ts
│   └── tools/*.ts (14 modules)
│       ├── security.ts (shared)
│       ├── workingDir.ts (shared)
│       └── performanceUtils.ts (shared)
├── config.ts
├── promptPreprocessor.ts
│   └── config.ts
└── browserAutomationTools.ts (for cleanup)
```

### Circular Dependency Prevention

- `security.ts` imports from `workingDir.ts` (not vice versa)
- `stateManager.ts` has minimal logger (no index.ts import)
- Tool modules import only from shared utilities

---

## 🎯 Configuration Schema

The Zod schema (`src/config.ts`) defines all plugin settings:

```
ConfigSchema (Zod)
├── Tool Gating (13 booleans)
├── Execution Tools (4 booleans)
├── Search Settings (3 fields)
├── Browser Settings (2 fields)
├── Git Settings (2 fields)
├── Document RAG (3 fields)
├── Security Settings (4 fields)
├── State Management (2 fields)
├── i18n (1 field)
├── Notifications (1 field)
├── Temporal Awareness (2 fields: temporalAwareness, dateFormatStyle)
└── ContextGuard (6 fields): 🆕 v1.4.2
    ├── contextGuardEnabled (boolean) — Master toggle
    ├── contextGuardTokenLimit (number 1K-200K) — Compression threshold
    ├── contextGuardSmartReading (boolean) — Keyword-based file reading
    ├── contextGuardSummaryModel (string) — Dedicated summary model name
    ├── contextGuardTerminalFilterEnabled (boolean) — Terminal output filtering
    └── contextGuardTerminalFilterLength (number 100-20K) — Max terminal chars
```

Each field maps to a UI element in LM Studio's settings panel via `createConfigSchematics()`.

### ContextGuard Configuration Details (v1.4.2)

| Config Key | UI Name | Type | Range | Default | Description |
|------------|---------|------|-------|---------|-------------|
| `contextGuardEnabled` | 🧠 ContextGuard Token Management | Boolean | — | `true` | Master switch for all ContextGuard features |
| `contextGuardTokenLimit` | 📊 Token Limit Before Compression | Number | 1,000–200,000 | `30,000` | Compression triggers at **90%** of this value (e.g., 27k for 30k limit) |
| `contextGuardSmartReading` | 🔍 Smart File Reading | Boolean | — | `true` | Extracts keywords from queries to read only relevant file portions |
| `contextGuardSummaryModel` | 🤖 Summary Model Name | String | Any model name | `""` (current chat model) | Dedicated LM Studio model for summarization tasks |
| `contextGuardTerminalFilterEnabled` | 📌 Terminal Output Filtering | Boolean | — | `true` | Auto-truncates long terminal outputs to save tokens |
| `contextGuardTerminalFilterLength` | 📏 Max Terminal Output Length | Number | 100–20,000 | `2,000` | Characters before terminal output is truncated |

**Access Path:** LM Studio → Plugins → AI Toolbox → ⚙️ Settings → Scroll to "🧠 ContextGuard Token Management" section

---

## 📁 File Structure Reference

```
src/
├── index.ts                    # Plugin entry point
├── toolsProvider.ts            # Tool registration + ToolRegistry class
├── config.ts                   # Zod schema + UI schematics
├── security.ts                 # Path/SQL/command validators
├── stateManager.ts             # Persistent state management
├── workingDir.ts               # Working directory manager
├── performanceUtils.ts         # Caching, async search, Levenshtein
├── promptPreprocessor.ts       # Document RAG + ContextGuard integration
├── backgroundCommands.ts       # Background process manager
├── fuzzySearch.ts              # Fuzzy file search implementation
├── locales/                    # i18n translation files
│   ├── en.ts
│   ├── de.ts
│   ├── zh-CN.ts
│   └── zh-TW.ts
├── tools/                      # Tool category modules
│   ├── fileSystemTools.ts      # 17 file system tools
│   ├── webResearchTools.ts     # 4 web research tools
│   ├── browserAutomationTools.ts # 5 browser tools
│   ├── gitGithubTools.ts       # 14 Git/GitHub tools
│   ├── databaseTools.ts        # 1 database tool
│   ├── backgroundCommandTools.ts # 3 background command tools
│   ├── executionTools.ts       # 4 execution tools
│   ├── utilityTools.ts         # 7 utility tools
│   ├── imageProcessingTools.ts # 4 image processing tools
│   ├── httpClientTools.ts      # 3 HTTP client tools
│   ├── vectorRagTools.ts       # 3 vector RAG tools
│   ├── uiGenerationTools.ts    # 🆕 3 UI generation tools
│   └── contextManagementTools.ts # 🆕 7 context management tools
└── types/                      # Type definitions
    └── types.d.ts

tests/                          # Jest test suite
├── security.test.ts
├── security.edge-cases.test.ts
├── config.test.ts
├── stateManager.test.ts
├── fileSystemTools.test.ts
├── webResearchTools.test.ts
├── browserAutomationTools.test.ts
├── gitGithubTools.test.ts
├── databaseTools.test.ts
├── executionTools.test.ts
├── utilityTools.test.ts
├── backgroundCommands.test.ts
├── toolsProvider.test.ts
├── performanceUtils.test.ts
├── fuzzySearch.test.ts
├── workingDir.test.ts
├── findLMStudioHome.test.ts
└── i18n.test.ts
```
: '<rootDir>/tests/__mocks__/unzipper.ts',
  },
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80 } }
}
```

**Key Design Decisions:**
- **ESM Package Mocking**: `archiver@8.x` and `unzipper` use ESM syntax which ts-jest cannot transform. Using `moduleNameMapper` with custom mocks is more reliable than `transformIgnorePatterns` for this case.
- **Test Isolation**: Each test file runs in isolation with fresh state
- **Security Test Coverage**: Comprehensive edge-case testing for all security validators (path traversal, ReDoS, SQL injection, command injection)

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- workingDir.test.ts
```

**Test Coverage**: 19 test suites, 265 tests — all passing ✅

---

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LM Studio Host                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Plugin Runner (Node.js)                    │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                   AI Toolbox Plugin                     │  │  │
│  │  │                                                         │  │  │
│  │  │  ┌──────────────┐                                      │  │  │
│  │  │  │  index.ts     │◄─── Entry Point (main function)      │  │  │
│  │  │  │  (entry)      │                                      │  │  │
│  │  │  └──────┬───────┘                                      │  │  │
│  │  │         │                                              │  │  │
│  │  │         ▼                                              │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐   │  │  │
│  │  │  │              Core Services                       │   │  │  │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │  │  │
│  │  │  │  │ config.ts│ │security  │ │stateManager.ts   │ │   │  │  │
│  │  │  │  │(Zod+UI) │ │ .ts      │ │(persistence)      │ │   │  │  │
│  │  │  │  └──────────┘ │(validators)│ └──────────────────┘ │   │  │  │
│  │  │  │               └──────────┘                        │   │  │  │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │  │  │
│  │  │  │  │workingDir│ │performanc│ │promptPreprocessor │ │   │  │  │
│  │  │  │  │ .ts      │ │eUtils.ts │ │     .ts          │ │   │  │  │
│  │  │  │  │(path mgmt│ │(caching) │ │(Document RAG +    │ │   │  │  │
│  │  │  │  └──────────┘ └──────────┘ │ ContextGuard)     │ │   │  │  │
│  │  │  │                            └──────────────────┘ │   │  │  │
│  │  │  └─────────────────────────────────────────────────┘   │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │             Tool Registration Layer               │  │  │  │
│  │  │  │  ┌─────────────────┐  ┌──────────────────────┐  │  │  │  │
│  │  │  │  │ toolsProvider.ts │  │   ToolRegistry       │  │  │  │  │
│  │  │  │  │  (factory fn)    │  │   (central map)      │  │  │  │  │
│  │  │  │  └────────┬────────┘  └──────────┬───────────┘  │  │  │  │
│  │  │  └───────────┼──────────────────────┼─────────────┘  │  │  │
│  │  │              │                      │                │  │  │
│  │  │  ┌───────────┴──────────────────────┴─────────────┐  │  │  │
│  │  │  │              Tool Modules (14 files)            │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │fileSys │ │webRes  │ │browser │ │  git   │ │  │  │  │
│  │  │  │  │ (17)   │ │ (4)    │ │  (5)   │ │ (14)   │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ datab  │ │backgnd │ │exec    │ │ utility│ │  │  │  │
│  │  │  │  │ (1)    │ │ cmd(3) │ │  (4)   │ │  (7)   │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ image  │ │ http   │ │ vector │ │   UI   │ │  │  │  │
│  │  │  │  │ (4)    │ │ (3)    │ │ RAG(3) │ │ Gen(3) │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐                                   │  │  │  │
│  │  │  │  │ Context │                                   │  │  │  │
│  │  │  │  │ Mgmt(7) │                                   │  │  │  │
│  │  │  │  └────────┘                                   │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │  │
│  ┌─────────────────────────────────────────────────────────┐  │  │
│  │                  External Dependencies                  │  │  │
│  │  Puppeteer │ simple-git │ Tesseract.js │ pdf-parse      │  │  │
│  │  duck-duck-scrape │ node:sqlite │ node-notifier        │  │  │
│  └─────────────────────────────────────────────────────────┘  │  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 Plugin Lifecycle

### 1. Initialization

```typescript
// index.ts
export function main(context: PluginContext) {
  // 1. Register config schematics (UI toggles)
  context.withConfigSchematics(configSchematics);
  
  // 2. Register prompt preprocessor (Document RAG + ContextGuard)
  context.withPromptPreprocessor(preprocess);
  
  // 3. Register tools provider (all 80+ tools)
  context.withToolsProvider(toolsProvider);
  
  // 4. Setup cleanup handlers
  process.on('SIGTERM', cleanupBrowserSession);
  process.on('SIGINT', cleanupBrowserSession);
}
```

### 2. Tool Registration Flow

```
toolsProvider() called by LM Studio SDK
    │
    ▼
createToolsProvider(config)
    │
    ▼
new ToolsProvider(config)
    │
    ├── StateManager(config) ──────► Load state from disk
    ├── BackgroundCommandManager ──► Initialize process tracker
    └── ToolRegistry.registerAll()
            │
            ├── registerFileSystemTools()    ──► 17 tools
            ├── registerWebResearchTools()   ──► 4 tools
            ├── registerBrowserTools()       ──► 5 tools
            ├── registerGitTools()           ──► 14 tools
            ├── registerDatabaseTools()      ──► 1 tool
            ├── registerDocumentTools()      ──► 1 tool
            ├── registerBackgroundCommandTools() ─► 3 tools
            ├── registerExecutionTools()     ──► 4 tools (filtered)
            ├── registerUtilityTools()       ──► 7 tools
            ├── registerImageProcessingTools() ─► 4 tools
            ├── registerHttpClientTools()    ──► 3 tools
            ├── registerRagTools()           ──► 3 tools
            ├── registerUiGenerationTools()  ──► 3 tools (🆕)
            └── registerContextManagementTools() ─► 7 tools (🆕)
            │
            ▼
        ToolRegistry.toolMap (Map<string, TypedTool>)
            │
            ▼
        Return Tool[] to SDK ──► SDK registers with LLM
```

### 3. Context Management Flow (🆕)

```
Session Activity Occurs
    │
    ▼
auto_summarize_context() called
    │
    ├── Analyze tool usage patterns
    ├── Detect configuration changes
    ├── Identify important decisions
    └── Generate summary
    
    ▼
ContextStorageManager.addEntry(entry)
    │
    ├── Load existing entries from .ai_toolbox_context.json
    ├── Append new entry to beginning of array
    ├── Limit to 1000 entries (prevent unbounded growth)
    └── Save atomically (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_context.json)
    │
    ├── get_context_memory() → Retrieve recent entries
    ├── search_context(query) → Text-based search
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) → Remove specific entry
```

---

## 🏗️ Core Modules

### ToolRegistry (`src/toolsProvider.ts`)

Central registry managing all tool instances:

```typescript
class ToolRegistry {
  private toolMap = new Map<string, TypedTool>();
  
  registerAll(config, stateManager, bgCommandManager): void
  getAll(): Tool[]
  get(name: string): TypedTool | undefined
  has(name: string): boolean
}
```

**Key Design Decisions:**
- Tools created **once** at module load time (not per-request)
- Config-based filtering at registration time
- God Mode bypasses individual category toggles

### StateManager (`src/stateManager.ts`)

Persistent state with debounced disk writes:

```typescript
class StateManager {
  private state: Map<string, StateEntry>;
  private runningSize: number;  // O(1) size tracking
  
  set(key, value): void         // Debounced save (500ms)
  get<T>(key): T | undefined
  delete(key): boolean
  getAllKeys(): string[]
  clear(): void
}
```

**Key Features:**
- Atomic file writes (temp file + rename)
- Corruption recovery with backup file
- Size limit enforcement with running totals
- Debounced persistence to avoid excessive disk I/O

### ContextStorageManager (`src/tools/contextManagementTools.ts`) 🆕

Persistent context storage for session tracking:

```typescript
class ContextStorageManager {
  private storagePath: string; // .ai_toolbox_context.json
  
  load(): ContextEntry[]
  save(entries: ContextEntry[]): void
  addEntry(entry: ContextEntry): void
  getRecentEntries(limit, type?): ContextEntry[]
  searchEntries(query, maxResults): ContextEntry[]
  deleteEntry(id): boolean
  clearAll(): void
  getSummary(): ContextSummary
}
```

**Key Features:**
- JSON-based persistent storage in working directory
- Atomic writes with corruption recovery
- Automatic entry limiting (max 1000 entries)
- Text-based search across titles, content, and tags

### Security Module (`src/security.ts`)

Multi-layer security pipeline:

```
Input → Path Validation → Binary Detection → Command Sanitization → SQL Validation
         (validatePath)    (isBinaryFile)     (sanitizeCommand)      (validateSQLQuery)
```

### Working Directory Manager (`src/workingDir.ts`)

Mutable base path for all file operations:

```typescript
let currentWorkingDir: string = BASE_DIR;

getWorkingDir(): string
setWorkingDir(newDir: string): boolean
resetWorkingDir(): void
resolvePath(userPath: string): string
getAllowedBases(): string[]
```

---

## 🔐 Security Pipeline

### Path Validation

```
User Path Input
    │
    ├── Empty check ────────────────► Reject
    │
    ├── UNC path check (\\\\) ──────► Reject
    │
    ├── Relative path?
    │   │
    │   ├── Yes: Resolve against basePath
    │   │         │
    │   │         ├── Within base? ───► Allow
    │   │         └── Outside base? ──► Reject
    │   │
    │   └── No (absolute):
    │         │
    │         ├── In allowed bases? ──► Allow
    │         └── Outside allowed? ───► Reject
```

### Command Sanitization

```
Command String
    │
    ▼
Layer 1: Dangerous Pattern Blocking
    │
    ├── Null byte injection ─────────► Reject
    ├── IFS tampering ───────────────► Reject
    ├── Dangerous patterns (rm -rf, sudo, etc.) ─► Reject
    ├── Too many pipes (>2) ─────────► Reject
    ├── Multiple semicolons (>1) ─────► Reject
    ├── Command substitution ($(), ``) ─► Reject
    ├── Environment modification ─────► Reject
    │
    ▼
Layer 2: Tool-Category Enforcement (S6)
    │
    ├── classifyCommand() → Set<string>
    │       │
    │       ├── git * / api.github.com → 'gitOperations'
    │       ├── duckduckgo / google / bing → 'webSearch'
    │       ├── puppeteer / playwright / chromium → 'browserAutomation'
    │       ├── sqlite3 / mysql / psql → 'databaseQueries'
    │       ├── curl / wget / http → 'httpClient'
    │       └── nohup / disown / & → 'backgroundCommands'
    │       │
    │       ▼
    │   Check against config toggles
    │       │
    │       ├── Category disabled + !godMode ─► Reject
    │       └── Category enabled or godMode ──► Allow
    │
    ▼
    Allow Execution
```

### Code Sandboxing (JavaScript)

```
JavaScript Code
    │
    ├── require() detection ─────────► Reject
    ├── eval() detection ────────────► Reject
    ├── fs/child_process access ─────► Reject
    ├── Function constructor ────────► Reject
    ├── Dynamic import() ────────────► Reject
    └── __proto__ access ────────────► Reject
```

---

## ⚡ Performance Optimizations

### 1. Levenshtein with Early Exit

```typescript
// Stops calculating if minimum possible score drops below threshold
function levenshteinSimilarity(a: string, b: string, minScore: number): number | null {
  // Quick rejection for very different lengths
  if (lenDiff / maxLen > (1 - minScore)) return null;
  
  // Two-row optimization (saves memory vs full matrix)
  // Early exit when row minimum exceeds threshold
}
```

### 2. Caching Strategy

| Cache | TTL | Max Entries | Purpose |
|-------|-----|-------------|---------|
| Fuzzy Search | 60s | 100 | File name similarity results |
| Web Requests | 30s | 50 | HTTP responses |

### 3. Async File Search

```typescript
// Concurrency-controlled batch processing
async function findFilesAsync(dirPath, pattern, maxDepth, concurrencyLimit = 4) {
  // Process directories in batches
  for (const batch of batches) {
    await Promise.all(batch.map(dir => searchDir(dir, depth + 1)));
  }
}
```

### 4. Lazy Loading

Heavy dependencies loaded on first use:
- **Puppeteer** — Browser automation (50MB+)
- **Tesseract.js** — OCR engine
- **SQLite** — Database engine (Node 23+)
- **pdf-parse / mammoth** — Document parsing

---

## 📊 Data Flow

### Temporal Awareness Flow (merged from `up_to_date`)

```
User Message
    │
    ▼
promptPreprocessor()
    │
    ├── Check temporalAwareness config
    │   │
    │   └── Enabled?
    │       │
    │       ├── Yes: Get cached datetime (5min TTL)
    │       │         │
    │       │         ├── Format: Standard ([Zeit: ...]) or HEUTE IST Mode
    │       │         │
    │       │         └── Append timestamp to message end
    │       │
    │       └── No: Skip
    │
    ▼
Final Prompt sent to LLM (with timestamp suffix)
```

### Document RAG Flow

```
User Message + Attached Files
    │
    ▼
promptPreprocessor()
    │
    ├── Detect directory paths ─────────► Inject confirmation prompt
    │
    └── Document RAG enabled?
            │
            ├── Yes: Load embedding model
            │         │
            │         ├── Process files → chunks
            │         │
            │         ├── Semantic retrieval
            │         │
            │         ├── Filter by affinity threshold
            │         │
            │         └── Inject relevant chunks into prompt
            │
            └── No: Pass through unchanged
```

### Browser Session Flow

```
browser_open_page(url)
    │
    ▼
BrowserSessionManager.getBrowser()
    │
    ├── Browser exists & connected? ───► Reuse
    │
    └── No: Launch new Puppeteer instance
            │
            ├── Retry with exponential backoff (max 2)
            │
            └── Reset inactivity timer (5 min)
            │
            ▼
        Navigate to URL
            │
            ├── Wait for selector (optional)
            │
            ├── Take screenshot (optional)
            │
            └── Extract text content
```

### Context Management Flow 🆕

```
Session Activity Detected
    │
    ▼
auto_summarize_context(sessionEvents, configChanges)
    │
    ├── Analyze tool usage patterns (>3 uses = frequent pattern)
    ├── Track configuration changes
    ├── Identify important decisions
    └── Generate session summary
    
    ▼
ContextStorageManager.addEntry(entry)
    │
    ├── Load existing entries from .ai_toolbox_context.json
    ├── Prepend new entry to array
    ├── Enforce 1000-entry limit
    └── Atomic save (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_context.json)
    │
    ├── get_context_memory(limit, type?) → Retrieve entries
    ├── search_context(query, maxResults) → Text-based search
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) / clearContextMemory(confirm) → Management
```

### ContextGuard Compression Flow (v1.4.2)

```
User Message Arrives
    │
    ▼
promptPreprocessor()
    │
    ├── Check contextGuardEnabled config
    │   │
    │   └── Enabled?
    │       │
    │       ├── Yes: Count tokens in history
    │       │         │
    │       │         ├── Below 90% threshold? ──► Skip compression
    │       │         │
    │       │         └── Above 90% threshold?
    │       │                 │
    │       │                 ▼
    │       │             compressHistory(messages)
    │       │                 │
    │       │                 ├── Identify messages to compress (all except last 10)
    │       │                 ├── Send to summary model
    │       │                 │   └── Use contextGuardSummaryModel or current chat model
    │       │                 │
    │       │                 ├── Generate summary with preserved file paths/names
    │       │                 │
    │       │                 ├── Calculate tokens saved
    │       │                 │
    │       │                 └── Inject visual indicator:
    │       │                         │
    │       │                         ├── 🧠 Emoji header
    │       │                         ├── Messages compressed count
    │       │                         ├── Tokens before → after (e.g., "~85k → ~42k")
    │       │                         ├── Percentage saved (e.g., "Saved ~43,000 tokens (~51%)")
    │       │                         ├── Timestamp
    │       │                         └── Visual separator lines
    │       │
    │       └── No: Skip ContextGuard processing
    │
    ▼
Final Prompt sent to LLM (with or without compression indicator)
```

**Visual Indicator Example:**
```
🧠 **ContextGuard Compression Active**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Compressed 15 message(s) into summary
• Tokens before: ~85k → after: ~42k
• **Saved ~43,000 tokens (~51%)**
• Timestamp: 19:15:32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### CONTEXT SUMMARY (from 15 messages)
[Summary content here...]
```

---

## 🧩 Module Dependencies

```
index.ts
├── toolsProvider.ts
│   ├── config.ts
│   ├── stateManager.ts
│   ├── backgroundCommands.ts
│   └── tools/*.ts (14 modules)
│       ├── security.ts (shared)
│       ├── workingDir.ts (shared)
│       └── performanceUtils.ts (shared)
├── config.ts
├── promptPreprocessor.ts
│   └── config.ts
└── browserAutomationTools.ts (for cleanup)
```

### Circular Dependency Prevention

- `security.ts` imports from `workingDir.ts` (not vice versa)
- `stateManager.ts` has minimal logger (no index.ts import)
- Tool modules import only from shared utilities

---

## 🎯 Configuration Schema

The Zod schema (`src/config.ts`) defines all plugin settings:

```
ConfigSchema (Zod)
├── Tool Gating (13 booleans)
├── Execution Tools (4 booleans)
├── Search Settings (3 fields)
├── Browser Settings (2 fields)
├── Git Settings (2 fields)
├── Document RAG (3 fields)
├── Security Settings (4 fields)
├── State Management (2 fields)
├── i18n (1 field)
├── Notifications (1 field)
├── Temporal Awareness (2 fields: temporalAwareness, dateFormatStyle)
└── ContextGuard (6 fields): 🆕 v1.4.2
    ├── contextGuardEnabled (boolean) — Master toggle
    ├── contextGuardTokenLimit (number 1K-200K) — Compression threshold
    ├── contextGuardSmartReading (boolean) — Keyword-based file reading
    ├── contextGuardSummaryModel (string) — Dedicated summary model name
    ├── contextGuardTerminalFilterEnabled (boolean) — Terminal output filtering
    └── contextGuardTerminalFilterLength (number 100-20K) — Max terminal chars
```

Each field maps to a UI element in LM Studio's settings panel via `createConfigSchematics()`.

### ContextGuard Configuration Details (v1.4.2)

| Config Key | UI Name | Type | Range | Default | Description |
|------------|---------|------|-------|---------|-------------|
| `contextGuardEnabled` | 🧠 ContextGuard Token Management | Boolean | — | `true` | Master switch for all ContextGuard features |
| `contextGuardTokenLimit` | 📊 Token Limit Before Compression | Number | 1,000–200,000 | `30,000` | Compression triggers at **90%** of this value (e.g., 27k for 30k limit) |
| `contextGuardSmartReading` | 🔍 Smart File Reading | Boolean | — | `true` | Extracts keywords from queries to read only relevant file portions |
| `contextGuardSummaryModel` | 🤖 Summary Model Name | String | Any model name | `""` (current chat model) | Dedicated LM Studio model for summarization tasks |
| `contextGuardTerminalFilterEnabled` | 📌 Terminal Output Filtering | Boolean | — | `true` | Auto-truncates long terminal outputs to save tokens |
| `contextGuardTerminalFilterLength` | 📏 Max Terminal Output Length | Number | 100–20,000 | `2,000` | Characters before terminal output is truncated |

**Access Path:** LM Studio → Plugins → AI Toolbox → ⚙️ Settings → Scroll to "🧠 ContextGuard Token Management" section

---

## 📁 File Structure Reference

```
src/
├── index.ts                    # Plugin entry point
├── toolsProvider.ts            # Tool registration + ToolRegistry class
├── config.ts                   # Zod schema + UI schematics
├── security.ts                 # Path/SQL/command validators
├── stateManager.ts             # Persistent state management
├── workingDir.ts               # Working directory manager
├── performanceUtils.ts         # Caching, async search, Levenshtein
├── promptPreprocessor.ts       # Document RAG + ContextGuard integration
├── backgroundCommands.ts       # Background process manager
├── fuzzySearch.ts              # Fuzzy file search implementation
├── locales/                    # i18n translation files
│   ├── en.ts
│   ├── de.ts
│   ├── zh-CN.ts
│   └── zh-TW.ts
├── tools/                      # Tool category modules
│   ├── fileSystemTools.ts      # 17 file system tools
│   ├── webResearchTools.ts     # 4 web research tools
│   ├── browserAutomationTools.ts # 5 browser tools
│   ├── gitGithubTools.ts       # 14 Git/GitHub tools
│   ├── databaseTools.ts        # 1 database tool
│   ├── backgroundCommandTools.ts # 3 background command tools
│   ├── executionTools.ts       # 4 execution tools
│   ├── utilityTools.ts         # 7 utility tools
│   ├── imageProcessingTools.ts # 4 image processing tools
│   ├── httpClientTools.ts      # 3 HTTP client tools
│   ├── vectorRagTools.ts       # 3 vector RAG tools
│   ├── uiGenerationTools.ts    # 🆕 3 UI generation tools
│   └── contextManagementTools.ts # 🆕 7 context management tools
└── types/                      # Type definitions
    └── types.d.ts

tests/                          # Jest test suite
├── security.test.ts
├── security.edge-cases.test.ts
├── config.test.ts
├── stateManager.test.ts
├── fileSystemTools.test.ts
├── webResearchTools.test.ts
├── browserAutomationTools.test.ts
├── gitGithubTools.test.ts
├── databaseTools.test.ts
├── executionTools.test.ts
├── utilityTools.test.ts
├── backgroundCommands.test.ts
├── toolsProvider.test.ts
├── performanceUtils.test.ts
├── fuzzySearch.test.ts
├── workingDir.test.ts
├── findLMStudioHome.test.ts
└── i18n.test.ts
```
