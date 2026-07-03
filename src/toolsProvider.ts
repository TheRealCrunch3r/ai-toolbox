/**
 * Tools Provider — Optimized with lazy module loading (P0) and registry caching (P1)
 */

import type { Tool, ToolsProviderController } from '@lmstudio/sdk';

// Import existing modules
import type { PluginConfig } from './config';
import { DEFAULT_CONFIG, isToolEnabled, isExecutionToolEnabled, configSchematics } from './config';
import { StateManager } from './stateManager';
import { BackgroundCommandManager } from './backgroundCommands';

// ==================== P0: LAZY MODULE RESOLVER MAP ====================
const REGISTER_MAP: Record<string, () => Promise<{ registerFileSystemTools: (c: PluginConfig) => Tool[] } | { registerWebResearchTools: (c: PluginConfig) => Tool[] } | { registerBrowserTools: (c: PluginConfig) => Tool[] } | { registerGitTools: (c: PluginConfig) => Tool[] } | { registerDatabaseTools: (c: PluginConfig) => Tool[] } | { registerDocumentTools: (c: PluginConfig) => Tool[] } | { registerBackgroundCommandTools: (c: PluginConfig, b: BackgroundCommandManager) => Tool[] } | { registerImageProcessingTools: (c: PluginConfig) => Tool[] } | { registerHttpClientTools: (c: PluginConfig) => Tool[] } | { registerRagTools: (c: PluginConfig) => Tool[] } | { registerTextProcessingTools: (c: PluginConfig) => Tool[] } | { registerUiGenerationTools: (c: PluginConfig) => Tool[] } | { registerContextManagementTools: (c: PluginConfig) => Tool[] }>> = {
  fileSystem:      () => import('./tools/fileSystemTools.js').then(m => m.registerFileSystemTools as never),
  webSearch:       () => import('./tools/webResearchTools.js').then(m => m.registerWebResearchTools as never),
  browserAutomation: () => import('./tools/browserAutomationTools.js').then(m => m.registerBrowserTools as never),
  gitOperations:   () => import('./tools/gitHubTools.js').then(m => m.registerGitTools as never),
  databaseQueries: () => import('./tools/databaseTools.js').then(m => m.registerDatabaseTools as never),
  documentParsing: () => import('./tools/documentTools.js').then(m => m.registerDocumentTools as never),
  backgroundCommands: () => import('./tools/backgroundCommandTools.js').then(m => m.registerBackgroundCommandTools as never),
  imageProcessing: () => import('./tools/imageProcessingTools.js').then(m => m.registerImageProcessingTools as never),
  httpClient:      () => import('./tools/httpClientTools.js').then(m => m.registerHttpClientTools as never),
  vectorRAG:       () => import('./tools/vectorRagTools.js').then(m => m.registerRagTools as never),
  textProcessing:  () => import('./tools/textProcessingTools.js').then(m => m.registerTextProcessingTools as never),
  uiGeneration:    () => import('./tools/uiGenerationTools.js').then(m => m.registerUiGenerationTools as never),
  contextManagement: () => import('./tools/contextManagementTools.js').then(m => m.registerContextManagementTools as never),
};

// Execution tools loaded dynamically too — their individual flags filter what gets registered

// Utility / line-ops / backup are always loaded but resolved lazily on first use

/** Minimal config-hash for cache invalidation */
function hashConfig(cfg: PluginConfig): string {
  return `${cfg.godMode}_${cfg.fileSystem}_${cfg.webSearch}_${cfg.browserAutomation}_${cfg.gitOperations}_${cfg.databaseQueries}_${cfg.documentParsing}_${cfg.backgroundCommands}_${cfg.imageProcessing}_${cfg.httpClient}_${cfg.vectorRAG}_${cfg.textProcessing}_${cfg.uiGeneration}_${cfg.contextManagement}_${cfg.executionJavaScript}_${cfg.executionPython}_${cfg.executionTerminal}_${cfg.executionShell}`;
}

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _currentConfig: PluginConfig = DEFAULT_CONFIG;

/**
 * Central registry for all available tools.
 * Tools are now loaded lazily (P0) and cached across provider calls (P1).
 */
class ToolRegistry {
  private toolMap = new Map<string, TypedTool>();
  private _isLoaded = false;
  private _loadPromise: Promise<void> | null = null;

  /** Lazily loads all enabled tools on first access */
  async ensureLoad(config: PluginConfig, stateManager: StateManager, bgCommandManager: BackgroundCommandManager): Promise<void> {
    if (this._isLoaded) return; // already loaded — no-op

    this._loadPromise = (async () => {
      for (const [category, resolver] of Object.entries(REGISTER_MAP)) {
        const categoryKey = category as 'fileSystem' | 'webSearch' | 'browserAutomation' | 'gitOperations' | 'databaseQueries' | 'documentParsing' | 'backgroundCommands' | 'imageProcessing' | 'httpClient' | 'vectorRAG' | 'uiGeneration' | 'contextManagement' | 'textProcessing';
        const enabled = config.godMode || isToolEnabled(config, categoryKey);
        if (!enabled) continue;

        try {
          const registrarRaw = await resolver();
          // Cast because REGISTER_MAP stores discriminated unions; we access the right key at runtime via category name
          const registrar = registrarRaw as never as (c: PluginConfig, s?: StateManager, b?: BackgroundCommandManager) => Tool[];
          registrar(config, stateManager, bgCommandManager).forEach((t: Tool) => this.toolMap.set(t.name, t as TypedTool));
        } catch (err) {
          console.error(`[ToolsProvider] Failed to load tools for category '${category}':`, err);
        }
      }

      // Load line operations (always available — no toggle)
      const LineOpsRegistrar = await import('./tools/lineOperations.js').then(m => m.registerLineOperationsTools);
      LineOpsRegistrar(config).forEach((t: Tool) => this.toolMap.set(t.name, t as TypedTool));

      // Load backup tools (always available — no toggle)
      const BackupRegistrar = await import('./tools/backupTools.js').then(m => m.registerBackupTools);
      BackupRegistrar(config).forEach((t: Tool) => this.toolMap.set(t.name, t as TypedTool));

      // Execution tools — filtered by individual enable flags
      if (config.executionJavaScript || config.executionPython || config.executionTerminal || config.executionShell) {
        const ExecRegistrar = await import('./tools/executionTools.js').then(m => m.registerExecutionTools);
        const allExecTools = ExecRegistrar(config);

        if (isExecutionToolEnabled(config, 'javascript')) {
          const jsTool = allExecTools.find((t: Tool) => t.name === 'run_javascript');
          if (jsTool) this.toolMap.set(jsTool.name, jsTool as TypedTool);
        }
        if (isExecutionToolEnabled(config, 'python')) {
          const pyTool = allExecTools.find((t: Tool) => t.name === 'run_python');
          if (pyTool) this.toolMap.set(pyTool.name, pyTool as TypedTool);
        }
        if (isExecutionToolEnabled(config, 'terminal')) {
          const termTool = allExecTools.find((t: Tool) => t.name === 'run_in_terminal');
          if (termTool) this.toolMap.set(termTool.name, termTool as TypedTool);
        }
        if (isExecutionToolEnabled(config, 'shell')) {
          const shellTool = allExecTools.find((t: Tool) => t.name === 'execute_command');
          if (shellTool) this.toolMap.set(shellTool.name, shellTool as TypedTool);
        }
      }

      // Utility tools are always registered (no specific config flag) — lazy loaded on first call
      const getEnabledTools = () => Array.from(this.toolMap.keys());
      const UtilityRegistrar = await import('./tools/utilityTools.js').then(m => m.registerUtilityTools);
      UtilityRegistrar(config, stateManager, getEnabledTools).forEach((t: Tool) => this.toolMap.set(t.name, t as TypedTool));

      this._isLoaded = true;
    })();

    return this._loadPromise;
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

  constructor(config?: PluginConfig, _lmClient?: unknown) {
    this.config = config || DEFAULT_CONFIG;
    this.stateManager = new StateManager(this.config);
    this.backgroundCommandManager = new BackgroundCommandManager(this.config);
    this.registry = new ToolRegistry();
  }

  /**
   * Execute a tool by name with parameters.
   */
  async executeTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    // Ensure tools are loaded first (lazy load on first call)
    await this.registry.ensureLoad(this.config, this.stateManager, this.backgroundCommandManager);

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
  /** P1: Allow toolsProvider() to access cached registry internals */
  get stateManagerForCache(): StateManager { return this.stateManager; }
  get bgCommandManagerForCache(): BackgroundCommandManager { return this.backgroundCommandManager; }

  /** P1: Allow toolsProvider() to access the internal ToolRegistry */
  get registryForP1(): ToolRegistry { return this.registry; }
  async getAvailableTools(): Promise<Tool[]> {
    // Ensure lazy load on first call to getAvailableTools too
    await this.registry.ensureLoad(this.config, this.stateManager, this.backgroundCommandManager);
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

// ==================== P1: REGISTRY CACHING (toolsProvider) ====================

let cachedRegistry: ToolRegistry | null = null;
let lastConfigHash = '';

/**
 * Main tools provider function for LM Studio SDK.
 * This is the entry point that gets called by LM Studio.
 *
 * IMPORTANT: The LM Studio SDK automatically registers all Tool objects
 * returned from this provider function. No manual ctl.add() calls needed -
 * just return the array directly and the SDK handles registration.
 *
 * NOTE: Must be async — SDK type requires Promise<Tool[]> .
 */
export async function toolsProvider(ctl: ToolsProviderController, _lmClient?: unknown): Promise<Tool[]> {
  // Read configuration dynamically from UI controller (like beledarians plugin)
  const pluginConfig = ctl.getPluginConfig(configSchematics);

  // Construct a live config object from the UI state
  const liveConfig: PluginConfig = {
    fileSystem: pluginConfig.get('fileSystem'),
    webSearch: pluginConfig.get('webSearch'),
    browserAutomation: pluginConfig.get('browserAutomation'),
    gitOperations: pluginConfig.get('gitOperations'),
    packageManage: pluginConfig.get('packageManage'),
    databaseQueries: pluginConfig.get('databaseQueries'),
    documentParsing: pluginConfig.get('documentParsing'),
    backgroundCommands: pluginConfig.get('backgroundCommands'),
    imageProcessing: pluginConfig.get('imageProcessing'),
    httpClient: pluginConfig.get('httpClient'),
    vectorRAG: pluginConfig.get('vectorRAG'),
    uiGeneration: pluginConfig.get('uiGeneration'),
    contextManagement: pluginConfig.get('contextManagement'),
    textProcessing: pluginConfig.get('textProcessing'),
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
    autoTrackTokenThreshold: pluginConfig.get('autoTrackTokenThreshold'),
    autoTrackDecisions: pluginConfig.get('autoTrackDecisions'),
    autoTrackCompletions: pluginConfig.get('autoTrackCompletions'),
    autoTrackErrors: pluginConfig.get('autoTrackErrors'),
    autoSummaryInterval: pluginConfig.get('autoSummaryInterval'),
  };

  // P1 CACHE INVALIDATION: Check if config hash changed from last run
  const newHash = hashConfig(liveConfig);
  let registry: ToolRegistry;

  if (cachedRegistry && newHash === lastConfigHash) {
    // Config unchanged — reuse existing cached registry
    // Tools are already registered with the SDK from previous call. No-load needed.
    registry = cachedRegistry;
  } else {
    // Config changed or first run — create fresh provider & cache it
    const provider = createToolsProvider(liveConfig);

    // Update global config reference so tools can access latest settings
    _currentConfig = liveConfig;

    // Swap in new registry (no stale references)
    cachedRegistry = provider.registryForP1;
    lastConfigHash = newHash;
    registry = cachedRegistry;

    // Trigger lazy load now — or let it happen on first tool execution
    await registry.ensureLoad(liveConfig, provider.stateManagerForCache, provider.bgCommandManagerForCache);
  }

  // Return all available tools - SDK automatically registers them
  // Sort alphabetically for consistent UI ordering
  return registry.getAll().sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Update the global configuration reference.
 * Call this from main() to ensure toolsProvider uses the latest user settings.
 */
export function updateGlobalConfig(config: PluginConfig): void {
  _currentConfig = config;
  // Invalidate cache so next provider call creates a fresh registry
  cachedRegistry = null;
  lastConfigHash = '';
}
