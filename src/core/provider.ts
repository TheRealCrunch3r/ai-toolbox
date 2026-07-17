/**
 * Tools Provider — Optimized with lazy module loading (P0) and registry caching (P1)
 */

import type { Tool, ToolsProviderController } from '@lmstudio/sdk';

// Import existing modules
import type { PluginConfig } from '../config';
import { DEFAULT_CONFIG, isToolEnabled, isExecutionToolEnabled, configSchematics } from '../config';
export type { PluginConfig };
export { DEFAULT_CONFIG };
import { StateManager } from '../stateManager';
import { BackgroundCommandManager } from '../backgroundCommands';

// ==================== P0: LAZY MODULE RESOLVER MAP ====================
export const REGISTER_MAP: Record<string, () => Promise<{ registerFileSystemTools: (c: PluginConfig) => Tool[] } | { registerWebResearchTools: (c: PluginConfig) => Tool[] } | { registerBrowserTools: (c: PluginConfig) => Tool[] } | { registerGitTools: (c: PluginConfig) => Tool[] } | { registerDatabaseTools: (c: PluginConfig) => Tool[] } | { registerDocumentTools: (c: PluginConfig) => Tool[] } | { registerBackgroundCommandTools: (c: PluginConfig, b: BackgroundCommandManager) => Tool[] } | { registerImageProcessingTools: (c: PluginConfig) => Tool[] } | { registerHttpClientTools: (c: PluginConfig) => Tool[] } | { registerRagTools: (c: PluginConfig) => Tool[] } | { registerTextProcessingTools: (c: PluginConfig) => Tool[] } | { registerUiGenerationTools: (c: PluginConfig) => Tool[] } | { registerContextManagementTools: (c: PluginConfig) => Tool[] } | { registerRefactorCodeTools: (c: PluginConfig) => Tool[] }>> = {
  fileSystem:      () => import('../tools/fileSystemTools.js').then(m => m.registerFileSystemTools as never),
  webSearch:       () => import('../tools/webResearchTools.js').then(m => m.registerWebResearchTools as never),
  browserAutomation: () => import('../tools/browserAutomationTools.js').then(m => m.registerBrowserTools as never),
  gitOperations:   () => import('../tools/gitGithubTools.js').then(m => m.registerGitTools as never),
  databaseQueries: () => import('../tools/databaseTools.js').then(m => m.registerDatabaseTools as never),
  documentParsing: () => import('../tools/documentTools.js').then(m => m.registerDocumentTools as never),
  backgroundCommands: () => import('../tools/backgroundCommandTools.js').then(m => m.registerBackgroundCommandTools as never),
  imageProcessing: () => import('../tools/imageProcessingTools.js').then(m => m.registerImageProcessingTools as never),
  httpClient:      () => import('../tools/httpClientTools.js').then(m => m.registerHttpClientTools as never),
  vectorRAG:       () => import('../tools/vectorRagTools.js').then(m => m.registerRagTools as never),
  textProcessing:  () => import('../tools/textProcessingTools.js').then(m => m.registerTextProcessingTools as never),
  uiGeneration:    () => import('../tools/uiGenerationTools.js').then(m => m.registerUiGenerationTools as never),
  contextManagement: () => import('../tools/contextManagementTools.js').then(m => m.registerContextManagementTools as never),
  refactor: () => import('../tools/refactorCodeTools.js').then(m => m.registerRefactorCodeTools as never),
};

/** Maps REGISTER_MAP keys to their corresponding PluginConfig toggle keys */
export type EnabledCategoryKey = keyof Pick<PluginConfig, 'fileSystem' | 'webSearch' | 'browserAutomation' | 'gitOperations' | 'databaseQueries' | 'documentParsing' | 'backgroundCommands' | 'imageProcessing' | 'httpClient' | 'vectorRAG' | 'uiGeneration' | 'contextManagement' | 'textProcessing' | 'refactorCode'>;

export const CATEGORY_CONFIG_KEY_MAP: Record<string, EnabledCategoryKey> = {
  fileSystem: 'fileSystem',
  webSearch: 'webSearch',
  browserAutomation: 'browserAutomation',
  gitOperations: 'gitOperations',
  databaseQueries: 'databaseQueries',
  documentParsing: 'documentParsing',
  backgroundCommands: 'backgroundCommands',
  imageProcessing: 'imageProcessing',
  httpClient: 'httpClient',
  vectorRAG: 'vectorRAG',
  textProcessing: 'textProcessing',
  uiGeneration: 'uiGeneration',
  contextManagement: 'contextManagement',
  refactor: 'refactorCode',
};

/** Minimal config-hash for cache invalidation */
export function hashConfig(cfg: PluginConfig): string {
  return `${cfg.godMode}_${cfg.fileSystem}_${cfg.webSearch}_${cfg.browserAutomation}_${cfg.gitOperations}_${cfg.databaseQueries}_${cfg.documentParsing}_${cfg.backgroundCommands}_${cfg.imageProcessing}_${cfg.httpClient}_${cfg.vectorRAG}_${cfg.textProcessing}_${cfg.uiGeneration}_${cfg.contextManagement}_${cfg.refactorCode}_${cfg.executionJavaScript}_${cfg.executionPython}_${cfg.executionTerminal}_${cfg.executionShell}`;
}

// ==================== TYPES ====================

export interface ToolCategory {
  name: string;
  tools: Tool[];
}

/** Extended tool type with typed implementation for safe access */
export type TypedTool = Tool & {
  implementation: (params: Record<string, unknown>, ctx?: unknown) => Promise<unknown>;
};

// Global config reference to ensure toolsProvider uses the latest user settings
export let _currentConfig: PluginConfig = DEFAULT_CONFIG;

/**
 * Central registry for all available tools.
 */
export class ToolRegistry {
  private toolMap = new Map<string, TypedTool>();
  private _isLoaded = false;
  private _loadPromise: Promise<void> | null = null;

  async ensureLoad(config: PluginConfig, stateManager: StateManager, bgCommandManager: BackgroundCommandManager): Promise<void> {
    if (this._isLoaded) return;

    this._loadPromise = (async () => {
      for (const [category, resolver] of Object.entries(REGISTER_MAP)) {
        const categoryKey = CATEGORY_CONFIG_KEY_MAP[category];
        if (!categoryKey) continue;
        const enabled = config.godMode || isToolEnabled(config, categoryKey);
        if (!enabled) continue;

        try {
          const registrarRaw = await resolver();
          const registrar = registrarRaw as never as (c: PluginConfig, s?: StateManager, b?: BackgroundCommandManager) => Tool[];
          registrar(config, stateManager, bgCommandManager).forEach((t: Tool) => this.toolMap.set(t.name, t as TypedTool));
        } catch (err) {
          console.error(`[ToolsProvider] Failed to load tools for category '${category}':`, err);
        }
      }

      const LineOpsRegistrar = await import('../tools/lineOperations.js').then(m => m.registerLineOperationsTools);
      LineOpsRegistrar(config).forEach((t: Tool) => this.toolMap.set(t.name, t as TypedTool));

      const BackupRegistrar = await import('../tools/backupTools.js').then(m => m.registerBackupTools);
      BackupRegistrar(config).forEach((t: Tool) => this.toolMap.set(t.name, t as TypedTool));

      if (config.executionJavaScript || config.executionPython || config.executionTerminal || config.executionShell) {
        const ExecRegistrar = await import('../tools/executionTools.js').then(m => m.registerExecutionTools);
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

        // run_tests — gated by executionTests
        if (isExecutionToolEnabled(config, 'tests')) {
          const testTool = allExecTools.find((t: Tool) => t.name === 'run_tests');
          if (testTool) this.toolMap.set(testTool.name, testTool as TypedTool);
        }
      }

      const getEnabledTools = () => Array.from(this.toolMap.keys());
      const UtilityRegistrar = await import('../tools/utilityTools.js').then(m => m.registerUtilityTools);
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

  async executeTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    await this.registry.ensureLoad(this.config, this.stateManager, this.backgroundCommandManager);

    const tool = this.registry.get(toolName);
    if (!tool) {
      return { success: false, error: `Tool '${toolName}' not found` };
    }

    try {
      const impl = tool.implementation;
      const result = await impl(params);
      this.stateManager.set(`last_${toolName}`, result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Tool execution failed: ${message}` };
    }
  }

  get stateManagerForCache(): StateManager { return this.stateManager; }
  get bgCommandManagerForCache(): BackgroundCommandManager { return this.backgroundCommandManager; }
  get registryForP1(): ToolRegistry { return this.registry; }
  async getAvailableTools(): Promise<Tool[]> {
    await this.registry.ensureLoad(this.config, this.stateManager, this.backgroundCommandManager);
    return this.registry.getAll();
  }

  getStateManager(): StateManager { return this.stateManager; }
  getConfig(): PluginConfig { return this.config; }
}

export function createToolsProvider(config?: PluginConfig): ToolsProvider {
  return new ToolsProvider(config);
}

// ==================== P1: REGISTRY CACHING (toolsProvider) ====================

export let cachedRegistry: ToolRegistry | null = null;
export let lastConfigHash = '';
export let singletonProvider: ToolsProvider | null = null;

/**
 * Main tools provider function for LM Studio SDK.
 */
export async function toolsProvider(ctl: ToolsProviderController, _lmClient?: unknown): Promise<Tool[]> {
  const pluginConfig = ctl.getPluginConfig(configSchematics);

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
    refactorCode: pluginConfig.get('refactorCode'),
    utility: pluginConfig.get('utility'),
    godMode: pluginConfig.get('godMode'),
    documentRAG: pluginConfig.get('documentRAG'),
    retrievalLimit: pluginConfig.get('retrievalLimit'),
    retrievalAffinityThreshold: pluginConfig.get('retrievalAffinityThreshold'),
    executionJavaScript: pluginConfig.get('executionJavaScript'),
    executionPython: pluginConfig.get('executionPython'),
    executionTerminal: pluginConfig.get('executionTerminal'),
    executionShell: pluginConfig.get('executionShell'),
    executionTests: pluginConfig.get('executionTests'),
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
    contextGuardEnabled: pluginConfig.get('contextGuardEnabled'),
    contextGuardTokenLimit: pluginConfig.get('contextGuardTokenLimit'),
    contextGuardSmartReading: pluginConfig.get('contextGuardSmartReading'),
    contextGuardSummaryModel: pluginConfig.get('contextGuardSummaryModel'),
    contextGuardTerminalFilterEnabled: pluginConfig.get('contextGuardTerminalFilterEnabled'),
    contextGuardTerminalFilterLength: pluginConfig.get('contextGuardTerminalFilterLength'),
    autoTrackingEnabled: pluginConfig.get('autoTrackingEnabled'),
    autoTrackTokenThreshold: pluginConfig.get('autoTrackTokenThreshold'),
    autoTrackDecisions: pluginConfig.get('autoTrackDecisions'),
    autoTrackCompletions: pluginConfig.get('autoTrackCompletions'),
    autoTrackErrors: pluginConfig.get('autoTrackErrors'),
    autoSummaryInterval: pluginConfig.get('autoSummaryInterval'),  };

  const newHash = hashConfig(liveConfig);
  let registry: ToolRegistry;

  if (cachedRegistry && newHash === lastConfigHash) {
    registry = cachedRegistry;
  } else {
    const provider = createToolsProvider(liveConfig);
    _currentConfig = liveConfig;
    cachedRegistry = provider.registryForP1;
    lastConfigHash = newHash;
    registry = cachedRegistry;
    singletonProvider = provider;
    await registry.ensureLoad(liveConfig, provider.stateManagerForCache, provider.bgCommandManagerForCache);
  }

  return []; 
}
