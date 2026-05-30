# Tools Reference

Complete reference for all 80+ tools in the AI Toolbox plugin, organized by category.

---

## 📁 File System Tools (17)

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

---

### `save_file`

Save content to a file. Supports batch saving.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | No* | File path |
| `content` | `string` | No* | Content to write |
| `files` | `Array<{file_name, content}>` | No* | Batch save array |

\* Either `file_name`+`content` or `files` required.

**Returns**: `{ success: true, data: { savedFile, path } }` or `{ savedFiles, results }`

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

Fetch webpage and extract content relevant to a query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Webpage URL |
| `query` | `string` | Yes | Query for relevance matching |

**Returns**: `{ success: true, data: { url, query, chunks: string[] } }`

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

## 🐙 Git & GitHub Tools (14)

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

## ⚡ Execution Tools (4)

### ⚠️ `run_javascript`

⚠️ **DANGEROUS** — Execute JavaScript code (sandboxed). **Disabled by default.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `javascript` | `string` | Yes | JavaScript code |
| `timeout_seconds` | `number` | No | Timeout (default: 5, max: 60) |

**Returns**: `{ success: true, data: { output } }`

**Blocked**: `require()`, `eval()`, `fs`, `child_process`, `Function()`, dynamic imports.

---

### ⚠️ `run_python`

⚠️ **DANGEROUS** — Execute Python code (sandboxed). **Disabled by default.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `python` | `string` | Yes | Python code |
| `timeout_seconds` | `number` | No | Timeout (default: 5, max: 60) |

**Returns**: `{ success: true, data: { output } }`

**Blocked**: `os`, `subprocess`, `shutil`, `__import__()`, `eval()`, `exec()`.

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

## 🔧 Utility Tools (7)

### `save_memory`

Save information to persistent memory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fact` | `string` | Yes | Information to remember |

**Returns**: `{ success: true, data: { saved: true } }`

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

List currently enabled tools.

**Returns**: `{ success: true, data: { toolCount, tools: string[] } }`

---

## 🖼️ Image Processing Tools (4)

### `image_to_text`

Extract text from images using OCR (Tesseract.js).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imagePath` | `string` | Yes | Path to image file |
| `language` | `string` | No | Language code (default: `eng`) |

**Returns**: `{ success: true, data: { text, confidence, language, words } }`

**Supported Formats**: PNG, JPG, JPEG, BMP, GIF, TIFF, WebP. Max 50MB.

---

### `describe_image`

Get image metadata.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imagePath` | `string` | Yes | Path to image file |

**Returns**: `{ success: true, data: { path, size, format, note } }`

---

### `screenshot_desktop`

Capture desktop screenshot.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `outputPath` | `string` | No | Output file path |
| `format` | `string` | No | `png` or `jpeg` (default: `png`) |
| `quality` | `number` | No | JPEG quality 1-100 (default: 90) |

**Returns**: `{ success: true, data: { path, size, format } }`

---

### `compare_images`

Compare two images pixel-by-pixel.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image1Path` | `string` | Yes | First image path |
| `image2Path` | `string` | Yes | Second image path |

**Returns**: `{ success: true, data: { dimensions, similarityPercent, differentPixels, totalPixels, isIdentical } }`

---

## 🔌 HTTP Client Tools (3)

### `http_request`

Generic HTTP client for any REST API.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | `string` | Yes | `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS` |
| `url` | `string` | Yes | Request URL (http/https only) |
| `headers` | `object` | No | Custom headers |
| `body` | `string` or `object` | No | Request body |

**Returns**: `{ success: true, data: { status, statusText, headers, body, url, method } }`

**Blocked**: Private IPs, localhost, `file:`, `data:` protocols.

---

### `http_get_json`

GET request with JSON parsing.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Request URL |
| `headers` | `object` | No | Custom headers |

**Returns**: `{ success: true, data: { status, headers, body, url } }`

---

### `http_post_json`

POST request with JSON body.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Request URL |
| `data` | `object` | Yes | JSON body |
| `headers` | `object` | No | Custom headers |

**Returns**: `{ success: true, data: { status, headers, body, url } }`

---

## 📊 Vector RAG Tools (3)

### `rag_index_files`

Index files for semantic search.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `directoryPath` | `string` | Yes | Directory to index |
| `filePattern` | `string` | No | File pattern (default: `*.{ts,js,tsx,jsx,md,json,yaml,yml,toml,txt}`) |
| `batchSize` | `number` | No | Batch size (default: 10) |

**Returns**: `{ success: true, data: { indexedChunks, filesProcessed, skippedFiles, totalDocuments } }`

---

### `rag_query_vector`

Query the vector index.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query |
| `topK` | `number` | No | Results count (default: 5, max: 20) |

**Returns**: `{ success: true, data: { query, topK, results: [{id, text, score, metadata}] } }`

---

### `rag_clear_index`

Clear the vector index.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirm` | `boolean` | Yes | Must be `true` |

**Returns**: `{ success: true, data: { message } }`

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

### `render_and_preview_ui`

Render generated HTML in the system browser and optionally capture a screenshot using Puppeteer.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | Complete HTML content to render |
| `filename` | `string` | No | Output filename (default: `"ui_preview.html"`) |
| `screenshot_path` | `string` | No | Optional path to save screenshot |

**Returns**: `{ success: true, data: { rendered: true, file, path, screenshotSaved? } }` or `{ success: false, error }`

**Example**:
```json
{
  "html_content": "<!DOCTYPE html><html>...</html>",
  "filename": "my_component.html",
  "screenshot_path": "./screenshots/component.png"
}
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
