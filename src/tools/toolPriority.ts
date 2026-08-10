/**
 * Tool Priority System
 * 
 * Defines priority tiers for tools to enable intelligent filtering when the
 * tool count exceeds the configured limit. Tools are sorted by priority (highest first)
 * and then alphabetically within each tier.
 * 
 * Priority Tiers:
 * - CRITICAL (1): Core functionality that must always be present
 * - HIGH (2): Important tools used in most workflows
 * - STANDARD (3): Useful but not essential
 * - OPTIONAL (4): Specialized tools, disabled by default or low usage
 * - BACKGROUND (5): Utility/maintenance tools, lowest priority
 */

export type PriorityTier = 'critical' | 'high' | 'standard' | 'optional' | 'background';

export interface ToolPriority {
  name: string;
  tier: PriorityTier;
  category?: string;
  description?: string;
}

/**
 * Default priority assignments for all tools in the plugin.
 * 
 * CRITICAL: File system, text processing, context management (core workflow)
 * HIGH: Web research, execution tools, git operations
 * STANDARD: Browser automation, image processing, HTTP client, RAG
 * OPTIONAL: Database, document parsing, UI generation, refactoring
 * BACKGROUND: Backup, cleanup, chart generation, markdown preview, line operations
 */
export const DEFAULT_TOOL_PRIORITIES: ToolPriority[] = [
  // CRITICAL — Core workflow tools
  { name: 'read_file', tier: 'critical', category: 'fileSystem', description: 'Read file contents' },
  { name: 'save_file', tier: 'critical', category: 'fileSystem', description: 'Save file contents' },
  { name: 'append_file', tier: 'critical', category: 'fileSystem', description: 'Append to file' },
  { name: 'replace_text_in_file', tier: 'critical', category: 'fileSystem', description: 'Replace text in file' },
  { name: 'insert_at_line', tier: 'critical', category: 'fileSystem', description: 'Insert at line number' },
  { name: 'delete_lines_in_file', tier: 'critical', category: 'fileSystem', description: 'Delete lines from file' },
  { name: 'list_directory', tier: 'critical', category: 'fileSystem', description: 'List directory contents' },
  { name: 'find_files', tier: 'critical', category: 'fileSystem', description: 'Find files by pattern' },
  { name: 'grep_files', tier: 'critical', category: 'fileSystem', description: 'Search files for pattern' },
  { name: 'make_directory', tier: 'critical', category: 'fileSystem', description: 'Create directory' },
  { name: 'move_file', tier: 'critical', category: 'fileSystem', description: 'Move/rename file' },
  { name: 'copy_file', tier: 'critical', category: 'fileSystem', description: 'Copy file' },
  { name: 'delete_path', tier: 'critical', category: 'fileSystem', description: 'Delete file or directory' },
  { name: 'delete_files_by_pattern', tier: 'critical', category: 'fileSystem', description: 'Delete files by pattern' },
  { name: 'file_diff', tier: 'critical', category: 'fileSystem', description: 'Compare two files' },
  { name: 'directory_tree', tier: 'critical', category: 'fileSystem', description: 'Show directory structure' },
  { name: 'get_file_metadata', tier: 'critical', category: 'fileSystem', description: 'Get file metadata' },
  { name: 'change_directory', tier: 'critical', category: 'fileSystem', description: 'Change working directory' },
  { name: 'analyze_project', tier: 'critical', category: 'fileSystem', description: 'Analyze project structure' },
  { name: 'find_replace_all', tier: 'critical', category: 'fileSystem', description: 'Find and replace in files' },
  { name: 'read_file_chunked', tier: 'critical', category: 'fileSystem', description: 'Read large files in chunks' },
  { name: 'fuzzy_find_local_files', tier: 'critical', category: 'fileSystem', description: 'Fuzzy file search' },
  
  // HIGH — Essential workflow tools
  { name: 'web_search', tier: 'high', category: 'webResearch', description: 'Search web via DuckDuckGo' },
  { name: 'fetch_web_content', tier: 'high', category: 'webResearch', description: 'Fetch webpage content' },
  { name: 'wikipedia_search', tier: 'high', category: 'webResearch', description: 'Search Wikipedia' },
  { name: 'rag_web_content', tier: 'high', category: 'webResearch', description: 'RAG-based web search' },
  { name: 'run_javascript', tier: 'high', category: 'execution', description: 'Execute JavaScript code' },
  { name: 'run_python', tier: 'high', category: 'execution', description: 'Execute Python code' },
  { name: 'execute_command', tier: 'high', category: 'execution', description: 'Execute shell command' },
  { name: 'run_in_terminal', tier: 'high', category: 'execution', description: 'Run in terminal' },
  { name: 'run_tests', tier: 'high', category: 'execution', description: 'Run test suite' },
  { name: 'git_status', tier: 'high', category: 'git', description: 'Check git status' },
  { name: 'git_diff', tier: 'high', category: 'git', description: 'Show git diff' },
  { name: 'git_commit', tier: 'high', category: 'git', description: 'Commit changes' },
  { name: 'git_log', tier: 'high', category: 'git', description: 'View git log' },
  { name: 'git_add', tier: 'high', category: 'git', description: 'Stage files' },
  { name: 'git_checkout', tier: 'high', category: 'git', description: 'Checkout branch' },
  { name: 'git_stash', tier: 'high', category: 'git', description: 'Stash changes' },
  { name: 'git_blame', tier: 'high', category: 'git', description: 'Show blame info' },
  { name: 'gh_create_issue', tier: 'high', category: 'gitHub', description: 'Create GitHub issue' },
  { name: 'gh_list_issues', tier: 'high', category: 'gitHub', description: 'List GitHub issues' },
  { name: 'gh_view_comments', tier: 'high', category: 'gitHub', description: 'View issue comments' },
  { name: 'gh_create_pr', tier: 'high', category: 'gitHub', description: 'Create pull request' },
  { name: 'gh_list_prs', tier: 'high', category: 'gitHub', description: 'List pull requests' },
  { name: 'gh_view_pr_diff', tier: 'high', category: 'gitHub', description: 'View PR diff' },
  { name: 'gh_push', tier: 'high', category: 'gitHub', description: 'Push to GitHub' },
  { name: 'check_gh_auth', tier: 'high', category: 'gitHub', description: 'Check GitHub auth' },
  
  // STANDARD — Useful but not essential
  { name: 'browser_open_page', tier: 'standard', category: 'browser', description: 'Open web page' },
  { name: 'browser_session_control', tier: 'standard', category: 'browser', description: 'Control browser session' },
  { name: 'browser_session_close', tier: 'standard', category: 'browser', description: 'Close browser session' },
  { name: 'preview_html', tier: 'standard', category: 'browser', description: 'Preview HTML' },
  { name: 'open_file', tier: 'standard', category: 'browser', description: 'Open file in browser' },
  { name: 'run_background_command', tier: 'standard', category: 'backgroundCommands', description: 'Run background command' },
  { name: 'check_background_command', tier: 'standard', category: 'backgroundCommands', description: 'Check background command' },
  { name: 'cancel_background_command', tier: 'standard', category: 'backgroundCommands', description: 'Cancel background command' },
  { name: 'image_to_text', tier: 'standard', category: 'imageProcessing', description: 'OCR image text' },
  { name: 'describe_image', tier: 'standard', category: 'imageProcessing', description: 'Describe image' },
  { name: 'screenshot_desktop', tier: 'standard', category: 'imageProcessing', description: 'Take screenshot' },
  { name: 'compare_images', tier: 'standard', category: 'imageProcessing', description: 'Compare images' },
  { name: 'http_request', tier: 'standard', category: 'httpClient', description: 'HTTP request' },
  { name: 'http_get_json', tier: 'standard', category: 'httpClient', description: 'HTTP GET JSON' },
  { name: 'http_post_json', tier: 'standard', category: 'httpClient', description: 'HTTP POST JSON' },
  { name: 'rag_index_files', tier: 'standard', category: 'vectorRAG', description: 'Index files for RAG' },
  { name: 'rag_query_vector', tier: 'standard', category: 'vectorRAG', description: 'Query vector index' },
  { name: 'rag_clear_index', tier: 'standard', category: 'vectorRAG', description: 'Clear RAG index' },
  { name: 'query_database', tier: 'standard', category: 'database', description: 'Query database' },
  { name: 'read_document', tier: 'standard', category: 'document', description: 'Read document' },
  { name: 'generate_chart', tier: 'standard', category: 'dataVisualization', description: 'Generate chart' },
  { name: 'refactor_code', tier: 'standard', category: 'refactorCode', description: 'Refactor code' },
  { name: 'unusedImports', tier: 'standard', category: 'refactorCode', description: 'Clean unused imports' },
  { name: 'text_transform', tier: 'standard', category: 'textProcessing', description: 'Transform text' },
  { name: 'text_extract', tier: 'standard', category: 'textProcessing', description: 'Extract text fields' },
  { name: 'line_operations', tier: 'standard', category: 'textProcessing', description: 'Line operations' },
  { name: 'markdown_table_gen', tier: 'standard', category: 'textProcessing', description: 'Generate markdown table' },
  { name: 'generate_ui_component', tier: 'standard', category: 'uiGeneration', description: 'Generate UI component' },
  { name: 'render_and_preview_ui', tier: 'standard', category: 'uiGeneration', description: 'Render UI preview' },
  { name: 'extract_ui_data', tier: 'standard', category: 'uiGeneration', description: 'Extract UI data' },
  
  // OPTIONAL — Specialized or low-usage tools
  { name: 'auto_summarize_context', tier: 'optional', category: 'contextManagement', description: 'Auto-summarize context' },
  { name: 'get_context_memory', tier: 'optional', category: 'contextManagement', description: 'Get context memory' },
  { name: 'search_context', tier: 'optional', category: 'contextManagement', description: 'Search context' },
  { name: 'context_summary', tier: 'optional', category: 'contextManagement', description: 'Get context summary' },
  { name: 'delete_context_entry', tier: 'optional', category: 'contextManagement', description: 'Delete context entry' },
  { name: 'clear_context_memory', tier: 'optional', category: 'contextManagement', description: 'Clear context memory' },
  { name: 'track_important_event', tier: 'optional', category: 'contextManagement', description: 'Track important event' },
  { name: 'save_session_summary', tier: 'optional', category: 'contextManagement', description: 'Save session summary' },
  { name: 'get_session_summary', tier: 'optional', category: 'contextManagement', description: 'Get session summary' },
  { name: 'save_memory', tier: 'optional', category: 'contextManagement', description: 'Save memory' },
  { name: 'get_memory', tier: 'optional', category: 'contextManagement', description: 'Get memory' },
  { name: 'delete_memory', tier: 'optional', category: 'contextManagement', description: 'Delete memory' },
  
  // BACKGROUND — Utility/maintenance tools
  { name: 'create_backup', tier: 'background', category: 'backup', description: 'Create backup' },
  { name: 'list_backups', tier: 'background', category: 'backup', description: 'List backups' },
  { name: 'restore_backup', tier: 'background', category: 'backup', description: 'Restore backup' },
  { name: 'delete_backup', tier: 'background', category: 'backup', description: 'Delete backup' },
  { name: 'cleanup_backups', tier: 'background', category: 'backup', description: 'Cleanup backups' },
  { name: 'markdown_preview', tier: 'background', category: 'markdownPreview', description: 'Preview markdown' },
  { name: 'delete_lines', tier: 'background', category: 'lineOperations', description: 'Delete lines' },
];

/**
 * Priority tier numeric values for sorting (lower = higher priority)
 */
export const PRIORITY_TIER_VALUES: Record<PriorityTier, number> = {
  critical: 1,
  high: 2,
  standard: 3,
  optional: 4,
  background: 5,
};

/**
 * Get the priority for a tool by name
 */
export function getToolPriority(toolName: string): ToolPriority | undefined {
  return DEFAULT_TOOL_PRIORITIES.find(t => t.name === toolName);
}

/**
 * Sort tools by priority (highest first), then alphabetically within each tier
 */
export function sortToolsByPriority(tools: { name: string }[]): typeof tools {
  return [...tools].sort((a, b) => {
    const priorityA = getToolPriority(a.name);
    const priorityB = getToolPriority(b.name);
    
    const tierValueA = priorityA ? PRIORITY_TIER_VALUES[priorityA.tier] : 3; // default to standard
    const tierValueB = priorityB ? PRIORITY_TIER_VALUES[priorityB.tier] : 3;
    
    if (tierValueA !== tierValueB) {
      return tierValueA - tierValueB;
    }
    
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filter tools by priority tier
 */
export function filterToolsByPriority(tools: { name: string }[], maxTier: PriorityTier): typeof tools {
  const maxTierValue = PRIORITY_TIER_VALUES[maxTier];
  
  return tools.filter(tool => {
    const priority = getToolPriority(tool.name);
    if (!priority) return true; // Keep tools not in priority list
    return PRIORITY_TIER_VALUES[priority.tier] <= maxTierValue;
  });
}

/**
 * Get tools that will be filtered out given a limit
 */
export function getFilteredTools(tools: { name: string }[], limit: number): { name: string }[] {
  const sorted = sortToolsByPriority(tools);
  if (sorted.length <= limit) {
    return [];
  }
  return sorted.slice(limit);
}

/**
 * Get tools that will be kept given a limit
 */
export function getRetainedTools(tools: { name: string }[], limit: number): { name: string }[] {
  const sorted = sortToolsByPriority(tools);
  return sorted.slice(0, limit);
}

/**
 * Generate a human-readable report of which tools would be filtered
 */
export function generateFilterReport(tools: { name: string }[], limit: number): string {
  const sorted = sortToolsByPriority(tools);
  const retained = sorted.slice(0, limit);
  const filtered = sorted.slice(limit);
  
  let report = `\n📊 Tool Filtering Report (limit: ${limit})\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `Total tools: ${tools.length}\n`;
  report += `Retained: ${retained.length}\n`;
  report += `Filtered: ${filtered.length}\n\n`;
  
  // Group filtered tools by tier
  const filteredByTier: Record<string, string[]> = {};
  filtered.forEach(tool => {
    const priority = getToolPriority(tool.name);
    const tier = priority ? priority.tier : 'unknown';
    if (!filteredByTier[tier]) {
      filteredByTier[tier] = [];
    }
    filteredByTier[tier].push(tool.name);
  });
  
  for (const [tier, toolNames] of Object.entries(filteredByTier)) {
    report += `🔻 ${tier.toUpperCase()} tier filtered:\n`;
    toolNames.forEach(name => {
      const priority = getToolPriority(name);
      const desc = priority?.description || '';
      report += `  • ${name}${desc ? ` (${desc})` : ''}\n`;
    });
    report += `\n`;
  }
  
  return report;
}

/**
 * Hub-Exclusion Clustering Integration for Tool Priority Ranking
 * 
 * Enhances priority sorting with cluster-awareness: tools in high-centrality
 * clusters (architecturally important) receive a slight priority boost, while
 * isolated tools remain at their base tier.
 */

import type { HubExclusionResult } from '../utils/hubExclusionClustering.js';
import { generateClusteringReport } from '../utils/hubExclusionClustering.js';

/**
 * Category-to-module mapping for centrality scoring.
 * Maps each tool category to the corresponding source file(s) in the plugin.
 * Supports both bare names and path-prefixed variants (e.g., "tools/fileSystemTools.ts").
 */
const CATEGORY_TO_MODULE: Record<string, string | readonly string[]> = {
  fileSystem: ['fileSystemTools.ts', 'tools/fileSystemTools.ts'],
  webResearch: ['webResearchTools.ts', 'tools/webResearchTools.ts'],
  browser: ['browserAutomationTools.ts', 'tools/browserAutomationTools.ts'],
  git: ['gitGithubTools.ts', 'tools/gitGithubTools.ts'],
  gitHub: ['gitGithubTools.ts', 'tools/gitGithubTools.ts'],
  database: ['databaseTools.ts', 'tools/databaseTools.ts'],
  document: ['documentTools.ts', 'tools/documentTools.ts'],
  backgroundCommands: ['backgroundCommandTools.ts', 'tools/backgroundCommandTools.ts'],
  execution: ['executionTools.ts', 'tools/executionTools.ts'],
  imageProcessing: ['imageProcessingTools.ts', 'tools/imageProcessingTools.ts'],
  httpClient: ['httpClientTools.ts', 'tools/httpClientTools.ts'],
  vectorRAG: ['vectorRagTools.ts', 'tools/vectorRagTools.ts'],
  textProcessing: ['textProcessingTools.ts', 'tools/textProcessingTools.ts'],
  uiGeneration: ['uiGenerationTools.ts', 'tools/uiGenerationTools.ts'],
  contextManagement: ['contextManagementTools.ts', 'tools/contextManagementTools.ts'],
  refactorCode: ['refactorCodeTools.ts', 'tools/refactorCodeTools.ts'],
  dataVisualization: ['dataVisualizationTools.ts', 'tools/dataVisualizationTools.ts'],
  backup: ['backupTools.ts', 'tools/backupTools.ts'],
  markdownPreview: ['markdownPreviewTools.ts', 'tools/markdownPreviewTools.ts'],
  lineOperations: ['lineOperations.ts', 'tools/lineOperations.ts'],
};

/**
 * Extended tool priority with cluster-aware scoring.
 */
export interface ClusterAwarePriority extends ToolPriority {
  /** Module degree (number of dependencies/connections) */
  moduleDegree?: number;
  /** Whether this tool's module is identified as a hub */
  isHub?: boolean;
  /** Assigned cluster ID from Hub-Exclusion clustering */
  clusterId?: number;
  /** Centrality score [0-1] — higher = more architecturally important */
  centralityScore?: number;
}

/**
 * Compute centrality scores for all tools based on their module's graph position.
 * 
 * Centrality = (moduleDegree / maxDegree) × hubBonus, where:
 * - hubBonus = 1.5 if the module is a hub
 * - hubBonus = 1.0 otherwise
 */
export function computeCentralityScores(
  tools: ToolPriority[],
  clusteringResult: HubExclusionResult
): Map<string, number> {
  const maxDegree = Math.max(...clusteringResult.nodes.map(n => n.degree), 1);
  
  // Build hub set for quick lookup
  const hubSet = new Set(clusteringResult.hubs);

  const centralityScores = new Map<string, number>();

  for (const tool of tools) {
    // Find the module node corresponding to this tool's category
    const moduleNames = CATEGORY_TO_MODULE[tool.category || ''];
    
    let matchingNode: typeof clusteringResult.nodes[number] | undefined;
    
    if (moduleNames) {
      // Try each possible name variant (e.g., both bare and path-prefixed)
      const names = Array.isArray(moduleNames) ? moduleNames : [moduleNames];
      for (const name of names) {
        matchingNode = clusteringResult.nodes.find(n => n.id === name);
        if (matchingNode) break;
      }
    }
    
    if (!matchingNode) {
      centralityScores.set(tool.name, 0); // No graph data → baseline score
      continue;
    }

    const degreeRatio = matchingNode.degree / maxDegree;
    const hubBonus = hubSet.has(matchingNode.id) ? 1.5 : 1.0;
    
    centralityScores.set(tool.name, Math.min(degreeRatio * hubBonus, 1));
  }

  return centralityScores;
}

/**
 * Sort tools by priority tier + cluster-awareness.
 * 
 * Within each tier, tools are sorted by:
 * 1. Centrality score (descending) — more connected modules first
 * 2. Alphabetical name (ascending) — for deterministic ordering
 */
export function sortToolsByClusterAwarePriority(
  tools: { name: string }[],
  clusteringResult?: HubExclusionResult
): typeof tools {
  if (!clusteringResult || clusteringResult.nodes.length === 0) {
    // Fallback to standard priority sorting if no clustering data available
    return sortToolsByPriority(tools);
  }

  const centralityScores = computeCentralityScores(DEFAULT_TOOL_PRIORITIES, clusteringResult);

  return [...tools].sort((a, b) => {
    const priorityA = getToolPriority(a.name);
    const priorityB = getToolPriority(b.name);
    
    const tierValueA = priorityA ? PRIORITY_TIER_VALUES[priorityA.tier] : 3;
    const tierValueB = priorityB ? PRIORITY_TIER_VALUES[priorityB.tier] : 3;
    
    if (tierValueA !== tierValueB) {
      return tierValueA - tierValueB; // Primary sort by tier
    }

    // Secondary sort: centrality score (descending), then alphabetical
    const scoreA = centralityScores.get(a.name) ?? 0;
    const scoreB = centralityScores.get(b.name) ?? 0;
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher centrality first
    }

    return a.name.localeCompare(b.name);
  });
}

/**
 * Generate a cluster-aware tool filtering report.
 */
export function generateClusterAwareFilterReport(
  tools: { name: string }[],
  limit: number,
  clusteringResult?: HubExclusionResult
): string {
  const sorted = sortToolsByClusterAwarePriority(tools, clusteringResult);
  const retained = sorted.slice(0, limit);
  const filtered = sorted.slice(limit);

  let report = `\n🔗 Cluster-Aware Tool Filtering Report (limit: ${limit})\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `Total tools: ${tools.length}\n`;
  report += `Retained: ${retained.length}\n`;
  report += `Filtered: ${filtered.length}\n\n`;

  if (clusteringResult) {
    report += generateClusteringReport(clusteringResult);
    report += '\n';
  }

  // Group filtered tools by tier and cluster
  const filteredByTierAndCluster = new Map<string, string[]>();
  
  for (const tool of filtered) {
    const priority = getToolPriority(tool.name);
    const tier = priority ? priority.tier : 'unknown';
    const key = `${tier}`;
    
    if (!filteredByTierAndCluster.has(key)) {
      filteredByTierAndCluster.set(key, []);
    }
    const tierList = filteredByTierAndCluster.get(key);
    if (tierList) tierList.push(tool.name);
  }

  for (const [tier, toolNames] of filteredByTierAndCluster.entries()) {
    report += `🔻 ${tier.toUpperCase()} tier filtered:\n`;
    toolNames.forEach(name => {
      const priority = getToolPriority(name);
      const desc = priority?.description || '';
      const centrality = clusteringResult ? computeCentralityScores(DEFAULT_TOOL_PRIORITIES, clusteringResult).get(name) ?? 0 : 0;
      report += `  • ${name}${desc ? ` (${desc})` : ''} | centrality: ${centrality.toFixed(2)}\n`;
    });
    report += '\n';
  }

  return report;
}
