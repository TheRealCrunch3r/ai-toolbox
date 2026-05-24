# Architecture

Deep dive into the AI Toolbox plugin's system architecture, design patterns, and internal workflows.

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
│  │  │  │  │(path mgmt│ │(caching) │ │(Document RAG)     │ │   │  │  │
│  │  │  │  └──────────┘ └──────────┘ └──────────────────┘ │   │  │  │
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
│  │  │  │  │ (18)   │ │ (4)    │ │  (5)   │ │ (13)   │ │  │  │  │
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
│  │  │  │  │ Mgmt(6) │                                   │  │  │  │
│  │  │  │  └────────┘                                   │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │  │
│  ┌─────────────────────────────────────────────────────────┐  │  │
│  │                  External Dependencies                  │  │  │
│  │  Puppeteer │ simple-git │ Tesseract.js │ pdf-parse      │  │  │
│  │  duck-duck-scrape │ node:sqlite │ node-notifier        │  │  │
│  └─────────────────────────────────────────────────────────┘  │
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
  
  // 2. Register prompt preprocessor (Document RAG)
  context.withPromptPreprocessor(preprocess);
  
  // 3. Register tools provider (all 54+ tools)
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
            ├── registerFileSystemTools()    ──► 18 tools
            ├── registerWebResearchTools()   ──► 4 tools
            ├── registerBrowserTools()       ──► 5 tools
            ├── registerGitTools()           ──► 13 tools
            ├── registerDatabaseTools()      ──► 1 tool
            ├── registerBackgroundCommandTools() ─► 3 tools
            ├── registerExecutionTools()     ──► 4 tools (filtered)
            ├── registerUtilityTools()       ──► 7 tools
            ├── registerImageProcessingTools() ─► 4 tools
            ├── registerHttpClientTools()    ──► 3 tools
            ├── registerRagTools()           ──► 3 tools
            ├── registerUiGenerationTools()  ──► 3 tools (🆕)
            └── registerContextManagementTools() ─► 6 tools (🆕)
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
    ├── Null byte injection ─────────► Reject
    ├── IFS tampering ───────────────► Reject
    ├── Dangerous patterns (rm -rf, sudo, etc.) ─► Reject
    ├── Too many pipes (>2) ─────────► Reject
    ├── Multiple semicolons (>1) ─────► Reject
    ├── Command substitution ($(), ``) ─► Reject
    └── Environment modification ─────► Reject
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
└── Temporal Awareness (2 fields: temporalAwareness, dateFormatStyle)
```

Each field maps to a UI element in LM Studio's settings panel via `createConfigSchematics()`.

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
├── promptPreprocessor.ts       # Document RAG + directory detection
├── backgroundCommands.ts       # Background process manager
├── fuzzySearch.ts              # Fuzzy file search implementation
├── locales/                    # i18n translation files
│   ├── en.ts
│   ├── de.ts
│   ├── zh-CN.ts
│   └── zh-TW.ts
├── tools/                      # Tool category modules
│   ├── fileSystemTools.ts      # 18 file system tools
│   ├── webResearchTools.ts     # 4 web research tools
│   ├── browserAutomationTools.ts # 5 browser tools
│   ├── gitGithubTools.ts       # 13 Git/GitHub tools
│   ├── databaseTools.ts        # 1 database tool
│   ├── backgroundCommandTools.ts # 3 background command tools
│   ├── executionTools.ts       # 4 execution tools
│   ├── utilityTools.ts         # 7 utility tools
│   ├── imageProcessingTools.ts # 4 image processing tools
│   ├── httpClientTools.ts      # 3 HTTP client tools
│   ├── vectorRagTools.ts       # 3 vector RAG tools
│   ├── uiGenerationTools.ts    # 🆕 3 UI generation tools
│   └── contextManagementTools.ts # 🆕 6 context management tools
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
