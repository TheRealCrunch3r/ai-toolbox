/**
 * English translations for AI Toolbox plugin
 */

import type { FullTranslationSet } from './types';

export const enTranslations: FullTranslationSet = {
  fileSystem: {
    categoryTitle: '📁 File System Tools',
    tools: [
      { toolName: 'list_directory', description: 'List files and folders in workspace', parameters: ['path (optional)'] },
      { toolName: 'read_file', description: 'Read text file content', parameters: ['file_name'] },
      { toolName: 'save_file', description: 'Create or overwrite file', parameters: ['file_name, content'] },
      { toolName: 'replace_text_in_file', description: 'Replace exact string in file (USE THIS FOR COMPLEX INSERTIONS/REPLACEMENTS — NEVER use line_operations for this)', parameters: ['file_name, old_string, new_string'] },
      { toolName: 'insert_at_line', description: '⚠️ Single inserts only — avoid for multi-step structural changes (use save_file/replace_text_in_file instead). Insert text at specific line number.', parameters: ['file_name, line_number, content'] },
      { toolName: 'append_file', description: 'Append content to end of file', parameters: ['file_name, content'] },
      { toolName: 'delete_lines_in_file', description: 'Delete specific lines from file', parameters: ['file_name, start_line, end_line (optional)'] },
      { toolName: 'make_directory', description: 'Create new directory', parameters: ['directory_name'] },
      { toolName: 'move_file', description: 'Move or rename file/directory', parameters: ['source, destination'] },
      { toolName: 'copy_file', description: 'Copy file to new location', parameters: ['source, destination'] },
      { toolName: 'delete_path', description: 'Delete file or directory (destructive)', parameters: ['path'] },
      { toolName: 'delete_files_by_pattern', description: 'Delete files matching regex pattern', parameters: ['pattern (regex)'] },
      { toolName: 'find_files', description: 'Find files by name pattern recursively', parameters: ['pattern, max_depth (optional)'] },
      { toolName: 'fuzzy_find_local_files', description: 'Fuzzy search files by name/path similarity', parameters: ['query, path (optional), max_results (optional)'] },
      { toolName: 'get_file_metadata', description: 'Get file size, dates, type info', parameters: ['path'] },
      { toolName: 'change_directory', description: 'Change working directory', parameters: ['directory'] },
      { toolName: 'read_document', description: 'Read PDF or DOCX documents', parameters: ['file_path'] },
      { toolName: 'analyze_project', description: 'Run project-wide linting analysis', parameters: [] },
      { toolName: 'read_file_chunked', description: 'Read files in structured chunks to bypass character limits, returning start/end indices for streaming control on huge files', parameters: ['file_name, chunk_size/max_chunks (optional)'] },
      { toolName: 'grep_files', description: 'Regex or AST pattern search across the project — ReDoS-safe with a 15 s deadline cap; partial results + explicit aborted flag at timeout; node_modules excluded by default', parameters: ['pattern (+ include/exclude/limit options)'] },
      { toolName: 'find_replace_all', description: 'Regex search & replace across multiple files with dry-run preview, .bak backups and extension filters — depth-capped hang prevention built in', parameters: ['pattern, replacement (optional), directory/dry_run/confirm (+ filters)'] },
      { toolName: 'pattern_scan', description: 'Recursive content search returning matching lines as {file, line, content}; unsafe regex auto-demotes to literal; 256 KB / 10k-line per-file caps with skip records; ripgrep phase-1 prefilter (B\')', parameters: ['pattern (+ root/mode/caps options)'] },
      { toolName: 'directory_tree', description: 'Visualize directory structure in tree format with max depth, optional file sizes and automatic large-directory exclusion', parameters: ['path/max_depth/show_size (optional)'] },
      { toolName: 'file_diff', description: 'Compare two files and return a unified diff with +/− markers and line numbers', parameters: ['file_a, file_b'] },
    ],
  },
  webSearch: {
    categoryTitle: '🌐 Web & Research Tools',
    tools: [
      { toolName: 'web_search', description: 'Search DuckDuckGo/Google/Bing with fallback chain', parameters: ['query, providers (optional)'] },
      { toolName: 'wikipedia_search', description: 'Search Wikipedia for page summaries', parameters: ['query, lang (optional)'] },
      { toolName: 'fetch_web_content', description: 'Fetch webpage clean text content', parameters: ['url'] },
      { toolName: 'rag_web_content', description: 'RAG-based semantic web search', parameters: ['url, query'] },
      { toolName: 'browser_session_open', description: 'Open persistent browser session', parameters: ['url, wait_for_selector (optional)'] },
      { toolName: 'browser_session_control', description: 'Control browser actions (click, type, etc.)', parameters: ['actions array, read_page flag'] },
    ],
  },
  browserAutomation: {
    categoryTitle: '🌐 Browser Automation Tools',
    tools: [
      { toolName: 'browser_open_page', description: 'One-shot page render with Puppeteer', parameters: ['url, screenshot_path (optional), actions (optional)'] },
      { toolName: 'browser_session_close', description: 'Gracefully close a persistent browser session, preventing orphaned Chromium processes', parameters: [] },
      { toolName: 'preview_html', description: 'Render raw HTML or an existing .html file in the default system browser', parameters: ['source (HTML string or path)'] },
      { toolName: 'open_file', description: 'Open files/URLs in the system default application (Windows start / macOS open / Linux xdg-open)', parameters: ['target'] },
    ],
  },
  gitOperations: {
    categoryTitle: '🐙 Git & GitHub Tools',
    tools: [
      { toolName: 'git_status', description: 'View modified files in repository', parameters: [] },
      { toolName: 'git_diff', description: 'See changes in detail', parameters: ['file_path (optional), cached (optional)'] },
      { toolName: 'git_commit', description: 'Commit staged changes', parameters: ['message'] },
      { toolName: 'git_log', description: 'View commit history', parameters: ['max_count (optional)'] },
      { toolName: 'git_add', description: 'Stage specific files or all changes', parameters: ['paths (optional)'] },
      { toolName: 'git_checkout', description: 'Switch to existing or create new branch', parameters: ['branch_name, create_new (optional)'] },
      { toolName: 'gh_auth', description: 'Check GitHub authentication status', parameters: [] },
      { toolName: 'gh_create_issue', description: 'Create new GitHub issue', parameters: ['title, body (optional), labels (optional)'] },
      { toolName: 'gh_list_issues', description: 'List issues in repository', parameters: ['state (optional), labels (optional), limit (optional)'] },
      { toolName: 'gh_view_comments', description: 'View comments on issue or PR', parameters: ['number, type (optional)'] },
      { toolName: 'gh_create_pr', description: 'Create pull request', parameters: ['title, body, head_branch, base_branch (optional)'] },
      { toolName: 'gh_list_prs', description: 'List pull requests in repository', parameters: ['state (optional), limit (optional)'] },
      { toolName: 'gh_view_pr_diff', description: 'Fetch PR diff/patch', parameters: ['number'] },
      { toolName: 'gh_push', description: 'Push commits to remote repository', parameters: ['branch (optional)'] },
      { toolName: 'git_stash', description: 'Manage uncommitted changes: save, pop, drop and list stashes (native Git CLI — isomorphic-git has no stash support)', parameters: ['operation (+ options)'] },
      { toolName: 'git_blame', description: 'Per-line commit history showing author, timestamp and hash; path validation prevents traversal attacks', parameters: ['file_path (+ options)'] },
    ],
  },
  databaseQueries: {
    categoryTitle: '💾 Database Query Tools',
    tools: [
      { toolName: 'query_database', description: 'Run read-only SQLite queries', parameters: ['query (SQL string)'] },
    ],
  },
  documentParsing: {
    categoryTitle: '📄 Document Parsing Tools',
    tools: [
      { toolName: 'read_document', description: 'Read PDF or DOCX documents', parameters: ['file_path'] },
    ],
  },
  backgroundCommands: {
    categoryTitle: '⏱️ Background Command Tools',
    tools: [
      { toolName: 'run_background_command', description: 'Start long-running process in background', parameters: ['command, timeout_hours (mandatory), name (mandatory)'] },
      { toolName: 'check_background_command', description: 'Check status and output of running command', parameters: ['id'] },
      { toolName: 'cancel_background_command', description: 'Kill a running background command', parameters: ['id'] },
    ],
  },
  codeRefactoring: {
    categoryTitle: '🧬 Code Refactoring Tools',
    tools: [
      { toolName: 'refactor_code', description: 'AST-based refactoring (Babel): rename identifiers, move functions across files, extract functions, dead-import cleanup — syntax-safe with .bak backup and auto-rollback on failure; dry-run diffs supported', parameters: ['file_path, operation, per-operation fields, dry_run (optional)'] },
    ],
  },
  execution: {
    categoryTitle: '⚡ Execution Tools',
    tools: [
      { toolName: 'run_javascript', description: 'Execute JavaScript in an isolated Node VM context; eval/require/child_process blocked, default timeout 5 s', parameters: ['javascript, timeout_seconds (optional)'] },
      { toolName: 'run_python', description: 'Execute Python in a controlled sandbox; os/subprocess/sys imports blocked, default timeout 10 s', parameters: ['python, timeout_seconds (optional)'] },
      { toolName: 'execute_command', description: '⚠️ Run shell commands with multi-layer sanitization and pipe limits — disabled by default', parameters: ['command (+ options)'] },
      { toolName: 'run_in_terminal', description: 'Launch an OS-native terminal window (cmd/PowerShell/zsh/bash) with env vars and visibility options', parameters: [] },
      { toolName: 'run_tests', description: 'Auto-detect the test framework from package.json (Jest/Mocha/Vitest) and run the project suite, returning results', parameters: [] },
    ],
  },
  textProcessing: {
    categoryTitle: '📝 Text Processing Tools',
    tools: [
      { toolName: 'text_transform', description: 'Regex-based text substitution with capture groups ($1/$2), line ranges and global/case-insensitive modes — safer than shell sed', parameters: ['file_name, pattern, replacement (optional), flags (optional)'] },
      { toolName: 'line_operations', description: 'Insert/delete/reorder lines awk-style without shell dependencies; three-layer guardrails (pattern anchoring, line fingerprinting, bounds validation) + MD5 post-write integrity check', parameters: ['file_name, operation, target_line or pattern anchors (+ options)'] },
      { toolName: 'text_extract', description: 'Structured field extraction from delimited text (CSV/TSV/custom) using zero-based field indices', parameters: ['file_name, fields, delimiter (optional), output_format (optional)'] },
      { toolName: 'markdown_table_gen', description: 'Generate a valid Markdown table from an array of objects with headers, alignment and truncation', parameters: ['data, headers (optional)'] },
    ],
  },
  taskPlanning: {
    categoryTitle: '📋 Task Planning Tools',
    tools: [
      { toolName: 'create_plan', description: 'Create a multi-step execution plan (1–30 steps); replaces any active plan and returns planId + stepCount', parameters: ['goal, steps'] },
      { toolName: 'get_plan', description: 'Return the active plan with step statuses, completion percentage and elapsed time; null if no plan exists', parameters: [] },
      { toolName: 'update_plan_step', description: 'Update one plan step through the state machine (pending→in_progress→done; any→blocked; blocked→pending) — note required when blocking', parameters: ['planId, index, status, note (required if blocked)'] },
    ],
  },
  contextManagement: {
    categoryTitle: '🧠 Context & Memory Tools',
    tools: [
      { toolName: 'auto_summarize_context', description: 'Analyze recent session activity for patterns, frequent tool usage and decisions worth remembering; saves to persistent memory with global scope', parameters: ['session_events (+ config_changes)'] },
      { toolName: 'get_context_memory', description: 'Retrieve past context entries filtered by type (decision/pattern/configuration/file_change/error/summary); recency×frequency scoring surfaces recent, frequently accessed entries first', parameters: ['type (optional), limit (optional)'] },
      { toolName: 'search_context', description: 'Fuzzy text search across context entry titles, bodies and tags; expired session entries pruned before search (24 h TTL)', parameters: ['query, max_results (optional)'] },
      { toolName: 'context_summary', description: 'Statistical overview of persistent memory: total entries, type breakdowns and recent activity counts', parameters: [] },
      { toolName: 'delete_context_entry', description: 'Remove a specific context entry by unique ID without clearing the rest of the history', parameters: ['entry_id'] },
      { toolName: 'clear_context_memory', description: 'Clear all auto-saved context entries (⚠️ irreversible; requires confirm=true)', parameters: ['confirm'] },
      { toolName: 'track_important_event', description: 'Manually record an event, decision or milestone with custom tags for categorized retrieval', parameters: ['title, content, tags (optional)'] },
      { toolName: 'save_session_summary', description: 'Save a structured session summary (accomplishments, pending tasks, decisions) compressed to bypass the 10k SDK limit', parameters: ['task_description (+ optional sections)'] },
      { toolName: 'get_session_summary', description: 'Retrieve the latest saved session summary with backward-compatible fallback for legacy data', parameters: [] },
      { toolName: 'save_memory', description: 'Persist a fact to .ai_toolbox_memory.msgpack for cross-session continuity (RAM + atomic disk copy)', parameters: ['fact'] },
      { toolName: 'get_memory', description: 'Retrieve all saved memory entries; local project file checked first, then persistent store', parameters: [] },
      { toolName: 'delete_memory', description: 'Remove a specific memory entry by its unique key (returned during save)', parameters: ['entry_id'] },
      { toolName: 'list_sessions', description: 'Browse saved session summaries with pagination and limit controls', parameters: ['limit (optional), offset (optional)'] },
      { toolName: 'search_sessions', description: 'Keyword search across stored session summaries, newest first', parameters: ['query, max_results (optional)'] },
      { toolName: 'clear_session_index', description: 'Remove all lightweight session index entries only — summaries untouched (requires confirm=true)', parameters: ['confirm'] },
      { toolName: 'register_project', description: 'Register or update a project in the cross-project registry by name + working-dir path (+ optional source dirs)', parameters: ['project_name, working_dir_path, source_dirs (optional)'] },
      { toolName: 'get_project_info', description: 'Retrieve details of one registered project by its working directory path', parameters: ['working_dir_path'] },
      { toolName: 'list_projects', description: 'List all registered projects with paths, last-accessed times and session counts', parameters: [] },
      { toolName: 'search_projects', description: 'Search registered projects by name or path substring; lazy registry sync auto-registers projects found in session memory', parameters: ['query, max_results (optional)'] },
      { toolName: 'switch_context', description: 'Switch context storage to another project\'s working directory for memory/session recall (confirm-first per Step 0.7 banner)', parameters: ['target_working_dir_path'] },
    ],
  },
  vectorRag: {
    categoryTitle: '🔍 Vector RAG Tools',
    tools: [
      { toolName: 'rag_index_files', description: 'Index a directory of TS/JS/MD/JSON/YAML/text files for semantic search with batch processing', parameters: ['directoryPath, filePattern (optional), batchSize (optional)'] },
      { toolName: 'rag_index_pdf', description: 'Index a PDF by page-bounded chunks (~300 words each) with page_number provenance — OOM-safe bounded reads', parameters: ['filePath, chunkSize/overlap (optional)'] },
      { toolName: 'rag_index_docx', description: 'Extract DOCX text via mammoth into word-bounded chunks through the same embedding pipeline as PDF', parameters: ['filePath, chunkSize/overlap (optional)'] },
      { toolName: 'rag_index_xlsx', description: 'Index all sheets of a spreadsheet as row arrays with optional sheet-name prefix for traceability', parameters: ['filePath, chunkSize (optional), includeSheetNames (optional)'] },
      { toolName: 'rag_query_vector', description: 'Cosine-similarity query over the vector index returning top-k chunks with content and scores', parameters: ['query, topK (optional)'] },
      { toolName: 'rag_clear_index', description: 'Clear the entire vector index (requires confirm=true); useful before full reindexing', parameters: ['confirm'] },
      { toolName: 'rag_web_content', description: 'Fetch a URL and return only the text chunks relevant to the query — bounded, deduplicated extraction', parameters: ['url, query'] },
    ],
  },
  uiGeneration: {
    categoryTitle: '🎨 UI Generation Tools',
    tools: [
      { toolName: 'generate_ui_component', description: 'Create interactive HTML/CSS/JS components (buttons, forms, tables) from a user description', parameters: [] },
      { toolName: 'render_and_preview_ui', description: 'Render components in-browser with live preview for rapid prototyping', parameters: [] },
      { toolName: 'extract_ui_data', description: 'Extract structured data from pages via CSS selectors/XPath returning tabular output back into the chat', parameters: [] },
    ],
  },
  httpClient: {
    categoryTitle: '📡 HTTP Client Tools',
    tools: [
      { toolName: 'http_request', description: 'Generic GET/POST/PUT/DELETE/PATCH client with retry logic, timeout configuration and multipart upload — SSRF-guarded (⚠️ disabled by default)', parameters: ['url, method (+ options)'] },
      { toolName: 'http_get_json', description: 'GET requests expecting JSON responses with automatic parsing and optional schema validation', parameters: ['url (+ headers/options)'] },
      { toolName: 'http_post_json', description: 'POST requests with JSON payload, content-type auto-handling and auth token support; returns status code', parameters: ['url, body (+ options)'] },
    ],
  },
  utilities: {
    categoryTitle: '🔧 Utility Tools',
    tools: [
      { toolName: 'search_memory', description: 'Keyword search across stored memories returning relevance confidence scores per match', parameters: ['query (+ options)'] },
      { toolName: 'get_system_info', description: 'OS type/version, CPU model/count, total/available memory and disk usage statistics', parameters: [] },
      { toolName: 'system_monitor', description: 'Detailed CPU, memory, disk and network interface metrics for performance tracking', parameters: [] },
      { toolName: 'process_list', description: 'Running processes with CPU%, memory footprint and PID hierarchy; case-insensitive name filtering', parameters: ['name_filter (optional)'] },
      { toolName: 'env_inspect', description: 'List environment variables with optional prefix filtering for targeted inspection', parameters: ['prefix (optional)'] },
      { toolName: 'detect_os_environment', description: 'Report OS capabilities ensuring correct command syntax before shell/path operations', parameters: [] },
      { toolName: 'read_clipboard', description: 'Read the system clipboard cross-platform (GetClipboardData/pbpaste/xclip)', parameters: [] },
      { toolName: 'write_clipboard', description: 'Write text to the system clipboard with automatic platform detection', parameters: ['text'] },
      { toolName: 'send_notification', description: 'Send an OS-native toast notification with title, message body and optional custom icon', parameters: ['title, message (+ options)'] },
      { toolName: 'findLMStudioHome', description: 'Locate the LM Studio installation directory across platforms, returning the model storage path', parameters: [] },
      { toolName: 'get_enabled_tools', description: 'List currently enabled tools verifying active categories and God Mode bypass status', parameters: [] },
      { toolName: 'hash_file', description: 'Generate MD5/SHA1/SHA256 checksums for file integrity verification', parameters: ['file_path, algorithm (optional)'] },
      { toolName: 'token_count', description: 'LLM token counting via tiktoken encodings (cl100k_base etc.) for context estimation', parameters: ['text or content (+ options)'] },
      { toolName: 'convert_format', description: 'JSON↔CSV conversion, base64 encode/decode and compress/decompress with configurable levels', parameters: [] },
      { toolName: 'secret_scan', description: 'Scan files for leaked API keys, passwords and tokens; supports custom exclusion patterns — find secrets before shipping', parameters: ['paths (+ options)'] },
      { toolName: 'port_check', description: 'Check TCP port availability on localhost or a custom host for service verification', parameters: ['port, host (optional)'] },
      { toolName: 'package_manage', description: 'Install/uninstall/update/audit npm/pip/cargo packages (⚠️ requires the packageManage config toggle)', parameters: [] },
    ],
  },
  imageProcessing: {
    categoryTitle: '🖼️ Image Processing & Analysis Tools',
    tools: [
      { toolName: 'image_to_text', description: 'OCR text extraction via Tesseract.js with confidence scores and language detection (50 MB max)', parameters: ['imagePath, language (optional)'] },
      { toolName: 'describe_image', description: 'Get image metadata: dimensions, format, size and timestamps for PNG/JPG/BMP/GIF/WebP/TIFF', parameters: ['imagePath'] },
      { toolName: 'screenshot_desktop', description: 'Capture a desktop screenshot cross-platform (GDI+/screencapture/ImageMagick)', parameters: ['outputPath/format/quality (optional)'] },
      { toolName: 'compare_images', description: 'Byte-level and dimension comparison of two images; exact-match status for identical encodings', parameters: ['image1Path, image2Path'] },
      { toolName: 'analyze_image', description: 'Send an image to a loaded vision-capable LM Studio model with an optional prompt; returns textual analysis + metadata (⚠️ requires a vision model)', parameters: ['imagePath, prompt (optional)'] },
    ],
  },
  backupRestore: {
    categoryTitle: '💾 Backup & Restore Tools',
    tools: [
      { toolName: 'create_backup', description: 'Create a compressed ZIP snapshot of the entire working directory in .ai_toolbox_backups/ (requires confirm=true)', parameters: ['confirm, destination/targetDirectory (optional)'] },
      { toolName: 'list_backups', description: 'List backups sorted by date or size with filename, path, size and creation timestamp', parameters: ['sortBy/limit (optional)'] },
      { toolName: 'restore_backup', description: 'Restore the working directory from a backup archive (⚠️ overwrites all files; requires confirm=true)', parameters: ['backupFile, confirm'] },
      { toolName: 'delete_backup', description: 'Remove one specific backup file (⚠️ irreversible; validates existence first)', parameters: ['backupFile, confirm'] },
      { toolName: 'cleanup_backups', description: 'List and optionally delete .bak edit backups — dry-run by default, confirm required to delete', parameters: ['confirm (optional)'] },
    ],
  },
  dataVisualization: {
    categoryTitle: '📈 Data Visualization Tools',
    tools: [
      { toolName: 'generate_chart', description: 'Render bar/line/pie/doughnut/scatter/radar charts to a PNG image from raw data; HTML fallback when the renderer is unavailable', parameters: ['type, data (+ title/colors/output_path optional)'] },
    ],
  },
  general: {
    pluginName: 'AI Toolbox Plugin',
    enabledTools: 'Enabled Tools:',
    disabledTools: 'Disabled Tools:',
    errorPrefix: 'Error:',
    successPrefix: 'Success:',
  },
};