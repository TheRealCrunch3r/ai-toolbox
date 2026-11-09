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
// MEMORY-RECALL (03.11): read-only ID-first recall (mode=index/fetch) over context entries + memory facts + sessions index; additive, no StateManager dependency.
import { registerMemoryRecallTool } from './tools/memoryRecallTool.js';
// Static import (NOT dynamic): the CJS Jest transform cannot resolve `await import(...)`
// without --experimental-vm-modules (throws ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG).
// jest.config.cjs already maps './toolsSchemaMinifier.js' -> src/toolsSchemaMinifier.ts,
// and the minifier is a pure module (type-only imports), so static loading is safe and cheap.
import { minifyTools } from './toolsSchemaMinifier.js';
import { reportToolSchemas, getToolOverheadChars } from './toolOverhead.js'; // FIX #2 (30.10): fresh host-history recount needs the tool-definition overhead parity with PART B's Step 0.5 / FIX-1A char sums
// 📦 UPDATE-CHECK (19.10): quiet GitHub Releases check + in-app notify — non-fatal side effect hosted at provider exit; module is a pure state+fetch helper (no tool registration, no cycles).
import { getUpdateStatus, hasBeenNotified, markNotified, markToastDispatched, LOCAL_VERSION } from './updateChecker.js'; // UPDATE-ANNOUNCE (19.10): the announcement accessor is consumed by promptPreprocessor.ts via its OWN direct updateChecker import — deliberately NOT re-exported through here (eslint no-unused-vars would flag it; 21:0x)
// 📦 UPDATE-CHECK PHASE 2 (19.10, owner GO): dismiss-reminder tool — the user-facing half of the dismissed[] machinery Phase 1 built without a caller; same gate as the check itself.
import { registerUpdateReminderTools } from './tools/updateReminderTools.js';
// FIX #20 (A1+A2): mid-loop context growth — payload bookkeeping + proactive checkpoint guard.
import { autoTracker } from './autoTracker.js';
import { TokenStatsManager, estimateTokensFromChars, estimateTokensFromCharsOfClass } from './tokenStatsManager.js'; // CTX-EST A (31.10): class-aware variant for the mid-loop payload self-size term
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
// Budget-Guard-Arc M2 (05.11, owner GO 04.11): budget-aware spill cap + self-describing marker — the FOURTH consumer of this wrapper's
// shared projection (CTX-FOOTER / tier-2 / FIX-B are consumers 1–3); pure decision from src/budgetGuard.ts, no shared-state mutation.
import { evaluateBudgetSpill, buildBudgetSpillMarker, resolveAutopauseThresholdPct, buildBudgetAutoPersistMarker } from './budgetGuard.js'; // + M3 (05.11): auto-persist threshold resolution & marker for the wrapper's session-scoped autopause rung

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
type PluginContextLike = {
  client?: {
    llm?: { history?: () => Promise<{ getLength(): number; pop(): unknown; append(m: unknown): void; at?(i: number): unknown }> }; // FIX #2 (30.10): optional .at() — the fresh host-history recount indexes messages like PART B's FIX-1A fmView loop; hosts/stubs without it take the 0-char fallback
    // UPDATE-CHECK (19.10): duck-typed SystemNamespace.notify hop — shape verified against the installed @lmstudio/sdk d.ts
    // (BackendNotification = { title, description?, noAutoDismiss? }); optional-chained at use so harness stubs and older hosts skip deterministically.
    system?: { notify?: (n: { title: string; description?: string; noAutoDismiss?: boolean }) => Promise<void> | void };
  };
};
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

/** Budget-Guard-Arc M3 (05.11, owner GO 04.11): SESSION-scoped one-shot for the auto-persist at the autopause edge
 * (~85 % of the window) — once the automatic session-memory checkpoint has fired (or been attempted), no later tool
 * result may fire it again in this process: max ONE Arc-C regeneration per session, then only footer escalation
 * (RESEARCH_budget-guard.md §M3 "Offen" point, resolved by the 04.11 spike order — save-loop avoidance). DELIBERATELY NOT
 * reset at toolsProvider() entry — unlike forcedSaveFiredThisTurn / midLoopCompactionFiredThisTurn above: this latch is
 * per SESSION (= plugin process lifetime; a fresh LM Studio session reloads the module and starts un-latched), not per
 * turn. A new chat within one app session does NOT re-arm it — by design (M3 is insurance: at most one expensive
 * regeneration until reload). Reset ONLY via resetAutoPersistFlagForTests() below (hermetic suites). */
let autoPersistFiredThisSession = false;

/** Test hook (mirrors resetForcedSaveFlagForTests): re-arm the once-per-session M3 auto-persist latch. */
export function resetAutoPersistFlagForTests(): void {
  autoPersistFiredThisSession = false;
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
  // Option A (02.11): global scope — settings persist across chats and app restarts (was per-chat).
  const pluginConfig = ctl.getGlobalPluginConfig(configSchematics);
  
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
    // 📦 UPDATE-CHECK (19.10): quiet GitHub Releases check — exhaustive-literal completeness after config.ts schema extension (see src/updateChecker.ts)
    updateCheckEnabled: pluginConfig.get('updateCheckEnabled'),
    temporalAwareness: pluginConfig.get('temporalAwareness'),
    dateFormatStyle: pluginConfig.get('dateFormatStyle') as 'standard' | 'heuteIst',
    contextGuardEnabled: pluginConfig.get('contextGuardEnabled'),
    contextGuardCompressionPercent: pluginConfig.get('contextGuardCompressionPercent'), // 📊 07.10: percent of context window (was absolute contextGuardTokenLimit)
    contextGuardAgenticDensity: pluginConfig.get('contextGuardAgenticDensity'), // 🔢 15.10: user-editable agentic chars-per-token density — exhaustive-literal completeness after config.ts schema extension; consumed per-turn by promptPreprocessor's reseed (tokenStatsManager live state)
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
    budgetGuardEnabled: pluginConfig.get('budgetGuardEnabled'), // Budget-Guard-Arc (05.11) flat host-facing keys — assembled into the nested block below
    budgetGuardAdvisoryThresholdPct: pluginConfig.get('budgetGuardAdvisoryThresholdPct'),
    budgetGuardSpillThresholdPct: pluginConfig.get('budgetGuardSpillThresholdPct'),
    budgetGuardAutopauseThresholdPct: pluginConfig.get('budgetGuardAutopauseThresholdPct'),
    budgetGuardSafetyMarginPct: pluginConfig.get('budgetGuardSafetyMarginPct'),
    budgetGuard: { // Budget-Guard-Arc (05.11): host-facing FLAT schematics keys → nested block per plan step 5;
      enabled: pluginConfig.get('budgetGuardEnabled'),
      advisory_threshold_pct: pluginConfig.get('budgetGuardAdvisoryThresholdPct'),
      spill_threshold_pct: pluginConfig.get('budgetGuardSpillThresholdPct'),
      autopause_threshold_pct: pluginConfig.get('budgetGuardAutopauseThresholdPct'),
      safety_margin_pct: pluginConfig.get('budgetGuardSafetyMarginPct'),
    }, // consumed by the read-tool pre-call gate (M1) and, from step 3 on, the wrapper spill cap (M2)
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
    // MEMORY-RECALL (03.11): read-only ID-first recall (index/fetch); rides the contextManagement toggle with the memory family — pure raw-decode reads, no StateManager instance needed.
    { key: 'contextManagement', register: () => registerMemoryRecallTool(config) },
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
    // 📦 UPDATE-CHECK PHASE 2 (19.10): dismiss-reminder tool — gated by the SAME updateCheckEnabled toggle as the provider IIFE check above; godMode enables it like every other entry.
    { key: 'updateCheckEnabled', register: () => registerUpdateReminderTools(config) },
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
          const absoluteMaxBytes = typeof config.compactionMaxResultBytes === 'number' && config.compactionMaxResultBytes > 0 ? config.compactionMaxResultBytes : 16 * 1024;
          // M2 Budget-aware Spill (Budget-Guard-Arc, owner GO 04.11) — the wrapper's shared projection gets a FOURTH consumer here:
          // when it would cross limit×(1−safety_margin_pct/100), cap this inline spill at a budget-relative char count so the
          // post-spill preview still fits inside the remaining budget. The STRICTER bound wins (absolute cap vs. budgetChars); the full
          // payload is stored verbatim on disk by spillTextIfNeeded() either way — M2 only tightens the preview and stamps a self-
          // describing 'SPILLED by budget guard' marker. Pure decision from src/budgetGuard.ts (no shared-state mutation); when the gate
          // doesn't fire, or before the first preprocess() publishes baseline/limit, the legacy absolute-cap path runs byte-identically.
          const spillDecision = evaluateBudgetSpill({ payloadChars: result.length, toolName: raw.name }, { config });
          let spillMaxBytes = absoluteMaxBytes;
          let spillReason: string | undefined;
          if (spillDecision.shouldBudgetSpill) {
            // UTF-8 worst case ≤ 4 bytes per char — never over-reserve the byte budget.
            const budgetBytes = Math.max(1024, Math.floor((spillDecision.budgetChars ?? 0) * 4));
            spillMaxBytes = Math.min(absoluteMaxBytes, budgetBytes); // STRICTER bound wins (plan step 3 / spike order 04.11)
            spillReason = buildBudgetSpillMarker(spillDecision, config);
          }
          result = await spillTextIfNeeded(result, spillMaxBytes, spillReason);
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
            estimateTokensFromCharsOfClass(payloadChars, 'highEntropy') + // CTX-EST A (31.10): this payload is a tool result — same class as the recorded delta; bounded by HIGH_ENTROPY_DENSITY_FLOOR
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
                  // LATCH SUB-ITEM (30.10, owner GO — FIX #1 Part A guard): PART B's FRESH boundary recount has already
                  // proven this chat's window unrecoverable in-band — the TIER-2 save cannot shrink host history either,
                  // and per-step provider re-entry would reset forcedSaveFiredThisTurn below and re-run Arc-C regeneration
                  // (up to a 60s summarization prediction) on EVERY model step. Skip with the one-shot log in the else-if.
                  && !TokenStatsManager.getUnrecoverableWindow()
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
                      // ACTIVE-CHAT-MODEL FALLBACK (09.11, owner GO): pass the last auto-detected chat model id so this
                      // save works when contextGuardSummaryModel is empty — previously resolve-to-null ("no usable model").
                      const tier2FallbackId = TokenStatsManager.getActiveChatModelId();
                      const summary = await guard.generateSessionContinuity(toSummarize, tier2FallbackId ? { fallbackModelId: tier2FallbackId } : undefined);
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
          } else if (config.contextGuardEnabled === true
                  && limit > 0
                  // LATCH SUB-ITEM (30.10): the TIER-2 gate above with its latch condition inverted — i.e. this pass would have fired but the proven-unrecoverable window withheld it. Mirroring every other condition keeps the log honest: no "skipped" line when the gate wouldn't have crossed anyway (toggle off, percent raised above usage).
                  // DELIBERATELY EXCLUDES !forcedSaveFiredThisTurn (gate-4 fix 30.10): that wrapper-local flag resets at EVERY toolsProvider() entry — exactly the per-step re-entry bug this latch exists for — so it cannot be part of the skip condition without defeating one-shot logging across provider re-entries. One-shotness lives in TokenStatsManager's module-level unrecoverableSkipLoggedTier2 (survives provider re-entry; reset only by set/clear transitions).
                  && typeof percent === 'number' && Number.isFinite(percent) && percent > 0
                  && projected >= (limit * percent / 100)) {
            // One-shot FAIL-LOUD skip log per transition (the module-level flag resets on clear/set, so later model steps stay silent instead of re-spending the pipeline or repeating this line).
            TokenStatsManager.logUnrecoverableSkip('tier2');
          }

          // ==================== Budget-Guard-Arc M3 (05.11, owner GO 04.11): auto-persist session memory at the autopause edge (~85 %) ====================
          // Insurance rung of the arc — deliberately BELOW tier-2's user-configured forced save (~90 %) and FIX B's fixed pre-emptive
          // compression (95 %), placed after both blocks: when the shared projection crosses limit×(autopause_threshold_pct/100) ONE structured
          // session-continuity summary is persisted AUTOMATICALLY so context loss can never happen without a trail. Same Arc-C machinery as
          // tier-2's sibling above (generateSessionContinuity over everything EXCEPT keepLast(10) + the canonical persistGeneratedSessionSummary
          // writer path); M3 adds the self-describing `auto_saved=true` marker on task_description so the NEXT restore_session_context dossier
          // shows it as its own note. Latch BEFORE the first await (a throw/failure must not re-arm), and UNLIKE tier-2/FIX-B latches this one is
          // SESSION-scoped: it does NOT reset at toolsProvider() entry — max ONE regeneration per session, then only footer escalation
          // (save-loop avoidance). Master-switch gated on budgetGuard.enabled === true; with the default OFF config this whole block is dead
          // code and behavior stays byte-identical legacy. The 85/90/95 rung order above stays intact — M3 checkpoints, it caps nothing
          // and never compresses. Non-fatal by house rule: any failure must never break or delay a successful tool result.
          const autopausePct = resolveAutopauseThresholdPct(config);
          if (!autoPersistFiredThisSession
              && config.budgetGuard?.enabled === true
              && limit > 0
              // M3-LATCH-GAP (09.11, owner GO A): same proven-unrecoverable guard as the TIER-2 / FIX-B siblings — without it this
              // SESSION-scoped one-shot could burn its single Arc-C regeneration on a provably futile pass inside an unrecoverable
              // window; with it the latch survives until reload (or PART B recovery) for when M3 can actually help. Skip log: the
              // mirror else-if below, same parity as both siblings'.
              && !TokenStatsManager.getUnrecoverableWindow()
              && projected >= (limit * autopausePct / 100)) {
            autoPersistFiredThisSession = true; // latch BEFORE the first await: a throw or failure must not re-arm mid-session
            const m3Guard = getContextGetter();
            if (m3Guard !== null && typeof m3Guard.generateSessionContinuity === 'function') {
              try {
                const turnMessagesM3 = TokenStatsManager.getTurnMessages() ?? [];
                // keepLast=10 exclusion on the CALLER side — same slice(0,-keepLast) contract as tier-2's sibling above (FIX #21 gate-5).
                const toSummarizeM3 = turnMessagesM3.slice(0, Math.max(0, turnMessagesM3.length - 10));
                if (toSummarizeM3.length >= 10) {
                  await autoTracker.flushActionsToMemory(); // buffered actions land in the store before the summary spans them (PART B parity)
                  // ACTIVE-CHAT-MODEL FALLBACK (09.11, owner GO): same fallback wiring as the TIER-2 sibling above —
                  // mid-loop auto-persist resolves a usable model even with an empty contextGuardSummaryModel.
                  const m3FallbackId = TokenStatsManager.getActiveChatModelId();
                  const m3Summary = await m3Guard.generateSessionContinuity(toSummarizeM3, m3FallbackId ? { fallbackModelId: m3FallbackId } : undefined);
                  if (m3Summary && typeof m3Summary.task_description === 'string') {
                    // Self-describing marker FIRST (restore dossiers surface task_description first): the NEXT restore_session_context shows this save as its own note.
                    m3Summary.task_description = buildBudgetAutoPersistMarker(autopausePct, projected, limit) + m3Summary.task_description;
                    const persistM3 = await persistGeneratedSessionSummary(m3Summary);
                    console.log(persistM3.saved
                      ? `[AI Toolbox] [M3-AUTOSAVE] ✅ Session summary auto-persisted at ~${Math.round(projected).toLocaleString('en-US')} tok (≥ ${autopausePct}% autopause edge of ${limit.toLocaleString('en-US')}) — one-shot for this session`
                      : `[AI Toolbox] [M3-AUTOSAVE] ⚠️ Continuity summary generated but persistence failed (${persistM3.error ?? 'unknown'}) — telemetry only; latch holds (no re-fire)`);
                  } else {
                    console.warn('[AI Toolbox] [M3-AUTOSAVE] No structured continuity summary available (no usable model) — auto-persist skipped, latch holds');
                  }
                } else {
                  console.log(`[AI Toolbox] [M3-AUTOSAVE] Autopause edge crossed but published turn list leaves <10 messages to summarize after the last-10 exclusion — nothing summarizable yet; one-shot latch holds (no re-fire this session)`);
                }
              } catch (m3Err) {
                // Non-fatal by house rule: a checkpoint failure must never break or delay a successful tool call.
                console.warn(`[AI Toolbox] [M3-AUTOSAVE] Mid-loop auto-persist failed (non-fatal): ${m3Err instanceof Error ? m3Err.message : String(m3Err)}`);
              }
            } // else: guard not yet constructed (null) or a stub without the method — deterministic skip (tests / pre-startup window; tier-2 covers later runs)
          } else if (config.budgetGuard?.enabled === true
              && limit > 0
              // M3-LATCH-GAP (09.11, owner GO A): mirror of the M3 gate above with ONLY its unrecoverable condition inverted — one-shot
              // FAIL-LOUD parity with the TIER-2 / FIX-B siblings; no "skipped" line when budgetGuard is off or the projection hasn't
              // crossed the autopause edge. DELIBERATELY EXCLUDES !autoPersistFiredThisSession (gate-4 fix 30.10 argument): that session
              // latch is exactly what this branch must NOT consume — one-shotness lives in TokenStatsManager's module-level
              // unrecoverableSkipLoggedM3 flag instead, which resets only on set/clear transitions like its siblings'.
              && projected >= (limit * autopausePct / 100)) {
            TokenStatsManager.logUnrecoverableSkip('m3');
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
              // LATCH SUB-ITEM (30.10, owner GO — FIX #1 Part A guard): PART B's FRESH boundary recount has already proven
              // this chat's window unrecoverable in-band — the full mid-loop pipeline (prune → snapshot → Arc-C regeneration
              // up to a 60s summarization prediction → compressHistory) is provably no-op on host history and would re-fire on
              // EVERY model step via per-step provider re-entry resetting midLoopCompactionFiredThisTurn. Skip with the one-
              // shot log in the else-if below.
              && !TokenStatsManager.getUnrecoverableWindow()
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
                    // 🔹 FIX #2 (30.10, owner GO — intra-turn gate on honest baseline; supersedes the pre-FIX-#2 compressed-array republish): counting outcome.messages measured what is NOT on the wire — SDK contract: llm.history()/pullHistory() are COPIES, so the pop/append swap above cannot shrink LM Studio's real history (29.10 incident class). Publishing that low count while BOTH per-turn gates were already latched left the rest of the turn running blind straight into the 100% wall rejection with zero in-band notice (the one-shot unrecoverable notice lives at PART B's user boundary only). FIX #2 re-pulls a FRESH host-history read via the same duck-typed hop the swap used, char-sums it exactly like PART B's FIX-1A (getText + serialized tool requests/results + tool-definition overhead) and publishes THAT as the turn baseline — then proves recovery in-band or arms the shared latch.
                    let freshChars = 0;
                    let freshReadFailed = false;
                    try {
                      const maybeCtxFresh = ctx as PluginContextLike | null; // same structural view + optional hops as the swap above
                      const hostHistoryFresh = await maybeCtxFresh?.client?.llm?.history?.();
                      if (hostHistoryFresh && typeof hostHistoryFresh.getLength === 'function' && typeof hostHistoryFresh.at === 'function') { // FIX #2: .at missing ⇒ documented fallback below instead of a TypeError mid-loop
                        for (let i = 0; i < (hostHistoryFresh.getLength() ?? 0); i++) {
                          // Structural cast — PART B FIX-1A's fmView idiom: one typed view, zero `any`.
                          const fmfView = hostHistoryFresh.at(i) as { getText?: () => string; getToolCallRequests?: () => unknown; getToolCallResults?: () => unknown } // .at() is typed unknown in PluginContextLike — direct single assertion (the `as unknown` hop PART B needed was flagged unnecessary here 30.10 lint round 1);
                          let fText = '';
                          if (typeof fmfView.getText === 'function') fText += fmfView.getText() || '';
                          try { if (typeof fmfView.getToolCallRequests === 'function') fText += JSON.stringify(fmfView.getToolCallRequests()) || ''; } catch { /* non-fatal — count what we have */ }
                          try { if (typeof fmfView.getToolCallResults === 'function') fText += JSON.stringify(fmfView.getToolCallResults()) || ''; } catch { /* non-fatal — count what we have */ }
                          freshChars += fText.length;
                        }
                      } else {
                        freshReadFailed = true; // no usable handle (stubs / older hosts) — take the documented fallback below, same as the swap-fail path
                      }
                    } catch {
                      freshReadFailed = true; // host read threw — non-fatal by owner spec: a recount failure must never break or delay the tool result
                    }
                    const overheadCharsFresh = getToolOverheadChars(); // PART B parity: serialized tool defs ride on every request
                    if (overheadCharsFresh > 0) freshChars += overheadCharsFresh;
                    let adoptedFresh = false;
                    if (!freshReadFailed && freshChars > 0) {
                      // FIX-1A adoption rule verbatim: a FRESH recount with ZERO counted chars is unusable (hermetic stubs only — production mid-loop compression always sits on real messages); adopting 0 would blind the guard, so the fallback below applies instead.
                      const freshCount = Math.round(estimateTokensFromChars(freshChars));
                      TokenStatsManager.setTurnEvaluation(freshCount, limit);
                      adoptedFresh = true;
                      console.log(`[AI Toolbox] [TIER-2-COMPACT] ✅ Pre-emptive mid-loop compression complete — baseline republished at ${freshCount.toLocaleString('en-US')} tokens from FRESH host-history recount (true usage on the wire; compressed-copy count intentionally NOT used)`);
                    } else if (freshReadFailed) {
                      // PART B catch-path parity: keep the PRE-compression turnBaseline as-is — stale-HIGH is the conservative direction. The pre-FIX-#2 fallback republish of the compressed-array count was removed deliberately (stale-LOW blinded the remaining per-turn gates).
                      console.warn('[AI Toolbox] [TIER-2-COMPACT] ⚠️ FIX #2 fresh host-history recount unavailable (no handle or read failed) — keeping pre-compression baseline (conservative direction; compressed-array count intentionally NOT published)');
                    } else {
                      // 0 chars counted but the handle WAS readable → hermetic/empty view: last-resort fallback to the compressed-array estimate.
                      const postCompactCount = await compactGuard.countTokens(outcome.messages, 0);
                      TokenStatsManager.setTurnEvaluation(postCompactCount, limit);
                      adoptedFresh = true;
                      console.log(`[AI Toolbox] [TIER-2-COMPACT] ⚠️ Fresh host-history recount counted 0 chars (hermetic/empty view) — fallback baseline ${postCompactCount.toLocaleString('en-US')} tokens from compressed array`);
                    }
                    // 🔹 FIX #2 intra-turn latch + one-shot model-visible notice: if the FRESH recount proves the window unrecoverable INTRA-TURN, arm the shared latch (identical lifecycle to PART B's boundary set — TIER-2/FIX B per-step re-fire stops for the rest of this chat via the shipped skip branches; cleared by a below-threshold PART B recount or chat reset) and tell the model ONCE, on THIS result only.
                    if (adoptedFresh && typeof compactGuard.getThreshold === 'function') {
                      const intraTurnCount = TokenStatsManager.getTurnBaseline();
                      const thresholdNow = compactGuard.getThreshold();
                      if (thresholdNow > 0 && intraTurnCount >= thresholdNow) {
                        TokenStatsManager.setUnrecoverableWindow(intraTurnCount, limit); // idempotent; re-affirmed by later boundary recounts, cleared on recovery/reset
                        console.log(`[AI Toolbox] [TIER-2-COMPACT] 🔒 FIX #2 intra-turn unrecoverable window PROVEN (fresh ${intraTurnCount.toLocaleString('en-US')} ≥ threshold ${thresholdNow.toLocaleString('en-US')} tok) — mid-loop gates suppressed for the rest of this chat`);
                        if (result !== null && typeof result === 'object' && !Array.isArray(result) && Object.getPrototypeOf(result) === Object.prototype) {
                          const objResult = result as Record<string, unknown>;
                          // Strictly additive + no-clobber: exactly one notice ever, on the compacting tool's own envelope; later steps of this turn already run suppressed (latch armed above).
                          if (objResult.context_guard_notice === undefined) {
                            objResult.context_guard_notice = '⚠️ CONTEXT WINDOW UNRECOVERABLE THIS TURN: mid-loop compression ran but LM Studio is still sending ~' + Math.round(intraTurnCount / 1000) + 'k tokens against the ' + Math.round(limit / 1000) + 'k window — host history cannot be shrunk from a plugin. Stop calling further tools and tell the user: starting a NEW chat is the only reset; everything important was checkpointed to session memory before compression.';
                          }
                        } else {
                          console.warn('[AI Toolbox] [TIER-2-COMPACT] ⚠️ FIX #2 notice could not ride a plain-object envelope (unexpected result shape) — log-only fallback');
                        }
                      }
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
          } else if (config.contextGuardEnabled === true
              && limit > 0
              // LATCH SUB-ITEM (30.10): the FIX B gate above with its latch condition inverted — this pass would have fired but the proven-unrecoverable window withheld it; mirroring every other condition keeps the log honest (no "skipped" line when the toggle is off or the projection hasn't crossed 95%).
              // DELIBERATELY EXCLUDES !midLoopCompactionFiredThisTurn (gate-4 fix 30.10) — same per-entry reset argument as the TIER-2 skip branch above; one-shotness lives in TokenStatsManager's module-level unrecoverableSkipLoggedFixb.
              && projected >= preemptiveLimit) {
            // One-shot FAIL-LOUD skip log per transition (the module-level flag resets on clear/set, so later model steps stay silent instead of re-running the pipeline or repeating this line).
            TokenStatsManager.logUnrecoverableSkip('fixb');
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

  // ==================== 📦 UPDATE-CHECK (19.10): quiet GitHub Releases check + in-app notify ====================
  // Runs once per provider invocation (= new turn / session start) — the only spot with both the live config and the host client hop.
  // QUIET by design: at most one outbound request per machine per day (24h TTL inside getUpdateStatus, stamped on every attempt incl. failures);
  // no new LLM tool is registered; nothing here may delay or break the tools array — fire-and-forget, non-fatal by house rule (warn + skip).
  // CHANNEL SELECTION (21.10 owner spec A, GO): the plugin-panel "Desktop Notifications" toggle picks exactly ONE surface
  // per session for update messages — ON: desktop toast below; OFF: no notify hop and NO latches written, so promptPreprocessor's
  // in-chat UPDATE-ANNOUNCE line (once-per-process) is free to fire. Never both channels. getUpdateStatus() ALWAYS runs when
  // updateCheckEnabled — its knob/real-path now persists latestVersion (CHANNEL-FEED), which the chat layer needs as input. `!== false`
  // (not strict ===true): undefined/partial harness configs keep current ON behavior — only an explicit OFF switches channel.
  if (config.updateCheckEnabled === true) {
    void (async () => {
      try {
        const status = await getUpdateStatus();
        // CHANNEL SELECTION (21.10 owner spec A): desktop notifications OFF -> chat is the ONLY channel this session: no notify hop and NO
        // latches written at all, so promptPreprocessor's in-chat UPDATE-ANNOUNCE line may fire (its once-per-process latch guarantees ONE
        // message per session/version). The check above already persisted latestVersion for that layer (CHANNEL-FEED in updateChecker);
        // null-status outcomes return silently below regardless of channel. Strict === false mirrors the tier-2 house gate convention.
        if (config.notificationsEnabled === false && status !== null) return;
        if (!status) return; // fresh cache / same-or-older / dismissed / transient failure — silent by design
        // NOTIF-DEDUPE (19.10, E2E-discovered): the host re-invokes this provider on EVERY model step of an agentic
        // turn, so without a latch the owner would get one notification per tool call for the same release (24h TTL caps
        // FETCHES only). At most ONE notify per version; a strictly-newer release carries a different version string and re-fires.
        if (!hasBeenNotified(status.version)) {
          markNotified(status.version); // latch BEFORE the await: a failing/crashing hop must not re-fire next step for this version
          console.log(`[AI Toolbox] [UPDATE-CHECK] Newer release available: v${status.version} (installed ${LOCAL_VERSION})`);
          const notify = (ctl as unknown as PluginContextLike).client?.system?.notify; // duck-typed hop (see type doc above) — stubs/older hosts skip deterministically
          if (typeof notify === 'function') {
            // REPO-LINK A+B (19.10, owner GO) [SUPERSEDED by TOAST COPY v3 below — no URL in the final toast]: originally surfaced the GitHub release page as plain text — SDK 1.5.0's
            // BackendNotification is { title, description?, noAutoDismiss? } with NO url/action field (verified against the
            // installed d.ts AND upstream lmstudio-js main), so whether that URL renders clickable is host behavior, not a
            // plugin API; option B1 provides the genuinely-clickable surface in-chat via get_update_info. status.url = the
            // release html_url already returned by getUpdateStatus() (previously unused — the key gap).
            // REPO-LINK A+B v2 (19.10 owner GO): human, action-oriented copy — the desktop notification CANNOT carry a clickable link
            // (BackendNotification has no url/action field; verified against installed d.ts + live E2E 19.10), so no URL here: point at
            // where updates actually happen and let get_update_info be the in-chat clickable surface for the release page.
            // TOAST COPY v3 (19.10, owner GO): rephrased per owner spec — title = "An Update is available for AI Toolbox
            // (vX) !" + body = completed uninstall/reinstall instructions (Variant B, single flowing sentence). Copy-only:
            // no latch/gate/logic change; still NO url field (BackendNotification cannot carry clickable links — v2 finding stands).
            await notify.call(ctl.client?.system, {
              title: `An Update is available for AI Toolbox (v${status.version}) !`,
              description: `- Please uninstall the old one first, then install v${status.version} again from the plugin page — settings and saved data survive the reinstall.`,
            });
            // MUTUAL EXCLUSION (19.10 owner GO): record the successful desktop dispatch so the in-chat announcement layer stays quiet for
            // this version; hosts without system.notify take the warn branch below and NEVER set it → their users get the chat channel instead.
            markToastDispatched(status.version);
          } else {
            console.warn('[AI Toolbox] [UPDATE-CHECK] client.system.notify unavailable — update found but NOT notified (log-only)');
          }
        } else {
          console.log(`[AI Toolbox] [UPDATE-CHECK] v${status.version} already notified this release cycle — duplicate notify suppressed`);
        }
      } catch (err) {
        // getUpdateStatus is non-fatal by construction; this outer guard makes "never throw into the turn" absolute.
        console.warn(`[AI Toolbox] [UPDATE-CHECK] Check failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
  }

  console.log(`[AI Toolbox] Exposed ${instrumented.length} tools to LLM.`);
  return instrumented;
}
