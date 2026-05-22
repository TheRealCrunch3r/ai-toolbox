/**
 * Tools Documentation Generator
 * Provides formatted documentation for enabled tools based on configuration.
 */

import type { PluginConfig } from '../config.js';

export class ToolsDocumentation {
  private static readonly TOOL_DOCS: Record<string, string> = {
    // File System Tools
    'list_directory': '📁 list_directory - List files and directories in a path',
    'read_file': '📄 read_file - Read content from a file',
    'save_file': '💾 save_file - Save content to a file (supports batch)',
    'replace_text_in_file': '✏️ replace_text_in_file - Replace text within a file',
    'insert_at_line': '📌 insert_at_line - Insert content at a specific line',
    'append_file': '➕ append_file - Append content to end of file',
    'delete_lines_in_file': '🗑️ delete_lines_in_file - Delete lines from a file',
    'make_directory': '📂 make_directory - Create a new directory',
    'move_file': '↔️ move_file - Move or rename a file/directory',
    'copy_file': '📋 copy_file - Copy a file to a new location',
    'delete_path': '❌ delete_path - Delete a file or directory',
    'delete_files_by_pattern': '🔍 delete_files_by_pattern - Delete files matching regex pattern',
    'find_files': '🗂️ find_files - Find files recursively by name pattern',
    'fuzzy_find_local_files': '🎯 fuzzy_find_local_files - Fuzzy search files by name similarity',
    'get_file_metadata': 'ℹ️ get_file_metadata - Get file size, dates, and type info',
    'change_directory': '📍 change_directory - Change working directory (returns path)',
    'read_document': '📖 read_document - Read PDF or DOCX document content',
    'analyze_project': '🔬 analyze_project - Analyze project structure and config',

    // Web Research Tools
    'web_search': '🌐 web_search - Search the web via DuckDuckGo/Google/Bing',
    'wikipedia_search': '📚 wikipedia_search - Search Wikipedia for summaries',
    'fetch_web_content': '📥 fetch_web_content - Fetch and extract text from a URL',
    'rag_web_content': '🧠 rag_web_content - RAG-based content extraction from URL',

    // Browser Automation Tools
    'browser_open_page': '🌍 browser_open_page - Open URL in headless browser',
    'browser_session_control': '🎮 browser_session_control - Control persistent browser session',
    'browser_session_close': '🔒 browser_session_close - Close browser session',
    'preview_html': '👁️ preview_html - Preview HTML content in default browser',
    'open_file': '📂 open_file - Open file or URL in system app',

    // Git & GitHub Tools
    'git_status': '🔎 git_status - Get current git repository status',
    'git_diff': '📊 git_diff - Show changes between commits/branches',
    'git_commit': '✅ git_commit - Commit staged changes with message',
    'git_log': '📜 git_log - View commit history',
    'git_add': '➕ git_add - Stage files for commit',
    'git_checkout': '🔄 git_checkout - Switch or create branches',
    'gh_auth': '🔑 gh_auth - Check GitHub authentication status',
    'gh_create_issue': '📝 gh_create_issue - Create a new GitHub issue',
    'gh_list_issues': '📋 gh_list_issues - List repository issues',
    'gh_view_comments': '💬 gh_view_comments - View comments on issue/PR',
    'gh_create_pr': '🔀 gh_create_pr - Create a pull request',
    'gh_list_prs': '📑 gh_list_prs - List pull requests',
    'gh_view_pr_diff': '📈 gh_view_pr_diff - Fetch PR diff/patch',
    'gh_push': '⬆️ gh_push - Push commits to remote repository',

    // Database Tools
    'query_database': '🗃️ query_database - Execute read-only SQLite queries',

    // Background Command Tools
    'run_background_command': '⏳ run_background_command - Start long-running process',
    'check_background_command': '👀 check_background_command - Check background command status',
    'cancel_background_command': '🛑 cancel_background_command - Kill a running background command',

    // Execution Tools
    'run_javascript': '⚡ run_javascript - Execute JavaScript code snippet',
    'run_python': '🐍 run_python - Execute Python code snippet',
    'execute_command': '💻 execute_command - Run shell command safely',
    'run_in_terminal': '🖥️ run_in_terminal - Launch command in new terminal window',

    // Utility Tools
    'save_memory': '🧠 save_memory - Save fact to long-term memory',
    'get_system_info': 'ℹ️ get_system_info - Get OS, CPU, and memory info',
    'read_clipboard': '📋 read_clipboard - Read text from system clipboard',
    'write_clipboard': '✍️ write_clipboard - Write text to system clipboard',
    'send_notification': '🔔 send_notification - Send desktop notification',
    'findLMStudioHome': '🏠 findLMStudioHome - Locate LM Studio installation directory',
    'get_enabled_tools': '✅ get_enabled_tools - List currently enabled tools',
  };

  /**
   * Get formatted documentation string for all enabled tools.
   */
  static getEnabledDocs(config: PluginConfig): string {
    const docs = this.getToolListForConfig(config);
    
    if (docs.length === 0) {
      return 'No tools are currently enabled.';
    }

    // Group by category for better readability
    const sections = [
      { name: 'File System', prefix: /^list_directory|read_file|save_file|replace_text_in_file|insert_at_line|append_file|delete_lines_in_file|make_directory|move_file|copy_file|delete_path|delete_files_by_pattern|find_files|fuzzy_find_local_files|get_file_metadata|change_directory|read_document|analyze_project$/ },
      { name: 'Web Research', prefix: /^web_search|wikipedia_search|fetch_web_content|rag_web_content$/ },
      { name: 'Browser Automation', prefix: /^browser_open_page|browser_session_control|browser_session_close|preview_html|open_file$/ },
      { name: 'Git & GitHub', prefix: /^git_status|git_diff|git_commit|git_log|git_add|git_checkout|gh_auth|gh_create_issue|gh_list_issues|gh_view_comments|gh_create_pr|gh_list_prs|gh_view_pr_diff|gh_push$/ },
      { name: 'Database', prefix: /^query_database$/ },
      { name: 'Background Commands', prefix: /^run_background_command|check_background_command|cancel_background_command$/ },
      { name: 'Execution', prefix: /^run_javascript|run_python|execute_command|run_in_terminal$/ },
      { name: 'Utility', prefix: /^save_memory|get_system_info|read_clipboard|write_clipboard|send_notification|findLMStudioHome|get_enabled_tools$/ },
    ];

    let result = '=== AVAILABLE TOOLS ===\n\n';
    
    for (const section of sections) {
      const toolsInSection = docs.filter(doc => section.prefix.test(doc));
      if (toolsInSection.length > 0) {
        result += `**${section.name} (${toolsInSection.length})**:\n`;
        for (const tool of toolsInSection) {
          result += `  • ${tool}\n`;
        }
        result += '\n';
      }
    }

    return result;
  }

  /**
   * Get list of enabled tool documentation strings based on config.
   */
  private static getToolListForConfig(config: PluginConfig): string[] {
    const docs: string[] = [];

    if (config.fileSystem) {
      ['list_directory', 'read_file', 'save_file', 'replace_text_in_file', 'insert_at_line', 
       'append_file', 'delete_lines_in_file', 'make_directory', 'move_file', 'copy_file',
       'delete_path', 'delete_files_by_pattern', 'find_files', 'fuzzy_find_local_files',
       'get_file_metadata', 'change_directory', 'read_document', 'analyze_project'
      ].forEach(name => docs.push(this.TOOL_DOCS[name]));
    }

    if (config.webSearch) {
      ['web_search', 'wikipedia_search', 'fetch_web_content', 'rag_web_content']
        .forEach(name => docs.push(this.TOOL_DOCS[name]));
    }

    if (config.browserAutomation) {
      ['browser_open_page', 'browser_session_control', 'browser_session_close', 
       'preview_html', 'open_file'
      ].forEach(name => docs.push(this.TOOL_DOCS[name]));
    }

    if (config.gitOperations) {
      ['git_status', 'git_diff', 'git_commit', 'git_log', 'git_add', 'git_checkout',
       'gh_auth', 'gh_create_issue', 'gh_list_issues', 'gh_view_comments',
       'gh_create_pr', 'gh_list_prs', 'gh_view_pr_diff', 'gh_push'
      ].forEach(name => docs.push(this.TOOL_DOCS[name]));
    }

    if (config.databaseQueries) {
      docs.push(this.TOOL_DOCS['query_database']);
    }

    if (config.backgroundCommands) {
      ['run_background_command', 'check_background_command', 'cancel_background_command']
        .forEach(name => docs.push(this.TOOL_DOCS[name]));
    }

    if (config.executionJavaScript || config.executionPython || 
        config.executionTerminal || config.executionShell) {
      ['run_javascript', 'run_python', 'execute_command', 'run_in_terminal']
        .forEach(name => docs.push(this.TOOL_DOCS[name]));
    }

    // Utility tools are always enabled
    ['save_memory', 'get_system_info', 'read_clipboard', 'write_clipboard', 
     'send_notification', 'findLMStudioHome', 'get_enabled_tools'
    ].forEach(name => docs.push(this.TOOL_DOCS[name]));

    return docs;
  }
}
