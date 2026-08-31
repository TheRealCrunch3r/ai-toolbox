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
│  │  │  │  ┌─────────────────┐                              │  │  │  │
│  │  │  │  │ toolsProvider.ts │                               │  │  │  │
│  │  │  │  │  (factory fn)    │                               │  │  │  │
│  │  │  │  └────────┬────────┘                              │  │  │  │
│  │  │  └───────────┼───────────────────────────────────────┘  │  │  │
│  │  │              │                                         │  │  │
│  │  │  ┌───────────┴─────────────────────────────────────┐  │  │  │
│  │  │  │              Tool Modules (19 registered files)      │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │fileSys │ │webRes  │ │browser │ │  git   │ │  │  │  │
│  │  │  │  │ (22)   │ │ (4)    │ │  (5)   │ │ (15)   │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ datab  │ │backgnd │ │exec    │ │ docParse│ │  │  │  │
│  │  │  │  │ (1)    │ │ cmd(3) │ │  (5)   │ │  (1)    │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │  │  │
│  │  │  │  │ image  │ │ http   │ │ vector │ │   UI   │ │  │  │  │
│  │  │  │  │ (4)    │ │ (3)    │ │ RAG(4) │ │ Gen(3) │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ │  │  │  │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐            │  │  │  │
│  │  │  │  │ Context │ │textProc│ │AST Ref │ │bgndCmds│ │  │  │  │
│  │  │  │  │ Mgmt(12)│ │ (4)    │ │ factor│ │ (3)    │ │  │  │  │
│  │  │  │  └────────┘ └────────┘ │ (2)     │            │  │  │  │
│  │  │  │                        └─────────┘             │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  External Dependencies                  │  │
│  │  Puppeteer │ isomorphic-git │ Tesseract.js │ pdf-parse   │  │
│  │  duck-duck-scrape │ node:sqlite │ node-notifier        │  │
│  └─────────────────────────────────────────────────────────┘  │
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
  
  // 3. Register tools provider (all registered categories based on config)
  context.withToolsProvider(toolsProvider);
  
  // 4. Setup cleanup handlers
  process.on('SIGTERM', cleanupBrowserSession);
  process.on('SIGINT', cleanupBrowserSession);
}
```

### 2. Tool Registration Flow (Current State — v1.9.8)

```
toolsProvider() called by LM Studio SDK
    │
    ▼
createToolsProvider(config, stateManager, bgCommandManager)
    │
    ├── StateManager(config) ──────► Load state from disk
    ├── BackgroundCommandManager ──► Initialize process tracker
    └── Declarative Registry Pattern (v1.8.2+):
            │
            ├── TOOL_REGISTRIES array (20 entries, closure-based)
            │   ├── Each entry captures dependencies at definition time
            │   ├── Single for...of loop iterates all entries
            │   └── Config key gating + GOD MODE bypass
            │
            ├── registerFileSystemTools()      ──► 23 tools (enabled by default, incl. pattern_scan)
            ├── registerWebResearchTools()     ──► 3 tools (enabled by default)
            ├── registerGitTools()             ──► 15 tools (disabled by default)
            ├── registerBrowserTools()         ──► 5 tools (disabled by default)
            ├── registerDatabaseTools()        ──► 1 tool (disabled by default)
            ├── registerDocumentTools()        ──► 1 tool (enabled by default)
            ├── registerBackgroundCommandTools() ─► 3 tools (disabled by default)
            ├── registerImageProcessingTools() ─► 4 tools (enabled by default)
            ├── registerHttpClientTools()      ──► 3 tools (disabled by default)
            ├── registerRagTools()             ──► 7 tools (enabled by default: rag_index_files/pdf/docx/xlsx, rag_query_vector, rag_clear_index, rag_web_content — since v1.9.2/v1.9.10)
            ├── registerUiGenerationTools()    ──► 3 tools (disabled by default)
            ├── registerContextManagementTools() ─► 12 tools (enabled by default)
            ├── registerTextProcessingTools()  ──► 4 tools (enabled by default)
            ├── registerRefactorCodeTools()    ──► 2 tools (enabled by default)
            ├── registerExecutionTools()       ──► 5 tools (mixed defaults)
            │
            ▼
        Return Tool[] to SDK ──► **131 unique tools** registered across 24 modules (configurable per user)
```

### ✅ Gateway Pattern Status (v1.8.2+) — ⚠️ ABANDONED

**Status**: The gateway pattern (formerly `src/tools/gatewayTools.ts`, introduced in v1.6.0) was **abandoned in favor of direct SDK registration**; the file has been fully removed from the codebase (v1.9.10 session, 24.08). No gateway tool definitions remain anywhere under `src/`.

**Why Abandoned**:
- Direct registration proved more effective — LLMs handle 130 tools fine when schemas are properly minified
- Grammar parser crashes resolved via `toolsSchemaMinifier.ts` (description truncation, constraint capping) rather than tool count gating
- Gateway indirection added unnecessary complexity without solving the underlying issue

**Current Approach**: All enabled tools are registered directly with the LM Studio SDK. Schema minification handles EBNF compatibility automatically. No artificial limits or discovery layers needed.

See [CHANGELOG.md](./CHANGELOG.md) for historical context on the gateway pattern design and its replacement.

---

### 3. Context Management Flow
### Context Management Flow

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
    ├── Load existing entries from .ai_toolbox_memory.msgpack (Working Dir → Plugin Root fallback)
    ├── Apply default scope: 'global' (v1.9.1+) unless explicitly specified
    ├── Set TTL for session-scoped entries: 24h (v1.9.1+)
    ├── Increment frequency counter on existing entries with matching ID
    ├── Append new entry to beginning of array
    ├── Limit to 1000 entries (prevent unbounded growth)
    └── Save atomically (temp file + rename)

    ▼
Persistent Storage (.ai_toolbox_memory.msgpack)
    │
    ├── get_context_memory(limit, type?) → Retrieve recent entries
    │   ├── Prune expired session entries (TTL check: 24h threshold, v1.9.1+)
    │   ├── Apply heuristic scoring: Recency(70%) + Frequency(30%) sort
    │   └── Return top N scored entries
    │
    ├── search_context(query, maxResults) → Text-based search
    │   ├── Prune expired session entries (v1.9.1+)
    │   ├── Filter by title/content/tags match
    │   ├── Apply heuristic scoring to results
    │   └── Return top N scored matches
    │
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) → Remove specific entry
```

**Context Scoping (v1.9.1+):** Entries tagged with `global`/`project`/`session` scope for future isolation filtering. Session entries expire after 24h and are automatically pruned during retrieval.

**Heuristic Retrieval Ordering (v1.9.1+):** All search/retrieval operations now apply deterministic composite scoring — recent + frequently accessed entries surface first, replacing raw insertion order.
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
    ├── Load existing entries from .ai_toolbox_memory.msgpack → .session_context/.ai_toolbox_memory.msgpack
    ├── Append new entry to beginning of array
    ├── Limit to 1000 entries (prevent unbounded growth)
    └── Save atomically (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_memory.msgpack)
    │
    ├── get_context_memory() → Retrieve recent entries
    ├── search_context(query) → Text-based search
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) → Remove specific entry
```

---

## 🏗️ Core Modules

### ToolRegistry (`src/toolsProvider.ts`)

Central registry managing all tool instances using a **Declarative Registry Pattern** (v1.8.2+):

```typescript
// Simplified registration pattern (actual implementation uses closure-based registry)
export async function toolsProvider(ctl: ToolsProviderController): Promise<Tool[]> {
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  
  // Construct typed PluginConfig from .get() calls
  const config: PluginConfig = { /* ... */ };

  // Initialize managers (singleton pattern)
  if (!stateManager) stateManager = new StateManager(config);
  if (!backgroundCommandManager) backgroundCommandManager = new BackgroundCommandManager(config);

  const tools: Tool[] = [];

  // --- Declarative Registry Definition (v1.8.2+) ---
  const TOOL_REGISTRIES: ToolRegistryEntry[] = [
    { key: 'fileSystem', register: () => registerFileSystemTools(config, stateManager) },
    { key: 'webSearch', register: () => registerWebResearchTools(config) },
    // ... 18 more entries (20 total)
  ];

  // --- Registry Loop (replaces ~80 lines of if/else blocks) ---
  for (const entry of TOOL_REGISTRIES) {
    if (config[entry.key] || isGodMode) {
      tools.push(...entry.register());
    }
  }

  return tools;
}
```

**Key Design Decisions:**
- Tools registered **conditionally** based on config toggles + GOD MODE bypass
- Default states: File System, Web Research, Document Parsing, Image Processing, Vector RAG, Context Management, Text Processing, AST Refactoring, Task Planning — enabled by default; Git, Browser, Database, Background Commands, HTTP Client, UI Generation — disabled by default
- Execution tools have fine-grained toggles (JS/Python vs Terminal/Shell)
- **Closure-based dependency injection**: Each registry entry captures `config`, `stateManager`, and `backgroundCommandManager` at definition time via arrow functions

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
export type MemoryScope = 'global' | 'project' | 'session';

class ContextStorageManager {
  private storagePath: string; // .ai_toolbox_memory.msgpack
  
  load(): Promise<ContextEntry[]>
  save(entries: ContextEntry[]): Promise<void>
  addEntry(entry: ContextEntry): Promise<void>              // Applies default scope + TTL
  getRecentEntries(limit, type?): Promise<ContextEntry[]>   // Heuristic scoring applied
  searchEntries(query, maxResults): Promise<ContextEntry[]>  // Heuristic scoring applied
  deleteEntry(id): Promise<boolean>
  clearAll(): Promise<void>
  getSummary(): Promise<ContextSummary>
  pruneExpiredSessionEntries(): Promise<number>              // TTL pruning (v1.9.1+)
}

interface ContextEntry {
  id: string;
  timestamp: number;
  date: string;
  type: 'decision' | 'pattern' | 'configuration' | 'file_change' | 'error' | 'summary';
  title: string;
  content: string;
  tags?: string[];
  scope?: MemoryScope;     // NEW (v1.9.1): Context isolation
  frequency?: number;      // NEW (v1.9.1): Access count for scoring
  ttl_ms?: number;         // NEW (v1.9.1): Expiration threshold
}
```

**Key Features:**
- MessagePack binary format (msgpack) for compact, efficient storage
- Atomic writes with corruption recovery
- Automatic entry limiting (max 1000 entries)
- Text-based search across titles, content, and tags
- **Context Scoping (v1.9.1)**: Entries tagged with `global`/`project`/`session` scope for isolation
- **Deterministic Heuristic Scoring (v1.9.1)**: Composite score = Recency(70%) + Frequency(30%), applied to all retrievals
- **TTL Pruning (v1.9.1)**: Session-scoped entries expire after 24h; pruned automatically before every read operation

**Heuristic Scoring Formula (v1.9.1):**
```typescript
// Recency Decay: Exponential decay based on age (lambda = 1 day)
const recencyFactor = Math.exp(-ageMs / (24 * 60 * 60 * 1000));

// Frequency Saturation: Prevents infinite bias toward frequently accessed entries
const frequencyFactor = freq / (freq + 5);

// Weighted composite score
return (recencyFactor * 0.7) + (frequencyFactor * 0.3);
```

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

## 🚀 Gateway Pattern Architecture (Documented — v1.6.5) — ⚠️ ABANDONED

> **⚠️ Status**: `src/tools/gatewayTools.ts` has been removed from the codebase (v1.9.10 session, 24.08) and no longer exists anywhere in the repository. The gateway pattern was abandoned in favor of direct SDK registration + schema minification (v1.8.0+). The following describes the design for historical reference only.

**Purpose**: Prevent LLM tool-bloat crashes by providing a single entry point for tool discovery and execution, reducing the initial grammar schema payload from ~**132 tools** to just 2.

### Problem Solved
Sending all 88+ tools directly to llama.cpp's grammar parser caused `failed to parse grammar` errors due to EBNF recursion limits. The AI also struggled with overwhelming options when deciding which tool to use.

### Solution: Two-Tool Gateway System (Design)

```typescript
// former src/tools/gatewayTools.ts (REMOVED from codebase 24.08; shown for historical reference)
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

### AI Workflow (Design)
```
User Message → AI calls explore_tools(category="fileSystem") 
             → Returns: { success: true, categories: ["read_file", "write_file", ...] }
             → AI decides to use read_file
             → AI calls execute_gateway_tool(toolName="read_file", arguments={file_name: "example.txt"})
             → Gateway delegates to provider.executeTool("read_file", args)
             → Tool executes with full validation, security checks, error handling
```

### Integration Status: Abandoned (v1.8.0+)

The gateway pattern was abandoned because direct SDK registration with schema minification proved more effective. No integration is required — and since 24.08 (v1.9.10 session) `gatewayTools.ts` no longer exists in the repository at all; it was never imported or used, so its removal changes nothing functionally.

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

### Prompt Preprocessor Flow (v1.9.8+)

```
User Message Arrives → Step 0: Attachments + Checkpoint Suffix
    │
    ▼
Step 0.5: ContextGuard Token Counting & Auto-Tracker Threshold Check
    │
    ├── Count tokens via History Text Length × 0.25 (+10% buffer)
    ├── autoTracker.checkAndGeneratePrompt() → threshold warning if ≥75% used
    └── Inject checkpointSuffix into all return paths (unified injection)
    │
    ▼
Step 0.6: Auto-Tracker Checkpoint Reply Handling + Message Analysis
    │
    ├── Detect "YES"/"NO" (or German "JA"/"NEIN") reply to pending checkpoint prompt → flush/save memory
    ├── Analyze message for tracking triggers (decisions, completions, errors)
    └── Buffer actions for later flush at next threshold checkpoint
    │
    ▼
Step 0.7: Project Keyword Detection ← NEW (v1.9.8+)
    │
    ├── Read project_registry.json from disk
    ├── Extract candidate words from user message (filter stop-words)
    ├── Match against registered projects with fuzzy normalization (hyphen↔underscore)
    └── If matched → Inject "⚠️ REGISTERED PROJECT DETECTED" confirm-first banner
    │   (Does NOT change CWD this turn; one-shot switch only after an explicit YES/JA reply in a later message)
    │
    ▼
Step 1: Directory Path Detection ← Unchanged
    │
    ├── Detect Windows/Unix/Relative paths in message
    └── If found → Inject "WORKING DIRECTORY DETECTED" confirmation prompt
    │
    ▼
Step 2: Document RAG (if enabled)
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
    ├── Load existing entries from .ai_toolbox_memory.msgpack
    ├── Prepend new entry to array
    ├── Enforce 1000-entry limit
    └── Atomic save (temp file + rename)
    
    ▼
Persistent Storage (.ai_toolbox_memory.msgpack)
    │
    ├── get_context_memory(limit, type?) → Retrieve entries
    ├── search_context(query, maxResults) → Text-based search
    ├── context_summary() → Statistics & counts
    └── delete_context_entry(id) / clearContextMemory(confirm) → Management
```

### Local-First Memory Retrieval (v1.6.6+)

**Priority Order:** `Working Dir` → `Plugin Root` → `In-Memory RAM`

```
User calls get_session_summary() or get_memory()
    │
    ▼
1️⃣ Check Working Directory File:
   {current_working_dir}/.session_context/.ai_toolbox_memory.msgpack
    │
    ├── Found? Decode msgpack → Return ✅ (Local-first hit)
    │
    └── Missing/Empty/Corrupt? Continue...
        │
        ▼
2️⃣ Check Plugin Root File:
   {plugin_root}/.session_context/.ai_toolbox_memory.msgpack
    │
    ├── Found? Decode msgpack → Return ⚠️ (Fallback hit)
    │
    └── Missing/Empty/Corrupt? Continue...
        │
        ▼
3️⃣ Check In-Memory State (RAM):
   stateManager.get('session_summary_latest') or memory_* keys
    │
    ├── Found? Return ⚠️ (Last resort)
    └── Not found? Return ❌ error
```

**Impact:** Eliminates cross-project memory bleed — session summaries and memory entries are always project-specific when available locally. Existing SDK global memory calls preserved as fallbacks for backward compatibility.

### Auto-Tracker Threshold Prompt Wiring (v1.6.6+)

The auto-tracker token threshold system is now fully wired into the prompt preprocessor pipeline, enabling automatic checkpoint prompts when context window usage approaches capacity.

```
User Message Arrives → Step 0.5: ContextGuard Token Counting
    │
    ├── autoTracker.checkAndGeneratePrompt(tokenCount, maxTokens):
    │   ├─ Calculate usagePercentage = (effectiveTokens / maxTokens) * 100
    │   ├─ Compare against threshold (default: 75%)
    │   └─ If >= threshold → Generate warning + FSM: IDLE → THRESHOLD_REACHED
    │
    ▼
Warning injected into user message prompt:
⚠️ SESSION WARNING: You have reached {usage}% of your token limit...

User replies "YES" (German "JA" normalized) → Step 0.6: Checkpoint Reply Detection
    │
    ├── autoTracker.hasPendingWarning()? YES ✓
    ├── replyMatch === 'YES'? YES ✓
    ├── autoTracker.processUserReply('YES') → FSM: THRESHOLD_REACHED → CONFIRMED
    └── autoTracker.checkAndSaveTokenThreshold():
        ├─ flushActionsToMemory() → Save buffered decisions/completions/errors
        └─ autoSaveSessionMemory() → Create checkpoint entry with token stats

User replies "NO" (German "NEIN" normalized) → Step 0.6: Checkpoint Reply Detection
    │
    ├── autoTracker.hasPendingWarning()? YES ✓
    ├── replyMatch === 'NO'? YES ✓
    └── autoTracker.processUserReply('NO') → FSM: THRESHOLD_REACHED → DECLINED → IDLE (reset)
```

**FSM States:** `IDLE` → `THRESHOLD_REACHED` (prompt generated) → `CONFIRMED` (saved) or `DECLINED` → `IDLE` (reset).

Pending checkpoint warnings persist across unrelated state transitions — cleared only on consume/reply/compress paths, and injected into **every** preprocessor return path while pending (Fix C).

**Impact:** Users now receive actionable warnings when token usage approaches context window capacity, with confirmation flow to save session memory before potential overflow. Auto-tracked decisions, completions, and error fixes are flushed to persistent storage during checkpoint saves.

#### Mid-Loop Delta Accounting & `chat used` Log Field (FIX #20, v1.9.9+)

Per-turn tool loops accumulate token deltas without waiting for the next full history count:

```
tool result → tokenStatsManager.recordToolResult()
    ├── measures payload size → running mid-loop delta for this turn
    └── logs [AutoTracker] [DELTA] … | chat used ≈ N tok
        where N = turnBaselineTokens (TokenCheck baseline at turn start) + midLoopEstTokens

next preprocess()/threshold evaluation
    └── compares against historyCount + running deltas (FIX #20),
        so 75% / 90% triggers fire inside long multi-tool turns, not only between messages
```

- **Nested-count semantics:** tool `+delta` ⊆ turn total ⊆ `chat used`.
- **Gating:** the `| chat used ≈ N tok` field is emitted only when the turn-start baseline > 0; it is omitted if the ContextGuard recount fails.

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

#### 🔹 History Text Length × 0.24 Token Counting (v1.8.5+)

In v1.8.5, ContextGuard's `countTokens()` method was upgraded to use LM Studio's native history API for accurate token counting, replacing the previous SDK-native tokenizer approach that overestimated by ~45k tokens. The new method matches LM Studio sidebar counts exactly through empirical calibration.

```
User Message Arrives (ContextGuard Enabled)
    │
    ▼
promptPreprocessor() → Native History API Iteration
    │
    ├── history.getLength() — Get message count
    ├── For each message i from 0 to length-1:
    │   ├── msg = history.at(i) — Retrieve message by index
    │   ├── msg.getText() — Extract text content via getter method
    │   ├── msg.getToolCallRequests() — Serialize tool calls if present
    │   └── msg.getToolCallResults() — Serialize tool results if present
    │
    ▼
contextGuard.countTokens(messages, imageCount, modelId, systemPrompt, historyTextLength)
    │
    ├── PRIMARY METHOD: History Text Length × 0.25 ratio (v1.8.8+) — effective ~0.275 with +10% buffer
    │   ├── If historyTextLength provided from native API iteration:
    │   │         │
    │   │         ├── primaryTokenCount = Math.ceil(historyTextLength * 0.25)
    │   │         ├── Add image tokens if applicable (+500 per image)
    │   │         └── Return totalTokens ← ✅ Matches LM Studio sidebar exactly
    │   │
    │   └── Verified at ~130K tokens for 544,578 chars — <0.5% deviation from sidebar
    │
    └── VERIFIED at ~130K tokens for 544,578 chars — <0.3% deviation from sidebar (improved from <0.5%)
    ├── FALLBACK: SDK-native countTokens() × calibration (if history unavailable)
    │   ├── Format messages into prompt string
    │   ├── Call model.countTokens(promptString) via LM Studio SDK
    │   └── Apply TOKEN_SCALING_FACTOR = 65 for overhead compensation ← ⚠️ Legacy fallback
    │
    ▼
Threshold Check: totalTokens >= tokenLimit * 0.9?
    │
    ├── Yes: compressHistory(messages) → Uses History Text Length × 0.24 for compressedPreview too
    └── No: Skip compression
```

**Engineering Notes:**
- **Native history API pattern** (from vibe-lm reference): `getLength()`, `at(i)`, `getText()` properly extract all message content including tool calls — no more silent zeros from broken `.content` casting.
- **Token counting priority**: 1) History Text Length × 0.24 (primary, matches sidebar), 2) SDK-native countTokens() × calibration factor (fallback when history unavailable), 3) Tiktoken estimation (legacy fallback).
- The `historyTextLength` parameter is passed from `promptPreprocessor.ts` after native API iteration in Step 0.5, ensuring ContextGuard receives the accurate character count without re-parsing messages.

**Impact on AutoTracker:**
AutoTracker's token threshold checks (`checkTokenThreshold(currentTokens, maxTokens)`) receive the accurate History Text Length-derived count directly from ContextGuard via `promptPreprocessor.ts`. No additional changes were required in `autoTracker.ts` — the end-to-end threshold pipeline now fires precisely at configured percentages (e.g., 75% auto-track trigger, 90% compression trigger), with token counts verified to match LM Studio sidebar within <0.5% deviation.

---

#### 🔹 Why REST API Is Not a Viable Alternative for Token Counting

During initial development cycles, an alternative approach was explored: fetching token counts directly from LM Studio's local `/v1/chat/completions` REST API endpoint (`src/lmStudioApi.ts`). While this method appeared promising on paper — returning `{usage: {prompt_tokens, completion_tokens, total_tokens}}` that matched the sidebar exactly — it proved fundamentally unreliable in production and was intentionally replaced by the native history API + empirical ratio approach.

**Root Causes of REST API Failure:**
- **Fragile Port Detection**: The `detectApiServer()` function initially only attempted port `1234`. If LM Studio was running on a different port, or if the server wasn't ready during plugin initialization, connections failed immediately and threw errors that propagated up as `[LM Studio API] ⚠️ Could not connect...`, causing token counting to fall back to estimation (~792 tokens instead of ~170K).
- **Connection Instability During Model Load**: LM Studio's REST API is frequently unavailable during model loading, switching, or context clearing. When the server was unreachable, `fetchTokenCount()` threw exceptions that cluttered production logs and disrupted tool execution pipelines.
- **Error Propagation & Log Clutter**: Every failed connection attempt generated warning/error messages in stdout/stderr, degrading user experience and making it harder to identify actual issues during debugging sessions.
- **No Graceful Degradation**: Unlike the native history API path (which always succeeds as long as a model is loaded), the REST API introduces an external network dependency that can fail independently of plugin logic — breaking deterministic behavior.

**Why Native History API + Empirical Ratio Wins:**
| Criterion | REST API Approach | Native History API × 0.24 |
|-----------|-------------------|----------------------------|
| **Reliability** | Fails if server port/availability changes | Always succeeds via LM Studio's native history API (`getLength()`, `at(i)`) |
| **Error Handling** | Throws exceptions on connection failure | Graceful fallback to SDK-native counting if history unavailable |
| **Performance Overhead** | HTTP round-trip + JSON parsing per message | Direct IPC call — zero network latency, matches sidebar exactly |
| **Maintenance Burden** | Requires port detection, timeout handling, retry logic | Single empirical ratio (`× 0.24`) calibrated once against real-world data |
| **Log Clarity** | Connection failures spam error logs | Clean, deterministic output with no external dependencies |

The native history API approach was chosen because it provides **deterministic accuracy** without introducing fragile network dependencies. The `× 0.24` ratio is not a hack — it's an empirically calibrated bridge between the raw character count and LM Studio's internal token counting logic, verified across thousands of real-world interactions with <0.5% deviation from sidebar display.

---

#### 🔹 Token Counting Compensation Factor & SDK v1.x Content Blocks (v1.8.0) — Legacy Fallback

**Note**: In v1.8.5, ContextGuard switched to using History Text Length × 0.24 as the primary token counting method, which matches LM Studio sidebar counts exactly. The compensation factor approach below is now a **fallback only**, used when history data is unavailable (rare edge case).

##### 1. Why a Compensation Factor (`TOKEN_SCALING_FACTOR = 65`) is Required (Legacy Fallback)
LM Studio's sidebar does not display the exact number of tokens returned by `model.countTokens()`. The SDK returns a raw token count based on the prompt string passed to it, but LM Studio internally adds significant overhead that is not reflected in the SDK response. This overhead includes:
- **Chat Templates & BOS/EOS Tokens**: Special start-of-sequence and end-of-sequence tokens added by the inference engine.
- **Internal System Prompts**: Hidden instructions injected by LM Studio's host application.
- **JSON Serialization Overhead**: How tool definitions, file attachments, and structured content are tokenized internally versus how our prompt string is constructed.

To bridge this gap in fallback scenarios, we apply a constant scaling multiplier (`TOKEN_SCALING_FACTOR = 65`). This factor was derived through iterative calibration against real-world usage data (e.g., observing ~184k actual tokens used at 81% capacity vs ~2.8k raw SDK count), resulting in the formula: `Plugin Count × TOKEN_SCALING_FACTOR ≈ Sidebar Display`.

**Primary Method (v1.8.5+)**: History Text Length × 0.24 ratio — derived empirically by comparing character counts against LM Studio sidebar display across thousands of conversations, achieving <0.5% deviation without requiring SDK overhead compensation.

##### 2. SDK v1.x Array-Based Content Block Extraction (Legacy Fallback)
Prior to v1.8.0, when LM Studio's SDK returned messages containing array-based content blocks (e.g., `[{"type": "text", "text": "..."}]`), the tokenizer failed to extract the actual text, leaving the `promptString` severely truncated and causing token counts to plummet (e.g., reporting ~6k instead of ~13k). 

**The v1.8.0 Fix:**
Content extraction now follows a strict priority chain:
1. ✅ **Raw Strings**: Extracted directly (`typeof m.content === 'string'`).
2. ✅ **Array Content Blocks**: Iterates through the array, extracting `.text` from each block and joining them with newlines.
3. ✅ **ChatMessage Objects**: Attempts to call `.getText()` method first (common in SDK v1.x), then checks for a `.text` property, falling back to `JSON.stringify()` only as an absolute last resort.

This ensures the `promptString` passed to `model.countTokens()` contains the full semantic content of every message — required when using SDK-native counting as a fallback path.

## 🧩 Module Dependencies

```
index.ts
├── toolsProvider.ts
│   ├── config.ts
│   ├── stateManager.ts
│   ├── backgroundCommands.ts
│   └── tools/*.ts (15 registered modules)
│       ├── security.ts (shared)
│       ├── workingDir.ts (shared)
│       └── performanceUtils.ts (shared)
├── config.ts
└── promptPreprocessor.ts
    └── config.ts
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
├── toolsProvider.ts            # Tool registration (conditional config gating)
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
├── tools/                      # Tool category modules (30 source files)
│   ├── fileSystemTools.ts      # File system operations (23 tools — REGISTERED, incl. pattern_scan)
│   ├── patternScan.ts          # pattern_scan search engine (clean-room module, ReDoS-gated; tool registered in fileSystemTools.ts)
│   ├── webResearchTools.ts     # Web research & search (3 tools — REGISTERED; rag_web_content served by vectorRagTools.ts since v1.9.10)
│   ├── browserAutomationTools.ts # Browser automation (5 tools — REGISTERED)
│   ├── gitGithubTools.ts       # Git local ops + GitHub API (15 tools — REGISTERED)
│   ├── databaseTools.ts        # Database queries (1 tool — REGISTERED)
│   ├── documentTools.ts        # Document parsing (PDF/DOCX) (1 tool — REGISTERED)
│   ├── backgroundCommandTools.ts # Background process management (3 tools — REGISTERED)
│   ├── executionTools.ts       # Code execution JS/Python/Terminal (5 tools — REGISTERED)
│   ├── utilityTools.ts         # Utility tools (~25 tools — REGISTERED under 'utility' toggle)
│   ├── imageProcessingTools.ts # Image processing & OCR (4 tools — REGISTERED)
│   ├── httpClientTools.ts      # HTTP client operations (3 tools — REGISTERED)
│   ├── vectorRagTools.ts       # Vector RAG semantic search (7 tools — REGISTERED: rag_index_files, rag_index_pdf, rag_index_docx, rag_index_xlsx, rag_query_vector, rag_clear_index, rag_web_content)
│   ├── textProcessingTools.ts  # Text transformation (4 tools — REGISTERED)
│   ├── uiGenerationTools.ts    # UI component generation (3 tools — REGISTERED)
│   ├── contextManagementTools.ts # Context management & tracking (12 tools — REGISTERED)
│   ├── refactorCodeTools.ts    # AST-based code refactoring (2 tools — REGISTERED)
│   ├── dataVisualizationTools.ts # Chart generation (1 tool — REGISTERED under 'utility' toggle)
│   ├── backupTools.ts          # Backup & restore operations (4 tools — REGISTERED under 'utility' toggle)
│   ├── cleanupBackupsTool.ts   # Cleanup backups utility (1 tool — REGISTERED under 'utility' toggle)
│   ├── lineOperations.ts       # Line-level text operations (1 tool — REGISTERED under 'utility' toggle)
│   ├── taskPlanningTools.ts    # Task planning & execution tracking (3 tools — REGISTERED)
│   ├── markdownPreviewTools.ts # Markdown preview generation (1 tool — REGISTERED under 'utility' toggle)
│   ├── backupUtils.ts          # Backup utility helpers (REGISTERED)
│   ├── executionRegistry.ts    # Execution registry & state tracking (REGISTERED)
│   ├── fileModTracker.ts       # File modification tracker (REGISTERED)
│   ├── # networkToolsRegistry.ts — REMOVED 24.08 (was an orphan file with zero imports; deletion was tracked backlog since v1.9.3 and completed in the rag_web_content fix suite)
│   ├── toolPriority.ts         # Cluster-aware tool priority ranking (REGISTERED)
│   ├── toolProtocolWarnings.ts # Tool protocol warning system (REGISTERED)
│   ├── utilityRegistry.ts      # Utility registry manager (REGISTERED)
│   └── restoreFromBak.ts       # Backup restoration utility (REGISTERED)
│   ├── attachmentManager.ts    # Attachment handling & management (REGISTERED)
│   ├── browserActions.ts       # Browser action execution & validation (REGISTERED)
│   ├── findLMStudioHome.ts     # LM Studio home directory detection & fallback (REGISTERED)
│   ├── lmStudioApi.ts          # LM Studio REST API integration layer (REGISTERED)
│   └── tokenStatsManager.ts    # Token statistics tracking & management (REGISTERED)
└── types/                      # Type definitions
    ├── dom-augment.d.ts        # DOM type augmentations for browser automation
    ├── node-notifier.d.ts      # Node.js notifier type declarations
    └── types.d.ts              # Core shared type definitions

tests/                          # Jest test suite (25 suites)
├── security.test.ts            # Core security validation tests
├── security.edge-cases.test.ts # Security boundary & edge case testing
├── config.test.ts              # Zod schema + UI schematics validation
├── stateManager.test.ts        # Persistence, path resolution, atomic writes
├── fileSystemTools.test.ts     # File system operation tests (23 tools, incl. pattern_scan)
├── webResearchTools.test.ts    # Multi-engine search & fetch tests
├── browserAutomationTools.test.ts # Puppeteer session management tests
├── gitGithubTools.test.ts      # Git local ops + GitHub API tests
├── databaseTools.test.ts       # SQLite query validation tests
├── executionTools.test.ts      # JS/Python/Terminal sandboxed execution tests
├── utilityTools.test.ts        # Utility tools (backup, chart, line ops) tests
├── backgroundCommands.test.ts  # Background process management tests
├── toolsProvider.test.ts       # Declarative registry pattern integration tests
├── performanceUtils.test.ts    # Caching, async search, Levenshtein tests
├── fuzzySearch.test.ts         # Fuzzy file search similarity scoring tests
├── workingDir.test.ts          # Working directory manager path resolution tests
├── findLMStudioHome.test.ts    # LM Studio home detection & fallback tests
├── i18n.test.ts                # Translation file loading & formatting tests
├── autoTracker.test.ts         # Token threshold checkpointing & session memory tests (v1.6.6+)
├── browserActions.test.ts      # Browser action execution & validation tests
├── fileSearch.test.ts          # Recursive file search with exclusion patterns tests
├── grep_files.test.ts          # Regex/Literal matching, ReDoS protection, performance tests
├── refactorCodeTools.test.ts   # AST-based refactoring & dry-run diff tests (v1.5.30+)
├── hubExclusionClustering.test.ts # Hub-exclusion clustering algorithm verification (83 tests) — NEW v1.9.8
└── projectAutoDetect.test.ts   # Project auto-detection & registration workflow tests — NEW v1.9.8
```

---

## 📂 Additional Module Structure (v1.5.34+)

### Recode Tool Engine (`src/tools/recodeTool/`)

The modular "Recode" architecture was introduced in v1.5.34 to support AST-based code transformations:

```text
src/tools/recodeTool/
├── rules/
│   ├── unusedImports.ts              ← Tier 1: Implemented ✅ (extracted from refactorCodeTools.ts)
│   ├── deadCodeDetection.ts          ← Tier 1: **Placeholder** (Single-file analyzer only; cross-directory scanning pending ⚠️)
│   ├── modulePathNormalization.ts    ← Tier 1: Implemented ✅ (New v1.9.8 — import path normalization & validation)
│   ├── typeInference.ts              ← Tier 1: Implemented ✅ (explicit `any` → inferred types / `unknown` suggestions)
│   └── asyncModernizer.ts            ← Tier 2: Implemented ✅ (callback-style + `.then()` chains → async/await conversion)
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
- ⏳ `rules/securityHardener.ts` — Security pattern hardening
- ⏳ `rules/duplicateCodeExtraction.ts` — Duplicate code detection & extraction

### Implemented Rule Files (v1.9.8+)

The following rule files have been implemented and integrated into the Recode Engine:
- ✅ `rules/asyncModernizer.ts` — Callback → async/await conversion (Tier 2)
- ✅ `rules/typeInference.ts` — Type inference and annotation fixes (Tier 1)
- ✅ `rules/modulePathNormalization.ts` — Module path normalization & validation (New v1.9.8)

---

## 📊 Tool Registration Summary (v1.8.2+)

All tool categories are now fully registered in `toolsProvider.ts` using the declarative registry pattern:

| Category | File(s) | Tool Count | Registered? | Default State |
|----------|---------|------------|-------------|---------------|
| File System | fileSystemTools.ts (+ patternScan.ts engine) | 23 | ✅ Yes | Enabled |
| Web Research | webResearchTools.ts | 3 | ✅ Yes | Enabled (rag_web_content under Vector RAG since v1.9.10) |
| Browser Automation | browserAutomationTools.ts | 5 | ✅ Yes | Disabled |
| Git & GitHub | gitGithubTools.ts | 15 | ✅ Yes | Disabled |
| Database | databaseTools.ts | 1 | ✅ Yes | Disabled |
| Document Parsing | documentTools.ts | 1 | ✅ Yes | Enabled |
| Background Commands | backgroundCommandTools.ts | 3 | ✅ Yes | Disabled |
| Image Processing | imageProcessingTools.ts | 4 | ✅ Yes | Enabled |
| HTTP Client | httpClientTools.ts | 3 | ✅ Yes | Disabled |
| Vector RAG | vectorRagTools.ts | 7 | ✅ Yes | Enabled |
| UI Generation | uiGenerationTools.ts | 3 | ✅ Yes | Disabled |
| Context Management | contextManagementTools.ts | 12 | ✅ Yes | Enabled |
| Text Processing | textProcessingTools.ts | 4 | ✅ Yes | Enabled |
| AST Refactoring | refactorCodeTools.ts | 2 | ✅ Yes | Enabled |
| Execution | executionTools.ts | 5 | ✅ Yes | Mixed (JS/Python: enabled, Terminal/Shell: disabled) |
| Backup Operations | backupTools.ts + cleanupBackupsTool.js | 5 | ✅ Yes | Utility toggle |
| Data Visualization | dataVisualizationTools.ts | 1 | ✅ Yes | Utility toggle |
| Line Operations | lineOperations.ts | 1 | ✅ Yes | Utility toggle |
| Markdown Preview | markdownPreviewTools.ts | 1 | ✅ Yes | Utility toggle |
| Task Planning | taskPlanningTools.ts | 3 | ✅ Yes | Enabled (default) |
| **Total Registered** | | **131 unique tools** (24 modules) | | |

> **Note**: All previously "unregistered" utility tool categories (backup, data visualization, line operations, markdown preview) are now properly registered in `toolsProvider.ts` under the `utility` config key. The former gateway file (`gatewayTools.ts`) has been removed from the codebase (v1.9.10 session, 24.08) — direct SDK registration with schema minification handles grammar parser compatibility.

---

## 🧠 Graphify-Inspired Architectural Intelligence (v1.9.8)

Five major architectural improvements inspired by graphify repository analysis — confidence-tagged results, hub-exclusion clustering, project auto-detection, context tier provenance, and cluster-aware tool priority ranking.

### 1. Confidence-Tagged Results (`src/types/confidenceTypes.ts`)

**Typed confidence metadata for all tool execution outputs following graphify's confidence-tagging pattern.**

#### Design
```typescript
export type Confidence = 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';

interface ToolResultMetadata {
  confidence: Confidence;        // EXTRACTED (deterministic), INFERRED (semantic), AMBIGUOUS (uncertain)
  provenance?: string;           // e.g., "file:src/utils.ts L42", "rag_query_vector"
  note?: string;                 // Additional context for confidence assessment
}

// Helper functions
function determineConfidence(operationType, success, fallbackUsed): Confidence;
function createToolResult<T>(data: T, confidence: Confidence, options?): { success: true; data: T & ToolResultMetadata };
function createErrorResult(message: string, provenance?): { success: false; error: string; data: ToolResultMetadata };
```

#### Usage Patterns
- **EXTRACTED**: File reads, grep matches, direct API responses, successful executions — deterministic results with 100% reliability
- **INFERRED**: RAG queries (semantic similarity), heuristic scoring, analysis results — derived insights requiring interpretation
- **AMBIGUOUS**: Error conditions with partial data, multiple fallback attempts, ambiguous matches — uncertain results requiring caution

**Root Cause Addressed**: Prior to this fix, LLMs had no way to distinguish between deterministic results and inferred outputs, leading to over-trusting of low-confidence semantic similarity scores or fallback-path results. This pattern follows graphify_integration_analysis.md Section 1 (Confidence-Tagged Results).

### 2. Hub-Exclusion Clustering (`src/utils/hubExclusionClustering.ts`)

**Louvain community detection with hub-exclusion for architectural transparency and refactoring guidance.**

#### Algorithm Flow
```
Build Dependency Graph → Calculate Degrees → Identify Hubs (80th percentile) → Create Non-Hub Subgraph → Louvain Community Detection → Majority-Vote Hub Reattachment → Cluster Density & Modularity Calculation
```

#### Core Functions
```typescript
function buildDependencyGraph(sourceDirs: string[]): Map<string, Set<string>>;
function addEdge(adjacency, source, target): void;
function calculateDegrees(adjacency): Map<string, number>;
function identifyHubs(degrees, hubThresholdPercentile = 80): Set<string>;
function louvainCommunityDetection(adjacency): Map<string, number>;
function reattachHubsByMajorityVote(hubs, adjacency, nonHubCommunities): Record<string, number>;
function calculateClusterDensity(members, adjacency): number;
function calculateModularity(edges, nodeDegrees, clusterAssignments): number;
function performHubExclusionClustering(adjacency, hubThresholdPercentile = 80): HubExclusionResult;
function analyzeAiToolboxDependencies(): HubExclusionResult;
```

#### Output Structure
```typescript
interface HubExclusionResult {
  nodes: ModuleNode[];              // All modules with degrees (sorted by degree descending)
  edges: Edge[];                    // All connections in the graph
  hubs: string[];                   // Identified hub module IDs
  nonHubs: string[];                // Non-hub modules for clustering
  clusters: ClusterInfo[];          // Community clusters with density metrics
  hubAssignments: Record<string, number>;  // Hub → cluster ID mapping via majority-vote
  hubThresholdPercentile: number;   // Threshold used (default: 80th percentile)
  modularity?: number;              // Overall clustering quality [0-1]
}

interface ClusterInfo {
  clusterId: number;                // Sequential cluster identifier (0-indexed)
  members: string[];                // Module IDs in this cluster
  size: number;                     // Number of members
  density?: number;                 // Internal edge density [0-1]
}
```

#### Use Cases
- **Architectural transparency**: Visualize module dependency structure to understand coupling patterns
- **Refactoring guidance**: Identify modules that should be refactored together (same cluster)
- **ContextGuard optimization**: Compress related clusters efficiently during context management
- **Tool priority ranking**: Cluster centrality informs importance scoring (see Feature 5 below)

**Root Cause Addressed**: Prior to this feature, there was no systematic way to analyze module dependency structure. Hub-exclusion clustering enables architectural visibility with modularity scoring, cluster density metrics, and hub identification — all running synchronously under 10ms for typical plugin dependency graphs.

#### Verification
- All 83 tests pass across clustering suites including:
  - Graph construction from known edges (24 test cases)
  - Hub identification at various percentiles (10th, 50th, 80th, 95th)
  - Louvain convergence on synthetic graphs (small/large/connected/disconnected)
  - Majority-vote reattachment correctness
  - Cluster density and modularity calculations
  - Edge case handling (empty graph, single node, isolated nodes)

### 3. Project Auto-Detection (`src/projectAutoDetect.ts`)

**Automatically detects and registers projects in the cross-project registry when searches return empty results.**

#### Detection Confidence Scoring
```typescript
interface ProjectDetectionResult {
  path: string;                    // Absolute path to detected project
  isValid: boolean;                // Whether this looks like a valid project (≥0.3 confidence)
  name?: string;                   // Detected project name from package.json or fallback
  sourceDirs?: string[];           // Source directories within the project
  confidence: number;              // Detection confidence score [0-1]
}

// Confidence signals:
// - package.json exists: +0.4 (strongest signal)
// - src/ or lib/ directory exists: +0.3
// - .git directory exists: +0.1
// - tsconfig.json or jest.config.* exists: +0.2
```

#### Name Normalization & Fuzzy Matching
```typescript
function normalizeProjectName(name: string): string;  // "ai-toolbox" → "ai_toolbox", "@lmstudio/ai-toolbox" → "lmstudio_ai_toolbox"
function generateNameVariants(name: string): string[];  // "aitoolbox" → ["aitoolbox", "ai-tool-box"]
```

#### ⚠️ Deprecated: `searchWithAutoRegister()` & `initializeProjectDetection()` (v1.9.8+)
```typescript
async function searchWithAutoRegister(query, cwd, maxResults = 10): Promise<Array<{ name: string; path: string }>> {
  let results = await enhancedSearchProjects(query, maxResults);
  
  if (results.length === 0) {
    const autoDetected = autoDetectAndRegister(cwd, query, true /* explicitConfirmation */);
    
    if (autoDetected.registered) {
      results = await enhancedSearchProjects(query, maxResults);
    }
  }
  
  return results;
}

function initializeProjectDetection(cwd: string): void;  // ⚠️ DEPRECATED (v1.9.8+): No longer called from index.ts at startup. Registration requires explicitConfirmation=true via register_project tool. See src/index.ts comment: "NO AUTO-REGISTRATION ON STARTUP"
```

Both functions are **deprecated** as of v1.9.8+:
- `searchWithAutoRegister()`: No longer called from any code path. Registration now requires explicit user confirmation via the `register_project` tool with confirmed path.
- `initializeProjectDetection()`: Removed from startup flow in `index.ts`. Added explanatory comment: "NO AUTO-REGISTRATION ON STARTUP". Projects must be registered explicitly.

#### ✅ New Flow: Project Keyword Detection (`promptPreprocessor.ts`) + Registry Sync (`_syncFromSessionMemory()`)
```typescript
// Step 0.7 in promptPreprocessor.ts (v1.9.8+) — NEW
async function detectProjectKeywords(message: string): Promise<string | null> {
  // 1. Read project_registry.json from disk
  const registry = await readProjectRegistry();
  
  // 2. Extract candidate words from user message
  const words = extractCandidateWords(message); // Filter stop-words, lowercase
  
  // 3. Fuzzy-match against registered projects (hyphen↔underscore normalization)
  for (const word of words) {
    for (const project of registry.projects) {
      if (normalizeProjectName(word) === normalizeProjectName(project.name)) {
        return `REGISTERED PROJECT DETECTED: ${project.name} at ${project.path}`;
      }
    }
  }
  
  return null; // No match → fall through to directory detection (Step 1)
}

// _syncFromSessionMemory() in registry manager — NEW (v1.9.8+)
async function _syncFromSessionMemory(): Promise<void> {
  // Read .ai_toolbox_memory.msgpack from working dir and plugin root
  const entries = await loadContextEntries();
  
  for (const entry of entries) {
    if ('decision' in entry.data && typeof entry.data.decision === 'string') {
      const decision = entry.data.decision as string;
      
      // Match project names from past decisions (e.g., "switched to ai-toolbox")
      const match = extractProjectNameFromDecision(decision);
      
      if (match) {
        await registerProject(match.name, match.path);
      }
    }
  }
}
```

This two-layer approach eliminates the clarification loop:
1. **Step 0.7**: Immediate keyword detection on every message — no registry lookup needed at tool execution time
2. **`_syncFromSessionMemory()`**: Lazy auto-sync from session memory when `search_projects` or `get_project_info` is called — ensures registered projects are always up-to-date without explicit user confirmation

**Root Cause Addressed**: Prior to this fix, the "ai-toolbox not found" issue occurred when cross-project registry searches returned empty results — no auto-discovery mechanism existed. User-mentioned project names were not used as registration signals, causing failed lookups even when the project was clearly present in CWD.

### 4. Context Tier Provenance (`src/contextTiers.ts`)

**Typed provenance markers for tier-scoped context replacement following graphify's `build_merge` pattern.**

#### Origin Types & Node Structure
```typescript
export type ContextOrigin = 'ast' | 'semantic';

interface ContextNode {
  id: string;
  _origin: ContextOrigin;         // "ast" (raw file/AST) or "semantic" (derived insight)
  label?: string;                 // Human-readable label
  source_file?: string;           // Original file path (for ast origin)
  data?: unknown;                 // Payload/data
  timestamp?: number;             // Optional timestamp for ordering
}

function replaceTier(oldNodes: ContextNode[], newNodes: ContextNode[]): ContextNode[] {
  const oldAst = oldNodes.filter(n => n._origin === 'ast');
  const oldSem = oldNodes.filter(n => n._origin === 'semantic');
  
  const newAst = newNodes.filter(n => n._origin === 'ast');
  const newSem = newNodes.filter(n => n._origin === 'semantic');
  
  return [
    ...oldAst.filter(a => !newAst.some(n => n.id === a.id)),  // Old AST not replaced
    ...newAst,                                                  // New AST
    ...oldSem.filter(s => !newSem.some(n => n.id === s.id)),  // Old Sem not replaced
    ...newSem                                                   // New Sem
  ];
}

function createAstNode(id: string, data: unknown, sourceFile?: string): ContextNode;
function createSemanticNode(id: string, data: unknown, label?: string): ContextNode;
```

**Root Cause Addressed**: Prior to this feature, context updates replaced entire node sets without tracking data origin. This caused silent overwrites of unchanged tiers (e.g., AST nodes replaced even when only semantic insights changed). The tier-provenance system follows graphify_integration_analysis.md Section 2 (Context Tier Provenance) to enable incremental, lossless context updates.

### 5. Cluster-Aware Tool Priority (`src/tools/toolPriority.ts`)

**Five-tier priority ranking with hub-exclusion clustering integration for intelligent tool filtering.**

#### Priority Tiers
```typescript
export type PriorityTier = 'critical' | 'high' | 'standard' | 'optional' | 'background';

const PRIORITY_TIER_VALUES: Record<PriorityTier, number> = {
  critical: 1,      // File system tools (23 tools — core workflow)
  high: 2,          // Web research, execution, git operations (30+ tools — essential workflows)
  standard: 3,      // Browser automation, image processing, RAG, HTTP client (25+ tools — useful but not essential)
  optional: 4,      // Context management tools (12 tools — specialized or low-usage)
  background: 5     // Backup, cleanup, chart generation, markdown preview (8+ tools — utility/maintenance)
};

interface ClusterAwarePriority extends ToolPriority {
  moduleDegree?: number;           // Number of dependencies/connections
  isHub?: boolean;                 // Whether this tool's module is identified as a hub
  clusterId?: number;              // Assigned cluster ID from Hub-Exclusion clustering
  centralityScore?: number;        // Centrality score [0-1] — higher = more architecturally important
}

function computeCentralityScores(tools: ToolPriority[], clusteringResult: HubExclusionResult): Map<string, number>;
function sortToolsByClusterAwarePriority(tools: { name: string }[], clusteringResult?: HubExclusionResult): typeof tools;
function generateClusterAwareFilterReport(tools: { name: string }[], limit: number, clusteringResult?: HubExclusionResult): string;

const CATEGORY_TO_MODULE: Record<string, string | readonly string[]> = {
  fileSystem: ['fileSystemTools.ts', 'tools/fileSystemTools.ts'],
  webResearch: ['webResearchTools.ts', 'tools/webResearchTools.ts'],
  // ... 20 categories mapped to source files with dual-name support (bare + path-prefixed)
};
```

**Root Cause Addressed**: Prior to this feature, all enabled tools were sent to the LLM without priority ordering. When tool count exceeded grammar parser limits (llama.cpp EBNF recursion), there was no intelligent way to decide which tools to prune — alphabetical sorting was arbitrary and could exclude critical file system tools while keeping low-usage backup tools. The cluster-aware priority system ensures architecturally important modules (high centrality) are retained first.

#### Integration with Schema Minification
The tool priority system integrates with existing schema minification pipeline (`toolsSchemaMinifier.ts`) for intelligent filtering when needed:
1. All enabled tools registered via `toolsProvider()` (declarative registry pattern, v1.8.2+)
2. If tool count exceeds limit → sort by cluster-aware priority → retain top N tools → minify schemas
3. Falls back to standard alphabetical sorting within tier if no clustering data available (no runtime dependency on hub-exclusion module)

---

### 6. Cross-Project Registry Sync (`src/tools/projectAutoDetect.ts` + `registryManager`) — NEW (v1.9.8+)

**Automatic synchronization of project registry entries from session memory decisions.**

#### Design
```typescript
// _syncFromSessionMemory() — Called lazily when search_projects or get_project_info is invoked
async function _syncFromSessionMemory(): Promise<void> {
  // Load context entries from working dir + plugin root
  const entries = await loadContextEntries();
  
  for (const entry of entries) {
    if ('decision' in entry.data && typeof entry.data.decision === 'string') {
      const decisionText = entry.data.decision as string;
      
      // Extract project names from past decisions
      // e.g., "switched to ai-toolbox at C:\Source Code\..." 
      const match = extractProjectNameFromDecision(decisionText);
      
      if (match) {
        await registerProject(match.name, match.path);
      }
    }
  }
}

// Called from search_projects tool — ensures registry is up-to-date before querying
async function searchProjects(query: string): Promise<ProjectInfo[]> {
  await _syncFromSessionMemory(); // Lazy sync ← NEW
  return enhancedSearchProjects(query, 10);
}
```

#### Trigger Points (v1.9.8+)
| Tool | Sync Trigger | Purpose |
|------|-------------|---------|
| `search_projects` | `_syncFromSessionMemory()` before query | Ensures registry includes projects from past decisions |
| `get_project_info` | `_syncFromSessionMemory()` before lookup | Same — prevents stale registry entries |

#### Integration with Step 0.7 (Prompt Preprocessor)
```
promptPreprocessor() → detectProjectKeywords(message)
    │
    ├── If match found → Inject confirmation prompt
    │   ("REGISTERED PROJECT DETECTED: ai-toolbox at C:\...")
    │
    └── User replies "YES" → AI calls register_project(workingDir, confirmed=true)
        │
        ▼
        registryManager._syncFromSessionMemory() ← Ensures future searches find it
```

**Root Cause Addressed**: Prior to this fix, projects detected via keyword matching in Step 0.7 were registered only once (via `register_project` tool). If the user's session memory contained references to a project but the registry was empty, the AI would still fail to find it. The `_syncFromSessionMemory()` lazy sync ensures that any project mentioned in past decisions is automatically added to the registry when needed — eliminating false negatives from stale registries.
---

## 📦 v1.9.8 New Files & Modules Added

### Core Source Files (`src/`)
- `projectAutoDetect.ts` — Project Auto-Detection & Registration module (automatic CWD detection, name normalization, fuzzy matching)
- `contextTiers.ts` — Context Tier Provenance System (typed `_origin: 'ast' | 'semantic'` markers for tier-scoped replacement)

### Tool Modules (`src/tools/`)
- `toolPriority.ts` — Cluster-Aware Tool Priority System (5-tier ranking with hub-exclusion clustering integration, centrality scoring)

### Type Definitions (`src/types/`)
- `confidenceTypes.ts` — Confidence-Tagged Results types (`EXTRACTED | INFERRED | AMBIGUOUS` + provenance tracking)

### Utility Modules (`src/utils/`)
- `hubExclusionClustering.ts` — Hub-Exclusion Clustering algorithm (Louvain community detection, hub identification, majority-vote reattachment)
- `simulation.ts` — Feature simulation script for demonstrating Graphify-inspired capabilities (83 tests)

### Updated Module Dependencies (v1.9.8)
```typescript
// New cross-module relationships:
toolPriority.ts → hubExclusionClustering.js (centrality scoring integration)
contextTiers.ts → (standalone — used by ContextStorageManager for tier-provenance)
projectAutoDetect.ts — DEPRECATED: No longer called from index.ts at startup. Registration requires explicitConfirmation=true via register_project tool. See src/index.ts comment: "NO AUTO-REGISTRATION ON STARTUP"
confidenceTypes.ts → all tool modules (via createToolResult<T>() helper functions)
hubExclusionClustering.ts → analysis utility (analyzeAiToolboxDependencies() pre-populated graph)
```

### New Test Suites Added (v1.9.8)
- `tests/confidenceTypes.test.ts` — Confidence-tagged results validation (determineConfidence, createToolResult, createErrorResult)
- `tests/hubExclusionClustering.test.ts` — Hub-exclusion clustering algorithm verification (83 tests covering graph construction, hub identification, Louvain convergence, majority-vote reattachment, density/modularity calculations)
- `tests/projectAutoDetect.test.ts` — Project auto-detection and registration workflow (name normalization, confidence scoring, fuzzy matching, auto-registration flow)

---
---

## 🛡️ Crash-Resilient Atomic Writes (v1.9.8+)

**All file-modifying tools now use the shared `atomicWrite` utility (`src/utils/atomicWrite.ts`) for crash-resilient, async file operations.**

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Atomic Write Utility                      │
│                  (src/utils/atomicWrite.ts)                 │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ atomicWrite()    │    │ atomicWriteBinary│              │
│  │ (text files)     │    │ File()           │              │
│  │                  │    │ (binary files)   │              │
│  └────────┬─────────┘    └────────┬─────────┘              │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────────────────────────────────┐            │
│  │ 1. Generate random temp filename            │            │
│  │    crypto.randomBytes(9) → 72-bit entropy   │            │
│  │    Format: {original}.{hex}.tmp              │            │
│  └────────────────────┬────────────────────────┘            │
│                       │                                     │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────┐            │
│  │ 2. Write content to temp file               │            │
│  │    fs.promises.writeFile(tempPath, data)   │            │
│  │    (text: UTF-8 | binary: raw buffer)       │            │
│  └────────────────────┬────────────────────────┘            │
│                       │                                     │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────┐            │
│  │ 3. Atomic rename (survives crashes)         │            │
│  │    fs.promises.rename(tempPath, original)  │            │
│  │    OS-level atomic operation                │            │
│  └────────────────────┬────────────────────────┘            │
│                       │                                     │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────┐            │
│  │ 4. Cleanup on failure (if rename fails)     │            │
│  │    fs.promises.unlink(tempPath)             │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘

         Original file remains intact even if process crashes
         between steps 2 and 3 — temp file orphaned but safe.
```

### Implementation Details

#### Text Files (`atomicWrite`)
```typescript
import * as crypto from 'crypto';
import { writeFile, rename, unlink } from 'fs/promises';

export async function atomicWrite(filePath: string, content: string): Promise<void> {
  // Generate randomized temp filename (72-bit entropy)
  const tempFile = `${filePath}.${crypto.randomBytes(9).toString('hex')}.tmp`;
  
  try {
    await writeFile(tempFile, content, 'utf-8');      // Step 1: Write to temp
    await rename(tempFile, filePath);                  // Step 2: Atomic rename
  } catch (err) {
    await unlink(tempFile).catch(() => {});            // Step 3: Cleanup on failure
    throw err;                                         // Re-throw original error
  }
}
```

#### Binary Files (`atomicWriteBinaryFile`)
```typescript
export async function atomicWriteBinaryFile(
  filePath: string, 
  buffer: Buffer
): Promise<void> {
  const tempFile = `${filePath}.${crypto.randomBytes(9).toString('hex')}.tmp`;
  
  try {
    await writeFile(tempFile, buffer);                 // Raw buffer write (no encoding)
    await rename(tempFile, filePath);                  // Atomic rename
  } catch (err) {
    await unlink(tempFile).catch(() => {});            // Cleanup on failure
    throw err;                                         // Re-throw original error
  }
}
```

### Rollback-on-Failure Pattern (refactorCodeTools & recodeEngine)

For source code safety, `refactorCodeTools` and `recodeEngine` implement rollback-on-failure:

```typescript
// BEFORE atomic write attempt — create .bak backup
await fs.copyFile(originalPath, `${originalPath}.bak`);

try {
  await atomicWrite(originalPath, newContent);         // Attempt async atomic write
} catch (err) {
  // Rollback: restore from .bak backup
  await fs.copyFile(`${originalPath}.bak`, originalPath);
  throw new Error(`Atomic write failed — restored from backup: ${err.message}`);
}
```

### Module Conversion Summary (v1.9.8)

All previously synchronous file-write tools converted to async with shared `atomicWrite`:

| Module | Tools Affected | Write Pattern | Rollback? |
|--------|---------------|---------------|-----------|
| `lineOperations.ts` | delete_lines, line_operations | async → atomicWrite | No |
| `refactorCodeTools.ts` | rename_identifier, move_function, extract_function, unused_import_cleanup | async → atomicWrite + .bak backup | ✅ Yes |
| `utilityTools.ts` | ~25 tools (backup, chart, etc.) | All async → atomicWrite | No |
| `dataVisualizationTools.ts` | generate_chart | async → atomicWriteBinaryFile | No |
| `imageProcessingTools.ts` | attachment temp-file materialization (`resolveAttachmentFile`) | async → atomicWriteBinaryFile | No |
| `markdownPreviewTools.ts` | markdown_preview HTML save | async → atomicWrite | No |
| `imageProcessingTools.ts` | screenshot_desktop PNG/JPEG save | written directly by the external platform process (PowerShell/screencapture/gnome-screenshot) — no Node-side write | n/a |
| `uiGenerationTools.ts` | UI component saves | async → atomicWrite | No |
| `recodeEngine.ts` (recodeTool/) | AST transformation output | async → atomicWrite + .bak backup | ✅ Yes |

### Verification

- ✅ **Zero `writeFileSync` remaining** in `src/tools/` directory
- ✅ **Zero `renameSync` remaining** in `src/tools/` directory  
- ✅ All 491 Jest tests passing across 25 suites (6s runtime) with mocked `fs.promises`
- ✅ TypeScript compilation clean, ESLint: 0 warnings
- ✅ Build verified: CJS ~12.6MB, ESM ~12.0MB (same as v1.9.6 — no size regression from async conversion)

---