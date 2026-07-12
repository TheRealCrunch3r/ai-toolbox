/**
 * AI Toolbox Plugin - Dynamic Tools Provider (v1.5.0 Compatible)
 * 
 * This provider dynamically registers tools based on the current user configuration.
 * It respects UI toggles in real-time, preventing crashes when tools are disabled.
 */

import type { Tool, ToolsProviderController } from '@lmstudio/sdk';
import { configSchematics } from './config.js';

import { StateManager } from './stateManager.js';
import { BackgroundCommandManager } from './backgroundCommands.js';

// Import tool registration functions
import { registerFileSystemTools } from './tools/fileSystemTools.js';
import { registerWebResearchTools } from './tools/webResearchTools.js';
import { registerGitTools } from './tools/gitGithubTools.js';
import { registerBrowserTools } from './tools/browserAutomationTools.js';
import { registerDatabaseTools } from './tools/databaseTools.js';
import { registerDocumentTools } from './tools/documentTools.js';
import { registerBackgroundCommandTools } from './tools/backgroundCommandTools.js';
import { registerImageProcessingTools } from './tools/imageProcessingTools.js';
import { registerHttpClientTools } from './tools/httpClientTools.js';
import { registerRagTools } from './tools/vectorRagTools.js';
import { registerUiGenerationTools } from './tools/uiGenerationTools.js';
import { registerContextManagementTools } from './tools/contextManagementTools.js';
import { registerTextProcessingTools } from './tools/textProcessingTools.js';
import { registerRefactorCodeTools } from './tools/refactorCodeTools.js';
import { registerExecutionTools } from './tools/executionTools.js';

let stateManager: StateManager;
let backgroundCommandManager: BackgroundCommandManager;

export async function toolsProvider(ctl: ToolsProviderController): Promise<Tool[]> {
  // 1. Get current configuration (respects UI toggles) — use .get() method!
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  
  // Initialize StateManager if not already done
  if (!stateManager) {
    stateManager = new StateManager(pluginConfig as any);
  }

  // Initialize BackgroundCommandManager if not already done
  if (!backgroundCommandManager) {
    backgroundCommandManager = new BackgroundCommandManager(pluginConfig as any);
  }

  const tools: Tool[] = [];

  // --- File System Tools ---
  if (pluginConfig.get('fileSystem')) {
    tools.push(...registerFileSystemTools(pluginConfig as any, stateManager));
  }

  // --- Web Research Tools ---
  if (pluginConfig.get('webSearch')) {
    tools.push(...registerWebResearchTools(pluginConfig as any));
  }

  // --- Git & GitHub Tools ---
  if (pluginConfig.get('gitOperations')) {
    tools.push(...registerGitTools(pluginConfig as any));
  }

  // --- Browser Automation Tools ---
  if (pluginConfig.get('browserAutomation')) {
    tools.push(...registerBrowserTools(pluginConfig as any));
  }

  // --- Database Queries ---
  if (pluginConfig.get('databaseQueries')) {
    tools.push(...registerDatabaseTools(pluginConfig as any));
  }

  // --- Document Parsing ---
  if (pluginConfig.get('documentParsing')) {
    tools.push(...registerDocumentTools(pluginConfig as any));
  }

  // --- Background Commands ---
  if (pluginConfig.get('backgroundCommands')) {
    tools.push(...registerBackgroundCommandTools(pluginConfig as any, backgroundCommandManager));
  }

  // --- Image Processing Tools ---
  if (pluginConfig.get('imageProcessing')) {
    tools.push(...registerImageProcessingTools(pluginConfig as any));
  }

  // --- HTTP Client Tools ---
  if (pluginConfig.get('httpClient')) {
    tools.push(...registerHttpClientTools(pluginConfig as any));
  }

  // --- Vector RAG / Semantic Search ---
  if (pluginConfig.get('vectorRAG')) {
    tools.push(...registerRagTools(pluginConfig as any));
  }

  // --- UI Generation Tools ---
  if (pluginConfig.get('uiGeneration')) {
    tools.push(...registerUiGenerationTools(pluginConfig as any));
  }

  // --- Context Management Tools ---
  if (pluginConfig.get('contextManagement')) {
    tools.push(...registerContextManagementTools(pluginConfig as any, stateManager));
  }

  // --- Text Processing Tools ---
  if (pluginConfig.get('textProcessing')) {
    tools.push(...registerTextProcessingTools(pluginConfig as any));
  }

  // --- AST Code Refactoring Tools ---
  if (pluginConfig.get('refactorCode')) {
    tools.push(...registerRefactorCodeTools(pluginConfig as any));
  }

  // --- Execution Tools (JS/Python/Terminal) ---
  if (pluginConfig.get('executionJavaScript') || 
      pluginConfig.get('executionPython') || 
      pluginConfig.get('executionTerminal') || 
      pluginConfig.get('executionShell')) {
    tools.push(...registerExecutionTools(pluginConfig as any));
  }

  // Return the filtered list of active tools
  return tools;
}
