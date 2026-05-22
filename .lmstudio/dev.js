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

// src/config.ts
function isToolEnabled(config, category) {
  return config[category] === true;
}
function isExecutionToolEnabled(config, tool14) {
  switch (tool14) {
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
      documentRAG: import_zod.z.boolean().default(false).describe("Enable file indexing and semantic search for chat"),
      retrievalLimit: import_zod.z.number().min(1).max(20).default(5).describe("Maximum number of relevant chunks to retrieve"),
      retrievalAffinityThreshold: import_zod.z.number().min(0).max(1).default(0.5).describe("Minimum similarity score for a chunk to be considered relevant (0-1)"),
      // Execution tools — individual toggles (granular control)
      executionJavaScript: import_zod.z.boolean().default(false).describe("Allow run_javascript tool"),
      executionPython: import_zod.z.boolean().default(false).describe("Allow run_python tool"),
      executionTerminal: import_zod.z.boolean().default(false).describe("Allow run_in_terminal tool"),
      executionShell: import_zod.z.boolean().default(false).describe("Allow execute_command tool"),
      // ── Web Search Settings ───────────────────────────────────────
      searchFallbackChain: import_zod.z.enum(["ddg-api", "ddg-fetch", "google", "bing"]).default("ddg-api").describe("Primary search engine (auto-fallback to others)"),
      maxSearchResults: import_zod.z.number().min(1).max(50).default(10),
      safesearch: import_zod.z.enum(["0", "1", "2"]).default("1"),
      // ── Browser Settings ──────────────────────────────────────────
      browserTimeout: import_zod.z.number().min(1e3).max(3e4).default(5e3),
      headlessMode: import_zod.z.boolean().default(true),
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
      notificationsEnabled: import_zod.z.boolean().default(true)
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
      documentRAG: false,
      retrievalLimit: 5,
      retrievalAffinityThreshold: 0.5,
      // Execution tools — all disabled by default (dangerous!)
      executionJavaScript: false,
      executionPython: false,
      executionTerminal: false,
      executionShell: false,
      searchFallbackChain: "ddg-api",
      maxSearchResults: 10,
      safesearch: "1",
      browserTimeout: 5e3,
      headlessMode: true,
      gitAutoCommit: false,
      defaultBranch: "main",
      pathValidationEnabled: true,
      binaryFileDetection: true,
      regexReDoSProtection: true,
      maxRegexLength: 500,
      statePersistenceEnabled: true,
      stateMaxSize: 10240,
      language: "en",
      notificationsEnabled: true
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
    }, DEFAULT_CONFIG.language).field("notificationsEnabled", "boolean", { displayName: "\u{1F514} Desktop Notifications", hint: "Show system notifications" }, DEFAULT_CONFIG.notificationsEnabled).build();
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
  "src/workingDir.ts"() {
    "use strict";
    path2 = __toESM(require("path"));
    fs2 = __toESM(require("fs"));
    BASE_DIR = path2.join(__dirname, "..");
    currentWorkingDir = BASE_DIR;
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
        await new Promise((resolve3) => setTimeout(resolve3, delayMs));
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
    name: "read_document",
    description: "Read content from PDF or DOCX files.",
    parameters: {
      file_path: import_zod2.z.string().describe("Path to the PDF or DOCX file")
    },
    implementation: async ({ file_path }) => {
      try {
        if (file_path.includes("..")) {
          return { success: false, error: "Invalid path: directory traversal detected" };
        }
        const fullPath = path4.resolve(file_path);
        if (!fs4.existsSync(fullPath)) {
          return { success: false, error: `File does not exist: ${file_path}` };
        }
        const ext = path4.extname(file_path).toLowerCase();
        if (ext === ".pdf") {
          const pdfParseModule = await import("pdf-parse");
          const dataBuffer = fs4.readFileSync(fullPath);
          const pdfData = await pdfParseModule.default(dataBuffer);
          return {
            success: true,
            data: {
              file: fullPath,
              // ✅ FULL PATH
              type: "PDF",
              pages: pdfData.numpages,
              content: pdfData.text.substring(0, 1e4)
              // Limit output size
            }
          };
        } else if (ext === ".docx") {
          const mammothModule = await import("mammoth");
          const result = await mammothModule.default.extractRawText({ buffer: fs4.readFileSync(fullPath) });
          return {
            success: true,
            data: {
              file: fullPath,
              // ✅ FULL PATH
              type: "DOCX",
              content: result.value.substring(0, 1e4)
              // Limit output size
            }
          };
        } else {
          return { success: false, error: `Unsupported document format: ${ext}. Only PDF and DOCX are supported.` };
        }
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
          return new Promise((resolve3) => {
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
              resolve3({ success: false, stderr: `Timeout after ${timeoutMs}ms` });
            }, timeoutMs);
            proc.on("close", () => {
              clearTimeout(timerId);
              resolve3({ success: true, stdout, stderr });
            });
            proc.on("error", (err) => {
              clearTimeout(timerId);
              resolve3({ success: false, stderr: err.message });
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
function getRepoName() {
  const repoMatch = process.env.GITHUB_REPOSITORY?.match(/github\.com[:/]([^/]+\/[^/]+)\.git$/);
  return repoMatch?.[1] || null;
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
        const git = createGit();
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
        const git = createGit();
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
        const git = createGit();
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
        const git = createGit();
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
        const git = createGit();
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
        const git = createGit();
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
          return { success: false, error: "GITHUB_TOKEN environment variable is not set" };
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
        const repoName = getRepoName();
        if (!repoName) throw new Error("Could not determine repository name from GITHUB_REPOSITORY env");
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
        const repoName = getRepoName();
        if (!repoName) throw new Error("Could not determine repository name");
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
        const repoName = getRepoName();
        if (!repoName) throw new Error("Could not determine repository name");
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
        const repoName = getRepoName();
        if (!repoName) throw new Error("Could not determine repository name");
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
        const repoName = getRepoName();
        if (!repoName) throw new Error("Could not determine repository name");
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
        const repoName = getRepoName();
        if (!repoName) throw new Error("Could not determine repository name");
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
        const git = createGit();
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
              await new Promise((resolve3) => setTimeout(resolve3, 1e3 * this.retryCount));
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
async function safeSpawn(exe, args, timeoutMs, input) {
  return new Promise((resolve3) => {
    const proc = (0, import_child_process2.spawn)(exe, args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: timeoutMs,
      cwd: getWorkingDir()
      // Execute in the current working directory
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
      resolve3({ success: false, error: "Execution timed out" });
    }, timeoutMs);
    proc.on("close", () => {
      clearTimeout(timerId);
      resolve3({ success: true, data: { stdout: stdout.trim(), stderr: stderr.trim() } });
    });
    proc.on("error", (err) => {
      clearTimeout(timerId);
      resolve3({ success: false, error: `Spawn failed: ${err.message}` });
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
    description: "Execute a command in the current working directory. Uses safe argument parsing (no shell interpretation).",
    parameters: {
      command: import_zod8.z.string().describe("The shell command to execute"),
      timeout_seconds: import_zod8.z.number().min(0.1).max(60).optional().default(5).describe("Timeout in seconds (max 60)"),
      input: import_zod8.z.string().optional().describe("Input text to pipe to the command's stdin.")
    },
    implementation: async ({ command, timeout_seconds, input }) => {
      try {
        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
        }
        const parsed = parseCommand(command);
        if (!parsed.exe) {
          return { success: false, error: "Empty command" };
        }
        const timeoutMs = (timeout_seconds || 5) * 1e3;
        const result = await safeSpawn(parsed.exe, parsed.args, timeoutMs, input);
        if (!result.success) {
          return { success: false, error: result.error };
        }
        if (result.data?.stderr && !result.data.stdout) {
          return { success: false, error: result.data.stderr };
        }
        return { success: true, data: result.data };
      } catch (error) {
        return handleError3(error);
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
function parseCommand(command) {
  const trimmed = command.trim();
  if (!trimmed) {
    return { exe: "", args: [] };
  }
  const parts = [];
  let current = "";
  let inQuote = null;
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = char;
    } else if (char === " ") {
      if (current) {
        parts.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current) {
    parts.push(current);
  }
  const exe = parts[0] || "";
  const args = parts.slice(1);
  return { exe, args };
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
  return new Promise((resolve3, reject) => {
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
        resolve3(stdout.trim());
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
  return new Promise((resolve3, reject) => {
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
        resolve3();
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
  const fs10 = require("fs");
  const stat2 = fs10.statSync(filePath);
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
    const fs10 = require("fs");
    const stat2 = fs10.statSync(imagePath);
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
          `[System.Drawing.Bitmap]::new(1920, 1080).Save('${tempPath}', [System.Drawing.Imaging.ImageFormat]::Png)`
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
    return new Promise((resolve3, reject) => {
      const proc = spawn4(cmd, args);
      let stderr = "";
      proc.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      proc.on("close", (code) => {
        if (code === 0 && tempPath) {
          const fs10 = require("fs");
          const stat2 = fs10.statSync(tempPath);
          resolve3({
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
    const fs10 = require("fs");
    const img1Data = fs10.readFileSync(image1Path);
    const img2Data = fs10.readFileSync(image2Path);
    const img1 = PNG.sync.decode(img1Data);
    const img2 = PNG.sync.decode(img2Data);
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
    const chunkText2 = words.slice(startIndex, endIndex).join(" ");
    chunks.push({
      id: `chunk_${Date.now()}_${chunkIndex}`,
      text: chunkText2,
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
        Object.entries(toolUsageCount).forEach(([tool14, count]) => {
          if (count > 3) {
            entries.push({
              id: this.generateId(),
              timestamp: Date.now(),
              type: "pattern",
              title: `Frequent Tool Usage: ${tool14}`,
              content: `Tool '${tool14}' was used ${count} times in the current session, indicating it's a primary workflow tool.`,
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

// src/toolsProvider.ts
function createToolsProvider(config) {
  return new ToolsProvider(config);
}
async function toolsProvider(_ctl) {
  const provider = createToolsProvider();
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
          if (config.godMode || isToolEnabled(config, "uiGeneration")) {
            registerUiGenerationTools(config).forEach((t) => this.toolMap.set(t.name, t));
          }
          if (config.godMode || isToolEnabled(config, "contextManagement")) {
            registerContextManagementTools(config).forEach((t) => this.toolMap.set(t.name, t));
          }
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
        const tool14 = this.registry.get(toolName);
        if (!tool14) {
          return { success: false, error: `Tool '${toolName}' not found` };
        }
        try {
          const impl = tool14.implementation;
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
function detectDirectoryPath(text) {
  const windowsPattern = /[A-Za-z]:\\[\w\.\-_ ]+(?:[\/\\][\w\.\-_ ]+)*/g;
  const unixPattern = /\/[\w\.\-_ ]+(?:[\/][\w\.\-_ ]+)*/g;
  let match = text.match(windowsPattern);
  if (match) {
    return match[0].trim();
  }
  match = text.match(unixPattern);
  if (match) {
    return match[0].trim();
  }
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
async function preprocess(ctl, userMessage) {
  const userPrompt = userMessage.getText();
  const detectedPath = detectDirectoryPath(userPrompt);
  if (detectedPath) {
    return injectWorkingDirectoryPrompt(userPrompt, detectedPath);
  }
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const documentRAGEnabled = pluginConfig.get("documentRAG");
  if (!documentRAGEnabled) {
    return userMessage;
  }
  const newFiles = userMessage.getFiles(ctl.client).filter((f) => f.type !== "image");
  if (newFiles.length === 0 && !await hasAttachedFilesInHistory(ctl)) {
    return userMessage;
  }
  const allFiles = await getAllNonImageFiles(ctl, userMessage);
  if (allFiles.length === 0) {
    return userMessage;
  }
  return prepareRetrievalResultsContextInjection(ctl, userPrompt, allFiles);
}
async function hasAttachedFilesInHistory(ctl) {
  try {
    const history = await ctl.pullHistory();
    return history.getAllFiles(ctl.client).some((f) => f.type !== "image");
  } catch {
    return false;
  }
}
async function getAllNonImageFiles(ctl, userMessage) {
  const newFiles = userMessage.getFiles(ctl.client).filter((f) => f.type !== "image");
  try {
    const history = await ctl.pullHistory();
    const historyFiles = history.getAllFiles(ctl.client).filter((f) => f.type !== "image");
    if (newFiles.length === 0) {
      return historyFiles;
    }
    const newFileIds = new Set(newFiles.map((f) => f.identifier));
    const uniqueHistoryFiles = historyFiles.filter((f) => !newFileIds.has(f.identifier));
    return [...newFiles, ...uniqueHistoryFiles];
  } catch {
    return newFiles;
  }
}
async function prepareRetrievalResultsContextInjection(ctl, originalUserPrompt, files) {
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const retrievalLimit = pluginConfig.get("retrievalLimit");
  const affinityThreshold = pluginConfig.get("retrievalAffinityThreshold");
  const retrievingStatus = ctl.createStatus({
    status: "loading",
    text: `Loading embedding model...`
  });
  try {
    const embeddingModelId = "nomic-ai/nomic-embed-text-v1.5-GGUF";
    const model = await ctl.client.embedding.model(embeddingModelId, {
      signal: ctl.abortSignal
    });
    retrievingStatus.setState({
      status: "loading",
      text: `Retrieving relevant citations for user query...`
    });
    const result = await ctl.client.files.retrieve(originalUserPrompt, files, {
      embeddingModel: model,
      // Explicitly pass the loaded model
      limit: retrievalLimit,
      signal: ctl.abortSignal,
      onFileProcessList(filesToProcess) {
        for (const file of filesToProcess) {
          retrievingStatus.setState({
            status: "loading",
            text: `Processing ${file.name}...`
          });
        }
      },
      onFileProcessingStart(file) {
        retrievingStatus.setState({
          status: "loading",
          text: `Embedding chunks from ${file.name}...`
        });
      },
      onFileProcessingEnd(file) {
        retrievingStatus.setState({
          status: "done",
          text: `Processed ${file.name}`
        });
      }
    });
    const relevantEntries = result.entries.filter((entry) => entry.score >= affinityThreshold);
    if (relevantEntries.length === 0) {
      retrievingStatus.setState({
        status: "error",
        text: `No relevant content found in attached documents (threshold: ${affinityThreshold})`
      });
      return buildNoResultsMessage(originalUserPrompt);
    }
    retrievingStatus.setState({
      status: "done",
      text: `Retrieved ${relevantEntries.length} relevant chunk(s) from ${files.length} document(s)`
    });
    ctl.debug(`Retrieved ${relevantEntries.length} relevant chunks with affinity threshold ${affinityThreshold}`);
    return buildRetrievalMessage(relevantEntries, originalUserPrompt);
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.message?.includes("abort"))) {
      retrievingStatus.setState({
        status: "canceled",
        text: "Retrieval canceled by user"
      });
      throw error;
    }
    const errorMessage = error instanceof Error ? error : String(error);
    const messageStr = typeof errorMessage === "string" ? errorMessage : errorMessage.message || "";
    const isMissingModelError = messageStr.includes("Embedding model");
    retrievingStatus.setState({
      status: "error",
      text: isMissingModelError ? `RAG requires an embedding model. Please load 'nomic-embed-text-v1.5' in LM Studio.` : `Retrieval failed: ${messageStr || "Unknown error"}`
    });
    ctl.debug(`RAG retrieval error:`, errorMessage);
    return originalUserPrompt;
  }
}
function buildNoResultsMessage(originalUserPrompt) {
  const note = `Important: No citations were found in the attached documents for your query.

`;
  const instruction = `Please respond to the best of your ability without document context.`;
  return `${note}
${instruction}

---
User Query:

${originalUserPrompt}`;
}
function buildRetrievalMessage(entries, originalUserPrompt) {
  const prefix = `The following excerpts were retrieved from your attached documents based on semantic relevance:

`;
  let processedContent = prefix;
  entries.forEach((entry, index) => {
    const maxChunkLength = 2e3;
    let content = entry.content;
    if (content.length > maxChunkLength) {
      content = content.substring(0, maxChunkLength) + "... [truncated]";
    }
    processedContent += `**Relevant Excerpt ${index + 1}** (relevance: ${(entry.score * 100).toFixed(0)}%):
`;
    processedContent += `${content}

---

`;
  });
  const suffix = `Use the excerpts above to inform your response. Only cite information that is directly relevant to the user's query.

User Query:

${originalUserPrompt}`;
  return processedContent + suffix;
}
var init_promptPreprocessor = __esm({
  "src/promptPreprocessor.ts"() {
    "use strict";
    init_config();
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
      error: (msg) => typeof process.stderr.write === "function" && process.stderr.write(`[AI Toolbox ERROR] ${msg}
`)
    };
  }
});

// .lmstudio/entry.ts
var import_sdk15 = require("@lmstudio/sdk");
var clientIdentifier = process.env.LMS_PLUGIN_CLIENT_IDENTIFIER;
var clientPasskey = process.env.LMS_PLUGIN_CLIENT_PASSKEY;
var baseUrl = process.env.LMS_PLUGIN_BASE_URL;
var client = new import_sdk15.LMStudioClient({
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kQ29tbWFuZHMudHMiLCAiLi4vc3JjL3dvcmtpbmdEaXIudHMiLCAiLi4vc3JjL3NlY3VyaXR5LnRzIiwgIi4uL3NyYy9wZXJmb3JtYW5jZVV0aWxzLnRzIiwgIi4uL3NyYy90b29scy9maWxlU3lzdGVtVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2dpdEdpdGh1YlRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9kYXRhYmFzZVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9leGVjdXRpb25Ub29scy50cyIsICIuLi9zcmMvdG9vbHMvdXRpbGl0eVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvaHR0cENsaWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy92ZWN0b3JSYWdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzUHJvdmlkZXIudHMiLCAiLi4vc3JjL3Byb21wdFByZXByb2Nlc3Nvci50cyIsICIuLi9zcmMvaW5kZXgudHMiLCAiZW50cnkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5cclxuaW1wb3J0IHsgY3JlYXRlQ29uZmlnU2NoZW1hdGljcyB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xyXG5cclxuXHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PSBab2QgU2NoZW1hICh2YWxpZGF0aW9uKSA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuXHJcblxyXG5leHBvcnQgY29uc3QgQ29uZmlnU2NoZW1hID0gei5vYmplY3Qoe1xyXG5cclxuICAvLyBUb29sIEdhdGluZyAoZW5hYmxlL2Rpc2FibGUgaW5kaXZpZHVhbCB0b29scylcclxuXHJcbiAgZmlsZVN5c3RlbTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcbiAgd2ViU2VhcmNoOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxyXG5cclxuICBicm93c2VyQXV0b21hdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXHJcblxyXG4gIGdpdE9wZXJhdGlvbnM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxyXG5cclxuICBkYXRhYmFzZVF1ZXJpZXM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxyXG5cclxuICBkb2N1bWVudFBhcnNpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIGJhY2tncm91bmRDb21tYW5kczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG5cclxuICBpbWFnZVByb2Nlc3Npbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBpbWFnZSBPQ1IsIHNjcmVlbnNob3QsIGFuZCBjb21wYXJpc29uIHRvb2xzJyksXHJcblxyXG4gIGh0dHBDbGllbnQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdFbmFibGUgZ2VuZXJpYyBIVFRQIGNsaWVudCBmb3IgUkVTVCBBUEkgY2FsbHMnKSxcclxuXHJcbiAgdmVjdG9yUkFHOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgc2VtYW50aWMgc2VhcmNoIHdpdGggdmVjdG9yIGVtYmVkZGluZ3MnKSxcclxuICB1aUdlbmVyYXRpb246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdFbmFibGUgaW50ZXJhY3RpdmUgVUkgZ2VuZXJhdGlvbiBhbmQgcmVuZGVyaW5nIHRvb2xzJyksXG4gIGNvbnRleHRNYW5hZ2VtZW50OiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgYXV0b21hdGljIGNvbnRleHQgdHJhY2tpbmcgYW5kIG1lbW9yeSBtYW5hZ2VtZW50JyksXG5cclxuXHJcblxyXG4gIC8vIFx1MjUwMFx1MjUwMCBcdTI2QTBcdUZFMEYgR09EIE1PREUgKEVuYWJsZSBBTEwgdG9vbHMgYXQgb25jZSkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcblxyXG4gIGdvZE1vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdcdTI2QTBcdUZFMEYgV0FSTklORzogRW5hYmxlcyBldmVyeSB0b29sIGNhdGVnb3J5LiBVc2Ugd2l0aCBjYXV0aW9uLicpLFxyXG5cclxuXHJcblxyXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0RcdURDREEgRE9DVU1FTlQgUkFHIC8gQ0hBVCBXSVRIIEZJTEVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG5cclxuICBkb2N1bWVudFJBRzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0VuYWJsZSBmaWxlIGluZGV4aW5nIGFuZCBzZW1hbnRpYyBzZWFyY2ggZm9yIGNoYXQnKSxcclxuXHJcbiAgcmV0cmlldmFsTGltaXQ6IHoubnVtYmVyKCkubWluKDEpLm1heCgyMCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgcmVsZXZhbnQgY2h1bmtzIHRvIHJldHJpZXZlJyksXHJcblxyXG4gIHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkOiB6Lm51bWJlcigpLm1pbigwLjApLm1heCgxLjApLmRlZmF1bHQoMC41KS5kZXNjcmliZSgnTWluaW11bSBzaW1pbGFyaXR5IHNjb3JlIGZvciBhIGNodW5rIHRvIGJlIGNvbnNpZGVyZWQgcmVsZXZhbnQgKDAtMSknKSxcclxuXHJcbiAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCBpbmRpdmlkdWFsIHRvZ2dsZXMgKGdyYW51bGFyIGNvbnRyb2wpXHJcblxyXG4gIGV4ZWN1dGlvbkphdmFTY3JpcHQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdBbGxvdyBydW5famF2YXNjcmlwdCB0b29sJyksXHJcblxyXG4gIGV4ZWN1dGlvblB5dGhvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9weXRob24gdG9vbCcpLFxyXG5cclxuICBleGVjdXRpb25UZXJtaW5hbDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9pbl90ZXJtaW5hbCB0b29sJyksXHJcblxyXG4gIGV4ZWN1dGlvblNoZWxsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnQWxsb3cgZXhlY3V0ZV9jb21tYW5kIHRvb2wnKSxcclxuXHJcblxyXG5cclxuICAvLyBcdTI1MDBcdTI1MDAgV2ViIFNlYXJjaCBTZXR0aW5ncyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuXHJcbiAgc2VhcmNoRmFsbGJhY2tDaGFpbjogei5lbnVtKFsnZGRnLWFwaScsICdkZGctZmV0Y2gnLCAnZ29vZ2xlJywgJ2JpbmcnXSkuZGVmYXVsdCgnZGRnLWFwaScpLmRlc2NyaWJlKCdQcmltYXJ5IHNlYXJjaCBlbmdpbmUgKGF1dG8tZmFsbGJhY2sgdG8gb3RoZXJzKScpLFxyXG5cclxuICBtYXhTZWFyY2hSZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLmRlZmF1bHQoMTApLFxyXG5cclxuICBzYWZlc2VhcmNoOiB6LmVudW0oWycwJywgJzEnLCAnMiddKS5kZWZhdWx0KCcxJyksXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNTAwXHUyNTAwIEJyb3dzZXIgU2V0dGluZ3MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcblxyXG4gIGJyb3dzZXJUaW1lb3V0OiB6Lm51bWJlcigpLm1pbigxMDAwKS5tYXgoMzAwMDApLmRlZmF1bHQoNTAwMCksXHJcblxyXG4gIGhlYWRsZXNzTW9kZTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcblxyXG5cclxuICAvLyBHaXQgU2V0dGluZ3NcclxuXHJcbiAgZ2l0QXV0b0NvbW1pdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXHJcblxyXG4gIGRlZmF1bHRCcmFuY2g6IHouc3RyaW5nKCkuZGVmYXVsdCgnbWFpbicpLFxyXG5cclxuXHJcblxyXG4gIC8vIFNlY3VyaXR5IFNldHRpbmdzXHJcblxyXG4gIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcbiAgYmluYXJ5RmlsZURldGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcbiAgcmVnZXhSZURvU1Byb3RlY3Rpb246IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIG1heFJlZ2V4TGVuZ3RoOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMTAwMCkuZGVmYXVsdCg1MDApLFxyXG5cclxuXHJcblxyXG4gIC8vIFN0YXRlIE1hbmFnZW1lbnRcclxuXHJcbiAgc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIHN0YXRlTWF4U2l6ZTogei5udW1iZXIoKS5taW4oMTAyNCkubWF4KDEwNDg1NzYpLmRlZmF1bHQoMTAyNDApLFxyXG5cclxuXHJcblxyXG4gIC8vIGkxOG4gU2V0dGluZ3NcclxuXHJcbiAgbGFuZ3VhZ2U6IHouZW51bShbJ2VuJywgJ2RlJywgJ3poLUNOJywgJ3poLVRXJ10pLmRlZmF1bHQoJ2VuJyksXHJcblxyXG5cclxuXHJcbiAgLy8gTm90aWZpY2F0aW9uIFNldHRpbmdzXHJcblxyXG4gIG5vdGlmaWNhdGlvbnNFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxyXG5cclxufSk7XHJcblxyXG5cclxuXHJcbmV4cG9ydCB0eXBlIFBsdWdpbkNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIENvbmZpZ1NjaGVtYT47XHJcblxyXG5cclxuXHJcbi8qKlxyXG5cclxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdFxyXG5cclxuICovXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT05GSUc6IFBsdWdpbkNvbmZpZyA9IHtcclxuXHJcbiAgZmlsZVN5c3RlbTogdHJ1ZSxcclxuXHJcbiAgd2ViU2VhcmNoOiB0cnVlLFxyXG5cclxuICBicm93c2VyQXV0b21hdGlvbjogZmFsc2UsXHJcblxyXG4gIGdpdE9wZXJhdGlvbnM6IGZhbHNlLFxyXG5cclxuICBkYXRhYmFzZVF1ZXJpZXM6IGZhbHNlLFxyXG5cclxuICBkb2N1bWVudFBhcnNpbmc6IHRydWUsXHJcblxyXG4gIGJhY2tncm91bmRDb21tYW5kczogZmFsc2UsXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjZBMFx1RkUwRlxyXG5cclxuICBnb2RNb2RlOiBmYWxzZSxcclxuXHJcblxyXG5cclxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNDXHVERDk1IE5FVyBUT09MIENBVEVHT1JJRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcblxyXG4gIGltYWdlUHJvY2Vzc2luZzogdHJ1ZSxcclxuXHJcbiAgaHR0cENsaWVudDogZmFsc2UsXHJcblxyXG4gIHZlY3RvclJBRzogdHJ1ZSxcclxuICB1aUdlbmVyYXRpb246IGZhbHNlLFxuICBjb250ZXh0TWFuYWdlbWVudDogdHJ1ZSxcblxyXG5cclxuXHJcbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjZBMFx1RkUwRlxyXG5cclxuICBkb2N1bWVudFJBRzogZmFsc2UsXHJcblxyXG4gIHJldHJpZXZhbExpbWl0OiA1LFxyXG5cclxuICByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZDogMC41LFxyXG5cclxuXHJcblxyXG4gIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgYWxsIGRpc2FibGVkIGJ5IGRlZmF1bHQgKGRhbmdlcm91cyEpXHJcblxyXG4gIGV4ZWN1dGlvbkphdmFTY3JpcHQ6IGZhbHNlLFxyXG5cclxuICBleGVjdXRpb25QeXRob246IGZhbHNlLFxyXG5cclxuICBleGVjdXRpb25UZXJtaW5hbDogZmFsc2UsXHJcblxyXG4gIGV4ZWN1dGlvblNoZWxsOiBmYWxzZSxcclxuXHJcblxyXG5cclxuICBzZWFyY2hGYWxsYmFja0NoYWluOiAnZGRnLWFwaScsXHJcblxyXG4gIG1heFNlYXJjaFJlc3VsdHM6IDEwLFxyXG5cclxuICBzYWZlc2VhcmNoOiAnMScsXHJcblxyXG4gIGJyb3dzZXJUaW1lb3V0OiA1MDAwLFxyXG5cclxuICBoZWFkbGVzc01vZGU6IHRydWUsXHJcblxyXG4gIGdpdEF1dG9Db21taXQ6IGZhbHNlLFxyXG5cclxuICBkZWZhdWx0QnJhbmNoOiAnbWFpbicsXHJcblxyXG4gIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogdHJ1ZSxcclxuXHJcbiAgYmluYXJ5RmlsZURldGVjdGlvbjogdHJ1ZSxcclxuXHJcbiAgcmVnZXhSZURvU1Byb3RlY3Rpb246IHRydWUsXHJcblxyXG4gIG1heFJlZ2V4TGVuZ3RoOiA1MDAsXHJcblxyXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB0cnVlLFxyXG5cclxuICBzdGF0ZU1heFNpemU6IDEwMjQwLFxyXG5cclxuICBsYW5ndWFnZTogJ2VuJyxcclxuXHJcbiAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHRydWUsXHJcblxyXG59O1xyXG5cclxuXHJcblxyXG4vKipcclxuXHJcbiAqIFZhbGlkYXRlIGFuZCBzYW5pdGl6ZSBjb25maWcgaW5wdXRcclxuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uZmlnKGlucHV0OiB1bmtub3duKTogUGx1Z2luQ29uZmlnIHtcclxuXHJcbiAgY29uc3QgcmVzdWx0ID0gQ29uZmlnU2NoZW1hLnNhZmVQYXJzZShpbnB1dCk7XHJcblxyXG4gIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcclxuXHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29uZmlndXJhdGlvbjogJHtyZXN1bHQuZXJyb3IubWVzc2FnZX1gKTtcclxuXHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiBhIHRvb2wgY2F0ZWdvcnkgaXMgZW5hYmxlZCBpbiBjb25maWdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1Rvb2xFbmFibGVkKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBjYXRlZ29yeToga2V5b2YgUGljazxQbHVnaW5Db25maWcsICdmaWxlU3lzdGVtJyB8ICd3ZWJTZWFyY2gnIHwgJ2Jyb3dzZXJBdXRvbWF0aW9uJyB8ICdnaXRPcGVyYXRpb25zJyB8ICdkYXRhYmFzZVF1ZXJpZXMnIHwgJ2RvY3VtZW50UGFyc2luZycgfCAnYmFja2dyb3VuZENvbW1hbmRzJyB8ICdpbWFnZVByb2Nlc3NpbmcnIHwgJ2h0dHBDbGllbnQnIHwgJ3ZlY3RvclJBRycgfCAndWlHZW5lcmF0aW9uJyB8ICdjb250ZXh0TWFuYWdlbWVudCc+KTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIGNvbmZpZ1tjYXRlZ29yeV0gPT09IHRydWU7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbi8qKlxyXG5cclxuICogQ2hlY2sgaWYgYSBzcGVjaWZpYyBleGVjdXRpb24gdG9vbCBpcyBlbmFibGVkIChncmFudWxhcilcclxuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoY29uZmlnOiBQbHVnaW5Db25maWcsIHRvb2w6ICdqYXZhc2NyaXB0JyB8ICdweXRob24nIHwgJ3Rlcm1pbmFsJyB8ICdzaGVsbCcpOiBib29sZWFuIHtcclxuXHJcbiAgc3dpdGNoICh0b29sKSB7XHJcblxyXG4gICAgY2FzZSAnamF2YXNjcmlwdCc6IHJldHVybiBjb25maWcuZXhlY3V0aW9uSmF2YVNjcmlwdCA9PT0gdHJ1ZTtcclxuXHJcbiAgICBjYXNlICdweXRob24nOiAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25QeXRob24gPT09IHRydWU7XHJcblxyXG4gICAgY2FzZSAndGVybWluYWwnOiAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uVGVybWluYWwgPT09IHRydWU7XHJcblxyXG4gICAgY2FzZSAnc2hlbGwnOiAgICAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uU2hlbGwgPT09IHRydWU7XHJcblxyXG4gIH1cclxuXHJcbn1cclxuXHJcblxyXG5cclxuLyoqXHJcblxyXG4gKiBHZXQgdGhlIGV4ZWN1dGlvbiB0b29sIGtleSBmcm9tIGEgdG9vbCBuYW1lXHJcblxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFeGVjdXRpb25Ub29sS2V5KHRvb2xOYW1lOiBzdHJpbmcpOiAnamF2YXNjcmlwdCcgfCAncHl0aG9uJyB8ICd0ZXJtaW5hbCcgfCAnc2hlbGwnIHwgbnVsbCB7XHJcblxyXG4gIHN3aXRjaCAodG9vbE5hbWUpIHtcclxuXHJcbiAgICBjYXNlICdydW5famF2YXNjcmlwdCc6IHJldHVybiAnamF2YXNjcmlwdCc7XHJcblxyXG4gICAgY2FzZSAncnVuX3B5dGhvbic6ICAgICByZXR1cm4gJ3B5dGhvbic7XHJcblxyXG4gICAgY2FzZSAncnVuX2luX3Rlcm1pbmFsJzogcmV0dXJuICd0ZXJtaW5hbCc7XHJcblxyXG4gICAgY2FzZSAnZXhlY3V0ZV9jb21tYW5kJzogcmV0dXJuICdzaGVsbCc7XHJcblxyXG4gICAgZGVmYXVsdDogICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcblxyXG4vKipcclxuXHJcbiAqIENoZWNrIGlmIEFOWSBleGVjdXRpb24gdG9vbCBpcyBlbmFibGVkIChsZWdhY3kgY29tcGF0aWJpbGl0eSlcclxuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhhc0FueUV4ZWN1dGlvblRvb2woY29uZmlnOiBQbHVnaW5Db25maWcpOiBib29sZWFuIHtcclxuXHJcbiAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25KYXZhU2NyaXB0IHx8IGNvbmZpZy5leGVjdXRpb25QeXRob24gfHwgXHJcblxyXG4gICAgICAgICBjb25maWcuZXhlY3V0aW9uVGVybWluYWwgfHwgY29uZmlnLmV4ZWN1dGlvblNoZWxsO1xyXG5cclxufVxyXG5cclxuXHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PSBMTSBTdHVkaW8gVUkgU2NoZW1hdGljcyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLy8gVGhlc2UgZGVmaW5lIHRoZSB0b2dnbGUgc3dpdGNoZXMgdGhhdCBhcHBlYXIgaW4gTE0gU3R1ZGlvJ3Mgc2V0dGluZ3MgcGFuZWwuXHJcblxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWdTY2hlbWF0aWNzID0gY3JlYXRlQ29uZmlnU2NoZW1hdGljcygpXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIC0gVE9QIFBSSU9SSVRZIFdBUk5JTkcgVE9HR0xFIFx1MjZBMFx1RkUwRlxyXG5cclxuICAuZmllbGQoJ2dvZE1vZGUnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdTI2QTFcdTI2QTBcdUZFMEYgR09EIE1PREUgLSBFbmFibGUgQUxMIFRvb2xzIFx1MjZBMFx1RkUwRlx1MjZBMScsXHJcblxyXG4gICAgc3VidGl0bGU6ICdXQVJOSU5HOiBBY3RpdmF0ZXMgZXZlcnkgdG9vbCBjYXRlZ29yeSBpbnN0YW50bHkuIFVzZSB3aXRoIGNhdXRpb24uJyxcclxuXHJcbiAgICBoaW50OiAnV2hlbiBlbmFibGVkLCBBTEwgaW5kaXZpZHVhbCB0b2dnbGVzIGFyZSBieXBhc3NlZCBhbmQgZXZlcnkgdG9vbCBpcyBhY3RpdmF0ZWQgcmVnYXJkbGVzcyBvZiBzZXR0aW5ncy4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5nb2RNb2RlKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1RDgzQ1x1REY5Qlx1RkUwRiBUT09MIEdBVElORyAoSGF1cHRzY2hhbHRlcikgXHVEODNDXHVERjlCXHVGRTBGXHJcblxyXG4gIC5maWVsZCgnZmlsZVN5c3RlbScsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDMSBGaWxlIFN5c3RlbSBUb29scycsIGhpbnQ6ICdFbmFibGUgZmlsZSByZWFkL3dyaXRlL3NlYXJjaCBvcGVyYXRpb25zJyB9LCBERUZBVUxUX0NPTkZJRy5maWxlU3lzdGVtKVxyXG5cclxuICAuZmllbGQoJ3dlYlNlYXJjaCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REYxMCBXZWIgJiBSZXNlYXJjaCBUb29scycsIGhpbnQ6ICdFbmFibGUgRHVja0R1Y2tHby9XaWtpcGVkaWEgc2VhcmNoJyB9LCBERUZBVUxUX0NPTkZJRy53ZWJTZWFyY2gpXHJcblxyXG4gIC8vIFx1RDgzRFx1REMxOSBHSVQgJiBHSVRIVUIgVE9PTFMgKHZpc3VlbGxlIEdydXBwaWVydW5nKSBcdUQ4M0RcdURDMTlcclxuXHJcbiAgLmZpZWxkKCdnaXRPcGVyYXRpb25zJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQzE5IEdpdCAmIEdpdEh1YiBUb29scycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnVmVyc2lvbiBDb250cm9sICYgQVBJJyxcclxuXHJcbiAgICBoaW50OiAnRW5hYmxlIGdpdCBvcGVyYXRpb25zIGFuZCBHaXRIdWIgQVBJIGFjY2Vzcy4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5naXRPcGVyYXRpb25zKVxyXG5cclxuICAuZmllbGQoJ2dpdEF1dG9Db21taXQnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQkUgR2l0IEF1dG8tQ29tbWl0JywgXHJcblxyXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgR2l0ICYgR2l0SHViIFRvb2xzJyxcclxuXHJcbiAgICBoaW50OiAnQXV0b21hdGljYWxseSBjb21taXQgY2hhbmdlcyBhZnRlciBvcGVyYXRpb25zJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZ2l0QXV0b0NvbW1pdClcclxuXHJcbiAgLmZpZWxkKCdkZWZhdWx0QnJhbmNoJywgJ3N0cmluZycsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGM0YgRGVmYXVsdCBCcmFuY2gnLCBcclxuXHJcbiAgICBwbGFjZWhvbGRlcjogJ21haW4nLFxyXG5cclxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEdpdCAmIEdpdEh1YiBUb29scycsXHJcblxyXG4gICAgaGludDogJ0JyYW5jaCBuYW1lIGZvciBuZXcgcmVwb3NpdG9yaWVzIGFuZCBnaXQgb3BlcmF0aW9ucycsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmRlZmF1bHRCcmFuY2gpXHJcblxyXG5cclxuXHJcbiAgLmZpZWxkKCdkYXRhYmFzZVF1ZXJpZXMnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREQzRcdUZFMEYgRGF0YWJhc2UgUXVlcmllcycsIGhpbnQ6ICdFbmFibGUgcmVhZC1vbmx5IFNRTGl0ZSBxdWVyaWVzJyB9LCBERUZBVUxUX0NPTkZJRy5kYXRhYmFzZVF1ZXJpZXMpXHJcblxyXG4gIC5maWVsZCgnZG9jdW1lbnRQYXJzaW5nJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0M0IERvY3VtZW50IFBhcnNpbmcnLCBoaW50OiAnRW5hYmxlIFBERi9ET0NYIGRvY3VtZW50IHJlYWRpbmcnIH0sIERFRkFVTFRfQ09ORklHLmRvY3VtZW50UGFyc2luZylcclxuXHJcbiAgLmZpZWxkKCdiYWNrZ3JvdW5kQ29tbWFuZHMnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdTIzRjMgQmFja2dyb3VuZCBDb21tYW5kcycsIGhpbnQ6ICdFbmFibGUgbG9uZy1ydW5uaW5nIHByb2Nlc3MgdHJhY2tpbmcnIH0sIERFRkFVTFRfQ09ORklHLmJhY2tncm91bmRDb21tYW5kcylcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0NcdUREOTVcdTIwMERcdTI3NDAgTkVXIFRPT0wgQ0FURUdPUklFUyBcdUQ4M0NcdUREOTVcdTIwMERcdTI3NDBcclxuXHJcbiAgLmZpZWxkKCdpbWFnZVByb2Nlc3NpbmcnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREQkNcdUZFMEYgSW1hZ2UgUHJvY2Vzc2luZyBUb29scycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnT0NSLCBTY3JlZW5zaG90cyAmIENvbXBhcmlzb24nLFxyXG5cclxuICAgIGhpbnQ6ICdFbmFibGUgaW1hZ2UgT0NSIChUZXNzZXJhY3QuanMpLCBzY3JlZW5zaG90IGNhcHR1cmUsIGFuZCBpbWFnZSBjb21wYXJpc29uIHRvb2xzLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmltYWdlUHJvY2Vzc2luZylcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgnaHR0cENsaWVudCcsICdib29sZWFuJywgeyBcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQwQyBIVFRQIENsaWVudCBUb29scycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnR2VuZXJpYyBSRVNUIEFQSSBDbGllbnQnLFxyXG5cclxuICAgIGhpbnQ6ICdFbmFibGUgZ2VuZXJpYyBIVFRQIGNsaWVudCBmb3IgbWFraW5nIHJlcXVlc3RzIHRvIGFueSBSRVNUIEFQSSAoR0VULCBQT1NULCBQVVQsIERFTEVURSkuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuaHR0cENsaWVudClcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgndmVjdG9yUkFHJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0NBIFZlY3RvciBSQUcgLyBTZW1hbnRpYyBTZWFyY2gnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ1NlbWFudGljIERvY3VtZW50IFNlYXJjaCcsXHJcblxyXG4gICAgaGludDogJ0VuYWJsZSBzZW1hbnRpYyBzZWFyY2ggd2l0aCB2ZWN0b3IgZW1iZWRkaW5ncyBmb3IgaW50ZWxsaWdlbnQgZG9jdW1lbnQgcmV0cmlldmFsLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLnZlY3RvclJBRylcclxuICAuZmllbGQoJ3VpR2VuZXJhdGlvbicsICdib29sZWFuJywgeyBcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REZBOCBJbnRlcmFjdGl2ZSBVSSBHZW5lcmF0aW9uIFRvb2xzJywgXG4gICAgc3VidGl0bGU6ICdHZW5lcmF0ZSBhbmQgcmVuZGVyIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudHMnLFxuICAgIGhpbnQ6ICdFbmFibGUgdG9vbHMgZm9yIGdlbmVyYXRpbmcgSFRNTC9DU1MvSlMgY29tcG9uZW50cyAoYnV0dG9ucywgZm9ybXMsIGNoYXJ0cywgZGFzaGJvYXJkcykgYW5kIHJlbmRlcmluZyB0aGVtIGluIHRoZSBicm93c2VyLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLnVpR2VuZXJhdGlvbilcbiAgLmZpZWxkKCdjb250ZXh0TWFuYWdlbWVudCcsICdib29sZWFuJywgeyBcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRVx1RERFMCBBdXRvLUNvbnRleHQgTWFuYWdlbWVudCBUb29scycsIFxuICAgIHN1YnRpdGxlOiAnQXV0b21hdGljIHNlc3Npb24gdHJhY2tpbmcgYW5kIG1lbW9yeSBtYW5hZ2VtZW50JyxcbiAgICBoaW50OiAnRW5hYmxlIHRvb2xzIGZvciBhdXRvbWF0aWNhbGx5IHNhdmluZyBpbXBvcnRhbnQgZGVjaXNpb25zLCBwYXR0ZXJucywgYW5kIGNvbmZpZ3VyYXRpb25zIHRvIHBlcnNpc3RlbnQgbWVtb3J5LicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmNvbnRleHRNYW5hZ2VtZW50KVxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0RcdURDREEgRE9DVU1FTlQgUkFHIC8gQ0hBVCBXSVRIIEZJTEVTIFx1RDgzRFx1RENEQVxyXG5cclxuICAuZmllbGQoJ2RvY3VtZW50UkFHJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0RBIERvY3VtZW50IFJBRyAvIENoYXQgd2l0aCBGaWxlcycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnRW5hYmxlIGZpbGUgaW5kZXhpbmcgYW5kIHNlbWFudGljIHNlYXJjaCBmb3IgY2hhdCcsXHJcblxyXG4gICAgaGludDogJ0F0dGFjaCBkb2N1bWVudHMgdG8geW91ciBjaGF0IG1lc3NhZ2VzLiBUaGUgcGx1Z2luIHdpbGwgYXV0b21hdGljYWxseSByZXRyaWV2ZSByZWxldmFudCBjb250ZW50IGZyb20gYXR0YWNoZWQgZmlsZXMgdXNpbmcgc2VtYW50aWMgc2VhcmNoLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmRvY3VtZW50UkFHKVxyXG5cclxuICBcclxuXHJcbiAgLmZpZWxkKCdyZXRyaWV2YWxMaW1pdCcsICdudW1lcmljJywgeyBcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQyMiBSZXRyaWV2YWwgTGltaXQnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ01heCBjaHVua3MgdG8gcmV0dXJuIHBlciBxdWVyeScsXHJcblxyXG4gICAgbWluOiAxLCBtYXg6IDIwLCBpbnQ6IHRydWUsXHJcblxyXG4gICAgaGludDogJ01heGltdW0gbnVtYmVyIG9mIHJlbGV2YW50IGRvY3VtZW50IGNodW5rcyB0byByZXRyaWV2ZSBmb3IgZWFjaCBxdWVyeS4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5yZXRyaWV2YWxMaW1pdClcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnLCAnbnVtZXJpYycsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGQUYgUmV0cmlldmFsIEFmZmluaXR5IFRocmVzaG9sZCcsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnTWluaW11bSByZWxldmFuY2Ugc2NvcmUgKDAtMSknLFxyXG5cclxuICAgIG1pbjogMC4wLCBtYXg6IDEuMCwgc3RlcDogMC4wMSxcclxuXHJcbiAgICBoaW50OiAnQ2h1bmtzIGJlbG93IHRoaXMgc2ltaWxhcml0eSBzY29yZSB3aWxsIGJlIGZpbHRlcmVkIG91dC4gTG93ZXIgPSBtb3JlIHJlc3VsdHMgYnV0IHBvdGVudGlhbGx5IGxlc3MgcmVsZXZhbnQuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcucmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQpXHJcblxyXG4gIC8vIFx1MjZBMSBFWEVDVVRJT04gVE9PTFMgKEdlZlx1MDBFNGhybGljaCEpIFx1MjZBMVxyXG5cclxuICAuZmllbGQoJ2V4ZWN1dGlvbkphdmFTY3JpcHQnLCAnYm9vbGVhbicsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1MjZBMSBKYXZhU2NyaXB0LUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXHJcblxyXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX2phdmFzY3JpcHQnLVRvb2xcIixcclxuXHJcbiAgICBoaW50OiAnR0VGQUhSOiBDb2RlIGxcdTAwRTR1ZnQgYXVmIElocmVtIFJlY2huZXIuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uSmF2YVNjcmlwdClcclxuXHJcbiAgLmZpZWxkKCdleGVjdXRpb25QeXRob24nLCAnYm9vbGVhbicsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REMwRCBQeXRob24tQXVzZlx1MDBGQ2hydW5nIGVybGF1YmVuJyxcclxuXHJcbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdydW5fcHl0aG9uJy1Ub29sXCIsXHJcblxyXG4gICAgaGludDogJ0dFRkFIUjogQ29kZSBsXHUwMEU0dWZ0IGF1ZiBJaHJlbSBSZWNobmVyLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvblB5dGhvbilcclxuXHJcbiAgLmZpZWxkKCdleGVjdXRpb25UZXJtaW5hbCcsICdib29sZWFuJywge1xyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JCIFRlcm1pbmFsLUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXHJcblxyXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX2luX3Rlcm1pbmFsJy1Ub29sXCIsXHJcblxyXG4gICAgaGludDogJ1x1MDBENmZmbmV0IGVjaHRlIFRlcm1pbmFsLUZlbnN0ZXIuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uVGVybWluYWwpXHJcblxyXG4gIC5maWVsZCgnZXhlY3V0aW9uU2hlbGwnLCAnYm9vbGVhbicsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQyNyBTaGVsbC1CZWZlaGxzYXVzZlx1MDBGQ2hydW5nIGVybGF1YmVuJyxcclxuXHJcbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdleGVjdXRlX2NvbW1hbmQnLVRvb2xcIixcclxuXHJcbiAgICBoaW50OiAnR0VGQUhSOiBCZWZlaGxlIGxhdWZlbiBhdWYgSWhyZW0gUmVjaG5lci4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5leGVjdXRpb25TaGVsbClcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0RcdUREMEQgU0VBUkNIIFNFVFRJTkdTIFx1RDgzRFx1REQwRFxyXG5cclxuICAuZmllbGQoJ3NlYXJjaEZhbGxiYWNrQ2hhaW4nLCAnc2VsZWN0Jywge1xyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDBEIFNlYXJjaCBGYWxsYmFjayBDaGFpbicsXHJcblxyXG4gICAgaGludDogJ1ByaW1hcnkgc2VhcmNoIGVuZ2luZS4gQXV0by1mYWxscyBiYWNrIHRvIG90aGVycyBpZiB1bmF2YWlsYWJsZS4nLFxyXG5cclxuICAgIG9wdGlvbnM6IFtcclxuXHJcbiAgICAgIHsgdmFsdWU6ICdkZGctYXBpJywgZGlzcGxheU5hbWU6ICdEdWNrRHVja0dvIEFQSScgfSxcclxuXHJcbiAgICAgIHsgdmFsdWU6ICdkZGctZmV0Y2gnLCBkaXNwbGF5TmFtZTogJ0R1Y2tEdWNrR28gRmV0Y2gnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnZ29vZ2xlJywgZGlzcGxheU5hbWU6ICdHb29nbGUnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnYmluZycsIGRpc3BsYXlOYW1lOiAnQmluZycgfSxcclxuXHJcbiAgICBdLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5zZWFyY2hGYWxsYmFja0NoYWluKVxyXG5cclxuICAuZmllbGQoJ21heFNlYXJjaFJlc3VsdHMnLCAnbnVtZXJpYycsIHsgbWluOiAxLCBtYXg6IDUwLCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcubWF4U2VhcmNoUmVzdWx0cylcclxuXHJcbiAgLmZpZWxkKCdzYWZlc2VhcmNoJywgJ3NlbGVjdCcsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REVFMVx1RkUwRiBTYWZlIFNlYXJjaCcsXHJcblxyXG4gICAgb3B0aW9uczogW1xyXG5cclxuICAgICAgeyB2YWx1ZTogJzAnLCBkaXNwbGF5TmFtZTogJ09mZicgfSxcclxuXHJcbiAgICAgIHsgdmFsdWU6ICcxJywgZGlzcGxheU5hbWU6ICdNb2RlcmF0ZScgfSxcclxuXHJcbiAgICAgIHsgdmFsdWU6ICcyJywgZGlzcGxheU5hbWU6ICdTdHJpY3QnIH0sXHJcblxyXG4gICAgXSxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuc2FmZXNlYXJjaClcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0RcdUREQTVcdUZFMEYgQlJPV1NFUiBBVVRPTUFUSU9OIFRPT0xTIFx1RDgzRFx1RERBNVx1RkUwRlxyXG5cclxuICAuZmllbGQoJ2Jyb3dzZXJBdXRvbWF0aW9uJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREE1XHVGRTBGIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnSGVhZGxlc3MgYnJvd3NlciBjb250cm9sICYgYXV0b21hdGlvbicsXHJcblxyXG4gICAgaGludDogJ0VuYWJsZSBQdXBwZXRlZXItYmFzZWQgaGVhZGxlc3MgYnJvd3NlciBhdXRvbWF0aW9uIGZvciB3ZWIgc2NyYXBpbmcsIHRlc3RpbmcsIGFuZCBVSSBpbnRlcmFjdGlvbi4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5icm93c2VyQXV0b21hdGlvbilcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgnYnJvd3NlclRpbWVvdXQnLCAnbnVtZXJpYycsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdTIzRjFcdUZFMEYgQnJvd3NlciBUaW1lb3V0JywgXHJcblxyXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgQnJvd3NlciBBdXRvbWF0aW9uIFRvb2xzJyxcclxuXHJcbiAgICBtaW46IDEwMDAsIG1heDogMzAwMDAsIGludDogdHJ1ZSxcclxuXHJcbiAgICBoaW50OiAnTWF4aW11bSB0aW1lIChtcykgdG8gd2FpdCBmb3IgYnJvd3NlciBvcGVyYXRpb25zIGJlZm9yZSB0aW1pbmcgb3V0LicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmJyb3dzZXJUaW1lb3V0KVxyXG5cclxuICBcclxuXHJcbiAgLmZpZWxkKCdoZWFkbGVzc01vZGUnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDN0IgSGVhZGxlc3MgTW9kZScsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsXHJcblxyXG4gICAgaGludDogJ1J1biBicm93c2VyIHdpdGhvdXQgR1VJIChyZWNvbW1lbmRlZCBmb3IgYXV0b21hdGlvbikuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuaGVhZGxlc3NNb2RlKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1RDgzRFx1REQxMiBTRUNVUklUWSBTRVRUSU5HUyBcdUQ4M0RcdUREMTJcclxuXHJcbiAgLmZpZWxkKCdwYXRoVmFsaWRhdGlvbkVuYWJsZWQnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMTIgUGF0aCBWYWxpZGF0aW9uJywgaGludDogJ1ByZXZlbnQgZGlyZWN0b3J5IHRyYXZlcnNhbCBhdHRhY2tzJyB9LCBERUZBVUxUX0NPTkZJRy5wYXRoVmFsaWRhdGlvbkVuYWJsZWQpXHJcblxyXG4gIC5maWVsZCgnYmluYXJ5RmlsZURldGVjdGlvbicsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDMSBCaW5hcnkgRmlsZSBEZXRlY3Rpb24nLCBoaW50OiAnRGV0ZWN0IGJpbmFyeSBmaWxlcyB2aWEgbnVsbCBieXRlIGNoZWNrJyB9LCBERUZBVUxUX0NPTkZJRy5iaW5hcnlGaWxlRGV0ZWN0aW9uKVxyXG5cclxuICAuZmllbGQoJ3JlZ2V4UmVEb1NQcm90ZWN0aW9uJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERUUxXHVGRTBGIFJlRG9TIFByb3RlY3Rpb24nLCBoaW50OiAnUHJvdGVjdCBhZ2FpbnN0IHJlZ2V4IGRlbmlhbC1vZi1zZXJ2aWNlJyB9LCBERUZBVUxUX0NPTkZJRy5yZWdleFJlRG9TUHJvdGVjdGlvbilcclxuXHJcbiAgLmZpZWxkKCdtYXhSZWdleExlbmd0aCcsICdudW1lcmljJywgeyBtaW46IDEsIG1heDogMTAwMCwgaW50OiB0cnVlIH0sIERFRkFVTFRfQ09ORklHLm1heFJlZ2V4TGVuZ3RoKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1RDgzRFx1RENCRCBTVEFURSBNQU5BR0VNRU5UIFx1RDgzRFx1RENCRFxyXG5cclxuICAuZmllbGQoJ3N0YXRlUGVyc2lzdGVuY2VFbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JEIFN0YXRlIFBlcnNpc3RlbmNlJywgaGludDogJ1BlcnNpc3QgdG9vbCBleGVjdXRpb24gc3RhdGUgYmV0d2VlbiBzZXNzaW9ucycgfSwgREVGQVVMVF9DT05GSUcuc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQpXHJcblxyXG4gIC5maWVsZCgnc3RhdGVNYXhTaXplJywgJ251bWVyaWMnLCB7IG1pbjogMTAyNCwgbWF4OiAxMDQ4NTc2LCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcuc3RhdGVNYXhTaXplKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1RDgzQ1x1REYxMCBMQU5HVUFHRSAmIE5PVElGSUNBVElPTlMgXHVEODNDXHVERjEwXHJcblxyXG4gIC5maWVsZCgnbGFuZ3VhZ2UnLCAnc2VsZWN0Jywge1xyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjEwIExhbmd1YWdlJyxcclxuXHJcbiAgICBvcHRpb25zOiBbXHJcblxyXG4gICAgICB7IHZhbHVlOiAnZW4nLCBkaXNwbGF5TmFtZTogJ0VuZ2xpc2gnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnZGUnLCBkaXNwbGF5TmFtZTogJ0RldXRzY2ggKEdlcm1hbiknIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnemgtQ04nLCBkaXNwbGF5TmFtZTogJ1NpbXBsaWZpZWQgQ2hpbmVzZScgfSxcclxuXHJcbiAgICAgIHsgdmFsdWU6ICd6aC1UVycsIGRpc3BsYXlOYW1lOiAnVHJhZGl0aW9uYWwgQ2hpbmVzZScgfSxcclxuXHJcbiAgICBdLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5sYW5ndWFnZSlcclxuXHJcblxyXG5cclxuICAuZmllbGQoJ25vdGlmaWNhdGlvbnNFbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDE0IERlc2t0b3AgTm90aWZpY2F0aW9ucycsIGhpbnQ6ICdTaG93IHN5c3RlbSBub3RpZmljYXRpb25zJyB9LCBERUZBVUxUX0NPTkZJRy5ub3RpZmljYXRpb25zRW5hYmxlZClcclxuXHJcbiAgLmJ1aWxkKCk7XHJcblxyXG4iLCAiLyoqXG4gKiBQZXJzaXN0ZW50IHN0YXRlIG1hbmFnZW1lbnQgZm9yIHBsdWdpbiBvcGVyYXRpb25zXG4gKiBTdG9yZXMgZGF0YSB0byBkaXNrIGFzIEpTT04gZmlsZSBmb3Igc3Vydml2YWwgYWNyb3NzIHJlbG9hZHNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcblxuaW50ZXJmYWNlIFN0YXRlRW50cnkge1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHVua25vd247XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG4vKiogTWluaW1hbCBsb2dnZXIgZm9yIHN0YXRlIG1hbmFnZXIgKGF2b2lkcyBjaXJjdWxhciBkZXBlbmRlbmN5IHdpdGggaW5kZXgudHMpICovXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbU3RhdGVNYW5hZ2VyXSAke21zZ31cXG5gKSxcbn07XG5cbi8qKiBEZWJvdW5jZWQgYXN5bmMgc3RhdGUgcGVyc2lzdGVuY2UgKDUwMG1zIGRlbGF5KSAqL1xuZnVuY3Rpb24gY3JlYXRlRGVib3VuY2VkU2F2ZShzYXZlRm46ICgpID0+IHZvaWQsIGRlbGF5TXM6IG51bWJlciA9IDUwMCk6ICgoKSA9PiB2b2lkKSB7XG4gIGxldCB0aW1lcklkOiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZFNhdmUoKTogdm9pZCB7XG4gICAgaWYgKHRpbWVySWQpIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzYXZlRm4oKTtcbiAgICAgIHRpbWVySWQgPSBudWxsO1xuICAgIH0sIGRlbGF5TXMpO1xuICB9O1xufVxuXG4vKipcbiAqIERlZmF1bHQgbWVtb3J5IGZpbGUgbG9jYXRpb24gKGluIExNIFN0dWRpbyBwbHVnaW4gZGF0YSBkaXJlY3RvcnkpXG4gKi9cbmZ1bmN0aW9uIGdldE1lbW9yeUZpbGVQYXRoKCk6IHN0cmluZyB7XG4gIC8vIFRyeSB0byBmaW5kIExNIFN0dWRpbydzIGFwcCBkYXRhIGRpcmVjdG9yeSBmb3IgcGVyc2lzdGVuY2VcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgbGV0IGJhc2VEaXI6IHN0cmluZztcbiAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIGJhc2VEaXIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuQVBQREFUQSB8fCAnJywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgYmFzZURpciA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBiYXNlRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgJycsICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgfVxuICBcbiAgcmV0dXJuIHBhdGguam9pbihiYXNlRGlyLCAnYWktdG9vbGJveC1tZW1vcnkuanNvbicpO1xufVxuXG5leHBvcnQgY2xhc3MgU3RhdGVNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0ZTogTWFwPHN0cmluZywgU3RhdGVFbnRyeT47XG4gIHByaXZhdGUgbWF4U2l6ZTogbnVtYmVyO1xuICBwcml2YXRlIHBlcnNpc3RlbmNlRW5hYmxlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBtZW1vcnlGaWxlOiBzdHJpbmc7XG4gIHByaXZhdGUgcnVubmluZ1NpemU6IG51bWJlcjsgLy8gVHJhY2sgc2l6ZSBpbmNyZW1lbnRhbGx5IGZvciBPKDEpIGNoZWNrc1xuICBwcml2YXRlIGRlYm91bmNlZFNhdmU6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gICAgdGhpcy5tYXhTaXplID0gZWZmZWN0aXZlQ29uZmlnLnN0YXRlTWF4U2l6ZTtcbiAgICB0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCA9IGVmZmVjdGl2ZUNvbmZpZy5zdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDtcbiAgICB0aGlzLm1lbW9yeUZpbGUgPSBnZXRNZW1vcnlGaWxlUGF0aCgpO1xuICAgIFxuICAgIC8vIENyZWF0ZSBkZWJvdW5jZWQgc2F2ZSBmdW5jdGlvbiAoNTAwbXMgZGVsYXkpXG4gICAgdGhpcy5kZWJvdW5jZWRTYXZlID0gY3JlYXRlRGVib3VuY2VkU2F2ZSgoKSA9PiB0aGlzLnNhdmVUb0ZpbGUoKSwgNTAwKTtcbiAgICBcbiAgICAvLyBBdXRvLWxvYWQgZnJvbSBkaXNrIGlmIHBlcnNpc3RlbmNlIGlzIGVuYWJsZWRcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIHN0YXRlIHZhbHVlIHdpdGgga2V5IGFuZCBvcHRpb25hbCBtZXRhZGF0YVxuICAgKi9cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGNvbnN0IG5ld1ZhbHVlU2l6ZSA9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUodmFsdWUpO1xuICAgIGNvbnN0IG9sZFZhbHVlU2l6ZSA9IHRoaXMuZ2V0RXhpc3RpbmdWYWx1ZVNpemUoa2V5KTtcbiAgICBcbiAgICAvLyBDaGVjayBzaXplIGxpbWl0IHVzaW5nIHJ1bm5pbmcgdG90YWxcbiAgICBpZiAodGhpcy5ydW5uaW5nU2l6ZSAtIG9sZFZhbHVlU2l6ZSArIG5ld1ZhbHVlU2l6ZSA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdGF0ZSBzaXplIGV4Y2VlZHMgbWF4aW11bSAoJHt0aGlzLm1heFNpemV9IGJ5dGVzKWApO1xuICAgIH1cbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBzZXR0aW5nXG4gICAgdGhpcy5ydW5uaW5nU2l6ZSA9IHRoaXMucnVubmluZ1NpemUgLSBvbGRWYWx1ZVNpemUgKyBuZXdWYWx1ZVNpemU7XG4gICAgXG4gICAgdGhpcy5zdGF0ZS5zZXQoa2V5LCB7XG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICB9KTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgKDUwMG1zIGRlbGF5KSBcdTIwMTQgb25seSBpZiBwZXJzaXN0ZW5jZSBlbmFibGVkXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3RhdGUgdmFsdWUgYnkga2V5XG4gICAqL1xuICBnZXQ8VD4oa2V5OiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuc3RhdGUuZ2V0KGtleSk7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gZW50cnkudmFsdWUgYXMgVDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBzdGF0ZSBlbnRyeVxuICAgKi9cbiAgZGVsZXRlKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIGlmICghZW50cnkpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBkZWxldGluZ1xuICAgIHRoaXMucnVubmluZ1NpemUgLT0gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSk7XG4gICAgY29uc3QgZGVsZXRlZCA9IHRoaXMuc3RhdGUuZGVsZXRlKGtleSk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrIGFmdGVyIGRlbGV0aW9uXG4gICAgaWYgKGRlbGV0ZWQgJiYgdGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZGVsZXRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHN0YXRlIGtleXNcbiAgICovXG4gIGdldEFsbEtleXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuc3RhdGUua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhbGwgc3RhdGVcbiAgICovXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgYWZ0ZXIgY2xlYXJpbmdcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc2l6ZSBvZiBleGlzdGluZyB2YWx1ZSBmb3IgYSBrZXkgKGZvciBpbmNyZW1lbnRhbCB1cGRhdGVzKVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFeGlzdGluZ1ZhbHVlU2l6ZShrZXk6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIHJldHVybiBlbnRyeSA/IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpIDogMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFc3RpbWF0ZSBzaXplIG9mIGEgdmFsdWUgaW4gYnl0ZXNcbiAgICovXG4gIHByaXZhdGUgZ2V0U2l6ZU9mVmFsdWUodmFsdWU6IHVua25vd24pOiBudW1iZXIge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gdmFsdWUubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSByZXR1cm4gODtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHJldHVybiAxO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFjdHVhbCBzaXplIG9mIGFycmF5IGVsZW1lbnRzXG4gICAgICByZXR1cm4gdmFsdWUucmVkdWNlKChzdW06IG51bWJlciwgZWxlbTogdW5rbm93bikgPT4gc3VtICsgdGhpcy5nZXRTaXplT2ZWYWx1ZShlbGVtKSwgMCk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIHZhbHVlLnNpemUgKiAxNjtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBzdGF0ZSB0byBkaXNrIGFzIEpTT04gZmlsZSB3aXRoIG9wdGltaXplZCBzZXJpYWxpemF0aW9uXG4gICAqL1xuICBwcml2YXRlIHNhdmVUb0ZpbGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGUuZW50cmllcygpKS5tYXAoKFtfa2V5LCBlbnRyeV0pID0+ICh7XG4gICAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICAgIHRpbWVzdGFtcDogZW50cnkudGltZXN0YW1wLFxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICAvLyBFbnN1cmUgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMubWVtb3J5RmlsZSk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gT3B0aW1pemVkIEpTT04gc2VyaWFsaXphdGlvbiAobm8gcHJldHR5LXByaW50aW5nIGZvciBwZXJmb3JtYW5jZSlcbiAgICAgIGNvbnN0IGpzb25TdHJpbmcgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgIFxuICAgICAgLy8gV3JpdGUgdG8gdGVtcCBmaWxlIGZpcnN0LCB0aGVuIHJlbmFtZSBmb3IgYXRvbWljIG9wZXJhdGlvblxuICAgICAgY29uc3QgdGVtcEZpbGUgPSB0aGlzLm1lbW9yeUZpbGUgKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBGaWxlLCBqc29uU3RyaW5nLCAndXRmLTgnKTtcbiAgICAgIGZzLnJlbmFtZVN5bmModGVtcEZpbGUsIHRoaXMubWVtb3J5RmlsZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHNhdmUgdG8gZGlzazogJHttZXNzYWdlfWApOyAvLyBNMiBmaXg6IG5vIGNvbnNvbGUud2FyblxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHN0YXRlIGZyb20gZGlzayBKU09OIGZpbGUgd2l0aCBjb3JydXB0aW9uIHJlY292ZXJ5XG4gICAqL1xuICBwcml2YXRlIGxvYWRGcm9tRmlsZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMubWVtb3J5RmlsZSkpIHJldHVybjtcbiAgICAgIFxuICAgICAgY29uc3QganNvblN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUsICd1dGYtOCcpO1xuICAgICAgXG4gICAgICAvLyBUcnkgdG8gcGFyc2UgSlNPTiB3aXRoIGVycm9yIHJlY292ZXJ5XG4gICAgICBsZXQgZGF0YTogU3RhdGVFbnRyeVtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoanNvblN0cmluZykgYXMgU3RhdGVFbnRyeVtdO1xuICAgICAgfSBjYXRjaCB7IC8vIEMxIGZpeDogcmVtb3ZlZCB1bnVzZWQgcGFyc2VFcnJvciB2YXJpYWJsZVxuICAgICAgICBsb2dnZXIud2FybihgQ29ycnVwdGVkIHN0YXRlIGZpbGUgZGV0ZWN0ZWQsIGF0dGVtcHRpbmcgcmVjb3ZlcnkuLi5gKTtcblxuICAgICAgICAvLyBUcnkgdG8gcmVjb3ZlciBieSByZWFkaW5nIGxpbmUgYnkgbGluZSBvciB1c2luZyBiYWNrdXBcbiAgICAgICAgY29uc3QgYmFja3VwRmlsZSA9IHRoaXMubWVtb3J5RmlsZSArICcuYmFja3VwJztcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYmFja3VwRmlsZSkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFja3VwU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGJhY2t1cEZpbGUsICd1dGYtOCcpO1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoYmFja3VwU3RyaW5nKSBhcyBTdGF0ZUVudHJ5W107XG4gICAgICAgICAgICBsb2dnZXIud2FybihgU3VjY2Vzc2Z1bGx5IGxvYWRlZCBmcm9tIGJhY2t1cGApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYEJhY2t1cCBhbHNvIGNvcnJ1cHRlZCwgc3RhcnRpbmcgZnJlc2hgKTtcbiAgICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oYE5vIGJhY2t1cCBhdmFpbGFibGUsIHN0YXJ0aW5nIGZyZXNoYCk7XG4gICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGRhdGEpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZW50cnkgc3RydWN0dXJlIGJlZm9yZSBhZGRpbmdcbiAgICAgICAgaWYgKGVudHJ5ICYmIHR5cGVvZiBlbnRyeS5rZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBlbnRyeS50aW1lc3RhbXAgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZXQoZW50cnkua2V5LCBlbnRyeSk7XG4gICAgICAgICAgdGhpcy5ydW5uaW5nU2l6ZSArPSB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBDcmVhdGUgYmFja3VwIGFmdGVyIHN1Y2Nlc3NmdWwgbG9hZFxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUgKyAnLmJhY2t1cCcsIGpzb25TdHJpbmcsICd1dGYtOCcpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIElnbm9yZSBiYWNrdXAgY3JlYXRpb24gZXJyb3JzXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIGxvYWQgZnJvbSBkaXNrOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9ydCBzdGF0ZSBmb3IgcGVyc2lzdGVuY2UgKEpTT04gc2VyaWFsaXphdGlvbikgXHUyMDE0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICovXG4gIGV4cG9ydFN0YXRlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZGF0YSA9IEFycmF5LmZyb20odGhpcy5zdGF0ZS5lbnRyaWVzKCkpLm1hcCgoW19rZXksIGVudHJ5XSkgPT4gKHtcbiAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLFxuICAgICAgdGltZXN0YW1wOiBlbnRyeS50aW1lc3RhbXAsXG4gICAgfSkpO1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgc3RhdGUgZnJvbSBKU09OIHN0cmluZyBcdTIwMTQga2VwdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgKi9cbiAgaW1wb3J0U3RhdGUoanNvblN0cmluZzogc3RyaW5nKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGpzb25TdHJpbmcpIGFzIFN0YXRlRW50cnlbXTtcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBkYXRhKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgICAgICB0aGlzLnJ1bm5pbmdTaXplICs9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIGFmdGVyIGltcG9ydFxuICAgICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gaW1wb3J0IHN0YXRlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCB0byB0aGUgbWVtb3J5IGZpbGUgb24gZGlza1xuICAgKi9cbiAgZ2V0TWVtb3J5RmlsZVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tZW1vcnlGaWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIHNhdmUgdG8gZGlzayAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBmb3JjZVNhdmUoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlVG9GaWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2UgbG9hZCBmcm9tIGRpc2sgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgKi9cbiAgZm9yY2VMb2FkKCk6IHZvaWQge1xuICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gIH1cbn1cbiIsICIvKipcclxuICogTG9uZy1ydW5uaW5nIHByb2Nlc3MgdHJhY2tpbmcgYW5kIG1hbmFnZW1lbnRcclxuICovXHJcblxyXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCYWNrZ3JvdW5kQ29tbWFuZCB7XHJcbiAgaWQ6IHN0cmluZztcclxuICBjb21tYW5kOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHN0YXJ0VGltZTogbnVtYmVyO1xyXG4gIHRpbWVvdXRIb3VyczogbnVtYmVyO1xyXG4gIHN0YXR1czogJ3J1bm5pbmcnIHwgJ2NvbXBsZXRlZCcgfCAnY2FuY2VsbGVkJyB8ICdlcnJvcmVkJztcclxuICBzdGRvdXQ/OiBzdHJpbmc7XHJcbiAgc3RkZXJyPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIHtcclxuICBwcml2YXRlIGNvbW1hbmRzOiBNYXA8c3RyaW5nLCBCYWNrZ3JvdW5kQ29tbWFuZD47XHJcbiAgcHJpdmF0ZSBtYXhUaW1lb3V0SG91cnM6IG51bWJlcjtcclxuICBcclxuICBjb25zdHJ1Y3RvcihfY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XHJcbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5tYXhUaW1lb3V0SG91cnMgPSAxMDsgLy8gSGFyZCBsaW1pdCBmcm9tIHRvb2wgc3BlY2lmaWNhdGlvblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXIgYSBuZXcgYmFja2dyb3VuZCBjb21tYW5kXHJcbiAgICovXHJcbiAgcmVnaXN0ZXIoY29tbWFuZDogc3RyaW5nLCB0aW1lb3V0SG91cnM6IG51bWJlciwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICh0aW1lb3V0SG91cnMgPCAwLjEgfHwgdGltZW91dEhvdXJzID4gdGhpcy5tYXhUaW1lb3V0SG91cnMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaW1lb3V0IG11c3QgYmUgYmV0d2VlbiAwLjEgYW5kICR7dGhpcy5tYXhUaW1lb3V0SG91cnN9IGhvdXJzYCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICghbmFtZSB8fCBuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgbmFtZSBpcyBtYW5kYXRvcnknKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgaWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcclxuICAgIFxyXG4gICAgdGhpcy5jb21tYW5kcy5zZXQoaWQsIHtcclxuICAgICAgaWQsXHJcbiAgICAgIGNvbW1hbmQsXHJcbiAgICAgIG5hbWUsXHJcbiAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcclxuICAgICAgdGltZW91dEhvdXJzLFxyXG4gICAgICBzdGF0dXM6ICdydW5uaW5nJyxcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gaWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBzdGF0dXMgYW5kIG91dHB1dCBvZiBhIGJhY2tncm91bmQgY29tbWFuZFxyXG4gICAqL1xyXG4gIGNoZWNrKGlkOiBzdHJpbmcpOiBCYWNrZ3JvdW5kQ29tbWFuZCB8IG51bGwge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCkgcmV0dXJuIG51bGw7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGlmIHRpbWVvdXQgZXhjZWVkZWRcclxuICAgIGNvbnN0IGVsYXBzZWRIb3VycyA9IChEYXRlLm5vdygpIC0gY29tbWFuZC5zdGFydFRpbWUpIC8gKDEwMDAgKiA2MCAqIDYwKTtcclxuICAgIGlmIChlbGFwc2VkSG91cnMgPiBjb21tYW5kLnRpbWVvdXRIb3VycyAmJiBjb21tYW5kLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XHJcbiAgICAgIGNvbW1hbmQuc3RhdHVzID0gJ2Vycm9yZWQnO1xyXG4gICAgICBjb21tYW5kLnN0ZGVyciA9IGBDb21tYW5kIGV4Y2VlZGVkIHRpbWVvdXQgKCR7Y29tbWFuZC50aW1lb3V0SG91cnN9IGhvdXJzKWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBjb21tYW5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FuY2VsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmRcclxuICAgKi9cclxuICBjYW5jZWwoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCB8fCBjb21tYW5kLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgICBcclxuICAgIGNvbW1hbmQuc3RhdHVzID0gJ2NhbmNlbGxlZCc7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbGwgYWN0aXZlIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0QWN0aXZlQ29tbWFuZHMoKTogQmFja2dyb3VuZENvbW1hbmRbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNvbW1hbmRzLnZhbHVlcygpKVxyXG4gICAgICAuZmlsdGVyKGMgPT4gYy5zdGF0dXMgPT09ICdydW5uaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgY29tcGxldGVkL2Vycm9yZWQvY2FuY2VsbGVkIGNvbW1hbmRzIGFmdGVyIGNsZWFudXAgcGVyaW9kXHJcbiAgICovXHJcbiAgY2xlYW51cChtYXhBZ2VIb3VyczogbnVtYmVyID0gMjQpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBmb3IgKGNvbnN0IFtpZCwgY29tbWFuZF0gb2YgdGhpcy5jb21tYW5kcy5lbnRyaWVzKCkpIHtcclxuICAgICAgaWYgKGNvbW1hbmQuc3RhdHVzICE9PSAncnVubmluZycpIHtcclxuICAgICAgICBjb25zdCBhZ2VIb3VycyA9IChub3cgLSBjb21tYW5kLnN0YXJ0VGltZSkgLyAoMTAwMCAqIDYwICogNjApO1xyXG4gICAgICAgIGlmIChhZ2VIb3VycyA+IG1heEFnZUhvdXJzKSB7XHJcbiAgICAgICAgICB0aGlzLmNvbW1hbmRzLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgY29tbWFuZCBJRFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBiZ18ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0b3RhbCBjb3VudCBvZiByZWdpc3RlcmVkIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0Q291bnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmNvbW1hbmRzLnNpemU7XHJcbiAgfVxyXG59XHJcbiIsICIvKipcbiAqIFdvcmtpbmcgRGlyZWN0b3J5IE1hbmFnZXJcbiAqIFxuICogVHJhY2tzIGEgbXV0YWJsZSB3b3JraW5nIGRpcmVjdG9yeSB0aGF0IGNhbiBiZSBjaGFuZ2VkIGF0IHJ1bnRpbWUgdmlhIHNldFdvcmtpbmdEaXIoKS5cbiAqIEFsbCBmaWxlIG9wZXJhdGlvbnMgcmVzb2x2ZSBwYXRocyBhZ2FpbnN0IHRoaXMgZGlyZWN0b3J5LlxuICogRmFsbHMgYmFjayB0byB0aGUgcGx1Z2luIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgKEJBU0VfRElSKSBvbiByZXNldC5cbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG4vLyBCYXNlIGRpcmVjdG9yeTogcGx1Z2luIHJvb3QgKHdoZXJlIHBhY2thZ2UuanNvbiBsaXZlcylcbmNvbnN0IEJBU0VfRElSID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJyk7XG5cbi8vIE11dGFibGUgd29ya2luZyBkaXJlY3RvcnkgXHUyMDE0IGRlZmF1bHRzIHRvIHBsdWdpbiByb290XG5sZXQgY3VycmVudFdvcmtpbmdEaXI6IHN0cmluZyA9IEJBU0VfRElSO1xuXG4vKiogR2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0V29ya2luZ0RpcigpOiBzdHJpbmcge1xuICByZXR1cm4gY3VycmVudFdvcmtpbmdEaXI7XG59XG5cbi8qKlxuICogU2V0IHRoZSB3b3JraW5nIGRpcmVjdG9yeSB0byBhIG5ldyBhYnNvbHV0ZSBwYXRoLlxuICogVmFsaWRhdGVzIHRoYXQgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhbiBhYnNvbHV0ZSBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRXb3JraW5nRGlyKG5ld0Rpcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFJlc29sdmUgdG8gYWJzb2x1dGUgcGF0aFxuICBjb25zdCByZXNvbHZlZCA9IHBhdGgucmVzb2x2ZShuZXdEaXIpO1xuXG4gIC8vIE11c3QgYmUgYW4gYWJzb2x1dGUgcGF0aFxuICBpZiAoIXBhdGguaXNBYnNvbHV0ZShyZXNvbHZlZCkpIHtcbiAgICBjb25zb2xlLndhcm4oYHNldFdvcmtpbmdEaXIgcmVqZWN0ZWQ6IG5vdCBhYnNvbHV0ZSBcdTIwMTQgJyR7bmV3RGlyfSdgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBNdXN0IGV4aXN0IGFuZCBiZSBhIGRpcmVjdG9yeVxuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMocmVzb2x2ZWQpO1xuICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBzZXRXb3JraW5nRGlyIHJlamVjdGVkOiBub3QgYSBkaXJlY3RvcnkgXHUyMDE0ICcke3Jlc29sdmVkfSdgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGNvbnNvbGUud2Fybihgc2V0V29ya2luZ0RpciByZWplY3RlZDogcGF0aCBkb2VzIG5vdCBleGlzdCBcdTIwMTQgJyR7cmVzb2x2ZWR9J2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGN1cnJlbnRXb3JraW5nRGlyID0gcmVzb2x2ZWQ7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogUmVzZXQgdGhlIHdvcmtpbmcgZGlyZWN0b3J5IGJhY2sgdG8gdGhlIHBsdWdpbiByb290ICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRXb3JraW5nRGlyKCk6IHZvaWQge1xuICBjdXJyZW50V29ya2luZ0RpciA9IEJBU0VfRElSO1xufVxuXG4vKiogUmVzb2x2ZSBhIHVzZXItcHJvdmlkZWQgcGF0aCBhZ2FpbnN0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhdGgodXNlclBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUoY3VycmVudFdvcmtpbmdEaXIsIHVzZXJQYXRoKTtcbn1cblxuLyoqIEdldCBhbGxvd2VkIGJhc2UgZGlyZWN0b3JpZXMgZm9yIGFic29sdXRlLXBhdGggdmFsaWRhdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbG93ZWRCYXNlcygpOiBzdHJpbmdbXSB7XG4gIC8vIEFsbG93IGJvdGggdGhlIHBsdWdpbiByb290IGFuZCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICBjb25zdCBiYXNlcyA9IFtCQVNFX0RJUiwgY3VycmVudFdvcmtpbmdEaXJdO1xuICByZXR1cm4gWy4uLm5ldyBTZXQoYmFzZXMpXTsgLy8gRGVkdXBsaWNhdGVcbn1cblxuLyoqIEdldCB0aGUgcGx1Z2luIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgKG5ldmVyIGNoYW5nZXMpICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1Z2luUm9vdCgpOiBzdHJpbmcge1xuICByZXR1cm4gQkFTRV9ESVI7XG59XG4iLCAiLyoqXG4gKiBTZWN1cml0eSB1dGlsaXRpZXMgZm9yIHBhdGggdmFsaWRhdGlvbiwgYmluYXJ5IGRldGVjdGlvbiwgYW5kIFJlRG9TIHByb3RlY3Rpb25cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbi8vIFx1MjcwNSBGSVg6IFVzZSBwcm9wZXIgRVNNIGltcG9ydHMgaW5zdGVhZCBvZiByZXF1aXJlKCkgdG8gbWFpbnRhaW4gbW9kdWxlIGJvdW5kYXJ5XG5pbXBvcnQgeyBnZXRBbGxvd2VkQmFzZXMsIGdldFdvcmtpbmdEaXIgfSBmcm9tICcuL3dvcmtpbmdEaXInO1xuXG4vKipcbiAqIFZhbGlkYXRlIGZpbGUgcGF0aCB0byBwcmV2ZW50IGRpcmVjdG9yeSB0cmF2ZXJzYWwgYXR0YWNrcy5cbiAqIERJU0FCTEVEOiBTZWN1cml0eSB2YWxpZGF0b3IgcmVtb3ZlZCBwZXIgdXNlciByZXF1ZXN0IC0gYWxsb3dzIGFsbCBwYXRocy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUGF0aCh1c2VyUGF0aDogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB0cnVlOyAvLyBBbHdheXMgYWxsb3cgcGF0aHNcbn1cblxuLyoqXG4gKiBEZXRlY3QgYmluYXJ5IGZpbGVzIGJ5IGNoZWNraW5nIGZvciBudWxsIGJ5dGVzIGluIGZpcnN0IDhLQlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCaW5hcnlGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaHVuayA9IGNvbnRlbnQuc2xpY2UoMCwgODE5Mik7XG4gIC8vIENoZWNrIGZvciBudWxsIGJ5dGUgKDB4MDApIHdoaWNoIGluZGljYXRlcyBiaW5hcnkgY29udGVudFxuICByZXR1cm4gY2h1bmsuaW5jbHVkZXMoJ1xcMCcpO1xufVxuXG4vKipcbiAqIFByb3RlY3QgYWdhaW5zdCBSZURvUyAoUmVndWxhciBFeHByZXNzaW9uIERlbmlhbCBvZiBTZXJ2aWNlKVxuICogUzIgRklYOiBVc2VzIHByb3BlciByZWdleCBzdHJ1Y3R1cmUgYW5hbHlzaXMgaW5zdGVhZCBvZiBuYWl2ZSBzdWJzdHJpbmcgbWF0Y2hpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NhZmVSZWdleChwYXR0ZXJuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFwYXR0ZXJuIHx8IHBhdHRlcm4ubGVuZ3RoID4gNTAwKSByZXR1cm4gZmFsc2U7XG4gIFxuICAvLyBDaGVjayBmb3IgY29tbW9uIFJlRG9TIHBhdHRlcm5zIHVzaW5nIHN0cnVjdHVyZWQgcmVnZXggZGV0ZWN0aW9uXG4gIGNvbnN0IGRhbmdlcm91c1N0cnVjdHVyZXMgPSBbXG4gICAgLyhcXChbXildKlxcKVsqK10pW14pXSpcXCkvLCAgICAgICAgICAgLy8gTmVzdGVkIHF1YW50aWZpZXJzOiAoLiopKC4qKVxuICAgIC9cXChbXildKlsrKl1cXCkrLywgICAgICAgICAgICAgICAgICAgIC8vIFJlcGV0aXRpb24gb2YgcmVwZXRpdGlvbjogKC4rKStcbiAgICAvXFwoW14pXSpcXHxbXildKlxcKVsrKl0vLCAgICAgICAgICAgICAgLy8gQWx0ZXJuYXRpb24gKyByZXBldGl0aW9uOiAoYXxiKStcbiAgICAvKFxcW1teXFxdXStcXF1bKypdKVteXV0qXFxdLywgICAgICAgICAgIC8vIENoYXIgY2xhc3Mgd2l0aCByZXBldGl0aW9uOiAoW2Etel0rKStcbiAgICAvXFwoXFwuXFw/XFwpXFwqXFwqLywgICAgICAgICAgICAgICAgICAgICAgLy8gR3JvdXAgZm9sbG93ZWQgYnkgZG91YmxlIHN0YXI6ICguKj8pKipcbiAgXTtcbiAgXG4gIGZvciAoY29uc3Qgc3RydWN0dXJlIG9mIGRhbmdlcm91c1N0cnVjdHVyZXMpIHtcbiAgICBpZiAoc3RydWN0dXJlLnRlc3QocGF0dGVybikpIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgLy8gQWxzbyBjaGVjayBmb3IgdGhlIG9yaWdpbmFsIG5haXZlIHBhdHRlcm5zIGFzIGZhbGxiYWNrXG4gIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICcoLiopKC4qKScsICAgICAgICAgICAvLyBOZXN0ZWQgcXVhbnRpZmllcnMgd2l0aCAuKlxuICAgICcoLispKycsICAgICAgICAgICAgICAvLyBSZXBldGl0aW9uIG9mIHJlcGV0aXRpb24gIFxuICAgICcoW2Etel0rKSsnLCAgICAgICAgICAvLyBDaGFyYWN0ZXIgY2xhc3Mgd2l0aCByZXBldGl0aW9uXG4gICAgJyhhfGIpKycsICAgICAgICAgICAgIC8vIEFsdGVybmF0aW9uIHdpdGggcmVwZXRpdGlvblxuICAgICcoLio/KSoqJywgICAgICAgICAgICAvLyBHcm91cCBmb2xsb3dlZCBieSBkb3VibGUgc3RhciAoUmVEb1MpXG4gIF07XG4gIFxuICBmb3IgKGNvbnN0IGRhbmdlcm91c1BhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi5pbmNsdWRlcyhkYW5nZXJvdXNQYXR0ZXJuKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBcHBseSBzZWN1cml0eSBjaGVja3MgYmFzZWQgb24gY29uZmlnIHNldHRpbmdzLlxuICogVXNlcyB0aGUgdmlydHVhbCB3b3JraW5nIGRpcmVjdG9yeSBmb3IgcGF0aCB2YWxpZGF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTZWN1cml0eUNoZWNrcyhcbiAgZmlsZVBhdGg6IHN0cmluZywgXG4gIGNvbnRlbnQ/OiBzdHJpbmcsIFxuICByZWdleFBhdHRlcm4/OiBzdHJpbmcsIFxuICBjb25maWc/OiBQbHVnaW5Db25maWdcbik6IHsgdmFsaWRQYXRoOiBib29sZWFuOyBpc0JpbmFyeTogYm9vbGVhbjsgc2FmZVJlZ2V4OiBib29sZWFuIH0ge1xuICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG5cbiAgcmV0dXJuIHtcbiAgICB2YWxpZFBhdGg6IGVmZmVjdGl2ZUNvbmZpZy5wYXRoVmFsaWRhdGlvbkVuYWJsZWQgPyB2YWxpZGF0ZVBhdGgoZmlsZVBhdGgsIGdldFdvcmtpbmdEaXIoKSkgOiB0cnVlLFxuICAgIGlzQmluYXJ5OiBlZmZlY3RpdmVDb25maWcuYmluYXJ5RmlsZURldGVjdGlvbiAmJiBjb250ZW50ID8gaXNCaW5hcnlGaWxlKGNvbnRlbnQpIDogZmFsc2UsXG4gICAgc2FmZVJlZ2V4OiBlZmZlY3RpdmVDb25maWcucmVnZXhSZURvU1Byb3RlY3Rpb24gJiYgcmVnZXhQYXR0ZXJuID8gaXNTYWZlUmVnZXgocmVnZXhQYXR0ZXJuKSA6IHRydWUsXG4gIH07XG59XG5cbi8qKlxuICogU2FuaXRpemUgc2hlbGwgY29tbWFuZHMgdG8gcHJldmVudCBkYW5nZXJvdXMgb3BlcmF0aW9uc1xuICogUzMgRklYOiBFbmhhbmNlZCB3aXRoIElGUy10YW1wZXJpbmcgYW5kIG51bGwtYnl0ZSBpbmplY3Rpb24gZGV0ZWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHsgc2FmZTogYm9vbGVhbjsgcmVhc29uPzogc3RyaW5nIH0ge1xuICBpZiAoIWNvbW1hbmQgfHwgdHlwZW9mIGNvbW1hbmQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0VtcHR5IG9yIGludmFsaWQgY29tbWFuZCcgfTtcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB3aGl0ZXNwYWNlIGJ1dCBwcmVzZXJ2ZSBxdW90ZWQgc3RyaW5nc1xuICBjb25zdCBub3JtYWxpemVkID0gY29tbWFuZC50cmltKCk7XG4gIFxuICAvLyBTMyBGSVg6IEJsb2NrIG51bGwgYnl0ZSBpbmplY3Rpb24gKGNhbiBieXBhc3MgcmVnZXggbWF0Y2hpbmcpXG4gIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKCdcXDAnKSB8fCBub3JtYWxpemVkLmluY2x1ZGVzKCclMDAnKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdOdWxsIGJ5dGUgaW5qZWN0aW9uIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgLy8gUzMgRklYOiBCbG9jayBJRlMtdGFtcGVyaW5nIGluIGJhc2ggKElGUz0kJyAnIGFsbG93cyBzcGxpdHRpbmcgd2l0aG91dCBzcGFjZXMpXG4gIGNvbnN0IGlmc1BhdHRlcm5zID0gW1xuICAgIC9cXGJJRlNcXHMqPVxccypbXFxcXCQnXVxccyovaSxcbiAgICAvSUZTPVskJ11bXiddKicvaSxcbiAgXTtcbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGlmc1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4udGVzdChub3JtYWxpemVkKSkge1xuICAgICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0lGUyB0YW1wZXJpbmcgZGV0ZWN0ZWQnIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGRhbmdlcm91cyBwYXR0ZXJucyB1c2luZyBhIG1vcmUgcm9idXN0IGFwcHJvYWNoXG4gIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgIC8vIEZpbGUgc3lzdGVtIGRlc3RydWN0aW9uXG4gICAgL1xcYnJtXFxzKy1yZlxcYi9pLFxuICAgIC9cXGJzaHJlZFxcYi9pLFxuICAgIC9cXGJ3aXBlXFxiL2ksXG4gICAgXG4gICAgLy8gUHJpdmlsZWdlIGVzY2FsYXRpb25cbiAgICAvXFxic3Vkb1xcYi9pLFxuICAgIC9cXGJzdVxcYig/IVxcdykvaSwgIC8vICdzdScgYnV0IG5vdCAnc3VkbycsICdzdXNoaScsIGV0Yy5cbiAgICBcbiAgICAvLyBOZXR3b3JrIGF0dGFja3NcbiAgICAvXFxibmNcXGIoPyFcXHcpfFxcYm5ldGNhdFxcYi9pLFxuICAgIC9cXGJ3Z2V0XFxzKy4qLS1wb3N0LWZpbGVcXGIvaSxcbiAgICAvXFxiY3VybFxccysuKi0tZGF0YS1iaW5hcnlcXGIvaSxcbiAgICBcbiAgICAvLyBEYXRhIGV4ZmlsdHJhdGlvblxuICAgIC9cXGJiYXNlNjRcXGIuKlxcfFxccyooY3VybHx3Z2V0KS9pLFxuICAgIC9cXGJzY3BcXGIoPyFcXHcpfFxcYnNmdHBcXGIvaSxcbiAgICBcbiAgICAvLyBQcm9jZXNzIG1hbmlwdWxhdGlvblxuICAgIC9cXGJmb3JrXFxiKD8hXFx3KS9pLFxuICAgIC9cXGJleGVjXFxiKD8hXFx3KS9pLFxuICAgIFxuICAgIC8vIEVudmlyb25tZW50IHRhbXBlcmluZ1xuICAgIC9cXGJleHBvcnRcXHMrXFx3Kz0vaSxcbiAgICAvXFxiZXZhbFxcYig/IVxcdykvaSxcbiAgXTtcblxuICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiBgRGFuZ2Vyb3VzIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7cGF0dGVybi5zb3VyY2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBwaXBlIGNoYWlucyB0aGF0IGNvdWxkIGJlIHVzZWQgZm9yIGF0dGFja3MgKG1vcmUgdGhhbiAyIHBpcGVzID0gMysgY29tbWFuZHMpXG4gIGNvbnN0IHBpcGVDb3VudCA9IChub3JtYWxpemVkLm1hdGNoKC9cXHwvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHBpcGVDb3VudCA+IDIpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnVG9vIG1hbnkgcGlwZXMgaW4gY29tbWFuZCBjaGFpbicgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBzZW1pY29sb24tc2VwYXJhdGVkIGNvbW1hbmRzIChwb3RlbnRpYWwgaW5qZWN0aW9uKVxuICBjb25zdCBzZW1pQ29sb25Db3VudCA9IChub3JtYWxpemVkLm1hdGNoKC87L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChzZW1pQ29sb25Db3VudCA+IDEpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnTXVsdGlwbGUgc2VtaWNvbG9ucyBkZXRlY3RlZCBpbiBjb21tYW5kJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGJhY2t0aWNrIGV4ZWN1dGlvbiBvciAkKCkgc3Vic2hlbGwgaW5qZWN0aW9uXG4gIGlmICgvYFteYF0rYHxcXCRcXChbXildK1xcKS8udGVzdChub3JtYWxpemVkKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdDb21tYW5kIHN1YnN0aXR1dGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBlbnZpcm9ubWVudCB2YXJpYWJsZSBpbmplY3Rpb25cbiAgaWYgKC9eXFxzKihleHBvcnR8dW5zZXQpXFxzLy50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0Vudmlyb25tZW50IG1vZGlmaWNhdGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIHJldHVybiB7IHNhZmU6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBTUUwgcXVlcnkgZm9yIHNhZmV0eSAocmVhZC1vbmx5IG9wZXJhdGlvbnMgb25seSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU1FMUXVlcnkocXVlcnk6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IHJlYXNvbj86IHN0cmluZyB9IHtcbiAgaWYgKCFxdWVyeSB8fCB0eXBlb2YgcXVlcnkgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246ICdFbXB0eSBvciBpbnZhbGlkIHF1ZXJ5JyB9O1xuICB9XG5cbiAgY29uc3QgdHJpbW1lZCA9IHF1ZXJ5LnRyaW0oKS50b1VwcGVyQ2FzZSgpO1xuICBcbiAgLy8gT25seSBhbGxvdyBTRUxFQ1QgYW5kIFBSQUdNQSBzdGF0ZW1lbnRzXG4gIGlmICghdHJpbW1lZC5zdGFydHNXaXRoKCdTRUxFQ1QnKSAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdQUkFHTUEnKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnT25seSBTRUxFQ1QgYW5kIFBSQUdNQSBxdWVyaWVzIGFyZSBhbGxvd2VkJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGRhbmdlcm91cyBrZXl3b3JkcyB0aGF0IGNvdWxkIGJlIGluamVjdGVkIGFmdGVyIFNFTEVDVC9QUkFHTUFcbiAgY29uc3QgZGFuZ2Vyb3VzU1FMS2V5d29yZHMgPSBbXG4gICAgL1xcYkRST1BcXGIvaSxcbiAgICAvXFxiREVMRVRFXFxiL2ksXG4gICAgL1xcYlVQREFURVxcYi9pLFxuICAgIC9cXGJJTlNFUlRcXGIvaSxcbiAgICAvXFxiQUxURVJcXGIvaSxcbiAgICAvXFxiQ1JFQVRFXFxiL2ksXG4gICAgL1xcYlJFUExBQ0VcXGIvaSxcbiAgICAvXFxiVFJVTkNBVEVcXGIvaSxcbiAgICAvXFxiR1JBTlRcXGIvaSxcbiAgICAvXFxiUkVWT0tFXFxiL2ksXG4gIF07XG5cbiAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGRhbmdlcm91c1NRTEtleXdvcmRzKSB7XG4gICAgaWYgKGtleXdvcmQudGVzdCh0cmltbWVkKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246IGBEYW5nZXJvdXMgU1FMIG9wZXJhdGlvbiBkZXRlY3RlZDogJHtrZXl3b3JkLnNvdXJjZX1gIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIG11bHRpcGxlIHN0YXRlbWVudHMgKHNlbWljb2xvbiBpbmplY3Rpb24pXG4gIGNvbnN0IHNlbWlDb2xvbkNvdW50ID0gKHRyaW1tZWQubWF0Y2goLzsvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHNlbWlDb2xvbkNvdW50ID4gMCkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnTXVsdGlwbGUgU1FMIHN0YXRlbWVudHMgZGV0ZWN0ZWQnIH07XG4gIH1cblxuICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuIiwgIi8qKlxuICogUGVyZm9ybWFuY2UgVXRpbGl0aWVzIGZvciBBSSBUb29sYm94IFBsdWdpblxuICogT3B0aW1pemVkIGFsZ29yaXRobXMgd2l0aCBlYXJseSBleGl0LCBjYWNoaW5nLCBhbmQgYXN5bmMgb3BlcmF0aW9uc1xuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IExldmVuc2h0ZWluIERpc3RhbmNlIHdpdGggRWFybHkgRXhpdCA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE9wdGltaXplZCBMZXZlbnNodGVpbiBkaXN0YW5jZSBjYWxjdWxhdGlvbiB3aXRoIGVhcmx5IGV4aXQgdGhyZXNob2xkLlxuICogU3RvcHMgY2FsY3VsYXRpbmcgaWYgdGhlIG1pbmltdW0gcG9zc2libGUgc2NvcmUgZHJvcHMgYmVsb3cgdGhlIHRocmVzaG9sZC5cbiAqIFxuICogQHBhcmFtIGEgLSBGaXJzdCBzdHJpbmdcbiAqIEBwYXJhbSBiIC0gU2Vjb25kIHN0cmluZyAgXG4gKiBAcGFyYW0gbWluU2NvcmUgLSBNaW5pbXVtIGFjY2VwdGFibGUgc2ltaWxhcml0eSBzY29yZSAoMC0xKS4gUmVzdWx0cyBiZWxvdyB0aGlzIGFyZSBwcnVuZWQgZWFybHkuXG4gKiBAcmV0dXJucyBTaW1pbGFyaXR5IHNjb3JlIGJldHdlZW4gMCBhbmQgMSwgb3IgbnVsbCBpZiBiZWxvdyB0aHJlc2hvbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxldmVuc2h0ZWluU2ltaWxhcml0eShhOiBzdHJpbmcsIGI6IHN0cmluZywgbWluU2NvcmU6IG51bWJlciA9IDAuMyk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBtYXhMZW4gPSBNYXRoLm1heChhLmxlbmd0aCwgYi5sZW5ndGgpO1xuICBpZiAobWF4TGVuID09PSAwKSByZXR1cm4gMTtcblxuICAvLyBRdWljayByZWplY3Rpb246IGlmIHN0cmluZ3MgZGlmZmVyIHRvbyBtdWNoIGluIGxlbmd0aCwgc2tpcCBleHBlbnNpdmUgY2FsY3VsYXRpb25cbiAgY29uc3QgbGVuRGlmZiA9IE1hdGguYWJzKGEubGVuZ3RoIC0gYi5sZW5ndGgpO1xuICBpZiAobGVuRGlmZiAvIG1heExlbiA+ICgxIC0gbWluU2NvcmUpKSB7XG4gICAgcmV0dXJuIG51bGw7IC8vIEVhcmx5IGV4aXQgZm9yIHZlcnkgZGlmZmVyZW50IGxlbmd0aHNcbiAgfVxuXG4gIC8vIFVzZSB0d28tcm93IG9wdGltaXphdGlvbiBpbnN0ZWFkIG9mIGZ1bGwgbWF0cml4IChzYXZlcyBtZW1vcnkpXG4gIGxldCBwcmV2Um93OiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJldlJvdy5wdXNoKDApO1xuICB9XG4gIGxldCBjdXJyUm93OiBudW1iZXJbXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IGIubGVuZ3RoOyBpKyspIHtcbiAgICBwcmV2Um93W2ldID0gaTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGEubGVuZ3RoOyBpKyspIHtcbiAgICBjdXJyUm93WzBdID0gaTtcbiAgICBcbiAgICAvLyBFYXJseSBleGl0IG9wdGltaXphdGlvbjogaWYgY3VycmVudCByb3cncyBtaW5pbXVtIGV4Y2VlZHMgdGhyZXNob2xkLCBhYm9ydFxuICAgIGxldCBtaW5JblJvdyA9IGk7XG4gICAgXG4gICAgZm9yIChsZXQgaiA9IDE7IGogPD0gYi5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgY29zdCA9IGFbaSAtIDFdID09PSBiW2ogLSAxXSA/IDAgOiAxO1xuICAgICAgY3VyclJvd1tqXSA9IE1hdGgubWluKFxuICAgICAgICBwcmV2Um93W2pdICsgMSwgICAgICAgICAvLyBkZWxldGlvblxuICAgICAgICBjdXJyUm93W2ogLSAxXSArIDEsICAgICAvLyBpbnNlcnRpb24gIFxuICAgICAgICBwcmV2Um93W2ogLSAxXSArIGNvc3QgICAvLyBzdWJzdGl0dXRpb25cbiAgICAgICk7XG4gICAgICBcbiAgICAgIGlmIChjdXJyUm93W2pdIDwgbWluSW5Sb3cpIHtcbiAgICAgICAgbWluSW5Sb3cgPSBjdXJyUm93W2pdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVhcmx5IGV4aXQ6IGlmIG1pbmltdW0gaW4gdGhpcyByb3cgYWxyZWFkeSBleGNlZWRzIHRocmVzaG9sZCwgYWJvcnRcbiAgICBjb25zdCBjdXJyZW50TWF4U2NvcmUgPSAxIC0gbWluSW5Sb3cgLyBtYXhMZW47XG4gICAgaWYgKGN1cnJlbnRNYXhTY29yZSA8IG1pblNjb3JlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHJvd3NcbiAgICBbcHJldlJvdywgY3VyclJvd10gPSBbY3VyclJvdywgcHJldlJvd107XG4gIH1cblxuICBjb25zdCBkaXN0YW5jZSA9IHByZXZSb3dbYi5sZW5ndGhdO1xuICBjb25zdCBzY29yZSA9IE1hdGgubWF4KDAsIDEgLSBkaXN0YW5jZSAvIG1heExlbik7XG4gIHJldHVybiBzY29yZSA+PSBtaW5TY29yZSA/IHNjb3JlIDogbnVsbDtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRnV6enkgU2VhcmNoIENhY2hlID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBGdXp6eVNlYXJjaENhY2hlRW50cnkge1xuICByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT47XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG5jb25zdCBmdXp6eVNlYXJjaENhY2hlID0gbmV3IE1hcDxzdHJpbmcsIEZ1enp5U2VhcmNoQ2FjaGVFbnRyeT4oKTtcbmNvbnN0IENBQ0hFX1RUTF9NUyA9IDYwXzAwMDsgLy8gNjAgc2Vjb25kIGNhY2hlIFRUTFxuXG4vKipcbiAqIEdldCBjYWNoZWQgZnV6enkgc2VhcmNoIHJlc3VsdHMgaWYgYXZhaWxhYmxlIGFuZCBub3QgZXhwaXJlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlZEZ1enp5UmVzdWx0cyhxdWVyeTogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKTogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+IHwgbnVsbCB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7cXVlcnl9OiR7YmFzZVBhdGh9YDtcbiAgY29uc3QgZW50cnkgPSBmdXp6eVNlYXJjaENhY2hlLmdldChjYWNoZUtleSk7XG4gIFxuICBpZiAoIWVudHJ5KSByZXR1cm4gbnVsbDtcbiAgaWYgKERhdGUubm93KCkgLSBlbnRyeS50aW1lc3RhbXAgPiBDQUNIRV9UVExfTVMpIHtcbiAgICBmdXp6eVNlYXJjaENhY2hlLmRlbGV0ZShjYWNoZUtleSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgXG4gIHJldHVybiBlbnRyeS5yZXN1bHRzO1xufVxuXG4vKipcbiAqIENhY2hlIGZ1enp5IHNlYXJjaCByZXN1bHRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVGdXp6eVJlc3VsdHMocXVlcnk6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZywgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+KTogdm9pZCB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7cXVlcnl9OiR7YmFzZVBhdGh9YDtcbiAgZnV6enlTZWFyY2hDYWNoZS5zZXQoY2FjaGVLZXksIHtcbiAgICByZXN1bHRzLFxuICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgfSk7XG4gIFxuICAvLyBFdmljdCBvbGQgZW50cmllcyBpZiBjYWNoZSBncm93cyB0b28gbGFyZ2UgKG1heCAxMDAgZW50cmllcylcbiAgaWYgKGZ1enp5U2VhcmNoQ2FjaGUuc2l6ZSA+IDEwMCkge1xuICAgIGNvbnN0IG9sZGVzdEtleSA9IGZ1enp5U2VhcmNoQ2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICBpZiAob2xkZXN0S2V5KSB7XG4gICAgICBmdXp6eVNlYXJjaENhY2hlLmRlbGV0ZShvbGRlc3RLZXkpO1xuICAgIH1cbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBc3luYyBGaWxlIFNlYXJjaCB3aXRoIENvbmN1cnJlbmN5IENvbnRyb2wgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdCB7XG4gIGZpbGVzOiBzdHJpbmdbXTtcbiAgY291bnQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBzZWFyY2ggZm9yIGZpbGVzIG1hdGNoaW5nIGEgcGF0dGVybiB1c2luZyBhc3luYy9hd2FpdCB3aXRoIGNvbmN1cnJlbmN5IGNvbnRyb2wuXG4gKiBNdWNoIGZhc3RlciB0aGFuIHN5bmNocm9ub3VzIHJlYWRkaXJTeW5jIGZvciBsYXJnZSBkaXJlY3RvcnkgdHJlZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kRmlsZXNBc3luYyhcbiAgZGlyUGF0aDogc3RyaW5nLFxuICBwYXR0ZXJuOiBzdHJpbmcsXG4gIG1heERlcHRoOiBudW1iZXIgPSA1LFxuICBjb25jdXJyZW5jeUxpbWl0OiBudW1iZXIgPSA0XG4pOiBQcm9taXNlPFNlYXJjaFJlc3VsdD4ge1xuICBjb25zdCByZXN1bHRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBwYXR0ZXJuTG93ZXIgPSBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gc2VhcmNoRGlyKGN1cnJlbnRQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5yZWFkZGlyKGN1cnJlbnRQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICBcbiAgICAgIC8vIFByb2Nlc3MgZmlsZXMgaW1tZWRpYXRlbHlcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoZW50cnkuaXNGaWxlKCkgJiYgZW50cnkubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHBhdHRlcm5Mb3dlcikpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlbnRyeS5uYW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ29sbGVjdCBzdWJkaXJlY3RvcmllcyBmb3IgcGFyYWxsZWwgcHJvY2Vzc2luZ1xuICAgICAgY29uc3Qgc3ViZGlycyA9IGVudHJpZXMuZmlsdGVyKGUgPT4gZS5pc0RpcmVjdG9yeSgpKS5tYXAoZSA9PiBwYXRoLmpvaW4oY3VycmVudFBhdGgsIGUubmFtZSkpO1xuICAgICAgXG4gICAgICBpZiAoc3ViZGlycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIFByb2Nlc3MgZGlyZWN0b3JpZXMgaW4gYmF0Y2hlcyB0byBhdm9pZCBvdmVyd2hlbG1pbmcgdGhlIHN5c3RlbVxuICAgICAgICBjb25zdCBiYXRjaGVzOiBzdHJpbmdbXVtdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViZGlycy5sZW5ndGg7IGkgKz0gY29uY3VycmVuY3lMaW1pdCkge1xuICAgICAgICAgIGJhdGNoZXMucHVzaChzdWJkaXJzLnNsaWNlKGksIGkgKyBjb25jdXJyZW5jeUxpbWl0KSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGJhdGNoIG9mIGJhdGNoZXMpIHtcbiAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIGJhdGNoLm1hcChkaXIgPT4gc2VhcmNoRGlyKGRpciwgZGVwdGggKyAxKSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3RvcmllcyBzaWxlbnRseVxuICAgIH1cbiAgfVxuXG4gIGF3YWl0IHNlYXJjaERpcihkaXJQYXRoLCAwKTtcbiAgcmV0dXJuIHsgZmlsZXM6IHJlc3VsdHMsIGNvdW50OiByZXN1bHRzLmxlbmd0aCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTdHJlYW1pbmcgRmlsZSBSZWFkZXIgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFN0cmVhbVJlYWRSZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICBkYXRhPzoge1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICBwYXRoOiBzdHJpbmc7XG4gICAgdG90YWxMZW5ndGg6IG51bWJlcjtcbiAgICB0cnVuY2F0ZWQ/OiBib29sZWFuO1xuICAgIG5vdGU/OiBzdHJpbmc7XG4gIH07XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlYWQgZmlsZSBjb250ZW50IHVzaW5nIHN0cmVhbWluZyB0byBhdm9pZCBsb2FkaW5nIGVudGlyZSBmaWxlIGludG8gbWVtb3J5LlxuICogUmVzcGVjdHMgbWF4X2xlbmd0aCBwYXJhbWV0ZXIgYnkgcmVhZGluZyBvbmx5IG5lY2Vzc2FyeSBjaHVua3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZVN5bmMoXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIG1heExlbmd0aDogbnVtYmVyID0gNTAwMFxuKTogUHJvbWlzZTxTdHJlYW1SZWFkUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IGZpbGUgc3RhdHMgZmlyc3QgdG8ga25vdyB0b3RhbCBzaXplXG4gICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBmcy5zdGF0KGZpbGVQYXRoKTtcbiAgICBcbiAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUGF0aCBpcyBhIGRpcmVjdG9yeSwgbm90IGEgZmlsZScgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBmaWxlIGlzIHNtYWxsIGVub3VnaCwgcmVhZCBlbnRpcmVseSAoZmFzdGVyIGZvciBzbWFsbCBmaWxlcylcbiAgICBpZiAoc3RhdHMuc2l6ZSA8PSBtYXhMZW5ndGggKiAyKSB7IC8vIDJ4IGZhY3RvciBmb3IgVVRGLTggZW5jb2Rpbmcgb3ZlcmhlYWRcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgY29udGVudCxcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICB0b3RhbExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZvciBsYXJnZSBmaWxlcywgdXNlIHN0cmVhbWluZyByZWFkXG4gICAgY29uc3QgeyBjcmVhdGVSZWFkU3RyZWFtIH0gPSBhd2FpdCBpbXBvcnQoJ2ZzJyk7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgY29udGVudCA9ICcnO1xuICAgICAgbGV0IGJ5dGVzUmVhZCA9IDA7XG4gICAgICBjb25zdCBzdHJlYW0gPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoLCB7IFxuICAgICAgICBlbmNvZGluZzogJ3V0Zi04JyxcbiAgICAgICAgaGlnaFdhdGVyTWFyazogNjQgKiAxMDI0IC8vIDY0S0IgY2h1bmtzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlciB8IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBjaHVua1N0ciA9IHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycgPyBjaHVuayA6IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgIGJ5dGVzUmVhZCArPSBjaHVua1N0ci5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICAvLyBPbmx5IGFjY3VtdWxhdGUgaWYgd2UgaGF2ZW4ndCBleGNlZWRlZCBtYXggbGVuZ3RoIHlldFxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggKyBjaHVua1N0ci5sZW5ndGggPD0gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgY29udGVudCArPSBjaHVua1N0cjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUYWtlIG9ubHkgd2hhdCBmaXRzIGFuZCBzdG9wIHJlYWRpbmdcbiAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBtYXhMZW5ndGggLSBjb250ZW50Lmxlbmd0aDtcbiAgICAgICAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgICAgICAgY29udGVudCArPSBjaHVua1N0ci5zdWJzdHJpbmcoMCwgcmVtYWluaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RyZWFtLmRlc3Ryb3koKTsgLy8gU3RvcCB0aGUgc3RyZWFtIGVhcmx5XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaXNUcnVuY2F0ZWQgPSBieXRlc1JlYWQgPiBtYXhMZW5ndGggfHwgc3RhdHMuc2l6ZSA+IG1heExlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgdG90YWxMZW5ndGg6IE1hdGgubWF4KGJ5dGVzUmVhZCwgY29udGVudC5sZW5ndGgpLFxuICAgICAgICAgICAgLi4uKGlzVHJ1bmNhdGVkICYmIHsgXG4gICAgICAgICAgICAgIHRydW5jYXRlZDogdHJ1ZSwgXG4gICAgICAgICAgICAgIG5vdGU6IGBPdXRwdXQgdHJ1bmNhdGVkIHRvICR7bWF4TGVuZ3RofSBjaGFyYWN0ZXJzLiBVc2UgbWF4X2xlbmd0aCBwYXJhbWV0ZXIgdG8gcmVhZCBtb3JlLmAgXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJlYWQgZmlsZTogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBSZXF1ZXN0IENhY2hpbmcgZm9yIFdlYiBSZXNlYXJjaCA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQ2FjaGVkUmVzcG9uc2Uge1xuICBkYXRhOiB1bmtub3duO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgc3RhdHVzOiBudW1iZXI7XG59XG5cbmNvbnN0IHJlcXVlc3RDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBDYWNoZWRSZXNwb25zZT4oKTtcbmNvbnN0IFJFUVVFU1RfQ0FDSEVfVFRMX01TID0gMzBfMDAwOyAvLyAzMCBzZWNvbmQgY2FjaGUgVFRMIGZvciBzZWFyY2ggcmVzdWx0c1xuXG4vKiogQ2xlYXIgcmVxdWVzdCBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJSZXF1ZXN0Q2FjaGUoKTogdm9pZCB7XG4gIHJlcXVlc3RDYWNoZS5jbGVhcigpO1xufVxuXG4vKipcbiAqIEZldGNoIHdpdGggY2FjaGluZyB0byBhdm9pZCByZWR1bmRhbnQgbmV0d29yayByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aENhY2hlKFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IFJlcXVlc3RJbml0XG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7dXJsfToke0pTT04uc3RyaW5naWZ5KG9wdGlvbnMpfWA7XG4gIFxuICAvLyBDaGVjayBjYWNoZSBmaXJzdCAoR0VUIHJlcXVlc3RzIG9ubHkpXG4gIGlmIChvcHRpb25zPy5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIGNvbnN0IGNhY2hlZCA9IHJlcXVlc3RDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgIGlmIChjYWNoZWQgJiYgRGF0ZS5ub3coKSAtIGNhY2hlZC50aW1lc3RhbXAgPCBSRVFVRVNUX0NBQ0hFX1RUTF9NUykge1xuICAgICAgLy8gUmV0dXJuIGEgUmVzcG9uc2UtbGlrZSBvYmplY3QgZnJvbSBjYWNoZVxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShjYWNoZWQuZGF0YSksIHtcbiAgICAgICAgc3RhdHVzOiBjYWNoZWQuc3RhdHVzLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCBvcHRpb25zKTtcbiAgXG4gIC8vIENhY2hlIHN1Y2Nlc3NmdWwgcmVzcG9uc2VzXG4gIGlmIChyZXNwb25zZS5vayAmJiBvcHRpb25zPy5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgcmVxdWVzdENhY2hlLnNldChjYWNoZUtleSwge1xuICAgICAgICBkYXRhLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vIEV2aWN0IG9sZCBlbnRyaWVzIGlmIGNhY2hlIGdyb3dzIHRvbyBsYXJnZSAobWF4IDUwIGVudHJpZXMpXG4gICAgICBpZiAocmVxdWVzdENhY2hlLnNpemUgPiA1MCkge1xuICAgICAgICBjb25zdCBvbGRlc3RLZXkgPSByZXF1ZXN0Q2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICAgICAgaWYgKG9sZGVzdEtleSkge1xuICAgICAgICAgIHJlcXVlc3RDYWNoZS5kZWxldGUob2xkZXN0S2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gTm9uLUpTT04gcmVzcG9uc2VzIGFyZSBub3QgY2FjaGVkXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIFJldHJ5IGxvZ2ljIHdpdGggZXhwb25lbnRpYWwgYmFja29mZiBmb3IgZmFpbGVkIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hXaXRoUmV0cnkoXG4gIHVybDogc3RyaW5nLFxuICBvcHRpb25zPzogUmVxdWVzdEluaXQsXG4gIG1heFJldHJpZXM6IG51bWJlciA9IDMsXG4gIGJhc2VEZWxheU1zOiBudW1iZXIgPSAxMDAwXG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gIFxuICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8PSBtYXhSZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhDYWNoZSh1cmwsIG9wdGlvbnMpO1xuICAgICAgXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rICYmIHJlc3BvbnNlLnN0YXR1cyA+PSA1MDApIHtcbiAgICAgICAgLy8gU2VydmVyIGVycm9yIC0gcmV0cnlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJ2ZXIgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgIGxhc3RFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgIFxuICAgICAgaWYgKGF0dGVtcHQgPCBtYXhSZXRyaWVzKSB7XG4gICAgICAgIGNvbnN0IGRlbGF5TXMgPSBiYXNlRGVsYXlNcyAqIE1hdGgucG93KDIsIGF0dGVtcHQpOyAvLyBFeHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheU1zKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICB0aHJvdyBsYXN0RXJyb3IgfHwgbmV3IEVycm9yKGBSZXF1ZXN0IGZhaWxlZCBhZnRlciAke21heFJldHJpZXN9IHJldHJpZXNgKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU3VicHJvY2VzcyBUaW1lb3V0IENhbGN1bGF0b3IgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBDYWxjdWxhdGUgYXBwcm9wcmlhdGUgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemUuXG4gKiBMYXJnZXIgcHJvamVjdHMgbmVlZCBtb3JlIHRpbWUgZm9yIGFuYWx5c2lzIHRvb2xzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5hbHlzaXNUaW1lb3V0KGJhc2VUaW1lb3V0TXM6IG51bWJlciwgZmlsZUNvdW50PzogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKCFmaWxlQ291bnQpIHJldHVybiBiYXNlVGltZW91dE1zO1xuICBcbiAgLy8gU2NhbGUgdGltZW91dCBsb2dhcml0aG1pY2FsbHkgd2l0aCBmaWxlIGNvdW50XG4gIGNvbnN0IHNjYWxlRmFjdG9yID0gTWF0aC5sb2cyKE1hdGgubWF4KDEsIGZpbGVDb3VudCkpIC8gMTA7IC8vIH4xeCBmb3IgMS0xMCBmaWxlcywgfjJ4IGZvciAxMDAwKyBmaWxlc1xuICBjb25zdCBzY2FsZWRUaW1lb3V0ID0gYmFzZVRpbWVvdXRNcyAqICgxICsgc2NhbGVGYWN0b3IpO1xuICBcbiAgLy8gQ2FwIGF0IDYwIHNlY29uZHMgbWF4aW11bVxuICByZXR1cm4gTWF0aC5taW4oc2NhbGVkVGltZW91dCwgNjBfMDAwKTtcbn1cblxuLyoqXG4gKiBDb3VudCBUeXBlU2NyaXB0IGZpbGVzIGluIGEgZGlyZWN0b3J5IHRvIGVzdGltYXRlIHByb2plY3Qgc2l6ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvdW50VHlwZVNjcmlwdEZpbGVzKGRpclBhdGg6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGxldCBjb3VudCA9IDA7XG4gIFxuICBhc3luYyBmdW5jdGlvbiBjb3VudEluRGlyKGN1cnJlbnRQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZGVwdGggPiAxMCkgcmV0dXJuOyAvLyBSZWFzb25hYmxlIG1heCBkZXB0aFxuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucmVhZGRpcihjdXJyZW50UGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy50cycpKSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgLy8gU2tpcCBjb21tb24gbm9uLXNvdXJjZSBkaXJlY3Rvcmllc1xuICAgICAgICAgIGlmICghWydub2RlX21vZHVsZXMnLCAnLmdpdCcsICdkaXN0JywgJ2J1aWxkJ10uaW5jbHVkZXMoZW50cnkubmFtZSkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNvdW50SW5EaXIocGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlbnRyeS5uYW1lKSwgZGVwdGggKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIGRpcmVjdG9yaWVzXG4gICAgfVxuICB9XG4gIFxuICBhd2FpdCBjb3VudEluRGlyKGRpclBhdGgsIDApO1xuICByZXR1cm4gY291bnQ7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuLi9zdGF0ZU1hbmFnZXIuanMnO1xuaW1wb3J0IHsgdmFsaWRhdGVQYXRoLCBpc1NhZmVSZWdleCB9IGZyb20gJy4uL3NlY3VyaXR5LmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIsIHNldFdvcmtpbmdEaXIsIHJlc29sdmVQYXRoIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5pbXBvcnQge1xuICBsZXZlbnNodGVpblNpbWlsYXJpdHksXG4gIGdldENhY2hlZEZ1enp5UmVzdWx0cyxcbiAgY2FjaGVGdXp6eVJlc3VsdHMsXG4gIGZpbmRGaWxlc0FzeW5jLFxuICBjb3VudFR5cGVTY3JpcHRGaWxlcyxcbiAgZ2V0QW5hbHlzaXNUaW1lb3V0LFxufSBmcm9tICcuLi9wZXJmb3JtYW5jZVV0aWxzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIExpc3REaXJlY3RvcnlQYXJhbXMgeyBwYXRoPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmVhZEZpbGVQYXJhbXMgeyBmaWxlX25hbWU6IHN0cmluZzsgbWF4X2xlbmd0aD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIFNhdmVGaWxlUGFyYW1zIHsgZmlsZV9uYW1lPzogc3RyaW5nOyBjb250ZW50Pzogc3RyaW5nOyBmaWxlcz86IEFycmF5PHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZyB9PjsgfVxuaW50ZXJmYWNlIFJlcGxhY2VUZXh0SW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IG9sZF9zdHJpbmc6IHN0cmluZzsgbmV3X3N0cmluZzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgSW5zZXJ0QXRMaW5lUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGxpbmVfbnVtYmVyOiBudW1iZXI7IGNvbnRlbnRfdG9faW5zZXJ0OiBzdHJpbmc7IH1cbmludGVyZmFjZSBBcHBlbmRGaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IHN0YXJ0X2xpbmU6IG51bWJlcjsgZW5kX2xpbmU/OiBudW1iZXI7IH1cbmludGVyZmFjZSBNYWtlRGlyZWN0b3J5UGFyYW1zIHsgZGlyZWN0b3J5X25hbWU6IHN0cmluZzsgfVxuaW50ZXJmYWNlIE1vdmVGaWxlUGFyYW1zIHsgc291cmNlOiBzdHJpbmc7IGRlc3RpbmF0aW9uOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDb3B5RmlsZVBhcmFtcyB7IHNvdXJjZTogc3RyaW5nOyBkZXN0aW5hdGlvbjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRGVsZXRlUGF0aFBhcmFtcyB7IHBhdGg6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRmluZEZpbGVzUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyBtYXhfZGVwdGg/OiBudW1iZXI7IH1cbmludGVyZmFjZSBGdXp6eUZpbmRMb2NhbEZpbGVzUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgcGF0aD86IHN0cmluZzsgbWF4X3Jlc3VsdHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHZXRGaWxlTWV0YWRhdGFQYXJhbXMgeyBwYXRoOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGFuZ2VEaXJlY3RvcnlQYXJhbXMgeyBkaXJlY3Rvcnk6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJlYWREb2N1bWVudFBhcmFtcyB7IGZpbGVfcGF0aDogc3RyaW5nOyB9XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgX3N0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGxpc3RfZGlyZWN0b3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbGlzdF9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCB0aGUgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IG9yIGEgc3BlY2lmaWVkIHN1YmRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIHBhdGggdG8gdGhlIGRpcmVjdG9yeSB0byBsaXN0LiBEZWZhdWx0cyB0byBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGg6IGRpclBhdGggfTogTGlzdERpcmVjdG9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IGRpclBhdGggfHwgJy4nO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgodGFyZ2V0UGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKHRhcmdldFBhdGgpO1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZnVsbFBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZW50cmllcy5tYXAoZW50cnkgPT4gKHtcbiAgICAgICAgICBwYXRoOiBwYXRoLmpvaW4oZnVsbFBhdGgsIGVudHJ5Lm5hbWUpLFxuICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXG4gICAgICAgICAgaXNEaXJlY3Rvcnk6IGVudHJ5LmlzRGlyZWN0b3J5KCksXG4gICAgICAgICAgaXNGaWxlOiBlbnRyeS5pc0ZpbGUoKSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlYWRfZmlsZSB0b29sIFx1MjAxNCBIeWJyaWQ6IEVhcmx5IHNpemUgY2hlY2sgKyBCdWZmZXIgYmluYXJ5IGRldGVjdGlvbiArIFRydW5jYXRpb24gc3VwcG9ydFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCBjb250ZW50IGZyb20gYSBmaWxlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byByZWFkJyksXG4gICAgICBtYXhfbGVuZ3RoOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTAwMDApLm9wdGlvbmFsKCkuZGVmYXVsdCg1MDAwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyB0byByZXR1cm4gKGRlZmF1bHQ6IDUwMDApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBtYXhfbGVuZ3RoIH06IFJlYWRGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gbWF4X2xlbmd0aCB8fCA1MDAwO1xuXG4gICAgICAgIC8vIEVhcmx5IHNpemUgY2hlY2sgKEJlbGVkYXJpYW4gc3R5bGUpIC0gcHJldmVudCBsb2FkaW5nID4xME1CIGZpbGVzXG4gICAgICAgIGxldCBzdGF0czogZnMuU3RhdHM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdHMuc2l6ZSA+IDEwXzAwMF8wMDApIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGaWxlIHRvbyBsYXJnZSAoPjEwTUIpJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVhZCBhcyBidWZmZXIgZm9yIGVmZmljaWVudCBiaW5hcnkgY2hlY2sgKEJlbGVkYXJpYW4gc3R5bGUpXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRGaWxlKGZ1bGxQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEJpbmFyeSBjaGVjazogbnVsbCBieXRlIGluIGZpcnN0IDFLQlxuICAgICAgICBjb25zdCBjaGVja0J1ZmZlciA9IGJ1ZmZlci5zdWJhcnJheSgwLCBNYXRoLm1pbihidWZmZXIubGVuZ3RoLCAxMDI0KSk7XG4gICAgICAgIGlmIChjaGVja0J1ZmZlci5pbmNsdWRlcygwKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0JpbmFyeSBmaWxlIGRldGVjdGVkLiBVc2UgcmVhZF9kb2N1bWVudCBmb3IgUERGL0RPQ1ggZmlsZXMuJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICAgICAgY29uc3QgY29udGVudCA9IGJ1ZmZlci50b1N0cmluZygndXRmLTgnKTtcblxuICAgICAgICAvLyBUcnVuY2F0ZSBpZiBuZWNlc3NhcnkgYW5kIGFkZCBtZXRhZGF0YSAoQUkgVG9vbGJveCBzdHlsZSlcbiAgICAgICAgbGV0IGRhdGFDb250ZW50ID0gY29udGVudDtcbiAgICAgICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgdG90YWxMZW5ndGggPSBjb250ZW50Lmxlbmd0aDtcblxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggPiBtYXhMZW5ndGgpIHtcbiAgICAgICAgICBkYXRhQ29udGVudCA9IGNvbnRlbnQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCk7XG4gICAgICAgICAgdHJ1bmNhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBjb250ZW50OiBkYXRhQ29udGVudCxcbiAgICAgICAgICAgIGZpbGVQYXRoOiBmdWxsUGF0aCwgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgICAgLi4uKHRydW5jYXRlZCA/IHsgdHJ1bmNhdGVkOiB0cnVlLCB0b3RhbF9sZW5ndGg6IHRvdGFsTGVuZ3RoIH0gOiB7fSlcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzYXZlX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzYXZlX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBjb250ZW50IHRvIGEgc3BlY2lmaWVkIGZpbGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFN1cHBvcnRzIGJhdGNoIHNhdmluZy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byBzYXZlJyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBjb250ZW50IHRvIHdyaXRlIHRvIHRoZSBmaWxlJyksXG4gICAgICBmaWxlczogei5hcnJheSh6Lm9iamVjdCh7IGZpbGVfbmFtZTogei5zdHJpbmcoKSwgY29udGVudDogei5zdHJpbmcoKSB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRm9yIGJhdGNoIHNhdmluZyBtdWx0aXBsZSBmaWxlcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCwgZmlsZXMgfTogU2F2ZUZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChmaWxlcyAmJiBBcnJheS5pc0FycmF5KGZpbGVzKSkge1xuICAgICAgICAgIC8vIEJhdGNoIHNhdmUgbW9kZVxuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGUuZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEludmFsaWQgcGF0aCBpbiBiYXRjaDogJHtmaWxlLmZpbGVfbmFtZX1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGUuZmlsZV9uYW1lKTtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGZpbGUuY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBmaWxlOiBmdWxsUGF0aCwgc3RhdHVzOiAnc2F2ZWQnIH0pOyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWRGaWxlczogZmlsZXMubGVuZ3RoLCByZXN1bHRzIH0gfTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWxlX25hbWUgJiYgY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gU2luZ2xlIGZpbGUgc2F2ZSBtb2RlXG4gICAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNhdmVkRmlsZTogZnVsbFBhdGgsIHBhdGg6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VpdGhlciBwcm92aWRlIGZpbGVfbmFtZStjb250ZW50IG9yIGZpbGVzIGFycmF5JyB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZXBsYWNlX3RleHRfaW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlcGxhY2VfdGV4dF9pbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlcGxhY2UgYSBzcGVjaWZpYyBzdHJpbmcgaW4gYSBmaWxlIHdpdGggYSBuZXcgc3RyaW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIG9sZF9zdHJpbmc6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBleGFjdCB0ZXh0IHRvIHJlcGxhY2UuIE11c3QgYmUgdW5pcXVlIGluIHRoZSBmaWxlLicpLFxuICAgICAgbmV3X3N0cmluZzogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgdG8gaW5zZXJ0IGluIHBsYWNlIG9mIG9sZF9zdHJpbmcuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBvbGRfc3RyaW5nLCBuZXdfc3RyaW5nIH06IFJlcGxhY2VUZXh0SW5GaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWNvbnRlbnQuaW5jbHVkZXMob2xkX3N0cmluZykpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBTdHJpbmcgJyR7b2xkX3N0cmluZ30nIG5vdCBmb3VuZCBpbiBmaWxlYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBuZXdDb250ZW50ID0gY29udGVudC5yZXBsYWNlKG9sZF9zdHJpbmcsIG5ld19zdHJpbmcpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBuZXdDb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyByZXBsYWNlZDogdHJ1ZSwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBpbnNlcnRfYXRfbGluZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2luc2VydF9hdF9saW5lJyxcbiAgICBkZXNjcmlwdGlvbjogJ0luc2VydCBjb250ZW50IGF0IGEgc3BlY2lmaWMgbGluZSBudW1iZXIgaW4gYSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIGxpbmVfbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnVGhlIGxpbmUgbnVtYmVyIHRvIGluc2VydCBhdCAoMS1pbmRleGVkKScpLFxuICAgICAgY29udGVudF90b19pbnNlcnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gaW5zZXJ0JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBsaW5lX251bWJlciwgY29udGVudF90b19pbnNlcnQgfTogSW5zZXJ0QXRMaW5lUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFsbG93IGFwcGVuZGluZyBhdCBFT0YgKGxpbmVfbnVtYmVyID09IGxlbmd0aCArIDEpXG4gICAgICAgIGlmIChsaW5lX251bWJlciA+IGxpbmVzLmxlbmd0aCArIDEpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBMaW5lIG51bWJlciAke2xpbmVfbnVtYmVyfSBleGNlZWRzIGZpbGUgbGVuZ3RoICgke2xpbmVzLmxlbmd0aH0pYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsaW5lcy5zcGxpY2UobGluZV9udW1iZXIgLSAxLCAwLCBjb250ZW50X3RvX2luc2VydCk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGxpbmVzLmpvaW4oJ1xcbicpLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpbnNlcnRlZEF0OiBsaW5lX251bWJlciwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBhcHBlbmRfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2FwcGVuZF9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogXCJBcHBlbmQgY29udGVudCB0byB0aGUgZW5kIG9mIGEgZmlsZS4gSWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdCwgaXQgd2lsbCBiZSBjcmVhdGVkLlwiLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gYXBwZW5kIHRvJyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCBjb250ZW50IHRvIGFwcGVuZCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCB9OiBBcHBlbmRGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhmdWxsUGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYXBwZW5kZWRUbzogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfbGluZXNfaW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9saW5lc19pbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIHNwZWNpZmljIGxpbmUgb3IgcmFuZ2Ugb2YgbGluZXMgZnJvbSBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIG1vZGlmeScpLFxuICAgICAgc3RhcnRfbGluZTogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1N0YXJ0aW5nIGxpbmUgbnVtYmVyICgxLWluZGV4ZWQpJyksXG4gICAgICBlbmRfbGluZTogei5udW1iZXIoKS5pbnQoKS5taW4oMSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRW5kaW5nIGxpbmUgbnVtYmVyIChpbmNsdXNpdmUpLiBJZiBvbWl0dGVkLCBvbmx5IGRlbGV0ZXMgc3RhcnRfbGluZS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIHN0YXJ0X2xpbmUsIGVuZF9saW5lIH06IERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBsZXQgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGRlbGV0ZUVuZCA9IGVuZF9saW5lIHx8IHN0YXJ0X2xpbmU7XG4gICAgICAgIGlmIChzdGFydF9saW5lID4gbGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3RhcnQgbGluZSAke3N0YXJ0X2xpbmV9IGV4Y2VlZHMgZmlsZSBsZW5ndGggKCR7bGluZXMubGVuZ3RofSlgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsYW1wIGVuZF9saW5lIHRvIGF2b2lkIHNpbGVudCB0cnVuY2F0aW9uIGJleW9uZCBmaWxlIGJvdW5kc1xuICAgICAgICBjb25zdCBjbGFtcGVkRW5kID0gTWF0aC5taW4oZGVsZXRlRW5kLCBsaW5lcy5sZW5ndGgpO1xuICAgICAgICBsaW5lcy5zcGxpY2Uoc3RhcnRfbGluZSAtIDEsIGNsYW1wZWRFbmQgLSBzdGFydF9saW5lICsgMSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGxpbmVzLmpvaW4oJ1xcbicpLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkTGluZXM6IGAke3N0YXJ0X2xpbmV9LSR7Y2xhbXBlZEVuZH1gLCBmaWxlOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG1ha2VfZGlyZWN0b3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbWFrZV9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IGRpcmVjdG9yeSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5IHRvIGNyZWF0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGRpcmVjdG9yeV9uYW1lIH06IE1ha2VEaXJlY3RvcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGRpcmVjdG9yeV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZGlyZWN0b3J5X25hbWUpO1xuICAgICAgICBmcy5ta2RpclN5bmMoZnVsbFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWREaXJlY3Rvcnk6IGRpcmVjdG9yeV9uYW1lLCBwYXRoOiBmdWxsUGF0aCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBtb3ZlX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdtb3ZlX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnTW92ZSBvciByZW5hbWUgYSBmaWxlIG9yIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNvdXJjZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU291cmNlIHBhdGgnKSxcbiAgICAgIGRlc3RpbmF0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXN0aW5hdGlvbiBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9OiBNb3ZlRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoc291cmNlLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzb3VyY2UgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkZXN0aW5hdGlvbiwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZGVzdGluYXRpb24gcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsU291cmNlID0gcmVzb2x2ZVBhdGgoc291cmNlKTtcbiAgICAgICAgY29uc3QgZnVsbERlc3RpbmF0aW9uID0gcmVzb2x2ZVBhdGgoZGVzdGluYXRpb24pO1xuICAgICAgICBmcy5yZW5hbWVTeW5jKGZ1bGxTb3VyY2UsIGZ1bGxEZXN0aW5hdGlvbik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbW92ZWRGcm9tOiBmdWxsU291cmNlLCBtb3ZlZFRvOiBmdWxsRGVzdGluYXRpb24gfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIU1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY29weV9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY29weV9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvcHkgYSBmaWxlIHRvIGEgbmV3IGxvY2F0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc291cmNlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTb3VyY2UgZmlsZSBwYXRoJyksXG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnRGVzdGluYXRpb24gZmlsZSBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9OiBDb3B5RmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoc291cmNlLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzb3VyY2UgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkZXN0aW5hdGlvbiwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZGVzdGluYXRpb24gcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsU291cmNlID0gcmVzb2x2ZVBhdGgoc291cmNlKTtcbiAgICAgICAgY29uc3QgZnVsbERlc3RpbmF0aW9uID0gcmVzb2x2ZVBhdGgoZGVzdGluYXRpb24pO1xuICAgICAgICBmcy5jb3B5RmlsZVN5bmMoZnVsbFNvdXJjZSwgZnVsbERlc3RpbmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb3BpZWRGcm9tOiBmdWxsU291cmNlLCBjb3BpZWRUbzogZnVsbERlc3RpbmF0aW9uIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFNcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9wYXRoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX3BhdGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIGEgZmlsZSBvciBkaXJlY3RvcnkgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIEJlIGNhcmVmdWwhJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgcGF0aCB0byBkZWxldGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoOiBmaWxlUGF0aCB9OiBEZWxldGVQYXRoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgYSBkaXJlY3RvcnlcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhmdWxsUGF0aCk7XG4gICAgICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgZnMucm1TeW5jKGZ1bGxQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcy51bmxpbmtTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWQ6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2ZpbGVzX2J5X3BhdHRlcm4gdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfZmlsZXNfYnlfcGF0dGVybicsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgbXVsdGlwbGUgZmlsZXMgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IHRoYXQgbWF0Y2ggYSByZWdleCBwYXR0ZXJuLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0dGVybjogei5zdHJpbmcoKS5kZXNjcmliZSgnUmVnZXggcGF0dGVybiB0byBtYXRjaCBmaWxlbmFtZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXR0ZXJuIH06IERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoY29uZmlnLnJlZ2V4UmVEb1NQcm90ZWN0aW9uICYmICFpc1NhZmVSZWdleChwYXR0ZXJuKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Vuc2FmZSByZWdleCBwYXR0ZXJuIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybik7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZ2V0V29ya2luZ0RpcigpKTtcbiAgICAgICAgY29uc3QgZGVsZXRlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgaWYgKHJlZ2V4LnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgIGRlbGV0ZWRGaWxlcy5wdXNoKGZ1bGxQYXRoKTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkQ291bnQ6IGRlbGV0ZWRGaWxlcy5sZW5ndGgsIGRlbGV0ZWRGaWxlcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmaW5kX2ZpbGVzIHRvb2wgXHUyMDE0IE9QVElNSVpFRCB3aXRoIGFzeW5jL2F3YWl0IGFuZCBjb25jdXJyZW5jeSBjb250cm9sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ZpbmRfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmluZCBmaWxlcyByZWN1cnNpdmVseSBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnkgbWF0Y2hpbmcgYSBuYW1lIHBhdHRlcm4uIFVzZXMgYXN5bmMgc2VhcmNoIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXR0ZXJuOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTdWJzdHJpbmcgdG8gbWF0Y2ggaW4gZmlsZW5hbWUgKGNhc2UtaW5zZW5zaXRpdmUpJyksXG4gICAgICBtYXhfZGVwdGg6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01heGltdW0gZGVwdGggdG8gc2VhcmNoIChkZWZhdWx0OiA1KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdHRlcm4sIG1heF9kZXB0aCB9OiBGaW5kRmlsZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaFBhdGggPSBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IGRlcHRoID0gbWF4X2RlcHRoIHx8IDU7XG4gICAgICAgIFxuICAgICAgICAvLyBVc2Ugb3B0aW1pemVkIGFzeW5jIHNlYXJjaCB3aXRoIGNvbmN1cnJlbmN5IGNvbnRyb2xcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmluZEZpbGVzQXN5bmMoc2VhcmNoUGF0aCwgcGF0dGVybiwgZGVwdGgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGZvdW5kRmlsZXM6IHJlc3VsdC5maWxlcywgY291bnQ6IHJlc3VsdC5jb3VudCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmdXp6eV9maW5kX2xvY2FsX2ZpbGVzIHRvb2wgXHUyMDE0IE9QVElNSVpFRCB3aXRoIGVhcmx5IGV4aXQgTGV2ZW5zaHRlaW4gKyBjYWNoaW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Z1enp5X2ZpbmRfbG9jYWxfZmlsZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRnV6enkgZmluZCBsb2NhbCBmaWxlcyBieSBwYXRoL25hbWUgc2ltaWxhcml0eSB1c2luZyBvcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gc2NvcmluZyB3aXRoIGNhY2hpbmcuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRvIG1hdGNoIGFnYWluc3QgZmlsZSBuYW1lcy9wYXRocy4nKSxcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnU3ViLWRpcmVjdG9yeSB0byBzZWFyY2ggaW4gKGRlZmF1bHQ6IGN1cnJlbnQgZGlyZWN0b3J5KS4nKSxcbiAgICAgIG1heF9yZXN1bHRzOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoMjApLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ01heCByZXN1bHRzIHRvIHJldHVybiAoZGVmYXVsdDogNSkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIHBhdGg6IHNlYXJjaFBhdGgsIG1heF9yZXN1bHRzIH06IEZ1enp5RmluZExvY2FsRmlsZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJhc2VEaXIgPSBzZWFyY2hQYXRoID8gcmVzb2x2ZVBhdGgoc2VhcmNoUGF0aCkgOiBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IG1heFJlc3VsdHMgPSBtYXhfcmVzdWx0cyB8fCA1O1xuXG4gICAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XG4gICAgICAgIGNvbnN0IGNhY2hlZFJlc3VsdHMgPSBnZXRDYWNoZWRGdXp6eVJlc3VsdHMocXVlcnksIGJhc2VEaXIpO1xuICAgICAgICBpZiAoY2FjaGVkUmVzdWx0cykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbWF0Y2hlczogY2FjaGVkUmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKSwgY291bnQ6IE1hdGgubWluKGNhY2hlZFJlc3VsdHMubGVuZ3RoLCBtYXhSZXN1bHRzKSB9IH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb2xsZWN0IGZpbGVzIHVzaW5nIGFzeW5jIG1ldGhvZFxuICAgICAgICBjb25zdCBhbGxGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RGaWxlcyhkaXJQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIgPSAwLCBtYXhEZXB0aDogbnVtYmVyID0gMjApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgICAgIFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihkaXJQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjb2xsZWN0RmlsZXMoZnVsbFBhdGgsIGRlcHRoICsgMSwgbWF4RGVwdGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsbEZpbGVzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3Rvcmllc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYXdhaXQgY29sbGVjdEZpbGVzKGJhc2VEaXIpO1xuICAgICAgICBcbiAgICAgICAgLy8gT3B0aW1pemVkIGZ1enp5IG1hdGNoaW5nIHdpdGggZWFybHkgZXhpdFxuICAgICAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gPSBbXTtcbiAgICAgICAgY29uc3QgcXVlcnlMb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IE1JTl9TQ09SRSA9IDAuMztcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBhbGxGaWxlcykge1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFVzZSBvcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gd2l0aCBlYXJseSBleGl0XG4gICAgICAgICAgY29uc3Qgc2NvcmUgPSBsZXZlbnNodGVpblNpbWlsYXJpdHkocXVlcnlMb3dlciwgZmlsZU5hbWUsIE1JTl9TQ09SRSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHNjb3JlICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBmaWxlUGF0aDogZmlsZSwgc2NvcmUgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTb3J0IGJ5IHNjb3JlIGRlc2NlbmRpbmcgYW5kIGNhY2hlIHJlc3VsdHNcbiAgICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgICAgIGNhY2hlRnV6enlSZXN1bHRzKHF1ZXJ5LCBiYXNlRGlyLCByZXN1bHRzKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbWF0Y2hlczogcmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKSwgY291bnQ6IE1hdGgubWluKHJlc3VsdHMubGVuZ3RoLCBtYXhSZXN1bHRzKSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfZmlsZV9tZXRhZGF0YSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9maWxlX21ldGFkYXRhJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBtZXRhZGF0YSAoc2l6ZSwgZGF0ZXMpIGZvciBhIHNwZWNpZmljIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSBwYXRoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aDogZmlsZVBhdGggfTogR2V0RmlsZU1ldGFkYXRhUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlUGF0aCwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgICAgICBzaXplOiBzdGF0cy5zaXplLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBzdGF0cy5iaXJ0aHRpbWUsXG4gICAgICAgICAgICBtb2RpZmllZEF0OiBzdGF0cy5tdGltZSxcbiAgICAgICAgICAgIGFjY2Vzc2VkQXQ6IHN0YXRzLmF0aW1lLFxuICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IHN0YXRzLmlzRGlyZWN0b3J5KCksXG4gICAgICAgICAgICBpc0ZpbGU6IHN0YXRzLmlzRmlsZSgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjaGFuZ2VfZGlyZWN0b3J5IHRvb2wgXHUyMDE0IEh5YnJpZDogRXhwbGljaXQgdmFsaWRhdGlvbiArIFN0YXRlIGFic3RyYWN0aW9uICsgQ29udGV4dHVhbCByZXNwb25zZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjaGFuZ2VfZGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gQWxsIHN1YnNlcXVlbnQgZmlsZSBvcGVyYXRpb25zIHdpbGwgdXNlIHRoaXMgZGlyZWN0b3J5IGFzIHRoZSBiYXNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZGlyZWN0b3J5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgYWJzb2x1dGUgcGF0aCB0byBjaGFuZ2UgdG8gKGUuZy4sIFwiQzpcXFxcXFxcXFByb2plY3RzXFxcXFxcXFxteS1hcHBcIiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBkaXJlY3RvcnkgfTogQ2hhbmdlRGlyZWN0b3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGRpcmVjdG9yeSk7XG5cbiAgICAgICAgLy8gXHUyNzA1IEJlbGVkYXJpYW4ncyBleHBsaWNpdCB2YWxpZGF0aW9uIHVzaW5nIGZzLnN0YXRcbiAgICAgICAgbGV0IHN0YXRzOiBmcy5TdGF0cztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFBhdGggaXMgbm90IGEgZGlyZWN0b3J5OiAke2Z1bGxQYXRofWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1MjcwNSBDYXB0dXJlIHByZXZpb3VzIGRpcmVjdG9yeSBmb3IgY29udGV4dFxuICAgICAgICBjb25zdCBwcmV2aW91c0RpcmVjdG9yeSA9IGdldFdvcmtpbmdEaXIoKTtcblxuICAgICAgICAvLyBcdTI3MDUgQUkgVG9vbGJveCdzIGFic3RyYWN0aW9uIGZvciBzdGF0ZSBjaGFuZ2VcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IHNldFdvcmtpbmdEaXIoZnVsbFBhdGgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjaGFuZ2UgZGlyZWN0b3J5IHRvICcke2RpcmVjdG9yeX0nLiBFbnN1cmUgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhIHZhbGlkIGRpcmVjdG9yeS5gIFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTI3MDUgQmVsZWRhcmlhbidzIGNvbnRleHR1YWwgcmV0dXJuIGRhdGEgKyBBSSBUb29sYm94J3Mgc3RydWN0dXJlZCBmb3JtYXRcbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgIHByZXZpb3VzX2RpcmVjdG9yeTogcHJldmlvdXNEaXJlY3RvcnksXG4gICAgICAgICAgICBjdXJyZW50X2RpcmVjdG9yeTogZ2V0V29ya2luZ0RpcigpIFxuICAgICAgICAgIH0gXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZWFkX2RvY3VtZW50IHRvb2wgLSBJTVBMRU1FTlRFRCAod2FzIHN0dWIpXG4gIC8vIEZJWEVEOiBSZWxheGVkIHBhdGggdmFsaWRhdGlvbiB0byBhbGxvdyByZWFkaW5nIExNIFN0dWRpbyBhdHRhY2hlZCBmaWxlcyBmcm9tIHRlbXAgZGlyZWN0b3JpZXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9kb2N1bWVudCcsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIGNvbnRlbnQgZnJvbSBQREYgb3IgRE9DWCBmaWxlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfcGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgUERGIG9yIERPQ1ggZmlsZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfcGF0aCB9OiBSZWFkRG9jdW1lbnRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFJlbGF4ZWQgdmFsaWRhdGlvbjogQmxvY2sgdHJhdmVyc2FsIGF0dGFja3MgYnV0IGFsbG93IGFic29sdXRlIHBhdGhzIGZvciBhdHRhY2hlZCBmaWxlc1xuICAgICAgICBpZiAoZmlsZV9wYXRoLmluY2x1ZGVzKCcuLicpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoOiBkaXJlY3RvcnkgdHJhdmVyc2FsIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlX3BhdGgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBleGlzdHNcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGZ1bGxQYXRoKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZpbGUgZG9lcyBub3QgZXhpc3Q6ICR7ZmlsZV9wYXRofWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlX3BhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoZXh0ID09PSAnLnBkZicpIHtcbiAgICAgICAgICAvLyBVc2UgcGRmLXBhcnNlIGxpYnJhcnkgZm9yIFBERiBleHRyYWN0aW9uIFx1MjAxNCBkeW5hbWljIGltcG9ydCB0byBhdm9pZCBFU00gaXNzdWVzXG4gICAgICAgICAgY29uc3QgcGRmUGFyc2VNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ3BkZi1wYXJzZScpO1xuICAgICAgICAgIGNvbnN0IGRhdGFCdWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgpO1xuICAgICAgICAgIGNvbnN0IHBkZkRhdGEgPSBhd2FpdCBwZGZQYXJzZU1vZHVsZS5kZWZhdWx0KGRhdGFCdWZmZXIpO1xuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBmaWxlOiBmdWxsUGF0aCwgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgICAgICB0eXBlOiAnUERGJyxcbiAgICAgICAgICAgICAgcGFnZXM6IHBkZkRhdGEubnVtcGFnZXMsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IHBkZkRhdGEudGV4dC5zdWJzdHJpbmcoMCwgMTAwMDApLCAvLyBMaW1pdCBvdXRwdXQgc2l6ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy5kb2N4Jykge1xuICAgICAgICAgIC8vIFVzZSBtYW1tb3RoIGxpYnJhcnkgZm9yIERPQ1ggZXh0cmFjdGlvbiBcdTIwMTQgZHluYW1pYyBpbXBvcnQgdG8gYXZvaWQgRVNNIGlzc3Vlc1xuICAgICAgICAgIGNvbnN0IG1hbW1vdGhNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ21hbW1vdGgnKTtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtYW1tb3RoTW9kdWxlLmRlZmF1bHQuZXh0cmFjdFJhd1RleHQoeyBidWZmZXI6IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCkgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIGZpbGU6IGZ1bGxQYXRoLCAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgICAgIHR5cGU6ICdET0NYJyxcbiAgICAgICAgICAgICAgY29udGVudDogcmVzdWx0LnZhbHVlLnN1YnN0cmluZygwLCAxMDAwMCksIC8vIExpbWl0IG91dHB1dCBzaXplXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgZG9jdW1lbnQgZm9ybWF0OiAke2V4dH0uIE9ubHkgUERGIGFuZCBET0NYIGFyZSBzdXBwb3J0ZWQuYCB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBhbmFseXplX3Byb2plY3QgdG9vbCBcdTIwMTQgQ29tcHJlaGVuc2l2ZSBUeXBlU2NyaXB0IFBlcmZvcm1hbmNlICYgTGludGluZyBBbmFseXNpc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdhbmFseXplX3Byb2plY3QnLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIHByb2plY3Qtd2lkZSBhbmFseXNpcyBpbmNsdWRpbmcgVHlwZVNjcmlwdCBkaWFnbm9zdGljcywgY2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3Rpb24sIEVTTGludCwgY29uZmlnIG9wdGltaXphdGlvbiwgYW5kIGltcG9ydCBzdHJ1Y3R1cmUgYW5hbHlzaXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjYXRlZ29yaWVzOiB6LmFycmF5KHouZW51bShbJ3R5cGVjaGVjaycsICdjaXJjdWxhcicsICdlc2xpbnQnLCAnY29uZmlnJywgJ2ltcG9ydHMnXSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0FuYWx5c2lzIGNhdGVnb3JpZXMgdG8gcnVuIChkZWZhdWx0OiBhbGwpJyksXG4gICAgICBtYXhfaW1wb3J0c193YXJuaW5nOiB6Lm51bWJlcigpLmludCgpLm1pbig1KS5tYXgoMTAwKS5vcHRpb25hbCgpLmRlZmF1bHQoMjApLmRlc2NyaWJlKCdNYXggaW1wb3J0cyBwZXIgZmlsZSBiZWZvcmUgd2FybmluZycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNhdGVnb3JpZXMsIG1heF9pbXBvcnRzX3dhcm5pbmcgfTogeyBjYXRlZ29yaWVzPzogc3RyaW5nW107IG1heF9pbXBvcnRzX3dhcm5pbmc/OiBudW1iZXIgfSkgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgd29ya2luZ0RpciA9IGdldFdvcmtpbmdEaXIoKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDYXRlZ29yaWVzID0gY2F0ZWdvcmllcyB8fCBbJ3R5cGVjaGVjaycsICdjaXJjdWxhcicsICdlc2xpbnQnLCAnY29uZmlnJywgJ2ltcG9ydHMnXTtcbiAgICAgICAgY29uc3QgaW1wb3J0V2FybmluZ1RocmVzaG9sZCA9IG1heF9pbXBvcnRzX3dhcm5pbmcgfHwgMjA7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gU2FmZSBTdWJwcm9jZXNzIEhlbHBlciB3aXRoIFByb2dyZXNzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGZ1bmN0aW9uIHNwYXduV2l0aFByb2dyZXNzKGV4ZTogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSwgdGltZW91dE1zOiBudW1iZXIpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgc3Rkb3V0Pzogc3RyaW5nOyBzdGRlcnI/OiBzdHJpbmcgfT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvYyA9IHNwYXduKGV4ZSwgYXJncywge1xuICAgICAgICAgICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgICAgICAgICBjd2Q6IHdvcmtpbmdEaXIsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgICAgICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgICAgICAgICBwcm9jLnN0ZG91dD8ub24oJ2RhdGEnLCAoZDogQnVmZmVyKSA9PiB7IHN0ZG91dCArPSBkLnRvU3RyaW5nKCk7IH0pO1xuICAgICAgICAgICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGQ6IEJ1ZmZlcikgPT4geyBzdGRlcnIgKz0gZC50b1N0cmluZygpOyB9KTtcblxuICAgICAgICAgICAgY29uc3QgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4geyBcbiAgICAgICAgICAgICAgcHJvYy5raWxsKCk7IFxuICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIHN0ZGVycjogYFRpbWVvdXQgYWZ0ZXIgJHt0aW1lb3V0TXN9bXNgIH0pOyBcbiAgICAgICAgICAgIH0sIHRpbWVvdXRNcyk7XG5cbiAgICAgICAgICAgIHByb2Mub24oJ2Nsb3NlJywgKCkgPT4geyBjbGVhclRpbWVvdXQodGltZXJJZCk7IHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBzdGRvdXQsIHN0ZGVyciB9KTsgfSk7XG4gICAgICAgICAgICBwcm9jLm9uKCdlcnJvcicsIChlcnIpID0+IHsgY2xlYXJUaW1lb3V0KHRpbWVySWQpOyByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIHN0ZGVycjogZXJyLm1lc3NhZ2UgfSk7IH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQS4gVHlwZVNjcmlwdCBFeHRlbmRlZCBEaWFnbm9zdGljcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW5UeXBlY2hlY2tBbmFseXNpcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgY29uc3QgdHNDb25maWdQYXRoID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICd0c2NvbmZpZy5qc29uJyk7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRzQ29uZmlnUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHRzY29uZmlnLmpzb24gZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdHNjIGlzIGF2YWlsYWJsZVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygndHNjJywgWyctLXZlcnNpb24nXSwgNTAwMCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdUeXBlU2NyaXB0IGNvbXBpbGVyICh0c2MpIG5vdCBmb3VuZCBpbiBQQVRIJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIER5bmFtaWMgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemUgKHVzaW5nIGltcG9ydGVkIHV0aWxpdGllcylcbiAgICAgICAgICBjb25zdCBmaWxlQ291bnQgPSBhd2FpdCBjb3VudFR5cGVTY3JpcHRGaWxlcyh3b3JraW5nRGlyKTtcbiAgICAgICAgICBjb25zdCBkeW5hbWljVGltZW91dCA9IGdldEFuYWx5c2lzVGltZW91dCgzMDAwMCwgZmlsZUNvdW50KTtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygndHNjJywgWyctLWV4dGVuZGVkRGlhZ25vc3RpY3MnXSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MgfHwgIXJlc3VsdC5zdGRvdXQpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYHRzYyBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIHRzYyAtLWV4dGVuZGVkRGlhZ25vc3RpY3Mgb3V0cHV0XG4gICAgICAgICAgY29uc3QgbGluZXMgPSByZXN1bHQuc3Rkb3V0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICBsZXQgY2hlY2tUaW1lTXMgPSAwO1xuICAgICAgICAgIGxldCBtZW1vcnlVc2VkTUIgPSAwO1xuICAgICAgICAgIGxldCBmaWxlc0NoZWNrZWQgPSAwO1xuICAgICAgICAgIGxldCBlbWl0VGltZU1zID0gMDtcbiAgICAgICAgICBsZXQgcGFyc2VUaW1lTXMgPSAwO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCBsb3dlckxpbmUgPSBsaW5lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFBhcnNlIGNoZWNrIHRpbWVcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrTWF0Y2ggPSBsb3dlckxpbmUubWF0Y2goL2NoZWNrXFxzK3RpbWU6XFxzKyhcXGQrKVxccyptcy8pO1xuICAgICAgICAgICAgaWYgKGNoZWNrTWF0Y2gpIGNoZWNrVGltZU1zID0gcGFyc2VJbnQoY2hlY2tNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBtZW1vcnkgdXNlZFxuICAgICAgICAgICAgY29uc3QgbWVtTWF0Y2ggPSBsaW5lLm1hdGNoKC9tZW1vcnkgdXNlZDpcXHMrKFxcZCspXFxzKihrYnxtYikvaSk7XG4gICAgICAgICAgICBpZiAobWVtTWF0Y2gpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUludChtZW1NYXRjaFsxXSwgMTApO1xuICAgICAgICAgICAgICBtZW1vcnlVc2VkTUIgPSBtZW1NYXRjaFsyXS50b0xvd2VyQ2FzZSgpID09PSAnbWInID8gdmFsdWUgOiBNYXRoLnJvdW5kKHZhbHVlIC8gMTAyNCAqIDEwMCkgLyAxMDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIGZpbGVzIGNoZWNrZWRcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzTWF0Y2ggPSBsaW5lLm1hdGNoKC9maWxlc1xccytjaGVja2VkOlxccysoXFxkKykvKTtcbiAgICAgICAgICAgIGlmIChmaWxlc01hdGNoKSBmaWxlc0NoZWNrZWQgPSBwYXJzZUludChmaWxlc01hdGNoWzFdLCAxMCk7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIGVtaXQgdGltZVxuICAgICAgICAgICAgY29uc3QgZW1pdE1hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9lbWl0XFxzK3RpbWU6XFxzKyhcXGQrKVxccyptcy8pO1xuICAgICAgICAgICAgaWYgKGVtaXRNYXRjaCkgZW1pdFRpbWVNcyA9IHBhcnNlSW50KGVtaXRNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBwYXJzZSB0aW1lXG4gICAgICAgICAgICBjb25zdCBwYXJzZU1hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9wYXJzZVxccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChwYXJzZU1hdGNoKSBwYXJzZVRpbWVNcyA9IHBhcnNlSW50KHBhcnNlTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQZXJmb3JtYW5jZSBhc3Nlc3NtZW50IGJhc2VkIG9uIFBERiBndWlkZWxpbmVzXG4gICAgICAgICAgbGV0IGFzc2Vzc21lbnQ6ICdmYXN0JyB8ICdtb2RlcmF0ZScgfCAnc2xvdyc7XG4gICAgICAgICAgaWYgKGNoZWNrVGltZU1zIDwgMTAwKSBhc3Nlc3NtZW50ID0gJ2Zhc3QnO1xuICAgICAgICAgIGVsc2UgaWYgKGNoZWNrVGltZU1zIDw9IDUwMCkgYXNzZXNzbWVudCA9ICdtb2RlcmF0ZSc7XG4gICAgICAgICAgZWxzZSBhc3Nlc3NtZW50ID0gJ3Nsb3cnO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNoZWNrVGltZU1zLFxuICAgICAgICAgICAgbWVtb3J5VXNlZE1COiBNYXRoLnJvdW5kKG1lbW9yeVVzZWRNQiAqIDEwMCkgLyAxMDAsXG4gICAgICAgICAgICBmaWxlc0NoZWNrZWQsXG4gICAgICAgICAgICBlbWl0VGltZU1zLFxuICAgICAgICAgICAgcGFyc2VUaW1lTXMsXG4gICAgICAgICAgICBhc3Nlc3NtZW50LFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBCLiBDaXJjdWxhciBEZXBlbmRlbmN5IERldGVjdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW5DaXJjdWxhckFuYWx5c2lzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICAgICAgICBjb25zdCBlbnRyeVBvaW50ID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICdzcmMnLCAnaW5kZXgudHMnKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZW50cnlQb2ludCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHNyYy9pbmRleC50cyBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEeW5hbWljIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplXG4gICAgICAgICAgY29uc3QgZmlsZUNvdW50ID0gYXdhaXQgY291bnRUeXBlU2NyaXB0RmlsZXMod29ya2luZ0Rpcik7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1RpbWVvdXQgPSBnZXRBbmFseXNpc1RpbWVvdXQoMjAwMDAsIGZpbGVDb3VudCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUnVuIG1hZGdlIGFuZCBjYXB0dXJlIG91dHB1dCB3aXRoIGR5bmFtaWMgdGltZW91dFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJy0teWVzJywgJ21hZGdlJywgJy0tY2lyY3VsYXInLCBlbnRyeVBvaW50XSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYG1hZGdlIGZhaWxlZDogJHtyZXN1bHQuc3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGFyc2UgbWFkZ2Ugb3V0cHV0IFx1MjAxNCBpdCBsaXN0cyBjeWNsZXMgbGlrZSBcImZpbGUxLnRzIC0+IGZpbGUyLnRzIC0+IGZpbGUxLnRzXCJcbiAgICAgICAgICBjb25zdCBjeWNsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgY29uc3Qgc3Rkb3V0ID0gcmVzdWx0LnN0ZG91dCB8fCAnJztcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IHN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgXG4gICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gICAgICAgICAgICBpZiAodHJpbW1lZCAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdGb3VuZCcpICYmICF0cmltbWVkLnN0YXJ0c1dpdGgoJ05vJykpIHtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBsb29rcyBsaWtlIGEgY3ljbGUgcGF0aFxuICAgICAgICAgICAgICBpZiAodHJpbW1lZC5pbmNsdWRlcygnLT4nKSB8fCB0cmltbWVkLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgICAgICAgICAgIGN5Y2xlcy5wdXNoKHRyaW1tZWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhhc0N5Y2xlczogY3ljbGVzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICBjeWNsZXMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEMuIEVTTGludCBJbnRlZ3JhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW5Fc2xpbnRBbmFseXNpcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgY29uc3QgZXNsaW50Q29uZmlnRmlsZXMgPSBbXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJ2VzbGludC5jb25maWcubWpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJ2VzbGludC5jb25maWcuanMnKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnLmVzbGludHJjLmpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYy5qc29uJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYycpLFxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBjb25zdCBoYXNFc2xpbnRDb25maWcgPSBlc2xpbnRDb25maWdGaWxlcy5zb21lKGYgPT4gZnMuZXhpc3RzU3luYyhmKSk7XG4gICAgICAgICAgaWYgKCFoYXNFc2xpbnRDb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIEVTTGludCBjb25maWd1cmF0aW9uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGlmIGVzbGludCBpcyBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ25weCcsIFsnZXNsaW50JywgJy0tdmVyc2lvbiddLCA1MDAwKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ0VTTGludCBub3QgZm91bmQgaW4gZGV2RGVwZW5kZW5jaWVzIG9yIFBBVEgnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDE1MDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJ2VzbGludCcsICdzcmMnLCAnLS1leHQnLCAnLnRzJywgJy0tZm9ybWF0JywgJ2pzb24nXSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYEVTTGludCBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIEpTT04gb3V0cHV0IGZyb20gZXNsaW50IC0tZm9ybWF0IGpzb25cbiAgICAgICAgICBsZXQgZXJyb3JzID0gMDtcbiAgICAgICAgICBsZXQgd2FybmluZ3MgPSAwO1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgY29uc3Qgd2FybmluZ01lc3NhZ2VzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVzdWx0LnN0ZG91dCB8fCAnJykgYXMge1xuICAgICAgICAgICAgICByZXN1bHRzPzogQXJyYXk8e1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXM/OiBBcnJheTx7IHNldmVyaXR5OiBudW1iZXI7IG1lc3NhZ2U6IHN0cmluZzsgbGluZTogbnVtYmVyOyBjb2x1bW46IG51bWJlciB9PjtcbiAgICAgICAgICAgICAgfT47XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHBhcnNlZC5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZVJlc3VsdCBvZiBwYXJzZWQucmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiAoZmlsZVJlc3VsdC5tZXNzYWdlcyB8fCBbXSkpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnNldmVyaXR5ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ycysrO1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2VzLnB1c2goYCR7ZmlsZVJlc3VsdC5maWxlUGF0aH06ICR7bWVzc2FnZS5tZXNzYWdlfSAoJHttZXNzYWdlLmxpbmV9OiR7bWVzc2FnZS5jb2x1bW59KWApO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnNldmVyaXR5ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHdhcm5pbmdzKys7XG4gICAgICAgICAgICAgICAgICAgIHdhcm5pbmdNZXNzYWdlcy5wdXNoKGAke2ZpbGVSZXN1bHQuZmlsZVBhdGh9OiAke21lc3NhZ2UubWVzc2FnZX0gKCR7bWVzc2FnZS5saW5lfToke21lc3NhZ2UuY29sdW1ufSlgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIElmIEpTT04gcGFyc2luZyBmYWlscywgZmFsbCBiYWNrIHRvIHRleHQgb3V0cHV0IGFuYWx5c2lzXG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja1N0ZG91dCA9IHJlc3VsdC5zdGRvdXQgfHwgJyc7XG4gICAgICAgICAgICBjb25zdCBlcnJvckxpbmVzID0gZmFsbGJhY2tTdGRvdXQuc3BsaXQoJ1xcbicpLmZpbHRlcihsID0+IGwuaW5jbHVkZXMoJ2Vycm9yJykgJiYgIWwuaW5jbHVkZXMoJ3dhcm5pbmcnKSk7XG4gICAgICAgICAgICBlcnJvcnMgPSBlcnJvckxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IHdhcm5pbmdMaW5lcyA9IGZhbGxiYWNrU3Rkb3V0LnNwbGl0KCdcXG4nKS5maWx0ZXIobCA9PiBsLmluY2x1ZGVzKCd3YXJuaW5nJykpO1xuICAgICAgICAgICAgd2FybmluZ3MgPSB3YXJuaW5nTGluZXMubGVuZ3RoO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5ncyxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZXM6IGVycm9yTWVzc2FnZXMuc2xpY2UoMCwgMjApLCAvLyBMaW1pdCB0byBmaXJzdCAyMFxuICAgICAgICAgICAgd2FybmluZ01lc3NhZ2VzOiB3YXJuaW5nTWVzc2FnZXMuc2xpY2UoMCwgMjApLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBELiBUeXBlU2NyaXB0IENvbmZpZyBBbmFseXNpcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBmdW5jdGlvbiBydW5Db25maWdBbmFseXNpcygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgICAgY29uc3QgdHNDb25maWdQYXRoID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICd0c2NvbmZpZy5qc29uJyk7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRzQ29uZmlnUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHRzY29uZmlnLmpzb24gZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHRzQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdHNDb25maWcgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyh0c0NvbmZpZ1BhdGgsICd1dGYtOCcpKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ0ludmFsaWQgdHNjb25maWcuanNvbiBmb3JtYXQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgY29tcGlsZXJPcHRpb25zID0gKHRzQ29uZmlnLmNvbXBpbGVyT3B0aW9ucyB8fCB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgaW5jcmVtZW50YWwgPSAhIWNvbXBpbGVyT3B0aW9ucy5pbmNyZW1lbnRhbDtcbiAgICAgICAgICBjb25zdCBza2lwTGliQ2hlY2sgPSAhIWNvbXBpbGVyT3B0aW9ucy5za2lwTGliQ2hlY2s7XG4gICAgICAgICAgY29uc3QgaXNvbGF0ZWRNb2R1bGVzID0gISFjb21waWxlck9wdGlvbnMuaXNvbGF0ZWRNb2R1bGVzO1xuICAgICAgICAgIGNvbnN0IHN0cmljdCA9ICEhY29tcGlsZXJPcHRpb25zLnN0cmljdDtcblxuICAgICAgICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgIC8vIFJlY29tbWVuZGF0aW9ucyBiYXNlZCBvbiBQREYgb3B0aW1pemF0aW9uIHRlY2huaXF1ZXNcbiAgICAgICAgICBpZiAoIWluY3JlbWVudGFsKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwiaW5jcmVtZW50YWxcIjogdHJ1ZSBpbiB0c2NvbmZpZy5qc29uIGZvciBmYXN0ZXIgYnVpbGRzIChidWlsZCBjYWNoaW5nKS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFza2lwTGliQ2hlY2spIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdFbmFibGUgXCJza2lwTGliQ2hlY2tcIjogdHJ1ZSB0byBza2lwIGNoZWNraW5nIC5kLnRzIGZpbGVzIGluIG5vZGVfbW9kdWxlcy4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFpc29sYXRlZE1vZHVsZXMpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdDb25zaWRlciBlbmFibGluZyBcImlzb2xhdGVkTW9kdWxlc1wiOiB0cnVlIGZvciBmYXN0ZXIgY29tcGlsYXRpb24gKGVzcGVjaWFsbHkgd2l0aCBCYWJlbC9lc2J1aWxkKS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFzdHJpY3QpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdFbmFibGUgXCJzdHJpY3RcIjogdHJ1ZSBmb3IgYmV0dGVyIHR5cGUgc2FmZXR5IGFuZCBmZXdlciBydW50aW1lIGVycm9ycy4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3IgcGF0aHMgY29uZmlndXJhdGlvbiAobW9kdWxlIHJlc29sdXRpb24gb3B0aW1pemF0aW9uKVxuICAgICAgICAgIGNvbnN0IHBhdGhzID0gY29tcGlsZXJPcHRpb25zLnBhdGhzIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgICAgICAgIGlmICghcGF0aHMgfHwgT2JqZWN0LmtleXMocGF0aHMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0NvbnNpZGVyIHVzaW5nIFwicGF0aHNcIiBpbiB0c2NvbmZpZy5qc29uIHRvIHNpbXBsaWZ5IG1vZHVsZSBpbXBvcnRzIGFuZCByZWR1Y2UgZGVwZW5kZW5jeSBkZXB0aC4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5jcmVtZW50YWwsXG4gICAgICAgICAgICBza2lwTGliQ2hlY2ssXG4gICAgICAgICAgICBpc29sYXRlZE1vZHVsZXMsXG4gICAgICAgICAgICBzdHJpY3QsXG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEUuIEltcG9ydCBTdHJ1Y3R1cmUgQW5hbHlzaXMgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gcnVuSW1wb3J0QW5hbHlzaXMoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICAgIGNvbnN0IHNyY0RpciA9IHBhdGguam9pbih3b3JraW5nRGlyLCAnc3JjJyk7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHNyY0RpcikpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHNyYy8gZGlyZWN0b3J5IGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENvbGxlY3QgYWxsIC50cyBmaWxlcyBpbiBzcmMvXG4gICAgICAgICAgZnVuY3Rpb24gY29sbGVjdFRzRmlsZXMoZGlyOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkubmFtZSk7XG4gICAgICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaCguLi5jb2xsZWN0VHNGaWxlcyhmdWxsUGF0aCkpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy50cycpICYmICFlbnRyeS5uYW1lLmVuZHNXaXRoKCcuZC50cycpKSB7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZpbGVzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRzRmlsZXMgPSBjb2xsZWN0VHNGaWxlcyhzcmNEaXIpO1xuICAgICAgICAgIGNvbnN0IGZpbGVzV2l0aEV4Y2Vzc2l2ZUltcG9ydHM6IEFycmF5PHsgZmlsZTogc3RyaW5nOyBjb3VudDogbnVtYmVyIH0+ID0gW107XG4gICAgICAgICAgY29uc3QgZGVjbGFyZUdsb2JhbFVzYWdlOiBBcnJheTx7IGZpbGU6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiB0c0ZpbGVzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIENvdW50IGltcG9ydHNcbiAgICAgICAgICAgICAgY29uc3QgaW1wb3J0U3RhdGVtZW50cyA9IGNvbnRlbnQubWF0Y2goL15pbXBvcnRcXHMrLiokL2dtKTtcbiAgICAgICAgICAgICAgY29uc3QgaW1wb3J0Q291bnQgPSBpbXBvcnRTdGF0ZW1lbnRzID8gaW1wb3J0U3RhdGVtZW50cy5sZW5ndGggOiAwO1xuXG4gICAgICAgICAgICAgIGlmIChpbXBvcnRDb3VudCA+IGltcG9ydFdhcm5pbmdUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzLnB1c2goeyBmaWxlOiBwYXRoLnJlbGF0aXZlKHdvcmtpbmdEaXIsIGZpbGVQYXRoKSwgY291bnQ6IGltcG9ydENvdW50IH0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGRlY2xhcmUgZ2xvYmFsIHVzYWdlIChnbG9iYWwgdHlwZSBwYXRjaGluZyBcdTIwMTQgYmFkIHByYWN0aWNlIHBlciBQREYpXG4gICAgICAgICAgICAgIGNvbnN0IGRlY2xhcmVHbG9iYWxNYXRjaGVzID0gY29udGVudC5tYXRjaCgvZGVjbGFyZVxccytnbG9iYWwvZyk7XG4gICAgICAgICAgICAgIGlmIChkZWNsYXJlR2xvYmFsTWF0Y2hlcyAmJiBkZWNsYXJlR2xvYmFsTWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZGVjbGFyZUdsb2JhbFVzYWdlLnB1c2goeyBmaWxlOiBwYXRoLnJlbGF0aXZlKHdvcmtpbmdEaXIsIGZpbGVQYXRoKSB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIC8vIFNraXAgZmlsZXMgdGhhdCBjYW4ndCBiZSByZWFkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbGVzV2l0aEV4Y2Vzc2l2ZUltcG9ydHMsXG4gICAgICAgICAgICBkZWNsYXJlR2xvYmFsVXNhZ2UsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IFJ1biBTZWxlY3RlZCBDYXRlZ29yaWVzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygndHlwZWNoZWNrJykpIHtcbiAgICAgICAgICByZXN1bHRzLnR5cGVjaGVjayA9IGF3YWl0IHJ1blR5cGVjaGVja0FuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnY2lyY3VsYXInKSkge1xuICAgICAgICAgIHJlc3VsdHMuY2lyY3VsYXIgPSBhd2FpdCBydW5DaXJjdWxhckFuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnZXNsaW50JykpIHtcbiAgICAgICAgICByZXN1bHRzLmVzbGludCA9IGF3YWl0IHJ1bkVzbGludEFuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnY29uZmlnJykpIHtcbiAgICAgICAgICByZXN1bHRzLmNvbmZpZyA9IHJ1bkNvbmZpZ0FuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnaW1wb3J0cycpKSB7XG4gICAgICAgICAgcmVzdWx0cy5pbXBvcnRzID0gcnVuSW1wb3J0QW5hbHlzaXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiByZXN1bHRzLFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQW5hbHlzaXMgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNlYXJjaCBhcyBkZGdTZWFyY2ggfSBmcm9tICdkdWNrLWR1Y2stc2NyYXBlJztcbmltcG9ydCB7IGh0bWxUb1RleHQgfSBmcm9tICdodG1sLXRvLXRleHQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZmV0Y2hXaXRoUmV0cnkgfSBmcm9tICcuLi9wZXJmb3JtYW5jZVV0aWxzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU2VhcmNoIEVuZ2luZSBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdEl0ZW0ge1xuICB0aXRsZTogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbn1cblxuLyoqIER1Y2tEdWNrR28gQVBJIChmYXN0ZXN0LCBubyBicm93c2VyIG5lZWRlZCkgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaERER0FwaShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGRkZ1NlYXJjaChxdWVyeSwgeyByZWdpb246ICd3dC13dCcgfSk7XG4gIHJldHVybiAocmVzdWx0cy5yZXN1bHRzIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PikubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICB0aXRsZTogci50aXRsZSBhcyBzdHJpbmcsXG4gICAgdXJsOiByLnVybCBhcyBzdHJpbmcsXG4gICAgZGVzY3JpcHRpb246IChyLmRlc2NyaXB0aW9uIGFzIHN0cmluZykgfHwgJycsXG4gIH0pKTtcbn1cblxuLyoqIER1Y2tEdWNrR28gSFRNTCBGZXRjaCAoZmFsbGJhY2sgd2hlbiBBUEkgZmFpbHMpICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hEREdGZXRjaChxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShcbiAgICBgaHR0cHM6Ly9odG1sLmR1Y2tkdWNrZ28uY29tL2h0bWwvP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfWBcbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBEdWNrRHVja0dvIEZldGNoIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgXG4gIC8vIFNpbXBsZSByZWdleC1iYXNlZCBwYXJzaW5nIGZvciBOb2RlLmpzIChubyBET01QYXJzZXIgbmVlZGVkISlcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIFxuICAvLyBFeHRyYWN0IHRpdGxlcyBmcm9tIDxhIGNsYXNzPVwicmVzdWx0X19hXCIgaHJlZj1cIi4uLlwiIHJlbD1cIi4uLlwiPlRpdGxlPC9hPlxuICBjb25zdCB0aXRsZVJlZ2V4ID0gLzxhW14+XStjbGFzcz1cInJlc3VsdF9fYVwiW14+XStocmVmPVwiKFteXCJdKylcIltePl0qPihbXjxdKyk8XFwvYT4vZ2k7XG4gIGxldCBtYXRjaDtcbiAgXG4gIHdoaWxlICgobWF0Y2ggPSB0aXRsZVJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHRpdGxlOiBtYXRjaFsyXS5yZXBsYWNlKC8mYW1wOy9nLCAnJicpLnRyaW0oKSxcbiAgICAgIHVybDogbWF0Y2hbMV0sXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCAxMCk7XG59XG5cbi8qKiBHb29nbGUgU2VhcmNoIHZpYSBIVE1MIEZldGNoICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hHb29nbGUocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoXG4gICAgYGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZudW09MTBgLFxuICAgIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYnIH0gfVxuICApO1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEdvb2dsZSBzZWFyY2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAvLyBTaW1wbGUgcGFyc2luZyBcdTIwMTQgZXh0cmFjdCB0aXRsZXMgYW5kIFVSTHMgZnJvbSBHb29nbGUncyBIVE1MIHN0cnVjdHVyZVxuICBjb25zdCByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW10gPSBbXTtcbiAgY29uc3QgdGl0bGVSZWdleCA9IC88aDNbXj5dKj4oLio/KTxcXC9oMz4vZztcblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSB0aXRsZVJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHRpdGxlOiBtYXRjaFsxXS5yZXBsYWNlKC88W14+XSo+L2csICcnKSwgLy8gUmVtb3ZlIEhUTUwgdGFnc1xuICAgICAgdXJsOiAnJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIDEwKTtcbn1cblxuLyoqIEJpbmcgU2VhcmNoIHZpYSBIVE1MIEZldGNoICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hCaW5nKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KFxuICAgIGBodHRwczovL3d3dy5iaW5nLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9JmNvdW50PTEwYCxcbiAgICB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2JyB9IH1cbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBCaW5nIHNlYXJjaCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIC8vIFBhcnNlIEJpbmcgcmVzdWx0cyBcdTIwMTQgc2ltaWxhciBhcHByb2FjaCB0byBHb29nbGVcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIGNvbnN0IHJlc3VsdFJlZ2V4ID0gLzxsaSBjbGFzcz1cImJfYWxnb1wiW14+XSo+KC4qPyk8XFwvbGk+L2dzO1xuXG4gIGxldCBtYXRjaDtcbiAgd2hpbGUgKChtYXRjaCA9IHJlc3VsdFJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgYmxvY2sgPSBtYXRjaFsxXTtcbiAgICBjb25zdCB0aXRsZU1hdGNoID0gYmxvY2subWF0Y2goLzxhW14+XStocmVmPVwiKFteXCJdKylcIltePl0qPihbXjxdKyk8XFwvYT4vKTtcbiAgICBpZiAodGl0bGVNYXRjaCkge1xuICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgdGl0bGU6IHRpdGxlTWF0Y2hbMl0sXG4gICAgICAgIHVybDogdGl0bGVNYXRjaFsxXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgMTApO1xufVxuXG4vKiogQWxsIGF2YWlsYWJsZSBTZWFyY2ggRW5naW5lIEZ1bmN0aW9ucyAqL1xuY29uc3QgU0VBUkNIX0VOR0lORVM6IFJlY29yZDxzdHJpbmcsIChxdWVyeTogc3RyaW5nKSA9PiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4+ID0ge1xuICAnZGRnLWFwaSc6IHNlYXJjaERER0FwaSxcbiAgJ2RkZy1mZXRjaCc6IHNlYXJjaERER0ZldGNoLFxuICAnZ29vZ2xlJzogc2VhcmNoR29vZ2xlLFxuICAnYmluZyc6IHNlYXJjaEJpbmcsXG59O1xuXG4vKiogSGFyZGNvZGVkIGZhbGxiYWNrIG9yZGVyICh3aGVuIHByaW1hcnkgZW5naW5lIGZhaWxzKSAqL1xuY29uc3QgRkFMTEJBQ0tfT1JERVIgPSBbJ2RkZy1hcGknLCAnZGRnLWZldGNoJywgJ2dvb2dsZScsICdiaW5nJ107XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZhbGxiYWNrIENoYWluIExvZ2ljID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogV2ViIHNlYXJjaCB3aXRoIGF1dG9tYXRpYyBmYWxsYmFjay5cbiAqIFN0YXJ0cyB3aXRoIHRoZSBDb25maWcgZW5naW5lIGFuZCBhdXRvbWF0aWNhbGx5IHRyaWVzIHRoZSBuZXh0IGluIHRoZSBjaGFpbi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoV2l0aEZhbGxiYWNrQ2hhaW4oXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIGNvbmZpZzogUGx1Z2luQ29uZmlnXG4pOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IHsgcXVlcnk6IHN0cmluZzsgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdOyBjb3VudDogbnVtYmVyOyBlbmdpbmU6IHN0cmluZyB9OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gIC8vIFN0YXJ0IGVuZ2luZSBmcm9tIENvbmZpZyAoU2luZ2xlIFNlbGVjdClcbiAgY29uc3QgcHJpbWFyeUVuZ2luZSA9IGNvbmZpZy5zZWFyY2hGYWxsYmFja0NoYWluIHx8ICdkZGctYXBpJztcbiAgXG4gIC8vIEZhbGxiYWNrIGNoYWluOiBwcmltYXJ5IGVuZ2luZSArIGFsbCBvdGhlcnMgaW4gZGVmaW5lZCBvcmRlclxuICBjb25zdCBjaGFpbiA9IFtwcmltYXJ5RW5naW5lLCAuLi5GQUxMQkFDS19PUkRFUi5maWx0ZXIoZSA9PiBlICE9PSBwcmltYXJ5RW5naW5lKV07XG5cbiAgZm9yIChjb25zdCBlbmdpbmUgb2YgY2hhaW4pIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2VhcmNoRm4gPSBTRUFSQ0hfRU5HSU5FU1tlbmdpbmVdO1xuICAgICAgaWYgKCFzZWFyY2hGbikge1xuICAgICAgICBjb25zb2xlLndhcm4oYFNlYXJjaCBlbmdpbmUgXCIke2VuZ2luZX1cIiBub3QgZm91bmQsIHNraXBwaW5nYCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgc2VhcmNoRm4ocXVlcnkpO1xuXG4gICAgICAvLyBWYWxpZGF0ZSByZXN1bHQgY291bnQgLSB3YXJuIGlmIGxvdyByZXN1bHRzXG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgTG93IHNlYXJjaCByZXN1bHRzIGZvciBcIiR7cXVlcnl9XCI6ICR7cmVzdWx0cy5sZW5ndGh9IHJlc3VsdHMgZnJvbSAke2VuZ2luZX1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogeyBxdWVyeSwgcmVzdWx0cywgY291bnQ6IHJlc3VsdHMubGVuZ3RoLCBlbmdpbmUgfSxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBjb25zb2xlLndhcm4oYFNlYXJjaCBlbmdpbmUgXCIke2VuZ2luZX1cIiBmYWlsZWQ6ICR7bWVzc2FnZX1gKTtcbiAgICAgIC8vIFRyeSBuZXh0IGVuZ2luZSBpbiB0aGUgY2hhaW5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3VjY2VzczogZmFsc2UsXG4gICAgZXJyb3I6IGBBbGwgc2VhcmNoIGVuZ2luZXMgZmFpbGVkLiBUcmllZDogJHtjaGFpbi5qb2luKCcgXHUyMTkyICcpfWAsXG4gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBXZWJTZWFyY2hQYXJhbXMgeyBxdWVyeTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgV2lraXBlZGlhU2VhcmNoUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgbGFuZz86IHN0cmluZzsgfVxuaW50ZXJmYWNlIEZldGNoV2ViQ29udGVudFBhcmFtcyB7IHVybDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmFnV2ViQ29udGVudFBhcmFtcyB7IHVybDogc3RyaW5nOyBxdWVyeTogc3RyaW5nOyB9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlcldlYlJlc2VhcmNoVG9vbHMoY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gd2ViX3NlYXJjaCB0b29sIFx1MjAxNCB1c2VzIHByaW1hcnkgZW5naW5lIGZyb20gQ29uZmlnICsgYXV0b21hdGljIGZhbGxiYWNrXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3dlYl9zZWFyY2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIHRoZSB3ZWIgdXNpbmcgYSBjb25maWd1cmFibGUgc2VhcmNoIGVuZ2luZSB3aXRoIGF1dG9tYXRpYyBmYWxsYmFjayB0byBvdGhlciBlbmdpbmVzIGlmIHRoZSBwcmltYXJ5IG9uZSBmYWlscy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2VhcmNoIHF1ZXJ5JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnkgfTogV2ViU2VhcmNoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICByZXR1cm4gYXdhaXQgc2VhcmNoV2l0aEZhbGxiYWNrQ2hhaW4ocXVlcnksIGNvbmZpZyk7XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHdpa2lwZWRpYV9zZWFyY2ggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3aWtpcGVkaWFfc2VhcmNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCBXaWtpcGVkaWEgZm9yIGEgZ2l2ZW4gcXVlcnkgYW5kIHJldHVybiBwYWdlIHN1bW1hcmllcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2VhcmNoIHF1ZXJ5JyksXG4gICAgICBsYW5nOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnZW4nKS5kZXNjcmliZSgnTGFuZ3VhZ2UgY29kZSAoZGVmYXVsdDogZW4pJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIGxhbmcgfTogV2lraXBlZGlhU2VhcmNoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGlVcmwgPSBgaHR0cHM6Ly8ke2xhbmcgfHwgJ2VuJ30ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXF1ZXJ5Jmxpc3Q9c2VhcmNoJnNyc2VhcmNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX0mZm9ybWF0PWpzb24mb3JpZ2luPSpgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KGFwaVVybCk7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV2lraXBlZGlhIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlc3BvbnNlLmpzb24oKSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIGNvbnN0IHF1ZXJ5RGF0YSA9IGRhdGEucXVlcnkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHNlYXJjaFJlc3VsdHMgPSAocXVlcnlEYXRhPy5zZWFyY2ggYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KSB8fCBbXTtcbiAgICAgICAgY29uc3QgcGFnZXMgPSBzZWFyY2hSZXN1bHRzLm1hcCgoaXRlbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgICAgICBjb25zdCB0aXRsZSA9IHR5cGVvZiBpdGVtLnRpdGxlID09PSAnc3RyaW5nJyA/IGl0ZW0udGl0bGUgOiAnJztcbiAgICAgICAgICBjb25zdCBzbmlwcGV0ID0gdHlwZW9mIGl0ZW0uc25pcHBldCA9PT0gJ3N0cmluZycgPyBpdGVtLnNuaXBwZXQucmVwbGFjZSgvPFtePl0qPi9nLCAnJykgOiAnJztcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBzbmlwcGV0LFxuICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly8ke2xhbmcgfHwgJ2VuJ30ud2lraXBlZGlhLm9yZy93aWtpLyR7ZW5jb2RlVVJJQ29tcG9uZW50KHRpdGxlKX1gLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcXVlcnksIGxhbmd1YWdlOiBsYW5nIHx8ICdlbicsIHJlc3VsdHM6IHBhZ2VzLCBjb3VudDogcGFnZXMubGVuZ3RoIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFdpa2lwZWRpYSBzZWFyY2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmZXRjaF93ZWJfY29udGVudCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ZldGNoX3dlYl9jb250ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZldGNoIHRoZSBjbGVhbiwgdGV4dC1iYXNlZCBjb250ZW50IG9mIGEgd2VicGFnZSBVUkwuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1RoZSBVUkwgdG8gZmV0Y2gnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB1cmwgfTogRmV0Y2hXZWJDb250ZW50UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KHVybCk7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gaHRtbFRvVGV4dChodG1sLCB7XG4gICAgICAgICAgd29yZHdyYXA6IGZhbHNlLFxuICAgICAgICAgIHNlbGVjdG9yczogW1xuICAgICAgICAgICAgeyBzZWxlY3RvcjogJ2EnLCBvcHRpb25zOiB7IGlnbm9yZUhyZWY6IHRydWUgfSB9LFxuICAgICAgICAgICAgeyBzZWxlY3RvcjogJ2ltZycsIGZvcm1hdDogJ1tpbWFnZV0nIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB1cmwsIGNvbnRlbnQ6IHRleHQuc3Vic3RyaW5nKDAsIDUwMDApIH0gfTsgLy8gTGltaXQgbGVuZ3RoXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZmV0Y2ggY29udGVudDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmFnX3dlYl9jb250ZW50IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX3dlYl9jb250ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZldGNoIGNvbnRlbnQgZnJvbSBhIFVSTCwgYW5kIHRoZW4gdXNlIFJBRyB0byBmaW5kIGFuZCByZXR1cm4gb25seSB0aGUgdGV4dCBjaHVua3MgbW9zdCByZWxldmFudCB0byBhIHNwZWNpZmljIHF1ZXJ5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIGZldGNoJyksXG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeSBmb3IgcmVsZXZhbmNlIG1hdGNoaW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsLCBxdWVyeSB9OiBSYWdXZWJDb250ZW50UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KHVybCk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgICAgICAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGh0bWxUb1RleHQoaHRtbCk7XG5cbiAgICAgICAgLy8gU2ltcGxlIGtleXdvcmQtYmFzZWQgcmVsZXZhbmNlIHNjb3JpbmcgKHBsYWNlaG9sZGVyIGZvciByZWFsIFJBRylcbiAgICAgICAgY29uc3QgcXVlcnlUZXJtcyA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCkuc3BsaXQoL1xccysvKS5maWx0ZXIoKHQ6IHN0cmluZykgPT4gdC5sZW5ndGggPiAyKTtcbiAgICAgICAgY29uc3Qgc2VudGVuY2VzID0gdGV4dC5zcGxpdCgvWy4hP10rLykubWFwKChzOiBzdHJpbmcpID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAgICAgY29uc3QgcmVsZXZhbnRDaHVua3MgPSBzZW50ZW5jZXMuZmlsdGVyKChzZW50ZW5jZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHF1ZXJ5VGVybXMuc29tZSgodGVybTogc3RyaW5nKSA9PiBzZW50ZW5jZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHRlcm0pKTtcbiAgICAgICAgfSkuc2xpY2UoMCwgNSk7IC8vIFJldHVybiB0b3AgNSBoaXRzXG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB1cmwsIHF1ZXJ5LCBjaHVua3M6IHJlbGV2YW50Q2h1bmtzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBzZWFyY2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJztcblxuLy8gTGF6eS1sb2FkIHNpbXBsZS1naXQgZm9yIHRlc3RhYmlsaXR5XG5sZXQgc2ltcGxlR2l0TW9kdWxlOiB0eXBlb2YgaW1wb3J0KCdzaW1wbGUtZ2l0JykgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2ltcGxlR2l0KCk6IFByb21pc2U8dHlwZW9mIGltcG9ydCgnc2ltcGxlLWdpdCcpPiB7XG4gIGlmICghc2ltcGxlR2l0TW9kdWxlKSB7XG4gICAgc2ltcGxlR2l0TW9kdWxlID0gYXdhaXQgaW1wb3J0KCdzaW1wbGUtZ2l0Jyk7XG4gIH1cbiAgcmV0dXJuIHNpbXBsZUdpdE1vZHVsZTtcbn1cblxuLyoqIFJlc2V0IGdpdCBtb2R1bGUgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0R2l0Q2FjaGUoKTogdm9pZCB7XG4gIHNpbXBsZUdpdE1vZHVsZSA9IG51bGw7XG59XG5cbi8qKiBDcmVhdGUgYSBmcmVzaCBnaXQgaW5zdGFuY2UgZm9yIGVhY2ggb3BlcmF0aW9uIHRvIGF2b2lkIGN3ZCBpc3N1ZXMgKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUdpdCgpIHtcbiAgY29uc3QgeyBkZWZhdWx0OiBzaW1wbGVHaXQgfSA9IGF3YWl0IGdldFNpbXBsZUdpdCgpO1xuICByZXR1cm4gc2ltcGxlR2l0KCk7XG59XG5cbi8qKlxuICogU2hhcmVkIGhlbHBlcjogRXh0cmFjdCBHaXRIdWIgcmVwbyBuYW1lIGZyb20gZ2l0IHJlbW90ZSBVUkxcbiAqL1xuZnVuY3Rpb24gZ2V0UmVwb05hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHJlcG9NYXRjaCA9IHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPU0lUT1JZPy5tYXRjaCgvZ2l0aHViXFwuY29tWzovXShbXi9dK1xcL1teL10rKVxcLmdpdCQvKTtcbiAgcmV0dXJuIHJlcG9NYXRjaD8uWzFdIHx8IG51bGw7XG59XG5cbi8qKlxuICogU2hhcmVkIGhlbHBlcjogTWFrZSBHaXRIdWIgQVBJIHJlcXVlc3RzIHdpdGggYXV0aGVudGljYXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2hBcGlSZXF1ZXN0KG1ldGhvZDogc3RyaW5nLCBlbmRwb2ludDogc3RyaW5nLCBib2R5PzogdW5rbm93bikge1xuICBjb25zdCBnaXRodWJUb2tlbiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjtcbiAgXG4gIGlmICghZ2l0aHViVG9rZW4pIHRocm93IG5ldyBFcnJvcignR0lUSFVCX1RPS0VOIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG5vdCBzZXQnKTtcbiAgXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20ke2VuZHBvaW50fWAsIHtcbiAgICBtZXRob2QsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7Z2l0aHViVG9rZW59YCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgICBib2R5OiBib2R5ID8gSlNPTi5zdHJpbmdpZnkoYm9keSkgOiB1bmRlZmluZWQsXG4gIH0pO1xuXG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHaXRIdWIgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pOiAke2Vycm9yVGV4dH1gKTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZS5qc29uKCk7XG59XG5cbi8qKiBUeXBlZCBwYXJhbXMgaW50ZXJmYWNlcyAqL1xudHlwZSBHaXRTdGF0dXNQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG5pbnRlcmZhY2UgR2l0RGlmZlBhcmFtcyB7IGZpbGVfcGF0aD86IHN0cmluZzsgY2FjaGVkPzogYm9vbGVhbjsgfVxuaW50ZXJmYWNlIEdpdENvbW1pdFBhcmFtcyB7IG1lc3NhZ2U6IHN0cmluZzsgfVxuaW50ZXJmYWNlIEdpdExvZ1BhcmFtcyB7IG1heF9jb3VudD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdpdEFkZFBhcmFtcyB7IHBhdGhzPzogc3RyaW5nW107IH1cbmludGVyZmFjZSBHaXRDaGVja291dFBhcmFtcyB7IGJyYW5jaF9uYW1lOiBzdHJpbmc7IGNyZWF0ZV9uZXc/OiBib29sZWFuOyB9XG5pbnRlcmZhY2UgR2hDcmVhdGVJc3N1ZVBhcmFtcyB7IHRpdGxlOiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IGxhYmVscz86IHN0cmluZ1tdOyB9XG5pbnRlcmZhY2UgR2hMaXN0SXNzdWVzUGFyYW1zIHsgc3RhdGU/OiAnb3BlbicgfCAnY2xvc2VkJzsgbGFiZWxzPzogc3RyaW5nW107IGxpbWl0PzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2hWaWV3Q29tbWVudHNQYXJhbXMgeyBudW1iZXI6IG51bWJlcjsgdHlwZT86ICdpc3N1ZScgfCAncHInOyB9XG5pbnRlcmZhY2UgR2hDcmVhdGVQclBhcmFtcyB7IHRpdGxlOiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IGhlYWRfYnJhbmNoOiBzdHJpbmc7IGJhc2VfYnJhbmNoPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgR2hMaXN0UHJzUGFyYW1zIHsgc3RhdGU/OiAnb3BlbicgfCAnY2xvc2VkJzsgbGltaXQ/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHaFZpZXdQckRpZmZQYXJhbXMgeyBudW1iZXI6IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdoUHVzaFBhcmFtcyB7IGJyYW5jaD86IHN0cmluZzsgfVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJHaXRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gZ2l0X3N0YXR1cyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9zdGF0dXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHRoZSBjdXJyZW50IGdpdCBzdGF0dXMgb2YgdGhlIHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKF9wYXJhbXM6IEdpdFN0YXR1c1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gY3JlYXRlR2l0KCk7XG4gICAgICAgIGNvbnN0IHN0YXR1c1Jlc3VsdCA9IGF3YWl0IGdpdC5zdGF0dXMoKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogc3RhdHVzUmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgc3RhdHVzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2RpZmYgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfZGlmZicsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgdGhlIGdpdCBkaWZmIG9mIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgb3Igc3BlY2lmaWMgZmlsZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFBhdGggdG8gc3BlY2lmaWMgZmlsZSB0byBkaWZmLicpLFxuICAgICAgY2FjaGVkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdPcHRpb25hbDogU2hvdyBzdGFnZWQgY2hhbmdlcyBvbmx5IChnaXQgZGlmZiAtLWNhY2hlZCkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9wYXRoLCBjYWNoZWQgfTogR2l0RGlmZlBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gY3JlYXRlR2l0KCk7XG4gICAgICAgIGxldCBkaWZmID0gJyc7XG4gICAgICAgIGlmIChmaWxlX3BhdGgpIHtcbiAgICAgICAgICBkaWZmID0gYXdhaXQgZ2l0LmRpZmYoW2ZpbGVfcGF0aF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpZmYgPSBjYWNoZWQgPyBhd2FpdCBnaXQuZGlmZihbJy0tY2FjaGVkJ10pIDogYXdhaXQgZ2l0LmRpZmYoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRpZmYgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGRpZmYgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfY29tbWl0IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2NvbW1pdCcsXG4gICAgZGVzY3JpcHRpb246ICdDb21taXQgc3RhZ2VkIGNoYW5nZXMgdG8gdGhlIGdpdCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1pdCBtZXNzYWdlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbWVzc2FnZSB9OiBHaXRDb21taXRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBhd2FpdCBnaXQuY29tbWl0KG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1pdHRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgY29tbWl0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2xvZyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9sb2cnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHJlY2VudCBnaXQgY29tbWl0IGhpc3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBtYXhfY291bnQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBudW1iZXIgb2YgY29tbWl0cyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG1heF9jb3VudCB9OiBHaXRMb2dQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBjb25zdCBjb3VudCA9IG1heF9jb3VudCB8fCAxMDtcbiAgICAgICAgY29uc3QgbG9nID0gYXdhaXQgZ2l0LmxvZyhjb3VudCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWl0czogbG9nLmFsbCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgbG9nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2FkZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9hZGQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhZ2Ugc3BlY2lmaWMgZmlsZXMgb3IgYWxsIGNoYW5nZXMgZm9yIHRoZSBuZXh0IGNvbW1pdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGhzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBTcGVjaWZpYyBmaWxlIHBhdGhzIHRvIHN0YWdlLiBJZiBvbWl0dGVkLCBzdGFnZXMgYWxsIGNoYW5nZXMuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aHMgfTogR2l0QWRkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBjcmVhdGVHaXQoKTtcbiAgICAgICAgaWYgKHBhdGhzICYmIHBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhd2FpdCBnaXQuYWRkKHBhdGhzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBnaXQuYWRkKCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzdGFnZWRQYXRoczogcGF0aHMgfHwgJ2FsbCcgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGFkZCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9jaGVja291dCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9jaGVja291dCcsXG4gICAgZGVzY3JpcHRpb246ICdTd2l0Y2ggdG8gYW4gZXhpc3RpbmcgYnJhbmNoIG9yIGNyZWF0ZSBhbmQgc3dpdGNoIHRvIGEgbmV3IG9uZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGJyYW5jaF9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOYW1lIG9mIHRoZSBicmFuY2ggdG8gY2hlY2tvdXQuJyksXG4gICAgICBjcmVhdGVfbmV3OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKFwiSWYgdHJ1ZSwgY3JlYXRlcyB0aGUgYnJhbmNoIGlmIGl0IGRvZXNuJ3QgZXhpc3QgKGxpa2UgZ2l0IGNoZWNrb3V0IC1iKS5cIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYnJhbmNoX25hbWUsIGNyZWF0ZV9uZXcgfTogR2l0Q2hlY2tvdXRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBpZiAoY3JlYXRlX25ldykge1xuICAgICAgICAgIGF3YWl0IGdpdC5jaGVja291dExvY2FsQnJhbmNoKGJyYW5jaF9uYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBnaXQuY2hlY2tvdXQoYnJhbmNoX25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYnJhbmNoTmFtZTogYnJhbmNoX25hbWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGNoZWNrb3V0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfYXV0aCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2F1dGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2sgR2l0SHViIGF1dGhlbnRpY2F0aW9uIHN0YXR1cy4gSWYgbm90IGF1dGhlbnRpY2F0ZWQsIG9wZW5zIGEgdGVybWluYWwgd2luZG93IGZvciB0aGUgdXNlciB0byBzaWduIGluLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdGh1YlRva2VuID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0dJVEhVQl9UT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0JyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBnaEFwaVJlcXVlc3QoJ0dFVCcsICcvdXNlcicpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGF1dGhlbnRpY2F0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGF1dGggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9jcmVhdGVfaXNzdWUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9jcmVhdGVfaXNzdWUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IEdpdEh1YiBpc3N1ZSBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSB0aXRsZScpLFxuICAgICAgYm9keTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgaXNzdWUgYm9keS9kZXNjcmlwdGlvbicpLFxuICAgICAgbGFiZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0xhYmVscyB0byBhcHBseScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBib2R5LCBsYWJlbHMgfTogR2hDcmVhdGVJc3N1ZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lIGZyb20gR0lUSFVCX1JFUE9TSVRPUlkgZW52Jyk7XG5cbiAgICAgICAgYXdhaXQgZ2hBcGlSZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9pc3N1ZXNgLCB7IHRpdGxlLCBib2R5LCBsYWJlbHMgfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY3JlYXRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgaXNzdWUgY3JlYXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9saXN0X2lzc3VlcyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2xpc3RfaXNzdWVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xpc3QgaXNzdWVzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzdGF0ZTogei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdvcGVuJykuZGVzY3JpYmUoJ0ZpbHRlciBieSBpc3N1ZSBzdGF0ZScpLFxuICAgICAgbGFiZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZpbHRlciBieSBsYWJlbHMnKSxcbiAgICAgIGxpbWl0OiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBpc3N1ZXMgdG8gcmV0dXJuIChkZWZhdWx0OiAxMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzdGF0ZSwgbGFiZWxzLCBsaW1pdCB9OiBHaExpc3RJc3N1ZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZScpO1xuXG4gICAgICAgIGxldCBxdWVyeSA9IGBzdGF0ZT0ke3N0YXRlfWA7XG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBxdWVyeSArPSBgJmxhYmVscz0ke2xhYmVscy5qb2luKCcsJyl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzc3VlcyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9pc3N1ZXM/JHtxdWVyeX0mcGVyX3BhZ2U9JHtsaW1pdCB8fCAxMH1gKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpc3N1ZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGlzc3VlcyBsaXN0aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfdmlld19jb21tZW50cyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3ZpZXdfY29tbWVudHMnLFxuICAgIGRlc2NyaXB0aW9uOiAnVmlldyBjb21tZW50cyBvbiBhIHNwZWNpZmljIGlzc3VlIG9yIHB1bGwgcmVxdWVzdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSBvciBQUiBudW1iZXInKSxcbiAgICAgIHR5cGU6IHouZW51bShbJ2lzc3VlJywgJ3ByJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnaXNzdWUnKS5kZXNjcmliZShcIldoZXRoZXIgaXQncyBhbiBpc3N1ZSBvciBhIHB1bGwgcmVxdWVzdFwiKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBudW1iZXIsIHR5cGUgfTogR2hWaWV3Q29tbWVudHNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZScpO1xuXG4gICAgICAgIGNvbnN0IGNvbW1lbnRzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9LyR7dHlwZSA9PT0gJ3ByJyA/ICdwdWxscycgOiAnaXNzdWVzJ30vJHtudW1iZXJ9L2NvbW1lbnRzYCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWVudHMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGNvbW1lbnRzIHZpZXdpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9jcmVhdGVfcHIgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9jcmVhdGVfcHInLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IHB1bGwgcmVxdWVzdCBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBQUiB0aXRsZScpLFxuICAgICAgYm9keTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgUFIgYm9keS9kZXNjcmlwdGlvbicpLFxuICAgICAgaGVhZF9icmFuY2g6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBicmFuY2ggY29udGFpbmluZyB5b3VyIGNoYW5nZXMnKSxcbiAgICAgIGJhc2VfYnJhbmNoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnbWFpbicpLmRlc2NyaWJlKCdUaGUgYnJhbmNoIHlvdSB3YW50IHRvIG1lcmdlIGludG8gKGUuZy4sIG1haW4sIG1hc3RlciknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgYm9keSwgaGVhZF9icmFuY2gsIGJhc2VfYnJhbmNoIH06IEdoQ3JlYXRlUHJQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZScpO1xuXG4gICAgICAgIGNvbnN0IHByID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9wdWxsc2AsIHsgdGl0bGUsIGJvZHksIGhlYWQ6IGhlYWRfYnJhbmNoLCBiYXNlOiBiYXNlX2JyYW5jaCB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjcmVhdGVkOiB0cnVlLCB1cmw6IChwciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuaHRtbF91cmwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIFBSIGNyZWF0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfbGlzdF9wcnMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9saXN0X3BycycsXG4gICAgZGVzY3JpcHRpb246ICdMaXN0IHB1bGwgcmVxdWVzdHMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHN0YXRlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ29wZW4nKS5kZXNjcmliZSgnRmlsdGVyIGJ5IFBSIHN0YXRlJyksXG4gICAgICBsaW1pdDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggUFJzIHRvIHJldHVybiAoZGVmYXVsdDogMTApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc3RhdGUsIGxpbWl0IH06IEdoTGlzdFByc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lJyk7XG5cbiAgICAgICAgY29uc3QgcHJzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzP3N0YXRlPSR7c3RhdGV9JnBlcl9wYWdlPSR7bGltaXQgfHwgMTB9YCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcHJzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUnMgbGlzdGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3ZpZXdfcHJfZGlmZiB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3ZpZXdfcHJfZGlmZicsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCB0aGUgZGlmZi9wYXRjaCBvZiBhIHNwZWNpZmljIHB1bGwgcmVxdWVzdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBQUiBudW1iZXInKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBudW1iZXIgfTogR2hWaWV3UHJEaWZmUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUnKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzLyR7bnVtYmVyfS9kaWZmYCwge1xuICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOfWAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGRpZmY6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZGlmZiA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkaWZmIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUiBkaWZmIGZldGNoaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfcHVzaCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3B1c2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnUHVzaCBsb2NhbCBjb21taXRzIHRvIHRoZSByZW1vdGUgR2l0SHViIHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBicmFuY2g6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFRoZSBicmFuY2ggdG8gcHVzaC4gRGVmYXVsdHMgdG8gY3VycmVudCBicmFuY2guJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYnJhbmNoIH06IEdoUHVzaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gY3JlYXRlR2l0KCk7XG4gICAgICAgIGF3YWl0IGdpdC5wdXNoKGJyYW5jaCB8fCAnb3JpZ2luJywgJ0hFQUQnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwdXNoZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIHB1c2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEM1IEZJWDogUHJvcGVyIHR5cGluZyBpbnN0ZWFkIG9mIGFueVxuaW1wb3J0IHR5cGUgKiBhcyBQdXBwZXRlZXIgZnJvbSAncHVwcGV0ZWVyJztcblxubGV0IHB1cHBldGVlck1vZHVsZTogdHlwZW9mIFB1cHBldGVlciB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRQdXBwZXRlZXIoKTogUHJvbWlzZTx0eXBlb2YgUHVwcGV0ZWVyPiB7XG4gIGlmICghcHVwcGV0ZWVyTW9kdWxlKSB7XG4gICAgY29uc3QgaW1wb3J0ZWQgPSBhd2FpdCBpbXBvcnQoJ3B1cHBldGVlcicpO1xuICAgIHB1cHBldGVlck1vZHVsZSA9IGltcG9ydGVkLmRlZmF1bHQgfHwgaW1wb3J0ZWQ7XG4gIH1cbiAgcmV0dXJuIHB1cHBldGVlck1vZHVsZTtcbn1cblxuLyoqIFJlc2V0IHB1cHBldGVlciBtb2R1bGUgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0UHVwcGV0ZWVyQ2FjaGUoKTogdm9pZCB7XG4gIHB1cHBldGVlck1vZHVsZSA9IG51bGw7XG59XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpcic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5cbi8qKiBCcm93c2VyIHNlc3Npb24gbWFuYWdlciB3aXRoIGF1dG8tY2xlYW51cCBhbmQgY29ubmVjdGlvbiBwb29saW5nIChzaW5nbGV0b24gcGF0dGVybikgKi9cbmNsYXNzIEJyb3dzZXJTZXNzaW9uTWFuYWdlciB7XG4gIHByaXZhdGUgYnJvd3Nlckluc3RhbmNlOiBQdXBwZXRlZXIuQnJvd3NlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGN1cnJlbnRQYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNsZWFudXBUaW1lcjogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICBwcml2YXRlIHJlYWRvbmx5IElOQUNUSVZJVFlfVElNRU9VVF9NUyA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuICBwcml2YXRlIHJlYWRvbmx5IE1BWF9SRVRSSUVTID0gMjtcbiAgcHJpdmF0ZSByZXRyeUNvdW50ID0gMDtcblxuICAvKiogR2V0IG9yIGNyZWF0ZSBhIHBlcnNpc3RlbnQgUHVwcGV0ZWVyIGJyb3dzZXIgaW5zdGFuY2Ugd2l0aCBhdXRvLXJldHJ5ICovXG4gIGFzeW5jIGdldEJyb3dzZXIoKTogUHJvbWlzZTxQdXBwZXRlZXIuQnJvd3Nlcj4ge1xuICAgIGlmICghdGhpcy5icm93c2VySW5zdGFuY2UgfHwgIXRoaXMuYnJvd3Nlckluc3RhbmNlLmNvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLnJldHJ5Q291bnQgPSAwO1xuICAgICAgd2hpbGUgKHRoaXMucmV0cnlDb3VudCA8IHRoaXMuTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBwdXBwZXRlZXJMaWIgPSBhd2FpdCBnZXRQdXBwZXRlZXIoKTtcbiAgICAgICAgICB0aGlzLmJyb3dzZXJJbnN0YW5jZSA9IGF3YWl0IHB1cHBldGVlckxpYi5sYXVuY2goeyBcbiAgICAgICAgICAgIGhlYWRsZXNzOiB0cnVlLFxuICAgICAgICAgICAgYXJnczogWyctLW5vLXNhbmRib3gnLCAnLS1kaXNhYmxlLXNldHVpZC1zYW5kYm94J10gLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHRoaXMucmV0cnlDb3VudCsrO1xuICAgICAgICAgIGlmICh0aGlzLnJldHJ5Q291bnQgPj0gdGhpcy5NQVhfUkVUUklFUykgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDAgKiB0aGlzLnJldHJ5Q291bnQpKTsgLy8gRXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVzZXRDbGVhbnVwVGltZXIoKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgIHJldHVybiB0aGlzLmJyb3dzZXJJbnN0YW5jZSE7XG4gIH1cblxuICAvKiogR2V0IG9yIGNyZWF0ZSBhIHBhZ2UgaW4gdGhlIHBlcnNpc3RlbnQgYnJvd3NlciBpbnN0YW5jZSAqL1xuICBhc3luYyBnZXRQYWdlKCk6IFByb21pc2U8UHVwcGV0ZWVyLlBhZ2U+IHtcbiAgICBpZiAoIXRoaXMuY3VycmVudFBhZ2UgfHwgIWF3YWl0IHRoaXMuaXNQYWdlVmFsaWQoKSkge1xuICAgICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHRoaXMuZ2V0QnJvd3NlcigpO1xuICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xuICAgIH1cbiAgICB0aGlzLnJlc2V0Q2xlYW51cFRpbWVyKCk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2U7XG4gIH1cblxuICAvKiogQ2hlY2sgaWYgY3VycmVudCBwYWdlIGlzIHN0aWxsIHZhbGlkICovXG4gIHByaXZhdGUgYXN5bmMgaXNQYWdlVmFsaWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5jdXJyZW50UGFnZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgYXdhaXQgdGhpcy5jdXJyZW50UGFnZS5ldmFsdWF0ZSgnMScpOyAvLyBRdWljayB2YWxpZGF0aW9uXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogUmVzZXQgdGhlIGluYWN0aXZpdHkgY2xlYW51cCB0aW1lciAqL1xuICBwcml2YXRlIHJlc2V0Q2xlYW51cFRpbWVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNsZWFudXBUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuY2xlYW51cFRpbWVyKTtcbiAgICB0aGlzLmxhc3RBY3Rpdml0eSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5jbGVhbnVwVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZGlzcG9zZSgpLCB0aGlzLklOQUNUSVZJVFlfVElNRU9VVF9NUyk7XG4gIH1cblxuICAvKiogRXhwbGljaXRseSBkaXNwb3NlIGJyb3dzZXIgYW5kIGNhbmNlbCBjbGVhbnVwIHRpbWVyICovXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2xlYW51cFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5jbGVhbnVwVGltZXIpO1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5icm93c2VySW5zdGFuY2UgJiYgdGhpcy5icm93c2VySW5zdGFuY2UuY29ubmVjdGVkKCkpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9hd2FpdC10aGVuYWJsZVxuICAgICAgICBhd2FpdCB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGNsb3NlIGVycm9yc1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmJyb3dzZXJJbnN0YW5jZSA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnRQYWdlID0gbnVsbDtcbiAgICAgIHRoaXMubGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMucmV0cnlDb3VudCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrIGlmIGJyb3dzZXIgaXMgY29ubmVjdGVkICovXG4gIGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhISh0aGlzLmJyb3dzZXJJbnN0YW5jZSAmJiB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jb25uZWN0ZWQoKSk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBjdXJyZW50IHBhZ2UgKHB1YmxpYyBhY2Nlc3NvcikgKi9cbiAgZ2V0Q3VycmVudFBhZ2UoKTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UGFnZTtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIGN1cnJlbnQgcGFnZSAocHVibGljIHNldHRlcikgKi9cbiAgc2V0Q3VycmVudFBhZ2UocGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2U7XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlIGZvciB0aGlzIG1vZHVsZVxuY29uc3QgYnJvd3Nlck1hbmFnZXIgPSBuZXcgQnJvd3NlclNlc3Npb25NYW5hZ2VyKCk7XG5cbi8qKiBFeHBvcnQgY2xlYW51cCBmdW5jdGlvbiBmb3IgcGx1Z2luIHVubG9hZCBsaWZlY3ljbGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG59XG5cbi8vIEM1IEZJWDogUHJvcGVyIHBhcmFtIHR5cGVzXG5pbnRlcmZhY2UgQnJvd3Nlck9wZW5QYWdlUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZztcbiAgd2FpdF9mb3Jfc2VsZWN0b3I/OiBzdHJpbmc7XG4gIGZ1bGxfcGFnZV9zY3JlZW5zaG90PzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEJyb3dzZXJTZXNzaW9uQ29udHJvbFBhcmFtcyB7XG4gIGFjdGlvbnM/OiB1bmtub3duW107XG4gIHJlYWRfcGFnZT86IGJvb2xlYW47XG4gIGZ1bGxfcmVhZD86IGJvb2xlYW47XG4gIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFByZXZpZXdIdG1sUGFyYW1zIHtcbiAgaHRtbF9jb250ZW50OiBzdHJpbmc7XG4gIGZpbGVfbmFtZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE9wZW5GaWxlUGFyYW1zIHtcbiAgdGFyZ2V0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJyb3dzZXJUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG4gIC8vIGJyb3dzZXJfb3Blbl9wYWdlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYnJvd3Nlcl9vcGVuX3BhZ2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnT3BlbiBhIHdlYnBhZ2UgaW4gYSBoZWFkbGVzcyBicm93c2VyIChQdXBwZXRlZXIpLCByZW5kZXIgaXQgb25jZSwgYW5kIHJldHVybiBjb250ZW50LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIG9wZW4nKSxcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdQYXRoIHRvIHNhdmUgYSBzY3JlZW5zaG90LicpLFxuICAgICAgd2FpdF9mb3Jfc2VsZWN0b3I6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ1NTIHNlbGVjdG9yIHRvIHdhaXQgZm9yIGJlZm9yZSByZXR1cm5pbmcuJyksXG4gICAgICBmdWxsX3BhZ2Vfc2NyZWVuc2hvdDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnSWYgdHJ1ZSwgY2FwdHVyZXMgdGhlIGZ1bGwgcGFnZSB3aGVuIHRha2luZyBhIHNjcmVlbnNob3QuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsLCBzY3JlZW5zaG90X3BhdGgsIHdhaXRfZm9yX3NlbGVjdG9yLCBmdWxsX3BhZ2Vfc2NyZWVuc2hvdCB9OiBCcm93c2VyT3BlblBhZ2VQYXJhbXMpID0+IHtcbiAgICAgIGxldCBicm93c2VyOiBQdXBwZXRlZXIuQnJvd3NlciB8IG51bGwgPSBudWxsO1xuICAgICAgbGV0IHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGJyb3dzZXIgPSBhd2FpdCBicm93c2VyTWFuYWdlci5nZXRCcm93c2VyKCk7XG4gICAgICAgIHBhZ2UgPSBicm93c2VyTWFuYWdlci5nZXRDdXJyZW50UGFnZSgpO1xuXG4gICAgICAgIGlmICghcGFnZSB8fCAoYXdhaXQgcGFnZS51cmwoKSkgIT09IHVybCkge1xuICAgICAgICAgIC8vIElmIG5vIGN1cnJlbnQgcGFnZSBvciBVUkwgZG9lc24ndCBtYXRjaCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAgIHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICBicm93c2VyTWFuYWdlci5zZXRDdXJyZW50UGFnZShwYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHBhZ2UuZ290byh1cmwsIHsgd2FpdFVudGlsOiAnZG9tY29udGVudGxvYWRlZCcgfSk7XG5cbiAgICAgICAgaWYgKHdhaXRfZm9yX3NlbGVjdG9yKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvclNlbGVjdG9yKHdhaXRfZm9yX3NlbGVjdG9yLCB7IHRpbWVvdXQ6IDUwMDAgfSk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBJZ25vcmUgdGltZW91dCwgY29udGludWUgd2l0aCBjb250ZW50IGV4dHJhY3Rpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHREYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgdXJsLCBvcGVuZWQ6IHRydWUgfTtcblxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoLCBmdWxsUGFnZTogZnVsbF9wYWdlX3NjcmVlbnNob3QgfSk7XG4gICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90U2F2ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlIHN0cmluZy1iYXNlZCBldmFsdWF0ZSB0byBieXBhc3MgVFMyNTg0L1RTMjMwNCAnZG9jdW1lbnQnIGVycm9ycyBpbiBOb2RlLmpzIGVudmlyb25tZW50XG4gICAgICAgIGNvbnN0IHRleHRDb250ZW50OiBzdHJpbmcgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKGByZXR1cm4gZG9jdW1lbnQuYm9keSA/IGRvY3VtZW50LmJvZHkuaW5uZXJUZXh0IDogJyc7YCk7XG4gICAgICAgIHJlc3VsdERhdGEucGFnZVRleHQgPSB0ZXh0Q29udGVudC5zdWJzdHJpbmcoMCwgMjAwMCk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0RGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gcGFnZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIE5PVEU6IFdlIGRvbid0IGNsb3NlIHRoZSBicm93c2VyIGhlcmUgYmVjYXVzZSB3ZSB1c2UgYSBzaW5nbGV0b24gcGF0dGVybi5cbiAgICAgICAgLy8gVGhlIGJyb3dzZXIgc3RheXMgYWxpdmUgZm9yIHN1YnNlcXVlbnQgcmVxdWVzdHMgdmlhIGJyb3dzZXJfc2Vzc2lvbl9jb250cm9sLlxuICAgICAgICAvLyBVc2UgYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlIHRvIGV4cGxpY2l0bHkgdGVybWluYXRlIGl0LlxuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBicm93c2VyX3Nlc3Npb25fY29udHJvbCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Jyb3dzZXJfc2Vzc2lvbl9jb250cm9sJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvbnRyb2wgdGhlIGFjdGl2ZSBwZXJzaXN0ZW50IGJyb3dzZXIgc2Vzc2lvbi4gU3VwcG9ydHMgYWN0aW9ucywgcGFnZSByZWFkaW5nLCBzY3JlZW5zaG90IGNhcHR1cmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBhY3Rpb25zOiB6LmFycmF5KHouYW55KCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHNjcmlwdGVkIGJyb3dzZXIgYWN0aW9ucyB0byBleGVjdXRlLicpLFxuICAgICAgcmVhZF9wYWdlOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdJZiB0cnVlLCByZXR1cm5zIHBhZ2UgbWV0YWRhdGEuJyksXG4gICAgICBmdWxsX3JlYWQ6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0lmIHRydWUsIGZvcmNlcyBmdWxsIHBhZ2UgdGV4dCBvdXRwdXQuJyksXG4gICAgICBzY3JlZW5zaG90X3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgc2NyZWVuc2hvdCBvdXRwdXQgcGF0aC4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBhY3Rpb25zLCByZWFkX3BhZ2UsIGZ1bGxfcmVhZCwgc2NyZWVuc2hvdF9wYXRoIH06IEJyb3dzZXJTZXNzaW9uQ29udHJvbFBhcmFtcykgPT4ge1xuICAgICAgbGV0IHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHBhZ2UgPSBhd2FpdCBicm93c2VyTWFuYWdlci5nZXRQYWdlKCk7XG5cbiAgICAgICAgaWYgKGFjdGlvbnMgJiYgQXJyYXkuaXNBcnJheShhY3Rpb25zKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgYWN0aW9uIG9mIGFjdGlvbnMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5bXSkge1xuICAgICAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuY2xpY2soYWN0aW9uLnNlbGVjdG9yIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAndHlwZScpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS50eXBlKGFjdGlvbi5zZWxlY3RvciBhcyBzdHJpbmcsIGFjdGlvbi50ZXh0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAnZ290bycpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKGFjdGlvbi51cmwgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09ICdldmFsdWF0ZScpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5ldmFsdWF0ZShhY3Rpb24uc2NyaXB0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IGFjdGlvbnNFeGVjdXRlZDogYWN0aW9ucz8ubGVuZ3RoIHx8IDAgfTtcblxuICAgICAgICBpZiAocmVhZF9wYWdlIHx8IGZ1bGxfcmVhZCkge1xuICAgICAgICAgIC8vIFVzZSBzdHJpbmctYmFzZWQgZXZhbHVhdGUgdG8gYnlwYXNzIFRTMjU4NCAnZG9jdW1lbnQnIGVycm9ycyBpbiBOb2RlLmpzIGVudmlyb25tZW50XG4gICAgICAgICAgY29uc3QgdGV4dDogc3RyaW5nID0gYXdhaXQgcGFnZS5ldmFsdWF0ZShgcmV0dXJuIGRvY3VtZW50LmJvZHkgPyBkb2N1bWVudC5ib2R5LmlubmVyVGV4dCA6ICcnO2ApO1xuICAgICAgICAgIHJlc3VsdERhdGEucGFnZVRleHQgPSBmdWxsX3JlYWQgPyB0ZXh0IDogdGV4dC5zdWJzdHJpbmcoMCwgMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoIH0pO1xuICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFNhdmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEJyb3dzZXIgY29udHJvbCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBQYWdlIHN0YXlzIGFsaXZlIGZvciBzZXNzaW9uIHJldXNlLiBCcm93c2VyIGlzIG1hbmFnZWQgYnkgYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlLlxuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBicm93c2VyX3Nlc3Npb25fY2xvc2UgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdicm93c2VyX3Nlc3Npb25fY2xvc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2xvc2UgdGhlIGFjdGl2ZSBwZXJzaXN0ZW50IGJyb3dzZXIgc2Vzc2lvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY2xvc2VkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjbG9zZSBicm93c2VyIHNlc3Npb246ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBFbnN1cmUgY2xlYW51cCBldmVuIG9uIGZhaWx1cmVcbiAgICAgICAgYXdhaXQgYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBwcmV2aWV3X2h0bWwgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdwcmV2aWV3X2h0bWwnLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlbmRlciBhbmQgcHJldmlldyBIVE1MIGNvbnRlbnQgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYnJvd3Nlci5cIixcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBIVE1MIGNvbnRlbnQgdG8gcmVuZGVyJyksXG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdwcmV2aWV3Lmh0bWwnKS5kZXNjcmliZSgnT3B0aW9uYWwgZmlsZW5hbWUgKGRlZmF1bHQ6IHByZXZpZXcuaHRtbCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBodG1sX2NvbnRlbnQsIGZpbGVfbmFtZSB9OiBQcmV2aWV3SHRtbFBhcmFtcykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBmaWxlX25hbWUgfHwgJ3ByZXZpZXcuaHRtbCc7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgZmlsZU5hbWUpO1xuXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWxfY29udGVudCk7XG5cbiAgICAgICAgLy8gT3BlbiBpbiBkZWZhdWx0IGJyb3dzZXIgdXNpbmcgRVMgaW1wb3J0XG4gICAgICAgIGNvbnN0IG9wZW5Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ29wZW4nKTtcbiAgICAgICAgYXdhaXQgb3Blbk1vZHVsZS5kZWZhdWx0KGZpbGVQYXRoKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHByZXZpZXdlZDogdHJ1ZSwgZmlsZTogZmlsZU5hbWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHByZXZpZXcgSFRNTDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gb3Blbl9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnb3Blbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogXCJPcGVuIGEgZmlsZSBvciBVUkwgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYXBwbGljYXRpb24uXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGFyZ2V0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdGaWxlIHBhdGggb3IgVVJMJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGFyZ2V0IH06IE9wZW5GaWxlUGFyYW1zKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdCh0YXJnZXQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG9wZW5lZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gb3BlbiBmaWxlOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IHZhbGlkYXRlU1FMUXVlcnkgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5cbi8vIExhenktbG9hZCBub2RlOnNxbGl0ZSAoTm9kZS5qcyAyMyspLiBHcmFjZWZ1bCBmYWxsYmFjayBmb3Igb2xkZXIgTm9kZSB2ZXJzaW9ucy5cbmxldCBzcWxpdGVNb2R1bGU6IHR5cGVvZiBpbXBvcnQoJ25vZGU6c3FsaXRlJykgfCBudWxsID0gbnVsbDtcbmxldCBzcWxpdGVMb2FkRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTcWxpdGUoKTogUHJvbWlzZTx0eXBlb2YgaW1wb3J0KCdub2RlOnNxbGl0ZScpPiB7XG4gIGlmIChzcWxpdGVNb2R1bGUpIHJldHVybiBzcWxpdGVNb2R1bGU7XG4gIGlmIChzcWxpdGVMb2FkRXJyb3IpIHRocm93IG5ldyBFcnJvcihzcWxpdGVMb2FkRXJyb3IpO1xuXG4gIHRyeSB7XG4gICAgc3FsaXRlTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdub2RlOnNxbGl0ZScpO1xuICAgIHJldHVybiBzcWxpdGVNb2R1bGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHNxbGl0ZUxvYWRFcnJvciA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgU1FMaXRlIGlzIG5vdCBhdmFpbGFibGUgKG5vZGU6c3FsaXRlIHJlcXVpcmVzIE5vZGUuanMgMjMrKS4gYCArXG4gICAgICBgT3JpZ2luYWwgZXJyb3I6ICR7c3FsaXRlTG9hZEVycm9yfS4gYCArXG4gICAgICBgUGxlYXNlIGRpc2FibGUgZGF0YWJhc2UgcXVlcmllcyBpbiBwbHVnaW4gc2V0dGluZ3Mgb3IgdXBncmFkZSBOb2RlLmBcbiAgICApO1xuICB9XG59XG5cbi8qKiBSZXNldCBzcWxpdGUgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFNxbGl0ZUNhY2hlKCk6IHZvaWQge1xuICBzcWxpdGVNb2R1bGUgPSBudWxsO1xuICBzcWxpdGVMb2FkRXJyb3IgPSBudWxsO1xufVxuXG4vKiogVHlwZWQgcGFyYW1zIGludGVyZmFjZSAqL1xuaW50ZXJmYWNlIFF1ZXJ5RGF0YWJhc2VQYXJhbXMge1xuICBxdWVyeTogc3RyaW5nO1xuICBkYl9wYXRoPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEYXRhYmFzZVRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBxdWVyeV9kYXRhYmFzZSB0b29sIFx1MjAxNCBDNyBGSVg6IEFkZGVkIG9wdGlvbmFsIGRiX3BhdGggcGFyYW1ldGVyXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3F1ZXJ5X2RhdGFiYXNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biByZWFkLW9ubHkgU1FMaXRlIHF1ZXJpZXMuIERlZmF1bHRzIHRvIGluLW1lbW9yeSBkYXRhYmFzZTsgb3B0aW9uYWxseSBzcGVjaWZ5IGEgZmlsZSBwYXRoLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NRTCBxdWVyeSBzdHJpbmcgKHJlYWQtb25seSBvbmx5KScpLFxuICAgICAgZGJfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJzptZW1vcnk6JykuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIFNRTGl0ZSBkYXRhYmFzZSBmaWxlIChkZWZhdWx0OiA6bWVtb3J5OiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgZGJfcGF0aCB9OiBRdWVyeURhdGFiYXNlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBTZWN1cml0eSBjaGVjayAtIHVzZSByb2J1c3QgU1FMIHZhbGlkYXRpb24gaW5zdGVhZCBvZiBzaW1wbGUgcmVnZXggbWF0Y2hpbmdcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkID0gdmFsaWRhdGVTUUxRdWVyeShxdWVyeSk7XG4gICAgICAgIGlmICghdmFsaWRhdGVkLnZhbGlkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIFNRTCBxdWVyeSBkZXRlY3RlZDogJHt2YWxpZGF0ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExhenktbG9hZCBub2RlOnNxbGl0ZSB3aXRoIGdyYWNlZnVsIGZhbGxiYWNrXG4gICAgICAgIGNvbnN0IHsgb3BlbiB9ID0gYXdhaXQgZ2V0U3FsaXRlKCk7XG4gICAgICAgIGNvbnN0IGRiID0gb3BlbihkYl9wYXRoIHx8ICc6bWVtb3J5OicpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUocXVlcnkpO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBzdG10LmFsbCgpO1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcXVlcnksIHJlc3VsdHMgfSB9O1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhdGFiYXNlIHF1ZXJ5IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IEJhY2tncm91bmRDb21tYW5kTWFuYWdlciB9IGZyb20gJy4uL2JhY2tncm91bmRDb21tYW5kcy5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZUNvbW1hbmQgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSdW5CYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgdGltZW91dF9ob3VyczogbnVtYmVyOyBuYW1lOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGVja0JhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgaWQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIENhbmNlbEJhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgaWQ6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcik6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBydW5fYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBhIGxvbmctcnVubmluZyBwcm9jZXNzIGluIHRoZSBiYWNrZ3JvdW5kLiBUaGUgcHJvY2VzcyBpcyBub3QgYmxvY2tlZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfaG91cnM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDEwKS5kZXNjcmliZSgnTUFOREFUT1JZOiBIb3cgbG9uZyB0aGUgcHJvY2VzcyBpcyBhbGxvd2VkIHRvIHJ1biBiZWZvcmUgYmVpbmcga2lsbGVkLicpLFxuICAgICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTUFOREFUT1JZOiBBIHNob3J0LCBkZXNjcmlwdGl2ZSBuYW1lIGZvciB0aGUgYmFja2dyb3VuZCB0YXNrJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCwgdGltZW91dF9ob3VycywgbmFtZSB9OiBSdW5CYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2VjdXJpdHkgY2hlY2sgLSB1c2Ugcm9idXN0IHNhbml0aXphdGlvbiBpbnN0ZWFkIG9mIHNpbXBsZSBzdHJpbmcgbWF0Y2hpbmdcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGlkID0gYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLnJlZ2lzdGVyKGNvbW1hbmQsIHRpbWVvdXRfaG91cnMsIG5hbWUpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlkLCBuYW1lLCBjb21tYW5kLCB0aW1lb3V0SG91cnM6IHRpbWVvdXRfaG91cnMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2hlY2tfYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2hlY2tfYmFja2dyb3VuZF9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrIHRoZSBzdGF0dXMsIHN0ZG91dCwgYW5kIHN0ZGVyciBvZiBhIHJ1bm5pbmcgb3IgY29tcGxldGVkIGJhY2tncm91bmQgY29tbWFuZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tbWFuZCBpZGVudGlmaWVyJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaWQgfTogQ2hlY2tCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IGJhY2tncm91bmRDb21tYW5kTWFuYWdlci5jaGVjayhpZCk7XG4gICAgICAgIGlmICghY29tbWFuZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbW1hbmQgbm90IGZvdW5kOiAke2lkfWAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBjb21tYW5kIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjYW5jZWxfYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2FuY2VsX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdLaWxsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1hbmQgaWRlbnRpZmllcicpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGlkIH06IENhbmNlbEJhY2tncm91bmRDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjYW5jZWxsZWQgPSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIuY2FuY2VsKGlkKTtcbiAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDYW5ub3QgY2FuY2VsIGNvbW1hbmQ6ICR7aWR9IChub3QgZm91bmQgb3Igbm90IHJ1bm5pbmcpYCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaWQsIGNhbmNlbGxlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZUNvbW1hbmQgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNoYXJlZCBTcGF3biBIZWxwZXIgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNwYXduUmVzdWx0IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZGF0YT86IHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH07XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNhZmVseSBzcGF3biBhIHByb2Nlc3Mgd2l0aCB0aW1lb3V0LCBjYXB0dXJpbmcgc3Rkb3V0L3N0ZGVyci5cbiAqIEVsaW1pbmF0ZXMgY29kZSBkdXBsaWNhdGlvbiBhY3Jvc3MgZXhlY3V0aW9uIHRvb2xzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzYWZlU3Bhd24oXG4gIGV4ZTogc3RyaW5nLFxuICBhcmdzOiBzdHJpbmdbXSxcbiAgdGltZW91dE1zOiBudW1iZXIsXG4gIGlucHV0Pzogc3RyaW5nXG4pOiBQcm9taXNlPFNwYXduUmVzdWx0PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IHByb2MgPSBzcGF3bihleGUsIGFyZ3MsIHtcbiAgICAgIHN0ZGlvOiBbJ3BpcGUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgICB0aW1lb3V0OiB0aW1lb3V0TXMsXG4gICAgICBjd2Q6IGdldFdvcmtpbmdEaXIoKSwgLy8gRXhlY3V0ZSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgIH0pO1xuXG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIGlmIChpbnB1dCkge1xuICAgICAgcHJvYy5zdGRpbj8ud3JpdGUoaW5wdXQpO1xuICAgICAgcHJvYy5zdGRpbj8uZW5kKCk7XG4gICAgfVxuXG4gICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwcm9jLmtpbGwoKTtcbiAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFeGVjdXRpb24gdGltZWQgb3V0JyB9KTtcbiAgICB9LCB0aW1lb3V0TXMpO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzdGRvdXQ6IHN0ZG91dC50cmltKCksIHN0ZGVycjogc3RkZXJyLnRyaW0oKSB9IH0pO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3Bhd24gZmFpbGVkOiAke2Vyci5tZXNzYWdlfWAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUnVuSmF2YVNjcmlwdFBhcmFtcyB7IGphdmFzY3JpcHQ6IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgUnVuUHl0aG9uUGFyYW1zIHsgcHl0aG9uOiBzdHJpbmc7IHRpbWVvdXRfc2Vjb25kcz86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEV4ZWN1dGVDb21tYW5kUGFyYW1zIHsgY29tbWFuZDogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXI7IGlucHV0Pzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUnVuSW5UZXJtaW5hbFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBFeGVjdXRpb24gVG9vbHMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRXhlY3V0aW9uVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJ1bl9qYXZhc2NyaXB0IHRvb2wgXHUyMDE0IFNBTkRCT1hFRCB3aXRoIGRlbm8gKGlmIGF2YWlsYWJsZSkgb3Igbm9kZSB3aXRoIHN0cmljdCByZXN0cmljdGlvbnNcbiAgLy8gUzUgRklYOiBFbmhhbmNlZCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gdG8gcHJldmVudCBldmFsL3JlcXVpcmUgYnlwYXNzZXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2phdmFzY3JpcHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIEphdmFTY3JpcHQgY29kZSBzbmlwcGV0IHVzaW5nIE5vZGUuanMgKHNhbmRib3hlZCkuIE5vIGV4dGVybmFsIG1vZHVsZSBpbXBvcnRzIGFsbG93ZWQuIFN0YW5kYXJkIGxpYnJhcnkgb25seS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGphdmFzY3JpcHQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBKYXZhU2NyaXB0IGNvZGUgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCA2MCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBqYXZhc2NyaXB0LCB0aW1lb3V0X3NlY29uZHMgfTogUnVuSmF2YVNjcmlwdFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gUm9idXN0IGRhbmdlcm91cyBwYXR0ZXJuIGRldGVjdGlvbiBcdTIwMTQgYmxvY2tzIGV2YWwsIHJlcXVpcmUsIGltcG9ydCwgZnMsIGNoaWxkX3Byb2Nlc3NcbiAgICAgICAgLy8gUzUgRklYOiBBZGRlZCBwYXR0ZXJucyBmb3IgY29tbW9uIGJ5cGFzcyB0ZWNobmlxdWVzXG4gICAgICAgIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICAgICAgIC9cXGJyZXF1aXJlXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrL2ksXG4gICAgICAgICAgL1xcYmZzXFwuL2ksXG4gICAgICAgICAgL1xcYmNoaWxkX3Byb2Nlc3NcXGIvaSxcbiAgICAgICAgICAvXFxiZXZhbFxccypcXCgvaSxcbiAgICAgICAgICAvXFxiZXhlY1xccypcXCgvaSxcbiAgICAgICAgICAvZ2xvYmFsVGhpc1xcLnJlcXVpcmUvaSxcbiAgICAgICAgICAvcHJvY2Vzc1xcLmV4aXQvaSxcbiAgICAgICAgICAvX19wcm90b19fL2ksXG4gICAgICAgICAgLy8gUzUgRklYOiBCeXBhc3MgcHJldmVudGlvbiBwYXR0ZXJuc1xuICAgICAgICAgIC9GdW5jdGlvblxccypcXCgvaSwgICAgICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uIGNvbnN0cnVjdG9yXG4gICAgICAgICAgL1N0cmluZ1xcLmZyb21DaGFyQ29kZVxccypcXCgvaSwgICAgICAgLy8uZnJvbUNoYXJDb2RlIGJ5cGFzc1xuICAgICAgICAgIC9cXGJpbXBvcnRcXHMqXFwoLipcXCkvaSwgICAgICAgICAgICAgICAvLyBEeW5hbWljIGltcG9ydFxuICAgICAgICAgIC9cXC5jb25zdHJ1Y3Rvci9pLCAgICAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3RvciBhY2Nlc3NcbiAgICAgICAgICAvcmVxdWlyZVxcLnJlc29sdmUvaSwgICAgICAgICAgICAgICAgLy8gcmVxdWlyZS5yZXNvbHZlIGJ5cGFzc1xuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBkYW5nZXJvdXNQYXR0ZXJucykge1xuICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QoamF2YXNjcmlwdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhbmdlcm91cyBjb2RlIGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA1KSAqIDEwMDApO1xuICAgICAgICBcbiAgICAgICAgLy8gVXNlIE5vZGUuanMgd2l0aCAtLXVuaGFuZGxlZC1yZWplY3Rpb25zPXRocm93IGZvciBzYWZldHlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKCdub2RlJywgWyctZScsIGphdmFzY3JpcHRdLCB0aW1lb3V0TXMpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmVycm9yIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmRhdGE/LnN0ZGVyciAmJiAhcmVzdWx0LmRhdGEuc3Rkb3V0KSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZGF0YS5zdGRlcnIgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgb3V0cHV0OiByZXN1bHQuZGF0YT8uc3Rkb3V0IHx8ICcnIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJ1bl9weXRob24gdG9vbCBcdTIwMTQgU0FOREJPWEVEIHdpdGggc3RyaWN0IGltcG9ydCByZXN0cmljdGlvbnNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX3B5dGhvbicsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gUHl0aG9uIGNvZGUgc25pcHBldCAoc2FuZGJveGVkLCBubyBleHRlcm5hbCBtb2R1bGVzKS4gU3RhbmRhcmQgbGlicmFyeSBvbmx5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcHl0aG9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgUHl0aG9uIGNvZGUgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCA2MCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBweXRob24sIHRpbWVvdXRfc2Vjb25kcyB9OiBSdW5QeXRob25QYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFJvYnVzdCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gXHUyMDE0IGJsb2NrcyBvcywgc3VicHJvY2Vzcywgc2h1dGlsLCBldmFsLCBleGVjXG4gICAgICAgIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrb3NcXGIvaSxcbiAgICAgICAgICAvXFxiZnJvbVxccytvc1xccytpbXBvcnRcXGIvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK3N1YnByb2Nlc3NcXGIvaSxcbiAgICAgICAgICAvXFxiZnJvbVxccytzdWJwcm9jZXNzXFxzK2ltcG9ydFxcYi9pLFxuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrc2h1dGlsXFxiL2ksXG4gICAgICAgICAgL1xcYl9faW1wb3J0X19cXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV2YWxcXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV4ZWNcXHMqXFwoL2ksXG4gICAgICAgICAgL29zXFwuc3lzdGVtL2ksXG4gICAgICAgICAgL29zXFwucG9wZW4vaSxcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICAgICAgICBpZiAocGF0dGVybi50ZXN0KHB5dGhvbikpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhbmdlcm91cyBQeXRob24gaW1wb3J0IGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA1KSAqIDEwMDApO1xuICAgICAgICBcbiAgICAgICAgLy8gVHJ5IHB5dGhvbjMgZmlyc3QsIGZhbGwgYmFjayB0byBweXRob25cbiAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bigncHl0aG9uMycsIFsnLWMnLCBweXRob25dLCB0aW1lb3V0TXMpO1xuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5lcnJvcj8uaW5jbHVkZXMoJ25vdCBmb3VuZCcpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKCdweXRob24nLCBbJy1jJywgcHl0aG9uXSwgdGltZW91dE1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5kYXRhPy5zdGRlcnIgJiYgIXJlc3VsdC5kYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmRhdGEuc3RkZXJyIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG91dHB1dDogcmVzdWx0LmRhdGE/LnN0ZG91dCB8fCAnJyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBleGVjdXRlX2NvbW1hbmQgdG9vbCBcdTIwMTQgU0FGRSBWRVJTSU9OIHdpdGhvdXQgc2hlbGw6dHJ1ZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdleGVjdXRlX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRXhlY3V0ZSBhIGNvbW1hbmQgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFVzZXMgc2FmZSBhcmd1bWVudCBwYXJzaW5nIChubyBzaGVsbCBpbnRlcnByZXRhdGlvbikuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2hlbGwgY29tbWFuZCB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X3NlY29uZHM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDYwKS5vcHRpb25hbCgpLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ1RpbWVvdXQgaW4gc2Vjb25kcyAobWF4IDYwKScpLFxuICAgICAgaW5wdXQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIklucHV0IHRleHQgdG8gcGlwZSB0byB0aGUgY29tbWFuZCdzIHN0ZGluLlwiKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21tYW5kLCB0aW1lb3V0X3NlY29uZHMsIGlucHV0IH06IEV4ZWN1dGVDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUNvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgIGlmICghc2FuaXRpemVkLnNhZmUpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbnNhZmUgY29tbWFuZCBkZXRlY3RlZDogJHtzYW5pdGl6ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhcnNlIGNvbW1hbmQgaW50byBleGVjdXRhYmxlICsgYXJncyAobm8gc2hlbGwgaW50ZXJwcmV0YXRpb24pXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcGFyc2VkLmV4ZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VtcHR5IGNvbW1hbmQnIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA1KSAqIDEwMDApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24ocGFyc2VkLmV4ZSwgcGFyc2VkLmFyZ3MsIHRpbWVvdXRNcywgaW5wdXQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmVycm9yIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmRhdGE/LnN0ZGVyciAmJiAhcmVzdWx0LmRhdGEuc3Rkb3V0KSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZGF0YS5zdGRlcnIgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdC5kYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBydW5faW5fdGVybWluYWwgdG9vbCBcdTIwMTQgU0FGRSBWRVJTSU9OIHdpdGhvdXQgc2hlbGw6dHJ1ZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdydW5faW5fdGVybWluYWwnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGF1bmNoIGEgY29tbWFuZCBpbiBhIG5ldywgc2VwYXJhdGUgaW50ZXJhY3RpdmUgdGVybWluYWwgd2luZG93LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tbWFuZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNoZWxsIGNvbW1hbmQgdG8gZXhlY3V0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbW1hbmQgfTogUnVuSW5UZXJtaW5hbFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuICAgICAgICBcbiAgICAgICAgaWYgKGlzV2luZG93cykge1xuICAgICAgICAgIHNwYXduKCdjbWQuZXhlJywgWycvYycsICdzdGFydCcsICdDb21tYW5kIFByb21wdCcsICcvaycsIGNvbW1hbmRdLCB7IFxuICAgICAgICAgICAgZGV0YWNoZWQ6IHRydWUsIFxuICAgICAgICAgICAgc3RkaW86ICdpZ25vcmUnIFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHRlcm1pbmFscyA9IFsneHRlcm0nLCAnZ25vbWUtdGVybWluYWwnLCAna29uc29sZScsICd4ZmNlNC10ZXJtaW5hbCddO1xuICAgICAgICAgIGxldCBsYXVuY2hlZCA9IGZhbHNlO1xuICAgICAgICAgIFxuICAgICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtaW5hbHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHNwYXduKHRlcm0sIFsnLWUnLCBjb21tYW5kXSwgeyBkZXRhY2hlZDogdHJ1ZSwgc3RkaW86ICdpZ25vcmUnIH0pO1xuICAgICAgICAgICAgICBsYXVuY2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIWxhdW5jaGVkKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBzdWl0YWJsZSB0ZXJtaW5hbCBlbXVsYXRvciBmb3VuZC4gSW5zdGFsbCB4dGVybSBvciBnbm9tZS10ZXJtaW5hbC4nIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBsYXVuY2hlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gb3BlbiB0ZXJtaW5hbDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuXG4vKipcbiAqIFNhZmVseSBwYXJzZSBhIHNoZWxsIGNvbW1hbmQgaW50byBleGVjdXRhYmxlIGFuZCBhcmd1bWVudHMuXG4gKiBIYW5kbGVzIGJhc2ljIHF1b3RpbmcgYnV0IGF2b2lkcyBzaGVsbCBpbnRlcnByZXRhdGlvbiBlbnRpcmVseS5cbiAqL1xuZnVuY3Rpb24gcGFyc2VDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHsgZXhlOiBzdHJpbmc7IGFyZ3M6IHN0cmluZ1tdIH0ge1xuICBjb25zdCB0cmltbWVkID0gY29tbWFuZC50cmltKCk7XG4gIFxuICBpZiAoIXRyaW1tZWQpIHtcbiAgICByZXR1cm4geyBleGU6ICcnLCBhcmdzOiBbXSB9O1xuICB9XG5cbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG4gIGxldCBjdXJyZW50ID0gJyc7XG4gIGxldCBpblF1b3RlOiAnXCInIHwgXCInXCIgfCBudWxsID0gbnVsbDtcbiAgXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdHJpbW1lZC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoYXIgPSB0cmltbWVkW2ldO1xuICAgIFxuICAgIGlmIChpblF1b3RlKSB7XG4gICAgICBpZiAoY2hhciA9PT0gaW5RdW90ZSkge1xuICAgICAgICBpblF1b3RlID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQgKz0gY2hhcjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCIpIHtcbiAgICAgIGluUXVvdGUgPSBjaGFyO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gJyAnKSB7XG4gICAgICBpZiAoY3VycmVudCkge1xuICAgICAgICBwYXJ0cy5wdXNoKGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50ID0gJyc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnQgKz0gY2hhcjtcbiAgICB9XG4gIH1cbiAgXG4gIGlmIChjdXJyZW50KSB7XG4gICAgcGFydHMucHVzaChjdXJyZW50KTtcbiAgfVxuXG4gIGNvbnN0IGV4ZSA9IHBhcnRzWzBdIHx8ICcnO1xuICBjb25zdCBhcmdzID0gcGFydHMuc2xpY2UoMSk7XG4gIFxuICByZXR1cm4geyBleGUsIGFyZ3MgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlTWFuYWdlciB9IGZyb20gJy4uL3N0YXRlTWFuYWdlci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBOb3RpZnlPcHRpb25zIHtcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIG1zZz86IHN0cmluZztcbiAgc291bmQ/OiBib29sZWFuIHwgc3RyaW5nO1xuICBpY29uPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG50eXBlIFNhdmVNZW1vcnlQYXJhbXMgPSB7IGZhY3Q6IHN0cmluZzsgfTtcbnR5cGUgUmVhZENsaXBib2FyZFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIG5ldmVyPjtcbnR5cGUgV3JpdGVDbGlwYm9hcmRQYXJhbXMgPSB7IGNvbnRlbnQ6IHN0cmluZzsgfTtcbnR5cGUgU2VuZE5vdGlmaWNhdGlvblBhcmFtcyA9IHsgdGl0bGU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nOyBpY29uPzogc3RyaW5nOyB9O1xuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG4vKipcbiAqIENyb3NzLXBsYXRmb3JtIGNsaXBib2FyZCBvcGVyYXRpb25zIHVzaW5nIHN5c3RlbSBjb21tYW5kcy5cbiAqL1xuXG4vLyBTNiBGSVg6IFByb3BlciBlc2NhcGluZyBmb3Igc2hlbGwgaW5qZWN0aW9uIHByZXZlbnRpb25cbmZ1bmN0aW9uIGVzY2FwZUZvclBvd2VyU2hlbGwoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gRXNjYXBlIGRvdWJsZSBxdW90ZXMgYW5kIGRvbGxhciBzaWducyAod2hpY2ggdHJpZ2dlciB2YXJpYWJsZSBleHBhbnNpb24gaW4gUFMpXG4gIHJldHVybiBjb250ZW50LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKS5yZXBsYWNlKC9cXCQvZywgJ1xcXFwkJyk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUZvckJhc2goY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gRXNjYXBlIHNpbmdsZSBxdW90ZXMgYnkgZW5kaW5nIHRoZSBxdW90ZSwgYWRkaW5nIGVzY2FwZWQgcXVvdGUsIHJlLW9wZW5pbmcgcXVvdGVcbiAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSgvJy9nLCBcIidcXFxcJydcIik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRDbGlwYm9hcmQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuICAgIFxuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93cyBQb3dlclNoZWxsXG4gICAgICAgIGNtZCA9ICdwb3dlcnNoZWxsLmV4ZSc7XG4gICAgICAgIGFyZ3MgPSBbJy1Ob1Byb2ZpbGUnLCAnLUNvbW1hbmQnLCAnW0NvbnNvbGVdOjpPdXRwdXRFbmNvZGluZyA9IFtTeXN0ZW0uVGV4dC5FbmNvZGluZ106OlVURjg7IEdldC1DbGlwYm9hcmQgLVJhdyddO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TIHBicGFzdGVcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgJ3BicGFzdGUnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBMaW51eCB4Y2xpcCBvciB4c2VsXG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsICcoeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgLW8gMj4vZGV2L251bGwgfHwgeHNlbCAtLWNsaXBib2FyZCAtLW91dHB1dCAyPi9kZXYvbnVsbCkgfCB0ciAtZCBcXCdcXFxcMFxcJyddO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICBcbiAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsIChjb2RlKSA9PiB7XG4gICAgICBpZiAoY29kZSA9PT0gMCAmJiBzdGRvdXQudHJpbSgpKSB7XG4gICAgICAgIHJlc29sdmUoc3Rkb3V0LnRyaW0oKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBDbGlwYm9hcmQgcmVhZCBmYWlsZWQgKGV4aXQgY29kZSAke2NvZGV9KTogJHtzdGRlcnIgfHwgJ05vIGNsaXBib2FyZCBjb250ZW50J31gKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgXG4gICAgLy8gVGltZW91dCBhZnRlciA1IHNlY29uZHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2xpcGJvYXJkIHJlYWQgdGltZWQgb3V0JykpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cblxuLy8gUzYgRklYOiBQcm9wZXIgZXNjYXBpbmcgdG8gcHJldmVudCBzaGVsbCBpbmplY3Rpb24gaW4gY2xpcGJvYXJkIHdyaXRlXG5hc3luYyBmdW5jdGlvbiB3cml0ZUNsaXBib2FyZChjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuICAgIFxuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93cyBQb3dlclNoZWxsIHdpdGggU2V0LUNsaXBib2FyZCBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZENvbnRlbnQgPSBlc2NhcGVGb3JQb3dlclNoZWxsKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gWyctTm9Qcm9maWxlJywgJy1Db21tYW5kJywgYFtDb25zb2xlXTo6T3V0cHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4OyBcIiR7ZXNjYXBlZENvbnRlbnR9XCIgfCBTZXQtQ2xpcGJvYXJkYF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGFyd2luJzpcbiAgICAgICAgLy8gbWFjT1MgcGJjb3B5IFx1MjAxNCBTNiBGSVg6IFByb3BlciBlc2NhcGluZ1xuICAgICAgICBjb25zdCBlc2NhcGVkQmFzaCA9IGVzY2FwZUZvckJhc2goY29udGVudCk7XG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsIGBlY2hvIC1uICcke2VzY2FwZWRCYXNofScgfCBwYmNvcHlgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBMaW51eCB4Y2xpcCBvciB4c2VsIFx1MjAxNCBTNiBGSVg6IFByb3BlciBlc2NhcGluZ1xuICAgICAgICBjb25zdCBlc2NhcGVkTGludXggPSBlc2NhcGVGb3JCYXNoKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgZWNobyAtbiAnJHtlc2NhcGVkTGludXh9JyB8ICh4Y2xpcCAtc2VsZWN0aW9uIGNsaXBib2FyZCAyPi9kZXYvbnVsbCB8fCB4c2VsIC0tY2xpcGJvYXJkIC0taW5wdXQgMj4vZGV2L251bGwpYF07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHByb2MgPSBzcGF3bihjbWQsIGFyZ3MpO1xuICAgIFxuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsIChjb2RlKSA9PiB7XG4gICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBDbGlwYm9hcmQgd3JpdGUgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyfWApKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICBcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgc2Vjb25kc1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcHJvYy5raWxsKCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdDbGlwYm9hcmQgd3JpdGUgdGltZWQgb3V0JykpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGaW5kIExNIFN0dWRpbyBpbnN0YWxsYXRpb24gZGlyZWN0b3J5IGFjcm9zcyBwbGF0Zm9ybXMuXG4gKi9cbmZ1bmN0aW9uIGZpbmRMTVN0dWRpb0hvbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIC8vIENvbW1vbiBwYXRocyB0byBjaGVja1xuICBjb25zdCBjYW5kaWRhdGVzOiBzdHJpbmdbXSA9IFtdO1xuICBcbiAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkFQUERBVEEgfHwgJycsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkxPQ0FMQVBQREFUQSB8fCAnJywgJ1Byb2dyYW1zJywgJ2xtLXN0dWRpbycpLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuUFJPR1JBTUZJTEVTIHx8ICcnLCAnTE0gU3R1ZGlvJyksXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudlsnUFJPR1JBTURBVEEnXSB8fCAnJywgJ0xNIFN0dWRpbycpXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGFyd2luJzpcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJ0xpYnJhcnknLCAnQXBwbGljYXRpb24gU3VwcG9ydCcsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgJy9BcHBsaWNhdGlvbnMvTE0gU3R1ZGlvLmFwcC9Db250ZW50cy9SZXNvdXJjZXMvYXBwLmFzYXInXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDogLy8gTGludXhcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbCcsICdzaGFyZScsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgJy9vcHQvbG0tc3R1ZGlvJyxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgJycsICcubG0tc3R1ZGlvJylcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIFxuICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIHBhdGhzXG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVXRpbGl0eVRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlciwgZ2V0RW5hYmxlZFRvb2xzPzogKCkgPT4gc3RyaW5nW10pOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gc2F2ZV9tZW1vcnkgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzYXZlX21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdTYXZlIGEgc3BlY2lmaWMgcGllY2Ugb2YgaW5mb3JtYXRpb24gb3IgZmFjdCB0byBsb25nLXRlcm0gbWVtb3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmFjdDogei5zdHJpbmcoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBzcGVjaWZpYyBmYWN0IG9yIHBpZWNlIG9mIGluZm9ybWF0aW9uIHRvIHJlbWVtYmVyLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZhY3QgfTogU2F2ZU1lbW9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdGVNYW5hZ2VyLnNldChgbWVtb3J5XyR7RGF0ZS5ub3coKX1gLCBmYWN0KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzYXZlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfc3lzdGVtX2luZm8gdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfc3lzdGVtX2luZm8nLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGluZm9ybWF0aW9uIGFib3V0IHRoZSBzeXN0ZW0gKE9TLCBDUFUsIE1lbW9yeSkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHBsYXRmb3JtOiBvcy5wbGF0Zm9ybSgpLFxuICAgICAgICAgICAgYXJjaDogb3MuYXJjaCgpLFxuICAgICAgICAgICAgY3B1czogb3MuY3B1cygpLmxlbmd0aCxcbiAgICAgICAgICAgIHRvdGFsTWVtb3J5OiBvcy50b3RhbG1lbSgpLFxuICAgICAgICAgICAgZnJlZU1lbW9yeTogb3MuZnJlZW1lbSgpLFxuICAgICAgICAgICAgaG9zdG5hbWU6IG9zLmhvc3RuYW1lKCksXG4gICAgICAgICAgICByZWxlYXNlOiBvcy5yZWxlYXNlKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgc3lzdGVtIGluZm86ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlYWRfY2xpcGJvYXJkIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2NsaXBib2FyZCcsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIHRleHQgY29udGVudCBmcm9tIHRoZSBzeXN0ZW0gY2xpcGJvYXJkLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChfcGFyYW1zOiBSZWFkQ2xpcGJvYXJkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zIChlbXB0eSBvYmplY3QpXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZENsaXBib2FyZCgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbnRlbnQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gd3JpdGVfY2xpcGJvYXJkIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3cml0ZV9jbGlwYm9hcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnV3JpdGUgdGV4dCBjb250ZW50IHRvIHRoZSBzeXN0ZW0gY2xpcGJvYXJkLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgY29udGVudCB0byB3cml0ZSB0byBjbGlwYm9hcmQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb250ZW50IH06IFdyaXRlQ2xpcGJvYXJkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZUNsaXBib2FyZChjb250ZW50KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB3cml0dGVuOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHNlbmRfbm90aWZpY2F0aW9uIHRvb2wgLSBJTVBMRU1FTlRFRCB1c2luZyBub2RlLW5vdGlmaWVyXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NlbmRfbm90aWZpY2F0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlbmQgYSBzeXN0ZW0gbm90aWZpY2F0aW9uIHRvIHRoZSB1c2VyLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05vdGlmaWNhdGlvbiB0aXRsZScpLFxuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTm90aWZpY2F0aW9uIG1lc3NhZ2UnKSxcbiAgICAgIGljb246IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgY3VzdG9tIGljb24gcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBtZXNzYWdlLCBpY29uIH06IFNlbmROb3RpZmljYXRpb25QYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90aWZpZXJNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ25vZGUtbm90aWZpZXInKTtcbiAgICAgICAgIFxuICAgICAgICBjb25zdCBub3RpZmllciA9IG5vdGlmaWVyTW9kdWxlLmRlZmF1bHQgfHwgbm90aWZpZXJNb2R1bGU7XG5cbiAgICAgICAgY29uc3Qgb3B0aW9uczogTm90aWZ5T3B0aW9ucyA9IHtcbiAgICAgICAgICB0aXRsZTogdGl0bGUgfHwgJ0FJIFRvb2xib3gnLFxuICAgICAgICAgIG1zZzogbWVzc2FnZSB8fCAnJyxcbiAgICAgICAgICBzb3VuZDogdHJ1ZSwgLy8gSW5jbHVkZSBzb3VuZCBvbiBtYWNPU1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpY29uKSB7XG4gICAgICAgICAgb3B0aW9ucy5pY29uID0gaWNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vdGlmaWVyKG9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2VudDogdHJ1ZSwgdGl0bGUsIG1lc3NhZ2UgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHNlbmQgbm90aWZpY2F0aW9uOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmaW5kTE1TdHVkaW9Ib21lIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmaW5kTE1TdHVkaW9Ib21lJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xvY2F0ZSBMTSBTdHVkaW8gaW5zdGFsbGF0aW9uIGRpcmVjdG9yeSBhY3Jvc3MgcGxhdGZvcm1zLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGhvbWVEaXIgPSBmaW5kTE1TdHVkaW9Ib21lKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaG9tZURpcikge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBmb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgICAgcGF0aDogaG9tZURpcixcbiAgICAgICAgICAgICAgcGxhdGZvcm06IG9zLnBsYXRmb3JtKCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUHJvdmlkZSBjb21tb24gcGF0aHMgZm9yIG1hbnVhbCByZWZlcmVuY2VcbiAgICAgICAgICBjb25zdCBjb21tb25QYXRocyA9IFtcbiAgICAgICAgICAgICdXaW5kb3dzOiAlQVBQREFUQSVcXFxcbG0tc3R1ZGlvJyxcbiAgICAgICAgICAgICdtYWNPUzogfi9MaWJyYXJ5L0FwcGxpY2F0aW9uIFN1cHBvcnQvbG0tc3R1ZGlvJyxcbiAgICAgICAgICAgICdMaW51eDogfi8ubG9jYWwvc2hhcmUvbG0tc3R1ZGlvJ1xuICAgICAgICAgIF0uam9pbignXFxuJyk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogYExNIFN0dWRpbyBob21lIGRpcmVjdG9yeSBub3QgZm91bmQuXFxuXFxuQ29tbW9uIHBhdGhzOlxcbiR7Y29tbW9uUGF0aHN9YCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZmluZCBMTSBTdHVkaW8gaG9tZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2VuYWJsZWRfdG9vbHMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfZW5hYmxlZF90b29scycsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgbGlzdCBvZiBjdXJyZW50bHkgZW5hYmxlZCB0b29scyBiYXNlZCBvbiBjb25maWd1cmF0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnZXRFbmFibGVkVG9vbHMpIHtcbiAgICAgICAgICBjb25zdCB0b29sTmFtZXMgPSBnZXRFbmFibGVkVG9vbHMoKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHRvb2xDb3VudDogdG9vbE5hbWVzLmxlbmd0aCwgdG9vbHM6IHRvb2xOYW1lcyB9IH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVnaXN0cnkgYWNjZXNzIG5vdCBhdmFpbGFibGUnIH07XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgZW5hYmxlZCB0b29sczogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgSW1hZ2VUb1RleHRQYXJhbXMge1xuICBpbWFnZVBhdGg6IHN0cmluZztcbiAgbGFuZ3VhZ2U/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBEZXNjcmliZUltYWdlUGFyYW1zIHtcbiAgaW1hZ2VQYXRoOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBTY3JlZW5zaG90RGVza3RvcFBhcmFtcyB7XG4gIG91dHB1dFBhdGg/OiBzdHJpbmc7XG4gIGZvcm1hdD86ICdwbmcnIHwgJ2pwZWcnO1xuICBxdWFsaXR5PzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgQ29tcGFyZUltYWdlc1BhcmFtcyB7XG4gIGltYWdlMVBhdGg6IHN0cmluZztcbiAgaW1hZ2UyUGF0aDogc3RyaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBIZWxwZXIgRnVuY3Rpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBWYWxpZGF0ZSBmaWxlIGV4aXN0cyBhbmQgaXMgYW4gaW1hZ2UgKi9cbmZ1bmN0aW9uIHZhbGlkYXRlSW1hZ2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9IHtcbiAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpO1xuICBcbiAgaWYgKCFzdGF0LmlzRmlsZSgpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFBhdGggXCIke2ZpbGVQYXRofVwiIGlzIG5vdCBhIGZpbGVgIH07XG4gIH1cbiAgXG4gIC8vIENoZWNrIGZpbGUgZXh0ZW5zaW9uIChiYXNpYyB2YWxpZGF0aW9uKVxuICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IGFsbG93ZWRFeHRlbnNpb25zID0gWycucG5nJywgJy5qcGcnLCAnLmpwZWcnLCAnLmJtcCcsICcuZ2lmJywgJy50aWZmJywgJy53ZWJwJ107XG4gIFxuICBpZiAoIWFsbG93ZWRFeHRlbnNpb25zLmluY2x1ZGVzKGV4dCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgaW1hZ2UgZm9ybWF0OiAke2V4dH1gIH07XG4gIH1cbiAgXG4gIC8vIENoZWNrIGZpbGUgc2l6ZSAobWF4IDUwTUIpXG4gIGNvbnN0IG1heFNpemUgPSA1MCAqIDEwMjQgKiAxMDI0OyAvLyA1ME1CXG4gIGlmIChzdGF0LnNpemUgPiBtYXhTaXplKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEZpbGUgdG9vIGxhcmdlICgkeyhzdGF0LnNpemUgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCgxKX1NQiksIG1heCBpcyA1ME1CYCB9O1xuICB9XG4gIFxuICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEltYWdlIHByb2Nlc3NpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEV4dHJhY3QgdGV4dCBmcm9tIGltYWdlcyB1c2luZyBUZXNzZXJhY3QuanMgT0NSLlxuICovXG5hc3luYyBmdW5jdGlvbiBpbWFnZVRvVGV4dCh7IGltYWdlUGF0aCwgbGFuZ3VhZ2UgPSAnZW5nJyB9OiBJbWFnZVRvVGV4dFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZVBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICAvLyBMYXp5LWxvYWQgVGVzc2VyYWN0LmpzIHRvIGF2b2lkIGhlYXZ5IGluaXRpYWwgbG9hZFxuICAgIGNvbnN0IFRlc3NlcmFjdCA9IChhd2FpdCBpbXBvcnQoJ3Rlc3NlcmFjdC5qcycpKS5kZWZhdWx0O1xuXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBPQ1Igc3RhcnRpbmcgZm9yICR7aW1hZ2VQYXRofSAobGFuZ3VhZ2U6ICR7bGFuZ3VhZ2V9KWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFRlc3NlcmFjdC5yZWNvZ25pemUoaW1hZ2VQYXRoLCBsYW5ndWFnZSwge1xuICAgICAgbG9nZ2VyOiAobSkgPT4ge1xuICAgICAgICBpZiAobS5zdGF0dXMgPT09ICdyZWNvZ25pemluZyB0ZXh0Jykge1xuICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBcXHJbQUkgVG9vbGJveF0gT0NSIHByb2dyZXNzOiAkeyhtLnByb2dyZXNzICogMTAwKS50b0ZpeGVkKDApfSVgKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKCdcXG5bQUkgVG9vbGJveF0gT0NSIGNvbXBsZXRlJyk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHRleHQ6IHJlc3VsdC5kYXRhLnRleHQudHJpbSgpLFxuICAgICAgICBjb25maWRlbmNlOiByZXN1bHQuZGF0YS5jb25maWRlbmNlLFxuICAgICAgICBsYW5ndWFnZSxcbiAgICAgICAgd29yZHM6IHJlc3VsdC5kYXRhLndvcmRzPy5sZW5ndGggfHwgMCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogRGVzY3JpYmUgaW1hZ2UgY29udGVudCB1c2luZyB2aXNpb24gbW9kZWwgb3IgYmFzaWMgbWV0YWRhdGEuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlc2NyaWJlSW1hZ2UoeyBpbWFnZVBhdGggfTogRGVzY3JpYmVJbWFnZVBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZVBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGltYWdlUGF0aCk7XG4gICAgXG4gICAgLy8gUmV0dXJuIG1ldGFkYXRhIHNpbmNlIHdlIGRvbid0IGhhdmUgYSB2aXNpb24gbW9kZWwgaW50ZWdyYXRlZCB5ZXRcbiAgICAvLyBUaGlzIGNhbiBiZSBleHRlbmRlZCB3aXRoIHZpc2lvbiBBUEkgY2FsbHMgaW4gdGhlIGZ1dHVyZVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBwYXRoOiBpbWFnZVBhdGgsXG4gICAgICAgIHNpemU6IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIGZvcm1hdDogcGF0aC5leHRuYW1lKGltYWdlUGF0aCkucmVwbGFjZSgnLicsICcnKS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICBub3RlOiAnVmlzaW9uIG1vZGVsIGRlc2NyaXB0aW9uIHJlcXVpcmVzIGludGVncmF0aW9uIHdpdGggYSB2aXNpb24gQVBJIChlLmcuLCBHUFQtNCBWaXNpb24sIENsYXVkZSBWaXNpb24pLiBUaGlzIHRvb2wgY3VycmVudGx5IHJldHVybnMgbWV0YWRhdGEuJyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogQ2FwdHVyZSBkZXNrdG9wIHNjcmVlbnNob3QgYW5kIHNhdmUgdG8gZmlsZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2NyZWVuc2hvdERlc2t0b3AoeyBcbiAgb3V0cHV0UGF0aCwgXG4gIGZvcm1hdCA9ICdwbmcnLCBcbiAgcXVhbGl0eSA9IDkwIFxufTogU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XG4gICAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICAgIFxuICAgIGxldCBjbWQ6IHN0cmluZztcbiAgICBsZXQgYXJnczogc3RyaW5nW107XG4gICAgbGV0IHRlbXBQYXRoOiBzdHJpbmc7XG5cbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3M6IFVzZSBQb3dlclNoZWxsIHdpdGggQWRkLVR5cGUgZm9yIGhpZ2gtcXVhbGl0eSBzY3JlZW5zaG90c1xuICAgICAgICB0ZW1wUGF0aCA9IG91dHB1dFBhdGggfHwgcGF0aC5qb2luKG9zLnRtcGRpcigpLCBgc2NyZWVuc2hvdF8ke0RhdGUubm93KCl9LnBuZ2ApO1xuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gW1xuICAgICAgICAgICctTm9Qcm9maWxlJyxcbiAgICAgICAgICAnLUNvbW1hbmQnLFxuICAgICAgICAgIGBbU3lzdGVtLkRyYXdpbmcuQml0bWFwXTo6bmV3KDE5MjAsIDEwODApLlNhdmUoJyR7dGVtcFBhdGh9JywgW1N5c3RlbS5EcmF3aW5nLkltYWdpbmcuSW1hZ2VGb3JtYXRdOjpQbmcpYCxcbiAgICAgICAgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUzogVXNlIHNjcmVlbmNhcHR1cmVcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYHNjcmVlbmNhcHR1cmUgLXggXCIke3RlbXBQYXRofVwiYF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXg6IFVzZSB4ZG90b29sICsgaW1wb3J0IChJbWFnZU1hZ2ljaykgb3Igc2Nyb3RcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYChpbXBvcnQgLXdpbmRvdyByb290IFwiJHt0ZW1wUGF0aH1cIiAyPi9kZXYvbnVsbCB8fCBzY3JvdCBcIiR7dGVtcFBhdGh9XCIgMj4vZGV2L251bGwpICYmIGVjaG8gXCJTY3JlZW5zaG90IHNhdmVkIHRvICR7dGVtcFBhdGh9XCJgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgeyBzcGF3biB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICAgIFxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Nsb3NlJywgKGNvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoY29kZSA9PT0gMCAmJiB0ZW1wUGF0aCkge1xuICAgICAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICAgICAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmModGVtcFBhdGgpO1xuICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgcGF0aDogdGVtcFBhdGgsXG4gICAgICAgICAgICAgIHNpemU6IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2NyZWVuc2hvdCBmYWlsZWQgKGV4aXQgY29kZSAke2NvZGV9KTogJHtzdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIFxuICAgICAgLy8gVGltZW91dCBhZnRlciAxMCBzZWNvbmRzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvYy5raWxsKCk7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NjcmVlbnNob3QgdGltZWQgb3V0JykpO1xuICAgICAgfSwgMTAwMDApO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBpbWFnZXMgYW5kIGNhbGN1bGF0ZSBzaW1pbGFyaXR5IHNjb3JlLlxuICovXG5hc3luYyBmdW5jdGlvbiBjb21wYXJlSW1hZ2VzKHsgaW1hZ2UxUGF0aCwgaW1hZ2UyUGF0aCB9OiBDb21wYXJlSW1hZ2VzUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbjEgPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZTFQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24xLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbWFnZSAxOiAke3ZhbGlkYXRpb24xLmVycm9yfWAgfTtcblxuICAgIGNvbnN0IHZhbGlkYXRpb24yID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2UyUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uMi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW1hZ2UgMjogJHt2YWxpZGF0aW9uMi5lcnJvcn1gIH07XG5cbiAgICAvLyBMYXp5LWxvYWQgcGl4ZWxtYXRjaCBmb3IgcGl4ZWwtbGV2ZWwgY29tcGFyaXNvblxuICAgIGNvbnN0IHBpeGVsbWF0Y2ggPSAoYXdhaXQgaW1wb3J0KCdwaXhlbG1hdGNoJykpLmRlZmF1bHQ7XG4gICAgY29uc3QgUE5HID0gKGF3YWl0IGltcG9ydCgncG5nanMnKSkuUE5HO1xuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuICAgIC8vIFJlYWQgYW5kIGRlY29kZSBpbWFnZXNcbiAgICBjb25zdCBpbWcxRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhpbWFnZTFQYXRoKTtcbiAgICBjb25zdCBpbWcyRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhpbWFnZTJQYXRoKTtcblxuICAgIGNvbnN0IGltZzEgPSBQTkcuc3luYy5kZWNvZGUoaW1nMURhdGEpO1xuICAgIGNvbnN0IGltZzIgPSBQTkcuc3luYy5kZWNvZGUoaW1nMkRhdGEpO1xuXG4gICAgLy8gUmVzaXplIHRvIHNhbWUgZGltZW5zaW9ucyBmb3IgY29tcGFyaXNvblxuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4oaW1nMS53aWR0aCwgaW1nMi53aWR0aCk7XG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5taW4oaW1nMS5oZWlnaHQsIGltZzIuaGVpZ2h0KTtcblxuICAgIGNvbnN0IGJ1ZjEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBjb25zdCBidWYyID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG5cbiAgICAvLyBFeHRyYWN0IHBpeGVsIGRhdGEgKHNpbXBsaWZpZWQgLSBpbiBwcm9kdWN0aW9uLCB1c2UgcHJvcGVyIGltYWdlIHByb2Nlc3NpbmcpXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgIGNvbnN0IGlkeDEgPSAoeSAqIGltZzEud2lkdGggKyB4KSAqIDQ7XG4gICAgICAgIGNvbnN0IGlkeDIgPSAoeSAqIGltZzIud2lkdGggKyB4KSAqIDQ7XG4gICAgICAgIGNvbnN0IG91dElkeCA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XG5cbiAgICAgICAgYnVmMVtvdXRJZHhdID0gaW1nMS5kYXRhW2lkeDFdO1xuICAgICAgICBidWYxW291dElkeCArIDFdID0gaW1nMS5kYXRhW2lkeDEgKyAxXTtcbiAgICAgICAgYnVmMVtvdXRJZHggKyAyXSA9IGltZzEuZGF0YVtpZHgxICsgMl07XG4gICAgICAgIGJ1ZjFbb3V0SWR4ICsgM10gPSBpbWcxLmRhdGFbaWR4MSArIDNdO1xuXG4gICAgICAgIGJ1ZjJbb3V0SWR4XSA9IGltZzIuZGF0YVtpZHgyXTtcbiAgICAgICAgYnVmMltvdXRJZHggKyAxXSA9IGltZzIuZGF0YVtpZHgyICsgMV07XG4gICAgICAgIGJ1ZjJbb3V0SWR4ICsgMl0gPSBpbWcyLmRhdGFbaWR4MiArIDJdO1xuICAgICAgICBidWYyW291dElkeCArIDNdID0gaW1nMi5kYXRhW2lkeDIgKyAzXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUgcGl4ZWwgZGlmZmVyZW5jZVxuICAgIGNvbnN0IGRpZmYgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBjb25zdCBudW1EaWZmUGl4ZWxzID0gcGl4ZWxtYXRjaChidWYxLCBidWYyLCBkaWZmLCB3aWR0aCwgaGVpZ2h0LCB7IHRocmVzaG9sZDogMC4xIH0pO1xuICAgIFxuICAgIGNvbnN0IHRvdGFsUGl4ZWxzID0gd2lkdGggKiBoZWlnaHQ7XG4gICAgY29uc3Qgc2ltaWxhcml0eSA9ICgodG90YWxQaXhlbHMgLSBudW1EaWZmUGl4ZWxzKSAvIHRvdGFsUGl4ZWxzKSAqIDEwMDtcblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpbWFnZTE6IGltYWdlMVBhdGgsXG4gICAgICAgIGltYWdlMjogaW1hZ2UyUGF0aCxcbiAgICAgICAgZGltZW5zaW9uczogYCR7d2lkdGh9eCR7aGVpZ2h0fWAsXG4gICAgICAgIHNpbWlsYXJpdHlQZXJjZW50OiBzaW1pbGFyaXR5LnRvRml4ZWQoMiksXG4gICAgICAgIGRpZmZlcmVudFBpeGVsczogbnVtRGlmZlBpeGVscyxcbiAgICAgICAgdG90YWxQaXhlbHMsXG4gICAgICAgIGlzSWRlbnRpY2FsOiBudW1EaWZmUGl4ZWxzID09PSAwLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySW1hZ2VQcm9jZXNzaW5nVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGltYWdlX3RvX3RleHQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdpbWFnZV90b190ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4dHJhY3QgdGV4dCBmcm9tIGltYWdlcyB1c2luZyBPQ1IgKFRlc3NlcmFjdC5qcykuIFN1cHBvcnRzIG11bHRpcGxlIGxhbmd1YWdlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGltYWdlUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgaW1hZ2UgZmlsZScpLFxuICAgICAgbGFuZ3VhZ2U6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdlbmcnKS5kZXNjcmliZSgnTGFuZ3VhZ2UgY29kZSBmb3IgT0NSIChlLmcuLCBcImVuZ1wiLCBcImRldVwiLCBcImNoaV9zaW1cIiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBpbWFnZVRvVGV4dChwYXJhbXMgYXMgSW1hZ2VUb1RleHRQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gZGVzY3JpYmVfaW1hZ2UgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZXNjcmliZV9pbWFnZScsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgbWV0YWRhdGEgYW5kIGJhc2ljIGRlc2NyaXB0aW9uIG9mIGFuIGltYWdlIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpbWFnZVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIGltYWdlIGZpbGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBkZXNjcmliZUltYWdlKHBhcmFtcyBhcyBEZXNjcmliZUltYWdlUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIHNjcmVlbnNob3RfZGVza3RvcCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NjcmVlbnNob3RfZGVza3RvcCcsXG4gICAgZGVzY3JpcHRpb246ICdDYXB0dXJlIGEgc2NyZWVuc2hvdCBvZiB0aGUgZGVza3RvcCBhbmQgc2F2ZSBpdCB0byBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBvdXRwdXRQYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ091dHB1dCBwYXRoIGZvciB0aGUgc2NyZWVuc2hvdCAoZGVmYXVsdDogdGVtcCBkaXJlY3RvcnkpJyksXG4gICAgICBmb3JtYXQ6IHouZW51bShbJ3BuZycsICdqcGVnJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgncG5nJykuZGVzY3JpYmUoJ0ltYWdlIGZvcm1hdCcpLFxuICAgICAgcXVhbGl0eTogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDkwKS5kZXNjcmliZSgnSlBFRyBxdWFsaXR5ICgxLTEwMCwgb25seSBhcHBsaWVzIHRvIEpQRUcgZm9ybWF0KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHNjcmVlbnNob3REZXNrdG9wKHBhcmFtcyBhcyBTY3JlZW5zaG90RGVza3RvcFBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBjb21wYXJlX2ltYWdlcyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvbXBhcmVfaW1hZ2VzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvbXBhcmUgdHdvIGltYWdlcyBhbmQgY2FsY3VsYXRlIHBpeGVsLWxldmVsIHNpbWlsYXJpdHkgc2NvcmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpbWFnZTFQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBmaXJzdCBpbWFnZScpLFxuICAgICAgaW1hZ2UyUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgc2Vjb25kIGltYWdlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gY29tcGFyZUltYWdlcyhwYXJhbXMgYXMgQ29tcGFyZUltYWdlc1BhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIEh0dHBSZXF1ZXN0UGFyYW1zIHtcbiAgbWV0aG9kOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgYm9keT86IHN0cmluZyB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5pbnRlcmZhY2UgSHR0cEdldEpzb25QYXJhbXMge1xuICB1cmw6IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmludGVyZmFjZSBIdHRwUG9zdEpzb25QYXJhbXMge1xuICB1cmw6IHN0cmluZztcbiAgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTZWN1cml0eSAmIFZhbGlkYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFNTUkYgcHJvdGVjdGlvbiAtIHZhbGlkYXRlIFVSTCBpcyBzYWZlICovXG5mdW5jdGlvbiB2YWxpZGF0ZVVybCh1cmw6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcbiAgICBcbiAgICAvLyBCbG9jayBpbnRlcm5hbC9wcml2YXRlIElQIGFkZHJlc3NlcyAoU1NSRiBwcm90ZWN0aW9uKVxuICAgIGlmIChwYXJzZWQucHJvdG9jb2wgPT09ICdmaWxlOicgfHwgcGFyc2VkLnByb3RvY29sID09PSAnZGF0YTonKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUHJvdG9jb2wgXCIke3BhcnNlZC5wcm90b2NvbH1cIiBpcyBub3QgYWxsb3dlZGAgfTtcbiAgICB9XG5cbiAgICAvLyBBbGxvdyBodHRwIGFuZCBodHRwcyBvbmx5XG4gICAgaWYgKCFbJ2h0dHA6JywgJ2h0dHBzOiddLmluY2x1ZGVzKHBhcnNlZC5wcm90b2NvbCkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBPbmx5IEhUVFAvSFRUUFMgcHJvdG9jb2xzIGFyZSBhbGxvd2VkYCB9O1xuICAgIH1cblxuICAgIC8vIEJsb2NrIHByaXZhdGUgSVAgcmFuZ2VzIChiYXNpYyBjaGVjaylcbiAgICBjb25zdCBob3N0bmFtZSA9IHBhcnNlZC5ob3N0bmFtZTtcbiAgICBjb25zdCBibG9ja2VkUGF0dGVybnMgPSBbXG4gICAgICAvXjEyN1xcLi8sICAgICAgICAgICAvLyBsb2NhbGhvc3RcbiAgICAgIC9eMTBcXC4vLCAgICAgICAgICAgIC8vIDEwLjAuMC4wLzhcbiAgICAgIC9eMTcyXFwuMVs2LTldXFwuLywgICAvLyAxNzIuMTYuMC4wLzEyXG4gICAgICAvXjE3MlxcLjJbMC05XVxcLi8sICAgLy8gMTcyLjE2LjAuMC8xMlxuICAgICAgL14xNzJcXC4zWzAtMV1cXC4vLCAgIC8vIDE3Mi4xNi4wLjAvMTJcbiAgICAgIC9eMTkyXFwuMTY4XFwuLywgICAgICAvLyAxOTIuMTY4LjAuMC8xNlxuICAgICAgL14wXFwuMFxcLjBcXC4wJC8sICAgICAvLyAwLjAuMC4wXG4gICAgICAvXmxvY2FsaG9zdCQvLCAgICAgIC8vIGxvY2FsaG9zdCBob3N0bmFtZVxuICAgIF07XG5cbiAgICBpZiAoYmxvY2tlZFBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLnRlc3QoaG9zdG5hbWUpKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEFjY2VzcyB0byAke2hvc3RuYW1lfSBpcyBibG9ja2VkIGZvciBzZWN1cml0eSByZWFzb25zYCB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgSW52YWxpZCBVUkw6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBIVFRQIHJlcXVlc3QgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEdlbmVyaWMgSFRUUCBjbGllbnQgZm9yIG1ha2luZyByZXF1ZXN0cyB0byBhbnkgUkVTVCBBUEkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBSZXF1ZXN0KHsgbWV0aG9kLCB1cmwsIGhlYWRlcnMgPSB7fSwgYm9keSB9OiBIdHRwUmVxdWVzdFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIC8vIFByZXBhcmUgcmVxdWVzdCBvcHRpb25zXG4gICAgY29uc3Qgb3B0aW9uczogUmVxdWVzdEluaXQgPSB7XG4gICAgICBtZXRob2Q6IG1ldGhvZC50b1VwcGVyQ2FzZSgpLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnVXNlci1BZ2VudCc6ICdBSS1Ub29sYm94LzEuMCcsXG4gICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYm9keSBmb3Igbm9uLUdFVC9IRUFEIHJlcXVlc3RzXG4gICAgaWYgKGJvZHkgJiYgIVsnR0VUJywgJ0hFQUQnXS5pbmNsdWRlcyhtZXRob2QudG9VcHBlckNhc2UoKSkpIHtcbiAgICAgIG9wdGlvbnMuYm9keSA9IHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJyA/IGJvZHkgOiBKU09OLnN0cmluZ2lmeShib2R5KTtcbiAgICAgIFxuICAgICAgLy8gU2V0IGNvbnRlbnQtdHlwZSBoZWFkZXIgaWYgbm90IGFscmVhZHkgc2V0IGFuZCBib2R5IGlzIG9iamVjdC9zdHJpbmdcbiAgICAgIGlmICghaGVhZGVyc1snQ29udGVudC1UeXBlJ10gJiYgdHlwZW9mIGJvZHkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIChvcHRpb25zLmhlYWRlcnMgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPilbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCAke21ldGhvZC50b1VwcGVyQ2FzZSgpfSAke3VybH1gKTtcblxuICAgIC8vIE1ha2UgdGhlIHJlcXVlc3Qgd2l0aCB0aW1lb3V0XG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApOyAvLyAzMHMgdGltZW91dFxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IC4uLm9wdGlvbnMsIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwgfSk7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgLy8gUGFyc2UgcmVzcG9uc2UgYmFzZWQgb24gY29udGVudCB0eXBlXG4gICAgICBsZXQgcmVzcG9uc2VEYXRhOiB1bmtub3duO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgICBcbiAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiByZXNwb25zZURhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICAgIG1ldGhvZDogbWV0aG9kLnRvVXBwZXJDYXNlKCksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIEdFVCByZXF1ZXN0IHJldHVybmluZyBwYXJzZWQgSlNPTi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaHR0cEdldEpzb24oeyB1cmwsIGhlYWRlcnMgPSB7fSB9OiBIdHRwR2V0SnNvblBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCBHRVQgJHt1cmx9YCk7XG5cbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogJ0FJLVRvb2xib3gvMS4wJyxcbiAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgICB9LFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWAsXG4gICAgICAgICAgZGF0YTogeyBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cywgdXJsIH0sXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVzcG9uc2UuaGVhZGVycy5lbnRyaWVzKCkpLFxuICAgICAgICAgIGJvZHk6IGRhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBQT1NUIHJlcXVlc3Qgd2l0aCBKU09OIGJvZHkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBQb3N0SnNvbih7IHVybCwgZGF0YSwgaGVhZGVycyA9IHt9IH06IEh0dHBQb3N0SnNvblBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCBQT1NUICR7dXJsfWApO1xuXG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1VzZXItQWdlbnQnOiAnQUktVG9vbGJveC8xLjAnLFxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIGxldCByZXNwb25zZURhdGE6IHVua25vd247XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJztcbiAgICAgIFxuICAgICAgaWYgKGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiByZXNwb25zZURhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySHR0cENsaWVudFRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBodHRwX3JlcXVlc3QgdG9vbCAtIEdlbmVyaWMgSFRUUCBjbGllbnRcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaHR0cF9yZXF1ZXN0JyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgZ2VuZXJpYyBIVFRQIHJlcXVlc3RzIHRvIGFueSBSRVNUIEFQSS4gU3VwcG9ydHMgR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0ggYW5kIG90aGVyIG1ldGhvZHMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBtZXRob2Q6IHouZW51bShbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnUEFUQ0gnLCAnSEVBRCcsICdPUFRJT05TJ10pLmRlc2NyaWJlKCdIVFRQIG1ldGhvZCcpLFxuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdSZXF1ZXN0IFVSTCAobXVzdCBiZSBodHRwOi8vIG9yIGh0dHBzOi8vKScpLFxuICAgICAgaGVhZGVyczogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ3VzdG9tIGhlYWRlcnMgYXMga2V5LXZhbHVlIHBhaXJzJyksXG4gICAgICBib2R5OiB6LnVuaW9uKFt6LnN0cmluZygpLCB6LnJlY29yZCh6LnVua25vd24oKSldKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdSZXF1ZXN0IGJvZHkgKHN0cmluZyBvciBKU09OIG9iamVjdCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwUmVxdWVzdChwYXJhbXMgYXMgSHR0cFJlcXVlc3RQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gaHR0cF9nZXRfanNvbiB0b29sIC0gQ29udmVuaWVuY2Ugd3JhcHBlciBmb3IgR0VUIHJlcXVlc3RzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfZ2V0X2pzb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBhIEdFVCByZXF1ZXN0IGFuZCByZXR1cm4gcGFyc2VkIEpTT04gcmVzcG9uc2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgVVJMIChtdXN0IGJlIGh0dHA6Ly8gb3IgaHR0cHM6Ly8pJyksXG4gICAgICBoZWFkZXJzOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDdXN0b20gaGVhZGVycyBhcyBrZXktdmFsdWUgcGFpcnMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwR2V0SnNvbihwYXJhbXMgYXMgSHR0cEdldEpzb25QYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gaHR0cF9wb3N0X2pzb24gdG9vbCAtIENvbnZlbmllbmNlIHdyYXBwZXIgZm9yIFBPU1QgcmVxdWVzdHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaHR0cF9wb3N0X2pzb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBhIFBPU1QgcmVxdWVzdCB3aXRoIEpTT04gYm9keSBhbmQgcmV0dXJuIHBhcnNlZCByZXNwb25zZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnUmVxdWVzdCBVUkwgKG11c3QgYmUgaHR0cDovLyBvciBodHRwczovLyknKSxcbiAgICAgIGRhdGE6IHoucmVjb3JkKHoudW5rbm93bigpKS5kZXNjcmliZSgnSlNPTiBvYmplY3QgdG8gc2VuZCBhcyByZXF1ZXN0IGJvZHknKSxcbiAgICAgIGhlYWRlcnM6IHoucmVjb3JkKHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0N1c3RvbSBoZWFkZXJzIGFzIGtleS12YWx1ZSBwYWlycycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGh0dHBQb3N0SnNvbihwYXJhbXMgYXMgSHR0cFBvc3RKc29uUGFyYW1zKSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJhZ0luZGV4RmlsZXNQYXJhbXMge1xuICBkaXJlY3RvcnlQYXRoOiBzdHJpbmc7XG4gIGZpbGVQYXR0ZXJuPzogc3RyaW5nO1xuICBiYXRjaFNpemU/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBSYWdRdWVyeVZlY3RvclBhcmFtcyB7XG4gIHF1ZXJ5OiBzdHJpbmc7XG4gIHRvcEs/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBSYWdDbGVhckluZGV4UGFyYW1zIHtcbiAgY29uZmlybTogYm9vbGVhbjtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIERvY3VtZW50Q2h1bmsge1xuICBpZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIG1ldGFkYXRhOiB7XG4gICAgZmlsZV9wYXRoOiBzdHJpbmc7XG4gICAgZmlsZV9uYW1lOiBzdHJpbmc7XG4gICAgY2h1bmtfaW5kZXg6IG51bWJlcjtcbiAgICB0b3RhbF9jaHVua3M6IG51bWJlcjtcbiAgICB3b3JkX2NvdW50OiBudW1iZXI7XG4gIH07XG59XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHQge1xuICBpZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHNjb3JlOiBudW1iZXI7XG4gIG1ldGFkYXRhOiBEb2N1bWVudENodW5rWydtZXRhZGF0YSddO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBWZWN0b3IgU3RvcmUgSW1wbGVtZW50YXRpb24gKExvY2FsKSA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogU2ltcGxlIGxvY2FsIHZlY3RvciBzdG9yZSB1c2luZyBpbi1tZW1vcnkgc3RvcmFnZSB3aXRoIGNvc2luZSBzaW1pbGFyaXR5ICovXG5jbGFzcyBMb2NhbFZlY3RvclN0b3JlIHtcbiAgcHJpdmF0ZSBkb2N1bWVudHM6IE1hcDxzdHJpbmcsIHsgZW1iZWRkaW5nOiBGbG9hdDMyQXJyYXk7IGNodW5rOiBEb2N1bWVudENodW5rIH0+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIGluZGV4TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4TmFtZTogc3RyaW5nID0gJ2FpX3Rvb2xib3hfcmFnJykge1xuICAgIHRoaXMuaW5kZXhOYW1lID0gaW5kZXhOYW1lO1xuICB9XG5cbiAgLyoqIEFkZCBkb2N1bWVudHMgdG8gdGhlIHN0b3JlICovXG4gIGFkZChkb2N1bWVudHM6IERvY3VtZW50Q2h1bmtbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3VtZW50cykge1xuICAgICAgdGhpcy5kb2N1bWVudHMuc2V0KGRvYy5pZCwgeyBlbWJlZGRpbmc6IG5ldyBGbG9hdDMyQXJyYXkoMCksIGNodW5rOiBkb2MgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCBlbWJlZGRpbmdzIGZvciBhbGwgZG9jdW1lbnRzICovXG4gIHNldEVtYmVkZGluZ3MoaWRzOiBzdHJpbmdbXSwgZW1iZWRkaW5nczogRmxvYXQzMkFycmF5W10pOiB2b2lkIHtcbiAgICBpZHMuZm9yRWFjaCgoaWQsIGkpID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKTtcbiAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICBlbnRyeS5lbWJlZGRpbmcgPSBlbWJlZGRpbmdzW2ldO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFNlYXJjaCBmb3Igc2ltaWxhciBkb2N1bWVudHMgKi9cbiAgc2VhcmNoKHF1ZXJ5RW1iZWRkaW5nOiBGbG9hdDMyQXJyYXksIHRvcEs6IG51bWJlcik6IFNlYXJjaFJlc3VsdFtdIHtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGlkOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgW2lkLCBlbnRyeV0gb2YgdGhpcy5kb2N1bWVudHMuZW50cmllcygpKSB7XG4gICAgICBpZiAoZW50cnkuZW1iZWRkaW5nLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICBcbiAgICAgIC8vIENvc2luZSBzaW1pbGFyaXR5XG4gICAgICBsZXQgZG90UHJvZHVjdCA9IDA7XG4gICAgICBsZXQgbm9ybUEgPSAwO1xuICAgICAgbGV0IG5vcm1CID0gMDtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyeS5lbWJlZGRpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZG90UHJvZHVjdCArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIGVudHJ5LmVtYmVkZGluZ1tpXTtcbiAgICAgICAgbm9ybUEgKz0gZW50cnkuZW1iZWRkaW5nW2ldICogZW50cnkuZW1iZWRkaW5nW2ldO1xuICAgICAgICBub3JtQiArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIHF1ZXJ5RW1iZWRkaW5nW2ldO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzaW1pbGFyaXR5ID0gbm9ybUEgPiAwICYmIG5vcm1CID4gMCA/IGRvdFByb2R1Y3QgLyAoTWF0aC5zcXJ0KG5vcm1BKSAqIE1hdGguc3FydChub3JtQikpIDogMDtcbiAgICAgIFxuICAgICAgcmVzdWx0cy5wdXNoKHsgaWQsIHNjb3JlOiBzaW1pbGFyaXR5IH0pO1xuICAgIH1cblxuICAgIC8vIFNvcnQgYnkgc2ltaWxhcml0eSBkZXNjZW5kaW5nIGFuZCByZXR1cm4gdG9wIEtcbiAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKVxuICAgICAgLnNsaWNlKDAsIHRvcEspXG4gICAgICAubWFwKCh7IGlkLCBzY29yZSB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKSE7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGVudHJ5LmNodW5rLmlkLFxuICAgICAgICAgIHRleHQ6IGVudHJ5LmNodW5rLnRleHQsXG4gICAgICAgICAgc2NvcmUsXG4gICAgICAgICAgbWV0YWRhdGE6IGVudHJ5LmNodW5rLm1ldGFkYXRhLFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH1cblxuICAvKiogQ2xlYXIgYWxsIGRvY3VtZW50cyAqL1xuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmRvY3VtZW50cy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIEdldCBkb2N1bWVudCBjb3VudCAqL1xuICBnZXQgY291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuc2l6ZTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUZXh0IENodW5raW5nID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTcGxpdCB0ZXh0IGludG8gY2h1bmtzIHdpdGggb3ZlcmxhcCAqL1xuZnVuY3Rpb24gY2h1bmtUZXh0KHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSA1MDAsIG92ZXJsYXA6IG51bWJlciA9IDUwKTogRG9jdW1lbnRDaHVua1tdIHtcbiAgY29uc3Qgd29yZHMgPSB0ZXh0LnNwbGl0KC9cXHMrLyk7XG4gIGNvbnN0IGNodW5rczogRG9jdW1lbnRDaHVua1tdID0gW107XG4gIFxuICBpZiAod29yZHMubGVuZ3RoIDw9IGNodW5rU2l6ZSkge1xuICAgIHJldHVybiBbe1xuICAgICAgaWQ6IGBjaHVua18ke0RhdGUubm93KCl9XzBgLFxuICAgICAgdGV4dDogdGV4dCxcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogJycsXG4gICAgICAgIGZpbGVfbmFtZTogJycsXG4gICAgICAgIGNodW5rX2luZGV4OiAwLFxuICAgICAgICB0b3RhbF9jaHVua3M6IDEsXG4gICAgICAgIHdvcmRfY291bnQ6IHdvcmRzLmxlbmd0aCxcbiAgICAgIH0sXG4gICAgfV07XG4gIH1cblxuICBsZXQgc3RhcnRJbmRleCA9IDA7XG4gIGxldCBjaHVua0luZGV4ID0gMDtcblxuICB3aGlsZSAoc3RhcnRJbmRleCA8IHdvcmRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGVuZEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCArIGNodW5rU2l6ZSwgd29yZHMubGVuZ3RoKTtcbiAgICBjb25zdCBjaHVua1RleHQgPSB3b3Jkcy5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCkuam9pbignICcpO1xuICAgIFxuICAgIGNodW5rcy5wdXNoKHtcbiAgICAgIGlkOiBgY2h1bmtfJHtEYXRlLm5vdygpfV8ke2NodW5rSW5kZXh9YCxcbiAgICAgIHRleHQ6IGNodW5rVGV4dCxcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogJycsIC8vIFdpbGwgYmUgc2V0IGxhdGVyXG4gICAgICAgIGZpbGVfbmFtZTogJycsIC8vIFdpbGwgYmUgc2V0IGxhdGVyXG4gICAgICAgIGNodW5rX2luZGV4OiBjaHVua0luZGV4LFxuICAgICAgICB0b3RhbF9jaHVua3M6IE1hdGguY2VpbCh3b3Jkcy5sZW5ndGggLyAoY2h1bmtTaXplIC0gb3ZlcmxhcCkpLFxuICAgICAgICB3b3JkX2NvdW50OiBlbmRJbmRleCAtIHN0YXJ0SW5kZXgsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY2h1bmtJbmRleCsrO1xuICAgIHN0YXJ0SW5kZXggPSBlbmRJbmRleCAtIG92ZXJsYXA7XG4gIH1cblxuICByZXR1cm4gY2h1bmtzO1xufVxuXG4vKiogR2VuZXJhdGUgc2ltcGxlIFRGLUlERi1saWtlIGVtYmVkZGluZ3MgZm9yIHRleHQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRW1iZWRkaW5nKHRleHQ6IHN0cmluZyk6IEZsb2F0MzJBcnJheSB7XG4gIC8vIFNpbXBsZSB3b3JkIGZyZXF1ZW5jeS1iYXNlZCBlbWJlZGRpbmcgKGRpbWVuc2lvbjogMTAwKVxuICBjb25zdCBkaW1lbnNpb25zID0gMTAwO1xuICBjb25zdCBlbWJlZGRpbmcgPSBuZXcgRmxvYXQzMkFycmF5KGRpbWVuc2lvbnMpO1xuICBcbiAgLy8gVG9rZW5pemUgYW5kIGhhc2ggd29yZHMgdG8gZGltZW5zaW9uc1xuICBjb25zdCB3b3JkcyA9IHRleHQudG9Mb3dlckNhc2UoKS5tYXRjaCgvW2Etel0rL2cpIHx8IFtdO1xuICBjb25zdCB3b3JkU2V0ID0gbmV3IFNldCh3b3Jkcyk7XG4gIFxuICBmb3IgKGNvbnN0IHdvcmQgb2Ygd29yZFNldCkge1xuICAgIGxldCBoYXNoID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIHdvcmQuY2hhckNvZGVBdChpKTtcbiAgICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGRpbUluZGV4ID0gTWF0aC5hYnMoaGFzaCAlIGRpbWVuc2lvbnMpO1xuICAgIGVtYmVkZGluZ1tkaW1JbmRleF0gKz0gMS4wIC8gKHdvcmQubGVuZ3RoICsgMSk7IC8vIFdlaWdodCBieSBpbnZlcnNlIGxlbmd0aFxuICB9XG5cbiAgLy8gTm9ybWFsaXplXG4gIGxldCBub3JtID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1lbnNpb25zOyBpKyspIHtcbiAgICBub3JtICs9IGVtYmVkZGluZ1tpXSAqIGVtYmVkZGluZ1tpXTtcbiAgfVxuICBub3JtID0gTWF0aC5zcXJ0KG5vcm0pIHx8IDE7XG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbWVuc2lvbnM7IGkrKykge1xuICAgIGVtYmVkZGluZ1tpXSAvPSBub3JtO1xuICB9XG5cbiAgcmV0dXJuIGVtYmVkZGluZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBJbmRleCBmaWxlcyBpbiBhIGRpcmVjdG9yeSBmb3Igc2VtYW50aWMgc2VhcmNoLlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdJbmRleEZpbGVzKHsgXG4gIGRpcmVjdG9yeVBhdGgsIFxuICBmaWxlUGF0dGVybiA9ICcqLnt0cyxqcyx0c3gsanN4LG1kLGpzb24seWFtbCx5bWwsdG9tbCx0eHR9JyxcbiAgYmF0Y2hTaXplID0gMTAgXG59OiBSYWdJbmRleEZpbGVzUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgZGlyZWN0b3J5IGV4aXN0c1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnlQYXRoKSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGlyZWN0b3J5IG5vdCBmb3VuZDogJHtkaXJlY3RvcnlQYXRofWAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBzdG9yZSA9IG5ldyBMb2NhbFZlY3RvclN0b3JlKCk7XG4gICAgbGV0IGluZGV4ZWRDb3VudCA9IDA7XG4gICAgbGV0IHNraXBwZWRDb3VudCA9IDA7XG5cbiAgICAvLyBGaW5kIGZpbGVzIG1hdGNoaW5nIHBhdHRlcm5cbiAgICBjb25zdCBmaW5kRmlsZXMgPSAoZGlyOiBzdHJpbmcpOiBzdHJpbmdbXSA9PiB7XG4gICAgICBsZXQgcmVzdWx0czogc3RyaW5nW10gPSBbXTtcbiAgICAgIFxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGRpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgLy8gU2tpcCBub2RlX21vZHVsZXMgYW5kIC5naXQgZGlyZWN0b3JpZXNcbiAgICAgICAgICAgIGlmIChlbnRyeS5uYW1lID09PSAnbm9kZV9tb2R1bGVzJyB8fCBlbnRyeS5uYW1lID09PSAnLmdpdCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KGZpbmRGaWxlcyhmdWxsUGF0aCkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZpbGUgZXh0ZW5zaW9uIGFnYWluc3QgcGF0dGVyblxuICAgICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBjb25zdCBhbGxvd2VkRXh0cyA9IFsnLnRzJywgJy5qcycsICcudHN4JywgJy5qc3gnLCAnLm1kJywgJy5qc29uJywgJy55YW1sJywgJy55bWwnLCAnLnRvbWwnLCAnLnR4dCddO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoYWxsb3dlZEV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbQUkgVG9vbGJveF0gQ291bGQgbm90IHJlYWQgZGlyZWN0b3J5ICR7ZGlyfTpgLCBlcnJvcik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBjb25zdCBmaWxlcyA9IGZpbmRGaWxlcyhkaXJlY3RvcnlQYXRoKTtcbiAgICBcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGluZGV4ZWRDb3VudDogMCwgbWVzc2FnZTogJ05vIG1hdGNoaW5nIGZpbGVzIGZvdW5kJyB9IH07XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBlYWNoIGZpbGVcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNraXAgbGFyZ2UgZmlsZXMgKD4xTUIpXG4gICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCA+IDEwMjQgKiAxMDI0KSB7XG4gICAgICAgICAgc2tpcHBlZENvdW50Kys7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaHVuayB0aGUgdGV4dFxuICAgICAgICBjb25zdCBjaHVua3MgPSBjaHVua1RleHQoY29udGVudCk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgbWV0YWRhdGEgZm9yIGVhY2ggY2h1bmtcbiAgICAgICAgY2h1bmtzLmZvckVhY2goY2h1bmsgPT4ge1xuICAgICAgICAgIGNodW5rLm1ldGFkYXRhLmZpbGVfcGF0aCA9IGZpbGVQYXRoO1xuICAgICAgICAgIGNodW5rLm1ldGFkYXRhLmZpbGVfbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmdzIGFuZCBhZGQgdG8gc3RvcmVcbiAgICAgICAgY29uc3QgaWRzID0gY2h1bmtzLm1hcChjID0+IGMuaWQpO1xuICAgICAgICBjb25zdCBlbWJlZGRpbmdzID0gY2h1bmtzLm1hcChjID0+IGdlbmVyYXRlRW1iZWRkaW5nKGMudGV4dCkpO1xuICAgICAgICBcbiAgICAgICAgc3RvcmUuYWRkKGNodW5rcyk7XG4gICAgICAgIHN0b3JlLnNldEVtYmVkZGluZ3MoaWRzLCBlbWJlZGRpbmdzKTtcbiAgICAgICAgXG4gICAgICAgIGluZGV4ZWRDb3VudCArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbQUkgVG9vbGJveF0gQ291bGQgbm90IGluZGV4ICR7ZmlsZVBhdGh9OmAsIGVycm9yKTtcbiAgICAgICAgc2tpcHBlZENvdW50Kys7XG4gICAgICB9XG5cbiAgICAgIC8vIFByb2dyZXNzIGNhbGxiYWNrIGV2ZXJ5IGJhdGNoXG4gICAgICBpZiAoKGluZGV4ZWRDb3VudCArIHNraXBwZWRDb3VudCkgJSBiYXRjaFNpemUgPT09IDApIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYFxccltBSSBUb29sYm94XSBJbmRleGVkICR7KGluZGV4ZWRDb3VudCArIHNraXBwZWRDb3VudCl9IGNodW5rcy4uLmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdcXG5bQUkgVG9vbGJveF0gSW5kZXhpbmcgY29tcGxldGUnKTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpbmRleGVkQ2h1bmtzOiBpbmRleGVkQ291bnQsXG4gICAgICAgIGZpbGVzUHJvY2Vzc2VkOiBmaWxlcy5sZW5ndGgsXG4gICAgICAgIHNraXBwZWRGaWxlczogc2tpcHBlZENvdW50LFxuICAgICAgICB0b3RhbERvY3VtZW50czogc3RvcmUuY291bnQsXG4gICAgICAgIGRpcmVjdG9yeVBhdGgsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgaW5kZXhpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8qKlxuICogUXVlcnkgdGhlIHZlY3RvciBpbmRleCBmb3Igc2VtYW50aWNhbGx5IHNpbWlsYXIgZG9jdW1lbnRzLlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdRdWVyeVZlY3Rvcih7IHF1ZXJ5LCB0b3BLID0gNSB9OiBSYWdRdWVyeVZlY3RvclBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIEdlbmVyYXRlIGVtYmVkZGluZyBmb3IgdGhlIHF1ZXJ5XG4gICAgY29uc3QgcXVlcnlFbWJlZGRpbmcgPSBnZW5lcmF0ZUVtYmVkZGluZyhxdWVyeSk7XG4gICAgXG4gICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIHVzZSBDaHJvbWFEQiBvciBzaW1pbGFyXG4gICAgLy8gRm9yIG5vdywgd2UgcmV0dXJuIGEgcGxhY2Vob2xkZXIgcmVzcG9uc2VcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcXVlcnksXG4gICAgICAgIHRvcEssXG4gICAgICAgIHJlc3VsdHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3BsYWNlaG9sZGVyJyxcbiAgICAgICAgICAgIHRleHQ6ICdWZWN0b3Igc2VhcmNoIHJlcXVpcmVzIENocm9tYURCIGludGVncmF0aW9uLiBUaGlzIGlzIGEgcGxhY2Vob2xkZXIuJyxcbiAgICAgICAgICAgIHNjb3JlOiAwLFxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgZmlsZV9wYXRoOiAnJyxcbiAgICAgICAgICAgICAgZmlsZV9uYW1lOiAnJyxcbiAgICAgICAgICAgICAgY2h1bmtfaW5kZXg6IDAsXG4gICAgICAgICAgICAgIHRvdGFsX2NodW5rczogMSxcbiAgICAgICAgICAgICAgd29yZF9jb3VudDogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbm90ZTogJ1RvIGVuYWJsZSBmdWxsIHZlY3RvciBzZWFyY2gsIGluc3RhbGwgY2hyb21hZGIgYW5kIHVwZGF0ZSB0aGUgaW1wbGVtZW50YXRpb24uJyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBxdWVyeSBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhciB0aGUgdmVjdG9yIGluZGV4LlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdDbGVhckluZGV4KHsgY29uZmlybSB9OiBSYWdDbGVhckluZGV4UGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGlmICghY29uZmlybSkge1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NvbmZpcm1hdGlvbiByZXF1aXJlZCB0byBjbGVhciBpbmRleCcgfTtcbiAgfVxuXG4gIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBjbGVhciBDaHJvbWFEQlxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgZGF0YTogeyBtZXNzYWdlOiAnVmVjdG9yIGluZGV4IGNsZWFyZWQgc3VjY2Vzc2Z1bGx5JyB9LFxuICB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJSYWdUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcmFnX2luZGV4X2ZpbGVzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX2luZGV4X2ZpbGVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0luZGV4IGZpbGVzIGluIGEgZGlyZWN0b3J5IGZvciBzZW1hbnRpYyBzZWFyY2guIFN1cHBvcnRzIFR5cGVTY3JpcHQsIEphdmFTY3JpcHQsIE1hcmtkb3duLCBKU09OLCBZQU1MLCBhbmQgdGV4dCBmaWxlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0RpcmVjdG9yeSBwYXRoIHRvIGluZGV4JyksXG4gICAgICBmaWxlUGF0dGVybjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJyoue3RzLGpzLHRzeCxqc3gsbWQsanNvbix5YW1sLHltbCx0b21sLHR4dH0nKS5kZXNjcmliZSgnRmlsZSBwYXR0ZXJuIHRvIG1hdGNoIChnbG9iIHN5bnRheCknKSxcbiAgICAgIGJhdGNoU2l6ZTogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnQmF0Y2ggc2l6ZSBmb3IgcHJvZ3Jlc3MgcmVwb3J0aW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmFnSW5kZXhGaWxlcyhwYXJhbXMgYXMgUmFnSW5kZXhGaWxlc1BhcmFtcyksXG4gIH0pKTtcblxuICAvLyByYWdfcXVlcnlfdmVjdG9yIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX3F1ZXJ5X3ZlY3RvcicsXG4gICAgZGVzY3JpcHRpb246ICdRdWVyeSB0aGUgdmVjdG9yIGluZGV4IGZvciBzZW1hbnRpY2FsbHkgc2ltaWxhciBkb2N1bWVudHMuIFJldHVybnMgdG9wLWsgbW9zdCByZWxldmFudCBjaHVua3MuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRleHQnKSxcbiAgICAgIHRvcEs6IHoubnVtYmVyKCkubWluKDEpLm1heCgyMCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdOdW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdRdWVyeVZlY3RvcihwYXJhbXMgYXMgUmFnUXVlcnlWZWN0b3JQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gcmFnX2NsZWFyX2luZGV4IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX2NsZWFyX2luZGV4JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIHRoZSB2ZWN0b3Igc2VhcmNoIGluZGV4LiBSZXF1aXJlcyBjb25maXJtYXRpb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb25maXJtOiB6LmJvb2xlYW4oKS5kZXNjcmliZSgnU2V0IHRvIHRydWUgdG8gY29uZmlybSBjbGVhcmluZyB0aGUgaW5kZXgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdDbGVhckluZGV4KHBhcmFtcyBhcyBSYWdDbGVhckluZGV4UGFyYW1zKSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVUkgQ29tcG9uZW50IFRlbXBsYXRlcyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBidXR0b24gY29tcG9uZW50ICovXG5mdW5jdGlvbiBnZW5lcmF0ZUJ1dHRvbkh0bWwobGFiZWw6IHN0cmluZywgY29sb3I6IHN0cmluZyA9ICcjMDA3YmZmJywgaWQ6IHN0cmluZyA9ICd1aS1idG4nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBcbiAgICA8YnV0dG9uIGlkPVwiJHtpZH1cIiBzdHlsZT1cIlxuICAgICAgcGFkZGluZzogMTJweCAyNHB4O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn07XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnM7XG4gICAgXCI+JHtsYWJlbH08L2J1dHRvbj5cbiAgYDtcbn1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgZm9ybSBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRm9ybUh0bWwoZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH0+LCBzdWJtaXRMYWJlbDogc3RyaW5nID0gJ1N1Ym1pdCcpOiBzdHJpbmcge1xuICBjb25zdCBmaWVsZHNIdG1sID0gZmllbGRzLm1hcChmaWVsZCA9PiBgXG4gICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDE1cHg7XCI+XG4gICAgICA8bGFiZWwgZm9yPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7IG1hcmdpbi1ib3R0b206IDVweDsgZm9udC13ZWlnaHQ6IGJvbGQ7XCI+JHtmaWVsZC5sYWJlbH08L2xhYmVsPlxuICAgICAgJHtmaWVsZC50eXBlID09PSAndGV4dGFyZWEnIFxuICAgICAgICA/IGA8dGV4dGFyZWEgaWQ9XCIke2ZpZWxkLm5hbWV9XCIgbmFtZT1cIiR7ZmllbGQubmFtZX1cIiByb3dzPVwiNFwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvdGV4dGFyZWE+YFxuICAgICAgICA6IGZpZWxkLnR5cGUgPT09ICdzZWxlY3QnXG4gICAgICAgICAgPyBgPHNlbGVjdCBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjxvcHRpb24gdmFsdWU9XCJcIj5TZWxlY3QuLi48L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiMVwiPk9wdGlvbiAxPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIjJcIj5PcHRpb24gMjwvb3B0aW9uPjwvc2VsZWN0PmBcbiAgICAgICAgICA6IGA8aW5wdXQgdHlwZT1cIiR7ZmllbGQudHlwZX1cIiBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiIC8+YFxuICAgICAgfVxuICAgIDwvZGl2PlxuICBgKS5qb2luKCcnKTtcblxuICByZXR1cm4gYFxuICAgIDxmb3JtIGlkPVwidWktZm9ybVwiIG9uc3VibWl0PVwiZXZlbnQucHJldmVudERlZmF1bHQoKTsgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tcmVzdWx0JykuaW5uZXJIVE1MID0gJ0Zvcm0gc3VibWl0dGVkISc7XCI+XG4gICAgICAke2ZpZWxkc0h0bWx9XG4gICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBzdHlsZT1cInBhZGRpbmc6IDEycHggMjRweDsgYmFja2dyb3VuZC1jb2xvcjogIzAwN2JmZjsgY29sb3I6IHdoaXRlOyBib3JkZXI6IG5vbmU7IGJvcmRlci1yYWRpdXM6IDZweDsgY3Vyc29yOiBwb2ludGVyO1wiPiR7c3VibWl0TGFiZWx9PC9idXR0b24+XG4gICAgPC9mb3JtPlxuICAgIDxkaXYgaWQ9XCJmb3JtLXJlc3VsdFwiIHN0eWxlPVwibWFyZ2luLXRvcDogMTVweDsgcGFkZGluZzogMTBweDsgYmFja2dyb3VuZC1jb2xvcjogI2Y4ZjlmYTsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvZGl2PlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBjaGFydCBjb21wb25lbnQgKHNpbXBsZSBiYXIgY2hhcnQpICovXG5mdW5jdGlvbiBnZW5lcmF0ZUNoYXJ0SHRtbChkYXRhOiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfT4sIHRpdGxlOiBzdHJpbmcgPSAnQmFyIENoYXJ0Jyk6IHN0cmluZyB7XG4gIGNvbnN0IG1heFZhbHVlID0gTWF0aC5tYXgoLi4uZGF0YS5tYXAoZCA9PiBkLnZhbHVlKSk7XG4gIGNvbnN0IGJhcnNIdG1sID0gZGF0YS5tYXAoZCA9PiB7XG4gICAgY29uc3QgaGVpZ2h0ID0gKGQudmFsdWUgLyBtYXhWYWx1ZSkgKiAyMDA7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBtYXJnaW4tcmlnaHQ6IDEwcHg7XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogNDBweDsgaGVpZ2h0OiAke2hlaWdodH1weDsgYmFja2dyb3VuZC1jb2xvcjogIzAwN2JmZjsgYm9yZGVyLXJhZGl1czogNHB4IDRweCAwIDA7XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9KS5qb2luKCcnKTtcblxuICBjb25zdCBsYWJlbHNIdG1sID0gZGF0YS5tYXAoZCA9PiBgXG4gICAgPGRpdiBzdHlsZT1cIndpZHRoOiA0MHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7IGZvbnQtc2l6ZTogMTJweDtcIj4ke2QubGFiZWx9PC9kaXY+XG4gIGApLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cInBhZGRpbmc6IDIwcHg7IGJhY2tncm91bmQtY29sb3I6ICNmOGY5ZmE7IGJvcmRlci1yYWRpdXM6IDhweDtcIj5cbiAgICAgIDxoMz4ke3RpdGxlfTwvaDM+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtZW5kOyBoZWlnaHQ6IDIyMHB4OyBtYXJnaW4tYm90dG9tOiAxMHB4O1wiPiR7YmFyc0h0bWx9PC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XCI+JHtsYWJlbHNIdG1sfTwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBkYXNoYm9hcmQgY29tcG9uZW50ICovXG5mdW5jdGlvbiBnZW5lcmF0ZURhc2hib2FyZEh0bWwodGl0bGVzOiBzdHJpbmdbXSwgY29udGVudDogQXJyYXk8eyB0eXBlOiAndGV4dCcgfCAnY2hhcnQnOyBkYXRhPzogYW55IH0+KTogc3RyaW5nIHtcbiAgY29uc3QgY2FyZHNIdG1sID0gdGl0bGVzLm1hcCgodGl0bGUsIGluZGV4KSA9PiB7XG4gICAgY29uc3QgY2FyZENvbnRlbnQgPSBjb250ZW50W2luZGV4XT8udHlwZSA9PT0gJ2NoYXJ0JyBcbiAgICAgID8gZ2VuZXJhdGVDaGFydEh0bWwoY29udGVudFtpbmRleF0uZGF0YSB8fCBbeyBsYWJlbDogJ0EnLCB2YWx1ZTogNTAgfSwgeyBsYWJlbDogJ0InLCB2YWx1ZTogODAgfV0sIHRpdGxlKVxuICAgICAgOiBgPHAgc3R5bGU9XCJwYWRkaW5nOiAyMHB4O1wiPiR7Y29udGVudFtpbmRleF0/LmRhdGEgfHwgYENvbnRlbnQgZm9yICR7dGl0bGV9YH08L3A+YDtcbiAgICBcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7IG1pbi13aWR0aDogMjUwcHg7IGJhY2tncm91bmQtY29sb3I6IHdoaXRlOyBib3JkZXItcmFkaXVzOiA4cHg7IGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuMSk7IG1hcmdpbjogMTBweDtcIj5cbiAgICAgICAgJHtjYXJkQ29udGVudH1cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH0pLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtd3JhcDogd3JhcDsgZ2FwOiAyMHB4OyBwYWRkaW5nOiAyMHB4O1wiPiR7Y2FyZHNIdG1sfTwvZGl2PlxuICBgO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJVaUdlbmVyYXRpb25Ub29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gZ2VuZXJhdGVfdWlfY29tcG9uZW50IHRvb2wgXHUyMDE0IEdlbmVyYXRlIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2VuZXJhdGVfdWlfY29tcG9uZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYXRlIEhUTUwvQ1NTL0pTIGNvZGUgZm9yIGFuIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudCAoYnV0dG9uLCBmb3JtLCBjaGFydCwgZGFzaGJvYXJkKS4gUmV0dXJucyB0aGUgZ2VuZXJhdGVkIGNvZGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21wb25lbnRfdHlwZTogei5lbnVtKFsnYnV0dG9uJywgJ2Zvcm0nLCAnY2hhcnQnLCAnZGFzaGJvYXJkJ10pLmRlc2NyaWJlKCdUeXBlIG9mIFVJIGNvbXBvbmVudCB0byBnZW5lcmF0ZScpLFxuICAgICAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTGFiZWwgdGV4dCBmb3IgYnV0dG9ucyBvciBmb3JtcycpLFxuICAgICAgZmllbGRzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbmFtZTogei5zdHJpbmcoKSxcbiAgICAgICAgdHlwZTogei5lbnVtKFsndGV4dCcsICdlbWFpbCcsICdwYXNzd29yZCcsICdudW1iZXInLCAndGV4dGFyZWEnLCAnc2VsZWN0J10pLFxuICAgICAgICBsYWJlbDogei5zdHJpbmcoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGb3JtIGZpZWxkcyAoZm9yIGZvcm0gY29tcG9uZW50KScpLFxuICAgICAgY2hhcnRfZGF0YTogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIGxhYmVsOiB6LnN0cmluZygpLFxuICAgICAgICB2YWx1ZTogei5udW1iZXIoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDaGFydCBkYXRhIHBvaW50cyAoZm9yIGNoYXJ0IGNvbXBvbmVudCknKSxcbiAgICAgIGRhc2hib2FyZF90aXRsZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGl0bGVzIGZvciBkYXNoYm9hcmQgY2FyZHMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21wb25lbnRfdHlwZSwgbGFiZWwsIGZpZWxkcywgY2hhcnRfZGF0YSwgZGFzaGJvYXJkX3RpdGxlcyB9OiB7IFxuICAgICAgY29tcG9uZW50X3R5cGU6IHN0cmluZzsgXG4gICAgICBsYWJlbD86IHN0cmluZzsgXG4gICAgICBmaWVsZHM/OiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH0+OyBcbiAgICAgIGNoYXJ0X2RhdGE/OiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfT47XG4gICAgICBkYXNoYm9hcmRfdGl0bGVzPzogc3RyaW5nW107XG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAoY29tcG9uZW50X3R5cGUpIHtcbiAgICAgICAgICBjYXNlICdidXR0b24nOlxuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlQnV0dG9uSHRtbChsYWJlbCB8fCAnQ2xpY2sgTWUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Zvcm0nOlxuICAgICAgICAgICAgaWYgKCFmaWVsZHMgfHwgZmllbGRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGb3JtIGNvbXBvbmVudCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZmllbGQnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVGb3JtSHRtbChmaWVsZHMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnY2hhcnQnOlxuICAgICAgICAgICAgaWYgKCFjaGFydF9kYXRhIHx8IGNoYXJ0X2RhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NoYXJ0IGNvbXBvbmVudCByZXF1aXJlcyBkYXRhIHBvaW50cycgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZUNoYXJ0SHRtbChjaGFydF9kYXRhKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Rhc2hib2FyZCc6XG4gICAgICAgICAgICBpZiAoIWRhc2hib2FyZF90aXRsZXMgfHwgZGFzaGJvYXJkX3RpdGxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRGFzaGJvYXJkIGNvbXBvbmVudCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgdGl0bGUnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZGFzaGJvYXJkX3RpdGxlcy5tYXAoKHRpdGxlLCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgICAgdHlwZTogaW5kZXggJSAyID09PSAwID8gJ2NoYXJ0JyA6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgZGF0YTogaW5kZXggJSAyID09PSAwID8gW3sgbGFiZWw6ICdBJywgdmFsdWU6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgfSwgeyBsYWJlbDogJ0InLCB2YWx1ZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSB9XSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZURhc2hib2FyZEh0bWwoZGFzaGJvYXJkX3RpdGxlcywgY29udGVudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5rbm93biBjb21wb25lbnQgdHlwZTogJHtjb21wb25lbnRfdHlwZX1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmdWxsSHRtbCA9IGA8IURPQ1RZUEUgaHRtbD48aHRtbD48aGVhZD48bWV0YSBjaGFyc2V0PVwiVVRGLThcIj48dGl0bGU+VUkgQ29tcG9uZW50PC90aXRsZT48L2hlYWQ+PGJvZHkgc3R5bGU9XCJmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7IHBhZGRpbmc6IDIwcHg7XCI+JHtodG1sfTwvYm9keT48L2h0bWw+YDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tcG9uZW50X3R5cGUsIGh0bWw6IGZ1bGxIdG1sIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZW5lcmF0ZSBVSSBjb21wb25lbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlbmRlcl9hbmRfcHJldmlld191aSB0b29sIFx1MjAxNCBSZW5kZXIgZ2VuZXJhdGVkIFVJIGluIGJyb3dzZXIgYW5kIGNhcHR1cmUgc2NyZWVuc2hvdFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZW5kZXJfYW5kX3ByZXZpZXdfdWknLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVuZGVyIGEgZ2VuZXJhdGVkIEhUTUwgVUkgY29tcG9uZW50LCBzYXZlIGl0IHRvIGEgZmlsZSwgb3BlbiBpdCBpbiB0aGUgZGVmYXVsdCBicm93c2VyLCBhbmQgb3B0aW9uYWxseSB0YWtlIGEgc2NyZWVuc2hvdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGh0bWxfY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbXBsZXRlIEhUTUwgY29udGVudCB0byByZW5kZXInKSxcbiAgICAgIGZpbGVuYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgndWlfcHJldmlldy5odG1sJykuZGVzY3JpYmUoJ0ZpbGVuYW1lIGZvciBzYXZpbmcgKGRlZmF1bHQ6IHVpX3ByZXZpZXcuaHRtbCknKSxcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbCBwYXRoIHRvIHNhdmUgYSBzY3JlZW5zaG90IG9mIHRoZSByZW5kZXJlZCBVSScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGh0bWxfY29udGVudCwgZmlsZW5hbWUsIHNjcmVlbnNob3RfcGF0aCB9OiB7IFxuICAgICAgaHRtbF9jb250ZW50OiBzdHJpbmc7IFxuICAgICAgZmlsZW5hbWU/OiBzdHJpbmc7IFxuICAgICAgc2NyZWVuc2hvdF9wYXRoPzogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGVuYW1lIHx8ICd1aV9wcmV2aWV3Lmh0bWwnO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihnZXRXb3JraW5nRGlyKCksIGZpbGVOYW1lKTtcblxuICAgICAgICAvLyBTYXZlIEhUTUwgdG8gZmlsZVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBodG1sX2NvbnRlbnQpO1xuXG4gICAgICAgIC8vIE9wZW4gaW4gZGVmYXVsdCBicm93c2VyIHVzaW5nIEVTIGltcG9ydCAoc2FtZSBhcyBwcmV2aWV3X2h0bWwgdG9vbClcbiAgICAgICAgY29uc3Qgb3Blbk1vZHVsZSA9IGF3YWl0IGltcG9ydCgnb3BlbicpO1xuICAgICAgICBhd2FpdCBvcGVuTW9kdWxlLmRlZmF1bHQoZmlsZVBhdGgpO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0geyBcbiAgICAgICAgICByZW5kZXJlZDogdHJ1ZSwgXG4gICAgICAgICAgZmlsZTogZmlsZU5hbWUsXG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGFrZSBzY3JlZW5zaG90IGlmIHJlcXVlc3RlZCAodXNpbmcgUHVwcGV0ZWVyKVxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHB1cHBldGVlck1vZHVsZSA9IGF3YWl0IGltcG9ydCgncHVwcGV0ZWVyJyk7XG4gICAgICAgICAgICBjb25zdCBicm93c2VyID0gYXdhaXQgcHVwcGV0ZWVyTW9kdWxlLmRlZmF1bHQubGF1bmNoKHsgaGVhZGxlc3M6IHRydWUgfSk7XG4gICAgICAgICAgICBjb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIExvYWQgdGhlIEhUTUwgZmlsZVxuICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKGBmaWxlOi8vJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgY29udGVudCB0byByZW5kZXJcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvclNlbGVjdG9yKCdib2R5JywgeyB0aW1lb3V0OiA1MDAwIH0pLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGFrZSBzY3JlZW5zaG90XG4gICAgICAgICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3QoeyBwYXRoOiBzY3JlZW5zaG90X3BhdGgsIGZ1bGxQYWdlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90U2F2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhd2FpdCBicm93c2VyLmNsb3NlKCk7XG4gICAgICAgICAgfSBjYXRjaCAoc2NyZWVuc2hvdEVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gc2NyZWVuc2hvdEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBzY3JlZW5zaG90RXJyb3IubWVzc2FnZSA6IFN0cmluZyhzY3JlZW5zaG90RXJyb3IpO1xuICAgICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90V2FybmluZyA9IGBTY3JlZW5zaG90IGZhaWxlZDogJHttZXNzYWdlfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0RGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJlbmRlciBVSTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZXh0cmFjdF91aV9kYXRhIHRvb2wgXHUyMDE0IEV4dHJhY3QgZGF0YSBmcm9tIGludGVyYWN0aXZlIFVJIGVsZW1lbnRzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2V4dHJhY3RfdWlfZGF0YScsXG4gICAgZGVzY3JpcHRpb246ICdFeHRyYWN0IHN0cnVjdHVyZWQgZGF0YSBmcm9tIEhUTUwgY29udGVudCAodGFibGVzLCBmb3JtcywgbGlzdHMpLiBVc2VmdWwgZm9yIHBhcnNpbmcgZ2VuZXJhdGVkIG9yIGZldGNoZWQgVUlzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSFRNTCBjb250ZW50IHRvIGV4dHJhY3QgZGF0YSBmcm9tJyksXG4gICAgICBleHRyYWN0aW9uX3R5cGU6IHouZW51bShbJ3RhYmxlJywgJ2Zvcm0nLCAnbGlzdCddKS5kZWZhdWx0KCd0YWJsZScpLmRlc2NyaWJlKCdUeXBlIG9mIGRhdGEgdG8gZXh0cmFjdCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGh0bWxfY29udGVudCwgZXh0cmFjdGlvbl90eXBlIH06IHsgXG4gICAgICBodG1sX2NvbnRlbnQ6IHN0cmluZzsgXG4gICAgICBleHRyYWN0aW9uX3R5cGU6IHN0cmluZzsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVXNlIE5vZGUuanMgRE9NIHBhcnNlciAoY2hlZXJpby1saWtlIGFwcHJvYWNoIHdpdGggYmFzaWMgcmVnZXggZm9yIHNpbXBsaWNpdHkpXG4gICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgeW91J2QgdXNlIGEgcHJvcGVyIEhUTUwgcGFyc2VyIGxpa2UganNkb20gb3IgY2hlZXJpb1xuICAgICAgICBcbiAgICAgICAgbGV0IGV4dHJhY3RlZERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICAgICAgaWYgKGV4dHJhY3Rpb25fdHlwZSA9PT0gJ3RhYmxlJykge1xuICAgICAgICAgIGNvbnN0IHRhYmxlUmVnZXggPSAvPHRhYmxlW14+XSo+KFtcXHNcXFNdKj8pPFxcL3RhYmxlPi9naTtcbiAgICAgICAgICBjb25zdCByb3dzUmVnZXggPSAvPHRyW14+XSo+KFtcXHNcXFNdKj8pPFxcL3RyPi9naTtcbiAgICAgICAgICBjb25zdCBjZWxsc1JlZ2V4ID0gLzwodGR8dGgpW14+XSo+KFtcXHNcXFNdKj8pPFxcLyh0ZHx0aCk+L2dpO1xuXG4gICAgICAgICAgbGV0IHRhYmxlTWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKCh0YWJsZU1hdGNoID0gdGFibGVSZWdleC5leGVjKGh0bWxfY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB0YWJsZUNvbnRlbnQgPSB0YWJsZU1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3Qgcm93czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCByb3dNYXRjaDtcbiAgICAgICAgICAgIHdoaWxlICgocm93TWF0Y2ggPSByb3dzUmVnZXguZXhlYyh0YWJsZUNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICByb3dzLnB1c2gocm93TWF0Y2hbMV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYXJzZWRSb3dzOiBzdHJpbmdbXVtdID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNlbGxzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICBsZXQgY2VsbE1hdGNoO1xuICAgICAgICAgICAgICBjb25zdCBjZWxsUmVnZXggPSAvPCh0ZHx0aClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHRkfHRoKT4vZ2k7XG4gICAgICAgICAgICAgIHdoaWxlICgoY2VsbE1hdGNoID0gY2VsbFJlZ2V4LmV4ZWMocm93KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjZWxscy5wdXNoKGNlbGxNYXRjaFsyXS5yZXBsYWNlKC88W14+XSs+L2csICcnKS50cmltKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhcnNlZFJvd3MucHVzaChjZWxscyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEudGFibGVzID0gcGFyc2VkUm93cztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAnZm9ybScpIHtcbiAgICAgICAgICBjb25zdCBmb3JtUmVnZXggPSAvPGZvcm1bXj5dKj4oW1xcc1xcU10qPyk8XFwvZm9ybT4vZ2k7XG4gICAgICAgICAgY29uc3QgaW5wdXRSZWdleCA9IC88KGlucHV0fHNlbGVjdHx0ZXh0YXJlYSlbXj5dKlxcLz8+L2dpO1xuXG4gICAgICAgICAgbGV0IGZvcm1NYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKGZvcm1NYXRjaCA9IGZvcm1SZWdleC5leGVjKGh0bWxfY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtQ29udGVudCA9IGZvcm1NYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgdmFsdWU/OiBzdHJpbmcgfT4gPSBbXTtcbiAgICAgICAgICAgIGxldCBpbnB1dE1hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChpbnB1dE1hdGNoID0gaW5wdXRSZWdleC5leGVjKGZvcm1Db250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uc3QgdGFnID0gaW5wdXRNYXRjaFswXTtcbiAgICAgICAgICAgICAgY29uc3QgbmFtZU1hdGNoID0gL25hbWU9W1wiJ10oW15cIiddKylbXCInXS9pLmV4ZWModGFnKTtcbiAgICAgICAgICAgICAgY29uc3QgdHlwZU1hdGNoID0gL3R5cGU9W1wiJ10oW15cIiddKylbXCInXS9pLmV4ZWModGFnKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGlmIChuYW1lTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBmaWVsZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lTWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlTWF0Y2g/LlsxXSB8fCAndGV4dCcsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJycsIC8vIFdvdWxkIG5lZWQgdG8gZXh0cmFjdCBhY3R1YWwgdmFsdWVzIGluIGEgcmVhbCBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEuZm9ybUZpZWxkcyA9IGZpZWxkcztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAnbGlzdCcpIHtcbiAgICAgICAgICBjb25zdCBsaXN0UmVnZXggPSAvPCh1bHxvbClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHVsfG9sKT4vZ2k7XG4gICAgICAgICAgY29uc3QgaXRlbVJlZ2V4ID0gLzxsaVtePl0qPihbXFxzXFxTXSo/KTxcXC9saT4vZ2k7XG5cbiAgICAgICAgICBsZXQgbGlzdE1hdGNoO1xuICAgICAgICAgIHdoaWxlICgobGlzdE1hdGNoID0gbGlzdFJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RDb250ZW50ID0gbGlzdE1hdGNoWzJdO1xuICAgICAgICAgICAgY29uc3QgaXRlbXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBsZXQgaXRlbU1hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChpdGVtTWF0Y2ggPSBpdGVtUmVnZXguZXhlYyhsaXN0Q29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbU1hdGNoWzFdLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpLnRyaW0oKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBleHRyYWN0ZWREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZXh0cmFjdCBVSSBkYXRhOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgTWFuYWdlbWVudCBUeXBlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQ29udGV4dEVudHJ5IHtcbiAgaWQ6IHN0cmluZztcbiAgdGltZXN0YW1wOiBudW1iZXI7XG4gIHR5cGU6ICdkZWNpc2lvbicgfCAncGF0dGVybicgfCAnY29uZmlndXJhdGlvbicgfCAnZmlsZV9jaGFuZ2UnIHwgJ2Vycm9yJyB8ICdzdW1tYXJ5JztcbiAgdGl0bGU6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xuICB0YWdzPzogc3RyaW5nW107XG4gIHNlc3Npb25faWQ/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBDb250ZXh0U3VtbWFyeSB7XG4gIHRvdGFsX2VudHJpZXM6IG51bWJlcjtcbiAgZW50cmllc19ieV90eXBlOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICByZWNlbnRfZW50cmllczogQ29udGV4dEVudHJ5W107XG4gIGxhc3RfdXBkYXRlZDogbnVtYmVyO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDb250ZXh0IFN0b3JhZ2UgTWFuYWdlciA9PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBDb250ZXh0U3RvcmFnZU1hbmFnZXIge1xuICBwcml2YXRlIHN0b3JhZ2VQYXRoOiBzdHJpbmc7XG4gIFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JhZ2VQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgJy5haV90b29sYm94X2NvbnRleHQuanNvbicpO1xuICB9XG5cbiAgLyoqIExvYWQgY29udGV4dCBlbnRyaWVzIGZyb20gZGlzayAqL1xuICBsb2FkKCk6IENvbnRleHRFbnRyeVtdIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmModGhpcy5zdG9yYWdlUGF0aCkpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLnN0b3JhZ2VQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGNvbnRleHQgc3RvcmFnZTonLCBlcnJvcik7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKiBTYXZlIGNvbnRleHQgZW50cmllcyB0byBkaXNrICovXG4gIHNhdmUoZW50cmllczogQ29udGV4dEVudHJ5W10pOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMuc3RvcmFnZVBhdGgpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFdyaXRlIGF0b21pY2FsbHkgKHRlbXAgZmlsZSArIHJlbmFtZSlcbiAgICAgIGNvbnN0IHRlbXBQYXRoID0gdGhpcy5zdG9yYWdlUGF0aCArICcudG1wJztcbiAgICAgIGZzLndyaXRlRmlsZVN5bmModGVtcFBhdGgsIEpTT04uc3RyaW5naWZ5KGVudHJpZXMsIG51bGwsIDIpKTtcbiAgICAgIGZzLnJlbmFtZVN5bmModGVtcFBhdGgsIHRoaXMuc3RvcmFnZVBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBjb250ZXh0IHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBBZGQgYSBuZXcgY29udGV4dCBlbnRyeSAqL1xuICBhZGRFbnRyeShlbnRyeTogQ29udGV4dEVudHJ5KTogdm9pZCB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIGVudHJpZXMudW5zaGlmdChlbnRyeSk7IC8vIEFkZCB0byBiZWdpbm5pbmdcbiAgICBcbiAgICAvLyBMaW1pdCB0byBsYXN0IDEwMDAgZW50cmllcyB0byBwcmV2ZW50IHVuYm91bmRlZCBncm93dGhcbiAgICBpZiAoZW50cmllcy5sZW5ndGggPiAxMDAwKSB7XG4gICAgICBlbnRyaWVzLnNwbGljZSgxMDAwKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zYXZlKGVudHJpZXMpO1xuICB9XG5cbiAgLyoqIEdldCByZWNlbnQgY29udGV4dCBlbnRyaWVzICovXG4gIGdldFJlY2VudEVudHJpZXMobGltaXQ6IG51bWJlciA9IDIwLCB0eXBlPzogc3RyaW5nKTogQ29udGV4dEVudHJ5W10ge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBcbiAgICBpZiAodHlwZSkge1xuICAgICAgcmV0dXJuIGVudHJpZXMuZmlsdGVyKGUgPT4gZS50eXBlID09PSB0eXBlKS5zbGljZSgwLCBsaW1pdCk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBlbnRyaWVzLnNsaWNlKDAsIGxpbWl0KTtcbiAgfVxuXG4gIC8qKiBTZWFyY2ggY29udGV4dCBlbnRyaWVzIGJ5IHF1ZXJ5ICovXG4gIHNlYXJjaEVudHJpZXMocXVlcnk6IHN0cmluZywgbWF4UmVzdWx0czogbnVtYmVyID0gMTApOiBDb250ZXh0RW50cnlbXSB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIGNvbnN0IGxvd2VyUXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdHMgPSBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBcbiAgICAgIGVudHJ5LnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJRdWVyeSkgfHxcbiAgICAgIGVudHJ5LmNvbnRlbnQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSB8fFxuICAgICAgKGVudHJ5LnRhZ3MgJiYgZW50cnkudGFncy5zb21lKHRhZyA9PiB0YWcudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSkpXG4gICAgKTtcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKTtcbiAgfVxuXG4gIC8qKiBEZWxldGUgY29udGV4dCBlbnRyaWVzIGJ5IElEICovXG4gIGRlbGV0ZUVudHJ5KGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgY29uc3QgZmlsdGVyZWQgPSBlbnRyaWVzLmZpbHRlcihlID0+IGUuaWQgIT09IGlkKTtcbiAgICBcbiAgICBpZiAoZmlsdGVyZWQubGVuZ3RoID09PSBlbnRyaWVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBFbnRyeSBub3QgZm91bmRcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zYXZlKGZpbHRlcmVkKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBDbGVhciBhbGwgY29udGV4dCBlbnRyaWVzICovXG4gIGNsZWFyQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc2F2ZShbXSk7XG4gIH1cblxuICAvKiogR2V0IHN1bW1hcnkgc3RhdGlzdGljcyAqL1xuICBnZXRTdW1tYXJ5KCk6IENvbnRleHRTdW1tYXJ5IHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgXG4gICAgY29uc3QgZW50cmllc0J5VHlwZTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBlbnRyaWVzQnlUeXBlW2VudHJ5LnR5cGVdID0gKGVudHJpZXNCeVR5cGVbZW50cnkudHlwZV0gfHwgMCkgKyAxO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvdGFsX2VudHJpZXM6IGVudHJpZXMubGVuZ3RoLFxuICAgICAgZW50cmllc19ieV90eXBlOiBlbnRyaWVzQnlUeXBlLFxuICAgICAgcmVjZW50X2VudHJpZXM6IGVudHJpZXMuc2xpY2UoMCwgNSksXG4gICAgICBsYXN0X3VwZGF0ZWQ6IERhdGUubm93KCksXG4gICAgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDb250ZXh0IEFuYWx5emVyID09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIENvbnRleHRBbmFseXplciB7XG4gIHByaXZhdGUgc3RvcmFnZU1hbmFnZXI6IENvbnRleHRTdG9yYWdlTWFuYWdlcjtcbiAgXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmFnZU1hbmFnZXIgPSBuZXcgQ29udGV4dFN0b3JhZ2VNYW5hZ2VyKCk7XG4gIH1cblxuICAvKiogQW5hbHl6ZSByZWNlbnQgYWN0aXZpdHkgYW5kIGF1dG8tc2F2ZSBpbXBvcnRhbnQgY29udGV4dCAqL1xuICBhbmFseXplQW5kU2F2ZShcbiAgICBzZXNzaW9uRXZlbnRzOiBBcnJheTx7IHR5cGU6IHN0cmluZzsgdGltZXN0YW1wOiBudW1iZXI7IGRhdGE/OiBhbnkgfT4sXG4gICAgY29uZmlnQ2hhbmdlcz86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4gfCBzdHJpbmc+XG4gICk6IHsgc2F2ZWRfY291bnQ6IG51bWJlcjsgc3VtbWFyeTogc3RyaW5nIH0ge1xuICAgIGNvbnN0IGVudHJpZXM6IENvbnRleHRFbnRyeVtdID0gW107XG5cbiAgICAvLyBBbmFseXplIHRvb2wgdXNhZ2UgcGF0dGVybnNcbiAgICBjb25zdCB0b29sVXNhZ2VDb3VudDogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIHNlc3Npb25FdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQudHlwZS5zdGFydHNXaXRoKCd0b29sXycpKSB7XG4gICAgICAgIGNvbnN0IHRvb2xOYW1lID0gZXZlbnQudHlwZS5yZXBsYWNlKCd0b29sXycsICcnKTtcbiAgICAgICAgdG9vbFVzYWdlQ291bnRbdG9vbE5hbWVdID0gKHRvb2xVc2FnZUNvdW50W3Rvb2xOYW1lXSB8fCAwKSArIDE7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZGVudGlmeSBmcmVxdWVudGx5IHVzZWQgdG9vbHMgKD4zIHVzZXMgaW4gc2Vzc2lvbilcbiAgICBPYmplY3QuZW50cmllcyh0b29sVXNhZ2VDb3VudCkuZm9yRWFjaCgoW3Rvb2wsIGNvdW50XSkgPT4ge1xuICAgICAgaWYgKGNvdW50ID4gMykge1xuICAgICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ3BhdHRlcm4nLFxuICAgICAgICAgIHRpdGxlOiBgRnJlcXVlbnQgVG9vbCBVc2FnZTogJHt0b29sfWAsXG4gICAgICAgICAgY29udGVudDogYFRvb2wgJyR7dG9vbH0nIHdhcyB1c2VkICR7Y291bnR9IHRpbWVzIGluIHRoZSBjdXJyZW50IHNlc3Npb24sIGluZGljYXRpbmcgaXQncyBhIHByaW1hcnkgd29ya2Zsb3cgdG9vbC5gLFxuICAgICAgICAgIHRhZ3M6IFsndXNhZ2VfcGF0dGVybicsICdmcmVxdWVudF90b29sJ10sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQW5hbHl6ZSBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgICBpZiAoY29uZmlnQ2hhbmdlcykge1xuICAgICAgT2JqZWN0LmVudHJpZXMoY29uZmlnQ2hhbmdlcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAnY29uZmlndXJhdGlvbicsXG4gICAgICAgICAgdGl0bGU6IGBDb25maWd1cmF0aW9uIENoYW5nZTogJHtrZXl9YCxcbiAgICAgICAgICBjb250ZW50OiBgU2V0dGluZyAnJHtrZXl9JyB3YXMgY2hhbmdlZCB0byAnJHt2YWx1ZX0nLmAsXG4gICAgICAgICAgdGFnczogWydjb25maWdfY2hhbmdlJ10sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0IGltcG9ydGFudCBkZWNpc2lvbnMgKGJhc2VkIG9uIGV2ZW50IHBhdHRlcm5zKVxuICAgIGNvbnN0IGRlY2lzaW9uRXZlbnRzID0gc2Vzc2lvbkV2ZW50cy5maWx0ZXIoZSA9PiBcbiAgICAgIGUudHlwZSA9PT0gJ2RlY2lzaW9uJyB8fCBcbiAgICAgIChlLmRhdGEgJiYgdHlwZW9mIGUuZGF0YS5kZWNpc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgKTtcblxuICAgIGRlY2lzaW9uRXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgY29uc3QgZGVjaXNpb25UZXh0ID0gZXZlbnQuZGF0YT8uZGVjaXNpb24gfHwgYERlY2lzaW9uIG1hZGUgYXQgJHtuZXcgRGF0ZShldmVudC50aW1lc3RhbXApLnRvTG9jYWxlVGltZVN0cmluZygpfWA7XG4gICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgIHRpbWVzdGFtcDogZXZlbnQudGltZXN0YW1wLFxuICAgICAgICB0eXBlOiAnZGVjaXNpb24nLFxuICAgICAgICB0aXRsZTogJ0ltcG9ydGFudCBEZWNpc2lvbiBSZWNvcmRlZCcsXG4gICAgICAgIGNvbnRlbnQ6IGRlY2lzaW9uVGV4dCxcbiAgICAgICAgdGFnczogWydkZWNpc2lvbiddLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBBdXRvLWdlbmVyYXRlIHN1bW1hcnkgaWYgd2UgaGF2ZSBlbm91Z2ggZW50cmllc1xuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHVuaXF1ZVBhdHRlcm5zID0gbmV3IFNldChlbnRyaWVzLmZpbHRlcihlID0+IGUudHlwZSA9PT0gJ3BhdHRlcm4nKS5tYXAoZSA9PiBlLnRpdGxlKSk7XG4gICAgICBcbiAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICB0eXBlOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiBgU2Vzc2lvbiBDb250ZXh0IFN1bW1hcnkgKCR7bmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKX0pYCxcbiAgICAgICAgY29udGVudDogYEF1dG8tZ2VuZXJhdGVkIHN1bW1hcnk6ICR7ZW50cmllcy5sZW5ndGh9IGNvbnRleHQgZW50cmllcyBzYXZlZC4gS2V5IHBhdHRlcm5zIGRldGVjdGVkOiAke0FycmF5LmZyb20odW5pcXVlUGF0dGVybnMpLmpvaW4oJywgJykgfHwgJ05vIHNwZWNpZmljIHBhdHRlcm5zJ30uIENvbmZpZ3VyYXRpb24gY2hhbmdlcyB0cmFja2VkOiAke09iamVjdC5rZXlzKGNvbmZpZ0NoYW5nZXMgfHwge30pLmxlbmd0aH0uYCxcbiAgICAgICAgdGFnczogWydhdXRvX3N1bW1hcnknXSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTYXZlIGFsbCBlbnRyaWVzIHRvIHN0b3JhZ2VcbiAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB0aGlzLnN0b3JhZ2VNYW5hZ2VyLmFkZEVudHJ5KGVudHJ5KSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNhdmVkX2NvdW50OiBlbnRyaWVzLmxlbmd0aCxcbiAgICAgICAgc3VtbWFyeTogYFNhdmVkICR7ZW50cmllcy5sZW5ndGh9IGNvbnRleHQgZW50cmllcyBpbmNsdWRpbmcgcGF0dGVybnMgYW5kIGRlY2lzaW9ucy5gLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBzYXZlZF9jb3VudDogMCwgc3VtbWFyeTogJ05vIHNpZ25pZmljYW50IGNvbnRleHQgY2hhbmdlcyBkZXRlY3RlZC4nIH07XG4gIH1cblxuICAvKiogR2VuZXJhdGUgYSB1bmlxdWUgSUQgZm9yIGNvbnRleHQgZW50cnkgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjdHhfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgQ29udGV4dEFuYWx5emVyKCk7XG4gIGNvbnN0IHN0b3JhZ2VNYW5hZ2VyID0gbmV3IENvbnRleHRTdG9yYWdlTWFuYWdlcigpO1xuXG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBhdXRvX3N1bW1hcml6ZV9jb250ZXh0IHRvb2wgXHUyMDE0IEFuYWx5emUgc2Vzc2lvbiBhbmQgc2F2ZSBpbXBvcnRhbnQgY29udGV4dFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdhdXRvX3N1bW1hcml6ZV9jb250ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0F1dG9tYXRpY2FsbHkgYW5hbHl6ZSByZWNlbnQgc2Vzc2lvbiBhY3Rpdml0eSwgaWRlbnRpZnkgaW1wb3J0YW50IHBhdHRlcm5zL2RlY2lzaW9ucywgYW5kIHNhdmUgdGhlbSB0byBwZXJzaXN0ZW50IG1lbW9yeSBmb3IgZnV0dXJlIHJlZmVyZW5jZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNlc3Npb25fZXZlbnRzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgdHlwZTogei5zdHJpbmcoKSxcbiAgICAgICAgdGltZXN0YW1wOiB6Lm51bWJlcigpLFxuICAgICAgICBkYXRhOiB6LmFueSgpLm9wdGlvbmFsKCksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnUmVjZW50IHNlc3Npb24gZXZlbnRzIHRvIGFuYWx5emUnKSxcbiAgICAgIGNvbmZpZ19jaGFuZ2VzOiB6LnJlY29yZCh6LnVuaW9uKFt6LmJvb2xlYW4oKSwgei5zdHJpbmcoKV0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDb25maWd1cmF0aW9uIGNoYW5nZXMgbWFkZSBkdXJpbmcgc2Vzc2lvbicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHNlc3Npb25fZXZlbnRzLCBjb25maWdfY2hhbmdlcyB9OiB7IFxuICAgICAgc2Vzc2lvbl9ldmVudHM/OiBBcnJheTx7IHR5cGU6IHN0cmluZzsgdGltZXN0YW1wOiBudW1iZXI7IGRhdGE/OiBhbnkgfT47IFxuICAgICAgY29uZmlnX2NoYW5nZXM/OiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuIHwgc3RyaW5nPjsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYW5hbHl6ZXIuYW5hbHl6ZUFuZFNhdmUoc2Vzc2lvbl9ldmVudHMgfHwgW10sIGNvbmZpZ19jaGFuZ2VzKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29udGV4dCBhbmFseXNpcyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9jb250ZXh0X21lbW9yeSB0b29sIFx1MjAxNCBSZXRyaWV2ZSBhdXRvLXNhdmVkIGNvbnRleHQgZW50cmllc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfY29udGV4dF9tZW1vcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnUmV0cmlldmUgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgZnJvbSBwZXJzaXN0ZW50IG1lbW9yeS4gVXNlZnVsIGZvciByZWNhbGxpbmcgcGFzdCBkZWNpc2lvbnMsIHBhdHRlcm5zLCBvciBjb25maWd1cmF0aW9ucy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGxpbWl0OiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgyMCkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIGVudHJpZXMgdG8gcmV0dXJuJyksXG4gICAgICB0eXBlOiB6LmVudW0oWydkZWNpc2lvbicsICdwYXR0ZXJuJywgJ2NvbmZpZ3VyYXRpb24nLCAnZmlsZV9jaGFuZ2UnLCAnZXJyb3InLCAnc3VtbWFyeSddKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgZW50cnkgdHlwZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGxpbWl0LCB0eXBlIH06IHsgXG4gICAgICBsaW1pdD86IG51bWJlcjsgXG4gICAgICB0eXBlPzogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gc3RvcmFnZU1hbmFnZXIuZ2V0UmVjZW50RW50cmllcyhsaW1pdCB8fCAyMCwgdHlwZSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGVudHJpZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJldHJpZXZlIGNvbnRleHQgbWVtb3J5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzZWFyY2hfY29udGV4dCB0b29sIFx1MjAxNCBTZWFyY2ggYXV0by1zYXZlZCBjb250ZXh0IGJ5IHF1ZXJ5XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NlYXJjaF9jb250ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCB0aHJvdWdoIGF1dG9tYXRpY2FsbHkgc2F2ZWQgY29udGV4dCBlbnRyaWVzIHVzaW5nIHRleHQgbWF0Y2hpbmcuIEZpbmRzIHJlbGV2YW50IHBhc3QgZGVjaXNpb25zLCBwYXR0ZXJucywgb3IgY29uZmlndXJhdGlvbnMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRvIG1hdGNoIGFnYWluc3QgY29udGV4dCBlbnRyaWVzJyksXG4gICAgICBtYXhfcmVzdWx0czogei5udW1iZXIoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVybicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBtYXhfcmVzdWx0cyB9OiB7IFxuICAgICAgcXVlcnk6IHN0cmluZzsgXG4gICAgICBtYXhfcmVzdWx0cz86IG51bWJlcjsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHN0b3JhZ2VNYW5hZ2VyLnNlYXJjaEVudHJpZXMocXVlcnksIG1heF9yZXN1bHRzIHx8IDEwKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcmVzdWx0cyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IHNlYXJjaCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNvbnRleHRfc3VtbWFyeSB0b29sIFx1MjAxNCBHZXQgc3VtbWFyeSBzdGF0aXN0aWNzIG9mIGF1dG8tc2F2ZWQgY29udGV4dFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjb250ZXh0X3N1bW1hcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGEgc3VtbWFyeSBvZiBhbGwgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMsIGluY2x1ZGluZyBjb3VudHMgYnkgdHlwZSBhbmQgcmVjZW50IGFjdGl2aXR5LicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSBzdG9yYWdlTWFuYWdlci5nZXRTdW1tYXJ5KCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBzdW1tYXJ5IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGNvbnRleHQgc3VtbWFyeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2NvbnRleHRfZW50cnkgdG9vbCBcdTIwMTQgUmVtb3ZlIGEgc3BlY2lmaWMgY29udGV4dCBlbnRyeSBieSBJRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfY29udGV4dF9lbnRyeScsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgYSBzcGVjaWZpYyBhdXRvLXNhdmVkIGNvbnRleHQgZW50cnkgYnkgaXRzIHVuaXF1ZSBJRC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGVudHJ5X2lkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdW5pcXVlIElEIG9mIHRoZSBjb250ZXh0IGVudHJ5IHRvIGRlbGV0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGVudHJ5X2lkIH06IHsgZW50cnlfaWQ6IHN0cmluZyB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkZWxldGVkID0gc3RvcmFnZU1hbmFnZXIuZGVsZXRlRW50cnkoZW50cnlfaWQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFkZWxldGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29udGV4dCBlbnRyeSAnJHtlbnRyeV9pZH0nIG5vdCBmb3VuZGAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkOiB0cnVlLCBlbnRyeV9pZCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZGVsZXRlIGNvbnRleHQgZW50cnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNsZWFyX2NvbnRleHRfbWVtb3J5IHRvb2wgXHUyMDE0IENsZWFyIGFsbCBhdXRvLXNhdmVkIGNvbnRleHQgZW50cmllc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjbGVhcl9jb250ZXh0X21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBhbGwgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgZnJvbSBwZXJzaXN0ZW50IG1lbW9yeS4gVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbmZpcm06IHouYm9vbGVhbigpLmRlc2NyaWJlKCdTZXQgdG8gdHJ1ZSB0byBjb25maXJtIGRlbGV0aW9uIG9mIGFsbCBjb250ZXh0IGVudHJpZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb25maXJtIH06IHsgY29uZmlybTogYm9vbGVhbiB9KSA9PiB7XG4gICAgICBpZiAoIWNvbmZpcm0pIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ29uZmlybWF0aW9uIHJlcXVpcmVkLiBTZXQgY29uZmlybT10cnVlIHRvIHByb2NlZWQuJyB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICB0cnkge1xuICAgICAgICBzdG9yYWdlTWFuYWdlci5jbGVhckFsbCgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjbGVhcmVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjbGVhciBjb250ZXh0IG1lbW9yeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gdHJhY2tfaW1wb3J0YW50X2V2ZW50IHRvb2wgXHUyMDE0IE1hbnVhbGx5IG1hcmsgYW4gZXZlbnQgYXMgaW1wb3J0YW50IGZvciBjb250ZXh0IHRyYWNraW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3RyYWNrX2ltcG9ydGFudF9ldmVudCcsXG4gICAgZGVzY3JpcHRpb246ICdNYW51YWxseSByZWNvcmQgYW4gaW1wb3J0YW50IGV2ZW50IG9yIGRlY2lzaW9uIHRvIHBlcnNpc3RlbnQgbWVtb3J5LiBVc2VmdWwgZm9yIG1hcmtpbmcgY3JpdGljYWwgbW9tZW50cyBpbiBhIHNlc3Npb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGl0bGUgb2YgdGhlIGltcG9ydGFudCBldmVudCcpLFxuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnRGV0YWlsZWQgZGVzY3JpcHRpb24gb2YgdGhlIGV2ZW50JyksXG4gICAgICB0YWdzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RhZ3MgdG8gY2F0ZWdvcml6ZSB0aGUgZXZlbnQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgY29udGVudCwgdGFncyB9OiB7IFxuICAgICAgdGl0bGU6IHN0cmluZzsgXG4gICAgICBjb250ZW50OiBzdHJpbmc7IFxuICAgICAgdGFncz86IHN0cmluZ1tdOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyeTogQ29udGV4dEVudHJ5ID0ge1xuICAgICAgICAgIGlkOiBgY3R4XyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ2RlY2lzaW9uJyxcbiAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIHRhZ3MsXG4gICAgICAgIH07XG5cbiAgICAgICAgc3RvcmFnZU1hbmFnZXIuYWRkRW50cnkoZW50cnkpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB0cmFja2VkOiB0cnVlLCBlbnRyeV9pZDogZW50cnkuaWQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHRyYWNrIGV2ZW50OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiLyoqXHJcbiAqIFRvb2xzIFByb3ZpZGVyIC0gQ29tcGxldGUgSW1wbGVtZW50YXRpb24gb2YgYWxsIH40NSB0b29scyBhY3Jvc3MgNiBjYXRlZ29yaWVzXHJcbiAqL1xyXG5cclxuaW1wb3J0IHR5cGUgeyBUb29sLCBUb29sc1Byb3ZpZGVyQ29udHJvbGxlciB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xyXG5cclxuLy8gSW1wb3J0IGV4aXN0aW5nIG1vZHVsZXNcclxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuL2NvbmZpZyc7XHJcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHLCBpc1Rvb2xFbmFibGVkLCBpc0V4ZWN1dGlvblRvb2xFbmFibGVkIH0gZnJvbSAnLi9jb25maWcnO1xyXG5pbXBvcnQgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuL3N0YXRlTWFuYWdlcic7XHJcbmltcG9ydCB7IEJhY2tncm91bmRDb21tYW5kTWFuYWdlciB9IGZyb20gJy4vYmFja2dyb3VuZENvbW1hbmRzJztcclxuXHJcbi8vIEltcG9ydCBjYXRlZ29yeS1zcGVjaWZpYyB0b29sIG1vZHVsZXNcclxuaW1wb3J0IHsgcmVnaXN0ZXJGaWxlU3lzdGVtVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2ZpbGVTeXN0ZW1Ub29scyc7XHJcbmltcG9ydCB7IHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyB9IGZyb20gJy4vdG9vbHMvd2ViUmVzZWFyY2hUb29scyc7XHJcbmltcG9ydCB7IHJlZ2lzdGVyR2l0VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2dpdEdpdGh1YlRvb2xzJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJCcm93c2VyVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2Jyb3dzZXJBdXRvbWF0aW9uVG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlckRhdGFiYXNlVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2RhdGFiYXNlVG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlckJhY2tncm91bmRDb21tYW5kVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2JhY2tncm91bmRDb21tYW5kVG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlckV4ZWN1dGlvblRvb2xzIH0gZnJvbSAnLi90b29scy9leGVjdXRpb25Ub29scyc7XHJcbmltcG9ydCB7IHJlZ2lzdGVyVXRpbGl0eVRvb2xzIH0gZnJvbSAnLi90b29scy91dGlsaXR5VG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzIH0gZnJvbSAnLi90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scyc7XHJcbmltcG9ydCB7IHJlZ2lzdGVySHR0cENsaWVudFRvb2xzIH0gZnJvbSAnLi90b29scy9odHRwQ2xpZW50VG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlclJhZ1Rvb2xzIH0gZnJvbSAnLi90b29scy92ZWN0b3JSYWdUb29scyc7XHJcbmltcG9ydCB7IHJlZ2lzdGVyVWlHZW5lcmF0aW9uVG9vbHMgfSBmcm9tICcuL3Rvb2xzL3VpR2VuZXJhdGlvblRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyQ29udGV4dE1hbmFnZW1lbnRUb29scyB9IGZyb20gJy4vdG9vbHMvY29udGV4dE1hbmFnZW1lbnRUb29scyc7XG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT0gVFlQRVMgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVG9vbENhdGVnb3J5IHtcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgdG9vbHM6IFRvb2xbXTtcclxufVxyXG5cclxuLyoqIEV4dGVuZGVkIHRvb2wgdHlwZSB3aXRoIHR5cGVkIGltcGxlbWVudGF0aW9uIGZvciBzYWZlIGFjY2VzcyAqL1xyXG50eXBlIFR5cGVkVG9vbCA9IFRvb2wgJiB7XHJcbiAgaW1wbGVtZW50YXRpb246IChwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBjdHg/OiB1bmtub3duKSA9PiBQcm9taXNlPHVua25vd24+O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENlbnRyYWwgcmVnaXN0cnkgZm9yIGFsbCBhdmFpbGFibGUgdG9vbHMuXHJcbiAqIFRvb2xzIGFyZSBjcmVhdGVkIG9uY2UgYXQgbW9kdWxlIGxvYWQgdGltZSBhbmQgcmV1c2VkIGFjcm9zcyBwcm92aWRlciBjYWxscy5cclxuICovXHJcbmNsYXNzIFRvb2xSZWdpc3RyeSB7XHJcbiAgcHJpdmF0ZSB0b29sTWFwID0gbmV3IE1hcDxzdHJpbmcsIFR5cGVkVG9vbD4oKTtcclxuXHJcbiAgcmVnaXN0ZXJBbGwoY29uZmlnOiBQbHVnaW5Db25maWcsIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcik6IHZvaWQge1xyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZmlsZVN5c3RlbScpKSB7XHJcbiAgICAgIHJlZ2lzdGVyRmlsZVN5c3RlbVRvb2xzKGNvbmZpZywgc3RhdGVNYW5hZ2VyKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICd3ZWJTZWFyY2gnKSkge1xyXG4gICAgICByZWdpc3RlcldlYlJlc2VhcmNoVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdicm93c2VyQXV0b21hdGlvbicpKSB7XHJcbiAgICAgIHJlZ2lzdGVyQnJvd3NlclRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZ2l0T3BlcmF0aW9ucycpKSB7XHJcbiAgICAgIHJlZ2lzdGVyR2l0VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdkYXRhYmFzZVF1ZXJpZXMnKSkge1xyXG4gICAgICByZWdpc3RlckRhdGFiYXNlVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdiYWNrZ3JvdW5kQ29tbWFuZHMnKSkge1xyXG4gICAgICByZWdpc3RlckJhY2tncm91bmRDb21tYW5kVG9vbHMoY29uZmlnLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBcdTI1MDBcdTI1MDAgXHVEODNDXHVERDk1IE5FVyBUT09MIENBVEVHT1JJRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdpbWFnZVByb2Nlc3NpbmcnKSkge1xyXG4gICAgICByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnaHR0cENsaWVudCcpKSB7XHJcbiAgICAgIHJlZ2lzdGVySHR0cENsaWVudFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAndmVjdG9yUkFHJykpIHtcclxuICAgICAgcmVnaXN0ZXJSYWdUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcclxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ3VpR2VuZXJhdGlvbicpKSB7XG4gICAgICByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdjb250ZXh0TWFuYWdlbWVudCcpKSB7XG4gICAgICByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCByZWdpc3RlcmVkIG9uY2UsIGZpbHRlcmVkIGJ5IGVuYWJsZWQgdG9vbCB0eXBlc1xyXG4gICAgY29uc3QgZXhlY0NvbmZpZyA9IHsgLi4uY29uZmlnIH07XHJcbiAgICBjb25zdCBhbGxFeGVjVG9vbHMgPSByZWdpc3RlckV4ZWN1dGlvblRvb2xzKGV4ZWNDb25maWcpO1xyXG4gICAgXHJcbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAnamF2YXNjcmlwdCcpKSB7XHJcbiAgICAgIGNvbnN0IGpzVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX2phdmFzY3JpcHQnKTtcclxuICAgICAgaWYgKGpzVG9vbCkgdGhpcy50b29sTWFwLnNldChqc1Rvb2wubmFtZSwganNUb29sIGFzIFR5cGVkVG9vbCk7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAncHl0aG9uJykpIHtcclxuICAgICAgY29uc3QgcHlUb29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdydW5fcHl0aG9uJyk7XHJcbiAgICAgIGlmIChweVRvb2wpIHRoaXMudG9vbE1hcC5zZXQocHlUb29sLm5hbWUsIHB5VG9vbCBhcyBUeXBlZFRvb2wpO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ3Rlcm1pbmFsJykpIHtcclxuICAgICAgY29uc3QgdGVybVRvb2wgPSBhbGxFeGVjVG9vbHMuZmluZCh0ID0+IHQubmFtZSA9PT0gJ3J1bl9pbl90ZXJtaW5hbCcpO1xyXG4gICAgICBpZiAodGVybVRvb2wpIHRoaXMudG9vbE1hcC5zZXQodGVybVRvb2wubmFtZSwgdGVybVRvb2wgYXMgVHlwZWRUb29sKTtcclxuICAgIH1cclxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICdzaGVsbCcpKSB7XHJcbiAgICAgIGNvbnN0IHNoZWxsVG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAnZXhlY3V0ZV9jb21tYW5kJyk7XHJcbiAgICAgIGlmIChzaGVsbFRvb2wpIHRoaXMudG9vbE1hcC5zZXQoc2hlbGxUb29sLm5hbWUsIHNoZWxsVG9vbCBhcyBUeXBlZFRvb2wpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBVdGlsaXR5IHRvb2xzIGFyZSBhbHdheXMgcmVnaXN0ZXJlZCAobm8gc3BlY2lmaWMgY29uZmlnIGZsYWcpXHJcbiAgICBjb25zdCBnZXRFbmFibGVkVG9vbHMgPSAoKSA9PiBBcnJheS5mcm9tKHRoaXMudG9vbE1hcC5rZXlzKCkpO1xyXG4gICAgcmVnaXN0ZXJVdGlsaXR5VG9vbHMoY29uZmlnLCBzdGF0ZU1hbmFnZXIsIGdldEVuYWJsZWRUb29scykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0QWxsKCk6IFRvb2xbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnRvb2xNYXAudmFsdWVzKCkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0KG5hbWU6IHN0cmluZyk6IFR5cGVkVG9vbCB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy50b29sTWFwLmdldChuYW1lKTtcclxuICB9XHJcblxyXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnRvb2xNYXAuaGFzKG5hbWUpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE1hbmFnZXMgdG9vbCBleGVjdXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVG9vbHNQcm92aWRlciB7XHJcbiAgcHJpdmF0ZSBjb25maWc6IFBsdWdpbkNvbmZpZztcclxuICBwcml2YXRlIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyO1xyXG4gIHByaXZhdGUgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyOiBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI7XHJcbiAgcHJpdmF0ZSByZWdpc3RyeTogVG9vbFJlZ2lzdHJ5O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQbHVnaW5Db25maWcpIHtcclxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnIHx8IERFRkFVTFRfQ09ORklHO1xyXG4gICAgdGhpcy5zdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKHRoaXMuY29uZmlnKTtcclxuICAgIHRoaXMuYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyID0gbmV3IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcih0aGlzLmNvbmZpZyk7XHJcbiAgICB0aGlzLnJlZ2lzdHJ5ID0gbmV3IFRvb2xSZWdpc3RyeSgpO1xyXG4gICAgdGhpcy5yZWdpc3RyeS5yZWdpc3RlckFsbCh0aGlzLmNvbmZpZywgdGhpcy5zdGF0ZU1hbmFnZXIsIHRoaXMuYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4ZWN1dGUgYSB0b29sIGJ5IG5hbWUgd2l0aCBwYXJhbWV0ZXJzLlxyXG4gICAqL1xyXG4gIGFzeW5jIGV4ZWN1dGVUb29sKHRvb2xOYW1lOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+IHtcclxuICAgIGNvbnN0IHRvb2wgPSB0aGlzLnJlZ2lzdHJ5LmdldCh0b29sTmFtZSk7XHJcbiAgICBpZiAoIXRvb2wpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVG9vbCAnJHt0b29sTmFtZX0nIG5vdCBmb3VuZGAgfTtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBTYWZlIGFjY2VzcyB2aWEgdHlwZWQgd3JhcHBlciAoQzQgZml4KVxyXG4gICAgICBjb25zdCBpbXBsID0gdG9vbC5pbXBsZW1lbnRhdGlvbjtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW1wbChwYXJhbXMpO1xyXG4gICAgICBcclxuICAgICAgLy8gVXBkYXRlIHN0YXRlIHdpdGggZXhlY3V0aW9uIHJlc3VsdFxyXG4gICAgICB0aGlzLnN0YXRlTWFuYWdlci5zZXQoYGxhc3RfJHt0b29sTmFtZX1gLCByZXN1bHQpO1xyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFRvb2wgZXhlY3V0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbGwgYXZhaWxhYmxlIHRvb2xzIGZpbHRlcmVkIGJ5IGNvbmZpZy5cclxuICAgKi9cclxuICBnZXRBdmFpbGFibGVUb29scygpOiBUb29sW10ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cnkuZ2V0QWxsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHN0YXRlIG1hbmFnZXIgaW5zdGFuY2UuXHJcbiAgICovXHJcbiAgZ2V0U3RhdGVNYW5hZ2VyKCk6IFN0YXRlTWFuYWdlciB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGF0ZU1hbmFnZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbi5cclxuICAgKi9cclxuICBnZXRDb25maWcoKTogUGx1Z2luQ29uZmlnIHtcclxuICAgIHJldHVybiB0aGlzLmNvbmZpZztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFRvb2xzUHJvdmlkZXIgd2l0aCBkZWZhdWx0IGNvbmZpZy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUb29sc1Byb3ZpZGVyKGNvbmZpZz86IFBsdWdpbkNvbmZpZyk6IFRvb2xzUHJvdmlkZXIge1xyXG4gIHJldHVybiBuZXcgVG9vbHNQcm92aWRlcihjb25maWcpO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTREsgUFJPVklERVIgRlVOQ1RJT04gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBNYWluIHRvb2xzIHByb3ZpZGVyIGZ1bmN0aW9uIGZvciBMTSBTdHVkaW8gU0RLLlxyXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCB0aGF0IGdldHMgY2FsbGVkIGJ5IExNIFN0dWRpby5cclxuICogXHJcbiAqIElNUE9SVEFOVDogVGhlIExNIFN0dWRpbyBTREsgYXV0b21hdGljYWxseSByZWdpc3RlcnMgYWxsIFRvb2wgb2JqZWN0c1xyXG4gKiByZXR1cm5lZCBmcm9tIHRoaXMgcHJvdmlkZXIgZnVuY3Rpb24uIE5vIG1hbnVhbCBjdGwuYWRkKCkgY2FsbHMgbmVlZGVkIC1cclxuICoganVzdCByZXR1cm4gdGhlIGFycmF5IGRpcmVjdGx5IGFuZCB0aGUgU0RLIGhhbmRsZXMgcmVnaXN0cmF0aW9uLlxyXG4gKiBcclxuICogTk9URTogTXVzdCBiZSBhc3luYyBcdTIwMTQgU0RLIHR5cGUgcmVxdWlyZXMgUHJvbWlzZTxUb29sW10+LlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvb2xzUHJvdmlkZXIoX2N0bDogVG9vbHNQcm92aWRlckNvbnRyb2xsZXIpOiBQcm9taXNlPFRvb2xbXT4ge1xyXG4gIGNvbnN0IHByb3ZpZGVyID0gY3JlYXRlVG9vbHNQcm92aWRlcigpO1xyXG4gIFxyXG4gIC8vIFJldHVybiBhbGwgYXZhaWxhYmxlIHRvb2xzIC0gU0RLIGF1dG9tYXRpY2FsbHkgcmVnaXN0ZXJzIHRoZW1cclxuICByZXR1cm4gcHJvdmlkZXIuZ2V0QXZhaWxhYmxlVG9vbHMoKTtcclxufVxyXG4iLCAiLyoqXG4gKiBEb2N1bWVudCBSQUcgUHJvbXB0IFByZXByb2Nlc3NvciArIFdvcmtpbmcgRGlyZWN0b3J5IERldGVjdGlvblxuICogXG4gKiBIYW5kbGVzOlxuICogMS4gRG9jdW1lbnQgYXR0YWNobWVudHMgYW5kIHNlbWFudGljIHJldHJpZXZhbCBmb3IgXCJDaGF0IHdpdGggRmlsZXNcIiBmZWF0dXJlLlxuICogMi4gRGV0ZWN0cyBkaXJlY3RvcnkgcGF0aHMgaW4gdXNlciBtZXNzYWdlcyBhbmQgcHJvbXB0cyBMTE0gdG8gYXNrIGZvciBjb25maXJtYXRpb25cbiAqICAgIGJlZm9yZSBjaGFuZ2luZyB0aGUgd29ya2luZyBkaXJlY3RvcnkuXG4gKi9cblxuaW1wb3J0IHtcbiAgdHlwZSBDaGF0TWVzc2FnZSxcbiAgdHlwZSBGaWxlSGFuZGxlLFxuICB0eXBlIFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG59IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuXG5pbXBvcnQgeyBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuXG4vKipcbiAqIERldGVjdHMgZGlyZWN0b3J5L2ZpbGUgcGF0aHMgaW4gdXNlciBtZXNzYWdlcyB1c2luZyByZWdleCBwYXR0ZXJucy5cbiAqIFN1cHBvcnRzIFdpbmRvd3MgKEM6XFwuLi4pIGFuZCBVbml4ICgvaG9tZS8uLi4sIC9Vc2Vycy8uLi4pIGZvcm1hdHMuXG4gKi9cbmZ1bmN0aW9uIGRldGVjdERpcmVjdG9yeVBhdGgodGV4dDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIC8vIFdpbmRvd3MgcGF0aCBwYXR0ZXJuOiBDOlxcLi4uIG9yIEQ6XFwuLi4gKGhhbmRsZXMgc3BhY2VzLCBkb3RzLCBzbGFzaGVzKVxuICBjb25zdCB3aW5kb3dzUGF0dGVybiA9IC9bQS1aYS16XTpcXFxcW1xcd1xcLlxcLV8gXSsoPzpbXFwvXFxcXF1bXFx3XFwuXFwtXyBdKykqL2c7XG4gIFxuICAvLyBVbml4IGFic29sdXRlIHBhdGggcGF0dGVybjogL2hvbWUvLi4uLCAvVXNlcnMvLi4uLCAvb3B0Ly4uLlxuICBjb25zdCB1bml4UGF0dGVybiA9IC9cXC9bXFx3XFwuXFwtXyBdKyg/OltcXC9dW1xcd1xcLlxcLV8gXSspKi9nO1xuICBcbiAgLy8gVHJ5IFdpbmRvd3MgZmlyc3RcbiAgbGV0IG1hdGNoID0gdGV4dC5tYXRjaCh3aW5kb3dzUGF0dGVybik7XG4gIGlmIChtYXRjaCkge1xuICAgIHJldHVybiBtYXRjaFswXS50cmltKCk7XG4gIH1cbiAgXG4gIC8vIFRoZW4gVW5peFxuICBtYXRjaCA9IHRleHQubWF0Y2godW5peFBhdHRlcm4pO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2hbMF0udHJpbSgpO1xuICB9XG4gIFxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBJbmplY3RzIHN5c3RlbSBpbnN0cnVjdGlvbiB0byBwcm9tcHQgTExNIGZvciB3b3JraW5nIGRpcmVjdG9yeSBjb25maXJtYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGluamVjdFdvcmtpbmdEaXJlY3RvcnlQcm9tcHQob3JpZ2luYWxNZXNzYWdlOiBzdHJpbmcsIGRldGVjdGVkUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgaW5zdHJ1Y3Rpb24gPSBgXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblx1MjZBMFx1RkUwRiBXT1JLSU5HIERJUkVDVE9SWSBERVRFQ1RFRFxuXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXG5cblRoZSB1c2VyIG1lbnRpb25lZCBhIGRpcmVjdG9yeSBwYXRoIGluIHRoZWlyIG1lc3NhZ2U6XG5cbiAgICAke2RldGVjdGVkUGF0aH1cblxuUGxlYXNlIGFzayB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uIGJlZm9yZSBjaGFuZ2luZyB0aGUgd29ya2luZyBkaXJlY3RvcnkuXG5FeGFtcGxlIHJlc3BvbnNlOlxuXG5cIkkgbm90aWNlZCB5b3UgbWVudGlvbmVkIHRoZSBkaXJlY3RvcnkgJyR7ZGV0ZWN0ZWRQYXRofScuIFxuV291bGQgeW91IGxpa2UgbWUgdG8gc2V0IHRoaXMgYXMgeW91ciB3b3JraW5nIGRpcmVjdG9yeT8gXG5BbGwgc3Vic2VxdWVudCBmaWxlIG9wZXJhdGlvbnMgd2lsbCB1c2UgdGhpcyBkaXJlY3RvcnkgYXMgdGhlIGJhc2UuXG5cblJlcGx5ICd5ZXMnIG9yICdqYScgdG8gY29uZmlybSwgb3IgJ25vJy8nbmVpbicgdG8gZGVjbGluZS5cIlxuXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblxuVXNlcidzIG9yaWdpbmFsIG1lc3NhZ2U6XG4ke29yaWdpbmFsTWVzc2FnZX1cbmA7XG4gIFxuICByZXR1cm4gaW5zdHJ1Y3Rpb24udHJpbSgpO1xufVxuXG4vKiogVHlwZWQgcmV0cmlldmFsIGVudHJ5IGludGVyZmFjZSAqL1xuaW50ZXJmYWNlIFJldHJpZXZhbEVudHJ5IHtcbiAgY29udGVudDogc3RyaW5nO1xuICBzY29yZTogbnVtYmVyO1xufVxuXG4vKipcbiAqIE1haW4gcHJvbXB0IHByZXByb2Nlc3NvciBmdW5jdGlvbi5cbiAqIEhhbmRsZXM6XG4gKiAxLiBXb3JraW5nIGRpcmVjdG9yeSBkZXRlY3Rpb24gYW5kIGNvbmZpcm1hdGlvbiBwcm9tcHRpbmdcbiAqIDIuIERvY3VtZW50IFJBRyBmb3IgXCJDaGF0IHdpdGggRmlsZXNcIiBmZWF0dXJlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmVwcm9jZXNzKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIHVzZXJNZXNzYWdlOiBDaGF0TWVzc2FnZVxuKTogUHJvbWlzZTxzdHJpbmcgfCBDaGF0TWVzc2FnZT4ge1xuICBjb25zdCB1c2VyUHJvbXB0ID0gdXNlck1lc3NhZ2UuZ2V0VGV4dCgpO1xuICBcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNURVAgMTogRGV0ZWN0IGRpcmVjdG9yeSBwYXRocyBpbiB1c2VyIG1lc3NhZ2VcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGNvbnN0IGRldGVjdGVkUGF0aCA9IGRldGVjdERpcmVjdG9yeVBhdGgodXNlclByb21wdCk7XG4gIFxuICBpZiAoZGV0ZWN0ZWRQYXRoKSB7XG4gICAgLy8gRGlyZWN0b3J5IHBhdGggZm91bmQgXHUyMDE0IGluamVjdCBjb25maXJtYXRpb24gcHJvbXB0XG4gICAgcmV0dXJuIGluamVjdFdvcmtpbmdEaXJlY3RvcnlQcm9tcHQodXNlclByb21wdCwgZGV0ZWN0ZWRQYXRoKTtcbiAgfVxuICBcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNURVAgMjogRG9jdW1lbnQgUkFHIHByb2Nlc3NpbmcgKGlmIGVuYWJsZWQpXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBjb25zdCBwbHVnaW5Db25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBjb25zdCBkb2N1bWVudFJBR0VuYWJsZWQgPSBwbHVnaW5Db25maWcuZ2V0KCdkb2N1bWVudFJBRycpO1xuICBcbiAgaWYgKCFkb2N1bWVudFJBR0VuYWJsZWQpIHtcbiAgICByZXR1cm4gdXNlck1lc3NhZ2U7IC8vIEZlYXR1cmUgZGlzYWJsZWQsIHBhc3MgdGhyb3VnaCB1bmNoYW5nZWRcbiAgfVxuICBcbiAgLy8gR2V0IGZpbGVzIGF0dGFjaGVkIHRvIHRoaXMgbWVzc2FnZSAobm9uLWltYWdlIG9ubHkpXG4gIGNvbnN0IG5ld0ZpbGVzID0gdXNlck1lc3NhZ2UuZ2V0RmlsZXMoY3RsLmNsaWVudCkuZmlsdGVyKGYgPT4gZi50eXBlICE9PSAnaW1hZ2UnKTtcbiAgXG4gIGlmIChuZXdGaWxlcy5sZW5ndGggPT09IDAgJiYgIShhd2FpdCBoYXNBdHRhY2hlZEZpbGVzSW5IaXN0b3J5KGN0bCkpKSB7XG4gICAgcmV0dXJuIHVzZXJNZXNzYWdlOyAvLyBObyBkb2N1bWVudHMgdG8gcHJvY2Vzc1xuICB9XG5cbiAgLy8gR2V0IGFsbCBub24taW1hZ2UgZmlsZXMgZnJvbSBjdXJyZW50IG1lc3NhZ2UgKyBjaGF0IGhpc3RvcnlcbiAgY29uc3QgYWxsRmlsZXMgPSBhd2FpdCBnZXRBbGxOb25JbWFnZUZpbGVzKGN0bCwgdXNlck1lc3NhZ2UpO1xuICBcbiAgaWYgKGFsbEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1c2VyTWVzc2FnZTtcbiAgfVxuXG4gIC8vIFVzZSByZXRyaWV2YWwtYmFzZWQgYXBwcm9hY2ggZm9yIHNlbWFudGljIHNlYXJjaFxuICByZXR1cm4gcHJlcGFyZVJldHJpZXZhbFJlc3VsdHNDb250ZXh0SW5qZWN0aW9uKGN0bCwgdXNlclByb21wdCwgYWxsRmlsZXMpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZXJlIGFyZSBhbnkgYXR0YWNoZWQgZmlsZXMgaW4gY2hhdCBoaXN0b3J5LlxuICovXG5hc3luYyBmdW5jdGlvbiBoYXNBdHRhY2hlZEZpbGVzSW5IaXN0b3J5KGN0bDogUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBjdGwucHVsbEhpc3RvcnkoKTtcbiAgICByZXR1cm4gaGlzdG9yeS5nZXRBbGxGaWxlcyhjdGwuY2xpZW50KS5zb21lKGYgPT4gZi50eXBlICE9PSAnaW1hZ2UnKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogR2V0IGFsbCBub24taW1hZ2UgZmlsZXMgZnJvbSBjdXJyZW50IG1lc3NhZ2UgYW5kIGNoYXQgaGlzdG9yeSAobWVyZ2VkLCBkZWR1cGxpY2F0ZWQpLlxuICogRW5zdXJlcyBwcmV2aW91c2x5IGF0dGFjaGVkIGZpbGVzIHJlbWFpbiBpbiBjb250ZXh0IGFjcm9zcyBtdWx0aS10dXJuIGNvbnZlcnNhdGlvbnMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEFsbE5vbkltYWdlRmlsZXMoXG4gIGN0bDogUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcixcbiAgdXNlck1lc3NhZ2U6IENoYXRNZXNzYWdlXG4pOiBQcm9taXNlPEZpbGVIYW5kbGVbXT4ge1xuICBjb25zdCBuZXdGaWxlcyA9IHVzZXJNZXNzYWdlLmdldEZpbGVzKGN0bC5jbGllbnQpLmZpbHRlcihmID0+IGYudHlwZSAhPT0gJ2ltYWdlJyk7XG4gIFxuICAvLyBBbHdheXMgdHJ5IHRvIG1lcmdlIHdpdGggaGlzdG9yeSBmaWxlcyBmb3IgbXVsdGktdHVybiBkb2N1bWVudCBjb250ZXh0XG4gIHRyeSB7XG4gICAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGN0bC5wdWxsSGlzdG9yeSgpO1xuICAgIGNvbnN0IGhpc3RvcnlGaWxlcyA9IGhpc3RvcnkuZ2V0QWxsRmlsZXMoY3RsLmNsaWVudCkuZmlsdGVyKGYgPT4gZi50eXBlICE9PSAnaW1hZ2UnKTtcbiAgICBcbiAgICBpZiAobmV3RmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gaGlzdG9yeUZpbGVzOyAvLyBObyBuZXcgZmlsZXMsIHJldHVybiBoaXN0b3J5IGZpbGVzXG4gICAgfVxuICAgIFxuICAgIC8vIERlZHVwbGljYXRlOiBtZXJnZSBuZXcgZmlsZXMgd2l0aCB1bmlxdWUgaGlzdG9yeSBmaWxlcyAoYnkgZmlsZSBpZGVudGlmaWVyKVxuICAgIGNvbnN0IG5ld0ZpbGVJZHMgPSBuZXcgU2V0KG5ld0ZpbGVzLm1hcChmID0+IGYuaWRlbnRpZmllcikpO1xuICAgIGNvbnN0IHVuaXF1ZUhpc3RvcnlGaWxlcyA9IGhpc3RvcnlGaWxlcy5maWx0ZXIoZiA9PiAhbmV3RmlsZUlkcy5oYXMoZi5pZGVudGlmaWVyKSk7XG4gICAgXG4gICAgcmV0dXJuIFsuLi5uZXdGaWxlcywgLi4udW5pcXVlSGlzdG9yeUZpbGVzXTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gRmFsbGJhY2s6IHJldHVybiBvbmx5IG5ldyBmaWxlcyBpZiBoaXN0b3J5IGZldGNoIGZhaWxzXG4gICAgcmV0dXJuIG5ld0ZpbGVzO1xuICB9XG59XG5cbi8qKlxuICogUGVyZm9ybSBzZW1hbnRpYyByZXRyaWV2YWwgYW5kIGluamVjdCByZWxldmFudCBjaHVua3MgaW50byB0aGUgcHJvbXB0LlxuICogRW5zdXJlcyBzdGF0dXMgaW5kaWNhdG9yIGlzIGFsd2F5cyBwcm9wZXJseSBjbGVhbmVkIHVwLlxuICovXG5hc3luYyBmdW5jdGlvbiBwcmVwYXJlUmV0cmlldmFsUmVzdWx0c0NvbnRleHRJbmplY3Rpb24oXG4gIGN0bDogUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcixcbiAgb3JpZ2luYWxVc2VyUHJvbXB0OiBzdHJpbmcsXG4gIGZpbGVzOiBGaWxlSGFuZGxlW11cbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIGNvbnN0IHJldHJpZXZhbExpbWl0ID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsTGltaXQnKTtcbiAgY29uc3QgYWZmaW5pdHlUaHJlc2hvbGQgPSBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCcpO1xuXG4gIC8vIENyZWF0ZSBzdGF0dXMgaW5kaWNhdG9yIGZvciB1c2VyIGZlZWRiYWNrXG4gIGNvbnN0IHJldHJpZXZpbmdTdGF0dXMgPSBjdGwuY3JlYXRlU3RhdHVzKHtcbiAgICBzdGF0dXM6ICdsb2FkaW5nJyxcbiAgICB0ZXh0OiBgTG9hZGluZyBlbWJlZGRpbmcgbW9kZWwuLi5gLFxuICB9KTtcblxuICB0cnkge1xuICAgIC8vIFByb2FjdGl2ZWx5IGxvYWQgdGhlIGVtYmVkZGluZyBtb2RlbCAoaWRlbnRpY2FsIHRvIG9mZmljaWFsIHJhZy12MSBwbHVnaW4pXG4gICAgY29uc3QgZW1iZWRkaW5nTW9kZWxJZCA9IFwibm9taWMtYWkvbm9taWMtZW1iZWQtdGV4dC12MS41LUdHVUZcIjtcbiAgICBcbiAgICBjb25zdCBtb2RlbCA9IGF3YWl0IGN0bC5jbGllbnQuZW1iZWRkaW5nLm1vZGVsKGVtYmVkZGluZ01vZGVsSWQsIHtcbiAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIHN0YXR1cyB0byBpbmRpY2F0ZSByZXRyaWV2YWwgc3RhcnRcbiAgICByZXRyaWV2aW5nU3RhdHVzLnNldFN0YXRlKHtcbiAgICAgIHN0YXR1czogJ2xvYWRpbmcnLFxuICAgICAgdGV4dDogYFJldHJpZXZpbmcgcmVsZXZhbnQgY2l0YXRpb25zIGZvciB1c2VyIHF1ZXJ5Li4uYCxcbiAgICB9KTtcblxuICAgIC8vIFVzZSBMTSBTdHVkaW8ncyBidWlsdC1pbiByZXRyaWV2YWwgQVBJIHdpdGggdGhlIGxvYWRlZCBtb2RlbFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGN0bC5jbGllbnQuZmlsZXMucmV0cmlldmUob3JpZ2luYWxVc2VyUHJvbXB0LCBmaWxlcywge1xuICAgICAgZW1iZWRkaW5nTW9kZWw6IG1vZGVsLCAvLyBFeHBsaWNpdGx5IHBhc3MgdGhlIGxvYWRlZCBtb2RlbFxuICAgICAgbGltaXQ6IHJldHJpZXZhbExpbWl0LFxuICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgICBvbkZpbGVQcm9jZXNzTGlzdChmaWxlc1RvUHJvY2Vzcykge1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXNUb1Byb2Nlc3MpIHtcbiAgICAgICAgICByZXRyaWV2aW5nU3RhdHVzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHN0YXR1czogJ2xvYWRpbmcnLFxuICAgICAgICAgICAgdGV4dDogYFByb2Nlc3NpbmcgJHtmaWxlLm5hbWV9Li4uYCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uRmlsZVByb2Nlc3NpbmdTdGFydChmaWxlKSB7XG4gICAgICAgIHJldHJpZXZpbmdTdGF0dXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHN0YXR1czogJ2xvYWRpbmcnLFxuICAgICAgICAgIHRleHQ6IGBFbWJlZGRpbmcgY2h1bmtzIGZyb20gJHtmaWxlLm5hbWV9Li4uYCxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgb25GaWxlUHJvY2Vzc2luZ0VuZChmaWxlKSB7XG4gICAgICAgIHJldHJpZXZpbmdTdGF0dXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHN0YXR1czogJ2RvbmUnLFxuICAgICAgICAgIHRleHQ6IGBQcm9jZXNzZWQgJHtmaWxlLm5hbWV9YCxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gRmlsdGVyIHJlc3VsdHMgYnkgYWZmaW5pdHkgdGhyZXNob2xkXG4gICAgY29uc3QgcmVsZXZhbnRFbnRyaWVzID0gcmVzdWx0LmVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IGVudHJ5LnNjb3JlID49IGFmZmluaXR5VGhyZXNob2xkKTtcblxuICAgIGlmIChyZWxldmFudEVudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXRyaWV2aW5nU3RhdHVzLnNldFN0YXRlKHtcbiAgICAgICAgc3RhdHVzOiAnZXJyb3InLFxuICAgICAgICB0ZXh0OiBgTm8gcmVsZXZhbnQgY29udGVudCBmb3VuZCBpbiBhdHRhY2hlZCBkb2N1bWVudHMgKHRocmVzaG9sZDogJHthZmZpbml0eVRocmVzaG9sZH0pYCxcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICByZXR1cm4gYnVpbGROb1Jlc3VsdHNNZXNzYWdlKG9yaWdpbmFsVXNlclByb21wdCk7XG4gICAgfVxuXG4gICAgLy8gRm9ybWF0IHJldHJpZXZhbCByZXN1bHRzXG4gICAgcmV0cmlldmluZ1N0YXR1cy5zZXRTdGF0ZSh7XG4gICAgICBzdGF0dXM6ICdkb25lJyxcbiAgICAgIHRleHQ6IGBSZXRyaWV2ZWQgJHtyZWxldmFudEVudHJpZXMubGVuZ3RofSByZWxldmFudCBjaHVuayhzKSBmcm9tICR7ZmlsZXMubGVuZ3RofSBkb2N1bWVudChzKWAsXG4gICAgfSk7XG5cbiAgICBjdGwuZGVidWcoYFJldHJpZXZlZCAke3JlbGV2YW50RW50cmllcy5sZW5ndGh9IHJlbGV2YW50IGNodW5rcyB3aXRoIGFmZmluaXR5IHRocmVzaG9sZCAke2FmZmluaXR5VGhyZXNob2xkfWApO1xuXG4gICAgcmV0dXJuIGJ1aWxkUmV0cmlldmFsTWVzc2FnZShyZWxldmFudEVudHJpZXMsIG9yaWdpbmFsVXNlclByb21wdCk7XG5cbiAgfSBjYXRjaCAoZXJyb3IpIHsgLy8gSDEgRklYOiBQcm9wZXJseSB0eXBlZCBlcnJvciBoYW5kbGluZ1xuICAgIC8vIEhhbmRsZSBhYm9ydCBzaWduYWwgZ3JhY2VmdWxseVxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIChlcnJvci5uYW1lID09PSAnQWJvcnRFcnJvcicgfHwgZXJyb3IubWVzc2FnZT8uaW5jbHVkZXMoJ2Fib3J0JykpKSB7XG4gICAgICByZXRyaWV2aW5nU3RhdHVzLnNldFN0YXRlKHtcbiAgICAgICAgc3RhdHVzOiAnY2FuY2VsZWQnLFxuICAgICAgICB0ZXh0OiAnUmV0cmlldmFsIGNhbmNlbGVkIGJ5IHVzZXInLFxuICAgICAgfSk7XG4gICAgICB0aHJvdyBlcnJvcjsgLy8gUmUtdGhyb3cgdG8gc2lnbmFsIGNhbmNlbGxhdGlvblxuICAgIH1cblxuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IFN0cmluZyhlcnJvcik7XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGVycm9yIGlzIGR1ZSB0byBtaXNzaW5nIGVtYmVkZGluZyBtb2RlbFxuICAgIGNvbnN0IG1lc3NhZ2VTdHIgPSB0eXBlb2YgZXJyb3JNZXNzYWdlID09PSAnc3RyaW5nJyA/IGVycm9yTWVzc2FnZSA6IGVycm9yTWVzc2FnZS5tZXNzYWdlIHx8ICcnO1xuICAgIGNvbnN0IGlzTWlzc2luZ01vZGVsRXJyb3IgPSBtZXNzYWdlU3RyLmluY2x1ZGVzKCdFbWJlZGRpbmcgbW9kZWwnKTtcbiAgICBcbiAgICByZXRyaWV2aW5nU3RhdHVzLnNldFN0YXRlKHtcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcbiAgICAgIHRleHQ6IGlzTWlzc2luZ01vZGVsRXJyb3IgXG4gICAgICAgID8gYFJBRyByZXF1aXJlcyBhbiBlbWJlZGRpbmcgbW9kZWwuIFBsZWFzZSBsb2FkICdub21pYy1lbWJlZC10ZXh0LXYxLjUnIGluIExNIFN0dWRpby5gXG4gICAgICAgIDogYFJldHJpZXZhbCBmYWlsZWQ6ICR7bWVzc2FnZVN0ciB8fCAnVW5rbm93biBlcnJvcid9YCxcbiAgICB9KTtcbiAgICBcbiAgICBjdGwuZGVidWcoYFJBRyByZXRyaWV2YWwgZXJyb3I6YCwgZXJyb3JNZXNzYWdlKTtcbiAgICBcbiAgICAvLyBGYWxsYmFjazogcmV0dXJuIG9yaWdpbmFsIHByb21wdCBzbyBjb252ZXJzYXRpb24gY2FuIGNvbnRpbnVlXG4gICAgcmV0dXJuIG9yaWdpbmFsVXNlclByb21wdDtcbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkIG1lc3NhZ2Ugd2hlbiBubyByZWxldmFudCByZXN1bHRzIGFyZSBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gYnVpbGROb1Jlc3VsdHNNZXNzYWdlKG9yaWdpbmFsVXNlclByb21wdDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgbm90ZSA9IGBJbXBvcnRhbnQ6IE5vIGNpdGF0aW9ucyB3ZXJlIGZvdW5kIGluIHRoZSBhdHRhY2hlZCBkb2N1bWVudHMgZm9yIHlvdXIgcXVlcnkuXFxuXFxuYDtcbiAgY29uc3QgaW5zdHJ1Y3Rpb24gPSBgUGxlYXNlIHJlc3BvbmQgdG8gdGhlIGJlc3Qgb2YgeW91ciBhYmlsaXR5IHdpdGhvdXQgZG9jdW1lbnQgY29udGV4dC5gO1xuICBcbiAgcmV0dXJuIGAke25vdGV9XFxuJHtpbnN0cnVjdGlvbn1cXG5cXG4tLS1cXG5Vc2VyIFF1ZXJ5OlxcblxcbiR7b3JpZ2luYWxVc2VyUHJvbXB0fWA7XG59XG5cbi8qKlxuICogQnVpbGQgbWVzc2FnZSB3aXRoIHJldHJpZXZlZCBkb2N1bWVudCBjaHVua3MuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkUmV0cmlldmFsTWVzc2FnZShcbiAgZW50cmllczogUmV0cmlldmFsRW50cnlbXSwgLy8gSDEgRklYOiBQcm9wZXJseSB0eXBlZCBpbnN0ZWFkIG9mIGFueVtdXG4gIG9yaWdpbmFsVXNlclByb21wdDogc3RyaW5nXG4pOiBzdHJpbmcge1xuICBjb25zdCBwcmVmaXggPSBgVGhlIGZvbGxvd2luZyBleGNlcnB0cyB3ZXJlIHJldHJpZXZlZCBmcm9tIHlvdXIgYXR0YWNoZWQgZG9jdW1lbnRzIGJhc2VkIG9uIHNlbWFudGljIHJlbGV2YW5jZTpcXG5cXG5gO1xuICBcbiAgbGV0IHByb2Nlc3NlZENvbnRlbnQgPSBwcmVmaXg7XG4gIFxuICBlbnRyaWVzLmZvckVhY2goKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgIC8vIFRydW5jYXRlIHZlcnkgbG9uZyBjaHVua3MgdG8gYXZvaWQgY29udGV4dCBvdmVyZmxvd1xuICAgIGNvbnN0IG1heENodW5rTGVuZ3RoID0gMjAwMDtcbiAgICBsZXQgY29udGVudCA9IGVudHJ5LmNvbnRlbnQ7XG4gICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICAgIGNvbnRlbnQgPSBjb250ZW50LnN1YnN0cmluZygwLCBtYXhDaHVua0xlbmd0aCkgKyAnLi4uIFt0cnVuY2F0ZWRdJztcbiAgICB9XG4gICAgXG4gICAgcHJvY2Vzc2VkQ29udGVudCArPSBgKipSZWxldmFudCBFeGNlcnB0ICR7aW5kZXggKyAxfSoqIChyZWxldmFuY2U6ICR7KGVudHJ5LnNjb3JlICogMTAwKS50b0ZpeGVkKDApfSUpOlxcbmA7XG4gICAgcHJvY2Vzc2VkQ29udGVudCArPSBgJHtjb250ZW50fVxcblxcbi0tLVxcblxcbmA7XG4gIH0pO1xuXG4gIGNvbnN0IHN1ZmZpeCA9IGBVc2UgdGhlIGV4Y2VycHRzIGFib3ZlIHRvIGluZm9ybSB5b3VyIHJlc3BvbnNlLiBPbmx5IGNpdGUgaW5mb3JtYXRpb24gdGhhdCBpcyBkaXJlY3RseSByZWxldmFudCB0byB0aGUgdXNlcidzIHF1ZXJ5LlxcblxcblVzZXIgUXVlcnk6XFxuXFxuJHtvcmlnaW5hbFVzZXJQcm9tcHR9YDtcbiAgXG4gIHJldHVybiBwcm9jZXNzZWRDb250ZW50ICsgc3VmZml4O1xufVxuIiwgIi8qKlxuICogQUkgVG9vbGJveCBQbHVnaW4gLSBFbnRyeSBQb2ludFxuICogTWFpbiBmdW5jdGlvbiBleHBvcnRlZCBmb3IgTE0gU3R1ZGlvIHBsdWdpbiBzeXN0ZW1cbiAqL1xuXG5pbXBvcnQgeyB0eXBlIFBsdWdpbkNvbnRleHQgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2xzUHJvdmlkZXIgfSBmcm9tICcuL3Rvb2xzUHJvdmlkZXInO1xuaW1wb3J0IHsgY29uZmlnU2NoZW1hdGljcyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IHByZXByb2Nlc3MgfSBmcm9tICcuL3Byb21wdFByZXByb2Nlc3Nvcic7XG5pbXBvcnQgeyBjbGVhbnVwQnJvd3NlclNlc3Npb24gfSBmcm9tICcuL3Rvb2xzL2Jyb3dzZXJBdXRvbWF0aW9uVG9vbHMnO1xuXG4vLyBcdTI3MDUgRklYOiBVc2Ugc3RydWN0dXJlZCBsb2dnaW5nIGluc3RlYWQgb2YgY29uc29sZS5sb2dcbmNvbnN0IGxvZ2dlciA9IHtcbiAgaW5mbzogKG1zZzogc3RyaW5nKSA9PiB0eXBlb2YgcHJvY2Vzcy5zdGRvdXQud3JpdGUgPT09ICdmdW5jdGlvbicgJiYgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYFtBSSBUb29sYm94XSAke21zZ31cXG5gKSxcbiAgZXJyb3I6IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbQUkgVG9vbGJveCBFUlJPUl0gJHttc2d9XFxuYCksXG59O1xuXG4vKipcbiAqIE1haW4gcGx1Z2luIGVudHJ5IHBvaW50IC0gY2FsbGVkIGJ5IExNIFN0dWRpb1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihjb250ZXh0OiBQbHVnaW5Db250ZXh0KSB7XG4gIGxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcuLi4nKTtcbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSBjb25maWd1cmF0aW9uIHNjaGVtYXRpY3MgKG1ha2VzIHRvZ2dsZXMgYXBwZWFyIGluIFVJKVxuICBjb250ZXh0LndpdGhDb25maWdTY2hlbWF0aWNzKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBcbiAgLy8gUmVnaXN0ZXIgdGhlIHByb21wdCBwcmVwcm9jZXNzb3IgZm9yIERvY3VtZW50IFJBRyAvIENoYXQgd2l0aCBGaWxlc1xuICBjb250ZXh0LndpdGhQcm9tcHRQcmVwcm9jZXNzb3IocHJlcHJvY2Vzcyk7XG4gIFxuICAvLyBSZWdpc3RlciB0aGUgdG9vbHMgcHJvdmlkZXIgZnVuY3Rpb25cbiAgY29udGV4dC53aXRoVG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcbiAgXG4gIC8vIEhhbmRsZSBwbHVnaW4gdW5sb2FkIC0gY2xlYW51cCBicm93c2VyIHNlc3Npb24gdG8gcHJldmVudCBvcnBoYW5lZCBwcm9jZXNzZXNcbiAgaWYgKHR5cGVvZiBwcm9jZXNzLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJvY2Vzcy5vbignU0lHVEVSTScsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNsZWFudXBCcm93c2VyU2Vzc2lvbigpO1xuICAgIH0pO1xuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNsZWFudXBCcm93c2VyU2Vzc2lvbigpO1xuICAgIH0pO1xuICB9XG4gIFxuICBsb2dnZXIuaW5mbygnSW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5IScpO1xufVxuIiwgImltcG9ydCB7IExNU3R1ZGlvQ2xpZW50LCB0eXBlIFBsdWdpbkNvbnRleHQgfSBmcm9tIFwiQGxtc3R1ZGlvL3Nka1wiO1xuXG5kZWNsYXJlIHZhciBwcm9jZXNzOiBhbnk7XG5cbi8vIFdlIHJlY2VpdmUgcnVudGltZSBpbmZvcm1hdGlvbiBpbiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuY29uc3QgY2xpZW50SWRlbnRpZmllciA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQ0xJRU5UX0lERU5USUZJRVI7XG5jb25zdCBjbGllbnRQYXNza2V5ID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9DTElFTlRfUEFTU0tFWTtcbmNvbnN0IGJhc2VVcmwgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0JBU0VfVVJMO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgTE1TdHVkaW9DbGllbnQoe1xuICBjbGllbnRJZGVudGlmaWVyLFxuICBjbGllbnRQYXNza2V5LFxuICBiYXNlVXJsLFxufSk7XG5cbihnbG9iYWxUaGlzIGFzIGFueSkuX19MTVNfUExVR0lOX0NPTlRFWFQgPSB0cnVlO1xuXG5sZXQgcHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0ID0gZmFsc2U7XG5sZXQgcHJvbXB0UHJlcHJvY2Vzc29yU2V0ID0gZmFsc2U7XG5sZXQgY29uZmlnU2NoZW1hdGljc1NldCA9IGZhbHNlO1xubGV0IGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQgPSBmYWxzZTtcbmxldCB0b29sc1Byb3ZpZGVyU2V0ID0gZmFsc2U7XG5sZXQgZ2VuZXJhdG9yU2V0ID0gZmFsc2U7XG5cbmNvbnN0IHNlbGZSZWdpc3RyYXRpb25Ib3N0ID0gY2xpZW50LnBsdWdpbnMuZ2V0U2VsZlJlZ2lzdHJhdGlvbkhvc3QoKTtcblxuY29uc3QgcGx1Z2luQ29udGV4dDogUGx1Z2luQ29udGV4dCA9IHtcbiAgd2l0aFByZWRpY3Rpb25Mb29wSGFuZGxlcjogKGdlbmVyYXRlKSA9PiB7XG4gICAgaWYgKHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJlZGljdGlvbkxvb3BIYW5kbGVyIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKHRvb2xzUHJvdmlkZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByZWRpY3Rpb25Mb29wSGFuZGxlciBjYW5ub3QgYmUgdXNlZCB3aXRoIGEgdG9vbHMgcHJvdmlkZXJcIik7XG4gICAgfVxuXG4gICAgcHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRQcmVkaWN0aW9uTG9vcEhhbmRsZXIoZ2VuZXJhdGUpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoUHJvbXB0UHJlcHJvY2Vzc29yOiAocHJlcHJvY2VzcykgPT4ge1xuICAgIGlmIChwcm9tcHRQcmVwcm9jZXNzb3JTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByb21wdFByZXByb2Nlc3NvciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIHByb21wdFByZXByb2Nlc3NvclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0UHJvbXB0UHJlcHJvY2Vzc29yKHByZXByb2Nlc3MpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoQ29uZmlnU2NoZW1hdGljczogKGNvbmZpZ1NjaGVtYXRpY3MpID0+IHtcbiAgICBpZiAoY29uZmlnU2NoZW1hdGljc1NldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uZmlnIHNjaGVtYXRpY3MgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBjb25maWdTY2hlbWF0aWNzU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRDb25maWdTY2hlbWF0aWNzKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoR2xvYmFsQ29uZmlnU2NoZW1hdGljczogKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3MpID0+IHtcbiAgICBpZiAoZ2xvYmFsQ29uZmlnU2NoZW1hdGljc1NldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2xvYmFsIGNvbmZpZyBzY2hlbWF0aWNzIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgZ2xvYmFsQ29uZmlnU2NoZW1hdGljc1NldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0R2xvYmFsQ29uZmlnU2NoZW1hdGljcyhnbG9iYWxDb25maWdTY2hlbWF0aWNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aFRvb2xzUHJvdmlkZXI6ICh0b29sc1Byb3ZpZGVyKSA9PiB7XG4gICAgaWYgKHRvb2xzUHJvdmlkZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvb2xzIHByb3ZpZGVyIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVG9vbHMgcHJvdmlkZXIgY2Fubm90IGJlIHVzZWQgd2l0aCBhIHByZWRpY3Rpb25Mb29wSGFuZGxlclwiKTtcbiAgICB9XG5cbiAgICB0b29sc1Byb3ZpZGVyU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRUb29sc1Byb3ZpZGVyKHRvb2xzUHJvdmlkZXIpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoR2VuZXJhdG9yOiAoZ2VuZXJhdG9yKSA9PiB7XG4gICAgaWYgKGdlbmVyYXRvclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG5cbiAgICBnZW5lcmF0b3JTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldEdlbmVyYXRvcihnZW5lcmF0b3IpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxufTtcblxuaW1wb3J0KFwiLi8uLi9zcmMvaW5kZXgudHNcIikudGhlbihhc3luYyBtb2R1bGUgPT4ge1xuICByZXR1cm4gYXdhaXQgbW9kdWxlLm1haW4ocGx1Z2luQ29udGV4dCk7XG59KS50aGVuKCgpID0+IHtcbiAgc2VsZlJlZ2lzdHJhdGlvbkhvc3QuaW5pdENvbXBsZXRlZCgpO1xufSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZXhlY3V0ZSB0aGUgbWFpbiBmdW5jdGlvbiBv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O0FBQ3BDLFFBQUksa0JBQWtCO0FBQ3BCLFlBQU0sSUFBSSxNQUFNLG1DQUFtQztBQUFBLElBQ3JEO0FBQ0EsUUFBSSwwQkFBMEI7QUFDNUIsWUFBTSxJQUFJLE1BQU0sNERBQTREO0FBQUEsSUFDOUU7QUFFQSx1QkFBbUI7QUFDbkIseUJBQXFCLGlCQUFpQkEsY0FBYTtBQUNuRCxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsZUFBZSxDQUFDLGNBQWM7QUFDNUIsUUFBSSxjQUFjO0FBQ2hCLFlBQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUFBLElBQ2hEO0FBRUEsbUJBQWU7QUFDZix5QkFBcUIsYUFBYSxTQUFTO0FBQzNDLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFFQSx3REFBNEIsS0FBSyxPQUFNQyxZQUFVO0FBQy9DLFNBQU8sTUFBTUEsUUFBTyxLQUFLLGFBQWE7QUFDeEMsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUNaLHVCQUFxQixjQUFjO0FBQ3JDLENBQUMsRUFBRSxNQUFNLENBQUMsVUFBVTtBQUNsQixVQUFRLE1BQU0sb0RBQW9EO0FBQ2xFLFVBQVEsTUFBTSxLQUFLO0FBQ3JCLENBQUM7IiwKICAibmFtZXMiOiBbInRvb2wiLCAicGxhdGZvcm0iLCAicGF0aCIsICJmcyIsICJyZXNvbHZlIiwgImZzIiwgInBhdGgiLCAic3Bhd25XaXRoUHJvZ3Jlc3MiLCAicmVzb2x2ZSIsICJydW5Db25maWdBbmFseXNpcyIsICJydW5JbXBvcnRBbmFseXNpcyIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJkZGdTZWFyY2giLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgIm1lc3NhZ2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgInJlc29sdmUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJyZXNvbHZlIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJpbXBvcnRfY2hpbGRfcHJvY2VzcyIsICJoYW5kbGVFcnJvciIsICJwbGF0Zm9ybSIsICJyZXNvbHZlIiwgIm1lc3NhZ2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgIm9zIiwgInBhdGgiLCAiZnMiLCAiaW1wb3J0X2NoaWxkX3Byb2Nlc3MiLCAiZnMiLCAic3RhdCIsICJoYW5kbGVFcnJvciIsICJvcyIsICJwbGF0Zm9ybSIsICJzcGF3biIsICJyZXNvbHZlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJwYXRoIiwgImhvc3RuYW1lIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJjaHVua1RleHQiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgInBhdGgiLCAiZnMiLCAicHVwcGV0ZWVyTW9kdWxlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgInRvb2wiLCAidG9vbCIsICJsb2dnZXIiLCAiaW1wb3J0X3NkayIsICJwcmVwcm9jZXNzIiwgImNvbmZpZ1NjaGVtYXRpY3MiLCAidG9vbHNQcm92aWRlciIsICJtb2R1bGUiXQp9Cg==
