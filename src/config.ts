import { z } from 'zod';

import { createConfigSchematics } from '@lmstudio/sdk';



// ==================== Zod Schema (validation) ====================



export const ConfigSchema = z.object({

  // Tool Gating (enable/disable individual tools)

  fileSystem: z.boolean().default(true),

  webSearch: z.boolean().default(true),

  browserAutomation: z.boolean().default(false),

  gitOperations: z.boolean().default(false),

  databaseQueries: z.boolean().default(false),

  documentParsing: z.boolean().default(true),

  backgroundCommands: z.boolean().default(false),



  // ── 🆕 NEW TOOL CATEGORIES ──────────────────────────────────────

  imageProcessing: z.boolean().default(true).describe('Enable image OCR, screenshot, and comparison tools'),

  httpClient: z.boolean().default(false).describe('Enable generic HTTP client for REST API calls'),

  vectorRAG: z.boolean().default(true).describe('Enable semantic search with vector embeddings'),
  uiGeneration: z.boolean().default(false).describe('Enable interactive UI generation and rendering tools'),
  contextManagement: z.boolean().default(true).describe('Enable automatic context tracking and memory management'),



  // ── ⚠️ GOD MODE (Enable ALL tools at once) ──────────────────────

  godMode: z.boolean().default(false).describe('⚠️ WARNING: Enables every tool category. Use with caution.'),



  // ── 📚 DOCUMENT RAG / CHAT WITH FILES ───────────────────────────

  documentRAG: z.boolean().default(true).describe('Enable file indexing and semantic search for chat'),

  retrievalLimit: z.number().min(1).max(20).default(5).describe('Maximum number of relevant chunks to retrieve'),

  retrievalAffinityThreshold: z.number().min(0.0).max(1.0).default(0.5).describe('Minimum similarity score for a chunk to be considered relevant (0-1)'),

  // Execution tools — individual toggles (granular control)

  executionJavaScript: z.boolean().default(false).describe('Allow run_javascript tool'),

  executionPython: z.boolean().default(false).describe('Allow run_python tool'),

  executionTerminal: z.boolean().default(false).describe('Allow run_in_terminal tool'),

  executionShell: z.boolean().default(false).describe('Allow execute_command tool'),



  // ── Web Search Settings ───────────────────────────────────────

  searchFallbackChain: z.enum(['ddg-api', 'ddg-fetch', 'google', 'bing']).default('ddg-api').describe('Primary search engine (auto-fallback to others)'),

  maxSearchResults: z.number().min(1).max(50).default(10),

  safesearch: z.enum(['0', '1', '2']).default('1'),



  // ── Browser Settings ──────────────────────────────────────────

  browserTimeout: z.number().min(1000).max(30000).default(5000),

  headlessMode: z.boolean().default(false).describe('Run browser without GUI'),



  // Git Settings

  gitAutoCommit: z.boolean().default(false),

  defaultBranch: z.string().default('main'),



  // Security Settings

  pathValidationEnabled: z.boolean().default(true),

  binaryFileDetection: z.boolean().default(true),

  regexReDoSProtection: z.boolean().default(true),

  maxRegexLength: z.number().min(1).max(1000).default(500),



  // State Management

  statePersistenceEnabled: z.boolean().default(true),

  stateMaxSize: z.number().min(1024).max(1048576).default(10240),



  // i18n Settings

  language: z.enum(['en', 'de', 'zh-CN', 'zh-TW']).default('en'),



  // Notification Settings

  notificationsEnabled: z.boolean().default(true),

  // Temporal Awareness (merged from up_to_date)
  temporalAwareness: z.boolean().default(true).describe('Enable automatic date/time injection into prompts'),
  dateFormatStyle: z.enum(['standard', 'heuteIst']).default('standard').describe('Date format style for temporal awareness'),

  // ── 🛡️ CONTEXT GUARD (New) ──────────────────────────────────────
  contextGuard: z.boolean().default(false).describe('Enable ContextGuard to manage context window explosion'),
  tokenLimit: z.number().min(10000).max(200000).default(110000).describe('Token limit before compression triggers'),
  smartReading: z.boolean().default(true).describe('Automatically truncate large files if ContextGuard is active'),
  summaryModel: z.enum(['gemma-2b', 'llama-3-8b', 'qwen-2.5-7b']).default('gemma-2b').describe('Model to use for summarization'),
  terminalFilterEnabled: z.boolean().default(true).describe('Enable terminal output filtering to save context'),
  terminalFilterLength: z.number().min(500).max(10000).default(2000).describe('Max characters for terminal output before filtering'),
});



export type PluginConfig = z.infer<typeof ConfigSchema>;



/**

 * Default configuration object

 */

export const DEFAULT_CONFIG: PluginConfig = {

  fileSystem: true,

  webSearch: true,

  browserAutomation: false,

  gitOperations: false,

  databaseQueries: false,

  documentParsing: true,

  backgroundCommands: false,



  // ⚠️ GOD MODE (Enable ALL tools at once) ⚠️

  godMode: false,



  // ── 🆕 NEW TOOL CATEGORIES ──────────────────────────────────────

  imageProcessing: true,

  httpClient: false,

  vectorRAG: true,
  uiGeneration: false,
  contextManagement: true,



  // ⚠️ GOD MODE (Enable ALL tools at once) ⚠️

  documentRAG: true,

  retrievalLimit: 5,

  retrievalAffinityThreshold: 0.5,



  // Execution tools — all disabled by default (dangerous!)

  executionJavaScript: false,

  executionPython: false,

  executionTerminal: false,

  executionShell: false,



  searchFallbackChain: 'ddg-api',

  maxSearchResults: 10,

  safesearch: '1',

  browserTimeout: 5000,

  headlessMode: false,

  gitAutoCommit: false,

  defaultBranch: 'main',

  pathValidationEnabled: true,

  binaryFileDetection: true,

  regexReDoSProtection: true,

  maxRegexLength: 500,

  statePersistenceEnabled: true,

  stateMaxSize: 10240,

  language: 'en',

  notificationsEnabled: true,
  temporalAwareness: true,
  dateFormatStyle: 'standard',
  // ── 🛡️ CONTEXT GUARD (New) ──────────────────────────────────────
  contextGuard: false,
  tokenLimit: 110000,
  smartReading: true,
  summaryModel: 'gemma-2b',
  terminalFilterEnabled: true,
  terminalFilterLength: 2000,
};



/**

 * Helper to create UI schematics for LM Studio

 */

export const configSchematics = createConfigSchematics()
  .field("fileSystem", "boolean", { displayName: "File System" }, true)
  .field("webSearch", "boolean", { displayName: "Web Search" }, true)
  .field("browserAutomation", "boolean", { displayName: "Browser Automation" }, false)
  .field("gitOperations", "boolean", { displayName: "Git Operations" }, false)
  .field("databaseQueries", "boolean", { displayName: "Database Queries" }, false)
  .field("documentParsing", "boolean", { displayName: "Document Parsing" }, true)
  .field("backgroundCommands", "boolean", { displayName: "Background Commands" }, false)
  .field("imageProcessing", "boolean", { displayName: "Image Processing" }, true)
  .field("httpClient", "boolean", { displayName: "HTTP Client" }, false)
  .field("vectorRAG", "boolean", { displayName: "Vector RAG" }, true)
  .field("uiGeneration", "boolean", { displayName: "UI Generation" }, false)
  .field("contextManagement", "boolean", { displayName: "Context Management" }, true)
  .field("godMode", "boolean", { displayName: "God Mode", hint: "Enables every tool category. Use with caution." }, false)
  .field("documentRAG", "boolean", { displayName: "Document RAG" }, true)
  .field("retrievalLimit", "numeric", { displayName: "Retrieval Limit", min: 1, max: 20, step: 1 }, 5)
  .field("retrievalAffinityThreshold", "numeric", { displayName: "Retrieval Affinity Threshold", min: 0, max: 1, step: 0.01 }, 0.5)
  .field("executionJavaScript", "boolean", { displayName: "Execution JavaScript" }, false)
  .field("executionPython", "boolean", { displayName: "Execution Python" }, false)
  .field("executionTerminal", "boolean", { displayName: "Execution Terminal" }, false)
  .field("executionShell", "boolean", { displayName: "Execution Shell" }, false)
  .field("searchFallbackChain", "string", { displayName: "Search Fallback Chain" }, "ddg-api")
  .field("maxSearchResults", "numeric", { displayName: "Max Search Results", min: 1, max: 50, step: 1 }, 10)
  .field("safesearch", "string", { displayName: "SafeSearch" }, "1")
  .field("browserTimeout", "numeric", { displayName: "Browser Timeout", min: 1000, max: 30000, step: 1000 }, 5000)
  .field("headlessMode", "boolean", { displayName: "Headless Mode" }, false)
  .field("gitAutoCommit", "boolean", { displayName: "Git Auto Commit" }, false)
  .field("defaultBranch", "string", { displayName: "Default Branch" }, "main")
  .field("pathValidationEnabled", "boolean", { displayName: "Path Validation" }, true)
  .field("binaryFileDetection", "boolean", { displayName: "Binary File Detection" }, true)
  .field("regexReDoSProtection", "boolean", { displayName: "Regex ReDoS Protection" }, true)
  .field("maxRegexLength", "numeric", { displayName: "Max Regex Length", min: 1, max: 1000, step: 1 }, 500)
  .field("statePersistenceEnabled", "boolean", { displayName: "State Persistence" }, true)
  .field("stateMaxSize", "numeric", { displayName: "State Max Size", min: 1024, max: 1048576, step: 1024 }, 10240)
  .field("language", "string", { displayName: "Language" }, "en")
  .field("notificationsEnabled", "boolean", { displayName: "Notifications" }, true)
  .field("temporalAwareness", "boolean", { displayName: "Temporal Awareness" }, true)
  .field("dateFormatStyle", "string", { displayName: "Date Format Style" }, "standard")
  .field("contextGuard", "boolean", { displayName: "ContextGuard" }, false)
  .field("tokenLimit", "numeric", { displayName: "Token Limit", min: 10000, max: 200000, step: 1000 }, 110000)
  .field("smartReading", "boolean", { displayName: "Smart Reading" }, true)
  .field("summaryModel", "string", { displayName: "Summary Model" }, "gemma-2b")
  .field("terminalFilterEnabled", "boolean", { displayName: "Terminal Filter" }, true)
  .field("terminalFilterLength", "numeric", { displayName: "Terminal Filter Length", min: 500, max: 10000, step: 100 }, 2000)
  .build();

/**
 * Helper to check if a tool category is enabled
 */
export function isToolEnabled(config: PluginConfig, toolCategory: string): boolean {
  if (config.godMode) return true;
  return !!config[toolCategory as keyof PluginConfig];
}

/**
 * Helper to check if an execution tool type is enabled
 */
export function isExecutionToolEnabled(config: PluginConfig, toolType: string): boolean {
  if (config.godMode) return true;
  switch (toolType) {
    case 'javascript': return config.executionJavaScript;
    case 'python': return config.executionPython;
    case 'terminal': return config.executionTerminal;
    case 'shell': return config.executionShell;
    default: return false;
  }
}
