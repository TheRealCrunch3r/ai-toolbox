# Tools Reference

Complete reference for all 106 tools in the AI Toolbox plugin, organized by category.

---

## 📁 File System Tools (20)

### `list_directory`

List files and directories in the current working directory or a specified subdirectory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | No | Directory path (default: current working directory) |

**Returns**: `{ success: true, data: { path, name, isDirectory, isFile }[] }`

---

### `read_file`

Read content from a file with size checking and binary detection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `max_length` | `number` | No | Max characters (default: 5000, max: 50000) |

**Returns**: `{ success: true, data: { content, filePath, truncated?, total_length? } }`

**Limits**: Max file size 10MB.

> ⚠️ **IMPORTANT:** If `read_file` returns truncated output (content cut off), you **MUST** retry with [`read_file_chunked`](#read_file_chunked) to get the full content. Do not keep calling `read_file` with larger `max_length` values — it will still truncate.

---

### ⚙️ Workarounds for Character Limits

The `max_length` parameter is a **platform-level constraint** (default: 5,000, max: 50,000) that cannot be changed from within the plugin. Here are workarounds for reading files larger than 50,000 characters:

#### Option 1: Explicitly Specify Higher Values
```typescript
// Default behavior (truncates at 5,000 chars)
read_file("large_file.ts")

// Read up to the maximum allowed (50,000 characters)
read_file("large_file.ts", max_length=50000)
```

#### Option 2: Read Files in Chunks
For files exceeding 50,000 characters, read them sequentially using line-based or offset approaches:

```typescript
// Step 1: Get file metadata to know total size
get_file_metadata("large_file.ts")
→ { path, size: 150000, ... }

// Step 2: Read first chunk (first 50k chars)
read_file("large_file.ts", max_length=50000)
→ Returns first 50,000 characters

// Step 3: Use line-based reading for remaining content
// Note: read_file doesn't support offset/seek natively.
// For large files, consider using `execute_command` with shell tools:
execute_command("head -n 1000 large_file.ts")      // First 1000 lines
execute_command("tail -n 500 large_file.ts")       // Last 500 lines
execute_command("sed -n '1001,2000p' large_file.ts") // Lines 1001-2000

// Step 4: Combine results as needed
```

#### Option 3: Use Alternative Tools for Large Files
| Tool | Best For | Limit |
|------|----------|-------|
| `execute_command` + `head/tail/sed/grep` | Reading specific line ranges | Shell-dependent |
| `find_files` + `get_file_metadata` | Locating and sizing files before reading | None |
| `rag_index_files` → `rag_query_vector` | Semantic search without full content read | 50k per file |

#### Option 4: Index Then Query (Recommended for Large Codebases)
```typescript
// Step 1: Index the entire directory (handles files >50k chars automatically)
rag_index_files({ directoryPath: "src/", batchSize: 20 })
→ Indexed 847 chunks across 32 files

// Step 2: Query only the relevant chunks
rag_query_vector({ query: "authentication middleware", topK: 5 })
→ Returns only matching snippets (no full file read needed)
```

---

### `read_file_chunked` 🆕 **RECOMMENDED for large files** — v1.4.10 Update

Read a file in chunks to bypass character limits. **ALWAYS use this instead of `read_file` if `read_file` returned truncated output, or if you know the file is very large (>50k chars).** Returns structured chunks with start/end indices and truncation status.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `chunk_size` | `number` | No | Max characters per chunk (default: 50000, max: 50000) |
| `max_chunks` | `number` | No | Maximum number of chunks to return (default: 20) |

**Returns**: `{ success: true, data: { filePath, totalCharacters, chunkSize, maxChunks, chunksReturned, isTruncated, chunks: [{ index, content, startChar, endChar, truncated }] } }`

> ⚠️ **TypeScript Strict Mode Compliance (v1.4.10+)**: Optional parameters use explicit null-coalescing (`??`) with defaults to satisfy TypeScript's strict mode requirements. This ensures zero compilation errors across the entire codebase.

**When to use:**
| Scenario | Tool |
|----------|------|
| File < 50k chars | `read_file` (simpler) |
| File > 50k chars | **`read_file_chunked`** ✅ |
| `read_file` returned truncated output | **`read_file_chunked`** ✅ |
| Need to read specific sections of large file | `read_file_chunked` with `max_chunks=1` + adjust `chunk_size` |

**Example:**
```typescript
// Read a 200k-line TypeScript file in chunks
read_file_chunked(
  "large_project.ts",
  chunk_size: 50000,   // 50k chars per chunk
  max_chunks: 10       // up to 10 chunks (500k total)
)

// Response includes:
// - isTruncated: true/false (did we get all content?)
// - chunks[].index: 0, 1, 2...
// - chunks[].startChar / endChar: byte offsets for each chunk
// - chunks[].content: the actual text
```

---

### `save_file` — v1.4.x Update (v1.4.10+)

Save content to a specified file in the current working directory. Supports batch saving with atomic writes and size limits.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | No* | File path (*required for single mode) |
| `content` | `string` | No* | Content to write (max 10MB per file, *required for single mode) |
| `files` | `Array<{file_name, content}>` | No* | Batch save array (max 50 files, each with .max(10_000_000) limit) |

\* Either `file_name`+`content` or `files` required.

**Returns**: `{ success: true, data: { savedFile, path } }` or `{ success: true, data: { savedFiles, results } }`

> ⚠️ **Security & Reliability Features (v1.4.x)**:
> - **Atomic writes** — Uses temp file + rename pattern to prevent corruption on crash
> - **Size enforcement** — 10MB limit via Zod schema `.max()` and runtime `Buffer.byteLength()` validation
> - **Auto directory creation** — Parent directories created automatically using recursive `mkdir` equivalent
> - **Path traversal protection** — Directory escape attempts blocked in both single and batch modes

**Examples:**
```json
// Single file save (auto-creates parent dirs)
{"file_name": "nested/deep/path/test.txt", "content": "Hello World"}
→ { success: true, data: { savedFile: ".../test.txt" } }

// Batch save mode
{"files": [
  {"file_name": "batch1.txt", "content": "First"},
  {"file_name": "batch2.txt", "content": "Second"}
]}
→ { success: true, data: { savedFiles: 2, results: [...] } }

// Size limit enforced (>10MB rejected)
{"file_name": "big_test.txt", "content": "[very large string >10MB]"}
→ { success: false, error: "Content too large (X.XXMB, max 10MB)" }
```

---

### `replace_text_in_file`

Replace an exact string in a file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `old_string` | `string` | Yes | Exact text to replace (must be unique) |
| `new_string` | `string` | Yes | Replacement text |

**Returns**: `{ success: true, data: { replaced: true, file } }`

---

### `insert_at_line`

Insert content at a specific line number.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `line_number` | `number` | Yes | Line number (1-indexed) |
| `content_to_insert` | `string` | Yes | Content to insert |

**Returns**: `{ success: true, data: { insertedAt, file } }`

---

### `append_file`

Append content to end of file. Creates file if it doesn't exist.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `content` | `string` | Yes | Content to append |

**Returns**: `{ success: true, data: { appendedTo } }`

---

### `delete_lines_in_file`

Delete a line or range of lines.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `start_line` | `number` | Yes | Starting line (1-indexed) |
| `end_line` | `number` | No | Ending line (inclusive) |

**Returns**: `{ success: true, data: { deletedLines, file } }`

---

### `make_directory`

Create a directory (recursive).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `directory_name` | `string` | Yes | Directory path |

**Returns**: `{ success: true, data: { createdDirectory, path } }`

---

### `move_file`

Move or rename a file/directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | `string` | Yes | Source path |
| `destination` | `string` | Yes | Destination path |

**Returns**: `{ success: true, data: { movedFrom, movedTo } }`

---

### `copy_file`

Copy a file to a new location.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | `string` | Yes | Source path |
| `destination` | `string` | Yes | Destination path |

**Returns**: `{ success: true, data: { copiedFrom, copiedTo } }`

---

### `delete_path`

⚠️ **Destructive** — Delete a file or directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | Path to delete |

**Returns**: `{ success: true, data: { deleted } }`

---

### `delete_files_by_pattern`

⚠️ **Destructive** — Delete files matching a regex pattern.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | `string` | Yes | Regex pattern |

**Returns**: `{ success: true, data: { deletedCount, deletedFiles } }`

---

### `find_files`

Recursive file search with async concurrency control.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | `string` | Yes | Substring to match (case-insensitive) |
| `max_depth` | `number` | No | Max search depth (default: 5) |

**Returns**: `{ success: true, data: { foundFiles, count } }`

---

### `fuzzy_find_local_files`

Fuzzy file search using Levenshtein similarity scoring with caching.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query |
| `path` | `string` | No | Subdirectory to search |
| `max_results` | `number` | No | Max results (default: 5, max: 20) |

**Returns**: `{ success: true, data: { matches: [{filePath, score}], count } }`

---

### `get_file_metadata`

Get file statistics.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | File path |

**Returns**: `{ success: true, data: { path, size, createdAt, modifiedAt, accessedAt, isDirectory, isFile } }`

---

### `change_directory`

Change the working directory for all subsequent file operations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `directory` | `string` | Yes | Absolute path to directory |

**Returns**: `{ success: true, data: { previous_directory, current_directory } }`

---

### `analyze_project`

Run TypeScript diagnostics, circular dependency detection, ESLint, config analysis, and import structure analysis.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categories` | `string[]` | No | Categories: `typecheck`, `circular`, `eslint`, `config`, `imports` |
| `max_imports_warning` | `number` | No | Warning threshold (default: 20) |

**Returns**: `{ success: true, data: { typecheck, circular, eslint, config, imports } }`

---

## 🌐 Web Research Tools (4)

### `web_search`

Multi-engine web search with automatic fallback chain.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query |

**Returns**: `{ success: true, data: { query, results: [{title, url, description}], count, engine } }`

**Engines**: DDG API → DDG Fetch → Google → Bing (configurable primary).

---

### `wikipedia_search`

Search Wikipedia for page summaries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query |
| `lang` | `string` | No | Language code (default: `en`) |

**Returns**: `{ success: true, data: { query, language, results: [{title, snippet, url}], count } }`

---

### `fetch_web_content`

Fetch clean text content from a webpage.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Webpage URL |

**Returns**: `{ success: true, data: { url, content } }`

**Limits**: Max 5,000 characters output.

---

### `rag_web_content`

Fetch webpage and extract content relevant to a query using semantic search.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Webpage URL |
| `query` | `string` | Yes | Query for relevance matching |

**Returns**: `{ success: true, data: { url, query, totalChunks, bestMatch: {text, score, metadata} } }`

---

## 🖥️ Browser Automation Tools (5)

### `browser_open_page`

Open a webpage in headless Puppeteer browser.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | URL to open |
| `screenshot_path` | `string` | No | Screenshot output path |
| `wait_for_selector` | `string` | No | CSS selector to wait for |
| `full_page_screenshot` | `boolean` | No | Full page screenshot |

**Returns**: `{ success: true, data: { url, opened, screenshotSaved?, pageText } }`

---

### `browser_session_control`

Control the persistent browser session with scripted actions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actions` | `object[]` | No | Scripted actions (click, type, goto, evaluate, wait, scroll) |
| `read_page` | `boolean` | No | Return page text (1000 chars) |
| `full_read` | `boolean` | No | Return full page text |
| `screenshot_path` | `string` | No | Screenshot output path |

**Action Types**:
```typescript
{ type: 'click', selector: '#button' }
{ type: 'type', selector: '#input', text: 'hello' }
{ type: 'wait', milliseconds: 1000 }
{ type: 'scroll', x: 0, y: 500 }
{ type: 'evaluate', script: 'document.title' }
```

---

### `browser_session_close`

Close the persistent browser session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | — |

**Returns**: `{ success: true, data: { closed: true } }`

---

### `preview_html`

Save and open HTML content in the system browser.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | HTML content |
| `file_name` | `string` | No | Filename (default: `preview.html`) |

**Returns**: `{ success: true, data: { previewed: true, file } }`

---

### `open_file`

Open a file or URL in the default application.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target` | `string` | Yes | File path or URL |

**Returns**: `{ success: true, data: { opened: true } }`

---

## 🐙 Git & GitHub Tools (13)

### `git_status`

Get repository status.

**Returns**: `{ success: true, data: { paths, staged, not_added } }`

---

### `git_diff`

Get diff of changes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | `string` | No | Specific file to diff |
| `cached` | `boolean` | No | Staged changes only |

**Returns**: `{ success: true, data: { diff } }`

---

### `git_commit`

Commit staged changes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | `string` | Yes | Commit message |

**Returns**: `{ success: true, data: { committed: true } }`

---

### `git_log`

Get commit history.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `max_count` | `number` | No | Max commits (default: 10) |

**Returns**: `{ success: true, data: { commits } }`

---

### `git_add`

Stage files for commit.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `string[]` | No | Specific files (default: all) |

**Returns**: `{ success: true, data: { stagedPaths } }`

---

### `git_checkout`

Switch or create a branch.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_name` | `string` | Yes | Branch name |
| `create_new` | `boolean` | No | Create branch if not exists |

**Returns**: `{ success: true, data: { branchName } }`

---

### `gh_auth`

Check GitHub authentication status.

**Returns**: `{ success: true, data: { authenticated: true } }`

**Requires**: `GITHUB_TOKEN` environment variable.

---

### `gh_create_issue`

Create a GitHub issue.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Issue title |
| `body` | `string` | No | Issue description |
| `labels` | `string[]` | No | Labels |

**Returns**: `{ success: true, data: { created: true } }`

---

### `gh_list_issues`

List repository issues.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | `string` | No | `open` or `closed` (default: `open`) |
| `labels` | `string[]` | No | Filter by labels |
| `limit` | `number` | No | Max issues (default: 10, max: 50) |

**Returns**: `{ success: true, data: { issues } }`

---

### `gh_view_comments`

View comments on issue or PR.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | `number` | Yes | Issue/PR number |
| `type` | `string` | No | `issue` or `pr` (default: `issue`) |

**Returns**: `{ success: true, data: { comments } }`

---

### `gh_create_pr`

Create a pull request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | PR title |
| `body` | `string` | No | PR description |
| `head_branch` | `string` | Yes | Source branch |
| `base_branch` | `string` | No | Target branch (default: `main`) |

**Returns**: `{ success: true, data: { created: true, url } }`

---

### `gh_list_prs`

List pull requests.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | `string` | No | `open` or `closed` (default: `open`) |
| `limit` | `number` | No | Max PRs (default: 10, max: 50) |

**Returns**: `{ success: true, data: { prs } }`

---

### `gh_view_pr_diff`

Fetch PR diff/patch.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | `number` | Yes | PR number |

**Returns**: `{ success: true, data: { diff } }`

---

### `gh_push`

Push commits to remote.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch` | `string` | No | Branch name (default: current) |

**Returns**: `{ success: true, data: { pushed: true } }`

---

## 🗄️ Database Tools (1)

### `query_database`

⚠️ **Read-only** — Execute SQLite queries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | SQL query (SELECT/PRAGMA only) |
| `db_path` | `string` | No | Database path (default: `:memory:`) |

**Returns**: `{ success: true, data: { query, results } }`

**Requires**: Node.js 23+ for `node:sqlite`.

---

## 📄 Document Parsing Tools (1)

### `read_document`

Extract text from PDF, DOCX, or TXT files. Supports both disk paths and attached files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | `string` | Yes | Path to file (PDF/DOCX/TXT) or attachment filename |

**Returns**: `{ success: true, data: { file, type: "PDF"\|"DOCX"\|"TXT", pages?, content } }`

**Limits**: Max 10,000 characters output.

---

## ⏳ Background Command Tools (3)

### `run_background_command`

Start a long-running background process.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | Shell command |
| `timeout_hours` | `number` | Yes | Max runtime (0.1-10 hours) |
| `name` | `string` | Yes | Descriptive task name |

**Returns**: `{ success: true, data: { id, name, command, timeoutHours } }`

---

### `check_background_command`

Check status of a background command.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | Command ID |

**Returns**: `{ success: true, data: { id, status, stdout, stderr, name } }`

---

### `cancel_background_command`

Kill a running background command.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | Command ID |

**Returns**: `{ success: true, data: { id, cancelled: true } }`

---

## ⚡ Execution Tools (5)

### ⚠️ `run_javascript`

⚠️ **DANGEROUS** — Execute JavaScript code (sandboxed). **Disabled by default.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `javascript` | `string` | Yes | JavaScript code to execute |
| `timeout_seconds` | `number` | No | Timeout in seconds (default: 5, max: 60) |

**Returns**: `{ success: true, data: { output } }`

**Cross-Platform Detection**: Automatically tries multiple Node.js executables (`npx` → `node`) with shell-based PATH fallback (`where node` / `which node`).

**Blocked Patterns** (Security):
| Pattern | Reason |
|---------|--------|
| `eval()`, `exec()` | Code injection/exécution |
| `Function()` | Function constructor (eval alternative) |
| `String.fromCharCode()` | Bypass technique |
| `__proto__` | Prototype pollution |
| `child_process` | Process spawning |
| `os.system`, `os.popen` | OS command execution |
| Network access (`net.`, `http`, `dns.`) | Unauthorized network calls |

**Allowed**: Safe standard library requires like `require('os')`, `require('path')`, `require('fs').readFileSync()` are permitted since they're read-only or safe operations. The sandbox relies on the execution environment for isolation.

---

### ⚠️ `run_python`

⚠️ **DANGEROUS** — Execute Python code (sandboxed). **Disabled by default.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `python` | `string` | Yes | Python code to execute |
| `timeout_seconds` | `number` | No | Timeout in seconds (default: 5, max: 60) |

**Returns**: `{ success: true, data: { output } }`

**Cross-Platform Detection**: Automatically tries multiple Python executables (`py` → `python3` → `python`) with shell-based PATH fallback (`where py` / `which python`).

**Blocked Patterns** (Security):
| Pattern | Reason |
|---------|--------|
| `import os`, `from os import` | OS access |
| `import subprocess`, `from subprocess import` | Process spawning |
| `import shutil` | File system operations |
| `__import__()` | Dynamic module loading |
| `eval()`, `exec()` | Code injection/exécution |
| `os.system`, `os.popen` | OS command execution |

---

### ⚠️ `execute_command`

⚠️ **DANGEROUS** — Execute shell commands with full shell interpretation (pipes, redirects, env vars). **Disabled by default.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | Shell command (supports pipes, redirects, variables) |
| `timeout_seconds` | `number` | No | Timeout in seconds (default: 60, max: 300) |
| `input` | `string` | No | Stdin input to pipe to the command |

**Returns**: `{ success: true, data: { stdout, stderr, output } }`

**Shell Features**: Full shell interpretation enabled (`shell: true`). Supports pipes (`|`), redirects (`>`, `>>`), environment variables, and subshells.

**Security**: Command is sanitized through `sanitizeCommand()` which blocks dangerous patterns before execution. Blocked patterns include `rm -rf`, `sudo`, command substitution, excessive pipes, and more.

**Examples**:
```json
// Simple command
{"command": "npm run build", "timeout_seconds": 120}

// With pipe
{"command": "ls -la | grep \".ts\""}

// With redirect
{"command": "echo \"Build complete!\" > output.txt"}

// With stdin input
{"command": "cat", "input": "Hello World!"}
```

---

### ⚠️ `run_in_terminal`

⚠️ **DANGEROUS** — Open command in interactive terminal. **Disabled by default.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | Shell command |

**Returns**: `{ success: true, data: { launched: true } }`

---

## 🔧 Utility Tools (~20+)

### `save_memory` — v1.4.8 Update

Save a specific fact or piece of information to persistent memory. Persists across LM Studio restarts.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fact` | `string` | Yes | The specific fact or piece of information to remember |

**Returns**: `{ success: true, data: { saved: true } }`

> ⚠️ **Important**: After saving, use `get_memory` or `search_memory` to retrieve it later. Memories are stored with timestamp-based IDs (e.g., `"memory_1746508800000"`).

**Example**:
```json
{"fact": "The API key for production is abc123"}
→ { success: true, data: { saved: true } }
```

---

### `get_memory` — v1.4.8 Update 🆕

Retrieve all saved memory entries. Returns a list of all facts stored via `save_memory`, sorted by timestamp (newest first).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | — |

**Returns**: `{ success: true, data: { memories: Array<{id, fact, timestamp}>, count } }`

**Example**:
```json
{}
→ { 
    success: true, 
    data: { 
      memories: [
        { id: "memory_1746508800000", fact: "The API key for production is abc123" }
      ], 
      count: 1 
    } 
  }
```

---

### `search_memory` — v1.4.8 Update 🆕

Search saved memories for a specific fact or keyword. Returns matching entries (case-insensitive partial matching).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query to match against stored facts |
| `max_results` | `number` | No | Maximum number of results to return (default: 10, max: 50) |

**Returns**: `{ success: true, data: { results: Array<{id, fact, timestamp}>, count } }`

**Example**:
```json
{"query": "API key"}
→ { 
    success: true, 
    data: { 
      results: [
        { id: "memory_1746508800000", fact: "The API key for production is abc123" }
      ], 
      count: 1 
    } 
  }
```

---

### `delete_memory` — v1.4.8 Update 🆕

Delete a saved memory entry by its ID (returned from `save_memory` or `get_memory`).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entry_id` | `string` | Yes | The unique ID of the memory entry to delete |

**Returns**: `{ success: true, data: { deleted: true, entry_id } }` or `{ success: false, error: "..." }`

**Example**:
```json
{"entry_id": "memory_1746508800000"}
→ { success: true, data: { deleted: true, entry_id: "memory_1746508800000" } }
```

---

### Memory System — Complete Workflow (v1.4.8)

**Step-by-step flow for persistent fact storage**:

```json
// Step 1: Save a fact
{"fact": "The database password is secret123"}
→ { success: true, data: { saved: true } }

// Step 2: Retrieve all memories
{}
→ { 
    success: true, 
    data: { 
      memories: [
        { id: "memory_1746508800000", fact: "The database password is secret123" }
      ], 
      count: 1 
    } 
  }

// Step 3: Search for a keyword
{"query": "password"}
→ { results: [{ id: "memory_...", fact: "..." }], count: 1 }

// Step 4: Delete the entry (when no longer needed)
{"entry_id": "memory_1746508800000"}
→ { success: true, data: { deleted: true } }
```

> 💡 **Note**: Memories persist across LM Studio restarts and sessions. They are stored in `.ai_toolbox_memory.json` with immediate synchronous persistence for reliability.

---

### 🆕 Session Summary Tools (v1.5.0+)

#### `save_session_summary` — v1.5.0 Update 🆕

Save a structured session summary for cross-session continuity. Includes accomplishments, pending tasks, decisions made, and context for the next session. This enables seamless handoff between LM Studio sessions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_description` | `string` | Yes | Brief description of what was being worked on |
| `accomplishments` | `string` | No | List key accomplishments or completed tasks (default: "No specific accomplishments recorded.") |
| `pending_tasks` | `string` | No | List remaining work that needs to continue in the next session (default: "No specific pending tasks recorded.") |
| `decisions_made` | `string` | No | Key architectural or implementation decisions made during this session (default: "No specific decisions recorded.") |
| `context_for_next_session` | `string` | No | Important context, file locations, or setup steps needed for the next session (default: "No additional context provided.") |

**Returns**: `{ success: true, data: { saved: true, summary_id, message, preview } }`

> 💡 **Use Case**: Call this at the end of a long task or before closing LM Studio to ensure continuity in future sessions. The AI can later retrieve this with `get_session_summary()` to immediately understand what was being worked on previously.

**Example**:
```json
{
  "task_description": "Debugging memory persistence issues",
  "accomplishments": "Fixed stateManager to use synchronous saves and workingDir-based paths. Added atomic writes for corruption recovery.",
  "pending_tasks": "Test persistence across plugin reloads in production environment. Verify .ai_toolbox_memory.json is created in workspace root.",
  "decisions_made": "Switched from debounced async saves to immediate sync writes for reliability. Store memory in working directory rather than global path.",
  "context_for_next_session": "Check .ai_toolbox_memory.json location after restarting LM Studio. Ensure stateManager persistence flag is enabled."
}
→ { success: true, data: { saved: true, summary_id: "session_summary_1746508800000", message: "Session summary saved successfully." } }
```

---

#### `get_session_summary` — v1.5.0 Update 🆕

Retrieve the most recent saved session summary for continuity across sessions. Returns structured data including accomplishments, pending tasks, and decisions made in the previous session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | — |

**Returns**: `{ success: true, data: { summaries: Array<{task_description, accomplishments, pending_tasks, decisions_made, context_for_next_session}>, count, message } }`

> 💡 **Use Case**: Call this at the start of a new session to immediately understand what was being worked on previously. The AI can use this information to pick up where it left off without requiring manual context from the user.

**Example**:
```json
{}
→ { 
    success: true, 
    data: { 
      summaries: [
        {
          task_description: "Debugging memory persistence issues",
          accomplishments: "Fixed stateManager to use synchronous saves and workingDir-based paths.",
          pending_tasks: "Test persistence across plugin reloads in production environment.",
          decisions_made: "Switched from debounced async saves to immediate sync writes for reliability.",
          context_for_next_session: "Check .ai_toolbox_memory.json location after restarting LM Studio."
        }
      ], 
      count: 1, 
      message: "Latest session summary retrieved.",
      total_summaries_stored: 1
    } 
  }
```

---

### Session Summary — Complete Workflow (v1.5.0)

**Step-by-step flow for cross-session continuity**:

```json
// Step 1: At the end of a long task, save a session summary
{
  "task_description": "Implementing user authentication module",
  "accomplishments": "Created login form, added JWT token validation, integrated with backend API.",
  "pending_tasks": "Add password reset functionality. Implement email verification flow.",
  "decisions_made": "Using JWT tokens stored in httpOnly cookies for session management.",
  "context_for_next_session": "Auth module is in src/auth/. Backend endpoints are at /api/auth/*."
}
→ ✅ Session summary saved successfully

// Step 2: Start a new session — retrieve previous context
{}
→ ✅ Retrieves latest session summary with all accomplishments and pending tasks

// Step 3: Continue work based on retrieved context
// AI now knows exactly what was done and what needs to be continued
```

> 💡 **Storage**: Session summaries are stored in `.ai_toolbox_memory.json` alongside other memory entries. Each summary has a unique ID (timestamp-based) for tracking multiple sessions.

---

### `get_system_info`

Get system information.

**Returns**: `{ success: true, data: { platform, arch, cpus, totalMemory, freeMemory, hostname, release } }`

---

### `read_clipboard`

Read text from system clipboard.

**Returns**: `{ success: true, data: { content } }`

---

### `write_clipboard`

Write text to system clipboard.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | `string` | Yes | Text to write |

**Returns**: `{ success: true, data: { written: true } }`

---

### `send_notification`

Send desktop notification.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Notification title |
| `message` | `string` | Yes | Notification message |
| `icon` | `string` | No | Custom icon path |

**Returns**: `{ success: true, data: { sent: true, title, message } }`

---

### `findLMStudioHome`

Locate LM Studio installation directory.

**Returns**: `{ success: true, data: { found: true, path, platform } }`

---

### `get_enabled_tools`

List currently enabled tools.

**Returns**: `{ success: true, data: { toolCount, tools: string[] } }`

---

## 💾 Backup & Restore Tools (4)

### `create_backup`

Create a compressed ZIP backup of plugin state files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `destination` | `string` | No | Custom filename (default: auto-generated with timestamp). Must end with `.zip`. Max 256 chars. |
| `includeState` | `boolean` | No | Include `.ai_toolbox_state.json` (default: `true`) |
| `includeContext` | `boolean` | No | Include `.ai_toolbox_context.json` (default: `true`) |

**Returns**: `{ success: true, data: { message, backupPath, filename, filesBackedUp, compressedSizeBytes, compressedSizeHuman, createdAt } }`

**Storage Location**: `.ai_toolbox_backups/` directory with timestamped filenames.

**Filename Format**: `backup-YYYY-MM-DD-HH-MM-SS.zip` (e.g., `backup-2026-05-30-20-27-00.zip`)

**Example**:
```json
// Auto-generated filename
{}
→ Creates: .ai_toolbox_backups/backup-2026-05-30-20-27-00.zip

// Custom filename
{"destination": "pre-deployment-backup.zip"}
→ Creates: .ai_toolbox_backups/pre-deployment-backup.zip

// Selective backup (state only)
{"includeState": true, "includeContext": false}
```

**Response Example**:
```json
{
  "success": true,
  "message": "Backup created successfully",
  "backupPath": ".ai_toolbox_backups/backup-2026-05-30-20-27-00.zip",
  "filename": "backup-2026-05-30-20-27-00.zip",
  "filesBackedUp": [".ai_toolbox_state.json", ".ai_toolbox_context.json"],
  "compressedSizeBytes": 1247,
  "compressedSizeHuman": "1.22 KB",
  "createdAt": "2026-05-30T20:27:00.000Z"
}
```

---

### `list_backups`

List all available backup files in the backups directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sortBy` | `string` | No | Sort order: `"date"` (newest first) or `"size"` (largest first). Default: `"date"`. |
| `limit` | `number` | No | Maximum backups to return. Default: `50`, Max: `1000`. |

**Returns**: `{ success: true, data: { backups: Array<{filename, path, sizeBytes, createdAt}>, totalCount, returnedCount } }`

**Example**:
```json
{
  "sortBy": "date",
  "limit": 10
}
```

**Response Example**:
```json
{
  "success": true,
  "backups": [
    {
      "filename": "backup-2026-05-30-20-27-00.zip",
      "path": ".ai_toolbox_backups/backup-2026-05-30-20-27-00.zip",
      "sizeBytes": 1247,
      "createdAt": "2026-05-30T20:27:00.000Z"
    },
    {
      "filename": "backup-2026-05-30-18-30-00.zip",
      "path": ".ai_toolbox_backups/backup-2026-05-30-18-30-00.zip",
      "sizeBytes": 1198,
      "createdAt": "2026-05-30T18:30:00.000Z"
    }
  ],
  "totalCount": 2,
  "returnedCount": 2
}
```

---

### `restore_backup` ⚠️

⚠️ **Destructive** — Restore state files from a backup archive.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `backupFile` | `string` | Yes | Backup filename to restore (e.g., `"backup-2026-05-30-20-27-00.zip"`). Max 256 chars. |
| `confirm` | `boolean` | Yes | ⚠️ **MUST be `true`** to confirm restoration. Safety check against accidental data loss. |

**Returns**: `{ success: true, data: { message, backupFile, restoredFiles, extractedFilesCount, timestamp } }`

**⚠️ SAFETY CHECK**: Requires explicit confirmation (`confirm: true`) before proceeding.

**Example**:
```json
{
  "backupFile": "backup-2026-05-30-20-27-00.zip",
  "confirm": true
}
```

**Response Without Confirmation**:
```json
{
  "success": false,
  "error": "⚠️ SAFETY CHECK FAILED",
  "message": "Restoration not performed. Set confirm=true to proceed.",
  "hint": "This is intentional to prevent accidental data loss. Example: {\"backupFile\": \"...\", \"confirm\": true}"
}
```

**Response With Confirmation**:
```json
{
  "success": true,
  "message": "Restored 2 file(s) from backup",
  "backupFile": "backup-2026-05-30-20-27-00.zip",
  "restoredFiles": [".ai_toolbox_state.json", ".ai_toolbox_context.json"],
  "extractedFilesCount": 3,
  "timestamp": "2026-05-30T20:28:00.000Z"
}
```

**Security Features**:
- Path traversal protection (blocks `../` sequences)
- Temporary extraction directory with cleanup
- Only restores known state files (`.ai_toolbox_state.json`, `.ai_toolbox_context.json`)

---

### `delete_backup` ⚠️

⚠️ **Destructive** — Delete a backup file from the backups directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `backupFile` | `string` | Yes | Backup filename to delete (e.g., `"old-backup.zip"`). Max 256 chars. Must be `.zip`. |
| `confirm` | `boolean` | Yes | ⚠️ **MUST be `true`** to confirm deletion. Safety check against accidental data loss. |

**Returns**: `{ success: true, data: { message, deletedFile, timestamp } }`

**⚠️ SAFETY CHECK**: Requires explicit confirmation (`confirm: true`) before proceeding.

**Example**:
```json
{
  "backupFile": "old-backup.zip",
  "confirm": true
}
```

**Response Without Confirmation**:
```json
{
  "success": false,
  "error": "⚠️ SAFETY CHECK FAILED",
  "message": "Deletion not performed. Set confirm=true to proceed.",
  "hint": "This is intentional to prevent accidental data loss."
}
```

**Response With Confirmation**:
```json
{
  "success": true,
  "message": "Deleted backup: old-backup.zip",
  "deletedFile": "old-backup.zip",
  "timestamp": "2026-05-30T20:30:00.000Z"
}
```

---

### Backup & Restore Workflow Example

```json
// Step 1: Create a backup before major changes
{"tool_name": "create_backup", "parameters": {"destination": "before-refactor.zip"}}
→ ✅ Backup created successfully

// Step 2: Perform your work...

// Step 3: List available backups if needed
{"tool_name": "list_backups", "parameters": {"limit": 10}}
→ ✅ Returns list of all backups

// Step 4: Restore if something goes wrong
{"tool_name": "restore_backup", "parameters": {
  "backupFile": "before-refactor.zip",
  "confirm": true
}}
→ ⚠️ LLM will ask for confirmation first!
→ ✅ Restored successfully

// Step 5: Clean up old backups
{"tool_name": "delete_backup", "parameters": {
  "backupFile": "old-backup.zip",
  "confirm": true
}}
→ ⚠️ LLM will ask for confirmation first!
→ ✅ Deleted successfully
```

---

### Backup Metadata Format

Each backup includes a `backup-metadata.json` file:

```json
{
  "version": "1.0",
  "createdAt": "2026-05-30T20:27:00.000Z",
  "pluginVersion": "1.4.1",
  "filesCount": 2,
  "totalUncompressedSize": 2048
}
```

---

## 📊 Vector RAG Tools (4) 🆕

### `rag_index_files`

Index files for semantic search.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `directoryPath` | `string` | Yes | Directory to index |
| `filePattern` | `string` | No | File pattern (default: `*.{ts,js,tsx,jsx,md,json,yaml,yml,toml,txt}`) |
| `batchSize` | `number` | No | Batch size (default: 10) |

**Returns**: `{ success: true, data: { indexedChunks, filesProcessed, skippedFiles, totalDocuments } }`

**Note**: Uses persistent singleton vector store — indexed data survives between tool calls.

---

### `rag_query_vector`

Query the vector index for semantically similar documents.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query text |
| `topK` | `number` | No | Number of results to return (default: 5, max: 20) |

**Returns**: `{ success: true, data: { query, topK, totalDocuments, results: [{id, text, score, metadata}] } }`

**Note**: Now returns actual search results instead of placeholder data.

---

### `rag_clear_index`

Clear the vector index. Requires confirmation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirm` | `boolean` | Yes | Must be `true` to confirm clearing the index |

**Returns**: `{ success: true, data: { message } }`

---

### `rag_web_content` 🆕

Fetch content from a URL and use RAG to find relevant chunks.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The URL to fetch (http/https) |
| `query` | `string` | Yes | Search query for relevance matching |

**Returns**: `{ success: true, data: { url, query, totalChunks, bestMatch: {text, score, metadata} } }`

**Example**:
```json
{
  "url": "https://example.com",
  "query": "test"
}
```

---

## 📋 Return Type Reference

All tools return a structured result:

```typescript
// Success
{
  success: true,
  data: { /* tool-specific data */ }
}

// Error
{
  success: false,
  error: "Descriptive error message"
}
```

---

## ⚠️ Security Summary

| Tool Category | Default State | Risk Level |
|--------------|--------------|------------|
| File System | ✅ Enabled | Low |
| Web Research | ✅ Enabled | Low |
| Browser Automation | ❌ Disabled | Medium |
| Git/GitHub | ❌ Disabled | Medium |
| Database | ❌ Disabled | Low |
| Background Commands | ❌ Disabled | High |
| Code Execution | ❌ Disabled | ⚠️ **High** |
| Utilities | ✅ Enabled | Low |
| Image Processing | ✅ Enabled | Low |
| HTTP Client | ❌ Disabled | Medium |
| Vector RAG | ✅ Enabled | Low |

---

## 🎨 Interactive UI Generation Tools (3)

### `generate_ui_component`

Generate HTML/CSS/JS code for interactive UI components. Supports buttons, forms, charts, and dashboards.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `component_type` | `string` | Yes | Component type: `"button"`, `"form"`, `"chart"`, or `"dashboard"` |
| `label` | `string` | No* | Label text for buttons/forms (*required for button/form) |
| `fields` | `Array<{name, type, label}>` | No* | Form field definitions (*required for form component) |
| `chart_data` | `Array<{label, value}>` | No* | Chart data points (*required for chart component) |
| `dashboard_titles` | `string[]` | No* | Titles for dashboard cards (*required for dashboard) |

**Returns**: `{ success: true, data: { component_type, html } }` or `{ success: false, error }`

**Example**:
```json
{
  "component_type": "form",
  "fields": [
    { "name": "email", "type": "email", "label": "Email Address" },
    { "name": "message", "type": "textarea", "label": "Message" }
  ]
}
```

---

### `render_and_preview_ui` — v1.4.7 Update

Render generated HTML in the system browser and optionally capture a screenshot using Puppeteer.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | Complete HTML content to render |
| `filename` | `string` | No | Output filename (default: `"ui_preview.html"`) |
| `screenshot_path` | `string` | No | Optional path to save screenshot |

**Returns**: `{ success: true, data: { rendered: true, file, path, screenshotSaved? } }` or `{ success: false, error }`

**Cross-Platform File URL Handling (v1.4.7+)**: Uses Node.js built-in `pathToFileURL()` for proper Windows/macOS/Linux compatibility. File paths with spaces are automatically URL-encoded:
```typescript
// Windows path normalization verified:
pathToFileURL('C:\\My Documents\\ui.html').href
→ "file:///C:/My%20Documents/ui.html"  ✅ Valid on all platforms
```

**Example**:
```json
{
  "html_content": "<!DOCTYPE html><html>...</html>",
  "filename": "my_component.html",
  "screenshot_path": "./screenshots/component.png"
}
```

---

### `extract_ui_data` — v1.4.7 Update

Extract structured data from HTML content (tables, forms, lists). Useful for parsing generated or fetched UIs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | HTML content to parse |
| `extraction_type` | `string` | No | Data type: `"table"`, `"form"`, or `"list"` (default: `"table"`) |

**Returns**: `{ success: true, data: { tables?: string[][], formFields?: Array<{name, type}>, items?: string[] } }` or `{ success: false, error }`

> ⚠️ **Limitation**: Uses regex-based HTML parsing (not a full DOM parser). Works well for simple generated UIs but may fail on complex/nested structures. For production use, consider adding `jsdom` or `cheerio` as dependencies.

**Example**:
```json
{
  "html_content": "<table><tr><td>Row 1</td></tr></table>",
  "extraction_type": "table"
}
→ { tables: [["Row 1"]], formFields: [], items: [] }
```

---

### Interactive UI Generation — Complete Workflow Example (v1.4.7)

**Step-by-step flow**:

```json
// Step 1: Generate a form component
{"component_type": "form", "fields": [
  {"name": "email", "type": "email", "label": "Email"},
  {"name": "message", "type": "textarea", "label": "Message"}
]}
→ Returns complete HTML with form structure

// Step 2: Preview in browser (opens system default browser)
{"html_content": "<!DOCTYPE html>...generated HTML...", 
 "filename": "contact_form.html",
 "screenshot_path": "./screenshots/form.png"}
→ Opens file:///C:/path/to/contact_form.html ✅ (Windows path handled automatically)

// Step 3: Extract form fields from the generated UI
{"html_content": "<form>...</form>", "extraction_type": "form"}
→ { formFields: [{name: "email", type: "email"}, {name: "message", type: "textarea"}] }
```

---

### `extract_ui_data`

Extract structured data from HTML content (tables, forms, lists). Useful for parsing generated or fetched UIs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | HTML content to parse |
| `extraction_type` | `string` | No | Data type: `"table"`, `"form"`, or `"list"` (default: `"table"`) |

**Returns**: `{ success: true, data: { tables?: string[][], formFields?: Array<{name, type}>, items?: string[] } }` or `{ success: false, error }`

**Example**:
```json
{
  "html_content": "<table><tr><td>Row 1</td></tr></table>",
  "extraction_type": "table"
}
```

---

## 🧠 Auto-Context Management Tools (7)

### `auto_summarize_context`

Automatically analyze recent session activity, identify important patterns/decisions, and save them to persistent memory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_events` | `Array<{type, timestamp, data}>` | No | Recent session events to analyze |
| `config_changes` | `Record<string, boolean\|string>` | No | Configuration changes made during session |

**Returns**: `{ success: true, data: { saved_count, summary } }` or `{ success: false, error }`

**Example**:
```json
{
  "session_events": [
    { "type": "tool_read_file", "timestamp": 1234567890 },
    { "type": "decision", "data": { "decision": "Refactored auth module" } }
  ],
  "config_changes": { "browserAutomation": true, "gitOperations": false }
}
```

---

### `get_context_memory`

Retrieve automatically saved context entries from persistent memory. Useful for recalling past decisions, patterns, or configurations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | `number` | No | Max entries to return (default: 20, max: 50) |
| `type` | `string` | No | Filter by type: `"decision"`, `"pattern"`, `"configuration"`, `"file_change"`, `"error"`, or `"summary"` |

**Returns**: `{ success: true, data: { entries: ContextEntry[] } }` or `{ success: false, error }`

**Example**:
```json
{
  "limit": 10,
  "type": "decision"
}
```

---

### `search_context`

Search through automatically saved context entries using text matching. Finds relevant past decisions, patterns, or configurations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query to match against titles, content, and tags |
| `max_results` | `number` | No | Max results to return (default: 10, max: 50) |

**Returns**: `{ success: true, data: { results: ContextEntry[] } }` or `{ success: false, error }`

**Example**:
```json
{
  "query": "authentication refactor",
  "max_results": 5
}
```

---

### `context_summary`

Get a summary of all automatically saved context entries, including counts by type and recent activity.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | — |

**Returns**: `{ success: true, data: { total_entries, entries_by_type: Record<string, number>, recent_entries: ContextEntry[], last_updated } }` or `{ success: false, error }`

---

### `delete_context_entry`

Delete a specific auto-saved context entry by its unique ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entry_id` | `string` | Yes | The unique ID of the context entry to delete |

**Returns**: `{ success: true, data: { deleted: true, entry_id } }` or `{ success: false, error }`

**Example**:
```json
{
  "entry_id": "ctx_1234567890_abc123def"
}
```

---

### `clear_context_memory`

Clear all automatically saved context entries from persistent memory. This action cannot be undone.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirm` | `boolean` | Yes | Must be `true` to confirm deletion |

**Returns**: `{ success: true, data: { cleared: true } }` or `{ success: false, error }`

**Example**:
```json
{
  "confirm": true
}
```

---

### `track_important_event`

Manually record an important event or decision to persistent memory. Useful for marking critical moments in a session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Title of the important event |
| `content` | `string` | Yes | Detailed description of the event |
| `tags` | `string[]` | No | Tags to categorize the event |

**Returns**: `{ success: true, data: { tracked: true, entry_id } }` or `{ success: false, error }`

**Example**:
```json
{
  "title": "Security Audit Completed",
  "content": "Performed comprehensive security review of all tool categories. No critical vulnerabilities found.",
  "tags": ["security", "audit", "compliance"]
}
```

---

## 📋 Context Entry Structure

All context entries follow this structure:

```typescript
interface ContextEntry {
  id: string;              // Unique identifier (ctx_{timestamp}_{random})
  timestamp: number;       // Unix timestamp in milliseconds
  type: 'decision' | 'pattern' | 'configuration' | 'file_change' | 'error' | 'summary';
  title: string;           // Human-readable title
  content: string;         // Detailed description
  tags?: string[];         // Optional categorization tags
  session_id?: string;     // Optional session identifier
}
```

### Storage Location

Context entries are persisted to `.ai_toolbox_context.json` in the current working directory. The file uses atomic writes (temp file + rename) for corruption recovery and is automatically limited to 1000 entries to prevent unbounded growth.

---

## ⚠️ Security Summary

| Tool Category | Default State | Risk Level |
|--------------|--------------|------------|
| File System | ✅ Enabled | Low |
| Web Research | ✅ Enabled | Low |
| Browser Automation | ❌ Disabled | Medium |
| Git/GitHub | ❌ Disabled | Medium |
| Database | ❌ Disabled | Low |
| Background Commands | ❌ Disabled | High |
| Code Execution | ❌ Disabled | ⚠️ **High** |
| Utilities | ✅ Enabled | Low |
| Image Processing | ✅ Enabled | Low |
| HTTP Client | ❌ Disabled | Medium |
| Vector RAG | ✅ Enabled | Low |
| Interactive UI Generation | ❌ Disabled | Low |
| Auto-Context Management | ✅ Enabled | Low |
| Backup & Restore | ✅ Enabled | Low (with safety checks) |

---

## 🛡️ ContextGuard Settings (v1.4.1)

ContextGuard is **not a tool** but an automatic context management system with explicit UI controls.

### Access Path
```
LM Studio → Plugins → AI Toolbox → ⚙️ Settings → Scroll to "🧠 ContextGuard Token Management"
```

### Configuration Options

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| **🧠 ContextGuard Token Management** | Toggle | — | ✅ Enabled | Master switch for all ContextGuard features (compression, smart reading, terminal filtering) |
| **📊 Token Limit Before Compression** | Numeric | 1,000–200,000 | `80,000` | Maximum tokens before compression triggers. **Compression activates at 90%** of this value (e.g., 72k for 80k limit) |
| **🔍 Smart File Reading** | Toggle | — | ✅ Enabled | Extracts keywords from user queries to read only relevant portions of files. Saves tokens and speeds up responses |
| **🤖 Summary Model Name** | Text Input | Any model name | *(empty)* | LM Studio model name used for history summarization. Leave empty to use your current chat model |
| **📌 Terminal Output Filtering** | Toggle | — | ✅ Enabled | Automatically truncates long terminal outputs (npm install, stack traces) to save tokens |
| **📏 Max Terminal Output Length** | Numeric | 100–20,000 | `2,000` | Maximum characters before terminal output is truncated and summarized |

### Visual Indicator (When Compression Activates)

When ContextGuard compresses chat history, a visual indicator appears:

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

### Recommended Settings by Use Case

| Use Case | Token Limit | Smart Reading | Terminal Filter | Summary Model |
|----------|-------------|---------------|-----------------|---------------|
| **Short Sessions** (<20 messages) | 100,000+ | ✅ Enabled | ✅ Enabled | Current chat model |
| **Long Coding Sessions** (hours) | 50,000–80,000 | ✅ Enabled | ✅ Enabled | `gemma-2b` or `phi-3-mini` |
| **Heavy Terminal Output** (npm install, logs) | 40,000–60,000 | ✅ Enabled | ✅ Enabled (1,000 chars) | Current chat model |
| **Memory-Constrained Systems** | 20,000–40,000 | ✅ Enabled | ✅ Enabled (500 chars) | Small fast model |

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Compression not triggering | Increase token limit or have longer conversation |
| Visual indicator missing | Check `contextGuardEnabled` is toggled ON |
| Summary quality poor | Set dedicated summary model (e.g., `gemma-2b`) |
| Terminal output too truncated | Increase `Max Terminal Output Length` setting |

### Config Key Reference (for developers)

```typescript
interface ContextGuardConfig {
  contextGuardEnabled: boolean;              // Master toggle
  contextGuardTokenLimit: number;            // Token limit (1K-200K)
  contextGuardSmartReading: boolean;         // Smart file reading
  contextGuardSummaryModel: string;          // Summary model name
  contextGuardTerminalFilterEnabled: boolean;// Terminal filtering
  contextGuardTerminalFilterLength: number;  // Max terminal chars (100-20K)
}
```

---

*End of Tools Reference*

---

## 🛠️ Utility Tools (17)

### `save_session_summary` — v1.5.0 Update

Save a structured session summary for cross-session continuity. Includes accomplishments, pending tasks, decisions made, and context for the next session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_description` | `string` | Yes | Brief description of what was being worked on |
| `accomplishments` | `string` | No | List key accomplishments or completed tasks |
| `pending_tasks` | `string` | No | List remaining work that needs to continue in the next session |
| `decisions_made` | `string` | No | Key architectural or implementation decisions made during this session |
| `context_for_next_session` | `string` | No | Important context, file locations, or setup steps needed for the next session |

**Returns**: `{ success: true, data: { saved: true, summary_id: string, message: 'Session summary saved successfully.', preview: { task_description, timestamp } } }`

> 💡 **Storage**: Integrated with existing `.ai_toolbox_memory.json` persistence layer using StateManager. Each summary gets a unique timestamp-based ID (`session_summary_{timestamp}`).

---

### `get_session_summary` — v1.5.0 Update

Retrieve the most recent saved session summary for continuity across sessions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { summaries: [...], count: 1, message: 'Latest session summary retrieved.', total_summaries_stored: number } }`

> 💡 **Sorting**: Returns the most recent summary first based on internal timestamp ordering. Use `total_summaries_stored` to know how many exist.

---

### `get_system_info`

Get information about the system (OS, CPU, Memory).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { platform, arch, cpus, totalMemory, freeMemory, hostname, release } }`

---

### `read_clipboard`

Read text content from the system clipboard. Cross-platform support (Windows PowerShell, macOS pbpaste, Linux xclip/xsel).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { content: string } }`

> ⏱️ **Timeout**: 5-second timeout. Returns error if clipboard is empty or inaccessible.

---

### `write_clipboard`

Write text content to the system clipboard. Cross-platform support with shell injection prevention (PowerShell/Bash escaping).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | `string` | Yes | The text content to write to clipboard |

**Returns**: `{ success: true, data: { written: true } }`

> ⏱️ **Timeout**: 5-second timeout. Content is escaped for shell safety on all platforms.

---

### `send_notification`

Send a system notification to the user using `node-notifier`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Notification title |
| `message` | `string` | Yes | Notification message |
| `icon` | `string` | No | Optional custom icon path |

**Returns**: `{ success: true, data: { sent: true, title, message } }`

---

### `findLMStudioHome`

Locate LM Studio installation directory across platforms (Windows, macOS, Linux).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { found: true, path: string, platform: string } }` or error if not found.

> 📁 **Search Order**: Checks `%APPDATA%/lm-studio`, `~/Library/Application Support/lm-studio`, `~/.local/share/lm-studio` across platforms.

---

### `get_enabled_tools`

Get list of currently enabled tools based on configuration (respects `godMode` and individual tool toggles).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { toolCount: number, tools: string[] } }`

---

### `system_monitor` — CPU / Memory / Disk / Network usage

Get detailed system resource metrics including CPU, memory, disk usage, and network interfaces.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metrics` | `Array<'cpu' \| 'memory' \| 'disk' \| 'network'>` | No | Metrics to report (default: `['cpu', 'memory']`) |

**Returns**: `{ success: true, data: { timestamp, cpu?: {...}, memory?: {...}, disk?: {...}, network?: {...} } }`

> 📊 **CPU Details**: Includes core count, models, average speed, and load averages (Unix only).
> 💾 **Memory**: Reports total, free, used bytes/GB with usage percentage.
> 💿 **Disk**: Uses PowerShell on Windows (`Get-CimInstance Win32_LogicalDisk`) or `df -h` on Unix.
> 🌐 **Network**: Lists all interfaces with IP addresses and MAC addresses.

---

### `process_list` — List running processes

List currently running system processes with resource usage. Supports filtering by process name.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | `string` | No | Filter processes by name (partial match, case-insensitive) |

**Returns**: `{ success: true, data: { count: number, processes: Array<{pid, name, cpuPercent?, memoryMb?}>, note? } }`

> ⚠️ **Limit**: Returns up to 200 processes max. Use `filter` parameter for more specific results on systems with many processes.
> 🪟 **Windows**: Uses `Get-CimInstance Win32_Process` via PowerShell.
> 🐧 **Unix/Linux**: Uses `ps -eo pid,comm,%cpu,rss,state`.

---

### `env_inspect` — List environment variables

List current environment variables with optional prefix filtering (e.g., `PATH`, `NODE`).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prefix` | `string` | No | Filter environment variable keys by this prefix (case-insensitive) |

**Returns**: `{ success: true, data: { count: number, prefix: string, variables: Array<{key, value}> } }`

> 🔍 **Sorting**: Results are sorted alphabetically by key.
> ⚠️ **Security Sensitive**: Contains all environment variables including potentially sensitive values (API keys, passwords). Use prefix filtering to limit exposure.

---

### `hash_file` — File integrity verification

Generate cryptographic checksums for a file to verify its integrity.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | `string` | Yes | Path to the file to hash |
| `algorithm` | `'md5' \| 'sha1' \| 'sha256'` | No | Hash algorithm (default: `sha256`) |

**Returns**: `{ success: true, data: { file, algorithm, hash, fileSizeBytes, fileSizeHuman } }`

> ⚠️ **Limits**: Files >500MB are rejected. Path traversal protection enforced via `validatePath()`.
> 📦 **Streaming**: Uses Node.js streams for memory-efficient hashing of large files.

---

### `token_count` — LLM token counting

Count the number of LLM tokens in text using the tiktoken library (`@dqbd/tiktoken`). Supports multiple encodings.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | `string` | Yes | The text to count tokens for |
| `encoding` | `'cl100k_base' \| 'p50k_base' \| 'r50k_base' \| 'gpt2'` | No | Token encoding model (default: `cl100k_base`) |

**Returns**: `{ success: true, data: { textLength, tokenCount, encoding, avgCharsPerToken } }`

> 🧮 **Encodings**:
> - `cl100k_base`: GPT-4/GPT-3.5 (recommended default)
> - `p50k_base`: Codex models
> - `r50k_base`/`gpt2`: Older GPT-2 models

---

### `convert_format` — File format conversion

Convert between file formats: JSON↔CSV, base64 encode/decode, or compress/decompress files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | `'json_to_csv' \| 'csv_to_json' \| 'base64_encode' \| 'base64_decode' \| 'compress' \| 'decompress'` | Yes | Conversion action to perform |
| `input` | `string` | Yes | Input file path or content (for base64 actions, can be raw text) |
| `output` | `string` | No | Output file path. If omitted, uses same name with different extension |

**Returns**: Varies by action:
- **JSON→CSV/CSV→JSON**: `{ convertedFrom, convertedTo, rows }`
- **Base64**: `{ encoded, originalLength }` or `{ decoded, decodedLength }` (or file paths if output specified)
- **Compress/Decompress**: `{ compressedFile }` or `{ extractedTo }`

> 📦 **Dependencies**: Uses `archiver` for ZIP compression and `unzipper` for extraction. Both are pre-installed in package.json.

---

### `secret_scan` — Security audit

Scan files in the current working directory for potentially exposed API keys, passwords, tokens, and other secrets.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | No | Directory to scan (default: current working directory) |
| `exclude` | `string` | No | Files or directories to exclude (e.g., `"node_modules,.git"`) |

**Returns**: `{ success: true, data: { scannedPath, totalFindings, severity: 'clean'/'low'/'medium'/'high', findings: Array<{file, line, type, content}>, note? } }`

> 🔍 **Patterns Detected**: Generic API keys, AWS credentials, private keys, GitHub tokens, JWTs, passwords, DB connection strings, Slack tokens.
> ⚠️ **Security Gate**: Read-only operation; no config flag required. Findings limited to 100 max.
> 📊 **Severity Levels**: `clean` (0), `low` (<5), `medium` (<20), `high` (≥20) findings.

---

### `port_check` — TCP port availability

Check if a specific TCP port is open and listening on the local machine.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `port` | `number` | Yes | TCP port number to check (1-65535) |
| `host` | `string` | No | Host to check against (default: `localhost`) |

**Returns**: `{ success: true, data: { port, host, status: 'open'/'closed'/'timed_out' } }`

> ⏱️ **Timeout**: 3-second timeout. Uses Node.js net.Socket for connection testing.

---

### `package_manage` — Dependency management

Install, uninstall, update, or audit npm/pip/cargo packages. ⚠️ Security-sensitive: must be enabled in config (`packageManage: true`).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | `'install' \| 'uninstall' \| 'update' \| 'audit' \| 'outdated'` | Yes | Action to perform |
| `package_name` | `string` | Conditional | Package name (required for install/uninstall) |
| `manager` | `'npm' \| 'pip' \| 'cargo'` | No | Package manager to use (default: `npm`) |

**Returns**: `{ success: true, data: { stdout, stderr } }` or error if action fails.

> ⚠️ **Security Gate**: Install/uninstall actions require `packageManage: true` in plugin config.
> ⏱️ **Timeout**: 60-second timeout for package operations.
> 🐍 **pip Limitations**: No audit support (use pip-audit or safety). No uninstall via this tool (delete manually).
> 🦀 **Cargo Limitations**: Audit requires separate `cargo-audit` installation.

---

### `get_current_working_directory`

Get the current working directory. Use this before generating file operations with relative paths to ensure you know where files will be created/modified.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { current_working_directory: string } }`


---

## 🌍 Browser Automation Tools (5)

### `browser_open_page`

Open a webpage in a headless browser (Puppeteer), render it once, and return content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The URL to open |
| `screenshot_path` | `string` | No | Path to save a screenshot |
| `wait_for_selector` | `string` | No | CSS selector to wait for before returning |
| `full_page_screenshot` | `boolean` | No | If true, captures the full page when taking a screenshot (default: false) |

**Returns**: `{ success: true, data: { url, opened: true, screenshotSaved?, pageText } }`

> 💡 **Session Management**: Uses persistent browser session via `browser_session_control`. Page stays alive for subsequent requests. Use `browser_session_close` to explicitly terminate the browser.
> ⏱️ **Timeout**: 5-second timeout for selector waiting. Continues extraction if selector not found.

---

### `browser_session_control`

Control the active persistent browser session. Supports actions, page reading, screenshot capture.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actions` | `Array<{type, ...}>` | No | Optional scripted browser actions to execute (click, type, goto, evaluate) |
| `read_page` | `boolean` | No | If true, returns page metadata (default: false) |
| `full_read` | `boolean` | No | If true, forces full page text output (default: false) |
| `screenshot_path` | `string` | No | Optional screenshot output path |

**Returns**: `{ success: true, data: { actionsExecuted, pageText?, screenshotSaved? } }`

> 🎭 **Supported Actions**:
> - `click`: Click a selector (`{type: 'click', selector: '#btn'}`)
> - `type`: Type text into an input (`{type: 'type', selector: '#input', text: 'hello'}`)
> - `goto`: Navigate to URL (`{type: 'goto', url: 'https://...'}`)
> - `evaluate`: Execute JavaScript (`{type: 'evaluate', script: 'document.body.innerText'}`)

---

### `browser_session_close`

Close the active persistent browser session. Releases resources and terminates Puppeteer browser instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { closed: true } }`

> 🧹 **Cleanup**: Cancels inactivity timer and closes all browser pages. Browser stays alive for up to 5 minutes of inactivity after last use if not explicitly closed.

---

### `preview_html`

Render and preview HTML content in the system's default browser.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | The HTML content to render |
| `file_name` | `string` | No | Optional filename (default: `preview.html`) |

**Returns**: `{ success: true, data: { previewed: true, file } }`

> 🌐 **Browser Launch**: Uses the `open` package to launch default browser. File is saved to current working directory before opening.

---

### `open_file`

Open a file or URL in the system's default application.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target` | `string` | Yes | File path or URL |

**Returns**: `{ success: true, data: { opened: true } }`

---

## 🧠 Context Management Tools (7)

### `auto_summarize_context` — Analyze session and save important context

Automatically analyze recent session activity to identify patterns, frequent tool usage, configuration changes, and decisions worth remembering. Saves findings to persistent memory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_events` | `Array<{type, timestamp, data}>` | No | Recent session events to analyze |
| `config_changes` | `Record<string, boolean\|string>` | No | Configuration changes made during session |

**Returns**: `{ success: true, data: { saved_count: number, summary: string } }`

> 💡 **Auto-Detection**: Identifies frequent tool usage (>3 uses), configuration changes, and decision events. Generates summary entries with tags for categorization.
> 📊 **Entry Types**: `pattern`, `configuration`, `decision`, `summary`. Limited to 1000 entries max in storage.

---

### `get_context_memory` — Retrieve auto-saved context entries

Retrieve your persistent memory entries from past sessions. Access recorded decisions, patterns, configurations, and events.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | `number` | No | Maximum number of entries to return (default: 20, max: 50) |
| `type` | `'decision' \| 'pattern' \| 'configuration' \| 'file_change' \| 'error' \| 'summary'` | No | Filter by entry type |

**Returns**: `{ success: true, data: { entries: Array<ContextEntry> } }`

---

### `search_context` — Search auto-saved context by query

Search through your persistent memory for past decisions, patterns, configurations, and events.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query to match against context entries (matches title, content, tags) |
| `max_results` | `number` | No | Maximum number of results to return (default: 10, max: 50) |

**Returns**: `{ success: true, data: { results: Array<ContextEntry> } }`

---

### `context_summary` — Get summary statistics

Get a statistical overview of your persistent memory: total entries, breakdown by type (decisions, patterns, configurations), and recent activity.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { total_entries, entries_by_type, recent_entries, last_updated } }`

---

### `delete_context_entry` — Remove a specific context entry by ID

Delete a specific auto-saved context entry by its unique ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entry_id` | `string` | Yes | The unique ID of the context entry to delete (format: `ctx_{timestamp}_{random}`) |

**Returns**: `{ success: true, data: { deleted: true, entry_id } }` or error if not found.

---

### `clear_context_memory` — Clear all auto-saved context entries

Clear all automatically saved context entries from persistent memory. This action cannot be undone.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirm` | `boolean` | Yes | Set to true to confirm deletion of all context entries |

**Returns**: `{ success: true, data: { cleared: true } }` or error if confirmation is false.

> ⚠️ **Destructive**: All entries are permanently deleted. No undo available.

---

### `track_important_event` — Manually mark an event as important

Manually record an important event, decision, or milestone to persistent memory across sessions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Title of the important event |
| `content` | `string` | Yes | Detailed description of the event |
| `tags` | `Array<string>` | No | Tags to categorize the event |

**Returns**: `{ success: true, data: { tracked: true, entry_id } }`

> 💡 **Use Cases**: After significant architectural decisions, completing major milestones, or when user explicitly asks you to "remember" something.

---

## ⚡ Execution Tools (5)

### `run_javascript` — SANDBOXED JavaScript execution

Run JavaScript code snippet using Node.js (sandboxed). No external module imports allowed. Standard library only.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `javascript` | `string` | Yes | The JavaScript code to execute |
| `timeout_seconds` | `number` | No | Timeout in seconds (max 60, default: 5) |

**Returns**: `{ success: true, data: { output } }` or error if execution fails.

> 🛡️ **Security Patterns Blocked**: eval(), exec(), Function constructor, __proto__, require.resolve, child_process, os.system, net.*, http., dns.
> 🔍 **Cross-Platform**: Tries `npx`, `node`, then shell-based detection for Node.js executable.

---

### `run_python` — SANDBOXED Python execution

Run Python code snippet (sandboxed, no external modules). Standard library only.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `python` | `string` | Yes | The Python code to execute |
| `timeout_seconds` | `number` | No | Timeout in seconds (max 60, default: 5) |

**Returns**: `{ success: true, data: { output } }` or error if execution fails.

> 🛡️ **Security Patterns Blocked**: import os, from os import, import subprocess, __import__, eval(), exec(), os.system, os.popen.
> 🔍 **Cross-Platform**: Tries `py`, `python3`, `python`, then shell-based detection for Python executable.

---

### `execute_command` — SAFE command execution with shell features

Execute a command in the current working directory. Supports full shell features (pipes, redirects, env vars).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | The shell command to execute |
| `timeout_seconds` | `number` | No | Timeout in seconds (max 300, default: 60) |
| `input` | `string` | No | Input text to pipe to the command's stdin |

**Returns**: `{ success: true, data: { stdout, stderr, output } }` or error if execution fails.

> 🛡️ **Security**: Uses `sanitizeCommand()` to block dangerous patterns before shell interpretation. Shell mode enabled for pipes/redirects but sanitized.
> ⏱️ **Timeout**: 300-second max timeout for long-running commands.

---

### `run_in_terminal` — Launch in new interactive terminal window

Launch a command in a new, separate interactive terminal window (non-blocking).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | The shell command to execute |

**Returns**: `{ success: true, data: { launched: true } }` or error if no suitable terminal found.

> 🖥️ **Cross-Platform**: Windows uses `cmd.exe /k`. Linux tries xterm, gnome-terminal, konsole, xfce4-terminal in order.
> ⚠️ **Non-blocking**: Command runs in separate window; tool returns immediately after launch.

---

### `run_tests` — Execute test suites (Jest, PyTest, Go test)

Execute a test suite using Jest, PyTest, or Go test. Runs in the current working directory with timeout protection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `runner` | `'jest' \| 'pytest' \| 'go-test'` | Yes | Test framework to use |
| `file_or_dir` | `string` | No | Specific file or directory path to run tests against (optional) |
| `timeout_seconds` | `number` | No | Timeout in seconds for test execution (default: 60, max: 300) |

**Returns**: `{ success: true, data: { runner, summary: {totalTests, passed, failed, allPassed}, output } }` or error.

> 📊 **Result Parsing**: Automatically extracts pass/fail counts from Jest, PyTest, and Go test output formats.
> ⚠️ **Prerequisites**: Jest requires jest.config.* or package.json scripts. PyTest requires `pip install pytest`. Go-test requires go.mod.

---

## 🔧 Git & GitHub Tools (14)

### `git_status` — Get current git status

Get the current git status of the repository using simple-git.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { ...gitStatusResult } }` or error if not in a git repository.

---

### `git_diff` — Get repository diff

Get the git diff of the current repository or specific files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | `string` | No | Optional: Path to specific file to diff |
| `cached` | `boolean` | No | Optional: Show staged changes only (git diff --cached, default: false) |

**Returns**: `{ success: true, data: { diff } }` or error.

---

### `git_commit` — Commit staged changes

Commit staged changes to the git repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | `string` | Yes | The commit message |

**Returns**: `{ success: true, data: { committed: true } }` or error.

---

### `git_log` — Get recent git commit history

Get recent git commit history from the repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `max_count` | `number` | No | Max number of commits to return (default: 10) |

**Returns**: `{ success: true, data: { commits } }` or error.

---

### `git_add` — Stage files for commit

Stage specific files or all changes for the next commit.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `Array<string>` | No | Optional: Specific file paths to stage. If omitted, stages all changes (`.`) |

**Returns**: `{ success: true, data: { stagedPaths } }` or error.

---

### `git_checkout` — Switch branches

Switch to an existing branch or create and switch to a new one (like `git checkout -b`).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_name` | `string` | Yes | Name of the branch to checkout |
| `create_new` | `boolean` | No | If true, creates the branch if it doesn't exist (default: false) |

**Returns**: `{ success: true, data: { branchName } }` or error.

---

### `gh_auth` — Check GitHub authentication status

Check GitHub authentication status. Requires `GITHUB_TOKEN` environment variable to be set.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { authenticated: true } }` or error if token not set or authentication fails.

---

### `gh_create_issue` — Create a new GitHub issue

Create a new GitHub issue in the current repository. Requires `GITHUB_TOKEN` and valid git remote pointing to GitHub.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | The issue title |
| `body` | `string` | No | The issue body/description |
| `labels` | `Array<string>` | No | Labels to apply |

**Returns**: `{ success: true, data: { created: true } }` or error.

---

### `gh_list_issues` — List repository issues

List issues in the current repository with optional filtering by state and labels.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | `'open' \| 'closed'` | No | Filter by issue state (default: `open`) |
| `labels` | `Array<string>` | No | Filter by labels |
| `limit` | `number` | No | Max issues to return (default: 10, max: 50) |

**Returns**: `{ success: true, data: { issues } }` or error.

---

### `gh_view_comments` — View issue/PR comments

View comments on a specific issue or pull request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | `number` | Yes | The issue or PR number |
| `type` | `'issue' \| 'pr'` | No | Whether it's an issue or a pull request (default: `issue`) |

**Returns**: `{ success: true, data: { comments } }` or error.

---

### `gh_create_pr` — Create a new pull request

Create a new pull request in the current repository. Requires `GITHUB_TOKEN` and valid git remote pointing to GitHub.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | The PR title |
| `body` | `string` | No | The PR body/description |
| `head_branch` | `string` | Yes | The branch containing your changes |
| `base_branch` | `string` | No | The branch you want to merge into (default: `main`) |

**Returns**: `{ success: true, data: { created: true, url } }` or error.

---

### `gh_list_prs` — List pull requests

List pull requests in the current repository with optional filtering by state.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | `'open' \| 'closed'` | No | Filter by PR state (default: `open`) |
| `limit` | `number` | No | Max PRs to return (default: 10, max: 50) |

**Returns**: `{ success: true, data: { prs } }` or error.

---

### `gh_view_pr_diff` — Fetch pull request diff

Fetch the diff/patch of a specific pull request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | `number` | Yes | The PR number |

**Returns**: `{ success: true, data: { diff } }` or error.

---

### `gh_push` — Push to remote repository

Push local commits to the remote GitHub repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch` | `string` | No | Optional: The branch to push. Defaults to current branch |

**Returns**: `{ success: true, data: { pushed: true } }` or error.

---

## 🌐 HTTP Client Tools (3)

### `http_request` — Generic HTTP client

Make generic HTTP requests to any REST API. Supports GET, POST, PUT, DELETE, PATCH and other methods. Includes SSRF protection (blocks private/internal IP addresses).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'PATCH' \| 'HEAD' \| 'OPTIONS'` | Yes | HTTP method |
| `url` | `string` | Yes | Request URL (must be http:// or https://) |
| `headers` | `Record<string, string>` | No | Custom headers as key-value pairs |
| `body` | `string \| Record<string, unknown>` | No | Request body (string or JSON object) |

**Returns**: `{ success: true, data: { status, statusText, headers, body, url, method } }` or error.

> 🛡️ **SSRF Protection**: Blocks file:, data: protocols and private IP ranges (127.x, 10.x, 172.16-31.x, 192.168.x).
> ⏱️ **Timeout**: 30-second timeout for all requests.

---

### `http_get_json` — GET request with JSON parsing

Make a GET request and return parsed JSON response. Convenience wrapper around http_request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Request URL (must be http:// or https://) |
| `headers` | `Record<string, string>` | No | Custom headers as key-value pairs |

**Returns**: `{ success: true, data: { status, headers, body, url } }` or error.

> 🛡️ **SSRF Protection**: Same URL validation as http_request (blocks private IPs).
> ⏱️ **Timeout**: 30-second timeout. Automatically sets `Accept: application/json`.

---

### `http_post_json` — POST request with JSON body

Make a POST request with JSON body and return parsed response. Convenience wrapper around http_request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Request URL (must be http:// or https://) |
| `data` | `Record<string, unknown>` | Yes | JSON object to send as request body |
| `headers` | `Record<string, string>` | No | Custom headers as key-value pairs |

**Returns**: `{ success: true, data: { status, headers, body, url } }` or error.

> 🛡️ **SSRF Protection**: Same URL validation as http_request (blocks private IPs).
> ⏱️ **Timeout**: 30-second timeout. Automatically sets `Content-Type: application/json` and `Accept: application/json`.


---

## 🎨 UI Generation Tools (3)

### `generate_ui_component` — Generate interactive UI components

Generate HTML/CSS/JS code for an interactive UI component (button, form, chart, dashboard). Returns the generated code.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `component_type` | `'button' \| 'form' \| 'chart' \| 'dashboard'` | Yes | Type of UI component to generate |
| `label` | `string` | Conditional | Label text for buttons or forms (required for button/form components) |
| `fields` | `Array<{name, type, label}>` | Conditional | Form fields with name, type (text/email/password/number/textarea/select), and label (required for form component) |
| `chart_data` | `Array<{label, value}>` | Conditional | Chart data points (required for chart component) |
| `dashboard_titles` | `Array<string>` | Conditional | Titles for dashboard cards (required for dashboard component) |

**Returns**: `{ success: true, data: { component_type, html } }` or error if validation fails.

> 📦 **Component Types**:
> - **Button**: Generates styled button with label and color (#007bff default)
> - **Form**: Generates form with specified fields, submit button, and result display area
> - **Chart**: Generates simple bar chart from data points (auto-scales heights)
> - **Dashboard**: Generates multi-card dashboard with alternating text/chart cards

---

### `render_and_preview_ui` — Render UI in browser + screenshot

Render a generated HTML UI component, save it to a file, open it in the default browser, and optionally take a screenshot.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | The complete HTML content to render |
| `filename` | `string` | No | Filename for saving (default: `ui_preview.html`) |
| `screenshot_path` | `string` | No | Optional path to save a screenshot of the rendered UI |

**Returns**: `{ success: true, data: { rendered: true, file, path, screenshotSaved?, screenshotWarning? } }` or error.

> 🖼️ **Screenshot Feature**: Uses Puppeteer in headless mode to capture full-page screenshots. Falls back gracefully if Puppeteer is unavailable (warning included in response).
> 🔗 **Cross-Platform File URLs**: Uses `pathToFileURL()` for Windows compatibility with file:// URLs.

---

### `extract_ui_data` — Extract structured data from HTML

Extract structured data from HTML content (tables, forms, lists). Useful for parsing generated or fetched UIs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | The HTML content to extract data from |
| `extraction_type` | `'table' \| 'form' \| 'list'` | No | Type of data to extract (default: `table`) |

**Returns**: `{ success: true, data: { tables?: string[][][], formFields?: Array<{name, type}>, items?: string[] } }` or error.

> 🔍 **Extraction Logic**:
> - **Tables**: Extracts all `<table>` → `<tr>` → `<td>/<th>` structures into nested arrays
> - **Forms**: Extracts `<form>` → `<input>/<select>/<textarea>` with name and type attributes
> - **Lists**: Extracts `<ul>/<ol>` → `<li>` items (text content only)


---

## 💾 Backup Tools (4)

### `create_backup` — Compress entire working directory

Create a compressed backup of the ENTIRE current working directory with all content. Backups are stored in `.ai_toolbox_backups/`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `destination` | `string` | No | Custom backup filename (default: auto-generated with timestamp). Must end with .zip |

**Returns**: `{ success: true, data: { message, backupPath, filename, filesBackedUp, compressedSizeBytes, compressedSizeHuman, createdAt } }` or error.

> 📦 **Compression**: Uses ZIP with maximum compression (zlib level 9). Includes all files and folders from working directory.
> 📄 **Metadata**: Auto-generates `_backup-metadata.json` with version, creation timestamp, source directory, file count, and total uncompressed size.
> ⚠️ **Excludes**: Backup directory itself is included in backup (may cause circular references; archiver handles this gracefully).

---

### `list_backups` — List available backups

List all available backup files in the current working directory's `.ai_toolbox_backups/` folder.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sortBy` | `'date' \| 'size'` | No | Sort order: `"date"` (newest first) or `"size"` (largest first, default: `date`) |
| `limit` | `number` | No | Maximum number of backups to return (default: 50, max: 1000) |

**Returns**: `{ success: true, data: { backups: Array<{filename, path, sizeBytes, createdAt}>, totalCount, returnedCount } }` or empty array if no backups exist.

---

### `restore_backup` — Restore from backup archive (⚠️ Destructive)

Restore the working directory from a backup archive. **This will OVERWRITE ALL FILES in the current working directory!**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `backupFile` | `string` | Yes | Backup filename to restore (e.g., `"project-backup-2024-06-12T21-59-00.zip"`) |
| `confirm` | `boolean` | Yes | ⚠️ MUST be true to confirm restoration. This is a safety check against accidental data loss. |

**Returns**: `{ success: true, data: { message, backupFile, restoredFilesCount, timestamp } }` or error if confirmation is false or file not found.

> ⚠️ **WARNING**: All existing files in the working directory will be overwritten or deleted if not present in the backup.
> 🛡️ **Safety Features**: Requires explicit `confirm=true`. Uses temporary extraction directory to validate archive before restoration. Cleans up temp directory after restore.

---

### `delete_backup` — Delete a backup file (⚠️ Destructive)

Delete a backup file from the `.ai_toolbox_backups/` folder. **This action is IRREVERSIBLE!**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `backupFile` | `string` | Yes | Backup filename to delete (e.g., `"project-backup-2024-06-12T21-59-00.zip"`) |
| `confirm` | `boolean` | Yes | ⚠️ MUST be true to confirm deletion. This is a safety check against accidental data loss. |

**Returns**: `{ success: true, data: { message, deletedFile, timestamp } }` or error if confirmation is false or file not found.

> ⚠️ **WARNING**: Backup file is permanently deleted. No undo available.
> 🔒 **Safety**: Only allows deletion of `.zip` files from the backup directory. Requires explicit `confirm=true`.


---

## ⚙️ Background Commands Tools (3)

### `run_background_command` — Start long-running process in background

Start a long-running process in the background. The process is not blocked and runs independently.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | The shell command to execute (must pass sanitization) |
| `timeout_hours` | `number` | Yes | MANDATORY: How long the process is allowed to run before being killed (0.1–10 hours) |
| `name` | `string` | Yes | MANDATORY: A short, descriptive name for the background task |

**Returns**: `{ success: true, data: { id, name, command, timeoutHours } }` or error if command is unsafe or registration fails.

> 🛡️ **Security**: Uses `sanitizeCommand()` to block dangerous patterns before execution.
> ⏱️ **Auto-Termination**: Process is automatically killed after `timeout_hours` expires. Use `check_background_command` to monitor status.

---

### `check_background_command` — Check background command status

Check the status, stdout, and stderr of a running or completed background command.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | The command identifier (returned by `run_background_command`) |

**Returns**: `{ success: true, data: { id, name, status, stdout?, stderr?, startTime?, endTime? } }` or error if command not found.

> 📊 **Status Values**: `"running"`, `"completed"`, `"failed"`, `"killed"` (timeout).
> 🔍 **Output Access**: Captures stdout/stderr from background process. Available after completion.

---

### `cancel_background_command` — Kill a running background command

Kill a running background command immediately.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | The command identifier (returned by `run_background_command`) |

**Returns**: `{ success: true, data: { id, cancelled: true } }` or error if command not found or already stopped.


---

## 🖥️ System Awareness Tools (1)

### `detect_os_environment` — Explicit OS & Shell Detection

Explicitly detects and reports the current operating system environment with detailed capabilities. Use this at the start of any session or before executing shell commands to ensure correct syntax (e.g., PowerShell vs Bash, Windows paths vs POSIX).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters required |

**Returns**: `{ success: true, data: { osPlatform, osArch, osRelease, hostname, shellType, defaultTerminal, pathSeparator, envVarSyntax, recommendedCommands, warning } }`

> 💡 **RECOMMENDED USAGE:**
> • Call immediately when starting a new task that involves file paths, shell commands, or environment variables
> • Use whenever switching contexts between different machines or environments
> • Reference the `"Recommended Command Syntax"` section before generating any terminal commands
> 🛡️ **Prevents Cross-Platform Errors**: Automatically detects Windows vs POSIX environments and outputs explicit warnings + syntax recommendations to avoid command mismatches (e.g., `rm` on Windows, path separators, env var syntax).

