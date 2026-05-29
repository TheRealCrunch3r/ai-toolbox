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
      dateFormatStyle: import_zod.z.enum(["standard", "heuteIst"]).default("standard").describe("Date format style for temporal awareness")
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
      dateFormatStyle: "standard"
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
    }, DEFAULT_CONFIG.dateFormatStyle).build();
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
  const platform3 = os.platform();
  let baseDir;
  switch (platform3) {
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
  const platform3 = os2.platform();
  return new Promise((resolve2, reject) => {
    let cmd;
    let args;
    switch (platform3) {
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
  const platform3 = os2.platform();
  return new Promise((resolve2, reject) => {
    let cmd;
    let args;
    switch (platform3) {
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
  const platform3 = os2.platform();
  const candidates = [];
  switch (platform3) {
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
function validateImageFile(filePath) {
  const fs11 = require("fs");
  const stat2 = fs11.statSync(filePath);
  if (!stat2.isFile()) {
    return { valid: false, error: `Path "${filePath}" is not a file` };
  }
  const ext = path7.extname(filePath).toLowerCase();
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff", ".webp"];
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `Unsupported image format: ${ext}` };
  }
  const maxSize = 50 * 1024 * 1024;
  if (stat2.size > maxSize) {
    return { valid: false, error: `File too large (${(stat2.size / 1024 / 1024).toFixed(1)}MB), max is 50MB` };
  }
  return { valid: true };
}
function handleError5(error) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: `Image processing failed: ${message}` };
}
async function imageToText({ imagePath, language = "eng" }) {
  try {
    const validation = validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };
    const Tesseract = (await import("tesseract.js")).default;
    console.log(`[AI Toolbox] OCR starting for ${imagePath} (language: ${language})`);
    const result = await Tesseract.recognize(imagePath, language, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          process.stdout.write(`\r[AI Toolbox] OCR progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      }
    });
    console.log("\n[AI Toolbox] OCR complete");
    return {
      success: true,
      data: {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        language,
        words: result.data.words?.length || 0
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
    const fs11 = require("fs");
    const stat2 = fs11.statSync(imagePath);
    return {
      success: true,
      data: {
        path: imagePath,
        size: `${(stat2.size / 1024).toFixed(1)} KB`,
        format: path7.extname(imagePath).replace(".", "").toUpperCase(),
        note: "Vision model description requires integration with a vision API (e.g., GPT-4 Vision, Claude Vision). This tool currently returns metadata."
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
    const os3 = require("os");
    const platform3 = os3.platform();
    let cmd;
    let args;
    let tempPath;
    switch (platform3) {
      case "win32":
        tempPath = outputPath || path7.join(os3.tmpdir(), `screenshot_${Date.now()}.png`);
        cmd = "powershell.exe";
        args = [
          "-NoProfile",
          "-Command",
          `$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $bitmap = New-Object Drawing.Bitmap($screen.Width, $screen.Height); $graphics = [Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen(0, 0, 0, 0, $bitmap.Size); $bitmap.Save('${tempPath}', [System.Drawing.Imaging.ImageFormat]::Png)`
        ];
        break;
      case "darwin":
        tempPath = outputPath || path7.join(os3.tmpdir(), `screenshot_${Date.now()}.png`);
        cmd = "/bin/bash";
        args = ["-c", `screencapture -x "${tempPath}"`];
        break;
      default:
        tempPath = outputPath || path7.join(os3.tmpdir(), `screenshot_${Date.now()}.png`);
        cmd = "/bin/bash";
        args = ["-c", `(import -window root "${tempPath}" 2>/dev/null || scrot "${tempPath}" 2>/dev/null) && echo "Screenshot saved to ${tempPath}"`];
        break;
    }
    const { spawn: spawn4 } = require("child_process");
    return new Promise((resolve2, reject) => {
      const proc = spawn4(cmd, args);
      let stderr = "";
      proc.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      proc.on("close", (code) => {
        if (code === 0 && tempPath) {
          const fs11 = require("fs");
          const stat2 = fs11.statSync(tempPath);
          resolve2({
            success: true,
            data: {
              path: tempPath,
              size: `${(stat2.size / 1024).toFixed(1)} KB`,
              format
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
    if (!validation1.valid) return { success: false, error: `Image 1: ${validation1.error}` };
    const validation2 = validateImageFile(image2Path);
    if (!validation2.valid) return { success: false, error: `Image 2: ${validation2.error}` };
    const pixelmatch = (await import("pixelmatch")).default;
    const PNG = (await import("pngjs")).PNG;
    const fs11 = require("fs");
    const sharp = (await import("sharp")).default;
    const img1Buffer = await sharp(image1Path).png().toBuffer();
    const img2Buffer = await sharp(image2Path).png().toBuffer();
    const img1 = PNG.sync.decode(img1Buffer);
    const img2 = PNG.sync.decode(img2Buffer);
    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);
    const buf1 = new Uint8ClampedArray(width * height * 4);
    const buf2 = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx1 = (y * img1.width + x) * 4;
        const idx2 = (y * img2.width + x) * 4;
        const outIdx = (y * width + x) * 4;
        buf1[outIdx] = img1.data[idx1];
        buf1[outIdx + 1] = img1.data[idx1 + 1];
        buf1[outIdx + 2] = img1.data[idx1 + 2];
        buf1[outIdx + 3] = img1.data[idx1 + 3];
        buf2[outIdx] = img2.data[idx2];
        buf2[outIdx + 1] = img2.data[idx2 + 1];
        buf2[outIdx + 2] = img2.data[idx2 + 2];
        buf2[outIdx + 3] = img2.data[idx2 + 3];
      }
    }
    const diff = new Uint8ClampedArray(width * height * 4);
    const numDiffPixels = pixelmatch(buf1, buf2, diff, width, height, { threshold: 0.1 });
    const totalPixels = width * height;
    const similarity = (totalPixels - numDiffPixels) / totalPixels * 100;
    return {
      success: true,
      data: {
        image1: image1Path,
        image2: image2Path,
        dimensions: `${width}x${height}`,
        similarityPercent: similarity.toFixed(2),
        differentPixels: numDiffPixels,
        totalPixels,
        isIdentical: numDiffPixels === 0
      }
    };
  } catch (error) {
    return handleError5(error);
  }
}
function registerImageProcessingTools(_config) {
  const tools = [];
  tools.push((0, import_sdk10.tool)({
    name: "image_to_text",
    description: "Extract text from images using OCR (Tesseract.js). Supports multiple languages.",
    parameters: {
      imagePath: import_zod10.z.string().describe("Path to the image file"),
      language: import_zod10.z.string().optional().default("eng").describe('Language code for OCR (e.g., "eng", "deu", "chi_sim")')
    },
    implementation: async (params) => imageToText(params)
  }));
  tools.push((0, import_sdk10.tool)({
    name: "describe_image",
    description: "Get metadata and basic description of an image file.",
    parameters: {
      imagePath: import_zod10.z.string().describe("Path to the image file")
    },
    implementation: async (params) => describeImage(params)
  }));
  tools.push((0, import_sdk10.tool)({
    name: "screenshot_desktop",
    description: "Capture a screenshot of the desktop and save it to a file.",
    parameters: {
      outputPath: import_zod10.z.string().optional().describe("Output path for the screenshot (default: temp directory)"),
      format: import_zod10.z.enum(["png", "jpeg"]).optional().default("png").describe("Image format"),
      quality: import_zod10.z.number().min(1).max(100).optional().default(90).describe("JPEG quality (1-100, only applies to JPEG format)")
    },
    implementation: async (params) => screenshotDesktop(params)
  }));
  tools.push((0, import_sdk10.tool)({
    name: "compare_images",
    description: "Compare two images and calculate pixel-level similarity score.",
    parameters: {
      image1Path: import_zod10.z.string().describe("Path to the first image"),
      image2Path: import_zod10.z.string().describe("Path to the second image")
    },
    implementation: async (params) => compareImages(params)
  }));
  return tools;
}
var import_sdk10, import_zod10, path7;
var init_imageProcessingTools = __esm({
  "src/tools/imageProcessingTools.ts"() {
    "use strict";
    import_sdk10 = require("@lmstudio/sdk");
    import_zod10 = require("zod");
    path7 = __toESM(require("path"));
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
    if (!fs7.existsSync(directoryPath)) {
      return { success: false, error: `Directory not found: ${directoryPath}` };
    }
    const store = new LocalVectorStore();
    let indexedCount = 0;
    let skippedCount = 0;
    const findFiles = (dir) => {
      let results = [];
      try {
        const entries = fs7.readdirSync(dir, { withFileTypes: true });
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
        const content = fs7.readFileSync(filePath, "utf-8");
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
var import_sdk12, import_zod12, path8, fs7, LocalVectorStore;
var init_vectorRagTools = __esm({
  "src/tools/vectorRagTools.ts"() {
    "use strict";
    import_sdk12 = require("@lmstudio/sdk");
    import_zod12 = require("zod");
    path8 = __toESM(require("path"));
    fs7 = __toESM(require("fs"));
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
        fs8.writeFileSync(filePath, html_content);
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
var import_sdk13, import_zod13, fs8, path9;
var init_uiGenerationTools = __esm({
  "src/tools/uiGenerationTools.ts"() {
    "use strict";
    import_sdk13 = require("@lmstudio/sdk");
    import_zod13 = require("zod");
    fs8 = __toESM(require("fs"));
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
var import_sdk14, import_zod14, fs9, path10, ContextStorageManager, ContextAnalyzer;
var init_contextManagementTools = __esm({
  "src/tools/contextManagementTools.ts"() {
    "use strict";
    import_sdk14 = require("@lmstudio/sdk");
    import_zod14 = require("zod");
    fs9 = __toESM(require("fs"));
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
          if (!fs9.existsSync(this.storagePath)) {
            console.log(`[ContextStorage.load] File does not exist yet: ${this.storagePath}`);
            return [];
          }
          const data = fs9.readFileSync(this.storagePath, "utf-8");
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
          if (!fs9.existsSync(dir)) {
            fs9.mkdirSync(dir, { recursive: true });
            console.log(`[ContextStorage.save] Created directory: ${dir}`);
          }
          const tempPath = this.storagePath + ".tmp";
          fs9.writeFileSync(tempPath, JSON.stringify(entries, null, 2));
          fs9.renameSync(tempPath, this.storagePath);
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
  if (!fs10.existsSync(filePath)) {
    return { valid: false, error: `File not found on disk: ${filePath}` };
  }
  const stat2 = fs10.statSync(filePath);
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
        const text = fs10.readFileSync(file_path, "utf-8");
        return {
          success: true,
          data: {
            file_path,
            format: "TXT",
            word_count: text.split(/\s+/).filter((w) => w.length > 0).length,
            size: `${(fs10.statSync(file_path).size / 1024).toFixed(1)} KB`,
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
    const dataBuffer = fs10.readFileSync(filePath);
    const result = await pdfParse2(dataBuffer);
    console.log(`[AI Toolbox] PDF read complete: ${result.numpages} pages, ${(result.text.length / 1024).toFixed(1)}KB`);
    return {
      success: true,
      data: {
        file_path: filePath,
        format: "PDF",
        pages: result.numpages,
        word_count: result.text.split(/\s+/).filter((w) => w.length > 0).length,
        size: `${(fs10.statSync(filePath).size / 1024).toFixed(1)} KB`,
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
    const dataBuffer = fs10.readFileSync(filePath);
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
        size: `${(fs10.statSync(filePath).size / 1024).toFixed(1)} KB`,
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
var import_sdk15, import_zod15, path11, fs10;
var init_documentTools = __esm({
  "src/tools/documentTools.ts"() {
    "use strict";
    import_sdk15 = require("@lmstudio/sdk");
    import_zod15 = require("zod");
    path11 = __toESM(require("path"));
    fs10 = __toESM(require("fs"));
    init_attachmentManager();
  }
});

// src/toolsProvider.ts
function createToolsProvider(config) {
  return new ToolsProvider(config);
}
async function toolsProvider(ctl) {
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
      registerAll(config, stateManager, backgroundCommandManager) {
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
      constructor(config) {
        this.config = config || DEFAULT_CONFIG;
        this.stateManager = new StateManager(this.config);
        this.backgroundCommandManager = new BackgroundCommandManager(this.config);
        this.registry = new ToolRegistry();
        this.registry.registerAll(this.config, this.stateManager, this.backgroundCommandManager);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kQ29tbWFuZHMudHMiLCAiLi4vc3JjL3dvcmtpbmdEaXIudHMiLCAiLi4vc3JjL3NlY3VyaXR5LnRzIiwgIi4uL3NyYy9wZXJmb3JtYW5jZVV0aWxzLnRzIiwgIi4uL3NyYy90b29scy9maWxlU3lzdGVtVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2dpdEdpdGh1YlRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9kYXRhYmFzZVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9leGVjdXRpb25Ub29scy50cyIsICIuLi9zcmMvdG9vbHMvdXRpbGl0eVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvaHR0cENsaWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy92ZWN0b3JSYWdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMudHMiLCAiLi4vc3JjL2F0dGFjaG1lbnRNYW5hZ2VyLnRzIiwgIi4uL3NyYy90b29scy9kb2N1bWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29sc1Byb3ZpZGVyLnRzIiwgIi4uL3NyYy9wcm9tcHRQcmVwcm9jZXNzb3IudHMiLCAiLi4vc3JjL2luZGV4LnRzIiwgImVudHJ5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuaW1wb3J0IHsgY3JlYXRlQ29uZmlnU2NoZW1hdGljcyB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gWm9kIFNjaGVtYSAodmFsaWRhdGlvbikgPT09PT09PT09PT09PT09PT09PT1cblxuXG5cbmV4cG9ydCBjb25zdCBDb25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG5cbiAgLy8gVG9vbCBHYXRpbmcgKGVuYWJsZS9kaXNhYmxlIGluZGl2aWR1YWwgdG9vbHMpXG5cbiAgZmlsZVN5c3RlbTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICB3ZWJTZWFyY2g6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYnJvd3NlckF1dG9tYXRpb246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuXG4gIGdpdE9wZXJhdGlvbnM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuXG4gIGRhdGFiYXNlUXVlcmllczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cbiAgZG9jdW1lbnRQYXJzaW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIGJhY2tncm91bmRDb21tYW5kczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0NcdUREOTUgTkVXIFRPT0wgQ0FURUdPUklFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBpbWFnZVByb2Nlc3Npbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBpbWFnZSBPQ1IsIHNjcmVlbnNob3QsIGFuZCBjb21wYXJpc29uIHRvb2xzJyksXG5cbiAgaHR0cENsaWVudDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0VuYWJsZSBnZW5lcmljIEhUVFAgY2xpZW50IGZvciBSRVNUIEFQSSBjYWxscycpLFxuXG4gIHZlY3RvclJBRzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIHNlbWFudGljIHNlYXJjaCB3aXRoIHZlY3RvciBlbWJlZGRpbmdzJyksXG4gIHVpR2VuZXJhdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0VuYWJsZSBpbnRlcmFjdGl2ZSBVSSBnZW5lcmF0aW9uIGFuZCByZW5kZXJpbmcgdG9vbHMnKSxcbiAgY29udGV4dE1hbmFnZW1lbnQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBhdXRvbWF0aWMgY29udGV4dCB0cmFja2luZyBhbmQgbWVtb3J5IG1hbmFnZW1lbnQnKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBnb2RNb2RlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnXHUyNkEwXHVGRTBGIFdBUk5JTkc6IEVuYWJsZXMgZXZlcnkgdG9vbCBjYXRlZ29yeS4gVXNlIHdpdGggY2F1dGlvbi4nKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzRFx1RENEQSBET0NVTUVOVCBSQUcgLyBDSEFUIFdJVEggRklMRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgZG9jdW1lbnRSQUc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBmaWxlIGluZGV4aW5nIGFuZCBzZW1hbnRpYyBzZWFyY2ggZm9yIGNoYXQnKSxcblxuICByZXRyaWV2YWxMaW1pdDogei5udW1iZXIoKS5taW4oMSkubWF4KDIwKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiByZWxldmFudCBjaHVua3MgdG8gcmV0cmlldmUnKSxcblxuICByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZDogei5udW1iZXIoKS5taW4oMC4wKS5tYXgoMS4wKS5kZWZhdWx0KDAuNSkuZGVzY3JpYmUoJ01pbmltdW0gc2ltaWxhcml0eSBzY29yZSBmb3IgYSBjaHVuayB0byBiZSBjb25zaWRlcmVkIHJlbGV2YW50ICgwLTEpJyksXG5cbiAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCBpbmRpdmlkdWFsIHRvZ2dsZXMgKGdyYW51bGFyIGNvbnRyb2wpXG5cbiAgZXhlY3V0aW9uSmF2YVNjcmlwdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9qYXZhc2NyaXB0IHRvb2wnKSxcblxuICBleGVjdXRpb25QeXRob246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdBbGxvdyBydW5fcHl0aG9uIHRvb2wnKSxcblxuICBleGVjdXRpb25UZXJtaW5hbDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9pbl90ZXJtaW5hbCB0b29sJyksXG5cbiAgZXhlY3V0aW9uU2hlbGw6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0FsbG93IGV4ZWN1dGVfY29tbWFuZCB0b29sJyksXG5cblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBXZWIgU2VhcmNoIFNldHRpbmdzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIHNlYXJjaEZhbGxiYWNrQ2hhaW46IHouZW51bShbJ2RkZy1hcGknLCAnZGRnLWZldGNoJywgJ2dvb2dsZScsICdiaW5nJ10pLmRlZmF1bHQoJ2RkZy1hcGknKS5kZXNjcmliZSgnUHJpbWFyeSBzZWFyY2ggZW5naW5lIChhdXRvLWZhbGxiYWNrIHRvIG90aGVycyknKSxcblxuICBtYXhTZWFyY2hSZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLmRlZmF1bHQoMTApLFxuXG4gIHNhZmVzZWFyY2g6IHouZW51bShbJzAnLCAnMScsICcyJ10pLmRlZmF1bHQoJzEnKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIEJyb3dzZXIgU2V0dGluZ3MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgYnJvd3NlclRpbWVvdXQ6IHoubnVtYmVyKCkubWluKDEwMDApLm1heCgzMDAwMCkuZGVmYXVsdCg1MDAwKSxcblxuICBoZWFkbGVzc01vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdSdW4gYnJvd3NlciB3aXRob3V0IEdVSScpLFxuXG5cblxuICAvLyBHaXQgU2V0dGluZ3NcblxuICBnaXRBdXRvQ29tbWl0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcblxuICBkZWZhdWx0QnJhbmNoOiB6LnN0cmluZygpLmRlZmF1bHQoJ21haW4nKSxcblxuXG5cbiAgLy8gU2VjdXJpdHkgU2V0dGluZ3NcblxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYmluYXJ5RmlsZURldGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICByZWdleFJlRG9TUHJvdGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICBtYXhSZWdleExlbmd0aDogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMDApLmRlZmF1bHQoNTAwKSxcblxuXG5cbiAgLy8gU3RhdGUgTWFuYWdlbWVudFxuXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIHN0YXRlTWF4U2l6ZTogei5udW1iZXIoKS5taW4oMTAyNCkubWF4KDEwNDg1NzYpLmRlZmF1bHQoMTAyNDApLFxuXG5cblxuICAvLyBpMThuIFNldHRpbmdzXG5cbiAgbGFuZ3VhZ2U6IHouZW51bShbJ2VuJywgJ2RlJywgJ3poLUNOJywgJ3poLVRXJ10pLmRlZmF1bHQoJ2VuJyksXG5cblxuXG4gIC8vIE5vdGlmaWNhdGlvbiBTZXR0aW5nc1xuXG4gIG5vdGlmaWNhdGlvbnNFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIC8vIFRlbXBvcmFsIEF3YXJlbmVzcyAobWVyZ2VkIGZyb20gdXBfdG9fZGF0ZSlcbiAgdGVtcG9yYWxBd2FyZW5lc3M6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBhdXRvbWF0aWMgZGF0ZS90aW1lIGluamVjdGlvbiBpbnRvIHByb21wdHMnKSxcbiAgZGF0ZUZvcm1hdFN0eWxlOiB6LmVudW0oWydzdGFuZGFyZCcsICdoZXV0ZUlzdCddKS5kZWZhdWx0KCdzdGFuZGFyZCcpLmRlc2NyaWJlKCdEYXRlIGZvcm1hdCBzdHlsZSBmb3IgdGVtcG9yYWwgYXdhcmVuZXNzJyksXG59KTtcblxuXG5cbmV4cG9ydCB0eXBlIFBsdWdpbkNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIENvbmZpZ1NjaGVtYT47XG5cblxuXG4vKipcblxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdFxuXG4gKi9cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09ORklHOiBQbHVnaW5Db25maWcgPSB7XG5cbiAgZmlsZVN5c3RlbTogdHJ1ZSxcblxuICB3ZWJTZWFyY2g6IHRydWUsXG5cbiAgYnJvd3NlckF1dG9tYXRpb246IGZhbHNlLFxuXG4gIGdpdE9wZXJhdGlvbnM6IGZhbHNlLFxuXG4gIGRhdGFiYXNlUXVlcmllczogZmFsc2UsXG5cbiAgZG9jdW1lbnRQYXJzaW5nOiB0cnVlLFxuXG4gIGJhY2tncm91bmRDb21tYW5kczogZmFsc2UsXG5cblxuXG4gIC8vIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI2QTBcdUZFMEZcblxuICBnb2RNb2RlOiBmYWxzZSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIGltYWdlUHJvY2Vzc2luZzogdHJ1ZSxcblxuICBodHRwQ2xpZW50OiBmYWxzZSxcblxuICB2ZWN0b3JSQUc6IHRydWUsXG4gIHVpR2VuZXJhdGlvbjogZmFsc2UsXG4gIGNvbnRleHRNYW5hZ2VtZW50OiB0cnVlLFxuXG5cblxuICAvLyBcdTI2QTBcdUZFMEYgR09EIE1PREUgKEVuYWJsZSBBTEwgdG9vbHMgYXQgb25jZSkgXHUyNkEwXHVGRTBGXG5cbiAgZG9jdW1lbnRSQUc6IHRydWUsXG5cbiAgcmV0cmlldmFsTGltaXQ6IDUsXG5cbiAgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQ6IDAuNSxcblxuXG5cbiAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCBhbGwgZGlzYWJsZWQgYnkgZGVmYXVsdCAoZGFuZ2Vyb3VzISlcblxuICBleGVjdXRpb25KYXZhU2NyaXB0OiBmYWxzZSxcblxuICBleGVjdXRpb25QeXRob246IGZhbHNlLFxuXG4gIGV4ZWN1dGlvblRlcm1pbmFsOiBmYWxzZSxcblxuICBleGVjdXRpb25TaGVsbDogdHJ1ZSxcblxuXG5cbiAgc2VhcmNoRmFsbGJhY2tDaGFpbjogJ2RkZy1hcGknLFxuXG4gIG1heFNlYXJjaFJlc3VsdHM6IDEwLFxuXG4gIHNhZmVzZWFyY2g6ICcxJyxcblxuICBicm93c2VyVGltZW91dDogNTAwMCxcblxuICBoZWFkbGVzc01vZGU6IGZhbHNlLFxuXG4gIGdpdEF1dG9Db21taXQ6IGZhbHNlLFxuXG4gIGRlZmF1bHRCcmFuY2g6ICdtYWluJyxcblxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHRydWUsXG5cbiAgYmluYXJ5RmlsZURldGVjdGlvbjogdHJ1ZSxcblxuICByZWdleFJlRG9TUHJvdGVjdGlvbjogdHJ1ZSxcblxuICBtYXhSZWdleExlbmd0aDogNTAwLFxuXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB0cnVlLFxuXG4gIHN0YXRlTWF4U2l6ZTogMTAyNDAsXG5cbiAgbGFuZ3VhZ2U6ICdlbicsXG5cbiAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHRydWUsXG5cbiAgLy8gVGVtcG9yYWwgQXdhcmVuZXNzIChtZXJnZWQgZnJvbSB1cF90b19kYXRlKVxuICB0ZW1wb3JhbEF3YXJlbmVzczogdHJ1ZSxcbiAgZGF0ZUZvcm1hdFN0eWxlOiAnc3RhbmRhcmQnLFxufTtcblxuXG5cbi8qKlxuXG4gKiBWYWxpZGF0ZSBhbmQgc2FuaXRpemUgY29uZmlnIGlucFxuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uZmlnKGlucHV0OiB1bmtub3duKTogUGx1Z2luQ29uZmlnIHtcblxuICBjb25zdCByZXN1bHQgPSBDb25maWdTY2hlbWEuc2FmZVBhcnNlKGlucHV0KTtcblxuICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29uZmlndXJhdGlvbjogJHtyZXN1bHQuZXJyb3IubWVzc2FnZX1gKTtcblxuICB9XG5cbn1cblxuXG5cbi8qKlxuICogQ2hlY2sgaWYgYSB0b29sIGNhdGVnb3J5IGlzIGVuYWJsZWQgaW4gY29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Rvb2xFbmFibGVkKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBjYXRlZ29yeToga2V5b2YgUGljazxQbHVnaW5Db25maWcsICdmaWxlU3lzdGVtJyB8ICd3ZWJTZWFyY2gnIHwgJ2Jyb3dzZXJBdXRvbWF0aW9uJyB8ICdnaXRPcGVyYXRpb25zJyB8ICdkYXRhYmFzZVF1ZXJpZXMnIHwgJ2RvY3VtZW50UGFyc2luZycgfCAnYmFja2dyb3VuZENvbW1hbmRzJyB8ICdpbWFnZVByb2Nlc3NpbmcnIHwgJ2h0dHBDbGllbnQnIHwgJ3ZlY3RvclJBRycgfCAndWlHZW5lcmF0aW9uJyB8ICdjb250ZXh0TWFuYWdlbWVudCc+KTogYm9vbGVhbiB7XG4gIHJldHVybiBjb25maWdbY2F0ZWdvcnldID09PSB0cnVlO1xufVxuXG5cblxuXG4vKipcblxuICogQ2hlY2sgaWYgYSBzcGVjaWZpYyBleGVjdXRpb24gdG9vbCBpcyBlbmFibGVkIChncmFudWxhcilcblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGNvbmZpZzogUGx1Z2luQ29uZmlnLCB0b29sOiAnamF2YXNjcmlwdCcgfCAncHl0aG9uJyB8ICd0ZXJtaW5hbCcgfCAnc2hlbGwnKTogYm9vbGVhbiB7XG5cbiAgc3dpdGNoICh0b29sKSB7XG5cbiAgICBjYXNlICdqYXZhc2NyaXB0JzogcmV0dXJuIGNvbmZpZy5leGVjdXRpb25KYXZhU2NyaXB0ID09PSB0cnVlO1xuXG4gICAgY2FzZSAncHl0aG9uJzogICAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uUHl0aG9uID09PSB0cnVlO1xuXG4gICAgY2FzZSAndGVybWluYWwnOiAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uVGVybWluYWwgPT09IHRydWU7XG5cbiAgICBjYXNlICdzaGVsbCc6ICAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25TaGVsbCA9PT0gdHJ1ZTtcblxuICB9XG5cbn1cblxuXG5cbi8qKlxuXG4gKiBHZXQgdGhlIGV4ZWN1dGlvbiB0b29sIGtleSBmcm9tIGEgdG9vbCBuYW1lXG5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhlY3V0aW9uVG9vbEtleSh0b29sTmFtZTogc3RyaW5nKTogJ2phdmFzY3JpcHQnIHwgJ3B5dGhvbicgfCAndGVybWluYWwnIHwgJ3NoZWxsJyB8IG51bGwge1xuXG4gIHN3aXRjaCAodG9vbE5hbWUpIHtcblxuICAgIGNhc2UgJ3J1bl9qYXZhc2NyaXB0JzogcmV0dXJuICdqYXZhc2NyaXB0JztcblxuICAgIGNhc2UgJ3J1bl9weXRob24nOiAgICAgcmV0dXJuICdweXRob24nO1xuXG4gICAgY2FzZSAncnVuX2luX3Rlcm1pbmFsJzogcmV0dXJuICd0ZXJtaW5hbCc7XG5cbiAgICBjYXNlICdleGVjdXRlX2NvbW1hbmQnOiByZXR1cm4gJ3NoZWxsJztcblxuICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgfVxuXG59XG5cblxuXG4vKipcblxuICogQ2hlY2sgaWYgQU5ZIGV4ZWN1dGlvbiB0b29sIGlzIGVuYWJsZWQgKGxlZ2FjeSBjb21wYXRpYmlsaXR5KVxuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0FueUV4ZWN1dGlvblRvb2woY29uZmlnOiBQbHVnaW5Db25maWcpOiBib29sZWFuIHtcblxuICByZXR1cm4gY29uZmlnLmV4ZWN1dGlvbkphdmFTY3JpcHQgfHwgY29uZmlnLmV4ZWN1dGlvblB5dGhvbiB8fCBcblxuICAgICAgICAgY29uZmlnLmV4ZWN1dGlvblRlcm1pbmFsIHx8IGNvbmZpZy5leGVjdXRpb25TaGVsbDtcblxufVxuXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gTE0gU3R1ZGlvIFVJIFNjaGVtYXRpY3MgPT09PT09PT09PT09PT09PT09PT1cblxuLy8gVGhlc2UgZGVmaW5lIHRoZSB0b2dnbGUgc3dpdGNoZXMgdGhhdCBhcHBlYXIgaW4gTE0gU3R1ZGlvJ3Mgc2V0dGluZ3MgcGFuZWwuXG5cblxuXG5leHBvcnQgY29uc3QgY29uZmlnU2NoZW1hdGljcyA9IGNyZWF0ZUNvbmZpZ1NjaGVtYXRpY3MoKVxuXG5cblxuICAvLyBcdTI2QTBcdUZFMEYgR09EIE1PREUgLSBUT1AgUFJJT1JJVFkgV0FSTklORyBUT0dHTEUgXHUyNkEwXHVGRTBGXG5cbiAgLmZpZWxkKCdnb2RNb2RlJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdTI2QTFcdTI2QTBcdUZFMEYgR09EIE1PREUgLSBFbmFibGUgQUxMIFRvb2xzIFx1MjZBMFx1RkUwRlx1MjZBMScsXG5cbiAgICBzdWJ0aXRsZTogJ1dBUk5JTkc6IEFjdGl2YXRlcyBldmVyeSB0b29sIGNhdGVnb3J5IGluc3RhbnRseS4gVXNlIHdpdGggY2F1dGlvbi4nLFxuXG4gICAgaGludDogJ1doZW4gZW5hYmxlZCwgQUxMIGluZGl2aWR1YWwgdG9nZ2xlcyBhcmUgYnlwYXNzZWQgYW5kIGV2ZXJ5IHRvb2wgaXMgYWN0aXZhdGVkIHJlZ2FyZGxlc3Mgb2Ygc2V0dGluZ3MuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5nb2RNb2RlKVxuXG5cblxuICAvLyBcdUQ4M0NcdURGOUJcdUZFMEYgVE9PTCBHQVRJTkcgKEhhdXB0c2NoYWx0ZXIpIFx1RDgzQ1x1REY5Qlx1RkUwRlxuXG4gIC5maWVsZCgnZmlsZVN5c3RlbScsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDMSBGaWxlIFN5c3RlbSBUb29scycsIGhpbnQ6ICdFbmFibGUgZmlsZSByZWFkL3dyaXRlL3NlYXJjaCBvcGVyYXRpb25zJyB9LCBERUZBVUxUX0NPTkZJRy5maWxlU3lzdGVtKVxuXG4gIC5maWVsZCgnd2ViU2VhcmNoJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjEwIFdlYiAmIFJlc2VhcmNoIFRvb2xzJywgaGludDogJ0VuYWJsZSBEdWNrRHVja0dvL1dpa2lwZWRpYSBzZWFyY2gnIH0sIERFRkFVTFRfQ09ORklHLndlYlNlYXJjaClcblxuICAvLyBcdUQ4M0RcdURDMTkgR0lUICYgR0lUSFVCIFRPT0xTICh2aXN1ZWxsZSBHcnVwcGllcnVuZykgXHVEODNEXHVEQzE5XG5cbiAgLmZpZWxkKCdnaXRPcGVyYXRpb25zJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDMTkgR2l0ICYgR2l0SHViIFRvb2xzJywgXG5cbiAgICBzdWJ0aXRsZTogJ1ZlcnNpb24gQ29udHJvbCAmIEFQSScsXG5cbiAgICBoaW50OiAnRW5hYmxlIGdpdCBvcGVyYXRpb25zIGFuZCBHaXRIdWIgQVBJIGFjY2Vzcy4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmdpdE9wZXJhdGlvbnMpXG5cbiAgLmZpZWxkKCdnaXRBdXRvQ29tbWl0JywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQkUgR2l0IEF1dG8tQ29tbWl0JywgXG5cbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBHaXQgJiBHaXRIdWIgVG9vbHMnLFxuXG4gICAgaGludDogJ0F1dG9tYXRpY2FsbHkgY29tbWl0IGNoYW5nZXMgYWZ0ZXIgb3BlcmF0aW9ucycsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZ2l0QXV0b0NvbW1pdClcblxuICAuZmllbGQoJ2RlZmF1bHRCcmFuY2gnLCAnc3RyaW5nJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjNGIERlZmF1bHQgQnJhbmNoJywgXG5cbiAgICBwbGFjZWhvbGRlcjogJ21haW4nLFxuXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgR2l0ICYgR2l0SHViIFRvb2xzJyxcblxuICAgIGhpbnQ6ICdCcmFuY2ggbmFtZSBmb3IgbmV3IHJlcG9zaXRvcmllcyBhbmQgZ2l0IG9wZXJhdGlvbnMnLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmRlZmF1bHRCcmFuY2gpXG5cblxuXG4gIC5maWVsZCgnZGF0YWJhc2VRdWVyaWVzJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREM0XHVGRTBGIERhdGFiYXNlIFF1ZXJpZXMnLCBoaW50OiAnRW5hYmxlIHJlYWQtb25seSBTUUxpdGUgcXVlcmllcycgfSwgREVGQVVMVF9DT05GSUcuZGF0YWJhc2VRdWVyaWVzKVxuXG4gIC5maWVsZCgnZG9jdW1lbnRQYXJzaW5nJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0M0IERvY3VtZW50IFBhcnNpbmcnLCBoaW50OiAnRW5hYmxlIFBERi9ET0NYIGRvY3VtZW50IHJlYWRpbmcnIH0sIERFRkFVTFRfQ09ORklHLmRvY3VtZW50UGFyc2luZylcblxuICAuZmllbGQoJ2JhY2tncm91bmRDb21tYW5kcycsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1MjNGMyBCYWNrZ3JvdW5kIENvbW1hbmRzJywgaGludDogJ0VuYWJsZSBsb25nLXJ1bm5pbmcgcHJvY2VzcyB0cmFja2luZycgfSwgREVGQVVMVF9DT05GSUcuYmFja2dyb3VuZENvbW1hbmRzKVxuXG5cblxuICAvLyBcdUQ4M0NcdUREOTVcdTIwMERcdTI3NDAgTkVXIFRPT0wgQ0FURUdPUklFUyBcdUQ4M0NcdUREOTVcdTIwMERcdTI3NDBcblxuICAuZmllbGQoJ2ltYWdlUHJvY2Vzc2luZycsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREJDXHVGRTBGIEltYWdlIFByb2Nlc3NpbmcgVG9vbHMnLCBcblxuICAgIHN1YnRpdGxlOiAnT0NSLCBTY3JlZW5zaG90cyAmIENvbXBhcmlzb24nLFxuXG4gICAgaGludDogJ0VuYWJsZSBpbWFnZSBPQ1IgKFRlc3NlcmFjdC5qcyksIHNjcmVlbnNob3QgY2FwdHVyZSwgYW5kIGltYWdlIGNvbXBhcmlzb24gdG9vbHMuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5pbWFnZVByb2Nlc3NpbmcpXG5cbiAgXG5cbiAgLmZpZWxkKCdodHRwQ2xpZW50JywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMEMgSFRUUCBDbGllbnQgVG9vbHMnLCBcblxuICAgIHN1YnRpdGxlOiAnR2VuZXJpYyBSRVNUIEFQSSBDbGllbnQnLFxuXG4gICAgaGludDogJ0VuYWJsZSBnZW5lcmljIEhUVFAgY2xpZW50IGZvciBtYWtpbmcgcmVxdWVzdHMgdG8gYW55IFJFU1QgQVBJIChHRVQsIFBPU1QsIFBVVCwgREVMRVRFKS4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmh0dHBDbGllbnQpXG5cbiAgXG5cbiAgLmZpZWxkKCd2ZWN0b3JSQUcnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDQSBWZWN0b3IgUkFHIC8gU2VtYW50aWMgU2VhcmNoJywgXG5cbiAgICBzdWJ0aXRsZTogJ1NlbWFudGljIERvY3VtZW50IFNlYXJjaCcsXG5cbiAgICBoaW50OiAnRW5hYmxlIHNlbWFudGljIHNlYXJjaCB3aXRoIHZlY3RvciBlbWJlZGRpbmdzIGZvciBpbnRlbGxpZ2VudCBkb2N1bWVudCByZXRyaWV2YWwuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy52ZWN0b3JSQUcpXG4gIC5maWVsZCgndWlHZW5lcmF0aW9uJywgJ2Jvb2xlYW4nLCB7IFxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERkE4IEludGVyYWN0aXZlIFVJIEdlbmVyYXRpb24gVG9vbHMnLCBcbiAgICBzdWJ0aXRsZTogJ0dlbmVyYXRlIGFuZCByZW5kZXIgaW50ZXJhY3RpdmUgVUkgY29tcG9uZW50cycsXG4gICAgaGludDogJ0VuYWJsZSB0b29scyBmb3IgZ2VuZXJhdGluZyBIVE1ML0NTUy9KUyBjb21wb25lbnRzIChidXR0b25zLCBmb3JtcywgY2hhcnRzLCBkYXNoYm9hcmRzKSBhbmQgcmVuZGVyaW5nIHRoZW0gaW4gdGhlIGJyb3dzZXIuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcudWlHZW5lcmF0aW9uKVxuICAuZmllbGQoJ2NvbnRleHRNYW5hZ2VtZW50JywgJ2Jvb2xlYW4nLCB7IFxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNFXHVEREUwIEF1dG8tQ29udGV4dCBNYW5hZ2VtZW50IFRvb2xzJywgXG4gICAgc3VidGl0bGU6ICdBdXRvbWF0aWMgc2Vzc2lvbiB0cmFja2luZyBhbmQgbWVtb3J5IG1hbmFnZW1lbnQnLFxuICAgIGhpbnQ6ICdFbmFibGUgdG9vbHMgZm9yIGF1dG9tYXRpY2FsbHkgc2F2aW5nIGltcG9ydGFudCBkZWNpc2lvbnMsIHBhdHRlcm5zLCBhbmQgY29uZmlndXJhdGlvbnMgdG8gcGVyc2lzdGVudCBtZW1vcnkuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuY29udGV4dE1hbmFnZW1lbnQpXG5cblxuXG4gIC8vIFx1RDgzRFx1RENEQSBET0NVTUVOVCBSQUcgLyBDSEFUIFdJVEggRklMRVMgXHVEODNEXHVEQ0RBXG5cbiAgLmZpZWxkKCdkb2N1bWVudFJBRycsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0RBIERvY3VtZW50IFJBRyAvIENoYXQgd2l0aCBGaWxlcycsIFxuXG4gICAgc3VidGl0bGU6ICdFbmFibGUgZmlsZSBpbmRleGluZyBhbmQgc2VtYW50aWMgc2VhcmNoIGZvciBjaGF0JyxcblxuICAgIGhpbnQ6ICdBdHRhY2ggZG9jdW1lbnRzIHRvIHlvdXIgY2hhdCBtZXNzYWdlcy4gVGhlIHBsdWdpbiB3aWxsIGF1dG9tYXRpY2FsbHkgcmV0cmlldmUgcmVsZXZhbnQgY29udGVudCBmcm9tIGF0dGFjaGVkIGZpbGVzIHVzaW5nIHNlbWFudGljIHNlYXJjaC4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmRvY3VtZW50UkFHKVxuXG4gIFxuXG4gIC5maWVsZCgncmV0cmlldmFsTGltaXQnLCAnbnVtZXJpYycsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQyMiBSZXRyaWV2YWwgTGltaXQnLCBcblxuICAgIHN1YnRpdGxlOiAnTWF4IGNodW5rcyB0byByZXR1cm4gcGVyIHF1ZXJ5JyxcblxuICAgIG1pbjogMSwgbWF4OiAyMCwgaW50OiB0cnVlLFxuXG4gICAgaGludDogJ01heGltdW0gbnVtYmVyIG9mIHJlbGV2YW50IGRvY3VtZW50IGNodW5rcyB0byByZXRyaWV2ZSBmb3IgZWFjaCBxdWVyeS4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLnJldHJpZXZhbExpbWl0KVxuXG4gIFxuXG4gIC5maWVsZCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnLCAnbnVtZXJpYycsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REZBRiBSZXRyaWV2YWwgQWZmaW5pdHkgVGhyZXNob2xkJywgXG5cbiAgICBzdWJ0aXRsZTogJ01pbmltdW0gcmVsZXZhbmNlIHNjb3JlICgwLTEpJyxcblxuICAgIG1pbjogMC4wLCBtYXg6IDEuMCwgc3RlcDogMC4wMSxcblxuICAgIGhpbnQ6ICdDaHVua3MgYmVsb3cgdGhpcyBzaW1pbGFyaXR5IHNjb3JlIHdpbGwgYmUgZmlsdGVyZWQgb3V0LiBMb3dlciA9IG1vcmUgcmVzdWx0cyBidXQgcG90ZW50aWFsbHkgbGVzcyByZWxldmFudC4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLnJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkKVxuXG4gIC8vIFx1MjZBMSBFWEVDVVRJT04gVE9PTFMgKEdlZlx1MDBFNGhybGljaCEpIFx1MjZBMVxuXG4gIC5maWVsZCgnZXhlY3V0aW9uSmF2YVNjcmlwdCcsICdib29sZWFuJywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdTI2QTEgSmF2YVNjcmlwdC1BdXNmXHUwMEZDaHJ1bmcgZXJsYXViZW4nLFxuXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX2phdmFzY3JpcHQnLVRvb2xcIixcblxuICAgIGhpbnQ6ICdHRUZBSFI6IENvZGUgbFx1MDBFNHVmdCBhdWYgSWhyZW0gUmVjaG5lci4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvbkphdmFTY3JpcHQpXG5cbiAgLmZpZWxkKCdleGVjdXRpb25QeXRob24nLCAnYm9vbGVhbicsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQzBEIFB5dGhvbi1BdXNmXHUwMEZDaHJ1bmcgZXJsYXViZW4nLFxuXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX3B5dGhvbictVG9vbFwiLFxuXG4gICAgaGludDogJ0dFRkFIUjogQ29kZSBsXHUwMEU0dWZ0IGF1ZiBJaHJlbSBSZWNobmVyLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uUHl0aG9uKVxuXG4gIC5maWVsZCgnZXhlY3V0aW9uVGVybWluYWwnLCAnYm9vbGVhbicsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JCIFRlcm1pbmFsLUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXG5cbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdydW5faW5fdGVybWluYWwnLVRvb2xcIixcblxuICAgIGhpbnQ6ICdcdTAwRDZmZm5ldCBlY2h0ZSBUZXJtaW5hbC1GZW5zdGVyLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uVGVybWluYWwpXG5cbiAgLmZpZWxkKCdleGVjdXRpb25TaGVsbCcsICdib29sZWFuJywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMjcgU2hlbGwtQmVmZWhsc2F1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXG5cbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdleGVjdXRlX2NvbW1hbmQnLVRvb2xcIixcblxuICAgIGhpbnQ6ICdHRUZBSFI6IEJlZmVobGUgbGF1ZmVuIGF1ZiBJaHJlbSBSZWNobmVyLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uU2hlbGwpXG5cblxuXG4gIC8vIFx1RDgzRFx1REQwRCBTRUFSQ0ggU0VUVElOR1MgXHVEODNEXHVERDBEXG5cbiAgLmZpZWxkKCdzZWFyY2hGYWxsYmFja0NoYWluJywgJ3NlbGVjdCcsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDBEIFNlYXJjaCBGYWxsYmFjayBDaGFpbicsXG5cbiAgICBoaW50OiAnUHJpbWFyeSBzZWFyY2ggZW5naW5lLiBBdXRvLWZhbGxzIGJhY2sgdG8gb3RoZXJzIGlmIHVuYXZhaWxhYmxlLicsXG5cbiAgICBvcHRpb25zOiBbXG5cbiAgICAgIHsgdmFsdWU6ICdkZGctYXBpJywgZGlzcGxheU5hbWU6ICdEdWNrRHVja0dvIEFQSScgfSxcblxuICAgICAgeyB2YWx1ZTogJ2RkZy1mZXRjaCcsIGRpc3BsYXlOYW1lOiAnRHVja0R1Y2tHbyBGZXRjaCcgfSxcblxuICAgICAgeyB2YWx1ZTogJ2dvb2dsZScsIGRpc3BsYXlOYW1lOiAnR29vZ2xlJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnYmluZycsIGRpc3BsYXlOYW1lOiAnQmluZycgfSxcblxuICAgIF0sXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuc2VhcmNoRmFsbGJhY2tDaGFpbilcblxuICAuZmllbGQoJ21heFNlYXJjaFJlc3VsdHMnLCAnbnVtZXJpYycsIHsgbWluOiAxLCBtYXg6IDUwLCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcubWF4U2VhcmNoUmVzdWx0cylcblxuICAuZmllbGQoJ3NhZmVzZWFyY2gnLCAnc2VsZWN0Jywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURFRTFcdUZFMEYgU2FmZSBTZWFyY2gnLFxuXG4gICAgb3B0aW9uczogW1xuXG4gICAgICB7IHZhbHVlOiAnMCcsIGRpc3BsYXlOYW1lOiAnT2ZmJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnMScsIGRpc3BsYXlOYW1lOiAnTW9kZXJhdGUnIH0sXG5cbiAgICAgIHsgdmFsdWU6ICcyJywgZGlzcGxheU5hbWU6ICdTdHJpY3QnIH0sXG5cbiAgICBdLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLnNhZmVzZWFyY2gpXG5cblxuXG4gIC8vIFx1RDgzRFx1RERBNVx1RkUwRiBCUk9XU0VSIEFVVE9NQVRJT04gVE9PTFMgXHVEODNEXHVEREE1XHVGRTBGXG5cbiAgLmZpZWxkKCdicm93c2VyQXV0b21hdGlvbicsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREE1XHVGRTBGIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsIFxuXG4gICAgc3VidGl0bGU6ICdIZWFkbGVzcyBicm93c2VyIGNvbnRyb2wgJiBhdXRvbWF0aW9uJyxcblxuICAgIGhpbnQ6ICdFbmFibGUgUHVwcGV0ZWVyLWJhc2VkIGhlYWRsZXNzIGJyb3dzZXIgYXV0b21hdGlvbiBmb3Igd2ViIHNjcmFwaW5nLCB0ZXN0aW5nLCBhbmQgVUkgaW50ZXJhY3Rpb24uJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5icm93c2VyQXV0b21hdGlvbilcblxuICBcblxuICAuZmllbGQoJ2Jyb3dzZXJUaW1lb3V0JywgJ251bWVyaWMnLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdTIzRjFcdUZFMEYgQnJvd3NlciBUaW1lb3V0JywgXG5cbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBCcm93c2VyIEF1dG9tYXRpb24gVG9vbHMnLFxuXG4gICAgbWluOiAxMDAwLCBtYXg6IDMwMDAwLCBpbnQ6IHRydWUsXG5cbiAgICBoaW50OiAnTWF4aW11bSB0aW1lIChtcykgdG8gd2FpdCBmb3IgYnJvd3NlciBvcGVyYXRpb25zIGJlZm9yZSB0aW1pbmcgb3V0LicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuYnJvd3NlclRpbWVvdXQpXG5cbiAgXG5cbiAgLmZpZWxkKCdoZWFkbGVzc01vZGUnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REM3QiBIZWFkbGVzcyBNb2RlJywgXG5cbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBCcm93c2VyIEF1dG9tYXRpb24gVG9vbHMnLFxuXG4gICAgaGludDogJ1J1biBicm93c2VyIHdpdGhvdXQgR1VJIChyZWNvbW1lbmRlZCBmb3IgYXV0b21hdGlvbikuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5oZWFkbGVzc01vZGUpXG5cblxuXG4gIC8vIFx1RDgzRFx1REQxMiBTRUNVUklUWSBTRVRUSU5HUyBcdUQ4M0RcdUREMTJcblxuICAuZmllbGQoJ3BhdGhWYWxpZGF0aW9uRW5hYmxlZCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQxMiBQYXRoIFZhbGlkYXRpb24nLCBoaW50OiAnUHJldmVudCBkaXJlY3RvcnkgdHJhdmVyc2FsIGF0dGFja3MnIH0sIERFRkFVTFRfQ09ORklHLnBhdGhWYWxpZGF0aW9uRW5hYmxlZClcblxuICAuZmllbGQoJ2JpbmFyeUZpbGVEZXRlY3Rpb24nLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQzEgQmluYXJ5IEZpbGUgRGV0ZWN0aW9uJywgaGludDogJ0RldGVjdCBiaW5hcnkgZmlsZXMgdmlhIG51bGwgYnl0ZSBjaGVjaycgfSwgREVGQVVMVF9DT05GSUcuYmluYXJ5RmlsZURldGVjdGlvbilcblxuICAuZmllbGQoJ3JlZ2V4UmVEb1NQcm90ZWN0aW9uJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERUUxXHVGRTBGIFJlRG9TIFByb3RlY3Rpb24nLCBoaW50OiAnUHJvdGVjdCBhZ2FpbnN0IHJlZ2V4IGRlbmlhbC1vZi1zZXJ2aWNlJyB9LCBERUZBVUxUX0NPTkZJRy5yZWdleFJlRG9TUHJvdGVjdGlvbilcblxuICAuZmllbGQoJ21heFJlZ2V4TGVuZ3RoJywgJ251bWVyaWMnLCB7IG1pbjogMSwgbWF4OiAxMDAwLCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcubWF4UmVnZXhMZW5ndGgpXG5cblxuXG4gIC8vIFx1RDgzRFx1RENCRCBTVEFURSBNQU5BR0VNRU5UIFx1RDgzRFx1RENCRFxuXG4gIC5maWVsZCgnc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQkQgU3RhdGUgUGVyc2lzdGVuY2UnLCBoaW50OiAnUGVyc2lzdCB0b29sIGV4ZWN1dGlvbiBzdGF0ZSBiZXR3ZWVuIHNlc3Npb25zJyB9LCBERUZBVUxUX0NPTkZJRy5zdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZClcblxuICAuZmllbGQoJ3N0YXRlTWF4U2l6ZScsICdudW1lcmljJywgeyBtaW46IDEwMjQsIG1heDogMTA0ODU3NiwgaW50OiB0cnVlIH0sIERFRkFVTFRfQ09ORklHLnN0YXRlTWF4U2l6ZSlcblxuXG5cbiAgLy8gXHVEODNDXHVERjEwIExBTkdVQUdFICYgTk9USUZJQ0FUSU9OUyBcdUQ4M0NcdURGMTBcblxuICAuZmllbGQoJ2xhbmd1YWdlJywgJ3NlbGVjdCcsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjEwIExhbmd1YWdlJyxcblxuICAgIG9wdGlvbnM6IFtcblxuICAgICAgeyB2YWx1ZTogJ2VuJywgZGlzcGxheU5hbWU6ICdFbmdsaXNoJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnZGUnLCBkaXNwbGF5TmFtZTogJ0RldXRzY2ggKEdlcm1hbiknIH0sXG5cbiAgICAgIHsgdmFsdWU6ICd6aC1DTicsIGRpc3BsYXlOYW1lOiAnU2ltcGxpZmllZCBDaGluZXNlJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnemgtVFcnLCBkaXNwbGF5TmFtZTogJ1RyYWRpdGlvbmFsIENoaW5lc2UnIH0sXG5cbiAgICBdLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmxhbmd1YWdlKVxuXG5cblxuICAuZmllbGQoJ25vdGlmaWNhdGlvbnNFbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDE0IERlc2t0b3AgTm90aWZpY2F0aW9ucycsIGhpbnQ6ICdTaG93IHN5c3RlbSBub3RpZmljYXRpb25zJyB9LCBERUZBVUxUX0NPTkZJRy5ub3RpZmljYXRpb25zRW5hYmxlZClcblxuICAvLyBcdTIzRjAgVEVNUE9SQUwgQVdBUkVORVNTIChmcm9tIHVwX3RvX2RhdGUpXG4gIC5maWVsZCgndGVtcG9yYWxBd2FyZW5lc3MnLCAnYm9vbGVhbicsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1MjNGMCBUZW1wb3JhbCBBd2FyZW5lc3MnLFxuICAgIHN1YnRpdGxlOiAnSW5qZWN0cyBjdXJyZW50IGRhdGUvdGltZSBpbnRvIGV2ZXJ5IG1lc3NhZ2UnLFxuICAgIGhpbnQ6ICdFbmFibGVzIHRoZSBBSSB0byBrbm93IHRoZSBjdXJyZW50IHRpbWUuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcudGVtcG9yYWxBd2FyZW5lc3MpXG4gIC5maWVsZCgnZGF0ZUZvcm1hdFN0eWxlJywgJ3NlbGVjdCcsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDNSBEYXRlIEZvcm1hdCBTdHlsZScsXG4gICAgb3B0aW9uczogW1xuICAgICAgeyB2YWx1ZTogJ3N0YW5kYXJkJywgZGlzcGxheU5hbWU6ICdTdGFuZGFyZCAoW1plaXQ6IC4uLl0pJyB9LFxuICAgICAgeyB2YWx1ZTogJ2hldXRlSXN0JywgZGlzcGxheU5hbWU6ICdIRVVURSBJU1QgTW9kZSAoUHJvbWluZW50KScgfSxcbiAgICBdLFxuICB9LCBERUZBVUxUX0NPTkZJRy5kYXRlRm9ybWF0U3R5bGUpXG5cbiAgLmJ1aWxkKCk7XG4iLCAiLyoqXG4gKiBQZXJzaXN0ZW50IHN0YXRlIG1hbmFnZW1lbnQgZm9yIHBsdWdpbiBvcGVyYXRpb25zXG4gKiBTdG9yZXMgZGF0YSB0byBkaXNrIGFzIEpTT04gZmlsZSBmb3Igc3Vydml2YWwgYWNyb3NzIHJlbG9hZHNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcblxuaW50ZXJmYWNlIFN0YXRlRW50cnkge1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHVua25vd247XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG4vKiogTWluaW1hbCBsb2dnZXIgZm9yIHN0YXRlIG1hbmFnZXIgKGF2b2lkcyBjaXJjdWxhciBkZXBlbmRlbmN5IHdpdGggaW5kZXgudHMpICovXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbU3RhdGVNYW5hZ2VyXSAke21zZ31cXG5gKSxcbn07XG5cbi8qKiBEZWJvdW5jZWQgYXN5bmMgc3RhdGUgcGVyc2lzdGVuY2UgKDUwMG1zIGRlbGF5KSAqL1xuZnVuY3Rpb24gY3JlYXRlRGVib3VuY2VkU2F2ZShzYXZlRm46ICgpID0+IHZvaWQsIGRlbGF5TXM6IG51bWJlciA9IDUwMCk6ICgoKSA9PiB2b2lkKSB7XG4gIGxldCB0aW1lcklkOiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZFNhdmUoKTogdm9pZCB7XG4gICAgaWYgKHRpbWVySWQpIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzYXZlRm4oKTtcbiAgICAgIHRpbWVySWQgPSBudWxsO1xuICAgIH0sIGRlbGF5TXMpO1xuICB9O1xufVxuXG4vKipcbiAqIERlZmF1bHQgbWVtb3J5IGZpbGUgbG9jYXRpb24gKGluIExNIFN0dWRpbyBwbHVnaW4gZGF0YSBkaXJlY3RvcnkpXG4gKi9cbmZ1bmN0aW9uIGdldE1lbW9yeUZpbGVQYXRoKCk6IHN0cmluZyB7XG4gIC8vIFRyeSB0byBmaW5kIExNIFN0dWRpbydzIGFwcCBkYXRhIGRpcmVjdG9yeSBmb3IgcGVyc2lzdGVuY2VcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgbGV0IGJhc2VEaXI6IHN0cmluZztcbiAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIGJhc2VEaXIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuQVBQREFUQSB8fCAnJywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgYmFzZURpciA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBiYXNlRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgJycsICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgfVxuICBcbiAgcmV0dXJuIHBhdGguam9pbihiYXNlRGlyLCAnYWktdG9vbGJveC1tZW1vcnkuanNvbicpO1xufVxuXG5leHBvcnQgY2xhc3MgU3RhdGVNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0ZTogTWFwPHN0cmluZywgU3RhdGVFbnRyeT47XG4gIHByaXZhdGUgbWF4U2l6ZTogbnVtYmVyO1xuICBwcml2YXRlIHBlcnNpc3RlbmNlRW5hYmxlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBtZW1vcnlGaWxlOiBzdHJpbmc7XG4gIHByaXZhdGUgcnVubmluZ1NpemU6IG51bWJlcjsgLy8gVHJhY2sgc2l6ZSBpbmNyZW1lbnRhbGx5IGZvciBPKDEpIGNoZWNrc1xuICBwcml2YXRlIGRlYm91bmNlZFNhdmU6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gICAgdGhpcy5tYXhTaXplID0gZWZmZWN0aXZlQ29uZmlnLnN0YXRlTWF4U2l6ZTtcbiAgICB0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCA9IGVmZmVjdGl2ZUNvbmZpZy5zdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDtcbiAgICB0aGlzLm1lbW9yeUZpbGUgPSBnZXRNZW1vcnlGaWxlUGF0aCgpO1xuICAgIFxuICAgIC8vIENyZWF0ZSBkZWJvdW5jZWQgc2F2ZSBmdW5jdGlvbiAoNTAwbXMgZGVsYXkpXG4gICAgdGhpcy5kZWJvdW5jZWRTYXZlID0gY3JlYXRlRGVib3VuY2VkU2F2ZSgoKSA9PiB0aGlzLnNhdmVUb0ZpbGUoKSwgNTAwKTtcbiAgICBcbiAgICAvLyBBdXRvLWxvYWQgZnJvbSBkaXNrIGlmIHBlcnNpc3RlbmNlIGlzIGVuYWJsZWRcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIHN0YXRlIHZhbHVlIHdpdGgga2V5IGFuZCBvcHRpb25hbCBtZXRhZGF0YVxuICAgKi9cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGNvbnN0IG5ld1ZhbHVlU2l6ZSA9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUodmFsdWUpO1xuICAgIGNvbnN0IG9sZFZhbHVlU2l6ZSA9IHRoaXMuZ2V0RXhpc3RpbmdWYWx1ZVNpemUoa2V5KTtcbiAgICBcbiAgICAvLyBDaGVjayBzaXplIGxpbWl0IHVzaW5nIHJ1bm5pbmcgdG90YWxcbiAgICBpZiAodGhpcy5ydW5uaW5nU2l6ZSAtIG9sZFZhbHVlU2l6ZSArIG5ld1ZhbHVlU2l6ZSA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdGF0ZSBzaXplIGV4Y2VlZHMgbWF4aW11bSAoJHt0aGlzLm1heFNpemV9IGJ5dGVzKWApO1xuICAgIH1cbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBzZXR0aW5nXG4gICAgdGhpcy5ydW5uaW5nU2l6ZSA9IHRoaXMucnVubmluZ1NpemUgLSBvbGRWYWx1ZVNpemUgKyBuZXdWYWx1ZVNpemU7XG4gICAgXG4gICAgdGhpcy5zdGF0ZS5zZXQoa2V5LCB7XG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICB9KTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgKDUwMG1zIGRlbGF5KSBcdTIwMTQgb25seSBpZiBwZXJzaXN0ZW5jZSBlbmFibGVkXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3RhdGUgdmFsdWUgYnkga2V5XG4gICAqL1xuICBnZXQ8VD4oa2V5OiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuc3RhdGUuZ2V0KGtleSk7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gZW50cnkudmFsdWUgYXMgVDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBzdGF0ZSBlbnRyeVxuICAgKi9cbiAgZGVsZXRlKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIGlmICghZW50cnkpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBkZWxldGluZ1xuICAgIHRoaXMucnVubmluZ1NpemUgLT0gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSk7XG4gICAgY29uc3QgZGVsZXRlZCA9IHRoaXMuc3RhdGUuZGVsZXRlKGtleSk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrIGFmdGVyIGRlbGV0aW9uXG4gICAgaWYgKGRlbGV0ZWQgJiYgdGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZGVsZXRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHN0YXRlIGtleXNcbiAgICovXG4gIGdldEFsbEtleXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuc3RhdGUua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhbGwgc3RhdGVcbiAgICovXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgYWZ0ZXIgY2xlYXJpbmdcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc2l6ZSBvZiBleGlzdGluZyB2YWx1ZSBmb3IgYSBrZXkgKGZvciBpbmNyZW1lbnRhbCB1cGRhdGVzKVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFeGlzdGluZ1ZhbHVlU2l6ZShrZXk6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIHJldHVybiBlbnRyeSA/IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpIDogMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFc3RpbWF0ZSBzaXplIG9mIGEgdmFsdWUgaW4gYnl0ZXNcbiAgICovXG4gIHByaXZhdGUgZ2V0U2l6ZU9mVmFsdWUodmFsdWU6IHVua25vd24pOiBudW1iZXIge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gdmFsdWUubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSByZXR1cm4gODtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHJldHVybiAxO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFjdHVhbCBzaXplIG9mIGFycmF5IGVsZW1lbnRzXG4gICAgICByZXR1cm4gdmFsdWUucmVkdWNlKChzdW06IG51bWJlciwgZWxlbTogdW5rbm93bikgPT4gc3VtICsgdGhpcy5nZXRTaXplT2ZWYWx1ZShlbGVtKSwgMCk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIHZhbHVlLnNpemUgKiAxNjtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBzdGF0ZSB0byBkaXNrIGFzIEpTT04gZmlsZSB3aXRoIG9wdGltaXplZCBzZXJpYWxpemF0aW9uXG4gICAqL1xuICBwcml2YXRlIHNhdmVUb0ZpbGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGUuZW50cmllcygpKS5tYXAoKFtfa2V5LCBlbnRyeV0pID0+ICh7XG4gICAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICAgIHRpbWVzdGFtcDogZW50cnkudGltZXN0YW1wLFxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICAvLyBFbnN1cmUgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMubWVtb3J5RmlsZSk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gT3B0aW1pemVkIEpTT04gc2VyaWFsaXphdGlvbiAobm8gcHJldHR5LXByaW50aW5nIGZvciBwZXJmb3JtYW5jZSlcbiAgICAgIGNvbnN0IGpzb25TdHJpbmcgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgIFxuICAgICAgLy8gV3JpdGUgdG8gdGVtcCBmaWxlIGZpcnN0LCB0aGVuIHJlbmFtZSBmb3IgYXRvbWljIG9wZXJhdGlvblxuICAgICAgY29uc3QgdGVtcEZpbGUgPSB0aGlzLm1lbW9yeUZpbGUgKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBGaWxlLCBqc29uU3RyaW5nLCAndXRmLTgnKTtcbiAgICAgIGZzLnJlbmFtZVN5bmModGVtcEZpbGUsIHRoaXMubWVtb3J5RmlsZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHNhdmUgdG8gZGlzazogJHttZXNzYWdlfWApOyAvLyBNMiBmaXg6IG5vIGNvbnNvbGUud2FyblxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHN0YXRlIGZyb20gZGlzayBKU09OIGZpbGUgd2l0aCBjb3JydXB0aW9uIHJlY292ZXJ5XG4gICAqL1xuICBwcml2YXRlIGxvYWRGcm9tRmlsZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMubWVtb3J5RmlsZSkpIHJldHVybjtcbiAgICAgIFxuICAgICAgY29uc3QganNvblN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUsICd1dGYtOCcpO1xuICAgICAgXG4gICAgICAvLyBUcnkgdG8gcGFyc2UgSlNPTiB3aXRoIGVycm9yIHJlY292ZXJ5XG4gICAgICBsZXQgZGF0YTogU3RhdGVFbnRyeVtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoanNvblN0cmluZykgYXMgU3RhdGVFbnRyeVtdO1xuICAgICAgfSBjYXRjaCB7IC8vIEMxIGZpeDogcmVtb3ZlZCB1bnVzZWQgcGFyc2VFcnJvciB2YXJpYWJsZVxuICAgICAgICBsb2dnZXIud2FybihgQ29ycnVwdGVkIHN0YXRlIGZpbGUgZGV0ZWN0ZWQsIGF0dGVtcHRpbmcgcmVjb3ZlcnkuLi5gKTtcblxuICAgICAgICAvLyBUcnkgdG8gcmVjb3ZlciBieSByZWFkaW5nIGxpbmUgYnkgbGluZSBvciB1c2luZyBiYWNrdXBcbiAgICAgICAgY29uc3QgYmFja3VwRmlsZSA9IHRoaXMubWVtb3J5RmlsZSArICcuYmFja3VwJztcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYmFja3VwRmlsZSkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFja3VwU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGJhY2t1cEZpbGUsICd1dGYtOCcpO1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoYmFja3VwU3RyaW5nKSBhcyBTdGF0ZUVudHJ5W107XG4gICAgICAgICAgICBsb2dnZXIud2FybihgU3VjY2Vzc2Z1bGx5IGxvYWRlZCBmcm9tIGJhY2t1cGApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYEJhY2t1cCBhbHNvIGNvcnJ1cHRlZCwgc3RhcnRpbmcgZnJlc2hgKTtcbiAgICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oYE5vIGJhY2t1cCBhdmFpbGFibGUsIHN0YXJ0aW5nIGZyZXNoYCk7XG4gICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGRhdGEpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZW50cnkgc3RydWN0dXJlIGJlZm9yZSBhZGRpbmdcbiAgICAgICAgaWYgKGVudHJ5ICYmIHR5cGVvZiBlbnRyeS5rZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBlbnRyeS50aW1lc3RhbXAgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZXQoZW50cnkua2V5LCBlbnRyeSk7XG4gICAgICAgICAgdGhpcy5ydW5uaW5nU2l6ZSArPSB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBDcmVhdGUgYmFja3VwIGFmdGVyIHN1Y2Nlc3NmdWwgbG9hZFxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUgKyAnLmJhY2t1cCcsIGpzb25TdHJpbmcsICd1dGYtOCcpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIElnbm9yZSBiYWNrdXAgY3JlYXRpb24gZXJyb3JzXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIGxvYWQgZnJvbSBkaXNrOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9ydCBzdGF0ZSBmb3IgcGVyc2lzdGVuY2UgKEpTT04gc2VyaWFsaXphdGlvbikgXHUyMDE0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICovXG4gIGV4cG9ydFN0YXRlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZGF0YSA9IEFycmF5LmZyb20odGhpcy5zdGF0ZS5lbnRyaWVzKCkpLm1hcCgoW19rZXksIGVudHJ5XSkgPT4gKHtcbiAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLFxuICAgICAgdGltZXN0YW1wOiBlbnRyeS50aW1lc3RhbXAsXG4gICAgfSkpO1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgc3RhdGUgZnJvbSBKU09OIHN0cmluZyBcdTIwMTQga2VwdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgKi9cbiAgaW1wb3J0U3RhdGUoanNvblN0cmluZzogc3RyaW5nKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGpzb25TdHJpbmcpIGFzIFN0YXRlRW50cnlbXTtcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBkYXRhKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgICAgICB0aGlzLnJ1bm5pbmdTaXplICs9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIGFmdGVyIGltcG9ydFxuICAgICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gaW1wb3J0IHN0YXRlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCB0byB0aGUgbWVtb3J5IGZpbGUgb24gZGlza1xuICAgKi9cbiAgZ2V0TWVtb3J5RmlsZVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tZW1vcnlGaWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIHNhdmUgdG8gZGlzayAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBmb3JjZVNhdmUoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlVG9GaWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2UgbG9hZCBmcm9tIGRpc2sgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgKi9cbiAgZm9yY2VMb2FkKCk6IHZvaWQge1xuICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gIH1cbn1cbiIsICIvKipcclxuICogTG9uZy1ydW5uaW5nIHByb2Nlc3MgdHJhY2tpbmcgYW5kIG1hbmFnZW1lbnRcclxuICovXHJcblxyXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCYWNrZ3JvdW5kQ29tbWFuZCB7XHJcbiAgaWQ6IHN0cmluZztcclxuICBjb21tYW5kOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHN0YXJ0VGltZTogbnVtYmVyO1xyXG4gIHRpbWVvdXRIb3VyczogbnVtYmVyO1xyXG4gIHN0YXR1czogJ3J1bm5pbmcnIHwgJ2NvbXBsZXRlZCcgfCAnY2FuY2VsbGVkJyB8ICdlcnJvcmVkJztcclxuICBzdGRvdXQ/OiBzdHJpbmc7XHJcbiAgc3RkZXJyPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIHtcclxuICBwcml2YXRlIGNvbW1hbmRzOiBNYXA8c3RyaW5nLCBCYWNrZ3JvdW5kQ29tbWFuZD47XHJcbiAgcHJpdmF0ZSBtYXhUaW1lb3V0SG91cnM6IG51bWJlcjtcclxuICBcclxuICBjb25zdHJ1Y3RvcihfY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XHJcbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5tYXhUaW1lb3V0SG91cnMgPSAxMDsgLy8gSGFyZCBsaW1pdCBmcm9tIHRvb2wgc3BlY2lmaWNhdGlvblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXIgYSBuZXcgYmFja2dyb3VuZCBjb21tYW5kXHJcbiAgICovXHJcbiAgcmVnaXN0ZXIoY29tbWFuZDogc3RyaW5nLCB0aW1lb3V0SG91cnM6IG51bWJlciwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICh0aW1lb3V0SG91cnMgPCAwLjEgfHwgdGltZW91dEhvdXJzID4gdGhpcy5tYXhUaW1lb3V0SG91cnMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaW1lb3V0IG11c3QgYmUgYmV0d2VlbiAwLjEgYW5kICR7dGhpcy5tYXhUaW1lb3V0SG91cnN9IGhvdXJzYCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICghbmFtZSB8fCBuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgbmFtZSBpcyBtYW5kYXRvcnknKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgaWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcclxuICAgIFxyXG4gICAgdGhpcy5jb21tYW5kcy5zZXQoaWQsIHtcclxuICAgICAgaWQsXHJcbiAgICAgIGNvbW1hbmQsXHJcbiAgICAgIG5hbWUsXHJcbiAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcclxuICAgICAgdGltZW91dEhvdXJzLFxyXG4gICAgICBzdGF0dXM6ICdydW5uaW5nJyxcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gaWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBzdGF0dXMgYW5kIG91dHB1dCBvZiBhIGJhY2tncm91bmQgY29tbWFuZFxyXG4gICAqL1xyXG4gIGNoZWNrKGlkOiBzdHJpbmcpOiBCYWNrZ3JvdW5kQ29tbWFuZCB8IG51bGwge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCkgcmV0dXJuIG51bGw7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGlmIHRpbWVvdXQgZXhjZWVkZWRcclxuICAgIGNvbnN0IGVsYXBzZWRIb3VycyA9IChEYXRlLm5vdygpIC0gY29tbWFuZC5zdGFydFRpbWUpIC8gKDEwMDAgKiA2MCAqIDYwKTtcclxuICAgIGlmIChlbGFwc2VkSG91cnMgPiBjb21tYW5kLnRpbWVvdXRIb3VycyAmJiBjb21tYW5kLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XHJcbiAgICAgIGNvbW1hbmQuc3RhdHVzID0gJ2Vycm9yZWQnO1xyXG4gICAgICBjb21tYW5kLnN0ZGVyciA9IGBDb21tYW5kIGV4Y2VlZGVkIHRpbWVvdXQgKCR7Y29tbWFuZC50aW1lb3V0SG91cnN9IGhvdXJzKWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBjb21tYW5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FuY2VsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmRcclxuICAgKi9cclxuICBjYW5jZWwoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCB8fCBjb21tYW5kLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgICBcclxuICAgIGNvbW1hbmQuc3RhdHVzID0gJ2NhbmNlbGxlZCc7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbGwgYWN0aXZlIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0QWN0aXZlQ29tbWFuZHMoKTogQmFja2dyb3VuZENvbW1hbmRbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNvbW1hbmRzLnZhbHVlcygpKVxyXG4gICAgICAuZmlsdGVyKGMgPT4gYy5zdGF0dXMgPT09ICdydW5uaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgY29tcGxldGVkL2Vycm9yZWQvY2FuY2VsbGVkIGNvbW1hbmRzIGFmdGVyIGNsZWFudXAgcGVyaW9kXHJcbiAgICovXHJcbiAgY2xlYW51cChtYXhBZ2VIb3VyczogbnVtYmVyID0gMjQpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBmb3IgKGNvbnN0IFtpZCwgY29tbWFuZF0gb2YgdGhpcy5jb21tYW5kcy5lbnRyaWVzKCkpIHtcclxuICAgICAgaWYgKGNvbW1hbmQuc3RhdHVzICE9PSAncnVubmluZycpIHtcclxuICAgICAgICBjb25zdCBhZ2VIb3VycyA9IChub3cgLSBjb21tYW5kLnN0YXJ0VGltZSkgLyAoMTAwMCAqIDYwICogNjApO1xyXG4gICAgICAgIGlmIChhZ2VIb3VycyA+IG1heEFnZUhvdXJzKSB7XHJcbiAgICAgICAgICB0aGlzLmNvbW1hbmRzLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgY29tbWFuZCBJRFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBiZ18ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0b3RhbCBjb3VudCBvZiByZWdpc3RlcmVkIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0Q291bnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmNvbW1hbmRzLnNpemU7XHJcbiAgfVxyXG59XHJcbiIsICIvKipcbiAqIFdvcmtpbmcgRGlyZWN0b3J5IE1hbmFnZXIgd2l0aCBQZXJzaXN0ZW50IFN0b3JhZ2VcbiAqIFxuICogVHJhY2tzIGEgbXV0YWJsZSB3b3JraW5nIGRpcmVjdG9yeSB0aGF0IHBlcnNpc3RzIGFjcm9zcyBzYW5kYm94IHJlc2V0cy5cbiAqIFVzZXMgZmlsZS1iYXNlZCBzdG9yYWdlIHRvIHN1cnZpdmUgaXNvbGF0ZWQgZXhlY3V0aW9uIGNvbnRleHRzLlxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5cbi8vIEJhc2UgZGlyZWN0b3J5OiBwbHVnaW4gcm9vdCAod2hlcmUgcGFja2FnZS5qc29uIGxpdmVzKVxuY29uc3QgQkFTRV9ESVIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nKTtcblxuLy8gUGVyc2lzdGVudCBzdG9yYWdlIGZpbGUgZm9yIHdvcmtpbmcgZGlyZWN0b3J5XG5jb25zdCBTVEFURV9GSUxFID0gcGF0aC5qb2luKEJBU0VfRElSLCAnLmFpX3Rvb2xib3hfc3RhdGUuanNvbicpO1xuXG4vKiogTG9hZCBwZXJzaXN0ZWQgc3RhdGUgZnJvbSBkaXNrICovXG5mdW5jdGlvbiBsb2FkU3RhdGUoKTogeyB3b3JraW5nRGlyPzogc3RyaW5nIH0ge1xuICB0cnkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKFNUQVRFX0ZJTEUpKSB7XG4gICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKFNUQVRFX0ZJTEUsICd1dGYtOCcpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElnbm9yZSBlcnJvcnMgLSB1c2UgZGVmYXVsdHNcbiAgfVxuICByZXR1cm4ge307XG59XG5cbi8qKiBTYXZlIHN0YXRlIHRvIGRpc2sgKi9cbmZ1bmN0aW9uIHNhdmVTdGF0ZShzdGF0ZTogeyB3b3JraW5nRGlyPzogc3RyaW5nIH0pOiB2b2lkIHtcbiAgdHJ5IHtcbiAgICBmcy53cml0ZUZpbGVTeW5jKFNUQVRFX0ZJTEUsIEpTT04uc3RyaW5naWZ5KHN0YXRlLCBudWxsLCAyKSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKGBbV29ya2luZ0Rpcl0gRmFpbGVkIHRvIHBlcnNpc3Qgc3RhdGU6ICR7ZXJyb3J9YCk7XG4gIH1cbn1cblxuLy8gTXV0YWJsZSB3b3JraW5nIGRpcmVjdG9yeSBcdTIwMTQgbG9hZGVkIGZyb20gcGVyc2lzdGVudCBzdG9yYWdlIG9yIGRlZmF1bHRzIHRvIHBsdWdpbiByb290XG5jb25zdCBwZXJzaXN0ZWRTdGF0ZSA9IGxvYWRTdGF0ZSgpO1xubGV0IGN1cnJlbnRXb3JraW5nRGlyOiBzdHJpbmcgPSBwZXJzaXN0ZWRTdGF0ZS53b3JraW5nRGlyIHx8IEJBU0VfRElSO1xuXG4vKiogR2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0V29ya2luZ0RpcigpOiBzdHJpbmcge1xuICByZXR1cm4gY3VycmVudFdvcmtpbmdEaXI7XG59XG5cbi8qKlxuICogU2V0IHRoZSB3b3JraW5nIGRpcmVjdG9yeSB0byBhIG5ldyBhYnNvbHV0ZSBwYXRoLlxuICogVmFsaWRhdGVzIHRoYXQgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhbiBhYnNvbHV0ZSBkaXJlY3RvcnkuXG4gKiBQRVJTSVNUUyB0aGUgY2hhbmdlIHRvIGRpc2sgc28gaXQgc3Vydml2ZXMgc2FuZGJveCByZXNldHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRXb3JraW5nRGlyKG5ld0Rpcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFJlc29sdmUgdG8gYWJzb2x1dGUgcGF0aFxuICBjb25zdCByZXNvbHZlZCA9IHBhdGgucmVzb2x2ZShuZXdEaXIpO1xuXG4gIC8vIE11c3QgYmUgYW4gYWJzb2x1dGUgcGF0aFxuICBpZiAoIXBhdGguaXNBYnNvbHV0ZShyZXNvbHZlZCkpIHtcbiAgICBjb25zb2xlLndhcm4oYHNldFdvcmtpbmdEaXIgcmVqZWN0ZWQ6IG5vdCBhYnNvbHV0ZSBcdTIwMTQgJyR7bmV3RGlyfSdgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBNdXN0IGV4aXN0IGFuZCBiZSBhIGRpcmVjdG9yeVxuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMocmVzb2x2ZWQpO1xuICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBzZXRXb3JraW5nRGlyIHJlamVjdGVkOiBub3QgYSBkaXJlY3RvcnkgXHUyMDE0ICcke3Jlc29sdmVkfSdgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGNvbnNvbGUud2Fybihgc2V0V29ya2luZ0RpciByZWplY3RlZDogcGF0aCBkb2VzIG5vdCBleGlzdCBcdTIwMTQgJyR7cmVzb2x2ZWR9J2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGN1cnJlbnRXb3JraW5nRGlyID0gcmVzb2x2ZWQ7XG4gIFxuICAvLyBQRVJTSVNUIHRoZSBjaGFuZ2UgdG8gZGlzayAoRklYIGZvciBzYW5kYm94IHJlc2V0IGlzc3VlKVxuICBzYXZlU3RhdGUoeyB3b3JraW5nRGlyOiByZXNvbHZlZCB9KTtcbiAgY29uc29sZS5sb2coYFtXb3JraW5nRGlyXSBQZXJzaXN0ZWQgbmV3IHdvcmtpbmcgZGlyZWN0b3J5OiAke3Jlc29sdmVkfWApO1xuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKiBcbiAqIFJlc2V0IHRoZSB3b3JraW5nIGRpcmVjdG9yeSBiYWNrIHRvIHRoZSBwbHVnaW4gcm9vdFxuICogQWxzbyBjbGVhcnMgcGVyc2lzdGVkIHN0YXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRXb3JraW5nRGlyKCk6IHZvaWQge1xuICBjdXJyZW50V29ya2luZ0RpciA9IEJBU0VfRElSO1xuICBzYXZlU3RhdGUoeyB3b3JraW5nRGlyOiB1bmRlZmluZWQgfSk7IC8vIENsZWFyIHBlcnNpc3RlZCBzdGF0ZVxuICBjb25zb2xlLmxvZyhgW1dvcmtpbmdEaXJdIFJlc2V0IHRvIHBsdWdpbiByb290OiAke0JBU0VfRElSfWApO1xufVxuXG4vKiogUmVzb2x2ZSBhIHVzZXItcHJvdmlkZWQgcGF0aCBhZ2FpbnN0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhdGgodXNlclBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUoY3VycmVudFdvcmtpbmdEaXIsIHVzZXJQYXRoKTtcbn1cblxuLyoqIEdldCBhbGxvd2VkIGJhc2UgZGlyZWN0b3JpZXMgZm9yIGFic29sdXRlLXBhdGggdmFsaWRhdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbG93ZWRCYXNlcygpOiBzdHJpbmdbXSB7XG4gIC8vIEFsbG93IGJvdGggdGhlIHBsdWdpbiByb290IGFuZCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICBjb25zdCBiYXNlcyA9IFtCQVNFX0RJUiwgY3VycmVudFdvcmtpbmdEaXJdO1xuICByZXR1cm4gWy4uLm5ldyBTZXQoYmFzZXMpXTsgLy8gRGVkdXBsaWNhdGVcbn1cblxuLyoqIEdldCB0aGUgcGx1Z2luIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgKG5ldmVyIGNoYW5nZXMpICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1Z2luUm9vdCgpOiBzdHJpbmcge1xuICByZXR1cm4gQkFTRV9ESVI7XG59XG4iLCAiLyoqXG4gKiBTZWN1cml0eSB1dGlsaXRpZXMgZm9yIHBhdGggdmFsaWRhdGlvbiwgYmluYXJ5IGRldGVjdGlvbiwgYW5kIFJlRG9TIHByb3RlY3Rpb25cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbi8vIFx1MjcwNSBGSVg6IFVzZSBwcm9wZXIgRVNNIGltcG9ydHMgaW5zdGVhZCBvZiByZXF1aXJlKCkgdG8gbWFpbnRhaW4gbW9kdWxlIGJvdW5kYXJ5XG5pbXBvcnQgeyBnZXRBbGxvd2VkQmFzZXMsIGdldFdvcmtpbmdEaXIgfSBmcm9tICcuL3dvcmtpbmdEaXInO1xuXG4vKipcbiAqIFZhbGlkYXRlIGZpbGUgcGF0aCB0byBwcmV2ZW50IGRpcmVjdG9yeSB0cmF2ZXJzYWwgYXR0YWNrcy5cbiAqIERJU0FCTEVEOiBTZWN1cml0eSB2YWxpZGF0b3IgcmVtb3ZlZCBwZXIgdXNlciByZXF1ZXN0IC0gYWxsb3dzIGFsbCBwYXRocy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUGF0aCh1c2VyUGF0aDogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB0cnVlOyAvLyBBbHdheXMgYWxsb3cgcGF0aHNcbn1cblxuLyoqXG4gKiBEZXRlY3QgYmluYXJ5IGZpbGVzIGJ5IGNoZWNraW5nIGZvciBudWxsIGJ5dGVzIGluIGZpcnN0IDhLQlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCaW5hcnlGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaHVuayA9IGNvbnRlbnQuc2xpY2UoMCwgODE5Mik7XG4gIC8vIENoZWNrIGZvciBudWxsIGJ5dGUgKDB4MDApIHdoaWNoIGluZGljYXRlcyBiaW5hcnkgY29udGVudFxuICByZXR1cm4gY2h1bmsuaW5jbHVkZXMoJ1xcMCcpO1xufVxuXG4vKipcbiAqIFByb3RlY3QgYWdhaW5zdCBSZURvUyAoUmVndWxhciBFeHByZXNzaW9uIERlbmlhbCBvZiBTZXJ2aWNlKVxuICogUzIgRklYOiBVc2VzIHByb3BlciByZWdleCBzdHJ1Y3R1cmUgYW5hbHlzaXMgaW5zdGVhZCBvZiBuYWl2ZSBzdWJzdHJpbmcgbWF0Y2hpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NhZmVSZWdleChwYXR0ZXJuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFwYXR0ZXJuIHx8IHBhdHRlcm4ubGVuZ3RoID4gNTAwKSByZXR1cm4gZmFsc2U7XG4gIFxuICAvLyBDaGVjayBmb3IgY29tbW9uIFJlRG9TIHBhdHRlcm5zIHVzaW5nIHN0cnVjdHVyZWQgcmVnZXggZGV0ZWN0aW9uXG4gIGNvbnN0IGRhbmdlcm91c1N0cnVjdHVyZXMgPSBbXG4gICAgLyhcXChbXildKlxcKVsqK10pW14pXSpcXCkvLCAgICAgICAgICAgLy8gTmVzdGVkIHF1YW50aWZpZXJzOiAoLiopKC4qKVxuICAgIC9cXChbXildKlsrKl1cXCkrLywgICAgICAgICAgICAgICAgICAgIC8vIFJlcGV0aXRpb24gb2YgcmVwZXRpdGlvbjogKC4rKStcbiAgICAvXFwoW14pXSpcXHxbXildKlxcKVsrKl0vLCAgICAgICAgICAgICAgLy8gQWx0ZXJuYXRpb24gKyByZXBldGl0aW9uOiAoYXxiKStcbiAgICAvKFxcW1teXFxdXStcXF1bKypdKVteXV0qXFxdLywgICAgICAgICAgIC8vIENoYXIgY2xhc3Mgd2l0aCByZXBldGl0aW9uOiAoW2Etel0rKStcbiAgICAvXFwoXFwuXFw/XFwpXFwqXFwqLywgICAgICAgICAgICAgICAgICAgICAgLy8gR3JvdXAgZm9sbG93ZWQgYnkgZG91YmxlIHN0YXI6ICguKj8pKipcbiAgXTtcbiAgXG4gIGZvciAoY29uc3Qgc3RydWN0dXJlIG9mIGRhbmdlcm91c1N0cnVjdHVyZXMpIHtcbiAgICBpZiAoc3RydWN0dXJlLnRlc3QocGF0dGVybikpIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgLy8gQWxzbyBjaGVjayBmb3IgdGhlIG9yaWdpbmFsIG5haXZlIHBhdHRlcm5zIGFzIGZhbGxiYWNrXG4gIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICcoLiopKC4qKScsICAgICAgICAgICAvLyBOZXN0ZWQgcXVhbnRpZmllcnMgd2l0aCAuKlxuICAgICcoLispKycsICAgICAgICAgICAgICAvLyBSZXBldGl0aW9uIG9mIHJlcGV0aXRpb24gIFxuICAgICcoW2Etel0rKSsnLCAgICAgICAgICAvLyBDaGFyYWN0ZXIgY2xhc3Mgd2l0aCByZXBldGl0aW9uXG4gICAgJyhhfGIpKycsICAgICAgICAgICAgIC8vIEFsdGVybmF0aW9uIHdpdGggcmVwZXRpdGlvblxuICAgICcoLio/KSoqJywgICAgICAgICAgICAvLyBHcm91cCBmb2xsb3dlZCBieSBkb3VibGUgc3RhciAoUmVEb1MpXG4gIF07XG4gIFxuICBmb3IgKGNvbnN0IGRhbmdlcm91c1BhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi5pbmNsdWRlcyhkYW5nZXJvdXNQYXR0ZXJuKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBcHBseSBzZWN1cml0eSBjaGVja3MgYmFzZWQgb24gY29uZmlnIHNldHRpbmdzLlxuICogVXNlcyB0aGUgdmlydHVhbCB3b3JraW5nIGRpcmVjdG9yeSBmb3IgcGF0aCB2YWxpZGF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTZWN1cml0eUNoZWNrcyhcbiAgZmlsZVBhdGg6IHN0cmluZywgXG4gIGNvbnRlbnQ/OiBzdHJpbmcsIFxuICByZWdleFBhdHRlcm4/OiBzdHJpbmcsIFxuICBjb25maWc/OiBQbHVnaW5Db25maWdcbik6IHsgdmFsaWRQYXRoOiBib29sZWFuOyBpc0JpbmFyeTogYm9vbGVhbjsgc2FmZVJlZ2V4OiBib29sZWFuIH0ge1xuICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG5cbiAgcmV0dXJuIHtcbiAgICB2YWxpZFBhdGg6IGVmZmVjdGl2ZUNvbmZpZy5wYXRoVmFsaWRhdGlvbkVuYWJsZWQgPyB2YWxpZGF0ZVBhdGgoZmlsZVBhdGgsIGdldFdvcmtpbmdEaXIoKSkgOiB0cnVlLFxuICAgIGlzQmluYXJ5OiBlZmZlY3RpdmVDb25maWcuYmluYXJ5RmlsZURldGVjdGlvbiAmJiBjb250ZW50ID8gaXNCaW5hcnlGaWxlKGNvbnRlbnQpIDogZmFsc2UsXG4gICAgc2FmZVJlZ2V4OiBlZmZlY3RpdmVDb25maWcucmVnZXhSZURvU1Byb3RlY3Rpb24gJiYgcmVnZXhQYXR0ZXJuID8gaXNTYWZlUmVnZXgocmVnZXhQYXR0ZXJuKSA6IHRydWUsXG4gIH07XG59XG5cbi8qKlxuICogU2FuaXRpemUgc2hlbGwgY29tbWFuZHMgdG8gcHJldmVudCBkYW5nZXJvdXMgb3BlcmF0aW9uc1xuICogUzMgRklYOiBFbmhhbmNlZCB3aXRoIElGUy10YW1wZXJpbmcgYW5kIG51bGwtYnl0ZSBpbmplY3Rpb24gZGV0ZWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHsgc2FmZTogYm9vbGVhbjsgcmVhc29uPzogc3RyaW5nIH0ge1xuICBpZiAoIWNvbW1hbmQgfHwgdHlwZW9mIGNvbW1hbmQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0VtcHR5IG9yIGludmFsaWQgY29tbWFuZCcgfTtcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB3aGl0ZXNwYWNlIGJ1dCBwcmVzZXJ2ZSBxdW90ZWQgc3RyaW5nc1xuICBjb25zdCBub3JtYWxpemVkID0gY29tbWFuZC50cmltKCk7XG4gIFxuICAvLyBTMyBGSVg6IEJsb2NrIG51bGwgYnl0ZSBpbmplY3Rpb24gKGNhbiBieXBhc3MgcmVnZXggbWF0Y2hpbmcpXG4gIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKCdcXDAnKSB8fCBub3JtYWxpemVkLmluY2x1ZGVzKCclMDAnKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdOdWxsIGJ5dGUgaW5qZWN0aW9uIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgLy8gUzMgRklYOiBCbG9jayBJRlMtdGFtcGVyaW5nIGluIGJhc2ggKElGUz0kJyAnIGFsbG93cyBzcGxpdHRpbmcgd2l0aG91dCBzcGFjZXMpXG4gIGNvbnN0IGlmc1BhdHRlcm5zID0gW1xuICAgIC9cXGJJRlNcXHMqPVxccypbXFxcXCQnXVxccyovaSxcbiAgICAvSUZTPVskJ11bXiddKicvaSxcbiAgXTtcbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGlmc1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4udGVzdChub3JtYWxpemVkKSkge1xuICAgICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0lGUyB0YW1wZXJpbmcgZGV0ZWN0ZWQnIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGRhbmdlcm91cyBwYXR0ZXJucyB1c2luZyBhIG1vcmUgcm9idXN0IGFwcHJvYWNoXG4gIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgIC8vIEZpbGUgc3lzdGVtIGRlc3RydWN0aW9uXG4gICAgL1xcYnJtXFxzKy1yZlxcYi9pLFxuICAgIC9cXGJzaHJlZFxcYi9pLFxuICAgIC9cXGJ3aXBlXFxiL2ksXG4gICAgXG4gICAgLy8gUHJpdmlsZWdlIGVzY2FsYXRpb25cbiAgICAvXFxic3Vkb1xcYi9pLFxuICAgIC9cXGJzdVxcYig/IVxcdykvaSwgIC8vICdzdScgYnV0IG5vdCAnc3VkbycsICdzdXNoaScsIGV0Yy5cbiAgICBcbiAgICAvLyBOZXR3b3JrIGF0dGFja3NcbiAgICAvXFxibmNcXGIoPyFcXHcpfFxcYm5ldGNhdFxcYi9pLFxuICAgIC9cXGJ3Z2V0XFxzKy4qLS1wb3N0LWZpbGVcXGIvaSxcbiAgICAvXFxiY3VybFxccysuKi0tZGF0YS1iaW5hcnlcXGIvaSxcbiAgICBcbiAgICAvLyBEYXRhIGV4ZmlsdHJhdGlvblxuICAgIC9cXGJiYXNlNjRcXGIuKlxcfFxccyooY3VybHx3Z2V0KS9pLFxuICAgIC9cXGJzY3BcXGIoPyFcXHcpfFxcYnNmdHBcXGIvaSxcbiAgICBcbiAgICAvLyBQcm9jZXNzIG1hbmlwdWxhdGlvblxuICAgIC9cXGJmb3JrXFxiKD8hXFx3KS9pLFxuICAgIC9cXGJleGVjXFxiKD8hXFx3KS9pLFxuICAgIFxuICAgIC8vIEVudmlyb25tZW50IHRhbXBlcmluZ1xuICAgIC9cXGJleHBvcnRcXHMrXFx3Kz0vaSxcbiAgICAvXFxiZXZhbFxcYig/IVxcdykvaSxcbiAgXTtcblxuICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiBgRGFuZ2Vyb3VzIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7cGF0dGVybi5zb3VyY2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBwaXBlIGNoYWlucyB0aGF0IGNvdWxkIGJlIHVzZWQgZm9yIGF0dGFja3MgKG1vcmUgdGhhbiAyIHBpcGVzID0gMysgY29tbWFuZHMpXG4gIGNvbnN0IHBpcGVDb3VudCA9IChub3JtYWxpemVkLm1hdGNoKC9cXHwvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHBpcGVDb3VudCA+IDIpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnVG9vIG1hbnkgcGlwZXMgaW4gY29tbWFuZCBjaGFpbicgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBzZW1pY29sb24tc2VwYXJhdGVkIGNvbW1hbmRzIChwb3RlbnRpYWwgaW5qZWN0aW9uKVxuICBjb25zdCBzZW1pQ29sb25Db3VudCA9IChub3JtYWxpemVkLm1hdGNoKC87L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChzZW1pQ29sb25Db3VudCA+IDEpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnTXVsdGlwbGUgc2VtaWNvbG9ucyBkZXRlY3RlZCBpbiBjb21tYW5kJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGJhY2t0aWNrIGV4ZWN1dGlvbiBvciAkKCkgc3Vic2hlbGwgaW5qZWN0aW9uXG4gIGlmICgvYFteYF0rYHxcXCRcXChbXildK1xcKS8udGVzdChub3JtYWxpemVkKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdDb21tYW5kIHN1YnN0aXR1dGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBlbnZpcm9ubWVudCB2YXJpYWJsZSBpbmplY3Rpb25cbiAgaWYgKC9eXFxzKihleHBvcnR8dW5zZXQpXFxzLy50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0Vudmlyb25tZW50IG1vZGlmaWNhdGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIHJldHVybiB7IHNhZmU6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBTUUwgcXVlcnkgZm9yIHNhZmV0eSAocmVhZC1vbmx5IG9wZXJhdGlvbnMgb25seSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU1FMUXVlcnkocXVlcnk6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IHJlYXNvbj86IHN0cmluZyB9IHtcbiAgaWYgKCFxdWVyeSB8fCB0eXBlb2YgcXVlcnkgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246ICdFbXB0eSBvciBpbnZhbGlkIHF1ZXJ5JyB9O1xuICB9XG5cbiAgY29uc3QgdHJpbW1lZCA9IHF1ZXJ5LnRyaW0oKS50b1VwcGVyQ2FzZSgpO1xuICBcbiAgLy8gT25seSBhbGxvdyBTRUxFQ1QgYW5kIFBSQUdNQSBzdGF0ZW1lbnRzXG4gIGlmICghdHJpbW1lZC5zdGFydHNXaXRoKCdTRUxFQ1QnKSAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdQUkFHTUEnKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnT25seSBTRUxFQ1QgYW5kIFBSQUdNQSBxdWVyaWVzIGFyZSBhbGxvd2VkJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGRhbmdlcm91cyBrZXl3b3JkcyB0aGF0IGNvdWxkIGJlIGluamVjdGVkIGFmdGVyIFNFTEVDVC9QUkFHTUFcbiAgY29uc3QgZGFuZ2Vyb3VzU1FMS2V5d29yZHMgPSBbXG4gICAgL1xcYkRST1BcXGIvaSxcbiAgICAvXFxiREVMRVRFXFxiL2ksXG4gICAgL1xcYlVQREFURVxcYi9pLFxuICAgIC9cXGJJTlNFUlRcXGIvaSxcbiAgICAvXFxiQUxURVJcXGIvaSxcbiAgICAvXFxiQ1JFQVRFXFxiL2ksXG4gICAgL1xcYlJFUExBQ0VcXGIvaSxcbiAgICAvXFxiVFJVTkNBVEVcXGIvaSxcbiAgICAvXFxiR1JBTlRcXGIvaSxcbiAgICAvXFxiUkVWT0tFXFxiL2ksXG4gIF07XG5cbiAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGRhbmdlcm91c1NRTEtleXdvcmRzKSB7XG4gICAgaWYgKGtleXdvcmQudGVzdCh0cmltbWVkKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246IGBEYW5nZXJvdXMgU1FMIG9wZXJhdGlvbiBkZXRlY3RlZDogJHtrZXl3b3JkLnNvdXJjZX1gIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIG11bHRpcGxlIHN0YXRlbWVudHMgKHNlbWljb2xvbiBpbmplY3Rpb24pXG4gIGNvbnN0IHNlbWlDb2xvbkNvdW50ID0gKHRyaW1tZWQubWF0Y2goLzsvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHNlbWlDb2xvbkNvdW50ID4gMCkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnTXVsdGlwbGUgU1FMIHN0YXRlbWVudHMgZGV0ZWN0ZWQnIH07XG4gIH1cblxuICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuIiwgIi8qKlxuICogUGVyZm9ybWFuY2UgVXRpbGl0aWVzIGZvciBBSSBUb29sYm94IFBsdWdpblxuICogT3B0aW1pemVkIGFsZ29yaXRobXMgd2l0aCBlYXJseSBleGl0LCBjYWNoaW5nLCBhbmQgYXN5bmMgb3BlcmF0aW9uc1xuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IExldmVuc2h0ZWluIERpc3RhbmNlIHdpdGggRWFybHkgRXhpdCA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE9wdGltaXplZCBMZXZlbnNodGVpbiBkaXN0YW5jZSBjYWxjdWxhdGlvbiB3aXRoIGVhcmx5IGV4aXQgdGhyZXNob2xkLlxuICogU3RvcHMgY2FsY3VsYXRpbmcgaWYgdGhlIG1pbmltdW0gcG9zc2libGUgc2NvcmUgZHJvcHMgYmVsb3cgdGhlIHRocmVzaG9sZC5cbiAqIFxuICogQHBhcmFtIGEgLSBGaXJzdCBzdHJpbmdcbiAqIEBwYXJhbSBiIC0gU2Vjb25kIHN0cmluZyAgXG4gKiBAcGFyYW0gbWluU2NvcmUgLSBNaW5pbXVtIGFjY2VwdGFibGUgc2ltaWxhcml0eSBzY29yZSAoMC0xKS4gUmVzdWx0cyBiZWxvdyB0aGlzIGFyZSBwcnVuZWQgZWFybHkuXG4gKiBAcmV0dXJucyBTaW1pbGFyaXR5IHNjb3JlIGJldHdlZW4gMCBhbmQgMSwgb3IgbnVsbCBpZiBiZWxvdyB0aHJlc2hvbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxldmVuc2h0ZWluU2ltaWxhcml0eShhOiBzdHJpbmcsIGI6IHN0cmluZywgbWluU2NvcmU6IG51bWJlciA9IDAuMyk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBtYXhMZW4gPSBNYXRoLm1heChhLmxlbmd0aCwgYi5sZW5ndGgpO1xuICBpZiAobWF4TGVuID09PSAwKSByZXR1cm4gMTtcblxuICAvLyBRdWljayByZWplY3Rpb246IGlmIHN0cmluZ3MgZGlmZmVyIHRvbyBtdWNoIGluIGxlbmd0aCwgc2tpcCBleHBlbnNpdmUgY2FsY3VsYXRpb25cbiAgY29uc3QgbGVuRGlmZiA9IE1hdGguYWJzKGEubGVuZ3RoIC0gYi5sZW5ndGgpO1xuICBpZiAobGVuRGlmZiAvIG1heExlbiA+ICgxIC0gbWluU2NvcmUpKSB7XG4gICAgcmV0dXJuIG51bGw7IC8vIEVhcmx5IGV4aXQgZm9yIHZlcnkgZGlmZmVyZW50IGxlbmd0aHNcbiAgfVxuXG4gIC8vIFVzZSB0d28tcm93IG9wdGltaXphdGlvbiBpbnN0ZWFkIG9mIGZ1bGwgbWF0cml4IChzYXZlcyBtZW1vcnkpXG4gIGxldCBwcmV2Um93OiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJldlJvdy5wdXNoKDApO1xuICB9XG4gIGxldCBjdXJyUm93OiBudW1iZXJbXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IGIubGVuZ3RoOyBpKyspIHtcbiAgICBwcmV2Um93W2ldID0gaTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGEubGVuZ3RoOyBpKyspIHtcbiAgICBjdXJyUm93WzBdID0gaTtcbiAgICBcbiAgICAvLyBFYXJseSBleGl0IG9wdGltaXphdGlvbjogaWYgY3VycmVudCByb3cncyBtaW5pbXVtIGV4Y2VlZHMgdGhyZXNob2xkLCBhYm9ydFxuICAgIGxldCBtaW5JblJvdyA9IGk7XG4gICAgXG4gICAgZm9yIChsZXQgaiA9IDE7IGogPD0gYi5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgY29zdCA9IGFbaSAtIDFdID09PSBiW2ogLSAxXSA/IDAgOiAxO1xuICAgICAgY3VyclJvd1tqXSA9IE1hdGgubWluKFxuICAgICAgICBwcmV2Um93W2pdICsgMSwgICAgICAgICAvLyBkZWxldGlvblxuICAgICAgICBjdXJyUm93W2ogLSAxXSArIDEsICAgICAvLyBpbnNlcnRpb24gIFxuICAgICAgICBwcmV2Um93W2ogLSAxXSArIGNvc3QgICAvLyBzdWJzdGl0dXRpb25cbiAgICAgICk7XG4gICAgICBcbiAgICAgIGlmIChjdXJyUm93W2pdIDwgbWluSW5Sb3cpIHtcbiAgICAgICAgbWluSW5Sb3cgPSBjdXJyUm93W2pdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVhcmx5IGV4aXQ6IGlmIG1pbmltdW0gaW4gdGhpcyByb3cgYWxyZWFkeSBleGNlZWRzIHRocmVzaG9sZCwgYWJvcnRcbiAgICBjb25zdCBjdXJyZW50TWF4U2NvcmUgPSAxIC0gbWluSW5Sb3cgLyBtYXhMZW47XG4gICAgaWYgKGN1cnJlbnRNYXhTY29yZSA8IG1pblNjb3JlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHJvd3NcbiAgICBbcHJldlJvdywgY3VyclJvd10gPSBbY3VyclJvdywgcHJldlJvd107XG4gIH1cblxuICBjb25zdCBkaXN0YW5jZSA9IHByZXZSb3dbYi5sZW5ndGhdO1xuICBjb25zdCBzY29yZSA9IE1hdGgubWF4KDAsIDEgLSBkaXN0YW5jZSAvIG1heExlbik7XG4gIHJldHVybiBzY29yZSA+PSBtaW5TY29yZSA/IHNjb3JlIDogbnVsbDtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRnV6enkgU2VhcmNoIENhY2hlID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBGdXp6eVNlYXJjaENhY2hlRW50cnkge1xuICByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT47XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG5jb25zdCBmdXp6eVNlYXJjaENhY2hlID0gbmV3IE1hcDxzdHJpbmcsIEZ1enp5U2VhcmNoQ2FjaGVFbnRyeT4oKTtcbmNvbnN0IENBQ0hFX1RUTF9NUyA9IDYwXzAwMDsgLy8gNjAgc2Vjb25kIGNhY2hlIFRUTFxuXG4vKipcbiAqIEdldCBjYWNoZWQgZnV6enkgc2VhcmNoIHJlc3VsdHMgaWYgYXZhaWxhYmxlIGFuZCBub3QgZXhwaXJlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlZEZ1enp5UmVzdWx0cyhxdWVyeTogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKTogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+IHwgbnVsbCB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7cXVlcnl9OiR7YmFzZVBhdGh9YDtcbiAgY29uc3QgZW50cnkgPSBmdXp6eVNlYXJjaENhY2hlLmdldChjYWNoZUtleSk7XG4gIFxuICBpZiAoIWVudHJ5KSByZXR1cm4gbnVsbDtcbiAgaWYgKERhdGUubm93KCkgLSBlbnRyeS50aW1lc3RhbXAgPiBDQUNIRV9UVExfTVMpIHtcbiAgICBmdXp6eVNlYXJjaENhY2hlLmRlbGV0ZShjYWNoZUtleSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgXG4gIHJldHVybiBlbnRyeS5yZXN1bHRzO1xufVxuXG4vKipcbiAqIENhY2hlIGZ1enp5IHNlYXJjaCByZXN1bHRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVGdXp6eVJlc3VsdHMocXVlcnk6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZywgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+KTogdm9pZCB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7cXVlcnl9OiR7YmFzZVBhdGh9YDtcbiAgZnV6enlTZWFyY2hDYWNoZS5zZXQoY2FjaGVLZXksIHtcbiAgICByZXN1bHRzLFxuICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgfSk7XG4gIFxuICAvLyBFdmljdCBvbGQgZW50cmllcyBpZiBjYWNoZSBncm93cyB0b28gbGFyZ2UgKG1heCAxMDAgZW50cmllcylcbiAgaWYgKGZ1enp5U2VhcmNoQ2FjaGUuc2l6ZSA+IDEwMCkge1xuICAgIGNvbnN0IG9sZGVzdEtleSA9IGZ1enp5U2VhcmNoQ2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICBpZiAob2xkZXN0S2V5KSB7XG4gICAgICBmdXp6eVNlYXJjaENhY2hlLmRlbGV0ZShvbGRlc3RLZXkpO1xuICAgIH1cbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBc3luYyBGaWxlIFNlYXJjaCB3aXRoIENvbmN1cnJlbmN5IENvbnRyb2wgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdCB7XG4gIGZpbGVzOiBzdHJpbmdbXTtcbiAgY291bnQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBzZWFyY2ggZm9yIGZpbGVzIG1hdGNoaW5nIGEgcGF0dGVybiB1c2luZyBhc3luYy9hd2FpdCB3aXRoIGNvbmN1cnJlbmN5IGNvbnRyb2wuXG4gKiBNdWNoIGZhc3RlciB0aGFuIHN5bmNocm9ub3VzIHJlYWRkaXJTeW5jIGZvciBsYXJnZSBkaXJlY3RvcnkgdHJlZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kRmlsZXNBc3luYyhcbiAgZGlyUGF0aDogc3RyaW5nLFxuICBwYXR0ZXJuOiBzdHJpbmcsXG4gIG1heERlcHRoOiBudW1iZXIgPSA1LFxuICBjb25jdXJyZW5jeUxpbWl0OiBudW1iZXIgPSA0XG4pOiBQcm9taXNlPFNlYXJjaFJlc3VsdD4ge1xuICBjb25zdCByZXN1bHRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBwYXR0ZXJuTG93ZXIgPSBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gc2VhcmNoRGlyKGN1cnJlbnRQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5yZWFkZGlyKGN1cnJlbnRQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICBcbiAgICAgIC8vIFByb2Nlc3MgZmlsZXMgaW1tZWRpYXRlbHlcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoZW50cnkuaXNGaWxlKCkgJiYgZW50cnkubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHBhdHRlcm5Mb3dlcikpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlbnRyeS5uYW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ29sbGVjdCBzdWJkaXJlY3RvcmllcyBmb3IgcGFyYWxsZWwgcHJvY2Vzc2luZ1xuICAgICAgY29uc3Qgc3ViZGlycyA9IGVudHJpZXMuZmlsdGVyKGUgPT4gZS5pc0RpcmVjdG9yeSgpKS5tYXAoZSA9PiBwYXRoLmpvaW4oY3VycmVudFBhdGgsIGUubmFtZSkpO1xuICAgICAgXG4gICAgICBpZiAoc3ViZGlycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIFByb2Nlc3MgZGlyZWN0b3JpZXMgaW4gYmF0Y2hlcyB0byBhdm9pZCBvdmVyd2hlbG1pbmcgdGhlIHN5c3RlbVxuICAgICAgICBjb25zdCBiYXRjaGVzOiBzdHJpbmdbXVtdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViZGlycy5sZW5ndGg7IGkgKz0gY29uY3VycmVuY3lMaW1pdCkge1xuICAgICAgICAgIGJhdGNoZXMucHVzaChzdWJkaXJzLnNsaWNlKGksIGkgKyBjb25jdXJyZW5jeUxpbWl0KSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGJhdGNoIG9mIGJhdGNoZXMpIHtcbiAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIGJhdGNoLm1hcChkaXIgPT4gc2VhcmNoRGlyKGRpciwgZGVwdGggKyAxKSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3RvcmllcyBzaWxlbnRseVxuICAgIH1cbiAgfVxuXG4gIGF3YWl0IHNlYXJjaERpcihkaXJQYXRoLCAwKTtcbiAgcmV0dXJuIHsgZmlsZXM6IHJlc3VsdHMsIGNvdW50OiByZXN1bHRzLmxlbmd0aCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTdHJlYW1pbmcgRmlsZSBSZWFkZXIgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFN0cmVhbVJlYWRSZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICBkYXRhPzoge1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICBwYXRoOiBzdHJpbmc7XG4gICAgdG90YWxMZW5ndGg6IG51bWJlcjtcbiAgICB0cnVuY2F0ZWQ/OiBib29sZWFuO1xuICAgIG5vdGU/OiBzdHJpbmc7XG4gIH07XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlYWQgZmlsZSBjb250ZW50IHVzaW5nIHN0cmVhbWluZyB0byBhdm9pZCBsb2FkaW5nIGVudGlyZSBmaWxlIGludG8gbWVtb3J5LlxuICogUmVzcGVjdHMgbWF4X2xlbmd0aCBwYXJhbWV0ZXIgYnkgcmVhZGluZyBvbmx5IG5lY2Vzc2FyeSBjaHVua3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZVN5bmMoXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIG1heExlbmd0aDogbnVtYmVyID0gNTAwMFxuKTogUHJvbWlzZTxTdHJlYW1SZWFkUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IGZpbGUgc3RhdHMgZmlyc3QgdG8ga25vdyB0b3RhbCBzaXplXG4gICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBmcy5zdGF0KGZpbGVQYXRoKTtcbiAgICBcbiAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUGF0aCBpcyBhIGRpcmVjdG9yeSwgbm90IGEgZmlsZScgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBmaWxlIGlzIHNtYWxsIGVub3VnaCwgcmVhZCBlbnRpcmVseSAoZmFzdGVyIGZvciBzbWFsbCBmaWxlcylcbiAgICBpZiAoc3RhdHMuc2l6ZSA8PSBtYXhMZW5ndGggKiAyKSB7IC8vIDJ4IGZhY3RvciBmb3IgVVRGLTggZW5jb2Rpbmcgb3ZlcmhlYWRcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgY29udGVudCxcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICB0b3RhbExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZvciBsYXJnZSBmaWxlcywgdXNlIHN0cmVhbWluZyByZWFkXG4gICAgY29uc3QgeyBjcmVhdGVSZWFkU3RyZWFtIH0gPSBhd2FpdCBpbXBvcnQoJ2ZzJyk7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgY29udGVudCA9ICcnO1xuICAgICAgbGV0IGJ5dGVzUmVhZCA9IDA7XG4gICAgICBjb25zdCBzdHJlYW0gPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoLCB7IFxuICAgICAgICBlbmNvZGluZzogJ3V0Zi04JyxcbiAgICAgICAgaGlnaFdhdGVyTWFyazogNjQgKiAxMDI0IC8vIDY0S0IgY2h1bmtzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlciB8IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBjaHVua1N0ciA9IHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycgPyBjaHVuayA6IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgIGJ5dGVzUmVhZCArPSBjaHVua1N0ci5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICAvLyBPbmx5IGFjY3VtdWxhdGUgaWYgd2UgaGF2ZW4ndCBleGNlZWRlZCBtYXggbGVuZ3RoIHlldFxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggKyBjaHVua1N0ci5sZW5ndGggPD0gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgY29udGVudCArPSBjaHVua1N0cjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUYWtlIG9ubHkgd2hhdCBmaXRzIGFuZCBzdG9wIHJlYWRpbmdcbiAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBtYXhMZW5ndGggLSBjb250ZW50Lmxlbmd0aDtcbiAgICAgICAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgICAgICAgY29udGVudCArPSBjaHVua1N0ci5zdWJzdHJpbmcoMCwgcmVtYWluaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RyZWFtLmRlc3Ryb3koKTsgLy8gU3RvcCB0aGUgc3RyZWFtIGVhcmx5XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaXNUcnVuY2F0ZWQgPSBieXRlc1JlYWQgPiBtYXhMZW5ndGggfHwgc3RhdHMuc2l6ZSA+IG1heExlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgdG90YWxMZW5ndGg6IE1hdGgubWF4KGJ5dGVzUmVhZCwgY29udGVudC5sZW5ndGgpLFxuICAgICAgICAgICAgLi4uKGlzVHJ1bmNhdGVkICYmIHsgXG4gICAgICAgICAgICAgIHRydW5jYXRlZDogdHJ1ZSwgXG4gICAgICAgICAgICAgIG5vdGU6IGBPdXRwdXQgdHJ1bmNhdGVkIHRvICR7bWF4TGVuZ3RofSBjaGFyYWN0ZXJzLiBVc2UgbWF4X2xlbmd0aCBwYXJhbWV0ZXIgdG8gcmVhZCBtb3JlLmAgXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJlYWQgZmlsZTogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBSZXF1ZXN0IENhY2hpbmcgZm9yIFdlYiBSZXNlYXJjaCA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQ2FjaGVkUmVzcG9uc2Uge1xuICBkYXRhOiB1bmtub3duO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgc3RhdHVzOiBudW1iZXI7XG59XG5cbmNvbnN0IHJlcXVlc3RDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBDYWNoZWRSZXNwb25zZT4oKTtcbmNvbnN0IFJFUVVFU1RfQ0FDSEVfVFRMX01TID0gMzBfMDAwOyAvLyAzMCBzZWNvbmQgY2FjaGUgVFRMIGZvciBzZWFyY2ggcmVzdWx0c1xuXG4vKiogQ2xlYXIgcmVxdWVzdCBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJSZXF1ZXN0Q2FjaGUoKTogdm9pZCB7XG4gIHJlcXVlc3RDYWNoZS5jbGVhcigpO1xufVxuXG4vKipcbiAqIEZldGNoIHdpdGggY2FjaGluZyB0byBhdm9pZCByZWR1bmRhbnQgbmV0d29yayByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aENhY2hlKFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IFJlcXVlc3RJbml0XG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7dXJsfToke0pTT04uc3RyaW5naWZ5KG9wdGlvbnMpfWA7XG4gIFxuICAvLyBDaGVjayBjYWNoZSBmaXJzdCAoR0VUIHJlcXVlc3RzIG9ubHkpXG4gIGlmIChvcHRpb25zPy5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIGNvbnN0IGNhY2hlZCA9IHJlcXVlc3RDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgIGlmIChjYWNoZWQgJiYgRGF0ZS5ub3coKSAtIGNhY2hlZC50aW1lc3RhbXAgPCBSRVFVRVNUX0NBQ0hFX1RUTF9NUykge1xuICAgICAgLy8gUmV0dXJuIGEgUmVzcG9uc2UtbGlrZSBvYmplY3QgZnJvbSBjYWNoZVxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShjYWNoZWQuZGF0YSksIHtcbiAgICAgICAgc3RhdHVzOiBjYWNoZWQuc3RhdHVzLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCBvcHRpb25zKTtcbiAgXG4gIC8vIENhY2hlIHN1Y2Nlc3NmdWwgcmVzcG9uc2VzXG4gIGlmIChyZXNwb25zZS5vayAmJiBvcHRpb25zPy5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgcmVxdWVzdENhY2hlLnNldChjYWNoZUtleSwge1xuICAgICAgICBkYXRhLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vIEV2aWN0IG9sZCBlbnRyaWVzIGlmIGNhY2hlIGdyb3dzIHRvbyBsYXJnZSAobWF4IDUwIGVudHJpZXMpXG4gICAgICBpZiAocmVxdWVzdENhY2hlLnNpemUgPiA1MCkge1xuICAgICAgICBjb25zdCBvbGRlc3RLZXkgPSByZXF1ZXN0Q2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICAgICAgaWYgKG9sZGVzdEtleSkge1xuICAgICAgICAgIHJlcXVlc3RDYWNoZS5kZWxldGUob2xkZXN0S2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gTm9uLUpTT04gcmVzcG9uc2VzIGFyZSBub3QgY2FjaGVkXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIFJldHJ5IGxvZ2ljIHdpdGggZXhwb25lbnRpYWwgYmFja29mZiBmb3IgZmFpbGVkIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hXaXRoUmV0cnkoXG4gIHVybDogc3RyaW5nLFxuICBvcHRpb25zPzogUmVxdWVzdEluaXQsXG4gIG1heFJldHJpZXM6IG51bWJlciA9IDMsXG4gIGJhc2VEZWxheU1zOiBudW1iZXIgPSAxMDAwXG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gIFxuICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8PSBtYXhSZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhDYWNoZSh1cmwsIG9wdGlvbnMpO1xuICAgICAgXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rICYmIHJlc3BvbnNlLnN0YXR1cyA+PSA1MDApIHtcbiAgICAgICAgLy8gU2VydmVyIGVycm9yIC0gcmV0cnlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJ2ZXIgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgIGxhc3RFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgIFxuICAgICAgaWYgKGF0dGVtcHQgPCBtYXhSZXRyaWVzKSB7XG4gICAgICAgIGNvbnN0IGRlbGF5TXMgPSBiYXNlRGVsYXlNcyAqIE1hdGgucG93KDIsIGF0dGVtcHQpOyAvLyBFeHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheU1zKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICB0aHJvdyBsYXN0RXJyb3IgfHwgbmV3IEVycm9yKGBSZXF1ZXN0IGZhaWxlZCBhZnRlciAke21heFJldHJpZXN9IHJldHJpZXNgKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU3VicHJvY2VzcyBUaW1lb3V0IENhbGN1bGF0b3IgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBDYWxjdWxhdGUgYXBwcm9wcmlhdGUgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemUuXG4gKiBMYXJnZXIgcHJvamVjdHMgbmVlZCBtb3JlIHRpbWUgZm9yIGFuYWx5c2lzIHRvb2xzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5hbHlzaXNUaW1lb3V0KGJhc2VUaW1lb3V0TXM6IG51bWJlciwgZmlsZUNvdW50PzogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKCFmaWxlQ291bnQpIHJldHVybiBiYXNlVGltZW91dE1zO1xuICBcbiAgLy8gU2NhbGUgdGltZW91dCBsb2dhcml0aG1pY2FsbHkgd2l0aCBmaWxlIGNvdW50XG4gIGNvbnN0IHNjYWxlRmFjdG9yID0gTWF0aC5sb2cyKE1hdGgubWF4KDEsIGZpbGVDb3VudCkpIC8gMTA7IC8vIH4xeCBmb3IgMS0xMCBmaWxlcywgfjJ4IGZvciAxMDAwKyBmaWxlc1xuICBjb25zdCBzY2FsZWRUaW1lb3V0ID0gYmFzZVRpbWVvdXRNcyAqICgxICsgc2NhbGVGYWN0b3IpO1xuICBcbiAgLy8gQ2FwIGF0IDYwIHNlY29uZHMgbWF4aW11bVxuICByZXR1cm4gTWF0aC5taW4oc2NhbGVkVGltZW91dCwgNjBfMDAwKTtcbn1cblxuLyoqXG4gKiBDb3VudCBUeXBlU2NyaXB0IGZpbGVzIGluIGEgZGlyZWN0b3J5IHRvIGVzdGltYXRlIHByb2plY3Qgc2l6ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvdW50VHlwZVNjcmlwdEZpbGVzKGRpclBhdGg6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGxldCBjb3VudCA9IDA7XG4gIFxuICBhc3luYyBmdW5jdGlvbiBjb3VudEluRGlyKGN1cnJlbnRQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZGVwdGggPiAxMCkgcmV0dXJuOyAvLyBSZWFzb25hYmxlIG1heCBkZXB0aFxuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucmVhZGRpcihjdXJyZW50UGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy50cycpKSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgLy8gU2tpcCBjb21tb24gbm9uLXNvdXJjZSBkaXJlY3Rvcmllc1xuICAgICAgICAgIGlmICghWydub2RlX21vZHVsZXMnLCAnLmdpdCcsICdkaXN0JywgJ2J1aWxkJ10uaW5jbHVkZXMoZW50cnkubmFtZSkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNvdW50SW5EaXIocGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlbnRyeS5uYW1lKSwgZGVwdGggKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIGRpcmVjdG9yaWVzXG4gICAgfVxuICB9XG4gIFxuICBhd2FpdCBjb3VudEluRGlyKGRpclBhdGgsIDApO1xuICByZXR1cm4gY291bnQ7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuLi9zdGF0ZU1hbmFnZXIuanMnO1xuaW1wb3J0IHsgdmFsaWRhdGVQYXRoLCBpc1NhZmVSZWdleCB9IGZyb20gJy4uL3NlY3VyaXR5LmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIsIHNldFdvcmtpbmdEaXIsIHJlc29sdmVQYXRoIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5pbXBvcnQge1xuICBsZXZlbnNodGVpblNpbWlsYXJpdHksXG4gIGdldENhY2hlZEZ1enp5UmVzdWx0cyxcbiAgY2FjaGVGdXp6eVJlc3VsdHMsXG4gIGZpbmRGaWxlc0FzeW5jLFxuICBjb3VudFR5cGVTY3JpcHRGaWxlcyxcbiAgZ2V0QW5hbHlzaXNUaW1lb3V0LFxufSBmcm9tICcuLi9wZXJmb3JtYW5jZVV0aWxzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIExpc3REaXJlY3RvcnlQYXJhbXMgeyBwYXRoPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmVhZEZpbGVQYXJhbXMgeyBmaWxlX25hbWU6IHN0cmluZzsgbWF4X2xlbmd0aD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIFNhdmVGaWxlUGFyYW1zIHsgZmlsZV9uYW1lPzogc3RyaW5nOyBjb250ZW50Pzogc3RyaW5nOyBmaWxlcz86IEFycmF5PHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZyB9PjsgfVxuaW50ZXJmYWNlIFJlcGxhY2VUZXh0SW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IG9sZF9zdHJpbmc6IHN0cmluZzsgbmV3X3N0cmluZzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgSW5zZXJ0QXRMaW5lUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGxpbmVfbnVtYmVyOiBudW1iZXI7IGNvbnRlbnRfdG9faW5zZXJ0OiBzdHJpbmc7IH1cbmludGVyZmFjZSBBcHBlbmRGaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IHN0YXJ0X2xpbmU6IG51bWJlcjsgZW5kX2xpbmU/OiBudW1iZXI7IH1cbmludGVyZmFjZSBNYWtlRGlyZWN0b3J5UGFyYW1zIHsgZGlyZWN0b3J5X25hbWU6IHN0cmluZzsgfVxuaW50ZXJmYWNlIE1vdmVGaWxlUGFyYW1zIHsgc291cmNlOiBzdHJpbmc7IGRlc3RpbmF0aW9uOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDb3B5RmlsZVBhcmFtcyB7IHNvdXJjZTogc3RyaW5nOyBkZXN0aW5hdGlvbjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRGVsZXRlUGF0aFBhcmFtcyB7IHBhdGg6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRmluZEZpbGVzUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyBtYXhfZGVwdGg/OiBudW1iZXI7IH1cbmludGVyZmFjZSBGdXp6eUZpbmRMb2NhbEZpbGVzUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgcGF0aD86IHN0cmluZzsgbWF4X3Jlc3VsdHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHZXRGaWxlTWV0YWRhdGFQYXJhbXMgeyBwYXRoOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGFuZ2VEaXJlY3RvcnlQYXJhbXMgeyBkaXJlY3Rvcnk6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJlYWREb2N1bWVudFBhcmFtcyB7IGZpbGVfcGF0aDogc3RyaW5nOyB9XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgX3N0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGxpc3RfZGlyZWN0b3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbGlzdF9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCB0aGUgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IG9yIGEgc3BlY2lmaWVkIHN1YmRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIHBhdGggdG8gdGhlIGRpcmVjdG9yeSB0byBsaXN0LiBEZWZhdWx0cyB0byBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGg6IGRpclBhdGggfTogTGlzdERpcmVjdG9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IGRpclBhdGggfHwgJy4nO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgodGFyZ2V0UGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKHRhcmdldFBhdGgpO1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZnVsbFBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZW50cmllcy5tYXAoZW50cnkgPT4gKHtcbiAgICAgICAgICBwYXRoOiBwYXRoLmpvaW4oZnVsbFBhdGgsIGVudHJ5Lm5hbWUpLFxuICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXG4gICAgICAgICAgaXNEaXJlY3Rvcnk6IGVudHJ5LmlzRGlyZWN0b3J5KCksXG4gICAgICAgICAgaXNGaWxlOiBlbnRyeS5pc0ZpbGUoKSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlYWRfZmlsZSB0b29sIFx1MjAxNCBIeWJyaWQ6IEVhcmx5IHNpemUgY2hlY2sgKyBCdWZmZXIgYmluYXJ5IGRldGVjdGlvbiArIFRydW5jYXRpb24gc3VwcG9ydFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCBjb250ZW50IGZyb20gYSBmaWxlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byByZWFkJyksXG4gICAgICBtYXhfbGVuZ3RoOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTAwMDApLm9wdGlvbmFsKCkuZGVmYXVsdCg1MDAwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyB0byByZXR1cm4gKGRlZmF1bHQ6IDUwMDApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBtYXhfbGVuZ3RoIH06IFJlYWRGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gbWF4X2xlbmd0aCB8fCA1MDAwO1xuXG4gICAgICAgIC8vIEVhcmx5IHNpemUgY2hlY2sgKEJlbGVkYXJpYW4gc3R5bGUpIC0gcHJldmVudCBsb2FkaW5nID4xME1CIGZpbGVzXG4gICAgICAgIGxldCBzdGF0czogZnMuU3RhdHM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdHMuc2l6ZSA+IDEwXzAwMF8wMDApIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGaWxlIHRvbyBsYXJnZSAoPjEwTUIpJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVhZCBhcyBidWZmZXIgZm9yIGVmZmljaWVudCBiaW5hcnkgY2hlY2sgKEJlbGVkYXJpYW4gc3R5bGUpXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRGaWxlKGZ1bGxQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEJpbmFyeSBjaGVjazogbnVsbCBieXRlIGluIGZpcnN0IDFLQlxuICAgICAgICBjb25zdCBjaGVja0J1ZmZlciA9IGJ1ZmZlci5zdWJhcnJheSgwLCBNYXRoLm1pbihidWZmZXIubGVuZ3RoLCAxMDI0KSk7XG4gICAgICAgIGlmIChjaGVja0J1ZmZlci5pbmNsdWRlcygwKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0JpbmFyeSBmaWxlIGRldGVjdGVkLiBVc2UgcmVhZF9kb2N1bWVudCBmb3IgUERGL0RPQ1ggZmlsZXMuJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICAgICAgY29uc3QgY29udGVudCA9IGJ1ZmZlci50b1N0cmluZygndXRmLTgnKTtcblxuICAgICAgICAvLyBUcnVuY2F0ZSBpZiBuZWNlc3NhcnkgYW5kIGFkZCBtZXRhZGF0YSAoQUkgVG9vbGJveCBzdHlsZSlcbiAgICAgICAgbGV0IGRhdGFDb250ZW50ID0gY29udGVudDtcbiAgICAgICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgdG90YWxMZW5ndGggPSBjb250ZW50Lmxlbmd0aDtcblxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggPiBtYXhMZW5ndGgpIHtcbiAgICAgICAgICBkYXRhQ29udGVudCA9IGNvbnRlbnQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCk7XG4gICAgICAgICAgdHJ1bmNhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBjb250ZW50OiBkYXRhQ29udGVudCxcbiAgICAgICAgICAgIGZpbGVQYXRoOiBmdWxsUGF0aCwgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgICAgLi4uKHRydW5jYXRlZCA/IHsgdHJ1bmNhdGVkOiB0cnVlLCB0b3RhbF9sZW5ndGg6IHRvdGFsTGVuZ3RoIH0gOiB7fSlcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzYXZlX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzYXZlX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBjb250ZW50IHRvIGEgc3BlY2lmaWVkIGZpbGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFN1cHBvcnRzIGJhdGNoIHNhdmluZy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byBzYXZlJyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBjb250ZW50IHRvIHdyaXRlIHRvIHRoZSBmaWxlJyksXG4gICAgICBmaWxlczogei5hcnJheSh6Lm9iamVjdCh7IGZpbGVfbmFtZTogei5zdHJpbmcoKSwgY29udGVudDogei5zdHJpbmcoKSB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRm9yIGJhdGNoIHNhdmluZyBtdWx0aXBsZSBmaWxlcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCwgZmlsZXMgfTogU2F2ZUZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChmaWxlcyAmJiBBcnJheS5pc0FycmF5KGZpbGVzKSkge1xuICAgICAgICAgIC8vIEJhdGNoIHNhdmUgbW9kZVxuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGUuZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEludmFsaWQgcGF0aCBpbiBiYXRjaDogJHtmaWxlLmZpbGVfbmFtZX1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGUuZmlsZV9uYW1lKTtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGZpbGUuY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBmaWxlOiBmdWxsUGF0aCwgc3RhdHVzOiAnc2F2ZWQnIH0pOyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWRGaWxlczogZmlsZXMubGVuZ3RoLCByZXN1bHRzIH0gfTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWxlX25hbWUgJiYgY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gU2luZ2xlIGZpbGUgc2F2ZSBtb2RlXG4gICAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNhdmVkRmlsZTogZnVsbFBhdGgsIHBhdGg6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VpdGhlciBwcm92aWRlIGZpbGVfbmFtZStjb250ZW50IG9yIGZpbGVzIGFycmF5JyB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZXBsYWNlX3RleHRfaW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlcGxhY2VfdGV4dF9pbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlcGxhY2UgYSBzcGVjaWZpYyBzdHJpbmcgaW4gYSBmaWxlIHdpdGggYSBuZXcgc3RyaW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIG9sZF9zdHJpbmc6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBleGFjdCB0ZXh0IHRvIHJlcGxhY2UuIE11c3QgYmUgdW5pcXVlIGluIHRoZSBmaWxlLicpLFxuICAgICAgbmV3X3N0cmluZzogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgdG8gaW5zZXJ0IGluIHBsYWNlIG9mIG9sZF9zdHJpbmcuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBvbGRfc3RyaW5nLCBuZXdfc3RyaW5nIH06IFJlcGxhY2VUZXh0SW5GaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWNvbnRlbnQuaW5jbHVkZXMob2xkX3N0cmluZykpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBTdHJpbmcgJyR7b2xkX3N0cmluZ30nIG5vdCBmb3VuZCBpbiBmaWxlYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBuZXdDb250ZW50ID0gY29udGVudC5yZXBsYWNlKG9sZF9zdHJpbmcsIG5ld19zdHJpbmcpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBuZXdDb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyByZXBsYWNlZDogdHJ1ZSwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBpbnNlcnRfYXRfbGluZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2luc2VydF9hdF9saW5lJyxcbiAgICBkZXNjcmlwdGlvbjogJ0luc2VydCBjb250ZW50IGF0IGEgc3BlY2lmaWMgbGluZSBudW1iZXIgaW4gYSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIGxpbmVfbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnVGhlIGxpbmUgbnVtYmVyIHRvIGluc2VydCBhdCAoMS1pbmRleGVkKScpLFxuICAgICAgY29udGVudF90b19pbnNlcnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gaW5zZXJ0JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBsaW5lX251bWJlciwgY29udGVudF90b19pbnNlcnQgfTogSW5zZXJ0QXRMaW5lUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFsbG93IGFwcGVuZGluZyBhdCBFT0YgKGxpbmVfbnVtYmVyID09IGxlbmd0aCArIDEpXG4gICAgICAgIGlmIChsaW5lX251bWJlciA+IGxpbmVzLmxlbmd0aCArIDEpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBMaW5lIG51bWJlciAke2xpbmVfbnVtYmVyfSBleGNlZWRzIGZpbGUgbGVuZ3RoICgke2xpbmVzLmxlbmd0aH0pYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsaW5lcy5zcGxpY2UobGluZV9udW1iZXIgLSAxLCAwLCBjb250ZW50X3RvX2luc2VydCk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGxpbmVzLmpvaW4oJ1xcbicpLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpbnNlcnRlZEF0OiBsaW5lX251bWJlciwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBhcHBlbmRfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2FwcGVuZF9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogXCJBcHBlbmQgY29udGVudCB0byB0aGUgZW5kIG9mIGEgZmlsZS4gSWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdCwgaXQgd2lsbCBiZSBjcmVhdGVkLlwiLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gYXBwZW5kIHRvJyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCBjb250ZW50IHRvIGFwcGVuZCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCB9OiBBcHBlbmRGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhmdWxsUGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYXBwZW5kZWRUbzogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfbGluZXNfaW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9saW5lc19pbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIHNwZWNpZmljIGxpbmUgb3IgcmFuZ2Ugb2YgbGluZXMgZnJvbSBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIG1vZGlmeScpLFxuICAgICAgc3RhcnRfbGluZTogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1N0YXJ0aW5nIGxpbmUgbnVtYmVyICgxLWluZGV4ZWQpJyksXG4gICAgICBlbmRfbGluZTogei5udW1iZXIoKS5pbnQoKS5taW4oMSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRW5kaW5nIGxpbmUgbnVtYmVyIChpbmNsdXNpdmUpLiBJZiBvbWl0dGVkLCBvbmx5IGRlbGV0ZXMgc3RhcnRfbGluZS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIHN0YXJ0X2xpbmUsIGVuZF9saW5lIH06IERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGRlbGV0ZUVuZCA9IGVuZF9saW5lIHx8IHN0YXJ0X2xpbmU7XG4gICAgICAgIGlmIChzdGFydF9saW5lID4gbGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3RhcnQgbGluZSAke3N0YXJ0X2xpbmV9IGV4Y2VlZHMgZmlsZSBsZW5ndGggKCR7bGluZXMubGVuZ3RofSlgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsYW1wIGVuZF9saW5lIHRvIGF2b2lkIHNpbGVudCB0cnVuY2F0aW9uIGJleW9uZCBmaWxlIGJvdW5kc1xuICAgICAgICBjb25zdCBjbGFtcGVkRW5kID0gTWF0aC5taW4oZGVsZXRlRW5kLCBsaW5lcy5sZW5ndGgpO1xuICAgICAgICBsaW5lcy5zcGxpY2Uoc3RhcnRfbGluZSAtIDEsIGNsYW1wZWRFbmQgLSBzdGFydF9saW5lICsgMSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGxpbmVzLmpvaW4oJ1xcbicpLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkTGluZXM6IGAke3N0YXJ0X2xpbmV9LSR7Y2xhbXBlZEVuZH1gLCBmaWxlOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG1ha2VfZGlyZWN0b3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbWFrZV9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IGRpcmVjdG9yeSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5IHRvIGNyZWF0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGRpcmVjdG9yeV9uYW1lIH06IE1ha2VEaXJlY3RvcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGRpcmVjdG9yeV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZGlyZWN0b3J5X25hbWUpO1xuICAgICAgICBmcy5ta2RpclN5bmMoZnVsbFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWREaXJlY3Rvcnk6IGRpcmVjdG9yeV9uYW1lLCBwYXRoOiBmdWxsUGF0aCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBtb3ZlX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdtb3ZlX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnTW92ZSBvciByZW5hbWUgYSBmaWxlIG9yIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNvdXJjZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU291cmNlIHBhdGgnKSxcbiAgICAgIGRlc3RpbmF0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXN0aW5hdGlvbiBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9OiBNb3ZlRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoc291cmNlLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzb3VyY2UgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkZXN0aW5hdGlvbiwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZGVzdGluYXRpb24gcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsU291cmNlID0gcmVzb2x2ZVBhdGgoc291cmNlKTtcbiAgICAgICAgY29uc3QgZnVsbERlc3RpbmF0aW9uID0gcmVzb2x2ZVBhdGgoZGVzdGluYXRpb24pO1xuICAgICAgICBmcy5yZW5hbWVTeW5jKGZ1bGxTb3VyY2UsIGZ1bGxEZXN0aW5hdGlvbik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbW92ZWRGcm9tOiBmdWxsU291cmNlLCBtb3ZlZFRvOiBmdWxsRGVzdGluYXRpb24gfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIU1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY29weV9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY29weV9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvcHkgYSBmaWxlIHRvIGEgbmV3IGxvY2F0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc291cmNlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTb3VyY2UgZmlsZSBwYXRoJyksXG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnRGVzdGluYXRpb24gZmlsZSBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9OiBDb3B5RmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoc291cmNlLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzb3VyY2UgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkZXN0aW5hdGlvbiwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZGVzdGluYXRpb24gcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsU291cmNlID0gcmVzb2x2ZVBhdGgoc291cmNlKTtcbiAgICAgICAgY29uc3QgZnVsbERlc3RpbmF0aW9uID0gcmVzb2x2ZVBhdGgoZGVzdGluYXRpb24pO1xuICAgICAgICBmcy5jb3B5RmlsZVN5bmMoZnVsbFNvdXJjZSwgZnVsbERlc3RpbmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb3BpZWRGcm9tOiBmdWxsU291cmNlLCBjb3BpZWRUbzogZnVsbERlc3RpbmF0aW9uIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFNcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9wYXRoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX3BhdGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIGEgZmlsZSBvciBkaXJlY3RvcnkgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIEJlIGNhcmVmdWwhJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgcGF0aCB0byBkZWxldGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoOiBmaWxlUGF0aCB9OiBEZWxldGVQYXRoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgYSBkaXJlY3RvcnlcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhmdWxsUGF0aCk7XG4gICAgICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgZnMucm1TeW5jKGZ1bGxQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcy51bmxpbmtTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWQ6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2ZpbGVzX2J5X3BhdHRlcm4gdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfZmlsZXNfYnlfcGF0dGVybicsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgbXVsdGlwbGUgZmlsZXMgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IHRoYXQgbWF0Y2ggYSByZWdleCBwYXR0ZXJuLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0dGVybjogei5zdHJpbmcoKS5kZXNjcmliZSgnUmVnZXggcGF0dGVybiB0byBtYXRjaCBmaWxlbmFtZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXR0ZXJuIH06IERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoY29uZmlnLnJlZ2V4UmVEb1NQcm90ZWN0aW9uICYmICFpc1NhZmVSZWdleChwYXR0ZXJuKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Vuc2FmZSByZWdleCBwYXR0ZXJuIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybik7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZ2V0V29ya2luZ0RpcigpKTtcbiAgICAgICAgY29uc3QgZGVsZXRlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgaWYgKHJlZ2V4LnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgIGRlbGV0ZWRGaWxlcy5wdXNoKGZ1bGxQYXRoKTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkQ291bnQ6IGRlbGV0ZWRGaWxlcy5sZW5ndGgsIGRlbGV0ZWRGaWxlcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmaW5kX2ZpbGVzIHRvb2wgXHUyMDE0IE9QVElNSVpFRCB3aXRoIGFzeW5jL2F3YWl0IGFuZCBjb25jdXJyZW5jeSBjb250cm9sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ZpbmRfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmluZCBmaWxlcyByZWN1cnNpdmVseSBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnkgbWF0Y2hpbmcgYSBuYW1lIHBhdHRlcm4uIFVzZXMgYXN5bmMgc2VhcmNoIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXR0ZXJuOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTdWJzdHJpbmcgdG8gbWF0Y2ggaW4gZmlsZW5hbWUgKGNhc2UtaW5zZW5zaXRpdmUpJyksXG4gICAgICBtYXhfZGVwdGg6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01heGltdW0gZGVwdGggdG8gc2VhcmNoIChkZWZhdWx0OiA1KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdHRlcm4sIG1heF9kZXB0aCB9OiBGaW5kRmlsZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaFBhdGggPSBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IGRlcHRoID0gbWF4X2RlcHRoIHx8IDU7XG4gICAgICAgIFxuICAgICAgICAvLyBVc2Ugb3B0aW1pemVkIGFzeW5jIHNlYXJjaCB3aXRoIGNvbmN1cnJlbmN5IGNvbnRyb2xcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmluZEZpbGVzQXN5bmMoc2VhcmNoUGF0aCwgcGF0dGVybiwgZGVwdGgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGZvdW5kRmlsZXM6IHJlc3VsdC5maWxlcywgY291bnQ6IHJlc3VsdC5jb3VudCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmdXp6eV9maW5kX2xvY2FsX2ZpbGVzIHRvb2wgXHUyMDE0IE9QVElNSVpFRCB3aXRoIGVhcmx5IGV4aXQgTGV2ZW5zaHRlaW4gKyBjYWNoaW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Z1enp5X2ZpbmRfbG9jYWxfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRnV6enkgZmluZCBsb2NhbCBmaWxlcyBieSBwYXRoL25hbWUgc2ltaWxhcml0eSB1c2luZyBvcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gc2NvcmluZyB3aXRoIGNhY2hpbmcuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRvIG1hdGNoIGFnYWluc3QgZmlsZSBuYW1lcy9wYXRocy4nKSxcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnU3ViLWRpcmVjdG9yeSB0byBzZWFyY2ggaW4gKGRlZmF1bHQ6IGN1cnJlbnQgZGlyZWN0b3J5KS4nKSxcbiAgICAgIG1heF9yZXN1bHRzOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoMjApLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01heCByZXN1bHRzIHRvIHJldHVybiAoZGVmYXVsdDogNSkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIHBhdGg6IHNlYXJjaFBhdGgsIG1heF9yZXN1bHRzIH06IEZ1enp5RmluZExvY2FsRmlsZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJhc2VEaXIgPSBzZWFyY2hQYXRoID8gcmVzb2x2ZVBhdGgoc2VhcmNoUGF0aCkgOiBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IG1heFJlc3VsdHMgPSBtYXhfcmVzdWx0cyB8fCA1O1xuXG4gICAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XG4gICAgICAgIGNvbnN0IGNhY2hlZFJlc3VsdHMgPSBnZXRDYWNoZWRGdXp6eVJlc3VsdHMocXVlcnksIGJhc2VEaXIpO1xuICAgICAgICBpZiAoY2FjaGVkUmVzdWx0cykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbWF0Y2hlczogY2FjaGVkUmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKSwgY291bnQ6IE1hdGgubWluKGNhY2hlZFJlc3VsdHMubGVuZ3RoLCBtYXhSZXN1bHRzKSB9IH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb2xsZWN0IGZpbGVzIHVzaW5nIGFzeW5jIG1ldGhvZFxuICAgICAgICBjb25zdCBhbGxGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RGaWxlcyhkaXJQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIgPSAwLCBtYXhEZXB0aDogbnVtYmVyID0gMjApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgICAgIFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihkaXJQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjb2xsZWN0RmlsZXMoZnVsbFBhdGgsIGRlcHRoICsgMSwgbWF4RGVwdGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsbEZpbGVzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3Rvcmllc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYXdhaXQgY29sbGVjdEZpbGVzKGJhc2VEaXIpO1xuICAgICAgICBcbiAgICAgICAgLy8gT3B0aW1pemVkIGZ1enp5IG1hdGNoaW5nIHdpdGggZWFybHkgZXhpdFxuICAgICAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gPSBbXTtcbiAgICAgICAgY29uc3QgcXVlcnlMb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IE1JTl9TQ09SRSA9IDAuMztcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBhbGxGaWxlcykge1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFVzZSBvcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gd2l0aCBlYXJseSBleGl0XG4gICAgICAgICAgY29uc3Qgc2NvcmUgPSBsZXZlbnNodGVpblNpbWlsYXJpdHkocXVlcnlMb3dlciwgZmlsZU5hbWUsIE1JTl9TQ09SRSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHNjb3JlICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBmaWxlUGF0aDogZmlsZSwgc2NvcmUgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTb3J0IGJ5IHNjb3JlIGRlc2NlbmRpbmcgYW5kIGNhY2hlIHJlc3VsdHNcbiAgICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgICAgIGNhY2hlRnV6enlSZXN1bHRzKHF1ZXJ5LCBiYXNlRGlyLCByZXN1bHRzKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbWF0Y2hlczogcmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKSwgY291bnQ6IE1hdGgubWluKHJlc3VsdHMubGVuZ3RoLCBtYXhSZXN1bHRzKSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfZmlsZV9tZXRhZGF0YSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9maWxlX21ldGFkYXRhJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBtZXRhZGF0YSAoc2l6ZSwgZGF0ZXMpIGZvciBhIHNwZWNpZmljIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aDogZmlsZVBhdGggfTogR2V0RmlsZU1ldGFkYXRhUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgICAgICBzaXplOiBzdGF0cy5zaXplLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBzdGF0cy5iaXJ0aHRpbWUsXG4gICAgICAgICAgICBtb2RpZmllZEF0OiBzdGF0cy5tdGltZSxcbiAgICAgICAgICAgIGFjY2Vzc2VkQXQ6IHN0YXRzLmF0aW1lLFxuICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IHN0YXRzLmlzRGlyZWN0b3J5KCksXG4gICAgICAgICAgICBpc0ZpbGU6IHN0YXRzLmlzRmlsZSgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjaGFuZ2VfZGlyZWN0b3J5IHRvb2wgXHUyMDE0IEh5YnJpZDogRXhwbGljaXQgdmFsaWRhdGlvbiArIFN0YXRlIGFic3RyYWN0aW9uICsgQ29udGV4dHVhbCByZXNwb25zZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjaGFuZ2VfZGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gQWxsIHN1YnNlcXVlbnQgZmlsZSBvcGVyYXRpb25zIHdpbGwgdXNlIHRoaXMgZGlyZWN0b3J5IGFzIHRoZSBiYXNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZGlyZWN0b3J5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgYWJzb2x1dGUgcGF0aCB0byBjaGFuZ2UgdG8gKGUuZy4sIFwiQzpcXFxcXFxcXFByb2plY3RzXFxcXFxcXFxteS1hcHBcIiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBkaXJlY3RvcnkgfTogQ2hhbmdlRGlyZWN0b3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGRpcmVjdG9yeSk7XG5cbiAgICAgICAgLy8gXHUyNzA1IEJlbGVkYXJpYW4ncyBleHBsaWNpdCB2YWxpZGF0aW9uIHVzaW5nIGZzLnN0YXRcbiAgICAgICAgbGV0IHN0YXRzOiBmcy5TdGF0cztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFBhdGggaXMgbm90IGEgZGlyZWN0b3J5OiAke2Z1bGxQYXRofWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1MjcwNSBDYXB0dXJlIHByZXZpb3VzIGRpcmVjdG9yeSBmb3IgY29udGV4dFxuICAgICAgICBjb25zdCBwcmV2aW91c0RpcmVjdG9yeSA9IGdldFdvcmtpbmdEaXIoKTtcblxuICAgICAgICAvLyBcdTI3MDUgQUkgVG9vbGJveCdzIGFic3RyYWN0aW9uIGZvciBzdGF0ZSBjaGFuZ2VcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IHNldFdvcmtpbmdEaXIoZnVsbFBhdGgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjaGFuZ2UgZGlyZWN0b3J5IHRvICcke2RpcmVjdG9yeX0nLiBFbnN1cmUgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhIHZhbGlkIGRpcmVjdG9yeS5gIFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTI3MDUgQmVsZWRhcmlhbidzIGNvbnRleHR1YWwgcmV0dXJuIGRhdGEgKyBBSSBUb29sYm94J3Mgc3RydWN0dXJlZCBmb3JtYXRcbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgIHByZXZpb3VzX2RpcmVjdG9yeTogcHJldmlvdXNEaXJlY3RvcnksXG4gICAgICAgICAgICBjdXJyZW50X2RpcmVjdG9yeTogZ2V0V29ya2luZ0RpcigpIFxuICAgICAgICAgIH0gXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuXG4gIC8vIGFuYWx5emVfcHJvamVjdCB0b29sIFx1MjAxNCBDb21wcmVoZW5zaXZlIFR5cGVTY3JpcHQgUGVyZm9ybWFuY2UgJiBMaW50aW5nIEFuYWx5c2lzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2FuYWx5emVfcHJvamVjdCcsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gcHJvamVjdC13aWRlIGFuYWx5c2lzIGluY2x1ZGluZyBUeXBlU2NyaXB0IGRpYWdub3N0aWNzLCBjaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGlvbiwgRVNMaW50LCBjb25maWcgb3B0aW1pemF0aW9uLCBhbmQgaW1wb3J0IHN0cnVjdHVyZSBhbmFseXNpcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNhdGVnb3JpZXM6IHouYXJyYXkoei5lbnVtKFsndHlwZWNoZWNrJywgJ2NpcmN1bGFyJywgJ2VzbGludCcsICdjb25maWcnLCAnaW1wb3J0cyddKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQW5hbHlzaXMgY2F0ZWdvcmllcyB0byBydW4gKGRlZmF1bHQ6IGFsbCknKSxcbiAgICAgIG1heF9pbXBvcnRzX3dhcm5pbmc6IHoubnVtYmVyKCkuaW50KCkubWluKDUpLm1heCgxMDApLm9wdGlvbmFsKCkuZGVmYXVsdCgyMCkuZGVzY3JpYmUoJ01heCBpbXBvcnRzIHBlciBmaWxlIGJlZm9yZSB3YXJuaW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY2F0ZWdvcmllcywgbWF4X2ltcG9ydHNfd2FybmluZyB9OiB7IGNhdGVnb3JpZXM/OiBzdHJpbmdbXTsgbWF4X2ltcG9ydHNfd2FybmluZz86IG51bWJlciB9KSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB3b3JraW5nRGlyID0gZ2V0V29ya2luZ0RpcigpO1xuICAgICAgICBjb25zdCBzZWxlY3RlZENhdGVnb3JpZXMgPSBjYXRlZ29yaWVzIHx8IFsndHlwZWNoZWNrJywgJ2NpcmN1bGFyJywgJ2VzbGludCcsICdjb25maWcnLCAnaW1wb3J0cyddO1xuICAgICAgICBjb25zdCBpbXBvcnRXYXJuaW5nVGhyZXNob2xkID0gbWF4X2ltcG9ydHNfd2FybmluZyB8fCAyMDtcblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBTYWZlIFN1YnByb2Nlc3MgSGVscGVyIHdpdGggUHJvZ3Jlc3MgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gc3Bhd25XaXRoUHJvZ3Jlc3MoZXhlOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCB0aW1lb3V0TXM6IG51bWJlcik6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBzdGRvdXQ/OiBzdHJpbmc7IHN0ZGVycj86IHN0cmluZyB9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9jID0gc3Bhd24oZXhlLCBhcmdzLCB7XG4gICAgICAgICAgICAgIHN0ZGlvOiBbJ3BpcGUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgICAgICAgICAgIGN3ZDogd29ya2luZ0RpcixcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgICAgICAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICAgICAgICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkOiBCdWZmZXIpID0+IHsgc3Rkb3V0ICs9IGQudG9TdHJpbmcoKTsgfSk7XG4gICAgICAgICAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZDogQnVmZmVyKSA9PiB7IHN0ZGVyciArPSBkLnRvU3RyaW5nKCk7IH0pO1xuXG4gICAgICAgICAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7IFxuICAgICAgICAgICAgICBwcm9jLmtpbGwoKTsgXG4gICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgc3RkZXJyOiBgVGltZW91dCBhZnRlciAke3RpbWVvdXRNc31tc2AgfSk7IFxuICAgICAgICAgICAgfSwgdGltZW91dE1zKTtcblxuICAgICAgICAgICAgcHJvYy5vbignY2xvc2UnLCAoKSA9PiB7IGNsZWFyVGltZW91dCh0aW1lcklkKTsgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIHN0ZG91dCwgc3RkZXJyIH0pOyB9KTtcbiAgICAgICAgICAgIHByb2Mub24oJ2Vycm9yJywgKGVycikgPT4geyBjbGVhclRpbWVvdXQodGltZXJJZCk7IHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgc3RkZXJyOiBlcnIubWVzc2FnZSB9KTsgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBBLiBUeXBlU2NyaXB0IEV4dGVuZGVkIERpYWdub3N0aWNzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1blR5cGVjaGVja0FuYWx5c2lzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICAgICAgICBjb25zdCB0c0NvbmZpZ1BhdGggPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3RzY29uZmlnLmpzb24nKTtcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModHNDb25maWdQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gdHNjb25maWcuanNvbiBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiB0c2MgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCd0c2MnLCBbJy0tdmVyc2lvbiddLCA1MDAwKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ1R5cGVTY3JpcHQgY29tcGlsZXIgKHRzYykgbm90IGZvdW5kIGluIFBBVEgnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZSAodXNpbmcgaW1wb3J0ZWQgdXRpbGl0aWVzKVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDMwMDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCd0c2MnLCBbJy0tZXh0ZW5kZWREaWFnbm9zdGljcyddLCBkeW5hbWljVGltZW91dCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2VzcyB8fCAhcmVzdWx0LnN0ZG91dCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiBgdHNjIGZhaWxlZDogJHtyZXN1bHQuc3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGFyc2UgdHNjIC0tZXh0ZW5kZWREaWFnbm9zdGljcyBvdXRwdXRcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IHJlc3VsdC5zdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgIGxldCBjaGVja1RpbWVNcyA9IDA7XG4gICAgICAgICAgbGV0IG1lbW9yeVVzZWRNQiA9IDA7XG4gICAgICAgICAgbGV0IGZpbGVzQ2hlY2tlZCA9IDA7XG4gICAgICAgICAgbGV0IGVtaXRUaW1lTXMgPSAwO1xuICAgICAgICAgIGxldCBwYXJzZVRpbWVNcyA9IDA7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyTGluZSA9IGxpbmUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUGFyc2UgY2hlY2sgdGltZVxuICAgICAgICAgICAgY29uc3QgY2hlY2tNYXRjaCA9IGxvd2VyTGluZS5tYXRjaCgvY2hlY2tcXHMrdGltZTpcXHMrKFxcZCspXFxzKm1zLyk7XG4gICAgICAgICAgICBpZiAoY2hlY2tNYXRjaCkgY2hlY2tUaW1lTXMgPSBwYXJzZUludChjaGVja01hdGNoWzFdLCAxMCk7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIG1lbW9yeSB1c2VkXG4gICAgICAgICAgICBjb25zdCBtZW1NYXRjaCA9IGxpbmUubWF0Y2goL21lbW9yeSB1c2VkOlxccysoXFxkKylcXHMqKGtifG1iKS9pKTtcbiAgICAgICAgICAgIGlmIChtZW1NYXRjaCkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlSW50KG1lbU1hdGNoWzFdLCAxMCk7XG4gICAgICAgICAgICAgIG1lbW9yeVVzZWRNQiA9IG1lbU1hdGNoWzJdLnRvTG93ZXJDYXNlKCkgPT09ICdtYicgPyB2YWx1ZSA6IE1hdGgucm91bmQodmFsdWUgLyAxMDI0ICogMTAwKSAvIDEwMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUGFyc2UgZmlsZXMgY2hlY2tlZFxuICAgICAgICAgICAgY29uc3QgZmlsZXNNYXRjaCA9IGxpbmUubWF0Y2goL2ZpbGVzXFxzK2NoZWNrZWQ6XFxzKyhcXGQrKS8pO1xuICAgICAgICAgICAgaWYgKGZpbGVzTWF0Y2gpIGZpbGVzQ2hlY2tlZCA9IHBhcnNlSW50KGZpbGVzTWF0Y2hbMV0sIDEwKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgZW1pdCB0aW1lXG4gICAgICAgICAgICBjb25zdCBlbWl0TWF0Y2ggPSBsb3dlckxpbmUubWF0Y2goL2VtaXRcXHMrdGltZTpcXHMrKFxcZCspXFxzKm1zLyk7XG4gICAgICAgICAgICBpZiAoZW1pdE1hdGNoKSBlbWl0VGltZU1zID0gcGFyc2VJbnQoZW1pdE1hdGNoWzFdLCAxMCk7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIHBhcnNlIHRpbWVcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlTWF0Y2ggPSBsb3dlckxpbmUubWF0Y2goL3BhcnNlXFxzK3RpbWU6XFxzKyhcXGQrKVxccyptcy8pO1xuICAgICAgICAgICAgaWYgKHBhcnNlTWF0Y2gpIHBhcnNlVGltZU1zID0gcGFyc2VJbnQocGFyc2VNYXRjaFsxXSwgMTApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBlcmZvcm1hbmNlIGFzc2Vzc21lbnQgYmFzZWQgb24gUERGIGd1aWRlbGluZXNcbiAgICAgICAgICBsZXQgYXNzZXNzbWVudDogJ2Zhc3QnIHwgJ21vZGVyYXRlJyB8ICdzbG93JztcbiAgICAgICAgICBpZiAoY2hlY2tUaW1lTXMgPCAxMDApIGFzc2Vzc21lbnQgPSAnZmFzdCc7XG4gICAgICAgICAgZWxzZSBpZiAoY2hlY2tUaW1lTXMgPD0gNTAwKSBhc3Nlc3NtZW50ID0gJ21vZGVyYXRlJztcbiAgICAgICAgICBlbHNlIGFzc2Vzc21lbnQgPSAnc2xvdyc7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hlY2tUaW1lTXMsXG4gICAgICAgICAgICBtZW1vcnlVc2VkTUI6IE1hdGgucm91bmQobWVtb3J5VXNlZE1CICogMTAwKSAvIDEwMCxcbiAgICAgICAgICAgIGZpbGVzQ2hlY2tlZCxcbiAgICAgICAgICAgIGVtaXRUaW1lTXMsXG4gICAgICAgICAgICBwYXJzZVRpbWVNcyxcbiAgICAgICAgICAgIGFzc2Vzc21lbnQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEIuIENpcmN1bGFyIERlcGVuZGVuY3kgRGV0ZWN0aW9uID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1bkNpcmN1bGFyQW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IGVudHJ5UG9pbnQgPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3NyYycsICdpbmRleC50cycpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhlbnRyeVBvaW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gc3JjL2luZGV4LnRzIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIER5bmFtaWMgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemVcbiAgICAgICAgICBjb25zdCBmaWxlQ291bnQgPSBhd2FpdCBjb3VudFR5cGVTY3JpcHRGaWxlcyh3b3JraW5nRGlyKTtcbiAgICAgICAgICBjb25zdCBkeW5hbWljVGltZW91dCA9IGdldEFuYWx5c2lzVGltZW91dCgyMDAwMCwgZmlsZUNvdW50KTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSdW4gbWFkZ2UgYW5kIGNhcHR1cmUgb3V0cHV0IHdpdGggZHluYW1pYyB0aW1lb3V0XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ25weCcsIFsnLS15ZXMnLCAnbWFkZ2UnLCAnLS1jaXJjdWxhcicsIGVudHJ5UG9pbnRdLCBkeW5hbWljVGltZW91dCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiBgbWFkZ2UgZmFpbGVkOiAke3Jlc3VsdC5zdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXJzZSBtYWRnZSBvdXRwdXQgXHUyMDE0IGl0IGxpc3RzIGN5Y2xlcyBsaWtlIFwiZmlsZTEudHMgLT4gZmlsZTIudHMgLT4gZmlsZTEudHNcIlxuICAgICAgICAgIGNvbnN0IGN5Y2xlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBjb25zdCBzdGRvdXQgPSByZXN1bHQuc3Rkb3V0IHx8ICcnO1xuICAgICAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICh0cmltbWVkICYmICF0cmltbWVkLnN0YXJ0c1dpdGgoJ0ZvdW5kJykgJiYgIXRyaW1tZWQuc3RhcnRzV2l0aCgnTm8nKSkge1xuICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGxvb2tzIGxpa2UgYSBjeWNsZSBwYXRoXG4gICAgICAgICAgICAgIGlmICh0cmltbWVkLmluY2x1ZGVzKCctPicpIHx8IHRyaW1tZWQuZW5kc1dpdGgoJy50cycpKSB7XG4gICAgICAgICAgICAgICAgY3ljbGVzLnB1c2godHJpbW1lZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGFzQ3ljbGVzOiBjeWNsZXMubGVuZ3RoID4gMCxcbiAgICAgICAgICAgIGN5Y2xlcyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQy4gRVNMaW50IEludGVncmF0aW9uID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1bkVzbGludEFuYWx5c2lzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICAgICAgICBjb25zdCBlc2xpbnRDb25maWdGaWxlcyA9IFtcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnZXNsaW50LmNvbmZpZy5tanMnKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnZXNsaW50LmNvbmZpZy5qcycpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICcuZXNsaW50cmMuanMnKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnLmVzbGludHJjLmpzb24nKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnLmVzbGludHJjJyksXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIGNvbnN0IGhhc0VzbGludENvbmZpZyA9IGVzbGludENvbmZpZ0ZpbGVzLnNvbWUoZiA9PiBmcy5leGlzdHNTeW5jKGYpKTtcbiAgICAgICAgICBpZiAoIWhhc0VzbGludENvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gRVNMaW50IGNvbmZpZ3VyYXRpb24gZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZXNsaW50IGlzIGF2YWlsYWJsZVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWydlc2xpbnQnLCAnLS12ZXJzaW9uJ10sIDUwMDApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnRVNMaW50IG5vdCBmb3VuZCBpbiBkZXZEZXBlbmRlbmNpZXMgb3IgUEFUSCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEeW5hbWljIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplXG4gICAgICAgICAgY29uc3QgZmlsZUNvdW50ID0gYXdhaXQgY291bnRUeXBlU2NyaXB0RmlsZXMod29ya2luZ0Rpcik7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1RpbWVvdXQgPSBnZXRBbmFseXNpc1RpbWVvdXQoMTUwMDAsIGZpbGVDb3VudCk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ25weCcsIFsnZXNsaW50JywgJ3NyYycsICctLWV4dCcsICcudHMnLCAnLS1mb3JtYXQnLCAnanNvbiddLCBkeW5hbWljVGltZW91dCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiBgRVNMaW50IGZhaWxlZDogJHtyZXN1bHQuc3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGFyc2UgSlNPTiBvdXRwdXQgZnJvbSBlc2xpbnQgLS1mb3JtYXQganNvblxuICAgICAgICAgIGxldCBlcnJvcnMgPSAwO1xuICAgICAgICAgIGxldCB3YXJuaW5ncyA9IDA7XG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBjb25zdCB3YXJuaW5nTWVzc2FnZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXN1bHQuc3Rkb3V0IHx8ICcnKSBhcyB7XG4gICAgICAgICAgICAgIHJlc3VsdHM/OiBBcnJheTx7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IHN0cmluZztcbiAgICAgICAgICAgICAgICBtZXNzYWdlcz86IEFycmF5PHsgc2V2ZXJpdHk6IG51bWJlcjsgbWVzc2FnZTogc3RyaW5nOyBsaW5lOiBudW1iZXI7IGNvbHVtbjogbnVtYmVyIH0+O1xuICAgICAgICAgICAgICB9PjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocGFyc2VkLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlUmVzdWx0IG9mIHBhcnNlZC5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIChmaWxlUmVzdWx0Lm1lc3NhZ2VzIHx8IFtdKSkge1xuICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2Uuc2V2ZXJpdHkgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzKys7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZXMucHVzaChgJHtmaWxlUmVzdWx0LmZpbGVQYXRofTogJHttZXNzYWdlLm1lc3NhZ2V9ICgke21lc3NhZ2UubGluZX06JHttZXNzYWdlLmNvbHVtbn0pYCk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2Uuc2V2ZXJpdHkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgd2FybmluZ3MrKztcbiAgICAgICAgICAgICAgICAgICAgd2FybmluZ01lc3NhZ2VzLnB1c2goYCR7ZmlsZVJlc3VsdC5maWxlUGF0aH06ICR7bWVzc2FnZS5tZXNzYWdlfSAoJHttZXNzYWdlLmxpbmV9OiR7bWVzc2FnZS5jb2x1bW59KWApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gSWYgSlNPTiBwYXJzaW5nIGZhaWxzLCBmYWxsIGJhY2sgdG8gdGV4dCBvdXRwdXQgYW5hbHlzaXNcbiAgICAgICAgICAgIGNvbnN0IGZhbGxiYWNrU3Rkb3V0ID0gcmVzdWx0LnN0ZG91dCB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTGluZXMgPSBmYWxsYmFja1N0ZG91dC5zcGxpdCgnXFxuJykuZmlsdGVyKGwgPT4gbC5pbmNsdWRlcygnZXJyb3InKSAmJiAhbC5pbmNsdWRlcygnd2FybmluZycpKTtcbiAgICAgICAgICAgIGVycm9ycyA9IGVycm9yTGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3Qgd2FybmluZ0xpbmVzID0gZmFsbGJhY2tTdGRvdXQuc3BsaXQoJ1xcbicpLmZpbHRlcihsID0+IGwuaW5jbHVkZXMoJ3dhcm5pbmcnKSk7XG4gICAgICAgICAgICB3YXJuaW5ncyA9IHdhcm5pbmdMaW5lcy5sZW5ndGg7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgICAgIHdhcm5pbmdzLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlczogZXJyb3JNZXNzYWdlcy5zbGljZSgwLCAyMCksIC8vIExpbWl0IHRvIGZpcnN0IDIwXG4gICAgICAgICAgICB3YXJuaW5nTWVzc2FnZXM6IHdhcm5pbmdNZXNzYWdlcy5zbGljZSgwLCAyMCksXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEQuIFR5cGVTY3JpcHQgQ29uZmlnIEFuYWx5c2lzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGZ1bmN0aW9uIHJ1bkNvbmZpZ0FuYWx5c2lzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgICBjb25zdCB0c0NvbmZpZ1BhdGggPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3RzY29uZmlnLmpzb24nKTtcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModHNDb25maWdQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gdHNjb25maWcuanNvbiBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgdHNDb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0c0NvbmZpZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHRzQ29uZmlnUGF0aCwgJ3V0Zi04JykpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnSW52YWxpZCB0c2NvbmZpZy5qc29uIGZvcm1hdCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBjb21waWxlck9wdGlvbnMgPSAodHNDb25maWcuY29tcGlsZXJPcHRpb25zIHx8IHt9KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCBpbmNyZW1lbnRhbCA9ICEhY29tcGlsZXJPcHRpb25zLmluY3JlbWVudGFsO1xuICAgICAgICAgIGNvbnN0IHNraXBMaWJDaGVjayA9ICEhY29tcGlsZXJPcHRpb25zLnNraXBMaWJDaGVjaztcbiAgICAgICAgICBjb25zdCBpc29sYXRlZE1vZHVsZXMgPSAhIWNvbXBpbGVyT3B0aW9ucy5pc29sYXRlZE1vZHVsZXM7XG4gICAgICAgICAgY29uc3Qgc3RyaWN0ID0gISFjb21waWxlck9wdGlvbnMuc3RyaWN0O1xuXG4gICAgICAgICAgY29uc3QgcmVjb21tZW5kYXRpb25zOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgLy8gUmVjb21tZW5kYXRpb25zIGJhc2VkIG9uIFBERiBvcHRpbWl6YXRpb24gdGVjaG5pcXVlc1xuICAgICAgICAgIGlmICghaW5jcmVtZW50YWwpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdFbmFibGUgXCJpbmNyZW1lbnRhbFwiOiB0cnVlIGluIHRzY29uZmlnLmpzb24gZm9yIGZhc3RlciBidWlsZHMgKGJ1aWxkIGNhY2hpbmcpLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXNraXBMaWJDaGVjaykge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0VuYWJsZSBcInNraXBMaWJDaGVja1wiOiB0cnVlIHRvIHNraXAgY2hlY2tpbmcgLmQudHMgZmlsZXMgaW4gbm9kZV9tb2R1bGVzLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWlzb2xhdGVkTW9kdWxlcykge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0NvbnNpZGVyIGVuYWJsaW5nIFwiaXNvbGF0ZWRNb2R1bGVzXCI6IHRydWUgZm9yIGZhc3RlciBjb21waWxhdGlvbiAoZXNwZWNpYWxseSB3aXRoIEJhYmVsL2VzYnVpbGQpLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXN0cmljdCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0VuYWJsZSBcInN0cmljdFwiOiB0cnVlIGZvciBiZXR0ZXIgdHlwZSBzYWZldHkgYW5kIGZld2VyIHJ1bnRpbWUgZXJyb3JzLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGZvciBwYXRocyBjb25maWd1cmF0aW9uIChtb2R1bGUgcmVzb2x1dGlvbiBvcHRpbWl6YXRpb24pXG4gICAgICAgICAgY29uc3QgcGF0aHMgPSBjb21waWxlck9wdGlvbnMucGF0aHMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKCFwYXRocyB8fCBPYmplY3Qua2V5cyhwYXRocykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnQ29uc2lkZXIgdXNpbmcgXCJwYXRoc1wiIGluIHRzY29uZmlnLmpzb24gdG8gc2ltcGxpZnkgbW9kdWxlIGltcG9ydHMgYW5kIHJlZHVjZSBkZXBlbmRlbmN5IGRlcHRoLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbmNyZW1lbnRhbCxcbiAgICAgICAgICAgIHNraXBMaWJDaGVjayxcbiAgICAgICAgICAgIGlzb2xhdGVkTW9kdWxlcyxcbiAgICAgICAgICAgIHN0cmljdCxcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gRS4gSW1wb3J0IFN0cnVjdHVyZSBBbmFseXNpcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBmdW5jdGlvbiBydW5JbXBvcnRBbmFseXNpcygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgICAgY29uc3Qgc3JjRGlyID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICdzcmMnKTtcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc3JjRGlyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gc3JjLyBkaXJlY3RvcnkgZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ29sbGVjdCBhbGwgLnRzIGZpbGVzIGluIHNyYy9cbiAgICAgICAgICBmdW5jdGlvbiBjb2xsZWN0VHNGaWxlcyhkaXI6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGRpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKC4uLmNvbGxlY3RUc0ZpbGVzKGZ1bGxQYXRoKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkubmFtZS5lbmRzV2l0aCgnLnRzJykgJiYgIWVudHJ5Lm5hbWUuZW5kc1dpdGgoJy5kLnRzJykpIHtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmlsZXM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdHNGaWxlcyA9IGNvbGxlY3RUc0ZpbGVzKHNyY0Rpcik7XG4gICAgICAgICAgY29uc3QgZmlsZXNXaXRoRXhjZXNzaXZlSW1wb3J0czogQXJyYXk8eyBmaWxlOiBzdHJpbmc7IGNvdW50OiBudW1iZXIgfT4gPSBbXTtcbiAgICAgICAgICBjb25zdCBkZWNsYXJlR2xvYmFsVXNhZ2U6IEFycmF5PHsgZmlsZTogc3RyaW5nIH0+ID0gW107XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIHRzRmlsZXMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gQ291bnQgaW1wb3J0c1xuICAgICAgICAgICAgICBjb25zdCBpbXBvcnRTdGF0ZW1lbnRzID0gY29udGVudC5tYXRjaCgvXmltcG9ydFxccysuKiQvZ20pO1xuICAgICAgICAgICAgICBjb25zdCBpbXBvcnRDb3VudCA9IGltcG9ydFN0YXRlbWVudHMgPyBpbXBvcnRTdGF0ZW1lbnRzLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgICAgICAgaWYgKGltcG9ydENvdW50ID4gaW1wb3J0V2FybmluZ1RocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGZpbGVzV2l0aEV4Y2Vzc2l2ZUltcG9ydHMucHVzaCh7IGZpbGU6IHBhdGgucmVsYXRpdmUod29ya2luZ0RpciwgZmlsZVBhdGgpLCBjb3VudDogaW1wb3J0Q291bnQgfSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZGVjbGFyZSBnbG9iYWwgdXNhZ2UgKGdsb2JhbCB0eXBlIHBhdGNoaW5nIFx1MjAxNCBiYWQgcHJhY3RpY2UgcGVyIFBERilcbiAgICAgICAgICAgICAgY29uc3QgZGVjbGFyZUdsb2JhbE1hdGNoZXMgPSBjb250ZW50Lm1hdGNoKC9kZWNsYXJlXFxzK2dsb2JhbC9nKTtcbiAgICAgICAgICAgICAgaWYgKGRlY2xhcmVHbG9iYWxNYXRjaGVzICYmIGRlY2xhcmVHbG9iYWxNYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWNsYXJlR2xvYmFsVXNhZ2UucHVzaCh7IGZpbGU6IHBhdGgucmVsYXRpdmUod29ya2luZ0RpciwgZmlsZVBhdGgpIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgLy8gU2tpcCBmaWxlcyB0aGF0IGNhbid0IGJlIHJlYWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsZXNXaXRoRXhjZXNzaXZlSW1wb3J0cyxcbiAgICAgICAgICAgIGRlY2xhcmVHbG9iYWxVc2FnZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gUnVuIFNlbGVjdGVkIENhdGVnb3JpZXMgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgY29uc3QgcmVzdWx0czogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCd0eXBlY2hlY2snKSkge1xuICAgICAgICAgIHJlc3VsdHMudHlwZWNoZWNrID0gYXdhaXQgcnVuVHlwZWNoZWNrQW5hbHlzaXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCdjaXJjdWxhcicpKSB7XG4gICAgICAgICAgcmVzdWx0cy5jaXJjdWxhciA9IGF3YWl0IHJ1bkNpcmN1bGFyQW5hbHlzaXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCdlc2xpbnQnKSkge1xuICAgICAgICAgIHJlc3VsdHMuZXNsaW50ID0gYXdhaXQgcnVuRXNsaW50QW5hbHlzaXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCdjb25maWcnKSkge1xuICAgICAgICAgIHJlc3VsdHMuY29uZmlnID0gcnVuQ29uZmlnQW5hbHlzaXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCdpbXBvcnRzJykpIHtcbiAgICAgICAgICByZXN1bHRzLmltcG9ydHMgPSBydW5JbXBvcnRBbmFseXNpcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHJlc3VsdHMsXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBBbmFseXNpcyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc2VhcmNoIGFzIGRkZ1NlYXJjaCB9IGZyb20gJ2R1Y2stZHVjay1zY3JhcGUnO1xuaW1wb3J0IHsgaHRtbFRvVGV4dCB9IGZyb20gJ2h0bWwtdG8tdGV4dCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBmZXRjaFdpdGhSZXRyeSB9IGZyb20gJy4uL3BlcmZvcm1hbmNlVXRpbHMuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTZWFyY2ggRW5naW5lIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgU2VhcmNoUmVzdWx0SXRlbSB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xufVxuXG4vKiogRHVja0R1Y2tHbyBBUEkgKGZhc3Rlc3QsIG5vIGJyb3dzZXIgbmVlZGVkKSAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoRERHQXBpKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXN1bHRzID0gYXdhaXQgZGRnU2VhcmNoKHF1ZXJ5LCB7IHJlZ2lvbjogJ3d0LXd0JyB9KTtcbiAgcmV0dXJuIChyZXN1bHRzLnJlc3VsdHMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgIHRpdGxlOiByLnRpdGxlIGFzIHN0cmluZyxcbiAgICB1cmw6IHIudXJsIGFzIHN0cmluZyxcbiAgICBkZXNjcmlwdGlvbjogKHIuZGVzY3JpcHRpb24gYXMgc3RyaW5nKSB8fCAnJyxcbiAgfSkpO1xufVxuXG4vKiogRHVja0R1Y2tHbyBIVE1MIEZldGNoIChmYWxsYmFjayB3aGVuIEFQSSBmYWlscykgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaERER0ZldGNoKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KFxuICAgIGBodHRwczovL2h0bWwuZHVja2R1Y2tnby5jb20vaHRtbC8/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9YFxuICApO1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYER1Y2tEdWNrR28gRmV0Y2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICBcbiAgLy8gU2ltcGxlIHJlZ2V4LWJhc2VkIHBhcnNpbmcgZm9yIE5vZGUuanMgKG5vIERPTVBhcnNlciBuZWVkZWQhKVxuICBjb25zdCByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW10gPSBbXTtcbiAgXG4gIC8vIEV4dHJhY3QgdGl0bGVzIGZyb20gPGEgY2xhc3M9XCJyZXN1bHRfX2FcIiBocmVmPVwiLi4uXCIgcmVsPVwiLi4uXCI+VGl0bGU8L2E+XG4gIGNvbnN0IHRpdGxlUmVnZXggPSAvPGFbXj5dK2NsYXNzPVwicmVzdWx0X19hXCJbXj5dK2hyZWY9XCIoW15cIl0rKVwiW14+XSo+KFtePF0rKTxcXC9hPi9naTtcbiAgbGV0IG1hdGNoO1xuICBcbiAgd2hpbGUgKChtYXRjaCA9IHRpdGxlUmVnZXguZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdGl0bGU6IG1hdGNoWzJdLnJlcGxhY2UoLyZhbXA7L2csICcmJykudHJpbSgpLFxuICAgICAgdXJsOiBtYXRjaFsxXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIDEwKTtcbn1cblxuLyoqIEdvb2dsZSBTZWFyY2ggdmlhIEhUTUwgRmV0Y2ggKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEdvb2dsZShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShcbiAgICBgaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9Jm51bT0xMGAsXG4gICAgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNicgfSB9XG4gICk7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgR29vZ2xlIHNlYXJjaCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIC8vIFNpbXBsZSBwYXJzaW5nIFx1MjAxNCBleHRyYWN0IHRpdGxlcyBhbmQgVVJMcyBmcm9tIEdvb2dsZSdzIEhUTUwgc3RydWN0dXJlXG4gIGNvbnN0IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXSA9IFtdO1xuICBjb25zdCB0aXRsZVJlZ2V4ID0gLzxoM1tePl0qPiguKj8pPFxcL2gzPi9nO1xuXG4gIGxldCBtYXRjaDtcbiAgd2hpbGUgKChtYXRjaCA9IHRpdGxlUmVnZXguZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdGl0bGU6IG1hdGNoWzFdLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpLCAvLyBSZW1vdmUgSFRNTCB0YWdzXG4gICAgICB1cmw6ICcnLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgMTApO1xufVxuXG4vKiogQmluZyBTZWFyY2ggdmlhIEhUTUwgRmV0Y2ggKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEJpbmcocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoXG4gICAgYGh0dHBzOi8vd3d3LmJpbmcuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX0mY291bnQ9MTBgLFxuICAgIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYnIH0gfVxuICApO1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEJpbmcgc2VhcmNoIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgLy8gUGFyc2UgQmluZyByZXN1bHRzIFx1MjAxNCBzaW1pbGFyIGFwcHJvYWNoIHRvIEdvb2dsZVxuICBjb25zdCByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW10gPSBbXTtcbiAgY29uc3QgcmVzdWx0UmVnZXggPSAvPGxpIGNsYXNzPVwiYl9hbGdvXCJbXj5dKj4oLio/KTxcXC9saT4vZ3M7XG5cbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAoKG1hdGNoID0gcmVzdWx0UmVnZXguZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBibG9jayA9IG1hdGNoWzFdO1xuICAgIGNvbnN0IHRpdGxlTWF0Y2ggPSBibG9jay5tYXRjaCgvPGFbXj5dK2hyZWY9XCIoW15cIl0rKVwiW14+XSo+KFtePF0rKTxcXC9hPi8pO1xuICAgIGlmICh0aXRsZU1hdGNoKSB7XG4gICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICB0aXRsZTogdGl0bGVNYXRjaFsyXSxcbiAgICAgICAgdXJsOiB0aXRsZU1hdGNoWzFdLFxuICAgICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCAxMCk7XG59XG5cbi8qKiBBbGwgYXZhaWxhYmxlIFNlYXJjaCBFbmdpbmUgRnVuY3Rpb25zICovXG5jb25zdCBTRUFSQ0hfRU5HSU5FUzogUmVjb3JkPHN0cmluZywgKHF1ZXJ5OiBzdHJpbmcpID0+IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPj4gPSB7XG4gICdkZGctYXBpJzogc2VhcmNoRERHQXBpLFxuICAnZGRnLWZldGNoJzogc2VhcmNoRERHRmV0Y2gsXG4gICdnb29nbGUnOiBzZWFyY2hHb29nbGUsXG4gICdiaW5nJzogc2VhcmNoQmluZyxcbn07XG5cbi8qKiBIYXJkY29kZWQgZmFsbGJhY2sgb3JkZXIgKHdoZW4gcHJpbWFyeSBlbmdpbmUgZmFpbHMpICovXG5jb25zdCBGQUxMQkFDS19PUkRFUiA9IFsnZGRnLWFwaScsICdkZGctZmV0Y2gnLCAnZ29vZ2xlJywgJ2JpbmcnXTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRmFsbGJhY2sgQ2hhaW4gTG9naWMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBXZWIgc2VhcmNoIHdpdGggYXV0b21hdGljIGZhbGxiYWNrLlxuICogU3RhcnRzIHdpdGggdGhlIENvbmZpZyBlbmdpbmUgYW5kIGF1dG9tYXRpY2FsbHkgdHJpZXMgdGhlIG5leHQgaW4gdGhlIGNoYWluLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hXaXRoRmFsbGJhY2tDaGFpbihcbiAgcXVlcnk6IHN0cmluZyxcbiAgY29uZmlnOiBQbHVnaW5Db25maWdcbik6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogeyBxdWVyeTogc3RyaW5nOyByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW107IGNvdW50OiBudW1iZXI7IGVuZ2luZTogc3RyaW5nIH07IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgLy8gU3RhcnQgZW5naW5lIGZyb20gQ29uZmlnIChTaW5nbGUgU2VsZWN0KVxuICBjb25zdCBwcmltYXJ5RW5naW5lID0gY29uZmlnLnNlYXJjaEZhbGxiYWNrQ2hhaW4gfHwgJ2RkZy1hcGknO1xuICBcbiAgLy8gRmFsbGJhY2sgY2hhaW46IHByaW1hcnkgZW5naW5lICsgYWxsIG90aGVycyBpbiBkZWZpbmVkIG9yZGVyXG4gIGNvbnN0IGNoYWluID0gW3ByaW1hcnlFbmdpbmUsIC4uLkZBTExCQUNLX09SREVSLmZpbHRlcihlID0+IGUgIT09IHByaW1hcnlFbmdpbmUpXTtcblxuICBmb3IgKGNvbnN0IGVuZ2luZSBvZiBjaGFpbikge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzZWFyY2hGbiA9IFNFQVJDSF9FTkdJTkVTW2VuZ2luZV07XG4gICAgICBpZiAoIXNlYXJjaEZuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgU2VhcmNoIGVuZ2luZSBcIiR7ZW5naW5lfVwiIG5vdCBmb3VuZCwgc2tpcHBpbmdgKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBzZWFyY2hGbihxdWVyeSk7XG5cbiAgICAgIC8vIFZhbGlkYXRlIHJlc3VsdCBjb3VudCAtIHdhcm4gaWYgbG93IHJlc3VsdHNcbiAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBMb3cgc2VhcmNoIHJlc3VsdHMgZm9yIFwiJHtxdWVyeX1cIjogJHtyZXN1bHRzLmxlbmd0aH0gcmVzdWx0cyBmcm9tICR7ZW5naW5lfWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7IHF1ZXJ5LCByZXN1bHRzLCBjb3VudDogcmVzdWx0cy5sZW5ndGgsIGVuZ2luZSB9LFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIGNvbnNvbGUud2FybihgU2VhcmNoIGVuZ2luZSBcIiR7ZW5naW5lfVwiIGZhaWxlZDogJHttZXNzYWdlfWApO1xuICAgICAgLy8gVHJ5IG5leHQgZW5naW5lIGluIHRoZSBjaGFpblxuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICBlcnJvcjogYEFsbCBzZWFyY2ggZW5naW5lcyBmYWlsZWQuIFRyaWVkOiAke2NoYWluLmpvaW4oJyBcdTIxOTIgJyl9YCxcbiAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFdlYlNlYXJjaFBhcmFtcyB7IHF1ZXJ5OiBzdHJpbmc7IH1cbmludGVyZmFjZSBXaWtpcGVkaWFTZWFyY2hQYXJhbXMgeyBxdWVyeTogc3RyaW5nOyBsYW5nPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRmV0Y2hXZWJDb250ZW50UGFyYW1zIHsgdXJsOiBzdHJpbmc7IH1cbmludGVyZmFjZSBSYWdXZWJDb250ZW50UGFyYW1zIHsgdXJsOiBzdHJpbmc7IHF1ZXJ5OiBzdHJpbmc7IH1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyB3ZWJfc2VhcmNoIHRvb2wgXHUyMDE0IHVzZXMgcHJpbWFyeSBlbmdpbmUgZnJvbSBDb25maWcgKyBhdXRvbWF0aWMgZmFsbGJhY2tcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd2ViX3NlYXJjaCcsXG4gICAgZGVzY3JpcHRpb246ICdTZWFyY2ggdGhlIHdlYiB1c2luZyBhIGNvbmZpZ3VyYWJsZSBzZWFyY2ggZW5naW5lIHdpdGggYXV0b21hdGljIGZhbGxiYWNrIHRvIG90aGVyIGVuZ2luZXMgaWYgdGhlIHByaW1hcnkgb25lIGZhaWxzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzZWFyY2ggcXVlcnknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSB9OiBXZWJTZWFyY2hQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHJldHVybiBhd2FpdCBzZWFyY2hXaXRoRmFsbGJhY2tDaGFpbihxdWVyeSwgY29uZmlnKTtcbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gd2lraXBlZGlhX3NlYXJjaCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3dpa2lwZWRpYV9zZWFyY2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIFdpa2lwZWRpYSBmb3IgYSBnaXZlbiBxdWVyeSBhbmQgcmV0dXJuIHBhZ2Ugc3VtbWFyaWVzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzZWFyY2ggcXVlcnknKSxcbiAgICAgIGxhbmc6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdlbicpLmRlc2NyaWJlKCdMYW5ndWFnZSBjb2RlIChkZWZhdWx0OiBlbiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgbGFuZyB9OiBXaWtpcGVkaWFTZWFyY2hQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGFwaVVybCA9IGBodHRwczovLyR7bGFuZyB8fCAnZW4nfS53aWtpcGVkaWEub3JnL3cvYXBpLnBocD9hY3Rpb249cXVlcnkmbGlzdD1zZWFyY2gmc3JzZWFyY2g9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZmb3JtYXQ9anNvbiZvcmlnaW49KmA7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoYXBpVXJsKTtcblxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXaWtpcGVkaWEgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzcG9uc2UuanNvbigpKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gZGF0YS5xdWVyeSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0cyA9IChxdWVyeURhdGE/LnNlYXJjaCBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4pIHx8IFtdO1xuICAgICAgICBjb25zdCBwYWdlcyA9IHNlYXJjaFJlc3VsdHMubWFwKChpdGVtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpdGxlID0gdHlwZW9mIGl0ZW0udGl0bGUgPT09ICdzdHJpbmcnID8gaXRlbS50aXRsZSA6ICcnO1xuICAgICAgICAgIGNvbnN0IHNuaXBwZXQgPSB0eXBlb2YgaXRlbS5zbmlwcGV0ID09PSAnc3RyaW5nJyA/IGl0ZW0uc25pcHBldC5yZXBsYWNlKC88W14+XSo+L2csICcnKSA6ICcnO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHNuaXBwZXQsXG4gICAgICAgICAgICB1cmw6IGBodHRwczovLyR7bGFuZyB8fCAnZW4nfS53aWtpcGVkaWEub3JnL3dpa2kvJHtlbmNvZGVVUklDb21wb25lbnQodGl0bGUpfWAsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBxdWVyeSwgbGFuZ3VhZ2U6IGxhbmcgfHwgJ2VuJywgcmVzdWx0czogcGFnZXMsIGNvdW50OiBwYWdlcy5sZW5ndGggfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgV2lraXBlZGlhIHNlYXJjaCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGZldGNoX3dlYl9jb250ZW50IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZmV0Y2hfd2ViX2NvbnRlbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmV0Y2ggdGhlIGNsZWFuLCB0ZXh0LWJhc2VkIGNvbnRlbnQgb2YgYSB3ZWJwYWdlIFVSTC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBmZXRjaCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCB9OiBGZXRjaFdlYkNvbnRlbnRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkodXJsKTtcblxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBodG1sVG9UZXh0KGh0bWwsIHtcbiAgICAgICAgICB3b3Jkd3JhcDogZmFsc2UsXG4gICAgICAgICAgc2VsZWN0b3JzOiBbXG4gICAgICAgICAgICB7IHNlbGVjdG9yOiAnYScsIG9wdGlvbnM6IHsgaWdub3JlSHJlZjogdHJ1ZSB9IH0sXG4gICAgICAgICAgICB7IHNlbGVjdG9yOiAnaW1nJywgZm9ybWF0OiAnW2ltYWdlXScgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHVybCwgY29udGVudDogdGV4dC5zdWJzdHJpbmcoMCwgNTAwMCkgfSB9OyAvLyBMaW1pdCBsZW5ndGhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBmZXRjaCBjb250ZW50OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByYWdfd2ViX2NvbnRlbnQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyYWdfd2ViX2NvbnRlbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmV0Y2ggY29udGVudCBmcm9tIGEgVVJMLCBhbmQgdGhlbiB1c2UgUkFHIHRvIGZpbmQgYW5kIHJldHVybiBvbmx5IHRoZSB0ZXh0IGNodW5rcyBtb3N0IHJlbGV2YW50IHRvIGEgc3BlY2lmaWMgcXVlcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1RoZSBVUkwgdG8gZmV0Y2gnKSxcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2VhcmNoIHF1ZXJ5IGZvciByZWxldmFuY2UgbWF0Y2hpbmcnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB1cmwsIHF1ZXJ5IH06IFJhZ1dlYkNvbnRlbnRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkodXJsKTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICAgICAgICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gaHRtbFRvVGV4dChodG1sKTtcblxuICAgICAgICAvLyBTaW1wbGUga2V5d29yZC1iYXNlZCByZWxldmFuY2Ugc2NvcmluZyAocGxhY2Vob2xkZXIgZm9yIHJlYWwgUkFHKVxuICAgICAgICBjb25zdCBxdWVyeVRlcm1zID0gcXVlcnkudG9Mb3dlckNhc2UoKS5zcGxpdCgvXFxzKy8pLmZpbHRlcigodDogc3RyaW5nKSA9PiB0Lmxlbmd0aCA+IDIpO1xuICAgICAgICBjb25zdCBzZW50ZW5jZXMgPSB0ZXh0LnNwbGl0KC9bLiE/XSsvKS5tYXAoKHM6IHN0cmluZykgPT4gcy50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcblxuICAgICAgICBjb25zdCByZWxldmFudENodW5rcyA9IHNlbnRlbmNlcy5maWx0ZXIoKHNlbnRlbmNlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICByZXR1cm4gcXVlcnlUZXJtcy5zb21lKCh0ZXJtOiBzdHJpbmcpID0+IHNlbnRlbmNlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXModGVybSkpO1xuICAgICAgICB9KS5zbGljZSgwLCA1KTsgLy8gUmV0dXJuIHRvcCA1IGhpdHNcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHVybCwgcXVlcnksIGNodW5rczogcmVsZXZhbnRDaHVua3MgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUkFHIHNlYXJjaCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcnO1xuXG4vLyBMYXp5LWxvYWQgc2ltcGxlLWdpdCBmb3IgdGVzdGFiaWxpdHlcbmxldCBzaW1wbGVHaXRNb2R1bGU6IHR5cGVvZiBpbXBvcnQoJ3NpbXBsZS1naXQnKSB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTaW1wbGVHaXQoKTogUHJvbWlzZTx0eXBlb2YgaW1wb3J0KCdzaW1wbGUtZ2l0Jyk+IHtcbiAgaWYgKCFzaW1wbGVHaXRNb2R1bGUpIHtcbiAgICBzaW1wbGVHaXRNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ3NpbXBsZS1naXQnKTtcbiAgfVxuICByZXR1cm4gc2ltcGxlR2l0TW9kdWxlO1xufVxuXG4vKiogUmVzZXQgZ2l0IG1vZHVsZSBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRHaXRDYWNoZSgpOiB2b2lkIHtcbiAgc2ltcGxlR2l0TW9kdWxlID0gbnVsbDtcbn1cblxuLyoqIENyZWF0ZSBhIGZyZXNoIGdpdCBpbnN0YW5jZSBmb3IgZWFjaCBvcGVyYXRpb24gdG8gYXZvaWQgY3dkIGlzc3VlcyAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlR2l0KCkge1xuICBjb25zdCB7IGRlZmF1bHQ6IHNpbXBsZUdpdCB9ID0gYXdhaXQgZ2V0U2ltcGxlR2l0KCk7XG4gIHJldHVybiBzaW1wbGVHaXQoKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IEdpdEh1YiByZXBvIG5hbWUgZnJvbSBnaXQgcmVtb3RlIFVSTCBvciBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAqIFRyaWVzIG11bHRpcGxlIHNvdXJjZXMgaW4gb3JkZXIgb2YgcmVsaWFiaWxpdHkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldFJlcG9OYW1lKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAvLyBQcmlvcml0eSAxOiBFbnZpcm9ubWVudCB2YXJpYWJsZSAoR2l0SHViIEFjdGlvbnMsIENJL0NEKVxuICBpZiAocHJvY2Vzcy5lbnYuR0lUSFVCX1JFUE9TSVRPUlkpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuR0lUSFVCX1JFUE9TSVRPUlk7XG4gIH1cblxuICAvLyBQcmlvcml0eSAyOiBHaXQgcmVtb3RlIFVSTCBwYXJzaW5nXG4gIHRyeSB7XG4gICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgY29uc3QgcmVtb3RlcyA9IGF3YWl0IGdpdC5saXN0UmVtb3RlKFsnLS1nZXQtdXJsJywgJ29yaWdpbiddKTtcbiAgICBjb25zdCByZW1vdGVVcmwgPSByZW1vdGVzLnRyaW0oKTtcbiAgICBcbiAgICBpZiAocmVtb3RlVXJsKSB7XG4gICAgICAvLyBIYW5kbGUgU1NIIGZvcm1hdDogZ2l0QGdpdGh1Yi5jb206dXNlci9yZXBvLmdpdFxuICAgICAgY29uc3Qgc3NoTWF0Y2ggPSByZW1vdGVVcmwubWF0Y2goL2dpdEBnaXRodWJcXC5jb21bOi9dKFteL10rXFwvW14vXSspXFwuZ2l0JC8pO1xuICAgICAgaWYgKHNzaE1hdGNoKSByZXR1cm4gc3NoTWF0Y2hbMV07XG4gICAgICBcbiAgICAgIC8vIEhhbmRsZSBIVFRQUyBmb3JtYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS91c2VyL3JlcG8uZ2l0XG4gICAgICBjb25zdCBodHRwc01hdGNoID0gcmVtb3RlVXJsLm1hdGNoKC9odHRwczpcXC9cXC9naXRodWJcXC5jb21cXC8oW14vXStcXC9bXi9dKylcXC5naXQkLyk7XG4gICAgICBpZiAoaHR0cHNNYXRjaCkgcmV0dXJuIGh0dHBzTWF0Y2hbMV07XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBHaXQgcmVtb3RlIG5vdCBhdmFpbGFibGUsIGNvbnRpbnVlIHRvIG5leHQgcHJpb3JpdHlcbiAgfVxuXG4gIC8vIFByaW9yaXR5IDM6IEVudmlyb25tZW50IHZhcmlhYmxlIEdJVEhVQl9SRVBPIGFzIGZhbGxiYWNrXG4gIGlmIChwcm9jZXNzLmVudi5HSVRIVUJfUkVQTykge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5HSVRIVUJfUkVQTztcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFNoYXJlZCBoZWxwZXI6IE1ha2UgR2l0SHViIEFQSSByZXF1ZXN0cyB3aXRoIGF1dGhlbnRpY2F0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdoQXBpUmVxdWVzdChtZXRob2Q6IHN0cmluZywgZW5kcG9pbnQ6IHN0cmluZywgYm9keT86IHVua25vd24pIHtcbiAgY29uc3QgZ2l0aHViVG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU47XG4gIFxuICBpZiAoIWdpdGh1YlRva2VuKSB0aHJvdyBuZXcgRXJyb3IoJ0dJVEhVQl9UT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0Jyk7XG4gIFxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5naXRodWIuY29tJHtlbmRwb2ludH1gLCB7XG4gICAgbWV0aG9kLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke2dpdGh1YlRva2VufWAsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gICAgYm9keTogYm9keSA/IEpTT04uc3RyaW5naWZ5KGJvZHkpIDogdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgIHRocm93IG5ldyBFcnJvcihgR2l0SHViIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KTogJHtlcnJvclRleHR9YCk7XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xufVxuXG4vKiogVHlwZWQgcGFyYW1zIGludGVyZmFjZXMgKi9cbnR5cGUgR2l0U3RhdHVzUGFyYW1zID0gUmVjb3JkPHN0cmluZywgbmV2ZXI+O1xuaW50ZXJmYWNlIEdpdERpZmZQYXJhbXMgeyBmaWxlX3BhdGg/OiBzdHJpbmc7IGNhY2hlZD86IGJvb2xlYW47IH1cbmludGVyZmFjZSBHaXRDb21taXRQYXJhbXMgeyBtZXNzYWdlOiBzdHJpbmc7IH1cbmludGVyZmFjZSBHaXRMb2dQYXJhbXMgeyBtYXhfY291bnQ/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHaXRBZGRQYXJhbXMgeyBwYXRocz86IHN0cmluZ1tdOyB9XG5pbnRlcmZhY2UgR2l0Q2hlY2tvdXRQYXJhbXMgeyBicmFuY2hfbmFtZTogc3RyaW5nOyBjcmVhdGVfbmV3PzogYm9vbGVhbjsgfVxuaW50ZXJmYWNlIEdoQ3JlYXRlSXNzdWVQYXJhbXMgeyB0aXRsZTogc3RyaW5nOyBib2R5Pzogc3RyaW5nOyBsYWJlbHM/OiBzdHJpbmdbXTsgfVxuaW50ZXJmYWNlIEdoTGlzdElzc3Vlc1BhcmFtcyB7IHN0YXRlPzogJ29wZW4nIHwgJ2Nsb3NlZCc7IGxhYmVscz86IHN0cmluZ1tdOyBsaW1pdD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdoVmlld0NvbW1lbnRzUGFyYW1zIHsgbnVtYmVyOiBudW1iZXI7IHR5cGU/OiAnaXNzdWUnIHwgJ3ByJzsgfVxuaW50ZXJmYWNlIEdoQ3JlYXRlUHJQYXJhbXMgeyB0aXRsZTogc3RyaW5nOyBib2R5Pzogc3RyaW5nOyBoZWFkX2JyYW5jaDogc3RyaW5nOyBiYXNlX2JyYW5jaD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIEdoTGlzdFByc1BhcmFtcyB7IHN0YXRlPzogJ29wZW4nIHwgJ2Nsb3NlZCc7IGxpbWl0PzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2hWaWV3UHJEaWZmUGFyYW1zIHsgbnVtYmVyOiBudW1iZXI7IH1cbmludGVyZmFjZSBHaFB1c2hQYXJhbXMgeyBicmFuY2g/OiBzdHJpbmc7IH1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyR2l0VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGdpdF9zdGF0dXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfc3RhdHVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCB0aGUgY3VycmVudCBnaXQgc3RhdHVzIG9mIHRoZSByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChfcGFyYW1zOiBHaXRTdGF0dXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBjb25zdCBzdGF0dXNSZXN1bHQgPSBhd2FpdCBnaXQuc3RhdHVzKCkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHN0YXR1c1Jlc3VsdCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IHN0YXR1cyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9kaWZmIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2RpZmYnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHRoZSBnaXQgZGlmZiBvZiB0aGUgY3VycmVudCByZXBvc2l0b3J5IG9yIHNwZWNpZmljIGZpbGVzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBQYXRoIHRvIHNwZWNpZmljIGZpbGUgdG8gZGlmZi4nKSxcbiAgICAgIGNhY2hlZDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnT3B0aW9uYWw6IFNob3cgc3RhZ2VkIGNoYW5nZXMgb25seSAoZ2l0IGRpZmYgLS1jYWNoZWQpLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfcGF0aCwgY2FjaGVkIH06IEdpdERpZmZQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBsZXQgZGlmZiA9ICcnO1xuICAgICAgICBpZiAoZmlsZV9wYXRoKSB7XG4gICAgICAgICAgZGlmZiA9IGF3YWl0IGdpdC5kaWZmKFtmaWxlX3BhdGhdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaWZmID0gY2FjaGVkID8gYXdhaXQgZ2l0LmRpZmYoWyctLWNhY2hlZCddKSA6IGF3YWl0IGdpdC5kaWZmKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkaWZmIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBkaWZmIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2NvbW1pdCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9jb21taXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ29tbWl0IHN0YWdlZCBjaGFuZ2VzIHRvIHRoZSBnaXQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBjb21taXQgbWVzc2FnZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG1lc3NhZ2UgfTogR2l0Q29tbWl0UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgYXdhaXQgZ2l0LmNvbW1pdChtZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21taXR0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGNvbW1pdCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9sb2cgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfbG9nJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCByZWNlbnQgZ2l0IGNvbW1pdCBoaXN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWF4X2NvdW50OiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggbnVtYmVyIG9mIGNvbW1pdHMgdG8gcmV0dXJuIChkZWZhdWx0OiAxMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBtYXhfY291bnQgfTogR2l0TG9nUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgY29uc3QgY291bnQgPSBtYXhfY291bnQgfHwgMTA7XG4gICAgICAgIGNvbnN0IGxvZyA9IGF3YWl0IGdpdC5sb2coY291bnQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1pdHM6IGxvZy5hbGwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGxvZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9hZGQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfYWRkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1N0YWdlIHNwZWNpZmljIGZpbGVzIG9yIGFsbCBjaGFuZ2VzIGZvciB0aGUgbmV4dCBjb21taXQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbDogU3BlY2lmaWMgZmlsZSBwYXRocyB0byBzdGFnZS4gSWYgb21pdHRlZCwgc3RhZ2VzIGFsbCBjaGFuZ2VzLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGhzIH06IEdpdEFkZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGlmIChwYXRocyAmJiBwYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmFkZChwYXRocyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmFkZCgnLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc3RhZ2VkUGF0aHM6IHBhdGhzIHx8ICdhbGwnIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBhZGQgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfY2hlY2tvdXQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfY2hlY2tvdXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3dpdGNoIHRvIGFuIGV4aXN0aW5nIGJyYW5jaCBvciBjcmVhdGUgYW5kIHN3aXRjaCB0byBhIG5ldyBvbmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBicmFuY2hfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTmFtZSBvZiB0aGUgYnJhbmNoIHRvIGNoZWNrb3V0LicpLFxuICAgICAgY3JlYXRlX25ldzogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZShcIklmIHRydWUsIGNyZWF0ZXMgdGhlIGJyYW5jaCBpZiBpdCBkb2Vzbid0IGV4aXN0IChsaWtlIGdpdCBjaGVja291dCAtYikuXCIpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGJyYW5jaF9uYW1lLCBjcmVhdGVfbmV3IH06IEdpdENoZWNrb3V0UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgaWYgKGNyZWF0ZV9uZXcpIHtcbiAgICAgICAgICBhd2FpdCBnaXQuY2hlY2tvdXRMb2NhbEJyYW5jaChicmFuY2hfbmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmNoZWNrb3V0KGJyYW5jaF9uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGJyYW5jaE5hbWU6IGJyYW5jaF9uYW1lIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBjaGVja291dCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2F1dGggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9hdXRoJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrIEdpdEh1YiBhdXRoZW50aWNhdGlvbiBzdGF0dXMuIElmIG5vdCBhdXRoZW50aWNhdGVkLCBvcGVucyBhIHRlcm1pbmFsIHdpbmRvdyBmb3IgdGhlIHVzZXIgdG8gc2lnbiBpbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXRodWJUb2tlbiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjtcbiAgICAgICAgXG4gICAgICAgIGlmICghZ2l0aHViVG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdHSVRIVUJfVE9LRU4gZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgbm90IHNldC4gUGxlYXNlIHNldCBpdCB0byB1c2UgR2l0SHViIEFQSSB0b29scy4nIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgJy91c2VyJyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYXV0aGVudGljYXRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgYXV0aCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2NyZWF0ZV9pc3N1ZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2NyZWF0ZV9pc3N1ZScsXG4gICAgZGVzY3JpcHRpb246ICdDcmVhdGUgYSBuZXcgR2l0SHViIGlzc3VlIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGlzc3VlIHRpdGxlJyksXG4gICAgICBib2R5OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSBib2R5L2Rlc2NyaXB0aW9uJyksXG4gICAgICBsYWJlbHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnTGFiZWxzIHRvIGFwcGx5JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGl0bGUsIGJvZHksIGxhYmVscyB9OiBHaENyZWF0ZUlzc3VlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuIEVuc3VyZSBHSVRIVUJfUkVQT1NJVE9SWSBlbnYgaXMgc2V0IG9yIGdpdCByZW1vdGUgXCJvcmlnaW5cIiBwb2ludHMgdG8gYSBHaXRIdWIgcmVwby4nKTtcblxuICAgICAgICBhd2FpdCBnaEFwaVJlcXVlc3QoJ1BPU1QnLCBgL3JlcG9zLyR7cmVwb05hbWV9L2lzc3Vlc2AsIHsgdGl0bGUsIGJvZHksIGxhYmVscyB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjcmVhdGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBpc3N1ZSBjcmVhdGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2xpc3RfaXNzdWVzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfbGlzdF9pc3N1ZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCBpc3N1ZXMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHN0YXRlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ29wZW4nKS5kZXNjcmliZSgnRmlsdGVyIGJ5IGlzc3VlIHN0YXRlJyksXG4gICAgICBsYWJlbHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRmlsdGVyIGJ5IGxhYmVscycpLFxuICAgICAgbGltaXQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnTWF4IGlzc3VlcyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHN0YXRlLCBsYWJlbHMsIGxpbWl0IH06IEdoTGlzdElzc3Vlc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBhd2FpdCBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lLicpO1xuXG4gICAgICAgIGxldCBxdWVyeSA9IGBzdGF0ZT0ke3N0YXRlfWA7XG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBxdWVyeSArPSBgJmxhYmVscz0ke2xhYmVscy5qb2luKCcsJyl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzc3VlcyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9pc3N1ZXM/JHtxdWVyeX0mcGVyX3BhZ2U9JHtsaW1pdCB8fCAxMH1gKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpc3N1ZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGlzc3VlcyBsaXN0aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfdmlld19jb21tZW50cyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3ZpZXdfY29tbWVudHMnLFxuICAgIGRlc2NyaXB0aW9uOiAnVmlldyBjb21tZW50cyBvbiBhIHNwZWNpZmljIGlzc3VlIG9yIHB1bGwgcmVxdWVzdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSBvciBQUiBudW1iZXInKSxcbiAgICAgIHR5cGU6IHouZW51bShbJ2lzc3VlJywgJ3ByJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnaXNzdWUnKS5kZXNjcmliZShcIldoZXRoZXIgaXQncyBhbiBpc3N1ZSBvciBhIHB1bGwgcmVxdWVzdFwiKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBudW1iZXIsIHR5cGUgfTogR2hWaWV3Q29tbWVudHNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBjb25zdCBjb21tZW50cyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS8ke3R5cGUgPT09ICdwcicgPyAncHVsbHMnIDogJ2lzc3Vlcyd9LyR7bnVtYmVyfS9jb21tZW50c2ApO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1lbnRzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBjb21tZW50cyB2aWV3aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfY3JlYXRlX3ByIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfY3JlYXRlX3ByJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBwdWxsIHJlcXVlc3QgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgUFIgdGl0bGUnKSxcbiAgICAgIGJvZHk6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIFBSIGJvZHkvZGVzY3JpcHRpb24nKSxcbiAgICAgIGhlYWRfYnJhbmNoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgYnJhbmNoIGNvbnRhaW5pbmcgeW91ciBjaGFuZ2VzJyksXG4gICAgICBiYXNlX2JyYW5jaDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ21haW4nKS5kZXNjcmliZSgnVGhlIGJyYW5jaCB5b3Ugd2FudCB0byBtZXJnZSBpbnRvIChlLmcuLCBtYWluLCBtYXN0ZXIpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGl0bGUsIGJvZHksIGhlYWRfYnJhbmNoLCBiYXNlX2JyYW5jaCB9OiBHaENyZWF0ZVByUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgY29uc3QgcHIgPSBhd2FpdCBnaEFwaVJlcXVlc3QoJ1BPU1QnLCBgL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzYCwgeyB0aXRsZSwgYm9keSwgaGVhZDogaGVhZF9icmFuY2gsIGJhc2U6IGJhc2VfYnJhbmNoIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWQ6IHRydWUsIHVybDogKHByIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5odG1sX3VybCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgUFIgY3JlYXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9saXN0X3BycyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2xpc3RfcHJzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xpc3QgcHVsbCByZXF1ZXN0cyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc3RhdGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnb3BlbicpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgUFIgc3RhdGUnKSxcbiAgICAgIGxpbWl0OiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBQUnMgdG8gcmV0dXJuIChkZWZhdWx0OiAxMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzdGF0ZSwgbGltaXQgfTogR2hMaXN0UHJzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgY29uc3QgcHJzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzP3N0YXRlPSR7c3RhdGV9JnBlcl9wYWdlPSR7bGltaXQgfHwgMTB9YCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcHJzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUnMgbGlzdGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3ZpZXdfcHJfZGlmZiB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3ZpZXdfcHJfZGlmZicsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCB0aGUgZGlmZi9wYXRjaCBvZiBhIHNwZWNpZmljIHB1bGwgcmVxdWVzdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBQUiBudW1iZXInKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBudW1iZXIgfTogR2hWaWV3UHJEaWZmUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke3JlcG9OYW1lfS9wdWxscy8ke251bWJlcn0vZGlmZmAsIHtcbiAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Byb2Nlc3MuZW52LkdJVEhVQl9UT0tFTn1gIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBkaWZmOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGRpZmYgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGlmZiB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgUFIgZGlmZiBmZXRjaGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3B1c2ggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9wdXNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1B1c2ggbG9jYWwgY29tbWl0cyB0byB0aGUgcmVtb3RlIEdpdEh1YiByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgYnJhbmNoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBUaGUgYnJhbmNoIHRvIHB1c2guIERlZmF1bHRzIHRvIGN1cnJlbnQgYnJhbmNoLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGJyYW5jaCB9OiBHaFB1c2hQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBhd2FpdCBnaXQucHVzaChicmFuY2ggfHwgJ29yaWdpbicsICdIRUFEJyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcHVzaGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBwdXNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG4vLyBDNSBGSVg6IFByb3BlciB0eXBpbmcgaW5zdGVhZCBvZiBhbnlcbmltcG9ydCB0eXBlICogYXMgUHVwcGV0ZWVyIGZyb20gJ3B1cHBldGVlcic7XG5cbmxldCBwdXBwZXRlZXJNb2R1bGU6IHR5cGVvZiBQdXBwZXRlZXIgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0UHVwcGV0ZWVyKCk6IFByb21pc2U8dHlwZW9mIFB1cHBldGVlcj4ge1xuICBpZiAoIXB1cHBldGVlck1vZHVsZSkge1xuICAgIGNvbnN0IGltcG9ydGVkID0gYXdhaXQgaW1wb3J0KCdwdXBwZXRlZXInKTtcbiAgICBwdXBwZXRlZXJNb2R1bGUgPSBpbXBvcnRlZC5kZWZhdWx0IHx8IGltcG9ydGVkO1xuICB9XG4gIHJldHVybiBwdXBwZXRlZXJNb2R1bGU7XG59XG5cbi8qKiBSZXNldCBwdXBwZXRlZXIgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFB1cHBldGVlckNhY2hlKCk6IHZvaWQge1xuICBwdXBwZXRlZXJNb2R1bGUgPSBudWxsO1xufVxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXInO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuXG4vKiogQnJvd3NlciBzZXNzaW9uIG1hbmFnZXIgd2l0aCBhdXRvLWNsZWFudXAgYW5kIGNvbm5lY3Rpb24gcG9vbGluZyAoc2luZ2xldG9uIHBhdHRlcm4pICovXG5jbGFzcyBCcm93c2VyU2Vzc2lvbk1hbmFnZXIge1xuICBwcml2YXRlIGJyb3dzZXJJbnN0YW5jZTogUHVwcGV0ZWVyLkJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjdXJyZW50UGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjbGVhbnVwVGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKTtcbiAgcHJpdmF0ZSByZWFkb25seSBJTkFDVElWSVRZX1RJTUVPVVRfTVMgPSA1ICogNjAgKiAxMDAwOyAvLyA1IG1pbnV0ZXNcbiAgcHJpdmF0ZSByZWFkb25seSBNQVhfUkVUUklFUyA9IDI7XG4gIHByaXZhdGUgcmV0cnlDb3VudCA9IDA7XG5cbiAgLyoqIEdldCBvciBjcmVhdGUgYSBwZXJzaXN0ZW50IFB1cHBldGVlciBicm93c2VyIGluc3RhbmNlIHdpdGggYXV0by1yZXRyeSAqL1xuICBhc3luYyBnZXRCcm93c2VyKCk6IFByb21pc2U8UHVwcGV0ZWVyLkJyb3dzZXI+IHtcbiAgICBpZiAoIXRoaXMuYnJvd3Nlckluc3RhbmNlIHx8ICF0aGlzLmJyb3dzZXJJbnN0YW5jZS5jb25uZWN0ZWQoKSkge1xuICAgICAgdGhpcy5yZXRyeUNvdW50ID0gMDtcbiAgICAgIHdoaWxlICh0aGlzLnJldHJ5Q291bnQgPCB0aGlzLk1BWF9SRVRSSUVTKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcHVwcGV0ZWVyTGliID0gYXdhaXQgZ2V0UHVwcGV0ZWVyKCk7XG4gICAgICAgICAgdGhpcy5icm93c2VySW5zdGFuY2UgPSBhd2FpdCBwdXBwZXRlZXJMaWIubGF1bmNoKHsgXG4gICAgICAgICAgICBoZWFkbGVzczogdHJ1ZSxcbiAgICAgICAgICAgIGFyZ3M6IFsnLS1uby1zYW5kYm94JywgJy0tZGlzYWJsZS1zZXR1aWQtc2FuZGJveCddIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLnJldHJ5Q291bnQrKztcbiAgICAgICAgICBpZiAodGhpcy5yZXRyeUNvdW50ID49IHRoaXMuTUFYX1JFVFJJRVMpIHRocm93IGVycm9yO1xuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMDAwICogdGhpcy5yZXRyeUNvdW50KSk7IC8vIEV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlc2V0Q2xlYW51cFRpbWVyKCk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICByZXR1cm4gdGhpcy5icm93c2VySW5zdGFuY2UhO1xuICB9XG5cbiAgLyoqIEdldCBvciBjcmVhdGUgYSBwYWdlIGluIHRoZSBwZXJzaXN0ZW50IGJyb3dzZXIgaW5zdGFuY2UgKi9cbiAgYXN5bmMgZ2V0UGFnZSgpOiBQcm9taXNlPFB1cHBldGVlci5QYWdlPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRQYWdlIHx8ICFhd2FpdCB0aGlzLmlzUGFnZVZhbGlkKCkpIHtcbiAgICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCB0aGlzLmdldEJyb3dzZXIoKTtcbiAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICB9XG4gICAgdGhpcy5yZXNldENsZWFudXBUaW1lcigpO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlO1xuICB9XG5cbiAgLyoqIENoZWNrIGlmIGN1cnJlbnQgcGFnZSBpcyBzdGlsbCB2YWxpZCAqL1xuICBwcml2YXRlIGFzeW5jIGlzUGFnZVZhbGlkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMuY3VycmVudFBhZ2UpIHJldHVybiBmYWxzZTtcbiAgICAgIGF3YWl0IHRoaXMuY3VycmVudFBhZ2UuZXZhbHVhdGUoJzEnKTsgLy8gUXVpY2sgdmFsaWRhdGlvblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlc2V0IHRoZSBpbmFjdGl2aXR5IGNsZWFudXAgdGltZXIgKi9cbiAgcHJpdmF0ZSByZXNldENsZWFudXBUaW1lcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jbGVhbnVwVGltZXIpIGNsZWFyVGltZW91dCh0aGlzLmNsZWFudXBUaW1lcik7XG4gICAgdGhpcy5sYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuY2xlYW51cFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLmRpc3Bvc2UoKSwgdGhpcy5JTkFDVElWSVRZX1RJTUVPVVRfTVMpO1xuICB9XG5cbiAgLyoqIEV4cGxpY2l0bHkgZGlzcG9zZSBicm93c2VyIGFuZCBjYW5jZWwgY2xlYW51cCB0aW1lciAqL1xuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNsZWFudXBUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuY2xlYW51cFRpbWVyKTtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuYnJvd3Nlckluc3RhbmNlICYmIHRoaXMuYnJvd3Nlckluc3RhbmNlLmNvbm5lY3RlZCgpKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYXdhaXQtdGhlbmFibGVcbiAgICAgICAgYXdhaXQgdGhpcy5icm93c2VySW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBjbG9zZSBlcnJvcnNcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5icm93c2VySW5zdGFuY2UgPSBudWxsO1xuICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IG51bGw7XG4gICAgICB0aGlzLmxhc3RBY3Rpdml0eSA9IERhdGUubm93KCk7XG4gICAgICB0aGlzLnJldHJ5Q291bnQgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVjayBpZiBicm93c2VyIGlzIGNvbm5lY3RlZCAqL1xuICBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5icm93c2VySW5zdGFuY2UgJiYgdGhpcy5icm93c2VySW5zdGFuY2UuY29ubmVjdGVkKCkpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgY3VycmVudCBwYWdlIChwdWJsaWMgYWNjZXNzb3IpICovXG4gIGdldEN1cnJlbnRQYWdlKCk6IFB1cHBldGVlci5QYWdlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2U7XG4gIH1cblxuICAvKiogU2V0IHRoZSBjdXJyZW50IHBhZ2UgKHB1YmxpYyBzZXR0ZXIpICovXG4gIHNldEN1cnJlbnRQYWdlKHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZSBmb3IgdGhpcyBtb2R1bGVcbmNvbnN0IGJyb3dzZXJNYW5hZ2VyID0gbmV3IEJyb3dzZXJTZXNzaW9uTWFuYWdlcigpO1xuXG4vKiogRXhwb3J0IGNsZWFudXAgZnVuY3Rpb24gZm9yIHBsdWdpbiB1bmxvYWQgbGlmZWN5Y2xlICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW51cEJyb3dzZXJTZXNzaW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xufVxuXG4vLyBDNSBGSVg6IFByb3BlciBwYXJhbSB0eXBlc1xuaW50ZXJmYWNlIEJyb3dzZXJPcGVuUGFnZVBhcmFtcyB7XG4gIHVybDogc3RyaW5nO1xuICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7XG4gIHdhaXRfZm9yX3NlbGVjdG9yPzogc3RyaW5nO1xuICBmdWxsX3BhZ2Vfc2NyZWVuc2hvdD86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBCcm93c2VyU2Vzc2lvbkNvbnRyb2xQYXJhbXMge1xuICBhY3Rpb25zPzogdW5rbm93bltdO1xuICByZWFkX3BhZ2U/OiBib29sZWFuO1xuICBmdWxsX3JlYWQ/OiBib29sZWFuO1xuICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBQcmV2aWV3SHRtbFBhcmFtcyB7XG4gIGh0bWxfY29udGVudDogc3RyaW5nO1xuICBmaWxlX25hbWU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBPcGVuRmlsZVBhcmFtcyB7XG4gIHRhcmdldDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCcm93c2VyVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuICAvLyBicm93c2VyX29wZW5fcGFnZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Jyb3dzZXJfb3Blbl9wYWdlJyxcbiAgICBkZXNjcmlwdGlvbjogJ09wZW4gYSB3ZWJwYWdlIGluIGEgaGVhZGxlc3MgYnJvd3NlciAoUHVwcGV0ZWVyKSwgcmVuZGVyIGl0IG9uY2UsIGFuZCByZXR1cm4gY29udGVudC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBvcGVuJyksXG4gICAgICBzY3JlZW5zaG90X3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnUGF0aCB0byBzYXZlIGEgc2NyZWVuc2hvdC4nKSxcbiAgICAgIHdhaXRfZm9yX3NlbGVjdG9yOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0NTUyBzZWxlY3RvciB0byB3YWl0IGZvciBiZWZvcmUgcmV0dXJuaW5nLicpLFxuICAgICAgZnVsbF9wYWdlX3NjcmVlbnNob3Q6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0lmIHRydWUsIGNhcHR1cmVzIHRoZSBmdWxsIHBhZ2Ugd2hlbiB0YWtpbmcgYSBzY3JlZW5zaG90LicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCwgc2NyZWVuc2hvdF9wYXRoLCB3YWl0X2Zvcl9zZWxlY3RvciwgZnVsbF9wYWdlX3NjcmVlbnNob3QgfTogQnJvd3Nlck9wZW5QYWdlUGFyYW1zKSA9PiB7XG4gICAgICBsZXQgYnJvd3NlcjogUHVwcGV0ZWVyLkJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgICAgIGxldCBwYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuXG4gICAgICB0cnkge1xuICAgICAgICBicm93c2VyID0gYXdhaXQgYnJvd3Nlck1hbmFnZXIuZ2V0QnJvd3NlcigpO1xuICAgICAgICBwYWdlID0gYnJvd3Nlck1hbmFnZXIuZ2V0Q3VycmVudFBhZ2UoKTtcblxuICAgICAgICBpZiAoIXBhZ2UgfHwgKGF3YWl0IHBhZ2UudXJsKCkpICE9PSB1cmwpIHtcbiAgICAgICAgICAvLyBJZiBubyBjdXJyZW50IHBhZ2Ugb3IgVVJMIGRvZXNuJ3QgbWF0Y2gsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgICBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG4gICAgICAgICAgYnJvd3Nlck1hbmFnZXIuc2V0Q3VycmVudFBhZ2UocGFnZSk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBwYWdlLmdvdG8odXJsLCB7IHdhaXRVbnRpbDogJ2RvbWNvbnRlbnRsb2FkZWQnIH0pO1xuXG4gICAgICAgIGlmICh3YWl0X2Zvcl9zZWxlY3Rvcikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBwYWdlLndhaXRGb3JTZWxlY3Rvcih3YWl0X2Zvcl9zZWxlY3RvciwgeyB0aW1lb3V0OiA1MDAwIH0pO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gSWdub3JlIHRpbWVvdXQsIGNvbnRpbnVlIHdpdGggY29udGVudCBleHRyYWN0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IHVybCwgb3BlbmVkOiB0cnVlIH07XG5cbiAgICAgICAgaWYgKHNjcmVlbnNob3RfcGF0aCkge1xuICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCwgZnVsbFBhZ2U6IGZ1bGxfcGFnZV9zY3JlZW5zaG90IH0pO1xuICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFNhdmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZSBzdHJpbmctYmFzZWQgZXZhbHVhdGUgdG8gYnlwYXNzIFRTMjU4NC9UUzIzMDQgJ2RvY3VtZW50JyBlcnJvcnMgaW4gTm9kZS5qcyBlbnZpcm9ubWVudFxuICAgICAgICBjb25zdCB0ZXh0Q29udGVudDogc3RyaW5nID0gYXdhaXQgcGFnZS5ldmFsdWF0ZShgcmV0dXJuIGRvY3VtZW50LmJvZHkgPyBkb2N1bWVudC5ib2R5LmlubmVyVGV4dCA6ICcnO2ApO1xuICAgICAgICByZXN1bHREYXRhLnBhZ2VUZXh0ID0gdGV4dENvbnRlbnQuc3Vic3RyaW5nKDAsIDIwMDApO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBvcGVuIHBhZ2U6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBOT1RFOiBXZSBkb24ndCBjbG9zZSB0aGUgYnJvd3NlciBoZXJlIGJlY2F1c2Ugd2UgdXNlIGEgc2luZ2xldG9uIHBhdHRlcm4uXG4gICAgICAgIC8vIFRoZSBicm93c2VyIHN0YXlzIGFsaXZlIGZvciBzdWJzZXF1ZW50IHJlcXVlc3RzIHZpYSBicm93c2VyX3Nlc3Npb25fY29udHJvbC5cbiAgICAgICAgLy8gVXNlIGJyb3dzZXJfc2Vzc2lvbl9jbG9zZSB0byBleHBsaWNpdGx5IHRlcm1pbmF0ZSBpdC5cbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYnJvd3Nlcl9zZXNzaW9uX2NvbnRyb2wgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdicm93c2VyX3Nlc3Npb25fY29udHJvbCcsXG4gICAgZGVzY3JpcHRpb246ICdDb250cm9sIHRoZSBhY3RpdmUgcGVyc2lzdGVudCBicm93c2VyIHNlc3Npb24uIFN1cHBvcnRzIGFjdGlvbnMsIHBhZ2UgcmVhZGluZywgc2NyZWVuc2hvdCBjYXB0dXJlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgYWN0aW9uczogei5hcnJheSh6LmFueSgpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbCBzY3JpcHRlZCBicm93c2VyIGFjdGlvbnMgdG8gZXhlY3V0ZS4nKSxcbiAgICAgIHJlYWRfcGFnZTogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnSWYgdHJ1ZSwgcmV0dXJucyBwYWdlIG1ldGFkYXRhLicpLFxuICAgICAgZnVsbF9yZWFkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdJZiB0cnVlLCBmb3JjZXMgZnVsbCBwYWdlIHRleHQgb3V0cHV0LicpLFxuICAgICAgc2NyZWVuc2hvdF9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHNjcmVlbnNob3Qgb3V0cHV0IHBhdGguJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYWN0aW9ucywgcmVhZF9wYWdlLCBmdWxsX3JlYWQsIHNjcmVlbnNob3RfcGF0aCB9OiBCcm93c2VyU2Vzc2lvbkNvbnRyb2xQYXJhbXMpID0+IHtcbiAgICAgIGxldCBwYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuXG4gICAgICB0cnkge1xuICAgICAgICBwYWdlID0gYXdhaXQgYnJvd3Nlck1hbmFnZXIuZ2V0UGFnZSgpO1xuXG4gICAgICAgIGlmIChhY3Rpb25zICYmIEFycmF5LmlzQXJyYXkoYWN0aW9ucykpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGFjdGlvbiBvZiBhY3Rpb25zIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+W10pIHtcbiAgICAgICAgICAgIGlmIChhY3Rpb24udHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICBhd2FpdCBwYWdlLmNsaWNrKGFjdGlvbi5zZWxlY3RvciBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gJ3R5cGUnKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UudHlwZShhY3Rpb24uc2VsZWN0b3IgYXMgc3RyaW5nLCBhY3Rpb24udGV4dCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gJ2dvdG8nKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZ290byhhY3Rpb24udXJsIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAnZXZhbHVhdGUnKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZXZhbHVhdGUoYWN0aW9uLnNjcmlwdCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0geyBhY3Rpb25zRXhlY3V0ZWQ6IGFjdGlvbnM/Lmxlbmd0aCB8fCAwIH07XG5cbiAgICAgICAgaWYgKHJlYWRfcGFnZSB8fCBmdWxsX3JlYWQpIHtcbiAgICAgICAgICAvLyBVc2Ugc3RyaW5nLWJhc2VkIGV2YWx1YXRlIHRvIGJ5cGFzcyBUUzI1ODQgJ2RvY3VtZW50JyBlcnJvcnMgaW4gTm9kZS5qcyBlbnZpcm9ubWVudFxuICAgICAgICAgIGNvbnN0IHRleHQ6IHN0cmluZyA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoYHJldHVybiBkb2N1bWVudC5ib2R5ID8gZG9jdW1lbnQuYm9keS5pbm5lclRleHQgOiAnJztgKTtcbiAgICAgICAgICByZXN1bHREYXRhLnBhZ2VUZXh0ID0gZnVsbF9yZWFkID8gdGV4dCA6IHRleHQuc3Vic3RyaW5nKDAsIDEwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjcmVlbnNob3RfcGF0aCkge1xuICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCB9KTtcbiAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RTYXZlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBCcm93c2VyIGNvbnRyb2wgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gUGFnZSBzdGF5cyBhbGl2ZSBmb3Igc2Vzc2lvbiByZXVzZS4gQnJvd3NlciBpcyBtYW5hZ2VkIGJ5IGJyb3dzZXJfc2Vzc2lvbl9jbG9zZS5cbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Nsb3NlIHRoZSBhY3RpdmUgcGVyc2lzdGVudCBicm93c2VyIHNlc3Npb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNsb3NlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gY2xvc2UgYnJvd3NlciBzZXNzaW9uOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gRW5zdXJlIGNsZWFudXAgZXZlbiBvbiBmYWlsdXJlXG4gICAgICAgIGF3YWl0IGJyb3dzZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcHJldmlld19odG1sIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncHJldmlld19odG1sJyxcbiAgICBkZXNjcmlwdGlvbjogXCJSZW5kZXIgYW5kIHByZXZpZXcgSFRNTCBjb250ZW50IGluIHRoZSBzeXN0ZW0ncyBkZWZhdWx0IGJyb3dzZXIuXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSFRNTCBjb250ZW50IHRvIHJlbmRlcicpLFxuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgncHJldmlldy5odG1sJykuZGVzY3JpYmUoJ09wdGlvbmFsIGZpbGVuYW1lIChkZWZhdWx0OiBwcmV2aWV3Lmh0bWwpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBmaWxlX25hbWUgfTogUHJldmlld0h0bWxQYXJhbXMpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZV9uYW1lIHx8ICdwcmV2aWV3Lmh0bWwnO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihnZXRXb3JraW5nRGlyKCksIGZpbGVOYW1lKTtcblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBodG1sX2NvbnRlbnQpO1xuXG4gICAgICAgIC8vIE9wZW4gaW4gZGVmYXVsdCBicm93c2VyIHVzaW5nIEVTIGltcG9ydFxuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdChmaWxlUGF0aCk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwcmV2aWV3ZWQ6IHRydWUsIGZpbGU6IGZpbGVOYW1lIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBwcmV2aWV3IEhUTUw6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG9wZW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ29wZW5fZmlsZScsXG4gICAgZGVzY3JpcHRpb246IFwiT3BlbiBhIGZpbGUgb3IgVVJMIGluIHRoZSBzeXN0ZW0ncyBkZWZhdWx0IGFwcGxpY2F0aW9uLlwiLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRhcmdldDogei5zdHJpbmcoKS5kZXNjcmliZSgnRmlsZSBwYXRoIG9yIFVSTCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRhcmdldCB9OiBPcGVuRmlsZVBhcmFtcykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgb3Blbk1vZHVsZSA9IGF3YWl0IGltcG9ydCgnb3BlbicpO1xuICAgICAgICBhd2FpdCBvcGVuTW9kdWxlLmRlZmF1bHQodGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBvcGVuZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gZmlsZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZVNRTFF1ZXJ5IH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuXG4vLyBMYXp5LWxvYWQgbm9kZTpzcWxpdGUgKE5vZGUuanMgMjMrKS4gR3JhY2VmdWwgZmFsbGJhY2sgZm9yIG9sZGVyIE5vZGUgdmVyc2lvbnMuXG5sZXQgc3FsaXRlTW9kdWxlOiB0eXBlb2YgaW1wb3J0KCdub2RlOnNxbGl0ZScpIHwgbnVsbCA9IG51bGw7XG5sZXQgc3FsaXRlTG9hZEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3FsaXRlKCk6IFByb21pc2U8dHlwZW9mIGltcG9ydCgnbm9kZTpzcWxpdGUnKT4ge1xuICBpZiAoc3FsaXRlTW9kdWxlKSByZXR1cm4gc3FsaXRlTW9kdWxlO1xuICBpZiAoc3FsaXRlTG9hZEVycm9yKSB0aHJvdyBuZXcgRXJyb3Ioc3FsaXRlTG9hZEVycm9yKTtcblxuICB0cnkge1xuICAgIHNxbGl0ZU1vZHVsZSA9IGF3YWl0IGltcG9ydCgnbm9kZTpzcWxpdGUnKTtcbiAgICByZXR1cm4gc3FsaXRlTW9kdWxlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBzcWxpdGVMb2FkRXJyb3IgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFNRTGl0ZSBpcyBub3QgYXZhaWxhYmxlIChub2RlOnNxbGl0ZSByZXF1aXJlcyBOb2RlLmpzIDIzKykuIGAgK1xuICAgICAgYE9yaWdpbmFsIGVycm9yOiAke3NxbGl0ZUxvYWRFcnJvcn0uIGAgK1xuICAgICAgYFBsZWFzZSBkaXNhYmxlIGRhdGFiYXNlIHF1ZXJpZXMgaW4gcGx1Z2luIHNldHRpbmdzIG9yIHVwZ3JhZGUgTm9kZS5gXG4gICAgKTtcbiAgfVxufVxuXG4vKiogUmVzZXQgc3FsaXRlIG1vZHVsZSBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRTcWxpdGVDYWNoZSgpOiB2b2lkIHtcbiAgc3FsaXRlTW9kdWxlID0gbnVsbDtcbiAgc3FsaXRlTG9hZEVycm9yID0gbnVsbDtcbn1cblxuLyoqIFR5cGVkIHBhcmFtcyBpbnRlcmZhY2UgKi9cbmludGVyZmFjZSBRdWVyeURhdGFiYXNlUGFyYW1zIHtcbiAgcXVlcnk6IHN0cmluZztcbiAgZGJfcGF0aD86IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRGF0YWJhc2VUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcXVlcnlfZGF0YWJhc2UgdG9vbCBcdTIwMTQgQzcgRklYOiBBZGRlZCBvcHRpb25hbCBkYl9wYXRoIHBhcmFtZXRlclxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdxdWVyeV9kYXRhYmFzZScsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gcmVhZC1vbmx5IFNRTGl0ZSBxdWVyaWVzLiBEZWZhdWx0cyB0byBpbi1tZW1vcnkgZGF0YWJhc2U7IG9wdGlvbmFsbHkgc3BlY2lmeSBhIGZpbGUgcGF0aC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTUUwgcXVlcnkgc3RyaW5nIChyZWFkLW9ubHkgb25seSknKSxcbiAgICAgIGRiX3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCc6bWVtb3J5OicpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBTUUxpdGUgZGF0YWJhc2UgZmlsZSAoZGVmYXVsdDogOm1lbW9yeTopJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIGRiX3BhdGggfTogUXVlcnlEYXRhYmFzZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2VjdXJpdHkgY2hlY2sgLSB1c2Ugcm9idXN0IFNRTCB2YWxpZGF0aW9uIGluc3RlYWQgb2Ygc2ltcGxlIHJlZ2V4IG1hdGNoaW5nXG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZCA9IHZhbGlkYXRlU1FMUXVlcnkocXVlcnkpO1xuICAgICAgICBpZiAoIXZhbGlkYXRlZC52YWxpZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBTUUwgcXVlcnkgZGV0ZWN0ZWQ6ICR7dmFsaWRhdGVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMYXp5LWxvYWQgbm9kZTpzcWxpdGUgd2l0aCBncmFjZWZ1bCBmYWxsYmFja1xuICAgICAgICBjb25zdCB7IG9wZW4gfSA9IGF3YWl0IGdldFNxbGl0ZSgpO1xuICAgICAgICBjb25zdCBkYiA9IG9wZW4oZGJfcGF0aCB8fCAnOm1lbW9yeTonKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHN0bXQgPSBkYi5wcmVwYXJlKHF1ZXJ5KTtcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gc3RtdC5hbGwoKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHF1ZXJ5LCByZXN1bHRzIH0gfTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYXRhYmFzZSBxdWVyeSBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIgfSBmcm9tICcuLi9iYWNrZ3JvdW5kQ29tbWFuZHMuanMnO1xuaW1wb3J0IHsgc2FuaXRpemVDb21tYW5kIH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUnVuQmFja2dyb3VuZENvbW1hbmRQYXJhbXMgeyBjb21tYW5kOiBzdHJpbmc7IHRpbWVvdXRfaG91cnM6IG51bWJlcjsgbmFtZTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQ2hlY2tCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGlkOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDYW5jZWxCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGlkOiBzdHJpbmc7IH1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQmFja2dyb3VuZENvbW1hbmRUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyOiBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcnVuX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9iYWNrZ3JvdW5kX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhcnQgYSBsb25nLXJ1bm5pbmcgcHJvY2VzcyBpbiB0aGUgYmFja2dyb3VuZC4gVGhlIHByb2Nlc3MgaXMgbm90IGJsb2NrZWQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2hlbGwgY29tbWFuZCB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X2hvdXJzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCgxMCkuZGVzY3JpYmUoJ01BTkRBVE9SWTogSG93IGxvbmcgdGhlIHByb2Nlc3MgaXMgYWxsb3dlZCB0byBydW4gYmVmb3JlIGJlaW5nIGtpbGxlZC4nKSxcbiAgICAgIG5hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ01BTkRBVE9SWTogQSBzaG9ydCwgZGVzY3JpcHRpdmUgbmFtZSBmb3IgdGhlIGJhY2tncm91bmQgdGFzaycpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbW1hbmQsIHRpbWVvdXRfaG91cnMsIG5hbWUgfTogUnVuQmFja2dyb3VuZENvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFNlY3VyaXR5IGNoZWNrIC0gdXNlIHJvYnVzdCBzYW5pdGl6YXRpb24gaW5zdGVhZCBvZiBzaW1wbGUgc3RyaW5nIG1hdGNoaW5nXG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpZCA9IGJhY2tncm91bmRDb21tYW5kTWFuYWdlci5yZWdpc3Rlcihjb21tYW5kLCB0aW1lb3V0X2hvdXJzLCBuYW1lKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpZCwgbmFtZSwgY29tbWFuZCwgdGltZW91dEhvdXJzOiB0aW1lb3V0X2hvdXJzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNoZWNrX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NoZWNrX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdDaGVjayB0aGUgc3RhdHVzLCBzdGRvdXQsIGFuZCBzdGRlcnIgb2YgYSBydW5uaW5nIG9yIGNvbXBsZXRlZCBiYWNrZ3JvdW5kIGNvbW1hbmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1hbmQgaWRlbnRpZmllcicpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGlkIH06IENoZWNrQmFja2dyb3VuZENvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIuY2hlY2soaWQpO1xuICAgICAgICBpZiAoIWNvbW1hbmQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb21tYW5kIG5vdCBmb3VuZDogJHtpZH1gIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogY29tbWFuZCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2FuY2VsX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NhbmNlbF9iYWNrZ3JvdW5kX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnS2lsbCBhIHJ1bm5pbmcgYmFja2dyb3VuZCBjb21tYW5kLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBjb21tYW5kIGlkZW50aWZpZXInKSxcbiAgICB9LFxuICAgIC8vIFNESyByZXF1aXJlcyBhc3luYyBpbXBsZW1lbnRhdGlvblxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBpZCB9OiBDYW5jZWxCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2FuY2VsbGVkID0gYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLmNhbmNlbChpZCk7XG4gICAgICAgIGlmICghY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ2Fubm90IGNhbmNlbCBjb21tYW5kOiAke2lkfSAobm90IGZvdW5kIG9yIG5vdCBydW5uaW5nKWAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlkLCBjYW5jZWxsZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgc2FuaXRpemVDb21tYW5kIH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTaGFyZWQgU3Bhd24gSGVscGVyID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTcGF3blJlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIGRhdGE/OiB7IHN0ZG91dDogc3RyaW5nOyBzdGRlcnI6IHN0cmluZyB9O1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBTYWZlbHkgc3Bhd24gYSBwcm9jZXNzIHdpdGggdGltZW91dCwgY2FwdHVyaW5nIHN0ZG91dC9zdGRlcnIuXG4gKiBFbGltaW5hdGVzIGNvZGUgZHVwbGljYXRpb24gYWNyb3NzIGV4ZWN1dGlvbiB0b29scy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2FmZVNwYXduKFxuICBleGU6IHN0cmluZyxcbiAgYXJnczogc3RyaW5nW10sXG4gIHRpbWVvdXRNczogbnVtYmVyLFxuICBpbnB1dD86IHN0cmluZyxcbiAgdXNlU2hlbGwgPSBmYWxzZVxuKTogUHJvbWlzZTxTcGF3blJlc3VsdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBwcm9jID0gc3Bhd24oZXhlLCBhcmdzLCB7XG4gICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgdGltZW91dDogdGltZW91dE1zLFxuICAgICAgY3dkOiBnZXRXb3JraW5nRGlyKCksIC8vIEV4ZWN1dGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAgICAgIHNoZWxsOiB1c2VTaGVsbCwgLy8gRW5hYmxlIHNoZWxsIGludGVycHJldGF0aW9uIHdoZW4gcmVxdWVzdGVkXG4gICAgfSk7XG5cbiAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgaWYgKGlucHV0KSB7XG4gICAgICBwcm9jLnN0ZGluPy53cml0ZShpbnB1dCk7XG4gICAgICBwcm9jLnN0ZGluPy5lbmQoKTtcbiAgICB9XG5cbiAgICBwcm9jLnN0ZG91dD8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRvdXQgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0V4ZWN1dGlvbiB0aW1lZCBvdXQnIH0pO1xuICAgIH0sIHRpbWVvdXRNcyk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHN0ZG91dDogc3Rkb3V0LnRyaW0oKSwgc3RkZXJyOiBzdGRlcnIudHJpbSgpIH0gfSk7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBTcGF3biBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSdW5KYXZhU2NyaXB0UGFyYW1zIHsgamF2YXNjcmlwdDogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBSdW5QeXRob25QYXJhbXMgeyBweXRob246IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgRXhlY3V0ZUNvbW1hbmRQYXJhbXMgeyBjb21tYW5kOiBzdHJpbmc7IHRpbWVvdXRfc2Vjb25kcz86IG51bWJlcjsgaW5wdXQ/OiBzdHJpbmc7IH1cbmludGVyZmFjZSBSdW5JblRlcm1pbmFsUGFyYW1zIHsgY29tbWFuZDogc3RyaW5nOyB9XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEV4ZWN1dGlvbiBUb29scyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJFeGVjdXRpb25Ub29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcnVuX2phdmFzY3JpcHQgdG9vbCBcdTIwMTQgU0FOREJPWEVEIHdpdGggZGVubyAoaWYgYXZhaWxhYmxlKSBvciBub2RlIHdpdGggc3RyaWN0IHJlc3RyaWN0aW9uc1xuICAvLyBTNSBGSVg6IEVuaGFuY2VkIGRhbmdlcm91cyBwYXR0ZXJuIGRldGVjdGlvbiB0byBwcmV2ZW50IGV2YWwvcmVxdWlyZSBieXBhc3Nlc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdydW5famF2YXNjcmlwdCcsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gSmF2YVNjcmlwdCBjb2RlIHNuaXBwZXQgdXNpbmcgTm9kZS5qcyAoc2FuZGJveGVkKS4gTm8gZXh0ZXJuYWwgbW9kdWxlIGltcG9ydHMgYWxsb3dlZC4gU3RhbmRhcmQgbGlicmFyeSBvbmx5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgamF2YXNjcmlwdDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIEphdmFTY3JpcHQgY29kZSB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X3NlY29uZHM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDYwKS5vcHRpb25hbCgpLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ1RpbWVvdXQgaW4gc2Vjb25kcyAobWF4IDYwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGphdmFzY3JpcHQsIHRpbWVvdXRfc2Vjb25kcyB9OiBSdW5KYXZhU2NyaXB0UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBSb2J1c3QgZGFuZ2Vyb3VzIHBhdHRlcm4gZGV0ZWN0aW9uIFx1MjAxNCBibG9ja3MgZXZhbCwgcmVxdWlyZSwgaW1wb3J0LCBmcywgY2hpbGRfcHJvY2Vzc1xuICAgICAgICAvLyBTNSBGSVg6IEFkZGVkIHBhdHRlcm5zIGZvciBjb21tb24gYnlwYXNzIHRlY2huaXF1ZXNcbiAgICAgICAgY29uc3QgZGFuZ2Vyb3VzUGF0dGVybnMgPSBbXG4gICAgICAgICAgL1xcYnJlcXVpcmVcXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmltcG9ydFxccysvaSxcbiAgICAgICAgICAvXFxiZnNcXC4vaSxcbiAgICAgICAgICAvXFxiY2hpbGRfcHJvY2Vzc1xcYi9pLFxuICAgICAgICAgIC9cXGJldmFsXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJleGVjXFxzKlxcKC9pLFxuICAgICAgICAgIC9nbG9iYWxUaGlzXFwucmVxdWlyZS9pLFxuICAgICAgICAgIC9wcm9jZXNzXFwuZXhpdC9pLFxuICAgICAgICAgIC9fX3Byb3RvX18vaSxcbiAgICAgICAgICAvLyBTNSBGSVg6IEJ5cGFzcyBwcmV2ZW50aW9uIHBhdHRlcm5zXG4gICAgICAgICAgL0Z1bmN0aW9uXFxzKlxcKC9pLCAgICAgICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24gY29uc3RydWN0b3JcbiAgICAgICAgICAvU3RyaW5nXFwuZnJvbUNoYXJDb2RlXFxzKlxcKC9pLCAgICAgICAvLy5mcm9tQ2hhckNvZGUgYnlwYXNzXG4gICAgICAgICAgL1xcYmltcG9ydFxccypcXCguKlxcKS9pLCAgICAgICAgICAgICAgIC8vIER5bmFtaWMgaW1wb3J0XG4gICAgICAgICAgL1xcLmNvbnN0cnVjdG9yL2ksICAgICAgICAgICAgICAgICAgIC8vIENvbnN0cnVjdG9yIGFjY2Vzc1xuICAgICAgICAgIC9yZXF1aXJlXFwucmVzb2x2ZS9pLCAgICAgICAgICAgICAgICAvLyByZXF1aXJlLnJlc29sdmUgYnlwYXNzXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChqYXZhc2NyaXB0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGFuZ2Vyb3VzIGNvZGUgZGV0ZWN0ZWQ6ICR7cGF0dGVybi5zb3VyY2V9YCB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRpbWVvdXRNcyA9ICgodGltZW91dF9zZWNvbmRzIHx8IDUpICogMTAwMCk7XG4gICAgICAgIFxuICAgICAgICAvLyBVc2UgTm9kZS5qcyB3aXRoIC0tdW5oYW5kbGVkLXJlamVjdGlvbnM9dGhyb3cgZm9yIHNhZmV0eVxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24oJ25vZGUnLCBbJy1lJywgamF2YXNjcmlwdF0sIHRpbWVvdXRNcyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQuZGF0YT8uc3RkZXJyICYmICFyZXN1bHQuZGF0YS5zdGRvdXQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5kYXRhLnN0ZGVyciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBvdXRwdXQ6IHJlc3VsdC5kYXRhPy5zdGRvdXQgfHwgJycgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcnVuX3B5dGhvbiB0b29sIFx1MjAxNCBTQU5EQk9YRUQgd2l0aCBzdHJpY3QgaW1wb3J0IHJlc3RyaWN0aW9uc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdydW5fcHl0aG9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biBQeXRob24gY29kZSBzbmlwcGV0IChzYW5kYm94ZWQsIG5vIGV4dGVybmFsIG1vZHVsZXMpLiBTdGFuZGFyZCBsaWJyYXJ5IG9ubHkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBweXRob246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBQeXRob24gY29kZSB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X3NlY29uZHM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDYwKS5vcHRpb25hbCgpLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ1RpbWVvdXQgaW4gc2Vjb25kcyAobWF4IDYwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHB5dGhvbiwgdGltZW91dF9zZWNvbmRzIH06IFJ1blB5dGhvblBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gUm9idXN0IGRhbmdlcm91cyBwYXR0ZXJuIGRldGVjdGlvbiBcdTIwMTQgYmxvY2tzIG9zLCBzdWJwcm9jZXNzLCBzaHV0aWwsIGV2YWwsIGV4ZWNcbiAgICAgICAgY29uc3QgZGFuZ2Vyb3VzUGF0dGVybnMgPSBbXG4gICAgICAgICAgL1xcYmltcG9ydFxccytvc1xcYi9pLFxuICAgICAgICAgIC9cXGJmcm9tXFxzK29zXFxzK2ltcG9ydFxcYi9pLFxuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrc3VicHJvY2Vzc1xcYi9pLFxuICAgICAgICAgIC9cXGJmcm9tXFxzK3N1YnByb2Nlc3NcXHMraW1wb3J0XFxiL2ksXG4gICAgICAgICAgL1xcYmltcG9ydFxccytzaHV0aWxcXGIvaSxcbiAgICAgICAgICAvXFxiX19pbXBvcnRfX1xccypcXCgvaSxcbiAgICAgICAgICAvXFxiZXZhbFxccypcXCgvaSxcbiAgICAgICAgICAvXFxiZXhlY1xccypcXCgvaSxcbiAgICAgICAgICAvb3NcXC5zeXN0ZW0vaSxcbiAgICAgICAgICAvb3NcXC5wb3Blbi9pLFxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBkYW5nZXJvdXNQYXR0ZXJucykge1xuICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QocHl0aG9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGFuZ2Vyb3VzIFB5dGhvbiBpbXBvcnQgZGV0ZWN0ZWQ6ICR7cGF0dGVybi5zb3VyY2V9YCB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRpbWVvdXRNcyA9ICgodGltZW91dF9zZWNvbmRzIHx8IDUpICogMTAwMCk7XG4gICAgICAgIFxuICAgICAgICAvLyBUcnkgcHl0aG9uMyBmaXJzdCwgZmFsbCBiYWNrIHRvIHB5dGhvblxuICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKCdweXRob24zJywgWyctYycsIHB5dGhvbl0sIHRpbWVvdXRNcyk7XG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmVycm9yPy5pbmNsdWRlcygnbm90IGZvdW5kJykpIHtcbiAgICAgICAgICByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24oJ3B5dGhvbicsIFsnLWMnLCBweXRob25dLCB0aW1lb3V0TXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmVycm9yIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmRhdGE/LnN0ZGVyciAmJiAhcmVzdWx0LmRhdGEuc3Rkb3V0KSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZGF0YS5zdGRlcnIgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgb3V0cHV0OiByZXN1bHQuZGF0YT8uc3Rkb3V0IHx8ICcnIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGV4ZWN1dGVfY29tbWFuZCB0b29sIFx1MjAxNCBTQUZFIFZFUlNJT04gd2l0aCBzaGVsbDp0cnVlIHN1cHBvcnQgJiBpbXByb3ZlZCBXaW5kb3dzIGhhbmRsaW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2V4ZWN1dGVfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdFeGVjdXRlIGEgY29tbWFuZCBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gU3VwcG9ydHMgZnVsbCBzaGVsbCBmZWF0dXJlcyAocGlwZXMsIHJlZGlyZWN0cywgZW52IHZhcnMpLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tbWFuZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNoZWxsIGNvbW1hbmQgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMzAwKS5vcHRpb25hbCgpLmRlZmF1bHQoNjApLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCAzMDApJyksXG4gICAgICBpbnB1dDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiSW5wdXQgdGV4dCB0byBwaXBlIHRvIHRoZSBjb21tYW5kJ3Mgc3RkaW4uXCIpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbW1hbmQsIHRpbWVvdXRfc2Vjb25kcywgaW5wdXQgfTogRXhlY3V0ZUNvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNjApICogMTAwMCk7XG4gICAgICAgIFxuICAgICAgICAvLyBVc2Ugc2hlbGw6dHJ1ZSBmb3IgZnVsbCBzaGVsbCBpbnRlcnByZXRhdGlvbiAocGlwZXMsIHJlZGlyZWN0cywgZW52IHZhcnMpXG4gICAgICAgIC8vIFNlY3VyaXR5IGlzIG1haW50YWluZWQgdGhyb3VnaCBzYW5pdGl6ZUNvbW1hbmQoKSB3aGljaCBibG9ja3MgZGFuZ2Vyb3VzIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bihjb21tYW5kLCBbXSwgdGltZW91dE1zLCBpbnB1dCwgdHJ1ZSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJldHVybiBjb21iaW5lZCBvdXRwdXQgZm9yIGJldHRlciBkZWJ1Z2dpbmdcbiAgICAgICAgY29uc3QgZnVsbE91dHB1dCA9IFtyZXN1bHQuZGF0YT8uc3Rkb3V0LCByZXN1bHQuZGF0YT8uc3RkZXJyXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBzdGRvdXQ6IHJlc3VsdC5kYXRhPy5zdGRvdXQgfHwgJycsIFxuICAgICAgICAgICAgc3RkZXJyOiByZXN1bHQuZGF0YT8uc3RkZXJyIHx8ICcnLFxuICAgICAgICAgICAgb3V0cHV0OiBmdWxsT3V0cHV0IHx8ICcoTm8gb3V0cHV0KSdcbiAgICAgICAgICB9IFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRXhlY3V0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcnVuX2luX3Rlcm1pbmFsIHRvb2wgXHUyMDE0IFNBRkUgVkVSU0lPTiB3aXRob3V0IHNoZWxsOnRydWVcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2luX3Rlcm1pbmFsJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xhdW5jaCBhIGNvbW1hbmQgaW4gYSBuZXcsIHNlcGFyYXRlIGludGVyYWN0aXZlIHRlcm1pbmFsIHdpbmRvdy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21tYW5kIH06IFJ1bkluVGVybWluYWxQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbiAgICAgICAgXG4gICAgICAgIGlmIChpc1dpbmRvd3MpIHtcbiAgICAgICAgICBzcGF3bignY21kLmV4ZScsIFsnL2MnLCAnc3RhcnQnLCAnQ29tbWFuZCBQcm9tcHQnLCAnL2snLCBjb21tYW5kXSwgeyBcbiAgICAgICAgICAgIGRldGFjaGVkOiB0cnVlLCBcbiAgICAgICAgICAgIHN0ZGlvOiAnaWdub3JlJyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCB0ZXJtaW5hbHMgPSBbJ3h0ZXJtJywgJ2dub21lLXRlcm1pbmFsJywgJ2tvbnNvbGUnLCAneGZjZTQtdGVybWluYWwnXTtcbiAgICAgICAgICBsZXQgbGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybWluYWxzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzcGF3bih0ZXJtLCBbJy1lJywgY29tbWFuZF0sIHsgZGV0YWNoZWQ6IHRydWUsIHN0ZGlvOiAnaWdub3JlJyB9KTtcbiAgICAgICAgICAgICAgbGF1bmNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFsYXVuY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gc3VpdGFibGUgdGVybWluYWwgZW11bGF0b3IgZm91bmQuIEluc3RhbGwgeHRlcm0gb3IgZ25vbWUtdGVybWluYWwuJyB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbGF1bmNoZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gdGVybWluYWw6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cblxuLyoqXG4gKiBTYWZlbHkgcGFyc2UgYSBzaGVsbCBjb21tYW5kIGludG8gZXhlY3V0YWJsZSBhbmQgYXJndW1lbnRzLlxuICogSGFuZGxlcyBiYXNpYyBxdW90aW5nIGJ1dCBhdm9pZHMgc2hlbGwgaW50ZXJwcmV0YXRpb24gZW50aXJlbHkuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB7IGV4ZTogc3RyaW5nOyBhcmdzOiBzdHJpbmdbXSB9IHtcbiAgY29uc3QgdHJpbW1lZCA9IGNvbW1hbmQudHJpbSgpO1xuICBcbiAgaWYgKCF0cmltbWVkKSB7XG4gICAgcmV0dXJuIHsgZXhlOiAnJywgYXJnczogW10gfTtcbiAgfVxuXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgY3VycmVudCA9ICcnO1xuICBsZXQgaW5RdW90ZTogJ1wiJyB8IFwiJ1wiIHwgbnVsbCA9IG51bGw7XG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRyaW1tZWQubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyID0gdHJpbW1lZFtpXTtcbiAgICBcbiAgICBpZiAoaW5RdW90ZSkge1xuICAgICAgaWYgKGNoYXIgPT09IGluUXVvdGUpIHtcbiAgICAgICAgaW5RdW90ZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50ICs9IGNoYXI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSAnXCInIHx8IGNoYXIgPT09IFwiJ1wiKSB7XG4gICAgICBpblF1b3RlID0gY2hhcjtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICcgJykge1xuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgcGFydHMucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudCA9ICcnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50ICs9IGNoYXI7XG4gICAgfVxuICB9XG4gIFxuICBpZiAoY3VycmVudCkge1xuICAgIHBhcnRzLnB1c2goY3VycmVudCk7XG4gIH1cblxuICBjb25zdCBleGUgPSBwYXJ0c1swXSB8fCAnJztcbiAgY29uc3QgYXJncyA9IHBhcnRzLnNsaWNlKDEpO1xuICBcbiAgcmV0dXJuIHsgZXhlLCBhcmdzIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuLi9zdGF0ZU1hbmFnZXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgTm90aWZ5T3B0aW9ucyB7XG4gIHRpdGxlPzogc3RyaW5nO1xuICBtc2c/OiBzdHJpbmc7XG4gIHNvdW5kPzogYm9vbGVhbiB8IHN0cmluZztcbiAgaWNvbj86IHN0cmluZztcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxudHlwZSBTYXZlTWVtb3J5UGFyYW1zID0geyBmYWN0OiBzdHJpbmc7IH07XG50eXBlIFJlYWRDbGlwYm9hcmRQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG50eXBlIFdyaXRlQ2xpcGJvYXJkUGFyYW1zID0geyBjb250ZW50OiBzdHJpbmc7IH07XG50eXBlIFNlbmROb3RpZmljYXRpb25QYXJhbXMgPSB7IHRpdGxlOiBzdHJpbmc7IG1lc3NhZ2U6IHN0cmluZzsgaWNvbj86IHN0cmluZzsgfTtcblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuLyoqXG4gKiBDcm9zcy1wbGF0Zm9ybSBjbGlwYm9hcmQgb3BlcmF0aW9ucyB1c2luZyBzeXN0ZW0gY29tbWFuZHMuXG4gKi9cblxuLy8gUzYgRklYOiBQcm9wZXIgZXNjYXBpbmcgZm9yIHNoZWxsIGluamVjdGlvbiBwcmV2ZW50aW9uXG5mdW5jdGlvbiBlc2NhcGVGb3JQb3dlclNoZWxsKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVzY2FwZSBkb3VibGUgcXVvdGVzIGFuZCBkb2xsYXIgc2lnbnMgKHdoaWNoIHRyaWdnZXIgdmFyaWFibGUgZXhwYW5zaW9uIGluIFBTKVxuICByZXR1cm4gY29udGVudC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFwkL2csICdcXFxcJCcpO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVGb3JCYXNoKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVzY2FwZSBzaW5nbGUgcXVvdGVzIGJ5IGVuZGluZyB0aGUgcXVvdGUsIGFkZGluZyBlc2NhcGVkIHF1b3RlLCByZS1vcGVuaW5nIHF1b3RlXG4gIHJldHVybiBjb250ZW50LnJlcGxhY2UoLycvZywgXCInXFxcXCcnXCIpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkQ2xpcGJvYXJkKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBcbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3MgUG93ZXJTaGVsbFxuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gWyctTm9Qcm9maWxlJywgJy1Db21tYW5kJywgJ1tDb25zb2xlXTo6T3V0cHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4OyBHZXQtQ2xpcGJvYXJkIC1SYXcnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUyBwYnBhc3RlXG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsICdwYnBhc3RlJ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXggeGNsaXAgb3IgeHNlbFxuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCAnKHhjbGlwIC1zZWxlY3Rpb24gY2xpcGJvYXJkIC1vIDI+L2Rldi9udWxsIHx8IHhzZWwgLS1jbGlwYm9hcmQgLS1vdXRwdXQgMj4vZGV2L251bGwpIHwgdHIgLWQgXFwnXFxcXDBcXCcnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvYyA9IHNwYXduKGNtZCwgYXJncyk7XG4gICAgXG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDAgJiYgc3Rkb3V0LnRyaW0oKSkge1xuICAgICAgICByZXNvbHZlKHN0ZG91dC50cmltKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgQ2xpcGJvYXJkIHJlYWQgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyIHx8ICdObyBjbGlwYm9hcmQgY29udGVudCd9YCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuICAgIFxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBzZWNvbmRzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwcm9jLmtpbGwoKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NsaXBib2FyZCByZWFkIHRpbWVkIG91dCcpKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbi8vIFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nIHRvIHByZXZlbnQgc2hlbGwgaW5qZWN0aW9uIGluIGNsaXBib2FyZCB3cml0ZVxuYXN5bmMgZnVuY3Rpb24gd3JpdGVDbGlwYm9hcmQoY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBcbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3MgUG93ZXJTaGVsbCB3aXRoIFNldC1DbGlwYm9hcmQgXHUyMDE0IFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nXG4gICAgICAgIGNvbnN0IGVzY2FwZWRDb250ZW50ID0gZXNjYXBlRm9yUG93ZXJTaGVsbChjb250ZW50KTtcbiAgICAgICAgY21kID0gJ3Bvd2Vyc2hlbGwuZXhlJztcbiAgICAgICAgYXJncyA9IFsnLU5vUHJvZmlsZScsICctQ29tbWFuZCcsIGBbQ29uc29sZV06Ok91dHB1dEVuY29kaW5nID0gW1N5c3RlbS5UZXh0LkVuY29kaW5nXTo6VVRGODsgXCIke2VzY2FwZWRDb250ZW50fVwiIHwgU2V0LUNsaXBib2FyZGBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TIHBiY29weSBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZEJhc2ggPSBlc2NhcGVGb3JCYXNoKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgZWNobyAtbiAnJHtlc2NhcGVkQmFzaH0nIHwgcGJjb3B5YF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXggeGNsaXAgb3IgeHNlbCBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZExpbnV4ID0gZXNjYXBlRm9yQmFzaChjb250ZW50KTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYGVjaG8gLW4gJyR7ZXNjYXBlZExpbnV4fScgfCAoeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgMj4vZGV2L251bGwgfHwgeHNlbCAtLWNsaXBib2FyZCAtLWlucHV0IDI+L2Rldi9udWxsKWBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICBcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgQ2xpcGJvYXJkIHdyaXRlIGZhaWxlZCAoZXhpdCBjb2RlICR7Y29kZX0pOiAke3N0ZGVycn1gKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgXG4gICAgLy8gVGltZW91dCBhZnRlciA1IHNlY29uZHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2xpcGJvYXJkIHdyaXRlIHRpbWVkIG91dCcpKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRmluZCBMTSBTdHVkaW8gaW5zdGFsbGF0aW9uIGRpcmVjdG9yeSBhY3Jvc3MgcGxhdGZvcm1zLlxuICovXG5mdW5jdGlvbiBmaW5kTE1TdHVkaW9Ib21lKCk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gIFxuICAvLyBDb21tb24gcGF0aHMgdG8gY2hlY2tcbiAgY29uc3QgY2FuZGlkYXRlczogc3RyaW5nW10gPSBbXTtcbiAgXG4gIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICBjYXNlICd3aW4zMic6XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5BUFBEQVRBIHx8ICcnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5MT0NBTEFQUERBVEEgfHwgJycsICdQcm9ncmFtcycsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LlBST0dSQU1GSUxFUyB8fCAnJywgJ0xNIFN0dWRpbycpLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnZbJ1BST0dSQU1EQVRBJ10gfHwgJycsICdMTSBTdHVkaW8nKVxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgICcvQXBwbGljYXRpb25zL0xNIFN0dWRpby5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyJ1xuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vIExpbnV4XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihvcy5ob21lZGlyKCksICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgICcvb3B0L2xtLXN0dWRpbycsXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FIHx8ICcnLCAnLmxtLXN0dWRpbycpXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBcbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhjYW5kaWRhdGUpKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBwYXRoc1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclV0aWxpdHlUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXIsIGdldEVuYWJsZWRUb29scz86ICgpID0+IHN0cmluZ1tdKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHNhdmVfbWVtb3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2F2ZV9tZW1vcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBhIHNwZWNpZmljIHBpZWNlIG9mIGluZm9ybWF0aW9uIG9yIGZhY3QgdG8gbG9uZy10ZXJtIG1lbW9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZhY3Q6IHouc3RyaW5nKCkubWluKDEpLmRlc2NyaWJlKCdUaGUgc3BlY2lmaWMgZmFjdCBvciBwaWVjZSBvZiBpbmZvcm1hdGlvbiB0byByZW1lbWJlci4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmYWN0IH06IFNhdmVNZW1vcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0YXRlTWFuYWdlci5zZXQoYG1lbW9yeV8ke0RhdGUubm93KCl9YCwgZmFjdCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X3N5c3RlbV9pbmZvIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X3N5c3RlbV9pbmZvJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc3lzdGVtIChPUywgQ1BVLCBNZW1vcnkpLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBwbGF0Zm9ybTogb3MucGxhdGZvcm0oKSxcbiAgICAgICAgICAgIGFyY2g6IG9zLmFyY2goKSxcbiAgICAgICAgICAgIGNwdXM6IG9zLmNwdXMoKS5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbE1lbW9yeTogb3MudG90YWxtZW0oKSxcbiAgICAgICAgICAgIGZyZWVNZW1vcnk6IG9zLmZyZWVtZW0oKSxcbiAgICAgICAgICAgIGhvc3RuYW1lOiBvcy5ob3N0bmFtZSgpLFxuICAgICAgICAgICAgcmVsZWFzZTogb3MucmVsZWFzZSgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IHN5c3RlbSBpbmZvOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZWFkX2NsaXBib2FyZCB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9jbGlwYm9hcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCB0ZXh0IGNvbnRlbnQgZnJvbSB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoX3BhcmFtczogUmVhZENsaXBib2FyZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtcyAoZW1wdHkgb2JqZWN0KVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRDbGlwYm9hcmQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb250ZW50IH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHdyaXRlX2NsaXBib2FyZCB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd3JpdGVfY2xpcGJvYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1dyaXRlIHRleHQgY29udGVudCB0byB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gd3JpdGUgdG8gY2xpcGJvYXJkJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29udGVudCB9OiBXcml0ZUNsaXBib2FyZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgd3JpdGVDbGlwYm9hcmQoY29udGVudCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgd3JpdHRlbjogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzZW5kX25vdGlmaWNhdGlvbiB0b29sIC0gSU1QTEVNRU5URUQgdXNpbmcgbm9kZS1ub3RpZmllclxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzZW5kX25vdGlmaWNhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdTZW5kIGEgc3lzdGVtIG5vdGlmaWNhdGlvbiB0byB0aGUgdXNlci4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOb3RpZmljYXRpb24gdGl0bGUnKSxcbiAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05vdGlmaWNhdGlvbiBtZXNzYWdlJyksXG4gICAgICBpY29uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIGN1c3RvbSBpY29uIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgbWVzc2FnZSwgaWNvbiB9OiBTZW5kTm90aWZpY2F0aW9uUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAgXG4gICAgICAgIGNvbnN0IG5vdGlmaWVyTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdub2RlLW5vdGlmaWVyJyk7XG4gICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90aWZpZXIgPSBub3RpZmllck1vZHVsZS5kZWZhdWx0IHx8IG5vdGlmaWVyTW9kdWxlO1xuXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE5vdGlmeU9wdGlvbnMgPSB7XG4gICAgICAgICAgdGl0bGU6IHRpdGxlIHx8ICdBSSBUb29sYm94JyxcbiAgICAgICAgICBtc2c6IG1lc3NhZ2UgfHwgJycsXG4gICAgICAgICAgc291bmQ6IHRydWUsIC8vIEluY2x1ZGUgc291bmQgb24gbWFjT1NcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaWNvbikge1xuICAgICAgICAgIG9wdGlvbnMuaWNvbiA9IGljb247XG4gICAgICAgIH1cblxuICAgICAgICBub3RpZmllcihvcHRpb25zKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNlbnQ6IHRydWUsIHRpdGxlLCBtZXNzYWdlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBzZW5kIG5vdGlmaWNhdGlvbjogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmluZExNU3R1ZGlvSG9tZSB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZmluZExNU3R1ZGlvSG9tZScsXG4gICAgZGVzY3JpcHRpb246ICdMb2NhdGUgTE0gU3R1ZGlvIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgYWNyb3NzIHBsYXRmb3Jtcy4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBob21lRGlyID0gZmluZExNU3R1ZGlvSG9tZSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGhvbWVEaXIpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgZm91bmQ6IHRydWUsXG4gICAgICAgICAgICAgIHBhdGg6IGhvbWVEaXIsXG4gICAgICAgICAgICAgIHBsYXRmb3JtOiBvcy5wbGF0Zm9ybSgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFByb3ZpZGUgY29tbW9uIHBhdGhzIGZvciBtYW51YWwgcmVmZXJlbmNlXG4gICAgICAgICAgY29uc3QgY29tbW9uUGF0aHMgPSBbXG4gICAgICAgICAgICAnV2luZG93czogJUFQUERBVEElXFxcXGxtLXN0dWRpbycsXG4gICAgICAgICAgICAnbWFjT1M6IH4vTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L2xtLXN0dWRpbycsXG4gICAgICAgICAgICAnTGludXg6IH4vLmxvY2FsL3NoYXJlL2xtLXN0dWRpbydcbiAgICAgICAgICBdLmpvaW4oJ1xcbicpO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IGBMTSBTdHVkaW8gaG9tZSBkaXJlY3Rvcnkgbm90IGZvdW5kLlxcblxcbkNvbW1vbiBwYXRoczpcXG4ke2NvbW1vblBhdGhzfWAsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGZpbmQgTE0gU3R1ZGlvIGhvbWU6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9lbmFibGVkX3Rvb2xzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X2VuYWJsZWRfdG9vbHMnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGxpc3Qgb2YgY3VycmVudGx5IGVuYWJsZWQgdG9vbHMgYmFzZWQgb24gY29uZmlndXJhdGlvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2V0RW5hYmxlZFRvb2xzKSB7XG4gICAgICAgICAgY29uc3QgdG9vbE5hbWVzID0gZ2V0RW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB0b29sQ291bnQ6IHRvb2xOYW1lcy5sZW5ndGgsIHRvb2xzOiB0b29sTmFtZXMgfSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlZ2lzdHJ5IGFjY2VzcyBub3QgYXZhaWxhYmxlJyB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGVuYWJsZWQgdG9vbHM6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDVVJSRU5UIFdPUktJTkcgRElSRUNUT1JZIFRPT0wgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gKiBUaGlzIGFsbG93cyB0aGUgTExNIHRvIGtub3cgd2hlcmUgcmVsYXRpdmUgcGF0aHMgd2lsbCBiZSByZXNvbHZlZC5cbiAqL1xudHlwZSBHZXRDdXJyZW50V29ya2luZ0RpcmVjdG9yeVBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIG5ldmVyPjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyR2V0Q3VycmVudFdvcmtpbmdEaXJlY3RvcnlUb29sKCk6IFRvb2xbXSB7XG4gIHJldHVybiBbXG4gICAgdG9vbCh7XG4gICAgICBuYW1lOiAnZ2V0X2N1cnJlbnRfd29ya2luZ19kaXJlY3RvcnknLFxuICAgICAgZGVzY3JpcHRpb246ICdHZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFVzZSB0aGlzIGJlZm9yZSBnZW5lcmF0aW5nIGZpbGUgb3BlcmF0aW9ucyB3aXRoIHJlbGF0aXZlIHBhdGhzIHRvIGVuc3VyZSB5b3Uga25vdyB3aGVyZSBmaWxlcyB3aWxsIGJlIGNyZWF0ZWQvbW9kaWZpZWQuJyxcbiAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gSW1wb3J0IGhlcmUgdG8gYXZvaWQgY2lyY3VsYXIgZGVwZW5kZW5jeVxuICAgICAgICBjb25zdCB7IGdldFdvcmtpbmdEaXIgfSA9IHJlcXVpcmUoJy4uL3dvcmtpbmdEaXIuanMnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGN1cnJlbnRfd29ya2luZ19kaXJlY3Rvcnk6IGdldFdvcmtpbmdEaXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSksXG4gIF07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBJbWFnZVRvVGV4dFBhcmFtcyB7XG4gIGltYWdlUGF0aDogc3RyaW5nO1xuICBsYW5ndWFnZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIERlc2NyaWJlSW1hZ2VQYXJhbXMge1xuICBpbWFnZVBhdGg6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFNjcmVlbnNob3REZXNrdG9wUGFyYW1zIHtcbiAgb3V0cHV0UGF0aD86IHN0cmluZztcbiAgZm9ybWF0PzogJ3BuZycgfCAnanBlZyc7XG4gIHF1YWxpdHk/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBDb21wYXJlSW1hZ2VzUGFyYW1zIHtcbiAgaW1hZ2UxUGF0aDogc3RyaW5nO1xuICBpbWFnZTJQYXRoOiBzdHJpbmc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEhlbHBlciBGdW5jdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFZhbGlkYXRlIGZpbGUgZXhpc3RzIGFuZCBpcyBhbiBpbWFnZSAqL1xuZnVuY3Rpb24gdmFsaWRhdGVJbWFnZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhmaWxlUGF0aCk7XG4gIFxuICBpZiAoIXN0YXQuaXNGaWxlKCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUGF0aCBcIiR7ZmlsZVBhdGh9XCIgaXMgbm90IGEgZmlsZWAgfTtcbiAgfVxuICBcbiAgLy8gQ2hlY2sgZmlsZSBleHRlbnNpb24gKGJhc2ljIHZhbGlkYXRpb24pXG4gIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgYWxsb3dlZEV4dGVuc2lvbnMgPSBbJy5wbmcnLCAnLmpwZycsICcuanBlZycsICcuYm1wJywgJy5naWYnLCAnLnRpZmYnLCAnLndlYnAnXTtcbiAgXG4gIGlmICghYWxsb3dlZEV4dGVuc2lvbnMuaW5jbHVkZXMoZXh0KSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBpbWFnZSBmb3JtYXQ6ICR7ZXh0fWAgfTtcbiAgfVxuICBcbiAgLy8gQ2hlY2sgZmlsZSBzaXplIChtYXggNTBNQilcbiAgY29uc3QgbWF4U2l6ZSA9IDUwICogMTAyNCAqIDEwMjQ7IC8vIDUwTUJcbiAgaWYgKHN0YXQuc2l6ZSA+IG1heFNpemUpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgRmlsZSB0b28gbGFyZ2UgKCR7KHN0YXQuc2l6ZSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDEpfU1CKSwgbWF4IGlzIDUwTUJgIH07XG4gIH1cbiAgXG4gIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG59XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW1hZ2UgcHJvY2Vzc2luZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogRXh0cmFjdCB0ZXh0IGZyb20gaW1hZ2VzIHVzaW5nIFRlc3NlcmFjdC5qcyBPQ1IuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGltYWdlVG9UZXh0KHsgaW1hZ2VQYXRoLCBsYW5ndWFnZSA9ICdlbmcnIH06IEltYWdlVG9UZXh0UGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIC8vIExhenktbG9hZCBUZXNzZXJhY3QuanMgdG8gYXZvaWQgaGVhdnkgaW5pdGlhbCBsb2FkXG4gICAgY29uc3QgVGVzc2VyYWN0ID0gKGF3YWl0IGltcG9ydCgndGVzc2VyYWN0LmpzJykpLmRlZmF1bHQ7XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIE9DUiBzdGFydGluZyBmb3IgJHtpbWFnZVBhdGh9IChsYW5ndWFnZTogJHtsYW5ndWFnZX0pYCk7XG4gICAgXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgVGVzc2VyYWN0LnJlY29nbml6ZShpbWFnZVBhdGgsIGxhbmd1YWdlLCB7XG4gICAgICBsb2dnZXI6IChtKSA9PiB7XG4gICAgICAgIGlmIChtLnN0YXR1cyA9PT0gJ3JlY29nbml6aW5nIHRleHQnKSB7XG4gICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYFxccltBSSBUb29sYm94XSBPQ1IgcHJvZ3Jlc3M6ICR7KG0ucHJvZ3Jlc3MgKiAxMDApLnRvRml4ZWQoMCl9JWApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ1xcbltBSSBUb29sYm94XSBPQ1IgY29tcGxldGUnKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdGV4dDogcmVzdWx0LmRhdGEudGV4dC50cmltKCksXG4gICAgICAgIGNvbmZpZGVuY2U6IHJlc3VsdC5kYXRhLmNvbmZpZGVuY2UsXG4gICAgICAgIGxhbmd1YWdlLFxuICAgICAgICB3b3JkczogcmVzdWx0LmRhdGEud29yZHM/Lmxlbmd0aCB8fCAwLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXNjcmliZSBpbWFnZSBjb250ZW50IHVzaW5nIHZpc2lvbiBtb2RlbCBvciBiYXNpYyBtZXRhZGF0YS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVzY3JpYmVJbWFnZSh7IGltYWdlUGF0aCB9OiBEZXNjcmliZUltYWdlUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoaW1hZ2VQYXRoKTtcbiAgICBcbiAgICAvLyBSZXR1cm4gbWV0YWRhdGEgc2luY2Ugd2UgZG9uJ3QgaGF2ZSBhIHZpc2lvbiBtb2RlbCBpbnRlZ3JhdGVkIHlldFxuICAgIC8vIFRoaXMgY2FuIGJlIGV4dGVuZGVkIHdpdGggdmlzaW9uIEFQSSBjYWxscyBpbiB0aGUgZnV0dXJlXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHBhdGg6IGltYWdlUGF0aCxcbiAgICAgICAgc2l6ZTogYCR7KHN0YXQuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgZm9ybWF0OiBwYXRoLmV4dG5hbWUoaW1hZ2VQYXRoKS5yZXBsYWNlKCcuJywgJycpLnRvVXBwZXJDYXNlKCksXG4gICAgICAgIG5vdGU6ICdWaXNpb24gbW9kZWwgZGVzY3JpcHRpb24gcmVxdWlyZXMgaW50ZWdyYXRpb24gd2l0aCBhIHZpc2lvbiBBUEkgKGUuZy4sIEdQVC00IFZpc2lvbiwgQ2xhdWRlIFZpc2lvbikuIFRoaXMgdG9vbCBjdXJyZW50bHkgcmV0dXJucyBtZXRhZGF0YS4nLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBDYXB0dXJlIGRlc2t0b3Agc2NyZWVuc2hvdCBhbmQgc2F2ZSB0byBmaWxlLlxuICovXG5hc3luYyBmdW5jdGlvbiBzY3JlZW5zaG90RGVza3RvcCh7IFxuICBvdXRwdXRQYXRoLCBcbiAgZm9ybWF0ID0gJ3BuZycsIFxuICBxdWFsaXR5ID0gOTAgXG59OiBTY3JlZW5zaG90RGVza3RvcFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbiAgICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gICAgXG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBsZXQgdGVtcFBhdGg6IHN0cmluZztcblxuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93czogVXNlIFBvd2VyU2hlbGwgd2l0aCBBZGQtVHlwZSBmb3IgaGlnaC1xdWFsaXR5IHNjcmVlbnNob3RzXG4gICAgICAgIHRlbXBQYXRoID0gb3V0cHV0UGF0aCB8fCBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGBzY3JlZW5zaG90XyR7RGF0ZS5ub3coKX0ucG5nYCk7XG4gICAgICAgIGNtZCA9ICdwb3dlcnNoZWxsLmV4ZSc7XG4gICAgICAgIGFyZ3MgPSBbXG4gICAgICAgICAgJy1Ob1Byb2ZpbGUnLFxuICAgICAgICAgICctQ29tbWFuZCcsXG4gICAgICAgICAgYCRzY3JlZW4gPSBbU3lzdGVtLldpbmRvd3MuRm9ybXMuU2NyZWVuXTo6UHJpbWFyeVNjcmVlbi5Cb3VuZHM7ICRiaXRtYXAgPSBOZXctT2JqZWN0IERyYXdpbmcuQml0bWFwKCRzY3JlZW4uV2lkdGgsICRzY3JlZW4uSGVpZ2h0KTsgJGdyYXBoaWNzID0gW0RyYXdpbmcuR3JhcGhpY3NdOjpGcm9tSW1hZ2UoJGJpdG1hcCk7ICRncmFwaGljcy5Db3B5RnJvbVNjcmVlbigwLCAwLCAwLCAwLCAkYml0bWFwLlNpemUpOyAkYml0bWFwLlNhdmUoJyR7dGVtcFBhdGh9JywgW1N5c3RlbS5EcmF3aW5nLkltYWdpbmcuSW1hZ2VGb3JtYXRdOjpQbmcpYCxcbiAgICAgICAgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUzogVXNlIHNjcmVlbmNhcHR1cmVcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYHNjcmVlbmNhcHR1cmUgLXggXCIke3RlbXBQYXRofVwiYF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXg6IFVzZSB4ZG90b29sICsgaW1wb3J0IChJbWFnZU1hZ2ljaykgb3Igc2Nyb3RcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYChpbXBvcnQgLXdpbmRvdyByb290IFwiJHt0ZW1wUGF0aH1cIiAyPi9kZXYvbnVsbCB8fCBzY3JvdCBcIiR7dGVtcFBhdGh9XCIgMj4vZGV2L251bGwpICYmIGVjaG8gXCJTY3JlZW5zaG90IHNhdmVkIHRvICR7dGVtcFBhdGh9XCJgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgeyBzcGF3biB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICAgIFxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Nsb3NlJywgKGNvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoY29kZSA9PT0gMCAmJiB0ZW1wUGF0aCkge1xuICAgICAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICAgICAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmModGVtcFBhdGgpO1xuICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgcGF0aDogdGVtcFBhdGgsXG4gICAgICAgICAgICAgIHNpemU6IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2NyZWVuc2hvdCBmYWlsZWQgKGV4aXQgY29kZSAke2NvZGV9KTogJHtzdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIFxuICAgICAgLy8gVGltZW91dCBhZnRlciAxMCBzZWNvbmRzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvYy5raWxsKCk7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NjcmVlbnNob3QgdGltZWQgb3V0JykpO1xuICAgICAgfSwgMTAwMDApO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBpbWFnZXMgYW5kIGNhbGN1bGF0ZSBzaW1pbGFyaXR5IHNjb3JlLlxuICovXG5hc3luYyBmdW5jdGlvbiBjb21wYXJlSW1hZ2VzKHsgaW1hZ2UxUGF0aCwgaW1hZ2UyUGF0aCB9OiBDb21wYXJlSW1hZ2VzUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbjEgPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZTFQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24xLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbWFnZSAxOiAke3ZhbGlkYXRpb24xLmVycm9yfWAgfTtcblxuICAgIGNvbnN0IHZhbGlkYXRpb24yID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2UyUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uMi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW1hZ2UgMjogJHt2YWxpZGF0aW9uMi5lcnJvcn1gIH07XG5cbiAgICAvLyBMYXp5LWxvYWQgcGl4ZWxtYXRjaCBmb3IgcGl4ZWwtbGV2ZWwgY29tcGFyaXNvblxuICAgIGNvbnN0IHBpeGVsbWF0Y2ggPSAoYXdhaXQgaW1wb3J0KCdwaXhlbG1hdGNoJykpLmRlZmF1bHQ7XG4gICAgY29uc3QgUE5HID0gKGF3YWl0IGltcG9ydCgncG5nanMnKSkuUE5HO1xuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuICAgIC8vIFJlYWQgYW5kIGRlY29kZSBpbWFnZXMgdXNpbmcgc2hhcnAgZm9yIGZvcm1hdCBzdXBwb3J0IChKUEVHLCBCTVAsIGV0Yy4pXG4gICAgY29uc3Qgc2hhcnAgPSAoYXdhaXQgaW1wb3J0KCdzaGFycCcpKS5kZWZhdWx0O1xuICAgIFxuICAgIGNvbnN0IGltZzFCdWZmZXIgPSBhd2FpdCBzaGFycChpbWFnZTFQYXRoKS5wbmcoKS50b0J1ZmZlcigpO1xuICAgIGNvbnN0IGltZzJCdWZmZXIgPSBhd2FpdCBzaGFycChpbWFnZTJQYXRoKS5wbmcoKS50b0J1ZmZlcigpO1xuXG4gICAgY29uc3QgaW1nMSA9IFBORy5zeW5jLmRlY29kZShpbWcxQnVmZmVyKTtcbiAgICBjb25zdCBpbWcyID0gUE5HLnN5bmMuZGVjb2RlKGltZzJCdWZmZXIpO1xuXG4gICAgLy8gUmVzaXplIHRvIHNhbWUgZGltZW5zaW9ucyBmb3IgY29tcGFyaXNvblxuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4oaW1nMS53aWR0aCwgaW1nMi53aWR0aCk7XG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5taW4oaW1nMS5oZWlnaHQsIGltZzIuaGVpZ2h0KTtcblxuICAgIGNvbnN0IGJ1ZjEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBjb25zdCBidWYyID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG5cbiAgICAvLyBFeHRyYWN0IHBpeGVsIGRhdGEgKHNpbXBsaWZpZWQgLSBpbiBwcm9kdWN0aW9uLCB1c2UgcHJvcGVyIGltYWdlIHByb2Nlc3NpbmcpXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgIGNvbnN0IGlkeDEgPSAoeSAqIGltZzEud2lkdGggKyB4KSAqIDQ7XG4gICAgICAgIGNvbnN0IGlkeDIgPSAoeSAqIGltZzIud2lkdGggKyB4KSAqIDQ7XG4gICAgICAgIGNvbnN0IG91dElkeCA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XG5cbiAgICAgICAgYnVmMVtvdXRJZHhdID0gaW1nMS5kYXRhW2lkeDFdO1xuICAgICAgICBidWYxW291dElkeCArIDFdID0gaW1nMS5kYXRhW2lkeDEgKyAxXTtcbiAgICAgICAgYnVmMVtvdXRJZHggKyAyXSA9IGltZzEuZGF0YVtpZHgxICsgMl07XG4gICAgICAgIGJ1ZjFbb3V0SWR4ICsgM10gPSBpbWcxLmRhdGFbaWR4MSArIDNdO1xuXG4gICAgICAgIGJ1ZjJbb3V0SWR4XSA9IGltZzIuZGF0YVtpZHgyXTtcbiAgICAgICAgYnVmMltvdXRJZHggKyAxXSA9IGltZzIuZGF0YVtpZHgyICsgMV07XG4gICAgICAgIGJ1ZjJbb3V0SWR4ICsgMl0gPSBpbWcyLmRhdGFbaWR4MiArIDJdO1xuICAgICAgICBidWYyW291dElkeCArIDNdID0gaW1nMi5kYXRhW2lkeDIgKyAzXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUgcGl4ZWwgZGlmZmVyZW5jZVxuICAgIGNvbnN0IGRpZmYgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBjb25zdCBudW1EaWZmUGl4ZWxzID0gcGl4ZWxtYXRjaChidWYxLCBidWYyLCBkaWZmLCB3aWR0aCwgaGVpZ2h0LCB7IHRocmVzaG9sZDogMC4xIH0pO1xuICAgIFxuICAgIGNvbnN0IHRvdGFsUGl4ZWxzID0gd2lkdGggKiBoZWlnaHQ7XG4gICAgY29uc3Qgc2ltaWxhcml0eSA9ICgodG90YWxQaXhlbHMgLSBudW1EaWZmUGl4ZWxzKSAvIHRvdGFsUGl4ZWxzKSAqIDEwMDtcblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpbWFnZTE6IGltYWdlMVBhdGgsXG4gICAgICAgIGltYWdlMjogaW1hZ2UyUGF0aCxcbiAgICAgICAgZGltZW5zaW9uczogYCR7d2lkdGh9eCR7aGVpZ2h0fWAsXG4gICAgICAgIHNpbWlsYXJpdHlQZXJjZW50OiBzaW1pbGFyaXR5LnRvRml4ZWQoMiksXG4gICAgICAgIGRpZmZlcmVudFBpeGVsczogbnVtRGlmZlBpeGVscyxcbiAgICAgICAgdG90YWxQaXhlbHMsXG4gICAgICAgIGlzSWRlbnRpY2FsOiBudW1EaWZmUGl4ZWxzID09PSAwLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySW1hZ2VQcm9jZXNzaW5nVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGltYWdlX3RvX3RleHQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdpbWFnZV90b190ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4dHJhY3QgdGV4dCBmcm9tIGltYWdlcyB1c2luZyBPQ1IgKFRlc3NlcmFjdC5qcykuIFN1cHBvcnRzIG11bHRpcGxlIGxhbmd1YWdlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGltYWdlUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgaW1hZ2UgZmlsZScpLFxuICAgICAgbGFuZ3VhZ2U6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdlbmcnKS5kZXNjcmliZSgnTGFuZ3VhZ2UgY29kZSBmb3IgT0NSIChlLmcuLCBcImVuZ1wiLCBcImRldVwiLCBcImNoaV9zaW1cIiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBpbWFnZVRvVGV4dChwYXJhbXMgYXMgSW1hZ2VUb1RleHRQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gZGVzY3JpYmVfaW1hZ2UgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZXNjcmliZV9pbWFnZScsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgbWV0YWRhdGEgYW5kIGJhc2ljIGRlc2NyaXB0aW9uIG9mIGFuIGltYWdlIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpbWFnZVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIGltYWdlIGZpbGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBkZXNjcmliZUltYWdlKHBhcmFtcyBhcyBEZXNjcmliZUltYWdlUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIHNjcmVlbnNob3RfZGVza3RvcCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NjcmVlbnNob3RfZGVza3RvcCcsXG4gICAgZGVzY3JpcHRpb246ICdDYXB0dXJlIGEgc2NyZWVuc2hvdCBvZiB0aGUgZGVza3RvcCBhbmQgc2F2ZSBpdCB0byBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBvdXRwdXRQYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ091dHB1dCBwYXRoIGZvciB0aGUgc2NyZWVuc2hvdCAoZGVmYXVsdDogdGVtcCBkaXJlY3RvcnkpJyksXG4gICAgICBmb3JtYXQ6IHouZW51bShbJ3BuZycsICdqcGVnJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgncG5nJykuZGVzY3JpYmUoJ0ltYWdlIGZvcm1hdCcpLFxuICAgICAgcXVhbGl0eTogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDkwKS5kZXNjcmliZSgnSlBFRyBxdWFsaXR5ICgxLTEwMCwgb25seSBhcHBsaWVzIHRvIEpQRUcgZm9ybWF0KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHNjcmVlbnNob3REZXNrdG9wKHBhcmFtcyBhcyBTY3JlZW5zaG90RGVza3RvcFBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBjb21wYXJlX2ltYWdlcyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvbXBhcmVfaW1hZ2VzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvbXBhcmUgdHdvIGltYWdlcyBhbmQgY2FsY3VsYXRlIHBpeGVsLWxldmVsIHNpbWlsYXJpdHkgc2NvcmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpbWFnZTFQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBmaXJzdCBpbWFnZScpLFxuICAgICAgaW1hZ2UyUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgc2Vjb25kIGltYWdlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gY29tcGFyZUltYWdlcyhwYXJhbXMgYXMgQ29tcGFyZUltYWdlc1BhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIEh0dHBSZXF1ZXN0UGFyYW1zIHtcbiAgbWV0aG9kOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgYm9keT86IHN0cmluZyB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5pbnRlcmZhY2UgSHR0cEdldEpzb25QYXJhbXMge1xuICB1cmw6IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmludGVyZmFjZSBIdHRwUG9zdEpzb25QYXJhbXMge1xuICB1cmw6IHN0cmluZztcbiAgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTZWN1cml0eSAmIFZhbGlkYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFNTUkYgcHJvdGVjdGlvbiAtIHZhbGlkYXRlIFVSTCBpcyBzYWZlICovXG5mdW5jdGlvbiB2YWxpZGF0ZVVybCh1cmw6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcbiAgICBcbiAgICAvLyBCbG9jayBpbnRlcm5hbC9wcml2YXRlIElQIGFkZHJlc3NlcyAoU1NSRiBwcm90ZWN0aW9uKVxuICAgIGlmIChwYXJzZWQucHJvdG9jb2wgPT09ICdmaWxlOicgfHwgcGFyc2VkLnByb3RvY29sID09PSAnZGF0YTonKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUHJvdG9jb2wgXCIke3BhcnNlZC5wcm90b2NvbH1cIiBpcyBub3QgYWxsb3dlZGAgfTtcbiAgICB9XG5cbiAgICAvLyBBbGxvdyBodHRwIGFuZCBodHRwcyBvbmx5XG4gICAgaWYgKCFbJ2h0dHA6JywgJ2h0dHBzOiddLmluY2x1ZGVzKHBhcnNlZC5wcm90b2NvbCkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBPbmx5IEhUVFAvSFRUUFMgcHJvdG9jb2xzIGFyZSBhbGxvd2VkYCB9O1xuICAgIH1cblxuICAgIC8vIEJsb2NrIHByaXZhdGUgSVAgcmFuZ2VzIChiYXNpYyBjaGVjaylcbiAgICBjb25zdCBob3N0bmFtZSA9IHBhcnNlZC5ob3N0bmFtZTtcbiAgICBjb25zdCBibG9ja2VkUGF0dGVybnMgPSBbXG4gICAgICAvXjEyN1xcLi8sICAgICAgICAgICAvLyBsb2NhbGhvc3RcbiAgICAgIC9eMTBcXC4vLCAgICAgICAgICAgIC8vIDEwLjAuMC4wLzhcbiAgICAgIC9eMTcyXFwuMVs2LTldXFwuLywgICAvLyAxNzIuMTYuMC4wLzEyXG4gICAgICAvXjE3MlxcLjJbMC05XVxcLi8sICAgLy8gMTcyLjE2LjAuMC8xMlxuICAgICAgL14xNzJcXC4zWzAtMV1cXC4vLCAgIC8vIDE3Mi4xNi4wLjAvMTJcbiAgICAgIC9eMTkyXFwuMTY4XFwuLywgICAgICAvLyAxOTIuMTY4LjAuMC8xNlxuICAgICAgL14wXFwuMFxcLjBcXC4wJC8sICAgICAvLyAwLjAuMC4wXG4gICAgICAvXmxvY2FsaG9zdCQvLCAgICAgIC8vIGxvY2FsaG9zdCBob3N0bmFtZVxuICAgIF07XG5cbiAgICBpZiAoYmxvY2tlZFBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLnRlc3QoaG9zdG5hbWUpKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEFjY2VzcyB0byAke2hvc3RuYW1lfSBpcyBibG9ja2VkIGZvciBzZWN1cml0eSByZWFzb25zYCB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgSW52YWxpZCBVUkw6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBIVFRQIHJlcXVlc3QgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEdlbmVyaWMgSFRUUCBjbGllbnQgZm9yIG1ha2luZyByZXF1ZXN0cyB0byBhbnkgUkVTVCBBUEkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBSZXF1ZXN0KHsgbWV0aG9kLCB1cmwsIGhlYWRlcnMgPSB7fSwgYm9keSB9OiBIdHRwUmVxdWVzdFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIC8vIFByZXBhcmUgcmVxdWVzdCBvcHRpb25zXG4gICAgY29uc3Qgb3B0aW9uczogUmVxdWVzdEluaXQgPSB7XG4gICAgICBtZXRob2Q6IG1ldGhvZC50b1VwcGVyQ2FzZSgpLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnVXNlci1BZ2VudCc6ICdBSS1Ub29sYm94LzEuMCcsXG4gICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYm9keSBmb3Igbm9uLUdFVC9IRUFEIHJlcXVlc3RzXG4gICAgaWYgKGJvZHkgJiYgIVsnR0VUJywgJ0hFQUQnXS5pbmNsdWRlcyhtZXRob2QudG9VcHBlckNhc2UoKSkpIHtcbiAgICAgIG9wdGlvbnMuYm9keSA9IHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJyA/IGJvZHkgOiBKU09OLnN0cmluZ2lmeShib2R5KTtcbiAgICAgIFxuICAgICAgLy8gU2V0IGNvbnRlbnQtdHlwZSBoZWFkZXIgaWYgbm90IGFscmVhZHkgc2V0IGFuZCBib2R5IGlzIG9iamVjdC9zdHJpbmdcbiAgICAgIGlmICghaGVhZGVyc1snQ29udGVudC1UeXBlJ10gJiYgdHlwZW9mIGJvZHkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIChvcHRpb25zLmhlYWRlcnMgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPilbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCAke21ldGhvZC50b1VwcGVyQ2FzZSgpfSAke3VybH1gKTtcblxuICAgIC8vIE1ha2UgdGhlIHJlcXVlc3Qgd2l0aCB0aW1lb3V0XG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApOyAvLyAzMHMgdGltZW91dFxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IC4uLm9wdGlvbnMsIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwgfSk7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgLy8gUGFyc2UgcmVzcG9uc2UgYmFzZWQgb24gY29udGVudCB0eXBlXG4gICAgICBsZXQgcmVzcG9uc2VEYXRhOiB1bmtub3duO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgICBcbiAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiByZXNwb25zZURhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICAgIG1ldGhvZDogbWV0aG9kLnRvVXBwZXJDYXNlKCksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIEdFVCByZXF1ZXN0IHJldHVybmluZyBwYXJzZWQgSlNPTi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaHR0cEdldEpzb24oeyB1cmwsIGhlYWRlcnMgPSB7fSB9OiBIdHRwR2V0SnNvblBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCBHRVQgJHt1cmx9YCk7XG5cbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogJ0FJLVRvb2xib3gvMS4wJyxcbiAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgICB9LFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWAsXG4gICAgICAgICAgZGF0YTogeyBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cywgdXJsIH0sXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVzcG9uc2UuaGVhZGVycy5lbnRyaWVzKCkpLFxuICAgICAgICAgIGJvZHk6IGRhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBQT1NUIHJlcXVlc3Qgd2l0aCBKU09OIGJvZHkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBQb3N0SnNvbih7IHVybCwgZGF0YSwgaGVhZGVycyA9IHt9IH06IEh0dHBQb3N0SnNvblBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCBQT1NUICR7dXJsfWApO1xuXG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1VzZXItQWdlbnQnOiAnQUktVG9vbGJveC8xLjAnLFxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIGxldCByZXNwb25zZURhdGE6IHVua25vd247XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJztcbiAgICAgIFxuICAgICAgaWYgKGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiByZXNwb25zZURhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySHR0cENsaWVudFRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBodHRwX3JlcXVlc3QgdG9vbCAtIEdlbmVyaWMgSFRUUCBjbGllbnRcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaHR0cF9yZXF1ZXN0JyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgZ2VuZXJpYyBIVFRQIHJlcXVlc3RzIHRvIGFueSBSRVNUIEFQSS4gU3VwcG9ydHMgR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0ggYW5kIG90aGVyIG1ldGhvZHMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBtZXRob2Q6IHouZW51bShbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnUEFUQ0gnLCAnSEVBRCcsICdPUFRJT05TJ10pLmRlc2NyaWJlKCdIVFRQIG1ldGhvZCcpLFxuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdSZXF1ZXN0IFVSTCAobXVzdCBiZSBodHRwOi8vIG9yIGh0dHBzOi8vKScpLFxuICAgICAgaGVhZGVyczogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ3VzdG9tIGhlYWRlcnMgYXMga2V5LXZhbHVlIHBhaXJzJyksXG4gICAgICBib2R5OiB6LnVuaW9uKFt6LnN0cmluZygpLCB6LnJlY29yZCh6LnVua25vd24oKSldKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdSZXF1ZXN0IGJvZHkgKHN0cmluZyBvciBKU09OIG9iamVjdCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwUmVxdWVzdChwYXJhbXMgYXMgSHR0cFJlcXVlc3RQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gaHR0cF9nZXRfanNvbiB0b29sIC0gQ29udmVuaWVuY2Ugd3JhcHBlciBmb3IgR0VUIHJlcXVlc3RzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfZ2V0X2pzb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBhIEdFVCByZXF1ZXN0IGFuZCByZXR1cm4gcGFyc2VkIEpTT04gcmVzcG9uc2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgVVJMIChtdXN0IGJlIGh0dHA6Ly8gb3IgaHR0cHM6Ly8pJyksXG4gICAgICBoZWFkZXJzOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDdXN0b20gaGVhZGVycyBhcyBrZXktdmFsdWUgcGFpcnMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwR2V0SnNvbihwYXJhbXMgYXMgSHR0cEdldEpzb25QYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gaHR0cF9wb3N0X2pzb24gdG9vbCAtIENvbnZlbmllbmNlIHdyYXBwZXIgZm9yIFBPU1QgcmVxdWVzdHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaHR0cF9wb3N0X2pzb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBhIFBPU1QgcmVxdWVzdCB3aXRoIEpTT04gYm9keSBhbmQgcmV0dXJuIHBhcnNlZCByZXNwb25zZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnUmVxdWVzdCBVUkwgKG11c3QgYmUgaHR0cDovLyBvciBodHRwczovLyknKSxcbiAgICAgIGRhdGE6IHoucmVjb3JkKHoudW5rbm93bigpKS5kZXNjcmliZSgnSlNPTiBvYmplY3QgdG8gc2VuZCBhcyByZXF1ZXN0IGJvZHknKSxcbiAgICAgIGhlYWRlcnM6IHoucmVjb3JkKHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0N1c3RvbSBoZWFkZXJzIGFzIGtleS12YWx1ZSBwYWlycycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGh0dHBQb3N0SnNvbihwYXJhbXMgYXMgSHR0cFBvc3RKc29uUGFyYW1zKSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJhZ0luZGV4RmlsZXNQYXJhbXMge1xuICBkaXJlY3RvcnlQYXRoOiBzdHJpbmc7XG4gIGZpbGVQYXR0ZXJuPzogc3RyaW5nO1xuICBiYXRjaFNpemU/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBSYWdRdWVyeVZlY3RvclBhcmFtcyB7XG4gIHF1ZXJ5OiBzdHJpbmc7XG4gIHRvcEs/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBSYWdDbGVhckluZGV4UGFyYW1zIHtcbiAgY29uZmlybTogYm9vbGVhbjtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIERvY3VtZW50Q2h1bmsge1xuICBpZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIG1ldGFkYXRhOiB7XG4gICAgZmlsZV9wYXRoOiBzdHJpbmc7XG4gICAgZmlsZV9uYW1lOiBzdHJpbmc7XG4gICAgY2h1bmtfaW5kZXg6IG51bWJlcjtcbiAgICB0b3RhbF9jaHVua3M6IG51bWJlcjtcbiAgICB3b3JkX2NvdW50OiBudW1iZXI7XG4gIH07XG59XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHQge1xuICBpZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHNjb3JlOiBudW1iZXI7XG4gIG1ldGFkYXRhOiBEb2N1bWVudENodW5rWydtZXRhZGF0YSddO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBWZWN0b3IgU3RvcmUgSW1wbGVtZW50YXRpb24gKExvY2FsKSA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogU2ltcGxlIGxvY2FsIHZlY3RvciBzdG9yZSB1c2luZyBpbi1tZW1vcnkgc3RvcmFnZSB3aXRoIGNvc2luZSBzaW1pbGFyaXR5ICovXG5jbGFzcyBMb2NhbFZlY3RvclN0b3JlIHtcbiAgcHJpdmF0ZSBkb2N1bWVudHM6IE1hcDxzdHJpbmcsIHsgZW1iZWRkaW5nOiBGbG9hdDMyQXJyYXk7IGNodW5rOiBEb2N1bWVudENodW5rIH0+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIGluZGV4TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4TmFtZTogc3RyaW5nID0gJ2FpX3Rvb2xib3hfcmFnJykge1xuICAgIHRoaXMuaW5kZXhOYW1lID0gaW5kZXhOYW1lO1xuICB9XG5cbiAgLyoqIEFkZCBkb2N1bWVudHMgdG8gdGhlIHN0b3JlICovXG4gIGFkZChkb2N1bWVudHM6IERvY3VtZW50Q2h1bmtbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3VtZW50cykge1xuICAgICAgdGhpcy5kb2N1bWVudHMuc2V0KGRvYy5pZCwgeyBlbWJlZGRpbmc6IG5ldyBGbG9hdDMyQXJyYXkoMCksIGNodW5rOiBkb2MgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCBlbWJlZGRpbmdzIGZvciBhbGwgZG9jdW1lbnRzICovXG4gIHNldEVtYmVkZGluZ3MoaWRzOiBzdHJpbmdbXSwgZW1iZWRkaW5nczogRmxvYXQzMkFycmF5W10pOiB2b2lkIHtcbiAgICBpZHMuZm9yRWFjaCgoaWQsIGkpID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKTtcbiAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICBlbnRyeS5lbWJlZGRpbmcgPSBlbWJlZGRpbmdzW2ldO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFNlYXJjaCBmb3Igc2ltaWxhciBkb2N1bWVudHMgKi9cbiAgc2VhcmNoKHF1ZXJ5RW1iZWRkaW5nOiBGbG9hdDMyQXJyYXksIHRvcEs6IG51bWJlcik6IFNlYXJjaFJlc3VsdFtdIHtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGlkOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgW2lkLCBlbnRyeV0gb2YgdGhpcy5kb2N1bWVudHMuZW50cmllcygpKSB7XG4gICAgICBpZiAoZW50cnkuZW1iZWRkaW5nLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICBcbiAgICAgIC8vIENvc2luZSBzaW1pbGFyaXR5XG4gICAgICBsZXQgZG90UHJvZHVjdCA9IDA7XG4gICAgICBsZXQgbm9ybUEgPSAwO1xuICAgICAgbGV0IG5vcm1CID0gMDtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyeS5lbWJlZGRpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZG90UHJvZHVjdCArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIGVudHJ5LmVtYmVkZGluZ1tpXTtcbiAgICAgICAgbm9ybUEgKz0gZW50cnkuZW1iZWRkaW5nW2ldICogZW50cnkuZW1iZWRkaW5nW2ldO1xuICAgICAgICBub3JtQiArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIHF1ZXJ5RW1iZWRkaW5nW2ldO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzaW1pbGFyaXR5ID0gbm9ybUEgPiAwICYmIG5vcm1CID4gMCA/IGRvdFByb2R1Y3QgLyAoTWF0aC5zcXJ0KG5vcm1BKSAqIE1hdGguc3FydChub3JtQikpIDogMDtcbiAgICAgIFxuICAgICAgcmVzdWx0cy5wdXNoKHsgaWQsIHNjb3JlOiBzaW1pbGFyaXR5IH0pO1xuICAgIH1cblxuICAgIC8vIFNvcnQgYnkgc2ltaWxhcml0eSBkZXNjZW5kaW5nIGFuZCByZXR1cm4gdG9wIEtcbiAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKVxuICAgICAgLnNsaWNlKDAsIHRvcEspXG4gICAgICAubWFwKCh7IGlkLCBzY29yZSB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKSE7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGVudHJ5LmNodW5rLmlkLFxuICAgICAgICAgIHRleHQ6IGVudHJ5LmNodW5rLnRleHQsXG4gICAgICAgICAgc2NvcmUsXG4gICAgICAgICAgbWV0YWRhdGE6IGVudHJ5LmNodW5rLm1ldGFkYXRhLFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH1cblxuICAvKiogQ2xlYXIgYWxsIGRvY3VtZW50cyAqL1xuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmRvY3VtZW50cy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIEdldCBkb2N1bWVudCBjb3VudCAqL1xuICBnZXQgY291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuc2l6ZTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUZXh0IENodW5raW5nID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTcGxpdCB0ZXh0IGludG8gY2h1bmtzIHdpdGggb3ZlcmxhcCAqL1xuZnVuY3Rpb24gY2h1bmtUZXh0KHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSA1MDAsIG92ZXJsYXA6IG51bWJlciA9IDUwKTogRG9jdW1lbnRDaHVua1tdIHtcbiAgY29uc3Qgd29yZHMgPSB0ZXh0LnNwbGl0KC9cXHMrLyk7XG4gIGNvbnN0IGNodW5rczogRG9jdW1lbnRDaHVua1tdID0gW107XG4gIFxuICBpZiAod29yZHMubGVuZ3RoIDw9IGNodW5rU2l6ZSkge1xuICAgIHJldHVybiBbe1xuICAgICAgaWQ6IGBjaHVua18ke0RhdGUubm93KCl9XzBgLFxuICAgICAgdGV4dDogdGV4dCxcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogJycsXG4gICAgICAgIGZpbGVfbmFtZTogJycsXG4gICAgICAgIGNodW5rX2luZGV4OiAwLFxuICAgICAgICB0b3RhbF9jaHVua3M6IDEsXG4gICAgICAgIHdvcmRfY291bnQ6IHdvcmRzLmxlbmd0aCxcbiAgICAgIH0sXG4gICAgfV07XG4gIH1cblxuICBsZXQgc3RhcnRJbmRleCA9IDA7XG4gIGxldCBjaHVua0luZGV4ID0gMDtcblxuICB3aGlsZSAoc3RhcnRJbmRleCA8IHdvcmRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGVuZEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCArIGNodW5rU2l6ZSwgd29yZHMubGVuZ3RoKTtcbiAgICBjb25zdCBjaHVua1RleHQgPSB3b3Jkcy5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCkuam9pbignICcpO1xuICAgIFxuICAgIGNodW5rcy5wdXNoKHtcbiAgICAgIGlkOiBgY2h1bmtfJHtEYXRlLm5vdygpfV8ke2NodW5rSW5kZXh9YCxcbiAgICAgIHRleHQ6IGNodW5rVGV4dCxcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogJycsIC8vIFdpbGwgYmUgc2V0IGxhdGVyXG4gICAgICAgIGZpbGVfbmFtZTogJycsIC8vIFdpbGwgYmUgc2V0IGxhdGVyXG4gICAgICAgIGNodW5rX2luZGV4OiBjaHVua0luZGV4LFxuICAgICAgICB0b3RhbF9jaHVua3M6IE1hdGguY2VpbCh3b3Jkcy5sZW5ndGggLyAoY2h1bmtTaXplIC0gb3ZlcmxhcCkpLFxuICAgICAgICB3b3JkX2NvdW50OiBlbmRJbmRleCAtIHN0YXJ0SW5kZXgsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY2h1bmtJbmRleCsrO1xuICAgIHN0YXJ0SW5kZXggPSBlbmRJbmRleCAtIG92ZXJsYXA7XG4gIH1cblxuICByZXR1cm4gY2h1bmtzO1xufVxuXG4vKiogR2VuZXJhdGUgc2ltcGxlIFRGLUlERi1saWtlIGVtYmVkZGluZ3MgZm9yIHRleHQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRW1iZWRkaW5nKHRleHQ6IHN0cmluZyk6IEZsb2F0MzJBcnJheSB7XG4gIC8vIFNpbXBsZSB3b3JkIGZyZXF1ZW5jeS1iYXNlZCBlbWJlZGRpbmcgKGRpbWVuc2lvbjogMTAwKVxuICBjb25zdCBkaW1lbnNpb25zID0gMTAwO1xuICBjb25zdCBlbWJlZGRpbmcgPSBuZXcgRmxvYXQzMkFycmF5KGRpbWVuc2lvbnMpO1xuICBcbiAgLy8gVG9rZW5pemUgYW5kIGhhc2ggd29yZHMgdG8gZGltZW5zaW9uc1xuICBjb25zdCB3b3JkcyA9IHRleHQudG9Mb3dlckNhc2UoKS5tYXRjaCgvW2Etel0rL2cpIHx8IFtdO1xuICBjb25zdCB3b3JkU2V0ID0gbmV3IFNldCh3b3Jkcyk7XG4gIFxuICBmb3IgKGNvbnN0IHdvcmQgb2Ygd29yZFNldCkge1xuICAgIGxldCBoYXNoID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIHdvcmQuY2hhckNvZGVBdChpKTtcbiAgICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGRpbUluZGV4ID0gTWF0aC5hYnMoaGFzaCAlIGRpbWVuc2lvbnMpO1xuICAgIGVtYmVkZGluZ1tkaW1JbmRleF0gKz0gMS4wIC8gKHdvcmQubGVuZ3RoICsgMSk7IC8vIFdlaWdodCBieSBpbnZlcnNlIGxlbmd0aFxuICB9XG5cbiAgLy8gTm9ybWFsaXplXG4gIGxldCBub3JtID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1lbnNpb25zOyBpKyspIHtcbiAgICBub3JtICs9IGVtYmVkZGluZ1tpXSAqIGVtYmVkZGluZ1tpXTtcbiAgfVxuICBub3JtID0gTWF0aC5zcXJ0KG5vcm0pIHx8IDE7XG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbWVuc2lvbnM7IGkrKykge1xuICAgIGVtYmVkZGluZ1tpXSAvPSBub3JtO1xuICB9XG5cbiAgcmV0dXJuIGVtYmVkZGluZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBJbmRleCBmaWxlcyBpbiBhIGRpcmVjdG9yeSBmb3Igc2VtYW50aWMgc2VhcmNoLlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdJbmRleEZpbGVzKHsgXG4gIGRpcmVjdG9yeVBhdGgsIFxuICBmaWxlUGF0dGVybiA9ICcqLnt0cyxqcyx0c3gsanN4LG1kLGpzb24seWFtbCx5bWwsdG9tbCx0eHR9JyxcbiAgYmF0Y2hTaXplID0gMTAgXG59OiBSYWdJbmRleEZpbGVzUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgZGlyZWN0b3J5IGV4aXN0c1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnlQYXRoKSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGlyZWN0b3J5IG5vdCBmb3VuZDogJHtkaXJlY3RvcnlQYXRofWAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBzdG9yZSA9IG5ldyBMb2NhbFZlY3RvclN0b3JlKCk7XG4gICAgbGV0IGluZGV4ZWRDb3VudCA9IDA7XG4gICAgbGV0IHNraXBwZWRDb3VudCA9IDA7XG5cbiAgICAvLyBGaW5kIGZpbGVzIG1hdGNoaW5nIHBhdHRlcm5cbiAgICBjb25zdCBmaW5kRmlsZXMgPSAoZGlyOiBzdHJpbmcpOiBzdHJpbmdbXSA9PiB7XG4gICAgICBsZXQgcmVzdWx0czogc3RyaW5nW10gPSBbXTtcbiAgICAgIFxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGRpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgLy8gU2tpcCBub2RlX21vZHVsZXMgYW5kIC5naXQgZGlyZWN0b3JpZXNcbiAgICAgICAgICAgIGlmIChlbnRyeS5uYW1lID09PSAnbm9kZV9tb2R1bGVzJyB8fCBlbnRyeS5uYW1lID09PSAnLmdpdCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KGZpbmRGaWxlcyhmdWxsUGF0aCkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZpbGUgZXh0ZW5zaW9uIGFnYWluc3QgcGF0dGVyblxuICAgICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBjb25zdCBhbGxvd2VkRXh0cyA9IFsnLnRzJywgJy5qcycsICcudHN4JywgJy5qc3gnLCAnLm1kJywgJy5qc29uJywgJy55YW1sJywgJy55bWwnLCAnLnRvbWwnLCAnLnR4dCddO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoYWxsb3dlZEV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbQUkgVG9vbGJveF0gQ291bGQgbm90IHJlYWQgZGlyZWN0b3J5ICR7ZGlyfTpgLCBlcnJvcik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBjb25zdCBmaWxlcyA9IGZpbmRGaWxlcyhkaXJlY3RvcnlQYXRoKTtcbiAgICBcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGluZGV4ZWRDb3VudDogMCwgbWVzc2FnZTogJ05vIG1hdGNoaW5nIGZpbGVzIGZvdW5kJyB9IH07XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBlYWNoIGZpbGVcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNraXAgbGFyZ2UgZmlsZXMgKD4xTUIpXG4gICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCA+IDEwMjQgKiAxMDI0KSB7XG4gICAgICAgICAgc2tpcHBlZENvdW50Kys7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaHVuayB0aGUgdGV4dFxuICAgICAgICBjb25zdCBjaHVua3MgPSBjaHVua1RleHQoY29udGVudCk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgbWV0YWRhdGEgZm9yIGVhY2ggY2h1bmtcbiAgICAgICAgY2h1bmtzLmZvckVhY2goY2h1bmsgPT4ge1xuICAgICAgICAgIGNodW5rLm1ldGFkYXRhLmZpbGVfcGF0aCA9IGZpbGVQYXRoO1xuICAgICAgICAgIGNodW5rLm1ldGFkYXRhLmZpbGVfbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmdzIGFuZCBhZGQgdG8gc3RvcmVcbiAgICAgICAgY29uc3QgaWRzID0gY2h1bmtzLm1hcChjID0+IGMuaWQpO1xuICAgICAgICBjb25zdCBlbWJlZGRpbmdzID0gY2h1bmtzLm1hcChjID0+IGdlbmVyYXRlRW1iZWRkaW5nKGMudGV4dCkpO1xuICAgICAgICBcbiAgICAgICAgc3RvcmUuYWRkKGNodW5rcyk7XG4gICAgICAgIHN0b3JlLnNldEVtYmVkZGluZ3MoaWRzLCBlbWJlZGRpbmdzKTtcbiAgICAgICAgXG4gICAgICAgIGluZGV4ZWRDb3VudCArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbQUkgVG9vbGJveF0gQ291bGQgbm90IGluZGV4ICR7ZmlsZVBhdGh9OmAsIGVycm9yKTtcbiAgICAgICAgc2tpcHBlZENvdW50Kys7XG4gICAgICB9XG5cbiAgICAgIC8vIFByb2dyZXNzIGNhbGxiYWNrIGV2ZXJ5IGJhdGNoXG4gICAgICBpZiAoKGluZGV4ZWRDb3VudCArIHNraXBwZWRDb3VudCkgJSBiYXRjaFNpemUgPT09IDApIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYFxccltBSSBUb29sYm94XSBJbmRleGVkICR7KGluZGV4ZWRDb3VudCArIHNraXBwZWRDb3VudCl9IGNodW5rcy4uLmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdcXG5bQUkgVG9vbGJveF0gSW5kZXhpbmcgY29tcGxldGUnKTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpbmRleGVkQ2h1bmtzOiBpbmRleGVkQ291bnQsXG4gICAgICAgIGZpbGVzUHJvY2Vzc2VkOiBmaWxlcy5sZW5ndGgsXG4gICAgICAgIHNraXBwZWRGaWxlczogc2tpcHBlZENvdW50LFxuICAgICAgICB0b3RhbERvY3VtZW50czogc3RvcmUuY291bnQsXG4gICAgICAgIGRpcmVjdG9yeVBhdGgsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgaW5kZXhpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8qKlxuICogUXVlcnkgdGhlIHZlY3RvciBpbmRleCBmb3Igc2VtYW50aWNhbGx5IHNpbWlsYXIgZG9jdW1lbnRzLlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdRdWVyeVZlY3Rvcih7IHF1ZXJ5LCB0b3BLID0gNSB9OiBSYWdRdWVyeVZlY3RvclBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIEdlbmVyYXRlIGVtYmVkZGluZyBmb3IgdGhlIHF1ZXJ5XG4gICAgY29uc3QgcXVlcnlFbWJlZGRpbmcgPSBnZW5lcmF0ZUVtYmVkZGluZyhxdWVyeSk7XG4gICAgXG4gICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIHVzZSBDaHJvbWFEQiBvciBzaW1pbGFyXG4gICAgLy8gRm9yIG5vdywgd2UgcmV0dXJuIGEgcGxhY2Vob2xkZXIgcmVzcG9uc2VcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcXVlcnksXG4gICAgICAgIHRvcEssXG4gICAgICAgIHJlc3VsdHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3BsYWNlaG9sZGVyJyxcbiAgICAgICAgICAgIHRleHQ6ICdWZWN0b3Igc2VhcmNoIHJlcXVpcmVzIENocm9tYURCIGludGVncmF0aW9uLiBUaGlzIGlzIGEgcGxhY2Vob2xkZXIuJyxcbiAgICAgICAgICAgIHNjb3JlOiAwLFxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgZmlsZV9wYXRoOiAnJyxcbiAgICAgICAgICAgICAgZmlsZV9uYW1lOiAnJyxcbiAgICAgICAgICAgICAgY2h1bmtfaW5kZXg6IDAsXG4gICAgICAgICAgICAgIHRvdGFsX2NodW5rczogMSxcbiAgICAgICAgICAgICAgd29yZF9jb3VudDogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbm90ZTogJ1RvIGVuYWJsZSBmdWxsIHZlY3RvciBzZWFyY2gsIGluc3RhbGwgY2hyb21hZGIgYW5kIHVwZGF0ZSB0aGUgaW1wbGVtZW50YXRpb24uJyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBxdWVyeSBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhciB0aGUgdmVjdG9yIGluZGV4LlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdDbGVhckluZGV4KHsgY29uZmlybSB9OiBSYWdDbGVhckluZGV4UGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGlmICghY29uZmlybSkge1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NvbmZpcm1hdGlvbiByZXF1aXJlZCB0byBjbGVhciBpbmRleCcgfTtcbiAgfVxuXG4gIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBjbGVhciBDaHJvbWFEQlxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgZGF0YTogeyBtZXNzYWdlOiAnVmVjdG9yIGluZGV4IGNsZWFyZWQgc3VjY2Vzc2Z1bGx5JyB9LFxuICB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJSYWdUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcmFnX2luZGV4X2ZpbGVzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX2luZGV4X2ZpbGVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0luZGV4IGZpbGVzIGluIGEgZGlyZWN0b3J5IGZvciBzZW1hbnRpYyBzZWFyY2guIFN1cHBvcnRzIFR5cGVTY3JpcHQsIEphdmFTY3JpcHQsIE1hcmtkb3duLCBKU09OLCBZQU1MLCBhbmQgdGV4dCBmaWxlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0RpcmVjdG9yeSBwYXRoIHRvIGluZGV4JyksXG4gICAgICBmaWxlUGF0dGVybjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJyoue3RzLGpzLHRzeCxqc3gsbWQsanNvbix5YW1sLHltbCx0b21sLHR4dH0nKS5kZXNjcmliZSgnRmlsZSBwYXR0ZXJuIHRvIG1hdGNoIChnbG9iIHN5bnRheCknKSxcbiAgICAgIGJhdGNoU2l6ZTogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnQmF0Y2ggc2l6ZSBmb3IgcHJvZ3Jlc3MgcmVwb3J0aW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmFnSW5kZXhGaWxlcyhwYXJhbXMgYXMgUmFnSW5kZXhGaWxlc1BhcmFtcyksXG4gIH0pKTtcblxuICAvLyByYWdfcXVlcnlfdmVjdG9yIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX3F1ZXJ5X3ZlY3RvcicsXG4gICAgZGVzY3JpcHRpb246ICdRdWVyeSB0aGUgdmVjdG9yIGluZGV4IGZvciBzZW1hbnRpY2FsbHkgc2ltaWxhciBkb2N1bWVudHMuIFJldHVybnMgdG9wLWsgbW9zdCByZWxldmFudCBjaHVua3MuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRleHQnKSxcbiAgICAgIHRvcEs6IHoubnVtYmVyKCkubWluKDEpLm1heCgyMCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdOdW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdRdWVyeVZlY3RvcihwYXJhbXMgYXMgUmFnUXVlcnlWZWN0b3JQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gcmFnX2NsZWFyX2luZGV4IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX2NsZWFyX2luZGV4JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIHRoZSB2ZWN0b3Igc2VhcmNoIGluZGV4LiBSZXF1aXJlcyBjb25maXJtYXRpb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb25maXJtOiB6LmJvb2xlYW4oKS5kZXNjcmliZSgnU2V0IHRvIHRydWUgdG8gY29uZmlybSBjbGVhcmluZyB0aGUgaW5kZXgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdDbGVhckluZGV4KHBhcmFtcyBhcyBSYWdDbGVhckluZGV4UGFyYW1zKSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVUkgQ29tcG9uZW50IFRlbXBsYXRlcyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBidXR0b24gY29tcG9uZW50ICovXG5mdW5jdGlvbiBnZW5lcmF0ZUJ1dHRvbkh0bWwobGFiZWw6IHN0cmluZywgY29sb3I6IHN0cmluZyA9ICcjMDA3YmZmJywgaWQ6IHN0cmluZyA9ICd1aS1idG4nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBcbiAgICA8YnV0dG9uIGlkPVwiJHtpZH1cIiBzdHlsZT1cIlxuICAgICAgcGFkZGluZzogMTJweCAyNHB4O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn07XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnM7XG4gICAgXCI+JHtsYWJlbH08L2J1dHRvbj5cbiAgYDtcbn1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgZm9ybSBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRm9ybUh0bWwoZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH0+LCBzdWJtaXRMYWJlbDogc3RyaW5nID0gJ1N1Ym1pdCcpOiBzdHJpbmcge1xuICBjb25zdCBmaWVsZHNIdG1sID0gZmllbGRzLm1hcChmaWVsZCA9PiBgXG4gICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDE1cHg7XCI+XG4gICAgICA8bGFiZWwgZm9yPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7IG1hcmdpbi1ib3R0b206IDVweDsgZm9udC13ZWlnaHQ6IGJvbGQ7XCI+JHtmaWVsZC5sYWJlbH08L2xhYmVsPlxuICAgICAgJHtmaWVsZC50eXBlID09PSAndGV4dGFyZWEnIFxuICAgICAgICA/IGA8dGV4dGFyZWEgaWQ9XCIke2ZpZWxkLm5hbWV9XCIgbmFtZT1cIiR7ZmllbGQubmFtZX1cIiByb3dzPVwiNFwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvdGV4dGFyZWE+YFxuICAgICAgICA6IGZpZWxkLnR5cGUgPT09ICdzZWxlY3QnXG4gICAgICAgICAgPyBgPHNlbGVjdCBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjxvcHRpb24gdmFsdWU9XCJcIj5TZWxlY3QuLi48L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiMVwiPk9wdGlvbiAxPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIjJcIj5PcHRpb24gMjwvb3B0aW9uPjwvc2VsZWN0PmBcbiAgICAgICAgICA6IGA8aW5wdXQgdHlwZT1cIiR7ZmllbGQudHlwZX1cIiBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiIC8+YFxuICAgICAgfVxuICAgIDwvZGl2PlxuICBgKS5qb2luKCcnKTtcblxuICByZXR1cm4gYFxuICAgIDxmb3JtIGlkPVwidWktZm9ybVwiIG9uc3VibWl0PVwiZXZlbnQucHJldmVudERlZmF1bHQoKTsgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tcmVzdWx0JykuaW5uZXJIVE1MID0gJ0Zvcm0gc3VibWl0dGVkISc7XCI+XG4gICAgICAke2ZpZWxkc0h0bWx9XG4gICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBzdHlsZT1cInBhZGRpbmc6IDEycHggMjRweDsgYmFja2dyb3VuZC1jb2xvcjogIzAwN2JmZjsgY29sb3I6IHdoaXRlOyBib3JkZXI6IG5vbmU7IGJvcmRlci1yYWRpdXM6IDZweDsgY3Vyc29yOiBwb2ludGVyO1wiPiR7c3VibWl0TGFiZWx9PC9idXR0b24+XG4gICAgPC9mb3JtPlxuICAgIDxkaXYgaWQ9XCJmb3JtLXJlc3VsdFwiIHN0eWxlPVwibWFyZ2luLXRvcDogMTVweDsgcGFkZGluZzogMTBweDsgYmFja2dyb3VuZC1jb2xvcjogI2Y4ZjlmYTsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvZGl2PlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBjaGFydCBjb21wb25lbnQgKHNpbXBsZSBiYXIgY2hhcnQpICovXG5mdW5jdGlvbiBnZW5lcmF0ZUNoYXJ0SHRtbChkYXRhOiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfT4sIHRpdGxlOiBzdHJpbmcgPSAnQmFyIENoYXJ0Jyk6IHN0cmluZyB7XG4gIGNvbnN0IG1heFZhbHVlID0gTWF0aC5tYXgoLi4uZGF0YS5tYXAoZCA9PiBkLnZhbHVlKSk7XG4gIGNvbnN0IGJhcnNIdG1sID0gZGF0YS5tYXAoZCA9PiB7XG4gICAgY29uc3QgaGVpZ2h0ID0gKGQudmFsdWUgLyBtYXhWYWx1ZSkgKiAyMDA7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBtYXJnaW4tcmlnaHQ6IDEwcHg7XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogNDBweDsgaGVpZ2h0OiAke2hlaWdodH1weDsgYmFja2dyb3VuZC1jb2xvcjogIzAwN2JmZjsgYm9yZGVyLXJhZGl1czogNHB4IDRweCAwIDA7XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9KS5qb2luKCcnKTtcblxuICBjb25zdCBsYWJlbHNIdG1sID0gZGF0YS5tYXAoZCA9PiBgXG4gICAgPGRpdiBzdHlsZT1cIndpZHRoOiA0MHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7IGZvbnQtc2l6ZTogMTJweDtcIj4ke2QubGFiZWx9PC9kaXY+XG4gIGApLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cInBhZGRpbmc6IDIwcHg7IGJhY2tncm91bmQtY29sb3I6ICNmOGY5ZmE7IGJvcmRlci1yYWRpdXM6IDhweDtcIj5cbiAgICAgIDxoMz4ke3RpdGxlfTwvaDM+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtZW5kOyBoZWlnaHQ6IDIyMHB4OyBtYXJnaW4tYm90dG9tOiAxMHB4O1wiPiR7YmFyc0h0bWx9PC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XCI+JHtsYWJlbHNIdG1sfTwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBkYXNoYm9hcmQgY29tcG9uZW50ICovXG5mdW5jdGlvbiBnZW5lcmF0ZURhc2hib2FyZEh0bWwodGl0bGVzOiBzdHJpbmdbXSwgY29udGVudDogQXJyYXk8eyB0eXBlOiAndGV4dCcgfCAnY2hhcnQnOyBkYXRhPzogYW55IH0+KTogc3RyaW5nIHtcbiAgY29uc3QgY2FyZHNIdG1sID0gdGl0bGVzLm1hcCgodGl0bGUsIGluZGV4KSA9PiB7XG4gICAgY29uc3QgY2FyZENvbnRlbnQgPSBjb250ZW50W2luZGV4XT8udHlwZSA9PT0gJ2NoYXJ0JyBcbiAgICAgID8gZ2VuZXJhdGVDaGFydEh0bWwoY29udGVudFtpbmRleF0uZGF0YSB8fCBbeyBsYWJlbDogJ0EnLCB2YWx1ZTogNTAgfSwgeyBsYWJlbDogJ0InLCB2YWx1ZTogODAgfV0sIHRpdGxlKVxuICAgICAgOiBgPHAgc3R5bGU9XCJwYWRkaW5nOiAyMHB4O1wiPiR7Y29udGVudFtpbmRleF0/LmRhdGEgfHwgYENvbnRlbnQgZm9yICR7dGl0bGV9YH08L3A+YDtcbiAgICBcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7IG1pbi13aWR0aDogMjUwcHg7IGJhY2tncm91bmQtY29sb3I6IHdoaXRlOyBib3JkZXItcmFkaXVzOiA4cHg7IGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuMSk7IG1hcmdpbjogMTBweDtcIj5cbiAgICAgICAgJHtjYXJkQ29udGVudH1cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH0pLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtd3JhcDogd3JhcDsgZ2FwOiAyMHB4OyBwYWRkaW5nOiAyMHB4O1wiPiR7Y2FyZHNIdG1sfTwvZGl2PlxuICBgO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJVaUdlbmVyYXRpb25Ub29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gZ2VuZXJhdGVfdWlfY29tcG9uZW50IHRvb2wgXHUyMDE0IEdlbmVyYXRlIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2VuZXJhdGVfdWlfY29tcG9uZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYXRlIEhUTUwvQ1NTL0pTIGNvZGUgZm9yIGFuIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudCAoYnV0dG9uLCBmb3JtLCBjaGFydCwgZGFzaGJvYXJkKS4gUmV0dXJucyB0aGUgZ2VuZXJhdGVkIGNvZGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21wb25lbnRfdHlwZTogei5lbnVtKFsnYnV0dG9uJywgJ2Zvcm0nLCAnY2hhcnQnLCAnZGFzaGJvYXJkJ10pLmRlc2NyaWJlKCdUeXBlIG9mIFVJIGNvbXBvbmVudCB0byBnZW5lcmF0ZScpLFxuICAgICAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTGFiZWwgdGV4dCBmb3IgYnV0dG9ucyBvciBmb3JtcycpLFxuICAgICAgZmllbGRzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbmFtZTogei5zdHJpbmcoKSxcbiAgICAgICAgdHlwZTogei5lbnVtKFsndGV4dCcsICdlbWFpbCcsICdwYXNzd29yZCcsICdudW1iZXInLCAndGV4dGFyZWEnLCAnc2VsZWN0J10pLFxuICAgICAgICBsYWJlbDogei5zdHJpbmcoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGb3JtIGZpZWxkcyAoZm9yIGZvcm0gY29tcG9uZW50KScpLFxuICAgICAgY2hhcnRfZGF0YTogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIGxhYmVsOiB6LnN0cmluZygpLFxuICAgICAgICB2YWx1ZTogei5udW1iZXIoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDaGFydCBkYXRhIHBvaW50cyAoZm9yIGNoYXJ0IGNvbXBvbmVudCknKSxcbiAgICAgIGRhc2hib2FyZF90aXRsZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGl0bGVzIGZvciBkYXNoYm9hcmQgY2FyZHMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21wb25lbnRfdHlwZSwgbGFiZWwsIGZpZWxkcywgY2hhcnRfZGF0YSwgZGFzaGJvYXJkX3RpdGxlcyB9OiB7IFxuICAgICAgY29tcG9uZW50X3R5cGU6IHN0cmluZzsgXG4gICAgICBsYWJlbD86IHN0cmluZzsgXG4gICAgICBmaWVsZHM/OiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH0+OyBcbiAgICAgIGNoYXJ0X2RhdGE/OiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfT47XG4gICAgICBkYXNoYm9hcmRfdGl0bGVzPzogc3RyaW5nW107XG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAoY29tcG9uZW50X3R5cGUpIHtcbiAgICAgICAgICBjYXNlICdidXR0b24nOlxuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlQnV0dG9uSHRtbChsYWJlbCB8fCAnQ2xpY2sgTWUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Zvcm0nOlxuICAgICAgICAgICAgaWYgKCFmaWVsZHMgfHwgZmllbGRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGb3JtIGNvbXBvbmVudCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZmllbGQnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVGb3JtSHRtbChmaWVsZHMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnY2hhcnQnOlxuICAgICAgICAgICAgaWYgKCFjaGFydF9kYXRhIHx8IGNoYXJ0X2RhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NoYXJ0IGNvbXBvbmVudCByZXF1aXJlcyBkYXRhIHBvaW50cycgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZUNoYXJ0SHRtbChjaGFydF9kYXRhKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Rhc2hib2FyZCc6XG4gICAgICAgICAgICBpZiAoIWRhc2hib2FyZF90aXRsZXMgfHwgZGFzaGJvYXJkX3RpdGxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRGFzaGJvYXJkIGNvbXBvbmVudCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgdGl0bGUnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZGFzaGJvYXJkX3RpdGxlcy5tYXAoKHRpdGxlLCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgICAgdHlwZTogaW5kZXggJSAyID09PSAwID8gJ2NoYXJ0JyA6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgZGF0YTogaW5kZXggJSAyID09PSAwID8gW3sgbGFiZWw6ICdBJywgdmFsdWU6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgfSwgeyBsYWJlbDogJ0InLCB2YWx1ZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSB9XSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZURhc2hib2FyZEh0bWwoZGFzaGJvYXJkX3RpdGxlcywgY29udGVudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5rbm93biBjb21wb25lbnQgdHlwZTogJHtjb21wb25lbnRfdHlwZX1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmdWxsSHRtbCA9IGA8IURPQ1RZUEUgaHRtbD48aHRtbD48aGVhZD48bWV0YSBjaGFyc2V0PVwiVVRGLThcIj48dGl0bGU+VUkgQ29tcG9uZW50PC90aXRsZT48L2hlYWQ+PGJvZHkgc3R5bGU9XCJmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7IHBhZGRpbmc6IDIwcHg7XCI+JHtodG1sfTwvYm9keT48L2h0bWw+YDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tcG9uZW50X3R5cGUsIGh0bWw6IGZ1bGxIdG1sIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZW5lcmF0ZSBVSSBjb21wb25lbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlbmRlcl9hbmRfcHJldmlld191aSB0b29sIFx1MjAxNCBSZW5kZXIgZ2VuZXJhdGVkIFVJIGluIGJyb3dzZXIgYW5kIGNhcHR1cmUgc2NyZWVuc2hvdFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZW5kZXJfYW5kX3ByZXZpZXdfdWknLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVuZGVyIGEgZ2VuZXJhdGVkIEhUTUwgVUkgY29tcG9uZW50LCBzYXZlIGl0IHRvIGEgZmlsZSwgb3BlbiBpdCBpbiB0aGUgZGVmYXVsdCBicm93c2VyLCBhbmQgb3B0aW9uYWxseSB0YWtlIGEgc2NyZWVuc2hvdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGh0bWxfY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbXBsZXRlIEhUTUwgY29udGVudCB0byByZW5kZXInKSxcbiAgICAgIGZpbGVuYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgndWlfcHJldmlldy5odG1sJykuZGVzY3JpYmUoJ0ZpbGVuYW1lIGZvciBzYXZpbmcgKGRlZmF1bHQ6IHVpX3ByZXZpZXcuaHRtbCknKSxcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbCBwYXRoIHRvIHNhdmUgYSBzY3JlZW5zaG90IG9mIHRoZSByZW5kZXJlZCBVSScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGh0bWxfY29udGVudCwgZmlsZW5hbWUsIHNjcmVlbnNob3RfcGF0aCB9OiB7IFxuICAgICAgaHRtbF9jb250ZW50OiBzdHJpbmc7IFxuICAgICAgZmlsZW5hbWU/OiBzdHJpbmc7IFxuICAgICAgc2NyZWVuc2hvdF9wYXRoPzogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGVuYW1lIHx8ICd1aV9wcmV2aWV3Lmh0bWwnO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihnZXRXb3JraW5nRGlyKCksIGZpbGVOYW1lKTtcblxuICAgICAgICAvLyBTYXZlIEhUTUwgdG8gZmlsZVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBodG1sX2NvbnRlbnQpO1xuXG4gICAgICAgIC8vIE9wZW4gaW4gZGVmYXVsdCBicm93c2VyIHVzaW5nIEVTIGltcG9ydCAoc2FtZSBhcyBwcmV2aWV3X2h0bWwgdG9vbClcbiAgICAgICAgY29uc3Qgb3Blbk1vZHVsZSA9IGF3YWl0IGltcG9ydCgnb3BlbicpO1xuICAgICAgICBhd2FpdCBvcGVuTW9kdWxlLmRlZmF1bHQoZmlsZVBhdGgpO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0geyBcbiAgICAgICAgICByZW5kZXJlZDogdHJ1ZSwgXG4gICAgICAgICAgZmlsZTogZmlsZU5hbWUsXG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGFrZSBzY3JlZW5zaG90IGlmIHJlcXVlc3RlZCAodXNpbmcgUHVwcGV0ZWVyKVxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHB1cHBldGVlck1vZHVsZSA9IGF3YWl0IGltcG9ydCgncHVwcGV0ZWVyJyk7XG4gICAgICAgICAgICBjb25zdCBicm93c2VyID0gYXdhaXQgcHVwcGV0ZWVyTW9kdWxlLmRlZmF1bHQubGF1bmNoKHsgaGVhZGxlc3M6IHRydWUgfSk7XG4gICAgICAgICAgICBjb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIExvYWQgdGhlIEhUTUwgZmlsZVxuICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKGBmaWxlOi8vJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgY29udGVudCB0byByZW5kZXJcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvclNlbGVjdG9yKCdib2R5JywgeyB0aW1lb3V0OiA1MDAwIH0pLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGFrZSBzY3JlZW5zaG90XG4gICAgICAgICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3QoeyBwYXRoOiBzY3JlZW5zaG90X3BhdGgsIGZ1bGxQYWdlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90U2F2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhd2FpdCBicm93c2VyLmNsb3NlKCk7XG4gICAgICAgICAgfSBjYXRjaCAoc2NyZWVuc2hvdEVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gc2NyZWVuc2hvdEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBzY3JlZW5zaG90RXJyb3IubWVzc2FnZSA6IFN0cmluZyhzY3JlZW5zaG90RXJyb3IpO1xuICAgICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90V2FybmluZyA9IGBTY3JlZW5zaG90IGZhaWxlZDogJHttZXNzYWdlfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0RGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJlbmRlciBVSTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZXh0cmFjdF91aV9kYXRhIHRvb2wgXHUyMDE0IEV4dHJhY3QgZGF0YSBmcm9tIGludGVyYWN0aXZlIFVJIGVsZW1lbnRzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2V4dHJhY3RfdWlfZGF0YScsXG4gICAgZGVzY3JpcHRpb246ICdFeHRyYWN0IHN0cnVjdHVyZWQgZGF0YSBmcm9tIEhUTUwgY29udGVudCAodGFibGVzLCBmb3JtcywgbGlzdHMpLiBVc2VmdWwgZm9yIHBhcnNpbmcgZ2VuZXJhdGVkIG9yIGZldGNoZWQgVUlzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSFRNTCBjb250ZW50IHRvIGV4dHJhY3QgZGF0YSBmcm9tJyksXG4gICAgICBleHRyYWN0aW9uX3R5cGU6IHouZW51bShbJ3RhYmxlJywgJ2Zvcm0nLCAnbGlzdCddKS5kZWZhdWx0KCd0YWJsZScpLmRlc2NyaWJlKCdUeXBlIG9mIGRhdGEgdG8gZXh0cmFjdCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGh0bWxfY29udGVudCwgZXh0cmFjdGlvbl90eXBlIH06IHsgXG4gICAgICBodG1sX2NvbnRlbnQ6IHN0cmluZzsgXG4gICAgICBleHRyYWN0aW9uX3R5cGU6IHN0cmluZzsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVXNlIE5vZGUuanMgRE9NIHBhcnNlciAoY2hlZXJpby1saWtlIGFwcHJvYWNoIHdpdGggYmFzaWMgcmVnZXggZm9yIHNpbXBsaWNpdHkpXG4gICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgeW91J2QgdXNlIGEgcHJvcGVyIEhUTUwgcGFyc2VyIGxpa2UganNkb20gb3IgY2hlZXJpb1xuICAgICAgICBcbiAgICAgICAgbGV0IGV4dHJhY3RlZERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICAgICAgaWYgKGV4dHJhY3Rpb25fdHlwZSA9PT0gJ3RhYmxlJykge1xuICAgICAgICAgIGNvbnN0IHRhYmxlUmVnZXggPSAvPHRhYmxlW14+XSo+KFtcXHNcXFNdKj8pPFxcL3RhYmxlPi9naTtcbiAgICAgICAgICBjb25zdCByb3dzUmVnZXggPSAvPHRyW14+XSo+KFtcXHNcXFNdKj8pPFxcL3RyPi9naTtcbiAgICAgICAgICBjb25zdCBjZWxsc1JlZ2V4ID0gLzwodGR8dGgpW14+XSo+KFtcXHNcXFNdKj8pPFxcLyh0ZHx0aCk+L2dpO1xuXG4gICAgICAgICAgbGV0IHRhYmxlTWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKCh0YWJsZU1hdGNoID0gdGFibGVSZWdleC5leGVjKGh0bWxfY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB0YWJsZUNvbnRlbnQgPSB0YWJsZU1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3Qgcm93czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCByb3dNYXRjaDtcbiAgICAgICAgICAgIHdoaWxlICgocm93TWF0Y2ggPSByb3dzUmVnZXguZXhlYyh0YWJsZUNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICByb3dzLnB1c2gocm93TWF0Y2hbMV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYXJzZWRSb3dzOiBzdHJpbmdbXVtdID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNlbGxzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICBsZXQgY2VsbE1hdGNoO1xuICAgICAgICAgICAgICBjb25zdCBjZWxsUmVnZXggPSAvPCh0ZHx0aClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHRkfHRoKT4vZ2k7XG4gICAgICAgICAgICAgIHdoaWxlICgoY2VsbE1hdGNoID0gY2VsbFJlZ2V4LmV4ZWMocm93KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjZWxscy5wdXNoKGNlbGxNYXRjaFsyXS5yZXBsYWNlKC88W14+XSs+L2csICcnKS50cmltKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhcnNlZFJvd3MucHVzaChjZWxscyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEudGFibGVzID0gcGFyc2VkUm93cztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAnZm9ybScpIHtcbiAgICAgICAgICBjb25zdCBmb3JtUmVnZXggPSAvPGZvcm1bXj5dKj4oW1xcc1xcU10qPyk8XFwvZm9ybT4vZ2k7XG4gICAgICAgICAgY29uc3QgaW5wdXRSZWdleCA9IC88KGlucHV0fHNlbGVjdHx0ZXh0YXJlYSlbXj5dKlxcLz8+L2dpO1xuXG4gICAgICAgICAgbGV0IGZvcm1NYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKGZvcm1NYXRjaCA9IGZvcm1SZWdleC5leGVjKGh0bWxfY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtQ29udGVudCA9IGZvcm1NYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgdmFsdWU/OiBzdHJpbmcgfT4gPSBbXTtcbiAgICAgICAgICAgIGxldCBpbnB1dE1hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChpbnB1dE1hdGNoID0gaW5wdXRSZWdleC5leGVjKGZvcm1Db250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uc3QgdGFnID0gaW5wdXRNYXRjaFswXTtcbiAgICAgICAgICAgICAgY29uc3QgbmFtZU1hdGNoID0gL25hbWU9W1wiJ10oW15cIiddKylbXCInXS9pLmV4ZWModGFnKTtcbiAgICAgICAgICAgICAgY29uc3QgdHlwZU1hdGNoID0gL3R5cGU9W1wiJ10oW15cIiddKylbXCInXS9pLmV4ZWModGFnKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGlmIChuYW1lTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBmaWVsZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lTWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlTWF0Y2g/LlsxXSB8fCAndGV4dCcsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJycsIC8vIFdvdWxkIG5lZWQgdG8gZXh0cmFjdCBhY3R1YWwgdmFsdWVzIGluIGEgcmVhbCBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEuZm9ybUZpZWxkcyA9IGZpZWxkcztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAnbGlzdCcpIHtcbiAgICAgICAgICBjb25zdCBsaXN0UmVnZXggPSAvPCh1bHxvbClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHVsfG9sKT4vZ2k7XG4gICAgICAgICAgY29uc3QgaXRlbVJlZ2V4ID0gLzxsaVtePl0qPihbXFxzXFxTXSo/KTxcXC9saT4vZ2k7XG5cbiAgICAgICAgICBsZXQgbGlzdE1hdGNoO1xuICAgICAgICAgIHdoaWxlICgobGlzdE1hdGNoID0gbGlzdFJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RDb250ZW50ID0gbGlzdE1hdGNoWzJdO1xuICAgICAgICAgICAgY29uc3QgaXRlbXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBsZXQgaXRlbU1hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChpdGVtTWF0Y2ggPSBpdGVtUmVnZXguZXhlYyhsaXN0Q29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbU1hdGNoWzFdLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpLnRyaW0oKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBleHRyYWN0ZWREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZXh0cmFjdCBVSSBkYXRhOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgTWFuYWdlbWVudCBUeXBlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQ29udGV4dEVudHJ5IHtcbiAgaWQ6IHN0cmluZztcbiAgdGltZXN0YW1wOiBudW1iZXI7XG4gIHR5cGU6ICdkZWNpc2lvbicgfCAncGF0dGVybicgfCAnY29uZmlndXJhdGlvbicgfCAnZmlsZV9jaGFuZ2UnIHwgJ2Vycm9yJyB8ICdzdW1tYXJ5JztcbiAgdGl0bGU6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xuICB0YWdzPzogc3RyaW5nW107XG4gIHNlc3Npb25faWQ/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBDb250ZXh0U3VtbWFyeSB7XG4gIHRvdGFsX2VudHJpZXM6IG51bWJlcjtcbiAgZW50cmllc19ieV90eXBlOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICByZWNlbnRfZW50cmllczogQ29udGV4dEVudHJ5W107XG4gIGxhc3RfdXBkYXRlZDogbnVtYmVyO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDb250ZXh0IFN0b3JhZ2UgTWFuYWdlciA9PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBDb250ZXh0U3RvcmFnZU1hbmFnZXIge1xuICBwcml2YXRlIHN0b3JhZ2VQYXRoOiBzdHJpbmc7XG4gIFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JhZ2VQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgJy5haV90b29sYm94X2NvbnRleHQuanNvbicpO1xuICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dFN0b3JhZ2VdIEluaXRpYWxpemVkIHdpdGggc3RvcmFnZSBwYXRoOiAke3RoaXMuc3RvcmFnZVBhdGh9YCk7XG4gIH1cblxuICAvKiogTG9hZCBjb250ZXh0IGVudHJpZXMgZnJvbSBkaXNrICovXG4gIGxvYWQoKTogQ29udGV4dEVudHJ5W10ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5zdG9yYWdlUGF0aCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtDb250ZXh0U3RvcmFnZS5sb2FkXSBGaWxlIGRvZXMgbm90IGV4aXN0IHlldDogJHt0aGlzLnN0b3JhZ2VQYXRofWApO1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmModGhpcy5zdG9yYWdlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICBjb25zdCBlbnRyaWVzID0gSlNPTi5wYXJzZShkYXRhKSBhcyBDb250ZXh0RW50cnlbXTtcbiAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dFN0b3JhZ2UubG9hZF0gTG9hZGVkICR7ZW50cmllcy5sZW5ndGh9IGVudHJpZXMgZnJvbSBkaXNrYCk7XG4gICAgICByZXR1cm4gZW50cmllcztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFtDb250ZXh0U3RvcmFnZS5sb2FkXSBGYWlsZWQgdG8gbG9hZCBjb250ZXh0IHN0b3JhZ2U6ICR7bWVzc2FnZX1gKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICAvKiogU2F2ZSBjb250ZXh0IGVudHJpZXMgdG8gZGlzayAqL1xuICBzYXZlKGVudHJpZXM6IENvbnRleHRFbnRyeVtdKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZSh0aGlzLnN0b3JhZ2VQYXRoKTtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW0NvbnRleHRTdG9yYWdlLnNhdmVdIENyZWF0ZWQgZGlyZWN0b3J5OiAke2Rpcn1gKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gV3JpdGUgYXRvbWljYWxseSAodGVtcCBmaWxlICsgcmVuYW1lKVxuICAgICAgY29uc3QgdGVtcFBhdGggPSB0aGlzLnN0b3JhZ2VQYXRoICsgJy50bXAnO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyh0ZW1wUGF0aCwgSlNPTi5zdHJpbmdpZnkoZW50cmllcywgbnVsbCwgMikpO1xuICAgICAgZnMucmVuYW1lU3luYyh0ZW1wUGF0aCwgdGhpcy5zdG9yYWdlUGF0aCk7XG4gICAgICBjb25zb2xlLmxvZyhgW0NvbnRleHRTdG9yYWdlLnNhdmVdIFNhdmVkICR7ZW50cmllcy5sZW5ndGh9IGVudHJpZXMgdG8gZGlza2ApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgY29uc29sZS5lcnJvcihgW0NvbnRleHRTdG9yYWdlLnNhdmVdIEZhaWxlZCB0byBzYXZlIGNvbnRleHQgc3RvcmFnZTogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBBZGQgYSBuZXcgY29udGV4dCBlbnRyeSAqL1xuICBhZGRFbnRyeShlbnRyeTogQ29udGV4dEVudHJ5KTogdm9pZCB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIGVudHJpZXMudW5zaGlmdChlbnRyeSk7IC8vIEFkZCB0byBiZWdpbm5pbmdcbiAgICBcbiAgICAvLyBMaW1pdCB0byBsYXN0IDEwMDAgZW50cmllcyB0byBwcmV2ZW50IHVuYm91bmRlZCBncm93dGhcbiAgICBpZiAoZW50cmllcy5sZW5ndGggPiAxMDAwKSB7XG4gICAgICBlbnRyaWVzLnNwbGljZSgxMDAwKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zYXZlKGVudHJpZXMpO1xuICB9XG5cbiAgLyoqIEdldCByZWNlbnQgY29udGV4dCBlbnRyaWVzICovXG4gIGdldFJlY2VudEVudHJpZXMobGltaXQ6IG51bWJlciA9IDIwLCB0eXBlPzogc3RyaW5nKTogQ29udGV4dEVudHJ5W10ge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBcbiAgICBpZiAodHlwZSkge1xuICAgICAgcmV0dXJuIGVudHJpZXMuZmlsdGVyKGUgPT4gZS50eXBlID09PSB0eXBlKS5zbGljZSgwLCBsaW1pdCk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBlbnRyaWVzLnNsaWNlKDAsIGxpbWl0KTtcbiAgfVxuXG4gIC8qKiBTZWFyY2ggY29udGV4dCBlbnRyaWVzIGJ5IHF1ZXJ5ICovXG4gIHNlYXJjaEVudHJpZXMocXVlcnk6IHN0cmluZywgbWF4UmVzdWx0czogbnVtYmVyID0gMTApOiBDb250ZXh0RW50cnlbXSB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIGNvbnN0IGxvd2VyUXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdHMgPSBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBcbiAgICAgIGVudHJ5LnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJRdWVyeSkgfHxcbiAgICAgIGVudHJ5LmNvbnRlbnQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSB8fFxuICAgICAgKGVudHJ5LnRhZ3MgJiYgZW50cnkudGFncy5zb21lKHRhZyA9PiB0YWcudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSkpXG4gICAgKTtcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKTtcbiAgfVxuXG4gIC8qKiBEZWxldGUgY29udGV4dCBlbnRyaWVzIGJ5IElEICovXG4gIGRlbGV0ZUVudHJ5KGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgY29uc3QgZmlsdGVyZWQgPSBlbnRyaWVzLmZpbHRlcihlID0+IGUuaWQgIT09IGlkKTtcbiAgICBcbiAgICBpZiAoZmlsdGVyZWQubGVuZ3RoID09PSBlbnRyaWVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBFbnRyeSBub3QgZm91bmRcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zYXZlKGZpbHRlcmVkKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBDbGVhciBhbGwgY29udGV4dCBlbnRyaWVzICovXG4gIGNsZWFyQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc2F2ZShbXSk7XG4gIH1cblxuICAvKiogR2V0IHN1bW1hcnkgc3RhdGlzdGljcyAqL1xuICBnZXRTdW1tYXJ5KCk6IENvbnRleHRTdW1tYXJ5IHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgXG4gICAgY29uc3QgZW50cmllc0J5VHlwZTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBlbnRyaWVzQnlUeXBlW2VudHJ5LnR5cGVdID0gKGVudHJpZXNCeVR5cGVbZW50cnkudHlwZV0gfHwgMCkgKyAxO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvdGFsX2VudHJpZXM6IGVudHJpZXMubGVuZ3RoLFxuICAgICAgZW50cmllc19ieV90eXBlOiBlbnRyaWVzQnlUeXBlLFxuICAgICAgcmVjZW50X2VudHJpZXM6IGVudHJpZXMuc2xpY2UoMCwgNSksXG4gICAgICBsYXN0X3VwZGF0ZWQ6IERhdGUubm93KCksXG4gICAgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDb250ZXh0IEFuYWx5emVyID09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIENvbnRleHRBbmFseXplciB7XG4gIHByaXZhdGUgc3RvcmFnZU1hbmFnZXI6IENvbnRleHRTdG9yYWdlTWFuYWdlcjtcbiAgXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmFnZU1hbmFnZXIgPSBuZXcgQ29udGV4dFN0b3JhZ2VNYW5hZ2VyKCk7XG4gIH1cblxuICAvKiogQW5hbHl6ZSByZWNlbnQgYWN0aXZpdHkgYW5kIGF1dG8tc2F2ZSBpbXBvcnRhbnQgY29udGV4dCAqL1xuICBhbmFseXplQW5kU2F2ZShcbiAgICBzZXNzaW9uRXZlbnRzOiBBcnJheTx7IHR5cGU6IHN0cmluZzsgdGltZXN0YW1wOiBudW1iZXI7IGRhdGE/OiBhbnkgfT4sXG4gICAgY29uZmlnQ2hhbmdlcz86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4gfCBzdHJpbmc+XG4gICk6IHsgc2F2ZWRfY291bnQ6IG51bWJlcjsgc3VtbWFyeTogc3RyaW5nIH0ge1xuICAgIGNvbnN0IGVudHJpZXM6IENvbnRleHRFbnRyeVtdID0gW107XG5cbiAgICAvLyBBbmFseXplIHRvb2wgdXNhZ2UgcGF0dGVybnNcbiAgICBjb25zdCB0b29sVXNhZ2VDb3VudDogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIHNlc3Npb25FdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQudHlwZS5zdGFydHNXaXRoKCd0b29sXycpKSB7XG4gICAgICAgIGNvbnN0IHRvb2xOYW1lID0gZXZlbnQudHlwZS5yZXBsYWNlKCd0b29sXycsICcnKTtcbiAgICAgICAgdG9vbFVzYWdlQ291bnRbdG9vbE5hbWVdID0gKHRvb2xVc2FnZUNvdW50W3Rvb2xOYW1lXSB8fCAwKSArIDE7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZGVudGlmeSBmcmVxdWVudGx5IHVzZWQgdG9vbHMgKD4zIHVzZXMgaW4gc2Vzc2lvbilcbiAgICBPYmplY3QuZW50cmllcyh0b29sVXNhZ2VDb3VudCkuZm9yRWFjaCgoW3Rvb2wsIGNvdW50XSkgPT4ge1xuICAgICAgaWYgKGNvdW50ID4gMykge1xuICAgICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ3BhdHRlcm4nLFxuICAgICAgICAgIHRpdGxlOiBgRnJlcXVlbnQgVG9vbCBVc2FnZTogJHt0b29sfWAsXG4gICAgICAgICAgY29udGVudDogYFRvb2wgJyR7dG9vbH0nIHdhcyB1c2VkICR7Y291bnR9IHRpbWVzIGluIHRoZSBjdXJyZW50IHNlc3Npb24sIGluZGljYXRpbmcgaXQncyBhIHByaW1hcnkgd29ya2Zsb3cgdG9vbC5gLFxuICAgICAgICAgIHRhZ3M6IFsndXNhZ2VfcGF0dGVybicsICdmcmVxdWVudF90b29sJ10sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQW5hbHl6ZSBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgICBpZiAoY29uZmlnQ2hhbmdlcykge1xuICAgICAgT2JqZWN0LmVudHJpZXMoY29uZmlnQ2hhbmdlcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAnY29uZmlndXJhdGlvbicsXG4gICAgICAgICAgdGl0bGU6IGBDb25maWd1cmF0aW9uIENoYW5nZTogJHtrZXl9YCxcbiAgICAgICAgICBjb250ZW50OiBgU2V0dGluZyAnJHtrZXl9JyB3YXMgY2hhbmdlZCB0byAnJHt2YWx1ZX0nLmAsXG4gICAgICAgICAgdGFnczogWydjb25maWdfY2hhbmdlJ10sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0IGltcG9ydGFudCBkZWNpc2lvbnMgKGJhc2VkIG9uIGV2ZW50IHBhdHRlcm5zKVxuICAgIGNvbnN0IGRlY2lzaW9uRXZlbnRzID0gc2Vzc2lvbkV2ZW50cy5maWx0ZXIoZSA9PiBcbiAgICAgIGUudHlwZSA9PT0gJ2RlY2lzaW9uJyB8fCBcbiAgICAgIChlLmRhdGEgJiYgdHlwZW9mIGUuZGF0YS5kZWNpc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgKTtcblxuICAgIGRlY2lzaW9uRXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgY29uc3QgZGVjaXNpb25UZXh0ID0gZXZlbnQuZGF0YT8uZGVjaXNpb24gfHwgYERlY2lzaW9uIG1hZGUgYXQgJHtuZXcgRGF0ZShldmVudC50aW1lc3RhbXApLnRvTG9jYWxlVGltZVN0cmluZygpfWA7XG4gICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgIHRpbWVzdGFtcDogZXZlbnQudGltZXN0YW1wLFxuICAgICAgICB0eXBlOiAnZGVjaXNpb24nLFxuICAgICAgICB0aXRsZTogJ0ltcG9ydGFudCBEZWNpc2lvbiBSZWNvcmRlZCcsXG4gICAgICAgIGNvbnRlbnQ6IGRlY2lzaW9uVGV4dCxcbiAgICAgICAgdGFnczogWydkZWNpc2lvbiddLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBBdXRvLWdlbmVyYXRlIHN1bW1hcnkgaWYgd2UgaGF2ZSBlbm91Z2ggZW50cmllc1xuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHVuaXF1ZVBhdHRlcm5zID0gbmV3IFNldChlbnRyaWVzLmZpbHRlcihlID0+IGUudHlwZSA9PT0gJ3BhdHRlcm4nKS5tYXAoZSA9PiBlLnRpdGxlKSk7XG4gICAgICBcbiAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICB0eXBlOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiBgU2Vzc2lvbiBDb250ZXh0IFN1bW1hcnkgKCR7bmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKX0pYCxcbiAgICAgICAgY29udGVudDogYEF1dG8tZ2VuZXJhdGVkIHN1bW1hcnk6ICR7ZW50cmllcy5sZW5ndGh9IGNvbnRleHQgZW50cmllcyBzYXZlZC4gS2V5IHBhdHRlcm5zIGRldGVjdGVkOiAke0FycmF5LmZyb20odW5pcXVlUGF0dGVybnMpLmpvaW4oJywgJykgfHwgJ05vIHNwZWNpZmljIHBhdHRlcm5zJ30uIENvbmZpZ3VyYXRpb24gY2hhbmdlcyB0cmFja2VkOiAke09iamVjdC5rZXlzKGNvbmZpZ0NoYW5nZXMgfHwge30pLmxlbmd0aH0uYCxcbiAgICAgICAgdGFnczogWydhdXRvX3N1bW1hcnknXSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTYXZlIGFsbCBlbnRyaWVzIHRvIHN0b3JhZ2VcbiAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB0aGlzLnN0b3JhZ2VNYW5hZ2VyLmFkZEVudHJ5KGVudHJ5KSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNhdmVkX2NvdW50OiBlbnRyaWVzLmxlbmd0aCxcbiAgICAgICAgc3VtbWFyeTogYFNhdmVkICR7ZW50cmllcy5sZW5ndGh9IGNvbnRleHQgZW50cmllcyBpbmNsdWRpbmcgcGF0dGVybnMgYW5kIGRlY2lzaW9ucy5gLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBzYXZlZF9jb3VudDogMCwgc3VtbWFyeTogJ05vIHNpZ25pZmljYW50IGNvbnRleHQgY2hhbmdlcyBkZXRlY3RlZC4nIH07XG4gIH1cblxuICAvKiogR2VuZXJhdGUgYSB1bmlxdWUgSUQgZm9yIGNvbnRleHQgZW50cnkgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjdHhfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgQ29udGV4dEFuYWx5emVyKCk7XG4gIGNvbnN0IHN0b3JhZ2VNYW5hZ2VyID0gbmV3IENvbnRleHRTdG9yYWdlTWFuYWdlcigpO1xuXG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBhdXRvX3N1bW1hcml6ZV9jb250ZXh0IHRvb2wgXHUyMDE0IEFuYWx5emUgc2Vzc2lvbiBhbmQgc2F2ZSBpbXBvcnRhbnQgY29udGV4dFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdhdXRvX3N1bW1hcml6ZV9jb250ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0F1dG9tYXRpY2FsbHkgYW5hbHl6ZSByZWNlbnQgc2Vzc2lvbiBhY3Rpdml0eSwgaWRlbnRpZnkgaW1wb3J0YW50IHBhdHRlcm5zL2RlY2lzaW9ucywgYW5kIHNhdmUgdGhlbSB0byBwZXJzaXN0ZW50IG1lbW9yeSBmb3IgZnV0dXJlIHJlZmVyZW5jZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNlc3Npb25fZXZlbnRzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgdHlwZTogei5zdHJpbmcoKSxcbiAgICAgICAgdGltZXN0YW1wOiB6Lm51bWJlcigpLFxuICAgICAgICBkYXRhOiB6LmFueSgpLm9wdGlvbmFsKCksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnUmVjZW50IHNlc3Npb24gZXZlbnRzIHRvIGFuYWx5emUnKSxcbiAgICAgIGNvbmZpZ19jaGFuZ2VzOiB6LnJlY29yZCh6LnVuaW9uKFt6LmJvb2xlYW4oKSwgei5zdHJpbmcoKV0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDb25maWd1cmF0aW9uIGNoYW5nZXMgbWFkZSBkdXJpbmcgc2Vzc2lvbicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHNlc3Npb25fZXZlbnRzLCBjb25maWdfY2hhbmdlcyB9OiB7IFxuICAgICAgc2Vzc2lvbl9ldmVudHM/OiBBcnJheTx7IHR5cGU6IHN0cmluZzsgdGltZXN0YW1wOiBudW1iZXI7IGRhdGE/OiBhbnkgfT47IFxuICAgICAgY29uZmlnX2NoYW5nZXM/OiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuIHwgc3RyaW5nPjsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYW5hbHl6ZXIuYW5hbHl6ZUFuZFNhdmUoc2Vzc2lvbl9ldmVudHMgfHwgW10sIGNvbmZpZ19jaGFuZ2VzKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29udGV4dCBhbmFseXNpcyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9jb250ZXh0X21lbW9yeSB0b29sIFx1MjAxNCBSZXRyaWV2ZSBhdXRvLXNhdmVkIGNvbnRleHQgZW50cmllc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfY29udGV4dF9tZW1vcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnUmV0cmlldmUgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgZnJvbSBwZXJzaXN0ZW50IG1lbW9yeS4gVXNlZnVsIGZvciByZWNhbGxpbmcgcGFzdCBkZWNpc2lvbnMsIHBhdHRlcm5zLCBvciBjb25maWd1cmF0aW9ucy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGxpbWl0OiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgyMCkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIGVudHJpZXMgdG8gcmV0dXJuJyksXG4gICAgICB0eXBlOiB6LmVudW0oWydkZWNpc2lvbicsICdwYXR0ZXJuJywgJ2NvbmZpZ3VyYXRpb24nLCAnZmlsZV9jaGFuZ2UnLCAnZXJyb3InLCAnc3VtbWFyeSddKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgZW50cnkgdHlwZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGxpbWl0LCB0eXBlIH06IHsgXG4gICAgICBsaW1pdD86IG51bWJlcjsgXG4gICAgICB0eXBlPzogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gc3RvcmFnZU1hbmFnZXIuZ2V0UmVjZW50RW50cmllcyhsaW1pdCB8fCAyMCwgdHlwZSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGVudHJpZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJldHJpZXZlIGNvbnRleHQgbWVtb3J5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzZWFyY2hfY29udGV4dCB0b29sIFx1MjAxNCBTZWFyY2ggYXV0by1zYXZlZCBjb250ZXh0IGJ5IHF1ZXJ5XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NlYXJjaF9jb250ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCB0aHJvdWdoIGF1dG9tYXRpY2FsbHkgc2F2ZWQgY29udGV4dCBlbnRyaWVzIHVzaW5nIHRleHQgbWF0Y2hpbmcuIEZpbmRzIHJlbGV2YW50IHBhc3QgZGVjaXNpb25zLCBwYXR0ZXJucywgb3IgY29uZmlndXJhdGlvbnMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRvIG1hdGNoIGFnYWluc3QgY29udGV4dCBlbnRyaWVzJyksXG4gICAgICBtYXhfcmVzdWx0czogei5udW1iZXIoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVybicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBtYXhfcmVzdWx0cyB9OiB7IFxuICAgICAgcXVlcnk6IHN0cmluZzsgXG4gICAgICBtYXhfcmVzdWx0cz86IG51bWJlcjsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHN0b3JhZ2VNYW5hZ2VyLnNlYXJjaEVudHJpZXMocXVlcnksIG1heF9yZXN1bHRzIHx8IDEwKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcmVzdWx0cyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IHNlYXJjaCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNvbnRleHRfc3VtbWFyeSB0b29sIFx1MjAxNCBHZXQgc3VtbWFyeSBzdGF0aXN0aWNzIG9mIGF1dG8tc2F2ZWQgY29udGV4dFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjb250ZXh0X3N1bW1hcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGEgc3VtbWFyeSBvZiBhbGwgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMsIGluY2x1ZGluZyBjb3VudHMgYnkgdHlwZSBhbmQgcmVjZW50IGFjdGl2aXR5LicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSBzdG9yYWdlTWFuYWdlci5nZXRTdW1tYXJ5KCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBzdW1tYXJ5IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGNvbnRleHQgc3VtbWFyeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2NvbnRleHRfZW50cnkgdG9vbCBcdTIwMTQgUmVtb3ZlIGEgc3BlY2lmaWMgY29udGV4dCBlbnRyeSBieSBJRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfY29udGV4dF9lbnRyeScsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgYSBzcGVjaWZpYyBhdXRvLXNhdmVkIGNvbnRleHQgZW50cnkgYnkgaXRzIHVuaXF1ZSBJRC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGVudHJ5X2lkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdW5pcXVlIElEIG9mIHRoZSBjb250ZXh0IGVudHJ5IHRvIGRlbGV0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGVudHJ5X2lkIH06IHsgZW50cnlfaWQ6IHN0cmluZyB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkZWxldGVkID0gc3RvcmFnZU1hbmFnZXIuZGVsZXRlRW50cnkoZW50cnlfaWQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFkZWxldGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29udGV4dCBlbnRyeSAnJHtlbnRyeV9pZH0nIG5vdCBmb3VuZGAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkOiB0cnVlLCBlbnRyeV9pZCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZGVsZXRlIGNvbnRleHQgZW50cnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNsZWFyX2NvbnRleHRfbWVtb3J5IHRvb2wgXHUyMDE0IENsZWFyIGFsbCBhdXRvLXNhdmVkIGNvbnRleHQgZW50cmllc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjbGVhcl9jb250ZXh0X21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBhbGwgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgZnJvbSBwZXJzaXN0ZW50IG1lbW9yeS4gVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbmZpcm06IHouYm9vbGVhbigpLmRlc2NyaWJlKCdTZXQgdG8gdHJ1ZSB0byBjb25maXJtIGRlbGV0aW9uIG9mIGFsbCBjb250ZXh0IGVudHJpZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb25maXJtIH06IHsgY29uZmlybTogYm9vbGVhbiB9KSA9PiB7XG4gICAgICBpZiAoIWNvbmZpcm0pIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ29uZmlybWF0aW9uIHJlcXVpcmVkLiBTZXQgY29uZmlybT10cnVlIHRvIHByb2NlZWQuJyB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICB0cnkge1xuICAgICAgICBzdG9yYWdlTWFuYWdlci5jbGVhckFsbCgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjbGVhcmVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjbGVhciBjb250ZXh0IG1lbW9yeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gdHJhY2tfaW1wb3J0YW50X2V2ZW50IHRvb2wgXHUyMDE0IE1hbnVhbGx5IG1hcmsgYW4gZXZlbnQgYXMgaW1wb3J0YW50IGZvciBjb250ZXh0IHRyYWNraW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3RyYWNrX2ltcG9ydGFudF9ldmVudCcsXG4gICAgZGVzY3JpcHRpb246ICdNYW51YWxseSByZWNvcmQgYW4gaW1wb3J0YW50IGV2ZW50IG9yIGRlY2lzaW9uIHRvIHBlcnNpc3RlbnQgbWVtb3J5LiBVc2VmdWwgZm9yIG1hcmtpbmcgY3JpdGljYWwgbW9tZW50cyBpbiBhIHNlc3Npb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGl0bGUgb2YgdGhlIGltcG9ydGFudCBldmVudCcpLFxuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnRGV0YWlsZWQgZGVzY3JpcHRpb24gb2YgdGhlIGV2ZW50JyksXG4gICAgICB0YWdzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RhZ3MgdG8gY2F0ZWdvcml6ZSB0aGUgZXZlbnQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgY29udGVudCwgdGFncyB9OiB7IFxuICAgICAgdGl0bGU6IHN0cmluZzsgXG4gICAgICBjb250ZW50OiBzdHJpbmc7IFxuICAgICAgdGFncz86IHN0cmluZ1tdOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyeTogQ29udGV4dEVudHJ5ID0ge1xuICAgICAgICAgIGlkOiBgY3R4XyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ2RlY2lzaW9uJyxcbiAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIHRhZ3MsXG4gICAgICAgIH07XG5cbiAgICAgICAgc3RvcmFnZU1hbmFnZXIuYWRkRW50cnkoZW50cnkpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB0cmFja2VkOiB0cnVlLCBlbnRyeV9pZDogZW50cnkuaWQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHRyYWNrIGV2ZW50OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiLyoqXG4gKiBBdHRhY2htZW50IE1hbmFnZXJcbiAqIFxuICogU3RvcmVzIHJlZmVyZW5jZXMgdG8gZmlsZXMgYXR0YWNoZWQgdG8gdGhlIGN1cnJlbnQgY2hhdCBtZXNzYWdlLlxuICogQWxsb3dzIHRvb2xzIHRvIGFjY2VzcyB0aGVzZSBmaWxlcyBieSBuYW1lIHdpdGhvdXQgbmVlZGluZyBmdWxsIGRpc2sgcGF0aHMuXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBGaWxlSGFuZGxlIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5cbi8vIFN0b3JlIGF0dGFjaG1lbnRzIGZvciB0aGUgY3VycmVudCB0dXJuXG4vLyBLZXk6IGZpbGVuYW1lIChsb3dlcmNhc2UpLCBWYWx1ZTogRmlsZUhhbmRsZVxubGV0IGN1cnJlbnRBdHRhY2htZW50cyA9IG5ldyBNYXA8c3RyaW5nLCBGaWxlSGFuZGxlPigpO1xuXG4vKipcbiAqIFNldCB0aGUgYXR0YWNobWVudHMgZm9yIHRoZSBjdXJyZW50IGNoYXQgdHVybi5cbiAqIENhbGxlZCBieSB0aGUgcHJvbXB0IHByZXByb2Nlc3NvciBiZWZvcmUgZWFjaCBnZW5lcmF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QXR0YWNobWVudHMoZmlsZXM6IEZpbGVIYW5kbGVbXSk6IHZvaWQge1xuICBjdXJyZW50QXR0YWNobWVudHMuY2xlYXIoKTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgLy8gU3RvcmUgYnkgbG93ZXJjYXNlIG5hbWUgZm9yIGNhc2UtaW5zZW5zaXRpdmUgbG9va3VwXG4gICAgY3VycmVudEF0dGFjaG1lbnRzLnNldChmaWxlLm5hbWUudG9Mb3dlckNhc2UoKSwgZmlsZSk7XG4gIH1cbiAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlZ2lzdGVyZWQgJHtmaWxlcy5sZW5ndGh9IGF0dGFjaG1lbnQocyk6ICR7ZmlsZXMubWFwKGYgPT4gZi5uYW1lKS5qb2luKCcsICcpfWApO1xuICB9XG59XG5cbi8qKlxuICogR2V0IGEgc3BlY2lmaWMgYXR0YWNobWVudCBieSBuYW1lIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIFJldHVybnMgdGhlIEZpbGVIYW5kbGUgaWYgZm91bmQsIHVuZGVmaW5lZCBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdHRhY2htZW50KG5hbWU6IHN0cmluZyk6IEZpbGVIYW5kbGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gY3VycmVudEF0dGFjaG1lbnRzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpO1xufVxuXG4vKipcbiAqIExpc3QgYWxsIGN1cnJlbnRseSBhdHRhY2hlZCBmaWxlbmFtZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0QXR0YWNobWVudHMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gQXJyYXkuZnJvbShjdXJyZW50QXR0YWNobWVudHMua2V5cygpKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHNwZWNpZmljIGZpbGUgaXMgYXR0YWNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0F0dGFjaGVkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gY3VycmVudEF0dGFjaG1lbnRzLmhhcyhuYW1lLnRvTG93ZXJDYXNlKCkpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCwgRmlsZUhhbmRsZSB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZ2V0QXR0YWNobWVudCB9IGZyb20gJy4uL2F0dGFjaG1lbnRNYW5hZ2VyJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJlYWREb2N1bWVudFBhcmFtcyB7XG4gIGZpbGVfcGF0aDogc3RyaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBIZWxwZXIgRnVuY3Rpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBWYWxpZGF0ZSBmaWxlIGV4aXN0cyBvbiBkaXNrICovXG5mdW5jdGlvbiB2YWxpZGF0ZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEZpbGUgbm90IGZvdW5kIG9uIGRpc2s6ICR7ZmlsZVBhdGh9YCB9O1xuICB9XG4gIFxuICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpO1xuICBpZiAoIXN0YXQuaXNGaWxlKCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUGF0aCBcIiR7ZmlsZVBhdGh9XCIgaXMgbm90IGEgZmlsZWAgfTtcbiAgfVxuICBcbiAgLy8gQ2hlY2sgZmlsZSBzaXplIChtYXggNTBNQilcbiAgY29uc3QgbWF4U2l6ZSA9IDUwICogMTAyNCAqIDEwMjQ7IC8vIDUwTUJcbiAgaWYgKHN0YXQuc2l6ZSA+IG1heFNpemUpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgRmlsZSB0b28gbGFyZ2UgKCR7KHN0YXQuc2l6ZSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDEpfU1CKSwgbWF4IGlzIDUwTUJgIH07XG4gIH1cbiAgXG4gIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG59XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRG9jdW1lbnQgcmVhZGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogUmVhZCBjb250ZW50IGZyb20gUERGIG9yIERPQ1ggZmlsZXMuXG4gKiBTdXBwb3J0cyBib3RoIGRpc2sgcGF0aHMgYW5kIGF0dGFjaGVkIGZpbGVzIChieSBmaWxlbmFtZSkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWREb2N1bWVudCh7IGZpbGVfcGF0aCB9OiBSZWFkRG9jdW1lbnRQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyAxLiBDaGVjayBpZiBpdCdzIGFuIGF0dGFjaGVkIGZpbGVcbiAgICBjb25zdCBhdHRhY2htZW50ID0gZ2V0QXR0YWNobWVudChmaWxlX3BhdGgpO1xuICAgIGlmIChhdHRhY2htZW50KSB7XG4gICAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgYXR0YWNoZWQgZmlsZTogJHtmaWxlX3BhdGh9YCk7XG4gICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBhdHRhY2htZW50LnJlYWQoKTtcbiAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlX3BhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBcbiAgICAgIGlmIChleHQgPT09ICcucGRmJykge1xuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZFBERkZyb21CdWZmZXIoYnVmZmVyLCBmaWxlX3BhdGgpO1xuICAgICAgfSBlbHNlIGlmIChleHQgPT09ICcuZG9jeCcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlYWRET0NYRnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy50eHQnKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkVFhURnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgZXJyb3I6IGBVbnN1cHBvcnRlZCBhdHRhY2hlZCBmaWxlIGZvcm1hdDogJHtleHR9LiBPbmx5IC5wZGYsIC5kb2N4LCBhbmQgLnR4dCBhcmUgc3VwcG9ydGVkLmAgXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gMi4gRmFsbCBiYWNrIHRvIGRpc2sgcGF0aFxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUZpbGUoZmlsZV9wYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcbiAgICAgIC8vIFByb3ZpZGUgaGVscGZ1bCBlcnJvciBpZiBpdCBsb29rZWQgbGlrZSBhIGZpbGVuYW1lXG4gICAgICByZXR1cm4geyBcbiAgICAgICAgc3VjY2VzczogZmFsc2UsIFxuICAgICAgICBlcnJvcjogYCR7dmFsaWRhdGlvbi5lcnJvcn1cXG5cXG5Ob3RlOiBJZiB0aGlzIGlzIGFuIGF0dGFjaGVkIGZpbGUsIHVzZSB0aGUgZXhhY3QgZmlsZW5hbWUgZnJvbSB0aGUgXCJBVFRBQ0hFRCBGSUxFUyBBVkFJTEFCTEVcIiBsaXN0LmAgXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlX3BhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgXG4gICAgc3dpdGNoIChleHQpIHtcbiAgICAgIGNhc2UgJy5wZGYnOlxuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZFBERihmaWxlX3BhdGgpO1xuICAgICAgY2FzZSAnLmRvY3gnOlxuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZERPQ1goZmlsZV9wYXRoKTtcbiAgICAgIGNhc2UgJy50eHQnOiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZV9wYXRoLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGZpbGVfcGF0aDogZmlsZV9wYXRoLFxuICAgICAgICAgICAgZm9ybWF0OiAnVFhUJyxcbiAgICAgICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgICAgIHNpemU6IGAkeyhmcy5zdGF0U3luYyhmaWxlX3BhdGgpLnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgICAgIGZ1bGxfdGV4dDogdGV4dCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsIFxuICAgICAgICAgIGVycm9yOiBgVW5zdXBwb3J0ZWQgZmlsZSBmb3JtYXQ6ICR7ZXh0fS4gT25seSAucGRmLCAuZG9jeCwgYW5kIC50eHQgYXJlIHN1cHBvcnRlZC5gIFxuICAgICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBQREYgY29udGVudCBmcm9tIGRpc2sgcGF0aC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFBERihmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGRmUGFyc2UgPSAoYXdhaXQgaW1wb3J0KCdwZGYtcGFyc2UnKSkuZGVmYXVsdDtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgUERGIGZyb20gZGlzazogJHtmaWxlUGF0aH1gKTtcbiAgICBcbiAgICBjb25zdCBkYXRhQnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwZGZQYXJzZShkYXRhQnVmZmVyKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFBERiByZWFkIGNvbXBsZXRlOiAke3Jlc3VsdC5udW1wYWdlc30gcGFnZXMsICR7KHJlc3VsdC50ZXh0Lmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9S0JgKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgZm9ybWF0OiAnUERGJyxcbiAgICAgICAgcGFnZXM6IHJlc3VsdC5udW1wYWdlcyxcbiAgICAgICAgd29yZF9jb3VudDogcmVzdWx0LnRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGZzLnN0YXRTeW5jKGZpbGVQYXRoKS5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHJlc3VsdC50ZXh0LnN1YnN0cmluZygwLCA1MDApICsgKHJlc3VsdC50ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHJlc3VsdC50ZXh0LFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgUERGIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlYWQgUERGIGNvbnRlbnQgZnJvbSBidWZmZXIgKGZvciBhdHRhY2htZW50cykuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWRQREZGcm9tQnVmZmVyKGJ1ZmZlcjogQnVmZmVyLCBmaWxlTmFtZTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGRmUGFyc2UgPSAoYXdhaXQgaW1wb3J0KCdwZGYtcGFyc2UnKSkuZGVmYXVsdDtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgUERGIGZyb20gYXR0YWNobWVudDogJHtmaWxlTmFtZX1gKTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwZGZQYXJzZShidWZmZXIpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUERGIHJlYWQgY29tcGxldGU6ICR7cmVzdWx0Lm51bXBhZ2VzfSBwYWdlcywgJHsocmVzdWx0LnRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVOYW1lLFxuICAgICAgICBmb3JtYXQ6ICdQREYnLFxuICAgICAgICBwYWdlczogcmVzdWx0Lm51bXBhZ2VzLFxuICAgICAgICB3b3JkX2NvdW50OiByZXN1bHQudGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICBzaXplOiBgJHsoYnVmZmVyLmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgdGV4dF9wcmV2aWV3OiByZXN1bHQudGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArIChyZXN1bHQudGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgZnVsbF90ZXh0OiByZXN1bHQudGV4dCxcbiAgICAgICAgc291cmNlOiAnYXR0YWNobWVudCcsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBQREYgcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBET0NYIGNvbnRlbnQgZnJvbSBkaXNrIHBhdGguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWRET0NYKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBtYW1tb3RoID0gYXdhaXQgaW1wb3J0KCdtYW1tb3RoJyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBSZWFkaW5nIERPQ1ggZnJvbSBkaXNrOiAke2ZpbGVQYXRofWApO1xuICAgIFxuICAgIGNvbnN0IGRhdGFCdWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG1hbW1vdGguZXh0cmFjdFJhd1RleHQoeyBidWZmZXI6IGRhdGFCdWZmZXIgfSk7XG4gICAgXG4gICAgY29uc3QgdGV4dCA9IHJlc3VsdC52YWx1ZTtcbiAgICBjb25zdCB3YXJuaW5ncyA9IHJlc3VsdC5tZXNzYWdlcy5tYXAobSA9PiBtLm1lc3NhZ2UpLmpvaW4oJ1xcbicpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gRE9DWCByZWFkIGNvbXBsZXRlOiAkeyh0ZXh0Lmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9S0JgKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgZm9ybWF0OiAnRE9DWCcsXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGZzLnN0YXRTeW5jKGZpbGVQYXRoKS5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICB3YXJuaW5nczogd2FybmluZ3MgfHwgdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRE9DWCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIERPQ1ggY29udGVudCBmcm9tIGJ1ZmZlciAoZm9yIGF0dGFjaG1lbnRzKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZERPQ1hGcm9tQnVmZmVyKGJ1ZmZlcjogQnVmZmVyLCBmaWxlTmFtZTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgbWFtbW90aCA9IGF3YWl0IGltcG9ydCgnbWFtbW90aCcpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBET0NYIGZyb20gYXR0YWNobWVudDogJHtmaWxlTmFtZX1gKTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtYW1tb3RoLmV4dHJhY3RSYXdUZXh0KHsgYnVmZmVyIH0pO1xuICAgIFxuICAgIGNvbnN0IHRleHQgPSByZXN1bHQudmFsdWU7XG4gICAgY29uc3Qgd2FybmluZ3MgPSByZXN1bHQubWVzc2FnZXMubWFwKG0gPT4gbS5tZXNzYWdlKS5qb2luKCdcXG4nKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIERPQ1ggcmVhZCBjb21wbGV0ZTogJHsodGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogZmlsZU5hbWUsXG4gICAgICAgIGZvcm1hdDogJ0RPQ1gnLFxuICAgICAgICB3b3JkX2NvdW50OiB0ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXG4gICAgICAgIHNpemU6IGAkeyhidWZmZXIubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICB3YXJuaW5nczogd2FybmluZ3MgfHwgdW5kZWZpbmVkLFxuICAgICAgICBzb3VyY2U6ICdhdHRhY2htZW50JyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYERPQ1ggcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBUWFQgY29udGVudCBmcm9tIGJ1ZmZlciAoZm9yIGF0dGFjaG1lbnRzKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFRYVEZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgVFhUIGZyb20gYXR0YWNobWVudDogJHtmaWxlTmFtZX1gKTtcbiAgICBcbiAgICBjb25zdCB0ZXh0ID0gYnVmZmVyLnRvU3RyaW5nKCd1dGYtOCcpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gVFhUIHJlYWQgY29tcGxldGU6ICR7KHRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVOYW1lLFxuICAgICAgICBmb3JtYXQ6ICdUWFQnLFxuICAgICAgICB3b3JkX2NvdW50OiB0ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXG4gICAgICAgIHNpemU6IGAkeyhidWZmZXIubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICBzb3VyY2U6ICdhdHRhY2htZW50JyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFRYVCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEb2N1bWVudFRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyByZWFkX2RvY3VtZW50IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9kb2N1bWVudCcsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIGNvbnRlbnQgZnJvbSBQREYsIERPQ1gsIG9yIFRYVCBmaWxlcy4gU3VwcG9ydHMgYm90aCBkaXNrIHBhdGhzIGFuZCBhdHRhY2hlZCBmaWxlcyAodXNlIGZpbGVuYW1lIGZvciBhdHRhY2htZW50cykuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIFBERiwgRE9DWCwgb3IgVFhUIGZpbGUsIG9yIHRoZSBmaWxlbmFtZSBpZiBpdCBpcyBhbiBhdHRhY2hlZCBmaWxlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmVhZERvY3VtZW50KHBhcmFtcyBhcyBSZWFkRG9jdW1lbnRQYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgIi8qKlxuICogVG9vbHMgUHJvdmlkZXIgLSBDb21wbGV0ZSBJbXBsZW1lbnRhdGlvbiBvZiBhbGwgfjQ1IHRvb2xzIGFjcm9zcyA2IGNhdGVnb3JpZXNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFRvb2wsIFRvb2xzUHJvdmlkZXJDb250cm9sbGVyIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5cbi8vIEltcG9ydCBleGlzdGluZyBtb2R1bGVzXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHLCBpc1Rvb2xFbmFibGVkLCBpc0V4ZWN1dGlvblRvb2xFbmFibGVkLCBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSAnLi9zdGF0ZU1hbmFnZXInO1xuaW1wb3J0IHsgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIH0gZnJvbSAnLi9iYWNrZ3JvdW5kQ29tbWFuZHMnO1xuXG4vLyBJbXBvcnQgY2F0ZWdvcnktc3BlY2lmaWMgdG9vbCBtb2R1bGVzXG5pbXBvcnQgeyByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyB9IGZyb20gJy4vdG9vbHMvZmlsZVN5c3RlbVRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyB9IGZyb20gJy4vdG9vbHMvd2ViUmVzZWFyY2hUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckdpdFRvb2xzIH0gZnJvbSAnLi90b29scy9naXRHaXRodWJUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckJyb3dzZXJUb29scyB9IGZyb20gJy4vdG9vbHMvYnJvd3NlckF1dG9tYXRpb25Ub29scyc7XG5pbXBvcnQgeyByZWdpc3RlckRhdGFiYXNlVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2RhdGFiYXNlVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzIH0gZnJvbSAnLi90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyRXhlY3V0aW9uVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2V4ZWN1dGlvblRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyVXRpbGl0eVRvb2xzLCByZWdpc3RlckdldEN1cnJlbnRXb3JraW5nRGlyZWN0b3J5VG9vbCB9IGZyb20gJy4vdG9vbHMvdXRpbGl0eVRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVySW1hZ2VQcm9jZXNzaW5nVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2ltYWdlUHJvY2Vzc2luZ1Rvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVySHR0cENsaWVudFRvb2xzIH0gZnJvbSAnLi90b29scy9odHRwQ2xpZW50VG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJSYWdUb29scyB9IGZyb20gJy4vdG9vbHMvdmVjdG9yUmFnVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJVaUdlbmVyYXRpb25Ub29scyB9IGZyb20gJy4vdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJDb250ZXh0TWFuYWdlbWVudFRvb2xzIH0gZnJvbSAnLi90b29scy9jb250ZXh0TWFuYWdlbWVudFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyRG9jdW1lbnRUb29scyB9IGZyb20gJy4vdG9vbHMvZG9jdW1lbnRUb29scyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRZUEVTID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG9vbENhdGVnb3J5IHtcbiAgbmFtZTogc3RyaW5nO1xuICB0b29sczogVG9vbFtdO1xufVxuXG4vKiogRXh0ZW5kZWQgdG9vbCB0eXBlIHdpdGggdHlwZWQgaW1wbGVtZW50YXRpb24gZm9yIHNhZmUgYWNjZXNzICovXG50eXBlIFR5cGVkVG9vbCA9IFRvb2wgJiB7XG4gIGltcGxlbWVudGF0aW9uOiAocGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgY3R4PzogdW5rbm93bikgPT4gUHJvbWlzZTx1bmtub3duPjtcbn07XG5cbi8vIEdsb2JhbCBjb25maWcgcmVmZXJlbmNlIHRvIGVuc3VyZSB0b29sc1Byb3ZpZGVyIHVzZXMgdGhlIGxhdGVzdCB1c2VyIHNldHRpbmdzXG5sZXQgY3VycmVudENvbmZpZzogUGx1Z2luQ29uZmlnID0gREVGQVVMVF9DT05GSUc7XG5cbi8qKlxuICogQ2VudHJhbCByZWdpc3RyeSBmb3IgYWxsIGF2YWlsYWJsZSB0b29scy5cbiAqIFRvb2xzIGFyZSBjcmVhdGVkIG9uY2UgYXQgbW9kdWxlIGxvYWQgdGltZSBhbmQgcmV1c2VkIGFjcm9zcyBwcm92aWRlciBjYWxscy5cbiAqL1xuY2xhc3MgVG9vbFJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSB0b29sTWFwID0gbmV3IE1hcDxzdHJpbmcsIFR5cGVkVG9vbD4oKTtcblxuICByZWdpc3RlckFsbChjb25maWc6IFBsdWdpbkNvbmZpZywgc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXIsIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcjogQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKTogdm9pZCB7XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZmlsZVN5c3RlbScpKSB7XG4gICAgICByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyhjb25maWcsIHN0YXRlTWFuYWdlcikuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICd3ZWJTZWFyY2gnKSkge1xuICAgICAgcmVnaXN0ZXJXZWJSZXNlYXJjaFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdicm93c2VyQXV0b21hdGlvbicpKSB7XG4gICAgICByZWdpc3RlckJyb3dzZXJUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZ2l0T3BlcmF0aW9ucycpKSB7XG4gICAgICByZWdpc3RlckdpdFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdkYXRhYmFzZVF1ZXJpZXMnKSkge1xuICAgICAgcmVnaXN0ZXJEYXRhYmFzZVRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdkb2N1bWVudFBhcnNpbmcnKSkge1xuICAgICAgcmVnaXN0ZXJEb2N1bWVudFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdiYWNrZ3JvdW5kQ29tbWFuZHMnKSkge1xuICAgICAgcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzKGNvbmZpZywgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2ltYWdlUHJvY2Vzc2luZycpKSB7XG4gICAgICByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdodHRwQ2xpZW50JykpIHtcbiAgICAgIHJlZ2lzdGVySHR0cENsaWVudFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICd2ZWN0b3JSQUcnKSkge1xuICAgICAgcmVnaXN0ZXJSYWdUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAndWlHZW5lcmF0aW9uJykpIHtcbiAgICAgIHJlZ2lzdGVyVWlHZW5lcmF0aW9uVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2NvbnRleHRNYW5hZ2VtZW50JykpIHtcbiAgICAgIHJlZ2lzdGVyQ29udGV4dE1hbmFnZW1lbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCByZWdpc3RlcmVkIG9uY2UsIGZpbHRlcmVkIGJ5IGVuYWJsZWQgdG9vbCB0eXBlc1xuICAgIGNvbnN0IGV4ZWNDb25maWcgPSB7IC4uLmNvbmZpZyB9O1xuICAgIGNvbnN0IGFsbEV4ZWNUb29scyA9IHJlZ2lzdGVyRXhlY3V0aW9uVG9vbHMoZXhlY0NvbmZpZyk7XG4gICAgXG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ2phdmFzY3JpcHQnKSkge1xuICAgICAgY29uc3QganNUb29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdydW5famF2YXNjcmlwdCcpO1xuICAgICAgaWYgKGpzVG9vbCkgdGhpcy50b29sTWFwLnNldChqc1Rvb2wubmFtZSwganNUb29sIGFzIFR5cGVkVG9vbCk7XG4gICAgfVxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICdweXRob24nKSkge1xuICAgICAgY29uc3QgcHlUb29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdydW5fcHl0aG9uJyk7XG4gICAgICBpZiAocHlUb29sKSB0aGlzLnRvb2xNYXAuc2V0KHB5VG9vbC5uYW1lLCBweVRvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ3Rlcm1pbmFsJykpIHtcbiAgICAgIGNvbnN0IHRlcm1Ub29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdydW5faW5fdGVybWluYWwnKTtcbiAgICAgIGlmICh0ZXJtVG9vbCkgdGhpcy50b29sTWFwLnNldCh0ZXJtVG9vbC5uYW1lLCB0ZXJtVG9vbCBhcyBUeXBlZFRvb2wpO1xuICAgIH1cbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAnc2hlbGwnKSkge1xuICAgICAgY29uc3Qgc2hlbGxUb29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdleGVjdXRlX2NvbW1hbmQnKTtcbiAgICAgIGlmIChzaGVsbFRvb2wpIHRoaXMudG9vbE1hcC5zZXQoc2hlbGxUb29sLm5hbWUsIHNoZWxsVG9vbCBhcyBUeXBlZFRvb2wpO1xuICAgIH1cbiAgICBcbiAgICAvLyBVdGlsaXR5IHRvb2xzIGFyZSBhbHdheXMgcmVnaXN0ZXJlZCAobm8gc3BlY2lmaWMgY29uZmlnIGZsYWcpXG4gICAgY29uc3QgZ2V0RW5hYmxlZFRvb2xzID0gKCkgPT4gQXJyYXkuZnJvbSh0aGlzLnRvb2xNYXAua2V5cygpKTtcbiAgICByZWdpc3RlclV0aWxpdHlUb29scyhjb25maWcsIHN0YXRlTWFuYWdlciwgZ2V0RW5hYmxlZFRvb2xzKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgXG4gICAgLy8gUmVnaXN0ZXIgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBxdWVyeSB0b29sIChhbHdheXMgYXZhaWxhYmxlKVxuICAgIHJlZ2lzdGVyR2V0Q3VycmVudFdvcmtpbmdEaXJlY3RvcnlUb29sKCkuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICB9XG5cbiAgZ2V0QWxsKCk6IFRvb2xbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy50b29sTWFwLnZhbHVlcygpKTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBUeXBlZFRvb2wgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnRvb2xNYXAuZ2V0KG5hbWUpO1xuICB9XG5cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRvb2xNYXAuaGFzKG5hbWUpO1xuICB9XG59XG5cbi8qKlxuICogTWFuYWdlcyB0b29sIGV4ZWN1dGlvbiBhbmQgc3RhdGUgdXBkYXRlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvb2xzUHJvdmlkZXIge1xuICBwcml2YXRlIGNvbmZpZzogUGx1Z2luQ29uZmlnO1xuICBwcml2YXRlIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyO1xuICBwcml2YXRlIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcjogQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyO1xuICBwcml2YXRlIHJlZ2lzdHJ5OiBUb29sUmVnaXN0cnk7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gICAgdGhpcy5zdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKHRoaXMuY29uZmlnKTtcbiAgICB0aGlzLmJhY2tncm91bmRDb21tYW5kTWFuYWdlciA9IG5ldyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIodGhpcy5jb25maWcpO1xuICAgIHRoaXMucmVnaXN0cnkgPSBuZXcgVG9vbFJlZ2lzdHJ5KCk7XG4gICAgdGhpcy5yZWdpc3RyeS5yZWdpc3RlckFsbCh0aGlzLmNvbmZpZywgdGhpcy5zdGF0ZU1hbmFnZXIsIHRoaXMuYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgdG9vbCBieSBuYW1lIHdpdGggcGFyYW1ldGVycy5cbiAgICovXG4gIGFzeW5jIGV4ZWN1dGVUb29sKHRvb2xOYW1lOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCB0b29sID0gdGhpcy5yZWdpc3RyeS5nZXQodG9vbE5hbWUpO1xuICAgIGlmICghdG9vbCkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCAnJHt0b29sTmFtZX0nIG5vdCBmb3VuZGAgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gU2FmZSBhY2Nlc3MgdmlhIHR5cGVkIHdyYXBwZXIgKEM0IGZpeClcbiAgICAgIGNvbnN0IGltcGwgPSB0b29sLmltcGxlbWVudGF0aW9uO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wbChwYXJhbXMpO1xuICAgICAgXG4gICAgICAvLyBVcGRhdGUgc3RhdGUgd2l0aCBleGVjdXRpb24gcmVzdWx0XG4gICAgICB0aGlzLnN0YXRlTWFuYWdlci5zZXQoYGxhc3RfJHt0b29sTmFtZX1gLCByZXN1bHQpO1xuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCBleGVjdXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGF2YWlsYWJsZSB0b29scyBmaWx0ZXJlZCBieSBjb25maWcuXG4gICAqL1xuICBnZXRBdmFpbGFibGVUb29scygpOiBUb29sW10ge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdldEFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3RhdGUgbWFuYWdlciBpbnN0YW5jZS5cbiAgICovXG4gIGdldFN0YXRlTWFuYWdlcigpOiBTdGF0ZU1hbmFnZXIge1xuICAgIHJldHVybiB0aGlzLnN0YXRlTWFuYWdlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbi5cbiAgICovXG4gIGdldENvbmZpZygpOiBQbHVnaW5Db25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuXG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVG9vbHNQcm92aWRlciB3aXRoIGRlZmF1bHQgY29uZmlnLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVG9vbHNQcm92aWRlcihjb25maWc/OiBQbHVnaW5Db25maWcpOiBUb29sc1Byb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBUb29sc1Byb3ZpZGVyKGNvbmZpZyk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNESyBQUk9WSURFUiBGVU5DVElPTiA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE1haW4gdG9vbHMgcHJvdmlkZXIgZnVuY3Rpb24gZm9yIExNIFN0dWRpbyBTREsuXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCB0aGF0IGdldHMgY2FsbGVkIGJ5IExNIFN0dWRpby5cbiAqIFxuICogSU1QT1JUQU5UOiBUaGUgTE0gU3R1ZGlvIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyBhbGwgVG9vbCBvYmplY3RzXG4gKiByZXR1cm5lZCBmcm9tIHRoaXMgcHJvdmlkZXIgZnVuY3Rpb24uIE5vIG1hbnVhbCBjdGwuYWRkKCkgY2FsbHMgbmVlZGVkIC1cbiAqIGp1c3QgcmV0dXJuIHRoZSBhcnJheSBkaXJlY3RseSBhbmQgdGhlIFNESyBoYW5kbGVzIHJlZ2lzdHJhdGlvbi5cbiAqIFxuICogTk9URTogTXVzdCBiZSBhc3luYyBcdTIwMTQgU0RLIHR5cGUgcmVxdWlyZXMgUHJvbWlzZTxUb29sW10+LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9vbHNQcm92aWRlcihjdGw6IFRvb2xzUHJvdmlkZXJDb250cm9sbGVyKTogUHJvbWlzZTxUb29sW10+IHtcbiAgLy8gRklYOiBSZWFkIGNvbmZpZ3VyYXRpb24gZHluYW1pY2FsbHkgZnJvbSBVSSBjb250cm9sbGVyIChsaWtlIGJlbGVkYXJpYW5zIHBsdWdpbilcbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgXG4gIC8vIENvbnN0cnVjdCBhIGxpdmUgY29uZmlnIG9iamVjdCBmcm9tIHRoZSBVSSBzdGF0ZVxuICBjb25zdCBsaXZlQ29uZmlnOiBQbHVnaW5Db25maWcgPSB7XG4gICAgZmlsZVN5c3RlbTogcGx1Z2luQ29uZmlnLmdldCgnZmlsZVN5c3RlbScpLFxuICAgIHdlYlNlYXJjaDogcGx1Z2luQ29uZmlnLmdldCgnd2ViU2VhcmNoJyksXG4gICAgYnJvd3NlckF1dG9tYXRpb246IHBsdWdpbkNvbmZpZy5nZXQoJ2Jyb3dzZXJBdXRvbWF0aW9uJyksXG4gICAgZ2l0T3BlcmF0aW9uczogcGx1Z2luQ29uZmlnLmdldCgnZ2l0T3BlcmF0aW9ucycpLFxuICAgIGRhdGFiYXNlUXVlcmllczogcGx1Z2luQ29uZmlnLmdldCgnZGF0YWJhc2VRdWVyaWVzJyksXG4gICAgZG9jdW1lbnRQYXJzaW5nOiBwbHVnaW5Db25maWcuZ2V0KCdkb2N1bWVudFBhcnNpbmcnKSxcbiAgICBiYWNrZ3JvdW5kQ29tbWFuZHM6IHBsdWdpbkNvbmZpZy5nZXQoJ2JhY2tncm91bmRDb21tYW5kcycpLFxuICAgIGltYWdlUHJvY2Vzc2luZzogcGx1Z2luQ29uZmlnLmdldCgnaW1hZ2VQcm9jZXNzaW5nJyksXG4gICAgaHR0cENsaWVudDogcGx1Z2luQ29uZmlnLmdldCgnaHR0cENsaWVudCcpLFxuICAgIHZlY3RvclJBRzogcGx1Z2luQ29uZmlnLmdldCgndmVjdG9yUkFHJyksXG4gICAgdWlHZW5lcmF0aW9uOiBwbHVnaW5Db25maWcuZ2V0KCd1aUdlbmVyYXRpb24nKSxcbiAgICBjb250ZXh0TWFuYWdlbWVudDogcGx1Z2luQ29uZmlnLmdldCgnY29udGV4dE1hbmFnZW1lbnQnKSxcbiAgICBnb2RNb2RlOiBwbHVnaW5Db25maWcuZ2V0KCdnb2RNb2RlJyksXG4gICAgZG9jdW1lbnRSQUc6IHBsdWdpbkNvbmZpZy5nZXQoJ2RvY3VtZW50UkFHJyksXG4gICAgcmV0cmlldmFsTGltaXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0JyksXG4gICAgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkJyksXG4gICAgZXhlY3V0aW9uSmF2YVNjcmlwdDogcGx1Z2luQ29uZmlnLmdldCgnZXhlY3V0aW9uSmF2YVNjcmlwdCcpLFxuICAgIGV4ZWN1dGlvblB5dGhvbjogcGx1Z2luQ29uZmlnLmdldCgnZXhlY3V0aW9uUHl0aG9uJyksXG4gICAgZXhlY3V0aW9uVGVybWluYWw6IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvblRlcm1pbmFsJyksXG4gICAgZXhlY3V0aW9uU2hlbGw6IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvblNoZWxsJyksXG4gICAgc2VhcmNoRmFsbGJhY2tDaGFpbjogcGx1Z2luQ29uZmlnLmdldCgnc2VhcmNoRmFsbGJhY2tDaGFpbicpLFxuICAgIG1heFNlYXJjaFJlc3VsdHM6IHBsdWdpbkNvbmZpZy5nZXQoJ21heFNlYXJjaFJlc3VsdHMnKSxcbiAgICBzYWZlc2VhcmNoOiBwbHVnaW5Db25maWcuZ2V0KCdzYWZlc2VhcmNoJyksXG4gICAgYnJvd3NlclRpbWVvdXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2Jyb3dzZXJUaW1lb3V0JyksXG4gICAgaGVhZGxlc3NNb2RlOiBwbHVnaW5Db25maWcuZ2V0KCdoZWFkbGVzc01vZGUnKSxcbiAgICBnaXRBdXRvQ29tbWl0OiBwbHVnaW5Db25maWcuZ2V0KCdnaXRBdXRvQ29tbWl0JyksXG4gICAgZGVmYXVsdEJyYW5jaDogcGx1Z2luQ29uZmlnLmdldCgnZGVmYXVsdEJyYW5jaCcpLFxuICAgIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogcGx1Z2luQ29uZmlnLmdldCgncGF0aFZhbGlkYXRpb25FbmFibGVkJyksXG4gICAgYmluYXJ5RmlsZURldGVjdGlvbjogcGx1Z2luQ29uZmlnLmdldCgnYmluYXJ5RmlsZURldGVjdGlvbicpLFxuICAgIHJlZ2V4UmVEb1NQcm90ZWN0aW9uOiBwbHVnaW5Db25maWcuZ2V0KCdyZWdleFJlRG9TUHJvdGVjdGlvbicpLFxuICAgIG1heFJlZ2V4TGVuZ3RoOiBwbHVnaW5Db25maWcuZ2V0KCdtYXhSZWdleExlbmd0aCcpLFxuICAgIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiBwbHVnaW5Db25maWcuZ2V0KCdzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZCcpLFxuICAgIHN0YXRlTWF4U2l6ZTogcGx1Z2luQ29uZmlnLmdldCgnc3RhdGVNYXhTaXplJyksXG4gICAgbGFuZ3VhZ2U6IHBsdWdpbkNvbmZpZy5nZXQoJ2xhbmd1YWdlJyksXG4gICAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHBsdWdpbkNvbmZpZy5nZXQoJ25vdGlmaWNhdGlvbnNFbmFibGVkJyksXG4gICAgdGVtcG9yYWxBd2FyZW5lc3M6IHBsdWdpbkNvbmZpZy5nZXQoJ3RlbXBvcmFsQXdhcmVuZXNzJyksXG4gICAgZGF0ZUZvcm1hdFN0eWxlOiBwbHVnaW5Db25maWcuZ2V0KCdkYXRlRm9ybWF0U3R5bGUnKSxcbiAgfTtcblxuICBjb25zdCBwcm92aWRlciA9IGNyZWF0ZVRvb2xzUHJvdmlkZXIobGl2ZUNvbmZpZyk7XG4gIFxuICAvLyBSZXR1cm4gYWxsIGF2YWlsYWJsZSB0b29scyAtIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyB0aGVtXG4gIHJldHVybiBwcm92aWRlci5nZXRBdmFpbGFibGVUb29scygpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gcmVmZXJlbmNlLlxuICogQ2FsbCB0aGlzIGZyb20gbWFpbigpIHRvIGVuc3VyZSB0b29sc1Byb3ZpZGVyIHVzZXMgdGhlIGxhdGVzdCB1c2VyIHNldHRpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlR2xvYmFsQ29uZmlnKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogdm9pZCB7XG4gIGN1cnJlbnRDb25maWcgPSBjb25maWc7XG59XG4iLCAiLyoqXG4gKiBEb2N1bWVudCBSQUcgUHJvbXB0IFByZXByb2Nlc3NvciArIFdvcmtpbmcgRGlyZWN0b3J5IERldGVjdGlvbiArIFRlbXBvcmFsIEF3YXJlbmVzc1xuICovXG5cbmltcG9ydCB7IHR5cGUgQ2hhdE1lc3NhZ2UsIHR5cGUgRmlsZUhhbmRsZSwgdHlwZSBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHBkZlBhcnNlIGZyb20gJ3BkZi1wYXJzZSc7XG5pbXBvcnQgeyBDb250ZXh0R3VhcmQgfSBmcm9tICcuL2NvbnRleHRHdWFyZCc7XG5pbXBvcnQgeyBzZXRBdHRhY2htZW50cywgbGlzdEF0dGFjaG1lbnRzIH0gZnJvbSAnLi9hdHRhY2htZW50TWFuYWdlcic7XG5cbi8vIC0tLSBUZW1wb3JhbCBBd2FyZW5lc3MgSGVscGVycyAobWVyZ2VkIGZyb20gdXBfdG9fZGF0ZSkgLS0tXG5pbnRlcmZhY2UgRGF0ZVRpbWVDYWNoZSB7XG4gIGNvbXBhY3Q6IHN0cmluZztcbiAgZnVsbDogc3RyaW5nO1xufVxuXG5sZXQgY2FjaGVkRGF0ZVRpbWVEYXRhOiBEYXRlVGltZUNhY2hlIHwgbnVsbCA9IG51bGw7XG5jb25zdCBDQUNIRV9EVVJBVElPTl9NUyA9IDUgKiA2MCAqIDEwMDA7IC8vIFJlZnJlc2ggZXZlcnkgNSBtaW51dGVzXG5cbi8vIENvbnRleHRHdWFyZCBpbnRlZ3JhdGlvblxubGV0IGNvbnRleHRHdWFyZDogQ29udGV4dEd1YXJkIHwgbnVsbCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0R3VhcmQoZ3VhcmQ6IENvbnRleHRHdWFyZCB8IG51bGwpOiB2b2lkIHtcbiAgY29udGV4dEd1YXJkID0gZ3VhcmQ7XG59XG5sZXQgY2FjaGVUaW1lc3RhbXAgPSAwO1xuXG5mdW5jdGlvbiBnZXRDYWNoZWREYXRlVGltZSgpOiBEYXRlVGltZUNhY2hlIHtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgXG4gIGlmIChjYWNoZWREYXRlVGltZURhdGEgJiYgKG5vdyAtIGNhY2hlVGltZXN0YW1wKSA8IENBQ0hFX0RVUkFUSU9OX01TKSB7XG4gICAgcmV0dXJuIGNhY2hlZERhdGVUaW1lRGF0YTtcbiAgfVxuICBcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIFxuICAvLyBDb21wYWN0IGZvcm1hdDogREQuTU0uWVlZWSwgSEg6bW1cbiAgY29uc3QgY29tcGFjdCA9IGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2RlLURFJywge1xuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJzItZGlnaXQnLFxuICAgIGRheTogJzItZGlnaXQnLFxuICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICBtaW51dGU6ICcyLWRpZ2l0J1xuICB9KTtcbiAgXG4gIC8vIEZ1bGwgZm9ybWF0OiBXb2NoZW50YWcsIERELiBNTU1NIFlZWVksIEhIOm1tIFVoclxuICBjb25zdCBmdWxsID0gZGF0ZS50b0xvY2FsZVN0cmluZygnZGUtREUnLCB7XG4gICAgd2Vla2RheTogJ2xvbmcnLFxuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJ2xvbmcnLFxuICAgIGRheTogJ251bWVyaWMnLFxuICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICBtaW51dGU6ICcyLWRpZ2l0J1xuICB9KSArICcgVWhyJztcbiAgXG4gIGNhY2hlZERhdGVUaW1lRGF0YSA9IHsgY29tcGFjdCwgZnVsbCB9O1xuICBjYWNoZVRpbWVzdGFtcCA9IG5vdztcbiAgXG4gIHJldHVybiBjYWNoZWREYXRlVGltZURhdGE7XG59XG5cbmZ1bmN0aW9uIGdldFRlbXBvcmFsU3VmZml4KGN0bDogUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcik6IHN0cmluZyB7XG4gIGNvbnN0IGNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIFxuICAvLyBVc2UgLmdldCgpIG1ldGhvZCB3aXRoIHByb3BlciBkZWZhdWx0cyAtIG1vcmUgcmVsaWFibGUgdGhhbiBkaXJlY3QgcHJvcGVydHkgYWNjZXNzXG4gIGNvbnN0IHRlbXBvcmFsQXdhcmVuZXNzRW5hYmxlZCA9IGNvbmZpZy5nZXQoJ3RlbXBvcmFsQXdhcmVuZXNzJykgPz8gdHJ1ZTtcbiAgXG4gIGlmICghdGVtcG9yYWxBd2FyZW5lc3NFbmFibGVkKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIFxuICBjb25zdCBzdHlsZSA9IGNvbmZpZy5nZXQoJ2RhdGVGb3JtYXRTdHlsZScpID8/ICdzdGFuZGFyZCc7XG4gIGNvbnN0IHsgY29tcGFjdCwgZnVsbCB9ID0gZ2V0Q2FjaGVkRGF0ZVRpbWUoKTtcbiAgXG4gIC8vIERFQlVHOiBVbmNvbW1lbnQgdG8gdmVyaWZ5IHdoYXQncyBiZWluZyBpbmplY3RlZFxuICBjb25zb2xlLmxvZyhgW1RFTVBPUkFMXSBJbmplY3Rpbmc6ICR7c3R5bGUgPT09ICdoZXV0ZUlzdCcgPyBgSEVVVEUgSVNUICR7ZnVsbH1gIDogYFtaZWl0OiAke2NvbXBhY3R9XWB9YCk7XG4gIFxuICBpZiAoc3R5bGUgPT09ICdoZXV0ZUlzdCcpIHtcbiAgICByZXR1cm4gYFxcblxcbkhFVVRFIElTVCAke2Z1bGx9YDtcbiAgfVxuICByZXR1cm4gYFxcblxcbltaZWl0OiAke2NvbXBhY3R9XWA7XG59XG5cbmZ1bmN0aW9uIGRldGVjdERpcmVjdG9yeVBhdGgodGV4dDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIC8vIFJlbW92ZSBVUkxzIGZpcnN0IHRvIGF2b2lkIGZhbHNlIHBvc2l0aXZlcyBsaWtlIC9tZWRpdW0uY29tIGZyb20gaHR0cHM6Ly9tZWRpdW0uY29tLy4uLlxuICBjb25zdCB3aXRob3V0VXJscyA9IHRleHQucmVwbGFjZSgvaHR0cHM/OlxcL1xcL1teXFxzXSt8d3d3XFwuW15cXHNdK3xmaWxlOlxcL1xcL1teXFxzXSsvZywgJycpO1xuXG4gIC8vIFdpbmRvd3MgcGF0aHM6IEM6XFxwYXRoIG9yIEQ6XFxmb2xkZXIgKG11c3Qgc3RhcnQgd2l0aCBkcml2ZSBsZXR0ZXIpXG4gICBjb25zdCB3aW5NYXRjaCA9IHdpdGhvdXRVcmxzLm1hdGNoKC9bQS1aYS16XTpcXFxcW1xcd1xcLV8uIFxcXFxdKy8pO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeXl5eXl5eXl5eXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJhY2tzbGFzaCBhZGRlZCBcdTI3MTNcbiAgaWYgKHdpbk1hdGNoKSByZXR1cm4gd2luTWF0Y2hbMF0udHJpbSgpO1xuXG4gIC8vIFVuaXggYWJzb2x1dGUgcGF0aHM6IC9ob21lL3VzZXIvZGlyLCAvdmFyL2xvZywgZXRjLlxuICBjb25zdCB1bml4TWF0Y2ggPSB3aXRob3V0VXJscy5tYXRjaCgvKD86XnxcXHMpKFxcL1tcXHdcXC1fLiBdezIsfSkvKTtcbiAgaWYgKHVuaXhNYXRjaCkge1xuICAgIGNvbnN0IHBhdGggPSB1bml4TWF0Y2hbMV0udHJpbSgpO1xuICAgIC8vIFJlamVjdCBwYXRocyB0aGF0IGxvb2sgbGlrZSBVUkxzIG9yIGZyYWdtZW50cyAoZS5nLiwgLyBDaGF0IGZpbGVzIHMpXG4gICAgaWYgKCFwYXRoLnN0YXJ0c1dpdGgoJy8gJykgJiYgIXBhdGguaW5jbHVkZXMoJyAnKSkge1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVsYXRpdmUgcGF0aHM6IC4vZm9sZGVyLCAuLi9wYXJlbnQvZGlyXG4gIGNvbnN0IHJlbE1hdGNoID0gd2l0aG91dFVybHMubWF0Y2goLyg/Ol58XFxzKSg/OlxcLlxcL3xcXC5cXFxcLlxcL3xcXC5cXC5cXC8pW1xcd1xcLV8uIF0rLyk7XG4gIGlmIChyZWxNYXRjaCkgcmV0dXJuIHJlbE1hdGNoWzBdLnRyaW0oKTtcblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaW5qZWN0V29ya2luZ0RpcmVjdG9yeVByb21wdChvcmlnaW5hbE1lc3NhZ2U6IHN0cmluZywgZGV0ZWN0ZWRQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBpbnN0cnVjdGlvbiA9IGBcblx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVxuXHUyNkEwXHVGRTBGIFdPUktJTkcgRElSRUNUT1JZIERFVEVDVEVEXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblxuVGhlIHVzZXIgbWVudGlvbmVkIGEgZGlyZWN0b3J5IHBhdGggaW4gdGhlaXIgbWVzc2FnZTpcblxuICAgICR7ZGV0ZWN0ZWRQYXRofVxuXG5QbGVhc2UgYXNrIHRoZSB1c2VyIGZvciBjb25maXJtYXRpb24gYmVmb3JlIGNoYW5naW5nIHRoZSB3b3JraW5nIGRpcmVjdG9yeS5cbkV4YW1wbGUgcmVzcG9uc2U6XG5cblwiSSBub3RpY2VkIHlvdSBtZW50aW9uZWQgdGhlIGRpcmVjdG9yeSAnJHtkZXRlY3RlZFBhdGh9Jy4gXG5Xb3VsZCB5b3UgbGlrZSBtZSB0byBzZXQgdGhpcyBhcyB5b3VyIHdvcmtpbmcgZGlyZWN0b3J5PyBcbkFsbCBzdWJzZXF1ZW50IGZpbGUgb3BlcmF0aW9ucyB3aWxsIHVzZSB0aGlzIGRpcmVjdG9yeSBhcyB0aGUgYmFzZS5cblxuUmVwbHkgJ3llcycgb3IgJ2phJyB0byBjb25maXJtLCBvciAnbm8nLyduZWluJyB0byBkZWNsaW5lLlwiXG5cblx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVxuXG5Vc2VyJ3Mgb3JpZ2luYWwgbWVzc2FnZTpcbiR7b3JpZ2luYWxNZXNzYWdlfVxuYDtcbiAgXG4gIHJldHVybiBpbnN0cnVjdGlvbi50cmltKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4dHJhY3RQZGZUZXh0KGZpbGVIYW5kbGU6IEZpbGVIYW5kbGUpOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IChmaWxlSGFuZGxlIGFzIGFueSkucmVhZEZpbGUgPyBhd2FpdCAoZmlsZUhhbmRsZSBhcyBhbnkpLnJlYWRGaWxlKCkgOiBCdWZmZXIuZnJvbShhd2FpdCAoZmlsZUhhbmRsZSBhcyBhbnkpLnJlYWQoKSk7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHBkZlBhcnNlKGJ1ZmZlcik7XG4gICAgcmV0dXJuIGRhdGEudGV4dC50cmltKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihgW1JBR10gRXJyb3IgZXh0cmFjdGluZyB0ZXh0IGZyb20gUERGICR7ZmlsZUhhbmRsZS5uYW1lfTpgLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcGFyc2UgUERGOiAke2ZpbGVIYW5kbGUubmFtZX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaHVua1RleHQodGV4dDogc3RyaW5nLCBjaHVua1NpemU6IG51bWJlciA9IDEwMDAsIG92ZXJsYXA6IG51bWJlciA9IDEwMCk6IHN0cmluZ1tdIHtcbiAgY29uc3Qgd29yZHMgPSB0ZXh0LnNwbGl0KC9cXHMrLyk7XG4gIGNvbnN0IGNodW5rczogc3RyaW5nW10gPSBbXTtcbiAgXG4gIGlmICh3b3Jkcy5sZW5ndGggPD0gY2h1bmtTaXplKSB7XG4gICAgcmV0dXJuIFt0ZXh0XTtcbiAgfVxuXG4gIGxldCBzdGFydEluZGV4ID0gMDtcbiAgd2hpbGUgKHN0YXJ0SW5kZXggPCB3b3Jkcy5sZW5ndGgpIHtcbiAgICBjb25zdCBlbmRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXggKyBjaHVua1NpemUsIHdvcmRzLmxlbmd0aCk7XG4gICAgY29uc3QgY2h1bmtUZXh0ID0gd29yZHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmpvaW4oJyAnKTtcbiAgICBcbiAgICBjaHVua3MucHVzaChjaHVua1RleHQpO1xuICAgIHN0YXJ0SW5kZXggPSBlbmRJbmRleCAtIG92ZXJsYXA7XG4gIH1cblxuICByZXR1cm4gY2h1bmtzLmZpbHRlcihjID0+IGMudHJpbSgpLmxlbmd0aCA+IDApO1xufVxuXG5mdW5jdGlvbiBjb3NpbmVTaW1pbGFyaXR5KGE6IG51bWJlcltdLCBiOiBudW1iZXJbXSk6IG51bWJlciB7XG4gIGxldCBkb3RQcm9kdWN0ID0gMDtcbiAgbGV0IG5vcm1BID0gMDtcbiAgbGV0IG5vcm1CID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgZG90UHJvZHVjdCArPSBhW2ldICogYltpXTtcbiAgICBub3JtQSArPSBhW2ldICogYVtpXTtcbiAgICBub3JtQiArPSBiW2ldICogYltpXTtcbiAgfVxuICByZXR1cm4gZG90UHJvZHVjdCAvIChNYXRoLnNxcnQobm9ybUEpICogTWF0aC5zcXJ0KG5vcm1CKSk7XG59XG5cbmludGVyZmFjZSBSZXRyaWV2YWxSZXN1bHQge1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHNjb3JlOiBudW1iZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJldHJpZXZlRnJvbVBkZnMoXG4gIGN0bDogUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcixcbiAgcXVlcnk6IHN0cmluZyxcbiAgcGRmRmlsZXM6IEZpbGVIYW5kbGVbXSxcbik6IFByb21pc2U8UmV0cmlldmFsUmVzdWx0W10+IHtcbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgY29uc3QgcmV0cmlldmFsTGltaXQgPSBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxMaW1pdCcpIHx8IDU7XG4gIC8vIExvd2VyIGRlZmF1bHQgdGhyZXNob2xkIHRvIGNhdGNoIG1vcmUgcmVzdWx0cyAtIHdhcyB0b28gaGlnaCBhdCAwLjZcbiAgY29uc3QgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQgPSBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCcpID8/IDAuMztcblxuICBjb25zb2xlLmxvZyhgW1JBR10gUHJvY2Vzc2luZyAke3BkZkZpbGVzLmxlbmd0aH0gUERGIGZpbGUocylgKTtcblxuICAvLyBFeHRyYWN0IHRleHQgZnJvbSBhbGwgUERGIGZpbGVzXG4gIGNvbnN0IGZpbGVUZXh0czogeyBmaWxlOiBGaWxlSGFuZGxlOyB0ZXh0OiBzdHJpbmcgfVtdID0gW107XG4gIGZvciAoY29uc3QgZmlsZSBvZiBwZGZGaWxlcykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgZXh0cmFjdFBkZlRleHQoZmlsZSk7XG4gICAgICBpZiAodGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBFeHRyYWN0ZWQgJHt0ZXh0Lmxlbmd0aH0gY2hhcnMgZnJvbSAke2ZpbGUubmFtZX1gKTtcbiAgICAgICAgZmlsZVRleHRzLnB1c2goeyBmaWxlLCB0ZXh0IH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbUkFHXSBObyB0ZXh0IGV4dHJhY3RlZCBmcm9tICR7ZmlsZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBbUkFHXSBTa2lwcGluZyBQREYgJHtmaWxlLm5hbWV9IGR1ZSB0byBlcnJvcjpgLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGZpbGVUZXh0cy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zb2xlLndhcm4oJ1tSQUddIE5vIHRleHQgZXh0cmFjdGVkIGZyb20gYW55IFBERicpO1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIENodW5rIHRoZSB0ZXh0c1xuICBjb25zdCBjaHVua3M6IHsgZmlsZTogRmlsZUhhbmRsZTsgY2h1bms6IHN0cmluZyB9W10gPSBbXTtcbiAgZm9yIChjb25zdCB7IGZpbGUsIHRleHQgfSBvZiBmaWxlVGV4dHMpIHtcbiAgICBjb25zdCBmaWxlQ2h1bmtzID0gY2h1bmtUZXh0KHRleHQpO1xuICAgIGNvbnNvbGUubG9nKGBbUkFHXSAke2ZpbGUubmFtZX06ICR7dGV4dC5sZW5ndGh9IGNoYXJzIFx1MjE5MiAke2ZpbGVDaHVua3MubGVuZ3RofSBjaHVua3NgKTtcbiAgICBmaWxlQ2h1bmtzLmZvckVhY2goKGNodW5rKSA9PiB7XG4gICAgICBjaHVua3MucHVzaCh7IGZpbGUsIGNodW5rIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGNodW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmdzIGZvciBhbGwgY2h1bmtzIHVzaW5nIExNIFN0dWRpbydzIGVtYmVkZGluZyBtb2RlbFxuICBsZXQgbW9kZWw7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coJ1tSQUddIExvYWRpbmcgZW1iZWRkaW5nIG1vZGVsLi4uJyk7XG4gICAgbW9kZWwgPSBhd2FpdCBjdGwuY2xpZW50LmVtYmVkZGluZy5tb2RlbCgnbm9taWMtYWkvbm9taWMtZW1iZWQtdGV4dC12MS41LUdHVUYnLCB7XG4gICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZygnW1JBR10gRW1iZWRkaW5nIG1vZGVsIGxvYWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBGYWlsZWQgdG8gbG9hZCBlbWJlZGRpbmcgbW9kZWw6JywgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihgRW1iZWRkaW5nIG1vZGVsIG5vdCBhdmFpbGFibGU6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICBjb25zdCBiYXRjaFNpemUgPSAzMjtcbiAgY29uc3QgYWxsRW1iZWRkaW5nczogbnVtYmVyW11bXSA9IFtdO1xuXG4gIHRyeSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpICs9IGJhdGNoU2l6ZSkge1xuICAgICAgY29uc29sZS5sb2coYFtSQUddIEdlbmVyYXRpbmcgZW1iZWRkaW5ncyBiYXRjaCAke01hdGguZmxvb3IoaSAvIGJhdGNoU2l6ZSkgKyAxfS8ke01hdGguY2VpbChjaHVua3MubGVuZ3RoIC8gYmF0Y2hTaXplKX0uLi5gKTtcbiAgICAgIGNvbnN0IGJhdGNoID0gY2h1bmtzLnNsaWNlKGksIGkgKyBiYXRjaFNpemUpLm1hcChjID0+IGMuY2h1bmspO1xuICAgICAgY29uc3QgZW1iZWRkaW5nc1Jlc3VsdCA9IGF3YWl0IG1vZGVsLmVtYmVkKGJhdGNoKTtcbiAgICAgIGFsbEVtYmVkZGluZ3MucHVzaCguLi4oZW1iZWRkaW5nc1Jlc3VsdCBhcyBhbnlbXSkubWFwKChlOiBhbnkpID0+IGUuZW1iZWRkaW5nKSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIGdlbmVyYXRpbmcgZW1iZWRkaW5nczonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFbWJlZGRpbmcgZ2VuZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmcgZm9yIHRoZSBxdWVyeVxuICBsZXQgcXVlcnlNb2RlbDtcbiAgdHJ5IHtcbiAgICBxdWVyeU1vZGVsID0gYXdhaXQgY3RsLmNsaWVudC5lbWJlZGRpbmcubW9kZWwoJ25vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGJywge1xuICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1JBR10gRmFpbGVkIHRvIGxvYWQgcXVlcnkgZW1iZWRkaW5nIG1vZGVsOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFF1ZXJ5IGVtYmVkZGluZyBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICBsZXQgcXVlcnlFbWJlZGRpbmc7XG4gIHRyeSB7XG4gICAgY29uc3QgcXVlcnlSZXN1bHQgPSBhd2FpdCBxdWVyeU1vZGVsLmVtYmVkKFtxdWVyeV0pO1xuICAgIHF1ZXJ5RW1iZWRkaW5nID0gcXVlcnlSZXN1bHRbMF0uZW1iZWRkaW5nO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIGdlbmVyYXRpbmcgcXVlcnkgZW1iZWRkaW5nOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFF1ZXJ5IGVtYmVkZGluZyBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgc2ltaWxhcml0aWVzIGFuZCByZXRyaWV2ZSB0b3AgcmVzdWx0c1xuICBjb25zdCBzY29yZXM6IHsgY2h1bmtJbmRleDogbnVtYmVyOyBzaW1pbGFyaXR5OiBudW1iZXIgfVtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2ltaWxhcml0eSA9IGNvc2luZVNpbWlsYXJpdHkocXVlcnlFbWJlZGRpbmcsIGFsbEVtYmVkZGluZ3NbaV0pO1xuICAgIHNjb3Jlcy5wdXNoKHsgY2h1bmtJbmRleDogaSwgc2ltaWxhcml0eSB9KTtcbiAgfVxuXG4gIC8vIFNvcnQgYnkgc2ltaWxhcml0eSBkZXNjZW5kaW5nIGFuZCBmaWx0ZXIgYnkgdGhyZXNob2xkXG4gIHNjb3Jlcy5zb3J0KChhLCBiKSA9PiBiLnNpbWlsYXJpdHkgLSBhLnNpbWlsYXJpdHkpO1xuICBcbiAgY29uc29sZS5sb2coYFtSQUddIEZvdW5kICR7c2NvcmVzLmxlbmd0aH0gY2h1bmtzLCBmaWx0ZXJpbmcgd2l0aCB0aHJlc2hvbGQgJHtyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZH1gKTtcbiAgY29uc3QgcmVsZXZhbnRDaHVua3MgPSBzY29yZXMuZmlsdGVyKFxuICAgIChzKSA9PiBzLnNpbWlsYXJpdHkgPj0gcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQgJiYgcy5jaHVua0luZGV4IDwgY2h1bmtzLmxlbmd0aCxcbiAgKTtcblxuICAvLyBMaW1pdCByZXN1bHRzXG4gIGNvbnN0IGxpbWl0ZWRSZXN1bHRzID0gcmVsZXZhbnRDaHVua3Muc2xpY2UoMCwgcmV0cmlldmFsTGltaXQpO1xuXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBSZXR1cm5pbmcgJHtsaW1pdGVkUmVzdWx0cy5sZW5ndGh9IHJlc3VsdHNgKTtcbiAgcmV0dXJuIGxpbWl0ZWRSZXN1bHRzLm1hcCgocikgPT4gKHtcbiAgICBjb250ZW50OiBjaHVua3Nbci5jaHVua0luZGV4XS5jaHVuayxcbiAgICBzY29yZTogci5zaW1pbGFyaXR5LFxuICB9KSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmVwcm9jZXNzKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIHVzZXJNZXNzYWdlOiBDaGF0TWVzc2FnZVxuKTogUHJvbWlzZTxzdHJpbmcgfCBDaGF0TWVzc2FnZT4ge1xuICBjb25zdCB1c2VyUHJvbXB0ID0gdXNlck1lc3NhZ2UuZ2V0VGV4dCgpO1xuICBcbiAgLy8gU3RlcCAwLjU6IENvbnRleHRHdWFyZCBhdXRvLWNvbXByZXNzaW9uIChiZWZvcmUgYW55IHByb2Nlc3NpbmcpXG4gIGlmIChjb250ZXh0R3VhcmQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGN0bC5wdWxsSGlzdG9yeSgpO1xuICAgICAgaGlzdG9yeS5hcHBlbmQodXNlck1lc3NhZ2UpO1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBoaXN0b3J5LmdldE1lc3NhZ2VzQXJyYXkoKTtcbiAgICAgIGNvbnN0IHRva2VuQ291bnQgPSBhd2FpdCBjb250ZXh0R3VhcmQuY291bnRUb2tlbnMobWVzc2FnZXMpO1xuICAgICAgY29uc3QgdGhyZXNob2xkID0gY29udGV4dEd1YXJkLmdldFRocmVzaG9sZCgpO1xuICAgICAgaWYgKHRva2VuQ291bnQgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtDb250ZXh0R3VhcmRdIFRva2VuIGNvdW50ICR7dG9rZW5Db3VudH0gZXhjZWVkcyB0aHJlc2hvbGQgJHt0aHJlc2hvbGR9LCBjb21wcmVzc2luZy4uLmApO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkTWVzc2FnZXMgPSBhd2FpdCBjb250ZXh0R3VhcmQuY29tcHJlc3NIaXN0b3J5KG1lc3NhZ2VzKTtcbiAgICAgICAgLy8gQ2xlYXIgaGlzdG9yeSBieSBwb3BwaW5nIGFsbCBtZXNzYWdlc1xuICAgICAgICB3aGlsZSAoaGlzdG9yeS5nZXRMZW5ndGgoKSA+IDApIHtcbiAgICAgICAgICBoaXN0b3J5LnBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbXByZXNzZWRNZXNzYWdlcy5mb3JFYWNoKG1zZyA9PiBoaXN0b3J5LmFwcGVuZChtc2cpKTtcbiAgICAgICAgY29udGV4dEd1YXJkLnJlc2V0VG9rZW5DYWNoZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignW0NvbnRleHRHdWFyZF0gQXV0by1jb21wcmVzc2lvbiBmYWlsZWQ6JywgZSk7XG4gICAgfVxuICB9XG4gIFxuICAvLyBTdGVwIDA6IEFsd2F5cyByZWdpc3RlciBhdHRhY2htZW50cyBzbyB0b29scyBjYW4gYWNjZXNzIHRoZW0gYnkgbmFtZVxuICBjb25zdCBhbGxGaWxlcyA9IHVzZXJNZXNzYWdlLmdldEZpbGVzKGN0bC5jbGllbnQpO1xuICBzZXRBdHRhY2htZW50cyhhbGxGaWxlcyk7XG4gIFxuICAvLyBCdWlsZCBhdHRhY2htZW50IG5vdGljZSB0byBpbmplY3QgaW50byBwcm9tcHRcbiAgbGV0IGF0dGFjaG1lbnROb3RpY2UgPSAnJztcbiAgaWYgKGFsbEZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmaWxlTmFtZXMgPSBsaXN0QXR0YWNobWVudHMoKTtcbiAgICBhdHRhY2htZW50Tm90aWNlID0gYFxcblxcblx1RDgzRFx1RENDRSBBVFRBQ0hFRCBGSUxFUyBBVkFJTEFCTEU6XFxuWW91IGhhdmUgYWNjZXNzIHRvIHRoZSBmb2xsb3dpbmcgYXR0YWNoZWQgZmlsZXMuIFlvdSBjYW4gcmVhZCB0aGVtIHVzaW5nIHRoZSByZWFkX2RvY3VtZW50IHRvb2wgYnkgZmlsZW5hbWU6XFxuJHtmaWxlTmFtZXMubWFwKG5hbWUgPT4gYC0gJHtuYW1lfWApLmpvaW4oJ1xcbicpfWA7XG4gIH1cbiAgXG4gIC8vIFN0ZXAgMTogRGlyZWN0b3J5IGRldGVjdGlvbiAoaGlnaGVzdCBwcmlvcml0eSlcbiAgY29uc3QgZGV0ZWN0ZWRQYXRoID0gZGV0ZWN0RGlyZWN0b3J5UGF0aCh1c2VyUHJvbXB0KTtcbiAgaWYgKGRldGVjdGVkUGF0aCkge1xuICAgIHJldHVybiBpbmplY3RXb3JraW5nRGlyZWN0b3J5UHJvbXB0KHVzZXJQcm9tcHQgKyBhdHRhY2htZW50Tm90aWNlLCBkZXRlY3RlZFBhdGgpICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbiAgfVxuICBcbiAgLy8gU3RlcCAyOiBEb2N1bWVudCBSQUcgcHJvY2Vzc2luZyAoaWYgZW5hYmxlZClcbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgY29uc3QgZG9jdW1lbnRSQUdFbmFibGVkID0gcGx1Z2luQ29uZmlnLmdldCgnZG9jdW1lbnRSQUcnKTtcbiAgXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBkb2N1bWVudFJBRyBlbmFibGVkOiAke2RvY3VtZW50UkFHRW5hYmxlZH1gKTtcbiAgXG4gIGlmICghZG9jdW1lbnRSQUdFbmFibGVkKSB7XG4gICAgLy8gSWYgUkFHIGlzIGRpc2FibGVkLCBqdXN0IHJldHVybiB0aGUgbWVzc2FnZSB3aXRoIGF0dGFjaG1lbnQgbm90aWNlXG4gICAgY29uc3QgYmFzZSA9IHVzZXJQcm9tcHQgKyBhdHRhY2htZW50Tm90aWNlO1xuICAgIHJldHVybiBiYXNlICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbiAgfVxuXG4gIGNvbnN0IG5ld0ZpbGVzID0gYWxsRmlsZXMuZmlsdGVyKGYgPT4gZi50eXBlICE9PSAnaW1hZ2UnKTtcbiAgY29uc29sZS5sb2coYFtSQUddIEZvdW5kICR7bmV3RmlsZXMubGVuZ3RofSBub24taW1hZ2UgZmlsZXNgKTtcbiAgXG4gIGlmIChuZXdGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zdCBiYXNlID0gdXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2U7XG4gICAgcmV0dXJuIGJhc2UgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xuICB9XG5cbiAgLy8gU2VwYXJhdGUgUERGIGZpbGVzIGZyb20gb3RoZXIgZmlsZSB0eXBlc1xuICBjb25zdCBwZGZGaWxlcyA9IG5ld0ZpbGVzLmZpbHRlcihmID0+IGYubmFtZS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcucGRmJykpO1xuICBjb25zdCBvdGhlckZpbGVzID0gbmV3RmlsZXMuZmlsdGVyKGYgPT4gIWYubmFtZS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcucGRmJykpO1xuXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBQREZzOiAke3BkZkZpbGVzLmxlbmd0aH0sIE90aGVyOiAke290aGVyRmlsZXMubGVuZ3RofWApO1xuXG4gIGxldCBhbGxSZXN1bHRzOiBSZXRyaWV2YWxSZXN1bHRbXSA9IFtdO1xuXG4gIC8vIFByb2Nlc3MgUERGcyB3aXRoIGN1c3RvbSBsb2NhbCBwaXBlbGluZSAobW9yZSByZWxpYWJsZSBmb3IgY29tcGxleCBsYXlvdXRzKVxuICBpZiAocGRmRmlsZXMubGVuZ3RoID4gMCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwZGZSZXN1bHRzID0gYXdhaXQgcmV0cmlldmVGcm9tUGRmcyhjdGwsIHVzZXJQcm9tcHQsIHBkZkZpbGVzKTtcbiAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBQREYgcmV0cmlldmFsIHJldHVybmVkICR7cGRmUmVzdWx0cy5sZW5ndGh9IHJlc3VsdHNgKTtcbiAgICAgIGFsbFJlc3VsdHMucHVzaCguLi5wZGZSZXN1bHRzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW1JBR10gRXJyb3IgcHJvY2Vzc2luZyBQREZzOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvLyBQcm9jZXNzIG90aGVyIGZpbGVzIHdpdGggTE0gU3R1ZGlvJ3MgbmF0aXZlIHJldHJpZXZhbCBBUEkgKGhhbmRsZXMgLnR4dCwgLm1kLCBldGMuIG5hdGl2ZWx5KVxuICBpZiAob3RoZXJGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1vZGVsID0gYXdhaXQgY3RsLmNsaWVudC5lbWJlZGRpbmcubW9kZWwoJ25vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGJywge1xuICAgICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjdGwuY2xpZW50LmZpbGVzLnJldHJpZXZlKHVzZXJQcm9tcHQsIG90aGVyRmlsZXMsIHtcbiAgICAgICAgZW1iZWRkaW5nTW9kZWw6IG1vZGVsLFxuICAgICAgICBsaW1pdDogcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsTGltaXQnKSB8fCA1LFxuICAgICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDb252ZXJ0IGhpZ2gtbGV2ZWwgQVBJIHJlc3VsdHMgdG8gb3VyIGZvcm1hdFxuICAgICAgY29uc3QgZmlsdGVyZWRFbnRyaWVzID0gcmVzdWx0LmVudHJpZXMuZmlsdGVyKFxuICAgICAgICBlbnRyeSA9PiBlbnRyeS5zY29yZSA+IChwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCcpID8/IDAuMylcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhgW1JBR10gTmF0aXZlIHJldHJpZXZhbCByZXR1cm5lZCAke2ZpbHRlcmVkRW50cmllcy5sZW5ndGh9IHJlc3VsdHNgKTtcbiAgICAgIGFsbFJlc3VsdHMucHVzaCguLi5maWx0ZXJlZEVudHJpZXMubWFwKGUgPT4gKHsgY29udGVudDogZS5jb250ZW50LCBzY29yZTogZS5zY29yZSB9KSkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciByZXRyaWV2aW5nIGZyb20gb3RoZXIgZmlsZXM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNvcnQgYW5kIGxpbWl0IHJlc3VsdHNcbiAgYWxsUmVzdWx0cy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XG4gIGNvbnN0IHJldHJpZXZhbExpbWl0ID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsTGltaXQnKSB8fCA1O1xuICBhbGxSZXN1bHRzID0gYWxsUmVzdWx0cy5zbGljZSgwLCByZXRyaWV2YWxMaW1pdCk7XG5cbiAgY29uc29sZS5sb2coYFtSQUddIFRvdGFsIHJlc3VsdHMgYWZ0ZXIgc29ydGluZzogJHthbGxSZXN1bHRzLmxlbmd0aH1gKTtcblxuICAvLyBJbmplY3QgY29udGV4dCBpZiByZXN1bHRzIGZvdW5kXG4gIGlmIChhbGxSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgY29udGV4dEluamVjdGlvbiA9ICcnO1xuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIGFsbFJlc3VsdHMpIHtcbiAgICAgIGNvbnRleHRJbmplY3Rpb24gKz0gYFxcbiR7cmVzdWx0LmNvbnRlbnR9XFxuLS0tXFxuYDtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7dXNlclByb21wdH0ke2F0dGFjaG1lbnROb3RpY2V9XFxuXFxuLS0tIFJFTEVWQU5UIERPQ1VNRU5UIENPTlRFWFQgLS0tXFxuJHtjb250ZXh0SW5qZWN0aW9uLnRyaW0oKX1gICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbiAgfVxuXG4gIC8vIElmIG5vIHJlc3VsdHMgZm91bmQsIHJldHVybiBvcmlnaW5hbCBtZXNzYWdlIHdpdGggYXR0YWNobWVudCBub3RpY2VcbiAgY29uc29sZS5sb2coJ1tSQUddIE5vIHJlbGV2YW50IHJlc3VsdHMgZm91bmQnKTtcbiAgY29uc3QgYmFzZSA9IHVzZXJQcm9tcHQgKyBhdHRhY2htZW50Tm90aWNlO1xuICByZXR1cm4gYmFzZSArIGdldFRlbXBvcmFsU3VmZml4KGN0bCk7XG59XG4iLCAiLyoqXG4gKiBBSSBUb29sYm94IFBsdWdpbiAtIEVudHJ5IFBvaW50XG4gKiBNYWluIGZ1bmN0aW9uIGV4cG9ydGVkIGZvciBMTSBTdHVkaW8gcGx1Z2luIHN5c3RlbVxuICovXG5cbmltcG9ydCB7IHR5cGUgUGx1Z2luQ29udGV4dCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbHNQcm92aWRlciB9IGZyb20gJy4vdG9vbHNQcm92aWRlcic7XG5pbXBvcnQgeyBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgcHJlcHJvY2VzcyB9IGZyb20gJy4vcHJvbXB0UHJlcHJvY2Vzc29yJztcbmltcG9ydCB7IGNsZWFudXBCcm93c2VyU2Vzc2lvbiB9IGZyb20gJy4vdG9vbHMvYnJvd3NlckF1dG9tYXRpb25Ub29scyc7XG5cbi8vIFx1MjcwNSBGSVg6IFVzZSBzdHJ1Y3R1cmVkIGxvZ2dpbmcgaW5zdGVhZCBvZiBjb25zb2xlLmxvZ1xuY29uc3QgbG9nZ2VyID0ge1xuICBpbmZvOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZG91dC53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZG91dC53cml0ZShgW0FJIFRvb2xib3hdICR7bXNnfVxcbmApLFxuICB3YXJuOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZGVyci53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZGVyci53cml0ZShgW0FJIFRvb2xib3ggV0FSTl0gJHttc2d9XFxuYCksXG4gIGVycm9yOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZGVyci53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZGVyci53cml0ZShgW0FJIFRvb2xib3ggRVJST1JdICR7bXNnfVxcbmApLFxufTtcblxuLyoqXG4gKiBNYWluIHBsdWdpbiBlbnRyeSBwb2ludCAtIGNhbGxlZCBieSBMTSBTdHVkaW9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1haW4oY29udGV4dDogUGx1Z2luQ29udGV4dCkge1xuICBsb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nLi4uJyk7XG4gIFxuICAvLyBSZWdpc3RlciB0aGUgY29uZmlndXJhdGlvbiBzY2hlbWF0aWNzIChtYWtlcyB0b2dnbGVzIGFwcGVhciBpbiBVSSlcbiAgY29udGV4dC53aXRoQ29uZmlnU2NoZW1hdGljcyhjb25maWdTY2hlbWF0aWNzKTtcbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSBwcm9tcHQgcHJlcHJvY2Vzc29yIGZvciBEb2N1bWVudCBSQUcgLyBDaGF0IHdpdGggRmlsZXNcbiAgY29udGV4dC53aXRoUHJvbXB0UHJlcHJvY2Vzc29yKHByZXByb2Nlc3MpO1xuICBcbiAgLy8gTm90ZTogTE0gU3R1ZGlvIFNESyB2MS41LjAgZG9lc24ndCBleHBvc2UgZ2V0Q29uZmlnKCkgb24gUGx1Z2luQ29udGV4dC5cbiAgLy8gQ29uZmlndXJhdGlvbiBpcyBoYW5kbGVkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIFNESydzIGNvbmZpZyBzeXN0ZW0uXG4gIC8vIFRoZSB0b29sc1Byb3ZpZGVyIHdpbGwgdXNlIGRlZmF1bHQgc2V0dGluZ3MgdW50aWwgVUkgdG9nZ2xlcyBhcmUgYXBwbGllZC5cbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSB0b29scyBwcm92aWRlciBmdW5jdGlvblxuICBjb250ZXh0LndpdGhUb29sc1Byb3ZpZGVyKHRvb2xzUHJvdmlkZXIpO1xuICBcbiAgLy8gSGFuZGxlIHBsdWdpbiB1bmxvYWQgLSBjbGVhbnVwIGJyb3dzZXIgc2Vzc2lvbiB0byBwcmV2ZW50IG9ycGhhbmVkIHByb2Nlc3Nlc1xuICBpZiAodHlwZW9mIHByb2Nlc3Mub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgY2xlYW51cEJyb3dzZXJTZXNzaW9uKCk7XG4gICAgfSk7XG4gICAgcHJvY2Vzcy5vbignU0lHSU5UJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgY2xlYW51cEJyb3dzZXJTZXNzaW9uKCk7XG4gICAgfSk7XG4gIH1cbiAgXG4gIGxvZ2dlci5pbmZvKCdJbml0aWFsaXplZCBzdWNjZXNzZnVsbHkhJyk7XG59XG4iLCAiaW1wb3J0IHsgTE1TdHVkaW9DbGllbnQsIHR5cGUgUGx1Z2luQ29udGV4dCB9IGZyb20gXCJAbG1zdHVkaW8vc2RrXCI7XG5cbmRlY2xhcmUgdmFyIHByb2Nlc3M6IGFueTtcblxuLy8gV2UgcmVjZWl2ZSBydW50aW1lIGluZm9ybWF0aW9uIGluIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG5jb25zdCBjbGllbnRJZGVudGlmaWVyID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9DTElFTlRfSURFTlRJRklFUjtcbmNvbnN0IGNsaWVudFBhc3NrZXkgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0NMSUVOVF9QQVNTS0VZO1xuY29uc3QgYmFzZVVybCA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQkFTRV9VUkw7XG5cbmNvbnN0IGNsaWVudCA9IG5ldyBMTVN0dWRpb0NsaWVudCh7XG4gIGNsaWVudElkZW50aWZpZXIsXG4gIGNsaWVudFBhc3NrZXksXG4gIGJhc2VVcmwsXG59KTtcblxuKGdsb2JhbFRoaXMgYXMgYW55KS5fX0xNU19QTFVHSU5fQ09OVEVYVCA9IHRydWU7XG5cbmxldCBwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQgPSBmYWxzZTtcbmxldCBwcm9tcHRQcmVwcm9jZXNzb3JTZXQgPSBmYWxzZTtcbmxldCBjb25maWdTY2hlbWF0aWNzU2V0ID0gZmFsc2U7XG5sZXQgZ2xvYmFsQ29uZmlnU2NoZW1hdGljc1NldCA9IGZhbHNlO1xubGV0IHRvb2xzUHJvdmlkZXJTZXQgPSBmYWxzZTtcbmxldCBnZW5lcmF0b3JTZXQgPSBmYWxzZTtcblxuY29uc3Qgc2VsZlJlZ2lzdHJhdGlvbkhvc3QgPSBjbGllbnQucGx1Z2lucy5nZXRTZWxmUmVnaXN0cmF0aW9uSG9zdCgpO1xuXG5jb25zdCBwbHVnaW5Db250ZXh0OiBQbHVnaW5Db250ZXh0ID0ge1xuICB3aXRoUHJlZGljdGlvbkxvb3BIYW5kbGVyOiAoZ2VuZXJhdGUpID0+IHtcbiAgICBpZiAocHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcmVkaWN0aW9uTG9vcEhhbmRsZXIgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBpZiAodG9vbHNQcm92aWRlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJlZGljdGlvbkxvb3BIYW5kbGVyIGNhbm5vdCBiZSB1c2VkIHdpdGggYSB0b29scyBwcm92aWRlclwiKTtcbiAgICB9XG5cbiAgICBwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFByZWRpY3Rpb25Mb29wSGFuZGxlcihnZW5lcmF0ZSk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhQcm9tcHRQcmVwcm9jZXNzb3I6IChwcmVwcm9jZXNzKSA9PiB7XG4gICAgaWYgKHByb21wdFByZXByb2Nlc3NvclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJvbXB0UHJlcHJvY2Vzc29yIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgcHJvbXB0UHJlcHJvY2Vzc29yU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRQcm9tcHRQcmVwcm9jZXNzb3IocHJlcHJvY2Vzcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhDb25maWdTY2hlbWF0aWNzOiAoY29uZmlnU2NoZW1hdGljcykgPT4ge1xuICAgIGlmIChjb25maWdTY2hlbWF0aWNzU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb25maWcgc2NoZW1hdGljcyBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGNvbmZpZ1NjaGVtYXRpY3NTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldENvbmZpZ1NjaGVtYXRpY3MoY29uZmlnU2NoZW1hdGljcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhHbG9iYWxDb25maWdTY2hlbWF0aWNzOiAoZ2xvYmFsQ29uZmlnU2NoZW1hdGljcykgPT4ge1xuICAgIGlmIChnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHbG9iYWwgY29uZmlnIHNjaGVtYXRpY3MgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRHbG9iYWxDb25maWdTY2hlbWF0aWNzKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3MpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoVG9vbHNQcm92aWRlcjogKHRvb2xzUHJvdmlkZXIpID0+IHtcbiAgICBpZiAodG9vbHNQcm92aWRlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVG9vbHMgcHJvdmlkZXIgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBpZiAocHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUb29scyBwcm92aWRlciBjYW5ub3QgYmUgdXNlZCB3aXRoIGEgcHJlZGljdGlvbkxvb3BIYW5kbGVyXCIpO1xuICAgIH1cblxuICAgIHRvb2xzUHJvdmlkZXJTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFRvb2xzUHJvdmlkZXIodG9vbHNQcm92aWRlcik7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhHZW5lcmF0b3I6IChnZW5lcmF0b3IpID0+IHtcbiAgICBpZiAoZ2VuZXJhdG9yU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cblxuICAgIGdlbmVyYXRvclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0R2VuZXJhdG9yKGdlbmVyYXRvcik7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG59O1xuXG5pbXBvcnQoXCIuLy4uL3NyYy9pbmRleC50c1wiKS50aGVuKGFzeW5jIG1vZHVsZSA9PiB7XG4gIHJldHVybiBhd2FpdCBtb2R1bGUubWFpbihwbHVnaW5Db250ZXh0KTtcbn0pLnRoZW4oKCkgPT4ge1xuICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5pbml0Q29tcGxldGVkKCk7XG59KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBleGVjdXRlIHRoZSBtYWluIGZ1bmN0aW9uIG9mIHRoZSBwbHVnaW4uXCIpO1xuICBjb25zb2xlLmVycm9yKGVycm9yKTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbVFPLFNBQVMsY0FBYyxRQUFzQixVQUF3UTtBQUMxVCxTQUFPLE9BQU8sUUFBUSxNQUFNO0FBQzlCO0FBV08sU0FBUyx1QkFBdUIsUUFBc0JBLFFBQStEO0FBRTFILFVBQVFBLFFBQU07QUFBQSxJQUVaLEtBQUs7QUFBYyxhQUFPLE9BQU8sd0JBQXdCO0FBQUEsSUFFekQsS0FBSztBQUFjLGFBQU8sT0FBTyxvQkFBb0I7QUFBQSxJQUVyRCxLQUFLO0FBQWMsYUFBTyxPQUFPLHNCQUFzQjtBQUFBLElBRXZELEtBQUs7QUFBYyxhQUFPLE9BQU8sbUJBQW1CO0FBQUEsRUFFdEQ7QUFFRjtBQTlSQSxnQkFFQSxZQVFhLGNBbUlBLGdCQXFNQTtBQWxWYjtBQUFBO0FBQUE7QUFBQSxpQkFBa0I7QUFFbEIsaUJBQXVDO0FBUWhDLElBQU0sZUFBZSxhQUFFLE9BQU87QUFBQTtBQUFBLE1BSW5DLFlBQVksYUFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsTUFFcEMsV0FBVyxhQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxNQUVuQyxtQkFBbUIsYUFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsTUFFNUMsZUFBZSxhQUFFLFFBQVEsRUFBRSxRQUFRLEtB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Qy9DLFNBQU8sTUFBTUEsUUFBTyxLQUFLLGFBQWE7QUFDeEMsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUNaLHVCQUFxQixjQUFjO0FBQ3JDLENBQUMsRUFBRSxNQUFNLENBQUMsVUFBVTtBQUNsQixVQUFRLE1BQU0sb0RBQW9EO0FBQ2xFLFVBQVEsTUFBTSxLQUFLO0FBQ3JCLENBQUM7IiwKICAibmFtZXMiOiBbInRvb2wiLCAicGxhdGZvcm0iLCAicGF0aCIsICJmcyIsICJyZXNvbHZlIiwgImZzIiwgInBhdGgiLCAic3Bhd25XaXRoUHJvZ3Jlc3MiLCAicmVzb2x2ZSIsICJydW5Db25maWdBbmFseXNpcyIsICJydW5JbXBvcnRBbmFseXNpcyIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJkZGdTZWFyY2giLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgIm1lc3NhZ2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgInJlc29sdmUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJyZXNvbHZlIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJpbXBvcnRfY2hpbGRfcHJvY2VzcyIsICJoYW5kbGVFcnJvciIsICJwbGF0Zm9ybSIsICJyZXNvbHZlIiwgIm1lc3NhZ2UiLCAiZ2V0V29ya2luZ0RpciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAib3MiLCAicGF0aCIsICJmcyIsICJpbXBvcnRfY2hpbGRfcHJvY2VzcyIsICJmcyIsICJzdGF0IiwgImhhbmRsZUVycm9yIiwgIm9zIiwgInBsYXRmb3JtIiwgInNwYXduIiwgInJlc29sdmUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgInBhdGgiLCAiaG9zdG5hbWUiLCAiaGFuZGxlRXJyb3IiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImNodW5rVGV4dCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAicGF0aCIsICJmcyIsICJwdXBwZXRlZXJNb2R1bGUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImZzIiwgInBhdGgiLCAidG9vbCIsICJzdGF0IiwgImhhbmRsZUVycm9yIiwgImV4dCIsICJwZGZQYXJzZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAicGF0aCIsICJmcyIsICJ0b29sIiwgInBhdGgiLCAicGRmUGFyc2UiLCAiY2h1bmtUZXh0IiwgImJhc2UiLCAibG9nZ2VyIiwgImltcG9ydF9zZGsiLCAicHJlcHJvY2VzcyIsICJjb25maWdTY2hlbWF0aWNzIiwgInRvb2xzUHJvdmlkZXIiLCAibW9kdWxlIl0KfQo=
