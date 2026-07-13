import { z } from 'zod';

import { createConfigSchematics } from '@lmstudio/sdk';



// ==================== Zod Schema (validation) ====================



export const ConfigSchema = z.object({

  // Tool Gating (enable/disable individual tools)

  fileSystem: z.boolean().default(true),

  webSearch: z.boolean().default(true),

  browserAutomation: z.boolean().default(false),

  gitOperations: z.boolean().default(false),

  packageManage: z.boolean().default(false).describe('⚠️ Enable package manager (npm/pip/cargo) operations. Disabled by default for security.'),

  databaseQueries: z.boolean().default(false),

  documentParsing: z.boolean().default(true),

  backgroundCommands: z.boolean().default(false),



  // ── 🆕 NEW TOOL CATEGORIES ──────────────────────────────────────

  imageProcessing: z.boolean().default(true).describe('Enable image OCR, screenshot, and comparison tools'),

  httpClient: z.boolean().default(false).describe('Enable generic HTTP client for REST API calls'),

  vectorRAG: z.boolean().default(true).describe('Enable semantic search with vector embeddings'),
  uiGeneration: z.boolean().default(false).describe('Enable interactive UI generation and rendering tools'),
  contextManagement: z.boolean().default(true).describe('Enable automatic context tracking and memory management'),

  textProcessing: z.boolean().default(true).describe('Enable text processing tools (sed/awk equivalents)'),

  refactorCode: z.boolean().default(true).describe('Enable AST-based code refactoring tools (rename, move, extract, unused import cleanup)'),


  // ── ⚠️ GOD MODE (Enable ALL tools at once) ──────────────────────

  godMode: z.boolean().default(false).describe('⚠️ WARNING: Enables every tool category. Use with caution.'),



  // ── 📚 DOCUMENT RAG / CHAT WITH FILES ───────────────────────────

  documentRAG: z.boolean().default(true).describe('Enable file indexing and semantic search for chat'),

  retrievalLimit: z.number().min(1).max(20).default(5).describe('Maximum number of relevant chunks to retrieve'),

  retrievalAffinityThreshold: z.number().min(0.0).max(1.0).default(0.5).describe('Minimum similarity score for a chunk to be considered relevant (0-1)'),

  // Execution tools — individual toggles (granular control)

  executionJavaScript: z.boolean().default(true).describe('Allow run_javascript tool'),

  executionPython: z.boolean().default(true).describe('Allow run_python tool'),

  executionTerminal: z.boolean().default(false).describe('Allow run_in_terminal tool'),

  executionShell: z.boolean().default(false).describe('Allow execute_command tool'),

  executionTests: z.boolean().default(false).describe('⚠️ Allow run_tests tool. Disabled by default for security.'),



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

  // ── 🧠 CONTEXT GUARD SETTINGS ───────────────────────────────────
  contextGuardEnabled: z.boolean().default(true).describe('Enable ContextGuard token management and history compression'),
  contextGuardTokenLimit: z.number().min(1000).max(200000).default(30000).describe('Token limit before history compression triggers (90% threshold)'),
  contextGuardSmartReading: z.boolean().default(true).describe('Enable keyword-based smart file reading'),
  contextGuardSummaryModel: z.string().default('').describe('LM Studio model name for summarization (leave empty to use current chat model)'),
  contextGuardTerminalFilterEnabled: z.boolean().default(true).describe('Enable terminal output filtering'),
  contextGuardTerminalFilterLength: z.number().min(100).max(20000).default(2000).describe('Max chars before terminal output is filtered'),

  // ── 🤖 AUTO-TRACKING SETTINGS ────────────────────────────────────
  autoTrackingEnabled: z.boolean().default(true).describe('Automatically tracks decisions, completions, and bug fixes in the background.'),
  autoTrackTokenThreshold: z.number().min(10).max(100).default(75).describe('Trigger session memory save when token usage reaches this percentage (default: 75%)'),
  autoTrackDecisions: z.boolean().default(true).describe('Auto-track decisions and conclusions ("I decided", "conclusion")'),
  autoTrackCompletions: z.boolean().default(true).describe('Auto-track task completions ("successfully completed", "finished")'),
  autoTrackErrors: z.boolean().default(true).describe('Auto-track bug fixes and error resolutions ("fixed the bug")'),
  autoSummaryInterval: z.number().min(10).max(200).default(50).describe('Messages between automatic session summaries'),

  // ── 🛠️ GRAMMAR PARSER LIMITS (P0 Fix) ──────────────────────────────
  maxToolsInSchema: z.number().int().min(10).max(109).default(25).describe('Maximum number of tools included in llama.cpp grammar schema. Reduces EBNF complexity when set below total tool count.'),

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

  packageManage: false,

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
  textProcessing: true,

  refactorCode: true,


  // ⚠️ GOD MODE (Enable ALL tools at once) ⚠️

  documentRAG: true,

  retrievalLimit: 5,

  retrievalAffinityThreshold: 0.5,



  // Execution tools — granular control (JavaScript & Python enabled by default)

  executionJavaScript: true,

  executionPython: true,

  executionTerminal: false,

  executionShell: false, // ⚠️ Disabled by default — dangerous shell commands!

  executionTests: false, // ⚠️ Disabled by default — prevents LLM from bypassing via test runners



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

  // Temporal Awareness (merged from up_to_date)
  temporalAwareness: true,
  dateFormatStyle: 'standard',

  // ── 🧠 CONTEXT GUARD SETTINGS ───────────────────────────────────
  contextGuardEnabled: true,
  contextGuardTokenLimit: 30000,           // ~30k tokens before compression (90% = 27k threshold)
  contextGuardSmartReading: true,
  contextGuardSummaryModel: '',            // Empty = use current chat model
  contextGuardTerminalFilterEnabled: true,
  contextGuardTerminalFilterLength: 2000,  // Filter terminal output > 2KB

  // ── 🤖 AUTO-TRACKING SETTINGS ───────────────────────────────────
  autoTrackingEnabled: true,               // ON BY DEFAULT — silent background tracking
  autoTrackTokenThreshold: 75,             // Save session memory at 75% token usage
  autoTrackDecisions: true,
  autoTrackCompletions: true,
  autoTrackErrors: true,
  autoSummaryInterval: 50,                 // Summary every 50 messages

  // ── 🛠️ GRAMMAR PARSER LIMITS (P0 Fix) ──────────────────────────────
  maxToolsInSchema: 25,                  // Cap tools in EBNF schema to prevent grammar parser overflow

};



/**

 * Validate and sanitize config inp

 */

export function validateConfig(input: unknown): PluginConfig {

  const result = ConfigSchema.safeParse(input);

  if (!result.success) {

    throw new Error(`Invalid configuration: ${result.error.message}`);

  }

  return result.data;
}



/**
 * Check if a tool category is enabled in config
 */
export function isToolEnabled(config: PluginConfig, category: keyof Pick<PluginConfig, 'fileSystem' | 'webSearch' | 'browserAutomation' | 'gitOperations' | 'databaseQueries' | 'documentParsing' | 'backgroundCommands' | 'imageProcessing' | 'httpClient' | 'vectorRAG' | 'uiGeneration' | 'contextManagement' | 'textProcessing' | 'refactorCode'>): boolean {
  return config[category] === true;
}




/**

 * Check if a specific execution tool is enabled (granular)

 */

export function isExecutionToolEnabled(config: PluginConfig, tool: 'javascript' | 'python' | 'terminal' | 'shell' | 'tests'): boolean {

  switch (tool) {

    case 'javascript': return config.executionJavaScript === true;

    case 'python':     return config.executionPython === true;

    case 'terminal':   return config.executionTerminal === true;

    case 'shell':      return config.executionShell === true;

    case 'tests':      return config.executionTests === true;

  }

}



/**

 * Get the execution tool key from a tool name

 */

export function getExecutionToolKey(toolName: string): 'javascript' | 'python' | 'terminal' | 'shell' | 'tests' | null {

  switch (toolName) {

    case 'run_javascript': return 'javascript';

    case 'run_python':     return 'python';

    case 'run_in_terminal': return 'terminal';

    case 'execute_command': return 'shell';

    case 'run_tests':      return 'tests';

    default:               return null;

  }

}



/**

 * Check if ANY execution tool is enabled (legacy compatibility)

 */

export function hasAnyExecutionTool(config: PluginConfig): boolean {

  return config.executionJavaScript || config.executionPython || 

         config.executionTerminal || config.executionShell || config.executionTests;

}



// ==================== LM Studio UI Schematics ====================

// These define the toggle switches that appear in LM Studio's settings panel.



export const configSchematics = createConfigSchematics()



  // ⚠️ GOD MODE - TOP PRIORITY WARNING TOGGLE ⚠️

  .field('godMode', 'boolean', { 

    displayName: '⚡⚠️ GOD MODE - Enable ALL Tools ⚠️⚡',

    subtitle: 'WARNING: Activates every tool category instantly. Use with caution.',

    hint: 'When enabled, ALL individual toggles are bypassed and every tool is activated regardless of settings.',

  }, DEFAULT_CONFIG.godMode)



  // 🎛️ TOOL GATING (Hauptschalter) 🎛️

  .field('fileSystem', 'boolean', { displayName: '📁 File System Tools', hint: 'Enable file read/write/search operations' }, DEFAULT_CONFIG.fileSystem)

  .field('webSearch', 'boolean', { displayName: '🌐 Web & Research Tools', hint: 'Enable DuckDuckGo/Wikipedia search' }, DEFAULT_CONFIG.webSearch)

  // 🐙 GIT & GITHUB TOOLS (visuelle Gruppierung) 🐙

    .field('packageManage', 'boolean', { 
    displayName: 'Package Management Tools', 
    subtitle: 'npm/pip/cargo operations',
    hint: 'Enable package manager tools. Disabled by default for security.',
  }, DEFAULT_CONFIG.packageManage)

  .field('gitOperations', 'boolean', { 

    displayName: '🐙 Git & GitHub Tools', 

    subtitle: 'Version Control & API',

    hint: 'Enable git operations and GitHub API access.',

  }, DEFAULT_CONFIG.gitOperations)

  .field('gitAutoCommit', 'boolean', { 

    displayName: '💾 Git Auto-Commit', 

    subtitle: '⚙️ Teil der Git & GitHub Tools',

    hint: 'Automatically commit changes after operations',

  }, DEFAULT_CONFIG.gitAutoCommit)

  .field('defaultBranch', 'string', { 

    displayName: '🌿 Default Branch', 

    placeholder: 'main',

    subtitle: '⚙️ Teil der Git & GitHub Tools',

    hint: 'Branch name for new repositories and git operations',

  }, DEFAULT_CONFIG.defaultBranch)



  .field('databaseQueries', 'boolean', { displayName: '🗄️ Database Queries', hint: 'Enable read-only SQLite queries' }, DEFAULT_CONFIG.databaseQueries)

  .field('documentParsing', 'boolean', { displayName: '📄 Document Parsing', hint: 'Enable PDF/DOCX document reading' }, DEFAULT_CONFIG.documentParsing)

  .field('backgroundCommands', 'boolean', { displayName: '⏳ Background Commands', hint: 'Enable long-running process tracking' }, DEFAULT_CONFIG.backgroundCommands)



  // 🆕‍❀ NEW TOOL CATEGORIES 🆕‍❀

  .field('imageProcessing', 'boolean', { 

    displayName: '🖼️ Image Processing Tools', 

    subtitle: 'OCR, Screenshots & Comparison',

    hint: 'Enable image OCR (Tesseract.js), screenshot capture, and image comparison tools.',

  }, DEFAULT_CONFIG.imageProcessing)

  

  .field('httpClient', 'boolean', { 

    displayName: '🔌 HTTP Client Tools', 

    subtitle: 'Generic REST API Client',

    hint: 'Enable generic HTTP client for making requests to any REST API (GET, POST, PUT, DELETE).',

  }, DEFAULT_CONFIG.httpClient)

  

  .field('vectorRAG', 'boolean', { 

    displayName: '📊 Vector RAG / Semantic Search', 

    subtitle: 'Semantic Document Search',

    hint: 'Enable semantic search with vector embeddings for intelligent document retrieval.',

  }, DEFAULT_CONFIG.vectorRAG)
  .field('uiGeneration', 'boolean', { 
    displayName: '🎨 Interactive UI Generation Tools', 
    subtitle: 'Generate and render interactive UI components',
    hint: 'Enable tools for generating HTML/CSS/JS components (buttons, forms, charts, dashboards) and rendering them in the browser.',
  }, DEFAULT_CONFIG.uiGeneration)
  .field('contextManagement', 'boolean', { 
    displayName: '🧠 Auto-Context Management Tools', 
    subtitle: 'Automatic session tracking and memory management',
    hint: 'Enable tools for automatically saving important decisions, patterns, and configurations to persistent memory.',
  }, DEFAULT_CONFIG.contextManagement)



  // 📚 DOCUMENT RAG / CHAT WITH FILES 📚



  // 📚 DOCUMENT RAG / CHAT WITH FILES 📚

  .field('documentRAG', 'boolean', { 
    displayName: '📚 Document RAG / Chat with Files', 
    subtitle: 'Enable file indexing and semantic search for chat',
    hint: 'Attach documents to your chat messages. The plugin will automatically retrieve relevant content from attached files using semantic search.',
  }, DEFAULT_CONFIG.documentRAG)


  .field('textProcessing', 'boolean', { 
    displayName: '📝 Text Processing Tools (sed/awk equivalents)', 
    subtitle: 'Regex-based text transformations and field extraction',
    hint: 'Enable tools for bulk text replacement, pattern matching, and structured data extraction without shell dependencies.',
  }, DEFAULT_CONFIG.textProcessing)

  .field('refactorCode', 'boolean', { 
    displayName: '🔧 AST Code Refactoring Tools', 
    subtitle: 'Rename, move, extract functions & clean unused imports',
    hint: 'Enable AST-based code refactoring tools (rename_identifier, move_function, extract_function, unused_import_cleanup).',
  }, DEFAULT_CONFIG.refactorCode)




  

  .field('retrievalLimit', 'numeric', { 

    displayName: '🔢 Retrieval Limit', 

    subtitle: 'Max chunks to return per query',

    min: 1, max: 20, int: true,

    hint: 'Maximum number of relevant document chunks to retrieve for each query.',

  }, DEFAULT_CONFIG.retrievalLimit)

  

  .field('retrievalAffinityThreshold', 'numeric', { 

    displayName: '🎯 Retrieval Affinity Threshold', 

    subtitle: 'Minimum relevance score (0-1)',

    min: 0.0, max: 1.0, step: 0.01,

    hint: 'Chunks below this similarity score will be filtered out. Lower = more results but potentially less relevant.',

  }, DEFAULT_CONFIG.retrievalAffinityThreshold)

  // ⚡ EXECUTION TOOLS (Gefährlich!) ⚡

  .field('executionJavaScript', 'boolean', {

    displayName: '⚡ JavaScript-Ausführung erlauben',

    subtitle: "Aktiviert das 'run_javascript'-Tool",

    hint: 'GEFAHR: Code läuft auf Ihrem Rechner.',

  }, DEFAULT_CONFIG.executionJavaScript)

  .field('executionPython', 'boolean', {

    displayName: '🐍 Python-Ausführung erlauben',

    subtitle: "Aktiviert das 'run_python'-Tool",

    hint: 'GEFAHR: Code läuft auf Ihrem Rechner.',

  }, DEFAULT_CONFIG.executionPython)

  .field('executionTerminal', 'boolean', {

    displayName: '💻 Terminal-Ausführung erlauben',

    subtitle: "Aktiviert das 'run_in_terminal'-Tool",

    hint: 'Öffnet echte Terminal-Fenster.',

  }, DEFAULT_CONFIG.executionTerminal)

  .field('executionShell', 'boolean', {

    displayName: '🔧 Shell-Befehlsausführung erlauben',

    subtitle: "Aktiviert das 'execute_command'-Tool",

    hint: 'GEFAHR: Befehle laufen auf Ihrem Rechner.',

  }, DEFAULT_CONFIG.executionShell)


  .field('executionTests', 'boolean', {
    displayName: '🧪 Test-Ausführung erlauben',
    subtitle: "Aktiviert das 'run_tests'-Tool",
    hint: 'GEFAHR: Führt npm jest / pytest / go test aus — kann Pakete installieren und Code ausführen.',
  }, DEFAULT_CONFIG.executionTests)




  // 🔍 SEARCH SETTINGS 🔍

  .field('searchFallbackChain', 'select', {

    displayName: '🔍 Search Fallback Chain',

    hint: 'Primary search engine. Auto-falls back to others if unavailable.',

    options: [

      { value: 'ddg-api', displayName: 'DuckDuckGo API' },

      { value: 'ddg-fetch', displayName: 'DuckDuckGo Fetch' },

      { value: 'google', displayName: 'Google' },

      { value: 'bing', displayName: 'Bing' },

    ],

  }, DEFAULT_CONFIG.searchFallbackChain)

  .field('maxSearchResults', 'numeric', { min: 1, max: 50, int: true }, DEFAULT_CONFIG.maxSearchResults)

  .field('safesearch', 'select', {

    displayName: '🛡️ Safe Search',

    options: [

      { value: '0', displayName: 'Off' },

      { value: '1', displayName: 'Moderate' },

      { value: '2', displayName: 'Strict' },

    ],

  }, DEFAULT_CONFIG.safesearch)



  // 🖥️ BROWSER AUTOMATION TOOLS 🖥️

  .field('browserAutomation', 'boolean', { 

    displayName: '🖥️ Browser Automation Tools', 

    subtitle: 'Headless browser control & automation',

    hint: 'Enable Puppeteer-based headless browser automation for web scraping, testing, and UI interaction.',

  }, DEFAULT_CONFIG.browserAutomation)

  

  .field('browserTimeout', 'numeric', { 

    displayName: '⏱️ Browser Timeout', 

    subtitle: '⚙️ Teil der Browser Automation Tools',

    min: 1000, max: 30000, int: true,

    hint: 'Maximum time (ms) to wait for browser operations before timing out.',

  }, DEFAULT_CONFIG.browserTimeout)

  

  .field('headlessMode', 'boolean', { 

    displayName: '👻 Headless Mode', 

    subtitle: '⚙️ Teil der Browser Automation Tools',

    hint: 'Run browser without GUI (recommended for automation).',

  }, DEFAULT_CONFIG.headlessMode)



  // 🔒 SECURITY SETTINGS 🔒

  .field('pathValidationEnabled', 'boolean', { displayName: '🔒 Path Validation', hint: 'Prevent directory traversal attacks' }, DEFAULT_CONFIG.pathValidationEnabled)

  .field('binaryFileDetection', 'boolean', { displayName: '📁 Binary File Detection', hint: 'Detect binary files via null byte check' }, DEFAULT_CONFIG.binaryFileDetection)

  .field('regexReDoSProtection', 'boolean', { displayName: '🛡️ ReDoS Protection', hint: 'Protect against regex denial-of-service' }, DEFAULT_CONFIG.regexReDoSProtection)

  .field('maxRegexLength', 'numeric', { min: 1, max: 1000, int: true }, DEFAULT_CONFIG.maxRegexLength)



  // 💽 STATE MANAGEMENT 💽

  .field('statePersistenceEnabled', 'boolean', { displayName: '💽 State Persistence', hint: 'Persist tool execution state between sessions' }, DEFAULT_CONFIG.statePersistenceEnabled)

  .field('stateMaxSize', 'numeric', { min: 1024, max: 1048576, int: true }, DEFAULT_CONFIG.stateMaxSize)



  // 🌐 LANGUAGE & NOTIFICATIONS 🌐

  .field('language', 'select', {

    displayName: '🌐 Language',

    options: [

      { value: 'en', displayName: 'English' },

      { value: 'de', displayName: 'Deutsch (German)' },

      { value: 'zh-CN', displayName: 'Simplified Chinese' },

      { value: 'zh-TW', displayName: 'Traditional Chinese' },

    ],

  }, DEFAULT_CONFIG.language)



  .field('notificationsEnabled', 'boolean', { displayName: '🔔 Desktop Notifications', hint: 'Show system notifications' }, DEFAULT_CONFIG.notificationsEnabled)

  // ⏰ TEMPORAL AWARENESS (from up_to_date)
  .field('temporalAwareness', 'boolean', {
    displayName: '⏰ Temporal Awareness',
    subtitle: 'Injects current date/time into every message',
    hint: 'Enables the AI to know the current time.',
  }, DEFAULT_CONFIG.temporalAwareness)
  .field('dateFormatStyle', 'select', {
    displayName: '📅 Date Format Style',
    options: [
      { value: 'standard', displayName: 'Standard ([Zeit: ...])' },
      { value: 'heuteIst', displayName: 'HEUTE IST Mode (Prominent)' },
    ],
  }, DEFAULT_CONFIG.dateFormatStyle)


  // ── 🧠 CONTEXT GUARD SETTINGS ───────────────────────────────────
  .field('contextGuardEnabled', 'boolean', {
    displayName: '🧠 ContextGuard Token Management',
    subtitle: 'Automatic history compression & smart reading',
    hint: 'Automatically compresses chat history when token limit is reached. Enables smart file reading and terminal output filtering.',
  }, DEFAULT_CONFIG.contextGuardEnabled)

  .field('contextGuardTokenLimit', 'numeric', {
    displayName: '📊 Token Limit Before Compression',
    subtitle: '⚙️ ContextGuard Setting',
    min: 1000, max: 200000, int: true,
    hint: 'Compression triggers at 90% of this limit. Higher = more context retained but slower responses.',
  }, DEFAULT_CONFIG.contextGuardTokenLimit)

  .field('contextGuardSmartReading', 'boolean', {
    displayName: '🔍 Smart File Reading',
    subtitle: '⚙️ ContextGuard Setting',
    hint: 'Extracts keywords from user queries to read only relevant portions of files. Saves tokens and speeds up responses.',
  }, DEFAULT_CONFIG.contextGuardSmartReading)

  .field('contextGuardSummaryModel', 'string', {
    displayName: '🤖 Summary Model Name',
    subtitle: '⚙️ ContextGuard Setting',
    placeholder: '(leave empty for current chat model)',
    hint: 'LM Studio model name used for history summarization. Leave empty to use your current chat model.',
  }, DEFAULT_CONFIG.contextGuardSummaryModel)

  .field('contextGuardTerminalFilterEnabled', 'boolean', {
    displayName: '📌 Terminal Output Filtering',
    subtitle: '⚙️ ContextGuard Setting',
    hint: 'Automatically truncates long terminal outputs to save tokens.',
  }, DEFAULT_CONFIG.contextGuardTerminalFilterEnabled)

  .field('contextGuardTerminalFilterLength', 'numeric', {
    displayName: '📏 Max Terminal Output Length',
    subtitle: '⚙️ ContextGuard Setting',
    min: 100, max: 20000, int: true,
    hint: 'Maximum characters before terminal output is truncated and summarized.',
  }, DEFAULT_CONFIG.contextGuardTerminalFilterLength)

  // ── 🤖 AUTO-TRACKING SETTINGS ───────────────────────────────────
  .field('autoTrackingEnabled', 'boolean', {
    displayName: '🤖 Auto-Tracking Enabled',
    subtitle: 'Automatically remember important events',
    hint: 'Silently tracks decisions, completions, and bug fixes in the background. Enabled by default.',
  }, DEFAULT_CONFIG.autoTrackingEnabled)

  .field('autoTrackTokenThreshold', 'numeric', {
    displayName: 'Auto-Track Token Threshold',
    subtitle: 'Auto-Tracking Setting',
    min: 10, max: 100, int: true,
    hint: 'Trigger session memory save when token usage reaches this percentage (default: 75%). Helps prevent context overflow.',
  }, DEFAULT_CONFIG.autoTrackTokenThreshold)

  .field('autoTrackDecisions', 'boolean', {
    displayName: '📌 Track Decisions Automatically',
    subtitle: '⚙️ Auto-Tracking Setting',
    hint: 'Detects phrases like "I decided", "conclusion", "going with".',
  }, DEFAULT_CONFIG.autoTrackDecisions)

  .field('autoTrackCompletions', 'boolean', {
    displayName: '✅ Track Completions Automatically',
    subtitle: '⚙️ Auto-Tracking Setting',
    hint: 'Detects phrases like "successfully completed", "finished implementing".',
  }, DEFAULT_CONFIG.autoTrackCompletions)

  .field('autoTrackErrors', 'boolean', {
    displayName: '🐛 Track Bug Fixes Automatically',
    subtitle: '⚙️ Auto-Tracking Setting',
    hint: 'Detects phrases like "fixed the bug", "resolved the issue".',
  }, DEFAULT_CONFIG.autoTrackErrors)

  .field('autoSummaryInterval', 'numeric', {
    displayName: '📊 Session Summary Interval',
    subtitle: '⚙️ Auto-Tracking Setting',
    min: 10, max: 200, int: true,
    hint: 'Number of messages between automatic session summaries. Higher = less frequent.',
  }, DEFAULT_CONFIG.autoSummaryInterval)


  // ── 🛠️ GRAMMAR PARSER LIMITS (P0 Fix) ──────────────────────────────
  .field('maxToolsInSchema', 'numeric', {
    displayName: '🛡️ Max Tools in Grammar Schema',
    subtitle: '⚙️ Grammar Parser Limit',
    min: 10, max: 109, int: true,
    hint: 'Maximum number of tools included in llama.cpp grammar schema. Reduces EBNF complexity when set below total tool count. Default: 50 (out of ~109 available).',
  }, DEFAULT_CONFIG.maxToolsInSchema)



  .build();
