/**
 * AI Toolbox Plugin - Entry Point
 * Main function exported for LM Studio plugin system
 */

import { type PluginContext } from '@lmstudio/sdk';
import { toolsProvider } from './toolsProvider';
import { configSchematics } from './config';
import { preprocess } from './promptPreprocessor';
import { cleanupBrowserSession } from './tools/browserAutomationTools';

// ✅ FIX: Use structured logging instead of console.log
const logger = {
  info: (msg: string) => typeof process.stdout.write === 'function' && process.stdout.write(`[AI Toolbox] ${msg}\n`),
  error: (msg: string) => typeof process.stderr.write === 'function' && process.stderr.write(`[AI Toolbox ERROR] ${msg}\n`),
};

/**
 * Main plugin entry point - called by LM Studio
 */
export function main(context: PluginContext) {
  logger.info('Initializing...');
  
  // Register the configuration schematics (makes toggles appear in UI)
  context.withConfigSchematics(configSchematics);
  
  // Register the prompt preprocessor for Document RAG / Chat with Files
  context.withPromptPreprocessor(preprocess);
  
  // Register the tools provider function
  context.withToolsProvider(toolsProvider);
  
  // Handle plugin unload - cleanup browser session to prevent orphaned processes
  if (typeof process.on === 'function') {
    process.on('SIGTERM', async () => {
      await cleanupBrowserSession();
    });
    process.on('SIGINT', async () => {
      await cleanupBrowserSession();
    });
  }
  
  logger.info('Initialized successfully!');
}
