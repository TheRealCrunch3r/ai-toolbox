import fs from 'fs';
import path from 'path';
import type { PluginConfig } from '../config.js';

/**
 * Tools Documentation Generator (Dynamic Version)
 * Automatically discovers tools by scanning src/tools directory.
 */

export class ToolsDocumentation {
  // Mapping of category names to regex prefixes for grouping
  private static readonly CATEGORY_MAP = [
    { name: 'File System', prefix: /^list_directory|read_file|save_file|replace_text_in_file|insert_at_line|append_file|delete_lines_in_file|make_directory|move_file|copy_file|delete_path|delete_files_by_pattern|find_files|fuzzy_find_local_files|get_file_metadata|change_directory|read_document|analyze_project$/ },
    { name: 'Web Research', prefix: /^web_search|wikipedia_search|fetch_web_content|rag_web_content$/ },
    { name: 'Browser Automation', prefix: /^browser_open_page|browser_session_control|browser_session_close|preview_html|open_file$/ },
    { name: 'Git & GitHub', prefix: /^git_status|git_diff|git_commit|git_log|git_add|git_checkout|gh_auth|gh_create_issue|gh_list_issues|gh_view_comments|gh_create_pr|gh_list_prs|gh_view_pr_diff|gh_push$/ },
    { name: 'Database', prefix: /^query_database$/ },
    { name: 'Background Commands', prefix: /^run_background_command|check_background_command|cancel_background_command$/ },
    { name: 'Execution', prefix: /^run_javascript|run_python|execute_command|run_in_terminal$/ },
    { name: 'Utility', prefix: /^save_memory|get_system_info|read_clipboard|write_clipboard|send_notification|findLMStudioHome|get_enabled_tools|system_monitor|process_list|env_inspect|hash_file|token_count|convert_format|secret_scan|port_check|package_manage|detect_os_environment|json_query|env_update$/ },
  ];

  /**
   * Scans tool files to extract documentation.
   * In a production environment, this would be run during the build step.
   */
  private static async discoverTools(): Promise<Record<string, string>> {
    const tools: Record<string, string> = {};
    // We assume the plugin is running from its installation directory
    const toolsDir = path.join(process.cwd(), 'src', 'tools');
    
    if (!fs.existsSync(toolsDir)) {
      console.log(`[Docs] Tools directory not found: ${toolsDir}`);
      return tools;
    }

    const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.ts'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(toolsDir, file), 'utf8');
      // Regex to find name: '...' and description: '...' within the same tool object
      const pattern = /name:\s*['"]([^'"]+)['"][\s\S]*?description:\s*['"]([^'"]+)['"]/g;
      
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const [, name, description] = match;
        tools[name] = description;
      }
    }
    return tools;
  }

  /**
   * Get formatted documentation string for all enabled tools.
   */
  static async getEnabledDocs(config: PluginConfig): Promise<string> {
    const allTools = await this.discoverTools();
    
    // Filter based on config (simulating the logic from registration)
    const enabledToolNames = this.getEnabledToolNames(config);
    const docs: string[] = [];

    for (const name of enabledToolNames) {
      if (allTools[name]) {
        docs.push(`${name} - ${allTools[name]}`);
      }
    }

    if (docs.length === 0) {
      return 'No tools are currently enabled.';
    }

    // Group by category
    const sections = this.CATEGORY_MAP.map(cat => {
      const toolsInSection = docs.filter(docLine => {
        const [name] = docLine.split(' - ');
        return cat.prefix.test(name);
      });
      return { name: cat.name, tools: toolsInSection };
    }).filter(s => s.tools.length > 0);

    let result = '=== AVAILABLE TOOLS ===\n\n';
    for (const section of sections) {
      result += `**${section.name} (${section.tools.length})**:\n`;
      for (const toolLine of section.tools) {
        // Format as bullet points: • name - description
        const [name, desc] = toolLine.split(' - ');
        result += `  • ${name} - ${desc}\n`;
      }
      result += '\n';
    }

    return result;
  }

  /**
   * Helper to determine which tools are enabled based on config.
   */
  private static getEnabledToolNames(config: PluginConfig): string[] {
    const names: string[] = [];

    if (config.godMode) {
        // In God Mode, we'd return everything found in discoverTools(). 
        // For simplicity in this implementation, we'll rely on the category filters below.
    }

    // File System
    if (config.fileSystem || config.godMode) {
      ['list_directory', 'read_file', 'save_file', 'replace_text_in_file', 'insert_at_line', 'append_file', 'delete_lines_in_file', 'make_directory', 'move_file', 'copy_file', 'delete_path', 'delete_files_by_pattern', 'find_files', 'fuzzy_find_local_files', 'get_file_metadata', 'change_directory', 'read_document', 'analyze_project'].forEach(n => names.push(n));
    }

    // Web Search
    if (config.webSearch || config.godMode) {
      ['web_search', 'wikipedia_search', 'fetch_web_content', 'rag_web_content'].forEach(n => names.push(n));
    }

    // Browser Automation
    if (config.browserAutomation || config.godMode) {
      ['browser_open_page', 'browser_session_control', 'browser_session_close', 'preview_html', 'open_file'].forEach(n => names.push(n));
    }

    // Git
    if (config.gitOperations || config.godMode) {
      ['git_status', 'git_diff', 'git_commit', 'git_log', 'git_add', 'git_checkout', 'gh_auth', 'gh_create_issue', 'gh_list_issues', 'gh_view_comments', 'gh_create_pr', 'gh_list_prs', 'gh_view_pr_diff', 'gh_push'].forEach(n => names.push(n));
    }

    // Database
    if (config.databaseQueries || config.godMode) {
      names.push('query_database');
    }

    // Background Commands
    if (config.backgroundCommands || config.godMode) {
      ['run_background_command', 'check_background_command', 'cancel_background_command'].forEach(n => names.push(n));
    }

    // Execution
    if ((config.executionJavaScript || config.executionPython || config.executionTerminal || config.executionShell) || config.godMode) {
      ['run_javascript', 'run_python', 'execute_command', 'run_in_terminal'].forEach(n => names.push(n));
    }

    // Utilities (Always enabled)
    const utils = ['save_memory', 'get_system_info', 'read_clipboard', 'write_clipboard', 'send_notification', 'findLMStudioHome', 'get_enabled_tools', 'system_monitor', 'process_list', 'env_inspect', 'hash_file', 'token_count', 'convert_format', 'secret_scan', 'port_check', 'package_manage', 'detect_os_environment', 'json_query', 'env_update'];
    utils.forEach(n => names.push(n));

    // Return unique list
    return Array.from(new Set(names));
  }
}
