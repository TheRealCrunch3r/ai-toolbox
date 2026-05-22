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
      { toolName: 'replace_text_in_file', description: 'Replace exact string in file', parameters: ['file_name, old_string, new_string'] },
      { toolName: 'insert_at_line', description: 'Insert text at specific line number', parameters: ['file_name, line_number, content'] },
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
  general: {
    pluginName: 'AI Toolbox Plugin',
    enabledTools: 'Enabled Tools:',
    disabledTools: 'Disabled Tools:',
    errorPrefix: 'Error:',
    successPrefix: 'Success:',
  },
};