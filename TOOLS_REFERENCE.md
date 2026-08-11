# 🛠️ AI Toolbox — Complete Tool Reference

*Updated to reflect current state: **130 unique tools** dynamically registered across 24 modules (v1.9.6). Includes new v1.9.6 architectural features: Confidence-Tagged Results, Hub-Exclusion Clustering, Project Auto-Detection, Context Tier Provenance, and Cluster-Aware Tool Priority.*

---

## 📊 Overview

| Category | Count | Default State | Status |
|----------|-------|---------------|--------|
| File System | 22 | ✅ Enabled | Active |
| Code Refactoring | 2 | ✅ Enabled | Active |
| Web Research | 4 | ✅ Enabled | Active |
| Browser Automation | 5 | ❌ Disabled | Active |
| Git & GitHub | 16 | ❌ Disabled | Active |
| Database | 1 | ❌ Disabled | Active |
| Background Commands | 3 | ❌ Disabled | Active |
| Execution | 5 | ❌ Mixed (JS/Python: enabled) | Active |
| Utilities | ~8 | ✅ Utility toggle | Active |
| Image Processing | 4 | ✅ Enabled | Active |
| Vector RAG | 7 | ✅ Enabled | Active |
| UI Generation | 3 | ❌ Disabled | Active |
| Context Management | 12 | ✅ Enabled | Active |
| Text Processing | 4 | ✅ Enabled | Active |
| Backup & Restore | 5 | ✅ Utility toggle | Active |
| Data Visualization | 1 | ✅ Utility toggle | Active |
| Document Parsing | 1 | ✅ Enabled | Active |
| HTTP Client | 3 | ❌ Disabled | Active |
| Task Planning | 3 | ✅ Enabled | Active |

> **Note**: All tool categories are fully registered in `toolsProvider.ts` using the declarative registry pattern (v1.8.2+). Gateway tools exist in code but are not imported/registered — direct SDK registration handles grammar parser compatibility via schema minification.

---

## 📁 File System (22)

### Basic Operations

| Tool | Description |
|------|-------------|
| `list_directory` | List files and directories with optional depth control; supports recursive traversal |
| `read_file` | Read file content with auto-chunking for large files; binary detection prevents corrupt output |
| `read_file_chunked` | Read files in structured chunks returning start/end indices for streaming control |
| `save_file` | Atomic write operations (temp-file-then-rename) with parent directory creation; batch save support |

### Text Editing

| Tool | Description |
|------|-------------|
| `replace_text_in_file` | Replace text globally or per-occurrence with backup, line-ending preservation, binary protection |
| `insert_at_line` | Insert content at specific 1-indexed line number; CRLF/LF detection preserves Windows line endings |
| `append_file` | Append text to file end (or create if missing); combined size limit enforcement (existing + new ≤ 10MB) |
| `delete_lines_in_file` | Delete single or range of lines; default backup=true for irreversible operations |

### Directory & File Management

| Tool | Description |
|------|-------------|
| `make_directory` | Create directory with recursive parent creation; idempotent (succeeds if exists) |
| `move_file` | Move/rename files or directories using atomic rename with cross-filesystem copy+delete fallback |
| `copy_file` | Copy file to new location with atomic write and parent directory auto-creation |
| `delete_path` | Delete file or recursively delete directory with proper error handling |
| `change_directory` | Set working directory for all subsequent file operations; validates path exists and is a directory |

### Search & Analysis

| Tool | Description |
|------|-------------|
| `find_files` | Recursive filename search with async optimization and configurable depth limit (default: 5) |
| `fuzzy_find_local_files` | Levenshtein-based fuzzy name matching with 60s caching; excludes large directories automatically |
| `get_file_metadata` | Retrieve size, creation/modification/access timestamps via fs.stat() |

---

## 🔧 Code Refactoring (1)

*Requires `"🔧 AST Code Refactoring Tools"` toggle in settings or God Mode.*

### AST-Driven Refactoring Engine (`refactor_code`)

Leverages Babel's Abstract Syntax Tree (AST) parser for safe, syntax-aware code transformations. Replaces fragile line-based string manipulation with proper node traversal and regeneration. Supports TypeScript out-of-the-box.

| Operation | Description |
|-----------|-------------|
| `rename_identifier` | Globally rename variables, functions, or class names across a file using AST binding analysis |
| `move_function` | Extract functions (including Arrow Functions & Class Methods) to another file with proper syntax preservation |
| `extract_function` | Pull selected code blocks into new standalone functions via Babel AST parsing |
| `unused_import_cleanup` | Detect and remove dead imports/specifiers using static analysis; TypeScript-aware (`import type`) |

#### 🏗️ Recode Engine (Modular Rule Architecture)

The `src/tools/recodeTool/` module implements a pluggable rule engine for advanced AST-based code analysis. Rules are applied sequentially with dry-run diff output and backup/rollback support.

| Rule File | Purpose | Status |
|-----------|---------|--------|
| `unusedImports.ts` | Identifies unused imports via cross-reference analysis against usage patterns | ✅ Implemented (Tier 1) |
| `deadCodeDetection.ts` | Analyzes exported symbols for potential dead code | ⚠️ **Placeholder** (Single-file only; cross-directory scanning pending) |
| `modulePathNormalization.ts` | Detects overly complex relative imports and suggests normalized paths | ✅ Implemented (Tier 1) |
| `typeInference.ts` | Identifies explicit `any` annotations and infers better types or suggests `unknown` | ✅ Implemented (Tier 1) |
| `asyncModernizer.ts` | Detects callback-style functions (`(err, data) => { ... }`) and Promise `.then()` chains for async/await conversion | ✅ Implemented (Tier 2) |

> ⚠️ **Note on `deadCodeDetection.ts`**: Currently performs single-file AST traversal. It flags exports not used within the same file, which may produce false positives since exports are typically consumed elsewhere. Full project-wide integration is in progress.

#### 📖 Usage Examples

**1. Rename Identifiers**
```jsonc
// Renames 'oldVar' to 'newVar' across the entire file
{
  "file_path": "./src/index.ts",
  "operation": "rename_identifier",
  "old_name": "oldVar",
  "new_name": "newVar"
}
```

**2. Move Functions Between Files**
```jsonc
// Moves 'calculateTotal' from src.ts to utils.ts
{
  "file_path": "./src/operations.ts",
  "operation": "move_function",
  "old_name": "placeholder", // required by schema, ignored for this operation
  "function_name": "calculateTotal",
  "target_path": "./src/utils.ts"
}
```

**3. Extract Code Block into New Function**
```jsonc
// Extracts the provided code block into a function named 'processData'
{
  "file_path": "./src/handler.ts",
  "operation": "extract_function",
  "old_name": "const result = value * 2;\nconsole.log(result);", // raw code to extract
  "new_name": "processData"
}
```

**4. Clean Up Unused Imports**
```jsonc
// Scans file for dead imports and removes them automatically
{
  "file_path": "./src/module.ts",
  "operation": "unused_import_cleanup"
}
```

#### ⚙️ Key Features
- ✅ **AST-Based**: No regex or line-splitting bugs; handles multiline constructs, template literals, and partial statements safely.
- ✅ **TypeScript Support**: Parses `.ts`/`.tsx` natively with `typescript` plugin enabled.
- ✅ **Smart Import Removal**: Handles mixed imports (e.g., `import { used, unused } from 'lib'`) by removing only dead specifiers while preserving formatting.
- ✅ **Backup & Safety**: Automatically creates `.bak` backup before any file modification.

---

## 🌐 Web Research (4)

| Tool | Description |
|------|-------------|
| `web_search` | Multi-engine search (DDG, Google, Bing) with automatic fallback chain configuration |
| `wikipedia_search` | Search Wikipedia summaries supporting multiple languages; returns concise overviews |
| `fetch_web_content` | Clean text extraction from URLs removing ads/navigation; supports custom headers and timeouts |
| `rag_web_content` | Fetch URL content via RAG pipeline returning only semantically relevant text chunks to query |

---

## 🖥️ Browser Automation (5)

| Tool | Description |
|------|-------------|
| `browser_open_page` | Navigate Puppeteer headless browser to URL with optional selector wait and screenshot capture |
| `browser_session_control` | Manage persistent browser session lifecycle including connection state and inactivity timers |
| `browser_session_close` | Gracefully close browser session preventing orphaned Chromium processes |
| `preview_html` | Render raw HTML or existing .html file in default system browser via OS shell command |
| `open_file` | Open files/URLs in system default application (Windows start, macOS open, Linux xdg-open) |

---

## 🐙 Git & GitHub (16)

### Git Operations

| Tool | Description |
|------|-------------|
| `git_status` | Repository status: staged/unstaged files, branch info, ahead/behind counts vs remote |
| `git_diff` | Changes between commits/branches/work-tree with stat summary and name-only options |
| `git_commit` | Commit staged changes; supports --amend for modifying last commit and -a for auto-staging |
| `git_log` | Ordered commit history with max-count, date range, author filtering and custom format output |
| `git_add` | Stage files (individual, directory, or all) returning list of staged items with status |
| `git_checkout` | Switch branches, create new (-b), checkout remote tracking; handles merge conflicts gracefully |

### Git Advanced Features

| Tool | Description |
|------|-------------|
| `git_stash` | Manage uncommitted changes: save, pop, drop, and list stashes via native Git CLI fallback (isomorphic-git does not support stash) |
| `git_blame` | Per-line commit history showing author, timestamp, hash; path validation prevents traversal attacks |

### GitHub API (gh CLI)

| Tool | Description |
|------|-------------|
| `gh_auth` | Verify gh CLI authentication status with GitHub.com before using other GitHub tools |
| `gh_create_issue` | Create repository issues supporting title, body, labels, assignees, milestones |
| `gh_list_issues` | List issues filtered by state (open/closed), labels, assignees with pagination support |
| `gh_view_comments` | Retrieve issue/PR comment threads with author, timestamp, body, and reaction data |
| `gh_create_pr` | Create PRs from current branch with draft status, reviewers, and label assignment |
| `gh_list_prs` | List pull requests filtered by state, author, base branch for lifecycle tracking |
| `gh_view_pr_diff` | Fetch PR diff/patch showing added/removed lines without requiring local checkout |
| `gh_push` | Push commits to remote via gh CLI with automatic auth and force push option support |

---

## 🗄️ Database (1)

| Tool | Description |
|------|-------------|
| `query_database` | Read-only SQLite queries with SQL injection prevention; parameterized binding for safe input handling |

---

## ⏳ Background Commands (3)

| Tool | Description |
|------|-------------|
| `run_background_command` | Start long-running process continuing independently without blocking the event loop |
| `check_background_command` | Monitor status, stdout, stderr of running/completed background processes with exit codes |
| `cancel_background_command` | Terminate running background command gracefully by PID or session reference |

---

## ⚡ Execution (5)

### Sandboxed Code Execution

| Tool | Description |
|------|-------------|
| `run_javascript` | Execute JS in isolated VM context; blocks eval, require, child_process with 5s timeout default |
| `run_python` | Execute Python in controlled environment; blocks os/subprocess/sys imports with 10s timeout default |

### Shell & Terminal Execution (⚠️ Security-sensitive)

| Tool | Description |
|------|-------------|
| `execute_command` | Run shell commands with multi-layer sanitization: dangerous pattern blocking and pipe limits |
| `run_in_terminal` | Launch OS-native terminal window (cmd/PowerShell/zsh/bash) with env vars and visibility options |
| `run_tests` | Auto-detect test framework from package.json scripts; supports Jest, Mocha, Vitest runners |

---

## 🔧 Utilities (~29)

### Memory & Context Tools

| Tool | Description |
|------|-------------|
| `save_memory` | Persist facts to `.ai_toolbox_memory.msgpack` MessagePack binary for cross-session continuity |
| `get_memory` | Retrieve all saved memory entries with optional type filtering and result limits |
| `search_memory` | Keyword search across stored memories returning relevance confidence scores per match |
| `delete_memory` | Remove specific memory entry by unique ID returned during save operations |
| `save_session_summary` | Save structured summary (accomplishments, pending tasks) with zlib compression bypassing 10k SDK limit |
| `get_session_summary` | Retrieve latest session summary with backward-compatible legacy fallback parser for pre-v1.5.15 data |

### System & Environment Tools

| Tool | Description |
|------|-------------|
| `get_system_info` | OS type/version, CPU model/count, total/available memory, disk usage statistics |
| `system_monitor` | Detailed CPU, memory, disk, network interface metrics reporting for performance tracking |
| `process_list` | Running processes with CPU%, memory footprint, PID hierarchy; case-insensitive name filtering |
| `env_inspect` | List environment variables with optional prefix filtering for targeted variable inspection |
| `detect_os_environment` | Report OS capabilities ensuring correct command syntax before shell/path operations |

### Clipboard & Notifications

| Tool | Description |
|------|-------------|
| `read_clipboard` | Cross-platform clipboard read (Windows GetClipboardData, macOS pbpaste, Linux xclip/xsel) |
| `write_clipboard` | Write text to system clipboard with automatic platform detection and no manual config needed |
| `send_notification` | OS-native toast notification with title, message body, optional custom icon for user awareness |

### File & Data Utilities

| Tool | Description |
|------|-------------|
| `findLMStudioHome` | Locate LM Studio installation directory across Windows/macOS/Linux returning model storage path |
| `get_enabled_tools` | List currently enabled tools verifying active categories and God Mode bypass status |
| `hash_file` | Generate MD5/SHA1/SHA256 cryptographic checksums for file integrity verification |
| `token_count` | LLM token counting via tiktoken (cl100k_base, p50k_base, gpt2 encodings) for context estimation |
| `convert_format` | JSON↔CSV conversion, base64 encode/decode, compress/decompress with configurable levels |
| `secret_scan` | Scan files for exposed API keys, passwords, tokens; supports custom exclusion patterns |
| `port_check` | Synchronous TCP port availability check on localhost or custom host for service verification |
| `package_manage` | Install/uninstall/update/audit npm/pip/cargo packages (⚠️ requires config toggle enablement) |
| `json_query` | jq-style JSON field extraction with dot notation, array indexing, wildcard support; 10MB file cap |
| `env_update` | Safe .env key-value management with validation (alphanumeric + underscores); auto-creates entries |
| `get_current_working_directory` | Return absolute working directory path for reliable relative path reference in workflows |

---

## 🖼️ Image Processing (4)

| Tool | Description |
|------|-------------|
| `image_to_text` | Tesseract.js OCR extracting text with confidence score, language detection, bounding boxes (50MB max) |
| `describe_image` | Get image metadata: dimensions, format, size, timestamps for PNG/JPG/BMP/GIF/WebP/TIFF |
| `screenshot_desktop` | Cross-platform desktop capture via PowerShell (.NET GDI+), macOS screencapture, or ImageMagick import |
| `compare_images` | Byte-level similarity comparison with dimension checking; pixel-level requires sharp/jimp library |

---

## 🔍 Vector RAG (7)

### Indexing Tools (3 new in v1.9.3)

| Tool | Description |
|------|-------------|
| `rag_index_pdf` | Extract PDF text via pdf-parse, chunk by page boundary with page_number metadata; bounded ~300 words/chunk for OOM safety; traceable results per page number |
| `rag_index_docx` | Extract DOCX raw text via mammoth library, word-bounded chunks (default 300 words, 50 overlap); same embedding pipeline as PDF |
| `rag_index_xlsx` | Extract all sheets as row arrays via xlsx package; chunks by rows (default 100), optional sheet-name prefix for traceability; includeSheetNames parameter controls prefix behavior |

### Existing Tools (4)

| Tool | Description |
|------|-------------|
| `rag_index_files` | Index files for semantic search supporting TS/JS/MD/JSON/YAML/text formats with batch processing |
| `rag_query_vector` | Cosine similarity query returning top-k results (default 5, max 20) with chunk content and scores |
| `rag_clear_index` | Clear entire vector index requiring confirm=true for safety; useful before full reindexing |
| `rag_web_content` | RAG pipeline fetching URL content then extracting only text chunks relevant to query |

---

## 🎨 UI Generation (3)

| Tool | Description |
|------|-------------|
| `generate_ui_component` | Create interactive HTML/CSS/JS components (buttons, forms, tables) from user descriptions |
| `render_and_preview_ui` | Render components in browser with live editing and hot reload for rapid prototyping |
| `extract_ui_data` | Extract structured data from pages using CSS selectors/XPath returning tabular output |

---

## 🧠 Context Management (12)

**Note**: 5 additional context management tools (`save_session_summary`, `get_session_summary`, `save_memory`, `get_memory`, `delete_memory`) are also available under the Utilities category for backward compatibility.

| Tool | Description |
|------|-------------|
| `auto_summarize_context` | Analyze session patterns, tool usage frequency, config changes; saves to persistent memory with default `'global'` scope (v1.9.1+) |
| `get_context_memory` | Retrieve past entries filtered by type (decision/pattern/config/error/summary) with deterministic heuristic scoring applied — recent + frequently accessed entries surface first (v1.9.1+) |
| `search_context` | Fuzzy text search across titles, content bodies, tags for efficient retrieval and analysis; expired session entries pruned before search (24h TTL, v1.9.1+) |
| `context_summary` | Statistical overview: total entries, type breakdowns, recent activity counts for auditing |
| `delete_context_entry` | Remove specific context entry by unique ID without clearing entire history |
| `clear_context_memory` | Clear all persistent memory entries (⚠️ irreversible; requires confirm=true) |
| `track_important_event` | Manually record events/decisions/milestones with custom tags for categorized retrieval |
| `save_session_summary` | Save structured summary (accomplishments, pending tasks) with zlib compression bypassing 10k SDK limit |
| `get_session_summary` | Retrieve latest session summary with backward-compatible legacy fallback parser for pre-v1.5.15 data |
| `save_memory` | Persist facts to `.ai_toolbox_memory.msgpack` MessagePack binary for cross-session continuity |
| `get_memory` | Retrieve all saved memory entries with optional type filtering and result limits |
| `delete_memory` | Remove specific memory entry by unique ID returned during save operations |

**Memory System Enhancements (v1.9.1):**
- 🔒 **Context Scoping**: Entries tagged with `global`/`project`/`session` scope for future isolation filtering
- 📈 **Heuristic Retrieval**: Composite scoring `(Recency × 0.7) + (Frequency × 0.3)` ensures intelligent ordering
- 🧹 **TTL Pruning**: Session-scoped entries expire after 24h and are automatically removed during retrieval

---

## 📝 Text Processing (4)

| Tool | Description |
|------|-------------|
| `text_transform` | Regex substitution with capture groups ($1, $2), line ranges, global/case-insensitive modes; safer than shell sed |
| `line_operations` | Insert/delete/reorder lines using awk-like operations without shell dependencies; atomic writes safety + **NEW v1.7.0: Three-layer guardrail system** (pattern matching, verification, bounds validation) |
| `text_extract` | Structured data extraction from delimited text (CSV/TSV/custom) with configurable zero-based field indices |
| `markdown_table_gen` | Generate Markdown tables from object arrays with headers, alignment, truncation, and customizable ellipsis |
| `refactor_code` | AST-driven code refactoring: rename identifiers, move functions (including Arrow Functions & Class Methods), extract code blocks into new functions via Babel AST parsing — no more line-based string splitting errors |

### 🛡️ line_operations Safety Guardrails (v1.7.0+)
**Resolved recurring issues where LLMs inserted content at wrong lines due to stale line numbers.** Three-layer defense-in-depth:

#### 1. Content-Aware Insertion (Pattern Matching)
Find insertion point by searching file content instead of trusting line numbers — works regardless of current position.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `insert_after_pattern` | `string` | No | Line containing this text → insert AFTER it (max 500 chars) |
| `insert_before_pattern` | `string` | No | Line containing this text → insert BEFORE it (max 500 chars) |

**Example:**
```typescript
// Pattern-based — works regardless of current line number:
line_operations(
  file_name, 
  operation: "insert", 
  insert_after_pattern: "if (width <= 0 || height <= 0)",
  content: "// fix"
)
→ Finds line containing pattern → inserts after it → works correctly even if file changed
```

#### 2. Line Fingerprinting / Verification
Verify expected text exists at target_line before proceeding — blocks operation with error + actual context on mismatch.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `verify_before_insert` | `string` | No | Content expected at target_line; if mismatch → blocked (max 200 chars) |

**Example:**
```typescript
// Verification-based — catches drift errors before corruption:
line_operations(
  file_name, 
  operation: "insert", 
  target_line: 84, 
  content: "// fix",
  verify_before_insert: "return;" // Content expected at line 84
)
→ Checks if line 84 contains "return;" → If no → BLOCKS with error + context shown (±3 lines)
```

#### 3. Bounds Validation & Large Insert Blocking (Auto-detection)
- **Out-of-range rejection**: Rejects `target_line` outside valid range (1 to file length + 1)
- **Multi-line splitting**: Splits content by `\n` into individual array elements (fixed bug where `\n` became literal characters on single line)
- **Large insert blocking**: Blocks inserts >5 lines with suggestion to use `replace_text_in_file` instead

**Test Results:** 9/9 test scenarios passed — zero regressions in existing delete/move operations.

---

## 💾 Backup & Restore (4)

| Tool | Description |
|------|-------------|
| `create_backup` | Compressed ZIP backup of entire working directory stored in `.ai_toolbox_backups/`; requires confirm=true |
| `list_backups` | List backups sorted by date newest-first with filename, path, size bytes, and creation timestamp |
| `restore_backup` | Restore full working directory from archive (⚠️ overwrites all files; requires confirm=true) |
| `delete_backup` | Remove specific backup file (⚠️ irreversible; validates existence before deletion) |

---

## 🔑 Historical Note: Gateway Pattern (v1.6.0+)

**Status**: `src/tools/gatewayTools.ts` exists with tool definitions (`explore_tools`, `execute_gateway_tool`) but is **NOT imported or registered** in the current `toolsProvider.ts`. 

The direct SDK registration approach (all tools exposed directly to LLM) has proven more effective for usability. Grammar parser compatibility is now handled via schema minification (`toolsSchemaMinifier.ts`), which compresses descriptions and caps constraints without limiting tool count.

### Original Gateway Design (v1.6.0+ Documentation)

The gateway pattern was originally designed as follows:

#### `explore_tools`
Discovers available tools and their categories without exposing all registered tools at once. Returns category names only to keep schema small.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | `string` | No | Optional: Filter by specific category name (e.g., "fileSystem", "webSearch") |

**Returns**: `{ success: boolean, categories: string[], message?: string }`

#### `execute_gateway_tool`
Executes any registered tool by name with built-in validation and error handling. Delegates to the existing ToolRegistry for execution.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `toolName` | `string` | Yes | Name of the tool to execute (e.g., "read_file", "web_search") |
| `arguments` | `Record<string, unknown>` | Yes | Tool-specific arguments as key-value pairs |

**Returns**: Tool execution result or error message

**Why Gateway Was Designed**: Sending all registered tools directly to llama.cpp's grammar parser caused `failed to parse grammar` errors due to EBNF recursion limits. The gateway pattern was intended to reduce initial schema payload while maintaining full functionality on-demand via delegation.

---

## 📊 Data Visualization (1 — under `utility` toggle)

| Tool | Description |
|------|-------------|
| `generate_chart` | Create line/bar/pie/scatter/area charts outputting SVG/PNG with customizable colors, labels, legends. Registered via `dataVisualizationTools.ts` in the utility tools registry. |

---

## 📄 Document Parsing (1)

| Tool | Description |
|------|-------------|
| `read_document` | Read PDF (pdf-parse), DOCX (mammoth), or TXT files; automatic binary detection prevents corrupt output |

---

## 🌐 HTTP Client (3)

### Security-sensitive: Requires config toggle enablement

| Tool | Description |
|------|-------------|
| `http_request` | Generic GET/POST/PUT/DELETE/PATCH client with retry logic, timeout config, multipart upload support |
| `http_get_json` | GET requests expecting JSON response with automatic parsing and optional schema validation |
| `http_post_json` | POST requests with JSON payload, content-type auto-handling, auth token support, status code return |

---

## 📋 Task Planning (3)

*Requires `taskPlanning` toggle in settings or God Mode.*

Structured multi-step workflow management tools for creating, tracking, and updating execution plans. Tools persist plan data to `.ai_toolbox_plans.json` using atomic writes with Zod schema validation.

### State Machine
```
pending → in_progress → done (terminal)
any     → blocked      ← blocked → pending (retry)
```

| Tool | Description |
|------|-------------|
| `create_plan` | Create a new execution plan with goal and ordered steps (1-30 steps, 500 chars max each). Replaces any existing active plan. Returns `planId`, `goal`, and `stepCount`. |
| `get_plan` | Return the active plan details including goal, all step statuses, completion percentage, elapsed time since creation, and timestamps. Returns `null` if no plan exists. |
| `update_plan_step` | Update a single step's status according to state machine rules (`pending→in_progress→done`, any→blocked, blocked→pending). Requires `note` when marking as `blocked`. Returns completion metrics including `completedSteps`, `totalSteps`, and `allDone` boolean. |

**Example Workflow:**
```typescript
// 1. Create plan with goal and steps
create_plan({
  goal: "Refactor authentication module",
  steps: [
    "Read current auth.ts file",
    "Identify refactoring opportunities",
    "Implement changes to separate concerns",
    "Run tests to verify functionality"
  ]
})

// 2. Track progress as you work
update_plan_step({ planId: "...", index: 0, status: "done" })
update_plan_step({ planId: "...", index: 1, status: "in_progress" })

// 3. Check current state
get_plan() // Returns full plan with progress metrics

// 4. Handle blockers if needed
update_plan_step({ planId: "...", index: 2, status: "blocked", note: "Need API documentation for new auth flow" })
```

---

## ⚙️ Configuration Summary

All categories toggleable in LM Studio settings panel. Most dangerous tools disabled by default requiring explicit opt-in through the UI. **God Mode** enables all categories instantly — use cautiously.

### Key Settings
- **ContextGuard**: Token limits (default 30k), smart reading, terminal filtering
- **Auto-Tracking**: Background tracking of decisions/task completions enabled by default (75% threshold)
- **Search Fallback**: DDG API → DDG Fetch → Google → Bing

---

## 🔒 Security Overview

All tools implement multiple security layers:
- ✅ Path traversal prevention via `validatePath()`
- ✅ Command sanitization blocks dangerous patterns (`rm -rf`, `sudo`)
- ✅ SQL injection prevention in database queries
- ✅ Code sandboxing for JS/Python execution (no `require()`, `eval()`, or `child_process`)
- ✅ SSRF protection blocking private IP ranges via HTTP client
- ✅ Regex ReDoS protection treating unsafe patterns as literals

⚠️ **Important**: Most dangerous tools disabled by default requiring explicit user opt-in through settings panel. God Mode bypasses all category restrictions.

---

*Reference generated from actual source code analysis on 2026-08-10 (v1.9.6). All tool counts verified against `toolsProvider.ts` registry entries and `src/tools/*.ts`. insert_at_line read-back drift detection documented with v1.8.8 hard fix. New v1.9.6 features: Confidence-Tagged Results, Hub-Exclusion Clustering (83 tests), Project Auto-Detection, Context Tier Provenance, Cluster-Aware Tool Priority.*

---

## 🆕 New Features — v1.9.6 (2026-08-10)

### Graphify-Inspired Architectural Intelligence Suite

Five new architectural modules added in v1.9.6 following graphify repository analysis patterns:

#### 1. Confidence-Tagged Results (`src/types/confidenceTypes.ts`)
**Typed confidence metadata attached to all tool execution outputs.**

Three confidence levels for result reliability assessment:
- **EXTRACTED**: Direct, deterministic source match (file reads, grep matches, API responses)
- **INFERRED**: Semantic relevance or computed values (RAG queries, heuristic scoring)
- **AMBIGUOUS**: Uncertain relationships or fallback paths used

Helper functions available for standardized confidence assignment:
```typescript
determineConfidence(operationType: 'extraction'|'inference'|'execution'|'search', success: boolean, fallbackUsed?: boolean): Confidence;
createToolResult<T>(data: T, confidence: Confidence, options?: {provenance?: string; note?: string}): { success: true; data: T & ToolResultMetadata };
createErrorResult(message: string, provenance?: string): { success: false; error: string; data: ToolResultMetadata };
```

#### 2. Hub-Exclusion Clustering (`src/utils/hubExclusionClustering.ts`)
**Louvain community detection with hub-exclusion for architectural transparency.**

Algorithm flow: Build dependency graph → Calculate degrees → Identify hubs (80th percentile) → Louvain clustering on non-hubs → Majority-vote hub reattachment.

Output includes modularity score, cluster density metrics, and hub identification — all running synchronously under 10ms for typical plugin graphs. 83 tests verify correctness across graph construction, hub identification at various percentiles, Louvain convergence, majority-vote reattachment, and edge cases.

Use cases: Architectural visualization, refactoring guidance (identify modules to refactor together), ContextGuard optimization (compress related clusters), tool priority ranking via centrality scoring.

#### 3. Project Auto-Detection (`src/projectAutoDetect.ts`)
**Automatic project registration when cross-project registry searches return empty.**

Confidence scoring signals: `package.json` (+0.4), `src/` or `lib/` (+0.3), `.git` (+0.1), build configs (+0.2). Name normalization handles hyphen↔underscore variants and scoped packages (`@lmstudio/ai-toolbox`). Auto-registration runs on plugin startup via `initializeProjectDetection()`.

#### 4. Context Tier Provenance (`src/contextTiers.ts`)
**Typed provenance markers for tier-scoped context replacement.**

Origin types: `_origin: 'ast' | 'semantic'` distinguishes raw file content from derived AI insights. `replaceTier()` replaces only changed tiers while preserving unchanged ones — follows graphify's incremental update pattern to prevent silent overwrites of unchanged nodes.

#### 5. Cluster-Aware Tool Priority (`src/tools/toolPriority.ts`)
**Five-tier priority ranking with hub-exclusion clustering integration.**

Tiers: CRITICAL (1, file system tools), HIGH (2, web research/execution/git), STANDARD (3, browser/image/RAG), OPTIONAL (4, context management), BACKGROUND (5, backup/cleanup). Centrality scoring computed from module degree × hub bonus — used for intelligent tool filtering when grammar parser limits require pruning.

---