/**
 * AI Toolbox Plugin - Entry Point
 * Main function exported for LM Studio plugin system
 * 
 * ⚠️ LLM OPERATING INSTRUCTIONS (permanent — embedded in source code):
 * These rules apply to ALL future sessions and all users. They are not optional preferences;
 * they are hard constraints enforced by this file's structure and comments. Any LLM reading
 * this file MUST follow them:
 * 
 * 1. VERSION BUMP PROCEDURE (v1.9.8+)
 *    When the user asks to bump version or says "npm build shows X.X.X" (wrong version):
 *      a) Update package.json `version` field
 *      b) Update manifest.json `version` field (this is what LM Studio UI displays)
 *      c) Add new entry at TOP of CHANGELOG.md with date and description
 *      d) Update ALL documentation files: README.md, DOCUMENTATION.md, ARCHITECTURE.md, TOOLS_REFERENCE.md
 *         → use find_replace_all(pattern="v1.9.X", replacement="v1.9.Y") for bulk updates
 *      e) DO NOT skip any file — partial bumps leave inconsistent state in LM Studio UI
 *    Trigger: Only when user EXPLICITLY requests version bump OR reports wrong version in UI.
 *    Otherwise: Skip version bumps entirely (out of scope for debugging/performance sessions).
 * 
 * 2. PROJECT REGISTRATION (v1.9.8+) — CRITICAL SAFETY RULE
 *    NEVER auto-register a project on startup or during search. The following is FORBIDDEN:
 *      - No calls to initializeProjectDetection() from main() or any startup path
 *      - No calls to autoDetectAndRegister() without explicitConfirmation=true
 *      - No calls to searchWithAutoRegister() without explicitConfirmation=true
 *    Correct flow when user says "let's work on <project>":
 *      a) promptPreprocessor.ts detects project keywords and checks registered projects
 *      b) If found → injects confirmation prompt asking to switch working directory
 *      c) User confirms → plugin switches context; if not registered, asks for path
 *      d) User provides path → call register_project tool with that confirmed path
 *    The explicitConfirmation boolean gate in projectAutoDetect.ts enforces this at runtime.
 * 
 * 3. NO PERSISTENT MEMORY AS SUBSTITUTE FOR CODE FIXES
 *    Persistent memory (save_memory) only affects THIS LLM session preferences — it does NOT:
 *      - Change plugin behavior for other users/computers/instances
 *      - Propagate to future installations of this plugin
 *      - Replace actual code changes that are permanent and universal
 *    Always prefer source code fixes over persistent memory notes. Code changes are real;
 *    persistent memory is ephemeral LLM-side convenience at best.
 * 
 * 4. SCOPE DISCIPLINE
 *    Stay strictly within debugging/performance optimization scope unless user explicitly requests:
 *      - New features (explicit "add feature X" request)
 *      - Architectural rewrites (explicit "refactor architecture" request)
 *      - Documentation updates (explicit "update docs" request)
 *      - Release management (explicit "bump version / release" request)
 *    If multiple valid approaches exist, present them with trade-offs rather than defaulting to one.
 */

import { type PluginContext } from '@lmstudio/sdk';
import { toolsProvider } from './toolsProvider';
import { configSchematics } from './config';
import { preprocess, setContextGuard } from './promptPreprocessor';
import { ContextGuard } from './contextGuard';
import { TokenStatsManager } from './tokenStatsManager';
import { cleanupBrowserSession } from './tools/browserAutomationTools';
import { autoTracker } from './autoTracker';
import { restoreLastActiveProjectCwd } from './workingDir.js';

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
  
  // ⚠️ NO AUTO-REGISTRATION ON STARTUP — projects must be registered explicitly via register_project tool
  // This prevents silent registration of wrong/stale paths without user confirmation.

  // Restore last-active project CWD if persisted state is missing/invalid (e.g., after a plugin reinstall).
  // NOT auto-registration — only re-applies projects already known from the registry/session index.
  try {
    const restore = restoreLastActiveProjectCwd();
    if (restore.restored) logger.info(`Restored last-active project CWD: ${restore.project}`);
  } catch (e) {
    logger.warn(`CWD restore failed (non-fatal): ${e instanceof Error ? e.message : String(e)}`);
  }

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
  
  // 🔹 Coordinate ContextGuard + AutoTracker: when compression happens, reset AutoTracker state
  contextGuard.onCompression = () => {
    autoTracker.onContextCompressed();
  };

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
