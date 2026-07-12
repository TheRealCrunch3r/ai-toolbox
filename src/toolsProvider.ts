/**
 * AI Toolbox Plugin - Entry Point (Gateway Version)
 */

import type { PluginContext, Tool, ToolsProviderController } from '@lmstudio/sdk';
import { 
  toolsProvider as originalToolsProvider, 
  _currentConfig,
  singletonProvider
} from './core/provider';

import { configSchematics } from './config';
import { preprocess, setContextGuard } from './promptPreprocessor';
import { ContextGuard } from './contextGuard';
import { cleanupBrowserSession } from './tools/browserAutomationTools';
import { getGatewayTools } from './tools/gatewayTools';

/**
 * Main plugin entry point - called by LM Studio
 */
export function main(context: PluginContext) {
  console.log('[AI Toolbox] Initializing Gateway Mode...');
  
  context.withConfigSchematics(configSchematics);
  
  const contextGuard = new ContextGuard({
    tokenLimit: 30000,
    smartReading: true,
    summaryModel: '',
    terminalFilterEnabled: true,
    terminalFilterLength: 2000,
  });
  
  setContextGuard(contextGuard);
  context.withPromptPreprocessor(preprocess);

  // Register the tools provider function
  context.withToolsProvider(toolsProvider);
  
  if (typeof process.on === 'function') {
    process.on('SIGTERM', async () => await cleanupBrowserSession());
    process.on('SIGINT', async () => await cleanupBrowserSession());
  }
  
  console.log('[AI Toolbox] Initialized successfully in Gateway Mode!');
}

/**
 * The shim that LM Studio calls. 
 * Returns only the two gateway tools to prevent LLM tool-bloat crashes.
 * All other tools are accessible via execute_gateway_tool on-demand.
 */
export async function toolsProvider(ctl: ToolsProviderController, _lmClient?: unknown): Promise<Tool[]> {
  // 1. Ensure core provider is initialized and registry is loaded
  await originalToolsProvider(ctl, _lmClient);

  if (!singletonProvider) {
    throw new Error('[AI Toolbox] Provider singleton not initialized.');
  }

  // Return only the gateway tools (explore_tools + execute_gateway_tool)
  return getGatewayTools(singletonProvider, _currentConfig || {} as any);
}
