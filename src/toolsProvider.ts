/**
 * AI Toolbox Plugin - Dynamic Tools Provider (v1.5.0 Compatible)
 * 
 * This provider dynamically registers tools based on the current user configuration.
 * It respects UI toggles in real-time.
 * 
 * GATEWAY PATTERN REMOVED: Tools are now exposed directly to the LLM for better usability.
 * All enabled tools are exposed to the LLM. Schemas are minified to prevent grammar parser crashes.
 */

import type { Tool, ToolsProviderController } from '@lmstudio/sdk';
import type { PluginConfig } from './config.js';
import { configSchematics } from './config.js';
import { StateManager } from './stateManager.js';
import { BackgroundCommandManager } from './backgroundCommands.js';
// Tool registration functions — all tools remain available for runtime enable/disable via config toggles.
import { registerBackupTools } from './tools/backupTools.js';
import { registerBackgroundCommandTools } from './tools/backgroundCommandTools.js';
import { registerBrowserTools } from './tools/browserAutomationTools.js';
import { registerCleanupBackupsTool } from './tools/cleanupBackupsTool.js';
import { registerContextManagementTools } from './tools/contextManagementTools.js';
import { registerDataVisualizationTools } from './tools/dataVisualizationTools.js';
import { registerDatabaseTools } from './tools/databaseTools.js';
import { registerDocumentTools } from './tools/documentTools.js';
import { registerExecutionTools } from './tools/executionTools.js';
import { registerRestoreFromBakTools } from './tools/restoreFromBak.js';
import { registerFileSystemTools } from './tools/fileSystemTools.js';
import { registerGitTools } from './tools/gitGithubTools.js';
import { registerHttpClientTools } from './tools/httpClientTools.js';
import { registerImageProcessingTools } from './tools/imageProcessingTools.js';
import { registerLineOperationsTools } from './tools/lineOperations.js';
import { registerMarkdownPreviewTools } from './tools/markdownPreviewTools.js';
import { registerRefactorCodeTools } from './tools/refactorCodeTools.js';
import { registerRagTools } from './tools/vectorRagTools.js';
import { registerTaskPlanningTools } from './tools/taskPlanningTools.js';
import { registerTextProcessingTools } from './tools/textProcessingTools.js';
import { registerUiGenerationTools } from './tools/uiGenerationTools.js';
import { registerWebResearchTools } from './tools/webResearchTools.js';

let stateManager: StateManager;
let backgroundCommandManager: BackgroundCommandManager;

// --- Registry Pattern for Declarative Tool Registration ---
type ToolRegisterFn = () => Tool[];

interface ToolRegistryEntry {
  key: keyof PluginConfig;
  register: ToolRegisterFn;
}

export async function toolsProvider(ctl: ToolsProviderController): Promise<Tool[]> {
  // 1. Get current configuration (respects UI toggles) — use .get() method!
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  
  // Construct typed PluginConfig from ParsedConfig .get() calls
  const config: PluginConfig = {
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
    autoSummaryInterval: pluginConfig.get('autoSummaryInterval'),
    taskPlanning: pluginConfig.get('taskPlanning'),
  };

  // Initialize StateManager if not already done
  if (!stateManager) {
    stateManager = new StateManager(config);
  }

  // Initialize BackgroundCommandManager if not already done
  if (!backgroundCommandManager) {
    backgroundCommandManager = new BackgroundCommandManager(config);
  }

  // GOD MODE: when enabled, bypass all individual toggles and activate every tool
  const isGodMode = config.godMode;
  const tools: Tool[] = [];

  // --- Declarative Registry Definition (Scoped to function for runtime access) ---
  const TOOL_REGISTRIES: ToolRegistryEntry[] = [
    { key: 'backgroundCommands', register: () => registerBackgroundCommandTools(config, backgroundCommandManager) },
    { key: 'browserAutomation', register: () => registerBrowserTools(config) },
    { key: 'contextManagement', register: () => registerContextManagementTools(config, stateManager) },
    { key: 'databaseQueries', register: () => registerDatabaseTools(config) },
    { key: 'documentParsing', register: () => registerDocumentTools(config) },
    
    // Utility & Maintenance Tools (multiple registries per config key)
    { key: 'utility', register: () => registerBackupTools(config) },
    { key: 'utility', register: () => registerCleanupBackupsTool(config) },
    { key: 'utility', register: () => registerDataVisualizationTools(config) },
    { key: 'utility', register: () => registerRestoreFromBakTools(config) },
    { key: 'utility', register: () => registerLineOperationsTools(config) },
    { key: 'utility', register: () => registerMarkdownPreviewTools(config) },

    // Task Planning Tools (structured multi-step workflows)
    { key: 'taskPlanning', register: () => registerTaskPlanningTools(config) },

    // File System (takes extra args)
    { key: 'fileSystem', register: () => registerFileSystemTools(config, stateManager) },
    
    // Standard Tools
    { key: 'gitOperations', register: () => registerGitTools(config) },
    { key: 'httpClient', register: () => registerHttpClientTools(config) },
    { key: 'imageProcessing', register: () => registerImageProcessingTools(config) },
    { key: 'refactorCode', register: () => registerRefactorCodeTools(config) },
    { key: 'textProcessing', register: () => registerTextProcessingTools(config) },
    { key: 'uiGeneration', register: () => registerUiGenerationTools(config) },
    { key: 'vectorRAG', register: () => registerRagTools(config) },
    { key: 'webSearch', register: () => registerWebResearchTools(config) },
  ];

  // --- Declarative Registry Loop (Covers most tools) ---
  for (const entry of TOOL_REGISTRIES) {
    if (config[entry.key] || isGodMode) {
      tools.push(...entry.register());
    }
  }

  // --- Execution Tools (Special Case: Manual filtering required) ---
  const hasAnyExecToggle = config.executionJavaScript ||
                           config.executionPython ||
                           config.executionTerminal ||
                           config.executionShell ||
                           config.executionTests;

  if (hasAnyExecToggle || isGodMode) {
    const allExecTools = registerExecutionTools(config);

    // run_javascript — gated by executionJavaScript (or GOD MODE)
    if (config.executionJavaScript || isGodMode) {
      const jsTool = allExecTools.find(t => t.name === 'run_javascript');
      if (jsTool) tools.push(jsTool);
    }

    // run_python — gated by executionPython (or GOD MODE)
    if (config.executionPython || isGodMode) {
      const pyTool = allExecTools.find(t => t.name === 'run_python');
      if (pyTool) tools.push(pyTool);
    }

    // run_in_terminal — gated by executionTerminal (or GOD MODE)
    if (config.executionTerminal || isGodMode) {
      const termTool = allExecTools.find(t => t.name === 'run_in_terminal');
      if (termTool) tools.push(termTool);
    }

    // execute_command — gated by executionShell (or GOD MODE)
    if (config.executionShell || isGodMode) {
      const shellTool = allExecTools.find(t => t.name === 'execute_command');
      if (shellTool) tools.push(shellTool);
    }

    // run_tests — gated by executionTests (or GOD MODE)
    if (config.executionTests || isGodMode) {
      const testTool = allExecTools.find(t => t.name === 'run_tests');
      if (testTool) tools.push(testTool);
    }
  }

  // Sort alphabetically for consistent ordering
  tools.sort((a, b) => a.name.localeCompare(b.name));

  // Minify schemas to prevent llama.cpp EBNF grammar parser crashes
  // PR #17381 enforces a hard limit of 2000 on repetition bounds
  const { minifyTools } = await import('./toolsSchemaMinifier.js');
  const minified = minifyTools(tools);

  console.log(`[AI Toolbox] Exposed ${minified.length} tools to LLM.`);
  return minified;
}
