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
// FIX #21 (09.10, two-tier mid-loop save): guard-instance read access + the canonical Arc-C persist path for
// the wrapper-side FORCED 90% session-memory save — same machinery PART B uses at compression time; both are
// cycle-free here (only index.ts imports toolsProvider's module-level state via getStateManager).
import { getContextGetter } from './promptPreprocessor.js';
import { persistGeneratedSessionSummary } from './sessionSummaryPersist.js';
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

/** FIX B (09.10) — structural message shape accepted by ContextGuard methods (same contract as the wrapper's tier-2 call, which passes
 * getTurnMessages()'s Record<string, unknown>[] uncast). Declared here to keep the compressMidLoop cast target explicit without importing
 * contextGuard into this module (only index.ts imports it at runtime — see the cycle note in toolsProvider's FIX #21 import comment). */
type ContextMessageLike = { role?: string; content?: unknown; [key: string]: unknown };

/** FIX B (09.10) — minimal structural view of the host client reachable from a tool-call context. The SDK types ToolCallContext.client as
 * PluginContext with llm.history(): Promise<ChatHistory>; this file does NOT import the SDK type for that node (the existing tier-2 block
 * treats `ctx` as unknown too), so every hop is optional-chained and duck-typed at use — a host shape without history support simply takes
 * compressMidLoop's documented no-swap fallback instead of a hard failure. */
type PluginContextLike = { client?: { llm?: { history?: () => Promise<{ getLength(): number; pop(): unknown; append(m: unknown): void }> } }; };
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

/** FIX #21 (09.10, two-tier spec): one-shot marker for the current turn — once the mid-loop FORCED 90% session-
 * memory save has fired (or was attempted) this turn, no further tool result may fire it again: idempotent by
 * design, exactly like the footer suppression flag above. Reset at EVERY toolsProvider() entry (= new turn per
 * the same house convention as resetToolGuard()/repeatReminder.nextTurn()); the mid-loop delta itself is
 * per-turn too (resetMidLoopDelta in preprocess), so a fresh turn re-arms both together. */
let forcedSaveFiredThisTurn = false;

/** Test hook: re-arm the once-per-turn forced-save flag (module state would otherwise leak across suites). */
export function resetForcedSaveFlagForTests(): void {
  forcedSaveFiredThisTurn = false;
}

// ==================== FIX B (09.10, owner GO): pre-emptive mid-loop compression at ~95% ====================

/**
 * FIX B (09.10, owner GO) — pre-emptive mid-loop compression threshold as % of the model context window. FIXED constant by design
 * (no new config key — house stance from the 08.10 two-tier spec "No new config key"; owner-approved "@~95%"): always below the
 * model's 100% hard wall and above tier-2's crossing at contextGuardCompressionPercent (schema min 50 / default 90; even at the schema
 * max of 100 the constant stays strictly below the wall, which is exactly its job). Rationale for not deriving it from
 * compressionPercent: a user-configured 100% must still leave pre-emptive protection in place. See 09.10 verification session —
 * between tier-2's ~90% forced SAVE and the 100% stop there used to be NOTHING, so run-away turns died at the wall (owner had to
 * enlarge the context window; same failure twice in one day). Lives here because the trigger decision needs the shared projection
 * numbers that only this wrapper computes; contextGuard.compressMidLoop() is the pipeline it calls.
 */
const PREEMPTIVE_COMPRESSION_PERCENT = 95;

/** FIX B (09.10): one-shot marker for the current turn — once mid-loop compression has fired (or been attempted) this turn, no
 * further tool result may fire it again: idempotent by design, exactly like forcedSaveFiredThisTurn above. The two latches are
 * INDEPENDENT on purpose: a save at ~90% must not suppress the pre-emptive compression at ~95%, and vice versa (a compressed turn
 * re-crosses neither gate). Reset at EVERY toolsProvider() entry (= new turn) together with forcedSaveFiredThisTurn. */
let midLoopCompactionFiredThisTurn = false;

/** Test hook (mirrors resetForcedSaveFlagForTests): re-arm the once-per-turn mid-loop compression latch. */
export function resetMidLoopCompactionFlagForTests(): void {
  midLoopCompactionFiredThisTurn = false;
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
  // FIX #21 (09.10): re-arm the once-per-turn forced session-memory save flag at provider entry (= new turn)
  forcedSaveFiredThisTurn = false;
  // FIX B (09.10): re-arm the independent pre-emptive mid-loop compression latch on the SAME new-turn convention
  midLoopCompactionFiredThisTurn = false;

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
    contextGuardCompressionPercent: pluginConfig.get('contextGuardCompressionPercent'), // 📊 07.10: percent of context window (was absolute contextGuardTokenLimit)
    contextGuardForceSummaryOnCompress: pluginConfig.get('contextGuardForceSummaryOnCompress'), // 💾 07.10 arc C: forced structured session-memory save at the compression trigger (see src/sessionSummaryPersist.ts)
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
        // FIX #21 (09.10, two-tier spec): shared projection numbers — computed ONCE per wrapper pass whenever a live
        // baseline exists and consumed by BOTH consumers below with INDEPENDENT gates: the LLM-side usage footer
        // (contextUsageFooter toggle) and the mid-loop forced 90% session-memory save (contextGuardEnabled + threshold
        // crossing). One computation keeps both gate decisions provably identical — a forked copy of this math could let
        // the two triggers silently disagree about "current" usage.
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

          if (config.contextUsageFooter !== false && footerAppliesTo) {
            try {
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
              } catch (err) {
                console.warn('[AI Toolbox] [CTX-FOOTER] Usage footer failed (non-fatal):', err);
              }
            }

            // FIX #21 (09.10, two-tier spec TIER 2 — forced save ONLY, no mid-turn compression): when the shared
              // projection crosses the user-configured compression percentage of the model window (default 90% — the same
              // value PART B compresses at on the NEXT user message), persist a structured session-continuity summary
              // MID-LOOP so context blow-up stops accumulating past that point — exactly what tier 1's interactive prompt
              // cannot catch, because nobody is listening inside a tool loop. SAVE ONLY by owner spec: history compression
              // stays at the next user message (PART B); nothing here mutates messages. Same Arc-C machinery as PART B:
              // generateSessionContinuity over everything EXCEPT the last 10 messages (caller-side keepLast exclusion,
              // mirroring compressHistory's slice(0,-keepLast)) + persistGeneratedSessionSummary through the canonical
              // save_session_summary writer path. Gates: config read LIVE from pluginConfig so a UI toggle change takes
              // effect within this same provider run; strict `=== true` (not truthy) mirrors PART B — pinned harness stubs
              // return undefined for unknown keys and must be skipped, exactly like Arc C's own gate.
              const percent = pluginConfig.get('contextGuardCompressionPercent');
              if (!forcedSaveFiredThisTurn
                  && config.contextGuardEnabled === true
                  && limit > 0
                  && typeof percent === 'number' && Number.isFinite(percent) && percent > 0
                  && projected >= (limit * percent / 100)) {
                const guard = getContextGetter();
                if (guard !== null && typeof guard.generateSessionContinuity === 'function') {
                  forcedSaveFiredThisTurn = true; // latch BEFORE the await: a throw or failure must not re-arm mid-turn
                  try {
                    const turnMessages = TokenStatsManager.getTurnMessages() ?? [];
                    // FIX #21 gate-5 fix (F2): minimum meaningful summarizable span — computed BEFORE the guard so it is
                    // declared before use. Fire only when at least keepLast(10) messages lie PAST the last-10 live
                    // exclusion: toSummarize.length >= 10 INCLUSIVE (turn list len=20 fires exactly, per test pins); a
                    // shorter list (or an ABSENT publish, coalesced to [] above) has nothing summarizable yet →
                    // deterministic skip below, latch still holds.
                    const toSummarize = turnMessages.slice(0, Math.max(0, turnMessages.length - 10));
                    if (toSummarize.length >= 10) {
                      // keepLast=10 exclusion on the CALLER side — same slice(0,-keepLast) contract as PART B: the last
                      // 10 messages are still live context this turn and stay out of the summary. The published list is the
                      // LIVE post-compression array from Step 2's single publish point, never stale pre-compression history.
                      await autoTracker.flushActionsToMemory(); // buffered actions land in the store before the summary spans them (PART B parity)
                      // No cast needed: getTurnMessages() returns Record<string, unknown>[], already assignable to the
                      // ContextMessage parameter (role?/content? optional + index signature) — same uncast call as PART B.
                      const summary = await guard.generateSessionContinuity(toSummarize);
                      if (summary) {
                        const persistOutcome = await persistGeneratedSessionSummary(summary);
                        console.log(persistOutcome.saved
                          ? '[AI Toolbox] [TIER-2] ✅ Mid-loop forced session-memory save persisted before context crossed the compression threshold'
                          : `[AI Toolbox] [TIER-2] ⚠️ Continuity summary generated but persistence failed (${persistOutcome.error ?? 'unknown'}) — telemetry only`);
                      } else {
                        console.warn('[AI Toolbox] [TIER-2] No structured continuity summary available (no usable model) — save skipped, compression still pending at next user message');
                      }
                    } else {
                      console.log('[AI Toolbox] [TIER-2] Forced-save gate crossed but published turn list leaves <10 messages to summarize after the last-10 exclusion — nothing summarizable yet; one-shot flag is latched (no re-fire this turn), PART B at the next user message covers it');
                    }
                  } catch (tierErr) {
                    // Non-fatal by owner spec: a save failure must never break a successful tool call or delay its result.
                    console.warn(`[AI Toolbox] [TIER-2] Mid-loop forced session-memory save failed (non-fatal): ${tierErr instanceof Error ? tierErr.message : String(tierErr)}`);
                  }
                } // else: guard not yet constructed (null) or a stub instance without the method — deterministic skip, logged by no one (pre-startup window is harmless; PART B covers it)
          }

          // FIX B (09.10, owner GO — pre-emptive mid-loop compression): when the shared projection crosses PREEMPTIVE_COMPRESSION_PERCENT
          // (~95% of the model window), run the FULL PART-B pipeline MID-LOOP via guard.compressMidLoop() — prune → snapshot → Arc-C save →
          // compressHistory. This is the rung that was MISSING between tier-2's ~90% forced SAVE (memory only, never shrinks context) and the
          // model's 100% hard stop: before this block a run-away turn could cross 90%, keep accumulating tool payloads and die at the wall —
          // exactly what happened twice on 09.10 until the owner enlarged the context window (see verification session). Gates mirror tier-2's
          // sibling above with one stricter addition: `typeof guard.compressMidLoop === 'function'` so stub/fake guards in tests and legacy
          // builds skip deterministically (the method only exists on real ContextGuard instances since 09.10). INDEPENDENT one-shot latch:
          // latched BEFORE the first await, a failure must not re-arm mid-turn; after a SUCCESSFUL compression the baseline republish below
          // drops every later projection far under both gates for this turn anyway (same no-op window as PART B's post-compression recount).
          const preemptiveLimit = limit * PREEMPTIVE_COMPRESSION_PERCENT / 100;
          if (!midLoopCompactionFiredThisTurn
              && config.contextGuardEnabled === true
              && limit > 0
              && projected >= preemptiveLimit) {
            const compactGuard = getContextGetter();
            if (compactGuard !== null && typeof compactGuard.compressMidLoop === 'function') {
              midLoopCompactionFiredThisTurn = true; // latch BEFORE the first await: a throw or failure must not re-arm mid-turn
              try {
                const turnMessages = TokenStatsManager.getTurnMessages() ?? [];
                if (turnMessages.length <= 10) {
                  // Nothing summarizable past keepLast(10) yet — same skip semantics as tier-2's gate-5; latch still holds.
                  console.log('[AI Toolbox] [TIER-2-COMPACT] Pre-emptive threshold crossed but published turn list leaves ≤ keepLast(10) messages — compression skipped this pass');
                } else {
                  const outcome = await compactGuard.compressMidLoop(turnMessages as ContextMessageLike[], {
                    compactionEnabled: config.compactionEnabled !== false, // default ON (PART B parity); explicit false opts out of pruning only
                    forceSummaryOnCompress: pluginConfig.get('contextGuardForceSummaryOnCompress') === true, // STRICT — Arc C gate parity
                    currentTokens: projected, // live wrapper projection → PART-B snapshot telemetry (no NaN records)
                    maxTokens: limit,
                  });
                  if (outcome.compressed) {
                    // REBUILD the host history with the replacement array — EXACTLY the pop/append swap PART B in promptPreprocessor performs.
                    try {
                      const maybeCtx = ctx as PluginContextLike | null; // structural view of the tool-call context's client hop (see type doc above)
                      const hostHistory = await maybeCtx?.client?.llm?.history?.();
                      if (hostHistory && typeof hostHistory.getLength === 'function' && typeof hostHistory.pop === 'function') {
                        while ((hostHistory.getLength() ?? 0) > 0) hostHistory.pop();
                        for (const msg of outcome.messages as unknown[]) hostHistory.append(msg);
                        // FIX #21 parity: re-publish the POST-compression list so tier-2/guard never see destroyed messages on later results.
                        TokenStatsManager.setTurnMessages(outcome.messages);
                      } else {
                        console.warn('[AI Toolbox] [TIER-2-COMPACT] Host history handle unavailable — compression produced a replacement array but it could NOT be swapped in; PART B at the next user message will compress natively (safe)');
                      }
                    } catch (swapErr) {
                      // Non-fatal: host state stays as-is; the next boundary (PART B) still sees the original history and compresses there.
                      console.warn(`[AI Toolbox] [TIER-2-COMPACT] Host-history swap failed (non-fatal): ${swapErr instanceof Error ? swapErr.message : String(swapErr)}`);
                    }
                    // FIX #20 A2 parity: recount the NEW history so the republished baseline reflects post-compression reality. The wrapper has no
                    // imageCount/historyTextLength inputs, so countTokens() takes its SDK-native/tiktoken path over the array — the same class of
                    // estimate PART B's own FIX #20 A2 recount accepts (it is a conservative guard input, never a display figure).
                    try {
                      // No cast needed (10.10 tsc gate round 1): compressMidLoop's return already types messages as
                      // ContextMessage[] — an `as unknown[]` downcast broke assignability against countTokens' parameter.
                      const postCompactCount = await compactGuard.countTokens(outcome.messages, 0);
                      TokenStatsManager.setTurnEvaluation(postCompactCount, limit);
                      console.log(`[AI Toolbox] [TIER-2-COMPACT] ✅ Pre-emptive mid-loop compression complete — baseline republished at ${postCompactCount} tokens (was ≥${Math.round(preemptiveLimit)})`);
                    } catch (recountErr) {
                      // Non-fatal — worst case the guard keeps a stale-HIGH baseline (conservative direction: may snapshot early, PART B parity).
                      console.warn(`[AI Toolbox] [TIER-2-COMPACT] Post-compression recount failed (non-fatal, keeping pre-compression baseline): ${recountErr instanceof Error ? recountErr.message : String(recountErr)}`);
                    }
                  } else {
                    // compressMidLoop's internal authoritative recount came in below its own trigger — nothing ran; deterministic log lives there.
                    console.log('[AI Toolbox] [TIER-2-COMPACT] Pre-emptive threshold crossed but internal recount below compression trigger — no compression ran this pass');
                  }
                }
              } catch (compactErr) {
                // Non-fatal by owner spec: a compaction failure must never break or delay a successful tool call.
                console.warn(`[AI Toolbox] [TIER-2-COMPACT] Mid-loop compression failed (non-fatal): ${compactErr instanceof Error ? compactErr.message : String(compactErr)}`);
              }
            } // else: guard not yet constructed (null) or a stub without the method — deterministic skip (tests / pre-startup window; PART B covers it)
          }
        }

        // FIX #21 re-nest (09.10, gate-trio fix): pre-#21 this suppression warn was the `else if` of the live-baseline branch
        // above — it ONLY fires when baseline === 0, so after the lift-up it sits as a SIBLING of that branch here (inside
        // block B where `baseline`/`footerAppliesTo` are in scope; OUTSIDE C, or the gate could never be true) with an
        // explicit `baseline === 0` gate + the ORIGINAL outer conditions kept VERBATIM (footer toggle + payload shape) =
        // byte-identical behavior to pre-#21 in every baseline-missing scenario. The old outer try/catch was removed with the
        // lift-up — its orphaned tail (and one stray brace) is what the gate trio caught at 508/514/565 today; a footer-build
        // failure while baseline === 0 simply never happened pre-#21 either (the consumer only runs inside that branch), so
        // dropping the catch loses nothing observable.
        if (config.contextUsageFooter !== false && footerAppliesTo && baseline === 0 && !footerSuppressionNotified) {
          // FAIL-LOUD (03.10 incident ctx_1791025835710): baseline === 0 = this turn's preprocess() never reached
          // its single setTurnEvaluation publish point (a throw between resetMidLoopDelta and the publish, or an
          // early return). The footer is suppressed by design (no-misleading-numbers rule), but that silence used
          // to be invisible in the log — one warn per suppression window names it. Results stay byte-identical;
          // only this console line changes.
          footerSuppressionNotified = true;
          console.warn('[AI Toolbox] [CTX-FOOTER] suppressed: turn baseline not published (preprocess() publish ' +
            'skipped or failed) — no usage footer on tool results until the next user message republishes it.');
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
