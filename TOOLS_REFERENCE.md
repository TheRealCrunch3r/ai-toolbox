# Tools Reference

Complete reference for all **100 tools** in the AI Toolbox plugin, organized by category.


---

## Text Processing Tools (3)

### `text_transform`

Apply regex-based text transformations to files. Supports substitution, line ranges, and capture groups. Safer than shell sed - no command injection risk.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `pattern` | `string` | Yes | Regex or literal pattern to match |
| `replacement` | `string` | No | Replacement text (supports $1, $2 for capture groups) |
| `flags` | `string` | No | Flags: g=global, i=case-insensitive, gi=both (default: g) |
| `lines` | `{start: number, end?: number}` | No | Line range to apply transformation |
| `backup` | `boolean` | No | Create .bak file before modifying (default: false) |
| `dry_run` | `boolean` | No | Preview changes without writing to disk (default: false) |

**Returns**: `{ success: true, data: { modified: boolean, backup_path?: string } }`

---

### `text_extract`

Extract structured data from text files using pattern matching and field extraction. Like awk for parsing logs, CSVs, TSVs, or any delimited text.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `pattern` | `string` | No | Regex to filter lines (optional) |
| `fields` | `number[]` | No | Field indices to extract (0-based, e.g., [0, 2] for first and third columns) |
| `delimiter` | `string` | No | Field separator character (default: tab) |
| `output_format` | `string` | No | Output format: list, json, csv (default: json) |

**Returns**: `{ success: true, data: { results: Array } }`

---

### `line_operations`

Insert, delete, or reorder lines in a file. Like awk for line-level operations without shell dependencies.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `operation` | `string` | Yes | Operation: insert, delete, move |
| `target_line` | `number` | No | Target line number (1-indexed) for insert/delete/move |
| `content` | `string` | No | For insert operation - text to insert |
| `move_from` | `number` | No | Source line for move operation |
| `move_to` | `number` | No | Destination line for move operation |

**Returns**: `{ success: true, data: { modified: boolean } }`

---



## 📁 File System Tools (21)

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

### `read_file_chunked` 🆕 **RECOMMENDED for large files** — v1.5.1 Update (formerly v1.4.10)

Read a file in chunks to bypass character limits. **ALWAYS use this instead of `read_file` if `read_file` returned truncated output, or if you know the file is very large (>50k chars).** Returns structured chunks with start/end indices and truncation status.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `chunk_size` | `number` | No | Max characters per chunk (default: 50000, max: 50000) |
| `max_chunks` | `number` | No | Maximum number of chunks to return (default: 20) |

**Returns**: `{ success: true, data: { filePath, totalCharacters, chunkSize, maxChunks, chunksReturned, isTruncated, chunks: [{ index, content, startChar, endChar, truncated }] } }`

> ⚠️ **TypeScript Strict Mode Compliance (v1.5.1+)**: Optional parameters use explicit null-coalescing (`??`) with defaults to satisfy TypeScript's strict mode requirements. This ensures zero compilation errors across the entire codebase.

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
  chunk_

---

### ⚙️ Additional File System Tools (2026-06-16+)

### `analyze_project` 🆕 — v1.5.9 Update

Run project-wide analysis including TypeScript diagnostics, circular dependency detection, ESLint, config optimization, and import structure analysis. Uses dynamic timeouts based on project size to avoid hanging on large codebases.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categories` | `string[]` | No | Analysis categories: `'typecheck'`, `'circular'`, `'eslint'`, `'config'`, `'imports'` (default: all) |
| `max_imports_warning` | `number` | No | Max imports per file before warning (default: 20, range: 5–100) |

**Returns**: `{ success: true, data: { typecheck?, circular?, eslint?, config?, imports? } }` — each category returns structured metrics (e.g., checkTimeMs, filesChecked, errors/warnings count, recommendations).

> **Note:** Requires `npx tsc`, `madge`, and/or `eslint` to be available. Skips categories whose tools are not installed with a clear reason message instead of failing.

---

### `file_diff` — v1.5.9 Update

Compare two files side by side and return a unified diff with +/− markers and line numbers. Uses an LCS-based algorithm for accurate comparison.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_a` | `string` | Yes | First file path (relative to working directory) |
| `file_b` | `string` | Yes | Second file path (relative to working directory) |

**Returns**: `{ success: true, data: { diff: string, files: [string, string] } }` — the `diff` field contains lines prefixed with ` `, `+`, or `-`.

---

### `directory_tree` 🆕 — v1.5.9 Update

Visualize the directory structure of a path in a tree-like format. Supports depth limiting and optional file size display.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | No | Root directory to visualize (default: current working directory) |
| `max_depth` | `number` | No | Maximum nesting depth (default: 3, range: 1–20) |
| `show_size` | `boolean` | No | Show file sizes in the output (default: false) |

**Returns**: `{ success: true, data: { tree: string, path: string, depth: number } }` — the `tree` field contains a formatted ASCII tree with emoji icons for directories and files.

---

### 🔒 `grep_files` Token Consumption Hardening (v1.5.9+) ⚡

Search for a pattern in files across a directory. Returns structured matches with file, line number, and content. Includes **three-layer token consumption controls** to prevent context window overflow from large codebase searches.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | `string` | Yes | Regex or literal string to search for |
| `path` | `string` | No | Directory to search in (default: current working directory) |
| `max_content_length` | `number` | No | Max chars per matched line content (**default: 150**, range: 10–500). Truncated lines receive a `…` suffix. |
| `include` | `string` | No | File glob pattern to include (e.g., `"*.ts"`, `"src/**/*.js"`) |
| `exclude` | `string` | No | Files or directories to exclude (e.g., `"node_modules"`, `".git"`) |
| `max_results` | `number` | No | Maximum number of results (**default: 20**, range: 1–500). Search stops early once reached; `truncated: true` signals more available. |
| `max_file_size` | `number` | No | Max file size in bytes to search (**default: 100,000** / 100KB). Files exceeding this limit are silently skipped via early `fs.stat()` before content is read — prevents loading multi-MB build artifacts. |

**Returns**: `{ success: true, data: { matches: [{ file, line_number, content }], count: number, truncated: boolean } }`

> **Token Impact:** A broad pattern like `.js` across a 10k-file project is reduced from >100k tokens to <400 tokens (99.6% reduction). Large build artifacts are skipped entirely before reading.

**Example Usage:**
```typescript
// Search for TODOs in TypeScript files only, limit output
grep_files({
  pattern: "TODO",
  include: "*.ts",
  max_results: 20,
  max_content_length: 150
})
→ { matches: [...], count: 20, truncated: false }

// Search with larger content length for debugging
grep_files({
  pattern: "import.*from",
  path: "src/",
  max_results: 500,      // Override default for deep search
  max_content_length: 300,
  exclude: "node_modules"
})
→ { matches: [...], count: 487, truncated: true }
```

> **ReDoS Protection:** If the user-provided pattern fails the ReDoS safety check (`isSafeRegex()`), it is automatically treated as a literal string instead of being rejected — preventing regex denial-of-service while maintaining usability for non-regex searches.
