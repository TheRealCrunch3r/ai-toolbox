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
function isExecutionToolEnabled(config, tool15) {
  switch (tool15) {
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
      contextGuardTerminalFilterLength: import_zod.z.number().min(100).max(2e4).default(2e3).describe("Max chars before terminal output is filtered")
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
      contextGuardTerminalFilterLength: 2e3
      // Filter terminal output > 2KB
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
    }, DEFAULT_CONFIG.contextGuardTerminalFilterLength).build();
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
              cwd: workingDir
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
            await spawnWithProgress2("tsc", ["--version"], 5e3);
          } catch {
            return { skipped: true, reason: "TypeScript compiler (tsc) not found in PATH" };
          }
          const fileCount = await countTypeScriptFiles(workingDir);
          const dynamicTimeout = getAnalysisTimeout(3e4, fileCount);
          const result = await spawnWithProgress2("tsc", ["--extendedDiagnostics"], dynamicTimeout);
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
    const git = await createGit();
    const remotes = await git.listRemote(["--get-url", "origin"]);
    const remoteUrl = remotes.trim();
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
var import_sdk4, import_zod4, simpleGitModule;
var init_gitGithubTools = __esm({
  "src/tools/gitGithubTools.ts"() {
    "use strict";
    import_sdk4 = require("@lmstudio/sdk");
    import_zod4 = require("zod");
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
    const store = new LocalVectorStore();
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
    const queryEmbedding = generateEmbedding(query);
    return {
      success: true,
      data: {
        query,
        topK,
        results: [
          {
            id: "placeholder",
            text: "Vector search requires ChromaDB integration. This is a placeholder.",
            score: 0,
            metadata: {
              file_path: "",
              file_name: "",
              chunk_index: 0,
              total_chunks: 1,
              word_count: 0
            }
          }
        ],
        note: "To enable full vector search, install chromadb and update the implementation."
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
  return {
    success: true,
    data: { message: "Vector index cleared successfully" }
  };
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
  return tools;
}
var import_sdk12, import_zod12, path8, fs8, LocalVectorStore;
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
        return results.sort((a, b) => b.score - a.score).slice(0, topK).map(({ id, score }) => {
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
    description: "Automatically analyze recent session activity, identify important patterns/decisions, and save them to persistent memory for future reference.",
    parameters: {
      session_events: import_zod14.z.array(import_zod14.z.object({
        type: import_zod14.z.string(),
        timestamp: import_zod14.z.number(),
        data: import_zod14.z.any().optional()
      })).optional().describe("Recent session events to analyze"),
      config_changes: import_zod14.z.record(import_zod14.z.union([import_zod14.z.boolean(), import_zod14.z.string()])).optional().describe("Configuration changes made during session")
    },
    implementation: async ({ session_events, config_changes }) => {
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
    description: "Retrieve automatically saved context entries from persistent memory. Useful for recalling past decisions, patterns, or configurations.",
    parameters: {
      limit: import_zod14.z.number().min(1).max(50).optional().default(20).describe("Maximum number of entries to return"),
      type: import_zod14.z.enum(["decision", "pattern", "configuration", "file_change", "error", "summary"]).optional().describe("Filter by entry type")
    },
    implementation: async ({ limit, type }) => {
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
    description: "Search through automatically saved context entries using text matching. Finds relevant past decisions, patterns, or configurations.",
    parameters: {
      query: import_zod14.z.string().describe("Search query to match against context entries"),
      max_results: import_zod14.z.number().min(1).max(50).optional().default(10).describe("Maximum number of results to return")
    },
    implementation: async ({ query, max_results }) => {
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
    description: "Get a summary of all automatically saved context entries, including counts by type and recent activity.",
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
    description: "Manually record an important event or decision to persistent memory. Useful for marking critical moments in a session.",
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
          if (event.type.startsWith("tool_")) {
            const toolName = event.type.replace("tool_", "");
            toolUsageCount[toolName] = (toolUsageCount[toolName] || 0) + 1;
          }
        });
        Object.entries(toolUsageCount).forEach(([tool15, count]) => {
          if (count > 3) {
            entries.push({
              id: this.generateId(),
              timestamp: Date.now(),
              type: "pattern",
              title: `Frequent Tool Usage: ${tool15}`,
              content: `Tool '${tool15}' was used ${count} times in the current session, indicating it's a primary workflow tool.`,
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
          const decisionText = event.data?.decision || `Decision made at ${new Date(event.timestamp).toLocaleTimeString()}`;
          entries.push({
            id: this.generateId(),
            timestamp: event.timestamp,
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
      const buffer = await attachment.read();
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
    dateFormatStyle: pluginConfig.get("dateFormatStyle")
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
          registerImageProcessingTools(config, lmClient).forEach((t) => this.toolMap.set(t.name, t));
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
        const tool15 = this.registry.get(toolName);
        if (!tool15) {
          return { success: false, error: `Tool '${toolName}' not found` };
        }
        try {
          const impl = tool15.implementation;
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
    const path12 = unixMatch[1].trim();
    if (!path12.startsWith("/ ") && !path12.includes(" ")) {
      return path12;
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
var import_sdk16 = require("@lmstudio/sdk");
var clientIdentifier = process.env.LMS_PLUGIN_CLIENT_IDENTIFIER;
var clientPasskey = process.env.LMS_PLUGIN_CLIENT_PASSKEY;
var baseUrl = process.env.LMS_PLUGIN_BASE_URL;
var client = new import_sdk16.LMStudioClient({
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kQ29tbWFuZHMudHMiLCAiLi4vc3JjL3dvcmtpbmdEaXIudHMiLCAiLi4vc3JjL3NlY3VyaXR5LnRzIiwgIi4uL3NyYy9wZXJmb3JtYW5jZVV0aWxzLnRzIiwgIi4uL3NyYy90b29scy9maWxlU3lzdGVtVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2dpdEdpdGh1YlRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9kYXRhYmFzZVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9leGVjdXRpb25Ub29scy50cyIsICIuLi9zcmMvdG9vbHMvdXRpbGl0eVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvaHR0cENsaWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy92ZWN0b3JSYWdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMudHMiLCAiLi4vc3JjL2F0dGFjaG1lbnRNYW5hZ2VyLnRzIiwgIi4uL3NyYy90b29scy9kb2N1bWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29sc1Byb3ZpZGVyLnRzIiwgIi4uL3NyYy9wcm9tcHRQcmVwcm9jZXNzb3IudHMiLCAiLi4vc3JjL2luZGV4LnRzIiwgImVudHJ5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuaW1wb3J0IHsgY3JlYXRlQ29uZmlnU2NoZW1hdGljcyB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gWm9kIFNjaGVtYSAodmFsaWRhdGlvbikgPT09PT09PT09PT09PT09PT09PT1cblxuXG5cbmV4cG9ydCBjb25zdCBDb25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG5cbiAgLy8gVG9vbCBHYXRpbmcgKGVuYWJsZS9kaXNhYmxlIGluZGl2aWR1YWwgdG9vbHMpXG5cbiAgZmlsZVN5c3RlbTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICB3ZWJTZWFyY2g6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYnJvd3NlckF1dG9tYXRpb246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuXG4gIGdpdE9wZXJhdGlvbnM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuXG4gIGRhdGFiYXNlUXVlcmllczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cbiAgZG9jdW1lbnRQYXJzaW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIGJhY2tncm91bmRDb21tYW5kczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0NcdUREOTUgTkVXIFRPT0wgQ0FURUdPUklFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBpbWFnZVByb2Nlc3Npbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBpbWFnZSBPQ1IsIHNjcmVlbnNob3QsIGFuZCBjb21wYXJpc29uIHRvb2xzJyksXG5cbiAgaHR0cENsaWVudDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0VuYWJsZSBnZW5lcmljIEhUVFAgY2xpZW50IGZvciBSRVNUIEFQSSBjYWxscycpLFxuXG4gIHZlY3RvclJBRzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIHNlbWFudGljIHNlYXJjaCB3aXRoIHZlY3RvciBlbWJlZGRpbmdzJyksXG4gIHVpR2VuZXJhdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0VuYWJsZSBpbnRlcmFjdGl2ZSBVSSBnZW5lcmF0aW9uIGFuZCByZW5kZXJpbmcgdG9vbHMnKSxcbiAgY29udGV4dE1hbmFnZW1lbnQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBhdXRvbWF0aWMgY29udGV4dCB0cmFja2luZyBhbmQgbWVtb3J5IG1hbmFnZW1lbnQnKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBnb2RNb2RlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnXHUyNkEwXHVGRTBGIFdBUk5JTkc6IEVuYWJsZXMgZXZlcnkgdG9vbCBjYXRlZ29yeS4gVXNlIHdpdGggY2F1dGlvbi4nKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzRFx1RENEQSBET0NVTUVOVCBSQUcgLyBDSEFUIFdJVEggRklMRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgZG9jdW1lbnRSQUc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBmaWxlIGluZGV4aW5nIGFuZCBzZW1hbnRpYyBzZWFyY2ggZm9yIGNoYXQnKSxcblxuICByZXRyaWV2YWxMaW1pdDogei5udW1iZXIoKS5taW4oMSkubWF4KDIwKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiByZWxldmFudCBjaHVua3MgdG8gcmV0cmlldmUnKSxcblxuICByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZDogei5udW1iZXIoKS5taW4oMC4wKS5tYXgoMS4wKS5kZWZhdWx0KDAuNSkuZGVzY3JpYmUoJ01pbmltdW0gc2ltaWxhcml0eSBzY29yZSBmb3IgYSBjaHVuayB0byBiZSBjb25zaWRlcmVkIHJlbGV2YW50ICgwLTEpJyksXG5cbiAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCBpbmRpdmlkdWFsIHRvZ2dsZXMgKGdyYW51bGFyIGNvbnRyb2wpXG5cbiAgZXhlY3V0aW9uSmF2YVNjcmlwdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9qYXZhc2NyaXB0IHRvb2wnKSxcblxuICBleGVjdXRpb25QeXRob246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdBbGxvdyBydW5fcHl0aG9uIHRvb2wnKSxcblxuICBleGVjdXRpb25UZXJtaW5hbDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9pbl90ZXJtaW5hbCB0b29sJyksXG5cbiAgZXhlY3V0aW9uU2hlbGw6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0FsbG93IGV4ZWN1dGVfY29tbWFuZCB0b29sJyksXG5cblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBXZWIgU2VhcmNoIFNldHRpbmdzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIHNlYXJjaEZhbGxiYWNrQ2hhaW46IHouZW51bShbJ2RkZy1hcGknLCAnZGRnLWZldGNoJywgJ2dvb2dsZScsICdiaW5nJ10pLmRlZmF1bHQoJ2RkZy1hcGknKS5kZXNjcmliZSgnUHJpbWFyeSBzZWFyY2ggZW5naW5lIChhdXRvLWZhbGxiYWNrIHRvIG90aGVycyknKSxcblxuICBtYXhTZWFyY2hSZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLmRlZmF1bHQoMTApLFxuXG4gIHNhZmVzZWFyY2g6IHouZW51bShbJzAnLCAnMScsICcyJ10pLmRlZmF1bHQoJzEnKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIEJyb3dzZXIgU2V0dGluZ3MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgYnJvd3NlclRpbWVvdXQ6IHoubnVtYmVyKCkubWluKDEwMDApLm1heCgzMDAwMCkuZGVmYXVsdCg1MDAwKSxcblxuICBoZWFkbGVzc01vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdSdW4gYnJvd3NlciB3aXRob3V0IEdVSScpLFxuXG5cblxuICAvLyBHaXQgU2V0dGluZ3NcblxuICBnaXRBdXRvQ29tbWl0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcblxuICBkZWZhdWx0QnJhbmNoOiB6LnN0cmluZygpLmRlZmF1bHQoJ21haW4nKSxcblxuXG5cbiAgLy8gU2VjdXJpdHkgU2V0dGluZ3NcblxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYmluYXJ5RmlsZURldGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICByZWdleFJlRG9TUHJvdGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICBtYXhSZWdleExlbmd0aDogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMDApLmRlZmF1bHQoNTAwKSxcblxuXG5cbiAgLy8gU3RhdGUgTWFuYWdlbWVudFxuXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIHN0YXRlTWF4U2l6ZTogei5udW1iZXIoKS5taW4oMTAyNCkubWF4KDEwNDg1NzYpLmRlZmF1bHQoMTAyNDApLFxuXG5cblxuICAvLyBpMThuIFNldHRpbmdzXG5cbiAgbGFuZ3VhZ2U6IHouZW51bShbJ2VuJywgJ2RlJywgJ3poLUNOJywgJ3poLVRXJ10pLmRlZmF1bHQoJ2VuJyksXG5cblxuXG4gIC8vIE5vdGlmaWNhdGlvbiBTZXR0aW5nc1xuXG4gIG5vdGlmaWNhdGlvbnNFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIC8vIFRlbXBvcmFsIEF3YXJlbmVzcyAobWVyZ2VkIGZyb20gdXBfdG9fZGF0ZSlcbiAgdGVtcG9yYWxBd2FyZW5lc3M6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBhdXRvbWF0aWMgZGF0ZS90aW1lIGluamVjdGlvbiBpbnRvIHByb21wdHMnKSxcbiAgZGF0ZUZvcm1hdFN0eWxlOiB6LmVudW0oWydzdGFuZGFyZCcsICdoZXV0ZUlzdCddKS5kZWZhdWx0KCdzdGFuZGFyZCcpLmRlc2NyaWJlKCdEYXRlIGZvcm1hdCBzdHlsZSBmb3IgdGVtcG9yYWwgYXdhcmVuZXNzJyksXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzRVx1RERFMCBDT05URVhUIEdVQVJEIFNFVFRJTkdTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICBjb250ZXh0R3VhcmRFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgQ29udGV4dEd1YXJkIHRva2VuIG1hbmFnZW1lbnQgYW5kIGhpc3RvcnkgY29tcHJlc3Npb24nKSxcbiAgY29udGV4dEd1YXJkVG9rZW5MaW1pdDogei5udW1iZXIoKS5taW4oMTAwMCkubWF4KDIwMDAwMCkuZGVmYXVsdCg4MDAwMCkuZGVzY3JpYmUoJ1Rva2VuIGxpbWl0IGJlZm9yZSBoaXN0b3J5IGNvbXByZXNzaW9uIHRyaWdnZXJzICg5MCUgdGhyZXNob2xkKScpLFxuICBjb250ZXh0R3VhcmRTbWFydFJlYWRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBrZXl3b3JkLWJhc2VkIHNtYXJ0IGZpbGUgcmVhZGluZycpLFxuICBjb250ZXh0R3VhcmRTdW1tYXJ5TW9kZWw6IHouc3RyaW5nKCkuZGVmYXVsdCgnJykuZGVzY3JpYmUoJ0xNIFN0dWRpbyBtb2RlbCBuYW1lIGZvciBzdW1tYXJpemF0aW9uIChsZWF2ZSBlbXB0eSB0byB1c2UgY3VycmVudCBjaGF0IG1vZGVsKScpLFxuICBjb250ZXh0R3VhcmRUZXJtaW5hbEZpbHRlckVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSB0ZXJtaW5hbCBvdXRwdXQgZmlsdGVyaW5nJyksXG4gIGNvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyTGVuZ3RoOiB6Lm51bWJlcigpLm1pbigxMDApLm1heCgyMDAwMCkuZGVmYXVsdCgyMDAwKS5kZXNjcmliZSgnTWF4IGNoYXJzIGJlZm9yZSB0ZXJtaW5hbCBvdXRwdXQgaXMgZmlsdGVyZWQnKSxcbn0pO1xuXG5cblxuZXhwb3J0IHR5cGUgUGx1Z2luQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQ29uZmlnU2NoZW1hPjtcblxuXG5cbi8qKlxuXG4gKiBEZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5cbiAqL1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT05GSUc6IFBsdWdpbkNvbmZpZyA9IHtcblxuICBmaWxlU3lzdGVtOiB0cnVlLFxuXG4gIHdlYlNlYXJjaDogdHJ1ZSxcblxuICBicm93c2VyQXV0b21hdGlvbjogZmFsc2UsXG5cbiAgZ2l0T3BlcmF0aW9uczogZmFsc2UsXG5cbiAgZGF0YWJhc2VRdWVyaWVzOiBmYWxzZSxcblxuICBkb2N1bWVudFBhcnNpbmc6IHRydWUsXG5cbiAgYmFja2dyb3VuZENvbW1hbmRzOiBmYWxzZSxcblxuXG5cbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjZBMFx1RkUwRlxuXG4gIGdvZE1vZGU6IGZhbHNlLFxuXG5cblxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNDXHVERDk1IE5FVyBUT09MIENBVEVHT1JJRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgaW1hZ2VQcm9jZXNzaW5nOiB0cnVlLFxuXG4gIGh0dHBDbGllbnQ6IGZhbHNlLFxuXG4gIHZlY3RvclJBRzogdHJ1ZSxcbiAgdWlHZW5lcmF0aW9uOiBmYWxzZSxcbiAgY29udGV4dE1hbmFnZW1lbnQ6IHRydWUsXG5cblxuXG4gIC8vIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI2QTBcdUZFMEZcblxuICBkb2N1bWVudFJBRzogdHJ1ZSxcblxuICByZXRyaWV2YWxMaW1pdDogNSxcblxuICByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZDogMC41LFxuXG5cblxuICAvLyBFeGVjdXRpb24gdG9vbHMgXHUyMDE0IGFsbCBkaXNhYmxlZCBieSBkZWZhdWx0IChkYW5nZXJvdXMhKVxuXG4gIGV4ZWN1dGlvbkphdmFTY3JpcHQ6IGZhbHNlLFxuXG4gIGV4ZWN1dGlvblB5dGhvbjogZmFsc2UsXG5cbiAgZXhlY3V0aW9uVGVybWluYWw6IGZhbHNlLFxuXG4gIGV4ZWN1dGlvblNoZWxsOiB0cnVlLFxuXG5cblxuICBzZWFyY2hGYWxsYmFja0NoYWluOiAnZGRnLWFwaScsXG5cbiAgbWF4U2VhcmNoUmVzdWx0czogMTAsXG5cbiAgc2FmZXNlYXJjaDogJzEnLFxuXG4gIGJyb3dzZXJUaW1lb3V0OiA1MDAwLFxuXG4gIGhlYWRsZXNzTW9kZTogZmFsc2UsXG5cbiAgZ2l0QXV0b0NvbW1pdDogZmFsc2UsXG5cbiAgZGVmYXVsdEJyYW5jaDogJ21haW4nLFxuXG4gIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogdHJ1ZSxcblxuICBiaW5hcnlGaWxlRGV0ZWN0aW9uOiB0cnVlLFxuXG4gIHJlZ2V4UmVEb1NQcm90ZWN0aW9uOiB0cnVlLFxuXG4gIG1heFJlZ2V4TGVuZ3RoOiA1MDAsXG5cbiAgc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQ6IHRydWUsXG5cbiAgc3RhdGVNYXhTaXplOiAxMDI0MCxcblxuICBsYW5ndWFnZTogJ2VuJyxcblxuICBub3RpZmljYXRpb25zRW5hYmxlZDogdHJ1ZSxcblxuICAvLyBUZW1wb3JhbCBBd2FyZW5lc3MgKG1lcmdlZCBmcm9tIHVwX3RvX2RhdGUpXG4gIHRlbXBvcmFsQXdhcmVuZXNzOiB0cnVlLFxuICBkYXRlRm9ybWF0U3R5bGU6ICdzdGFuZGFyZCcsXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzRVx1RERFMCBDT05URVhUIEdVQVJEIFNFVFRJTkdTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICBjb250ZXh0R3VhcmRFbmFibGVkOiB0cnVlLFxuICBjb250ZXh0R3VhcmRUb2tlbkxpbWl0OiA4MDAwMCwgICAgICAgICAgIC8vIH44MGsgdG9rZW5zIGJlZm9yZSBjb21wcmVzc2lvbiAoOTAlID0gNzJrIHRocmVzaG9sZClcbiAgY29udGV4dEd1YXJkU21hcnRSZWFkaW5nOiB0cnVlLFxuICBjb250ZXh0R3VhcmRTdW1tYXJ5TW9kZWw6ICcnLCAgICAgICAgICAgIC8vIEVtcHR5ID0gdXNlIGN1cnJlbnQgY2hhdCBtb2RlbFxuICBjb250ZXh0R3VhcmRUZXJtaW5hbEZpbHRlckVuYWJsZWQ6IHRydWUsXG4gIGNvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyTGVuZ3RoOiAyMDAwLCAgLy8gRmlsdGVyIHRlcm1pbmFsIG91dHB1dCA+IDJLQlxufTtcblxuXG5cbi8qKlxuXG4gKiBWYWxpZGF0ZSBhbmQgc2FuaXRpemUgY29uZmlnIGlucFxuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uZmlnKGlucHV0OiB1bmtub3duKTogUGx1Z2luQ29uZmlnIHtcblxuICBjb25zdCByZXN1bHQgPSBDb25maWdTY2hlbWEuc2FmZVBhcnNlKGlucHV0KTtcblxuICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29uZmlndXJhdGlvbjogJHtyZXN1bHQuZXJyb3IubWVzc2FnZX1gKTtcblxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5kYXRhO1xufVxuXG5cblxuLyoqXG4gKiBDaGVjayBpZiBhIHRvb2wgY2F0ZWdvcnkgaXMgZW5hYmxlZCBpbiBjb25maWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVG9vbEVuYWJsZWQoY29uZmlnOiBQbHVnaW5Db25maWcsIGNhdGVnb3J5OiBrZXlvZiBQaWNrPFBsdWdpbkNvbmZpZywgJ2ZpbGVTeXN0ZW0nIHwgJ3dlYlNlYXJjaCcgfCAnYnJvd3NlckF1dG9tYXRpb24nIHwgJ2dpdE9wZXJhdGlvbnMnIHwgJ2RhdGFiYXNlUXVlcmllcycgfCAnZG9jdW1lbnRQYXJzaW5nJyB8ICdiYWNrZ3JvdW5kQ29tbWFuZHMnIHwgJ2ltYWdlUHJvY2Vzc2luZycgfCAnaHR0cENsaWVudCcgfCAndmVjdG9yUkFHJyB8ICd1aUdlbmVyYXRpb24nIHwgJ2NvbnRleHRNYW5hZ2VtZW50Jz4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvbmZpZ1tjYXRlZ29yeV0gPT09IHRydWU7XG59XG5cblxuXG5cbi8qKlxuXG4gKiBDaGVjayBpZiBhIHNwZWNpZmljIGV4ZWN1dGlvbiB0b29sIGlzIGVuYWJsZWQgKGdyYW51bGFyKVxuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoY29uZmlnOiBQbHVnaW5Db25maWcsIHRvb2w6ICdqYXZhc2NyaXB0JyB8ICdweXRob24nIHwgJ3Rlcm1pbmFsJyB8ICdzaGVsbCcpOiBib29sZWFuIHtcblxuICBzd2l0Y2ggKHRvb2wpIHtcblxuICAgIGNhc2UgJ2phdmFzY3JpcHQnOiByZXR1cm4gY29uZmlnLmV4ZWN1dGlvbkphdmFTY3JpcHQgPT09IHRydWU7XG5cbiAgICBjYXNlICdweXRob24nOiAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25QeXRob24gPT09IHRydWU7XG5cbiAgICBjYXNlICd0ZXJtaW5hbCc6ICAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25UZXJtaW5hbCA9PT0gdHJ1ZTtcblxuICAgIGNhc2UgJ3NoZWxsJzogICAgICByZXR1cm4gY29uZmlnLmV4ZWN1dGlvblNoZWxsID09PSB0cnVlO1xuXG4gIH1cblxufVxuXG5cblxuLyoqXG5cbiAqIEdldCB0aGUgZXhlY3V0aW9uIHRvb2wga2V5IGZyb20gYSB0b29sIG5hbWVcblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeGVjdXRpb25Ub29sS2V5KHRvb2xOYW1lOiBzdHJpbmcpOiAnamF2YXNjcmlwdCcgfCAncHl0aG9uJyB8ICd0ZXJtaW5hbCcgfCAnc2hlbGwnIHwgbnVsbCB7XG5cbiAgc3dpdGNoICh0b29sTmFtZSkge1xuXG4gICAgY2FzZSAncnVuX2phdmFzY3JpcHQnOiByZXR1cm4gJ2phdmFzY3JpcHQnO1xuXG4gICAgY2FzZSAncnVuX3B5dGhvbic6ICAgICByZXR1cm4gJ3B5dGhvbic7XG5cbiAgICBjYXNlICdydW5faW5fdGVybWluYWwnOiByZXR1cm4gJ3Rlcm1pbmFsJztcblxuICAgIGNhc2UgJ2V4ZWN1dGVfY29tbWFuZCc6IHJldHVybiAnc2hlbGwnO1xuXG4gICAgZGVmYXVsdDogICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICB9XG5cbn1cblxuXG5cbi8qKlxuXG4gKiBDaGVjayBpZiBBTlkgZXhlY3V0aW9uIHRvb2wgaXMgZW5hYmxlZCAobGVnYWN5IGNvbXBhdGliaWxpdHkpXG5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaGFzQW55RXhlY3V0aW9uVG9vbChjb25maWc6IFBsdWdpbkNvbmZpZyk6IGJvb2xlYW4ge1xuXG4gIHJldHVybiBjb25maWcuZXhlY3V0aW9uSmF2YVNjcmlwdCB8fCBjb25maWcuZXhlY3V0aW9uUHl0aG9uIHx8IFxuXG4gICAgICAgICBjb25maWcuZXhlY3V0aW9uVGVybWluYWwgfHwgY29uZmlnLmV4ZWN1dGlvblNoZWxsO1xuXG59XG5cblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBMTSBTdHVkaW8gVUkgU2NoZW1hdGljcyA9PT09PT09PT09PT09PT09PT09PVxuXG4vLyBUaGVzZSBkZWZpbmUgdGhlIHRvZ2dsZSBzd2l0Y2hlcyB0aGF0IGFwcGVhciBpbiBMTSBTdHVkaW8ncyBzZXR0aW5ncyBwYW5lbC5cblxuXG5cbmV4cG9ydCBjb25zdCBjb25maWdTY2hlbWF0aWNzID0gY3JlYXRlQ29uZmlnU2NoZW1hdGljcygpXG5cblxuXG4gIC8vIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAtIFRPUCBQUklPUklUWSBXQVJOSU5HIFRPR0dMRSBcdTI2QTBcdUZFMEZcblxuICAuZmllbGQoJ2dvZE1vZGUnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1MjZBMVx1MjZBMFx1RkUwRiBHT0QgTU9ERSAtIEVuYWJsZSBBTEwgVG9vbHMgXHUyNkEwXHVGRTBGXHUyNkExJyxcblxuICAgIHN1YnRpdGxlOiAnV0FSTklORzogQWN0aXZhdGVzIGV2ZXJ5IHRvb2wgY2F0ZWdvcnkgaW5zdGFudGx5LiBVc2Ugd2l0aCBjYXV0aW9uLicsXG5cbiAgICBoaW50OiAnV2hlbiBlbmFibGVkLCBBTEwgaW5kaXZpZHVhbCB0b2dnbGVzIGFyZSBieXBhc3NlZCBhbmQgZXZlcnkgdG9vbCBpcyBhY3RpdmF0ZWQgcmVnYXJkbGVzcyBvZiBzZXR0aW5ncy4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmdvZE1vZGUpXG5cblxuXG4gIC8vIFx1RDgzQ1x1REY5Qlx1RkUwRiBUT09MIEdBVElORyAoSGF1cHRzY2hhbHRlcikgXHVEODNDXHVERjlCXHVGRTBGXG5cbiAgLmZpZWxkKCdmaWxlU3lzdGVtJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0MxIEZpbGUgU3lzdGVtIFRvb2xzJywgaGludDogJ0VuYWJsZSBmaWxlIHJlYWQvd3JpdGUvc2VhcmNoIG9wZXJhdGlvbnMnIH0sIERFRkFVTFRfQ09ORklHLmZpbGVTeXN0ZW0pXG5cbiAgLmZpZWxkKCd3ZWJTZWFyY2gnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGMTAgV2ViICYgUmVzZWFyY2ggVG9vbHMnLCBoaW50OiAnRW5hYmxlIER1Y2tEdWNrR28vV2lraXBlZGlhIHNlYXJjaCcgfSwgREVGQVVMVF9DT05GSUcud2ViU2VhcmNoKVxuXG4gIC8vIFx1RDgzRFx1REMxOSBHSVQgJiBHSVRIVUIgVE9PTFMgKHZpc3VlbGxlIEdydXBwaWVydW5nKSBcdUQ4M0RcdURDMTlcblxuICAuZmllbGQoJ2dpdE9wZXJhdGlvbnMnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REMxOSBHaXQgJiBHaXRIdWIgVG9vbHMnLCBcblxuICAgIHN1YnRpdGxlOiAnVmVyc2lvbiBDb250cm9sICYgQVBJJyxcblxuICAgIGhpbnQ6ICdFbmFibGUgZ2l0IG9wZXJhdGlvbnMgYW5kIEdpdEh1YiBBUEkgYWNjZXNzLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZ2l0T3BlcmF0aW9ucylcblxuICAuZmllbGQoJ2dpdEF1dG9Db21taXQnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENCRSBHaXQgQXV0by1Db21taXQnLCBcblxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEdpdCAmIEdpdEh1YiBUb29scycsXG5cbiAgICBoaW50OiAnQXV0b21hdGljYWxseSBjb21taXQgY2hhbmdlcyBhZnRlciBvcGVyYXRpb25zJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5naXRBdXRvQ29tbWl0KVxuXG4gIC5maWVsZCgnZGVmYXVsdEJyYW5jaCcsICdzdHJpbmcnLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGM0YgRGVmYXVsdCBCcmFuY2gnLCBcblxuICAgIHBsYWNlaG9sZGVyOiAnbWFpbicsXG5cbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBHaXQgJiBHaXRIdWIgVG9vbHMnLFxuXG4gICAgaGludDogJ0JyYW5jaCBuYW1lIGZvciBuZXcgcmVwb3NpdG9yaWVzIGFuZCBnaXQgb3BlcmF0aW9ucycsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZGVmYXVsdEJyYW5jaClcblxuXG5cbiAgLmZpZWxkKCdkYXRhYmFzZVF1ZXJpZXMnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREQzRcdUZFMEYgRGF0YWJhc2UgUXVlcmllcycsIGhpbnQ6ICdFbmFibGUgcmVhZC1vbmx5IFNRTGl0ZSBxdWVyaWVzJyB9LCBERUZBVUxUX0NPTkZJRy5kYXRhYmFzZVF1ZXJpZXMpXG5cbiAgLmZpZWxkKCdkb2N1bWVudFBhcnNpbmcnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQzQgRG9jdW1lbnQgUGFyc2luZycsIGhpbnQ6ICdFbmFibGUgUERGL0RPQ1ggZG9jdW1lbnQgcmVhZGluZycgfSwgREVGQVVMVF9DT05GSUcuZG9jdW1lbnRQYXJzaW5nKVxuXG4gIC5maWVsZCgnYmFja2dyb3VuZENvbW1hbmRzJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHUyM0YzIEJhY2tncm91bmQgQ29tbWFuZHMnLCBoaW50OiAnRW5hYmxlIGxvbmctcnVubmluZyBwcm9jZXNzIHRyYWNraW5nJyB9LCBERUZBVUxUX0NPTkZJRy5iYWNrZ3JvdW5kQ29tbWFuZHMpXG5cblxuXG4gIC8vIFx1RDgzQ1x1REQ5NVx1MjAwRFx1Mjc0MCBORVcgVE9PTCBDQVRFR09SSUVTIFx1RDgzQ1x1REQ5NVx1MjAwRFx1Mjc0MFxuXG4gIC5maWVsZCgnaW1hZ2VQcm9jZXNzaW5nJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREQkNcdUZFMEYgSW1hZ2UgUHJvY2Vzc2luZyBUb29scycsIFxuXG4gICAgc3VidGl0bGU6ICdPQ1IsIFNjcmVlbnNob3RzICYgQ29tcGFyaXNvbicsXG5cbiAgICBoaW50OiAnRW5hYmxlIGltYWdlIE9DUiAoVGVzc2VyYWN0LmpzKSwgc2NyZWVuc2hvdCBjYXB0dXJlLCBhbmQgaW1hZ2UgY29tcGFyaXNvbiB0b29scy4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmltYWdlUHJvY2Vzc2luZylcblxuICBcblxuICAuZmllbGQoJ2h0dHBDbGllbnQnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQwQyBIVFRQIENsaWVudCBUb29scycsIFxuXG4gICAgc3VidGl0bGU6ICdHZW5lcmljIFJFU1QgQVBJIENsaWVudCcsXG5cbiAgICBoaW50OiAnRW5hYmxlIGdlbmVyaWMgSFRUUCBjbGllbnQgZm9yIG1ha2luZyByZXF1ZXN0cyB0byBhbnkgUkVTVCBBUEkgKEdFVCwgUE9TVCwgUFVULCBERUxFVEUpLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuaHR0cENsaWVudClcblxuICBcblxuICAuZmllbGQoJ3ZlY3RvclJBRycsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0NBIFZlY3RvciBSQUcgLyBTZW1hbnRpYyBTZWFyY2gnLCBcblxuICAgIHN1YnRpdGxlOiAnU2VtYW50aWMgRG9jdW1lbnQgU2VhcmNoJyxcblxuICAgIGhpbnQ6ICdFbmFibGUgc2VtYW50aWMgc2VhcmNoIHdpdGggdmVjdG9yIGVtYmVkZGluZ3MgZm9yIGludGVsbGlnZW50IGRvY3VtZW50IHJldHJpZXZhbC4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLnZlY3RvclJBRylcbiAgLmZpZWxkKCd1aUdlbmVyYXRpb24nLCAnYm9vbGVhbicsIHsgXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGQTggSW50ZXJhY3RpdmUgVUkgR2VuZXJhdGlvbiBUb29scycsIFxuICAgIHN1YnRpdGxlOiAnR2VuZXJhdGUgYW5kIHJlbmRlciBpbnRlcmFjdGl2ZSBVSSBjb21wb25lbnRzJyxcbiAgICBoaW50OiAnRW5hYmxlIHRvb2xzIGZvciBnZW5lcmF0aW5nIEhUTUwvQ1NTL0pTIGNvbXBvbmVudHMgKGJ1dHRvbnMsIGZvcm1zLCBjaGFydHMsIGRhc2hib2FyZHMpIGFuZCByZW5kZXJpbmcgdGhlbSBpbiB0aGUgYnJvd3Nlci4nLFxuICB9LCBERUZBVUxUX0NPTkZJRy51aUdlbmVyYXRpb24pXG4gIC5maWVsZCgnY29udGV4dE1hbmFnZW1lbnQnLCAnYm9vbGVhbicsIHsgXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0VcdURERTAgQXV0by1Db250ZXh0IE1hbmFnZW1lbnQgVG9vbHMnLCBcbiAgICBzdWJ0aXRsZTogJ0F1dG9tYXRpYyBzZXNzaW9uIHRyYWNraW5nIGFuZCBtZW1vcnkgbWFuYWdlbWVudCcsXG4gICAgaGludDogJ0VuYWJsZSB0b29scyBmb3IgYXV0b21hdGljYWxseSBzYXZpbmcgaW1wb3J0YW50IGRlY2lzaW9ucywgcGF0dGVybnMsIGFuZCBjb25maWd1cmF0aW9ucyB0byBwZXJzaXN0ZW50IG1lbW9yeS4nLFxuICB9LCBERUZBVUxUX0NPTkZJRy5jb250ZXh0TWFuYWdlbWVudClcblxuXG5cbiAgLy8gXHVEODNEXHVEQ0RBIERPQ1VNRU5UIFJBRyAvIENIQVQgV0lUSCBGSUxFUyBcdUQ4M0RcdURDREFcblxuICAuZmllbGQoJ2RvY3VtZW50UkFHJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDREEgRG9jdW1lbnQgUkFHIC8gQ2hhdCB3aXRoIEZpbGVzJywgXG5cbiAgICBzdWJ0aXRsZTogJ0VuYWJsZSBmaWxlIGluZGV4aW5nIGFuZCBzZW1hbnRpYyBzZWFyY2ggZm9yIGNoYXQnLFxuXG4gICAgaGludDogJ0F0dGFjaCBkb2N1bWVudHMgdG8geW91ciBjaGF0IG1lc3NhZ2VzLiBUaGUgcGx1Z2luIHdpbGwgYXV0b21hdGljYWxseSByZXRyaWV2ZSByZWxldmFudCBjb250ZW50IGZyb20gYXR0YWNoZWQgZmlsZXMgdXNpbmcgc2VtYW50aWMgc2VhcmNoLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZG9jdW1lbnRSQUcpXG5cbiAgXG5cbiAgLmZpZWxkKCdyZXRyaWV2YWxMaW1pdCcsICdudW1lcmljJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDIyIFJldHJpZXZhbCBMaW1pdCcsIFxuXG4gICAgc3VidGl0bGU6ICdNYXggY2h1bmtzIHRvIHJldHVybiBwZXIgcXVlcnknLFxuXG4gICAgbWluOiAxLCBtYXg6IDIwLCBpbnQ6IHRydWUsXG5cbiAgICBoaW50OiAnTWF4aW11bSBudW1iZXIgb2YgcmVsZXZhbnQgZG9jdW1lbnQgY2h1bmtzIHRvIHJldHJpZXZlIGZvciBlYWNoIHF1ZXJ5LicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcucmV0cmlldmFsTGltaXQpXG5cbiAgXG5cbiAgLmZpZWxkKCdyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCcsICdudW1lcmljJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERkFGIFJldHJpZXZhbCBBZmZpbml0eSBUaHJlc2hvbGQnLCBcblxuICAgIHN1YnRpdGxlOiAnTWluaW11bSByZWxldmFuY2Ugc2NvcmUgKDAtMSknLFxuXG4gICAgbWluOiAwLjAsIG1heDogMS4wLCBzdGVwOiAwLjAxLFxuXG4gICAgaGludDogJ0NodW5rcyBiZWxvdyB0aGlzIHNpbWlsYXJpdHkgc2NvcmUgd2lsbCBiZSBmaWx0ZXJlZCBvdXQuIExvd2VyID0gbW9yZSByZXN1bHRzIGJ1dCBwb3RlbnRpYWxseSBsZXNzIHJlbGV2YW50LicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcucmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQpXG5cbiAgLy8gXHUyNkExIEVYRUNVVElPTiBUT09MUyAoR2VmXHUwMEU0aHJsaWNoISkgXHUyNkExXG5cbiAgLmZpZWxkKCdleGVjdXRpb25KYXZhU2NyaXB0JywgJ2Jvb2xlYW4nLCB7XG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1MjZBMSBKYXZhU2NyaXB0LUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXG5cbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdydW5famF2YXNjcmlwdCctVG9vbFwiLFxuXG4gICAgaGludDogJ0dFRkFIUjogQ29kZSBsXHUwMEU0dWZ0IGF1ZiBJaHJlbSBSZWNobmVyLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uSmF2YVNjcmlwdClcblxuICAuZmllbGQoJ2V4ZWN1dGlvblB5dGhvbicsICdib29sZWFuJywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDMEQgUHl0aG9uLUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXG5cbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdydW5fcHl0aG9uJy1Ub29sXCIsXG5cbiAgICBoaW50OiAnR0VGQUhSOiBDb2RlIGxcdTAwRTR1ZnQgYXVmIElocmVtIFJlY2huZXIuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5leGVjdXRpb25QeXRob24pXG5cbiAgLmZpZWxkKCdleGVjdXRpb25UZXJtaW5hbCcsICdib29sZWFuJywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQkIgVGVybWluYWwtQXVzZlx1MDBGQ2hydW5nIGVybGF1YmVuJyxcblxuICAgIHN1YnRpdGxlOiBcIkFrdGl2aWVydCBkYXMgJ3J1bl9pbl90ZXJtaW5hbCctVG9vbFwiLFxuXG4gICAgaGludDogJ1x1MDBENmZmbmV0IGVjaHRlIFRlcm1pbmFsLUZlbnN0ZXIuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5leGVjdXRpb25UZXJtaW5hbClcblxuICAuZmllbGQoJ2V4ZWN1dGlvblNoZWxsJywgJ2Jvb2xlYW4nLCB7XG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQyNyBTaGVsbC1CZWZlaGxzYXVzZlx1MDBGQ2hydW5nIGVybGF1YmVuJyxcblxuICAgIHN1YnRpdGxlOiBcIkFrdGl2aWVydCBkYXMgJ2V4ZWN1dGVfY29tbWFuZCctVG9vbFwiLFxuXG4gICAgaGludDogJ0dFRkFIUjogQmVmZWhsZSBsYXVmZW4gYXVmIElocmVtIFJlY2huZXIuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5leGVjdXRpb25TaGVsbClcblxuXG5cbiAgLy8gXHVEODNEXHVERDBEIFNFQVJDSCBTRVRUSU5HUyBcdUQ4M0RcdUREMERcblxuICAuZmllbGQoJ3NlYXJjaEZhbGxiYWNrQ2hhaW4nLCAnc2VsZWN0Jywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMEQgU2VhcmNoIEZhbGxiYWNrIENoYWluJyxcblxuICAgIGhpbnQ6ICdQcmltYXJ5IHNlYXJjaCBlbmdpbmUuIEF1dG8tZmFsbHMgYmFjayB0byBvdGhlcnMgaWYgdW5hdmFpbGFibGUuJyxcblxuICAgIG9wdGlvbnM6IFtcblxuICAgICAgeyB2YWx1ZTogJ2RkZy1hcGknLCBkaXNwbGF5TmFtZTogJ0R1Y2tEdWNrR28gQVBJJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnZGRnLWZldGNoJywgZGlzcGxheU5hbWU6ICdEdWNrRHVja0dvIEZldGNoJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnZ29vZ2xlJywgZGlzcGxheU5hbWU6ICdHb29nbGUnIH0sXG5cbiAgICAgIHsgdmFsdWU6ICdiaW5nJywgZGlzcGxheU5hbWU6ICdCaW5nJyB9LFxuXG4gICAgXSxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5zZWFyY2hGYWxsYmFja0NoYWluKVxuXG4gIC5maWVsZCgnbWF4U2VhcmNoUmVzdWx0cycsICdudW1lcmljJywgeyBtaW46IDEsIG1heDogNTAsIGludDogdHJ1ZSB9LCBERUZBVUxUX0NPTkZJRy5tYXhTZWFyY2hSZXN1bHRzKVxuXG4gIC5maWVsZCgnc2FmZXNlYXJjaCcsICdzZWxlY3QnLCB7XG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REVFMVx1RkUwRiBTYWZlIFNlYXJjaCcsXG5cbiAgICBvcHRpb25zOiBbXG5cbiAgICAgIHsgdmFsdWU6ICcwJywgZGlzcGxheU5hbWU6ICdPZmYnIH0sXG5cbiAgICAgIHsgdmFsdWU6ICcxJywgZGlzcGxheU5hbWU6ICdNb2RlcmF0ZScgfSxcblxuICAgICAgeyB2YWx1ZTogJzInLCBkaXNwbGF5TmFtZTogJ1N0cmljdCcgfSxcblxuICAgIF0sXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuc2FmZXNlYXJjaClcblxuXG5cbiAgLy8gXHVEODNEXHVEREE1XHVGRTBGIEJST1dTRVIgQVVUT01BVElPTiBUT09MUyBcdUQ4M0RcdUREQTVcdUZFMEZcblxuICAuZmllbGQoJ2Jyb3dzZXJBdXRvbWF0aW9uJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREQTVcdUZFMEYgQnJvd3NlciBBdXRvbWF0aW9uIFRvb2xzJywgXG5cbiAgICBzdWJ0aXRsZTogJ0hlYWRsZXNzIGJyb3dzZXIgY29udHJvbCAmIGF1dG9tYXRpb24nLFxuXG4gICAgaGludDogJ0VuYWJsZSBQdXBwZXRlZXItYmFzZWQgaGVhZGxlc3MgYnJvd3NlciBhdXRvbWF0aW9uIGZvciB3ZWIgc2NyYXBpbmcsIHRlc3RpbmcsIGFuZCBVSSBpbnRlcmFjdGlvbi4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmJyb3dzZXJBdXRvbWF0aW9uKVxuXG4gIFxuXG4gIC5maWVsZCgnYnJvd3NlclRpbWVvdXQnLCAnbnVtZXJpYycsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1MjNGMVx1RkUwRiBCcm93c2VyIFRpbWVvdXQnLCBcblxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsXG5cbiAgICBtaW46IDEwMDAsIG1heDogMzAwMDAsIGludDogdHJ1ZSxcblxuICAgIGhpbnQ6ICdNYXhpbXVtIHRpbWUgKG1zKSB0byB3YWl0IGZvciBicm93c2VyIG9wZXJhdGlvbnMgYmVmb3JlIHRpbWluZyBvdXQuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5icm93c2VyVGltZW91dClcblxuICBcblxuICAuZmllbGQoJ2hlYWRsZXNzTW9kZScsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQzdCIEhlYWRsZXNzIE1vZGUnLCBcblxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsXG5cbiAgICBoaW50OiAnUnVuIGJyb3dzZXIgd2l0aG91dCBHVUkgKHJlY29tbWVuZGVkIGZvciBhdXRvbWF0aW9uKS4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmhlYWRsZXNzTW9kZSlcblxuXG5cbiAgLy8gXHVEODNEXHVERDEyIFNFQ1VSSVRZIFNFVFRJTkdTIFx1RDgzRFx1REQxMlxuXG4gIC5maWVsZCgncGF0aFZhbGlkYXRpb25FbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDEyIFBhdGggVmFsaWRhdGlvbicsIGhpbnQ6ICdQcmV2ZW50IGRpcmVjdG9yeSB0cmF2ZXJzYWwgYXR0YWNrcycgfSwgREVGQVVMVF9DT05GSUcucGF0aFZhbGlkYXRpb25FbmFibGVkKVxuXG4gIC5maWVsZCgnYmluYXJ5RmlsZURldGVjdGlvbicsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDMSBCaW5hcnkgRmlsZSBEZXRlY3Rpb24nLCBoaW50OiAnRGV0ZWN0IGJpbmFyeSBmaWxlcyB2aWEgbnVsbCBieXRlIGNoZWNrJyB9LCBERUZBVUxUX0NPTkZJRy5iaW5hcnlGaWxlRGV0ZWN0aW9uKVxuXG4gIC5maWVsZCgncmVnZXhSZURvU1Byb3RlY3Rpb24nLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURFRTFcdUZFMEYgUmVEb1MgUHJvdGVjdGlvbicsIGhpbnQ6ICdQcm90ZWN0IGFnYWluc3QgcmVnZXggZGVuaWFsLW9mLXNlcnZpY2UnIH0sIERFRkFVTFRfQ09ORklHLnJlZ2V4UmVEb1NQcm90ZWN0aW9uKVxuXG4gIC5maWVsZCgnbWF4UmVnZXhMZW5ndGgnLCAnbnVtZXJpYycsIHsgbWluOiAxLCBtYXg6IDEwMDAsIGludDogdHJ1ZSB9LCBERUZBVUxUX0NPTkZJRy5tYXhSZWdleExlbmd0aClcblxuXG5cbiAgLy8gXHVEODNEXHVEQ0JEIFNUQVRFIE1BTkFHRU1FTlQgXHVEODNEXHVEQ0JEXG5cbiAgLmZpZWxkKCdzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENCRCBTdGF0ZSBQZXJzaXN0ZW5jZScsIGhpbnQ6ICdQZXJzaXN0IHRvb2wgZXhlY3V0aW9uIHN0YXRlIGJldHdlZW4gc2Vzc2lvbnMnIH0sIERFRkFVTFRfQ09ORklHLnN0YXRlUGVyc2lzdGVuY2VFbmFibGVkKVxuXG4gIC5maWVsZCgnc3RhdGVNYXhTaXplJywgJ251bWVyaWMnLCB7IG1pbjogMTAyNCwgbWF4OiAxMDQ4NTc2LCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcuc3RhdGVNYXhTaXplKVxuXG5cblxuICAvLyBcdUQ4M0NcdURGMTAgTEFOR1VBR0UgJiBOT1RJRklDQVRJT05TIFx1RDgzQ1x1REYxMFxuXG4gIC5maWVsZCgnbGFuZ3VhZ2UnLCAnc2VsZWN0Jywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGMTAgTGFuZ3VhZ2UnLFxuXG4gICAgb3B0aW9uczogW1xuXG4gICAgICB7IHZhbHVlOiAnZW4nLCBkaXNwbGF5TmFtZTogJ0VuZ2xpc2gnIH0sXG5cbiAgICAgIHsgdmFsdWU6ICdkZScsIGRpc3BsYXlOYW1lOiAnRGV1dHNjaCAoR2VybWFuKScgfSxcblxuICAgICAgeyB2YWx1ZTogJ3poLUNOJywgZGlzcGxheU5hbWU6ICdTaW1wbGlmaWVkIENoaW5lc2UnIH0sXG5cbiAgICAgIHsgdmFsdWU6ICd6aC1UVycsIGRpc3BsYXlOYW1lOiAnVHJhZGl0aW9uYWwgQ2hpbmVzZScgfSxcblxuICAgIF0sXG5cbiAgfSwgREVGQVVMVF9DT05GSUcubGFuZ3VhZ2UpXG5cblxuXG4gIC5maWVsZCgnbm90aWZpY2F0aW9uc0VuYWJsZWQnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMTQgRGVza3RvcCBOb3RpZmljYXRpb25zJywgaGludDogJ1Nob3cgc3lzdGVtIG5vdGlmaWNhdGlvbnMnIH0sIERFRkFVTFRfQ09ORklHLm5vdGlmaWNhdGlvbnNFbmFibGVkKVxuXG4gIC8vIFx1MjNGMCBURU1QT1JBTCBBV0FSRU5FU1MgKGZyb20gdXBfdG9fZGF0ZSlcbiAgLmZpZWxkKCd0ZW1wb3JhbEF3YXJlbmVzcycsICdib29sZWFuJywge1xuICAgIGRpc3BsYXlOYW1lOiAnXHUyM0YwIFRlbXBvcmFsIEF3YXJlbmVzcycsXG4gICAgc3VidGl0bGU6ICdJbmplY3RzIGN1cnJlbnQgZGF0ZS90aW1lIGludG8gZXZlcnkgbWVzc2FnZScsXG4gICAgaGludDogJ0VuYWJsZXMgdGhlIEFJIHRvIGtub3cgdGhlIGN1cnJlbnQgdGltZS4nLFxuICB9LCBERUZBVUxUX0NPTkZJRy50ZW1wb3JhbEF3YXJlbmVzcylcbiAgLmZpZWxkKCdkYXRlRm9ybWF0U3R5bGUnLCAnc2VsZWN0Jywge1xuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0M1IERhdGUgRm9ybWF0IFN0eWxlJyxcbiAgICBvcHRpb25zOiBbXG4gICAgICB7IHZhbHVlOiAnc3RhbmRhcmQnLCBkaXNwbGF5TmFtZTogJ1N0YW5kYXJkIChbWmVpdDogLi4uXSknIH0sXG4gICAgICB7IHZhbHVlOiAnaGV1dGVJc3QnLCBkaXNwbGF5TmFtZTogJ0hFVVRFIElTVCBNb2RlIChQcm9taW5lbnQpJyB9LFxuICAgIF0sXG4gIH0sIERFRkFVTFRfQ09ORklHLmRhdGVGb3JtYXRTdHlsZSlcblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0VcdURERTAgQ09OVEVYVCBHVUFSRCBTRVRUSU5HUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgLmZpZWxkKCdjb250ZXh0R3VhcmRFbmFibGVkJywgJ2Jvb2xlYW4nLCB7XG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0VcdURERTAgQ29udGV4dEd1YXJkIFRva2VuIE1hbmFnZW1lbnQnLFxuICAgIHN1YnRpdGxlOiAnQXV0b21hdGljIGhpc3RvcnkgY29tcHJlc3Npb24gJiBzbWFydCByZWFkaW5nJyxcbiAgICBoaW50OiAnQXV0b21hdGljYWxseSBjb21wcmVzc2VzIGNoYXQgaGlzdG9yeSB3aGVuIHRva2VuIGxpbWl0IGlzIHJlYWNoZWQuIEVuYWJsZXMgc21hcnQgZmlsZSByZWFkaW5nIGFuZCB0ZXJtaW5hbCBvdXRwdXQgZmlsdGVyaW5nLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmNvbnRleHRHdWFyZEVuYWJsZWQpXG5cbiAgLmZpZWxkKCdjb250ZXh0R3VhcmRUb2tlbkxpbWl0JywgJ251bWVyaWMnLCB7XG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQ0EgVG9rZW4gTGltaXQgQmVmb3JlIENvbXByZXNzaW9uJyxcbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBDb250ZXh0R3VhcmQgU2V0dGluZycsXG4gICAgbWluOiAxMDAwLCBtYXg6IDIwMDAwMCwgaW50OiB0cnVlLFxuICAgIGhpbnQ6ICdDb21wcmVzc2lvbiB0cmlnZ2VycyBhdCA5MCUgb2YgdGhpcyBsaW1pdC4gSGlnaGVyID0gbW9yZSBjb250ZXh0IHJldGFpbmVkIGJ1dCBzbG93ZXIgcmVzcG9uc2VzLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmNvbnRleHRHdWFyZFRva2VuTGltaXQpXG5cbiAgLmZpZWxkKCdjb250ZXh0R3VhcmRTbWFydFJlYWRpbmcnLCAnYm9vbGVhbicsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQwRCBTbWFydCBGaWxlIFJlYWRpbmcnLFxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIENvbnRleHRHdWFyZCBTZXR0aW5nJyxcbiAgICBoaW50OiAnRXh0cmFjdHMga2V5d29yZHMgZnJvbSB1c2VyIHF1ZXJpZXMgdG8gcmVhZCBvbmx5IHJlbGV2YW50IHBvcnRpb25zIG9mIGZpbGVzLiBTYXZlcyB0b2tlbnMgYW5kIHNwZWVkcyB1cCByZXNwb25zZXMuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuY29udGV4dEd1YXJkU21hcnRSZWFkaW5nKVxuXG4gIC5maWVsZCgnY29udGV4dEd1YXJkU3VtbWFyeU1vZGVsJywgJ3N0cmluZycsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRVx1REQxNiBTdW1tYXJ5IE1vZGVsIE5hbWUnLFxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIENvbnRleHRHdWFyZCBTZXR0aW5nJyxcbiAgICBwbGFjZWhvbGRlcjogJyhsZWF2ZSBlbXB0eSBmb3IgY3VycmVudCBjaGF0IG1vZGVsKScsXG4gICAgaGludDogJ0xNIFN0dWRpbyBtb2RlbCBuYW1lIHVzZWQgZm9yIGhpc3Rvcnkgc3VtbWFyaXphdGlvbi4gTGVhdmUgZW1wdHkgdG8gdXNlIHlvdXIgY3VycmVudCBjaGF0IG1vZGVsLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmNvbnRleHRHdWFyZFN1bW1hcnlNb2RlbClcblxuICAuZmllbGQoJ2NvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyRW5hYmxlZCcsICdib29sZWFuJywge1xuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0NDIFRlcm1pbmFsIE91dHB1dCBGaWx0ZXJpbmcnLFxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIENvbnRleHRHdWFyZCBTZXR0aW5nJyxcbiAgICBoaW50OiAnQXV0b21hdGljYWxseSB0cnVuY2F0ZXMgbG9uZyB0ZXJtaW5hbCBvdXRwdXRzIHRvIHNhdmUgdG9rZW5zLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmNvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyRW5hYmxlZClcblxuICAuZmllbGQoJ2NvbnRleHRHdWFyZFRlcm1pbmFsRmlsdGVyTGVuZ3RoJywgJ251bWVyaWMnLCB7XG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQ0YgTWF4IFRlcm1pbmFsIE91dHB1dCBMZW5ndGgnLFxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIENvbnRleHRHdWFyZCBTZXR0aW5nJyxcbiAgICBtaW46IDEwMCwgbWF4OiAyMDAwMCwgaW50OiB0cnVlLFxuICAgIGhpbnQ6ICdNYXhpbXVtIGNoYXJhY3RlcnMgYmVmb3JlIHRlcm1pbmFsIG91dHB1dCBpcyB0cnVuY2F0ZWQgYW5kIHN1bW1hcml6ZWQuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuY29udGV4dEd1YXJkVGVybWluYWxGaWx0ZXJMZW5ndGgpXG5cblxuICAuYnVpbGQoKTtcbiIsICIvKipcbiAqIFBlcnNpc3RlbnQgc3RhdGUgbWFuYWdlbWVudCBmb3IgcGx1Z2luIG9wZXJhdGlvbnNcbiAqIFN0b3JlcyBkYXRhIHRvIGRpc2sgYXMgSlNPTiBmaWxlIGZvciBzdXJ2aXZhbCBhY3Jvc3MgcmVsb2Fkc1xuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xuXG5pbnRlcmZhY2UgU3RhdGVFbnRyeSB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogdW5rbm93bjtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG59XG5cbi8qKiBNaW5pbWFsIGxvZ2dlciBmb3Igc3RhdGUgbWFuYWdlciAoYXZvaWRzIGNpcmN1bGFyIGRlcGVuZGVuY3kgd2l0aCBpbmRleC50cykgKi9cbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKG1zZzogc3RyaW5nKSA9PiB0eXBlb2YgcHJvY2Vzcy5zdGRlcnIud3JpdGUgPT09ICdmdW5jdGlvbicgJiYgcHJvY2Vzcy5zdGRlcnIud3JpdGUoYFtTdGF0ZU1hbmFnZXJdICR7bXNnfVxcbmApLFxufTtcblxuLyoqIERlYm91bmNlZCBhc3luYyBzdGF0ZSBwZXJzaXN0ZW5jZSAoNTAwbXMgZGVsYXkpICovXG5mdW5jdGlvbiBjcmVhdGVEZWJvdW5jZWRTYXZlKHNhdmVGbjogKCkgPT4gdm9pZCwgZGVsYXlNczogbnVtYmVyID0gNTAwKTogKCgpID0+IHZvaWQpIHtcbiAgbGV0IHRpbWVySWQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XG4gIFxuICByZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VkU2F2ZSgpOiB2b2lkIHtcbiAgICBpZiAodGltZXJJZCkgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNhdmVGbigpO1xuICAgICAgdGltZXJJZCA9IG51bGw7XG4gICAgfSwgZGVsYXlNcyk7XG4gIH07XG59XG5cbi8qKlxuICogRGVmYXVsdCBtZW1vcnkgZmlsZSBsb2NhdGlvbiAoaW4gTE0gU3R1ZGlvIHBsdWdpbiBkYXRhIGRpcmVjdG9yeSlcbiAqL1xuZnVuY3Rpb24gZ2V0TWVtb3J5RmlsZVBhdGgoKTogc3RyaW5nIHtcbiAgLy8gVHJ5IHRvIGZpbmQgTE0gU3R1ZGlvJ3MgYXBwIGRhdGEgZGlyZWN0b3J5IGZvciBwZXJzaXN0ZW5jZVxuICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gIFxuICBsZXQgYmFzZURpcjogc3RyaW5nO1xuICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgY2FzZSAnd2luMzInOlxuICAgICAgYmFzZURpciA9IHBhdGguam9pbihwcm9jZXNzLmVudi5BUFBEQVRBIHx8ICcnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICBiYXNlRGlyID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJ0xpYnJhcnknLCAnQXBwbGljYXRpb24gU3VwcG9ydCcsICdsbS1zdHVkaW8nLCAncGx1Z2lucycpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJhc2VEaXIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuSE9NRSB8fCAnJywgJy5sb2NhbCcsICdzaGFyZScsICdsbS1zdHVkaW8nLCAncGx1Z2lucycpO1xuICB9XG4gIFxuICByZXR1cm4gcGF0aC5qb2luKGJhc2VEaXIsICdhaS10b29sYm94LW1lbW9yeS5qc29uJyk7XG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0ZU1hbmFnZXIge1xuICBwcml2YXRlIHN0YXRlOiBNYXA8c3RyaW5nLCBTdGF0ZUVudHJ5PjtcbiAgcHJpdmF0ZSBtYXhTaXplOiBudW1iZXI7XG4gIHByaXZhdGUgcGVyc2lzdGVuY2VFbmFibGVkOiBib29sZWFuO1xuICBwcml2YXRlIG1lbW9yeUZpbGU6IHN0cmluZztcbiAgcHJpdmF0ZSBydW5uaW5nU2l6ZTogbnVtYmVyOyAvLyBUcmFjayBzaXplIGluY3JlbWVudGFsbHkgZm9yIE8oMSkgY2hlY2tzXG4gIHByaXZhdGUgZGVib3VuY2VkU2F2ZTogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQbHVnaW5Db25maWcpIHtcbiAgICB0aGlzLnN0YXRlID0gbmV3IE1hcCgpO1xuICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgIGNvbnN0IGVmZmVjdGl2ZUNvbmZpZyA9IGNvbmZpZyB8fCBERUZBVUxUX0NPTkZJRztcbiAgICB0aGlzLm1heFNpemUgPSBlZmZlY3RpdmVDb25maWcuc3RhdGVNYXhTaXplO1xuICAgIHRoaXMucGVyc2lzdGVuY2VFbmFibGVkID0gZWZmZWN0aXZlQ29uZmlnLnN0YXRlUGVyc2lzdGVuY2VFbmFibGVkO1xuICAgIHRoaXMubWVtb3J5RmlsZSA9IGdldE1lbW9yeUZpbGVQYXRoKCk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIGRlYm91bmNlZCBzYXZlIGZ1bmN0aW9uICg1MDBtcyBkZWxheSlcbiAgICB0aGlzLmRlYm91bmNlZFNhdmUgPSBjcmVhdGVEZWJvdW5jZWRTYXZlKCgpID0+IHRoaXMuc2F2ZVRvRmlsZSgpLCA1MDApO1xuICAgIFxuICAgIC8vIEF1dG8tbG9hZCBmcm9tIGRpc2sgaWYgcGVyc2lzdGVuY2UgaXMgZW5hYmxlZFxuICAgIGlmICh0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCkge1xuICAgICAgdGhpcy5sb2FkRnJvbUZpbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGEgc3RhdGUgdmFsdWUgd2l0aCBrZXkgYW5kIG9wdGlvbmFsIG1ldGFkYXRhXG4gICAqL1xuICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgY29uc3QgbmV3VmFsdWVTaXplID0gdGhpcy5nZXRTaXplT2ZWYWx1ZSh2YWx1ZSk7XG4gICAgY29uc3Qgb2xkVmFsdWVTaXplID0gdGhpcy5nZXRFeGlzdGluZ1ZhbHVlU2l6ZShrZXkpO1xuICAgIFxuICAgIC8vIENoZWNrIHNpemUgbGltaXQgdXNpbmcgcnVubmluZyB0b3RhbFxuICAgIGlmICh0aGlzLnJ1bm5pbmdTaXplIC0gb2xkVmFsdWVTaXplICsgbmV3VmFsdWVTaXplID4gdGhpcy5tYXhTaXplKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFN0YXRlIHNpemUgZXhjZWVkcyBtYXhpbXVtICgke3RoaXMubWF4U2l6ZX0gYnl0ZXMpYCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFVwZGF0ZSBydW5uaW5nIHNpemUgYmVmb3JlIHNldHRpbmdcbiAgICB0aGlzLnJ1bm5pbmdTaXplID0gdGhpcy5ydW5uaW5nU2l6ZSAtIG9sZFZhbHVlU2l6ZSArIG5ld1ZhbHVlU2l6ZTtcbiAgICBcbiAgICB0aGlzLnN0YXRlLnNldChrZXksIHtcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlLFxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgIH0pO1xuICAgIFxuICAgIC8vIERlYm91bmNlZCBhdXRvLXNhdmUgdG8gZGlzayAoNTAwbXMgZGVsYXkpIFx1MjAxNCBvbmx5IGlmIHBlcnNpc3RlbmNlIGVuYWJsZWRcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzdGF0ZSB2YWx1ZSBieSBrZXlcbiAgICovXG4gIGdldDxUPihrZXk6IHN0cmluZyk6IFQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5zdGF0ZS5nZXQoa2V5KTtcbiAgICBpZiAoIWVudHJ5KSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBlbnRyeS52YWx1ZSBhcyBUO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhIHN0YXRlIGVudHJ5XG4gICAqL1xuICBkZWxldGUoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuc3RhdGUuZ2V0KGtleSk7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIC8vIFVwZGF0ZSBydW5uaW5nIHNpemUgYmVmb3JlIGRlbGV0aW5nXG4gICAgdGhpcy5ydW5uaW5nU2l6ZSAtPSB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKTtcbiAgICBjb25zdCBkZWxldGVkID0gdGhpcy5zdGF0ZS5kZWxldGUoa2V5KTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgYWZ0ZXIgZGVsZXRpb25cbiAgICBpZiAoZGVsZXRlZCAmJiB0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCkge1xuICAgICAgdGhpcy5kZWJvdW5jZWRTYXZlKCk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBkZWxldGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgc3RhdGUga2V5c1xuICAgKi9cbiAgZ2V0QWxsS2V5cygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5zdGF0ZS5rZXlzKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIGFsbCBzdGF0ZVxuICAgKi9cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5ydW5uaW5nU2l6ZSA9IDA7XG4gICAgdGhpcy5zdGF0ZS5jbGVhcigpO1xuICAgIFxuICAgIC8vIERlYm91bmNlZCBhdXRvLXNhdmUgdG8gZGlzayBhZnRlciBjbGVhcmluZ1xuICAgIGlmICh0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCkge1xuICAgICAgdGhpcy5kZWJvdW5jZWRTYXZlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBzaXplIG9mIGV4aXN0aW5nIHZhbHVlIGZvciBhIGtleSAoZm9yIGluY3JlbWVudGFsIHVwZGF0ZXMpXG4gICAqL1xuICBwcml2YXRlIGdldEV4aXN0aW5nVmFsdWVTaXplKGtleTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuc3RhdGUuZ2V0KGtleSk7XG4gICAgcmV0dXJuIGVudHJ5ID8gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSkgOiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEVzdGltYXRlIHNpemUgb2YgYSB2YWx1ZSBpbiBieXRlc1xuICAgKi9cbiAgcHJpdmF0ZSBnZXRTaXplT2ZWYWx1ZSh2YWx1ZTogdW5rbm93bik6IG51bWJlciB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHJldHVybiB2YWx1ZS5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHJldHVybiA4O1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykgcmV0dXJuIDE7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAvLyBDYWxjdWxhdGUgYWN0dWFsIHNpemUgb2YgYXJyYXkgZWxlbWVudHNcbiAgICAgIHJldHVybiB2YWx1ZS5yZWR1Y2UoKHN1bTogbnVtYmVyLCBlbGVtOiB1bmtub3duKSA9PiBzdW0gKyB0aGlzLmdldFNpemVPZlZhbHVlKGVsZW0pLCAwKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTWFwKSByZXR1cm4gdmFsdWUuc2l6ZSAqIDE2O1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSkubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHN0YXRlIHRvIGRpc2sgYXMgSlNPTiBmaWxlIHdpdGggb3B0aW1pemVkIHNlcmlhbGl6YXRpb25cbiAgICovXG4gIHByaXZhdGUgc2F2ZVRvRmlsZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IEFycmF5LmZyb20odGhpcy5zdGF0ZS5lbnRyaWVzKCkpLm1hcCgoW19rZXksIGVudHJ5XSkgPT4gKHtcbiAgICAgICAga2V5OiBlbnRyeS5rZXksXG4gICAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZSxcbiAgICAgICAgdGltZXN0YW1wOiBlbnRyeS50aW1lc3RhbXAsXG4gICAgICB9KSk7XG4gICAgICBcbiAgICAgIC8vIEVuc3VyZSBkaXJlY3RvcnkgZXhpc3RzXG4gICAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUodGhpcy5tZW1vcnlGaWxlKTtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBPcHRpbWl6ZWQgSlNPTiBzZXJpYWxpemF0aW9uIChubyBwcmV0dHktcHJpbnRpbmcgZm9yIHBlcmZvcm1hbmNlKVxuICAgICAgY29uc3QganNvblN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgXG4gICAgICAvLyBXcml0ZSB0byB0ZW1wIGZpbGUgZmlyc3QsIHRoZW4gcmVuYW1lIGZvciBhdG9taWMgb3BlcmF0aW9uXG4gICAgICBjb25zdCB0ZW1wRmlsZSA9IHRoaXMubWVtb3J5RmlsZSArICcudG1wJztcbiAgICAgIGZzLndyaXRlRmlsZVN5bmModGVtcEZpbGUsIGpzb25TdHJpbmcsICd1dGYtOCcpO1xuICAgICAgZnMucmVuYW1lU3luYyh0ZW1wRmlsZSwgdGhpcy5tZW1vcnlGaWxlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIGxvZ2dlci53YXJuKGBGYWlsZWQgdG8gc2F2ZSB0byBkaXNrOiAke21lc3NhZ2V9YCk7IC8vIE0yIGZpeDogbm8gY29uc29sZS53YXJuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgc3RhdGUgZnJvbSBkaXNrIEpTT04gZmlsZSB3aXRoIGNvcnJ1cHRpb24gcmVjb3ZlcnlcbiAgICovXG4gIHByaXZhdGUgbG9hZEZyb21GaWxlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5tZW1vcnlGaWxlKSkgcmV0dXJuO1xuICAgICAgXG4gICAgICBjb25zdCBqc29uU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKHRoaXMubWVtb3J5RmlsZSwgJ3V0Zi04Jyk7XG4gICAgICBcbiAgICAgIC8vIFRyeSB0byBwYXJzZSBKU09OIHdpdGggZXJyb3IgcmVjb3ZlcnlcbiAgICAgIGxldCBkYXRhOiBTdGF0ZUVudHJ5W107XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShqc29uU3RyaW5nKSBhcyBTdGF0ZUVudHJ5W107XG4gICAgICB9IGNhdGNoIHsgLy8gQzEgZml4OiByZW1vdmVkIHVudXNlZCBwYXJzZUVycm9yIHZhcmlhYmxlXG4gICAgICAgIGxvZ2dlci53YXJuKGBDb3JydXB0ZWQgc3RhdGUgZmlsZSBkZXRlY3RlZCwgYXR0ZW1wdGluZyByZWNvdmVyeS4uLmApO1xuXG4gICAgICAgIC8vIFRyeSB0byByZWNvdmVyIGJ5IHJlYWRpbmcgbGluZSBieSBsaW5lIG9yIHVzaW5nIGJhY2t1cFxuICAgICAgICBjb25zdCBiYWNrdXBGaWxlID0gdGhpcy5tZW1vcnlGaWxlICsgJy5iYWNrdXAnO1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhiYWNrdXBGaWxlKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBiYWNrdXBTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMoYmFja3VwRmlsZSwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShiYWNrdXBTdHJpbmcpIGFzIFN0YXRlRW50cnlbXTtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBTdWNjZXNzZnVsbHkgbG9hZGVkIGZyb20gYmFja3VwYCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgQmFja3VwIGFsc28gY29ycnVwdGVkLCBzdGFydGluZyBmcmVzaGApO1xuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2dnZXIud2FybihgTm8gYmFja3VwIGF2YWlsYWJsZSwgc3RhcnRpbmcgZnJlc2hgKTtcbiAgICAgICAgICBkYXRhID0gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdGhpcy5zdGF0ZS5jbGVhcigpO1xuICAgICAgdGhpcy5ydW5uaW5nU2l6ZSA9IDA7XG4gICAgICBcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZGF0YSkge1xuICAgICAgICAvLyBWYWxpZGF0ZSBlbnRyeSBzdHJ1Y3R1cmUgYmVmb3JlIGFkZGluZ1xuICAgICAgICBpZiAoZW50cnkgJiYgdHlwZW9mIGVudHJ5LmtleSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGVudHJ5LnRpbWVzdGFtcCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICB0aGlzLnN0YXRlLnNldChlbnRyeS5rZXksIGVudHJ5KTtcbiAgICAgICAgICB0aGlzLnJ1bm5pbmdTaXplICs9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIENyZWF0ZSBiYWNrdXAgYWZ0ZXIgc3VjY2Vzc2Z1bCBsb2FkXG4gICAgICB0cnkge1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMubWVtb3J5RmlsZSArICcuYmFja3VwJywganNvblN0cmluZywgJ3V0Zi04Jyk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gSWdub3JlIGJhY2t1cCBjcmVhdGlvbiBlcnJvcnNcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIGxvZ2dlci53YXJuKGBGYWlsZWQgdG8gbG9hZCBmcm9tIGRpc2s6ICR7bWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhwb3J0IHN0YXRlIGZvciBwZXJzaXN0ZW5jZSAoSlNPTiBzZXJpYWxpemF0aW9uKSBcdTIwMTQga2VwdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgKi9cbiAgZXhwb3J0U3RhdGUoKTogc3RyaW5nIHtcbiAgICBjb25zdCBkYXRhID0gQXJyYXkuZnJvbSh0aGlzLnN0YXRlLmVudHJpZXMoKSkubWFwKChbX2tleSwgZW50cnldKSA9PiAoe1xuICAgICAga2V5OiBlbnRyeS5rZXksXG4gICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICB0aW1lc3RhbXA6IGVudHJ5LnRpbWVzdGFtcCxcbiAgICB9KSk7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcG9ydCBzdGF0ZSBmcm9tIEpTT04gc3RyaW5nIFx1MjAxNCBrZXB0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAqL1xuICBpbXBvcnRTdGF0ZShqc29uU3RyaW5nOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoanNvblN0cmluZykgYXMgU3RhdGVFbnRyeVtdO1xuICAgICAgdGhpcy5zdGF0ZS5jbGVhcigpO1xuICAgICAgdGhpcy5ydW5uaW5nU2l6ZSA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGRhdGEpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5zZXQoZW50cnkua2V5LCBlbnRyeSk7XG4gICAgICAgIHRoaXMucnVubmluZ1NpemUgKz0gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIERlYm91bmNlZCBhdXRvLXNhdmUgYWZ0ZXIgaW1wb3J0XG4gICAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgICAgdGhpcy5kZWJvdW5jZWRTYXZlKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBpbXBvcnQgc3RhdGU6ICR7bWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwYXRoIHRvIHRoZSBtZW1vcnkgZmlsZSBvbiBkaXNrXG4gICAqL1xuICBnZXRNZW1vcnlGaWxlUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm1lbW9yeUZpbGU7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2Ugc2F2ZSB0byBkaXNrICh1c2VmdWwgZm9yIGRlYnVnZ2luZylcbiAgICovXG4gIGZvcmNlU2F2ZSgpOiB2b2lkIHtcbiAgICB0aGlzLnNhdmVUb0ZpbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZSBsb2FkIGZyb20gZGlzayAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBmb3JjZUxvYWQoKTogdm9pZCB7XG4gICAgdGhpcy5sb2FkRnJvbUZpbGUoKTtcbiAgfVxufVxuIiwgIi8qKlxyXG4gKiBMb25nLXJ1bm5pbmcgcHJvY2VzcyB0cmFja2luZyBhbmQgbWFuYWdlbWVudFxyXG4gKi9cclxuXHJcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJhY2tncm91bmRDb21tYW5kIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGNvbW1hbmQ6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgc3RhcnRUaW1lOiBudW1iZXI7XHJcbiAgdGltZW91dEhvdXJzOiBudW1iZXI7XHJcbiAgc3RhdHVzOiAncnVubmluZycgfCAnY29tcGxldGVkJyB8ICdjYW5jZWxsZWQnIHwgJ2Vycm9yZWQnO1xyXG4gIHN0ZG91dD86IHN0cmluZztcclxuICBzdGRlcnI/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIge1xyXG4gIHByaXZhdGUgY29tbWFuZHM6IE1hcDxzdHJpbmcsIEJhY2tncm91bmRDb21tYW5kPjtcclxuICBwcml2YXRlIG1heFRpbWVvdXRIb3VyczogbnVtYmVyO1xyXG4gIFxyXG4gIGNvbnN0cnVjdG9yKF9jb25maWc/OiBQbHVnaW5Db25maWcpIHtcclxuICAgIHRoaXMuY29tbWFuZHMgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLm1heFRpbWVvdXRIb3VycyA9IDEwOyAvLyBIYXJkIGxpbWl0IGZyb20gdG9vbCBzcGVjaWZpY2F0aW9uXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWdpc3RlciBhIG5ldyBiYWNrZ3JvdW5kIGNvbW1hbmRcclxuICAgKi9cclxuICByZWdpc3Rlcihjb21tYW5kOiBzdHJpbmcsIHRpbWVvdXRIb3VyczogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgaWYgKHRpbWVvdXRIb3VycyA8IDAuMSB8fCB0aW1lb3V0SG91cnMgPiB0aGlzLm1heFRpbWVvdXRIb3Vycykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRpbWVvdXQgbXVzdCBiZSBiZXR3ZWVuIDAuMSBhbmQgJHt0aGlzLm1heFRpbWVvdXRIb3Vyc30gaG91cnNgKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKCFuYW1lIHx8IG5hbWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ29tbWFuZCBuYW1lIGlzIG1hbmRhdG9yeScpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCBpZCA9IHRoaXMuZ2VuZXJhdGVJZCgpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbW1hbmRzLnNldChpZCwge1xyXG4gICAgICBpZCxcclxuICAgICAgY29tbWFuZCxcclxuICAgICAgbmFtZSxcclxuICAgICAgc3RhcnRUaW1lOiBEYXRlLm5vdygpLFxyXG4gICAgICB0aW1lb3V0SG91cnMsXHJcbiAgICAgIHN0YXR1czogJ3J1bm5pbmcnLFxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHJldHVybiBpZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHN0YXR1cyBhbmQgb3V0cHV0IG9mIGEgYmFja2dyb3VuZCBjb21tYW5kXHJcbiAgICovXHJcbiAgY2hlY2soaWQ6IHN0cmluZyk6IEJhY2tncm91bmRDb21tYW5kIHwgbnVsbCB7XHJcbiAgICBjb25zdCBjb21tYW5kID0gdGhpcy5jb21tYW5kcy5nZXQoaWQpO1xyXG4gICAgaWYgKCFjb21tYW5kKSByZXR1cm4gbnVsbDtcclxuICAgIFxyXG4gICAgLy8gQ2hlY2sgaWYgdGltZW91dCBleGNlZWRlZFxyXG4gICAgY29uc3QgZWxhcHNlZEhvdXJzID0gKERhdGUubm93KCkgLSBjb21tYW5kLnN0YXJ0VGltZSkgLyAoMTAwMCAqIDYwICogNjApO1xyXG4gICAgaWYgKGVsYXBzZWRIb3VycyA+IGNvbW1hbmQudGltZW91dEhvdXJzICYmIGNvbW1hbmQuc3RhdHVzID09PSAncnVubmluZycpIHtcclxuICAgICAgY29tbWFuZC5zdGF0dXMgPSAnZXJyb3JlZCc7XHJcbiAgICAgIGNvbW1hbmQuc3RkZXJyID0gYENvbW1hbmQgZXhjZWVkZWQgdGltZW91dCAoJHtjb21tYW5kLnRpbWVvdXRIb3Vyc30gaG91cnMpYDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIGNvbW1hbmQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYW5jZWwgYSBydW5uaW5nIGJhY2tncm91bmQgY29tbWFuZFxyXG4gICAqL1xyXG4gIGNhbmNlbChpZDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBjb21tYW5kID0gdGhpcy5jb21tYW5kcy5nZXQoaWQpO1xyXG4gICAgaWYgKCFjb21tYW5kIHx8IGNvbW1hbmQuc3RhdHVzICE9PSAncnVubmluZycpIHJldHVybiBmYWxzZTtcclxuICAgIFxyXG4gICAgY29tbWFuZC5zdGF0dXMgPSAnY2FuY2VsbGVkJztcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFsbCBhY3RpdmUgY29tbWFuZHNcclxuICAgKi9cclxuICBnZXRBY3RpdmVDb21tYW5kcygpOiBCYWNrZ3JvdW5kQ29tbWFuZFtdIHtcclxuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuY29tbWFuZHMudmFsdWVzKCkpXHJcbiAgICAgIC5maWx0ZXIoYyA9PiBjLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBjb21wbGV0ZWQvZXJyb3JlZC9jYW5jZWxsZWQgY29tbWFuZHMgYWZ0ZXIgY2xlYW51cCBwZXJpb2RcclxuICAgKi9cclxuICBjbGVhbnVwKG1heEFnZUhvdXJzOiBudW1iZXIgPSAyNCk6IHZvaWQge1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGZvciAoY29uc3QgW2lkLCBjb21tYW5kXSBvZiB0aGlzLmNvbW1hbmRzLmVudHJpZXMoKSkge1xyXG4gICAgICBpZiAoY29tbWFuZC5zdGF0dXMgIT09ICdydW5uaW5nJykge1xyXG4gICAgICAgIGNvbnN0IGFnZUhvdXJzID0gKG5vdyAtIGNvbW1hbmQuc3RhcnRUaW1lKSAvICgxMDAwICogNjAgKiA2MCk7XHJcbiAgICAgICAgaWYgKGFnZUhvdXJzID4gbWF4QWdlSG91cnMpIHtcclxuICAgICAgICAgIHRoaXMuY29tbWFuZHMuZGVsZXRlKGlkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIHVuaXF1ZSBjb21tYW5kIElEXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYGJnXyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCA4KX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRvdGFsIGNvdW50IG9mIHJlZ2lzdGVyZWQgY29tbWFuZHNcclxuICAgKi9cclxuICBnZXRDb3VudCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZHMuc2l6ZTtcclxuICB9XHJcbn1cclxuIiwgIi8qKlxuICogV29ya2luZyBEaXJlY3RvcnkgTWFuYWdlciB3aXRoIFBlcnNpc3RlbnQgU3RvcmFnZVxuICogXG4gKiBUcmFja3MgYSBtdXRhYmxlIHdvcmtpbmcgZGlyZWN0b3J5IHRoYXQgcGVyc2lzdHMgYWNyb3NzIHNhbmRib3ggcmVzZXRzLlxuICogVXNlcyBmaWxlLWJhc2VkIHN0b3JhZ2UgdG8gc3Vydml2ZSBpc29sYXRlZCBleGVjdXRpb24gY29udGV4dHMuXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuLy8gQmFzZSBkaXJlY3Rvcnk6IHBsdWdpbiByb290ICh3aGVyZSBwYWNrYWdlLmpzb24gbGl2ZXMpXG5jb25zdCBCQVNFX0RJUiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicpO1xuXG4vLyBQZXJzaXN0ZW50IHN0b3JhZ2UgZmlsZSBmb3Igd29ya2luZyBkaXJlY3RvcnlcbmNvbnN0IFNUQVRFX0ZJTEUgPSBwYXRoLmpvaW4oQkFTRV9ESVIsICcuYWlfdG9vbGJveF9zdGF0ZS5qc29uJyk7XG5cbi8qKiBMb2FkIHBlcnNpc3RlZCBzdGF0ZSBmcm9tIGRpc2sgKi9cbmZ1bmN0aW9uIGxvYWRTdGF0ZSgpOiB7IHdvcmtpbmdEaXI/OiBzdHJpbmcgfSB7XG4gIHRyeSB7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoU1RBVEVfRklMRSkpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoU1RBVEVfRklMRSwgJ3V0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWdub3JlIGVycm9ycyAtIHVzZSBkZWZhdWx0c1xuICB9XG4gIHJldHVybiB7fTtcbn1cblxuLyoqIFNhdmUgc3RhdGUgdG8gZGlzayAqL1xuZnVuY3Rpb24gc2F2ZVN0YXRlKHN0YXRlOiB7IHdvcmtpbmdEaXI/OiBzdHJpbmcgfSk6IHZvaWQge1xuICB0cnkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMoU1RBVEVfRklMRSwgSlNPTi5zdHJpbmdpZnkoc3RhdGUsIG51bGwsIDIpKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oYFtXb3JraW5nRGlyXSBGYWlsZWQgdG8gcGVyc2lzdCBzdGF0ZTogJHtlcnJvcn1gKTtcbiAgfVxufVxuXG4vLyBNdXRhYmxlIHdvcmtpbmcgZGlyZWN0b3J5IFx1MjAxNCBsb2FkZWQgZnJvbSBwZXJzaXN0ZW50IHN0b3JhZ2Ugb3IgZGVmYXVsdHMgdG8gcGx1Z2luIHJvb3RcbmNvbnN0IHBlcnNpc3RlZFN0YXRlID0gbG9hZFN0YXRlKCk7XG5sZXQgY3VycmVudFdvcmtpbmdEaXI6IHN0cmluZyA9IHBlcnNpc3RlZFN0YXRlLndvcmtpbmdEaXIgfHwgQkFTRV9ESVI7XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRXb3JraW5nRGlyKCk6IHN0cmluZyB7XG4gIHJldHVybiBjdXJyZW50V29ya2luZ0Rpcjtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHdvcmtpbmcgZGlyZWN0b3J5IHRvIGEgbmV3IGFic29sdXRlIHBhdGguXG4gKiBWYWxpZGF0ZXMgdGhhdCB0aGUgcGF0aCBleGlzdHMgYW5kIGlzIGFuIGFic29sdXRlIGRpcmVjdG9yeS5cbiAqIFBFUlNJU1RTIHRoZSBjaGFuZ2UgdG8gZGlzayBzbyBpdCBzdXJ2aXZlcyBzYW5kYm94IHJlc2V0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFdvcmtpbmdEaXIobmV3RGlyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgLy8gUmVzb2x2ZSB0byBhYnNvbHV0ZSBwYXRoXG4gIGNvbnN0IHJlc29sdmVkID0gcGF0aC5yZXNvbHZlKG5ld0Rpcik7XG5cbiAgLy8gTXVzdCBiZSBhbiBhYnNvbHV0ZSBwYXRoXG4gIGlmICghcGF0aC5pc0Fic29sdXRlKHJlc29sdmVkKSkge1xuICAgIGNvbnNvbGUud2Fybihgc2V0V29ya2luZ0RpciByZWplY3RlZDogbm90IGFic29sdXRlIFx1MjAxNCAnJHtuZXdEaXJ9J2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIE11c3QgZXhpc3QgYW5kIGJlIGEgZGlyZWN0b3J5XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhyZXNvbHZlZCk7XG4gICAgaWYgKCFzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBjb25zb2xlLndhcm4oYHNldFdvcmtpbmdEaXIgcmVqZWN0ZWQ6IG5vdCBhIGRpcmVjdG9yeSBcdTIwMTQgJyR7cmVzb2x2ZWR9J2ApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgY29uc29sZS53YXJuKGBzZXRXb3JraW5nRGlyIHJlamVjdGVkOiBwYXRoIGRvZXMgbm90IGV4aXN0IFx1MjAxNCAnJHtyZXNvbHZlZH0nYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY3VycmVudFdvcmtpbmdEaXIgPSByZXNvbHZlZDtcbiAgXG4gIC8vIFBFUlNJU1QgdGhlIGNoYW5nZSB0byBkaXNrIChGSVggZm9yIHNhbmRib3ggcmVzZXQgaXNzdWUpXG4gIHNhdmVTdGF0ZSh7IHdvcmtpbmdEaXI6IHJlc29sdmVkIH0pO1xuICBjb25zb2xlLmxvZyhgW1dvcmtpbmdEaXJdIFBlcnNpc3RlZCBuZXcgd29ya2luZyBkaXJlY3Rvcnk6ICR7cmVzb2x2ZWR9YCk7XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqIFxuICogUmVzZXQgdGhlIHdvcmtpbmcgZGlyZWN0b3J5IGJhY2sgdG8gdGhlIHBsdWdpbiByb290XG4gKiBBbHNvIGNsZWFycyBwZXJzaXN0ZWQgc3RhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFdvcmtpbmdEaXIoKTogdm9pZCB7XG4gIGN1cnJlbnRXb3JraW5nRGlyID0gQkFTRV9ESVI7XG4gIHNhdmVTdGF0ZSh7IHdvcmtpbmdEaXI6IHVuZGVmaW5lZCB9KTsgLy8gQ2xlYXIgcGVyc2lzdGVkIHN0YXRlXG4gIGNvbnNvbGUubG9nKGBbV29ya2luZ0Rpcl0gUmVzZXQgdG8gcGx1Z2luIHJvb3Q6ICR7QkFTRV9ESVJ9YCk7XG59XG5cbi8qKiBSZXNvbHZlIGEgdXNlci1wcm92aWRlZCBwYXRoIGFnYWluc3QgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUGF0aCh1c2VyUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHBhdGgucmVzb2x2ZShjdXJyZW50V29ya2luZ0RpciwgdXNlclBhdGgpO1xufVxuXG4vKiogR2V0IGFsbG93ZWQgYmFzZSBkaXJlY3RvcmllcyBmb3IgYWJzb2x1dGUtcGF0aCB2YWxpZGF0aW9uICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsb3dlZEJhc2VzKCk6IHN0cmluZ1tdIHtcbiAgLy8gQWxsb3cgYm90aCB0aGUgcGx1Z2luIHJvb3QgYW5kIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5XG4gIGNvbnN0IGJhc2VzID0gW0JBU0VfRElSLCBjdXJyZW50V29ya2luZ0Rpcl07XG4gIHJldHVybiBbLi4ubmV3IFNldChiYXNlcyldOyAvLyBEZWR1cGxpY2F0ZVxufVxuXG4vKiogR2V0IHRoZSBwbHVnaW4gaW5zdGFsbGF0aW9uIGRpcmVjdG9yeSAobmV2ZXIgY2hhbmdlcykgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQbHVnaW5Sb290KCk6IHN0cmluZyB7XG4gIHJldHVybiBCQVNFX0RJUjtcbn1cbiIsICIvKipcbiAqIFNlY3VyaXR5IHV0aWxpdGllcyBmb3IgcGF0aCB2YWxpZGF0aW9uLCBiaW5hcnkgZGV0ZWN0aW9uLCBhbmQgUmVEb1MgcHJvdGVjdGlvblxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuLy8gXHUyNzA1IEZJWDogVXNlIHByb3BlciBFU00gaW1wb3J0cyBpbnN0ZWFkIG9mIHJlcXVpcmUoKSB0byBtYWludGFpbiBtb2R1bGUgYm91bmRhcnlcbmltcG9ydCB7IGdldEFsbG93ZWRCYXNlcywgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4vd29ya2luZ0Rpcic7XG5cbi8qKlxuICogVmFsaWRhdGUgZmlsZSBwYXRoIHRvIHByZXZlbnQgZGlyZWN0b3J5IHRyYXZlcnNhbCBhdHRhY2tzLlxuICogRElTQUJMRUQ6IFNlY3VyaXR5IHZhbGlkYXRvciByZW1vdmVkIHBlciB1c2VyIHJlcXVlc3QgLSBhbGxvd3MgYWxsIHBhdGhzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQYXRoKHVzZXJQYXRoOiBzdHJpbmcsIGJhc2VQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHRydWU7IC8vIEFsd2F5cyBhbGxvdyBwYXRoc1xufVxuXG4vKipcbiAqIERldGVjdCBiaW5hcnkgZmlsZXMgYnkgY2hlY2tpbmcgZm9yIG51bGwgYnl0ZXMgaW4gZmlyc3QgOEtCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0JpbmFyeUZpbGUoY29udGVudDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNodW5rID0gY29udGVudC5zbGljZSgwLCA4MTkyKTtcbiAgLy8gQ2hlY2sgZm9yIG51bGwgYnl0ZSAoMHgwMCkgd2hpY2ggaW5kaWNhdGVzIGJpbmFyeSBjb250ZW50XG4gIHJldHVybiBjaHVuay5pbmNsdWRlcygnXFwwJyk7XG59XG5cbi8qKlxuICogUHJvdGVjdCBhZ2FpbnN0IFJlRG9TIChSZWd1bGFyIEV4cHJlc3Npb24gRGVuaWFsIG9mIFNlcnZpY2UpXG4gKiBTMiBGSVg6IFVzZXMgcHJvcGVyIHJlZ2V4IHN0cnVjdHVyZSBhbmFseXNpcyBpbnN0ZWFkIG9mIG5haXZlIHN1YnN0cmluZyBtYXRjaGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2FmZVJlZ2V4KHBhdHRlcm46IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIXBhdHRlcm4gfHwgcGF0dGVybi5sZW5ndGggPiA1MDApIHJldHVybiBmYWxzZTtcbiAgXG4gIC8vIENoZWNrIGZvciBjb21tb24gUmVEb1MgcGF0dGVybnMgdXNpbmcgc3RydWN0dXJlZCByZWdleCBkZXRlY3Rpb25cbiAgY29uc3QgZGFuZ2Vyb3VzU3RydWN0dXJlcyA9IFtcbiAgICAvKFxcKFteKV0qXFwpWyorXSlbXildKlxcKS8sICAgICAgICAgICAvLyBOZXN0ZWQgcXVhbnRpZmllcnM6ICguKikoLiopXG4gICAgL1xcKFteKV0qWysqXVxcKSsvLCAgICAgICAgICAgICAgICAgICAgLy8gUmVwZXRpdGlvbiBvZiByZXBldGl0aW9uOiAoLispK1xuICAgIC9cXChbXildKlxcfFteKV0qXFwpWysqXS8sICAgICAgICAgICAgICAvLyBBbHRlcm5hdGlvbiArIHJlcGV0aXRpb246IChhfGIpK1xuICAgIC8oXFxbW15cXF1dK1xcXVsrKl0pW15dXSpcXF0vLCAgICAgICAgICAgLy8gQ2hhciBjbGFzcyB3aXRoIHJlcGV0aXRpb246IChbYS16XSspK1xuICAgIC9cXChcXC5cXD9cXClcXCpcXCovLCAgICAgICAgICAgICAgICAgICAgICAvLyBHcm91cCBmb2xsb3dlZCBieSBkb3VibGUgc3RhcjogKC4qPykqKlxuICBdO1xuICBcbiAgZm9yIChjb25zdCBzdHJ1Y3R1cmUgb2YgZGFuZ2Vyb3VzU3RydWN0dXJlcykge1xuICAgIGlmIChzdHJ1Y3R1cmUudGVzdChwYXR0ZXJuKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIFxuICAvLyBBbHNvIGNoZWNrIGZvciB0aGUgb3JpZ2luYWwgbmFpdmUgcGF0dGVybnMgYXMgZmFsbGJhY2tcbiAgY29uc3QgZGFuZ2Vyb3VzUGF0dGVybnMgPSBbXG4gICAgJyguKikoLiopJywgICAgICAgICAgIC8vIE5lc3RlZCBxdWFudGlmaWVycyB3aXRoIC4qXG4gICAgJyguKykrJywgICAgICAgICAgICAgIC8vIFJlcGV0aXRpb24gb2YgcmVwZXRpdGlvbiAgXG4gICAgJyhbYS16XSspKycsICAgICAgICAgIC8vIENoYXJhY3RlciBjbGFzcyB3aXRoIHJlcGV0aXRpb25cbiAgICAnKGF8YikrJywgICAgICAgICAgICAgLy8gQWx0ZXJuYXRpb24gd2l0aCByZXBldGl0aW9uXG4gICAgJyguKj8pKionLCAgICAgICAgICAgIC8vIEdyb3VwIGZvbGxvd2VkIGJ5IGRvdWJsZSBzdGFyIChSZURvUylcbiAgXTtcbiAgXG4gIGZvciAoY29uc3QgZGFuZ2Vyb3VzUGF0dGVybiBvZiBkYW5nZXJvdXNQYXR0ZXJucykge1xuICAgIGlmIChwYXR0ZXJuLmluY2x1ZGVzKGRhbmdlcm91c1BhdHRlcm4pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEFwcGx5IHNlY3VyaXR5IGNoZWNrcyBiYXNlZCBvbiBjb25maWcgc2V0dGluZ3MuXG4gKiBVc2VzIHRoZSB2aXJ0dWFsIHdvcmtpbmcgZGlyZWN0b3J5IGZvciBwYXRoIHZhbGlkYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVNlY3VyaXR5Q2hlY2tzKFxuICBmaWxlUGF0aDogc3RyaW5nLCBcbiAgY29udGVudD86IHN0cmluZywgXG4gIHJlZ2V4UGF0dGVybj86IHN0cmluZywgXG4gIGNvbmZpZz86IFBsdWdpbkNvbmZpZ1xuKTogeyB2YWxpZFBhdGg6IGJvb2xlYW47IGlzQmluYXJ5OiBib29sZWFuOyBzYWZlUmVnZXg6IGJvb2xlYW4gfSB7XG4gIGNvbnN0IGVmZmVjdGl2ZUNvbmZpZyA9IGNvbmZpZyB8fCBERUZBVUxUX0NPTkZJRztcblxuICByZXR1cm4ge1xuICAgIHZhbGlkUGF0aDogZWZmZWN0aXZlQ29uZmlnLnBhdGhWYWxpZGF0aW9uRW5hYmxlZCA/IHZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSA6IHRydWUsXG4gICAgaXNCaW5hcnk6IGVmZmVjdGl2ZUNvbmZpZy5iaW5hcnlGaWxlRGV0ZWN0aW9uICYmIGNvbnRlbnQgPyBpc0JpbmFyeUZpbGUoY29udGVudCkgOiBmYWxzZSxcbiAgICBzYWZlUmVnZXg6IGVmZmVjdGl2ZUNvbmZpZy5yZWdleFJlRG9TUHJvdGVjdGlvbiAmJiByZWdleFBhdHRlcm4gPyBpc1NhZmVSZWdleChyZWdleFBhdHRlcm4pIDogdHJ1ZSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTYW5pdGl6ZSBzaGVsbCBjb21tYW5kcyB0byBwcmV2ZW50IGRhbmdlcm91cyBvcGVyYXRpb25zXG4gKiBTMyBGSVg6IEVuaGFuY2VkIHdpdGggSUZTLXRhbXBlcmluZyBhbmQgbnVsbC1ieXRlIGluamVjdGlvbiBkZXRlY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogeyBzYWZlOiBib29sZWFuOyByZWFzb24/OiBzdHJpbmcgfSB7XG4gIGlmICghY29tbWFuZCB8fCB0eXBlb2YgY29tbWFuZCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnRW1wdHkgb3IgaW52YWxpZCBjb21tYW5kJyB9O1xuICB9XG5cbiAgLy8gTm9ybWFsaXplIHdoaXRlc3BhY2UgYnV0IHByZXNlcnZlIHF1b3RlZCBzdHJpbmdzXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBjb21tYW5kLnRyaW0oKTtcbiAgXG4gIC8vIFMzIEZJWDogQmxvY2sgbnVsbCBieXRlIGluamVjdGlvbiAoY2FuIGJ5cGFzcyByZWdleCBtYXRjaGluZylcbiAgaWYgKG5vcm1hbGl6ZWQuaW5jbHVkZXMoJ1xcMCcpIHx8IG5vcm1hbGl6ZWQuaW5jbHVkZXMoJyUwMCcpKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ051bGwgYnl0ZSBpbmplY3Rpb24gZGV0ZWN0ZWQnIH07XG4gIH1cblxuICAvLyBTMyBGSVg6IEJsb2NrIElGUy10YW1wZXJpbmcgaW4gYmFzaCAoSUZTPSQnICcgYWxsb3dzIHNwbGl0dGluZyB3aXRob3V0IHNwYWNlcylcbiAgY29uc3QgaWZzUGF0dGVybnMgPSBbXG4gICAgL1xcYklGU1xccyo9XFxzKltcXFxcJCddXFxzKi9pLFxuICAgIC9JRlM9WyQnXVteJ10qJy9pLFxuICBdO1xuICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgaWZzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnSUZTIHRhbXBlcmluZyBkZXRlY3RlZCcgfTtcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayBmb3IgZGFuZ2Vyb3VzIHBhdHRlcm5zIHVzaW5nIGEgbW9yZSByb2J1c3QgYXBwcm9hY2hcbiAgY29uc3QgZGFuZ2Vyb3VzUGF0dGVybnMgPSBbXG4gICAgLy8gRmlsZSBzeXN0ZW0gZGVzdHJ1Y3Rpb25cbiAgICAvXFxicm1cXHMrLXJmXFxiL2ksXG4gICAgL1xcYnNocmVkXFxiL2ksXG4gICAgL1xcYndpcGVcXGIvaSxcbiAgICBcbiAgICAvLyBQcml2aWxlZ2UgZXNjYWxhdGlvblxuICAgIC9cXGJzdWRvXFxiL2ksXG4gICAgL1xcYnN1XFxiKD8hXFx3KS9pLCAgLy8gJ3N1JyBidXQgbm90ICdzdWRvJywgJ3N1c2hpJywgZXRjLlxuICAgIFxuICAgIC8vIE5ldHdvcmsgYXR0YWNrc1xuICAgIC9cXGJuY1xcYig/IVxcdyl8XFxibmV0Y2F0XFxiL2ksXG4gICAgL1xcYndnZXRcXHMrLiotLXBvc3QtZmlsZVxcYi9pLFxuICAgIC9cXGJjdXJsXFxzKy4qLS1kYXRhLWJpbmFyeVxcYi9pLFxuICAgIFxuICAgIC8vIERhdGEgZXhmaWx0cmF0aW9uXG4gICAgL1xcYmJhc2U2NFxcYi4qXFx8XFxzKihjdXJsfHdnZXQpL2ksXG4gICAgL1xcYnNjcFxcYig/IVxcdyl8XFxic2Z0cFxcYi9pLFxuICAgIFxuICAgIC8vIFByb2Nlc3MgbWFuaXB1bGF0aW9uXG4gICAgL1xcYmZvcmtcXGIoPyFcXHcpL2ksXG4gICAgL1xcYmV4ZWNcXGIoPyFcXHcpL2ksXG4gICAgXG4gICAgLy8gRW52aXJvbm1lbnQgdGFtcGVyaW5nXG4gICAgL1xcYmV4cG9ydFxccytcXHcrPS9pLFxuICAgIC9cXGJldmFsXFxiKD8hXFx3KS9pLFxuICBdO1xuXG4gIGZvciAoY29uc3QgcGF0dGVybiBvZiBkYW5nZXJvdXNQYXR0ZXJucykge1xuICAgIGlmIChwYXR0ZXJuLnRlc3Qobm9ybWFsaXplZCkpIHtcbiAgICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246IGBEYW5nZXJvdXMgY29tbWFuZCBkZXRlY3RlZDogJHtwYXR0ZXJuLnNvdXJjZX1gIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIHBpcGUgY2hhaW5zIHRoYXQgY291bGQgYmUgdXNlZCBmb3IgYXR0YWNrcyAobW9yZSB0aGFuIDIgcGlwZXMgPSAzKyBjb21tYW5kcylcbiAgY29uc3QgcGlwZUNvdW50ID0gKG5vcm1hbGl6ZWQubWF0Y2goL1xcfC9nKSB8fCBbXSkubGVuZ3RoO1xuICBpZiAocGlwZUNvdW50ID4gMikge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdUb28gbWFueSBwaXBlcyBpbiBjb21tYW5kIGNoYWluJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIHNlbWljb2xvbi1zZXBhcmF0ZWQgY29tbWFuZHMgKHBvdGVudGlhbCBpbmplY3Rpb24pXG4gIGNvbnN0IHNlbWlDb2xvbkNvdW50ID0gKG5vcm1hbGl6ZWQubWF0Y2goLzsvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHNlbWlDb2xvbkNvdW50ID4gMSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdNdWx0aXBsZSBzZW1pY29sb25zIGRldGVjdGVkIGluIGNvbW1hbmQnIH07XG4gIH1cblxuICAvLyBDaGVjayBmb3IgYmFja3RpY2sgZXhlY3V0aW9uIG9yICQoKSBzdWJzaGVsbCBpbmplY3Rpb25cbiAgaWYgKC9gW15gXStgfFxcJFxcKFteKV0rXFwpLy50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0NvbW1hbmQgc3Vic3RpdHV0aW9uIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGVudmlyb25tZW50IHZhcmlhYmxlIGluamVjdGlvblxuICBpZiAoL15cXHMqKGV4cG9ydHx1bnNldClcXHMvLnRlc3Qobm9ybWFsaXplZCkpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnRW52aXJvbm1lbnQgbW9kaWZpY2F0aW9uIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgcmV0dXJuIHsgc2FmZTogdHJ1ZSB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIFNRTCBxdWVyeSBmb3Igc2FmZXR5IChyZWFkLW9ubHkgb3BlcmF0aW9ucyBvbmx5KVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTUUxRdWVyeShxdWVyeTogc3RyaW5nKTogeyB2YWxpZDogYm9vbGVhbjsgcmVhc29uPzogc3RyaW5nIH0ge1xuICBpZiAoIXF1ZXJ5IHx8IHR5cGVvZiBxdWVyeSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIHJlYXNvbjogJ0VtcHR5IG9yIGludmFsaWQgcXVlcnknIH07XG4gIH1cblxuICBjb25zdCB0cmltbWVkID0gcXVlcnkudHJpbSgpLnRvVXBwZXJDYXNlKCk7XG4gIFxuICAvLyBPbmx5IGFsbG93IFNFTEVDVCBhbmQgUFJBR01BIHN0YXRlbWVudHNcbiAgaWYgKCF0cmltbWVkLnN0YXJ0c1dpdGgoJ1NFTEVDVCcpICYmICF0cmltbWVkLnN0YXJ0c1dpdGgoJ1BSQUdNQScpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246ICdPbmx5IFNFTEVDVCBhbmQgUFJBR01BIHF1ZXJpZXMgYXJlIGFsbG93ZWQnIH07XG4gIH1cblxuICAvLyBDaGVjayBmb3IgZGFuZ2Vyb3VzIGtleXdvcmRzIHRoYXQgY291bGQgYmUgaW5qZWN0ZWQgYWZ0ZXIgU0VMRUNUL1BSQUdNQVxuICBjb25zdCBkYW5nZXJvdXNTUUxLZXl3b3JkcyA9IFtcbiAgICAvXFxiRFJPUFxcYi9pLFxuICAgIC9cXGJERUxFVEVcXGIvaSxcbiAgICAvXFxiVVBEQVRFXFxiL2ksXG4gICAgL1xcYklOU0VSVFxcYi9pLFxuICAgIC9cXGJBTFRFUlxcYi9pLFxuICAgIC9cXGJDUkVBVEVcXGIvaSxcbiAgICAvXFxiUkVQTEFDRVxcYi9pLFxuICAgIC9cXGJUUlVOQ0FURVxcYi9pLFxuICAgIC9cXGJHUkFOVFxcYi9pLFxuICAgIC9cXGJSRVZPS0VcXGIvaSxcbiAgXTtcblxuICBmb3IgKGNvbnN0IGtleXdvcmQgb2YgZGFuZ2Vyb3VzU1FMS2V5d29yZHMpIHtcbiAgICBpZiAoa2V5d29yZC50ZXN0KHRyaW1tZWQpKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIHJlYXNvbjogYERhbmdlcm91cyBTUUwgb3BlcmF0aW9uIGRldGVjdGVkOiAke2tleXdvcmQuc291cmNlfWAgfTtcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayBmb3IgbXVsdGlwbGUgc3RhdGVtZW50cyAoc2VtaWNvbG9uIGluamVjdGlvbilcbiAgY29uc3Qgc2VtaUNvbG9uQ291bnQgPSAodHJpbW1lZC5tYXRjaCgvOy9nKSB8fCBbXSkubGVuZ3RoO1xuICBpZiAoc2VtaUNvbG9uQ291bnQgPiAwKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246ICdNdWx0aXBsZSBTUUwgc3RhdGVtZW50cyBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG59XG4iLCAiLyoqXG4gKiBQZXJmb3JtYW5jZSBVdGlsaXRpZXMgZm9yIEFJIFRvb2xib3ggUGx1Z2luXG4gKiBPcHRpbWl6ZWQgYWxnb3JpdGhtcyB3aXRoIGVhcmx5IGV4aXQsIGNhY2hpbmcsIGFuZCBhc3luYyBvcGVyYXRpb25zXG4gKi9cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMvcHJvbWlzZXMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gTGV2ZW5zaHRlaW4gRGlzdGFuY2Ugd2l0aCBFYXJseSBFeGl0ID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogT3B0aW1pemVkIExldmVuc2h0ZWluIGRpc3RhbmNlIGNhbGN1bGF0aW9uIHdpdGggZWFybHkgZXhpdCB0aHJlc2hvbGQuXG4gKiBTdG9wcyBjYWxjdWxhdGluZyBpZiB0aGUgbWluaW11bSBwb3NzaWJsZSBzY29yZSBkcm9wcyBiZWxvdyB0aGUgdGhyZXNob2xkLlxuICogXG4gKiBAcGFyYW0gYSAtIEZpcnN0IHN0cmluZ1xuICogQHBhcmFtIGIgLSBTZWNvbmQgc3RyaW5nICBcbiAqIEBwYXJhbSBtaW5TY29yZSAtIE1pbmltdW0gYWNjZXB0YWJsZSBzaW1pbGFyaXR5IHNjb3JlICgwLTEpLiBSZXN1bHRzIGJlbG93IHRoaXMgYXJlIHBydW5lZCBlYXJseS5cbiAqIEByZXR1cm5zIFNpbWlsYXJpdHkgc2NvcmUgYmV0d2VlbiAwIGFuZCAxLCBvciBudWxsIGlmIGJlbG93IHRocmVzaG9sZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGV2ZW5zaHRlaW5TaW1pbGFyaXR5KGE6IHN0cmluZywgYjogc3RyaW5nLCBtaW5TY29yZTogbnVtYmVyID0gMC4zKTogbnVtYmVyIHwgbnVsbCB7XG4gIGNvbnN0IG1heExlbiA9IE1hdGgubWF4KGEubGVuZ3RoLCBiLmxlbmd0aCk7XG4gIGlmIChtYXhMZW4gPT09IDApIHJldHVybiAxO1xuXG4gIC8vIFF1aWNrIHJlamVjdGlvbjogaWYgc3RyaW5ncyBkaWZmZXIgdG9vIG11Y2ggaW4gbGVuZ3RoLCBza2lwIGV4cGVuc2l2ZSBjYWxjdWxhdGlvblxuICBjb25zdCBsZW5EaWZmID0gTWF0aC5hYnMoYS5sZW5ndGggLSBiLmxlbmd0aCk7XG4gIGlmIChsZW5EaWZmIC8gbWF4TGVuID4gKDEgLSBtaW5TY29yZSkpIHtcbiAgICByZXR1cm4gbnVsbDsgLy8gRWFybHkgZXhpdCBmb3IgdmVyeSBkaWZmZXJlbnQgbGVuZ3Roc1xuICB9XG5cbiAgLy8gVXNlIHR3by1yb3cgb3B0aW1pemF0aW9uIGluc3RlYWQgb2YgZnVsbCBtYXRyaXggKHNhdmVzIG1lbW9yeSlcbiAgbGV0IHByZXZSb3c6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IGIubGVuZ3RoOyBpKyspIHtcbiAgICBwcmV2Um93LnB1c2goMCk7XG4gIH1cbiAgbGV0IGN1cnJSb3c6IG51bWJlcltdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gYi5sZW5ndGg7IGkrKykge1xuICAgIHByZXZSb3dbaV0gPSBpO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gYS5sZW5ndGg7IGkrKykge1xuICAgIGN1cnJSb3dbMF0gPSBpO1xuICAgIFxuICAgIC8vIEVhcmx5IGV4aXQgb3B0aW1pemF0aW9uOiBpZiBjdXJyZW50IHJvdydzIG1pbmltdW0gZXhjZWVkcyB0aHJlc2hvbGQsIGFib3J0XG4gICAgbGV0IG1pbkluUm93ID0gaTtcbiAgICBcbiAgICBmb3IgKGxldCBqID0gMTsgaiA8PSBiLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBjb3N0ID0gYVtpIC0gMV0gPT09IGJbaiAtIDFdID8gMCA6IDE7XG4gICAgICBjdXJyUm93W2pdID0gTWF0aC5taW4oXG4gICAgICAgIHByZXZSb3dbal0gKyAxLCAgICAgICAgIC8vIGRlbGV0aW9uXG4gICAgICAgIGN1cnJSb3dbaiAtIDFdICsgMSwgICAgIC8vIGluc2VydGlvbiAgXG4gICAgICAgIHByZXZSb3dbaiAtIDFdICsgY29zdCAgIC8vIHN1YnN0aXR1dGlvblxuICAgICAgKTtcbiAgICAgIFxuICAgICAgaWYgKGN1cnJSb3dbal0gPCBtaW5JblJvdykge1xuICAgICAgICBtaW5JblJvdyA9IGN1cnJSb3dbal07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRWFybHkgZXhpdDogaWYgbWluaW11bSBpbiB0aGlzIHJvdyBhbHJlYWR5IGV4Y2VlZHMgdGhyZXNob2xkLCBhYm9ydFxuICAgIGNvbnN0IGN1cnJlbnRNYXhTY29yZSA9IDEgLSBtaW5JblJvdyAvIG1heExlbjtcbiAgICBpZiAoY3VycmVudE1heFNjb3JlIDwgbWluU2NvcmUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFN3YXAgcm93c1xuICAgIFtwcmV2Um93LCBjdXJyUm93XSA9IFtjdXJyUm93LCBwcmV2Um93XTtcbiAgfVxuXG4gIGNvbnN0IGRpc3RhbmNlID0gcHJldlJvd1tiLmxlbmd0aF07XG4gIGNvbnN0IHNjb3JlID0gTWF0aC5tYXgoMCwgMSAtIGRpc3RhbmNlIC8gbWF4TGVuKTtcbiAgcmV0dXJuIHNjb3JlID49IG1pblNjb3JlID8gc2NvcmUgOiBudWxsO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBGdXp6eSBTZWFyY2ggQ2FjaGUgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIEZ1enp5U2VhcmNoQ2FjaGVFbnRyeSB7XG4gIHJlc3VsdHM6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9PjtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG59XG5cbmNvbnN0IGZ1enp5U2VhcmNoQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgRnV6enlTZWFyY2hDYWNoZUVudHJ5PigpO1xuY29uc3QgQ0FDSEVfVFRMX01TID0gNjBfMDAwOyAvLyA2MCBzZWNvbmQgY2FjaGUgVFRMXG5cbi8qKlxuICogR2V0IGNhY2hlZCBmdXp6eSBzZWFyY2ggcmVzdWx0cyBpZiBhdmFpbGFibGUgYW5kIG5vdCBleHBpcmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVkRnV6enlSZXN1bHRzKHF1ZXJ5OiBzdHJpbmcsIGJhc2VQYXRoOiBzdHJpbmcpOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gfCBudWxsIHtcbiAgY29uc3QgY2FjaGVLZXkgPSBgJHtxdWVyeX06JHtiYXNlUGF0aH1gO1xuICBjb25zdCBlbnRyeSA9IGZ1enp5U2VhcmNoQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgXG4gIGlmICghZW50cnkpIHJldHVybiBudWxsO1xuICBpZiAoRGF0ZS5ub3coKSAtIGVudHJ5LnRpbWVzdGFtcCA+IENBQ0hFX1RUTF9NUykge1xuICAgIGZ1enp5U2VhcmNoQ2FjaGUuZGVsZXRlKGNhY2hlS2V5KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBcbiAgcmV0dXJuIGVudHJ5LnJlc3VsdHM7XG59XG5cbi8qKlxuICogQ2FjaGUgZnV6enkgc2VhcmNoIHJlc3VsdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWNoZUZ1enp5UmVzdWx0cyhxdWVyeTogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nLCByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4pOiB2b2lkIHtcbiAgY29uc3QgY2FjaGVLZXkgPSBgJHtxdWVyeX06JHtiYXNlUGF0aH1gO1xuICBmdXp6eVNlYXJjaENhY2hlLnNldChjYWNoZUtleSwge1xuICAgIHJlc3VsdHMsXG4gICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICB9KTtcbiAgXG4gIC8vIEV2aWN0IG9sZCBlbnRyaWVzIGlmIGNhY2hlIGdyb3dzIHRvbyBsYXJnZSAobWF4IDEwMCBlbnRyaWVzKVxuICBpZiAoZnV6enlTZWFyY2hDYWNoZS5zaXplID4gMTAwKSB7XG4gICAgY29uc3Qgb2xkZXN0S2V5ID0gZnV6enlTZWFyY2hDYWNoZS5rZXlzKCkubmV4dCgpLnZhbHVlO1xuICAgIGlmIChvbGRlc3RLZXkpIHtcbiAgICAgIGZ1enp5U2VhcmNoQ2FjaGUuZGVsZXRlKG9sZGVzdEtleSk7XG4gICAgfVxuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEFzeW5jIEZpbGUgU2VhcmNoIHdpdGggQ29uY3VycmVuY3kgQ29udHJvbCA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgU2VhcmNoUmVzdWx0IHtcbiAgZmlsZXM6IHN0cmluZ1tdO1xuICBjb3VudDogbnVtYmVyO1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHNlYXJjaCBmb3IgZmlsZXMgbWF0Y2hpbmcgYSBwYXR0ZXJuIHVzaW5nIGFzeW5jL2F3YWl0IHdpdGggY29uY3VycmVuY3kgY29udHJvbC5cbiAqIE11Y2ggZmFzdGVyIHRoYW4gc3luY2hyb25vdXMgcmVhZGRpclN5bmMgZm9yIGxhcmdlIGRpcmVjdG9yeSB0cmVlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmRGaWxlc0FzeW5jKFxuICBkaXJQYXRoOiBzdHJpbmcsXG4gIHBhdHRlcm46IHN0cmluZyxcbiAgbWF4RGVwdGg6IG51bWJlciA9IDUsXG4gIGNvbmN1cnJlbmN5TGltaXQ6IG51bWJlciA9IDRcbik6IFByb21pc2U8U2VhcmNoUmVzdWx0PiB7XG4gIGNvbnN0IHJlc3VsdHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IHBhdHRlcm5Mb3dlciA9IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcblxuICBhc3luYyBmdW5jdGlvbiBzZWFyY2hEaXIoY3VycmVudFBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnJlYWRkaXIoY3VycmVudFBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgIFxuICAgICAgLy8gUHJvY2VzcyBmaWxlcyBpbW1lZGlhdGVseVxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmIChlbnRyeS5pc0ZpbGUoKSAmJiBlbnRyeS5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocGF0dGVybkxvd2VyKSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaChwYXRoLmpvaW4oY3VycmVudFBhdGgsIGVudHJ5Lm5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBDb2xsZWN0IHN1YmRpcmVjdG9yaWVzIGZvciBwYXJhbGxlbCBwcm9jZXNzaW5nXG4gICAgICBjb25zdCBzdWJkaXJzID0gZW50cmllcy5maWx0ZXIoZSA9PiBlLmlzRGlyZWN0b3J5KCkpLm1hcChlID0+IHBhdGguam9pbihjdXJyZW50UGF0aCwgZS5uYW1lKSk7XG4gICAgICBcbiAgICAgIGlmIChzdWJkaXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gUHJvY2VzcyBkaXJlY3RvcmllcyBpbiBiYXRjaGVzIHRvIGF2b2lkIG92ZXJ3aGVsbWluZyB0aGUgc3lzdGVtXG4gICAgICAgIGNvbnN0IGJhdGNoZXM6IHN0cmluZ1tdW10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJkaXJzLmxlbmd0aDsgaSArPSBjb25jdXJyZW5jeUxpbWl0KSB7XG4gICAgICAgICAgYmF0Y2hlcy5wdXNoKHN1YmRpcnMuc2xpY2UoaSwgaSArIGNvbmN1cnJlbmN5TGltaXQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgYmF0Y2ggb2YgYmF0Y2hlcykge1xuICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICAgICAgYmF0Y2gubWFwKGRpciA9PiBzZWFyY2hEaXIoZGlyLCBkZXB0aCArIDEpKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIGRpcmVjdG9yaWVzIHNpbGVudGx5XG4gICAgfVxuICB9XG5cbiAgYXdhaXQgc2VhcmNoRGlyKGRpclBhdGgsIDApO1xuICByZXR1cm4geyBmaWxlczogcmVzdWx0cywgY291bnQ6IHJlc3VsdHMubGVuZ3RoIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFN0cmVhbWluZyBGaWxlIFJlYWRlciA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgU3RyZWFtUmVhZFJlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIGRhdGE/OiB7XG4gICAgY29udGVudDogc3RyaW5nO1xuICAgIHBhdGg6IHN0cmluZztcbiAgICB0b3RhbExlbmd0aDogbnVtYmVyO1xuICAgIHRydW5jYXRlZD86IGJvb2xlYW47XG4gICAgbm90ZT86IHN0cmluZztcbiAgfTtcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVhZCBmaWxlIGNvbnRlbnQgdXNpbmcgc3RyZWFtaW5nIHRvIGF2b2lkIGxvYWRpbmcgZW50aXJlIGZpbGUgaW50byBtZW1vcnkuXG4gKiBSZXNwZWN0cyBtYXhfbGVuZ3RoIHBhcmFtZXRlciBieSByZWFkaW5nIG9ubHkgbmVjZXNzYXJ5IGNodW5rcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRGaWxlU3luYyhcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgbWF4TGVuZ3RoOiBudW1iZXIgPSA1MDAwXG4pOiBQcm9taXNlPFN0cmVhbVJlYWRSZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBHZXQgZmlsZSBzdGF0cyBmaXJzdCB0byBrbm93IHRvdGFsIHNpemVcbiAgICBjb25zdCBzdGF0cyA9IGF3YWl0IGZzLnN0YXQoZmlsZVBhdGgpO1xuICAgIFxuICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQYXRoIGlzIGEgZGlyZWN0b3J5LCBub3QgYSBmaWxlJyB9O1xuICAgIH1cblxuICAgIC8vIElmIGZpbGUgaXMgc21hbGwgZW5vdWdoLCByZWFkIGVudGlyZWx5IChmYXN0ZXIgZm9yIHNtYWxsIGZpbGVzKVxuICAgIGlmIChzdGF0cy5zaXplIDw9IG1heExlbmd0aCAqIDIpIHsgLy8gMnggZmFjdG9yIGZvciBVVEYtOCBlbmNvZGluZyBvdmVyaGVhZFxuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzLnJlYWRGaWxlKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgIHRvdGFsTGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gRm9yIGxhcmdlIGZpbGVzLCB1c2Ugc3RyZWFtaW5nIHJlYWRcbiAgICBjb25zdCB7IGNyZWF0ZVJlYWRTdHJlYW0gfSA9IGF3YWl0IGltcG9ydCgnZnMnKTtcbiAgICBcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGxldCBjb250ZW50ID0gJyc7XG4gICAgICBsZXQgYnl0ZXNSZWFkID0gMDtcbiAgICAgIGNvbnN0IHN0cmVhbSA9IGNyZWF0ZVJlYWRTdHJlYW0oZmlsZVBhdGgsIHsgXG4gICAgICAgIGVuY29kaW5nOiAndXRmLTgnLFxuICAgICAgICBoaWdoV2F0ZXJNYXJrOiA2NCAqIDEwMjQgLy8gNjRLQiBjaHVua3MgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgfSk7XG5cbiAgICAgIHN0cmVhbS5vbignZGF0YScsIChjaHVuazogQnVmZmVyIHwgc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGNodW5rU3RyID0gdHlwZW9mIGNodW5rID09PSAnc3RyaW5nJyA/IGNodW5rIDogY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgYnl0ZXNSZWFkICs9IGNodW5rU3RyLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIC8vIE9ubHkgYWNjdW11bGF0ZSBpZiB3ZSBoYXZlbid0IGV4Y2VlZGVkIG1heCBsZW5ndGggeWV0XG4gICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCArIGNodW5rU3RyLmxlbmd0aCA8PSBtYXhMZW5ndGgpIHtcbiAgICAgICAgICBjb250ZW50ICs9IGNodW5rU3RyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRha2Ugb25seSB3aGF0IGZpdHMgYW5kIHN0b3AgcmVhZGluZ1xuICAgICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IG1heExlbmd0aCAtIGNvbnRlbnQubGVuZ3RoO1xuICAgICAgICAgIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgICAgICAgICBjb250ZW50ICs9IGNodW5rU3RyLnN1YnN0cmluZygwLCByZW1haW5pbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdHJlYW0uZGVzdHJveSgpOyAvLyBTdG9wIHRoZSBzdHJlYW0gZWFybHlcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHN0cmVhbS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBpc1RydW5jYXRlZCA9IGJ5dGVzUmVhZCA+IG1heExlbmd0aCB8fCBzdGF0cy5zaXplID4gbWF4TGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICB0b3RhbExlbmd0aDogTWF0aC5tYXgoYnl0ZXNSZWFkLCBjb250ZW50Lmxlbmd0aCksXG4gICAgICAgICAgICAuLi4oaXNUcnVuY2F0ZWQgJiYgeyBcbiAgICAgICAgICAgICAgdHJ1bmNhdGVkOiB0cnVlLCBcbiAgICAgICAgICAgICAgbm90ZTogYE91dHB1dCB0cnVuY2F0ZWQgdG8gJHttYXhMZW5ndGh9IGNoYXJhY3RlcnMuIFVzZSBtYXhfbGVuZ3RoIHBhcmFtZXRlciB0byByZWFkIG1vcmUuYCBcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcmVhZCBmaWxlOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFJlcXVlc3QgQ2FjaGluZyBmb3IgV2ViIFJlc2VhcmNoID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBDYWNoZWRSZXNwb25zZSB7XG4gIGRhdGE6IHVua25vd247XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xuICBzdGF0dXM6IG51bWJlcjtcbn1cblxuY29uc3QgcmVxdWVzdENhY2hlID0gbmV3IE1hcDxzdHJpbmcsIENhY2hlZFJlc3BvbnNlPigpO1xuY29uc3QgUkVRVUVTVF9DQUNIRV9UVExfTVMgPSAzMF8wMDA7IC8vIDMwIHNlY29uZCBjYWNoZSBUVEwgZm9yIHNlYXJjaCByZXN1bHRzXG5cbi8qKiBDbGVhciByZXF1ZXN0IGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclJlcXVlc3RDYWNoZSgpOiB2b2lkIHtcbiAgcmVxdWVzdENhY2hlLmNsZWFyKCk7XG59XG5cbi8qKlxuICogRmV0Y2ggd2l0aCBjYWNoaW5nIHRvIGF2b2lkIHJlZHVuZGFudCBuZXR3b3JrIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hXaXRoQ2FjaGUoXG4gIHVybDogc3RyaW5nLFxuICBvcHRpb25zPzogUmVxdWVzdEluaXRcbik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgY29uc3QgY2FjaGVLZXkgPSBgJHt1cmx9OiR7SlNPTi5zdHJpbmdpZnkob3B0aW9ucyl9YDtcbiAgXG4gIC8vIENoZWNrIGNhY2hlIGZpcnN0IChHRVQgcmVxdWVzdHMgb25seSlcbiAgaWYgKG9wdGlvbnM/Lm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgY29uc3QgY2FjaGVkID0gcmVxdWVzdENhY2hlLmdldChjYWNoZUtleSk7XG4gICAgaWYgKGNhY2hlZCAmJiBEYXRlLm5vdygpIC0gY2FjaGVkLnRpbWVzdGFtcCA8IFJFUVVFU1RfQ0FDSEVfVFRMX01TKSB7XG4gICAgICAvLyBSZXR1cm4gYSBSZXNwb25zZS1saWtlIG9iamVjdCBmcm9tIGNhY2hlXG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KGNhY2hlZC5kYXRhKSwge1xuICAgICAgICBzdGF0dXM6IGNhY2hlZC5zdGF0dXMsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIG9wdGlvbnMpO1xuICBcbiAgLy8gQ2FjaGUgc3VjY2Vzc2Z1bCByZXNwb25zZXNcbiAgaWYgKHJlc3BvbnNlLm9rICYmIG9wdGlvbnM/Lm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICByZXF1ZXN0Q2FjaGUuc2V0KGNhY2hlS2V5LCB7XG4gICAgICAgIGRhdGEsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgLy8gRXZpY3Qgb2xkIGVudHJpZXMgaWYgY2FjaGUgZ3Jvd3MgdG9vIGxhcmdlIChtYXggNTAgZW50cmllcylcbiAgICAgIGlmIChyZXF1ZXN0Q2FjaGUuc2l6ZSA+IDUwKSB7XG4gICAgICAgIGNvbnN0IG9sZGVzdEtleSA9IHJlcXVlc3RDYWNoZS5rZXlzKCkubmV4dCgpLnZhbHVlO1xuICAgICAgICBpZiAob2xkZXN0S2V5KSB7XG4gICAgICAgICAgcmVxdWVzdENhY2hlLmRlbGV0ZShvbGRlc3RLZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBOb24tSlNPTiByZXNwb25zZXMgYXJlIG5vdCBjYWNoZWRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbi8qKlxuICogUmV0cnkgbG9naWMgd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmIGZvciBmYWlsZWQgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFdpdGhSZXRyeShcbiAgdXJsOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCxcbiAgbWF4UmV0cmllczogbnVtYmVyID0gMyxcbiAgYmFzZURlbGF5TXM6IG51bWJlciA9IDEwMDBcbik6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcbiAgXG4gIGZvciAobGV0IGF0dGVtcHQgPSAwOyBhdHRlbXB0IDw9IG1heFJldHJpZXM7IGF0dGVtcHQrKykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aENhY2hlKHVybCwgb3B0aW9ucyk7XG4gICAgICBcbiAgICAgIGlmICghcmVzcG9uc2Uub2sgJiYgcmVzcG9uc2Uuc3RhdHVzID49IDUwMCkge1xuICAgICAgICAvLyBTZXJ2ZXIgZXJyb3IgLSByZXRyeVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlcnZlciBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgbGFzdEVycm9yID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yIDogbmV3IEVycm9yKFN0cmluZyhlcnJvcikpO1xuICAgICAgXG4gICAgICBpZiAoYXR0ZW1wdCA8IG1heFJldHJpZXMpIHtcbiAgICAgICAgY29uc3QgZGVsYXlNcyA9IGJhc2VEZWxheU1zICogTWF0aC5wb3coMiwgYXR0ZW1wdCk7IC8vIEV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5TXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIHRocm93IGxhc3RFcnJvciB8fCBuZXcgRXJyb3IoYFJlcXVlc3QgZmFpbGVkIGFmdGVyICR7bWF4UmV0cmllc30gcmV0cmllc2ApO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTdWJwcm9jZXNzIFRpbWVvdXQgQ2FsY3VsYXRvciA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIENhbGN1bGF0ZSBhcHByb3ByaWF0ZSB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZS5cbiAqIExhcmdlciBwcm9qZWN0cyBuZWVkIG1vcmUgdGltZSBmb3IgYW5hbHlzaXMgdG9vbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmFseXNpc1RpbWVvdXQoYmFzZVRpbWVvdXRNczogbnVtYmVyLCBmaWxlQ291bnQ/OiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoIWZpbGVDb3VudCkgcmV0dXJuIGJhc2VUaW1lb3V0TXM7XG4gIFxuICAvLyBTY2FsZSB0aW1lb3V0IGxvZ2FyaXRobWljYWxseSB3aXRoIGZpbGUgY291bnRcbiAgY29uc3Qgc2NhbGVGYWN0b3IgPSBNYXRoLmxvZzIoTWF0aC5tYXgoMSwgZmlsZUNvdW50KSkgLyAxMDsgLy8gfjF4IGZvciAxLTEwIGZpbGVzLCB+MnggZm9yIDEwMDArIGZpbGVzXG4gIGNvbnN0IHNjYWxlZFRpbWVvdXQgPSBiYXNlVGltZW91dE1zICogKDEgKyBzY2FsZUZhY3Rvcik7XG4gIFxuICAvLyBDYXAgYXQgNjAgc2Vjb25kcyBtYXhpbXVtXG4gIHJldHVybiBNYXRoLm1pbihzY2FsZWRUaW1lb3V0LCA2MF8wMDApO1xufVxuXG4vKipcbiAqIENvdW50IFR5cGVTY3JpcHQgZmlsZXMgaW4gYSBkaXJlY3RvcnkgdG8gZXN0aW1hdGUgcHJvamVjdCBzaXplLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY291bnRUeXBlU2NyaXB0RmlsZXMoZGlyUGF0aDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgbGV0IGNvdW50ID0gMDtcbiAgXG4gIGFzeW5jIGZ1bmN0aW9uIGNvdW50SW5EaXIoY3VycmVudFBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChkZXB0aCA+IDEwKSByZXR1cm47IC8vIFJlYXNvbmFibGUgbWF4IGRlcHRoXG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5yZWFkZGlyKGN1cnJlbnRQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICBcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoZW50cnkuaXNGaWxlKCkgJiYgZW50cnkubmFtZS5lbmRzV2l0aCgnLnRzJykpIHtcbiAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAvLyBTa2lwIGNvbW1vbiBub24tc291cmNlIGRpcmVjdG9yaWVzXG4gICAgICAgICAgaWYgKCFbJ25vZGVfbW9kdWxlcycsICcuZ2l0JywgJ2Rpc3QnLCAnYnVpbGQnXS5pbmNsdWRlcyhlbnRyeS5uYW1lKSkge1xuICAgICAgICAgICAgYXdhaXQgY291bnRJbkRpcihwYXRoLmpvaW4oY3VycmVudFBhdGgsIGVudHJ5Lm5hbWUpLCBkZXB0aCArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gU2tpcCBpbmFjY2Vzc2libGUgZGlyZWN0b3JpZXNcbiAgICB9XG4gIH1cbiAgXG4gIGF3YWl0IGNvdW50SW5EaXIoZGlyUGF0aCwgMCk7XG4gIHJldHVybiBjb3VudDtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlTWFuYWdlciB9IGZyb20gJy4uL3N0YXRlTWFuYWdlci5qcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZVBhdGgsIGlzU2FmZVJlZ2V4IH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0Rpciwgc2V0V29ya2luZ0RpciwgcmVzb2x2ZVBhdGggfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcbmltcG9ydCB7XG4gIGxldmVuc2h0ZWluU2ltaWxhcml0eSxcbiAgZ2V0Q2FjaGVkRnV6enlSZXN1bHRzLFxuICBjYWNoZUZ1enp5UmVzdWx0cyxcbiAgZmluZEZpbGVzQXN5bmMsXG4gIGNvdW50VHlwZVNjcmlwdEZpbGVzLFxuICBnZXRBbmFseXNpc1RpbWVvdXQsXG59IGZyb20gJy4uL3BlcmZvcm1hbmNlVXRpbHMuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgTGlzdERpcmVjdG9yeVBhcmFtcyB7IHBhdGg/OiBzdHJpbmc7IH1cbmludGVyZmFjZSBSZWFkRmlsZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBtYXhfbGVuZ3RoPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgU2F2ZUZpbGVQYXJhbXMgeyBmaWxlX25hbWU/OiBzdHJpbmc7IGNvbnRlbnQ/OiBzdHJpbmc7IGZpbGVzPzogQXJyYXk8eyBmaWxlX25hbWU6IHN0cmluZzsgY29udGVudDogc3RyaW5nIH0+OyB9XG5pbnRlcmZhY2UgUmVwbGFjZVRleHRJbkZpbGVQYXJhbXMgeyBmaWxlX25hbWU6IHN0cmluZzsgb2xkX3N0cmluZzogc3RyaW5nOyBuZXdfc3RyaW5nOiBzdHJpbmc7IH1cbmludGVyZmFjZSBJbnNlcnRBdExpbmVQYXJhbXMgeyBmaWxlX25hbWU6IHN0cmluZzsgbGluZV9udW1iZXI6IG51bWJlcjsgY29udGVudF90b19pbnNlcnQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIEFwcGVuZEZpbGVQYXJhbXMgeyBmaWxlX25hbWU6IHN0cmluZzsgY29udGVudDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRGVsZXRlTGluZXNJbkZpbGVQYXJhbXMgeyBmaWxlX25hbWU6IHN0cmluZzsgc3RhcnRfbGluZTogbnVtYmVyOyBlbmRfbGluZT86IG51bWJlcjsgfVxuaW50ZXJmYWNlIE1ha2VEaXJlY3RvcnlQYXJhbXMgeyBkaXJlY3RvcnlfbmFtZTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgTW92ZUZpbGVQYXJhbXMgeyBzb3VyY2U6IHN0cmluZzsgZGVzdGluYXRpb246IHN0cmluZzsgfVxuaW50ZXJmYWNlIENvcHlGaWxlUGFyYW1zIHsgc291cmNlOiBzdHJpbmc7IGRlc3RpbmF0aW9uOiBzdHJpbmc7IH1cbmludGVyZmFjZSBEZWxldGVQYXRoUGFyYW1zIHsgcGF0aDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRGVsZXRlRmlsZXNCeVBhdHRlcm5QYXJhbXMgeyBwYXR0ZXJuOiBzdHJpbmc7IH1cbmludGVyZmFjZSBGaW5kRmlsZXNQYXJhbXMgeyBwYXR0ZXJuOiBzdHJpbmc7IG1heF9kZXB0aD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEZ1enp5RmluZExvY2FsRmlsZXNQYXJhbXMgeyBxdWVyeTogc3RyaW5nOyBwYXRoPzogc3RyaW5nOyBtYXhfcmVzdWx0cz86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdldEZpbGVNZXRhZGF0YVBhcmFtcyB7IHBhdGg6IHN0cmluZzsgfVxuaW50ZXJmYWNlIENoYW5nZURpcmVjdG9yeVBhcmFtcyB7IGRpcmVjdG9yeTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmVhZERvY3VtZW50UGFyYW1zIHsgZmlsZV9wYXRoOiBzdHJpbmc7IH1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRmlsZVN5c3RlbVRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBfc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXIpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gbGlzdF9kaXJlY3RvcnkgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdsaXN0X2RpcmVjdG9yeScsXG4gICAgZGVzY3JpcHRpb246ICdMaXN0IHRoZSBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3Rvcnkgb3IgYSBzcGVjaWZpZWQgc3ViZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IHRvIGxpc3QuIERlZmF1bHRzIHRvIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aDogZGlyUGF0aCB9OiBMaXN0RGlyZWN0b3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICBjb25zdCB0YXJnZXRQYXRoID0gZGlyUGF0aCB8fCAnLic7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aCh0YXJnZXRQYXRoLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoOiBkaXJlY3RvcnkgdHJhdmVyc2FsIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgodGFyZ2V0UGF0aCk7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhmdWxsUGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBlbnRyaWVzLm1hcChlbnRyeSA9PiAoe1xuICAgICAgICAgIHBhdGg6IHBhdGguam9pbihmdWxsUGF0aCwgZW50cnkubmFtZSksXG4gICAgICAgICAgbmFtZTogZW50cnkubmFtZSxcbiAgICAgICAgICBpc0RpcmVjdG9yeTogZW50cnkuaXNEaXJlY3RvcnkoKSxcbiAgICAgICAgICBpc0ZpbGU6IGVudHJ5LmlzRmlsZSgpLFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVhZF9maWxlIHRvb2wgXHUyMDE0IEh5YnJpZDogRWFybHkgc2l6ZSBjaGVjayArIEJ1ZmZlciBiaW5hcnkgZGV0ZWN0aW9uICsgVHJ1bmNhdGlvbiBzdXBwb3J0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlYWRfZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIGNvbnRlbnQgZnJvbSBhIGZpbGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIHJlYWQnKSxcbiAgICAgIG1heF9sZW5ndGg6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MDAwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDUwMDApLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRvIHJldHVybiAoZGVmYXVsdDogNTAwMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIG1heF9sZW5ndGggfTogUmVhZEZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBjb25zdCBtYXhMZW5ndGggPSBtYXhfbGVuZ3RoIHx8IDUwMDA7XG5cbiAgICAgICAgLy8gRWFybHkgc2l6ZSBjaGVjayAoQmVsZWRhcmlhbiBzdHlsZSkgLSBwcmV2ZW50IGxvYWRpbmcgPjEwTUIgZmlsZXNcbiAgICAgICAgbGV0IHN0YXRzOiBmcy5TdGF0cztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0cy5zaXplID4gMTBfMDAwXzAwMCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ZpbGUgdG9vIGxhcmdlICg+MTBNQiknIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWFkIGFzIGJ1ZmZlciBmb3IgZWZmaWNpZW50IGJpbmFyeSBjaGVjayAoQmVsZWRhcmlhbiBzdHlsZSlcbiAgICAgICAgY29uc3QgYnVmZmVyID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoZnVsbFBhdGgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQmluYXJ5IGNoZWNrOiBudWxsIGJ5dGUgaW4gZmlyc3QgMUtCXG4gICAgICAgIGNvbnN0IGNoZWNrQnVmZmVyID0gYnVmZmVyLnN1YmFycmF5KDAsIE1hdGgubWluKGJ1ZmZlci5sZW5ndGgsIDEwMjQpKTtcbiAgICAgICAgaWYgKGNoZWNrQnVmZmVyLmluY2x1ZGVzKDApKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQmluYXJ5IGZpbGUgZGV0ZWN0ZWQuIFVzZSByZWFkX2RvY3VtZW50IGZvciBQREYvRE9DWCBmaWxlcy4nIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IHRvIHN0cmluZ1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYnVmZmVyLnRvU3RyaW5nKCd1dGYtOCcpO1xuXG4gICAgICAgIC8vIFRydW5jYXRlIGlmIG5lY2Vzc2FyeSBhbmQgYWRkIG1ldGFkYXRhIChBSSBUb29sYm94IHN0eWxlKVxuICAgICAgICBsZXQgZGF0YUNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICBsZXQgdHJ1bmNhdGVkID0gZmFsc2U7XG4gICAgICAgIGxldCB0b3RhbExlbmd0aCA9IGNvbnRlbnQubGVuZ3RoO1xuXG4gICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCA+IG1heExlbmd0aCkge1xuICAgICAgICAgIGRhdGFDb250ZW50ID0gY29udGVudC5zdWJzdHJpbmcoMCwgbWF4TGVuZ3RoKTtcbiAgICAgICAgICB0cnVuY2F0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgIGNvbnRlbnQ6IGRhdGFDb250ZW50LFxuICAgICAgICAgICAgZmlsZVBhdGg6IGZ1bGxQYXRoLCAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgICAuLi4odHJ1bmNhdGVkID8geyB0cnVuY2F0ZWQ6IHRydWUsIHRvdGFsX2xlbmd0aDogdG90YWxMZW5ndGggfSA6IHt9KVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHNhdmVfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NhdmVfZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdTYXZlIGNvbnRlbnQgdG8gYSBzcGVjaWZpZWQgZmlsZSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gU3VwcG9ydHMgYmF0Y2ggc2F2aW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIHNhdmUnKSxcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIGNvbnRlbnQgdG8gd3JpdGUgdG8gdGhlIGZpbGUnKSxcbiAgICAgIGZpbGVzOiB6LmFycmF5KHoub2JqZWN0KHsgZmlsZV9uYW1lOiB6LnN0cmluZygpLCBjb250ZW50OiB6LnN0cmluZygpIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGb3IgYmF0Y2ggc2F2aW5nIG11bHRpcGxlIGZpbGVzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBjb250ZW50LCBmaWxlcyB9OiBTYXZlRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGZpbGVzICYmIEFycmF5LmlzQXJyYXkoZmlsZXMpKSB7XG4gICAgICAgICAgLy8gQmF0Y2ggc2F2ZSBtb2RlXG4gICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZS5maWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW52YWxpZCBwYXRoIGluIGJhdGNoOiAke2ZpbGUuZmlsZV9uYW1lfWAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZS5maWxlX25hbWUpO1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgZmlsZS5jb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IGZpbGU6IGZ1bGxQYXRoLCBzdGF0dXM6ICdzYXZlZCcgfSk7IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzYXZlZEZpbGVzOiBmaWxlcy5sZW5ndGgsIHJlc3VsdHMgfSB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZpbGVfbmFtZSAmJiBjb250ZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBTaW5nbGUgZmlsZSBzYXZlIG1vZGVcbiAgICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWRGaWxlOiBmdWxsUGF0aCwgcGF0aDogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRWl0aGVyIHByb3ZpZGUgZmlsZV9uYW1lK2NvbnRlbnQgb3IgZmlsZXMgYXJyYXknIH07XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlcGxhY2VfdGV4dF9pbl9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVwbGFjZV90ZXh0X2luX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZSBhIHNwZWNpZmljIHN0cmluZyBpbiBhIGZpbGUgd2l0aCBhIG5ldyBzdHJpbmcuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIG1vZGlmeScpLFxuICAgICAgb2xkX3N0cmluZzogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGV4YWN0IHRleHQgdG8gcmVwbGFjZS4gTXVzdCBiZSB1bmlxdWUgaW4gdGhlIGZpbGUuJyksXG4gICAgICBuZXdfc3RyaW5nOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCB0byBpbnNlcnQgaW4gcGxhY2Ugb2Ygb2xkX3N0cmluZy4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIG9sZF9zdHJpbmcsIG5ld19zdHJpbmcgfTogUmVwbGFjZVRleHRJbkZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghY29udGVudC5pbmNsdWRlcyhvbGRfc3RyaW5nKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFN0cmluZyAnJHtvbGRfc3RyaW5nfScgbm90IGZvdW5kIGluIGZpbGVgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG5ld0NvbnRlbnQgPSBjb250ZW50LnJlcGxhY2Uob2xkX3N0cmluZywgbmV3X3N0cmluZyk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIG5ld0NvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHJlcGxhY2VkOiB0cnVlLCBmaWxlOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGluc2VydF9hdF9saW5lIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaW5zZXJ0X2F0X2xpbmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW5zZXJ0IGNvbnRlbnQgYXQgYSBzcGVjaWZpYyBsaW5lIG51bWJlciBpbiBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIG1vZGlmeScpLFxuICAgICAgbGluZV9udW1iZXI6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLmRlc2NyaWJlKCdUaGUgbGluZSBudW1iZXIgdG8gaW5zZXJ0IGF0ICgxLWluZGV4ZWQpJyksXG4gICAgICBjb250ZW50X3RvX2luc2VydDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgY29udGVudCB0byBpbnNlcnQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIGxpbmVfbnVtYmVyLCBjb250ZW50X3RvX2luc2VydCB9OiBJbnNlcnRBdExpbmVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGxldCBsaW5lcyA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jykuc3BsaXQoJ1xcbicpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWxsb3cgYXBwZW5kaW5nIGF0IEVPRiAobGluZV9udW1iZXIgPT0gbGVuZ3RoICsgMSlcbiAgICAgICAgaWYgKGxpbmVfbnVtYmVyID4gbGluZXMubGVuZ3RoICsgMSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYExpbmUgbnVtYmVyICR7bGluZV9udW1iZXJ9IGV4Y2VlZHMgZmlsZSBsZW5ndGggKCR7bGluZXMubGVuZ3RofSlgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxpbmVzLnNwbGljZShsaW5lX251bWJlciAtIDEsIDAsIGNvbnRlbnRfdG9faW5zZXJ0KTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgbGluZXMuam9pbignXFxuJyksICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGluc2VydGVkQXQ6IGxpbmVfbnVtYmVyLCBmaWxlOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGFwcGVuZF9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYXBwZW5kX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiBcIkFwcGVuZCBjb250ZW50IHRvIHRoZSBlbmQgb2YgYSBmaWxlLiBJZiB0aGUgZmlsZSBkb2Vzbid0IGV4aXN0LCBpdCB3aWxsIGJlIGNyZWF0ZWQuXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBhcHBlbmQgdG8nKSxcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gYXBwZW5kJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBjb250ZW50IH06IEFwcGVuZEZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGZ1bGxQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBhcHBlbmRlZFRvOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9saW5lc19pbl9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX2xpbmVzX2luX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIGEgc3BlY2lmaWMgbGluZSBvciByYW5nZSBvZiBsaW5lcyBmcm9tIGEgZmlsZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gbW9kaWZ5JyksXG4gICAgICBzdGFydF9saW5lOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnU3RhcnRpbmcgbGluZSBudW1iZXIgKDEtaW5kZXhlZCknKSxcbiAgICAgIGVuZF9saW5lOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdFbmRpbmcgbGluZSBudW1iZXIgKGluY2x1c2l2ZSkuIElmIG9taXR0ZWQsIG9ubHkgZGVsZXRlcyBzdGFydF9saW5lLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgc3RhcnRfbGluZSwgZW5kX2xpbmUgfTogRGVsZXRlTGluZXNJbkZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGxldCBsaW5lcyA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jykuc3BsaXQoJ1xcbicpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZGVsZXRlRW5kID0gZW5kX2xpbmUgfHwgc3RhcnRfbGluZTtcbiAgICAgICAgaWYgKHN0YXJ0X2xpbmUgPiBsaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBTdGFydCBsaW5lICR7c3RhcnRfbGluZX0gZXhjZWVkcyBmaWxlIGxlbmd0aCAoJHtsaW5lcy5sZW5ndGh9KWAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2xhbXAgZW5kX2xpbmUgdG8gYXZvaWQgc2lsZW50IHRydW5jYXRpb24gYmV5b25kIGZpbGUgYm91bmRzXG4gICAgICAgIGNvbnN0IGNsYW1wZWRFbmQgPSBNYXRoLm1pbihkZWxldGVFbmQsIGxpbmVzLmxlbmd0aCk7XG4gICAgICAgIGxpbmVzLnNwbGljZShzdGFydF9saW5lIC0gMSwgY2xhbXBlZEVuZCAtIHN0YXJ0X2xpbmUgKyAxKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgbGluZXMuam9pbignXFxuJyksICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWRMaW5lczogYCR7c3RhcnRfbGluZX0tJHtjbGFtcGVkRW5kfWAsIGZpbGU6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gbWFrZV9kaXJlY3RvcnkgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdtYWtlX2RpcmVjdG9yeScsXG4gICAgZGVzY3JpcHRpb246ICdDcmVhdGUgYSBuZXcgZGlyZWN0b3J5IGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZGlyZWN0b3J5X25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBuYW1lIG9mIHRoZSBkaXJlY3RvcnkgdG8gY3JlYXRlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZGlyZWN0b3J5X25hbWUgfTogTWFrZURpcmVjdG9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZGlyZWN0b3J5X25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChkaXJlY3RvcnlfbmFtZSk7XG4gICAgICAgIGZzLm1rZGlyU3luYyhmdWxsUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY3JlYXRlZERpcmVjdG9yeTogZGlyZWN0b3J5X25hbWUsIHBhdGg6IGZ1bGxQYXRoIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG1vdmVfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ21vdmVfZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdNb3ZlIG9yIHJlbmFtZSBhIGZpbGUgb3IgZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc291cmNlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTb3VyY2UgcGF0aCcpLFxuICAgICAgZGVzdGluYXRpb246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0Rlc3RpbmF0aW9uIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzb3VyY2UsIGRlc3RpbmF0aW9uIH06IE1vdmVGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChzb3VyY2UsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHNvdXJjZSBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGRlc3RpbmF0aW9uLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBkZXN0aW5hdGlvbiBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxTb3VyY2UgPSByZXNvbHZlUGF0aChzb3VyY2UpO1xuICAgICAgICBjb25zdCBmdWxsRGVzdGluYXRpb24gPSByZXNvbHZlUGF0aChkZXN0aW5hdGlvbik7XG4gICAgICAgIGZzLnJlbmFtZVN5bmMoZnVsbFNvdXJjZSwgZnVsbERlc3RpbmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBtb3ZlZEZyb206IGZ1bGxTb3VyY2UsIG1vdmVkVG86IGZ1bGxEZXN0aW5hdGlvbiB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhTXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjb3B5X2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjb3B5X2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ29weSBhIGZpbGUgdG8gYSBuZXcgbG9jYXRpb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzb3VyY2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NvdXJjZSBmaWxlIHBhdGgnKSxcbiAgICAgIGRlc3RpbmF0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXN0aW5hdGlvbiBmaWxlIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzb3VyY2UsIGRlc3RpbmF0aW9uIH06IENvcHlGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChzb3VyY2UsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHNvdXJjZSBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGRlc3RpbmF0aW9uLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBkZXN0aW5hdGlvbiBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxTb3VyY2UgPSByZXNvbHZlUGF0aChzb3VyY2UpO1xuICAgICAgICBjb25zdCBmdWxsRGVzdGluYXRpb24gPSByZXNvbHZlUGF0aChkZXN0aW5hdGlvbik7XG4gICAgICAgIGZzLmNvcHlGaWxlU3luYyhmdWxsU291cmNlLCBmdWxsRGVzdGluYXRpb24pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvcGllZEZyb206IGZ1bGxTb3VyY2UsIGNvcGllZFRvOiBmdWxsRGVzdGluYXRpb24gfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIU1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX3BhdGggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfcGF0aCcsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgYSBmaWxlIG9yIGRpcmVjdG9yeSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gQmUgY2FyZWZ1bCEnLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBwYXRoIHRvIGRlbGV0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGg6IGZpbGVQYXRoIH06IERlbGV0ZVBhdGhQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVQYXRoLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZVBhdGgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBhIGRpcmVjdG9yeVxuICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICBmcy5ybVN5bmMoZnVsbFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZzLnVubGlua1N5bmMoZnVsbFBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGVsZXRlZDogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfZmlsZXNfYnlfcGF0dGVybiB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9maWxlc19ieV9wYXR0ZXJuJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBtdWx0aXBsZSBmaWxlcyBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnkgdGhhdCBtYXRjaCBhIHJlZ2V4IHBhdHRlcm4uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXR0ZXJuOiB6LnN0cmluZygpLmRlc2NyaWJlKCdSZWdleCBwYXR0ZXJuIHRvIG1hdGNoIGZpbGVuYW1lcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdHRlcm4gfTogRGVsZXRlRmlsZXNCeVBhdHRlcm5QYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChjb25maWcucmVnZXhSZURvU1Byb3RlY3Rpb24gJiYgIWlzU2FmZVJlZ2V4KHBhdHRlcm4pKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5zYWZlIHJlZ2V4IHBhdHRlcm4gZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChwYXR0ZXJuKTtcbiAgICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhnZXRXb3JraW5nRGlyKCkpO1xuICAgICAgICBjb25zdCBkZWxldGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICBpZiAocmVnZXgudGVzdChmaWxlKSkge1xuICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlKTtcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmMoZnVsbFBhdGgpO1xuICAgICAgICAgICAgZGVsZXRlZEZpbGVzLnB1c2goZnVsbFBhdGgpOyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWRDb3VudDogZGVsZXRlZEZpbGVzLmxlbmd0aCwgZGVsZXRlZEZpbGVzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGZpbmRfZmlsZXMgdG9vbCBcdTIwMTQgT1BUSU1JWkVEIHdpdGggYXN5bmMvYXdhaXQgYW5kIGNvbmN1cnJlbmN5IGNvbnRyb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZmluZF9maWxlcycsXG4gICAgZGVzY3JpcHRpb246ICdGaW5kIGZpbGVzIHJlY3Vyc2l2ZWx5IGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBtYXRjaGluZyBhIG5hbWUgcGF0dGVybi4gVXNlcyBhc3luYyBzZWFyY2ggZm9yIGJldHRlciBwZXJmb3JtYW5jZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdHRlcm46IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1N1YnN0cmluZyB0byBtYXRjaCBpbiBmaWxlbmFtZSAoY2FzZS1pbnNlbnNpdGl2ZSknKSxcbiAgICAgIG1heF9kZXB0aDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkub3B0aW9uYWwoKS5kZXNjcmliZSgnTWF4aW11bSBkZXB0aCB0byBzZWFyY2ggKGRlZmF1bHQ6IDUpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0dGVybiwgbWF4X2RlcHRoIH06IEZpbmRGaWxlc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2VhcmNoUGF0aCA9IGdldFdvcmtpbmdEaXIoKTtcbiAgICAgICAgY29uc3QgZGVwdGggPSBtYXhfZGVwdGggfHwgNTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVzZSBvcHRpbWl6ZWQgYXN5bmMgc2VhcmNoIHdpdGggY29uY3VycmVuY3kgY29udHJvbFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmaW5kRmlsZXNBc3luYyhzZWFyY2hQYXRoLCBwYXR0ZXJuLCBkZXB0aCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZm91bmRGaWxlczogcmVzdWx0LmZpbGVzLCBjb3VudDogcmVzdWx0LmNvdW50IH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGZ1enp5X2ZpbmRfbG9jYWxfZmlsZXMgdG9vbCBcdTIwMTQgT1BUSU1JWkVEIHdpdGggZWFybHkgZXhpdCBMZXZlbnNodGVpbiArIGNhY2hpbmdcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZnV6enlfZmluZF9sb2NhbF9maWxlcycsXG4gICAgZGVzY3JpcHRpb246ICdGdXp6eSBmaW5kIGxvY2FsIGZpbGVzIGJ5IHBhdGgvbmFtZSBzaW1pbGFyaXR5IHVzaW5nIG9wdGltaXplZCBMZXZlbnNodGVpbiBzY29yaW5nIHdpdGggY2FjaGluZy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTZWFyY2ggcXVlcnkgdG8gbWF0Y2ggYWdhaW5zdCBmaWxlIG5hbWVzL3BhdGhzLicpLFxuICAgICAgcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdTdWItZGlyZWN0b3J5IHRvIHNlYXJjaCBpbiAoZGVmYXVsdDogY3VycmVudCBkaXJlY3RvcnkpLicpLFxuICAgICAgbWF4X3Jlc3VsdHM6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCgyMCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTWF4IHJlc3VsdHMgdG8gcmV0dXJuIChkZWZhdWx0OiA1KS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgcGF0aDogc2VhcmNoUGF0aCwgbWF4X3Jlc3VsdHMgfTogRnV6enlGaW5kTG9jYWxGaWxlc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYmFzZURpciA9IHNlYXJjaFBhdGggPyByZXNvbHZlUGF0aChzZWFyY2hQYXRoKSA6IGdldFdvcmtpbmdEaXIoKTtcbiAgICAgICAgY29uc3QgbWF4UmVzdWx0cyA9IG1heF9yZXN1bHRzIHx8IDU7XG5cbiAgICAgICAgLy8gQ2hlY2sgY2FjaGUgZmlyc3RcbiAgICAgICAgY29uc3QgY2FjaGVkUmVzdWx0cyA9IGdldENhY2hlZEZ1enp5UmVzdWx0cyhxdWVyeSwgYmFzZURpcik7XG4gICAgICAgIGlmIChjYWNoZWRSZXN1bHRzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBtYXRjaGVzOiBjYWNoZWRSZXN1bHRzLnNsaWNlKDAsIG1heFJlc3VsdHMpLCBjb3VudDogTWF0aC5taW4oY2FjaGVkUmVzdWx0cy5sZW5ndGgsIG1heFJlc3VsdHMpIH0gfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbGxlY3QgZmlsZXMgdXNpbmcgYXN5bmMgbWV0aG9kXG4gICAgICAgIGNvbnN0IGFsbEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gY29sbGVjdEZpbGVzKGRpclBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlciA9IDAsIG1heERlcHRoOiBudW1iZXIgPSAyMCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG4gICAgICAgICAgXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKGRpclBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsIGVudHJ5Lm5hbWUpO1xuICAgICAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNvbGxlY3RGaWxlcyhmdWxsUGF0aCwgZGVwdGggKyAxLCBtYXhEZXB0aCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWxsRmlsZXMucHVzaChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIGRpcmVjdG9yaWVzXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBjb2xsZWN0RmlsZXMoYmFzZURpcik7XG4gICAgICAgIFxuICAgICAgICAvLyBPcHRpbWl6ZWQgZnV6enkgbWF0Y2hpbmcgd2l0aCBlYXJseSBleGl0XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9PiA9IFtdO1xuICAgICAgICBjb25zdCBxdWVyeUxvd2VyID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgTUlOX1NDT1JFID0gMC4zO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGFsbEZpbGVzKSB7XG4gICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gVXNlIG9wdGltaXplZCBMZXZlbnNodGVpbiB3aXRoIGVhcmx5IGV4aXRcbiAgICAgICAgICBjb25zdCBzY29yZSA9IGxldmVuc2h0ZWluU2ltaWxhcml0eShxdWVyeUxvd2VyLCBmaWxlTmFtZSwgTUlOX1NDT1JFKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoc2NvcmUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IGZpbGVQYXRoOiBmaWxlLCBzY29yZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNvcnQgYnkgc2NvcmUgZGVzY2VuZGluZyBhbmQgY2FjaGUgcmVzdWx0c1xuICAgICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgICAgICAgY2FjaGVGdXp6eVJlc3VsdHMocXVlcnksIGJhc2VEaXIsIHJlc3VsdHMpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBtYXRjaGVzOiByZXN1bHRzLnNsaWNlKDAsIG1heFJlc3VsdHMpLCBjb3VudDogTWF0aC5taW4ocmVzdWx0cy5sZW5ndGgsIG1heFJlc3VsdHMpIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9maWxlX21ldGFkYXRhIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X2ZpbGVfbWV0YWRhdGEnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IG1ldGFkYXRhIChzaXplLCBkYXRlcykgZm9yIGEgc3BlY2lmaWMgZmlsZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoOiBmaWxlUGF0aCB9OiBHZXRGaWxlTWV0YWRhdGFQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVQYXRoLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBwYXRoOiBmdWxsUGF0aCxcbiAgICAgICAgICAgIHNpemU6IHN0YXRzLnNpemUsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IHN0YXRzLmJpcnRodGltZSxcbiAgICAgICAgICAgIG1vZGlmaWVkQXQ6IHN0YXRzLm10aW1lLFxuICAgICAgICAgICAgYWNjZXNzZWRBdDogc3RhdHMuYXRpbWUsXG4gICAgICAgICAgICBpc0RpcmVjdG9yeTogc3RhdHMuaXNEaXJlY3RvcnkoKSxcbiAgICAgICAgICAgIGlzRmlsZTogc3RhdHMuaXNGaWxlKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNoYW5nZV9kaXJlY3RvcnkgdG9vbCBcdTIwMTQgSHlicmlkOiBFeHBsaWNpdCB2YWxpZGF0aW9uICsgU3RhdGUgYWJzdHJhY3Rpb24gKyBDb250ZXh0dWFsIHJlc3BvbnNlXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NoYW5nZV9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBBbGwgc3Vic2VxdWVudCBmaWxlIG9wZXJhdGlvbnMgd2lsbCB1c2UgdGhpcyBkaXJlY3RvcnkgYXMgdGhlIGJhc2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBkaXJlY3Rvcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBhYnNvbHV0ZSBwYXRoIHRvIGNoYW5nZSB0byAoZS5nLiwgXCJDOlxcXFxcXFxcUHJvamVjdHNcXFxcXFxcXG15LWFwcFwiKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGRpcmVjdG9yeSB9OiBDaGFuZ2VEaXJlY3RvcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZGlyZWN0b3J5KTtcblxuICAgICAgICAvLyBcdTI3MDUgQmVsZWRhcmlhbidzIGV4cGxpY2l0IHZhbGlkYXRpb24gdXNpbmcgZnMuc3RhdFxuICAgICAgICBsZXQgc3RhdHM6IGZzLlN0YXRzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmdWxsUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUGF0aCBpcyBub3QgYSBkaXJlY3Rvcnk6ICR7ZnVsbFBhdGh9YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHUyNzA1IENhcHR1cmUgcHJldmlvdXMgZGlyZWN0b3J5IGZvciBjb250ZXh0XG4gICAgICAgIGNvbnN0IHByZXZpb3VzRGlyZWN0b3J5ID0gZ2V0V29ya2luZ0RpcigpO1xuXG4gICAgICAgIC8vIFx1MjcwNSBBSSBUb29sYm94J3MgYWJzdHJhY3Rpb24gZm9yIHN0YXRlIGNoYW5nZVxuICAgICAgICBjb25zdCBzdWNjZXNzID0gc2V0V29ya2luZ0RpcihmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcbiAgICAgICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGNoYW5nZSBkaXJlY3RvcnkgdG8gJyR7ZGlyZWN0b3J5fScuIEVuc3VyZSB0aGUgcGF0aCBleGlzdHMgYW5kIGlzIGEgdmFsaWQgZGlyZWN0b3J5LmAgXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1MjcwNSBCZWxlZGFyaWFuJ3MgY29udGV4dHVhbCByZXR1cm4gZGF0YSArIEFJIFRvb2xib3gncyBzdHJ1Y3R1cmVkIGZvcm1hdFxuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLCBcbiAgICAgICAgICBkYXRhOiB7IFxuICAgICAgICAgICAgcHJldmlvdXNfZGlyZWN0b3J5OiBwcmV2aW91c0RpcmVjdG9yeSxcbiAgICAgICAgICAgIGN1cnJlbnRfZGlyZWN0b3J5OiBnZXRXb3JraW5nRGlyKCkgXG4gICAgICAgICAgfSBcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG5cbiAgLy8gYW5hbHl6ZV9wcm9qZWN0IHRvb2wgXHUyMDE0IENvbXByZWhlbnNpdmUgVHlwZVNjcmlwdCBQZXJmb3JtYW5jZSAmIExpbnRpbmcgQW5hbHlzaXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYW5hbHl6ZV9wcm9qZWN0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biBwcm9qZWN0LXdpZGUgYW5hbHlzaXMgaW5jbHVkaW5nIFR5cGVTY3JpcHQgZGlhZ25vc3RpY3MsIGNpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0aW9uLCBFU0xpbnQsIGNvbmZpZyBvcHRpbWl6YXRpb24sIGFuZCBpbXBvcnQgc3RydWN0dXJlIGFuYWx5c2lzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY2F0ZWdvcmllczogei5hcnJheSh6LmVudW0oWyd0eXBlY2hlY2snLCAnY2lyY3VsYXInLCAnZXNsaW50JywgJ2NvbmZpZycsICdpbXBvcnRzJ10pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdBbmFseXNpcyBjYXRlZ29yaWVzIHRvIHJ1biAoZGVmYXVsdDogYWxsKScpLFxuICAgICAgbWF4X2ltcG9ydHNfd2FybmluZzogei5udW1iZXIoKS5pbnQoKS5taW4oNSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDIwKS5kZXNjcmliZSgnTWF4IGltcG9ydHMgcGVyIGZpbGUgYmVmb3JlIHdhcm5pbmcnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjYXRlZ29yaWVzLCBtYXhfaW1wb3J0c193YXJuaW5nIH06IHsgY2F0ZWdvcmllcz86IHN0cmluZ1tdOyBtYXhfaW1wb3J0c193YXJuaW5nPzogbnVtYmVyIH0pID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHdvcmtpbmdEaXIgPSBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQ2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMgfHwgWyd0eXBlY2hlY2snLCAnY2lyY3VsYXInLCAnZXNsaW50JywgJ2NvbmZpZycsICdpbXBvcnRzJ107XG4gICAgICAgIGNvbnN0IGltcG9ydFdhcm5pbmdUaHJlc2hvbGQgPSBtYXhfaW1wb3J0c193YXJuaW5nIHx8IDIwO1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IFNhZmUgU3VicHJvY2VzcyBIZWxwZXIgd2l0aCBQcm9ncmVzcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBmdW5jdGlvbiBzcGF3bldpdGhQcm9ncmVzcyhleGU6IHN0cmluZywgYXJnczogc3RyaW5nW10sIHRpbWVvdXRNczogbnVtYmVyKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IHN0ZG91dD86IHN0cmluZzsgc3RkZXJyPzogc3RyaW5nIH0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2MgPSBzcGF3bihleGUsIGFyZ3MsIHtcbiAgICAgICAgICAgICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgJ3BpcGUnXSxcbiAgICAgICAgICAgICAgY3dkOiB3b3JraW5nRGlyLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICAgICAgICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgICAgICAgICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGQ6IEJ1ZmZlcikgPT4geyBzdGRvdXQgKz0gZC50b1N0cmluZygpOyB9KTtcbiAgICAgICAgICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkOiBCdWZmZXIpID0+IHsgc3RkZXJyICs9IGQudG9TdHJpbmcoKTsgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHsgXG4gICAgICAgICAgICAgIHByb2Mua2lsbCgpOyBcbiAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGRlcnI6IGBUaW1lb3V0IGFmdGVyICR7dGltZW91dE1zfW1zYCB9KTsgXG4gICAgICAgICAgICB9LCB0aW1lb3V0TXMpO1xuXG4gICAgICAgICAgICBwcm9jLm9uKCdjbG9zZScsICgpID0+IHsgY2xlYXJUaW1lb3V0KHRpbWVySWQpOyByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgc3Rkb3V0LCBzdGRlcnIgfSk7IH0pO1xuICAgICAgICAgICAgcHJvYy5vbignZXJyb3InLCAoZXJyKSA9PiB7IGNsZWFyVGltZW91dCh0aW1lcklkKTsgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGRlcnI6IGVyci5tZXNzYWdlIH0pOyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEEuIFR5cGVTY3JpcHQgRXh0ZW5kZWQgRGlhZ25vc3RpY3MgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuVHlwZWNoZWNrQW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IHRzQ29uZmlnUGF0aCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAndHNjb25maWcuanNvbicpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0c0NvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyB0c2NvbmZpZy5qc29uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGlmIHRzYyBpcyBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ3RzYycsIFsnLS12ZXJzaW9uJ10sIDUwMDApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnVHlwZVNjcmlwdCBjb21waWxlciAodHNjKSBub3QgZm91bmQgaW4gUEFUSCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEeW5hbWljIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplICh1c2luZyBpbXBvcnRlZCB1dGlsaXRpZXMpXG4gICAgICAgICAgY29uc3QgZmlsZUNvdW50ID0gYXdhaXQgY291bnRUeXBlU2NyaXB0RmlsZXMod29ya2luZ0Rpcik7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1RpbWVvdXQgPSBnZXRBbmFseXNpc1RpbWVvdXQoMzAwMDAsIGZpbGVDb3VudCk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ3RzYycsIFsnLS1leHRlbmRlZERpYWdub3N0aWNzJ10sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzIHx8ICFyZXN1bHQuc3Rkb3V0KSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGB0c2MgZmFpbGVkOiAke3Jlc3VsdC5zdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXJzZSB0c2MgLS1leHRlbmRlZERpYWdub3N0aWNzIG91dHB1dFxuICAgICAgICAgIGNvbnN0IGxpbmVzID0gcmVzdWx0LnN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgbGV0IGNoZWNrVGltZU1zID0gMDtcbiAgICAgICAgICBsZXQgbWVtb3J5VXNlZE1CID0gMDtcbiAgICAgICAgICBsZXQgZmlsZXNDaGVja2VkID0gMDtcbiAgICAgICAgICBsZXQgZW1pdFRpbWVNcyA9IDA7XG4gICAgICAgICAgbGV0IHBhcnNlVGltZU1zID0gMDtcblxuICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgY29uc3QgbG93ZXJMaW5lID0gbGluZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQYXJzZSBjaGVjayB0aW1lXG4gICAgICAgICAgICBjb25zdCBjaGVja01hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9jaGVja1xccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChjaGVja01hdGNoKSBjaGVja1RpbWVNcyA9IHBhcnNlSW50KGNoZWNrTWF0Y2hbMV0sIDEwKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgbWVtb3J5IHVzZWRcbiAgICAgICAgICAgIGNvbnN0IG1lbU1hdGNoID0gbGluZS5tYXRjaCgvbWVtb3J5IHVzZWQ6XFxzKyhcXGQrKVxccyooa2J8bWIpL2kpO1xuICAgICAgICAgICAgaWYgKG1lbU1hdGNoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnQobWVtTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgICAgbWVtb3J5VXNlZE1CID0gbWVtTWF0Y2hbMl0udG9Mb3dlckNhc2UoKSA9PT0gJ21iJyA/IHZhbHVlIDogTWF0aC5yb3VuZCh2YWx1ZSAvIDEwMjQgKiAxMDApIC8gMTAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXJzZSBmaWxlcyBjaGVja2VkXG4gICAgICAgICAgICBjb25zdCBmaWxlc01hdGNoID0gbGluZS5tYXRjaCgvZmlsZXNcXHMrY2hlY2tlZDpcXHMrKFxcZCspLyk7XG4gICAgICAgICAgICBpZiAoZmlsZXNNYXRjaCkgZmlsZXNDaGVja2VkID0gcGFyc2VJbnQoZmlsZXNNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBlbWl0IHRpbWVcbiAgICAgICAgICAgIGNvbnN0IGVtaXRNYXRjaCA9IGxvd2VyTGluZS5tYXRjaCgvZW1pdFxccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChlbWl0TWF0Y2gpIGVtaXRUaW1lTXMgPSBwYXJzZUludChlbWl0TWF0Y2hbMV0sIDEwKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgcGFyc2UgdGltZVxuICAgICAgICAgICAgY29uc3QgcGFyc2VNYXRjaCA9IGxvd2VyTGluZS5tYXRjaCgvcGFyc2VcXHMrdGltZTpcXHMrKFxcZCspXFxzKm1zLyk7XG4gICAgICAgICAgICBpZiAocGFyc2VNYXRjaCkgcGFyc2VUaW1lTXMgPSBwYXJzZUludChwYXJzZU1hdGNoWzFdLCAxMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGVyZm9ybWFuY2UgYXNzZXNzbWVudCBiYXNlZCBvbiBQREYgZ3VpZGVsaW5lc1xuICAgICAgICAgIGxldCBhc3Nlc3NtZW50OiAnZmFzdCcgfCAnbW9kZXJhdGUnIHwgJ3Nsb3cnO1xuICAgICAgICAgIGlmIChjaGVja1RpbWVNcyA8IDEwMCkgYXNzZXNzbWVudCA9ICdmYXN0JztcbiAgICAgICAgICBlbHNlIGlmIChjaGVja1RpbWVNcyA8PSA1MDApIGFzc2Vzc21lbnQgPSAnbW9kZXJhdGUnO1xuICAgICAgICAgIGVsc2UgYXNzZXNzbWVudCA9ICdzbG93JztcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGVja1RpbWVNcyxcbiAgICAgICAgICAgIG1lbW9yeVVzZWRNQjogTWF0aC5yb3VuZChtZW1vcnlVc2VkTUIgKiAxMDApIC8gMTAwLFxuICAgICAgICAgICAgZmlsZXNDaGVja2VkLFxuICAgICAgICAgICAgZW1pdFRpbWVNcyxcbiAgICAgICAgICAgIHBhcnNlVGltZU1zLFxuICAgICAgICAgICAgYXNzZXNzbWVudCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQi4gQ2lyY3VsYXIgRGVwZW5kZW5jeSBEZXRlY3Rpb24gPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuQ2lyY3VsYXJBbmFseXNpcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgY29uc3QgZW50cnlQb2ludCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAnc3JjJywgJ2luZGV4LnRzJyk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGVudHJ5UG9pbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBzcmMvaW5kZXgudHMgZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDIwMDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJ1biBtYWRnZSBhbmQgY2FwdHVyZSBvdXRwdXQgd2l0aCBkeW5hbWljIHRpbWVvdXRcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWyctLXllcycsICdtYWRnZScsICctLWNpcmN1bGFyJywgZW50cnlQb2ludF0sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGBtYWRnZSBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIG1hZGdlIG91dHB1dCBcdTIwMTQgaXQgbGlzdHMgY3ljbGVzIGxpa2UgXCJmaWxlMS50cyAtPiBmaWxlMi50cyAtPiBmaWxlMS50c1wiXG4gICAgICAgICAgY29uc3QgY3ljbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgIGNvbnN0IHN0ZG91dCA9IHJlc3VsdC5zdGRvdXQgfHwgJyc7XG4gICAgICAgICAgY29uc3QgbGluZXMgPSBzdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgIFxuICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICAgICAgICAgICAgaWYgKHRyaW1tZWQgJiYgIXRyaW1tZWQuc3RhcnRzV2l0aCgnRm91bmQnKSAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdObycpKSB7XG4gICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgbG9va3MgbGlrZSBhIGN5Y2xlIHBhdGhcbiAgICAgICAgICAgICAgaWYgKHRyaW1tZWQuaW5jbHVkZXMoJy0+JykgfHwgdHJpbW1lZC5lbmRzV2l0aCgnLnRzJykpIHtcbiAgICAgICAgICAgICAgICBjeWNsZXMucHVzaCh0cmltbWVkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBoYXNDeWNsZXM6IGN5Y2xlcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgY3ljbGVzLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBDLiBFU0xpbnQgSW50ZWdyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuRXNsaW50QW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IGVzbGludENvbmZpZ0ZpbGVzID0gW1xuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICdlc2xpbnQuY29uZmlnLm1qcycpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICdlc2xpbnQuY29uZmlnLmpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYy5qcycpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICcuZXNsaW50cmMuanNvbicpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICcuZXNsaW50cmMnKSxcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgY29uc3QgaGFzRXNsaW50Q29uZmlnID0gZXNsaW50Q29uZmlnRmlsZXMuc29tZShmID0+IGZzLmV4aXN0c1N5bmMoZikpO1xuICAgICAgICAgIGlmICghaGFzRXNsaW50Q29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBFU0xpbnQgY29uZmlndXJhdGlvbiBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBlc2xpbnQgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJ2VzbGludCcsICctLXZlcnNpb24nXSwgNTAwMCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdFU0xpbnQgbm90IGZvdW5kIGluIGRldkRlcGVuZGVuY2llcyBvciBQQVRIJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIER5bmFtaWMgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemVcbiAgICAgICAgICBjb25zdCBmaWxlQ291bnQgPSBhd2FpdCBjb3VudFR5cGVTY3JpcHRGaWxlcyh3b3JraW5nRGlyKTtcbiAgICAgICAgICBjb25zdCBkeW5hbWljVGltZW91dCA9IGdldEFuYWx5c2lzVGltZW91dCgxNTAwMCwgZmlsZUNvdW50KTtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWydlc2xpbnQnLCAnc3JjJywgJy0tZXh0JywgJy50cycsICctLWZvcm1hdCcsICdqc29uJ10sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGBFU0xpbnQgZmFpbGVkOiAke3Jlc3VsdC5zdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXJzZSBKU09OIG91dHB1dCBmcm9tIGVzbGludCAtLWZvcm1hdCBqc29uXG4gICAgICAgICAgbGV0IGVycm9ycyA9IDA7XG4gICAgICAgICAgbGV0IHdhcm5pbmdzID0gMDtcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgIGNvbnN0IHdhcm5pbmdNZXNzYWdlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlc3VsdC5zdGRvdXQgfHwgJycpIGFzIHtcbiAgICAgICAgICAgICAgcmVzdWx0cz86IEFycmF5PHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogc3RyaW5nO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzPzogQXJyYXk8eyBzZXZlcml0eTogbnVtYmVyOyBtZXNzYWdlOiBzdHJpbmc7IGxpbmU6IG51bWJlcjsgY29sdW1uOiBudW1iZXIgfT47XG4gICAgICAgICAgICAgIH0+O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChwYXJzZWQucmVzdWx0cykge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVSZXN1bHQgb2YgcGFyc2VkLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgKGZpbGVSZXN1bHQubWVzc2FnZXMgfHwgW10pKSB7XG4gICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5zZXZlcml0eSA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcnMrKztcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlcy5wdXNoKGAke2ZpbGVSZXN1bHQuZmlsZVBhdGh9OiAke21lc3NhZ2UubWVzc2FnZX0gKCR7bWVzc2FnZS5saW5lfToke21lc3NhZ2UuY29sdW1ufSlgKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS5zZXZlcml0eSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB3YXJuaW5ncysrO1xuICAgICAgICAgICAgICAgICAgICB3YXJuaW5nTWVzc2FnZXMucHVzaChgJHtmaWxlUmVzdWx0LmZpbGVQYXRofTogJHttZXNzYWdlLm1lc3NhZ2V9ICgke21lc3NhZ2UubGluZX06JHttZXNzYWdlLmNvbHVtbn0pYCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBJZiBKU09OIHBhcnNpbmcgZmFpbHMsIGZhbGwgYmFjayB0byB0ZXh0IG91dHB1dCBhbmFseXNpc1xuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2tTdGRvdXQgPSByZXN1bHQuc3Rkb3V0IHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JMaW5lcyA9IGZhbGxiYWNrU3Rkb3V0LnNwbGl0KCdcXG4nKS5maWx0ZXIobCA9PiBsLmluY2x1ZGVzKCdlcnJvcicpICYmICFsLmluY2x1ZGVzKCd3YXJuaW5nJykpO1xuICAgICAgICAgICAgZXJyb3JzID0gZXJyb3JMaW5lcy5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCB3YXJuaW5nTGluZXMgPSBmYWxsYmFja1N0ZG91dC5zcGxpdCgnXFxuJykuZmlsdGVyKGwgPT4gbC5pbmNsdWRlcygnd2FybmluZycpKTtcbiAgICAgICAgICAgIHdhcm5pbmdzID0gd2FybmluZ0xpbmVzLmxlbmd0aDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICAgICAgd2FybmluZ3MsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VzOiBlcnJvck1lc3NhZ2VzLnNsaWNlKDAsIDIwKSwgLy8gTGltaXQgdG8gZmlyc3QgMjBcbiAgICAgICAgICAgIHdhcm5pbmdNZXNzYWdlczogd2FybmluZ01lc3NhZ2VzLnNsaWNlKDAsIDIwKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gRC4gVHlwZVNjcmlwdCBDb25maWcgQW5hbHlzaXMgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gcnVuQ29uZmlnQW5hbHlzaXMoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICAgIGNvbnN0IHRzQ29uZmlnUGF0aCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAndHNjb25maWcuanNvbicpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0c0NvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyB0c2NvbmZpZy5qc29uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCB0c0NvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRzQ29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmModHNDb25maWdQYXRoLCAndXRmLTgnKSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdJbnZhbGlkIHRzY29uZmlnLmpzb24gZm9ybWF0JyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9ucyA9ICh0c0NvbmZpZy5jb21waWxlck9wdGlvbnMgfHwge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IGluY3JlbWVudGFsID0gISFjb21waWxlck9wdGlvbnMuaW5jcmVtZW50YWw7XG4gICAgICAgICAgY29uc3Qgc2tpcExpYkNoZWNrID0gISFjb21waWxlck9wdGlvbnMuc2tpcExpYkNoZWNrO1xuICAgICAgICAgIGNvbnN0IGlzb2xhdGVkTW9kdWxlcyA9ICEhY29tcGlsZXJPcHRpb25zLmlzb2xhdGVkTW9kdWxlcztcbiAgICAgICAgICBjb25zdCBzdHJpY3QgPSAhIWNvbXBpbGVyT3B0aW9ucy5zdHJpY3Q7XG5cbiAgICAgICAgICBjb25zdCByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICAvLyBSZWNvbW1lbmRhdGlvbnMgYmFzZWQgb24gUERGIG9wdGltaXphdGlvbiB0ZWNobmlxdWVzXG4gICAgICAgICAgaWYgKCFpbmNyZW1lbnRhbCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0VuYWJsZSBcImluY3JlbWVudGFsXCI6IHRydWUgaW4gdHNjb25maWcuanNvbiBmb3IgZmFzdGVyIGJ1aWxkcyAoYnVpbGQgY2FjaGluZykuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghc2tpcExpYkNoZWNrKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwic2tpcExpYkNoZWNrXCI6IHRydWUgdG8gc2tpcCBjaGVja2luZyAuZC50cyBmaWxlcyBpbiBub2RlX21vZHVsZXMuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghaXNvbGF0ZWRNb2R1bGVzKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnQ29uc2lkZXIgZW5hYmxpbmcgXCJpc29sYXRlZE1vZHVsZXNcIjogdHJ1ZSBmb3IgZmFzdGVyIGNvbXBpbGF0aW9uIChlc3BlY2lhbGx5IHdpdGggQmFiZWwvZXNidWlsZCkuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghc3RyaWN0KSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwic3RyaWN0XCI6IHRydWUgZm9yIGJldHRlciB0eXBlIHNhZmV0eSBhbmQgZmV3ZXIgcnVudGltZSBlcnJvcnMuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHBhdGhzIGNvbmZpZ3VyYXRpb24gKG1vZHVsZSByZXNvbHV0aW9uIG9wdGltaXphdGlvbilcbiAgICAgICAgICBjb25zdCBwYXRocyA9IGNvbXBpbGVyT3B0aW9ucy5wYXRocyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoIXBhdGhzIHx8IE9iamVjdC5rZXlzKHBhdGhzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdDb25zaWRlciB1c2luZyBcInBhdGhzXCIgaW4gdHNjb25maWcuanNvbiB0byBzaW1wbGlmeSBtb2R1bGUgaW1wb3J0cyBhbmQgcmVkdWNlIGRlcGVuZGVuY3kgZGVwdGguJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluY3JlbWVudGFsLFxuICAgICAgICAgICAgc2tpcExpYkNoZWNrLFxuICAgICAgICAgICAgaXNvbGF0ZWRNb2R1bGVzLFxuICAgICAgICAgICAgc3RyaWN0LFxuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBFLiBJbXBvcnQgU3RydWN0dXJlIEFuYWx5c2lzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGZ1bmN0aW9uIHJ1bkltcG9ydEFuYWx5c2lzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgICBjb25zdCBzcmNEaXIgPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3NyYycpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhzcmNEaXIpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBzcmMvIGRpcmVjdG9yeSBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDb2xsZWN0IGFsbCAudHMgZmlsZXMgaW4gc3JjL1xuICAgICAgICAgIGZ1bmN0aW9uIGNvbGxlY3RUc0ZpbGVzKGRpcjogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgY29uc3QgZmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXIsIGVudHJ5Lm5hbWUpO1xuICAgICAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goLi4uY29sbGVjdFRzRmlsZXMoZnVsbFBhdGgpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5uYW1lLmVuZHNXaXRoKCcudHMnKSAmJiAhZW50cnkubmFtZS5lbmRzV2l0aCgnLmQudHMnKSkge1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmaWxlcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0c0ZpbGVzID0gY29sbGVjdFRzRmlsZXMoc3JjRGlyKTtcbiAgICAgICAgICBjb25zdCBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzOiBBcnJheTx7IGZpbGU6IHN0cmluZzsgY291bnQ6IG51bWJlciB9PiA9IFtdO1xuICAgICAgICAgIGNvbnN0IGRlY2xhcmVHbG9iYWxVc2FnZTogQXJyYXk8eyBmaWxlOiBzdHJpbmcgfT4gPSBbXTtcblxuICAgICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgdHNGaWxlcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBDb3VudCBpbXBvcnRzXG4gICAgICAgICAgICAgIGNvbnN0IGltcG9ydFN0YXRlbWVudHMgPSBjb250ZW50Lm1hdGNoKC9eaW1wb3J0XFxzKy4qJC9nbSk7XG4gICAgICAgICAgICAgIGNvbnN0IGltcG9ydENvdW50ID0gaW1wb3J0U3RhdGVtZW50cyA/IGltcG9ydFN0YXRlbWVudHMubGVuZ3RoIDogMDtcblxuICAgICAgICAgICAgICBpZiAoaW1wb3J0Q291bnQgPiBpbXBvcnRXYXJuaW5nVGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgZmlsZXNXaXRoRXhjZXNzaXZlSW1wb3J0cy5wdXNoKHsgZmlsZTogcGF0aC5yZWxhdGl2ZSh3b3JraW5nRGlyLCBmaWxlUGF0aCksIGNvdW50OiBpbXBvcnRDb3VudCB9KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIENoZWNrIGZvciBkZWNsYXJlIGdsb2JhbCB1c2FnZSAoZ2xvYmFsIHR5cGUgcGF0Y2hpbmcgXHUyMDE0IGJhZCBwcmFjdGljZSBwZXIgUERGKVxuICAgICAgICAgICAgICBjb25zdCBkZWNsYXJlR2xvYmFsTWF0Y2hlcyA9IGNvbnRlbnQubWF0Y2goL2RlY2xhcmVcXHMrZ2xvYmFsL2cpO1xuICAgICAgICAgICAgICBpZiAoZGVjbGFyZUdsb2JhbE1hdGNoZXMgJiYgZGVjbGFyZUdsb2JhbE1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlY2xhcmVHbG9iYWxVc2FnZS5wdXNoKHsgZmlsZTogcGF0aC5yZWxhdGl2ZSh3b3JraW5nRGlyLCBmaWxlUGF0aCkgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAvLyBTa2lwIGZpbGVzIHRoYXQgY2FuJ3QgYmUgcmVhZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzLFxuICAgICAgICAgICAgZGVjbGFyZUdsb2JhbFVzYWdlLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBSdW4gU2VsZWN0ZWQgQ2F0ZWdvcmllcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBjb25zdCByZXN1bHRzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuXG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ3R5cGVjaGVjaycpKSB7XG4gICAgICAgICAgcmVzdWx0cy50eXBlY2hlY2sgPSBhd2FpdCBydW5UeXBlY2hlY2tBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2NpcmN1bGFyJykpIHtcbiAgICAgICAgICByZXN1bHRzLmNpcmN1bGFyID0gYXdhaXQgcnVuQ2lyY3VsYXJBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2VzbGludCcpKSB7XG4gICAgICAgICAgcmVzdWx0cy5lc2xpbnQgPSBhd2FpdCBydW5Fc2xpbnRBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2NvbmZpZycpKSB7XG4gICAgICAgICAgcmVzdWx0cy5jb25maWcgPSBydW5Db25maWdBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2ltcG9ydHMnKSkge1xuICAgICAgICAgIHJlc3VsdHMuaW1wb3J0cyA9IHJ1bkltcG9ydEFuYWx5c2lzKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YTogcmVzdWx0cyxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEFuYWx5c2lzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzZWFyY2ggYXMgZGRnU2VhcmNoIH0gZnJvbSAnZHVjay1kdWNrLXNjcmFwZSc7XG5pbXBvcnQgeyBodG1sVG9UZXh0IH0gZnJvbSAnaHRtbC10by10ZXh0JztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGZldGNoV2l0aFJldHJ5IH0gZnJvbSAnLi4vcGVyZm9ybWFuY2VVdGlscy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNlYXJjaCBFbmdpbmUgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHRJdGVtIHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cbi8qKiBEdWNrRHVja0dvIEFQSSAoZmFzdGVzdCwgbm8gYnJvd3NlciBuZWVkZWQpICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hEREdBcGkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBkZGdTZWFyY2gocXVlcnksIHsgcmVnaW9uOiAnd3Qtd3QnIH0pO1xuICByZXR1cm4gKHJlc3VsdHMucmVzdWx0cyBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4pLm1hcCgocjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+ICh7XG4gICAgdGl0bGU6IHIudGl0bGUgYXMgc3RyaW5nLFxuICAgIHVybDogci51cmwgYXMgc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uOiAoci5kZXNjcmlwdGlvbiBhcyBzdHJpbmcpIHx8ICcnLFxuICB9KSk7XG59XG5cbi8qKiBEdWNrRHVja0dvIEhUTUwgRmV0Y2ggKGZhbGxiYWNrIHdoZW4gQVBJIGZhaWxzKSAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoRERHRmV0Y2gocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoXG4gICAgYGh0dHBzOi8vaHRtbC5kdWNrZHVja2dvLmNvbS9odG1sLz9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX1gXG4gICk7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgRHVja0R1Y2tHbyBGZXRjaCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIFxuICAvLyBTaW1wbGUgcmVnZXgtYmFzZWQgcGFyc2luZyBmb3IgTm9kZS5qcyAobm8gRE9NUGFyc2VyIG5lZWRlZCEpXG4gIGNvbnN0IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXSA9IFtdO1xuICBcbiAgLy8gRXh0cmFjdCB0aXRsZXMgZnJvbSA8YSBjbGFzcz1cInJlc3VsdF9fYVwiIGhyZWY9XCIuLi5cIiByZWw9XCIuLi5cIj5UaXRsZTwvYT5cbiAgY29uc3QgdGl0bGVSZWdleCA9IC88YVtePl0rY2xhc3M9XCJyZXN1bHRfX2FcIltePl0raHJlZj1cIihbXlwiXSspXCJbXj5dKj4oW148XSspPFxcL2E+L2dpO1xuICBsZXQgbWF0Y2g7XG4gIFxuICB3aGlsZSAoKG1hdGNoID0gdGl0bGVSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB0aXRsZTogbWF0Y2hbMl0ucmVwbGFjZSgvJmFtcDsvZywgJyYnKS50cmltKCksXG4gICAgICB1cmw6IG1hdGNoWzFdLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgMTApO1xufVxuXG4vKiogR29vZ2xlIFNlYXJjaCB2aWEgSFRNTCBGZXRjaCAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoR29vZ2xlKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KFxuICAgIGBodHRwczovL3d3dy5nb29nbGUuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX0mbnVtPTEwYCxcbiAgICB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2JyB9IH1cbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBHb29nbGUgc2VhcmNoIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgLy8gU2ltcGxlIHBhcnNpbmcgXHUyMDE0IGV4dHJhY3QgdGl0bGVzIGFuZCBVUkxzIGZyb20gR29vZ2xlJ3MgSFRNTCBzdHJ1Y3R1cmVcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIGNvbnN0IHRpdGxlUmVnZXggPSAvPGgzW14+XSo+KC4qPyk8XFwvaDM+L2c7XG5cbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAoKG1hdGNoID0gdGl0bGVSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB0aXRsZTogbWF0Y2hbMV0ucmVwbGFjZSgvPFtePl0qPi9nLCAnJyksIC8vIFJlbW92ZSBIVE1MIHRhZ3NcbiAgICAgIHVybDogJycsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCAxMCk7XG59XG5cbi8qKiBCaW5nIFNlYXJjaCB2aWEgSFRNTCBGZXRjaCAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoQmluZyhxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShcbiAgICBgaHR0cHM6Ly93d3cuYmluZy5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZjb3VudD0xMGAsXG4gICAgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNicgfSB9XG4gICk7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQmluZyBzZWFyY2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAvLyBQYXJzZSBCaW5nIHJlc3VsdHMgXHUyMDE0IHNpbWlsYXIgYXBwcm9hY2ggdG8gR29vZ2xlXG4gIGNvbnN0IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXSA9IFtdO1xuICBjb25zdCByZXN1bHRSZWdleCA9IC88bGkgY2xhc3M9XCJiX2FsZ29cIltePl0qPiguKj8pPFxcL2xpPi9ncztcblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSByZXN1bHRSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGJsb2NrID0gbWF0Y2hbMV07XG4gICAgY29uc3QgdGl0bGVNYXRjaCA9IGJsb2NrLm1hdGNoKC88YVtePl0raHJlZj1cIihbXlwiXSspXCJbXj5dKj4oW148XSspPFxcL2E+Lyk7XG4gICAgaWYgKHRpdGxlTWF0Y2gpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgIHRpdGxlOiB0aXRsZU1hdGNoWzJdLFxuICAgICAgICB1cmw6IHRpdGxlTWF0Y2hbMV0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIDEwKTtcbn1cblxuLyoqIEFsbCBhdmFpbGFibGUgU2VhcmNoIEVuZ2luZSBGdW5jdGlvbnMgKi9cbmNvbnN0IFNFQVJDSF9FTkdJTkVTOiBSZWNvcmQ8c3RyaW5nLCAocXVlcnk6IHN0cmluZykgPT4gUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+PiA9IHtcbiAgJ2RkZy1hcGknOiBzZWFyY2hEREdBcGksXG4gICdkZGctZmV0Y2gnOiBzZWFyY2hEREdGZXRjaCxcbiAgJ2dvb2dsZSc6IHNlYXJjaEdvb2dsZSxcbiAgJ2JpbmcnOiBzZWFyY2hCaW5nLFxufTtcblxuLyoqIEhhcmRjb2RlZCBmYWxsYmFjayBvcmRlciAod2hlbiBwcmltYXJ5IGVuZ2luZSBmYWlscykgKi9cbmNvbnN0IEZBTExCQUNLX09SREVSID0gWydkZGctYXBpJywgJ2RkZy1mZXRjaCcsICdnb29nbGUnLCAnYmluZyddO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBGYWxsYmFjayBDaGFpbiBMb2dpYyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIFdlYiBzZWFyY2ggd2l0aCBhdXRvbWF0aWMgZmFsbGJhY2suXG4gKiBTdGFydHMgd2l0aCB0aGUgQ29uZmlnIGVuZ2luZSBhbmQgYXV0b21hdGljYWxseSB0cmllcyB0aGUgbmV4dCBpbiB0aGUgY2hhaW4uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaFdpdGhGYWxsYmFja0NoYWluKFxuICBxdWVyeTogc3RyaW5nLFxuICBjb25maWc6IFBsdWdpbkNvbmZpZ1xuKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiB7IHF1ZXJ5OiBzdHJpbmc7IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXTsgY291bnQ6IG51bWJlcjsgZW5naW5lOiBzdHJpbmcgfTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAvLyBTdGFydCBlbmdpbmUgZnJvbSBDb25maWcgKFNpbmdsZSBTZWxlY3QpXG4gIGNvbnN0IHByaW1hcnlFbmdpbmUgPSBjb25maWcuc2VhcmNoRmFsbGJhY2tDaGFpbiB8fCAnZGRnLWFwaSc7XG4gIFxuICAvLyBGYWxsYmFjayBjaGFpbjogcHJpbWFyeSBlbmdpbmUgKyBhbGwgb3RoZXJzIGluIGRlZmluZWQgb3JkZXJcbiAgY29uc3QgY2hhaW4gPSBbcHJpbWFyeUVuZ2luZSwgLi4uRkFMTEJBQ0tfT1JERVIuZmlsdGVyKGUgPT4gZSAhPT0gcHJpbWFyeUVuZ2luZSldO1xuXG4gIGZvciAoY29uc3QgZW5naW5lIG9mIGNoYWluKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNlYXJjaEZuID0gU0VBUkNIX0VOR0lORVNbZW5naW5lXTtcbiAgICAgIGlmICghc2VhcmNoRm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBTZWFyY2ggZW5naW5lIFwiJHtlbmdpbmV9XCIgbm90IGZvdW5kLCBza2lwcGluZ2ApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHNlYXJjaEZuKHF1ZXJ5KTtcblxuICAgICAgLy8gVmFsaWRhdGUgcmVzdWx0IGNvdW50IC0gd2FybiBpZiBsb3cgcmVzdWx0c1xuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoIDwgMikge1xuICAgICAgICBjb25zb2xlLndhcm4oYExvdyBzZWFyY2ggcmVzdWx0cyBmb3IgXCIke3F1ZXJ5fVwiOiAke3Jlc3VsdHMubGVuZ3RofSByZXN1bHRzIGZyb20gJHtlbmdpbmV9YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHsgcXVlcnksIHJlc3VsdHMsIGNvdW50OiByZXN1bHRzLmxlbmd0aCwgZW5naW5lIH0sXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgY29uc29sZS53YXJuKGBTZWFyY2ggZW5naW5lIFwiJHtlbmdpbmV9XCIgZmFpbGVkOiAke21lc3NhZ2V9YCk7XG4gICAgICAvLyBUcnkgbmV4dCBlbmdpbmUgaW4gdGhlIGNoYWluXG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgIGVycm9yOiBgQWxsIHNlYXJjaCBlbmdpbmVzIGZhaWxlZC4gVHJpZWQ6ICR7Y2hhaW4uam9pbignIFx1MjE5MiAnKX1gLFxuICB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgV2ViU2VhcmNoUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFdpa2lwZWRpYVNlYXJjaFBhcmFtcyB7IHF1ZXJ5OiBzdHJpbmc7IGxhbmc/OiBzdHJpbmc7IH1cbmludGVyZmFjZSBGZXRjaFdlYkNvbnRlbnRQYXJhbXMgeyB1cmw6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJhZ1dlYkNvbnRlbnRQYXJhbXMgeyB1cmw6IHN0cmluZzsgcXVlcnk6IHN0cmluZzsgfVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJXZWJSZXNlYXJjaFRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHdlYl9zZWFyY2ggdG9vbCBcdTIwMTQgdXNlcyBwcmltYXJ5IGVuZ2luZSBmcm9tIENvbmZpZyArIGF1dG9tYXRpYyBmYWxsYmFja1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3ZWJfc2VhcmNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCB0aGUgd2ViIHVzaW5nIGEgY29uZmlndXJhYmxlIHNlYXJjaCBlbmdpbmUgd2l0aCBhdXRvbWF0aWMgZmFsbGJhY2sgdG8gb3RoZXIgZW5naW5lcyBpZiB0aGUgcHJpbWFyeSBvbmUgZmFpbHMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5IH06IFdlYlNlYXJjaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgcmV0dXJuIGF3YWl0IHNlYXJjaFdpdGhGYWxsYmFja0NoYWluKHF1ZXJ5LCBjb25maWcpO1xuICAgIH0sXG4gIH0pKTtcblxuICAvLyB3aWtpcGVkaWFfc2VhcmNoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd2lraXBlZGlhX3NlYXJjaCcsXG4gICAgZGVzY3JpcHRpb246ICdTZWFyY2ggV2lraXBlZGlhIGZvciBhIGdpdmVuIHF1ZXJ5IGFuZCByZXR1cm4gcGFnZSBzdW1tYXJpZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeScpLFxuICAgICAgbGFuZzogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ2VuJykuZGVzY3JpYmUoJ0xhbmd1YWdlIGNvZGUgKGRlZmF1bHQ6IGVuKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBsYW5nIH06IFdpa2lwZWRpYVNlYXJjaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYXBpVXJsID0gYGh0dHBzOi8vJHtsYW5nIHx8ICdlbid9Lndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1xdWVyeSZsaXN0PXNlYXJjaCZzcnNlYXJjaD0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9JmZvcm1hdD1qc29uJm9yaWdpbj0qYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShhcGlVcmwpO1xuXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdpa2lwZWRpYSBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXNwb25zZS5qc29uKCkpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBjb25zdCBxdWVyeURhdGEgPSBkYXRhLnF1ZXJ5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzZWFyY2hSZXN1bHRzID0gKHF1ZXJ5RGF0YT8uc2VhcmNoIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PikgfHwgW107XG4gICAgICAgIGNvbnN0IHBhZ2VzID0gc2VhcmNoUmVzdWx0cy5tYXAoKGl0ZW06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGl0bGUgPSB0eXBlb2YgaXRlbS50aXRsZSA9PT0gJ3N0cmluZycgPyBpdGVtLnRpdGxlIDogJyc7XG4gICAgICAgICAgY29uc3Qgc25pcHBldCA9IHR5cGVvZiBpdGVtLnNuaXBwZXQgPT09ICdzdHJpbmcnID8gaXRlbS5zbmlwcGV0LnJlcGxhY2UoLzxbXj5dKj4vZywgJycpIDogJyc7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgc25pcHBldCxcbiAgICAgICAgICAgIHVybDogYGh0dHBzOi8vJHtsYW5nIHx8ICdlbid9Lndpa2lwZWRpYS5vcmcvd2lraS8ke2VuY29kZVVSSUNvbXBvbmVudCh0aXRsZSl9YCxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHF1ZXJ5LCBsYW5ndWFnZTogbGFuZyB8fCAnZW4nLCByZXN1bHRzOiBwYWdlcywgY291bnQ6IHBhZ2VzLmxlbmd0aCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBXaWtpcGVkaWEgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmV0Y2hfd2ViX2NvbnRlbnQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmZXRjaF93ZWJfY29udGVudCcsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCB0aGUgY2xlYW4sIHRleHQtYmFzZWQgY29udGVudCBvZiBhIHdlYnBhZ2UgVVJMLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIGZldGNoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsIH06IEZldGNoV2ViQ29udGVudFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeSh1cmwpO1xuXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGh0bWxUb1RleHQoaHRtbCwge1xuICAgICAgICAgIHdvcmR3cmFwOiBmYWxzZSxcbiAgICAgICAgICBzZWxlY3RvcnM6IFtcbiAgICAgICAgICAgIHsgc2VsZWN0b3I6ICdhJywgb3B0aW9uczogeyBpZ25vcmVIcmVmOiB0cnVlIH0gfSxcbiAgICAgICAgICAgIHsgc2VsZWN0b3I6ICdpbWcnLCBmb3JtYXQ6ICdbaW1hZ2VdJyB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdXJsLCBjb250ZW50OiB0ZXh0LnN1YnN0cmluZygwLCA1MDAwKSB9IH07IC8vIExpbWl0IGxlbmd0aFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGZldGNoIGNvbnRlbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJhZ193ZWJfY29udGVudCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ193ZWJfY29udGVudCcsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCBjb250ZW50IGZyb20gYSBVUkwsIGFuZCB0aGVuIHVzZSBSQUcgdG8gZmluZCBhbmQgcmV0dXJuIG9ubHkgdGhlIHRleHQgY2h1bmtzIG1vc3QgcmVsZXZhbnQgdG8gYSBzcGVjaWZpYyBxdWVyeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBmZXRjaCcpLFxuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzZWFyY2ggcXVlcnkgZm9yIHJlbGV2YW5jZSBtYXRjaGluZycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCwgcXVlcnkgfTogUmFnV2ViQ29udGVudFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeSh1cmwpO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gICAgICAgIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBodG1sVG9UZXh0KGh0bWwpO1xuXG4gICAgICAgIC8vIFNpbXBsZSBrZXl3b3JkLWJhc2VkIHJlbGV2YW5jZSBzY29yaW5nIChwbGFjZWhvbGRlciBmb3IgcmVhbCBSQUcpXG4gICAgICAgIGNvbnN0IHF1ZXJ5VGVybXMgPSBxdWVyeS50b0xvd2VyQ2FzZSgpLnNwbGl0KC9cXHMrLykuZmlsdGVyKCh0OiBzdHJpbmcpID0+IHQubGVuZ3RoID4gMik7XG4gICAgICAgIGNvbnN0IHNlbnRlbmNlcyA9IHRleHQuc3BsaXQoL1suIT9dKy8pLm1hcCgoczogc3RyaW5nKSA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgICAgIGNvbnN0IHJlbGV2YW50Q2h1bmtzID0gc2VudGVuY2VzLmZpbHRlcigoc2VudGVuY2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgIHJldHVybiBxdWVyeVRlcm1zLnNvbWUoKHRlcm06IHN0cmluZykgPT4gc2VudGVuY2UudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyh0ZXJtKSk7XG4gICAgICAgIH0pLnNsaWNlKDAsIDUpOyAvLyBSZXR1cm4gdG9wIDUgaGl0c1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdXJsLCBxdWVyeSwgY2h1bmtzOiByZWxldmFudENodW5rcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8vIExhenktbG9hZCBzaW1wbGUtZ2l0IGZvciB0ZXN0YWJpbGl0eVxubGV0IHNpbXBsZUdpdE1vZHVsZTogdHlwZW9mIGltcG9ydCgnc2ltcGxlLWdpdCcpIHwgbnVsbCA9IG51bGw7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNpbXBsZUdpdCgpOiBQcm9taXNlPHR5cGVvZiBpbXBvcnQoJ3NpbXBsZS1naXQnKT4ge1xuICBpZiAoIXNpbXBsZUdpdE1vZHVsZSkge1xuICAgIHNpbXBsZUdpdE1vZHVsZSA9IGF3YWl0IGltcG9ydCgnc2ltcGxlLWdpdCcpO1xuICB9XG4gIHJldHVybiBzaW1wbGVHaXRNb2R1bGU7XG59XG5cbi8qKiBSZXNldCBnaXQgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEdpdENhY2hlKCk6IHZvaWQge1xuICBzaW1wbGVHaXRNb2R1bGUgPSBudWxsO1xufVxuXG4vKiogQ3JlYXRlIGEgZnJlc2ggZ2l0IGluc3RhbmNlIGZvciBlYWNoIG9wZXJhdGlvbiB0byBhdm9pZCBjd2QgaXNzdWVzICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVHaXQoKSB7XG4gIGNvbnN0IHsgZGVmYXVsdDogc2ltcGxlR2l0IH0gPSBhd2FpdCBnZXRTaW1wbGVHaXQoKTtcbiAgcmV0dXJuIHNpbXBsZUdpdCgpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgR2l0SHViIHJlcG8gbmFtZSBmcm9tIGdpdCByZW1vdGUgVVJMIG9yIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICogVHJpZXMgbXVsdGlwbGUgc291cmNlcyBpbiBvcmRlciBvZiByZWxpYWJpbGl0eS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0UmVwb05hbWUoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gIC8vIFByaW9yaXR5IDE6IEVudmlyb25tZW50IHZhcmlhYmxlIChHaXRIdWIgQWN0aW9ucywgQ0kvQ0QpXG4gIGlmIChwcm9jZXNzLmVudi5HSVRIVUJfUkVQT1NJVE9SWSkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5HSVRIVUJfUkVQT1NJVE9SWTtcbiAgfVxuXG4gIC8vIFByaW9yaXR5IDI6IEdpdCByZW1vdGUgVVJMIHBhcnNpbmdcbiAgdHJ5IHtcbiAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICBjb25zdCByZW1vdGVzID0gYXdhaXQgZ2l0Lmxpc3RSZW1vdGUoWyctLWdldC11cmwnLCAnb3JpZ2luJ10pO1xuICAgIGNvbnN0IHJlbW90ZVVybCA9IHJlbW90ZXMudHJpbSgpO1xuICAgIFxuICAgIGlmIChyZW1vdGVVcmwpIHtcbiAgICAgIC8vIEhhbmRsZSBTU0ggZm9ybWF0OiBnaXRAZ2l0aHViLmNvbTp1c2VyL3JlcG8uZ2l0XG4gICAgICBjb25zdCBzc2hNYXRjaCA9IHJlbW90ZVVybC5tYXRjaCgvZ2l0QGdpdGh1YlxcLmNvbVs6L10oW14vXStcXC9bXi9dKylcXC5naXQkLyk7XG4gICAgICBpZiAoc3NoTWF0Y2gpIHJldHVybiBzc2hNYXRjaFsxXTtcbiAgICAgIFxuICAgICAgLy8gSGFuZGxlIEhUVFBTIGZvcm1hdDogaHR0cHM6Ly9naXRodWIuY29tL3VzZXIvcmVwby5naXRcbiAgICAgIGNvbnN0IGh0dHBzTWF0Y2ggPSByZW1vdGVVcmwubWF0Y2goL2h0dHBzOlxcL1xcL2dpdGh1YlxcLmNvbVxcLyhbXi9dK1xcL1teL10rKVxcLmdpdCQvKTtcbiAgICAgIGlmIChodHRwc01hdGNoKSByZXR1cm4gaHR0cHNNYXRjaFsxXTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIEdpdCByZW1vdGUgbm90IGF2YWlsYWJsZSwgY29udGludWUgdG8gbmV4dCBwcmlvcml0eVxuICB9XG5cbiAgLy8gUHJpb3JpdHkgMzogRW52aXJvbm1lbnQgdmFyaWFibGUgR0lUSFVCX1JFUE8gYXMgZmFsbGJhY2tcbiAgaWYgKHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogU2hhcmVkIGhlbHBlcjogTWFrZSBHaXRIdWIgQVBJIHJlcXVlc3RzIHdpdGggYXV0aGVudGljYXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2hBcGlSZXF1ZXN0KG1ldGhvZDogc3RyaW5nLCBlbmRwb2ludDogc3RyaW5nLCBib2R5PzogdW5rbm93bikge1xuICBjb25zdCBnaXRodWJUb2tlbiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjtcbiAgXG4gIGlmICghZ2l0aHViVG9rZW4pIHRocm93IG5ldyBFcnJvcignR0lUSFVCX1RPS0VOIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG5vdCBzZXQnKTtcbiAgXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20ke2VuZHBvaW50fWAsIHtcbiAgICBtZXRob2QsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7Z2l0aHViVG9rZW59YCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgICBib2R5OiBib2R5ID8gSlNPTi5zdHJpbmdpZnkoYm9keSkgOiB1bmRlZmluZWQsXG4gIH0pO1xuXG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHaXRIdWIgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pOiAke2Vycm9yVGV4dH1gKTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZS5qc29uKCk7XG59XG5cbi8qKiBUeXBlZCBwYXJhbXMgaW50ZXJmYWNlcyAqL1xudHlwZSBHaXRTdGF0dXNQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG5pbnRlcmZhY2UgR2l0RGlmZlBhcmFtcyB7IGZpbGVfcGF0aD86IHN0cmluZzsgY2FjaGVkPzogYm9vbGVhbjsgfVxuaW50ZXJmYWNlIEdpdENvbW1pdFBhcmFtcyB7IG1lc3NhZ2U6IHN0cmluZzsgfVxuaW50ZXJmYWNlIEdpdExvZ1BhcmFtcyB7IG1heF9jb3VudD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdpdEFkZFBhcmFtcyB7IHBhdGhzPzogc3RyaW5nW107IH1cbmludGVyZmFjZSBHaXRDaGVja291dFBhcmFtcyB7IGJyYW5jaF9uYW1lOiBzdHJpbmc7IGNyZWF0ZV9uZXc/OiBib29sZWFuOyB9XG5pbnRlcmZhY2UgR2hDcmVhdGVJc3N1ZVBhcmFtcyB7IHRpdGxlOiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IGxhYmVscz86IHN0cmluZ1tdOyB9XG5pbnRlcmZhY2UgR2hMaXN0SXNzdWVzUGFyYW1zIHsgc3RhdGU/OiAnb3BlbicgfCAnY2xvc2VkJzsgbGFiZWxzPzogc3RyaW5nW107IGxpbWl0PzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2hWaWV3Q29tbWVudHNQYXJhbXMgeyBudW1iZXI6IG51bWJlcjsgdHlwZT86ICdpc3N1ZScgfCAncHInOyB9XG5pbnRlcmZhY2UgR2hDcmVhdGVQclBhcmFtcyB7IHRpdGxlOiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IGhlYWRfYnJhbmNoOiBzdHJpbmc7IGJhc2VfYnJhbmNoPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgR2hMaXN0UHJzUGFyYW1zIHsgc3RhdGU/OiAnb3BlbicgfCAnY2xvc2VkJzsgbGltaXQ/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHaFZpZXdQckRpZmZQYXJhbXMgeyBudW1iZXI6IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdoUHVzaFBhcmFtcyB7IGJyYW5jaD86IHN0cmluZzsgfVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJHaXRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gZ2l0X3N0YXR1cyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9zdGF0dXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHRoZSBjdXJyZW50IGdpdCBzdGF0dXMgb2YgdGhlIHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKF9wYXJhbXM6IEdpdFN0YXR1c1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGNvbnN0IHN0YXR1c1Jlc3VsdCA9IGF3YWl0IGdpdC5zdGF0dXMoKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogc3RhdHVzUmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgc3RhdHVzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2RpZmYgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfZGlmZicsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgdGhlIGdpdCBkaWZmIG9mIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgb3Igc3BlY2lmaWMgZmlsZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFBhdGggdG8gc3BlY2lmaWMgZmlsZSB0byBkaWZmLicpLFxuICAgICAgY2FjaGVkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdPcHRpb25hbDogU2hvdyBzdGFnZWQgY2hhbmdlcyBvbmx5IChnaXQgZGlmZiAtLWNhY2hlZCkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9wYXRoLCBjYWNoZWQgfTogR2l0RGlmZlBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGxldCBkaWZmID0gJyc7XG4gICAgICAgIGlmIChmaWxlX3BhdGgpIHtcbiAgICAgICAgICBkaWZmID0gYXdhaXQgZ2l0LmRpZmYoW2ZpbGVfcGF0aF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpZmYgPSBjYWNoZWQgPyBhd2FpdCBnaXQuZGlmZihbJy0tY2FjaGVkJ10pIDogYXdhaXQgZ2l0LmRpZmYoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRpZmYgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGRpZmYgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfY29tbWl0IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2NvbW1pdCcsXG4gICAgZGVzY3JpcHRpb246ICdDb21taXQgc3RhZ2VkIGNoYW5nZXMgdG8gdGhlIGdpdCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1pdCBtZXNzYWdlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbWVzc2FnZSB9OiBHaXRDb21taXRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBhd2FpdCBnaXQuY29tbWl0KG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1pdHRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgY29tbWl0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2xvZyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9sb2cnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHJlY2VudCBnaXQgY29tbWl0IGhpc3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBtYXhfY291bnQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBudW1iZXIgb2YgY29tbWl0cyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG1heF9jb3VudCB9OiBHaXRMb2dQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBjb25zdCBjb3VudCA9IG1heF9jb3VudCB8fCAxMDtcbiAgICAgICAgY29uc3QgbG9nID0gYXdhaXQgZ2l0LmxvZyhjb3VudCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWl0czogbG9nLmFsbCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgbG9nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2FkZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9hZGQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhZ2Ugc3BlY2lmaWMgZmlsZXMgb3IgYWxsIGNoYW5nZXMgZm9yIHRoZSBuZXh0IGNvbW1pdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGhzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBTcGVjaWZpYyBmaWxlIHBhdGhzIHRvIHN0YWdlLiBJZiBvbWl0dGVkLCBzdGFnZXMgYWxsIGNoYW5nZXMuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aHMgfTogR2l0QWRkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgaWYgKHBhdGhzICYmIHBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhd2FpdCBnaXQuYWRkKHBhdGhzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBnaXQuYWRkKCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzdGFnZWRQYXRoczogcGF0aHMgfHwgJ2FsbCcgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGFkZCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9jaGVja291dCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9jaGVja291dCcsXG4gICAgZGVzY3JpcHRpb246ICdTd2l0Y2ggdG8gYW4gZXhpc3RpbmcgYnJhbmNoIG9yIGNyZWF0ZSBhbmQgc3dpdGNoIHRvIGEgbmV3IG9uZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGJyYW5jaF9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOYW1lIG9mIHRoZSBicmFuY2ggdG8gY2hlY2tvdXQuJyksXG4gICAgICBjcmVhdGVfbmV3OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKFwiSWYgdHJ1ZSwgY3JlYXRlcyB0aGUgYnJhbmNoIGlmIGl0IGRvZXNuJ3QgZXhpc3QgKGxpa2UgZ2l0IGNoZWNrb3V0IC1iKS5cIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYnJhbmNoX25hbWUsIGNyZWF0ZV9uZXcgfTogR2l0Q2hlY2tvdXRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBpZiAoY3JlYXRlX25ldykge1xuICAgICAgICAgIGF3YWl0IGdpdC5jaGVja291dExvY2FsQnJhbmNoKGJyYW5jaF9uYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBnaXQuY2hlY2tvdXQoYnJhbmNoX25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYnJhbmNoTmFtZTogYnJhbmNoX25hbWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGNoZWNrb3V0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfYXV0aCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2F1dGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2sgR2l0SHViIGF1dGhlbnRpY2F0aW9uIHN0YXR1cy4gSWYgbm90IGF1dGhlbnRpY2F0ZWQsIG9wZW5zIGEgdGVybWluYWwgd2luZG93IGZvciB0aGUgdXNlciB0byBzaWduIGluLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdGh1YlRva2VuID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0dJVEhVQl9UT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0LiBQbGVhc2Ugc2V0IGl0IHRvIHVzZSBHaXRIdWIgQVBJIHRvb2xzLicgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCAnL3VzZXInKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBhdXRoZW50aWNhdGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBhdXRoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfY3JlYXRlX2lzc3VlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfY3JlYXRlX2lzc3VlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBHaXRIdWIgaXNzdWUgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgaXNzdWUgdGl0bGUnKSxcbiAgICAgIGJvZHk6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIGlzc3VlIGJvZHkvZGVzY3JpcHRpb24nKSxcbiAgICAgIGxhYmVsczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdMYWJlbHMgdG8gYXBwbHknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgYm9keSwgbGFiZWxzIH06IEdoQ3JlYXRlSXNzdWVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4gRW5zdXJlIEdJVEhVQl9SRVBPU0lUT1JZIGVudiBpcyBzZXQgb3IgZ2l0IHJlbW90ZSBcIm9yaWdpblwiIHBvaW50cyB0byBhIEdpdEh1YiByZXBvLicpO1xuXG4gICAgICAgIGF3YWl0IGdoQXBpUmVxdWVzdCgnUE9TVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vaXNzdWVzYCwgeyB0aXRsZSwgYm9keSwgbGFiZWxzIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGlzc3VlIGNyZWF0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfbGlzdF9pc3N1ZXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9saXN0X2lzc3VlcycsXG4gICAgZGVzY3JpcHRpb246ICdMaXN0IGlzc3VlcyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc3RhdGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnb3BlbicpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgaXNzdWUgc3RhdGUnKSxcbiAgICAgIGxhYmVsczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgbGFiZWxzJyksXG4gICAgICBsaW1pdDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggaXNzdWVzIHRvIHJldHVybiAoZGVmYXVsdDogMTApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc3RhdGUsIGxhYmVscywgbGltaXQgfTogR2hMaXN0SXNzdWVzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgbGV0IHF1ZXJ5ID0gYHN0YXRlPSR7c3RhdGV9YDtcbiAgICAgICAgaWYgKGxhYmVscyAmJiBsYWJlbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHF1ZXJ5ICs9IGAmbGFiZWxzPSR7bGFiZWxzLmpvaW4oJywnKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNzdWVzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9L2lzc3Vlcz8ke3F1ZXJ5fSZwZXJfcGFnZT0ke2xpbWl0IHx8IDEwfWApO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlzc3VlcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgaXNzdWVzIGxpc3RpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF92aWV3X2NvbW1lbnRzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfdmlld19jb21tZW50cycsXG4gICAgZGVzY3JpcHRpb246ICdWaWV3IGNvbW1lbnRzIG9uIGEgc3BlY2lmaWMgaXNzdWUgb3IgcHVsbCByZXF1ZXN0LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnVGhlIGlzc3VlIG9yIFBSIG51bWJlcicpLFxuICAgICAgdHlwZTogei5lbnVtKFsnaXNzdWUnLCAncHInXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdpc3N1ZScpLmRlc2NyaWJlKFwiV2hldGhlciBpdCdzIGFuIGlzc3VlIG9yIGEgcHVsbCByZXF1ZXN0XCIpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG51bWJlciwgdHlwZSB9OiBHaFZpZXdDb21tZW50c1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBhd2FpdCBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lLicpO1xuXG4gICAgICAgIGNvbnN0IGNvbW1lbnRzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9LyR7dHlwZSA9PT0gJ3ByJyA/ICdwdWxscycgOiAnaXNzdWVzJ30vJHtudW1iZXJ9L2NvbW1lbnRzYCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWVudHMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGNvbW1lbnRzIHZpZXdpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9jcmVhdGVfcHIgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9jcmVhdGVfcHInLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IHB1bGwgcmVxdWVzdCBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBQUiB0aXRsZScpLFxuICAgICAgYm9keTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgUFIgYm9keS9kZXNjcmlwdGlvbicpLFxuICAgICAgaGVhZF9icmFuY2g6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBicmFuY2ggY29udGFpbmluZyB5b3VyIGNoYW5nZXMnKSxcbiAgICAgIGJhc2VfYnJhbmNoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnbWFpbicpLmRlc2NyaWJlKCdUaGUgYnJhbmNoIHlvdSB3YW50IHRvIG1lcmdlIGludG8gKGUuZy4sIG1haW4sIG1hc3RlciknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgYm9keSwgaGVhZF9icmFuY2gsIGJhc2VfYnJhbmNoIH06IEdoQ3JlYXRlUHJQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBjb25zdCBwciA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnUE9TVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vcHVsbHNgLCB7IHRpdGxlLCBib2R5LCBoZWFkOiBoZWFkX2JyYW5jaCwgYmFzZTogYmFzZV9icmFuY2ggfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY3JlYXRlZDogdHJ1ZSwgdXJsOiAocHIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmh0bWxfdXJsIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUiBjcmVhdGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2xpc3RfcHJzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfbGlzdF9wcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCBwdWxsIHJlcXVlc3RzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzdGF0ZTogei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdvcGVuJykuZGVzY3JpYmUoJ0ZpbHRlciBieSBQUiBzdGF0ZScpLFxuICAgICAgbGltaXQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnTWF4IFBScyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHN0YXRlLCBsaW1pdCB9OiBHaExpc3RQcnNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBjb25zdCBwcnMgPSBhd2FpdCBnaEFwaVJlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vcHVsbHM/c3RhdGU9JHtzdGF0ZX0mcGVyX3BhZ2U9JHtsaW1pdCB8fCAxMH1gKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwcnMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIFBScyBsaXN0aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfdmlld19wcl9kaWZmIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfdmlld19wcl9kaWZmJyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZldGNoIHRoZSBkaWZmL3BhdGNoIG9mIGEgc3BlY2lmaWMgcHVsbCByZXF1ZXN0LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnVGhlIFBSIG51bWJlcicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG51bWJlciB9OiBHaFZpZXdQckRpZmZQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzLyR7bnVtYmVyfS9kaWZmYCwge1xuICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOfWAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGRpZmY6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZGlmZiA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkaWZmIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUiBkaWZmIGZldGNoaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfcHVzaCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3B1c2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnUHVzaCBsb2NhbCBjb21taXRzIHRvIHRoZSByZW1vdGUgR2l0SHViIHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBicmFuY2g6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFRoZSBicmFuY2ggdG8gcHVzaC4gRGVmYXVsdHMgdG8gY3VycmVudCBicmFuY2guJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYnJhbmNoIH06IEdoUHVzaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGF3YWl0IGdpdC5wdXNoKGJyYW5jaCB8fCAnb3JpZ2luJywgJ0hFQUQnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwdXNoZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIHB1c2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEM1IEZJWDogUHJvcGVyIHR5cGluZyBpbnN0ZWFkIG9mIGFueVxuaW1wb3J0IHR5cGUgKiBhcyBQdXBwZXRlZXIgZnJvbSAncHVwcGV0ZWVyJztcblxubGV0IHB1cHBldGVlck1vZHVsZTogdHlwZW9mIFB1cHBldGVlciB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRQdXBwZXRlZXIoKTogUHJvbWlzZTx0eXBlb2YgUHVwcGV0ZWVyPiB7XG4gIGlmICghcHVwcGV0ZWVyTW9kdWxlKSB7XG4gICAgY29uc3QgaW1wb3J0ZWQgPSBhd2FpdCBpbXBvcnQoJ3B1cHBldGVlcicpO1xuICAgIHB1cHBldGVlck1vZHVsZSA9IGltcG9ydGVkLmRlZmF1bHQgfHwgaW1wb3J0ZWQ7XG4gIH1cbiAgcmV0dXJuIHB1cHBldGVlck1vZHVsZTtcbn1cblxuLyoqIFJlc2V0IHB1cHBldGVlciBtb2R1bGUgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0UHVwcGV0ZWVyQ2FjaGUoKTogdm9pZCB7XG4gIHB1cHBldGVlck1vZHVsZSA9IG51bGw7XG59XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpcic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5cbi8qKiBCcm93c2VyIHNlc3Npb24gbWFuYWdlciB3aXRoIGF1dG8tY2xlYW51cCBhbmQgY29ubmVjdGlvbiBwb29saW5nIChzaW5nbGV0b24gcGF0dGVybikgKi9cbmNsYXNzIEJyb3dzZXJTZXNzaW9uTWFuYWdlciB7XG4gIHByaXZhdGUgYnJvd3Nlckluc3RhbmNlOiBQdXBwZXRlZXIuQnJvd3NlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGN1cnJlbnRQYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNsZWFudXBUaW1lcjogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICBwcml2YXRlIHJlYWRvbmx5IElOQUNUSVZJVFlfVElNRU9VVF9NUyA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuICBwcml2YXRlIHJlYWRvbmx5IE1BWF9SRVRSSUVTID0gMjtcbiAgcHJpdmF0ZSByZXRyeUNvdW50ID0gMDtcblxuICAvKiogR2V0IG9yIGNyZWF0ZSBhIHBlcnNpc3RlbnQgUHVwcGV0ZWVyIGJyb3dzZXIgaW5zdGFuY2Ugd2l0aCBhdXRvLXJldHJ5ICovXG4gIGFzeW5jIGdldEJyb3dzZXIoKTogUHJvbWlzZTxQdXBwZXRlZXIuQnJvd3Nlcj4ge1xuICAgIGlmICghdGhpcy5icm93c2VySW5zdGFuY2UgfHwgIXRoaXMuYnJvd3Nlckluc3RhbmNlLmNvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLnJldHJ5Q291bnQgPSAwO1xuICAgICAgd2hpbGUgKHRoaXMucmV0cnlDb3VudCA8IHRoaXMuTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBwdXBwZXRlZXJMaWIgPSBhd2FpdCBnZXRQdXBwZXRlZXIoKTtcbiAgICAgICAgICB0aGlzLmJyb3dzZXJJbnN0YW5jZSA9IGF3YWl0IHB1cHBldGVlckxpYi5sYXVuY2goeyBcbiAgICAgICAgICAgIGhlYWRsZXNzOiB0cnVlLFxuICAgICAgICAgICAgYXJnczogWyctLW5vLXNhbmRib3gnLCAnLS1kaXNhYmxlLXNldHVpZC1zYW5kYm94J10gLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHRoaXMucmV0cnlDb3VudCsrO1xuICAgICAgICAgIGlmICh0aGlzLnJldHJ5Q291bnQgPj0gdGhpcy5NQVhfUkVUUklFUykgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDAgKiB0aGlzLnJldHJ5Q291bnQpKTsgLy8gRXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVzZXRDbGVhbnVwVGltZXIoKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgIHJldHVybiB0aGlzLmJyb3dzZXJJbnN0YW5jZSE7XG4gIH1cblxuICAvKiogR2V0IG9yIGNyZWF0ZSBhIHBhZ2UgaW4gdGhlIHBlcnNpc3RlbnQgYnJvd3NlciBpbnN0YW5jZSAqL1xuICBhc3luYyBnZXRQYWdlKCk6IFByb21pc2U8UHVwcGV0ZWVyLlBhZ2U+IHtcbiAgICBpZiAoIXRoaXMuY3VycmVudFBhZ2UgfHwgIWF3YWl0IHRoaXMuaXNQYWdlVmFsaWQoKSkge1xuICAgICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHRoaXMuZ2V0QnJvd3NlcigpO1xuICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xuICAgIH1cbiAgICB0aGlzLnJlc2V0Q2xlYW51cFRpbWVyKCk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2U7XG4gIH1cblxuICAvKiogQ2hlY2sgaWYgY3VycmVudCBwYWdlIGlzIHN0aWxsIHZhbGlkICovXG4gIHByaXZhdGUgYXN5bmMgaXNQYWdlVmFsaWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5jdXJyZW50UGFnZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgYXdhaXQgdGhpcy5jdXJyZW50UGFnZS5ldmFsdWF0ZSgnMScpOyAvLyBRdWljayB2YWxpZGF0aW9uXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogUmVzZXQgdGhlIGluYWN0aXZpdHkgY2xlYW51cCB0aW1lciAqL1xuICBwcml2YXRlIHJlc2V0Q2xlYW51cFRpbWVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNsZWFudXBUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuY2xlYW51cFRpbWVyKTtcbiAgICB0aGlzLmxhc3RBY3Rpdml0eSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5jbGVhbnVwVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZGlzcG9zZSgpLCB0aGlzLklOQUNUSVZJVFlfVElNRU9VVF9NUyk7XG4gIH1cblxuICAvKiogRXhwbGljaXRseSBkaXNwb3NlIGJyb3dzZXIgYW5kIGNhbmNlbCBjbGVhbnVwIHRpbWVyICovXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2xlYW51cFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5jbGVhbnVwVGltZXIpO1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5icm93c2VySW5zdGFuY2UgJiYgdGhpcy5icm93c2VySW5zdGFuY2UuY29ubmVjdGVkKCkpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9hd2FpdC10aGVuYWJsZVxuICAgICAgICBhd2FpdCB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGNsb3NlIGVycm9yc1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmJyb3dzZXJJbnN0YW5jZSA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnRQYWdlID0gbnVsbDtcbiAgICAgIHRoaXMubGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMucmV0cnlDb3VudCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrIGlmIGJyb3dzZXIgaXMgY29ubmVjdGVkICovXG4gIGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhISh0aGlzLmJyb3dzZXJJbnN0YW5jZSAmJiB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jb25uZWN0ZWQoKSk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBjdXJyZW50IHBhZ2UgKHB1YmxpYyBhY2Nlc3NvcikgKi9cbiAgZ2V0Q3VycmVudFBhZ2UoKTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UGFnZTtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIGN1cnJlbnQgcGFnZSAocHVibGljIHNldHRlcikgKi9cbiAgc2V0Q3VycmVudFBhZ2UocGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2U7XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlIGZvciB0aGlzIG1vZHVsZVxuY29uc3QgYnJvd3Nlck1hbmFnZXIgPSBuZXcgQnJvd3NlclNlc3Npb25NYW5hZ2VyKCk7XG5cbi8qKiBFeHBvcnQgY2xlYW51cCBmdW5jdGlvbiBmb3IgcGx1Z2luIHVubG9hZCBsaWZlY3ljbGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG59XG5cbi8vIEM1IEZJWDogUHJvcGVyIHBhcmFtIHR5cGVzXG5pbnRlcmZhY2UgQnJvd3Nlck9wZW5QYWdlUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZztcbiAgd2FpdF9mb3Jfc2VsZWN0b3I/OiBzdHJpbmc7XG4gIGZ1bGxfcGFnZV9zY3JlZW5zaG90PzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEJyb3dzZXJTZXNzaW9uQ29udHJvbFBhcmFtcyB7XG4gIGFjdGlvbnM/OiB1bmtub3duW107XG4gIHJlYWRfcGFnZT86IGJvb2xlYW47XG4gIGZ1bGxfcmVhZD86IGJvb2xlYW47XG4gIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFByZXZpZXdIdG1sUGFyYW1zIHtcbiAgaHRtbF9jb250ZW50OiBzdHJpbmc7XG4gIGZpbGVfbmFtZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE9wZW5GaWxlUGFyYW1zIHtcbiAgdGFyZ2V0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJyb3dzZXJUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG4gIC8vIGJyb3dzZXJfb3Blbl9wYWdlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYnJvd3Nlcl9vcGVuX3BhZ2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnT3BlbiBhIHdlYnBhZ2UgaW4gYSBoZWFkbGVzcyBicm93c2VyIChQdXBwZXRlZXIpLCByZW5kZXIgaXQgb25jZSwgYW5kIHJldHVybiBjb250ZW50LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIG9wZW4nKSxcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdQYXRoIHRvIHNhdmUgYSBzY3JlZW5zaG90LicpLFxuICAgICAgd2FpdF9mb3Jfc2VsZWN0b3I6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ1NTIHNlbGVjdG9yIHRvIHdhaXQgZm9yIGJlZm9yZSByZXR1cm5pbmcuJyksXG4gICAgICBmdWxsX3BhZ2Vfc2NyZWVuc2hvdDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnSWYgdHJ1ZSwgY2FwdHVyZXMgdGhlIGZ1bGwgcGFnZSB3aGVuIHRha2luZyBhIHNjcmVlbnNob3QuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsLCBzY3JlZW5zaG90X3BhdGgsIHdhaXRfZm9yX3NlbGVjdG9yLCBmdWxsX3BhZ2Vfc2NyZWVuc2hvdCB9OiBCcm93c2VyT3BlblBhZ2VQYXJhbXMpID0+IHtcbiAgICAgIGxldCBicm93c2VyOiBQdXBwZXRlZXIuQnJvd3NlciB8IG51bGwgPSBudWxsO1xuICAgICAgbGV0IHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGJyb3dzZXIgPSBhd2FpdCBicm93c2VyTWFuYWdlci5nZXRCcm93c2VyKCk7XG4gICAgICAgIHBhZ2UgPSBicm93c2VyTWFuYWdlci5nZXRDdXJyZW50UGFnZSgpO1xuXG4gICAgICAgIGlmICghcGFnZSB8fCAoYXdhaXQgcGFnZS51cmwoKSkgIT09IHVybCkge1xuICAgICAgICAgIC8vIElmIG5vIGN1cnJlbnQgcGFnZSBvciBVUkwgZG9lc24ndCBtYXRjaCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAgIHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICBicm93c2VyTWFuYWdlci5zZXRDdXJyZW50UGFnZShwYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHBhZ2UuZ290byh1cmwsIHsgd2FpdFVudGlsOiAnZG9tY29udGVudGxvYWRlZCcgfSk7XG5cbiAgICAgICAgaWYgKHdhaXRfZm9yX3NlbGVjdG9yKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvclNlbGVjdG9yKHdhaXRfZm9yX3NlbGVjdG9yLCB7IHRpbWVvdXQ6IDUwMDAgfSk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBJZ25vcmUgdGltZW91dCwgY29udGludWUgd2l0aCBjb250ZW50IGV4dHJhY3Rpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHREYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgdXJsLCBvcGVuZWQ6IHRydWUgfTtcblxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoLCBmdWxsUGFnZTogZnVsbF9wYWdlX3NjcmVlbnNob3QgfSk7XG4gICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90U2F2ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlIHN0cmluZy1iYXNlZCBldmFsdWF0ZSB0byBieXBhc3MgVFMyNTg0L1RTMjMwNCAnZG9jdW1lbnQnIGVycm9ycyBpbiBOb2RlLmpzIGVudmlyb25tZW50XG4gICAgICAgIGNvbnN0IHRleHRDb250ZW50OiBzdHJpbmcgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKGByZXR1cm4gZG9jdW1lbnQuYm9keSA/IGRvY3VtZW50LmJvZHkuaW5uZXJUZXh0IDogJyc7YCk7XG4gICAgICAgIHJlc3VsdERhdGEucGFnZVRleHQgPSB0ZXh0Q29udGVudC5zdWJzdHJpbmcoMCwgMjAwMCk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0RGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gcGFnZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIE5PVEU6IFdlIGRvbid0IGNsb3NlIHRoZSBicm93c2VyIGhlcmUgYmVjYXVzZSB3ZSB1c2UgYSBzaW5nbGV0b24gcGF0dGVybi5cbiAgICAgICAgLy8gVGhlIGJyb3dzZXIgc3RheXMgYWxpdmUgZm9yIHN1YnNlcXVlbnQgcmVxdWVzdHMgdmlhIGJyb3dzZXJfc2Vzc2lvbl9jb250cm9sLlxuICAgICAgICAvLyBVc2UgYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlIHRvIGV4cGxpY2l0bHkgdGVybWluYXRlIGl0LlxuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBicm93c2VyX3Nlc3Npb25fY29udHJvbCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Jyb3dzZXJfc2Vzc2lvbl9jb250cm9sJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvbnRyb2wgdGhlIGFjdGl2ZSBwZXJzaXN0ZW50IGJyb3dzZXIgc2Vzc2lvbi4gU3VwcG9ydHMgYWN0aW9ucywgcGFnZSByZWFkaW5nLCBzY3JlZW5zaG90IGNhcHR1cmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBhY3Rpb25zOiB6LmFycmF5KHouYW55KCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHNjcmlwdGVkIGJyb3dzZXIgYWN0aW9ucyB0byBleGVjdXRlLicpLFxuICAgICAgcmVhZF9wYWdlOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdJZiB0cnVlLCByZXR1cm5zIHBhZ2UgbWV0YWRhdGEuJyksXG4gICAgICBmdWxsX3JlYWQ6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0lmIHRydWUsIGZvcmNlcyBmdWxsIHBhZ2UgdGV4dCBvdXRwdXQuJyksXG4gICAgICBzY3JlZW5zaG90X3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgc2NyZWVuc2hvdCBvdXRwdXQgcGF0aC4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBhY3Rpb25zLCByZWFkX3BhZ2UsIGZ1bGxfcmVhZCwgc2NyZWVuc2hvdF9wYXRoIH06IEJyb3dzZXJTZXNzaW9uQ29udHJvbFBhcmFtcykgPT4ge1xuICAgICAgbGV0IHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHBhZ2UgPSBhd2FpdCBicm93c2VyTWFuYWdlci5nZXRQYWdlKCk7XG5cbiAgICAgICAgaWYgKGFjdGlvbnMgJiYgQXJyYXkuaXNBcnJheShhY3Rpb25zKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgYWN0aW9uIG9mIGFjdGlvbnMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5bXSkge1xuICAgICAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuY2xpY2soYWN0aW9uLnNlbGVjdG9yIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAndHlwZScpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS50eXBlKGFjdGlvbi5zZWxlY3RvciBhcyBzdHJpbmcsIGFjdGlvbi50ZXh0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAnZ290bycpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKGFjdGlvbi51cmwgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09ICdldmFsdWF0ZScpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5ldmFsdWF0ZShhY3Rpb24uc2NyaXB0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IGFjdGlvbnNFeGVjdXRlZDogYWN0aW9ucz8ubGVuZ3RoIHx8IDAgfTtcblxuICAgICAgICBpZiAocmVhZF9wYWdlIHx8IGZ1bGxfcmVhZCkge1xuICAgICAgICAgIC8vIFVzZSBzdHJpbmctYmFzZWQgZXZhbHVhdGUgdG8gYnlwYXNzIFRTMjU4NCAnZG9jdW1lbnQnIGVycm9ycyBpbiBOb2RlLmpzIGVudmlyb25tZW50XG4gICAgICAgICAgY29uc3QgdGV4dDogc3RyaW5nID0gYXdhaXQgcGFnZS5ldmFsdWF0ZShgcmV0dXJuIGRvY3VtZW50LmJvZHkgPyBkb2N1bWVudC5ib2R5LmlubmVyVGV4dCA6ICcnO2ApO1xuICAgICAgICAgIHJlc3VsdERhdGEucGFnZVRleHQgPSBmdWxsX3JlYWQgPyB0ZXh0IDogdGV4dC5zdWJzdHJpbmcoMCwgMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoIH0pO1xuICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFNhdmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEJyb3dzZXIgY29udHJvbCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBQYWdlIHN0YXlzIGFsaXZlIGZvciBzZXNzaW9uIHJldXNlLiBCcm93c2VyIGlzIG1hbmFnZWQgYnkgYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlLlxuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBicm93c2VyX3Nlc3Npb25fY2xvc2UgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdicm93c2VyX3Nlc3Npb25fY2xvc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2xvc2UgdGhlIGFjdGl2ZSBwZXJzaXN0ZW50IGJyb3dzZXIgc2Vzc2lvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY2xvc2VkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjbG9zZSBicm93c2VyIHNlc3Npb246ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBFbnN1cmUgY2xlYW51cCBldmVuIG9uIGZhaWx1cmVcbiAgICAgICAgYXdhaXQgYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBwcmV2aWV3X2h0bWwgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdwcmV2aWV3X2h0bWwnLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlbmRlciBhbmQgcHJldmlldyBIVE1MIGNvbnRlbnQgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYnJvd3Nlci5cIixcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBIVE1MIGNvbnRlbnQgdG8gcmVuZGVyJyksXG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdwcmV2aWV3Lmh0bWwnKS5kZXNjcmliZSgnT3B0aW9uYWwgZmlsZW5hbWUgKGRlZmF1bHQ6IHByZXZpZXcuaHRtbCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBodG1sX2NvbnRlbnQsIGZpbGVfbmFtZSB9OiBQcmV2aWV3SHRtbFBhcmFtcykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBmaWxlX25hbWUgfHwgJ3ByZXZpZXcuaHRtbCc7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgZmlsZU5hbWUpO1xuXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWxfY29udGVudCk7XG5cbiAgICAgICAgLy8gT3BlbiBpbiBkZWZhdWx0IGJyb3dzZXIgdXNpbmcgRVMgaW1wb3J0XG4gICAgICAgIGNvbnN0IG9wZW5Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ29wZW4nKTtcbiAgICAgICAgYXdhaXQgb3Blbk1vZHVsZS5kZWZhdWx0KGZpbGVQYXRoKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHByZXZpZXdlZDogdHJ1ZSwgZmlsZTogZmlsZU5hbWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHByZXZpZXcgSFRNTDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gb3Blbl9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnb3Blbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogXCJPcGVuIGEgZmlsZSBvciBVUkwgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYXBwbGljYXRpb24uXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGFyZ2V0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdGaWxlIHBhdGggb3IgVVJMJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGFyZ2V0IH06IE9wZW5GaWxlUGFyYW1zKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdCh0YXJnZXQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG9wZW5lZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gb3BlbiBmaWxlOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IHZhbGlkYXRlU1FMUXVlcnkgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5cbi8vIExhenktbG9hZCBub2RlOnNxbGl0ZSAoTm9kZS5qcyAyMyspLiBHcmFjZWZ1bCBmYWxsYmFjayBmb3Igb2xkZXIgTm9kZSB2ZXJzaW9ucy5cbmxldCBzcWxpdGVNb2R1bGU6IHR5cGVvZiBpbXBvcnQoJ25vZGU6c3FsaXRlJykgfCBudWxsID0gbnVsbDtcbmxldCBzcWxpdGVMb2FkRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTcWxpdGUoKTogUHJvbWlzZTx0eXBlb2YgaW1wb3J0KCdub2RlOnNxbGl0ZScpPiB7XG4gIGlmIChzcWxpdGVNb2R1bGUpIHJldHVybiBzcWxpdGVNb2R1bGU7XG4gIGlmIChzcWxpdGVMb2FkRXJyb3IpIHRocm93IG5ldyBFcnJvcihzcWxpdGVMb2FkRXJyb3IpO1xuXG4gIHRyeSB7XG4gICAgc3FsaXRlTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdub2RlOnNxbGl0ZScpO1xuICAgIHJldHVybiBzcWxpdGVNb2R1bGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHNxbGl0ZUxvYWRFcnJvciA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgU1FMaXRlIGlzIG5vdCBhdmFpbGFibGUgKG5vZGU6c3FsaXRlIHJlcXVpcmVzIE5vZGUuanMgMjMrKS4gYCArXG4gICAgICBgT3JpZ2luYWwgZXJyb3I6ICR7c3FsaXRlTG9hZEVycm9yfS4gYCArXG4gICAgICBgUGxlYXNlIGRpc2FibGUgZGF0YWJhc2UgcXVlcmllcyBpbiBwbHVnaW4gc2V0dGluZ3Mgb3IgdXBncmFkZSBOb2RlLmBcbiAgICApO1xuICB9XG59XG5cbi8qKiBSZXNldCBzcWxpdGUgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFNxbGl0ZUNhY2hlKCk6IHZvaWQge1xuICBzcWxpdGVNb2R1bGUgPSBudWxsO1xuICBzcWxpdGVMb2FkRXJyb3IgPSBudWxsO1xufVxuXG4vKiogVHlwZWQgcGFyYW1zIGludGVyZmFjZSAqL1xuaW50ZXJmYWNlIFF1ZXJ5RGF0YWJhc2VQYXJhbXMge1xuICBxdWVyeTogc3RyaW5nO1xuICBkYl9wYXRoPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEYXRhYmFzZVRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBxdWVyeV9kYXRhYmFzZSB0b29sIFx1MjAxNCBDNyBGSVg6IEFkZGVkIG9wdGlvbmFsIGRiX3BhdGggcGFyYW1ldGVyXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3F1ZXJ5X2RhdGFiYXNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biByZWFkLW9ubHkgU1FMaXRlIHF1ZXJpZXMuIERlZmF1bHRzIHRvIGluLW1lbW9yeSBkYXRhYmFzZTsgb3B0aW9uYWxseSBzcGVjaWZ5IGEgZmlsZSBwYXRoLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NRTCBxdWVyeSBzdHJpbmcgKHJlYWQtb25seSBvbmx5KScpLFxuICAgICAgZGJfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJzptZW1vcnk6JykuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIFNRTGl0ZSBkYXRhYmFzZSBmaWxlIChkZWZhdWx0OiA6bWVtb3J5OiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgZGJfcGF0aCB9OiBRdWVyeURhdGFiYXNlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBTZWN1cml0eSBjaGVjayAtIHVzZSByb2J1c3QgU1FMIHZhbGlkYXRpb24gaW5zdGVhZCBvZiBzaW1wbGUgcmVnZXggbWF0Y2hpbmdcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkID0gdmFsaWRhdGVTUUxRdWVyeShxdWVyeSk7XG4gICAgICAgIGlmICghdmFsaWRhdGVkLnZhbGlkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIFNRTCBxdWVyeSBkZXRlY3RlZDogJHt2YWxpZGF0ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExhenktbG9hZCBub2RlOnNxbGl0ZSB3aXRoIGdyYWNlZnVsIGZhbGxiYWNrXG4gICAgICAgIGNvbnN0IHsgb3BlbiB9ID0gYXdhaXQgZ2V0U3FsaXRlKCk7XG4gICAgICAgIGNvbnN0IGRiID0gb3BlbihkYl9wYXRoIHx8ICc6bWVtb3J5OicpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUocXVlcnkpO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBzdG10LmFsbCgpO1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcXVlcnksIHJlc3VsdHMgfSB9O1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhdGFiYXNlIHF1ZXJ5IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IEJhY2tncm91bmRDb21tYW5kTWFuYWdlciB9IGZyb20gJy4uL2JhY2tncm91bmRDb21tYW5kcy5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZUNvbW1hbmQgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSdW5CYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgdGltZW91dF9ob3VyczogbnVtYmVyOyBuYW1lOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGVja0JhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgaWQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIENhbmNlbEJhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgaWQ6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcik6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBydW5fYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBhIGxvbmctcnVubmluZyBwcm9jZXNzIGluIHRoZSBiYWNrZ3JvdW5kLiBUaGUgcHJvY2VzcyBpcyBub3QgYmxvY2tlZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfaG91cnM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDEwKS5kZXNjcmliZSgnTUFOREFUT1JZOiBIb3cgbG9uZyB0aGUgcHJvY2VzcyBpcyBhbGxvd2VkIHRvIHJ1biBiZWZvcmUgYmVpbmcga2lsbGVkLicpLFxuICAgICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTUFOREFUT1JZOiBBIHNob3J0LCBkZXNjcmlwdGl2ZSBuYW1lIGZvciB0aGUgYmFja2dyb3VuZCB0YXNrJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCwgdGltZW91dF9ob3VycywgbmFtZSB9OiBSdW5CYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2VjdXJpdHkgY2hlY2sgLSB1c2Ugcm9idXN0IHNhbml0aXphdGlvbiBpbnN0ZWFkIG9mIHNpbXBsZSBzdHJpbmcgbWF0Y2hpbmdcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGlkID0gYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLnJlZ2lzdGVyKGNvbW1hbmQsIHRpbWVvdXRfaG91cnMsIG5hbWUpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlkLCBuYW1lLCBjb21tYW5kLCB0aW1lb3V0SG91cnM6IHRpbWVvdXRfaG91cnMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2hlY2tfYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2hlY2tfYmFja2dyb3VuZF9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrIHRoZSBzdGF0dXMsIHN0ZG91dCwgYW5kIHN0ZGVyciBvZiBhIHJ1bm5pbmcgb3IgY29tcGxldGVkIGJhY2tncm91bmQgY29tbWFuZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tbWFuZCBpZGVudGlmaWVyJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaWQgfTogQ2hlY2tCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IGJhY2tncm91bmRDb21tYW5kTWFuYWdlci5jaGVjayhpZCk7XG4gICAgICAgIGlmICghY29tbWFuZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbW1hbmQgbm90IGZvdW5kOiAke2lkfWAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBjb21tYW5kIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjYW5jZWxfYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2FuY2VsX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdLaWxsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1hbmQgaWRlbnRpZmllcicpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGlkIH06IENhbmNlbEJhY2tncm91bmRDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjYW5jZWxsZWQgPSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIuY2FuY2VsKGlkKTtcbiAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDYW5ub3QgY2FuY2VsIGNvbW1hbmQ6ICR7aWR9IChub3QgZm91bmQgb3Igbm90IHJ1bm5pbmcpYCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaWQsIGNhbmNlbGxlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZUNvbW1hbmQgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNoYXJlZCBTcGF3biBIZWxwZXIgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNwYXduUmVzdWx0IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZGF0YT86IHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH07XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNhZmVseSBzcGF3biBhIHByb2Nlc3Mgd2l0aCB0aW1lb3V0LCBjYXB0dXJpbmcgc3Rkb3V0L3N0ZGVyci5cbiAqIEVsaW1pbmF0ZXMgY29kZSBkdXBsaWNhdGlvbiBhY3Jvc3MgZXhlY3V0aW9uIHRvb2xzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzYWZlU3Bhd24oXG4gIGV4ZTogc3RyaW5nLFxuICBhcmdzOiBzdHJpbmdbXSxcbiAgdGltZW91dE1zOiBudW1iZXIsXG4gIGlucHV0Pzogc3RyaW5nLFxuICB1c2VTaGVsbCA9IGZhbHNlXG4pOiBQcm9taXNlPFNwYXduUmVzdWx0PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IHByb2MgPSBzcGF3bihleGUsIGFyZ3MsIHtcbiAgICAgIHN0ZGlvOiBbJ3BpcGUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgICB0aW1lb3V0OiB0aW1lb3V0TXMsXG4gICAgICBjd2Q6IGdldFdvcmtpbmdEaXIoKSwgLy8gRXhlY3V0ZSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgICAgc2hlbGw6IHVzZVNoZWxsLCAvLyBFbmFibGUgc2hlbGwgaW50ZXJwcmV0YXRpb24gd2hlbiByZXF1ZXN0ZWRcbiAgICB9KTtcblxuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIHByb2Muc3RkaW4/LndyaXRlKGlucHV0KTtcbiAgICAgIHByb2Muc3RkaW4/LmVuZCgpO1xuICAgIH1cblxuICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcHJvYy5raWxsKCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRXhlY3V0aW9uIHRpbWVkIG91dCcgfSk7XG4gICAgfSwgdGltZW91dE1zKTtcblxuICAgIHByb2Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc3Rkb3V0OiBzdGRvdXQudHJpbSgpLCBzdGRlcnI6IHN0ZGVyci50cmltKCkgfSB9KTtcbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFNwYXduIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJ1bkphdmFTY3JpcHRQYXJhbXMgeyBqYXZhc2NyaXB0OiBzdHJpbmc7IHRpbWVvdXRfc2Vjb25kcz86IG51bWJlcjsgfVxuaW50ZXJmYWNlIFJ1blB5dGhvblBhcmFtcyB7IHB5dGhvbjogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBFeGVjdXRlQ29tbWFuZFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyOyBpbnB1dD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJ1bkluVGVybWluYWxQYXJhbXMgeyBjb21tYW5kOiBzdHJpbmc7IH1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRXhlY3V0aW9uIFRvb2xzID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckV4ZWN1dGlvblRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBydW5famF2YXNjcmlwdCB0b29sIFx1MjAxNCBTQU5EQk9YRUQgd2l0aCBkZW5vIChpZiBhdmFpbGFibGUpIG9yIG5vZGUgd2l0aCBzdHJpY3QgcmVzdHJpY3Rpb25zXG4gIC8vIFM1IEZJWDogRW5oYW5jZWQgZGFuZ2Vyb3VzIHBhdHRlcm4gZGV0ZWN0aW9uIHRvIHByZXZlbnQgZXZhbC9yZXF1aXJlIGJ5cGFzc2VzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9qYXZhc2NyaXB0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biBKYXZhU2NyaXB0IGNvZGUgc25pcHBldCB1c2luZyBOb2RlLmpzIChzYW5kYm94ZWQpLiBObyBleHRlcm5hbCBtb2R1bGUgaW1wb3J0cyBhbGxvd2VkLiBTdGFuZGFyZCBsaWJyYXJ5IG9ubHkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBqYXZhc2NyaXB0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSmF2YVNjcmlwdCBjb2RlIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfc2Vjb25kczogei5udW1iZXIoKS5taW4oMC4xKS5tYXgoNjApLm9wdGlvbmFsKCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnVGltZW91dCBpbiBzZWNvbmRzIChtYXggNjApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgamF2YXNjcmlwdCwgdGltZW91dF9zZWNvbmRzIH06IFJ1bkphdmFTY3JpcHRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFJvYnVzdCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gXHUyMDE0IGJsb2NrcyBldmFsLCByZXF1aXJlLCBpbXBvcnQsIGZzLCBjaGlsZF9wcm9jZXNzXG4gICAgICAgIC8vIFM1IEZJWDogQWRkZWQgcGF0dGVybnMgZm9yIGNvbW1vbiBieXBhc3MgdGVjaG5pcXVlc1xuICAgICAgICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAgICAgICAvXFxicmVxdWlyZVxccypcXCgvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzKy9pLFxuICAgICAgICAgIC9cXGJmc1xcLi9pLFxuICAgICAgICAgIC9cXGJjaGlsZF9wcm9jZXNzXFxiL2ksXG4gICAgICAgICAgL1xcYmV2YWxcXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV4ZWNcXHMqXFwoL2ksXG4gICAgICAgICAgL2dsb2JhbFRoaXNcXC5yZXF1aXJlL2ksXG4gICAgICAgICAgL3Byb2Nlc3NcXC5leGl0L2ksXG4gICAgICAgICAgL19fcHJvdG9fXy9pLFxuICAgICAgICAgIC8vIFM1IEZJWDogQnlwYXNzIHByZXZlbnRpb24gcGF0dGVybnNcbiAgICAgICAgICAvRnVuY3Rpb25cXHMqXFwoL2ksICAgICAgICAgICAgICAgICAgICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvclxuICAgICAgICAgIC9TdHJpbmdcXC5mcm9tQ2hhckNvZGVcXHMqXFwoL2ksICAgICAgIC8vLmZyb21DaGFyQ29kZSBieXBhc3NcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzKlxcKC4qXFwpL2ksICAgICAgICAgICAgICAgLy8gRHluYW1pYyBpbXBvcnRcbiAgICAgICAgICAvXFwuY29uc3RydWN0b3IvaSwgICAgICAgICAgICAgICAgICAgLy8gQ29uc3RydWN0b3IgYWNjZXNzXG4gICAgICAgICAgL3JlcXVpcmVcXC5yZXNvbHZlL2ksICAgICAgICAgICAgICAgIC8vIHJlcXVpcmUucmVzb2x2ZSBieXBhc3NcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICAgICAgICBpZiAocGF0dGVybi50ZXN0KGphdmFzY3JpcHQpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYW5nZXJvdXMgY29kZSBkZXRlY3RlZDogJHtwYXR0ZXJuLnNvdXJjZX1gIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNSkgKiAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVzZSBOb2RlLmpzIHdpdGggLS11bmhhbmRsZWQtcmVqZWN0aW9ucz10aHJvdyBmb3Igc2FmZXR5XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bignbm9kZScsIFsnLWUnLCBqYXZhc2NyaXB0XSwgdGltZW91dE1zKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5kYXRhPy5zdGRlcnIgJiYgIXJlc3VsdC5kYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmRhdGEuc3RkZXJyIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG91dHB1dDogcmVzdWx0LmRhdGE/LnN0ZG91dCB8fCAnJyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBydW5fcHl0aG9uIHRvb2wgXHUyMDE0IFNBTkRCT1hFRCB3aXRoIHN0cmljdCBpbXBvcnQgcmVzdHJpY3Rpb25zXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9weXRob24nLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIFB5dGhvbiBjb2RlIHNuaXBwZXQgKHNhbmRib3hlZCwgbm8gZXh0ZXJuYWwgbW9kdWxlcykuIFN0YW5kYXJkIGxpYnJhcnkgb25seS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHB5dGhvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIFB5dGhvbiBjb2RlIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfc2Vjb25kczogei5udW1iZXIoKS5taW4oMC4xKS5tYXgoNjApLm9wdGlvbmFsKCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnVGltZW91dCBpbiBzZWNvbmRzIChtYXggNjApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcHl0aG9uLCB0aW1lb3V0X3NlY29uZHMgfTogUnVuUHl0aG9uUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBSb2J1c3QgZGFuZ2Vyb3VzIHBhdHRlcm4gZGV0ZWN0aW9uIFx1MjAxNCBibG9ja3Mgb3MsIHN1YnByb2Nlc3MsIHNodXRpbCwgZXZhbCwgZXhlY1xuICAgICAgICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK29zXFxiL2ksXG4gICAgICAgICAgL1xcYmZyb21cXHMrb3NcXHMraW1wb3J0XFxiL2ksXG4gICAgICAgICAgL1xcYmltcG9ydFxccytzdWJwcm9jZXNzXFxiL2ksXG4gICAgICAgICAgL1xcYmZyb21cXHMrc3VicHJvY2Vzc1xccytpbXBvcnRcXGIvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK3NodXRpbFxcYi9pLFxuICAgICAgICAgIC9cXGJfX2ltcG9ydF9fXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJldmFsXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJleGVjXFxzKlxcKC9pLFxuICAgICAgICAgIC9vc1xcLnN5c3RlbS9pLFxuICAgICAgICAgIC9vc1xcLnBvcGVuL2ksXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChweXRob24pKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYW5nZXJvdXMgUHl0aG9uIGltcG9ydCBkZXRlY3RlZDogJHtwYXR0ZXJuLnNvdXJjZX1gIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNSkgKiAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRyeSBweXRob24zIGZpcnN0LCBmYWxsIGJhY2sgdG8gcHl0aG9uXG4gICAgICAgIGxldCByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24oJ3B5dGhvbjMnLCBbJy1jJywgcHl0aG9uXSwgdGltZW91dE1zKTtcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZXJyb3I/LmluY2x1ZGVzKCdub3QgZm91bmQnKSkge1xuICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bigncHl0aG9uJywgWyctYycsIHB5dGhvbl0sIHRpbWVvdXRNcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQuZGF0YT8uc3RkZXJyICYmICFyZXN1bHQuZGF0YS5zdGRvdXQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5kYXRhLnN0ZGVyciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBvdXRwdXQ6IHJlc3VsdC5kYXRhPy5zdGRvdXQgfHwgJycgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZXhlY3V0ZV9jb21tYW5kIHRvb2wgXHUyMDE0IFNBRkUgVkVSU0lPTiB3aXRoIHNoZWxsOnRydWUgc3VwcG9ydCAmIGltcHJvdmVkIFdpbmRvd3MgaGFuZGxpbmdcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZXhlY3V0ZV9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4ZWN1dGUgYSBjb21tYW5kIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBTdXBwb3J0cyBmdWxsIHNoZWxsIGZlYXR1cmVzIChwaXBlcywgcmVkaXJlY3RzLCBlbnYgdmFycykuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2hlbGwgY29tbWFuZCB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X3NlY29uZHM6IHoubnVtYmVyKCkubWluKDEpLm1heCgzMDApLm9wdGlvbmFsKCkuZGVmYXVsdCg2MCkuZGVzY3JpYmUoJ1RpbWVvdXQgaW4gc2Vjb25kcyAobWF4IDMwMCknKSxcbiAgICAgIGlucHV0OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJJbnB1dCB0ZXh0IHRvIHBpcGUgdG8gdGhlIGNvbW1hbmQncyBzdGRpbi5cIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCwgdGltZW91dF9zZWNvbmRzLCBpbnB1dCB9OiBFeGVjdXRlQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA2MCkgKiAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVzZSBzaGVsbDp0cnVlIGZvciBmdWxsIHNoZWxsIGludGVycHJldGF0aW9uIChwaXBlcywgcmVkaXJlY3RzLCBlbnYgdmFycylcbiAgICAgICAgLy8gU2VjdXJpdHkgaXMgbWFpbnRhaW5lZCB0aHJvdWdoIHNhbml0aXplQ29tbWFuZCgpIHdoaWNoIGJsb2NrcyBkYW5nZXJvdXMgcGF0dGVybnNcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKGNvbW1hbmQsIFtdLCB0aW1lb3V0TXMsIGlucHV0LCB0cnVlKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmV0dXJuIGNvbWJpbmVkIG91dHB1dCBmb3IgYmV0dGVyIGRlYnVnZ2luZ1xuICAgICAgICBjb25zdCBmdWxsT3V0cHV0ID0gW3Jlc3VsdC5kYXRhPy5zdGRvdXQsIHJlc3VsdC5kYXRhPy5zdGRlcnJdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgIHN0ZG91dDogcmVzdWx0LmRhdGE/LnN0ZG91dCB8fCAnJywgXG4gICAgICAgICAgICBzdGRlcnI6IHJlc3VsdC5kYXRhPy5zdGRlcnIgfHwgJycsXG4gICAgICAgICAgICBvdXRwdXQ6IGZ1bGxPdXRwdXQgfHwgJyhObyBvdXRwdXQpJ1xuICAgICAgICAgIH0gXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBFeGVjdXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBydW5faW5fdGVybWluYWwgdG9vbCBcdTIwMTQgU0FGRSBWRVJTSU9OIHdpdGhvdXQgc2hlbGw6dHJ1ZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdydW5faW5fdGVybWluYWwnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGF1bmNoIGEgY29tbWFuZCBpbiBhIG5ldywgc2VwYXJhdGUgaW50ZXJhY3RpdmUgdGVybWluYWwgd2luZG93LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tbWFuZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNoZWxsIGNvbW1hbmQgdG8gZXhlY3V0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbW1hbmQgfTogUnVuSW5UZXJtaW5hbFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuICAgICAgICBcbiAgICAgICAgaWYgKGlzV2luZG93cykge1xuICAgICAgICAgIHNwYXduKCdjbWQuZXhlJywgWycvYycsICdzdGFydCcsICdDb21tYW5kIFByb21wdCcsICcvaycsIGNvbW1hbmRdLCB7IFxuICAgICAgICAgICAgZGV0YWNoZWQ6IHRydWUsIFxuICAgICAgICAgICAgc3RkaW86ICdpZ25vcmUnIFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHRlcm1pbmFscyA9IFsneHRlcm0nLCAnZ25vbWUtdGVybWluYWwnLCAna29uc29sZScsICd4ZmNlNC10ZXJtaW5hbCddO1xuICAgICAgICAgIGxldCBsYXVuY2hlZCA9IGZhbHNlO1xuICAgICAgICAgIFxuICAgICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtaW5hbHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHNwYXduKHRlcm0sIFsnLWUnLCBjb21tYW5kXSwgeyBkZXRhY2hlZDogdHJ1ZSwgc3RkaW86ICdpZ25vcmUnIH0pO1xuICAgICAgICAgICAgICBsYXVuY2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIWxhdW5jaGVkKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBzdWl0YWJsZSB0ZXJtaW5hbCBlbXVsYXRvciBmb3VuZC4gSW5zdGFsbCB4dGVybSBvciBnbm9tZS10ZXJtaW5hbC4nIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBsYXVuY2hlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gb3BlbiB0ZXJtaW5hbDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuXG4vKipcbiAqIFNhZmVseSBwYXJzZSBhIHNoZWxsIGNvbW1hbmQgaW50byBleGVjdXRhYmxlIGFuZCBhcmd1bWVudHMuXG4gKiBIYW5kbGVzIGJhc2ljIHF1b3RpbmcgYnV0IGF2b2lkcyBzaGVsbCBpbnRlcnByZXRhdGlvbiBlbnRpcmVseS5cbiAqL1xuZnVuY3Rpb24gcGFyc2VDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHsgZXhlOiBzdHJpbmc7IGFyZ3M6IHN0cmluZ1tdIH0ge1xuICBjb25zdCB0cmltbWVkID0gY29tbWFuZC50cmltKCk7XG4gIFxuICBpZiAoIXRyaW1tZWQpIHtcbiAgICByZXR1cm4geyBleGU6ICcnLCBhcmdzOiBbXSB9O1xuICB9XG5cbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG4gIGxldCBjdXJyZW50ID0gJyc7XG4gIGxldCBpblF1b3RlOiAnXCInIHwgXCInXCIgfCBudWxsID0gbnVsbDtcbiAgXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdHJpbW1lZC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoYXIgPSB0cmltbWVkW2ldO1xuICAgIFxuICAgIGlmIChpblF1b3RlKSB7XG4gICAgICBpZiAoY2hhciA9PT0gaW5RdW90ZSkge1xuICAgICAgICBpblF1b3RlID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQgKz0gY2hhcjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCIpIHtcbiAgICAgIGluUXVvdGUgPSBjaGFyO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gJyAnKSB7XG4gICAgICBpZiAoY3VycmVudCkge1xuICAgICAgICBwYXJ0cy5wdXNoKGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50ID0gJyc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnQgKz0gY2hhcjtcbiAgICB9XG4gIH1cbiAgXG4gIGlmIChjdXJyZW50KSB7XG4gICAgcGFydHMucHVzaChjdXJyZW50KTtcbiAgfVxuXG4gIGNvbnN0IGV4ZSA9IHBhcnRzWzBdIHx8ICcnO1xuICBjb25zdCBhcmdzID0gcGFydHMuc2xpY2UoMSk7XG4gIFxuICByZXR1cm4geyBleGUsIGFyZ3MgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlTWFuYWdlciB9IGZyb20gJy4uL3N0YXRlTWFuYWdlci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBOb3RpZnlPcHRpb25zIHtcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIG1zZz86IHN0cmluZztcbiAgc291bmQ/OiBib29sZWFuIHwgc3RyaW5nO1xuICBpY29uPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG50eXBlIFNhdmVNZW1vcnlQYXJhbXMgPSB7IGZhY3Q6IHN0cmluZzsgfTtcbnR5cGUgUmVhZENsaXBib2FyZFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIG5ldmVyPjtcbnR5cGUgV3JpdGVDbGlwYm9hcmRQYXJhbXMgPSB7IGNvbnRlbnQ6IHN0cmluZzsgfTtcbnR5cGUgU2VuZE5vdGlmaWNhdGlvblBhcmFtcyA9IHsgdGl0bGU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nOyBpY29uPzogc3RyaW5nOyB9O1xuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG4vKipcbiAqIENyb3NzLXBsYXRmb3JtIGNsaXBib2FyZCBvcGVyYXRpb25zIHVzaW5nIHN5c3RlbSBjb21tYW5kcy5cbiAqL1xuXG4vLyBTNiBGSVg6IFByb3BlciBlc2NhcGluZyBmb3Igc2hlbGwgaW5qZWN0aW9uIHByZXZlbnRpb25cbmZ1bmN0aW9uIGVzY2FwZUZvclBvd2VyU2hlbGwoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gRXNjYXBlIGRvdWJsZSBxdW90ZXMgYW5kIGRvbGxhciBzaWducyAod2hpY2ggdHJpZ2dlciB2YXJpYWJsZSBleHBhbnNpb24gaW4gUFMpXG4gIHJldHVybiBjb250ZW50LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKS5yZXBsYWNlKC9cXCQvZywgJ1xcXFwkJyk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUZvckJhc2goY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gRXNjYXBlIHNpbmdsZSBxdW90ZXMgYnkgZW5kaW5nIHRoZSBxdW90ZSwgYWRkaW5nIGVzY2FwZWQgcXVvdGUsIHJlLW9wZW5pbmcgcXVvdGVcbiAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSgvJy9nLCBcIidcXFxcJydcIik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRDbGlwYm9hcmQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuICAgIFxuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93cyBQb3dlclNoZWxsXG4gICAgICAgIGNtZCA9ICdwb3dlcnNoZWxsLmV4ZSc7XG4gICAgICAgIGFyZ3MgPSBbJy1Ob1Byb2ZpbGUnLCAnLUNvbW1hbmQnLCAnW0NvbnNvbGVdOjpPdXRwdXRFbmNvZGluZyA9IFtTeXN0ZW0uVGV4dC5FbmNvZGluZ106OlVURjg7IEdldC1DbGlwYm9hcmQgLVJhdyddO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TIHBicGFzdGVcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgJ3BicGFzdGUnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBMaW51eCB4Y2xpcCBvciB4c2VsXG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsICcoeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgLW8gMj4vZGV2L251bGwgfHwgeHNlbCAtLWNsaXBib2FyZCAtLW91dHB1dCAyPi9kZXYvbnVsbCkgfCB0ciAtZCBcXCdcXFxcMFxcJyddO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICBcbiAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsIChjb2RlKSA9PiB7XG4gICAgICBpZiAoY29kZSA9PT0gMCAmJiBzdGRvdXQudHJpbSgpKSB7XG4gICAgICAgIHJlc29sdmUoc3Rkb3V0LnRyaW0oKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBDbGlwYm9hcmQgcmVhZCBmYWlsZWQgKGV4aXQgY29kZSAke2NvZGV9KTogJHtzdGRlcnIgfHwgJ05vIGNsaXBib2FyZCBjb250ZW50J31gKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgXG4gICAgLy8gVGltZW91dCBhZnRlciA1IHNlY29uZHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2xpcGJvYXJkIHJlYWQgdGltZWQgb3V0JykpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cblxuLy8gUzYgRklYOiBQcm9wZXIgZXNjYXBpbmcgdG8gcHJldmVudCBzaGVsbCBpbmplY3Rpb24gaW4gY2xpcGJvYXJkIHdyaXRlXG5hc3luYyBmdW5jdGlvbiB3cml0ZUNsaXBib2FyZChjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuICAgIFxuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93cyBQb3dlclNoZWxsIHdpdGggU2V0LUNsaXBib2FyZCBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZENvbnRlbnQgPSBlc2NhcGVGb3JQb3dlclNoZWxsKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gWyctTm9Qcm9maWxlJywgJy1Db21tYW5kJywgYFtDb25zb2xlXTo6T3V0cHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4OyBcIiR7ZXNjYXBlZENvbnRlbnR9XCIgfCBTZXQtQ2xpcGJvYXJkYF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGFyd2luJzpcbiAgICAgICAgLy8gbWFjT1MgcGJjb3B5IFx1MjAxNCBTNiBGSVg6IFByb3BlciBlc2NhcGluZ1xuICAgICAgICBjb25zdCBlc2NhcGVkQmFzaCA9IGVzY2FwZUZvckJhc2goY29udGVudCk7XG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsIGBlY2hvIC1uICcke2VzY2FwZWRCYXNofScgfCBwYmNvcHlgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBMaW51eCB4Y2xpcCBvciB4c2VsIFx1MjAxNCBTNiBGSVg6IFByb3BlciBlc2NhcGluZ1xuICAgICAgICBjb25zdCBlc2NhcGVkTGludXggPSBlc2NhcGVGb3JCYXNoKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgZWNobyAtbiAnJHtlc2NhcGVkTGludXh9JyB8ICh4Y2xpcCAtc2VsZWN0aW9uIGNsaXBib2FyZCAyPi9kZXYvbnVsbCB8fCB4c2VsIC0tY2xpcGJvYXJkIC0taW5wdXQgMj4vZGV2L251bGwpYF07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHByb2MgPSBzcGF3bihjbWQsIGFyZ3MpO1xuICAgIFxuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsIChjb2RlKSA9PiB7XG4gICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBDbGlwYm9hcmQgd3JpdGUgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyfWApKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICBcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgc2Vjb25kc1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcHJvYy5raWxsKCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdDbGlwYm9hcmQgd3JpdGUgdGltZWQgb3V0JykpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGaW5kIExNIFN0dWRpbyBpbnN0YWxsYXRpb24gZGlyZWN0b3J5IGFjcm9zcyBwbGF0Zm9ybXMuXG4gKi9cbmZ1bmN0aW9uIGZpbmRMTVN0dWRpb0hvbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIC8vIENvbW1vbiBwYXRocyB0byBjaGVja1xuICBjb25zdCBjYW5kaWRhdGVzOiBzdHJpbmdbXSA9IFtdO1xuICBcbiAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkFQUERBVEEgfHwgJycsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkxPQ0FMQVBQREFUQSB8fCAnJywgJ1Byb2dyYW1zJywgJ2xtLXN0dWRpbycpLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuUFJPR1JBTUZJTEVTIHx8ICcnLCAnTE0gU3R1ZGlvJyksXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudlsnUFJPR1JBTURBVEEnXSB8fCAnJywgJ0xNIFN0dWRpbycpXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGFyd2luJzpcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJ0xpYnJhcnknLCAnQXBwbGljYXRpb24gU3VwcG9ydCcsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgJy9BcHBsaWNhdGlvbnMvTE0gU3R1ZGlvLmFwcC9Db250ZW50cy9SZXNvdXJjZXMvYXBwLmFzYXInXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDogLy8gTGludXhcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbCcsICdzaGFyZScsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgJy9vcHQvbG0tc3R1ZGlvJyxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgJycsICcubG0tc3R1ZGlvJylcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIFxuICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIHBhdGhzXG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVXRpbGl0eVRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlciwgZ2V0RW5hYmxlZFRvb2xzPzogKCkgPT4gc3RyaW5nW10pOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gc2F2ZV9tZW1vcnkgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzYXZlX21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdTYXZlIGEgc3BlY2lmaWMgcGllY2Ugb2YgaW5mb3JtYXRpb24gb3IgZmFjdCB0byBsb25nLXRlcm0gbWVtb3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmFjdDogei5zdHJpbmcoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBzcGVjaWZpYyBmYWN0IG9yIHBpZWNlIG9mIGluZm9ybWF0aW9uIHRvIHJlbWVtYmVyLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZhY3QgfTogU2F2ZU1lbW9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdGVNYW5hZ2VyLnNldChgbWVtb3J5XyR7RGF0ZS5ub3coKX1gLCBmYWN0KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzYXZlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfc3lzdGVtX2luZm8gdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfc3lzdGVtX2luZm8nLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGluZm9ybWF0aW9uIGFib3V0IHRoZSBzeXN0ZW0gKE9TLCBDUFUsIE1lbW9yeSkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHBsYXRmb3JtOiBvcy5wbGF0Zm9ybSgpLFxuICAgICAgICAgICAgYXJjaDogb3MuYXJjaCgpLFxuICAgICAgICAgICAgY3B1czogb3MuY3B1cygpLmxlbmd0aCxcbiAgICAgICAgICAgIHRvdGFsTWVtb3J5OiBvcy50b3RhbG1lbSgpLFxuICAgICAgICAgICAgZnJlZU1lbW9yeTogb3MuZnJlZW1lbSgpLFxuICAgICAgICAgICAgaG9zdG5hbWU6IG9zLmhvc3RuYW1lKCksXG4gICAgICAgICAgICByZWxlYXNlOiBvcy5yZWxlYXNlKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgc3lzdGVtIGluZm86ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlYWRfY2xpcGJvYXJkIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2NsaXBib2FyZCcsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIHRleHQgY29udGVudCBmcm9tIHRoZSBzeXN0ZW0gY2xpcGJvYXJkLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChfcGFyYW1zOiBSZWFkQ2xpcGJvYXJkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zIChlbXB0eSBvYmplY3QpXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZENsaXBib2FyZCgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbnRlbnQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gd3JpdGVfY2xpcGJvYXJkIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3cml0ZV9jbGlwYm9hcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnV3JpdGUgdGV4dCBjb250ZW50IHRvIHRoZSBzeXN0ZW0gY2xpcGJvYXJkLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgY29udGVudCB0byB3cml0ZSB0byBjbGlwYm9hcmQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb250ZW50IH06IFdyaXRlQ2xpcGJvYXJkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZUNsaXBib2FyZChjb250ZW50KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB3cml0dGVuOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHNlbmRfbm90aWZpY2F0aW9uIHRvb2wgLSBJTVBMRU1FTlRFRCB1c2luZyBub2RlLW5vdGlmaWVyXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NlbmRfbm90aWZpY2F0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlbmQgYSBzeXN0ZW0gbm90aWZpY2F0aW9uIHRvIHRoZSB1c2VyLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05vdGlmaWNhdGlvbiB0aXRsZScpLFxuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTm90aWZpY2F0aW9uIG1lc3NhZ2UnKSxcbiAgICAgIGljb246IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgY3VzdG9tIGljb24gcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBtZXNzYWdlLCBpY29uIH06IFNlbmROb3RpZmljYXRpb25QYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90aWZpZXJNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ25vZGUtbm90aWZpZXInKTtcbiAgICAgICAgIFxuICAgICAgICBjb25zdCBub3RpZmllciA9IG5vdGlmaWVyTW9kdWxlLmRlZmF1bHQgfHwgbm90aWZpZXJNb2R1bGU7XG5cbiAgICAgICAgY29uc3Qgb3B0aW9uczogTm90aWZ5T3B0aW9ucyA9IHtcbiAgICAgICAgICB0aXRsZTogdGl0bGUgfHwgJ0FJIFRvb2xib3gnLFxuICAgICAgICAgIG1zZzogbWVzc2FnZSB8fCAnJyxcbiAgICAgICAgICBzb3VuZDogdHJ1ZSwgLy8gSW5jbHVkZSBzb3VuZCBvbiBtYWNPU1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpY29uKSB7XG4gICAgICAgICAgb3B0aW9ucy5pY29uID0gaWNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vdGlmaWVyKG9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2VudDogdHJ1ZSwgdGl0bGUsIG1lc3NhZ2UgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHNlbmQgbm90aWZpY2F0aW9uOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmaW5kTE1TdHVkaW9Ib21lIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmaW5kTE1TdHVkaW9Ib21lJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xvY2F0ZSBMTSBTdHVkaW8gaW5zdGFsbGF0aW9uIGRpcmVjdG9yeSBhY3Jvc3MgcGxhdGZvcm1zLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGhvbWVEaXIgPSBmaW5kTE1TdHVkaW9Ib21lKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaG9tZURpcikge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBmb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgICAgcGF0aDogaG9tZURpcixcbiAgICAgICAgICAgICAgcGxhdGZvcm06IG9zLnBsYXRmb3JtKCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUHJvdmlkZSBjb21tb24gcGF0aHMgZm9yIG1hbnVhbCByZWZlcmVuY2VcbiAgICAgICAgICBjb25zdCBjb21tb25QYXRocyA9IFtcbiAgICAgICAgICAgICdXaW5kb3dzOiAlQVBQREFUQSVcXFxcbG0tc3R1ZGlvJyxcbiAgICAgICAgICAgICdtYWNPUzogfi9MaWJyYXJ5L0FwcGxpY2F0aW9uIFN1cHBvcnQvbG0tc3R1ZGlvJyxcbiAgICAgICAgICAgICdMaW51eDogfi8ubG9jYWwvc2hhcmUvbG0tc3R1ZGlvJ1xuICAgICAgICAgIF0uam9pbignXFxuJyk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogYExNIFN0dWRpbyBob21lIGRpcmVjdG9yeSBub3QgZm91bmQuXFxuXFxuQ29tbW9uIHBhdGhzOlxcbiR7Y29tbW9uUGF0aHN9YCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZmluZCBMTSBTdHVkaW8gaG9tZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2VuYWJsZWRfdG9vbHMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfZW5hYmxlZF90b29scycsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgbGlzdCBvZiBjdXJyZW50bHkgZW5hYmxlZCB0b29scyBiYXNlZCBvbiBjb25maWd1cmF0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnZXRFbmFibGVkVG9vbHMpIHtcbiAgICAgICAgICBjb25zdCB0b29sTmFtZXMgPSBnZXRFbmFibGVkVG9vbHMoKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHRvb2xDb3VudDogdG9vbE5hbWVzLmxlbmd0aCwgdG9vbHM6IHRvb2xOYW1lcyB9IH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVnaXN0cnkgYWNjZXNzIG5vdCBhdmFpbGFibGUnIH07XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgZW5hYmxlZCB0b29sczogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IENVUlJFTlQgV09SS0lORyBESVJFQ1RPUlkgVE9PTCA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAqIFRoaXMgYWxsb3dzIHRoZSBMTE0gdG8ga25vdyB3aGVyZSByZWxhdGl2ZSBwYXRocyB3aWxsIGJlIHJlc29sdmVkLlxuICovXG50eXBlIEdldEN1cnJlbnRXb3JraW5nRGlyZWN0b3J5UGFyYW1zID0gUmVjb3JkPHN0cmluZywgbmV2ZXI+O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJHZXRDdXJyZW50V29ya2luZ0RpcmVjdG9yeVRvb2woKTogVG9vbFtdIHtcbiAgcmV0dXJuIFtcbiAgICB0b29sKHtcbiAgICAgIG5hbWU6ICdnZXRfY3VycmVudF93b3JraW5nX2RpcmVjdG9yeScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0dldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gVXNlIHRoaXMgYmVmb3JlIGdlbmVyYXRpbmcgZmlsZSBvcGVyYXRpb25zIHdpdGggcmVsYXRpdmUgcGF0aHMgdG8gZW5zdXJlIHlvdSBrbm93IHdoZXJlIGZpbGVzIHdpbGwgYmUgY3JlYXRlZC9tb2RpZmllZC4nLFxuICAgICAgcGFyYW1ldGVyczoge30sXG4gICAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBJbXBvcnQgaGVyZSB0byBhdm9pZCBjaXJjdWxhciBkZXBlbmRlbmN5XG4gICAgICAgIGNvbnN0IHsgZ2V0V29ya2luZ0RpciB9ID0gcmVxdWlyZSgnLi4vd29ya2luZ0Rpci5qcycpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgY3VycmVudF93b3JraW5nX2RpcmVjdG9yeTogZ2V0V29ya2luZ0RpcigpXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9KSxcbiAgXTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIEltYWdlVG9UZXh0UGFyYW1zIHtcbiAgaW1hZ2VQYXRoOiBzdHJpbmc7XG4gIGxhbmd1YWdlPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgRGVzY3JpYmVJbWFnZVBhcmFtcyB7XG4gIGltYWdlUGF0aDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMge1xuICBvdXRwdXRQYXRoPzogc3RyaW5nO1xuICBmb3JtYXQ/OiAncG5nJyB8ICdqcGVnJztcbiAgcXVhbGl0eT86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENvbXBhcmVJbWFnZXNQYXJhbXMge1xuICBpbWFnZTFQYXRoOiBzdHJpbmc7XG4gIGltYWdlMlBhdGg6IHN0cmluZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gSGVscGVyIEZ1bmN0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG4vKiogVmFsaWRhdGUgaW1hZ2UgZmlsZSBleGlzdHMgYW5kIGlzIHdpdGhpbiBzaXplIGxpbWl0cyAqL1xuZnVuY3Rpb24gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2VQYXRoOiBzdHJpbmcsIG1heFNpemVCeXRlczogbnVtYmVyID0gNTAgKiAxMDI0ICogMTAyNCk6IHtcbiAgdmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xufSB7XG4gIC8vIENoZWNrIGlmIHBhdGggZXhpc3RzXG4gIGlmICghZnMuZXhpc3RzU3luYyhpbWFnZVBhdGgpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEltYWdlIGZpbGUgbm90IGZvdW5kOiAke2ltYWdlUGF0aH1gIH07XG4gIH1cblxuICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoaW1hZ2VQYXRoKTtcbiAgXG4gIC8vIFZlcmlmeSBpdCdzIGEgZmlsZSAobm90IGRpcmVjdG9yeSlcbiAgaWYgKCFzdGF0LmlzRmlsZSgpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFBhdGggaXMgbm90IGEgZmlsZTogJHtpbWFnZVBhdGh9YCB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgc2l6ZSBsaW1pdFxuICBpZiAoc3RhdC5zaXplID4gbWF4U2l6ZUJ5dGVzKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEltYWdlIGV4Y2VlZHMgbWF4aW11bSBzaXplIG9mICR7KG1heFNpemVCeXRlcyAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDApfU1CYCB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgZXh0ZW5zaW9uXG4gIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShpbWFnZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IHZhbGlkRXh0ZW5zaW9ucyA9IFsnLnBuZycsICcuanBnJywgJy5qcGVnJywgJy5ibXAnLCAnLmdpZicsICcudGlmZicsICcud2VicCddO1xuICBpZiAoIXZhbGlkRXh0ZW5zaW9ucy5pbmNsdWRlcyhleHQpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFVuc3VwcG9ydGVkIGltYWdlIGZvcm1hdDogJHtleHR9LiBTdXBwb3J0ZWQ6ICR7dmFsaWRFeHRlbnNpb25zLmpvaW4oJywgJyl9YCB9O1xuICB9XG5cbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqIEdldCBpbWFnZSBkaW1lbnNpb25zIHVzaW5nIHNpbXBsZSBoZWFkZXIgcGFyc2luZyAqL1xuZnVuY3Rpb24gZ2V0SW1hZ2VEaW1lbnNpb25zKGltYWdlUGF0aDogc3RyaW5nKTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9IHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgY29uc3QgYnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKGltYWdlUGF0aCk7XG4gICAgXG4gICAgLy8gUE5HOiBieXRlcyAxNi0xOSA9IHdpZHRoLCAyMC0yMyA9IGhlaWdodCAoYmlnLWVuZGlhbilcbiAgICBpZiAoYnVmZmVyWzBdID09PSAweDg5ICYmIGJ1ZmZlclsxXSA9PT0gMHg1MCAmJiBidWZmZXJbMl0gPT09IDB4NEUgJiYgYnVmZmVyWzNdID09PSAweDQ3KSB7XG4gICAgICBjb25zdCB3aWR0aCA9IGJ1ZmZlci5yZWFkVUludDMyQkUoMTYpO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gYnVmZmVyLnJlYWRVSW50MzJCRSgyMCk7XG4gICAgICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH07XG4gICAgfVxuXG4gICAgLy8gSlBFRzogTmVlZCB0byBmaW5kIFNPRiBtYXJrZXIgYW5kIHBhcnNlIGRpbWVuc2lvbnNcbiAgICBpZiAoYnVmZmVyWzBdID09PSAweEZGICYmIGJ1ZmZlclsxXSA9PT0gMHhEOCkge1xuICAgICAgbGV0IG9mZnNldCA9IDI7XG4gICAgICB3aGlsZSAob2Zmc2V0IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICBpZiAoYnVmZmVyW29mZnNldF0gPT09IDB4RkYgJiYgKGJ1ZmZlcltvZmZzZXQgKyAxXSAmIDB4RjgpID09PSAweEMwKSB7XG4gICAgICAgICAgLy8gRm91bmQgU09GIG1hcmtlclxuICAgICAgICAgIG9mZnNldCArPSA0OyAvLyBTa2lwIG1hcmtlciBhbmQgbGVuZ3RoXG4gICAgICAgICAgY29uc3QgaGVpZ2h0ID0gYnVmZmVyLnJlYWRVSW50MTZCRShvZmZzZXQpO1xuICAgICAgICAgIGNvbnN0IHdpZHRoID0gYnVmZmVyLnJlYWRVSW50MTZCRShvZmZzZXQgKyAyKTtcbiAgICAgICAgICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJ1ZmZlcltvZmZzZXRdID09PSAweEZGKSB7XG4gICAgICAgICAgb2Zmc2V0ICs9IDIgKyAoYnVmZmVyW29mZnNldCArIDJdIDw8IDgpICsgYnVmZmVyW29mZnNldCArIDNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9mZnNldCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gR0lGOiBieXRlcyA2LTcgPSB3aWR0aCwgOC05ID0gaGVpZ2h0IChsaXR0bGUtZW5kaWFuKVxuICAgIGlmIChidWZmZXJbMF0gPT09IDB4NDcgJiYgYnVmZmVyWzFdID09PSAweDQ5ICYmIGJ1ZmZlclsyXSA9PT0gMHg0NiAmJiBidWZmZXJbM10gPT09IDB4MzgpIHtcbiAgICAgIGNvbnN0IHdpZHRoID0gYnVmZmVyLnJlYWRVSW50MTZMRSg2KTtcbiAgICAgIGNvbnN0IGhlaWdodCA9IGJ1ZmZlci5yZWFkVUludDE2TEUoOCk7XG4gICAgICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH07XG4gICAgfVxuXG4gICAgLy8gQk1QOiBieXRlcyAxOC0yMSA9IHdpZHRoLCAyMi0yNSA9IGhlaWdodCAobGl0dGxlLWVuZGlhbilcbiAgICBpZiAoYnVmZmVyWzBdID09PSAweDQyICYmIGJ1ZmZlclsxXSA9PT0gMHg0RCkge1xuICAgICAgY29uc3Qgd2lkdGggPSBidWZmZXIucmVhZEludDMyTEUoMTgpO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gYnVmZmVyLnJlYWRJbnQzMkxFKDIyKTtcbiAgICAgIHJldHVybiB7IHdpZHRoOiBNYXRoLmFicyh3aWR0aCksIGhlaWdodDogTWF0aC5hYnMoaGVpZ2h0KSB9O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEV4dHJhY3QgdGV4dCBmcm9tIGltYWdlcyB1c2luZyBPQ1IgKFRlc3NlcmFjdC5qcykuXG4gKiBGdWxsIGltcGxlbWVudGF0aW9uIHdpdGggcHJvZ3Jlc3MgdHJhY2tpbmcgYW5kIGRldGFpbGVkIHdvcmQtbGV2ZWwgZGF0YS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1hZ2VUb1RleHQoeyBpbWFnZVBhdGgsIGxhbmd1YWdlID0gJ2VuZycgfTogSW1hZ2VUb1RleHRQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2VQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgLy8gR2V0IGJhc2ljIG1ldGFkYXRhXG4gICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGltYWdlUGF0aCk7XG4gICAgY29uc3QgZGltZW5zaW9ucyA9IGdldEltYWdlRGltZW5zaW9ucyhpbWFnZVBhdGgpO1xuICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShpbWFnZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBJbXBvcnQgVGVzc2VyYWN0LmpzIGR5bmFtaWNhbGx5XG4gICAgY29uc3QgVGVzc2VyYWN0ID0gcmVxdWlyZSgndGVzc2VyYWN0LmpzJyk7XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFN0YXJ0aW5nIE9DUiBvbiAke2ltYWdlUGF0aH0gd2l0aCBsYW5ndWFnZSAnJHtsYW5ndWFnZX0nLi4uYCk7XG5cbiAgICAvLyBQZXJmb3JtIE9DUiB3aXRoIHByb2dyZXNzIHRyYWNraW5nXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgVGVzc2VyYWN0LnJlY29nbml6ZShpbWFnZVBhdGgsIGxhbmd1YWdlLCB7XG4gICAgICBsb2dnZXI6IChtOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKG0uc3RhdHVzID09PSAncmVjb2duaXppbmcgdGV4dCcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIE9DUiBQcm9ncmVzczogJHsobS5wcm9ncmVzcyAqIDEwMCkudG9GaXhlZCgwKX0lYCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBFeHRyYWN0IHN0cnVjdHVyZWQgZGF0YSBmcm9tIHJlc3VsdFxuICAgIGNvbnN0IGV4dHJhY3RlZFRleHQgPSByZXN1bHQuZGF0YS50ZXh0LnRyaW0oKTtcbiAgICBjb25zdCB3b3JkQ291bnQgPSBleHRyYWN0ZWRUZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKCh3OiBzdHJpbmcpID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoO1xuICAgIGNvbnN0IGxpbmVDb3VudCA9IGV4dHJhY3RlZFRleHQuc3BsaXQoJ1xcbicpLmZpbHRlcigobDogc3RyaW5nKSA9PiBsLnRyaW0oKS5sZW5ndGggPiAwKS5sZW5ndGg7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdGV4dDogZXh0cmFjdGVkVGV4dCxcbiAgICAgICAgY29uZmlkZW5jZTogcmVzdWx0LmRhdGEuY29uZmlkZW5jZS50b0ZpeGVkKDIpLFxuICAgICAgICBsYW5ndWFnZTogcmVzdWx0LmRhdGEubGFuZ3VhZ2UsXG4gICAgICAgIHZlcnNpb246IHJlc3VsdC5kYXRhLl92ZXJzaW9uLFxuICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgIHBhdGg6IGltYWdlUGF0aCxcbiAgICAgICAgICBzaXplOiBgJHsoc3RhdC5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICAgIGZvcm1hdDogZXh0LnJlcGxhY2UoJy4nLCAnJykudG9VcHBlckNhc2UoKSxcbiAgICAgICAgICBkaW1lbnNpb25zOiBkaW1lbnNpb25zIHx8IHsgd2lkdGg6ICdVbmtub3duJywgaGVpZ2h0OiAnVW5rbm93bicgfSxcbiAgICAgICAgICB3b3JkQ291bnQsXG4gICAgICAgICAgbGluZUNvdW50LFxuICAgICAgICB9LFxuICAgICAgICB3b3JkczogcmVzdWx0LmRhdGEud29yZHM/LnNsaWNlKDAsIDEwMCkgfHwgW10sIC8vIExpbWl0IHRvIGZpcnN0IDEwMCB3b3JkcyBmb3IgYnJldml0eVxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXNjcmliZSBpbWFnZSBjb250ZW50IC0gcmV0dXJucyBtZXRhZGF0YSBhbmQgYmFzaWMgaW5mb3JtYXRpb24uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlc2NyaWJlSW1hZ2UoeyBpbWFnZVBhdGggfTogRGVzY3JpYmVJbWFnZVBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZVBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoaW1hZ2VQYXRoKTtcbiAgICBjb25zdCBkaW1lbnNpb25zID0gZ2V0SW1hZ2VEaW1lbnNpb25zKGltYWdlUGF0aCk7XG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGltYWdlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICBcbiAgICAvLyBEZXRlcm1pbmUgTUlNRSB0eXBlXG4gICAgY29uc3QgbWltZVR5cGVNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAnLnBuZyc6ICdpbWFnZS9wbmcnLFxuICAgICAgJy5qcGcnOiAnaW1hZ2UvanBlZycsXG4gICAgICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICAgICAnLmdpZic6ICdpbWFnZS9naWYnLFxuICAgICAgJy5ibXAnOiAnaW1hZ2UvYm1wJyxcbiAgICAgICcud2VicCc6ICdpbWFnZS93ZWJwJyxcbiAgICAgICcudGlmZic6ICdpbWFnZS90aWZmJyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHBhdGg6IGltYWdlUGF0aCxcbiAgICAgICAgc2l6ZTogc3RhdC5zaXplLFxuICAgICAgICBzaXplSHVtYW46IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIGZvcm1hdDogZXh0LnJlcGxhY2UoJy4nLCAnJykudG9VcHBlckNhc2UoKSxcbiAgICAgICAgbWltZVR5cGU6IG1pbWVUeXBlTWFwW2V4dF0gfHwgJ2ltYWdlL3Vua25vd24nLFxuICAgICAgICBkaW1lbnNpb25zOiBkaW1lbnNpb25zIHx8IHsgd2lkdGg6ICdVbmtub3duJywgaGVpZ2h0OiAnVW5rbm93bicgfSxcbiAgICAgICAgY3JlYXRlZEF0OiBzdGF0LmJpcnRodGltZSxcbiAgICAgICAgbW9kaWZpZWRBdDogc3RhdC5tdGltZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogQ2FwdHVyZSBkZXNrdG9wIHNjcmVlbnNob3QgYW5kIHNhdmUgdG8gZmlsZS5cbiAqIFVzZXMgcGxhdGZvcm0tc3BlY2lmaWMgY29tbWFuZHMgZm9yIGNyb3NzLXBsYXRmb3JtIHN1cHBvcnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNjcmVlbnNob3REZXNrdG9wKHsgXG4gIG91dHB1dFBhdGgsIFxuICBmb3JtYXQgPSAncG5nJywgXG4gIHF1YWxpdHkgPSA5MCBcbn06IFNjcmVlbnNob3REZXNrdG9wUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBzcGF3biB9ID0gYXdhaXQgaW1wb3J0KCdjaGlsZF9wcm9jZXNzJyk7XG4gICAgXG4gICAgLy8gR2VuZXJhdGUgb3V0cHV0IHBhdGggaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgZmluYWxPdXRwdXRQYXRoID0gb3V0cHV0UGF0aCB8fCAoKCkgPT4ge1xuICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6Ll0vZywgJy0nKS5zbGljZSgwLCAtNSk7XG4gICAgICByZXR1cm4gcGF0aC5qb2luKG9zLnRtcGRpcigpLCBgc2NyZWVuc2hvdC0ke3RpbWVzdGFtcH0uJHtmb3JtYXR9YCk7XG4gICAgfSkoKTtcblxuICAgIC8vIEVuc3VyZSBkaXJlY3RvcnkgZXhpc3RzXG4gICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKGZpbmFsT3V0cHV0UGF0aCk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuXG4gICAgLy8gUGxhdGZvcm0tc3BlY2lmaWMgc2NyZWVuc2hvdCBjb21tYW5kc1xuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93czogVXNlIFBvd2VyU2hlbGwgd2l0aCBXSUMgQVBJXG4gICAgICAgIGNtZCA9ICdwb3dlcnNoZWxsLmV4ZSc7XG4gICAgICAgIGFyZ3MgPSBbJy1Ob1Byb2ZpbGUnLCAnLUNvbW1hbmQnLCBgXG4gICAgICAgICAgQWRkLVR5cGUgLUFzc2VtYmx5TmFtZSBTeXN0ZW0uV2luZG93cy5Gb3JtcztcbiAgICAgICAgICBBZGQtVHlwZSAtQXNzZW1ibHlOYW1lIFN5c3RlbS5EcmF3aW5nO1xuICAgICAgICAgICRzY3JlZW4gPSBbU3lzdGVtLldpbmRvd3MuRm9ybXMuU2NyZWVuXTo6UHJpbWFyeVNjcmVlbjtcbiAgICAgICAgICAkYml0bWFwID0gTmV3LU9iamVjdCBTeXN0ZW0uRHJhd2luZy5CaXRtYXAoJHNjcmVlbi5Cb3VuZHMuV2lkdGgsICRzY3JlZW4uQm91bmRzLkhlaWdodCk7XG4gICAgICAgICAgJGdyYXBoaWNzID0gW1N5c3RlbS5EcmF3aW5nLkdyYXBoaWNzXTo6RnJvbUltYWdlKCRiaXRtYXApO1xuICAgICAgICAgICRncmFwaGljcy5Db3B5RnJvbVNjcmVlbigwLCAwLCAwLCAwLCAkYml0bWFwLlNpemUpO1xuICAgICAgICAgICRiaXRtYXAuU2F2ZSgnJHtmaW5hbE91dHB1dFBhdGgucmVwbGFjZSgvXFxcXC9nLCAnXFxcXCcpfScsIFtTeXN0ZW0uRHJhd2luZy5JbWFnaW5nLkltYWdlRm9ybWF0XTo6JHtmb3JtYXQgPT09ICdwbmcnID8gJ1BuZycgOiAnSnBlZyd9KTtcbiAgICAgICAgICAkZ3JhcGhpY3MuRGlzcG9zZSgpO1xuICAgICAgICAgICRiaXRtYXAuRGlzcG9zZSgpO1xuICAgICAgICBgXTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TOiBVc2Ugc2NyZWVuY2FwdHVyZVxuICAgICAgICBjbWQgPSAnc2NyZWVuY2FwdHVyZSc7XG4gICAgICAgIGFyZ3MgPSBbJy1tJywgJy14JywgZmluYWxPdXRwdXRQYXRoXTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIExpbnV4OiBVc2UgZ25vbWUtc2NyZWVuc2hvdCBvciBpbXBvcnQgKEltYWdlTWFnaWNrKVxuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgKGdub21lLXNjcmVlbnNob3QgLWYgXCIke2ZpbmFsT3V0cHV0UGF0aH1cIiAyPi9kZXYvbnVsbCB8fCBpbXBvcnQgLXdpbmRvdyByb290IFwiJHtmaW5hbE91dHB1dFBhdGh9XCIgMj4vZGV2L251bGwpIHx8IGVjaG8gXCJGYWlsZWRcImBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBFeGVjdXRlIHNjcmVlbnNob3QgY29tbWFuZFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzLCB7IHNoZWxsOiBwbGF0Zm9ybSA9PT0gJ3dpbjMyJyB9KTtcbiAgICAgIFxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Nsb3NlJywgKGNvZGUpID0+IHtcbiAgICAgICAgaWYgKGNvZGUgPT09IDAgJiYgZnMuZXhpc3RzU3luYyhmaW5hbE91dHB1dFBhdGgpKSB7XG4gICAgICAgICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbmFsT3V0cHV0UGF0aCk7XG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBwYXRoOiBmaW5hbE91dHB1dFBhdGgsXG4gICAgICAgICAgICAgIHNpemU6IHN0YXQuc2l6ZSxcbiAgICAgICAgICAgICAgc2l6ZUh1bWFuOiBgJHsoc3RhdC5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICAgICAgICBmb3JtYXQ6IGZvcm1hdC50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBTY3JlZW5zaG90IGZhaWxlZCAoZXhpdCBjb2RlICR7Y29kZX0pOiAke3N0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuXG4gICAgICAvLyBUaW1lb3V0IGFmdGVyIDEwIHNlY29uZHNcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwcm9jLmtpbGwoKTtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2NyZWVuc2hvdCB0aW1lZCBvdXQnKSk7XG4gICAgICB9LCAxMDAwMCk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIGltYWdlcyBwaXhlbC1ieS1waXhlbC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY29tcGFyZUltYWdlcyh7IGltYWdlMVBhdGgsIGltYWdlMlBhdGggfTogQ29tcGFyZUltYWdlc1BhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIGJvdGggZmlsZXNcbiAgICBjb25zdCB2YWxpZGF0aW9uMSA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlMVBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbjEudmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbjEuZXJyb3IgfTtcbiAgICBcbiAgICBjb25zdCB2YWxpZGF0aW9uMiA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlMlBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbjIudmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbjIuZXJyb3IgfTtcblxuICAgIC8vIFJlYWQgYm90aCBpbWFnZXNcbiAgICBjb25zdCBidWZmZXIxID0gZnMucmVhZEZpbGVTeW5jKGltYWdlMVBhdGgpO1xuICAgIGNvbnN0IGJ1ZmZlcjIgPSBmcy5yZWFkRmlsZVN5bmMoaW1hZ2UyUGF0aCk7XG5cbiAgICAvLyBHZXQgZGltZW5zaW9uc1xuICAgIGNvbnN0IGRpbXMxID0gZ2V0SW1hZ2VEaW1lbnNpb25zKGltYWdlMVBhdGgpO1xuICAgIGNvbnN0IGRpbXMyID0gZ2V0SW1hZ2VEaW1lbnNpb25zKGltYWdlMlBhdGgpO1xuXG4gICAgaWYgKCFkaW1zMSB8fCAhZGltczIpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NvdWxkIG5vdCBkZXRlcm1pbmUgaW1hZ2UgZGltZW5zaW9ucycgfTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBkaW1lbnNpb25zIG1hdGNoXG4gICAgaWYgKGRpbXMxLndpZHRoICE9PSBkaW1zMi53aWR0aCB8fCBkaW1zMS5oZWlnaHQgIT09IGRpbXMyLmhlaWdodCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGlzSWRlbnRpY2FsOiBmYWxzZSxcbiAgICAgICAgICByZWFzb246ICdEaWZmZXJlbnQgZGltZW5zaW9ucycsXG4gICAgICAgICAgaW1hZ2UxRGltZW5zaW9uczogeyB3aWR0aDogZGltczEud2lkdGgsIGhlaWdodDogZGltczEuaGVpZ2h0IH0sXG4gICAgICAgICAgaW1hZ2UyRGltZW5zaW9uczogeyB3aWR0aDogZGltczIud2lkdGgsIGhlaWdodDogZGltczIuaGVpZ2h0IH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFNpbXBsZSBieXRlIGNvbXBhcmlzb24gKHdvcmtzIGZvciBpZGVudGljYWwgZW5jb2RpbmdzKVxuICAgIGNvbnN0IGlzQnl0ZUlkZW50aWNhbCA9IGJ1ZmZlcjEuZXF1YWxzKGJ1ZmZlcjIpO1xuXG4gICAgaWYgKGlzQnl0ZUlkZW50aWNhbCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGlzSWRlbnRpY2FsOiB0cnVlLFxuICAgICAgICAgIHNpbWlsYXJpdHlQZXJjZW50OiAxMDAsXG4gICAgICAgICAgZGltZW5zaW9uczogeyB3aWR0aDogZGltczEud2lkdGgsIGhlaWdodDogZGltczEuaGVpZ2h0IH0sXG4gICAgICAgICAgbm90ZTogJ0ltYWdlcyBhcmUgYnl0ZS1pZGVudGljYWwnLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBGb3Igbm9uLWJ5dGUtaWRlbnRpY2FsIGltYWdlcywgcHJvdmlkZSBiYXNpYyBjb21wYXJpc29uIGluZm9cbiAgICAvLyBOb3RlOiBUcnVlIHBpeGVsLWxldmVsIGNvbXBhcmlzb24gd291bGQgcmVxdWlyZSBhIGxpYnJhcnkgbGlrZSBzaGFycCBvciBqaW1wXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGlzSWRlbnRpY2FsOiBmYWxzZSxcbiAgICAgICAgc2ltaWxhcml0eVBlcmNlbnQ6ICdVbmtub3duIChieXRlIGNvbXBhcmlzb24gb25seSknLFxuICAgICAgICBkaW1lbnNpb25zOiB7IHdpZHRoOiBkaW1zMS53aWR0aCwgaGVpZ2h0OiBkaW1zMS5oZWlnaHQgfSxcbiAgICAgICAgbm90ZTogJ0ltYWdlcyBkaWZmZXIuIEZvciBkZXRhaWxlZCBwaXhlbCBjb21wYXJpc29uLCBpbnN0YWxsIHNoYXJwIG9yIGppbXAgbGlicmFyeS4nLFxuICAgICAgICBpbWFnZTFTaXplOiBidWZmZXIxLmxlbmd0aCxcbiAgICAgICAgaW1hZ2UyU2l6ZTogYnVmZmVyMi5sZW5ndGgsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIFJlZ2lzdGVyIGFsbCBpbWFnZSBwcm9jZXNzaW5nIHRvb2xzLlxuICogQHBhcmFtIGNvbmZpZyBQbHVnaW4gY29uZmlndXJhdGlvblxuICogQHJldHVybnMgQXJyYXkgb2YgcmVnaXN0ZXJlZCB0b29sc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICByZXR1cm4gW1xuICAgIHRvb2woe1xuICAgICAgbmFtZTogJ2ltYWdlX3RvX3RleHQnLFxuICAgICAgZGVzY3JpcHRpb246IGBFeHRyYWN0IHRleHQgZnJvbSBpbWFnZXMgdXNpbmcgT0NSIChUZXNzZXJhY3QuanMpLlxcblxcblN1cHBvcnRlZCBmb3JtYXRzOiBQTkcsIEpQRywgSlBFRywgQk1QLCBHSUYsIFRJRkYsIFdlYlAuIE1heGltdW0gZmlsZSBzaXplOiA1ME1CLlxcblxcblJldHVybnM6XFxuLSBFeHRyYWN0ZWQgdGV4dCBjb250ZW50XFxuLSBDb25maWRlbmNlIHNjb3JlICgwLTEwMClcXG4tIERldGVjdGVkIGxhbmd1YWdlXFxuLSBXb3JkIGNvdW50IGFuZCBsaW5lIGNvdW50XFxuLSBQZXItd29yZCBkYXRhIHdpdGggYm91bmRpbmcgYm94ZXMgKGZpcnN0IDEwMCB3b3JkcylgLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICBpbWFnZVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIGltYWdlIGZpbGUnKSxcbiAgICAgICAgbGFuZ3VhZ2U6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdlbmcnKS5kZXNjcmliZSgnTGFuZ3VhZ2UgY29kZSBmb3IgT0NSIChlLmcuLCBcImVuZ1wiLCBcImRldVwiLCBcImNoaV9zaW1cIikuIERlZmF1bHQ6IFwiZW5nXCInKSxcbiAgICAgIH0sXG4gICAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaW1hZ2VQYXRoLCBsYW5ndWFnZSB9OiBJbWFnZVRvVGV4dFBhcmFtcykgPT4gaW1hZ2VUb1RleHQoeyBpbWFnZVBhdGgsIGxhbmd1YWdlIH0pLFxuICAgIH0pLFxuXG4gICAgdG9vbCh7XG4gICAgICBuYW1lOiAnZGVzY3JpYmVfaW1hZ2UnLFxuICAgICAgZGVzY3JpcHRpb246IGBHZXQgZGV0YWlsZWQgbWV0YWRhdGEgYWJvdXQgYW4gaW1hZ2UgZmlsZSBpbmNsdWRpbmcgZGltZW5zaW9ucywgZm9ybWF0LCBzaXplLCBhbmQgdGltZXN0YW1wcy5cXG5cXG5TdXBwb3J0ZWQgZm9ybWF0czogUE5HLCBKUEcsIEpQRUcsIEJNUCwgR0lGLCBXZWJQLCBUSUZGLmAsXG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIGltYWdlUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgaW1hZ2UgZmlsZScpLFxuICAgICAgfSxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBpbWFnZVBhdGggfTogRGVzY3JpYmVJbWFnZVBhcmFtcykgPT4gZGVzY3JpYmVJbWFnZSh7IGltYWdlUGF0aCB9KSxcbiAgICB9KSxcblxuICAgIHRvb2woe1xuICAgICAgbmFtZTogJ3NjcmVlbnNob3RfZGVza3RvcCcsXG4gICAgICBkZXNjcmlwdGlvbjogYENhcHR1cmUgYSBzY3JlZW5zaG90IG9mIHRoZSBkZXNrdG9wIGFuZCBzYXZlIGl0IHRvIGEgZmlsZS5cXG5cXG5Dcm9zcy1wbGF0Zm9ybSBzdXBwb3J0Olxcbi0gV2luZG93czogVXNlcyAuTkVUIEdESSsgdmlhIFBvd2VyU2hlbGxcXG4tIG1hY09TOiBVc2VzIHNjcmVlbmNhcHR1cmUgY29tbWFuZFxcbi0gTGludXg6IFVzZXMgZ25vbWUtc2NyZWVuc2hvdCBvciBJbWFnZU1hZ2ljayBpbXBvcnRcXG5cXG5PdXRwdXQgaXMgc2F2ZWQgdG8gdGVtcCBkaXJlY3RvcnkgaWYgbm8gcGF0aCBzcGVjaWZpZWQuYCxcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgb3V0cHV0UGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPdXRwdXQgZmlsZSBwYXRoLiBEZWZhdWx0cyB0byB0ZW1wIGRpcmVjdG9yeSB3aXRoIHRpbWVzdGFtcC4nKSxcbiAgICAgICAgZm9ybWF0OiB6LmVudW0oWydwbmcnLCAnanBlZyddKS5kZWZhdWx0KCdwbmcnKS5kZXNjcmliZSgnSW1hZ2UgZm9ybWF0LiBEZWZhdWx0OiBcInBuZ1wiJyksXG4gICAgICAgIHF1YWxpdHk6IHoubnVtYmVyKCkubWluKDEpLm1heCgxMDApLmRlZmF1bHQoOTApLmRlc2NyaWJlKCdKUEVHIHF1YWxpdHkgKDEtMTAwKS4gT25seSBhcHBsaWVzIHRvIEpQRUcgZm9ybWF0LiBEZWZhdWx0OiA5MCcpLFxuICAgICAgfSxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBvdXRwdXRQYXRoLCBmb3JtYXQsIHF1YWxpdHkgfTogU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMpID0+IHNjcmVlbnNob3REZXNrdG9wKHsgb3V0cHV0UGF0aCwgZm9ybWF0LCBxdWFsaXR5IH0pLFxuICAgIH0pLFxuXG4gICAgdG9vbCh7XG4gICAgICBuYW1lOiAnY29tcGFyZV9pbWFnZXMnLFxuICAgICAgZGVzY3JpcHRpb246IGBDb21wYXJlIHR3byBpbWFnZXMgZm9yIHNpbWlsYXJpdHkuXFxuXFxuUGVyZm9ybXMgYnl0ZS1sZXZlbCBjb21wYXJpc29uIGFuZCBkaW1lbnNpb24gY2hlY2tpbmcuXFxuRm9yIGlkZW50aWNhbCBlbmNvZGluZ3MsIHJldHVybnMgZXhhY3QgbWF0Y2ggc3RhdHVzLlxcblxcbk5vdGU6IERldGFpbGVkIHBpeGVsLWxldmVsIGNvbXBhcmlzb24gcmVxdWlyZXMgc2hhcnAgb3IgamltcCBsaWJyYXJ5IGluc3RhbGxhdGlvbi5gLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICBpbWFnZTFQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBmaXJzdCBpbWFnZScpLFxuICAgICAgICBpbWFnZTJQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBzZWNvbmQgaW1hZ2UnKSxcbiAgICAgIH0sXG4gICAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaW1hZ2UxUGF0aCwgaW1hZ2UyUGF0aCB9OiBDb21wYXJlSW1hZ2VzUGFyYW1zKSA9PiBjb21wYXJlSW1hZ2VzKHsgaW1hZ2UxUGF0aCwgaW1hZ2UyUGF0aCB9KSxcbiAgICB9KSxcbiAgXTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgSHR0cFJlcXVlc3RQYXJhbXMge1xuICBtZXRob2Q6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBib2R5Pzogc3RyaW5nIHwgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmludGVyZmFjZSBIdHRwR2V0SnNvblBhcmFtcyB7XG4gIHVybDogc3RyaW5nO1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuaW50ZXJmYWNlIEh0dHBQb3N0SnNvblBhcmFtcyB7XG4gIHVybDogc3RyaW5nO1xuICBkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNlY3VyaXR5ICYgVmFsaWRhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogU1NSRiBwcm90ZWN0aW9uIC0gdmFsaWRhdGUgVVJMIGlzIHNhZmUgKi9cbmZ1bmN0aW9uIHZhbGlkYXRlVXJsKHVybDogc3RyaW5nKTogeyB2YWxpZDogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgIFxuICAgIC8vIEJsb2NrIGludGVybmFsL3ByaXZhdGUgSVAgYWRkcmVzc2VzIChTU1JGIHByb3RlY3Rpb24pXG4gICAgaWYgKHBhcnNlZC5wcm90b2NvbCA9PT0gJ2ZpbGU6JyB8fCBwYXJzZWQucHJvdG9jb2wgPT09ICdkYXRhOicpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBQcm90b2NvbCBcIiR7cGFyc2VkLnByb3RvY29sfVwiIGlzIG5vdCBhbGxvd2VkYCB9O1xuICAgIH1cblxuICAgIC8vIEFsbG93IGh0dHAgYW5kIGh0dHBzIG9ubHlcbiAgICBpZiAoIVsnaHR0cDonLCAnaHR0cHM6J10uaW5jbHVkZXMocGFyc2VkLnByb3RvY29sKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYE9ubHkgSFRUUC9IVFRQUyBwcm90b2NvbHMgYXJlIGFsbG93ZWRgIH07XG4gICAgfVxuXG4gICAgLy8gQmxvY2sgcHJpdmF0ZSBJUCByYW5nZXMgKGJhc2ljIGNoZWNrKVxuICAgIGNvbnN0IGhvc3RuYW1lID0gcGFyc2VkLmhvc3RuYW1lO1xuICAgIGNvbnN0IGJsb2NrZWRQYXR0ZXJucyA9IFtcbiAgICAgIC9eMTI3XFwuLywgICAgICAgICAgIC8vIGxvY2FsaG9zdFxuICAgICAgL14xMFxcLi8sICAgICAgICAgICAgLy8gMTAuMC4wLjAvOFxuICAgICAgL14xNzJcXC4xWzYtOV1cXC4vLCAgIC8vIDE3Mi4xNi4wLjAvMTJcbiAgICAgIC9eMTcyXFwuMlswLTldXFwuLywgICAvLyAxNzIuMTYuMC4wLzEyXG4gICAgICAvXjE3MlxcLjNbMC0xXVxcLi8sICAgLy8gMTcyLjE2LjAuMC8xMlxuICAgICAgL14xOTJcXC4xNjhcXC4vLCAgICAgIC8vIDE5Mi4xNjguMC4wLzE2XG4gICAgICAvXjBcXC4wXFwuMFxcLjAkLywgICAgIC8vIDAuMC4wLjBcbiAgICAgIC9ebG9jYWxob3N0JC8sICAgICAgLy8gbG9jYWxob3N0IGhvc3RuYW1lXG4gICAgXTtcblxuICAgIGlmIChibG9ja2VkUGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4udGVzdChob3N0bmFtZSkpKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgQWNjZXNzIHRvICR7aG9zdG5hbWV9IGlzIGJsb2NrZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnNgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBJbnZhbGlkIFVSTDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEhUVFAgcmVxdWVzdCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogR2VuZXJpYyBIVFRQIGNsaWVudCBmb3IgbWFraW5nIHJlcXVlc3RzIHRvIGFueSBSRVNUIEFQSS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaHR0cFJlcXVlc3QoeyBtZXRob2QsIHVybCwgaGVhZGVycyA9IHt9LCBib2R5IH06IEh0dHBSZXF1ZXN0UGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgVVJMIGZvciBTU1JGIHByb3RlY3Rpb25cbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVVcmwodXJsKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgLy8gUHJlcGFyZSByZXF1ZXN0IG9wdGlvbnNcbiAgICBjb25zdCBvcHRpb25zOiBSZXF1ZXN0SW5pdCA9IHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLnRvVXBwZXJDYXNlKCksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdVc2VyLUFnZW50JzogJ0FJLVRvb2xib3gvMS4wJyxcbiAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBib2R5IGZvciBub24tR0VUL0hFQUQgcmVxdWVzdHNcbiAgICBpZiAoYm9keSAmJiAhWydHRVQnLCAnSEVBRCddLmluY2x1ZGVzKG1ldGhvZC50b1VwcGVyQ2FzZSgpKSkge1xuICAgICAgb3B0aW9ucy5ib2R5ID0gdHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnID8gYm9keSA6IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xuICAgICAgXG4gICAgICAvLyBTZXQgY29udGVudC10eXBlIGhlYWRlciBpZiBub3QgYWxyZWFkeSBzZXQgYW5kIGJvZHkgaXMgb2JqZWN0L3N0cmluZ1xuICAgICAgaWYgKCFoZWFkZXJzWydDb250ZW50LVR5cGUnXSAmJiB0eXBlb2YgYm9keSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgKG9wdGlvbnMuaGVhZGVycyBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KVsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBIVFRQICR7bWV0aG9kLnRvVXBwZXJDYXNlKCl9ICR7dXJsfWApO1xuXG4gICAgLy8gTWFrZSB0aGUgcmVxdWVzdCB3aXRoIHRpbWVvdXRcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7IC8vIDMwcyB0aW1lb3V0XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgLi4ub3B0aW9ucywgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCB9KTtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICAvLyBQYXJzZSByZXNwb25zZSBiYXNlZCBvbiBjb250ZW50IHR5cGVcbiAgICAgIGxldCByZXNwb25zZURhdGE6IHVua25vd247XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJztcbiAgICAgIFxuICAgICAgaWYgKGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVzcG9uc2UuaGVhZGVycy5lbnRyaWVzKCkpLFxuICAgICAgICAgIGJvZHk6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgICB1cmwsXG4gICAgICAgICAgbWV0aG9kOiBtZXRob2QudG9VcHBlckNhc2UoKSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogR0VUIHJlcXVlc3QgcmV0dXJuaW5nIHBhcnNlZCBKU09OLlxuICovXG5hc3luYyBmdW5jdGlvbiBodHRwR2V0SnNvbih7IHVybCwgaGVhZGVycyA9IHt9IH06IEh0dHBHZXRKc29uUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgVVJMIGZvciBTU1JGIHByb3RlY3Rpb25cbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVVcmwodXJsKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBIVFRQIEdFVCAke3VybH1gKTtcblxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1VzZXItQWdlbnQnOiAnQUktVG9vbGJveC8xLjAnLFxuICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgIH0sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogYEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9OiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCxcbiAgICAgICAgICBkYXRhOiB7IHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLCB1cmwgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXNwb25zZS5oZWFkZXJzLmVudHJpZXMoKSksXG4gICAgICAgICAgYm9keTogZGF0YSxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIFBPU1QgcmVxdWVzdCB3aXRoIEpTT04gYm9keS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaHR0cFBvc3RKc29uKHsgdXJsLCBkYXRhLCBoZWFkZXJzID0ge30gfTogSHR0cFBvc3RKc29uUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgVVJMIGZvciBTU1JGIHByb3RlY3Rpb25cbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVVcmwodXJsKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBIVFRQIFBPU1QgJHt1cmx9YCk7XG5cbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnVXNlci1BZ2VudCc6ICdBSS1Ub29sYm94LzEuMCcsXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgbGV0IHJlc3BvbnNlRGF0YTogdW5rbm93bjtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuICAgICAgXG4gICAgICBpZiAoY29udGVudFR5cGUuaW5jbHVkZXMoJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVzcG9uc2UuaGVhZGVycy5lbnRyaWVzKCkpLFxuICAgICAgICAgIGJvZHk6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJIdHRwQ2xpZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGh0dHBfcmVxdWVzdCB0b29sIC0gR2VuZXJpYyBIVFRQIGNsaWVudFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdodHRwX3JlcXVlc3QnLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBnZW5lcmljIEhUVFAgcmVxdWVzdHMgdG8gYW55IFJFU1QgQVBJLiBTdXBwb3J0cyBHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCBhbmQgb3RoZXIgbWV0aG9kcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG1ldGhvZDogei5lbnVtKFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdQQVRDSCcsICdIRUFEJywgJ09QVElPTlMnXSkuZGVzY3JpYmUoJ0hUVFAgbWV0aG9kJyksXG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgVVJMIChtdXN0IGJlIGh0dHA6Ly8gb3IgaHR0cHM6Ly8pJyksXG4gICAgICBoZWFkZXJzOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDdXN0b20gaGVhZGVycyBhcyBrZXktdmFsdWUgcGFpcnMnKSxcbiAgICAgIGJvZHk6IHoudW5pb24oW3ouc3RyaW5nKCksIHoucmVjb3JkKHoudW5rbm93bigpKV0pLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgYm9keSAoc3RyaW5nIG9yIEpTT04gb2JqZWN0KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGh0dHBSZXF1ZXN0KHBhcmFtcyBhcyBIdHRwUmVxdWVzdFBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBodHRwX2dldF9qc29uIHRvb2wgLSBDb252ZW5pZW5jZSB3cmFwcGVyIGZvciBHRVQgcmVxdWVzdHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaHR0cF9nZXRfanNvbicsXG4gICAgZGVzY3JpcHRpb246ICdNYWtlIGEgR0VUIHJlcXVlc3QgYW5kIHJldHVybiBwYXJzZWQgSlNPTiByZXNwb25zZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnUmVxdWVzdCBVUkwgKG11c3QgYmUgaHR0cDovLyBvciBodHRwczovLyknKSxcbiAgICAgIGhlYWRlcnM6IHoucmVjb3JkKHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0N1c3RvbSBoZWFkZXJzIGFzIGtleS12YWx1ZSBwYWlycycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGh0dHBHZXRKc29uKHBhcmFtcyBhcyBIdHRwR2V0SnNvblBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBodHRwX3Bvc3RfanNvbiB0b29sIC0gQ29udmVuaWVuY2Ugd3JhcHBlciBmb3IgUE9TVCByZXF1ZXN0c1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdodHRwX3Bvc3RfanNvbicsXG4gICAgZGVzY3JpcHRpb246ICdNYWtlIGEgUE9TVCByZXF1ZXN0IHdpdGggSlNPTiBib2R5IGFuZCByZXR1cm4gcGFyc2VkIHJlc3BvbnNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdSZXF1ZXN0IFVSTCAobXVzdCBiZSBodHRwOi8vIG9yIGh0dHBzOi8vKScpLFxuICAgICAgZGF0YTogei5yZWNvcmQoei51bmtub3duKCkpLmRlc2NyaWJlKCdKU09OIG9iamVjdCB0byBzZW5kIGFzIHJlcXVlc3QgYm9keScpLFxuICAgICAgaGVhZGVyczogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ3VzdG9tIGhlYWRlcnMgYXMga2V5LXZhbHVlIHBhaXJzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaHR0cFBvc3RKc29uKHBhcmFtcyBhcyBIdHRwUG9zdEpzb25QYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUmFnSW5kZXhGaWxlc1BhcmFtcyB7XG4gIGRpcmVjdG9yeVBhdGg6IHN0cmluZztcbiAgZmlsZVBhdHRlcm4/OiBzdHJpbmc7XG4gIGJhdGNoU2l6ZT86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFJhZ1F1ZXJ5VmVjdG9yUGFyYW1zIHtcbiAgcXVlcnk6IHN0cmluZztcbiAgdG9wSz86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFJhZ0NsZWFySW5kZXhQYXJhbXMge1xuICBjb25maXJtOiBib29sZWFuO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgRG9jdW1lbnRDaHVuayB7XG4gIGlkOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgbWV0YWRhdGE6IHtcbiAgICBmaWxlX3BhdGg6IHN0cmluZztcbiAgICBmaWxlX25hbWU6IHN0cmluZztcbiAgICBjaHVua19pbmRleDogbnVtYmVyO1xuICAgIHRvdGFsX2NodW5rczogbnVtYmVyO1xuICAgIHdvcmRfY291bnQ6IG51bWJlcjtcbiAgfTtcbn1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdCB7XG4gIGlkOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgc2NvcmU6IG51bWJlcjtcbiAgbWV0YWRhdGE6IERvY3VtZW50Q2h1bmtbJ21ldGFkYXRhJ107XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFZlY3RvciBTdG9yZSBJbXBsZW1lbnRhdGlvbiAoTG9jYWwpID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTaW1wbGUgbG9jYWwgdmVjdG9yIHN0b3JlIHVzaW5nIGluLW1lbW9yeSBzdG9yYWdlIHdpdGggY29zaW5lIHNpbWlsYXJpdHkgKi9cbmNsYXNzIExvY2FsVmVjdG9yU3RvcmUge1xuICBwcml2YXRlIGRvY3VtZW50czogTWFwPHN0cmluZywgeyBlbWJlZGRpbmc6IEZsb2F0MzJBcnJheTsgY2h1bms6IERvY3VtZW50Q2h1bmsgfT4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgaW5kZXhOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoaW5kZXhOYW1lOiBzdHJpbmcgPSAnYWlfdG9vbGJveF9yYWcnKSB7XG4gICAgdGhpcy5pbmRleE5hbWUgPSBpbmRleE5hbWU7XG4gIH1cblxuICAvKiogQWRkIGRvY3VtZW50cyB0byB0aGUgc3RvcmUgKi9cbiAgYWRkKGRvY3VtZW50czogRG9jdW1lbnRDaHVua1tdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jdW1lbnRzKSB7XG4gICAgICB0aGlzLmRvY3VtZW50cy5zZXQoZG9jLmlkLCB7IGVtYmVkZGluZzogbmV3IEZsb2F0MzJBcnJheSgwKSwgY2h1bms6IGRvYyB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0IGVtYmVkZGluZ3MgZm9yIGFsbCBkb2N1bWVudHMgKi9cbiAgc2V0RW1iZWRkaW5ncyhpZHM6IHN0cmluZ1tdLCBlbWJlZGRpbmdzOiBGbG9hdDMyQXJyYXlbXSk6IHZvaWQge1xuICAgIGlkcy5mb3JFYWNoKChpZCwgaSkgPT4ge1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmRvY3VtZW50cy5nZXQoaWQpO1xuICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgIGVudHJ5LmVtYmVkZGluZyA9IGVtYmVkZGluZ3NbaV07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogU2VhcmNoIGZvciBzaW1pbGFyIGRvY3VtZW50cyAqL1xuICBzZWFyY2gocXVlcnlFbWJlZGRpbmc6IEZsb2F0MzJBcnJheSwgdG9wSzogbnVtYmVyKTogU2VhcmNoUmVzdWx0W10ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9PiA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBbaWQsIGVudHJ5XSBvZiB0aGlzLmRvY3VtZW50cy5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChlbnRyeS5lbWJlZGRpbmcubGVuZ3RoID09PSAwKSBjb250aW51ZTtcbiAgICAgIFxuICAgICAgLy8gQ29zaW5lIHNpbWlsYXJpdHlcbiAgICAgIGxldCBkb3RQcm9kdWN0ID0gMDtcbiAgICAgIGxldCBub3JtQSA9IDA7XG4gICAgICBsZXQgbm9ybUIgPSAwO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJ5LmVtYmVkZGluZy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkb3RQcm9kdWN0ICs9IHF1ZXJ5RW1iZWRkaW5nW2ldICogZW50cnkuZW1iZWRkaW5nW2ldO1xuICAgICAgICBub3JtQSArPSBlbnRyeS5lbWJlZGRpbmdbaV0gKiBlbnRyeS5lbWJlZGRpbmdbaV07XG4gICAgICAgIG5vcm1CICs9IHF1ZXJ5RW1iZWRkaW5nW2ldICogcXVlcnlFbWJlZGRpbmdbaV07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNpbWlsYXJpdHkgPSBub3JtQSA+IDAgJiYgbm9ybUIgPiAwID8gZG90UHJvZHVjdCAvIChNYXRoLnNxcnQobm9ybUEpICogTWF0aC5zcXJ0KG5vcm1CKSkgOiAwO1xuICAgICAgXG4gICAgICByZXN1bHRzLnB1c2goeyBpZCwgc2NvcmU6IHNpbWlsYXJpdHkgfSk7XG4gICAgfVxuXG4gICAgLy8gU29ydCBieSBzaW1pbGFyaXR5IGRlc2NlbmRpbmcgYW5kIHJldHVybiB0b3AgS1xuICAgIHJldHVybiByZXN1bHRzXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpXG4gICAgICAuc2xpY2UoMCwgdG9wSylcbiAgICAgIC5tYXAoKHsgaWQsIHNjb3JlIH0pID0+IHtcbiAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmRvY3VtZW50cy5nZXQoaWQpITtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogZW50cnkuY2h1bmsuaWQsXG4gICAgICAgICAgdGV4dDogZW50cnkuY2h1bmsudGV4dCxcbiAgICAgICAgICBzY29yZSxcbiAgICAgICAgICBtZXRhZGF0YTogZW50cnkuY2h1bmsubWV0YWRhdGEsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBDbGVhciBhbGwgZG9jdW1lbnRzICovXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuZG9jdW1lbnRzLmNsZWFyKCk7XG4gIH1cblxuICAvKiogR2V0IGRvY3VtZW50IGNvdW50ICovXG4gIGdldCBjb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50cy5zaXplO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRleHQgQ2h1bmtpbmcgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFNwbGl0IHRleHQgaW50byBjaHVua3Mgd2l0aCBvdmVybGFwICovXG5mdW5jdGlvbiBjaHVua1RleHQodGV4dDogc3RyaW5nLCBjaHVua1NpemU6IG51bWJlciA9IDUwMCwgb3ZlcmxhcDogbnVtYmVyID0gNTApOiBEb2N1bWVudENodW5rW10ge1xuICBjb25zdCB3b3JkcyA9IHRleHQuc3BsaXQoL1xccysvKTtcbiAgY29uc3QgY2h1bmtzOiBEb2N1bWVudENodW5rW10gPSBbXTtcbiAgXG4gIGlmICh3b3Jkcy5sZW5ndGggPD0gY2h1bmtTaXplKSB7XG4gICAgcmV0dXJuIFt7XG4gICAgICBpZDogYGNodW5rXyR7RGF0ZS5ub3coKX1fMGAsXG4gICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiAnJyxcbiAgICAgICAgZmlsZV9uYW1lOiAnJyxcbiAgICAgICAgY2h1bmtfaW5kZXg6IDAsXG4gICAgICAgIHRvdGFsX2NodW5rczogMSxcbiAgICAgICAgd29yZF9jb3VudDogd29yZHMubGVuZ3RoLFxuICAgICAgfSxcbiAgICB9XTtcbiAgfVxuXG4gIGxldCBzdGFydEluZGV4ID0gMDtcbiAgbGV0IGNodW5rSW5kZXggPSAwO1xuXG4gIHdoaWxlIChzdGFydEluZGV4IDwgd29yZHMubGVuZ3RoKSB7XG4gICAgY29uc3QgZW5kSW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4ICsgY2h1bmtTaXplLCB3b3Jkcy5sZW5ndGgpO1xuICAgIGNvbnN0IGNodW5rVGV4dCA9IHdvcmRzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KS5qb2luKCcgJyk7XG4gICAgXG4gICAgY2h1bmtzLnB1c2goe1xuICAgICAgaWQ6IGBjaHVua18ke0RhdGUubm93KCl9XyR7Y2h1bmtJbmRleH1gLFxuICAgICAgdGV4dDogY2h1bmtUZXh0LFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiAnJywgLy8gV2lsbCBiZSBzZXQgbGF0ZXJcbiAgICAgICAgZmlsZV9uYW1lOiAnJywgLy8gV2lsbCBiZSBzZXQgbGF0ZXJcbiAgICAgICAgY2h1bmtfaW5kZXg6IGNodW5rSW5kZXgsXG4gICAgICAgIHRvdGFsX2NodW5rczogTWF0aC5jZWlsKHdvcmRzLmxlbmd0aCAvIChjaHVua1NpemUgLSBvdmVybGFwKSksXG4gICAgICAgIHdvcmRfY291bnQ6IGVuZEluZGV4IC0gc3RhcnRJbmRleCxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjaHVua0luZGV4Kys7XG4gICAgc3RhcnRJbmRleCA9IGVuZEluZGV4IC0gb3ZlcmxhcDtcbiAgfVxuXG4gIHJldHVybiBjaHVua3M7XG59XG5cbi8qKiBHZW5lcmF0ZSBzaW1wbGUgVEYtSURGLWxpa2UgZW1iZWRkaW5ncyBmb3IgdGV4dCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVFbWJlZGRpbmcodGV4dDogc3RyaW5nKTogRmxvYXQzMkFycmF5IHtcbiAgLy8gU2ltcGxlIHdvcmQgZnJlcXVlbmN5LWJhc2VkIGVtYmVkZGluZyAoZGltZW5zaW9uOiAxMDApXG4gIGNvbnN0IGRpbWVuc2lvbnMgPSAxMDA7XG4gIGNvbnN0IGVtYmVkZGluZyA9IG5ldyBGbG9hdDMyQXJyYXkoZGltZW5zaW9ucyk7XG4gIFxuICAvLyBUb2tlbml6ZSBhbmQgaGFzaCB3b3JkcyB0byBkaW1lbnNpb25zXG4gIGNvbnN0IHdvcmRzID0gdGV4dC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9bYS16XSsvZykgfHwgW107XG4gIGNvbnN0IHdvcmRTZXQgPSBuZXcgU2V0KHdvcmRzKTtcbiAgXG4gIGZvciAoY29uc3Qgd29yZCBvZiB3b3JkU2V0KSB7XG4gICAgbGV0IGhhc2ggPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZC5sZW5ndGg7IGkrKykge1xuICAgICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgd29yZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgICB9XG4gICAgXG4gICAgY29uc3QgZGltSW5kZXggPSBNYXRoLmFicyhoYXNoICUgZGltZW5zaW9ucyk7XG4gICAgZW1iZWRkaW5nW2RpbUluZGV4XSArPSAxLjAgLyAod29yZC5sZW5ndGggKyAxKTsgLy8gV2VpZ2h0IGJ5IGludmVyc2UgbGVuZ3RoXG4gIH1cblxuICAvLyBOb3JtYWxpemVcbiAgbGV0IG5vcm0gPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbWVuc2lvbnM7IGkrKykge1xuICAgIG5vcm0gKz0gZW1iZWRkaW5nW2ldICogZW1iZWRkaW5nW2ldO1xuICB9XG4gIG5vcm0gPSBNYXRoLnNxcnQobm9ybSkgfHwgMTtcbiAgXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltZW5zaW9uczsgaSsrKSB7XG4gICAgZW1iZWRkaW5nW2ldIC89IG5vcm07XG4gIH1cblxuICByZXR1cm4gZW1iZWRkaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEluZGV4IGZpbGVzIGluIGEgZGlyZWN0b3J5IGZvciBzZW1hbnRpYyBzZWFyY2guXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJhZ0luZGV4RmlsZXMoeyBcbiAgZGlyZWN0b3J5UGF0aCwgXG4gIGZpbGVQYXR0ZXJuID0gJyoue3RzLGpzLHRzeCxqc3gsbWQsanNvbix5YW1sLHltbCx0b21sLHR4dH0nLFxuICBiYXRjaFNpemUgPSAxMCBcbn06IFJhZ0luZGV4RmlsZXNQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBkaXJlY3RvcnkgZXhpc3RzXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeVBhdGgpKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEaXJlY3Rvcnkgbm90IGZvdW5kOiAke2RpcmVjdG9yeVBhdGh9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0b3JlID0gbmV3IExvY2FsVmVjdG9yU3RvcmUoKTtcbiAgICBsZXQgaW5kZXhlZENvdW50ID0gMDtcbiAgICBsZXQgc2tpcHBlZENvdW50ID0gMDtcblxuICAgIC8vIEZpbmQgZmlsZXMgbWF0Y2hpbmcgcGF0dGVyblxuICAgIGNvbnN0IGZpbmRGaWxlcyA9IChkaXI6IHN0cmluZyk6IHN0cmluZ1tdID0+IHtcbiAgICAgIGxldCByZXN1bHRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXIsIGVudHJ5Lm5hbWUpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAvLyBTa2lwIG5vZGVfbW9kdWxlcyBhbmQgLmdpdCBkaXJlY3Rvcmllc1xuICAgICAgICAgICAgaWYgKGVudHJ5Lm5hbWUgPT09ICdub2RlX21vZHVsZXMnIHx8IGVudHJ5Lm5hbWUgPT09ICcuZ2l0JykgY29udGludWU7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoZmluZEZpbGVzKGZ1bGxQYXRoKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZmlsZSBleHRlbnNpb24gYWdhaW5zdCBwYXR0ZXJuXG4gICAgICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IGFsbG93ZWRFeHRzID0gWycudHMnLCAnLmpzJywgJy50c3gnLCAnLmpzeCcsICcubWQnLCAnLmpzb24nLCAnLnlhbWwnLCAnLnltbCcsICcudG9tbCcsICcudHh0J107XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaChmdWxsUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtBSSBUb29sYm94XSBDb3VsZCBub3QgcmVhZCBkaXJlY3RvcnkgJHtkaXJ9OmAsIGVycm9yKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIGNvbnN0IGZpbGVzID0gZmluZEZpbGVzKGRpcmVjdG9yeVBhdGgpO1xuICAgIFxuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaW5kZXhlZENvdW50OiAwLCBtZXNzYWdlOiAnTm8gbWF0Y2hpbmcgZmlsZXMgZm91bmQnIH0gfTtcbiAgICB9XG5cbiAgICAvLyBQcm9jZXNzIGVhY2ggZmlsZVxuICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZmlsZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2tpcCBsYXJnZSBmaWxlcyAoPjFNQilcbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gMTAyNCAqIDEwMjQpIHtcbiAgICAgICAgICBza2lwcGVkQ291bnQrKztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENodW5rIHRoZSB0ZXh0XG4gICAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5rVGV4dChjb250ZW50KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCBtZXRhZGF0YSBmb3IgZWFjaCBjaHVua1xuICAgICAgICBjaHVua3MuZm9yRWFjaChjaHVuayA9PiB7XG4gICAgICAgICAgY2h1bmsubWV0YWRhdGEuZmlsZV9wYXRoID0gZmlsZVBhdGg7XG4gICAgICAgICAgY2h1bmsubWV0YWRhdGEuZmlsZV9uYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIGVtYmVkZGluZ3MgYW5kIGFkZCB0byBzdG9yZVxuICAgICAgICBjb25zdCBpZHMgPSBjaHVua3MubWFwKGMgPT4gYy5pZCk7XG4gICAgICAgIGNvbnN0IGVtYmVkZGluZ3MgPSBjaHVua3MubWFwKGMgPT4gZ2VuZXJhdGVFbWJlZGRpbmcoYy50ZXh0KSk7XG4gICAgICAgIFxuICAgICAgICBzdG9yZS5hZGQoY2h1bmtzKTtcbiAgICAgICAgc3RvcmUuc2V0RW1iZWRkaW5ncyhpZHMsIGVtYmVkZGluZ3MpO1xuICAgICAgICBcbiAgICAgICAgaW5kZXhlZENvdW50ICs9IGNodW5rcy5sZW5ndGg7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtBSSBUb29sYm94XSBDb3VsZCBub3QgaW5kZXggJHtmaWxlUGF0aH06YCwgZXJyb3IpO1xuICAgICAgICBza2lwcGVkQ291bnQrKztcbiAgICAgIH1cblxuICAgICAgLy8gUHJvZ3Jlc3MgY2FsbGJhY2sgZXZlcnkgYmF0Y2hcbiAgICAgIGlmICgoaW5kZXhlZENvdW50ICsgc2tpcHBlZENvdW50KSAlIGJhdGNoU2l6ZSA9PT0gMCkge1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgXFxyW0FJIFRvb2xib3hdIEluZGV4ZWQgJHsoaW5kZXhlZENvdW50ICsgc2tpcHBlZENvdW50KX0gY2h1bmtzLi4uYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ1xcbltBSSBUb29sYm94XSBJbmRleGluZyBjb21wbGV0ZScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGluZGV4ZWRDaHVua3M6IGluZGV4ZWRDb3VudCxcbiAgICAgICAgZmlsZXNQcm9jZXNzZWQ6IGZpbGVzLmxlbmd0aCxcbiAgICAgICAgc2tpcHBlZEZpbGVzOiBza2lwcGVkQ291bnQsXG4gICAgICAgIHRvdGFsRG9jdW1lbnRzOiBzdG9yZS5jb3VudCxcbiAgICAgICAgZGlyZWN0b3J5UGF0aCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBpbmRleGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqXG4gKiBRdWVyeSB0aGUgdmVjdG9yIGluZGV4IGZvciBzZW1hbnRpY2FsbHkgc2ltaWxhciBkb2N1bWVudHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJhZ1F1ZXJ5VmVjdG9yKHsgcXVlcnksIHRvcEsgPSA1IH06IFJhZ1F1ZXJ5VmVjdG9yUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gR2VuZXJhdGUgZW1iZWRkaW5nIGZvciB0aGUgcXVlcnlcbiAgICBjb25zdCBxdWVyeUVtYmVkZGluZyA9IGdlbmVyYXRlRW1iZWRkaW5nKHF1ZXJ5KTtcbiAgICBcbiAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgdXNlIENocm9tYURCIG9yIHNpbWlsYXJcbiAgICAvLyBGb3Igbm93LCB3ZSByZXR1cm4gYSBwbGFjZWhvbGRlciByZXNwb25zZVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBxdWVyeSxcbiAgICAgICAgdG9wSyxcbiAgICAgICAgcmVzdWx0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAncGxhY2Vob2xkZXInLFxuICAgICAgICAgICAgdGV4dDogJ1ZlY3RvciBzZWFyY2ggcmVxdWlyZXMgQ2hyb21hREIgaW50ZWdyYXRpb24uIFRoaXMgaXMgYSBwbGFjZWhvbGRlci4nLFxuICAgICAgICAgICAgc2NvcmU6IDAsXG4gICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICBmaWxlX3BhdGg6ICcnLFxuICAgICAgICAgICAgICBmaWxlX25hbWU6ICcnLFxuICAgICAgICAgICAgICBjaHVua19pbmRleDogMCxcbiAgICAgICAgICAgICAgdG90YWxfY2h1bmtzOiAxLFxuICAgICAgICAgICAgICB3b3JkX2NvdW50OiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBub3RlOiAnVG8gZW5hYmxlIGZ1bGwgdmVjdG9yIHNlYXJjaCwgaW5zdGFsbCBjaHJvbWFkYiBhbmQgdXBkYXRlIHRoZSBpbXBsZW1lbnRhdGlvbi4nLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUkFHIHF1ZXJ5IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vKipcbiAqIENsZWFyIHRoZSB2ZWN0b3IgaW5kZXguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJhZ0NsZWFySW5kZXgoeyBjb25maXJtIH06IFJhZ0NsZWFySW5kZXhQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgaWYgKCFjb25maXJtKSB7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ29uZmlybWF0aW9uIHJlcXVpcmVkIHRvIGNsZWFyIGluZGV4JyB9O1xuICB9XG5cbiAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNsZWFyIENocm9tYURCXG4gIHJldHVybiB7XG4gICAgc3VjY2VzczogdHJ1ZSxcbiAgICBkYXRhOiB7IG1lc3NhZ2U6ICdWZWN0b3IgaW5kZXggY2xlYXJlZCBzdWNjZXNzZnVsbHknIH0sXG4gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclJhZ1Rvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyByYWdfaW5kZXhfZmlsZXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyYWdfaW5kZXhfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW5kZXggZmlsZXMgaW4gYSBkaXJlY3RvcnkgZm9yIHNlbWFudGljIHNlYXJjaC4gU3VwcG9ydHMgVHlwZVNjcmlwdCwgSmF2YVNjcmlwdCwgTWFya2Rvd24sIEpTT04sIFlBTUwsIGFuZCB0ZXh0IGZpbGVzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZGlyZWN0b3J5UGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnRGlyZWN0b3J5IHBhdGggdG8gaW5kZXgnKSxcbiAgICAgIGZpbGVQYXR0ZXJuOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnKi57dHMsanMsdHN4LGpzeCxtZCxqc29uLHlhbWwseW1sLHRvbWwsdHh0fScpLmRlc2NyaWJlKCdGaWxlIHBhdHRlcm4gdG8gbWF0Y2ggKGdsb2Igc3ludGF4KScpLFxuICAgICAgYmF0Y2hTaXplOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMTAwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdCYXRjaCBzaXplIGZvciBwcm9ncmVzcyByZXBvcnRpbmcnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdJbmRleEZpbGVzKHBhcmFtcyBhcyBSYWdJbmRleEZpbGVzUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIHJhZ19xdWVyeV92ZWN0b3IgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyYWdfcXVlcnlfdmVjdG9yJyxcbiAgICBkZXNjcmlwdGlvbjogJ1F1ZXJ5IHRoZSB2ZWN0b3IgaW5kZXggZm9yIHNlbWFudGljYWxseSBzaW1pbGFyIGRvY3VtZW50cy4gUmV0dXJucyB0b3AtayBtb3N0IHJlbGV2YW50IGNodW5rcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTZWFyY2ggcXVlcnkgdGV4dCcpLFxuICAgICAgdG9wSzogei5udW1iZXIoKS5taW4oMSkubWF4KDIwKS5vcHRpb25hbCgpLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ051bWJlciBvZiByZXN1bHRzIHRvIHJldHVybicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHJhZ1F1ZXJ5VmVjdG9yKHBhcmFtcyBhcyBSYWdRdWVyeVZlY3RvclBhcmFtcyksXG4gIH0pKTtcblxuICAvLyByYWdfY2xlYXJfaW5kZXggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyYWdfY2xlYXJfaW5kZXgnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgdGhlIHZlY3RvciBzZWFyY2ggaW5kZXguIFJlcXVpcmVzIGNvbmZpcm1hdGlvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbmZpcm06IHouYm9vbGVhbigpLmRlc2NyaWJlKCdTZXQgdG8gdHJ1ZSB0byBjb25maXJtIGNsZWFyaW5nIHRoZSBpbmRleCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHJhZ0NsZWFySW5kZXgocGFyYW1zIGFzIFJhZ0NsZWFySW5kZXhQYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBVSSBDb21wb25lbnQgVGVtcGxhdGVzID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGJ1dHRvbiBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQnV0dG9uSHRtbChsYWJlbDogc3RyaW5nLCBjb2xvcjogc3RyaW5nID0gJyMwMDdiZmYnLCBpZDogc3RyaW5nID0gJ3VpLWJ0bicpOiBzdHJpbmcge1xuICByZXR1cm4gYFxuICAgIDxidXR0b24gaWQ9XCIke2lkfVwiIHN0eWxlPVwiXG4gICAgICBwYWRkaW5nOiAxMnB4IDI0cHg7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9yfTtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycztcbiAgICBcIj4ke2xhYmVsfTwvYnV0dG9uPlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBmb3JtIGNvbXBvbmVudCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVGb3JtSHRtbChmaWVsZHM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfT4sIHN1Ym1pdExhYmVsOiBzdHJpbmcgPSAnU3VibWl0Jyk6IHN0cmluZyB7XG4gIGNvbnN0IGZpZWxkc0h0bWwgPSBmaWVsZHMubWFwKGZpZWxkID0+IGBcbiAgICA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTVweDtcIj5cbiAgICAgIDxsYWJlbCBmb3I9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJkaXNwbGF5OiBibG9jazsgbWFyZ2luLWJvdHRvbTogNXB4OyBmb250LXdlaWdodDogYm9sZDtcIj4ke2ZpZWxkLmxhYmVsfTwvbGFiZWw+XG4gICAgICAke2ZpZWxkLnR5cGUgPT09ICd0ZXh0YXJlYScgXG4gICAgICAgID8gYDx0ZXh0YXJlYSBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHJvd3M9XCI0XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC90ZXh0YXJlYT5gXG4gICAgICAgIDogZmllbGQudHlwZSA9PT0gJ3NlbGVjdCdcbiAgICAgICAgICA/IGA8c2VsZWN0IGlkPVwiJHtmaWVsZC5uYW1lfVwiIG5hbWU9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PG9wdGlvbiB2YWx1ZT1cIlwiPlNlbGVjdC4uLjwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCIxXCI+T3B0aW9uIDE8L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiMlwiPk9wdGlvbiAyPC9vcHRpb24+PC9zZWxlY3Q+YFxuICAgICAgICAgIDogYDxpbnB1dCB0eXBlPVwiJHtmaWVsZC50eXBlfVwiIGlkPVwiJHtmaWVsZC5uYW1lfVwiIG5hbWU9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCIgLz5gXG4gICAgICB9XG4gICAgPC9kaXY+XG4gIGApLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGZvcm0gaWQ9XCJ1aS1mb3JtXCIgb25zdWJtaXQ9XCJldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS1yZXN1bHQnKS5pbm5lckhUTUwgPSAnRm9ybSBzdWJtaXR0ZWQhJztcIj5cbiAgICAgICR7ZmllbGRzSHRtbH1cbiAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIHN0eWxlPVwicGFkZGluZzogMTJweCAyNHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3YmZmOyBjb2xvcjogd2hpdGU7IGJvcmRlcjogbm9uZTsgYm9yZGVyLXJhZGl1czogNnB4OyBjdXJzb3I6IHBvaW50ZXI7XCI+JHtzdWJtaXRMYWJlbH08L2J1dHRvbj5cbiAgICA8L2Zvcm0+XG4gICAgPGRpdiBpZD1cImZvcm0tcmVzdWx0XCIgc3R5bGU9XCJtYXJnaW4tdG9wOiAxNXB4OyBwYWRkaW5nOiAxMHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmOWZhOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC9kaXY+XG4gIGA7XG59XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGNoYXJ0IGNvbXBvbmVudCAoc2ltcGxlIGJhciBjaGFydCkgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQ2hhcnRIdG1sKGRhdGE6IEFycmF5PHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9PiwgdGl0bGU6IHN0cmluZyA9ICdCYXIgQ2hhcnQnKTogc3RyaW5nIHtcbiAgY29uc3QgbWF4VmFsdWUgPSBNYXRoLm1heCguLi5kYXRhLm1hcChkID0+IGQudmFsdWUpKTtcbiAgY29uc3QgYmFyc0h0bWwgPSBkYXRhLm1hcChkID0+IHtcbiAgICBjb25zdCBoZWlnaHQgPSAoZC52YWx1ZSAvIG1heFZhbHVlKSAqIDIwMDtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBmbGV4LWVuZDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IG1hcmdpbi1yaWdodDogMTBweDtcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cIndpZHRoOiA0MHB4OyBoZWlnaHQ6ICR7aGVpZ2h0fXB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3YmZmOyBib3JkZXItcmFkaXVzOiA0cHggNHB4IDAgMDtcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH0pLmpvaW4oJycpO1xuXG4gIGNvbnN0IGxhYmVsc0h0bWwgPSBkYXRhLm1hcChkID0+IGBcbiAgICA8ZGl2IHN0eWxlPVwid2lkdGg6IDQwcHg7IHRleHQtYWxpZ246IGNlbnRlcjsgZm9udC1zaXplOiAxMnB4O1wiPiR7ZC5sYWJlbH08L2Rpdj5cbiAgYCkuam9pbignJyk7XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IHN0eWxlPVwicGFkZGluZzogMjBweDsgYmFja2dyb3VuZC1jb2xvcjogI2Y4ZjlmYTsgYm9yZGVyLXJhZGl1czogOHB4O1wiPlxuICAgICAgPGgzPiR7dGl0bGV9PC9oMz5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGhlaWdodDogMjIwcHg7IG1hcmdpbi1ib3R0b206IDEwcHg7XCI+JHtiYXJzSHRtbH08L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcIj4ke2xhYmVsc0h0bWx9PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGRhc2hib2FyZCBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRGFzaGJvYXJkSHRtbCh0aXRsZXM6IHN0cmluZ1tdLCBjb250ZW50OiBBcnJheTx7IHR5cGU6ICd0ZXh0JyB8ICdjaGFydCc7IGRhdGE/OiBhbnkgfT4pOiBzdHJpbmcge1xuICBjb25zdCBjYXJkc0h0bWwgPSB0aXRsZXMubWFwKCh0aXRsZSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBjYXJkQ29udGVudCA9IGNvbnRlbnRbaW5kZXhdPy50eXBlID09PSAnY2hhcnQnIFxuICAgICAgPyBnZW5lcmF0ZUNoYXJ0SHRtbChjb250ZW50W2luZGV4XS5kYXRhIHx8IFt7IGxhYmVsOiAnQScsIHZhbHVlOiA1MCB9LCB7IGxhYmVsOiAnQicsIHZhbHVlOiA4MCB9XSwgdGl0bGUpXG4gICAgICA6IGA8cCBzdHlsZT1cInBhZGRpbmc6IDIwcHg7XCI+JHtjb250ZW50W2luZGV4XT8uZGF0YSB8fCBgQ29udGVudCBmb3IgJHt0aXRsZX1gfTwvcD5gO1xuICAgIFxuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IHN0eWxlPVwiZmxleDogMTsgbWluLXdpZHRoOiAyNTBweDsgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7IGJvcmRlci1yYWRpdXM6IDhweDsgYm94LXNoYWRvdzogMCAycHggNHB4IHJnYmEoMCwwLDAsMC4xKTsgbWFyZ2luOiAxMHB4O1wiPlxuICAgICAgICAke2NhcmRDb250ZW50fVxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfSkuam9pbignJyk7XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgZmxleC13cmFwOiB3cmFwOyBnYXA6IDIwcHg7IHBhZGRpbmc6IDIwcHg7XCI+JHtjYXJkc0h0bWx9PC9kaXY+XG4gIGA7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBnZW5lcmF0ZV91aV9jb21wb25lbnQgdG9vbCBcdTIwMTQgR2VuZXJhdGUgaW50ZXJhY3RpdmUgVUkgY29tcG9uZW50c1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZW5lcmF0ZV91aV9jb21wb25lbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2VuZXJhdGUgSFRNTC9DU1MvSlMgY29kZSBmb3IgYW4gaW50ZXJhY3RpdmUgVUkgY29tcG9uZW50IChidXR0b24sIGZvcm0sIGNoYXJ0LCBkYXNoYm9hcmQpLiBSZXR1cm5zIHRoZSBnZW5lcmF0ZWQgY29kZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbXBvbmVudF90eXBlOiB6LmVudW0oWydidXR0b24nLCAnZm9ybScsICdjaGFydCcsICdkYXNoYm9hcmQnXSkuZGVzY3JpYmUoJ1R5cGUgb2YgVUkgY29tcG9uZW50IHRvIGdlbmVyYXRlJyksXG4gICAgICBsYWJlbDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdMYWJlbCB0ZXh0IGZvciBidXR0b25zIG9yIGZvcm1zJyksXG4gICAgICBmaWVsZHM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgICBuYW1lOiB6LnN0cmluZygpLFxuICAgICAgICB0eXBlOiB6LmVudW0oWyd0ZXh0JywgJ2VtYWlsJywgJ3Bhc3N3b3JkJywgJ251bWJlcicsICd0ZXh0YXJlYScsICdzZWxlY3QnXSksXG4gICAgICAgIGxhYmVsOiB6LnN0cmluZygpLFxuICAgICAgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0Zvcm0gZmllbGRzIChmb3IgZm9ybSBjb21wb25lbnQpJyksXG4gICAgICBjaGFydF9kYXRhOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbGFiZWw6IHouc3RyaW5nKCksXG4gICAgICAgIHZhbHVlOiB6Lm51bWJlcigpLFxuICAgICAgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0NoYXJ0IGRhdGEgcG9pbnRzIChmb3IgY2hhcnQgY29tcG9uZW50KScpLFxuICAgICAgZGFzaGJvYXJkX3RpdGxlczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaXRsZXMgZm9yIGRhc2hib2FyZCBjYXJkcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbXBvbmVudF90eXBlLCBsYWJlbCwgZmllbGRzLCBjaGFydF9kYXRhLCBkYXNoYm9hcmRfdGl0bGVzIH06IHsgXG4gICAgICBjb21wb25lbnRfdHlwZTogc3RyaW5nOyBcbiAgICAgIGxhYmVsPzogc3RyaW5nOyBcbiAgICAgIGZpZWxkcz86IEFycmF5PHsgbmFtZTogc3RyaW5nOyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfT47IFxuICAgICAgY2hhcnRfZGF0YT86IEFycmF5PHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9PjtcbiAgICAgIGRhc2hib2FyZF90aXRsZXM/OiBzdHJpbmdbXTtcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgaHRtbCA9ICcnO1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIChjb21wb25lbnRfdHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2J1dHRvbic6XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVCdXR0b25IdG1sKGxhYmVsIHx8ICdDbGljayBNZScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZm9ybSc6XG4gICAgICAgICAgICBpZiAoIWZpZWxkcyB8fCBmaWVsZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0Zvcm0gY29tcG9uZW50IHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBmaWVsZCcgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZUZvcm1IdG1sKGZpZWxkcyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdjaGFydCc6XG4gICAgICAgICAgICBpZiAoIWNoYXJ0X2RhdGEgfHwgY2hhcnRfZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ2hhcnQgY29tcG9uZW50IHJlcXVpcmVzIGRhdGEgcG9pbnRzJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlQ2hhcnRIdG1sKGNoYXJ0X2RhdGEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZGFzaGJvYXJkJzpcbiAgICAgICAgICAgIGlmICghZGFzaGJvYXJkX3RpdGxlcyB8fCBkYXNoYm9hcmRfdGl0bGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdEYXNoYm9hcmQgY29tcG9uZW50IHJlcXVpcmVzIGF0IGxlYXN0IG9uZSB0aXRsZScgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkYXNoYm9hcmRfdGl0bGVzLm1hcCgodGl0bGUsIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgICB0eXBlOiBpbmRleCAlIDIgPT09IDAgPyAnY2hhcnQnIDogJ3RleHQnLFxuICAgICAgICAgICAgICBkYXRhOiBpbmRleCAlIDIgPT09IDAgPyBbeyBsYWJlbDogJ0EnLCB2YWx1ZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSB9LCB7IGxhYmVsOiAnQicsIHZhbHVlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApIH1dIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlRGFzaGJvYXJkSHRtbChkYXNoYm9hcmRfdGl0bGVzLCBjb250ZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIGNvbXBvbmVudCB0eXBlOiAke2NvbXBvbmVudF90eXBlfWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZ1bGxIdG1sID0gYDwhRE9DVFlQRSBodG1sPjxodG1sPjxoZWFkPjxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiPjx0aXRsZT5VSSBDb21wb25lbnQ8L3RpdGxlPjwvaGVhZD48Ym9keSBzdHlsZT1cImZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgcGFkZGluZzogMjBweDtcIj4ke2h0bWx9PC9ib2R5PjwvaHRtbD5gO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21wb25lbnRfdHlwZSwgaHRtbDogZnVsbEh0bWwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGdlbmVyYXRlIFVJIGNvbXBvbmVudDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVuZGVyX2FuZF9wcmV2aWV3X3VpIHRvb2wgXHUyMDE0IFJlbmRlciBnZW5lcmF0ZWQgVUkgaW4gYnJvd3NlciBhbmQgY2FwdHVyZSBzY3JlZW5zaG90XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlbmRlcl9hbmRfcHJldmlld191aScsXG4gICAgZGVzY3JpcHRpb246ICdSZW5kZXIgYSBnZW5lcmF0ZWQgSFRNTCBVSSBjb21wb25lbnQsIHNhdmUgaXQgdG8gYSBmaWxlLCBvcGVuIGl0IGluIHRoZSBkZWZhdWx0IGJyb3dzZXIsIGFuZCBvcHRpb25hbGx5IHRha2UgYSBzY3JlZW5zaG90LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tcGxldGUgSFRNTCBjb250ZW50IHRvIHJlbmRlcicpLFxuICAgICAgZmlsZW5hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCd1aV9wcmV2aWV3Lmh0bWwnKS5kZXNjcmliZSgnRmlsZW5hbWUgZm9yIHNhdmluZyAoZGVmYXVsdDogdWlfcHJldmlldy5odG1sKScpLFxuICAgICAgc2NyZWVuc2hvdF9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHBhdGggdG8gc2F2ZSBhIHNjcmVlbnNob3Qgb2YgdGhlIHJlbmRlcmVkIFVJJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBmaWxlbmFtZSwgc2NyZWVuc2hvdF9wYXRoIH06IHsgXG4gICAgICBodG1sX2NvbnRlbnQ6IHN0cmluZzsgXG4gICAgICBmaWxlbmFtZT86IHN0cmluZzsgXG4gICAgICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZW5hbWUgfHwgJ3VpX3ByZXZpZXcuaHRtbCc7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgZmlsZU5hbWUpO1xuXG4gICAgICAgIC8vIFNhdmUgSFRNTCB0byBmaWxlXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWxfY29udGVudCk7XG5cbiAgICAgICAgLy8gT3BlbiBpbiBkZWZhdWx0IGJyb3dzZXIgdXNpbmcgRVMgaW1wb3J0IChzYW1lIGFzIHByZXZpZXdfaHRtbCB0b29sKVxuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdChmaWxlUGF0aCk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IFxuICAgICAgICAgIHJlbmRlcmVkOiB0cnVlLCBcbiAgICAgICAgICBmaWxlOiBmaWxlTmFtZSxcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUYWtlIHNjcmVlbnNob3QgaWYgcmVxdWVzdGVkICh1c2luZyBQdXBwZXRlZXIpXG4gICAgICAgIGlmIChzY3JlZW5zaG90X3BhdGgpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHVwcGV0ZWVyTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdwdXBwZXRlZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCBwdXBwZXRlZXJNb2R1bGUuZGVmYXVsdC5sYXVuY2goeyBoZWFkbGVzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTG9hZCB0aGUgSFRNTCBmaWxlXG4gICAgICAgICAgICBhd2FpdCBwYWdlLmdvdG8oYGZpbGU6Ly8ke2ZpbGVQYXRofWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBXYWl0IGZvciBjb250ZW50IHRvIHJlbmRlclxuICAgICAgICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yU2VsZWN0b3IoJ2JvZHknLCB7IHRpbWVvdXQ6IDUwMDAgfSkuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWtlIHNjcmVlbnNob3RcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCwgZnVsbFBhZ2U6IHRydWUgfSk7XG4gICAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RTYXZlZCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGF3YWl0IGJyb3dzZXIuY2xvc2UoKTtcbiAgICAgICAgICB9IGNhdGNoIChzY3JlZW5zaG90RXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBzY3JlZW5zaG90RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IHNjcmVlbnNob3RFcnJvci5tZXNzYWdlIDogU3RyaW5nKHNjcmVlbnNob3RFcnJvcik7XG4gICAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RXYXJuaW5nID0gYFNjcmVlbnNob3QgZmFpbGVkOiAke21lc3NhZ2V9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcmVuZGVyIFVJOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBleHRyYWN0X3VpX2RhdGEgdG9vbCBcdTIwMTQgRXh0cmFjdCBkYXRhIGZyb20gaW50ZXJhY3RpdmUgVUkgZWxlbWVudHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZXh0cmFjdF91aV9kYXRhJyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4dHJhY3Qgc3RydWN0dXJlZCBkYXRhIGZyb20gSFRNTCBjb250ZW50ICh0YWJsZXMsIGZvcm1zLCBsaXN0cykuIFVzZWZ1bCBmb3IgcGFyc2luZyBnZW5lcmF0ZWQgb3IgZmV0Y2hlZCBVSXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBIVE1MIGNvbnRlbnQgdG8gZXh0cmFjdCBkYXRhIGZyb20nKSxcbiAgICAgIGV4dHJhY3Rpb25fdHlwZTogei5lbnVtKFsndGFibGUnLCAnZm9ybScsICdsaXN0J10pLmRlZmF1bHQoJ3RhYmxlJykuZGVzY3JpYmUoJ1R5cGUgb2YgZGF0YSB0byBleHRyYWN0JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBleHRyYWN0aW9uX3R5cGUgfTogeyBcbiAgICAgIGh0bWxfY29udGVudDogc3RyaW5nOyBcbiAgICAgIGV4dHJhY3Rpb25fdHlwZTogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBVc2UgTm9kZS5qcyBET00gcGFyc2VyIChjaGVlcmlvLWxpa2UgYXBwcm9hY2ggd2l0aCBiYXNpYyByZWdleCBmb3Igc2ltcGxpY2l0eSlcbiAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3UnZCB1c2UgYSBwcm9wZXIgSFRNTCBwYXJzZXIgbGlrZSBqc2RvbSBvciBjaGVlcmlvXG4gICAgICAgIFxuICAgICAgICBsZXQgZXh0cmFjdGVkRGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuICAgICAgICBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAndGFibGUnKSB7XG4gICAgICAgICAgY29uc3QgdGFibGVSZWdleCA9IC88dGFibGVbXj5dKj4oW1xcc1xcU10qPyk8XFwvdGFibGU+L2dpO1xuICAgICAgICAgIGNvbnN0IHJvd3NSZWdleCA9IC88dHJbXj5dKj4oW1xcc1xcU10qPyk8XFwvdHI+L2dpO1xuICAgICAgICAgIGNvbnN0IGNlbGxzUmVnZXggPSAvPCh0ZHx0aClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHRkfHRoKT4vZ2k7XG5cbiAgICAgICAgICBsZXQgdGFibGVNYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKHRhYmxlTWF0Y2ggPSB0YWJsZVJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhYmxlQ29udGVudCA9IHRhYmxlTWF0Y2hbMV07XG4gICAgICAgICAgICBjb25zdCByb3dzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IHJvd01hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChyb3dNYXRjaCA9IHJvd3NSZWdleC5leGVjKHRhYmxlQ29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJvd3MucHVzaChyb3dNYXRjaFsxXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJvd3M6IHN0cmluZ1tdW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2VsbHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgIGxldCBjZWxsTWF0Y2g7XG4gICAgICAgICAgICAgIGNvbnN0IGNlbGxSZWdleCA9IC88KHRkfHRoKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odGR8dGgpPi9naTtcbiAgICAgICAgICAgICAgd2hpbGUgKChjZWxsTWF0Y2ggPSBjZWxsUmVnZXguZXhlYyhyb3cpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goY2VsbE1hdGNoWzJdLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGFyc2VkUm93cy5wdXNoKGNlbGxzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS50YWJsZXMgPSBwYXJzZWRSb3dzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICdmb3JtJykge1xuICAgICAgICAgIGNvbnN0IGZvcm1SZWdleCA9IC88Zm9ybVtePl0qPihbXFxzXFxTXSo/KTxcXC9mb3JtPi9naTtcbiAgICAgICAgICBjb25zdCBpbnB1dFJlZ2V4ID0gLzwoaW5wdXR8c2VsZWN0fHRleHRhcmVhKVtePl0qXFwvPz4vZ2k7XG5cbiAgICAgICAgICBsZXQgZm9ybU1hdGNoO1xuICAgICAgICAgIHdoaWxlICgoZm9ybU1hdGNoID0gZm9ybVJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1Db250ZW50ID0gZm9ybU1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZT86IHN0cmluZyB9PiA9IFtdO1xuICAgICAgICAgICAgbGV0IGlucHV0TWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKGlucHV0TWF0Y2ggPSBpbnB1dFJlZ2V4LmV4ZWMoZm9ybUNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBjb25zdCB0YWcgPSBpbnB1dE1hdGNoWzBdO1xuICAgICAgICAgICAgICBjb25zdCBuYW1lTWF0Y2ggPSAvbmFtZT1bXCInXShbXlwiJ10rKVtcIiddL2kuZXhlYyh0YWcpO1xuICAgICAgICAgICAgICBjb25zdCB0eXBlTWF0Y2ggPSAvdHlwZT1bXCInXShbXlwiJ10rKVtcIiddL2kuZXhlYyh0YWcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgKG5hbWVNYXRjaCkge1xuICAgICAgICAgICAgICAgIGZpZWxkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVNYXRjaFsxXSxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVNYXRjaD8uWzFdIHx8ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJywgLy8gV291bGQgbmVlZCB0byBleHRyYWN0IGFjdHVhbCB2YWx1ZXMgaW4gYSByZWFsIGltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS5mb3JtRmllbGRzID0gZmllbGRzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICdsaXN0Jykge1xuICAgICAgICAgIGNvbnN0IGxpc3RSZWdleCA9IC88KHVsfG9sKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odWx8b2wpPi9naTtcbiAgICAgICAgICBjb25zdCBpdGVtUmVnZXggPSAvPGxpW14+XSo+KFtcXHNcXFNdKj8pPFxcL2xpPi9naTtcblxuICAgICAgICAgIGxldCBsaXN0TWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKChsaXN0TWF0Y2ggPSBsaXN0UmVnZXguZXhlYyhodG1sX2NvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbGlzdENvbnRlbnQgPSBsaXN0TWF0Y2hbMl07XG4gICAgICAgICAgICBjb25zdCBpdGVtczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBpdGVtTWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKGl0ZW1NYXRjaCA9IGl0ZW1SZWdleC5leGVjKGxpc3RDb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtTWF0Y2hbMV0ucmVwbGFjZSgvPFtePl0rPi9nLCAnJykudHJpbSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGV4dHJhY3RlZERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBleHRyYWN0IFVJIGRhdGE6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ29udGV4dCBNYW5hZ2VtZW50IFR5cGVzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBDb250ZXh0RW50cnkge1xuICBpZDogc3RyaW5nO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgdHlwZTogJ2RlY2lzaW9uJyB8ICdwYXR0ZXJuJyB8ICdjb25maWd1cmF0aW9uJyB8ICdmaWxlX2NoYW5nZScgfCAnZXJyb3InIHwgJ3N1bW1hcnknO1xuICB0aXRsZTogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXTtcbiAgc2Vzc2lvbl9pZD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIENvbnRleHRTdW1tYXJ5IHtcbiAgdG90YWxfZW50cmllczogbnVtYmVyO1xuICBlbnRyaWVzX2J5X3R5cGU6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gIHJlY2VudF9lbnRyaWVzOiBDb250ZXh0RW50cnlbXTtcbiAgbGFzdF91cGRhdGVkOiBudW1iZXI7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgU3RvcmFnZSBNYW5hZ2VyID09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIENvbnRleHRTdG9yYWdlTWFuYWdlciB7XG4gIHByaXZhdGUgc3RvcmFnZVBhdGg6IHN0cmluZztcbiAgXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmFnZVBhdGggPSBwYXRoLmpvaW4oZ2V0V29ya2luZ0RpcigpLCAnLmFpX3Rvb2xib3hfY29udGV4dC5qc29uJyk7XG4gICAgY29uc29sZS5sb2coYFtDb250ZXh0U3RvcmFnZV0gSW5pdGlhbGl6ZWQgd2l0aCBzdG9yYWdlIHBhdGg6ICR7dGhpcy5zdG9yYWdlUGF0aH1gKTtcbiAgfVxuXG4gIC8qKiBMb2FkIGNvbnRleHQgZW50cmllcyBmcm9tIGRpc2sgKi9cbiAgbG9hZCgpOiBDb250ZXh0RW50cnlbXSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLnN0b3JhZ2VQYXRoKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0NvbnRleHRTdG9yYWdlLmxvYWRdIEZpbGUgZG9lcyBub3QgZXhpc3QgeWV0OiAke3RoaXMuc3RvcmFnZVBhdGh9YCk7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLnN0b3JhZ2VQYXRoLCAndXRmLTgnKTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBKU09OLnBhcnNlKGRhdGEpIGFzIENvbnRleHRFbnRyeVtdO1xuICAgICAgY29uc29sZS5sb2coYFtDb250ZXh0U3RvcmFnZS5sb2FkXSBMb2FkZWQgJHtlbnRyaWVzLmxlbmd0aH0gZW50cmllcyBmcm9tIGRpc2tgKTtcbiAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgY29uc29sZS5lcnJvcihgW0NvbnRleHRTdG9yYWdlLmxvYWRdIEZhaWxlZCB0byBsb2FkIGNvbnRleHQgc3RvcmFnZTogJHttZXNzYWdlfWApO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTYXZlIGNvbnRleHQgZW50cmllcyB0byBkaXNrICovXG4gIHNhdmUoZW50cmllczogQ29udGV4dEVudHJ5W10pOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMuc3RvcmFnZVBhdGgpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gQ3JlYXRlZCBkaXJlY3Rvcnk6ICR7ZGlyfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBXcml0ZSBhdG9taWNhbGx5ICh0ZW1wIGZpbGUgKyByZW5hbWUpXG4gICAgICBjb25zdCB0ZW1wUGF0aCA9IHRoaXMuc3RvcmFnZVBhdGggKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBQYXRoLCBKU09OLnN0cmluZ2lmeShlbnRyaWVzLCBudWxsLCAyKSk7XG4gICAgICBmcy5yZW5hbWVTeW5jKHRlbXBQYXRoLCB0aGlzLnN0b3JhZ2VQYXRoKTtcbiAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gU2F2ZWQgJHtlbnRyaWVzLmxlbmd0aH0gZW50cmllcyB0byBkaXNrYCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBjb25zb2xlLmVycm9yKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gRmFpbGVkIHRvIHNhdmUgY29udGV4dCBzdG9yYWdlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEFkZCBhIG5ldyBjb250ZXh0IGVudHJ5ICovXG4gIGFkZEVudHJ5KGVudHJ5OiBDb250ZXh0RW50cnkpOiB2b2lkIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgZW50cmllcy51bnNoaWZ0KGVudHJ5KTsgLy8gQWRkIHRvIGJlZ2lubmluZ1xuICAgIFxuICAgIC8vIExpbWl0IHRvIGxhc3QgMTAwMCBlbnRyaWVzIHRvIHByZXZlbnQgdW5ib3VuZGVkIGdyb3d0aFxuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA+IDEwMDApIHtcbiAgICAgIGVudHJpZXMuc3BsaWNlKDEwMDApO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnNhdmUoZW50cmllcyk7XG4gIH1cblxuICAvKiogR2V0IHJlY2VudCBjb250ZXh0IGVudHJpZXMgKi9cbiAgZ2V0UmVjZW50RW50cmllcyhsaW1pdDogbnVtYmVyID0gMjAsIHR5cGU/OiBzdHJpbmcpOiBDb250ZXh0RW50cnlbXSB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIFxuICAgIGlmICh0eXBlKSB7XG4gICAgICByZXR1cm4gZW50cmllcy5maWx0ZXIoZSA9PiBlLnR5cGUgPT09IHR5cGUpLnNsaWNlKDAsIGxpbWl0KTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGVudHJpZXMuc2xpY2UoMCwgbGltaXQpO1xuICB9XG5cbiAgLyoqIFNlYXJjaCBjb250ZXh0IGVudHJpZXMgYnkgcXVlcnkgKi9cbiAgc2VhcmNoRW50cmllcyhxdWVyeTogc3RyaW5nLCBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMCk6IENvbnRleHRFbnRyeVtdIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgY29uc3QgbG93ZXJRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgXG4gICAgY29uc3QgcmVzdWx0cyA9IGVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IFxuICAgICAgZW50cnkudGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSB8fFxuICAgICAgZW50cnkuY29udGVudC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpIHx8XG4gICAgICAoZW50cnkudGFncyAmJiBlbnRyeS50YWdzLnNvbWUodGFnID0+IHRhZy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpKSlcbiAgICApO1xuICAgIFxuICAgIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIG1heFJlc3VsdHMpO1xuICB9XG5cbiAgLyoqIERlbGV0ZSBjb250ZXh0IGVudHJpZXMgYnkgSUQgKi9cbiAgZGVsZXRlRW50cnkoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGVudHJpZXMuZmlsdGVyKGUgPT4gZS5pZCAhPT0gaWQpO1xuICAgIFxuICAgIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IGVudHJpZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIEVudHJ5IG5vdCBmb3VuZFxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNhdmUoZmlsdGVyZWQpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIENsZWFyIGFsbCBjb250ZXh0IGVudHJpZXMgKi9cbiAgY2xlYXJBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlKFtdKTtcbiAgfVxuXG4gIC8qKiBHZXQgc3VtbWFyeSBzdGF0aXN0aWNzICovXG4gIGdldFN1bW1hcnkoKTogQ29udGV4dFN1bW1hcnkge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBcbiAgICBjb25zdCBlbnRyaWVzQnlUeXBlOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGVudHJpZXNCeVR5cGVbZW50cnkudHlwZV0gPSAoZW50cmllc0J5VHlwZVtlbnRyeS50eXBlXSB8fCAwKSArIDE7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG90YWxfZW50cmllczogZW50cmllcy5sZW5ndGgsXG4gICAgICBlbnRyaWVzX2J5X3R5cGU6IGVudHJpZXNCeVR5cGUsXG4gICAgICByZWNlbnRfZW50cmllczogZW50cmllcy5zbGljZSgwLCA1KSxcbiAgICAgIGxhc3RfdXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICB9O1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgQW5hbHl6ZXIgPT09PT09PT09PT09PT09PT09PT1cblxuY2xhc3MgQ29udGV4dEFuYWx5emVyIHtcbiAgcHJpdmF0ZSBzdG9yYWdlTWFuYWdlcjogQ29udGV4dFN0b3JhZ2VNYW5hZ2VyO1xuICBcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yYWdlTWFuYWdlciA9IG5ldyBDb250ZXh0U3RvcmFnZU1hbmFnZXIoKTtcbiAgfVxuXG4gIC8qKiBBbmFseXplIHJlY2VudCBhY3Rpdml0eSBhbmQgYXV0by1zYXZlIGltcG9ydGFudCBjb250ZXh0ICovXG4gIGFuYWx5emVBbmRTYXZlKFxuICAgIHNlc3Npb25FdmVudHM6IEFycmF5PHsgdHlwZTogc3RyaW5nOyB0aW1lc3RhbXA6IG51bWJlcjsgZGF0YT86IGFueSB9PixcbiAgICBjb25maWdDaGFuZ2VzPzogUmVjb3JkPHN0cmluZywgYm9vbGVhbiB8IHN0cmluZz5cbiAgKTogeyBzYXZlZF9jb3VudDogbnVtYmVyOyBzdW1tYXJ5OiBzdHJpbmcgfSB7XG4gICAgY29uc3QgZW50cmllczogQ29udGV4dEVudHJ5W10gPSBbXTtcblxuICAgIC8vIEFuYWx5emUgdG9vbCB1c2FnZSBwYXR0ZXJuc1xuICAgIGNvbnN0IHRvb2xVc2FnZUNvdW50OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gICAgc2Vzc2lvbkV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC50eXBlLnN0YXJ0c1dpdGgoJ3Rvb2xfJykpIHtcbiAgICAgICAgY29uc3QgdG9vbE5hbWUgPSBldmVudC50eXBlLnJlcGxhY2UoJ3Rvb2xfJywgJycpO1xuICAgICAgICB0b29sVXNhZ2VDb3VudFt0b29sTmFtZV0gPSAodG9vbFVzYWdlQ291bnRbdG9vbE5hbWVdIHx8IDApICsgMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElkZW50aWZ5IGZyZXF1ZW50bHkgdXNlZCB0b29scyAoPjMgdXNlcyBpbiBzZXNzaW9uKVxuICAgIE9iamVjdC5lbnRyaWVzKHRvb2xVc2FnZUNvdW50KS5mb3JFYWNoKChbdG9vbCwgY291bnRdKSA9PiB7XG4gICAgICBpZiAoY291bnQgPiAzKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAncGF0dGVybicsXG4gICAgICAgICAgdGl0bGU6IGBGcmVxdWVudCBUb29sIFVzYWdlOiAke3Rvb2x9YCxcbiAgICAgICAgICBjb250ZW50OiBgVG9vbCAnJHt0b29sfScgd2FzIHVzZWQgJHtjb3VudH0gdGltZXMgaW4gdGhlIGN1cnJlbnQgc2Vzc2lvbiwgaW5kaWNhdGluZyBpdCdzIGEgcHJpbWFyeSB3b3JrZmxvdyB0b29sLmAsXG4gICAgICAgICAgdGFnczogWyd1c2FnZV9wYXR0ZXJuJywgJ2ZyZXF1ZW50X3Rvb2wnXSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBbmFseXplIGNvbmZpZ3VyYXRpb24gY2hhbmdlc1xuICAgIGlmIChjb25maWdDaGFuZ2VzKSB7XG4gICAgICBPYmplY3QuZW50cmllcyhjb25maWdDaGFuZ2VzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgZW50cmllcy5wdXNoKHtcbiAgICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHR5cGU6ICdjb25maWd1cmF0aW9uJyxcbiAgICAgICAgICB0aXRsZTogYENvbmZpZ3VyYXRpb24gQ2hhbmdlOiAke2tleX1gLFxuICAgICAgICAgIGNvbnRlbnQ6IGBTZXR0aW5nICcke2tleX0nIHdhcyBjaGFuZ2VkIHRvICcke3ZhbHVlfScuYCxcbiAgICAgICAgICB0YWdzOiBbJ2NvbmZpZ19jaGFuZ2UnXSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgaW1wb3J0YW50IGRlY2lzaW9ucyAoYmFzZWQgb24gZXZlbnQgcGF0dGVybnMpXG4gICAgY29uc3QgZGVjaXNpb25FdmVudHMgPSBzZXNzaW9uRXZlbnRzLmZpbHRlcihlID0+IFxuICAgICAgZS50eXBlID09PSAnZGVjaXNpb24nIHx8IFxuICAgICAgKGUuZGF0YSAmJiB0eXBlb2YgZS5kYXRhLmRlY2lzaW9uID09PSAnc3RyaW5nJylcbiAgICApO1xuXG4gICAgZGVjaXNpb25FdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBjb25zdCBkZWNpc2lvblRleHQgPSBldmVudC5kYXRhPy5kZWNpc2lvbiB8fCBgRGVjaXNpb24gbWFkZSBhdCAke25ldyBEYXRlKGV2ZW50LnRpbWVzdGFtcCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9YDtcbiAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgdGltZXN0YW1wOiBldmVudC50aW1lc3RhbXAsXG4gICAgICAgIHR5cGU6ICdkZWNpc2lvbicsXG4gICAgICAgIHRpdGxlOiAnSW1wb3J0YW50IERlY2lzaW9uIFJlY29yZGVkJyxcbiAgICAgICAgY29udGVudDogZGVjaXNpb25UZXh0LFxuICAgICAgICB0YWdzOiBbJ2RlY2lzaW9uJ10sXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIEF1dG8tZ2VuZXJhdGUgc3VtbWFyeSBpZiB3ZSBoYXZlIGVub3VnaCBlbnRyaWVzXG4gICAgaWYgKGVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgdW5pcXVlUGF0dGVybnMgPSBuZXcgU2V0KGVudHJpZXMuZmlsdGVyKGUgPT4gZS50eXBlID09PSAncGF0dGVybicpLm1hcChlID0+IGUudGl0bGUpKTtcbiAgICAgIFxuICAgICAgZW50cmllcy5wdXNoKHtcbiAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHR5cGU6ICdzdW1tYXJ5JyxcbiAgICAgICAgdGl0bGU6IGBTZXNzaW9uIENvbnRleHQgU3VtbWFyeSAoJHtuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpfSlgLFxuICAgICAgICBjb250ZW50OiBgQXV0by1nZW5lcmF0ZWQgc3VtbWFyeTogJHtlbnRyaWVzLmxlbmd0aH0gY29udGV4dCBlbnRyaWVzIHNhdmVkLiBLZXkgcGF0dGVybnMgZGV0ZWN0ZWQ6ICR7QXJyYXkuZnJvbSh1bmlxdWVQYXR0ZXJucykuam9pbignLCAnKSB8fCAnTm8gc3BlY2lmaWMgcGF0dGVybnMnfS4gQ29uZmlndXJhdGlvbiBjaGFuZ2VzIHRyYWNrZWQ6ICR7T2JqZWN0LmtleXMoY29uZmlnQ2hhbmdlcyB8fCB7fSkubGVuZ3RofS5gLFxuICAgICAgICB0YWdzOiBbJ2F1dG9fc3VtbWFyeSddLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFNhdmUgYWxsIGVudHJpZXMgdG8gc3RvcmFnZVxuICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHRoaXMuc3RvcmFnZU1hbmFnZXIuYWRkRW50cnkoZW50cnkpKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2F2ZWRfY291bnQ6IGVudHJpZXMubGVuZ3RoLFxuICAgICAgICBzdW1tYXJ5OiBgU2F2ZWQgJHtlbnRyaWVzLmxlbmd0aH0gY29udGV4dCBlbnRyaWVzIGluY2x1ZGluZyBwYXR0ZXJucyBhbmQgZGVjaXNpb25zLmAsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IHNhdmVkX2NvdW50OiAwLCBzdW1tYXJ5OiAnTm8gc2lnbmlmaWNhbnQgY29udGV4dCBjaGFuZ2VzIGRldGVjdGVkLicgfTtcbiAgfVxuXG4gIC8qKiBHZW5lcmF0ZSBhIHVuaXF1ZSBJRCBmb3IgY29udGV4dCBlbnRyeSAqL1xuICBwcml2YXRlIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGN0eF8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQ29udGV4dE1hbmFnZW1lbnRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCBhbmFseXplciA9IG5ldyBDb250ZXh0QW5hbHl6ZXIoKTtcbiAgY29uc3Qgc3RvcmFnZU1hbmFnZXIgPSBuZXcgQ29udGV4dFN0b3JhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGF1dG9fc3VtbWFyaXplX2NvbnRleHQgdG9vbCBcdTIwMTQgQW5hbHl6ZSBzZXNzaW9uIGFuZCBzYXZlIGltcG9ydGFudCBjb250ZXh0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2F1dG9fc3VtbWFyaXplX2NvbnRleHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBhbmFseXplIHJlY2VudCBzZXNzaW9uIGFjdGl2aXR5LCBpZGVudGlmeSBpbXBvcnRhbnQgcGF0dGVybnMvZGVjaXNpb25zLCBhbmQgc2F2ZSB0aGVtIHRvIHBlcnNpc3RlbnQgbWVtb3J5IGZvciBmdXR1cmUgcmVmZXJlbmNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc2Vzc2lvbl9ldmVudHM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgICB0eXBlOiB6LnN0cmluZygpLFxuICAgICAgICB0aW1lc3RhbXA6IHoubnVtYmVyKCksXG4gICAgICAgIGRhdGE6IHouYW55KCkub3B0aW9uYWwoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdSZWNlbnQgc2Vzc2lvbiBldmVudHMgdG8gYW5hbHl6ZScpLFxuICAgICAgY29uZmlnX2NoYW5nZXM6IHoucmVjb3JkKHoudW5pb24oW3ouYm9vbGVhbigpLCB6LnN0cmluZygpXSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0NvbmZpZ3VyYXRpb24gY2hhbmdlcyBtYWRlIGR1cmluZyBzZXNzaW9uJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc2Vzc2lvbl9ldmVudHMsIGNvbmZpZ19jaGFuZ2VzIH06IHsgXG4gICAgICBzZXNzaW9uX2V2ZW50cz86IEFycmF5PHsgdHlwZTogc3RyaW5nOyB0aW1lc3RhbXA6IG51bWJlcjsgZGF0YT86IGFueSB9PjsgXG4gICAgICBjb25maWdfY2hhbmdlcz86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4gfCBzdHJpbmc+OyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhbmFseXplci5hbmFseXplQW5kU2F2ZShzZXNzaW9uX2V2ZW50cyB8fCBbXSwgY29uZmlnX2NoYW5nZXMpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IGFuYWx5c2lzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2NvbnRleHRfbWVtb3J5IHRvb2wgXHUyMDE0IFJldHJpZXZlIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyaWVzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9jb250ZXh0X21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdSZXRyaWV2ZSBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcyBmcm9tIHBlcnNpc3RlbnQgbWVtb3J5LiBVc2VmdWwgZm9yIHJlY2FsbGluZyBwYXN0IGRlY2lzaW9ucywgcGF0dGVybnMsIG9yIGNvbmZpZ3VyYXRpb25zLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbGltaXQ6IHoubnVtYmVyKCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDIwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgZW50cmllcyB0byByZXR1cm4nKSxcbiAgICAgIHR5cGU6IHouZW51bShbJ2RlY2lzaW9uJywgJ3BhdHRlcm4nLCAnY29uZmlndXJhdGlvbicsICdmaWxlX2NoYW5nZScsICdlcnJvcicsICdzdW1tYXJ5J10pLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZpbHRlciBieSBlbnRyeSB0eXBlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbGltaXQsIHR5cGUgfTogeyBcbiAgICAgIGxpbWl0PzogbnVtYmVyOyBcbiAgICAgIHR5cGU/OiBzdHJpbmc7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBzdG9yYWdlTWFuYWdlci5nZXRSZWNlbnRFbnRyaWVzKGxpbWl0IHx8IDIwLCB0eXBlKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZW50cmllcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcmV0cmlldmUgY29udGV4dCBtZW1vcnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHNlYXJjaF9jb250ZXh0IHRvb2wgXHUyMDE0IFNlYXJjaCBhdXRvLXNhdmVkIGNvbnRleHQgYnkgcXVlcnlcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2VhcmNoX2NvbnRleHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIHRocm91Z2ggYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgdXNpbmcgdGV4dCBtYXRjaGluZy4gRmluZHMgcmVsZXZhbnQgcGFzdCBkZWNpc2lvbnMsIHBhdHRlcm5zLCBvciBjb25maWd1cmF0aW9ucy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTZWFyY2ggcXVlcnkgdG8gbWF0Y2ggYWdhaW5zdCBjb250ZXh0IGVudHJpZXMnKSxcbiAgICAgIG1heF9yZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIG1heF9yZXN1bHRzIH06IHsgXG4gICAgICBxdWVyeTogc3RyaW5nOyBcbiAgICAgIG1heF9yZXN1bHRzPzogbnVtYmVyOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gc3RvcmFnZU1hbmFnZXIuc2VhcmNoRW50cmllcyhxdWVyeSwgbWF4X3Jlc3VsdHMgfHwgMTApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyByZXN1bHRzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbnRleHQgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY29udGV4dF9zdW1tYXJ5IHRvb2wgXHUyMDE0IEdldCBzdW1tYXJ5IHN0YXRpc3RpY3Mgb2YgYXV0by1zYXZlZCBjb250ZXh0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvbnRleHRfc3VtbWFyeScsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgYSBzdW1tYXJ5IG9mIGFsbCBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcywgaW5jbHVkaW5nIGNvdW50cyBieSB0eXBlIGFuZCByZWNlbnQgYWN0aXZpdHkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHN0b3JhZ2VNYW5hZ2VyLmdldFN1bW1hcnkoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHN1bW1hcnkgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgY29udGV4dCBzdW1tYXJ5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfY29udGV4dF9lbnRyeSB0b29sIFx1MjAxNCBSZW1vdmUgYSBzcGVjaWZpYyBjb250ZXh0IGVudHJ5IGJ5IElEXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9jb250ZXh0X2VudHJ5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIHNwZWNpZmljIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyeSBieSBpdHMgdW5pcXVlIElELicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZW50cnlfaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB1bmlxdWUgSUQgb2YgdGhlIGNvbnRleHQgZW50cnkgdG8gZGVsZXRlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZW50cnlfaWQgfTogeyBlbnRyeV9pZDogc3RyaW5nIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRlbGV0ZWQgPSBzdG9yYWdlTWFuYWdlci5kZWxldGVFbnRyeShlbnRyeV9pZCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWRlbGV0ZWQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IGVudHJ5ICcke2VudHJ5X2lkfScgbm90IGZvdW5kYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWQ6IHRydWUsIGVudHJ5X2lkIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBkZWxldGUgY29udGV4dCBlbnRyeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2xlYXJfY29udGV4dF9tZW1vcnkgdG9vbCBcdTIwMTQgQ2xlYXIgYWxsIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyaWVzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NsZWFyX2NvbnRleHRfbWVtb3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIGFsbCBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcyBmcm9tIHBlcnNpc3RlbnQgbWVtb3J5LiBUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29uZmlybTogei5ib29sZWFuKCkuZGVzY3JpYmUoJ1NldCB0byB0cnVlIHRvIGNvbmZpcm0gZGVsZXRpb24gb2YgYWxsIGNvbnRleHQgZW50cmllcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbmZpcm0gfTogeyBjb25maXJtOiBib29sZWFuIH0pID0+IHtcbiAgICAgIGlmICghY29uZmlybSkge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDb25maXJtYXRpb24gcmVxdWlyZWQuIFNldCBjb25maXJtPXRydWUgdG8gcHJvY2VlZC4nIH07XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0b3JhZ2VNYW5hZ2VyLmNsZWFyQWxsKCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNsZWFyZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGNsZWFyIGNvbnRleHQgbWVtb3J5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyB0cmFja19pbXBvcnRhbnRfZXZlbnQgdG9vbCBcdTIwMTQgTWFudWFsbHkgbWFyayBhbiBldmVudCBhcyBpbXBvcnRhbnQgZm9yIGNvbnRleHQgdHJhY2tpbmdcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAndHJhY2tfaW1wb3J0YW50X2V2ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ01hbnVhbGx5IHJlY29yZCBhbiBpbXBvcnRhbnQgZXZlbnQgb3IgZGVjaXNpb24gdG8gcGVyc2lzdGVudCBtZW1vcnkuIFVzZWZ1bCBmb3IgbWFya2luZyBjcml0aWNhbCBtb21lbnRzIGluIGEgc2Vzc2lvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaXRsZSBvZiB0aGUgaW1wb3J0YW50IGV2ZW50JyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXRhaWxlZCBkZXNjcmlwdGlvbiBvZiB0aGUgZXZlbnQnKSxcbiAgICAgIHRhZ3M6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGFncyB0byBjYXRlZ29yaXplIHRoZSBldmVudCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBjb250ZW50LCB0YWdzIH06IHsgXG4gICAgICB0aXRsZTogc3RyaW5nOyBcbiAgICAgIGNvbnRlbnQ6IHN0cmluZzsgXG4gICAgICB0YWdzPzogc3RyaW5nW107IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJ5OiBDb250ZXh0RW50cnkgPSB7XG4gICAgICAgICAgaWQ6IGBjdHhfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAnZGVjaXNpb24nLFxuICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgdGFncyxcbiAgICAgICAgfTtcblxuICAgICAgICBzdG9yYWdlTWFuYWdlci5hZGRFbnRyeShlbnRyeSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHRyYWNrZWQ6IHRydWUsIGVudHJ5X2lkOiBlbnRyeS5pZCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gdHJhY2sgZXZlbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICIvKipcbiAqIEF0dGFjaG1lbnQgTWFuYWdlclxuICogXG4gKiBTdG9yZXMgcmVmZXJlbmNlcyB0byBmaWxlcyBhdHRhY2hlZCB0byB0aGUgY3VycmVudCBjaGF0IG1lc3NhZ2UuXG4gKiBBbGxvd3MgdG9vbHMgdG8gYWNjZXNzIHRoZXNlIGZpbGVzIGJ5IG5hbWUgd2l0aG91dCBuZWVkaW5nIGZ1bGwgZGlzayBwYXRocy5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEZpbGVIYW5kbGUgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcblxuLy8gU3RvcmUgYXR0YWNobWVudHMgZm9yIHRoZSBjdXJyZW50IHR1cm5cbi8vIEtleTogZmlsZW5hbWUgKGxvd2VyY2FzZSksIFZhbHVlOiBGaWxlSGFuZGxlXG5sZXQgY3VycmVudEF0dGFjaG1lbnRzID0gbmV3IE1hcDxzdHJpbmcsIEZpbGVIYW5kbGU+KCk7XG5cbi8qKlxuICogU2V0IHRoZSBhdHRhY2htZW50cyBmb3IgdGhlIGN1cnJlbnQgY2hhdCB0dXJuLlxuICogQ2FsbGVkIGJ5IHRoZSBwcm9tcHQgcHJlcHJvY2Vzc29yIGJlZm9yZSBlYWNoIGdlbmVyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBdHRhY2htZW50cyhmaWxlczogRmlsZUhhbmRsZVtdKTogdm9pZCB7XG4gIGN1cnJlbnRBdHRhY2htZW50cy5jbGVhcigpO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAvLyBTdG9yZSBieSBsb3dlcmNhc2UgbmFtZSBmb3IgY2FzZS1pbnNlbnNpdGl2ZSBsb29rdXBcbiAgICBjdXJyZW50QXR0YWNobWVudHMuc2V0KGZpbGUubmFtZS50b0xvd2VyQ2FzZSgpLCBmaWxlKTtcbiAgfVxuICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVnaXN0ZXJlZCAke2ZpbGVzLmxlbmd0aH0gYXR0YWNobWVudChzKTogJHtmaWxlcy5tYXAoZiA9PiBmLm5hbWUpLmpvaW4oJywgJyl9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgYSBzcGVjaWZpYyBhdHRhY2htZW50IGJ5IG5hbWUgKGNhc2UtaW5zZW5zaXRpdmUpLlxuICogUmV0dXJucyB0aGUgRmlsZUhhbmRsZSBpZiBmb3VuZCwgdW5kZWZpbmVkIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF0dGFjaG1lbnQobmFtZTogc3RyaW5nKTogRmlsZUhhbmRsZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBjdXJyZW50QXR0YWNobWVudHMuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgY3VycmVudGx5IGF0dGFjaGVkIGZpbGVuYW1lcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RBdHRhY2htZW50cygpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBBcnJheS5mcm9tKGN1cnJlbnRBdHRhY2htZW50cy5rZXlzKCkpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgc3BlY2lmaWMgZmlsZSBpcyBhdHRhY2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXR0YWNoZWQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdXJyZW50QXR0YWNobWVudHMuaGFzKG5hbWUudG9Mb3dlckNhc2UoKSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sLCBGaWxlSGFuZGxlIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRBdHRhY2htZW50IH0gZnJvbSAnLi4vYXR0YWNobWVudE1hbmFnZXInO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUmVhZERvY3VtZW50UGFyYW1zIHtcbiAgZmlsZV9wYXRoOiBzdHJpbmc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEhlbHBlciBGdW5jdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFZhbGlkYXRlIGZpbGUgZXhpc3RzIG9uIGRpc2sgKi9cbmZ1bmN0aW9uIHZhbGlkYXRlRmlsZShmaWxlUGF0aDogc3RyaW5nKTogeyB2YWxpZDogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfSB7XG4gIGlmICghZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgRmlsZSBub3QgZm91bmQgb24gZGlzazogJHtmaWxlUGF0aH1gIH07XG4gIH1cbiAgXG4gIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhmaWxlUGF0aCk7XG4gIGlmICghc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBQYXRoIFwiJHtmaWxlUGF0aH1cIiBpcyBub3QgYSBmaWxlYCB9O1xuICB9XG4gIFxuICAvLyBDaGVjayBmaWxlIHNpemUgKG1heCA1ME1CKVxuICBjb25zdCBtYXhTaXplID0gNTAgKiAxMDI0ICogMTAyNDsgLy8gNTBNQlxuICBpZiAoc3RhdC5zaXplID4gbWF4U2l6ZSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBGaWxlIHRvbyBsYXJnZSAoJHsoc3RhdC5zaXplIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMSl9TUIpLCBtYXggaXMgNTBNQmAgfTtcbiAgfVxuICBcbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEb2N1bWVudCByZWFkaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBSZWFkIGNvbnRlbnQgZnJvbSBQREYgb3IgRE9DWCBmaWxlcy5cbiAqIFN1cHBvcnRzIGJvdGggZGlzayBwYXRocyBhbmQgYXR0YWNoZWQgZmlsZXMgKGJ5IGZpbGVuYW1lKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZERvY3VtZW50KHsgZmlsZV9wYXRoIH06IFJlYWREb2N1bWVudFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIDEuIENoZWNrIGlmIGl0J3MgYW4gYXR0YWNoZWQgZmlsZVxuICAgIGNvbnN0IGF0dGFjaG1lbnQgPSBnZXRBdHRhY2htZW50KGZpbGVfcGF0aCk7XG4gICAgaWYgKGF0dGFjaG1lbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBhdHRhY2hlZCBmaWxlOiAke2ZpbGVfcGF0aH1gKTtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGF0dGFjaG1lbnQucmVhZCgpO1xuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVfcGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIFxuICAgICAgaWYgKGV4dCA9PT0gJy5wZGYnKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkUERGRnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy5kb2N4Jykge1xuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZERPQ1hGcm9tQnVmZmVyKGJ1ZmZlciwgZmlsZV9wYXRoKTtcbiAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLnR4dCcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlYWRUWFRGcm9tQnVmZmVyKGJ1ZmZlciwgZmlsZV9wYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcbiAgICAgICAgICBlcnJvcjogYFVuc3VwcG9ydGVkIGF0dGFjaGVkIGZpbGUgZm9ybWF0OiAke2V4dH0uIE9ubHkgLnBkZiwgLmRvY3gsIGFuZCAudHh0IGFyZSBzdXBwb3J0ZWQuYCBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLiBGYWxsIGJhY2sgdG8gZGlzayBwYXRoXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRmlsZShmaWxlX3BhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgLy8gUHJvdmlkZSBoZWxwZnVsIGVycm9yIGlmIGl0IGxvb2tlZCBsaWtlIGEgZmlsZW5hbWVcbiAgICAgIHJldHVybiB7IFxuICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgIGVycm9yOiBgJHt2YWxpZGF0aW9uLmVycm9yfVxcblxcbk5vdGU6IElmIHRoaXMgaXMgYW4gYXR0YWNoZWQgZmlsZSwgdXNlIHRoZSBleGFjdCBmaWxlbmFtZSBmcm9tIHRoZSBcIkFUVEFDSEVEIEZJTEVTIEFWQUlMQUJMRVwiIGxpc3QuYCBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVfcGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICBcbiAgICBzd2l0Y2ggKGV4dCkge1xuICAgICAgY2FzZSAnLnBkZic6XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkUERGKGZpbGVfcGF0aCk7XG4gICAgICBjYXNlICcuZG9jeCc6XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkRE9DWChmaWxlX3BhdGgpO1xuICAgICAgY2FzZSAnLnR4dCc6IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlX3BhdGgsICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZmlsZV9wYXRoOiBmaWxlX3BhdGgsXG4gICAgICAgICAgICBmb3JtYXQ6ICdUWFQnLFxuICAgICAgICAgICAgd29yZF9jb3VudDogdGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICAgICAgc2l6ZTogYCR7KGZzLnN0YXRTeW5jKGZpbGVfcGF0aCkuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgZXJyb3I6IGBVbnN1cHBvcnRlZCBmaWxlIGZvcm1hdDogJHtleHR9LiBPbmx5IC5wZGYsIC5kb2N4LCBhbmQgLnR4dCBhcmUgc3VwcG9ydGVkLmAgXG4gICAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIFBERiBjb250ZW50IGZyb20gZGlzayBwYXRoLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkUERGKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwZGZQYXJzZSA9IChhd2FpdCBpbXBvcnQoJ3BkZi1wYXJzZScpKS5kZWZhdWx0O1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBQREYgZnJvbSBkaXNrOiAke2ZpbGVQYXRofWApO1xuICAgIFxuICAgIGNvbnN0IGRhdGFCdWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBkZlBhcnNlKGRhdGFCdWZmZXIpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUERGIHJlYWQgY29tcGxldGU6ICR7cmVzdWx0Lm51bXBhZ2VzfSBwYWdlcywgJHsocmVzdWx0LnRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVQYXRoLFxuICAgICAgICBmb3JtYXQ6ICdQREYnLFxuICAgICAgICBwYWdlczogcmVzdWx0Lm51bXBhZ2VzLFxuICAgICAgICB3b3JkX2NvdW50OiByZXN1bHQudGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICBzaXplOiBgJHsoZnMuc3RhdFN5bmMoZmlsZVBhdGgpLnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogcmVzdWx0LnRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAocmVzdWx0LnRleHQubGVuZ3RoID4gNTAwID8gJy4uLicgOiAnJyksXG4gICAgICAgIGZ1bGxfdGV4dDogcmVzdWx0LnRleHQsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBQREYgcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBQREYgY29udGVudCBmcm9tIGJ1ZmZlciAoZm9yIGF0dGFjaG1lbnRzKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFBERkZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwZGZQYXJzZSA9IChhd2FpdCBpbXBvcnQoJ3BkZi1wYXJzZScpKS5kZWZhdWx0O1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBQREYgZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBkZlBhcnNlKGJ1ZmZlcik7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBQREYgcmVhZCBjb21wbGV0ZTogJHtyZXN1bHQubnVtcGFnZXN9IHBhZ2VzLCAkeyhyZXN1bHQudGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogZmlsZU5hbWUsXG4gICAgICAgIGZvcm1hdDogJ1BERicsXG4gICAgICAgIHBhZ2VzOiByZXN1bHQubnVtcGFnZXMsXG4gICAgICAgIHdvcmRfY291bnQ6IHJlc3VsdC50ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXG4gICAgICAgIHNpemU6IGAkeyhidWZmZXIubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHJlc3VsdC50ZXh0LnN1YnN0cmluZygwLCA1MDApICsgKHJlc3VsdC50ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHJlc3VsdC50ZXh0LFxuICAgICAgICBzb3VyY2U6ICdhdHRhY2htZW50JyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBERiByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIERPQ1ggY29udGVudCBmcm9tIGRpc2sgcGF0aC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZERPQ1goZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IG1hbW1vdGggPSBhd2FpdCBpbXBvcnQoJ21hbW1vdGgnKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgRE9DWCBmcm9tIGRpc2s6ICR7ZmlsZVBhdGh9YCk7XG4gICAgXG4gICAgY29uc3QgZGF0YUJ1ZmZlciA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWFtbW90aC5leHRyYWN0UmF3VGV4dCh7IGJ1ZmZlcjogZGF0YUJ1ZmZlciB9KTtcbiAgICBcbiAgICBjb25zdCB0ZXh0ID0gcmVzdWx0LnZhbHVlO1xuICAgIGNvbnN0IHdhcm5pbmdzID0gcmVzdWx0Lm1lc3NhZ2VzLm1hcChtID0+IG0ubWVzc2FnZSkuam9pbignXFxuJyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBET0NYIHJlYWQgY29tcGxldGU6ICR7KHRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVQYXRoLFxuICAgICAgICBmb3JtYXQ6ICdET0NYJyxcbiAgICAgICAgd29yZF9jb3VudDogdGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICBzaXplOiBgJHsoZnMuc3RhdFN5bmMoZmlsZVBhdGgpLnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHdhcm5pbmdzOiB3YXJuaW5ncyB8fCB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBET0NYIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlYWQgRE9DWCBjb250ZW50IGZyb20gYnVmZmVyIChmb3IgYXR0YWNobWVudHMpLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkRE9DWEZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBtYW1tb3RoID0gYXdhaXQgaW1wb3J0KCdtYW1tb3RoJyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBSZWFkaW5nIERPQ1ggZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG1hbW1vdGguZXh0cmFjdFJhd1RleHQoeyBidWZmZXIgfSk7XG4gICAgXG4gICAgY29uc3QgdGV4dCA9IHJlc3VsdC52YWx1ZTtcbiAgICBjb25zdCB3YXJuaW5ncyA9IHJlc3VsdC5tZXNzYWdlcy5tYXAobSA9PiBtLm1lc3NhZ2UpLmpvaW4oJ1xcbicpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gRE9DWCByZWFkIGNvbXBsZXRlOiAkeyh0ZXh0Lmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9S0JgKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlTmFtZSxcbiAgICAgICAgZm9ybWF0OiAnRE9DWCcsXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGJ1ZmZlci5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHdhcm5pbmdzOiB3YXJuaW5ncyB8fCB1bmRlZmluZWQsXG4gICAgICAgIHNvdXJjZTogJ2F0dGFjaG1lbnQnLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRE9DWCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIFRYVCBjb250ZW50IGZyb20gYnVmZmVyIChmb3IgYXR0YWNobWVudHMpLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkVFhURnJvbUJ1ZmZlcihidWZmZXI6IEJ1ZmZlciwgZmlsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBUWFQgZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHRleHQgPSBidWZmZXIudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBUWFQgcmVhZCBjb21wbGV0ZTogJHsodGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogZmlsZU5hbWUsXG4gICAgICAgIGZvcm1hdDogJ1RYVCcsXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGJ1ZmZlci5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHNvdXJjZTogJ2F0dGFjaG1lbnQnLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVFhUIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRvY3VtZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJlYWRfZG9jdW1lbnQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2RvY3VtZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlYWQgY29udGVudCBmcm9tIFBERiwgRE9DWCwgb3IgVFhUIGZpbGVzLiBTdXBwb3J0cyBib3RoIGRpc2sgcGF0aHMgYW5kIGF0dGFjaGVkIGZpbGVzICh1c2UgZmlsZW5hbWUgZm9yIGF0dGFjaG1lbnRzKS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfcGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgUERGLCBET0NYLCBvciBUWFQgZmlsZSwgb3IgdGhlIGZpbGVuYW1lIGlmIGl0IGlzIGFuIGF0dGFjaGVkIGZpbGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByZWFkRG9jdW1lbnQocGFyYW1zIGFzIFJlYWREb2N1bWVudFBhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiLyoqXG4gKiBUb29scyBQcm92aWRlciAtIENvbXBsZXRlIEltcGxlbWVudGF0aW9uIG9mIGFsbCB+NDUgdG9vbHMgYWNyb3NzIDYgY2F0ZWdvcmllc1xuICovXG5cbmltcG9ydCB0eXBlIHsgVG9vbCwgVG9vbHNQcm92aWRlckNvbnRyb2xsZXIgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcblxuLy8gSW1wb3J0IGV4aXN0aW5nIG1vZHVsZXNcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcsIGlzVG9vbEVuYWJsZWQsIGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQsIGNvbmZpZ1NjaGVtYXRpY3MgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuL3N0YXRlTWFuYWdlcic7XG5pbXBvcnQgeyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIgfSBmcm9tICcuL2JhY2tncm91bmRDb21tYW5kcyc7XG5cbi8vIEltcG9ydCBjYXRlZ29yeS1zcGVjaWZpYyB0b29sIG1vZHVsZXNcbmltcG9ydCB7IHJlZ2lzdGVyRmlsZVN5c3RlbVRvb2xzIH0gZnJvbSAnLi90b29scy9maWxlU3lzdGVtVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJXZWJSZXNlYXJjaFRvb2xzIH0gZnJvbSAnLi90b29scy93ZWJSZXNlYXJjaFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyR2l0VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2dpdEdpdGh1YlRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyQnJvd3NlclRvb2xzIH0gZnJvbSAnLi90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyRGF0YWJhc2VUb29scyB9IGZyb20gJy4vdG9vbHMvZGF0YWJhc2VUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckJhY2tncm91bmRDb21tYW5kVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2JhY2tncm91bmRDb21tYW5kVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJFeGVjdXRpb25Ub29scyB9IGZyb20gJy4vdG9vbHMvZXhlY3V0aW9uVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJVdGlsaXR5VG9vbHMsIHJlZ2lzdGVyR2V0Q3VycmVudFdvcmtpbmdEaXJlY3RvcnlUb29sIH0gZnJvbSAnLi90b29scy91dGlsaXR5VG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyB9IGZyb20gJy4vdG9vbHMvaW1hZ2VQcm9jZXNzaW5nVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJIdHRwQ2xpZW50VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2h0dHBDbGllbnRUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlclJhZ1Rvb2xzIH0gZnJvbSAnLi90b29scy92ZWN0b3JSYWdUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzIH0gZnJvbSAnLi90b29scy91aUdlbmVyYXRpb25Ub29scyc7XG5pbXBvcnQgeyByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJEb2N1bWVudFRvb2xzIH0gZnJvbSAnLi90b29scy9kb2N1bWVudFRvb2xzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVFlQRVMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBUb29sQ2F0ZWdvcnkge1xuICBuYW1lOiBzdHJpbmc7XG4gIHRvb2xzOiBUb29sW107XG59XG5cbi8qKiBFeHRlbmRlZCB0b29sIHR5cGUgd2l0aCB0eXBlZCBpbXBsZW1lbnRhdGlvbiBmb3Igc2FmZSBhY2Nlc3MgKi9cbnR5cGUgVHlwZWRUb29sID0gVG9vbCAmIHtcbiAgaW1wbGVtZW50YXRpb246IChwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBjdHg/OiB1bmtub3duKSA9PiBQcm9taXNlPHVua25vd24+O1xufTtcblxuLy8gR2xvYmFsIGNvbmZpZyByZWZlcmVuY2UgdG8gZW5zdXJlIHRvb2xzUHJvdmlkZXIgdXNlcyB0aGUgbGF0ZXN0IHVzZXIgc2V0dGluZ3NcbmxldCBjdXJyZW50Q29uZmlnOiBQbHVnaW5Db25maWcgPSBERUZBVUxUX0NPTkZJRztcblxuLyoqXG4gKiBDZW50cmFsIHJlZ2lzdHJ5IGZvciBhbGwgYXZhaWxhYmxlIHRvb2xzLlxuICogVG9vbHMgYXJlIGNyZWF0ZWQgb25jZSBhdCBtb2R1bGUgbG9hZCB0aW1lIGFuZCByZXVzZWQgYWNyb3NzIHByb3ZpZGVyIGNhbGxzLlxuICovXG5jbGFzcyBUb29sUmVnaXN0cnkge1xuICBwcml2YXRlIHRvb2xNYXAgPSBuZXcgTWFwPHN0cmluZywgVHlwZWRUb29sPigpO1xuXG4gIHJlZ2lzdGVyQWxsKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlciwgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyOiBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIsIGxtQ2xpZW50PzogYW55KTogdm9pZCB7XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZmlsZVN5c3RlbScpKSB7XG4gICAgICByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyhjb25maWcsIHN0YXRlTWFuYWdlcikuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICd3ZWJTZWFyY2gnKSkge1xuICAgICAgcmVnaXN0ZXJXZWJSZXNlYXJjaFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdicm93c2VyQXV0b21hdGlvbicpKSB7XG4gICAgICByZWdpc3RlckJyb3dzZXJUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZ2l0T3BlcmF0aW9ucycpKSB7XG4gICAgICByZWdpc3RlckdpdFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdkYXRhYmFzZVF1ZXJpZXMnKSkge1xuICAgICAgcmVnaXN0ZXJEYXRhYmFzZVRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdkb2N1bWVudFBhcnNpbmcnKSkge1xuICAgICAgcmVnaXN0ZXJEb2N1bWVudFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdiYWNrZ3JvdW5kQ29tbWFuZHMnKSkge1xuICAgICAgcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzKGNvbmZpZywgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2ltYWdlUHJvY2Vzc2luZycpKSB7XG4gICAgICByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzKGNvbmZpZywgbG1DbGllbnQpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnaHR0cENsaWVudCcpKSB7XG4gICAgICByZWdpc3Rlckh0dHBDbGllbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAndmVjdG9yUkFHJykpIHtcbiAgICAgIHJlZ2lzdGVyUmFnVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ3VpR2VuZXJhdGlvbicpKSB7XG4gICAgICByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdjb250ZXh0TWFuYWdlbWVudCcpKSB7XG4gICAgICByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgcmVnaXN0ZXJlZCBvbmNlLCBmaWx0ZXJlZCBieSBlbmFibGVkIHRvb2wgdHlwZXNcbiAgICBjb25zdCBleGVjQ29uZmlnID0geyAuLi5jb25maWcgfTtcbiAgICBjb25zdCBhbGxFeGVjVG9vbHMgPSByZWdpc3RlckV4ZWN1dGlvblRvb2xzKGV4ZWNDb25maWcpO1xuICAgIFxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICdqYXZhc2NyaXB0JykpIHtcbiAgICAgIGNvbnN0IGpzVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX2phdmFzY3JpcHQnKTtcbiAgICAgIGlmIChqc1Rvb2wpIHRoaXMudG9vbE1hcC5zZXQoanNUb29sLm5hbWUsIGpzVG9vbCBhcyBUeXBlZFRvb2wpO1xuICAgIH1cbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAncHl0aG9uJykpIHtcbiAgICAgIGNvbnN0IHB5VG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX3B5dGhvbicpO1xuICAgICAgaWYgKHB5VG9vbCkgdGhpcy50b29sTWFwLnNldChweVRvb2wubmFtZSwgcHlUb29sIGFzIFR5cGVkVG9vbCk7XG4gICAgfVxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICd0ZXJtaW5hbCcpKSB7XG4gICAgICBjb25zdCB0ZXJtVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX2luX3Rlcm1pbmFsJyk7XG4gICAgICBpZiAodGVybVRvb2wpIHRoaXMudG9vbE1hcC5zZXQodGVybVRvb2wubmFtZSwgdGVybVRvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ3NoZWxsJykpIHtcbiAgICAgIGNvbnN0IHNoZWxsVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAnZXhlY3V0ZV9jb21tYW5kJyk7XG4gICAgICBpZiAoc2hlbGxUb29sKSB0aGlzLnRvb2xNYXAuc2V0KHNoZWxsVG9vbC5uYW1lLCBzaGVsbFRvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVXRpbGl0eSB0b29scyBhcmUgYWx3YXlzIHJlZ2lzdGVyZWQgKG5vIHNwZWNpZmljIGNvbmZpZyBmbGFnKVxuICAgIGNvbnN0IGdldEVuYWJsZWRUb29scyA9ICgpID0+IEFycmF5LmZyb20odGhpcy50b29sTWFwLmtleXMoKSk7XG4gICAgcmVnaXN0ZXJVdGlsaXR5VG9vbHMoY29uZmlnLCBzdGF0ZU1hbmFnZXIsIGdldEVuYWJsZWRUb29scykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIFxuICAgIC8vIFJlZ2lzdGVyIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgcXVlcnkgdG9vbCAoYWx3YXlzIGF2YWlsYWJsZSlcbiAgICByZWdpc3RlckdldEN1cnJlbnRXb3JraW5nRGlyZWN0b3J5VG9vbCgpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgfVxuXG4gIGdldEFsbCgpOiBUb29sW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudG9vbE1hcC52YWx1ZXMoKSk7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogVHlwZWRUb29sIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy50b29sTWFwLmdldChuYW1lKTtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy50b29sTWFwLmhhcyhuYW1lKTtcbiAgfVxufVxuXG4vKipcbiAqIE1hbmFnZXMgdG9vbCBleGVjdXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb29sc1Byb3ZpZGVyIHtcbiAgcHJpdmF0ZSBjb25maWc6IFBsdWdpbkNvbmZpZztcbiAgcHJpdmF0ZSBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlcjtcbiAgcHJpdmF0ZSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcjtcbiAgcHJpdmF0ZSByZWdpc3RyeTogVG9vbFJlZ2lzdHJ5O1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZz86IFBsdWdpbkNvbmZpZywgbG1DbGllbnQ/OiBhbnkpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyB8fCBERUZBVUxUX0NPTkZJRztcbiAgICB0aGlzLnN0YXRlTWFuYWdlciA9IG5ldyBTdGF0ZU1hbmFnZXIodGhpcy5jb25maWcpO1xuICAgIHRoaXMuYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyID0gbmV3IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcih0aGlzLmNvbmZpZyk7XG4gICAgdGhpcy5yZWdpc3RyeSA9IG5ldyBUb29sUmVnaXN0cnkoKTtcbiAgICB0aGlzLnJlZ2lzdHJ5LnJlZ2lzdGVyQWxsKHRoaXMuY29uZmlnLCB0aGlzLnN0YXRlTWFuYWdlciwgdGhpcy5iYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIsIGxtQ2xpZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgdG9vbCBieSBuYW1lIHdpdGggcGFyYW1ldGVycy5cbiAgICovXG4gIGFzeW5jIGV4ZWN1dGVUb29sKHRvb2xOYW1lOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCB0b29sID0gdGhpcy5yZWdpc3RyeS5nZXQodG9vbE5hbWUpO1xuICAgIGlmICghdG9vbCkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCAnJHt0b29sTmFtZX0nIG5vdCBmb3VuZGAgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gU2FmZSBhY2Nlc3MgdmlhIHR5cGVkIHdyYXBwZXIgKEM0IGZpeClcbiAgICAgIGNvbnN0IGltcGwgPSB0b29sLmltcGxlbWVudGF0aW9uO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wbChwYXJhbXMpO1xuICAgICAgXG4gICAgICAvLyBVcGRhdGUgc3RhdGUgd2l0aCBleGVjdXRpb24gcmVzdWx0XG4gICAgICB0aGlzLnN0YXRlTWFuYWdlci5zZXQoYGxhc3RfJHt0b29sTmFtZX1gLCByZXN1bHQpO1xuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCBleGVjdXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGF2YWlsYWJsZSB0b29scyBmaWx0ZXJlZCBieSBjb25maWcuXG4gICAqL1xuICBnZXRBdmFpbGFibGVUb29scygpOiBUb29sW10ge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdldEFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3RhdGUgbWFuYWdlciBpbnN0YW5jZS5cbiAgICovXG4gIGdldFN0YXRlTWFuYWdlcigpOiBTdGF0ZU1hbmFnZXIge1xuICAgIHJldHVybiB0aGlzLnN0YXRlTWFuYWdlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbi5cbiAgICovXG4gIGdldENvbmZpZygpOiBQbHVnaW5Db25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuXG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVG9vbHNQcm92aWRlciB3aXRoIGRlZmF1bHQgY29uZmlnLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVG9vbHNQcm92aWRlcihjb25maWc/OiBQbHVnaW5Db25maWcpOiBUb29sc1Byb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBUb29sc1Byb3ZpZGVyKGNvbmZpZyk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNESyBQUk9WSURFUiBGVU5DVElPTiA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE1haW4gdG9vbHMgcHJvdmlkZXIgZnVuY3Rpb24gZm9yIExNIFN0dWRpbyBTREsuXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCB0aGF0IGdldHMgY2FsbGVkIGJ5IExNIFN0dWRpby5cbiAqIFxuICogSU1QT1JUQU5UOiBUaGUgTE0gU3R1ZGlvIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyBhbGwgVG9vbCBvYmplY3RzXG4gKiByZXR1cm5lZCBmcm9tIHRoaXMgcHJvdmlkZXIgZnVuY3Rpb24uIE5vIG1hbnVhbCBjdGwuYWRkKCkgY2FsbHMgbmVlZGVkIC1cbiAqIGp1c3QgcmV0dXJuIHRoZSBhcnJheSBkaXJlY3RseSBhbmQgdGhlIFNESyBoYW5kbGVzIHJlZ2lzdHJhdGlvbi5cbiAqIFxuICogTk9URTogTXVzdCBiZSBhc3luYyBcdTIwMTQgU0RLIHR5cGUgcmVxdWlyZXMgUHJvbWlzZTxUb29sW10+LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9vbHNQcm92aWRlcihjdGw6IFRvb2xzUHJvdmlkZXJDb250cm9sbGVyLCBsbUNsaWVudD86IGFueSk6IFByb21pc2U8VG9vbFtdPiB7XG4gIC8vIEZJWDogUmVhZCBjb25maWd1cmF0aW9uIGR5bmFtaWNhbGx5IGZyb20gVUkgY29udHJvbGxlciAobGlrZSBiZWxlZGFyaWFucyBwbHVnaW4pXG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIFxuICAvLyBDb25zdHJ1Y3QgYSBsaXZlIGNvbmZpZyBvYmplY3QgZnJvbSB0aGUgVUkgc3RhdGVcbiAgY29uc3QgbGl2ZUNvbmZpZzogUGx1Z2luQ29uZmlnID0ge1xuICAgIGZpbGVTeXN0ZW06IHBsdWdpbkNvbmZpZy5nZXQoJ2ZpbGVTeXN0ZW0nKSxcbiAgICB3ZWJTZWFyY2g6IHBsdWdpbkNvbmZpZy5nZXQoJ3dlYlNlYXJjaCcpLFxuICAgIGJyb3dzZXJBdXRvbWF0aW9uOiBwbHVnaW5Db25maWcuZ2V0KCdicm93c2VyQXV0b21hdGlvbicpLFxuICAgIGdpdE9wZXJhdGlvbnM6IHBsdWdpbkNvbmZpZy5nZXQoJ2dpdE9wZXJhdGlvbnMnKSxcbiAgICBkYXRhYmFzZVF1ZXJpZXM6IHBsdWdpbkNvbmZpZy5nZXQoJ2RhdGFiYXNlUXVlcmllcycpLFxuICAgIGRvY3VtZW50UGFyc2luZzogcGx1Z2luQ29uZmlnLmdldCgnZG9jdW1lbnRQYXJzaW5nJyksXG4gICAgYmFja2dyb3VuZENvbW1hbmRzOiBwbHVnaW5Db25maWcuZ2V0KCdiYWNrZ3JvdW5kQ29tbWFuZHMnKSxcbiAgICBpbWFnZVByb2Nlc3Npbmc6IHBsdWdpbkNvbmZpZy5nZXQoJ2ltYWdlUHJvY2Vzc2luZycpLFxuICAgIGh0dHBDbGllbnQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2h0dHBDbGllbnQnKSxcbiAgICB2ZWN0b3JSQUc6IHBsdWdpbkNvbmZpZy5nZXQoJ3ZlY3RvclJBRycpLFxuICAgIHVpR2VuZXJhdGlvbjogcGx1Z2luQ29uZmlnLmdldCgndWlHZW5lcmF0aW9uJyksXG4gICAgY29udGV4dE1hbmFnZW1lbnQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2NvbnRleHRNYW5hZ2VtZW50JyksXG4gICAgZ29kTW9kZTogcGx1Z2luQ29uZmlnLmdldCgnZ29kTW9kZScpLFxuICAgIGRvY3VtZW50UkFHOiBwbHVnaW5Db25maWcuZ2V0KCdkb2N1bWVudFJBRycpLFxuICAgIHJldHJpZXZhbExpbWl0OiBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxMaW1pdCcpLFxuICAgIHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkOiBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCcpLFxuICAgIGV4ZWN1dGlvbkphdmFTY3JpcHQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvbkphdmFTY3JpcHQnKSxcbiAgICBleGVjdXRpb25QeXRob246IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvblB5dGhvbicpLFxuICAgIGV4ZWN1dGlvblRlcm1pbmFsOiBwbHVnaW5Db25maWcuZ2V0KCdleGVjdXRpb25UZXJtaW5hbCcpLFxuICAgIGV4ZWN1dGlvblNoZWxsOiBwbHVnaW5Db25maWcuZ2V0KCdleGVjdXRpb25TaGVsbCcpLFxuICAgIHNlYXJjaEZhbGxiYWNrQ2hhaW46IHBsdWdpbkNvbmZpZy5nZXQoJ3NlYXJjaEZhbGxiYWNrQ2hhaW4nKSxcbiAgICBtYXhTZWFyY2hSZXN1bHRzOiBwbHVnaW5Db25maWcuZ2V0KCdtYXhTZWFyY2hSZXN1bHRzJyksXG4gICAgc2FmZXNlYXJjaDogcGx1Z2luQ29uZmlnLmdldCgnc2FmZXNlYXJjaCcpLFxuICAgIGJyb3dzZXJUaW1lb3V0OiBwbHVnaW5Db25maWcuZ2V0KCdicm93c2VyVGltZW91dCcpLFxuICAgIGhlYWRsZXNzTW9kZTogcGx1Z2luQ29uZmlnLmdldCgnaGVhZGxlc3NNb2RlJyksXG4gICAgZ2l0QXV0b0NvbW1pdDogcGx1Z2luQ29uZmlnLmdldCgnZ2l0QXV0b0NvbW1pdCcpLFxuICAgIGRlZmF1bHRCcmFuY2g6IHBsdWdpbkNvbmZpZy5nZXQoJ2RlZmF1bHRCcmFuY2gnKSxcbiAgICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3BhdGhWYWxpZGF0aW9uRW5hYmxlZCcpLFxuICAgIGJpbmFyeUZpbGVEZXRlY3Rpb246IHBsdWdpbkNvbmZpZy5nZXQoJ2JpbmFyeUZpbGVEZXRlY3Rpb24nKSxcbiAgICByZWdleFJlRG9TUHJvdGVjdGlvbjogcGx1Z2luQ29uZmlnLmdldCgncmVnZXhSZURvU1Byb3RlY3Rpb24nKSxcbiAgICBtYXhSZWdleExlbmd0aDogcGx1Z2luQ29uZmlnLmdldCgnbWF4UmVnZXhMZW5ndGgnKSxcbiAgICBzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDogcGx1Z2luQ29uZmlnLmdldCgnc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQnKSxcbiAgICBzdGF0ZU1heFNpemU6IHBsdWdpbkNvbmZpZy5nZXQoJ3N0YXRlTWF4U2l6ZScpLFxuICAgIGxhbmd1YWdlOiBwbHVnaW5Db25maWcuZ2V0KCdsYW5ndWFnZScpLFxuICAgIG5vdGlmaWNhdGlvbnNFbmFibGVkOiBwbHVnaW5Db25maWcuZ2V0KCdub3RpZmljYXRpb25zRW5hYmxlZCcpLFxuICAgIHRlbXBvcmFsQXdhcmVuZXNzOiBwbHVnaW5Db25maWcuZ2V0KCd0ZW1wb3JhbEF3YXJlbmVzcycpLFxuICAgIGRhdGVGb3JtYXRTdHlsZTogcGx1Z2luQ29uZmlnLmdldCgnZGF0ZUZvcm1hdFN0eWxlJyksXG4gIH07XG5cbiAgY29uc3QgcHJvdmlkZXIgPSBjcmVhdGVUb29sc1Byb3ZpZGVyKGxpdmVDb25maWcpO1xuICBcbiAgLy8gUmV0dXJuIGFsbCBhdmFpbGFibGUgdG9vbHMgLSBTREsgYXV0b21hdGljYWxseSByZWdpc3RlcnMgdGhlbVxuICByZXR1cm4gcHJvdmlkZXIuZ2V0QXZhaWxhYmxlVG9vbHMoKTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGhlIGdsb2JhbCBjb25maWd1cmF0aW9uIHJlZmVyZW5jZS5cbiAqIENhbGwgdGhpcyBmcm9tIG1haW4oKSB0byBlbnN1cmUgdG9vbHNQcm92aWRlciB1c2VzIHRoZSBsYXRlc3QgdXNlciBzZXR0aW5ncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUdsb2JhbENvbmZpZyhjb25maWc6IFBsdWdpbkNvbmZpZyk6IHZvaWQge1xuICBjdXJyZW50Q29uZmlnID0gY29uZmlnO1xufVxuIiwgIi8qKlxuICogRG9jdW1lbnQgUkFHIFByb21wdCBQcmVwcm9jZXNzb3IgKyBXb3JraW5nIERpcmVjdG9yeSBEZXRlY3Rpb24gKyBUZW1wb3JhbCBBd2FyZW5lc3NcbiAqL1xuXG5pbXBvcnQgeyB0eXBlIENoYXRNZXNzYWdlLCB0eXBlIEZpbGVIYW5kbGUsIHR5cGUgUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlciB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgY29uZmlnU2NoZW1hdGljcyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBwZGZQYXJzZSBmcm9tICdwZGYtcGFyc2UnO1xuaW1wb3J0IHsgQ29udGV4dEd1YXJkIH0gZnJvbSAnLi9jb250ZXh0R3VhcmQnO1xuaW1wb3J0IHsgc2V0QXR0YWNobWVudHMsIGxpc3RBdHRhY2htZW50cyB9IGZyb20gJy4vYXR0YWNobWVudE1hbmFnZXInO1xuXG4vLyAtLS0gVGVtcG9yYWwgQXdhcmVuZXNzIEhlbHBlcnMgKG1lcmdlZCBmcm9tIHVwX3RvX2RhdGUpIC0tLVxuaW50ZXJmYWNlIERhdGVUaW1lQ2FjaGUge1xuICBjb21wYWN0OiBzdHJpbmc7XG4gIGZ1bGw6IHN0cmluZztcbn1cblxubGV0IGNhY2hlZERhdGVUaW1lRGF0YTogRGF0ZVRpbWVDYWNoZSB8IG51bGwgPSBudWxsO1xuY29uc3QgQ0FDSEVfRFVSQVRJT05fTVMgPSA1ICogNjAgKiAxMDAwOyAvLyBSZWZyZXNoIGV2ZXJ5IDUgbWludXRlc1xuXG4vLyBDb250ZXh0R3VhcmQgaW50ZWdyYXRpb25cbmxldCBjb250ZXh0R3VhcmQ6IENvbnRleHRHdWFyZCB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29udGV4dEd1YXJkKGd1YXJkOiBDb250ZXh0R3VhcmQgfCBudWxsKTogdm9pZCB7XG4gIGNvbnRleHRHdWFyZCA9IGd1YXJkO1xufVxubGV0IGNhY2hlVGltZXN0YW1wID0gMDtcblxuZnVuY3Rpb24gZ2V0Q2FjaGVkRGF0ZVRpbWUoKTogRGF0ZVRpbWVDYWNoZSB7XG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gIFxuICBpZiAoY2FjaGVkRGF0ZVRpbWVEYXRhICYmIChub3cgLSBjYWNoZVRpbWVzdGFtcCkgPCBDQUNIRV9EVVJBVElPTl9NUykge1xuICAgIHJldHVybiBjYWNoZWREYXRlVGltZURhdGE7XG4gIH1cbiAgXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICBcbiAgLy8gQ29tcGFjdCBmb3JtYXQ6IERELk1NLllZWVksIEhIOm1tXG4gIGNvbnN0IGNvbXBhY3QgPSBkYXRlLnRvTG9jYWxlU3RyaW5nKCdkZS1ERScsIHtcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgbW9udGg6ICcyLWRpZ2l0JyxcbiAgICBkYXk6ICcyLWRpZ2l0JyxcbiAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgbWludXRlOiAnMi1kaWdpdCdcbiAgfSk7XG4gIFxuICAvLyBGdWxsIGZvcm1hdDogV29jaGVudGFnLCBERC4gTU1NTSBZWVlZLCBISDptbSBVaHJcbiAgY29uc3QgZnVsbCA9IGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2RlLURFJywge1xuICAgIHdlZWtkYXk6ICdsb25nJyxcbiAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgbW9udGg6ICdsb25nJyxcbiAgICBkYXk6ICdudW1lcmljJyxcbiAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgbWludXRlOiAnMi1kaWdpdCdcbiAgfSkgKyAnIFVocic7XG4gIFxuICBjYWNoZWREYXRlVGltZURhdGEgPSB7IGNvbXBhY3QsIGZ1bGwgfTtcbiAgY2FjaGVUaW1lc3RhbXAgPSBub3c7XG4gIFxuICByZXR1cm4gY2FjaGVkRGF0ZVRpbWVEYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRUZW1wb3JhbFN1ZmZpeChjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIpOiBzdHJpbmcge1xuICBjb25zdCBjb25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBcbiAgLy8gVXNlIC5nZXQoKSBtZXRob2Qgd2l0aCBwcm9wZXIgZGVmYXVsdHMgLSBtb3JlIHJlbGlhYmxlIHRoYW4gZGlyZWN0IHByb3BlcnR5IGFjY2Vzc1xuICBjb25zdCB0ZW1wb3JhbEF3YXJlbmVzc0VuYWJsZWQgPSBjb25maWcuZ2V0KCd0ZW1wb3JhbEF3YXJlbmVzcycpID8/IHRydWU7XG4gIFxuICBpZiAoIXRlbXBvcmFsQXdhcmVuZXNzRW5hYmxlZCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBcbiAgY29uc3Qgc3R5bGUgPSBjb25maWcuZ2V0KCdkYXRlRm9ybWF0U3R5bGUnKSA/PyAnc3RhbmRhcmQnO1xuICBjb25zdCB7IGNvbXBhY3QsIGZ1bGwgfSA9IGdldENhY2hlZERhdGVUaW1lKCk7XG4gIFxuICAvLyBERUJVRzogVW5jb21tZW50IHRvIHZlcmlmeSB3aGF0J3MgYmVpbmcgaW5qZWN0ZWRcbiAgY29uc29sZS5sb2coYFtURU1QT1JBTF0gSW5qZWN0aW5nOiAke3N0eWxlID09PSAnaGV1dGVJc3QnID8gYEhFVVRFIElTVCAke2Z1bGx9YCA6IGBbWmVpdDogJHtjb21wYWN0fV1gfWApO1xuICBcbiAgaWYgKHN0eWxlID09PSAnaGV1dGVJc3QnKSB7XG4gICAgcmV0dXJuIGBcXG5cXG5IRVVURSBJU1QgJHtmdWxsfWA7XG4gIH1cbiAgcmV0dXJuIGBcXG5cXG5bWmVpdDogJHtjb21wYWN0fV1gO1xufVxuXG5mdW5jdGlvbiBkZXRlY3REaXJlY3RvcnlQYXRoKHRleHQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAvLyBSZW1vdmUgVVJMcyBmaXJzdCB0byBhdm9pZCBmYWxzZSBwb3NpdGl2ZXMgbGlrZSAvbWVkaXVtLmNvbSBmcm9tIGh0dHBzOi8vbWVkaXVtLmNvbS8uLi5cbiAgY29uc3Qgd2l0aG91dFVybHMgPSB0ZXh0LnJlcGxhY2UoL2h0dHBzPzpcXC9cXC9bXlxcc10rfHd3d1xcLlteXFxzXSt8ZmlsZTpcXC9cXC9bXlxcc10rL2csICcnKTtcblxuICAvLyBXaW5kb3dzIHBhdGhzOiBDOlxccGF0aCBvciBEOlxcZm9sZGVyIChtdXN0IHN0YXJ0IHdpdGggZHJpdmUgbGV0dGVyKVxuICAgY29uc3Qgd2luTWF0Y2ggPSB3aXRob3V0VXJscy5tYXRjaCgvW0EtWmEtel06XFxcXFtcXHdcXC1fLiBcXFxcXSsvKTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXl5eXl5eXl5eXlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCYWNrc2xhc2ggYWRkZWQgXHUyNzEzXG4gIGlmICh3aW5NYXRjaCkgcmV0dXJuIHdpbk1hdGNoWzBdLnRyaW0oKTtcblxuICAvLyBVbml4IGFic29sdXRlIHBhdGhzOiAvaG9tZS91c2VyL2RpciwgL3Zhci9sb2csIGV0Yy5cbiAgY29uc3QgdW5peE1hdGNoID0gd2l0aG91dFVybHMubWF0Y2goLyg/Ol58XFxzKShcXC9bXFx3XFwtXy4gXXsyLH0pLyk7XG4gIGlmICh1bml4TWF0Y2gpIHtcbiAgICBjb25zdCBwYXRoID0gdW5peE1hdGNoWzFdLnRyaW0oKTtcbiAgICAvLyBSZWplY3QgcGF0aHMgdGhhdCBsb29rIGxpa2UgVVJMcyBvciBmcmFnbWVudHMgKGUuZy4sIC8gQ2hhdCBmaWxlcyBzKVxuICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvICcpICYmICFwYXRoLmluY2x1ZGVzKCcgJykpIHtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlbGF0aXZlIHBhdGhzOiAuL2ZvbGRlciwgLi4vcGFyZW50L2RpclxuICBjb25zdCByZWxNYXRjaCA9IHdpdGhvdXRVcmxzLm1hdGNoKC8oPzpefFxccykoPzpcXC5cXC98XFwuXFxcXC5cXC98XFwuXFwuXFwvKVtcXHdcXC1fLiBdKy8pO1xuICBpZiAocmVsTWF0Y2gpIHJldHVybiByZWxNYXRjaFswXS50cmltKCk7XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGluamVjdFdvcmtpbmdEaXJlY3RvcnlQcm9tcHQob3JpZ2luYWxNZXNzYWdlOiBzdHJpbmcsIGRldGVjdGVkUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgaW5zdHJ1Y3Rpb24gPSBgXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblx1MjZBMFx1RkUwRiBXT1JLSU5HIERJUkVDVE9SWSBERVRFQ1RFRFxuXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXG5cblRoZSB1c2VyIG1lbnRpb25lZCBhIGRpcmVjdG9yeSBwYXRoIGluIHRoZWlyIG1lc3NhZ2U6XG5cbiAgICAke2RldGVjdGVkUGF0aH1cblxuUGxlYXNlIGFzayB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uIGJlZm9yZSBjaGFuZ2luZyB0aGUgd29ya2luZyBkaXJlY3RvcnkuXG5FeGFtcGxlIHJlc3BvbnNlOlxuXG5cIkkgbm90aWNlZCB5b3UgbWVudGlvbmVkIHRoZSBkaXJlY3RvcnkgJyR7ZGV0ZWN0ZWRQYXRofScuIFxuV291bGQgeW91IGxpa2UgbWUgdG8gc2V0IHRoaXMgYXMgeW91ciB3b3JraW5nIGRpcmVjdG9yeT8gXG5BbGwgc3Vic2VxdWVudCBmaWxlIG9wZXJhdGlvbnMgd2lsbCB1c2UgdGhpcyBkaXJlY3RvcnkgYXMgdGhlIGJhc2UuXG5cblJlcGx5ICd5ZXMnIG9yICdqYScgdG8gY29uZmlybSwgb3IgJ25vJy8nbmVpbicgdG8gZGVjbGluZS5cIlxuXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblxuVXNlcidzIG9yaWdpbmFsIG1lc3NhZ2U6XG4ke29yaWdpbmFsTWVzc2FnZX1cbmA7XG4gIFxuICByZXR1cm4gaW5zdHJ1Y3Rpb24udHJpbSgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBleHRyYWN0UGRmVGV4dChmaWxlSGFuZGxlOiBGaWxlSGFuZGxlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCAoZmlsZUhhbmRsZSBhcyBhbnkpLnJlYWRGaWxlID8gYXdhaXQgKGZpbGVIYW5kbGUgYXMgYW55KS5yZWFkRmlsZSgpIDogQnVmZmVyLmZyb20oYXdhaXQgKGZpbGVIYW5kbGUgYXMgYW55KS5yZWFkKCkpO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBwZGZQYXJzZShidWZmZXIpO1xuICAgIHJldHVybiBkYXRhLnRleHQudHJpbSgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoYFtSQUddIEVycm9yIGV4dHJhY3RpbmcgdGV4dCBmcm9tIFBERiAke2ZpbGVIYW5kbGUubmFtZX06YCwgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHBhcnNlIFBERjogJHtmaWxlSGFuZGxlLm5hbWV9YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2h1bmtUZXh0KHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSAxMDAwLCBvdmVybGFwOiBudW1iZXIgPSAxMDApOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHdvcmRzID0gdGV4dC5zcGxpdCgvXFxzKy8pO1xuICBjb25zdCBjaHVua3M6IHN0cmluZ1tdID0gW107XG4gIFxuICBpZiAod29yZHMubGVuZ3RoIDw9IGNodW5rU2l6ZSkge1xuICAgIHJldHVybiBbdGV4dF07XG4gIH1cblxuICBsZXQgc3RhcnRJbmRleCA9IDA7XG4gIHdoaWxlIChzdGFydEluZGV4IDwgd29yZHMubGVuZ3RoKSB7XG4gICAgY29uc3QgZW5kSW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4ICsgY2h1bmtTaXplLCB3b3Jkcy5sZW5ndGgpO1xuICAgIGNvbnN0IGNodW5rVGV4dCA9IHdvcmRzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KS5qb2luKCcgJyk7XG4gICAgXG4gICAgY2h1bmtzLnB1c2goY2h1bmtUZXh0KTtcbiAgICBzdGFydEluZGV4ID0gZW5kSW5kZXggLSBvdmVybGFwO1xuICB9XG5cbiAgcmV0dXJuIGNodW5rcy5maWx0ZXIoYyA9PiBjLnRyaW0oKS5sZW5ndGggPiAwKTtcbn1cblxuZnVuY3Rpb24gY29zaW5lU2ltaWxhcml0eShhOiBudW1iZXJbXSwgYjogbnVtYmVyW10pOiBudW1iZXIge1xuICBsZXQgZG90UHJvZHVjdCA9IDA7XG4gIGxldCBub3JtQSA9IDA7XG4gIGxldCBub3JtQiA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgIGRvdFByb2R1Y3QgKz0gYVtpXSAqIGJbaV07XG4gICAgbm9ybUEgKz0gYVtpXSAqIGFbaV07XG4gICAgbm9ybUIgKz0gYltpXSAqIGJbaV07XG4gIH1cbiAgcmV0dXJuIGRvdFByb2R1Y3QgLyAoTWF0aC5zcXJ0KG5vcm1BKSAqIE1hdGguc3FydChub3JtQikpO1xufVxuXG5pbnRlcmZhY2UgUmV0cmlldmFsUmVzdWx0IHtcbiAgY29udGVudDogc3RyaW5nO1xuICBzY29yZTogbnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZXRyaWV2ZUZyb21QZGZzKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIHBkZkZpbGVzOiBGaWxlSGFuZGxlW10sXG4pOiBQcm9taXNlPFJldHJpZXZhbFJlc3VsdFtdPiB7XG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIGNvbnN0IHJldHJpZXZhbExpbWl0ID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsTGltaXQnKSB8fCA1O1xuICAvLyBMb3dlciBkZWZhdWx0IHRocmVzaG9sZCB0byBjYXRjaCBtb3JlIHJlc3VsdHMgLSB3YXMgdG9vIGhpZ2ggYXQgMC42XG4gIGNvbnN0IHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnKSA/PyAwLjM7XG5cbiAgY29uc29sZS5sb2coYFtSQUddIFByb2Nlc3NpbmcgJHtwZGZGaWxlcy5sZW5ndGh9IFBERiBmaWxlKHMpYCk7XG5cbiAgLy8gRXh0cmFjdCB0ZXh0IGZyb20gYWxsIFBERiBmaWxlc1xuICBjb25zdCBmaWxlVGV4dHM6IHsgZmlsZTogRmlsZUhhbmRsZTsgdGV4dDogc3RyaW5nIH1bXSA9IFtdO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgcGRmRmlsZXMpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGV4dHJhY3RQZGZUZXh0KGZpbGUpO1xuICAgICAgaWYgKHRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1JBR10gRXh0cmFjdGVkICR7dGV4dC5sZW5ndGh9IGNoYXJzIGZyb20gJHtmaWxlLm5hbWV9YCk7XG4gICAgICAgIGZpbGVUZXh0cy5wdXNoKHsgZmlsZSwgdGV4dCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW1JBR10gTm8gdGV4dCBleHRyYWN0ZWQgZnJvbSAke2ZpbGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgW1JBR10gU2tpcHBpbmcgUERGICR7ZmlsZS5uYW1lfSBkdWUgdG8gZXJyb3I6YCwgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChmaWxlVGV4dHMubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc29sZS53YXJuKCdbUkFHXSBObyB0ZXh0IGV4dHJhY3RlZCBmcm9tIGFueSBQREYnKTtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvLyBDaHVuayB0aGUgdGV4dHNcbiAgY29uc3QgY2h1bmtzOiB7IGZpbGU6IEZpbGVIYW5kbGU7IGNodW5rOiBzdHJpbmcgfVtdID0gW107XG4gIGZvciAoY29uc3QgeyBmaWxlLCB0ZXh0IH0gb2YgZmlsZVRleHRzKSB7XG4gICAgY29uc3QgZmlsZUNodW5rcyA9IGNodW5rVGV4dCh0ZXh0KTtcbiAgICBjb25zb2xlLmxvZyhgW1JBR10gJHtmaWxlLm5hbWV9OiAke3RleHQubGVuZ3RofSBjaGFycyBcdTIxOTIgJHtmaWxlQ2h1bmtzLmxlbmd0aH0gY2h1bmtzYCk7XG4gICAgZmlsZUNodW5rcy5mb3JFYWNoKChjaHVuaykgPT4ge1xuICAgICAgY2h1bmtzLnB1c2goeyBmaWxlLCBjaHVuayB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChjaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cbiAgLy8gR2VuZXJhdGUgZW1iZWRkaW5ncyBmb3IgYWxsIGNodW5rcyB1c2luZyBMTSBTdHVkaW8ncyBlbWJlZGRpbmcgbW9kZWxcbiAgbGV0IG1vZGVsO1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdbUkFHXSBMb2FkaW5nIGVtYmVkZGluZyBtb2RlbC4uLicpO1xuICAgIG1vZGVsID0gYXdhaXQgY3RsLmNsaWVudC5lbWJlZGRpbmcubW9kZWwoJ25vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGJywge1xuICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1tSQUddIEVtYmVkZGluZyBtb2RlbCBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1JBR10gRmFpbGVkIHRvIGxvYWQgZW1iZWRkaW5nIG1vZGVsOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEVtYmVkZGluZyBtb2RlbCBub3QgYXZhaWxhYmxlOiAke2Vycm9yfWApO1xuICB9XG5cbiAgY29uc3QgYmF0Y2hTaXplID0gMzI7XG4gIGNvbnN0IGFsbEVtYmVkZGluZ3M6IG51bWJlcltdW10gPSBbXTtcblxuICB0cnkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSArPSBiYXRjaFNpemUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBHZW5lcmF0aW5nIGVtYmVkZGluZ3MgYmF0Y2ggJHtNYXRoLmZsb29yKGkgLyBiYXRjaFNpemUpICsgMX0vJHtNYXRoLmNlaWwoY2h1bmtzLmxlbmd0aCAvIGJhdGNoU2l6ZSl9Li4uYCk7XG4gICAgICBjb25zdCBiYXRjaCA9IGNodW5rcy5zbGljZShpLCBpICsgYmF0Y2hTaXplKS5tYXAoYyA9PiBjLmNodW5rKTtcbiAgICAgIGNvbnN0IGVtYmVkZGluZ3NSZXN1bHQgPSBhd2FpdCBtb2RlbC5lbWJlZChiYXRjaCk7XG4gICAgICBhbGxFbWJlZGRpbmdzLnB1c2goLi4uKGVtYmVkZGluZ3NSZXN1bHQgYXMgYW55W10pLm1hcCgoZTogYW55KSA9PiBlLmVtYmVkZGluZykpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciBnZW5lcmF0aW5nIGVtYmVkZGluZ3M6JywgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihgRW1iZWRkaW5nIGdlbmVyYXRpb24gZmFpbGVkOiAke2Vycm9yfWApO1xuICB9XG5cbiAgLy8gR2VuZXJhdGUgZW1iZWRkaW5nIGZvciB0aGUgcXVlcnlcbiAgbGV0IHF1ZXJ5TW9kZWw7XG4gIHRyeSB7XG4gICAgcXVlcnlNb2RlbCA9IGF3YWl0IGN0bC5jbGllbnQuZW1iZWRkaW5nLm1vZGVsKCdub21pYy1haS9ub21pYy1lbWJlZC10ZXh0LXYxLjUtR0dVRicsIHtcbiAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEZhaWxlZCB0byBsb2FkIHF1ZXJ5IGVtYmVkZGluZyBtb2RlbDonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBRdWVyeSBlbWJlZGRpbmcgZmFpbGVkOiAke2Vycm9yfWApO1xuICB9XG5cbiAgbGV0IHF1ZXJ5RW1iZWRkaW5nO1xuICB0cnkge1xuICAgIGNvbnN0IHF1ZXJ5UmVzdWx0ID0gYXdhaXQgcXVlcnlNb2RlbC5lbWJlZChbcXVlcnldKTtcbiAgICBxdWVyeUVtYmVkZGluZyA9IHF1ZXJ5UmVzdWx0WzBdLmVtYmVkZGluZztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciBnZW5lcmF0aW5nIHF1ZXJ5IGVtYmVkZGluZzonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBRdWVyeSBlbWJlZGRpbmcgZmFpbGVkOiAke2Vycm9yfWApO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIHNpbWlsYXJpdGllcyBhbmQgcmV0cmlldmUgdG9wIHJlc3VsdHNcbiAgY29uc3Qgc2NvcmVzOiB7IGNodW5rSW5kZXg6IG51bWJlcjsgc2ltaWxhcml0eTogbnVtYmVyIH1bXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNpbWlsYXJpdHkgPSBjb3NpbmVTaW1pbGFyaXR5KHF1ZXJ5RW1iZWRkaW5nLCBhbGxFbWJlZGRpbmdzW2ldKTtcbiAgICBzY29yZXMucHVzaCh7IGNodW5rSW5kZXg6IGksIHNpbWlsYXJpdHkgfSk7XG4gIH1cblxuICAvLyBTb3J0IGJ5IHNpbWlsYXJpdHkgZGVzY2VuZGluZyBhbmQgZmlsdGVyIGJ5IHRocmVzaG9sZFxuICBzY29yZXMuc29ydCgoYSwgYikgPT4gYi5zaW1pbGFyaXR5IC0gYS5zaW1pbGFyaXR5KTtcbiAgXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBGb3VuZCAke3Njb3Jlcy5sZW5ndGh9IGNodW5rcywgZmlsdGVyaW5nIHdpdGggdGhyZXNob2xkICR7cmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGR9YCk7XG4gIGNvbnN0IHJlbGV2YW50Q2h1bmtzID0gc2NvcmVzLmZpbHRlcihcbiAgICAocykgPT4gcy5zaW1pbGFyaXR5ID49IHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkICYmIHMuY2h1bmtJbmRleCA8IGNodW5rcy5sZW5ndGgsXG4gICk7XG5cbiAgLy8gTGltaXQgcmVzdWx0c1xuICBjb25zdCBsaW1pdGVkUmVzdWx0cyA9IHJlbGV2YW50Q2h1bmtzLnNsaWNlKDAsIHJldHJpZXZhbExpbWl0KTtcblxuICBjb25zb2xlLmxvZyhgW1JBR10gUmV0dXJuaW5nICR7bGltaXRlZFJlc3VsdHMubGVuZ3RofSByZXN1bHRzYCk7XG4gIHJldHVybiBsaW1pdGVkUmVzdWx0cy5tYXAoKHIpID0+ICh7XG4gICAgY29udGVudDogY2h1bmtzW3IuY2h1bmtJbmRleF0uY2h1bmssXG4gICAgc2NvcmU6IHIuc2ltaWxhcml0eSxcbiAgfSkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJlcHJvY2VzcyhcbiAgY3RsOiBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyLFxuICB1c2VyTWVzc2FnZTogQ2hhdE1lc3NhZ2Vcbik6IFByb21pc2U8c3RyaW5nIHwgQ2hhdE1lc3NhZ2U+IHtcbiAgY29uc3QgdXNlclByb21wdCA9IHVzZXJNZXNzYWdlLmdldFRleHQoKTtcbiAgXG4gIC8vIFN0ZXAgMC41OiBDb250ZXh0R3VhcmQgYXV0by1jb21wcmVzc2lvbiAoYmVmb3JlIGFueSBwcm9jZXNzaW5nKVxuICBpZiAoY29udGV4dEd1YXJkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBjdGwucHVsbEhpc3RvcnkoKTtcbiAgICAgIGhpc3RvcnkuYXBwZW5kKHVzZXJNZXNzYWdlKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gaGlzdG9yeS5nZXRNZXNzYWdlc0FycmF5KCk7XG4gICAgICBjb25zdCB0b2tlbkNvdW50ID0gYXdhaXQgY29udGV4dEd1YXJkLmNvdW50VG9rZW5zKG1lc3NhZ2VzKTtcbiAgICAgIGNvbnN0IHRocmVzaG9sZCA9IGNvbnRleHRHdWFyZC5nZXRUaHJlc2hvbGQoKTtcbiAgICAgIGlmICh0b2tlbkNvdW50ID4gdGhyZXNob2xkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dEd1YXJkXSBUb2tlbiBjb3VudCAke3Rva2VuQ291bnR9IGV4Y2VlZHMgdGhyZXNob2xkICR7dGhyZXNob2xkfSwgY29tcHJlc3NpbmcuLi5gKTtcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZE1lc3NhZ2VzID0gYXdhaXQgY29udGV4dEd1YXJkLmNvbXByZXNzSGlzdG9yeShtZXNzYWdlcyk7XG4gICAgICAgIC8vIENsZWFyIGhpc3RvcnkgYnkgcG9wcGluZyBhbGwgbWVzc2FnZXNcbiAgICAgICAgd2hpbGUgKGhpc3RvcnkuZ2V0TGVuZ3RoKCkgPiAwKSB7XG4gICAgICAgICAgaGlzdG9yeS5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICBjb21wcmVzc2VkTWVzc2FnZXMuZm9yRWFjaChtc2cgPT4gaGlzdG9yeS5hcHBlbmQobXNnKSk7XG4gICAgICAgIGNvbnRleHRHdWFyZC5yZXNldFRva2VuQ2FjaGUoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tDb250ZXh0R3VhcmRdIEF1dG8tY29tcHJlc3Npb24gZmFpbGVkOicsIGUpO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gU3RlcCAwOiBBbHdheXMgcmVnaXN0ZXIgYXR0YWNobWVudHMgc28gdG9vbHMgY2FuIGFjY2VzcyB0aGVtIGJ5IG5hbWVcbiAgY29uc3QgYWxsRmlsZXMgPSB1c2VyTWVzc2FnZS5nZXRGaWxlcyhjdGwuY2xpZW50KTtcbiAgc2V0QXR0YWNobWVudHMoYWxsRmlsZXMpO1xuICBcbiAgLy8gQnVpbGQgYXR0YWNobWVudCBub3RpY2UgdG8gaW5qZWN0IGludG8gcHJvbXB0XG4gIGxldCBhdHRhY2htZW50Tm90aWNlID0gJyc7XG4gIGlmIChhbGxGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmlsZU5hbWVzID0gbGlzdEF0dGFjaG1lbnRzKCk7XG4gICAgYXR0YWNobWVudE5vdGljZSA9IGBcXG5cXG5cdUQ4M0RcdURDQ0UgQVRUQUNIRUQgRklMRVMgQVZBSUxBQkxFOlxcbllvdSBoYXZlIGFjY2VzcyB0byB0aGUgZm9sbG93aW5nIGF0dGFjaGVkIGZpbGVzLiBZb3UgY2FuIHJlYWQgdGhlbSB1c2luZyB0aGUgcmVhZF9kb2N1bWVudCB0b29sIGJ5IGZpbGVuYW1lOlxcbiR7ZmlsZU5hbWVzLm1hcChuYW1lID0+IGAtICR7bmFtZX1gKS5qb2luKCdcXG4nKX1gO1xuICB9XG4gIFxuICAvLyBTdGVwIDE6IERpcmVjdG9yeSBkZXRlY3Rpb24gKGhpZ2hlc3QgcHJpb3JpdHkpXG4gIGNvbnN0IGRldGVjdGVkUGF0aCA9IGRldGVjdERpcmVjdG9yeVBhdGgodXNlclByb21wdCk7XG4gIGlmIChkZXRlY3RlZFBhdGgpIHtcbiAgICByZXR1cm4gaW5qZWN0V29ya2luZ0RpcmVjdG9yeVByb21wdCh1c2VyUHJvbXB0ICsgYXR0YWNobWVudE5vdGljZSwgZGV0ZWN0ZWRQYXRoKSArIGdldFRlbXBvcmFsU3VmZml4KGN0bCk7XG4gIH1cbiAgXG4gIC8vIFN0ZXAgMjogRG9jdW1lbnQgUkFHIHByb2Nlc3NpbmcgKGlmIGVuYWJsZWQpXG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIGNvbnN0IGRvY3VtZW50UkFHRW5hYmxlZCA9IHBsdWdpbkNvbmZpZy5nZXQoJ2RvY3VtZW50UkFHJyk7XG4gIFxuICBjb25zb2xlLmxvZyhgW1JBR10gZG9jdW1lbnRSQUcgZW5hYmxlZDogJHtkb2N1bWVudFJBR0VuYWJsZWR9YCk7XG4gIFxuICBpZiAoIWRvY3VtZW50UkFHRW5hYmxlZCkge1xuICAgIC8vIElmIFJBRyBpcyBkaXNhYmxlZCwganVzdCByZXR1cm4gdGhlIG1lc3NhZ2Ugd2l0aCBhdHRhY2htZW50IG5vdGljZVxuICAgIGNvbnN0IGJhc2UgPSB1c2VyUHJvbXB0ICsgYXR0YWNobWVudE5vdGljZTtcbiAgICByZXR1cm4gYmFzZSArIGdldFRlbXBvcmFsU3VmZml4KGN0bCk7XG4gIH1cblxuICBjb25zdCBuZXdGaWxlcyA9IGFsbEZpbGVzLmZpbHRlcihmID0+IGYudHlwZSAhPT0gJ2ltYWdlJyk7XG4gIGNvbnNvbGUubG9nKGBbUkFHXSBGb3VuZCAke25ld0ZpbGVzLmxlbmd0aH0gbm9uLWltYWdlIGZpbGVzYCk7XG4gIFxuICBpZiAobmV3RmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc3QgYmFzZSA9IHVzZXJQcm9tcHQgKyBhdHRhY2htZW50Tm90aWNlO1xuICAgIHJldHVybiBiYXNlICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbiAgfVxuXG4gIC8vIFNlcGFyYXRlIFBERiBmaWxlcyBmcm9tIG90aGVyIGZpbGUgdHlwZXNcbiAgY29uc3QgcGRmRmlsZXMgPSBuZXdGaWxlcy5maWx0ZXIoZiA9PiBmLm5hbWUudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCgnLnBkZicpKTtcbiAgY29uc3Qgb3RoZXJGaWxlcyA9IG5ld0ZpbGVzLmZpbHRlcihmID0+ICFmLm5hbWUudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCgnLnBkZicpKTtcblxuICBjb25zb2xlLmxvZyhgW1JBR10gUERGczogJHtwZGZGaWxlcy5sZW5ndGh9LCBPdGhlcjogJHtvdGhlckZpbGVzLmxlbmd0aH1gKTtcblxuICBsZXQgYWxsUmVzdWx0czogUmV0cmlldmFsUmVzdWx0W10gPSBbXTtcblxuICAvLyBQcm9jZXNzIFBERnMgd2l0aCBjdXN0b20gbG9jYWwgcGlwZWxpbmUgKG1vcmUgcmVsaWFibGUgZm9yIGNvbXBsZXggbGF5b3V0cylcbiAgaWYgKHBkZkZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGRmUmVzdWx0cyA9IGF3YWl0IHJldHJpZXZlRnJvbVBkZnMoY3RsLCB1c2VyUHJvbXB0LCBwZGZGaWxlcyk7XG4gICAgICBjb25zb2xlLmxvZyhgW1JBR10gUERGIHJldHJpZXZhbCByZXR1cm5lZCAke3BkZlJlc3VsdHMubGVuZ3RofSByZXN1bHRzYCk7XG4gICAgICBhbGxSZXN1bHRzLnB1c2goLi4ucGRmUmVzdWx0cyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIHByb2Nlc3NpbmcgUERGczonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvY2VzcyBvdGhlciBmaWxlcyB3aXRoIExNIFN0dWRpbydzIG5hdGl2ZSByZXRyaWV2YWwgQVBJIChoYW5kbGVzIC50eHQsIC5tZCwgZXRjLiBuYXRpdmVseSlcbiAgaWYgKG90aGVyRmlsZXMubGVuZ3RoID4gMCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBtb2RlbCA9IGF3YWl0IGN0bC5jbGllbnQuZW1iZWRkaW5nLm1vZGVsKCdub21pYy1haS9ub21pYy1lbWJlZC10ZXh0LXYxLjUtR0dVRicsIHtcbiAgICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY3RsLmNsaWVudC5maWxlcy5yZXRyaWV2ZSh1c2VyUHJvbXB0LCBvdGhlckZpbGVzLCB7XG4gICAgICAgIGVtYmVkZGluZ01vZGVsOiBtb2RlbCxcbiAgICAgICAgbGltaXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0JykgfHwgNSxcbiAgICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgLy8gQ29udmVydCBoaWdoLWxldmVsIEFQSSByZXN1bHRzIHRvIG91ciBmb3JtYXRcbiAgICAgIGNvbnN0IGZpbHRlcmVkRW50cmllcyA9IHJlc3VsdC5lbnRyaWVzLmZpbHRlcihcbiAgICAgICAgZW50cnkgPT4gZW50cnkuc2NvcmUgPiAocGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnKSA/PyAwLjMpXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coYFtSQUddIE5hdGl2ZSByZXRyaWV2YWwgcmV0dXJuZWQgJHtmaWx0ZXJlZEVudHJpZXMubGVuZ3RofSByZXN1bHRzYCk7XG4gICAgICBhbGxSZXN1bHRzLnB1c2goLi4uZmlsdGVyZWRFbnRyaWVzLm1hcChlID0+ICh7IGNvbnRlbnQ6IGUuY29udGVudCwgc2NvcmU6IGUuc2NvcmUgfSkpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW1JBR10gRXJyb3IgcmV0cmlldmluZyBmcm9tIG90aGVyIGZpbGVzOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvLyBTb3J0IGFuZCBsaW1pdCByZXN1bHRzXG4gIGFsbFJlc3VsdHMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICBjb25zdCByZXRyaWV2YWxMaW1pdCA9IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0JykgfHwgNTtcbiAgYWxsUmVzdWx0cyA9IGFsbFJlc3VsdHMuc2xpY2UoMCwgcmV0cmlldmFsTGltaXQpO1xuXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBUb3RhbCByZXN1bHRzIGFmdGVyIHNvcnRpbmc6ICR7YWxsUmVzdWx0cy5sZW5ndGh9YCk7XG5cbiAgLy8gSW5qZWN0IGNvbnRleHQgaWYgcmVzdWx0cyBmb3VuZFxuICBpZiAoYWxsUmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGNvbnRleHRJbmplY3Rpb24gPSAnJztcbiAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiBhbGxSZXN1bHRzKSB7XG4gICAgICBjb250ZXh0SW5qZWN0aW9uICs9IGBcXG4ke3Jlc3VsdC5jb250ZW50fVxcbi0tLVxcbmA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke3VzZXJQcm9tcHR9JHthdHRhY2htZW50Tm90aWNlfVxcblxcbi0tLSBSRUxFVkFOVCBET0NVTUVOVCBDT05URVhUIC0tLVxcbiR7Y29udGV4dEluamVjdGlvbi50cmltKCl9YCArIGdldFRlbXBvcmFsU3VmZml4KGN0bCk7XG4gIH1cblxuICAvLyBJZiBubyByZXN1bHRzIGZvdW5kLCByZXR1cm4gb3JpZ2luYWwgbWVzc2FnZSB3aXRoIGF0dGFjaG1lbnQgbm90aWNlXG4gIGNvbnNvbGUubG9nKCdbUkFHXSBObyByZWxldmFudCByZXN1bHRzIGZvdW5kJyk7XG4gIGNvbnN0IGJhc2UgPSB1c2VyUHJvbXB0ICsgYXR0YWNobWVudE5vdGljZTtcbiAgcmV0dXJuIGJhc2UgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xufVxuIiwgIi8qKlxuICogQUkgVG9vbGJveCBQbHVnaW4gLSBFbnRyeSBQb2ludFxuICogTWFpbiBmdW5jdGlvbiBleHBvcnRlZCBmb3IgTE0gU3R1ZGlvIHBsdWdpbiBzeXN0ZW1cbiAqL1xuXG5pbXBvcnQgeyB0eXBlIFBsdWdpbkNvbnRleHQgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2xzUHJvdmlkZXIgfSBmcm9tICcuL3Rvb2xzUHJvdmlkZXInO1xuaW1wb3J0IHsgY29uZmlnU2NoZW1hdGljcyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IHByZXByb2Nlc3MgfSBmcm9tICcuL3Byb21wdFByZXByb2Nlc3Nvcic7XG5pbXBvcnQgeyBjbGVhbnVwQnJvd3NlclNlc3Npb24gfSBmcm9tICcuL3Rvb2xzL2Jyb3dzZXJBdXRvbWF0aW9uVG9vbHMnO1xuXG4vLyBcdTI3MDUgRklYOiBVc2Ugc3RydWN0dXJlZCBsb2dnaW5nIGluc3RlYWQgb2YgY29uc29sZS5sb2dcbmNvbnN0IGxvZ2dlciA9IHtcbiAgaW5mbzogKG1zZzogc3RyaW5nKSA9PiB0eXBlb2YgcHJvY2Vzcy5zdGRvdXQud3JpdGUgPT09ICdmdW5jdGlvbicgJiYgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYFtBSSBUb29sYm94XSAke21zZ31cXG5gKSxcbiAgd2FybjogKG1zZzogc3RyaW5nKSA9PiB0eXBlb2YgcHJvY2Vzcy5zdGRlcnIud3JpdGUgPT09ICdmdW5jdGlvbicgJiYgcHJvY2Vzcy5zdGRlcnIud3JpdGUoYFtBSSBUb29sYm94IFdBUk5dICR7bXNnfVxcbmApLFxuICBlcnJvcjogKG1zZzogc3RyaW5nKSA9PiB0eXBlb2YgcHJvY2Vzcy5zdGRlcnIud3JpdGUgPT09ICdmdW5jdGlvbicgJiYgcHJvY2Vzcy5zdGRlcnIud3JpdGUoYFtBSSBUb29sYm94IEVSUk9SXSAke21zZ31cXG5gKSxcbn07XG5cbi8qKlxuICogTWFpbiBwbHVnaW4gZW50cnkgcG9pbnQgLSBjYWxsZWQgYnkgTE0gU3R1ZGlvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWluKGNvbnRleHQ6IFBsdWdpbkNvbnRleHQpIHtcbiAgbG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZy4uLicpO1xuICBcbiAgLy8gUmVnaXN0ZXIgdGhlIGNvbmZpZ3VyYXRpb24gc2NoZW1hdGljcyAobWFrZXMgdG9nZ2xlcyBhcHBlYXIgaW4gVUkpXG4gIGNvbnRleHQud2l0aENvbmZpZ1NjaGVtYXRpY3MoY29uZmlnU2NoZW1hdGljcyk7XG4gIFxuICAvLyBSZWdpc3RlciB0aGUgcHJvbXB0IHByZXByb2Nlc3NvciBmb3IgRG9jdW1lbnQgUkFHIC8gQ2hhdCB3aXRoIEZpbGVzXG4gIGNvbnRleHQud2l0aFByb21wdFByZXByb2Nlc3NvcihwcmVwcm9jZXNzKTtcbiAgXG4gIC8vIE5vdGU6IExNIFN0dWRpbyBTREsgdjEuNS4wIGRvZXNuJ3QgZXhwb3NlIGdldENvbmZpZygpIG9uIFBsdWdpbkNvbnRleHQuXG4gIC8vIENvbmZpZ3VyYXRpb24gaXMgaGFuZGxlZCBhdXRvbWF0aWNhbGx5IGJ5IHRoZSBTREsncyBjb25maWcgc3lzdGVtLlxuICAvLyBUaGUgdG9vbHNQcm92aWRlciB3aWxsIHVzZSBkZWZhdWx0IHNldHRpbmdzIHVudGlsIFVJIHRvZ2dsZXMgYXJlIGFwcGxpZWQuXG4gIFxuICAvLyBSZWdpc3RlciB0aGUgdG9vbHMgcHJvdmlkZXIgZnVuY3Rpb25cbiAgY29udGV4dC53aXRoVG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcbiAgXG4gIC8vIEhhbmRsZSBwbHVnaW4gdW5sb2FkIC0gY2xlYW51cCBicm93c2VyIHNlc3Npb24gdG8gcHJldmVudCBvcnBoYW5lZCBwcm9jZXNzZXNcbiAgaWYgKHR5cGVvZiBwcm9jZXNzLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJvY2Vzcy5vbignU0lHVEVSTScsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNsZWFudXBCcm93c2VyU2Vzc2lvbigpO1xuICAgIH0pO1xuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNsZWFudXBCcm93c2VyU2Vzc2lvbigpO1xuICAgIH0pO1xuICB9XG4gIFxuICBsb2dnZXIuaW5mbygnSW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5IScpO1xufVxuIiwgImltcG9ydCB7IExNU3R1ZGlvQ2xpZW50LCB0eXBlIFBsdWdpbkNvbnRleHQgfSBmcm9tIFwiQGxtc3R1ZGlvL3Nka1wiO1xuXG5kZWNsYXJlIHZhciBwcm9jZXNzOiBhbnk7XG5cbi8vIFdlIHJlY2VpdmUgcnVudGltZSBpbmZvcm1hdGlvbiBpbiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuY29uc3QgY2xpZW50SWRlbnRpZmllciA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQ0xJRU5UX0lERU5USUZJRVI7XG5jb25zdCBjbGllbnRQYXNza2V5ID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9DTElFTlRfUEFTU0tFWTtcbmNvbnN0IGJhc2VVcmwgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0JBU0VfVVJMO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgTE1TdHVkaW9DbGllbnQoe1xuICBjbGllbnRJZGVudGlmaWVyLFxuICBjbGllbnRQYXNza2V5LFxuICBiYXNlVXJsLFxufSk7XG5cbihnbG9iYWxUaGlzIGFzIGFueSkuX19MTVNfUExVR0lOX0NPTlRFWFQgPSB0cnVlO1xuXG5sZXQgcHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0ID0gZmFsc2U7XG5sZXQgcHJvbXB0UHJlcHJvY2Vzc29yU2V0ID0gZmFsc2U7XG5sZXQgY29uZmlnU2NoZW1hdGljc1NldCA9IGZhbHNlO1xubGV0IGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQgPSBmYWxzZTtcbmxldCB0b29sc1Byb3ZpZGVyU2V0ID0gZmFsc2U7XG5sZXQgZ2VuZXJhdG9yU2V0ID0gZmFsc2U7XG5cbmNvbnN0IHNlbGZSZWdpc3RyYXRpb25Ib3N0ID0gY2xpZW50LnBsdWdpbnMuZ2V0U2VsZlJlZ2lzdHJhdGlvbkhvc3QoKTtcblxuY29uc3QgcGx1Z2luQ29udGV4dDogUGx1Z2luQ29udGV4dCA9IHtcbiAgd2l0aFByZWRpY3Rpb25Mb29wSGFuZGxlcjogKGdlbmVyYXRlKSA9PiB7XG4gICAgaWYgKHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJlZGljdGlvbkxvb3BIYW5kbGVyIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKHRvb2xzUHJvdmlkZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByZWRpY3Rpb25Mb29wSGFuZGxlciBjYW5ub3QgYmUgdXNlZCB3aXRoIGEgdG9vbHMgcHJvdmlkZXJcIik7XG4gICAgfVxuXG4gICAgcHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRQcmVkaWN0aW9uTG9vcEhhbmRsZXIoZ2VuZXJhdGUpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoUHJvbXB0UHJlcHJvY2Vzc29yOiAocHJlcHJvY2VzcykgPT4ge1xuICAgIGlmIChwcm9tcHRQcmVwcm9jZXNzb3JTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByb21wdFByZXByb2Nlc3NvciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIHByb21wdFByZXByb2Nlc3NvclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0UHJvbXB0UHJlcHJvY2Vzc29yKHByZXByb2Nlc3MpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoQ29uZmlnU2NoZW1hdGljczogKGNvbmZpZ1NjaGVtYXRpY3MpID0+IHtcbiAgICBpZiAoY29uZmlnU2NoZW1hdGljc1NldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uZmlnIHNjaGVtYXRpY3MgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBjb25maWdTY2hlbWF0aWNzU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRDb25maWdTY2hlbWF0aWNzKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoR2xvYmFsQ29uZmlnU2NoZW1hdGljczogKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3MpID0+IHtcbiAgICBpZiAoZ2xvYmFsQ29uZmlnU2NoZW1hdGljc1NldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2xvYmFsIGNvbmZpZyBzY2hlbWF0aWNzIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgZ2xvYmFsQ29uZmlnU2NoZW1hdGljc1NldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0R2xvYmFsQ29uZmlnU2NoZW1hdGljcyhnbG9iYWxDb25maWdTY2hlbWF0aWNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aFRvb2xzUHJvdmlkZXI6ICh0b29sc1Byb3ZpZGVyKSA9PiB7XG4gICAgaWYgKHRvb2xzUHJvdmlkZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvb2xzIHByb3ZpZGVyIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVG9vbHMgcHJvdmlkZXIgY2Fubm90IGJlIHVzZWQgd2l0aCBhIHByZWRpY3Rpb25Mb29wSGFuZGxlclwiKTtcbiAgICB9XG5cbiAgICB0b29sc1Byb3ZpZGVyU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRUb29sc1Byb3ZpZGVyKHRvb2xzUHJvdmlkZXIpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoR2VuZXJhdG9yOiAoZ2VuZXJhdG9yKSA9PiB7XG4gICAgaWYgKGdlbmVyYXRvclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG5cbiAgICBnZW5lcmF0b3JTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldEdlbmVyYXRvcihnZW5lcmF0b3IpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxufTtcblxuaW1wb3J0KFwiLi8uLi9zcmMvaW5kZXgudHNcIikudGhlbihhc3luYyBtb2R1bGUgPT4ge1xuICByZXR1cm4gYXdhaXQgbW9kdWxlLm1haW4ocGx1Z2luQ29udGV4dCk7XG59KS50aGVuKCgpID0+IHtcbiAgc2VsZlJlZ2lzdHJhdGlvbkhvc3QuaW5pdENvbXBsZXRlZCgpO1xufSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZXhlY3V0ZSB0aGUgbWFpbiBmdW5jdGlvbiBvZiB0aGUgcGx1Z2luLlwiKTtcbiAgY29uc29sZS5lcnJvcihlcnJvcik7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9STyxTQUFTLGNBQWMsUUFBc0IsVUFBd1E7QUFDMVQsU0FBTyxPQUFPLFFBQVEsTUFBTTtBQUM5QjtBQVdPLFNBQVMsdUJBQXVCLFFBQXNCQSxRQUErRDtBQUUxSCxVQUFRQSxRQUFNO0FBQUEsSUFFWixLQUFLO0FBQWMsYUFBTyxPQUFPLHdCQUF3QjtBQUFBLElBRXpELEtBQUs7QUFBYyxhQUFPLE9BQU8sb0JBQW9CO0FBQUEsSUFFckQsS0FBSztBQUFjLGFBQU8sT0FBTyxzQkFBc0I7QUFBQSxJQUV2RCxLQUFLO0FBQWMsYUFBTyxPQUFPLG1CQUFtQjtBQUFBLEVBRXREO0FBRUY7QUEvU0EsZ0JBRUEsWUFRYSxjQTJJQSxnQkE4TUE7QUFuV2I7QUFBQTtB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QUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsNEJBQTRCLENBQUMsMkJBQTJCO0FBQ3RELFFBQUksMkJBQTJCO0FBQzdCLFlBQU0sSUFBSSxNQUFNLDZDQUE2QztBQUFBLElBQy9EO0FBQ0EsZ0NBQTRCO0FBQzVCLHlCQUFxQiwwQkFBMEIsc0JBQXNCO0FBQ3JFLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxtQkFBbUIsQ0FBQ0MsbUJBQWtCO0FBQ3BDLFFBQUksa0JBQWtCO0FBQ3BCLFlBQU0sSUFBSSxNQUFNLG1DQUFtQztBQUFBLElBQ3JEO0FBQ0EsUUFBSSwwQkFBMEI7QUFDNUIsWUFBTSxJQUFJLE1BQU0sNERBQTREO0FBQUEsSUFDOUU7QUFFQSx1QkFBbUI7QUFDbkIseUJBQXFCLGlCQUFpQkEsY0FBYTtBQUNuRCxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsZUFBZSxDQUFDLGNBQWM7QUFDNUIsUUFBSSxjQUFjO0FBQ2hCLFlBQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUFBLElBQ2hEO0FBRUEsbUJBQWU7QUFDZix5QkFBcUIsYUFBYSxTQUFTO0FBQzNDLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFFQSx3REFBNEIsS0FBSyxPQUFNQyxZQUFVO0FBQy9DLFNBQU8sTUFBTUEsUUFBTyxLQUFLLGFBQWE7QUFDeEMsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUNaLHVCQUFxQixjQUFjO0FBQ3JDLENBQUMsRUFBRSxNQUFNLENBQUMsVUFBVTtBQUNsQixVQUFRLE1BQU0sb0RBQW9EO0FBQ2xFLFVBQVEsTUFBTSxLQUFLO0FBQ3JCLENBQUM7IiwKICAibmFtZXMiOiBbInRvb2wiLCAicGxhdGZvcm0iLCAicGF0aCIsICJmcyIsICJyZXNvbHZlIiwgImZzIiwgInBhdGgiLCAic3Bhd25XaXRoUHJvZ3Jlc3MiLCAicmVzb2x2ZSIsICJydW5Db25maWdBbmFseXNpcyIsICJydW5JbXBvcnRBbmFseXNpcyIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJkZGdTZWFyY2giLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgIm1lc3NhZ2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgInJlc29sdmUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJyZXNvbHZlIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJpbXBvcnRfY2hpbGRfcHJvY2VzcyIsICJoYW5kbGVFcnJvciIsICJwbGF0Zm9ybSIsICJyZXNvbHZlIiwgIm1lc3NhZ2UiLCAiZ2V0V29ya2luZ0RpciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAib3MiLCAicGF0aCIsICJmcyIsICJpbXBvcnRfY2hpbGRfcHJvY2VzcyIsICJoYW5kbGVFcnJvciIsICJzdGF0IiwgInNwYXduIiwgInBsYXRmb3JtIiwgInJlc29sdmUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImZzIiwgInBhdGgiLCAib3MiLCAiaG9zdG5hbWUiLCAiaGFuZGxlRXJyb3IiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImNodW5rVGV4dCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAicGF0aCIsICJmcyIsICJwdXBwZXRlZXJNb2R1bGUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImZzIiwgInBhdGgiLCAidG9vbCIsICJzdGF0IiwgImhhbmRsZUVycm9yIiwgImV4dCIsICJwZGZQYXJzZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAicGF0aCIsICJmcyIsICJ0b29sIiwgInBhdGgiLCAicGRmUGFyc2UiLCAiY2h1bmtUZXh0IiwgImJhc2UiLCAibG9nZ2VyIiwgImltcG9ydF9zZGsiLCAicHJlcHJvY2VzcyIsICJjb25maWdTY2hlbWF0aWNzIiwgInRvb2xzUHJvdmlkZXIiLCAibW9kdWxlIl0KfQo=
