# Tools Reference

Complete reference for all **101 tools** in the AI Toolbox plugin, organized by category.

---

## Text Processing Tools (3)

### `text_transform`

Apply regex-based text transformations to files. Supports substitution, line ranges, and capture groups. Safer than shell sed — no command injection risk.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `pattern` | `string` | Yes | Regex or literal pattern to match |
| `replacement` | `string` | No | Replacement text (supports $1, $2 for capture groups) |
| `flags` | `string` | No | Flags: g=global, i=case-insensitive, gi=both (default: g) |
| `lines` | `{start: number, end?: number}` | No | Line range to apply transformation |
| `backup` | `boolean` | No | Create .bak file before modifying (default: false) |
| `dry_run` | `boolean` | No | Preview changes without writing to disk (default: false) |

**Returns**: `{ success: true, data: { transformed: boolean, total_changes_applied: number, backup_created: boolean } }`

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

**Returns**: `{ success: true, data: { total_lines_read: number, lines_matched: number, extracted_count: number, output_format: string } }`

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

**Returns**: `{ success: true, data: { operations_performed: string, changes_applied: number } }`

---

## File System Tools (21)

### `list_directory`

List files and directories in the current working directory or a specified subdirectory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | No | Directory path (default: current working directory) |

**Returns**: `{ success: true, data: { name: string, isDirectory: boolean, isFile: boolean }[] }`

---

### `read_file`

Read content from a file in the current working directory. Automatically chunks large files to return all content without truncation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | The name of the file to read |
| `max_length` | `number` | No | Max characters (default: 5000, max: 50000) |

**Returns**: `{ success: true, data: { content: string, filePath: string } }` or structured chunks for large files.

> ⚠️ **IMPORTANT:** If `read_file` returns truncated output (content cut off), you **MUST** retry with [`read_file_chunked`](#read_file_chunked) to get the full content. Do not keep calling `read_file` with larger `max_length` values — it will still truncate.

---

### `read_file_chunked` 🆕 **RECOMMENDED for large files**

Read a file in chunks to bypass character limits. **ALWAYS use this instead of `read_file` if read_file returned truncated output, or if you know the file is very large (>50k chars).** Returns structured chunks with start/end indices and truncation status.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | File path |
| `chunk_size` | `number` | No | Max characters per chunk (default: 50000, max: 50000) |
| `max_chunks` | `number` | No | Maximum number of chunks to return (default: 20) |

**Returns**: `{ success: true, data: { filePath: string, totalCharacters: number, chunksReturned: number, isTruncated: boolean, chunks: [{ index: number, content: string, startChar: number, endChar: number, truncated: boolean }] } }`

---

### `save_file`

Save content to a specified file in the current working directory. Supports batch saving with atomic writes and size limits.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | No | The name of the file to save |
| `content` | `string` | No | Content to write (max 10MB) |
| `files` | `Array<{file_name: string, content: string}>` | No | For batch saving multiple files |

**Returns**: `{ success: true, data: { savedFile: string } }` or `{ success: true, data: { savedFiles: number } }` for batch mode.

---

### `replace_text_in_file`

Replace a specific string in a file with a new string.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | The file to modify |
| `old_string` | `string` | Yes | The exact text to replace (must be unique) |
| `new_string` | `string` | Yes | The text to insert in place of old_string |

**Returns**: `{ success: true, data: { replaced: boolean } }`

---

### `insert_at_line`

Insert content at a specific line number in a file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | The file to modify |
| `line_number` | `number` | Yes | Line number to insert at (1-indexed) |
| `content_to_insert` | `string` | No | Text content to insert (use "content" as alias) |

**Returns**: `{ success: true, data: { insertedAt: number } }`

---

### `append_file`

Append content to the end of a file. If the file doesn't exist, it will be created.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | The file to append to |
| `content` | `string` | Yes | Text content to append |

**Returns**: `{ success: true, data: { appendedTo: string } }`

---

### `delete_lines_in_file`

Delete a specific line or range of lines from a file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | `string` | Yes | The file to modify |
| `start_line` | `number` | Yes | Starting line number (1-indexed) |
| `end_line` | `number` | No | Ending line number (inclusive). If omitted, only deletes start_line. |

**Returns**: `{ success: true, data: { deletedLines: string } }`

---

### `make_directory`

Create a new directory in the current working directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `directory_name` | `string` | Yes | The name of the directory to create |

**Returns**: `{ success: true, data: { createdDirectory: string } }`

---

### `move_file`

Move or rename a file or directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | `string` | Yes | Source path |
| `destination` | `string` | Yes | Destination path |

**Returns**: `{ success: true, data: { movedFrom: string, movedTo: string } }`

---

### `copy_file`

Copy a file to a new location.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | `string` | Yes | Source file path |
| `destination` | `string` | Yes | Destination file path |

**Returns**: `{ success: true, data: { copiedFrom: string, copiedTo: string } }`

---

### `delete_path`

Delete a file or directory in the current working directory. Be careful!

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | The path to delete |

**Returns**: `{ success: true, data: { deleted: string } }`

---

### `delete_files_by_pattern`

Delete multiple files in the current directory that match a regex pattern.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | `string` | Yes | Regex pattern to match filenames |

**Returns**: `{ success: true, data: { deletedCount: number, deletedFiles: string[] } }`

---

### `find_files`

Find files recursively in the current directory matching a name pattern. Uses async search for better performance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | `string` | Yes | Substring to match in filename (case-insensitive) |
| `max_depth` | `number` | No | Maximum depth to search (default: 5) |

**Returns**: `{ success: true, data: { foundFiles: string[], count: number } }`

---

### `fuzzy_find_local_files`

Fuzzy find local files by path/name similarity using optimized Levenshtein scoring with caching.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query to match against file names/paths |
| `path` | `string` | No | Sub-directory to search in (default: current directory) |
| `max_results` | `number` | No | Max results to return (default: 5, max: 20) |

**Returns**: `{ success: true, data: { matches: [{ filePath: string, score: number }], count: number } }`

---

### `get_file_metadata`

Get metadata (size, dates) for a specific file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | The file path |

**Returns**: `{ success: true, data: { path: string, size: number, createdAt: Date, modifiedAt: Date } }`

---

### `change_directory`

Change the current working directory. All subsequent file operations will use this directory as the base.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `directory` | `string` | Yes | The absolute path to change to (e.g., "C:\\Projects\\my-app") |

**Returns**: `{ success: true, data: { previous_directory: string, current_directory: string } }`

---

### `analyze_project` 🆕

Run project-wide analysis including TypeScript diagnostics, circular dependency detection, ESLint, config optimization, and import structure analysis. Uses dynamic timeouts based on project size to avoid hanging on large codebases.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categories` | `string[]` | No | Analysis categories: `'typecheck'`, `'circular'`, `'eslint'`, `'config'`, `'imports'` (default: all) |
| `max_imports_warning` | `number` | No | Max imports per file before warning (default: 20, range: 5–100) |

**Returns**: `{ success: true, data: { typecheck?, circular?, eslint?, config?, imports? } }` — each category returns structured metrics.

> **Note:** Requires `npx tsc`, `madge`, and/or `eslint` to be available. Skips categories whose tools are not installed with a clear reason message instead of failing.

---

### `file_diff`

Compare two files side by side and return a unified diff with +/− markers and line numbers. Uses an LCS-based algorithm for accurate comparison.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_a` | `string` | Yes | First file path (relative to working directory) |
| `file_b` | `string` | Yes | Second file path (relative to working directory) |

**Returns**: `{ success: true, data: { diff: string, files: [string, string] } }` — the `diff` field contains lines prefixed with ` `, `+`, or `-`.

---

### `directory_tree` 🆕

Visualize the directory structure of a path in a tree-like format. Supports depth limiting and optional file size display.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | No | Root directory to visualize (default: current working directory) |
| `max_depth` | `number` | No | Maximum nesting depth (default: 3, range: 1–20) |
| `show_size` | `boolean` | No | Show file sizes in the output (default: false) |

**Returns**: `{ success: true, data: { tree: string, path: string, depth: number } }` — the `tree` field contains a formatted ASCII tree with emoji icons for directories and files.

---

### 🔒 `grep_files` Token Consumption Hardening 🆕

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

**Returns**: `{ success: true, data: { matches: [{ file: string, line_number: number, content: string }], count: number, truncated: boolean } }`

> **Token Impact:** A broad pattern like `.js` across a 10k-file project is reduced from >100k tokens to <400 tokens (99.6% reduction). Large build artifacts are skipped entirely before reading.

---

## Web Research Tools (4)

### `web_search` 🔍

Search the web using a configurable search engine with automatic fallback to other engines if the primary one fails. Supports DuckDuckGo API, Google, and Bing.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | The search query |

**Returns**: `{ success: true, data: { query: string, results: [{ title: string, url: string, description: string }], count: number, engine: string } }`

---

### `wikipedia_search`

Search Wikipedia for a given query and return page summaries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | The search query |
| `lang` | `string` | No | Language code (default: "en") |

**Returns**: `{ success: true, data: { query: string, language: string, results: [{ title: string, snippet: string }], count: number } }`

---

### `fetch_web_content`

Fetch the clean, text-based content of a webpage URL. Uses html-to-text for conversion and includes size limits (50KB max).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The URL to fetch |

**Returns**: `{ success: true, data: { url: string, content: string } }`

---

### `rag_web_content` 🆕

Fetch content from a URL and use RAG (Retrieval Augmented Generation) to find and return only the text chunks most relevant to a specific query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The URL to fetch |
| `query` | `string` | Yes | The search query for relevance matching |

**Returns**: `{ success: true, data: { url: string, query: string, chunks: string[] } }`

---

## Browser Automation Tools (5)

### `browser_open_page` 🖥️

Open a webpage in a headless browser (Puppeteer), render it once, and return content. Uses persistent sessions with connection pooling.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The URL to open |
| `screenshot_path` | `string` | No | Path to save a screenshot |
| `wait_for_selector` | `string` | No | CSS selector to wait for before returning |
| `full_page_screenshot` | `boolean` | No | If true, captures the full page when taking a screenshot |

**Returns**: `{ success: true, data: { url: string, opened: boolean } }`

---

### `browser_session_control`

Control the active persistent browser session. Supports actions, page reading, and screenshot capture.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actions` | `Array<unknown>` | No | Optional scripted browser actions to execute (click, type, goto) |
| `read_page` | `boolean` | No | If true, returns page metadata |
| `full_read` | `boolean` | No | If true, forces full page text output |
| `screenshot_path` | `string` | No | Optional screenshot output path |

**Returns**: `{ success: true, data: { actionsExecuted: number } }`

---

### `browser_session_close`

Close the active persistent browser session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { closed: boolean } }`

---

### `preview_html` 🎨

Render and preview HTML content in the system's default browser. Uses pathToFileURL for cross-platform compatibility.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | The HTML content to render |
| `file_name` | `string` | No | Optional filename (default: preview.html) |

**Returns**: `{ success: true, data: { previewed: boolean } }`

---

### `open_file` 🖥️

Open a file or URL in the system's default application.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target` | `string` | Yes | File path or URL |

**Returns**: `{ success: true, data: { opened: boolean } }`

---

## Git & GitHub Tools (13)

### `git_status` 🐙

Get the current git status of the repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { ... } }` — Git status object with staged/unstaged changes.

---

### `git_diff`

Get the git diff of the current repository or specific files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | `string` | No | Optional: Path to specific file to diff |
| `cached` | `boolean` | No | Optional: Show staged changes only (git diff --cached) |

**Returns**: `{ success: true, data: { diff: string } }`

---

### `git_commit`

Commit changes to the repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | `string` | Yes | Commit message |

**Returns**: `{ success: true, data: { committed: boolean } }`

---

### `git_log`

View the git commit history.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `max_count` | `number` | No | Maximum number of commits to return (default: 20) |

**Returns**: `{ success: true, data: { commits: Array<{ commit: string, author: Object, message: string }> } }`

---

### `git_add`

Stage files for commit.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `string[]` | No | Optional: Specific file paths to stage. If not provided, stages all changes. |

**Returns**: `{ success: true, data: { staged: boolean } }`

---

### `git_checkout`

Switch branches or restore working tree files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_name` | `string` | Yes | Branch name to checkout |
| `create_new` | `boolean` | No | Create a new branch if it doesn't exist |

**Returns**: `{ success: true, data: { switchedToBranch: string } }`

---

### `gh_create_issue` 🐙

Create a new GitHub issue. Requires GITHUB_TOKEN environment variable.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Issue title |
| `body` | `string` | No | Issue body (markdown) |
| `labels` | `string[]` | No | Labels to apply |

**Returns**: `{ success: true, data: { createdIssue: Object } }`

---

### `gh_list_issues`

List GitHub issues in the repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | `'open' \| 'closed'` | No | Filter by issue state |
| `labels` | `string[]` | No | Filter by labels |
| `limit` | `number` | No | Maximum number of issues to return (default: 20, max: 100) |

**Returns**: `{ success: true, data: { issues: Array<{ number: number, title: string }> } }`

---

### `gh_view_comments`

View comments on a GitHub issue or pull request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | `number` | Yes | Issue or PR number |
| `type` | `'issue' \| 'pr'` | No | Type of resource (issue or pr) |

**Returns**: `{ success: true, data: { comments: Array<{ user: string, body: string }> } }`

---

### `gh_create_pr`

Create a new GitHub pull request. Requires GITHUB_TOKEN environment variable.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | PR title |
| `body` | `string` | No | PR body (markdown) |
| `head_branch` | `string` | Yes | Head branch (source branch) |
| `base_branch` | `string` | No | Base branch (target branch, default: main) |

**Returns**: `{ success: true, data: { createdPR: Object } }`

---

### `gh_list_prs`

List GitHub pull requests in the repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | `'open' \| 'closed'` | No | Filter by PR state |
| `limit` | `number` | No | Maximum number of PRs to return (default: 20, max: 100) |

**Returns**: `{ success: true, data: { prs: Array<{ number: number, title: string }> } }`

---

### `gh_view_pr_diff`

View the diff of a GitHub pull request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | `number` | Yes | PR number |

**Returns**: `{ success: true, data: { diffUrl: string, patchUrl: string } }`

---

### `gh_push`

Push changes to the remote repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch` | `string` | No | Branch to push. Defaults to current branch. |

**Returns**: `{ success: true, data: { pushed: boolean } }`

---

## Database Tools (1)

### `query_database` 🗄️

Run read-only SQLite queries. Uses node:sqlite (Node.js 23+). Defaults to in-memory database; optionally specify a file path. SQL validation prevents unsafe queries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | SQL query string (read-only only) |
| `db_path` | `string` | No | Path to the SQLite database file (default: :memory:) |

**Returns**: `{ success: true, data: { query: string, results: Array<Object> } }`

---

## Document Parsing Tools (1)

### `read_document` 📚

Read content from PDF, DOCX, or TXT files. Supports both disk paths and attached files (use filename for attachments). Uses pdf-parse and mammoth libraries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | `string` | Yes | Path to the PDF, DOCX, or TXT file, or the filename if it is an attached file |

**Returns**: `{ success: true, data: { file_path: string, format: 'PDF' \| 'DOCX' \| 'TXT', word_count: number, text_preview: string } }`

---

## Background Command Tools (3)

### `run_background_command` ⏳

Start a long-running process in the background. The process is not blocked and can be checked or cancelled later. Includes command sanitization for security.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | The shell command to execute |
| `timeout_hours` | `number` | Yes | MANDATORY: How long the process is allowed to run before being killed (0.1–10) |
| `name` | `string` | Yes | MANDATORY: A short, descriptive name for the background task |

**Returns**: `{ success: true, data: { id: string, command: string } }`

---

### `check_background_command`

Check the status, stdout, and stderr of a running or completed background command.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | The command identifier |

**Returns**: `{ success: true, data: { id: string, status: 'running' \| 'completed', stdout?: string, stderr?: string } }`

---

### `cancel_background_command`

Kill a running background command.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | The command identifier |

**Returns**: `{ success: true, data: { id: string, cancelled: boolean } }`

---

## Execution Tools (5)

### `run_javascript` ⚡

Run JavaScript code snippet using Node.js (sandboxed). No external module imports allowed. Standard library only. Blocks dangerous patterns like eval, exec, child_process, and network access.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `javascript` | `string` | Yes | The JavaScript code to execute |
| `timeout_seconds` | `number` | No | Timeout in seconds (max 60) |

**Returns**: `{ success: true, data: { output: string } }`

---

### `run_python` 🐍

Run Python code snippet (sandboxed, no external modules). Standard library only. Blocks dangerous patterns like os, subprocess, and eval.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `python` | `string` | Yes | The Python code to execute |
| `timeout_seconds` | `number` | No | Timeout in seconds (max 60) |

**Returns**: `{ success: true, data: { output: string } }`

---

### `execute_command` 🔧

Execute a command in the current working directory. Supports full shell features (pipes, redirects, env vars). Includes sanitization for dangerous patterns.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | The shell command to execute |
| `timeout_seconds` | `number` | No | Timeout in seconds (max 300) |
| `input` | `string` | No | Input text to pipe to the command's stdin. |

**Returns**: `{ success: true, data: { stdout: string, stderr: string } }`

---

### `run_in_terminal` 💻

Launch a command in a new, separate interactive terminal window. Cross-platform support for Windows (cmd.exe), macOS (Terminal.app/iTerm2), and Linux (xterm/gnome-terminal/konsole).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | The shell command to execute |

**Returns**: `{ success: true, data: { launched: boolean } }`

---

### `run_tests` 🧪

Execute a test suite using Jest, PyTest, or Go test. Runs in the current working directory with timeout protection. Automatically detects test runner configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `runner` | `'jest' \| 'pytest' \| 'go-test'` | Yes | Test framework to use |
| `file_or_dir` | `string` | No | Specific file or directory path to run tests against (optional) |
| `timeout_seconds` | `number` | No | Timeout in seconds for test execution (default: 60, max: 300) |

**Returns**: `{ success: true, data: { runner: string, summary: { totalTests: number, passed: number, failed: number }, output: string } }`

---

## Utility Tools (28)

### `save_memory` 🧠

Save a specific piece of information or fact to long-term memory. Persists across LM Studio restarts.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fact` | `string` | Yes | The specific fact or piece of information to remember |

**Returns**: `{ success: true, data: { saved: boolean } }`

---

### `get_memory`

Retrieve all saved memory entries. Returns a list of all facts stored via save_memory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { memories: Array<{ id: string, fact: string }>, count: number } }`

---

### `search_memory`

Search saved memories for a specific fact or keyword. Returns matching entries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query to match against stored facts |
| `max_results` | `number` | No | Maximum number of results to return (default: 10) |

**Returns**: `{ success: true, data: { results: Array<{ id: string, fact: string }>, count: number } }`

---

### `delete_memory`

Delete a saved memory entry by its ID (returned from save_memory or get_memory).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entry_id` | `string` | Yes | The unique ID of the memory entry to delete |

**Returns**: `{ success: true, data: { deleted: boolean } }`

---

### `save_session_summary` 📝

Save a structured session summary for cross-session continuity. Includes accomplishments, pending tasks, decisions made, and context for the next session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_description` | `string` | Yes | Brief description of what was being worked on |
| `accomplishments` | `string` | No | List key accomplishments or completed tasks |
| `pending_tasks` | `string` | No | List remaining work that needs to continue in the next session |
| `decisions_made` | `string` | No | Key architectural or implementation decisions made during this session |
| `context_for_next_session` | `string` | No | Important context, file locations, or setup steps needed for the next session |

**Returns**: `{ success: true, data: { saved: boolean } }`

---

### `get_session_summary`

Retrieve the most recent saved session summary for continuity across sessions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { summaries: Array<Object>, count: number } }`

---

### `get_system_info` 💻

Get information about the system (OS, CPU, Memory).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { platform: string, arch: string, cpus: number } }`

---

### `read_clipboard` 📋

Read text content from the system clipboard. Cross-platform support for Windows (PowerShell), macOS (pbpaste), and Linux (xclip/xsel).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { content: string } }`

---

### `write_clipboard` 📋

Write text content to the system clipboard. Cross-platform support with proper escaping for shell injection prevention.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | `string` | Yes | The text content to write to clipboard |

**Returns**: `{ success: true, data: { written: boolean } }`

---

### `send_notification` 🔔

Send a system notification to the user using node-notifier. Supports custom icons and sounds.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Notification title |
| `message` | `string` | Yes | Notification message |
| `icon` | `string` | No | Optional custom icon path |

**Returns**: `{ success: true, data: { sent: boolean } }`

---

### `findLMStudioHome` 🏠

Locate LM Studio installation directory across platforms. Searches common paths for Windows, macOS, and Linux.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { found: boolean, path: string } }`

---

### `get_enabled_tools` 📊

Get list of currently enabled tools based on configuration. Useful for debugging tool access issues.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { toolCount: number, tools: string[] } }`

---

### `system_monitor` 📈

Get detailed system resource metrics including CPU, memory, disk usage, and network interfaces. Cross-platform support with platform-specific commands (PowerShell on Windows, df/ps on Unix).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metrics` | `string[]` | No | Metrics to report: `'cpu'`, `'memory'`, `'disk'`, `'network'` (default: ['cpu', 'memory']) |

**Returns**: `{ success: true, data: { timestamp: string, cpu?: Object, memory?: Object } }`

---

### `process_list` 📋

List currently running system processes with resource usage. Supports filtering by process name. Uses platform-specific commands (tasklist on Windows, ps on Unix).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | `string` | No | Filter processes by name (partial match, case-insensitive) |

**Returns**: `{ success: true, data: { count: number, processes: Array<{ pid: number, name: string }> } }`

---

### `env_inspect` 🔍

List current environment variables. Supports filtering by key prefix. Useful for debugging configuration issues.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prefix` | `string` | No | Filter environment variable keys by this prefix (e.g., "PATH", "NODE") |

**Returns**: `{ success: true, data: { count: number, variables: Array<{ key: string, value: string }> } }`

---

### `hash_file` 🔐

Generate cryptographic checksums (MD5, SHA1, SHA256) for a file to verify its integrity. Supports streaming for large files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | `string` | Yes | Path to the file to hash |
| `algorithm` | `'md5' \| 'sha1' \| 'sha256'` | No | Hash algorithm to use (default: sha256) |

**Returns**: `{ success: true, data: { file: string, algorithm: string, hash: string } }`

---

### `token_count` 📊

Count the number of LLM tokens in text using the tiktoken library. Supports multiple encodings (cl100k_base, p50k_base, r50k_base, gpt2).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | `string` | Yes | The text to count tokens for |
| `encoding` | `string` | No | Token encoding model (default: cl100k_base) |

**Returns**: `{ success: true, data: { tokenCount: number, encoding: string } }`

---

### `convert_format` 🔄

Convert between file formats: JSON↔CSV, base64 encode/decode, or compress/decompress files. Uses archiver for ZIP compression and unzipper for extraction.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | `'json_to_csv' \| 'csv_to_json' \| 'base64_encode' \| 'base64_decode' \| 'compress' \| 'decompress'` | Yes | Conversion action to perform |
| `input` | `string` | Yes | Input file path or content (for base64 actions, can be raw text) |
| `output` | `string` | No | Output file path. If omitted, uses same name with different extension. |

**Returns**: `{ success: true, data: { convertedFrom: string, convertedTo: string } }` or `{ success: true, data: { encoded: string } }` for base64 actions.

---

### `secret_scan` 🔒

Scan files in the current working directory for potentially exposed API keys, passwords, tokens, and other secrets. Uses regex patterns to detect sensitive information.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | No | Directory to scan (defaults to current working directory) |
| `exclude` | `string` | No | Files or directories to exclude (e.g., "node_modules,.git") |

**Returns**: `{ success: true, data: { scannedPath: string, totalFindings: number, findings: Array<{ file: string, line: number, type: string }> } }`

---

### `port_check` 🚪

Check if a specific TCP port is open and listening on the local machine. Uses socket connection with timeout protection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `port` | `number` | Yes | TCP port number to check (1–65535) |
| `host` | `string` | No | Host to check against (default: localhost) |

**Returns**: `{ success: true, data: { port: number, host: string, status: 'open' \| 'closed' \| 'timed_out' } }`

---

### `package_manage` 📦

Install, uninstall, update, or audit npm/pip/cargo packages. Security-sensitive: must be enabled in config (`packageManage: true`). Supports all three major package managers with cross-platform compatibility.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | `'install' \| 'uninstall' \| 'update' \| 'audit' \| 'outdated'` | Yes | Action to perform |
| `package_name` | `string` | No | Package name (required for install/uninstall) |
| `manager` | `'npm' \| 'pip' \| 'cargo'` | No | Package manager to use (default: npm) |

**Returns**: `{ success: true, data: { stdout: string, stderr: string } }`

---

### `detect_os_environment` 🖥️

Explicitly detects and reports the current operating system environment with detailed capabilities. Use this at the start of any session or before executing shell commands to ensure correct syntax (e.g., PowerShell vs Bash, Windows paths vs POSIX).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { osPlatform: string, shellType: string, recommendedCommands: Object } }`

---

### `get_current_working_directory` 📁

Get the current working directory. Use this before generating file operations with relative paths to ensure you know where files will be created/modified.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { current_working_directory: string } }`

---

## Image Processing Tools (4)

### `image_to_text` 🖼️

Extract text from images using OCR (Tesseract.js). Supports PNG, JPG, JPEG, BMP, GIF, TIFF, WebP formats. Maximum file size: 50MB. Returns extracted text with confidence score and language detection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imagePath` | `string` | Yes | Path to the image file |
| `language` | `string` | No | Language code for OCR (e.g., "eng", "deu", "chi_sim") |

**Returns**: `{ success: true, data: { text: string, confidence: number, language: string } }`

---

### `describe_image` 📸

Get detailed metadata about an image file including dimensions, format, size, and timestamps. Supports PNG, JPG, JPEG, BMP, GIF, WebP, TIFF formats.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imagePath` | `string` | Yes | Path to the image file |

**Returns**: `{ success: true, data: { path: string, size: number, format: string } }`

---

### `screenshot_desktop` 📷

Capture a screenshot of the desktop and save it to a file. Cross-platform support: Windows uses .NET GDI+ via PowerShell, macOS uses screencapture command, Linux uses gnome-screenshot or ImageMagick import.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `outputPath` | `string` | No | Output file path (defaults to temp directory with timestamp) |
| `format` | `'png' \| 'jpeg'` | No | Image format (default: "png") |
| `quality` | `number` | No | JPEG quality (1–100). Only applies to JPEG format. Default: 90 |

**Returns**: `{ success: true, data: { path: string } }`

---

### `compare_images` 🔍

Compare two images for similarity. Performs byte-level comparison and dimension checking. For identical encodings, returns exact match status. Note: Detailed pixel-level comparison requires sharp or jimp library installation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image1Path` | `string` | Yes | Path to the first image |
| `image2Path` | `string` | Yes | Path to the second image |

**Returns**: `{ success: true, data: { isIdentical: boolean } }`

---

## HTTP Client Tools (3)

### `http_request` 🔌

Make generic HTTP requests to any REST API. Supports GET, POST, PUT, DELETE, PATCH and other methods. Includes SSRF protection to prevent access to internal/private IP addresses.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'PATCH' \| 'HEAD' \| 'OPTIONS'` | Yes | HTTP method |
| `url` | `string` | Yes | Request URL (must be http:// or https://) |
| `headers` | `Object` | No | Custom headers as key-value pairs |
| `body` | `string \| Object` | No | Request body (string or JSON object) |

**Returns**: `{ success: true, data: { status: number, body: any } }`

---

### `http_get_json` 📥

Make a GET request and return parsed JSON response. Convenience wrapper for simple JSON API calls with automatic content-type detection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Request URL (must be http:// or https://) |
| `headers` | `Object` | No | Custom headers as key-value pairs |

**Returns**: `{ success: true, data: { status: number, body: any } }`

---

### `http_post_json` 📤

Make a POST request with JSON body and return parsed response. Convenience wrapper for API calls that require JSON payloads with automatic content-type handling.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | Request URL (must be http:// or https://) |
| `data` | `Object` | Yes | JSON object to send as request body |
| `headers` | `Object` | No | Custom headers as key-value pairs |

**Returns**: `{ success: true, data: { status: number, body: any } }`

---

## Vector RAG Tools (4)

### `rag_index_files` 📊

Index files in a directory for semantic search. Supports TypeScript, JavaScript, Markdown, JSON, YAML, and text files. Uses TF-IDF-like embeddings with cosine similarity for fast retrieval.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `directoryPath` | `string` | Yes | Directory path to index |
| `filePattern` | `string` | No | File pattern to match (glob syntax, default: "*.{ts,js,tsx,jsx,md,json,yaml,yml,toml,txt}") |

**Returns**: `{ success: true, data: { indexedChunks: number } }`

---

### `rag_query_vector` 🔍

Query the vector index for semantically similar documents. Returns top-k most relevant chunks based on cosine similarity scoring.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query text |
| `topK` | `number` | No | Number of results to return (default: 5, max: 20) |

**Returns**: `{ success: true, data: { results: Array<{ id: string, text: string }> } }`

---

### `rag_clear_index` 🧹

Clear the vector search index. Requires explicit confirmation to prevent accidental data loss.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirm` | `boolean` | Yes | Set to true to confirm clearing the index |

**Returns**: `{ success: true, data: { message: string } }`

---

### `rag_web_content` 🌐

Fetch content from a URL and use RAG (Retrieval Augmented Generation) to find and return only the text chunks most relevant to a specific query. Uses TF-IDF-like embeddings for relevance scoring.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The URL to fetch |
| `query` | `string` | Yes | The search query for relevance matching |

**Returns**: `{ success: true, data: { chunks: Array<{ text: string }> } }`

---

## Interactive UI Generation Tools (3)

### `generate_ui_component` 🎨

Generate HTML/CSS/JS code for an interactive UI component (button, form, chart, dashboard). Returns the generated code as a complete HTML document. Uses pathToFileURL for cross-platform compatibility.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `component_type` | `'button' \| 'form' \| 'chart' \| 'dashboard'` | Yes | Type of UI component to generate |
| `label` | `string` | No | Label text for buttons or forms |
| `fields` | `Array<{name: string, type: string, label: string}>` | No | Form fields (for form component) |
| `chart_data` | `Array<{label: string, value: number}>` | No | Chart data points (for chart component) |

**Returns**: `{ success: true, data: { component_type: string } }`

---

### `render_and_preview_ui` 🖥️

Render a generated HTML UI component, save it to a file, open it in the default browser, and optionally take a screenshot. Uses Puppeteer for cross-platform screenshot capture with pathToFileURL handling for Windows compatibility.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | The complete HTML content to render |
| `filename` | `string` | No | Filename for saving (default: ui_preview.html) |
| `screenshot_path` | `string` | No | Optional path to save a screenshot of the rendered UI |

**Returns**: `{ success: true, data: { rendered: boolean } }`

---

### `extract_ui_data` 📥

Extract structured data from HTML content (tables, forms, lists). Useful for parsing generated or fetched UIs. Uses regex-based extraction for tables, forms, and list items.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | `string` | Yes | The HTML content to extract data from |
| `extraction_type` | `'table' \| 'form' \| 'list'` | No | Type of data to extract (default: table) |

**Returns**: `{ success: true, data: { tables?: Array<Array<string>>, formFields?: Array<{name: string}>, items?: string[] } }`

---

## Auto-Context Management Tools (7)

### `auto_summarize_context` 🧠

Automatically analyze recent session activity to identify patterns, frequent tool usage, configuration changes, and decisions worth remembering. Saves findings to persistent memory using MessagePack format for efficient storage.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_events` | `Array<{type: string, timestamp: number}>` | No | Recent session events to analyze |
| `config_changes` | `Object` | No | Configuration changes made during session |

**Returns**: `{ success: true, data: { saved_count: number } }`

---

### `get_context_memory` 📖

Retrieve your persistent memory entries from past sessions. Access recorded decisions, patterns, configurations, and events stored in `.ai_toolbox_context.msgpack`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | `number` | No | Maximum number of entries to return (default: 20) |
| `type` | `'decision' \| 'pattern' \| 'configuration' \| 'file_change' \| 'error' \| 'summary'` | No | Filter by entry type |

**Returns**: `{ success: true, data: { entries: Array<{id: string, title: string}> } }`

---

### `search_context` 🔍

Search through your persistent memory for past decisions, patterns, configurations, and events. Text-based search across titles, content, and tags.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Search query to match against context entries |
| `max_results` | `number` | No | Maximum number of results to return (default: 10) |

**Returns**: `{ success: true, data: { results: Array<{id: string, title: string}> } }`

---

### `context_summary` 📊

Get a statistical overview of your persistent memory: total entries, breakdown by type (decisions, patterns, configurations), and recent activity.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | — | — | — |

**Returns**: `{ success: true, data: { total_entries: number } }`

---

### `delete_context_entry` 🗑️

Delete a specific auto-saved context entry by its unique ID. Entry IDs are generated automatically with format `ctx_<timestamp>_<random>`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entry_id` | `string` | Yes | The unique ID of the context entry to delete |

**Returns**: `{ success: true, data: { deleted: boolean } }`

---

### `track_important_event` 📌

Manually record an important event, decision, or milestone to persistent memory across sessions. Useful for capturing architectural decisions, major milestones, and patterns worth remembering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Title of the important event |
| `content` | `string` | Yes | Detailed description of the event |
| `tags` | `string[]` | No | Tags to categorize the event |

**Returns**: `{ success: true, data: { tracked: boolean } }`

---

### `clear_context_memory` 🧹

Clear all automatically saved context entries from persistent memory. This action is irreversible and cannot be undone. Requires explicit confirmation for safety.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirm` | `boolean` | Yes | Set to true to confirm deletion of all context entries |

**Returns**: `{ success: true, data: { cleared: boolean } }`

---

## Backup & Restore Tools (4)

### `create_backup` 💾

Create a compressed backup of the ENTIRE current working directory with all content. Includes source code, configs, everything! Backups are stored in `.ai_toolbox_backups/` inside the target directory using atomic write pattern to prevent empty orphan files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `destination` | `string` | No | Custom backup filename (must end with .zip) |
| `confirm` | `boolean` | Yes | ⚠️ MUST be true to create backup. When false, shows confirmation dialog instead. |

**Returns**: `{ success: true, data: { backupPath: string } }`

---

### `list_backups` 📋

List all available backup files in the current working directory's backups folder. Returns array of backup objects with filename, path, size, and creation date sorted by newest first.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sortBy` | `'date' \| 'size'` | No | Sort order: "date" (newest first) or "size" (largest first) |
| `limit` | `number` | No | Maximum number of backups to return (default: 50) |

**Returns**: `{ success: true, data: { backups: Array<{filename: string}> } }`

---

### `restore_backup` 🔄

Restore the working directory from a backup archive. ⚠️ WARNING: This will OVERWRITE ALL FILES in the current working directory! Requires explicit confirmation for safety. Creates temporary extraction directory and validates archive before restoration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `backupFile` | `string` | Yes | Backup filename to restore (e.g., "project-backup-2024-06-12T21-59-00.zip") |
| `confirm` | `boolean` | Yes | ⚠️ MUST be true to confirm restoration. This is a safety check against accidental data loss. |

**Returns**: `{ success: true, data: { restoredFilesCount: number } }`

---

### `delete_backup` 🗑️

Delete a backup file from the current working directory's backups folder. ⚠️ WARNING: This action is IRREVERSIBLE! Requires explicit confirmation for safety. Only deletes .zip files from backup directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `backupFile` | `string` | Yes | Backup filename to delete (e.g., "project-backup-2024-06-12T21-59-00.zip") |
| `confirm` | `boolean` | Yes | ⚠️ MUST be true to confirm deletion. This is a safety check. |

**Returns**: `{ success: true, data: { deletedFile: string } }`

---

## Verification Steps for All Tools

All tools follow consistent patterns for error handling and return values:
- **Success**: `{ success: true, data: {...} }`
- **Failure**: `{ success: false, error: "Error message" }`

Each tool includes:
1. ✅ Input validation using Zod schemas
2. ✅ Path traversal protection via `validatePath()`
3. ✅ Async operations for non-blocking execution
4. ✅ Consistent error handling with descriptive messages
5. ✅ Security gating where applicable (execution tools, package management)

---

## 📝 Notes

- All tools are registered conditionally based on configuration settings in LM Studio's plugin settings panel.
- Tool categories can be toggled on/off individually via the UI schematics defined in `config.ts`.
- God Mode (`godMode: true`) enables ALL tool categories regardless of individual toggle settings.
- Execution tools (run_javascript, run_python, execute_command) are disabled by default for security reasons and require explicit opt-in.
