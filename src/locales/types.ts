/**
 * i18n translation types and structure
 */

export interface Translation {
  toolName: string;
  description: string;
  parameters: string[];
  example?: string;
}

export interface ToolCategoryTranslations {
  categoryTitle: string;
  tools: Translation[];
}

/**
 * UNIFIED LANGUAGE v2 (26.10): texts injected into prompts at RUNTIME (per-turn, resolved fresh in
 * preprocess() — see src/promptPreprocessor.ts S1–S7). Template placeholders use {name} tokens and are
 * filled by the message layer (step 3); box-drawing separators stay OUTSIDE these strings. Every value
 * is REQUIRED for all five locales; the 'en' values must remain BYTE-IDENTICAL to the pre-v2 hardcoded
 * literals so existing tests keep passing unchanged.
 */
export interface RuntimeTexts {
  // S1 — working-directory banner (promptPreprocessor.injectWorkingDirectoryPrompt)
  workingDirDetected: string;            // banner title line
  workingDirMentionedLine: string;       // lead-in above the path
  workingDirConfirmAsk: string;          // model instruction before the example response
  workingDirExampleLabel: string;        // 'Example response:' label
  workingDirExampleText: string;         // quoted example reply, {path} placeholder (replyHint appended separately)
  workingDirReplyHint: string;           // "Reply '{yes}' to confirm, or '{no}' to decline."
  workingDirOriginalMessageLabel: string;// 'User's original message:' tail label

  // S2 — registered-project banner (Step 0.7 confirm-first)
  projectDetectedTitle: string;          // banner title line
  projectFoundLead: string;              // lead-in above the name/path block
  projectNameLabel: string;              // 'Project:' prefix ({name} value)
  projectPathLabel: string;              // 'Path:' prefix ({path} value)
  projectSwitchQuestion: string;         // confirmation question line

  // S3 — session-memory injection after a confirmed switch (executeProjectSwitch, msgpack + JSON paths)
  sessionMemoryLoadedTitle: string;      // banner title line (pinned by tests/sessionMemoryReadGuards.test.ts)
  previousSessionLabel: string;          // 'Previous session summary:' label above the stored text

  // S4 — checkpoint <SYSTEM_INSTRUCTION> wrapper. WORDING DELIBERATELY LANGUAGE-AGNOSTIC BY DESIGN (owner
  // verdict, i18n-CONFIRM arc): reply parsing accepts every shipped language's words, so the instruction
  // references "the confirmation options shown in the warning" instead of one language's words. All five
  // locales ship the SAME neutral text; rewording per locale requires explicit owner GO (parked decision).
  checkpointWarningHeader: string;       // 'TOKEN LIMIT WARNING — ACKNOWLEDGE BEFORE RESPONDING:' ({pendingWarning} inserted below)
  checkpointActionRequiredLead: string;  // first ACTION REQUIRED line
  checkpointIfConfirmedLine: string;     // 'If the user replied with one of the confirmation options...'
  checkpointIfDeclinedLine: string;      // 'If the user declined or did NOT give a confirmation reply...'
  checkpointDoNotProceedLine: string;    // 'Do not proceed with normal conversation until this warning has been addressed.'

  // S5 — autoTracker threshold warning (autoTracker.checkAndGeneratePrompt)
  sessionWarningHead: string;            // '⚠️ SESSION WARNING: You have reached {pct}% of your token limit. It is highly recommended to save session memory before continuing.'
  bufferedEventsLine: string;            // 'Auto-tracked events in buffer (will be saved with checkpoint): {count}'
  contextSaveQuestion: string;           // "Do you want to proceed with a context save? Reply '{yes}' ... or '{no}' to continue."

  // S6 — attached-files notice + the documentTools error cross-reference (must stay mutually consistent)
  attachedFilesTitle: string;            // '📎 ATTACHED FILES AVAILABLE:' banner title (quoted by the errorHint)
  attachedFilesLead: string;             // lead-in above the file list
  attachmentErrorCrossRef: string;       // "Note: If this is an attached file, use the exact filename from the \"ATTACHED FILES AVAILABLE\" list."

  // RAG — retrieved-document context section (Step 2 tail of preprocess)
  ragContextHeader: string;              // '--- RELEVANT DOCUMENT CONTEXT ---' header

  // Answer-language instruction (v2 NEW — appended once per turn by the message layer, step 3)
  answerLanguageLine: string;            // "Respond to the user in {language}." ({language} = human-readable locale name)
}

/** One config-panel row's translatable strings (displayName/subtitle/hint as present on that field). */
export interface UiFieldLabels {
  displayName?: string;
  subtitle?: string;
  hint?: string;
}

/** Language-menu option display names, per value. Brand/engine options stay untranslated by design. */
export interface SelectOptionLabels {
  auto: string;      // v2 NEW value (default) — 'Follow LM Studio' style text
  en: string;
  de: string;
  es: string;
  zhCN: string;
  zhTW: string;
}

/**
 * UNIFIED LANGUAGE v2 (26.10): the LM Studio settings-panel labels, baked at BOOT TIME from the resolved
 * language ('auto' → host app language → OS detect → en; concrete pick persisted to a state file so reloads
 * don't drift). Fields appear under their config key (e.g. `fileSystem` = the 'fileSystem' toggle row);
 * fields without label strings in the schematics are omitted from this type on purpose. Option lists for
 * searchFallbackChain stay English (brand names) and are not part of this bundle.
 */
export interface UiLabels {
  languageRow: UiFieldLabels & { options: SelectOptionLabels };
  godMode: UiFieldLabels;
  fileSystem: UiFieldLabels;
  webSearch: UiFieldLabels;
  packageManage: UiFieldLabels;
  gitOperations: UiFieldLabels;
  gitAutoCommit: UiFieldLabels;
  defaultBranch: UiFieldLabels;
  databaseQueries: UiFieldLabels;
  documentParsing: UiFieldLabels;
  backgroundCommands: UiFieldLabels;
  imageProcessing: UiFieldLabels;
  httpClient: UiFieldLabels;
  vectorRag: UiFieldLabels;
  uiGeneration: UiFieldLabels;
  contextManagement: UiFieldLabels;
  documentRAG: UiFieldLabels;
  textProcessing: UiFieldLabels;
  refactorCode: UiFieldLabels;
  utility: UiFieldLabels;
  taskPlanning: UiFieldLabels;
  clusterAwareToolOrder: UiFieldLabels;
  retrievalLimit: UiFieldLabels;
  retrievalAffinityThreshold: UiFieldLabels;
  executionJavaScript: UiFieldLabels;
  executionPython: UiFieldLabels;
  executionTerminal: UiFieldLabels;
  executionShell: UiFieldLabels;
  executionTests: UiFieldLabels;
  searchFallbackChain: UiFieldLabels;
  safesearch: UiFieldLabels & { options: { off: string; moderate: string; strict: string } };
  browserAutomation: UiFieldLabels;
  browserTimeout: UiFieldLabels;
  headlessMode: UiFieldLabels;
  pathValidationEnabled: UiFieldLabels;
  binaryFileDetection: UiFieldLabels;
  regexReDoSProtection: UiFieldLabels;
  statePersistenceEnabled: UiFieldLabels;
  notificationsEnabled: UiFieldLabels;
  updateCheckEnabled: UiFieldLabels;
  temporalAwareness: UiFieldLabels;
  dateFormatStyle: UiFieldLabels & { options: { standard: string; heuteIst: string } };
  contextGuardEnabled: UiFieldLabels;
  contextGuardCompressionPercent: UiFieldLabels;
  contextGuardAgenticDensity: UiFieldLabels;
  contextGuardForceSummaryOnCompress: UiFieldLabels;
  contextGuardSmartReading: UiFieldLabels;
  contextGuardSummaryModel: UiFieldLabels;
  contextGuardTerminalFilterEnabled: UiFieldLabels;
  contextGuardTerminalFilterLength: UiFieldLabels;
  compactionEnabled: UiFieldLabels;
  compactionMaxResultBytes: UiFieldLabels;
  contextUsageFooter: UiFieldLabels;
  autoTrackingEnabled: UiFieldLabels;
  autoTrackTokenThreshold: UiFieldLabels;
  autoTrackDecisions: UiFieldLabels;
  autoTrackCompletions: UiFieldLabels;
  autoTrackErrors: UiFieldLabels;
  autoSummaryInterval: UiFieldLabels;
}

export interface FullTranslationSet {
  // ── UNIFIED LANGUAGE v2 (26.10) — REQUIRED for every locale set (tsc-enforced completeness) ──
  runtimeTexts: RuntimeTexts;
  uiLabels: UiLabels;

  fileSystem: ToolCategoryTranslations;
  webSearch: ToolCategoryTranslations;
  browserAutomation: ToolCategoryTranslations;
  gitOperations: ToolCategoryTranslations;
  databaseQueries: ToolCategoryTranslations;
  documentParsing: ToolCategoryTranslations;
  backgroundCommands: ToolCategoryTranslations;

  // Tier-2 (04.09): full live-tool coverage categories — all five locale sets
  // carry them, so they are REQUIRED (tightened after the incremental fill).
  codeRefactoring: ToolCategoryTranslations;
  execution: ToolCategoryTranslations;
  utilities: ToolCategoryTranslations;
  imageProcessing: ToolCategoryTranslations;
  vectorRag: ToolCategoryTranslations;
  uiGeneration: ToolCategoryTranslations;
  contextManagement: ToolCategoryTranslations;
  textProcessing: ToolCategoryTranslations;
  backupRestore: ToolCategoryTranslations;
  dataVisualization: ToolCategoryTranslations;
  httpClient: ToolCategoryTranslations;
  taskPlanning: ToolCategoryTranslations;
  general: {
    pluginName: string;
    enabledTools: string;
    disabledTools: string;
    errorPrefix: string;
    successPrefix: string;
    // 🔹 i18n-CONFIRM arc (06.10): localized words for the YES/NO confirmation prompts
    // (checkpoint save + project/CWD switch). Displayed per configured language; accepted in ALL languages.
    yesWord: string;
    noWord: string;
  };
}

export type LanguageCode = 'en' | 'de' | 'es' | 'zh-CN' | 'zh-TW';