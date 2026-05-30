/**
 * Tools Provider - Complete Implementation of all ~45 tools across 6 categories
 */

import type { Tool, ToolsProviderController } from '@lmstudio/sdk';

// Import existing modules
import type { PluginConfig } from './config';
import { DEFAULT_CONFIG, isToolEnabled, isExecutionToolEnabled, configSchematics } from './config';
import { StateManager } from './stateManager';
import { BackgroundCommandManager } from './backgroundCommands';

// Import category-specific tool modules
import { registerFileSystemTools } from './tools/fileSystemTools';
import { registerWebResearchTools } from './tools/webResearchTools';
import { registerGitTools } from './tools/gitGithubTools';
import { registerBrowserTools } from './tools/browserAutomationTools';
import { registerDatabaseTools } from './tools/databaseTools';
import { registerBackgroundCommandTools } from './tools/backgroundCommandTools';
import { registerExecutionTools } from './tools/executionTools';
import { registerUtilityTools, registerGetCurrentWorkingDirectoryTool } from './tools/utilityTools';
import { registerImageProcessingTools } from './tools/imageProcessingTools';
import { registerHttpClientTools } from './tools/httpClientTools';
import { registerRagTools } from './tools/vectorRagTools';
import { registerUiGenerationTools } from './tools/uiGenerationTools';
import { registerContextManagementTools } from './tools/contextManagementTools';
import { registerDocumentTools } from './tools/documentTools';
import { registerBackupTools } from './tools/backupTools';

// ==================== TYPES ====================

export interface ToolCategory {
  name: string;
  tools: Tool[];
}

/** Extended tool type with typed implementation for safe access */
type TypedTool = Tool & {
  implementation: (params: Record<string, unknown>, ctx?: unknown) => Promise<unknown>;
};

// Global config reference to ensure toolsProvider uses the latest user settings
let currentConfig: PluginConfig = DEFAULT_CONFIG;

/**
 * Central registry for all available tools.
 * Tools are created once at module load time and reused across provider calls.
 */
class ToolRegistry {
  private toolMap = new Map<string, TypedTool>();

  registerAll(config: PluginConfig, stateManager: StateManager, backgroundCommandManager: BackgroundCommandManager, lmClient?: any): void {
    if (config.godMode || isToolEnabled(config, 'fileSystem')) {
      registerFileSystemTools(config, stateManager).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'webSearch')) {
      registerWebResearchTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'browserAutomation')) {
      registerBrowserTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'gitOperations')) {
      registerGitTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'databaseQueries')) {
      registerDatabaseTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'documentParsing')) {
      registerDocumentTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'backgroundCommands')) {
      registerBackgroundCommandTools(config, backgroundCommandManager).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }

    // ── 🆕 NEW TOOL CATEGORIES ──────────────────────────────────────
    if (config.godMode || isToolEnabled(config, 'imageProcessing')) {
      registerImageProcessingTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'httpClient')) {
      registerHttpClientTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'vectorRAG')) {
      registerRagTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'uiGeneration')) {
      registerUiGenerationTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    if (config.godMode || isToolEnabled(config, 'contextManagement')) {
      registerContextManagementTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    }
    // Backup tools — always available (no toggle needed)
    registerBackupTools(config).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    
    // Execution tools — registered once, filtered by enabled tool types
    const execConfig = { ...config };
    const allExecTools = registerExecutionTools(execConfig);
    
    if (isExecutionToolEnabled(execConfig, 'javascript')) {
      const jsTool = allExecTools.find(t => t.name === 'run_javascript');
      if (jsTool) this.toolMap.set(jsTool.name, jsTool as TypedTool);
    }
    if (isExecutionToolEnabled(execConfig, 'python')) {
      const pyTool = allExecTools.find(t => t.name === 'run_python');
      if (pyTool) this.toolMap.set(pyTool.name, pyTool as TypedTool);
    }
    if (isExecutionToolEnabled(execConfig, 'terminal')) {
      const termTool = allExecTools.find(t => t.name === 'run_in_terminal');
      if (termTool) this.toolMap.set(termTool.name, termTool as TypedTool);
    }
    if (isExecutionToolEnabled(execConfig, 'shell')) {
      const shellTool = allExecTools.find(t => t.name === 'execute_command');
      if (shellTool) this.toolMap.set(shellTool.name, shellTool as TypedTool);
    }
    
    // Utility tools are always registered (no specific config flag)
    const getEnabledTools = () => Array.from(this.toolMap.keys());
    registerUtilityTools(config, stateManager, getEnabledTools).forEach(t => this.toolMap.set(t.name, t as TypedTool));
    
    // Register current working directory query tool (always available)
    registerGetCurrentWorkingDirectoryTool().forEach(t => this.toolMap.set(t.name, t as TypedTool));
  }

  getAll(): Tool[] {
    return Array.from(this.toolMap.values());
  }

  get(name: string): TypedTool | undefined {
    return this.toolMap.get(name);
  }

  has(name: string): boolean {
    return this.toolMap.has(name);
  }
}

/**
 * Manages tool execution and state updates.
 */
export class ToolsProvider {
  private config: PluginConfig;
  private stateManager: StateManager;
  private backgroundCommandManager: BackgroundCommandManager;
  private registry: ToolRegistry;

  constructor(config?: PluginConfig, lmClient?: any) {
    this.config = config || DEFAULT_CONFIG;
    this.stateManager = new StateManager(this.config);
    this.backgroundCommandManager = new BackgroundCommandManager(this.config);
    this.registry = new ToolRegistry();
    this.registry.registerAll(this.config, this.stateManager, this.backgroundCommandManager, lmClient);
  }

  /**
   * Execute a tool by name with parameters.
   */
  async executeTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this.registry.get(toolName);
    if (!tool) {
      return { success: false, error: `Tool '${toolName}' not found` };
    }

    try {
      // Safe access via typed wrapper (C4 fix)
      const impl = tool.implementation;
      const result = await impl(params);
      
      // Update state with execution result
      this.stateManager.set(`last_${toolName}`, result);
      
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Tool execution failed: ${message}` };
    }
  }

  /**
   * Get all available tools filtered by config.
   */
  getAvailableTools(): Tool[] {
    return this.registry.getAll();
  }

  /**
   * Get the state manager instance.
   */
  getStateManager(): StateManager {
    return this.stateManager;
  }

  /**
   * Get the current configuration.
   */
  getConfig(): PluginConfig {
    return this.config;
  }
}

/**
 * Factory function to create a ToolsProvider with default config.
 */
export function createToolsProvider(config?: PluginConfig): ToolsProvider {
  return new ToolsProvider(config);
}

// ==================== SDK PROVIDER FUNCTION ====================

/**
 * Main tools provider function for LM Studio SDK.
 * This is the entry point that gets called by LM Studio.
 * 
 * IMPORTANT: The LM Studio SDK automatically registers all Tool objects
 * returned from this provider function. No manual ctl.add() calls needed -
 * just return the array directly and the SDK handles registration.
 * 
 * NOTE: Must be async — SDK type requires Promise<Tool[]>.
 */
export async function toolsProvider(ctl: ToolsProviderController, lmClient?: any): Promise<Tool[]> {
  // FIX: Read configuration dynamically from UI controller (like beledarians plugin)
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  
  // Construct a live config object from the UI state
  const liveConfig: PluginConfig = {
    fileSystem: pluginConfig.get('fileSystem'),
    webSearch: pluginConfig.get('webSearch'),
    browserAutomation: pluginConfig.get('browserAutomation'),
    gitOperations: pluginConfig.get('gitOperations'),
    databaseQueries: pluginConfig.get('databaseQueries'),
    documentParsing: pluginConfig.get('documentParsing'),
    backgroundCommands: pluginConfig.get('backgroundCommands'),
    imageProcessing: pluginConfig.get('imageProcessing'),
    httpClient: pluginConfig.get('httpClient'),
    vectorRAG: pluginConfig.get('vectorRAG'),
    uiGeneration: pluginConfig.get('uiGeneration'),
    contextManagement: pluginConfig.get('contextManagement'),
    godMode: pluginConfig.get('godMode'),
    documentRAG: pluginConfig.get('documentRAG'),
    retrievalLimit: pluginConfig.get('retrievalLimit'),
    retrievalAffinityThreshold: pluginConfig.get('retrievalAffinityThreshold'),
    executionJavaScript: pluginConfig.get('executionJavaScript'),
    executionPython: pluginConfig.get('executionPython'),
    executionTerminal: pluginConfig.get('executionTerminal'),
    executionShell: pluginConfig.get('executionShell'),
    searchFallbackChain: pluginConfig.get('searchFallbackChain') as 'ddg-api' | 'ddg-fetch' | 'google' | 'bing',
    maxSearchResults: pluginConfig.get('maxSearchResults'),
    safesearch: pluginConfig.get('safesearch') as '0' | '1' | '2',
    browserTimeout: pluginConfig.get('browserTimeout'),
    headlessMode: pluginConfig.get('headlessMode'),
    gitAutoCommit: pluginConfig.get('gitAutoCommit'),
    defaultBranch: pluginConfig.get('defaultBranch'),
    pathValidationEnabled: pluginConfig.get('pathValidationEnabled'),
    binaryFileDetection: pluginConfig.get('binaryFileDetection'),
    regexReDoSProtection: pluginConfig.get('regexReDoSProtection'),
    maxRegexLength: pluginConfig.get('maxRegexLength'),
    statePersistenceEnabled: pluginConfig.get('statePersistenceEnabled'),
    stateMaxSize: pluginConfig.get('stateMaxSize'),
    language: pluginConfig.get('language') as 'en' | 'de' | 'zh-CN' | 'zh-TW',
    notificationsEnabled: pluginConfig.get('notificationsEnabled'),
    temporalAwareness: pluginConfig.get('temporalAwareness'),
    dateFormatStyle: pluginConfig.get('dateFormatStyle') as 'standard' | 'heuteIst',
    // ContextGuard settings
    contextGuardEnabled: pluginConfig.get('contextGuardEnabled'),
    contextGuardTokenLimit: pluginConfig.get('contextGuardTokenLimit'),
    contextGuardSmartReading: pluginConfig.get('contextGuardSmartReading'),
    contextGuardSummaryModel: pluginConfig.get('contextGuardSummaryModel'),
    contextGuardTerminalFilterEnabled: pluginConfig.get('contextGuardTerminalFilterEnabled'),
    contextGuardTerminalFilterLength: pluginConfig.get('contextGuardTerminalFilterLength'),
    // Auto-tracking settings
    autoTrackingEnabled: pluginConfig.get('autoTrackingEnabled'),
    autoTrackDecisions: pluginConfig.get('autoTrackDecisions'),
    autoTrackCompletions: pluginConfig.get('autoTrackCompletions'),
    autoTrackErrors: pluginConfig.get('autoTrackErrors'),
    autoSummaryInterval: pluginConfig.get('autoSummaryInterval'),
  };

  const provider = createToolsProvider(liveConfig);
  
  // Return all available tools - SDK automatically registers them
  return provider.getAvailableTools();
}

/**
 * Update the global configuration reference.
 * Call this from main() to ensure toolsProvider uses the latest user settings.
 */
export function updateGlobalConfig(config: PluginConfig): void {
  currentConfig = config;
}
