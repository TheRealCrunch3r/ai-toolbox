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

export interface FullTranslationSet {
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
  };
}

export type LanguageCode = 'en' | 'de' | 'es' | 'zh-CN' | 'zh-TW';