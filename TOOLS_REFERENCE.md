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
