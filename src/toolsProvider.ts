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

  // GOD MODE: when enabled, bypass all individual toggles and activate every tool
  const isGodMode = pluginConfig.get('godMode');

  const tools: Tool[] = [];

  // --- File System Tools ---
  if (pluginConfig.get('fileSystem') || isGodMode) {
    tools.push(...registerFileSystemTools(pluginConfig as any, stateManager));
  }

  // --- Web Research Tools ---
  if (pluginConfig.get('webSearch') || isGodMode) {
    tools.push(...registerWebResearchTools(pluginConfig as any));
  }

  // --- Git & GitHub Tools ---
  if (pluginConfig.get('gitOperations') || isGodMode) {
    tools.push(...registerGitTools(pluginConfig as any));
  }

  // --- Browser Automation Tools ---
  if (pluginConfig.get('browserAutomation') || isGodMode) {
    tools.push(...registerBrowserTools(pluginConfig as any));
  }

  // --- Database Queries ---
  if (pluginConfig.get('databaseQueries') || isGodMode) {
    tools.push(...registerDatabaseTools(pluginConfig as any));
  }

  // --- Document Parsing ---
  if (pluginConfig.get('documentParsing') || isGodMode) {
    tools.push(...registerDocumentTools(pluginConfig as any));
  }

  // --- Background Commands ---
  if (pluginConfig.get('backgroundCommands') || isGodMode) {
    tools.push(...registerBackgroundCommandTools(pluginConfig as any, backgroundCommandManager));
  }

  // --- Image Processing Tools ---
  if (pluginConfig.get('imageProcessing') || isGodMode) {
    tools.push(...registerImageProcessingTools(pluginConfig as any));
  }

  // --- HTTP Client Tools ---
  if (pluginConfig.get('httpClient') || isGodMode) {
    tools.push(...registerHttpClientTools(pluginConfig as any));
  }

  // --- Vector RAG / Semantic Search ---
  if (pluginConfig.get('vectorRAG') || isGodMode) {
    tools.push(...registerRagTools(pluginConfig as any));
  }

  // --- UI Generation Tools ---
  if (pluginConfig.get('uiGeneration') || isGodMode) {
    tools.push(...registerUiGenerationTools(pluginConfig as any));
  }

  // --- Context Management Tools ---
  if (pluginConfig.get('contextManagement') || isGodMode) {
    tools.push(...registerContextManagementTools(pluginConfig as any, stateManager));
  }

  // --- Text Processing Tools ---
  if (pluginConfig.get('textProcessing') || isGodMode) {
    tools.push(...registerTextProcessingTools(pluginConfig as any));
  }

  // --- AST Code Refactoring Tools ---
  if (pluginConfig.get('refactorCode') || isGodMode) {
    tools.push(...registerRefactorCodeTools(pluginConfig as any));
  }

  // --- Execution Tools (JS/Python/Terminal) — per-tool gating, GOD MODE bypasses all ---
  const hasAnyExecToggle = pluginConfig.get('executionJavaScript') ||
                           pluginConfig.get('executionPython') ||
                           pluginConfig.get('executionTerminal') ||
                           pluginConfig.get('executionShell') ||
                           pluginConfig.get('executionTests');

  if (hasAnyExecToggle || isGodMode) {
    const allExecTools = registerExecutionTools(pluginConfig as any);

    // run_javascript — gated by executionJavaScript (or GOD MODE)
    if (pluginConfig.get('executionJavaScript') || isGodMode) {
      const jsTool = allExecTools.find(t => t.name === 'run_javascript');
      if (jsTool) tools.push(jsTool);
    }

    // run_python — gated by executionPython (or GOD MODE)
    if (pluginConfig.get('executionPython') || isGodMode) {
      const pyTool = allExecTools.find(t => t.name === 'run_python');
      if (pyTool) tools.push(pyTool);
    }

    // run_in_terminal — gated by executionTerminal (or GOD MODE)
    if (pluginConfig.get('executionTerminal') || isGodMode) {
      const termTool = allExecTools.find(t => t.name === 'run_in_terminal');
      if (termTool) tools.push(termTool);
    }

    // execute_command — gated by executionShell (or GOD MODE)
    if (pluginConfig.get('executionShell') || isGodMode) {
      const shellTool = allExecTools.find(t => t.name === 'execute_command');
      if (shellTool) tools.push(shellTool);
    }

    // run_tests — gated by executionTests (or GOD MODE)
    if (pluginConfig.get('executionTests') || isGodMode) {
      const testTool = allExecTools.find(t => t.name === 'run_tests');
      if (testTool) tools.push(testTool);
    }
  }

  // Return the filtered list of active tools
  return tools;
}
