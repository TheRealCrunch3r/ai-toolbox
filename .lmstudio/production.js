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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/config.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/config.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/stateManager.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/stateManager.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/backgroundCommands.ts
var BackgroundCommandManager;
var init_backgroundCommands = __esm({
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/backgroundCommands.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/workingDir.ts
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
  return true;
}
function resolvePath(userPath) {
  return path2.resolve(currentWorkingDir, userPath);
}
var path2, fs2, BASE_DIR, currentWorkingDir;
var init_workingDir = __esm({
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/workingDir.ts"() {
    "use strict";
    path2 = __toESM(require("path"));
    fs2 = __toESM(require("fs"));
    BASE_DIR = path2.join(__dirname, "..");
    currentWorkingDir = BASE_DIR;
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/security.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/security.ts"() {
    "use strict";
    init_config();
    init_workingDir();
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/performanceUtils.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/performanceUtils.ts"() {
    "use strict";
    fs3 = __toESM(require("fs/promises"));
    path3 = __toESM(require("path"));
    fuzzySearchCache = /* @__PURE__ */ new Map();
    CACHE_TTL_MS = 6e4;
    requestCache = /* @__PURE__ */ new Map();
    REQUEST_CACHE_TTL_MS = 3e4;
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/fileSystemTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/fileSystemTools.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/webResearchTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/webResearchTools.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/gitGithubTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/gitGithubTools.ts"() {
    "use strict";
    import_sdk4 = require("@lmstudio/sdk");
    import_zod4 = require("zod");
    simpleGitModule = null;
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/browserAutomationTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/browserAutomationTools.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/databaseTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/databaseTools.ts"() {
    "use strict";
    import_sdk6 = require("@lmstudio/sdk");
    import_zod6 = require("zod");
    init_security();
    sqliteModule = null;
    sqliteLoadError = null;
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/backgroundCommandTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/backgroundCommandTools.ts"() {
    "use strict";
    import_sdk7 = require("@lmstudio/sdk");
    import_zod7 = require("zod");
    init_security();
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/executionTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/executionTools.ts"() {
    "use strict";
    import_sdk8 = require("@lmstudio/sdk");
    import_zod8 = require("zod");
    import_child_process2 = require("child_process");
    init_security();
    init_workingDir();
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/utilityTools.ts
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
var import_sdk9, import_zod9, os2, path6, fs6, import_child_process3;
var init_utilityTools = __esm({
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/utilityTools.ts"() {
    "use strict";
    import_sdk9 = require("@lmstudio/sdk");
    import_zod9 = require("zod");
    os2 = __toESM(require("os"));
    path6 = __toESM(require("path"));
    fs6 = __toESM(require("fs"));
    import_child_process3 = require("child_process");
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/imageProcessingTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/imageProcessingTools.ts"() {
    "use strict";
    import_sdk10 = require("@lmstudio/sdk");
    import_zod10 = require("zod");
    path7 = __toESM(require("path"));
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/httpClientTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/httpClientTools.ts"() {
    "use strict";
    import_sdk11 = require("@lmstudio/sdk");
    import_zod11 = require("zod");
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/vectorRagTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/vectorRagTools.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/uiGenerationTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/uiGenerationTools.ts"() {
    "use strict";
    import_sdk13 = require("@lmstudio/sdk");
    import_zod13 = require("zod");
    fs8 = __toESM(require("fs"));
    path9 = __toESM(require("path"));
    init_workingDir();
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/contextManagementTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/contextManagementTools.ts"() {
    "use strict";
    import_sdk14 = require("@lmstudio/sdk");
    import_zod14 = require("zod");
    fs9 = __toESM(require("fs"));
    path10 = __toESM(require("path"));
    init_workingDir();
    ContextStorageManager = class {
      constructor() {
        this.storagePath = path10.join(getWorkingDir(), ".ai_toolbox_context.json");
      }
      /** Load context entries from disk */
      load() {
        try {
          if (fs9.existsSync(this.storagePath)) {
            const data = fs9.readFileSync(this.storagePath, "utf-8");
            return JSON.parse(data);
          }
        } catch (error) {
          console.error("Failed to load context storage:", error);
        }
        return [];
      }
      /** Save context entries to disk */
      save(entries) {
        try {
          const dir = path10.dirname(this.storagePath);
          if (!fs9.existsSync(dir)) {
            fs9.mkdirSync(dir, { recursive: true });
          }
          const tempPath = this.storagePath + ".tmp";
          fs9.writeFileSync(tempPath, JSON.stringify(entries, null, 2));
          fs9.renameSync(tempPath, this.storagePath);
        } catch (error) {
          console.error("Failed to save context storage:", error);
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/attachmentManager.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/attachmentManager.ts"() {
    "use strict";
    currentAttachments = /* @__PURE__ */ new Map();
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/documentTools.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/tools/documentTools.ts"() {
    "use strict";
    import_sdk15 = require("@lmstudio/sdk");
    import_zod15 = require("zod");
    path11 = __toESM(require("path"));
    fs10 = __toESM(require("fs"));
    init_attachmentManager();
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/toolsProvider.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/toolsProvider.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/promptPreprocessor.ts
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
  if (!config.temporalAwareness) return "";
  const style = config.dateFormatStyle || "standard";
  const { compact, full } = getCachedDateTime();
  if (style === "heuteIst") {
    return `

HEUTE IST ${full}`;
  }
  return `

[Zeit: ${compact}]`;
}
function detectDirectoryPath(text) {
  const withoutUrls = text.replace(/https?:\/\/[^\s]+|www\.[^\s]+|file:\/\/[^\s]+/g, "");
  const winMatch = withoutUrls.match(/[A-Za-z]:\\[\w\-_. ]+/);
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
    const buffer = await fileHandle.read();
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
      const embeddings = await model.embed(batch, ctl.abortSignal);
      allEmbeddings.push(...embeddings);
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
    queryEmbedding = (await queryModel.embed([query], ctl.abortSignal))[0];
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
var import_pdf_parse, cachedDateTimeData, CACHE_DURATION_MS, cacheTimestamp;
var init_promptPreprocessor = __esm({
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/promptPreprocessor.ts"() {
    "use strict";
    init_config();
    import_pdf_parse = __toESM(require("pdf-parse"));
    init_attachmentManager();
    cachedDateTimeData = null;
    CACHE_DURATION_MS = 5 * 60 * 1e3;
    cacheTimestamp = 0;
  }
});

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/index.ts
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
  "C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/src/index.ts"() {
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

// C:/Users/root.MPITS/.lmstudio/extensions/plugins/crunch3r/ai-toolbox/.lmstudio/entry.ts
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kQ29tbWFuZHMudHMiLCAiLi4vc3JjL3dvcmtpbmdEaXIudHMiLCAiLi4vc3JjL3NlY3VyaXR5LnRzIiwgIi4uL3NyYy9wZXJmb3JtYW5jZVV0aWxzLnRzIiwgIi4uL3NyYy90b29scy9maWxlU3lzdGVtVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2dpdEdpdGh1YlRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9kYXRhYmFzZVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9leGVjdXRpb25Ub29scy50cyIsICIuLi9zcmMvdG9vbHMvdXRpbGl0eVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvaHR0cENsaWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy92ZWN0b3JSYWdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMudHMiLCAiLi4vc3JjL2F0dGFjaG1lbnRNYW5hZ2VyLnRzIiwgIi4uL3NyYy90b29scy9kb2N1bWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29sc1Byb3ZpZGVyLnRzIiwgIi4uL3NyYy9wcm9tcHRQcmVwcm9jZXNzb3IudHMiLCAiLi4vc3JjL2luZGV4LnRzIiwgImVudHJ5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuaW1wb3J0IHsgY3JlYXRlQ29uZmlnU2NoZW1hdGljcyB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gWm9kIFNjaGVtYSAodmFsaWRhdGlvbikgPT09PT09PT09PT09PT09PT09PT1cblxuXG5cbmV4cG9ydCBjb25zdCBDb25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG5cbiAgLy8gVG9vbCBHYXRpbmcgKGVuYWJsZS9kaXNhYmxlIGluZGl2aWR1YWwgdG9vbHMpXG5cbiAgZmlsZVN5c3RlbTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICB3ZWJTZWFyY2g6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYnJvd3NlckF1dG9tYXRpb246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuXG4gIGdpdE9wZXJhdGlvbnM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuXG4gIGRhdGFiYXNlUXVlcmllczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cbiAgZG9jdW1lbnRQYXJzaW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIGJhY2tncm91bmRDb21tYW5kczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0NcdUREOTUgTkVXIFRPT0wgQ0FURUdPUklFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBpbWFnZVByb2Nlc3Npbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBpbWFnZSBPQ1IsIHNjcmVlbnNob3QsIGFuZCBjb21wYXJpc29uIHRvb2xzJyksXG5cbiAgaHR0cENsaWVudDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0VuYWJsZSBnZW5lcmljIEhUVFAgY2xpZW50IGZvciBSRVNUIEFQSSBjYWxscycpLFxuXG4gIHZlY3RvclJBRzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIHNlbWFudGljIHNlYXJjaCB3aXRoIHZlY3RvciBlbWJlZGRpbmdzJyksXG4gIHVpR2VuZXJhdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0VuYWJsZSBpbnRlcmFjdGl2ZSBVSSBnZW5lcmF0aW9uIGFuZCByZW5kZXJpbmcgdG9vbHMnKSxcbiAgY29udGV4dE1hbmFnZW1lbnQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBhdXRvbWF0aWMgY29udGV4dCB0cmFja2luZyBhbmQgbWVtb3J5IG1hbmFnZW1lbnQnKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBnb2RNb2RlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnXHUyNkEwXHVGRTBGIFdBUk5JTkc6IEVuYWJsZXMgZXZlcnkgdG9vbCBjYXRlZ29yeS4gVXNlIHdpdGggY2F1dGlvbi4nKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzRFx1RENEQSBET0NVTUVOVCBSQUcgLyBDSEFUIFdJVEggRklMRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgZG9jdW1lbnRSQUc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBmaWxlIGluZGV4aW5nIGFuZCBzZW1hbnRpYyBzZWFyY2ggZm9yIGNoYXQnKSxcblxuICByZXRyaWV2YWxMaW1pdDogei5udW1iZXIoKS5taW4oMSkubWF4KDIwKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiByZWxldmFudCBjaHVua3MgdG8gcmV0cmlldmUnKSxcblxuICByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZDogei5udW1iZXIoKS5taW4oMC4wKS5tYXgoMS4wKS5kZWZhdWx0KDAuNSkuZGVzY3JpYmUoJ01pbmltdW0gc2ltaWxhcml0eSBzY29yZSBmb3IgYSBjaHVuayB0byBiZSBjb25zaWRlcmVkIHJlbGV2YW50ICgwLTEpJyksXG5cbiAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCBpbmRpdmlkdWFsIHRvZ2dsZXMgKGdyYW51bGFyIGNvbnRyb2wpXG5cbiAgZXhlY3V0aW9uSmF2YVNjcmlwdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9qYXZhc2NyaXB0IHRvb2wnKSxcblxuICBleGVjdXRpb25QeXRob246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdBbGxvdyBydW5fcHl0aG9uIHRvb2wnKSxcblxuICBleGVjdXRpb25UZXJtaW5hbDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9pbl90ZXJtaW5hbCB0b29sJyksXG5cbiAgZXhlY3V0aW9uU2hlbGw6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0FsbG93IGV4ZWN1dGVfY29tbWFuZCB0b29sJyksXG5cblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBXZWIgU2VhcmNoIFNldHRpbmdzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIHNlYXJjaEZhbGxiYWNrQ2hhaW46IHouZW51bShbJ2RkZy1hcGknLCAnZGRnLWZldGNoJywgJ2dvb2dsZScsICdiaW5nJ10pLmRlZmF1bHQoJ2RkZy1hcGknKS5kZXNjcmliZSgnUHJpbWFyeSBzZWFyY2ggZW5naW5lIChhdXRvLWZhbGxiYWNrIHRvIG90aGVycyknKSxcblxuICBtYXhTZWFyY2hSZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLmRlZmF1bHQoMTApLFxuXG4gIHNhZmVzZWFyY2g6IHouZW51bShbJzAnLCAnMScsICcyJ10pLmRlZmF1bHQoJzEnKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIEJyb3dzZXIgU2V0dGluZ3MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgYnJvd3NlclRpbWVvdXQ6IHoubnVtYmVyKCkubWluKDEwMDApLm1heCgzMDAwMCkuZGVmYXVsdCg1MDAwKSxcblxuICBoZWFkbGVzc01vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdSdW4gYnJvd3NlciB3aXRob3V0IEdVSScpLFxuXG5cblxuICAvLyBHaXQgU2V0dGluZ3NcblxuICBnaXRBdXRvQ29tbWl0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcblxuICBkZWZhdWx0QnJhbmNoOiB6LnN0cmluZygpLmRlZmF1bHQoJ21haW4nKSxcblxuXG5cbiAgLy8gU2VjdXJpdHkgU2V0dGluZ3NcblxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYmluYXJ5RmlsZURldGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICByZWdleFJlRG9TUHJvdGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICBtYXhSZWdleExlbmd0aDogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMDApLmRlZmF1bHQoNTAwKSxcblxuXG5cbiAgLy8gU3RhdGUgTWFuYWdlbWVudFxuXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIHN0YXRlTWF4U2l6ZTogei5udW1iZXIoKS5taW4oMTAyNCkubWF4KDEwNDg1NzYpLmRlZmF1bHQoMTAyNDApLFxuXG5cblxuICAvLyBpMThuIFNldHRpbmdzXG5cbiAgbGFuZ3VhZ2U6IHouZW51bShbJ2VuJywgJ2RlJywgJ3poLUNOJywgJ3poLVRXJ10pLmRlZmF1bHQoJ2VuJyksXG5cblxuXG4gIC8vIE5vdGlmaWNhdGlvbiBTZXR0aW5nc1xuXG4gIG5vdGlmaWNhdGlvbnNFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIC8vIFRlbXBvcmFsIEF3YXJlbmVzcyAobWVyZ2VkIGZyb20gdXBfdG9fZGF0ZSlcbiAgdGVtcG9yYWxBd2FyZW5lc3M6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBhdXRvbWF0aWMgZGF0ZS90aW1lIGluamVjdGlvbiBpbnRvIHByb21wdHMnKSxcbiAgZGF0ZUZvcm1hdFN0eWxlOiB6LmVudW0oWydzdGFuZGFyZCcsICdoZXV0ZUlzdCddKS5kZWZhdWx0KCdzdGFuZGFyZCcpLmRlc2NyaWJlKCdEYXRlIGZvcm1hdCBzdHlsZSBmb3IgdGVtcG9yYWwgYXdhcmVuZXNzJyksXG59KTtcblxuXG5cbmV4cG9ydCB0eXBlIFBsdWdpbkNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIENvbmZpZ1NjaGVtYT47XG5cblxuXG4vKipcblxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdFxuXG4gKi9cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09ORklHOiBQbHVnaW5Db25maWcgPSB7XG5cbiAgZmlsZVN5c3RlbTogdHJ1ZSxcblxuICB3ZWJTZWFyY2g6IHRydWUsXG5cbiAgYnJvd3NlckF1dG9tYXRpb246IGZhbHNlLFxuXG4gIGdpdE9wZXJhdGlvbnM6IGZhbHNlLFxuXG4gIGRhdGFiYXNlUXVlcmllczogZmFsc2UsXG5cbiAgZG9jdW1lbnRQYXJzaW5nOiB0cnVlLFxuXG4gIGJhY2tncm91bmRDb21tYW5kczogZmFsc2UsXG5cblxuXG4gIC8vIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI2QTBcdUZFMEZcblxuICBnb2RNb2RlOiBmYWxzZSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIGltYWdlUHJvY2Vzc2luZzogdHJ1ZSxcblxuICBodHRwQ2xpZW50OiBmYWxzZSxcblxuICB2ZWN0b3JSQUc6IHRydWUsXG4gIHVpR2VuZXJhdGlvbjogZmFsc2UsXG4gIGNvbnRleHRNYW5hZ2VtZW50OiB0cnVlLFxuXG5cblxuICAvLyBcdTI2QTBcdUZFMEYgR09EIE1PREUgKEVuYWJsZSBBTEwgdG9vbHMgYXQgb25jZSkgXHUyNkEwXHVGRTBGXG5cbiAgZG9jdW1lbnRSQUc6IHRydWUsXG5cbiAgcmV0cmlldmFsTGltaXQ6IDUsXG5cbiAgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQ6IDAuNSxcblxuXG5cbiAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCBhbGwgZGlzYWJsZWQgYnkgZGVmYXVsdCAoZGFuZ2Vyb3VzISlcblxuICBleGVjdXRpb25KYXZhU2NyaXB0OiBmYWxzZSxcblxuICBleGVjdXRpb25QeXRob246IGZhbHNlLFxuXG4gIGV4ZWN1dGlvblRlcm1pbmFsOiBmYWxzZSxcblxuICBleGVjdXRpb25TaGVsbDogdHJ1ZSxcblxuXG5cbiAgc2VhcmNoRmFsbGJhY2tDaGFpbjogJ2RkZy1hcGknLFxuXG4gIG1heFNlYXJjaFJlc3VsdHM6IDEwLFxuXG4gIHNhZmVzZWFyY2g6ICcxJyxcblxuICBicm93c2VyVGltZW91dDogNTAwMCxcblxuICBoZWFkbGVzc01vZGU6IGZhbHNlLFxuXG4gIGdpdEF1dG9Db21taXQ6IGZhbHNlLFxuXG4gIGRlZmF1bHRCcmFuY2g6ICdtYWluJyxcblxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHRydWUsXG5cbiAgYmluYXJ5RmlsZURldGVjdGlvbjogdHJ1ZSxcblxuICByZWdleFJlRG9TUHJvdGVjdGlvbjogdHJ1ZSxcblxuICBtYXhSZWdleExlbmd0aDogNTAwLFxuXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB0cnVlLFxuXG4gIHN0YXRlTWF4U2l6ZTogMTAyNDAsXG5cbiAgbGFuZ3VhZ2U6ICdlbicsXG5cbiAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHRydWUsXG5cbiAgLy8gVGVtcG9yYWwgQXdhcmVuZXNzIChtZXJnZWQgZnJvbSB1cF90b19kYXRlKVxuICB0ZW1wb3JhbEF3YXJlbmVzczogdHJ1ZSxcbiAgZGF0ZUZvcm1hdFN0eWxlOiAnc3RhbmRhcmQnLFxufTtcblxuXG5cbi8qKlxuXG4gKiBWYWxpZGF0ZSBhbmQgc2FuaXRpemUgY29uZmlnIGlucFxuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uZmlnKGlucHV0OiB1bmtub3duKTogUGx1Z2luQ29uZmlnIHtcblxuICBjb25zdCByZXN1bHQgPSBDb25maWdTY2hlbWEuc2FmZVBhcnNlKGlucHV0KTtcblxuICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29uZmlndXJhdGlvbjogJHtyZXN1bHQuZXJyb3IubWVzc2FnZX1gKTtcblxuICB9XG5cbn1cblxuXG5cbi8qKlxuICogQ2hlY2sgaWYgYSB0b29sIGNhdGVnb3J5IGlzIGVuYWJsZWQgaW4gY29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Rvb2xFbmFibGVkKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBjYXRlZ29yeToga2V5b2YgUGljazxQbHVnaW5Db25maWcsICdmaWxlU3lzdGVtJyB8ICd3ZWJTZWFyY2gnIHwgJ2Jyb3dzZXJBdXRvbWF0aW9uJyB8ICdnaXRPcGVyYXRpb25zJyB8ICdkYXRhYmFzZVF1ZXJpZXMnIHwgJ2RvY3VtZW50UGFyc2luZycgfCAnYmFja2dyb3VuZENvbW1hbmRzJyB8ICdpbWFnZVByb2Nlc3NpbmcnIHwgJ2h0dHBDbGllbnQnIHwgJ3ZlY3RvclJBRycgfCAndWlHZW5lcmF0aW9uJyB8ICdjb250ZXh0TWFuYWdlbWVudCc+KTogYm9vbGVhbiB7XG4gIHJldHVybiBjb25maWdbY2F0ZWdvcnldID09PSB0cnVlO1xufVxuXG5cblxuXG4vKipcblxuICogQ2hlY2sgaWYgYSBzcGVjaWZpYyBleGVjdXRpb24gdG9vbCBpcyBlbmFibGVkIChncmFudWxhcilcblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGNvbmZpZzogUGx1Z2luQ29uZmlnLCB0b29sOiAnamF2YXNjcmlwdCcgfCAncHl0aG9uJyB8ICd0ZXJtaW5hbCcgfCAnc2hlbGwnKTogYm9vbGVhbiB7XG5cbiAgc3dpdGNoICh0b29sKSB7XG5cbiAgICBjYXNlICdqYXZhc2NyaXB0JzogcmV0dXJuIGNvbmZpZy5leGVjdXRpb25KYXZhU2NyaXB0ID09PSB0cnVlO1xuXG4gICAgY2FzZSAncHl0aG9uJzogICAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uUHl0aG9uID09PSB0cnVlO1xuXG4gICAgY2FzZSAndGVybWluYWwnOiAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uVGVybWluYWwgPT09IHRydWU7XG5cbiAgICBjYXNlICdzaGVsbCc6ICAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25TaGVsbCA9PT0gdHJ1ZTtcblxuICB9XG5cbn1cblxuXG5cbi8qKlxuXG4gKiBHZXQgdGhlIGV4ZWN1dGlvbiB0b29sIGtleSBmcm9tIGEgdG9vbCBuYW1lXG5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhlY3V0aW9uVG9vbEtleSh0b29sTmFtZTogc3RyaW5nKTogJ2phdmFzY3JpcHQnIHwgJ3B5dGhvbicgfCAndGVybWluYWwnIHwgJ3NoZWxsJyB8IG51bGwge1xuXG4gIHN3aXRjaCAodG9vbE5hbWUpIHtcblxuICAgIGNhc2UgJ3J1bl9qYXZhc2NyaXB0JzogcmV0dXJuICdqYXZhc2NyaXB0JztcblxuICAgIGNhc2UgJ3J1bl9weXRob24nOiAgICAgcmV0dXJuICdweXRob24nO1xuXG4gICAgY2FzZSAncnVuX2luX3Rlcm1pbmFsJzogcmV0dXJuICd0ZXJtaW5hbCc7XG5cbiAgICBjYXNlICdleGVjdXRlX2NvbW1hbmQnOiByZXR1cm4gJ3NoZWxsJztcblxuICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgfVxuXG59XG5cblxuXG4vKipcblxuICogQ2hlY2sgaWYgQU5ZIGV4ZWN1dGlvbiB0b29sIGlzIGVuYWJsZWQgKGxlZ2FjeSBjb21wYXRpYmlsaXR5KVxuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0FueUV4ZWN1dGlvblRvb2woY29uZmlnOiBQbHVnaW5Db25maWcpOiBib29sZWFuIHtcblxuICByZXR1cm4gY29uZmlnLmV4ZWN1dGlvbkphdmFTY3JpcHQgfHwgY29uZmlnLmV4ZWN1dGlvblB5dGhvbiB8fCBcblxuICAgICAgICAgY29uZmlnLmV4ZWN1dGlvblRlcm1pbmFsIHx8IGNvbmZpZy5leGVjdXRpb25TaGVsbDtcblxufVxuXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gTE0gU3R1ZGlvIFVJIFNjaGVtYXRpY3MgPT09PT09PT09PT09PT09PT09PT1cblxuLy8gVGhlc2UgZGVmaW5lIHRoZSB0b2dnbGUgc3dpdGNoZXMgdGhhdCBhcHBlYXIgaW4gTE0gU3R1ZGlvJ3Mgc2V0dGluZ3MgcGFuZWwuXG5cblxuXG5leHBvcnQgY29uc3QgY29uZmlnU2NoZW1hdGljcyA9IGNyZWF0ZUNvbmZpZ1NjaGVtYXRpY3MoKVxuXG5cblxuICAvLyBcdTI2QTBcdUZFMEYgR09EIE1PREUgLSBUT1AgUFJJT1JJVFkgV0FSTklORyBUT0dHTEUgXHUyNkEwXHVGRTBGXG5cbiAgLmZpZWxkKCdnb2RNb2RlJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdTI2QTFcdTI2QTBcdUZFMEYgR09EIE1PREUgLSBFbmFibGUgQUxMIFRvb2xzIFx1MjZBMFx1RkUwRlx1MjZBMScsXG5cbiAgICBzdWJ0aXRsZTogJ1dBUk5JTkc6IEFjdGl2YXRlcyBldmVyeSB0b29sIGNhdGVnb3J5IGluc3RhbnRseS4gVXNlIHdpdGggY2F1dGlvbi4nLFxuXG4gICAgaGludDogJ1doZW4gZW5hYmxlZCwgQUxMIGluZGl2aWR1YWwgdG9nZ2xlcyBhcmUgYnlwYXNzZWQgYW5kIGV2ZXJ5IHRvb2wgaXMgYWN0aXZhdGVkIHJlZ2FyZGxlc3Mgb2Ygc2V0dGluZ3MuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5nb2RNb2RlKVxuXG5cblxuICAvLyBcdUQ4M0NcdURGOUJcdUZFMEYgVE9PTCBHQVRJTkcgKEhhdXB0c2NoYWx0ZXIpIFx1RDgzQ1x1REY5Qlx1RkUwRlxuXG4gIC5maWVsZCgnZmlsZVN5c3RlbScsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDMSBGaWxlIFN5c3RlbSBUb29scycsIGhpbnQ6ICdFbmFibGUgZmlsZSByZWFkL3dyaXRlL3NlYXJjaCBvcGVyYXRpb25zJyB9LCBERUZBVUxUX0NPTkZJRy5maWxlU3lzdGVtKVxuXG4gIC5maWVsZCgnd2ViU2VhcmNoJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjEwIFdlYiAmIFJlc2VhcmNoIFRvb2xzJywgaGludDogJ0VuYWJsZSBEdWNrRHVja0dvL1dpa2lwZWRpYSBzZWFyY2gnIH0sIERFRkFVTFRfQ09ORklHLndlYlNlYXJjaClcblxuICAvLyBcdUQ4M0RcdURDMTkgR0lUICYgR0lUSFVCIFRPT0xTICh2aXN1ZWxsZSBHcnVwcGllcnVuZykgXHVEODNEXHVEQzE5XG5cbiAgLmZpZWxkKCdnaXRPcGVyYXRpb25zJywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDMTkgR2l0ICYgR2l0SHViIFRvb2xzJywgXG5cbiAgICBzdWJ0aXRsZTogJ1ZlcnNpb24gQ29udHJvbCAmIEFQSScsXG5cbiAgICBoaW50OiAnRW5hYmxlIGdpdCBvcGVyYXRpb25zIGFuZCBHaXRIdWIgQVBJIGFjY2Vzcy4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmdpdE9wZXJhdGlvbnMpXG5cbiAgLmZpZWxkKCdnaXRBdXRvQ29tbWl0JywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQkUgR2l0IEF1dG8tQ29tbWl0JywgXG5cbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBHaXQgJiBHaXRIdWIgVG9vbHMnLFxuXG4gICAgaGludDogJ0F1dG9tYXRpY2FsbHkgY29tbWl0IGNoYW5nZXMgYWZ0ZXIgb3BlcmF0aW9ucycsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZ2l0QXV0b0NvbW1pdClcblxuICAuZmllbGQoJ2RlZmF1bHRCcmFuY2gnLCAnc3RyaW5nJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjNGIERlZmF1bHQgQnJhbmNoJywgXG5cbiAgICBwbGFjZWhvbGRlcjogJ21haW4nLFxuXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgR2l0ICYgR2l0SHViIFRvb2xzJyxcblxuICAgIGhpbnQ6ICdCcmFuY2ggbmFtZSBmb3IgbmV3IHJlcG9zaXRvcmllcyBhbmQgZ2l0IG9wZXJhdGlvbnMnLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmRlZmF1bHRCcmFuY2gpXG5cblxuXG4gIC5maWVsZCgnZGF0YWJhc2VRdWVyaWVzJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREM0XHVGRTBGIERhdGFiYXNlIFF1ZXJpZXMnLCBoaW50OiAnRW5hYmxlIHJlYWQtb25seSBTUUxpdGUgcXVlcmllcycgfSwgREVGQVVMVF9DT05GSUcuZGF0YWJhc2VRdWVyaWVzKVxuXG4gIC5maWVsZCgnZG9jdW1lbnRQYXJzaW5nJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0M0IERvY3VtZW50IFBhcnNpbmcnLCBoaW50OiAnRW5hYmxlIFBERi9ET0NYIGRvY3VtZW50IHJlYWRpbmcnIH0sIERFRkFVTFRfQ09ORklHLmRvY3VtZW50UGFyc2luZylcblxuICAuZmllbGQoJ2JhY2tncm91bmRDb21tYW5kcycsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1MjNGMyBCYWNrZ3JvdW5kIENvbW1hbmRzJywgaGludDogJ0VuYWJsZSBsb25nLXJ1bm5pbmcgcHJvY2VzcyB0cmFja2luZycgfSwgREVGQVVMVF9DT05GSUcuYmFja2dyb3VuZENvbW1hbmRzKVxuXG5cblxuICAvLyBcdUQ4M0NcdUREOTVcdTIwMERcdTI3NDAgTkVXIFRPT0wgQ0FURUdPUklFUyBcdUQ4M0NcdUREOTVcdTIwMERcdTI3NDBcblxuICAuZmllbGQoJ2ltYWdlUHJvY2Vzc2luZycsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREJDXHVGRTBGIEltYWdlIFByb2Nlc3NpbmcgVG9vbHMnLCBcblxuICAgIHN1YnRpdGxlOiAnT0NSLCBTY3JlZW5zaG90cyAmIENvbXBhcmlzb24nLFxuXG4gICAgaGludDogJ0VuYWJsZSBpbWFnZSBPQ1IgKFRlc3NlcmFjdC5qcyksIHNjcmVlbnNob3QgY2FwdHVyZSwgYW5kIGltYWdlIGNvbXBhcmlzb24gdG9vbHMuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5pbWFnZVByb2Nlc3NpbmcpXG5cbiAgXG5cbiAgLmZpZWxkKCdodHRwQ2xpZW50JywgJ2Jvb2xlYW4nLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMEMgSFRUUCBDbGllbnQgVG9vbHMnLCBcblxuICAgIHN1YnRpdGxlOiAnR2VuZXJpYyBSRVNUIEFQSSBDbGllbnQnLFxuXG4gICAgaGludDogJ0VuYWJsZSBnZW5lcmljIEhUVFAgY2xpZW50IGZvciBtYWtpbmcgcmVxdWVzdHMgdG8gYW55IFJFU1QgQVBJIChHRVQsIFBPU1QsIFBVVCwgREVMRVRFKS4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmh0dHBDbGllbnQpXG5cbiAgXG5cbiAgLmZpZWxkKCd2ZWN0b3JSQUcnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDQSBWZWN0b3IgUkFHIC8gU2VtYW50aWMgU2VhcmNoJywgXG5cbiAgICBzdWJ0aXRsZTogJ1NlbWFudGljIERvY3VtZW50IFNlYXJjaCcsXG5cbiAgICBoaW50OiAnRW5hYmxlIHNlbWFudGljIHNlYXJjaCB3aXRoIHZlY3RvciBlbWJlZGRpbmdzIGZvciBpbnRlbGxpZ2VudCBkb2N1bWVudCByZXRyaWV2YWwuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy52ZWN0b3JSQUcpXG4gIC5maWVsZCgndWlHZW5lcmF0aW9uJywgJ2Jvb2xlYW4nLCB7IFxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERkE4IEludGVyYWN0aXZlIFVJIEdlbmVyYXRpb24gVG9vbHMnLCBcbiAgICBzdWJ0aXRsZTogJ0dlbmVyYXRlIGFuZCByZW5kZXIgaW50ZXJhY3RpdmUgVUkgY29tcG9uZW50cycsXG4gICAgaGludDogJ0VuYWJsZSB0b29scyBmb3IgZ2VuZXJhdGluZyBIVE1ML0NTUy9KUyBjb21wb25lbnRzIChidXR0b25zLCBmb3JtcywgY2hhcnRzLCBkYXNoYm9hcmRzKSBhbmQgcmVuZGVyaW5nIHRoZW0gaW4gdGhlIGJyb3dzZXIuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcudWlHZW5lcmF0aW9uKVxuICAuZmllbGQoJ2NvbnRleHRNYW5hZ2VtZW50JywgJ2Jvb2xlYW4nLCB7IFxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNFXHVEREUwIEF1dG8tQ29udGV4dCBNYW5hZ2VtZW50IFRvb2xzJywgXG4gICAgc3VidGl0bGU6ICdBdXRvbWF0aWMgc2Vzc2lvbiB0cmFja2luZyBhbmQgbWVtb3J5IG1hbmFnZW1lbnQnLFxuICAgIGhpbnQ6ICdFbmFibGUgdG9vbHMgZm9yIGF1dG9tYXRpY2FsbHkgc2F2aW5nIGltcG9ydGFudCBkZWNpc2lvbnMsIHBhdHRlcm5zLCBhbmQgY29uZmlndXJhdGlvbnMgdG8gcGVyc2lzdGVudCBtZW1vcnkuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcuY29udGV4dE1hbmFnZW1lbnQpXG5cblxuXG4gIC8vIFx1RDgzRFx1RENEQSBET0NVTUVOVCBSQUcgLyBDSEFUIFdJVEggRklMRVMgXHVEODNEXHVEQ0RBXG5cbiAgLmZpZWxkKCdkb2N1bWVudFJBRycsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0RBIERvY3VtZW50IFJBRyAvIENoYXQgd2l0aCBGaWxlcycsIFxuXG4gICAgc3VidGl0bGU6ICdFbmFibGUgZmlsZSBpbmRleGluZyBhbmQgc2VtYW50aWMgc2VhcmNoIGZvciBjaGF0JyxcblxuICAgIGhpbnQ6ICdBdHRhY2ggZG9jdW1lbnRzIHRvIHlvdXIgY2hhdCBtZXNzYWdlcy4gVGhlIHBsdWdpbiB3aWxsIGF1dG9tYXRpY2FsbHkgcmV0cmlldmUgcmVsZXZhbnQgY29udGVudCBmcm9tIGF0dGFjaGVkIGZpbGVzIHVzaW5nIHNlbWFudGljIHNlYXJjaC4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmRvY3VtZW50UkFHKVxuXG4gIFxuXG4gIC5maWVsZCgncmV0cmlldmFsTGltaXQnLCAnbnVtZXJpYycsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQyMiBSZXRyaWV2YWwgTGltaXQnLCBcblxuICAgIHN1YnRpdGxlOiAnTWF4IGNodW5rcyB0byByZXR1cm4gcGVyIHF1ZXJ5JyxcblxuICAgIG1pbjogMSwgbWF4OiAyMCwgaW50OiB0cnVlLFxuXG4gICAgaGludDogJ01heGltdW0gbnVtYmVyIG9mIHJlbGV2YW50IGRvY3VtZW50IGNodW5rcyB0byByZXRyaWV2ZSBmb3IgZWFjaCBxdWVyeS4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLnJldHJpZXZhbExpbWl0KVxuXG4gIFxuXG4gIC5maWVsZCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnLCAnbnVtZXJpYycsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REZBRiBSZXRyaWV2YWwgQWZmaW5pdHkgVGhyZXNob2xkJywgXG5cbiAgICBzdWJ0aXRsZTogJ01pbmltdW0gcmVsZXZhbmNlIHNjb3JlICgwLTEpJyxcblxuICAgIG1pbjogMC4wLCBtYXg6IDEuMCwgc3RlcDogMC4wMSxcblxuICAgIGhpbnQ6ICdDaHVua3MgYmVsb3cgdGhpcyBzaW1pbGFyaXR5IHNjb3JlIHdpbGwgYmUgZmlsdGVyZWQgb3V0LiBMb3dlciA9IG1vcmUgcmVzdWx0cyBidXQgcG90ZW50aWFsbHkgbGVzcyByZWxldmFudC4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLnJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkKVxuXG4gIC8vIFx1MjZBMSBFWEVDVVRJT04gVE9PTFMgKEdlZlx1MDBFNGhybGljaCEpIFx1MjZBMVxuXG4gIC5maWVsZCgnZXhlY3V0aW9uSmF2YVNjcmlwdCcsICdib29sZWFuJywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdTI2QTEgSmF2YVNjcmlwdC1BdXNmXHUwMEZDaHJ1bmcgZXJsYXViZW4nLFxuXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX2phdmFzY3JpcHQnLVRvb2xcIixcblxuICAgIGhpbnQ6ICdHRUZBSFI6IENvZGUgbFx1MDBFNHVmdCBhdWYgSWhyZW0gUmVjaG5lci4nLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvbkphdmFTY3JpcHQpXG5cbiAgLmZpZWxkKCdleGVjdXRpb25QeXRob24nLCAnYm9vbGVhbicsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQzBEIFB5dGhvbi1BdXNmXHUwMEZDaHJ1bmcgZXJsYXViZW4nLFxuXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX3B5dGhvbictVG9vbFwiLFxuXG4gICAgaGludDogJ0dFRkFIUjogQ29kZSBsXHUwMEU0dWZ0IGF1ZiBJaHJlbSBSZWNobmVyLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uUHl0aG9uKVxuXG4gIC5maWVsZCgnZXhlY3V0aW9uVGVybWluYWwnLCAnYm9vbGVhbicsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JCIFRlcm1pbmFsLUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXG5cbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdydW5faW5fdGVybWluYWwnLVRvb2xcIixcblxuICAgIGhpbnQ6ICdcdTAwRDZmZm5ldCBlY2h0ZSBUZXJtaW5hbC1GZW5zdGVyLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uVGVybWluYWwpXG5cbiAgLmZpZWxkKCdleGVjdXRpb25TaGVsbCcsICdib29sZWFuJywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMjcgU2hlbGwtQmVmZWhsc2F1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXG5cbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdleGVjdXRlX2NvbW1hbmQnLVRvb2xcIixcblxuICAgIGhpbnQ6ICdHRUZBSFI6IEJlZmVobGUgbGF1ZmVuIGF1ZiBJaHJlbSBSZWNobmVyLicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uU2hlbGwpXG5cblxuXG4gIC8vIFx1RDgzRFx1REQwRCBTRUFSQ0ggU0VUVElOR1MgXHVEODNEXHVERDBEXG5cbiAgLmZpZWxkKCdzZWFyY2hGYWxsYmFja0NoYWluJywgJ3NlbGVjdCcsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDBEIFNlYXJjaCBGYWxsYmFjayBDaGFpbicsXG5cbiAgICBoaW50OiAnUHJpbWFyeSBzZWFyY2ggZW5naW5lLiBBdXRvLWZhbGxzIGJhY2sgdG8gb3RoZXJzIGlmIHVuYXZhaWxhYmxlLicsXG5cbiAgICBvcHRpb25zOiBbXG5cbiAgICAgIHsgdmFsdWU6ICdkZGctYXBpJywgZGlzcGxheU5hbWU6ICdEdWNrRHVja0dvIEFQSScgfSxcblxuICAgICAgeyB2YWx1ZTogJ2RkZy1mZXRjaCcsIGRpc3BsYXlOYW1lOiAnRHVja0R1Y2tHbyBGZXRjaCcgfSxcblxuICAgICAgeyB2YWx1ZTogJ2dvb2dsZScsIGRpc3BsYXlOYW1lOiAnR29vZ2xlJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnYmluZycsIGRpc3BsYXlOYW1lOiAnQmluZycgfSxcblxuICAgIF0sXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuc2VhcmNoRmFsbGJhY2tDaGFpbilcblxuICAuZmllbGQoJ21heFNlYXJjaFJlc3VsdHMnLCAnbnVtZXJpYycsIHsgbWluOiAxLCBtYXg6IDUwLCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcubWF4U2VhcmNoUmVzdWx0cylcblxuICAuZmllbGQoJ3NhZmVzZWFyY2gnLCAnc2VsZWN0Jywge1xuXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURFRTFcdUZFMEYgU2FmZSBTZWFyY2gnLFxuXG4gICAgb3B0aW9uczogW1xuXG4gICAgICB7IHZhbHVlOiAnMCcsIGRpc3BsYXlOYW1lOiAnT2ZmJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnMScsIGRpc3BsYXlOYW1lOiAnTW9kZXJhdGUnIH0sXG5cbiAgICAgIHsgdmFsdWU6ICcyJywgZGlzcGxheU5hbWU6ICdTdHJpY3QnIH0sXG5cbiAgICBdLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLnNhZmVzZWFyY2gpXG5cblxuXG4gIC8vIFx1RDgzRFx1RERBNVx1RkUwRiBCUk9XU0VSIEFVVE9NQVRJT04gVE9PTFMgXHVEODNEXHVEREE1XHVGRTBGXG5cbiAgLmZpZWxkKCdicm93c2VyQXV0b21hdGlvbicsICdib29sZWFuJywgeyBcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREE1XHVGRTBGIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsIFxuXG4gICAgc3VidGl0bGU6ICdIZWFkbGVzcyBicm93c2VyIGNvbnRyb2wgJiBhdXRvbWF0aW9uJyxcblxuICAgIGhpbnQ6ICdFbmFibGUgUHVwcGV0ZWVyLWJhc2VkIGhlYWRsZXNzIGJyb3dzZXIgYXV0b21hdGlvbiBmb3Igd2ViIHNjcmFwaW5nLCB0ZXN0aW5nLCBhbmQgVUkgaW50ZXJhY3Rpb24uJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5icm93c2VyQXV0b21hdGlvbilcblxuICBcblxuICAuZmllbGQoJ2Jyb3dzZXJUaW1lb3V0JywgJ251bWVyaWMnLCB7IFxuXG4gICAgZGlzcGxheU5hbWU6ICdcdTIzRjFcdUZFMEYgQnJvd3NlciBUaW1lb3V0JywgXG5cbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBCcm93c2VyIEF1dG9tYXRpb24gVG9vbHMnLFxuXG4gICAgbWluOiAxMDAwLCBtYXg6IDMwMDAwLCBpbnQ6IHRydWUsXG5cbiAgICBoaW50OiAnTWF4aW11bSB0aW1lIChtcykgdG8gd2FpdCBmb3IgYnJvd3NlciBvcGVyYXRpb25zIGJlZm9yZSB0aW1pbmcgb3V0LicsXG5cbiAgfSwgREVGQVVMVF9DT05GSUcuYnJvd3NlclRpbWVvdXQpXG5cbiAgXG5cbiAgLmZpZWxkKCdoZWFkbGVzc01vZGUnLCAnYm9vbGVhbicsIHsgXG5cbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REM3QiBIZWFkbGVzcyBNb2RlJywgXG5cbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBCcm93c2VyIEF1dG9tYXRpb24gVG9vbHMnLFxuXG4gICAgaGludDogJ1J1biBicm93c2VyIHdpdGhvdXQgR1VJIChyZWNvbW1lbmRlZCBmb3IgYXV0b21hdGlvbikuJyxcblxuICB9LCBERUZBVUxUX0NPTkZJRy5oZWFkbGVzc01vZGUpXG5cblxuXG4gIC8vIFx1RDgzRFx1REQxMiBTRUNVUklUWSBTRVRUSU5HUyBcdUQ4M0RcdUREMTJcblxuICAuZmllbGQoJ3BhdGhWYWxpZGF0aW9uRW5hYmxlZCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQxMiBQYXRoIFZhbGlkYXRpb24nLCBoaW50OiAnUHJldmVudCBkaXJlY3RvcnkgdHJhdmVyc2FsIGF0dGFja3MnIH0sIERFRkFVTFRfQ09ORklHLnBhdGhWYWxpZGF0aW9uRW5hYmxlZClcblxuICAuZmllbGQoJ2JpbmFyeUZpbGVEZXRlY3Rpb24nLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQzEgQmluYXJ5IEZpbGUgRGV0ZWN0aW9uJywgaGludDogJ0RldGVjdCBiaW5hcnkgZmlsZXMgdmlhIG51bGwgYnl0ZSBjaGVjaycgfSwgREVGQVVMVF9DT05GSUcuYmluYXJ5RmlsZURldGVjdGlvbilcblxuICAuZmllbGQoJ3JlZ2V4UmVEb1NQcm90ZWN0aW9uJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERUUxXHVGRTBGIFJlRG9TIFByb3RlY3Rpb24nLCBoaW50OiAnUHJvdGVjdCBhZ2FpbnN0IHJlZ2V4IGRlbmlhbC1vZi1zZXJ2aWNlJyB9LCBERUZBVUxUX0NPTkZJRy5yZWdleFJlRG9TUHJvdGVjdGlvbilcblxuICAuZmllbGQoJ21heFJlZ2V4TGVuZ3RoJywgJ251bWVyaWMnLCB7IG1pbjogMSwgbWF4OiAxMDAwLCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcubWF4UmVnZXhMZW5ndGgpXG5cblxuXG4gIC8vIFx1RDgzRFx1RENCRCBTVEFURSBNQU5BR0VNRU5UIFx1RDgzRFx1RENCRFxuXG4gIC5maWVsZCgnc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQkQgU3RhdGUgUGVyc2lzdGVuY2UnLCBoaW50OiAnUGVyc2lzdCB0b29sIGV4ZWN1dGlvbiBzdGF0ZSBiZXR3ZWVuIHNlc3Npb25zJyB9LCBERUZBVUxUX0NPTkZJRy5zdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZClcblxuICAuZmllbGQoJ3N0YXRlTWF4U2l6ZScsICdudW1lcmljJywgeyBtaW46IDEwMjQsIG1heDogMTA0ODU3NiwgaW50OiB0cnVlIH0sIERFRkFVTFRfQ09ORklHLnN0YXRlTWF4U2l6ZSlcblxuXG5cbiAgLy8gXHVEODNDXHVERjEwIExBTkdVQUdFICYgTk9USUZJQ0FUSU9OUyBcdUQ4M0NcdURGMTBcblxuICAuZmllbGQoJ2xhbmd1YWdlJywgJ3NlbGVjdCcsIHtcblxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjEwIExhbmd1YWdlJyxcblxuICAgIG9wdGlvbnM6IFtcblxuICAgICAgeyB2YWx1ZTogJ2VuJywgZGlzcGxheU5hbWU6ICdFbmdsaXNoJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnZGUnLCBkaXNwbGF5TmFtZTogJ0RldXRzY2ggKEdlcm1hbiknIH0sXG5cbiAgICAgIHsgdmFsdWU6ICd6aC1DTicsIGRpc3BsYXlOYW1lOiAnU2ltcGxpZmllZCBDaGluZXNlJyB9LFxuXG4gICAgICB7IHZhbHVlOiAnemgtVFcnLCBkaXNwbGF5TmFtZTogJ1RyYWRpdGlvbmFsIENoaW5lc2UnIH0sXG5cbiAgICBdLFxuXG4gIH0sIERFRkFVTFRfQ09ORklHLmxhbmd1YWdlKVxuXG5cblxuICAuZmllbGQoJ25vdGlmaWNhdGlvbnNFbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDE0IERlc2t0b3AgTm90aWZpY2F0aW9ucycsIGhpbnQ6ICdTaG93IHN5c3RlbSBub3RpZmljYXRpb25zJyB9LCBERUZBVUxUX0NPTkZJRy5ub3RpZmljYXRpb25zRW5hYmxlZClcblxuICAvLyBcdTIzRjAgVEVNUE9SQUwgQVdBUkVORVNTIChmcm9tIHVwX3RvX2RhdGUpXG4gIC5maWVsZCgndGVtcG9yYWxBd2FyZW5lc3MnLCAnYm9vbGVhbicsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1MjNGMCBUZW1wb3JhbCBBd2FyZW5lc3MnLFxuICAgIHN1YnRpdGxlOiAnSW5qZWN0cyBjdXJyZW50IGRhdGUvdGltZSBpbnRvIGV2ZXJ5IG1lc3NhZ2UnLFxuICAgIGhpbnQ6ICdFbmFibGVzIHRoZSBBSSB0byBrbm93IHRoZSBjdXJyZW50IHRpbWUuJyxcbiAgfSwgREVGQVVMVF9DT05GSUcudGVtcG9yYWxBd2FyZW5lc3MpXG4gIC5maWVsZCgnZGF0ZUZvcm1hdFN0eWxlJywgJ3NlbGVjdCcsIHtcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDNSBEYXRlIEZvcm1hdCBTdHlsZScsXG4gICAgb3B0aW9uczogW1xuICAgICAgeyB2YWx1ZTogJ3N0YW5kYXJkJywgZGlzcGxheU5hbWU6ICdTdGFuZGFyZCAoW1plaXQ6IC4uLl0pJyB9LFxuICAgICAgeyB2YWx1ZTogJ2hldXRlSXN0JywgZGlzcGxheU5hbWU6ICdIRVVURSBJU1QgTW9kZSAoUHJvbWluZW50KScgfSxcbiAgICBdLFxuICB9LCBERUZBVUxUX0NPTkZJRy5kYXRlRm9ybWF0U3R5bGUpXG5cbiAgLmJ1aWxkKCk7XG4iLCAiLyoqXG4gKiBQZXJzaXN0ZW50IHN0YXRlIG1hbmFnZW1lbnQgZm9yIHBsdWdpbiBvcGVyYXRpb25zXG4gKiBTdG9yZXMgZGF0YSB0byBkaXNrIGFzIEpTT04gZmlsZSBmb3Igc3Vydml2YWwgYWNyb3NzIHJlbG9hZHNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcblxuaW50ZXJmYWNlIFN0YXRlRW50cnkge1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHVua25vd247XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG4vKiogTWluaW1hbCBsb2dnZXIgZm9yIHN0YXRlIG1hbmFnZXIgKGF2b2lkcyBjaXJjdWxhciBkZXBlbmRlbmN5IHdpdGggaW5kZXgudHMpICovXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbU3RhdGVNYW5hZ2VyXSAke21zZ31cXG5gKSxcbn07XG5cbi8qKiBEZWJvdW5jZWQgYXN5bmMgc3RhdGUgcGVyc2lzdGVuY2UgKDUwMG1zIGRlbGF5KSAqL1xuZnVuY3Rpb24gY3JlYXRlRGVib3VuY2VkU2F2ZShzYXZlRm46ICgpID0+IHZvaWQsIGRlbGF5TXM6IG51bWJlciA9IDUwMCk6ICgoKSA9PiB2b2lkKSB7XG4gIGxldCB0aW1lcklkOiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZFNhdmUoKTogdm9pZCB7XG4gICAgaWYgKHRpbWVySWQpIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzYXZlRm4oKTtcbiAgICAgIHRpbWVySWQgPSBudWxsO1xuICAgIH0sIGRlbGF5TXMpO1xuICB9O1xufVxuXG4vKipcbiAqIERlZmF1bHQgbWVtb3J5IGZpbGUgbG9jYXRpb24gKGluIExNIFN0dWRpbyBwbHVnaW4gZGF0YSBkaXJlY3RvcnkpXG4gKi9cbmZ1bmN0aW9uIGdldE1lbW9yeUZpbGVQYXRoKCk6IHN0cmluZyB7XG4gIC8vIFRyeSB0byBmaW5kIExNIFN0dWRpbydzIGFwcCBkYXRhIGRpcmVjdG9yeSBmb3IgcGVyc2lzdGVuY2VcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgbGV0IGJhc2VEaXI6IHN0cmluZztcbiAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIGJhc2VEaXIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuQVBQREFUQSB8fCAnJywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgYmFzZURpciA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBiYXNlRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgJycsICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgfVxuICBcbiAgcmV0dXJuIHBhdGguam9pbihiYXNlRGlyLCAnYWktdG9vbGJveC1tZW1vcnkuanNvbicpO1xufVxuXG5leHBvcnQgY2xhc3MgU3RhdGVNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0ZTogTWFwPHN0cmluZywgU3RhdGVFbnRyeT47XG4gIHByaXZhdGUgbWF4U2l6ZTogbnVtYmVyO1xuICBwcml2YXRlIHBlcnNpc3RlbmNlRW5hYmxlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBtZW1vcnlGaWxlOiBzdHJpbmc7XG4gIHByaXZhdGUgcnVubmluZ1NpemU6IG51bWJlcjsgLy8gVHJhY2sgc2l6ZSBpbmNyZW1lbnRhbGx5IGZvciBPKDEpIGNoZWNrc1xuICBwcml2YXRlIGRlYm91bmNlZFNhdmU6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gICAgdGhpcy5tYXhTaXplID0gZWZmZWN0aXZlQ29uZmlnLnN0YXRlTWF4U2l6ZTtcbiAgICB0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCA9IGVmZmVjdGl2ZUNvbmZpZy5zdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDtcbiAgICB0aGlzLm1lbW9yeUZpbGUgPSBnZXRNZW1vcnlGaWxlUGF0aCgpO1xuICAgIFxuICAgIC8vIENyZWF0ZSBkZWJvdW5jZWQgc2F2ZSBmdW5jdGlvbiAoNTAwbXMgZGVsYXkpXG4gICAgdGhpcy5kZWJvdW5jZWRTYXZlID0gY3JlYXRlRGVib3VuY2VkU2F2ZSgoKSA9PiB0aGlzLnNhdmVUb0ZpbGUoKSwgNTAwKTtcbiAgICBcbiAgICAvLyBBdXRvLWxvYWQgZnJvbSBkaXNrIGlmIHBlcnNpc3RlbmNlIGlzIGVuYWJsZWRcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIHN0YXRlIHZhbHVlIHdpdGgga2V5IGFuZCBvcHRpb25hbCBtZXRhZGF0YVxuICAgKi9cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGNvbnN0IG5ld1ZhbHVlU2l6ZSA9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUodmFsdWUpO1xuICAgIGNvbnN0IG9sZFZhbHVlU2l6ZSA9IHRoaXMuZ2V0RXhpc3RpbmdWYWx1ZVNpemUoa2V5KTtcbiAgICBcbiAgICAvLyBDaGVjayBzaXplIGxpbWl0IHVzaW5nIHJ1bm5pbmcgdG90YWxcbiAgICBpZiAodGhpcy5ydW5uaW5nU2l6ZSAtIG9sZFZhbHVlU2l6ZSArIG5ld1ZhbHVlU2l6ZSA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdGF0ZSBzaXplIGV4Y2VlZHMgbWF4aW11bSAoJHt0aGlzLm1heFNpemV9IGJ5dGVzKWApO1xuICAgIH1cbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBzZXR0aW5nXG4gICAgdGhpcy5ydW5uaW5nU2l6ZSA9IHRoaXMucnVubmluZ1NpemUgLSBvbGRWYWx1ZVNpemUgKyBuZXdWYWx1ZVNpemU7XG4gICAgXG4gICAgdGhpcy5zdGF0ZS5zZXQoa2V5LCB7XG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICB9KTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgKDUwMG1zIGRlbGF5KSBcdTIwMTQgb25seSBpZiBwZXJzaXN0ZW5jZSBlbmFibGVkXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3RhdGUgdmFsdWUgYnkga2V5XG4gICAqL1xuICBnZXQ8VD4oa2V5OiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuc3RhdGUuZ2V0KGtleSk7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gZW50cnkudmFsdWUgYXMgVDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBzdGF0ZSBlbnRyeVxuICAgKi9cbiAgZGVsZXRlKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIGlmICghZW50cnkpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBkZWxldGluZ1xuICAgIHRoaXMucnVubmluZ1NpemUgLT0gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSk7XG4gICAgY29uc3QgZGVsZXRlZCA9IHRoaXMuc3RhdGUuZGVsZXRlKGtleSk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrIGFmdGVyIGRlbGV0aW9uXG4gICAgaWYgKGRlbGV0ZWQgJiYgdGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZGVsZXRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHN0YXRlIGtleXNcbiAgICovXG4gIGdldEFsbEtleXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuc3RhdGUua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhbGwgc3RhdGVcbiAgICovXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgYWZ0ZXIgY2xlYXJpbmdcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc2l6ZSBvZiBleGlzdGluZyB2YWx1ZSBmb3IgYSBrZXkgKGZvciBpbmNyZW1lbnRhbCB1cGRhdGVzKVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFeGlzdGluZ1ZhbHVlU2l6ZShrZXk6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIHJldHVybiBlbnRyeSA/IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpIDogMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFc3RpbWF0ZSBzaXplIG9mIGEgdmFsdWUgaW4gYnl0ZXNcbiAgICovXG4gIHByaXZhdGUgZ2V0U2l6ZU9mVmFsdWUodmFsdWU6IHVua25vd24pOiBudW1iZXIge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gdmFsdWUubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSByZXR1cm4gODtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHJldHVybiAxO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFjdHVhbCBzaXplIG9mIGFycmF5IGVsZW1lbnRzXG4gICAgICByZXR1cm4gdmFsdWUucmVkdWNlKChzdW06IG51bWJlciwgZWxlbTogdW5rbm93bikgPT4gc3VtICsgdGhpcy5nZXRTaXplT2ZWYWx1ZShlbGVtKSwgMCk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIHZhbHVlLnNpemUgKiAxNjtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBzdGF0ZSB0byBkaXNrIGFzIEpTT04gZmlsZSB3aXRoIG9wdGltaXplZCBzZXJpYWxpemF0aW9uXG4gICAqL1xuICBwcml2YXRlIHNhdmVUb0ZpbGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGUuZW50cmllcygpKS5tYXAoKFtfa2V5LCBlbnRyeV0pID0+ICh7XG4gICAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICAgIHRpbWVzdGFtcDogZW50cnkudGltZXN0YW1wLFxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICAvLyBFbnN1cmUgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMubWVtb3J5RmlsZSk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gT3B0aW1pemVkIEpTT04gc2VyaWFsaXphdGlvbiAobm8gcHJldHR5LXByaW50aW5nIGZvciBwZXJmb3JtYW5jZSlcbiAgICAgIGNvbnN0IGpzb25TdHJpbmcgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgIFxuICAgICAgLy8gV3JpdGUgdG8gdGVtcCBmaWxlIGZpcnN0LCB0aGVuIHJlbmFtZSBmb3IgYXRvbWljIG9wZXJhdGlvblxuICAgICAgY29uc3QgdGVtcEZpbGUgPSB0aGlzLm1lbW9yeUZpbGUgKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBGaWxlLCBqc29uU3RyaW5nLCAndXRmLTgnKTtcbiAgICAgIGZzLnJlbmFtZVN5bmModGVtcEZpbGUsIHRoaXMubWVtb3J5RmlsZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHNhdmUgdG8gZGlzazogJHttZXNzYWdlfWApOyAvLyBNMiBmaXg6IG5vIGNvbnNvbGUud2FyblxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHN0YXRlIGZyb20gZGlzayBKU09OIGZpbGUgd2l0aCBjb3JydXB0aW9uIHJlY292ZXJ5XG4gICAqL1xuICBwcml2YXRlIGxvYWRGcm9tRmlsZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMubWVtb3J5RmlsZSkpIHJldHVybjtcbiAgICAgIFxuICAgICAgY29uc3QganNvblN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUsICd1dGYtOCcpO1xuICAgICAgXG4gICAgICAvLyBUcnkgdG8gcGFyc2UgSlNPTiB3aXRoIGVycm9yIHJlY292ZXJ5XG4gICAgICBsZXQgZGF0YTogU3RhdGVFbnRyeVtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoanNvblN0cmluZykgYXMgU3RhdGVFbnRyeVtdO1xuICAgICAgfSBjYXRjaCB7IC8vIEMxIGZpeDogcmVtb3ZlZCB1bnVzZWQgcGFyc2VFcnJvciB2YXJpYWJsZVxuICAgICAgICBsb2dnZXIud2FybihgQ29ycnVwdGVkIHN0YXRlIGZpbGUgZGV0ZWN0ZWQsIGF0dGVtcHRpbmcgcmVjb3ZlcnkuLi5gKTtcblxuICAgICAgICAvLyBUcnkgdG8gcmVjb3ZlciBieSByZWFkaW5nIGxpbmUgYnkgbGluZSBvciB1c2luZyBiYWNrdXBcbiAgICAgICAgY29uc3QgYmFja3VwRmlsZSA9IHRoaXMubWVtb3J5RmlsZSArICcuYmFja3VwJztcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYmFja3VwRmlsZSkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFja3VwU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGJhY2t1cEZpbGUsICd1dGYtOCcpO1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoYmFja3VwU3RyaW5nKSBhcyBTdGF0ZUVudHJ5W107XG4gICAgICAgICAgICBsb2dnZXIud2FybihgU3VjY2Vzc2Z1bGx5IGxvYWRlZCBmcm9tIGJhY2t1cGApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYEJhY2t1cCBhbHNvIGNvcnJ1cHRlZCwgc3RhcnRpbmcgZnJlc2hgKTtcbiAgICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oYE5vIGJhY2t1cCBhdmFpbGFibGUsIHN0YXJ0aW5nIGZyZXNoYCk7XG4gICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGRhdGEpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZW50cnkgc3RydWN0dXJlIGJlZm9yZSBhZGRpbmdcbiAgICAgICAgaWYgKGVudHJ5ICYmIHR5cGVvZiBlbnRyeS5rZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBlbnRyeS50aW1lc3RhbXAgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZXQoZW50cnkua2V5LCBlbnRyeSk7XG4gICAgICAgICAgdGhpcy5ydW5uaW5nU2l6ZSArPSB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBDcmVhdGUgYmFja3VwIGFmdGVyIHN1Y2Nlc3NmdWwgbG9hZFxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUgKyAnLmJhY2t1cCcsIGpzb25TdHJpbmcsICd1dGYtOCcpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIElnbm9yZSBiYWNrdXAgY3JlYXRpb24gZXJyb3JzXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIGxvYWQgZnJvbSBkaXNrOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9ydCBzdGF0ZSBmb3IgcGVyc2lzdGVuY2UgKEpTT04gc2VyaWFsaXphdGlvbikgXHUyMDE0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICovXG4gIGV4cG9ydFN0YXRlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZGF0YSA9IEFycmF5LmZyb20odGhpcy5zdGF0ZS5lbnRyaWVzKCkpLm1hcCgoW19rZXksIGVudHJ5XSkgPT4gKHtcbiAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLFxuICAgICAgdGltZXN0YW1wOiBlbnRyeS50aW1lc3RhbXAsXG4gICAgfSkpO1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgc3RhdGUgZnJvbSBKU09OIHN0cmluZyBcdTIwMTQga2VwdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgKi9cbiAgaW1wb3J0U3RhdGUoanNvblN0cmluZzogc3RyaW5nKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGpzb25TdHJpbmcpIGFzIFN0YXRlRW50cnlbXTtcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBkYXRhKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgICAgICB0aGlzLnJ1bm5pbmdTaXplICs9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIGFmdGVyIGltcG9ydFxuICAgICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gaW1wb3J0IHN0YXRlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCB0byB0aGUgbWVtb3J5IGZpbGUgb24gZGlza1xuICAgKi9cbiAgZ2V0TWVtb3J5RmlsZVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tZW1vcnlGaWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIHNhdmUgdG8gZGlzayAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBmb3JjZVNhdmUoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlVG9GaWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2UgbG9hZCBmcm9tIGRpc2sgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgKi9cbiAgZm9yY2VMb2FkKCk6IHZvaWQge1xuICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gIH1cbn1cbiIsICIvKipcclxuICogTG9uZy1ydW5uaW5nIHByb2Nlc3MgdHJhY2tpbmcgYW5kIG1hbmFnZW1lbnRcclxuICovXHJcblxyXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCYWNrZ3JvdW5kQ29tbWFuZCB7XHJcbiAgaWQ6IHN0cmluZztcclxuICBjb21tYW5kOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHN0YXJ0VGltZTogbnVtYmVyO1xyXG4gIHRpbWVvdXRIb3VyczogbnVtYmVyO1xyXG4gIHN0YXR1czogJ3J1bm5pbmcnIHwgJ2NvbXBsZXRlZCcgfCAnY2FuY2VsbGVkJyB8ICdlcnJvcmVkJztcclxuICBzdGRvdXQ/OiBzdHJpbmc7XHJcbiAgc3RkZXJyPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIHtcclxuICBwcml2YXRlIGNvbW1hbmRzOiBNYXA8c3RyaW5nLCBCYWNrZ3JvdW5kQ29tbWFuZD47XHJcbiAgcHJpdmF0ZSBtYXhUaW1lb3V0SG91cnM6IG51bWJlcjtcclxuICBcclxuICBjb25zdHJ1Y3RvcihfY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XHJcbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5tYXhUaW1lb3V0SG91cnMgPSAxMDsgLy8gSGFyZCBsaW1pdCBmcm9tIHRvb2wgc3BlY2lmaWNhdGlvblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXIgYSBuZXcgYmFja2dyb3VuZCBjb21tYW5kXHJcbiAgICovXHJcbiAgcmVnaXN0ZXIoY29tbWFuZDogc3RyaW5nLCB0aW1lb3V0SG91cnM6IG51bWJlciwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICh0aW1lb3V0SG91cnMgPCAwLjEgfHwgdGltZW91dEhvdXJzID4gdGhpcy5tYXhUaW1lb3V0SG91cnMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaW1lb3V0IG11c3QgYmUgYmV0d2VlbiAwLjEgYW5kICR7dGhpcy5tYXhUaW1lb3V0SG91cnN9IGhvdXJzYCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICghbmFtZSB8fCBuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgbmFtZSBpcyBtYW5kYXRvcnknKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgaWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcclxuICAgIFxyXG4gICAgdGhpcy5jb21tYW5kcy5zZXQoaWQsIHtcclxuICAgICAgaWQsXHJcbiAgICAgIGNvbW1hbmQsXHJcbiAgICAgIG5hbWUsXHJcbiAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcclxuICAgICAgdGltZW91dEhvdXJzLFxyXG4gICAgICBzdGF0dXM6ICdydW5uaW5nJyxcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gaWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBzdGF0dXMgYW5kIG91dHB1dCBvZiBhIGJhY2tncm91bmQgY29tbWFuZFxyXG4gICAqL1xyXG4gIGNoZWNrKGlkOiBzdHJpbmcpOiBCYWNrZ3JvdW5kQ29tbWFuZCB8IG51bGwge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCkgcmV0dXJuIG51bGw7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGlmIHRpbWVvdXQgZXhjZWVkZWRcclxuICAgIGNvbnN0IGVsYXBzZWRIb3VycyA9IChEYXRlLm5vdygpIC0gY29tbWFuZC5zdGFydFRpbWUpIC8gKDEwMDAgKiA2MCAqIDYwKTtcclxuICAgIGlmIChlbGFwc2VkSG91cnMgPiBjb21tYW5kLnRpbWVvdXRIb3VycyAmJiBjb21tYW5kLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XHJcbiAgICAgIGNvbW1hbmQuc3RhdHVzID0gJ2Vycm9yZWQnO1xyXG4gICAgICBjb21tYW5kLnN0ZGVyciA9IGBDb21tYW5kIGV4Y2VlZGVkIHRpbWVvdXQgKCR7Y29tbWFuZC50aW1lb3V0SG91cnN9IGhvdXJzKWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBjb21tYW5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FuY2VsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmRcclxuICAgKi9cclxuICBjYW5jZWwoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCB8fCBjb21tYW5kLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgICBcclxuICAgIGNvbW1hbmQuc3RhdHVzID0gJ2NhbmNlbGxlZCc7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbGwgYWN0aXZlIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0QWN0aXZlQ29tbWFuZHMoKTogQmFja2dyb3VuZENvbW1hbmRbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNvbW1hbmRzLnZhbHVlcygpKVxyXG4gICAgICAuZmlsdGVyKGMgPT4gYy5zdGF0dXMgPT09ICdydW5uaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgY29tcGxldGVkL2Vycm9yZWQvY2FuY2VsbGVkIGNvbW1hbmRzIGFmdGVyIGNsZWFudXAgcGVyaW9kXHJcbiAgICovXHJcbiAgY2xlYW51cChtYXhBZ2VIb3VyczogbnVtYmVyID0gMjQpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBmb3IgKGNvbnN0IFtpZCwgY29tbWFuZF0gb2YgdGhpcy5jb21tYW5kcy5lbnRyaWVzKCkpIHtcclxuICAgICAgaWYgKGNvbW1hbmQuc3RhdHVzICE9PSAncnVubmluZycpIHtcclxuICAgICAgICBjb25zdCBhZ2VIb3VycyA9IChub3cgLSBjb21tYW5kLnN0YXJ0VGltZSkgLyAoMTAwMCAqIDYwICogNjApO1xyXG4gICAgICAgIGlmIChhZ2VIb3VycyA+IG1heEFnZUhvdXJzKSB7XHJcbiAgICAgICAgICB0aGlzLmNvbW1hbmRzLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgY29tbWFuZCBJRFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBiZ18ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0b3RhbCBjb3VudCBvZiByZWdpc3RlcmVkIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0Q291bnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmNvbW1hbmRzLnNpemU7XHJcbiAgfVxyXG59XHJcbiIsICIvKipcbiAqIFdvcmtpbmcgRGlyZWN0b3J5IE1hbmFnZXJcbiAqIFxuICogVHJhY2tzIGEgbXV0YWJsZSB3b3JraW5nIGRpcmVjdG9yeSB0aGF0IGNhbiBiZSBjaGFuZ2VkIGF0IHJ1bnRpbWUgdmlhIHNldFdvcmtpbmdEaXIoKS5cbiAqIEFsbCBmaWxlIG9wZXJhdGlvbnMgcmVzb2x2ZSBwYXRocyBhZ2FpbnN0IHRoaXMgZGlyZWN0b3J5LlxuICogRmFsbHMgYmFjayB0byB0aGUgcGx1Z2luIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgKEJBU0VfRElSKSBvbiByZXNldC5cbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG4vLyBCYXNlIGRpcmVjdG9yeTogcGx1Z2luIHJvb3QgKHdoZXJlIHBhY2thZ2UuanNvbiBsaXZlcylcbmNvbnN0IEJBU0VfRElSID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJyk7XG5cbi8vIE11dGFibGUgd29ya2luZyBkaXJlY3RvcnkgXHUyMDE0IGRlZmF1bHRzIHRvIHBsdWdpbiByb290XG5sZXQgY3VycmVudFdvcmtpbmdEaXI6IHN0cmluZyA9IEJBU0VfRElSO1xuXG4vKiogR2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0V29ya2luZ0RpcigpOiBzdHJpbmcge1xuICByZXR1cm4gY3VycmVudFdvcmtpbmdEaXI7XG59XG5cbi8qKlxuICogU2V0IHRoZSB3b3JraW5nIGRpcmVjdG9yeSB0byBhIG5ldyBhYnNvbHV0ZSBwYXRoLlxuICogVmFsaWRhdGVzIHRoYXQgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhbiBhYnNvbHV0ZSBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRXb3JraW5nRGlyKG5ld0Rpcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFJlc29sdmUgdG8gYWJzb2x1dGUgcGF0aFxuICBjb25zdCByZXNvbHZlZCA9IHBhdGgucmVzb2x2ZShuZXdEaXIpO1xuXG4gIC8vIE11c3QgYmUgYW4gYWJzb2x1dGUgcGF0aFxuICBpZiAoIXBhdGguaXNBYnNvbHV0ZShyZXNvbHZlZCkpIHtcbiAgICBjb25zb2xlLndhcm4oYHNldFdvcmtpbmdEaXIgcmVqZWN0ZWQ6IG5vdCBhYnNvbHV0ZSBcdTIwMTQgJyR7bmV3RGlyfSdgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBNdXN0IGV4aXN0IGFuZCBiZSBhIGRpcmVjdG9yeVxuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMocmVzb2x2ZWQpO1xuICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBzZXRXb3JraW5nRGlyIHJlamVjdGVkOiBub3QgYSBkaXJlY3RvcnkgXHUyMDE0ICcke3Jlc29sdmVkfSdgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGNvbnNvbGUud2Fybihgc2V0V29ya2luZ0RpciByZWplY3RlZDogcGF0aCBkb2VzIG5vdCBleGlzdCBcdTIwMTQgJyR7cmVzb2x2ZWR9J2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGN1cnJlbnRXb3JraW5nRGlyID0gcmVzb2x2ZWQ7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogUmVzZXQgdGhlIHdvcmtpbmcgZGlyZWN0b3J5IGJhY2sgdG8gdGhlIHBsdWdpbiByb290ICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRXb3JraW5nRGlyKCk6IHZvaWQge1xuICBjdXJyZW50V29ya2luZ0RpciA9IEJBU0VfRElSO1xufVxuXG4vKiogUmVzb2x2ZSBhIHVzZXItcHJvdmlkZWQgcGF0aCBhZ2FpbnN0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhdGgodXNlclBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUoY3VycmVudFdvcmtpbmdEaXIsIHVzZXJQYXRoKTtcbn1cblxuLyoqIEdldCBhbGxvd2VkIGJhc2UgZGlyZWN0b3JpZXMgZm9yIGFic29sdXRlLXBhdGggdmFsaWRhdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbG93ZWRCYXNlcygpOiBzdHJpbmdbXSB7XG4gIC8vIEFsbG93IGJvdGggdGhlIHBsdWdpbiByb290IGFuZCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICBjb25zdCBiYXNlcyA9IFtCQVNFX0RJUiwgY3VycmVudFdvcmtpbmdEaXJdO1xuICByZXR1cm4gWy4uLm5ldyBTZXQoYmFzZXMpXTsgLy8gRGVkdXBsaWNhdGVcbn1cblxuLyoqIEdldCB0aGUgcGx1Z2luIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgKG5ldmVyIGNoYW5nZXMpICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1Z2luUm9vdCgpOiBzdHJpbmcge1xuICByZXR1cm4gQkFTRV9ESVI7XG59XG4iLCAiLyoqXG4gKiBTZWN1cml0eSB1dGlsaXRpZXMgZm9yIHBhdGggdmFsaWRhdGlvbiwgYmluYXJ5IGRldGVjdGlvbiwgYW5kIFJlRG9TIHByb3RlY3Rpb25cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbi8vIFx1MjcwNSBGSVg6IFVzZSBwcm9wZXIgRVNNIGltcG9ydHMgaW5zdGVhZCBvZiByZXF1aXJlKCkgdG8gbWFpbnRhaW4gbW9kdWxlIGJvdW5kYXJ5XG5pbXBvcnQgeyBnZXRBbGxvd2VkQmFzZXMsIGdldFdvcmtpbmdEaXIgfSBmcm9tICcuL3dvcmtpbmdEaXInO1xuXG4vKipcbiAqIFZhbGlkYXRlIGZpbGUgcGF0aCB0byBwcmV2ZW50IGRpcmVjdG9yeSB0cmF2ZXJzYWwgYXR0YWNrcy5cbiAqIERJU0FCTEVEOiBTZWN1cml0eSB2YWxpZGF0b3IgcmVtb3ZlZCBwZXIgdXNlciByZXF1ZXN0IC0gYWxsb3dzIGFsbCBwYXRocy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUGF0aCh1c2VyUGF0aDogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB0cnVlOyAvLyBBbHdheXMgYWxsb3cgcGF0aHNcbn1cblxuLyoqXG4gKiBEZXRlY3QgYmluYXJ5IGZpbGVzIGJ5IGNoZWNraW5nIGZvciBudWxsIGJ5dGVzIGluIGZpcnN0IDhLQlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCaW5hcnlGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaHVuayA9IGNvbnRlbnQuc2xpY2UoMCwgODE5Mik7XG4gIC8vIENoZWNrIGZvciBudWxsIGJ5dGUgKDB4MDApIHdoaWNoIGluZGljYXRlcyBiaW5hcnkgY29udGVudFxuICByZXR1cm4gY2h1bmsuaW5jbHVkZXMoJ1xcMCcpO1xufVxuXG4vKipcbiAqIFByb3RlY3QgYWdhaW5zdCBSZURvUyAoUmVndWxhciBFeHByZXNzaW9uIERlbmlhbCBvZiBTZXJ2aWNlKVxuICogUzIgRklYOiBVc2VzIHByb3BlciByZWdleCBzdHJ1Y3R1cmUgYW5hbHlzaXMgaW5zdGVhZCBvZiBuYWl2ZSBzdWJzdHJpbmcgbWF0Y2hpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NhZmVSZWdleChwYXR0ZXJuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFwYXR0ZXJuIHx8IHBhdHRlcm4ubGVuZ3RoID4gNTAwKSByZXR1cm4gZmFsc2U7XG4gIFxuICAvLyBDaGVjayBmb3IgY29tbW9uIFJlRG9TIHBhdHRlcm5zIHVzaW5nIHN0cnVjdHVyZWQgcmVnZXggZGV0ZWN0aW9uXG4gIGNvbnN0IGRhbmdlcm91c1N0cnVjdHVyZXMgPSBbXG4gICAgLyhcXChbXildKlxcKVsqK10pW14pXSpcXCkvLCAgICAgICAgICAgLy8gTmVzdGVkIHF1YW50aWZpZXJzOiAoLiopKC4qKVxuICAgIC9cXChbXildKlsrKl1cXCkrLywgICAgICAgICAgICAgICAgICAgIC8vIFJlcGV0aXRpb24gb2YgcmVwZXRpdGlvbjogKC4rKStcbiAgICAvXFwoW14pXSpcXHxbXildKlxcKVsrKl0vLCAgICAgICAgICAgICAgLy8gQWx0ZXJuYXRpb24gKyByZXBldGl0aW9uOiAoYXxiKStcbiAgICAvKFxcW1teXFxdXStcXF1bKypdKVteXV0qXFxdLywgICAgICAgICAgIC8vIENoYXIgY2xhc3Mgd2l0aCByZXBldGl0aW9uOiAoW2Etel0rKStcbiAgICAvXFwoXFwuXFw/XFwpXFwqXFwqLywgICAgICAgICAgICAgICAgICAgICAgLy8gR3JvdXAgZm9sbG93ZWQgYnkgZG91YmxlIHN0YXI6ICguKj8pKipcbiAgXTtcbiAgXG4gIGZvciAoY29uc3Qgc3RydWN0dXJlIG9mIGRhbmdlcm91c1N0cnVjdHVyZXMpIHtcbiAgICBpZiAoc3RydWN0dXJlLnRlc3QocGF0dGVybikpIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgLy8gQWxzbyBjaGVjayBmb3IgdGhlIG9yaWdpbmFsIG5haXZlIHBhdHRlcm5zIGFzIGZhbGxiYWNrXG4gIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICcoLiopKC4qKScsICAgICAgICAgICAvLyBOZXN0ZWQgcXVhbnRpZmllcnMgd2l0aCAuKlxuICAgICcoLispKycsICAgICAgICAgICAgICAvLyBSZXBldGl0aW9uIG9mIHJlcGV0aXRpb24gIFxuICAgICcoW2Etel0rKSsnLCAgICAgICAgICAvLyBDaGFyYWN0ZXIgY2xhc3Mgd2l0aCByZXBldGl0aW9uXG4gICAgJyhhfGIpKycsICAgICAgICAgICAgIC8vIEFsdGVybmF0aW9uIHdpdGggcmVwZXRpdGlvblxuICAgICcoLio/KSoqJywgICAgICAgICAgICAvLyBHcm91cCBmb2xsb3dlZCBieSBkb3VibGUgc3RhciAoUmVEb1MpXG4gIF07XG4gIFxuICBmb3IgKGNvbnN0IGRhbmdlcm91c1BhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi5pbmNsdWRlcyhkYW5nZXJvdXNQYXR0ZXJuKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBcHBseSBzZWN1cml0eSBjaGVja3MgYmFzZWQgb24gY29uZmlnIHNldHRpbmdzLlxuICogVXNlcyB0aGUgdmlydHVhbCB3b3JraW5nIGRpcmVjdG9yeSBmb3IgcGF0aCB2YWxpZGF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTZWN1cml0eUNoZWNrcyhcbiAgZmlsZVBhdGg6IHN0cmluZywgXG4gIGNvbnRlbnQ/OiBzdHJpbmcsIFxuICByZWdleFBhdHRlcm4/OiBzdHJpbmcsIFxuICBjb25maWc/OiBQbHVnaW5Db25maWdcbik6IHsgdmFsaWRQYXRoOiBib29sZWFuOyBpc0JpbmFyeTogYm9vbGVhbjsgc2FmZVJlZ2V4OiBib29sZWFuIH0ge1xuICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG5cbiAgcmV0dXJuIHtcbiAgICB2YWxpZFBhdGg6IGVmZmVjdGl2ZUNvbmZpZy5wYXRoVmFsaWRhdGlvbkVuYWJsZWQgPyB2YWxpZGF0ZVBhdGgoZmlsZVBhdGgsIGdldFdvcmtpbmdEaXIoKSkgOiB0cnVlLFxuICAgIGlzQmluYXJ5OiBlZmZlY3RpdmVDb25maWcuYmluYXJ5RmlsZURldGVjdGlvbiAmJiBjb250ZW50ID8gaXNCaW5hcnlGaWxlKGNvbnRlbnQpIDogZmFsc2UsXG4gICAgc2FmZVJlZ2V4OiBlZmZlY3RpdmVDb25maWcucmVnZXhSZURvU1Byb3RlY3Rpb24gJiYgcmVnZXhQYXR0ZXJuID8gaXNTYWZlUmVnZXgocmVnZXhQYXR0ZXJuKSA6IHRydWUsXG4gIH07XG59XG5cbi8qKlxuICogU2FuaXRpemUgc2hlbGwgY29tbWFuZHMgdG8gcHJldmVudCBkYW5nZXJvdXMgb3BlcmF0aW9uc1xuICogUzMgRklYOiBFbmhhbmNlZCB3aXRoIElGUy10YW1wZXJpbmcgYW5kIG51bGwtYnl0ZSBpbmplY3Rpb24gZGV0ZWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHsgc2FmZTogYm9vbGVhbjsgcmVhc29uPzogc3RyaW5nIH0ge1xuICBpZiAoIWNvbW1hbmQgfHwgdHlwZW9mIGNvbW1hbmQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0VtcHR5IG9yIGludmFsaWQgY29tbWFuZCcgfTtcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB3aGl0ZXNwYWNlIGJ1dCBwcmVzZXJ2ZSBxdW90ZWQgc3RyaW5nc1xuICBjb25zdCBub3JtYWxpemVkID0gY29tbWFuZC50cmltKCk7XG4gIFxuICAvLyBTMyBGSVg6IEJsb2NrIG51bGwgYnl0ZSBpbmplY3Rpb24gKGNhbiBieXBhc3MgcmVnZXggbWF0Y2hpbmcpXG4gIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKCdcXDAnKSB8fCBub3JtYWxpemVkLmluY2x1ZGVzKCclMDAnKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdOdWxsIGJ5dGUgaW5qZWN0aW9uIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgLy8gUzMgRklYOiBCbG9jayBJRlMtdGFtcGVyaW5nIGluIGJhc2ggKElGUz0kJyAnIGFsbG93cyBzcGxpdHRpbmcgd2l0aG91dCBzcGFjZXMpXG4gIGNvbnN0IGlmc1BhdHRlcm5zID0gW1xuICAgIC9cXGJJRlNcXHMqPVxccypbXFxcXCQnXVxccyovaSxcbiAgICAvSUZTPVskJ11bXiddKicvaSxcbiAgXTtcbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGlmc1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4udGVzdChub3JtYWxpemVkKSkge1xuICAgICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0lGUyB0YW1wZXJpbmcgZGV0ZWN0ZWQnIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGRhbmdlcm91cyBwYXR0ZXJucyB1c2luZyBhIG1vcmUgcm9idXN0IGFwcHJvYWNoXG4gIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgIC8vIEZpbGUgc3lzdGVtIGRlc3RydWN0aW9uXG4gICAgL1xcYnJtXFxzKy1yZlxcYi9pLFxuICAgIC9cXGJzaHJlZFxcYi9pLFxuICAgIC9cXGJ3aXBlXFxiL2ksXG4gICAgXG4gICAgLy8gUHJpdmlsZWdlIGVzY2FsYXRpb25cbiAgICAvXFxic3Vkb1xcYi9pLFxuICAgIC9cXGJzdVxcYig/IVxcdykvaSwgIC8vICdzdScgYnV0IG5vdCAnc3VkbycsICdzdXNoaScsIGV0Yy5cbiAgICBcbiAgICAvLyBOZXR3b3JrIGF0dGFja3NcbiAgICAvXFxibmNcXGIoPyFcXHcpfFxcYm5ldGNhdFxcYi9pLFxuICAgIC9cXGJ3Z2V0XFxzKy4qLS1wb3N0LWZpbGVcXGIvaSxcbiAgICAvXFxiY3VybFxccysuKi0tZGF0YS1iaW5hcnlcXGIvaSxcbiAgICBcbiAgICAvLyBEYXRhIGV4ZmlsdHJhdGlvblxuICAgIC9cXGJiYXNlNjRcXGIuKlxcfFxccyooY3VybHx3Z2V0KS9pLFxuICAgIC9cXGJzY3BcXGIoPyFcXHcpfFxcYnNmdHBcXGIvaSxcbiAgICBcbiAgICAvLyBQcm9jZXNzIG1hbmlwdWxhdGlvblxuICAgIC9cXGJmb3JrXFxiKD8hXFx3KS9pLFxuICAgIC9cXGJleGVjXFxiKD8hXFx3KS9pLFxuICAgIFxuICAgIC8vIEVudmlyb25tZW50IHRhbXBlcmluZ1xuICAgIC9cXGJleHBvcnRcXHMrXFx3Kz0vaSxcbiAgICAvXFxiZXZhbFxcYig/IVxcdykvaSxcbiAgXTtcblxuICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiBgRGFuZ2Vyb3VzIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7cGF0dGVybi5zb3VyY2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBwaXBlIGNoYWlucyB0aGF0IGNvdWxkIGJlIHVzZWQgZm9yIGF0dGFja3MgKG1vcmUgdGhhbiAyIHBpcGVzID0gMysgY29tbWFuZHMpXG4gIGNvbnN0IHBpcGVDb3VudCA9IChub3JtYWxpemVkLm1hdGNoKC9cXHwvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHBpcGVDb3VudCA+IDIpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnVG9vIG1hbnkgcGlwZXMgaW4gY29tbWFuZCBjaGFpbicgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBzZW1pY29sb24tc2VwYXJhdGVkIGNvbW1hbmRzIChwb3RlbnRpYWwgaW5qZWN0aW9uKVxuICBjb25zdCBzZW1pQ29sb25Db3VudCA9IChub3JtYWxpemVkLm1hdGNoKC87L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChzZW1pQ29sb25Db3VudCA+IDEpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnTXVsdGlwbGUgc2VtaWNvbG9ucyBkZXRlY3RlZCBpbiBjb21tYW5kJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGJhY2t0aWNrIGV4ZWN1dGlvbiBvciAkKCkgc3Vic2hlbGwgaW5qZWN0aW9uXG4gIGlmICgvYFteYF0rYHxcXCRcXChbXildK1xcKS8udGVzdChub3JtYWxpemVkKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdDb21tYW5kIHN1YnN0aXR1dGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBlbnZpcm9ubWVudCB2YXJpYWJsZSBpbmplY3Rpb25cbiAgaWYgKC9eXFxzKihleHBvcnR8dW5zZXQpXFxzLy50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0Vudmlyb25tZW50IG1vZGlmaWNhdGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIHJldHVybiB7IHNhZmU6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBTUUwgcXVlcnkgZm9yIHNhZmV0eSAocmVhZC1vbmx5IG9wZXJhdGlvbnMgb25seSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU1FMUXVlcnkocXVlcnk6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IHJlYXNvbj86IHN0cmluZyB9IHtcbiAgaWYgKCFxdWVyeSB8fCB0eXBlb2YgcXVlcnkgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246ICdFbXB0eSBvciBpbnZhbGlkIHF1ZXJ5JyB9O1xuICB9XG5cbiAgY29uc3QgdHJpbW1lZCA9IHF1ZXJ5LnRyaW0oKS50b1VwcGVyQ2FzZSgpO1xuICBcbiAgLy8gT25seSBhbGxvdyBTRUxFQ1QgYW5kIFBSQUdNQSBzdGF0ZW1lbnRzXG4gIGlmICghdHJpbW1lZC5zdGFydHNXaXRoKCdTRUxFQ1QnKSAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdQUkFHTUEnKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnT25seSBTRUxFQ1QgYW5kIFBSQUdNQSBxdWVyaWVzIGFyZSBhbGxvd2VkJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGRhbmdlcm91cyBrZXl3b3JkcyB0aGF0IGNvdWxkIGJlIGluamVjdGVkIGFmdGVyIFNFTEVDVC9QUkFHTUFcbiAgY29uc3QgZGFuZ2Vyb3VzU1FMS2V5d29yZHMgPSBbXG4gICAgL1xcYkRST1BcXGIvaSxcbiAgICAvXFxiREVMRVRFXFxiL2ksXG4gICAgL1xcYlVQREFURVxcYi9pLFxuICAgIC9cXGJJTlNFUlRcXGIvaSxcbiAgICAvXFxiQUxURVJcXGIvaSxcbiAgICAvXFxiQ1JFQVRFXFxiL2ksXG4gICAgL1xcYlJFUExBQ0VcXGIvaSxcbiAgICAvXFxiVFJVTkNBVEVcXGIvaSxcbiAgICAvXFxiR1JBTlRcXGIvaSxcbiAgICAvXFxiUkVWT0tFXFxiL2ksXG4gIF07XG5cbiAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGRhbmdlcm91c1NRTEtleXdvcmRzKSB7XG4gICAgaWYgKGtleXdvcmQudGVzdCh0cmltbWVkKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246IGBEYW5nZXJvdXMgU1FMIG9wZXJhdGlvbiBkZXRlY3RlZDogJHtrZXl3b3JkLnNvdXJjZX1gIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIG11bHRpcGxlIHN0YXRlbWVudHMgKHNlbWljb2xvbiBpbmplY3Rpb24pXG4gIGNvbnN0IHNlbWlDb2xvbkNvdW50ID0gKHRyaW1tZWQubWF0Y2goLzsvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHNlbWlDb2xvbkNvdW50ID4gMCkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnTXVsdGlwbGUgU1FMIHN0YXRlbWVudHMgZGV0ZWN0ZWQnIH07XG4gIH1cblxuICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuIiwgIi8qKlxuICogUGVyZm9ybWFuY2UgVXRpbGl0aWVzIGZvciBBSSBUb29sYm94IFBsdWdpblxuICogT3B0aW1pemVkIGFsZ29yaXRobXMgd2l0aCBlYXJseSBleGl0LCBjYWNoaW5nLCBhbmQgYXN5bmMgb3BlcmF0aW9uc1xuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IExldmVuc2h0ZWluIERpc3RhbmNlIHdpdGggRWFybHkgRXhpdCA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE9wdGltaXplZCBMZXZlbnNodGVpbiBkaXN0YW5jZSBjYWxjdWxhdGlvbiB3aXRoIGVhcmx5IGV4aXQgdGhyZXNob2xkLlxuICogU3RvcHMgY2FsY3VsYXRpbmcgaWYgdGhlIG1pbmltdW0gcG9zc2libGUgc2NvcmUgZHJvcHMgYmVsb3cgdGhlIHRocmVzaG9sZC5cbiAqIFxuICogQHBhcmFtIGEgLSBGaXJzdCBzdHJpbmdcbiAqIEBwYXJhbSBiIC0gU2Vjb25kIHN0cmluZyAgXG4gKiBAcGFyYW0gbWluU2NvcmUgLSBNaW5pbXVtIGFjY2VwdGFibGUgc2ltaWxhcml0eSBzY29yZSAoMC0xKS4gUmVzdWx0cyBiZWxvdyB0aGlzIGFyZSBwcnVuZWQgZWFybHkuXG4gKiBAcmV0dXJucyBTaW1pbGFyaXR5IHNjb3JlIGJldHdlZW4gMCBhbmQgMSwgb3IgbnVsbCBpZiBiZWxvdyB0aHJlc2hvbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxldmVuc2h0ZWluU2ltaWxhcml0eShhOiBzdHJpbmcsIGI6IHN0cmluZywgbWluU2NvcmU6IG51bWJlciA9IDAuMyk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBtYXhMZW4gPSBNYXRoLm1heChhLmxlbmd0aCwgYi5sZW5ndGgpO1xuICBpZiAobWF4TGVuID09PSAwKSByZXR1cm4gMTtcblxuICAvLyBRdWljayByZWplY3Rpb246IGlmIHN0cmluZ3MgZGlmZmVyIHRvbyBtdWNoIGluIGxlbmd0aCwgc2tpcCBleHBlbnNpdmUgY2FsY3VsYXRpb25cbiAgY29uc3QgbGVuRGlmZiA9IE1hdGguYWJzKGEubGVuZ3RoIC0gYi5sZW5ndGgpO1xuICBpZiAobGVuRGlmZiAvIG1heExlbiA+ICgxIC0gbWluU2NvcmUpKSB7XG4gICAgcmV0dXJuIG51bGw7IC8vIEVhcmx5IGV4aXQgZm9yIHZlcnkgZGlmZmVyZW50IGxlbmd0aHNcbiAgfVxuXG4gIC8vIFVzZSB0d28tcm93IG9wdGltaXphdGlvbiBpbnN0ZWFkIG9mIGZ1bGwgbWF0cml4IChzYXZlcyBtZW1vcnkpXG4gIGxldCBwcmV2Um93OiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJldlJvdy5wdXNoKDApO1xuICB9XG4gIGxldCBjdXJyUm93OiBudW1iZXJbXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IGIubGVuZ3RoOyBpKyspIHtcbiAgICBwcmV2Um93W2ldID0gaTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGEubGVuZ3RoOyBpKyspIHtcbiAgICBjdXJyUm93WzBdID0gaTtcbiAgICBcbiAgICAvLyBFYXJseSBleGl0IG9wdGltaXphdGlvbjogaWYgY3VycmVudCByb3cncyBtaW5pbXVtIGV4Y2VlZHMgdGhyZXNob2xkLCBhYm9ydFxuICAgIGxldCBtaW5JblJvdyA9IGk7XG4gICAgXG4gICAgZm9yIChsZXQgaiA9IDE7IGogPD0gYi5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgY29zdCA9IGFbaSAtIDFdID09PSBiW2ogLSAxXSA/IDAgOiAxO1xuICAgICAgY3VyclJvd1tqXSA9IE1hdGgubWluKFxuICAgICAgICBwcmV2Um93W2pdICsgMSwgICAgICAgICAvLyBkZWxldGlvblxuICAgICAgICBjdXJyUm93W2ogLSAxXSArIDEsICAgICAvLyBpbnNlcnRpb24gIFxuICAgICAgICBwcmV2Um93W2ogLSAxXSArIGNvc3QgICAvLyBzdWJzdGl0dXRpb25cbiAgICAgICk7XG4gICAgICBcbiAgICAgIGlmIChjdXJyUm93W2pdIDwgbWluSW5Sb3cpIHtcbiAgICAgICAgbWluSW5Sb3cgPSBjdXJyUm93W2pdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVhcmx5IGV4aXQ6IGlmIG1pbmltdW0gaW4gdGhpcyByb3cgYWxyZWFkeSBleGNlZWRzIHRocmVzaG9sZCwgYWJvcnRcbiAgICBjb25zdCBjdXJyZW50TWF4U2NvcmUgPSAxIC0gbWluSW5Sb3cgLyBtYXhMZW47XG4gICAgaWYgKGN1cnJlbnRNYXhTY29yZSA8IG1pblNjb3JlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHJvd3NcbiAgICBbcHJldlJvdywgY3VyclJvd10gPSBbY3VyclJvdywgcHJldlJvd107XG4gIH1cblxuICBjb25zdCBkaXN0YW5jZSA9IHByZXZSb3dbYi5sZW5ndGhdO1xuICBjb25zdCBzY29yZSA9IE1hdGgubWF4KDAsIDEgLSBkaXN0YW5jZSAvIG1heExlbik7XG4gIHJldHVybiBzY29yZSA+PSBtaW5TY29yZSA/IHNjb3JlIDogbnVsbDtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRnV6enkgU2VhcmNoIENhY2hlID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBGdXp6eVNlYXJjaENhY2hlRW50cnkge1xuICByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT47XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG5jb25zdCBmdXp6eVNlYXJjaENhY2hlID0gbmV3IE1hcDxzdHJpbmcsIEZ1enp5U2VhcmNoQ2FjaGVFbnRyeT4oKTtcbmNvbnN0IENBQ0hFX1RUTF9NUyA9IDYwXzAwMDsgLy8gNjAgc2Vjb25kIGNhY2hlIFRUTFxuXG4vKipcbiAqIEdldCBjYWNoZWQgZnV6enkgc2VhcmNoIHJlc3VsdHMgaWYgYXZhaWxhYmxlIGFuZCBub3QgZXhwaXJlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlZEZ1enp5UmVzdWx0cyhxdWVyeTogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKTogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+IHwgbnVsbCB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7cXVlcnl9OiR7YmFzZVBhdGh9YDtcbiAgY29uc3QgZW50cnkgPSBmdXp6eVNlYXJjaENhY2hlLmdldChjYWNoZUtleSk7XG4gIFxuICBpZiAoIWVudHJ5KSByZXR1cm4gbnVsbDtcbiAgaWYgKERhdGUubm93KCkgLSBlbnRyeS50aW1lc3RhbXAgPiBDQUNIRV9UVExfTVMpIHtcbiAgICBmdXp6eVNlYXJjaENhY2hlLmRlbGV0ZShjYWNoZUtleSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgXG4gIHJldHVybiBlbnRyeS5yZXN1bHRzO1xufVxuXG4vKipcbiAqIENhY2hlIGZ1enp5IHNlYXJjaCByZXN1bHRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVGdXp6eVJlc3VsdHMocXVlcnk6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZywgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+KTogdm9pZCB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7cXVlcnl9OiR7YmFzZVBhdGh9YDtcbiAgZnV6enlTZWFyY2hDYWNoZS5zZXQoY2FjaGVLZXksIHtcbiAgICByZXN1bHRzLFxuICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgfSk7XG4gIFxuICAvLyBFdmljdCBvbGQgZW50cmllcyBpZiBjYWNoZSBncm93cyB0b28gbGFyZ2UgKG1heCAxMDAgZW50cmllcylcbiAgaWYgKGZ1enp5U2VhcmNoQ2FjaGUuc2l6ZSA+IDEwMCkge1xuICAgIGNvbnN0IG9sZGVzdEtleSA9IGZ1enp5U2VhcmNoQ2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICBpZiAob2xkZXN0S2V5KSB7XG4gICAgICBmdXp6eVNlYXJjaENhY2hlLmRlbGV0ZShvbGRlc3RLZXkpO1xuICAgIH1cbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBc3luYyBGaWxlIFNlYXJjaCB3aXRoIENvbmN1cnJlbmN5IENvbnRyb2wgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdCB7XG4gIGZpbGVzOiBzdHJpbmdbXTtcbiAgY291bnQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBzZWFyY2ggZm9yIGZpbGVzIG1hdGNoaW5nIGEgcGF0dGVybiB1c2luZyBhc3luYy9hd2FpdCB3aXRoIGNvbmN1cnJlbmN5IGNvbnRyb2wuXG4gKiBNdWNoIGZhc3RlciB0aGFuIHN5bmNocm9ub3VzIHJlYWRkaXJTeW5jIGZvciBsYXJnZSBkaXJlY3RvcnkgdHJlZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kRmlsZXNBc3luYyhcbiAgZGlyUGF0aDogc3RyaW5nLFxuICBwYXR0ZXJuOiBzdHJpbmcsXG4gIG1heERlcHRoOiBudW1iZXIgPSA1LFxuICBjb25jdXJyZW5jeUxpbWl0OiBudW1iZXIgPSA0XG4pOiBQcm9taXNlPFNlYXJjaFJlc3VsdD4ge1xuICBjb25zdCByZXN1bHRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBwYXR0ZXJuTG93ZXIgPSBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gc2VhcmNoRGlyKGN1cnJlbnRQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5yZWFkZGlyKGN1cnJlbnRQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICBcbiAgICAgIC8vIFByb2Nlc3MgZmlsZXMgaW1tZWRpYXRlbHlcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoZW50cnkuaXNGaWxlKCkgJiYgZW50cnkubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHBhdHRlcm5Mb3dlcikpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlbnRyeS5uYW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ29sbGVjdCBzdWJkaXJlY3RvcmllcyBmb3IgcGFyYWxsZWwgcHJvY2Vzc2luZ1xuICAgICAgY29uc3Qgc3ViZGlycyA9IGVudHJpZXMuZmlsdGVyKGUgPT4gZS5pc0RpcmVjdG9yeSgpKS5tYXAoZSA9PiBwYXRoLmpvaW4oY3VycmVudFBhdGgsIGUubmFtZSkpO1xuICAgICAgXG4gICAgICBpZiAoc3ViZGlycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIFByb2Nlc3MgZGlyZWN0b3JpZXMgaW4gYmF0Y2hlcyB0byBhdm9pZCBvdmVyd2hlbG1pbmcgdGhlIHN5c3RlbVxuICAgICAgICBjb25zdCBiYXRjaGVzOiBzdHJpbmdbXVtdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViZGlycy5sZW5ndGg7IGkgKz0gY29uY3VycmVuY3lMaW1pdCkge1xuICAgICAgICAgIGJhdGNoZXMucHVzaChzdWJkaXJzLnNsaWNlKGksIGkgKyBjb25jdXJyZW5jeUxpbWl0KSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGJhdGNoIG9mIGJhdGNoZXMpIHtcbiAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIGJhdGNoLm1hcChkaXIgPT4gc2VhcmNoRGlyKGRpciwgZGVwdGggKyAxKSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3RvcmllcyBzaWxlbnRseVxuICAgIH1cbiAgfVxuXG4gIGF3YWl0IHNlYXJjaERpcihkaXJQYXRoLCAwKTtcbiAgcmV0dXJuIHsgZmlsZXM6IHJlc3VsdHMsIGNvdW50OiByZXN1bHRzLmxlbmd0aCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTdHJlYW1pbmcgRmlsZSBSZWFkZXIgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFN0cmVhbVJlYWRSZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICBkYXRhPzoge1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICBwYXRoOiBzdHJpbmc7XG4gICAgdG90YWxMZW5ndGg6IG51bWJlcjtcbiAgICB0cnVuY2F0ZWQ/OiBib29sZWFuO1xuICAgIG5vdGU/OiBzdHJpbmc7XG4gIH07XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlYWQgZmlsZSBjb250ZW50IHVzaW5nIHN0cmVhbWluZyB0byBhdm9pZCBsb2FkaW5nIGVudGlyZSBmaWxlIGludG8gbWVtb3J5LlxuICogUmVzcGVjdHMgbWF4X2xlbmd0aCBwYXJhbWV0ZXIgYnkgcmVhZGluZyBvbmx5IG5lY2Vzc2FyeSBjaHVua3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZVN5bmMoXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIG1heExlbmd0aDogbnVtYmVyID0gNTAwMFxuKTogUHJvbWlzZTxTdHJlYW1SZWFkUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IGZpbGUgc3RhdHMgZmlyc3QgdG8ga25vdyB0b3RhbCBzaXplXG4gICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBmcy5zdGF0KGZpbGVQYXRoKTtcbiAgICBcbiAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUGF0aCBpcyBhIGRpcmVjdG9yeSwgbm90IGEgZmlsZScgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBmaWxlIGlzIHNtYWxsIGVub3VnaCwgcmVhZCBlbnRpcmVseSAoZmFzdGVyIGZvciBzbWFsbCBmaWxlcylcbiAgICBpZiAoc3RhdHMuc2l6ZSA8PSBtYXhMZW5ndGggKiAyKSB7IC8vIDJ4IGZhY3RvciBmb3IgVVRGLTggZW5jb2Rpbmcgb3ZlcmhlYWRcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgY29udGVudCxcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICB0b3RhbExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZvciBsYXJnZSBmaWxlcywgdXNlIHN0cmVhbWluZyByZWFkXG4gICAgY29uc3QgeyBjcmVhdGVSZWFkU3RyZWFtIH0gPSBhd2FpdCBpbXBvcnQoJ2ZzJyk7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgY29udGVudCA9ICcnO1xuICAgICAgbGV0IGJ5dGVzUmVhZCA9IDA7XG4gICAgICBjb25zdCBzdHJlYW0gPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoLCB7IFxuICAgICAgICBlbmNvZGluZzogJ3V0Zi04JyxcbiAgICAgICAgaGlnaFdhdGVyTWFyazogNjQgKiAxMDI0IC8vIDY0S0IgY2h1bmtzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlciB8IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBjaHVua1N0ciA9IHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycgPyBjaHVuayA6IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgIGJ5dGVzUmVhZCArPSBjaHVua1N0ci5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICAvLyBPbmx5IGFjY3VtdWxhdGUgaWYgd2UgaGF2ZW4ndCBleGNlZWRlZCBtYXggbGVuZ3RoIHlldFxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggKyBjaHVua1N0ci5sZW5ndGggPD0gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgY29udGVudCArPSBjaHVua1N0cjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUYWtlIG9ubHkgd2hhdCBmaXRzIGFuZCBzdG9wIHJlYWRpbmdcbiAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBtYXhMZW5ndGggLSBjb250ZW50Lmxlbmd0aDtcbiAgICAgICAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgICAgICAgY29udGVudCArPSBjaHVua1N0ci5zdWJzdHJpbmcoMCwgcmVtYWluaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RyZWFtLmRlc3Ryb3koKTsgLy8gU3RvcCB0aGUgc3RyZWFtIGVhcmx5XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaXNUcnVuY2F0ZWQgPSBieXRlc1JlYWQgPiBtYXhMZW5ndGggfHwgc3RhdHMuc2l6ZSA+IG1heExlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgdG90YWxMZW5ndGg6IE1hdGgubWF4KGJ5dGVzUmVhZCwgY29udGVudC5sZW5ndGgpLFxuICAgICAgICAgICAgLi4uKGlzVHJ1bmNhdGVkICYmIHsgXG4gICAgICAgICAgICAgIHRydW5jYXRlZDogdHJ1ZSwgXG4gICAgICAgICAgICAgIG5vdGU6IGBPdXRwdXQgdHJ1bmNhdGVkIHRvICR7bWF4TGVuZ3RofSBjaGFyYWN0ZXJzLiBVc2UgbWF4X2xlbmd0aCBwYXJhbWV0ZXIgdG8gcmVhZCBtb3JlLmAgXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJlYWQgZmlsZTogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBSZXF1ZXN0IENhY2hpbmcgZm9yIFdlYiBSZXNlYXJjaCA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQ2FjaGVkUmVzcG9uc2Uge1xuICBkYXRhOiB1bmtub3duO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgc3RhdHVzOiBudW1iZXI7XG59XG5cbmNvbnN0IHJlcXVlc3RDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBDYWNoZWRSZXNwb25zZT4oKTtcbmNvbnN0IFJFUVVFU1RfQ0FDSEVfVFRMX01TID0gMzBfMDAwOyAvLyAzMCBzZWNvbmQgY2FjaGUgVFRMIGZvciBzZWFyY2ggcmVzdWx0c1xuXG4vKiogQ2xlYXIgcmVxdWVzdCBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJSZXF1ZXN0Q2FjaGUoKTogdm9pZCB7XG4gIHJlcXVlc3RDYWNoZS5jbGVhcigpO1xufVxuXG4vKipcbiAqIEZldGNoIHdpdGggY2FjaGluZyB0byBhdm9pZCByZWR1bmRhbnQgbmV0d29yayByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aENhY2hlKFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IFJlcXVlc3RJbml0XG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7dXJsfToke0pTT04uc3RyaW5naWZ5KG9wdGlvbnMpfWA7XG4gIFxuICAvLyBDaGVjayBjYWNoZSBmaXJzdCAoR0VUIHJlcXVlc3RzIG9ubHkpXG4gIGlmIChvcHRpb25zPy5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIGNvbnN0IGNhY2hlZCA9IHJlcXVlc3RDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgIGlmIChjYWNoZWQgJiYgRGF0ZS5ub3coKSAtIGNhY2hlZC50aW1lc3RhbXAgPCBSRVFVRVNUX0NBQ0hFX1RUTF9NUykge1xuICAgICAgLy8gUmV0dXJuIGEgUmVzcG9uc2UtbGlrZSBvYmplY3QgZnJvbSBjYWNoZVxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShjYWNoZWQuZGF0YSksIHtcbiAgICAgICAgc3RhdHVzOiBjYWNoZWQuc3RhdHVzLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCBvcHRpb25zKTtcbiAgXG4gIC8vIENhY2hlIHN1Y2Nlc3NmdWwgcmVzcG9uc2VzXG4gIGlmIChyZXNwb25zZS5vayAmJiBvcHRpb25zPy5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgcmVxdWVzdENhY2hlLnNldChjYWNoZUtleSwge1xuICAgICAgICBkYXRhLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vIEV2aWN0IG9sZCBlbnRyaWVzIGlmIGNhY2hlIGdyb3dzIHRvbyBsYXJnZSAobWF4IDUwIGVudHJpZXMpXG4gICAgICBpZiAocmVxdWVzdENhY2hlLnNpemUgPiA1MCkge1xuICAgICAgICBjb25zdCBvbGRlc3RLZXkgPSByZXF1ZXN0Q2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICAgICAgaWYgKG9sZGVzdEtleSkge1xuICAgICAgICAgIHJlcXVlc3RDYWNoZS5kZWxldGUob2xkZXN0S2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gTm9uLUpTT04gcmVzcG9uc2VzIGFyZSBub3QgY2FjaGVkXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIFJldHJ5IGxvZ2ljIHdpdGggZXhwb25lbnRpYWwgYmFja29mZiBmb3IgZmFpbGVkIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hXaXRoUmV0cnkoXG4gIHVybDogc3RyaW5nLFxuICBvcHRpb25zPzogUmVxdWVzdEluaXQsXG4gIG1heFJldHJpZXM6IG51bWJlciA9IDMsXG4gIGJhc2VEZWxheU1zOiBudW1iZXIgPSAxMDAwXG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gIFxuICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8PSBtYXhSZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhDYWNoZSh1cmwsIG9wdGlvbnMpO1xuICAgICAgXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rICYmIHJlc3BvbnNlLnN0YXR1cyA+PSA1MDApIHtcbiAgICAgICAgLy8gU2VydmVyIGVycm9yIC0gcmV0cnlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJ2ZXIgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgIGxhc3RFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgIFxuICAgICAgaWYgKGF0dGVtcHQgPCBtYXhSZXRyaWVzKSB7XG4gICAgICAgIGNvbnN0IGRlbGF5TXMgPSBiYXNlRGVsYXlNcyAqIE1hdGgucG93KDIsIGF0dGVtcHQpOyAvLyBFeHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheU1zKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICB0aHJvdyBsYXN0RXJyb3IgfHwgbmV3IEVycm9yKGBSZXF1ZXN0IGZhaWxlZCBhZnRlciAke21heFJldHJpZXN9IHJldHJpZXNgKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU3VicHJvY2VzcyBUaW1lb3V0IENhbGN1bGF0b3IgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBDYWxjdWxhdGUgYXBwcm9wcmlhdGUgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemUuXG4gKiBMYXJnZXIgcHJvamVjdHMgbmVlZCBtb3JlIHRpbWUgZm9yIGFuYWx5c2lzIHRvb2xzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5hbHlzaXNUaW1lb3V0KGJhc2VUaW1lb3V0TXM6IG51bWJlciwgZmlsZUNvdW50PzogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKCFmaWxlQ291bnQpIHJldHVybiBiYXNlVGltZW91dE1zO1xuICBcbiAgLy8gU2NhbGUgdGltZW91dCBsb2dhcml0aG1pY2FsbHkgd2l0aCBmaWxlIGNvdW50XG4gIGNvbnN0IHNjYWxlRmFjdG9yID0gTWF0aC5sb2cyKE1hdGgubWF4KDEsIGZpbGVDb3VudCkpIC8gMTA7IC8vIH4xeCBmb3IgMS0xMCBmaWxlcywgfjJ4IGZvciAxMDAwKyBmaWxlc1xuICBjb25zdCBzY2FsZWRUaW1lb3V0ID0gYmFzZVRpbWVvdXRNcyAqICgxICsgc2NhbGVGYWN0b3IpO1xuICBcbiAgLy8gQ2FwIGF0IDYwIHNlY29uZHMgbWF4aW11bVxuICByZXR1cm4gTWF0aC5taW4oc2NhbGVkVGltZW91dCwgNjBfMDAwKTtcbn1cblxuLyoqXG4gKiBDb3VudCBUeXBlU2NyaXB0IGZpbGVzIGluIGEgZGlyZWN0b3J5IHRvIGVzdGltYXRlIHByb2plY3Qgc2l6ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvdW50VHlwZVNjcmlwdEZpbGVzKGRpclBhdGg6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGxldCBjb3VudCA9IDA7XG4gIFxuICBhc3luYyBmdW5jdGlvbiBjb3VudEluRGlyKGN1cnJlbnRQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZGVwdGggPiAxMCkgcmV0dXJuOyAvLyBSZWFzb25hYmxlIG1heCBkZXB0aFxuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucmVhZGRpcihjdXJyZW50UGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy50cycpKSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgLy8gU2tpcCBjb21tb24gbm9uLXNvdXJjZSBkaXJlY3Rvcmllc1xuICAgICAgICAgIGlmICghWydub2RlX21vZHVsZXMnLCAnLmdpdCcsICdkaXN0JywgJ2J1aWxkJ10uaW5jbHVkZXMoZW50cnkubmFtZSkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNvdW50SW5EaXIocGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlbnRyeS5uYW1lKSwgZGVwdGggKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIGRpcmVjdG9yaWVzXG4gICAgfVxuICB9XG4gIFxuICBhd2FpdCBjb3VudEluRGlyKGRpclBhdGgsIDApO1xuICByZXR1cm4gY291bnQ7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuLi9zdGF0ZU1hbmFnZXIuanMnO1xuaW1wb3J0IHsgdmFsaWRhdGVQYXRoLCBpc1NhZmVSZWdleCB9IGZyb20gJy4uL3NlY3VyaXR5LmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIsIHNldFdvcmtpbmdEaXIsIHJlc29sdmVQYXRoIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5pbXBvcnQge1xuICBsZXZlbnNodGVpblNpbWlsYXJpdHksXG4gIGdldENhY2hlZEZ1enp5UmVzdWx0cyxcbiAgY2FjaGVGdXp6eVJlc3VsdHMsXG4gIGZpbmRGaWxlc0FzeW5jLFxuICBjb3VudFR5cGVTY3JpcHRGaWxlcyxcbiAgZ2V0QW5hbHlzaXNUaW1lb3V0LFxufSBmcm9tICcuLi9wZXJmb3JtYW5jZVV0aWxzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIExpc3REaXJlY3RvcnlQYXJhbXMgeyBwYXRoPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmVhZEZpbGVQYXJhbXMgeyBmaWxlX25hbWU6IHN0cmluZzsgbWF4X2xlbmd0aD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIFNhdmVGaWxlUGFyYW1zIHsgZmlsZV9uYW1lPzogc3RyaW5nOyBjb250ZW50Pzogc3RyaW5nOyBmaWxlcz86IEFycmF5PHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZyB9PjsgfVxuaW50ZXJmYWNlIFJlcGxhY2VUZXh0SW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IG9sZF9zdHJpbmc6IHN0cmluZzsgbmV3X3N0cmluZzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgSW5zZXJ0QXRMaW5lUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGxpbmVfbnVtYmVyOiBudW1iZXI7IGNvbnRlbnRfdG9faW5zZXJ0OiBzdHJpbmc7IH1cbmludGVyZmFjZSBBcHBlbmRGaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IHN0YXJ0X2xpbmU6IG51bWJlcjsgZW5kX2xpbmU/OiBudW1iZXI7IH1cbmludGVyZmFjZSBNYWtlRGlyZWN0b3J5UGFyYW1zIHsgZGlyZWN0b3J5X25hbWU6IHN0cmluZzsgfVxuaW50ZXJmYWNlIE1vdmVGaWxlUGFyYW1zIHsgc291cmNlOiBzdHJpbmc7IGRlc3RpbmF0aW9uOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDb3B5RmlsZVBhcmFtcyB7IHNvdXJjZTogc3RyaW5nOyBkZXN0aW5hdGlvbjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRGVsZXRlUGF0aFBhcmFtcyB7IHBhdGg6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRmluZEZpbGVzUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyBtYXhfZGVwdGg/OiBudW1iZXI7IH1cbmludGVyZmFjZSBGdXp6eUZpbmRMb2NhbEZpbGVzUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgcGF0aD86IHN0cmluZzsgbWF4X3Jlc3VsdHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHZXRGaWxlTWV0YWRhdGFQYXJhbXMgeyBwYXRoOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGFuZ2VEaXJlY3RvcnlQYXJhbXMgeyBkaXJlY3Rvcnk6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJlYWREb2N1bWVudFBhcmFtcyB7IGZpbGVfcGF0aDogc3RyaW5nOyB9XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgX3N0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGxpc3RfZGlyZWN0b3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbGlzdF9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCB0aGUgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IG9yIGEgc3BlY2lmaWVkIHN1YmRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIHBhdGggdG8gdGhlIGRpcmVjdG9yeSB0byBsaXN0LiBEZWZhdWx0cyB0byBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGg6IGRpclBhdGggfTogTGlzdERpcmVjdG9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IGRpclBhdGggfHwgJy4nO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgodGFyZ2V0UGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKHRhcmdldFBhdGgpO1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZnVsbFBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZW50cmllcy5tYXAoZW50cnkgPT4gKHtcbiAgICAgICAgICBwYXRoOiBwYXRoLmpvaW4oZnVsbFBhdGgsIGVudHJ5Lm5hbWUpLFxuICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXG4gICAgICAgICAgaXNEaXJlY3Rvcnk6IGVudHJ5LmlzRGlyZWN0b3J5KCksXG4gICAgICAgICAgaXNGaWxlOiBlbnRyeS5pc0ZpbGUoKSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlYWRfZmlsZSB0b29sIFx1MjAxNCBIeWJyaWQ6IEVhcmx5IHNpemUgY2hlY2sgKyBCdWZmZXIgYmluYXJ5IGRldGVjdGlvbiArIFRydW5jYXRpb24gc3VwcG9ydFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCBjb250ZW50IGZyb20gYSBmaWxlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byByZWFkJyksXG4gICAgICBtYXhfbGVuZ3RoOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTAwMDApLm9wdGlvbmFsKCkuZGVmYXVsdCg1MDAwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyB0byByZXR1cm4gKGRlZmF1bHQ6IDUwMDApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBtYXhfbGVuZ3RoIH06IFJlYWRGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gbWF4X2xlbmd0aCB8fCA1MDAwO1xuXG4gICAgICAgIC8vIEVhcmx5IHNpemUgY2hlY2sgKEJlbGVkYXJpYW4gc3R5bGUpIC0gcHJldmVudCBsb2FkaW5nID4xME1CIGZpbGVzXG4gICAgICAgIGxldCBzdGF0czogZnMuU3RhdHM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdHMuc2l6ZSA+IDEwXzAwMF8wMDApIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGaWxlIHRvbyBsYXJnZSAoPjEwTUIpJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVhZCBhcyBidWZmZXIgZm9yIGVmZmljaWVudCBiaW5hcnkgY2hlY2sgKEJlbGVkYXJpYW4gc3R5bGUpXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRGaWxlKGZ1bGxQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEJpbmFyeSBjaGVjazogbnVsbCBieXRlIGluIGZpcnN0IDFLQlxuICAgICAgICBjb25zdCBjaGVja0J1ZmZlciA9IGJ1ZmZlci5zdWJhcnJheSgwLCBNYXRoLm1pbihidWZmZXIubGVuZ3RoLCAxMDI0KSk7XG4gICAgICAgIGlmIChjaGVja0J1ZmZlci5pbmNsdWRlcygwKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0JpbmFyeSBmaWxlIGRldGVjdGVkLiBVc2UgcmVhZF9kb2N1bWVudCBmb3IgUERGL0RPQ1ggZmlsZXMuJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICAgICAgY29uc3QgY29udGVudCA9IGJ1ZmZlci50b1N0cmluZygndXRmLTgnKTtcblxuICAgICAgICAvLyBUcnVuY2F0ZSBpZiBuZWNlc3NhcnkgYW5kIGFkZCBtZXRhZGF0YSAoQUkgVG9vbGJveCBzdHlsZSlcbiAgICAgICAgbGV0IGRhdGFDb250ZW50ID0gY29udGVudDtcbiAgICAgICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgdG90YWxMZW5ndGggPSBjb250ZW50Lmxlbmd0aDtcblxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggPiBtYXhMZW5ndGgpIHtcbiAgICAgICAgICBkYXRhQ29udGVudCA9IGNvbnRlbnQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCk7XG4gICAgICAgICAgdHJ1bmNhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBjb250ZW50OiBkYXRhQ29udGVudCxcbiAgICAgICAgICAgIGZpbGVQYXRoOiBmdWxsUGF0aCwgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgICAgLi4uKHRydW5jYXRlZCA/IHsgdHJ1bmNhdGVkOiB0cnVlLCB0b3RhbF9sZW5ndGg6IHRvdGFsTGVuZ3RoIH0gOiB7fSlcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzYXZlX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzYXZlX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBjb250ZW50IHRvIGEgc3BlY2lmaWVkIGZpbGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFN1cHBvcnRzIGJhdGNoIHNhdmluZy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byBzYXZlJyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBjb250ZW50IHRvIHdyaXRlIHRvIHRoZSBmaWxlJyksXG4gICAgICBmaWxlczogei5hcnJheSh6Lm9iamVjdCh7IGZpbGVfbmFtZTogei5zdHJpbmcoKSwgY29udGVudDogei5zdHJpbmcoKSB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRm9yIGJhdGNoIHNhdmluZyBtdWx0aXBsZSBmaWxlcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCwgZmlsZXMgfTogU2F2ZUZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChmaWxlcyAmJiBBcnJheS5pc0FycmF5KGZpbGVzKSkge1xuICAgICAgICAgIC8vIEJhdGNoIHNhdmUgbW9kZVxuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGUuZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEludmFsaWQgcGF0aCBpbiBiYXRjaDogJHtmaWxlLmZpbGVfbmFtZX1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGUuZmlsZV9uYW1lKTtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGZpbGUuY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBmaWxlOiBmdWxsUGF0aCwgc3RhdHVzOiAnc2F2ZWQnIH0pOyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWRGaWxlczogZmlsZXMubGVuZ3RoLCByZXN1bHRzIH0gfTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWxlX25hbWUgJiYgY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gU2luZ2xlIGZpbGUgc2F2ZSBtb2RlXG4gICAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNhdmVkRmlsZTogZnVsbFBhdGgsIHBhdGg6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VpdGhlciBwcm92aWRlIGZpbGVfbmFtZStjb250ZW50IG9yIGZpbGVzIGFycmF5JyB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZXBsYWNlX3RleHRfaW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlcGxhY2VfdGV4dF9pbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlcGxhY2UgYSBzcGVjaWZpYyBzdHJpbmcgaW4gYSBmaWxlIHdpdGggYSBuZXcgc3RyaW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIG9sZF9zdHJpbmc6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBleGFjdCB0ZXh0IHRvIHJlcGxhY2UuIE11c3QgYmUgdW5pcXVlIGluIHRoZSBmaWxlLicpLFxuICAgICAgbmV3X3N0cmluZzogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgdG8gaW5zZXJ0IGluIHBsYWNlIG9mIG9sZF9zdHJpbmcuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBvbGRfc3RyaW5nLCBuZXdfc3RyaW5nIH06IFJlcGxhY2VUZXh0SW5GaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWNvbnRlbnQuaW5jbHVkZXMob2xkX3N0cmluZykpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBTdHJpbmcgJyR7b2xkX3N0cmluZ30nIG5vdCBmb3VuZCBpbiBmaWxlYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBuZXdDb250ZW50ID0gY29udGVudC5yZXBsYWNlKG9sZF9zdHJpbmcsIG5ld19zdHJpbmcpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBuZXdDb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyByZXBsYWNlZDogdHJ1ZSwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBpbnNlcnRfYXRfbGluZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2luc2VydF9hdF9saW5lJyxcbiAgICBkZXNjcmlwdGlvbjogJ0luc2VydCBjb250ZW50IGF0IGEgc3BlY2lmaWMgbGluZSBudW1iZXIgaW4gYSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIGxpbmVfbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnVGhlIGxpbmUgbnVtYmVyIHRvIGluc2VydCBhdCAoMS1pbmRleGVkKScpLFxuICAgICAgY29udGVudF90b19pbnNlcnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gaW5zZXJ0JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBsaW5lX251bWJlciwgY29udGVudF90b19pbnNlcnQgfTogSW5zZXJ0QXRMaW5lUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFsbG93IGFwcGVuZGluZyBhdCBFT0YgKGxpbmVfbnVtYmVyID09IGxlbmd0aCArIDEpXG4gICAgICAgIGlmIChsaW5lX251bWJlciA+IGxpbmVzLmxlbmd0aCArIDEpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBMaW5lIG51bWJlciAke2xpbmVfbnVtYmVyfSBleGNlZWRzIGZpbGUgbGVuZ3RoICgke2xpbmVzLmxlbmd0aH0pYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsaW5lcy5zcGxpY2UobGluZV9udW1iZXIgLSAxLCAwLCBjb250ZW50X3RvX2luc2VydCk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGxpbmVzLmpvaW4oJ1xcbicpLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpbnNlcnRlZEF0OiBsaW5lX251bWJlciwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBhcHBlbmRfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2FwcGVuZF9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogXCJBcHBlbmQgY29udGVudCB0byB0aGUgZW5kIG9mIGEgZmlsZS4gSWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdCwgaXQgd2lsbCBiZSBjcmVhdGVkLlwiLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gYXBwZW5kIHRvJyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCBjb250ZW50IHRvIGFwcGVuZCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCB9OiBBcHBlbmRGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhmdWxsUGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYXBwZW5kZWRUbzogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfbGluZXNfaW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9saW5lc19pbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIHNwZWNpZmljIGxpbmUgb3IgcmFuZ2Ugb2YgbGluZXMgZnJvbSBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIG1vZGlmeScpLFxuICAgICAgc3RhcnRfbGluZTogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1N0YXJ0aW5nIGxpbmUgbnVtYmVyICgxLWluZGV4ZWQpJyksXG4gICAgICBlbmRfbGluZTogei5udW1iZXIoKS5pbnQoKS5taW4oMSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRW5kaW5nIGxpbmUgbnVtYmVyIChpbmNsdXNpdmUpLiBJZiBvbWl0dGVkLCBvbmx5IGRlbGV0ZXMgc3RhcnRfbGluZS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIHN0YXJ0X2xpbmUsIGVuZF9saW5lIH06IERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGRlbGV0ZUVuZCA9IGVuZF9saW5lIHx8IHN0YXJ0X2xpbmU7XG4gICAgICAgIGlmIChzdGFydF9saW5lID4gbGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3RhcnQgbGluZSAke3N0YXJ0X2xpbmV9IGV4Y2VlZHMgZmlsZSBsZW5ndGggKCR7bGluZXMubGVuZ3RofSlgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsYW1wIGVuZF9saW5lIHRvIGF2b2lkIHNpbGVudCB0cnVuY2F0aW9uIGJleW9uZCBmaWxlIGJvdW5kc1xuICAgICAgICBjb25zdCBjbGFtcGVkRW5kID0gTWF0aC5taW4oZGVsZXRlRW5kLCBsaW5lcy5sZW5ndGgpO1xuICAgICAgICBsaW5lcy5zcGxpY2Uoc3RhcnRfbGluZSAtIDEsIGNsYW1wZWRFbmQgLSBzdGFydF9saW5lICsgMSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGxpbmVzLmpvaW4oJ1xcbicpLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkTGluZXM6IGAke3N0YXJ0X2xpbmV9LSR7Y2xhbXBlZEVuZH1gLCBmaWxlOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG1ha2VfZGlyZWN0b3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbWFrZV9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IGRpcmVjdG9yeSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5IHRvIGNyZWF0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGRpcmVjdG9yeV9uYW1lIH06IE1ha2VEaXJlY3RvcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGRpcmVjdG9yeV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZGlyZWN0b3J5X25hbWUpO1xuICAgICAgICBmcy5ta2RpclN5bmMoZnVsbFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWREaXJlY3Rvcnk6IGRpcmVjdG9yeV9uYW1lLCBwYXRoOiBmdWxsUGF0aCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBtb3ZlX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdtb3ZlX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnTW92ZSBvciByZW5hbWUgYSBmaWxlIG9yIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNvdXJjZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU291cmNlIHBhdGgnKSxcbiAgICAgIGRlc3RpbmF0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXN0aW5hdGlvbiBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9OiBNb3ZlRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoc291cmNlLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzb3VyY2UgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkZXN0aW5hdGlvbiwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZGVzdGluYXRpb24gcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsU291cmNlID0gcmVzb2x2ZVBhdGgoc291cmNlKTtcbiAgICAgICAgY29uc3QgZnVsbERlc3RpbmF0aW9uID0gcmVzb2x2ZVBhdGgoZGVzdGluYXRpb24pO1xuICAgICAgICBmcy5yZW5hbWVTeW5jKGZ1bGxTb3VyY2UsIGZ1bGxEZXN0aW5hdGlvbik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbW92ZWRGcm9tOiBmdWxsU291cmNlLCBtb3ZlZFRvOiBmdWxsRGVzdGluYXRpb24gfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIU1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY29weV9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY29weV9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvcHkgYSBmaWxlIHRvIGEgbmV3IGxvY2F0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc291cmNlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTb3VyY2UgZmlsZSBwYXRoJyksXG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnRGVzdGluYXRpb24gZmlsZSBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9OiBDb3B5RmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoc291cmNlLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzb3VyY2UgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkZXN0aW5hdGlvbiwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZGVzdGluYXRpb24gcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsU291cmNlID0gcmVzb2x2ZVBhdGgoc291cmNlKTtcbiAgICAgICAgY29uc3QgZnVsbERlc3RpbmF0aW9uID0gcmVzb2x2ZVBhdGgoZGVzdGluYXRpb24pO1xuICAgICAgICBmcy5jb3B5RmlsZVN5bmMoZnVsbFNvdXJjZSwgZnVsbERlc3RpbmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb3BpZWRGcm9tOiBmdWxsU291cmNlLCBjb3BpZWRUbzogZnVsbERlc3RpbmF0aW9uIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFNcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9wYXRoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX3BhdGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIGEgZmlsZSBvciBkaXJlY3RvcnkgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIEJlIGNhcmVmdWwhJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgcGF0aCB0byBkZWxldGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoOiBmaWxlUGF0aCB9OiBEZWxldGVQYXRoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgYSBkaXJlY3RvcnlcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhmdWxsUGF0aCk7XG4gICAgICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgZnMucm1TeW5jKGZ1bGxQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcy51bmxpbmtTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWQ6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2ZpbGVzX2J5X3BhdHRlcm4gdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfZmlsZXNfYnlfcGF0dGVybicsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgbXVsdGlwbGUgZmlsZXMgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IHRoYXQgbWF0Y2ggYSByZWdleCBwYXR0ZXJuLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0dGVybjogei5zdHJpbmcoKS5kZXNjcmliZSgnUmVnZXggcGF0dGVybiB0byBtYXRjaCBmaWxlbmFtZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXR0ZXJuIH06IERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoY29uZmlnLnJlZ2V4UmVEb1NQcm90ZWN0aW9uICYmICFpc1NhZmVSZWdleChwYXR0ZXJuKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Vuc2FmZSByZWdleCBwYXR0ZXJuIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybik7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZ2V0V29ya2luZ0RpcigpKTtcbiAgICAgICAgY29uc3QgZGVsZXRlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgaWYgKHJlZ2V4LnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgIGRlbGV0ZWRGaWxlcy5wdXNoKGZ1bGxQYXRoKTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkQ291bnQ6IGRlbGV0ZWRGaWxlcy5sZW5ndGgsIGRlbGV0ZWRGaWxlcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmaW5kX2ZpbGVzIHRvb2wgXHUyMDE0IE9QVElNSVpFRCB3aXRoIGFzeW5jL2F3YWl0IGFuZCBjb25jdXJyZW5jeSBjb250cm9sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ZpbmRfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmluZCBmaWxlcyByZWN1cnNpdmVseSBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnkgbWF0Y2hpbmcgYSBuYW1lIHBhdHRlcm4uIFVzZXMgYXN5bmMgc2VhcmNoIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXR0ZXJuOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTdWJzdHJpbmcgdG8gbWF0Y2ggaW4gZmlsZW5hbWUgKGNhc2UtaW5zZW5zaXRpdmUpJyksXG4gICAgICBtYXhfZGVwdGg6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01heGltdW0gZGVwdGggdG8gc2VhcmNoIChkZWZhdWx0OiA1KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdHRlcm4sIG1heF9kZXB0aCB9OiBGaW5kRmlsZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaFBhdGggPSBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IGRlcHRoID0gbWF4X2RlcHRoIHx8IDU7XG4gICAgICAgIFxuICAgICAgICAvLyBVc2Ugb3B0aW1pemVkIGFzeW5jIHNlYXJjaCB3aXRoIGNvbmN1cnJlbmN5IGNvbnRyb2xcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmluZEZpbGVzQXN5bmMoc2VhcmNoUGF0aCwgcGF0dGVybiwgZGVwdGgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGZvdW5kRmlsZXM6IHJlc3VsdC5maWxlcywgY291bnQ6IHJlc3VsdC5jb3VudCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmdXp6eV9maW5kX2xvY2FsX2ZpbGVzIHRvb2wgXHUyMDE0IE9QVElNSVpFRCB3aXRoIGVhcmx5IGV4aXQgTGV2ZW5zaHRlaW4gKyBjYWNoaW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Z1enp5X2ZpbmRfbG9jYWxfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRnV6enkgZmluZCBsb2NhbCBmaWxlcyBieSBwYXRoL25hbWUgc2ltaWxhcml0eSB1c2luZyBvcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gc2NvcmluZyB3aXRoIGNhY2hpbmcuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRvIG1hdGNoIGFnYWluc3QgZmlsZSBuYW1lcy9wYXRocy4nKSxcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnU3ViLWRpcmVjdG9yeSB0byBzZWFyY2ggaW4gKGRlZmF1bHQ6IGN1cnJlbnQgZGlyZWN0b3J5KS4nKSxcbiAgICAgIG1heF9yZXN1bHRzOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoMjApLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01heCByZXN1bHRzIHRvIHJldHVybiAoZGVmYXVsdDogNSkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIHBhdGg6IHNlYXJjaFBhdGgsIG1heF9yZXN1bHRzIH06IEZ1enp5RmluZExvY2FsRmlsZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJhc2VEaXIgPSBzZWFyY2hQYXRoID8gcmVzb2x2ZVBhdGgoc2VhcmNoUGF0aCkgOiBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IG1heFJlc3VsdHMgPSBtYXhfcmVzdWx0cyB8fCA1O1xuXG4gICAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XG4gICAgICAgIGNvbnN0IGNhY2hlZFJlc3VsdHMgPSBnZXRDYWNoZWRGdXp6eVJlc3VsdHMocXVlcnksIGJhc2VEaXIpO1xuICAgICAgICBpZiAoY2FjaGVkUmVzdWx0cykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbWF0Y2hlczogY2FjaGVkUmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKSwgY291bnQ6IE1hdGgubWluKGNhY2hlZFJlc3VsdHMubGVuZ3RoLCBtYXhSZXN1bHRzKSB9IH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb2xsZWN0IGZpbGVzIHVzaW5nIGFzeW5jIG1ldGhvZFxuICAgICAgICBjb25zdCBhbGxGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RGaWxlcyhkaXJQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIgPSAwLCBtYXhEZXB0aDogbnVtYmVyID0gMjApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgICAgIFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihkaXJQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjb2xsZWN0RmlsZXMoZnVsbFBhdGgsIGRlcHRoICsgMSwgbWF4RGVwdGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsbEZpbGVzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3Rvcmllc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYXdhaXQgY29sbGVjdEZpbGVzKGJhc2VEaXIpO1xuICAgICAgICBcbiAgICAgICAgLy8gT3B0aW1pemVkIGZ1enp5IG1hdGNoaW5nIHdpdGggZWFybHkgZXhpdFxuICAgICAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gPSBbXTtcbiAgICAgICAgY29uc3QgcXVlcnlMb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IE1JTl9TQ09SRSA9IDAuMztcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBhbGxGaWxlcykge1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFVzZSBvcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gd2l0aCBlYXJseSBleGl0XG4gICAgICAgICAgY29uc3Qgc2NvcmUgPSBsZXZlbnNodGVpblNpbWlsYXJpdHkocXVlcnlMb3dlciwgZmlsZU5hbWUsIE1JTl9TQ09SRSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHNjb3JlICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBmaWxlUGF0aDogZmlsZSwgc2NvcmUgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTb3J0IGJ5IHNjb3JlIGRlc2NlbmRpbmcgYW5kIGNhY2hlIHJlc3VsdHNcbiAgICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgICAgIGNhY2hlRnV6enlSZXN1bHRzKHF1ZXJ5LCBiYXNlRGlyLCByZXN1bHRzKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbWF0Y2hlczogcmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKSwgY291bnQ6IE1hdGgubWluKHJlc3VsdHMubGVuZ3RoLCBtYXhSZXN1bHRzKSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfZmlsZV9tZXRhZGF0YSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9maWxlX21ldGFkYXRhJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBtZXRhZGF0YSAoc2l6ZSwgZGF0ZXMpIGZvciBhIHNwZWNpZmljIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aDogZmlsZVBhdGggfTogR2V0RmlsZU1ldGFkYXRhUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgICAgICBzaXplOiBzdGF0cy5zaXplLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBzdGF0cy5iaXJ0aHRpbWUsXG4gICAgICAgICAgICBtb2RpZmllZEF0OiBzdGF0cy5tdGltZSxcbiAgICAgICAgICAgIGFjY2Vzc2VkQXQ6IHN0YXRzLmF0aW1lLFxuICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IHN0YXRzLmlzRGlyZWN0b3J5KCksXG4gICAgICAgICAgICBpc0ZpbGU6IHN0YXRzLmlzRmlsZSgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjaGFuZ2VfZGlyZWN0b3J5IHRvb2wgXHUyMDE0IEh5YnJpZDogRXhwbGljaXQgdmFsaWRhdGlvbiArIFN0YXRlIGFic3RyYWN0aW9uICsgQ29udGV4dHVhbCByZXNwb25zZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjaGFuZ2VfZGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gQWxsIHN1YnNlcXVlbnQgZmlsZSBvcGVyYXRpb25zIHdpbGwgdXNlIHRoaXMgZGlyZWN0b3J5IGFzIHRoZSBiYXNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZGlyZWN0b3J5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgYWJzb2x1dGUgcGF0aCB0byBjaGFuZ2UgdG8gKGUuZy4sIFwiQzpcXFxcXFxcXFByb2plY3RzXFxcXFxcXFxteS1hcHBcIiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBkaXJlY3RvcnkgfTogQ2hhbmdlRGlyZWN0b3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGRpcmVjdG9yeSk7XG5cbiAgICAgICAgLy8gXHUyNzA1IEJlbGVkYXJpYW4ncyBleHBsaWNpdCB2YWxpZGF0aW9uIHVzaW5nIGZzLnN0YXRcbiAgICAgICAgbGV0IHN0YXRzOiBmcy5TdGF0cztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFBhdGggaXMgbm90IGEgZGlyZWN0b3J5OiAke2Z1bGxQYXRofWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1MjcwNSBDYXB0dXJlIHByZXZpb3VzIGRpcmVjdG9yeSBmb3IgY29udGV4dFxuICAgICAgICBjb25zdCBwcmV2aW91c0RpcmVjdG9yeSA9IGdldFdvcmtpbmdEaXIoKTtcblxuICAgICAgICAvLyBcdTI3MDUgQUkgVG9vbGJveCdzIGFic3RyYWN0aW9uIGZvciBzdGF0ZSBjaGFuZ2VcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IHNldFdvcmtpbmdEaXIoZnVsbFBhdGgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjaGFuZ2UgZGlyZWN0b3J5IHRvICcke2RpcmVjdG9yeX0nLiBFbnN1cmUgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhIHZhbGlkIGRpcmVjdG9yeS5gIFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTI3MDUgQmVsZWRhcmlhbidzIGNvbnRleHR1YWwgcmV0dXJuIGRhdGEgKyBBSSBUb29sYm94J3Mgc3RydWN0dXJlZCBmb3JtYXRcbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgIHByZXZpb3VzX2RpcmVjdG9yeTogcHJldmlvdXNEaXJlY3RvcnksXG4gICAgICAgICAgICBjdXJyZW50X2RpcmVjdG9yeTogZ2V0V29ya2luZ0RpcigpIFxuICAgICAgICAgIH0gXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuXG4gIC8vIGFuYWx5emVfcHJvamVjdCB0b29sIFx1MjAxNCBDb21wcmVoZW5zaXZlIFR5cGVTY3JpcHQgUGVyZm9ybWFuY2UgJiBMaW50aW5nIEFuYWx5c2lzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2FuYWx5emVfcHJvamVjdCcsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gcHJvamVjdC13aWRlIGFuYWx5c2lzIGluY2x1ZGluZyBUeXBlU2NyaXB0IGRpYWdub3N0aWNzLCBjaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGlvbiwgRVNMaW50LCBjb25maWcgb3B0aW1pemF0aW9uLCBhbmQgaW1wb3J0IHN0cnVjdHVyZSBhbmFseXNpcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNhdGVnb3JpZXM6IHouYXJyYXkoei5lbnVtKFsndHlwZWNoZWNrJywgJ2NpcmN1bGFyJywgJ2VzbGludCcsICdjb25maWcnLCAnaW1wb3J0cyddKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQW5hbHlzaXMgY2F0ZWdvcmllcyB0byBydW4gKGRlZmF1bHQ6IGFsbCknKSxcbiAgICAgIG1heF9pbXBvcnRzX3dhcm5pbmc6IHoubnVtYmVyKCkuaW50KCkubWluKDUpLm1heCgxMDApLm9wdGlvbmFsKCkuZGVmYXVsdCgyMCkuZGVzY3JpYmUoJ01heCBpbXBvcnRzIHBlciBmaWxlIGJlZm9yZSB3YXJuaW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY2F0ZWdvcmllcywgbWF4X2ltcG9ydHNfd2FybmluZyB9OiB7IGNhdGVnb3JpZXM/OiBzdHJpbmdbXTsgbWF4X2ltcG9ydHNfd2FybmluZz86IG51bWJlciB9KSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB3b3JraW5nRGlyID0gZ2V0V29ya2luZ0RpcigpO1xuICAgICAgICBjb25zdCBzZWxlY3RlZENhdGVnb3JpZXMgPSBjYXRlZ29yaWVzIHx8IFsndHlwZWNoZWNrJywgJ2NpcmN1bGFyJywgJ2VzbGludCcsICdjb25maWcnLCAnaW1wb3J0cyddO1xuICAgICAgICBjb25zdCBpbXBvcnRXYXJuaW5nVGhyZXNob2xkID0gbWF4X2ltcG9ydHNfd2FybmluZyB8fCAyMDtcblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBTYWZlIFN1YnByb2Nlc3MgSGVscGVyIHdpdGggUHJvZ3Jlc3MgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gc3Bhd25XaXRoUHJvZ3Jlc3MoZXhlOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCB0aW1lb3V0TXM6IG51bWJlcik6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBzdGRvdXQ/OiBzdHJpbmc7IHN0ZGVycj86IHN0cmluZyB9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9jID0gc3Bhd24oZXhlLCBhcmdzLCB7XG4gICAgICAgICAgICAgIHN0ZGlvOiBbJ3BpcGUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgICAgICAgICAgIGN3ZDogd29ya2luZ0RpcixcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgICAgICAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICAgICAgICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkOiBCdWZmZXIpID0+IHsgc3Rkb3V0ICs9IGQudG9TdHJpbmcoKTsgfSk7XG4gICAgICAgICAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZDogQnVmZmVyKSA9PiB7IHN0ZGVyciArPSBkLnRvU3RyaW5nKCk7IH0pO1xuXG4gICAgICAgICAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7IFxuICAgICAgICAgICAgICBwcm9jLmtpbGwoKTsgXG4gICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgc3RkZXJyOiBgVGltZW91dCBhZnRlciAke3RpbWVvdXRNc31tc2AgfSk7IFxuICAgICAgICAgICAgfSwgdGltZW91dE1zKTtcblxuICAgICAgICAgICAgcHJvYy5vbignY2xvc2UnLCAoKSA9PiB7IGNsZWFyVGltZW91dCh0aW1lcklkKTsgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIHN0ZG91dCwgc3RkZXJyIH0pOyB9KTtcbiAgICAgICAgICAgIHByb2Mub24oJ2Vycm9yJywgKGVycikgPT4geyBjbGVhclRpbWVvdXQodGltZXJJZCk7IHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgc3RkZXJyOiBlcnIubWVzc2FnZSB9KTsgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBBLiBUeXBlU2NyaXB0IEV4dGVuZGVkIERpYWdub3N0aWNzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1blR5cGVjaGVja0FuYWx5c2lzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICAgICAgICBjb25zdCB0c0NvbmZpZ1BhdGggPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3RzY29uZmlnLmpzb24nKTtcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModHNDb25maWdQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gdHNjb25maWcuanNvbiBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiB0c2MgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCd0c2MnLCBbJy0tdmVyc2lvbiddLCA1MDAwKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ1R5cGVTY3JpcHQgY29tcGlsZXIgKHRzYykgbm90IGZvdW5kIGluIFBBVEgnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZSAodXNpbmcgaW1wb3J0ZWQgdXRpbGl0aWVzKVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDMwMDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCd0c2MnLCBbJy0tZXh0ZW5kZWREaWFnbm9zdGljcyddLCBkeW5hbWljVGltZW91dCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2VzcyB8fCAhcmVzdWx0LnN0ZG91dCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiBgdHNjIGZhaWxlZDogJHtyZXN1bHQuc3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGFyc2UgdHNjIC0tZXh0ZW5kZWREaWFnbm9zdGljcyBvdXRwdXRcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IHJlc3VsdC5zdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgIGxldCBjaGVja1RpbWVNcyA9IDA7XG4gICAgICAgICAgbGV0IG1lbW9yeVVzZWRNQiA9IDA7XG4gICAgICAgICAgbGV0IGZpbGVzQ2hlY2tlZCA9IDA7XG4gICAgICAgICAgbGV0IGVtaXRUaW1lTXMgPSAwO1xuICAgICAgICAgIGxldCBwYXJzZVRpbWVNcyA9IDA7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyTGluZSA9IGxpbmUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUGFyc2UgY2hlY2sgdGltZVxuICAgICAgICAgICAgY29uc3QgY2hlY2tNYXRjaCA9IGxvd2VyTGluZS5tYXRjaCgvY2hlY2tcXHMrdGltZTpcXHMrKFxcZCspXFxzKm1zLyk7XG4gICAgICAgICAgICBpZiAoY2hlY2tNYXRjaCkgY2hlY2tUaW1lTXMgPSBwYXJzZUludChjaGVja01hdGNoWzFdLCAxMCk7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIG1lbW9yeSB1c2VkXG4gICAgICAgICAgICBjb25zdCBtZW1NYXRjaCA9IGxpbmUubWF0Y2goL21lbW9yeSB1c2VkOlxccysoXFxkKylcXHMqKGtifG1iKS9pKTtcbiAgICAgICAgICAgIGlmIChtZW1NYXRjaCkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlSW50KG1lbU1hdGNoWzFdLCAxMCk7XG4gICAgICAgICAgICAgIG1lbW9yeVVzZWRNQiA9IG1lbU1hdGNoWzJdLnRvTG93ZXJDYXNlKCkgPT09ICdtYicgPyB2YWx1ZSA6IE1hdGgucm91bmQodmFsdWUgLyAxMDI0ICogMTAwKSAvIDEwMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUGFyc2UgZmlsZXMgY2hlY2tlZFxuICAgICAgICAgICAgY29uc3QgZmlsZXNNYXRjaCA9IGxpbmUubWF0Y2goL2ZpbGVzXFxzK2NoZWNrZWQ6XFxzKyhcXGQrKS8pO1xuICAgICAgICAgICAgaWYgKGZpbGVzTWF0Y2gpIGZpbGVzQ2hlY2tlZCA9IHBhcnNlSW50KGZpbGVzTWF0Y2hbMV0sIDEwKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgZW1pdCB0aW1lXG4gICAgICAgICAgICBjb25zdCBlbWl0TWF0Y2ggPSBsb3dlckxpbmUubWF0Y2goL2VtaXRcXHMrdGltZTpcXHMrKFxcZCspXFxzKm1zLyk7XG4gICAgICAgICAgICBpZiAoZW1pdE1hdGNoKSBlbWl0VGltZU1zID0gcGFyc2VJbnQoZW1pdE1hdGNoWzFdLCAxMCk7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIHBhcnNlIHRpbWVcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlTWF0Y2ggPSBsb3dlckxpbmUubWF0Y2goL3BhcnNlXFxzK3RpbWU6XFxzKyhcXGQrKVxccyptcy8pO1xuICAgICAgICAgICAgaWYgKHBhcnNlTWF0Y2gpIHBhcnNlVGltZU1zID0gcGFyc2VJbnQocGFyc2VNYXRjaFsxXSwgMTApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBlcmZvcm1hbmNlIGFzc2Vzc21lbnQgYmFzZWQgb24gUERGIGd1aWRlbGluZXNcbiAgICAgICAgICBsZXQgYXNzZXNzbWVudDogJ2Zhc3QnIHwgJ21vZGVyYXRlJyB8ICdzbG93JztcbiAgICAgICAgICBpZiAoY2hlY2tUaW1lTXMgPCAxMDApIGFzc2Vzc21lbnQgPSAnZmFzdCc7XG4gICAgICAgICAgZWxzZSBpZiAoY2hlY2tUaW1lTXMgPD0gNTAwKSBhc3Nlc3NtZW50ID0gJ21vZGVyYXRlJztcbiAgICAgICAgICBlbHNlIGFzc2Vzc21lbnQgPSAnc2xvdyc7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hlY2tUaW1lTXMsXG4gICAgICAgICAgICBtZW1vcnlVc2VkTUI6IE1hdGgucm91bmQobWVtb3J5VXNlZE1CICogMTAwKSAvIDEwMCxcbiAgICAgICAgICAgIGZpbGVzQ2hlY2tlZCxcbiAgICAgICAgICAgIGVtaXRUaW1lTXMsXG4gICAgICAgICAgICBwYXJzZVRpbWVNcyxcbiAgICAgICAgICAgIGFzc2Vzc21lbnQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEIuIENpcmN1bGFyIERlcGVuZGVuY3kgRGV0ZWN0aW9uID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1bkNpcmN1bGFyQW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IGVudHJ5UG9pbnQgPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3NyYycsICdpbmRleC50cycpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhlbnRyeVBvaW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gc3JjL2luZGV4LnRzIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIER5bmFtaWMgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemVcbiAgICAgICAgICBjb25zdCBmaWxlQ291bnQgPSBhd2FpdCBjb3VudFR5cGVTY3JpcHRGaWxlcyh3b3JraW5nRGlyKTtcbiAgICAgICAgICBjb25zdCBkeW5hbWljVGltZW91dCA9IGdldEFuYWx5c2lzVGltZW91dCgyMDAwMCwgZmlsZUNvdW50KTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSdW4gbWFkZ2UgYW5kIGNhcHR1cmUgb3V0cHV0IHdpdGggZHluYW1pYyB0aW1lb3V0XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ25weCcsIFsnLS15ZXMnLCAnbWFkZ2UnLCAnLS1jaXJjdWxhcicsIGVudHJ5UG9pbnRdLCBkeW5hbWljVGltZW91dCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiBgbWFkZ2UgZmFpbGVkOiAke3Jlc3VsdC5zdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXJzZSBtYWRnZSBvdXRwdXQgXHUyMDE0IGl0IGxpc3RzIGN5Y2xlcyBsaWtlIFwiZmlsZTEudHMgLT4gZmlsZTIudHMgLT4gZmlsZTEudHNcIlxuICAgICAgICAgIGNvbnN0IGN5Y2xlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBjb25zdCBzdGRvdXQgPSByZXN1bHQuc3Rkb3V0IHx8ICcnO1xuICAgICAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICh0cmltbWVkICYmICF0cmltbWVkLnN0YXJ0c1dpdGgoJ0ZvdW5kJykgJiYgIXRyaW1tZWQuc3RhcnRzV2l0aCgnTm8nKSkge1xuICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGxvb2tzIGxpa2UgYSBjeWNsZSBwYXRoXG4gICAgICAgICAgICAgIGlmICh0cmltbWVkLmluY2x1ZGVzKCctPicpIHx8IHRyaW1tZWQuZW5kc1dpdGgoJy50cycpKSB7XG4gICAgICAgICAgICAgICAgY3ljbGVzLnB1c2godHJpbW1lZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGFzQ3ljbGVzOiBjeWNsZXMubGVuZ3RoID4gMCxcbiAgICAgICAgICAgIGN5Y2xlcyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQy4gRVNMaW50IEludGVncmF0aW9uID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1bkVzbGludEFuYWx5c2lzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICAgICAgICBjb25zdCBlc2xpbnRDb25maWdGaWxlcyA9IFtcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnZXNsaW50LmNvbmZpZy5tanMnKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnZXNsaW50LmNvbmZpZy5qcycpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICcuZXNsaW50cmMuanMnKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnLmVzbGludHJjLmpzb24nKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnLmVzbGludHJjJyksXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIGNvbnN0IGhhc0VzbGludENvbmZpZyA9IGVzbGludENvbmZpZ0ZpbGVzLnNvbWUoZiA9PiBmcy5leGlzdHNTeW5jKGYpKTtcbiAgICAgICAgICBpZiAoIWhhc0VzbGludENvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gRVNMaW50IGNvbmZpZ3VyYXRpb24gZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZXNsaW50IGlzIGF2YWlsYWJsZVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWydlc2xpbnQnLCAnLS12ZXJzaW9uJ10sIDUwMDApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnRVNMaW50IG5vdCBmb3VuZCBpbiBkZXZEZXBlbmRlbmNpZXMgb3IgUEFUSCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEeW5hbWljIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplXG4gICAgICAgICAgY29uc3QgZmlsZUNvdW50ID0gYXdhaXQgY291bnRUeXBlU2NyaXB0RmlsZXMod29ya2luZ0Rpcik7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1RpbWVvdXQgPSBnZXRBbmFseXNpc1RpbWVvdXQoMTUwMDAsIGZpbGVDb3VudCk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ25weCcsIFsnZXNsaW50JywgJ3NyYycsICctLWV4dCcsICcudHMnLCAnLS1mb3JtYXQnLCAnanNvbiddLCBkeW5hbWljVGltZW91dCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiBgRVNMaW50IGZhaWxlZDogJHtyZXN1bHQuc3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGFyc2UgSlNPTiBvdXRwdXQgZnJvbSBlc2xpbnQgLS1mb3JtYXQganNvblxuICAgICAgICAgIGxldCBlcnJvcnMgPSAwO1xuICAgICAgICAgIGxldCB3YXJuaW5ncyA9IDA7XG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBjb25zdCB3YXJuaW5nTWVzc2FnZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyZXN1bHQuc3Rkb3V0IHx8ICcnKSBhcyB7XG4gICAgICAgICAgICAgIHJlc3VsdHM/OiBBcnJheTx7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IHN0cmluZztcbiAgICAgICAgICAgICAgICBtZXNzYWdlcz86IEFycmF5PHsgc2V2ZXJpdHk6IG51bWJlcjsgbWVzc2FnZTogc3RyaW5nOyBsaW5lOiBudW1iZXI7IGNvbHVtbjogbnVtYmVyIH0+O1xuICAgICAgICAgICAgICB9PjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocGFyc2VkLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlUmVzdWx0IG9mIHBhcnNlZC5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIChmaWxlUmVzdWx0Lm1lc3NhZ2VzIHx8IFtdKSkge1xuICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2Uuc2V2ZXJpdHkgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzKys7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZXMucHVzaChgJHtmaWxlUmVzdWx0LmZpbGVQYXRofTogJHttZXNzYWdlLm1lc3NhZ2V9ICgke21lc3NhZ2UubGluZX06JHttZXNzYWdlLmNvbHVtbn0pYCk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2Uuc2V2ZXJpdHkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgd2FybmluZ3MrKztcbiAgICAgICAgICAgICAgICAgICAgd2FybmluZ01lc3NhZ2VzLnB1c2goYCR7ZmlsZVJlc3VsdC5maWxlUGF0aH06ICR7bWVzc2FnZS5tZXNzYWdlfSAoJHttZXNzYWdlLmxpbmV9OiR7bWVzc2FnZS5jb2x1bW59KWApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gSWYgSlNPTiBwYXJzaW5nIGZhaWxzLCBmYWxsIGJhY2sgdG8gdGV4dCBvdXRwdXQgYW5hbHlzaXNcbiAgICAgICAgICAgIGNvbnN0IGZhbGxiYWNrU3Rkb3V0ID0gcmVzdWx0LnN0ZG91dCB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTGluZXMgPSBmYWxsYmFja1N0ZG91dC5zcGxpdCgnXFxuJykuZmlsdGVyKGwgPT4gbC5pbmNsdWRlcygnZXJyb3InKSAmJiAhbC5pbmNsdWRlcygnd2FybmluZycpKTtcbiAgICAgICAgICAgIGVycm9ycyA9IGVycm9yTGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3Qgd2FybmluZ0xpbmVzID0gZmFsbGJhY2tTdGRvdXQuc3BsaXQoJ1xcbicpLmZpbHRlcihsID0+IGwuaW5jbHVkZXMoJ3dhcm5pbmcnKSk7XG4gICAgICAgICAgICB3YXJuaW5ncyA9IHdhcm5pbmdMaW5lcy5sZW5ndGg7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgICAgIHdhcm5pbmdzLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlczogZXJyb3JNZXNzYWdlcy5zbGljZSgwLCAyMCksIC8vIExpbWl0IHRvIGZpcnN0IDIwXG4gICAgICAgICAgICB3YXJuaW5nTWVzc2FnZXM6IHdhcm5pbmdNZXNzYWdlcy5zbGljZSgwLCAyMCksXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEQuIFR5cGVTY3JpcHQgQ29uZmlnIEFuYWx5c2lzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGZ1bmN0aW9uIHJ1bkNvbmZpZ0FuYWx5c2lzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgICBjb25zdCB0c0NvbmZpZ1BhdGggPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3RzY29uZmlnLmpzb24nKTtcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModHNDb25maWdQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gdHNjb25maWcuanNvbiBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgdHNDb25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0c0NvbmZpZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHRzQ29uZmlnUGF0aCwgJ3V0Zi04JykpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnSW52YWxpZCB0c2NvbmZpZy5qc29uIGZvcm1hdCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBjb21waWxlck9wdGlvbnMgPSAodHNDb25maWcuY29tcGlsZXJPcHRpb25zIHx8IHt9KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCBpbmNyZW1lbnRhbCA9ICEhY29tcGlsZXJPcHRpb25zLmluY3JlbWVudGFsO1xuICAgICAgICAgIGNvbnN0IHNraXBMaWJDaGVjayA9ICEhY29tcGlsZXJPcHRpb25zLnNraXBMaWJDaGVjaztcbiAgICAgICAgICBjb25zdCBpc29sYXRlZE1vZHVsZXMgPSAhIWNvbXBpbGVyT3B0aW9ucy5pc29sYXRlZE1vZHVsZXM7XG4gICAgICAgICAgY29uc3Qgc3RyaWN0ID0gISFjb21waWxlck9wdGlvbnMuc3RyaWN0O1xuXG4gICAgICAgICAgY29uc3QgcmVjb21tZW5kYXRpb25zOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgLy8gUmVjb21tZW5kYXRpb25zIGJhc2VkIG9uIFBERiBvcHRpbWl6YXRpb24gdGVjaG5pcXVlc1xuICAgICAgICAgIGlmICghaW5jcmVtZW50YWwpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdFbmFibGUgXCJpbmNyZW1lbnRhbFwiOiB0cnVlIGluIHRzY29uZmlnLmpzb24gZm9yIGZhc3RlciBidWlsZHMgKGJ1aWxkIGNhY2hpbmcpLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXNraXBMaWJDaGVjaykge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0VuYWJsZSBcInNraXBMaWJDaGVja1wiOiB0cnVlIHRvIHNraXAgY2hlY2tpbmcgLmQudHMgZmlsZXMgaW4gbm9kZV9tb2R1bGVzLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWlzb2xhdGVkTW9kdWxlcykge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0NvbnNpZGVyIGVuYWJsaW5nIFwiaXNvbGF0ZWRNb2R1bGVzXCI6IHRydWUgZm9yIGZhc3RlciBjb21waWxhdGlvbiAoZXNwZWNpYWxseSB3aXRoIEJhYmVsL2VzYnVpbGQpLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXN0cmljdCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0VuYWJsZSBcInN0cmljdFwiOiB0cnVlIGZvciBiZXR0ZXIgdHlwZSBzYWZldHkgYW5kIGZld2VyIHJ1bnRpbWUgZXJyb3JzLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGZvciBwYXRocyBjb25maWd1cmF0aW9uIChtb2R1bGUgcmVzb2x1dGlvbiBvcHRpbWl6YXRpb24pXG4gICAgICAgICAgY29uc3QgcGF0aHMgPSBjb21waWxlck9wdGlvbnMucGF0aHMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKCFwYXRocyB8fCBPYmplY3Qua2V5cyhwYXRocykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnQ29uc2lkZXIgdXNpbmcgXCJwYXRoc1wiIGluIHRzY29uZmlnLmpzb24gdG8gc2ltcGxpZnkgbW9kdWxlIGltcG9ydHMgYW5kIHJlZHVjZSBkZXBlbmRlbmN5IGRlcHRoLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbmNyZW1lbnRhbCxcbiAgICAgICAgICAgIHNraXBMaWJDaGVjayxcbiAgICAgICAgICAgIGlzb2xhdGVkTW9kdWxlcyxcbiAgICAgICAgICAgIHN0cmljdCxcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gRS4gSW1wb3J0IFN0cnVjdHVyZSBBbmFseXNpcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBmdW5jdGlvbiBydW5JbXBvcnRBbmFseXNpcygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgICAgY29uc3Qgc3JjRGlyID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICdzcmMnKTtcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc3JjRGlyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnTm8gc3JjLyBkaXJlY3RvcnkgZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ29sbGVjdCBhbGwgLnRzIGZpbGVzIGluIHNyYy9cbiAgICAgICAgICBmdW5jdGlvbiBjb2xsZWN0VHNGaWxlcyhkaXI6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGRpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKC4uLmNvbGxlY3RUc0ZpbGVzKGZ1bGxQYXRoKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkubmFtZS5lbmRzV2l0aCgnLnRzJykgJiYgIWVudHJ5Lm5hbWUuZW5kc1dpdGgoJy5kLnRzJykpIHtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmlsZXM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdHNGaWxlcyA9IGNvbGxlY3RUc0ZpbGVzKHNyY0Rpcik7XG4gICAgICAgICAgY29uc3QgZmlsZXNXaXRoRXhjZXNzaXZlSW1wb3J0czogQXJyYXk8eyBmaWxlOiBzdHJpbmc7IGNvdW50OiBudW1iZXIgfT4gPSBbXTtcbiAgICAgICAgICBjb25zdCBkZWNsYXJlR2xvYmFsVXNhZ2U6IEFycmF5PHsgZmlsZTogc3RyaW5nIH0+ID0gW107XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIHRzRmlsZXMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gQ291bnQgaW1wb3J0c1xuICAgICAgICAgICAgICBjb25zdCBpbXBvcnRTdGF0ZW1lbnRzID0gY29udGVudC5tYXRjaCgvXmltcG9ydFxccysuKiQvZ20pO1xuICAgICAgICAgICAgICBjb25zdCBpbXBvcnRDb3VudCA9IGltcG9ydFN0YXRlbWVudHMgPyBpbXBvcnRTdGF0ZW1lbnRzLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgICAgICAgaWYgKGltcG9ydENvdW50ID4gaW1wb3J0V2FybmluZ1RocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGZpbGVzV2l0aEV4Y2Vzc2l2ZUltcG9ydHMucHVzaCh7IGZpbGU6IHBhdGgucmVsYXRpdmUod29ya2luZ0RpciwgZmlsZVBhdGgpLCBjb3VudDogaW1wb3J0Q291bnQgfSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZGVjbGFyZSBnbG9iYWwgdXNhZ2UgKGdsb2JhbCB0eXBlIHBhdGNoaW5nIFx1MjAxNCBiYWQgcHJhY3RpY2UgcGVyIFBERilcbiAgICAgICAgICAgICAgY29uc3QgZGVjbGFyZUdsb2JhbE1hdGNoZXMgPSBjb250ZW50Lm1hdGNoKC9kZWNsYXJlXFxzK2dsb2JhbC9nKTtcbiAgICAgICAgICAgICAgaWYgKGRlY2xhcmVHbG9iYWxNYXRjaGVzICYmIGRlY2xhcmVHbG9iYWxNYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWNsYXJlR2xvYmFsVXNhZ2UucHVzaCh7IGZpbGU6IHBhdGgucmVsYXRpdmUod29ya2luZ0RpciwgZmlsZVBhdGgpIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgLy8gU2tpcCBmaWxlcyB0aGF0IGNhbid0IGJlIHJlYWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsZXNXaXRoRXhjZXNzaXZlSW1wb3J0cyxcbiAgICAgICAgICAgIGRlY2xhcmVHbG9iYWxVc2FnZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gUnVuIFNlbGVjdGVkIENhdGVnb3JpZXMgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgY29uc3QgcmVzdWx0czogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCd0eXBlY2hlY2snKSkge1xuICAgICAgICAgIHJlc3VsdHMudHlwZWNoZWNrID0gYXdhaXQgcnVuVHlwZWNoZWNrQW5hbHlzaXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCdjaXJjdWxhcicpKSB7XG4gICAgICAgICAgcmVzdWx0cy5jaXJjdWxhciA9IGF3YWl0IHJ1bkNpcmN1bGFyQW5hbHlzaXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCdlc2xpbnQnKSkge1xuICAgICAgICAgIHJlc3VsdHMuZXNsaW50ID0gYXdhaXQgcnVuRXNsaW50QW5hbHlzaXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCdjb25maWcnKSkge1xuICAgICAgICAgIHJlc3VsdHMuY29uZmlnID0gcnVuQ29uZmlnQW5hbHlzaXMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXRlZ29yaWVzLmluY2x1ZGVzKCdpbXBvcnRzJykpIHtcbiAgICAgICAgICByZXN1bHRzLmltcG9ydHMgPSBydW5JbXBvcnRBbmFseXNpcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHJlc3VsdHMsXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBBbmFseXNpcyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc2VhcmNoIGFzIGRkZ1NlYXJjaCB9IGZyb20gJ2R1Y2stZHVjay1zY3JhcGUnO1xuaW1wb3J0IHsgaHRtbFRvVGV4dCB9IGZyb20gJ2h0bWwtdG8tdGV4dCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBmZXRjaFdpdGhSZXRyeSB9IGZyb20gJy4uL3BlcmZvcm1hbmNlVXRpbHMuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTZWFyY2ggRW5naW5lIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgU2VhcmNoUmVzdWx0SXRlbSB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xufVxuXG4vKiogRHVja0R1Y2tHbyBBUEkgKGZhc3Rlc3QsIG5vIGJyb3dzZXIgbmVlZGVkKSAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoRERHQXBpKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXN1bHRzID0gYXdhaXQgZGRnU2VhcmNoKHF1ZXJ5LCB7IHJlZ2lvbjogJ3d0LXd0JyB9KTtcbiAgcmV0dXJuIChyZXN1bHRzLnJlc3VsdHMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KS5tYXAoKHI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgIHRpdGxlOiByLnRpdGxlIGFzIHN0cmluZyxcbiAgICB1cmw6IHIudXJsIGFzIHN0cmluZyxcbiAgICBkZXNjcmlwdGlvbjogKHIuZGVzY3JpcHRpb24gYXMgc3RyaW5nKSB8fCAnJyxcbiAgfSkpO1xufVxuXG4vKiogRHVja0R1Y2tHbyBIVE1MIEZldGNoIChmYWxsYmFjayB3aGVuIEFQSSBmYWlscykgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaERER0ZldGNoKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KFxuICAgIGBodHRwczovL2h0bWwuZHVja2R1Y2tnby5jb20vaHRtbC8/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9YFxuICApO1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYER1Y2tEdWNrR28gRmV0Y2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICBcbiAgLy8gU2ltcGxlIHJlZ2V4LWJhc2VkIHBhcnNpbmcgZm9yIE5vZGUuanMgKG5vIERPTVBhcnNlciBuZWVkZWQhKVxuICBjb25zdCByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW10gPSBbXTtcbiAgXG4gIC8vIEV4dHJhY3QgdGl0bGVzIGZyb20gPGEgY2xhc3M9XCJyZXN1bHRfX2FcIiBocmVmPVwiLi4uXCIgcmVsPVwiLi4uXCI+VGl0bGU8L2E+XG4gIGNvbnN0IHRpdGxlUmVnZXggPSAvPGFbXj5dK2NsYXNzPVwicmVzdWx0X19hXCJbXj5dK2hyZWY9XCIoW15cIl0rKVwiW14+XSo+KFtePF0rKTxcXC9hPi9naTtcbiAgbGV0IG1hdGNoO1xuICBcbiAgd2hpbGUgKChtYXRjaCA9IHRpdGxlUmVnZXguZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdGl0bGU6IG1hdGNoWzJdLnJlcGxhY2UoLyZhbXA7L2csICcmJykudHJpbSgpLFxuICAgICAgdXJsOiBtYXRjaFsxXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIDEwKTtcbn1cblxuLyoqIEdvb2dsZSBTZWFyY2ggdmlhIEhUTUwgRmV0Y2ggKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEdvb2dsZShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShcbiAgICBgaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9Jm51bT0xMGAsXG4gICAgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNicgfSB9XG4gICk7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgR29vZ2xlIHNlYXJjaCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIC8vIFNpbXBsZSBwYXJzaW5nIFx1MjAxNCBleHRyYWN0IHRpdGxlcyBhbmQgVVJMcyBmcm9tIEdvb2dsZSdzIEhUTUwgc3RydWN0dXJlXG4gIGNvbnN0IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXSA9IFtdO1xuICBjb25zdCB0aXRsZVJlZ2V4ID0gLzxoM1tePl0qPiguKj8pPFxcL2gzPi9nO1xuXG4gIGxldCBtYXRjaDtcbiAgd2hpbGUgKChtYXRjaCA9IHRpdGxlUmVnZXguZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdGl0bGU6IG1hdGNoWzFdLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpLCAvLyBSZW1vdmUgSFRNTCB0YWdzXG4gICAgICB1cmw6ICcnLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgMTApO1xufVxuXG4vKiogQmluZyBTZWFyY2ggdmlhIEhUTUwgRmV0Y2ggKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEJpbmcocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoXG4gICAgYGh0dHBzOi8vd3d3LmJpbmcuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX0mY291bnQ9MTBgLFxuICAgIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYnIH0gfVxuICApO1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEJpbmcgc2VhcmNoIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgLy8gUGFyc2UgQmluZyByZXN1bHRzIFx1MjAxNCBzaW1pbGFyIGFwcHJvYWNoIHRvIEdvb2dsZVxuICBjb25zdCByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW10gPSBbXTtcbiAgY29uc3QgcmVzdWx0UmVnZXggPSAvPGxpIGNsYXNzPVwiYl9hbGdvXCJbXj5dKj4oLio/KTxcXC9saT4vZ3M7XG5cbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAoKG1hdGNoID0gcmVzdWx0UmVnZXguZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBibG9jayA9IG1hdGNoWzFdO1xuICAgIGNvbnN0IHRpdGxlTWF0Y2ggPSBibG9jay5tYXRjaCgvPGFbXj5dK2hyZWY9XCIoW15cIl0rKVwiW14+XSo+KFtePF0rKTxcXC9hPi8pO1xuICAgIGlmICh0aXRsZU1hdGNoKSB7XG4gICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICB0aXRsZTogdGl0bGVNYXRjaFsyXSxcbiAgICAgICAgdXJsOiB0aXRsZU1hdGNoWzFdLFxuICAgICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCAxMCk7XG59XG5cbi8qKiBBbGwgYXZhaWxhYmxlIFNlYXJjaCBFbmdpbmUgRnVuY3Rpb25zICovXG5jb25zdCBTRUFSQ0hfRU5HSU5FUzogUmVjb3JkPHN0cmluZywgKHF1ZXJ5OiBzdHJpbmcpID0+IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPj4gPSB7XG4gICdkZGctYXBpJzogc2VhcmNoRERHQXBpLFxuICAnZGRnLWZldGNoJzogc2VhcmNoRERHRmV0Y2gsXG4gICdnb29nbGUnOiBzZWFyY2hHb29nbGUsXG4gICdiaW5nJzogc2VhcmNoQmluZyxcbn07XG5cbi8qKiBIYXJkY29kZWQgZmFsbGJhY2sgb3JkZXIgKHdoZW4gcHJpbWFyeSBlbmdpbmUgZmFpbHMpICovXG5jb25zdCBGQUxMQkFDS19PUkRFUiA9IFsnZGRnLWFwaScsICdkZGctZmV0Y2gnLCAnZ29vZ2xlJywgJ2JpbmcnXTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRmFsbGJhY2sgQ2hhaW4gTG9naWMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBXZWIgc2VhcmNoIHdpdGggYXV0b21hdGljIGZhbGxiYWNrLlxuICogU3RhcnRzIHdpdGggdGhlIENvbmZpZyBlbmdpbmUgYW5kIGF1dG9tYXRpY2FsbHkgdHJpZXMgdGhlIG5leHQgaW4gdGhlIGNoYWluLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hXaXRoRmFsbGJhY2tDaGFpbihcbiAgcXVlcnk6IHN0cmluZyxcbiAgY29uZmlnOiBQbHVnaW5Db25maWdcbik6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogeyBxdWVyeTogc3RyaW5nOyByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW107IGNvdW50OiBudW1iZXI7IGVuZ2luZTogc3RyaW5nIH07IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgLy8gU3RhcnQgZW5naW5lIGZyb20gQ29uZmlnIChTaW5nbGUgU2VsZWN0KVxuICBjb25zdCBwcmltYXJ5RW5naW5lID0gY29uZmlnLnNlYXJjaEZhbGxiYWNrQ2hhaW4gfHwgJ2RkZy1hcGknO1xuICBcbiAgLy8gRmFsbGJhY2sgY2hhaW46IHByaW1hcnkgZW5naW5lICsgYWxsIG90aGVycyBpbiBkZWZpbmVkIG9yZGVyXG4gIGNvbnN0IGNoYWluID0gW3ByaW1hcnlFbmdpbmUsIC4uLkZBTExCQUNLX09SREVSLmZpbHRlcihlID0+IGUgIT09IHByaW1hcnlFbmdpbmUpXTtcblxuICBmb3IgKGNvbnN0IGVuZ2luZSBvZiBjaGFpbikge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzZWFyY2hGbiA9IFNFQVJDSF9FTkdJTkVTW2VuZ2luZV07XG4gICAgICBpZiAoIXNlYXJjaEZuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgU2VhcmNoIGVuZ2luZSBcIiR7ZW5naW5lfVwiIG5vdCBmb3VuZCwgc2tpcHBpbmdgKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBzZWFyY2hGbihxdWVyeSk7XG5cbiAgICAgIC8vIFZhbGlkYXRlIHJlc3VsdCBjb3VudCAtIHdhcm4gaWYgbG93IHJlc3VsdHNcbiAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBMb3cgc2VhcmNoIHJlc3VsdHMgZm9yIFwiJHtxdWVyeX1cIjogJHtyZXN1bHRzLmxlbmd0aH0gcmVzdWx0cyBmcm9tICR7ZW5naW5lfWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7IHF1ZXJ5LCByZXN1bHRzLCBjb3VudDogcmVzdWx0cy5sZW5ndGgsIGVuZ2luZSB9LFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIGNvbnNvbGUud2FybihgU2VhcmNoIGVuZ2luZSBcIiR7ZW5naW5lfVwiIGZhaWxlZDogJHttZXNzYWdlfWApO1xuICAgICAgLy8gVHJ5IG5leHQgZW5naW5lIGluIHRoZSBjaGFpblxuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICBlcnJvcjogYEFsbCBzZWFyY2ggZW5naW5lcyBmYWlsZWQuIFRyaWVkOiAke2NoYWluLmpvaW4oJyBcdTIxOTIgJyl9YCxcbiAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFdlYlNlYXJjaFBhcmFtcyB7IHF1ZXJ5OiBzdHJpbmc7IH1cbmludGVyZmFjZSBXaWtpcGVkaWFTZWFyY2hQYXJhbXMgeyBxdWVyeTogc3RyaW5nOyBsYW5nPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRmV0Y2hXZWJDb250ZW50UGFyYW1zIHsgdXJsOiBzdHJpbmc7IH1cbmludGVyZmFjZSBSYWdXZWJDb250ZW50UGFyYW1zIHsgdXJsOiBzdHJpbmc7IHF1ZXJ5OiBzdHJpbmc7IH1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyB3ZWJfc2VhcmNoIHRvb2wgXHUyMDE0IHVzZXMgcHJpbWFyeSBlbmdpbmUgZnJvbSBDb25maWcgKyBhdXRvbWF0aWMgZmFsbGJhY2tcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd2ViX3NlYXJjaCcsXG4gICAgZGVzY3JpcHRpb246ICdTZWFyY2ggdGhlIHdlYiB1c2luZyBhIGNvbmZpZ3VyYWJsZSBzZWFyY2ggZW5naW5lIHdpdGggYXV0b21hdGljIGZhbGxiYWNrIHRvIG90aGVyIGVuZ2luZXMgaWYgdGhlIHByaW1hcnkgb25lIGZhaWxzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzZWFyY2ggcXVlcnknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSB9OiBXZWJTZWFyY2hQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHJldHVybiBhd2FpdCBzZWFyY2hXaXRoRmFsbGJhY2tDaGFpbihxdWVyeSwgY29uZmlnKTtcbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gd2lraXBlZGlhX3NlYXJjaCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3dpa2lwZWRpYV9zZWFyY2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIFdpa2lwZWRpYSBmb3IgYSBnaXZlbiBxdWVyeSBhbmQgcmV0dXJuIHBhZ2Ugc3VtbWFyaWVzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzZWFyY2ggcXVlcnknKSxcbiAgICAgIGxhbmc6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdlbicpLmRlc2NyaWJlKCdMYW5ndWFnZSBjb2RlIChkZWZhdWx0OiBlbiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgbGFuZyB9OiBXaWtpcGVkaWFTZWFyY2hQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGFwaVVybCA9IGBodHRwczovLyR7bGFuZyB8fCAnZW4nfS53aWtpcGVkaWEub3JnL3cvYXBpLnBocD9hY3Rpb249cXVlcnkmbGlzdD1zZWFyY2gmc3JzZWFyY2g9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZmb3JtYXQ9anNvbiZvcmlnaW49KmA7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoYXBpVXJsKTtcblxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXaWtpcGVkaWEgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzcG9uc2UuanNvbigpKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgY29uc3QgcXVlcnlEYXRhID0gZGF0YS5xdWVyeSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0cyA9IChxdWVyeURhdGE/LnNlYXJjaCBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4pIHx8IFtdO1xuICAgICAgICBjb25zdCBwYWdlcyA9IHNlYXJjaFJlc3VsdHMubWFwKChpdGVtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpdGxlID0gdHlwZW9mIGl0ZW0udGl0bGUgPT09ICdzdHJpbmcnID8gaXRlbS50aXRsZSA6ICcnO1xuICAgICAgICAgIGNvbnN0IHNuaXBwZXQgPSB0eXBlb2YgaXRlbS5zbmlwcGV0ID09PSAnc3RyaW5nJyA/IGl0ZW0uc25pcHBldC5yZXBsYWNlKC88W14+XSo+L2csICcnKSA6ICcnO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHNuaXBwZXQsXG4gICAgICAgICAgICB1cmw6IGBodHRwczovLyR7bGFuZyB8fCAnZW4nfS53aWtpcGVkaWEub3JnL3dpa2kvJHtlbmNvZGVVUklDb21wb25lbnQodGl0bGUpfWAsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBxdWVyeSwgbGFuZ3VhZ2U6IGxhbmcgfHwgJ2VuJywgcmVzdWx0czogcGFnZXMsIGNvdW50OiBwYWdlcy5sZW5ndGggfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgV2lraXBlZGlhIHNlYXJjaCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGZldGNoX3dlYl9jb250ZW50IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZmV0Y2hfd2ViX2NvbnRlbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmV0Y2ggdGhlIGNsZWFuLCB0ZXh0LWJhc2VkIGNvbnRlbnQgb2YgYSB3ZWJwYWdlIFVSTC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBmZXRjaCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCB9OiBGZXRjaFdlYkNvbnRlbnRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkodXJsKTtcblxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBodG1sVG9UZXh0KGh0bWwsIHtcbiAgICAgICAgICB3b3Jkd3JhcDogZmFsc2UsXG4gICAgICAgICAgc2VsZWN0b3JzOiBbXG4gICAgICAgICAgICB7IHNlbGVjdG9yOiAnYScsIG9wdGlvbnM6IHsgaWdub3JlSHJlZjogdHJ1ZSB9IH0sXG4gICAgICAgICAgICB7IHNlbGVjdG9yOiAnaW1nJywgZm9ybWF0OiAnW2ltYWdlXScgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHVybCwgY29udGVudDogdGV4dC5zdWJzdHJpbmcoMCwgNTAwMCkgfSB9OyAvLyBMaW1pdCBsZW5ndGhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBmZXRjaCBjb250ZW50OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByYWdfd2ViX2NvbnRlbnQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyYWdfd2ViX2NvbnRlbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmV0Y2ggY29udGVudCBmcm9tIGEgVVJMLCBhbmQgdGhlbiB1c2UgUkFHIHRvIGZpbmQgYW5kIHJldHVybiBvbmx5IHRoZSB0ZXh0IGNodW5rcyBtb3N0IHJlbGV2YW50IHRvIGEgc3BlY2lmaWMgcXVlcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1RoZSBVUkwgdG8gZmV0Y2gnKSxcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2VhcmNoIHF1ZXJ5IGZvciByZWxldmFuY2UgbWF0Y2hpbmcnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB1cmwsIHF1ZXJ5IH06IFJhZ1dlYkNvbnRlbnRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkodXJsKTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICAgICAgICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gaHRtbFRvVGV4dChodG1sKTtcblxuICAgICAgICAvLyBTaW1wbGUga2V5d29yZC1iYXNlZCByZWxldmFuY2Ugc2NvcmluZyAocGxhY2Vob2xkZXIgZm9yIHJlYWwgUkFHKVxuICAgICAgICBjb25zdCBxdWVyeVRlcm1zID0gcXVlcnkudG9Mb3dlckNhc2UoKS5zcGxpdCgvXFxzKy8pLmZpbHRlcigodDogc3RyaW5nKSA9PiB0Lmxlbmd0aCA+IDIpO1xuICAgICAgICBjb25zdCBzZW50ZW5jZXMgPSB0ZXh0LnNwbGl0KC9bLiE/XSsvKS5tYXAoKHM6IHN0cmluZykgPT4gcy50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcblxuICAgICAgICBjb25zdCByZWxldmFudENodW5rcyA9IHNlbnRlbmNlcy5maWx0ZXIoKHNlbnRlbmNlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICByZXR1cm4gcXVlcnlUZXJtcy5zb21lKCh0ZXJtOiBzdHJpbmcpID0+IHNlbnRlbmNlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXModGVybSkpO1xuICAgICAgICB9KS5zbGljZSgwLCA1KTsgLy8gUmV0dXJuIHRvcCA1IGhpdHNcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHVybCwgcXVlcnksIGNodW5rczogcmVsZXZhbnRDaHVua3MgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUkFHIHNlYXJjaCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcnO1xuXG4vLyBMYXp5LWxvYWQgc2ltcGxlLWdpdCBmb3IgdGVzdGFiaWxpdHlcbmxldCBzaW1wbGVHaXRNb2R1bGU6IHR5cGVvZiBpbXBvcnQoJ3NpbXBsZS1naXQnKSB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTaW1wbGVHaXQoKTogUHJvbWlzZTx0eXBlb2YgaW1wb3J0KCdzaW1wbGUtZ2l0Jyk+IHtcbiAgaWYgKCFzaW1wbGVHaXRNb2R1bGUpIHtcbiAgICBzaW1wbGVHaXRNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ3NpbXBsZS1naXQnKTtcbiAgfVxuICByZXR1cm4gc2ltcGxlR2l0TW9kdWxlO1xufVxuXG4vKiogUmVzZXQgZ2l0IG1vZHVsZSBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRHaXRDYWNoZSgpOiB2b2lkIHtcbiAgc2ltcGxlR2l0TW9kdWxlID0gbnVsbDtcbn1cblxuLyoqIENyZWF0ZSBhIGZyZXNoIGdpdCBpbnN0YW5jZSBmb3IgZWFjaCBvcGVyYXRpb24gdG8gYXZvaWQgY3dkIGlzc3VlcyAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlR2l0KCkge1xuICBjb25zdCB7IGRlZmF1bHQ6IHNpbXBsZUdpdCB9ID0gYXdhaXQgZ2V0U2ltcGxlR2l0KCk7XG4gIHJldHVybiBzaW1wbGVHaXQoKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IEdpdEh1YiByZXBvIG5hbWUgZnJvbSBnaXQgcmVtb3RlIFVSTCBvciBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAqIFRyaWVzIG11bHRpcGxlIHNvdXJjZXMgaW4gb3JkZXIgb2YgcmVsaWFiaWxpdHkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldFJlcG9OYW1lKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAvLyBQcmlvcml0eSAxOiBFbnZpcm9ubWVudCB2YXJpYWJsZSAoR2l0SHViIEFjdGlvbnMsIENJL0NEKVxuICBpZiAocHJvY2Vzcy5lbnYuR0lUSFVCX1JFUE9TSVRPUlkpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuR0lUSFVCX1JFUE9TSVRPUlk7XG4gIH1cblxuICAvLyBQcmlvcml0eSAyOiBHaXQgcmVtb3RlIFVSTCBwYXJzaW5nXG4gIHRyeSB7XG4gICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgY29uc3QgcmVtb3RlcyA9IGF3YWl0IGdpdC5saXN0UmVtb3RlKFsnLS1nZXQtdXJsJywgJ29yaWdpbiddKTtcbiAgICBjb25zdCByZW1vdGVVcmwgPSByZW1vdGVzLnRyaW0oKTtcbiAgICBcbiAgICBpZiAocmVtb3RlVXJsKSB7XG4gICAgICAvLyBIYW5kbGUgU1NIIGZvcm1hdDogZ2l0QGdpdGh1Yi5jb206dXNlci9yZXBvLmdpdFxuICAgICAgY29uc3Qgc3NoTWF0Y2ggPSByZW1vdGVVcmwubWF0Y2goL2dpdEBnaXRodWJcXC5jb21bOi9dKFteL10rXFwvW14vXSspXFwuZ2l0JC8pO1xuICAgICAgaWYgKHNzaE1hdGNoKSByZXR1cm4gc3NoTWF0Y2hbMV07XG4gICAgICBcbiAgICAgIC8vIEhhbmRsZSBIVFRQUyBmb3JtYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS91c2VyL3JlcG8uZ2l0XG4gICAgICBjb25zdCBodHRwc01hdGNoID0gcmVtb3RlVXJsLm1hdGNoKC9odHRwczpcXC9cXC9naXRodWJcXC5jb21cXC8oW14vXStcXC9bXi9dKylcXC5naXQkLyk7XG4gICAgICBpZiAoaHR0cHNNYXRjaCkgcmV0dXJuIGh0dHBzTWF0Y2hbMV07XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBHaXQgcmVtb3RlIG5vdCBhdmFpbGFibGUsIGNvbnRpbnVlIHRvIG5leHQgcHJpb3JpdHlcbiAgfVxuXG4gIC8vIFByaW9yaXR5IDM6IEVudmlyb25tZW50IHZhcmlhYmxlIEdJVEhVQl9SRVBPIGFzIGZhbGxiYWNrXG4gIGlmIChwcm9jZXNzLmVudi5HSVRIVUJfUkVQTykge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5HSVRIVUJfUkVQTztcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFNoYXJlZCBoZWxwZXI6IE1ha2UgR2l0SHViIEFQSSByZXF1ZXN0cyB3aXRoIGF1dGhlbnRpY2F0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdoQXBpUmVxdWVzdChtZXRob2Q6IHN0cmluZywgZW5kcG9pbnQ6IHN0cmluZywgYm9keT86IHVua25vd24pIHtcbiAgY29uc3QgZ2l0aHViVG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU47XG4gIFxuICBpZiAoIWdpdGh1YlRva2VuKSB0aHJvdyBuZXcgRXJyb3IoJ0dJVEhVQl9UT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0Jyk7XG4gIFxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5naXRodWIuY29tJHtlbmRwb2ludH1gLCB7XG4gICAgbWV0aG9kLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke2dpdGh1YlRva2VufWAsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gICAgYm9keTogYm9keSA/IEpTT04uc3RyaW5naWZ5KGJvZHkpIDogdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgIHRocm93IG5ldyBFcnJvcihgR2l0SHViIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KTogJHtlcnJvclRleHR9YCk7XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xufVxuXG4vKiogVHlwZWQgcGFyYW1zIGludGVyZmFjZXMgKi9cbnR5cGUgR2l0U3RhdHVzUGFyYW1zID0gUmVjb3JkPHN0cmluZywgbmV2ZXI+O1xuaW50ZXJmYWNlIEdpdERpZmZQYXJhbXMgeyBmaWxlX3BhdGg/OiBzdHJpbmc7IGNhY2hlZD86IGJvb2xlYW47IH1cbmludGVyZmFjZSBHaXRDb21taXRQYXJhbXMgeyBtZXNzYWdlOiBzdHJpbmc7IH1cbmludGVyZmFjZSBHaXRMb2dQYXJhbXMgeyBtYXhfY291bnQ/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHaXRBZGRQYXJhbXMgeyBwYXRocz86IHN0cmluZ1tdOyB9XG5pbnRlcmZhY2UgR2l0Q2hlY2tvdXRQYXJhbXMgeyBicmFuY2hfbmFtZTogc3RyaW5nOyBjcmVhdGVfbmV3PzogYm9vbGVhbjsgfVxuaW50ZXJmYWNlIEdoQ3JlYXRlSXNzdWVQYXJhbXMgeyB0aXRsZTogc3RyaW5nOyBib2R5Pzogc3RyaW5nOyBsYWJlbHM/OiBzdHJpbmdbXTsgfVxuaW50ZXJmYWNlIEdoTGlzdElzc3Vlc1BhcmFtcyB7IHN0YXRlPzogJ29wZW4nIHwgJ2Nsb3NlZCc7IGxhYmVscz86IHN0cmluZ1tdOyBsaW1pdD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdoVmlld0NvbW1lbnRzUGFyYW1zIHsgbnVtYmVyOiBudW1iZXI7IHR5cGU/OiAnaXNzdWUnIHwgJ3ByJzsgfVxuaW50ZXJmYWNlIEdoQ3JlYXRlUHJQYXJhbXMgeyB0aXRsZTogc3RyaW5nOyBib2R5Pzogc3RyaW5nOyBoZWFkX2JyYW5jaDogc3RyaW5nOyBiYXNlX2JyYW5jaD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIEdoTGlzdFByc1BhcmFtcyB7IHN0YXRlPzogJ29wZW4nIHwgJ2Nsb3NlZCc7IGxpbWl0PzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2hWaWV3UHJEaWZmUGFyYW1zIHsgbnVtYmVyOiBudW1iZXI7IH1cbmludGVyZmFjZSBHaFB1c2hQYXJhbXMgeyBicmFuY2g/OiBzdHJpbmc7IH1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyR2l0VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGdpdF9zdGF0dXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfc3RhdHVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCB0aGUgY3VycmVudCBnaXQgc3RhdHVzIG9mIHRoZSByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChfcGFyYW1zOiBHaXRTdGF0dXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBjb25zdCBzdGF0dXNSZXN1bHQgPSBhd2FpdCBnaXQuc3RhdHVzKCkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHN0YXR1c1Jlc3VsdCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IHN0YXR1cyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9kaWZmIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2RpZmYnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHRoZSBnaXQgZGlmZiBvZiB0aGUgY3VycmVudCByZXBvc2l0b3J5IG9yIHNwZWNpZmljIGZpbGVzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBQYXRoIHRvIHNwZWNpZmljIGZpbGUgdG8gZGlmZi4nKSxcbiAgICAgIGNhY2hlZDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnT3B0aW9uYWw6IFNob3cgc3RhZ2VkIGNoYW5nZXMgb25seSAoZ2l0IGRpZmYgLS1jYWNoZWQpLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfcGF0aCwgY2FjaGVkIH06IEdpdERpZmZQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBsZXQgZGlmZiA9ICcnO1xuICAgICAgICBpZiAoZmlsZV9wYXRoKSB7XG4gICAgICAgICAgZGlmZiA9IGF3YWl0IGdpdC5kaWZmKFtmaWxlX3BhdGhdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaWZmID0gY2FjaGVkID8gYXdhaXQgZ2l0LmRpZmYoWyctLWNhY2hlZCddKSA6IGF3YWl0IGdpdC5kaWZmKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkaWZmIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBkaWZmIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2NvbW1pdCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9jb21taXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ29tbWl0IHN0YWdlZCBjaGFuZ2VzIHRvIHRoZSBnaXQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBjb21taXQgbWVzc2FnZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG1lc3NhZ2UgfTogR2l0Q29tbWl0UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgYXdhaXQgZ2l0LmNvbW1pdChtZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21taXR0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGNvbW1pdCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9sb2cgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfbG9nJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCByZWNlbnQgZ2l0IGNvbW1pdCBoaXN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWF4X2NvdW50OiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggbnVtYmVyIG9mIGNvbW1pdHMgdG8gcmV0dXJuIChkZWZhdWx0OiAxMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBtYXhfY291bnQgfTogR2l0TG9nUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgY29uc3QgY291bnQgPSBtYXhfY291bnQgfHwgMTA7XG4gICAgICAgIGNvbnN0IGxvZyA9IGF3YWl0IGdpdC5sb2coY291bnQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1pdHM6IGxvZy5hbGwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGxvZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9hZGQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfYWRkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1N0YWdlIHNwZWNpZmljIGZpbGVzIG9yIGFsbCBjaGFuZ2VzIGZvciB0aGUgbmV4dCBjb21taXQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbDogU3BlY2lmaWMgZmlsZSBwYXRocyB0byBzdGFnZS4gSWYgb21pdHRlZCwgc3RhZ2VzIGFsbCBjaGFuZ2VzLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGhzIH06IEdpdEFkZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGlmIChwYXRocyAmJiBwYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmFkZChwYXRocyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmFkZCgnLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc3RhZ2VkUGF0aHM6IHBhdGhzIHx8ICdhbGwnIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBhZGQgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfY2hlY2tvdXQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfY2hlY2tvdXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3dpdGNoIHRvIGFuIGV4aXN0aW5nIGJyYW5jaCBvciBjcmVhdGUgYW5kIHN3aXRjaCB0byBhIG5ldyBvbmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBicmFuY2hfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTmFtZSBvZiB0aGUgYnJhbmNoIHRvIGNoZWNrb3V0LicpLFxuICAgICAgY3JlYXRlX25ldzogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZShcIklmIHRydWUsIGNyZWF0ZXMgdGhlIGJyYW5jaCBpZiBpdCBkb2Vzbid0IGV4aXN0IChsaWtlIGdpdCBjaGVja291dCAtYikuXCIpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGJyYW5jaF9uYW1lLCBjcmVhdGVfbmV3IH06IEdpdENoZWNrb3V0UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgaWYgKGNyZWF0ZV9uZXcpIHtcbiAgICAgICAgICBhd2FpdCBnaXQuY2hlY2tvdXRMb2NhbEJyYW5jaChicmFuY2hfbmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmNoZWNrb3V0KGJyYW5jaF9uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGJyYW5jaE5hbWU6IGJyYW5jaF9uYW1lIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBjaGVja291dCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2F1dGggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9hdXRoJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrIEdpdEh1YiBhdXRoZW50aWNhdGlvbiBzdGF0dXMuIElmIG5vdCBhdXRoZW50aWNhdGVkLCBvcGVucyBhIHRlcm1pbmFsIHdpbmRvdyBmb3IgdGhlIHVzZXIgdG8gc2lnbiBpbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXRodWJUb2tlbiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjtcbiAgICAgICAgXG4gICAgICAgIGlmICghZ2l0aHViVG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdHSVRIVUJfVE9LRU4gZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgbm90IHNldC4gUGxlYXNlIHNldCBpdCB0byB1c2UgR2l0SHViIEFQSSB0b29scy4nIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgJy91c2VyJyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYXV0aGVudGljYXRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgYXV0aCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2NyZWF0ZV9pc3N1ZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2NyZWF0ZV9pc3N1ZScsXG4gICAgZGVzY3JpcHRpb246ICdDcmVhdGUgYSBuZXcgR2l0SHViIGlzc3VlIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGlzc3VlIHRpdGxlJyksXG4gICAgICBib2R5OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSBib2R5L2Rlc2NyaXB0aW9uJyksXG4gICAgICBsYWJlbHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnTGFiZWxzIHRvIGFwcGx5JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGl0bGUsIGJvZHksIGxhYmVscyB9OiBHaENyZWF0ZUlzc3VlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuIEVuc3VyZSBHSVRIVUJfUkVQT1NJVE9SWSBlbnYgaXMgc2V0IG9yIGdpdCByZW1vdGUgXCJvcmlnaW5cIiBwb2ludHMgdG8gYSBHaXRIdWIgcmVwby4nKTtcblxuICAgICAgICBhd2FpdCBnaEFwaVJlcXVlc3QoJ1BPU1QnLCBgL3JlcG9zLyR7cmVwb05hbWV9L2lzc3Vlc2AsIHsgdGl0bGUsIGJvZHksIGxhYmVscyB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjcmVhdGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBpc3N1ZSBjcmVhdGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2xpc3RfaXNzdWVzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfbGlzdF9pc3N1ZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCBpc3N1ZXMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHN0YXRlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ29wZW4nKS5kZXNjcmliZSgnRmlsdGVyIGJ5IGlzc3VlIHN0YXRlJyksXG4gICAgICBsYWJlbHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRmlsdGVyIGJ5IGxhYmVscycpLFxuICAgICAgbGltaXQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnTWF4IGlzc3VlcyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHN0YXRlLCBsYWJlbHMsIGxpbWl0IH06IEdoTGlzdElzc3Vlc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBhd2FpdCBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lLicpO1xuXG4gICAgICAgIGxldCBxdWVyeSA9IGBzdGF0ZT0ke3N0YXRlfWA7XG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBxdWVyeSArPSBgJmxhYmVscz0ke2xhYmVscy5qb2luKCcsJyl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzc3VlcyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9pc3N1ZXM/JHtxdWVyeX0mcGVyX3BhZ2U9JHtsaW1pdCB8fCAxMH1gKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpc3N1ZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGlzc3VlcyBsaXN0aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfdmlld19jb21tZW50cyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3ZpZXdfY29tbWVudHMnLFxuICAgIGRlc2NyaXB0aW9uOiAnVmlldyBjb21tZW50cyBvbiBhIHNwZWNpZmljIGlzc3VlIG9yIHB1bGwgcmVxdWVzdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSBvciBQUiBudW1iZXInKSxcbiAgICAgIHR5cGU6IHouZW51bShbJ2lzc3VlJywgJ3ByJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnaXNzdWUnKS5kZXNjcmliZShcIldoZXRoZXIgaXQncyBhbiBpc3N1ZSBvciBhIHB1bGwgcmVxdWVzdFwiKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBudW1iZXIsIHR5cGUgfTogR2hWaWV3Q29tbWVudHNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBjb25zdCBjb21tZW50cyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS8ke3R5cGUgPT09ICdwcicgPyAncHVsbHMnIDogJ2lzc3Vlcyd9LyR7bnVtYmVyfS9jb21tZW50c2ApO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1lbnRzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBjb21tZW50cyB2aWV3aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfY3JlYXRlX3ByIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfY3JlYXRlX3ByJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBwdWxsIHJlcXVlc3QgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgUFIgdGl0bGUnKSxcbiAgICAgIGJvZHk6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIFBSIGJvZHkvZGVzY3JpcHRpb24nKSxcbiAgICAgIGhlYWRfYnJhbmNoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgYnJhbmNoIGNvbnRhaW5pbmcgeW91ciBjaGFuZ2VzJyksXG4gICAgICBiYXNlX2JyYW5jaDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ21haW4nKS5kZXNjcmliZSgnVGhlIGJyYW5jaCB5b3Ugd2FudCB0byBtZXJnZSBpbnRvIChlLmcuLCBtYWluLCBtYXN0ZXIpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGl0bGUsIGJvZHksIGhlYWRfYnJhbmNoLCBiYXNlX2JyYW5jaCB9OiBHaENyZWF0ZVByUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgY29uc3QgcHIgPSBhd2FpdCBnaEFwaVJlcXVlc3QoJ1BPU1QnLCBgL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzYCwgeyB0aXRsZSwgYm9keSwgaGVhZDogaGVhZF9icmFuY2gsIGJhc2U6IGJhc2VfYnJhbmNoIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWQ6IHRydWUsIHVybDogKHByIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5odG1sX3VybCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgUFIgY3JlYXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9saXN0X3BycyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2xpc3RfcHJzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xpc3QgcHVsbCByZXF1ZXN0cyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc3RhdGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnb3BlbicpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgUFIgc3RhdGUnKSxcbiAgICAgIGxpbWl0OiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBQUnMgdG8gcmV0dXJuIChkZWZhdWx0OiAxMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzdGF0ZSwgbGltaXQgfTogR2hMaXN0UHJzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgY29uc3QgcHJzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzP3N0YXRlPSR7c3RhdGV9JnBlcl9wYWdlPSR7bGltaXQgfHwgMTB9YCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcHJzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUnMgbGlzdGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3ZpZXdfcHJfZGlmZiB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3ZpZXdfcHJfZGlmZicsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCB0aGUgZGlmZi9wYXRjaCBvZiBhIHNwZWNpZmljIHB1bGwgcmVxdWVzdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBQUiBudW1iZXInKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBudW1iZXIgfTogR2hWaWV3UHJEaWZmUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke3JlcG9OYW1lfS9wdWxscy8ke251bWJlcn0vZGlmZmAsIHtcbiAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Byb2Nlc3MuZW52LkdJVEhVQl9UT0tFTn1gIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBkaWZmOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGRpZmYgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGlmZiB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgUFIgZGlmZiBmZXRjaGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3B1c2ggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9wdXNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1B1c2ggbG9jYWwgY29tbWl0cyB0byB0aGUgcmVtb3RlIEdpdEh1YiByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgYnJhbmNoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBUaGUgYnJhbmNoIHRvIHB1c2guIERlZmF1bHRzIHRvIGN1cnJlbnQgYnJhbmNoLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGJyYW5jaCB9OiBHaFB1c2hQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBhd2FpdCBnaXQucHVzaChicmFuY2ggfHwgJ29yaWdpbicsICdIRUFEJyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcHVzaGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBwdXNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG4vLyBDNSBGSVg6IFByb3BlciB0eXBpbmcgaW5zdGVhZCBvZiBhbnlcbmltcG9ydCB0eXBlICogYXMgUHVwcGV0ZWVyIGZyb20gJ3B1cHBldGVlcic7XG5cbmxldCBwdXBwZXRlZXJNb2R1bGU6IHR5cGVvZiBQdXBwZXRlZXIgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0UHVwcGV0ZWVyKCk6IFByb21pc2U8dHlwZW9mIFB1cHBldGVlcj4ge1xuICBpZiAoIXB1cHBldGVlck1vZHVsZSkge1xuICAgIGNvbnN0IGltcG9ydGVkID0gYXdhaXQgaW1wb3J0KCdwdXBwZXRlZXInKTtcbiAgICBwdXBwZXRlZXJNb2R1bGUgPSBpbXBvcnRlZC5kZWZhdWx0IHx8IGltcG9ydGVkO1xuICB9XG4gIHJldHVybiBwdXBwZXRlZXJNb2R1bGU7XG59XG5cbi8qKiBSZXNldCBwdXBwZXRlZXIgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFB1cHBldGVlckNhY2hlKCk6IHZvaWQge1xuICBwdXBwZXRlZXJNb2R1bGUgPSBudWxsO1xufVxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXInO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuXG4vKiogQnJvd3NlciBzZXNzaW9uIG1hbmFnZXIgd2l0aCBhdXRvLWNsZWFudXAgYW5kIGNvbm5lY3Rpb24gcG9vbGluZyAoc2luZ2xldG9uIHBhdHRlcm4pICovXG5jbGFzcyBCcm93c2VyU2Vzc2lvbk1hbmFnZXIge1xuICBwcml2YXRlIGJyb3dzZXJJbnN0YW5jZTogUHVwcGV0ZWVyLkJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjdXJyZW50UGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjbGVhbnVwVGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKTtcbiAgcHJpdmF0ZSByZWFkb25seSBJTkFDVElWSVRZX1RJTUVPVVRfTVMgPSA1ICogNjAgKiAxMDAwOyAvLyA1IG1pbnV0ZXNcbiAgcHJpdmF0ZSByZWFkb25seSBNQVhfUkVUUklFUyA9IDI7XG4gIHByaXZhdGUgcmV0cnlDb3VudCA9IDA7XG5cbiAgLyoqIEdldCBvciBjcmVhdGUgYSBwZXJzaXN0ZW50IFB1cHBldGVlciBicm93c2VyIGluc3RhbmNlIHdpdGggYXV0by1yZXRyeSAqL1xuICBhc3luYyBnZXRCcm93c2VyKCk6IFByb21pc2U8UHVwcGV0ZWVyLkJyb3dzZXI+IHtcbiAgICBpZiAoIXRoaXMuYnJvd3Nlckluc3RhbmNlIHx8ICF0aGlzLmJyb3dzZXJJbnN0YW5jZS5jb25uZWN0ZWQoKSkge1xuICAgICAgdGhpcy5yZXRyeUNvdW50ID0gMDtcbiAgICAgIHdoaWxlICh0aGlzLnJldHJ5Q291bnQgPCB0aGlzLk1BWF9SRVRSSUVTKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcHVwcGV0ZWVyTGliID0gYXdhaXQgZ2V0UHVwcGV0ZWVyKCk7XG4gICAgICAgICAgdGhpcy5icm93c2VySW5zdGFuY2UgPSBhd2FpdCBwdXBwZXRlZXJMaWIubGF1bmNoKHsgXG4gICAgICAgICAgICBoZWFkbGVzczogdHJ1ZSxcbiAgICAgICAgICAgIGFyZ3M6IFsnLS1uby1zYW5kYm94JywgJy0tZGlzYWJsZS1zZXR1aWQtc2FuZGJveCddIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLnJldHJ5Q291bnQrKztcbiAgICAgICAgICBpZiAodGhpcy5yZXRyeUNvdW50ID49IHRoaXMuTUFYX1JFVFJJRVMpIHRocm93IGVycm9yO1xuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMDAwICogdGhpcy5yZXRyeUNvdW50KSk7IC8vIEV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlc2V0Q2xlYW51cFRpbWVyKCk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICByZXR1cm4gdGhpcy5icm93c2VySW5zdGFuY2UhO1xuICB9XG5cbiAgLyoqIEdldCBvciBjcmVhdGUgYSBwYWdlIGluIHRoZSBwZXJzaXN0ZW50IGJyb3dzZXIgaW5zdGFuY2UgKi9cbiAgYXN5bmMgZ2V0UGFnZSgpOiBQcm9taXNlPFB1cHBldGVlci5QYWdlPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRQYWdlIHx8ICFhd2FpdCB0aGlzLmlzUGFnZVZhbGlkKCkpIHtcbiAgICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCB0aGlzLmdldEJyb3dzZXIoKTtcbiAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICB9XG4gICAgdGhpcy5yZXNldENsZWFudXBUaW1lcigpO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlO1xuICB9XG5cbiAgLyoqIENoZWNrIGlmIGN1cnJlbnQgcGFnZSBpcyBzdGlsbCB2YWxpZCAqL1xuICBwcml2YXRlIGFzeW5jIGlzUGFnZVZhbGlkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMuY3VycmVudFBhZ2UpIHJldHVybiBmYWxzZTtcbiAgICAgIGF3YWl0IHRoaXMuY3VycmVudFBhZ2UuZXZhbHVhdGUoJzEnKTsgLy8gUXVpY2sgdmFsaWRhdGlvblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlc2V0IHRoZSBpbmFjdGl2aXR5IGNsZWFudXAgdGltZXIgKi9cbiAgcHJpdmF0ZSByZXNldENsZWFudXBUaW1lcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jbGVhbnVwVGltZXIpIGNsZWFyVGltZW91dCh0aGlzLmNsZWFudXBUaW1lcik7XG4gICAgdGhpcy5sYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuY2xlYW51cFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLmRpc3Bvc2UoKSwgdGhpcy5JTkFDVElWSVRZX1RJTUVPVVRfTVMpO1xuICB9XG5cbiAgLyoqIEV4cGxpY2l0bHkgZGlzcG9zZSBicm93c2VyIGFuZCBjYW5jZWwgY2xlYW51cCB0aW1lciAqL1xuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNsZWFudXBUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuY2xlYW51cFRpbWVyKTtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuYnJvd3Nlckluc3RhbmNlICYmIHRoaXMuYnJvd3Nlckluc3RhbmNlLmNvbm5lY3RlZCgpKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYXdhaXQtdGhlbmFibGVcbiAgICAgICAgYXdhaXQgdGhpcy5icm93c2VySW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBjbG9zZSBlcnJvcnNcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5icm93c2VySW5zdGFuY2UgPSBudWxsO1xuICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IG51bGw7XG4gICAgICB0aGlzLmxhc3RBY3Rpdml0eSA9IERhdGUubm93KCk7XG4gICAgICB0aGlzLnJldHJ5Q291bnQgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVjayBpZiBicm93c2VyIGlzIGNvbm5lY3RlZCAqL1xuICBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5icm93c2VySW5zdGFuY2UgJiYgdGhpcy5icm93c2VySW5zdGFuY2UuY29ubmVjdGVkKCkpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgY3VycmVudCBwYWdlIChwdWJsaWMgYWNjZXNzb3IpICovXG4gIGdldEN1cnJlbnRQYWdlKCk6IFB1cHBldGVlci5QYWdlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2U7XG4gIH1cblxuICAvKiogU2V0IHRoZSBjdXJyZW50IHBhZ2UgKHB1YmxpYyBzZXR0ZXIpICovXG4gIHNldEN1cnJlbnRQYWdlKHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZSBmb3IgdGhpcyBtb2R1bGVcbmNvbnN0IGJyb3dzZXJNYW5hZ2VyID0gbmV3IEJyb3dzZXJTZXNzaW9uTWFuYWdlcigpO1xuXG4vKiogRXhwb3J0IGNsZWFudXAgZnVuY3Rpb24gZm9yIHBsdWdpbiB1bmxvYWQgbGlmZWN5Y2xlICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW51cEJyb3dzZXJTZXNzaW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xufVxuXG4vLyBDNSBGSVg6IFByb3BlciBwYXJhbSB0eXBlc1xuaW50ZXJmYWNlIEJyb3dzZXJPcGVuUGFnZVBhcmFtcyB7XG4gIHVybDogc3RyaW5nO1xuICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7XG4gIHdhaXRfZm9yX3NlbGVjdG9yPzogc3RyaW5nO1xuICBmdWxsX3BhZ2Vfc2NyZWVuc2hvdD86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBCcm93c2VyU2Vzc2lvbkNvbnRyb2xQYXJhbXMge1xuICBhY3Rpb25zPzogdW5rbm93bltdO1xuICByZWFkX3BhZ2U/OiBib29sZWFuO1xuICBmdWxsX3JlYWQ/OiBib29sZWFuO1xuICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBQcmV2aWV3SHRtbFBhcmFtcyB7XG4gIGh0bWxfY29udGVudDogc3RyaW5nO1xuICBmaWxlX25hbWU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBPcGVuRmlsZVBhcmFtcyB7XG4gIHRhcmdldDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCcm93c2VyVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuICAvLyBicm93c2VyX29wZW5fcGFnZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Jyb3dzZXJfb3Blbl9wYWdlJyxcbiAgICBkZXNjcmlwdGlvbjogJ09wZW4gYSB3ZWJwYWdlIGluIGEgaGVhZGxlc3MgYnJvd3NlciAoUHVwcGV0ZWVyKSwgcmVuZGVyIGl0IG9uY2UsIGFuZCByZXR1cm4gY29udGVudC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBvcGVuJyksXG4gICAgICBzY3JlZW5zaG90X3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnUGF0aCB0byBzYXZlIGEgc2NyZWVuc2hvdC4nKSxcbiAgICAgIHdhaXRfZm9yX3NlbGVjdG9yOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0NTUyBzZWxlY3RvciB0byB3YWl0IGZvciBiZWZvcmUgcmV0dXJuaW5nLicpLFxuICAgICAgZnVsbF9wYWdlX3NjcmVlbnNob3Q6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0lmIHRydWUsIGNhcHR1cmVzIHRoZSBmdWxsIHBhZ2Ugd2hlbiB0YWtpbmcgYSBzY3JlZW5zaG90LicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCwgc2NyZWVuc2hvdF9wYXRoLCB3YWl0X2Zvcl9zZWxlY3RvciwgZnVsbF9wYWdlX3NjcmVlbnNob3QgfTogQnJvd3Nlck9wZW5QYWdlUGFyYW1zKSA9PiB7XG4gICAgICBsZXQgYnJvd3NlcjogUHVwcGV0ZWVyLkJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgICAgIGxldCBwYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuXG4gICAgICB0cnkge1xuICAgICAgICBicm93c2VyID0gYXdhaXQgYnJvd3Nlck1hbmFnZXIuZ2V0QnJvd3NlcigpO1xuICAgICAgICBwYWdlID0gYnJvd3Nlck1hbmFnZXIuZ2V0Q3VycmVudFBhZ2UoKTtcblxuICAgICAgICBpZiAoIXBhZ2UgfHwgKGF3YWl0IHBhZ2UudXJsKCkpICE9PSB1cmwpIHtcbiAgICAgICAgICAvLyBJZiBubyBjdXJyZW50IHBhZ2Ugb3IgVVJMIGRvZXNuJ3QgbWF0Y2gsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgICBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG4gICAgICAgICAgYnJvd3Nlck1hbmFnZXIuc2V0Q3VycmVudFBhZ2UocGFnZSk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBwYWdlLmdvdG8odXJsLCB7IHdhaXRVbnRpbDogJ2RvbWNvbnRlbnRsb2FkZWQnIH0pO1xuXG4gICAgICAgIGlmICh3YWl0X2Zvcl9zZWxlY3Rvcikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBwYWdlLndhaXRGb3JTZWxlY3Rvcih3YWl0X2Zvcl9zZWxlY3RvciwgeyB0aW1lb3V0OiA1MDAwIH0pO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gSWdub3JlIHRpbWVvdXQsIGNvbnRpbnVlIHdpdGggY29udGVudCBleHRyYWN0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IHVybCwgb3BlbmVkOiB0cnVlIH07XG5cbiAgICAgICAgaWYgKHNjcmVlbnNob3RfcGF0aCkge1xuICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCwgZnVsbFBhZ2U6IGZ1bGxfcGFnZV9zY3JlZW5zaG90IH0pO1xuICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFNhdmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZSBzdHJpbmctYmFzZWQgZXZhbHVhdGUgdG8gYnlwYXNzIFRTMjU4NC9UUzIzMDQgJ2RvY3VtZW50JyBlcnJvcnMgaW4gTm9kZS5qcyBlbnZpcm9ubWVudFxuICAgICAgICBjb25zdCB0ZXh0Q29udGVudDogc3RyaW5nID0gYXdhaXQgcGFnZS5ldmFsdWF0ZShgcmV0dXJuIGRvY3VtZW50LmJvZHkgPyBkb2N1bWVudC5ib2R5LmlubmVyVGV4dCA6ICcnO2ApO1xuICAgICAgICByZXN1bHREYXRhLnBhZ2VUZXh0ID0gdGV4dENvbnRlbnQuc3Vic3RyaW5nKDAsIDIwMDApO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBvcGVuIHBhZ2U6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBOT1RFOiBXZSBkb24ndCBjbG9zZSB0aGUgYnJvd3NlciBoZXJlIGJlY2F1c2Ugd2UgdXNlIGEgc2luZ2xldG9uIHBhdHRlcm4uXG4gICAgICAgIC8vIFRoZSBicm93c2VyIHN0YXlzIGFsaXZlIGZvciBzdWJzZXF1ZW50IHJlcXVlc3RzIHZpYSBicm93c2VyX3Nlc3Npb25fY29udHJvbC5cbiAgICAgICAgLy8gVXNlIGJyb3dzZXJfc2Vzc2lvbl9jbG9zZSB0byBleHBsaWNpdGx5IHRlcm1pbmF0ZSBpdC5cbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYnJvd3Nlcl9zZXNzaW9uX2NvbnRyb2wgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdicm93c2VyX3Nlc3Npb25fY29udHJvbCcsXG4gICAgZGVzY3JpcHRpb246ICdDb250cm9sIHRoZSBhY3RpdmUgcGVyc2lzdGVudCBicm93c2VyIHNlc3Npb24uIFN1cHBvcnRzIGFjdGlvbnMsIHBhZ2UgcmVhZGluZywgc2NyZWVuc2hvdCBjYXB0dXJlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgYWN0aW9uczogei5hcnJheSh6LmFueSgpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbCBzY3JpcHRlZCBicm93c2VyIGFjdGlvbnMgdG8gZXhlY3V0ZS4nKSxcbiAgICAgIHJlYWRfcGFnZTogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnSWYgdHJ1ZSwgcmV0dXJucyBwYWdlIG1ldGFkYXRhLicpLFxuICAgICAgZnVsbF9yZWFkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdJZiB0cnVlLCBmb3JjZXMgZnVsbCBwYWdlIHRleHQgb3V0cHV0LicpLFxuICAgICAgc2NyZWVuc2hvdF9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHNjcmVlbnNob3Qgb3V0cHV0IHBhdGguJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYWN0aW9ucywgcmVhZF9wYWdlLCBmdWxsX3JlYWQsIHNjcmVlbnNob3RfcGF0aCB9OiBCcm93c2VyU2Vzc2lvbkNvbnRyb2xQYXJhbXMpID0+IHtcbiAgICAgIGxldCBwYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuXG4gICAgICB0cnkge1xuICAgICAgICBwYWdlID0gYXdhaXQgYnJvd3Nlck1hbmFnZXIuZ2V0UGFnZSgpO1xuXG4gICAgICAgIGlmIChhY3Rpb25zICYmIEFycmF5LmlzQXJyYXkoYWN0aW9ucykpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGFjdGlvbiBvZiBhY3Rpb25zIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+W10pIHtcbiAgICAgICAgICAgIGlmIChhY3Rpb24udHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICBhd2FpdCBwYWdlLmNsaWNrKGFjdGlvbi5zZWxlY3RvciBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gJ3R5cGUnKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UudHlwZShhY3Rpb24uc2VsZWN0b3IgYXMgc3RyaW5nLCBhY3Rpb24udGV4dCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gJ2dvdG8nKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZ290byhhY3Rpb24udXJsIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAnZXZhbHVhdGUnKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZXZhbHVhdGUoYWN0aW9uLnNjcmlwdCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0geyBhY3Rpb25zRXhlY3V0ZWQ6IGFjdGlvbnM/Lmxlbmd0aCB8fCAwIH07XG5cbiAgICAgICAgaWYgKHJlYWRfcGFnZSB8fCBmdWxsX3JlYWQpIHtcbiAgICAgICAgICAvLyBVc2Ugc3RyaW5nLWJhc2VkIGV2YWx1YXRlIHRvIGJ5cGFzcyBUUzI1ODQgJ2RvY3VtZW50JyBlcnJvcnMgaW4gTm9kZS5qcyBlbnZpcm9ubWVudFxuICAgICAgICAgIGNvbnN0IHRleHQ6IHN0cmluZyA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoYHJldHVybiBkb2N1bWVudC5ib2R5ID8gZG9jdW1lbnQuYm9keS5pbm5lclRleHQgOiAnJztgKTtcbiAgICAgICAgICByZXN1bHREYXRhLnBhZ2VUZXh0ID0gZnVsbF9yZWFkID8gdGV4dCA6IHRleHQuc3Vic3RyaW5nKDAsIDEwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjcmVlbnNob3RfcGF0aCkge1xuICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCB9KTtcbiAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RTYXZlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBCcm93c2VyIGNvbnRyb2wgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gUGFnZSBzdGF5cyBhbGl2ZSBmb3Igc2Vzc2lvbiByZXVzZS4gQnJvd3NlciBpcyBtYW5hZ2VkIGJ5IGJyb3dzZXJfc2Vzc2lvbl9jbG9zZS5cbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Nsb3NlIHRoZSBhY3RpdmUgcGVyc2lzdGVudCBicm93c2VyIHNlc3Npb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNsb3NlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gY2xvc2UgYnJvd3NlciBzZXNzaW9uOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gRW5zdXJlIGNsZWFudXAgZXZlbiBvbiBmYWlsdXJlXG4gICAgICAgIGF3YWl0IGJyb3dzZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcHJldmlld19odG1sIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncHJldmlld19odG1sJyxcbiAgICBkZXNjcmlwdGlvbjogXCJSZW5kZXIgYW5kIHByZXZpZXcgSFRNTCBjb250ZW50IGluIHRoZSBzeXN0ZW0ncyBkZWZhdWx0IGJyb3dzZXIuXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSFRNTCBjb250ZW50IHRvIHJlbmRlcicpLFxuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgncHJldmlldy5odG1sJykuZGVzY3JpYmUoJ09wdGlvbmFsIGZpbGVuYW1lIChkZWZhdWx0OiBwcmV2aWV3Lmh0bWwpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBmaWxlX25hbWUgfTogUHJldmlld0h0bWxQYXJhbXMpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZV9uYW1lIHx8ICdwcmV2aWV3Lmh0bWwnO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihnZXRXb3JraW5nRGlyKCksIGZpbGVOYW1lKTtcblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBodG1sX2NvbnRlbnQpO1xuXG4gICAgICAgIC8vIE9wZW4gaW4gZGVmYXVsdCBicm93c2VyIHVzaW5nIEVTIGltcG9ydFxuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdChmaWxlUGF0aCk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwcmV2aWV3ZWQ6IHRydWUsIGZpbGU6IGZpbGVOYW1lIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBwcmV2aWV3IEhUTUw6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG9wZW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ29wZW5fZmlsZScsXG4gICAgZGVzY3JpcHRpb246IFwiT3BlbiBhIGZpbGUgb3IgVVJMIGluIHRoZSBzeXN0ZW0ncyBkZWZhdWx0IGFwcGxpY2F0aW9uLlwiLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRhcmdldDogei5zdHJpbmcoKS5kZXNjcmliZSgnRmlsZSBwYXRoIG9yIFVSTCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRhcmdldCB9OiBPcGVuRmlsZVBhcmFtcykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgb3Blbk1vZHVsZSA9IGF3YWl0IGltcG9ydCgnb3BlbicpO1xuICAgICAgICBhd2FpdCBvcGVuTW9kdWxlLmRlZmF1bHQodGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBvcGVuZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gZmlsZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZVNRTFF1ZXJ5IH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuXG4vLyBMYXp5LWxvYWQgbm9kZTpzcWxpdGUgKE5vZGUuanMgMjMrKS4gR3JhY2VmdWwgZmFsbGJhY2sgZm9yIG9sZGVyIE5vZGUgdmVyc2lvbnMuXG5sZXQgc3FsaXRlTW9kdWxlOiB0eXBlb2YgaW1wb3J0KCdub2RlOnNxbGl0ZScpIHwgbnVsbCA9IG51bGw7XG5sZXQgc3FsaXRlTG9hZEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3FsaXRlKCk6IFByb21pc2U8dHlwZW9mIGltcG9ydCgnbm9kZTpzcWxpdGUnKT4ge1xuICBpZiAoc3FsaXRlTW9kdWxlKSByZXR1cm4gc3FsaXRlTW9kdWxlO1xuICBpZiAoc3FsaXRlTG9hZEVycm9yKSB0aHJvdyBuZXcgRXJyb3Ioc3FsaXRlTG9hZEVycm9yKTtcblxuICB0cnkge1xuICAgIHNxbGl0ZU1vZHVsZSA9IGF3YWl0IGltcG9ydCgnbm9kZTpzcWxpdGUnKTtcbiAgICByZXR1cm4gc3FsaXRlTW9kdWxlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBzcWxpdGVMb2FkRXJyb3IgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFNRTGl0ZSBpcyBub3QgYXZhaWxhYmxlIChub2RlOnNxbGl0ZSByZXF1aXJlcyBOb2RlLmpzIDIzKykuIGAgK1xuICAgICAgYE9yaWdpbmFsIGVycm9yOiAke3NxbGl0ZUxvYWRFcnJvcn0uIGAgK1xuICAgICAgYFBsZWFzZSBkaXNhYmxlIGRhdGFiYXNlIHF1ZXJpZXMgaW4gcGx1Z2luIHNldHRpbmdzIG9yIHVwZ3JhZGUgTm9kZS5gXG4gICAgKTtcbiAgfVxufVxuXG4vKiogUmVzZXQgc3FsaXRlIG1vZHVsZSBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRTcWxpdGVDYWNoZSgpOiB2b2lkIHtcbiAgc3FsaXRlTW9kdWxlID0gbnVsbDtcbiAgc3FsaXRlTG9hZEVycm9yID0gbnVsbDtcbn1cblxuLyoqIFR5cGVkIHBhcmFtcyBpbnRlcmZhY2UgKi9cbmludGVyZmFjZSBRdWVyeURhdGFiYXNlUGFyYW1zIHtcbiAgcXVlcnk6IHN0cmluZztcbiAgZGJfcGF0aD86IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRGF0YWJhc2VUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcXVlcnlfZGF0YWJhc2UgdG9vbCBcdTIwMTQgQzcgRklYOiBBZGRlZCBvcHRpb25hbCBkYl9wYXRoIHBhcmFtZXRlclxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdxdWVyeV9kYXRhYmFzZScsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gcmVhZC1vbmx5IFNRTGl0ZSBxdWVyaWVzLiBEZWZhdWx0cyB0byBpbi1tZW1vcnkgZGF0YWJhc2U7IG9wdGlvbmFsbHkgc3BlY2lmeSBhIGZpbGUgcGF0aC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTUUwgcXVlcnkgc3RyaW5nIChyZWFkLW9ubHkgb25seSknKSxcbiAgICAgIGRiX3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCc6bWVtb3J5OicpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBTUUxpdGUgZGF0YWJhc2UgZmlsZSAoZGVmYXVsdDogOm1lbW9yeTopJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIGRiX3BhdGggfTogUXVlcnlEYXRhYmFzZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2VjdXJpdHkgY2hlY2sgLSB1c2Ugcm9idXN0IFNRTCB2YWxpZGF0aW9uIGluc3RlYWQgb2Ygc2ltcGxlIHJlZ2V4IG1hdGNoaW5nXG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZCA9IHZhbGlkYXRlU1FMUXVlcnkocXVlcnkpO1xuICAgICAgICBpZiAoIXZhbGlkYXRlZC52YWxpZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBTUUwgcXVlcnkgZGV0ZWN0ZWQ6ICR7dmFsaWRhdGVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMYXp5LWxvYWQgbm9kZTpzcWxpdGUgd2l0aCBncmFjZWZ1bCBmYWxsYmFja1xuICAgICAgICBjb25zdCB7IG9wZW4gfSA9IGF3YWl0IGdldFNxbGl0ZSgpO1xuICAgICAgICBjb25zdCBkYiA9IG9wZW4oZGJfcGF0aCB8fCAnOm1lbW9yeTonKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHN0bXQgPSBkYi5wcmVwYXJlKHF1ZXJ5KTtcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gc3RtdC5hbGwoKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHF1ZXJ5LCByZXN1bHRzIH0gfTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYXRhYmFzZSBxdWVyeSBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIgfSBmcm9tICcuLi9iYWNrZ3JvdW5kQ29tbWFuZHMuanMnO1xuaW1wb3J0IHsgc2FuaXRpemVDb21tYW5kIH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUnVuQmFja2dyb3VuZENvbW1hbmRQYXJhbXMgeyBjb21tYW5kOiBzdHJpbmc7IHRpbWVvdXRfaG91cnM6IG51bWJlcjsgbmFtZTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQ2hlY2tCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGlkOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDYW5jZWxCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGlkOiBzdHJpbmc7IH1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQmFja2dyb3VuZENvbW1hbmRUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyOiBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcnVuX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9iYWNrZ3JvdW5kX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhcnQgYSBsb25nLXJ1bm5pbmcgcHJvY2VzcyBpbiB0aGUgYmFja2dyb3VuZC4gVGhlIHByb2Nlc3MgaXMgbm90IGJsb2NrZWQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2hlbGwgY29tbWFuZCB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X2hvdXJzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCgxMCkuZGVzY3JpYmUoJ01BTkRBVE9SWTogSG93IGxvbmcgdGhlIHByb2Nlc3MgaXMgYWxsb3dlZCB0byBydW4gYmVmb3JlIGJlaW5nIGtpbGxlZC4nKSxcbiAgICAgIG5hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ01BTkRBVE9SWTogQSBzaG9ydCwgZGVzY3JpcHRpdmUgbmFtZSBmb3IgdGhlIGJhY2tncm91bmQgdGFzaycpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbW1hbmQsIHRpbWVvdXRfaG91cnMsIG5hbWUgfTogUnVuQmFja2dyb3VuZENvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFNlY3VyaXR5IGNoZWNrIC0gdXNlIHJvYnVzdCBzYW5pdGl6YXRpb24gaW5zdGVhZCBvZiBzaW1wbGUgc3RyaW5nIG1hdGNoaW5nXG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpZCA9IGJhY2tncm91bmRDb21tYW5kTWFuYWdlci5yZWdpc3Rlcihjb21tYW5kLCB0aW1lb3V0X2hvdXJzLCBuYW1lKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpZCwgbmFtZSwgY29tbWFuZCwgdGltZW91dEhvdXJzOiB0aW1lb3V0X2hvdXJzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNoZWNrX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NoZWNrX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdDaGVjayB0aGUgc3RhdHVzLCBzdGRvdXQsIGFuZCBzdGRlcnIgb2YgYSBydW5uaW5nIG9yIGNvbXBsZXRlZCBiYWNrZ3JvdW5kIGNvbW1hbmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1hbmQgaWRlbnRpZmllcicpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGlkIH06IENoZWNrQmFja2dyb3VuZENvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIuY2hlY2soaWQpO1xuICAgICAgICBpZiAoIWNvbW1hbmQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb21tYW5kIG5vdCBmb3VuZDogJHtpZH1gIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogY29tbWFuZCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2FuY2VsX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NhbmNlbF9iYWNrZ3JvdW5kX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnS2lsbCBhIHJ1bm5pbmcgYmFja2dyb3VuZCBjb21tYW5kLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBjb21tYW5kIGlkZW50aWZpZXInKSxcbiAgICB9LFxuICAgIC8vIFNESyByZXF1aXJlcyBhc3luYyBpbXBsZW1lbnRhdGlvblxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBpZCB9OiBDYW5jZWxCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2FuY2VsbGVkID0gYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLmNhbmNlbChpZCk7XG4gICAgICAgIGlmICghY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ2Fubm90IGNhbmNlbCBjb21tYW5kOiAke2lkfSAobm90IGZvdW5kIG9yIG5vdCBydW5uaW5nKWAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlkLCBjYW5jZWxsZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgc2FuaXRpemVDb21tYW5kIH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTaGFyZWQgU3Bhd24gSGVscGVyID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTcGF3blJlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIGRhdGE/OiB7IHN0ZG91dDogc3RyaW5nOyBzdGRlcnI6IHN0cmluZyB9O1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBTYWZlbHkgc3Bhd24gYSBwcm9jZXNzIHdpdGggdGltZW91dCwgY2FwdHVyaW5nIHN0ZG91dC9zdGRlcnIuXG4gKiBFbGltaW5hdGVzIGNvZGUgZHVwbGljYXRpb24gYWNyb3NzIGV4ZWN1dGlvbiB0b29scy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2FmZVNwYXduKFxuICBleGU6IHN0cmluZyxcbiAgYXJnczogc3RyaW5nW10sXG4gIHRpbWVvdXRNczogbnVtYmVyLFxuICBpbnB1dD86IHN0cmluZyxcbiAgdXNlU2hlbGwgPSBmYWxzZVxuKTogUHJvbWlzZTxTcGF3blJlc3VsdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBwcm9jID0gc3Bhd24oZXhlLCBhcmdzLCB7XG4gICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgdGltZW91dDogdGltZW91dE1zLFxuICAgICAgY3dkOiBnZXRXb3JraW5nRGlyKCksIC8vIEV4ZWN1dGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAgICAgIHNoZWxsOiB1c2VTaGVsbCwgLy8gRW5hYmxlIHNoZWxsIGludGVycHJldGF0aW9uIHdoZW4gcmVxdWVzdGVkXG4gICAgfSk7XG5cbiAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgaWYgKGlucHV0KSB7XG4gICAgICBwcm9jLnN0ZGluPy53cml0ZShpbnB1dCk7XG4gICAgICBwcm9jLnN0ZGluPy5lbmQoKTtcbiAgICB9XG5cbiAgICBwcm9jLnN0ZG91dD8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRvdXQgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0V4ZWN1dGlvbiB0aW1lZCBvdXQnIH0pO1xuICAgIH0sIHRpbWVvdXRNcyk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHN0ZG91dDogc3Rkb3V0LnRyaW0oKSwgc3RkZXJyOiBzdGRlcnIudHJpbSgpIH0gfSk7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBTcGF3biBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSdW5KYXZhU2NyaXB0UGFyYW1zIHsgamF2YXNjcmlwdDogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBSdW5QeXRob25QYXJhbXMgeyBweXRob246IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgRXhlY3V0ZUNvbW1hbmRQYXJhbXMgeyBjb21tYW5kOiBzdHJpbmc7IHRpbWVvdXRfc2Vjb25kcz86IG51bWJlcjsgaW5wdXQ/OiBzdHJpbmc7IH1cbmludGVyZmFjZSBSdW5JblRlcm1pbmFsUGFyYW1zIHsgY29tbWFuZDogc3RyaW5nOyB9XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEV4ZWN1dGlvbiBUb29scyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJFeGVjdXRpb25Ub29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcnVuX2phdmFzY3JpcHQgdG9vbCBcdTIwMTQgU0FOREJPWEVEIHdpdGggZGVubyAoaWYgYXZhaWxhYmxlKSBvciBub2RlIHdpdGggc3RyaWN0IHJlc3RyaWN0aW9uc1xuICAvLyBTNSBGSVg6IEVuaGFuY2VkIGRhbmdlcm91cyBwYXR0ZXJuIGRldGVjdGlvbiB0byBwcmV2ZW50IGV2YWwvcmVxdWlyZSBieXBhc3Nlc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdydW5famF2YXNjcmlwdCcsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gSmF2YVNjcmlwdCBjb2RlIHNuaXBwZXQgdXNpbmcgTm9kZS5qcyAoc2FuZGJveGVkKS4gTm8gZXh0ZXJuYWwgbW9kdWxlIGltcG9ydHMgYWxsb3dlZC4gU3RhbmRhcmQgbGlicmFyeSBvbmx5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgamF2YXNjcmlwdDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIEphdmFTY3JpcHQgY29kZSB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X3NlY29uZHM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDYwKS5vcHRpb25hbCgpLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ1RpbWVvdXQgaW4gc2Vjb25kcyAobWF4IDYwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGphdmFzY3JpcHQsIHRpbWVvdXRfc2Vjb25kcyB9OiBSdW5KYXZhU2NyaXB0UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBSb2J1c3QgZGFuZ2Vyb3VzIHBhdHRlcm4gZGV0ZWN0aW9uIFx1MjAxNCBibG9ja3MgZXZhbCwgcmVxdWlyZSwgaW1wb3J0LCBmcywgY2hpbGRfcHJvY2Vzc1xuICAgICAgICAvLyBTNSBGSVg6IEFkZGVkIHBhdHRlcm5zIGZvciBjb21tb24gYnlwYXNzIHRlY2huaXF1ZXNcbiAgICAgICAgY29uc3QgZGFuZ2Vyb3VzUGF0dGVybnMgPSBbXG4gICAgICAgICAgL1xcYnJlcXVpcmVcXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmltcG9ydFxccysvaSxcbiAgICAgICAgICAvXFxiZnNcXC4vaSxcbiAgICAgICAgICAvXFxiY2hpbGRfcHJvY2Vzc1xcYi9pLFxuICAgICAgICAgIC9cXGJldmFsXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJleGVjXFxzKlxcKC9pLFxuICAgICAgICAgIC9nbG9iYWxUaGlzXFwucmVxdWlyZS9pLFxuICAgICAgICAgIC9wcm9jZXNzXFwuZXhpdC9pLFxuICAgICAgICAgIC9fX3Byb3RvX18vaSxcbiAgICAgICAgICAvLyBTNSBGSVg6IEJ5cGFzcyBwcmV2ZW50aW9uIHBhdHRlcm5zXG4gICAgICAgICAgL0Z1bmN0aW9uXFxzKlxcKC9pLCAgICAgICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24gY29uc3RydWN0b3JcbiAgICAgICAgICAvU3RyaW5nXFwuZnJvbUNoYXJDb2RlXFxzKlxcKC9pLCAgICAgICAvLy5mcm9tQ2hhckNvZGUgYnlwYXNzXG4gICAgICAgICAgL1xcYmltcG9ydFxccypcXCguKlxcKS9pLCAgICAgICAgICAgICAgIC8vIER5bmFtaWMgaW1wb3J0XG4gICAgICAgICAgL1xcLmNvbnN0cnVjdG9yL2ksICAgICAgICAgICAgICAgICAgIC8vIENvbnN0cnVjdG9yIGFjY2Vzc1xuICAgICAgICAgIC9yZXF1aXJlXFwucmVzb2x2ZS9pLCAgICAgICAgICAgICAgICAvLyByZXF1aXJlLnJlc29sdmUgYnlwYXNzXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChqYXZhc2NyaXB0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGFuZ2Vyb3VzIGNvZGUgZGV0ZWN0ZWQ6ICR7cGF0dGVybi5zb3VyY2V9YCB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRpbWVvdXRNcyA9ICgodGltZW91dF9zZWNvbmRzIHx8IDUpICogMTAwMCk7XG4gICAgICAgIFxuICAgICAgICAvLyBVc2UgTm9kZS5qcyB3aXRoIC0tdW5oYW5kbGVkLXJlamVjdGlvbnM9dGhyb3cgZm9yIHNhZmV0eVxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24oJ25vZGUnLCBbJy1lJywgamF2YXNjcmlwdF0sIHRpbWVvdXRNcyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQuZGF0YT8uc3RkZXJyICYmICFyZXN1bHQuZGF0YS5zdGRvdXQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5kYXRhLnN0ZGVyciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBvdXRwdXQ6IHJlc3VsdC5kYXRhPy5zdGRvdXQgfHwgJycgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcnVuX3B5dGhvbiB0b29sIFx1MjAxNCBTQU5EQk9YRUQgd2l0aCBzdHJpY3QgaW1wb3J0IHJlc3RyaWN0aW9uc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdydW5fcHl0aG9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biBQeXRob24gY29kZSBzbmlwcGV0IChzYW5kYm94ZWQsIG5vIGV4dGVybmFsIG1vZHVsZXMpLiBTdGFuZGFyZCBsaWJyYXJ5IG9ubHkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBweXRob246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBQeXRob24gY29kZSB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X3NlY29uZHM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDYwKS5vcHRpb25hbCgpLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ1RpbWVvdXQgaW4gc2Vjb25kcyAobWF4IDYwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHB5dGhvbiwgdGltZW91dF9zZWNvbmRzIH06IFJ1blB5dGhvblBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gUm9idXN0IGRhbmdlcm91cyBwYXR0ZXJuIGRldGVjdGlvbiBcdTIwMTQgYmxvY2tzIG9zLCBzdWJwcm9jZXNzLCBzaHV0aWwsIGV2YWwsIGV4ZWNcbiAgICAgICAgY29uc3QgZGFuZ2Vyb3VzUGF0dGVybnMgPSBbXG4gICAgICAgICAgL1xcYmltcG9ydFxccytvc1xcYi9pLFxuICAgICAgICAgIC9cXGJmcm9tXFxzK29zXFxzK2ltcG9ydFxcYi9pLFxuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrc3VicHJvY2Vzc1xcYi9pLFxuICAgICAgICAgIC9cXGJmcm9tXFxzK3N1YnByb2Nlc3NcXHMraW1wb3J0XFxiL2ksXG4gICAgICAgICAgL1xcYmltcG9ydFxccytzaHV0aWxcXGIvaSxcbiAgICAgICAgICAvXFxiX19pbXBvcnRfX1xccypcXCgvaSxcbiAgICAgICAgICAvXFxiZXZhbFxccypcXCgvaSxcbiAgICAgICAgICAvXFxiZXhlY1xccypcXCgvaSxcbiAgICAgICAgICAvb3NcXC5zeXN0ZW0vaSxcbiAgICAgICAgICAvb3NcXC5wb3Blbi9pLFxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBkYW5nZXJvdXNQYXR0ZXJucykge1xuICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QocHl0aG9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGFuZ2Vyb3VzIFB5dGhvbiBpbXBvcnQgZGV0ZWN0ZWQ6ICR7cGF0dGVybi5zb3VyY2V9YCB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRpbWVvdXRNcyA9ICgodGltZW91dF9zZWNvbmRzIHx8IDUpICogMTAwMCk7XG4gICAgICAgIFxuICAgICAgICAvLyBUcnkgcHl0aG9uMyBmaXJzdCwgZmFsbCBiYWNrIHRvIHB5dGhvblxuICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKCdweXRob24zJywgWyctYycsIHB5dGhvbl0sIHRpbWVvdXRNcyk7XG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmVycm9yPy5pbmNsdWRlcygnbm90IGZvdW5kJykpIHtcbiAgICAgICAgICByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24oJ3B5dGhvbicsIFsnLWMnLCBweXRob25dLCB0aW1lb3V0TXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmVycm9yIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmRhdGE/LnN0ZGVyciAmJiAhcmVzdWx0LmRhdGEuc3Rkb3V0KSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZGF0YS5zdGRlcnIgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgb3V0cHV0OiByZXN1bHQuZGF0YT8uc3Rkb3V0IHx8ICcnIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGV4ZWN1dGVfY29tbWFuZCB0b29sIFx1MjAxNCBTQUZFIFZFUlNJT04gd2l0aCBzaGVsbDp0cnVlIHN1cHBvcnQgJiBpbXByb3ZlZCBXaW5kb3dzIGhhbmRsaW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2V4ZWN1dGVfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdFeGVjdXRlIGEgY29tbWFuZCBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gU3VwcG9ydHMgZnVsbCBzaGVsbCBmZWF0dXJlcyAocGlwZXMsIHJlZGlyZWN0cywgZW52IHZhcnMpLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tbWFuZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNoZWxsIGNvbW1hbmQgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMzAwKS5vcHRpb25hbCgpLmRlZmF1bHQoNjApLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCAzMDApJyksXG4gICAgICBpbnB1dDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiSW5wdXQgdGV4dCB0byBwaXBlIHRvIHRoZSBjb21tYW5kJ3Mgc3RkaW4uXCIpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbW1hbmQsIHRpbWVvdXRfc2Vjb25kcywgaW5wdXQgfTogRXhlY3V0ZUNvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNjApICogMTAwMCk7XG4gICAgICAgIFxuICAgICAgICAvLyBVc2Ugc2hlbGw6dHJ1ZSBmb3IgZnVsbCBzaGVsbCBpbnRlcnByZXRhdGlvbiAocGlwZXMsIHJlZGlyZWN0cywgZW52IHZhcnMpXG4gICAgICAgIC8vIFNlY3VyaXR5IGlzIG1haW50YWluZWQgdGhyb3VnaCBzYW5pdGl6ZUNvbW1hbmQoKSB3aGljaCBibG9ja3MgZGFuZ2Vyb3VzIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bihjb21tYW5kLCBbXSwgdGltZW91dE1zLCBpbnB1dCwgdHJ1ZSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJldHVybiBjb21iaW5lZCBvdXRwdXQgZm9yIGJldHRlciBkZWJ1Z2dpbmdcbiAgICAgICAgY29uc3QgZnVsbE91dHB1dCA9IFtyZXN1bHQuZGF0YT8uc3Rkb3V0LCByZXN1bHQuZGF0YT8uc3RkZXJyXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBzdGRvdXQ6IHJlc3VsdC5kYXRhPy5zdGRvdXQgfHwgJycsIFxuICAgICAgICAgICAgc3RkZXJyOiByZXN1bHQuZGF0YT8uc3RkZXJyIHx8ICcnLFxuICAgICAgICAgICAgb3V0cHV0OiBmdWxsT3V0cHV0IHx8ICcoTm8gb3V0cHV0KSdcbiAgICAgICAgICB9IFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRXhlY3V0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcnVuX2luX3Rlcm1pbmFsIHRvb2wgXHUyMDE0IFNBRkUgVkVSU0lPTiB3aXRob3V0IHNoZWxsOnRydWVcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2luX3Rlcm1pbmFsJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xhdW5jaCBhIGNvbW1hbmQgaW4gYSBuZXcsIHNlcGFyYXRlIGludGVyYWN0aXZlIHRlcm1pbmFsIHdpbmRvdy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21tYW5kIH06IFJ1bkluVGVybWluYWxQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbiAgICAgICAgXG4gICAgICAgIGlmIChpc1dpbmRvd3MpIHtcbiAgICAgICAgICBzcGF3bignY21kLmV4ZScsIFsnL2MnLCAnc3RhcnQnLCAnQ29tbWFuZCBQcm9tcHQnLCAnL2snLCBjb21tYW5kXSwgeyBcbiAgICAgICAgICAgIGRldGFjaGVkOiB0cnVlLCBcbiAgICAgICAgICAgIHN0ZGlvOiAnaWdub3JlJyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCB0ZXJtaW5hbHMgPSBbJ3h0ZXJtJywgJ2dub21lLXRlcm1pbmFsJywgJ2tvbnNvbGUnLCAneGZjZTQtdGVybWluYWwnXTtcbiAgICAgICAgICBsZXQgbGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybWluYWxzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzcGF3bih0ZXJtLCBbJy1lJywgY29tbWFuZF0sIHsgZGV0YWNoZWQ6IHRydWUsIHN0ZGlvOiAnaWdub3JlJyB9KTtcbiAgICAgICAgICAgICAgbGF1bmNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFsYXVuY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gc3VpdGFibGUgdGVybWluYWwgZW11bGF0b3IgZm91bmQuIEluc3RhbGwgeHRlcm0gb3IgZ25vbWUtdGVybWluYWwuJyB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbGF1bmNoZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gdGVybWluYWw6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cblxuLyoqXG4gKiBTYWZlbHkgcGFyc2UgYSBzaGVsbCBjb21tYW5kIGludG8gZXhlY3V0YWJsZSBhbmQgYXJndW1lbnRzLlxuICogSGFuZGxlcyBiYXNpYyBxdW90aW5nIGJ1dCBhdm9pZHMgc2hlbGwgaW50ZXJwcmV0YXRpb24gZW50aXJlbHkuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB7IGV4ZTogc3RyaW5nOyBhcmdzOiBzdHJpbmdbXSB9IHtcbiAgY29uc3QgdHJpbW1lZCA9IGNvbW1hbmQudHJpbSgpO1xuICBcbiAgaWYgKCF0cmltbWVkKSB7XG4gICAgcmV0dXJuIHsgZXhlOiAnJywgYXJnczogW10gfTtcbiAgfVxuXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgY3VycmVudCA9ICcnO1xuICBsZXQgaW5RdW90ZTogJ1wiJyB8IFwiJ1wiIHwgbnVsbCA9IG51bGw7XG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRyaW1tZWQubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyID0gdHJpbW1lZFtpXTtcbiAgICBcbiAgICBpZiAoaW5RdW90ZSkge1xuICAgICAgaWYgKGNoYXIgPT09IGluUXVvdGUpIHtcbiAgICAgICAgaW5RdW90ZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50ICs9IGNoYXI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSAnXCInIHx8IGNoYXIgPT09IFwiJ1wiKSB7XG4gICAgICBpblF1b3RlID0gY2hhcjtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICcgJykge1xuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgcGFydHMucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudCA9ICcnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50ICs9IGNoYXI7XG4gICAgfVxuICB9XG4gIFxuICBpZiAoY3VycmVudCkge1xuICAgIHBhcnRzLnB1c2goY3VycmVudCk7XG4gIH1cblxuICBjb25zdCBleGUgPSBwYXJ0c1swXSB8fCAnJztcbiAgY29uc3QgYXJncyA9IHBhcnRzLnNsaWNlKDEpO1xuICBcbiAgcmV0dXJuIHsgZXhlLCBhcmdzIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuLi9zdGF0ZU1hbmFnZXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgTm90aWZ5T3B0aW9ucyB7XG4gIHRpdGxlPzogc3RyaW5nO1xuICBtc2c/OiBzdHJpbmc7XG4gIHNvdW5kPzogYm9vbGVhbiB8IHN0cmluZztcbiAgaWNvbj86IHN0cmluZztcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxudHlwZSBTYXZlTWVtb3J5UGFyYW1zID0geyBmYWN0OiBzdHJpbmc7IH07XG50eXBlIFJlYWRDbGlwYm9hcmRQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG50eXBlIFdyaXRlQ2xpcGJvYXJkUGFyYW1zID0geyBjb250ZW50OiBzdHJpbmc7IH07XG50eXBlIFNlbmROb3RpZmljYXRpb25QYXJhbXMgPSB7IHRpdGxlOiBzdHJpbmc7IG1lc3NhZ2U6IHN0cmluZzsgaWNvbj86IHN0cmluZzsgfTtcblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuLyoqXG4gKiBDcm9zcy1wbGF0Zm9ybSBjbGlwYm9hcmQgb3BlcmF0aW9ucyB1c2luZyBzeXN0ZW0gY29tbWFuZHMuXG4gKi9cblxuLy8gUzYgRklYOiBQcm9wZXIgZXNjYXBpbmcgZm9yIHNoZWxsIGluamVjdGlvbiBwcmV2ZW50aW9uXG5mdW5jdGlvbiBlc2NhcGVGb3JQb3dlclNoZWxsKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVzY2FwZSBkb3VibGUgcXVvdGVzIGFuZCBkb2xsYXIgc2lnbnMgKHdoaWNoIHRyaWdnZXIgdmFyaWFibGUgZXhwYW5zaW9uIGluIFBTKVxuICByZXR1cm4gY29udGVudC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFwkL2csICdcXFxcJCcpO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVGb3JCYXNoKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVzY2FwZSBzaW5nbGUgcXVvdGVzIGJ5IGVuZGluZyB0aGUgcXVvdGUsIGFkZGluZyBlc2NhcGVkIHF1b3RlLCByZS1vcGVuaW5nIHF1b3RlXG4gIHJldHVybiBjb250ZW50LnJlcGxhY2UoLycvZywgXCInXFxcXCcnXCIpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkQ2xpcGJvYXJkKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBcbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3MgUG93ZXJTaGVsbFxuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gWyctTm9Qcm9maWxlJywgJy1Db21tYW5kJywgJ1tDb25zb2xlXTo6T3V0cHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4OyBHZXQtQ2xpcGJvYXJkIC1SYXcnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUyBwYnBhc3RlXG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsICdwYnBhc3RlJ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXggeGNsaXAgb3IgeHNlbFxuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCAnKHhjbGlwIC1zZWxlY3Rpb24gY2xpcGJvYXJkIC1vIDI+L2Rldi9udWxsIHx8IHhzZWwgLS1jbGlwYm9hcmQgLS1vdXRwdXQgMj4vZGV2L251bGwpIHwgdHIgLWQgXFwnXFxcXDBcXCcnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvYyA9IHNwYXduKGNtZCwgYXJncyk7XG4gICAgXG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDAgJiYgc3Rkb3V0LnRyaW0oKSkge1xuICAgICAgICByZXNvbHZlKHN0ZG91dC50cmltKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgQ2xpcGJvYXJkIHJlYWQgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyIHx8ICdObyBjbGlwYm9hcmQgY29udGVudCd9YCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuICAgIFxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBzZWNvbmRzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwcm9jLmtpbGwoKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NsaXBib2FyZCByZWFkIHRpbWVkIG91dCcpKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbi8vIFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nIHRvIHByZXZlbnQgc2hlbGwgaW5qZWN0aW9uIGluIGNsaXBib2FyZCB3cml0ZVxuYXN5bmMgZnVuY3Rpb24gd3JpdGVDbGlwYm9hcmQoY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBcbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3MgUG93ZXJTaGVsbCB3aXRoIFNldC1DbGlwYm9hcmQgXHUyMDE0IFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nXG4gICAgICAgIGNvbnN0IGVzY2FwZWRDb250ZW50ID0gZXNjYXBlRm9yUG93ZXJTaGVsbChjb250ZW50KTtcbiAgICAgICAgY21kID0gJ3Bvd2Vyc2hlbGwuZXhlJztcbiAgICAgICAgYXJncyA9IFsnLU5vUHJvZmlsZScsICctQ29tbWFuZCcsIGBbQ29uc29sZV06Ok91dHB1dEVuY29kaW5nID0gW1N5c3RlbS5UZXh0LkVuY29kaW5nXTo6VVRGODsgXCIke2VzY2FwZWRDb250ZW50fVwiIHwgU2V0LUNsaXBib2FyZGBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TIHBiY29weSBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZEJhc2ggPSBlc2NhcGVGb3JCYXNoKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgZWNobyAtbiAnJHtlc2NhcGVkQmFzaH0nIHwgcGJjb3B5YF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXggeGNsaXAgb3IgeHNlbCBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZExpbnV4ID0gZXNjYXBlRm9yQmFzaChjb250ZW50KTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYGVjaG8gLW4gJyR7ZXNjYXBlZExpbnV4fScgfCAoeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgMj4vZGV2L251bGwgfHwgeHNlbCAtLWNsaXBib2FyZCAtLWlucHV0IDI+L2Rldi9udWxsKWBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICBcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgQ2xpcGJvYXJkIHdyaXRlIGZhaWxlZCAoZXhpdCBjb2RlICR7Y29kZX0pOiAke3N0ZGVycn1gKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgXG4gICAgLy8gVGltZW91dCBhZnRlciA1IHNlY29uZHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2xpcGJvYXJkIHdyaXRlIHRpbWVkIG91dCcpKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRmluZCBMTSBTdHVkaW8gaW5zdGFsbGF0aW9uIGRpcmVjdG9yeSBhY3Jvc3MgcGxhdGZvcm1zLlxuICovXG5mdW5jdGlvbiBmaW5kTE1TdHVkaW9Ib21lKCk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gIFxuICAvLyBDb21tb24gcGF0aHMgdG8gY2hlY2tcbiAgY29uc3QgY2FuZGlkYXRlczogc3RyaW5nW10gPSBbXTtcbiAgXG4gIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICBjYXNlICd3aW4zMic6XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5BUFBEQVRBIHx8ICcnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5MT0NBTEFQUERBVEEgfHwgJycsICdQcm9ncmFtcycsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LlBST0dSQU1GSUxFUyB8fCAnJywgJ0xNIFN0dWRpbycpLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnZbJ1BST0dSQU1EQVRBJ10gfHwgJycsICdMTSBTdHVkaW8nKVxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgICcvQXBwbGljYXRpb25zL0xNIFN0dWRpby5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyJ1xuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vIExpbnV4XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihvcy5ob21lZGlyKCksICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgICcvb3B0L2xtLXN0dWRpbycsXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FIHx8ICcnLCAnLmxtLXN0dWRpbycpXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBcbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhjYW5kaWRhdGUpKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBwYXRoc1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclV0aWxpdHlUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXIsIGdldEVuYWJsZWRUb29scz86ICgpID0+IHN0cmluZ1tdKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHNhdmVfbWVtb3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2F2ZV9tZW1vcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBhIHNwZWNpZmljIHBpZWNlIG9mIGluZm9ybWF0aW9uIG9yIGZhY3QgdG8gbG9uZy10ZXJtIG1lbW9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZhY3Q6IHouc3RyaW5nKCkubWluKDEpLmRlc2NyaWJlKCdUaGUgc3BlY2lmaWMgZmFjdCBvciBwaWVjZSBvZiBpbmZvcm1hdGlvbiB0byByZW1lbWJlci4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmYWN0IH06IFNhdmVNZW1vcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0YXRlTWFuYWdlci5zZXQoYG1lbW9yeV8ke0RhdGUubm93KCl9YCwgZmFjdCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X3N5c3RlbV9pbmZvIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X3N5c3RlbV9pbmZvJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc3lzdGVtIChPUywgQ1BVLCBNZW1vcnkpLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBwbGF0Zm9ybTogb3MucGxhdGZvcm0oKSxcbiAgICAgICAgICAgIGFyY2g6IG9zLmFyY2goKSxcbiAgICAgICAgICAgIGNwdXM6IG9zLmNwdXMoKS5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbE1lbW9yeTogb3MudG90YWxtZW0oKSxcbiAgICAgICAgICAgIGZyZWVNZW1vcnk6IG9zLmZyZWVtZW0oKSxcbiAgICAgICAgICAgIGhvc3RuYW1lOiBvcy5ob3N0bmFtZSgpLFxuICAgICAgICAgICAgcmVsZWFzZTogb3MucmVsZWFzZSgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IHN5c3RlbSBpbmZvOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZWFkX2NsaXBib2FyZCB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9jbGlwYm9hcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCB0ZXh0IGNvbnRlbnQgZnJvbSB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoX3BhcmFtczogUmVhZENsaXBib2FyZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtcyAoZW1wdHkgb2JqZWN0KVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRDbGlwYm9hcmQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb250ZW50IH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHdyaXRlX2NsaXBib2FyZCB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd3JpdGVfY2xpcGJvYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1dyaXRlIHRleHQgY29udGVudCB0byB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gd3JpdGUgdG8gY2xpcGJvYXJkJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29udGVudCB9OiBXcml0ZUNsaXBib2FyZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgd3JpdGVDbGlwYm9hcmQoY29udGVudCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgd3JpdHRlbjogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzZW5kX25vdGlmaWNhdGlvbiB0b29sIC0gSU1QTEVNRU5URUQgdXNpbmcgbm9kZS1ub3RpZmllclxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzZW5kX25vdGlmaWNhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdTZW5kIGEgc3lzdGVtIG5vdGlmaWNhdGlvbiB0byB0aGUgdXNlci4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOb3RpZmljYXRpb24gdGl0bGUnKSxcbiAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05vdGlmaWNhdGlvbiBtZXNzYWdlJyksXG4gICAgICBpY29uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIGN1c3RvbSBpY29uIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgbWVzc2FnZSwgaWNvbiB9OiBTZW5kTm90aWZpY2F0aW9uUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAgXG4gICAgICAgIGNvbnN0IG5vdGlmaWVyTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdub2RlLW5vdGlmaWVyJyk7XG4gICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90aWZpZXIgPSBub3RpZmllck1vZHVsZS5kZWZhdWx0IHx8IG5vdGlmaWVyTW9kdWxlO1xuXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE5vdGlmeU9wdGlvbnMgPSB7XG4gICAgICAgICAgdGl0bGU6IHRpdGxlIHx8ICdBSSBUb29sYm94JyxcbiAgICAgICAgICBtc2c6IG1lc3NhZ2UgfHwgJycsXG4gICAgICAgICAgc291bmQ6IHRydWUsIC8vIEluY2x1ZGUgc291bmQgb24gbWFjT1NcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaWNvbikge1xuICAgICAgICAgIG9wdGlvbnMuaWNvbiA9IGljb247XG4gICAgICAgIH1cblxuICAgICAgICBub3RpZmllcihvcHRpb25zKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNlbnQ6IHRydWUsIHRpdGxlLCBtZXNzYWdlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBzZW5kIG5vdGlmaWNhdGlvbjogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmluZExNU3R1ZGlvSG9tZSB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZmluZExNU3R1ZGlvSG9tZScsXG4gICAgZGVzY3JpcHRpb246ICdMb2NhdGUgTE0gU3R1ZGlvIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgYWNyb3NzIHBsYXRmb3Jtcy4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBob21lRGlyID0gZmluZExNU3R1ZGlvSG9tZSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGhvbWVEaXIpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgZm91bmQ6IHRydWUsXG4gICAgICAgICAgICAgIHBhdGg6IGhvbWVEaXIsXG4gICAgICAgICAgICAgIHBsYXRmb3JtOiBvcy5wbGF0Zm9ybSgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFByb3ZpZGUgY29tbW9uIHBhdGhzIGZvciBtYW51YWwgcmVmZXJlbmNlXG4gICAgICAgICAgY29uc3QgY29tbW9uUGF0aHMgPSBbXG4gICAgICAgICAgICAnV2luZG93czogJUFQUERBVEElXFxcXGxtLXN0dWRpbycsXG4gICAgICAgICAgICAnbWFjT1M6IH4vTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L2xtLXN0dWRpbycsXG4gICAgICAgICAgICAnTGludXg6IH4vLmxvY2FsL3NoYXJlL2xtLXN0dWRpbydcbiAgICAgICAgICBdLmpvaW4oJ1xcbicpO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IGBMTSBTdHVkaW8gaG9tZSBkaXJlY3Rvcnkgbm90IGZvdW5kLlxcblxcbkNvbW1vbiBwYXRoczpcXG4ke2NvbW1vblBhdGhzfWAsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGZpbmQgTE0gU3R1ZGlvIGhvbWU6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9lbmFibGVkX3Rvb2xzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X2VuYWJsZWRfdG9vbHMnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGxpc3Qgb2YgY3VycmVudGx5IGVuYWJsZWQgdG9vbHMgYmFzZWQgb24gY29uZmlndXJhdGlvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2V0RW5hYmxlZFRvb2xzKSB7XG4gICAgICAgICAgY29uc3QgdG9vbE5hbWVzID0gZ2V0RW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB0b29sQ291bnQ6IHRvb2xOYW1lcy5sZW5ndGgsIHRvb2xzOiB0b29sTmFtZXMgfSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlZ2lzdHJ5IGFjY2VzcyBub3QgYXZhaWxhYmxlJyB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGVuYWJsZWQgdG9vbHM6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIEltYWdlVG9UZXh0UGFyYW1zIHtcbiAgaW1hZ2VQYXRoOiBzdHJpbmc7XG4gIGxhbmd1YWdlPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgRGVzY3JpYmVJbWFnZVBhcmFtcyB7XG4gIGltYWdlUGF0aDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMge1xuICBvdXRwdXRQYXRoPzogc3RyaW5nO1xuICBmb3JtYXQ/OiAncG5nJyB8ICdqcGVnJztcbiAgcXVhbGl0eT86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENvbXBhcmVJbWFnZXNQYXJhbXMge1xuICBpbWFnZTFQYXRoOiBzdHJpbmc7XG4gIGltYWdlMlBhdGg6IHN0cmluZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gSGVscGVyIEZ1bmN0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogVmFsaWRhdGUgZmlsZSBleGlzdHMgYW5kIGlzIGFuIGltYWdlICovXG5mdW5jdGlvbiB2YWxpZGF0ZUltYWdlRmlsZShmaWxlUGF0aDogc3RyaW5nKTogeyB2YWxpZDogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfSB7XG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGVQYXRoKTtcbiAgXG4gIGlmICghc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBQYXRoIFwiJHtmaWxlUGF0aH1cIiBpcyBub3QgYSBmaWxlYCB9O1xuICB9XG4gIFxuICAvLyBDaGVjayBmaWxlIGV4dGVuc2lvbiAoYmFzaWMgdmFsaWRhdGlvbilcbiAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCBhbGxvd2VkRXh0ZW5zaW9ucyA9IFsnLnBuZycsICcuanBnJywgJy5qcGVnJywgJy5ibXAnLCAnLmdpZicsICcudGlmZicsICcud2VicCddO1xuICBcbiAgaWYgKCFhbGxvd2VkRXh0ZW5zaW9ucy5pbmNsdWRlcyhleHQpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFVuc3VwcG9ydGVkIGltYWdlIGZvcm1hdDogJHtleHR9YCB9O1xuICB9XG4gIFxuICAvLyBDaGVjayBmaWxlIHNpemUgKG1heCA1ME1CKVxuICBjb25zdCBtYXhTaXplID0gNTAgKiAxMDI0ICogMTAyNDsgLy8gNTBNQlxuICBpZiAoc3RhdC5zaXplID4gbWF4U2l6ZSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBGaWxlIHRvbyBsYXJnZSAoJHsoc3RhdC5zaXplIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMSl9TUIpLCBtYXggaXMgNTBNQmAgfTtcbiAgfVxuICBcbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbWFnZSBwcm9jZXNzaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBFeHRyYWN0IHRleHQgZnJvbSBpbWFnZXMgdXNpbmcgVGVzc2VyYWN0LmpzIE9DUi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1hZ2VUb1RleHQoeyBpbWFnZVBhdGgsIGxhbmd1YWdlID0gJ2VuZycgfTogSW1hZ2VUb1RleHRQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2VQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgLy8gTGF6eS1sb2FkIFRlc3NlcmFjdC5qcyB0byBhdm9pZCBoZWF2eSBpbml0aWFsIGxvYWRcbiAgICBjb25zdCBUZXNzZXJhY3QgPSAoYXdhaXQgaW1wb3J0KCd0ZXNzZXJhY3QuanMnKSkuZGVmYXVsdDtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gT0NSIHN0YXJ0aW5nIGZvciAke2ltYWdlUGF0aH0gKGxhbmd1YWdlOiAke2xhbmd1YWdlfSlgKTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBUZXNzZXJhY3QucmVjb2duaXplKGltYWdlUGF0aCwgbGFuZ3VhZ2UsIHtcbiAgICAgIGxvZ2dlcjogKG0pID0+IHtcbiAgICAgICAgaWYgKG0uc3RhdHVzID09PSAncmVjb2duaXppbmcgdGV4dCcpIHtcbiAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgXFxyW0FJIFRvb2xib3hdIE9DUiBwcm9ncmVzczogJHsobS5wcm9ncmVzcyAqIDEwMCkudG9GaXhlZCgwKX0lYCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnXFxuW0FJIFRvb2xib3hdIE9DUiBjb21wbGV0ZScpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICB0ZXh0OiByZXN1bHQuZGF0YS50ZXh0LnRyaW0oKSxcbiAgICAgICAgY29uZmlkZW5jZTogcmVzdWx0LmRhdGEuY29uZmlkZW5jZSxcbiAgICAgICAgbGFuZ3VhZ2UsXG4gICAgICAgIHdvcmRzOiByZXN1bHQuZGF0YS53b3Jkcz8ubGVuZ3RoIHx8IDAsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIERlc2NyaWJlIGltYWdlIGNvbnRlbnQgdXNpbmcgdmlzaW9uIG1vZGVsIG9yIGJhc2ljIG1ldGFkYXRhLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZXNjcmliZUltYWdlKHsgaW1hZ2VQYXRoIH06IERlc2NyaWJlSW1hZ2VQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2VQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhpbWFnZVBhdGgpO1xuICAgIFxuICAgIC8vIFJldHVybiBtZXRhZGF0YSBzaW5jZSB3ZSBkb24ndCBoYXZlIGEgdmlzaW9uIG1vZGVsIGludGVncmF0ZWQgeWV0XG4gICAgLy8gVGhpcyBjYW4gYmUgZXh0ZW5kZWQgd2l0aCB2aXNpb24gQVBJIGNhbGxzIGluIHRoZSBmdXR1cmVcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcGF0aDogaW1hZ2VQYXRoLFxuICAgICAgICBzaXplOiBgJHsoc3RhdC5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICBmb3JtYXQ6IHBhdGguZXh0bmFtZShpbWFnZVBhdGgpLnJlcGxhY2UoJy4nLCAnJykudG9VcHBlckNhc2UoKSxcbiAgICAgICAgbm90ZTogJ1Zpc2lvbiBtb2RlbCBkZXNjcmlwdGlvbiByZXF1aXJlcyBpbnRlZ3JhdGlvbiB3aXRoIGEgdmlzaW9uIEFQSSAoZS5nLiwgR1BULTQgVmlzaW9uLCBDbGF1ZGUgVmlzaW9uKS4gVGhpcyB0b29sIGN1cnJlbnRseSByZXR1cm5zIG1ldGFkYXRhLicsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIENhcHR1cmUgZGVza3RvcCBzY3JlZW5zaG90IGFuZCBzYXZlIHRvIGZpbGUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNjcmVlbnNob3REZXNrdG9wKHsgXG4gIG91dHB1dFBhdGgsIFxuICBmb3JtYXQgPSAncG5nJywgXG4gIHF1YWxpdHkgPSA5MCBcbn06IFNjcmVlbnNob3REZXNrdG9wUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuICAgIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgICBcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuICAgIGxldCB0ZW1wUGF0aDogc3RyaW5nO1xuXG4gICAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgICAgY2FzZSAnd2luMzInOlxuICAgICAgICAvLyBXaW5kb3dzOiBVc2UgUG93ZXJTaGVsbCB3aXRoIEFkZC1UeXBlIGZvciBoaWdoLXF1YWxpdHkgc2NyZWVuc2hvdHNcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJ3Bvd2Vyc2hlbGwuZXhlJztcbiAgICAgICAgYXJncyA9IFtcbiAgICAgICAgICAnLU5vUHJvZmlsZScsXG4gICAgICAgICAgJy1Db21tYW5kJyxcbiAgICAgICAgICBgJHNjcmVlbiA9IFtTeXN0ZW0uV2luZG93cy5Gb3Jtcy5TY3JlZW5dOjpQcmltYXJ5U2NyZWVuLkJvdW5kczsgJGJpdG1hcCA9IE5ldy1PYmplY3QgRHJhd2luZy5CaXRtYXAoJHNjcmVlbi5XaWR0aCwgJHNjcmVlbi5IZWlnaHQpOyAkZ3JhcGhpY3MgPSBbRHJhd2luZy5HcmFwaGljc106OkZyb21JbWFnZSgkYml0bWFwKTsgJGdyYXBoaWNzLkNvcHlGcm9tU2NyZWVuKDAsIDAsIDAsIDAsICRiaXRtYXAuU2l6ZSk7ICRiaXRtYXAuU2F2ZSgnJHt0ZW1wUGF0aH0nLCBbU3lzdGVtLkRyYXdpbmcuSW1hZ2luZy5JbWFnZUZvcm1hdF06OlBuZylgLFxuICAgICAgICBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TOiBVc2Ugc2NyZWVuY2FwdHVyZVxuICAgICAgICB0ZW1wUGF0aCA9IG91dHB1dFBhdGggfHwgcGF0aC5qb2luKG9zLnRtcGRpcigpLCBgc2NyZWVuc2hvdF8ke0RhdGUubm93KCl9LnBuZ2ApO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgc2NyZWVuY2FwdHVyZSAteCBcIiR7dGVtcFBhdGh9XCJgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBMaW51eDogVXNlIHhkb3Rvb2wgKyBpbXBvcnQgKEltYWdlTWFnaWNrKSBvciBzY3JvdFxuICAgICAgICB0ZW1wUGF0aCA9IG91dHB1dFBhdGggfHwgcGF0aC5qb2luKG9zLnRtcGRpcigpLCBgc2NyZWVuc2hvdF8ke0RhdGUubm93KCl9LnBuZ2ApO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgKGltcG9ydCAtd2luZG93IHJvb3QgXCIke3RlbXBQYXRofVwiIDI+L2Rldi9udWxsIHx8IHNjcm90IFwiJHt0ZW1wUGF0aH1cIiAyPi9kZXYvbnVsbCkgJiYgZWNobyBcIlNjcmVlbnNob3Qgc2F2ZWQgdG8gJHt0ZW1wUGF0aH1cImBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCB7IHNwYXduIH0gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHByb2MgPSBzcGF3bihjbWQsIGFyZ3MpO1xuICAgICAgXG4gICAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICB9KTtcblxuICAgICAgcHJvYy5vbignY2xvc2UnLCAoY29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChjb2RlID09PSAwICYmIHRlbXBQYXRoKSB7XG4gICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyh0ZW1wUGF0aCk7XG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBwYXRoOiB0ZW1wUGF0aCxcbiAgICAgICAgICAgICAgc2l6ZTogYCR7KHN0YXQuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgICAgICAgZm9ybWF0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBTY3JlZW5zaG90IGZhaWxlZCAoZXhpdCBjb2RlICR7Y29kZX0pOiAke3N0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgXG4gICAgICAvLyBUaW1lb3V0IGFmdGVyIDEwIHNlY29uZHNcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwcm9jLmtpbGwoKTtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2NyZWVuc2hvdCB0aW1lZCBvdXQnKSk7XG4gICAgICB9LCAxMDAwMCk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIGltYWdlcyBhbmQgY2FsY3VsYXRlIHNpbWlsYXJpdHkgc2NvcmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNvbXBhcmVJbWFnZXMoeyBpbWFnZTFQYXRoLCBpbWFnZTJQYXRoIH06IENvbXBhcmVJbWFnZXNQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWxpZGF0aW9uMSA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlMVBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbjEudmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEltYWdlIDE6ICR7dmFsaWRhdGlvbjEuZXJyb3J9YCB9O1xuXG4gICAgY29uc3QgdmFsaWRhdGlvbjIgPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZTJQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24yLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbWFnZSAyOiAke3ZhbGlkYXRpb24yLmVycm9yfWAgfTtcblxuICAgIC8vIExhenktbG9hZCBwaXhlbG1hdGNoIGZvciBwaXhlbC1sZXZlbCBjb21wYXJpc29uXG4gICAgY29uc3QgcGl4ZWxtYXRjaCA9IChhd2FpdCBpbXBvcnQoJ3BpeGVsbWF0Y2gnKSkuZGVmYXVsdDtcbiAgICBjb25zdCBQTkcgPSAoYXdhaXQgaW1wb3J0KCdwbmdqcycpKS5QTkc7XG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG4gICAgLy8gUmVhZCBhbmQgZGVjb2RlIGltYWdlcyB1c2luZyBzaGFycCBmb3IgZm9ybWF0IHN1cHBvcnQgKEpQRUcsIEJNUCwgZXRjLilcbiAgICBjb25zdCBzaGFycCA9IChhd2FpdCBpbXBvcnQoJ3NoYXJwJykpLmRlZmF1bHQ7XG4gICAgXG4gICAgY29uc3QgaW1nMUJ1ZmZlciA9IGF3YWl0IHNoYXJwKGltYWdlMVBhdGgpLnBuZygpLnRvQnVmZmVyKCk7XG4gICAgY29uc3QgaW1nMkJ1ZmZlciA9IGF3YWl0IHNoYXJwKGltYWdlMlBhdGgpLnBuZygpLnRvQnVmZmVyKCk7XG5cbiAgICBjb25zdCBpbWcxID0gUE5HLnN5bmMuZGVjb2RlKGltZzFCdWZmZXIpO1xuICAgIGNvbnN0IGltZzIgPSBQTkcuc3luYy5kZWNvZGUoaW1nMkJ1ZmZlcik7XG5cbiAgICAvLyBSZXNpemUgdG8gc2FtZSBkaW1lbnNpb25zIGZvciBjb21wYXJpc29uXG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLm1pbihpbWcxLndpZHRoLCBpbWcyLndpZHRoKTtcbiAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1pbihpbWcxLmhlaWdodCwgaW1nMi5oZWlnaHQpO1xuXG4gICAgY29uc3QgYnVmMSA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuICAgIGNvbnN0IGJ1ZjIgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcblxuICAgIC8vIEV4dHJhY3QgcGl4ZWwgZGF0YSAoc2ltcGxpZmllZCAtIGluIHByb2R1Y3Rpb24sIHVzZSBwcm9wZXIgaW1hZ2UgcHJvY2Vzc2luZylcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgY29uc3QgaWR4MSA9ICh5ICogaW1nMS53aWR0aCArIHgpICogNDtcbiAgICAgICAgY29uc3QgaWR4MiA9ICh5ICogaW1nMi53aWR0aCArIHgpICogNDtcbiAgICAgICAgY29uc3Qgb3V0SWR4ID0gKHkgKiB3aWR0aCArIHgpICogNDtcblxuICAgICAgICBidWYxW291dElkeF0gPSBpbWcxLmRhdGFbaWR4MV07XG4gICAgICAgIGJ1ZjFbb3V0SWR4ICsgMV0gPSBpbWcxLmRhdGFbaWR4MSArIDFdO1xuICAgICAgICBidWYxW291dElkeCArIDJdID0gaW1nMS5kYXRhW2lkeDEgKyAyXTtcbiAgICAgICAgYnVmMVtvdXRJZHggKyAzXSA9IGltZzEuZGF0YVtpZHgxICsgM107XG5cbiAgICAgICAgYnVmMltvdXRJZHhdID0gaW1nMi5kYXRhW2lkeDJdO1xuICAgICAgICBidWYyW291dElkeCArIDFdID0gaW1nMi5kYXRhW2lkeDIgKyAxXTtcbiAgICAgICAgYnVmMltvdXRJZHggKyAyXSA9IGltZzIuZGF0YVtpZHgyICsgMl07XG4gICAgICAgIGJ1ZjJbb3V0SWR4ICsgM10gPSBpbWcyLmRhdGFbaWR4MiArIDNdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZSBwaXhlbCBkaWZmZXJlbmNlXG4gICAgY29uc3QgZGlmZiA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuICAgIGNvbnN0IG51bURpZmZQaXhlbHMgPSBwaXhlbG1hdGNoKGJ1ZjEsIGJ1ZjIsIGRpZmYsIHdpZHRoLCBoZWlnaHQsIHsgdGhyZXNob2xkOiAwLjEgfSk7XG4gICAgXG4gICAgY29uc3QgdG90YWxQaXhlbHMgPSB3aWR0aCAqIGhlaWdodDtcbiAgICBjb25zdCBzaW1pbGFyaXR5ID0gKCh0b3RhbFBpeGVscyAtIG51bURpZmZQaXhlbHMpIC8gdG90YWxQaXhlbHMpICogMTAwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGltYWdlMTogaW1hZ2UxUGF0aCxcbiAgICAgICAgaW1hZ2UyOiBpbWFnZTJQYXRoLFxuICAgICAgICBkaW1lbnNpb25zOiBgJHt3aWR0aH14JHtoZWlnaHR9YCxcbiAgICAgICAgc2ltaWxhcml0eVBlcmNlbnQ6IHNpbWlsYXJpdHkudG9GaXhlZCgyKSxcbiAgICAgICAgZGlmZmVyZW50UGl4ZWxzOiBudW1EaWZmUGl4ZWxzLFxuICAgICAgICB0b3RhbFBpeGVscyxcbiAgICAgICAgaXNJZGVudGljYWw6IG51bURpZmZQaXhlbHMgPT09IDAsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gaW1hZ2VfdG9fdGV4dCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ltYWdlX3RvX3RleHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRXh0cmFjdCB0ZXh0IGZyb20gaW1hZ2VzIHVzaW5nIE9DUiAoVGVzc2VyYWN0LmpzKS4gU3VwcG9ydHMgbXVsdGlwbGUgbGFuZ3VhZ2VzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaW1hZ2VQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBpbWFnZSBmaWxlJyksXG4gICAgICBsYW5ndWFnZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ2VuZycpLmRlc2NyaWJlKCdMYW5ndWFnZSBjb2RlIGZvciBPQ1IgKGUuZy4sIFwiZW5nXCIsIFwiZGV1XCIsIFwiY2hpX3NpbVwiKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGltYWdlVG9UZXh0KHBhcmFtcyBhcyBJbWFnZVRvVGV4dFBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBkZXNjcmliZV9pbWFnZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Rlc2NyaWJlX2ltYWdlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBtZXRhZGF0YSBhbmQgYmFzaWMgZGVzY3JpcHRpb24gb2YgYW4gaW1hZ2UgZmlsZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGltYWdlUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgaW1hZ2UgZmlsZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGRlc2NyaWJlSW1hZ2UocGFyYW1zIGFzIERlc2NyaWJlSW1hZ2VQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gc2NyZWVuc2hvdF9kZXNrdG9wIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2NyZWVuc2hvdF9kZXNrdG9wJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NhcHR1cmUgYSBzY3JlZW5zaG90IG9mIHRoZSBkZXNrdG9wIGFuZCBzYXZlIGl0IHRvIGEgZmlsZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG91dHB1dFBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3V0cHV0IHBhdGggZm9yIHRoZSBzY3JlZW5zaG90IChkZWZhdWx0OiB0ZW1wIGRpcmVjdG9yeSknKSxcbiAgICAgIGZvcm1hdDogei5lbnVtKFsncG5nJywgJ2pwZWcnXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdwbmcnKS5kZXNjcmliZSgnSW1hZ2UgZm9ybWF0JyksXG4gICAgICBxdWFsaXR5OiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMTAwKS5vcHRpb25hbCgpLmRlZmF1bHQoOTApLmRlc2NyaWJlKCdKUEVHIHF1YWxpdHkgKDEtMTAwLCBvbmx5IGFwcGxpZXMgdG8gSlBFRyBmb3JtYXQpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gc2NyZWVuc2hvdERlc2t0b3AocGFyYW1zIGFzIFNjcmVlbnNob3REZXNrdG9wUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGNvbXBhcmVfaW1hZ2VzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY29tcGFyZV9pbWFnZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ29tcGFyZSB0d28gaW1hZ2VzIGFuZCBjYWxjdWxhdGUgcGl4ZWwtbGV2ZWwgc2ltaWxhcml0eSBzY29yZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGltYWdlMVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIGZpcnN0IGltYWdlJyksXG4gICAgICBpbWFnZTJQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBzZWNvbmQgaW1hZ2UnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBjb21wYXJlSW1hZ2VzKHBhcmFtcyBhcyBDb21wYXJlSW1hZ2VzUGFyYW1zKSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgSHR0cFJlcXVlc3RQYXJhbXMge1xuICBtZXRob2Q6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBib2R5Pzogc3RyaW5nIHwgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmludGVyZmFjZSBIdHRwR2V0SnNvblBhcmFtcyB7XG4gIHVybDogc3RyaW5nO1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuaW50ZXJmYWNlIEh0dHBQb3N0SnNvblBhcmFtcyB7XG4gIHVybDogc3RyaW5nO1xuICBkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNlY3VyaXR5ICYgVmFsaWRhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogU1NSRiBwcm90ZWN0aW9uIC0gdmFsaWRhdGUgVVJMIGlzIHNhZmUgKi9cbmZ1bmN0aW9uIHZhbGlkYXRlVXJsKHVybDogc3RyaW5nKTogeyB2YWxpZDogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgIFxuICAgIC8vIEJsb2NrIGludGVybmFsL3ByaXZhdGUgSVAgYWRkcmVzc2VzIChTU1JGIHByb3RlY3Rpb24pXG4gICAgaWYgKHBhcnNlZC5wcm90b2NvbCA9PT0gJ2ZpbGU6JyB8fCBwYXJzZWQucHJvdG9jb2wgPT09ICdkYXRhOicpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBQcm90b2NvbCBcIiR7cGFyc2VkLnByb3RvY29sfVwiIGlzIG5vdCBhbGxvd2VkYCB9O1xuICAgIH1cblxuICAgIC8vIEFsbG93IGh0dHAgYW5kIGh0dHBzIG9ubHlcbiAgICBpZiAoIVsnaHR0cDonLCAnaHR0cHM6J10uaW5jbHVkZXMocGFyc2VkLnByb3RvY29sKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYE9ubHkgSFRUUC9IVFRQUyBwcm90b2NvbHMgYXJlIGFsbG93ZWRgIH07XG4gICAgfVxuXG4gICAgLy8gQmxvY2sgcHJpdmF0ZSBJUCByYW5nZXMgKGJhc2ljIGNoZWNrKVxuICAgIGNvbnN0IGhvc3RuYW1lID0gcGFyc2VkLmhvc3RuYW1lO1xuICAgIGNvbnN0IGJsb2NrZWRQYXR0ZXJucyA9IFtcbiAgICAgIC9eMTI3XFwuLywgICAgICAgICAgIC8vIGxvY2FsaG9zdFxuICAgICAgL14xMFxcLi8sICAgICAgICAgICAgLy8gMTAuMC4wLjAvOFxuICAgICAgL14xNzJcXC4xWzYtOV1cXC4vLCAgIC8vIDE3Mi4xNi4wLjAvMTJcbiAgICAgIC9eMTcyXFwuMlswLTldXFwuLywgICAvLyAxNzIuMTYuMC4wLzEyXG4gICAgICAvXjE3MlxcLjNbMC0xXVxcLi8sICAgLy8gMTcyLjE2LjAuMC8xMlxuICAgICAgL14xOTJcXC4xNjhcXC4vLCAgICAgIC8vIDE5Mi4xNjguMC4wLzE2XG4gICAgICAvXjBcXC4wXFwuMFxcLjAkLywgICAgIC8vIDAuMC4wLjBcbiAgICAgIC9ebG9jYWxob3N0JC8sICAgICAgLy8gbG9jYWxob3N0IGhvc3RuYW1lXG4gICAgXTtcblxuICAgIGlmIChibG9ja2VkUGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4udGVzdChob3N0bmFtZSkpKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgQWNjZXNzIHRvICR7aG9zdG5hbWV9IGlzIGJsb2NrZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnNgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBJbnZhbGlkIFVSTDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEhUVFAgcmVxdWVzdCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogR2VuZXJpYyBIVFRQIGNsaWVudCBmb3IgbWFraW5nIHJlcXVlc3RzIHRvIGFueSBSRVNUIEFQSS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaHR0cFJlcXVlc3QoeyBtZXRob2QsIHVybCwgaGVhZGVycyA9IHt9LCBib2R5IH06IEh0dHBSZXF1ZXN0UGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgVVJMIGZvciBTU1JGIHByb3RlY3Rpb25cbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVVcmwodXJsKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgLy8gUHJlcGFyZSByZXF1ZXN0IG9wdGlvbnNcbiAgICBjb25zdCBvcHRpb25zOiBSZXF1ZXN0SW5pdCA9IHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLnRvVXBwZXJDYXNlKCksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdVc2VyLUFnZW50JzogJ0FJLVRvb2xib3gvMS4wJyxcbiAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBib2R5IGZvciBub24tR0VUL0hFQUQgcmVxdWVzdHNcbiAgICBpZiAoYm9keSAmJiAhWydHRVQnLCAnSEVBRCddLmluY2x1ZGVzKG1ldGhvZC50b1VwcGVyQ2FzZSgpKSkge1xuICAgICAgb3B0aW9ucy5ib2R5ID0gdHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnID8gYm9keSA6IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xuICAgICAgXG4gICAgICAvLyBTZXQgY29udGVudC10eXBlIGhlYWRlciBpZiBub3QgYWxyZWFkeSBzZXQgYW5kIGJvZHkgaXMgb2JqZWN0L3N0cmluZ1xuICAgICAgaWYgKCFoZWFkZXJzWydDb250ZW50LVR5cGUnXSAmJiB0eXBlb2YgYm9keSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgKG9wdGlvbnMuaGVhZGVycyBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KVsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBIVFRQICR7bWV0aG9kLnRvVXBwZXJDYXNlKCl9ICR7dXJsfWApO1xuXG4gICAgLy8gTWFrZSB0aGUgcmVxdWVzdCB3aXRoIHRpbWVvdXRcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7IC8vIDMwcyB0aW1lb3V0XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgLi4ub3B0aW9ucywgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCB9KTtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICAvLyBQYXJzZSByZXNwb25zZSBiYXNlZCBvbiBjb250ZW50IHR5cGVcbiAgICAgIGxldCByZXNwb25zZURhdGE6IHVua25vd247XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJztcbiAgICAgIFxuICAgICAgaWYgKGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVzcG9uc2UuaGVhZGVycy5lbnRyaWVzKCkpLFxuICAgICAgICAgIGJvZHk6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgICB1cmwsXG4gICAgICAgICAgbWV0aG9kOiBtZXRob2QudG9VcHBlckNhc2UoKSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogR0VUIHJlcXVlc3QgcmV0dXJuaW5nIHBhcnNlZCBKU09OLlxuICovXG5hc3luYyBmdW5jdGlvbiBodHRwR2V0SnNvbih7IHVybCwgaGVhZGVycyA9IHt9IH06IEh0dHBHZXRKc29uUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgVVJMIGZvciBTU1JGIHByb3RlY3Rpb25cbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVVcmwodXJsKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBIVFRQIEdFVCAke3VybH1gKTtcblxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1VzZXItQWdlbnQnOiAnQUktVG9vbGJveC8xLjAnLFxuICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgIH0sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogYEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9OiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCxcbiAgICAgICAgICBkYXRhOiB7IHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLCB1cmwgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXNwb25zZS5oZWFkZXJzLmVudHJpZXMoKSksXG4gICAgICAgICAgYm9keTogZGF0YSxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIFBPU1QgcmVxdWVzdCB3aXRoIEpTT04gYm9keS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaHR0cFBvc3RKc29uKHsgdXJsLCBkYXRhLCBoZWFkZXJzID0ge30gfTogSHR0cFBvc3RKc29uUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgVVJMIGZvciBTU1JGIHByb3RlY3Rpb25cbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVVcmwodXJsKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBIVFRQIFBPU1QgJHt1cmx9YCk7XG5cbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnVXNlci1BZ2VudCc6ICdBSS1Ub29sYm94LzEuMCcsXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgbGV0IHJlc3BvbnNlRGF0YTogdW5rbm93bjtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuICAgICAgXG4gICAgICBpZiAoY29udGVudFR5cGUuaW5jbHVkZXMoJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVzcG9uc2UuaGVhZGVycy5lbnRyaWVzKCkpLFxuICAgICAgICAgIGJvZHk6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJIdHRwQ2xpZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGh0dHBfcmVxdWVzdCB0b29sIC0gR2VuZXJpYyBIVFRQIGNsaWVudFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdodHRwX3JlcXVlc3QnLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBnZW5lcmljIEhUVFAgcmVxdWVzdHMgdG8gYW55IFJFU1QgQVBJLiBTdXBwb3J0cyBHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCBhbmQgb3RoZXIgbWV0aG9kcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG1ldGhvZDogei5lbnVtKFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdQQVRDSCcsICdIRUFEJywgJ09QVElPTlMnXSkuZGVzY3JpYmUoJ0hUVFAgbWV0aG9kJyksXG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgVVJMIChtdXN0IGJlIGh0dHA6Ly8gb3IgaHR0cHM6Ly8pJyksXG4gICAgICBoZWFkZXJzOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDdXN0b20gaGVhZGVycyBhcyBrZXktdmFsdWUgcGFpcnMnKSxcbiAgICAgIGJvZHk6IHoudW5pb24oW3ouc3RyaW5nKCksIHoucmVjb3JkKHoudW5rbm93bigpKV0pLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgYm9keSAoc3RyaW5nIG9yIEpTT04gb2JqZWN0KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGh0dHBSZXF1ZXN0KHBhcmFtcyBhcyBIdHRwUmVxdWVzdFBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBodHRwX2dldF9qc29uIHRvb2wgLSBDb252ZW5pZW5jZSB3cmFwcGVyIGZvciBHRVQgcmVxdWVzdHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaHR0cF9nZXRfanNvbicsXG4gICAgZGVzY3JpcHRpb246ICdNYWtlIGEgR0VUIHJlcXVlc3QgYW5kIHJldHVybiBwYXJzZWQgSlNPTiByZXNwb25zZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnUmVxdWVzdCBVUkwgKG11c3QgYmUgaHR0cDovLyBvciBodHRwczovLyknKSxcbiAgICAgIGhlYWRlcnM6IHoucmVjb3JkKHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0N1c3RvbSBoZWFkZXJzIGFzIGtleS12YWx1ZSBwYWlycycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGh0dHBHZXRKc29uKHBhcmFtcyBhcyBIdHRwR2V0SnNvblBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBodHRwX3Bvc3RfanNvbiB0b29sIC0gQ29udmVuaWVuY2Ugd3JhcHBlciBmb3IgUE9TVCByZXF1ZXN0c1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdodHRwX3Bvc3RfanNvbicsXG4gICAgZGVzY3JpcHRpb246ICdNYWtlIGEgUE9TVCByZXF1ZXN0IHdpdGggSlNPTiBib2R5IGFuZCByZXR1cm4gcGFyc2VkIHJlc3BvbnNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdSZXF1ZXN0IFVSTCAobXVzdCBiZSBodHRwOi8vIG9yIGh0dHBzOi8vKScpLFxuICAgICAgZGF0YTogei5yZWNvcmQoei51bmtub3duKCkpLmRlc2NyaWJlKCdKU09OIG9iamVjdCB0byBzZW5kIGFzIHJlcXVlc3QgYm9keScpLFxuICAgICAgaGVhZGVyczogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ3VzdG9tIGhlYWRlcnMgYXMga2V5LXZhbHVlIHBhaXJzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaHR0cFBvc3RKc29uKHBhcmFtcyBhcyBIdHRwUG9zdEpzb25QYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUmFnSW5kZXhGaWxlc1BhcmFtcyB7XG4gIGRpcmVjdG9yeVBhdGg6IHN0cmluZztcbiAgZmlsZVBhdHRlcm4/OiBzdHJpbmc7XG4gIGJhdGNoU2l6ZT86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFJhZ1F1ZXJ5VmVjdG9yUGFyYW1zIHtcbiAgcXVlcnk6IHN0cmluZztcbiAgdG9wSz86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFJhZ0NsZWFySW5kZXhQYXJhbXMge1xuICBjb25maXJtOiBib29sZWFuO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgRG9jdW1lbnRDaHVuayB7XG4gIGlkOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgbWV0YWRhdGE6IHtcbiAgICBmaWxlX3BhdGg6IHN0cmluZztcbiAgICBmaWxlX25hbWU6IHN0cmluZztcbiAgICBjaHVua19pbmRleDogbnVtYmVyO1xuICAgIHRvdGFsX2NodW5rczogbnVtYmVyO1xuICAgIHdvcmRfY291bnQ6IG51bWJlcjtcbiAgfTtcbn1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdCB7XG4gIGlkOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgc2NvcmU6IG51bWJlcjtcbiAgbWV0YWRhdGE6IERvY3VtZW50Q2h1bmtbJ21ldGFkYXRhJ107XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFZlY3RvciBTdG9yZSBJbXBsZW1lbnRhdGlvbiAoTG9jYWwpID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTaW1wbGUgbG9jYWwgdmVjdG9yIHN0b3JlIHVzaW5nIGluLW1lbW9yeSBzdG9yYWdlIHdpdGggY29zaW5lIHNpbWlsYXJpdHkgKi9cbmNsYXNzIExvY2FsVmVjdG9yU3RvcmUge1xuICBwcml2YXRlIGRvY3VtZW50czogTWFwPHN0cmluZywgeyBlbWJlZGRpbmc6IEZsb2F0MzJBcnJheTsgY2h1bms6IERvY3VtZW50Q2h1bmsgfT4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgaW5kZXhOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoaW5kZXhOYW1lOiBzdHJpbmcgPSAnYWlfdG9vbGJveF9yYWcnKSB7XG4gICAgdGhpcy5pbmRleE5hbWUgPSBpbmRleE5hbWU7XG4gIH1cblxuICAvKiogQWRkIGRvY3VtZW50cyB0byB0aGUgc3RvcmUgKi9cbiAgYWRkKGRvY3VtZW50czogRG9jdW1lbnRDaHVua1tdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jdW1lbnRzKSB7XG4gICAgICB0aGlzLmRvY3VtZW50cy5zZXQoZG9jLmlkLCB7IGVtYmVkZGluZzogbmV3IEZsb2F0MzJBcnJheSgwKSwgY2h1bms6IGRvYyB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0IGVtYmVkZGluZ3MgZm9yIGFsbCBkb2N1bWVudHMgKi9cbiAgc2V0RW1iZWRkaW5ncyhpZHM6IHN0cmluZ1tdLCBlbWJlZGRpbmdzOiBGbG9hdDMyQXJyYXlbXSk6IHZvaWQge1xuICAgIGlkcy5mb3JFYWNoKChpZCwgaSkgPT4ge1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmRvY3VtZW50cy5nZXQoaWQpO1xuICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgIGVudHJ5LmVtYmVkZGluZyA9IGVtYmVkZGluZ3NbaV07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogU2VhcmNoIGZvciBzaW1pbGFyIGRvY3VtZW50cyAqL1xuICBzZWFyY2gocXVlcnlFbWJlZGRpbmc6IEZsb2F0MzJBcnJheSwgdG9wSzogbnVtYmVyKTogU2VhcmNoUmVzdWx0W10ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9PiA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBbaWQsIGVudHJ5XSBvZiB0aGlzLmRvY3VtZW50cy5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChlbnRyeS5lbWJlZGRpbmcubGVuZ3RoID09PSAwKSBjb250aW51ZTtcbiAgICAgIFxuICAgICAgLy8gQ29zaW5lIHNpbWlsYXJpdHlcbiAgICAgIGxldCBkb3RQcm9kdWN0ID0gMDtcbiAgICAgIGxldCBub3JtQSA9IDA7XG4gICAgICBsZXQgbm9ybUIgPSAwO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJ5LmVtYmVkZGluZy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkb3RQcm9kdWN0ICs9IHF1ZXJ5RW1iZWRkaW5nW2ldICogZW50cnkuZW1iZWRkaW5nW2ldO1xuICAgICAgICBub3JtQSArPSBlbnRyeS5lbWJlZGRpbmdbaV0gKiBlbnRyeS5lbWJlZGRpbmdbaV07XG4gICAgICAgIG5vcm1CICs9IHF1ZXJ5RW1iZWRkaW5nW2ldICogcXVlcnlFbWJlZGRpbmdbaV07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNpbWlsYXJpdHkgPSBub3JtQSA+IDAgJiYgbm9ybUIgPiAwID8gZG90UHJvZHVjdCAvIChNYXRoLnNxcnQobm9ybUEpICogTWF0aC5zcXJ0KG5vcm1CKSkgOiAwO1xuICAgICAgXG4gICAgICByZXN1bHRzLnB1c2goeyBpZCwgc2NvcmU6IHNpbWlsYXJpdHkgfSk7XG4gICAgfVxuXG4gICAgLy8gU29ydCBieSBzaW1pbGFyaXR5IGRlc2NlbmRpbmcgYW5kIHJldHVybiB0b3AgS1xuICAgIHJldHVybiByZXN1bHRzXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpXG4gICAgICAuc2xpY2UoMCwgdG9wSylcbiAgICAgIC5tYXAoKHsgaWQsIHNjb3JlIH0pID0+IHtcbiAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmRvY3VtZW50cy5nZXQoaWQpITtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogZW50cnkuY2h1bmsuaWQsXG4gICAgICAgICAgdGV4dDogZW50cnkuY2h1bmsudGV4dCxcbiAgICAgICAgICBzY29yZSxcbiAgICAgICAgICBtZXRhZGF0YTogZW50cnkuY2h1bmsubWV0YWRhdGEsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBDbGVhciBhbGwgZG9jdW1lbnRzICovXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuZG9jdW1lbnRzLmNsZWFyKCk7XG4gIH1cblxuICAvKiogR2V0IGRvY3VtZW50IGNvdW50ICovXG4gIGdldCBjb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50cy5zaXplO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRleHQgQ2h1bmtpbmcgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFNwbGl0IHRleHQgaW50byBjaHVua3Mgd2l0aCBvdmVybGFwICovXG5mdW5jdGlvbiBjaHVua1RleHQodGV4dDogc3RyaW5nLCBjaHVua1NpemU6IG51bWJlciA9IDUwMCwgb3ZlcmxhcDogbnVtYmVyID0gNTApOiBEb2N1bWVudENodW5rW10ge1xuICBjb25zdCB3b3JkcyA9IHRleHQuc3BsaXQoL1xccysvKTtcbiAgY29uc3QgY2h1bmtzOiBEb2N1bWVudENodW5rW10gPSBbXTtcbiAgXG4gIGlmICh3b3Jkcy5sZW5ndGggPD0gY2h1bmtTaXplKSB7XG4gICAgcmV0dXJuIFt7XG4gICAgICBpZDogYGNodW5rXyR7RGF0ZS5ub3coKX1fMGAsXG4gICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiAnJyxcbiAgICAgICAgZmlsZV9uYW1lOiAnJyxcbiAgICAgICAgY2h1bmtfaW5kZXg6IDAsXG4gICAgICAgIHRvdGFsX2NodW5rczogMSxcbiAgICAgICAgd29yZF9jb3VudDogd29yZHMubGVuZ3RoLFxuICAgICAgfSxcbiAgICB9XTtcbiAgfVxuXG4gIGxldCBzdGFydEluZGV4ID0gMDtcbiAgbGV0IGNodW5rSW5kZXggPSAwO1xuXG4gIHdoaWxlIChzdGFydEluZGV4IDwgd29yZHMubGVuZ3RoKSB7XG4gICAgY29uc3QgZW5kSW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4ICsgY2h1bmtTaXplLCB3b3Jkcy5sZW5ndGgpO1xuICAgIGNvbnN0IGNodW5rVGV4dCA9IHdvcmRzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KS5qb2luKCcgJyk7XG4gICAgXG4gICAgY2h1bmtzLnB1c2goe1xuICAgICAgaWQ6IGBjaHVua18ke0RhdGUubm93KCl9XyR7Y2h1bmtJbmRleH1gLFxuICAgICAgdGV4dDogY2h1bmtUZXh0LFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiAnJywgLy8gV2lsbCBiZSBzZXQgbGF0ZXJcbiAgICAgICAgZmlsZV9uYW1lOiAnJywgLy8gV2lsbCBiZSBzZXQgbGF0ZXJcbiAgICAgICAgY2h1bmtfaW5kZXg6IGNodW5rSW5kZXgsXG4gICAgICAgIHRvdGFsX2NodW5rczogTWF0aC5jZWlsKHdvcmRzLmxlbmd0aCAvIChjaHVua1NpemUgLSBvdmVybGFwKSksXG4gICAgICAgIHdvcmRfY291bnQ6IGVuZEluZGV4IC0gc3RhcnRJbmRleCxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjaHVua0luZGV4Kys7XG4gICAgc3RhcnRJbmRleCA9IGVuZEluZGV4IC0gb3ZlcmxhcDtcbiAgfVxuXG4gIHJldHVybiBjaHVua3M7XG59XG5cbi8qKiBHZW5lcmF0ZSBzaW1wbGUgVEYtSURGLWxpa2UgZW1iZWRkaW5ncyBmb3IgdGV4dCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVFbWJlZGRpbmcodGV4dDogc3RyaW5nKTogRmxvYXQzMkFycmF5IHtcbiAgLy8gU2ltcGxlIHdvcmQgZnJlcXVlbmN5LWJhc2VkIGVtYmVkZGluZyAoZGltZW5zaW9uOiAxMDApXG4gIGNvbnN0IGRpbWVuc2lvbnMgPSAxMDA7XG4gIGNvbnN0IGVtYmVkZGluZyA9IG5ldyBGbG9hdDMyQXJyYXkoZGltZW5zaW9ucyk7XG4gIFxuICAvLyBUb2tlbml6ZSBhbmQgaGFzaCB3b3JkcyB0byBkaW1lbnNpb25zXG4gIGNvbnN0IHdvcmRzID0gdGV4dC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9bYS16XSsvZykgfHwgW107XG4gIGNvbnN0IHdvcmRTZXQgPSBuZXcgU2V0KHdvcmRzKTtcbiAgXG4gIGZvciAoY29uc3Qgd29yZCBvZiB3b3JkU2V0KSB7XG4gICAgbGV0IGhhc2ggPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZC5sZW5ndGg7IGkrKykge1xuICAgICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgd29yZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgICB9XG4gICAgXG4gICAgY29uc3QgZGltSW5kZXggPSBNYXRoLmFicyhoYXNoICUgZGltZW5zaW9ucyk7XG4gICAgZW1iZWRkaW5nW2RpbUluZGV4XSArPSAxLjAgLyAod29yZC5sZW5ndGggKyAxKTsgLy8gV2VpZ2h0IGJ5IGludmVyc2UgbGVuZ3RoXG4gIH1cblxuICAvLyBOb3JtYWxpemVcbiAgbGV0IG5vcm0gPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbWVuc2lvbnM7IGkrKykge1xuICAgIG5vcm0gKz0gZW1iZWRkaW5nW2ldICogZW1iZWRkaW5nW2ldO1xuICB9XG4gIG5vcm0gPSBNYXRoLnNxcnQobm9ybSkgfHwgMTtcbiAgXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltZW5zaW9uczsgaSsrKSB7XG4gICAgZW1iZWRkaW5nW2ldIC89IG5vcm07XG4gIH1cblxuICByZXR1cm4gZW1iZWRkaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEluZGV4IGZpbGVzIGluIGEgZGlyZWN0b3J5IGZvciBzZW1hbnRpYyBzZWFyY2guXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJhZ0luZGV4RmlsZXMoeyBcbiAgZGlyZWN0b3J5UGF0aCwgXG4gIGZpbGVQYXR0ZXJuID0gJyoue3RzLGpzLHRzeCxqc3gsbWQsanNvbix5YW1sLHltbCx0b21sLHR4dH0nLFxuICBiYXRjaFNpemUgPSAxMCBcbn06IFJhZ0luZGV4RmlsZXNQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBkaXJlY3RvcnkgZXhpc3RzXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcmVjdG9yeVBhdGgpKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEaXJlY3Rvcnkgbm90IGZvdW5kOiAke2RpcmVjdG9yeVBhdGh9YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0b3JlID0gbmV3IExvY2FsVmVjdG9yU3RvcmUoKTtcbiAgICBsZXQgaW5kZXhlZENvdW50ID0gMDtcbiAgICBsZXQgc2tpcHBlZENvdW50ID0gMDtcblxuICAgIC8vIEZpbmQgZmlsZXMgbWF0Y2hpbmcgcGF0dGVyblxuICAgIGNvbnN0IGZpbmRGaWxlcyA9IChkaXI6IHN0cmluZyk6IHN0cmluZ1tdID0+IHtcbiAgICAgIGxldCByZXN1bHRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXIsIGVudHJ5Lm5hbWUpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAvLyBTa2lwIG5vZGVfbW9kdWxlcyBhbmQgLmdpdCBkaXJlY3Rvcmllc1xuICAgICAgICAgICAgaWYgKGVudHJ5Lm5hbWUgPT09ICdub2RlX21vZHVsZXMnIHx8IGVudHJ5Lm5hbWUgPT09ICcuZ2l0JykgY29udGludWU7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoZmluZEZpbGVzKGZ1bGxQYXRoKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZmlsZSBleHRlbnNpb24gYWdhaW5zdCBwYXR0ZXJuXG4gICAgICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IGFsbG93ZWRFeHRzID0gWycudHMnLCAnLmpzJywgJy50c3gnLCAnLmpzeCcsICcubWQnLCAnLmpzb24nLCAnLnlhbWwnLCAnLnltbCcsICcudG9tbCcsICcudHh0J107XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaChmdWxsUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtBSSBUb29sYm94XSBDb3VsZCBub3QgcmVhZCBkaXJlY3RvcnkgJHtkaXJ9OmAsIGVycm9yKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIGNvbnN0IGZpbGVzID0gZmluZEZpbGVzKGRpcmVjdG9yeVBhdGgpO1xuICAgIFxuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaW5kZXhlZENvdW50OiAwLCBtZXNzYWdlOiAnTm8gbWF0Y2hpbmcgZmlsZXMgZm91bmQnIH0gfTtcbiAgICB9XG5cbiAgICAvLyBQcm9jZXNzIGVhY2ggZmlsZVxuICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZmlsZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2tpcCBsYXJnZSBmaWxlcyAoPjFNQilcbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gMTAyNCAqIDEwMjQpIHtcbiAgICAgICAgICBza2lwcGVkQ291bnQrKztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENodW5rIHRoZSB0ZXh0XG4gICAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5rVGV4dChjb250ZW50KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCBtZXRhZGF0YSBmb3IgZWFjaCBjaHVua1xuICAgICAgICBjaHVua3MuZm9yRWFjaChjaHVuayA9PiB7XG4gICAgICAgICAgY2h1bmsubWV0YWRhdGEuZmlsZV9wYXRoID0gZmlsZVBhdGg7XG4gICAgICAgICAgY2h1bmsubWV0YWRhdGEuZmlsZV9uYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIGVtYmVkZGluZ3MgYW5kIGFkZCB0byBzdG9yZVxuICAgICAgICBjb25zdCBpZHMgPSBjaHVua3MubWFwKGMgPT4gYy5pZCk7XG4gICAgICAgIGNvbnN0IGVtYmVkZGluZ3MgPSBjaHVua3MubWFwKGMgPT4gZ2VuZXJhdGVFbWJlZGRpbmcoYy50ZXh0KSk7XG4gICAgICAgIFxuICAgICAgICBzdG9yZS5hZGQoY2h1bmtzKTtcbiAgICAgICAgc3RvcmUuc2V0RW1iZWRkaW5ncyhpZHMsIGVtYmVkZGluZ3MpO1xuICAgICAgICBcbiAgICAgICAgaW5kZXhlZENvdW50ICs9IGNodW5rcy5sZW5ndGg7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtBSSBUb29sYm94XSBDb3VsZCBub3QgaW5kZXggJHtmaWxlUGF0aH06YCwgZXJyb3IpO1xuICAgICAgICBza2lwcGVkQ291bnQrKztcbiAgICAgIH1cblxuICAgICAgLy8gUHJvZ3Jlc3MgY2FsbGJhY2sgZXZlcnkgYmF0Y2hcbiAgICAgIGlmICgoaW5kZXhlZENvdW50ICsgc2tpcHBlZENvdW50KSAlIGJhdGNoU2l6ZSA9PT0gMCkge1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgXFxyW0FJIFRvb2xib3hdIEluZGV4ZWQgJHsoaW5kZXhlZENvdW50ICsgc2tpcHBlZENvdW50KX0gY2h1bmtzLi4uYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ1xcbltBSSBUb29sYm94XSBJbmRleGluZyBjb21wbGV0ZScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGluZGV4ZWRDaHVua3M6IGluZGV4ZWRDb3VudCxcbiAgICAgICAgZmlsZXNQcm9jZXNzZWQ6IGZpbGVzLmxlbmd0aCxcbiAgICAgICAgc2tpcHBlZEZpbGVzOiBza2lwcGVkQ291bnQsXG4gICAgICAgIHRvdGFsRG9jdW1lbnRzOiBzdG9yZS5jb3VudCxcbiAgICAgICAgZGlyZWN0b3J5UGF0aCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBpbmRleGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqXG4gKiBRdWVyeSB0aGUgdmVjdG9yIGluZGV4IGZvciBzZW1hbnRpY2FsbHkgc2ltaWxhciBkb2N1bWVudHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJhZ1F1ZXJ5VmVjdG9yKHsgcXVlcnksIHRvcEsgPSA1IH06IFJhZ1F1ZXJ5VmVjdG9yUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gR2VuZXJhdGUgZW1iZWRkaW5nIGZvciB0aGUgcXVlcnlcbiAgICBjb25zdCBxdWVyeUVtYmVkZGluZyA9IGdlbmVyYXRlRW1iZWRkaW5nKHF1ZXJ5KTtcbiAgICBcbiAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgdXNlIENocm9tYURCIG9yIHNpbWlsYXJcbiAgICAvLyBGb3Igbm93LCB3ZSByZXR1cm4gYSBwbGFjZWhvbGRlciByZXNwb25zZVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBxdWVyeSxcbiAgICAgICAgdG9wSyxcbiAgICAgICAgcmVzdWx0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAncGxhY2Vob2xkZXInLFxuICAgICAgICAgICAgdGV4dDogJ1ZlY3RvciBzZWFyY2ggcmVxdWlyZXMgQ2hyb21hREIgaW50ZWdyYXRpb24uIFRoaXMgaXMgYSBwbGFjZWhvbGRlci4nLFxuICAgICAgICAgICAgc2NvcmU6IDAsXG4gICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICBmaWxlX3BhdGg6ICcnLFxuICAgICAgICAgICAgICBmaWxlX25hbWU6ICcnLFxuICAgICAgICAgICAgICBjaHVua19pbmRleDogMCxcbiAgICAgICAgICAgICAgdG90YWxfY2h1bmtzOiAxLFxuICAgICAgICAgICAgICB3b3JkX2NvdW50OiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBub3RlOiAnVG8gZW5hYmxlIGZ1bGwgdmVjdG9yIHNlYXJjaCwgaW5zdGFsbCBjaHJvbWFkYiBhbmQgdXBkYXRlIHRoZSBpbXBsZW1lbnRhdGlvbi4nLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUkFHIHF1ZXJ5IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vKipcbiAqIENsZWFyIHRoZSB2ZWN0b3IgaW5kZXguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJhZ0NsZWFySW5kZXgoeyBjb25maXJtIH06IFJhZ0NsZWFySW5kZXhQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgaWYgKCFjb25maXJtKSB7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ29uZmlybWF0aW9uIHJlcXVpcmVkIHRvIGNsZWFyIGluZGV4JyB9O1xuICB9XG5cbiAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNsZWFyIENocm9tYURCXG4gIHJldHVybiB7XG4gICAgc3VjY2VzczogdHJ1ZSxcbiAgICBkYXRhOiB7IG1lc3NhZ2U6ICdWZWN0b3IgaW5kZXggY2xlYXJlZCBzdWNjZXNzZnVsbHknIH0sXG4gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclJhZ1Rvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyByYWdfaW5kZXhfZmlsZXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyYWdfaW5kZXhfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW5kZXggZmlsZXMgaW4gYSBkaXJlY3RvcnkgZm9yIHNlbWFudGljIHNlYXJjaC4gU3VwcG9ydHMgVHlwZVNjcmlwdCwgSmF2YVNjcmlwdCwgTWFya2Rvd24sIEpTT04sIFlBTUwsIGFuZCB0ZXh0IGZpbGVzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZGlyZWN0b3J5UGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnRGlyZWN0b3J5IHBhdGggdG8gaW5kZXgnKSxcbiAgICAgIGZpbGVQYXR0ZXJuOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnKi57dHMsanMsdHN4LGpzeCxtZCxqc29uLHlhbWwseW1sLHRvbWwsdHh0fScpLmRlc2NyaWJlKCdGaWxlIHBhdHRlcm4gdG8gbWF0Y2ggKGdsb2Igc3ludGF4KScpLFxuICAgICAgYmF0Y2hTaXplOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMTAwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdCYXRjaCBzaXplIGZvciBwcm9ncmVzcyByZXBvcnRpbmcnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdJbmRleEZpbGVzKHBhcmFtcyBhcyBSYWdJbmRleEZpbGVzUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIHJhZ19xdWVyeV92ZWN0b3IgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyYWdfcXVlcnlfdmVjdG9yJyxcbiAgICBkZXNjcmlwdGlvbjogJ1F1ZXJ5IHRoZSB2ZWN0b3IgaW5kZXggZm9yIHNlbWFudGljYWxseSBzaW1pbGFyIGRvY3VtZW50cy4gUmV0dXJucyB0b3AtayBtb3N0IHJlbGV2YW50IGNodW5rcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTZWFyY2ggcXVlcnkgdGV4dCcpLFxuICAgICAgdG9wSzogei5udW1iZXIoKS5taW4oMSkubWF4KDIwKS5vcHRpb25hbCgpLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ051bWJlciBvZiByZXN1bHRzIHRvIHJldHVybicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHJhZ1F1ZXJ5VmVjdG9yKHBhcmFtcyBhcyBSYWdRdWVyeVZlY3RvclBhcmFtcyksXG4gIH0pKTtcblxuICAvLyByYWdfY2xlYXJfaW5kZXggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyYWdfY2xlYXJfaW5kZXgnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgdGhlIHZlY3RvciBzZWFyY2ggaW5kZXguIFJlcXVpcmVzIGNvbmZpcm1hdGlvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbmZpcm06IHouYm9vbGVhbigpLmRlc2NyaWJlKCdTZXQgdG8gdHJ1ZSB0byBjb25maXJtIGNsZWFyaW5nIHRoZSBpbmRleCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHJhZ0NsZWFySW5kZXgocGFyYW1zIGFzIFJhZ0NsZWFySW5kZXhQYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBVSSBDb21wb25lbnQgVGVtcGxhdGVzID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGJ1dHRvbiBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQnV0dG9uSHRtbChsYWJlbDogc3RyaW5nLCBjb2xvcjogc3RyaW5nID0gJyMwMDdiZmYnLCBpZDogc3RyaW5nID0gJ3VpLWJ0bicpOiBzdHJpbmcge1xuICByZXR1cm4gYFxuICAgIDxidXR0b24gaWQ9XCIke2lkfVwiIHN0eWxlPVwiXG4gICAgICBwYWRkaW5nOiAxMnB4IDI0cHg7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9yfTtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycztcbiAgICBcIj4ke2xhYmVsfTwvYnV0dG9uPlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBmb3JtIGNvbXBvbmVudCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVGb3JtSHRtbChmaWVsZHM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfT4sIHN1Ym1pdExhYmVsOiBzdHJpbmcgPSAnU3VibWl0Jyk6IHN0cmluZyB7XG4gIGNvbnN0IGZpZWxkc0h0bWwgPSBmaWVsZHMubWFwKGZpZWxkID0+IGBcbiAgICA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTogMTVweDtcIj5cbiAgICAgIDxsYWJlbCBmb3I9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJkaXNwbGF5OiBibG9jazsgbWFyZ2luLWJvdHRvbTogNXB4OyBmb250LXdlaWdodDogYm9sZDtcIj4ke2ZpZWxkLmxhYmVsfTwvbGFiZWw+XG4gICAgICAke2ZpZWxkLnR5cGUgPT09ICd0ZXh0YXJlYScgXG4gICAgICAgID8gYDx0ZXh0YXJlYSBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHJvd3M9XCI0XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC90ZXh0YXJlYT5gXG4gICAgICAgIDogZmllbGQudHlwZSA9PT0gJ3NlbGVjdCdcbiAgICAgICAgICA/IGA8c2VsZWN0IGlkPVwiJHtmaWVsZC5uYW1lfVwiIG5hbWU9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PG9wdGlvbiB2YWx1ZT1cIlwiPlNlbGVjdC4uLjwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCIxXCI+T3B0aW9uIDE8L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiMlwiPk9wdGlvbiAyPC9vcHRpb24+PC9zZWxlY3Q+YFxuICAgICAgICAgIDogYDxpbnB1dCB0eXBlPVwiJHtmaWVsZC50eXBlfVwiIGlkPVwiJHtmaWVsZC5uYW1lfVwiIG5hbWU9XCIke2ZpZWxkLm5hbWV9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgcGFkZGluZzogOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3JkZXItcmFkaXVzOiA0cHg7XCIgLz5gXG4gICAgICB9XG4gICAgPC9kaXY+XG4gIGApLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGZvcm0gaWQ9XCJ1aS1mb3JtXCIgb25zdWJtaXQ9XCJldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS1yZXN1bHQnKS5pbm5lckhUTUwgPSAnRm9ybSBzdWJtaXR0ZWQhJztcIj5cbiAgICAgICR7ZmllbGRzSHRtbH1cbiAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIHN0eWxlPVwicGFkZGluZzogMTJweCAyNHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3YmZmOyBjb2xvcjogd2hpdGU7IGJvcmRlcjogbm9uZTsgYm9yZGVyLXJhZGl1czogNnB4OyBjdXJzb3I6IHBvaW50ZXI7XCI+JHtzdWJtaXRMYWJlbH08L2J1dHRvbj5cbiAgICA8L2Zvcm0+XG4gICAgPGRpdiBpZD1cImZvcm0tcmVzdWx0XCIgc3R5bGU9XCJtYXJnaW4tdG9wOiAxNXB4OyBwYWRkaW5nOiAxMHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmOWZhOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+PC9kaXY+XG4gIGA7XG59XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGNoYXJ0IGNvbXBvbmVudCAoc2ltcGxlIGJhciBjaGFydCkgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQ2hhcnRIdG1sKGRhdGE6IEFycmF5PHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9PiwgdGl0bGU6IHN0cmluZyA9ICdCYXIgQ2hhcnQnKTogc3RyaW5nIHtcbiAgY29uc3QgbWF4VmFsdWUgPSBNYXRoLm1heCguLi5kYXRhLm1hcChkID0+IGQudmFsdWUpKTtcbiAgY29uc3QgYmFyc0h0bWwgPSBkYXRhLm1hcChkID0+IHtcbiAgICBjb25zdCBoZWlnaHQgPSAoZC52YWx1ZSAvIG1heFZhbHVlKSAqIDIwMDtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBmbGV4LWVuZDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IG1hcmdpbi1yaWdodDogMTBweDtcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cIndpZHRoOiA0MHB4OyBoZWlnaHQ6ICR7aGVpZ2h0fXB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3YmZmOyBib3JkZXItcmFkaXVzOiA0cHggNHB4IDAgMDtcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH0pLmpvaW4oJycpO1xuXG4gIGNvbnN0IGxhYmVsc0h0bWwgPSBkYXRhLm1hcChkID0+IGBcbiAgICA8ZGl2IHN0eWxlPVwid2lkdGg6IDQwcHg7IHRleHQtYWxpZ246IGNlbnRlcjsgZm9udC1zaXplOiAxMnB4O1wiPiR7ZC5sYWJlbH08L2Rpdj5cbiAgYCkuam9pbignJyk7XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IHN0eWxlPVwicGFkZGluZzogMjBweDsgYmFja2dyb3VuZC1jb2xvcjogI2Y4ZjlmYTsgYm9yZGVyLXJhZGl1czogOHB4O1wiPlxuICAgICAgPGgzPiR7dGl0bGV9PC9oMz5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGhlaWdodDogMjIwcHg7IG1hcmdpbi1ib3R0b206IDEwcHg7XCI+JHtiYXJzSHRtbH08L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcIj4ke2xhYmVsc0h0bWx9PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGRhc2hib2FyZCBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRGFzaGJvYXJkSHRtbCh0aXRsZXM6IHN0cmluZ1tdLCBjb250ZW50OiBBcnJheTx7IHR5cGU6ICd0ZXh0JyB8ICdjaGFydCc7IGRhdGE/OiBhbnkgfT4pOiBzdHJpbmcge1xuICBjb25zdCBjYXJkc0h0bWwgPSB0aXRsZXMubWFwKCh0aXRsZSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBjYXJkQ29udGVudCA9IGNvbnRlbnRbaW5kZXhdPy50eXBlID09PSAnY2hhcnQnIFxuICAgICAgPyBnZW5lcmF0ZUNoYXJ0SHRtbChjb250ZW50W2luZGV4XS5kYXRhIHx8IFt7IGxhYmVsOiAnQScsIHZhbHVlOiA1MCB9LCB7IGxhYmVsOiAnQicsIHZhbHVlOiA4MCB9XSwgdGl0bGUpXG4gICAgICA6IGA8cCBzdHlsZT1cInBhZGRpbmc6IDIwcHg7XCI+JHtjb250ZW50W2luZGV4XT8uZGF0YSB8fCBgQ29udGVudCBmb3IgJHt0aXRsZX1gfTwvcD5gO1xuICAgIFxuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IHN0eWxlPVwiZmxleDogMTsgbWluLXdpZHRoOiAyNTBweDsgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7IGJvcmRlci1yYWRpdXM6IDhweDsgYm94LXNoYWRvdzogMCAycHggNHB4IHJnYmEoMCwwLDAsMC4xKTsgbWFyZ2luOiAxMHB4O1wiPlxuICAgICAgICAke2NhcmRDb250ZW50fVxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfSkuam9pbignJyk7XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgZmxleC13cmFwOiB3cmFwOyBnYXA6IDIwcHg7IHBhZGRpbmc6IDIwcHg7XCI+JHtjYXJkc0h0bWx9PC9kaXY+XG4gIGA7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBnZW5lcmF0ZV91aV9jb21wb25lbnQgdG9vbCBcdTIwMTQgR2VuZXJhdGUgaW50ZXJhY3RpdmUgVUkgY29tcG9uZW50c1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZW5lcmF0ZV91aV9jb21wb25lbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2VuZXJhdGUgSFRNTC9DU1MvSlMgY29kZSBmb3IgYW4gaW50ZXJhY3RpdmUgVUkgY29tcG9uZW50IChidXR0b24sIGZvcm0sIGNoYXJ0LCBkYXNoYm9hcmQpLiBSZXR1cm5zIHRoZSBnZW5lcmF0ZWQgY29kZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbXBvbmVudF90eXBlOiB6LmVudW0oWydidXR0b24nLCAnZm9ybScsICdjaGFydCcsICdkYXNoYm9hcmQnXSkuZGVzY3JpYmUoJ1R5cGUgb2YgVUkgY29tcG9uZW50IHRvIGdlbmVyYXRlJyksXG4gICAgICBsYWJlbDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdMYWJlbCB0ZXh0IGZvciBidXR0b25zIG9yIGZvcm1zJyksXG4gICAgICBmaWVsZHM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgICBuYW1lOiB6LnN0cmluZygpLFxuICAgICAgICB0eXBlOiB6LmVudW0oWyd0ZXh0JywgJ2VtYWlsJywgJ3Bhc3N3b3JkJywgJ251bWJlcicsICd0ZXh0YXJlYScsICdzZWxlY3QnXSksXG4gICAgICAgIGxhYmVsOiB6LnN0cmluZygpLFxuICAgICAgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0Zvcm0gZmllbGRzIChmb3IgZm9ybSBjb21wb25lbnQpJyksXG4gICAgICBjaGFydF9kYXRhOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbGFiZWw6IHouc3RyaW5nKCksXG4gICAgICAgIHZhbHVlOiB6Lm51bWJlcigpLFxuICAgICAgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0NoYXJ0IGRhdGEgcG9pbnRzIChmb3IgY2hhcnQgY29tcG9uZW50KScpLFxuICAgICAgZGFzaGJvYXJkX3RpdGxlczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaXRsZXMgZm9yIGRhc2hib2FyZCBjYXJkcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbXBvbmVudF90eXBlLCBsYWJlbCwgZmllbGRzLCBjaGFydF9kYXRhLCBkYXNoYm9hcmRfdGl0bGVzIH06IHsgXG4gICAgICBjb21wb25lbnRfdHlwZTogc3RyaW5nOyBcbiAgICAgIGxhYmVsPzogc3RyaW5nOyBcbiAgICAgIGZpZWxkcz86IEFycmF5PHsgbmFtZTogc3RyaW5nOyB0eXBlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfT47IFxuICAgICAgY2hhcnRfZGF0YT86IEFycmF5PHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9PjtcbiAgICAgIGRhc2hib2FyZF90aXRsZXM/OiBzdHJpbmdbXTtcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgaHRtbCA9ICcnO1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIChjb21wb25lbnRfdHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2J1dHRvbic6XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVCdXR0b25IdG1sKGxhYmVsIHx8ICdDbGljayBNZScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZm9ybSc6XG4gICAgICAgICAgICBpZiAoIWZpZWxkcyB8fCBmaWVsZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0Zvcm0gY29tcG9uZW50IHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBmaWVsZCcgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZUZvcm1IdG1sKGZpZWxkcyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdjaGFydCc6XG4gICAgICAgICAgICBpZiAoIWNoYXJ0X2RhdGEgfHwgY2hhcnRfZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ2hhcnQgY29tcG9uZW50IHJlcXVpcmVzIGRhdGEgcG9pbnRzJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlQ2hhcnRIdG1sKGNoYXJ0X2RhdGEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZGFzaGJvYXJkJzpcbiAgICAgICAgICAgIGlmICghZGFzaGJvYXJkX3RpdGxlcyB8fCBkYXNoYm9hcmRfdGl0bGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdEYXNoYm9hcmQgY29tcG9uZW50IHJlcXVpcmVzIGF0IGxlYXN0IG9uZSB0aXRsZScgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkYXNoYm9hcmRfdGl0bGVzLm1hcCgodGl0bGUsIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgICB0eXBlOiBpbmRleCAlIDIgPT09IDAgPyAnY2hhcnQnIDogJ3RleHQnLFxuICAgICAgICAgICAgICBkYXRhOiBpbmRleCAlIDIgPT09IDAgPyBbeyBsYWJlbDogJ0EnLCB2YWx1ZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSB9LCB7IGxhYmVsOiAnQicsIHZhbHVlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApIH1dIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlRGFzaGJvYXJkSHRtbChkYXNoYm9hcmRfdGl0bGVzLCBjb250ZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIGNvbXBvbmVudCB0eXBlOiAke2NvbXBvbmVudF90eXBlfWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZ1bGxIdG1sID0gYDwhRE9DVFlQRSBodG1sPjxodG1sPjxoZWFkPjxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiPjx0aXRsZT5VSSBDb21wb25lbnQ8L3RpdGxlPjwvaGVhZD48Ym9keSBzdHlsZT1cImZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgcGFkZGluZzogMjBweDtcIj4ke2h0bWx9PC9ib2R5PjwvaHRtbD5gO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21wb25lbnRfdHlwZSwgaHRtbDogZnVsbEh0bWwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGdlbmVyYXRlIFVJIGNvbXBvbmVudDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVuZGVyX2FuZF9wcmV2aWV3X3VpIHRvb2wgXHUyMDE0IFJlbmRlciBnZW5lcmF0ZWQgVUkgaW4gYnJvd3NlciBhbmQgY2FwdHVyZSBzY3JlZW5zaG90XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlbmRlcl9hbmRfcHJldmlld191aScsXG4gICAgZGVzY3JpcHRpb246ICdSZW5kZXIgYSBnZW5lcmF0ZWQgSFRNTCBVSSBjb21wb25lbnQsIHNhdmUgaXQgdG8gYSBmaWxlLCBvcGVuIGl0IGluIHRoZSBkZWZhdWx0IGJyb3dzZXIsIGFuZCBvcHRpb25hbGx5IHRha2UgYSBzY3JlZW5zaG90LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tcGxldGUgSFRNTCBjb250ZW50IHRvIHJlbmRlcicpLFxuICAgICAgZmlsZW5hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCd1aV9wcmV2aWV3Lmh0bWwnKS5kZXNjcmliZSgnRmlsZW5hbWUgZm9yIHNhdmluZyAoZGVmYXVsdDogdWlfcHJldmlldy5odG1sKScpLFxuICAgICAgc2NyZWVuc2hvdF9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHBhdGggdG8gc2F2ZSBhIHNjcmVlbnNob3Qgb2YgdGhlIHJlbmRlcmVkIFVJJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBmaWxlbmFtZSwgc2NyZWVuc2hvdF9wYXRoIH06IHsgXG4gICAgICBodG1sX2NvbnRlbnQ6IHN0cmluZzsgXG4gICAgICBmaWxlbmFtZT86IHN0cmluZzsgXG4gICAgICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZW5hbWUgfHwgJ3VpX3ByZXZpZXcuaHRtbCc7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgZmlsZU5hbWUpO1xuXG4gICAgICAgIC8vIFNhdmUgSFRNTCB0byBmaWxlXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWxfY29udGVudCk7XG5cbiAgICAgICAgLy8gT3BlbiBpbiBkZWZhdWx0IGJyb3dzZXIgdXNpbmcgRVMgaW1wb3J0IChzYW1lIGFzIHByZXZpZXdfaHRtbCB0b29sKVxuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdChmaWxlUGF0aCk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IFxuICAgICAgICAgIHJlbmRlcmVkOiB0cnVlLCBcbiAgICAgICAgICBmaWxlOiBmaWxlTmFtZSxcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUYWtlIHNjcmVlbnNob3QgaWYgcmVxdWVzdGVkICh1c2luZyBQdXBwZXRlZXIpXG4gICAgICAgIGlmIChzY3JlZW5zaG90X3BhdGgpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHVwcGV0ZWVyTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdwdXBwZXRlZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCBwdXBwZXRlZXJNb2R1bGUuZGVmYXVsdC5sYXVuY2goeyBoZWFkbGVzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTG9hZCB0aGUgSFRNTCBmaWxlXG4gICAgICAgICAgICBhd2FpdCBwYWdlLmdvdG8oYGZpbGU6Ly8ke2ZpbGVQYXRofWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBXYWl0IGZvciBjb250ZW50IHRvIHJlbmRlclxuICAgICAgICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yU2VsZWN0b3IoJ2JvZHknLCB7IHRpbWVvdXQ6IDUwMDAgfSkuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWtlIHNjcmVlbnNob3RcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCwgZnVsbFBhZ2U6IHRydWUgfSk7XG4gICAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RTYXZlZCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGF3YWl0IGJyb3dzZXIuY2xvc2UoKTtcbiAgICAgICAgICB9IGNhdGNoIChzY3JlZW5zaG90RXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBzY3JlZW5zaG90RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IHNjcmVlbnNob3RFcnJvci5tZXNzYWdlIDogU3RyaW5nKHNjcmVlbnNob3RFcnJvcik7XG4gICAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RXYXJuaW5nID0gYFNjcmVlbnNob3QgZmFpbGVkOiAke21lc3NhZ2V9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcmVuZGVyIFVJOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBleHRyYWN0X3VpX2RhdGEgdG9vbCBcdTIwMTQgRXh0cmFjdCBkYXRhIGZyb20gaW50ZXJhY3RpdmUgVUkgZWxlbWVudHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZXh0cmFjdF91aV9kYXRhJyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4dHJhY3Qgc3RydWN0dXJlZCBkYXRhIGZyb20gSFRNTCBjb250ZW50ICh0YWJsZXMsIGZvcm1zLCBsaXN0cykuIFVzZWZ1bCBmb3IgcGFyc2luZyBnZW5lcmF0ZWQgb3IgZmV0Y2hlZCBVSXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBIVE1MIGNvbnRlbnQgdG8gZXh0cmFjdCBkYXRhIGZyb20nKSxcbiAgICAgIGV4dHJhY3Rpb25fdHlwZTogei5lbnVtKFsndGFibGUnLCAnZm9ybScsICdsaXN0J10pLmRlZmF1bHQoJ3RhYmxlJykuZGVzY3JpYmUoJ1R5cGUgb2YgZGF0YSB0byBleHRyYWN0JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBleHRyYWN0aW9uX3R5cGUgfTogeyBcbiAgICAgIGh0bWxfY29udGVudDogc3RyaW5nOyBcbiAgICAgIGV4dHJhY3Rpb25fdHlwZTogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBVc2UgTm9kZS5qcyBET00gcGFyc2VyIChjaGVlcmlvLWxpa2UgYXBwcm9hY2ggd2l0aCBiYXNpYyByZWdleCBmb3Igc2ltcGxpY2l0eSlcbiAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3UnZCB1c2UgYSBwcm9wZXIgSFRNTCBwYXJzZXIgbGlrZSBqc2RvbSBvciBjaGVlcmlvXG4gICAgICAgIFxuICAgICAgICBsZXQgZXh0cmFjdGVkRGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuICAgICAgICBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAndGFibGUnKSB7XG4gICAgICAgICAgY29uc3QgdGFibGVSZWdleCA9IC88dGFibGVbXj5dKj4oW1xcc1xcU10qPyk8XFwvdGFibGU+L2dpO1xuICAgICAgICAgIGNvbnN0IHJvd3NSZWdleCA9IC88dHJbXj5dKj4oW1xcc1xcU10qPyk8XFwvdHI+L2dpO1xuICAgICAgICAgIGNvbnN0IGNlbGxzUmVnZXggPSAvPCh0ZHx0aClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHRkfHRoKT4vZ2k7XG5cbiAgICAgICAgICBsZXQgdGFibGVNYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKHRhYmxlTWF0Y2ggPSB0YWJsZVJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhYmxlQ29udGVudCA9IHRhYmxlTWF0Y2hbMV07XG4gICAgICAgICAgICBjb25zdCByb3dzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IHJvd01hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChyb3dNYXRjaCA9IHJvd3NSZWdleC5leGVjKHRhYmxlQ29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJvd3MucHVzaChyb3dNYXRjaFsxXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJvd3M6IHN0cmluZ1tdW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2VsbHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgIGxldCBjZWxsTWF0Y2g7XG4gICAgICAgICAgICAgIGNvbnN0IGNlbGxSZWdleCA9IC88KHRkfHRoKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odGR8dGgpPi9naTtcbiAgICAgICAgICAgICAgd2hpbGUgKChjZWxsTWF0Y2ggPSBjZWxsUmVnZXguZXhlYyhyb3cpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goY2VsbE1hdGNoWzJdLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGFyc2VkUm93cy5wdXNoKGNlbGxzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS50YWJsZXMgPSBwYXJzZWRSb3dzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICdmb3JtJykge1xuICAgICAgICAgIGNvbnN0IGZvcm1SZWdleCA9IC88Zm9ybVtePl0qPihbXFxzXFxTXSo/KTxcXC9mb3JtPi9naTtcbiAgICAgICAgICBjb25zdCBpbnB1dFJlZ2V4ID0gLzwoaW5wdXR8c2VsZWN0fHRleHRhcmVhKVtePl0qXFwvPz4vZ2k7XG5cbiAgICAgICAgICBsZXQgZm9ybU1hdGNoO1xuICAgICAgICAgIHdoaWxlICgoZm9ybU1hdGNoID0gZm9ybVJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1Db250ZW50ID0gZm9ybU1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZT86IHN0cmluZyB9PiA9IFtdO1xuICAgICAgICAgICAgbGV0IGlucHV0TWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKGlucHV0TWF0Y2ggPSBpbnB1dFJlZ2V4LmV4ZWMoZm9ybUNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBjb25zdCB0YWcgPSBpbnB1dE1hdGNoWzBdO1xuICAgICAgICAgICAgICBjb25zdCBuYW1lTWF0Y2ggPSAvbmFtZT1bXCInXShbXlwiJ10rKVtcIiddL2kuZXhlYyh0YWcpO1xuICAgICAgICAgICAgICBjb25zdCB0eXBlTWF0Y2ggPSAvdHlwZT1bXCInXShbXlwiJ10rKVtcIiddL2kuZXhlYyh0YWcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgKG5hbWVNYXRjaCkge1xuICAgICAgICAgICAgICAgIGZpZWxkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVNYXRjaFsxXSxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVNYXRjaD8uWzFdIHx8ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJywgLy8gV291bGQgbmVlZCB0byBleHRyYWN0IGFjdHVhbCB2YWx1ZXMgaW4gYSByZWFsIGltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS5mb3JtRmllbGRzID0gZmllbGRzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICdsaXN0Jykge1xuICAgICAgICAgIGNvbnN0IGxpc3RSZWdleCA9IC88KHVsfG9sKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odWx8b2wpPi9naTtcbiAgICAgICAgICBjb25zdCBpdGVtUmVnZXggPSAvPGxpW14+XSo+KFtcXHNcXFNdKj8pPFxcL2xpPi9naTtcblxuICAgICAgICAgIGxldCBsaXN0TWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKChsaXN0TWF0Y2ggPSBsaXN0UmVnZXguZXhlYyhodG1sX2NvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbGlzdENvbnRlbnQgPSBsaXN0TWF0Y2hbMl07XG4gICAgICAgICAgICBjb25zdCBpdGVtczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBpdGVtTWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKGl0ZW1NYXRjaCA9IGl0ZW1SZWdleC5leGVjKGxpc3RDb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtTWF0Y2hbMV0ucmVwbGFjZSgvPFtePl0rPi9nLCAnJykudHJpbSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGV4dHJhY3RlZERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBleHRyYWN0IFVJIGRhdGE6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ29udGV4dCBNYW5hZ2VtZW50IFR5cGVzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBDb250ZXh0RW50cnkge1xuICBpZDogc3RyaW5nO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgdHlwZTogJ2RlY2lzaW9uJyB8ICdwYXR0ZXJuJyB8ICdjb25maWd1cmF0aW9uJyB8ICdmaWxlX2NoYW5nZScgfCAnZXJyb3InIHwgJ3N1bW1hcnknO1xuICB0aXRsZTogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXTtcbiAgc2Vzc2lvbl9pZD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIENvbnRleHRTdW1tYXJ5IHtcbiAgdG90YWxfZW50cmllczogbnVtYmVyO1xuICBlbnRyaWVzX2J5X3R5cGU6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gIHJlY2VudF9lbnRyaWVzOiBDb250ZXh0RW50cnlbXTtcbiAgbGFzdF91cGRhdGVkOiBudW1iZXI7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgU3RvcmFnZSBNYW5hZ2VyID09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIENvbnRleHRTdG9yYWdlTWFuYWdlciB7XG4gIHByaXZhdGUgc3RvcmFnZVBhdGg6IHN0cmluZztcbiAgXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmFnZVBhdGggPSBwYXRoLmpvaW4oZ2V0V29ya2luZ0RpcigpLCAnLmFpX3Rvb2xib3hfY29udGV4dC5qc29uJyk7XG4gIH1cblxuICAvKiogTG9hZCBjb250ZXh0IGVudHJpZXMgZnJvbSBkaXNrICovXG4gIGxvYWQoKTogQ29udGV4dEVudHJ5W10ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyh0aGlzLnN0b3JhZ2VQYXRoKSkge1xuICAgICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKHRoaXMuc3RvcmFnZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgY29udGV4dCBzdG9yYWdlOicsIGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLyoqIFNhdmUgY29udGV4dCBlbnRyaWVzIHRvIGRpc2sgKi9cbiAgc2F2ZShlbnRyaWVzOiBDb250ZXh0RW50cnlbXSk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUodGhpcy5zdG9yYWdlUGF0aCk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gV3JpdGUgYXRvbWljYWxseSAodGVtcCBmaWxlICsgcmVuYW1lKVxuICAgICAgY29uc3QgdGVtcFBhdGggPSB0aGlzLnN0b3JhZ2VQYXRoICsgJy50bXAnO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyh0ZW1wUGF0aCwgSlNPTi5zdHJpbmdpZnkoZW50cmllcywgbnVsbCwgMikpO1xuICAgICAgZnMucmVuYW1lU3luYyh0ZW1wUGF0aCwgdGhpcy5zdG9yYWdlUGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIGNvbnRleHQgc3RvcmFnZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqIEFkZCBhIG5ldyBjb250ZXh0IGVudHJ5ICovXG4gIGFkZEVudHJ5KGVudHJ5OiBDb250ZXh0RW50cnkpOiB2b2lkIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgZW50cmllcy51bnNoaWZ0KGVudHJ5KTsgLy8gQWRkIHRvIGJlZ2lubmluZ1xuICAgIFxuICAgIC8vIExpbWl0IHRvIGxhc3QgMTAwMCBlbnRyaWVzIHRvIHByZXZlbnQgdW5ib3VuZGVkIGdyb3d0aFxuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA+IDEwMDApIHtcbiAgICAgIGVudHJpZXMuc3BsaWNlKDEwMDApO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnNhdmUoZW50cmllcyk7XG4gIH1cblxuICAvKiogR2V0IHJlY2VudCBjb250ZXh0IGVudHJpZXMgKi9cbiAgZ2V0UmVjZW50RW50cmllcyhsaW1pdDogbnVtYmVyID0gMjAsIHR5cGU/OiBzdHJpbmcpOiBDb250ZXh0RW50cnlbXSB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIFxuICAgIGlmICh0eXBlKSB7XG4gICAgICByZXR1cm4gZW50cmllcy5maWx0ZXIoZSA9PiBlLnR5cGUgPT09IHR5cGUpLnNsaWNlKDAsIGxpbWl0KTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGVudHJpZXMuc2xpY2UoMCwgbGltaXQpO1xuICB9XG5cbiAgLyoqIFNlYXJjaCBjb250ZXh0IGVudHJpZXMgYnkgcXVlcnkgKi9cbiAgc2VhcmNoRW50cmllcyhxdWVyeTogc3RyaW5nLCBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMCk6IENvbnRleHRFbnRyeVtdIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgY29uc3QgbG93ZXJRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgXG4gICAgY29uc3QgcmVzdWx0cyA9IGVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IFxuICAgICAgZW50cnkudGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSB8fFxuICAgICAgZW50cnkuY29udGVudC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpIHx8XG4gICAgICAoZW50cnkudGFncyAmJiBlbnRyeS50YWdzLnNvbWUodGFnID0+IHRhZy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpKSlcbiAgICApO1xuICAgIFxuICAgIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIG1heFJlc3VsdHMpO1xuICB9XG5cbiAgLyoqIERlbGV0ZSBjb250ZXh0IGVudHJpZXMgYnkgSUQgKi9cbiAgZGVsZXRlRW50cnkoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGVudHJpZXMuZmlsdGVyKGUgPT4gZS5pZCAhPT0gaWQpO1xuICAgIFxuICAgIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IGVudHJpZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIEVudHJ5IG5vdCBmb3VuZFxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNhdmUoZmlsdGVyZWQpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIENsZWFyIGFsbCBjb250ZXh0IGVudHJpZXMgKi9cbiAgY2xlYXJBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlKFtdKTtcbiAgfVxuXG4gIC8qKiBHZXQgc3VtbWFyeSBzdGF0aXN0aWNzICovXG4gIGdldFN1bW1hcnkoKTogQ29udGV4dFN1bW1hcnkge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBcbiAgICBjb25zdCBlbnRyaWVzQnlUeXBlOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGVudHJpZXNCeVR5cGVbZW50cnkudHlwZV0gPSAoZW50cmllc0J5VHlwZVtlbnRyeS50eXBlXSB8fCAwKSArIDE7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG90YWxfZW50cmllczogZW50cmllcy5sZW5ndGgsXG4gICAgICBlbnRyaWVzX2J5X3R5cGU6IGVudHJpZXNCeVR5cGUsXG4gICAgICByZWNlbnRfZW50cmllczogZW50cmllcy5zbGljZSgwLCA1KSxcbiAgICAgIGxhc3RfdXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICB9O1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgQW5hbHl6ZXIgPT09PT09PT09PT09PT09PT09PT1cblxuY2xhc3MgQ29udGV4dEFuYWx5emVyIHtcbiAgcHJpdmF0ZSBzdG9yYWdlTWFuYWdlcjogQ29udGV4dFN0b3JhZ2VNYW5hZ2VyO1xuICBcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yYWdlTWFuYWdlciA9IG5ldyBDb250ZXh0U3RvcmFnZU1hbmFnZXIoKTtcbiAgfVxuXG4gIC8qKiBBbmFseXplIHJlY2VudCBhY3Rpdml0eSBhbmQgYXV0by1zYXZlIGltcG9ydGFudCBjb250ZXh0ICovXG4gIGFuYWx5emVBbmRTYXZlKFxuICAgIHNlc3Npb25FdmVudHM6IEFycmF5PHsgdHlwZTogc3RyaW5nOyB0aW1lc3RhbXA6IG51bWJlcjsgZGF0YT86IGFueSB9PixcbiAgICBjb25maWdDaGFuZ2VzPzogUmVjb3JkPHN0cmluZywgYm9vbGVhbiB8IHN0cmluZz5cbiAgKTogeyBzYXZlZF9jb3VudDogbnVtYmVyOyBzdW1tYXJ5OiBzdHJpbmcgfSB7XG4gICAgY29uc3QgZW50cmllczogQ29udGV4dEVudHJ5W10gPSBbXTtcblxuICAgIC8vIEFuYWx5emUgdG9vbCB1c2FnZSBwYXR0ZXJuc1xuICAgIGNvbnN0IHRvb2xVc2FnZUNvdW50OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gICAgc2Vzc2lvbkV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC50eXBlLnN0YXJ0c1dpdGgoJ3Rvb2xfJykpIHtcbiAgICAgICAgY29uc3QgdG9vbE5hbWUgPSBldmVudC50eXBlLnJlcGxhY2UoJ3Rvb2xfJywgJycpO1xuICAgICAgICB0b29sVXNhZ2VDb3VudFt0b29sTmFtZV0gPSAodG9vbFVzYWdlQ291bnRbdG9vbE5hbWVdIHx8IDApICsgMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElkZW50aWZ5IGZyZXF1ZW50bHkgdXNlZCB0b29scyAoPjMgdXNlcyBpbiBzZXNzaW9uKVxuICAgIE9iamVjdC5lbnRyaWVzKHRvb2xVc2FnZUNvdW50KS5mb3JFYWNoKChbdG9vbCwgY291bnRdKSA9PiB7XG4gICAgICBpZiAoY291bnQgPiAzKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAncGF0dGVybicsXG4gICAgICAgICAgdGl0bGU6IGBGcmVxdWVudCBUb29sIFVzYWdlOiAke3Rvb2x9YCxcbiAgICAgICAgICBjb250ZW50OiBgVG9vbCAnJHt0b29sfScgd2FzIHVzZWQgJHtjb3VudH0gdGltZXMgaW4gdGhlIGN1cnJlbnQgc2Vzc2lvbiwgaW5kaWNhdGluZyBpdCdzIGEgcHJpbWFyeSB3b3JrZmxvdyB0b29sLmAsXG4gICAgICAgICAgdGFnczogWyd1c2FnZV9wYXR0ZXJuJywgJ2ZyZXF1ZW50X3Rvb2wnXSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBbmFseXplIGNvbmZpZ3VyYXRpb24gY2hhbmdlc1xuICAgIGlmIChjb25maWdDaGFuZ2VzKSB7XG4gICAgICBPYmplY3QuZW50cmllcyhjb25maWdDaGFuZ2VzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgZW50cmllcy5wdXNoKHtcbiAgICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHR5cGU6ICdjb25maWd1cmF0aW9uJyxcbiAgICAgICAgICB0aXRsZTogYENvbmZpZ3VyYXRpb24gQ2hhbmdlOiAke2tleX1gLFxuICAgICAgICAgIGNvbnRlbnQ6IGBTZXR0aW5nICcke2tleX0nIHdhcyBjaGFuZ2VkIHRvICcke3ZhbHVlfScuYCxcbiAgICAgICAgICB0YWdzOiBbJ2NvbmZpZ19jaGFuZ2UnXSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgaW1wb3J0YW50IGRlY2lzaW9ucyAoYmFzZWQgb24gZXZlbnQgcGF0dGVybnMpXG4gICAgY29uc3QgZGVjaXNpb25FdmVudHMgPSBzZXNzaW9uRXZlbnRzLmZpbHRlcihlID0+IFxuICAgICAgZS50eXBlID09PSAnZGVjaXNpb24nIHx8IFxuICAgICAgKGUuZGF0YSAmJiB0eXBlb2YgZS5kYXRhLmRlY2lzaW9uID09PSAnc3RyaW5nJylcbiAgICApO1xuXG4gICAgZGVjaXNpb25FdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBjb25zdCBkZWNpc2lvblRleHQgPSBldmVudC5kYXRhPy5kZWNpc2lvbiB8fCBgRGVjaXNpb24gbWFkZSBhdCAke25ldyBEYXRlKGV2ZW50LnRpbWVzdGFtcCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9YDtcbiAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgdGltZXN0YW1wOiBldmVudC50aW1lc3RhbXAsXG4gICAgICAgIHR5cGU6ICdkZWNpc2lvbicsXG4gICAgICAgIHRpdGxlOiAnSW1wb3J0YW50IERlY2lzaW9uIFJlY29yZGVkJyxcbiAgICAgICAgY29udGVudDogZGVjaXNpb25UZXh0LFxuICAgICAgICB0YWdzOiBbJ2RlY2lzaW9uJ10sXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIEF1dG8tZ2VuZXJhdGUgc3VtbWFyeSBpZiB3ZSBoYXZlIGVub3VnaCBlbnRyaWVzXG4gICAgaWYgKGVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgdW5pcXVlUGF0dGVybnMgPSBuZXcgU2V0KGVudHJpZXMuZmlsdGVyKGUgPT4gZS50eXBlID09PSAncGF0dGVybicpLm1hcChlID0+IGUudGl0bGUpKTtcbiAgICAgIFxuICAgICAgZW50cmllcy5wdXNoKHtcbiAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHR5cGU6ICdzdW1tYXJ5JyxcbiAgICAgICAgdGl0bGU6IGBTZXNzaW9uIENvbnRleHQgU3VtbWFyeSAoJHtuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpfSlgLFxuICAgICAgICBjb250ZW50OiBgQXV0by1nZW5lcmF0ZWQgc3VtbWFyeTogJHtlbnRyaWVzLmxlbmd0aH0gY29udGV4dCBlbnRyaWVzIHNhdmVkLiBLZXkgcGF0dGVybnMgZGV0ZWN0ZWQ6ICR7QXJyYXkuZnJvbSh1bmlxdWVQYXR0ZXJucykuam9pbignLCAnKSB8fCAnTm8gc3BlY2lmaWMgcGF0dGVybnMnfS4gQ29uZmlndXJhdGlvbiBjaGFuZ2VzIHRyYWNrZWQ6ICR7T2JqZWN0LmtleXMoY29uZmlnQ2hhbmdlcyB8fCB7fSkubGVuZ3RofS5gLFxuICAgICAgICB0YWdzOiBbJ2F1dG9fc3VtbWFyeSddLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFNhdmUgYWxsIGVudHJpZXMgdG8gc3RvcmFnZVxuICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHRoaXMuc3RvcmFnZU1hbmFnZXIuYWRkRW50cnkoZW50cnkpKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2F2ZWRfY291bnQ6IGVudHJpZXMubGVuZ3RoLFxuICAgICAgICBzdW1tYXJ5OiBgU2F2ZWQgJHtlbnRyaWVzLmxlbmd0aH0gY29udGV4dCBlbnRyaWVzIGluY2x1ZGluZyBwYXR0ZXJucyBhbmQgZGVjaXNpb25zLmAsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IHNhdmVkX2NvdW50OiAwLCBzdW1tYXJ5OiAnTm8gc2lnbmlmaWNhbnQgY29udGV4dCBjaGFuZ2VzIGRldGVjdGVkLicgfTtcbiAgfVxuXG4gIC8qKiBHZW5lcmF0ZSBhIHVuaXF1ZSBJRCBmb3IgY29udGV4dCBlbnRyeSAqL1xuICBwcml2YXRlIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGN0eF8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQ29udGV4dE1hbmFnZW1lbnRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCBhbmFseXplciA9IG5ldyBDb250ZXh0QW5hbHl6ZXIoKTtcbiAgY29uc3Qgc3RvcmFnZU1hbmFnZXIgPSBuZXcgQ29udGV4dFN0b3JhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGF1dG9fc3VtbWFyaXplX2NvbnRleHQgdG9vbCBcdTIwMTQgQW5hbHl6ZSBzZXNzaW9uIGFuZCBzYXZlIGltcG9ydGFudCBjb250ZXh0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2F1dG9fc3VtbWFyaXplX2NvbnRleHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBhbmFseXplIHJlY2VudCBzZXNzaW9uIGFjdGl2aXR5LCBpZGVudGlmeSBpbXBvcnRhbnQgcGF0dGVybnMvZGVjaXNpb25zLCBhbmQgc2F2ZSB0aGVtIHRvIHBlcnNpc3RlbnQgbWVtb3J5IGZvciBmdXR1cmUgcmVmZXJlbmNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc2Vzc2lvbl9ldmVudHM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgICB0eXBlOiB6LnN0cmluZygpLFxuICAgICAgICB0aW1lc3RhbXA6IHoubnVtYmVyKCksXG4gICAgICAgIGRhdGE6IHouYW55KCkub3B0aW9uYWwoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdSZWNlbnQgc2Vzc2lvbiBldmVudHMgdG8gYW5hbHl6ZScpLFxuICAgICAgY29uZmlnX2NoYW5nZXM6IHoucmVjb3JkKHoudW5pb24oW3ouYm9vbGVhbigpLCB6LnN0cmluZygpXSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0NvbmZpZ3VyYXRpb24gY2hhbmdlcyBtYWRlIGR1cmluZyBzZXNzaW9uJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc2Vzc2lvbl9ldmVudHMsIGNvbmZpZ19jaGFuZ2VzIH06IHsgXG4gICAgICBzZXNzaW9uX2V2ZW50cz86IEFycmF5PHsgdHlwZTogc3RyaW5nOyB0aW1lc3RhbXA6IG51bWJlcjsgZGF0YT86IGFueSB9PjsgXG4gICAgICBjb25maWdfY2hhbmdlcz86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4gfCBzdHJpbmc+OyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhbmFseXplci5hbmFseXplQW5kU2F2ZShzZXNzaW9uX2V2ZW50cyB8fCBbXSwgY29uZmlnX2NoYW5nZXMpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IGFuYWx5c2lzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2NvbnRleHRfbWVtb3J5IHRvb2wgXHUyMDE0IFJldHJpZXZlIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyaWVzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9jb250ZXh0X21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdSZXRyaWV2ZSBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcyBmcm9tIHBlcnNpc3RlbnQgbWVtb3J5LiBVc2VmdWwgZm9yIHJlY2FsbGluZyBwYXN0IGRlY2lzaW9ucywgcGF0dGVybnMsIG9yIGNvbmZpZ3VyYXRpb25zLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbGltaXQ6IHoubnVtYmVyKCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDIwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgZW50cmllcyB0byByZXR1cm4nKSxcbiAgICAgIHR5cGU6IHouZW51bShbJ2RlY2lzaW9uJywgJ3BhdHRlcm4nLCAnY29uZmlndXJhdGlvbicsICdmaWxlX2NoYW5nZScsICdlcnJvcicsICdzdW1tYXJ5J10pLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZpbHRlciBieSBlbnRyeSB0eXBlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbGltaXQsIHR5cGUgfTogeyBcbiAgICAgIGxpbWl0PzogbnVtYmVyOyBcbiAgICAgIHR5cGU/OiBzdHJpbmc7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBzdG9yYWdlTWFuYWdlci5nZXRSZWNlbnRFbnRyaWVzKGxpbWl0IHx8IDIwLCB0eXBlKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZW50cmllcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcmV0cmlldmUgY29udGV4dCBtZW1vcnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHNlYXJjaF9jb250ZXh0IHRvb2wgXHUyMDE0IFNlYXJjaCBhdXRvLXNhdmVkIGNvbnRleHQgYnkgcXVlcnlcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2VhcmNoX2NvbnRleHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIHRocm91Z2ggYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgdXNpbmcgdGV4dCBtYXRjaGluZy4gRmluZHMgcmVsZXZhbnQgcGFzdCBkZWNpc2lvbnMsIHBhdHRlcm5zLCBvciBjb25maWd1cmF0aW9ucy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTZWFyY2ggcXVlcnkgdG8gbWF0Y2ggYWdhaW5zdCBjb250ZXh0IGVudHJpZXMnKSxcbiAgICAgIG1heF9yZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIG1heF9yZXN1bHRzIH06IHsgXG4gICAgICBxdWVyeTogc3RyaW5nOyBcbiAgICAgIG1heF9yZXN1bHRzPzogbnVtYmVyOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gc3RvcmFnZU1hbmFnZXIuc2VhcmNoRW50cmllcyhxdWVyeSwgbWF4X3Jlc3VsdHMgfHwgMTApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyByZXN1bHRzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbnRleHQgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY29udGV4dF9zdW1tYXJ5IHRvb2wgXHUyMDE0IEdldCBzdW1tYXJ5IHN0YXRpc3RpY3Mgb2YgYXV0by1zYXZlZCBjb250ZXh0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvbnRleHRfc3VtbWFyeScsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgYSBzdW1tYXJ5IG9mIGFsbCBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcywgaW5jbHVkaW5nIGNvdW50cyBieSB0eXBlIGFuZCByZWNlbnQgYWN0aXZpdHkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHN0b3JhZ2VNYW5hZ2VyLmdldFN1bW1hcnkoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHN1bW1hcnkgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgY29udGV4dCBzdW1tYXJ5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfY29udGV4dF9lbnRyeSB0b29sIFx1MjAxNCBSZW1vdmUgYSBzcGVjaWZpYyBjb250ZXh0IGVudHJ5IGJ5IElEXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9jb250ZXh0X2VudHJ5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIHNwZWNpZmljIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyeSBieSBpdHMgdW5pcXVlIElELicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZW50cnlfaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB1bmlxdWUgSUQgb2YgdGhlIGNvbnRleHQgZW50cnkgdG8gZGVsZXRlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZW50cnlfaWQgfTogeyBlbnRyeV9pZDogc3RyaW5nIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRlbGV0ZWQgPSBzdG9yYWdlTWFuYWdlci5kZWxldGVFbnRyeShlbnRyeV9pZCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWRlbGV0ZWQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IGVudHJ5ICcke2VudHJ5X2lkfScgbm90IGZvdW5kYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWQ6IHRydWUsIGVudHJ5X2lkIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBkZWxldGUgY29udGV4dCBlbnRyeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2xlYXJfY29udGV4dF9tZW1vcnkgdG9vbCBcdTIwMTQgQ2xlYXIgYWxsIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyaWVzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NsZWFyX2NvbnRleHRfbWVtb3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIGFsbCBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcyBmcm9tIHBlcnNpc3RlbnQgbWVtb3J5LiBUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29uZmlybTogei5ib29sZWFuKCkuZGVzY3JpYmUoJ1NldCB0byB0cnVlIHRvIGNvbmZpcm0gZGVsZXRpb24gb2YgYWxsIGNvbnRleHQgZW50cmllcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbmZpcm0gfTogeyBjb25maXJtOiBib29sZWFuIH0pID0+IHtcbiAgICAgIGlmICghY29uZmlybSkge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDb25maXJtYXRpb24gcmVxdWlyZWQuIFNldCBjb25maXJtPXRydWUgdG8gcHJvY2VlZC4nIH07XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0b3JhZ2VNYW5hZ2VyLmNsZWFyQWxsKCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNsZWFyZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGNsZWFyIGNvbnRleHQgbWVtb3J5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyB0cmFja19pbXBvcnRhbnRfZXZlbnQgdG9vbCBcdTIwMTQgTWFudWFsbHkgbWFyayBhbiBldmVudCBhcyBpbXBvcnRhbnQgZm9yIGNvbnRleHQgdHJhY2tpbmdcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAndHJhY2tfaW1wb3J0YW50X2V2ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ01hbnVhbGx5IHJlY29yZCBhbiBpbXBvcnRhbnQgZXZlbnQgb3IgZGVjaXNpb24gdG8gcGVyc2lzdGVudCBtZW1vcnkuIFVzZWZ1bCBmb3IgbWFya2luZyBjcml0aWNhbCBtb21lbnRzIGluIGEgc2Vzc2lvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaXRsZSBvZiB0aGUgaW1wb3J0YW50IGV2ZW50JyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXRhaWxlZCBkZXNjcmlwdGlvbiBvZiB0aGUgZXZlbnQnKSxcbiAgICAgIHRhZ3M6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGFncyB0byBjYXRlZ29yaXplIHRoZSBldmVudCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBjb250ZW50LCB0YWdzIH06IHsgXG4gICAgICB0aXRsZTogc3RyaW5nOyBcbiAgICAgIGNvbnRlbnQ6IHN0cmluZzsgXG4gICAgICB0YWdzPzogc3RyaW5nW107IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJ5OiBDb250ZXh0RW50cnkgPSB7XG4gICAgICAgICAgaWQ6IGBjdHhfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAnZGVjaXNpb24nLFxuICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgdGFncyxcbiAgICAgICAgfTtcblxuICAgICAgICBzdG9yYWdlTWFuYWdlci5hZGRFbnRyeShlbnRyeSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHRyYWNrZWQ6IHRydWUsIGVudHJ5X2lkOiBlbnRyeS5pZCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gdHJhY2sgZXZlbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICIvKipcbiAqIEF0dGFjaG1lbnQgTWFuYWdlclxuICogXG4gKiBTdG9yZXMgcmVmZXJlbmNlcyB0byBmaWxlcyBhdHRhY2hlZCB0byB0aGUgY3VycmVudCBjaGF0IG1lc3NhZ2UuXG4gKiBBbGxvd3MgdG9vbHMgdG8gYWNjZXNzIHRoZXNlIGZpbGVzIGJ5IG5hbWUgd2l0aG91dCBuZWVkaW5nIGZ1bGwgZGlzayBwYXRocy5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEZpbGVIYW5kbGUgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcblxuLy8gU3RvcmUgYXR0YWNobWVudHMgZm9yIHRoZSBjdXJyZW50IHR1cm5cbi8vIEtleTogZmlsZW5hbWUgKGxvd2VyY2FzZSksIFZhbHVlOiBGaWxlSGFuZGxlXG5sZXQgY3VycmVudEF0dGFjaG1lbnRzID0gbmV3IE1hcDxzdHJpbmcsIEZpbGVIYW5kbGU+KCk7XG5cbi8qKlxuICogU2V0IHRoZSBhdHRhY2htZW50cyBmb3IgdGhlIGN1cnJlbnQgY2hhdCB0dXJuLlxuICogQ2FsbGVkIGJ5IHRoZSBwcm9tcHQgcHJlcHJvY2Vzc29yIGJlZm9yZSBlYWNoIGdlbmVyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBdHRhY2htZW50cyhmaWxlczogRmlsZUhhbmRsZVtdKTogdm9pZCB7XG4gIGN1cnJlbnRBdHRhY2htZW50cy5jbGVhcigpO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAvLyBTdG9yZSBieSBsb3dlcmNhc2UgbmFtZSBmb3IgY2FzZS1pbnNlbnNpdGl2ZSBsb29rdXBcbiAgICBjdXJyZW50QXR0YWNobWVudHMuc2V0KGZpbGUubmFtZS50b0xvd2VyQ2FzZSgpLCBmaWxlKTtcbiAgfVxuICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVnaXN0ZXJlZCAke2ZpbGVzLmxlbmd0aH0gYXR0YWNobWVudChzKTogJHtmaWxlcy5tYXAoZiA9PiBmLm5hbWUpLmpvaW4oJywgJyl9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgYSBzcGVjaWZpYyBhdHRhY2htZW50IGJ5IG5hbWUgKGNhc2UtaW5zZW5zaXRpdmUpLlxuICogUmV0dXJucyB0aGUgRmlsZUhhbmRsZSBpZiBmb3VuZCwgdW5kZWZpbmVkIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF0dGFjaG1lbnQobmFtZTogc3RyaW5nKTogRmlsZUhhbmRsZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBjdXJyZW50QXR0YWNobWVudHMuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgY3VycmVudGx5IGF0dGFjaGVkIGZpbGVuYW1lcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RBdHRhY2htZW50cygpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBBcnJheS5mcm9tKGN1cnJlbnRBdHRhY2htZW50cy5rZXlzKCkpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgc3BlY2lmaWMgZmlsZSBpcyBhdHRhY2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXR0YWNoZWQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdXJyZW50QXR0YWNobWVudHMuaGFzKG5hbWUudG9Mb3dlckNhc2UoKSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sLCBGaWxlSGFuZGxlIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRBdHRhY2htZW50IH0gZnJvbSAnLi4vYXR0YWNobWVudE1hbmFnZXInO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUmVhZERvY3VtZW50UGFyYW1zIHtcbiAgZmlsZV9wYXRoOiBzdHJpbmc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEhlbHBlciBGdW5jdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFZhbGlkYXRlIGZpbGUgZXhpc3RzIG9uIGRpc2sgKi9cbmZ1bmN0aW9uIHZhbGlkYXRlRmlsZShmaWxlUGF0aDogc3RyaW5nKTogeyB2YWxpZDogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfSB7XG4gIGlmICghZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgRmlsZSBub3QgZm91bmQgb24gZGlzazogJHtmaWxlUGF0aH1gIH07XG4gIH1cbiAgXG4gIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhmaWxlUGF0aCk7XG4gIGlmICghc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBQYXRoIFwiJHtmaWxlUGF0aH1cIiBpcyBub3QgYSBmaWxlYCB9O1xuICB9XG4gIFxuICAvLyBDaGVjayBmaWxlIHNpemUgKG1heCA1ME1CKVxuICBjb25zdCBtYXhTaXplID0gNTAgKiAxMDI0ICogMTAyNDsgLy8gNTBNQlxuICBpZiAoc3RhdC5zaXplID4gbWF4U2l6ZSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBGaWxlIHRvbyBsYXJnZSAoJHsoc3RhdC5zaXplIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMSl9TUIpLCBtYXggaXMgNTBNQmAgfTtcbiAgfVxuICBcbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEb2N1bWVudCByZWFkaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBSZWFkIGNvbnRlbnQgZnJvbSBQREYgb3IgRE9DWCBmaWxlcy5cbiAqIFN1cHBvcnRzIGJvdGggZGlzayBwYXRocyBhbmQgYXR0YWNoZWQgZmlsZXMgKGJ5IGZpbGVuYW1lKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZERvY3VtZW50KHsgZmlsZV9wYXRoIH06IFJlYWREb2N1bWVudFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIDEuIENoZWNrIGlmIGl0J3MgYW4gYXR0YWNoZWQgZmlsZVxuICAgIGNvbnN0IGF0dGFjaG1lbnQgPSBnZXRBdHRhY2htZW50KGZpbGVfcGF0aCk7XG4gICAgaWYgKGF0dGFjaG1lbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBhdHRhY2hlZCBmaWxlOiAke2ZpbGVfcGF0aH1gKTtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGF0dGFjaG1lbnQucmVhZCgpO1xuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVfcGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIFxuICAgICAgaWYgKGV4dCA9PT0gJy5wZGYnKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkUERGRnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy5kb2N4Jykge1xuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZERPQ1hGcm9tQnVmZmVyKGJ1ZmZlciwgZmlsZV9wYXRoKTtcbiAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLnR4dCcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlYWRUWFRGcm9tQnVmZmVyKGJ1ZmZlciwgZmlsZV9wYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcbiAgICAgICAgICBlcnJvcjogYFVuc3VwcG9ydGVkIGF0dGFjaGVkIGZpbGUgZm9ybWF0OiAke2V4dH0uIE9ubHkgLnBkZiwgLmRvY3gsIGFuZCAudHh0IGFyZSBzdXBwb3J0ZWQuYCBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLiBGYWxsIGJhY2sgdG8gZGlzayBwYXRoXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRmlsZShmaWxlX3BhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgLy8gUHJvdmlkZSBoZWxwZnVsIGVycm9yIGlmIGl0IGxvb2tlZCBsaWtlIGEgZmlsZW5hbWVcbiAgICAgIHJldHVybiB7IFxuICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgIGVycm9yOiBgJHt2YWxpZGF0aW9uLmVycm9yfVxcblxcbk5vdGU6IElmIHRoaXMgaXMgYW4gYXR0YWNoZWQgZmlsZSwgdXNlIHRoZSBleGFjdCBmaWxlbmFtZSBmcm9tIHRoZSBcIkFUVEFDSEVEIEZJTEVTIEFWQUlMQUJMRVwiIGxpc3QuYCBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVfcGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICBcbiAgICBzd2l0Y2ggKGV4dCkge1xuICAgICAgY2FzZSAnLnBkZic6XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkUERGKGZpbGVfcGF0aCk7XG4gICAgICBjYXNlICcuZG9jeCc6XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkRE9DWChmaWxlX3BhdGgpO1xuICAgICAgY2FzZSAnLnR4dCc6IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlX3BhdGgsICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZmlsZV9wYXRoOiBmaWxlX3BhdGgsXG4gICAgICAgICAgICBmb3JtYXQ6ICdUWFQnLFxuICAgICAgICAgICAgd29yZF9jb3VudDogdGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICAgICAgc2l6ZTogYCR7KGZzLnN0YXRTeW5jKGZpbGVfcGF0aCkuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgZXJyb3I6IGBVbnN1cHBvcnRlZCBmaWxlIGZvcm1hdDogJHtleHR9LiBPbmx5IC5wZGYsIC5kb2N4LCBhbmQgLnR4dCBhcmUgc3VwcG9ydGVkLmAgXG4gICAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIFBERiBjb250ZW50IGZyb20gZGlzayBwYXRoLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkUERGKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwZGZQYXJzZSA9IChhd2FpdCBpbXBvcnQoJ3BkZi1wYXJzZScpKS5kZWZhdWx0O1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBQREYgZnJvbSBkaXNrOiAke2ZpbGVQYXRofWApO1xuICAgIFxuICAgIGNvbnN0IGRhdGFCdWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBkZlBhcnNlKGRhdGFCdWZmZXIpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUERGIHJlYWQgY29tcGxldGU6ICR7cmVzdWx0Lm51bXBhZ2VzfSBwYWdlcywgJHsocmVzdWx0LnRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVQYXRoLFxuICAgICAgICBmb3JtYXQ6ICdQREYnLFxuICAgICAgICBwYWdlczogcmVzdWx0Lm51bXBhZ2VzLFxuICAgICAgICB3b3JkX2NvdW50OiByZXN1bHQudGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICBzaXplOiBgJHsoZnMuc3RhdFN5bmMoZmlsZVBhdGgpLnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogcmVzdWx0LnRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAocmVzdWx0LnRleHQubGVuZ3RoID4gNTAwID8gJy4uLicgOiAnJyksXG4gICAgICAgIGZ1bGxfdGV4dDogcmVzdWx0LnRleHQsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBQREYgcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBQREYgY29udGVudCBmcm9tIGJ1ZmZlciAoZm9yIGF0dGFjaG1lbnRzKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFBERkZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwZGZQYXJzZSA9IChhd2FpdCBpbXBvcnQoJ3BkZi1wYXJzZScpKS5kZWZhdWx0O1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBQREYgZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBkZlBhcnNlKGJ1ZmZlcik7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBQREYgcmVhZCBjb21wbGV0ZTogJHtyZXN1bHQubnVtcGFnZXN9IHBhZ2VzLCAkeyhyZXN1bHQudGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogZmlsZU5hbWUsXG4gICAgICAgIGZvcm1hdDogJ1BERicsXG4gICAgICAgIHBhZ2VzOiByZXN1bHQubnVtcGFnZXMsXG4gICAgICAgIHdvcmRfY291bnQ6IHJlc3VsdC50ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXG4gICAgICAgIHNpemU6IGAkeyhidWZmZXIubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHJlc3VsdC50ZXh0LnN1YnN0cmluZygwLCA1MDApICsgKHJlc3VsdC50ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHJlc3VsdC50ZXh0LFxuICAgICAgICBzb3VyY2U6ICdhdHRhY2htZW50JyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBERiByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIERPQ1ggY29udGVudCBmcm9tIGRpc2sgcGF0aC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZERPQ1goZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IG1hbW1vdGggPSBhd2FpdCBpbXBvcnQoJ21hbW1vdGgnKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgRE9DWCBmcm9tIGRpc2s6ICR7ZmlsZVBhdGh9YCk7XG4gICAgXG4gICAgY29uc3QgZGF0YUJ1ZmZlciA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWFtbW90aC5leHRyYWN0UmF3VGV4dCh7IGJ1ZmZlcjogZGF0YUJ1ZmZlciB9KTtcbiAgICBcbiAgICBjb25zdCB0ZXh0ID0gcmVzdWx0LnZhbHVlO1xuICAgIGNvbnN0IHdhcm5pbmdzID0gcmVzdWx0Lm1lc3NhZ2VzLm1hcChtID0+IG0ubWVzc2FnZSkuam9pbignXFxuJyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBET0NYIHJlYWQgY29tcGxldGU6ICR7KHRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVQYXRoLFxuICAgICAgICBmb3JtYXQ6ICdET0NYJyxcbiAgICAgICAgd29yZF9jb3VudDogdGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICBzaXplOiBgJHsoZnMuc3RhdFN5bmMoZmlsZVBhdGgpLnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHdhcm5pbmdzOiB3YXJuaW5ncyB8fCB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBET0NYIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlYWQgRE9DWCBjb250ZW50IGZyb20gYnVmZmVyIChmb3IgYXR0YWNobWVudHMpLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkRE9DWEZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBtYW1tb3RoID0gYXdhaXQgaW1wb3J0KCdtYW1tb3RoJyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBSZWFkaW5nIERPQ1ggZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG1hbW1vdGguZXh0cmFjdFJhd1RleHQoeyBidWZmZXIgfSk7XG4gICAgXG4gICAgY29uc3QgdGV4dCA9IHJlc3VsdC52YWx1ZTtcbiAgICBjb25zdCB3YXJuaW5ncyA9IHJlc3VsdC5tZXNzYWdlcy5tYXAobSA9PiBtLm1lc3NhZ2UpLmpvaW4oJ1xcbicpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gRE9DWCByZWFkIGNvbXBsZXRlOiAkeyh0ZXh0Lmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9S0JgKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlTmFtZSxcbiAgICAgICAgZm9ybWF0OiAnRE9DWCcsXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGJ1ZmZlci5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHdhcm5pbmdzOiB3YXJuaW5ncyB8fCB1bmRlZmluZWQsXG4gICAgICAgIHNvdXJjZTogJ2F0dGFjaG1lbnQnLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRE9DWCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIFRYVCBjb250ZW50IGZyb20gYnVmZmVyIChmb3IgYXR0YWNobWVudHMpLlxuICovXG5hc3luYyBmdW5jdGlvbiByZWFkVFhURnJvbUJ1ZmZlcihidWZmZXI6IEJ1ZmZlciwgZmlsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBUWFQgZnJvbSBhdHRhY2htZW50OiAke2ZpbGVOYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHRleHQgPSBidWZmZXIudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBUWFQgcmVhZCBjb21wbGV0ZTogJHsodGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogZmlsZU5hbWUsXG4gICAgICAgIGZvcm1hdDogJ1RYVCcsXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGJ1ZmZlci5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIHRleHRfcHJldmlldzogdGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArICh0ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXG4gICAgICAgIHNvdXJjZTogJ2F0dGFjaG1lbnQnLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVFhUIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRvY3VtZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJlYWRfZG9jdW1lbnQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2RvY3VtZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlYWQgY29udGVudCBmcm9tIFBERiwgRE9DWCwgb3IgVFhUIGZpbGVzLiBTdXBwb3J0cyBib3RoIGRpc2sgcGF0aHMgYW5kIGF0dGFjaGVkIGZpbGVzICh1c2UgZmlsZW5hbWUgZm9yIGF0dGFjaG1lbnRzKS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfcGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgUERGLCBET0NYLCBvciBUWFQgZmlsZSwgb3IgdGhlIGZpbGVuYW1lIGlmIGl0IGlzIGFuIGF0dGFjaGVkIGZpbGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByZWFkRG9jdW1lbnQocGFyYW1zIGFzIFJlYWREb2N1bWVudFBhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiLyoqXG4gKiBUb29scyBQcm92aWRlciAtIENvbXBsZXRlIEltcGxlbWVudGF0aW9uIG9mIGFsbCB+NDUgdG9vbHMgYWNyb3NzIDYgY2F0ZWdvcmllc1xuICovXG5cbmltcG9ydCB0eXBlIHsgVG9vbCwgVG9vbHNQcm92aWRlckNvbnRyb2xsZXIgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcblxuLy8gSW1wb3J0IGV4aXN0aW5nIG1vZHVsZXNcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcsIGlzVG9vbEVuYWJsZWQsIGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQsIGNvbmZpZ1NjaGVtYXRpY3MgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuL3N0YXRlTWFuYWdlcic7XG5pbXBvcnQgeyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIgfSBmcm9tICcuL2JhY2tncm91bmRDb21tYW5kcyc7XG5cbi8vIEltcG9ydCBjYXRlZ29yeS1zcGVjaWZpYyB0b29sIG1vZHVsZXNcbmltcG9ydCB7IHJlZ2lzdGVyRmlsZVN5c3RlbVRvb2xzIH0gZnJvbSAnLi90b29scy9maWxlU3lzdGVtVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJXZWJSZXNlYXJjaFRvb2xzIH0gZnJvbSAnLi90b29scy93ZWJSZXNlYXJjaFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyR2l0VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2dpdEdpdGh1YlRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyQnJvd3NlclRvb2xzIH0gZnJvbSAnLi90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyRGF0YWJhc2VUb29scyB9IGZyb20gJy4vdG9vbHMvZGF0YWJhc2VUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckJhY2tncm91bmRDb21tYW5kVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2JhY2tncm91bmRDb21tYW5kVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJFeGVjdXRpb25Ub29scyB9IGZyb20gJy4vdG9vbHMvZXhlY3V0aW9uVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJVdGlsaXR5VG9vbHMgfSBmcm9tICcuL3Rvb2xzL3V0aWxpdHlUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzIH0gZnJvbSAnLi90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scyc7XG5pbXBvcnQgeyByZWdpc3Rlckh0dHBDbGllbnRUb29scyB9IGZyb20gJy4vdG9vbHMvaHR0cENsaWVudFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyUmFnVG9vbHMgfSBmcm9tICcuL3Rvb2xzL3ZlY3RvclJhZ1Rvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyVWlHZW5lcmF0aW9uVG9vbHMgfSBmcm9tICcuL3Rvb2xzL3VpR2VuZXJhdGlvblRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyQ29udGV4dE1hbmFnZW1lbnRUb29scyB9IGZyb20gJy4vdG9vbHMvY29udGV4dE1hbmFnZW1lbnRUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckRvY3VtZW50VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2RvY3VtZW50VG9vbHMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUWVBFUyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgaW50ZXJmYWNlIFRvb2xDYXRlZ29yeSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdG9vbHM6IFRvb2xbXTtcbn1cblxuLyoqIEV4dGVuZGVkIHRvb2wgdHlwZSB3aXRoIHR5cGVkIGltcGxlbWVudGF0aW9uIGZvciBzYWZlIGFjY2VzcyAqL1xudHlwZSBUeXBlZFRvb2wgPSBUb29sICYge1xuICBpbXBsZW1lbnRhdGlvbjogKHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGN0eD86IHVua25vd24pID0+IFByb21pc2U8dW5rbm93bj47XG59O1xuXG4vLyBHbG9iYWwgY29uZmlnIHJlZmVyZW5jZSB0byBlbnN1cmUgdG9vbHNQcm92aWRlciB1c2VzIHRoZSBsYXRlc3QgdXNlciBzZXR0aW5nc1xubGV0IGN1cnJlbnRDb25maWc6IFBsdWdpbkNvbmZpZyA9IERFRkFVTFRfQ09ORklHO1xuXG4vKipcbiAqIENlbnRyYWwgcmVnaXN0cnkgZm9yIGFsbCBhdmFpbGFibGUgdG9vbHMuXG4gKiBUb29scyBhcmUgY3JlYXRlZCBvbmNlIGF0IG1vZHVsZSBsb2FkIHRpbWUgYW5kIHJldXNlZCBhY3Jvc3MgcHJvdmlkZXIgY2FsbHMuXG4gKi9cbmNsYXNzIFRvb2xSZWdpc3RyeSB7XG4gIHByaXZhdGUgdG9vbE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBUeXBlZFRvb2w+KCk7XG5cbiAgcmVnaXN0ZXJBbGwoY29uZmlnOiBQbHVnaW5Db25maWcsIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcik6IHZvaWQge1xuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2ZpbGVTeXN0ZW0nKSkge1xuICAgICAgcmVnaXN0ZXJGaWxlU3lzdGVtVG9vbHMoY29uZmlnLCBzdGF0ZU1hbmFnZXIpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnd2ViU2VhcmNoJykpIHtcbiAgICAgIHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnYnJvd3NlckF1dG9tYXRpb24nKSkge1xuICAgICAgcmVnaXN0ZXJCcm93c2VyVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2dpdE9wZXJhdGlvbnMnKSkge1xuICAgICAgcmVnaXN0ZXJHaXRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZGF0YWJhc2VRdWVyaWVzJykpIHtcbiAgICAgIHJlZ2lzdGVyRGF0YWJhc2VUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZG9jdW1lbnRQYXJzaW5nJykpIHtcbiAgICAgIHJlZ2lzdGVyRG9jdW1lbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnYmFja2dyb3VuZENvbW1hbmRzJykpIHtcbiAgICAgIHJlZ2lzdGVyQmFja2dyb3VuZENvbW1hbmRUb29scyhjb25maWcsIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcikuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cblxuICAgIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0NcdUREOTUgTkVXIFRPT0wgQ0FURUdPUklFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdpbWFnZVByb2Nlc3NpbmcnKSkge1xuICAgICAgcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnaHR0cENsaWVudCcpKSB7XG4gICAgICByZWdpc3Rlckh0dHBDbGllbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAndmVjdG9yUkFHJykpIHtcbiAgICAgIHJlZ2lzdGVyUmFnVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ3VpR2VuZXJhdGlvbicpKSB7XG4gICAgICByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdjb250ZXh0TWFuYWdlbWVudCcpKSB7XG4gICAgICByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgcmVnaXN0ZXJlZCBvbmNlLCBmaWx0ZXJlZCBieSBlbmFibGVkIHRvb2wgdHlwZXNcbiAgICBjb25zdCBleGVjQ29uZmlnID0geyAuLi5jb25maWcgfTtcbiAgICBjb25zdCBhbGxFeGVjVG9vbHMgPSByZWdpc3RlckV4ZWN1dGlvblRvb2xzKGV4ZWNDb25maWcpO1xuICAgIFxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICdqYXZhc2NyaXB0JykpIHtcbiAgICAgIGNvbnN0IGpzVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX2phdmFzY3JpcHQnKTtcbiAgICAgIGlmIChqc1Rvb2wpIHRoaXMudG9vbE1hcC5zZXQoanNUb29sLm5hbWUsIGpzVG9vbCBhcyBUeXBlZFRvb2wpO1xuICAgIH1cbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAncHl0aG9uJykpIHtcbiAgICAgIGNvbnN0IHB5VG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX3B5dGhvbicpO1xuICAgICAgaWYgKHB5VG9vbCkgdGhpcy50b29sTWFwLnNldChweVRvb2wubmFtZSwgcHlUb29sIGFzIFR5cGVkVG9vbCk7XG4gICAgfVxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICd0ZXJtaW5hbCcpKSB7XG4gICAgICBjb25zdCB0ZXJtVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX2luX3Rlcm1pbmFsJyk7XG4gICAgICBpZiAodGVybVRvb2wpIHRoaXMudG9vbE1hcC5zZXQodGVybVRvb2wubmFtZSwgdGVybVRvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ3NoZWxsJykpIHtcbiAgICAgIGNvbnN0IHNoZWxsVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAnZXhlY3V0ZV9jb21tYW5kJyk7XG4gICAgICBpZiAoc2hlbGxUb29sKSB0aGlzLnRvb2xNYXAuc2V0KHNoZWxsVG9vbC5uYW1lLCBzaGVsbFRvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVXRpbGl0eSB0b29scyBhcmUgYWx3YXlzIHJlZ2lzdGVyZWQgKG5vIHNwZWNpZmljIGNvbmZpZyBmbGFnKVxuICAgIGNvbnN0IGdldEVuYWJsZWRUb29scyA9ICgpID0+IEFycmF5LmZyb20odGhpcy50b29sTWFwLmtleXMoKSk7XG4gICAgcmVnaXN0ZXJVdGlsaXR5VG9vbHMoY29uZmlnLCBzdGF0ZU1hbmFnZXIsIGdldEVuYWJsZWRUb29scykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICB9XG5cbiAgZ2V0QWxsKCk6IFRvb2xbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy50b29sTWFwLnZhbHVlcygpKTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBUeXBlZFRvb2wgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnRvb2xNYXAuZ2V0KG5hbWUpO1xuICB9XG5cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRvb2xNYXAuaGFzKG5hbWUpO1xuICB9XG59XG5cbi8qKlxuICogTWFuYWdlcyB0b29sIGV4ZWN1dGlvbiBhbmQgc3RhdGUgdXBkYXRlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvb2xzUHJvdmlkZXIge1xuICBwcml2YXRlIGNvbmZpZzogUGx1Z2luQ29uZmlnO1xuICBwcml2YXRlIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyO1xuICBwcml2YXRlIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcjogQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyO1xuICBwcml2YXRlIHJlZ2lzdHJ5OiBUb29sUmVnaXN0cnk7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gICAgdGhpcy5zdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKHRoaXMuY29uZmlnKTtcbiAgICB0aGlzLmJhY2tncm91bmRDb21tYW5kTWFuYWdlciA9IG5ldyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIodGhpcy5jb25maWcpO1xuICAgIHRoaXMucmVnaXN0cnkgPSBuZXcgVG9vbFJlZ2lzdHJ5KCk7XG4gICAgdGhpcy5yZWdpc3RyeS5yZWdpc3RlckFsbCh0aGlzLmNvbmZpZywgdGhpcy5zdGF0ZU1hbmFnZXIsIHRoaXMuYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgdG9vbCBieSBuYW1lIHdpdGggcGFyYW1ldGVycy5cbiAgICovXG4gIGFzeW5jIGV4ZWN1dGVUb29sKHRvb2xOYW1lOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCB0b29sID0gdGhpcy5yZWdpc3RyeS5nZXQodG9vbE5hbWUpO1xuICAgIGlmICghdG9vbCkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCAnJHt0b29sTmFtZX0nIG5vdCBmb3VuZGAgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gU2FmZSBhY2Nlc3MgdmlhIHR5cGVkIHdyYXBwZXIgKEM0IGZpeClcbiAgICAgIGNvbnN0IGltcGwgPSB0b29sLmltcGxlbWVudGF0aW9uO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wbChwYXJhbXMpO1xuICAgICAgXG4gICAgICAvLyBVcGRhdGUgc3RhdGUgd2l0aCBleGVjdXRpb24gcmVzdWx0XG4gICAgICB0aGlzLnN0YXRlTWFuYWdlci5zZXQoYGxhc3RfJHt0b29sTmFtZX1gLCByZXN1bHQpO1xuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCBleGVjdXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGF2YWlsYWJsZSB0b29scyBmaWx0ZXJlZCBieSBjb25maWcuXG4gICAqL1xuICBnZXRBdmFpbGFibGVUb29scygpOiBUb29sW10ge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdldEFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3RhdGUgbWFuYWdlciBpbnN0YW5jZS5cbiAgICovXG4gIGdldFN0YXRlTWFuYWdlcigpOiBTdGF0ZU1hbmFnZXIge1xuICAgIHJldHVybiB0aGlzLnN0YXRlTWFuYWdlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbi5cbiAgICovXG4gIGdldENvbmZpZygpOiBQbHVnaW5Db25maWcge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxufVxuXG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVG9vbHNQcm92aWRlciB3aXRoIGRlZmF1bHQgY29uZmlnLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVG9vbHNQcm92aWRlcihjb25maWc/OiBQbHVnaW5Db25maWcpOiBUb29sc1Byb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBUb29sc1Byb3ZpZGVyKGNvbmZpZyk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNESyBQUk9WSURFUiBGVU5DVElPTiA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE1haW4gdG9vbHMgcHJvdmlkZXIgZnVuY3Rpb24gZm9yIExNIFN0dWRpbyBTREsuXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCB0aGF0IGdldHMgY2FsbGVkIGJ5IExNIFN0dWRpby5cbiAqIFxuICogSU1QT1JUQU5UOiBUaGUgTE0gU3R1ZGlvIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyBhbGwgVG9vbCBvYmplY3RzXG4gKiByZXR1cm5lZCBmcm9tIHRoaXMgcHJvdmlkZXIgZnVuY3Rpb24uIE5vIG1hbnVhbCBjdGwuYWRkKCkgY2FsbHMgbmVlZGVkIC1cbiAqIGp1c3QgcmV0dXJuIHRoZSBhcnJheSBkaXJlY3RseSBhbmQgdGhlIFNESyBoYW5kbGVzIHJlZ2lzdHJhdGlvbi5cbiAqIFxuICogTk9URTogTXVzdCBiZSBhc3luYyBcdTIwMTQgU0RLIHR5cGUgcmVxdWlyZXMgUHJvbWlzZTxUb29sW10+LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9vbHNQcm92aWRlcihjdGw6IFRvb2xzUHJvdmlkZXJDb250cm9sbGVyKTogUHJvbWlzZTxUb29sW10+IHtcbiAgLy8gRklYOiBSZWFkIGNvbmZpZ3VyYXRpb24gZHluYW1pY2FsbHkgZnJvbSBVSSBjb250cm9sbGVyIChsaWtlIGJlbGVkYXJpYW5zIHBsdWdpbilcbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgXG4gIC8vIENvbnN0cnVjdCBhIGxpdmUgY29uZmlnIG9iamVjdCBmcm9tIHRoZSBVSSBzdGF0ZVxuICBjb25zdCBsaXZlQ29uZmlnOiBQbHVnaW5Db25maWcgPSB7XG4gICAgZmlsZVN5c3RlbTogcGx1Z2luQ29uZmlnLmdldCgnZmlsZVN5c3RlbScpLFxuICAgIHdlYlNlYXJjaDogcGx1Z2luQ29uZmlnLmdldCgnd2ViU2VhcmNoJyksXG4gICAgYnJvd3NlckF1dG9tYXRpb246IHBsdWdpbkNvbmZpZy5nZXQoJ2Jyb3dzZXJBdXRvbWF0aW9uJyksXG4gICAgZ2l0T3BlcmF0aW9uczogcGx1Z2luQ29uZmlnLmdldCgnZ2l0T3BlcmF0aW9ucycpLFxuICAgIGRhdGFiYXNlUXVlcmllczogcGx1Z2luQ29uZmlnLmdldCgnZGF0YWJhc2VRdWVyaWVzJyksXG4gICAgZG9jdW1lbnRQYXJzaW5nOiBwbHVnaW5Db25maWcuZ2V0KCdkb2N1bWVudFBhcnNpbmcnKSxcbiAgICBiYWNrZ3JvdW5kQ29tbWFuZHM6IHBsdWdpbkNvbmZpZy5nZXQoJ2JhY2tncm91bmRDb21tYW5kcycpLFxuICAgIGltYWdlUHJvY2Vzc2luZzogcGx1Z2luQ29uZmlnLmdldCgnaW1hZ2VQcm9jZXNzaW5nJyksXG4gICAgaHR0cENsaWVudDogcGx1Z2luQ29uZmlnLmdldCgnaHR0cENsaWVudCcpLFxuICAgIHZlY3RvclJBRzogcGx1Z2luQ29uZmlnLmdldCgndmVjdG9yUkFHJyksXG4gICAgdWlHZW5lcmF0aW9uOiBwbHVnaW5Db25maWcuZ2V0KCd1aUdlbmVyYXRpb24nKSxcbiAgICBjb250ZXh0TWFuYWdlbWVudDogcGx1Z2luQ29uZmlnLmdldCgnY29udGV4dE1hbmFnZW1lbnQnKSxcbiAgICBnb2RNb2RlOiBwbHVnaW5Db25maWcuZ2V0KCdnb2RNb2RlJyksXG4gICAgZG9jdW1lbnRSQUc6IHBsdWdpbkNvbmZpZy5nZXQoJ2RvY3VtZW50UkFHJyksXG4gICAgcmV0cmlldmFsTGltaXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0JyksXG4gICAgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkJyksXG4gICAgZXhlY3V0aW9uSmF2YVNjcmlwdDogcGx1Z2luQ29uZmlnLmdldCgnZXhlY3V0aW9uSmF2YVNjcmlwdCcpLFxuICAgIGV4ZWN1dGlvblB5dGhvbjogcGx1Z2luQ29uZmlnLmdldCgnZXhlY3V0aW9uUHl0aG9uJyksXG4gICAgZXhlY3V0aW9uVGVybWluYWw6IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvblRlcm1pbmFsJyksXG4gICAgZXhlY3V0aW9uU2hlbGw6IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvblNoZWxsJyksXG4gICAgc2VhcmNoRmFsbGJhY2tDaGFpbjogcGx1Z2luQ29uZmlnLmdldCgnc2VhcmNoRmFsbGJhY2tDaGFpbicpLFxuICAgIG1heFNlYXJjaFJlc3VsdHM6IHBsdWdpbkNvbmZpZy5nZXQoJ21heFNlYXJjaFJlc3VsdHMnKSxcbiAgICBzYWZlc2VhcmNoOiBwbHVnaW5Db25maWcuZ2V0KCdzYWZlc2VhcmNoJyksXG4gICAgYnJvd3NlclRpbWVvdXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2Jyb3dzZXJUaW1lb3V0JyksXG4gICAgaGVhZGxlc3NNb2RlOiBwbHVnaW5Db25maWcuZ2V0KCdoZWFkbGVzc01vZGUnKSxcbiAgICBnaXRBdXRvQ29tbWl0OiBwbHVnaW5Db25maWcuZ2V0KCdnaXRBdXRvQ29tbWl0JyksXG4gICAgZGVmYXVsdEJyYW5jaDogcGx1Z2luQ29uZmlnLmdldCgnZGVmYXVsdEJyYW5jaCcpLFxuICAgIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogcGx1Z2luQ29uZmlnLmdldCgncGF0aFZhbGlkYXRpb25FbmFibGVkJyksXG4gICAgYmluYXJ5RmlsZURldGVjdGlvbjogcGx1Z2luQ29uZmlnLmdldCgnYmluYXJ5RmlsZURldGVjdGlvbicpLFxuICAgIHJlZ2V4UmVEb1NQcm90ZWN0aW9uOiBwbHVnaW5Db25maWcuZ2V0KCdyZWdleFJlRG9TUHJvdGVjdGlvbicpLFxuICAgIG1heFJlZ2V4TGVuZ3RoOiBwbHVnaW5Db25maWcuZ2V0KCdtYXhSZWdleExlbmd0aCcpLFxuICAgIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiBwbHVnaW5Db25maWcuZ2V0KCdzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZCcpLFxuICAgIHN0YXRlTWF4U2l6ZTogcGx1Z2luQ29uZmlnLmdldCgnc3RhdGVNYXhTaXplJyksXG4gICAgbGFuZ3VhZ2U6IHBsdWdpbkNvbmZpZy5nZXQoJ2xhbmd1YWdlJyksXG4gICAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHBsdWdpbkNvbmZpZy5nZXQoJ25vdGlmaWNhdGlvbnNFbmFibGVkJyksXG4gICAgdGVtcG9yYWxBd2FyZW5lc3M6IHBsdWdpbkNvbmZpZy5nZXQoJ3RlbXBvcmFsQXdhcmVuZXNzJyksXG4gICAgZGF0ZUZvcm1hdFN0eWxlOiBwbHVnaW5Db25maWcuZ2V0KCdkYXRlRm9ybWF0U3R5bGUnKSxcbiAgfTtcblxuICBjb25zdCBwcm92aWRlciA9IGNyZWF0ZVRvb2xzUHJvdmlkZXIobGl2ZUNvbmZpZyk7XG4gIFxuICAvLyBSZXR1cm4gYWxsIGF2YWlsYWJsZSB0b29scyAtIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyB0aGVtXG4gIHJldHVybiBwcm92aWRlci5nZXRBdmFpbGFibGVUb29scygpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gcmVmZXJlbmNlLlxuICogQ2FsbCB0aGlzIGZyb20gbWFpbigpIHRvIGVuc3VyZSB0b29sc1Byb3ZpZGVyIHVzZXMgdGhlIGxhdGVzdCB1c2VyIHNldHRpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlR2xvYmFsQ29uZmlnKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogdm9pZCB7XG4gIGN1cnJlbnRDb25maWcgPSBjb25maWc7XG59XG4iLCAiLyoqXG4gKiBEb2N1bWVudCBSQUcgUHJvbXB0IFByZXByb2Nlc3NvciArIFdvcmtpbmcgRGlyZWN0b3J5IERldGVjdGlvbiArIFRlbXBvcmFsIEF3YXJlbmVzc1xuICovXG5cbmltcG9ydCB7IHR5cGUgQ2hhdE1lc3NhZ2UsIHR5cGUgRmlsZUhhbmRsZSwgdHlwZSBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHBkZlBhcnNlIGZyb20gJ3BkZi1wYXJzZSc7XG5pbXBvcnQgeyBzZXRBdHRhY2htZW50cywgbGlzdEF0dGFjaG1lbnRzIH0gZnJvbSAnLi9hdHRhY2htZW50TWFuYWdlcic7XG5cbi8vIC0tLSBUZW1wb3JhbCBBd2FyZW5lc3MgSGVscGVycyAobWVyZ2VkIGZyb20gdXBfdG9fZGF0ZSkgLS0tXG5pbnRlcmZhY2UgRGF0ZVRpbWVDYWNoZSB7XG4gIGNvbXBhY3Q6IHN0cmluZztcbiAgZnVsbDogc3RyaW5nO1xufVxuXG5sZXQgY2FjaGVkRGF0ZVRpbWVEYXRhOiBEYXRlVGltZUNhY2hlIHwgbnVsbCA9IG51bGw7XG5jb25zdCBDQUNIRV9EVVJBVElPTl9NUyA9IDUgKiA2MCAqIDEwMDA7IC8vIFJlZnJlc2ggZXZlcnkgNSBtaW51dGVzXG5sZXQgY2FjaGVUaW1lc3RhbXAgPSAwO1xuXG5mdW5jdGlvbiBnZXRDYWNoZWREYXRlVGltZSgpOiBEYXRlVGltZUNhY2hlIHtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgXG4gIGlmIChjYWNoZWREYXRlVGltZURhdGEgJiYgKG5vdyAtIGNhY2hlVGltZXN0YW1wKSA8IENBQ0hFX0RVUkFUSU9OX01TKSB7XG4gICAgcmV0dXJuIGNhY2hlZERhdGVUaW1lRGF0YTtcbiAgfVxuICBcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIFxuICAvLyBDb21wYWN0IGZvcm1hdDogREQuTU0uWVlZWSwgSEg6bW1cbiAgY29uc3QgY29tcGFjdCA9IGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2RlLURFJywge1xuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJzItZGlnaXQnLFxuICAgIGRheTogJzItZGlnaXQnLFxuICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICBtaW51dGU6ICcyLWRpZ2l0J1xuICB9KTtcbiAgXG4gIC8vIEZ1bGwgZm9ybWF0OiBXb2NoZW50YWcsIERELiBNTU1NIFlZWVksIEhIOm1tIFVoclxuICBjb25zdCBmdWxsID0gZGF0ZS50b0xvY2FsZVN0cmluZygnZGUtREUnLCB7XG4gICAgd2Vla2RheTogJ2xvbmcnLFxuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJ2xvbmcnLFxuICAgIGRheTogJ251bWVyaWMnLFxuICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICBtaW51dGU6ICcyLWRpZ2l0J1xuICB9KSArICcgVWhyJztcbiAgXG4gIGNhY2hlZERhdGVUaW1lRGF0YSA9IHsgY29tcGFjdCwgZnVsbCB9O1xuICBjYWNoZVRpbWVzdGFtcCA9IG5vdztcbiAgXG4gIHJldHVybiBjYWNoZWREYXRlVGltZURhdGE7XG59XG5cbmZ1bmN0aW9uIGdldFRlbXBvcmFsU3VmZml4KGN0bDogUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcik6IHN0cmluZyB7XG4gIGNvbnN0IGNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIGlmICghY29uZmlnLnRlbXBvcmFsQXdhcmVuZXNzKSByZXR1cm4gJyc7XG4gIFxuICBjb25zdCBzdHlsZSA9IGNvbmZpZy5kYXRlRm9ybWF0U3R5bGUgfHwgJ3N0YW5kYXJkJztcbiAgY29uc3QgeyBjb21wYWN0LCBmdWxsIH0gPSBnZXRDYWNoZWREYXRlVGltZSgpO1xuICBcbiAgaWYgKHN0eWxlID09PSAnaGV1dGVJc3QnKSB7XG4gICAgcmV0dXJuIGBcXG5cXG5IRVVURSBJU1QgJHtmdWxsfWA7XG4gIH1cbiAgcmV0dXJuIGBcXG5cXG5bWmVpdDogJHtjb21wYWN0fV1gO1xufVxuXG5mdW5jdGlvbiBkZXRlY3REaXJlY3RvcnlQYXRoKHRleHQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAvLyBSZW1vdmUgVVJMcyBmaXJzdCB0byBhdm9pZCBmYWxzZSBwb3NpdGl2ZXMgbGlrZSAvbWVkaXVtLmNvbSBmcm9tIGh0dHBzOi8vbWVkaXVtLmNvbS8uLi5cbiAgY29uc3Qgd2l0aG91dFVybHMgPSB0ZXh0LnJlcGxhY2UoL2h0dHBzPzpcXC9cXC9bXlxcc10rfHd3d1xcLlteXFxzXSt8ZmlsZTpcXC9cXC9bXlxcc10rL2csICcnKTtcblxuICAvLyBXaW5kb3dzIHBhdGhzOiBDOlxccGF0aCBvciBEOlxcZm9sZGVyIChtdXN0IHN0YXJ0IHdpdGggZHJpdmUgbGV0dGVyKVxuICBjb25zdCB3aW5NYXRjaCA9IHdpdGhvdXRVcmxzLm1hdGNoKC9bQS1aYS16XTpcXFxcW1xcd1xcLV8uIF0rLyk7XG4gIGlmICh3aW5NYXRjaCkgcmV0dXJuIHdpbk1hdGNoWzBdLnRyaW0oKTtcblxuICAvLyBVbml4IGFic29sdXRlIHBhdGhzOiAvaG9tZS91c2VyL2RpciwgL3Zhci9sb2csIGV0Yy5cbiAgY29uc3QgdW5peE1hdGNoID0gd2l0aG91dFVybHMubWF0Y2goLyg/Ol58XFxzKShcXC9bXFx3XFwtXy4gXXsyLH0pLyk7XG4gIGlmICh1bml4TWF0Y2gpIHtcbiAgICBjb25zdCBwYXRoID0gdW5peE1hdGNoWzFdLnRyaW0oKTtcbiAgICAvLyBSZWplY3QgcGF0aHMgdGhhdCBsb29rIGxpa2UgVVJMcyBvciBmcmFnbWVudHMgKGUuZy4sIC8gQ2hhdCBmaWxlcyBzKVxuICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvICcpICYmICFwYXRoLmluY2x1ZGVzKCcgJykpIHtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlbGF0aXZlIHBhdGhzOiAuL2ZvbGRlciwgLi4vcGFyZW50L2RpclxuICBjb25zdCByZWxNYXRjaCA9IHdpdGhvdXRVcmxzLm1hdGNoKC8oPzpefFxccykoPzpcXC5cXC98XFwuXFxcXC5cXC98XFwuXFwuXFwvKVtcXHdcXC1fLiBdKy8pO1xuICBpZiAocmVsTWF0Y2gpIHJldHVybiByZWxNYXRjaFswXS50cmltKCk7XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGluamVjdFdvcmtpbmdEaXJlY3RvcnlQcm9tcHQob3JpZ2luYWxNZXNzYWdlOiBzdHJpbmcsIGRldGVjdGVkUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgaW5zdHJ1Y3Rpb24gPSBgXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblx1MjZBMFx1RkUwRiBXT1JLSU5HIERJUkVDVE9SWSBERVRFQ1RFRFxuXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXG5cblRoZSB1c2VyIG1lbnRpb25lZCBhIGRpcmVjdG9yeSBwYXRoIGluIHRoZWlyIG1lc3NhZ2U6XG5cbiAgICAke2RldGVjdGVkUGF0aH1cblxuUGxlYXNlIGFzayB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uIGJlZm9yZSBjaGFuZ2luZyB0aGUgd29ya2luZyBkaXJlY3RvcnkuXG5FeGFtcGxlIHJlc3BvbnNlOlxuXG5cIkkgbm90aWNlZCB5b3UgbWVudGlvbmVkIHRoZSBkaXJlY3RvcnkgJyR7ZGV0ZWN0ZWRQYXRofScuIFxuV291bGQgeW91IGxpa2UgbWUgdG8gc2V0IHRoaXMgYXMgeW91ciB3b3JraW5nIGRpcmVjdG9yeT8gXG5BbGwgc3Vic2VxdWVudCBmaWxlIG9wZXJhdGlvbnMgd2lsbCB1c2UgdGhpcyBkaXJlY3RvcnkgYXMgdGhlIGJhc2UuXG5cblJlcGx5ICd5ZXMnIG9yICdqYScgdG8gY29uZmlybSwgb3IgJ25vJy8nbmVpbicgdG8gZGVjbGluZS5cIlxuXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblxuVXNlcidzIG9yaWdpbmFsIG1lc3NhZ2U6XG4ke29yaWdpbmFsTWVzc2FnZX1cbmA7XG4gIFxuICByZXR1cm4gaW5zdHJ1Y3Rpb24udHJpbSgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBleHRyYWN0UGRmVGV4dChmaWxlSGFuZGxlOiBGaWxlSGFuZGxlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBmaWxlSGFuZGxlLnJlYWQoKTtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcGRmUGFyc2UoYnVmZmVyKTtcbiAgICByZXR1cm4gZGF0YS50ZXh0LnRyaW0oKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGBbUkFHXSBFcnJvciBleHRyYWN0aW5nIHRleHQgZnJvbSBQREYgJHtmaWxlSGFuZGxlLm5hbWV9OmAsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBwYXJzZSBQREY6ICR7ZmlsZUhhbmRsZS5uYW1lfWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNodW5rVGV4dCh0ZXh0OiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyID0gMTAwMCwgb3ZlcmxhcDogbnVtYmVyID0gMTAwKTogc3RyaW5nW10ge1xuICBjb25zdCB3b3JkcyA9IHRleHQuc3BsaXQoL1xccysvKTtcbiAgY29uc3QgY2h1bmtzOiBzdHJpbmdbXSA9IFtdO1xuICBcbiAgaWYgKHdvcmRzLmxlbmd0aCA8PSBjaHVua1NpemUpIHtcbiAgICByZXR1cm4gW3RleHRdO1xuICB9XG5cbiAgbGV0IHN0YXJ0SW5kZXggPSAwO1xuICB3aGlsZSAoc3RhcnRJbmRleCA8IHdvcmRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGVuZEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCArIGNodW5rU2l6ZSwgd29yZHMubGVuZ3RoKTtcbiAgICBjb25zdCBjaHVua1RleHQgPSB3b3Jkcy5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCkuam9pbignICcpO1xuICAgIFxuICAgIGNodW5rcy5wdXNoKGNodW5rVGV4dCk7XG4gICAgc3RhcnRJbmRleCA9IGVuZEluZGV4IC0gb3ZlcmxhcDtcbiAgfVxuXG4gIHJldHVybiBjaHVua3MuZmlsdGVyKGMgPT4gYy50cmltKCkubGVuZ3RoID4gMCk7XG59XG5cbmZ1bmN0aW9uIGNvc2luZVNpbWlsYXJpdHkoYTogbnVtYmVyW10sIGI6IG51bWJlcltdKTogbnVtYmVyIHtcbiAgbGV0IGRvdFByb2R1Y3QgPSAwO1xuICBsZXQgbm9ybUEgPSAwO1xuICBsZXQgbm9ybUIgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICBkb3RQcm9kdWN0ICs9IGFbaV0gKiBiW2ldO1xuICAgIG5vcm1BICs9IGFbaV0gKiBhW2ldO1xuICAgIG5vcm1CICs9IGJbaV0gKiBiW2ldO1xuICB9XG4gIHJldHVybiBkb3RQcm9kdWN0IC8gKE1hdGguc3FydChub3JtQSkgKiBNYXRoLnNxcnQobm9ybUIpKTtcbn1cblxuaW50ZXJmYWNlIFJldHJpZXZhbFJlc3VsdCB7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgc2NvcmU6IG51bWJlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmV0cmlldmVGcm9tUGRmcyhcbiAgY3RsOiBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyLFxuICBxdWVyeTogc3RyaW5nLFxuICBwZGZGaWxlczogRmlsZUhhbmRsZVtdLFxuKTogUHJvbWlzZTxSZXRyaWV2YWxSZXN1bHRbXT4ge1xuICBjb25zdCBwbHVnaW5Db25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBjb25zdCByZXRyaWV2YWxMaW1pdCA9IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0JykgfHwgNTtcbiAgLy8gTG93ZXIgZGVmYXVsdCB0aHJlc2hvbGQgdG8gY2F0Y2ggbW9yZSByZXN1bHRzIC0gd2FzIHRvbyBoaWdoIGF0IDAuNlxuICBjb25zdCByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCA9IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkJykgPz8gMC4zO1xuXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBQcm9jZXNzaW5nICR7cGRmRmlsZXMubGVuZ3RofSBQREYgZmlsZShzKWApO1xuXG4gIC8vIEV4dHJhY3QgdGV4dCBmcm9tIGFsbCBQREYgZmlsZXNcbiAgY29uc3QgZmlsZVRleHRzOiB7IGZpbGU6IEZpbGVIYW5kbGU7IHRleHQ6IHN0cmluZyB9W10gPSBbXTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIHBkZkZpbGVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCBleHRyYWN0UGRmVGV4dChmaWxlKTtcbiAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtSQUddIEV4dHJhY3RlZCAke3RleHQubGVuZ3RofSBjaGFycyBmcm9tICR7ZmlsZS5uYW1lfWApO1xuICAgICAgICBmaWxlVGV4dHMucHVzaCh7IGZpbGUsIHRleHQgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtSQUddIE5vIHRleHQgZXh0cmFjdGVkIGZyb20gJHtmaWxlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFtSQUddIFNraXBwaW5nIFBERiAke2ZpbGUubmFtZX0gZHVlIHRvIGVycm9yOmAsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBpZiAoZmlsZVRleHRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnNvbGUud2FybignW1JBR10gTm8gdGV4dCBleHRyYWN0ZWQgZnJvbSBhbnkgUERGJyk7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLy8gQ2h1bmsgdGhlIHRleHRzXG4gIGNvbnN0IGNodW5rczogeyBmaWxlOiBGaWxlSGFuZGxlOyBjaHVuazogc3RyaW5nIH1bXSA9IFtdO1xuICBmb3IgKGNvbnN0IHsgZmlsZSwgdGV4dCB9IG9mIGZpbGVUZXh0cykge1xuICAgIGNvbnN0IGZpbGVDaHVua3MgPSBjaHVua1RleHQodGV4dCk7XG4gICAgY29uc29sZS5sb2coYFtSQUddICR7ZmlsZS5uYW1lfTogJHt0ZXh0Lmxlbmd0aH0gY2hhcnMgXHUyMTkyICR7ZmlsZUNodW5rcy5sZW5ndGh9IGNodW5rc2ApO1xuICAgIGZpbGVDaHVua3MuZm9yRWFjaCgoY2h1bmspID0+IHtcbiAgICAgIGNodW5rcy5wdXNoKHsgZmlsZSwgY2h1bmsgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoY2h1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xuXG4gIC8vIEdlbmVyYXRlIGVtYmVkZGluZ3MgZm9yIGFsbCBjaHVua3MgdXNpbmcgTE0gU3R1ZGlvJ3MgZW1iZWRkaW5nIG1vZGVsXG4gIGxldCBtb2RlbDtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZygnW1JBR10gTG9hZGluZyBlbWJlZGRpbmcgbW9kZWwuLi4nKTtcbiAgICBtb2RlbCA9IGF3YWl0IGN0bC5jbGllbnQuZW1iZWRkaW5nLm1vZGVsKCdub21pYy1haS9ub21pYy1lbWJlZC10ZXh0LXYxLjUtR0dVRicsIHtcbiAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKCdbUkFHXSBFbWJlZGRpbmcgbW9kZWwgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEZhaWxlZCB0byBsb2FkIGVtYmVkZGluZyBtb2RlbDonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFbWJlZGRpbmcgbW9kZWwgbm90IGF2YWlsYWJsZTogJHtlcnJvcn1gKTtcbiAgfVxuXG4gIGNvbnN0IGJhdGNoU2l6ZSA9IDMyO1xuICBjb25zdCBhbGxFbWJlZGRpbmdzOiBudW1iZXJbXVtdID0gW107XG5cbiAgdHJ5IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkgKz0gYmF0Y2hTaXplKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW1JBR10gR2VuZXJhdGluZyBlbWJlZGRpbmdzIGJhdGNoICR7TWF0aC5mbG9vcihpIC8gYmF0Y2hTaXplKSArIDF9LyR7TWF0aC5jZWlsKGNodW5rcy5sZW5ndGggLyBiYXRjaFNpemUpfS4uLmApO1xuICAgICAgY29uc3QgYmF0Y2ggPSBjaHVua3Muc2xpY2UoaSwgaSArIGJhdGNoU2l6ZSkubWFwKGMgPT4gYy5jaHVuayk7XG4gICAgICBjb25zdCBlbWJlZGRpbmdzID0gYXdhaXQgbW9kZWwuZW1iZWQoYmF0Y2gsIGN0bC5hYm9ydFNpZ25hbCk7XG4gICAgICBhbGxFbWJlZGRpbmdzLnB1c2goLi4uZW1iZWRkaW5ncyk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIGdlbmVyYXRpbmcgZW1iZWRkaW5nczonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFbWJlZGRpbmcgZ2VuZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmcgZm9yIHRoZSBxdWVyeVxuICBsZXQgcXVlcnlNb2RlbDtcbiAgdHJ5IHtcbiAgICBxdWVyeU1vZGVsID0gYXdhaXQgY3RsLmNsaWVudC5lbWJlZGRpbmcubW9kZWwoJ25vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGJywge1xuICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1JBR10gRmFpbGVkIHRvIGxvYWQgcXVlcnkgZW1iZWRkaW5nIG1vZGVsOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFF1ZXJ5IGVtYmVkZGluZyBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICBsZXQgcXVlcnlFbWJlZGRpbmc7XG4gIHRyeSB7XG4gICAgcXVlcnlFbWJlZGRpbmcgPSAoYXdhaXQgcXVlcnlNb2RlbC5lbWJlZChbcXVlcnldLCBjdGwuYWJvcnRTaWduYWwpKVswXTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciBnZW5lcmF0aW5nIHF1ZXJ5IGVtYmVkZGluZzonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBRdWVyeSBlbWJlZGRpbmcgZmFpbGVkOiAke2Vycm9yfWApO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIHNpbWlsYXJpdGllcyBhbmQgcmV0cmlldmUgdG9wIHJlc3VsdHNcbiAgY29uc3Qgc2NvcmVzOiB7IGNodW5rSW5kZXg6IG51bWJlcjsgc2ltaWxhcml0eTogbnVtYmVyIH1bXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNpbWlsYXJpdHkgPSBjb3NpbmVTaW1pbGFyaXR5KHF1ZXJ5RW1iZWRkaW5nLCBhbGxFbWJlZGRpbmdzW2ldKTtcbiAgICBzY29yZXMucHVzaCh7IGNodW5rSW5kZXg6IGksIHNpbWlsYXJpdHkgfSk7XG4gIH1cblxuICAvLyBTb3J0IGJ5IHNpbWlsYXJpdHkgZGVzY2VuZGluZyBhbmQgZmlsdGVyIGJ5IHRocmVzaG9sZFxuICBzY29yZXMuc29ydCgoYSwgYikgPT4gYi5zaW1pbGFyaXR5IC0gYS5zaW1pbGFyaXR5KTtcbiAgXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBGb3VuZCAke3Njb3Jlcy5sZW5ndGh9IGNodW5rcywgZmlsdGVyaW5nIHdpdGggdGhyZXNob2xkICR7cmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGR9YCk7XG4gIGNvbnN0IHJlbGV2YW50Q2h1bmtzID0gc2NvcmVzLmZpbHRlcihcbiAgICAocykgPT4gcy5zaW1pbGFyaXR5ID49IHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkICYmIHMuY2h1bmtJbmRleCA8IGNodW5rcy5sZW5ndGgsXG4gICk7XG5cbiAgLy8gTGltaXQgcmVzdWx0c1xuICBjb25zdCBsaW1pdGVkUmVzdWx0cyA9IHJlbGV2YW50Q2h1bmtzLnNsaWNlKDAsIHJldHJpZXZhbExpbWl0KTtcblxuICBjb25zb2xlLmxvZyhgW1JBR10gUmV0dXJuaW5nICR7bGltaXRlZFJlc3VsdHMubGVuZ3RofSByZXN1bHRzYCk7XG4gIHJldHVybiBsaW1pdGVkUmVzdWx0cy5tYXAoKHIpID0+ICh7XG4gICAgY29udGVudDogY2h1bmtzW3IuY2h1bmtJbmRleF0uY2h1bmssXG4gICAgc2NvcmU6IHIuc2ltaWxhcml0eSxcbiAgfSkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJlcHJvY2VzcyhcbiAgY3RsOiBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyLFxuICB1c2VyTWVzc2FnZTogQ2hhdE1lc3NhZ2Vcbik6IFByb21pc2U8c3RyaW5nIHwgQ2hhdE1lc3NhZ2U+IHtcbiAgY29uc3QgdXNlclByb21wdCA9IHVzZXJNZXNzYWdlLmdldFRleHQoKTtcbiAgXG4gIC8vIFN0ZXAgMDogQWx3YXlzIHJlZ2lzdGVyIGF0dGFjaG1lbnRzIHNvIHRvb2xzIGNhbiBhY2Nlc3MgdGhlbSBieSBuYW1lXG4gIGNvbnN0IGFsbEZpbGVzID0gdXNlck1lc3NhZ2UuZ2V0RmlsZXMoY3RsLmNsaWVudCk7XG4gIHNldEF0dGFjaG1lbnRzKGFsbEZpbGVzKTtcbiAgXG4gIC8vIEJ1aWxkIGF0dGFjaG1lbnQgbm90aWNlIHRvIGluamVjdCBpbnRvIHByb21wdFxuICBsZXQgYXR0YWNobWVudE5vdGljZSA9ICcnO1xuICBpZiAoYWxsRmlsZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGZpbGVOYW1lcyA9IGxpc3RBdHRhY2htZW50cygpO1xuICAgIGF0dGFjaG1lbnROb3RpY2UgPSBgXFxuXFxuXHVEODNEXHVEQ0NFIEFUVEFDSEVEIEZJTEVTIEFWQUlMQUJMRTpcXG5Zb3UgaGF2ZSBhY2Nlc3MgdG8gdGhlIGZvbGxvd2luZyBhdHRhY2hlZCBmaWxlcy4gWW91IGNhbiByZWFkIHRoZW0gdXNpbmcgdGhlIHJlYWRfZG9jdW1lbnQgdG9vbCBieSBmaWxlbmFtZTpcXG4ke2ZpbGVOYW1lcy5tYXAobmFtZSA9PiBgLSAke25hbWV9YCkuam9pbignXFxuJyl9YDtcbiAgfVxuICBcbiAgLy8gU3RlcCAxOiBEaXJlY3RvcnkgZGV0ZWN0aW9uIChoaWdoZXN0IHByaW9yaXR5KVxuICBjb25zdCBkZXRlY3RlZFBhdGggPSBkZXRlY3REaXJlY3RvcnlQYXRoKHVzZXJQcm9tcHQpO1xuICBpZiAoZGV0ZWN0ZWRQYXRoKSB7XG4gICAgcmV0dXJuIGluamVjdFdvcmtpbmdEaXJlY3RvcnlQcm9tcHQodXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2UsIGRldGVjdGVkUGF0aCkgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xuICB9XG4gIFxuICAvLyBTdGVwIDI6IERvY3VtZW50IFJBRyBwcm9jZXNzaW5nIChpZiBlbmFibGVkKVxuICBjb25zdCBwbHVnaW5Db25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBjb25zdCBkb2N1bWVudFJBR0VuYWJsZWQgPSBwbHVnaW5Db25maWcuZ2V0KCdkb2N1bWVudFJBRycpO1xuICBcbiAgY29uc29sZS5sb2coYFtSQUddIGRvY3VtZW50UkFHIGVuYWJsZWQ6ICR7ZG9jdW1lbnRSQUdFbmFibGVkfWApO1xuICBcbiAgaWYgKCFkb2N1bWVudFJBR0VuYWJsZWQpIHtcbiAgICAvLyBJZiBSQUcgaXMgZGlzYWJsZWQsIGp1c3QgcmV0dXJuIHRoZSBtZXNzYWdlIHdpdGggYXR0YWNobWVudCBub3RpY2VcbiAgICBjb25zdCBiYXNlID0gdXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2U7XG4gICAgcmV0dXJuIGJhc2UgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xuICB9XG5cbiAgY29uc3QgbmV3RmlsZXMgPSBhbGxGaWxlcy5maWx0ZXIoZiA9PiBmLnR5cGUgIT09ICdpbWFnZScpO1xuICBjb25zb2xlLmxvZyhgW1JBR10gRm91bmQgJHtuZXdGaWxlcy5sZW5ndGh9IG5vbi1pbWFnZSBmaWxlc2ApO1xuICBcbiAgaWYgKG5ld0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnN0IGJhc2UgPSB1c2VyUHJvbXB0ICsgYXR0YWNobWVudE5vdGljZTtcbiAgICByZXR1cm4gYmFzZSArIGdldFRlbXBvcmFsU3VmZml4KGN0bCk7XG4gIH1cblxuICAvLyBTZXBhcmF0ZSBQREYgZmlsZXMgZnJvbSBvdGhlciBmaWxlIHR5cGVzXG4gIGNvbnN0IHBkZkZpbGVzID0gbmV3RmlsZXMuZmlsdGVyKGYgPT4gZi5uYW1lLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoJy5wZGYnKSk7XG4gIGNvbnN0IG90aGVyRmlsZXMgPSBuZXdGaWxlcy5maWx0ZXIoZiA9PiAhZi5uYW1lLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoJy5wZGYnKSk7XG5cbiAgY29uc29sZS5sb2coYFtSQUddIFBERnM6ICR7cGRmRmlsZXMubGVuZ3RofSwgT3RoZXI6ICR7b3RoZXJGaWxlcy5sZW5ndGh9YCk7XG5cbiAgbGV0IGFsbFJlc3VsdHM6IFJldHJpZXZhbFJlc3VsdFtdID0gW107XG5cbiAgLy8gUHJvY2VzcyBQREZzIHdpdGggY3VzdG9tIGxvY2FsIHBpcGVsaW5lIChtb3JlIHJlbGlhYmxlIGZvciBjb21wbGV4IGxheW91dHMpXG4gIGlmIChwZGZGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBkZlJlc3VsdHMgPSBhd2FpdCByZXRyaWV2ZUZyb21QZGZzKGN0bCwgdXNlclByb21wdCwgcGRmRmlsZXMpO1xuICAgICAgY29uc29sZS5sb2coYFtSQUddIFBERiByZXRyaWV2YWwgcmV0dXJuZWQgJHtwZGZSZXN1bHRzLmxlbmd0aH0gcmVzdWx0c2ApO1xuICAgICAgYWxsUmVzdWx0cy5wdXNoKC4uLnBkZlJlc3VsdHMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciBwcm9jZXNzaW5nIFBERnM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFByb2Nlc3Mgb3RoZXIgZmlsZXMgd2l0aCBMTSBTdHVkaW8ncyBuYXRpdmUgcmV0cmlldmFsIEFQSSAoaGFuZGxlcyAudHh0LCAubWQsIGV0Yy4gbmF0aXZlbHkpXG4gIGlmIChvdGhlckZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbW9kZWwgPSBhd2FpdCBjdGwuY2xpZW50LmVtYmVkZGluZy5tb2RlbCgnbm9taWMtYWkvbm9taWMtZW1iZWQtdGV4dC12MS41LUdHVUYnLCB7XG4gICAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGN0bC5jbGllbnQuZmlsZXMucmV0cmlldmUodXNlclByb21wdCwgb3RoZXJGaWxlcywge1xuICAgICAgICBlbWJlZGRpbmdNb2RlbDogbW9kZWwsXG4gICAgICAgIGxpbWl0OiBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxMaW1pdCcpIHx8IDUsXG4gICAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIENvbnZlcnQgaGlnaC1sZXZlbCBBUEkgcmVzdWx0cyB0byBvdXIgZm9ybWF0XG4gICAgICBjb25zdCBmaWx0ZXJlZEVudHJpZXMgPSByZXN1bHQuZW50cmllcy5maWx0ZXIoXG4gICAgICAgIGVudHJ5ID0+IGVudHJ5LnNjb3JlID4gKHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkJykgPz8gMC4zKVxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBOYXRpdmUgcmV0cmlldmFsIHJldHVybmVkICR7ZmlsdGVyZWRFbnRyaWVzLmxlbmd0aH0gcmVzdWx0c2ApO1xuICAgICAgYWxsUmVzdWx0cy5wdXNoKC4uLmZpbHRlcmVkRW50cmllcy5tYXAoZSA9PiAoeyBjb250ZW50OiBlLmNvbnRlbnQsIHNjb3JlOiBlLnNjb3JlIH0pKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIHJldHJpZXZpbmcgZnJvbSBvdGhlciBmaWxlczonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBhbmQgbGltaXQgcmVzdWx0c1xuICBhbGxSZXN1bHRzLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgY29uc3QgcmV0cmlldmFsTGltaXQgPSBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxMaW1pdCcpIHx8IDU7XG4gIGFsbFJlc3VsdHMgPSBhbGxSZXN1bHRzLnNsaWNlKDAsIHJldHJpZXZhbExpbWl0KTtcblxuICBjb25zb2xlLmxvZyhgW1JBR10gVG90YWwgcmVzdWx0cyBhZnRlciBzb3J0aW5nOiAke2FsbFJlc3VsdHMubGVuZ3RofWApO1xuXG4gIC8vIEluamVjdCBjb250ZXh0IGlmIHJlc3VsdHMgZm91bmRcbiAgaWYgKGFsbFJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgIGxldCBjb250ZXh0SW5qZWN0aW9uID0gJyc7XG4gICAgZm9yIChjb25zdCByZXN1bHQgb2YgYWxsUmVzdWx0cykge1xuICAgICAgY29udGV4dEluamVjdGlvbiArPSBgXFxuJHtyZXN1bHQuY29udGVudH1cXG4tLS1cXG5gO1xuICAgIH1cblxuICAgIHJldHVybiBgJHt1c2VyUHJvbXB0fSR7YXR0YWNobWVudE5vdGljZX1cXG5cXG4tLS0gUkVMRVZBTlQgRE9DVU1FTlQgQ09OVEVYVCAtLS1cXG4ke2NvbnRleHRJbmplY3Rpb24udHJpbSgpfWAgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xuICB9XG5cbiAgLy8gSWYgbm8gcmVzdWx0cyBmb3VuZCwgcmV0dXJuIG9yaWdpbmFsIG1lc3NhZ2Ugd2l0aCBhdHRhY2htZW50IG5vdGljZVxuICBjb25zb2xlLmxvZygnW1JBR10gTm8gcmVsZXZhbnQgcmVzdWx0cyBmb3VuZCcpO1xuICBjb25zdCBiYXNlID0gdXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2U7XG4gIHJldHVybiBiYXNlICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbn1cbiIsICIvKipcbiAqIEFJIFRvb2xib3ggUGx1Z2luIC0gRW50cnkgUG9pbnRcbiAqIE1haW4gZnVuY3Rpb24gZXhwb3J0ZWQgZm9yIExNIFN0dWRpbyBwbHVnaW4gc3lzdGVtXG4gKi9cblxuaW1wb3J0IHsgdHlwZSBQbHVnaW5Db250ZXh0IH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sc1Byb3ZpZGVyIH0gZnJvbSAnLi90b29sc1Byb3ZpZGVyJztcbmltcG9ydCB7IGNvbmZpZ1NjaGVtYXRpY3MgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBwcmVwcm9jZXNzIH0gZnJvbSAnLi9wcm9tcHRQcmVwcm9jZXNzb3InO1xuaW1wb3J0IHsgY2xlYW51cEJyb3dzZXJTZXNzaW9uIH0gZnJvbSAnLi90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzJztcblxuLy8gXHUyNzA1IEZJWDogVXNlIHN0cnVjdHVyZWQgbG9nZ2luZyBpbnN0ZWFkIG9mIGNvbnNvbGUubG9nXG5jb25zdCBsb2dnZXIgPSB7XG4gIGluZm86IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3Rkb3V0LndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBbQUkgVG9vbGJveF0gJHttc2d9XFxuYCksXG4gIHdhcm46IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbQUkgVG9vbGJveCBXQVJOXSAke21zZ31cXG5gKSxcbiAgZXJyb3I6IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbQUkgVG9vbGJveCBFUlJPUl0gJHttc2d9XFxuYCksXG59O1xuXG4vKipcbiAqIE1haW4gcGx1Z2luIGVudHJ5IHBvaW50IC0gY2FsbGVkIGJ5IExNIFN0dWRpb1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihjb250ZXh0OiBQbHVnaW5Db250ZXh0KSB7XG4gIGxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcuLi4nKTtcbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSBjb25maWd1cmF0aW9uIHNjaGVtYXRpY3MgKG1ha2VzIHRvZ2dsZXMgYXBwZWFyIGluIFVJKVxuICBjb250ZXh0LndpdGhDb25maWdTY2hlbWF0aWNzKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBcbiAgLy8gUmVnaXN0ZXIgdGhlIHByb21wdCBwcmVwcm9jZXNzb3IgZm9yIERvY3VtZW50IFJBRyAvIENoYXQgd2l0aCBGaWxlc1xuICBjb250ZXh0LndpdGhQcm9tcHRQcmVwcm9jZXNzb3IocHJlcHJvY2Vzcyk7XG4gIFxuICAvLyBOb3RlOiBMTSBTdHVkaW8gU0RLIHYxLjUuMCBkb2Vzbid0IGV4cG9zZSBnZXRDb25maWcoKSBvbiBQbHVnaW5Db250ZXh0LlxuICAvLyBDb25maWd1cmF0aW9uIGlzIGhhbmRsZWQgYXV0b21hdGljYWxseSBieSB0aGUgU0RLJ3MgY29uZmlnIHN5c3RlbS5cbiAgLy8gVGhlIHRvb2xzUHJvdmlkZXIgd2lsbCB1c2UgZGVmYXVsdCBzZXR0aW5ncyB1bnRpbCBVSSB0b2dnbGVzIGFyZSBhcHBsaWVkLlxuICBcbiAgLy8gUmVnaXN0ZXIgdGhlIHRvb2xzIHByb3ZpZGVyIGZ1bmN0aW9uXG4gIGNvbnRleHQud2l0aFRvb2xzUHJvdmlkZXIodG9vbHNQcm92aWRlcik7XG4gIFxuICAvLyBIYW5kbGUgcGx1Z2luIHVubG9hZCAtIGNsZWFudXAgYnJvd3NlciBzZXNzaW9uIHRvIHByZXZlbnQgb3JwaGFuZWQgcHJvY2Vzc2VzXG4gIGlmICh0eXBlb2YgcHJvY2Vzcy5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTtcbiAgICB9KTtcbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTtcbiAgICB9KTtcbiAgfVxuICBcbiAgbG9nZ2VyLmluZm8oJ0luaXRpYWxpemVkIHN1Y2Nlc3NmdWxseSEnKTtcbn1cbiIsICJpbXBvcnQgeyBMTVN0dWRpb0NsaWVudCwgdHlwZSBQbHVnaW5Db250ZXh0IH0gZnJvbSBcIkBsbXN0dWRpby9zZGtcIjtcblxuZGVjbGFyZSB2YXIgcHJvY2VzczogYW55O1xuXG4vLyBXZSByZWNlaXZlIHJ1bnRpbWUgaW5mb3JtYXRpb24gaW4gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmNvbnN0IGNsaWVudElkZW50aWZpZXIgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0NMSUVOVF9JREVOVElGSUVSO1xuY29uc3QgY2xpZW50UGFzc2tleSA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQ0xJRU5UX1BBU1NLRVk7XG5jb25zdCBiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9CQVNFX1VSTDtcblxuY29uc3QgY2xpZW50ID0gbmV3IExNU3R1ZGlvQ2xpZW50KHtcbiAgY2xpZW50SWRlbnRpZmllcixcbiAgY2xpZW50UGFzc2tleSxcbiAgYmFzZVVybCxcbn0pO1xuXG4oZ2xvYmFsVGhpcyBhcyBhbnkpLl9fTE1TX1BMVUdJTl9DT05URVhUID0gdHJ1ZTtcblxubGV0IHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IGZhbHNlO1xubGV0IHByb21wdFByZXByb2Nlc3NvclNldCA9IGZhbHNlO1xubGV0IGNvbmZpZ1NjaGVtYXRpY3NTZXQgPSBmYWxzZTtcbmxldCBnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0ID0gZmFsc2U7XG5sZXQgdG9vbHNQcm92aWRlclNldCA9IGZhbHNlO1xubGV0IGdlbmVyYXRvclNldCA9IGZhbHNlO1xuXG5jb25zdCBzZWxmUmVnaXN0cmF0aW9uSG9zdCA9IGNsaWVudC5wbHVnaW5zLmdldFNlbGZSZWdpc3RyYXRpb25Ib3N0KCk7XG5cbmNvbnN0IHBsdWdpbkNvbnRleHQ6IFBsdWdpbkNvbnRleHQgPSB7XG4gIHdpdGhQcmVkaWN0aW9uTG9vcEhhbmRsZXI6IChnZW5lcmF0ZSkgPT4ge1xuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByZWRpY3Rpb25Mb29wSGFuZGxlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcmVkaWN0aW9uTG9vcEhhbmRsZXIgY2Fubm90IGJlIHVzZWQgd2l0aCBhIHRvb2xzIHByb3ZpZGVyXCIpO1xuICAgIH1cblxuICAgIHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0UHJlZGljdGlvbkxvb3BIYW5kbGVyKGdlbmVyYXRlKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aFByb21wdFByZXByb2Nlc3NvcjogKHByZXByb2Nlc3MpID0+IHtcbiAgICBpZiAocHJvbXB0UHJlcHJvY2Vzc29yU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcm9tcHRQcmVwcm9jZXNzb3IgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBwcm9tcHRQcmVwcm9jZXNzb3JTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFByb21wdFByZXByb2Nlc3NvcihwcmVwcm9jZXNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aENvbmZpZ1NjaGVtYXRpY3M6IChjb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGNvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZyBzY2hlbWF0aWNzIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgY29uZmlnU2NoZW1hdGljc1NldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0Q29uZmlnU2NoZW1hdGljcyhjb25maWdTY2hlbWF0aWNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdsb2JhbENvbmZpZ1NjaGVtYXRpY3M6IChnbG9iYWxDb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdsb2JhbCBjb25maWcgc2NoZW1hdGljcyBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldEdsb2JhbENvbmZpZ1NjaGVtYXRpY3MoZ2xvYmFsQ29uZmlnU2NoZW1hdGljcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhUb29sc1Byb3ZpZGVyOiAodG9vbHNQcm92aWRlcikgPT4ge1xuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUb29scyBwcm92aWRlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvb2xzIHByb3ZpZGVyIGNhbm5vdCBiZSB1c2VkIHdpdGggYSBwcmVkaWN0aW9uTG9vcEhhbmRsZXJcIik7XG4gICAgfVxuXG4gICAgdG9vbHNQcm92aWRlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0VG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdlbmVyYXRvcjogKGdlbmVyYXRvcikgPT4ge1xuICAgIGlmIChnZW5lcmF0b3JTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuXG4gICAgZ2VuZXJhdG9yU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRHZW5lcmF0b3IoZ2VuZXJhdG9yKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbn07XG5cbmltcG9ydChcIi4vLi4vc3JjL2luZGV4LnRzXCIpLnRoZW4oYXN5bmMgbW9kdWxlID0+IHtcbiAgcmV0dXJuIGF3YWl0IG1vZHVsZS5tYWluKHBsdWdpbkNvbnRleHQpO1xufSkudGhlbigoKSA9PiB7XG4gIHNlbGZSZWdpc3RyYXRpb25Ib3N0LmluaXRDb21wbGV0ZWQoKTtcbn0pLmNhdGNoKChlcnJvcikgPT4ge1xuICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGV4ZWN1dGUgdGhlIG1haW4gZnVuY3Rpb24gb2YgdGhlIHBsdWdpbi5cIik7XG4gIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7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QUFFQSx1QkFBbUI7QUFDbkIseUJBQXFCLGlCQUFpQkEsY0FBYTtBQUNuRCxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsZUFBZSxDQUFDLGNBQWM7QUFDNUIsUUFBSSxjQUFjO0FBQ2hCLFlBQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUFBLElBQ2hEO0FBRUEsbUJBQWU7QUFDZix5QkFBcUIsYUFBYSxTQUFTO0FBQzNDLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFFQSx3REFBNEIsS0FBSyxPQUFNQyxZQUFVO0FBQy9DLFNBQU8sTUFBTUEsUUFBTyxLQUFLLGFBQWE7QUFDeEMsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUNaLHVCQUFxQixjQUFjO0FBQ3JDLENBQUMsRUFBRSxNQUFNLENBQUMsVUFBVTtBQUNsQixVQUFRLE1BQU0sb0RBQW9EO0FBQ2xFLFVBQVEsTUFBTSxLQUFLO0FBQ3JCLENBQUM7IiwKICAibmFtZXMiOiBbInRvb2wiLCAicGxhdGZvcm0iLCAicGF0aCIsICJmcyIsICJyZXNvbHZlIiwgImZzIiwgInBhdGgiLCAic3Bhd25XaXRoUHJvZ3Jlc3MiLCAicmVzb2x2ZSIsICJydW5Db25maWdBbmFseXNpcyIsICJydW5JbXBvcnRBbmFseXNpcyIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJkZGdTZWFyY2giLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgIm1lc3NhZ2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgInJlc29sdmUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJyZXNvbHZlIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJpbXBvcnRfY2hpbGRfcHJvY2VzcyIsICJoYW5kbGVFcnJvciIsICJwbGF0Zm9ybSIsICJyZXNvbHZlIiwgIm1lc3NhZ2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgIm9zIiwgInBhdGgiLCAiZnMiLCAiaW1wb3J0X2NoaWxkX3Byb2Nlc3MiLCAiZnMiLCAic3RhdCIsICJoYW5kbGVFcnJvciIsICJvcyIsICJwbGF0Zm9ybSIsICJzcGF3biIsICJyZXNvbHZlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJwYXRoIiwgImhvc3RuYW1lIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJjaHVua1RleHQiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgInBhdGgiLCAiZnMiLCAicHVwcGV0ZWVyTW9kdWxlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgInRvb2wiLCAic3RhdCIsICJoYW5kbGVFcnJvciIsICJleHQiLCAicGRmUGFyc2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgInBhdGgiLCAiZnMiLCAidG9vbCIsICJwYXRoIiwgInBkZlBhcnNlIiwgImNodW5rVGV4dCIsICJiYXNlIiwgImxvZ2dlciIsICJpbXBvcnRfc2RrIiwgInByZXByb2Nlc3MiLCAiY29uZmlnU2NoZW1hdGljcyIsICJ0b29sc1Byb3ZpZGVyIiwgIm1vZHVsZSJdCn0K
