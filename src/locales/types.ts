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
  general: {
    pluginName: string;
    enabledTools: string;
    disabledTools: string;
    errorPrefix: string;
    successPrefix: string;
  };
}

export type LanguageCode = 'en' | 'de' | 'zh-CN' | 'zh-TW';