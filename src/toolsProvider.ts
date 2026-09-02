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
// Static import (NOT dynamic): the CJS Jest transform cannot resolve `await import(...)`
// without --experimental-vm-modules (throws ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG).
// jest.config.cjs already maps './toolsSchemaMinifier.js' -> src/toolsSchemaMinifier.ts,
// and the minifier is a pure module (type-only imports), so static loading is safe and cheap.
import { minifyTools } from './toolsSchemaMinifier.js';
import { reportToolSchemas } from './toolOverhead.js';
// FIX #20 (A1+A2): mid-loop context growth — payload bookkeeping + proactive checkpoint guard.
import { autoTracker } from './autoTracker.js';
import { TokenStatsManager } from './tokenStatsManager.js';
// OOM attribution (crashes 2026-08-24 ~20:24/21:10): pre-call heap probe so the next crash names its suspect tool.
import { checkHeapPressure } from './performanceUtils.js';

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
  const minified = minifyTools(tools);

  // Report the final tool set so ContextGuard's token estimate includes the serialized definitions (see toolOverhead.ts)
  reportToolSchemas(minified);

  // ==================== FIX #20 (A1+A2): mid-loop context growth instrumentation ====================
  // Wrap each tool's implementation once per registration to record its result payload in
  // TokenStatsManager (per-turn delta). After every recording the AutoTracker mid-loop guard is
  // evaluated: if turn-start baseline + cumulative delta crossed the checkpoint threshold, a proactive
  // session-memory snapshot is saved — because preprocess() (and hence compression + user prompt) only
  // runs on user messages. The wrapper never alters routing, delays calls, or changes non-object
  // payloads — it only adds an additive `executedTool` transparency field to plain-object results
  // (01.09.2026). Measurement and guarding are best-effort side effects (any failure is logged,
  // never thrown into the tool call).
  const instrumented = minified.map((t): Tool => {
    type ToolImplFn = (params: Record<string, unknown>, ctx: unknown) => unknown;
    type InstrumentableTool = Tool & { name?: string; implementation?: ToolImplFn };

    const raw = t as InstrumentableTool;
    if (!raw.implementation || typeof raw.implementation !== 'function') return t;
    const original = raw.implementation;

    // Tools are constructed fresh by the registration functions on every provider call, so each
    // implementation is wrapped exactly once here; even if the provider re-runs (config reload),
    // recordToolResult() still executes exactly once per invocation — bookkeeping never double-counts.
    // Transparency note (01.09.2026): plain-object results also gain an additive `executedTool` field
    // (registered name of the implementation that actually ran) — see the stamp below; routing, side
    // effects and all non-object payloads are untouched.
    const wrapped: ToolImplFn = async function instrumentedImplementation(
      params: Record<string, unknown>,
      ctx: unknown,
    ): Promise<unknown> {
      // OOM attribution: probe heap BEFORE the call runs. If we're already near the V8 wall when a
      // tool starts, THIS is the suspect for the next crash — the line lands in the log right before it.
      checkHeapPressure(raw.name ?? 'unknown_tool');
      const result = await original(params, ctx);
      try {
        TokenStatsManager.recordToolResult(raw.name ?? 'unknown_tool', result);
        void autoTracker
          .guardMidLoopThreshold(
            TokenStatsManager.getTurnBaseline(),
            TokenStatsManager.getMidLoopDeltaTokens(),
            TokenStatsManager.getMaxContextTokens(),
          )
          .catch((err) => console.error('[AutoTracker] [MIDLOOP] Guard evaluation failed (non-fatal):', err));
      } catch (err) {
        // Measurement/guard must never break a successful tool call.
        console.warn('[AutoTracker] [DELTA] Payload recording failed (non-fatal):', err);
      }
      // TRANSPARENCY STAMP (01.09.2026, silent-substitution incident follow-up): record in the result
      // payload WHICH registered implementation actually executed — ground truth for transcript/LLM.
      // If a model believes it called tool X but `executedTool` names Y, substitution is visible
      // instead of hidden behind a plausible-looking success narrative. Strictly additive:
      //  - plain-object results gain exactly ONE new field (`executedTool`; no existing key collides —
      //    verified by grep across src/ before introduction), wrapper value is authoritative;
      //  - strings, numbers, booleans, arrays, null, undefined and class instances pass through
      //    byte-identical (prototype check excludes non-plain objects so their shape never changes);
      //  - routing, side effects, timing and error propagation are untouched.
      const executedTool = raw.name ?? 'unknown_tool';
      if (
        result !== null &&
        typeof result === 'object' &&
        !Array.isArray(result) &&
        Object.getPrototypeOf(result) === Object.prototype
      ) {
        return { ...result, executedTool };
      }
      return result;
    };

    return { ...t, implementation: wrapped } as Tool;
  });

  console.log(`[AI Toolbox] Exposed ${instrumented.length} tools to LLM.`);
  return instrumented;
}
