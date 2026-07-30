/**
 * AI Toolbox Plugin - Entry Point
 * Main function exported for LM Studio plugin system
 */

import { type PluginContext } from '@lmstudio/sdk';
import { toolsProvider } from './toolsProvider';
import { configSchematics } from './config';
import { preprocess, setContextGuard } from './promptPreprocessor';
import { ContextGuard } from './contextGuard';
import { TokenStatsManager } from './tokenStatsManager';
import { cleanupBrowserSession } from './tools/browserAutomationTools';

// Export for external use (e.g., in generators or other plugins)
export { TokenStatsManager };

// ✅ FIX: Use structured logging instead of console.log
const logger = {
  info: (msg: string) => typeof process.stdout.write === 'function' && process.stdout.write(`[AI Toolbox] ${msg}\n`),
  warn: (msg: string) => typeof process.stderr.write === 'function' && process.stderr.write(`[AI Toolbox WARN] ${msg}\n`),
  error: (msg: string) => typeof process.stderr.write === 'function' && process.stderr.write(`[AI Toolbox ERROR] ${msg}\n`),
};

/**
 * Main plugin entry point - called by LM Studio
 */
export function main(context: PluginContext) {
  logger.info('Initializing...');
  
  // Register the configuration schematics (makes toggles appear in UI)
  context.withConfigSchematics(configSchematics);
  
  // Initialize ContextGuard with default settings
  const contextGuard = new ContextGuard({
    tokenLimit: 262144,          // Large fallback (256k) — dynamically overridden by SDK model info at runtime
    smartReading: true,          // Enables keyword-based file reading
    summaryModel: '',            // Empty = use current chat model for summarization
    terminalFilterEnabled: true, // Truncates long terminal outputs
    terminalFilterLength: 2000,  // Max chars before truncation
  });
  
  // Connect ContextGuard to the prompt preprocessor
  setContextGuard(contextGuard);
  
  // Register the prompt preprocessor for Document RAG / Chat with Files
  context.withPromptPreprocessor(preprocess);
  
  // Note: LM Studio SDK v1.5.0 doesn't expose getConfig() on PluginContext.
  // Configuration is handled automatically by the SDK's config system.
  // The toolsProvider will use default settings until UI toggles are applied.
  
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
