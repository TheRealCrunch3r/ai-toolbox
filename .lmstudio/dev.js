"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/config.ts
function isToolEnabled(config, category) {
  return config[category] === true;
}
function isExecutionToolEnabled(config, tool16) {
  switch (tool16) {
    case "javascript":
      return config.executionJavaScript === true;
    case "python":
      return config.executionPython === true;
    case "terminal":
      return config.executionTerminal === true;
    case "shell":
      return config.executionShell === true;
  }
}
var import_zod, import_sdk, ConfigSchema, DEFAULT_CONFIG, configSchematics;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    import_zod = require("zod");
    import_sdk = require("@lmstudio/sdk");
    ConfigSchema = import_zod.z.object({
      // Tool Gating (enable/disable individual tools)
      fileSystem: import_zod.z.boolean().default(true),
      webSearch: import_zod.z.boolean().default(true),
      browserAutomation: import_zod.z.boolean().default(false),
      gitOperations: import_zod.z.boolean().default(false),
      databaseQueries: import_zod.z.boolean().default(false),
      documentParsing: import_zod.z.boolean().default(true),
      backgroundCommands: import_zod.z.boolean().default(false),
      // ── 🆕 NEW TOOL CATEGORIES ──────────────────────────────────────
      imageProcessing: import_zod.z.boolean().default(true).describe("Enable image OCR, screenshot, and comparison tools"),
      httpClient: import_zod.z.boolean().default(false).describe("Enable generic HTTP client for REST API calls"),
      vectorRAG: import_zod.z.boolean().default(true).describe("Enable semantic search with vector embeddings"),
      uiGeneration: import_zod.z.boolean().default(false).describe("Enable interactive UI generation and rendering tools"),
      contextManagement: import_zod.z.boolean().default(true).describe("Enable automatic context tracking and memory management"),
      // ── ⚠️ GOD MODE (Enable ALL tools at once) ──────────────────────
      godMode: import_zod.z.boolean().default(false).describe("\u26A0\uFE0F WARNING: Enables every tool category. Use with caution."),
      // ── 📚 DOCUMENT RAG / CHAT WITH FILES ───────────────────────────
      documentRAG: import_zod.z.boolean().default(true).describe("Enable file indexing and semantic search for chat"),
      retrievalLimit: import_zod.z.number().min(1).max(20).default(5).describe("Maximum number of relevant chunks to retrieve"),
      retrievalAffinityThreshold: import_zod.z.number().min(0).max(1).default(0.5).describe("Minimum similarity score for a chunk to be considered relevant (0-1)"),
      // Execution tools — individual toggles (granular control)
      executionJavaScript: import_zod.z.boolean().default(false).describe("Allow run_javascript tool"),
      executionPython: import_zod.z.boolean().default(false).describe("Allow run_python tool"),
      executionTerminal: import_zod.z.boolean().default(false).describe("Allow run_in_terminal tool"),
      executionShell: import_zod.z.boolean().default(true).describe("Allow execute_command tool"),
      // ── Web Search Settings ───────────────────────────────────────
      searchFallbackChain: import_zod.z.enum(["ddg-api", "ddg-fetch", "google", "bing"]).default("ddg-api").describe("Primary search engine (auto-fallback to others)"),
      maxSearchResults: import_zod.z.number().min(1).max(50).default(10),
      safesearch: import_zod.z.enum(["0", "1", "2"]).default("1"),
      // ── Browser Settings ──────────────────────────────────────────
      browserTimeout: import_zod.z.number().min(1e3).max(3e4).default(5e3),
      headlessMode: import_zod.z.boolean().default(false).describe("Run browser without GUI"),
      // Git Settings
      gitAutoCommit: import_zod.z.boolean().default(false),
      defaultBranch: import_zod.z.string().default("main"),
      // Security Settings
      pathValidationEnabled: import_zod.z.boolean().default(true),
      binaryFileDetection: import_zod.z.boolean().default(true),
      regexReDoSProtection: import_zod.z.boolean().default(true),
      maxRegexLength: import_zod.z.number().min(1).max(1e3).default(500),
      // State Management
      statePersistenceEnabled: import_zod.z.boolean().default(true),
      stateMaxSize: import_zod.z.number().min(1024).max(1048576).default(10240),
      // i18n Settings
      language: import_zod.z.enum(["en", "de", "zh-CN", "zh-TW"]).default("en"),
      // Notification Settings
      notificationsEnabled: import_zod.z.boolean().default(true),
      // Temporal Awareness (merged from up_to_date)
      temporalAwareness: import_zod.z.boolean().default(true).describe("Enable automatic date/time injection into prompts"),
      dateFormatStyle: import_zod.z.enum(["standard", "heuteIst"]).default("standard").describe("Date format style for temporal awareness"),
      // ── 🧠 CONTEXT GUARD SETTINGS ───────────────────────────────────
      contextGuardEnabled: import_zod.z.boolean().default(true).describe("Enable ContextGuard token management and history compression"),
      contextGuardTokenLimit: import_zod.z.number().min(1e3).max(2e5).default(8e4).describe("Token limit before history compression triggers (90% threshold)"),
      contextGuardSmartReading: import_zod.z.boolean().default(true).describe("Enable keyword-based smart file reading"),
      contextGuardSummaryModel: import_zod.z.string().default("").describe("LM Studio model name for summarization (leave empty to use current chat model)"),
      contextGuardTerminalFilterEnabled: import_zod.z.boolean().default(true).describe("Enable terminal output filtering"),
      contextGuardTerminalFilterLength: import_zod.z.number().min(100).max(2e4).default(2e3).describe("Max chars before terminal output is filtered"),
      // ── 🤖 AUTO-TRACKING SETTINGS ────────────────────────────────────
      autoTrackingEnabled: import_zod.z.boolean().default(true).describe("Enable automatic tracking of important events in conversation"),
      autoTrackDecisions: import_zod.z.boolean().default(true).describe('Auto-track decisions and conclusions ("I decided", "conclusion")'),
      autoTrackCompletions: import_zod.z.boolean().default(true).describe('Auto-track task completions ("successfully completed", "finished")'),
      autoTrackErrors: import_zod.z.boolean().default(true).describe('Auto-track bug fixes and error resolutions ("fixed the bug")'),
      autoSummaryInterval: import_zod.z.number().min(10).max(200).default(50).describe("Messages between automatic session summaries")
    });
    DEFAULT_CONFIG = {
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
      executionShell: true,
      searchFallbackChain: "ddg-api",
      maxSearchResults: 10,
      safesearch: "1",
      browserTimeout: 5e3,
      headlessMode: false,
      gitAutoCommit: false,
      defaultBranch: "main",
      pathValidationEnabled: true,
      binaryFileDetection: true,
      regexReDoSProtection: true,
      maxRegexLength: 500,
      statePersistenceEnabled: true,
      stateMaxSize: 10240,
      language: "en",
      notificationsEnabled: true,
      // Temporal Awareness (merged from up_to_date)
      temporalAwareness: true,
      dateFormatStyle: "standard",
      // ── 🧠 CONTEXT GUARD SETTINGS ───────────────────────────────────
      contextGuardEnabled: true,
      contextGuardTokenLimit: 8e4,
      // ~80k tokens before compression (90% = 72k threshold)
      contextGuardSmartReading: true,
      contextGuardSummaryModel: "",
      // Empty = use current chat model
      contextGuardTerminalFilterEnabled: true,
      contextGuardTerminalFilterLength: 2e3,
      // Filter terminal output > 2KB
      // ── 🤖 AUTO-TRACKING SETTINGS ───────────────────────────────────
      autoTrackingEnabled: false,
      // OFF BY DEFAULT — user must opt-in
      autoTrackDecisions: true,
      autoTrackCompletions: true,
      autoTrackErrors: true,
      autoSummaryInterval: 50
      // Summary every 50 messages
    };
    configSchematics = (0, import_sdk.createConfigSchematics)().field("godMode", "boolean", {
      displayName: "\u26A1\u26A0\uFE0F GOD MODE - Enable ALL Tools \u26A0\uFE0F\u26A1",
      subtitle: "WARNING: Activates every tool category instantly. Use with caution.",
      hint: "When enabled, ALL individual toggles are bypassed and every tool is activated regardless of settings."
    }, DEFAULT_CONFIG.godMode).field("fileSystem", "boolean", { displayName: "\u{1F4C1} File System Tools", hint: "Enable file read/write/search operations" }, DEFAULT_CONFIG.fileSystem).field("webSearch", "boolean", { displayName: "\u{1F310} Web & Research Tools", hint: "Enable DuckDuckGo/Wikipedia search" }, DEFAULT_CONFIG.webSearch).field("gitOperations", "boolean", {
      displayName: "\u{1F419} Git & GitHub Tools",
      subtitle: "Version Control & API",
      hint: "Enable git operations and GitHub API access."
    }, DEFAULT_CONFIG.gitOperations).field("gitAutoCommit", "boolean", {
      displayName: "\u{1F4BE} Git Auto-Commit",
      subtitle: "\u2699\uFE0F Teil der Git & GitHub Tools",
      hint: "Automatically commit changes after operations"
    }, DEFAULT_CONFIG.gitAutoCommit).field("defaultBranch", "string", {
      displayName: "\u{1F33F} Default Branch",
      placeholder: "main",
      subtitle: "\u2699\uFE0F Teil der Git & GitHub Tools",
      hint: "Branch name for new repositories and git operations"
    }, DEFAULT_CONFIG.defaultBranch).field("databaseQueries", "boolean", { displayName: "\u{1F5C4}\uFE0F Database Queries", hint: "Enable read-only SQLite queries" }, DEFAULT_CONFIG.databaseQueries).field("documentParsing", "boolean", { displayName: "\u{1F4C4} Document Parsing", hint: "Enable PDF/DOCX document reading" }, DEFAULT_CONFIG.documentParsing).field("backgroundCommands", "boolean", { displayName: "\u23F3 Background Commands", hint: "Enable long-running process tracking" }, DEFAULT_CONFIG.backgroundCommands).field("imageProcessing", "boolean", {
      displayName: "\u{1F5BC}\uFE0F Image Processing Tools",
      subtitle: "OCR, Screenshots & Comparison",
      hint: "Enable image OCR (Tesseract.js), screenshot capture, and image comparison tools."
    }, DEFAULT_CONFIG.imageProcessing).field("httpClient", "boolean", {
      displayName: "\u{1F50C} HTTP Client Tools",
      subtitle: "Generic REST API Client",
      hint: "Enable generic HTTP client for making requests to any REST API (GET, POST, PUT, DELETE)."
    }, DEFAULT_CONFIG.httpClient).field("vectorRAG", "boolean", {
      displayName: "\u{1F4CA} Vector RAG / Semantic Search",
      subtitle: "Semantic Document Search",
      hint: "Enable semantic search with vector embeddings for intelligent document retrieval."
    }, DEFAULT_CONFIG.vectorRAG).field("uiGeneration", "boolean", {
      displayName: "\u{1F3A8} Interactive UI Generation Tools",
      subtitle: "Generate and render interactive UI components",
      hint: "Enable tools for generating HTML/CSS/JS components (buttons, forms, charts, dashboards) and rendering them in the browser."
    }, DEFAULT_CONFIG.uiGeneration).field("contextManagement", "boolean", {
      displayName: "\u{1F9E0} Auto-Context Management Tools",
      subtitle: "Automatic session tracking and memory management",
      hint: "Enable tools for automatically saving important decisions, patterns, and configurations to persistent memory."
    }, DEFAULT_CONFIG.contextManagement).field("documentRAG", "boolean", {
      displayName: "\u{1F4DA} Document RAG / Chat with Files",
      subtitle: "Enable file indexing and semantic search for chat",
      hint: "Attach documents to your chat messages. The plugin will automatically retrieve relevant content from attached files using semantic search."
    }, DEFAULT_CONFIG.documentRAG).field("retrievalLimit", "numeric", {
      displayName: "\u{1F522} Retrieval Limit",
      subtitle: "Max chunks to return per query",
      min: 1,
      max: 20,
      int: true,
      hint: "Maximum number of relevant document chunks to retrieve for each query."
    }, DEFAULT_CONFIG.retrievalLimit).field("retrievalAffinityThreshold", "numeric", {
      displayName: "\u{1F3AF} Retrieval Affinity Threshold",
      subtitle: "Minimum relevance score (0-1)",
      min: 0,
      max: 1,
      step: 0.01,
      hint: "Chunks below this similarity score will be filtered out. Lower = more results but potentially less relevant."
    }, DEFAULT_CONFIG.retrievalAffinityThreshold).field("executionJavaScript", "boolean", {
      displayName: "\u26A1 JavaScript-Ausf\xFChrung erlauben",
      subtitle: "Aktiviert das 'run_javascript'-Tool",
      hint: "GEFAHR: Code l\xE4uft auf Ihrem Rechner."
    }, DEFAULT_CONFIG.executionJavaScript).field("executionPython", "boolean", {
      displayName: "\u{1F40D} Python-Ausf\xFChrung erlauben",
      subtitle: "Aktiviert das 'run_python'-Tool",
      hint: "GEFAHR: Code l\xE4uft auf Ihrem Rechner."
    }, DEFAULT_CONFIG.executionPython).field("executionTerminal", "boolean", {
      displayName: "\u{1F4BB} Terminal-Ausf\xFChrung erlauben",
      subtitle: "Aktiviert das 'run_in_terminal'-Tool",
      hint: "\xD6ffnet echte Terminal-Fenster."
    }, DEFAULT_CONFIG.executionTerminal).field("executionShell", "boolean", {
      displayName: "\u{1F527} Shell-Befehlsausf\xFChrung erlauben",
      subtitle: "Aktiviert das 'execute_command'-Tool",
      hint: "GEFAHR: Befehle laufen auf Ihrem Rechner."
    }, DEFAULT_CONFIG.executionShell).field("searchFallbackChain", "select", {
      displayName: "\u{1F50D} Search Fallback Chain",
      hint: "Primary search engine. Auto-falls back to others if unavailable.",
      options: [
        { value: "ddg-api", displayName: "DuckDuckGo API" },
        { value: "ddg-fetch", displayName: "DuckDuckGo Fetch" },
        { value: "google", displayName: "Google" },
        { value: "bing", displayName: "Bing" }
      ]
    }, DEFAULT_CONFIG.searchFallbackChain).field("maxSearchResults", "numeric", { min: 1, max: 50, int: true }, DEFAULT_CONFIG.maxSearchResults).field("safesearch", "select", {
      displayName: "\u{1F6E1}\uFE0F Safe Search",
      options: [
        { value: "0", displayName: "Off" },
        { value: "1", displayName: "Moderate" },
        { value: "2", displayName: "Strict" }
      ]
    }, DEFAULT_CONFIG.safesearch).field("browserAutomation", "boolean", {
      displayName: "\u{1F5A5}\uFE0F Browser Automation Tools",
      subtitle: "Headless browser control & automation",
      hint: "Enable Puppeteer-based headless browser automation for web scraping, testing, and UI interaction."
    }, DEFAULT_CONFIG.browserAutomation).field("browserTimeout", "numeric", {
      displayName: "\u23F1\uFE0F Browser Timeout",
      subtitle: "\u2699\uFE0F Teil der Browser Automation Tools",
      min: 1e3,
      max: 3e4,
      int: true,
      hint: "Maximum time (ms) to wait for browser operations before timing out."
    }, DEFAULT_CONFIG.browserTimeout).field("headlessMode", "boolean", {
      displayName: "\u{1F47B} Headless Mode",
      subtitle: "\u2699\uFE0F Teil der Browser Automation Tools",
      hint: "Run browser without GUI (recommended for automation)."
    }, DEFAULT_CONFIG.headlessMode).field("pathValidationEnabled", "boolean", { displayName: "\u{1F512} Path Validation", hint: "Prevent directory traversal attacks" }, DEFAULT_CONFIG.pathValidationEnabled).field("binaryFileDetection", "boolean", { displayName: "\u{1F4C1} Binary File Detection", hint: "Detect binary files via null byte check" }, DEFAULT_CONFIG.binaryFileDetection).field("regexReDoSProtection", "boolean", { displayName: "\u{1F6E1}\uFE0F ReDoS Protection", hint: "Protect against regex denial-of-service" }, DEFAULT_CONFIG.regexReDoSProtection).field("maxRegexLength", "numeric", { min: 1, max: 1e3, int: true }, DEFAULT_CONFIG.maxRegexLength).field("statePersistenceEnabled", "boolean", { displayName: "\u{1F4BD} State Persistence", hint: "Persist tool execution state between sessions" }, DEFAULT_CONFIG.statePersistenceEnabled).field("stateMaxSize", "numeric", { min: 1024, max: 1048576, int: true }, DEFAULT_CONFIG.stateMaxSize).field("language", "select", {
      displayName: "\u{1F310} Language",
      options: [
        { value: "en", displayName: "English" },
        { value: "de", displayName: "Deutsch (German)" },
        { value: "zh-CN", displayName: "Simplified Chinese" },
        { value: "zh-TW", displayName: "Traditional Chinese" }
      ]
    }, DEFAULT_CONFIG.language).field("notificationsEnabled", "boolean", { displayName: "\u{1F514} Desktop Notifications", hint: "Show system notifications" }, DEFAULT_CONFIG.notificationsEnabled).field("temporalAwareness", "boolean", {
      displayName: "\u23F0 Temporal Awareness",
      subtitle: "Injects current date/time into every message",
      hint: "Enables the AI to know the current time."
    }, DEFAULT_CONFIG.temporalAwareness).field("dateFormatStyle", "select", {
      displayName: "\u{1F4C5} Date Format Style",
      options: [
        { value: "standard", displayName: "Standard ([Zeit: ...])" },
        { value: "heuteIst", displayName: "HEUTE IST Mode (Prominent)" }
      ]
    }, DEFAULT_CONFIG.dateFormatStyle).field("contextGuardEnabled", "boolean", {
      displayName: "\u{1F9E0} ContextGuard Token Management",
      subtitle: "Automatic history compression & smart reading",
      hint: "Automatically compresses chat history when token limit is reached. Enables smart file reading and terminal output filtering."
    }, DEFAULT_CONFIG.contextGuardEnabled).field("contextGuardTokenLimit", "numeric", {
      displayName: "\u{1F4CA} Token Limit Before Compression",
      subtitle: "\u2699\uFE0F ContextGuard Setting",
      min: 1e3,
      max: 2e5,
      int: true,
      hint: "Compression triggers at 90% of this limit. Higher = more context retained but slower responses."
    }, DEFAULT_CONFIG.contextGuardTokenLimit).field("contextGuardSmartReading", "boolean", {
      displayName: "\u{1F50D} Smart File Reading",
      subtitle: "\u2699\uFE0F ContextGuard Setting",
      hint: "Extracts keywords from user queries to read only relevant portions of files. Saves tokens and speeds up responses."
    }, DEFAULT_CONFIG.contextGuardSmartReading).field("contextGuardSummaryModel", "string", {
      displayName: "\u{1F916} Summary Model Name",
      subtitle: "\u2699\uFE0F ContextGuard Setting",
      placeholder: "(leave empty for current chat model)",
      hint: "LM Studio model name used for history summarization. Leave empty to use your current chat model."
    }, DEFAULT_CONFIG.contextGuardSummaryModel).field("contextGuardTerminalFilterEnabled", "boolean", {
      displayName: "\u{1F4CC} Terminal Output Filtering",
      subtitle: "\u2699\uFE0F ContextGuard Setting",
      hint: "Automatically truncates long terminal outputs to save tokens."
    }, DEFAULT_CONFIG.contextGuardTerminalFilterEnabled).field("contextGuardTerminalFilterLength", "numeric", {
      displayName: "\u{1F4CF} Max Terminal Output Length",
      subtitle: "\u2699\uFE0F ContextGuard Setting",
      min: 100,
      max: 2e4,
      int: true,
      hint: "Maximum characters before terminal output is truncated and summarized."
    }, DEFAULT_CONFIG.contextGuardTerminalFilterLength).field("autoTrackingEnabled", "boolean", {
      displayName: "\u{1F916} Auto-Tracking Enabled",
      subtitle: "Automatically remember important events",
      hint: "When enabled, the plugin will silently track decisions, completions, and fixes without user prompts. OFF by default for privacy."
    }, DEFAULT_CONFIG.autoTrackingEnabled).field("autoTrackDecisions", "boolean", {
      displayName: "\u{1F4CC} Track Decisions Automatically",
      subtitle: "\u2699\uFE0F Auto-Tracking Setting",
      hint: 'Detects phrases like "I decided", "conclusion", "going with".'
    }, DEFAULT_CONFIG.autoTrackDecisions).field("autoTrackCompletions", "boolean", {
      displayName: "\u2705 Track Completions Automatically",
      subtitle: "\u2699\uFE0F Auto-Tracking Setting",
      hint: 'Detects phrases like "successfully completed", "finished implementing".'
    }, DEFAULT_CONFIG.autoTrackCompletions).field("autoTrackErrors", "boolean", {
      displayName: "\u{1F41B} Track Bug Fixes Automatically",
      subtitle: "\u2699\uFE0F Auto-Tracking Setting",
      hint: 'Detects phrases like "fixed the bug", "resolved the issue".'
    }, DEFAULT_CONFIG.autoTrackErrors).field("autoSummaryInterval", "numeric", {
      displayName: "\u{1F4CA} Session Summary Interval",
      subtitle: "\u2699\uFE0F Auto-Tracking Setting",
      min: 10,
      max: 200,
      int: true,
      hint: "Number of messages between automatic session summaries. Higher = less frequent."
    }, DEFAULT_CONFIG.autoSummaryInterval).build();
  }
});

// src/stateManager.ts
function createDebouncedSave(saveFn, delayMs = 500) {
  let timerId = null;
  return function debouncedSave() {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      saveFn();
      timerId = null;
    }, delayMs);
  };
}
function getMemoryFilePath() {
  const platform4 = os.platform();
  let baseDir;
  switch (platform4) {
    case "win32":
      baseDir = path.join(process.env.APPDATA || "", "lm-studio", "plugins");
      break;
    case "darwin":
      baseDir = path.join(os.homedir(), "Library", "Application Support", "lm-studio", "plugins");
      break;
    default:
      baseDir = path.join(process.env.HOME || "", ".local", "share", "lm-studio", "plugins");
  }
  return path.join(baseDir, "ai-toolbox-memory.json");
}
var fs, path, os, logger, StateManager;
var init_stateManager = __esm({
  "src/stateManager.ts"() {
    "use strict";
    init_config();
    fs = __toESM(require("fs"));
    path = __toESM(require("path"));
    os = __toESM(require("os"));
    logger = {
      warn: (msg) => typeof process.stderr.write === "function" && process.stderr.write(`[StateManager] ${msg}
`)
    };
    StateManager = class {
      constructor(config) {
        this.state = /* @__PURE__ */ new Map();
        this.runningSize = 0;
        const effectiveConfig = config || DEFAULT_CONFIG;
        this.maxSize = effectiveConfig.stateMaxSize;
        this.persistenceEnabled = effectiveConfig.statePersistenceEnabled;
        this.memoryFile = getMemoryFilePath();
        this.debouncedSave = createDebouncedSave(() => this.saveToFile(), 500);
        if (this.persistenceEnabled) {
          this.loadFromFile();
        }
      }
      /**
       * Set a state value with key and optional metadata
       */
      set(key, value) {
        const newValueSize = this.getSizeOfValue(value);
        const oldValueSize = this.getExistingValueSize(key);
        if (this.runningSize - oldValueSize + newValueSize > this.maxSize) {
          throw new Error(`State size exceeds maximum (${this.maxSize} bytes)`);
        }
        this.runningSize = this.runningSize - oldValueSize + newValueSize;
        this.state.set(key, {
          key,
          value,
          timestamp: Date.now()
        });
        if (this.persistenceEnabled) {
          this.debouncedSave();
        }
      }
      /**
       * Get a state value by key
       */
      get(key) {
        const entry = this.state.get(key);
        if (!entry) return void 0;
        return entry.value;
      }
      /**
       * Delete a state entry
       */
      delete(key) {
        const entry = this.state.get(key);
        if (!entry) return false;
        this.runningSize -= this.getSizeOfValue(entry.value);
        const deleted = this.state.delete(key);
        if (deleted && this.persistenceEnabled) {
          this.debouncedSave();
        }
        return deleted;
      }
      /**
       * Get all state keys
       */
      getAllKeys() {
        return Array.from(this.state.keys());
      }
      /**
       * Clear all state
       */
      clear() {
        this.runningSize = 0;
        this.state.clear();
        if (this.persistenceEnabled) {
          this.debouncedSave();
        }
      }
      /**
       * Get size of existing value for a key (for incremental updates)
       */
      getExistingValueSize(key) {
        const entry = this.state.get(key);
        return entry ? this.getSizeOfValue(entry.value) : 0;
      }
      /**
       * Estimate size of a value in bytes
       */
      getSizeOfValue(value) {
        if (typeof value === "string") return value.length;
        if (typeof value === "number") return 8;
        if (typeof value === "boolean") return 1;
        if (Array.isArray(value)) {
          return value.reduce((sum, elem) => sum + this.getSizeOfValue(elem), 0);
        }
        if (value instanceof Map) return value.size * 16;
        if (value instanceof Object && !(value instanceof Date)) {
          return JSON.stringify(value).length;
        }
        return 0;
      }
      /**
       * Save state to disk as JSON file with optimized serialization
       */
      saveToFile() {
        try {
          const data = Array.from(this.state.entries()).map(([_key, entry]) => ({
            key: entry.key,
            value: entry.value,
            timestamp: entry.timestamp
          }));
          const dir = path.dirname(this.memoryFile);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          const jsonString = JSON.stringify(data);
          const tempFile = this.memoryFile + ".tmp";
          fs.writeFileSync(tempFile, jsonString, "utf-8");
          fs.renameSync(tempFile, this.memoryFile);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.warn(`Failed to save to disk: ${message}`);
        }
      }
      /**
       * Load state from disk JSON file with corruption recovery
       */
      loadFromFile() {
        try {
          if (!fs.existsSync(this.memoryFile)) return;
          const jsonString = fs.readFileSync(this.memoryFile, "utf-8");
          let data;
          try {
            data = JSON.parse(jsonString);
          } catch {
            logger.warn(`Corrupted state file detected, attempting recovery...`);
            const backupFile = this.memoryFile + ".backup";
            if (fs.existsSync(backupFile)) {
              try {
                const backupString = fs.readFileSync(backupFile, "utf-8");
                data = JSON.parse(backupString);
                logger.warn(`Successfully loaded from backup`);
              } catch {
                logger.warn(`Backup also corrupted, starting fresh`);
                data = [];
              }
            } else {
              logger.warn(`No backup available, starting fresh`);
              data = [];
            }
          }
          this.state.clear();
          this.runningSize = 0;
          for (const entry of data) {
            if (entry && typeof entry.key === "string" && typeof entry.timestamp === "number") {
              this.state.set(entry.key, entry);
              this.runningSize += this.getSizeOfValue(entry.value);
            }
          }
          try {
            fs.writeFileSync(this.memoryFile + ".backup", jsonString, "utf-8");
          } catch {
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.warn(`Failed to load from disk: ${message}`);
        }
      }
      /**
       * Export state for persistence (JSON serialization) — kept for backward compatibility
       */
      exportState() {
        const data = Array.from(this.state.entries()).map(([_key, entry]) => ({
          key: entry.key,
          value: entry.value,
          timestamp: entry.timestamp
        }));
        return JSON.stringify(data);
      }
      /**
       * Import state from JSON string — kept for backward compatibility
       */
      importState(jsonString) {
        try {
          const data = JSON.parse(jsonString);
          this.state.clear();
          this.runningSize = 0;
          for (const entry of data) {
            this.state.set(entry.key, entry);
            this.runningSize += this.getSizeOfValue(entry.value);
          }
          if (this.persistenceEnabled) {
            this.debouncedSave();
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to import state: ${message}`);
        }
      }
      /**
       * Get the path to the memory file on disk
       */
      getMemoryFilePath() {
        return this.memoryFile;
      }
      /**
       * Force save to disk (useful for debugging)
       */
      forceSave() {
        this.saveToFile();
      }
      /**
       * Force load from disk (useful for debugging)
       */
      forceLoad() {
        this.loadFromFile();
      }
    };
  }
});

// src/backgroundCommands.ts
var BackgroundCommandManager;
var init_backgroundCommands = __esm({
  "src/backgroundCommands.ts"() {
    "use strict";
    BackgroundCommandManager = class {
      constructor(_config) {
        this.commands = /* @__PURE__ */ new Map();
        this.maxTimeoutHours = 10;
      }
      /**
       * Register a new background command
       */
      register(command, timeoutHours, name) {
        if (timeoutHours < 0.1 || timeoutHours > this.maxTimeoutHours) {
          throw new Error(`Timeout must be between 0.1 and ${this.maxTimeoutHours} hours`);
        }
        if (!name || name.length === 0) {
          throw new Error("Command name is mandatory");
        }
        const id = this.generateId();
        this.commands.set(id, {
          id,
          command,
          name,
          startTime: Date.now(),
          timeoutHours,
          status: "running"
        });
        return id;
      }
      /**
       * Check status and output of a background command
       */
      check(id) {
        const command = this.commands.get(id);
        if (!command) return null;
        const elapsedHours = (Date.now() - command.startTime) / (1e3 * 60 * 60);
        if (elapsedHours > command.timeoutHours && command.status === "running") {
          command.status = "errored";
          command.stderr = `Command exceeded timeout (${command.timeoutHours} hours)`;
        }
        return command;
      }
      /**
       * Cancel a running background command
       */
      cancel(id) {
        const command = this.commands.get(id);
        if (!command || command.status !== "running") return false;
        command.status = "cancelled";
        return true;
      }
      /**
       * Get all active commands
       */
      getActiveCommands() {
        return Array.from(this.commands.values()).filter((c) => c.status === "running");
      }
      /**
       * Remove completed/errored/cancelled commands after cleanup period
       */
      cleanup(maxAgeHours = 24) {
        const now = Date.now();
        for (const [id, command] of this.commands.entries()) {
          if (command.status !== "running") {
            const ageHours = (now - command.startTime) / (1e3 * 60 * 60);
            if (ageHours > maxAgeHours) {
              this.commands.delete(id);
            }
          }
        }
      }
      /**
       * Generate unique command ID
       */
      generateId() {
        return `bg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      }
      /**
       * Get total count of registered commands
       */
      getCount() {
        return this.commands.size;
      }
    };
  }
});

// src/workingDir.ts
var workingDir_exports = {};
__export(workingDir_exports, {
  getAllowedBases: () => getAllowedBases,
  getPluginRoot: () => getPluginRoot,
  getWorkingDir: () => getWorkingDir,
  resetWorkingDir: () => resetWorkingDir,
  resolvePath: () => resolvePath,
  setWorkingDir: () => setWorkingDir
});
function loadState() {
  try {
    if (fs2.existsSync(STATE_FILE)) {
      const data = fs2.readFileSync(STATE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
  }
  return {};
}
function saveState(state) {
  try {
    fs2.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.warn(`[WorkingDir] Failed to persist state: ${error}`);
  }
}
function getWorkingDir() {
  return currentWorkingDir;
}
function setWorkingDir(newDir) {
  const resolved = path2.resolve(newDir);
  if (!path2.isAbsolute(resolved)) {
    console.warn(`setWorkingDir rejected: not absolute \u2014 '${newDir}'`);
    return false;
  }
  try {
    const stats = fs2.statSync(resolved);
    if (!stats.isDirectory()) {
      console.warn(`setWorkingDir rejected: not a directory \u2014 '${resolved}'`);
      return false;
    }
  } catch {
    console.warn(`setWorkingDir rejected: path does not exist \u2014 '${resolved}'`);
    return false;
  }
  currentWorkingDir = resolved;
  saveState({ workingDir: resolved });
  console.log(`[WorkingDir] Persisted new working directory: ${resolved}`);
  return true;
}
function resetWorkingDir() {
  currentWorkingDir = BASE_DIR;
  saveState({ workingDir: void 0 });
  console.log(`[WorkingDir] Reset to plugin root: ${BASE_DIR}`);
}
function resolvePath(userPath) {
  return path2.resolve(currentWorkingDir, userPath);
}
function getAllowedBases() {
  const bases = [BASE_DIR, currentWorkingDir];
  return [...new Set(bases)];
}
function getPluginRoot() {
  return BASE_DIR;
}
var path2, fs2, BASE_DIR, STATE_FILE, persistedState, currentWorkingDir;
var init_workingDir = __esm({
  "src/workingDir.ts"() {
    "use strict";
    path2 = __toESM(require("path"));
    fs2 = __toESM(require("fs"));
    BASE_DIR = path2.join(__dirname, "..");
    STATE_FILE = path2.join(BASE_DIR, ".ai_toolbox_state.json");
    persistedState = loadState();
    currentWorkingDir = persistedState.workingDir || BASE_DIR;
  }
});

// src/security.ts
function validatePath(userPath, basePath) {
  if (!userPath || !basePath) {
    return false;
  }
  const normalizedPath = userPath.replace(/\\/g, "/");
  if (normalizedPath.startsWith("../") || normalizedPath === ".." || normalizedPath.includes("/../")) {
    return false;
  }
  if (userPath.startsWith("\\\\") || userPath.startsWith("//")) {
    return false;
  }
  return true;
}
function isSafeRegex(pattern) {
  if (!pattern || pattern.length > 500) return false;
  const dangerousStructures = [
    /(\([^)]*\)[*+])[^)]*\)/,
    // Nested quantifiers: (.*)(.*)
    /\([^)]*[+*]\)+/,
    // Repetition of repetition: (.+)+
    /\([^)]*\|[^)]*\)[+*]/,
    // Alternation + repetition: (a|b)+
    /(\[[^\]]+\][+*])[^]]*\]/,
    // Char class with repetition: ([a-z]+)+
    /\(\.\?\)\*\*/
    // Group followed by double star: (.*?)**
  ];
  for (const structure of dangerousStructures) {
    if (structure.test(pattern)) return false;
  }
  const dangerousPatterns = [
    "(.*)(.*)",
    // Nested quantifiers with .*
    "(.+)+",
    // Repetition of repetition  
    "([a-z]+)+",
    // Character class with repetition
    "(a|b)+",
    // Alternation with repetition
    "(.*?)**"
    // Group followed by double star (ReDoS)
  ];
  for (const dangerousPattern of dangerousPatterns) {
    if (pattern.includes(dangerousPattern)) return false;
  }
  return true;
}
function sanitizeCommand(command) {
  if (!command || typeof command !== "string") {
    return { safe: false, reason: "Empty or invalid command" };
  }
  const normalized = command.trim();
  if (normalized.includes("\0") || normalized.includes("%00")) {
    return { safe: false, reason: "Null byte injection detected" };
  }
  const ifsPatterns = [
    /\bIFS\s*=\s*[\\$']\s*/i,
    /IFS=[$'][^']*'/i
  ];
  for (const pattern of ifsPatterns) {
    if (pattern.test(normalized)) {
      return { safe: false, reason: "IFS tampering detected" };
    }
  }
  const dangerousPatterns = [
    // File system destruction
    /\brm\s+-rf\b/i,
    /\bshred\b/i,
    /\bwipe\b/i,
    // Privilege escalation
    /\bsudo\b/i,
    /\bsu\b(?!\w)/i,
    // 'su' but not 'sudo', 'sushi', etc.
    // Network attacks
    /\bnc\b(?!\w)|\bnetcat\b/i,
    /\bwget\s+.*--post-file\b/i,
    /\bcurl\s+.*--data-binary\b/i,
    // Data exfiltration
    /\bbase64\b.*\|\s*(curl|wget)/i,
    /\bscp\b(?!\w)|\bsftp\b/i,
    // Process manipulation
    /\bfork\b(?!\w)/i,
    /\bexec\b(?!\w)/i,
    // Environment tampering
    /\bexport\s+\w+=/i,
    /\beval\b(?!\w)/i
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(normalized)) {
      return { safe: false, reason: `Dangerous command detected: ${pattern.source}` };
    }
  }
  const pipeCount = (normalized.match(/\|/g) || []).length;
  if (pipeCount > 2) {
    return { safe: false, reason: "Too many pipes in command chain" };
  }
  const semiColonCount = (normalized.match(/;/g) || []).length;
  if (semiColonCount > 1) {
    return { safe: false, reason: "Multiple semicolons detected in command" };
  }
  if (/`[^`]+`|\$\([^)]+\)/.test(normalized)) {
    return { safe: false, reason: "Command substitution detected" };
  }
  if (/^\s*(export|unset)\s/.test(normalized)) {
    return { safe: false, reason: "Environment modification detected" };
  }
  return { safe: true };
}
function validateSQLQuery(query) {
  if (!query || typeof query !== "string") {
    return { valid: false, reason: "Empty or invalid query" };
  }
  const trimmed = query.trim().toUpperCase();
  if (!trimmed.startsWith("SELECT") && !trimmed.startsWith("PRAGMA")) {
    return { valid: false, reason: "Only SELECT and PRAGMA queries are allowed" };
  }
  const dangerousSQLKeywords = [
    /\bDROP\b/i,
    /\bDELETE\b/i,
    /\bUPDATE\b/i,
    /\bINSERT\b/i,
    /\bALTER\b/i,
    /\bCREATE\b/i,
    /\bREPLACE\b/i,
    /\bTRUNCATE\b/i,
    /\bGRANT\b/i,
    /\bREVOKE\b/i
  ];
  for (const keyword of dangerousSQLKeywords) {
    if (keyword.test(trimmed)) {
      return { valid: false, reason: `Dangerous SQL operation detected: ${keyword.source}` };
    }
  }
  const semiColonCount = (trimmed.match(/;/g) || []).length;
  if (semiColonCount > 0) {
    return { valid: false, reason: "Multiple SQL statements detected" };
  }
  return { valid: true };
}
var init_security = __esm({
  "src/security.ts"() {
    "use strict";
    init_config();
    init_workingDir();
  }
});

// src/performanceUtils.ts
function levenshteinSimilarity(a, b, minScore = 0.3) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const lenDiff = Math.abs(a.length - b.length);
  if (lenDiff / maxLen > 1 - minScore) {
    return null;
  }
  let prevRow = [];
  for (let i = 0; i <= b.length; i++) {
    prevRow.push(0);
  }
  let currRow = [];
  for (let i = 0; i <= b.length; i++) {
    prevRow[i] = i;
  }
  for (let i = 1; i <= a.length; i++) {
    currRow[0] = i;
    let minInRow = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,
        // deletion
        currRow[j - 1] + 1,
        // insertion  
        prevRow[j - 1] + cost
        // substitution
      );
      if (currRow[j] < minInRow) {
        minInRow = currRow[j];
      }
    }
    const currentMaxScore = 1 - minInRow / maxLen;
    if (currentMaxScore < minScore) {
      return null;
    }
    [prevRow, currRow] = [currRow, prevRow];
  }
  const distance = prevRow[b.length];
  const score = Math.max(0, 1 - distance / maxLen);
  return score >= minScore ? score : null;
}
function getCachedFuzzyResults(query, basePath) {
  const cacheKey = `${query}:${basePath}`;
  const entry = fuzzySearchCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    fuzzySearchCache.delete(cacheKey);
    return null;
  }
  return entry.results;
}
function cacheFuzzyResults(query, basePath, results) {
  const cacheKey = `${query}:${basePath}`;
  fuzzySearchCache.set(cacheKey, {
    results,
    timestamp: Date.now()
  });
  if (fuzzySearchCache.size > 100) {
    const oldestKey = fuzzySearchCache.keys().next().value;
    if (oldestKey) {
      fuzzySearchCache.delete(oldestKey);
    }
  }
}
async function findFilesAsync(dirPath, pattern, maxDepth = 5, concurrencyLimit = 4) {
  const results = [];
  const patternLower = pattern.toLowerCase();
  async function searchDir(currentPath, depth) {
    if (depth > maxDepth) return;
    try {
      const entries = await fs3.readdir(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.toLowerCase().includes(patternLower)) {
          results.push(path3.join(currentPath, entry.name));
        }
      }
      const subdirs = entries.filter((e) => e.isDirectory()).map((e) => path3.join(currentPath, e.name));
      if (subdirs.length > 0) {
        const batches = [];
        for (let i = 0; i < subdirs.length; i += concurrencyLimit) {
          batches.push(subdirs.slice(i, i + concurrencyLimit));
        }
        for (const batch of batches) {
          await Promise.all(
            batch.map((dir) => searchDir(dir, depth + 1))
          );
        }
      }
    } catch {
    }
  }
  await searchDir(dirPath, 0);
  return { files: results, count: results.length };
}
async function fetchWithCache(url, options) {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  if (options?.method !== "POST") {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < REQUEST_CACHE_TTL_MS) {
      return new Response(JSON.stringify(cached.data), {
        status: cached.status,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  const response = await fetch(url, options);
  if (response.ok && options?.method !== "POST") {
    try {
      const data = await response.json();
      requestCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        status: response.status
      });
      if (requestCache.size > 50) {
        const oldestKey = requestCache.keys().next().value;
        if (oldestKey) {
          requestCache.delete(oldestKey);
        }
      }
    } catch {
    }
  }
  return response;
}
async function fetchWithRetry(url, options, maxRetries = 3, baseDelayMs = 1e3) {
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithCache(url, options);
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve2) => setTimeout(resolve2, delayMs));
      }
    }
  }
  throw lastError || new Error(`Request failed after ${maxRetries} retries`);
}
function getAnalysisTimeout(baseTimeoutMs, fileCount) {
  if (!fileCount) return baseTimeoutMs;
  const scaleFactor = Math.log2(Math.max(1, fileCount)) / 10;
  const scaledTimeout = baseTimeoutMs * (1 + scaleFactor);
  return Math.min(scaledTimeout, 6e4);
}
async function countTypeScriptFiles(dirPath) {
  let count = 0;
  async function countInDir(currentPath, depth) {
    if (depth > 10) return;
    try {
      const entries = await fs3.readdir(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".ts")) {
          count++;
        } else if (entry.isDirectory()) {
          if (!["node_modules", ".git", "dist", "build"].includes(entry.name)) {
            await countInDir(path3.join(currentPath, entry.name), depth + 1);
          }
        }
      }
    } catch {
    }
  }
  await countInDir(dirPath, 0);
  return count;
}
var fs3, path3, fuzzySearchCache, CACHE_TTL_MS, requestCache, REQUEST_CACHE_TTL_MS;
var init_performanceUtils = __esm({
  "src/performanceUtils.ts"() {
    "use strict";
    fs3 = __toESM(require("fs/promises"));
    path3 = __toESM(require("path"));
    fuzzySearchCache = /* @__PURE__ */ new Map();
    CACHE_TTL_MS = 6e4;
    requestCache = /* @__PURE__ */ new Map();
    REQUEST_CACHE_TTL_MS = 3e4;
  }
});

// src/tools/fileSystemTools.ts
function handleError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}
function registerFileSystemTools(config, _stateManager) {
  const tools = [];
  tools.push((0, import_sdk2.tool)({
    name: "list_directory",
    description: "List the files and directories in the current working directory or a specified subdirectory.",
    parameters: {
      path: import_zod2.z.string().optional().describe("The path to the directory to list. Defaults to current working directory.")
    },
    implementation: async ({ path: dirPath }) => {
      const targetPath = dirPath || ".";
      try {
        if (!validatePath(targetPath, getWorkingDir())) {
          return { success: false, error: "Invalid path: directory traversal detected" };
        }
        const fullPath = resolvePath(targetPath);
        const entries = fs4.readdirSync(fullPath, { withFileTypes: true });
        const result = entries.map((entry) => ({
          path: path4.join(fullPath, entry.name),
          name: entry.name,
          isDirectory: entry.isDirectory(),
          isFile: entry.isFile()
        }));
        return { success: true, data: result };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "read_file",
    description: "Read content from a file in the current working directory.",
    parameters: {
      file_name: import_zod2.z.string().describe("The name of the file to read"),
      max_length: import_zod2.z.number().int().min(1).max(5e4).optional().default(5e3).describe("Maximum number of characters to return (default: 5000)")
    },
    implementation: async ({ file_name, max_length }) => {
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: "Invalid path: directory traversal detected" };
        }
        const fullPath = resolvePath(file_name);
        const maxLength = max_length || 5e3;
        let stats;
        try {
          stats = await fs4.promises.stat(fullPath);
        } catch (e) {
          return handleError(e);
        }
        if (stats.size > 1e7) {
          return { success: false, error: "File too large (>10MB)" };
        }
        const buffer = await fs4.promises.readFile(fullPath);
        const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 1024));
        if (checkBuffer.includes(0)) {
          return { success: false, error: "Binary file detected. Use read_document for PDF/DOCX files." };
        }
        const content = buffer.toString("utf-8");
        let dataContent = content;
        let truncated = false;
        let totalLength = content.length;
        if (content.length > maxLength) {
          dataContent = content.substring(0, maxLength);
          truncated = true;
        }
        return {
          success: true,
          data: {
            content: dataContent,
            filePath: fullPath,
            // ✅ FULL PATH
            ...truncated ? { truncated: true, total_length: totalLength } : {}
          }
        };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "read_file_chunked",
    description: "Read a file in chunks when it exceeds the character limit. Automatically splits large files for efficient partial reading.",
    parameters: {
      file_name: import_zod2.z.string().describe("The name of the file to read"),
      chunk_size: import_zod2.z.number().int().min(100).max(5e4).optional().default(5e4).describe("Maximum characters per chunk (default: 50000)"),
      max_chunks: import_zod2.z.number().int().min(1).max(100).optional().default(20).describe("Maximum number of chunks to return (default: 20)")
    },
    implementation: async ({ file_name, chunk_size, max_chunks }) => {
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: "Invalid path: directory traversal detected" };
        }
        const fullPath = resolvePath(file_name);
        let stats;
        try {
          stats = await fs4.promises.stat(fullPath);
        } catch (e) {
          return handleError(e);
        }
        if (stats.size > 1e7) {
          return { success: false, error: "File too large (>10MB)" };
        }
        const buffer = await fs4.promises.readFile(fullPath);
        const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 1024));
        if (checkBuffer.includes(0)) {
          return { success: false, error: "Binary file detected. Use read_document for PDF/DOCX files." };
        }
        const content = buffer.toString("utf-8");
        const totalChars = content.length;
        if (totalChars <= chunk_size) {
          return {
            success: true,
            data: {
              filePath: fullPath,
              totalCharacters: totalChars,
              chunksReturned: 1,
              isTruncated: false,
              chunks: [{
                index: 0,
                content,
                startChar: 0,
                endChar: totalChars,
                truncated: false
              }]
            }
          };
        }
        const chunks = [];
        let startIndex = 0;
        for (let i = 0; i < max_chunks && startIndex < totalChars; i++) {
          const endIndex = Math.min(startIndex + chunk_size, totalChars);
          chunks.push({
            index: i,
            content: content.substring(startIndex, endIndex),
            startChar: startIndex,
            endChar: endIndex,
            truncated: endIndex < totalChars
          });
          startIndex = endIndex;
        }
        return {
          success: true,
          data: {
            filePath: fullPath,
            totalCharacters: totalChars,
            chunkSize: chunk_size,
            maxChunks: max_chunks,
            chunksReturned: chunks.length,
            isTruncated: startIndex < totalChars,
            chunks
          }
        };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "save_file",
    description: "Save content to a specified file in the current working directory. Supports batch saving.",
    parameters: {
      file_name: import_zod2.z.string().optional().describe("The name of the file to save"),
      content: import_zod2.z.string().optional().describe("The content to write to the file"),
      files: import_zod2.z.array(import_zod2.z.object({ file_name: import_zod2.z.string(), content: import_zod2.z.string() })).optional().describe("For batch saving multiple files")
    },
    implementation: async ({ file_name, content, files }) => {
      try {
        if (files && Array.isArray(files)) {
          const results = [];
          for (const file of files) {
            if (!validatePath(file.file_name, getWorkingDir())) {
              return { success: false, error: `Invalid path in batch: ${file.file_name}` };
            }
            const fullPath = resolvePath(file.file_name);
            fs4.writeFileSync(fullPath, file.content, "utf-8");
            results.push({ file: fullPath, status: "saved" });
          }
          return { success: true, data: { savedFiles: files.length, results } };
        } else if (file_name && content !== void 0) {
          if (!validatePath(file_name, getWorkingDir())) {
            return { success: false, error: "Invalid path: directory traversal detected" };
          }
          const fullPath = resolvePath(file_name);
          fs4.writeFileSync(fullPath, content, "utf-8");
          return { success: true, data: { savedFile: fullPath, path: fullPath } };
        } else {
          return { success: false, error: "Either provide file_name+content or files array" };
        }
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "replace_text_in_file",
    description: "Replace a specific string in a file with a new string.",
    parameters: {
      file_name: import_zod2.z.string().describe("The file to modify"),
      old_string: import_zod2.z.string().describe("The exact text to replace. Must be unique in the file."),
      new_string: import_zod2.z.string().describe("The text to insert in place of old_string.")
    },
    implementation: async ({ file_name, old_string, new_string }) => {
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: "Invalid path" };
        }
        const fullPath = resolvePath(file_name);
        let content = fs4.readFileSync(fullPath, "utf-8");
        if (!content.includes(old_string)) {
          return { success: false, error: `String '${old_string}' not found in file` };
        }
        const newContent = content.replace(old_string, new_string);
        fs4.writeFileSync(fullPath, newContent, "utf-8");
        return { success: true, data: { replaced: true, file: fullPath } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "insert_at_line",
    description: "Insert content at a specific line number in a file.",
    parameters: {
      file_name: import_zod2.z.string().describe("The file to modify"),
      line_number: import_zod2.z.number().int().min(1).describe("The line number to insert at (1-indexed)"),
      content_to_insert: import_zod2.z.string().describe("The text content to insert")
    },
    implementation: async ({ file_name, line_number, content_to_insert }) => {
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: "Invalid path" };
        }
        const fullPath = resolvePath(file_name);
        let lines = fs4.readFileSync(fullPath, "utf-8").split("\n");
        if (line_number > lines.length + 1) {
          return { success: false, error: `Line number ${line_number} exceeds file length (${lines.length})` };
        }
        lines.splice(line_number - 1, 0, content_to_insert);
        fs4.writeFileSync(fullPath, lines.join("\n"), "utf-8");
        return { success: true, data: { insertedAt: line_number, file: fullPath } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "append_file",
    description: "Append content to the end of a file. If the file doesn't exist, it will be created.",
    parameters: {
      file_name: import_zod2.z.string().describe("The file to append to"),
      content: import_zod2.z.string().describe("The text content to append")
    },
    implementation: async ({ file_name, content }) => {
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: "Invalid path" };
        }
        const fullPath = resolvePath(file_name);
        fs4.appendFileSync(fullPath, content, "utf-8");
        return { success: true, data: { appendedTo: fullPath } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "delete_lines_in_file",
    description: "Delete a specific line or range of lines from a file.",
    parameters: {
      file_name: import_zod2.z.string().describe("The file to modify"),
      start_line: import_zod2.z.number().int().min(1).describe("Starting line number (1-indexed)"),
      end_line: import_zod2.z.number().int().min(1).optional().describe("Ending line number (inclusive). If omitted, only deletes start_line.")
    },
    implementation: async ({ file_name, start_line, end_line }) => {
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: "Invalid path" };
        }
        const fullPath = resolvePath(file_name);
        let lines = fs4.readFileSync(fullPath, "utf-8").split("\n");
        const deleteEnd = end_line || start_line;
        if (start_line > lines.length) {
          return { success: false, error: `Start line ${start_line} exceeds file length (${lines.length})` };
        }
        const clampedEnd = Math.min(deleteEnd, lines.length);
        lines.splice(start_line - 1, clampedEnd - start_line + 1);
        fs4.writeFileSync(fullPath, lines.join("\n"), "utf-8");
        return { success: true, data: { deletedLines: `${start_line}-${clampedEnd}`, file: fullPath } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "make_directory",
    description: "Create a new directory in the current working directory.",
    parameters: {
      directory_name: import_zod2.z.string().describe("The name of the directory to create")
    },
    implementation: async ({ directory_name }) => {
      try {
        if (!validatePath(directory_name, getWorkingDir())) {
          return { success: false, error: "Invalid path" };
        }
        const fullPath = resolvePath(directory_name);
        fs4.mkdirSync(fullPath, { recursive: true });
        return { success: true, data: { createdDirectory: directory_name, path: fullPath } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "move_file",
    description: "Move or rename a file or directory.",
    parameters: {
      source: import_zod2.z.string().describe("Source path"),
      destination: import_zod2.z.string().describe("Destination path")
    },
    implementation: async ({ source, destination }) => {
      try {
        if (!validatePath(source, getWorkingDir())) {
          return { success: false, error: "Invalid source path" };
        }
        if (!validatePath(destination, getWorkingDir())) {
          return { success: false, error: "Invalid destination path" };
        }
        const fullSource = resolvePath(source);
        const fullDestination = resolvePath(destination);
        fs4.renameSync(fullSource, fullDestination);
        return { success: true, data: { movedFrom: fullSource, movedTo: fullDestination } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "copy_file",
    description: "Copy a file to a new location.",
    parameters: {
      source: import_zod2.z.string().describe("Source file path"),
      destination: import_zod2.z.string().describe("Destination file path")
    },
    implementation: async ({ source, destination }) => {
      try {
        if (!validatePath(source, getWorkingDir())) {
          return { success: false, error: "Invalid source path" };
        }
        if (!validatePath(destination, getWorkingDir())) {
          return { success: false, error: "Invalid destination path" };
        }
        const fullSource = resolvePath(source);
        const fullDestination = resolvePath(destination);
        fs4.copyFileSync(fullSource, fullDestination);
        return { success: true, data: { copiedFrom: fullSource, copiedTo: fullDestination } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "delete_path",
    description: "Delete a file or directory in the current working directory. Be careful!",
    parameters: {
      path: import_zod2.z.string().describe("The path to delete")
    },
    implementation: async ({ path: filePath }) => {
      try {
        if (!validatePath(filePath, getWorkingDir())) {
          return { success: false, error: "Invalid path" };
        }
        const fullPath = resolvePath(filePath);
        const stats = fs4.statSync(fullPath);
        if (stats.isDirectory()) {
          fs4.rmSync(fullPath, { recursive: true });
        } else {
          fs4.unlinkSync(fullPath);
        }
        return { success: true, data: { deleted: fullPath } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "delete_files_by_pattern",
    description: "Delete multiple files in the current directory that match a regex pattern.",
    parameters: {
      pattern: import_zod2.z.string().describe("Regex pattern to match filenames")
    },
    implementation: async ({ pattern }) => {
      try {
        if (config.regexReDoSProtection && !isSafeRegex(pattern)) {
          return { success: false, error: "Unsafe regex pattern detected" };
        }
        const regex = new RegExp(pattern);
        const files = fs4.readdirSync(getWorkingDir());
        const deletedFiles = [];
        for (const file of files) {
          if (regex.test(file)) {
            const fullPath = resolvePath(file);
            fs4.unlinkSync(fullPath);
            deletedFiles.push(fullPath);
          }
        }
        return { success: true, data: { deletedCount: deletedFiles.length, deletedFiles } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "find_files",
    description: "Find files recursively in the current directory matching a name pattern. Uses async search for better performance.",
    parameters: {
      pattern: import_zod2.z.string().describe("Substring to match in filename (case-insensitive)"),
      max_depth: import_zod2.z.number().int().min(1).optional().describe("Maximum depth to search (default: 5)")
    },
    implementation: async ({ pattern, max_depth }) => {
      try {
        const searchPath = getWorkingDir();
        const depth = max_depth || 5;
        const result = await findFilesAsync(searchPath, pattern, depth);
        return { success: true, data: { foundFiles: result.files, count: result.count } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "fuzzy_find_local_files",
    description: "Fuzzy find local files by path/name similarity using optimized Levenshtein scoring with caching.",
    parameters: {
      query: import_zod2.z.string().describe("Search query to match against file names/paths."),
      path: import_zod2.z.string().optional().describe("Sub-directory to search in (default: current directory)."),
      max_results: import_zod2.z.number().int().min(1).max(20).optional().describe("Max results to return (default: 5).")
    },
    implementation: async ({ query, path: searchPath, max_results }) => {
      try {
        const baseDir = searchPath ? resolvePath(searchPath) : getWorkingDir();
        const maxResults = max_results || 5;
        const cachedResults = getCachedFuzzyResults(query, baseDir);
        if (cachedResults) {
          return { success: true, data: { matches: cachedResults.slice(0, maxResults), count: Math.min(cachedResults.length, maxResults) } };
        }
        const allFiles = [];
        async function collectFiles(dirPath, depth = 0, maxDepth = 20) {
          if (depth > maxDepth) return;
          try {
            const entries = await fs4.promises.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path4.join(dirPath, entry.name);
              if (entry.isDirectory()) {
                await collectFiles(fullPath, depth + 1, maxDepth);
              } else {
                allFiles.push(fullPath);
              }
            }
          } catch {
          }
        }
        await collectFiles(baseDir);
        const results = [];
        const queryLower = query.toLowerCase();
        const MIN_SCORE = 0.3;
        for (const file of allFiles) {
          const fileName = path4.basename(file).toLowerCase();
          const score = levenshteinSimilarity(queryLower, fileName, MIN_SCORE);
          if (score !== null) {
            results.push({ filePath: file, score });
          }
        }
        results.sort((a, b) => b.score - a.score);
        cacheFuzzyResults(query, baseDir, results);
        return { success: true, data: { matches: results.slice(0, maxResults), count: Math.min(results.length, maxResults) } };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "get_file_metadata",
    description: "Get metadata (size, dates) for a specific file.",
    parameters: {
      path: import_zod2.z.string().describe("The file path")
    },
    implementation: async ({ path: filePath }) => {
      try {
        if (!validatePath(filePath, getWorkingDir())) {
          return { success: false, error: "Invalid path" };
        }
        const fullPath = resolvePath(filePath);
        const stats = fs4.statSync(fullPath);
        return {
          success: true,
          data: {
            path: fullPath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            accessedAt: stats.atime,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile()
          }
        };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "change_directory",
    description: "Change the current working directory. All subsequent file operations will use this directory as the base.",
    parameters: {
      directory: import_zod2.z.string().describe('The absolute path to change to (e.g., "C:\\\\Projects\\\\my-app")')
    },
    implementation: async ({ directory }) => {
      try {
        const fullPath = resolvePath(directory);
        let stats;
        try {
          stats = await fs4.promises.stat(fullPath);
        } catch (e) {
          return handleError(e);
        }
        if (!stats.isDirectory()) {
          return { success: false, error: `Path is not a directory: ${fullPath}` };
        }
        const previousDirectory = getWorkingDir();
        const success = setWorkingDir(fullPath);
        if (!success) {
          return {
            success: false,
            error: `Failed to change directory to '${directory}'. Ensure the path exists and is a valid directory.`
          };
        }
        return {
          success: true,
          data: {
            previous_directory: previousDirectory,
            current_directory: getWorkingDir()
          }
        };
      } catch (error) {
        return handleError(error);
      }
    }
  }));
  tools.push((0, import_sdk2.tool)({
    name: "analyze_project",
    description: "Run project-wide analysis including TypeScript diagnostics, circular dependency detection, ESLint, config optimization, and import structure analysis.",
    parameters: {
      categories: import_zod2.z.array(import_zod2.z.enum(["typecheck", "circular", "eslint", "config", "imports"])).optional().describe("Analysis categories to run (default: all)"),
      max_imports_warning: import_zod2.z.number().int().min(5).max(100).optional().default(20).describe("Max imports per file before warning")
    },
    implementation: async ({ categories, max_imports_warning }) => {
      try {
        let spawnWithProgress2 = function(exe, args, timeoutMs) {
          return new Promise((resolve2) => {
            const proc = (0, import_child_process.spawn)(exe, args, {
              stdio: ["pipe", "pipe", "pipe"],
              cwd: workingDir,
              shell: true
              // ← CRITICAL: Enables PATH resolution and .cmd file execution on Windows
            });
            let stdout = "";
            let stderr = "";
            proc.stdout?.on("data", (d) => {
              stdout += d.toString();
            });
            proc.stderr?.on("data", (d) => {
              stderr += d.toString();
            });
            const timerId = setTimeout(() => {
              proc.kill();
              resolve2({ success: false, stderr: `Timeout after ${timeoutMs}ms` });
            }, timeoutMs);
            proc.on("close", () => {
              clearTimeout(timerId);
              resolve2({ success: true, stdout, stderr });
            });
            proc.on("error", (err) => {
              clearTimeout(timerId);
              resolve2({ success: false, stderr: err.message });
            });
          });
        }, runConfigAnalysis2 = function() {
          const tsConfigPath = path4.join(workingDir, "tsconfig.json");
          if (!fs4.existsSync(tsConfigPath)) {
            return { skipped: true, reason: "No tsconfig.json found" };
          }
          let tsConfig;
          try {
            tsConfig = JSON.parse(fs4.readFileSync(tsConfigPath, "utf-8"));
          } catch {
            return { skipped: true, reason: "Invalid tsconfig.json format" };
          }
          const compilerOptions = tsConfig.compilerOptions || {};
          const incremental = !!compilerOptions.incremental;
          const skipLibCheck = !!compilerOptions.skipLibCheck;
          const isolatedModules = !!compilerOptions.isolatedModules;
          const strict = !!compilerOptions.strict;
          const recommendations = [];
          if (!incremental) {
            recommendations.push('Enable "incremental": true in tsconfig.json for faster builds (build caching).');
          }
          if (!skipLibCheck) {
            recommendations.push('Enable "skipLibCheck": true to skip checking .d.ts files in node_modules.');
          }
          if (!isolatedModules) {
            recommendations.push('Consider enabling "isolatedModules": true for faster compilation (especially with Babel/esbuild).');
          }
          if (!strict) {
            recommendations.push('Enable "strict": true for better type safety and fewer runtime errors.');
          }
          const paths = compilerOptions.paths;
          if (!paths || Object.keys(paths).length === 0) {
            recommendations.push('Consider using "paths" in tsconfig.json to simplify module imports and reduce dependency depth.');
          }
          return {
            incremental,
            skipLibCheck,
            isolatedModules,
            strict,
            recommendations
          };
        }, runImportAnalysis2 = function() {
          const srcDir = path4.join(workingDir, "src");
          if (!fs4.existsSync(srcDir)) {
            return { skipped: true, reason: "No src/ directory found" };
          }
          function collectTsFiles(dir) {
            const files = [];
            const entries = fs4.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path4.join(dir, entry.name);
              if (entry.isDirectory()) {
                files.push(...collectTsFiles(fullPath));
              } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
                files.push(fullPath);
              }
            }
            return files;
          }
          const tsFiles = collectTsFiles(srcDir);
          const filesWithExcessiveImports = [];
          const declareGlobalUsage = [];
          for (const filePath of tsFiles) {
            try {
              const content = fs4.readFileSync(filePath, "utf-8");
              const importStatements = content.match(/^import\s+.*$/gm);
              const importCount = importStatements ? importStatements.length : 0;
              if (importCount > importWarningThreshold) {
                filesWithExcessiveImports.push({ file: path4.relative(workingDir, filePath), count: importCount });
              }
              const declareGlobalMatches = content.match(/declare\s+global/g);
              if (declareGlobalMatches && declareGlobalMatches.length > 0) {
                declareGlobalUsage.push({ file: path4.relative(workingDir, filePath) });
              }
            } catch {
            }
          }
          return {
            filesWithExcessiveImports,
            declareGlobalUsage
          };
        };
        var spawnWithProgress = spawnWithProgress2, runConfigAnalysis = runConfigAnalysis2, runImportAnalysis = runImportAnalysis2;
        const workingDir = getWorkingDir();
        const selectedCategories = categories || ["typecheck", "circular", "eslint", "config", "imports"];
        const importWarningThreshold = max_imports_warning || 20;
        async function runTypecheckAnalysis() {
          const tsConfigPath = path4.join(workingDir, "tsconfig.json");
          if (!fs4.existsSync(tsConfigPath)) {
            return { skipped: true, reason: "No tsconfig.json found" };
          }
          try {
            await spawnWithProgress2("npx", ["tsc", "--version"], 5e3);
          } catch {
            return { skipped: true, reason: "TypeScript compiler (tsc) not found" };
          }
          const fileCount = await countTypeScriptFiles(workingDir);
          const dynamicTimeout = getAnalysisTimeout(3e4, fileCount);
          const result = await spawnWithProgress2("npx", ["tsc", "--extendedDiagnostics"], dynamicTimeout);
          if (!result.success || !result.stdout) {
            return { skipped: true, reason: `tsc failed: ${result.stderr || "Unknown error"}` };
          }
          const lines = result.stdout.split("\n");
          let checkTimeMs = 0;
          let memoryUsedMB = 0;
          let filesChecked = 0;
          let emitTimeMs = 0;
          let parseTimeMs = 0;
          for (const line of lines) {
            const lowerLine = line.toLowerCase();
            const checkMatch = lowerLine.match(/check\s+time:\s+(\d+)\s*ms/);
            if (checkMatch) checkTimeMs = parseInt(checkMatch[1], 10);
            const memMatch = line.match(/memory used:\s+(\d+)\s*(kb|mb)/i);
            if (memMatch) {
              const value = parseInt(memMatch[1], 10);
              memoryUsedMB = memMatch[2].toLowerCase() === "mb" ? value : Math.round(value / 1024 * 100) / 100;
            }
            const filesMatch = line.match(/files\s+checked:\s+(\d+)/);
            if (filesMatch) filesChecked = parseInt(filesMatch[1], 10);
            const emitMatch = lowerLine.match(/emit\s+time:\s+(\d+)\s*ms/);
            if (emitMatch) emitTimeMs = parseInt(emitMatch[1], 10);
            const parseMatch = lowerLine.match(/parse\s+time:\s+(\d+)\s*ms/);
            if (parseMatch) parseTimeMs = parseInt(parseMatch[1], 10);
          }
          let assessment;
          if (checkTimeMs < 100) assessment = "fast";
          else if (checkTimeMs <= 500) assessment = "moderate";
          else assessment = "slow";
          return {
            checkTimeMs,
            memoryUsedMB: Math.round(memoryUsedMB * 100) / 100,
            filesChecked,
            emitTimeMs,
            parseTimeMs,
            assessment
          };
        }
        async function runCircularAnalysis() {
          const entryPoint = path4.join(workingDir, "src", "index.ts");
          if (!fs4.existsSync(entryPoint)) {
            return { skipped: true, reason: "No src/index.ts found" };
          }
          const fileCount = await countTypeScriptFiles(workingDir);
          const dynamicTimeout = getAnalysisTimeout(2e4, fileCount);
          const result = await spawnWithProgress2("npx", ["--yes", "madge", "--circular", entryPoint], dynamicTimeout);
          if (!result.success) {
            return { skipped: true, reason: `madge failed: ${result.stderr || "Unknown error"}` };
          }
          const cycles = [];
          const stdout = result.stdout || "";
          const lines = stdout.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("Found") && !trimmed.startsWith("No")) {
              if (trimmed.includes("->") || trimmed.endsWith(".ts")) {
                cycles.push(trimmed);
              }
            }
          }
          return {
            hasCycles: cycles.length > 0,
            cycles
          };
        }
        async function runEslintAnalysis() {
          const eslintConfigFiles = [
            path4.join(workingDir, "eslint.config.mjs"),
            path4.join(workingDir, "eslint.config.js"),
            path4.join(workingDir, ".eslintrc.js"),
            path4.join(workingDir, ".eslintrc.json"),
            path4.join(workingDir, ".eslintrc")
          ];
          const hasEslintConfig = eslintConfigFiles.some((f) => fs4.existsSync(f));
          if (!hasEslintConfig) {
            return { skipped: true, reason: "No ESLint configuration found" };
          }
          try {
            await spawnWithProgress2("npx", ["eslint", "--version"], 5e3);
          } catch {
            return { skipped: true, reason: "ESLint not found in devDependencies or PATH" };
          }
          const fileCount = await countTypeScriptFiles(workingDir);
          const dynamicTimeout = getAnalysisTimeout(15e3, fileCount);
          const result = await spawnWithProgress2("npx", ["eslint", "src", "--ext", ".ts", "--format", "json"], dynamicTimeout);
          if (!result.success) {
            return { skipped: true, reason: `ESLint failed: ${result.stderr || "Unknown error"}` };
          }
          let errors = 0;
          let warnings = 0;
          const errorMessages = [];
          const warningMessages = [];
          try {
            const parsed = JSON.parse(result.stdout || "");
            if (parsed.results) {
              for (const fileResult of parsed.results) {
                for (const message of fileResult.messages || []) {
                  if (message.severity === 2) {
                    errors++;
                    errorMessages.push(`${fileResult.filePath}: ${message.message} (${message.line}:${message.column})`);
                  } else if (message.severity === 1) {
                    warnings++;
                    warningMessages.push(`${fileResult.filePath}: ${message.message} (${message.line}:${message.column})`);
                  }
                }
              }
            }
          } catch {
            const fallbackStdout = result.stdout || "";
            const errorLines = fallbackStdout.split("\n").filter((l) => l.includes("error") && !l.includes("warning"));
            errors = errorLines.length;
            const warningLines = fallbackStdout.split("\n").filter((l) => l.includes("warning"));
            warnings = warningLines.length;
          }
          return {
            errors,
            warnings,
            errorMessages: errorMessages.slice(0, 20),
            // Limit to first 20
            warningMessages: warningMessages.slice(0, 20)
          };
        }
        const results = {};
        if (selectedCategories.includes("typecheck")) {
          results.typecheck = await runTypecheckAnalysis();
        }
        if (selectedCategories.includes("circular")) {
          results.circular = await runCircularAnalysis();
        }
        if (selectedCategories.includes("eslint")) {
          results.eslint = await runEslintAnalysis();
        }
        if (selectedCategories.includes("config")) {
          results.config = runConfigAnalysis2();
        }
        if (selectedCategories.includes("imports")) {
          results.imports = runImportAnalysis2();
        }
        return {
          success: true,
          data: results
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Analysis failed: ${message}` };
      }
    }
  }));
  return tools;
}
var import_sdk2, import_zod2, fs4, path4, import_child_process;
var init_fileSystemTools = __esm({
  "src/tools/fileSystemTools.ts"() {
    "use strict";
    import_sdk2 = require("@lmstudio/sdk");
    import_zod2 = require("zod");
    fs4 = __toESM(require("fs"));
    path4 = __toESM(require("path"));
    import_child_process = require("child_process");
    init_security();
    init_workingDir();
    init_performanceUtils();
  }
});

// src/tools/webResearchTools.ts
async function searchDDGApi(query) {
  const results = await (0, import_duck_duck_scrape.search)(query, { region: "wt-wt" });
  return results.results.map((r) => ({
    title: r.title,
    url: r.url,
    description: r.description || ""
  }));
}
async function searchDDGFetch(query) {
  const response = await fetchWithRetry(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error(`DuckDuckGo Fetch failed: ${response.status}`);
  const html = await response.text();
  const results = [];
  const titleRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let match;
  while ((match = titleRegex.exec(html)) !== null) {
    results.push({
      title: match[2].replace(/&amp;/g, "&").trim(),
      url: match[1],
      description: ""
    });
  }
  return results.slice(0, 10);
}
async function searchGoogle(query) {
  const response = await fetchWithRetry(
    `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`,
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }
  );
  if (!response.ok) throw new Error(`Google search failed: ${response.status}`);
  const html = await response.text();
  const results = [];
  const titleRegex = /<h3[^>]*>(.*?)<\/h3>/g;
  let match;
  while ((match = titleRegex.exec(html)) !== null) {
    results.push({
      title: match[1].replace(/<[^>]*>/g, ""),
      // Remove HTML tags
      url: "",
      description: ""
    });
  }
  return results.slice(0, 10);
}
async function searchBing(query) {
  const response = await fetchWithRetry(
    `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10`,
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }
  );
  if (!response.ok) throw new Error(`Bing search failed: ${response.status}`);
  const html = await response.text();
  const results = [];
  const resultRegex = /<li class="b_algo"[^>]*>(.*?)<\/li>/gs;
  let match;
  while ((match = resultRegex.exec(html)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/);
    if (titleMatch) {
      results.push({
        title: titleMatch[2],
        url: titleMatch[1],
        description: ""
      });
    }
  }
  return results.slice(0, 10);
}
async function searchWithFallbackChain(query, config) {
  const primaryEngine = config.searchFallbackChain || "ddg-api";
  const chain = [primaryEngine, ...FALLBACK_ORDER.filter((e) => e !== primaryEngine)];
  for (const engine of chain) {
    try {
      const searchFn = SEARCH_ENGINES[engine];
      if (!searchFn) {
        console.warn(`Search engine "${engine}" not found, skipping`);
        continue;
      }
      const results = await searchFn(query);
      if (results.length < 2) {
        console.warn(`Low search results for "${query}": ${results.length} results from ${engine}`);
      }
      return {
        success: true,
        data: { query, results, count: results.length, engine }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Search engine "${engine}" failed: ${message}`);
      continue;
    }
  }
  return {
    success: false,
    error: `All search engines failed. Tried: ${chain.join(" \u2192 ")}`
  };
}
function registerWebResearchTools(config) {
  const tools = [];
  tools.push((0, import_sdk3.tool)({
    name: "web_search",
    description: "Search the web using a configurable search engine with automatic fallback to other engines if the primary one fails.",
    parameters: {
      query: import_zod3.z.string().describe("The search query")
    },
    implementation: async ({ query }) => {
      return await searchWithFallbackChain(query, config);
    }
  }));
  tools.push((0, import_sdk3.tool)({
    name: "wikipedia_search",
    description: "Search Wikipedia for a given query and return page summaries.",
    parameters: {
      query: import_zod3.z.string().describe("The search query"),
      lang: import_zod3.z.string().optional().default("en").describe("Language code (default: en)")
    },
    implementation: async ({ query, lang }) => {
      try {
        const apiUrl = `https://${lang || "en"}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        const response = await fetchWithRetry(apiUrl);
        if (!response.ok) {
          throw new Error(`Wikipedia API error: ${response.status}`);
        }
        const data = await response.json();
        const queryData = data.query;
        const searchResults = queryData?.search || [];
        const pages = searchResults.map((item) => {
          const title = typeof item.title === "string" ? item.title : "";
          const snippet = typeof item.snippet === "string" ? item.snippet.replace(/<[^>]*>/g, "") : "";
          return {
            title,
            snippet,
            url: `https://${lang || "en"}.wikipedia.org/wiki/${encodeURIComponent(title)}`
          };
        });
        return { success: true, data: { query, language: lang || "en", results: pages, count: pages.length } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Wikipedia search failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk3.tool)({
    name: "fetch_web_content",
    description: "Fetch the clean, text-based content of a webpage URL.",
    parameters: {
      url: import_zod3.z.string().url().describe("The URL to fetch")
    },
    implementation: async ({ url }) => {
      try {
        const response = await fetchWithRetry(url);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const html = await response.text();
        const text = (0, import_html_to_text.htmlToText)(html, {
          wordwrap: false,
          selectors: [
            { selector: "a", options: { ignoreHref: true } },
            { selector: "img", format: "[image]" }
          ]
        });
        return { success: true, data: { url, content: text.substring(0, 5e3) } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to fetch content: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk3.tool)({
    name: "rag_web_content",
    description: "Fetch content from a URL, and then use RAG to find and return only the text chunks most relevant to a specific query.",
    parameters: {
      url: import_zod3.z.string().url().describe("The URL to fetch"),
      query: import_zod3.z.string().describe("The search query for relevance matching")
    },
    implementation: async ({ url, query }) => {
      try {
        const response = await fetchWithRetry(url);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const html = await response.text();
        const text = (0, import_html_to_text.htmlToText)(html);
        const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
        const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
        const relevantChunks = sentences.filter((sentence) => {
          return queryTerms.some((term) => sentence.toLowerCase().includes(term));
        }).slice(0, 5);
        return { success: true, data: { url, query, chunks: relevantChunks } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `RAG search failed: ${message}` };
      }
    }
  }));
  return tools;
}
var import_sdk3, import_zod3, import_duck_duck_scrape, import_html_to_text, SEARCH_ENGINES, FALLBACK_ORDER;
var init_webResearchTools = __esm({
  "src/tools/webResearchTools.ts"() {
    "use strict";
    import_sdk3 = require("@lmstudio/sdk");
    import_zod3 = require("zod");
    import_duck_duck_scrape = require("duck-duck-scrape");
    import_html_to_text = require("html-to-text");
    init_performanceUtils();
    SEARCH_ENGINES = {
      "ddg-api": searchDDGApi,
      "ddg-fetch": searchDDGFetch,
      "google": searchGoogle,
      "bing": searchBing
    };
    FALLBACK_ORDER = ["ddg-api", "ddg-fetch", "google", "bing"];
  }
});

// src/tools/gitGithubTools.ts
async function getSimpleGit() {
  if (!simpleGitModule) {
    simpleGitModule = await import("simple-git");
  }
  return simpleGitModule;
}
async function createGit() {
  const { default: simpleGit } = await getSimpleGit();
  return simpleGit();
}
async function getRepoName() {
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }
  try {
    const output = childProcess.execSync("git remote get-url origin 2>/dev/null", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"]
    });
    const remoteUrl = output.trim();
    if (remoteUrl) {
      const sshMatch = remoteUrl.match(/git@github\.com[:/]([^/]+\/[^/]+)\.git$/);
      if (sshMatch) return sshMatch[1];
      const httpsMatch = remoteUrl.match(/https:\/\/github\.com\/([^/]+\/[^/]+)\.git$/);
      if (httpsMatch) return httpsMatch[1];
    }
  } catch {
  }
  if (process.env.GITHUB_REPO) {
    return process.env.GITHUB_REPO;
  }
  return null;
}
async function ghApiRequest(method, endpoint, body) {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) throw new Error("GITHUB_TOKEN environment variable is not set");
  const response = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${githubToken}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : void 0
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${errorText}`);
  }
  return response.json();
}
function registerGitTools(_config) {
  const tools = [];
  tools.push((0, import_sdk4.tool)({
    name: "git_status",
    description: "Get the current git status of the repository.",
    parameters: {},
    implementation: async (_params) => {
      try {
        const git = await createGit();
        const statusResult = await git.status();
        return { success: true, data: statusResult };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git status failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "git_diff",
    description: "Get the git diff of the current repository or specific files.",
    parameters: {
      file_path: import_zod4.z.string().optional().describe("Optional: Path to specific file to diff."),
      cached: import_zod4.z.boolean().optional().default(false).describe("Optional: Show staged changes only (git diff --cached).")
    },
    implementation: async ({ file_path, cached }) => {
      try {
        const git = await createGit();
        let diff = "";
        if (file_path) {
          diff = await git.diff([file_path]);
        } else {
          diff = cached ? await git.diff(["--cached"]) : await git.diff();
        }
        return { success: true, data: { diff } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git diff failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "git_commit",
    description: "Commit staged changes to the git repository.",
    parameters: {
      message: import_zod4.z.string().describe("The commit message")
    },
    implementation: async ({ message }) => {
      try {
        const git = await createGit();
        await git.commit(message);
        return { success: true, data: { committed: true } };
      } catch (error) {
        const message2 = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git commit failed: ${message2}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "git_log",
    description: "Get recent git commit history.",
    parameters: {
      max_count: import_zod4.z.number().int().min(1).optional().default(10).describe("Max number of commits to return (default: 10)")
    },
    implementation: async ({ max_count }) => {
      try {
        const git = await createGit();
        const count = max_count || 10;
        const log = await git.log(count);
        return { success: true, data: { commits: log.all } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git log failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "git_add",
    description: "Stage specific files or all changes for the next commit.",
    parameters: {
      paths: import_zod4.z.array(import_zod4.z.string()).optional().describe("Optional: Specific file paths to stage. If omitted, stages all changes.")
    },
    implementation: async ({ paths }) => {
      try {
        const git = await createGit();
        if (paths && paths.length > 0) {
          await git.add(paths);
        } else {
          await git.add(".");
        }
        return { success: true, data: { stagedPaths: paths || "all" } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git add failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "git_checkout",
    description: "Switch to an existing branch or create and switch to a new one.",
    parameters: {
      branch_name: import_zod4.z.string().describe("Name of the branch to checkout."),
      create_new: import_zod4.z.boolean().optional().default(false).describe("If true, creates the branch if it doesn't exist (like git checkout -b).")
    },
    implementation: async ({ branch_name, create_new }) => {
      try {
        const git = await createGit();
        if (create_new) {
          await git.checkoutLocalBranch(branch_name);
        } else {
          await git.checkout(branch_name);
        }
        return { success: true, data: { branchName: branch_name } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git checkout failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "gh_auth",
    description: "Check GitHub authentication status. If not authenticated, opens a terminal window for the user to sign in.",
    parameters: {},
    implementation: async () => {
      try {
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
          return { success: false, error: "GITHUB_TOKEN environment variable is not set. Please set it to use GitHub API tools." };
        }
        await ghApiRequest("GET", "/user");
        return { success: true, data: { authenticated: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub auth failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "gh_create_issue",
    description: "Create a new GitHub issue in the current repository.",
    parameters: {
      title: import_zod4.z.string().describe("The issue title"),
      body: import_zod4.z.string().optional().describe("The issue body/description"),
      labels: import_zod4.z.array(import_zod4.z.string()).optional().describe("Labels to apply")
    },
    implementation: async ({ title, body, labels }) => {
      try {
        const repoName = await getRepoName();
        if (!repoName) throw new Error('Could not determine repository name. Ensure GITHUB_REPOSITORY env is set or git remote "origin" points to a GitHub repo.');
        await ghApiRequest("POST", `/repos/${repoName}/issues`, { title, body, labels });
        return { success: true, data: { created: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub issue creation failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "gh_list_issues",
    description: "List issues in the current repository.",
    parameters: {
      state: import_zod4.z.enum(["open", "closed"]).optional().default("open").describe("Filter by issue state"),
      labels: import_zod4.z.array(import_zod4.z.string()).optional().describe("Filter by labels"),
      limit: import_zod4.z.number().int().min(1).max(50).optional().default(10).describe("Max issues to return (default: 10)")
    },
    implementation: async ({ state, labels, limit }) => {
      try {
        const repoName = await getRepoName();
        if (!repoName) throw new Error("Could not determine repository name.");
        let query = `state=${state}`;
        if (labels && labels.length > 0) {
          query += `&labels=${labels.join(",")}`;
        }
        const issues = await ghApiRequest("GET", `/repos/${repoName}/issues?${query}&per_page=${limit || 10}`);
        return { success: true, data: { issues } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub issues listing failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "gh_view_comments",
    description: "View comments on a specific issue or pull request.",
    parameters: {
      number: import_zod4.z.number().int().min(1).describe("The issue or PR number"),
      type: import_zod4.z.enum(["issue", "pr"]).optional().default("issue").describe("Whether it's an issue or a pull request")
    },
    implementation: async ({ number, type }) => {
      try {
        const repoName = await getRepoName();
        if (!repoName) throw new Error("Could not determine repository name.");
        const comments = await ghApiRequest("GET", `/repos/${repoName}/${type === "pr" ? "pulls" : "issues"}/${number}/comments`);
        return { success: true, data: { comments } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub comments viewing failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "gh_create_pr",
    description: "Create a new pull request in the current repository.",
    parameters: {
      title: import_zod4.z.string().describe("The PR title"),
      body: import_zod4.z.string().optional().describe("The PR body/description"),
      head_branch: import_zod4.z.string().describe("The branch containing your changes"),
      base_branch: import_zod4.z.string().optional().default("main").describe("The branch you want to merge into (e.g., main, master)")
    },
    implementation: async ({ title, body, head_branch, base_branch }) => {
      try {
        const repoName = await getRepoName();
        if (!repoName) throw new Error("Could not determine repository name.");
        const pr = await ghApiRequest("POST", `/repos/${repoName}/pulls`, { title, body, head: head_branch, base: base_branch });
        return { success: true, data: { created: true, url: pr.html_url } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PR creation failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "gh_list_prs",
    description: "List pull requests in the current repository.",
    parameters: {
      state: import_zod4.z.enum(["open", "closed"]).optional().default("open").describe("Filter by PR state"),
      limit: import_zod4.z.number().int().min(1).max(50).optional().default(10).describe("Max PRs to return (default: 10)")
    },
    implementation: async ({ state, limit }) => {
      try {
        const repoName = await getRepoName();
        if (!repoName) throw new Error("Could not determine repository name.");
        const prs = await ghApiRequest("GET", `/repos/${repoName}/pulls?state=${state}&per_page=${limit || 10}`);
        return { success: true, data: { prs } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PRs listing failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "gh_view_pr_diff",
    description: "Fetch the diff/patch of a specific pull request.",
    parameters: {
      number: import_zod4.z.number().int().min(1).describe("The PR number")
    },
    implementation: async ({ number }) => {
      try {
        const repoName = await getRepoName();
        if (!repoName) throw new Error("Could not determine repository name.");
        const response = await fetch(`https://api.github.com/repos/${repoName}/pulls/${number}/diff`, {
          headers: { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` }
        });
        if (!response.ok) throw new Error(`Failed to fetch diff: ${response.status}`);
        const diff = await response.text();
        return { success: true, data: { diff } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PR diff fetching failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk4.tool)({
    name: "gh_push",
    description: "Push local commits to the remote GitHub repository.",
    parameters: {
      branch: import_zod4.z.string().optional().describe("Optional: The branch to push. Defaults to current branch.")
    },
    implementation: async ({ branch }) => {
      try {
        const git = await createGit();
        await git.push(branch || "origin", "HEAD");
        return { success: true, data: { pushed: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub push failed: ${message}` };
      }
    }
  }));
  return tools;
}
var import_sdk4, import_zod4, childProcess, simpleGitModule;
var init_gitGithubTools = __esm({
  "src/tools/gitGithubTools.ts"() {
    "use strict";
    import_sdk4 = require("@lmstudio/sdk");
    import_zod4 = require("zod");
    childProcess = __toESM(require("child_process"));
    simpleGitModule = null;
  }
});

// src/tools/browserAutomationTools.ts
async function getPuppeteer() {
  if (!puppeteerModule) {
    const imported = await import("puppeteer");
    puppeteerModule = imported.default || imported;
  }
  return puppeteerModule;
}
function cleanupBrowserSession() {
  return browserManager.dispose();
}
function registerBrowserTools(_config) {
  const tools = [];
  tools.push((0, import_sdk5.tool)({
    name: "browser_open_page",
    description: "Open a webpage in a headless browser (Puppeteer), render it once, and return content.",
    parameters: {
      url: import_zod5.z.string().url().describe("The URL to open"),
      screenshot_path: import_zod5.z.string().optional().describe("Path to save a screenshot."),
      wait_for_selector: import_zod5.z.string().optional().describe("CSS selector to wait for before returning."),
      full_page_screenshot: import_zod5.z.boolean().optional().default(false).describe("If true, captures the full page when taking a screenshot.")
    },
    implementation: async ({ url, screenshot_path, wait_for_selector, full_page_screenshot }) => {
      let browser = null;
      let page = null;
      try {
        browser = await browserManager.getBrowser();
        page = browserManager.getCurrentPage();
        if (!page || await page.url() !== url) {
          page = await browser.newPage();
          browserManager.setCurrentPage(page);
        }
        await page.goto(url, { waitUntil: "domcontentloaded" });
        if (wait_for_selector) {
          try {
            await page.waitForSelector(wait_for_selector, { timeout: 5e3 });
          } catch {
          }
        }
        const resultData = { url, opened: true };
        if (screenshot_path) {
          await page.screenshot({ path: screenshot_path, fullPage: full_page_screenshot });
          resultData.screenshotSaved = true;
        }
        const textContent = await page.evaluate(`return document.body ? document.body.innerText : '';`);
        resultData.pageText = textContent.substring(0, 2e3);
        return { success: true, data: resultData };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to open page: ${message}` };
      } finally {
      }
    }
  }));
  tools.push((0, import_sdk5.tool)({
    name: "browser_session_control",
    description: "Control the active persistent browser session. Supports actions, page reading, screenshot capture.",
    parameters: {
      actions: import_zod5.z.array(import_zod5.z.any()).optional().describe("Optional scripted browser actions to execute."),
      read_page: import_zod5.z.boolean().optional().default(false).describe("If true, returns page metadata."),
      full_read: import_zod5.z.boolean().optional().default(false).describe("If true, forces full page text output."),
      screenshot_path: import_zod5.z.string().optional().describe("Optional screenshot output path.")
    },
    implementation: async ({ actions, read_page, full_read, screenshot_path }) => {
      let page = null;
      try {
        page = await browserManager.getPage();
        if (actions && Array.isArray(actions)) {
          for (const action of actions) {
            if (action.type === "click") {
              await page.click(action.selector);
            } else if (action.type === "type") {
              await page.type(action.selector, action.text);
            } else if (action.type === "goto") {
              await page.goto(action.url);
            } else if (action.type === "evaluate") {
              await page.evaluate(action.script);
            }
          }
        }
        const resultData = { actionsExecuted: actions?.length || 0 };
        if (read_page || full_read) {
          const text = await page.evaluate(`return document.body ? document.body.innerText : '';`);
          resultData.pageText = full_read ? text : text.substring(0, 1e3);
        }
        if (screenshot_path) {
          await page.screenshot({ path: screenshot_path });
          resultData.screenshotSaved = true;
        }
        return { success: true, data: resultData };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Browser control failed: ${message}` };
      } finally {
      }
    }
  }));
  tools.push((0, import_sdk5.tool)({
    name: "browser_session_close",
    description: "Close the active persistent browser session.",
    parameters: {},
    implementation: async () => {
      try {
        await browserManager.dispose();
        return { success: true, data: { closed: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to close browser session: ${message}` };
      } finally {
        await browserManager.dispose();
      }
    }
  }));
  tools.push((0, import_sdk5.tool)({
    name: "preview_html",
    description: "Render and preview HTML content in the system's default browser.",
    parameters: {
      html_content: import_zod5.z.string().describe("The HTML content to render"),
      file_name: import_zod5.z.string().optional().default("preview.html").describe("Optional filename (default: preview.html)")
    },
    implementation: async ({ html_content, file_name }) => {
      try {
        const fileName = file_name || "preview.html";
        const filePath = path5.join(getWorkingDir(), fileName);
        fs5.writeFileSync(filePath, html_content);
        const openModule = await import("open");
        await openModule.default(filePath);
        return { success: true, data: { previewed: true, file: fileName } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to preview HTML: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk5.tool)({
    name: "open_file",
    description: "Open a file or URL in the system's default application.",
    parameters: {
      target: import_zod5.z.string().describe("File path or URL")
    },
    implementation: async ({ target }) => {
      try {
        const openModule = await import("open");
        await openModule.default(target);
        return { success: true, data: { opened: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to open file: ${message}` };
      }
    }
  }));
  return tools;
}
var import_sdk5, import_zod5, fs5, path5, puppeteerModule, BrowserSessionManager, browserManager;
var init_browserAutomationTools = __esm({
  "src/tools/browserAutomationTools.ts"() {
    "use strict";
    import_sdk5 = require("@lmstudio/sdk");
    import_zod5 = require("zod");
    init_workingDir();
    fs5 = __toESM(require("fs"));
    path5 = __toESM(require("path"));
    puppeteerModule = null;
    BrowserSessionManager = class {
      constructor() {
        this.browserInstance = null;
        this.currentPage = null;
        this.cleanupTimer = null;
        this.lastActivity = Date.now();
        this.INACTIVITY_TIMEOUT_MS = 5 * 60 * 1e3;
        // 5 minutes
        this.MAX_RETRIES = 2;
        this.retryCount = 0;
      }
      /** Get or create a persistent Puppeteer browser instance with auto-retry */
      async getBrowser() {
        if (!this.browserInstance || !this.browserInstance.connected()) {
          this.retryCount = 0;
          while (this.retryCount < this.MAX_RETRIES) {
            try {
              const puppeteerLib = await getPuppeteer();
              this.browserInstance = await puppeteerLib.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
                // Performance optimizations
              });
              break;
            } catch (error) {
              this.retryCount++;
              if (this.retryCount >= this.MAX_RETRIES) throw error;
              await new Promise((resolve2) => setTimeout(resolve2, 1e3 * this.retryCount));
            }
          }
        }
        this.resetCleanupTimer();
        return this.browserInstance;
      }
      /** Get or create a page in the persistent browser instance */
      async getPage() {
        if (!this.currentPage || !await this.isPageValid()) {
          const browser = await this.getBrowser();
          this.currentPage = await browser.newPage();
        }
        this.resetCleanupTimer();
        return this.currentPage;
      }
      /** Check if current page is still valid */
      async isPageValid() {
        try {
          if (!this.currentPage) return false;
          await this.currentPage.evaluate("1");
          return true;
        } catch {
          return false;
        }
      }
      /** Reset the inactivity cleanup timer */
      resetCleanupTimer() {
        if (this.cleanupTimer) clearTimeout(this.cleanupTimer);
        this.lastActivity = Date.now();
        this.cleanupTimer = setTimeout(() => this.dispose(), this.INACTIVITY_TIMEOUT_MS);
      }
      /** Explicitly dispose browser and cancel cleanup timer */
      async dispose() {
        if (this.cleanupTimer) clearTimeout(this.cleanupTimer);
        try {
          if (this.browserInstance && this.browserInstance.connected()) {
            await this.browserInstance.close();
          }
        } catch {
        } finally {
          this.browserInstance = null;
          this.currentPage = null;
          this.lastActivity = Date.now();
          this.retryCount = 0;
        }
      }
      /** Check if browser is connected */
      isConnected() {
        return !!(this.browserInstance && this.browserInstance.connected());
      }
      /** Get the current page (public accessor) */
      getCurrentPage() {
        return this.currentPage;
      }
      /** Set the current page (public setter) */
      setCurrentPage(page) {
        this.currentPage = page;
      }
    };
    browserManager = new BrowserSessionManager();
  }
});

// src/tools/databaseTools.ts
async function getSqlite() {
  if (sqliteModule) return sqliteModule;
  if (sqliteLoadError) throw new Error(sqliteLoadError);
  try {
    sqliteModule = await import("node:sqlite");
    return sqliteModule;
  } catch (err) {
    sqliteLoadError = err instanceof Error ? err.message : String(err);
    throw new Error(
      `SQLite is not available (node:sqlite requires Node.js 23+). Original error: ${sqliteLoadError}. Please disable database queries in plugin settings or upgrade Node.`
    );
  }
}
function registerDatabaseTools(_config) {
  const tools = [];
  tools.push((0, import_sdk6.tool)({
    name: "query_database",
    description: "Run read-only SQLite queries. Defaults to in-memory database; optionally specify a file path.",
    parameters: {
      query: import_zod6.z.string().describe("SQL query string (read-only only)"),
      db_path: import_zod6.z.string().optional().default(":memory:").describe("Path to the SQLite database file (default: :memory:)")
    },
    implementation: async ({ query, db_path }) => {
      try {
        const validated = validateSQLQuery(query);
        if (!validated.valid) {
          return { success: false, error: `Unsafe SQL query detected: ${validated.reason}` };
        }
        const { open } = await getSqlite();
        const db = open(db_path || ":memory:");
        try {
          const stmt = db.prepare(query);
          const results = stmt.all();
          return { success: true, data: { query, results } };
        } finally {
          db.close();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Database query failed: ${message}` };
      }
    }
  }));
  return tools;
}
var import_sdk6, import_zod6, sqliteModule, sqliteLoadError;
var init_databaseTools = __esm({
  "src/tools/databaseTools.ts"() {
    "use strict";
    import_sdk6 = require("@lmstudio/sdk");
    import_zod6 = require("zod");
    init_security();
    sqliteModule = null;
    sqliteLoadError = null;
  }
});

// src/tools/backgroundCommandTools.ts
function handleError2(error) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}
function registerBackgroundCommandTools(config, backgroundCommandManager) {
  const tools = [];
  tools.push((0, import_sdk7.tool)({
    name: "run_background_command",
    description: "Start a long-running process in the background. The process is not blocked.",
    parameters: {
      command: import_zod7.z.string().describe("The shell command to execute"),
      timeout_hours: import_zod7.z.number().min(0.1).max(10).describe("MANDATORY: How long the process is allowed to run before being killed."),
      name: import_zod7.z.string().describe("MANDATORY: A short, descriptive name for the background task")
    },
    // SDK requires async implementation
    implementation: async ({ command, timeout_hours, name }) => {
      try {
        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
        }
        const id = backgroundCommandManager.register(command, timeout_hours, name);
        return { success: true, data: { id, name, command, timeoutHours: timeout_hours } };
      } catch (error) {
        return handleError2(error);
      }
    }
  }));
  tools.push((0, import_sdk7.tool)({
    name: "check_background_command",
    description: "Check the status, stdout, and stderr of a running or completed background command.",
    parameters: {
      id: import_zod7.z.string().describe("The command identifier")
    },
    // SDK requires async implementation
    implementation: async ({ id }) => {
      try {
        const command = backgroundCommandManager.check(id);
        if (!command) {
          return { success: false, error: `Command not found: ${id}` };
        }
        return { success: true, data: command };
      } catch (error) {
        return handleError2(error);
      }
    }
  }));
  tools.push((0, import_sdk7.tool)({
    name: "cancel_background_command",
    description: "Kill a running background command.",
    parameters: {
      id: import_zod7.z.string().describe("The command identifier")
    },
    // SDK requires async implementation
    implementation: async ({ id }) => {
      try {
        const cancelled = backgroundCommandManager.cancel(id);
        if (!cancelled) {
          return { success: false, error: `Cannot cancel command: ${id} (not found or not running)` };
        }
        return { success: true, data: { id, cancelled: true } };
      } catch (error) {
        return handleError2(error);
      }
    }
  }));
  return tools;
}
var import_sdk7, import_zod7;
var init_backgroundCommandTools = __esm({
  "src/tools/backgroundCommandTools.ts"() {
    "use strict";
    import_sdk7 = require("@lmstudio/sdk");
    import_zod7 = require("zod");
    init_security();
  }
});

// src/tools/executionTools.ts
async function safeSpawn(exe, args, timeoutMs, input, useShell = false) {
  return new Promise((resolve2) => {
    const proc = (0, import_child_process2.spawn)(exe, args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: timeoutMs,
      cwd: getWorkingDir(),
      // Execute in the current working directory
      shell: useShell
      // Enable shell interpretation when requested
    });
    let stdout = "";
    let stderr = "";
    if (input) {
      proc.stdin?.write(input);
      proc.stdin?.end();
    }
    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });
    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    const timerId = setTimeout(() => {
      proc.kill();
      resolve2({ success: false, error: "Execution timed out" });
    }, timeoutMs);
    proc.on("close", () => {
      clearTimeout(timerId);
      resolve2({ success: true, data: { stdout: stdout.trim(), stderr: stderr.trim() } });
    });
    proc.on("error", (err) => {
      clearTimeout(timerId);
      resolve2({ success: false, error: `Spawn failed: ${err.message}` });
    });
  });
}
function handleError3(error) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}
function registerExecutionTools(_config) {
  const tools = [];
  tools.push((0, import_sdk8.tool)({
    name: "run_javascript",
    description: "Run JavaScript code snippet using Node.js (sandboxed). No external module imports allowed. Standard library only.",
    parameters: {
      javascript: import_zod8.z.string().describe("The JavaScript code to execute"),
      timeout_seconds: import_zod8.z.number().min(0.1).max(60).optional().default(5).describe("Timeout in seconds (max 60)")
    },
    implementation: async ({ javascript, timeout_seconds }) => {
      try {
        const dangerousPatterns = [
          /\brequire\s*\(/i,
          /\bimport\s+/i,
          /\bfs\./i,
          /\bchild_process\b/i,
          /\beval\s*\(/i,
          /\bexec\s*\(/i,
          /globalThis\.require/i,
          /process\.exit/i,
          /__proto__/i,
          // S5 FIX: Bypass prevention patterns
          /Function\s*\(/i,
          // Function constructor
          /String\.fromCharCode\s*\(/i,
          //.fromCharCode bypass
          /\bimport\s*\(.*\)/i,
          // Dynamic import
          /\.constructor/i,
          // Constructor access
          /require\.resolve/i
          // require.resolve bypass
        ];
        for (const pattern of dangerousPatterns) {
          if (pattern.test(javascript)) {
            return { success: false, error: `Dangerous code detected: ${pattern.source}` };
          }
        }
        const timeoutMs = (timeout_seconds || 5) * 1e3;
        const result = await safeSpawn("node", ["-e", javascript], timeoutMs);
        if (!result.success) {
          return { success: false, error: result.error };
        }
        if (result.data?.stderr && !result.data.stdout) {
          return { success: false, error: result.data.stderr };
        }
        return { success: true, data: { output: result.data?.stdout || "" } };
      } catch (error) {
        return handleError3(error);
      }
    }
  }));
  tools.push((0, import_sdk8.tool)({
    name: "run_python",
    description: "Run Python code snippet (sandboxed, no external modules). Standard library only.",
    parameters: {
      python: import_zod8.z.string().describe("The Python code to execute"),
      timeout_seconds: import_zod8.z.number().min(0.1).max(60).optional().default(5).describe("Timeout in seconds (max 60)")
    },
    implementation: async ({ python, timeout_seconds }) => {
      try {
        const dangerousPatterns = [
          /\bimport\s+os\b/i,
          /\bfrom\s+os\s+import\b/i,
          /\bimport\s+subprocess\b/i,
          /\bfrom\s+subprocess\s+import\b/i,
          /\bimport\s+shutil\b/i,
          /\b__import__\s*\(/i,
          /\beval\s*\(/i,
          /\bexec\s*\(/i,
          /os\.system/i,
          /os\.popen/i
        ];
        for (const pattern of dangerousPatterns) {
          if (pattern.test(python)) {
            return { success: false, error: `Dangerous Python import detected: ${pattern.source}` };
          }
        }
        const timeoutMs = (timeout_seconds || 5) * 1e3;
        let result = await safeSpawn("python3", ["-c", python], timeoutMs);
        if (!result.success && result.error?.includes("not found")) {
          result = await safeSpawn("python", ["-c", python], timeoutMs);
        }
        if (!result.success) {
          return { success: false, error: result.error };
        }
        if (result.data?.stderr && !result.data.stdout) {
          return { success: false, error: result.data.stderr };
        }
        return { success: true, data: { output: result.data?.stdout || "" } };
      } catch (error) {
        return handleError3(error);
      }
    }
  }));
  tools.push((0, import_sdk8.tool)({
    name: "execute_command",
    description: "Execute a command in the current working directory. Supports full shell features (pipes, redirects, env vars).",
    parameters: {
      command: import_zod8.z.string().describe("The shell command to execute"),
      timeout_seconds: import_zod8.z.number().min(1).max(300).optional().default(60).describe("Timeout in seconds (max 300)"),
      input: import_zod8.z.string().optional().describe("Input text to pipe to the command's stdin.")
    },
    implementation: async ({ command, timeout_seconds, input }) => {
      try {
        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
        }
        const timeoutMs = (timeout_seconds || 60) * 1e3;
        const result = await safeSpawn(command, [], timeoutMs, input, true);
        if (!result.success) {
          return { success: false, error: result.error };
        }
        const fullOutput = [result.data?.stdout, result.data?.stderr].filter(Boolean).join("\n");
        return {
          success: true,
          data: {
            stdout: result.data?.stdout || "",
            stderr: result.data?.stderr || "",
            output: fullOutput || "(No output)"
          }
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Execution failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk8.tool)({
    name: "run_in_terminal",
    description: "Launch a command in a new, separate interactive terminal window.",
    parameters: {
      command: import_zod8.z.string().describe("The shell command to execute")
    },
    implementation: async ({ command }) => {
      try {
        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
        }
        const isWindows = process.platform === "win32";
        if (isWindows) {
          (0, import_child_process2.spawn)("cmd.exe", ["/c", "start", "Command Prompt", "/k", command], {
            detached: true,
            stdio: "ignore"
          });
        } else {
          const terminals = ["xterm", "gnome-terminal", "konsole", "xfce4-terminal"];
          let launched = false;
          for (const term of terminals) {
            try {
              (0, import_child_process2.spawn)(term, ["-e", command], { detached: true, stdio: "ignore" });
              launched = true;
              break;
            } catch {
              continue;
            }
          }
          if (!launched) {
            return { success: false, error: "No suitable terminal emulator found. Install xterm or gnome-terminal." };
          }
        }
        return { success: true, data: { launched: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to open terminal: ${message}` };
      }
    }
  }));
  return tools;
}
var import_sdk8, import_zod8, import_child_process2;
var init_executionTools = __esm({
  "src/tools/executionTools.ts"() {
    "use strict";
    import_sdk8 = require("@lmstudio/sdk");
    import_zod8 = require("zod");
    import_child_process2 = require("child_process");
    init_security();
    init_workingDir();
  }
});

// src/tools/utilityTools.ts
function handleError4(error) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}
function escapeForPowerShell(content) {
  return content.replace(/"/g, '\\"').replace(/\$/g, "\\$");
}
function escapeForBash(content) {
  return content.replace(/'/g, "'\\''");
}
async function readClipboard() {
  const platform4 = os2.platform();
  return new Promise((resolve2, reject) => {
    let cmd;
    let args;
    switch (platform4) {
      case "win32":
        cmd = "powershell.exe";
        args = ["-NoProfile", "-Command", "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-Clipboard -Raw"];
        break;
      case "darwin":
        cmd = "/bin/bash";
        args = ["-c", "pbpaste"];
        break;
      default:
        cmd = "/bin/bash";
        args = ["-c", "(xclip -selection clipboard -o 2>/dev/null || xsel --clipboard --output 2>/dev/null) | tr -d '\\0'"];
        break;
    }
    const proc = (0, import_child_process3.spawn)(cmd, args);
    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });
    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    proc.on("close", (code) => {
      if (code === 0 && stdout.trim()) {
        resolve2(stdout.trim());
      } else {
        reject(new Error(`Clipboard read failed (exit code ${code}): ${stderr || "No clipboard content"}`));
      }
    });
    proc.on("error", reject);
    setTimeout(() => {
      proc.kill();
      reject(new Error("Clipboard read timed out"));
    }, 5e3);
  });
}
async function writeClipboard(content) {
  const platform4 = os2.platform();
  return new Promise((resolve2, reject) => {
    let cmd;
    let args;
    switch (platform4) {
      case "win32":
        const escapedContent = escapeForPowerShell(content);
        cmd = "powershell.exe";
        args = ["-NoProfile", "-Command", `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; "${escapedContent}" | Set-Clipboard`];
        break;
      case "darwin":
        const escapedBash = escapeForBash(content);
        cmd = "/bin/bash";
        args = ["-c", `echo -n '${escapedBash}' | pbcopy`];
        break;
      default:
        const escapedLinux = escapeForBash(content);
        cmd = "/bin/bash";
        args = ["-c", `echo -n '${escapedLinux}' | (xclip -selection clipboard 2>/dev/null || xsel --clipboard --input 2>/dev/null)`];
        break;
    }
    const proc = (0, import_child_process3.spawn)(cmd, args);
    let stderr = "";
    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve2();
      } else {
        reject(new Error(`Clipboard write failed (exit code ${code}): ${stderr}`));
      }
    });
    proc.on("error", reject);
    setTimeout(() => {
      proc.kill();
      reject(new Error("Clipboard write timed out"));
    }, 5e3);
  });
}
function findLMStudioHome() {
  const platform4 = os2.platform();
  const candidates = [];
  switch (platform4) {
    case "win32":
      candidates.push(
        path6.join(process.env.APPDATA || "", "lm-studio"),
        path6.join(process.env.LOCALAPPDATA || "", "Programs", "lm-studio"),
        path6.join(process.env.PROGRAMFILES || "", "LM Studio"),
        path6.join(process.env["PROGRAMDATA"] || "", "LM Studio")
      );
      break;
    case "darwin":
      candidates.push(
        path6.join(os2.homedir(), "Library", "Application Support", "lm-studio"),
        "/Applications/LM Studio.app/Contents/Resources/app.asar"
      );
      break;
    default:
      candidates.push(
        path6.join(os2.homedir(), ".local", "share", "lm-studio"),
        "/opt/lm-studio",
        path6.join(process.env.HOME || "", ".lm-studio")
      );
      break;
  }
  for (const candidate of candidates) {
    try {
      if (fs6.existsSync(candidate)) {
        return candidate;
      }
    } catch {
    }
  }
  return null;
}
function registerUtilityTools(config, stateManager, getEnabledTools) {
  const tools = [];
  tools.push((0, import_sdk9.tool)({
    name: "save_memory",
    description: "Save a specific piece of information or fact to long-term memory.",
    parameters: {
      fact: import_zod9.z.string().min(1).describe("The specific fact or piece of information to remember.")
    },
    implementation: async ({ fact }) => {
      try {
        stateManager.set(`memory_${Date.now()}`, fact);
        return { success: true, data: { saved: true } };
      } catch (error) {
        return handleError4(error);
      }
    }
  }));
  tools.push((0, import_sdk9.tool)({
    name: "get_system_info",
    description: "Get information about the system (OS, CPU, Memory).",
    parameters: {},
    implementation: async () => {
      try {
        return {
          success: true,
          data: {
            platform: os2.platform(),
            arch: os2.arch(),
            cpus: os2.cpus().length,
            totalMemory: os2.totalmem(),
            freeMemory: os2.freemem(),
            hostname: os2.hostname(),
            release: os2.release()
          }
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get system info: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk9.tool)({
    name: "read_clipboard",
    description: "Read text content from the system clipboard.",
    parameters: {},
    implementation: async (_params) => {
      try {
        const content = await readClipboard();
        return { success: true, data: { content } };
      } catch (error) {
        return handleError4(error);
      }
    }
  }));
  tools.push((0, import_sdk9.tool)({
    name: "write_clipboard",
    description: "Write text content to the system clipboard.",
    parameters: {
      content: import_zod9.z.string().describe("The text content to write to clipboard")
    },
    implementation: async ({ content }) => {
      try {
        await writeClipboard(content);
        return { success: true, data: { written: true } };
      } catch (error) {
        return handleError4(error);
      }
    }
  }));
  tools.push((0, import_sdk9.tool)({
    name: "send_notification",
    description: "Send a system notification to the user.",
    parameters: {
      title: import_zod9.z.string().describe("Notification title"),
      message: import_zod9.z.string().describe("Notification message"),
      icon: import_zod9.z.string().optional().describe("Optional custom icon path")
    },
    implementation: async ({ title, message, icon }) => {
      try {
        const notifierModule = await import("node-notifier");
        const notifier = notifierModule.default || notifierModule;
        const options = {
          title: title || "AI Toolbox",
          msg: message || "",
          sound: true
          // Include sound on macOS
        };
        if (icon) {
          options.icon = icon;
        }
        notifier(options);
        return { success: true, data: { sent: true, title, message } };
      } catch (error) {
        const message2 = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to send notification: ${message2}` };
      }
    }
  }));
  tools.push((0, import_sdk9.tool)({
    name: "findLMStudioHome",
    description: "Locate LM Studio installation directory across platforms.",
    parameters: {},
    implementation: async () => {
      try {
        const homeDir = findLMStudioHome();
        if (homeDir) {
          return {
            success: true,
            data: {
              found: true,
              path: homeDir,
              platform: os2.platform()
            }
          };
        } else {
          const commonPaths = [
            "Windows: %APPDATA%\\lm-studio",
            "macOS: ~/Library/Application Support/lm-studio",
            "Linux: ~/.local/share/lm-studio"
          ].join("\n");
          return {
            success: false,
            error: `LM Studio home directory not found.

Common paths:
${commonPaths}`
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to find LM Studio home: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk9.tool)({
    name: "get_enabled_tools",
    description: "Get list of currently enabled tools based on configuration.",
    parameters: {},
    implementation: async () => {
      try {
        if (getEnabledTools) {
          const toolNames = getEnabledTools();
          return { success: true, data: { toolCount: toolNames.length, tools: toolNames } };
        } else {
          return { success: false, error: "Registry access not available" };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get enabled tools: ${message}` };
      }
    }
  }));
  return tools;
}
function registerGetCurrentWorkingDirectoryTool() {
  return [
    (0, import_sdk9.tool)({
      name: "get_current_working_directory",
      description: "Get the current working directory. Use this before generating file operations with relative paths to ensure you know where files will be created/modified.",
      parameters: {},
      implementation: async () => {
        const { getWorkingDir: getWorkingDir2 } = (init_workingDir(), __toCommonJS(workingDir_exports));
        return {
          success: true,
          data: {
            current_working_directory: getWorkingDir2()
          }
        };
      }
    })
  ];
}
var import_sdk9, import_zod9, os2, path6, fs6, import_child_process3;
var init_utilityTools = __esm({
  "src/tools/utilityTools.ts"() {
    "use strict";
    import_sdk9 = require("@lmstudio/sdk");
    import_zod9 = require("zod");
    os2 = __toESM(require("os"));
    path6 = __toESM(require("path"));
    fs6 = __toESM(require("fs"));
    import_child_process3 = require("child_process");
  }
});

// src/tools/imageProcessingTools.ts
function handleError5(error) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}
function validateImageFile(imagePath, maxSizeBytes = 50 * 1024 * 1024) {
  if (!fs7.existsSync(imagePath)) {
    return { valid: false, error: `Image file not found: ${imagePath}` };
  }
  const stat2 = fs7.statSync(imagePath);
  if (!stat2.isFile()) {
    return { valid: false, error: `Path is not a file: ${imagePath}` };
  }
  if (stat2.size > maxSizeBytes) {
    return { valid: false, error: `Image exceeds maximum size of ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB` };
  }
  const ext = path7.extname(imagePath).toLowerCase();
  const validExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff", ".webp"];
  if (!validExtensions.includes(ext)) {
    return { valid: false, error: `Unsupported image format: ${ext}. Supported: ${validExtensions.join(", ")}` };
  }
  return { valid: true };
}
function getImageDimensions(imagePath) {
  try {
    const buffer = fs7.readFileSync(imagePath);
    if (buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
    if (buffer[0] === 255 && buffer[1] === 216) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] === 255 && (buffer[offset + 1] & 248) === 192) {
          offset += 4;
          const height = buffer.readUInt16BE(offset);
          const width = buffer.readUInt16BE(offset + 2);
          return { width, height };
        }
        if (buffer[offset] === 255) {
          offset += 2 + (buffer[offset + 2] << 8) + buffer[offset + 3];
        } else {
          offset++;
        }
      }
    }
    if (buffer[0] === 71 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 56) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height };
    }
    if (buffer[0] === 66 && buffer[1] === 77) {
      const width = buffer.readInt32LE(18);
      const height = buffer.readInt32LE(22);
      return { width: Math.abs(width), height: Math.abs(height) };
    }
    return null;
  } catch {
    return null;
  }
}
async function imageToText({ imagePath, language = "eng" }) {
  try {
    const validation = validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };
    const stat2 = fs7.statSync(imagePath);
    const dimensions = getImageDimensions(imagePath);
    const ext = path7.extname(imagePath).toLowerCase();
    const Tesseract = require("tesseract.js");
    console.log(`[AI Toolbox] Starting OCR on ${imagePath} with language '${language}'...`);
    const result = await Tesseract.recognize(imagePath, language, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`[AI Toolbox] OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      }
    });
    const extractedText = result.data.text.trim();
    const wordCount = extractedText.split(/\s+/).filter((w) => w.length > 0).length;
    const lineCount = extractedText.split("\n").filter((l) => l.trim().length > 0).length;
    return {
      success: true,
      data: {
        text: extractedText,
        confidence: result.data.confidence.toFixed(2),
        language: result.data.language,
        version: result.data._version,
        metadata: {
          path: imagePath,
          size: `${(stat2.size / 1024).toFixed(1)} KB`,
          format: ext.replace(".", "").toUpperCase(),
          dimensions: dimensions || { width: "Unknown", height: "Unknown" },
          wordCount,
          lineCount
        },
        words: result.data.words?.slice(0, 100) || []
        // Limit to first 100 words for brevity
      }
    };
  } catch (error) {
    return handleError5(error);
  }
}
async function describeImage({ imagePath }) {
  try {
    const validation = validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };
    const stat2 = fs7.statSync(imagePath);
    const dimensions = getImageDimensions(imagePath);
    const ext = path7.extname(imagePath).toLowerCase();
    const mimeTypeMap = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".bmp": "image/bmp",
      ".webp": "image/webp",
      ".tiff": "image/tiff"
    };
    return {
      success: true,
      data: {
        path: imagePath,
        size: stat2.size,
        sizeHuman: `${(stat2.size / 1024).toFixed(1)} KB`,
        format: ext.replace(".", "").toUpperCase(),
        mimeType: mimeTypeMap[ext] || "image/unknown",
        dimensions: dimensions || { width: "Unknown", height: "Unknown" },
        createdAt: stat2.birthtime,
        modifiedAt: stat2.mtime
      }
    };
  } catch (error) {
    return handleError5(error);
  }
}
async function screenshotDesktop({
  outputPath,
  format = "png",
  quality = 90
}) {
  try {
    const { spawn: spawn4 } = await import("child_process");
    const finalOutputPath = outputPath || (() => {
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, -5);
      return path7.join(os3.tmpdir(), `screenshot-${timestamp}.${format}`);
    })();
    const dir = path7.dirname(finalOutputPath);
    if (!fs7.existsSync(dir)) {
      fs7.mkdirSync(dir, { recursive: true });
    }
    const platform4 = os3.platform();
    let cmd;
    let args;
    switch (platform4) {
      case "win32":
        cmd = "powershell.exe";
        args = ["-NoProfile", "-Command", `
          Add-Type -AssemblyName System.Windows.Forms;
          Add-Type -AssemblyName System.Drawing;
          $screen = [System.Windows.Forms.Screen]::PrimaryScreen;
          $bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height);
          $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
          $graphics.CopyFromScreen(0, 0, 0, 0, $bitmap.Size);
          $bitmap.Save('${finalOutputPath.replace(/\\/g, "\\")}', [System.Drawing.Imaging.ImageFormat]::${format === "png" ? "Png" : "Jpeg"});
          $graphics.Dispose();
          $bitmap.Dispose();
        `];
        break;
      case "darwin":
        cmd = "screencapture";
        args = ["-m", "-x", finalOutputPath];
        break;
      default:
        cmd = "/bin/bash";
        args = ["-c", `(gnome-screenshot -f "${finalOutputPath}" 2>/dev/null || import -window root "${finalOutputPath}" 2>/dev/null) || echo "Failed"`];
        break;
    }
    return new Promise((resolve2, reject) => {
      const proc = spawn4(cmd, args, { shell: platform4 === "win32" });
      let stderr = "";
      proc.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      proc.on("close", (code) => {
        if (code === 0 && fs7.existsSync(finalOutputPath)) {
          const stat2 = fs7.statSync(finalOutputPath);
          resolve2({
            success: true,
            data: {
              path: finalOutputPath,
              size: stat2.size,
              sizeHuman: `${(stat2.size / 1024).toFixed(1)} KB`,
              format: format.toUpperCase()
            }
          });
        } else {
          reject(new Error(`Screenshot failed (exit code ${code}): ${stderr || "Unknown error"}`));
        }
      });
      proc.on("error", reject);
      setTimeout(() => {
        proc.kill();
        reject(new Error("Screenshot timed out"));
      }, 1e4);
    });
  } catch (error) {
    return handleError5(error);
  }
}
async function compareImages({ image1Path, image2Path }) {
  try {
    const validation1 = validateImageFile(image1Path);
    if (!validation1.valid) return { success: false, error: validation1.error };
    const validation2 = validateImageFile(image2Path);
    if (!validation2.valid) return { success: false, error: validation2.error };
    const buffer1 = fs7.readFileSync(image1Path);
    const buffer2 = fs7.readFileSync(image2Path);
    const dims1 = getImageDimensions(image1Path);
    const dims2 = getImageDimensions(image2Path);
    if (!dims1 || !dims2) {
      return { success: false, error: "Could not determine image dimensions" };
    }
    if (dims1.width !== dims2.width || dims1.height !== dims2.height) {
      return {
        success: true,
        data: {
          isIdentical: false,
          reason: "Different dimensions",
          image1Dimensions: { width: dims1.width, height: dims1.height },
          image2Dimensions: { width: dims2.width, height: dims2.height }
        }
      };
    }
    const isByteIdentical = buffer1.equals(buffer2);
    if (isByteIdentical) {
      return {
        success: true,
        data: {
          isIdentical: true,
          similarityPercent: 100,
          dimensions: { width: dims1.width, height: dims1.height },
          note: "Images are byte-identical"
        }
      };
    }
    return {
      success: true,
      data: {
        isIdentical: false,
        similarityPercent: "Unknown (byte comparison only)",
        dimensions: { width: dims1.width, height: dims1.height },
        note: "Images differ. For detailed pixel comparison, install sharp or jimp library.",
        image1Size: buffer1.length,
        image2Size: buffer2.length
      }
    };
  } catch (error) {
    return handleError5(error);
  }
}
function registerImageProcessingTools(_config) {
  return [
    (0, import_sdk10.tool)({
      name: "image_to_text",
      description: `Extract text from images using OCR (Tesseract.js).

Supported formats: PNG, JPG, JPEG, BMP, GIF, TIFF, WebP. Maximum file size: 50MB.

Returns:
- Extracted text content
- Confidence score (0-100)
- Detected language
- Word count and line count
- Per-word data with bounding boxes (first 100 words)`,
      parameters: {
        imagePath: import_zod10.z.string().describe("Path to the image file"),
        language: import_zod10.z.string().optional().default("eng").describe('Language code for OCR (e.g., "eng", "deu", "chi_sim"). Default: "eng"')
      },
      implementation: async ({ imagePath, language }) => imageToText({ imagePath, language })
    }),
    (0, import_sdk10.tool)({
      name: "describe_image",
      description: `Get detailed metadata about an image file including dimensions, format, size, and timestamps.

Supported formats: PNG, JPG, JPEG, BMP, GIF, WebP, TIFF.`,
      parameters: {
        imagePath: import_zod10.z.string().describe("Path to the image file")
      },
      implementation: async ({ imagePath }) => describeImage({ imagePath })
    }),
    (0, import_sdk10.tool)({
      name: "screenshot_desktop",
      description: `Capture a screenshot of the desktop and save it to a file.

Cross-platform support:
- Windows: Uses .NET GDI+ via PowerShell
- macOS: Uses screencapture command
- Linux: Uses gnome-screenshot or ImageMagick import

Output is saved to temp directory if no path specified.`,
      parameters: {
        outputPath: import_zod10.z.string().optional().describe("Output file path. Defaults to temp directory with timestamp."),
        format: import_zod10.z.enum(["png", "jpeg"]).default("png").describe('Image format. Default: "png"'),
        quality: import_zod10.z.number().min(1).max(100).default(90).describe("JPEG quality (1-100). Only applies to JPEG format. Default: 90")
      },
      implementation: async ({ outputPath, format, quality }) => screenshotDesktop({ outputPath, format, quality })
    }),
    (0, import_sdk10.tool)({
      name: "compare_images",
      description: `Compare two images for similarity.

Performs byte-level comparison and dimension checking.
For identical encodings, returns exact match status.

Note: Detailed pixel-level comparison requires sharp or jimp library installation.`,
      parameters: {
        image1Path: import_zod10.z.string().describe("Path to the first image"),
        image2Path: import_zod10.z.string().describe("Path to the second image")
      },
      implementation: async ({ image1Path, image2Path }) => compareImages({ image1Path, image2Path })
    })
  ];
}
var import_sdk10, import_zod10, fs7, path7, os3;
var init_imageProcessingTools = __esm({
  "src/tools/imageProcessingTools.ts"() {
    "use strict";
    import_sdk10 = require("@lmstudio/sdk");
    import_zod10 = require("zod");
    fs7 = __toESM(require("fs"));
    path7 = __toESM(require("path"));
    os3 = __toESM(require("os"));
  }
});

// src/tools/httpClientTools.ts
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "file:" || parsed.protocol === "data:") {
      return { valid: false, error: `Protocol "${parsed.protocol}" is not allowed` };
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: `Only HTTP/HTTPS protocols are allowed` };
    }
    const hostname2 = parsed.hostname;
    const blockedPatterns = [
      /^127\./,
      // localhost
      /^10\./,
      // 10.0.0.0/8
      /^172\.1[6-9]\./,
      // 172.16.0.0/12
      /^172\.2[0-9]\./,
      // 172.16.0.0/12
      /^172\.3[0-1]\./,
      // 172.16.0.0/12
      /^192\.168\./,
      // 192.168.0.0/16
      /^0\.0\.0\.0$/,
      // 0.0.0.0
      /^localhost$/
      // localhost hostname
    ];
    if (blockedPatterns.some((pattern) => pattern.test(hostname2))) {
      return { valid: false, error: `Access to ${hostname2} is blocked for security reasons` };
    }
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: `Invalid URL: ${message}` };
  }
}
function handleError6(error) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: `HTTP request failed: ${message}` };
}
async function httpRequest({ method, url, headers = {}, body }) {
  try {
    const validation = validateUrl(url);
    if (!validation.valid) return { success: false, error: validation.error };
    const options = {
      method: method.toUpperCase(),
      headers: {
        "User-Agent": "AI-Toolbox/1.0",
        ...headers
      }
    };
    if (body && !["GET", "HEAD"].includes(method.toUpperCase())) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
      if (!headers["Content-Type"] && typeof body !== "string") {
        options.headers["Content-Type"] = "application/json";
      }
    }
    console.log(`[AI Toolbox] HTTP ${method.toUpperCase()} ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3e4);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      let responseData;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseData,
          url,
          method: method.toUpperCase()
        }
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return handleError6(error);
  }
}
async function httpGetJson({ url, headers = {} }) {
  try {
    const validation = validateUrl(url);
    if (!validation.valid) return { success: false, error: validation.error };
    console.log(`[AI Toolbox] HTTP GET ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3e4);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "AI-Toolbox/1.0",
          Accept: "application/json",
          ...headers
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data: { status: response.status, url }
        };
      }
      const data = await response.json();
      return {
        success: true,
        data: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: data,
          url
        }
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return handleError6(error);
  }
}
async function httpPostJson({ url, data, headers = {} }) {
  try {
    const validation = validateUrl(url);
    if (!validation.valid) return { success: false, error: validation.error };
    console.log(`[AI Toolbox] HTTP POST ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3e4);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "User-Agent": "AI-Toolbox/1.0",
          "Content-Type": "application/json",
          Accept: "application/json",
          ...headers
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      let responseData;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      return {
        success: true,
        data: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseData,
          url
        }
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return handleError6(error);
  }
}
function registerHttpClientTools(_config) {
  const tools = [];
  tools.push((0, import_sdk11.tool)({
    name: "http_request",
    description: "Make generic HTTP requests to any REST API. Supports GET, POST, PUT, DELETE, PATCH and other methods.",
    parameters: {
      method: import_zod11.z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]).describe("HTTP method"),
      url: import_zod11.z.string().url().describe("Request URL (must be http:// or https://)"),
      headers: import_zod11.z.record(import_zod11.z.string()).optional().describe("Custom headers as key-value pairs"),
      body: import_zod11.z.union([import_zod11.z.string(), import_zod11.z.record(import_zod11.z.unknown())]).optional().describe("Request body (string or JSON object)")
    },
    implementation: async (params) => httpRequest(params)
  }));
  tools.push((0, import_sdk11.tool)({
    name: "http_get_json",
    description: "Make a GET request and return parsed JSON response.",
    parameters: {
      url: import_zod11.z.string().url().describe("Request URL (must be http:// or https://)"),
      headers: import_zod11.z.record(import_zod11.z.string()).optional().describe("Custom headers as key-value pairs")
    },
    implementation: async (params) => httpGetJson(params)
  }));
  tools.push((0, import_sdk11.tool)({
    name: "http_post_json",
    description: "Make a POST request with JSON body and return parsed response.",
    parameters: {
      url: import_zod11.z.string().url().describe("Request URL (must be http:// or https://)"),
      data: import_zod11.z.record(import_zod11.z.unknown()).describe("JSON object to send as request body"),
      headers: import_zod11.z.record(import_zod11.z.string()).optional().describe("Custom headers as key-value pairs")
    },
    implementation: async (params) => httpPostJson(params)
  }));
  return tools;
}
var import_sdk11, import_zod11;
var init_httpClientTools = __esm({
  "src/tools/httpClientTools.ts"() {
    "use strict";
    import_sdk11 = require("@lmstudio/sdk");
    import_zod11 = require("zod");
  }
});

// src/tools/vectorRagTools.ts
function getSharedStore() {
  if (!sharedStore) {
    sharedStore = new LocalVectorStore();
  }
  return sharedStore;
}
function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  if (words.length <= chunkSize) {
    return [{
      id: `chunk_${Date.now()}_0`,
      text,
      metadata: {
        file_path: "",
        file_name: "",
        chunk_index: 0,
        total_chunks: 1,
        word_count: words.length
      }
    }];
  }
  let startIndex = 0;
  let chunkIndex = 0;
  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkText3 = words.slice(startIndex, endIndex).join(" ");
    chunks.push({
      id: `chunk_${Date.now()}_${chunkIndex}`,
      text: chunkText3,
      metadata: {
        file_path: "",
        // Will be set later
        file_name: "",
        // Will be set later
        chunk_index: chunkIndex,
        total_chunks: Math.ceil(words.length / (chunkSize - overlap)),
        word_count: endIndex - startIndex
      }
    });
    chunkIndex++;
    startIndex = endIndex - overlap;
  }
  return chunks;
}
function generateEmbedding(text) {
  const dimensions = 100;
  const embedding = new Float32Array(dimensions);
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  const wordSet = new Set(words);
  for (const word of wordSet) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const dimIndex = Math.abs(hash % dimensions);
    embedding[dimIndex] += 1 / (word.length + 1);
  }
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += embedding[i] * embedding[i];
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dimensions; i++) {
    embedding[i] /= norm;
  }
  return embedding;
}
async function ragIndexFiles({
  directoryPath,
  filePattern = "*.{ts,js,tsx,jsx,md,json,yaml,yml,toml,txt}",
  batchSize = 10
}) {
  try {
    if (!fs8.existsSync(directoryPath)) {
      return { success: false, error: `Directory not found: ${directoryPath}` };
    }
    const store = getSharedStore();
    let indexedCount = 0;
    let skippedCount = 0;
    const findFiles = (dir) => {
      let results = [];
      try {
        const entries = fs8.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path8.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".git") continue;
            results = results.concat(findFiles(fullPath));
          } else if (entry.isFile()) {
            const ext = path8.extname(entry.name).toLowerCase();
            const allowedExts = [".ts", ".js", ".tsx", ".jsx", ".md", ".json", ".yaml", ".yml", ".toml", ".txt"];
            if (allowedExts.includes(ext)) {
              results.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`[AI Toolbox] Could not read directory ${dir}:`, error);
      }
      return results;
    };
    const files = findFiles(directoryPath);
    if (files.length === 0) {
      return { success: true, data: { indexedCount: 0, message: "No matching files found" } };
    }
    for (const filePath of files) {
      try {
        const content = fs8.readFileSync(filePath, "utf-8");
        if (content.length > 1024 * 1024) {
          skippedCount++;
          continue;
        }
        const chunks = chunkText(content);
        chunks.forEach((chunk) => {
          chunk.metadata.file_path = filePath;
          chunk.metadata.file_name = path8.basename(filePath);
        });
        const ids = chunks.map((c) => c.id);
        const embeddings = chunks.map((c) => generateEmbedding(c.text));
        store.add(chunks);
        store.setEmbeddings(ids, embeddings);
        indexedCount += chunks.length;
      } catch (error) {
        console.warn(`[AI Toolbox] Could not index ${filePath}:`, error);
        skippedCount++;
      }
      if ((indexedCount + skippedCount) % batchSize === 0) {
        process.stdout.write(`\r[AI Toolbox] Indexed ${indexedCount + skippedCount} chunks...`);
      }
    }
    console.log("\n[AI Toolbox] Indexing complete");
    return {
      success: true,
      data: {
        indexedChunks: indexedCount,
        filesProcessed: files.length,
        skippedFiles: skippedCount,
        totalDocuments: store.count,
        directoryPath
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `RAG indexing failed: ${message}` };
  }
}
async function ragQueryVector({ query, topK = 5 }) {
  try {
    const store = getSharedStore();
    if (store.count === 0) {
      return { success: false, error: "No documents indexed. Run rag_index_files first." };
    }
    const queryEmbedding = generateEmbedding(query);
    const results = store.search(queryEmbedding, topK);
    return {
      success: true,
      data: {
        query,
        topK,
        totalDocuments: store.count,
        results
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `RAG query failed: ${message}` };
  }
}
async function ragClearIndex({ confirm }) {
  if (!confirm) {
    return { success: false, error: "Confirmation required to clear index" };
  }
  const store = getSharedStore();
  store.clear();
  return {
    success: true,
    data: { message: "Vector index cleared successfully" }
  };
}
async function ragWebContent({ url, query }) {
  try {
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return { success: false, error: `Invalid URL: ${url}` };
    }
    const response = await fetch(parsedUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    const content = await response.text();
    const chunks = chunkText(content);
    if (chunks.length === 0) {
      return { success: false, error: "No content could be extracted from URL" };
    }
    const queryEmbedding = generateEmbedding(query);
    let bestMatch = null;
    let bestScore = -Infinity;
    for (const chunk of chunks) {
      const chunkEmbedding = generateEmbedding(chunk.text);
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < chunkEmbedding.length; i++) {
        dotProduct += queryEmbedding[i] * chunkEmbedding[i];
        normA += chunkEmbedding[i] * chunkEmbedding[i];
        normB += queryEmbedding[i] * queryEmbedding[i];
      }
      const similarity = normA > 0 && normB > 0 ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = chunk;
      }
    }
    return {
      success: true,
      data: {
        url,
        query,
        totalChunks: chunks.length,
        bestMatch: bestMatch ? {
          text: bestMatch.text,
          score: bestScore,
          metadata: bestMatch.metadata
        } : null
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `RAG search failed: ${message}` };
  }
}
function registerRagTools(_config) {
  const tools = [];
  tools.push((0, import_sdk12.tool)({
    name: "rag_index_files",
    description: "Index files in a directory for semantic search. Supports TypeScript, JavaScript, Markdown, JSON, YAML, and text files.",
    parameters: {
      directoryPath: import_zod12.z.string().describe("Directory path to index"),
      filePattern: import_zod12.z.string().optional().default("*.{ts,js,tsx,jsx,md,json,yaml,yml,toml,txt}").describe("File pattern to match (glob syntax)"),
      batchSize: import_zod12.z.number().min(1).max(100).optional().default(10).describe("Batch size for progress reporting")
    },
    implementation: async (params) => ragIndexFiles(params)
  }));
  tools.push((0, import_sdk12.tool)({
    name: "rag_query_vector",
    description: "Query the vector index for semantically similar documents. Returns top-k most relevant chunks.",
    parameters: {
      query: import_zod12.z.string().describe("Search query text"),
      topK: import_zod12.z.number().min(1).max(20).optional().default(5).describe("Number of results to return")
    },
    implementation: async (params) => ragQueryVector(params)
  }));
  tools.push((0, import_sdk12.tool)({
    name: "rag_clear_index",
    description: "Clear the vector search index. Requires confirmation.",
    parameters: {
      confirm: import_zod12.z.boolean().describe("Set to true to confirm clearing the index")
    },
    implementation: async (params) => ragClearIndex(params)
  }));
  tools.push((0, import_sdk12.tool)({
    name: "rag_web_content",
    description: "Fetch content from a URL, and then use RAG to find and return only the text chunks most relevant to a specific query.",
    parameters: {
      url: import_zod12.z.string().url().describe("The URL to fetch"),
      query: import_zod12.z.string().describe("The search query for relevance matching")
    },
    implementation: async (params) => ragWebContent(params)
  }));
  return tools;
}
var import_sdk12, import_zod12, path8, fs8, LocalVectorStore, sharedStore;
var init_vectorRagTools = __esm({
  "src/tools/vectorRagTools.ts"() {
    "use strict";
    import_sdk12 = require("@lmstudio/sdk");
    import_zod12 = require("zod");
    path8 = __toESM(require("path"));
    fs8 = __toESM(require("fs"));
    LocalVectorStore = class {
      constructor(indexName = "ai_toolbox_rag") {
        this.documents = /* @__PURE__ */ new Map();
        this.indexName = indexName;
      }
      /** Add documents to the store */
      add(documents) {
        for (const doc of documents) {
          this.documents.set(doc.id, { embedding: new Float32Array(0), chunk: doc });
        }
      }
      /** Set embeddings for all documents */
      setEmbeddings(ids, embeddings) {
        ids.forEach((id, i) => {
          const entry = this.documents.get(id);
          if (entry) {
            entry.embedding = embeddings[i];
          }
        });
      }
      /** Search for similar documents */
      search(queryEmbedding, topK) {
        const results = [];
        for (const [id, entry] of this.documents.entries()) {
          if (entry.embedding.length === 0) continue;
          let dotProduct = 0;
          let normA = 0;
          let normB = 0;
          for (let i = 0; i < entry.embedding.length; i++) {
            dotProduct += queryEmbedding[i] * entry.embedding[i];
            normA += entry.embedding[i] * entry.embedding[i];
            normB += queryEmbedding[i] * queryEmbedding[i];
          }
          const similarity = normA > 0 && normB > 0 ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
          results.push({ id, score: similarity });
        }
        return results.sort((a, b) => b.score - b.score).slice(0, topK).map(({ id, score }) => {
          const entry = this.documents.get(id);
          return {
            id: entry.chunk.id,
            text: entry.chunk.text,
            score,
            metadata: entry.chunk.metadata
          };
        });
      }
      /** Clear all documents */
      clear() {
        this.documents.clear();
      }
      /** Get document count */
      get count() {
        return this.documents.size;
      }
    };
    sharedStore = null;
  }
});

// src/tools/uiGenerationTools.ts
function generateButtonHtml(label, color = "#007bff", id = "ui-btn") {
  return `
    <button id="${id}" style="
      padding: 12px 24px;
      background-color: ${color};
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: opacity 0.2s;
    ">${label}</button>
  `;
}
function generateFormHtml(fields, submitLabel = "Submit") {
  const fieldsHtml = fields.map((field) => `
    <div style="margin-bottom: 15px;">
      <label for="${field.name}" style="display: block; margin-bottom: 5px; font-weight: bold;">${field.label}</label>
      ${field.type === "textarea" ? `<textarea id="${field.name}" name="${field.name}" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>` : field.type === "select" ? `<select id="${field.name}" name="${field.name}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"><option value="">Select...</option><option value="1">Option 1</option><option value="2">Option 2</option></select>` : `<input type="${field.type}" id="${field.name}" name="${field.name}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />`}
    </div>
  `).join("");
  return `
    <form id="ui-form" onsubmit="event.preventDefault(); document.getElementById('form-result').innerHTML = 'Form submitted!';">
      ${fieldsHtml}
      <button type="submit" style="padding: 12px 24px; background-color: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">${submitLabel}</button>
    </form>
    <div id="form-result" style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;"></div>
  `;
}
function generateChartHtml(data, title = "Bar Chart") {
  const maxValue = Math.max(...data.map((d) => d.value));
  const barsHtml = data.map((d) => {
    const height = d.value / maxValue * 200;
    return `
      <div style="display: flex; align-items: flex-end; justify-content: center; margin-right: 10px;">
        <div style="width: 40px; height: ${height}px; background-color: #007bff; border-radius: 4px 4px 0 0;"></div>
      </div>
    `;
  }).join("");
  const labelsHtml = data.map((d) => `
    <div style="width: 40px; text-align: center; font-size: 12px;">${d.label}</div>
  `).join("");
  return `
    <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <h3>${title}</h3>
      <div style="display: flex; align-items: flex-end; height: 220px; margin-bottom: 10px;">${barsHtml}</div>
      <div style="display: flex; justify-content: space-around;">${labelsHtml}</div>
    </div>
  `;
}
function generateDashboardHtml(titles, content) {
  const cardsHtml = titles.map((title, index) => {
    const cardContent = content[index]?.type === "chart" ? generateChartHtml(content[index].data || [{ label: "A", value: 50 }, { label: "B", value: 80 }], title) : `<p style="padding: 20px;">${content[index]?.data || `Content for ${title}`}</p>`;
    return `
      <div style="flex: 1; min-width: 250px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 10px;">
        ${cardContent}
      </div>
    `;
  }).join("");
  return `
    <div style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px;">${cardsHtml}</div>
  `;
}
function registerUiGenerationTools(_config) {
  const tools = [];
  tools.push((0, import_sdk13.tool)({
    name: "generate_ui_component",
    description: "Generate HTML/CSS/JS code for an interactive UI component (button, form, chart, dashboard). Returns the generated code.",
    parameters: {
      component_type: import_zod13.z.enum(["button", "form", "chart", "dashboard"]).describe("Type of UI component to generate"),
      label: import_zod13.z.string().optional().describe("Label text for buttons or forms"),
      fields: import_zod13.z.array(import_zod13.z.object({
        name: import_zod13.z.string(),
        type: import_zod13.z.enum(["text", "email", "password", "number", "textarea", "select"]),
        label: import_zod13.z.string()
      })).optional().describe("Form fields (for form component)"),
      chart_data: import_zod13.z.array(import_zod13.z.object({
        label: import_zod13.z.string(),
        value: import_zod13.z.number()
      })).optional().describe("Chart data points (for chart component)"),
      dashboard_titles: import_zod13.z.array(import_zod13.z.string()).optional().describe("Titles for dashboard cards")
    },
    implementation: async ({ component_type, label, fields, chart_data, dashboard_titles }) => {
      try {
        let html = "";
        switch (component_type) {
          case "button":
            html = generateButtonHtml(label || "Click Me");
            break;
          case "form":
            if (!fields || fields.length === 0) {
              return { success: false, error: "Form component requires at least one field" };
            }
            html = generateFormHtml(fields);
            break;
          case "chart":
            if (!chart_data || chart_data.length === 0) {
              return { success: false, error: "Chart component requires data points" };
            }
            html = generateChartHtml(chart_data);
            break;
          case "dashboard":
            if (!dashboard_titles || dashboard_titles.length === 0) {
              return { success: false, error: "Dashboard component requires at least one title" };
            }
            const content = dashboard_titles.map((title, index) => ({
              type: index % 2 === 0 ? "chart" : "text",
              data: index % 2 === 0 ? [{ label: "A", value: Math.floor(Math.random() * 100) }, { label: "B", value: Math.floor(Math.random() * 100) }] : void 0
            }));
            html = generateDashboardHtml(dashboard_titles, content);
            break;
          default:
            return { success: false, error: `Unknown component type: ${component_type}` };
        }
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>UI Component</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">${html}</body></html>`;
        return { success: true, data: { component_type, html: fullHtml } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to generate UI component: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk13.tool)({
    name: "render_and_preview_ui",
    description: "Render a generated HTML UI component, save it to a file, open it in the default browser, and optionally take a screenshot.",
    parameters: {
      html_content: import_zod13.z.string().describe("The complete HTML content to render"),
      filename: import_zod13.z.string().optional().default("ui_preview.html").describe("Filename for saving (default: ui_preview.html)"),
      screenshot_path: import_zod13.z.string().optional().describe("Optional path to save a screenshot of the rendered UI")
    },
    implementation: async ({ html_content, filename, screenshot_path }) => {
      try {
        const fileName = filename || "ui_preview.html";
        const filePath = path9.join(getWorkingDir(), fileName);
        fs9.writeFileSync(filePath, html_content);
        const openModule = await import("open");
        await openModule.default(filePath);
        const resultData = {
          rendered: true,
          file: fileName,
          path: filePath
        };
        if (screenshot_path) {
          try {
            const puppeteerModule2 = await import("puppeteer");
            const browser = await puppeteerModule2.default.launch({ headless: true });
            const page = await browser.newPage();
            await page.goto(`file://${filePath}`);
            await page.waitForSelector("body", { timeout: 5e3 }).catch(() => {
            });
            await page.screenshot({ path: screenshot_path, fullPage: true });
            resultData.screenshotSaved = true;
            await browser.close();
          } catch (screenshotError) {
            const message = screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
            resultData.screenshotWarning = `Screenshot failed: ${message}`;
          }
        }
        return { success: true, data: resultData };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to render UI: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk13.tool)({
    name: "extract_ui_data",
    description: "Extract structured data from HTML content (tables, forms, lists). Useful for parsing generated or fetched UIs.",
    parameters: {
      html_content: import_zod13.z.string().describe("The HTML content to extract data from"),
      extraction_type: import_zod13.z.enum(["table", "form", "list"]).default("table").describe("Type of data to extract")
    },
    implementation: async ({ html_content, extraction_type }) => {
      try {
        let extractedData = {};
        if (extraction_type === "table") {
          const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
          const rowsRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
          const cellsRegex = /<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi;
          let tableMatch;
          while ((tableMatch = tableRegex.exec(html_content)) !== null) {
            const tableContent = tableMatch[1];
            const rows = [];
            let rowMatch;
            while ((rowMatch = rowsRegex.exec(tableContent)) !== null) {
              rows.push(rowMatch[1]);
            }
            const parsedRows = [];
            for (const row of rows) {
              const cells = [];
              let cellMatch;
              const cellRegex = /<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi;
              while ((cellMatch = cellRegex.exec(row)) !== null) {
                cells.push(cellMatch[2].replace(/<[^>]+>/g, "").trim());
              }
              parsedRows.push(cells);
            }
            extractedData.tables = parsedRows;
          }
        } else if (extraction_type === "form") {
          const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
          const inputRegex = /<(input|select|textarea)[^>]*\/?>/gi;
          let formMatch;
          while ((formMatch = formRegex.exec(html_content)) !== null) {
            const formContent = formMatch[1];
            const fields = [];
            let inputMatch;
            while ((inputMatch = inputRegex.exec(formContent)) !== null) {
              const tag = inputMatch[0];
              const nameMatch = /name=["']([^"']+)["']/i.exec(tag);
              const typeMatch = /type=["']([^"']+)["']/i.exec(tag);
              if (nameMatch) {
                fields.push({
                  name: nameMatch[1],
                  type: typeMatch?.[1] || "text",
                  value: ""
                  // Would need to extract actual values in a real implementation
                });
              }
            }
            extractedData.formFields = fields;
          }
        } else if (extraction_type === "list") {
          const listRegex = /<(ul|ol)[^>]*>([\s\S]*?)<\/(ul|ol)>/gi;
          const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
          let listMatch;
          while ((listMatch = listRegex.exec(html_content)) !== null) {
            const listContent = listMatch[2];
            const items = [];
            let itemMatch;
            while ((itemMatch = itemRegex.exec(listContent)) !== null) {
              items.push(itemMatch[1].replace(/<[^>]+>/g, "").trim());
            }
            extractedData.items = items;
          }
        }
        return { success: true, data: extractedData };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to extract UI data: ${message}` };
      }
    }
  }));
  return tools;
}
var import_sdk13, import_zod13, fs9, path9;
var init_uiGenerationTools = __esm({
  "src/tools/uiGenerationTools.ts"() {
    "use strict";
    import_sdk13 = require("@lmstudio/sdk");
    import_zod13 = require("zod");
    fs9 = __toESM(require("fs"));
    path9 = __toESM(require("path"));
    init_workingDir();
  }
});

// src/tools/contextManagementTools.ts
function registerContextManagementTools(_config) {
  const analyzer = new ContextAnalyzer();
  const storageManager = new ContextStorageManager();
  const tools = [];
  tools.push((0, import_sdk14.tool)({
    name: "auto_summarize_context",
    description: `Automatically analyze recent session activity to identify patterns, frequent tool usage, configuration changes, and decisions worth remembering. Saves findings to persistent memory.

WHEN TO USE:
\u2022 At the end of a long session to capture key learnings
\u2022 After significant configuration or workflow changes
\u2022 When user asks you to "summarize what happened" or "remember this session"
\u2022 Periodically during extended work sessions`,
    parameters: {
      session_events: import_zod14.z.array(import_zod14.z.object({
        type: import_zod14.z.string(),
        timestamp: import_zod14.z.number(),
        data: import_zod14.z.any().optional()
      })).optional().describe("Recent session events to analyze"),
      config_changes: import_zod14.z.record(import_zod14.z.union([import_zod14.z.boolean(), import_zod14.z.string()])).optional().describe("Configuration changes made during session")
    },
    implementation: async ({ session_events = [], config_changes }) => {
      try {
        const result = analyzer.analyzeAndSave(session_events || [], config_changes);
        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Context analysis failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk14.tool)({
    name: "get_context_memory",
    description: `Retrieve your persistent memory entries from past sessions. Access recorded decisions, patterns, configurations, and events.

WHEN TO USE:
\u2022 User asks about previous work or "what happened before"
\u2022 You want to review recent important events automatically tracked
\u2022 Checking what context has been saved for continuity across sessions
\u2022 User wants a summary of remembered information`,
    parameters: {
      limit: import_zod14.z.number().min(1).max(50).optional().default(20).describe("Maximum number of entries to return"),
      type: import_zod14.z.enum(["decision", "pattern", "configuration", "file_change", "error", "summary"]).optional().describe("Filter by entry type")
    },
    implementation: async ({ limit = 20, type }) => {
      try {
        const entries = storageManager.getRecentEntries(limit || 20, type);
        return { success: true, data: { entries } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to retrieve context memory: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk14.tool)({
    name: "search_context",
    description: `Search through your persistent memory for past decisions, patterns, configurations, and events. 

WHEN TO USE:
\u2022 User asks "what did we decide before?" or similar recall questions
\u2022 You need to reference previous architectural decisions
\u2022 Checking if a similar problem was solved in a prior session
\u2022 User wants to know what you've learned from past work`,
    parameters: {
      query: import_zod14.z.string().describe("Search query to match against context entries"),
      max_results: import_zod14.z.number().min(1).max(50).optional().default(10).describe("Maximum number of results to return")
    },
    implementation: async ({ query, max_results = 10 }) => {
      try {
        const results = storageManager.searchEntries(query, max_results || 10);
        return { success: true, data: { results } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Context search failed: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk14.tool)({
    name: "context_summary",
    description: `Get a statistical overview of your persistent memory: total entries, breakdown by type (decisions, patterns, configurations), and recent activity.

WHEN TO USE:
\u2022 User asks "what have you remembered?" or "show me your memory"
\u2022 You want to provide an overview before detailed retrieval
\u2022 Checking if any relevant context exists before searching`,
    parameters: {},
    implementation: async () => {
      try {
        const summary = storageManager.getSummary();
        return { success: true, data: summary };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get context summary: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk14.tool)({
    name: "delete_context_entry",
    description: "Delete a specific auto-saved context entry by its unique ID.",
    parameters: {
      entry_id: import_zod14.z.string().describe("The unique ID of the context entry to delete")
    },
    implementation: async ({ entry_id }) => {
      try {
        const deleted = storageManager.deleteEntry(entry_id);
        if (!deleted) {
          return { success: false, error: `Context entry '${entry_id}' not found` };
        }
        return { success: true, data: { deleted: true, entry_id } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete context entry: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk14.tool)({
    name: "clear_context_memory",
    description: "Clear all automatically saved context entries from persistent memory. This action cannot be undone.",
    parameters: {
      confirm: import_zod14.z.boolean().describe("Set to true to confirm deletion of all context entries")
    },
    implementation: async ({ confirm }) => {
      if (!confirm) {
        return { success: false, error: "Confirmation required. Set confirm=true to proceed." };
      }
      try {
        storageManager.clearAll();
        return { success: true, data: { cleared: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to clear context memory: ${message}` };
      }
    }
  }));
  tools.push((0, import_sdk14.tool)({
    name: "track_important_event",
    description: `Manually record an important event, decision, or milestone to persistent memory across sessions. 

WHEN TO USE:
\u2022 After making a significant architectural or design decision
\u2022 When completing a major task milestone successfully
\u2022 When discovering patterns worth remembering for future work
\u2022 When user explicitly asks you to "remember" something
\u2022 Before ending a session with important learnings`,
    parameters: {
      title: import_zod14.z.string().describe("Title of the important event"),
      content: import_zod14.z.string().describe("Detailed description of the event"),
      tags: import_zod14.z.array(import_zod14.z.string()).optional().describe("Tags to categorize the event")
    },
    implementation: async ({ title, content, tags }) => {
      try {
        const entry = {
          id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: "decision",
          title,
          content,
          tags
        };
        storageManager.addEntry(entry);
        return { success: true, data: { tracked: true, entry_id: entry.id } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to track event: ${message}` };
      }
    }
  }));
  return tools;
}
var import_sdk14, import_zod14, fs10, path10, ContextStorageManager, ContextAnalyzer;
var init_contextManagementTools = __esm({
  "src/tools/contextManagementTools.ts"() {
    "use strict";
    import_sdk14 = require("@lmstudio/sdk");
    import_zod14 = require("zod");
    fs10 = __toESM(require("fs"));
    path10 = __toESM(require("path"));
    init_workingDir();
    ContextStorageManager = class {
      constructor() {
        this.storagePath = path10.join(getWorkingDir(), ".ai_toolbox_context.json");
        console.log(`[ContextStorage] Initialized with storage path: ${this.storagePath}`);
      }
      /** Load context entries from disk */
      load() {
        try {
          if (!fs10.existsSync(this.storagePath)) {
            console.log(`[ContextStorage.load] File does not exist yet: ${this.storagePath}`);
            return [];
          }
          const data = fs10.readFileSync(this.storagePath, "utf-8");
          const entries = JSON.parse(data);
          console.log(`[ContextStorage.load] Loaded ${entries.length} entries from disk`);
          return entries;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`[ContextStorage.load] Failed to load context storage: ${message}`);
          return [];
        }
      }
      /** Save context entries to disk */
      save(entries) {
        try {
          const dir = path10.dirname(this.storagePath);
          if (!fs10.existsSync(dir)) {
            fs10.mkdirSync(dir, { recursive: true });
            console.log(`[ContextStorage.save] Created directory: ${dir}`);
          }
          const tempPath = this.storagePath + ".tmp";
          fs10.writeFileSync(tempPath, JSON.stringify(entries, null, 2));
          fs10.renameSync(tempPath, this.storagePath);
          console.log(`[ContextStorage.save] Saved ${entries.length} entries to disk`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`[ContextStorage.save] Failed to save context storage: ${message}`);
        }
      }
      /** Add a new context entry */
      addEntry(entry) {
        const entries = this.load();
        entries.unshift(entry);
        if (entries.length > 1e3) {
          entries.splice(1e3);
        }
        this.save(entries);
      }
      /** Get recent context entries */
      getRecentEntries(limit = 20, type) {
        const entries = this.load();
        if (type) {
          return entries.filter((e) => e.type === type).slice(0, limit);
        }
        return entries.slice(0, limit);
      }
      /** Search context entries by query */
      searchEntries(query, maxResults = 10) {
        const entries = this.load();
        const lowerQuery = query.toLowerCase();
        const results = entries.filter(
          (entry) => entry.title.toLowerCase().includes(lowerQuery) || entry.content.toLowerCase().includes(lowerQuery) || entry.tags && entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
        return results.slice(0, maxResults);
      }
      /** Delete context entries by ID */
      deleteEntry(id) {
        const entries = this.load();
        const filtered = entries.filter((e) => e.id !== id);
        if (filtered.length === entries.length) {
          return false;
        }
        this.save(filtered);
        return true;
      }
      /** Clear all context entries */
      clearAll() {
        this.save([]);
      }
      /** Get summary statistics */
      getSummary() {
        const entries = this.load();
        const entriesByType = {};
        entries.forEach((entry) => {
          entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
        });
        return {
          total_entries: entries.length,
          entries_by_type: entriesByType,
          recent_entries: entries.slice(0, 5),
          last_updated: Date.now()
        };
      }
    };
    ContextAnalyzer = class {
      constructor() {
        this.storageManager = new ContextStorageManager();
      }
      /** Analyze recent activity and auto-save important context */
      analyzeAndSave(sessionEvents, configChanges) {
        const entries = [];
        const toolUsageCount = {};
        sessionEvents.forEach((event) => {
          if (event.type && event.type.startsWith("tool_")) {
            const toolName = event.type.replace("tool_", "");
            toolUsageCount[toolName] = (toolUsageCount[toolName] || 0) + 1;
          }
        });
        Object.entries(toolUsageCount).forEach(([tool16, count]) => {
          if (count > 3) {
            entries.push({
              id: this.generateId(),
              timestamp: Date.now(),
              type: "pattern",
              title: `Frequent Tool Usage: ${tool16}`,
              content: `Tool '${tool16}' was used ${count} times in the current session, indicating it's a primary workflow tool.`,
              tags: ["usage_pattern", "frequent_tool"]
            });
          }
        });
        if (configChanges) {
          Object.entries(configChanges).forEach(([key, value]) => {
            entries.push({
              id: this.generateId(),
              timestamp: Date.now(),
              type: "configuration",
              title: `Configuration Change: ${key}`,
              content: `Setting '${key}' was changed to '${value}'.`,
              tags: ["config_change"]
            });
          });
        }
        const decisionEvents = sessionEvents.filter(
          (e) => e.type === "decision" || e.data && typeof e.data.decision === "string"
        );
        decisionEvents.forEach((event) => {
          const decisionText = event.data?.decision || `Decision made at ${event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : "unknown time"}`;
          entries.push({
            id: this.generateId(),
            timestamp: event.timestamp || Date.now(),
            type: "decision",
            title: "Important Decision Recorded",
            content: decisionText,
            tags: ["decision"]
          });
        });
        if (entries.length > 0) {
          const uniquePatterns = new Set(entries.filter((e) => e.type === "pattern").map((e) => e.title));
          entries.push({
            id: this.generateId(),
            timestamp: Date.now(),
            type: "summary",
            title: `Session Context Summary (${(/* @__PURE__ */ new Date()).toLocaleTimeString()})`,
            content: `Auto-generated summary: ${entries.length} context entries saved. Key patterns detected: ${Array.from(uniquePatterns).join(", ") || "No specific patterns"}. Configuration changes tracked: ${Object.keys(configChanges || {}).length}.`,
            tags: ["auto_summary"]
          });
          entries.forEach((entry) => this.storageManager.addEntry(entry));
          return {
            saved_count: entries.length,
            summary: `Saved ${entries.length} context entries including patterns and decisions.`
          };
        }
        return { saved_count: 0, summary: "No significant context changes detected." };
      }
      /** Generate a unique ID for context entry */
      generateId() {
        return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    };
  }
});

// src/attachmentManager.ts
function setAttachments(files) {
  currentAttachments.clear();
  for (const file of files) {
    currentAttachments.set(file.name.toLowerCase(), file);
  }
  if (files.length > 0) {
    console.log(`[AI Toolbox] Registered ${files.length} attachment(s): ${files.map((f) => f.name).join(", ")}`);
  }
}
function getAttachment(name) {
  return currentAttachments.get(name.toLowerCase());
}
function listAttachments() {
  return Array.from(currentAttachments.keys());
}
var currentAttachments;
var init_attachmentManager = __esm({
  "src/attachmentManager.ts"() {
    "use strict";
    currentAttachments = /* @__PURE__ */ new Map();
  }
});

// src/tools/documentTools.ts
function validateFile(filePath) {
  if (!fs11.existsSync(filePath)) {
    return { valid: false, error: `File not found on disk: ${filePath}` };
  }
  const stat2 = fs11.statSync(filePath);
  if (!stat2.isFile()) {
    return { valid: false, error: `Path "${filePath}" is not a file` };
  }
  const maxSize = 50 * 1024 * 1024;
  if (stat2.size > maxSize) {
    return { valid: false, error: `File too large (${(stat2.size / 1024 / 1024).toFixed(1)}MB), max is 50MB` };
  }
  return { valid: true };
}
function handleError7(error) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: `Document reading failed: ${message}` };
}
async function readDocument({ file_path }) {
  try {
    const attachment = getAttachment(file_path);
    if (attachment) {
      console.log(`[AI Toolbox] Reading attached file: ${file_path}`);
      const buffer = await attachment.readFile ? await attachment.readFile() : Buffer.from(await attachment.read());
      const ext2 = path11.extname(file_path).toLowerCase();
      if (ext2 === ".pdf") {
        return await readPDFFromBuffer(buffer, file_path);
      } else if (ext2 === ".docx") {
        return await readDOCXFromBuffer(buffer, file_path);
      } else if (ext2 === ".txt") {
        return await readTXTFromBuffer(buffer, file_path);
      } else {
        return {
          success: false,
          error: `Unsupported attached file format: ${ext2}. Only .pdf, .docx, and .txt are supported.`
        };
      }
    }
    const validation = validateFile(file_path);
    if (!validation.valid) {
      return {
        success: false,
        error: `${validation.error}

Note: If this is an attached file, use the exact filename from the "ATTACHED FILES AVAILABLE" list.`
      };
    }
    const ext = path11.extname(file_path).toLowerCase();
    switch (ext) {
      case ".pdf":
        return await readPDF(file_path);
      case ".docx":
        return await readDOCX(file_path);
      case ".txt": {
        const text = fs11.readFileSync(file_path, "utf-8");
        return {
          success: true,
          data: {
            file_path,
            format: "TXT",
            word_count: text.split(/\s+/).filter((w) => w.length > 0).length,
            size: `${(fs11.statSync(file_path).size / 1024).toFixed(1)} KB`,
            text_preview: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
            full_text: text
          }
        };
      }
      default:
        return {
          success: false,
          error: `Unsupported file format: ${ext}. Only .pdf, .docx, and .txt are supported.`
        };
    }
  } catch (error) {
    return handleError7(error);
  }
}
async function readPDF(filePath) {
  try {
    const pdfParse2 = (await import("pdf-parse")).default;
    console.log(`[AI Toolbox] Reading PDF from disk: ${filePath}`);
    const dataBuffer = fs11.readFileSync(filePath);
    const result = await pdfParse2(dataBuffer);
    console.log(`[AI Toolbox] PDF read complete: ${result.numpages} pages, ${(result.text.length / 1024).toFixed(1)}KB`);
    return {
      success: true,
      data: {
        file_path: filePath,
        format: "PDF",
        pages: result.numpages,
        word_count: result.text.split(/\s+/).filter((w) => w.length > 0).length,
        size: `${(fs11.statSync(filePath).size / 1024).toFixed(1)} KB`,
        text_preview: result.text.substring(0, 500) + (result.text.length > 500 ? "..." : ""),
        full_text: result.text
      }
    };
  } catch (error) {
    throw new Error(`PDF reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function readPDFFromBuffer(buffer, fileName) {
  try {
    const pdfParse2 = (await import("pdf-parse")).default;
    console.log(`[AI Toolbox] Reading PDF from attachment: ${fileName}`);
    const result = await pdfParse2(buffer);
    console.log(`[AI Toolbox] PDF read complete: ${result.numpages} pages, ${(result.text.length / 1024).toFixed(1)}KB`);
    return {
      success: true,
      data: {
        file_path: fileName,
        format: "PDF",
        pages: result.numpages,
        word_count: result.text.split(/\s+/).filter((w) => w.length > 0).length,
        size: `${(buffer.length / 1024).toFixed(1)} KB`,
        text_preview: result.text.substring(0, 500) + (result.text.length > 500 ? "..." : ""),
        full_text: result.text,
        source: "attachment"
      }
    };
  } catch (error) {
    throw new Error(`PDF reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function readDOCX(filePath) {
  try {
    const mammoth = await import("mammoth");
    console.log(`[AI Toolbox] Reading DOCX from disk: ${filePath}`);
    const dataBuffer = fs11.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    const text = result.value;
    const warnings = result.messages.map((m) => m.message).join("\n");
    console.log(`[AI Toolbox] DOCX read complete: ${(text.length / 1024).toFixed(1)}KB`);
    return {
      success: true,
      data: {
        file_path: filePath,
        format: "DOCX",
        word_count: text.split(/\s+/).filter((w) => w.length > 0).length,
        size: `${(fs11.statSync(filePath).size / 1024).toFixed(1)} KB`,
        text_preview: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
        full_text: text,
        warnings: warnings || void 0
      }
    };
  } catch (error) {
    throw new Error(`DOCX reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function readDOCXFromBuffer(buffer, fileName) {
  try {
    const mammoth = await import("mammoth");
    console.log(`[AI Toolbox] Reading DOCX from attachment: ${fileName}`);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const warnings = result.messages.map((m) => m.message).join("\n");
    console.log(`[AI Toolbox] DOCX read complete: ${(text.length / 1024).toFixed(1)}KB`);
    return {
      success: true,
      data: {
        file_path: fileName,
        format: "DOCX",
        word_count: text.split(/\s+/).filter((w) => w.length > 0).length,
        size: `${(buffer.length / 1024).toFixed(1)} KB`,
        text_preview: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
        full_text: text,
        warnings: warnings || void 0,
        source: "attachment"
      }
    };
  } catch (error) {
    throw new Error(`DOCX reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function readTXTFromBuffer(buffer, fileName) {
  try {
    console.log(`[AI Toolbox] Reading TXT from attachment: ${fileName}`);
    const text = buffer.toString("utf-8");
    console.log(`[AI Toolbox] TXT read complete: ${(text.length / 1024).toFixed(1)}KB`);
    return {
      success: true,
      data: {
        file_path: fileName,
        format: "TXT",
        word_count: text.split(/\s+/).filter((w) => w.length > 0).length,
        size: `${(buffer.length / 1024).toFixed(1)} KB`,
        text_preview: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
        full_text: text,
        source: "attachment"
      }
    };
  } catch (error) {
    throw new Error(`TXT reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function registerDocumentTools(_config) {
  const tools = [];
  tools.push((0, import_sdk15.tool)({
    name: "read_document",
    description: "Read content from PDF, DOCX, or TXT files. Supports both disk paths and attached files (use filename for attachments).",
    parameters: {
      file_path: import_zod15.z.string().describe("Path to the PDF, DOCX, or TXT file, or the filename if it is an attached file")
    },
    implementation: async (params) => readDocument(params)
  }));
  return tools;
}
var import_sdk15, import_zod15, path11, fs11;
var init_documentTools = __esm({
  "src/tools/documentTools.ts"() {
    "use strict";
    import_sdk15 = require("@lmstudio/sdk");
    import_zod15 = require("zod");
    path11 = __toESM(require("path"));
    fs11 = __toESM(require("fs"));
    init_attachmentManager();
  }
});

// src/tools/backupTools.ts
async function createZipArchive(sourceFiles, destinationPath) {
  return new Promise((resolve2) => {
    const output = import_fs.default.createWriteStream(destinationPath);
    const archive = (0, import_archiver.default)("zip", { zlib: { level: 9 } });
    let totalSize = 0;
    let hasError = false;
    archive.on("error", (err) => {
      hasError = true;
      resolve2({ success: false, error: `Archive creation failed: ${err.message}` });
    });
    output.on("error", (err) => {
      hasError = true;
      resolve2({ success: false, error: `Write failed: ${err.message}` });
    });
    output.on("close", () => {
      if (!hasError) {
        const stats = import_fs.default.statSync(destinationPath);
        resolve2({ success: true, size: stats.size });
      }
    });
    archive.pipe(output);
    for (const { filePath, archiveName } of sourceFiles) {
      try {
        const stat2 = import_fs.default.statSync(filePath);
        if (stat2.isFile()) {
          archive.file(filePath, { name: archiveName });
          totalSize += stat2.size;
        }
      } catch (err) {
        console.warn(`[Backup] File not found or inaccessible: ${filePath}`);
      }
    }
    const metadata = {
      version: "1.0",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      pluginVersion: "1.4.0",
      filesCount: sourceFiles.length,
      totalUncompressedSize: totalSize
    };
    archive.append(JSON.stringify(metadata, null, 2), { name: "backup-metadata.json" });
    archive.finalize();
  });
}
async function extractZipArchive(sourcePath, destinationDir) {
  try {
    const extractedFiles = [];
    const resolvedDestDir = import_path.default.resolve(destinationDir);
    await import_fs.default.createReadStream(sourcePath).pipe(import_unzipper.default.Parse()).on("entry", (entry) => {
      const entryPath = entry.path || entry.fileName;
      if (entry.type === "Directory") {
        entry.autodrain();
        return;
      }
      const targetPath = import_path.default.resolve(resolvedDestDir, entryPath);
      if (!targetPath.startsWith(resolvedDestDir + import_path.default.sep) && targetPath !== resolvedDestDir) {
        console.warn(`[Backup] Blocked path traversal attempt: ${entryPath}`);
        entry.autodrain();
        return;
      }
      const parentDir = import_path.default.dirname(targetPath);
      if (!import_fs.default.existsSync(parentDir)) {
        import_fs.default.mkdirSync(parentDir, { recursive: true });
      }
      entry.pipe(import_fs.default.createWriteStream(targetPath));
      entry.on("end", () => {
        extractedFiles.push(entryPath);
      });
    }).promise();
    return { success: true, extractedFiles };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Extraction failed: ${message}` };
  }
}
function registerBackupTools(config) {
  const tools = [];
  tools.push((0, import_sdk16.tool)({
    name: "create_backup",
    description: `Create a compressed backup of plugin state files.

BACKED UP FILES:
- .ai_toolbox_state.json (persistent tool execution state)
- .ai_toolbox_context.json (context memory entries from auto-summarize_context)

STORAGE LOCATION:
Backups are stored in .ai_toolbox_backups/ directory with timestamped filenames.

EXAMPLE USAGE:
{"destination": "my-custom-backup.zip"}
\u2192 Creates: .ai_toolbox_backups/my-custom-backup.zip`,
    parameters: {
      destination: import_zod16.z.string().max(256).describe("Custom backup filename (default: auto-generated with timestamp). Must end with .zip").optional(),
      includeState: import_zod16.z.boolean().default(true).describe("Include state persistence file (.ai_toolbox_state.json)"),
      includeContext: import_zod16.z.boolean().default(true).describe("Include context memory file (.ai_toolbox_context.json)")
    },
    implementation: async ({ destination, includeState, includeContext }) => {
      try {
        if (!includeState && !includeContext) {
          return {
            success: false,
            error: "At least one file type must be selected for backup (includeState or includeContext)"
          };
        }
        const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/T/, "-").replace(/:/g, "-").replace(/\..*/, "");
        const backupName = destination || `backup-${timestamp}.zip`;
        if (!backupName.endsWith(".zip")) {
          return {
            success: false,
            error: "Backup filename must end with .zip"
          };
        }
        if (!import_fs.default.existsSync(BACKUP_DIR)) {
          import_fs.default.mkdirSync(BACKUP_DIR, { recursive: true });
        }
        const backupPath = import_path.default.join(BACKUP_DIR, backupName);
        const filesToBackup = [];
        if (includeState) {
          const stateFile = import_path.default.join(process.cwd(), ".ai_toolbox_state.json");
          if (import_fs.default.existsSync(stateFile)) {
            filesToBackup.push({ filePath: stateFile, archiveName: ".ai_toolbox_state.json" });
          }
        }
        if (includeContext) {
          const contextFile = import_path.default.join(process.cwd(), ".ai_toolbox_context.json");
          if (import_fs.default.existsSync(contextFile)) {
            filesToBackup.push({ filePath: contextFile, archiveName: ".ai_toolbox_context.json" });
          }
        }
        if (filesToBackup.length === 0) {
          return {
            success: false,
            error: "No state files found to backup. The plugin may not have been used yet.",
            hint: "Use the plugin first to generate state files, then create a backup."
          };
        }
        const result = await createZipArchive(filesToBackup, backupPath);
        if (!result.success) {
          return { success: false, error: result.error };
        }
        return {
          success: true,
          message: `Backup created successfully`,
          backupPath,
          filename: backupName,
          filesBackedUp: filesToBackup.map((f) => f.archiveName),
          compressedSizeBytes: result.size,
          compressedSizeHuman: `${(result.size / 1024).toFixed(2)} KB`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Backup failed: ${message}`
        };
      }
    }
  }));
  tools.push((0, import_sdk16.tool)({
    name: "list_backups",
    description: `List all available backup files in the backups directory.

RETURNS:
- Array of backup objects with filename, path, size, and creation date
- Sorted by creation date (newest first)

EXAMPLE OUTPUT:
{
  "success": true,
  "backups": [
    {
      "filename": "backup-2026-05-30T19-45-00.zip",
      "path": ".ai_toolbox_backups/backup-2026-05-30T19-45-00.zip",
      "sizeBytes": 1234,
      "createdAt": "2026-05-30T19:45:00.000Z"
    }
  ]
}`,
    parameters: {
      sortBy: import_zod16.z.enum(["date", "size"]).default("date").describe('Sort order: "date" (newest first) or "size" (largest first)'),
      limit: import_zod16.z.number().int().min(1).max(1e3).default(50).describe("Maximum number of backups to return (default: 50)")
    },
    implementation: async ({ sortBy, limit }) => {
      try {
        if (!import_fs.default.existsSync(BACKUP_DIR)) {
          return {
            success: true,
            backups: [],
            message: "No backups directory found. Create a backup first using create_backup."
          };
        }
        const files = import_fs.default.readdirSync(BACKUP_DIR).filter((f) => f.toLowerCase().endsWith(".zip")).map((filename) => {
          const filePath = import_path.default.join(BACKUP_DIR, filename);
          const stats = import_fs.default.statSync(filePath);
          return {
            filename,
            path: filePath,
            sizeBytes: stats.size,
            createdAt: stats.mtime.toISOString()
          };
        });
        if (sortBy === "date") {
          files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === "size") {
          files.sort((a, b) => b.sizeBytes - a.sizeBytes);
        }
        const limitedFiles = files.slice(0, limit);
        return {
          success: true,
          backups: limitedFiles,
          totalCount: files.length,
          returnedCount: limitedFiles.length
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Failed to list backups: ${message}`
        };
      }
    }
  }));
  tools.push((0, import_sdk16.tool)({
    name: "restore_backup",
    description: `Restore state files from a backup archive.

\u26A0\uFE0F WARNING: This will OVERWRITE current state files!

RESTORED FILES:
- .ai_toolbox_state.json (if present in backup)
- .ai_toolbox_context.json (if present in backup)

SAFETY FEATURES:
- Requires explicit confirmation (confirm=true parameter)
- Creates temporary extraction directory
- Validates archive before restoration
- Reports which files were restored

EXAMPLE USAGE:
{
  "backupFile": "backup-2026-05-30T19-45-00.zip",
  "confirm": true
}
\u2192 Restores state files from specified backup`,
    parameters: {
      backupFile: import_zod16.z.string().max(256).describe('Backup filename to restore (e.g., "backup-2026-05-30T19-45-00.zip")'),
      confirm: import_zod16.z.boolean().default(false).describe("\u26A0\uFE0F MUST be true to confirm restoration. This is a safety check against accidental data loss.")
    },
    implementation: async ({ backupFile, confirm }) => {
      try {
        if (!confirm) {
          return {
            success: false,
            error: "\u26A0\uFE0F SAFETY CHECK FAILED",
            message: "Restoration not performed. Set confirm=true to proceed.",
            hint: 'This is intentional to prevent accidental data loss. Example: {"backupFile": "...", "confirm": true}'
          };
        }
        const backupPath = import_path.default.join(BACKUP_DIR, backupFile);
        if (!import_fs.default.existsSync(backupPath)) {
          return {
            success: false,
            error: `Backup file not found: ${backupFile}`,
            hint: "Use list_backups to see available backups."
          };
        }
        const tempDir = import_path.default.join(BACKUP_DIR, `.temp_restore_${Date.now()}`);
        import_fs.default.mkdirSync(tempDir, { recursive: true });
        try {
          const extractResult = await extractZipArchive(backupPath, tempDir);
          if (!extractResult.success) {
            return { success: false, error: extractResult.error };
          }
          const restorableFiles = [
            ".ai_toolbox_state.json",
            ".ai_toolbox_context.json"
          ];
          const restoredFiles = [];
          const missingFiles = [];
          for (const fileName of restorableFiles) {
            const sourcePath = import_path.default.join(tempDir, fileName);
            if (import_fs.default.existsSync(sourcePath)) {
              const destPath = import_path.default.join(process.cwd(), fileName);
              const content = import_fs.default.readFileSync(sourcePath);
              import_fs.default.writeFileSync(destPath, content);
              restoredFiles.push(fileName);
            } else {
              missingFiles.push(fileName);
            }
          }
          return {
            success: true,
            message: `Restored ${restoredFiles.length} file(s) from backup`,
            backupFile,
            restoredFiles,
            extractedFilesCount: extractResult.extractedFiles?.length || 0,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
        } finally {
          try {
            import_fs.default.rmSync(tempDir, { recursive: true, force: true });
          } catch (cleanupErr) {
            console.warn(`[Backup] Warning: Could not cleanup temp dir ${tempDir}`);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Restoration failed: ${message}`
        };
      }
    }
  }));
  tools.push((0, import_sdk16.tool)({
    name: "delete_backup",
    description: `Delete a backup file from the backups directory.

\u26A0\uFE0F WARNING: This action is IRREVERSIBLE!

SAFETY FEATURES:
- Requires explicit confirmation (confirm=true parameter)
- Validates file exists before deletion
- Only deletes .zip files from backup directory

EXAMPLE USAGE:
{
  "backupFile": "old-backup.zip",
  "confirm": true
}
\u2192 Permanently deletes the specified backup`,
    parameters: {
      backupFile: import_zod16.z.string().max(256).describe('Backup filename to delete (e.g., "old-backup.zip")'),
      confirm: import_zod16.z.boolean().default(false).describe("\u26A0\uFE0F MUST be true to confirm deletion. This is a safety check.")
    },
    implementation: async ({ backupFile, confirm }) => {
      try {
        if (!confirm) {
          return {
            success: false,
            error: "\u26A0\uFE0F SAFETY CHECK FAILED",
            message: "Deletion not performed. Set confirm=true to proceed.",
            hint: "This is intentional to prevent accidental data loss."
          };
        }
        if (!backupFile.toLowerCase().endsWith(".zip")) {
          return {
            success: false,
            error: "Only .zip backup files can be deleted"
          };
        }
        const backupPath = import_path.default.join(BACKUP_DIR, backupFile);
        if (!import_fs.default.existsSync(backupPath)) {
          return {
            success: false,
            error: `Backup file not found: ${backupFile}`
          };
        }
        import_fs.default.unlinkSync(backupPath);
        return {
          success: true,
          message: `Deleted backup: ${backupFile}`,
          deletedFile: backupFile,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Deletion failed: ${message}`
        };
      }
    }
  }));
  return tools;
}
var import_sdk16, import_zod16, import_fs, import_path, import_archiver, import_unzipper, BACKUP_DIR;
var init_backupTools = __esm({
  "src/tools/backupTools.ts"() {
    "use strict";
    import_sdk16 = require("@lmstudio/sdk");
    import_zod16 = require("zod");
    import_fs = __toESM(require("fs"));
    import_path = __toESM(require("path"));
    import_archiver = __toESM(require("archiver"));
    import_unzipper = __toESM(require("unzipper"));
    BACKUP_DIR = import_path.default.join(process.cwd(), ".ai_toolbox_backups");
  }
});

// src/toolsProvider.ts
function createToolsProvider(config) {
  return new ToolsProvider(config);
}
async function toolsProvider(ctl, lmClient) {
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const liveConfig = {
    fileSystem: pluginConfig.get("fileSystem"),
    webSearch: pluginConfig.get("webSearch"),
    browserAutomation: pluginConfig.get("browserAutomation"),
    gitOperations: pluginConfig.get("gitOperations"),
    databaseQueries: pluginConfig.get("databaseQueries"),
    documentParsing: pluginConfig.get("documentParsing"),
    backgroundCommands: pluginConfig.get("backgroundCommands"),
    imageProcessing: pluginConfig.get("imageProcessing"),
    httpClient: pluginConfig.get("httpClient"),
    vectorRAG: pluginConfig.get("vectorRAG"),
    uiGeneration: pluginConfig.get("uiGeneration"),
    contextManagement: pluginConfig.get("contextManagement"),
    godMode: pluginConfig.get("godMode"),
    documentRAG: pluginConfig.get("documentRAG"),
    retrievalLimit: pluginConfig.get("retrievalLimit"),
    retrievalAffinityThreshold: pluginConfig.get("retrievalAffinityThreshold"),
    executionJavaScript: pluginConfig.get("executionJavaScript"),
    executionPython: pluginConfig.get("executionPython"),
    executionTerminal: pluginConfig.get("executionTerminal"),
    executionShell: pluginConfig.get("executionShell"),
    searchFallbackChain: pluginConfig.get("searchFallbackChain"),
    maxSearchResults: pluginConfig.get("maxSearchResults"),
    safesearch: pluginConfig.get("safesearch"),
    browserTimeout: pluginConfig.get("browserTimeout"),
    headlessMode: pluginConfig.get("headlessMode"),
    gitAutoCommit: pluginConfig.get("gitAutoCommit"),
    defaultBranch: pluginConfig.get("defaultBranch"),
    pathValidationEnabled: pluginConfig.get("pathValidationEnabled"),
    binaryFileDetection: pluginConfig.get("binaryFileDetection"),
    regexReDoSProtection: pluginConfig.get("regexReDoSProtection"),
    maxRegexLength: pluginConfig.get("maxRegexLength"),
    statePersistenceEnabled: pluginConfig.get("statePersistenceEnabled"),
    stateMaxSize: pluginConfig.get("stateMaxSize"),
    language: pluginConfig.get("language"),
    notificationsEnabled: pluginConfig.get("notificationsEnabled"),
    temporalAwareness: pluginConfig.get("temporalAwareness"),
    dateFormatStyle: pluginConfig.get("dateFormatStyle"),
    // ContextGuard settings
    contextGuardEnabled: pluginConfig.get("contextGuardEnabled"),
    contextGuardTokenLimit: pluginConfig.get("contextGuardTokenLimit"),
    contextGuardSmartReading: pluginConfig.get("contextGuardSmartReading"),
    contextGuardSummaryModel: pluginConfig.get("contextGuardSummaryModel"),
    contextGuardTerminalFilterEnabled: pluginConfig.get("contextGuardTerminalFilterEnabled"),
    contextGuardTerminalFilterLength: pluginConfig.get("contextGuardTerminalFilterLength"),
    // Auto-tracking settings
    autoTrackingEnabled: pluginConfig.get("autoTrackingEnabled"),
    autoTrackDecisions: pluginConfig.get("autoTrackDecisions"),
    autoTrackCompletions: pluginConfig.get("autoTrackCompletions"),
    autoTrackErrors: pluginConfig.get("autoTrackErrors"),
    autoSummaryInterval: pluginConfig.get("autoSummaryInterval")
  };
  const provider = createToolsProvider(liveConfig);
  return provider.getAvailableTools();
}
var ToolRegistry, ToolsProvider;
var init_toolsProvider = __esm({
  "src/toolsProvider.ts"() {
    "use strict";
    init_config();
    init_stateManager();
    init_backgroundCommands();
    init_fileSystemTools();
    init_webResearchTools();
    init_gitGithubTools();
    init_browserAutomationTools();
    init_databaseTools();
    init_backgroundCommandTools();
    init_executionTools();
    init_utilityTools();
    init_imageProcessingTools();
    init_httpClientTools();
    init_vectorRagTools();
    init_uiGenerationTools();
    init_contextManagementTools();
    init_documentTools();
    init_backupTools();
    ToolRegistry = class {
      constructor() {
        this.toolMap = /* @__PURE__ */ new Map();
      }
      registerAll(config, stateManager, backgroundCommandManager, lmClient) {
        if (config.godMode || isToolEnabled(config, "fileSystem")) {
          registerFileSystemTools(config, stateManager).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "webSearch")) {
          registerWebResearchTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "browserAutomation")) {
          registerBrowserTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "gitOperations")) {
          registerGitTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "databaseQueries")) {
          registerDatabaseTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "documentParsing")) {
          registerDocumentTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "backgroundCommands")) {
          registerBackgroundCommandTools(config, backgroundCommandManager).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "imageProcessing")) {
          registerImageProcessingTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "httpClient")) {
          registerHttpClientTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "vectorRAG")) {
          registerRagTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "uiGeneration")) {
          registerUiGenerationTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        if (config.godMode || isToolEnabled(config, "contextManagement")) {
          registerContextManagementTools(config).forEach((t) => this.toolMap.set(t.name, t));
        }
        registerBackupTools(config).forEach((t) => this.toolMap.set(t.name, t));
        const execConfig = { ...config };
        const allExecTools = registerExecutionTools(execConfig);
        if (isExecutionToolEnabled(execConfig, "javascript")) {
          const jsTool = allExecTools.find((t) => t.name === "run_javascript");
          if (jsTool) this.toolMap.set(jsTool.name, jsTool);
        }
        if (isExecutionToolEnabled(execConfig, "python")) {
          const pyTool = allExecTools.find((t) => t.name === "run_python");
          if (pyTool) this.toolMap.set(pyTool.name, pyTool);
        }
        if (isExecutionToolEnabled(execConfig, "terminal")) {
          const termTool = allExecTools.find((t) => t.name === "run_in_terminal");
          if (termTool) this.toolMap.set(termTool.name, termTool);
        }
        if (isExecutionToolEnabled(execConfig, "shell")) {
          const shellTool = allExecTools.find((t) => t.name === "execute_command");
          if (shellTool) this.toolMap.set(shellTool.name, shellTool);
        }
        const getEnabledTools = () => Array.from(this.toolMap.keys());
        registerUtilityTools(config, stateManager, getEnabledTools).forEach((t) => this.toolMap.set(t.name, t));
        registerGetCurrentWorkingDirectoryTool().forEach((t) => this.toolMap.set(t.name, t));
      }
      getAll() {
        return Array.from(this.toolMap.values());
      }
      get(name) {
        return this.toolMap.get(name);
      }
      has(name) {
        return this.toolMap.has(name);
      }
    };
    ToolsProvider = class {
      constructor(config, lmClient) {
        this.config = config || DEFAULT_CONFIG;
        this.stateManager = new StateManager(this.config);
        this.backgroundCommandManager = new BackgroundCommandManager(this.config);
        this.registry = new ToolRegistry();
        this.registry.registerAll(this.config, this.stateManager, this.backgroundCommandManager, lmClient);
      }
      /**
       * Execute a tool by name with parameters.
       */
      async executeTool(toolName, params) {
        const tool16 = this.registry.get(toolName);
        if (!tool16) {
          return { success: false, error: `Tool '${toolName}' not found` };
        }
        try {
          const impl = tool16.implementation;
          const result = await impl(params);
          this.stateManager.set(`last_${toolName}`, result);
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { success: false, error: `Tool execution failed: ${message}` };
        }
      }
      /**
       * Get all available tools filtered by config.
       */
      getAvailableTools() {
        return this.registry.getAll();
      }
      /**
       * Get the state manager instance.
       */
      getStateManager() {
        return this.stateManager;
      }
      /**
       * Get the current configuration.
       */
      getConfig() {
        return this.config;
      }
    };
  }
});

// src/autoTracker.ts
var import_zod17, AutoTrackConfigSchema, DECISION_PATTERNS, COMPLETION_PATTERNS, ERROR_FIX_PATTERNS, AutoTracker, autoTracker;
var init_autoTracker = __esm({
  "src/autoTracker.ts"() {
    "use strict";
    import_zod17 = require("zod");
    AutoTrackConfigSchema = import_zod17.z.object({
      autoTrackingEnabled: import_zod17.z.boolean().default(false),
      autoTrackDecisions: import_zod17.z.boolean().default(true),
      autoTrackCompletions: import_zod17.z.boolean().default(true),
      autoTrackErrors: import_zod17.z.boolean().default(true),
      autoSummaryInterval: import_zod17.z.number().min(10).max(200).default(50)
    });
    DECISION_PATTERNS = [
      { pattern: /decided\s+(to|upon)/i, weight: 0.9 },
      { pattern: /conclusion[:\s]+/i, weight: 0.85 },
      { pattern: /final\s+decision/i, weight: 0.9 },
      { pattern: /going\s+with/i, weight: 0.7 },
      { pattern: /settled\s+on/i, weight: 0.75 },
      { pattern: /chose\s+to/i, weight: 0.7 }
    ];
    COMPLETION_PATTERNS = [
      { pattern: /successfully\s+(completed|finished)/i, weight: 0.9 },
      { pattern: /done\s+with/i, weight: 0.6 },
      { pattern: /completed\s+the/i, weight: 0.75 },
      { pattern: /finished\s+implementing/i, weight: 0.8 },
      { pattern: /implementation\s+complete/i, weight: 0.85 }
    ];
    ERROR_FIX_PATTERNS = [
      { pattern: /fixed\s+(the|a)/i, weight: 0.8 },
      { pattern: /resolved\s+the/i, weight: 0.8 },
      { pattern: /bug\s+fix/i, weight: 0.75 },
      { pattern: /error.*solved/i, weight: 0.7 },
      { pattern: /issue\s+(resolved|addressed)/i, weight: 0.75 }
    ];
    AutoTracker = class {
      // Minimum confidence to trigger tracking
      constructor(config) {
        this.messageCount = 0;
        this.MIN_CONFIDENCE = 0.6;
        this.config = {
          autoTrackingEnabled: false,
          autoTrackDecisions: true,
          autoTrackCompletions: true,
          autoTrackErrors: true,
          autoSummaryInterval: 50,
          ...config
        };
        console.log(`[AutoTracker] Initialized with config:`, this.config);
      }
      /** Update configuration dynamically */
      updateConfig(partial) {
        this.config = { ...this.config, ...partial };
        console.log(`[AutoTracker] Config updated:`, this.config);
      }
      /**
       * Analyze a message for auto-tracking triggers.
       * Returns array of detected actions (can be multiple).
       */
      analyzeMessage(message) {
        const actions = [];
        if (!this.config.autoTrackingEnabled) {
          return actions;
        }
        if (this.config.autoTrackDecisions) {
          const decisionMatch = this.detectPattern(message, DECISION_PATTERNS);
          if (decisionMatch) {
            actions.push({
              type: "decision",
              content: this.extractContent(message, decisionMatch.pattern),
              originalMessage: message.slice(0, 500),
              // Truncate for storage
              confidence: decisionMatch.weight ?? 0
            });
          }
        }
        if (this.config.autoTrackCompletions) {
          const completionMatch = this.detectPattern(message, COMPLETION_PATTERNS);
          if (completionMatch) {
            actions.push({
              type: "completion",
              content: this.extractContent(message, completionMatch.pattern),
              originalMessage: message.slice(0, 500),
              confidence: completionMatch.weight ?? 0
            });
          }
        }
        if (this.config.autoTrackErrors) {
          const errorMatch = this.detectPattern(message, ERROR_FIX_PATTERNS);
          if (errorMatch) {
            actions.push({
              type: "error_fix",
              content: this.extractContent(message, errorMatch.pattern),
              originalMessage: message.slice(0, 500),
              confidence: errorMatch.weight ?? 0
            });
          }
        }
        this.messageCount++;
        if (this.messageCount % this.config.autoSummaryInterval === 0) {
          console.log(`[AutoTracker] Session summary interval reached: ${this.messageCount} messages`);
        }
        return actions;
      }
      /**
       * Detect if any pattern matches the text.
       * Returns highest-weight match or null.
       */
      detectPattern(text, patterns) {
        let bestMatch = null;
        for (const { pattern, weight } of patterns) {
          if (pattern.test(text)) {
            if (!bestMatch || weight > (bestMatch.weight ?? 0)) {
              bestMatch = { pattern, weight };
            }
          }
        }
        return bestMatch?.weight !== void 0 && bestMatch.weight >= this.MIN_CONFIDENCE ? bestMatch : null;
      }
      /**
       * Extract meaningful content around the matched pattern.
       */
      extractContent(text, pattern) {
        const match = text.match(pattern);
        if (!match) return text.slice(0, 200);
        const startPos = Math.max(0, match.index - 50);
        const endPos = text.indexOf(".", match[0].length) + 1;
        return text.slice(startPos, endPos || startPos + 200).trim();
      }
      /**
       * Get current message count (for session summary tracking).
       */
      getMessageCount() {
        return this.messageCount;
      }
      /**
       * Reset message counter (e.g., new chat session).
       */
      resetCounter() {
        this.messageCount = 0;
        console.log(`[AutoTracker] Message counter reset`);
      }
      /**
       * Get configuration.
       */
      getConfig() {
        return { ...this.config };
      }
    };
    autoTracker = new AutoTracker();
  }
});

// src/promptPreprocessor.ts
function getCachedDateTime() {
  const now = Date.now();
  if (cachedDateTimeData && now - cacheTimestamp < CACHE_DURATION_MS) {
    return cachedDateTimeData;
  }
  const date = /* @__PURE__ */ new Date();
  const compact = date.toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  const full = date.toLocaleString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) + " Uhr";
  cachedDateTimeData = { compact, full };
  cacheTimestamp = now;
  return cachedDateTimeData;
}
function getTemporalSuffix(ctl) {
  const config = ctl.getPluginConfig(configSchematics);
  const temporalAwarenessEnabled = config.get("temporalAwareness") ?? true;
  if (!temporalAwarenessEnabled) {
    return "";
  }
  const style = config.get("dateFormatStyle") ?? "standard";
  const { compact, full } = getCachedDateTime();
  console.log(`[TEMPORAL] Injecting: ${style === "heuteIst" ? `HEUTE IST ${full}` : `[Zeit: ${compact}]`}`);
  if (style === "heuteIst") {
    return `

HEUTE IST ${full}`;
  }
  return `

[Zeit: ${compact}]`;
}
function detectDirectoryPath(text) {
  const withoutUrls = text.replace(/https?:\/\/[^\s]+|www\.[^\s]+|file:\/\/[^\s]+/g, "");
  const winMatch = withoutUrls.match(/[A-Za-z]:\\[\w\-_. \\]+/);
  if (winMatch) return winMatch[0].trim();
  const unixMatch = withoutUrls.match(/(?:^|\s)(\/[\w\-_. ]{2,})/);
  if (unixMatch) {
    const path13 = unixMatch[1].trim();
    if (!path13.startsWith("/ ") && !path13.includes(" ")) {
      return path13;
    }
  }
  const relMatch = withoutUrls.match(/(?:^|\s)(?:\.\/|\.\\.\/|\.\.\/)[\w\-_. ]+/);
  if (relMatch) return relMatch[0].trim();
  return null;
}
function injectWorkingDirectoryPrompt(originalMessage, detectedPath) {
  const instruction = `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u26A0\uFE0F WORKING DIRECTORY DETECTED
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

The user mentioned a directory path in their message:

    ${detectedPath}

Please ask the user for confirmation before changing the working directory.
Example response:

"I noticed you mentioned the directory '${detectedPath}'. 
Would you like me to set this as your working directory? 
All subsequent file operations will use this directory as the base.

Reply 'yes' or 'ja' to confirm, or 'no'/'nein' to decline."

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

User's original message:
${originalMessage}
`;
  return instruction.trim();
}
async function extractPdfText(fileHandle) {
  try {
    const buffer = await fileHandle.readFile ? await fileHandle.readFile() : Buffer.from(await fileHandle.read());
    const data = await (0, import_pdf_parse.default)(buffer);
    return data.text.trim();
  } catch (error) {
    console.error(`[RAG] Error extracting text from PDF ${fileHandle.name}:`, error);
    throw new Error(`Failed to parse PDF: ${fileHandle.name}`);
  }
}
function chunkText2(text, chunkSize = 1e3, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];
  if (words.length <= chunkSize) {
    return [text];
  }
  let startIndex = 0;
  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkText3 = words.slice(startIndex, endIndex).join(" ");
    chunks.push(chunkText3);
    startIndex = endIndex - overlap;
  }
  return chunks.filter((c) => c.trim().length > 0);
}
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
async function retrieveFromPdfs(ctl, query, pdfFiles) {
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const retrievalLimit = pluginConfig.get("retrievalLimit") || 5;
  const retrievalAffinityThreshold = pluginConfig.get("retrievalAffinityThreshold") ?? 0.3;
  console.log(`[RAG] Processing ${pdfFiles.length} PDF file(s)`);
  const fileTexts = [];
  for (const file of pdfFiles) {
    try {
      const text = await extractPdfText(file);
      if (text.length > 0) {
        console.log(`[RAG] Extracted ${text.length} chars from ${file.name}`);
        fileTexts.push({ file, text });
      } else {
        console.warn(`[RAG] No text extracted from ${file.name}`);
      }
    } catch (error) {
      console.error(`[RAG] Skipping PDF ${file.name} due to error:`, error);
    }
  }
  if (fileTexts.length === 0) {
    console.warn("[RAG] No text extracted from any PDF");
    return [];
  }
  const chunks = [];
  for (const { file, text } of fileTexts) {
    const fileChunks = chunkText2(text);
    console.log(`[RAG] ${file.name}: ${text.length} chars \u2192 ${fileChunks.length} chunks`);
    fileChunks.forEach((chunk) => {
      chunks.push({ file, chunk });
    });
  }
  if (chunks.length === 0) return [];
  let model;
  try {
    console.log("[RAG] Loading embedding model...");
    model = await ctl.client.embedding.model("nomic-ai/nomic-embed-text-v1.5-GGUF", {
      signal: ctl.abortSignal
    });
    console.log("[RAG] Embedding model loaded successfully");
  } catch (error) {
    console.error("[RAG] Failed to load embedding model:", error);
    throw new Error(`Embedding model not available: ${error}`);
  }
  const batchSize = 32;
  const allEmbeddings = [];
  try {
    for (let i = 0; i < chunks.length; i += batchSize) {
      console.log(`[RAG] Generating embeddings batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}...`);
      const batch = chunks.slice(i, i + batchSize).map((c) => c.chunk);
      const embeddingsResult = await model.embed(batch);
      allEmbeddings.push(...embeddingsResult.map((e) => e.embedding));
    }
  } catch (error) {
    console.error("[RAG] Error generating embeddings:", error);
    throw new Error(`Embedding generation failed: ${error}`);
  }
  let queryModel;
  try {
    queryModel = await ctl.client.embedding.model("nomic-ai/nomic-embed-text-v1.5-GGUF", {
      signal: ctl.abortSignal
    });
  } catch (error) {
    console.error("[RAG] Failed to load query embedding model:", error);
    throw new Error(`Query embedding failed: ${error}`);
  }
  let queryEmbedding;
  try {
    const queryResult = await queryModel.embed([query]);
    queryEmbedding = queryResult[0].embedding;
  } catch (error) {
    console.error("[RAG] Error generating query embedding:", error);
    throw new Error(`Query embedding failed: ${error}`);
  }
  const scores = [];
  for (let i = 0; i < chunks.length; i++) {
    const similarity = cosineSimilarity(queryEmbedding, allEmbeddings[i]);
    scores.push({ chunkIndex: i, similarity });
  }
  scores.sort((a, b) => b.similarity - a.similarity);
  console.log(`[RAG] Found ${scores.length} chunks, filtering with threshold ${retrievalAffinityThreshold}`);
  const relevantChunks = scores.filter(
    (s) => s.similarity >= retrievalAffinityThreshold && s.chunkIndex < chunks.length
  );
  const limitedResults = relevantChunks.slice(0, retrievalLimit);
  console.log(`[RAG] Returning ${limitedResults.length} results`);
  return limitedResults.map((r) => ({
    content: chunks[r.chunkIndex].chunk,
    score: r.similarity
  }));
}
async function preprocess(ctl, userMessage) {
  const userPrompt = userMessage.getText();
  if (contextGuard) {
    try {
      const history = await ctl.pullHistory();
      history.append(userMessage);
      const messages = history.getMessagesArray();
      const tokenCount = await contextGuard.countTokens(messages);
      const threshold = contextGuard.getThreshold();
      if (tokenCount > threshold) {
        console.log(`[ContextGuard] Token count ${tokenCount} exceeds threshold ${threshold}, compressing...`);
        const compressedMessages = await contextGuard.compressHistory(messages);
        while (history.getLength() > 0) {
          history.pop();
        }
        compressedMessages.forEach((msg) => history.append(msg));
        contextGuard.resetTokenCache();
      }
    } catch (e) {
      console.warn("[ContextGuard] Auto-compression failed:", e);
    }
  }
  try {
    const pluginConfig2 = ctl.getPluginConfig(configSchematics);
    const autoTrackingEnabled = pluginConfig2.get("autoTrackingEnabled") ?? false;
    if (autoTrackingEnabled) {
      autoTracker.updateConfig({
        autoTrackingEnabled: true,
        autoTrackDecisions: pluginConfig2.get("autoTrackDecisions") ?? true,
        autoTrackCompletions: pluginConfig2.get("autoTrackCompletions") ?? true,
        autoTrackErrors: pluginConfig2.get("autoTrackErrors") ?? true,
        autoSummaryInterval: pluginConfig2.get("autoSummaryInterval") ?? 50
      });
      const actions = autoTracker.analyzeMessage(userPrompt);
      if (actions.length > 0) {
        console.log(`[Auto-Track] Detected ${actions.length} event(s):`, actions.map((a) => `${a.type} (${a.confidence.toFixed(2)})`).join(", "));
      }
    } else {
      autoTracker.updateConfig({
        autoTrackingEnabled: false
      });
    }
  } catch (e) {
    console.warn("[Auto-Track] Analysis failed:", e);
  }
  const allFiles = userMessage.getFiles(ctl.client);
  setAttachments(allFiles);
  let attachmentNotice = "";
  if (allFiles.length > 0) {
    const fileNames = listAttachments();
    attachmentNotice = `

\u{1F4CE} ATTACHED FILES AVAILABLE:
You have access to the following attached files. You can read them using the read_document tool by filename:
${fileNames.map((name) => `- ${name}`).join("\n")}`;
  }
  const detectedPath = detectDirectoryPath(userPrompt);
  if (detectedPath) {
    return injectWorkingDirectoryPrompt(userPrompt + attachmentNotice, detectedPath) + getTemporalSuffix(ctl);
  }
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const documentRAGEnabled = pluginConfig.get("documentRAG");
  console.log(`[RAG] documentRAG enabled: ${documentRAGEnabled}`);
  if (!documentRAGEnabled) {
    const base2 = userPrompt + attachmentNotice;
    return base2 + getTemporalSuffix(ctl);
  }
  const newFiles = allFiles.filter((f) => f.type !== "image");
  console.log(`[RAG] Found ${newFiles.length} non-image files`);
  if (newFiles.length === 0) {
    const base2 = userPrompt + attachmentNotice;
    return base2 + getTemporalSuffix(ctl);
  }
  const pdfFiles = newFiles.filter((f) => f.name.toLowerCase().endsWith(".pdf"));
  const otherFiles = newFiles.filter((f) => !f.name.toLowerCase().endsWith(".pdf"));
  console.log(`[RAG] PDFs: ${pdfFiles.length}, Other: ${otherFiles.length}`);
  let allResults = [];
  if (pdfFiles.length > 0) {
    try {
      const pdfResults = await retrieveFromPdfs(ctl, userPrompt, pdfFiles);
      console.log(`[RAG] PDF retrieval returned ${pdfResults.length} results`);
      allResults.push(...pdfResults);
    } catch (error) {
      console.error("[RAG] Error processing PDFs:", error);
    }
  }
  if (otherFiles.length > 0) {
    try {
      const model = await ctl.client.embedding.model("nomic-ai/nomic-embed-text-v1.5-GGUF", {
        signal: ctl.abortSignal
      });
      const result = await ctl.client.files.retrieve(userPrompt, otherFiles, {
        embeddingModel: model,
        limit: pluginConfig.get("retrievalLimit") || 5,
        signal: ctl.abortSignal
      });
      const filteredEntries = result.entries.filter(
        (entry) => entry.score > (pluginConfig.get("retrievalAffinityThreshold") ?? 0.3)
      );
      console.log(`[RAG] Native retrieval returned ${filteredEntries.length} results`);
      allResults.push(...filteredEntries.map((e) => ({ content: e.content, score: e.score })));
    } catch (error) {
      console.error("[RAG] Error retrieving from other files:", error);
    }
  }
  allResults.sort((a, b) => b.score - a.score);
  const retrievalLimit = pluginConfig.get("retrievalLimit") || 5;
  allResults = allResults.slice(0, retrievalLimit);
  console.log(`[RAG] Total results after sorting: ${allResults.length}`);
  if (allResults.length > 0) {
    let contextInjection = "";
    for (const result of allResults) {
      contextInjection += `
${result.content}
---
`;
    }
    return `${userPrompt}${attachmentNotice}

--- RELEVANT DOCUMENT CONTEXT ---
${contextInjection.trim()}` + getTemporalSuffix(ctl);
  }
  console.log("[RAG] No relevant results found");
  const base = userPrompt + attachmentNotice;
  return base + getTemporalSuffix(ctl);
}
var import_pdf_parse, cachedDateTimeData, CACHE_DURATION_MS, contextGuard, cacheTimestamp;
var init_promptPreprocessor = __esm({
  "src/promptPreprocessor.ts"() {
    "use strict";
    init_config();
    import_pdf_parse = __toESM(require("pdf-parse"));
    init_attachmentManager();
    init_autoTracker();
    cachedDateTimeData = null;
    CACHE_DURATION_MS = 5 * 60 * 1e3;
    contextGuard = null;
    cacheTimestamp = 0;
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  main: () => main
});
function main(context) {
  logger2.info("Initializing...");
  context.withConfigSchematics(configSchematics);
  context.withPromptPreprocessor(preprocess);
  context.withToolsProvider(toolsProvider);
  if (typeof process.on === "function") {
    process.on("SIGTERM", async () => {
      await cleanupBrowserSession();
    });
    process.on("SIGINT", async () => {
      await cleanupBrowserSession();
    });
  }
  logger2.info("Initialized successfully!");
}
var logger2;
var init_src = __esm({
  "src/index.ts"() {
    "use strict";
    init_toolsProvider();
    init_config();
    init_promptPreprocessor();
    init_browserAutomationTools();
    logger2 = {
      info: (msg) => typeof process.stdout.write === "function" && process.stdout.write(`[AI Toolbox] ${msg}
`),
      warn: (msg) => typeof process.stderr.write === "function" && process.stderr.write(`[AI Toolbox WARN] ${msg}
`),
      error: (msg) => typeof process.stderr.write === "function" && process.stderr.write(`[AI Toolbox ERROR] ${msg}
`)
    };
  }
});

// .lmstudio/entry.ts
var import_sdk17 = require("@lmstudio/sdk");
var clientIdentifier = process.env.LMS_PLUGIN_CLIENT_IDENTIFIER;
var clientPasskey = process.env.LMS_PLUGIN_CLIENT_PASSKEY;
var baseUrl = process.env.LMS_PLUGIN_BASE_URL;
var client = new import_sdk17.LMStudioClient({
  clientIdentifier,
  clientPasskey,
  baseUrl
});
globalThis.__LMS_PLUGIN_CONTEXT = true;
var predictionLoopHandlerSet = false;
var promptPreprocessorSet = false;
var configSchematicsSet = false;
var globalConfigSchematicsSet = false;
var toolsProviderSet = false;
var generatorSet = false;
var selfRegistrationHost = client.plugins.getSelfRegistrationHost();
var pluginContext = {
  withPredictionLoopHandler: (generate) => {
    if (predictionLoopHandlerSet) {
      throw new Error("PredictionLoopHandler already registered");
    }
    if (toolsProviderSet) {
      throw new Error("PredictionLoopHandler cannot be used with a tools provider");
    }
    predictionLoopHandlerSet = true;
    selfRegistrationHost.setPredictionLoopHandler(generate);
    return pluginContext;
  },
  withPromptPreprocessor: (preprocess2) => {
    if (promptPreprocessorSet) {
      throw new Error("PromptPreprocessor already registered");
    }
    promptPreprocessorSet = true;
    selfRegistrationHost.setPromptPreprocessor(preprocess2);
    return pluginContext;
  },
  withConfigSchematics: (configSchematics2) => {
    if (configSchematicsSet) {
      throw new Error("Config schematics already registered");
    }
    configSchematicsSet = true;
    selfRegistrationHost.setConfigSchematics(configSchematics2);
    return pluginContext;
  },
  withGlobalConfigSchematics: (globalConfigSchematics) => {
    if (globalConfigSchematicsSet) {
      throw new Error("Global config schematics already registered");
    }
    globalConfigSchematicsSet = true;
    selfRegistrationHost.setGlobalConfigSchematics(globalConfigSchematics);
    return pluginContext;
  },
  withToolsProvider: (toolsProvider2) => {
    if (toolsProviderSet) {
      throw new Error("Tools provider already registered");
    }
    if (predictionLoopHandlerSet) {
      throw new Error("Tools provider cannot be used with a predictionLoopHandler");
    }
    toolsProviderSet = true;
    selfRegistrationHost.setToolsProvider(toolsProvider2);
    return pluginContext;
  },
  withGenerator: (generator) => {
    if (generatorSet) {
      throw new Error("Generator already registered");
    }
    generatorSet = true;
    selfRegistrationHost.setGenerator(generator);
    return pluginContext;
  }
};
Promise.resolve().then(() => (init_src(), src_exports)).then(async (module2) => {
  return await module2.main(pluginContext);
}).then(() => {
  selfRegistrationHost.initCompleted();
}).catch((error) => {
  console.error("Failed to execute the main function of the plugin.");
  console.error(error);
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kQ29tbWFuZHMudHMiLCAiLi4vc3JjL3dvcmtpbmdEaXIudHMiLCAiLi4vc3JjL3NlY3VyaXR5LnRzIiwgIi4uL3NyYy9wZXJmb3JtYW5jZVV0aWxzLnRzIiwgIi4uL3NyYy90b29scy9maWxlU3lzdGVtVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2dpdEdpdGh1YlRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9kYXRhYmFzZVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9leGVjdXRpb25Ub29scy50cyIsICIuLi9zcmMvdG9vbHMvdXRpbGl0eVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvaHR0cENsaWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy92ZWN0b3JSYWdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMudHMiLCAiLi4vc3JjL2F0dGFjaG1lbnRNYW5hZ2VyLnRzIiwgIi4uL3NyYy90b29scy9kb2N1bWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9iYWNrdXBUb29scy50cyIsICIuLi9zcmMvdG9vbHNQcm92aWRlci50cyIsICIuLi9zcmMvYXV0b1RyYWNrZXIudHMiLCAiLi4vc3JjL3Byb21wdFByZXByb2Nlc3Nvci50cyIsICIuLi9zcmMvaW5kZXgudHMiLCAiZW50cnkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBjcmVhdGVDb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5cblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBab2QgU2NoZW1hICh2YWxpZGF0aW9uKSA9PT09PT09PT09PT09PT09PT09PVxuXG5cblxuZXhwb3J0IGNvbnN0IENvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcblxuICAvLyBUb29sIEdhdGluZyAoZW5hYmxlL2Rpc2FibGUgaW5kaXZpZHVhbCB0b29scylcblxuICBmaWxlU3lzdGVtOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIHdlYlNlYXJjaDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICBicm93c2VyQXV0b21hdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cbiAgZ2l0T3BlcmF0aW9uczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cbiAgZGF0YWJhc2VRdWVyaWVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcblxuICBkb2N1bWVudFBhcnNpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYmFja2dyb3VuZENvbW1hbmRzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIGltYWdlUHJvY2Vzc2luZzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGltYWdlIE9DUiwgc2NyZWVuc2hvdCwgYW5kIGNvbXBhcmlzb24gdG9vbHMnKSxcblxuICBodHRwQ2xpZW50OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnRW5hYmxlIGdlbmVyaWMgSFRUUCBjbGllbnQgZm9yIFJFU1QgQVBJIGNhbGxzJyksXG5cbiAgdmVjdG9yUkFHOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgc2VtYW50aWMgc2VhcmNoIHdpdGggdmVjdG9yIGVtYmVkZGluZ3MnKSxcbiAgdWlHZW5lcmF0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnRW5hYmxlIGludGVyYWN0aXZlIFVJIGdlbmVyYXRpb24gYW5kIHJlbmRlcmluZyB0b29scycpLFxuICBjb250ZXh0TWFuYWdlbWVudDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGF1dG9tYXRpYyBjb250ZXh0IHRyYWNraW5nIGFuZCBtZW1vcnkgbWFuYWdlbWVudCcpLFxuXG5cblxuICAvLyBcdTI1MDBcdTI1MDAgXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIGdvZE1vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdcdTI2QTBcdUZFMEYgV0FSTklORzogRW5hYmxlcyBldmVyeSB0b29sIGNhdGVnb3J5LiBVc2Ugd2l0aCBjYXV0aW9uLicpLFxuXG5cblxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNEXHVEQ0RBIERPQ1VNRU5UIFJBRyAvIENIQVQgV0lUSCBGSUxFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBkb2N1bWVudFJBRzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGZpbGUgaW5kZXhpbmcgYW5kIHNlbWFudGljIHNlYXJjaCBmb3IgY2hhdCcpLFxuXG4gIHJldHJpZXZhbExpbWl0OiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMjApLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIHJlbGV2YW50IGNodW5rcyB0byByZXRyaWV2ZScpLFxuXG4gIHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkOiB6Lm51bWJlcigpLm1pbigwLjApLm1heCgxLjApLmRlZmF1bHQoMC41KS5kZXNjcmliZSgnTWluaW11bSBzaW1pbGFyaXR5IHNjb3JlIGZvciBhIGNodW5rIHRvIGJlIGNvbnNpZGVyZWQgcmVsZXZhbnQgKDAtMSknKSxcblxuICAvLyBFeGVjdXRpb24gdG9vbHMgXHUyMDE0IGluZGl2aWR1YWwgdG9nZ2xlcyAoZ3JhbnVsYXIgY29udHJvbClcblxuICBleGVjdXRpb25KYXZhU2NyaXB0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnQWxsb3cgcnVuX2phdmFzY3JpcHQgdG9vbCcpLFxuXG4gIGV4ZWN1dGlvblB5dGhvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9weXRob24gdG9vbCcpLFxuXG4gIGV4ZWN1dGlvblRlcm1pbmFsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnQWxsb3cgcnVuX2luX3Rlcm1pbmFsIHRvb2wnKSxcblxuICBleGVjdXRpb25TaGVsbDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnQWxsb3cgZXhlY3V0ZV9jb21tYW5kIHRvb2wnKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFdlYiBTZWFyY2ggU2V0dGluZ3MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgc2VhcmNoRmFsbGJhY2tDaGFpbjogei5lbnVtKFsnZGRnLWFwaScsICdkZGctZmV0Y2gnLCAnZ29vZ2xlJywgJ2JpbmcnXSkuZGVmYXVsdCgnZGRnLWFwaScpLmRlc2NyaWJlKCdQcmltYXJ5IHNlYXJjaCBlbmdpbmUgKGF1dG8tZmFsbGJhY2sgdG8gb3RoZXJzKScpLFxuXG4gIG1heFNlYXJjaFJlc3VsdHM6IHoubnVtYmVyKCkubWluKDEpLm1heCg1MCkuZGVmYXVsdCgxMCksXG5cbiAgc2FmZXNlYXJjaDogei5lbnVtKFsnMCcsICcxJywgJzInXSkuZGVmYXVsdCgnMScpLFxuXG5cblxuICAvLyBcdTI1MDBcdTI1MDAgQnJvd3NlciBTZXR0aW5ncyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBicm93c2VyVGltZW91dDogei5udW1iZXIoKS5taW4oMTAwMCkubWF4KDMwMDAwKS5kZWZhdWx0KDUwMDApLFxuXG4gIGhlYWRsZXNzTW9kZTogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ1J1biBicm93c2VyIHdpdGhvdXQgR1VJJyksXG5cblxuXG4gIC8vIEdpdCBTZXR0aW5nc1xuXG4gIGdpdEF1dG9Db21taXQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuXG4gIGRlZmF1bHRCcmFuY2g6IHouc3RyaW5nKCkuZGVmYXVsdCgnbWFpbicpLFxuXG5cblxuICAvLyBTZWN1cml0eSBTZXR0aW5nc1xuXG4gIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICBiaW5hcnlGaWxlRGV0ZWN0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIHJlZ2V4UmVEb1NQcm90ZWN0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIG1heFJlZ2V4TGVuZ3RoOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMTAwMCkuZGVmYXVsdCg1MDApLFxuXG5cblxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50XG5cbiAgc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgc3RhdGVNYXhTaXplOiB6Lm51bWJlcigpLm1pbigxMDI0KS5tYXgoMTA0ODU3NikuZGVmYXVsdCgxMDI0MCksXG5cblxuXG4gIC8vIGkxOG4gU2V0dGluZ3NcblxuICBsYW5ndWFnZTogei5lbnVtKFsnZW4nLCAnZGUnLCAnemgtQ04nLCAnemgtVFcnXSkuZGVmYXVsdCgnZW4nKSxcblxuXG5cbiAgLy8gTm90aWZpY2F0aW9uIFNldHRpbmdzXG5cbiAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgLy8gVGVtcG9yYWwgQXdhcmVuZXNzIChtZXJnZWQgZnJvbSB1cF90b19kYXRlKVxuICB0ZW1wb3JhbEF3YXJlbmVzczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGF1dG9tYXRpYyBkYXRlL3RpbWUgaW5qZWN0aW9uIGludG8gcHJvbXB0cycpLFxuICBkYXRlRm9ybWF0U3R5bGU6IHouZW51bShbJ3N0YW5kYXJkJywgJ2hldXRlSXN0J10pLmRlZmF1bHQoJ3N0YW5kYXJkJykuZGVzY3JpYmUoJ0RhdGUgZm9ybWF0IHN0eWxlIGZvciB0ZW1wb3JhbCBhd2FyZW5lc3MnKSxcblxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNFXHVEREUwIENPTlRFWFQgR1VBUkQgU0VUVElOR1MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIGNvbnRleHRHdWFyZEVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBDb250ZXh0R3VhcmQgdG9rZW4gbWFuYWdlbWVudCBhbmQgaGlzdG9yeSBjb21wcmVzc2lvbicpLFxuICBjb250ZXh0R3VhcmRUb2tlbkxpbWl0OiB6Lm51bWJlcigpLm1pbigxMDAwKS5tYXgoMjAwMDAwKS5kZWZhdWx0KDgwMDAwKS5kZXNjcmliZSgnVG9rZW4gbGltaXQgYmVmb3JlIGhpc3RvcnkgY29tcHJlc3Npb24gdHJpZ2dlcnMgKDkwJSB0aHJlc2hvbGQpJyksXG4gIGNvbnRleHRHdWFyZFNtYXJ0UmVhZGluZzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGtleXdvcmQtYmFzZWQgc21hcnQgZmlsZSByZWFkaW5nJyksXG4gIGNvbnRleHRHdWFyZFN1bW1hcnlNb2RlbDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKS5kZXNjcmliZSgnTE0gU3R1ZGlvIG1vZGVsIG5hbWUgZm9yIHN1bW1hcml6YXRpb24gKGxlYXZlIGVtcHR5IHRvIHVzZSBjdXJyZW50IGNoYXQgbW9kZWwpJyksXG4gIGNvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyRW5hYmxlZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIHRlcm1pbmFsIG91dHB1dCBmaWx0ZXJpbmcnKSxcbiAgY29udGV4dEd1YXJkVGVybWluYWxGaWx0ZXJMZW5ndGg6IHoubnVtYmVyKCkubWluKDEwMCkubWF4KDIwMDAwKS5kZWZhdWx0KDIwMDApLmRlc2NyaWJlKCdNYXggY2hhcnMgYmVmb3JlIHRlcm1pbmFsIG91dHB1dCBpcyBmaWx0ZXJlZCcpLFxuXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0VcdUREMTYgQVVUTy1UUkFDS0lORyBTRVRUSU5HUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgYXV0b1RyYWNraW5nRW5hYmxlZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGF1dG9tYXRpYyB0cmFja2luZyBvZiBpbXBvcnRhbnQgZXZlbnRzIGluIGNvbnZlcnNhdGlvbicpLFxuICBhdXRvVHJhY2tEZWNpc2lvbnM6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0F1dG8tdHJhY2sgZGVjaXNpb25zIGFuZCBjb25jbHVzaW9ucyAoXCJJIGRlY2lkZWRcIiwgXCJjb25jbHVzaW9uXCIpJyksXG4gIGF1dG9UcmFja0NvbXBsZXRpb25zOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdBdXRvLXRyYWNrIHRhc2sgY29tcGxldGlvbnMgKFwic3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZFwiLCBcImZpbmlzaGVkXCIpJyksXG4gIGF1dG9UcmFja0Vycm9yczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnQXV0by10cmFjayBidWcgZml4ZXMgYW5kIGVycm9yIHJlc29sdXRpb25zIChcImZpeGVkIHRoZSBidWdcIiknKSxcbiAgYXV0b1N1bW1hcnlJbnRlcnZhbDogei5udW1iZXIoKS5taW4oMTApLm1heCgyMDApLmRlZmF1bHQoNTApLmRlc2NyaWJlKCdNZXNzYWdlcyBiZXR3ZWVuIGF1dG9tYXRpYyBzZXNzaW9uIHN1bW1hcmllcycpLFxufSk7XG5cblxuXG5leHBvcnQgdHlwZSBQbHVnaW5Db25maWcgPSB6LmluZmVyPHR5cGVvZiBDb25maWdTY2hlbWE+O1xuXG5cblxuLyoqXG5cbiAqIERlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3RcblxuICovXG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTkZJRzogUGx1Z2luQ29uZmlnID0ge1xuXG4gIGZpbGVTeXN0ZW06IHRydWUsXG5cbiAgd2ViU2VhcmNoOiB0cnVlLFxuXG4gIGJyb3dzZXJBdXRvbWF0aW9uOiBmYWxzZSxcblxuICBnaXRPcGVyYXRpb25zOiBmYWxzZSxcblxuICBkYXRhYmFzZVF1ZXJpZXM6IGZhbHNlLFxuXG4gIGRvY3VtZW50UGFyc2luZzogdHJ1ZSxcblxuICBiYWNrZ3JvdW5kQ29tbWFuZHM6IGZhbHNlLFxuXG5cblxuICAvLyBcdTI2QTBcdUZFMEYgR09EIE1PREUgKEVuYWJsZSBBTEwgdG9vbHMgYXQgb25jZSkgXHUyNkEwXHVGRTBGXG5cbiAgZ29kTW9kZTogZmFsc2UsXG5cblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0NcdUREOTUgTkVXIFRPT0wgQ0FURUdPUklFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBpbWFnZVByb2Nlc3Npbmc6IHRydWUsXG5cbiAgaHR0cENsaWVudDogZmFsc2UsXG5cbiAgdmVjdG9yUkFHOiB0cnVlLFxuICB1aUdlbmVyYXRpb246IGZhbHNlLFxuICBjb250ZXh0TWFuYWdlbWVudDogdHJ1ZSxcblxuXG5cbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjZBMFx1RkUwRlxuXG4gIGRvY3VtZW50UkFHOiB0cnVlLFxuXG4gIHJldHJpZXZhbExpbWl0OiA1LFxuXG4gIHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkOiAwLjUsXG5cblxuXG4gIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgYWxsIGRpc2FibGVkIGJ5IGRlZmF1bHQgKGRhbmdlcm91cyEpXG5cbiAgZXhlY3V0aW9uSmF2YVNjcmlwdDogZmFsc2UsXG5cbiAgZXhlY3V0aW9uUHl0aG9uOiBmYWxzZSxcblxuICBleGVjdXRpb25UZXJtaW5hbDogZmFsc2UsXG5cbiAgZXhlY3V0aW9uU2hlbGw6IHRydWUsXG5cblxuXG4gIHNlYXJjaEZhbGxiYWNrQ2hhaW46ICdkZGctYXBpJyxcblxuICBtYXhTZWFyY2hSZXN1bHRzOiAxMCxcblxuICBzYWZlc2VhcmNoOiAnMScsXG5cbiAgYnJvd3NlclRpbWVvdXQ6IDUwMDAsXG5cbiAgaGVhZGxlc3NNb2RlOiBmYWxzZSxcblxuICBnaXRBdXRvQ29tbWl0OiBmYWxzZSxcblxuICBkZWZhdWx0QnJhbmNoOiAnbWFpbicsXG5cbiAgcGF0aFZhbGlkYXRpb25FbmFibGVkOiB0cnVlLFxuXG4gIGJpbmFyeUZpbGVEZXRlY3Rpb246IHRydWUsXG5cbiAgcmVnZXhSZURvU1Byb3RlY3Rpb246IHRydWUsXG5cbiAgbWF4UmVnZXhMZW5ndGg6IDUwMCxcblxuICBzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDogdHJ1ZSxcblxuICBzdGF0ZU1heFNpemU6IDEwMjQwLFxuXG4gIGxhbmd1YWdlOiAnZW4nLFxuXG4gIG5vdGlmaWNhdGlvbnNFbmFibGVkOiB0cnVlLFxuXG4gIC8vIFRlbXBvcmFsIEF3YXJlbmVzcyAobWVyZ2VkIGZyb20gdXBfdG9fZGF0ZSlcbiAgdGVtcG9yYWxBd2FyZW5lc3M6IHRydWUsXG4gIGRhdGVGb3JtYXRTdHlsZTogJ3N0YW5kYXJkJyxcblxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNFXHVEREUwIENPTlRFWFQgR1VBUkQgU0VUVElOR1MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIGNvbnRleHRHdWFyZEVuYWJsZWQ6IHRydWUsXG4gIGNvbnRleHRHdWFyZFRva2VuTGltaXQ6IDgwMDAwLCAgICAgICAgICAgLy8gfjgwayB0b2tlbnMgYmVmb3JlIGNvbXByZXNzaW9uICg5MCUgPSA3MmsgdGhyZXNob2xkKVxuICBjb250ZXh0R3VhcmRTbWFydFJlYWRpbmc6IHRydWUsXG4gIGNvbnRleHRHdWFyZFN1bW1hcnlNb2RlbDogJycsICAgICAgICAgICAgLy8gRW1wdHkgPSB1c2UgY3VycmVudCBjaGF0IG1vZGVsXG4gIGNvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyRW5hYmxlZDogdHJ1ZSxcbiAgY29udGV4dEd1YXJkVGVybWluYWxGaWx0ZXJMZW5ndGg6IDIwMDAsICAvLyBGaWx0ZXIgdGVybWluYWwgb3V0cHV0ID4gMktCXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzRVx1REQxNiBBVVRPLVRSQUNLSU5HIFNFVFRJTkdTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICBhdXRvVHJhY2tpbmdFbmFibGVkOiBmYWxzZSwgICAgICAgICAgICAgIC8vIE9GRiBCWSBERUZBVUxUIFx1MjAxNCB1c2VyIG11c3Qgb3B0LWluXG4gIGF1dG9UcmFja0RlY2lzaW9uczogdHJ1ZSxcbiAgYXV0b1RyYWNrQ29tcGxldGlvbnM6IHRydWUsXG4gIGF1dG9UcmFja0Vycm9yczogdHJ1ZSxcbiAgYXV0b1N1bW1hcnlJbnRlcnZhbDogNTAsICAgICAgICAgICAgICAgICAvLyBTdW1tYXJ5IGV2ZXJ5IDUwIG1lc3NhZ2VzXG59O1xuXG5cblxuLyoqXG5cbiAqIFZhbGlkYXRlIGFuZCBzYW5pdGl6ZSBjb25maWcgaW5wXG5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb25maWcoaW5wdXQ6IHVua25vd24pOiBQbHVnaW5Db25maWcge1xuXG4gIGNvbnN0IHJlc3VsdCA9IENvbmZpZ1NjaGVtYS5zYWZlUGFyc2UoaW5wdXQpO1xuXG4gIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcblxuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uOiAke3Jlc3VsdC5lcnJvci5tZXNzYWdlfWApO1xuXG4gIH1cblxuICByZXR1cm4gcmVzdWx0LmRhdGE7XG59XG5cblxuXG4vKipcbiAqIENoZWNrIGlmIGEgdG9vbCBjYXRlZ29yeSBpcyBlbmFibGVkIGluIGNvbmZpZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUb29sRW5hYmxlZChjb25maWc6IFBsdWdpbkNvbmZpZywgY2F0ZWdvcnk6IGtleW9mIFBpY2s8UGx1Z2luQ29uZmlnLCAnZmlsZVN5c3RlbScgfCAnd2ViU2VhcmNoJyB8ICdicm93c2VyQXV0b21hdGlvbicgfCAnZ2l0T3BlcmF0aW9ucycgfCAnZGF0YWJhc2VRdWVyaWVzJyB8ICdkb2N1bWVudFBhcnNpbmcnIHwgJ2JhY2tncm91bmRDb21tYW5kcycgfCAnaW1hZ2VQcm9jZXNzaW5nJyB8ICdodHRwQ2xpZW50JyB8ICd2ZWN0b3JSQUcnIHwgJ3VpR2VuZXJhdGlvbicgfCAnY29udGV4dE1hbmFnZW1lbnQnPik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29uZmlnW2NhdGVnb3J5XSA9PT0gdHJ1ZTtcbn1cblxuXG5cblxuLyoqXG5cbiAqIENoZWNrIGlmIGEgc3BlY2lmaWMgZXhlY3V0aW9uIHRvb2wgaXMgZW5hYmxlZCAoZ3JhbnVsYXIpXG5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaXNFeGVjdXRpb25Ub29sRW5hYmxlZChjb25maWc6IFBsdWdpbkNvbmZpZywgdG9vbDogJ2phdmFzY3JpcHQnIHwgJ3B5dGhvbicgfCAndGVybWluYWwnIHwgJ3NoZWxsJyk6IGJvb2xlYW4ge1xuXG4gIHN3aXRjaCAodG9vbCkge1xuXG4gICAgY2FzZSAnamF2YXNjcmlwdCc6IHJldHVybiBjb25maWcuZXhlY3V0aW9uSmF2YVNjcmlwdCA9PT0gdHJ1ZTtcblxuICAgIGNhc2UgJ3B5dGhvbic6ICAgICByZXR1cm4gY29uZmlnLmV4ZWN1dGlvblB5dGhvbiA9PT0gdHJ1ZTtcblxuICAgIGNhc2UgJ3Rlcm1pbmFsJzogICByZXR1cm4gY29uZmlnLmV4ZWN1dGlvblRlcm1pbmFsID09PSB0cnVlO1xuXG4gICAgY2FzZSAnc2hlbGwnOiAgICAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uU2hlbGwgPT09IHRydWU7XG5cbiAgfVxuXG59XG5cblxuXG4vKipcblxuICogR2V0IHRoZSBleGVjdXRpb24gdG9vbCBrZXkgZnJvbSBhIHRvb2wgbmFtZVxuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEV4ZWN1dGlvblRvb2xLZXkodG9vbE5hbWU6IHN0cmluZyk6ICdqYXZhc2NyaXB0JyB8ICdweXRob24nIHwgJ3Rlcm1pbmFsJyB8ICdzaGVsbCcgfCBudWxsIHtcblxuICBzd2l0Y2ggKHRvb2xOYW1lKSB7XG5cbiAgICBjYXNlICdydW5famF2YXNjcmlwdCc6IHJldHVybiAnamF2YXNjcmlwdCc7XG5cbiAgICBjYXNlICdydW5fcHl0aG9uJzogICAgIHJldHVybiAncHl0aG9uJztcblxuICAgIGNhc2UgJ3J1bl9pbl90ZXJtaW5hbCc6IHJldHVybiAndGVybWluYWwnO1xuXG4gICAgY2FzZSAnZXhlY3V0ZV9jb21tYW5kJzogcmV0dXJuICdzaGVsbCc7XG5cbiAgICBkZWZhdWx0OiAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gIH1cblxufVxuXG5cblxuLyoqXG5cbiAqIENoZWNrIGlmIEFOWSBleGVjdXRpb24gdG9vbCBpcyBlbmFibGVkIChsZWdhY3kgY29tcGF0aWJpbGl0eSlcblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNBbnlFeGVjdXRpb25Ub29sKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogYm9vbGVhbiB7XG5cbiAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25KYXZhU2NyaXB0IHx8IGNvbmZpZy5leGVjdXRpb25QeXRob24gfHwgXG5cbiAgICAgICAgIGNvbmZpZy5leGVjdXRpb25UZXJtaW5hbCB8fCBjb25maWcuZXhlY3V0aW9uU2hlbGw7XG5cbn1cblxuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IExNIFN0dWRpbyBVSSBTY2hlbWF0aWNzID09PT09PT09PT09PT09PT09PT09XG5cbi8vIFRoZXNlIGRlZmluZSB0aGUgdG9nZ2xlIHN3aXRjaGVzIHRoYXQgYXBwZWFyIGluIExNIFN0dWRpbydzIHNldHRpbmdzIHBhbmVsLlxuXG5cblxuZXhwb3J0IGNvbnN0IGNvbmZpZ1NjaGVtYXRpY3MgPSBjcmVhdGVDb25maWdTY2hlbWF0aWNzKClcblxuXG5cbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIC0gVE9QIFBSSU9SSVRZIFdBUk5JTkcgVE9HR0xFIFx1MjZBMFx1RkUwRlxuXG4gIC5maWVsZCgnZ29kTW9kZScsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHUyNkExXHUyNkEwXHVGRTBGIEdPRCBNT0RFIC0gRW5hYmxlIEFMTCBUb29scyBcdTI2QTBcdUZFMEZcdTI2QTEnLFxuXG4gICAgc3VidGl0bGU6ICdXQVJOSU5HOiBBY3RpdmF0ZXMgZXZlcnkgdG9vbCBjYXRlZ29yeSBpbnN0YW50bHkuIFVzZSB3aXRoIGNhdXRpb24uJyxcblxuICAgIGhpbnQ6ICdXaGVuIGVuYWJsZWQsIEFMTCBpbmRpdmlkdWFsIHRvZ2dsZXMgYXJlIGJ5cGFzc2VkIGFuZCBldmVyeSB0b29sIGlzIGFjdGl2YXRlZCByZWdhcmRsZXNzIG9mIHNldHRpbmdzLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZ29kTW9kZSlcblxuXG5cbiAgLy8gXHVEODNDXHVERjlCXHVGRTBGIFRPT0wgR0FUSU5HIChIYXVwdHNjaGFsdGVyKSBcdUQ4M0NcdURGOUJcdUZFMEZcblxuICAuZmllbGQoJ2ZpbGVTeXN0ZW0nLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQzEgRmlsZSBTeXN0ZW0gVG9vbHMnLCBoaW50OiAnRW5hYmxlIGZpbGUgcmVhZC93cml0ZS9zZWFyY2ggb3BlcmF0aW9ucycgfSwgREVGQVVMVF9DT05GSUcuZmlsZVN5c3RlbSlcblxuICAuZmllbGQoJ3dlYlNlYXJjaCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REYxMCBXZWIgJiBSZXNlYXJjaCBUb29scycsIGhpbnQ6ICdFbmFibGUgRHVja0R1Y2tHby9XaWtpcGVkaWEgc2VhcmNoJyB9LCBERUZBVUxUX0NPTkZJRy53ZWJTZWFyY2gpXG5cbiAgLy8gXHVEODNEXHVEQzE5IEdJVCAmIEdJVEhVQiBUT09MUyAodmlzdWVsbGUgR3J1cHBpZXJ1bmcpIFx1RDgzRFx1REMxOVxuXG4gIC5maWVsZCgnZ2l0T3BlcmF0aW9ucycsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQzE5IEdpdCAmIEdpdEh1YiBUb29scycsIFxuXG4gICAgc3VidGl0bGU6ICdWZXJzaW9uIENvbnRyb2wgJiBBUEknLFxuXG4gICAgaGludDogJ0VuYWJsZSBnaXQgb3BlcmF0aW9ucyBhbmQgR2l0SHViIEFQSSBhY2Nlc3MuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5naXRPcGVyYXRpb25zKVxuXG4gIC5maWVsZCgnZ2l0QXV0b0NvbW1pdCcsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JFIEdpdCBBdXRvLUNvbW1pdCcsIFxuXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgR2l0ICYgR2l0SHViIFRvb2xzJyxcblxuICAgIGhpbnQ6ICdBdXRvbWF0aWNhbGx5IGNvbW1pdCBjaGFuZ2VzIGFmdGVyIG9wZXJhdGlvbnMnLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmdpdEF1dG9Db21taXQpXG5cbiAgLmZpZWxkKCdkZWZhdWx0QnJhbmNoJywgJ3N0cmluZycsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REYzRiBEZWZhdWx0IEJyYW5jaCcsIFxuXG4gICAgcGxhY2Vob2xkZXI6ICdtYWluJyxcblxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEdpdCAmIEdpdEh1YiBUb29scycsXG5cbiAgICBoaW50OiAnQnJhbmNoIG5hbWUgZm9yIG5ldyByZXBvc2l0b3JpZXMgYW5kIGdpdCBvcGVyYXRpb25zJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5kZWZhdWx0QnJhbmNoKVxuXG5cblxuICAuZmllbGQoJ2RhdGFiYXNlUXVlcmllcycsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RERDNFx1RkUwRiBEYXRhYmFzZSBRdWVyaWVzJywgaGludDogJ0VuYWJsZSByZWFkLW9ubHkgU1FMaXRlIHF1ZXJpZXMnIH0sIERFRkFVTFRfQ09ORklHLmRhdGFiYXNlUXVlcmllcylcblxuICAuZmllbGQoJ2RvY3VtZW50UGFyc2luZycsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDNCBEb2N1bWVudCBQYXJzaW5nJywgaGludDogJ0VuYWJsZSBQREYvRE9DWCBkb2N1bWVudCByZWFkaW5nJyB9LCBERUZBVUxUX0NPTkZJRy5kb2N1bWVudFBhcnNpbmcpXG5cbiAgLmZpZWxkKCdiYWNrZ3JvdW5kQ29tbWFuZHMnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdTIzRjMgQmFja2dyb3VuZCBDb21tYW5kcycsIGhpbnQ6ICdFbmFibGUgbG9uZy1ydW5uaW5nIHByb2Nlc3MgdHJhY2tpbmcnIH0sIERFRkFVTFRfQ09ORklHLmJhY2tncm91bmRDb21tYW5kcylcblxuXG5cbiAgLy8gXHVEODNDXHVERDk1XHUyMDBEXHUyNzQwIE5FVyBUT09MIENBVEVHT1JJRVMgXHVEODNDXHVERDk1XHUyMDBEXHUyNzQwXG5cbiAgLmZpZWxkKCdpbWFnZVByb2Nlc3NpbmcnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RERCQ1x1RkUwRiBJbWFnZSBQcm9jZXNzaW5nIFRvb2xzJywgXG5cbiAgICBzdWJ0aXRsZTogJ09DUiwgU2NyZWVuc2hvdHMgJiBDb21wYXJpc29uJyxcblxuICAgIGhpbnQ6ICdFbmFibGUgaW1hZ2UgT0NSIChUZXNzZXJhY3QuanMpLCBzY3JlZW5zaG90IGNhcHR1cmUsIGFuZCBpbWFnZSBjb21wYXJpc29uIHRvb2xzLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuaW1hZ2VQcm9jZXNzaW5nKVxuXG4gIFxuXG4gIC5maWVsZCgnaHR0cENsaWVudCcsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDBDIEhUVFAgQ2xpZW50IFRvb2xzJywgXG5cbiAgICBzdWJ0aXRsZTogJ0dlbmVyaWMgUkVTVCBBUEkgQ2xpZW50JyxcblxuICAgIGhpbnQ6ICdFbmFibGUgZ2VuZXJpYyBIVFRQIGNsaWVudCBmb3IgbWFraW5nIHJlcXVlc3RzIHRvIGFueSBSRVNUIEFQSSAoR0VULCBQT1NULCBQVVQsIERFTEVURSkuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5odHRwQ2xpZW50KVxuXG4gIFxuXG4gIC5maWVsZCgndmVjdG9yUkFHJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQ0EgVmVjdG9yIFJBRyAvIFNlbWFudGljIFNlYXJjaCcsIFxuXG4gICAgc3VidGl0bGU6ICdTZW1hbnRpYyBEb2N1bWVudCBTZWFyY2gnLFxuXG4gICAgaGludDogJ0VuYWJsZSBzZW1hbnRpYyBzZWFyY2ggd2l0aCB2ZWN0b3IgZW1iZWRkaW5ncyBmb3IgaW50ZWxsaWdlbnQgZG9jdW1lbnQgcmV0cmlldmFsLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcudmVjdG9yUkFHKVxuICAuZmllbGQoJ3VpR2VuZXJhdGlvbicsICdib29sZWFuJywgeyBcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REZBOCBJbnRlcmFjdGl2ZSBVSSBHZW5lcmF0aW9uIFRvb2xzJywgXG4gICAgc3VidGl0bGU6ICdHZW5lcmF0ZSBhbmQgcmVuZGVyIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudHMnLFxuICAgIGhpbnQ6ICdFbmFibGUgdG9vbHMgZm9yIGdlbmVyYXRpbmcgSFRNTC9DU1MvSlMgY29tcG9uZW50cyAoYnV0dG9ucywgZm9ybXMsIGNoYXJ0cywgZGFzaGJvYXJkcykgYW5kIHJlbmRlcmluZyB0aGVtIGluIHRoZSBicm93c2VyLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLnVpR2VuZXJhdGlvbilcbiAgLmZpZWxkKCdjb250ZXh0TWFuYWdlbWVudCcsICdib29sZWFuJywgeyBcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRVx1RERFMCBBdXRvLUNvbnRleHQgTWFuYWdlbWVudCBUb29scycsIFxuICAgIHN1YnRpdGxlOiAnQXV0b21hdGljIHNlc3Npb24gdHJhY2tpbmcgYW5kIG1lbW9yeSBtYW5hZ2VtZW50JyxcbiAgICBoaW50OiAnRW5hYmxlIHRvb2xzIGZvciBhdXRvbWF0aWNhbGx5IHNhdmluZyBpbXBvcnRhbnQgZGVjaXNpb25zLCBwYXR0ZXJucywgYW5kIGNvbmZpZ3VyYXRpb25zIHRvIHBlcnNpc3RlbnQgbWVtb3J5LicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmNvbnRleHRNYW5hZ2VtZW50KVxuXG5cblxuICAvLyBcdUQ4M0RcdURDREEgRE9DVU1FTlQgUkFHIC8gQ0hBVCBXSVRIIEZJTEVTIFx1RDgzRFx1RENEQVxuXG4gIC5maWVsZCgnZG9jdW1lbnRSQUcnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENEQSBEb2N1bWVudCBSQUcgLyBDaGF0IHdpdGggRmlsZXMnLCBcblxuICAgIHN1YnRpdGxlOiAnRW5hYmxlIGZpbGUgaW5kZXhpbmcgYW5kIHNlbWFudGljIHNlYXJjaCBmb3IgY2hhdCcsXG5cbiAgICBoaW50OiAnQXR0YWNoIGRvY3VtZW50cyB0byB5b3VyIGNoYXQgbWVzc2FnZXMuIFRoZSBwbHVnaW4gd2lsbCBhdXRvbWF0aWNhbGx5IHJldHJpZXZlIHJlbGV2YW50IGNvbnRlbnQgZnJvbSBhdHRhY2hlZCBmaWxlcyB1c2luZyBzZW1hbnRpYyBzZWFyY2guJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5kb2N1bWVudFJBRylcblxuICBcblxuICAuZmllbGQoJ3JldHJpZXZhbExpbWl0JywgJ251bWVyaWMnLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMjIgUmV0cmlldmFsIExpbWl0JywgXG5cbiAgICBzdWJ0aXRsZTogJ01heCBjaHVua3MgdG8gcmV0dXJuIHBlciBxdWVyeScsXG5cbiAgICBtaW46IDEsIG1heDogMjAsIGludDogdHJ1ZSxcblxuICAgIGhpbnQ6ICdNYXhpbXVtIG51bWJlciBvZiByZWxldmFudCBkb2N1bWVudCBjaHVua3MgdG8gcmV0cmlldmUgZm9yIGVhY2ggcXVlcnkuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5yZXRyaWV2YWxMaW1pdClcblxuICBcblxuICAuZmllbGQoJ3JldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkJywgJ251bWVyaWMnLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGQUYgUmV0cmlldmFsIEFmZmluaXR5IFRocmVzaG9sZCcsIFxuXG4gICAgc3VidGl0bGU6ICdNaW5pbXVtIHJlbGV2YW5jZSBzY29yZSAoMC0xKScsXG5cbiAgICBtaW46IDAuMCwgbWF4OiAxLjAsIHN0ZXA6IDAuMDEsXG5cbiAgICBoaW50OiAnQ2h1bmtzIGJlbG93IHRoaXMgc2ltaWxhcml0eSBzY29yZSB3aWxsIGJlIGZpbHRlcmVkIG91dC4gTG93ZXIgPSBtb3JlIHJlc3VsdHMgYnV0IHBvdGVudGlhbGx5IGxlc3MgcmVsZXZhbnQuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5yZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZClcblxuICAvLyBcdTI2QTEgRVhFQ1VUSU9OIFRPT0xTIChHZWZcdTAwRTRocmxpY2ghKSBcdTI2QTFcblxuICAuZmllbGQoJ2V4ZWN1dGlvbkphdmFTY3JpcHQnLCAnYm9vbGVhbicsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHUyNkExIEphdmFTY3JpcHQtQXVzZlx1MDBGQ2hydW5nIGVybGF1YmVuJyxcblxuICAgIHN1YnRpdGxlOiBcIkFrdGl2aWVydCBkYXMgJ3J1bl9qYXZhc2NyaXB0Jy1Ub29sXCIsXG5cbiAgICBoaW50OiAnR0VGQUhSOiBDb2RlIGxcdTAwRTR1ZnQgYXVmIElocmVtIFJlY2huZXIuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5leGVjdXRpb25KYXZhU2NyaXB0KVxuXG4gIC5maWVsZCgnZXhlY3V0aW9uUHl0aG9uJywgJ2Jvb2xlYW4nLCB7XG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REMwRCBQeXRob24tQXVzZlx1MDBGQ2hydW5nIGVybGF1YmVuJyxcblxuICAgIHN1YnRpdGxlOiBcIkFrdGl2aWVydCBkYXMgJ3J1bl9weXRob24nLVRvb2xcIixcblxuICAgIGhpbnQ6ICdHRUZBSFI6IENvZGUgbFx1MDBFNHVmdCBhdWYgSWhyZW0gUmVjaG5lci4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvblB5dGhvbilcblxuICAuZmllbGQoJ2V4ZWN1dGlvblRlcm1pbmFsJywgJ2Jvb2xlYW4nLCB7XG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENCQiBUZXJtaW5hbC1BdXNmXHUwMEZDaHJ1bmcgZXJsYXViZW4nLFxuXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX2luX3Rlcm1pbmFsJy1Ub29sXCIsXG5cbiAgICBoaW50OiAnXHUwMEQ2ZmZuZXQgZWNodGUgVGVybWluYWwtRmVuc3Rlci4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvblRlcm1pbmFsKVxuXG4gIC5maWVsZCgnZXhlY3V0aW9uU2hlbGwnLCAnYm9vbGVhbicsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDI3IFNoZWxsLUJlZmVobHNhdXNmXHUwMEZDaHJ1bmcgZXJsYXViZW4nLFxuXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAnZXhlY3V0ZV9jb21tYW5kJy1Ub29sXCIsXG5cbiAgICBoaW50OiAnR0VGQUhSOiBCZWZlaGxlIGxhdWZlbiBhdWYgSWhyZW0gUmVjaG5lci4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvblNoZWxsKVxuXG5cblxuICAvLyBcdUQ4M0RcdUREMEQgU0VBUkNIIFNFVFRJTkdTIFx1RDgzRFx1REQwRFxuXG4gIC5maWVsZCgnc2VhcmNoRmFsbGJhY2tDaGFpbicsICdzZWxlY3QnLCB7XG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQwRCBTZWFyY2ggRmFsbGJhY2sgQ2hhaW4nLFxuXG4gICAgaGludDogJ1ByaW1hcnkgc2VhcmNoIGVuZ2luZS4gQXV0by1mYWxscyBiYWNrIHRvIG90aGVycyBpZiB1bmF2YWlsYWJsZS4nLFxuXG4gICAgb3B0aW9uczogW1xuXG4gICAgICB7IHZhbHVlOiAnZGRnLWFwaScsIGRpc3BsYXlOYW1lOiAnRHVja0R1Y2tHbyBBUEknIH0sXG5cbiAgICAgIHsgdmFsdWU6ICdkZGctZmV0Y2gnLCBkaXNwbGF5TmFtZTogJ0R1Y2tEdWNrR28gRmV0Y2gnIH0sXG5cbiAgICAgIHsgdmFsdWU6ICdnb29nbGUnLCBkaXNwbGF5TmFtZTogJ0dvb2dsZScgfSxcblxuICAgICAgeyB2YWx1ZTogJ2JpbmcnLCBkaXNwbGF5TmFtZTogJ0JpbmcnIH0sXG5cbiAgICBdLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLnNlYXJjaEZhbGxiYWNrQ2hhaW4pXG5cbiAgLmZpZWxkKCdtYXhTZWFyY2hSZXN1bHRzJywgJ251bWVyaWMnLCB7IG1pbjogMSwgbWF4OiA1MCwgaW50OiB0cnVlIH0sIERFRkFVTFRfQ09ORklHLm1heFNlYXJjaFJlc3VsdHMpXG5cbiAgLmZpZWxkKCdzYWZlc2VhcmNoJywgJ3NlbGVjdCcsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERUUxXHVGRTBGIFNhZmUgU2VhcmNoJyxcblxuICAgIG9wdGlvbnM6IFtcblxuICAgICAgeyB2YWx1ZTogJzAnLCBkaXNwbGF5TmFtZTogJ09mZicgfSxcblxuICAgICAgeyB2YWx1ZTogJzEnLCBkaXNwbGF5TmFtZTogJ01vZGVyYXRlJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnMicsIGRpc3BsYXlOYW1lOiAnU3RyaWN0JyB9LFxuXG4gICAgXSxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5zYWZlc2VhcmNoKVxuXG5cblxuICAvLyBcdUQ4M0RcdUREQTVcdUZFMEYgQlJPV1NFUiBBVVRPTUFUSU9OIFRPT0xTIFx1RDgzRFx1RERBNVx1RkUwRlxuXG4gIC5maWVsZCgnYnJvd3NlckF1dG9tYXRpb24nLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RERBNVx1RkUwRiBCcm93c2VyIEF1dG9tYXRpb24gVG9vbHMnLCBcblxuICAgIHN1YnRpdGxlOiAnSGVhZGxlc3MgYnJvd3NlciBjb250cm9sICYgYXV0b21hdGlvbicsXG5cbiAgICBoaW50OiAnRW5hYmxlIFB1cHBldGVlci1iYXNlZCBoZWFkbGVzcyBicm93c2VyIGF1dG9tYXRpb24gZm9yIHdlYiBzY3JhcGluZywgdGVzdGluZywgYW5kIFVJIGludGVyYWN0aW9uLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuYnJvd3NlckF1dG9tYXRpb24pXG5cbiAgXG5cbiAgLmZpZWxkKCdicm93c2VyVGltZW91dCcsICdudW1lcmljJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHUyM0YxXHVGRTBGIEJyb3dzZXIgVGltZW91dCcsIFxuXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgQnJvd3NlciBBdXRvbWF0aW9uIFRvb2xzJyxcblxuICAgIG1pbjogMTAwMCwgbWF4OiAzMDAwMCwgaW50OiB0cnVlLFxuXG4gICAgaGludDogJ01heGltdW0gdGltZSAobXMpIHRvIHdhaXQgZm9yIGJyb3dzZXIgb3BlcmF0aW9ucyBiZWZvcmUgdGltaW5nIG91dC4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmJyb3dzZXJUaW1lb3V0KVxuXG4gIFxuXG4gIC5maWVsZCgnaGVhZGxlc3NNb2RlJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDN0IgSGVhZGxlc3MgTW9kZScsIFxuXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgQnJvd3NlciBBdXRvbWF0aW9uIFRvb2xzJyxcblxuICAgIGhpbnQ6ICdSdW4gYnJvd3NlciB3aXRob3V0IEdVSSAocmVjb21tZW5kZWQgZm9yIGF1dG9tYXRpb24pLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuaGVhZGxlc3NNb2RlKVxuXG5cblxuICAvLyBcdUQ4M0RcdUREMTIgU0VDVVJJVFkgU0VUVElOR1MgXHVEODNEXHVERDEyXG5cbiAgLmZpZWxkKCdwYXRoVmFsaWRhdGlvbkVuYWJsZWQnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMTIgUGF0aCBWYWxpZGF0aW9uJywgaGludDogJ1ByZXZlbnQgZGlyZWN0b3J5IHRyYXZlcnNhbCBhdHRhY2tzJyB9LCBERUZBVUxUX0NPTkZJRy5wYXRoVmFsaWRhdGlvbkVuYWJsZWQpXG5cbiAgLmZpZWxkKCdiaW5hcnlGaWxlRGV0ZWN0aW9uJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0MxIEJpbmFyeSBGaWxlIERldGVjdGlvbicsIGhpbnQ6ICdEZXRlY3QgYmluYXJ5IGZpbGVzIHZpYSBudWxsIGJ5dGUgY2hlY2snIH0sIERFRkFVTFRfQ09ORklHLmJpbmFyeUZpbGVEZXRlY3Rpb24pXG5cbiAgLmZpZWxkKCdyZWdleFJlRG9TUHJvdGVjdGlvbicsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REVFMVx1RkUwRiBSZURvUyBQcm90ZWN0aW9uJywgaGludDogJ1Byb3RlY3QgYWdhaW5zdCByZWdleCBkZW5pYWwtb2Ytc2VydmljZScgfSwgREVGQVVMVF9DT05GSUcucmVnZXhSZURvU1Byb3RlY3Rpb24pXG5cbiAgLmZpZWxkKCdtYXhSZWdleExlbmd0aCcsICdudW1lcmljJywgeyBtaW46IDEsIG1heDogMTAwMCwgaW50OiB0cnVlIH0sIERFRkFVTFRfQ09ORklHLm1heFJlZ2V4TGVuZ3RoKVxuXG5cblxuICAvLyBcdUQ4M0RcdURDQkQgU1RBVEUgTUFOQUdFTUVOVCBcdUQ4M0RcdURDQkRcblxuICAuZmllbGQoJ3N0YXRlUGVyc2lzdGVuY2VFbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JEIFN0YXRlIFBlcnNpc3RlbmNlJywgaGludDogJ1BlcnNpc3QgdG9vbCBleGVjdXRpb24gc3RhdGUgYmV0d2VlbiBzZXNzaW9ucycgfSwgREVGQVVMVF9DT05GSUcuc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQpXG5cbiAgLmZpZWxkKCdzdGF0ZU1heFNpemUnLCAnbnVtZXJpYycsIHsgbWluOiAxMDI0LCBtYXg6IDEwNDg1NzYsIGludDogdHJ1ZSB9LCBERUZBVUxUX0NPTkZJRy5zdGF0ZU1heFNpemUpXG5cblxuXG4gIC8vIFx1RDgzQ1x1REYxMCBMQU5HVUFHRSAmIE5PVElGSUNBVElPTlMgXHVEODNDXHVERjEwXG5cbiAgLmZpZWxkKCdsYW5ndWFnZScsICdzZWxlY3QnLCB7XG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REYxMCBMYW5ndWFnZScsXG5cbiAgICBvcHRpb25zOiBbXG5cbiAgICAgIHsgdmFsdWU6ICdlbicsIGRpc3BsYXlOYW1lOiAnRW5nbGlzaCcgfSxcblxuICAgICAgeyB2YWx1ZTogJ2RlJywgZGlzcGxheU5hbWU6ICdEZXV0c2NoIChHZXJtYW4pJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnemgtQ04nLCBkaXNwbGF5TmFtZTogJ1NpbXBsaWZpZWQgQ2hpbmVzZScgfSxcblxuICAgICAgeyB2YWx1ZTogJ3poLVRXJywgZGlzcGxheU5hbWU6ICdUcmFkaXRpb25hbCBDaGluZXNlJyB9LFxuXG4gICAgXSxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5sYW5ndWFnZSlcblxuXG5cbiAgLmZpZWxkKCdub3RpZmljYXRpb25zRW5hYmxlZCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQxNCBEZXNrdG9wIE5vdGlmaWNhdGlvbnMnLCBoaW50OiAnU2hvdyBzeXN0ZW0gbm90aWZpY2F0aW9ucycgfSwgREVGQVVMVF9DT05GSUcubm90aWZpY2F0aW9uc0VuYWJsZWQpXG5cbiAgLy8gXHUyM0YwIFRFTVBPUkFMIEFXQVJFTkVTUyAoZnJvbSB1cF90b19kYXRlKVxuICAuZmllbGQoJ3RlbXBvcmFsQXdhcmVuZXNzJywgJ2Jvb2xlYW4nLCB7XG4gICAgZGlzcGxheU5hbWU6ICdcdTIzRjAgVGVtcG9yYWwgQXdhcmVuZXNzJyxcbiAgICBzdWJ0aXRsZTogJ0luamVjdHMgY3VycmVudCBkYXRlL3RpbWUgaW50byBldmVyeSBtZXNzYWdlJyxcbiAgICBoaW50OiAnRW5hYmxlcyB0aGUgQUkgdG8ga25vdyB0aGUgY3VycmVudCB0aW1lLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLnRlbXBvcmFsQXdhcmVuZXNzKVxuICAuZmllbGQoJ2RhdGVGb3JtYXRTdHlsZScsICdzZWxlY3QnLCB7XG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQzUgRGF0ZSBGb3JtYXQgU3R5bGUnLFxuICAgIG9wdGlvbnM6IFtcbiAgICAgIHsgdmFsdWU6ICdzdGFuZGFyZCcsIGRpc3BsYXlOYW1lOiAnU3RhbmRhcmQgKFtaZWl0OiAuLi5dKScgfSxcbiAgICAgIHsgdmFsdWU6ICdoZXV0ZUlzdCcsIGRpc3BsYXlOYW1lOiAnSEVVVEUgSVNUIE1vZGUgKFByb21pbmVudCknIH0sXG4gICAgXSxcbiAgfSwgREVGQVVMVF9DT05GSUcuZGF0ZUZvcm1hdFN0eWxlKVxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzRVx1RERFMCBDT05URVhUIEdVQVJEIFNFVFRJTkdTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAuZmllbGQoJ2NvbnRleHRHdWFyZEVuYWJsZWQnLCAnYm9vbGVhbicsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRVx1RERFMCBDb250ZXh0R3VhcmQgVG9rZW4gTWFuYWdlbWVudCcsXG4gICAgc3VidGl0bGU6ICdBdXRvbWF0aWMgaGlzdG9yeSBjb21wcmVzc2lvbiAmIHNtYXJ0IHJlYWRpbmcnLFxuICAgIGhpbnQ6ICdBdXRvbWF0aWNhbGx5IGNvbXByZXNzZXMgY2hhdCBoaXN0b3J5IHdoZW4gdG9rZW4gbGltaXQgaXMgcmVhY2hlZC4gRW5hYmxlcyBzbWFydCBmaWxlIHJlYWRpbmcgYW5kIHRlcm1pbmFsIG91dHB1dCBmaWx0ZXJpbmcuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuY29udGV4dEd1YXJkRW5hYmxlZClcblxuICAuZmllbGQoJ2NvbnRleHRHdWFyZFRva2VuTGltaXQnLCAnbnVtZXJpYycsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDQSBUb2tlbiBMaW1pdCBCZWZvcmUgQ29tcHJlc3Npb24nLFxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIENvbnRleHRHdWFyZCBTZXR0aW5nJyxcbiAgICBtaW46IDEwMDAsIG1heDogMjAwMDAwLCBpbnQ6IHRydWUsXG4gICAgaGludDogJ0NvbXByZXNzaW9uIHRyaWdnZXJzIGF0IDkwJSBvZiB0aGlzIGxpbWl0LiBIaWdoZXIgPSBtb3JlIGNvbnRleHQgcmV0YWluZWQgYnV0IHNsb3dlciByZXNwb25zZXMuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuY29udGV4dEd1YXJkVG9rZW5MaW1pdClcblxuICAuZmllbGQoJ2NvbnRleHRHdWFyZFNtYXJ0UmVhZGluZycsICdib29sZWFuJywge1xuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDBEIFNtYXJ0IEZpbGUgUmVhZGluZycsXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgQ29udGV4dEd1YXJkIFNldHRpbmcnLFxuICAgIGhpbnQ6ICdFeHRyYWN0cyBrZXl3b3JkcyBmcm9tIHVzZXIgcXVlcmllcyB0byByZWFkIG9ubHkgcmVsZXZhbnQgcG9ydGlvbnMgb2YgZmlsZXMuIFNhdmVzIHRva2VucyBhbmQgc3BlZWRzIHVwIHJlc3BvbnNlcy4nLFxuICB9LCBERUZBVUxUX0NPTkZJRy5jb250ZXh0R3VhcmRTbWFydFJlYWRpbmcpXG5cbiAgLmZpZWxkKCdjb250ZXh0R3VhcmRTdW1tYXJ5TW9kZWwnLCAnc3RyaW5nJywge1xuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNFXHVERDE2IFN1bW1hcnkgTW9kZWwgTmFtZScsXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgQ29udGV4dEd1YXJkIFNldHRpbmcnLFxuICAgIHBsYWNlaG9sZGVyOiAnKGxlYXZlIGVtcHR5IGZvciBjdXJyZW50IGNoYXQgbW9kZWwpJyxcbiAgICBoaW50OiAnTE0gU3R1ZGlvIG1vZGVsIG5hbWUgdXNlZCBmb3IgaGlzdG9yeSBzdW1tYXJpemF0aW9uLiBMZWF2ZSBlbXB0eSB0byB1c2UgeW91ciBjdXJyZW50IGNoYXQgbW9kZWwuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuY29udGV4dEd1YXJkU3VtbWFyeU1vZGVsKVxuXG4gIC5maWVsZCgnY29udGV4dEd1YXJkVGVybWluYWxGaWx0ZXJFbmFibGVkJywgJ2Jvb2xlYW4nLCB7XG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQ0MgVGVybWluYWwgT3V0cHV0IEZpbHRlcmluZycsXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgQ29udGV4dEd1YXJkIFNldHRpbmcnLFxuICAgIGhpbnQ6ICdBdXRvbWF0aWNhbGx5IHRydW5jYXRlcyBsb25nIHRlcm1pbmFsIG91dHB1dHMgdG8gc2F2ZSB0b2tlbnMuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuY29udGV4dEd1YXJkVGVybWluYWxGaWx0ZXJFbmFibGVkKVxuXG4gIC5maWVsZCgnY29udGV4dEd1YXJkVGVybWluYWxGaWx0ZXJMZW5ndGgnLCAnbnVtZXJpYycsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDRiBNYXggVGVybWluYWwgT3V0cHV0IExlbmd0aCcsXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgQ29udGV4dEd1YXJkIFNldHRpbmcnLFxuICAgIG1pbjogMTAwLCBtYXg6IDIwMDAwLCBpbnQ6IHRydWUsXG4gICAgaGludDogJ01heGltdW0gY2hhcmFjdGVycyBiZWZvcmUgdGVybWluYWwgb3V0cHV0IGlzIHRydW5jYXRlZCBhbmQgc3VtbWFyaXplZC4nLFxuICB9LCBERUZBVUxUX0NPTkZJRy5jb250ZXh0R3VhcmRUZXJtaW5hbEZpbHRlckxlbmd0aClcblxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNFXHVERDE2IEFVVE8tVFJBQ0tJTkcgU0VUVElOR1MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gIC5maWVsZCgnYXV0b1RyYWNraW5nRW5hYmxlZCcsICdib29sZWFuJywge1xuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNFXHVERDE2IEF1dG8tVHJhY2tpbmcgRW5hYmxlZCcsXG4gICAgc3VidGl0bGU6ICdBdXRvbWF0aWNhbGx5IHJlbWVtYmVyIGltcG9ydGFudCBldmVudHMnLFxuICAgIGhpbnQ6ICdXaGVuIGVuYWJsZWQsIHRoZSBwbHVnaW4gd2lsbCBzaWxlbnRseSB0cmFjayBkZWNpc2lvbnMsIGNvbXBsZXRpb25zLCBhbmQgZml4ZXMgd2l0aG91dCB1c2VyIHByb21wdHMuIE9GRiBieSBkZWZhdWx0IGZvciBwcml2YWN5LicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmF1dG9UcmFja2luZ0VuYWJsZWQpXG5cbiAgLmZpZWxkKCdhdXRvVHJhY2tEZWNpc2lvbnMnLCAnYm9vbGVhbicsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDQyBUcmFjayBEZWNpc2lvbnMgQXV0b21hdGljYWxseScsXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgQXV0by1UcmFja2luZyBTZXR0aW5nJyxcbiAgICBoaW50OiAnRGV0ZWN0cyBwaHJhc2VzIGxpa2UgXCJJIGRlY2lkZWRcIiwgXCJjb25jbHVzaW9uXCIsIFwiZ29pbmcgd2l0aFwiLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmF1dG9UcmFja0RlY2lzaW9ucylcblxuICAuZmllbGQoJ2F1dG9UcmFja0NvbXBsZXRpb25zJywgJ2Jvb2xlYW4nLCB7XG4gICAgZGlzcGxheU5hbWU6ICdcdTI3MDUgVHJhY2sgQ29tcGxldGlvbnMgQXV0b21hdGljYWxseScsXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgQXV0by1UcmFja2luZyBTZXR0aW5nJyxcbiAgICBoaW50OiAnRGV0ZWN0cyBwaHJhc2VzIGxpa2UgXCJzdWNjZXNzZnVsbHkgY29tcGxldGVkXCIsIFwiZmluaXNoZWQgaW1wbGVtZW50aW5nXCIuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuYXV0b1RyYWNrQ29tcGxldGlvbnMpXG5cbiAgLmZpZWxkKCdhdXRvVHJhY2tFcnJvcnMnLCAnYm9vbGVhbicsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REMxQiBUcmFjayBCdWcgRml4ZXMgQXV0b21hdGljYWxseScsXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgQXV0by1UcmFja2luZyBTZXR0aW5nJyxcbiAgICBoaW50OiAnRGV0ZWN0cyBwaHJhc2VzIGxpa2UgXCJmaXhlZCB0aGUgYnVnXCIsIFwicmVzb2x2ZWQgdGhlIGlzc3VlXCIuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuYXV0b1RyYWNrRXJyb3JzKVxuXG4gIC5maWVsZCgnYXV0b1N1bW1hcnlJbnRlcnZhbCcsICdudW1lcmljJywge1xuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0NBIFNlc3Npb24gU3VtbWFyeSBJbnRlcnZhbCcsXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgQXV0by1UcmFja2luZyBTZXR0aW5nJyxcbiAgICBtaW46IDEwLCBtYXg6IDIwMCwgaW50OiB0cnVlLFxuICAgIGhpbnQ6ICdOdW1iZXIgb2YgbWVzc2FnZXMgYmV0d2VlbiBhdXRvbWF0aWMgc2Vzc2lvbiBzdW1tYXJpZXMuIEhpZ2hlciA9IGxlc3MgZnJlcXVlbnQuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuYXV0b1N1bW1hcnlJbnRlcnZhbClcblxuXG4gIC5idWlsZCgpO1xuIiwgIi8qKlxuICogUGVyc2lzdGVudCBzdGF0ZSBtYW5hZ2VtZW50IGZvciBwbHVnaW4gb3BlcmF0aW9uc1xuICogU3RvcmVzIGRhdGEgdG8gZGlzayBhcyBKU09OIGZpbGUgZm9yIHN1cnZpdmFsIGFjcm9zcyByZWxvYWRzXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5cbmludGVyZmFjZSBTdGF0ZUVudHJ5IHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiB1bmtub3duO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuLyoqIE1pbmltYWwgbG9nZ2VyIGZvciBzdGF0ZSBtYW5hZ2VyIChhdm9pZHMgY2lyY3VsYXIgZGVwZW5kZW5jeSB3aXRoIGluZGV4LnRzKSAqL1xuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZGVyci53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZGVyci53cml0ZShgW1N0YXRlTWFuYWdlcl0gJHttc2d9XFxuYCksXG59O1xuXG4vKiogRGVib3VuY2VkIGFzeW5jIHN0YXRlIHBlcnNpc3RlbmNlICg1MDBtcyBkZWxheSkgKi9cbmZ1bmN0aW9uIGNyZWF0ZURlYm91bmNlZFNhdmUoc2F2ZUZuOiAoKSA9PiB2b2lkLCBkZWxheU1zOiBudW1iZXIgPSA1MDApOiAoKCkgPT4gdm9pZCkge1xuICBsZXQgdGltZXJJZDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgXG4gIHJldHVybiBmdW5jdGlvbiBkZWJvdW5jZWRTYXZlKCk6IHZvaWQge1xuICAgIGlmICh0aW1lcklkKSBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2F2ZUZuKCk7XG4gICAgICB0aW1lcklkID0gbnVsbDtcbiAgICB9LCBkZWxheU1zKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IG1lbW9yeSBmaWxlIGxvY2F0aW9uIChpbiBMTSBTdHVkaW8gcGx1Z2luIGRhdGEgZGlyZWN0b3J5KVxuICovXG5mdW5jdGlvbiBnZXRNZW1vcnlGaWxlUGF0aCgpOiBzdHJpbmcge1xuICAvLyBUcnkgdG8gZmluZCBMTSBTdHVkaW8ncyBhcHAgZGF0YSBkaXJlY3RvcnkgZm9yIHBlcnNpc3RlbmNlXG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIGxldCBiYXNlRGlyOiBzdHJpbmc7XG4gIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICBjYXNlICd3aW4zMic6XG4gICAgICBiYXNlRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkFQUERBVEEgfHwgJycsICdsbS1zdHVkaW8nLCAncGx1Z2lucycpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGFyd2luJzpcbiAgICAgIGJhc2VEaXIgPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnTGlicmFyeScsICdBcHBsaWNhdGlvbiBTdXBwb3J0JywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmFzZURpciA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FIHx8ICcnLCAnLmxvY2FsJywgJ3NoYXJlJywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gIH1cbiAgXG4gIHJldHVybiBwYXRoLmpvaW4oYmFzZURpciwgJ2FpLXRvb2xib3gtbWVtb3J5Lmpzb24nKTtcbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRlTWFuYWdlciB7XG4gIHByaXZhdGUgc3RhdGU6IE1hcDxzdHJpbmcsIFN0YXRlRW50cnk+O1xuICBwcml2YXRlIG1heFNpemU6IG51bWJlcjtcbiAgcHJpdmF0ZSBwZXJzaXN0ZW5jZUVuYWJsZWQ6IGJvb2xlYW47XG4gIHByaXZhdGUgbWVtb3J5RmlsZTogc3RyaW5nO1xuICBwcml2YXRlIHJ1bm5pbmdTaXplOiBudW1iZXI7IC8vIFRyYWNrIHNpemUgaW5jcmVtZW50YWxseSBmb3IgTygxKSBjaGVja3NcbiAgcHJpdmF0ZSBkZWJvdW5jZWRTYXZlOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZz86IFBsdWdpbkNvbmZpZykge1xuICAgIHRoaXMuc3RhdGUgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5ydW5uaW5nU2l6ZSA9IDA7XG4gICAgY29uc3QgZWZmZWN0aXZlQ29uZmlnID0gY29uZmlnIHx8IERFRkFVTFRfQ09ORklHO1xuICAgIHRoaXMubWF4U2l6ZSA9IGVmZmVjdGl2ZUNvbmZpZy5zdGF0ZU1heFNpemU7XG4gICAgdGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQgPSBlZmZlY3RpdmVDb25maWcuc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQ7XG4gICAgdGhpcy5tZW1vcnlGaWxlID0gZ2V0TWVtb3J5RmlsZVBhdGgoKTtcbiAgICBcbiAgICAvLyBDcmVhdGUgZGVib3VuY2VkIHNhdmUgZnVuY3Rpb24gKDUwMG1zIGRlbGF5KVxuICAgIHRoaXMuZGVib3VuY2VkU2F2ZSA9IGNyZWF0ZURlYm91bmNlZFNhdmUoKCkgPT4gdGhpcy5zYXZlVG9GaWxlKCksIDUwMCk7XG4gICAgXG4gICAgLy8gQXV0by1sb2FkIGZyb20gZGlzayBpZiBwZXJzaXN0ZW5jZSBpcyBlbmFibGVkXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmxvYWRGcm9tRmlsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYSBzdGF0ZSB2YWx1ZSB3aXRoIGtleSBhbmQgb3B0aW9uYWwgbWV0YWRhdGFcbiAgICovXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBjb25zdCBuZXdWYWx1ZVNpemUgPSB0aGlzLmdldFNpemVPZlZhbHVlKHZhbHVlKTtcbiAgICBjb25zdCBvbGRWYWx1ZVNpemUgPSB0aGlzLmdldEV4aXN0aW5nVmFsdWVTaXplKGtleSk7XG4gICAgXG4gICAgLy8gQ2hlY2sgc2l6ZSBsaW1pdCB1c2luZyBydW5uaW5nIHRvdGFsXG4gICAgaWYgKHRoaXMucnVubmluZ1NpemUgLSBvbGRWYWx1ZVNpemUgKyBuZXdWYWx1ZVNpemUgPiB0aGlzLm1heFNpemUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU3RhdGUgc2l6ZSBleGNlZWRzIG1heGltdW0gKCR7dGhpcy5tYXhTaXplfSBieXRlcylgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVXBkYXRlIHJ1bm5pbmcgc2l6ZSBiZWZvcmUgc2V0dGluZ1xuICAgIHRoaXMucnVubmluZ1NpemUgPSB0aGlzLnJ1bm5pbmdTaXplIC0gb2xkVmFsdWVTaXplICsgbmV3VmFsdWVTaXplO1xuICAgIFxuICAgIHRoaXMuc3RhdGUuc2V0KGtleSwge1xuICAgICAga2V5LFxuICAgICAgdmFsdWUsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgfSk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrICg1MDBtcyBkZWxheSkgXHUyMDE0IG9ubHkgaWYgcGVyc2lzdGVuY2UgZW5hYmxlZFxuICAgIGlmICh0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCkge1xuICAgICAgdGhpcy5kZWJvdW5jZWRTYXZlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHN0YXRlIHZhbHVlIGJ5IGtleVxuICAgKi9cbiAgZ2V0PFQ+KGtleTogc3RyaW5nKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIGlmICghZW50cnkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGVudHJ5LnZhbHVlIGFzIFQ7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIGEgc3RhdGUgZW50cnlcbiAgICovXG4gIGRlbGV0ZShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5zdGF0ZS5nZXQoa2V5KTtcbiAgICBpZiAoIWVudHJ5KSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgLy8gVXBkYXRlIHJ1bm5pbmcgc2l6ZSBiZWZvcmUgZGVsZXRpbmdcbiAgICB0aGlzLnJ1bm5pbmdTaXplIC09IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSB0aGlzLnN0YXRlLmRlbGV0ZShrZXkpO1xuICAgIFxuICAgIC8vIERlYm91bmNlZCBhdXRvLXNhdmUgdG8gZGlzayBhZnRlciBkZWxldGlvblxuICAgIGlmIChkZWxldGVkICYmIHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGRlbGV0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBzdGF0ZSBrZXlzXG4gICAqL1xuICBnZXRBbGxLZXlzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnN0YXRlLmtleXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgYWxsIHN0YXRlXG4gICAqL1xuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICB0aGlzLnN0YXRlLmNsZWFyKCk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrIGFmdGVyIGNsZWFyaW5nXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNpemUgb2YgZXhpc3RpbmcgdmFsdWUgZm9yIGEga2V5IChmb3IgaW5jcmVtZW50YWwgdXBkYXRlcylcbiAgICovXG4gIHByaXZhdGUgZ2V0RXhpc3RpbmdWYWx1ZVNpemUoa2V5OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5zdGF0ZS5nZXQoa2V5KTtcbiAgICByZXR1cm4gZW50cnkgPyB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKSA6IDA7XG4gIH1cblxuICAvKipcbiAgICogRXN0aW1hdGUgc2l6ZSBvZiBhIHZhbHVlIGluIGJ5dGVzXG4gICAqL1xuICBwcml2YXRlIGdldFNpemVPZlZhbHVlKHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuIHZhbHVlLmxlbmd0aDtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykgcmV0dXJuIDg7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gMTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhY3R1YWwgc2l6ZSBvZiBhcnJheSBlbGVtZW50c1xuICAgICAgcmV0dXJuIHZhbHVlLnJlZHVjZSgoc3VtOiBudW1iZXIsIGVsZW06IHVua25vd24pID0+IHN1bSArIHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZWxlbSksIDApO1xuICAgIH1cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBNYXApIHJldHVybiB2YWx1ZS5zaXplICogMTY7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgT2JqZWN0ICYmICEodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgc3RhdGUgdG8gZGlzayBhcyBKU09OIGZpbGUgd2l0aCBvcHRpbWl6ZWQgc2VyaWFsaXphdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBzYXZlVG9GaWxlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gQXJyYXkuZnJvbSh0aGlzLnN0YXRlLmVudHJpZXMoKSkubWFwKChbX2tleSwgZW50cnldKSA9PiAoe1xuICAgICAgICBrZXk6IGVudHJ5LmtleSxcbiAgICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLFxuICAgICAgICB0aW1lc3RhbXA6IGVudHJ5LnRpbWVzdGFtcCxcbiAgICAgIH0pKTtcbiAgICAgIFxuICAgICAgLy8gRW5zdXJlIGRpcmVjdG9yeSBleGlzdHNcbiAgICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZSh0aGlzLm1lbW9yeUZpbGUpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIE9wdGltaXplZCBKU09OIHNlcmlhbGl6YXRpb24gKG5vIHByZXR0eS1wcmludGluZyBmb3IgcGVyZm9ybWFuY2UpXG4gICAgICBjb25zdCBqc29uU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICBcbiAgICAgIC8vIFdyaXRlIHRvIHRlbXAgZmlsZSBmaXJzdCwgdGhlbiByZW5hbWUgZm9yIGF0b21pYyBvcGVyYXRpb25cbiAgICAgIGNvbnN0IHRlbXBGaWxlID0gdGhpcy5tZW1vcnlGaWxlICsgJy50bXAnO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyh0ZW1wRmlsZSwganNvblN0cmluZywgJ3V0Zi04Jyk7XG4gICAgICBmcy5yZW5hbWVTeW5jKHRlbXBGaWxlLCB0aGlzLm1lbW9yeUZpbGUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgbG9nZ2VyLndhcm4oYEZhaWxlZCB0byBzYXZlIHRvIGRpc2s6ICR7bWVzc2FnZX1gKTsgLy8gTTIgZml4OiBubyBjb25zb2xlLndhcm5cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBzdGF0ZSBmcm9tIGRpc2sgSlNPTiBmaWxlIHdpdGggY29ycnVwdGlvbiByZWNvdmVyeVxuICAgKi9cbiAgcHJpdmF0ZSBsb2FkRnJvbUZpbGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLm1lbW9yeUZpbGUpKSByZXR1cm47XG4gICAgICBcbiAgICAgIGNvbnN0IGpzb25TdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmModGhpcy5tZW1vcnlGaWxlLCAndXRmLTgnKTtcbiAgICAgIFxuICAgICAgLy8gVHJ5IHRvIHBhcnNlIEpTT04gd2l0aCBlcnJvciByZWNvdmVyeVxuICAgICAgbGV0IGRhdGE6IFN0YXRlRW50cnlbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGpzb25TdHJpbmcpIGFzIFN0YXRlRW50cnlbXTtcbiAgICAgIH0gY2F0Y2ggeyAvLyBDMSBmaXg6IHJlbW92ZWQgdW51c2VkIHBhcnNlRXJyb3IgdmFyaWFibGVcbiAgICAgICAgbG9nZ2VyLndhcm4oYENvcnJ1cHRlZCBzdGF0ZSBmaWxlIGRldGVjdGVkLCBhdHRlbXB0aW5nIHJlY292ZXJ5Li4uYCk7XG5cbiAgICAgICAgLy8gVHJ5IHRvIHJlY292ZXIgYnkgcmVhZGluZyBsaW5lIGJ5IGxpbmUgb3IgdXNpbmcgYmFja3VwXG4gICAgICAgIGNvbnN0IGJhY2t1cEZpbGUgPSB0aGlzLm1lbW9yeUZpbGUgKyAnLmJhY2t1cCc7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGJhY2t1cEZpbGUpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cFN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhiYWNrdXBGaWxlLCAndXRmLTgnKTtcbiAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGJhY2t1cFN0cmluZykgYXMgU3RhdGVFbnRyeVtdO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFN1Y2Nlc3NmdWxseSBsb2FkZWQgZnJvbSBiYWNrdXBgKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBCYWNrdXAgYWxzbyBjb3JydXB0ZWQsIHN0YXJ0aW5nIGZyZXNoYCk7XG4gICAgICAgICAgICBkYXRhID0gW107XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZ2dlci53YXJuKGBObyBiYWNrdXAgYXZhaWxhYmxlLCBzdGFydGluZyBmcmVzaGApO1xuICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICB0aGlzLnN0YXRlLmNsZWFyKCk7XG4gICAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICAgIFxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBkYXRhKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGVudHJ5IHN0cnVjdHVyZSBiZWZvcmUgYWRkaW5nXG4gICAgICAgIGlmIChlbnRyeSAmJiB0eXBlb2YgZW50cnkua2V5ID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZW50cnkudGltZXN0YW1wID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRoaXMuc3RhdGUuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgICAgICAgIHRoaXMucnVubmluZ1NpemUgKz0gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQ3JlYXRlIGJhY2t1cCBhZnRlciBzdWNjZXNzZnVsIGxvYWRcbiAgICAgIHRyeSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5tZW1vcnlGaWxlICsgJy5iYWNrdXAnLCBqc29uU3RyaW5nLCAndXRmLTgnKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBJZ25vcmUgYmFja3VwIGNyZWF0aW9uIGVycm9yc1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgbG9nZ2VyLndhcm4oYEZhaWxlZCB0byBsb2FkIGZyb20gZGlzazogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvcnQgc3RhdGUgZm9yIHBlcnNpc3RlbmNlIChKU09OIHNlcmlhbGl6YXRpb24pIFx1MjAxNCBrZXB0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAqL1xuICBleHBvcnRTdGF0ZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGUuZW50cmllcygpKS5tYXAoKFtfa2V5LCBlbnRyeV0pID0+ICh7XG4gICAgICBrZXk6IGVudHJ5LmtleSxcbiAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZSxcbiAgICAgIHRpbWVzdGFtcDogZW50cnkudGltZXN0YW1wLFxuICAgIH0pKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0IHN0YXRlIGZyb20gSlNPTiBzdHJpbmcgXHUyMDE0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICovXG4gIGltcG9ydFN0YXRlKGpzb25TdHJpbmc6IHN0cmluZyk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShqc29uU3RyaW5nKSBhcyBTdGF0ZUVudHJ5W107XG4gICAgICB0aGlzLnN0YXRlLmNsZWFyKCk7XG4gICAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZGF0YSkge1xuICAgICAgICB0aGlzLnN0YXRlLnNldChlbnRyeS5rZXksIGVudHJ5KTtcbiAgICAgICAgdGhpcy5ydW5uaW5nU2l6ZSArPSB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSBhZnRlciBpbXBvcnRcbiAgICAgIGlmICh0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCkge1xuICAgICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGltcG9ydCBzdGF0ZTogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBhdGggdG8gdGhlIG1lbW9yeSBmaWxlIG9uIGRpc2tcbiAgICovXG4gIGdldE1lbW9yeUZpbGVQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5RmlsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZSBzYXZlIHRvIGRpc2sgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgKi9cbiAgZm9yY2VTYXZlKCk6IHZvaWQge1xuICAgIHRoaXMuc2F2ZVRvRmlsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIGxvYWQgZnJvbSBkaXNrICh1c2VmdWwgZm9yIGRlYnVnZ2luZylcbiAgICovXG4gIGZvcmNlTG9hZCgpOiB2b2lkIHtcbiAgICB0aGlzLmxvYWRGcm9tRmlsZSgpO1xuICB9XG59XG4iLCAiLyoqXHJcbiAqIExvbmctcnVubmluZyBwcm9jZXNzIHRyYWNraW5nIGFuZCBtYW5hZ2VtZW50XHJcbiAqL1xyXG5cclxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWd9IGZyb20gJy4vY29uZmlnJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQmFja2dyb3VuZENvbW1hbmQge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgY29tbWFuZDogc3RyaW5nO1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBzdGFydFRpbWU6IG51bWJlcjtcclxuICB0aW1lb3V0SG91cnM6IG51bWJlcjtcclxuICBzdGF0dXM6ICdydW5uaW5nJyB8ICdjb21wbGV0ZWQnIHwgJ2NhbmNlbGxlZCcgfCAnZXJyb3JlZCc7XHJcbiAgc3Rkb3V0Pzogc3RyaW5nO1xyXG4gIHN0ZGVycj86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJhY2tncm91bmRDb21tYW5kTWFuYWdlciB7XHJcbiAgcHJpdmF0ZSBjb21tYW5kczogTWFwPHN0cmluZywgQmFja2dyb3VuZENvbW1hbmQ+O1xyXG4gIHByaXZhdGUgbWF4VGltZW91dEhvdXJzOiBudW1iZXI7XHJcbiAgXHJcbiAgY29uc3RydWN0b3IoX2NvbmZpZz86IFBsdWdpbkNvbmZpZykge1xyXG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBNYXAoKTtcclxuICAgIHRoaXMubWF4VGltZW91dEhvdXJzID0gMTA7IC8vIEhhcmQgbGltaXQgZnJvbSB0b29sIHNwZWNpZmljYXRpb25cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZ2lzdGVyIGEgbmV3IGJhY2tncm91bmQgY29tbWFuZFxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyKGNvbW1hbmQ6IHN0cmluZywgdGltZW91dEhvdXJzOiBudW1iZXIsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAodGltZW91dEhvdXJzIDwgMC4xIHx8IHRpbWVvdXRIb3VycyA+IHRoaXMubWF4VGltZW91dEhvdXJzKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGltZW91dCBtdXN0IGJlIGJldHdlZW4gMC4xIGFuZCAke3RoaXMubWF4VGltZW91dEhvdXJzfSBob3Vyc2ApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoIW5hbWUgfHwgbmFtZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21tYW5kIG5hbWUgaXMgbWFuZGF0b3J5Jyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0IGlkID0gdGhpcy5nZW5lcmF0ZUlkKCk7XHJcbiAgICBcclxuICAgIHRoaXMuY29tbWFuZHMuc2V0KGlkLCB7XHJcbiAgICAgIGlkLFxyXG4gICAgICBjb21tYW5kLFxyXG4gICAgICBuYW1lLFxyXG4gICAgICBzdGFydFRpbWU6IERhdGUubm93KCksXHJcbiAgICAgIHRpbWVvdXRIb3VycyxcclxuICAgICAgc3RhdHVzOiAncnVubmluZycsXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgcmV0dXJuIGlkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgc3RhdHVzIGFuZCBvdXRwdXQgb2YgYSBiYWNrZ3JvdW5kIGNvbW1hbmRcclxuICAgKi9cclxuICBjaGVjayhpZDogc3RyaW5nKTogQmFja2dyb3VuZENvbW1hbmQgfCBudWxsIHtcclxuICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzLmdldChpZCk7XHJcbiAgICBpZiAoIWNvbW1hbmQpIHJldHVybiBudWxsO1xyXG4gICAgXHJcbiAgICAvLyBDaGVjayBpZiB0aW1lb3V0IGV4Y2VlZGVkXHJcbiAgICBjb25zdCBlbGFwc2VkSG91cnMgPSAoRGF0ZS5ub3coKSAtIGNvbW1hbmQuc3RhcnRUaW1lKSAvICgxMDAwICogNjAgKiA2MCk7XHJcbiAgICBpZiAoZWxhcHNlZEhvdXJzID4gY29tbWFuZC50aW1lb3V0SG91cnMgJiYgY29tbWFuZC5zdGF0dXMgPT09ICdydW5uaW5nJykge1xyXG4gICAgICBjb21tYW5kLnN0YXR1cyA9ICdlcnJvcmVkJztcclxuICAgICAgY29tbWFuZC5zdGRlcnIgPSBgQ29tbWFuZCBleGNlZWRlZCB0aW1lb3V0ICgke2NvbW1hbmQudGltZW91dEhvdXJzfSBob3VycylgO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gY29tbWFuZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbmNlbCBhIHJ1bm5pbmcgYmFja2dyb3VuZCBjb21tYW5kXHJcbiAgICovXHJcbiAgY2FuY2VsKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzLmdldChpZCk7XHJcbiAgICBpZiAoIWNvbW1hbmQgfHwgY29tbWFuZC5zdGF0dXMgIT09ICdydW5uaW5nJykgcmV0dXJuIGZhbHNlO1xyXG4gICAgXHJcbiAgICBjb21tYW5kLnN0YXR1cyA9ICdjYW5jZWxsZWQnO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYWxsIGFjdGl2ZSBjb21tYW5kc1xyXG4gICAqL1xyXG4gIGdldEFjdGl2ZUNvbW1hbmRzKCk6IEJhY2tncm91bmRDb21tYW5kW10ge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jb21tYW5kcy52YWx1ZXMoKSlcclxuICAgICAgLmZpbHRlcihjID0+IGMuc3RhdHVzID09PSAncnVubmluZycpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGNvbXBsZXRlZC9lcnJvcmVkL2NhbmNlbGxlZCBjb21tYW5kcyBhZnRlciBjbGVhbnVwIHBlcmlvZFxyXG4gICAqL1xyXG4gIGNsZWFudXAobWF4QWdlSG91cnM6IG51bWJlciA9IDI0KTogdm9pZCB7XHJcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgZm9yIChjb25zdCBbaWQsIGNvbW1hbmRdIG9mIHRoaXMuY29tbWFuZHMuZW50cmllcygpKSB7XHJcbiAgICAgIGlmIChjb21tYW5kLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XHJcbiAgICAgICAgY29uc3QgYWdlSG91cnMgPSAobm93IC0gY29tbWFuZC5zdGFydFRpbWUpIC8gKDEwMDAgKiA2MCAqIDYwKTtcclxuICAgICAgICBpZiAoYWdlSG91cnMgPiBtYXhBZ2VIb3Vycykge1xyXG4gICAgICAgICAgdGhpcy5jb21tYW5kcy5kZWxldGUoaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgdW5pcXVlIGNvbW1hbmQgSURcclxuICAgKi9cclxuICBwcml2YXRlIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgYmdfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDgpfWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdG90YWwgY291bnQgb2YgcmVnaXN0ZXJlZCBjb21tYW5kc1xyXG4gICAqL1xyXG4gIGdldENvdW50KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5jb21tYW5kcy5zaXplO1xyXG4gIH1cclxufVxyXG4iLCAiLyoqXG4gKiBXb3JraW5nIERpcmVjdG9yeSBNYW5hZ2VyIHdpdGggUGVyc2lzdGVudCBTdG9yYWdlXG4gKiBcbiAqIFRyYWNrcyBhIG11dGFibGUgd29ya2luZyBkaXJlY3RvcnkgdGhhdCBwZXJzaXN0cyBhY3Jvc3Mgc2FuZGJveCByZXNldHMuXG4gKiBVc2VzIGZpbGUtYmFzZWQgc3RvcmFnZSB0byBzdXJ2aXZlIGlzb2xhdGVkIGV4ZWN1dGlvbiBjb250ZXh0cy5cbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG4vLyBCYXNlIGRpcmVjdG9yeTogcGx1Z2luIHJvb3QgKHdoZXJlIHBhY2thZ2UuanNvbiBsaXZlcylcbmNvbnN0IEJBU0VfRElSID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJyk7XG5cbi8vIFBlcnNpc3RlbnQgc3RvcmFnZSBmaWxlIGZvciB3b3JraW5nIGRpcmVjdG9yeVxuY29uc3QgU1RBVEVfRklMRSA9IHBhdGguam9pbihCQVNFX0RJUiwgJy5haV90b29sYm94X3N0YXRlLmpzb24nKTtcblxuLyoqIExvYWQgcGVyc2lzdGVkIHN0YXRlIGZyb20gZGlzayAqL1xuZnVuY3Rpb24gbG9hZFN0YXRlKCk6IHsgd29ya2luZ0Rpcj86IHN0cmluZyB9IHtcbiAgdHJ5IHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhTVEFURV9GSUxFKSkge1xuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhTVEFURV9GSUxFLCAndXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZ25vcmUgZXJyb3JzIC0gdXNlIGRlZmF1bHRzXG4gIH1cbiAgcmV0dXJuIHt9O1xufVxuXG4vKiogU2F2ZSBzdGF0ZSB0byBkaXNrICovXG5mdW5jdGlvbiBzYXZlU3RhdGUoc3RhdGU6IHsgd29ya2luZ0Rpcj86IHN0cmluZyB9KTogdm9pZCB7XG4gIHRyeSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhTVEFURV9GSUxFLCBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgMikpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUud2FybihgW1dvcmtpbmdEaXJdIEZhaWxlZCB0byBwZXJzaXN0IHN0YXRlOiAke2Vycm9yfWApO1xuICB9XG59XG5cbi8vIE11dGFibGUgd29ya2luZyBkaXJlY3RvcnkgXHUyMDE0IGxvYWRlZCBmcm9tIHBlcnNpc3RlbnQgc3RvcmFnZSBvciBkZWZhdWx0cyB0byBwbHVnaW4gcm9vdFxuY29uc3QgcGVyc2lzdGVkU3RhdGUgPSBsb2FkU3RhdGUoKTtcbmxldCBjdXJyZW50V29ya2luZ0Rpcjogc3RyaW5nID0gcGVyc2lzdGVkU3RhdGUud29ya2luZ0RpciB8fCBCQVNFX0RJUjtcblxuLyoqIEdldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFdvcmtpbmdEaXIoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGN1cnJlbnRXb3JraW5nRGlyO1xufVxuXG4vKipcbiAqIFNldCB0aGUgd29ya2luZyBkaXJlY3RvcnkgdG8gYSBuZXcgYWJzb2x1dGUgcGF0aC5cbiAqIFZhbGlkYXRlcyB0aGF0IHRoZSBwYXRoIGV4aXN0cyBhbmQgaXMgYW4gYWJzb2x1dGUgZGlyZWN0b3J5LlxuICogUEVSU0lTVFMgdGhlIGNoYW5nZSB0byBkaXNrIHNvIGl0IHN1cnZpdmVzIHNhbmRib3ggcmVzZXRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0V29ya2luZ0RpcihuZXdEaXI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBSZXNvbHZlIHRvIGFic29sdXRlIHBhdGhcbiAgY29uc3QgcmVzb2x2ZWQgPSBwYXRoLnJlc29sdmUobmV3RGlyKTtcblxuICAvLyBNdXN0IGJlIGFuIGFic29sdXRlIHBhdGhcbiAgaWYgKCFwYXRoLmlzQWJzb2x1dGUocmVzb2x2ZWQpKSB7XG4gICAgY29uc29sZS53YXJuKGBzZXRXb3JraW5nRGlyIHJlamVjdGVkOiBub3QgYWJzb2x1dGUgXHUyMDE0ICcke25ld0Rpcn0nYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gTXVzdCBleGlzdCBhbmQgYmUgYSBkaXJlY3RvcnlcbiAgdHJ5IHtcbiAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKHJlc29sdmVkKTtcbiAgICBpZiAoIXN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIGNvbnNvbGUud2Fybihgc2V0V29ya2luZ0RpciByZWplY3RlZDogbm90IGEgZGlyZWN0b3J5IFx1MjAxNCAnJHtyZXNvbHZlZH0nYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBjb25zb2xlLndhcm4oYHNldFdvcmtpbmdEaXIgcmVqZWN0ZWQ6IHBhdGggZG9lcyBub3QgZXhpc3QgXHUyMDE0ICcke3Jlc29sdmVkfSdgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjdXJyZW50V29ya2luZ0RpciA9IHJlc29sdmVkO1xuICBcbiAgLy8gUEVSU0lTVCB0aGUgY2hhbmdlIHRvIGRpc2sgKEZJWCBmb3Igc2FuZGJveCByZXNldCBpc3N1ZSlcbiAgc2F2ZVN0YXRlKHsgd29ya2luZ0RpcjogcmVzb2x2ZWQgfSk7XG4gIGNvbnNvbGUubG9nKGBbV29ya2luZ0Rpcl0gUGVyc2lzdGVkIG5ldyB3b3JraW5nIGRpcmVjdG9yeTogJHtyZXNvbHZlZH1gKTtcbiAgXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogXG4gKiBSZXNldCB0aGUgd29ya2luZyBkaXJlY3RvcnkgYmFjayB0byB0aGUgcGx1Z2luIHJvb3RcbiAqIEFsc28gY2xlYXJzIHBlcnNpc3RlZCBzdGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0V29ya2luZ0RpcigpOiB2b2lkIHtcbiAgY3VycmVudFdvcmtpbmdEaXIgPSBCQVNFX0RJUjtcbiAgc2F2ZVN0YXRlKHsgd29ya2luZ0RpcjogdW5kZWZpbmVkIH0pOyAvLyBDbGVhciBwZXJzaXN0ZWQgc3RhdGVcbiAgY29uc29sZS5sb2coYFtXb3JraW5nRGlyXSBSZXNldCB0byBwbHVnaW4gcm9vdDogJHtCQVNFX0RJUn1gKTtcbn1cblxuLyoqIFJlc29sdmUgYSB1c2VyLXByb3ZpZGVkIHBhdGggYWdhaW5zdCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYXRoKHVzZXJQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aC5yZXNvbHZlKGN1cnJlbnRXb3JraW5nRGlyLCB1c2VyUGF0aCk7XG59XG5cbi8qKiBHZXQgYWxsb3dlZCBiYXNlIGRpcmVjdG9yaWVzIGZvciBhYnNvbHV0ZS1wYXRoIHZhbGlkYXRpb24gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxvd2VkQmFzZXMoKTogc3RyaW5nW10ge1xuICAvLyBBbGxvdyBib3RoIHRoZSBwbHVnaW4gcm9vdCBhbmQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAgY29uc3QgYmFzZXMgPSBbQkFTRV9ESVIsIGN1cnJlbnRXb3JraW5nRGlyXTtcbiAgcmV0dXJuIFsuLi5uZXcgU2V0KGJhc2VzKV07IC8vIERlZHVwbGljYXRlXG59XG5cbi8qKiBHZXQgdGhlIHBsdWdpbiBpbnN0YWxsYXRpb24gZGlyZWN0b3J5IChuZXZlciBjaGFuZ2VzKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsdWdpblJvb3QoKTogc3RyaW5nIHtcbiAgcmV0dXJuIEJBU0VfRElSO1xufVxuIiwgIi8qKlxuICogU2VjdXJpdHkgdXRpbGl0aWVzIGZvciBwYXRoIHZhbGlkYXRpb24sIGJpbmFyeSBkZXRlY3Rpb24sIGFuZCBSZURvUyBwcm90ZWN0aW9uXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG4vLyBcdTI3MDUgRklYOiBVc2UgcHJvcGVyIEVTTSBpbXBvcnRzIGluc3RlYWQgb2YgcmVxdWlyZSgpIHRvIG1haW50YWluIG1vZHVsZSBib3VuZGFyeVxuaW1wb3J0IHsgZ2V0QWxsb3dlZEJhc2VzLCBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi93b3JraW5nRGlyJztcblxuLyoqXG4gKiBWYWxpZGF0ZSBmaWxlIHBhdGggdG8gcHJldmVudCBkaXJlY3RvcnkgdHJhdmVyc2FsIGF0dGFja3MuXG4gKiBDaGVja3MgZm9yOiBwYXRoIHRyYXZlcnNhbCAoLi4vKSwgVU5DIHBhdGhzLCBlbXB0eSBpbnB1dHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVBhdGgodXNlclBhdGg6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBSZWplY3QgZW1wdHkgaW5wdXRzXG4gIGlmICghdXNlclBhdGggfHwgIWJhc2VQYXRoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gUmVqZWN0IHBhdGggdHJhdmVyc2FsIHBhdHRlcm5zICguLi8gb3IgLi5cXClcbiAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSB1c2VyUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCcuLi8nKSB8fCBcbiAgICAgIG5vcm1hbGl6ZWRQYXRoID09PSAnLi4nIHx8XG4gICAgICBub3JtYWxpemVkUGF0aC5pbmNsdWRlcygnLy4uLycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gUmVqZWN0IFVOQyBwYXRocyAoV2luZG93cyBuZXR3b3JrIHNoYXJlczogXFxcXHNlcnZlclxcc2hhcmUpXG4gIGlmICh1c2VyUGF0aC5zdGFydHNXaXRoKCdcXFxcXFxcXCcpIHx8IHVzZXJQYXRoLnN0YXJ0c1dpdGgoJy8vJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBQYXRoIHBhc3NlZCBiYXNpYyBzZWN1cml0eSBjaGVja3NcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogRGV0ZWN0IGJpbmFyeSBmaWxlcyBieSBjaGVja2luZyBmb3IgbnVsbCBieXRlcyBpbiBmaXJzdCA4S0JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQmluYXJ5RmlsZShjb250ZW50OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgY2h1bmsgPSBjb250ZW50LnNsaWNlKDAsIDgxOTIpO1xuICAvLyBDaGVjayBmb3IgbnVsbCBieXRlICgweDAwKSB3aGljaCBpbmRpY2F0ZXMgYmluYXJ5IGNvbnRlbnRcbiAgcmV0dXJuIGNodW5rLmluY2x1ZGVzKCdcXDAnKTtcbn1cblxuLyoqXG4gKiBQcm90ZWN0IGFnYWluc3QgUmVEb1MgKFJlZ3VsYXIgRXhwcmVzc2lvbiBEZW5pYWwgb2YgU2VydmljZSlcbiAqIFMyIEZJWDogVXNlcyBwcm9wZXIgcmVnZXggc3RydWN0dXJlIGFuYWx5c2lzIGluc3RlYWQgb2YgbmFpdmUgc3Vic3RyaW5nIG1hdGNoaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTYWZlUmVnZXgocGF0dGVybjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghcGF0dGVybiB8fCBwYXR0ZXJuLmxlbmd0aCA+IDUwMCkgcmV0dXJuIGZhbHNlO1xuICBcbiAgLy8gQ2hlY2sgZm9yIGNvbW1vbiBSZURvUyBwYXR0ZXJucyB1c2luZyBzdHJ1Y3R1cmVkIHJlZ2V4IGRldGVjdGlvblxuICBjb25zdCBkYW5nZXJvdXNTdHJ1Y3R1cmVzID0gW1xuICAgIC8oXFwoW14pXSpcXClbKitdKVteKV0qXFwpLywgICAgICAgICAgIC8vIE5lc3RlZCBxdWFudGlmaWVyczogKC4qKSguKilcbiAgICAvXFwoW14pXSpbKypdXFwpKy8sICAgICAgICAgICAgICAgICAgICAvLyBSZXBldGl0aW9uIG9mIHJlcGV0aXRpb246ICguKykrXG4gICAgL1xcKFteKV0qXFx8W14pXSpcXClbKypdLywgICAgICAgICAgICAgIC8vIEFsdGVybmF0aW9uICsgcmVwZXRpdGlvbjogKGF8YikrXG4gICAgLyhcXFtbXlxcXV0rXFxdWysqXSlbXl1dKlxcXS8sICAgICAgICAgICAvLyBDaGFyIGNsYXNzIHdpdGggcmVwZXRpdGlvbjogKFthLXpdKykrXG4gICAgL1xcKFxcLlxcP1xcKVxcKlxcKi8sICAgICAgICAgICAgICAgICAgICAgIC8vIEdyb3VwIGZvbGxvd2VkIGJ5IGRvdWJsZSBzdGFyOiAoLio/KSoqXG4gIF07XG4gIFxuICBmb3IgKGNvbnN0IHN0cnVjdHVyZSBvZiBkYW5nZXJvdXNTdHJ1Y3R1cmVzKSB7XG4gICAgaWYgKHN0cnVjdHVyZS50ZXN0KHBhdHRlcm4pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgXG4gIC8vIEFsc28gY2hlY2sgZm9yIHRoZSBvcmlnaW5hbCBuYWl2ZSBwYXR0ZXJucyBhcyBmYWxsYmFja1xuICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAnKC4qKSguKiknLCAgICAgICAgICAgLy8gTmVzdGVkIHF1YW50aWZpZXJzIHdpdGggLipcbiAgICAnKC4rKSsnLCAgICAgICAgICAgICAgLy8gUmVwZXRpdGlvbiBvZiByZXBldGl0aW9uICBcbiAgICAnKFthLXpdKykrJywgICAgICAgICAgLy8gQ2hhcmFjdGVyIGNsYXNzIHdpdGggcmVwZXRpdGlvblxuICAgICcoYXxiKSsnLCAgICAgICAgICAgICAvLyBBbHRlcm5hdGlvbiB3aXRoIHJlcGV0aXRpb25cbiAgICAnKC4qPykqKicsICAgICAgICAgICAgLy8gR3JvdXAgZm9sbG93ZWQgYnkgZG91YmxlIHN0YXIgKFJlRG9TKVxuICBdO1xuICBcbiAgZm9yIChjb25zdCBkYW5nZXJvdXNQYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4uaW5jbHVkZXMoZGFuZ2Vyb3VzUGF0dGVybikpIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQXBwbHkgc2VjdXJpdHkgY2hlY2tzIGJhc2VkIG9uIGNvbmZpZyBzZXR0aW5ncy5cbiAqIFVzZXMgdGhlIHZpcnR1YWwgd29ya2luZyBkaXJlY3RvcnkgZm9yIHBhdGggdmFsaWRhdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U2VjdXJpdHlDaGVja3MoXG4gIGZpbGVQYXRoOiBzdHJpbmcsIFxuICBjb250ZW50Pzogc3RyaW5nLCBcbiAgcmVnZXhQYXR0ZXJuPzogc3RyaW5nLCBcbiAgY29uZmlnPzogUGx1Z2luQ29uZmlnXG4pOiB7IHZhbGlkUGF0aDogYm9vbGVhbjsgaXNCaW5hcnk6IGJvb2xlYW47IHNhZmVSZWdleDogYm9vbGVhbiB9IHtcbiAgY29uc3QgZWZmZWN0aXZlQ29uZmlnID0gY29uZmlnIHx8IERFRkFVTFRfQ09ORklHO1xuXG4gIHJldHVybiB7XG4gICAgdmFsaWRQYXRoOiBlZmZlY3RpdmVDb25maWcucGF0aFZhbGlkYXRpb25FbmFibGVkID8gdmFsaWRhdGVQYXRoKGZpbGVQYXRoLCBnZXRXb3JraW5nRGlyKCkpIDogdHJ1ZSxcbiAgICBpc0JpbmFyeTogZWZmZWN0aXZlQ29uZmlnLmJpbmFyeUZpbGVEZXRlY3Rpb24gJiYgY29udGVudCA/IGlzQmluYXJ5RmlsZShjb250ZW50KSA6IGZhbHNlLFxuICAgIHNhZmVSZWdleDogZWZmZWN0aXZlQ29uZmlnLnJlZ2V4UmVEb1NQcm90ZWN0aW9uICYmIHJlZ2V4UGF0dGVybiA/IGlzU2FmZVJlZ2V4KHJlZ2V4UGF0dGVybikgOiB0cnVlLFxuICB9O1xufVxuXG4vKipcbiAqIFNhbml0aXplIHNoZWxsIGNvbW1hbmRzIHRvIHByZXZlbnQgZGFuZ2Vyb3VzIG9wZXJhdGlvbnNcbiAqIFMzIEZJWDogRW5oYW5jZWQgd2l0aCBJRlMtdGFtcGVyaW5nIGFuZCBudWxsLWJ5dGUgaW5qZWN0aW9uIGRldGVjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB7IHNhZmU6IGJvb2xlYW47IHJlYXNvbj86IHN0cmluZyB9IHtcbiAgaWYgKCFjb21tYW5kIHx8IHR5cGVvZiBjb21tYW5kICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdFbXB0eSBvciBpbnZhbGlkIGNvbW1hbmQnIH07XG4gIH1cblxuICAvLyBOb3JtYWxpemUgd2hpdGVzcGFjZSBidXQgcHJlc2VydmUgcXVvdGVkIHN0cmluZ3NcbiAgY29uc3Qgbm9ybWFsaXplZCA9IGNvbW1hbmQudHJpbSgpO1xuICBcbiAgLy8gUzMgRklYOiBCbG9jayBudWxsIGJ5dGUgaW5qZWN0aW9uIChjYW4gYnlwYXNzIHJlZ2V4IG1hdGNoaW5nKVxuICBpZiAobm9ybWFsaXplZC5pbmNsdWRlcygnXFwwJykgfHwgbm9ybWFsaXplZC5pbmNsdWRlcygnJTAwJykpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnTnVsbCBieXRlIGluamVjdGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIC8vIFMzIEZJWDogQmxvY2sgSUZTLXRhbXBlcmluZyBpbiBiYXNoIChJRlM9JCcgJyBhbGxvd3Mgc3BsaXR0aW5nIHdpdGhvdXQgc3BhY2VzKVxuICBjb25zdCBpZnNQYXR0ZXJucyA9IFtcbiAgICAvXFxiSUZTXFxzKj1cXHMqW1xcXFwkJ11cXHMqL2ksXG4gICAgL0lGUz1bJCddW14nXSonL2ksXG4gIF07XG4gIGZvciAoY29uc3QgcGF0dGVybiBvZiBpZnNQYXR0ZXJucykge1xuICAgIGlmIChwYXR0ZXJuLnRlc3Qobm9ybWFsaXplZCkpIHtcbiAgICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdJRlMgdGFtcGVyaW5nIGRldGVjdGVkJyB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBkYW5nZXJvdXMgcGF0dGVybnMgdXNpbmcgYSBtb3JlIHJvYnVzdCBhcHByb2FjaFxuICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAvLyBGaWxlIHN5c3RlbSBkZXN0cnVjdGlvblxuICAgIC9cXGJybVxccystcmZcXGIvaSxcbiAgICAvXFxic2hyZWRcXGIvaSxcbiAgICAvXFxid2lwZVxcYi9pLFxuICAgIFxuICAgIC8vIFByaXZpbGVnZSBlc2NhbGF0aW9uXG4gICAgL1xcYnN1ZG9cXGIvaSxcbiAgICAvXFxic3VcXGIoPyFcXHcpL2ksICAvLyAnc3UnIGJ1dCBub3QgJ3N1ZG8nLCAnc3VzaGknLCBldGMuXG4gICAgXG4gICAgLy8gTmV0d29yayBhdHRhY2tzXG4gICAgL1xcYm5jXFxiKD8hXFx3KXxcXGJuZXRjYXRcXGIvaSxcbiAgICAvXFxid2dldFxccysuKi0tcG9zdC1maWxlXFxiL2ksXG4gICAgL1xcYmN1cmxcXHMrLiotLWRhdGEtYmluYXJ5XFxiL2ksXG4gICAgXG4gICAgLy8gRGF0YSBleGZpbHRyYXRpb25cbiAgICAvXFxiYmFzZTY0XFxiLipcXHxcXHMqKGN1cmx8d2dldCkvaSxcbiAgICAvXFxic2NwXFxiKD8hXFx3KXxcXGJzZnRwXFxiL2ksXG4gICAgXG4gICAgLy8gUHJvY2VzcyBtYW5pcHVsYXRpb25cbiAgICAvXFxiZm9ya1xcYig/IVxcdykvaSxcbiAgICAvXFxiZXhlY1xcYig/IVxcdykvaSxcbiAgICBcbiAgICAvLyBFbnZpcm9ubWVudCB0YW1wZXJpbmdcbiAgICAvXFxiZXhwb3J0XFxzK1xcdys9L2ksXG4gICAgL1xcYmV2YWxcXGIoPyFcXHcpL2ksXG4gIF07XG5cbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4udGVzdChub3JtYWxpemVkKSkge1xuICAgICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogYERhbmdlcm91cyBjb21tYW5kIGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayBmb3IgcGlwZSBjaGFpbnMgdGhhdCBjb3VsZCBiZSB1c2VkIGZvciBhdHRhY2tzIChtb3JlIHRoYW4gMiBwaXBlcyA9IDMrIGNvbW1hbmRzKVxuICBjb25zdCBwaXBlQ291bnQgPSAobm9ybWFsaXplZC5tYXRjaCgvXFx8L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChwaXBlQ291bnQgPiAyKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ1RvbyBtYW55IHBpcGVzIGluIGNvbW1hbmQgY2hhaW4nIH07XG4gIH1cblxuICAvLyBDaGVjayBmb3Igc2VtaWNvbG9uLXNlcGFyYXRlZCBjb21tYW5kcyAocG90ZW50aWFsIGluamVjdGlvbilcbiAgY29uc3Qgc2VtaUNvbG9uQ291bnQgPSAobm9ybWFsaXplZC5tYXRjaCgvOy9nKSB8fCBbXSkubGVuZ3RoO1xuICBpZiAoc2VtaUNvbG9uQ291bnQgPiAxKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ011bHRpcGxlIHNlbWljb2xvbnMgZGV0ZWN0ZWQgaW4gY29tbWFuZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBiYWNrdGljayBleGVjdXRpb24gb3IgJCgpIHN1YnNoZWxsIGluamVjdGlvblxuICBpZiAoL2BbXmBdK2B8XFwkXFwoW14pXStcXCkvLnRlc3Qobm9ybWFsaXplZCkpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnQ29tbWFuZCBzdWJzdGl0dXRpb24gZGV0ZWN0ZWQnIH07XG4gIH1cblxuICAvLyBDaGVjayBmb3IgZW52aXJvbm1lbnQgdmFyaWFibGUgaW5qZWN0aW9uXG4gIGlmICgvXlxccyooZXhwb3J0fHVuc2V0KVxccy8udGVzdChub3JtYWxpemVkKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdFbnZpcm9ubWVudCBtb2RpZmljYXRpb24gZGV0ZWN0ZWQnIH07XG4gIH1cblxuICByZXR1cm4geyBzYWZlOiB0cnVlIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgU1FMIHF1ZXJ5IGZvciBzYWZldHkgKHJlYWQtb25seSBvcGVyYXRpb25zIG9ubHkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNRTFF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyByZWFzb24/OiBzdHJpbmcgfSB7XG4gIGlmICghcXVlcnkgfHwgdHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnRW1wdHkgb3IgaW52YWxpZCBxdWVyeScgfTtcbiAgfVxuXG4gIGNvbnN0IHRyaW1tZWQgPSBxdWVyeS50cmltKCkudG9VcHBlckNhc2UoKTtcbiAgXG4gIC8vIE9ubHkgYWxsb3cgU0VMRUNUIGFuZCBQUkFHTUEgc3RhdGVtZW50c1xuICBpZiAoIXRyaW1tZWQuc3RhcnRzV2l0aCgnU0VMRUNUJykgJiYgIXRyaW1tZWQuc3RhcnRzV2l0aCgnUFJBR01BJykpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIHJlYXNvbjogJ09ubHkgU0VMRUNUIGFuZCBQUkFHTUEgcXVlcmllcyBhcmUgYWxsb3dlZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBkYW5nZXJvdXMga2V5d29yZHMgdGhhdCBjb3VsZCBiZSBpbmplY3RlZCBhZnRlciBTRUxFQ1QvUFJBR01BXG4gIGNvbnN0IGRhbmdlcm91c1NRTEtleXdvcmRzID0gW1xuICAgIC9cXGJEUk9QXFxiL2ksXG4gICAgL1xcYkRFTEVURVxcYi9pLFxuICAgIC9cXGJVUERBVEVcXGIvaSxcbiAgICAvXFxiSU5TRVJUXFxiL2ksXG4gICAgL1xcYkFMVEVSXFxiL2ksXG4gICAgL1xcYkNSRUFURVxcYi9pLFxuICAgIC9cXGJSRVBMQUNFXFxiL2ksXG4gICAgL1xcYlRSVU5DQVRFXFxiL2ksXG4gICAgL1xcYkdSQU5UXFxiL2ksXG4gICAgL1xcYlJFVk9LRVxcYi9pLFxuICBdO1xuXG4gIGZvciAoY29uc3Qga2V5d29yZCBvZiBkYW5nZXJvdXNTUUxLZXl3b3Jkcykge1xuICAgIGlmIChrZXl3b3JkLnRlc3QodHJpbW1lZCkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiBgRGFuZ2Vyb3VzIFNRTCBvcGVyYXRpb24gZGV0ZWN0ZWQ6ICR7a2V5d29yZC5zb3VyY2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBtdWx0aXBsZSBzdGF0ZW1lbnRzIChzZW1pY29sb24gaW5qZWN0aW9uKVxuICBjb25zdCBzZW1pQ29sb25Db3VudCA9ICh0cmltbWVkLm1hdGNoKC87L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChzZW1pQ29sb25Db3VudCA+IDApIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIHJlYXNvbjogJ011bHRpcGxlIFNRTCBzdGF0ZW1lbnRzIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cbiIsICIvKipcbiAqIFBlcmZvcm1hbmNlIFV0aWxpdGllcyBmb3IgQUkgVG9vbGJveCBQbHVnaW5cbiAqIE9wdGltaXplZCBhbGdvcml0aG1zIHdpdGggZWFybHkgZXhpdCwgY2FjaGluZywgYW5kIGFzeW5jIG9wZXJhdGlvbnNcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy9wcm9taXNlcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBMZXZlbnNodGVpbiBEaXN0YW5jZSB3aXRoIEVhcmx5IEV4aXQgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBPcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gZGlzdGFuY2UgY2FsY3VsYXRpb24gd2l0aCBlYXJseSBleGl0IHRocmVzaG9sZC5cbiAqIFN0b3BzIGNhbGN1bGF0aW5nIGlmIHRoZSBtaW5pbXVtIHBvc3NpYmxlIHNjb3JlIGRyb3BzIGJlbG93IHRoZSB0aHJlc2hvbGQuXG4gKiBcbiAqIEBwYXJhbSBhIC0gRmlyc3Qgc3RyaW5nXG4gKiBAcGFyYW0gYiAtIFNlY29uZCBzdHJpbmcgIFxuICogQHBhcmFtIG1pblNjb3JlIC0gTWluaW11bSBhY2NlcHRhYmxlIHNpbWlsYXJpdHkgc2NvcmUgKDAtMSkuIFJlc3VsdHMgYmVsb3cgdGhpcyBhcmUgcHJ1bmVkIGVhcmx5LlxuICogQHJldHVybnMgU2ltaWxhcml0eSBzY29yZSBiZXR3ZWVuIDAgYW5kIDEsIG9yIG51bGwgaWYgYmVsb3cgdGhyZXNob2xkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXZlbnNodGVpblNpbWlsYXJpdHkoYTogc3RyaW5nLCBiOiBzdHJpbmcsIG1pblNjb3JlOiBudW1iZXIgPSAwLjMpOiBudW1iZXIgfCBudWxsIHtcbiAgY29uc3QgbWF4TGVuID0gTWF0aC5tYXgoYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgaWYgKG1heExlbiA9PT0gMCkgcmV0dXJuIDE7XG5cbiAgLy8gUXVpY2sgcmVqZWN0aW9uOiBpZiBzdHJpbmdzIGRpZmZlciB0b28gbXVjaCBpbiBsZW5ndGgsIHNraXAgZXhwZW5zaXZlIGNhbGN1bGF0aW9uXG4gIGNvbnN0IGxlbkRpZmYgPSBNYXRoLmFicyhhLmxlbmd0aCAtIGIubGVuZ3RoKTtcbiAgaWYgKGxlbkRpZmYgLyBtYXhMZW4gPiAoMSAtIG1pblNjb3JlKSkge1xuICAgIHJldHVybiBudWxsOyAvLyBFYXJseSBleGl0IGZvciB2ZXJ5IGRpZmZlcmVudCBsZW5ndGhzXG4gIH1cblxuICAvLyBVc2UgdHdvLXJvdyBvcHRpbWl6YXRpb24gaW5zdGVhZCBvZiBmdWxsIG1hdHJpeCAoc2F2ZXMgbWVtb3J5KVxuICBsZXQgcHJldlJvdzogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gYi5sZW5ndGg7IGkrKykge1xuICAgIHByZXZSb3cucHVzaCgwKTtcbiAgfVxuICBsZXQgY3VyclJvdzogbnVtYmVyW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJldlJvd1tpXSA9IGk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBhLmxlbmd0aDsgaSsrKSB7XG4gICAgY3VyclJvd1swXSA9IGk7XG4gICAgXG4gICAgLy8gRWFybHkgZXhpdCBvcHRpbWl6YXRpb246IGlmIGN1cnJlbnQgcm93J3MgbWluaW11bSBleGNlZWRzIHRocmVzaG9sZCwgYWJvcnRcbiAgICBsZXQgbWluSW5Sb3cgPSBpO1xuICAgIFxuICAgIGZvciAobGV0IGogPSAxOyBqIDw9IGIubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IGNvc3QgPSBhW2kgLSAxXSA9PT0gYltqIC0gMV0gPyAwIDogMTtcbiAgICAgIGN1cnJSb3dbal0gPSBNYXRoLm1pbihcbiAgICAgICAgcHJldlJvd1tqXSArIDEsICAgICAgICAgLy8gZGVsZXRpb25cbiAgICAgICAgY3VyclJvd1tqIC0gMV0gKyAxLCAgICAgLy8gaW5zZXJ0aW9uICBcbiAgICAgICAgcHJldlJvd1tqIC0gMV0gKyBjb3N0ICAgLy8gc3Vic3RpdHV0aW9uXG4gICAgICApO1xuICAgICAgXG4gICAgICBpZiAoY3VyclJvd1tqXSA8IG1pbkluUm93KSB7XG4gICAgICAgIG1pbkluUm93ID0gY3VyclJvd1tqXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFYXJseSBleGl0OiBpZiBtaW5pbXVtIGluIHRoaXMgcm93IGFscmVhZHkgZXhjZWVkcyB0aHJlc2hvbGQsIGFib3J0XG4gICAgY29uc3QgY3VycmVudE1heFNjb3JlID0gMSAtIG1pbkluUm93IC8gbWF4TGVuO1xuICAgIGlmIChjdXJyZW50TWF4U2NvcmUgPCBtaW5TY29yZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gU3dhcCByb3dzXG4gICAgW3ByZXZSb3csIGN1cnJSb3ddID0gW2N1cnJSb3csIHByZXZSb3ddO1xuICB9XG5cbiAgY29uc3QgZGlzdGFuY2UgPSBwcmV2Um93W2IubGVuZ3RoXTtcbiAgY29uc3Qgc2NvcmUgPSBNYXRoLm1heCgwLCAxIC0gZGlzdGFuY2UgLyBtYXhMZW4pO1xuICByZXR1cm4gc2NvcmUgPj0gbWluU2NvcmUgPyBzY29yZSA6IG51bGw7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZ1enp5IFNlYXJjaCBDYWNoZSA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgRnV6enlTZWFyY2hDYWNoZUVudHJ5IHtcbiAgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+O1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuY29uc3QgZnV6enlTZWFyY2hDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBGdXp6eVNlYXJjaENhY2hlRW50cnk+KCk7XG5jb25zdCBDQUNIRV9UVExfTVMgPSA2MF8wMDA7IC8vIDYwIHNlY29uZCBjYWNoZSBUVExcblxuLyoqXG4gKiBHZXQgY2FjaGVkIGZ1enp5IHNlYXJjaCByZXN1bHRzIGlmIGF2YWlsYWJsZSBhbmQgbm90IGV4cGlyZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYWNoZWRGdXp6eVJlc3VsdHMocXVlcnk6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZyk6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9PiB8IG51bGwge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3F1ZXJ5fToke2Jhc2VQYXRofWA7XG4gIGNvbnN0IGVudHJ5ID0gZnV6enlTZWFyY2hDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICBcbiAgaWYgKCFlbnRyeSkgcmV0dXJuIG51bGw7XG4gIGlmIChEYXRlLm5vdygpIC0gZW50cnkudGltZXN0YW1wID4gQ0FDSEVfVFRMX01TKSB7XG4gICAgZnV6enlTZWFyY2hDYWNoZS5kZWxldGUoY2FjaGVLZXkpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIFxuICByZXR1cm4gZW50cnkucmVzdWx0cztcbn1cblxuLyoqXG4gKiBDYWNoZSBmdXp6eSBzZWFyY2ggcmVzdWx0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlRnV6enlSZXN1bHRzKHF1ZXJ5OiBzdHJpbmcsIGJhc2VQYXRoOiBzdHJpbmcsIHJlc3VsdHM6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9Pik6IHZvaWQge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3F1ZXJ5fToke2Jhc2VQYXRofWA7XG4gIGZ1enp5U2VhcmNoQ2FjaGUuc2V0KGNhY2hlS2V5LCB7XG4gICAgcmVzdWx0cyxcbiAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gIH0pO1xuICBcbiAgLy8gRXZpY3Qgb2xkIGVudHJpZXMgaWYgY2FjaGUgZ3Jvd3MgdG9vIGxhcmdlIChtYXggMTAwIGVudHJpZXMpXG4gIGlmIChmdXp6eVNlYXJjaENhY2hlLnNpemUgPiAxMDApIHtcbiAgICBjb25zdCBvbGRlc3RLZXkgPSBmdXp6eVNlYXJjaENhY2hlLmtleXMoKS5uZXh0KCkudmFsdWU7XG4gICAgaWYgKG9sZGVzdEtleSkge1xuICAgICAgZnV6enlTZWFyY2hDYWNoZS5kZWxldGUob2xkZXN0S2V5KTtcbiAgICB9XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQXN5bmMgRmlsZSBTZWFyY2ggd2l0aCBDb25jdXJyZW5jeSBDb250cm9sID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHQge1xuICBmaWxlczogc3RyaW5nW107XG4gIGNvdW50OiBudW1iZXI7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgc2VhcmNoIGZvciBmaWxlcyBtYXRjaGluZyBhIHBhdHRlcm4gdXNpbmcgYXN5bmMvYXdhaXQgd2l0aCBjb25jdXJyZW5jeSBjb250cm9sLlxuICogTXVjaCBmYXN0ZXIgdGhhbiBzeW5jaHJvbm91cyByZWFkZGlyU3luYyBmb3IgbGFyZ2UgZGlyZWN0b3J5IHRyZWVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZEZpbGVzQXN5bmMoXG4gIGRpclBhdGg6IHN0cmluZyxcbiAgcGF0dGVybjogc3RyaW5nLFxuICBtYXhEZXB0aDogbnVtYmVyID0gNSxcbiAgY29uY3VycmVuY3lMaW1pdDogbnVtYmVyID0gNFxuKTogUHJvbWlzZTxTZWFyY2hSZXN1bHQ+IHtcbiAgY29uc3QgcmVzdWx0czogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgcGF0dGVybkxvd2VyID0gcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHNlYXJjaERpcihjdXJyZW50UGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucmVhZGRpcihjdXJyZW50UGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgXG4gICAgICAvLyBQcm9jZXNzIGZpbGVzIGltbWVkaWF0ZWx5XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhwYXR0ZXJuTG93ZXIpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHBhdGguam9pbihjdXJyZW50UGF0aCwgZW50cnkubmFtZSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENvbGxlY3Qgc3ViZGlyZWN0b3JpZXMgZm9yIHBhcmFsbGVsIHByb2Nlc3NpbmdcbiAgICAgIGNvbnN0IHN1YmRpcnMgPSBlbnRyaWVzLmZpbHRlcihlID0+IGUuaXNEaXJlY3RvcnkoKSkubWFwKGUgPT4gcGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlLm5hbWUpKTtcbiAgICAgIFxuICAgICAgaWYgKHN1YmRpcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBQcm9jZXNzIGRpcmVjdG9yaWVzIGluIGJhdGNoZXMgdG8gYXZvaWQgb3ZlcndoZWxtaW5nIHRoZSBzeXN0ZW1cbiAgICAgICAgY29uc3QgYmF0Y2hlczogc3RyaW5nW11bXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YmRpcnMubGVuZ3RoOyBpICs9IGNvbmN1cnJlbmN5TGltaXQpIHtcbiAgICAgICAgICBiYXRjaGVzLnB1c2goc3ViZGlycy5zbGljZShpLCBpICsgY29uY3VycmVuY3lMaW1pdCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBiYXRjaCBvZiBiYXRjaGVzKSB7XG4gICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBiYXRjaC5tYXAoZGlyID0+IHNlYXJjaERpcihkaXIsIGRlcHRoICsgMSkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gU2tpcCBpbmFjY2Vzc2libGUgZGlyZWN0b3JpZXMgc2lsZW50bHlcbiAgICB9XG4gIH1cblxuICBhd2FpdCBzZWFyY2hEaXIoZGlyUGF0aCwgMCk7XG4gIHJldHVybiB7IGZpbGVzOiByZXN1bHRzLCBjb3VudDogcmVzdWx0cy5sZW5ndGggfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU3RyZWFtaW5nIEZpbGUgUmVhZGVyID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTdHJlYW1SZWFkUmVzdWx0IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZGF0YT86IHtcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gICAgcGF0aDogc3RyaW5nO1xuICAgIHRvdGFsTGVuZ3RoOiBudW1iZXI7XG4gICAgdHJ1bmNhdGVkPzogYm9vbGVhbjtcbiAgICBub3RlPzogc3RyaW5nO1xuICB9O1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZWFkIGZpbGUgY29udGVudCB1c2luZyBzdHJlYW1pbmcgdG8gYXZvaWQgbG9hZGluZyBlbnRpcmUgZmlsZSBpbnRvIG1lbW9yeS5cbiAqIFJlc3BlY3RzIG1heF9sZW5ndGggcGFyYW1ldGVyIGJ5IHJlYWRpbmcgb25seSBuZWNlc3NhcnkgY2h1bmtzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGVTeW5jKFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBtYXhMZW5ndGg6IG51bWJlciA9IDUwMDBcbik6IFByb21pc2U8U3RyZWFtUmVhZFJlc3VsdD4ge1xuICB0cnkge1xuICAgIC8vIEdldCBmaWxlIHN0YXRzIGZpcnN0IHRvIGtub3cgdG90YWwgc2l6ZVxuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZnMuc3RhdChmaWxlUGF0aCk7XG4gICAgXG4gICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1BhdGggaXMgYSBkaXJlY3RvcnksIG5vdCBhIGZpbGUnIH07XG4gICAgfVxuXG4gICAgLy8gSWYgZmlsZSBpcyBzbWFsbCBlbm91Z2gsIHJlYWQgZW50aXJlbHkgKGZhc3RlciBmb3Igc21hbGwgZmlsZXMpXG4gICAgaWYgKHN0YXRzLnNpemUgPD0gbWF4TGVuZ3RoICogMikgeyAvLyAyeCBmYWN0b3IgZm9yIFVURi04IGVuY29kaW5nIG92ZXJoZWFkXG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnMucmVhZEZpbGUoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgdG90YWxMZW5ndGg6IGNvbnRlbnQubGVuZ3RoLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBGb3IgbGFyZ2UgZmlsZXMsIHVzZSBzdHJlYW1pbmcgcmVhZFxuICAgIGNvbnN0IHsgY3JlYXRlUmVhZFN0cmVhbSB9ID0gYXdhaXQgaW1wb3J0KCdmcycpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgbGV0IGNvbnRlbnQgPSAnJztcbiAgICAgIGxldCBieXRlc1JlYWQgPSAwO1xuICAgICAgY29uc3Qgc3RyZWFtID0gY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCwgeyBcbiAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCcsXG4gICAgICAgIGhpZ2hXYXRlck1hcms6IDY0ICogMTAyNCAvLyA2NEtCIGNodW5rcyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdkYXRhJywgKGNodW5rOiBCdWZmZXIgfCBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgY2h1bmtTdHIgPSB0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnID8gY2h1bmsgOiBjaHVuay50b1N0cmluZygpO1xuICAgICAgICBieXRlc1JlYWQgKz0gY2h1bmtTdHIubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgLy8gT25seSBhY2N1bXVsYXRlIGlmIHdlIGhhdmVuJ3QgZXhjZWVkZWQgbWF4IGxlbmd0aCB5ZXRcbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoICsgY2h1bmtTdHIubGVuZ3RoIDw9IG1heExlbmd0aCkge1xuICAgICAgICAgIGNvbnRlbnQgKz0gY2h1bmtTdHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGFrZSBvbmx5IHdoYXQgZml0cyBhbmQgc3RvcCByZWFkaW5nXG4gICAgICAgICAgY29uc3QgcmVtYWluaW5nID0gbWF4TGVuZ3RoIC0gY29udGVudC5sZW5ndGg7XG4gICAgICAgICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gY2h1bmtTdHIuc3Vic3RyaW5nKDAsIHJlbWFpbmluZyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0cmVhbS5kZXN0cm95KCk7IC8vIFN0b3AgdGhlIHN0cmVhbSBlYXJseVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzVHJ1bmNhdGVkID0gYnl0ZXNSZWFkID4gbWF4TGVuZ3RoIHx8IHN0YXRzLnNpemUgPiBtYXhMZW5ndGg7XG4gICAgICAgIFxuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgIHRvdGFsTGVuZ3RoOiBNYXRoLm1heChieXRlc1JlYWQsIGNvbnRlbnQubGVuZ3RoKSxcbiAgICAgICAgICAgIC4uLihpc1RydW5jYXRlZCAmJiB7IFxuICAgICAgICAgICAgICB0cnVuY2F0ZWQ6IHRydWUsIFxuICAgICAgICAgICAgICBub3RlOiBgT3V0cHV0IHRydW5jYXRlZCB0byAke21heExlbmd0aH0gY2hhcmFjdGVycy4gVXNlIG1heF9sZW5ndGggcGFyYW1ldGVyIHRvIHJlYWQgbW9yZS5gIFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byByZWFkIGZpbGU6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gUmVxdWVzdCBDYWNoaW5nIGZvciBXZWIgUmVzZWFyY2ggPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIENhY2hlZFJlc3BvbnNlIHtcbiAgZGF0YTogdW5rbm93bjtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG4gIHN0YXR1czogbnVtYmVyO1xufVxuXG5jb25zdCByZXF1ZXN0Q2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVkUmVzcG9uc2U+KCk7XG5jb25zdCBSRVFVRVNUX0NBQ0hFX1RUTF9NUyA9IDMwXzAwMDsgLy8gMzAgc2Vjb25kIGNhY2hlIFRUTCBmb3Igc2VhcmNoIHJlc3VsdHNcblxuLyoqIENsZWFyIHJlcXVlc3QgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUmVxdWVzdENhY2hlKCk6IHZvaWQge1xuICByZXF1ZXN0Q2FjaGUuY2xlYXIoKTtcbn1cblxuLyoqXG4gKiBGZXRjaCB3aXRoIGNhY2hpbmcgdG8gYXZvaWQgcmVkdW5kYW50IG5ldHdvcmsgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFdpdGhDYWNoZShcbiAgdXJsOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3VybH06JHtKU09OLnN0cmluZ2lmeShvcHRpb25zKX1gO1xuICBcbiAgLy8gQ2hlY2sgY2FjaGUgZmlyc3QgKEdFVCByZXF1ZXN0cyBvbmx5KVxuICBpZiAob3B0aW9ucz8ubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICBjb25zdCBjYWNoZWQgPSByZXF1ZXN0Q2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICBpZiAoY2FjaGVkICYmIERhdGUubm93KCkgLSBjYWNoZWQudGltZXN0YW1wIDwgUkVRVUVTVF9DQUNIRV9UVExfTVMpIHtcbiAgICAgIC8vIFJldHVybiBhIFJlc3BvbnNlLWxpa2Ugb2JqZWN0IGZyb20gY2FjaGVcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoY2FjaGVkLmRhdGEpLCB7XG4gICAgICAgIHN0YXR1czogY2FjaGVkLnN0YXR1cyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgb3B0aW9ucyk7XG4gIFxuICAvLyBDYWNoZSBzdWNjZXNzZnVsIHJlc3BvbnNlc1xuICBpZiAocmVzcG9uc2Uub2sgJiYgb3B0aW9ucz8ubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIHJlcXVlc3RDYWNoZS5zZXQoY2FjaGVLZXksIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBFdmljdCBvbGQgZW50cmllcyBpZiBjYWNoZSBncm93cyB0b28gbGFyZ2UgKG1heCA1MCBlbnRyaWVzKVxuICAgICAgaWYgKHJlcXVlc3RDYWNoZS5zaXplID4gNTApIHtcbiAgICAgICAgY29uc3Qgb2xkZXN0S2V5ID0gcmVxdWVzdENhY2hlLmtleXMoKS5uZXh0KCkudmFsdWU7XG4gICAgICAgIGlmIChvbGRlc3RLZXkpIHtcbiAgICAgICAgICByZXF1ZXN0Q2FjaGUuZGVsZXRlKG9sZGVzdEtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIE5vbi1KU09OIHJlc3BvbnNlcyBhcmUgbm90IGNhY2hlZFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiBSZXRyeSBsb2dpYyB3aXRoIGV4cG9uZW50aWFsIGJhY2tvZmYgZm9yIGZhaWxlZCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aFJldHJ5KFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IFJlcXVlc3RJbml0LFxuICBtYXhSZXRyaWVzOiBudW1iZXIgPSAzLFxuICBiYXNlRGVsYXlNczogbnVtYmVyID0gMTAwMFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuICBcbiAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IGF0dGVtcHQgPD0gbWF4UmV0cmllczsgYXR0ZW1wdCsrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoQ2FjaGUodXJsLCBvcHRpb25zKTtcbiAgICAgIFxuICAgICAgaWYgKCFyZXNwb25zZS5vayAmJiByZXNwb25zZS5zdGF0dXMgPj0gNTAwKSB7XG4gICAgICAgIC8vIFNlcnZlciBlcnJvciAtIHJldHJ5XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU2VydmVyIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICBsYXN0RXJyb3IgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG4gICAgICBcbiAgICAgIGlmIChhdHRlbXB0IDwgbWF4UmV0cmllcykge1xuICAgICAgICBjb25zdCBkZWxheU1zID0gYmFzZURlbGF5TXMgKiBNYXRoLnBvdygyLCBhdHRlbXB0KTsgLy8gRXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXlNcykpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgdGhyb3cgbGFzdEVycm9yIHx8IG5ldyBFcnJvcihgUmVxdWVzdCBmYWlsZWQgYWZ0ZXIgJHttYXhSZXRyaWVzfSByZXRyaWVzYCk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFN1YnByb2Nlc3MgVGltZW91dCBDYWxjdWxhdG9yID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogQ2FsY3VsYXRlIGFwcHJvcHJpYXRlIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplLlxuICogTGFyZ2VyIHByb2plY3RzIG5lZWQgbW9yZSB0aW1lIGZvciBhbmFseXNpcyB0b29scy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuYWx5c2lzVGltZW91dChiYXNlVGltZW91dE1zOiBudW1iZXIsIGZpbGVDb3VudD86IG51bWJlcik6IG51bWJlciB7XG4gIGlmICghZmlsZUNvdW50KSByZXR1cm4gYmFzZVRpbWVvdXRNcztcbiAgXG4gIC8vIFNjYWxlIHRpbWVvdXQgbG9nYXJpdGhtaWNhbGx5IHdpdGggZmlsZSBjb3VudFxuICBjb25zdCBzY2FsZUZhY3RvciA9IE1hdGgubG9nMihNYXRoLm1heCgxLCBmaWxlQ291bnQpKSAvIDEwOyAvLyB+MXggZm9yIDEtMTAgZmlsZXMsIH4yeCBmb3IgMTAwMCsgZmlsZXNcbiAgY29uc3Qgc2NhbGVkVGltZW91dCA9IGJhc2VUaW1lb3V0TXMgKiAoMSArIHNjYWxlRmFjdG9yKTtcbiAgXG4gIC8vIENhcCBhdCA2MCBzZWNvbmRzIG1heGltdW1cbiAgcmV0dXJuIE1hdGgubWluKHNjYWxlZFRpbWVvdXQsIDYwXzAwMCk7XG59XG5cbi8qKlxuICogQ291bnQgVHlwZVNjcmlwdCBmaWxlcyBpbiBhIGRpcmVjdG9yeSB0byBlc3RpbWF0ZSBwcm9qZWN0IHNpemUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb3VudFR5cGVTY3JpcHRGaWxlcyhkaXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICBsZXQgY291bnQgPSAwO1xuICBcbiAgYXN5bmMgZnVuY3Rpb24gY291bnRJbkRpcihjdXJyZW50UGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGRlcHRoID4gMTApIHJldHVybjsgLy8gUmVhc29uYWJsZSBtYXggZGVwdGhcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnJlYWRkaXIoY3VycmVudFBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgIFxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmIChlbnRyeS5pc0ZpbGUoKSAmJiBlbnRyeS5uYW1lLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIC8vIFNraXAgY29tbW9uIG5vbi1zb3VyY2UgZGlyZWN0b3JpZXNcbiAgICAgICAgICBpZiAoIVsnbm9kZV9tb2R1bGVzJywgJy5naXQnLCAnZGlzdCcsICdidWlsZCddLmluY2x1ZGVzKGVudHJ5Lm5hbWUpKSB7XG4gICAgICAgICAgICBhd2FpdCBjb3VudEluRGlyKHBhdGguam9pbihjdXJyZW50UGF0aCwgZW50cnkubmFtZSksIGRlcHRoICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3Rvcmllc1xuICAgIH1cbiAgfVxuICBcbiAgYXdhaXQgY291bnRJbkRpcihkaXJQYXRoLCAwKTtcbiAgcmV0dXJuIGNvdW50O1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSAnLi4vc3RhdGVNYW5hZ2VyLmpzJztcbmltcG9ydCB7IHZhbGlkYXRlUGF0aCwgaXNTYWZlUmVnZXggfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyLCBzZXRXb3JraW5nRGlyLCByZXNvbHZlUGF0aCB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuaW1wb3J0IHtcbiAgbGV2ZW5zaHRlaW5TaW1pbGFyaXR5LFxuICBnZXRDYWNoZWRGdXp6eVJlc3VsdHMsXG4gIGNhY2hlRnV6enlSZXN1bHRzLFxuICBmaW5kRmlsZXNBc3luYyxcbiAgY291bnRUeXBlU2NyaXB0RmlsZXMsXG4gIGdldEFuYWx5c2lzVGltZW91dCxcbn0gZnJvbSAnLi4vcGVyZm9ybWFuY2VVdGlscy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBMaXN0RGlyZWN0b3J5UGFyYW1zIHsgcGF0aD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJlYWRGaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IG1heF9sZW5ndGg/OiBudW1iZXI7IH1cbmludGVyZmFjZSBTYXZlRmlsZVBhcmFtcyB7IGZpbGVfbmFtZT86IHN0cmluZzsgY29udGVudD86IHN0cmluZzsgZmlsZXM/OiBBcnJheTx7IGZpbGVfbmFtZTogc3RyaW5nOyBjb250ZW50OiBzdHJpbmcgfT47IH1cbmludGVyZmFjZSBSZXBsYWNlVGV4dEluRmlsZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBvbGRfc3RyaW5nOiBzdHJpbmc7IG5ld19zdHJpbmc6IHN0cmluZzsgfVxuaW50ZXJmYWNlIEluc2VydEF0TGluZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBsaW5lX251bWJlcjogbnVtYmVyOyBjb250ZW50X3RvX2luc2VydDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmVhZEZpbGVDaHVua2VkUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNodW5rX3NpemU/OiBudW1iZXI7IG1heF9jaHVua3M/OiBudW1iZXI7IH07XG5cbmludGVyZmFjZSBBcHBlbmRGaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IHN0YXJ0X2xpbmU6IG51bWJlcjsgZW5kX2xpbmU/OiBudW1iZXI7IH1cbmludGVyZmFjZSBNYWtlRGlyZWN0b3J5UGFyYW1zIHsgZGlyZWN0b3J5X25hbWU6IHN0cmluZzsgfVxuaW50ZXJmYWNlIE1vdmVGaWxlUGFyYW1zIHsgc291cmNlOiBzdHJpbmc7IGRlc3RpbmF0aW9uOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDb3B5RmlsZVBhcmFtcyB7IHNvdXJjZTogc3RyaW5nOyBkZXN0aW5hdGlvbjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRGVsZXRlUGF0aFBhcmFtcyB7IHBhdGg6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRmluZEZpbGVzUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyBtYXhfZGVwdGg/OiBudW1iZXI7IH1cbmludGVyZmFjZSBGdXp6eUZpbmRMb2NhbEZpbGVzUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgcGF0aD86IHN0cmluZzsgbWF4X3Jlc3VsdHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHZXRGaWxlTWV0YWRhdGFQYXJhbXMgeyBwYXRoOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGFuZ2VEaXJlY3RvcnlQYXJhbXMgeyBkaXJlY3Rvcnk6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJlYWREb2N1bWVudFBhcmFtcyB7IGZpbGVfcGF0aDogc3RyaW5nOyB9XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgX3N0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGxpc3RfZGlyZWN0b3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbGlzdF9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCB0aGUgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IG9yIGEgc3BlY2lmaWVkIHN1YmRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIHBhdGggdG8gdGhlIGRpcmVjdG9yeSB0byBsaXN0LiBEZWZhdWx0cyB0byBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGg6IGRpclBhdGggfTogTGlzdERpcmVjdG9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IGRpclBhdGggfHwgJy4nO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgodGFyZ2V0UGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKHRhcmdldFBhdGgpO1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZnVsbFBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZW50cmllcy5tYXAoZW50cnkgPT4gKHtcbiAgICAgICAgICBwYXRoOiBwYXRoLmpvaW4oZnVsbFBhdGgsIGVudHJ5Lm5hbWUpLFxuICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXG4gICAgICAgICAgaXNEaXJlY3Rvcnk6IGVudHJ5LmlzRGlyZWN0b3J5KCksXG4gICAgICAgICAgaXNGaWxlOiBlbnRyeS5pc0ZpbGUoKSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlYWRfZmlsZSB0b29sIFx1MjAxNCBIeWJyaWQ6IEVhcmx5IHNpemUgY2hlY2sgKyBCdWZmZXIgYmluYXJ5IGRldGVjdGlvbiArIFRydW5jYXRpb24gc3VwcG9ydFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCBjb250ZW50IGZyb20gYSBmaWxlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byByZWFkJyksXG4gICAgICBtYXhfbGVuZ3RoOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTAwMDApLm9wdGlvbmFsKCkuZGVmYXVsdCg1MDAwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyB0byByZXR1cm4gKGRlZmF1bHQ6IDUwMDApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBtYXhfbGVuZ3RoIH06IFJlYWRGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gbWF4X2xlbmd0aCB8fCA1MDAwO1xuXG4gICAgICAgIC8vIEVhcmx5IHNpemUgY2hlY2sgKEJlbGVkYXJpYW4gc3R5bGUpIC0gcHJldmVudCBsb2FkaW5nID4xME1CIGZpbGVzXG4gICAgICAgIGxldCBzdGF0czogZnMuU3RhdHM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdHMuc2l6ZSA+IDEwXzAwMF8wMDApIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGaWxlIHRvbyBsYXJnZSAoPjEwTUIpJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVhZCBhcyBidWZmZXIgZm9yIGVmZmljaWVudCBiaW5hcnkgY2hlY2sgKEJlbGVkYXJpYW4gc3R5bGUpXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRGaWxlKGZ1bGxQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEJpbmFyeSBjaGVjazogbnVsbCBieXRlIGluIGZpcnN0IDFLQlxuICAgICAgICBjb25zdCBjaGVja0J1ZmZlciA9IGJ1ZmZlci5zdWJhcnJheSgwLCBNYXRoLm1pbihidWZmZXIubGVuZ3RoLCAxMDI0KSk7XG4gICAgICAgIGlmIChjaGVja0J1ZmZlci5pbmNsdWRlcygwKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0JpbmFyeSBmaWxlIGRldGVjdGVkLiBVc2UgcmVhZF9kb2N1bWVudCBmb3IgUERGL0RPQ1ggZmlsZXMuJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICAgICAgY29uc3QgY29udGVudCA9IGJ1ZmZlci50b1N0cmluZygndXRmLTgnKTtcblxuICAgICAgICAvLyBUcnVuY2F0ZSBpZiBuZWNlc3NhcnkgYW5kIGFkZCBtZXRhZGF0YSAoQUkgVG9vbGJveCBzdHlsZSlcbiAgICAgICAgbGV0IGRhdGFDb250ZW50ID0gY29udGVudDtcbiAgICAgICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgdG90YWxMZW5ndGggPSBjb250ZW50Lmxlbmd0aDtcblxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggPiBtYXhMZW5ndGgpIHtcbiAgICAgICAgICBkYXRhQ29udGVudCA9IGNvbnRlbnQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCk7XG4gICAgICAgICAgdHJ1bmNhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBjb250ZW50OiBkYXRhQ29udGVudCxcbiAgICAgICAgICAgIGZpbGVQYXRoOiBmdWxsUGF0aCwgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgICAgLi4uKHRydW5jYXRlZCA/IHsgdHJ1bmNhdGVkOiB0cnVlLCB0b3RhbF9sZW5ndGg6IHRvdGFsTGVuZ3RoIH0gOiB7fSlcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZWFkX2ZpbGVfY2h1bmtlZCB0b29sIFx1MjAxNCBSZWFkcyBmaWxlcyBsYXJnZXIgdGhhbiBtYXhfbGVuZ3RoIGJ5IHNwbGl0dGluZyBpbnRvIGNodW5rc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2ZpbGVfY2h1bmtlZCcsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIGEgZmlsZSBpbiBjaHVua3Mgd2hlbiBpdCBleGNlZWRzIHRoZSBjaGFyYWN0ZXIgbGltaXQuIEF1dG9tYXRpY2FsbHkgc3BsaXRzIGxhcmdlIGZpbGVzIGZvciBlZmZpY2llbnQgcGFydGlhbCByZWFkaW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byByZWFkJyksXG4gICAgICBjaHVua19zaXplOiB6Lm51bWJlcigpLmludCgpLm1pbigxMDApLm1heCg1MDAwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDUwMDAwKS5kZXNjcmliZSgnTWF4aW11bSBjaGFyYWN0ZXJzIHBlciBjaHVuayAoZGVmYXVsdDogNTAwMDApJyksXG4gICAgICBtYXhfY2h1bmtzOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoMTAwKS5vcHRpb25hbCgpLmRlZmF1bHQoMjApLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiBjaHVua3MgdG8gcmV0dXJuIChkZWZhdWx0OiAyMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIGNodW5rX3NpemUsIG1heF9jaHVua3MgfTogUmVhZEZpbGVDaHVua2VkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG5cbiAgICAgICAgLy8gR2V0IGZpbGUgbWV0YWRhdGEgZmlyc3RcbiAgICAgICAgbGV0IHN0YXRzOiBmcy5TdGF0cztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRzLnNpemUgPiAxMF8wMDBfMDAwKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRmlsZSB0b28gbGFyZ2UgKD4xME1CKScgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYWQgZW50aXJlIGZpbGUgY29udGVudFxuICAgICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkRmlsZShmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICAvLyBCaW5hcnkgY2hlY2tcbiAgICAgICAgY29uc3QgY2hlY2tCdWZmZXIgPSBidWZmZXIuc3ViYXJyYXkoMCwgTWF0aC5taW4oYnVmZmVyLmxlbmd0aCwgMTAyNCkpO1xuICAgICAgICBpZiAoY2hlY2tCdWZmZXIuaW5jbHVkZXMoMCkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdCaW5hcnkgZmlsZSBkZXRlY3RlZC4gVXNlIHJlYWRfZG9jdW1lbnQgZm9yIFBERi9ET0NYIGZpbGVzLicgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBidWZmZXIudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgICAgIGNvbnN0IHRvdGFsQ2hhcnMgPSBjb250ZW50Lmxlbmd0aDtcblxuICAgICAgICAvLyBJZiBmaWxlIGZpdHMgd2l0aGluIGNodW5rX3NpemUsIHJldHVybiBpdCB3aG9sZSAobm8gY2h1bmtpbmcgbmVlZGVkKVxuICAgICAgICBpZiAodG90YWxDaGFycyA8PSBjaHVua19zaXplKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIGZpbGVQYXRoOiBmdWxsUGF0aCxcbiAgICAgICAgICAgICAgdG90YWxDaGFyYWN0ZXJzOiB0b3RhbENoYXJzLFxuICAgICAgICAgICAgICBjaHVua3NSZXR1cm5lZDogMSxcbiAgICAgICAgICAgICAgaXNUcnVuY2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICBjaHVua3M6IFt7XG4gICAgICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcbiAgICAgICAgICAgICAgICBzdGFydENoYXI6IDAsXG4gICAgICAgICAgICAgICAgZW5kQ2hhcjogdG90YWxDaGFycyxcbiAgICAgICAgICAgICAgICB0cnVuY2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwbGl0IGludG8gY2h1bmtzIG1hbnVhbGx5IChzaW5jZSByZWFkX2ZpbGUgZG9lc24ndCBzdXBwb3J0IG9mZnNldC9zZWVrKVxuICAgICAgICBjb25zdCBjaHVua3M6IEFycmF5PHsgaW5kZXg6IG51bWJlcjsgY29udGVudDogc3RyaW5nOyBzdGFydENoYXI6IG51bWJlcjsgZW5kQ2hhcjogbnVtYmVyOyB0cnVuY2F0ZWQ6IGJvb2xlYW4gfT4gPSBbXTtcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWF4X2NodW5rcyAmJiBzdGFydEluZGV4IDwgdG90YWxDaGFyczsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZW5kSW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4ICsgY2h1bmtfc2l6ZSwgdG90YWxDaGFycyk7XG4gICAgICAgICAgXG4gICAgICAgICAgY2h1bmtzLnB1c2goe1xuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBjb250ZW50OiBjb250ZW50LnN1YnN0cmluZyhzdGFydEluZGV4LCBlbmRJbmRleCksXG4gICAgICAgICAgICBzdGFydENoYXI6IHN0YXJ0SW5kZXgsXG4gICAgICAgICAgICBlbmRDaGFyOiBlbmRJbmRleCxcbiAgICAgICAgICAgIHRydW5jYXRlZDogZW5kSW5kZXggPCB0b3RhbENoYXJzLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgc3RhcnRJbmRleCA9IGVuZEluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGZpbGVQYXRoOiBmdWxsUGF0aCxcbiAgICAgICAgICAgIHRvdGFsQ2hhcmFjdGVyczogdG90YWxDaGFycyxcbiAgICAgICAgICAgIGNodW5rU2l6ZTogY2h1bmtfc2l6ZSxcbiAgICAgICAgICAgIG1heENodW5rczogbWF4X2NodW5rcyxcbiAgICAgICAgICAgIGNodW5rc1JldHVybmVkOiBjaHVua3MubGVuZ3RoLFxuICAgICAgICAgICAgaXNUcnVuY2F0ZWQ6IHN0YXJ0SW5kZXggPCB0b3RhbENoYXJzLFxuICAgICAgICAgICAgY2h1bmtzLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzYXZlX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzYXZlX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBjb250ZW50IHRvIGEgc3BlY2lmaWVkIGZpbGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFN1cHBvcnRzIGJhdGNoIHNhdmluZy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byBzYXZlJyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBjb250ZW50IHRvIHdyaXRlIHRvIHRoZSBmaWxlJyksXG4gICAgICBmaWxlczogei5hcnJheSh6Lm9iamVjdCh7IGZpbGVfbmFtZTogei5zdHJpbmcoKSwgY29udGVudDogei5zdHJpbmcoKSB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRm9yIGJhdGNoIHNhdmluZyBtdWx0aXBsZSBmaWxlcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCwgZmlsZXMgfTogU2F2ZUZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChmaWxlcyAmJiBBcnJheS5pc0FycmF5KGZpbGVzKSkge1xuICAgICAgICAgIC8vIEJhdGNoIHNhdmUgbW9kZVxuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGUuZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEludmFsaWQgcGF0aCBpbiBiYXRjaDogJHtmaWxlLmZpbGVfbmFtZX1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGUuZmlsZV9uYW1lKTtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGZpbGUuY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBmaWxlOiBmdWxsUGF0aCwgc3RhdHVzOiAnc2F2ZWQnIH0pOyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWRGaWxlczogZmlsZXMubGVuZ3RoLCByZXN1bHRzIH0gfTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWxlX25hbWUgJiYgY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gU2luZ2xlIGZpbGUgc2F2ZSBtb2RlXG4gICAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNhdmVkRmlsZTogZnVsbFBhdGgsIHBhdGg6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VpdGhlciBwcm92aWRlIGZpbGVfbmFtZStjb250ZW50IG9yIGZpbGVzIGFycmF5JyB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZXBsYWNlX3RleHRfaW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlcGxhY2VfdGV4dF9pbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlcGxhY2UgYSBzcGVjaWZpYyBzdHJpbmcgaW4gYSBmaWxlIHdpdGggYSBuZXcgc3RyaW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIG9sZF9zdHJpbmc6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBleGFjdCB0ZXh0IHRvIHJlcGxhY2UuIE11c3QgYmUgdW5pcXVlIGluIHRoZSBmaWxlLicpLFxuICAgICAgbmV3X3N0cmluZzogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgdG8gaW5zZXJ0IGluIHBsYWNlIG9mIG9sZF9zdHJpbmcuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBvbGRfc3RyaW5nLCBuZXdfc3RyaW5nIH06IFJlcGxhY2VUZXh0SW5GaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWNvbnRlbnQuaW5jbHVkZXMob2xkX3N0cmluZykpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBTdHJpbmcgJyR7b2xkX3N0cmluZ30nIG5vdCBmb3VuZCBpbiBmaWxlYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBuZXdDb250ZW50ID0gY29udGVudC5yZXBsYWNlKG9sZF9zdHJpbmcsIG5ld19zdHJpbmcpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBuZXdDb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyByZXBsYWNlZDogdHJ1ZSwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBpbnNlcnRfYXRfbGluZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2luc2VydF9hdF9saW5lJyxcbiAgICBkZXNjcmlwdGlvbjogJ0luc2VydCBjb250ZW50IGF0IGEgc3BlY2lmaWMgbGluZSBudW1iZXIgaW4gYSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIGxpbmVfbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnVGhlIGxpbmUgbnVtYmVyIHRvIGluc2VydCBhdCAoMS1pbmRleGVkKScpLFxuICAgICAgY29udGVudF90b19pbnNlcnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gaW5zZXJ0JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBsaW5lX251bWJlciwgY29udGVudF90b19pbnNlcnQgfTogSW5zZXJ0QXRMaW5lUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFsbG93IGFwcGVuZGluZyBhdCBFT0YgKGxpbmVfbnVtYmVyID09IGxlbmd0aCArIDEpXG4gICAgICAgIGlmIChsaW5lX251bWJlciA+IGxpbmVzLmxlbmd0aCArIDEpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBMaW5lIG51bWJlciAke2xpbmVfbnVtYmVyfSBleGNlZWRzIGZpbGUgbGVuZ3RoICgke2xpbmVzLmxlbmd0aH0pYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsaW5lcy5zcGxpY2UobGluZV9udW1iZXIgLSAxLCAwLCBjb250ZW50X3RvX2luc2VydCk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGxpbmVzLmpvaW4oJ1xcbicpLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpbnNlcnRlZEF0OiBsaW5lX251bWJlciwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBhcHBlbmRfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2FwcGVuZF9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogXCJBcHBlbmQgY29udGVudCB0byB0aGUgZW5kIG9mIGEgZmlsZS4gSWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdCwgaXQgd2lsbCBiZSBjcmVhdGVkLlwiLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gYXBwZW5kIHRvJyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCBjb250ZW50IHRvIGFwcGVuZCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCB9OiBBcHBlbmRGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhmdWxsUGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYXBwZW5kZWRUbzogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfbGluZXNfaW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9saW5lc19pbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIHNwZWNpZmljIGxpbmUgb3IgcmFuZ2Ugb2YgbGluZXMgZnJvbSBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIG1vZGlmeScpLFxuICAgICAgc3RhcnRfbGluZTogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1N0YXJ0aW5nIGxpbmUgbnVtYmVyICgxLWluZGV4ZWQpJyksXG4gICAgICBlbmRfbGluZTogei5udW1iZXIoKS5pbnQoKS5taW4oMSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRW5kaW5nIGxpbmUgbnVtYmVyIChpbmNsdXNpdmUpLiBJZiBvbWl0dGVkLCBvbmx5IGRlbGV0ZXMgc3RhcnRfbGluZS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIHN0YXJ0X2xpbmUsIGVuZF9saW5lIH06IERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGRlbGV0ZUVuZCA9IGVuZF9saW5lIHx8IHN0YXJ0X2xpbmU7XG4gICAgICAgIGlmIChzdGFydF9saW5lID4gbGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3RhcnQgbGluZSAke3N0YXJ0X2xpbmV9IGV4Y2VlZHMgZmlsZSBsZW5ndGggKCR7bGluZXMubGVuZ3RofSlgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsYW1wIGVuZF9saW5lIHRvIGF2b2lkIHNpbGVudCB0cnVuY2F0aW9uIGJleW9uZCBmaWxlIGJvdW5kc1xuICAgICAgICBjb25zdCBjbGFtcGVkRW5kID0gTWF0aC5taW4oZGVsZXRlRW5kLCBsaW5lcy5sZW5ndGgpO1xuICAgICAgICBsaW5lcy5zcGxpY2Uoc3RhcnRfbGluZSAtIDEsIGNsYW1wZWRFbmQgLSBzdGFydF9saW5lICsgMSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGxpbmVzLmpvaW4oJ1xcbicpLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkTGluZXM6IGAke3N0YXJ0X2xpbmV9LSR7Y2xhbXBlZEVuZH1gLCBmaWxlOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG1ha2VfZGlyZWN0b3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbWFrZV9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IGRpcmVjdG9yeSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5IHRvIGNyZWF0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGRpcmVjdG9yeV9uYW1lIH06IE1ha2VEaXJlY3RvcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGRpcmVjdG9yeV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZGlyZWN0b3J5X25hbWUpO1xuICAgICAgICBmcy5ta2RpclN5bmMoZnVsbFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWREaXJlY3Rvcnk6IGRpcmVjdG9yeV9uYW1lLCBwYXRoOiBmdWxsUGF0aCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBtb3ZlX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdtb3ZlX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnTW92ZSBvciByZW5hbWUgYSBmaWxlIG9yIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNvdXJjZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU291cmNlIHBhdGgnKSxcbiAgICAgIGRlc3RpbmF0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXN0aW5hdGlvbiBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9OiBNb3ZlRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoc291cmNlLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzb3VyY2UgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkZXN0aW5hdGlvbiwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZGVzdGluYXRpb24gcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsU291cmNlID0gcmVzb2x2ZVBhdGgoc291cmNlKTtcbiAgICAgICAgY29uc3QgZnVsbERlc3RpbmF0aW9uID0gcmVzb2x2ZVBhdGgoZGVzdGluYXRpb24pO1xuICAgICAgICBmcy5yZW5hbWVTeW5jKGZ1bGxTb3VyY2UsIGZ1bGxEZXN0aW5hdGlvbik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbW92ZWRGcm9tOiBmdWxsU291cmNlLCBtb3ZlZFRvOiBmdWxsRGVzdGluYXRpb24gfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIU1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY29weV9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY29weV9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvcHkgYSBmaWxlIHRvIGEgbmV3IGxvY2F0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc291cmNlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTb3VyY2UgZmlsZSBwYXRoJyksXG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnRGVzdGluYXRpb24gZmlsZSBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9OiBDb3B5RmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoc291cmNlLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzb3VyY2UgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkZXN0aW5hdGlvbiwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZGVzdGluYXRpb24gcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsU291cmNlID0gcmVzb2x2ZVBhdGgoc291cmNlKTtcbiAgICAgICAgY29uc3QgZnVsbERlc3RpbmF0aW9uID0gcmVzb2x2ZVBhdGgoZGVzdGluYXRpb24pO1xuICAgICAgICBmcy5jb3B5RmlsZVN5bmMoZnVsbFNvdXJjZSwgZnVsbERlc3RpbmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb3BpZWRGcm9tOiBmdWxsU291cmNlLCBjb3BpZWRUbzogZnVsbERlc3RpbmF0aW9uIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFNcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9wYXRoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX3BhdGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIGEgZmlsZSBvciBkaXJlY3RvcnkgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIEJlIGNhcmVmdWwhJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgcGF0aCB0byBkZWxldGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoOiBmaWxlUGF0aCB9OiBEZWxldGVQYXRoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgYSBkaXJlY3RvcnlcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhmdWxsUGF0aCk7XG4gICAgICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgZnMucm1TeW5jKGZ1bGxQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcy51bmxpbmtTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWQ6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2ZpbGVzX2J5X3BhdHRlcm4gdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfZmlsZXNfYnlfcGF0dGVybicsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgbXVsdGlwbGUgZmlsZXMgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IHRoYXQgbWF0Y2ggYSByZWdleCBwYXR0ZXJuLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0dGVybjogei5zdHJpbmcoKS5kZXNjcmliZSgnUmVnZXggcGF0dGVybiB0byBtYXRjaCBmaWxlbmFtZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXR0ZXJuIH06IERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoY29uZmlnLnJlZ2V4UmVEb1NQcm90ZWN0aW9uICYmICFpc1NhZmVSZWdleChwYXR0ZXJuKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Vuc2FmZSByZWdleCBwYXR0ZXJuIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybik7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZ2V0V29ya2luZ0RpcigpKTtcbiAgICAgICAgY29uc3QgZGVsZXRlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgaWYgKHJlZ2V4LnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgIGRlbGV0ZWRGaWxlcy5wdXNoKGZ1bGxQYXRoKTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkQ291bnQ6IGRlbGV0ZWRGaWxlcy5sZW5ndGgsIGRlbGV0ZWRGaWxlcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmaW5kX2ZpbGVzIHRvb2wgXHUyMDE0IE9QVElNSVpFRCB3aXRoIGFzeW5jL2F3YWl0IGFuZCBjb25jdXJyZW5jeSBjb250cm9sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ZpbmRfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmluZCBmaWxlcyByZWN1cnNpdmVseSBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnkgbWF0Y2hpbmcgYSBuYW1lIHBhdHRlcm4uIFVzZXMgYXN5bmMgc2VhcmNoIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXR0ZXJuOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTdWJzdHJpbmcgdG8gbWF0Y2ggaW4gZmlsZW5hbWUgKGNhc2UtaW5zZW5zaXRpdmUpJyksXG4gICAgICBtYXhfZGVwdGg6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01heGltdW0gZGVwdGggdG8gc2VhcmNoIChkZWZhdWx0OiA1KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdHRlcm4sIG1heF9kZXB0aCB9OiBGaW5kRmlsZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaFBhdGggPSBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IGRlcHRoID0gbWF4X2RlcHRoIHx8IDU7XG4gICAgICAgIFxuICAgICAgICAvLyBVc2Ugb3B0aW1pemVkIGFzeW5jIHNlYXJjaCB3aXRoIGNvbmN1cnJlbmN5IGNvbnRyb2xcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmluZEZpbGVzQXN5bmMoc2VhcmNoUGF0aCwgcGF0dGVybiwgZGVwdGgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGZvdW5kRmlsZXM6IHJlc3VsdC5maWxlcywgY291bnQ6IHJlc3VsdC5jb3VudCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmdXp6eV9maW5kX2xvY2FsX2ZpbGVzIHRvb2wgXHUyMDE0IE9QVElNSVpFRCB3aXRoIGVhcmx5IGV4aXQgTGV2ZW5zaHRlaW4gKyBjYWNoaW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Z1enp5X2ZpbmRfbG9jYWxfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRnV6enkgZmluZCBsb2NhbCBmaWxlcyBieSBwYXRoL25hbWUgc2ltaWxhcml0eSB1c2luZyBvcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gc2NvcmluZyB3aXRoIGNhY2hpbmcuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRvIG1hdGNoIGFnYWluc3QgZmlsZSBuYW1lcy9wYXRocy4nKSxcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnU3ViLWRpcmVjdG9yeSB0byBzZWFyY2ggaW4gKGRlZmF1bHQ6IGN1cnJlbnQgZGlyZWN0b3J5KS4nKSxcbiAgICAgIG1heF9yZXN1bHRzOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoMjApLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01heCByZXN1bHRzIHRvIHJldHVybiAoZGVmYXVsdDogNSkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIHBhdGg6IHNlYXJjaFBhdGgsIG1heF9yZXN1bHRzIH06IEZ1enp5RmluZExvY2FsRmlsZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJhc2VEaXIgPSBzZWFyY2hQYXRoID8gcmVzb2x2ZVBhdGgoc2VhcmNoUGF0aCkgOiBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IG1heFJlc3VsdHMgPSBtYXhfcmVzdWx0cyB8fCA1O1xuXG4gICAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XG4gICAgICAgIGNvbnN0IGNhY2hlZFJlc3VsdHMgPSBnZXRDYWNoZWRGdXp6eVJlc3VsdHMocXVlcnksIGJhc2VEaXIpO1xuICAgICAgICBpZiAoY2FjaGVkUmVzdWx0cykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbWF0Y2hlczogY2FjaGVkUmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKSwgY291bnQ6IE1hdGgubWluKGNhY2hlZFJlc3VsdHMubGVuZ3RoLCBtYXhSZXN1bHRzKSB9IH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb2xsZWN0IGZpbGVzIHVzaW5nIGFzeW5jIG1ldGhvZFxuICAgICAgICBjb25zdCBhbGxGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RGaWxlcyhkaXJQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIgPSAwLCBtYXhEZXB0aDogbnVtYmVyID0gMjApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgICAgIFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihkaXJQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjb2xsZWN0RmlsZXMoZnVsbFBhdGgsIGRlcHRoICsgMSwgbWF4RGVwdGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsbEZpbGVzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3Rvcmllc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYXdhaXQgY29sbGVjdEZpbGVzKGJhc2VEaXIpO1xuICAgICAgICBcbiAgICAgICAgLy8gT3B0aW1pemVkIGZ1enp5IG1hdGNoaW5nIHdpdGggZWFybHkgZXhpdFxuICAgICAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gPSBbXTtcbiAgICAgICAgY29uc3QgcXVlcnlMb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IE1JTl9TQ09SRSA9IDAuMztcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBhbGxGaWxlcykge1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFVzZSBvcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gd2l0aCBlYXJseSBleGl0XG4gICAgICAgICAgY29uc3Qgc2NvcmUgPSBsZXZlbnNodGVpblNpbWlsYXJpdHkocXVlcnlMb3dlciwgZmlsZU5hbWUsIE1JTl9TQ09SRSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHNjb3JlICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBmaWxlUGF0aDogZmlsZSwgc2NvcmUgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTb3J0IGJ5IHNjb3JlIGRlc2NlbmRpbmcgYW5kIGNhY2hlIHJlc3VsdHNcbiAgICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgICAgIGNhY2hlRnV6enlSZXN1bHRzKHF1ZXJ5LCBiYXNlRGlyLCByZXN1bHRzKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbWF0Y2hlczogcmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKSwgY291bnQ6IE1hdGgubWluKHJlc3VsdHMubGVuZ3RoLCBtYXhSZXN1bHRzKSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfZmlsZV9tZXRhZGF0YSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9maWxlX21ldGFkYXRhJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBtZXRhZGF0YSAoc2l6ZSwgZGF0ZXMpIGZvciBhIHNwZWNpZmljIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aDogZmlsZVBhdGggfTogR2V0RmlsZU1ldGFkYXRhUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgICAgICBzaXplOiBzdGF0cy5zaXplLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBzdGF0cy5iaXJ0aHRpbWUsXG4gICAgICAgICAgICBtb2RpZmllZEF0OiBzdGF0cy5tdGltZSxcbiAgICAgICAgICAgIGFjY2Vzc2VkQXQ6IHN0YXRzLmF0aW1lLFxuICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IHN0YXRzLmlzRGlyZWN0b3J5KCksXG4gICAgICAgICAgICBpc0ZpbGU6IHN0YXRzLmlzRmlsZSgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjaGFuZ2VfZGlyZWN0b3J5IHRvb2wgXHUyMDE0IEh5YnJpZDogRXhwbGljaXQgdmFsaWRhdGlvbiArIFN0YXRlIGFic3RyYWN0aW9uICsgQ29udGV4dHVhbCByZXNwb25zZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjaGFuZ2VfZGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gQWxsIHN1YnNlcXVlbnQgZmlsZSBvcGVyYXRpb25zIHdpbGwgdXNlIHRoaXMgZGlyZWN0b3J5IGFzIHRoZSBiYXNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZGlyZWN0b3J5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgYWJzb2x1dGUgcGF0aCB0byBjaGFuZ2UgdG8gKGUuZy4sIFwiQzpcXFxcXFxcXFByb2plY3RzXFxcXFxcXFxteS1hcHBcIiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBkaXJlY3RvcnkgfTogQ2hhbmdlRGlyZWN0b3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGRpcmVjdG9yeSk7XG5cbiAgICAgICAgLy8gXHUyNzA1IEJlbGVkYXJpYW4ncyBleHBsaWNpdCB2YWxpZGF0aW9uIHVzaW5nIGZzLnN0YXRcbiAgICAgICAgbGV0IHN0YXRzOiBmcy5TdGF0cztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFBhdGggaXMgbm90IGEgZGlyZWN0b3J5OiAke2Z1bGxQYXRofWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1MjcwNSBDYXB0dXJlIHByZXZpb3VzIGRpcmVjdG9yeSBmb3IgY29udGV4dFxuICAgICAgICBjb25zdCBwcmV2aW91c0RpcmVjdG9yeSA9IGdldFdvcmtpbmdEaXIoKTtcblxuICAgICAgICAvLyBcdTI3MDUgQUkgVG9vbGJveCdzIGFic3RyYWN0aW9uIGZvciBzdGF0ZSBjaGFuZ2VcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IHNldFdvcmtpbmdEaXIoZnVsbFBhdGgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjaGFuZ2UgZGlyZWN0b3J5IHRvICcke2RpcmVjdG9yeX0nLiBFbnN1cmUgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhIHZhbGlkIGRpcmVjdG9yeS5gIFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTI3MDUgQmVsZWRhcmlhbidzIGNvbnRleHR1YWwgcmV0dXJuIGRhdGEgKyBBSSBUb29sYm94J3Mgc3RydWN0dXJlZCBmb3JtYXRcbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgIHByZXZpb3VzX2RpcmVjdG9yeTogcHJldmlvdXNEaXJlY3RvcnksXG4gICAgICAgICAgICBjdXJyZW50X2RpcmVjdG9yeTogZ2V0V29ya2luZ0RpcigpIFxuICAgICAgICAgIH0gXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuXG4gIC8vIGFuYWx5emVfcHJvamVjdCB0b29sIFx1MjAxNCBDb21wcmVoZW5zaXZlIFR5cGVTY3JpcHQgUGVyZm9ybWFuY2UgJiBMaW50aW5nIEFuYWx5c2lzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2FuYWx5emVfcHJvamVjdCcsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gcHJvamVjdC13aWRlIGFuYWx5c2lzIGluY2x1ZGluZyBUeXBlU2NyaXB0IGRpYWdub3N0aWNzLCBjaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGlvbiwgRVNMaW50LCBjb25maWcgb3B0aW1pemF0aW9uLCBhbmQgaW1wb3J0IHN0cnVjdHVyZSBhbmFseXNpcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNhdGVnb3JpZXM6IHouYXJyYXkoei5lbnVtKFsndHlwZWNoZWNrJywgJ2NpcmN1bGFyJywgJ2VzbGludCcsICdjb25maWcnLCAnaW1wb3J0cyddKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQW5hbHlzaXMgY2F0ZWdvcmllcyB0byBydW4gKGRlZmF1bHQ6IGFsbCknKSxcbiAgICAgIG1heF9pbXBvcnRzX3dhcm5pbmc6IHoubnVtYmVyKCkuaW50KCkubWluKDUpLm1heCgxMDApLm9wdGlvbmFsKCkuZGVmYXVsdCgyMCkuZGVzY3JpYmUoJ01heCBpbXBvcnRzIHBlciBmaWxlIGJlZm9yZSB3YXJuaW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY2F0ZWdvcmllcywgbWF4X2ltcG9ydHNfd2FybmluZyB9OiB7IGNhdGVnb3JpZXM/OiBzdHJpbmdbXTsgbWF4X2ltcG9ydHNfd2FybmluZz86IG51bWJlciB9KSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB3b3JraW5nRGlyID0gZ2V0V29ya2luZ0RpcigpO1xuICAgICAgICBjb25zdCBzZWxlY3RlZENhdGVnb3JpZXMgPSBjYXRlZ29yaWVzIHx8IFsndHlwZWNoZWNrJywgJ2NpcmN1bGFyJywgJ2VzbGludCcsICdjb25maWcnLCAnaW1wb3J0cyddO1xuICAgICAgICBjb25zdCBpbXBvcnRXYXJuaW5nVGhyZXNob2xkID0gbWF4X2ltcG9ydHNfd2FybmluZyB8fCAyMDtcblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBTYWZlIFN1YnByb2Nlc3MgSGVscGVyIHdpdGggUHJvZ3Jlc3MgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gc3Bhd25XaXRoUHJvZ3Jlc3MoZXhlOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCB0aW1lb3V0TXM6IG51bWJlcik6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBzdGRvdXQ/OiBzdHJpbmc7IHN0ZGVycj86IHN0cmluZyB9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBcdTI3MDUgRklYIEZST00gQkVMRURBUklBTlM6IFVzZSBzaGVsbDp0cnVlIGZvciBwcm9wZXIgV2luZG93cyAuY21kIHJlc29sdXRpb25cbiAgICAgICAgICAgIGNvbnN0IHByb2MgPSBzcGF3bihleGUsIGFyZ3MsIHtcbiAgICAgICAgICAgICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgJ3BpcGUnXSxcbiAgICAgICAgICAgICAgY3dkOiB3b3JraW5nRGlyLFxuICAgICAgICAgICAgICBzaGVsbDogdHJ1ZSwgIC8vIFx1MjE5MCBDUklUSUNBTDogRW5hYmxlcyBQQVRIIHJlc29sdXRpb24gYW5kIC5jbWQgZmlsZSBleGVjdXRpb24gb24gV2luZG93c1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICAgICAgICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgICAgICAgICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGQ6IEJ1ZmZlcikgPT4geyBzdGRvdXQgKz0gZC50b1N0cmluZygpOyB9KTtcbiAgICAgICAgICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkOiBCdWZmZXIpID0+IHsgc3RkZXJyICs9IGQudG9TdHJpbmcoKTsgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHsgXG4gICAgICAgICAgICAgIHByb2Mua2lsbCgpOyBcbiAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGRlcnI6IGBUaW1lb3V0IGFmdGVyICR7dGltZW91dE1zfW1zYCB9KTsgXG4gICAgICAgICAgICB9LCB0aW1lb3V0TXMpO1xuXG4gICAgICAgICAgICBwcm9jLm9uKCdjbG9zZScsICgpID0+IHsgY2xlYXJUaW1lb3V0KHRpbWVySWQpOyByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgc3Rkb3V0LCBzdGRlcnIgfSk7IH0pO1xuICAgICAgICAgICAgcHJvYy5vbignZXJyb3InLCAoZXJyKSA9PiB7IGNsZWFyVGltZW91dCh0aW1lcklkKTsgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGRlcnI6IGVyci5tZXNzYWdlIH0pOyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEEuIFR5cGVTY3JpcHQgRXh0ZW5kZWQgRGlhZ25vc3RpY3MgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuVHlwZWNoZWNrQW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IHRzQ29uZmlnUGF0aCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAndHNjb25maWcuanNvbicpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0c0NvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyB0c2NvbmZpZy5qc29uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFVzZSBucHggdHNjIGluc3RlYWQgb2YganVzdCB0c2MgKHdvcmtzIGV2ZW4gd2l0aG91dCBnbG9iYWwgVHlwZVNjcmlwdCBpbnN0YWxsKVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWyd0c2MnLCAnLS12ZXJzaW9uJ10sIDUwMDApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnVHlwZVNjcmlwdCBjb21waWxlciAodHNjKSBub3QgZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZSAodXNpbmcgaW1wb3J0ZWQgdXRpbGl0aWVzKVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDMwMDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJ3RzYycsICctLWV4dGVuZGVkRGlhZ25vc3RpY3MnXSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MgfHwgIXJlc3VsdC5zdGRvdXQpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYHRzYyBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIHRzYyAtLWV4dGVuZGVkRGlhZ25vc3RpY3Mgb3V0cHV0XG4gICAgICAgICAgY29uc3QgbGluZXMgPSByZXN1bHQuc3Rkb3V0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICBsZXQgY2hlY2tUaW1lTXMgPSAwO1xuICAgICAgICAgIGxldCBtZW1vcnlVc2VkTUIgPSAwO1xuICAgICAgICAgIGxldCBmaWxlc0NoZWNrZWQgPSAwO1xuICAgICAgICAgIGxldCBlbWl0VGltZU1zID0gMDtcbiAgICAgICAgICBsZXQgcGFyc2VUaW1lTXMgPSAwO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCBsb3dlckxpbmUgPSBsaW5lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFBhcnNlIGNoZWNrIHRpbWVcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrTWF0Y2ggPSBsb3dlckxpbmUubWF0Y2goL2NoZWNrXFxzK3RpbWU6XFxzKyhcXGQrKVxccyptcy8pO1xuICAgICAgICAgICAgaWYgKGNoZWNrTWF0Y2gpIGNoZWNrVGltZU1zID0gcGFyc2VJbnQoY2hlY2tNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBtZW1vcnkgdXNlZFxuICAgICAgICAgICAgY29uc3QgbWVtTWF0Y2ggPSBsaW5lLm1hdGNoKC9tZW1vcnkgdXNlZDpcXHMrKFxcZCspXFxzKihrYnxtYikvaSk7XG4gICAgICAgICAgICBpZiAobWVtTWF0Y2gpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUludChtZW1NYXRjaFsxXSwgMTApO1xuICAgICAgICAgICAgICBtZW1vcnlVc2VkTUIgPSBtZW1NYXRjaFsyXS50b0xvd2VyQ2FzZSgpID09PSAnbWInID8gdmFsdWUgOiBNYXRoLnJvdW5kKHZhbHVlIC8gMTAyNCAqIDEwMCkgLyAxMDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIGZpbGVzIGNoZWNrZWRcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzTWF0Y2ggPSBsaW5lLm1hdGNoKC9maWxlc1xccytjaGVja2VkOlxccysoXFxkKykvKTtcbiAgICAgICAgICAgIGlmIChmaWxlc01hdGNoKSBmaWxlc0NoZWNrZWQgPSBwYXJzZUludChmaWxlc01hdGNoWzFdLCAxMCk7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIGVtaXQgdGltZVxuICAgICAgICAgICAgY29uc3QgZW1pdE1hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9lbWl0XFxzK3RpbWU6XFxzKyhcXGQrKVxccyptcy8pO1xuICAgICAgICAgICAgaWYgKGVtaXRNYXRjaCkgZW1pdFRpbWVNcyA9IHBhcnNlSW50KGVtaXRNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBwYXJzZSB0aW1lXG4gICAgICAgICAgICBjb25zdCBwYXJzZU1hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9wYXJzZVxccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChwYXJzZU1hdGNoKSBwYXJzZVRpbWVNcyA9IHBhcnNlSW50KHBhcnNlTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQZXJmb3JtYW5jZSBhc3Nlc3NtZW50IGJhc2VkIG9uIFBERiBndWlkZWxpbmVzXG4gICAgICAgICAgbGV0IGFzc2Vzc21lbnQ6ICdmYXN0JyB8ICdtb2RlcmF0ZScgfCAnc2xvdyc7XG4gICAgICAgICAgaWYgKGNoZWNrVGltZU1zIDwgMTAwKSBhc3Nlc3NtZW50ID0gJ2Zhc3QnO1xuICAgICAgICAgIGVsc2UgaWYgKGNoZWNrVGltZU1zIDw9IDUwMCkgYXNzZXNzbWVudCA9ICdtb2RlcmF0ZSc7XG4gICAgICAgICAgZWxzZSBhc3Nlc3NtZW50ID0gJ3Nsb3cnO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNoZWNrVGltZU1zLFxuICAgICAgICAgICAgbWVtb3J5VXNlZE1COiBNYXRoLnJvdW5kKG1lbW9yeVVzZWRNQiAqIDEwMCkgLyAxMDAsXG4gICAgICAgICAgICBmaWxlc0NoZWNrZWQsXG4gICAgICAgICAgICBlbWl0VGltZU1zLFxuICAgICAgICAgICAgcGFyc2VUaW1lTXMsXG4gICAgICAgICAgICBhc3Nlc3NtZW50LFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBCLiBDaXJjdWxhciBEZXBlbmRlbmN5IERldGVjdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW5DaXJjdWxhckFuYWx5c2lzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICAgICAgICBjb25zdCBlbnRyeVBvaW50ID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICdzcmMnLCAnaW5kZXgudHMnKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZW50cnlQb2ludCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHNyYy9pbmRleC50cyBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEeW5hbWljIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplXG4gICAgICAgICAgY29uc3QgZmlsZUNvdW50ID0gYXdhaXQgY291bnRUeXBlU2NyaXB0RmlsZXMod29ya2luZ0Rpcik7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1RpbWVvdXQgPSBnZXRBbmFseXNpc1RpbWVvdXQoMjAwMDAsIGZpbGVDb3VudCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUnVuIG1hZGdlIGFuZCBjYXB0dXJlIG91dHB1dCB3aXRoIGR5bmFtaWMgdGltZW91dFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJy0teWVzJywgJ21hZGdlJywgJy0tY2lyY3VsYXInLCBlbnRyeVBvaW50XSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYG1hZGdlIGZhaWxlZDogJHtyZXN1bHQuc3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGFyc2UgbWFkZ2Ugb3V0cHV0IFx1MjAxNCBpdCBsaXN0cyBjeWNsZXMgbGlrZSBcImZpbGUxLnRzIC0+IGZpbGUyLnRzIC0+IGZpbGUxLnRzXCJcbiAgICAgICAgICBjb25zdCBjeWNsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgY29uc3Qgc3Rkb3V0ID0gcmVzdWx0LnN0ZG91dCB8fCAnJztcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IHN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgXG4gICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gICAgICAgICAgICBpZiAodHJpbW1lZCAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdGb3VuZCcpICYmICF0cmltbWVkLnN0YXJ0c1dpdGgoJ05vJykpIHtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBsb29rcyBsaWtlIGEgY3ljbGUgcGF0aFxuICAgICAgICAgICAgICBpZiAodHJpbW1lZC5pbmNsdWRlcygnLT4nKSB8fCB0cmltbWVkLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgICAgICAgICAgIGN5Y2xlcy5wdXNoKHRyaW1tZWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhhc0N5Y2xlczogY3ljbGVzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICBjeWNsZXMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEMuIEVTTGludCBJbnRlZ3JhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW5Fc2xpbnRBbmFseXNpcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgY29uc3QgZXNsaW50Q29uZmlnRmlsZXMgPSBbXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJ2VzbGludC5jb25maWcubWpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJ2VzbGludC5jb25maWcuanMnKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnLmVzbGludHJjLmpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYy5qc29uJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYycpLFxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBjb25zdCBoYXNFc2xpbnRDb25maWcgPSBlc2xpbnRDb25maWdGaWxlcy5zb21lKGYgPT4gZnMuZXhpc3RzU3luYyhmKSk7XG4gICAgICAgICAgaWYgKCFoYXNFc2xpbnRDb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIEVTTGludCBjb25maWd1cmF0aW9uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGlmIGVzbGludCBpcyBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ25weCcsIFsnZXNsaW50JywgJy0tdmVyc2lvbiddLCA1MDAwKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ0VTTGludCBub3QgZm91bmQgaW4gZGV2RGVwZW5kZW5jaWVzIG9yIFBBVEgnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDE1MDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJ2VzbGludCcsICdzcmMnLCAnLS1leHQnLCAnLnRzJywgJy0tZm9ybWF0JywgJ2pzb24nXSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYEVTTGludCBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIEpTT04gb3V0cHV0IGZyb20gZXNsaW50IC0tZm9ybWF0IGpzb25cbiAgICAgICAgICBsZXQgZXJyb3JzID0gMDtcbiAgICAgICAgICBsZXQgd2FybmluZ3MgPSAwO1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgY29uc3Qgd2FybmluZ01lc3NhZ2VzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVzdWx0LnN0ZG91dCB8fCAnJykgYXMge1xuICAgICAgICAgICAgICByZXN1bHRzPzogQXJyYXk8e1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXM/OiBBcnJheTx7IHNldmVyaXR5OiBudW1iZXI7IG1lc3NhZ2U6IHN0cmluZzsgbGluZTogbnVtYmVyOyBjb2x1bW46IG51bWJlciB9PjtcbiAgICAgICAgICAgICAgfT47XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHBhcnNlZC5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZVJlc3VsdCBvZiBwYXJzZWQucmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiAoZmlsZVJlc3VsdC5tZXNzYWdlcyB8fCBbXSkpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnNldmVyaXR5ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ycysrO1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2VzLnB1c2goYCR7ZmlsZVJlc3VsdC5maWxlUGF0aH06ICR7bWVzc2FnZS5tZXNzYWdlfSAoJHttZXNzYWdlLmxpbmV9OiR7bWVzc2FnZS5jb2x1bW59KWApO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnNldmVyaXR5ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHdhcm5pbmdzKys7XG4gICAgICAgICAgICAgICAgICAgIHdhcm5pbmdNZXNzYWdlcy5wdXNoKGAke2ZpbGVSZXN1bHQuZmlsZVBhdGh9OiAke21lc3NhZ2UubWVzc2FnZX0gKCR7bWVzc2FnZS5saW5lfToke21lc3NhZ2UuY29sdW1ufSlgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIElmIEpTT04gcGFyc2luZyBmYWlscywgZmFsbCBiYWNrIHRvIHRleHQgb3V0cHV0IGFuYWx5c2lzXG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja1N0ZG91dCA9IHJlc3VsdC5zdGRvdXQgfHwgJyc7XG4gICAgICAgICAgICBjb25zdCBlcnJvckxpbmVzID0gZmFsbGJhY2tTdGRvdXQuc3BsaXQoJ1xcbicpLmZpbHRlcihsID0+IGwuaW5jbHVkZXMoJ2Vycm9yJykgJiYgIWwuaW5jbHVkZXMoJ3dhcm5pbmcnKSk7XG4gICAgICAgICAgICBlcnJvcnMgPSBlcnJvckxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IHdhcm5pbmdMaW5lcyA9IGZhbGxiYWNrU3Rkb3V0LnNwbGl0KCdcXG4nKS5maWx0ZXIobCA9PiBsLmluY2x1ZGVzKCd3YXJuaW5nJykpO1xuICAgICAgICAgICAgd2FybmluZ3MgPSB3YXJuaW5nTGluZXMubGVuZ3RoO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5ncyxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZXM6IGVycm9yTWVzc2FnZXMuc2xpY2UoMCwgMjApLCAvLyBMaW1pdCB0byBmaXJzdCAyMFxuICAgICAgICAgICAgd2FybmluZ01lc3NhZ2VzOiB3YXJuaW5nTWVzc2FnZXMuc2xpY2UoMCwgMjApLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBELiBUeXBlU2NyaXB0IENvbmZpZyBBbmFseXNpcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBmdW5jdGlvbiBydW5Db25maWdBbmFseXNpcygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgICAgY29uc3QgdHNDb25maWdQYXRoID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICd0c2NvbmZpZy5qc29uJyk7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRzQ29uZmlnUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHRzY29uZmlnLmpzb24gZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHRzQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdHNDb25maWcgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyh0c0NvbmZpZ1BhdGgsICd1dGYtOCcpKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ0ludmFsaWQgdHNjb25maWcuanNvbiBmb3JtYXQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgY29tcGlsZXJPcHRpb25zID0gKHRzQ29uZmlnLmNvbXBpbGVyT3B0aW9ucyB8fCB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgaW5jcmVtZW50YWwgPSAhIWNvbXBpbGVyT3B0aW9ucy5pbmNyZW1lbnRhbDtcbiAgICAgICAgICBjb25zdCBza2lwTGliQ2hlY2sgPSAhIWNvbXBpbGVyT3B0aW9ucy5za2lwTGliQ2hlY2s7XG4gICAgICAgICAgY29uc3QgaXNvbGF0ZWRNb2R1bGVzID0gISFjb21waWxlck9wdGlvbnMuaXNvbGF0ZWRNb2R1bGVzO1xuICAgICAgICAgIGNvbnN0IHN0cmljdCA9ICEhY29tcGlsZXJPcHRpb25zLnN0cmljdDtcblxuICAgICAgICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgIC8vIFJlY29tbWVuZGF0aW9ucyBiYXNlZCBvbiBQREYgb3B0aW1pemF0aW9uIHRlY2huaXF1ZXNcbiAgICAgICAgICBpZiAoIWluY3JlbWVudGFsKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwiaW5jcmVtZW50YWxcIjogdHJ1ZSBpbiB0c2NvbmZpZy5qc29uIGZvciBmYXN0ZXIgYnVpbGRzIChidWlsZCBjYWNoaW5nKS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFza2lwTGliQ2hlY2spIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdFbmFibGUgXCJza2lwTGliQ2hlY2tcIjogdHJ1ZSB0byBza2lwIGNoZWNraW5nIC5kLnRzIGZpbGVzIGluIG5vZGVfbW9kdWxlcy4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFpc29sYXRlZE1vZHVsZXMpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdDb25zaWRlciBlbmFibGluZyBcImlzb2xhdGVkTW9kdWxlc1wiOiB0cnVlIGZvciBmYXN0ZXIgY29tcGlsYXRpb24gKGVzcGVjaWFsbHkgd2l0aCBCYWJlbC9lc2J1aWxkKS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFzdHJpY3QpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdFbmFibGUgXCJzdHJpY3RcIjogdHJ1ZSBmb3IgYmV0dGVyIHR5cGUgc2FmZXR5IGFuZCBmZXdlciBydW50aW1lIGVycm9ycy4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3IgcGF0aHMgY29uZmlndXJhdGlvbiAobW9kdWxlIHJlc29sdXRpb24gb3B0aW1pemF0aW9uKVxuICAgICAgICAgIGNvbnN0IHBhdGhzID0gY29tcGlsZXJPcHRpb25zLnBhdGhzIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgICAgICAgIGlmICghcGF0aHMgfHwgT2JqZWN0LmtleXMocGF0aHMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0NvbnNpZGVyIHVzaW5nIFwicGF0aHNcIiBpbiB0c2NvbmZpZy5qc29uIHRvIHNpbXBsaWZ5IG1vZHVsZSBpbXBvcnRzIGFuZCByZWR1Y2UgZGVwZW5kZW5jeSBkZXB0aC4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5jcmVtZW50YWwsXG4gICAgICAgICAgICBza2lwTGliQ2hlY2ssXG4gICAgICAgICAgICBpc29sYXRlZE1vZHVsZXMsXG4gICAgICAgICAgICBzdHJpY3QsXG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEUuIEltcG9ydCBTdHJ1Y3R1cmUgQW5hbHlzaXMgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gcnVuSW1wb3J0QW5hbHlzaXMoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICAgIGNvbnN0IHNyY0RpciA9IHBhdGguam9pbih3b3JraW5nRGlyLCAnc3JjJyk7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHNyY0RpcikpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHNyYy8gZGlyZWN0b3J5IGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENvbGxlY3QgYWxsIC50cyBmaWxlcyBpbiBzcmMvXG4gICAgICAgICAgZnVuY3Rpb24gY29sbGVjdFRzRmlsZXMoZGlyOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkubmFtZSk7XG4gICAgICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaCguLi5jb2xsZWN0VHNGaWxlcyhmdWxsUGF0aCkpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy50cycpICYmICFlbnRyeS5uYW1lLmVuZHNXaXRoKCcuZC50cycpKSB7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZpbGVzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRzRmlsZXMgPSBjb2xsZWN0VHNGaWxlcyhzcmNEaXIpO1xuICAgICAgICAgIGNvbnN0IGZpbGVzV2l0aEV4Y2Vzc2l2ZUltcG9ydHM6IEFycmF5PHsgZmlsZTogc3RyaW5nOyBjb3VudDogbnVtYmVyIH0+ID0gW107XG4gICAgICAgICAgY29uc3QgZGVjbGFyZUdsb2JhbFVzYWdlOiBBcnJheTx7IGZpbGU6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiB0c0ZpbGVzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIENvdW50IGltcG9ydHNcbiAgICAgICAgICAgICAgY29uc3QgaW1wb3J0U3RhdGVtZW50cyA9IGNvbnRlbnQubWF0Y2goL15pbXBvcnRcXHMrLiokL2dtKTtcbiAgICAgICAgICAgICAgY29uc3QgaW1wb3J0Q291bnQgPSBpbXBvcnRTdGF0ZW1lbnRzID8gaW1wb3J0U3RhdGVtZW50cy5sZW5ndGggOiAwO1xuXG4gICAgICAgICAgICAgIGlmIChpbXBvcnRDb3VudCA+IGltcG9ydFdhcm5pbmdUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzLnB1c2goeyBmaWxlOiBwYXRoLnJlbGF0aXZlKHdvcmtpbmdEaXIsIGZpbGVQYXRoKSwgY291bnQ6IGltcG9ydENvdW50IH0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGRlY2xhcmUgZ2xvYmFsIHVzYWdlIChnbG9iYWwgdHlwZSBwYXRjaGluZyBcdTIwMTQgYmFkIHByYWN0aWNlIHBlciBQREYpXG4gICAgICAgICAgICAgIGNvbnN0IGRlY2xhcmVHbG9iYWxNYXRjaGVzID0gY29udGVudC5tYXRjaCgvZGVjbGFyZVxccytnbG9iYWwvZyk7XG4gICAgICAgICAgICAgIGlmIChkZWNsYXJlR2xvYmFsTWF0Y2hlcyAmJiBkZWNsYXJlR2xvYmFsTWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZGVjbGFyZUdsb2JhbFVzYWdlLnB1c2goeyBmaWxlOiBwYXRoLnJlbGF0aXZlKHdvcmtpbmdEaXIsIGZpbGVQYXRoKSB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIC8vIFNraXAgZmlsZXMgdGhhdCBjYW4ndCBiZSByZWFkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbGVzV2l0aEV4Y2Vzc2l2ZUltcG9ydHMsXG4gICAgICAgICAgICBkZWNsYXJlR2xvYmFsVXNhZ2UsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IFJ1biBTZWxlY3RlZCBDYXRlZ29yaWVzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygndHlwZWNoZWNrJykpIHtcbiAgICAgICAgICByZXN1bHRzLnR5cGVjaGVjayA9IGF3YWl0IHJ1blR5cGVjaGVja0FuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnY2lyY3VsYXInKSkge1xuICAgICAgICAgIHJlc3VsdHMuY2lyY3VsYXIgPSBhd2FpdCBydW5DaXJjdWxhckFuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnZXNsaW50JykpIHtcbiAgICAgICAgICByZXN1bHRzLmVzbGludCA9IGF3YWl0IHJ1bkVzbGludEFuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnY29uZmlnJykpIHtcbiAgICAgICAgICByZXN1bHRzLmNvbmZpZyA9IHJ1bkNvbmZpZ0FuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnaW1wb3J0cycpKSB7XG4gICAgICAgICAgcmVzdWx0cy5pbXBvcnRzID0gcnVuSW1wb3J0QW5hbHlzaXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiByZXN1bHRzLFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQW5hbHlzaXMgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNlYXJjaCBhcyBkZGdTZWFyY2ggfSBmcm9tICdkdWNrLWR1Y2stc2NyYXBlJztcbmltcG9ydCB7IGh0bWxUb1RleHQgfSBmcm9tICdodG1sLXRvLXRleHQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZmV0Y2hXaXRoUmV0cnkgfSBmcm9tICcuLi9wZXJmb3JtYW5jZVV0aWxzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU2VhcmNoIEVuZ2luZSBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdEl0ZW0ge1xuICB0aXRsZTogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbn1cblxuLyoqIER1Y2tEdWNrR28gQVBJIChmYXN0ZXN0LCBubyBicm93c2VyIG5lZWRlZCkgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaERER0FwaShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGRkZ1NlYXJjaChxdWVyeSwgeyByZWdpb246ICd3dC13dCcgfSk7XG4gIHJldHVybiAocmVzdWx0cy5yZXN1bHRzIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PikubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICB0aXRsZTogci50aXRsZSBhcyBzdHJpbmcsXG4gICAgdXJsOiByLnVybCBhcyBzdHJpbmcsXG4gICAgZGVzY3JpcHRpb246IChyLmRlc2NyaXB0aW9uIGFzIHN0cmluZykgfHwgJycsXG4gIH0pKTtcbn1cblxuLyoqIER1Y2tEdWNrR28gSFRNTCBGZXRjaCAoZmFsbGJhY2sgd2hlbiBBUEkgZmFpbHMpICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hEREdGZXRjaChxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShcbiAgICBgaHR0cHM6Ly9odG1sLmR1Y2tkdWNrZ28uY29tL2h0bWwvP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfWBcbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBEdWNrRHVja0dvIEZldGNoIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgXG4gIC8vIFNpbXBsZSByZWdleC1iYXNlZCBwYXJzaW5nIGZvciBOb2RlLmpzIChubyBET01QYXJzZXIgbmVlZGVkISlcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIFxuICAvLyBFeHRyYWN0IHRpdGxlcyBmcm9tIDxhIGNsYXNzPVwicmVzdWx0X19hXCIgaHJlZj1cIi4uLlwiIHJlbD1cIi4uLlwiPlRpdGxlPC9hPlxuICBjb25zdCB0aXRsZVJlZ2V4ID0gLzxhW14+XStjbGFzcz1cInJlc3VsdF9fYVwiW14+XStocmVmPVwiKFteXCJdKylcIltePl0qPihbXjxdKyk8XFwvYT4vZ2k7XG4gIGxldCBtYXRjaDtcbiAgXG4gIHdoaWxlICgobWF0Y2ggPSB0aXRsZVJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHRpdGxlOiBtYXRjaFsyXS5yZXBsYWNlKC8mYW1wOy9nLCAnJicpLnRyaW0oKSxcbiAgICAgIHVybDogbWF0Y2hbMV0sXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCAxMCk7XG59XG5cbi8qKiBHb29nbGUgU2VhcmNoIHZpYSBIVE1MIEZldGNoICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hHb29nbGUocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoXG4gICAgYGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZudW09MTBgLFxuICAgIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYnIH0gfVxuICApO1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEdvb2dsZSBzZWFyY2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAvLyBTaW1wbGUgcGFyc2luZyBcdTIwMTQgZXh0cmFjdCB0aXRsZXMgYW5kIFVSTHMgZnJvbSBHb29nbGUncyBIVE1MIHN0cnVjdHVyZVxuICBjb25zdCByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW10gPSBbXTtcbiAgY29uc3QgdGl0bGVSZWdleCA9IC88aDNbXj5dKj4oLio/KTxcXC9oMz4vZztcblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSB0aXRsZVJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHRpdGxlOiBtYXRjaFsxXS5yZXBsYWNlKC88W14+XSo+L2csICcnKSwgLy8gUmVtb3ZlIEhUTUwgdGFnc1xuICAgICAgdXJsOiAnJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIDEwKTtcbn1cblxuLyoqIEJpbmcgU2VhcmNoIHZpYSBIVE1MIEZldGNoICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hCaW5nKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KFxuICAgIGBodHRwczovL3d3dy5iaW5nLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9JmNvdW50PTEwYCxcbiAgICB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2JyB9IH1cbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBCaW5nIHNlYXJjaCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIC8vIFBhcnNlIEJpbmcgcmVzdWx0cyBcdTIwMTQgc2ltaWxhciBhcHByb2FjaCB0byBHb29nbGVcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIGNvbnN0IHJlc3VsdFJlZ2V4ID0gLzxsaSBjbGFzcz1cImJfYWxnb1wiW14+XSo+KC4qPyk8XFwvbGk+L2dzO1xuXG4gIGxldCBtYXRjaDtcbiAgd2hpbGUgKChtYXRjaCA9IHJlc3VsdFJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgYmxvY2sgPSBtYXRjaFsxXTtcbiAgICBjb25zdCB0aXRsZU1hdGNoID0gYmxvY2subWF0Y2goLzxhW14+XStocmVmPVwiKFteXCJdKylcIltePl0qPihbXjxdKyk8XFwvYT4vKTtcbiAgICBpZiAodGl0bGVNYXRjaCkge1xuICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgdGl0bGU6IHRpdGxlTWF0Y2hbMl0sXG4gICAgICAgIHVybDogdGl0bGVNYXRjaFsxXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgMTApO1xufVxuXG4vKiogQWxsIGF2YWlsYWJsZSBTZWFyY2ggRW5naW5lIEZ1bmN0aW9ucyAqL1xuY29uc3QgU0VBUkNIX0VOR0lORVM6IFJlY29yZDxzdHJpbmcsIChxdWVyeTogc3RyaW5nKSA9PiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4+ID0ge1xuICAnZGRnLWFwaSc6IHNlYXJjaERER0FwaSxcbiAgJ2RkZy1mZXRjaCc6IHNlYXJjaERER0ZldGNoLFxuICAnZ29vZ2xlJzogc2VhcmNoR29vZ2xlLFxuICAnYmluZyc6IHNlYXJjaEJpbmcsXG59O1xuXG4vKiogSGFyZGNvZGVkIGZhbGxiYWNrIG9yZGVyICh3aGVuIHByaW1hcnkgZW5naW5lIGZhaWxzKSAqL1xuY29uc3QgRkFMTEJBQ0tfT1JERVIgPSBbJ2RkZy1hcGknLCAnZGRnLWZldGNoJywgJ2dvb2dsZScsICdiaW5nJ107XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZhbGxiYWNrIENoYWluIExvZ2ljID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogV2ViIHNlYXJjaCB3aXRoIGF1dG9tYXRpYyBmYWxsYmFjay5cbiAqIFN0YXJ0cyB3aXRoIHRoZSBDb25maWcgZW5naW5lIGFuZCBhdXRvbWF0aWNhbGx5IHRyaWVzIHRoZSBuZXh0IGluIHRoZSBjaGFpbi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoV2l0aEZhbGxiYWNrQ2hhaW4oXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIGNvbmZpZzogUGx1Z2luQ29uZmlnXG4pOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IHsgcXVlcnk6IHN0cmluZzsgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdOyBjb3VudDogbnVtYmVyOyBlbmdpbmU6IHN0cmluZyB9OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gIC8vIFN0YXJ0IGVuZ2luZSBmcm9tIENvbmZpZyAoU2luZ2xlIFNlbGVjdClcbiAgY29uc3QgcHJpbWFyeUVuZ2luZSA9IGNvbmZpZy5zZWFyY2hGYWxsYmFja0NoYWluIHx8ICdkZGctYXBpJztcbiAgXG4gIC8vIEZhbGxiYWNrIGNoYWluOiBwcmltYXJ5IGVuZ2luZSArIGFsbCBvdGhlcnMgaW4gZGVmaW5lZCBvcmRlclxuICBjb25zdCBjaGFpbiA9IFtwcmltYXJ5RW5naW5lLCAuLi5GQUxMQkFDS19PUkRFUi5maWx0ZXIoZSA9PiBlICE9PSBwcmltYXJ5RW5naW5lKV07XG5cbiAgZm9yIChjb25zdCBlbmdpbmUgb2YgY2hhaW4pIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2VhcmNoRm4gPSBTRUFSQ0hfRU5HSU5FU1tlbmdpbmVdO1xuICAgICAgaWYgKCFzZWFyY2hGbikge1xuICAgICAgICBjb25zb2xlLndhcm4oYFNlYXJjaCBlbmdpbmUgXCIke2VuZ2luZX1cIiBub3QgZm91bmQsIHNraXBwaW5nYCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgc2VhcmNoRm4ocXVlcnkpO1xuXG4gICAgICAvLyBWYWxpZGF0ZSByZXN1bHQgY291bnQgLSB3YXJuIGlmIGxvdyByZXN1bHRzXG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgTG93IHNlYXJjaCByZXN1bHRzIGZvciBcIiR7cXVlcnl9XCI6ICR7cmVzdWx0cy5sZW5ndGh9IHJlc3VsdHMgZnJvbSAke2VuZ2luZX1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogeyBxdWVyeSwgcmVzdWx0cywgY291bnQ6IHJlc3VsdHMubGVuZ3RoLCBlbmdpbmUgfSxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBjb25zb2xlLndhcm4oYFNlYXJjaCBlbmdpbmUgXCIke2VuZ2luZX1cIiBmYWlsZWQ6ICR7bWVzc2FnZX1gKTtcbiAgICAgIC8vIFRyeSBuZXh0IGVuZ2luZSBpbiB0aGUgY2hhaW5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3VjY2VzczogZmFsc2UsXG4gICAgZXJyb3I6IGBBbGwgc2VhcmNoIGVuZ2luZXMgZmFpbGVkLiBUcmllZDogJHtjaGFpbi5qb2luKCcgXHUyMTkyICcpfWAsXG4gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBXZWJTZWFyY2hQYXJhbXMgeyBxdWVyeTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgV2lraXBlZGlhU2VhcmNoUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgbGFuZz86IHN0cmluZzsgfVxuaW50ZXJmYWNlIEZldGNoV2ViQ29udGVudFBhcmFtcyB7IHVybDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmFnV2ViQ29udGVudFBhcmFtcyB7IHVybDogc3RyaW5nOyBxdWVyeTogc3RyaW5nOyB9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlcldlYlJlc2VhcmNoVG9vbHMoY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gd2ViX3NlYXJjaCB0b29sIFx1MjAxNCB1c2VzIHByaW1hcnkgZW5naW5lIGZyb20gQ29uZmlnICsgYXV0b21hdGljIGZhbGxiYWNrXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3dlYl9zZWFyY2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIHRoZSB3ZWIgdXNpbmcgYSBjb25maWd1cmFibGUgc2VhcmNoIGVuZ2luZSB3aXRoIGF1dG9tYXRpYyBmYWxsYmFjayB0byBvdGhlciBlbmdpbmVzIGlmIHRoZSBwcmltYXJ5IG9uZSBmYWlscy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2VhcmNoIHF1ZXJ5JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnkgfTogV2ViU2VhcmNoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICByZXR1cm4gYXdhaXQgc2VhcmNoV2l0aEZhbGxiYWNrQ2hhaW4ocXVlcnksIGNvbmZpZyk7XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHdpa2lwZWRpYV9zZWFyY2ggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3aWtpcGVkaWFfc2VhcmNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCBXaWtpcGVkaWEgZm9yIGEgZ2l2ZW4gcXVlcnkgYW5kIHJldHVybiBwYWdlIHN1bW1hcmllcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2VhcmNoIHF1ZXJ5JyksXG4gICAgICBsYW5nOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnZW4nKS5kZXNjcmliZSgnTGFuZ3VhZ2UgY29kZSAoZGVmYXVsdDogZW4pJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIGxhbmcgfTogV2lraXBlZGlhU2VhcmNoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGlVcmwgPSBgaHR0cHM6Ly8ke2xhbmcgfHwgJ2VuJ30ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXF1ZXJ5Jmxpc3Q9c2VhcmNoJnNyc2VhcmNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX0mZm9ybWF0PWpzb24mb3JpZ2luPSpgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KGFwaVVybCk7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV2lraXBlZGlhIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlc3BvbnNlLmpzb24oKSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIGNvbnN0IHF1ZXJ5RGF0YSA9IGRhdGEucXVlcnkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHNlYXJjaFJlc3VsdHMgPSAocXVlcnlEYXRhPy5zZWFyY2ggYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KSB8fCBbXTtcbiAgICAgICAgY29uc3QgcGFnZXMgPSBzZWFyY2hSZXN1bHRzLm1hcCgoaXRlbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgICAgICBjb25zdCB0aXRsZSA9IHR5cGVvZiBpdGVtLnRpdGxlID09PSAnc3RyaW5nJyA/IGl0ZW0udGl0bGUgOiAnJztcbiAgICAgICAgICBjb25zdCBzbmlwcGV0ID0gdHlwZW9mIGl0ZW0uc25pcHBldCA9PT0gJ3N0cmluZycgPyBpdGVtLnNuaXBwZXQucmVwbGFjZSgvPFtePl0qPi9nLCAnJykgOiAnJztcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBzbmlwcGV0LFxuICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly8ke2xhbmcgfHwgJ2VuJ30ud2lraXBlZGlhLm9yZy93aWtpLyR7ZW5jb2RlVVJJQ29tcG9uZW50KHRpdGxlKX1gLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcXVlcnksIGxhbmd1YWdlOiBsYW5nIHx8ICdlbicsIHJlc3VsdHM6IHBhZ2VzLCBjb3VudDogcGFnZXMubGVuZ3RoIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFdpa2lwZWRpYSBzZWFyY2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmZXRjaF93ZWJfY29udGVudCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ZldGNoX3dlYl9jb250ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZldGNoIHRoZSBjbGVhbiwgdGV4dC1iYXNlZCBjb250ZW50IG9mIGEgd2VicGFnZSBVUkwuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1RoZSBVUkwgdG8gZmV0Y2gnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB1cmwgfTogRmV0Y2hXZWJDb250ZW50UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KHVybCk7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gaHRtbFRvVGV4dChodG1sLCB7XG4gICAgICAgICAgd29yZHdyYXA6IGZhbHNlLFxuICAgICAgICAgIHNlbGVjdG9yczogW1xuICAgICAgICAgICAgeyBzZWxlY3RvcjogJ2EnLCBvcHRpb25zOiB7IGlnbm9yZUhyZWY6IHRydWUgfSB9LFxuICAgICAgICAgICAgeyBzZWxlY3RvcjogJ2ltZycsIGZvcm1hdDogJ1tpbWFnZV0nIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB1cmwsIGNvbnRlbnQ6IHRleHQuc3Vic3RyaW5nKDAsIDUwMDApIH0gfTsgLy8gTGltaXQgbGVuZ3RoXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZmV0Y2ggY29udGVudDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmFnX3dlYl9jb250ZW50IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX3dlYl9jb250ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZldGNoIGNvbnRlbnQgZnJvbSBhIFVSTCwgYW5kIHRoZW4gdXNlIFJBRyB0byBmaW5kIGFuZCByZXR1cm4gb25seSB0aGUgdGV4dCBjaHVua3MgbW9zdCByZWxldmFudCB0byBhIHNwZWNpZmljIHF1ZXJ5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIGZldGNoJyksXG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeSBmb3IgcmVsZXZhbmNlIG1hdGNoaW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsLCBxdWVyeSB9OiBSYWdXZWJDb250ZW50UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KHVybCk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgICAgICAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGh0bWxUb1RleHQoaHRtbCk7XG5cbiAgICAgICAgLy8gU2ltcGxlIGtleXdvcmQtYmFzZWQgcmVsZXZhbmNlIHNjb3JpbmcgKHBsYWNlaG9sZGVyIGZvciByZWFsIFJBRylcbiAgICAgICAgY29uc3QgcXVlcnlUZXJtcyA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCkuc3BsaXQoL1xccysvKS5maWx0ZXIoKHQ6IHN0cmluZykgPT4gdC5sZW5ndGggPiAyKTtcbiAgICAgICAgY29uc3Qgc2VudGVuY2VzID0gdGV4dC5zcGxpdCgvWy4hP10rLykubWFwKChzOiBzdHJpbmcpID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAgICAgY29uc3QgcmVsZXZhbnRDaHVua3MgPSBzZW50ZW5jZXMuZmlsdGVyKChzZW50ZW5jZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHF1ZXJ5VGVybXMuc29tZSgodGVybTogc3RyaW5nKSA9PiBzZW50ZW5jZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHRlcm0pKTtcbiAgICAgICAgfSkuc2xpY2UoMCwgNSk7IC8vIFJldHVybiB0b3AgNSBoaXRzXG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB1cmwsIHF1ZXJ5LCBjaHVua3M6IHJlbGV2YW50Q2h1bmtzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBzZWFyY2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCAqIGFzIGNoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuLy8gTGF6eS1sb2FkIHNpbXBsZS1naXQgZm9yIHRlc3RhYmlsaXR5XG5sZXQgc2ltcGxlR2l0TW9kdWxlOiB0eXBlb2YgaW1wb3J0KCdzaW1wbGUtZ2l0JykgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2ltcGxlR2l0KCk6IFByb21pc2U8dHlwZW9mIGltcG9ydCgnc2ltcGxlLWdpdCcpPiB7XG4gIGlmICghc2ltcGxlR2l0TW9kdWxlKSB7XG4gICAgc2ltcGxlR2l0TW9kdWxlID0gYXdhaXQgaW1wb3J0KCdzaW1wbGUtZ2l0Jyk7XG4gIH1cbiAgcmV0dXJuIHNpbXBsZUdpdE1vZHVsZTtcbn1cblxuLyoqIFJlc2V0IGdpdCBtb2R1bGUgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0R2l0Q2FjaGUoKTogdm9pZCB7XG4gIHNpbXBsZUdpdE1vZHVsZSA9IG51bGw7XG59XG5cbi8qKiBDcmVhdGUgYSBmcmVzaCBnaXQgaW5zdGFuY2UgZm9yIGVhY2ggb3BlcmF0aW9uIHRvIGF2b2lkIGN3ZCBpc3N1ZXMgKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUdpdCgpIHtcbiAgY29uc3QgeyBkZWZhdWx0OiBzaW1wbGVHaXQgfSA9IGF3YWl0IGdldFNpbXBsZUdpdCgpO1xuICByZXR1cm4gc2ltcGxlR2l0KCk7XG59XG5cbi8qKlxuICogRXh0cmFjdCBHaXRIdWIgcmVwbyBuYW1lIGZyb20gZ2l0IHJlbW90ZSBVUkwgb3IgZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gKiBUcmllcyBtdWx0aXBsZSBzb3VyY2VzIGluIG9yZGVyIG9mIHJlbGlhYmlsaXR5LlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRSZXBvTmFtZSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgLy8gUHJpb3JpdHkgMTogRW52aXJvbm1lbnQgdmFyaWFibGUgKEdpdEh1YiBBY3Rpb25zLCBDSS9DRClcbiAgaWYgKHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPU0lUT1JZKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPU0lUT1JZO1xuICB9XG5cbiAgLy8gUHJpb3JpdHkgMjogR2l0IHJlbW90ZSBVUkwgcGFyc2luZyB2aWEgY2hpbGRfcHJvY2Vzc1xuICB0cnkge1xuICAgIGNvbnN0IG91dHB1dCA9IGNoaWxkUHJvY2Vzcy5leGVjU3luYygnZ2l0IHJlbW90ZSBnZXQtdXJsIG9yaWdpbiAyPi9kZXYvbnVsbCcsIHsgXG4gICAgICBlbmNvZGluZzogJ3V0Zi04JyxcbiAgICAgIHN0ZGlvOiBbJ3BpcGUnLCAncGlwZScsICdpZ25vcmUnXVxuICAgIH0pO1xuICAgIGNvbnN0IHJlbW90ZVVybCA9IChvdXRwdXQgYXMgc3RyaW5nKS50cmltKCk7XG4gICAgXG4gICAgaWYgKHJlbW90ZVVybCkge1xuICAgICAgLy8gSGFuZGxlIFNTSCBmb3JtYXQ6IGdpdEBnaXRodWIuY29tOnVzZXIvcmVwby5naXRcbiAgICAgIGNvbnN0IHNzaE1hdGNoID0gcmVtb3RlVXJsLm1hdGNoKC9naXRAZ2l0aHViXFwuY29tWzovXShbXi9dK1xcL1teL10rKVxcLmdpdCQvKTtcbiAgICAgIGlmIChzc2hNYXRjaCkgcmV0dXJuIHNzaE1hdGNoWzFdO1xuICAgICAgXG4gICAgICAvLyBIYW5kbGUgSFRUUFMgZm9ybWF0OiBodHRwczovL2dpdGh1Yi5jb20vdXNlci9yZXBvLmdpdFxuICAgICAgY29uc3QgaHR0cHNNYXRjaCA9IHJlbW90ZVVybC5tYXRjaCgvaHR0cHM6XFwvXFwvZ2l0aHViXFwuY29tXFwvKFteL10rXFwvW14vXSspXFwuZ2l0JC8pO1xuICAgICAgaWYgKGh0dHBzTWF0Y2gpIHJldHVybiBodHRwc01hdGNoWzFdO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gR2l0IHJlbW90ZSBub3QgYXZhaWxhYmxlLCBjb250aW51ZSB0byBuZXh0IHByaW9yaXR5XG4gIH1cblxuICAvLyBQcmlvcml0eSAzOiBFbnZpcm9ubWVudCB2YXJpYWJsZSBHSVRIVUJfUkVQTyBhcyBmYWxsYmFja1xuICBpZiAocHJvY2Vzcy5lbnYuR0lUSFVCX1JFUE8pIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuR0lUSFVCX1JFUE87XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBTaGFyZWQgaGVscGVyOiBNYWtlIEdpdEh1YiBBUEkgcmVxdWVzdHMgd2l0aCBhdXRoZW50aWNhdGlvblxuICovXG5hc3luYyBmdW5jdGlvbiBnaEFwaVJlcXVlc3QobWV0aG9kOiBzdHJpbmcsIGVuZHBvaW50OiBzdHJpbmcsIGJvZHk/OiB1bmtub3duKSB7XG4gIGNvbnN0IGdpdGh1YlRva2VuID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOO1xuICBcbiAgaWYgKCFnaXRodWJUb2tlbikgdGhyb3cgbmV3IEVycm9yKCdHSVRIVUJfVE9LRU4gZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgbm90IHNldCcpO1xuICBcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbSR7ZW5kcG9pbnR9YCwge1xuICAgIG1ldGhvZCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtnaXRodWJUb2tlbn1gLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9LFxuICAgIGJvZHk6IGJvZHkgPyBKU09OLnN0cmluZ2lmeShib2R5KSA6IHVuZGVmaW5lZCxcbiAgfSk7XG5cbiAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEdpdEh1YiBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSk6ICR7ZXJyb3JUZXh0fWApO1xuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbn1cblxuLyoqIFR5cGVkIHBhcmFtcyBpbnRlcmZhY2VzICovXG50eXBlIEdpdFN0YXR1c1BhcmFtcyA9IFJlY29yZDxzdHJpbmcsIG5ldmVyPjtcbmludGVyZmFjZSBHaXREaWZmUGFyYW1zIHsgZmlsZV9wYXRoPzogc3RyaW5nOyBjYWNoZWQ/OiBib29sZWFuOyB9XG5pbnRlcmZhY2UgR2l0Q29tbWl0UGFyYW1zIHsgbWVzc2FnZTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgR2l0TG9nUGFyYW1zIHsgbWF4X2NvdW50PzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2l0QWRkUGFyYW1zIHsgcGF0aHM/OiBzdHJpbmdbXTsgfVxuaW50ZXJmYWNlIEdpdENoZWNrb3V0UGFyYW1zIHsgYnJhbmNoX25hbWU6IHN0cmluZzsgY3JlYXRlX25ldz86IGJvb2xlYW47IH1cbmludGVyZmFjZSBHaENyZWF0ZUlzc3VlUGFyYW1zIHsgdGl0bGU6IHN0cmluZzsgYm9keT86IHN0cmluZzsgbGFiZWxzPzogc3RyaW5nW107IH1cbmludGVyZmFjZSBHaExpc3RJc3N1ZXNQYXJhbXMgeyBzdGF0ZT86ICdvcGVuJyB8ICdjbG9zZWQnOyBsYWJlbHM/OiBzdHJpbmdbXTsgbGltaXQ/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHaFZpZXdDb21tZW50c1BhcmFtcyB7IG51bWJlcjogbnVtYmVyOyB0eXBlPzogJ2lzc3VlJyB8ICdwcic7IH1cbmludGVyZmFjZSBHaENyZWF0ZVByUGFyYW1zIHsgdGl0bGU6IHN0cmluZzsgYm9keT86IHN0cmluZzsgaGVhZF9icmFuY2g6IHN0cmluZzsgYmFzZV9icmFuY2g/OiBzdHJpbmc7IH1cbmludGVyZmFjZSBHaExpc3RQcnNQYXJhbXMgeyBzdGF0ZT86ICdvcGVuJyB8ICdjbG9zZWQnOyBsaW1pdD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdoVmlld1ByRGlmZlBhcmFtcyB7IG51bWJlcjogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2hQdXNoUGFyYW1zIHsgYnJhbmNoPzogc3RyaW5nOyB9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckdpdFRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBnaXRfc3RhdHVzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X3N0YXR1cycsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgdGhlIGN1cnJlbnQgZ2l0IHN0YXR1cyBvZiB0aGUgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoX3BhcmFtczogR2l0U3RhdHVzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgY29uc3Qgc3RhdHVzUmVzdWx0ID0gYXdhaXQgZ2l0LnN0YXR1cygpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBzdGF0dXNSZXN1bHQgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBzdGF0dXMgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfZGlmZiB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9kaWZmJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCB0aGUgZ2l0IGRpZmYgb2YgdGhlIGN1cnJlbnQgcmVwb3NpdG9yeSBvciBzcGVjaWZpYyBmaWxlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbDogUGF0aCB0byBzcGVjaWZpYyBmaWxlIHRvIGRpZmYuJyksXG4gICAgICBjYWNoZWQ6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ09wdGlvbmFsOiBTaG93IHN0YWdlZCBjaGFuZ2VzIG9ubHkgKGdpdCBkaWZmIC0tY2FjaGVkKS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX3BhdGgsIGNhY2hlZCB9OiBHaXREaWZmUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgbGV0IGRpZmYgPSAnJztcbiAgICAgICAgaWYgKGZpbGVfcGF0aCkge1xuICAgICAgICAgIGRpZmYgPSBhd2FpdCBnaXQuZGlmZihbZmlsZV9wYXRoXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlmZiA9IGNhY2hlZCA/IGF3YWl0IGdpdC5kaWZmKFsnLS1jYWNoZWQnXSkgOiBhd2FpdCBnaXQuZGlmZigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGlmZiB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgZGlmZiBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9jb21taXQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfY29tbWl0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvbW1pdCBzdGFnZWQgY2hhbmdlcyB0byB0aGUgZ2l0IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBtZXNzYWdlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tbWl0IG1lc3NhZ2UnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBtZXNzYWdlIH06IEdpdENvbW1pdFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGF3YWl0IGdpdC5jb21taXQobWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWl0dGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBjb21taXQgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfbG9nIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2xvZycsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgcmVjZW50IGdpdCBjb21taXQgaGlzdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG1heF9jb3VudDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnTWF4IG51bWJlciBvZiBjb21taXRzIHRvIHJldHVybiAoZGVmYXVsdDogMTApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbWF4X2NvdW50IH06IEdpdExvZ1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gbWF4X2NvdW50IHx8IDEwO1xuICAgICAgICBjb25zdCBsb2cgPSBhd2FpdCBnaXQubG9nKGNvdW50KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21taXRzOiBsb2cuYWxsIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBsb2cgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfYWRkIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2FkZCcsXG4gICAgZGVzY3JpcHRpb246ICdTdGFnZSBzcGVjaWZpYyBmaWxlcyBvciBhbGwgY2hhbmdlcyBmb3IgdGhlIG5leHQgY29tbWl0LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0aHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFNwZWNpZmljIGZpbGUgcGF0aHMgdG8gc3RhZ2UuIElmIG9taXR0ZWQsIHN0YWdlcyBhbGwgY2hhbmdlcy4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRocyB9OiBHaXRBZGRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBpZiAocGF0aHMgJiYgcGF0aHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGF3YWl0IGdpdC5hZGQocGF0aHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF3YWl0IGdpdC5hZGQoJy4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHN0YWdlZFBhdGhzOiBwYXRocyB8fCAnYWxsJyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgYWRkIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2NoZWNrb3V0IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2NoZWNrb3V0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1N3aXRjaCB0byBhbiBleGlzdGluZyBicmFuY2ggb3IgY3JlYXRlIGFuZCBzd2l0Y2ggdG8gYSBuZXcgb25lLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgYnJhbmNoX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05hbWUgb2YgdGhlIGJyYW5jaCB0byBjaGVja291dC4nKSxcbiAgICAgIGNyZWF0ZV9uZXc6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoXCJJZiB0cnVlLCBjcmVhdGVzIHRoZSBicmFuY2ggaWYgaXQgZG9lc24ndCBleGlzdCAobGlrZSBnaXQgY2hlY2tvdXQgLWIpLlwiKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBicmFuY2hfbmFtZSwgY3JlYXRlX25ldyB9OiBHaXRDaGVja291dFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGlmIChjcmVhdGVfbmV3KSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmNoZWNrb3V0TG9jYWxCcmFuY2goYnJhbmNoX25hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF3YWl0IGdpdC5jaGVja291dChicmFuY2hfbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBicmFuY2hOYW1lOiBicmFuY2hfbmFtZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgY2hlY2tvdXQgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9hdXRoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfYXV0aCcsXG4gICAgZGVzY3JpcHRpb246ICdDaGVjayBHaXRIdWIgYXV0aGVudGljYXRpb24gc3RhdHVzLiBJZiBub3QgYXV0aGVudGljYXRlZCwgb3BlbnMgYSB0ZXJtaW5hbCB3aW5kb3cgZm9yIHRoZSB1c2VyIHRvIHNpZ24gaW4uJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0aHViVG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU47XG4gICAgICAgIFxuICAgICAgICBpZiAoIWdpdGh1YlRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnR0lUSFVCX1RPS0VOIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG5vdCBzZXQuIFBsZWFzZSBzZXQgaXQgdG8gdXNlIEdpdEh1YiBBUEkgdG9vbHMuJyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBnaEFwaVJlcXVlc3QoJ0dFVCcsICcvdXNlcicpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGF1dGhlbnRpY2F0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGF1dGggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9jcmVhdGVfaXNzdWUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9jcmVhdGVfaXNzdWUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IEdpdEh1YiBpc3N1ZSBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSB0aXRsZScpLFxuICAgICAgYm9keTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgaXNzdWUgYm9keS9kZXNjcmlwdGlvbicpLFxuICAgICAgbGFiZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0xhYmVscyB0byBhcHBseScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBib2R5LCBsYWJlbHMgfTogR2hDcmVhdGVJc3N1ZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBhd2FpdCBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lLiBFbnN1cmUgR0lUSFVCX1JFUE9TSVRPUlkgZW52IGlzIHNldCBvciBnaXQgcmVtb3RlIFwib3JpZ2luXCIgcG9pbnRzIHRvIGEgR2l0SHViIHJlcG8uJyk7XG5cbiAgICAgICAgYXdhaXQgZ2hBcGlSZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9pc3N1ZXNgLCB7IHRpdGxlLCBib2R5LCBsYWJlbHMgfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY3JlYXRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgaXNzdWUgY3JlYXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9saXN0X2lzc3VlcyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2xpc3RfaXNzdWVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xpc3QgaXNzdWVzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzdGF0ZTogei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdvcGVuJykuZGVzY3JpYmUoJ0ZpbHRlciBieSBpc3N1ZSBzdGF0ZScpLFxuICAgICAgbGFiZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZpbHRlciBieSBsYWJlbHMnKSxcbiAgICAgIGxpbWl0OiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBpc3N1ZXMgdG8gcmV0dXJuIChkZWZhdWx0OiAxMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzdGF0ZSwgbGFiZWxzLCBsaW1pdCB9OiBHaExpc3RJc3N1ZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBsZXQgcXVlcnkgPSBgc3RhdGU9JHtzdGF0ZX1gO1xuICAgICAgICBpZiAobGFiZWxzICYmIGxhYmVscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcXVlcnkgKz0gYCZsYWJlbHM9JHtsYWJlbHMuam9pbignLCcpfWA7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc3N1ZXMgPSBhd2FpdCBnaEFwaVJlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vaXNzdWVzPyR7cXVlcnl9JnBlcl9wYWdlPSR7bGltaXQgfHwgMTB9YCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaXNzdWVzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBpc3N1ZXMgbGlzdGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3ZpZXdfY29tbWVudHMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF92aWV3X2NvbW1lbnRzJyxcbiAgICBkZXNjcmlwdGlvbjogJ1ZpZXcgY29tbWVudHMgb24gYSBzcGVjaWZpYyBpc3N1ZSBvciBwdWxsIHJlcXVlc3QuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLmRlc2NyaWJlKCdUaGUgaXNzdWUgb3IgUFIgbnVtYmVyJyksXG4gICAgICB0eXBlOiB6LmVudW0oWydpc3N1ZScsICdwciddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ2lzc3VlJykuZGVzY3JpYmUoXCJXaGV0aGVyIGl0J3MgYW4gaXNzdWUgb3IgYSBwdWxsIHJlcXVlc3RcIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbnVtYmVyLCB0eXBlIH06IEdoVmlld0NvbW1lbnRzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgY29uc3QgY29tbWVudHMgPSBhd2FpdCBnaEFwaVJlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vJHt0eXBlID09PSAncHInID8gJ3B1bGxzJyA6ICdpc3N1ZXMnfS8ke251bWJlcn0vY29tbWVudHNgKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21tZW50cyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgY29tbWVudHMgdmlld2luZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2NyZWF0ZV9wciB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2NyZWF0ZV9wcicsXG4gICAgZGVzY3JpcHRpb246ICdDcmVhdGUgYSBuZXcgcHVsbCByZXF1ZXN0IGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIFBSIHRpdGxlJyksXG4gICAgICBib2R5OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBQUiBib2R5L2Rlc2NyaXB0aW9uJyksXG4gICAgICBoZWFkX2JyYW5jaDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGJyYW5jaCBjb250YWluaW5nIHlvdXIgY2hhbmdlcycpLFxuICAgICAgYmFzZV9icmFuY2g6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdtYWluJykuZGVzY3JpYmUoJ1RoZSBicmFuY2ggeW91IHdhbnQgdG8gbWVyZ2UgaW50byAoZS5nLiwgbWFpbiwgbWFzdGVyKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBib2R5LCBoZWFkX2JyYW5jaCwgYmFzZV9icmFuY2ggfTogR2hDcmVhdGVQclBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBhd2FpdCBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lLicpO1xuXG4gICAgICAgIGNvbnN0IHByID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9wdWxsc2AsIHsgdGl0bGUsIGJvZHksIGhlYWQ6IGhlYWRfYnJhbmNoLCBiYXNlOiBiYXNlX2JyYW5jaCB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjcmVhdGVkOiB0cnVlLCB1cmw6IChwciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuaHRtbF91cmwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIFBSIGNyZWF0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfbGlzdF9wcnMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9saXN0X3BycycsXG4gICAgZGVzY3JpcHRpb246ICdMaXN0IHB1bGwgcmVxdWVzdHMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHN0YXRlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ29wZW4nKS5kZXNjcmliZSgnRmlsdGVyIGJ5IFBSIHN0YXRlJyksXG4gICAgICBsaW1pdDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggUFJzIHRvIHJldHVybiAoZGVmYXVsdDogMTApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc3RhdGUsIGxpbWl0IH06IEdoTGlzdFByc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBhd2FpdCBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lLicpO1xuXG4gICAgICAgIGNvbnN0IHBycyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9wdWxscz9zdGF0ZT0ke3N0YXRlfSZwZXJfcGFnZT0ke2xpbWl0IHx8IDEwfWApO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHBycyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgUFJzIGxpc3RpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF92aWV3X3ByX2RpZmYgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF92aWV3X3ByX2RpZmYnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmV0Y2ggdGhlIGRpZmYvcGF0Y2ggb2YgYSBzcGVjaWZpYyBwdWxsIHJlcXVlc3QuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLmRlc2NyaWJlKCdUaGUgUFIgbnVtYmVyJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbnVtYmVyIH06IEdoVmlld1ByRGlmZlBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBhd2FpdCBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lLicpO1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvJHtyZXBvTmFtZX0vcHVsbHMvJHtudW1iZXJ9L2RpZmZgLCB7XG4gICAgICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU59YCB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggZGlmZjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBkaWZmID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRpZmYgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIFBSIGRpZmYgZmV0Y2hpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9wdXNoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfcHVzaCcsXG4gICAgZGVzY3JpcHRpb246ICdQdXNoIGxvY2FsIGNvbW1pdHMgdG8gdGhlIHJlbW90ZSBHaXRIdWIgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGJyYW5jaDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbDogVGhlIGJyYW5jaCB0byBwdXNoLiBEZWZhdWx0cyB0byBjdXJyZW50IGJyYW5jaC4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBicmFuY2ggfTogR2hQdXNoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgYXdhaXQgZ2l0LnB1c2goYnJhbmNoIHx8ICdvcmlnaW4nLCAnSEVBRCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHB1c2hlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgcHVzaCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuLy8gQzUgRklYOiBQcm9wZXIgdHlwaW5nIGluc3RlYWQgb2YgYW55XG5pbXBvcnQgdHlwZSAqIGFzIFB1cHBldGVlciBmcm9tICdwdXBwZXRlZXInO1xuXG5sZXQgcHVwcGV0ZWVyTW9kdWxlOiB0eXBlb2YgUHVwcGV0ZWVyIHwgbnVsbCA9IG51bGw7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFB1cHBldGVlcigpOiBQcm9taXNlPHR5cGVvZiBQdXBwZXRlZXI+IHtcbiAgaWYgKCFwdXBwZXRlZXJNb2R1bGUpIHtcbiAgICBjb25zdCBpbXBvcnRlZCA9IGF3YWl0IGltcG9ydCgncHVwcGV0ZWVyJyk7XG4gICAgcHVwcGV0ZWVyTW9kdWxlID0gaW1wb3J0ZWQuZGVmYXVsdCB8fCBpbXBvcnRlZDtcbiAgfVxuICByZXR1cm4gcHVwcGV0ZWVyTW9kdWxlO1xufVxuXG4vKiogUmVzZXQgcHVwcGV0ZWVyIG1vZHVsZSBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRQdXBwZXRlZXJDYWNoZSgpOiB2b2lkIHtcbiAgcHVwcGV0ZWVyTW9kdWxlID0gbnVsbDtcbn1cbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cblxuLyoqIEJyb3dzZXIgc2Vzc2lvbiBtYW5hZ2VyIHdpdGggYXV0by1jbGVhbnVwIGFuZCBjb25uZWN0aW9uIHBvb2xpbmcgKHNpbmdsZXRvbiBwYXR0ZXJuKSAqL1xuY2xhc3MgQnJvd3NlclNlc3Npb25NYW5hZ2VyIHtcbiAgcHJpdmF0ZSBicm93c2VySW5zdGFuY2U6IFB1cHBldGVlci5Ccm93c2VyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3VycmVudFBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY2xlYW51cFRpbWVyOiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxhc3RBY3Rpdml0eSA9IERhdGUubm93KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgSU5BQ1RJVklUWV9USU1FT1VUX01TID0gNSAqIDYwICogMTAwMDsgLy8gNSBtaW51dGVzXG4gIHByaXZhdGUgcmVhZG9ubHkgTUFYX1JFVFJJRVMgPSAyO1xuICBwcml2YXRlIHJldHJ5Q291bnQgPSAwO1xuXG4gIC8qKiBHZXQgb3IgY3JlYXRlIGEgcGVyc2lzdGVudCBQdXBwZXRlZXIgYnJvd3NlciBpbnN0YW5jZSB3aXRoIGF1dG8tcmV0cnkgKi9cbiAgYXN5bmMgZ2V0QnJvd3NlcigpOiBQcm9taXNlPFB1cHBldGVlci5Ccm93c2VyPiB7XG4gICAgaWYgKCF0aGlzLmJyb3dzZXJJbnN0YW5jZSB8fCAhdGhpcy5icm93c2VySW5zdGFuY2UuY29ubmVjdGVkKCkpIHtcbiAgICAgIHRoaXMucmV0cnlDb3VudCA9IDA7XG4gICAgICB3aGlsZSAodGhpcy5yZXRyeUNvdW50IDwgdGhpcy5NQVhfUkVUUklFUykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHB1cHBldGVlckxpYiA9IGF3YWl0IGdldFB1cHBldGVlcigpO1xuICAgICAgICAgIHRoaXMuYnJvd3Nlckluc3RhbmNlID0gYXdhaXQgcHVwcGV0ZWVyTGliLmxhdW5jaCh7IFxuICAgICAgICAgICAgaGVhZGxlc3M6IHRydWUsXG4gICAgICAgICAgICBhcmdzOiBbJy0tbm8tc2FuZGJveCcsICctLWRpc2FibGUtc2V0dWlkLXNhbmRib3gnXSAvLyBQZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25zXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgdGhpcy5yZXRyeUNvdW50Kys7XG4gICAgICAgICAgaWYgKHRoaXMucmV0cnlDb3VudCA+PSB0aGlzLk1BWF9SRVRSSUVTKSB0aHJvdyBlcnJvcjtcbiAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwMCAqIHRoaXMucmV0cnlDb3VudCkpOyAvLyBFeHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZXNldENsZWFudXBUaW1lcigpO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgcmV0dXJuIHRoaXMuYnJvd3Nlckluc3RhbmNlITtcbiAgfVxuXG4gIC8qKiBHZXQgb3IgY3JlYXRlIGEgcGFnZSBpbiB0aGUgcGVyc2lzdGVudCBicm93c2VyIGluc3RhbmNlICovXG4gIGFzeW5jIGdldFBhZ2UoKTogUHJvbWlzZTxQdXBwZXRlZXIuUGFnZT4ge1xuICAgIGlmICghdGhpcy5jdXJyZW50UGFnZSB8fCAhYXdhaXQgdGhpcy5pc1BhZ2VWYWxpZCgpKSB7XG4gICAgICBjb25zdCBicm93c2VyID0gYXdhaXQgdGhpcy5nZXRCcm93c2VyKCk7XG4gICAgICB0aGlzLmN1cnJlbnRQYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG4gICAgfVxuICAgIHRoaXMucmVzZXRDbGVhbnVwVGltZXIoKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UGFnZTtcbiAgfVxuXG4gIC8qKiBDaGVjayBpZiBjdXJyZW50IHBhZ2UgaXMgc3RpbGwgdmFsaWQgKi9cbiAgcHJpdmF0ZSBhc3luYyBpc1BhZ2VWYWxpZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCF0aGlzLmN1cnJlbnRQYWdlKSByZXR1cm4gZmFsc2U7XG4gICAgICBhd2FpdCB0aGlzLmN1cnJlbnRQYWdlLmV2YWx1YXRlKCcxJyk7IC8vIFF1aWNrIHZhbGlkYXRpb25cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXNldCB0aGUgaW5hY3Rpdml0eSBjbGVhbnVwIHRpbWVyICovXG4gIHByaXZhdGUgcmVzZXRDbGVhbnVwVGltZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2xlYW51cFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5jbGVhbnVwVGltZXIpO1xuICAgIHRoaXMubGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLmNsZWFudXBUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5kaXNwb3NlKCksIHRoaXMuSU5BQ1RJVklUWV9USU1FT1VUX01TKTtcbiAgfVxuXG4gIC8qKiBFeHBsaWNpdGx5IGRpc3Bvc2UgYnJvd3NlciBhbmQgY2FuY2VsIGNsZWFudXAgdGltZXIgKi9cbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5jbGVhbnVwVGltZXIpIGNsZWFyVGltZW91dCh0aGlzLmNsZWFudXBUaW1lcik7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLmJyb3dzZXJJbnN0YW5jZSAmJiB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jb25uZWN0ZWQoKSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2F3YWl0LXRoZW5hYmxlXG4gICAgICAgIGF3YWl0IHRoaXMuYnJvd3Nlckluc3RhbmNlLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgY2xvc2UgZXJyb3JzXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuYnJvd3Nlckluc3RhbmNlID0gbnVsbDtcbiAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBudWxsO1xuICAgICAgdGhpcy5sYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICAgICAgdGhpcy5yZXRyeUNvdW50ID0gMDtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2sgaWYgYnJvd3NlciBpcyBjb25uZWN0ZWQgKi9cbiAgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMuYnJvd3Nlckluc3RhbmNlICYmIHRoaXMuYnJvd3Nlckluc3RhbmNlLmNvbm5lY3RlZCgpKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGN1cnJlbnQgcGFnZSAocHVibGljIGFjY2Vzc29yKSAqL1xuICBnZXRDdXJyZW50UGFnZSgpOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlO1xuICB9XG5cbiAgLyoqIFNldCB0aGUgY3VycmVudCBwYWdlIChwdWJsaWMgc2V0dGVyKSAqL1xuICBzZXRDdXJyZW50UGFnZShwYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnRQYWdlID0gcGFnZTtcbiAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2UgZm9yIHRoaXMgbW9kdWxlXG5jb25zdCBicm93c2VyTWFuYWdlciA9IG5ldyBCcm93c2VyU2Vzc2lvbk1hbmFnZXIoKTtcblxuLyoqIEV4cG9ydCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBwbHVnaW4gdW5sb2FkIGxpZmVjeWNsZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFudXBCcm93c2VyU2Vzc2lvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIGJyb3dzZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcbn1cblxuLy8gQzUgRklYOiBQcm9wZXIgcGFyYW0gdHlwZXNcbmludGVyZmFjZSBCcm93c2VyT3BlblBhZ2VQYXJhbXMge1xuICB1cmw6IHN0cmluZztcbiAgc2NyZWVuc2hvdF9wYXRoPzogc3RyaW5nO1xuICB3YWl0X2Zvcl9zZWxlY3Rvcj86IHN0cmluZztcbiAgZnVsbF9wYWdlX3NjcmVlbnNob3Q/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgQnJvd3NlclNlc3Npb25Db250cm9sUGFyYW1zIHtcbiAgYWN0aW9ucz86IHVua25vd25bXTtcbiAgcmVhZF9wYWdlPzogYm9vbGVhbjtcbiAgZnVsbF9yZWFkPzogYm9vbGVhbjtcbiAgc2NyZWVuc2hvdF9wYXRoPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgUHJldmlld0h0bWxQYXJhbXMge1xuICBodG1sX2NvbnRlbnQ6IHN0cmluZztcbiAgZmlsZV9uYW1lPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgT3BlbkZpbGVQYXJhbXMge1xuICB0YXJnZXQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQnJvd3NlclRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcbiAgLy8gYnJvd3Nlcl9vcGVuX3BhZ2UgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdicm93c2VyX29wZW5fcGFnZScsXG4gICAgZGVzY3JpcHRpb246ICdPcGVuIGEgd2VicGFnZSBpbiBhIGhlYWRsZXNzIGJyb3dzZXIgKFB1cHBldGVlciksIHJlbmRlciBpdCBvbmNlLCBhbmQgcmV0dXJuIGNvbnRlbnQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1RoZSBVUkwgdG8gb3BlbicpLFxuICAgICAgc2NyZWVuc2hvdF9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1BhdGggdG8gc2F2ZSBhIHNjcmVlbnNob3QuJyksXG4gICAgICB3YWl0X2Zvcl9zZWxlY3Rvcjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDU1Mgc2VsZWN0b3IgdG8gd2FpdCBmb3IgYmVmb3JlIHJldHVybmluZy4nKSxcbiAgICAgIGZ1bGxfcGFnZV9zY3JlZW5zaG90OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdJZiB0cnVlLCBjYXB0dXJlcyB0aGUgZnVsbCBwYWdlIHdoZW4gdGFraW5nIGEgc2NyZWVuc2hvdC4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB1cmwsIHNjcmVlbnNob3RfcGF0aCwgd2FpdF9mb3Jfc2VsZWN0b3IsIGZ1bGxfcGFnZV9zY3JlZW5zaG90IH06IEJyb3dzZXJPcGVuUGFnZVBhcmFtcykgPT4ge1xuICAgICAgbGV0IGJyb3dzZXI6IFB1cHBldGVlci5Ccm93c2VyIHwgbnVsbCA9IG51bGw7XG4gICAgICBsZXQgcGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsID0gbnVsbDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYnJvd3NlciA9IGF3YWl0IGJyb3dzZXJNYW5hZ2VyLmdldEJyb3dzZXIoKTtcbiAgICAgICAgcGFnZSA9IGJyb3dzZXJNYW5hZ2VyLmdldEN1cnJlbnRQYWdlKCk7XG5cbiAgICAgICAgaWYgKCFwYWdlIHx8IChhd2FpdCBwYWdlLnVybCgpKSAhPT0gdXJsKSB7XG4gICAgICAgICAgLy8gSWYgbm8gY3VycmVudCBwYWdlIG9yIFVSTCBkb2Vzbid0IG1hdGNoLCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgICAgcGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xuICAgICAgICAgIGJyb3dzZXJNYW5hZ2VyLnNldEN1cnJlbnRQYWdlKHBhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgcGFnZS5nb3RvKHVybCwgeyB3YWl0VW50aWw6ICdkb21jb250ZW50bG9hZGVkJyB9KTtcblxuICAgICAgICBpZiAod2FpdF9mb3Jfc2VsZWN0b3IpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yU2VsZWN0b3Iod2FpdF9mb3Jfc2VsZWN0b3IsIHsgdGltZW91dDogNTAwMCB9KTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIElnbm9yZSB0aW1lb3V0LCBjb250aW51ZSB3aXRoIGNvbnRlbnQgZXh0cmFjdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0geyB1cmwsIG9wZW5lZDogdHJ1ZSB9O1xuXG4gICAgICAgIGlmIChzY3JlZW5zaG90X3BhdGgpIHtcbiAgICAgICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3QoeyBwYXRoOiBzY3JlZW5zaG90X3BhdGgsIGZ1bGxQYWdlOiBmdWxsX3BhZ2Vfc2NyZWVuc2hvdCB9KTtcbiAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RTYXZlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2Ugc3RyaW5nLWJhc2VkIGV2YWx1YXRlIHRvIGJ5cGFzcyBUUzI1ODQvVFMyMzA0ICdkb2N1bWVudCcgZXJyb3JzIGluIE5vZGUuanMgZW52aXJvbm1lbnRcbiAgICAgICAgY29uc3QgdGV4dENvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoYHJldHVybiBkb2N1bWVudC5ib2R5ID8gZG9jdW1lbnQuYm9keS5pbm5lclRleHQgOiAnJztgKTtcbiAgICAgICAgcmVzdWx0RGF0YS5wYWdlVGV4dCA9IHRleHRDb250ZW50LnN1YnN0cmluZygwLCAyMDAwKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gb3BlbiBwYWdlOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gTk9URTogV2UgZG9uJ3QgY2xvc2UgdGhlIGJyb3dzZXIgaGVyZSBiZWNhdXNlIHdlIHVzZSBhIHNpbmdsZXRvbiBwYXR0ZXJuLlxuICAgICAgICAvLyBUaGUgYnJvd3NlciBzdGF5cyBhbGl2ZSBmb3Igc3Vic2VxdWVudCByZXF1ZXN0cyB2aWEgYnJvd3Nlcl9zZXNzaW9uX2NvbnRyb2wuXG4gICAgICAgIC8vIFVzZSBicm93c2VyX3Nlc3Npb25fY2xvc2UgdG8gZXhwbGljaXRseSB0ZXJtaW5hdGUgaXQuXG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGJyb3dzZXJfc2Vzc2lvbl9jb250cm9sIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYnJvd3Nlcl9zZXNzaW9uX2NvbnRyb2wnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ29udHJvbCB0aGUgYWN0aXZlIHBlcnNpc3RlbnQgYnJvd3NlciBzZXNzaW9uLiBTdXBwb3J0cyBhY3Rpb25zLCBwYWdlIHJlYWRpbmcsIHNjcmVlbnNob3QgY2FwdHVyZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGFjdGlvbnM6IHouYXJyYXkoei5hbnkoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgc2NyaXB0ZWQgYnJvd3NlciBhY3Rpb25zIHRvIGV4ZWN1dGUuJyksXG4gICAgICByZWFkX3BhZ2U6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0lmIHRydWUsIHJldHVybnMgcGFnZSBtZXRhZGF0YS4nKSxcbiAgICAgIGZ1bGxfcmVhZDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnSWYgdHJ1ZSwgZm9yY2VzIGZ1bGwgcGFnZSB0ZXh0IG91dHB1dC4nKSxcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbCBzY3JlZW5zaG90IG91dHB1dCBwYXRoLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGFjdGlvbnMsIHJlYWRfcGFnZSwgZnVsbF9yZWFkLCBzY3JlZW5zaG90X3BhdGggfTogQnJvd3NlclNlc3Npb25Db250cm9sUGFyYW1zKSA9PiB7XG4gICAgICBsZXQgcGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsID0gbnVsbDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcGFnZSA9IGF3YWl0IGJyb3dzZXJNYW5hZ2VyLmdldFBhZ2UoKTtcblxuICAgICAgICBpZiAoYWN0aW9ucyAmJiBBcnJheS5pc0FycmF5KGFjdGlvbnMpKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBhY3Rpb24gb2YgYWN0aW9ucyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPltdKSB7XG4gICAgICAgICAgICBpZiAoYWN0aW9uLnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5jbGljayhhY3Rpb24uc2VsZWN0b3IgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09ICd0eXBlJykge1xuICAgICAgICAgICAgICBhd2FpdCBwYWdlLnR5cGUoYWN0aW9uLnNlbGVjdG9yIGFzIHN0cmluZywgYWN0aW9uLnRleHQgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09ICdnb3RvJykge1xuICAgICAgICAgICAgICBhd2FpdCBwYWdlLmdvdG8oYWN0aW9uLnVybCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gJ2V2YWx1YXRlJykge1xuICAgICAgICAgICAgICBhd2FpdCBwYWdlLmV2YWx1YXRlKGFjdGlvbi5zY3JpcHQgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHREYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgYWN0aW9uc0V4ZWN1dGVkOiBhY3Rpb25zPy5sZW5ndGggfHwgMCB9O1xuXG4gICAgICAgIGlmIChyZWFkX3BhZ2UgfHwgZnVsbF9yZWFkKSB7XG4gICAgICAgICAgLy8gVXNlIHN0cmluZy1iYXNlZCBldmFsdWF0ZSB0byBieXBhc3MgVFMyNTg0ICdkb2N1bWVudCcgZXJyb3JzIGluIE5vZGUuanMgZW52aXJvbm1lbnRcbiAgICAgICAgICBjb25zdCB0ZXh0OiBzdHJpbmcgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKGByZXR1cm4gZG9jdW1lbnQuYm9keSA/IGRvY3VtZW50LmJvZHkuaW5uZXJUZXh0IDogJyc7YCk7XG4gICAgICAgICAgcmVzdWx0RGF0YS5wYWdlVGV4dCA9IGZ1bGxfcmVhZCA/IHRleHQgOiB0ZXh0LnN1YnN0cmluZygwLCAxMDAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzY3JlZW5zaG90X3BhdGgpIHtcbiAgICAgICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3QoeyBwYXRoOiBzY3JlZW5zaG90X3BhdGggfSk7XG4gICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90U2F2ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0RGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQnJvd3NlciBjb250cm9sIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIFBhZ2Ugc3RheXMgYWxpdmUgZm9yIHNlc3Npb24gcmV1c2UuIEJyb3dzZXIgaXMgbWFuYWdlZCBieSBicm93c2VyX3Nlc3Npb25fY2xvc2UuXG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGJyb3dzZXJfc2Vzc2lvbl9jbG9zZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Jyb3dzZXJfc2Vzc2lvbl9jbG9zZScsXG4gICAgZGVzY3JpcHRpb246ICdDbG9zZSB0aGUgYWN0aXZlIHBlcnNpc3RlbnQgYnJvd3NlciBzZXNzaW9uLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGJyb3dzZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjbG9zZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGNsb3NlIGJyb3dzZXIgc2Vzc2lvbjogJHttZXNzYWdlfWAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIEVuc3VyZSBjbGVhbnVwIGV2ZW4gb24gZmFpbHVyZVxuICAgICAgICBhd2FpdCBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHByZXZpZXdfaHRtbCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3ByZXZpZXdfaHRtbCcsXG4gICAgZGVzY3JpcHRpb246IFwiUmVuZGVyIGFuZCBwcmV2aWV3IEhUTUwgY29udGVudCBpbiB0aGUgc3lzdGVtJ3MgZGVmYXVsdCBicm93c2VyLlwiLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGh0bWxfY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIEhUTUwgY29udGVudCB0byByZW5kZXInKSxcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ3ByZXZpZXcuaHRtbCcpLmRlc2NyaWJlKCdPcHRpb25hbCBmaWxlbmFtZSAoZGVmYXVsdDogcHJldmlldy5odG1sKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGh0bWxfY29udGVudCwgZmlsZV9uYW1lIH06IFByZXZpZXdIdG1sUGFyYW1zKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGVfbmFtZSB8fCAncHJldmlldy5odG1sJztcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oZ2V0V29ya2luZ0RpcigpLCBmaWxlTmFtZSk7XG5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgaHRtbF9jb250ZW50KTtcblxuICAgICAgICAvLyBPcGVuIGluIGRlZmF1bHQgYnJvd3NlciB1c2luZyBFUyBpbXBvcnRcbiAgICAgICAgY29uc3Qgb3Blbk1vZHVsZSA9IGF3YWl0IGltcG9ydCgnb3BlbicpO1xuICAgICAgICBhd2FpdCBvcGVuTW9kdWxlLmRlZmF1bHQoZmlsZVBhdGgpO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcHJldmlld2VkOiB0cnVlLCBmaWxlOiBmaWxlTmFtZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcHJldmlldyBIVE1MOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBvcGVuX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdvcGVuX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiBcIk9wZW4gYSBmaWxlIG9yIFVSTCBpbiB0aGUgc3lzdGVtJ3MgZGVmYXVsdCBhcHBsaWNhdGlvbi5cIixcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0YXJnZXQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0ZpbGUgcGF0aCBvciBVUkwnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0YXJnZXQgfTogT3BlbkZpbGVQYXJhbXMpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG9wZW5Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ29wZW4nKTtcbiAgICAgICAgYXdhaXQgb3Blbk1vZHVsZS5kZWZhdWx0KHRhcmdldCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgb3BlbmVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBvcGVuIGZpbGU6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgdmFsaWRhdGVTUUxRdWVyeSB9IGZyb20gJy4uL3NlY3VyaXR5LmpzJztcblxuLy8gTGF6eS1sb2FkIG5vZGU6c3FsaXRlIChOb2RlLmpzIDIzKykuIEdyYWNlZnVsIGZhbGxiYWNrIGZvciBvbGRlciBOb2RlIHZlcnNpb25zLlxubGV0IHNxbGl0ZU1vZHVsZTogdHlwZW9mIGltcG9ydCgnbm9kZTpzcWxpdGUnKSB8IG51bGwgPSBudWxsO1xubGV0IHNxbGl0ZUxvYWRFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNxbGl0ZSgpOiBQcm9taXNlPHR5cGVvZiBpbXBvcnQoJ25vZGU6c3FsaXRlJyk+IHtcbiAgaWYgKHNxbGl0ZU1vZHVsZSkgcmV0dXJuIHNxbGl0ZU1vZHVsZTtcbiAgaWYgKHNxbGl0ZUxvYWRFcnJvcikgdGhyb3cgbmV3IEVycm9yKHNxbGl0ZUxvYWRFcnJvcik7XG5cbiAgdHJ5IHtcbiAgICBzcWxpdGVNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ25vZGU6c3FsaXRlJyk7XG4gICAgcmV0dXJuIHNxbGl0ZU1vZHVsZTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgc3FsaXRlTG9hZEVycm9yID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBTUUxpdGUgaXMgbm90IGF2YWlsYWJsZSAobm9kZTpzcWxpdGUgcmVxdWlyZXMgTm9kZS5qcyAyMyspLiBgICtcbiAgICAgIGBPcmlnaW5hbCBlcnJvcjogJHtzcWxpdGVMb2FkRXJyb3J9LiBgICtcbiAgICAgIGBQbGVhc2UgZGlzYWJsZSBkYXRhYmFzZSBxdWVyaWVzIGluIHBsdWdpbiBzZXR0aW5ncyBvciB1cGdyYWRlIE5vZGUuYFxuICAgICk7XG4gIH1cbn1cblxuLyoqIFJlc2V0IHNxbGl0ZSBtb2R1bGUgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0U3FsaXRlQ2FjaGUoKTogdm9pZCB7XG4gIHNxbGl0ZU1vZHVsZSA9IG51bGw7XG4gIHNxbGl0ZUxvYWRFcnJvciA9IG51bGw7XG59XG5cbi8qKiBUeXBlZCBwYXJhbXMgaW50ZXJmYWNlICovXG5pbnRlcmZhY2UgUXVlcnlEYXRhYmFzZVBhcmFtcyB7XG4gIHF1ZXJ5OiBzdHJpbmc7XG4gIGRiX3BhdGg/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRhdGFiYXNlVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHF1ZXJ5X2RhdGFiYXNlIHRvb2wgXHUyMDE0IEM3IEZJWDogQWRkZWQgb3B0aW9uYWwgZGJfcGF0aCBwYXJhbWV0ZXJcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncXVlcnlfZGF0YWJhc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIHJlYWQtb25seSBTUUxpdGUgcXVlcmllcy4gRGVmYXVsdHMgdG8gaW4tbWVtb3J5IGRhdGFiYXNlOyBvcHRpb25hbGx5IHNwZWNpZnkgYSBmaWxlIHBhdGguJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU1FMIHF1ZXJ5IHN0cmluZyAocmVhZC1vbmx5IG9ubHkpJyksXG4gICAgICBkYl9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnOm1lbW9yeTonKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgU1FMaXRlIGRhdGFiYXNlIGZpbGUgKGRlZmF1bHQ6IDptZW1vcnk6KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBkYl9wYXRoIH06IFF1ZXJ5RGF0YWJhc2VQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFNlY3VyaXR5IGNoZWNrIC0gdXNlIHJvYnVzdCBTUUwgdmFsaWRhdGlvbiBpbnN0ZWFkIG9mIHNpbXBsZSByZWdleCBtYXRjaGluZ1xuICAgICAgICBjb25zdCB2YWxpZGF0ZWQgPSB2YWxpZGF0ZVNRTFF1ZXJ5KHF1ZXJ5KTtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZWQudmFsaWQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbnNhZmUgU1FMIHF1ZXJ5IGRldGVjdGVkOiAke3ZhbGlkYXRlZC5yZWFzb259YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGF6eS1sb2FkIG5vZGU6c3FsaXRlIHdpdGggZ3JhY2VmdWwgZmFsbGJhY2tcbiAgICAgICAgY29uc3QgeyBvcGVuIH0gPSBhd2FpdCBnZXRTcWxpdGUoKTtcbiAgICAgICAgY29uc3QgZGIgPSBvcGVuKGRiX3BhdGggfHwgJzptZW1vcnk6Jyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBzdG10ID0gZGIucHJlcGFyZShxdWVyeSk7XG4gICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHN0bXQuYWxsKCk7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBxdWVyeSwgcmVzdWx0cyB9IH07XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGF0YWJhc2UgcXVlcnkgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIH0gZnJvbSAnLi4vYmFja2dyb3VuZENvbW1hbmRzLmpzJztcbmltcG9ydCB7IHNhbml0aXplQ29tbWFuZCB9IGZyb20gJy4uL3NlY3VyaXR5LmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJ1bkJhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgY29tbWFuZDogc3RyaW5nOyB0aW1lb3V0X2hvdXJzOiBudW1iZXI7IG5hbWU6IHN0cmluZzsgfVxuaW50ZXJmYWNlIENoZWNrQmFja2dyb3VuZENvbW1hbmRQYXJhbXMgeyBpZDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQ2FuY2VsQmFja2dyb3VuZENvbW1hbmRQYXJhbXMgeyBpZDogc3RyaW5nOyB9XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJhY2tncm91bmRDb21tYW5kVG9vbHMoY29uZmlnOiBQbHVnaW5Db25maWcsIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcjogQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJ1bl9iYWNrZ3JvdW5kX2NvbW1hbmQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdydW5fYmFja2dyb3VuZF9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0IGEgbG9uZy1ydW5uaW5nIHByb2Nlc3MgaW4gdGhlIGJhY2tncm91bmQuIFRoZSBwcm9jZXNzIGlzIG5vdCBibG9ja2VkLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tbWFuZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNoZWxsIGNvbW1hbmQgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9ob3Vyczogei5udW1iZXIoKS5taW4oMC4xKS5tYXgoMTApLmRlc2NyaWJlKCdNQU5EQVRPUlk6IEhvdyBsb25nIHRoZSBwcm9jZXNzIGlzIGFsbG93ZWQgdG8gcnVuIGJlZm9yZSBiZWluZyBraWxsZWQuJyksXG4gICAgICBuYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdNQU5EQVRPUlk6IEEgc2hvcnQsIGRlc2NyaXB0aXZlIG5hbWUgZm9yIHRoZSBiYWNrZ3JvdW5kIHRhc2snKSxcbiAgICB9LFxuICAgIC8vIFNESyByZXF1aXJlcyBhc3luYyBpbXBsZW1lbnRhdGlvblxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21tYW5kLCB0aW1lb3V0X2hvdXJzLCBuYW1lIH06IFJ1bkJhY2tncm91bmRDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBTZWN1cml0eSBjaGVjayAtIHVzZSByb2J1c3Qgc2FuaXRpemF0aW9uIGluc3RlYWQgb2Ygc2ltcGxlIHN0cmluZyBtYXRjaGluZ1xuICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUNvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgIGlmICghc2FuaXRpemVkLnNhZmUpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbnNhZmUgY29tbWFuZCBkZXRlY3RlZDogJHtzYW5pdGl6ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgaWQgPSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIucmVnaXN0ZXIoY29tbWFuZCwgdGltZW91dF9ob3VycywgbmFtZSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaWQsIG5hbWUsIGNvbW1hbmQsIHRpbWVvdXRIb3VyczogdGltZW91dF9ob3VycyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjaGVja19iYWNrZ3JvdW5kX2NvbW1hbmQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjaGVja19iYWNrZ3JvdW5kX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2sgdGhlIHN0YXR1cywgc3Rkb3V0LCBhbmQgc3RkZXJyIG9mIGEgcnVubmluZyBvciBjb21wbGV0ZWQgYmFja2dyb3VuZCBjb21tYW5kLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBjb21tYW5kIGlkZW50aWZpZXInKSxcbiAgICB9LFxuICAgIC8vIFNESyByZXF1aXJlcyBhc3luYyBpbXBsZW1lbnRhdGlvblxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBpZCB9OiBDaGVja0JhY2tncm91bmRDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb21tYW5kID0gYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLmNoZWNrKGlkKTtcbiAgICAgICAgaWYgKCFjb21tYW5kKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29tbWFuZCBub3QgZm91bmQ6ICR7aWR9YCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGNvbW1hbmQgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNhbmNlbF9iYWNrZ3JvdW5kX2NvbW1hbmQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjYW5jZWxfYmFja2dyb3VuZF9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ0tpbGwgYSBydW5uaW5nIGJhY2tncm91bmQgY29tbWFuZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tbWFuZCBpZGVudGlmaWVyJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaWQgfTogQ2FuY2VsQmFja2dyb3VuZENvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNhbmNlbGxlZCA9IGJhY2tncm91bmRDb21tYW5kTWFuYWdlci5jYW5jZWwoaWQpO1xuICAgICAgICBpZiAoIWNhbmNlbGxlZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENhbm5vdCBjYW5jZWwgY29tbWFuZDogJHtpZH0gKG5vdCBmb3VuZCBvciBub3QgcnVubmluZylgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpZCwgY2FuY2VsbGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IHNhbml0aXplQ29tbWFuZCB9IGZyb20gJy4uL3NlY3VyaXR5LmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU2hhcmVkIFNwYXduIEhlbHBlciA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgU3Bhd25SZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICBkYXRhPzogeyBzdGRvdXQ6IHN0cmluZzsgc3RkZXJyOiBzdHJpbmcgfTtcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogU2FmZWx5IHNwYXduIGEgcHJvY2VzcyB3aXRoIHRpbWVvdXQsIGNhcHR1cmluZyBzdGRvdXQvc3RkZXJyLlxuICogRWxpbWluYXRlcyBjb2RlIGR1cGxpY2F0aW9uIGFjcm9zcyBleGVjdXRpb24gdG9vbHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhZmVTcGF3bihcbiAgZXhlOiBzdHJpbmcsXG4gIGFyZ3M6IHN0cmluZ1tdLFxuICB0aW1lb3V0TXM6IG51bWJlcixcbiAgaW5wdXQ/OiBzdHJpbmcsXG4gIHVzZVNoZWxsID0gZmFsc2Vcbik6IFByb21pc2U8U3Bhd25SZXN1bHQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgcHJvYyA9IHNwYXduKGV4ZSwgYXJncywge1xuICAgICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgJ3BpcGUnXSxcbiAgICAgIHRpbWVvdXQ6IHRpbWVvdXRNcyxcbiAgICAgIGN3ZDogZ2V0V29ya2luZ0RpcigpLCAvLyBFeGVjdXRlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICBzaGVsbDogdXNlU2hlbGwsIC8vIEVuYWJsZSBzaGVsbCBpbnRlcnByZXRhdGlvbiB3aGVuIHJlcXVlc3RlZFxuICAgIH0pO1xuXG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIGlmIChpbnB1dCkge1xuICAgICAgcHJvYy5zdGRpbj8ud3JpdGUoaW5wdXQpO1xuICAgICAgcHJvYy5zdGRpbj8uZW5kKCk7XG4gICAgfVxuXG4gICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwcm9jLmtpbGwoKTtcbiAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFeGVjdXRpb24gdGltZWQgb3V0JyB9KTtcbiAgICB9LCB0aW1lb3V0TXMpO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzdGRvdXQ6IHN0ZG91dC50cmltKCksIHN0ZGVycjogc3RkZXJyLnRyaW0oKSB9IH0pO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3Bhd24gZmFpbGVkOiAke2Vyci5tZXNzYWdlfWAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUnVuSmF2YVNjcmlwdFBhcmFtcyB7IGphdmFzY3JpcHQ6IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgUnVuUHl0aG9uUGFyYW1zIHsgcHl0aG9uOiBzdHJpbmc7IHRpbWVvdXRfc2Vjb25kcz86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEV4ZWN1dGVDb21tYW5kUGFyYW1zIHsgY29tbWFuZDogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXI7IGlucHV0Pzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUnVuSW5UZXJtaW5hbFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBFeGVjdXRpb24gVG9vbHMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRXhlY3V0aW9uVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJ1bl9qYXZhc2NyaXB0IHRvb2wgXHUyMDE0IFNBTkRCT1hFRCB3aXRoIGRlbm8gKGlmIGF2YWlsYWJsZSkgb3Igbm9kZSB3aXRoIHN0cmljdCByZXN0cmljdGlvbnNcbiAgLy8gUzUgRklYOiBFbmhhbmNlZCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gdG8gcHJldmVudCBldmFsL3JlcXVpcmUgYnlwYXNzZXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2phdmFzY3JpcHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIEphdmFTY3JpcHQgY29kZSBzbmlwcGV0IHVzaW5nIE5vZGUuanMgKHNhbmRib3hlZCkuIE5vIGV4dGVybmFsIG1vZHVsZSBpbXBvcnRzIGFsbG93ZWQuIFN0YW5kYXJkIGxpYnJhcnkgb25seS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGphdmFzY3JpcHQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBKYXZhU2NyaXB0IGNvZGUgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCA2MCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBqYXZhc2NyaXB0LCB0aW1lb3V0X3NlY29uZHMgfTogUnVuSmF2YVNjcmlwdFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gUm9idXN0IGRhbmdlcm91cyBwYXR0ZXJuIGRldGVjdGlvbiBcdTIwMTQgYmxvY2tzIGV2YWwsIHJlcXVpcmUsIGltcG9ydCwgZnMsIGNoaWxkX3Byb2Nlc3NcbiAgICAgICAgLy8gUzUgRklYOiBBZGRlZCBwYXR0ZXJucyBmb3IgY29tbW9uIGJ5cGFzcyB0ZWNobmlxdWVzXG4gICAgICAgIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICAgICAgIC9cXGJyZXF1aXJlXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrL2ksXG4gICAgICAgICAgL1xcYmZzXFwuL2ksXG4gICAgICAgICAgL1xcYmNoaWxkX3Byb2Nlc3NcXGIvaSxcbiAgICAgICAgICAvXFxiZXZhbFxccypcXCgvaSxcbiAgICAgICAgICAvXFxiZXhlY1xccypcXCgvaSxcbiAgICAgICAgICAvZ2xvYmFsVGhpc1xcLnJlcXVpcmUvaSxcbiAgICAgICAgICAvcHJvY2Vzc1xcLmV4aXQvaSxcbiAgICAgICAgICAvX19wcm90b19fL2ksXG4gICAgICAgICAgLy8gUzUgRklYOiBCeXBhc3MgcHJldmVudGlvbiBwYXR0ZXJuc1xuICAgICAgICAgIC9GdW5jdGlvblxccypcXCgvaSwgICAgICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uIGNvbnN0cnVjdG9yXG4gICAgICAgICAgL1N0cmluZ1xcLmZyb21DaGFyQ29kZVxccypcXCgvaSwgICAgICAgLy8uZnJvbUNoYXJDb2RlIGJ5cGFzc1xuICAgICAgICAgIC9cXGJpbXBvcnRcXHMqXFwoLipcXCkvaSwgICAgICAgICAgICAgICAvLyBEeW5hbWljIGltcG9ydFxuICAgICAgICAgIC9cXC5jb25zdHJ1Y3Rvci9pLCAgICAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3RvciBhY2Nlc3NcbiAgICAgICAgICAvcmVxdWlyZVxcLnJlc29sdmUvaSwgICAgICAgICAgICAgICAgLy8gcmVxdWlyZS5yZXNvbHZlIGJ5cGFzc1xuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBkYW5nZXJvdXNQYXR0ZXJucykge1xuICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QoamF2YXNjcmlwdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhbmdlcm91cyBjb2RlIGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA1KSAqIDEwMDApO1xuICAgICAgICBcbiAgICAgICAgLy8gVXNlIE5vZGUuanMgd2l0aCAtLXVuaGFuZGxlZC1yZWplY3Rpb25zPXRocm93IGZvciBzYWZldHlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKCdub2RlJywgWyctZScsIGphdmFzY3JpcHRdLCB0aW1lb3V0TXMpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmVycm9yIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmRhdGE/LnN0ZGVyciAmJiAhcmVzdWx0LmRhdGEuc3Rkb3V0KSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZGF0YS5zdGRlcnIgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgb3V0cHV0OiByZXN1bHQuZGF0YT8uc3Rkb3V0IHx8ICcnIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJ1bl9weXRob24gdG9vbCBcdTIwMTQgU0FOREJPWEVEIHdpdGggc3RyaWN0IGltcG9ydCByZXN0cmljdGlvbnNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX3B5dGhvbicsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gUHl0aG9uIGNvZGUgc25pcHBldCAoc2FuZGJveGVkLCBubyBleHRlcm5hbCBtb2R1bGVzKS4gU3RhbmRhcmQgbGlicmFyeSBvbmx5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcHl0aG9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgUHl0aG9uIGNvZGUgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCA2MCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBweXRob24sIHRpbWVvdXRfc2Vjb25kcyB9OiBSdW5QeXRob25QYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFJvYnVzdCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gXHUyMDE0IGJsb2NrcyBvcywgc3VicHJvY2Vzcywgc2h1dGlsLCBldmFsLCBleGVjXG4gICAgICAgIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrb3NcXGIvaSxcbiAgICAgICAgICAvXFxiZnJvbVxccytvc1xccytpbXBvcnRcXGIvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK3N1YnByb2Nlc3NcXGIvaSxcbiAgICAgICAgICAvXFxiZnJvbVxccytzdWJwcm9jZXNzXFxzK2ltcG9ydFxcYi9pLFxuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrc2h1dGlsXFxiL2ksXG4gICAgICAgICAgL1xcYl9faW1wb3J0X19cXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV2YWxcXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV4ZWNcXHMqXFwoL2ksXG4gICAgICAgICAgL29zXFwuc3lzdGVtL2ksXG4gICAgICAgICAgL29zXFwucG9wZW4vaSxcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICAgICAgICBpZiAocGF0dGVybi50ZXN0KHB5dGhvbikpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhbmdlcm91cyBQeXRob24gaW1wb3J0IGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA1KSAqIDEwMDApO1xuICAgICAgICBcbiAgICAgICAgLy8gVHJ5IHB5dGhvbjMgZmlyc3QsIGZhbGwgYmFjayB0byBweXRob25cbiAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bigncHl0aG9uMycsIFsnLWMnLCBweXRob25dLCB0aW1lb3V0TXMpO1xuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5lcnJvcj8uaW5jbHVkZXMoJ25vdCBmb3VuZCcpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKCdweXRob24nLCBbJy1jJywgcHl0aG9uXSwgdGltZW91dE1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5kYXRhPy5zdGRlcnIgJiYgIXJlc3VsdC5kYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmRhdGEuc3RkZXJyIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG91dHB1dDogcmVzdWx0LmRhdGE/LnN0ZG91dCB8fCAnJyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBleGVjdXRlX2NvbW1hbmQgdG9vbCBcdTIwMTQgU0FGRSBWRVJTSU9OIHdpdGggc2hlbGw6dHJ1ZSBzdXBwb3J0ICYgaW1wcm92ZWQgV2luZG93cyBoYW5kbGluZ1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdleGVjdXRlX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRXhlY3V0ZSBhIGNvbW1hbmQgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFN1cHBvcnRzIGZ1bGwgc2hlbGwgZmVhdHVyZXMgKHBpcGVzLCByZWRpcmVjdHMsIGVudiB2YXJzKS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfc2Vjb25kczogei5udW1iZXIoKS5taW4oMSkubWF4KDMwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDYwKS5kZXNjcmliZSgnVGltZW91dCBpbiBzZWNvbmRzIChtYXggMzAwKScpLFxuICAgICAgaW5wdXQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIklucHV0IHRleHQgdG8gcGlwZSB0byB0aGUgY29tbWFuZCdzIHN0ZGluLlwiKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21tYW5kLCB0aW1lb3V0X3NlY29uZHMsIGlucHV0IH06IEV4ZWN1dGVDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUNvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgIGlmICghc2FuaXRpemVkLnNhZmUpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbnNhZmUgY29tbWFuZCBkZXRlY3RlZDogJHtzYW5pdGl6ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRpbWVvdXRNcyA9ICgodGltZW91dF9zZWNvbmRzIHx8IDYwKSAqIDEwMDApO1xuICAgICAgICBcbiAgICAgICAgLy8gVXNlIHNoZWxsOnRydWUgZm9yIGZ1bGwgc2hlbGwgaW50ZXJwcmV0YXRpb24gKHBpcGVzLCByZWRpcmVjdHMsIGVudiB2YXJzKVxuICAgICAgICAvLyBTZWN1cml0eSBpcyBtYWludGFpbmVkIHRocm91Z2ggc2FuaXRpemVDb21tYW5kKCkgd2hpY2ggYmxvY2tzIGRhbmdlcm91cyBwYXR0ZXJuc1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24oY29tbWFuZCwgW10sIHRpbWVvdXRNcywgaW5wdXQsIHRydWUpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmVycm9yIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm4gY29tYmluZWQgb3V0cHV0IGZvciBiZXR0ZXIgZGVidWdnaW5nXG4gICAgICAgIGNvbnN0IGZ1bGxPdXRwdXQgPSBbcmVzdWx0LmRhdGE/LnN0ZG91dCwgcmVzdWx0LmRhdGE/LnN0ZGVycl0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLCBcbiAgICAgICAgICBkYXRhOiB7IFxuICAgICAgICAgICAgc3Rkb3V0OiByZXN1bHQuZGF0YT8uc3Rkb3V0IHx8ICcnLCBcbiAgICAgICAgICAgIHN0ZGVycjogcmVzdWx0LmRhdGE/LnN0ZGVyciB8fCAnJyxcbiAgICAgICAgICAgIG91dHB1dDogZnVsbE91dHB1dCB8fCAnKE5vIG91dHB1dCknXG4gICAgICAgICAgfSBcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEV4ZWN1dGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJ1bl9pbl90ZXJtaW5hbCB0b29sIFx1MjAxNCBTQUZFIFZFUlNJT04gd2l0aG91dCBzaGVsbDp0cnVlXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9pbl90ZXJtaW5hbCcsXG4gICAgZGVzY3JpcHRpb246ICdMYXVuY2ggYSBjb21tYW5kIGluIGEgbmV3LCBzZXBhcmF0ZSBpbnRlcmFjdGl2ZSB0ZXJtaW5hbCB3aW5kb3cuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2hlbGwgY29tbWFuZCB0byBleGVjdXRlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCB9OiBSdW5JblRlcm1pbmFsUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUNvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgIGlmICghc2FuaXRpemVkLnNhZmUpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbnNhZmUgY29tbWFuZCBkZXRlY3RlZDogJHtzYW5pdGl6ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG4gICAgICAgIFxuICAgICAgICBpZiAoaXNXaW5kb3dzKSB7XG4gICAgICAgICAgc3Bhd24oJ2NtZC5leGUnLCBbJy9jJywgJ3N0YXJ0JywgJ0NvbW1hbmQgUHJvbXB0JywgJy9rJywgY29tbWFuZF0sIHsgXG4gICAgICAgICAgICBkZXRhY2hlZDogdHJ1ZSwgXG4gICAgICAgICAgICBzdGRpbzogJ2lnbm9yZScgXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgdGVybWluYWxzID0gWyd4dGVybScsICdnbm9tZS10ZXJtaW5hbCcsICdrb25zb2xlJywgJ3hmY2U0LXRlcm1pbmFsJ107XG4gICAgICAgICAgbGV0IGxhdW5jaGVkID0gZmFsc2U7XG4gICAgICAgICAgXG4gICAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1pbmFscykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgc3Bhd24odGVybSwgWyctZScsIGNvbW1hbmRdLCB7IGRldGFjaGVkOiB0cnVlLCBzdGRpbzogJ2lnbm9yZScgfSk7XG4gICAgICAgICAgICAgIGxhdW5jaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGlmICghbGF1bmNoZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIHN1aXRhYmxlIHRlcm1pbmFsIGVtdWxhdG9yIGZvdW5kLiBJbnN0YWxsIHh0ZXJtIG9yIGdub21lLXRlcm1pbmFsLicgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGxhdW5jaGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBvcGVuIHRlcm1pbmFsOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG5cbi8qKlxuICogU2FmZWx5IHBhcnNlIGEgc2hlbGwgY29tbWFuZCBpbnRvIGV4ZWN1dGFibGUgYW5kIGFyZ3VtZW50cy5cbiAqIEhhbmRsZXMgYmFzaWMgcXVvdGluZyBidXQgYXZvaWRzIHNoZWxsIGludGVycHJldGF0aW9uIGVudGlyZWx5LlxuICovXG5mdW5jdGlvbiBwYXJzZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogeyBleGU6IHN0cmluZzsgYXJnczogc3RyaW5nW10gfSB7XG4gIGNvbnN0IHRyaW1tZWQgPSBjb21tYW5kLnRyaW0oKTtcbiAgXG4gIGlmICghdHJpbW1lZCkge1xuICAgIHJldHVybiB7IGV4ZTogJycsIGFyZ3M6IFtdIH07XG4gIH1cblxuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgbGV0IGN1cnJlbnQgPSAnJztcbiAgbGV0IGluUXVvdGU6ICdcIicgfCBcIidcIiB8IG51bGwgPSBudWxsO1xuICBcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmltbWVkLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2hhciA9IHRyaW1tZWRbaV07XG4gICAgXG4gICAgaWYgKGluUXVvdGUpIHtcbiAgICAgIGlmIChjaGFyID09PSBpblF1b3RlKSB7XG4gICAgICAgIGluUXVvdGUgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudCArPSBjaGFyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gJ1wiJyB8fCBjaGFyID09PSBcIidcIikge1xuICAgICAgaW5RdW90ZSA9IGNoYXI7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSAnICcpIHtcbiAgICAgIGlmIChjdXJyZW50KSB7XG4gICAgICAgIHBhcnRzLnB1c2goY3VycmVudCk7XG4gICAgICAgIGN1cnJlbnQgPSAnJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudCArPSBjaGFyO1xuICAgIH1cbiAgfVxuICBcbiAgaWYgKGN1cnJlbnQpIHtcbiAgICBwYXJ0cy5wdXNoKGN1cnJlbnQpO1xuICB9XG5cbiAgY29uc3QgZXhlID0gcGFydHNbMF0gfHwgJyc7XG4gIGNvbnN0IGFyZ3MgPSBwYXJ0cy5zbGljZSgxKTtcbiAgXG4gIHJldHVybiB7IGV4ZSwgYXJncyB9O1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSAnLi4vc3RhdGVNYW5hZ2VyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIE5vdGlmeU9wdGlvbnMge1xuICB0aXRsZT86IHN0cmluZztcbiAgbXNnPzogc3RyaW5nO1xuICBzb3VuZD86IGJvb2xlYW4gfCBzdHJpbmc7XG4gIGljb24/OiBzdHJpbmc7XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbnR5cGUgU2F2ZU1lbW9yeVBhcmFtcyA9IHsgZmFjdDogc3RyaW5nOyB9O1xudHlwZSBSZWFkQ2xpcGJvYXJkUGFyYW1zID0gUmVjb3JkPHN0cmluZywgbmV2ZXI+O1xudHlwZSBXcml0ZUNsaXBib2FyZFBhcmFtcyA9IHsgY29udGVudDogc3RyaW5nOyB9O1xudHlwZSBTZW5kTm90aWZpY2F0aW9uUGFyYW1zID0geyB0aXRsZTogc3RyaW5nOyBtZXNzYWdlOiBzdHJpbmc7IGljb24/OiBzdHJpbmc7IH07XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbi8qKlxuICogQ3Jvc3MtcGxhdGZvcm0gY2xpcGJvYXJkIG9wZXJhdGlvbnMgdXNpbmcgc3lzdGVtIGNvbW1hbmRzLlxuICovXG5cbi8vIFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nIGZvciBzaGVsbCBpbmplY3Rpb24gcHJldmVudGlvblxuZnVuY3Rpb24gZXNjYXBlRm9yUG93ZXJTaGVsbChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBFc2NhcGUgZG91YmxlIHF1b3RlcyBhbmQgZG9sbGFyIHNpZ25zICh3aGljaCB0cmlnZ2VyIHZhcmlhYmxlIGV4cGFuc2lvbiBpbiBQUylcbiAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcJC9nLCAnXFxcXCQnKTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlRm9yQmFzaChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBFc2NhcGUgc2luZ2xlIHF1b3RlcyBieSBlbmRpbmcgdGhlIHF1b3RlLCBhZGRpbmcgZXNjYXBlZCBxdW90ZSwgcmUtb3BlbmluZyBxdW90ZVxuICByZXR1cm4gY29udGVudC5yZXBsYWNlKC8nL2csIFwiJ1xcXFwnJ1wiKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVhZENsaXBib2FyZCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gIFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBjbWQ6IHN0cmluZztcbiAgICBsZXQgYXJnczogc3RyaW5nW107XG4gICAgXG4gICAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgICAgY2FzZSAnd2luMzInOlxuICAgICAgICAvLyBXaW5kb3dzIFBvd2VyU2hlbGxcbiAgICAgICAgY21kID0gJ3Bvd2Vyc2hlbGwuZXhlJztcbiAgICAgICAgYXJncyA9IFsnLU5vUHJvZmlsZScsICctQ29tbWFuZCcsICdbQ29uc29sZV06Ok91dHB1dEVuY29kaW5nID0gW1N5c3RlbS5UZXh0LkVuY29kaW5nXTo6VVRGODsgR2V0LUNsaXBib2FyZCAtUmF3J107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGFyd2luJzpcbiAgICAgICAgLy8gbWFjT1MgcGJwYXN0ZVxuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCAncGJwYXN0ZSddO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIExpbnV4IHhjbGlwIG9yIHhzZWxcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgJyh4Y2xpcCAtc2VsZWN0aW9uIGNsaXBib2FyZCAtbyAyPi9kZXYvbnVsbCB8fCB4c2VsIC0tY2xpcGJvYXJkIC0tb3V0cHV0IDI+L2Rldi9udWxsKSB8IHRyIC1kIFxcJ1xcXFwwXFwnJ107XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHByb2MgPSBzcGF3bihjbWQsIGFyZ3MpO1xuICAgIFxuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICBwcm9jLnN0ZG91dD8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRvdXQgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Nsb3NlJywgKGNvZGUpID0+IHtcbiAgICAgIGlmIChjb2RlID09PSAwICYmIHN0ZG91dC50cmltKCkpIHtcbiAgICAgICAgcmVzb2x2ZShzdGRvdXQudHJpbSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYENsaXBib2FyZCByZWFkIGZhaWxlZCAoZXhpdCBjb2RlICR7Y29kZX0pOiAke3N0ZGVyciB8fCAnTm8gY2xpcGJvYXJkIGNvbnRlbnQnfWApKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICBcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgc2Vjb25kc1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcHJvYy5raWxsKCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdDbGlwYm9hcmQgcmVhZCB0aW1lZCBvdXQnKSk7XG4gICAgfSwgNTAwMCk7XG4gIH0pO1xufVxuXG4vLyBTNiBGSVg6IFByb3BlciBlc2NhcGluZyB0byBwcmV2ZW50IHNoZWxsIGluamVjdGlvbiBpbiBjbGlwYm9hcmQgd3JpdGVcbmFzeW5jIGZ1bmN0aW9uIHdyaXRlQ2xpcGJvYXJkKGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gIFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBjbWQ6IHN0cmluZztcbiAgICBsZXQgYXJnczogc3RyaW5nW107XG4gICAgXG4gICAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgICAgY2FzZSAnd2luMzInOlxuICAgICAgICAvLyBXaW5kb3dzIFBvd2VyU2hlbGwgd2l0aCBTZXQtQ2xpcGJvYXJkIFx1MjAxNCBTNiBGSVg6IFByb3BlciBlc2NhcGluZ1xuICAgICAgICBjb25zdCBlc2NhcGVkQ29udGVudCA9IGVzY2FwZUZvclBvd2VyU2hlbGwoY29udGVudCk7XG4gICAgICAgIGNtZCA9ICdwb3dlcnNoZWxsLmV4ZSc7XG4gICAgICAgIGFyZ3MgPSBbJy1Ob1Byb2ZpbGUnLCAnLUNvbW1hbmQnLCBgW0NvbnNvbGVdOjpPdXRwdXRFbmNvZGluZyA9IFtTeXN0ZW0uVGV4dC5FbmNvZGluZ106OlVURjg7IFwiJHtlc2NhcGVkQ29udGVudH1cIiB8IFNldC1DbGlwYm9hcmRgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUyBwYmNvcHkgXHUyMDE0IFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nXG4gICAgICAgIGNvbnN0IGVzY2FwZWRCYXNoID0gZXNjYXBlRm9yQmFzaChjb250ZW50KTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYGVjaG8gLW4gJyR7ZXNjYXBlZEJhc2h9JyB8IHBiY29weWBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIExpbnV4IHhjbGlwIG9yIHhzZWwgXHUyMDE0IFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nXG4gICAgICAgIGNvbnN0IGVzY2FwZWRMaW51eCA9IGVzY2FwZUZvckJhc2goY29udGVudCk7XG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsIGBlY2hvIC1uICcke2VzY2FwZWRMaW51eH0nIHwgKHhjbGlwIC1zZWxlY3Rpb24gY2xpcGJvYXJkIDI+L2Rldi9udWxsIHx8IHhzZWwgLS1jbGlwYm9hcmQgLS1pbnB1dCAyPi9kZXYvbnVsbClgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvYyA9IHNwYXduKGNtZCwgYXJncyk7XG4gICAgXG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Nsb3NlJywgKGNvZGUpID0+IHtcbiAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYENsaXBib2FyZCB3cml0ZSBmYWlsZWQgKGV4aXQgY29kZSAke2NvZGV9KTogJHtzdGRlcnJ9YCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuICAgIFxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBzZWNvbmRzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwcm9jLmtpbGwoKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NsaXBib2FyZCB3cml0ZSB0aW1lZCBvdXQnKSk7XG4gICAgfSwgNTAwMCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZpbmQgTE0gU3R1ZGlvIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgYWNyb3NzIHBsYXRmb3Jtcy5cbiAqL1xuZnVuY3Rpb24gZmluZExNU3R1ZGlvSG9tZSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgLy8gQ29tbW9uIHBhdGhzIHRvIGNoZWNrXG4gIGNvbnN0IGNhbmRpZGF0ZXM6IHN0cmluZ1tdID0gW107XG4gIFxuICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgY2FzZSAnd2luMzInOlxuICAgICAgY2FuZGlkYXRlcy5wdXNoKFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuQVBQREFUQSB8fCAnJywgJ2xtLXN0dWRpbycpLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuTE9DQUxBUFBEQVRBIHx8ICcnLCAnUHJvZ3JhbXMnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5QUk9HUkFNRklMRVMgfHwgJycsICdMTSBTdHVkaW8nKSxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52WydQUk9HUkFNREFUQSddIHx8ICcnLCAnTE0gU3R1ZGlvJylcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgY2FuZGlkYXRlcy5wdXNoKFxuICAgICAgICBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnTGlicmFyeScsICdBcHBsaWNhdGlvbiBTdXBwb3J0JywgJ2xtLXN0dWRpbycpLFxuICAgICAgICAnL0FwcGxpY2F0aW9ucy9MTSBTdHVkaW8uYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhcidcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OiAvLyBMaW51eFxuICAgICAgY2FuZGlkYXRlcy5wdXNoKFxuICAgICAgICBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmxvY2FsJywgJ3NoYXJlJywgJ2xtLXN0dWRpbycpLFxuICAgICAgICAnL29wdC9sbS1zdHVkaW8nLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuSE9NRSB8fCAnJywgJy5sbS1zdHVkaW8nKVxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgXG4gIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoY2FuZGlkYXRlKSkge1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gU2tpcCBpbmFjY2Vzc2libGUgcGF0aHNcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJVdGlsaXR5VG9vbHMoY29uZmlnOiBQbHVnaW5Db25maWcsIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyLCBnZXRFbmFibGVkVG9vbHM/OiAoKSA9PiBzdHJpbmdbXSk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBzYXZlX21lbW9yeSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NhdmVfbWVtb3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ1NhdmUgYSBzcGVjaWZpYyBwaWVjZSBvZiBpbmZvcm1hdGlvbiBvciBmYWN0IHRvIGxvbmctdGVybSBtZW1vcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmYWN0OiB6LnN0cmluZygpLm1pbigxKS5kZXNjcmliZSgnVGhlIHNwZWNpZmljIGZhY3Qgb3IgcGllY2Ugb2YgaW5mb3JtYXRpb24gdG8gcmVtZW1iZXIuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmFjdCB9OiBTYXZlTWVtb3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBzdGF0ZU1hbmFnZXIuc2V0KGBtZW1vcnlfJHtEYXRlLm5vdygpfWAsIGZhY3QpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNhdmVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9zeXN0ZW1faW5mbyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9zeXN0ZW1faW5mbycsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHN5c3RlbSAoT1MsIENQVSwgTWVtb3J5KS4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcGxhdGZvcm06IG9zLnBsYXRmb3JtKCksXG4gICAgICAgICAgICBhcmNoOiBvcy5hcmNoKCksXG4gICAgICAgICAgICBjcHVzOiBvcy5jcHVzKCkubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxNZW1vcnk6IG9zLnRvdGFsbWVtKCksXG4gICAgICAgICAgICBmcmVlTWVtb3J5OiBvcy5mcmVlbWVtKCksXG4gICAgICAgICAgICBob3N0bmFtZTogb3MuaG9zdG5hbWUoKSxcbiAgICAgICAgICAgIHJlbGVhc2U6IG9zLnJlbGVhc2UoKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGdldCBzeXN0ZW0gaW5mbzogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVhZF9jbGlwYm9hcmQgdG9vbCAtIElNUExFTUVOVEVEXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlYWRfY2xpcGJvYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlYWQgdGV4dCBjb250ZW50IGZyb20gdGhlIHN5c3RlbSBjbGlwYm9hcmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKF9wYXJhbXM6IFJlYWRDbGlwYm9hcmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXMgKGVtcHR5IG9iamVjdClcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkQ2xpcGJvYXJkKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29udGVudCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyB3cml0ZV9jbGlwYm9hcmQgdG9vbCAtIElNUExFTUVOVEVEXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3dyaXRlX2NsaXBib2FyZCcsXG4gICAgZGVzY3JpcHRpb246ICdXcml0ZSB0ZXh0IGNvbnRlbnQgdG8gdGhlIHN5c3RlbSBjbGlwYm9hcmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCBjb250ZW50IHRvIHdyaXRlIHRvIGNsaXBib2FyZCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbnRlbnQgfTogV3JpdGVDbGlwYm9hcmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHdyaXRlQ2xpcGJvYXJkKGNvbnRlbnQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHdyaXR0ZW46IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gc2VuZF9ub3RpZmljYXRpb24gdG9vbCAtIElNUExFTUVOVEVEIHVzaW5nIG5vZGUtbm90aWZpZXJcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2VuZF9ub3RpZmljYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VuZCBhIHN5c3RlbSBub3RpZmljYXRpb24gdG8gdGhlIHVzZXIuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTm90aWZpY2F0aW9uIHRpdGxlJyksXG4gICAgICBtZXNzYWdlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOb3RpZmljYXRpb24gbWVzc2FnZScpLFxuICAgICAgaWNvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbCBjdXN0b20gaWNvbiBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGl0bGUsIG1lc3NhZ2UsIGljb24gfTogU2VuZE5vdGlmaWNhdGlvblBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgIFxuICAgICAgICBjb25zdCBub3RpZmllck1vZHVsZSA9IGF3YWl0IGltcG9ydCgnbm9kZS1ub3RpZmllcicpO1xuICAgICAgICAgXG4gICAgICAgIGNvbnN0IG5vdGlmaWVyID0gbm90aWZpZXJNb2R1bGUuZGVmYXVsdCB8fCBub3RpZmllck1vZHVsZTtcblxuICAgICAgICBjb25zdCBvcHRpb25zOiBOb3RpZnlPcHRpb25zID0ge1xuICAgICAgICAgIHRpdGxlOiB0aXRsZSB8fCAnQUkgVG9vbGJveCcsXG4gICAgICAgICAgbXNnOiBtZXNzYWdlIHx8ICcnLFxuICAgICAgICAgIHNvdW5kOiB0cnVlLCAvLyBJbmNsdWRlIHNvdW5kIG9uIG1hY09TXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGljb24pIHtcbiAgICAgICAgICBvcHRpb25zLmljb24gPSBpY29uO1xuICAgICAgICB9XG5cbiAgICAgICAgbm90aWZpZXIob3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzZW50OiB0cnVlLCB0aXRsZSwgbWVzc2FnZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gc2VuZCBub3RpZmljYXRpb246ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGZpbmRMTVN0dWRpb0hvbWUgdG9vbCAtIElNUExFTUVOVEVEXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ZpbmRMTVN0dWRpb0hvbWUnLFxuICAgIGRlc2NyaXB0aW9uOiAnTG9jYXRlIExNIFN0dWRpbyBpbnN0YWxsYXRpb24gZGlyZWN0b3J5IGFjcm9zcyBwbGF0Zm9ybXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaG9tZURpciA9IGZpbmRMTVN0dWRpb0hvbWUoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChob21lRGlyKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIGZvdW5kOiB0cnVlLFxuICAgICAgICAgICAgICBwYXRoOiBob21lRGlyLFxuICAgICAgICAgICAgICBwbGF0Zm9ybTogb3MucGxhdGZvcm0oKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBQcm92aWRlIGNvbW1vbiBwYXRocyBmb3IgbWFudWFsIHJlZmVyZW5jZVxuICAgICAgICAgIGNvbnN0IGNvbW1vblBhdGhzID0gW1xuICAgICAgICAgICAgJ1dpbmRvd3M6ICVBUFBEQVRBJVxcXFxsbS1zdHVkaW8nLFxuICAgICAgICAgICAgJ21hY09TOiB+L0xpYnJhcnkvQXBwbGljYXRpb24gU3VwcG9ydC9sbS1zdHVkaW8nLFxuICAgICAgICAgICAgJ0xpbnV4OiB+Ly5sb2NhbC9zaGFyZS9sbS1zdHVkaW8nXG4gICAgICAgICAgXS5qb2luKCdcXG4nKTtcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBgTE0gU3R1ZGlvIGhvbWUgZGlyZWN0b3J5IG5vdCBmb3VuZC5cXG5cXG5Db21tb24gcGF0aHM6XFxuJHtjb21tb25QYXRoc31gLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBmaW5kIExNIFN0dWRpbyBob21lOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfZW5hYmxlZF90b29scyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9lbmFibGVkX3Rvb2xzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBsaXN0IG9mIGN1cnJlbnRseSBlbmFibGVkIHRvb2xzIGJhc2VkIG9uIGNvbmZpZ3VyYXRpb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdldEVuYWJsZWRUb29scykge1xuICAgICAgICAgIGNvbnN0IHRvb2xOYW1lcyA9IGdldEVuYWJsZWRUb29scygpO1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdG9vbENvdW50OiB0b29sTmFtZXMubGVuZ3RoLCB0b29sczogdG9vbE5hbWVzIH0gfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZWdpc3RyeSBhY2Nlc3Mgbm90IGF2YWlsYWJsZScgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGdldCBlbmFibGVkIHRvb2xzOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ1VSUkVOVCBXT1JLSU5HIERJUkVDVE9SWSBUT09MID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxuICogVGhpcyBhbGxvd3MgdGhlIExMTSB0byBrbm93IHdoZXJlIHJlbGF0aXZlIHBhdGhzIHdpbGwgYmUgcmVzb2x2ZWQuXG4gKi9cbnR5cGUgR2V0Q3VycmVudFdvcmtpbmdEaXJlY3RvcnlQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckdldEN1cnJlbnRXb3JraW5nRGlyZWN0b3J5VG9vbCgpOiBUb29sW10ge1xuICByZXR1cm4gW1xuICAgIHRvb2woe1xuICAgICAgbmFtZTogJ2dldF9jdXJyZW50X3dvcmtpbmdfZGlyZWN0b3J5JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnR2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBVc2UgdGhpcyBiZWZvcmUgZ2VuZXJhdGluZyBmaWxlIG9wZXJhdGlvbnMgd2l0aCByZWxhdGl2ZSBwYXRocyB0byBlbnN1cmUgeW91IGtub3cgd2hlcmUgZmlsZXMgd2lsbCBiZSBjcmVhdGVkL21vZGlmaWVkLicsXG4gICAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIEltcG9ydCBoZXJlIHRvIGF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY3lcbiAgICAgICAgY29uc3QgeyBnZXRXb3JraW5nRGlyIH0gPSByZXF1aXJlKCcuLi93b3JraW5nRGlyLmpzJyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBjdXJyZW50X3dvcmtpbmdfZGlyZWN0b3J5OiBnZXRXb3JraW5nRGlyKClcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH0pLFxuICBdO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgSW1hZ2VUb1RleHRQYXJhbXMge1xuICBpbWFnZVBhdGg6IHN0cmluZztcbiAgbGFuZ3VhZ2U/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBEZXNjcmliZUltYWdlUGFyYW1zIHtcbiAgaW1hZ2VQYXRoOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBTY3JlZW5zaG90RGVza3RvcFBhcmFtcyB7XG4gIG91dHB1dFBhdGg/OiBzdHJpbmc7XG4gIGZvcm1hdD86ICdwbmcnIHwgJ2pwZWcnO1xuICBxdWFsaXR5PzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgQ29tcGFyZUltYWdlc1BhcmFtcyB7XG4gIGltYWdlMVBhdGg6IHN0cmluZztcbiAgaW1hZ2UyUGF0aDogc3RyaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBIZWxwZXIgRnVuY3Rpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbi8qKiBWYWxpZGF0ZSBpbWFnZSBmaWxlIGV4aXN0cyBhbmQgaXMgd2l0aGluIHNpemUgbGltaXRzICovXG5mdW5jdGlvbiB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZVBhdGg6IHN0cmluZywgbWF4U2l6ZUJ5dGVzOiBudW1iZXIgPSA1MCAqIDEwMjQgKiAxMDI0KToge1xuICB2YWxpZDogYm9vbGVhbjtcbiAgZXJyb3I/OiBzdHJpbmc7XG59IHtcbiAgLy8gQ2hlY2sgaWYgcGF0aCBleGlzdHNcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGltYWdlUGF0aCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgSW1hZ2UgZmlsZSBub3QgZm91bmQ6ICR7aW1hZ2VQYXRofWAgfTtcbiAgfVxuXG4gIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhpbWFnZVBhdGgpO1xuICBcbiAgLy8gVmVyaWZ5IGl0J3MgYSBmaWxlIChub3QgZGlyZWN0b3J5KVxuICBpZiAoIXN0YXQuaXNGaWxlKCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUGF0aCBpcyBub3QgYSBmaWxlOiAke2ltYWdlUGF0aH1gIH07XG4gIH1cblxuICAvLyBDaGVjayBzaXplIGxpbWl0XG4gIGlmIChzdGF0LnNpemUgPiBtYXhTaXplQnl0ZXMpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgSW1hZ2UgZXhjZWVkcyBtYXhpbXVtIHNpemUgb2YgJHsobWF4U2l6ZUJ5dGVzIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMCl9TUJgIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBleHRlbnNpb25cbiAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGltYWdlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgdmFsaWRFeHRlbnNpb25zID0gWycucG5nJywgJy5qcGcnLCAnLmpwZWcnLCAnLmJtcCcsICcuZ2lmJywgJy50aWZmJywgJy53ZWJwJ107XG4gIGlmICghdmFsaWRFeHRlbnNpb25zLmluY2x1ZGVzKGV4dCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgaW1hZ2UgZm9ybWF0OiAke2V4dH0uIFN1cHBvcnRlZDogJHt2YWxpZEV4dGVuc2lvbnMuam9pbignLCAnKX1gIH07XG4gIH1cblxuICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuXG4vKiogR2V0IGltYWdlIGRpbWVuc2lvbnMgdXNpbmcgc2ltcGxlIGhlYWRlciBwYXJzaW5nICovXG5mdW5jdGlvbiBnZXRJbWFnZURpbWVuc2lvbnMoaW1hZ2VQYXRoOiBzdHJpbmcpOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0gfCBudWxsIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBidWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoaW1hZ2VQYXRoKTtcbiAgICBcbiAgICAvLyBQTkc6IGJ5dGVzIDE2LTE5ID0gd2lkdGgsIDIwLTIzID0gaGVpZ2h0IChiaWctZW5kaWFuKVxuICAgIGlmIChidWZmZXJbMF0gPT09IDB4ODkgJiYgYnVmZmVyWzFdID09PSAweDUwICYmIGJ1ZmZlclsyXSA9PT0gMHg0RSAmJiBidWZmZXJbM10gPT09IDB4NDcpIHtcbiAgICAgIGNvbnN0IHdpZHRoID0gYnVmZmVyLnJlYWRVSW50MzJCRSgxNik7XG4gICAgICBjb25zdCBoZWlnaHQgPSBidWZmZXIucmVhZFVJbnQzMkJFKDIwKTtcbiAgICAgIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfTtcbiAgICB9XG5cbiAgICAvLyBKUEVHOiBOZWVkIHRvIGZpbmQgU09GIG1hcmtlciBhbmQgcGFyc2UgZGltZW5zaW9uc1xuICAgIGlmIChidWZmZXJbMF0gPT09IDB4RkYgJiYgYnVmZmVyWzFdID09PSAweEQ4KSB7XG4gICAgICBsZXQgb2Zmc2V0ID0gMjtcbiAgICAgIHdoaWxlIChvZmZzZXQgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIGlmIChidWZmZXJbb2Zmc2V0XSA9PT0gMHhGRiAmJiAoYnVmZmVyW29mZnNldCArIDFdICYgMHhGOCkgPT09IDB4QzApIHtcbiAgICAgICAgICAvLyBGb3VuZCBTT0YgbWFya2VyXG4gICAgICAgICAgb2Zmc2V0ICs9IDQ7IC8vIFNraXAgbWFya2VyIGFuZCBsZW5ndGhcbiAgICAgICAgICBjb25zdCBoZWlnaHQgPSBidWZmZXIucmVhZFVJbnQxNkJFKG9mZnNldCk7XG4gICAgICAgICAgY29uc3Qgd2lkdGggPSBidWZmZXIucmVhZFVJbnQxNkJFKG9mZnNldCArIDIpO1xuICAgICAgICAgIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYnVmZmVyW29mZnNldF0gPT09IDB4RkYpIHtcbiAgICAgICAgICBvZmZzZXQgKz0gMiArIChidWZmZXJbb2Zmc2V0ICsgMl0gPDwgOCkgKyBidWZmZXJbb2Zmc2V0ICsgM107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2Zmc2V0Kys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHSUY6IGJ5dGVzIDYtNyA9IHdpZHRoLCA4LTkgPSBoZWlnaHQgKGxpdHRsZS1lbmRpYW4pXG4gICAgaWYgKGJ1ZmZlclswXSA9PT0gMHg0NyAmJiBidWZmZXJbMV0gPT09IDB4NDkgJiYgYnVmZmVyWzJdID09PSAweDQ2ICYmIGJ1ZmZlclszXSA9PT0gMHgzOCkge1xuICAgICAgY29uc3Qgd2lkdGggPSBidWZmZXIucmVhZFVJbnQxNkxFKDYpO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gYnVmZmVyLnJlYWRVSW50MTZMRSg4KTtcbiAgICAgIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfTtcbiAgICB9XG5cbiAgICAvLyBCTVA6IGJ5dGVzIDE4LTIxID0gd2lkdGgsIDIyLTI1ID0gaGVpZ2h0IChsaXR0bGUtZW5kaWFuKVxuICAgIGlmIChidWZmZXJbMF0gPT09IDB4NDIgJiYgYnVmZmVyWzFdID09PSAweDREKSB7XG4gICAgICBjb25zdCB3aWR0aCA9IGJ1ZmZlci5yZWFkSW50MzJMRSgxOCk7XG4gICAgICBjb25zdCBoZWlnaHQgPSBidWZmZXIucmVhZEludDMyTEUoMjIpO1xuICAgICAgcmV0dXJuIHsgd2lkdGg6IE1hdGguYWJzKHdpZHRoKSwgaGVpZ2h0OiBNYXRoLmFicyhoZWlnaHQpIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogRXh0cmFjdCB0ZXh0IGZyb20gaW1hZ2VzIHVzaW5nIE9DUiAoVGVzc2VyYWN0LmpzKS5cbiAqIEZ1bGwgaW1wbGVtZW50YXRpb24gd2l0aCBwcm9ncmVzcyB0cmFja2luZyBhbmQgZGV0YWlsZWQgd29yZC1sZXZlbCBkYXRhLlxuICovXG5hc3luYyBmdW5jdGlvbiBpbWFnZVRvVGV4dCh7IGltYWdlUGF0aCwgbGFuZ3VhZ2UgPSAnZW5nJyB9OiBJbWFnZVRvVGV4dFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZVBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICAvLyBHZXQgYmFzaWMgbWV0YWRhdGFcbiAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoaW1hZ2VQYXRoKTtcbiAgICBjb25zdCBkaW1lbnNpb25zID0gZ2V0SW1hZ2VEaW1lbnNpb25zKGltYWdlUGF0aCk7XG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGltYWdlUGF0aCkudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIEltcG9ydCBUZXNzZXJhY3QuanMgZHluYW1pY2FsbHlcbiAgICBjb25zdCBUZXNzZXJhY3QgPSByZXF1aXJlKCd0ZXNzZXJhY3QuanMnKTtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gU3RhcnRpbmcgT0NSIG9uICR7aW1hZ2VQYXRofSB3aXRoIGxhbmd1YWdlICcke2xhbmd1YWdlfScuLi5gKTtcblxuICAgIC8vIFBlcmZvcm0gT0NSIHdpdGggcHJvZ3Jlc3MgdHJhY2tpbmdcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBUZXNzZXJhY3QucmVjb2duaXplKGltYWdlUGF0aCwgbGFuZ3VhZ2UsIHtcbiAgICAgIGxvZ2dlcjogKG06IGFueSkgPT4ge1xuICAgICAgICBpZiAobS5zdGF0dXMgPT09ICdyZWNvZ25pemluZyB0ZXh0Jykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gT0NSIFByb2dyZXNzOiAkeyhtLnByb2dyZXNzICogMTAwKS50b0ZpeGVkKDApfSVgKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEV4dHJhY3Qgc3RydWN0dXJlZCBkYXRhIGZyb20gcmVzdWx0XG4gICAgY29uc3QgZXh0cmFjdGVkVGV4dCA9IHJlc3VsdC5kYXRhLnRleHQudHJpbSgpO1xuICAgIGNvbnN0IHdvcmRDb3VudCA9IGV4dHJhY3RlZFRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIoKHc6IHN0cmluZykgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGg7XG4gICAgY29uc3QgbGluZUNvdW50ID0gZXh0cmFjdGVkVGV4dC5zcGxpdCgnXFxuJykuZmlsdGVyKChsOiBzdHJpbmcpID0+IGwudHJpbSgpLmxlbmd0aCA+IDApLmxlbmd0aDtcblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICB0ZXh0OiBleHRyYWN0ZWRUZXh0LFxuICAgICAgICBjb25maWRlbmNlOiByZXN1bHQuZGF0YS5jb25maWRlbmNlLnRvRml4ZWQoMiksXG4gICAgICAgIGxhbmd1YWdlOiByZXN1bHQuZGF0YS5sYW5ndWFnZSxcbiAgICAgICAgdmVyc2lvbjogcmVzdWx0LmRhdGEuX3ZlcnNpb24sXG4gICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgcGF0aDogaW1hZ2VQYXRoLFxuICAgICAgICAgIHNpemU6IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgICAgZm9ybWF0OiBleHQucmVwbGFjZSgnLicsICcnKS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgIGRpbWVuc2lvbnM6IGRpbWVuc2lvbnMgfHwgeyB3aWR0aDogJ1Vua25vd24nLCBoZWlnaHQ6ICdVbmtub3duJyB9LFxuICAgICAgICAgIHdvcmRDb3VudCxcbiAgICAgICAgICBsaW5lQ291bnQsXG4gICAgICAgIH0sXG4gICAgICAgIHdvcmRzOiByZXN1bHQuZGF0YS53b3Jkcz8uc2xpY2UoMCwgMTAwKSB8fCBbXSwgLy8gTGltaXQgdG8gZmlyc3QgMTAwIHdvcmRzIGZvciBicmV2aXR5XG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIERlc2NyaWJlIGltYWdlIGNvbnRlbnQgLSByZXR1cm5zIG1ldGFkYXRhIGFuZCBiYXNpYyBpbmZvcm1hdGlvbi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVzY3JpYmVJbWFnZSh7IGltYWdlUGF0aCB9OiBEZXNjcmliZUltYWdlUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhpbWFnZVBhdGgpO1xuICAgIGNvbnN0IGRpbWVuc2lvbnMgPSBnZXRJbWFnZURpbWVuc2lvbnMoaW1hZ2VQYXRoKTtcbiAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoaW1hZ2VQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgIFxuICAgIC8vIERldGVybWluZSBNSU1FIHR5cGVcbiAgICBjb25zdCBtaW1lVHlwZU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICcucG5nJzogJ2ltYWdlL3BuZycsXG4gICAgICAnLmpwZyc6ICdpbWFnZS9qcGVnJyxcbiAgICAgICcuanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgICAgICcuZ2lmJzogJ2ltYWdlL2dpZicsXG4gICAgICAnLmJtcCc6ICdpbWFnZS9ibXAnLFxuICAgICAgJy53ZWJwJzogJ2ltYWdlL3dlYnAnLFxuICAgICAgJy50aWZmJzogJ2ltYWdlL3RpZmYnLFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcGF0aDogaW1hZ2VQYXRoLFxuICAgICAgICBzaXplOiBzdGF0LnNpemUsXG4gICAgICAgIHNpemVIdW1hbjogYCR7KHN0YXQuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgZm9ybWF0OiBleHQucmVwbGFjZSgnLicsICcnKS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICBtaW1lVHlwZTogbWltZVR5cGVNYXBbZXh0XSB8fCAnaW1hZ2UvdW5rbm93bicsXG4gICAgICAgIGRpbWVuc2lvbnM6IGRpbWVuc2lvbnMgfHwgeyB3aWR0aDogJ1Vua25vd24nLCBoZWlnaHQ6ICdVbmtub3duJyB9LFxuICAgICAgICBjcmVhdGVkQXQ6IHN0YXQuYmlydGh0aW1lLFxuICAgICAgICBtb2RpZmllZEF0OiBzdGF0Lm10aW1lLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBDYXB0dXJlIGRlc2t0b3Agc2NyZWVuc2hvdCBhbmQgc2F2ZSB0byBmaWxlLlxuICogVXNlcyBwbGF0Zm9ybS1zcGVjaWZpYyBjb21tYW5kcyBmb3IgY3Jvc3MtcGxhdGZvcm0gc3VwcG9ydC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2NyZWVuc2hvdERlc2t0b3AoeyBcbiAgb3V0cHV0UGF0aCwgXG4gIGZvcm1hdCA9ICdwbmcnLCBcbiAgcXVhbGl0eSA9IDkwIFxufTogU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IHNwYXduIH0gPSBhd2FpdCBpbXBvcnQoJ2NoaWxkX3Byb2Nlc3MnKTtcbiAgICBcbiAgICAvLyBHZW5lcmF0ZSBvdXRwdXQgcGF0aCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBmaW5hbE91dHB1dFBhdGggPSBvdXRwdXRQYXRoIHx8ICgoKSA9PiB7XG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvWzouXS9nLCAnLScpLnNsaWNlKDAsIC01KTtcbiAgICAgIHJldHVybiBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGBzY3JlZW5zaG90LSR7dGltZXN0YW1wfS4ke2Zvcm1hdH1gKTtcbiAgICB9KSgpO1xuXG4gICAgLy8gRW5zdXJlIGRpcmVjdG9yeSBleGlzdHNcbiAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUoZmluYWxPdXRwdXRQYXRoKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICAgIGxldCBjbWQ6IHN0cmluZztcbiAgICBsZXQgYXJnczogc3RyaW5nW107XG5cbiAgICAvLyBQbGF0Zm9ybS1zcGVjaWZpYyBzY3JlZW5zaG90IGNvbW1hbmRzXG4gICAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgICAgY2FzZSAnd2luMzInOlxuICAgICAgICAvLyBXaW5kb3dzOiBVc2UgUG93ZXJTaGVsbCB3aXRoIFdJQyBBUElcbiAgICAgICAgY21kID0gJ3Bvd2Vyc2hlbGwuZXhlJztcbiAgICAgICAgYXJncyA9IFsnLU5vUHJvZmlsZScsICctQ29tbWFuZCcsIGBcbiAgICAgICAgICBBZGQtVHlwZSAtQXNzZW1ibHlOYW1lIFN5c3RlbS5XaW5kb3dzLkZvcm1zO1xuICAgICAgICAgIEFkZC1UeXBlIC1Bc3NlbWJseU5hbWUgU3lzdGVtLkRyYXdpbmc7XG4gICAgICAgICAgJHNjcmVlbiA9IFtTeXN0ZW0uV2luZG93cy5Gb3Jtcy5TY3JlZW5dOjpQcmltYXJ5U2NyZWVuO1xuICAgICAgICAgICRiaXRtYXAgPSBOZXctT2JqZWN0IFN5c3RlbS5EcmF3aW5nLkJpdG1hcCgkc2NyZWVuLkJvdW5kcy5XaWR0aCwgJHNjcmVlbi5Cb3VuZHMuSGVpZ2h0KTtcbiAgICAgICAgICAkZ3JhcGhpY3MgPSBbU3lzdGVtLkRyYXdpbmcuR3JhcGhpY3NdOjpGcm9tSW1hZ2UoJGJpdG1hcCk7XG4gICAgICAgICAgJGdyYXBoaWNzLkNvcHlGcm9tU2NyZWVuKDAsIDAsIDAsIDAsICRiaXRtYXAuU2l6ZSk7XG4gICAgICAgICAgJGJpdG1hcC5TYXZlKCcke2ZpbmFsT3V0cHV0UGF0aC5yZXBsYWNlKC9cXFxcL2csICdcXFxcJyl9JywgW1N5c3RlbS5EcmF3aW5nLkltYWdpbmcuSW1hZ2VGb3JtYXRdOjoke2Zvcm1hdCA9PT0gJ3BuZycgPyAnUG5nJyA6ICdKcGVnJ30pO1xuICAgICAgICAgICRncmFwaGljcy5EaXNwb3NlKCk7XG4gICAgICAgICAgJGJpdG1hcC5EaXNwb3NlKCk7XG4gICAgICAgIGBdO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZGFyd2luJzpcbiAgICAgICAgLy8gbWFjT1M6IFVzZSBzY3JlZW5jYXB0dXJlXG4gICAgICAgIGNtZCA9ICdzY3JlZW5jYXB0dXJlJztcbiAgICAgICAgYXJncyA9IFsnLW0nLCAnLXgnLCBmaW5hbE91dHB1dFBhdGhdO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXg6IFVzZSBnbm9tZS1zY3JlZW5zaG90IG9yIGltcG9ydCAoSW1hZ2VNYWdpY2spXG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsIGAoZ25vbWUtc2NyZWVuc2hvdCAtZiBcIiR7ZmluYWxPdXRwdXRQYXRofVwiIDI+L2Rldi9udWxsIHx8IGltcG9ydCAtd2luZG93IHJvb3QgXCIke2ZpbmFsT3V0cHV0UGF0aH1cIiAyPi9kZXYvbnVsbCkgfHwgZWNobyBcIkZhaWxlZFwiYF07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIEV4ZWN1dGUgc2NyZWVuc2hvdCBjb21tYW5kXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHByb2MgPSBzcGF3bihjbWQsIGFyZ3MsIHsgc2hlbGw6IHBsYXRmb3JtID09PSAnd2luMzInIH0pO1xuICAgICAgXG4gICAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICB9KTtcblxuICAgICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgICBpZiAoY29kZSA9PT0gMCAmJiBmcy5leGlzdHNTeW5jKGZpbmFsT3V0cHV0UGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmluYWxPdXRwdXRQYXRoKTtcbiAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHBhdGg6IGZpbmFsT3V0cHV0UGF0aCxcbiAgICAgICAgICAgICAgc2l6ZTogc3RhdC5zaXplLFxuICAgICAgICAgICAgICBzaXplSHVtYW46IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgICAgICAgIGZvcm1hdDogZm9ybWF0LnRvVXBwZXJDYXNlKCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFNjcmVlbnNob3QgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG5cbiAgICAgIC8vIFRpbWVvdXQgYWZ0ZXIgMTAgc2Vjb25kc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdTY3JlZW5zaG90IHRpbWVkIG91dCcpKTtcbiAgICAgIH0sIDEwMDAwKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogQ29tcGFyZSB0d28gaW1hZ2VzIHBpeGVsLWJ5LXBpeGVsLlxuICovXG5hc3luYyBmdW5jdGlvbiBjb21wYXJlSW1hZ2VzKHsgaW1hZ2UxUGF0aCwgaW1hZ2UyUGF0aCB9OiBDb21wYXJlSW1hZ2VzUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgYm90aCBmaWxlc1xuICAgIGNvbnN0IHZhbGlkYXRpb24xID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2UxUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uMS52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uMS5lcnJvciB9O1xuICAgIFxuICAgIGNvbnN0IHZhbGlkYXRpb24yID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2UyUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uMi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uMi5lcnJvciB9O1xuXG4gICAgLy8gUmVhZCBib3RoIGltYWdlc1xuICAgIGNvbnN0IGJ1ZmZlcjEgPSBmcy5yZWFkRmlsZVN5bmMoaW1hZ2UxUGF0aCk7XG4gICAgY29uc3QgYnVmZmVyMiA9IGZzLnJlYWRGaWxlU3luYyhpbWFnZTJQYXRoKTtcblxuICAgIC8vIEdldCBkaW1lbnNpb25zXG4gICAgY29uc3QgZGltczEgPSBnZXRJbWFnZURpbWVuc2lvbnMoaW1hZ2UxUGF0aCk7XG4gICAgY29uc3QgZGltczIgPSBnZXRJbWFnZURpbWVuc2lvbnMoaW1hZ2UyUGF0aCk7XG5cbiAgICBpZiAoIWRpbXMxIHx8ICFkaW1zMikge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ291bGQgbm90IGRldGVybWluZSBpbWFnZSBkaW1lbnNpb25zJyB9O1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGRpbWVuc2lvbnMgbWF0Y2hcbiAgICBpZiAoZGltczEud2lkdGggIT09IGRpbXMyLndpZHRoIHx8IGRpbXMxLmhlaWdodCAhPT0gZGltczIuaGVpZ2h0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgaXNJZGVudGljYWw6IGZhbHNlLFxuICAgICAgICAgIHJlYXNvbjogJ0RpZmZlcmVudCBkaW1lbnNpb25zJyxcbiAgICAgICAgICBpbWFnZTFEaW1lbnNpb25zOiB7IHdpZHRoOiBkaW1zMS53aWR0aCwgaGVpZ2h0OiBkaW1zMS5oZWlnaHQgfSxcbiAgICAgICAgICBpbWFnZTJEaW1lbnNpb25zOiB7IHdpZHRoOiBkaW1zMi53aWR0aCwgaGVpZ2h0OiBkaW1zMi5oZWlnaHQgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gU2ltcGxlIGJ5dGUgY29tcGFyaXNvbiAod29ya3MgZm9yIGlkZW50aWNhbCBlbmNvZGluZ3MpXG4gICAgY29uc3QgaXNCeXRlSWRlbnRpY2FsID0gYnVmZmVyMS5lcXVhbHMoYnVmZmVyMik7XG5cbiAgICBpZiAoaXNCeXRlSWRlbnRpY2FsKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgaXNJZGVudGljYWw6IHRydWUsXG4gICAgICAgICAgc2ltaWxhcml0eVBlcmNlbnQ6IDEwMCxcbiAgICAgICAgICBkaW1lbnNpb25zOiB7IHdpZHRoOiBkaW1zMS53aWR0aCwgaGVpZ2h0OiBkaW1zMS5oZWlnaHQgfSxcbiAgICAgICAgICBub3RlOiAnSW1hZ2VzIGFyZSBieXRlLWlkZW50aWNhbCcsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZvciBub24tYnl0ZS1pZGVudGljYWwgaW1hZ2VzLCBwcm92aWRlIGJhc2ljIGNvbXBhcmlzb24gaW5mb1xuICAgIC8vIE5vdGU6IFRydWUgcGl4ZWwtbGV2ZWwgY29tcGFyaXNvbiB3b3VsZCByZXF1aXJlIGEgbGlicmFyeSBsaWtlIHNoYXJwIG9yIGppbXBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgaXNJZGVudGljYWw6IGZhbHNlLFxuICAgICAgICBzaW1pbGFyaXR5UGVyY2VudDogJ1Vua25vd24gKGJ5dGUgY29tcGFyaXNvbiBvbmx5KScsXG4gICAgICAgIGRpbWVuc2lvbnM6IHsgd2lkdGg6IGRpbXMxLndpZHRoLCBoZWlnaHQ6IGRpbXMxLmhlaWdodCB9LFxuICAgICAgICBub3RlOiAnSW1hZ2VzIGRpZmZlci4gRm9yIGRldGFpbGVkIHBpeGVsIGNvbXBhcmlzb24sIGluc3RhbGwgc2hhcnAgb3IgamltcCBsaWJyYXJ5LicsXG4gICAgICAgIGltYWdlMVNpemU6IGJ1ZmZlcjEubGVuZ3RoLFxuICAgICAgICBpbWFnZTJTaXplOiBidWZmZXIyLmxlbmd0aCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogUmVnaXN0ZXIgYWxsIGltYWdlIHByb2Nlc3NpbmcgdG9vbHMuXG4gKiBAcGFyYW0gY29uZmlnIFBsdWdpbiBjb25maWd1cmF0aW9uXG4gKiBAcmV0dXJucyBBcnJheSBvZiByZWdpc3RlcmVkIHRvb2xzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIHJldHVybiBbXG4gICAgdG9vbCh7XG4gICAgICBuYW1lOiAnaW1hZ2VfdG9fdGV4dCcsXG4gICAgICBkZXNjcmlwdGlvbjogYEV4dHJhY3QgdGV4dCBmcm9tIGltYWdlcyB1c2luZyBPQ1IgKFRlc3NlcmFjdC5qcykuXFxuXFxuU3VwcG9ydGVkIGZvcm1hdHM6IFBORywgSlBHLCBKUEVHLCBCTVAsIEdJRiwgVElGRiwgV2ViUC4gTWF4aW11bSBmaWxlIHNpemU6IDUwTUIuXFxuXFxuUmV0dXJuczpcXG4tIEV4dHJhY3RlZCB0ZXh0IGNvbnRlbnRcXG4tIENvbmZpZGVuY2Ugc2NvcmUgKDAtMTAwKVxcbi0gRGV0ZWN0ZWQgbGFuZ3VhZ2VcXG4tIFdvcmQgY291bnQgYW5kIGxpbmUgY291bnRcXG4tIFBlci13b3JkIGRhdGEgd2l0aCBib3VuZGluZyBib3hlcyAoZmlyc3QgMTAwIHdvcmRzKWAsXG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIGltYWdlUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgaW1hZ2UgZmlsZScpLFxuICAgICAgICBsYW5ndWFnZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ2VuZycpLmRlc2NyaWJlKCdMYW5ndWFnZSBjb2RlIGZvciBPQ1IgKGUuZy4sIFwiZW5nXCIsIFwiZGV1XCIsIFwiY2hpX3NpbVwiKS4gRGVmYXVsdDogXCJlbmdcIicpLFxuICAgICAgfSxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBpbWFnZVBhdGgsIGxhbmd1YWdlIH06IEltYWdlVG9UZXh0UGFyYW1zKSA9PiBpbWFnZVRvVGV4dCh7IGltYWdlUGF0aCwgbGFuZ3VhZ2UgfSksXG4gICAgfSksXG5cbiAgICB0b29sKHtcbiAgICAgIG5hbWU6ICdkZXNjcmliZV9pbWFnZScsXG4gICAgICBkZXNjcmlwdGlvbjogYEdldCBkZXRhaWxlZCBtZXRhZGF0YSBhYm91dCBhbiBpbWFnZSBmaWxlIGluY2x1ZGluZyBkaW1lbnNpb25zLCBmb3JtYXQsIHNpemUsIGFuZCB0aW1lc3RhbXBzLlxcblxcblN1cHBvcnRlZCBmb3JtYXRzOiBQTkcsIEpQRywgSlBFRywgQk1QLCBHSUYsIFdlYlAsIFRJRkYuYCxcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgaW1hZ2VQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBpbWFnZSBmaWxlJyksXG4gICAgICB9LFxuICAgICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGltYWdlUGF0aCB9OiBEZXNjcmliZUltYWdlUGFyYW1zKSA9PiBkZXNjcmliZUltYWdlKHsgaW1hZ2VQYXRoIH0pLFxuICAgIH0pLFxuXG4gICAgdG9vbCh7XG4gICAgICBuYW1lOiAnc2NyZWVuc2hvdF9kZXNrdG9wJyxcbiAgICAgIGRlc2NyaXB0aW9uOiBgQ2FwdHVyZSBhIHNjcmVlbnNob3Qgb2YgdGhlIGRlc2t0b3AgYW5kIHNhdmUgaXQgdG8gYSBmaWxlLlxcblxcbkNyb3NzLXBsYXRmb3JtIHN1cHBvcnQ6XFxuLSBXaW5kb3dzOiBVc2VzIC5ORVQgR0RJKyB2aWEgUG93ZXJTaGVsbFxcbi0gbWFjT1M6IFVzZXMgc2NyZWVuY2FwdHVyZSBjb21tYW5kXFxuLSBMaW51eDogVXNlcyBnbm9tZS1zY3JlZW5zaG90IG9yIEltYWdlTWFnaWNrIGltcG9ydFxcblxcbk91dHB1dCBpcyBzYXZlZCB0byB0ZW1wIGRpcmVjdG9yeSBpZiBubyBwYXRoIHNwZWNpZmllZC5gLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICBvdXRwdXRQYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ091dHB1dCBmaWxlIHBhdGguIERlZmF1bHRzIHRvIHRlbXAgZGlyZWN0b3J5IHdpdGggdGltZXN0YW1wLicpLFxuICAgICAgICBmb3JtYXQ6IHouZW51bShbJ3BuZycsICdqcGVnJ10pLmRlZmF1bHQoJ3BuZycpLmRlc2NyaWJlKCdJbWFnZSBmb3JtYXQuIERlZmF1bHQ6IFwicG5nXCInKSxcbiAgICAgICAgcXVhbGl0eTogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMCkuZGVmYXVsdCg5MCkuZGVzY3JpYmUoJ0pQRUcgcXVhbGl0eSAoMS0xMDApLiBPbmx5IGFwcGxpZXMgdG8gSlBFRyBmb3JtYXQuIERlZmF1bHQ6IDkwJyksXG4gICAgICB9LFxuICAgICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG91dHB1dFBhdGgsIGZvcm1hdCwgcXVhbGl0eSB9OiBTY3JlZW5zaG90RGVza3RvcFBhcmFtcykgPT4gc2NyZWVuc2hvdERlc2t0b3AoeyBvdXRwdXRQYXRoLCBmb3JtYXQsIHF1YWxpdHkgfSksXG4gICAgfSksXG5cbiAgICB0b29sKHtcbiAgICAgIG5hbWU6ICdjb21wYXJlX2ltYWdlcycsXG4gICAgICBkZXNjcmlwdGlvbjogYENvbXBhcmUgdHdvIGltYWdlcyBmb3Igc2ltaWxhcml0eS5cXG5cXG5QZXJmb3JtcyBieXRlLWxldmVsIGNvbXBhcmlzb24gYW5kIGRpbWVuc2lvbiBjaGVja2luZy5cXG5Gb3IgaWRlbnRpY2FsIGVuY29kaW5ncywgcmV0dXJucyBleGFjdCBtYXRjaCBzdGF0dXMuXFxuXFxuTm90ZTogRGV0YWlsZWQgcGl4ZWwtbGV2ZWwgY29tcGFyaXNvbiByZXF1aXJlcyBzaGFycCBvciBqaW1wIGxpYnJhcnkgaW5zdGFsbGF0aW9uLmAsXG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIGltYWdlMVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIGZpcnN0IGltYWdlJyksXG4gICAgICAgIGltYWdlMlBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIHNlY29uZCBpbWFnZScpLFxuICAgICAgfSxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBpbWFnZTFQYXRoLCBpbWFnZTJQYXRoIH06IENvbXBhcmVJbWFnZXNQYXJhbXMpID0+IGNvbXBhcmVJbWFnZXMoeyBpbWFnZTFQYXRoLCBpbWFnZTJQYXRoIH0pLFxuICAgIH0pLFxuICBdO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBIdHRwUmVxdWVzdFBhcmFtcyB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGJvZHk/OiBzdHJpbmcgfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuaW50ZXJmYWNlIEh0dHBHZXRKc29uUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5pbnRlcmZhY2UgSHR0cFBvc3RKc29uUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU2VjdXJpdHkgJiBWYWxpZGF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTU1JGIHByb3RlY3Rpb24gLSB2YWxpZGF0ZSBVUkwgaXMgc2FmZSAqL1xuZnVuY3Rpb24gdmFsaWRhdGVVcmwodXJsOiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgXG4gICAgLy8gQmxvY2sgaW50ZXJuYWwvcHJpdmF0ZSBJUCBhZGRyZXNzZXMgKFNTUkYgcHJvdGVjdGlvbilcbiAgICBpZiAocGFyc2VkLnByb3RvY29sID09PSAnZmlsZTonIHx8IHBhcnNlZC5wcm90b2NvbCA9PT0gJ2RhdGE6Jykge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFByb3RvY29sIFwiJHtwYXJzZWQucHJvdG9jb2x9XCIgaXMgbm90IGFsbG93ZWRgIH07XG4gICAgfVxuXG4gICAgLy8gQWxsb3cgaHR0cCBhbmQgaHR0cHMgb25seVxuICAgIGlmICghWydodHRwOicsICdodHRwczonXS5pbmNsdWRlcyhwYXJzZWQucHJvdG9jb2wpKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgT25seSBIVFRQL0hUVFBTIHByb3RvY29scyBhcmUgYWxsb3dlZGAgfTtcbiAgICB9XG5cbiAgICAvLyBCbG9jayBwcml2YXRlIElQIHJhbmdlcyAoYmFzaWMgY2hlY2spXG4gICAgY29uc3QgaG9zdG5hbWUgPSBwYXJzZWQuaG9zdG5hbWU7XG4gICAgY29uc3QgYmxvY2tlZFBhdHRlcm5zID0gW1xuICAgICAgL14xMjdcXC4vLCAgICAgICAgICAgLy8gbG9jYWxob3N0XG4gICAgICAvXjEwXFwuLywgICAgICAgICAgICAvLyAxMC4wLjAuMC84XG4gICAgICAvXjE3MlxcLjFbNi05XVxcLi8sICAgLy8gMTcyLjE2LjAuMC8xMlxuICAgICAgL14xNzJcXC4yWzAtOV1cXC4vLCAgIC8vIDE3Mi4xNi4wLjAvMTJcbiAgICAgIC9eMTcyXFwuM1swLTFdXFwuLywgICAvLyAxNzIuMTYuMC4wLzEyXG4gICAgICAvXjE5MlxcLjE2OFxcLi8sICAgICAgLy8gMTkyLjE2OC4wLjAvMTZcbiAgICAgIC9eMFxcLjBcXC4wXFwuMCQvLCAgICAgLy8gMC4wLjAuMFxuICAgICAgL15sb2NhbGhvc3QkLywgICAgICAvLyBsb2NhbGhvc3QgaG9zdG5hbWVcbiAgICBdO1xuXG4gICAgaWYgKGJsb2NrZWRQYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi50ZXN0KGhvc3RuYW1lKSkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBBY2Nlc3MgdG8gJHtob3N0bmFtZX0gaXMgYmxvY2tlZCBmb3Igc2VjdXJpdHkgcmVhc29uc2AgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEludmFsaWQgVVJMOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSFRUUCByZXF1ZXN0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBHZW5lcmljIEhUVFAgY2xpZW50IGZvciBtYWtpbmcgcmVxdWVzdHMgdG8gYW55IFJFU1QgQVBJLlxuICovXG5hc3luYyBmdW5jdGlvbiBodHRwUmVxdWVzdCh7IG1ldGhvZCwgdXJsLCBoZWFkZXJzID0ge30sIGJvZHkgfTogSHR0cFJlcXVlc3RQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICAvLyBQcmVwYXJlIHJlcXVlc3Qgb3B0aW9uc1xuICAgIGNvbnN0IG9wdGlvbnM6IFJlcXVlc3RJbml0ID0ge1xuICAgICAgbWV0aG9kOiBtZXRob2QudG9VcHBlckNhc2UoKSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1VzZXItQWdlbnQnOiAnQUktVG9vbGJveC8xLjAnLFxuICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGJvZHkgZm9yIG5vbi1HRVQvSEVBRCByZXF1ZXN0c1xuICAgIGlmIChib2R5ICYmICFbJ0dFVCcsICdIRUFEJ10uaW5jbHVkZXMobWV0aG9kLnRvVXBwZXJDYXNlKCkpKSB7XG4gICAgICBvcHRpb25zLmJvZHkgPSB0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycgPyBib2R5IDogSlNPTi5zdHJpbmdpZnkoYm9keSk7XG4gICAgICBcbiAgICAgIC8vIFNldCBjb250ZW50LXR5cGUgaGVhZGVyIGlmIG5vdCBhbHJlYWR5IHNldCBhbmQgYm9keSBpcyBvYmplY3Qvc3RyaW5nXG4gICAgICBpZiAoIWhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddICYmIHR5cGVvZiBib2R5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAob3B0aW9ucy5oZWFkZXJzIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4pWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgJHttZXRob2QudG9VcHBlckNhc2UoKX0gJHt1cmx9YCk7XG5cbiAgICAvLyBNYWtlIHRoZSByZXF1ZXN0IHdpdGggdGltZW91dFxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTsgLy8gMzBzIHRpbWVvdXRcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyAuLi5vcHRpb25zLCBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIC8vIFBhcnNlIHJlc3BvbnNlIGJhc2VkIG9uIGNvbnRlbnQgdHlwZVxuICAgICAgbGV0IHJlc3BvbnNlRGF0YTogdW5rbm93bjtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuICAgICAgXG4gICAgICBpZiAoY29udGVudFR5cGUuaW5jbHVkZXMoJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXNwb25zZS5oZWFkZXJzLmVudHJpZXMoKSksXG4gICAgICAgICAgYm9keTogcmVzcG9uc2VEYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgICBtZXRob2Q6IG1ldGhvZC50b1VwcGVyQ2FzZSgpLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBHRVQgcmVxdWVzdCByZXR1cm5pbmcgcGFyc2VkIEpTT04uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBHZXRKc29uKHsgdXJsLCBoZWFkZXJzID0ge30gfTogSHR0cEdldEpzb25QYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgR0VUICR7dXJsfWApO1xuXG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnVXNlci1BZ2VudCc6ICdBSS1Ub29sYm94LzEuMCcsXG4gICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiBgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c306ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gLFxuICAgICAgICAgIGRhdGE6IHsgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsIHVybCB9LFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiBkYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogUE9TVCByZXF1ZXN0IHdpdGggSlNPTiBib2R5LlxuICovXG5hc3luYyBmdW5jdGlvbiBodHRwUG9zdEpzb24oeyB1cmwsIGRhdGEsIGhlYWRlcnMgPSB7fSB9OiBIdHRwUG9zdEpzb25QYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgUE9TVCAke3VybH1gKTtcblxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogJ0FJLVRvb2xib3gvMS4wJyxcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICBsZXQgcmVzcG9uc2VEYXRhOiB1bmtub3duO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgICBcbiAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXNwb25zZS5oZWFkZXJzLmVudHJpZXMoKSksXG4gICAgICAgICAgYm9keTogcmVzcG9uc2VEYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3Rlckh0dHBDbGllbnRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gaHR0cF9yZXF1ZXN0IHRvb2wgLSBHZW5lcmljIEhUVFAgY2xpZW50XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfcmVxdWVzdCcsXG4gICAgZGVzY3JpcHRpb246ICdNYWtlIGdlbmVyaWMgSFRUUCByZXF1ZXN0cyB0byBhbnkgUkVTVCBBUEkuIFN1cHBvcnRzIEdFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENIIGFuZCBvdGhlciBtZXRob2RzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWV0aG9kOiB6LmVudW0oWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ1BBVENIJywgJ0hFQUQnLCAnT1BUSU9OUyddKS5kZXNjcmliZSgnSFRUUCBtZXRob2QnKSxcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnUmVxdWVzdCBVUkwgKG11c3QgYmUgaHR0cDovLyBvciBodHRwczovLyknKSxcbiAgICAgIGhlYWRlcnM6IHoucmVjb3JkKHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0N1c3RvbSBoZWFkZXJzIGFzIGtleS12YWx1ZSBwYWlycycpLFxuICAgICAgYm9keTogei51bmlvbihbei5zdHJpbmcoKSwgei5yZWNvcmQoei51bmtub3duKCkpXSkub3B0aW9uYWwoKS5kZXNjcmliZSgnUmVxdWVzdCBib2R5IChzdHJpbmcgb3IgSlNPTiBvYmplY3QpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaHR0cFJlcXVlc3QocGFyYW1zIGFzIEh0dHBSZXF1ZXN0UGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGh0dHBfZ2V0X2pzb24gdG9vbCAtIENvbnZlbmllbmNlIHdyYXBwZXIgZm9yIEdFVCByZXF1ZXN0c1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdodHRwX2dldF9qc29uJyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgYSBHRVQgcmVxdWVzdCBhbmQgcmV0dXJuIHBhcnNlZCBKU09OIHJlc3BvbnNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdSZXF1ZXN0IFVSTCAobXVzdCBiZSBodHRwOi8vIG9yIGh0dHBzOi8vKScpLFxuICAgICAgaGVhZGVyczogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ3VzdG9tIGhlYWRlcnMgYXMga2V5LXZhbHVlIHBhaXJzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaHR0cEdldEpzb24ocGFyYW1zIGFzIEh0dHBHZXRKc29uUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGh0dHBfcG9zdF9qc29uIHRvb2wgLSBDb252ZW5pZW5jZSB3cmFwcGVyIGZvciBQT1NUIHJlcXVlc3RzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfcG9zdF9qc29uJyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgYSBQT1NUIHJlcXVlc3Qgd2l0aCBKU09OIGJvZHkgYW5kIHJldHVybiBwYXJzZWQgcmVzcG9uc2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgVVJMIChtdXN0IGJlIGh0dHA6Ly8gb3IgaHR0cHM6Ly8pJyksXG4gICAgICBkYXRhOiB6LnJlY29yZCh6LnVua25vd24oKSkuZGVzY3JpYmUoJ0pTT04gb2JqZWN0IHRvIHNlbmQgYXMgcmVxdWVzdCBib2R5JyksXG4gICAgICBoZWFkZXJzOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDdXN0b20gaGVhZGVycyBhcyBrZXktdmFsdWUgcGFpcnMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwUG9zdEpzb24ocGFyYW1zIGFzIEh0dHBQb3N0SnNvblBhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSYWdJbmRleEZpbGVzUGFyYW1zIHtcbiAgZGlyZWN0b3J5UGF0aDogc3RyaW5nO1xuICBmaWxlUGF0dGVybj86IHN0cmluZztcbiAgYmF0Y2hTaXplPzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgUmFnUXVlcnlWZWN0b3JQYXJhbXMge1xuICBxdWVyeTogc3RyaW5nO1xuICB0b3BLPzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgUmFnQ2xlYXJJbmRleFBhcmFtcyB7XG4gIGNvbmZpcm06IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBSYWdXZWJDb250ZW50UGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIHF1ZXJ5OiBzdHJpbmc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBEb2N1bWVudENodW5rIHtcbiAgaWQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBtZXRhZGF0YToge1xuICAgIGZpbGVfcGF0aDogc3RyaW5nO1xuICAgIGZpbGVfbmFtZTogc3RyaW5nO1xuICAgIGNodW5rX2luZGV4OiBudW1iZXI7XG4gICAgdG90YWxfY2h1bmtzOiBudW1iZXI7XG4gICAgd29yZF9jb3VudDogbnVtYmVyO1xuICB9O1xufVxuXG5pbnRlcmZhY2UgU2VhcmNoUmVzdWx0IHtcbiAgaWQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBzY29yZTogbnVtYmVyO1xuICBtZXRhZGF0YTogRG9jdW1lbnRDaHVua1snbWV0YWRhdGEnXTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gUGVyc2lzdGVudCBWZWN0b3IgU3RvcmUgKFNpbmdsZXRvbikgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFNpbXBsZSBwZXJzaXN0ZW50IHZlY3RvciBzdG9yZSB1c2luZyBpbi1tZW1vcnkgc3RvcmFnZSB3aXRoIGNvc2luZSBzaW1pbGFyaXR5ICovXG5jbGFzcyBMb2NhbFZlY3RvclN0b3JlIHtcbiAgcHJpdmF0ZSBkb2N1bWVudHM6IE1hcDxzdHJpbmcsIHsgZW1iZWRkaW5nOiBGbG9hdDMyQXJyYXk7IGNodW5rOiBEb2N1bWVudENodW5rIH0+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIGluZGV4TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4TmFtZTogc3RyaW5nID0gJ2FpX3Rvb2xib3hfcmFnJykge1xuICAgIHRoaXMuaW5kZXhOYW1lID0gaW5kZXhOYW1lO1xuICB9XG5cbiAgLyoqIEFkZCBkb2N1bWVudHMgdG8gdGhlIHN0b3JlICovXG4gIGFkZChkb2N1bWVudHM6IERvY3VtZW50Q2h1bmtbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3VtZW50cykge1xuICAgICAgdGhpcy5kb2N1bWVudHMuc2V0KGRvYy5pZCwgeyBlbWJlZGRpbmc6IG5ldyBGbG9hdDMyQXJyYXkoMCksIGNodW5rOiBkb2MgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCBlbWJlZGRpbmdzIGZvciBhbGwgZG9jdW1lbnRzICovXG4gIHNldEVtYmVkZGluZ3MoaWRzOiBzdHJpbmdbXSwgZW1iZWRkaW5nczogRmxvYXQzMkFycmF5W10pOiB2b2lkIHtcbiAgICBpZHMuZm9yRWFjaCgoaWQsIGkpID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKTtcbiAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICBlbnRyeS5lbWJlZGRpbmcgPSBlbWJlZGRpbmdzW2ldO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFNlYXJjaCBmb3Igc2ltaWxhciBkb2N1bWVudHMgKi9cbiAgc2VhcmNoKHF1ZXJ5RW1iZWRkaW5nOiBGbG9hdDMyQXJyYXksIHRvcEs6IG51bWJlcik6IFNlYXJjaFJlc3VsdFtdIHtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGlkOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgW2lkLCBlbnRyeV0gb2YgdGhpcy5kb2N1bWVudHMuZW50cmllcygpKSB7XG4gICAgICBpZiAoZW50cnkuZW1iZWRkaW5nLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICBcbiAgICAgIC8vIENvc2luZSBzaW1pbGFyaXR5XG4gICAgICBsZXQgZG90UHJvZHVjdCA9IDA7XG4gICAgICBsZXQgbm9ybUEgPSAwO1xuICAgICAgbGV0IG5vcm1CID0gMDtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyeS5lbWJlZGRpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZG90UHJvZHVjdCArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIGVudHJ5LmVtYmVkZGluZ1tpXTtcbiAgICAgICAgbm9ybUEgKz0gZW50cnkuZW1iZWRkaW5nW2ldICogZW50cnkuZW1iZWRkaW5nW2ldO1xuICAgICAgICBub3JtQiArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIHF1ZXJ5RW1iZWRkaW5nW2ldO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzaW1pbGFyaXR5ID0gbm9ybUEgPiAwICYmIG5vcm1CID4gMCA/IGRvdFByb2R1Y3QgLyAoTWF0aC5zcXJ0KG5vcm1BKSAqIE1hdGguc3FydChub3JtQikpIDogMDtcbiAgICAgIFxuICAgICAgcmVzdWx0cy5wdXNoKHsgaWQsIHNjb3JlOiBzaW1pbGFyaXR5IH0pO1xuICAgIH1cblxuICAgIC8vIFNvcnQgYnkgc2ltaWxhcml0eSBkZXNjZW5kaW5nIGFuZCByZXR1cm4gdG9wIEtcbiAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBiLnNjb3JlKVxuICAgICAgLnNsaWNlKDAsIHRvcEspXG4gICAgICAubWFwKCh7IGlkLCBzY29yZSB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKSE7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGVudHJ5LmNodW5rLmlkLFxuICAgICAgICAgIHRleHQ6IGVudHJ5LmNodW5rLnRleHQsXG4gICAgICAgICAgc2NvcmUsXG4gICAgICAgICAgbWV0YWRhdGE6IGVudHJ5LmNodW5rLm1ldGFkYXRhLFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH1cblxuICAvKiogQ2xlYXIgYWxsIGRvY3VtZW50cyAqL1xuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmRvY3VtZW50cy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIEdldCBkb2N1bWVudCBjb3VudCAqL1xuICBnZXQgY291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuc2l6ZTtcbiAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2UgdGhhdCBwZXJzaXN0cyBhY3Jvc3MgdG9vbCBjYWxsc1xubGV0IHNoYXJlZFN0b3JlOiBMb2NhbFZlY3RvclN0b3JlIHwgbnVsbCA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldFNoYXJlZFN0b3JlKCk6IExvY2FsVmVjdG9yU3RvcmUge1xuICBpZiAoIXNoYXJlZFN0b3JlKSB7XG4gICAgc2hhcmVkU3RvcmUgPSBuZXcgTG9jYWxWZWN0b3JTdG9yZSgpO1xuICB9XG4gIHJldHVybiBzaGFyZWRTdG9yZTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVGV4dCBDaHVua2luZyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogU3BsaXQgdGV4dCBpbnRvIGNodW5rcyB3aXRoIG92ZXJsYXAgKi9cbmZ1bmN0aW9uIGNodW5rVGV4dCh0ZXh0OiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyID0gNTAwLCBvdmVybGFwOiBudW1iZXIgPSA1MCk6IERvY3VtZW50Q2h1bmtbXSB7XG4gIGNvbnN0IHdvcmRzID0gdGV4dC5zcGxpdCgvXFxzKy8pO1xuICBjb25zdCBjaHVua3M6IERvY3VtZW50Q2h1bmtbXSA9IFtdO1xuICBcbiAgaWYgKHdvcmRzLmxlbmd0aCA8PSBjaHVua1NpemUpIHtcbiAgICByZXR1cm4gW3tcbiAgICAgIGlkOiBgY2h1bmtfJHtEYXRlLm5vdygpfV8wYCxcbiAgICAgIHRleHQ6IHRleHQsXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6ICcnLFxuICAgICAgICBmaWxlX25hbWU6ICcnLFxuICAgICAgICBjaHVua19pbmRleDogMCxcbiAgICAgICAgdG90YWxfY2h1bmtzOiAxLFxuICAgICAgICB3b3JkX2NvdW50OiB3b3Jkcy5sZW5ndGgsXG4gICAgICB9LFxuICAgIH1dO1xuICB9XG5cbiAgbGV0IHN0YXJ0SW5kZXggPSAwO1xuICBsZXQgY2h1bmtJbmRleCA9IDA7XG5cbiAgd2hpbGUgKHN0YXJ0SW5kZXggPCB3b3Jkcy5sZW5ndGgpIHtcbiAgICBjb25zdCBlbmRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXggKyBjaHVua1NpemUsIHdvcmRzLmxlbmd0aCk7XG4gICAgY29uc3QgY2h1bmtUZXh0ID0gd29yZHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmpvaW4oJyAnKTtcbiAgICBcbiAgICBjaHVua3MucHVzaCh7XG4gICAgICBpZDogYGNodW5rXyR7RGF0ZS5ub3coKX1fJHtjaHVua0luZGV4fWAsXG4gICAgICB0ZXh0OiBjaHVua1RleHQsXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6ICcnLCAvLyBXaWxsIGJlIHNldCBsYXRlclxuICAgICAgICBmaWxlX25hbWU6ICcnLCAvLyBXaWxsIGJlIHNldCBsYXRlclxuICAgICAgICBjaHVua19pbmRleDogY2h1bmtJbmRleCxcbiAgICAgICAgdG90YWxfY2h1bmtzOiBNYXRoLmNlaWwod29yZHMubGVuZ3RoIC8gKGNodW5rU2l6ZSAtIG92ZXJsYXApKSxcbiAgICAgICAgd29yZF9jb3VudDogZW5kSW5kZXggLSBzdGFydEluZGV4LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNodW5rSW5kZXgrKztcbiAgICBzdGFydEluZGV4ID0gZW5kSW5kZXggLSBvdmVybGFwO1xuICB9XG5cbiAgcmV0dXJuIGNodW5rcztcbn1cblxuLyoqIEdlbmVyYXRlIHNpbXBsZSBURi1JREYtbGlrZSBlbWJlZGRpbmdzIGZvciB0ZXh0ICovXG5mdW5jdGlvbiBnZW5lcmF0ZUVtYmVkZGluZyh0ZXh0OiBzdHJpbmcpOiBGbG9hdDMyQXJyYXkge1xuICAvLyBTaW1wbGUgd29yZCBmcmVxdWVuY3ktYmFzZWQgZW1iZWRkaW5nIChkaW1lbnNpb246IDEwMClcbiAgY29uc3QgZGltZW5zaW9ucyA9IDEwMDtcbiAgY29uc3QgZW1iZWRkaW5nID0gbmV3IEZsb2F0MzJBcnJheShkaW1lbnNpb25zKTtcbiAgXG4gIC8vIFRva2VuaXplIGFuZCBoYXNoIHdvcmRzIHRvIGRpbWVuc2lvbnNcbiAgY29uc3Qgd29yZHMgPSB0ZXh0LnRvTG93ZXJDYXNlKCkubWF0Y2goL1thLXpdKy9nKSB8fCBbXTtcbiAgY29uc3Qgd29yZFNldCA9IG5ldyBTZXQod29yZHMpO1xuICBcbiAgZm9yIChjb25zdCB3b3JkIG9mIHdvcmRTZXQpIHtcbiAgICBsZXQgaGFzaCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3JkLmxlbmd0aDsgaSsrKSB7XG4gICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyB3b3JkLmNoYXJDb2RlQXQoaSk7XG4gICAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICAgIH1cbiAgICBcbiAgICBjb25zdCBkaW1JbmRleCA9IE1hdGguYWJzKGhhc2ggJSBkaW1lbnNpb25zKTtcbiAgICBlbWJlZGRpbmdbZGltSW5kZXhdICs9IDEuMCAvICh3b3JkLmxlbmd0aCArIDEpOyAvLyBXZWlnaHQgYnkgaW52ZXJzZSBsZW5ndGhcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZVxuICBsZXQgbm9ybSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltZW5zaW9uczsgaSsrKSB7XG4gICAgbm9ybSArPSBlbWJlZGRpbmdbaV0gKiBlbWJlZGRpbmdbaV07XG4gIH1cbiAgbm9ybSA9IE1hdGguc3FydChub3JtKSB8fCAxO1xuICBcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1lbnNpb25zOyBpKyspIHtcbiAgICBlbWJlZGRpbmdbaV0gLz0gbm9ybTtcbiAgfVxuXG4gIHJldHVybiBlbWJlZGRpbmc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogSW5kZXggZmlsZXMgaW4gYSBkaXJlY3RvcnkgZm9yIHNlbWFudGljIHNlYXJjaC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnSW5kZXhGaWxlcyh7IFxuICBkaXJlY3RvcnlQYXRoLCBcbiAgZmlsZVBhdHRlcm4gPSAnKi57dHMsanMsdHN4LGpzeCxtZCxqc29uLHlhbWwseW1sLHRvbWwsdHh0fScsXG4gIGJhdGNoU2l6ZSA9IDEwIFxufTogUmFnSW5kZXhGaWxlc1BhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIGRpcmVjdG9yeSBleGlzdHNcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5UGF0aCkpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERpcmVjdG9yeSBub3QgZm91bmQ6ICR7ZGlyZWN0b3J5UGF0aH1gIH07XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcmUgPSBnZXRTaGFyZWRTdG9yZSgpO1xuICAgIGxldCBpbmRleGVkQ291bnQgPSAwO1xuICAgIGxldCBza2lwcGVkQ291bnQgPSAwO1xuXG4gICAgLy8gRmluZCBmaWxlcyBtYXRjaGluZyBwYXR0ZXJuXG4gICAgY29uc3QgZmluZEZpbGVzID0gKGRpcjogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICAgICAgbGV0IHJlc3VsdHM6IHN0cmluZ1tdID0gW107XG4gICAgICBcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkubmFtZSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIC8vIFNraXAgbm9kZV9tb2R1bGVzIGFuZCAuZ2l0IGRpcmVjdG9yaWVzXG4gICAgICAgICAgICBpZiAoZW50cnkubmFtZSA9PT0gJ25vZGVfbW9kdWxlcycgfHwgZW50cnkubmFtZSA9PT0gJy5naXQnKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChmaW5kRmlsZXMoZnVsbFBhdGgpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmaWxlIGV4dGVuc2lvbiBhZ2FpbnN0IHBhdHRlcm5cbiAgICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgY29uc3QgYWxsb3dlZEV4dHMgPSBbJy50cycsICcuanMnLCAnLnRzeCcsICcuanN4JywgJy5tZCcsICcuanNvbicsICcueWFtbCcsICcueW1sJywgJy50b21sJywgJy50eHQnXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0FJIFRvb2xib3hdIENvdWxkIG5vdCByZWFkIGRpcmVjdG9yeSAke2Rpcn06YCwgZXJyb3IpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgY29uc3QgZmlsZXMgPSBmaW5kRmlsZXMoZGlyZWN0b3J5UGF0aCk7XG4gICAgXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpbmRleGVkQ291bnQ6IDAsIG1lc3NhZ2U6ICdObyBtYXRjaGluZyBmaWxlcyBmb3VuZCcgfSB9O1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZWFjaCBmaWxlXG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIFxuICAgICAgICAvLyBTa2lwIGxhcmdlIGZpbGVzICg+MU1CKVxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggPiAxMDI0ICogMTAyNCkge1xuICAgICAgICAgIHNraXBwZWRDb3VudCsrO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2h1bmsgdGhlIHRleHRcbiAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtUZXh0KGNvbnRlbnQpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IG1ldGFkYXRhIGZvciBlYWNoIGNodW5rXG4gICAgICAgIGNodW5rcy5mb3JFYWNoKGNodW5rID0+IHtcbiAgICAgICAgICBjaHVuay5tZXRhZGF0YS5maWxlX3BhdGggPSBmaWxlUGF0aDtcbiAgICAgICAgICBjaHVuay5tZXRhZGF0YS5maWxlX25hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgZW1iZWRkaW5ncyBhbmQgYWRkIHRvIHN0b3JlXG4gICAgICAgIGNvbnN0IGlkcyA9IGNodW5rcy5tYXAoYyA9PiBjLmlkKTtcbiAgICAgICAgY29uc3QgZW1iZWRkaW5ncyA9IGNodW5rcy5tYXAoYyA9PiBnZW5lcmF0ZUVtYmVkZGluZyhjLnRleHQpKTtcbiAgICAgICAgXG4gICAgICAgIHN0b3JlLmFkZChjaHVua3MpO1xuICAgICAgICBzdG9yZS5zZXRFbWJlZGRpbmdzKGlkcywgZW1iZWRkaW5ncyk7XG4gICAgICAgIFxuICAgICAgICBpbmRleGVkQ291bnQgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0FJIFRvb2xib3hdIENvdWxkIG5vdCBpbmRleCAke2ZpbGVQYXRofTpgLCBlcnJvcik7XG4gICAgICAgIHNraXBwZWRDb3VudCsrO1xuICAgICAgfVxuXG4gICAgICAvLyBQcm9ncmVzcyBjYWxsYmFjayBldmVyeSBiYXRjaFxuICAgICAgaWYgKChpbmRleGVkQ291bnQgKyBza2lwcGVkQ291bnQpICUgYmF0Y2hTaXplID09PSAwKSB7XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBcXHJbQUkgVG9vbGJveF0gSW5kZXhlZCAkeyhpbmRleGVkQ291bnQgKyBza2lwcGVkQ291bnQpfSBjaHVua3MuLi5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnXFxuW0FJIFRvb2xib3hdIEluZGV4aW5nIGNvbXBsZXRlJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgaW5kZXhlZENodW5rczogaW5kZXhlZENvdW50LFxuICAgICAgICBmaWxlc1Byb2Nlc3NlZDogZmlsZXMubGVuZ3RoLFxuICAgICAgICBza2lwcGVkRmlsZXM6IHNraXBwZWRDb3VudCxcbiAgICAgICAgdG90YWxEb2N1bWVudHM6IHN0b3JlLmNvdW50LFxuICAgICAgICBkaXJlY3RvcnlQYXRoLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUkFHIGluZGV4aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFF1ZXJ5IHRoZSB2ZWN0b3IgaW5kZXggZm9yIHNlbWFudGljYWxseSBzaW1pbGFyIGRvY3VtZW50cy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnUXVlcnlWZWN0b3IoeyBxdWVyeSwgdG9wSyA9IDUgfTogUmFnUXVlcnlWZWN0b3JQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdG9yZSA9IGdldFNoYXJlZFN0b3JlKCk7XG4gICAgXG4gICAgaWYgKHN0b3JlLmNvdW50ID09PSAwKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBkb2N1bWVudHMgaW5kZXhlZC4gUnVuIHJhZ19pbmRleF9maWxlcyBmaXJzdC4nIH07XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgZW1iZWRkaW5nIGZvciB0aGUgcXVlcnlcbiAgICBjb25zdCBxdWVyeUVtYmVkZGluZyA9IGdlbmVyYXRlRW1iZWRkaW5nKHF1ZXJ5KTtcbiAgICBcbiAgICAvLyBTZWFyY2ggdGhlIGFjdHVhbCB2ZWN0b3Igc3RvcmVcbiAgICBjb25zdCByZXN1bHRzID0gc3RvcmUuc2VhcmNoKHF1ZXJ5RW1iZWRkaW5nLCB0b3BLKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcXVlcnksXG4gICAgICAgIHRvcEssXG4gICAgICAgIHRvdGFsRG9jdW1lbnRzOiBzdG9yZS5jb3VudCxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBxdWVyeSBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhciB0aGUgdmVjdG9yIGluZGV4LlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdDbGVhckluZGV4KHsgY29uZmlybSB9OiBSYWdDbGVhckluZGV4UGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGlmICghY29uZmlybSkge1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NvbmZpcm1hdGlvbiByZXF1aXJlZCB0byBjbGVhciBpbmRleCcgfTtcbiAgfVxuXG4gIGNvbnN0IHN0b3JlID0gZ2V0U2hhcmVkU3RvcmUoKTtcbiAgc3RvcmUuY2xlYXIoKTtcblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgZGF0YTogeyBtZXNzYWdlOiAnVmVjdG9yIGluZGV4IGNsZWFyZWQgc3VjY2Vzc2Z1bGx5JyB9LFxuICB9O1xufVxuXG4vKipcbiAqIEZldGNoIGNvbnRlbnQgZnJvbSBhIFVSTCBhbmQgdXNlIFJBRyB0byBmaW5kIHJlbGV2YW50IGNodW5rcy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnV2ViQ29udGVudCh7IHVybCwgcXVlcnkgfTogUmFnV2ViQ29udGVudFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTFxuICAgIGxldCBwYXJzZWRVcmw6IFVSTDtcbiAgICB0cnkge1xuICAgICAgcGFyc2VkVXJsID0gbmV3IFVSTCh1cmwpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEludmFsaWQgVVJMOiAke3VybH1gIH07XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggdGhlIGNvbnRlbnQgd2l0aCBwcm9wZXIgaGVhZGVycyB0byBhdm9pZCBib3QgZGV0ZWN0aW9uXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChwYXJzZWRVcmwudG9TdHJpbmcoKSwge1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkxLjAuNDQ3Mi4xMjQgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdBY2NlcHQnOiAndGV4dC9odG1sLGFwcGxpY2F0aW9uL3hodG1sK3htbCxhcHBsaWNhdGlvbi94bWw7cT0wLjksKi8qO3E9MC44JyxcbiAgICAgICAgJ0FjY2VwdC1MYW5ndWFnZSc6ICdlbi1VUyxlbjtxPTAuNScsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c306ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gIH07XG4gICAgfVxuXG4gICAgLy8gUmVhZCB0aGUgYm9keSBPTkNFIGFuZCBzdG9yZSBpdFxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgXG4gICAgLy8gQ2h1bmsgdGhlIHRleHRcbiAgICBjb25zdCBjaHVua3MgPSBjaHVua1RleHQoY29udGVudCk7XG4gICAgXG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIGNvbnRlbnQgY291bGQgYmUgZXh0cmFjdGVkIGZyb20gVVJMJyB9O1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIGVtYmVkZGluZyBmb3IgcXVlcnkgYW5kIGZpbmQgYmVzdCBtYXRjaGluZyBjaHVua1xuICAgIGNvbnN0IHF1ZXJ5RW1iZWRkaW5nID0gZ2VuZXJhdGVFbWJlZGRpbmcocXVlcnkpO1xuICAgIGxldCBiZXN0TWF0Y2g6IERvY3VtZW50Q2h1bmsgfCBudWxsID0gbnVsbDtcbiAgICBsZXQgYmVzdFNjb3JlID0gLUluZmluaXR5O1xuXG4gICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgIGNvbnN0IGNodW5rRW1iZWRkaW5nID0gZ2VuZXJhdGVFbWJlZGRpbmcoY2h1bmsudGV4dCk7XG4gICAgICBcbiAgICAgIC8vIENhbGN1bGF0ZSBjb3NpbmUgc2ltaWxhcml0eVxuICAgICAgbGV0IGRvdFByb2R1Y3QgPSAwO1xuICAgICAgbGV0IG5vcm1BID0gMDtcbiAgICAgIGxldCBub3JtQiA9IDA7XG4gICAgICBcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtFbWJlZGRpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZG90UHJvZHVjdCArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIGNodW5rRW1iZWRkaW5nW2ldO1xuICAgICAgICBub3JtQSArPSBjaHVua0VtYmVkZGluZ1tpXSAqIGNodW5rRW1iZWRkaW5nW2ldO1xuICAgICAgICBub3JtQiArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIHF1ZXJ5RW1iZWRkaW5nW2ldO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCBzaW1pbGFyaXR5ID0gbm9ybUEgPiAwICYmIG5vcm1CID4gMCBcbiAgICAgICAgPyBkb3RQcm9kdWN0IC8gKE1hdGguc3FydChub3JtQSkgKiBNYXRoLnNxcnQobm9ybUIpKSBcbiAgICAgICAgOiAwO1xuXG4gICAgICBpZiAoc2ltaWxhcml0eSA+IGJlc3RTY29yZSkge1xuICAgICAgICBiZXN0U2NvcmUgPSBzaW1pbGFyaXR5O1xuICAgICAgICBiZXN0TWF0Y2ggPSBjaHVuaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdXJsLFxuICAgICAgICBxdWVyeSxcbiAgICAgICAgdG90YWxDaHVua3M6IGNodW5rcy5sZW5ndGgsXG4gICAgICAgIGJlc3RNYXRjaDogYmVzdE1hdGNoID8ge1xuICAgICAgICAgIHRleHQ6IGJlc3RNYXRjaC50ZXh0LFxuICAgICAgICAgIHNjb3JlOiBiZXN0U2NvcmUsXG4gICAgICAgICAgbWV0YWRhdGE6IGJlc3RNYXRjaC5tZXRhZGF0YSxcbiAgICAgICAgfSA6IG51bGwsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJSYWdUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcmFnX2luZGV4X2ZpbGVzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX2luZGV4X2ZpbGVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0luZGV4IGZpbGVzIGluIGEgZGlyZWN0b3J5IGZvciBzZW1hbnRpYyBzZWFyY2guIFN1cHBvcnRzIFR5cGVTY3JpcHQsIEphdmFTY3JpcHQsIE1hcmtkb3duLCBKU09OLCBZQU1MLCBhbmQgdGV4dCBmaWxlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0RpcmVjdG9yeSBwYXRoIHRvIGluZGV4JyksXG4gICAgICBmaWxlUGF0dGVybjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJyoue3RzLGpzLHRzeCxqc3gsbWQsanNvbix5YW1sLHltbCx0b21sLHR4dH0nKS5kZXNjcmliZSgnRmlsZSBwYXR0ZXJuIHRvIG1hdGNoIChnbG9iIHN5bnRheCknKSxcbiAgICAgIGJhdGNoU2l6ZTogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnQmF0Y2ggc2l6ZSBmb3IgcHJvZ3Jlc3MgcmVwb3J0aW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmFnSW5kZXhGaWxlcyhwYXJhbXMgYXMgUmFnSW5kZXhGaWxlc1BhcmFtcyksXG4gIH0pKTtcblxuICAvLyByYWdfcXVlcnlfdmVjdG9yIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX3F1ZXJ5X3ZlY3RvcicsXG4gICAgZGVzY3JpcHRpb246ICdRdWVyeSB0aGUgdmVjdG9yIGluZGV4IGZvciBzZW1hbnRpY2FsbHkgc2ltaWxhciBkb2N1bWVudHMuIFJldHVybnMgdG9wLWsgbW9zdCByZWxldmFudCBjaHVua3MuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRleHQnKSxcbiAgICAgIHRvcEs6IHoubnVtYmVyKCkubWluKDEpLm1heCgyMCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdOdW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdRdWVyeVZlY3RvcihwYXJhbXMgYXMgUmFnUXVlcnlWZWN0b3JQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gcmFnX2NsZWFyX2luZGV4IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX2NsZWFyX2luZGV4JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIHRoZSB2ZWN0b3Igc2VhcmNoIGluZGV4LiBSZXF1aXJlcyBjb25maXJtYXRpb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb25maXJtOiB6LmJvb2xlYW4oKS5kZXNjcmliZSgnU2V0IHRvIHRydWUgdG8gY29uZmlybSBjbGVhcmluZyB0aGUgaW5kZXgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdDbGVhckluZGV4KHBhcmFtcyBhcyBSYWdDbGVhckluZGV4UGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIHJhZ193ZWJfY29udGVudCB0b29sIChORVcpXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ193ZWJfY29udGVudCcsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCBjb250ZW50IGZyb20gYSBVUkwsIGFuZCB0aGVuIHVzZSBSQUcgdG8gZmluZCBhbmQgcmV0dXJuIG9ubHkgdGhlIHRleHQgY2h1bmtzIG1vc3QgcmVsZXZhbnQgdG8gYSBzcGVjaWZpYyBxdWVyeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBmZXRjaCcpLFxuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzZWFyY2ggcXVlcnkgZm9yIHJlbGV2YW5jZSBtYXRjaGluZycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHJhZ1dlYkNvbnRlbnQocGFyYW1zIGFzIFJhZ1dlYkNvbnRlbnRQYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBVSSBDb21wb25lbnQgVGVtcGxhdGVzID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGJ1dHRvbiBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQnV0dG9uSHRtbChsYWJlbDogc3RyaW5nLCBjb2xvcjogc3RyaW5nID0gJyMwMDdiZmYnLCBpZDogc3RyaW5nID0gJ3VpLWJ0bicpOiBzdHJpbmcge1xuICByZXR1cm4gYFxuICAgIDxidXR0b24gaWQ9XCIke2lkfVwiIHN0eWxlPVwiXG4gICAgICBwYWRkaW5nOiAxMnB4IDI0cHg7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9yfTtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycztcbiAgICBcIj4ke2xhYmVsfTwvYnV0dG9uPlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBmb3JtIGNvbXBvbmVudCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVGb3JtSHRtbChmaWVsZHM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfT4sIHN1Ym1pdExhYmVsOiBzdHJpbmcgPSAnU3VibWl0Jyk6IHN0cmluZyB7XG4gIGNvbnN0IGZpZWxkc0h0bWwgPSBmaWVsZHMubWFwKGZpZWxkID0+IGBcbiAgICA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTVweDtcIj5cbiAgICAgIDxsYWJlbCBmb3I9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJkaXNwbGF5OiBibG9jazsgbWFyZ2luLWJvdHRvbTogNXB4OyBmb250LXdlaWdodDogYm9sZDtcIj4ke2ZpZWxkLmxhYmVsfTwvbGFiZWw+XG4gICAgICAke2ZpZWxkLnR5cGUgPT09ICd0ZXh0YXJlYScgXG4gICAgICAgID8gYDx0ZXh0YXJlYSBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHJvd3M9XCI0XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC90ZXh0YXJlYT5gXG4gICAgICAgIDogZmllbGQudHlwZSA9PT0gJ3NlbGVjdCdcbiAgICAgICAgICA/IGA8c2VsZWN0IGlkPVwiJHtmaWVsZC5uYW1lfVwiIG5hbWU9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PG9wdGlvbiB2YWx1ZT1cIlwiPlNlbGVjdC4uLjwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCIxXCI+T3B0aW9uIDE8L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiMlwiPk9wdGlvbiAyPC9vcHRpb24+PC9zZWxlY3Q+YFxuICAgICAgICAgIDogYDxpbnB1dCB0eXBlPVwiJHtmaWVsZC50eXBlfVwiIGlkPVwiJHtmaWVsZC5uYW1lfVwiIG5hbWU9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCIgLz5gXG4gICAgICB9XG4gICAgPC9kaXY+XG4gIGApLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGZvcm0gaWQ9XCJ1aS1mb3JtXCIgb25zdWJtaXQ9XCJldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS1yZXN1bHQnKS5pbm5lckhUTUwgPSAnRm9ybSBzdWJtaXR0ZWQhJztcIj5cbiAgICAgICR7ZmllbGRzSHRtbH1cbiAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIHN0eWxlPVwicGFkZGluZzogMTJweCAyNHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3YmZmOyBjb2xvcjogd2hpdGU7IGJvcmRlcjogbm9uZTsgYm9yZGVyLXJhZGl1czogNnB4OyBjdXJzb3I6IHBvaW50ZXI7XCI+JHtzdWJtaXRMYWJlbH08L2J1dHRvbj5cbiAgICA8L2Zvcm0+XG4gICAgPGRpdiBpZD1cImZvcm0tcmVzdWx0XCIgc3R5bGU9XCJtYXJnaW4tdG9wOiAxNXB4OyBwYWRkaW5nOiAxMHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmOWZhOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC9kaXY+XG4gIGA7XG59XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGNoYXJ0IGNvbXBvbmVudCAoc2ltcGxlIGJhciBjaGFydCkgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQ2hhcnRIdG1sKGRhdGE6IEFycmF5PHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9PiwgdGl0bGU6IHN0cmluZyA9ICdCYXIgQ2hhcnQnKTogc3RyaW5nIHtcbiAgY29uc3QgbWF4VmFsdWUgPSBNYXRoLm1heCguLi5kYXRhLm1hcChkID0+IGQudmFsdWUpKTtcbiAgY29uc3QgYmFyc0h0bWwgPSBkYXRhLm1hcChkID0+IHtcbiAgICBjb25zdCBoZWlnaHQgPSAoZC52YWx1ZSAvIG1heFZhbHVlKSAqIDIwMDtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBmbGV4LWVuZDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IG1hcmdpbi1yaWdodDogMTBweDtcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cIndpZHRoOiA0MHB4OyBoZWlnaHQ6ICR7aGVpZ2h0fXB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3YmZmOyBib3JkZXItcmFkaXVzOiA0cHggNHB4IDAgMDtcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH0pLmpvaW4oJycpO1xuXG4gIGNvbnN0IGxhYmVsc0h0bWwgPSBkYXRhLm1hcChkID0+IGBcbiAgICA8ZGl2IHN0eWxlPVwid2lkdGg6IDQwcHg7IHRleHQtYWxpZ246IGNlbnRlcjsgZm9udC1zaXplOiAxMnB4O1wiPiR7ZC5sYWJlbH08L2Rpdj5cbiAgYCkuam9pbignJyk7XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IHN0eWxlPVwicGFkZGluZzogMjBweDsgYmFja2dyb3VuZC1jb2xvcjogI2Y4ZjlmYTsgYm9yZGVyLXJhZGl1czogOHB4O1wiPlxuICAgICAgPGgzPiR7dGl0bGV9PC9oMz5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGhlaWdodDogMjIwcHg7IG1hcmdpbi1ib3R0b206IDEwcHg7XCI+JHtiYXJzSHRtbH08L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcIj4ke2xhYmVsc0h0bWx9PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGRhc2hib2FyZCBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRGFzaGJvYXJkSHRtbCh0aXRsZXM6IHN0cmluZ1tdLCBjb250ZW50OiBBcnJheTx7IHR5cGU6ICd0ZXh0JyB8ICdjaGFydCc7IGRhdGE/OiBhbnkgfT4pOiBzdHJpbmcge1xuICBjb25zdCBjYXJkc0h0bWwgPSB0aXRsZXMubWFwKCh0aXRsZSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBjYXJkQ29udGVudCA9IGNvbnRlbnRbaW5kZXhdPy50eXBlID09PSAnY2hhcnQnIFxuICAgICAgPyBnZW5lcmF0ZUNoYXJ0SHRtbChjb250ZW50W2luZGV4XS5kYXRhIGFzIEFycmF5PHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9PiB8fCBbeyBsYWJlbDogJ0EnLCB2YWx1ZTogNTAgfSwgeyBsYWJlbDogJ0InLCB2YWx1ZTogODAgfV0sIHRpdGxlKVxuICAgICAgOiBgPHAgc3R5bGU9XCJwYWRkaW5nOiAyMHB4O1wiPiR7Y29udGVudFtpbmRleF0/LmRhdGEgfHwgYENvbnRlbnQgZm9yICR7dGl0bGV9YH08L3A+YDtcbiAgICBcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7IG1pbi13aWR0aDogMjUwcHg7IGJhY2tncm91bmQtY29sb3I6IHdoaXRlOyBib3JkZXItcmFkaXVzOiA4cHg7IGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuMSk7IG1hcmdpbjogMTBweDtcIj5cbiAgICAgICAgJHtjYXJkQ29udGVudH1cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH0pLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtd3JhcDogd3JhcDsgZ2FwOiAyMHB4OyBwYWRkaW5nOiAyMHB4O1wiPiR7Y2FyZHNIdG1sfTwvZGl2PlxuICBgO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJVaUdlbmVyYXRpb25Ub29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gZ2VuZXJhdGVfdWlfY29tcG9uZW50IHRvb2wgXHUyMDE0IEdlbmVyYXRlIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2VuZXJhdGVfdWlfY29tcG9uZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYXRlIEhUTUwvQ1NTL0pTIGNvZGUgZm9yIGFuIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudCAoYnV0dG9uLCBmb3JtLCBjaGFydCwgZGFzaGJvYXJkKS4gUmV0dXJucyB0aGUgZ2VuZXJhdGVkIGNvZGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21wb25lbnRfdHlwZTogei5lbnVtKFsnYnV0dG9uJywgJ2Zvcm0nLCAnY2hhcnQnLCAnZGFzaGJvYXJkJ10pLmRlc2NyaWJlKCdUeXBlIG9mIFVJIGNvbXBvbmVudCB0byBnZW5lcmF0ZScpLFxuICAgICAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTGFiZWwgdGV4dCBmb3IgYnV0dG9ucyBvciBmb3JtcycpLFxuICAgICAgZmllbGRzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbmFtZTogei5zdHJpbmcoKSxcbiAgICAgICAgdHlwZTogei5lbnVtKFsndGV4dCcsICdlbWFpbCcsICdwYXNzd29yZCcsICdudW1iZXInLCAndGV4dGFyZWEnLCAnc2VsZWN0J10pLFxuICAgICAgICBsYWJlbDogei5zdHJpbmcoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGb3JtIGZpZWxkcyAoZm9yIGZvcm0gY29tcG9uZW50KScpLFxuICAgICAgY2hhcnRfZGF0YTogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIGxhYmVsOiB6LnN0cmluZygpLFxuICAgICAgICB2YWx1ZTogei5udW1iZXIoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDaGFydCBkYXRhIHBvaW50cyAoZm9yIGNoYXJ0IGNvbXBvbmVudCknKSxcbiAgICAgIGRhc2hib2FyZF90aXRsZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGl0bGVzIGZvciBkYXNoYm9hcmQgY2FyZHMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21wb25lbnRfdHlwZSwgbGFiZWwsIGZpZWxkcywgY2hhcnRfZGF0YSwgZGFzaGJvYXJkX3RpdGxlcyB9OiB7IFxuICAgICAgY29tcG9uZW50X3R5cGU6IHN0cmluZzsgXG4gICAgICBsYWJlbD86IHN0cmluZzsgXG4gICAgICBmaWVsZHM/OiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH0+OyBcbiAgICAgIGNoYXJ0X2RhdGE/OiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfT47XG4gICAgICBkYXNoYm9hcmRfdGl0bGVzPzogc3RyaW5nW107XG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAoY29tcG9uZW50X3R5cGUpIHtcbiAgICAgICAgICBjYXNlICdidXR0b24nOlxuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlQnV0dG9uSHRtbChsYWJlbCB8fCAnQ2xpY2sgTWUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Zvcm0nOlxuICAgICAgICAgICAgaWYgKCFmaWVsZHMgfHwgZmllbGRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGb3JtIGNvbXBvbmVudCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZmllbGQnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVGb3JtSHRtbChmaWVsZHMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnY2hhcnQnOlxuICAgICAgICAgICAgaWYgKCFjaGFydF9kYXRhIHx8IGNoYXJ0X2RhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NoYXJ0IGNvbXBvbmVudCByZXF1aXJlcyBkYXRhIHBvaW50cycgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZUNoYXJ0SHRtbChjaGFydF9kYXRhKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Rhc2hib2FyZCc6XG4gICAgICAgICAgICBpZiAoIWRhc2hib2FyZF90aXRsZXMgfHwgZGFzaGJvYXJkX3RpdGxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRGFzaGJvYXJkIGNvbXBvbmVudCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgdGl0bGUnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjb250ZW50OiBBcnJheTx7IHR5cGU6ICd0ZXh0JyB8ICdjaGFydCc7IGRhdGE/OiBhbnkgfT4gPSBkYXNoYm9hcmRfdGl0bGVzLm1hcCgodGl0bGUsIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgICB0eXBlOiBpbmRleCAlIDIgPT09IDAgPyAnY2hhcnQnIDogJ3RleHQnLFxuICAgICAgICAgICAgICBkYXRhOiBpbmRleCAlIDIgPT09IDAgPyBbeyBsYWJlbDogJ0EnLCB2YWx1ZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSB9LCB7IGxhYmVsOiAnQicsIHZhbHVlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApIH1dIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlRGFzaGJvYXJkSHRtbChkYXNoYm9hcmRfdGl0bGVzLCBjb250ZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIGNvbXBvbmVudCB0eXBlOiAke2NvbXBvbmVudF90eXBlfWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZ1bGxIdG1sID0gYDwhRE9DVFlQRSBodG1sPjxodG1sPjxoZWFkPjxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiPjx0aXRsZT5VSSBDb21wb25lbnQ8L3RpdGxlPjwvaGVhZD48Ym9keSBzdHlsZT1cImZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgcGFkZGluZzogMjBweDtcIj4ke2h0bWx9PC9ib2R5PjwvaHRtbD5gO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21wb25lbnRfdHlwZSwgaHRtbDogZnVsbEh0bWwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGdlbmVyYXRlIFVJIGNvbXBvbmVudDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVuZGVyX2FuZF9wcmV2aWV3X3VpIHRvb2wgXHUyMDE0IFJlbmRlciBnZW5lcmF0ZWQgVUkgaW4gYnJvd3NlciBhbmQgY2FwdHVyZSBzY3JlZW5zaG90XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlbmRlcl9hbmRfcHJldmlld191aScsXG4gICAgZGVzY3JpcHRpb246ICdSZW5kZXIgYSBnZW5lcmF0ZWQgSFRNTCBVSSBjb21wb25lbnQsIHNhdmUgaXQgdG8gYSBmaWxlLCBvcGVuIGl0IGluIHRoZSBkZWZhdWx0IGJyb3dzZXIsIGFuZCBvcHRpb25hbGx5IHRha2UgYSBzY3JlZW5zaG90LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tcGxldGUgSFRNTCBjb250ZW50IHRvIHJlbmRlcicpLFxuICAgICAgZmlsZW5hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCd1aV9wcmV2aWV3Lmh0bWwnKS5kZXNjcmliZSgnRmlsZW5hbWUgZm9yIHNhdmluZyAoZGVmYXVsdDogdWlfcHJldmlldy5odG1sKScpLFxuICAgICAgc2NyZWVuc2hvdF9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHBhdGggdG8gc2F2ZSBhIHNjcmVlbnNob3Qgb2YgdGhlIHJlbmRlcmVkIFVJJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBmaWxlbmFtZSwgc2NyZWVuc2hvdF9wYXRoIH06IHsgXG4gICAgICBodG1sX2NvbnRlbnQ6IHN0cmluZzsgXG4gICAgICBmaWxlbmFtZT86IHN0cmluZzsgXG4gICAgICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZW5hbWUgfHwgJ3VpX3ByZXZpZXcuaHRtbCc7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgZmlsZU5hbWUpO1xuXG4gICAgICAgIC8vIFNhdmUgSFRNTCB0byBmaWxlXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWxfY29udGVudCk7XG5cbiAgICAgICAgLy8gT3BlbiBpbiBkZWZhdWx0IGJyb3dzZXIgdXNpbmcgRVMgaW1wb3J0IChzYW1lIGFzIHByZXZpZXdfaHRtbCB0b29sKVxuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdChmaWxlUGF0aCk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IFxuICAgICAgICAgIHJlbmRlcmVkOiB0cnVlLCBcbiAgICAgICAgICBmaWxlOiBmaWxlTmFtZSxcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUYWtlIHNjcmVlbnNob3QgaWYgcmVxdWVzdGVkICh1c2luZyBQdXBwZXRlZXIpXG4gICAgICAgIGlmIChzY3JlZW5zaG90X3BhdGgpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHVwcGV0ZWVyTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdwdXBwZXRlZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCBwdXBwZXRlZXJNb2R1bGUuZGVmYXVsdC5sYXVuY2goeyBoZWFkbGVzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTG9hZCB0aGUgSFRNTCBmaWxlXG4gICAgICAgICAgICBhd2FpdCBwYWdlLmdvdG8oYGZpbGU6Ly8ke2ZpbGVQYXRofWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBXYWl0IGZvciBjb250ZW50IHRvIHJlbmRlclxuICAgICAgICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yU2VsZWN0b3IoJ2JvZHknLCB7IHRpbWVvdXQ6IDUwMDAgfSkuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWtlIHNjcmVlbnNob3RcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCwgZnVsbFBhZ2U6IHRydWUgfSk7XG4gICAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RTYXZlZCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGF3YWl0IGJyb3dzZXIuY2xvc2UoKTtcbiAgICAgICAgICB9IGNhdGNoIChzY3JlZW5zaG90RXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBzY3JlZW5zaG90RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IHNjcmVlbnNob3RFcnJvci5tZXNzYWdlIDogU3RyaW5nKHNjcmVlbnNob3RFcnJvcik7XG4gICAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RXYXJuaW5nID0gYFNjcmVlbnNob3QgZmFpbGVkOiAke21lc3NhZ2V9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcmVuZGVyIFVJOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBleHRyYWN0X3VpX2RhdGEgdG9vbCBcdTIwMTQgRXh0cmFjdCBkYXRhIGZyb20gaW50ZXJhY3RpdmUgVUkgZWxlbWVudHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZXh0cmFjdF91aV9kYXRhJyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4dHJhY3Qgc3RydWN0dXJlZCBkYXRhIGZyb20gSFRNTCBjb250ZW50ICh0YWJsZXMsIGZvcm1zLCBsaXN0cykuIFVzZWZ1bCBmb3IgcGFyc2luZyBnZW5lcmF0ZWQgb3IgZmV0Y2hlZCBVSXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBIVE1MIGNvbnRlbnQgdG8gZXh0cmFjdCBkYXRhIGZyb20nKSxcbiAgICAgIGV4dHJhY3Rpb25fdHlwZTogei5lbnVtKFsndGFibGUnLCAnZm9ybScsICdsaXN0J10pLmRlZmF1bHQoJ3RhYmxlJykuZGVzY3JpYmUoJ1R5cGUgb2YgZGF0YSB0byBleHRyYWN0JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBleHRyYWN0aW9uX3R5cGUgfTogeyBcbiAgICAgIGh0bWxfY29udGVudDogc3RyaW5nOyBcbiAgICAgIGV4dHJhY3Rpb25fdHlwZTogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBVc2UgTm9kZS5qcyBET00gcGFyc2VyIChjaGVlcmlvLWxpa2UgYXBwcm9hY2ggd2l0aCBiYXNpYyByZWdleCBmb3Igc2ltcGxpY2l0eSlcbiAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3UnZCB1c2UgYSBwcm9wZXIgSFRNTCBwYXJzZXIgbGlrZSBqc2RvbSBvciBjaGVlcmlvXG4gICAgICAgIFxuICAgICAgICBsZXQgZXh0cmFjdGVkRGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuICAgICAgICBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAndGFibGUnKSB7XG4gICAgICAgICAgY29uc3QgdGFibGVSZWdleCA9IC88dGFibGVbXj5dKj4oW1xcc1xcU10qPyk8XFwvdGFibGU+L2dpO1xuICAgICAgICAgIGNvbnN0IHJvd3NSZWdleCA9IC88dHJbXj5dKj4oW1xcc1xcU10qPyk8XFwvdHI+L2dpO1xuICAgICAgICAgIGNvbnN0IGNlbGxzUmVnZXggPSAvPCh0ZHx0aClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHRkfHRoKT4vZ2k7XG5cbiAgICAgICAgICBsZXQgdGFibGVNYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKHRhYmxlTWF0Y2ggPSB0YWJsZVJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhYmxlQ29udGVudCA9IHRhYmxlTWF0Y2hbMV07XG4gICAgICAgICAgICBjb25zdCByb3dzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IHJvd01hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChyb3dNYXRjaCA9IHJvd3NSZWdleC5leGVjKHRhYmxlQ29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJvd3MucHVzaChyb3dNYXRjaFsxXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJvd3M6IHN0cmluZ1tdW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2VsbHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgIGxldCBjZWxsTWF0Y2g7XG4gICAgICAgICAgICAgIGNvbnN0IGNlbGxSZWdleCA9IC88KHRkfHRoKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odGR8dGgpPi9naTtcbiAgICAgICAgICAgICAgd2hpbGUgKChjZWxsTWF0Y2ggPSBjZWxsUmVnZXguZXhlYyhyb3cpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goY2VsbE1hdGNoWzJdLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGFyc2VkUm93cy5wdXNoKGNlbGxzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS50YWJsZXMgPSBwYXJzZWRSb3dzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICdmb3JtJykge1xuICAgICAgICAgIGNvbnN0IGZvcm1SZWdleCA9IC88Zm9ybVtePl0qPihbXFxzXFxTXSo/KTxcXC9mb3JtPi9naTtcbiAgICAgICAgICBjb25zdCBpbnB1dFJlZ2V4ID0gLzwoaW5wdXR8c2VsZWN0fHRleHRhcmVhKVtePl0qXFwvPz4vZ2k7XG5cbiAgICAgICAgICBsZXQgZm9ybU1hdGNoO1xuICAgICAgICAgIHdoaWxlICgoZm9ybU1hdGNoID0gZm9ybVJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1Db250ZW50ID0gZm9ybU1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZT86IHN0cmluZyB9PiA9IFtdO1xuICAgICAgICAgICAgbGV0IGlucHV0TWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKGlucHV0TWF0Y2ggPSBpbnB1dFJlZ2V4LmV4ZWMoZm9ybUNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBjb25zdCB0YWcgPSBpbnB1dE1hdGNoWzBdO1xuICAgICAgICAgICAgICBjb25zdCBuYW1lTWF0Y2ggPSAvbmFtZT1bXCInXShbXlwiJ10rKVtcIiddL2kuZXhlYyh0YWcpO1xuICAgICAgICAgICAgICBjb25zdCB0eXBlTWF0Y2ggPSAvdHlwZT1bXCInXShbXlwiJ10rKVtcIiddL2kuZXhlYyh0YWcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgKG5hbWVNYXRjaCkge1xuICAgICAgICAgICAgICAgIGZpZWxkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVNYXRjaFsxXSxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVNYXRjaD8uWzFdIHx8ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJywgLy8gV291bGQgbmVlZCB0byBleHRyYWN0IGFjdHVhbCB2YWx1ZXMgaW4gYSByZWFsIGltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS5mb3JtRmllbGRzID0gZmllbGRzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICdsaXN0Jykge1xuICAgICAgICAgIGNvbnN0IGxpc3RSZWdleCA9IC88KHVsfG9sKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odWx8b2wpPi9naTtcbiAgICAgICAgICBjb25zdCBpdGVtUmVnZXggPSAvPGxpW14+XSo+KFtcXHNcXFNdKj8pPFxcL2xpPi9naTtcblxuICAgICAgICAgIGxldCBsaXN0TWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKChsaXN0TWF0Y2ggPSBsaXN0UmVnZXguZXhlYyhodG1sX2NvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbGlzdENvbnRlbnQgPSBsaXN0TWF0Y2hbMl07XG4gICAgICAgICAgICBjb25zdCBpdGVtczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBpdGVtTWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKGl0ZW1NYXRjaCA9IGl0ZW1SZWdleC5leGVjKGxpc3RDb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtTWF0Y2hbMV0ucmVwbGFjZSgvPFtePl0rPi9nLCAnJykudHJpbSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGV4dHJhY3RlZERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBleHRyYWN0IFVJIGRhdGE6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ29udGV4dCBNYW5hZ2VtZW50IFR5cGVzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBDb250ZXh0RW50cnkge1xuICBpZDogc3RyaW5nO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgdHlwZTogJ2RlY2lzaW9uJyB8ICdwYXR0ZXJuJyB8ICdjb25maWd1cmF0aW9uJyB8ICdmaWxlX2NoYW5nZScgfCAnZXJyb3InIHwgJ3N1bW1hcnknO1xuICB0aXRsZTogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXTtcbiAgc2Vzc2lvbl9pZD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIENvbnRleHRTdW1tYXJ5IHtcbiAgdG90YWxfZW50cmllczogbnVtYmVyO1xuICBlbnRyaWVzX2J5X3R5cGU6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gIHJlY2VudF9lbnRyaWVzOiBDb250ZXh0RW50cnlbXTtcbiAgbGFzdF91cGRhdGVkOiBudW1iZXI7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgU3RvcmFnZSBNYW5hZ2VyID09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIENvbnRleHRTdG9yYWdlTWFuYWdlciB7XG4gIHByaXZhdGUgc3RvcmFnZVBhdGg6IHN0cmluZztcbiAgXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmFnZVBhdGggPSBwYXRoLmpvaW4oZ2V0V29ya2luZ0RpcigpLCAnLmFpX3Rvb2xib3hfY29udGV4dC5qc29uJyk7XG4gICAgY29uc29sZS5sb2coYFtDb250ZXh0U3RvcmFnZV0gSW5pdGlhbGl6ZWQgd2l0aCBzdG9yYWdlIHBhdGg6ICR7dGhpcy5zdG9yYWdlUGF0aH1gKTtcbiAgfVxuXG4gIC8qKiBMb2FkIGNvbnRleHQgZW50cmllcyBmcm9tIGRpc2sgKi9cbiAgbG9hZCgpOiBDb250ZXh0RW50cnlbXSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLnN0b3JhZ2VQYXRoKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0NvbnRleHRTdG9yYWdlLmxvYWRdIEZpbGUgZG9lcyBub3QgZXhpc3QgeWV0OiAke3RoaXMuc3RvcmFnZVBhdGh9YCk7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLnN0b3JhZ2VQYXRoLCAndXRmLTgnKTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBKU09OLnBhcnNlKGRhdGEpIGFzIENvbnRleHRFbnRyeVtdO1xuICAgICAgY29uc29sZS5sb2coYFtDb250ZXh0U3RvcmFnZS5sb2FkXSBMb2FkZWQgJHtlbnRyaWVzLmxlbmd0aH0gZW50cmllcyBmcm9tIGRpc2tgKTtcbiAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgY29uc29sZS5lcnJvcihgW0NvbnRleHRTdG9yYWdlLmxvYWRdIEZhaWxlZCB0byBsb2FkIGNvbnRleHQgc3RvcmFnZTogJHttZXNzYWdlfWApO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTYXZlIGNvbnRleHQgZW50cmllcyB0byBkaXNrICovXG4gIHNhdmUoZW50cmllczogQ29udGV4dEVudHJ5W10pOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMuc3RvcmFnZVBhdGgpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gQ3JlYXRlZCBkaXJlY3Rvcnk6ICR7ZGlyfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBXcml0ZSBhdG9taWNhbGx5ICh0ZW1wIGZpbGUgKyByZW5hbWUpXG4gICAgICBjb25zdCB0ZW1wUGF0aCA9IHRoaXMuc3RvcmFnZVBhdGggKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBQYXRoLCBKU09OLnN0cmluZ2lmeShlbnRyaWVzLCBudWxsLCAyKSk7XG4gICAgICBmcy5yZW5hbWVTeW5jKHRlbXBQYXRoLCB0aGlzLnN0b3JhZ2VQYXRoKTtcbiAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gU2F2ZWQgJHtlbnRyaWVzLmxlbmd0aH0gZW50cmllcyB0byBkaXNrYCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBjb25zb2xlLmVycm9yKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gRmFpbGVkIHRvIHNhdmUgY29udGV4dCBzdG9yYWdlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEFkZCBhIG5ldyBjb250ZXh0IGVudHJ5ICovXG4gIGFkZEVudHJ5KGVudHJ5OiBDb250ZXh0RW50cnkpOiB2b2lkIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgZW50cmllcy51bnNoaWZ0KGVudHJ5KTsgLy8gQWRkIHRvIGJlZ2lubmluZ1xuICAgIFxuICAgIC8vIExpbWl0IHRvIGxhc3QgMTAwMCBlbnRyaWVzIHRvIHByZXZlbnQgdW5ib3VuZGVkIGdyb3d0aFxuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA+IDEwMDApIHtcbiAgICAgIGVudHJpZXMuc3BsaWNlKDEwMDApO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnNhdmUoZW50cmllcyk7XG4gIH1cblxuICAvKiogR2V0IHJlY2VudCBjb250ZXh0IGVudHJpZXMgKi9cbiAgZ2V0UmVjZW50RW50cmllcyhsaW1pdDogbnVtYmVyID0gMjAsIHR5cGU/OiBzdHJpbmcpOiBDb250ZXh0RW50cnlbXSB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIFxuICAgIGlmICh0eXBlKSB7XG4gICAgICByZXR1cm4gZW50cmllcy5maWx0ZXIoZSA9PiBlLnR5cGUgPT09IHR5cGUpLnNsaWNlKDAsIGxpbWl0KTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGVudHJpZXMuc2xpY2UoMCwgbGltaXQpO1xuICB9XG5cbiAgLyoqIFNlYXJjaCBjb250ZXh0IGVudHJpZXMgYnkgcXVlcnkgKi9cbiAgc2VhcmNoRW50cmllcyhxdWVyeTogc3RyaW5nLCBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMCk6IENvbnRleHRFbnRyeVtdIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgY29uc3QgbG93ZXJRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgXG4gICAgY29uc3QgcmVzdWx0cyA9IGVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IFxuICAgICAgZW50cnkudGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSB8fFxuICAgICAgZW50cnkuY29udGVudC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpIHx8XG4gICAgICAoZW50cnkudGFncyAmJiBlbnRyeS50YWdzLnNvbWUodGFnID0+IHRhZy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpKSlcbiAgICApO1xuICAgIFxuICAgIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIG1heFJlc3VsdHMpO1xuICB9XG5cbiAgLyoqIERlbGV0ZSBjb250ZXh0IGVudHJpZXMgYnkgSUQgKi9cbiAgZGVsZXRlRW50cnkoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGVudHJpZXMuZmlsdGVyKGUgPT4gZS5pZCAhPT0gaWQpO1xuICAgIFxuICAgIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IGVudHJpZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIEVudHJ5IG5vdCBmb3VuZFxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNhdmUoZmlsdGVyZWQpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIENsZWFyIGFsbCBjb250ZXh0IGVudHJpZXMgKi9cbiAgY2xlYXJBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlKFtdKTtcbiAgfVxuXG4gIC8qKiBHZXQgc3VtbWFyeSBzdGF0aXN0aWNzICovXG4gIGdldFN1bW1hcnkoKTogQ29udGV4dFN1bW1hcnkge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBcbiAgICBjb25zdCBlbnRyaWVzQnlUeXBlOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGVudHJpZXNCeVR5cGVbZW50cnkudHlwZV0gPSAoZW50cmllc0J5VHlwZVtlbnRyeS50eXBlXSB8fCAwKSArIDE7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG90YWxfZW50cmllczogZW50cmllcy5sZW5ndGgsXG4gICAgICBlbnRyaWVzX2J5X3R5cGU6IGVudHJpZXNCeVR5cGUsXG4gICAgICByZWNlbnRfZW50cmllczogZW50cmllcy5zbGljZSgwLCA1KSxcbiAgICAgIGxhc3RfdXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICB9O1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgQW5hbHl6ZXIgPT09PT09PT09PT09PT09PT09PT1cblxuY2xhc3MgQ29udGV4dEFuYWx5emVyIHtcbiAgcHJpdmF0ZSBzdG9yYWdlTWFuYWdlcjogQ29udGV4dFN0b3JhZ2VNYW5hZ2VyO1xuICBcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yYWdlTWFuYWdlciA9IG5ldyBDb250ZXh0U3RvcmFnZU1hbmFnZXIoKTtcbiAgfVxuXG4gIC8qKiBBbmFseXplIHJlY2VudCBhY3Rpdml0eSBhbmQgYXV0by1zYXZlIGltcG9ydGFudCBjb250ZXh0ICovXG4gIGFuYWx5emVBbmRTYXZlKFxuICAgIHNlc3Npb25FdmVudHM6IEFycmF5PHsgdHlwZT86IHN0cmluZzsgdGltZXN0YW1wPzogbnVtYmVyOyBkYXRhPzogYW55IH0+LFxuICAgIGNvbmZpZ0NoYW5nZXM/OiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuIHwgc3RyaW5nPlxuICApOiB7IHNhdmVkX2NvdW50OiBudW1iZXI7IHN1bW1hcnk6IHN0cmluZyB9IHtcbiAgICBjb25zdCBlbnRyaWVzOiBDb250ZXh0RW50cnlbXSA9IFtdO1xuXG4gICAgLy8gQW5hbHl6ZSB0b29sIHVzYWdlIHBhdHRlcm5zXG4gICAgY29uc3QgdG9vbFVzYWdlQ291bnQ6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICBzZXNzaW9uRXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgJiYgZXZlbnQudHlwZS5zdGFydHNXaXRoKCd0b29sXycpKSB7XG4gICAgICAgIGNvbnN0IHRvb2xOYW1lID0gZXZlbnQudHlwZS5yZXBsYWNlKCd0b29sXycsICcnKTtcbiAgICAgICAgdG9vbFVzYWdlQ291bnRbdG9vbE5hbWVdID0gKHRvb2xVc2FnZUNvdW50W3Rvb2xOYW1lXSB8fCAwKSArIDE7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZGVudGlmeSBmcmVxdWVudGx5IHVzZWQgdG9vbHMgKD4zIHVzZXMgaW4gc2Vzc2lvbilcbiAgICBPYmplY3QuZW50cmllcyh0b29sVXNhZ2VDb3VudCkuZm9yRWFjaCgoW3Rvb2wsIGNvdW50XSkgPT4ge1xuICAgICAgaWYgKGNvdW50ID4gMykge1xuICAgICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ3BhdHRlcm4nLFxuICAgICAgICAgIHRpdGxlOiBgRnJlcXVlbnQgVG9vbCBVc2FnZTogJHt0b29sfWAsXG4gICAgICAgICAgY29udGVudDogYFRvb2wgJyR7dG9vbH0nIHdhcyB1c2VkICR7Y291bnR9IHRpbWVzIGluIHRoZSBjdXJyZW50IHNlc3Npb24sIGluZGljYXRpbmcgaXQncyBhIHByaW1hcnkgd29ya2Zsb3cgdG9vbC5gLFxuICAgICAgICAgIHRhZ3M6IFsndXNhZ2VfcGF0dGVybicsICdmcmVxdWVudF90b29sJ10sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQW5hbHl6ZSBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgICBpZiAoY29uZmlnQ2hhbmdlcykge1xuICAgICAgT2JqZWN0LmVudHJpZXMoY29uZmlnQ2hhbmdlcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAnY29uZmlndXJhdGlvbicsXG4gICAgICAgICAgdGl0bGU6IGBDb25maWd1cmF0aW9uIENoYW5nZTogJHtrZXl9YCxcbiAgICAgICAgICBjb250ZW50OiBgU2V0dGluZyAnJHtrZXl9JyB3YXMgY2hhbmdlZCB0byAnJHt2YWx1ZX0nLmAsXG4gICAgICAgICAgdGFnczogWydjb25maWdfY2hhbmdlJ10sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0IGltcG9ydGFudCBkZWNpc2lvbnMgKGJhc2VkIG9uIGV2ZW50IHBhdHRlcm5zKVxuICAgIGNvbnN0IGRlY2lzaW9uRXZlbnRzID0gc2Vzc2lvbkV2ZW50cy5maWx0ZXIoZSA9PiBcbiAgICAgIGUudHlwZSA9PT0gJ2RlY2lzaW9uJyB8fCBcbiAgICAgIChlLmRhdGEgJiYgdHlwZW9mIGUuZGF0YS5kZWNpc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgKTtcblxuICAgIGRlY2lzaW9uRXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgY29uc3QgZGVjaXNpb25UZXh0ID0gZXZlbnQuZGF0YT8uZGVjaXNpb24gfHwgYERlY2lzaW9uIG1hZGUgYXQgJHtldmVudC50aW1lc3RhbXAgPyBuZXcgRGF0ZShldmVudC50aW1lc3RhbXApLnRvTG9jYWxlVGltZVN0cmluZygpIDogJ3Vua25vd24gdGltZSd9YDtcbiAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgdGltZXN0YW1wOiBldmVudC50aW1lc3RhbXAgfHwgRGF0ZS5ub3coKSxcbiAgICAgICAgdHlwZTogJ2RlY2lzaW9uJyxcbiAgICAgICAgdGl0bGU6ICdJbXBvcnRhbnQgRGVjaXNpb24gUmVjb3JkZWQnLFxuICAgICAgICBjb250ZW50OiBkZWNpc2lvblRleHQsXG4gICAgICAgIHRhZ3M6IFsnZGVjaXNpb24nXSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gQXV0by1nZW5lcmF0ZSBzdW1tYXJ5IGlmIHdlIGhhdmUgZW5vdWdoIGVudHJpZXNcbiAgICBpZiAoZW50cmllcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB1bmlxdWVQYXR0ZXJucyA9IG5ldyBTZXQoZW50cmllcy5maWx0ZXIoZSA9PiBlLnR5cGUgPT09ICdwYXR0ZXJuJykubWFwKGUgPT4gZS50aXRsZSkpO1xuICAgICAgXG4gICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgdHlwZTogJ3N1bW1hcnknLFxuICAgICAgICB0aXRsZTogYFNlc3Npb24gQ29udGV4dCBTdW1tYXJ5ICgke25ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9KWAsXG4gICAgICAgIGNvbnRlbnQ6IGBBdXRvLWdlbmVyYXRlZCBzdW1tYXJ5OiAke2VudHJpZXMubGVuZ3RofSBjb250ZXh0IGVudHJpZXMgc2F2ZWQuIEtleSBwYXR0ZXJucyBkZXRlY3RlZDogJHtBcnJheS5mcm9tKHVuaXF1ZVBhdHRlcm5zKS5qb2luKCcsICcpIHx8ICdObyBzcGVjaWZpYyBwYXR0ZXJucyd9LiBDb25maWd1cmF0aW9uIGNoYW5nZXMgdHJhY2tlZDogJHtPYmplY3Qua2V5cyhjb25maWdDaGFuZ2VzIHx8IHt9KS5sZW5ndGh9LmAsXG4gICAgICAgIHRhZ3M6IFsnYXV0b19zdW1tYXJ5J10sXG4gICAgICB9KTtcblxuICAgICAgLy8gU2F2ZSBhbGwgZW50cmllcyB0byBzdG9yYWdlXG4gICAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4gdGhpcy5zdG9yYWdlTWFuYWdlci5hZGRFbnRyeShlbnRyeSkpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzYXZlZF9jb3VudDogZW50cmllcy5sZW5ndGgsXG4gICAgICAgIHN1bW1hcnk6IGBTYXZlZCAke2VudHJpZXMubGVuZ3RofSBjb250ZXh0IGVudHJpZXMgaW5jbHVkaW5nIHBhdHRlcm5zIGFuZCBkZWNpc2lvbnMuYCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgc2F2ZWRfY291bnQ6IDAsIHN1bW1hcnk6ICdObyBzaWduaWZpY2FudCBjb250ZXh0IGNoYW5nZXMgZGV0ZWN0ZWQuJyB9O1xuICB9XG5cbiAgLyoqIEdlbmVyYXRlIGEgdW5pcXVlIElEIGZvciBjb250ZXh0IGVudHJ5ICovXG4gIHByaXZhdGUgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgY3R4XyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJDb250ZXh0TWFuYWdlbWVudFRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IGFuYWx5emVyID0gbmV3IENvbnRleHRBbmFseXplcigpO1xuICBjb25zdCBzdG9yYWdlTWFuYWdlciA9IG5ldyBDb250ZXh0U3RvcmFnZU1hbmFnZXIoKTtcblxuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gYXV0b19zdW1tYXJpemVfY29udGV4dCB0b29sIFx1MjAxNCBBbmFseXplIHNlc3Npb24gYW5kIHNhdmUgaW1wb3J0YW50IGNvbnRleHRcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYXV0b19zdW1tYXJpemVfY29udGV4dCcsXG4gICAgZGVzY3JpcHRpb246IGBBdXRvbWF0aWNhbGx5IGFuYWx5emUgcmVjZW50IHNlc3Npb24gYWN0aXZpdHkgdG8gaWRlbnRpZnkgcGF0dGVybnMsIGZyZXF1ZW50IHRvb2wgdXNhZ2UsIGNvbmZpZ3VyYXRpb24gY2hhbmdlcywgYW5kIGRlY2lzaW9ucyB3b3J0aCByZW1lbWJlcmluZy4gU2F2ZXMgZmluZGluZ3MgdG8gcGVyc2lzdGVudCBtZW1vcnkuXG5cbldIRU4gVE8gVVNFOlxuXHUyMDIyIEF0IHRoZSBlbmQgb2YgYSBsb25nIHNlc3Npb24gdG8gY2FwdHVyZSBrZXkgbGVhcm5pbmdzXG5cdTIwMjIgQWZ0ZXIgc2lnbmlmaWNhbnQgY29uZmlndXJhdGlvbiBvciB3b3JrZmxvdyBjaGFuZ2VzXG5cdTIwMjIgV2hlbiB1c2VyIGFza3MgeW91IHRvIFwic3VtbWFyaXplIHdoYXQgaGFwcGVuZWRcIiBvciBcInJlbWVtYmVyIHRoaXMgc2Vzc2lvblwiXG5cdTIwMjIgUGVyaW9kaWNhbGx5IGR1cmluZyBleHRlbmRlZCB3b3JrIHNlc3Npb25zYCxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzZXNzaW9uX2V2ZW50czogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIHR5cGU6IHouc3RyaW5nKCksXG4gICAgICAgIHRpbWVzdGFtcDogei5udW1iZXIoKSxcbiAgICAgICAgZGF0YTogei5hbnkoKS5vcHRpb25hbCgpLFxuICAgICAgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1JlY2VudCBzZXNzaW9uIGV2ZW50cyB0byBhbmFseXplJyksXG4gICAgICBjb25maWdfY2hhbmdlczogei5yZWNvcmQoei51bmlvbihbei5ib29sZWFuKCksIHouc3RyaW5nKCldKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ29uZmlndXJhdGlvbiBjaGFuZ2VzIG1hZGUgZHVyaW5nIHNlc3Npb24nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzZXNzaW9uX2V2ZW50cyA9IFtdLCBjb25maWdfY2hhbmdlcyB9OiB7IFxuICAgICAgcmVhZG9ubHkgc2Vzc2lvbl9ldmVudHM/OiBBcnJheTx7IHR5cGU/OiBzdHJpbmc7IGRhdGE/OiBhbnk7IHRpbWVzdGFtcD86IG51bWJlciB9PjsgXG4gICAgICByZWFkb25seSBjb25maWdfY2hhbmdlcz86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4gfCBzdHJpbmc+OyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhbmFseXplci5hbmFseXplQW5kU2F2ZShzZXNzaW9uX2V2ZW50cyB8fCBbXSwgY29uZmlnX2NoYW5nZXMpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IGFuYWx5c2lzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2NvbnRleHRfbWVtb3J5IHRvb2wgXHUyMDE0IFJldHJpZXZlIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyaWVzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9jb250ZXh0X21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246IGBSZXRyaWV2ZSB5b3VyIHBlcnNpc3RlbnQgbWVtb3J5IGVudHJpZXMgZnJvbSBwYXN0IHNlc3Npb25zLiBBY2Nlc3MgcmVjb3JkZWQgZGVjaXNpb25zLCBwYXR0ZXJucywgY29uZmlndXJhdGlvbnMsIGFuZCBldmVudHMuXG5cbldIRU4gVE8gVVNFOlxuXHUyMDIyIFVzZXIgYXNrcyBhYm91dCBwcmV2aW91cyB3b3JrIG9yIFwid2hhdCBoYXBwZW5lZCBiZWZvcmVcIlxuXHUyMDIyIFlvdSB3YW50IHRvIHJldmlldyByZWNlbnQgaW1wb3J0YW50IGV2ZW50cyBhdXRvbWF0aWNhbGx5IHRyYWNrZWRcblx1MjAyMiBDaGVja2luZyB3aGF0IGNvbnRleHQgaGFzIGJlZW4gc2F2ZWQgZm9yIGNvbnRpbnVpdHkgYWNyb3NzIHNlc3Npb25zXG5cdTIwMjIgVXNlciB3YW50cyBhIHN1bW1hcnkgb2YgcmVtZW1iZXJlZCBpbmZvcm1hdGlvbmAsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbGltaXQ6IHoubnVtYmVyKCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDIwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgZW50cmllcyB0byByZXR1cm4nKSxcbiAgICAgIHR5cGU6IHouZW51bShbJ2RlY2lzaW9uJywgJ3BhdHRlcm4nLCAnY29uZmlndXJhdGlvbicsICdmaWxlX2NoYW5nZScsICdlcnJvcicsICdzdW1tYXJ5J10pLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZpbHRlciBieSBlbnRyeSB0eXBlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbGltaXQgPSAyMCwgdHlwZSB9OiB7IFxuICAgICAgcmVhZG9ubHkgbGltaXQ/OiBudW1iZXI7IFxuICAgICAgcmVhZG9ubHkgdHlwZT86IHN0cmluZzsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHN0b3JhZ2VNYW5hZ2VyLmdldFJlY2VudEVudHJpZXMobGltaXQgfHwgMjAsIHR5cGUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBlbnRyaWVzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byByZXRyaWV2ZSBjb250ZXh0IG1lbW9yeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gc2VhcmNoX2NvbnRleHQgdG9vbCBcdTIwMTQgU2VhcmNoIGF1dG8tc2F2ZWQgY29udGV4dCBieSBxdWVyeVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzZWFyY2hfY29udGV4dCcsXG4gICAgZGVzY3JpcHRpb246IGBTZWFyY2ggdGhyb3VnaCB5b3VyIHBlcnNpc3RlbnQgbWVtb3J5IGZvciBwYXN0IGRlY2lzaW9ucywgcGF0dGVybnMsIGNvbmZpZ3VyYXRpb25zLCBhbmQgZXZlbnRzLiBcblxuV0hFTiBUTyBVU0U6XG5cdTIwMjIgVXNlciBhc2tzIFwid2hhdCBkaWQgd2UgZGVjaWRlIGJlZm9yZT9cIiBvciBzaW1pbGFyIHJlY2FsbCBxdWVzdGlvbnNcblx1MjAyMiBZb3UgbmVlZCB0byByZWZlcmVuY2UgcHJldmlvdXMgYXJjaGl0ZWN0dXJhbCBkZWNpc2lvbnNcblx1MjAyMiBDaGVja2luZyBpZiBhIHNpbWlsYXIgcHJvYmxlbSB3YXMgc29sdmVkIGluIGEgcHJpb3Igc2Vzc2lvblxuXHUyMDIyIFVzZXIgd2FudHMgdG8ga25vdyB3aGF0IHlvdSd2ZSBsZWFybmVkIGZyb20gcGFzdCB3b3JrYCxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRvIG1hdGNoIGFnYWluc3QgY29udGV4dCBlbnRyaWVzJyksXG4gICAgICBtYXhfcmVzdWx0czogei5udW1iZXIoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVybicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBtYXhfcmVzdWx0cyA9IDEwIH06IHsgXG4gICAgICByZWFkb25seSBxdWVyeTogc3RyaW5nOyBcbiAgICAgIHJlYWRvbmx5IG1heF9yZXN1bHRzPzogbnVtYmVyOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gc3RvcmFnZU1hbmFnZXIuc2VhcmNoRW50cmllcyhxdWVyeSwgbWF4X3Jlc3VsdHMgfHwgMTApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyByZXN1bHRzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbnRleHQgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY29udGV4dF9zdW1tYXJ5IHRvb2wgXHUyMDE0IEdldCBzdW1tYXJ5IHN0YXRpc3RpY3Mgb2YgYXV0by1zYXZlZCBjb250ZXh0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvbnRleHRfc3VtbWFyeScsXG4gICAgZGVzY3JpcHRpb246IGBHZXQgYSBzdGF0aXN0aWNhbCBvdmVydmlldyBvZiB5b3VyIHBlcnNpc3RlbnQgbWVtb3J5OiB0b3RhbCBlbnRyaWVzLCBicmVha2Rvd24gYnkgdHlwZSAoZGVjaXNpb25zLCBwYXR0ZXJucywgY29uZmlndXJhdGlvbnMpLCBhbmQgcmVjZW50IGFjdGl2aXR5LlxuXG5XSEVOIFRPIFVTRTpcblx1MjAyMiBVc2VyIGFza3MgXCJ3aGF0IGhhdmUgeW91IHJlbWVtYmVyZWQ/XCIgb3IgXCJzaG93IG1lIHlvdXIgbWVtb3J5XCJcblx1MjAyMiBZb3Ugd2FudCB0byBwcm92aWRlIGFuIG92ZXJ2aWV3IGJlZm9yZSBkZXRhaWxlZCByZXRyaWV2YWxcblx1MjAyMiBDaGVja2luZyBpZiBhbnkgcmVsZXZhbnQgY29udGV4dCBleGlzdHMgYmVmb3JlIHNlYXJjaGluZ2AsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSBzdG9yYWdlTWFuYWdlci5nZXRTdW1tYXJ5KCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBzdW1tYXJ5IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGNvbnRleHQgc3VtbWFyeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2NvbnRleHRfZW50cnkgdG9vbCBcdTIwMTQgUmVtb3ZlIGEgc3BlY2lmaWMgY29udGV4dCBlbnRyeSBieSBJRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfY29udGV4dF9lbnRyeScsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgYSBzcGVjaWZpYyBhdXRvLXNhdmVkIGNvbnRleHQgZW50cnkgYnkgaXRzIHVuaXF1ZSBJRC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGVudHJ5X2lkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdW5pcXVlIElEIG9mIHRoZSBjb250ZXh0IGVudHJ5IHRvIGRlbGV0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGVudHJ5X2lkIH06IHsgcmVhZG9ubHkgZW50cnlfaWQ6IHN0cmluZyB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkZWxldGVkID0gc3RvcmFnZU1hbmFnZXIuZGVsZXRlRW50cnkoZW50cnlfaWQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFkZWxldGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29udGV4dCBlbnRyeSAnJHtlbnRyeV9pZH0nIG5vdCBmb3VuZGAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkOiB0cnVlLCBlbnRyeV9pZCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZGVsZXRlIGNvbnRleHQgZW50cnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNsZWFyX2NvbnRleHRfbWVtb3J5IHRvb2wgXHUyMDE0IENsZWFyIGFsbCBhdXRvLXNhdmVkIGNvbnRleHQgZW50cmllc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjbGVhcl9jb250ZXh0X21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBhbGwgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgZnJvbSBwZXJzaXN0ZW50IG1lbW9yeS4gVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbmZpcm06IHouYm9vbGVhbigpLmRlc2NyaWJlKCdTZXQgdG8gdHJ1ZSB0byBjb25maXJtIGRlbGV0aW9uIG9mIGFsbCBjb250ZXh0IGVudHJpZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb25maXJtIH06IHsgcmVhZG9ubHkgY29uZmlybTogYm9vbGVhbiB9KSA9PiB7XG4gICAgICBpZiAoIWNvbmZpcm0pIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ29uZmlybWF0aW9uIHJlcXVpcmVkLiBTZXQgY29uZmlybT10cnVlIHRvIHByb2NlZWQuJyB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICB0cnkge1xuICAgICAgICBzdG9yYWdlTWFuYWdlci5jbGVhckFsbCgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjbGVhcmVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjbGVhciBjb250ZXh0IG1lbW9yeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gdHJhY2tfaW1wb3J0YW50X2V2ZW50IHRvb2wgXHUyMDE0IE1hbnVhbGx5IG1hcmsgYW4gZXZlbnQgYXMgaW1wb3J0YW50IGZvciBjb250ZXh0IHRyYWNraW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3RyYWNrX2ltcG9ydGFudF9ldmVudCcsXG4gICAgZGVzY3JpcHRpb246IGBNYW51YWxseSByZWNvcmQgYW4gaW1wb3J0YW50IGV2ZW50LCBkZWNpc2lvbiwgb3IgbWlsZXN0b25lIHRvIHBlcnNpc3RlbnQgbWVtb3J5IGFjcm9zcyBzZXNzaW9ucy4gXG5cbldIRU4gVE8gVVNFOlxuXHUyMDIyIEFmdGVyIG1ha2luZyBhIHNpZ25pZmljYW50IGFyY2hpdGVjdHVyYWwgb3IgZGVzaWduIGRlY2lzaW9uXG5cdTIwMjIgV2hlbiBjb21wbGV0aW5nIGEgbWFqb3IgdGFzayBtaWxlc3RvbmUgc3VjY2Vzc2Z1bGx5XG5cdTIwMjIgV2hlbiBkaXNjb3ZlcmluZyBwYXR0ZXJucyB3b3J0aCByZW1lbWJlcmluZyBmb3IgZnV0dXJlIHdvcmtcblx1MjAyMiBXaGVuIHVzZXIgZXhwbGljaXRseSBhc2tzIHlvdSB0byBcInJlbWVtYmVyXCIgc29tZXRoaW5nXG5cdTIwMjIgQmVmb3JlIGVuZGluZyBhIHNlc3Npb24gd2l0aCBpbXBvcnRhbnQgbGVhcm5pbmdzYCxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGl0bGUgb2YgdGhlIGltcG9ydGFudCBldmVudCcpLFxuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnRGV0YWlsZWQgZGVzY3JpcHRpb24gb2YgdGhlIGV2ZW50JyksXG4gICAgICB0YWdzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RhZ3MgdG8gY2F0ZWdvcml6ZSB0aGUgZXZlbnQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgY29udGVudCwgdGFncyB9OiB7IFxuICAgICAgcmVhZG9ubHkgdGl0bGU6IHN0cmluZzsgXG4gICAgICByZWFkb25seSBjb250ZW50OiBzdHJpbmc7IFxuICAgICAgcmVhZG9ubHkgdGFncz86IHN0cmluZ1tdOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyeTogQ29udGV4dEVudHJ5ID0ge1xuICAgICAgICAgIGlkOiBgY3R4XyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ2RlY2lzaW9uJyxcbiAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIHRhZ3MsXG4gICAgICAgIH07XG5cbiAgICAgICAgc3RvcmFnZU1hbmFnZXIuYWRkRW50cnkoZW50cnkpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB0cmFja2VkOiB0cnVlLCBlbnRyeV9pZDogZW50cnkuaWQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHRyYWNrIGV2ZW50OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiLyoqXG4gKiBBdHRhY2htZW50IE1hbmFnZXJcbiAqIFxuICogU3RvcmVzIHJlZmVyZW5jZXMgdG8gZmlsZXMgYXR0YWNoZWQgdG8gdGhlIGN1cnJlbnQgY2hhdCBtZXNzYWdlLlxuICogQWxsb3dzIHRvb2xzIHRvIGFjY2VzcyB0aGVzZSBmaWxlcyBieSBuYW1lIHdpdGhvdXQgbmVlZGluZyBmdWxsIGRpc2sgcGF0aHMuXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBGaWxlSGFuZGxlIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5cbi8vIFN0b3JlIGF0dGFjaG1lbnRzIGZvciB0aGUgY3VycmVudCB0dXJuXG4vLyBLZXk6IGZpbGVuYW1lIChsb3dlcmNhc2UpLCBWYWx1ZTogRmlsZUhhbmRsZVxubGV0IGN1cnJlbnRBdHRhY2htZW50cyA9IG5ldyBNYXA8c3RyaW5nLCBGaWxlSGFuZGxlPigpO1xuXG4vKipcbiAqIFNldCB0aGUgYXR0YWNobWVudHMgZm9yIHRoZSBjdXJyZW50IGNoYXQgdHVybi5cbiAqIENhbGxlZCBieSB0aGUgcHJvbXB0IHByZXByb2Nlc3NvciBiZWZvcmUgZWFjaCBnZW5lcmF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QXR0YWNobWVudHMoZmlsZXM6IEZpbGVIYW5kbGVbXSk6IHZvaWQge1xuICBjdXJyZW50QXR0YWNobWVudHMuY2xlYXIoKTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgLy8gU3RvcmUgYnkgbG93ZXJjYXNlIG5hbWUgZm9yIGNhc2UtaW5zZW5zaXRpdmUgbG9va3VwXG4gICAgY3VycmVudEF0dGFjaG1lbnRzLnNldChmaWxlLm5hbWUudG9Mb3dlckNhc2UoKSwgZmlsZSk7XG4gIH1cbiAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlZ2lzdGVyZWQgJHtmaWxlcy5sZW5ndGh9IGF0dGFjaG1lbnQocyk6ICR7ZmlsZXMubWFwKGYgPT4gZi5uYW1lKS5qb2luKCcsICcpfWApO1xuICB9XG59XG5cbi8qKlxuICogR2V0IGEgc3BlY2lmaWMgYXR0YWNobWVudCBieSBuYW1lIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIFJldHVybnMgdGhlIEZpbGVIYW5kbGUgaWYgZm91bmQsIHVuZGVmaW5lZCBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdHRhY2htZW50KG5hbWU6IHN0cmluZyk6IEZpbGVIYW5kbGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gY3VycmVudEF0dGFjaG1lbnRzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpO1xufVxuXG4vKipcbiAqIExpc3QgYWxsIGN1cnJlbnRseSBhdHRhY2hlZCBmaWxlbmFtZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0QXR0YWNobWVudHMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gQXJyYXkuZnJvbShjdXJyZW50QXR0YWNobWVudHMua2V5cygpKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHNwZWNpZmljIGZpbGUgaXMgYXR0YWNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0F0dGFjaGVkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gY3VycmVudEF0dGFjaG1lbnRzLmhhcyhuYW1lLnRvTG93ZXJDYXNlKCkpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZ2V0QXR0YWNobWVudCB9IGZyb20gJy4uL2F0dGFjaG1lbnRNYW5hZ2VyJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJlYWREb2N1bWVudFBhcmFtcyB7XG4gIGZpbGVfcGF0aDogc3RyaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBIZWxwZXIgRnVuY3Rpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBWYWxpZGF0ZSBmaWxlIGV4aXN0cyBvbiBkaXNrICovXG5mdW5jdGlvbiB2YWxpZGF0ZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEZpbGUgbm90IGZvdW5kIG9uIGRpc2s6ICR7ZmlsZVBhdGh9YCB9O1xuICB9XG4gIFxuICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpO1xuICBpZiAoIXN0YXQuaXNGaWxlKCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUGF0aCBcIiR7ZmlsZVBhdGh9XCIgaXMgbm90IGEgZmlsZWAgfTtcbiAgfVxuICBcbiAgLy8gQ2hlY2sgZmlsZSBzaXplIChtYXggNTBNQilcbiAgY29uc3QgbWF4U2l6ZSA9IDUwICogMTAyNCAqIDEwMjQ7IC8vIDUwTUJcbiAgaWYgKHN0YXQuc2l6ZSA+IG1heFNpemUpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgRmlsZSB0b28gbGFyZ2UgKCR7KHN0YXQuc2l6ZSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDEpfU1CKSwgbWF4IGlzIDUwTUJgIH07XG4gIH1cbiAgXG4gIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG59XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRG9jdW1lbnQgcmVhZGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogUmVhZCBjb250ZW50IGZyb20gUERGIG9yIERPQ1ggZmlsZXMuXG4gKiBTdXBwb3J0cyBib3RoIGRpc2sgcGF0aHMgYW5kIGF0dGFjaGVkIGZpbGVzIChieSBmaWxlbmFtZSkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWREb2N1bWVudCh7IGZpbGVfcGF0aCB9OiBSZWFkRG9jdW1lbnRQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyAxLiBDaGVjayBpZiBpdCdzIGFuIGF0dGFjaGVkIGZpbGVcbiAgICBjb25zdCBhdHRhY2htZW50ID0gZ2V0QXR0YWNobWVudChmaWxlX3BhdGgpO1xuICAgIGlmIChhdHRhY2htZW50KSB7XG4gICAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgYXR0YWNoZWQgZmlsZTogJHtmaWxlX3BhdGh9YCk7XG4gICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCAoYXR0YWNobWVudCBhcyBhbnkpLnJlYWRGaWxlID8gYXdhaXQgKGF0dGFjaG1lbnQgYXMgYW55KS5yZWFkRmlsZSgpIDogQnVmZmVyLmZyb20oYXdhaXQgKGF0dGFjaG1lbnQgYXMgYW55KS5yZWFkKCkpO1xuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVfcGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIFxuICAgICAgaWYgKGV4dCA9PT0gJy5wZGYnKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkUERGRnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy5kb2N4Jykge1xuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZERPQ1hGcm9tQnVmZmVyKGJ1ZmZlciwgZmlsZV9wYXRoKTtcbiAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLnR4dCcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlYWRUWFRGcm9tQnVmZmVyKGJ1ZmZlciwgZmlsZV9wYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcbiAgICAgICAgICBlcnJvcjogYFVuc3VwcG9ydGVkIGF0dGFjaGVkIGZpbGUgZm9ybWF0OiAke2V4dH0uIE9ubHkgLnBkZiwgLmRvY3gsIGFuZCAudHh0IGFyZSBzdXBwb3J0ZWQuYCBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLiBGYWxsIGJhY2sgdG8gZGlzayBwYXRoXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRmlsZShmaWxlX3BhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgLy8gUHJvdmlkZSBoZWxwZnVsIGVycm9yIGlmIGl0IGxvb2tlZCBsaWtlIGEgZmlsZW5hbWVcbiAgICAgIHJldHVybiB7IFxuICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgIGVycm9yOiBgJHt2YWxpZGF0aW9uLmVycm9yfVxcblxcbk5vdGU6IElmIHRoaXMgaXMgYW4gYXR0YWNoZWQgZmlsZSwgdXNlIHRoZSBleGFjdCBmaWxlbmFtZSBmcm9tIHRoZSBcIkFUVEFDSEVEIEZJTEVTIEFWQUlMQUJMRVwiIGxpc3QuYCBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVfcGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICBcbiAgICBzd2l0Y2ggKGV4dCkge1xuICAgICAgY2FzZSAnLnBkZic6XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkUERGKGZpbGVfcGF0aCk7XG4gICAgICBjYXNlICcuZG9jeCc6XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkRE9DWChmaWxlX3BhdGgpO1xuICAgICAgY2FzZSAnLnR4dCc6IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlX3BhdGgsICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZmlsZV9wYXRoOiBmaWxlX3BhdGgsXG4gICAgICAgICAgICBmb3JtYXQ6ICdUWFQnLFxuICAgICAgICAgICAgd29yZF9jb3VudDogdGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICAgICAgc2l6ZTogYCR7KGZzLnN0YXRTeW5jKGZpbGVfcGF0aCkuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgZXJyb3I6IGBVbnN1cHBvcnRlZCBmaWxlIGZvcm1hdDogJHtleHR9LiBPbmx5IC5wZGYsIC5kb2N4LCBhbmQgLnR4dCBhcmUgc3VwcG9ydGVkLmAgXG4gICAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIFBERiBjb250ZW50IGZyb20gZGlzayBwYXRoLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkUERGKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwZGZQYXJzZSA9IChhd2FpdCBpbXBvcnQoJ3BkZi1wYXJzZScpKS5kZWZhdWx0O1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBQREYgZnJvbSBkaXNrOiAke2ZpbGVQYXRofWApO1xuICAgIFxuICAgIGNvbnN0IGRhdGFCdWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBkZlBhcnNlKGRhdGFCdWZmZXIpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUERGIHJlYWQgY29tcGxldGU6ICR7cmVzdWx0Lm51bXBhZ2VzfSBwYWdlcywgJHsocmVzdWx0LnRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVQYXRoLFxuICAgICAgICBmb3JtYXQ6ICdQREYnLFxuICAgICAgICBwYWdlczogcmVzdWx0Lm51bXBhZ2VzLFxuICAgICAgICB3b3JkX2NvdW50OiByZXN1bHQudGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICBzaXplOiBgJHsoZnMuc3RhdFN5bmMoZmlsZVBhdGgpLnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogcmVzdWx0LnRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAocmVzdWx0LnRleHQubGVuZ3RoID4gNTAwID8gJy4uLicgOiAnJyksXG4gICAgICAgIGZ1bGxfdGV4dDogcmVzdWx0LnRleHQsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBQREYgcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBQREYgY29udGVudCBmcm9tIGJ1ZmZlciAoZm9yIGF0dGFjaG1lbnRzKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFBERkZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwZGZQYXJzZSA9IChhd2FpdCBpbXBvcnQoJ3BkZi1wYXJzZScpKS5kZWZhdWx0O1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBQREYgZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBkZlBhcnNlKGJ1ZmZlcik7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBQREYgcmVhZCBjb21wbGV0ZTogJHtyZXN1bHQubnVtcGFnZXN9IHBhZ2VzLCAkeyhyZXN1bHQudGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogZmlsZU5hbWUsXG4gICAgICAgIGZvcm1hdDogJ1BERicsXG4gICAgICAgIHBhZ2VzOiByZXN1bHQubnVtcGFnZXMsXG4gICAgICAgIHdvcmRfY291bnQ6IHJlc3VsdC50ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXG4gICAgICAgIHNpemU6IGAkeyhidWZmZXIubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHJlc3VsdC50ZXh0LnN1YnN0cmluZygwLCA1MDApICsgKHJlc3VsdC50ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHJlc3VsdC50ZXh0LFxuICAgICAgICBzb3VyY2U6ICdhdHRhY2htZW50JyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBERiByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIERPQ1ggY29udGVudCBmcm9tIGRpc2sgcGF0aC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZERPQ1goZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IG1hbW1vdGggPSBhd2FpdCBpbXBvcnQoJ21hbW1vdGgnKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgRE9DWCBmcm9tIGRpc2s6ICR7ZmlsZVBhdGh9YCk7XG4gICAgXG4gICAgY29uc3QgZGF0YUJ1ZmZlciA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKChtYW1tb3RoIGFzIHVua25vd24pIGFzIHsgZXh0cmFjdFJhd1RleHQ6IChvcHRzOiB7IGJ1ZmZlcjogQnVmZmVyIH0pID0+IFByb21pc2U8eyB2YWx1ZTogc3RyaW5nOyBtZXNzYWdlczogQXJyYXk8eyBtZXNzYWdlOiBzdHJpbmcgfT4gfT4gfSkuZXh0cmFjdFJhd1RleHQoeyBidWZmZXI6IGRhdGFCdWZmZXIgfSk7XG4gICAgXG4gICAgY29uc3QgdGV4dCA9IHJlc3VsdC52YWx1ZTtcbiAgICBjb25zdCB3YXJuaW5ncyA9IHJlc3VsdC5tZXNzYWdlcy5tYXAoKG06IHsgbWVzc2FnZTogc3RyaW5nIH0pID0+IG0ubWVzc2FnZSkuam9pbignXFxuJyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBET0NYIHJlYWQgY29tcGxldGU6ICR7KHRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVQYXRoLFxuICAgICAgICBmb3JtYXQ6ICdET0NYJyxcbiAgICAgICAgd29yZF9jb3VudDogdGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICBzaXplOiBgJHsoZnMuc3RhdFN5bmMoZmlsZVBhdGgpLnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHdhcm5pbmdzOiB3YXJuaW5ncyB8fCB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBET0NYIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlYWQgRE9DWCBjb250ZW50IGZyb20gYnVmZmVyIChmb3IgYXR0YWNobWVudHMpLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkRE9DWEZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBtYW1tb3RoID0gYXdhaXQgaW1wb3J0KCdtYW1tb3RoJyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBSZWFkaW5nIERPQ1ggZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0ICgobWFtbW90aCBhcyB1bmtub3duKSBhcyB7IGV4dHJhY3RSYXdUZXh0OiAob3B0czogeyBidWZmZXI6IEJ1ZmZlciB9KSA9PiBQcm9taXNlPHsgdmFsdWU6IHN0cmluZzsgbWVzc2FnZXM6IEFycmF5PHsgbWVzc2FnZTogc3RyaW5nIH0+IH0+IH0pLmV4dHJhY3RSYXdUZXh0KHsgYnVmZmVyIH0pO1xuICAgIFxuICAgIGNvbnN0IHRleHQgPSByZXN1bHQudmFsdWU7XG4gICAgY29uc3Qgd2FybmluZ3MgPSByZXN1bHQubWVzc2FnZXMubWFwKChtOiB7IG1lc3NhZ2U6IHN0cmluZyB9KSA9PiBtLm1lc3NhZ2UpLmpvaW4oJ1xcbicpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gRE9DWCByZWFkIGNvbXBsZXRlOiAkeyh0ZXh0Lmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9S0JgKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlTmFtZSxcbiAgICAgICAgZm9ybWF0OiAnRE9DWCcsXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGJ1ZmZlci5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHdhcm5pbmdzOiB3YXJuaW5ncyB8fCB1bmRlZmluZWQsXG4gICAgICAgIHNvdXJjZTogJ2F0dGFjaG1lbnQnLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRE9DWCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIFRYVCBjb250ZW50IGZyb20gYnVmZmVyIChmb3IgYXR0YWNobWVudHMpLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkVFhURnJvbUJ1ZmZlcihidWZmZXI6IEJ1ZmZlciwgZmlsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBUWFQgZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHRleHQgPSBidWZmZXIudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBUWFQgcmVhZCBjb21wbGV0ZTogJHsodGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogZmlsZU5hbWUsXG4gICAgICAgIGZvcm1hdDogJ1RYVCcsXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGJ1ZmZlci5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHNvdXJjZTogJ2F0dGFjaG1lbnQnLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVFhUIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRvY3VtZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJlYWRfZG9jdW1lbnQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2RvY3VtZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlYWQgY29udGVudCBmcm9tIFBERiwgRE9DWCwgb3IgVFhUIGZpbGVzLiBTdXBwb3J0cyBib3RoIGRpc2sgcGF0aHMgYW5kIGF0dGFjaGVkIGZpbGVzICh1c2UgZmlsZW5hbWUgZm9yIGF0dGFjaG1lbnRzKS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfcGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgUERGLCBET0NYLCBvciBUWFQgZmlsZSwgb3IgdGhlIGZpbGVuYW1lIGlmIGl0IGlzIGFuIGF0dGFjaGVkIGZpbGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByZWFkRG9jdW1lbnQocGFyYW1zIGFzIFJlYWREb2N1bWVudFBhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiLyoqXG4gKiBCYWNrdXAgVG9vbHMgTW9kdWxlXG4gKiBQcm92aWRlcyBtYW51YWwgYmFja3VwL3Jlc3RvcmUgZnVuY3Rpb25hbGl0eSBmb3IgcGx1Z2luIHN0YXRlIGZpbGVzLlxuICovXG5cbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGFyY2hpdmVyIGZyb20gJ2FyY2hpdmVyJztcbmltcG9ydCB1bnppcHBlciBmcm9tICd1bnppcHBlcic7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8vIEJhY2t1cCBkaXJlY3RvcnkgbG9jYXRpb25cbmNvbnN0IEJBQ0tVUF9ESVIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJy5haV90b29sYm94X2JhY2t1cHMnKTtcblxuLy8gRmlsZXMgdG8gYmFja3VwIGJ5IGRlZmF1bHRcbmNvbnN0IERFRkFVTFRfQkFDS1VQX0ZJTEVTID0gW1xuICAnLmFpX3Rvb2xib3hfc3RhdGUuanNvbicsICAgICAgLy8gU3RhdGUgcGVyc2lzdGVuY2VcbiAgJy5haV90b29sYm94X2NvbnRleHQuanNvbicsICAgIC8vIENvbnRleHQgbWVtb3J5IGVudHJpZXNcbl07XG5cbi8qKlxuICogQ3JlYXRlIGEgY29tcHJlc3NlZCBaSVAgYXJjaGl2ZSBvZiBzcGVjaWZpZWQgZmlsZXMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVppcEFyY2hpdmUoXG4gIHNvdXJjZUZpbGVzOiB7IGZpbGVQYXRoOiBzdHJpbmc7IGFyY2hpdmVOYW1lOiBzdHJpbmcgfVtdLFxuICBkZXN0aW5hdGlvblBhdGg6IHN0cmluZyxcbik6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBzaXplPzogbnVtYmVyOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IG91dHB1dCA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3RpbmF0aW9uUGF0aCk7XG4gICAgY29uc3QgYXJjaGl2ZSA9IGFyY2hpdmVyKCd6aXAnLCB7IHpsaWI6IHsgbGV2ZWw6IDkgfSB9KTsgLy8gTWF4aW11bSBjb21wcmVzc2lvblxuXG4gICAgbGV0IHRvdGFsU2l6ZSA9IDA7XG4gICAgbGV0IGhhc0Vycm9yID0gZmFsc2U7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIGVycm9yc1xuICAgIGFyY2hpdmUub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IHtcbiAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBBcmNoaXZlIGNyZWF0aW9uIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gIH0pO1xuICAgIH0pO1xuXG4gICAgb3V0cHV0Lm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICBoYXNFcnJvciA9IHRydWU7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgV3JpdGUgZmFpbGVkOiAke2Vyci5tZXNzYWdlfWAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBUcmFjayBjb21wbGV0aW9uXG4gICAgb3V0cHV0Lm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIGlmICghaGFzRXJyb3IpIHtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhkZXN0aW5hdGlvblBhdGgpO1xuICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgc2l6ZTogc3RhdHMuc2l6ZSB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFBpcGUgYXJjaGl2ZSB0byBvdXRwdXQgZmlsZVxuICAgIGFyY2hpdmUucGlwZShvdXRwdXQpO1xuXG4gICAgLy8gQWRkIGZpbGVzIHRvIGFyY2hpdmVcbiAgICBmb3IgKGNvbnN0IHsgZmlsZVBhdGgsIGFyY2hpdmVOYW1lIH0gb2Ygc291cmNlRmlsZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhmaWxlUGF0aCk7XG4gICAgICAgIGlmIChzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgYXJjaGl2ZS5maWxlKGZpbGVQYXRoLCB7IG5hbWU6IGFyY2hpdmVOYW1lIH0pO1xuICAgICAgICAgIHRvdGFsU2l6ZSArPSBzdGF0LnNpemU7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtCYWNrdXBdIEZpbGUgbm90IGZvdW5kIG9yIGluYWNjZXNzaWJsZTogJHtmaWxlUGF0aH1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgbWV0YWRhdGEgZmlsZVxuICAgIGNvbnN0IG1ldGFkYXRhID0ge1xuICAgICAgdmVyc2lvbjogJzEuMCcsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHBsdWdpblZlcnNpb246ICcxLjQuMCcsXG4gICAgICBmaWxlc0NvdW50OiBzb3VyY2VGaWxlcy5sZW5ndGgsXG4gICAgICB0b3RhbFVuY29tcHJlc3NlZFNpemU6IHRvdGFsU2l6ZSxcbiAgICB9O1xuICAgIGFyY2hpdmUuYXBwZW5kKEpTT04uc3RyaW5naWZ5KG1ldGFkYXRhLCBudWxsLCAyKSwgeyBuYW1lOiAnYmFja3VwLW1ldGFkYXRhLmpzb24nIH0pO1xuXG4gICAgLy8gRmluYWxpemUgYXJjaGl2ZVxuICAgIGFyY2hpdmUuZmluYWxpemUoKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRXh0cmFjdCBmaWxlcyBmcm9tIGEgWklQIGFyY2hpdmUgd2l0aCBwYXRoIHRyYXZlcnNhbCBwcm90ZWN0aW9uLlxuICovXG5hc3luYyBmdW5jdGlvbiBleHRyYWN0WmlwQXJjaGl2ZShcbiAgc291cmNlUGF0aDogc3RyaW5nLFxuICBkZXN0aW5hdGlvbkRpcjogc3RyaW5nLFxuKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGV4dHJhY3RlZEZpbGVzPzogc3RyaW5nW107IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBleHRyYWN0ZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCByZXNvbHZlZERlc3REaXIgPSBwYXRoLnJlc29sdmUoZGVzdGluYXRpb25EaXIpO1xuXG4gICAgLy8gVXNlIHVuemlwcGVyIGxpYnJhcnkgZm9yIHJlbGlhYmxlIGV4dHJhY3Rpb24gd2l0aCBzdHJlYW1pbmdcbiAgICBhd2FpdCBmcy5jcmVhdGVSZWFkU3RyZWFtKHNvdXJjZVBhdGgpXG4gICAgICAucGlwZSh1bnppcHBlci5QYXJzZSgpKVxuICAgICAgLm9uKCdlbnRyeScsIChlbnRyeTogYW55KSA9PiB7XG4gICAgICAgIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBlbnRyeSBwYXRoIHRvIHByZXZlbnQgZGlyZWN0b3J5IHRyYXZlcnNhbCBhdHRhY2tzXG4gICAgICAgIGNvbnN0IGVudHJ5UGF0aCA9IGVudHJ5LnBhdGggfHwgZW50cnkuZmlsZU5hbWU7XG4gICAgICAgIFxuICAgICAgICAvLyBTa2lwIGRpcmVjdG9yaWVzXG4gICAgICAgIGlmIChlbnRyeS50eXBlID09PSAnRGlyZWN0b3J5Jykge1xuICAgICAgICAgIGVudHJ5LmF1dG9kcmFpbigpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIGZ1bGwgdGFyZ2V0IHBhdGhcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGgucmVzb2x2ZShyZXNvbHZlZERlc3REaXIsIGVudHJ5UGF0aCk7XG4gICAgICAgIFxuICAgICAgICAvLyBTRUNVUklUWTogRW5zdXJlIHJlc29sdmVkIHBhdGggaXMgd2l0aGluIGRlc3RpbmF0aW9uIGRpcmVjdG9yeVxuICAgICAgICBpZiAoIXRhcmdldFBhdGguc3RhcnRzV2l0aChyZXNvbHZlZERlc3REaXIgKyBwYXRoLnNlcCkgJiYgdGFyZ2V0UGF0aCAhPT0gcmVzb2x2ZWREZXN0RGlyKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBbQmFja3VwXSBCbG9ja2VkIHBhdGggdHJhdmVyc2FsIGF0dGVtcHQ6ICR7ZW50cnlQYXRofWApO1xuICAgICAgICAgIGVudHJ5LmF1dG9kcmFpbigpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuc3VyZSBwYXJlbnQgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgICBjb25zdCBwYXJlbnREaXIgPSBwYXRoLmRpcm5hbWUodGFyZ2V0UGF0aCk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwYXJlbnREaXIpKSB7XG4gICAgICAgICAgZnMubWtkaXJTeW5jKHBhcmVudERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRyYWN0IGZpbGUgdG8gZGVzdGluYXRpb25cbiAgICAgICAgZW50cnkucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbSh0YXJnZXRQYXRoKSk7XG4gICAgICAgIFxuICAgICAgICBlbnRyeS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgIGV4dHJhY3RlZEZpbGVzLnB1c2goZW50cnlQYXRoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLnByb21pc2UoKTtcblxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGV4dHJhY3RlZEZpbGVzIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBFeHRyYWN0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGJhY2t1cC1yZWxhdGVkIHRvb2xzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCYWNrdXBUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZyk6IGFueVtdIHtcbiAgY29uc3QgdG9vbHMgPSBbXTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFRvb2wgMTogY3JlYXRlX2JhY2t1cFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjcmVhdGVfYmFja3VwJyxcbiAgICBkZXNjcmlwdGlvbjogYENyZWF0ZSBhIGNvbXByZXNzZWQgYmFja3VwIG9mIHBsdWdpbiBzdGF0ZSBmaWxlcy5cblxuQkFDS0VEIFVQIEZJTEVTOlxuLSAuYWlfdG9vbGJveF9zdGF0ZS5qc29uIChwZXJzaXN0ZW50IHRvb2wgZXhlY3V0aW9uIHN0YXRlKVxuLSAuYWlfdG9vbGJveF9jb250ZXh0Lmpzb24gKGNvbnRleHQgbWVtb3J5IGVudHJpZXMgZnJvbSBhdXRvLXN1bW1hcml6ZV9jb250ZXh0KVxuXG5TVE9SQUdFIExPQ0FUSU9OOlxuQmFja3VwcyBhcmUgc3RvcmVkIGluIC5haV90b29sYm94X2JhY2t1cHMvIGRpcmVjdG9yeSB3aXRoIHRpbWVzdGFtcGVkIGZpbGVuYW1lcy5cblxuRVhBTVBMRSBVU0FHRTpcbntcImRlc3RpbmF0aW9uXCI6IFwibXktY3VzdG9tLWJhY2t1cC56aXBcIn1cblx1MjE5MiBDcmVhdGVzOiAuYWlfdG9vbGJveF9iYWNrdXBzL215LWN1c3RvbS1iYWNrdXAuemlwYCxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKVxuICAgICAgICAubWF4KDI1NilcbiAgICAgICAgLmRlc2NyaWJlKCdDdXN0b20gYmFja3VwIGZpbGVuYW1lIChkZWZhdWx0OiBhdXRvLWdlbmVyYXRlZCB3aXRoIHRpbWVzdGFtcCkuIE11c3QgZW5kIHdpdGggLnppcCcpXG4gICAgICAgIC5vcHRpb25hbCgpLFxuICAgICAgaW5jbHVkZVN0YXRlOiB6LmJvb2xlYW4oKVxuICAgICAgICAuZGVmYXVsdCh0cnVlKVxuICAgICAgICAuZGVzY3JpYmUoJ0luY2x1ZGUgc3RhdGUgcGVyc2lzdGVuY2UgZmlsZSAoLmFpX3Rvb2xib3hfc3RhdGUuanNvbiknKSxcbiAgICAgIGluY2x1ZGVDb250ZXh0OiB6LmJvb2xlYW4oKVxuICAgICAgICAuZGVmYXVsdCh0cnVlKVxuICAgICAgICAuZGVzY3JpYmUoJ0luY2x1ZGUgY29udGV4dCBtZW1vcnkgZmlsZSAoLmFpX3Rvb2xib3hfY29udGV4dC5qc29uKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGRlc3RpbmF0aW9uLCBpbmNsdWRlU3RhdGUsIGluY2x1ZGVDb250ZXh0IH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIDEuIFZhbGlkYXRlIHBhcmFtZXRlcnNcbiAgICAgICAgaWYgKCFpbmNsdWRlU3RhdGUgJiYgIWluY2x1ZGVDb250ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6ICdBdCBsZWFzdCBvbmUgZmlsZSB0eXBlIG11c3QgYmUgc2VsZWN0ZWQgZm9yIGJhY2t1cCAoaW5jbHVkZVN0YXRlIG9yIGluY2x1ZGVDb250ZXh0KScsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIuIEdlbmVyYXRlIGZpbGVuYW1lIGlmIG5vdCBwcm92aWRlZFxuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAucmVwbGFjZSgvVC8sICctJylcbiAgICAgICAgICAucmVwbGFjZSgvOi9nLCAnLScpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcLi4qLywgJycpO1xuICAgICAgICBjb25zdCBiYWNrdXBOYW1lID0gZGVzdGluYXRpb24gfHwgYGJhY2t1cC0ke3RpbWVzdGFtcH0uemlwYDtcblxuICAgICAgICAvLyBWYWxpZGF0ZSBmaWxlbmFtZVxuICAgICAgICBpZiAoIWJhY2t1cE5hbWUuZW5kc1dpdGgoJy56aXAnKSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnQmFja3VwIGZpbGVuYW1lIG11c3QgZW5kIHdpdGggLnppcCcsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDMuIEVuc3VyZSBiYWNrdXBzIGRpcmVjdG9yeSBleGlzdHNcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKEJBQ0tVUF9ESVIpKSB7XG4gICAgICAgICAgZnMubWtkaXJTeW5jKEJBQ0tVUF9ESVIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmFja3VwUGF0aCA9IHBhdGguam9pbihCQUNLVVBfRElSLCBiYWNrdXBOYW1lKTtcblxuICAgICAgICAvLyA0LiBDb2xsZWN0IGZpbGVzIHRvIGJhY2t1cFxuICAgICAgICBjb25zdCBmaWxlc1RvQmFja3VwOiB7IGZpbGVQYXRoOiBzdHJpbmc7IGFyY2hpdmVOYW1lOiBzdHJpbmcgfVtdID0gW107XG5cbiAgICAgICAgaWYgKGluY2x1ZGVTdGF0ZSkge1xuICAgICAgICAgIGNvbnN0IHN0YXRlRmlsZSA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnLmFpX3Rvb2xib3hfc3RhdGUuanNvbicpO1xuICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHN0YXRlRmlsZSkpIHtcbiAgICAgICAgICAgIGZpbGVzVG9CYWNrdXAucHVzaCh7IGZpbGVQYXRoOiBzdGF0ZUZpbGUsIGFyY2hpdmVOYW1lOiAnLmFpX3Rvb2xib3hfc3RhdGUuanNvbicgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluY2x1ZGVDb250ZXh0KSB7XG4gICAgICAgICAgY29uc3QgY29udGV4dEZpbGUgPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJy5haV90b29sYm94X2NvbnRleHQuanNvbicpO1xuICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGNvbnRleHRGaWxlKSkge1xuICAgICAgICAgICAgZmlsZXNUb0JhY2t1cC5wdXNoKHsgZmlsZVBhdGg6IGNvbnRleHRGaWxlLCBhcmNoaXZlTmFtZTogJy5haV90b29sYm94X2NvbnRleHQuanNvbicgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gNS4gQ2hlY2sgaWYgYW55IGZpbGVzIGZvdW5kXG4gICAgICAgIGlmIChmaWxlc1RvQmFja3VwLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnTm8gc3RhdGUgZmlsZXMgZm91bmQgdG8gYmFja3VwLiBUaGUgcGx1Z2luIG1heSBub3QgaGF2ZSBiZWVuIHVzZWQgeWV0LicsXG4gICAgICAgICAgICBoaW50OiAnVXNlIHRoZSBwbHVnaW4gZmlyc3QgdG8gZ2VuZXJhdGUgc3RhdGUgZmlsZXMsIHRoZW4gY3JlYXRlIGEgYmFja3VwLicsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDYuIENyZWF0ZSBaSVAgYXJjaGl2ZVxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjcmVhdGVaaXBBcmNoaXZlKGZpbGVzVG9CYWNrdXAsIGJhY2t1cFBhdGgpO1xuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNy4gUmV0dXJuIHN1Y2Nlc3Mgd2l0aCBkZXRhaWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBtZXNzYWdlOiBgQmFja3VwIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5YCxcbiAgICAgICAgICBiYWNrdXBQYXRoOiBiYWNrdXBQYXRoLFxuICAgICAgICAgIGZpbGVuYW1lOiBiYWNrdXBOYW1lLFxuICAgICAgICAgIGZpbGVzQmFja2VkVXA6IGZpbGVzVG9CYWNrdXAubWFwKGYgPT4gZi5hcmNoaXZlTmFtZSksXG4gICAgICAgICAgY29tcHJlc3NlZFNpemVCeXRlczogcmVzdWx0LnNpemUsXG4gICAgICAgICAgY29tcHJlc3NlZFNpemVIdW1hbjogYCR7KHJlc3VsdC5zaXplISAvIDEwMjQpLnRvRml4ZWQoMil9IEtCYCxcbiAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogYEJhY2t1cCBmYWlsZWQ6ICR7bWVzc2FnZX1gLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFRvb2wgMjogbGlzdF9iYWNrdXBzXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdsaXN0X2JhY2t1cHMnLFxuICAgIGRlc2NyaXB0aW9uOiBgTGlzdCBhbGwgYXZhaWxhYmxlIGJhY2t1cCBmaWxlcyBpbiB0aGUgYmFja3VwcyBkaXJlY3RvcnkuXG5cblJFVFVSTlM6XG4tIEFycmF5IG9mIGJhY2t1cCBvYmplY3RzIHdpdGggZmlsZW5hbWUsIHBhdGgsIHNpemUsIGFuZCBjcmVhdGlvbiBkYXRlXG4tIFNvcnRlZCBieSBjcmVhdGlvbiBkYXRlIChuZXdlc3QgZmlyc3QpXG5cbkVYQU1QTEUgT1VUUFVUOlxue1xuICBcInN1Y2Nlc3NcIjogdHJ1ZSxcbiAgXCJiYWNrdXBzXCI6IFtcbiAgICB7XG4gICAgICBcImZpbGVuYW1lXCI6IFwiYmFja3VwLTIwMjYtMDUtMzBUMTktNDUtMDAuemlwXCIsXG4gICAgICBcInBhdGhcIjogXCIuYWlfdG9vbGJveF9iYWNrdXBzL2JhY2t1cC0yMDI2LTA1LTMwVDE5LTQ1LTAwLnppcFwiLFxuICAgICAgXCJzaXplQnl0ZXNcIjogMTIzNCxcbiAgICAgIFwiY3JlYXRlZEF0XCI6IFwiMjAyNi0wNS0zMFQxOTo0NTowMC4wMDBaXCJcbiAgICB9XG4gIF1cbn1gLCAgXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc29ydEJ5OiB6LmVudW0oWydkYXRlJywgJ3NpemUnXSkuZGVmYXVsdCgnZGF0ZScpXG4gICAgICAgIC5kZXNjcmliZSgnU29ydCBvcmRlcjogXCJkYXRlXCIgKG5ld2VzdCBmaXJzdCkgb3IgXCJzaXplXCIgKGxhcmdlc3QgZmlyc3QpJyksXG4gICAgICBsaW1pdDogei5udW1iZXIoKVxuICAgICAgICAuaW50KClcbiAgICAgICAgLm1pbigxKVxuICAgICAgICAubWF4KDEwMDApXG4gICAgICAgIC5kZWZhdWx0KDUwKVxuICAgICAgICAuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIGJhY2t1cHMgdG8gcmV0dXJuIChkZWZhdWx0OiA1MCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzb3J0QnksIGxpbWl0IH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENoZWNrIGlmIGJhY2t1cCBkaXJlY3RvcnkgZXhpc3RzXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhCQUNLVVBfRElSKSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgYmFja3VwczogW10sXG4gICAgICAgICAgICBtZXNzYWdlOiAnTm8gYmFja3VwcyBkaXJlY3RvcnkgZm91bmQuIENyZWF0ZSBhIGJhY2t1cCBmaXJzdCB1c2luZyBjcmVhdGVfYmFja3VwLicsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYWQgYWxsIC56aXAgZmlsZXNcbiAgICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhCQUNLVVBfRElSKVxuICAgICAgICAgIC5maWx0ZXIoZiA9PiBmLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoJy56aXAnKSlcbiAgICAgICAgICAubWFwKGZpbGVuYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKEJBQ0tVUF9ESVIsIGZpbGVuYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZmlsZW5hbWUsXG4gICAgICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICBzaXplQnl0ZXM6IHN0YXRzLnNpemUsXG4gICAgICAgICAgICAgIGNyZWF0ZWRBdDogc3RhdHMubXRpbWUudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU29ydCByZXN1bHRzXG4gICAgICAgIGlmIChzb3J0QnkgPT09ICdkYXRlJykge1xuICAgICAgICAgIGZpbGVzLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGIuY3JlYXRlZEF0KS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShhLmNyZWF0ZWRBdCkuZ2V0VGltZSgpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzb3J0QnkgPT09ICdzaXplJykge1xuICAgICAgICAgIGZpbGVzLnNvcnQoKGEsIGIpID0+IGIuc2l6ZUJ5dGVzIC0gYS5zaXplQnl0ZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXBwbHkgbGltaXRcbiAgICAgICAgY29uc3QgbGltaXRlZEZpbGVzID0gZmlsZXMuc2xpY2UoMCwgbGltaXQpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBiYWNrdXBzOiBsaW1pdGVkRmlsZXMsXG4gICAgICAgICAgdG90YWxDb3VudDogZmlsZXMubGVuZ3RoLFxuICAgICAgICAgIHJldHVybmVkQ291bnQ6IGxpbWl0ZWRGaWxlcy5sZW5ndGgsXG4gICAgICAgIH07XG5cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbGlzdCBiYWNrdXBzOiAke21lc3NhZ2V9YCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBUb29sIDM6IHJlc3RvcmVfYmFja3VwXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZXN0b3JlX2JhY2t1cCcsXG4gICAgZGVzY3JpcHRpb246IGBSZXN0b3JlIHN0YXRlIGZpbGVzIGZyb20gYSBiYWNrdXAgYXJjaGl2ZS5cblxuXHUyNkEwXHVGRTBGIFdBUk5JTkc6IFRoaXMgd2lsbCBPVkVSV1JJVEUgY3VycmVudCBzdGF0ZSBmaWxlcyFcblxuUkVTVE9SRUQgRklMRVM6XG4tIC5haV90b29sYm94X3N0YXRlLmpzb24gKGlmIHByZXNlbnQgaW4gYmFja3VwKVxuLSAuYWlfdG9vbGJveF9jb250ZXh0Lmpzb24gKGlmIHByZXNlbnQgaW4gYmFja3VwKVxuXG5TQUZFVFkgRkVBVFVSRVM6XG4tIFJlcXVpcmVzIGV4cGxpY2l0IGNvbmZpcm1hdGlvbiAoY29uZmlybT10cnVlIHBhcmFtZXRlcilcbi0gQ3JlYXRlcyB0ZW1wb3JhcnkgZXh0cmFjdGlvbiBkaXJlY3Rvcnlcbi0gVmFsaWRhdGVzIGFyY2hpdmUgYmVmb3JlIHJlc3RvcmF0aW9uXG4tIFJlcG9ydHMgd2hpY2ggZmlsZXMgd2VyZSByZXN0b3JlZFxuXG5FWEFNUExFIFVTQUdFOlxue1xuICBcImJhY2t1cEZpbGVcIjogXCJiYWNrdXAtMjAyNi0wNS0zMFQxOS00NS0wMC56aXBcIixcbiAgXCJjb25maXJtXCI6IHRydWVcbn1cblx1MjE5MiBSZXN0b3JlcyBzdGF0ZSBmaWxlcyBmcm9tIHNwZWNpZmllZCBiYWNrdXBgLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGJhY2t1cEZpbGU6IHouc3RyaW5nKClcbiAgICAgICAgLm1heCgyNTYpXG4gICAgICAgIC5kZXNjcmliZSgnQmFja3VwIGZpbGVuYW1lIHRvIHJlc3RvcmUgKGUuZy4sIFwiYmFja3VwLTIwMjYtMDUtMzBUMTktNDUtMDAuemlwXCIpJyksXG4gICAgICBjb25maXJtOiB6LmJvb2xlYW4oKVxuICAgICAgICAuZGVmYXVsdChmYWxzZSlcbiAgICAgICAgLmRlc2NyaWJlKCdcdTI2QTBcdUZFMEYgTVVTVCBiZSB0cnVlIHRvIGNvbmZpcm0gcmVzdG9yYXRpb24uIFRoaXMgaXMgYSBzYWZldHkgY2hlY2sgYWdhaW5zdCBhY2NpZGVudGFsIGRhdGEgbG9zcy4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBiYWNrdXBGaWxlLCBjb25maXJtIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIDEuIFNhZmV0eSBjaGVja1xuICAgICAgICBpZiAoIWNvbmZpcm0pIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ1x1MjZBMFx1RkUwRiBTQUZFVFkgQ0hFQ0sgRkFJTEVEJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdSZXN0b3JhdGlvbiBub3QgcGVyZm9ybWVkLiBTZXQgY29uZmlybT10cnVlIHRvIHByb2NlZWQuJyxcbiAgICAgICAgICAgIGhpbnQ6ICdUaGlzIGlzIGludGVudGlvbmFsIHRvIHByZXZlbnQgYWNjaWRlbnRhbCBkYXRhIGxvc3MuIEV4YW1wbGU6IHtcImJhY2t1cEZpbGVcIjogXCIuLi5cIiwgXCJjb25maXJtXCI6IHRydWV9JyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMi4gVmFsaWRhdGUgYmFja3VwIGZpbGUgZXhpc3RzXG4gICAgICAgIGNvbnN0IGJhY2t1cFBhdGggPSBwYXRoLmpvaW4oQkFDS1VQX0RJUiwgYmFja3VwRmlsZSk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhiYWNrdXBQYXRoKSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBgQmFja3VwIGZpbGUgbm90IGZvdW5kOiAke2JhY2t1cEZpbGV9YCxcbiAgICAgICAgICAgIGhpbnQ6ICdVc2UgbGlzdF9iYWNrdXBzIHRvIHNlZSBhdmFpbGFibGUgYmFja3Vwcy4nLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzLiBDcmVhdGUgdGVtcG9yYXJ5IGV4dHJhY3Rpb24gZGlyZWN0b3J5XG4gICAgICAgIGNvbnN0IHRlbXBEaXIgPSBwYXRoLmpvaW4oQkFDS1VQX0RJUiwgYC50ZW1wX3Jlc3RvcmVfJHtEYXRlLm5vdygpfWApO1xuICAgICAgICBmcy5ta2RpclN5bmModGVtcERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyA0LiBFeHRyYWN0IGFyY2hpdmUgdG8gdGVtcCBkaXJlY3RvcnlcbiAgICAgICAgICBjb25zdCBleHRyYWN0UmVzdWx0ID0gYXdhaXQgZXh0cmFjdFppcEFyY2hpdmUoYmFja3VwUGF0aCwgdGVtcERpcik7XG5cbiAgICAgICAgICBpZiAoIWV4dHJhY3RSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBleHRyYWN0UmVzdWx0LmVycm9yIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gNS4gSWRlbnRpZnkgZmlsZXMgdG8gcmVzdG9yZSAob25seSBzdGF0ZSBmaWxlcylcbiAgICAgICAgICBjb25zdCByZXN0b3JhYmxlRmlsZXMgPSBbXG4gICAgICAgICAgICAnLmFpX3Rvb2xib3hfc3RhdGUuanNvbicsXG4gICAgICAgICAgICAnLmFpX3Rvb2xib3hfY29udGV4dC5qc29uJyxcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgY29uc3QgcmVzdG9yZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBjb25zdCBtaXNzaW5nRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVOYW1lIG9mIHJlc3RvcmFibGVGaWxlcykge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IHBhdGguam9pbih0ZW1wRGlyLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhzb3VyY2VQYXRoKSkge1xuICAgICAgICAgICAgICAvLyBHZXQgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgICAgICAgICAgICBjb25zdCBkZXN0UGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBSZWFkIGFuZCB3cml0ZSB0byBkZXN0aW5hdGlvblxuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKHNvdXJjZVBhdGgpO1xuICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGRlc3RQYXRoLCBjb250ZW50KTtcbiAgICAgICAgICAgICAgcmVzdG9yZWRGaWxlcy5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1pc3NpbmdGaWxlcy5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA2LiBSZXR1cm4gc3VjY2Vzc1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogYFJlc3RvcmVkICR7cmVzdG9yZWRGaWxlcy5sZW5ndGh9IGZpbGUocykgZnJvbSBiYWNrdXBgLFxuICAgICAgICAgICAgYmFja3VwRmlsZSxcbiAgICAgICAgICAgIHJlc3RvcmVkRmlsZXMsXG4gICAgICAgICAgICBleHRyYWN0ZWRGaWxlc0NvdW50OiBleHRyYWN0UmVzdWx0LmV4dHJhY3RlZEZpbGVzPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAvLyA3LiBDbGVhbnVwIHRlbXAgZGlyZWN0b3J5XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnJtU3luYyh0ZW1wRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7XG4gICAgICAgICAgfSBjYXRjaCAoY2xlYW51cEVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbQmFja3VwXSBXYXJuaW5nOiBDb3VsZCBub3QgY2xlYW51cCB0ZW1wIGRpciAke3RlbXBEaXJ9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGBSZXN0b3JhdGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFRvb2wgNDogZGVsZXRlX2JhY2t1cCAoYm9udXMgdG9vbClcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9iYWNrdXAnLFxuICAgIGRlc2NyaXB0aW9uOiBgRGVsZXRlIGEgYmFja3VwIGZpbGUgZnJvbSB0aGUgYmFja3VwcyBkaXJlY3RvcnkuXG5cblx1MjZBMFx1RkUwRiBXQVJOSU5HOiBUaGlzIGFjdGlvbiBpcyBJUlJFVkVSU0lCTEUhXG5cblNBRkVUWSBGRUFUVVJFUzpcbi0gUmVxdWlyZXMgZXhwbGljaXQgY29uZmlybWF0aW9uIChjb25maXJtPXRydWUgcGFyYW1ldGVyKVxuLSBWYWxpZGF0ZXMgZmlsZSBleGlzdHMgYmVmb3JlIGRlbGV0aW9uXG4tIE9ubHkgZGVsZXRlcyAuemlwIGZpbGVzIGZyb20gYmFja3VwIGRpcmVjdG9yeVxuXG5FWEFNUExFIFVTQUdFOlxue1xuICBcImJhY2t1cEZpbGVcIjogXCJvbGQtYmFja3VwLnppcFwiLFxuICBcImNvbmZpcm1cIjogdHJ1ZVxufVxuXHUyMTkyIFBlcm1hbmVudGx5IGRlbGV0ZXMgdGhlIHNwZWNpZmllZCBiYWNrdXBgLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGJhY2t1cEZpbGU6IHouc3RyaW5nKClcbiAgICAgICAgLm1heCgyNTYpXG4gICAgICAgIC5kZXNjcmliZSgnQmFja3VwIGZpbGVuYW1lIHRvIGRlbGV0ZSAoZS5nLiwgXCJvbGQtYmFja3VwLnppcFwiKScpLFxuICAgICAgY29uZmlybTogei5ib29sZWFuKClcbiAgICAgICAgLmRlZmF1bHQoZmFsc2UpXG4gICAgICAgIC5kZXNjcmliZSgnXHUyNkEwXHVGRTBGIE1VU1QgYmUgdHJ1ZSB0byBjb25maXJtIGRlbGV0aW9uLiBUaGlzIGlzIGEgc2FmZXR5IGNoZWNrLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGJhY2t1cEZpbGUsIGNvbmZpcm0gfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gMS4gU2FmZXR5IGNoZWNrXG4gICAgICAgIGlmICghY29uZmlybSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnXHUyNkEwXHVGRTBGIFNBRkVUWSBDSEVDSyBGQUlMRUQnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0RlbGV0aW9uIG5vdCBwZXJmb3JtZWQuIFNldCBjb25maXJtPXRydWUgdG8gcHJvY2VlZC4nLFxuICAgICAgICAgICAgaGludDogJ1RoaXMgaXMgaW50ZW50aW9uYWwgdG8gcHJldmVudCBhY2NpZGVudGFsIGRhdGEgbG9zcy4nLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyAyLiBWYWxpZGF0ZSBmaWxlbmFtZSAobXVzdCBiZSAuemlwKVxuICAgICAgICBpZiAoIWJhY2t1cEZpbGUudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCgnLnppcCcpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6ICdPbmx5IC56aXAgYmFja3VwIGZpbGVzIGNhbiBiZSBkZWxldGVkJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMy4gQ29uc3RydWN0IHBhdGggYW5kIHZhbGlkYXRlIGV4aXN0c1xuICAgICAgICBjb25zdCBiYWNrdXBQYXRoID0gcGF0aC5qb2luKEJBQ0tVUF9ESVIsIGJhY2t1cEZpbGUpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoYmFja3VwUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogYEJhY2t1cCBmaWxlIG5vdCBmb3VuZDogJHtiYWNrdXBGaWxlfWAsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDQuIERlbGV0ZSB0aGUgZmlsZVxuICAgICAgICBmcy51bmxpbmtTeW5jKGJhY2t1cFBhdGgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBtZXNzYWdlOiBgRGVsZXRlZCBiYWNrdXA6ICR7YmFja3VwRmlsZX1gLFxuICAgICAgICAgIGRlbGV0ZWRGaWxlOiBiYWNrdXBGaWxlLFxuICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB9O1xuXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiBgRGVsZXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgIi8qKlxuICogVG9vbHMgUHJvdmlkZXIgLSBDb21wbGV0ZSBJbXBsZW1lbnRhdGlvbiBvZiBhbGwgfjQ1IHRvb2xzIGFjcm9zcyA2IGNhdGVnb3JpZXNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFRvb2wsIFRvb2xzUHJvdmlkZXJDb250cm9sbGVyIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5cbi8vIEltcG9ydCBleGlzdGluZyBtb2R1bGVzXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHLCBpc1Rvb2xFbmFibGVkLCBpc0V4ZWN1dGlvblRvb2xFbmFibGVkLCBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSAnLi9zdGF0ZU1hbmFnZXInO1xuaW1wb3J0IHsgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIH0gZnJvbSAnLi9iYWNrZ3JvdW5kQ29tbWFuZHMnO1xuXG4vLyBJbXBvcnQgY2F0ZWdvcnktc3BlY2lmaWMgdG9vbCBtb2R1bGVzXG5pbXBvcnQgeyByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyB9IGZyb20gJy4vdG9vbHMvZmlsZVN5c3RlbVRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyB9IGZyb20gJy4vdG9vbHMvd2ViUmVzZWFyY2hUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckdpdFRvb2xzIH0gZnJvbSAnLi90b29scy9naXRHaXRodWJUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckJyb3dzZXJUb29scyB9IGZyb20gJy4vdG9vbHMvYnJvd3NlckF1dG9tYXRpb25Ub29scyc7XG5pbXBvcnQgeyByZWdpc3RlckRhdGFiYXNlVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2RhdGFiYXNlVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzIH0gZnJvbSAnLi90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyRXhlY3V0aW9uVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2V4ZWN1dGlvblRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyVXRpbGl0eVRvb2xzLCByZWdpc3RlckdldEN1cnJlbnRXb3JraW5nRGlyZWN0b3J5VG9vbCB9IGZyb20gJy4vdG9vbHMvdXRpbGl0eVRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVySW1hZ2VQcm9jZXNzaW5nVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2ltYWdlUHJvY2Vzc2luZ1Rvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVySHR0cENsaWVudFRvb2xzIH0gZnJvbSAnLi90b29scy9odHRwQ2xpZW50VG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJSYWdUb29scyB9IGZyb20gJy4vdG9vbHMvdmVjdG9yUmFnVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJVaUdlbmVyYXRpb25Ub29scyB9IGZyb20gJy4vdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJDb250ZXh0TWFuYWdlbWVudFRvb2xzIH0gZnJvbSAnLi90b29scy9jb250ZXh0TWFuYWdlbWVudFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyRG9jdW1lbnRUb29scyB9IGZyb20gJy4vdG9vbHMvZG9jdW1lbnRUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckJhY2t1cFRvb2xzIH0gZnJvbSAnLi90b29scy9iYWNrdXBUb29scyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRZUEVTID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG9vbENhdGVnb3J5IHtcbiAgbmFtZTogc3RyaW5nO1xuICB0b29sczogVG9vbFtdO1xufVxuXG4vKiogRXh0ZW5kZWQgdG9vbCB0eXBlIHdpdGggdHlwZWQgaW1wbGVtZW50YXRpb24gZm9yIHNhZmUgYWNjZXNzICovXG50eXBlIFR5cGVkVG9vbCA9IFRvb2wgJiB7XG4gIGltcGxlbWVudGF0aW9uOiAocGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgY3R4PzogdW5rbm93bikgPT4gUHJvbWlzZTx1bmtub3duPjtcbn07XG5cbi8vIEdsb2JhbCBjb25maWcgcmVmZXJlbmNlIHRvIGVuc3VyZSB0b29sc1Byb3ZpZGVyIHVzZXMgdGhlIGxhdGVzdCB1c2VyIHNldHRpbmdzXG5sZXQgY3VycmVudENvbmZpZzogUGx1Z2luQ29uZmlnID0gREVGQVVMVF9DT05GSUc7XG5cbi8qKlxuICogQ2VudHJhbCByZWdpc3RyeSBmb3IgYWxsIGF2YWlsYWJsZSB0b29scy5cbiAqIFRvb2xzIGFyZSBjcmVhdGVkIG9uY2UgYXQgbW9kdWxlIGxvYWQgdGltZSBhbmQgcmV1c2VkIGFjcm9zcyBwcm92aWRlciBjYWxscy5cbiAqL1xuY2xhc3MgVG9vbFJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSB0b29sTWFwID0gbmV3IE1hcDxzdHJpbmcsIFR5cGVkVG9vbD4oKTtcblxuICByZWdpc3RlckFsbChjb25maWc6IFBsdWdpbkNvbmZpZywgc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXIsIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcjogQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLCBsbUNsaWVudD86IGFueSk6IHZvaWQge1xuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2ZpbGVTeXN0ZW0nKSkge1xuICAgICAgcmVnaXN0ZXJGaWxlU3lzdGVtVG9vbHMoY29uZmlnLCBzdGF0ZU1hbmFnZXIpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnd2ViU2VhcmNoJykpIHtcbiAgICAgIHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnYnJvd3NlckF1dG9tYXRpb24nKSkge1xuICAgICAgcmVnaXN0ZXJCcm93c2VyVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2dpdE9wZXJhdGlvbnMnKSkge1xuICAgICAgcmVnaXN0ZXJHaXRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZGF0YWJhc2VRdWVyaWVzJykpIHtcbiAgICAgIHJlZ2lzdGVyRGF0YWJhc2VUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZG9jdW1lbnRQYXJzaW5nJykpIHtcbiAgICAgIHJlZ2lzdGVyRG9jdW1lbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnYmFja2dyb3VuZENvbW1hbmRzJykpIHtcbiAgICAgIHJlZ2lzdGVyQmFja2dyb3VuZENvbW1hbmRUb29scyhjb25maWcsIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcikuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cblxuICAgIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0NcdUREOTUgTkVXIFRPT0wgQ0FURUdPUklFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdpbWFnZVByb2Nlc3NpbmcnKSkge1xuICAgICAgcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnaHR0cENsaWVudCcpKSB7XG4gICAgICByZWdpc3Rlckh0dHBDbGllbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAndmVjdG9yUkFHJykpIHtcbiAgICAgIHJlZ2lzdGVyUmFnVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ3VpR2VuZXJhdGlvbicpKSB7XG4gICAgICByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdjb250ZXh0TWFuYWdlbWVudCcpKSB7XG4gICAgICByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIC8vIEJhY2t1cCB0b29scyBcdTIwMTQgYWx3YXlzIGF2YWlsYWJsZSAobm8gdG9nZ2xlIG5lZWRlZClcbiAgICByZWdpc3RlckJhY2t1cFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIFxuICAgIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgcmVnaXN0ZXJlZCBvbmNlLCBmaWx0ZXJlZCBieSBlbmFibGVkIHRvb2wgdHlwZXNcbiAgICBjb25zdCBleGVjQ29uZmlnID0geyAuLi5jb25maWcgfTtcbiAgICBjb25zdCBhbGxFeGVjVG9vbHMgPSByZWdpc3RlckV4ZWN1dGlvblRvb2xzKGV4ZWNDb25maWcpO1xuICAgIFxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICdqYXZhc2NyaXB0JykpIHtcbiAgICAgIGNvbnN0IGpzVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX2phdmFzY3JpcHQnKTtcbiAgICAgIGlmIChqc1Rvb2wpIHRoaXMudG9vbE1hcC5zZXQoanNUb29sLm5hbWUsIGpzVG9vbCBhcyBUeXBlZFRvb2wpO1xuICAgIH1cbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAncHl0aG9uJykpIHtcbiAgICAgIGNvbnN0IHB5VG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX3B5dGhvbicpO1xuICAgICAgaWYgKHB5VG9vbCkgdGhpcy50b29sTWFwLnNldChweVRvb2wubmFtZSwgcHlUb29sIGFzIFR5cGVkVG9vbCk7XG4gICAgfVxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICd0ZXJtaW5hbCcpKSB7XG4gICAgICBjb25zdCB0ZXJtVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX2luX3Rlcm1pbmFsJyk7XG4gICAgICBpZiAodGVybVRvb2wpIHRoaXMudG9vbE1hcC5zZXQodGVybVRvb2wubmFtZSwgdGVybVRvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ3NoZWxsJykpIHtcbiAgICAgIGNvbnN0IHNoZWxsVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAnZXhlY3V0ZV9jb21tYW5kJyk7XG4gICAgICBpZiAoc2hlbGxUb29sKSB0aGlzLnRvb2xNYXAuc2V0KHNoZWxsVG9vbC5uYW1lLCBzaGVsbFRvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVXRpbGl0eSB0b29scyBhcmUgYWx3YXlzIHJlZ2lzdGVyZWQgKG5vIHNwZWNpZmljIGNvbmZpZyBmbGFnKVxuICAgIGNvbnN0IGdldEVuYWJsZWRUb29scyA9ICgpID0+IEFycmF5LmZyb20odGhpcy50b29sTWFwLmtleXMoKSk7XG4gICAgcmVnaXN0ZXJVdGlsaXR5VG9vbHMoY29uZmlnLCBzdGF0ZU1hbmFnZXIsIGdldEVuYWJsZWRUb29scykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIFxuICAgIC8vIFJlZ2lzdGVyIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgcXVlcnkgdG9vbCAoYWx3YXlzIGF2YWlsYWJsZSlcbiAgICByZWdpc3RlckdldEN1cnJlbnRXb3JraW5nRGlyZWN0b3J5VG9vbCgpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgfVxuXG4gIGdldEFsbCgpOiBUb29sW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudG9vbE1hcC52YWx1ZXMoKSk7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogVHlwZWRUb29sIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy50b29sTWFwLmdldChuYW1lKTtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy50b29sTWFwLmhhcyhuYW1lKTtcbiAgfVxufVxuXG4vKipcbiAqIE1hbmFnZXMgdG9vbCBleGVjdXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb29sc1Byb3ZpZGVyIHtcbiAgcHJpdmF0ZSBjb25maWc6IFBsdWdpbkNvbmZpZztcbiAgcHJpdmF0ZSBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlcjtcbiAgcHJpdmF0ZSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcjtcbiAgcHJpdmF0ZSByZWdpc3RyeTogVG9vbFJlZ2lzdHJ5O1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZz86IFBsdWdpbkNvbmZpZywgbG1DbGllbnQ/OiBhbnkpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyB8fCBERUZBVUxUX0NPTkZJRztcbiAgICB0aGlzLnN0YXRlTWFuYWdlciA9IG5ldyBTdGF0ZU1hbmFnZXIodGhpcy5jb25maWcpO1xuICAgIHRoaXMuYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyID0gbmV3IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcih0aGlzLmNvbmZpZyk7XG4gICAgdGhpcy5yZWdpc3RyeSA9IG5ldyBUb29sUmVnaXN0cnkoKTtcbiAgICB0aGlzLnJlZ2lzdHJ5LnJlZ2lzdGVyQWxsKHRoaXMuY29uZmlnLCB0aGlzLnN0YXRlTWFuYWdlciwgdGhpcy5iYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIsIGxtQ2xpZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgdG9vbCBieSBuYW1lIHdpdGggcGFyYW1ldGVycy5cbiAgICovXG4gIGFzeW5jIGV4ZWN1dGVUb29sKHRvb2xOYW1lOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCB0b29sID0gdGhpcy5yZWdpc3RyeS5nZXQodG9vbE5hbWUpO1xuICAgIGlmICghdG9vbCkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCAnJHt0b29sTmFtZX0nIG5vdCBmb3VuZGAgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gU2FmZSBhY2Nlc3MgdmlhIHR5cGVkIHdyYXBwZXIgKEM0IGZpeClcbiAgICAgIGNvbnN0IGltcGwgPSB0b29sLmltcGxlbWVudGF0aW9uO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wbChwYXJhbXMpO1xuICAgICAgXG4gICAgICAvLyBVcGRhdGUgc3RhdGUgd2l0aCBleGVjdXRpb24gcmVzdWx0XG4gICAgICB0aGlzLnN0YXRlTWFuYWdlci5zZXQoYGxhc3RfJHt0b29sTmFtZX1gLCByZXN1bHQpO1xuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCBleGVjdXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGF2YWlsYWJsZSB0b29scyBmaWx0ZXJlZCBieSBjb25maWcuXG4gICAqL1xuICBnZXRBdmFpbGFibGVUb29scygpOiBUb29sW10ge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdldEFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3RhdGUgbWFuYWdlciBpbnN0YW5jZS5cbiAgICovXG4gIGdldFN0YXRlTWFuYWdlcigpOiBTdGF0ZU1hbmFnZXIge1xuICAgIHJldHVybiB0aGlzLnN0YXRlTWFuYWdlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbi5cbiAgICovXG4gIGdldENvbmZpZygpOiBQbHVnaW5Db25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuXG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVG9vbHNQcm92aWRlciB3aXRoIGRlZmF1bHQgY29uZmlnLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVG9vbHNQcm92aWRlcihjb25maWc/OiBQbHVnaW5Db25maWcpOiBUb29sc1Byb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBUb29sc1Byb3ZpZGVyKGNvbmZpZyk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNESyBQUk9WSURFUiBGVU5DVElPTiA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE1haW4gdG9vbHMgcHJvdmlkZXIgZnVuY3Rpb24gZm9yIExNIFN0dWRpbyBTREsuXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCB0aGF0IGdldHMgY2FsbGVkIGJ5IExNIFN0dWRpby5cbiAqIFxuICogSU1QT1JUQU5UOiBUaGUgTE0gU3R1ZGlvIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyBhbGwgVG9vbCBvYmplY3RzXG4gKiByZXR1cm5lZCBmcm9tIHRoaXMgcHJvdmlkZXIgZnVuY3Rpb24uIE5vIG1hbnVhbCBjdGwuYWRkKCkgY2FsbHMgbmVlZGVkIC1cbiAqIGp1c3QgcmV0dXJuIHRoZSBhcnJheSBkaXJlY3RseSBhbmQgdGhlIFNESyBoYW5kbGVzIHJlZ2lzdHJhdGlvbi5cbiAqIFxuICogTk9URTogTXVzdCBiZSBhc3luYyBcdTIwMTQgU0RLIHR5cGUgcmVxdWlyZXMgUHJvbWlzZTxUb29sW10+LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9vbHNQcm92aWRlcihjdGw6IFRvb2xzUHJvdmlkZXJDb250cm9sbGVyLCBsbUNsaWVudD86IGFueSk6IFByb21pc2U8VG9vbFtdPiB7XG4gIC8vIEZJWDogUmVhZCBjb25maWd1cmF0aW9uIGR5bmFtaWNhbGx5IGZyb20gVUkgY29udHJvbGxlciAobGlrZSBiZWxlZGFyaWFucyBwbHVnaW4pXG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIFxuICAvLyBDb25zdHJ1Y3QgYSBsaXZlIGNvbmZpZyBvYmplY3QgZnJvbSB0aGUgVUkgc3RhdGVcbiAgY29uc3QgbGl2ZUNvbmZpZzogUGx1Z2luQ29uZmlnID0ge1xuICAgIGZpbGVTeXN0ZW06IHBsdWdpbkNvbmZpZy5nZXQoJ2ZpbGVTeXN0ZW0nKSxcbiAgICB3ZWJTZWFyY2g6IHBsdWdpbkNvbmZpZy5nZXQoJ3dlYlNlYXJjaCcpLFxuICAgIGJyb3dzZXJBdXRvbWF0aW9uOiBwbHVnaW5Db25maWcuZ2V0KCdicm93c2VyQXV0b21hdGlvbicpLFxuICAgIGdpdE9wZXJhdGlvbnM6IHBsdWdpbkNvbmZpZy5nZXQoJ2dpdE9wZXJhdGlvbnMnKSxcbiAgICBkYXRhYmFzZVF1ZXJpZXM6IHBsdWdpbkNvbmZpZy5nZXQoJ2RhdGFiYXNlUXVlcmllcycpLFxuICAgIGRvY3VtZW50UGFyc2luZzogcGx1Z2luQ29uZmlnLmdldCgnZG9jdW1lbnRQYXJzaW5nJyksXG4gICAgYmFja2dyb3VuZENvbW1hbmRzOiBwbHVnaW5Db25maWcuZ2V0KCdiYWNrZ3JvdW5kQ29tbWFuZHMnKSxcbiAgICBpbWFnZVByb2Nlc3Npbmc6IHBsdWdpbkNvbmZpZy5nZXQoJ2ltYWdlUHJvY2Vzc2luZycpLFxuICAgIGh0dHBDbGllbnQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2h0dHBDbGllbnQnKSxcbiAgICB2ZWN0b3JSQUc6IHBsdWdpbkNvbmZpZy5nZXQoJ3ZlY3RvclJBRycpLFxuICAgIHVpR2VuZXJhdGlvbjogcGx1Z2luQ29uZmlnLmdldCgndWlHZW5lcmF0aW9uJyksXG4gICAgY29udGV4dE1hbmFnZW1lbnQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2NvbnRleHRNYW5hZ2VtZW50JyksXG4gICAgZ29kTW9kZTogcGx1Z2luQ29uZmlnLmdldCgnZ29kTW9kZScpLFxuICAgIGRvY3VtZW50UkFHOiBwbHVnaW5Db25maWcuZ2V0KCdkb2N1bWVudFJBRycpLFxuICAgIHJldHJpZXZhbExpbWl0OiBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxMaW1pdCcpLFxuICAgIHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkOiBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCcpLFxuICAgIGV4ZWN1dGlvbkphdmFTY3JpcHQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvbkphdmFTY3JpcHQnKSxcbiAgICBleGVjdXRpb25QeXRob246IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvblB5dGhvbicpLFxuICAgIGV4ZWN1dGlvblRlcm1pbmFsOiBwbHVnaW5Db25maWcuZ2V0KCdleGVjdXRpb25UZXJtaW5hbCcpLFxuICAgIGV4ZWN1dGlvblNoZWxsOiBwbHVnaW5Db25maWcuZ2V0KCdleGVjdXRpb25TaGVsbCcpLFxuICAgIHNlYXJjaEZhbGxiYWNrQ2hhaW46IHBsdWdpbkNvbmZpZy5nZXQoJ3NlYXJjaEZhbGxiYWNrQ2hhaW4nKSBhcyAnZGRnLWFwaScgfCAnZGRnLWZldGNoJyB8ICdnb29nbGUnIHwgJ2JpbmcnLFxuICAgIG1heFNlYXJjaFJlc3VsdHM6IHBsdWdpbkNvbmZpZy5nZXQoJ21heFNlYXJjaFJlc3VsdHMnKSxcbiAgICBzYWZlc2VhcmNoOiBwbHVnaW5Db25maWcuZ2V0KCdzYWZlc2VhcmNoJykgYXMgJzAnIHwgJzEnIHwgJzInLFxuICAgIGJyb3dzZXJUaW1lb3V0OiBwbHVnaW5Db25maWcuZ2V0KCdicm93c2VyVGltZW91dCcpLFxuICAgIGhlYWRsZXNzTW9kZTogcGx1Z2luQ29uZmlnLmdldCgnaGVhZGxlc3NNb2RlJyksXG4gICAgZ2l0QXV0b0NvbW1pdDogcGx1Z2luQ29uZmlnLmdldCgnZ2l0QXV0b0NvbW1pdCcpLFxuICAgIGRlZmF1bHRCcmFuY2g6IHBsdWdpbkNvbmZpZy5nZXQoJ2RlZmF1bHRCcmFuY2gnKSxcbiAgICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3BhdGhWYWxpZGF0aW9uRW5hYmxlZCcpLFxuICAgIGJpbmFyeUZpbGVEZXRlY3Rpb246IHBsdWdpbkNvbmZpZy5nZXQoJ2JpbmFyeUZpbGVEZXRlY3Rpb24nKSxcbiAgICByZWdleFJlRG9TUHJvdGVjdGlvbjogcGx1Z2luQ29uZmlnLmdldCgncmVnZXhSZURvU1Byb3RlY3Rpb24nKSxcbiAgICBtYXhSZWdleExlbmd0aDogcGx1Z2luQ29uZmlnLmdldCgnbWF4UmVnZXhMZW5ndGgnKSxcbiAgICBzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDogcGx1Z2luQ29uZmlnLmdldCgnc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQnKSxcbiAgICBzdGF0ZU1heFNpemU6IHBsdWdpbkNvbmZpZy5nZXQoJ3N0YXRlTWF4U2l6ZScpLFxuICAgIGxhbmd1YWdlOiBwbHVnaW5Db25maWcuZ2V0KCdsYW5ndWFnZScpIGFzICdlbicgfCAnZGUnIHwgJ3poLUNOJyB8ICd6aC1UVycsXG4gICAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHBsdWdpbkNvbmZpZy5nZXQoJ25vdGlmaWNhdGlvbnNFbmFibGVkJyksXG4gICAgdGVtcG9yYWxBd2FyZW5lc3M6IHBsdWdpbkNvbmZpZy5nZXQoJ3RlbXBvcmFsQXdhcmVuZXNzJyksXG4gICAgZGF0ZUZvcm1hdFN0eWxlOiBwbHVnaW5Db25maWcuZ2V0KCdkYXRlRm9ybWF0U3R5bGUnKSBhcyAnc3RhbmRhcmQnIHwgJ2hldXRlSXN0JyxcbiAgICAvLyBDb250ZXh0R3VhcmQgc2V0dGluZ3NcbiAgICBjb250ZXh0R3VhcmRFbmFibGVkOiBwbHVnaW5Db25maWcuZ2V0KCdjb250ZXh0R3VhcmRFbmFibGVkJyksXG4gICAgY29udGV4dEd1YXJkVG9rZW5MaW1pdDogcGx1Z2luQ29uZmlnLmdldCgnY29udGV4dEd1YXJkVG9rZW5MaW1pdCcpLFxuICAgIGNvbnRleHRHdWFyZFNtYXJ0UmVhZGluZzogcGx1Z2luQ29uZmlnLmdldCgnY29udGV4dEd1YXJkU21hcnRSZWFkaW5nJyksXG4gICAgY29udGV4dEd1YXJkU3VtbWFyeU1vZGVsOiBwbHVnaW5Db25maWcuZ2V0KCdjb250ZXh0R3VhcmRTdW1tYXJ5TW9kZWwnKSxcbiAgICBjb250ZXh0R3VhcmRUZXJtaW5hbEZpbHRlckVuYWJsZWQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2NvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyRW5hYmxlZCcpLFxuICAgIGNvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyTGVuZ3RoOiBwbHVnaW5Db25maWcuZ2V0KCdjb250ZXh0R3VhcmRUZXJtaW5hbEZpbHRlckxlbmd0aCcpLFxuICAgIC8vIEF1dG8tdHJhY2tpbmcgc2V0dGluZ3NcbiAgICBhdXRvVHJhY2tpbmdFbmFibGVkOiBwbHVnaW5Db25maWcuZ2V0KCdhdXRvVHJhY2tpbmdFbmFibGVkJyksXG4gICAgYXV0b1RyYWNrRGVjaXNpb25zOiBwbHVnaW5Db25maWcuZ2V0KCdhdXRvVHJhY2tEZWNpc2lvbnMnKSxcbiAgICBhdXRvVHJhY2tDb21wbGV0aW9uczogcGx1Z2luQ29uZmlnLmdldCgnYXV0b1RyYWNrQ29tcGxldGlvbnMnKSxcbiAgICBhdXRvVHJhY2tFcnJvcnM6IHBsdWdpbkNvbmZpZy5nZXQoJ2F1dG9UcmFja0Vycm9ycycpLFxuICAgIGF1dG9TdW1tYXJ5SW50ZXJ2YWw6IHBsdWdpbkNvbmZpZy5nZXQoJ2F1dG9TdW1tYXJ5SW50ZXJ2YWwnKSxcbiAgfTtcblxuICBjb25zdCBwcm92aWRlciA9IGNyZWF0ZVRvb2xzUHJvdmlkZXIobGl2ZUNvbmZpZyk7XG4gIFxuICAvLyBSZXR1cm4gYWxsIGF2YWlsYWJsZSB0b29scyAtIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyB0aGVtXG4gIHJldHVybiBwcm92aWRlci5nZXRBdmFpbGFibGVUb29scygpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gcmVmZXJlbmNlLlxuICogQ2FsbCB0aGlzIGZyb20gbWFpbigpIHRvIGVuc3VyZSB0b29sc1Byb3ZpZGVyIHVzZXMgdGhlIGxhdGVzdCB1c2VyIHNldHRpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlR2xvYmFsQ29uZmlnKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogdm9pZCB7XG4gIGN1cnJlbnRDb25maWcgPSBjb25maWc7XG59XG4iLCAiLyoqXG4gKiBBdXRvLVRyYWNraW5nIE1vZHVsZVxuICogXG4gKiBBdXRvbWF0aWNhbGx5IGRldGVjdHMgYW5kIHRyYWNrcyBpbXBvcnRhbnQgZXZlbnRzIGluIGNvbnZlcnNhdGlvbjpcbiAqIC0gRGVjaXNpb25zIChcIkkgZGVjaWRlZFwiLCBcImNvbmNsdXNpb25cIilcbiAqIC0gQ29tcGxldGlvbnMgKFwic3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZFwiLCBcImZpbmlzaGVkXCIpXG4gKiAtIEVycm9yIGZpeGVzIChcImZpeGVkIHRoZSBidWdcIiwgXCJyZXNvbHZlZFwiKVxuICogXG4gKiBSdW5zIHNpbGVudGx5IGluIGJhY2tncm91bmQgd2hlbiBlbmFibGVkLlxuICovXG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUWVBFUyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgQXV0b1RyYWNrQ29uZmlnU2NoZW1hID0gei5vYmplY3Qoe1xuICBhdXRvVHJhY2tpbmdFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgYXV0b1RyYWNrRGVjaXNpb25zOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBhdXRvVHJhY2tDb21wbGV0aW9uczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgYXV0b1RyYWNrRXJyb3JzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBhdXRvU3VtbWFyeUludGVydmFsOiB6Lm51bWJlcigpLm1pbigxMCkubWF4KDIwMCkuZGVmYXVsdCg1MCksXG59KTtcblxuZXhwb3J0IHR5cGUgQXV0b1RyYWNrQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQXV0b1RyYWNrQ29uZmlnU2NoZW1hPjtcblxuZXhwb3J0IGludGVyZmFjZSBBdXRvVHJhY2tBY3Rpb24ge1xuICB0eXBlOiAnZGVjaXNpb24nIHwgJ2NvbXBsZXRpb24nIHwgJ2Vycm9yX2ZpeCc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgb3JpZ2luYWxNZXNzYWdlOiBzdHJpbmc7XG4gIGNvbmZpZGVuY2U6IG51bWJlcjsgLy8gMC0xIG1hdGNoIGNvbmZpZGVuY2Vcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUcmFja1Jlc3VsdCB7XG4gIHRyYWNrZWQ6IGJvb2xlYW47XG4gIGFjdGlvbj86IEF1dG9UcmFja0FjdGlvbjtcbiAgbWVzc2FnZT86IHN0cmluZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gUEFUVEVSTiBERUZJTklUSU9OUyA9PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCBERUNJU0lPTl9QQVRURVJOUyA9IFtcbiAgeyBwYXR0ZXJuOiAvZGVjaWRlZFxccysodG98dXBvbikvaSwgd2VpZ2h0OiAwLjkgfSxcbiAgeyBwYXR0ZXJuOiAvY29uY2x1c2lvbls6XFxzXSsvaSwgd2VpZ2h0OiAwLjg1IH0sXG4gIHsgcGF0dGVybjogL2ZpbmFsXFxzK2RlY2lzaW9uL2ksIHdlaWdodDogMC45IH0sXG4gIHsgcGF0dGVybjogL2dvaW5nXFxzK3dpdGgvaSwgd2VpZ2h0OiAwLjcgfSxcbiAgeyBwYXR0ZXJuOiAvc2V0dGxlZFxccytvbi9pLCB3ZWlnaHQ6IDAuNzUgfSxcbiAgeyBwYXR0ZXJuOiAvY2hvc2VcXHMrdG8vaSwgd2VpZ2h0OiAwLjcgfSxcbl07XG5cbmNvbnN0IENPTVBMRVRJT05fUEFUVEVSTlMgPSBbXG4gIHsgcGF0dGVybjogL3N1Y2Nlc3NmdWxseVxccysoY29tcGxldGVkfGZpbmlzaGVkKS9pLCB3ZWlnaHQ6IDAuOSB9LFxuICB7IHBhdHRlcm46IC9kb25lXFxzK3dpdGgvaSwgd2VpZ2h0OiAwLjYgfSxcbiAgeyBwYXR0ZXJuOiAvY29tcGxldGVkXFxzK3RoZS9pLCB3ZWlnaHQ6IDAuNzUgfSxcbiAgeyBwYXR0ZXJuOiAvZmluaXNoZWRcXHMraW1wbGVtZW50aW5nL2ksIHdlaWdodDogMC44IH0sXG4gIHsgcGF0dGVybjogL2ltcGxlbWVudGF0aW9uXFxzK2NvbXBsZXRlL2ksIHdlaWdodDogMC44NSB9LFxuXTtcblxuY29uc3QgRVJST1JfRklYX1BBVFRFUk5TID0gW1xuICB7IHBhdHRlcm46IC9maXhlZFxccysodGhlfGEpL2ksIHdlaWdodDogMC44IH0sXG4gIHsgcGF0dGVybjogL3Jlc29sdmVkXFxzK3RoZS9pLCB3ZWlnaHQ6IDAuOCB9LFxuICB7IHBhdHRlcm46IC9idWdcXHMrZml4L2ksIHdlaWdodDogMC43NSB9LFxuICB7IHBhdHRlcm46IC9lcnJvci4qc29sdmVkL2ksIHdlaWdodDogMC43IH0sXG4gIHsgcGF0dGVybjogL2lzc3VlXFxzKyhyZXNvbHZlZHxhZGRyZXNzZWQpL2ksIHdlaWdodDogMC43NSB9LFxuXTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQVVUTy1UUkFDS0VSIENMQVNTID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjbGFzcyBBdXRvVHJhY2tlciB7XG4gIHByaXZhdGUgY29uZmlnOiBBdXRvVHJhY2tDb25maWc7XG4gIHByaXZhdGUgbWVzc2FnZUNvdW50ID0gMDtcbiAgcHJpdmF0ZSByZWFkb25seSBNSU5fQ09ORklERU5DRSA9IDAuNjsgLy8gTWluaW11bSBjb25maWRlbmNlIHRvIHRyaWdnZXIgdHJhY2tpbmdcblxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQYXJ0aWFsPEF1dG9UcmFja0NvbmZpZz4pIHtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIGF1dG9UcmFja2luZ0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgYXV0b1RyYWNrRGVjaXNpb25zOiB0cnVlLFxuICAgICAgYXV0b1RyYWNrQ29tcGxldGlvbnM6IHRydWUsXG4gICAgICBhdXRvVHJhY2tFcnJvcnM6IHRydWUsXG4gICAgICBhdXRvU3VtbWFyeUludGVydmFsOiA1MCxcbiAgICAgIC4uLmNvbmZpZyxcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKGBbQXV0b1RyYWNrZXJdIEluaXRpYWxpemVkIHdpdGggY29uZmlnOmAsIHRoaXMuY29uZmlnKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgY29uZmlndXJhdGlvbiBkeW5hbWljYWxseSAqL1xuICB1cGRhdGVDb25maWcocGFydGlhbDogUGFydGlhbDxBdXRvVHJhY2tDb25maWc+KTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcgPSB7IC4uLnRoaXMuY29uZmlnLCAuLi5wYXJ0aWFsIH07XG4gICAgY29uc29sZS5sb2coYFtBdXRvVHJhY2tlcl0gQ29uZmlnIHVwZGF0ZWQ6YCwgdGhpcy5jb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emUgYSBtZXNzYWdlIGZvciBhdXRvLXRyYWNraW5nIHRyaWdnZXJzLlxuICAgKiBSZXR1cm5zIGFycmF5IG9mIGRldGVjdGVkIGFjdGlvbnMgKGNhbiBiZSBtdWx0aXBsZSkuXG4gICAqL1xuICBhbmFseXplTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiBBdXRvVHJhY2tBY3Rpb25bXSB7XG4gICAgY29uc3QgYWN0aW9uczogQXV0b1RyYWNrQWN0aW9uW10gPSBbXTtcblxuICAgIGlmICghdGhpcy5jb25maWcuYXV0b1RyYWNraW5nRW5hYmxlZCkge1xuICAgICAgcmV0dXJuIGFjdGlvbnM7XG4gICAgfVxuXG4gICAgLy8gVHJhY2sgZGVjaXNpb25zXG4gICAgaWYgKHRoaXMuY29uZmlnLmF1dG9UcmFja0RlY2lzaW9ucykge1xuICAgICAgY29uc3QgZGVjaXNpb25NYXRjaCA9IHRoaXMuZGV0ZWN0UGF0dGVybihtZXNzYWdlLCBERUNJU0lPTl9QQVRURVJOUyk7XG4gICAgICBpZiAoZGVjaXNpb25NYXRjaCkge1xuICAgICAgICBhY3Rpb25zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdkZWNpc2lvbicsXG4gICAgICAgICAgY29udGVudDogdGhpcy5leHRyYWN0Q29udGVudChtZXNzYWdlLCBkZWNpc2lvbk1hdGNoLnBhdHRlcm4pLFxuICAgICAgICAgIG9yaWdpbmFsTWVzc2FnZTogbWVzc2FnZS5zbGljZSgwLCA1MDApLCAvLyBUcnVuY2F0ZSBmb3Igc3RvcmFnZVxuICAgICAgICAgIGNvbmZpZGVuY2U6IGRlY2lzaW9uTWF0Y2gud2VpZ2h0ID8/IDAsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRyYWNrIGNvbXBsZXRpb25zXG4gICAgaWYgKHRoaXMuY29uZmlnLmF1dG9UcmFja0NvbXBsZXRpb25zKSB7XG4gICAgICBjb25zdCBjb21wbGV0aW9uTWF0Y2ggPSB0aGlzLmRldGVjdFBhdHRlcm4obWVzc2FnZSwgQ09NUExFVElPTl9QQVRURVJOUyk7XG4gICAgICBpZiAoY29tcGxldGlvbk1hdGNoKSB7XG4gICAgICAgIGFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2NvbXBsZXRpb24nLFxuICAgICAgICAgIGNvbnRlbnQ6IHRoaXMuZXh0cmFjdENvbnRlbnQobWVzc2FnZSwgY29tcGxldGlvbk1hdGNoLnBhdHRlcm4pLFxuICAgICAgICAgIG9yaWdpbmFsTWVzc2FnZTogbWVzc2FnZS5zbGljZSgwLCA1MDApLFxuICAgICAgICAgIGNvbmZpZGVuY2U6IGNvbXBsZXRpb25NYXRjaC53ZWlnaHQgPz8gMCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVHJhY2sgZXJyb3IgZml4ZXNcbiAgICBpZiAodGhpcy5jb25maWcuYXV0b1RyYWNrRXJyb3JzKSB7XG4gICAgICBjb25zdCBlcnJvck1hdGNoID0gdGhpcy5kZXRlY3RQYXR0ZXJuKG1lc3NhZ2UsIEVSUk9SX0ZJWF9QQVRURVJOUyk7XG4gICAgICBpZiAoZXJyb3JNYXRjaCkge1xuICAgICAgICBhY3Rpb25zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdlcnJvcl9maXgnLFxuICAgICAgICAgIGNvbnRlbnQ6IHRoaXMuZXh0cmFjdENvbnRlbnQobWVzc2FnZSwgZXJyb3JNYXRjaC5wYXR0ZXJuKSxcbiAgICAgICAgICBvcmlnaW5hbE1lc3NhZ2U6IG1lc3NhZ2Uuc2xpY2UoMCwgNTAwKSxcbiAgICAgICAgICBjb25maWRlbmNlOiBlcnJvck1hdGNoLndlaWdodCA/PyAwLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbmNyZW1lbnQgbWVzc2FnZSBjb3VudGVyIGZvciBzZXNzaW9uIHN1bW1hcmllc1xuICAgIHRoaXMubWVzc2FnZUNvdW50Kys7XG4gICAgaWYgKHRoaXMubWVzc2FnZUNvdW50ICUgdGhpcy5jb25maWcuYXV0b1N1bW1hcnlJbnRlcnZhbCA9PT0gMCkge1xuICAgICAgY29uc29sZS5sb2coYFtBdXRvVHJhY2tlcl0gU2Vzc2lvbiBzdW1tYXJ5IGludGVydmFsIHJlYWNoZWQ6ICR7dGhpcy5tZXNzYWdlQ291bnR9IG1lc3NhZ2VzYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZWN0IGlmIGFueSBwYXR0ZXJuIG1hdGNoZXMgdGhlIHRleHQuXG4gICAqIFJldHVybnMgaGlnaGVzdC13ZWlnaHQgbWF0Y2ggb3IgbnVsbC5cbiAgICovXG4gIHByaXZhdGUgZGV0ZWN0UGF0dGVybihcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcGF0dGVybnM6IEFycmF5PHsgcGF0dGVybjogUmVnRXhwOyB3ZWlnaHQ6IG51bWJlciB9PlxuICApOiB7IHBhdHRlcm46IFJlZ0V4cDsgd2VpZ2h0PzogbnVtYmVyIH0gfCBudWxsIHtcbiAgICBsZXQgYmVzdE1hdGNoOiB7IHBhdHRlcm46IFJlZ0V4cDsgd2VpZ2h0PzogbnVtYmVyIH0gfCBudWxsID0gbnVsbDtcblxuICAgIGZvciAoY29uc3QgeyBwYXR0ZXJuLCB3ZWlnaHQgfSBvZiBwYXR0ZXJucykge1xuICAgICAgaWYgKHBhdHRlcm4udGVzdCh0ZXh0KSkge1xuICAgICAgICBpZiAoIWJlc3RNYXRjaCB8fCB3ZWlnaHQgPiAoYmVzdE1hdGNoLndlaWdodCA/PyAwKSkge1xuICAgICAgICAgIGJlc3RNYXRjaCA9IHsgcGF0dGVybiwgd2VpZ2h0IH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmVzdE1hdGNoPy53ZWlnaHQgIT09IHVuZGVmaW5lZCAmJiBiZXN0TWF0Y2gud2VpZ2h0ID49IHRoaXMuTUlOX0NPTkZJREVOQ0UgPyBiZXN0TWF0Y2ggOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgbWVhbmluZ2Z1bCBjb250ZW50IGFyb3VuZCB0aGUgbWF0Y2hlZCBwYXR0ZXJuLlxuICAgKi9cbiAgcHJpdmF0ZSBleHRyYWN0Q29udGVudCh0ZXh0OiBzdHJpbmcsIHBhdHRlcm46IFJlZ0V4cCk6IHN0cmluZyB7XG4gICAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHBhdHRlcm4pO1xuICAgIGlmICghbWF0Y2gpIHJldHVybiB0ZXh0LnNsaWNlKDAsIDIwMCk7XG5cbiAgICAvLyBHZXQgY29udGV4dCBhcm91bmQgdGhlIG1hdGNoICh1cCB0byBlbmQgb2Ygc2VudGVuY2UpXG4gICAgY29uc3Qgc3RhcnRQb3MgPSBNYXRoLm1heCgwLCBtYXRjaC5pbmRleCEgLSA1MCk7XG4gICAgY29uc3QgZW5kUG9zID0gdGV4dC5pbmRleE9mKCcuJywgbWF0Y2hbMF0ubGVuZ3RoKSArIDE7XG4gICAgXG4gICAgcmV0dXJuIHRleHQuc2xpY2Uoc3RhcnRQb3MsIGVuZFBvcyB8fCBzdGFydFBvcyArIDIwMCkudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1lc3NhZ2UgY291bnQgKGZvciBzZXNzaW9uIHN1bW1hcnkgdHJhY2tpbmcpLlxuICAgKi9cbiAgZ2V0TWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZUNvdW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IG1lc3NhZ2UgY291bnRlciAoZS5nLiwgbmV3IGNoYXQgc2Vzc2lvbikuXG4gICAqL1xuICByZXNldENvdW50ZXIoKTogdm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlQ291bnQgPSAwO1xuICAgIGNvbnNvbGUubG9nKGBbQXV0b1RyYWNrZXJdIE1lc3NhZ2UgY291bnRlciByZXNldGApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjb25maWd1cmF0aW9uLlxuICAgKi9cbiAgZ2V0Q29uZmlnKCk6IEF1dG9UcmFja0NvbmZpZyB7XG4gICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTSU5HTEVUT04gSU5TVEFOQ0UgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IGF1dG9UcmFja2VyID0gbmV3IEF1dG9UcmFja2VyKCk7XG4iLCAiLyoqXG4gKiBEb2N1bWVudCBSQUcgUHJvbXB0IFByZXByb2Nlc3NvciArIFdvcmtpbmcgRGlyZWN0b3J5IERldGVjdGlvbiArIFRlbXBvcmFsIEF3YXJlbmVzc1xuICovXG5cbmltcG9ydCB7IHR5cGUgQ2hhdE1lc3NhZ2UsIHR5cGUgRmlsZUhhbmRsZSwgdHlwZSBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHBkZlBhcnNlIGZyb20gJ3BkZi1wYXJzZSc7XG5pbXBvcnQgeyBDb250ZXh0R3VhcmQgfSBmcm9tICcuL2NvbnRleHRHdWFyZCc7XG5pbXBvcnQgeyBzZXRBdHRhY2htZW50cywgbGlzdEF0dGFjaG1lbnRzIH0gZnJvbSAnLi9hdHRhY2htZW50TWFuYWdlcic7XG5pbXBvcnQgeyBhdXRvVHJhY2tlciB9IGZyb20gJy4vYXV0b1RyYWNrZXInO1xuXG4vLyAtLS0gVGVtcG9yYWwgQXdhcmVuZXNzIEhlbHBlcnMgKG1lcmdlZCBmcm9tIHVwX3RvX2RhdGUpIC0tLVxuaW50ZXJmYWNlIERhdGVUaW1lQ2FjaGUge1xuICBjb21wYWN0OiBzdHJpbmc7XG4gIGZ1bGw6IHN0cmluZztcbn1cblxubGV0IGNhY2hlZERhdGVUaW1lRGF0YTogRGF0ZVRpbWVDYWNoZSB8IG51bGwgPSBudWxsO1xuY29uc3QgQ0FDSEVfRFVSQVRJT05fTVMgPSA1ICogNjAgKiAxMDAwOyAvLyBSZWZyZXNoIGV2ZXJ5IDUgbWludXRlc1xuXG4vLyBDb250ZXh0R3VhcmQgaW50ZWdyYXRpb25cbmxldCBjb250ZXh0R3VhcmQ6IENvbnRleHRHdWFyZCB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29udGV4dEd1YXJkKGd1YXJkOiBDb250ZXh0R3VhcmQgfCBudWxsKTogdm9pZCB7XG4gIGNvbnRleHRHdWFyZCA9IGd1YXJkO1xufVxubGV0IGNhY2hlVGltZXN0YW1wID0gMDtcblxuZnVuY3Rpb24gZ2V0Q2FjaGVkRGF0ZVRpbWUoKTogRGF0ZVRpbWVDYWNoZSB7XG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gIFxuICBpZiAoY2FjaGVkRGF0ZVRpbWVEYXRhICYmIChub3cgLSBjYWNoZVRpbWVzdGFtcCkgPCBDQUNIRV9EVVJBVElPTl9NUykge1xuICAgIHJldHVybiBjYWNoZWREYXRlVGltZURhdGE7XG4gIH1cbiAgXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICBcbiAgLy8gQ29tcGFjdCBmb3JtYXQ6IERELk1NLllZWVksIEhIOm1tXG4gIGNvbnN0IGNvbXBhY3QgPSBkYXRlLnRvTG9jYWxlU3RyaW5nKCdkZS1ERScsIHtcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgbW9udGg6ICcyLWRpZ2l0JyxcbiAgICBkYXk6ICcyLWRpZ2l0JyxcbiAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgbWludXRlOiAnMi1kaWdpdCdcbiAgfSk7XG4gIFxuICAvLyBGdWxsIGZvcm1hdDogV29jaGVudGFnLCBERC4gTU1NTSBZWVlZLCBISDptbSBVaHJcbiAgY29uc3QgZnVsbCA9IGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2RlLURFJywge1xuICAgIHdlZWtkYXk6ICdsb25nJyxcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgbW9udGg6ICdsb25nJyxcbiAgICBkYXk6ICdudW1lcmljJyxcbiAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgbWludXRlOiAnMi1kaWdpdCdcbiAgfSkgKyAnIFVocic7XG4gIFxuICBjYWNoZWREYXRlVGltZURhdGEgPSB7IGNvbXBhY3QsIGZ1bGwgfTtcbiAgY2FjaGVUaW1lc3RhbXAgPSBub3c7XG4gIFxuICByZXR1cm4gY2FjaGVkRGF0ZVRpbWVEYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRUZW1wb3JhbFN1ZmZpeChjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIpOiBzdHJpbmcge1xuICBjb25zdCBjb25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBcbiAgLy8gVXNlIC5nZXQoKSBtZXRob2Qgd2l0aCBwcm9wZXIgZGVmYXVsdHMgLSBtb3JlIHJlbGlhYmxlIHRoYW4gZGlyZWN0IHByb3BlcnR5IGFjY2Vzc1xuICBjb25zdCB0ZW1wb3JhbEF3YXJlbmVzc0VuYWJsZWQgPSBjb25maWcuZ2V0KCd0ZW1wb3JhbEF3YXJlbmVzcycpID8/IHRydWU7XG4gIFxuICBpZiAoIXRlbXBvcmFsQXdhcmVuZXNzRW5hYmxlZCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBcbiAgY29uc3Qgc3R5bGUgPSBjb25maWcuZ2V0KCdkYXRlRm9ybWF0U3R5bGUnKSA/PyAnc3RhbmRhcmQnO1xuICBjb25zdCB7IGNvbXBhY3QsIGZ1bGwgfSA9IGdldENhY2hlZERhdGVUaW1lKCk7XG4gIFxuICAvLyBERUJVRzogVW5jb21tZW50IHRvIHZlcmlmeSB3aGF0J3MgYmVpbmcgaW5qZWN0ZWRcbiAgY29uc29sZS5sb2coYFtURU1QT1JBTF0gSW5qZWN0aW5nOiAke3N0eWxlID09PSAnaGV1dGVJc3QnID8gYEhFVVRFIElTVCAke2Z1bGx9YCA6IGBbWmVpdDogJHtjb21wYWN0fV1gfWApO1xuICBcbiAgaWYgKHN0eWxlID09PSAnaGV1dGVJc3QnKSB7XG4gICAgcmV0dXJuIGBcXG5cXG5IRVVURSBJU1QgJHtmdWxsfWA7XG4gIH1cbiAgcmV0dXJuIGBcXG5cXG5bWmVpdDogJHtjb21wYWN0fV1gO1xufVxuXG5mdW5jdGlvbiBkZXRlY3REaXJlY3RvcnlQYXRoKHRleHQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAvLyBSZW1vdmUgVVJMcyBmaXJzdCB0byBhdm9pZCBmYWxzZSBwb3NpdGl2ZXMgbGlrZSAvbWVkaXVtLmNvbSBmcm9tIGh0dHBzOi8vbWVkaXVtLmNvbS8uLi5cbiAgY29uc3Qgd2l0aG91dFVybHMgPSB0ZXh0LnJlcGxhY2UoL2h0dHBzPzpcXC9cXC9bXlxcc10rfHd3d1xcLlteXFxzXSt8ZmlsZTpcXC9cXC9bXlxcc10rL2csICcnKTtcblxuICAvLyBXaW5kb3dzIHBhdGhzOiBDOlxccGF0aCBvciBEOlxcZm9sZGVyIChtdXN0IHN0YXJ0IHdpdGggZHJpdmUgbGV0dGVyKVxuICAgY29uc3Qgd2luTWF0Y2ggPSB3aXRob3V0VXJscy5tYXRjaCgvW0EtWmEtel06XFxcXFtcXHdcXC1fLiBcXFxcXSsvKTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXl5eXl5eXl5eXlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCYWNrc2xhc2ggYWRkZWQgXHUyNzEzXG4gIGlmICh3aW5NYXRjaCkgcmV0dXJuIHdpbk1hdGNoWzBdLnRyaW0oKTtcblxuICAvLyBVbml4IGFic29sdXRlIHBhdGhzOiAvaG9tZS91c2VyL2RpciwgL3Zhci9sb2csIGV0Yy5cbiAgY29uc3QgdW5peE1hdGNoID0gd2l0aG91dFVybHMubWF0Y2goLyg/Ol58XFxzKShcXC9bXFx3XFwtXy4gXXsyLH0pLyk7XG4gIGlmICh1bml4TWF0Y2gpIHtcbiAgICBjb25zdCBwYXRoID0gdW5peE1hdGNoWzFdLnRyaW0oKTtcbiAgICAvLyBSZWplY3QgcGF0aHMgdGhhdCBsb29rIGxpa2UgVVJMcyBvciBmcmFnbWVudHMgKGUuZy4sIC8gQ2hhdCBmaWxlcyBzKVxuICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvICcpICYmICFwYXRoLmluY2x1ZGVzKCcgJykpIHtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlbGF0aXZlIHBhdGhzOiAuL2ZvbGRlciwgLi4vcGFyZW50L2RpclxuICBjb25zdCByZWxNYXRjaCA9IHdpdGhvdXRVcmxzLm1hdGNoKC8oPzpefFxccykoPzpcXC5cXC98XFwuXFxcXC5cXC98XFwuXFwuXFwvKVtcXHdcXC1fLiBdKy8pO1xuICBpZiAocmVsTWF0Y2gpIHJldHVybiByZWxNYXRjaFswXS50cmltKCk7XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGluamVjdFdvcmtpbmdEaXJlY3RvcnlQcm9tcHQob3JpZ2luYWxNZXNzYWdlOiBzdHJpbmcsIGRldGVjdGVkUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgaW5zdHJ1Y3Rpb24gPSBgXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblx1MjZBMFx1RkUwRiBXT1JLSU5HIERJUkVDVE9SWSBERVRFQ1RFRFxuXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXG5cblRoZSB1c2VyIG1lbnRpb25lZCBhIGRpcmVjdG9yeSBwYXRoIGluIHRoZWlyIG1lc3NhZ2U6XG5cbiAgICAke2RldGVjdGVkUGF0aH1cblxuUGxlYXNlIGFzayB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uIGJlZm9yZSBjaGFuZ2luZyB0aGUgd29ya2luZyBkaXJlY3RvcnkuXG5FeGFtcGxlIHJlc3BvbnNlOlxuXG5cIkkgbm90aWNlZCB5b3UgbWVudGlvbmVkIHRoZSBkaXJlY3RvcnkgJyR7ZGV0ZWN0ZWRQYXRofScuIFxuV291bGQgeW91IGxpa2UgbWUgdG8gc2V0IHRoaXMgYXMgeW91ciB3b3JraW5nIGRpcmVjdG9yeT8gXG5BbGwgc3Vic2VxdWVudCBmaWxlIG9wZXJhdGlvbnMgd2lsbCB1c2UgdGhpcyBkaXJlY3RvcnkgYXMgdGhlIGJhc2UuXG5cblJlcGx5ICd5ZXMnIG9yICdqYScgdG8gY29uZmlybSwgb3IgJ25vJy8nbmVpbicgdG8gZGVjbGluZS5cIlxuXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblxuVXNlcidzIG9yaWdpbmFsIG1lc3NhZ2U6XG4ke29yaWdpbmFsTWVzc2FnZX1cbmA7XG4gIFxuICByZXR1cm4gaW5zdHJ1Y3Rpb24udHJpbSgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBleHRyYWN0UGRmVGV4dChmaWxlSGFuZGxlOiBGaWxlSGFuZGxlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCAoZmlsZUhhbmRsZSBhcyBhbnkpLnJlYWRGaWxlID8gYXdhaXQgKGZpbGVIYW5kbGUgYXMgYW55KS5yZWFkRmlsZSgpIDogQnVmZmVyLmZyb20oYXdhaXQgKGZpbGVIYW5kbGUgYXMgYW55KS5yZWFkKCkpO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBwZGZQYXJzZShidWZmZXIpO1xuICAgIHJldHVybiBkYXRhLnRleHQudHJpbSgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoYFtSQUddIEVycm9yIGV4dHJhY3RpbmcgdGV4dCBmcm9tIFBERiAke2ZpbGVIYW5kbGUubmFtZX06YCwgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHBhcnNlIFBERjogJHtmaWxlSGFuZGxlLm5hbWV9YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2h1bmtUZXh0KHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSAxMDAwLCBvdmVybGFwOiBudW1iZXIgPSAxMDApOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHdvcmRzID0gdGV4dC5zcGxpdCgvXFxzKy8pO1xuICBjb25zdCBjaHVua3M6IHN0cmluZ1tdID0gW107XG4gIFxuICBpZiAod29yZHMubGVuZ3RoIDw9IGNodW5rU2l6ZSkge1xuICAgIHJldHVybiBbdGV4dF07XG4gIH1cblxuICBsZXQgc3RhcnRJbmRleCA9IDA7XG4gIHdoaWxlIChzdGFydEluZGV4IDwgd29yZHMubGVuZ3RoKSB7XG4gICAgY29uc3QgZW5kSW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4ICsgY2h1bmtTaXplLCB3b3Jkcy5sZW5ndGgpO1xuICAgIGNvbnN0IGNodW5rVGV4dCA9IHdvcmRzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KS5qb2luKCcgJyk7XG4gICAgXG4gICAgY2h1bmtzLnB1c2goY2h1bmtUZXh0KTtcbiAgICBzdGFydEluZGV4ID0gZW5kSW5kZXggLSBvdmVybGFwO1xuICB9XG5cbiAgcmV0dXJuIGNodW5rcy5maWx0ZXIoYyA9PiBjLnRyaW0oKS5sZW5ndGggPiAwKTtcbn1cblxuZnVuY3Rpb24gY29zaW5lU2ltaWxhcml0eShhOiBudW1iZXJbXSwgYjogbnVtYmVyW10pOiBudW1iZXIge1xuICBsZXQgZG90UHJvZHVjdCA9IDA7XG4gIGxldCBub3JtQSA9IDA7XG4gIGxldCBub3JtQiA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgIGRvdFByb2R1Y3QgKz0gYVtpXSAqIGJbaV07XG4gICAgbm9ybUEgKz0gYVtpXSAqIGFbaV07XG4gICAgbm9ybUIgKz0gYltpXSAqIGJbaV07XG4gIH1cbiAgcmV0dXJuIGRvdFByb2R1Y3QgLyAoTWF0aC5zcXJ0KG5vcm1BKSAqIE1hdGguc3FydChub3JtQikpO1xufVxuXG5pbnRlcmZhY2UgUmV0cmlldmFsUmVzdWx0IHtcbiAgY29udGVudDogc3RyaW5nO1xuICBzY29yZTogbnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZXRyaWV2ZUZyb21QZGZzKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIHBkZkZpbGVzOiBGaWxlSGFuZGxlW10sXG4pOiBQcm9taXNlPFJldHJpZXZhbFJlc3VsdFtdPiB7XG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIGNvbnN0IHJldHJpZXZhbExpbWl0ID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsTGltaXQnKSB8fCA1O1xuICAvLyBMb3dlciBkZWZhdWx0IHRocmVzaG9sZCB0byBjYXRjaCBtb3JlIHJlc3VsdHMgLSB3YXMgdG9vIGhpZ2ggYXQgMC42XG4gIGNvbnN0IHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnKSA/PyAwLjM7XG5cbiAgY29uc29sZS5sb2coYFtSQUddIFByb2Nlc3NpbmcgJHtwZGZGaWxlcy5sZW5ndGh9IFBERiBmaWxlKHMpYCk7XG5cbiAgLy8gRXh0cmFjdCB0ZXh0IGZyb20gYWxsIFBERiBmaWxlc1xuICBjb25zdCBmaWxlVGV4dHM6IHsgZmlsZTogRmlsZUhhbmRsZTsgdGV4dDogc3RyaW5nIH1bXSA9IFtdO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgcGRmRmlsZXMpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGV4dHJhY3RQZGZUZXh0KGZpbGUpO1xuICAgICAgaWYgKHRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1JBR10gRXh0cmFjdGVkICR7dGV4dC5sZW5ndGh9IGNoYXJzIGZyb20gJHtmaWxlLm5hbWV9YCk7XG4gICAgICAgIGZpbGVUZXh0cy5wdXNoKHsgZmlsZSwgdGV4dCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW1JBR10gTm8gdGV4dCBleHRyYWN0ZWQgZnJvbSAke2ZpbGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgW1JBR10gU2tpcHBpbmcgUERGICR7ZmlsZS5uYW1lfSBkdWUgdG8gZXJyb3I6YCwgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChmaWxlVGV4dHMubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc29sZS53YXJuKCdbUkFHXSBObyB0ZXh0IGV4dHJhY3RlZCBmcm9tIGFueSBQREYnKTtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvLyBDaHVuayB0aGUgdGV4dHNcbiAgY29uc3QgY2h1bmtzOiB7IGZpbGU6IEZpbGVIYW5kbGU7IGNodW5rOiBzdHJpbmcgfVtdID0gW107XG4gIGZvciAoY29uc3QgeyBmaWxlLCB0ZXh0IH0gb2YgZmlsZVRleHRzKSB7XG4gICAgY29uc3QgZmlsZUNodW5rcyA9IGNodW5rVGV4dCh0ZXh0KTtcbiAgICBjb25zb2xlLmxvZyhgW1JBR10gJHtmaWxlLm5hbWV9OiAke3RleHQubGVuZ3RofSBjaGFycyBcdTIxOTIgJHtmaWxlQ2h1bmtzLmxlbmd0aH0gY2h1bmtzYCk7XG4gICAgZmlsZUNodW5rcy5mb3JFYWNoKChjaHVuaykgPT4ge1xuICAgICAgY2h1bmtzLnB1c2goeyBmaWxlLCBjaHVuayB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChjaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cbiAgLy8gR2VuZXJhdGUgZW1iZWRkaW5ncyBmb3IgYWxsIGNodW5rcyB1c2luZyBMTSBTdHVkaW8ncyBlbWJlZGRpbmcgbW9kZWxcbiAgbGV0IG1vZGVsO1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdbUkFHXSBMb2FkaW5nIGVtYmVkZGluZyBtb2RlbC4uLicpO1xuICAgIG1vZGVsID0gYXdhaXQgY3RsLmNsaWVudC5lbWJlZGRpbmcubW9kZWwoJ25vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGJywge1xuICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1tSQUddIEVtYmVkZGluZyBtb2RlbCBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1JBR10gRmFpbGVkIHRvIGxvYWQgZW1iZWRkaW5nIG1vZGVsOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEVtYmVkZGluZyBtb2RlbCBub3QgYXZhaWxhYmxlOiAke2Vycm9yfWApO1xuICB9XG5cbiAgY29uc3QgYmF0Y2hTaXplID0gMzI7XG4gIGNvbnN0IGFsbEVtYmVkZGluZ3M6IG51bWJlcltdW10gPSBbXTtcblxuICB0cnkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSArPSBiYXRjaFNpemUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBHZW5lcmF0aW5nIGVtYmVkZGluZ3MgYmF0Y2ggJHtNYXRoLmZsb29yKGkgLyBiYXRjaFNpemUpICsgMX0vJHtNYXRoLmNlaWwoY2h1bmtzLmxlbmd0aCAvIGJhdGNoU2l6ZSl9Li4uYCk7XG4gICAgICBjb25zdCBiYXRjaCA9IGNodW5rcy5zbGljZShpLCBpICsgYmF0Y2hTaXplKS5tYXAoYyA9PiBjLmNodW5rKTtcbiAgICAgIGNvbnN0IGVtYmVkZGluZ3NSZXN1bHQgPSBhd2FpdCBtb2RlbC5lbWJlZChiYXRjaCk7XG4gICAgICBhbGxFbWJlZGRpbmdzLnB1c2goLi4uKGVtYmVkZGluZ3NSZXN1bHQgYXMgYW55W10pLm1hcCgoZTogYW55KSA9PiBlLmVtYmVkZGluZykpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciBnZW5lcmF0aW5nIGVtYmVkZGluZ3M6JywgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihgRW1iZWRkaW5nIGdlbmVyYXRpb24gZmFpbGVkOiAke2Vycm9yfWApO1xuICB9XG5cbiAgLy8gR2VuZXJhdGUgZW1iZWRkaW5nIGZvciB0aGUgcXVlcnlcbiAgbGV0IHF1ZXJ5TW9kZWw7XG4gIHRyeSB7XG4gICAgcXVlcnlNb2RlbCA9IGF3YWl0IGN0bC5jbGllbnQuZW1iZWRkaW5nLm1vZGVsKCdub21pYy1haS9ub21pYy1lbWJlZC10ZXh0LXYxLjUtR0dVRicsIHtcbiAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEZhaWxlZCB0byBsb2FkIHF1ZXJ5IGVtYmVkZGluZyBtb2RlbDonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBRdWVyeSBlbWJlZGRpbmcgZmFpbGVkOiAke2Vycm9yfWApO1xuICB9XG5cbiAgbGV0IHF1ZXJ5RW1iZWRkaW5nO1xuICB0cnkge1xuICAgIGNvbnN0IHF1ZXJ5UmVzdWx0ID0gYXdhaXQgcXVlcnlNb2RlbC5lbWJlZChbcXVlcnldKTtcbiAgICBxdWVyeUVtYmVkZGluZyA9IHF1ZXJ5UmVzdWx0WzBdLmVtYmVkZGluZztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciBnZW5lcmF0aW5nIHF1ZXJ5IGVtYmVkZGluZzonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBRdWVyeSBlbWJlZGRpbmcgZmFpbGVkOiAke2Vycm9yfWApO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIHNpbWlsYXJpdGllcyBhbmQgcmV0cmlldmUgdG9wIHJlc3VsdHNcbiAgY29uc3Qgc2NvcmVzOiB7IGNodW5rSW5kZXg6IG51bWJlcjsgc2ltaWxhcml0eTogbnVtYmVyIH1bXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNpbWlsYXJpdHkgPSBjb3NpbmVTaW1pbGFyaXR5KHF1ZXJ5RW1iZWRkaW5nLCBhbGxFbWJlZGRpbmdzW2ldKTtcbiAgICBzY29yZXMucHVzaCh7IGNodW5rSW5kZXg6IGksIHNpbWlsYXJpdHkgfSk7XG4gIH1cblxuICAvLyBTb3J0IGJ5IHNpbWlsYXJpdHkgZGVzY2VuZGluZyBhbmQgZmlsdGVyIGJ5IHRocmVzaG9sZFxuICBzY29yZXMuc29ydCgoYSwgYikgPT4gYi5zaW1pbGFyaXR5IC0gYS5zaW1pbGFyaXR5KTtcbiAgXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBGb3VuZCAke3Njb3Jlcy5sZW5ndGh9IGNodW5rcywgZmlsdGVyaW5nIHdpdGggdGhyZXNob2xkICR7cmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGR9YCk7XG4gIGNvbnN0IHJlbGV2YW50Q2h1bmtzID0gc2NvcmVzLmZpbHRlcihcbiAgICAocykgPT4gcy5zaW1pbGFyaXR5ID49IHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkICYmIHMuY2h1bmtJbmRleCA8IGNodW5rcy5sZW5ndGgsXG4gICk7XG5cbiAgLy8gTGltaXQgcmVzdWx0c1xuICBjb25zdCBsaW1pdGVkUmVzdWx0cyA9IHJlbGV2YW50Q2h1bmtzLnNsaWNlKDAsIHJldHJpZXZhbExpbWl0KTtcblxuICBjb25zb2xlLmxvZyhgW1JBR10gUmV0dXJuaW5nICR7bGltaXRlZFJlc3VsdHMubGVuZ3RofSByZXN1bHRzYCk7XG4gIHJldHVybiBsaW1pdGVkUmVzdWx0cy5tYXAoKHIpID0+ICh7XG4gICAgY29udGVudDogY2h1bmtzW3IuY2h1bmtJbmRleF0uY2h1bmssXG4gICAgc2NvcmU6IHIuc2ltaWxhcml0eSxcbiAgfSkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJlcHJvY2VzcyhcbiAgY3RsOiBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyLFxuICB1c2VyTWVzc2FnZTogQ2hhdE1lc3NhZ2Vcbik6IFByb21pc2U8c3RyaW5nIHwgQ2hhdE1lc3NhZ2U+IHtcbiAgY29uc3QgdXNlclByb21wdCA9IHVzZXJNZXNzYWdlLmdldFRleHQoKTtcbiAgXG4gIC8vIFN0ZXAgMC41OiBDb250ZXh0R3VhcmQgYXV0by1jb21wcmVzc2lvbiAoYmVmb3JlIGFueSBwcm9jZXNzaW5nKVxuICBpZiAoY29udGV4dEd1YXJkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBjdGwucHVsbEhpc3RvcnkoKTtcbiAgICAgIGhpc3RvcnkuYXBwZW5kKHVzZXJNZXNzYWdlKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gaGlzdG9yeS5nZXRNZXNzYWdlc0FycmF5KCk7XG4gICAgICBjb25zdCB0b2tlbkNvdW50ID0gYXdhaXQgY29udGV4dEd1YXJkLmNvdW50VG9rZW5zKG1lc3NhZ2VzKTtcbiAgICAgIGNvbnN0IHRocmVzaG9sZCA9IGNvbnRleHRHdWFyZC5nZXRUaHJlc2hvbGQoKTtcbiAgICAgIGlmICh0b2tlbkNvdW50ID4gdGhyZXNob2xkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dEd1YXJkXSBUb2tlbiBjb3VudCAke3Rva2VuQ291bnR9IGV4Y2VlZHMgdGhyZXNob2xkICR7dGhyZXNob2xkfSwgY29tcHJlc3NpbmcuLi5gKTtcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZE1lc3NhZ2VzID0gYXdhaXQgY29udGV4dEd1YXJkLmNvbXByZXNzSGlzdG9yeShtZXNzYWdlcyk7XG4gICAgICAgIC8vIENsZWFyIGhpc3RvcnkgYnkgcG9wcGluZyBhbGwgbWVzc2FnZXNcbiAgICAgICAgd2hpbGUgKGhpc3RvcnkuZ2V0TGVuZ3RoKCkgPiAwKSB7XG4gICAgICAgICAgaGlzdG9yeS5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICBjb21wcmVzc2VkTWVzc2FnZXMuZm9yRWFjaChtc2cgPT4gaGlzdG9yeS5hcHBlbmQobXNnKSk7XG4gICAgICAgIGNvbnRleHRHdWFyZC5yZXNldFRva2VuQ2FjaGUoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tDb250ZXh0R3VhcmRdIEF1dG8tY29tcHJlc3Npb24gZmFpbGVkOicsIGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0ZXAgMC42OiBBdXRvLXRyYWNraW5nIGFuYWx5c2lzIChzaWxlbnQgYmFja2dyb3VuZCB0cmFja2luZylcbiAgdHJ5IHtcbiAgICBjb25zdCBwbHVnaW5Db25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICAgIGNvbnN0IGF1dG9UcmFja2luZ0VuYWJsZWQgPSBwbHVnaW5Db25maWcuZ2V0KCdhdXRvVHJhY2tpbmdFbmFibGVkJykgPz8gZmFsc2U7XG4gICAgXG4gICAgaWYgKGF1dG9UcmFja2luZ0VuYWJsZWQpIHtcbiAgICAgIC8vIFVwZGF0ZSB0cmFja2VyIGNvbmZpZyBmcm9tIHBsdWdpbiBzZXR0aW5nc1xuICAgICAgYXV0b1RyYWNrZXIudXBkYXRlQ29uZmlnKHtcbiAgICAgICAgYXV0b1RyYWNraW5nRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgYXV0b1RyYWNrRGVjaXNpb25zOiBwbHVnaW5Db25maWcuZ2V0KCdhdXRvVHJhY2tEZWNpc2lvbnMnKSA/PyB0cnVlLFxuICAgICAgICBhdXRvVHJhY2tDb21wbGV0aW9uczogcGx1Z2luQ29uZmlnLmdldCgnYXV0b1RyYWNrQ29tcGxldGlvbnMnKSA/PyB0cnVlLFxuICAgICAgICBhdXRvVHJhY2tFcnJvcnM6IHBsdWdpbkNvbmZpZy5nZXQoJ2F1dG9UcmFja0Vycm9ycycpID8/IHRydWUsXG4gICAgICAgIGF1dG9TdW1tYXJ5SW50ZXJ2YWw6IHBsdWdpbkNvbmZpZy5nZXQoJ2F1dG9TdW1tYXJ5SW50ZXJ2YWwnKSA/PyA1MCxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBbmFseXplIHVzZXIgbWVzc2FnZSBmb3IgdHJhY2tpbmcgdHJpZ2dlcnNcbiAgICAgIGNvbnN0IGFjdGlvbnMgPSBhdXRvVHJhY2tlci5hbmFseXplTWVzc2FnZSh1c2VyUHJvbXB0KTtcbiAgICAgIFxuICAgICAgaWYgKGFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0F1dG8tVHJhY2tdIERldGVjdGVkICR7YWN0aW9ucy5sZW5ndGh9IGV2ZW50KHMpOmAsIGFjdGlvbnMubWFwKGEgPT4gYCR7YS50eXBlfSAoJHthLmNvbmZpZGVuY2UudG9GaXhlZCgyKX0pYCkuam9pbignLCAnKSk7XG4gICAgICAgIC8vIE5vdGU6IFNpbGVudCB0cmFja2luZyAtIG5vIHRvb2wgY2FsbHMgbWFkZSBoZXJlIHRvIGF2b2lkIGludGVyZmVyaW5nIHdpdGggY2hhdCBmbG93XG4gICAgICAgIC8vIFRoZSBkZXRlY3Rpb24gaXMgbG9nZ2VkIGZvciBkZWJ1Z2dpbmc7IGFjdHVhbCB0cmFja2luZyB3b3VsZCByZXF1aXJlIHNlcGFyYXRlIGltcGxlbWVudGF0aW9uXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEVuc3VyZSB0cmFja2VyIGlzIGRpc2FibGVkIGlmIGNvbmZpZyBzYXlzIHNvXG4gICAgICBhdXRvVHJhY2tlci51cGRhdGVDb25maWcoeyBcbiAgICAgICAgYXV0b1RyYWNraW5nRW5hYmxlZDogZmFsc2UsXG4gICAgICB9KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tBdXRvLVRyYWNrXSBBbmFseXNpcyBmYWlsZWQ6JywgZSk7XG4gIH1cbiAgXG4gIC8vIFN0ZXAgMDogQWx3YXlzIHJlZ2lzdGVyIGF0dGFjaG1lbnRzIHNvIHRvb2xzIGNhbiBhY2Nlc3MgdGhlbSBieSBuYW1lXG4gIGNvbnN0IGFsbEZpbGVzID0gdXNlck1lc3NhZ2UuZ2V0RmlsZXMoY3RsLmNsaWVudCk7XG4gIHNldEF0dGFjaG1lbnRzKGFsbEZpbGVzKTtcbiAgXG4gIC8vIEJ1aWxkIGF0dGFjaG1lbnQgbm90aWNlIHRvIGluamVjdCBpbnRvIHByb21wdFxuICBsZXQgYXR0YWNobWVudE5vdGljZSA9ICcnO1xuICBpZiAoYWxsRmlsZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGZpbGVOYW1lcyA9IGxpc3RBdHRhY2htZW50cygpO1xuICAgIGF0dGFjaG1lbnROb3RpY2UgPSBgXFxuXFxuXHVEODNEXHVEQ0NFIEFUVEFDSEVEIEZJTEVTIEFWQUlMQUJMRTpcXG5Zb3UgaGF2ZSBhY2Nlc3MgdG8gdGhlIGZvbGxvd2luZyBhdHRhY2hlZCBmaWxlcy4gWW91IGNhbiByZWFkIHRoZW0gdXNpbmcgdGhlIHJlYWRfZG9jdW1lbnQgdG9vbCBieSBmaWxlbmFtZTpcXG4ke2ZpbGVOYW1lcy5tYXAobmFtZSA9PiBgLSAke25hbWV9YCkuam9pbignXFxuJyl9YDtcbiAgfVxuICBcbiAgLy8gU3RlcCAxOiBEaXJlY3RvcnkgZGV0ZWN0aW9uIChoaWdoZXN0IHByaW9yaXR5KVxuICBjb25zdCBkZXRlY3RlZFBhdGggPSBkZXRlY3REaXJlY3RvcnlQYXRoKHVzZXJQcm9tcHQpO1xuICBpZiAoZGV0ZWN0ZWRQYXRoKSB7XG4gICAgcmV0dXJuIGluamVjdFdvcmtpbmdEaXJlY3RvcnlQcm9tcHQodXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2UsIGRldGVjdGVkUGF0aCkgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xuICB9XG4gIFxuICAvLyBTdGVwIDI6IERvY3VtZW50IFJBRyBwcm9jZXNzaW5nIChpZiBlbmFibGVkKVxuICBjb25zdCBwbHVnaW5Db25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBjb25zdCBkb2N1bWVudFJBR0VuYWJsZWQgPSBwbHVnaW5Db25maWcuZ2V0KCdkb2N1bWVudFJBRycpO1xuICBcbiAgY29uc29sZS5sb2coYFtSQUddIGRvY3VtZW50UkFHIGVuYWJsZWQ6ICR7ZG9jdW1lbnRSQUdFbmFibGVkfWApO1xuICBcbiAgaWYgKCFkb2N1bWVudFJBR0VuYWJsZWQpIHtcbiAgICAvLyBJZiBSQUcgaXMgZGlzYWJsZWQsIGp1c3QgcmV0dXJuIHRoZSBtZXNzYWdlIHdpdGggYXR0YWNobWVudCBub3RpY2VcbiAgICBjb25zdCBiYXNlID0gdXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2U7XG4gICAgcmV0dXJuIGJhc2UgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xuICB9XG5cbiAgY29uc3QgbmV3RmlsZXMgPSBhbGxGaWxlcy5maWx0ZXIoZiA9PiBmLnR5cGUgIT09ICdpbWFnZScpO1xuICBjb25zb2xlLmxvZyhgW1JBR10gRm91bmQgJHtuZXdGaWxlcy5sZW5ndGh9IG5vbi1pbWFnZSBmaWxlc2ApO1xuICBcbiAgaWYgKG5ld0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnN0IGJhc2UgPSB1c2VyUHJvbXB0ICsgYXR0YWNobWVudE5vdGljZTtcbiAgICByZXR1cm4gYmFzZSArIGdldFRlbXBvcmFsU3VmZml4KGN0bCk7XG4gIH1cblxuICAvLyBTZXBhcmF0ZSBQREYgZmlsZXMgZnJvbSBvdGhlciBmaWxlIHR5cGVzXG4gIGNvbnN0IHBkZkZpbGVzID0gbmV3RmlsZXMuZmlsdGVyKGYgPT4gZi5uYW1lLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoJy5wZGYnKSk7XG4gIGNvbnN0IG90aGVyRmlsZXMgPSBuZXdGaWxlcy5maWx0ZXIoZiA9PiAhZi5uYW1lLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoJy5wZGYnKSk7XG5cbiAgY29uc29sZS5sb2coYFtSQUddIFBERnM6ICR7cGRmRmlsZXMubGVuZ3RofSwgT3RoZXI6ICR7b3RoZXJGaWxlcy5sZW5ndGh9YCk7XG5cbiAgbGV0IGFsbFJlc3VsdHM6IFJldHJpZXZhbFJlc3VsdFtdID0gW107XG5cbiAgLy8gUHJvY2VzcyBQREZzIHdpdGggY3VzdG9tIGxvY2FsIHBpcGVsaW5lIChtb3JlIHJlbGlhYmxlIGZvciBjb21wbGV4IGxheW91dHMpXG4gIGlmIChwZGZGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBkZlJlc3VsdHMgPSBhd2FpdCByZXRyaWV2ZUZyb21QZGZzKGN0bCwgdXNlclByb21wdCwgcGRmRmlsZXMpO1xuICAgICAgY29uc29sZS5sb2coYFtSQUddIFBERiByZXRyaWV2YWwgcmV0dXJuZWQgJHtwZGZSZXN1bHRzLmxlbmd0aH0gcmVzdWx0c2ApO1xuICAgICAgYWxsUmVzdWx0cy5wdXNoKC4uLnBkZlJlc3VsdHMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciBwcm9jZXNzaW5nIFBERnM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFByb2Nlc3Mgb3RoZXIgZmlsZXMgd2l0aCBMTSBTdHVkaW8ncyBuYXRpdmUgcmV0cmlldmFsIEFQSSAoaGFuZGxlcyAudHh0LCAubWQsIGV0Yy4gbmF0aXZlbHkpXG4gIGlmIChvdGhlckZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbW9kZWwgPSBhd2FpdCBjdGwuY2xpZW50LmVtYmVkZGluZy5tb2RlbCgnbm9taWMtYWkvbm9taWMtZW1iZWQtdGV4dC12MS41LUdHVUYnLCB7XG4gICAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGN0bC5jbGllbnQuZmlsZXMucmV0cmlldmUodXNlclByb21wdCwgb3RoZXJGaWxlcywge1xuICAgICAgICBlbWJlZGRpbmdNb2RlbDogbW9kZWwsXG4gICAgICAgIGxpbWl0OiBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxMaW1pdCcpIHx8IDUsXG4gICAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIENvbnZlcnQgaGlnaC1sZXZlbCBBUEkgcmVzdWx0cyB0byBvdXIgZm9ybWF0XG4gICAgICBjb25zdCBmaWx0ZXJlZEVudHJpZXMgPSByZXN1bHQuZW50cmllcy5maWx0ZXIoXG4gICAgICAgIGVudHJ5ID0+IGVudHJ5LnNjb3JlID4gKHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkJykgPz8gMC4zKVxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBOYXRpdmUgcmV0cmlldmFsIHJldHVybmVkICR7ZmlsdGVyZWRFbnRyaWVzLmxlbmd0aH0gcmVzdWx0c2ApO1xuICAgICAgYWxsUmVzdWx0cy5wdXNoKC4uLmZpbHRlcmVkRW50cmllcy5tYXAoZSA9PiAoeyBjb250ZW50OiBlLmNvbnRlbnQsIHNjb3JlOiBlLnNjb3JlIH0pKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIHJldHJpZXZpbmcgZnJvbSBvdGhlciBmaWxlczonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBhbmQgbGltaXQgcmVzdWx0c1xuICBhbGxSZXN1bHRzLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgY29uc3QgcmV0cmlldmFsTGltaXQgPSBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxMaW1pdCcpIHx8IDU7XG4gIGFsbFJlc3VsdHMgPSBhbGxSZXN1bHRzLnNsaWNlKDAsIHJldHJpZXZhbExpbWl0KTtcblxuICBjb25zb2xlLmxvZyhgW1JBR10gVG90YWwgcmVzdWx0cyBhZnRlciBzb3J0aW5nOiAke2FsbFJlc3VsdHMubGVuZ3RofWApO1xuXG4gIC8vIEluamVjdCBjb250ZXh0IGlmIHJlc3VsdHMgZm91bmRcbiAgaWYgKGFsbFJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgIGxldCBjb250ZXh0SW5qZWN0aW9uID0gJyc7XG4gICAgZm9yIChjb25zdCByZXN1bHQgb2YgYWxsUmVzdWx0cykge1xuICAgICAgY29udGV4dEluamVjdGlvbiArPSBgXFxuJHtyZXN1bHQuY29udGVudH1cXG4tLS1cXG5gO1xuICAgIH1cblxuICAgIHJldHVybiBgJHt1c2VyUHJvbXB0fSR7YXR0YWNobWVudE5vdGljZX1cXG5cXG4tLS0gUkVMRVZBTlQgRE9DVU1FTlQgQ09OVEVYVCAtLS1cXG4ke2NvbnRleHRJbmplY3Rpb24udHJpbSgpfWAgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xuICB9XG5cbiAgLy8gSWYgbm8gcmVzdWx0cyBmb3VuZCwgcmV0dXJuIG9yaWdpbmFsIG1lc3NhZ2Ugd2l0aCBhdHRhY2htZW50IG5vdGljZVxuICBjb25zb2xlLmxvZygnW1JBR10gTm8gcmVsZXZhbnQgcmVzdWx0cyBmb3VuZCcpO1xuICBjb25zdCBiYXNlID0gdXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2U7XG4gIHJldHVybiBiYXNlICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbn1cbiIsICIvKipcbiAqIEFJIFRvb2xib3ggUGx1Z2luIC0gRW50cnkgUG9pbnRcbiAqIE1haW4gZnVuY3Rpb24gZXhwb3J0ZWQgZm9yIExNIFN0dWRpbyBwbHVnaW4gc3lzdGVtXG4gKi9cblxuaW1wb3J0IHsgdHlwZSBQbHVnaW5Db250ZXh0IH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sc1Byb3ZpZGVyIH0gZnJvbSAnLi90b29sc1Byb3ZpZGVyJztcbmltcG9ydCB7IGNvbmZpZ1NjaGVtYXRpY3MgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBwcmVwcm9jZXNzIH0gZnJvbSAnLi9wcm9tcHRQcmVwcm9jZXNzb3InO1xuaW1wb3J0IHsgY2xlYW51cEJyb3dzZXJTZXNzaW9uIH0gZnJvbSAnLi90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzJztcblxuLy8gXHUyNzA1IEZJWDogVXNlIHN0cnVjdHVyZWQgbG9nZ2luZyBpbnN0ZWFkIG9mIGNvbnNvbGUubG9nXG5jb25zdCBsb2dnZXIgPSB7XG4gIGluZm86IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3Rkb3V0LndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBbQUkgVG9vbGJveF0gJHttc2d9XFxuYCksXG4gIHdhcm46IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbQUkgVG9vbGJveCBXQVJOXSAke21zZ31cXG5gKSxcbiAgZXJyb3I6IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbQUkgVG9vbGJveCBFUlJPUl0gJHttc2d9XFxuYCksXG59O1xuXG4vKipcbiAqIE1haW4gcGx1Z2luIGVudHJ5IHBvaW50IC0gY2FsbGVkIGJ5IExNIFN0dWRpb1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihjb250ZXh0OiBQbHVnaW5Db250ZXh0KSB7XG4gIGxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcuLi4nKTtcbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSBjb25maWd1cmF0aW9uIHNjaGVtYXRpY3MgKG1ha2VzIHRvZ2dsZXMgYXBwZWFyIGluIFVJKVxuICBjb250ZXh0LndpdGhDb25maWdTY2hlbWF0aWNzKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBcbiAgLy8gUmVnaXN0ZXIgdGhlIHByb21wdCBwcmVwcm9jZXNzb3IgZm9yIERvY3VtZW50IFJBRyAvIENoYXQgd2l0aCBGaWxlc1xuICBjb250ZXh0LndpdGhQcm9tcHRQcmVwcm9jZXNzb3IocHJlcHJvY2Vzcyk7XG4gIFxuICAvLyBOb3RlOiBMTSBTdHVkaW8gU0RLIHYxLjUuMCBkb2Vzbid0IGV4cG9zZSBnZXRDb25maWcoKSBvbiBQbHVnaW5Db250ZXh0LlxuICAvLyBDb25maWd1cmF0aW9uIGlzIGhhbmRsZWQgYXV0b21hdGljYWxseSBieSB0aGUgU0RLJ3MgY29uZmlnIHN5c3RlbS5cbiAgLy8gVGhlIHRvb2xzUHJvdmlkZXIgd2lsbCB1c2UgZGVmYXVsdCBzZXR0aW5ncyB1bnRpbCBVSSB0b2dnbGVzIGFyZSBhcHBsaWVkLlxuICBcbiAgLy8gUmVnaXN0ZXIgdGhlIHRvb2xzIHByb3ZpZGVyIGZ1bmN0aW9uXG4gIGNvbnRleHQud2l0aFRvb2xzUHJvdmlkZXIodG9vbHNQcm92aWRlcik7XG4gIFxuICAvLyBIYW5kbGUgcGx1Z2luIHVubG9hZCAtIGNsZWFudXAgYnJvd3NlciBzZXNzaW9uIHRvIHByZXZlbnQgb3JwaGFuZWQgcHJvY2Vzc2VzXG4gIGlmICh0eXBlb2YgcHJvY2Vzcy5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTtcbiAgICB9KTtcbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTtcbiAgICB9KTtcbiAgfVxuICBcbiAgbG9nZ2VyLmluZm8oJ0luaXRpYWxpemVkIHN1Y2Nlc3NmdWxseSEnKTtcbn1cbiIsICJpbXBvcnQgeyBMTVN0dWRpb0NsaWVudCwgdHlwZSBQbHVnaW5Db250ZXh0IH0gZnJvbSBcIkBsbXN0dWRpby9zZGtcIjtcblxuZGVjbGFyZSB2YXIgcHJvY2VzczogYW55O1xuXG4vLyBXZSByZWNlaXZlIHJ1bnRpbWUgaW5mb3JtYXRpb24gaW4gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmNvbnN0IGNsaWVudElkZW50aWZpZXIgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0NMSUVOVF9JREVOVElGSUVSO1xuY29uc3QgY2xpZW50UGFzc2tleSA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQ0xJRU5UX1BBU1NLRVk7XG5jb25zdCBiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9CQVNFX1VSTDtcblxuY29uc3QgY2xpZW50ID0gbmV3IExNU3R1ZGlvQ2xpZW50KHtcbiAgY2xpZW50SWRlbnRpZmllcixcbiAgY2xpZW50UGFzc2tleSxcbiAgYmFzZVVybCxcbn0pO1xuXG4oZ2xvYmFsVGhpcyBhcyBhbnkpLl9fTE1TX1BMVUdJTl9DT05URVhUID0gdHJ1ZTtcblxubGV0IHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IGZhbHNlO1xubGV0IHByb21wdFByZXByb2Nlc3NvclNldCA9IGZhbHNlO1xubGV0IGNvbmZpZ1NjaGVtYXRpY3NTZXQgPSBmYWxzZTtcbmxldCBnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0ID0gZmFsc2U7XG5sZXQgdG9vbHNQcm92aWRlclNldCA9IGZhbHNlO1xubGV0IGdlbmVyYXRvclNldCA9IGZhbHNlO1xuXG5jb25zdCBzZWxmUmVnaXN0cmF0aW9uSG9zdCA9IGNsaWVudC5wbHVnaW5zLmdldFNlbGZSZWdpc3RyYXRpb25Ib3N0KCk7XG5cbmNvbnN0IHBsdWdpbkNvbnRleHQ6IFBsdWdpbkNvbnRleHQgPSB7XG4gIHdpdGhQcmVkaWN0aW9uTG9vcEhhbmRsZXI6IChnZW5lcmF0ZSkgPT4ge1xuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByZWRpY3Rpb25Mb29wSGFuZGxlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcmVkaWN0aW9uTG9vcEhhbmRsZXIgY2Fubm90IGJlIHVzZWQgd2l0aCBhIHRvb2xzIHByb3ZpZGVyXCIpO1xuICAgIH1cblxuICAgIHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0UHJlZGljdGlvbkxvb3BIYW5kbGVyKGdlbmVyYXRlKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aFByb21wdFByZXByb2Nlc3NvcjogKHByZXByb2Nlc3MpID0+IHtcbiAgICBpZiAocHJvbXB0UHJlcHJvY2Vzc29yU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcm9tcHRQcmVwcm9jZXNzb3IgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBwcm9tcHRQcmVwcm9jZXNzb3JTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFByb21wdFByZXByb2Nlc3NvcihwcmVwcm9jZXNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aENvbmZpZ1NjaGVtYXRpY3M6IChjb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGNvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZyBzY2hlbWF0aWNzIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgY29uZmlnU2NoZW1hdGljc1NldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0Q29uZmlnU2NoZW1hdGljcyhjb25maWdTY2hlbWF0aWNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdsb2JhbENvbmZpZ1NjaGVtYXRpY3M6IChnbG9iYWxDb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdsb2JhbCBjb25maWcgc2NoZW1hdGljcyBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldEdsb2JhbENvbmZpZ1NjaGVtYXRpY3MoZ2xvYmFsQ29uZmlnU2NoZW1hdGljcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhUb29sc1Byb3ZpZGVyOiAodG9vbHNQcm92aWRlcikgPT4ge1xuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUb29scyBwcm92aWRlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvb2xzIHByb3ZpZGVyIGNhbm5vdCBiZSB1c2VkIHdpdGggYSBwcmVkaWN0aW9uTG9vcEhhbmRsZXJcIik7XG4gICAgfVxuXG4gICAgdG9vbHNQcm92aWRlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0VG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdlbmVyYXRvcjogKGdlbmVyYXRvcikgPT4ge1xuICAgIGlmIChnZW5lcmF0b3JTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuXG4gICAgZ2VuZXJhdG9yU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRHZW5lcmF0b3IoZ2VuZXJhdG9yKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbn07XG5cbmltcG9ydChcIi4vLi4vc3JjL2luZGV4LnRzXCIpLnRoZW4oYXN5bmMgbW9kdWxlID0+IHtcbiAgcmV0dXJuIGF3YWl0IG1vZHVsZS5tYWluKHBsdWdpbkNvbnRleHQpO1xufSkudGhlbigoKSA9PiB7XG4gIHNlbGZSZWdpc3RyYXRpb25Ib3N0LmluaXRDb21wbGV0ZWQoKTtcbn0pLmNhdGNoKChlcnJvcikgPT4ge1xuICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGV4ZWN1dGUgdGhlIG1haW4gZnVuY3Rpb24gb2YgdGhlIHBsdWdpbi5cIik7XG4gIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrU08sU0FBUyxjQUFjLFFBQXNCLFVBQXdRO0FBQzFULFNBQU8sT0FBTyxRQUFRLE1BQU07QUFDOUI7QUFXTyxTQUFTLHVCQUF1QixRQUFzQkEsUUFBK0Q7QUFFMUgsVUFBUUEsUUFBTTtBQUFBLElBRVosS0FBSztBQUFjLGFBQU8sT0FBTyx3QkFBd0I7QUFBQSxJQUV6RCxLQUFLO0FBQWMsYUFBTyxPQUFPLG9CQUFvQjtBQUFBLElBRXJELEtBQUs7QUFBYyxhQUFPLE9BQU8sc0JBQXNCO0FBQUEsSUFFdkQsS0FBSztBQUFjLGFBQU8sT0FBTyxtQkFBbUI7QUFBQSxFQUV0RDtBQUVGO0FBN1RBLGdCQUVBLFlBUWEsY0FrSkEsZ0JBcU5BO0FBalhiO0FBQUE7QUFBQTtBQUFBLGlCQUFrQjtBQUVsQixpQkFBdUM7QUFRaEMsSUFBTSxlQUFlLGFBQUUsT0FBTztBQUFBO0FBQUEsTUFJbkMsWUFBWSxhQUFFLFFBQVEsRUFBRSxRQUFR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TyxNQUFNQSxRQUFPLEtBQUssYUFBYTtBQUN4QyxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ1osdUJBQXFCLGNBQWM7QUFDckMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVO0FBQ2xCLFVBQVEsTUFBTSxvREFBb0Q7QUFDbEUsVUFBUSxNQUFNLEtBQUs7QUFDckIsQ0FBQzsiLAogICJuYW1lcyI6IFsidG9vbCIsICJwbGF0Zm9ybSIsICJwYXRoIiwgImZzIiwgInJlc29sdmUiLCAiZnMiLCAicGF0aCIsICJzcGF3bldpdGhQcm9ncmVzcyIsICJyZXNvbHZlIiwgInJ1bkNvbmZpZ0FuYWx5c2lzIiwgInJ1bkltcG9ydEFuYWx5c2lzIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgImRkZ1NlYXJjaCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAibWVzc2FnZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImZzIiwgInBhdGgiLCAicmVzb2x2ZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiaGFuZGxlRXJyb3IiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgInJlc29sdmUiLCAiaGFuZGxlRXJyb3IiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgImhhbmRsZUVycm9yIiwgInBsYXRmb3JtIiwgInJlc29sdmUiLCAibWVzc2FnZSIsICJnZXRXb3JraW5nRGlyIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJvcyIsICJwYXRoIiwgImZzIiwgImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgImhhbmRsZUVycm9yIiwgInN0YXQiLCAic3Bhd24iLCAicGxhdGZvcm0iLCAicmVzb2x2ZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJvcyIsICJob3N0bmFtZSIsICJoYW5kbGVFcnJvciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiY2h1bmtUZXh0IiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJwYXRoIiwgImZzIiwgInB1cHBldGVlck1vZHVsZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJ0b29sIiwgInN0YXQiLCAiaGFuZGxlRXJyb3IiLCAiZXh0IiwgInBkZlBhcnNlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJwYXRoIiwgImZzIiwgInJlc29sdmUiLCAiZnMiLCAiYXJjaGl2ZXIiLCAic3RhdCIsICJwYXRoIiwgInVuemlwcGVyIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJ0b29sIiwgImltcG9ydF96b2QiLCAicGF0aCIsICJwZGZQYXJzZSIsICJjaHVua1RleHQiLCAicGx1Z2luQ29uZmlnIiwgImJhc2UiLCAibG9nZ2VyIiwgImltcG9ydF9zZGsiLCAicHJlcHJvY2VzcyIsICJjb25maWdTY2hlbWF0aWNzIiwgInRvb2xzUHJvdmlkZXIiLCAibW9kdWxlIl0KfQo=
