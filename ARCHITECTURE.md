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
│  │  │  │              Tool Modules (20 files + Gateway)    │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │fileSys │ │webRes  │ │browser │ │  git   │ │  │  │  │
│  │  │  │  │ (21)   │ │ (4)    │ │  (5)   │ │ (13)   │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ datab  │ │backgnd │ │exec    │ │ utility│ │  │  │  │
│  │  │  │  │ (1)    │ │ cmd(3) │ │  (5)   │ │ (28)   │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ image  │ │ http   │ │ vector │ │   UI   │ │  │  │  │
│  │  │  │  │ (4)    │ │ (3)    │ │ RAG(4) │ │ Gen(3) │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ docParse│ │textProc│ │ Context │ │ Backup │ │  │  │  │
│  │  │  │  │  (1)   │ │  (3)   │ │ Mgmt(7) │ │ (4)    │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐                                   │  │  │  │
│  │  │  │  │ LineOps │                                   │  │  │  │
│  │  │  │  │  (3)    │                                   │  │  │  │
│  │  │  │  └────────┘                                   │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │  │
│  ┌─────────────────────────────────────────────────────────┐  │  │
│  │                  External Dependencies                  │  │  │
│  │  Puppeteer │ isomorphic-git │ Tesseract.js │ pdf-parse      │  │  │
│  │  duck-duck-scrape │ node:sqlite │ node-notifier        │  │  │
│  └─────────────────────────────────────────────────────────┘  │  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Build Configuration

The project uses **Tsup** (esbuild-based bundler) for fast, zero-config compilation to both ESM and CJS formats.

### Path Aliases
- `tsconfig.json` defines `@/*` → `src/*` for IDE and TypeScript support.
- `tsup.config.ts` maps `@` → `path.resolve(__dirname, 'src')` to ensure the bundler resolves aliases correctly in the final output.
- Works identically on Windows, Linux, and macOS. No runtime path resolution plugins required.

### Output Targets
- **Format**: `esm` + `cjs` (dual-package compatibility)
- **Target**: `es2020` / `node` platform
- **External Dependencies**: `@lmstudio/sdk`, `puppeteer`, `sharp`, `tesseract.js`, `isomorphic-git`, `pdf-parse`, `mammoth`, `archiver`, `unzipper`, `node-notifier`, `pixelmatch`, `pngjs`
- **Declarations**: Auto-generated `.d.ts` files via `dts: true`

### Build Commands
```bash
npm run build      # Compiles src/ → dist/ with sourcemaps
npm run typecheck  # Validates types without emitting (tsc --noEmit)
npm run lint       # ESLint static analysis
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
  
  // 3. Register tools provider (2 gateway tools only — all others via execute_gateway_tool)
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
            ├── registerGitTools()           ──► 15 tools
            ├── registerDatabaseTools()      ──► 1 tool
            ├── registerDocumentTools()      ──► 1 tool
            ├── registerBackgroundCommandTools() ─► 3 tools
            ├── registerExecutionTools()     ──► 5 tools (filtered)
            ├── registerUtilityTools()       ──► ~28 tools
            ├── registerImageProcessingTools() ─► 4 tools
            ├── registerHttpClientTools()    ──► 3 tools
            ├── registerRagTools()           ──► 4 tools
            ├── registerUiGenerationTools()  ──► 3 tools
            ├── registerContextManagementTools() ─► 7 tools
            └── registerBackupTools()        ──► 4 tools
            └── registerGatewayTools()       ──► 2 tools (v1.6.0+ — always enabled)
            │
            ▼
        ToolRegistry.toolMap (Map<string, TypedTool>)
            │
            ▼
        Return Tool[] to SDK ──► SDK registers with LLM
```

### 3. Context Management Flow

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
    ├── Load existing entries from .ai_toolbox_context.msgpack → .session_context/.ai_toolbox_context.msgpack
    ├── Append new entry to beginning of array
    ├── Limit to 1000 entries (prevent unbounded growth)
    └── Save atomically (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_context.msgpack)
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

Persistent state management with dynamic path resolution:

```typescript
class StateManager {
  private state: Map<string, StateEntry>;
  private maxSize: number;
  private persistenceEnabled: boolean;
  private memoryFile!: string; // Resolved at runtime
  
  set(key, value): void         // In-memory + async disk write
  get<T>(key): T | undefined    // In-memory retrieval
  delete(key): boolean          // In-memory + async disk update
  getAllKeys(): Promise<string[]> // Waits for initialization
  clear(): void                 // Resets in-memory state
}
```

**Key Features:**
- **Dynamic Path Resolution**: `saveToFile()` re-evaluates `getMemoryFilePath()` on every write, ensuring data persists to the actual current working directory even if directories are changed mid-session via `change_directory`.
- **Persistence-Aware getAllKeys()**: When `persistenceEnabled === false`, returns in-memory keys directly (test isolation). When enabled, reloads from disk before returning (handles working dir changes mid-session).
- Atomic file writes (temp file + rename) with corruption recovery
- Size limit enforcement using O(1) running totals
- Fire-and-forget async persistence (non-blocking tool execution)
- Initialization-wait pattern (`_ready` promise) to prevent race conditions

**Session Summary Tool Flow (v1.5.15+):**
```typescript
// save_session_summary writes:
await stateManager.set(`${summaryId}_data`, compressed); // Base64-encoded gzip stream < 10k chars
await stateManager.set(`${summaryId}_timestamp`, Date.now());

// get_session_summary reads with backward-compatible fallback:
const keys = await stateManager.getAllKeys(); // Waits for loadFromFile(), returns all keys
const compressedData = stateManager.get(summaryKey);

try {
  const decompressed = zlib.gunzipSync(Buffer.from(compressedData, 'base64')).toString('utf-8');
  sessionSummary = JSON.parse(decompressed); // New format (v1.5.15+)
} catch (parseErr) {
  // Fallback for legacy uncompressed summaries (pre-v1.5.15)
  if (typeof compressedData === 'string' && compressedData.startsWith('{')) {
    try {
      sessionSummary = JSON.parse(compressedData); // Legacy format
    } catch (legacyErr) {
      throw new Error(`Legacy summary parsing failed: ${String(legacyErr)}`);
    }
  } else {
    throw parseErr; // Corrupted or unknown format
  }
}
```

**Storage Format:**  
- **New summaries (v1.5.15+):** JSON → `zlib.gzipSync(level: 9)` → base64 encoding → stored in StateManager (typically achieves ~30% size reduction)  
- **Legacy summaries (pre-v1.5.15):** Raw JSON strings (uncompressed, backward-compatible via fallback parser)

**Working Directory Integration:**
- `StateManager` initializes via `getMemoryFilePath()` → resolves to `{current_working_dir}/.session_context/.ai_toolbox_memory.msgpack`
- On every save, the path is re-resolved to catch any runtime directory changes
- After plugin reload/restart, StateManager loads from whatever directory was active at that moment

### ContextStorageManager (`src/tools/contextManagementTools.ts`)

Persistent context storage for session tracking:

```typescript
class ContextStorageManager {
  private storagePath: string; // .ai_toolbox_context.msgpack
  
  load(): Promise<ContextEntry[]>
  save(entries: ContextEntry[]): Promise<void>
  addEntry(entry: ContextEntry): Promise<void>
  getRecentEntries(limit, type?): Promise<ContextEntry[]>
  searchEntries(query, maxResults): Promise<ContextEntry[]>
  deleteEntry(id): Promise<boolean>
  clearAll(): Promise<void>
  getSummary(): Promise<ContextSummary>
}
```

**Key Features:**
- MessagePack binary format (msgpack) for compact, efficient storage
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

## 🚀 Gateway Pattern Architecture (v1.6.0+)

**Purpose**: Prevent LLM tool-bloat crashes by providing a single entry point for tool discovery and execution, reducing the initial grammar schema payload from ~111 tools to just 2.

### Problem Solved
Sending all 111+ tools directly to llama.cpp's grammar parser caused `failed to parse grammar` errors due to EBNF recursion limits. The AI also struggled with overwhelming options when deciding which tool to use.

### Solution: Two-Tool Gateway System

```typescript
// src/tools/gatewayTools.ts (NEW)
export async function getGatewayTools(
  provider: ToolsProvider, 
  config: PluginConfig
): Promise<Tool[]> {
  const exploreTools = tool({
    name: 'explore_tools',
    description: 'Discover available tools and their categories...',
    parameters: { category: z.string().optional() },
    implementation: async (params) => {
      await provider.getAvailableTools(); // Ensure registry loaded
      return { success: true, categories: [...] }; // Returns category names only
    }
  });

  const executeGatewayTool = tool({
    name: 'execute_gateway_tool',
    description: 'Executes a specific tool by its name...',
    parameters: { 
      toolName: z.string(),
      arguments: z.record(z.unknown())
    },
    implementation: async (params) => {
      return await provider.executeTool(params.toolName, params.arguments); // Delegates to registry
    }
  });

  return [exploreTools, executeGatewayTool];
}
```

### AI Workflow
```
User Message → AI calls explore_tools(category="fileSystem") 
             → Returns: { success: true, categories: ["read_file", "write_file", ...] }
             → AI decides to use read_file
             → AI calls execute_gateway_tool(toolName="read_file", arguments={file_name: "example.txt"})
             → Gateway delegates to provider.executeTool("read_file", args)
             → Tool executes with full validation, security checks, error handling
```

### Architecture Benefits
- ✅ **Grammar parser crashes eliminated** — Only 2 tools sent to llama.cpp initially instead of ~111
- ✅ **AI workflow improved** — Structured discovery → execution pattern prevents tool confusion
- ✅ **Full functionality preserved** — All tools still accessible via `execute_gateway_tool`
- ✅ **Zero breaking changes** — Existing tool registry and config system unchanged

### Engineering Details
- Gateway tools use the existing `ToolsProvider` singleton for lazy loading of tool modules
- Tool discovery returns category names (not individual tool names) to keep schema small
- Execution delegates to `provider.executeTool()` which handles validation, security checks, and error handling
- TypeScript strict mode compliance: all Zod schemas properly typed, no `any` leakage

---

## 🔐 Security Pipeline

### Path Validation

```
User Path Input
    │
    ├── Empty check ────────────────► Reject
    │
    ├── UNC path check (\\\) ──────► Reject
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
Layer 2: Tool-Category Enforcement
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

### Temporal Awareness Flow

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

### Context Management Flow

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
    ├── Load existing entries from .ai_toolbox_context.msgpack
    ├── Prepend new entry to array
    ├── Enforce 1000-entry limit
    └── Atomic save (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_context.msgpack)
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

#### 🔹 SDK-Native Tokenization Flow (v1.5.35+)

In v1.5.35, ContextGuard's `countTokens()` method was upgraded to use LM Studio's native tokenizer when a model ID is available, replacing the previous hardcoded `'cl100k_base'` Tiktoken approach that caused threshold misalignment.

```
User Message Arrives (ContextGuard Enabled)
    │
    ▼
promptPreprocessor() → contextGuard.countTokens(messages, imageCount, summaryModelId)
    │
    ├── SDK Path Active? (lmClient && modelId provided) ──► Yes
    │   │
    │   ├── Format messages into prompt string for SDK compatibility
    │   │         │
    │   │         ├── Role prefix + content concatenation
    │   │         └── Structured text: `<|start|>role<|end|>\n{content}`
    │   │
    │   ├── Call model.countTokens(promptString) via LM Studio SDK
    │   │         │
    │   │         └── Uses exact tokenizer matching the target LLM (e.g., llama-3, mistral)
    │   │
    │   ├── Parse result: number or number[] → sum if array
    │   │         │
    │   │         └── Add image token estimation (+500 per image)
    │   │
    │   └── Return accurate totalTokens ← ✅ SDK-native precision
    │
    ├── SDK Path Fallback? (error or no modelId) ──► Yes
    │   │
    │   ├── Log warning: `[ContextGuard] SDK token counting failed...`
    │   │         │
    │   │         └── Gracefully degrades to manual Tiktoken encoding ('cl100k_base')
    │   │
    │   └── Return fallback count ← ⚠️ Less accurate, preserves backward compatibility
    │
    ▼
Threshold Check: totalTokens >= tokenLimit * 0.9?
    │
    ├── Yes: compressHistory(messages) → SDK-based counting for compressedPreview too
    └── No: Skip compression
```

**Engineering Notes:**
- The `modelId` parameter is automatically supplied by `compressHistory()` using `this.config.summaryModel`, ensuring consistent tokenizer usage across both threshold checks and post-compression verification.
- Message formatting into a single prompt string bridges the SDK's `countTokens(text: string)` signature with ContextGuard's array-based message model, preserving role/content structure without requiring API changes to the LM Studio SDK.
- TypeScript strict mode compliance achieved through explicit `number | number[]` casting and standard `if/else` type narrowing (eliminated `no-unnecessary-type-assertion` and `no-unsafe-*` violations).

**Impact on AutoTracker:**
AutoTracker's token threshold checks (`checkTokenThreshold(currentTokens, maxTokens)`) receive the accurate SDK-derived count directly from ContextGuard via `promptPreprocessor.ts`. No additional changes were required in `autoTracker.ts` — the end-to-end threshold pipeline now fires precisely at configured percentages (e.g., 75% auto-track trigger, 90% compression trigger).

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
└── ContextGuard (6 fields): v1.4.2
    ├── contextGuardEnabled (boolean) — Master toggle
    ├── contextGuardTokenLimit (number 1K-200K) — Compression threshold
    ├── contextGuardSmartReading (boolean) — Keyword-based file reading
    ├── contextGuardSummaryModel (string) — Dedicated summary model name
    ├── contextGuardTerminalFilterEnabled (boolean) — Terminal output filtering
    └── contextGuardTerminalFilterLength (number 100-20K) — Max terminal chars
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
├── promptPreprocessor.ts       # Document RAG + ContextGuard integration
├── backgroundCommands.ts       # Background process manager
├── fuzzySearch.ts              # Fuzzy file search implementation
├── locales/                    # i18n translation files
│   ├── en.ts
│   ├── de.ts
│   ├── zh-CN.ts
│   └── zh-TW.ts
├── tools/                      # Tool category modules (19 files)
│   ├── fileSystemTools.ts      # File system operations
│   ├── webResearchTools.ts     # Web research & search
│   ├── browserAutomationTools.ts # Browser automation
│   ├── gitHubTools.ts          # Git & GitHub API integration
│   ├── databaseTools.ts        # Database queries
│   ├── documentTools.ts        # Document parsing (PDF/DOCX)
│   ├── backgroundCommandTools.ts # Background process management
│   ├── executionTools.ts       # Code execution (JS/Python/Terminal)
│   ├── utilityTools.ts         # Utility tools (~29 tools: memory, system info, etc.)
│   ├── imageProcessingTools.ts # Image processing & OCR
│   ├── httpClientTools.ts      # HTTP client operations
│   ├── vectorRagTools.ts       # Vector RAG semantic search
│   ├── textProcessingTools.ts  # Text transformation & manipulation
│   ├── uiGenerationTools.ts    # UI component generation
│   ├── contextManagementTools.ts # Context management & tracking
│   ├── refactorCodeTools.ts    # AST-based code refactoring
│   ├── dataVisualizationTools.ts # Chart generation (⚠️ Not currently registered in toolsProvider)
│   ├── backupTools.ts          # Backup & restore operations
│   ├── gatewayTools.ts         # Gateway tools (v1.6.0+ — tool discovery & execution)
│   └── lineOperations.ts       # Line-level text operations
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

---

## 📂 Additional Module Structure (v1.5.34+)

### Recode Tool Engine (`src/tools/recodeTool/`)

The modular "Recode" architecture was introduced in v1.5.34 to support AST-based code transformations:

```text
src/tools/recodeTool/
├── rules/
│   ├── unusedImports.ts      ← Tier 1: Implemented ✅ (extracted from refactorCodeTools.ts)
│   └── deadCodeDetection.ts  ← Tier 1: **Placeholder** (Single-file analyzer only; cross-directory scanning pending ⚠️)
├── recodeEngine.ts           ← AST transformation orchestrator with dry-run diff support (LCS-based)
└── recodeTypes.ts            ← Shared interfaces & schemas (RuleContext, RuleResult, RecodeRule)
```

**Engine Features:**
- ✅ Modular rule architecture — new rules can be added as separate files without modifying core engine
- ✅ Sequential rule application via `runRecodeEngine()` function
- ✅ Dry-run mode with unified diff output using Longest Common Subsequence (LCS) algorithm
- ✅ Backup & rollback support via automatic `.bak` file creation before modifications
- ✅ TypeScript-aware parsing (`plugins: ['typescript']`)
- ✅ Configurable rules via `RecodeConfig.ruleConfigs` object

**Integration:** The existing `refactor_code` tool delegates `unused_import_cleanup` operation to the new engine via lazy-load import in `toolsProvider.ts`.

### Pending Rule Files (Tier 2/3)

The following rule files are defined in the proposal but NOT yet created:
- ⏳ `rules/asyncModernizer.ts` — Callback → async/await conversion
- ⏳ `rules/securityHardener.ts` — Security pattern hardening
- ⏳ `rules/duplicateCodeExtraction.ts` — Duplicate code detection & extraction
- ⏳ `rules/typeInference.ts` — Type inference and annotation fixes
