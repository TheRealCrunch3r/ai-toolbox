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
import { registerMarkdownPreviewTools } from './tools/markdownPreviewTools.js';
import { registerRefactorCodeTools } from './tools/refactorCodeTools.js';
import { registerRagTools } from './tools/vectorRagTools.js';
import { registerTaskPlanningTools } from './tools/taskPlanningTools.js';
import { registerTextProcessingTools } from './tools/textProcessingTools.js';
import { registerUiGenerationTools } from './tools/uiGenerationTools.js';
import { registerWebResearchTools } from './tools/webResearchTools.js';
import { registerRepeatToolReminderTools } from './tools/repeatToolReminderTools.js';
// RESTORE-SESSION-CONTEXT (25.09): composite read-only "read session mem" bootstrap tool — rides the contextManagement toggle with the memory family.
import { registerRestoreSessionContextTool } from './tools/restoreSessionContextTool.js';
// Static import (NOT dynamic): the CJS Jest transform cannot resolve `await import(...)`
// without --experimental-vm-modules (throws ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG).
// jest.config.cjs already maps './toolsSchemaMinifier.js' -> src/toolsSchemaMinifier.ts,
// and the minifier is a pure module (type-only imports), so static loading is safe and cheap.
import { minifyTools } from './toolsSchemaMinifier.js';
import { reportToolSchemas } from './toolOverhead.js';
// FIX #20 (A1+A2): mid-loop context growth — payload bookkeeping + proactive checkpoint guard.
import { autoTracker } from './autoTracker.js';
import { TokenStatsManager, estimateTokensFromChars } from './tokenStatsManager.js';
// LLM-side limit awareness (02.10; widened 03.10 per option B): compact usage footer on tool results — appended to
// strings and added as an additive `ctx_footer` field on plain objects — gated at 50% projected window usage
import { buildContextUsageFooter, FOOTER_TOKEN_ESTIMATE } from './utils/contextUsageFooter.js';
// OOM attribution (crashes 2026-08-24 ~20:24/21:10): pre-call heap probe so the next crash names its suspect tool.
import { checkHeapPressure } from './performanceUtils.js';
// Pipeline hygiene D — reset monotonic guard per provider invocation
import { resetToolGuard } from './utils/withPipeline.js';
// Loop hygiene B — repeat-tool reminder per turn
import { repeatReminder } from './utils/repeatToolReminder.js';
// Spill pattern A — immediate inline spill for oversized results
import { spillTextIfNeeded } from './utils/toolPayloadSpill.js';

// Cluster-aware tool ordering (18.09): wires src/tools/toolPriority.ts into production — see CHANGELOG_v2 18.09 entry.
import type { HubExclusionResult } from './utils/hubExclusionClustering.js';
import { analyzeAiToolboxDependencies } from './utils/hubExclusionClustering.js';
import { sortToolsByClusterAwarePriority } from './tools/toolPriority.js';

let stateManager: StateManager;
let backgroundCommandManager: BackgroundCommandManager;

/** CONTAMINATION-FIX Part A (01.10): read-only accessor for the process-wide StateManager singleton — used by
 * applyProjectCwdSwitch() (Step 0.7) to rebind identity after a CWD switch. Returns undefined until tool
 * registration has constructed the instance; an early preprocessor call then simply skips the rebind and the
 * next switch retries (see RESEARCH_session-memory-contamination_2026-10-01.md §4, Part A). */
export function getStateManager(): StateManager | undefined {
  return stateManager;
}


// Cluster-aware tool ordering (18.09): analyzeAiToolboxDependencies() is pure and static — it builds a
// ~25-node graph from the hardcoded ARCHITECTURE.md edge list (no fs I/O), so compute it exactly once per
// process lifetime and reuse for every provider run. Kept separate from ContextGuard's 5-minute cache on
// purpose: tool ordering wants one stable result, not a periodically re-computed one.
/** CTX-FOOTER fail-loud (03.10 incident ctx_1791025835710): one-shot marker for the current suppression
 * window — when a tool result is footer-eligible but no turn baseline has been published yet
 * (baseline === 0, i.e. preprocess() reset without its single setTurnEvaluation publish point ever
 * reaching), exactly ONE console.warn names the silence instead of suppressing silently. Re-armed by the
 * live-baseline branch on every wrapper pass; see resetFooterSuppressionWarnForTests(). */
let footerSuppressionNotified = false;

/** Test hook (mirrors TokenStatsManager.clearActiveToolCallsForTests): re-arm the one-shot suppression warn so each
 * test starts at a fresh window — the flag is module state and would otherwise leak across cases in a suite. */
export function resetFooterSuppressionWarnForTests(): void {
  footerSuppressionNotified = false;
}

let cachedToolsClustering: HubExclusionResult | null = null;

function getClusteringForToolOrder(): HubExclusionResult {
  if (!cachedToolsClustering) {
    cachedToolsClustering = analyzeAiToolboxDependencies();
  }
  return cachedToolsClustering;
}

// --- Registry Pattern for Declarative Tool Registration ---
type ToolRegisterFn = () => Tool[];

interface ToolRegistryEntry {
  key: keyof PluginConfig;
  register: ToolRegisterFn;
}

export async function toolsProvider(ctl: ToolsProviderController): Promise<Tool[]> {
  // Pipeline hygiene D: reset monotonic guard for new turn
  resetToolGuard();
  // Loop hygiene B: advance repeat-tool reminder turn counter
  repeatReminder.nextTurn();

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
    clusterAwareToolOrder: pluginConfig.get('clusterAwareToolOrder'),
    compactionEnabled: pluginConfig.get('compactionEnabled'), // C compaction family (24.09) — exhaustive-literal completeness after config.ts schema extension
    compactionMaxResultBytes: pluginConfig.get('compactionMaxResultBytes'),
    contextUsageFooter: pluginConfig.get('contextUsageFooter'), // LLM-side limit awareness (02.10; widened 03.10 per option B): usage footer — appended to strings + additive ctx_footer field on plain objects, gated at 50% window usage
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
    // RESTORE-SESSION-CONTEXT (25.09): composite resume read (summary + plans + context + facts + sessions index); shares the memory-family toggle and StateManager instance.
    { key: 'contextManagement', register: () => registerRestoreSessionContextTool(config, stateManager) },
    { key: 'databaseQueries', register: () => registerDatabaseTools(config) },
    { key: 'documentParsing', register: () => registerDocumentTools(config) },
    
    // Utility & Maintenance Tools (multiple registries per config key)
    { key: 'utility', register: () => registerBackupTools(config) },
    { key: 'utility', register: () => registerCleanupBackupsTool(config) },
    { key: 'utility', register: () => registerDataVisualizationTools(config) },
    { key: 'utility', register: () => registerRestoreFromBakTools(config) },
    { key: 'utility', register: () => registerMarkdownPreviewTools(config) },
    { key: 'utility', register: () => registerRepeatToolReminderTools(config) },

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

  // Cluster-aware tool send-order (18.09 — wires src/tools/toolPriority.ts into production; the tier table
  // and cluster-aware ranking existed and were unit-tested since 21.08 but were never called from this provider).
  // Order = priority tier -> module centrality (static ARCHITECTURE.md graph) -> alphabetical name.
  // Toggle: config.clusterAwareToolOrder (default true); OFF restores the legacy alphabetical order exactly.
  const ordered = config.clusterAwareToolOrder
    ? sortToolsByClusterAwarePriority(tools, getClusteringForToolOrder())
    : [...tools].sort((a, b) => a.name.localeCompare(b.name));

  if (config.clusterAwareToolOrder) {
    console.log('[AI Toolbox] [CLUSTER-AWARE] Tool send-order = tier + module centrality (disable via clusterAwareToolOrder toggle).');
  }

  // Minify schemas to prevent llama.cpp EBNF grammar parser crashes
  // PR #17381 enforces a hard limit of 2000 on repetition bounds
  const minified = minifyTools(ordered);

  // Report the final tool set so ContextGuard's token estimate includes the serialized definitions (see toolOverhead.ts)
  reportToolSchemas(minified);

  // ==================== FIX #20 (A1+A2): mid-loop context growth instrumentation ====================
  // Wrap each tool's implementation once per registration to record its result payload in
  // TokenStatsManager (per-turn delta). After every recording the AutoTracker mid-loop guard is
  // evaluated: if turn-start baseline + cumulative delta crossed the checkpoint threshold, a proactive
  // session-memory snapshot is saved — because preprocess() (and hence compression + user prompt) only
  // runs on user messages. The wrapper never alters routing, delays calls, or changes non-object
  // payloads — it only adds an additive `executedTool` transparency field to plain-object results
  // (01.09.2026) and surfaces the context-usage footer when gated at >=50% projected window usage
  // (02.10, LLM-side limit awareness; widened 03.10 per option B: appended to string results AND added as an
  // additive `ctx_footer` field on plain-object results — every registered tool returns an object envelope).
  // Measurement and guarding are best-effort side effects
  // (any failure is logged, never thrown into the tool call).
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
    // effects and all non-object payloads are untouched. Since 03.10 (option B), gated plain objects may
    // additionally carry an additive `ctx_footer` field from the CTX-FOOTER block inside the wrapper itself;
    // both stamps are strictly additive new keys — never a mutation of tool-owned values.
    const wrapped: ToolImplFn = async function instrumentedImplementation(
      params: Record<string, unknown>,
      ctx: unknown,
    ): Promise<unknown> {
      // OOM attribution: probe heap BEFORE the call runs. If we're already near the V8 wall when a
      // tool starts, THIS is the suspect for the next crash — the line lands in the log right before it.
      checkHeapPressure(raw.name ?? 'unknown_tool');

      // C compaction family (24.09): count this invocation as an active tool turn so user-triggered
      // turn-level operations (mid-loop delta reset + history compression inside preprocess()) can be
      // serialized against live loops via drainActiveToolTurns(). endToolCall MUST run in finally — a
      // thrown implementation must still release the slot or every later drain would time out.
      TokenStatsManager.beginToolCall(raw.name);
      let result: unknown;
      try {
        result = await original(params, ctx);
        // A spill pattern — immediate inline spill for oversized string results
        if (config.compactionEnabled !== false && typeof result === 'string') {
          // Use compaction max bytes config as spill threshold
          const maxBytes = typeof config.compactionMaxResultBytes === 'number' && config.compactionMaxResultBytes > 0 ? config.compactionMaxResultBytes : 16 * 1024;
          result = await spillTextIfNeeded(result, maxBytes);
        }
      } finally {
        TokenStatsManager.endToolCall(raw.name);
      }

      // LLM-side limit awareness (02.10, owner decision; trigger surface widened 03.10 per option B): a compact
      // context-usage footer is surfaced once projected chat usage crosses half the window (format A; near-limit
      // advisory at >=90% — see utils/contextUsageFooter.ts). Two additive forms: STRING results get it appended;
      // PLAIN-OBJECT results gain exactly one new field `ctx_footer` holding the identical message (the
      // executedTool-stamp pattern — strictly additive, no existing key can collide: grep-verified across src/ +
      // tests/ before introduction). Since every registered ai_toolbox tool ends in an object envelope (source
      // audit 03.10 ~11:3x), this widens the real trigger surface from zero to all tools; arrays, class instances
      // and other non-object payloads stay byte-identical on both forms. The field is added BEFORE recordToolResult
      // below (and before the executedTool stamp's combined spread): the mid-loop delta — and thus
      // guardMidLoopThreshold's numbers — then reflect what actually enters context (the post-footer payload). The
      // projection adds this payload's own estimate plus the footer's self-size so the gate decision accounts for
      // both. Suppressed entirely when no turn baseline was published (baseline === 0): without one, usage could
      // read as "mostly this tool result" and mislead — same no-misleading-numbers rule as recordToolResult's
      // combined-value guard. Best-effort side effect: any failure is logged, never thrown into the tool call.
      {
        const footerAppliesTo =
          typeof result === 'string' ||
          (result !== null &&
            typeof result === 'object' &&
            !Array.isArray(result) &&
            Object.getPrototypeOf(result) === Object.prototype);
        if (config.contextUsageFooter !== false && footerAppliesTo) {
          try {
            const baseline = TokenStatsManager.getTurnBaseline();
            if (baseline > 0) {
              // A live baseline means the current suppression window (if any) is over — re-arm so a
              // LATER publish-skip on a future turn warns fresh instead of inheriting this flag.
              footerSuppressionNotified = false;
              const limit = TokenStatsManager.getMaxContextTokens();
              // Payload self-size — mirrors TokenStatsManager.measurePayloadChars: raw length for strings,
              // JSON-serialized length for objects (with the same non-serializable fallback).
              let payloadChars: number;
              if (typeof result === 'string') {
                payloadChars = result.length;
              } else {
                try {
                  payloadChars = JSON.stringify(result)?.length ?? 0;
                } catch {
                  payloadChars = String(result).length;
                }
              }
              const projected =
                baseline +
                TokenStatsManager.getMidLoopDeltaTokens() +
                estimateTokensFromChars(payloadChars) +
                FOOTER_TOKEN_ESTIMATE;
              const footer = buildContextUsageFooter(projected, limit);
              if (footer !== undefined) {
                // Strictly additive: string append (02.10 form) or new plain-object key (03.10 option B).
                // A tool that already set `ctx_footer` wins — never clobber an implementation-owned value.
                if (typeof result === 'string') {
                  result += `\n\n${footer}`;
                } else {
                  const obj = result as Record<string, unknown>;
                  if (obj.ctx_footer === undefined) {
                    obj.ctx_footer = footer;
                  }
                }
              }
            } else if (!footerSuppressionNotified) {
              // FAIL-LOUD (03.10 incident ctx_1791025835710): baseline === 0 = this turn's preprocess() never
              // reached its single setTurnEvaluation publish point (a throw between resetMidLoopDelta and the
              // publish, or an early return). The footer is suppressed by design (no-misleading-numbers rule),
              // but that silence used to be invisible in the log — one warn per suppression window names it.
              // Results stay byte-identical; only this console line changes.
              footerSuppressionNotified = true;
              console.warn('[AI Toolbox] [CTX-FOOTER] suppressed: turn baseline not published (preprocess() publish ' +
                'skipped or failed) — no usage footer on tool results until the next user message republishes it.');
            }
          } catch (err) {
            console.warn('[AI Toolbox] [CTX-FOOTER] Usage footer failed (non-fatal):', err);
          }
        }
      }

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
      //  - plain-object results gain at most TWO wrapper-added fields (`executedTool` here and `ctx_footer`
      //    from the CTX-FOOTER block above when gated — 03.10 option B); no existing key collides with either
      //    (verified by grep across src/ + tests/ before each introduction), wrapper values are authoritative;
      //  - numbers, booleans, arrays, null, undefined and class instances pass through byte-identical
      //    (prototype check excludes non-plain objects so their shape never changes); the ONLY string mutation
      //    in this wrapper is the context-usage footer appended ABOVE by the CTX-FOOTER block when gated (02.10) —
      //    it appends to strings only; its object form adds a new key ABOVE this section, which the single combined
      //    spread below ({ ...result, executedTool }) then carries through untouched;
      //  - routing, side effects, timing and error propagation are untouched.
      const executedTool = raw.name ?? 'unknown_tool';
      // Loop hygiene B — repeat tool reminder advisory
      const advice = repeatReminder.check(executedTool, params);
      if (advice) {
        console.warn('[RepeatToolReminder]', advice);
      }
      if (
        result !== null &&
        typeof result === 'object' &&
        !Array.isArray(result) &&
        Object.getPrototypeOf(result) === Object.prototype
      ) {
        // E house rule — model-visible ⟺ logged invariant
        const stamped = { ...result, executedTool };
        // FAIL-LOUD: ensure the model-visible field is present and loggable
        if (stamped.executedTool !== executedTool) {
          console.error('[AI Toolbox] [E HOUSE RULE] FAIL-LOUD: executedTool stamp missing from model-visible result');
        }
        console.log('[AI Toolbox] [E HOUSE RULE] model-visible ⟺ logged: executedTool=', executedTool, 'for', raw.name);
        return stamped;
      }
      return result;
    };

    return { ...t, implementation: wrapped } as Tool;
  });

  console.log(`[AI Toolbox] Exposed ${instrumented.length} tools to LLM.`);
  return instrumented;
}
