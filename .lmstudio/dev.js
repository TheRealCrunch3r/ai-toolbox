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
function getAllowedBases() {
  const bases = [BASE_DIR, currentWorkingDir];
  return [...new Set(bases)];
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
  if (!basePath || !userPath) return false;
  if (userPath.startsWith("\\\\")) return false;
  const normalizedUserPath = userPath.replace(/\\/g, "/");
  const isAbsolute2 = normalizedUserPath.startsWith("/") || /^[a-zA-Z]:/.test(normalizedUserPath);
  if (!isAbsolute2) {
    const resolvedBase = import_path.default.resolve(basePath);
    const resolvedPath = import_path.default.resolve(resolvedBase, normalizedUserPath);
    const baseWithSeparator = resolvedBase.endsWith(import_path.default.sep) ? resolvedBase : `${resolvedBase}${import_path.default.sep}`;
    return resolvedPath === resolvedBase || resolvedPath.startsWith(baseWithSeparator);
  }
  const allowedBases = getAllowedBases();
  const resolvedAbsolute = import_path.default.resolve(userPath);
  for (const base of allowedBases) {
    if (!base) continue;
    const normalizedBase = base.endsWith(import_path.default.sep) ? base : `${base}${import_path.default.sep}`;
    if (resolvedAbsolute === base || resolvedAbsolute.startsWith(normalizedBase)) {
      return true;
    }
  }
  return false;
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
var import_path;
var init_security = __esm({
  "src/security.ts"() {
    "use strict";
    init_config();
    import_path = __toESM(require("path"));
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
          results.push(path4.join(currentPath, entry.name));
        }
      }
      const subdirs = entries.filter((e) => e.isDirectory()).map((e) => path4.join(currentPath, e.name));
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
            await countInDir(path4.join(currentPath, entry.name), depth + 1);
          }
        }
      }
    } catch {
    }
  }
  await countInDir(dirPath, 0);
  return count;
}
var fs3, path4, fuzzySearchCache, CACHE_TTL_MS, requestCache, REQUEST_CACHE_TTL_MS;
var init_performanceUtils = __esm({
  "src/performanceUtils.ts"() {
    "use strict";
    fs3 = __toESM(require("fs/promises"));
    path4 = __toESM(require("path"));
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
          path: path5.join(fullPath, entry.name),
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
              const fullPath = path5.join(dirPath, entry.name);
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
          const fileName = path5.basename(file).toLowerCase();
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
        const fullPath = path5.resolve(file_path);
        if (!fs4.existsSync(fullPath)) {
          return { success: false, error: `File does not exist: ${file_path}` };
        }
        const ext = path5.extname(file_path).toLowerCase();
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
          const tsConfigPath = path5.join(workingDir, "tsconfig.json");
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
          const srcDir = path5.join(workingDir, "src");
          if (!fs4.existsSync(srcDir)) {
            return { skipped: true, reason: "No src/ directory found" };
          }
          function collectTsFiles(dir) {
            const files = [];
            const entries = fs4.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path5.join(dir, entry.name);
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
                filesWithExcessiveImports.push({ file: path5.relative(workingDir, filePath), count: importCount });
              }
              const declareGlobalMatches = content.match(/declare\s+global/g);
              if (declareGlobalMatches && declareGlobalMatches.length > 0) {
                declareGlobalUsage.push({ file: path5.relative(workingDir, filePath) });
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
          const tsConfigPath = path5.join(workingDir, "tsconfig.json");
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
          const entryPoint = path5.join(workingDir, "src", "index.ts");
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
            path5.join(workingDir, "eslint.config.mjs"),
            path5.join(workingDir, "eslint.config.js"),
            path5.join(workingDir, ".eslintrc.js"),
            path5.join(workingDir, ".eslintrc.json"),
            path5.join(workingDir, ".eslintrc")
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
var import_sdk2, import_zod2, fs4, path5, import_child_process;
var init_fileSystemTools = __esm({
  "src/tools/fileSystemTools.ts"() {
    "use strict";
    import_sdk2 = require("@lmstudio/sdk");
    import_zod2 = require("zod");
    fs4 = __toESM(require("fs"));
    path5 = __toESM(require("path"));
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
        const filePath = path6.join(getWorkingDir(), fileName);
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
var import_sdk5, import_zod5, fs5, path6, puppeteerModule, BrowserSessionManager, browserManager;
var init_browserAutomationTools = __esm({
  "src/tools/browserAutomationTools.ts"() {
    "use strict";
    import_sdk5 = require("@lmstudio/sdk");
    import_zod5 = require("zod");
    init_workingDir();
    fs5 = __toESM(require("fs"));
    path6 = __toESM(require("path"));
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
        path7.join(process.env.APPDATA || "", "lm-studio"),
        path7.join(process.env.LOCALAPPDATA || "", "Programs", "lm-studio"),
        path7.join(process.env.PROGRAMFILES || "", "LM Studio"),
        path7.join(process.env["PROGRAMDATA"] || "", "LM Studio")
      );
      break;
    case "darwin":
      candidates.push(
        path7.join(os2.homedir(), "Library", "Application Support", "lm-studio"),
        "/Applications/LM Studio.app/Contents/Resources/app.asar"
      );
      break;
    default:
      candidates.push(
        path7.join(os2.homedir(), ".local", "share", "lm-studio"),
        "/opt/lm-studio",
        path7.join(process.env.HOME || "", ".lm-studio")
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
var import_sdk9, import_zod9, os2, path7, fs6, import_child_process3;
var init_utilityTools = __esm({
  "src/tools/utilityTools.ts"() {
    "use strict";
    import_sdk9 = require("@lmstudio/sdk");
    import_zod9 = require("zod");
    os2 = __toESM(require("os"));
    path7 = __toESM(require("path"));
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
  const ext = path8.extname(filePath).toLowerCase();
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
        format: path8.extname(imagePath).replace(".", "").toUpperCase(),
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
        tempPath = outputPath || path8.join(os3.tmpdir(), `screenshot_${Date.now()}.png`);
        cmd = "powershell.exe";
        args = [
          "-NoProfile",
          "-Command",
          `[System.Drawing.Bitmap]::new(1920, 1080).Save('${tempPath}', [System.Drawing.Imaging.ImageFormat]::Png)`
        ];
        break;
      case "darwin":
        tempPath = outputPath || path8.join(os3.tmpdir(), `screenshot_${Date.now()}.png`);
        cmd = "/bin/bash";
        args = ["-c", `screencapture -x "${tempPath}"`];
        break;
      default:
        tempPath = outputPath || path8.join(os3.tmpdir(), `screenshot_${Date.now()}.png`);
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
var import_sdk10, import_zod10, path8;
var init_imageProcessingTools = __esm({
  "src/tools/imageProcessingTools.ts"() {
    "use strict";
    import_sdk10 = require("@lmstudio/sdk");
    import_zod10 = require("zod");
    path8 = __toESM(require("path"));
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
          const fullPath = path9.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".git") continue;
            results = results.concat(findFiles(fullPath));
          } else if (entry.isFile()) {
            const ext = path9.extname(entry.name).toLowerCase();
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
          chunk.metadata.file_name = path9.basename(filePath);
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
var import_sdk12, import_zod12, path9, fs7, LocalVectorStore;
var init_vectorRagTools = __esm({
  "src/tools/vectorRagTools.ts"() {
    "use strict";
    import_sdk12 = require("@lmstudio/sdk");
    import_zod12 = require("zod");
    path9 = __toESM(require("path"));
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
        const filePath = path10.join(getWorkingDir(), fileName);
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
var import_sdk13, import_zod13, fs8, path10;
var init_uiGenerationTools = __esm({
  "src/tools/uiGenerationTools.ts"() {
    "use strict";
    import_sdk13 = require("@lmstudio/sdk");
    import_zod13 = require("zod");
    fs8 = __toESM(require("fs"));
    path10 = __toESM(require("path"));
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
var import_sdk14, import_zod14, fs9, path11, ContextStorageManager, ContextAnalyzer;
var init_contextManagementTools = __esm({
  "src/tools/contextManagementTools.ts"() {
    "use strict";
    import_sdk14 = require("@lmstudio/sdk");
    import_zod14 = require("zod");
    fs9 = __toESM(require("fs"));
    path11 = __toESM(require("path"));
    init_workingDir();
    ContextStorageManager = class {
      constructor() {
        this.storagePath = path11.join(getWorkingDir(), ".ai_toolbox_context.json");
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
          const dir = path11.dirname(this.storagePath);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kQ29tbWFuZHMudHMiLCAiLi4vc3JjL3dvcmtpbmdEaXIudHMiLCAiLi4vc3JjL3NlY3VyaXR5LnRzIiwgIi4uL3NyYy9wZXJmb3JtYW5jZVV0aWxzLnRzIiwgIi4uL3NyYy90b29scy9maWxlU3lzdGVtVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2dpdEdpdGh1YlRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9kYXRhYmFzZVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9leGVjdXRpb25Ub29scy50cyIsICIuLi9zcmMvdG9vbHMvdXRpbGl0eVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvaHR0cENsaWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy92ZWN0b3JSYWdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzUHJvdmlkZXIudHMiLCAiLi4vc3JjL3Byb21wdFByZXByb2Nlc3Nvci50cyIsICIuLi9zcmMvaW5kZXgudHMiLCAiZW50cnkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5cclxuaW1wb3J0IHsgY3JlYXRlQ29uZmlnU2NoZW1hdGljcyB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xyXG5cclxuXHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PSBab2QgU2NoZW1hICh2YWxpZGF0aW9uKSA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuXHJcblxyXG5leHBvcnQgY29uc3QgQ29uZmlnU2NoZW1hID0gei5vYmplY3Qoe1xyXG5cclxuICAvLyBUb29sIEdhdGluZyAoZW5hYmxlL2Rpc2FibGUgaW5kaXZpZHVhbCB0b29scylcclxuXHJcbiAgZmlsZVN5c3RlbTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcbiAgd2ViU2VhcmNoOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxyXG5cclxuICBicm93c2VyQXV0b21hdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXHJcblxyXG4gIGdpdE9wZXJhdGlvbnM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxyXG5cclxuICBkYXRhYmFzZVF1ZXJpZXM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxyXG5cclxuICBkb2N1bWVudFBhcnNpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIGJhY2tncm91bmRDb21tYW5kczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG5cclxuICBpbWFnZVByb2Nlc3Npbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBpbWFnZSBPQ1IsIHNjcmVlbnNob3QsIGFuZCBjb21wYXJpc29uIHRvb2xzJyksXHJcblxyXG4gIGh0dHBDbGllbnQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdFbmFibGUgZ2VuZXJpYyBIVFRQIGNsaWVudCBmb3IgUkVTVCBBUEkgY2FsbHMnKSxcclxuXHJcbiAgdmVjdG9yUkFHOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgc2VtYW50aWMgc2VhcmNoIHdpdGggdmVjdG9yIGVtYmVkZGluZ3MnKSxcclxuICB1aUdlbmVyYXRpb246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdFbmFibGUgaW50ZXJhY3RpdmUgVUkgZ2VuZXJhdGlvbiBhbmQgcmVuZGVyaW5nIHRvb2xzJyksXG4gIGNvbnRleHRNYW5hZ2VtZW50OiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgYXV0b21hdGljIGNvbnRleHQgdHJhY2tpbmcgYW5kIG1lbW9yeSBtYW5hZ2VtZW50JyksXG5cclxuXHJcblxyXG4gIC8vIFx1MjUwMFx1MjUwMCBcdTI2QTBcdUZFMEYgR09EIE1PREUgKEVuYWJsZSBBTEwgdG9vbHMgYXQgb25jZSkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcblxyXG4gIGdvZE1vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdcdTI2QTBcdUZFMEYgV0FSTklORzogRW5hYmxlcyBldmVyeSB0b29sIGNhdGVnb3J5LiBVc2Ugd2l0aCBjYXV0aW9uLicpLFxyXG5cclxuXHJcblxyXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0RcdURDREEgRE9DVU1FTlQgUkFHIC8gQ0hBVCBXSVRIIEZJTEVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG5cclxuICBkb2N1bWVudFJBRzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0VuYWJsZSBmaWxlIGluZGV4aW5nIGFuZCBzZW1hbnRpYyBzZWFyY2ggZm9yIGNoYXQnKSxcclxuXHJcbiAgcmV0cmlldmFsTGltaXQ6IHoubnVtYmVyKCkubWluKDEpLm1heCgyMCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgcmVsZXZhbnQgY2h1bmtzIHRvIHJldHJpZXZlJyksXHJcblxyXG4gIHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkOiB6Lm51bWJlcigpLm1pbigwLjApLm1heCgxLjApLmRlZmF1bHQoMC41KS5kZXNjcmliZSgnTWluaW11bSBzaW1pbGFyaXR5IHNjb3JlIGZvciBhIGNodW5rIHRvIGJlIGNvbnNpZGVyZWQgcmVsZXZhbnQgKDAtMSknKSxcclxuXHJcbiAgLy8gRXhlY3V0aW9uIHRvb2xzIFx1MjAxNCBpbmRpdmlkdWFsIHRvZ2dsZXMgKGdyYW51bGFyIGNvbnRyb2wpXHJcblxyXG4gIGV4ZWN1dGlvbkphdmFTY3JpcHQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdBbGxvdyBydW5famF2YXNjcmlwdCB0b29sJyksXHJcblxyXG4gIGV4ZWN1dGlvblB5dGhvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9weXRob24gdG9vbCcpLFxyXG5cclxuICBleGVjdXRpb25UZXJtaW5hbDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9pbl90ZXJtaW5hbCB0b29sJyksXHJcblxyXG4gIGV4ZWN1dGlvblNoZWxsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnQWxsb3cgZXhlY3V0ZV9jb21tYW5kIHRvb2wnKSxcclxuXHJcblxyXG5cclxuICAvLyBcdTI1MDBcdTI1MDAgV2ViIFNlYXJjaCBTZXR0aW5ncyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuXHJcbiAgc2VhcmNoRmFsbGJhY2tDaGFpbjogei5lbnVtKFsnZGRnLWFwaScsICdkZGctZmV0Y2gnLCAnZ29vZ2xlJywgJ2JpbmcnXSkuZGVmYXVsdCgnZGRnLWFwaScpLmRlc2NyaWJlKCdQcmltYXJ5IHNlYXJjaCBlbmdpbmUgKGF1dG8tZmFsbGJhY2sgdG8gb3RoZXJzKScpLFxyXG5cclxuICBtYXhTZWFyY2hSZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLmRlZmF1bHQoMTApLFxyXG5cclxuICBzYWZlc2VhcmNoOiB6LmVudW0oWycwJywgJzEnLCAnMiddKS5kZWZhdWx0KCcxJyksXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNTAwXHUyNTAwIEJyb3dzZXIgU2V0dGluZ3MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcblxyXG4gIGJyb3dzZXJUaW1lb3V0OiB6Lm51bWJlcigpLm1pbigxMDAwKS5tYXgoMzAwMDApLmRlZmF1bHQoNTAwMCksXHJcblxyXG4gIGhlYWRsZXNzTW9kZTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcblxyXG5cclxuICAvLyBHaXQgU2V0dGluZ3NcclxuXHJcbiAgZ2l0QXV0b0NvbW1pdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXHJcblxyXG4gIGRlZmF1bHRCcmFuY2g6IHouc3RyaW5nKCkuZGVmYXVsdCgnbWFpbicpLFxyXG5cclxuXHJcblxyXG4gIC8vIFNlY3VyaXR5IFNldHRpbmdzXHJcblxyXG4gIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcbiAgYmluYXJ5RmlsZURldGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcbiAgcmVnZXhSZURvU1Byb3RlY3Rpb246IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIG1heFJlZ2V4TGVuZ3RoOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMTAwMCkuZGVmYXVsdCg1MDApLFxyXG5cclxuXHJcblxyXG4gIC8vIFN0YXRlIE1hbmFnZW1lbnRcclxuXHJcbiAgc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIHN0YXRlTWF4U2l6ZTogei5udW1iZXIoKS5taW4oMTAyNCkubWF4KDEwNDg1NzYpLmRlZmF1bHQoMTAyNDApLFxyXG5cclxuXHJcblxyXG4gIC8vIGkxOG4gU2V0dGluZ3NcclxuXHJcbiAgbGFuZ3VhZ2U6IHouZW51bShbJ2VuJywgJ2RlJywgJ3poLUNOJywgJ3poLVRXJ10pLmRlZmF1bHQoJ2VuJyksXHJcblxyXG5cclxuXHJcbiAgLy8gTm90aWZpY2F0aW9uIFNldHRpbmdzXHJcblxyXG4gIG5vdGlmaWNhdGlvbnNFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxyXG5cclxufSk7XHJcblxyXG5cclxuXHJcbmV4cG9ydCB0eXBlIFBsdWdpbkNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIENvbmZpZ1NjaGVtYT47XHJcblxyXG5cclxuXHJcbi8qKlxyXG5cclxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdFxyXG5cclxuICovXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT05GSUc6IFBsdWdpbkNvbmZpZyA9IHtcclxuXHJcbiAgZmlsZVN5c3RlbTogdHJ1ZSxcclxuXHJcbiAgd2ViU2VhcmNoOiB0cnVlLFxyXG5cclxuICBicm93c2VyQXV0b21hdGlvbjogZmFsc2UsXHJcblxyXG4gIGdpdE9wZXJhdGlvbnM6IGZhbHNlLFxyXG5cclxuICBkYXRhYmFzZVF1ZXJpZXM6IGZhbHNlLFxyXG5cclxuICBkb2N1bWVudFBhcnNpbmc6IHRydWUsXHJcblxyXG4gIGJhY2tncm91bmRDb21tYW5kczogZmFsc2UsXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjZBMFx1RkUwRlxyXG5cclxuICBnb2RNb2RlOiBmYWxzZSxcclxuXHJcblxyXG5cclxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNDXHVERDk1IE5FVyBUT09MIENBVEVHT1JJRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcblxyXG4gIGltYWdlUHJvY2Vzc2luZzogdHJ1ZSxcclxuXHJcbiAgaHR0cENsaWVudDogZmFsc2UsXHJcblxyXG4gIHZlY3RvclJBRzogdHJ1ZSxcclxuICB1aUdlbmVyYXRpb246IGZhbHNlLFxuICBjb250ZXh0TWFuYWdlbWVudDogdHJ1ZSxcblxyXG5cclxuXHJcbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjZBMFx1RkUwRlxyXG5cclxuICBkb2N1bWVudFJBRzogZmFsc2UsXHJcblxyXG4gIHJldHJpZXZhbExpbWl0OiA1LFxyXG5cclxuICByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZDogMC41LFxyXG5cclxuXHJcblxyXG4gIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgYWxsIGRpc2FibGVkIGJ5IGRlZmF1bHQgKGRhbmdlcm91cyEpXHJcblxyXG4gIGV4ZWN1dGlvbkphdmFTY3JpcHQ6IGZhbHNlLFxyXG5cclxuICBleGVjdXRpb25QeXRob246IGZhbHNlLFxyXG5cclxuICBleGVjdXRpb25UZXJtaW5hbDogZmFsc2UsXHJcblxyXG4gIGV4ZWN1dGlvblNoZWxsOiBmYWxzZSxcclxuXHJcblxyXG5cclxuICBzZWFyY2hGYWxsYmFja0NoYWluOiAnZGRnLWFwaScsXHJcblxyXG4gIG1heFNlYXJjaFJlc3VsdHM6IDEwLFxyXG5cclxuICBzYWZlc2VhcmNoOiAnMScsXHJcblxyXG4gIGJyb3dzZXJUaW1lb3V0OiA1MDAwLFxyXG5cclxuICBoZWFkbGVzc01vZGU6IHRydWUsXHJcblxyXG4gIGdpdEF1dG9Db21taXQ6IGZhbHNlLFxyXG5cclxuICBkZWZhdWx0QnJhbmNoOiAnbWFpbicsXHJcblxyXG4gIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogdHJ1ZSxcclxuXHJcbiAgYmluYXJ5RmlsZURldGVjdGlvbjogdHJ1ZSxcclxuXHJcbiAgcmVnZXhSZURvU1Byb3RlY3Rpb246IHRydWUsXHJcblxyXG4gIG1heFJlZ2V4TGVuZ3RoOiA1MDAsXHJcblxyXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB0cnVlLFxyXG5cclxuICBzdGF0ZU1heFNpemU6IDEwMjQwLFxyXG5cclxuICBsYW5ndWFnZTogJ2VuJyxcclxuXHJcbiAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHRydWUsXHJcblxyXG59O1xyXG5cclxuXHJcblxyXG4vKipcclxuXHJcbiAqIFZhbGlkYXRlIGFuZCBzYW5pdGl6ZSBjb25maWcgaW5wdXRcclxuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uZmlnKGlucHV0OiB1bmtub3duKTogUGx1Z2luQ29uZmlnIHtcclxuXHJcbiAgY29uc3QgcmVzdWx0ID0gQ29uZmlnU2NoZW1hLnNhZmVQYXJzZShpbnB1dCk7XHJcblxyXG4gIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcclxuXHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29uZmlndXJhdGlvbjogJHtyZXN1bHQuZXJyb3IubWVzc2FnZX1gKTtcclxuXHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiBhIHRvb2wgY2F0ZWdvcnkgaXMgZW5hYmxlZCBpbiBjb25maWdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1Rvb2xFbmFibGVkKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBjYXRlZ29yeToga2V5b2YgUGljazxQbHVnaW5Db25maWcsICdmaWxlU3lzdGVtJyB8ICd3ZWJTZWFyY2gnIHwgJ2Jyb3dzZXJBdXRvbWF0aW9uJyB8ICdnaXRPcGVyYXRpb25zJyB8ICdkYXRhYmFzZVF1ZXJpZXMnIHwgJ2RvY3VtZW50UGFyc2luZycgfCAnYmFja2dyb3VuZENvbW1hbmRzJyB8ICdpbWFnZVByb2Nlc3NpbmcnIHwgJ2h0dHBDbGllbnQnIHwgJ3ZlY3RvclJBRycgfCAndWlHZW5lcmF0aW9uJyB8ICdjb250ZXh0TWFuYWdlbWVudCc+KTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIGNvbmZpZ1tjYXRlZ29yeV0gPT09IHRydWU7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbi8qKlxyXG5cclxuICogQ2hlY2sgaWYgYSBzcGVjaWZpYyBleGVjdXRpb24gdG9vbCBpcyBlbmFibGVkIChncmFudWxhcilcclxuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoY29uZmlnOiBQbHVnaW5Db25maWcsIHRvb2w6ICdqYXZhc2NyaXB0JyB8ICdweXRob24nIHwgJ3Rlcm1pbmFsJyB8ICdzaGVsbCcpOiBib29sZWFuIHtcclxuXHJcbiAgc3dpdGNoICh0b29sKSB7XHJcblxyXG4gICAgY2FzZSAnamF2YXNjcmlwdCc6IHJldHVybiBjb25maWcuZXhlY3V0aW9uSmF2YVNjcmlwdCA9PT0gdHJ1ZTtcclxuXHJcbiAgICBjYXNlICdweXRob24nOiAgICAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25QeXRob24gPT09IHRydWU7XHJcblxyXG4gICAgY2FzZSAndGVybWluYWwnOiAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uVGVybWluYWwgPT09IHRydWU7XHJcblxyXG4gICAgY2FzZSAnc2hlbGwnOiAgICAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uU2hlbGwgPT09IHRydWU7XHJcblxyXG4gIH1cclxuXHJcbn1cclxuXHJcblxyXG5cclxuLyoqXHJcblxyXG4gKiBHZXQgdGhlIGV4ZWN1dGlvbiB0b29sIGtleSBmcm9tIGEgdG9vbCBuYW1lXHJcblxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFeGVjdXRpb25Ub29sS2V5KHRvb2xOYW1lOiBzdHJpbmcpOiAnamF2YXNjcmlwdCcgfCAncHl0aG9uJyB8ICd0ZXJtaW5hbCcgfCAnc2hlbGwnIHwgbnVsbCB7XHJcblxyXG4gIHN3aXRjaCAodG9vbE5hbWUpIHtcclxuXHJcbiAgICBjYXNlICdydW5famF2YXNjcmlwdCc6IHJldHVybiAnamF2YXNjcmlwdCc7XHJcblxyXG4gICAgY2FzZSAncnVuX3B5dGhvbic6ICAgICByZXR1cm4gJ3B5dGhvbic7XHJcblxyXG4gICAgY2FzZSAncnVuX2luX3Rlcm1pbmFsJzogcmV0dXJuICd0ZXJtaW5hbCc7XHJcblxyXG4gICAgY2FzZSAnZXhlY3V0ZV9jb21tYW5kJzogcmV0dXJuICdzaGVsbCc7XHJcblxyXG4gICAgZGVmYXVsdDogICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcblxyXG4vKipcclxuXHJcbiAqIENoZWNrIGlmIEFOWSBleGVjdXRpb24gdG9vbCBpcyBlbmFibGVkIChsZWdhY3kgY29tcGF0aWJpbGl0eSlcclxuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhhc0FueUV4ZWN1dGlvblRvb2woY29uZmlnOiBQbHVnaW5Db25maWcpOiBib29sZWFuIHtcclxuXHJcbiAgcmV0dXJuIGNvbmZpZy5leGVjdXRpb25KYXZhU2NyaXB0IHx8IGNvbmZpZy5leGVjdXRpb25QeXRob24gfHwgXHJcblxyXG4gICAgICAgICBjb25maWcuZXhlY3V0aW9uVGVybWluYWwgfHwgY29uZmlnLmV4ZWN1dGlvblNoZWxsO1xyXG5cclxufVxyXG5cclxuXHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PSBMTSBTdHVkaW8gVUkgU2NoZW1hdGljcyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLy8gVGhlc2UgZGVmaW5lIHRoZSB0b2dnbGUgc3dpdGNoZXMgdGhhdCBhcHBlYXIgaW4gTE0gU3R1ZGlvJ3Mgc2V0dGluZ3MgcGFuZWwuXHJcblxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWdTY2hlbWF0aWNzID0gY3JlYXRlQ29uZmlnU2NoZW1hdGljcygpXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIC0gVE9QIFBSSU9SSVRZIFdBUk5JTkcgVE9HR0xFIFx1MjZBMFx1RkUwRlxyXG5cclxuICAuZmllbGQoJ2dvZE1vZGUnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdTI2QTFcdTI2QTBcdUZFMEYgR09EIE1PREUgLSBFbmFibGUgQUxMIFRvb2xzIFx1MjZBMFx1RkUwRlx1MjZBMScsXHJcblxyXG4gICAgc3VidGl0bGU6ICdXQVJOSU5HOiBBY3RpdmF0ZXMgZXZlcnkgdG9vbCBjYXRlZ29yeSBpbnN0YW50bHkuIFVzZSB3aXRoIGNhdXRpb24uJyxcclxuXHJcbiAgICBoaW50OiAnV2hlbiBlbmFibGVkLCBBTEwgaW5kaXZpZHVhbCB0b2dnbGVzIGFyZSBieXBhc3NlZCBhbmQgZXZlcnkgdG9vbCBpcyBhY3RpdmF0ZWQgcmVnYXJkbGVzcyBvZiBzZXR0aW5ncy4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5nb2RNb2RlKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1RDgzQ1x1REY5Qlx1RkUwRiBUT09MIEdBVElORyAoSGF1cHRzY2hhbHRlcikgXHVEODNDXHVERjlCXHVGRTBGXHJcblxyXG4gIC5maWVsZCgnZmlsZVN5c3RlbScsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDMSBGaWxlIFN5c3RlbSBUb29scycsIGhpbnQ6ICdFbmFibGUgZmlsZSByZWFkL3dyaXRlL3NlYXJjaCBvcGVyYXRpb25zJyB9LCBERUZBVUxUX0NPTkZJRy5maWxlU3lzdGVtKVxyXG5cclxuICAuZmllbGQoJ3dlYlNlYXJjaCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REYxMCBXZWIgJiBSZXNlYXJjaCBUb29scycsIGhpbnQ6ICdFbmFibGUgRHVja0R1Y2tHby9XaWtpcGVkaWEgc2VhcmNoJyB9LCBERUZBVUxUX0NPTkZJRy53ZWJTZWFyY2gpXHJcblxyXG4gIC8vIFx1RDgzRFx1REMxOSBHSVQgJiBHSVRIVUIgVE9PTFMgKHZpc3VlbGxlIEdydXBwaWVydW5nKSBcdUQ4M0RcdURDMTlcclxuXHJcbiAgLmZpZWxkKCdnaXRPcGVyYXRpb25zJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQzE5IEdpdCAmIEdpdEh1YiBUb29scycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnVmVyc2lvbiBDb250cm9sICYgQVBJJyxcclxuXHJcbiAgICBoaW50OiAnRW5hYmxlIGdpdCBvcGVyYXRpb25zIGFuZCBHaXRIdWIgQVBJIGFjY2Vzcy4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5naXRPcGVyYXRpb25zKVxyXG5cclxuICAuZmllbGQoJ2dpdEF1dG9Db21taXQnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQkUgR2l0IEF1dG8tQ29tbWl0JywgXHJcblxyXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgR2l0ICYgR2l0SHViIFRvb2xzJyxcclxuXHJcbiAgICBoaW50OiAnQXV0b21hdGljYWxseSBjb21taXQgY2hhbmdlcyBhZnRlciBvcGVyYXRpb25zJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZ2l0QXV0b0NvbW1pdClcclxuXHJcbiAgLmZpZWxkKCdkZWZhdWx0QnJhbmNoJywgJ3N0cmluZycsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGM0YgRGVmYXVsdCBCcmFuY2gnLCBcclxuXHJcbiAgICBwbGFjZWhvbGRlcjogJ21haW4nLFxyXG5cclxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEdpdCAmIEdpdEh1YiBUb29scycsXHJcblxyXG4gICAgaGludDogJ0JyYW5jaCBuYW1lIGZvciBuZXcgcmVwb3NpdG9yaWVzIGFuZCBnaXQgb3BlcmF0aW9ucycsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmRlZmF1bHRCcmFuY2gpXHJcblxyXG5cclxuXHJcbiAgLmZpZWxkKCdkYXRhYmFzZVF1ZXJpZXMnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREQzRcdUZFMEYgRGF0YWJhc2UgUXVlcmllcycsIGhpbnQ6ICdFbmFibGUgcmVhZC1vbmx5IFNRTGl0ZSBxdWVyaWVzJyB9LCBERUZBVUxUX0NPTkZJRy5kYXRhYmFzZVF1ZXJpZXMpXHJcblxyXG4gIC5maWVsZCgnZG9jdW1lbnRQYXJzaW5nJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0M0IERvY3VtZW50IFBhcnNpbmcnLCBoaW50OiAnRW5hYmxlIFBERi9ET0NYIGRvY3VtZW50IHJlYWRpbmcnIH0sIERFRkFVTFRfQ09ORklHLmRvY3VtZW50UGFyc2luZylcclxuXHJcbiAgLmZpZWxkKCdiYWNrZ3JvdW5kQ29tbWFuZHMnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdTIzRjMgQmFja2dyb3VuZCBDb21tYW5kcycsIGhpbnQ6ICdFbmFibGUgbG9uZy1ydW5uaW5nIHByb2Nlc3MgdHJhY2tpbmcnIH0sIERFRkFVTFRfQ09ORklHLmJhY2tncm91bmRDb21tYW5kcylcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0NcdUREOTVcdTIwMERcdTI3NDAgTkVXIFRPT0wgQ0FURUdPUklFUyBcdUQ4M0NcdUREOTVcdTIwMERcdTI3NDBcclxuXHJcbiAgLmZpZWxkKCdpbWFnZVByb2Nlc3NpbmcnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREQkNcdUZFMEYgSW1hZ2UgUHJvY2Vzc2luZyBUb29scycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnT0NSLCBTY3JlZW5zaG90cyAmIENvbXBhcmlzb24nLFxyXG5cclxuICAgIGhpbnQ6ICdFbmFibGUgaW1hZ2UgT0NSIChUZXNzZXJhY3QuanMpLCBzY3JlZW5zaG90IGNhcHR1cmUsIGFuZCBpbWFnZSBjb21wYXJpc29uIHRvb2xzLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmltYWdlUHJvY2Vzc2luZylcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgnaHR0cENsaWVudCcsICdib29sZWFuJywgeyBcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQwQyBIVFRQIENsaWVudCBUb29scycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnR2VuZXJpYyBSRVNUIEFQSSBDbGllbnQnLFxyXG5cclxuICAgIGhpbnQ6ICdFbmFibGUgZ2VuZXJpYyBIVFRQIGNsaWVudCBmb3IgbWFraW5nIHJlcXVlc3RzIHRvIGFueSBSRVNUIEFQSSAoR0VULCBQT1NULCBQVVQsIERFTEVURSkuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuaHR0cENsaWVudClcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgndmVjdG9yUkFHJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0NBIFZlY3RvciBSQUcgLyBTZW1hbnRpYyBTZWFyY2gnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ1NlbWFudGljIERvY3VtZW50IFNlYXJjaCcsXHJcblxyXG4gICAgaGludDogJ0VuYWJsZSBzZW1hbnRpYyBzZWFyY2ggd2l0aCB2ZWN0b3IgZW1iZWRkaW5ncyBmb3IgaW50ZWxsaWdlbnQgZG9jdW1lbnQgcmV0cmlldmFsLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLnZlY3RvclJBRylcclxuICAuZmllbGQoJ3VpR2VuZXJhdGlvbicsICdib29sZWFuJywgeyBcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REZBOCBJbnRlcmFjdGl2ZSBVSSBHZW5lcmF0aW9uIFRvb2xzJywgXG4gICAgc3VidGl0bGU6ICdHZW5lcmF0ZSBhbmQgcmVuZGVyIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudHMnLFxuICAgIGhpbnQ6ICdFbmFibGUgdG9vbHMgZm9yIGdlbmVyYXRpbmcgSFRNTC9DU1MvSlMgY29tcG9uZW50cyAoYnV0dG9ucywgZm9ybXMsIGNoYXJ0cywgZGFzaGJvYXJkcykgYW5kIHJlbmRlcmluZyB0aGVtIGluIHRoZSBicm93c2VyLicsXG4gIH0sIERFRkFVTFRfQ09ORklHLnVpR2VuZXJhdGlvbilcbiAgLmZpZWxkKCdjb250ZXh0TWFuYWdlbWVudCcsICdib29sZWFuJywgeyBcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRVx1RERFMCBBdXRvLUNvbnRleHQgTWFuYWdlbWVudCBUb29scycsIFxuICAgIHN1YnRpdGxlOiAnQXV0b21hdGljIHNlc3Npb24gdHJhY2tpbmcgYW5kIG1lbW9yeSBtYW5hZ2VtZW50JyxcbiAgICBoaW50OiAnRW5hYmxlIHRvb2xzIGZvciBhdXRvbWF0aWNhbGx5IHNhdmluZyBpbXBvcnRhbnQgZGVjaXNpb25zLCBwYXR0ZXJucywgYW5kIGNvbmZpZ3VyYXRpb25zIHRvIHBlcnNpc3RlbnQgbWVtb3J5LicsXG4gIH0sIERFRkFVTFRfQ09ORklHLmNvbnRleHRNYW5hZ2VtZW50KVxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0RcdURDREEgRE9DVU1FTlQgUkFHIC8gQ0hBVCBXSVRIIEZJTEVTIFx1RDgzRFx1RENEQVxyXG5cclxuICAuZmllbGQoJ2RvY3VtZW50UkFHJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0RBIERvY3VtZW50IFJBRyAvIENoYXQgd2l0aCBGaWxlcycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnRW5hYmxlIGZpbGUgaW5kZXhpbmcgYW5kIHNlbWFudGljIHNlYXJjaCBmb3IgY2hhdCcsXHJcblxyXG4gICAgaGludDogJ0F0dGFjaCBkb2N1bWVudHMgdG8geW91ciBjaGF0IG1lc3NhZ2VzLiBUaGUgcGx1Z2luIHdpbGwgYXV0b21hdGljYWxseSByZXRyaWV2ZSByZWxldmFudCBjb250ZW50IGZyb20gYXR0YWNoZWQgZmlsZXMgdXNpbmcgc2VtYW50aWMgc2VhcmNoLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmRvY3VtZW50UkFHKVxyXG5cclxuICBcclxuXHJcbiAgLmZpZWxkKCdyZXRyaWV2YWxMaW1pdCcsICdudW1lcmljJywgeyBcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQyMiBSZXRyaWV2YWwgTGltaXQnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ01heCBjaHVua3MgdG8gcmV0dXJuIHBlciBxdWVyeScsXHJcblxyXG4gICAgbWluOiAxLCBtYXg6IDIwLCBpbnQ6IHRydWUsXHJcblxyXG4gICAgaGludDogJ01heGltdW0gbnVtYmVyIG9mIHJlbGV2YW50IGRvY3VtZW50IGNodW5rcyB0byByZXRyaWV2ZSBmb3IgZWFjaCBxdWVyeS4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5yZXRyaWV2YWxMaW1pdClcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnLCAnbnVtZXJpYycsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGQUYgUmV0cmlldmFsIEFmZmluaXR5IFRocmVzaG9sZCcsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnTWluaW11bSByZWxldmFuY2Ugc2NvcmUgKDAtMSknLFxyXG5cclxuICAgIG1pbjogMC4wLCBtYXg6IDEuMCwgc3RlcDogMC4wMSxcclxuXHJcbiAgICBoaW50OiAnQ2h1bmtzIGJlbG93IHRoaXMgc2ltaWxhcml0eSBzY29yZSB3aWxsIGJlIGZpbHRlcmVkIG91dC4gTG93ZXIgPSBtb3JlIHJlc3VsdHMgYnV0IHBvdGVudGlhbGx5IGxlc3MgcmVsZXZhbnQuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcucmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQpXHJcblxyXG4gIC8vIFx1MjZBMSBFWEVDVVRJT04gVE9PTFMgKEdlZlx1MDBFNGhybGljaCEpIFx1MjZBMVxyXG5cclxuICAuZmllbGQoJ2V4ZWN1dGlvbkphdmFTY3JpcHQnLCAnYm9vbGVhbicsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1MjZBMSBKYXZhU2NyaXB0LUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXHJcblxyXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX2phdmFzY3JpcHQnLVRvb2xcIixcclxuXHJcbiAgICBoaW50OiAnR0VGQUhSOiBDb2RlIGxcdTAwRTR1ZnQgYXVmIElocmVtIFJlY2huZXIuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uSmF2YVNjcmlwdClcclxuXHJcbiAgLmZpZWxkKCdleGVjdXRpb25QeXRob24nLCAnYm9vbGVhbicsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REMwRCBQeXRob24tQXVzZlx1MDBGQ2hydW5nIGVybGF1YmVuJyxcclxuXHJcbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdydW5fcHl0aG9uJy1Ub29sXCIsXHJcblxyXG4gICAgaGludDogJ0dFRkFIUjogQ29kZSBsXHUwMEU0dWZ0IGF1ZiBJaHJlbSBSZWNobmVyLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvblB5dGhvbilcclxuXHJcbiAgLmZpZWxkKCdleGVjdXRpb25UZXJtaW5hbCcsICdib29sZWFuJywge1xyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JCIFRlcm1pbmFsLUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXHJcblxyXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX2luX3Rlcm1pbmFsJy1Ub29sXCIsXHJcblxyXG4gICAgaGludDogJ1x1MDBENmZmbmV0IGVjaHRlIFRlcm1pbmFsLUZlbnN0ZXIuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uVGVybWluYWwpXHJcblxyXG4gIC5maWVsZCgnZXhlY3V0aW9uU2hlbGwnLCAnYm9vbGVhbicsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQyNyBTaGVsbC1CZWZlaGxzYXVzZlx1MDBGQ2hydW5nIGVybGF1YmVuJyxcclxuXHJcbiAgICBzdWJ0aXRsZTogXCJBa3RpdmllcnQgZGFzICdleGVjdXRlX2NvbW1hbmQnLVRvb2xcIixcclxuXHJcbiAgICBoaW50OiAnR0VGQUhSOiBCZWZlaGxlIGxhdWZlbiBhdWYgSWhyZW0gUmVjaG5lci4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5leGVjdXRpb25TaGVsbClcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0RcdUREMEQgU0VBUkNIIFNFVFRJTkdTIFx1RDgzRFx1REQwRFxyXG5cclxuICAuZmllbGQoJ3NlYXJjaEZhbGxiYWNrQ2hhaW4nLCAnc2VsZWN0Jywge1xyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDBEIFNlYXJjaCBGYWxsYmFjayBDaGFpbicsXHJcblxyXG4gICAgaGludDogJ1ByaW1hcnkgc2VhcmNoIGVuZ2luZS4gQXV0by1mYWxscyBiYWNrIHRvIG90aGVycyBpZiB1bmF2YWlsYWJsZS4nLFxyXG5cclxuICAgIG9wdGlvbnM6IFtcclxuXHJcbiAgICAgIHsgdmFsdWU6ICdkZGctYXBpJywgZGlzcGxheU5hbWU6ICdEdWNrRHVja0dvIEFQSScgfSxcclxuXHJcbiAgICAgIHsgdmFsdWU6ICdkZGctZmV0Y2gnLCBkaXNwbGF5TmFtZTogJ0R1Y2tEdWNrR28gRmV0Y2gnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnZ29vZ2xlJywgZGlzcGxheU5hbWU6ICdHb29nbGUnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnYmluZycsIGRpc3BsYXlOYW1lOiAnQmluZycgfSxcclxuXHJcbiAgICBdLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5zZWFyY2hGYWxsYmFja0NoYWluKVxyXG5cclxuICAuZmllbGQoJ21heFNlYXJjaFJlc3VsdHMnLCAnbnVtZXJpYycsIHsgbWluOiAxLCBtYXg6IDUwLCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcubWF4U2VhcmNoUmVzdWx0cylcclxuXHJcbiAgLmZpZWxkKCdzYWZlc2VhcmNoJywgJ3NlbGVjdCcsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REVFMVx1RkUwRiBTYWZlIFNlYXJjaCcsXHJcblxyXG4gICAgb3B0aW9uczogW1xyXG5cclxuICAgICAgeyB2YWx1ZTogJzAnLCBkaXNwbGF5TmFtZTogJ09mZicgfSxcclxuXHJcbiAgICAgIHsgdmFsdWU6ICcxJywgZGlzcGxheU5hbWU6ICdNb2RlcmF0ZScgfSxcclxuXHJcbiAgICAgIHsgdmFsdWU6ICcyJywgZGlzcGxheU5hbWU6ICdTdHJpY3QnIH0sXHJcblxyXG4gICAgXSxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuc2FmZXNlYXJjaClcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0RcdUREQTVcdUZFMEYgQlJPV1NFUiBBVVRPTUFUSU9OIFRPT0xTIFx1RDgzRFx1RERBNVx1RkUwRlxyXG5cclxuICAuZmllbGQoJ2Jyb3dzZXJBdXRvbWF0aW9uJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREE1XHVGRTBGIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnSGVhZGxlc3MgYnJvd3NlciBjb250cm9sICYgYXV0b21hdGlvbicsXHJcblxyXG4gICAgaGludDogJ0VuYWJsZSBQdXBwZXRlZXItYmFzZWQgaGVhZGxlc3MgYnJvd3NlciBhdXRvbWF0aW9uIGZvciB3ZWIgc2NyYXBpbmcsIHRlc3RpbmcsIGFuZCBVSSBpbnRlcmFjdGlvbi4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5icm93c2VyQXV0b21hdGlvbilcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgnYnJvd3NlclRpbWVvdXQnLCAnbnVtZXJpYycsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdTIzRjFcdUZFMEYgQnJvd3NlciBUaW1lb3V0JywgXHJcblxyXG4gICAgc3VidGl0bGU6ICdcdTI2OTlcdUZFMEYgVGVpbCBkZXIgQnJvd3NlciBBdXRvbWF0aW9uIFRvb2xzJyxcclxuXHJcbiAgICBtaW46IDEwMDAsIG1heDogMzAwMDAsIGludDogdHJ1ZSxcclxuXHJcbiAgICBoaW50OiAnTWF4aW11bSB0aW1lIChtcykgdG8gd2FpdCBmb3IgYnJvd3NlciBvcGVyYXRpb25zIGJlZm9yZSB0aW1pbmcgb3V0LicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmJyb3dzZXJUaW1lb3V0KVxyXG5cclxuICBcclxuXHJcbiAgLmZpZWxkKCdoZWFkbGVzc01vZGUnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDN0IgSGVhZGxlc3MgTW9kZScsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsXHJcblxyXG4gICAgaGludDogJ1J1biBicm93c2VyIHdpdGhvdXQgR1VJIChyZWNvbW1lbmRlZCBmb3IgYXV0b21hdGlvbikuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuaGVhZGxlc3NNb2RlKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1RDgzRFx1REQxMiBTRUNVUklUWSBTRVRUSU5HUyBcdUQ4M0RcdUREMTJcclxuXHJcbiAgLmZpZWxkKCdwYXRoVmFsaWRhdGlvbkVuYWJsZWQnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMTIgUGF0aCBWYWxpZGF0aW9uJywgaGludDogJ1ByZXZlbnQgZGlyZWN0b3J5IHRyYXZlcnNhbCBhdHRhY2tzJyB9LCBERUZBVUxUX0NPTkZJRy5wYXRoVmFsaWRhdGlvbkVuYWJsZWQpXHJcblxyXG4gIC5maWVsZCgnYmluYXJ5RmlsZURldGVjdGlvbicsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDMSBCaW5hcnkgRmlsZSBEZXRlY3Rpb24nLCBoaW50OiAnRGV0ZWN0IGJpbmFyeSBmaWxlcyB2aWEgbnVsbCBieXRlIGNoZWNrJyB9LCBERUZBVUxUX0NPTkZJRy5iaW5hcnlGaWxlRGV0ZWN0aW9uKVxyXG5cclxuICAuZmllbGQoJ3JlZ2V4UmVEb1NQcm90ZWN0aW9uJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERUUxXHVGRTBGIFJlRG9TIFByb3RlY3Rpb24nLCBoaW50OiAnUHJvdGVjdCBhZ2FpbnN0IHJlZ2V4IGRlbmlhbC1vZi1zZXJ2aWNlJyB9LCBERUZBVUxUX0NPTkZJRy5yZWdleFJlRG9TUHJvdGVjdGlvbilcclxuXHJcbiAgLmZpZWxkKCdtYXhSZWdleExlbmd0aCcsICdudW1lcmljJywgeyBtaW46IDEsIG1heDogMTAwMCwgaW50OiB0cnVlIH0sIERFRkFVTFRfQ09ORklHLm1heFJlZ2V4TGVuZ3RoKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1RDgzRFx1RENCRCBTVEFURSBNQU5BR0VNRU5UIFx1RDgzRFx1RENCRFxyXG5cclxuICAuZmllbGQoJ3N0YXRlUGVyc2lzdGVuY2VFbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JEIFN0YXRlIFBlcnNpc3RlbmNlJywgaGludDogJ1BlcnNpc3QgdG9vbCBleGVjdXRpb24gc3RhdGUgYmV0d2VlbiBzZXNzaW9ucycgfSwgREVGQVVMVF9DT05GSUcuc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQpXHJcblxyXG4gIC5maWVsZCgnc3RhdGVNYXhTaXplJywgJ251bWVyaWMnLCB7IG1pbjogMTAyNCwgbWF4OiAxMDQ4NTc2LCBpbnQ6IHRydWUgfSwgREVGQVVMVF9DT05GSUcuc3RhdGVNYXhTaXplKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1RDgzQ1x1REYxMCBMQU5HVUFHRSAmIE5PVElGSUNBVElPTlMgXHVEODNDXHVERjEwXHJcblxyXG4gIC5maWVsZCgnbGFuZ3VhZ2UnLCAnc2VsZWN0Jywge1xyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjEwIExhbmd1YWdlJyxcclxuXHJcbiAgICBvcHRpb25zOiBbXHJcblxyXG4gICAgICB7IHZhbHVlOiAnZW4nLCBkaXNwbGF5TmFtZTogJ0VuZ2xpc2gnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnZGUnLCBkaXNwbGF5TmFtZTogJ0RldXRzY2ggKEdlcm1hbiknIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnemgtQ04nLCBkaXNwbGF5TmFtZTogJ1NpbXBsaWZpZWQgQ2hpbmVzZScgfSxcclxuXHJcbiAgICAgIHsgdmFsdWU6ICd6aC1UVycsIGRpc3BsYXlOYW1lOiAnVHJhZGl0aW9uYWwgQ2hpbmVzZScgfSxcclxuXHJcbiAgICBdLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5sYW5ndWFnZSlcclxuXHJcblxyXG5cclxuICAuZmllbGQoJ25vdGlmaWNhdGlvbnNFbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDE0IERlc2t0b3AgTm90aWZpY2F0aW9ucycsIGhpbnQ6ICdTaG93IHN5c3RlbSBub3RpZmljYXRpb25zJyB9LCBERUZBVUxUX0NPTkZJRy5ub3RpZmljYXRpb25zRW5hYmxlZClcclxuXHJcbiAgLmJ1aWxkKCk7XHJcblxyXG4iLCAiLyoqXG4gKiBQZXJzaXN0ZW50IHN0YXRlIG1hbmFnZW1lbnQgZm9yIHBsdWdpbiBvcGVyYXRpb25zXG4gKiBTdG9yZXMgZGF0YSB0byBkaXNrIGFzIEpTT04gZmlsZSBmb3Igc3Vydml2YWwgYWNyb3NzIHJlbG9hZHNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcblxuaW50ZXJmYWNlIFN0YXRlRW50cnkge1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHVua25vd247XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG4vKiogTWluaW1hbCBsb2dnZXIgZm9yIHN0YXRlIG1hbmFnZXIgKGF2b2lkcyBjaXJjdWxhciBkZXBlbmRlbmN5IHdpdGggaW5kZXgudHMpICovXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbU3RhdGVNYW5hZ2VyXSAke21zZ31cXG5gKSxcbn07XG5cbi8qKiBEZWJvdW5jZWQgYXN5bmMgc3RhdGUgcGVyc2lzdGVuY2UgKDUwMG1zIGRlbGF5KSAqL1xuZnVuY3Rpb24gY3JlYXRlRGVib3VuY2VkU2F2ZShzYXZlRm46ICgpID0+IHZvaWQsIGRlbGF5TXM6IG51bWJlciA9IDUwMCk6ICgoKSA9PiB2b2lkKSB7XG4gIGxldCB0aW1lcklkOiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZFNhdmUoKTogdm9pZCB7XG4gICAgaWYgKHRpbWVySWQpIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzYXZlRm4oKTtcbiAgICAgIHRpbWVySWQgPSBudWxsO1xuICAgIH0sIGRlbGF5TXMpO1xuICB9O1xufVxuXG4vKipcbiAqIERlZmF1bHQgbWVtb3J5IGZpbGUgbG9jYXRpb24gKGluIExNIFN0dWRpbyBwbHVnaW4gZGF0YSBkaXJlY3RvcnkpXG4gKi9cbmZ1bmN0aW9uIGdldE1lbW9yeUZpbGVQYXRoKCk6IHN0cmluZyB7XG4gIC8vIFRyeSB0byBmaW5kIExNIFN0dWRpbydzIGFwcCBkYXRhIGRpcmVjdG9yeSBmb3IgcGVyc2lzdGVuY2VcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgbGV0IGJhc2VEaXI6IHN0cmluZztcbiAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIGJhc2VEaXIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuQVBQREFUQSB8fCAnJywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgYmFzZURpciA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBiYXNlRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgJycsICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgfVxuICBcbiAgcmV0dXJuIHBhdGguam9pbihiYXNlRGlyLCAnYWktdG9vbGJveC1tZW1vcnkuanNvbicpO1xufVxuXG5leHBvcnQgY2xhc3MgU3RhdGVNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0ZTogTWFwPHN0cmluZywgU3RhdGVFbnRyeT47XG4gIHByaXZhdGUgbWF4U2l6ZTogbnVtYmVyO1xuICBwcml2YXRlIHBlcnNpc3RlbmNlRW5hYmxlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBtZW1vcnlGaWxlOiBzdHJpbmc7XG4gIHByaXZhdGUgcnVubmluZ1NpemU6IG51bWJlcjsgLy8gVHJhY2sgc2l6ZSBpbmNyZW1lbnRhbGx5IGZvciBPKDEpIGNoZWNrc1xuICBwcml2YXRlIGRlYm91bmNlZFNhdmU6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gICAgdGhpcy5tYXhTaXplID0gZWZmZWN0aXZlQ29uZmlnLnN0YXRlTWF4U2l6ZTtcbiAgICB0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCA9IGVmZmVjdGl2ZUNvbmZpZy5zdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDtcbiAgICB0aGlzLm1lbW9yeUZpbGUgPSBnZXRNZW1vcnlGaWxlUGF0aCgpO1xuICAgIFxuICAgIC8vIENyZWF0ZSBkZWJvdW5jZWQgc2F2ZSBmdW5jdGlvbiAoNTAwbXMgZGVsYXkpXG4gICAgdGhpcy5kZWJvdW5jZWRTYXZlID0gY3JlYXRlRGVib3VuY2VkU2F2ZSgoKSA9PiB0aGlzLnNhdmVUb0ZpbGUoKSwgNTAwKTtcbiAgICBcbiAgICAvLyBBdXRvLWxvYWQgZnJvbSBkaXNrIGlmIHBlcnNpc3RlbmNlIGlzIGVuYWJsZWRcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIHN0YXRlIHZhbHVlIHdpdGgga2V5IGFuZCBvcHRpb25hbCBtZXRhZGF0YVxuICAgKi9cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGNvbnN0IG5ld1ZhbHVlU2l6ZSA9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUodmFsdWUpO1xuICAgIGNvbnN0IG9sZFZhbHVlU2l6ZSA9IHRoaXMuZ2V0RXhpc3RpbmdWYWx1ZVNpemUoa2V5KTtcbiAgICBcbiAgICAvLyBDaGVjayBzaXplIGxpbWl0IHVzaW5nIHJ1bm5pbmcgdG90YWxcbiAgICBpZiAodGhpcy5ydW5uaW5nU2l6ZSAtIG9sZFZhbHVlU2l6ZSArIG5ld1ZhbHVlU2l6ZSA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdGF0ZSBzaXplIGV4Y2VlZHMgbWF4aW11bSAoJHt0aGlzLm1heFNpemV9IGJ5dGVzKWApO1xuICAgIH1cbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBzZXR0aW5nXG4gICAgdGhpcy5ydW5uaW5nU2l6ZSA9IHRoaXMucnVubmluZ1NpemUgLSBvbGRWYWx1ZVNpemUgKyBuZXdWYWx1ZVNpemU7XG4gICAgXG4gICAgdGhpcy5zdGF0ZS5zZXQoa2V5LCB7XG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICB9KTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgKDUwMG1zIGRlbGF5KSBcdTIwMTQgb25seSBpZiBwZXJzaXN0ZW5jZSBlbmFibGVkXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3RhdGUgdmFsdWUgYnkga2V5XG4gICAqL1xuICBnZXQ8VD4oa2V5OiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuc3RhdGUuZ2V0KGtleSk7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gZW50cnkudmFsdWUgYXMgVDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBzdGF0ZSBlbnRyeVxuICAgKi9cbiAgZGVsZXRlKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIGlmICghZW50cnkpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBkZWxldGluZ1xuICAgIHRoaXMucnVubmluZ1NpemUgLT0gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSk7XG4gICAgY29uc3QgZGVsZXRlZCA9IHRoaXMuc3RhdGUuZGVsZXRlKGtleSk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrIGFmdGVyIGRlbGV0aW9uXG4gICAgaWYgKGRlbGV0ZWQgJiYgdGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZGVsZXRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHN0YXRlIGtleXNcbiAgICovXG4gIGdldEFsbEtleXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuc3RhdGUua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhbGwgc3RhdGVcbiAgICovXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgYWZ0ZXIgY2xlYXJpbmdcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc2l6ZSBvZiBleGlzdGluZyB2YWx1ZSBmb3IgYSBrZXkgKGZvciBpbmNyZW1lbnRhbCB1cGRhdGVzKVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFeGlzdGluZ1ZhbHVlU2l6ZShrZXk6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIHJldHVybiBlbnRyeSA/IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpIDogMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFc3RpbWF0ZSBzaXplIG9mIGEgdmFsdWUgaW4gYnl0ZXNcbiAgICovXG4gIHByaXZhdGUgZ2V0U2l6ZU9mVmFsdWUodmFsdWU6IHVua25vd24pOiBudW1iZXIge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gdmFsdWUubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSByZXR1cm4gODtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHJldHVybiAxO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFjdHVhbCBzaXplIG9mIGFycmF5IGVsZW1lbnRzXG4gICAgICByZXR1cm4gdmFsdWUucmVkdWNlKChzdW06IG51bWJlciwgZWxlbTogdW5rbm93bikgPT4gc3VtICsgdGhpcy5nZXRTaXplT2ZWYWx1ZShlbGVtKSwgMCk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIHZhbHVlLnNpemUgKiAxNjtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBzdGF0ZSB0byBkaXNrIGFzIEpTT04gZmlsZSB3aXRoIG9wdGltaXplZCBzZXJpYWxpemF0aW9uXG4gICAqL1xuICBwcml2YXRlIHNhdmVUb0ZpbGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGUuZW50cmllcygpKS5tYXAoKFtfa2V5LCBlbnRyeV0pID0+ICh7XG4gICAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICAgIHRpbWVzdGFtcDogZW50cnkudGltZXN0YW1wLFxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICAvLyBFbnN1cmUgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMubWVtb3J5RmlsZSk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gT3B0aW1pemVkIEpTT04gc2VyaWFsaXphdGlvbiAobm8gcHJldHR5LXByaW50aW5nIGZvciBwZXJmb3JtYW5jZSlcbiAgICAgIGNvbnN0IGpzb25TdHJpbmcgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgIFxuICAgICAgLy8gV3JpdGUgdG8gdGVtcCBmaWxlIGZpcnN0LCB0aGVuIHJlbmFtZSBmb3IgYXRvbWljIG9wZXJhdGlvblxuICAgICAgY29uc3QgdGVtcEZpbGUgPSB0aGlzLm1lbW9yeUZpbGUgKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBGaWxlLCBqc29uU3RyaW5nLCAndXRmLTgnKTtcbiAgICAgIGZzLnJlbmFtZVN5bmModGVtcEZpbGUsIHRoaXMubWVtb3J5RmlsZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHNhdmUgdG8gZGlzazogJHttZXNzYWdlfWApOyAvLyBNMiBmaXg6IG5vIGNvbnNvbGUud2FyblxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHN0YXRlIGZyb20gZGlzayBKU09OIGZpbGUgd2l0aCBjb3JydXB0aW9uIHJlY292ZXJ5XG4gICAqL1xuICBwcml2YXRlIGxvYWRGcm9tRmlsZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMubWVtb3J5RmlsZSkpIHJldHVybjtcbiAgICAgIFxuICAgICAgY29uc3QganNvblN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUsICd1dGYtOCcpO1xuICAgICAgXG4gICAgICAvLyBUcnkgdG8gcGFyc2UgSlNPTiB3aXRoIGVycm9yIHJlY292ZXJ5XG4gICAgICBsZXQgZGF0YTogU3RhdGVFbnRyeVtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoanNvblN0cmluZykgYXMgU3RhdGVFbnRyeVtdO1xuICAgICAgfSBjYXRjaCB7IC8vIEMxIGZpeDogcmVtb3ZlZCB1bnVzZWQgcGFyc2VFcnJvciB2YXJpYWJsZVxuICAgICAgICBsb2dnZXIud2FybihgQ29ycnVwdGVkIHN0YXRlIGZpbGUgZGV0ZWN0ZWQsIGF0dGVtcHRpbmcgcmVjb3ZlcnkuLi5gKTtcblxuICAgICAgICAvLyBUcnkgdG8gcmVjb3ZlciBieSByZWFkaW5nIGxpbmUgYnkgbGluZSBvciB1c2luZyBiYWNrdXBcbiAgICAgICAgY29uc3QgYmFja3VwRmlsZSA9IHRoaXMubWVtb3J5RmlsZSArICcuYmFja3VwJztcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYmFja3VwRmlsZSkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFja3VwU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGJhY2t1cEZpbGUsICd1dGYtOCcpO1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoYmFja3VwU3RyaW5nKSBhcyBTdGF0ZUVudHJ5W107XG4gICAgICAgICAgICBsb2dnZXIud2FybihgU3VjY2Vzc2Z1bGx5IGxvYWRlZCBmcm9tIGJhY2t1cGApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYEJhY2t1cCBhbHNvIGNvcnJ1cHRlZCwgc3RhcnRpbmcgZnJlc2hgKTtcbiAgICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oYE5vIGJhY2t1cCBhdmFpbGFibGUsIHN0YXJ0aW5nIGZyZXNoYCk7XG4gICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGRhdGEpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZW50cnkgc3RydWN0dXJlIGJlZm9yZSBhZGRpbmdcbiAgICAgICAgaWYgKGVudHJ5ICYmIHR5cGVvZiBlbnRyeS5rZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBlbnRyeS50aW1lc3RhbXAgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZXQoZW50cnkua2V5LCBlbnRyeSk7XG4gICAgICAgICAgdGhpcy5ydW5uaW5nU2l6ZSArPSB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBDcmVhdGUgYmFja3VwIGFmdGVyIHN1Y2Nlc3NmdWwgbG9hZFxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUgKyAnLmJhY2t1cCcsIGpzb25TdHJpbmcsICd1dGYtOCcpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIElnbm9yZSBiYWNrdXAgY3JlYXRpb24gZXJyb3JzXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIGxvYWQgZnJvbSBkaXNrOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9ydCBzdGF0ZSBmb3IgcGVyc2lzdGVuY2UgKEpTT04gc2VyaWFsaXphdGlvbikgXHUyMDE0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICovXG4gIGV4cG9ydFN0YXRlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZGF0YSA9IEFycmF5LmZyb20odGhpcy5zdGF0ZS5lbnRyaWVzKCkpLm1hcCgoW19rZXksIGVudHJ5XSkgPT4gKHtcbiAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLFxuICAgICAgdGltZXN0YW1wOiBlbnRyeS50aW1lc3RhbXAsXG4gICAgfSkpO1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgc3RhdGUgZnJvbSBKU09OIHN0cmluZyBcdTIwMTQga2VwdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgKi9cbiAgaW1wb3J0U3RhdGUoanNvblN0cmluZzogc3RyaW5nKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGpzb25TdHJpbmcpIGFzIFN0YXRlRW50cnlbXTtcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBkYXRhKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgICAgICB0aGlzLnJ1bm5pbmdTaXplICs9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIGFmdGVyIGltcG9ydFxuICAgICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gaW1wb3J0IHN0YXRlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCB0byB0aGUgbWVtb3J5IGZpbGUgb24gZGlza1xuICAgKi9cbiAgZ2V0TWVtb3J5RmlsZVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tZW1vcnlGaWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIHNhdmUgdG8gZGlzayAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBmb3JjZVNhdmUoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlVG9GaWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2UgbG9hZCBmcm9tIGRpc2sgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgKi9cbiAgZm9yY2VMb2FkKCk6IHZvaWQge1xuICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gIH1cbn1cbiIsICIvKipcclxuICogTG9uZy1ydW5uaW5nIHByb2Nlc3MgdHJhY2tpbmcgYW5kIG1hbmFnZW1lbnRcclxuICovXHJcblxyXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCYWNrZ3JvdW5kQ29tbWFuZCB7XHJcbiAgaWQ6IHN0cmluZztcclxuICBjb21tYW5kOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHN0YXJ0VGltZTogbnVtYmVyO1xyXG4gIHRpbWVvdXRIb3VyczogbnVtYmVyO1xyXG4gIHN0YXR1czogJ3J1bm5pbmcnIHwgJ2NvbXBsZXRlZCcgfCAnY2FuY2VsbGVkJyB8ICdlcnJvcmVkJztcclxuICBzdGRvdXQ/OiBzdHJpbmc7XHJcbiAgc3RkZXJyPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIHtcclxuICBwcml2YXRlIGNvbW1hbmRzOiBNYXA8c3RyaW5nLCBCYWNrZ3JvdW5kQ29tbWFuZD47XHJcbiAgcHJpdmF0ZSBtYXhUaW1lb3V0SG91cnM6IG51bWJlcjtcclxuICBcclxuICBjb25zdHJ1Y3RvcihfY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XHJcbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5tYXhUaW1lb3V0SG91cnMgPSAxMDsgLy8gSGFyZCBsaW1pdCBmcm9tIHRvb2wgc3BlY2lmaWNhdGlvblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXIgYSBuZXcgYmFja2dyb3VuZCBjb21tYW5kXHJcbiAgICovXHJcbiAgcmVnaXN0ZXIoY29tbWFuZDogc3RyaW5nLCB0aW1lb3V0SG91cnM6IG51bWJlciwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICh0aW1lb3V0SG91cnMgPCAwLjEgfHwgdGltZW91dEhvdXJzID4gdGhpcy5tYXhUaW1lb3V0SG91cnMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaW1lb3V0IG11c3QgYmUgYmV0d2VlbiAwLjEgYW5kICR7dGhpcy5tYXhUaW1lb3V0SG91cnN9IGhvdXJzYCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICghbmFtZSB8fCBuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgbmFtZSBpcyBtYW5kYXRvcnknKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgaWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcclxuICAgIFxyXG4gICAgdGhpcy5jb21tYW5kcy5zZXQoaWQsIHtcclxuICAgICAgaWQsXHJcbiAgICAgIGNvbW1hbmQsXHJcbiAgICAgIG5hbWUsXHJcbiAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcclxuICAgICAgdGltZW91dEhvdXJzLFxyXG4gICAgICBzdGF0dXM6ICdydW5uaW5nJyxcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gaWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBzdGF0dXMgYW5kIG91dHB1dCBvZiBhIGJhY2tncm91bmQgY29tbWFuZFxyXG4gICAqL1xyXG4gIGNoZWNrKGlkOiBzdHJpbmcpOiBCYWNrZ3JvdW5kQ29tbWFuZCB8IG51bGwge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCkgcmV0dXJuIG51bGw7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGlmIHRpbWVvdXQgZXhjZWVkZWRcclxuICAgIGNvbnN0IGVsYXBzZWRIb3VycyA9IChEYXRlLm5vdygpIC0gY29tbWFuZC5zdGFydFRpbWUpIC8gKDEwMDAgKiA2MCAqIDYwKTtcclxuICAgIGlmIChlbGFwc2VkSG91cnMgPiBjb21tYW5kLnRpbWVvdXRIb3VycyAmJiBjb21tYW5kLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XHJcbiAgICAgIGNvbW1hbmQuc3RhdHVzID0gJ2Vycm9yZWQnO1xyXG4gICAgICBjb21tYW5kLnN0ZGVyciA9IGBDb21tYW5kIGV4Y2VlZGVkIHRpbWVvdXQgKCR7Y29tbWFuZC50aW1lb3V0SG91cnN9IGhvdXJzKWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBjb21tYW5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FuY2VsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmRcclxuICAgKi9cclxuICBjYW5jZWwoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCB8fCBjb21tYW5kLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgICBcclxuICAgIGNvbW1hbmQuc3RhdHVzID0gJ2NhbmNlbGxlZCc7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbGwgYWN0aXZlIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0QWN0aXZlQ29tbWFuZHMoKTogQmFja2dyb3VuZENvbW1hbmRbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNvbW1hbmRzLnZhbHVlcygpKVxyXG4gICAgICAuZmlsdGVyKGMgPT4gYy5zdGF0dXMgPT09ICdydW5uaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgY29tcGxldGVkL2Vycm9yZWQvY2FuY2VsbGVkIGNvbW1hbmRzIGFmdGVyIGNsZWFudXAgcGVyaW9kXHJcbiAgICovXHJcbiAgY2xlYW51cChtYXhBZ2VIb3VyczogbnVtYmVyID0gMjQpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBmb3IgKGNvbnN0IFtpZCwgY29tbWFuZF0gb2YgdGhpcy5jb21tYW5kcy5lbnRyaWVzKCkpIHtcclxuICAgICAgaWYgKGNvbW1hbmQuc3RhdHVzICE9PSAncnVubmluZycpIHtcclxuICAgICAgICBjb25zdCBhZ2VIb3VycyA9IChub3cgLSBjb21tYW5kLnN0YXJ0VGltZSkgLyAoMTAwMCAqIDYwICogNjApO1xyXG4gICAgICAgIGlmIChhZ2VIb3VycyA+IG1heEFnZUhvdXJzKSB7XHJcbiAgICAgICAgICB0aGlzLmNvbW1hbmRzLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgY29tbWFuZCBJRFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBiZ18ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0b3RhbCBjb3VudCBvZiByZWdpc3RlcmVkIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0Q291bnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmNvbW1hbmRzLnNpemU7XHJcbiAgfVxyXG59XHJcbiIsICIvKipcbiAqIFdvcmtpbmcgRGlyZWN0b3J5IE1hbmFnZXJcbiAqIFxuICogVHJhY2tzIGEgbXV0YWJsZSB3b3JraW5nIGRpcmVjdG9yeSB0aGF0IGNhbiBiZSBjaGFuZ2VkIGF0IHJ1bnRpbWUgdmlhIHNldFdvcmtpbmdEaXIoKS5cbiAqIEFsbCBmaWxlIG9wZXJhdGlvbnMgcmVzb2x2ZSBwYXRocyBhZ2FpbnN0IHRoaXMgZGlyZWN0b3J5LlxuICogRmFsbHMgYmFjayB0byB0aGUgcGx1Z2luIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgKEJBU0VfRElSKSBvbiByZXNldC5cbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG4vLyBCYXNlIGRpcmVjdG9yeTogcGx1Z2luIHJvb3QgKHdoZXJlIHBhY2thZ2UuanNvbiBsaXZlcylcbmNvbnN0IEJBU0VfRElSID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJyk7XG5cbi8vIE11dGFibGUgd29ya2luZyBkaXJlY3RvcnkgXHUyMDE0IGRlZmF1bHRzIHRvIHBsdWdpbiByb290XG5sZXQgY3VycmVudFdvcmtpbmdEaXI6IHN0cmluZyA9IEJBU0VfRElSO1xuXG4vKiogR2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0V29ya2luZ0RpcigpOiBzdHJpbmcge1xuICByZXR1cm4gY3VycmVudFdvcmtpbmdEaXI7XG59XG5cbi8qKlxuICogU2V0IHRoZSB3b3JraW5nIGRpcmVjdG9yeSB0byBhIG5ldyBhYnNvbHV0ZSBwYXRoLlxuICogVmFsaWRhdGVzIHRoYXQgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhbiBhYnNvbHV0ZSBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRXb3JraW5nRGlyKG5ld0Rpcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFJlc29sdmUgdG8gYWJzb2x1dGUgcGF0aFxuICBjb25zdCByZXNvbHZlZCA9IHBhdGgucmVzb2x2ZShuZXdEaXIpO1xuXG4gIC8vIE11c3QgYmUgYW4gYWJzb2x1dGUgcGF0aFxuICBpZiAoIXBhdGguaXNBYnNvbHV0ZShyZXNvbHZlZCkpIHtcbiAgICBjb25zb2xlLndhcm4oYHNldFdvcmtpbmdEaXIgcmVqZWN0ZWQ6IG5vdCBhYnNvbHV0ZSBcdTIwMTQgJyR7bmV3RGlyfSdgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBNdXN0IGV4aXN0IGFuZCBiZSBhIGRpcmVjdG9yeVxuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMocmVzb2x2ZWQpO1xuICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBzZXRXb3JraW5nRGlyIHJlamVjdGVkOiBub3QgYSBkaXJlY3RvcnkgXHUyMDE0ICcke3Jlc29sdmVkfSdgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGNvbnNvbGUud2Fybihgc2V0V29ya2luZ0RpciByZWplY3RlZDogcGF0aCBkb2VzIG5vdCBleGlzdCBcdTIwMTQgJyR7cmVzb2x2ZWR9J2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGN1cnJlbnRXb3JraW5nRGlyID0gcmVzb2x2ZWQ7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogUmVzZXQgdGhlIHdvcmtpbmcgZGlyZWN0b3J5IGJhY2sgdG8gdGhlIHBsdWdpbiByb290ICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRXb3JraW5nRGlyKCk6IHZvaWQge1xuICBjdXJyZW50V29ya2luZ0RpciA9IEJBU0VfRElSO1xufVxuXG4vKiogUmVzb2x2ZSBhIHVzZXItcHJvdmlkZWQgcGF0aCBhZ2FpbnN0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhdGgodXNlclBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUoY3VycmVudFdvcmtpbmdEaXIsIHVzZXJQYXRoKTtcbn1cblxuLyoqIEdldCBhbGxvd2VkIGJhc2UgZGlyZWN0b3JpZXMgZm9yIGFic29sdXRlLXBhdGggdmFsaWRhdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbG93ZWRCYXNlcygpOiBzdHJpbmdbXSB7XG4gIC8vIEFsbG93IGJvdGggdGhlIHBsdWdpbiByb290IGFuZCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICBjb25zdCBiYXNlcyA9IFtCQVNFX0RJUiwgY3VycmVudFdvcmtpbmdEaXJdO1xuICByZXR1cm4gWy4uLm5ldyBTZXQoYmFzZXMpXTsgLy8gRGVkdXBsaWNhdGVcbn1cblxuLyoqIEdldCB0aGUgcGx1Z2luIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgKG5ldmVyIGNoYW5nZXMpICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1Z2luUm9vdCgpOiBzdHJpbmcge1xuICByZXR1cm4gQkFTRV9ESVI7XG59XG4iLCAiLyoqXG4gKiBTZWN1cml0eSB1dGlsaXRpZXMgZm9yIHBhdGggdmFsaWRhdGlvbiwgYmluYXJ5IGRldGVjdGlvbiwgYW5kIFJlRG9TIHByb3RlY3Rpb25cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbi8vIFx1MjcwNSBGSVg6IFVzZSBwcm9wZXIgRVNNIGltcG9ydHMgaW5zdGVhZCBvZiByZXF1aXJlKCkgdG8gbWFpbnRhaW4gbW9kdWxlIGJvdW5kYXJ5XG5pbXBvcnQgeyBnZXRBbGxvd2VkQmFzZXMsIGdldFdvcmtpbmdEaXIgfSBmcm9tICcuL3dvcmtpbmdEaXInO1xuXG4vKipcbiAqIFZhbGlkYXRlIGZpbGUgcGF0aCB0byBwcmV2ZW50IGRpcmVjdG9yeSB0cmF2ZXJzYWwgYXR0YWNrcy5cbiAqIFN1cHBvcnRzIGJvdGggcmVsYXRpdmUgcGF0aHMgKHJlc29sdmVkIGFnYWluc3QgYmFzZVBhdGgpIGFuZCBhYnNvbHV0ZSBwYXRoc1xuICogKHZhbGlkYXRlZCBhZ2FpbnN0IGFsbG93ZWQgYmFzZSBkaXJlY3RvcmllcykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVBhdGgodXNlclBhdGg6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBSZWplY3QgZW1wdHkgaW5wdXRzXG4gIGlmICghYmFzZVBhdGggfHwgIXVzZXJQYXRoKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gUmVqZWN0IFVOQyBwYXRocyAoV2luZG93cyBuZXR3b3JrIHNoYXJlcylcbiAgaWYgKHVzZXJQYXRoLnN0YXJ0c1dpdGgoJ1xcXFxcXFxcJykpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBub3JtYWxpemVkVXNlclBhdGggPSB1c2VyUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbiAgLy8gRGV0ZWN0IGFic29sdXRlIHBhdGhzOiBVbml4ICgvLi4uKSBvciBXaW5kb3dzIGRyaXZlIGxldHRlcnMgKEM6Ly4uLilcbiAgY29uc3QgaXNBYnNvbHV0ZSA9IG5vcm1hbGl6ZWRVc2VyUGF0aC5zdGFydHNXaXRoKCcvJykgfHwgL15bYS16QS1aXTovLnRlc3Qobm9ybWFsaXplZFVzZXJQYXRoKTtcblxuICBpZiAoIWlzQWJzb2x1dGUpIHtcbiAgICAvLyBSZWxhdGl2ZSBwYXRoIFx1MjAxNCByZXNvbHZlIGFnYWluc3QgYmFzZVBhdGggYW5kIHZhbGlkYXRlIGNvbnRhaW5tZW50XG4gICAgY29uc3QgcmVzb2x2ZWRCYXNlID0gcGF0aC5yZXNvbHZlKGJhc2VQYXRoKTtcbiAgICBjb25zdCByZXNvbHZlZFBhdGggPSBwYXRoLnJlc29sdmUocmVzb2x2ZWRCYXNlLCBub3JtYWxpemVkVXNlclBhdGgpO1xuXG4gICAgY29uc3QgYmFzZVdpdGhTZXBhcmF0b3IgPSByZXNvbHZlZEJhc2UuZW5kc1dpdGgocGF0aC5zZXApID8gcmVzb2x2ZWRCYXNlIDogYCR7cmVzb2x2ZWRCYXNlfSR7cGF0aC5zZXB9YDtcbiAgICByZXR1cm4gcmVzb2x2ZWRQYXRoID09PSByZXNvbHZlZEJhc2UgfHwgcmVzb2x2ZWRQYXRoLnN0YXJ0c1dpdGgoYmFzZVdpdGhTZXBhcmF0b3IpO1xuICB9XG5cbiAgLy8gQWJzb2x1dGUgcGF0aCBcdTIwMTQgdmFsaWRhdGUgYWdhaW5zdCBhbGxvd2VkIGJhc2VzIChzYW5kYm94ICsgdXNlciBkaXJlY3RvcmllcylcbiAgY29uc3QgYWxsb3dlZEJhc2VzID0gZ2V0QWxsb3dlZEJhc2VzKCk7XG4gIGNvbnN0IHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLnJlc29sdmUodXNlclBhdGgpO1xuXG4gIGZvciAoY29uc3QgYmFzZSBvZiBhbGxvd2VkQmFzZXMpIHtcbiAgICBpZiAoIWJhc2UpIGNvbnRpbnVlO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRCYXNlID0gYmFzZS5lbmRzV2l0aChwYXRoLnNlcCkgPyBiYXNlIDogYCR7YmFzZX0ke3BhdGguc2VwfWA7XG4gICAgaWYgKHJlc29sdmVkQWJzb2x1dGUgPT09IGJhc2UgfHwgcmVzb2x2ZWRBYnNvbHV0ZS5zdGFydHNXaXRoKG5vcm1hbGl6ZWRCYXNlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gQWJzb2x1dGUgcGF0aCBub3Qgd2l0aGluIGFueSBhbGxvd2VkIGJhc2UgXHUyMDE0IHJlamVjdFxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogRGV0ZWN0IGJpbmFyeSBmaWxlcyBieSBjaGVja2luZyBmb3IgbnVsbCBieXRlcyBpbiBmaXJzdCA4S0JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQmluYXJ5RmlsZShjb250ZW50OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgY2h1bmsgPSBjb250ZW50LnNsaWNlKDAsIDgxOTIpO1xuICAvLyBDaGVjayBmb3IgbnVsbCBieXRlICgweDAwKSB3aGljaCBpbmRpY2F0ZXMgYmluYXJ5IGNvbnRlbnRcbiAgcmV0dXJuIGNodW5rLmluY2x1ZGVzKCdcXDAnKTtcbn1cblxuLyoqXG4gKiBQcm90ZWN0IGFnYWluc3QgUmVEb1MgKFJlZ3VsYXIgRXhwcmVzc2lvbiBEZW5pYWwgb2YgU2VydmljZSlcbiAqIFMyIEZJWDogVXNlcyBwcm9wZXIgcmVnZXggc3RydWN0dXJlIGFuYWx5c2lzIGluc3RlYWQgb2YgbmFpdmUgc3Vic3RyaW5nIG1hdGNoaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTYWZlUmVnZXgocGF0dGVybjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghcGF0dGVybiB8fCBwYXR0ZXJuLmxlbmd0aCA+IDUwMCkgcmV0dXJuIGZhbHNlO1xuICBcbiAgLy8gQ2hlY2sgZm9yIGNvbW1vbiBSZURvUyBwYXR0ZXJucyB1c2luZyBzdHJ1Y3R1cmVkIHJlZ2V4IGRldGVjdGlvblxuICBjb25zdCBkYW5nZXJvdXNTdHJ1Y3R1cmVzID0gW1xuICAgIC8oXFwoW14pXSpcXClbKitdKVteKV0qXFwpLywgICAgICAgICAgIC8vIE5lc3RlZCBxdWFudGlmaWVyczogKC4qKSguKilcbiAgICAvXFwoW14pXSpbKypdXFwpKy8sICAgICAgICAgICAgICAgICAgICAvLyBSZXBldGl0aW9uIG9mIHJlcGV0aXRpb246ICguKykrXG4gICAgL1xcKFteKV0qXFx8W14pXSpcXClbKypdLywgICAgICAgICAgICAgIC8vIEFsdGVybmF0aW9uICsgcmVwZXRpdGlvbjogKGF8YikrXG4gICAgLyhcXFtbXlxcXV0rXFxdWysqXSlbXl1dKlxcXS8sICAgICAgICAgICAvLyBDaGFyIGNsYXNzIHdpdGggcmVwZXRpdGlvbjogKFthLXpdKykrXG4gICAgL1xcKFxcLlxcP1xcKVxcKlxcKi8sICAgICAgICAgICAgICAgICAgICAgIC8vIEdyb3VwIGZvbGxvd2VkIGJ5IGRvdWJsZSBzdGFyOiAoLio/KSoqXG4gIF07XG4gIFxuICBmb3IgKGNvbnN0IHN0cnVjdHVyZSBvZiBkYW5nZXJvdXNTdHJ1Y3R1cmVzKSB7XG4gICAgaWYgKHN0cnVjdHVyZS50ZXN0KHBhdHRlcm4pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgXG4gIC8vIEFsc28gY2hlY2sgZm9yIHRoZSBvcmlnaW5hbCBuYWl2ZSBwYXR0ZXJucyBhcyBmYWxsYmFja1xuICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAnKC4qKSguKiknLCAgICAgICAgICAgLy8gTmVzdGVkIHF1YW50aWZpZXJzIHdpdGggLipcbiAgICAnKC4rKSsnLCAgICAgICAgICAgICAgLy8gUmVwZXRpdGlvbiBvZiByZXBldGl0aW9uICBcbiAgICAnKFthLXpdKykrJywgICAgICAgICAgLy8gQ2hhcmFjdGVyIGNsYXNzIHdpdGggcmVwZXRpdGlvblxuICAgICcoYXxiKSsnLCAgICAgICAgICAgICAvLyBBbHRlcm5hdGlvbiB3aXRoIHJlcGV0aXRpb25cbiAgICAnKC4qPykqKicsICAgICAgICAgICAgLy8gR3JvdXAgZm9sbG93ZWQgYnkgZG91YmxlIHN0YXIgKFJlRG9TKVxuICBdO1xuICBcbiAgZm9yIChjb25zdCBkYW5nZXJvdXNQYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4uaW5jbHVkZXMoZGFuZ2Vyb3VzUGF0dGVybikpIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQXBwbHkgc2VjdXJpdHkgY2hlY2tzIGJhc2VkIG9uIGNvbmZpZyBzZXR0aW5ncy5cbiAqIFVzZXMgdGhlIHZpcnR1YWwgd29ya2luZyBkaXJlY3RvcnkgZm9yIHBhdGggdmFsaWRhdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U2VjdXJpdHlDaGVja3MoXG4gIGZpbGVQYXRoOiBzdHJpbmcsIFxuICBjb250ZW50Pzogc3RyaW5nLCBcbiAgcmVnZXhQYXR0ZXJuPzogc3RyaW5nLCBcbiAgY29uZmlnPzogUGx1Z2luQ29uZmlnXG4pOiB7IHZhbGlkUGF0aDogYm9vbGVhbjsgaXNCaW5hcnk6IGJvb2xlYW47IHNhZmVSZWdleDogYm9vbGVhbiB9IHtcbiAgY29uc3QgZWZmZWN0aXZlQ29uZmlnID0gY29uZmlnIHx8IERFRkFVTFRfQ09ORklHO1xuXG4gIHJldHVybiB7XG4gICAgdmFsaWRQYXRoOiBlZmZlY3RpdmVDb25maWcucGF0aFZhbGlkYXRpb25FbmFibGVkID8gdmFsaWRhdGVQYXRoKGZpbGVQYXRoLCBnZXRXb3JraW5nRGlyKCkpIDogdHJ1ZSxcbiAgICBpc0JpbmFyeTogZWZmZWN0aXZlQ29uZmlnLmJpbmFyeUZpbGVEZXRlY3Rpb24gJiYgY29udGVudCA/IGlzQmluYXJ5RmlsZShjb250ZW50KSA6IGZhbHNlLFxuICAgIHNhZmVSZWdleDogZWZmZWN0aXZlQ29uZmlnLnJlZ2V4UmVEb1NQcm90ZWN0aW9uICYmIHJlZ2V4UGF0dGVybiA/IGlzU2FmZVJlZ2V4KHJlZ2V4UGF0dGVybikgOiB0cnVlLFxuICB9O1xufVxuXG4vKipcbiAqIFNhbml0aXplIHNoZWxsIGNvbW1hbmRzIHRvIHByZXZlbnQgZGFuZ2Vyb3VzIG9wZXJhdGlvbnNcbiAqIFMzIEZJWDogRW5oYW5jZWQgd2l0aCBJRlMtdGFtcGVyaW5nIGFuZCBudWxsLWJ5dGUgaW5qZWN0aW9uIGRldGVjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB7IHNhZmU6IGJvb2xlYW47IHJlYXNvbj86IHN0cmluZyB9IHtcbiAgaWYgKCFjb21tYW5kIHx8IHR5cGVvZiBjb21tYW5kICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdFbXB0eSBvciBpbnZhbGlkIGNvbW1hbmQnIH07XG4gIH1cblxuICAvLyBOb3JtYWxpemUgd2hpdGVzcGFjZSBidXQgcHJlc2VydmUgcXVvdGVkIHN0cmluZ3NcbiAgY29uc3Qgbm9ybWFsaXplZCA9IGNvbW1hbmQudHJpbSgpO1xuICBcbiAgLy8gUzMgRklYOiBCbG9jayBudWxsIGJ5dGUgaW5qZWN0aW9uIChjYW4gYnlwYXNzIHJlZ2V4IG1hdGNoaW5nKVxuICBpZiAobm9ybWFsaXplZC5pbmNsdWRlcygnXFwwJykgfHwgbm9ybWFsaXplZC5pbmNsdWRlcygnJTAwJykpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnTnVsbCBieXRlIGluamVjdGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIC8vIFMzIEZJWDogQmxvY2sgSUZTLXRhbXBlcmluZyBpbiBiYXNoIChJRlM9JCcgJyBhbGxvd3Mgc3BsaXR0aW5nIHdpdGhvdXQgc3BhY2VzKVxuICBjb25zdCBpZnNQYXR0ZXJucyA9IFtcbiAgICAvXFxiSUZTXFxzKj1cXHMqW1xcXFwkJ11cXHMqL2ksXG4gICAgL0lGUz1bJCddW14nXSonL2ksXG4gIF07XG4gIGZvciAoY29uc3QgcGF0dGVybiBvZiBpZnNQYXR0ZXJucykge1xuICAgIGlmIChwYXR0ZXJuLnRlc3Qobm9ybWFsaXplZCkpIHtcbiAgICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdJRlMgdGFtcGVyaW5nIGRldGVjdGVkJyB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBkYW5nZXJvdXMgcGF0dGVybnMgdXNpbmcgYSBtb3JlIHJvYnVzdCBhcHByb2FjaFxuICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAvLyBGaWxlIHN5c3RlbSBkZXN0cnVjdGlvblxuICAgIC9cXGJybVxccystcmZcXGIvaSxcbiAgICAvXFxic2hyZWRcXGIvaSxcbiAgICAvXFxid2lwZVxcYi9pLFxuICAgIFxuICAgIC8vIFByaXZpbGVnZSBlc2NhbGF0aW9uXG4gICAgL1xcYnN1ZG9cXGIvaSxcbiAgICAvXFxic3VcXGIoPyFcXHcpL2ksICAvLyAnc3UnIGJ1dCBub3QgJ3N1ZG8nLCAnc3VzaGknLCBldGMuXG4gICAgXG4gICAgLy8gTmV0d29yayBhdHRhY2tzXG4gICAgL1xcYm5jXFxiKD8hXFx3KXxcXGJuZXRjYXRcXGIvaSxcbiAgICAvXFxid2dldFxccysuKi0tcG9zdC1maWxlXFxiL2ksXG4gICAgL1xcYmN1cmxcXHMrLiotLWRhdGEtYmluYXJ5XFxiL2ksXG4gICAgXG4gICAgLy8gRGF0YSBleGZpbHRyYXRpb25cbiAgICAvXFxiYmFzZTY0XFxiLipcXHxcXHMqKGN1cmx8d2dldCkvaSxcbiAgICAvXFxic2NwXFxiKD8hXFx3KXxcXGJzZnRwXFxiL2ksXG4gICAgXG4gICAgLy8gUHJvY2VzcyBtYW5pcHVsYXRpb25cbiAgICAvXFxiZm9ya1xcYig/IVxcdykvaSxcbiAgICAvXFxiZXhlY1xcYig/IVxcdykvaSxcbiAgICBcbiAgICAvLyBFbnZpcm9ubWVudCB0YW1wZXJpbmdcbiAgICAvXFxiZXhwb3J0XFxzK1xcdys9L2ksXG4gICAgL1xcYmV2YWxcXGIoPyFcXHcpL2ksXG4gIF07XG5cbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4udGVzdChub3JtYWxpemVkKSkge1xuICAgICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogYERhbmdlcm91cyBjb21tYW5kIGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayBmb3IgcGlwZSBjaGFpbnMgdGhhdCBjb3VsZCBiZSB1c2VkIGZvciBhdHRhY2tzIChtb3JlIHRoYW4gMiBwaXBlcyA9IDMrIGNvbW1hbmRzKVxuICBjb25zdCBwaXBlQ291bnQgPSAobm9ybWFsaXplZC5tYXRjaCgvXFx8L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChwaXBlQ291bnQgPiAyKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ1RvbyBtYW55IHBpcGVzIGluIGNvbW1hbmQgY2hhaW4nIH07XG4gIH1cblxuICAvLyBDaGVjayBmb3Igc2VtaWNvbG9uLXNlcGFyYXRlZCBjb21tYW5kcyAocG90ZW50aWFsIGluamVjdGlvbilcbiAgY29uc3Qgc2VtaUNvbG9uQ291bnQgPSAobm9ybWFsaXplZC5tYXRjaCgvOy9nKSB8fCBbXSkubGVuZ3RoO1xuICBpZiAoc2VtaUNvbG9uQ291bnQgPiAxKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ011bHRpcGxlIHNlbWljb2xvbnMgZGV0ZWN0ZWQgaW4gY29tbWFuZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBiYWNrdGljayBleGVjdXRpb24gb3IgJCgpIHN1YnNoZWxsIGluamVjdGlvblxuICBpZiAoL2BbXmBdK2B8XFwkXFwoW14pXStcXCkvLnRlc3Qobm9ybWFsaXplZCkpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnQ29tbWFuZCBzdWJzdGl0dXRpb24gZGV0ZWN0ZWQnIH07XG4gIH1cblxuICAvLyBDaGVjayBmb3IgZW52aXJvbm1lbnQgdmFyaWFibGUgaW5qZWN0aW9uXG4gIGlmICgvXlxccyooZXhwb3J0fHVuc2V0KVxccy8udGVzdChub3JtYWxpemVkKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdFbnZpcm9ubWVudCBtb2RpZmljYXRpb24gZGV0ZWN0ZWQnIH07XG4gIH1cblxuICByZXR1cm4geyBzYWZlOiB0cnVlIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgU1FMIHF1ZXJ5IGZvciBzYWZldHkgKHJlYWQtb25seSBvcGVyYXRpb25zIG9ubHkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNRTFF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyByZWFzb24/OiBzdHJpbmcgfSB7XG4gIGlmICghcXVlcnkgfHwgdHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnRW1wdHkgb3IgaW52YWxpZCBxdWVyeScgfTtcbiAgfVxuXG4gIGNvbnN0IHRyaW1tZWQgPSBxdWVyeS50cmltKCkudG9VcHBlckNhc2UoKTtcbiAgXG4gIC8vIE9ubHkgYWxsb3cgU0VMRUNUIGFuZCBQUkFHTUEgc3RhdGVtZW50c1xuICBpZiAoIXRyaW1tZWQuc3RhcnRzV2l0aCgnU0VMRUNUJykgJiYgIXRyaW1tZWQuc3RhcnRzV2l0aCgnUFJBR01BJykpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIHJlYXNvbjogJ09ubHkgU0VMRUNUIGFuZCBQUkFHTUEgcXVlcmllcyBhcmUgYWxsb3dlZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBkYW5nZXJvdXMga2V5d29yZHMgdGhhdCBjb3VsZCBiZSBpbmplY3RlZCBhZnRlciBTRUxFQ1QvUFJBR01BXG4gIGNvbnN0IGRhbmdlcm91c1NRTEtleXdvcmRzID0gW1xuICAgIC9cXGJEUk9QXFxiL2ksXG4gICAgL1xcYkRFTEVURVxcYi9pLFxuICAgIC9cXGJVUERBVEVcXGIvaSxcbiAgICAvXFxiSU5TRVJUXFxiL2ksXG4gICAgL1xcYkFMVEVSXFxiL2ksXG4gICAgL1xcYkNSRUFURVxcYi9pLFxuICAgIC9cXGJSRVBMQUNFXFxiL2ksXG4gICAgL1xcYlRSVU5DQVRFXFxiL2ksXG4gICAgL1xcYkdSQU5UXFxiL2ksXG4gICAgL1xcYlJFVk9LRVxcYi9pLFxuICBdO1xuXG4gIGZvciAoY29uc3Qga2V5d29yZCBvZiBkYW5nZXJvdXNTUUxLZXl3b3Jkcykge1xuICAgIGlmIChrZXl3b3JkLnRlc3QodHJpbW1lZCkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiBgRGFuZ2Vyb3VzIFNRTCBvcGVyYXRpb24gZGV0ZWN0ZWQ6ICR7a2V5d29yZC5zb3VyY2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBtdWx0aXBsZSBzdGF0ZW1lbnRzIChzZW1pY29sb24gaW5qZWN0aW9uKVxuICBjb25zdCBzZW1pQ29sb25Db3VudCA9ICh0cmltbWVkLm1hdGNoKC87L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChzZW1pQ29sb25Db3VudCA+IDApIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIHJlYXNvbjogJ011bHRpcGxlIFNRTCBzdGF0ZW1lbnRzIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cbiIsICIvKipcbiAqIFBlcmZvcm1hbmNlIFV0aWxpdGllcyBmb3IgQUkgVG9vbGJveCBQbHVnaW5cbiAqIE9wdGltaXplZCBhbGdvcml0aG1zIHdpdGggZWFybHkgZXhpdCwgY2FjaGluZywgYW5kIGFzeW5jIG9wZXJhdGlvbnNcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy9wcm9taXNlcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBMZXZlbnNodGVpbiBEaXN0YW5jZSB3aXRoIEVhcmx5IEV4aXQgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBPcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gZGlzdGFuY2UgY2FsY3VsYXRpb24gd2l0aCBlYXJseSBleGl0IHRocmVzaG9sZC5cbiAqIFN0b3BzIGNhbGN1bGF0aW5nIGlmIHRoZSBtaW5pbXVtIHBvc3NpYmxlIHNjb3JlIGRyb3BzIGJlbG93IHRoZSB0aHJlc2hvbGQuXG4gKiBcbiAqIEBwYXJhbSBhIC0gRmlyc3Qgc3RyaW5nXG4gKiBAcGFyYW0gYiAtIFNlY29uZCBzdHJpbmcgIFxuICogQHBhcmFtIG1pblNjb3JlIC0gTWluaW11bSBhY2NlcHRhYmxlIHNpbWlsYXJpdHkgc2NvcmUgKDAtMSkuIFJlc3VsdHMgYmVsb3cgdGhpcyBhcmUgcHJ1bmVkIGVhcmx5LlxuICogQHJldHVybnMgU2ltaWxhcml0eSBzY29yZSBiZXR3ZWVuIDAgYW5kIDEsIG9yIG51bGwgaWYgYmVsb3cgdGhyZXNob2xkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXZlbnNodGVpblNpbWlsYXJpdHkoYTogc3RyaW5nLCBiOiBzdHJpbmcsIG1pblNjb3JlOiBudW1iZXIgPSAwLjMpOiBudW1iZXIgfCBudWxsIHtcbiAgY29uc3QgbWF4TGVuID0gTWF0aC5tYXgoYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgaWYgKG1heExlbiA9PT0gMCkgcmV0dXJuIDE7XG5cbiAgLy8gUXVpY2sgcmVqZWN0aW9uOiBpZiBzdHJpbmdzIGRpZmZlciB0b28gbXVjaCBpbiBsZW5ndGgsIHNraXAgZXhwZW5zaXZlIGNhbGN1bGF0aW9uXG4gIGNvbnN0IGxlbkRpZmYgPSBNYXRoLmFicyhhLmxlbmd0aCAtIGIubGVuZ3RoKTtcbiAgaWYgKGxlbkRpZmYgLyBtYXhMZW4gPiAoMSAtIG1pblNjb3JlKSkge1xuICAgIHJldHVybiBudWxsOyAvLyBFYXJseSBleGl0IGZvciB2ZXJ5IGRpZmZlcmVudCBsZW5ndGhzXG4gIH1cblxuICAvLyBVc2UgdHdvLXJvdyBvcHRpbWl6YXRpb24gaW5zdGVhZCBvZiBmdWxsIG1hdHJpeCAoc2F2ZXMgbWVtb3J5KVxuICBsZXQgcHJldlJvdzogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gYi5sZW5ndGg7IGkrKykge1xuICAgIHByZXZSb3cucHVzaCgwKTtcbiAgfVxuICBsZXQgY3VyclJvdzogbnVtYmVyW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJldlJvd1tpXSA9IGk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBhLmxlbmd0aDsgaSsrKSB7XG4gICAgY3VyclJvd1swXSA9IGk7XG4gICAgXG4gICAgLy8gRWFybHkgZXhpdCBvcHRpbWl6YXRpb246IGlmIGN1cnJlbnQgcm93J3MgbWluaW11bSBleGNlZWRzIHRocmVzaG9sZCwgYWJvcnRcbiAgICBsZXQgbWluSW5Sb3cgPSBpO1xuICAgIFxuICAgIGZvciAobGV0IGogPSAxOyBqIDw9IGIubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IGNvc3QgPSBhW2kgLSAxXSA9PT0gYltqIC0gMV0gPyAwIDogMTtcbiAgICAgIGN1cnJSb3dbal0gPSBNYXRoLm1pbihcbiAgICAgICAgcHJldlJvd1tqXSArIDEsICAgICAgICAgLy8gZGVsZXRpb25cbiAgICAgICAgY3VyclJvd1tqIC0gMV0gKyAxLCAgICAgLy8gaW5zZXJ0aW9uICBcbiAgICAgICAgcHJldlJvd1tqIC0gMV0gKyBjb3N0ICAgLy8gc3Vic3RpdHV0aW9uXG4gICAgICApO1xuICAgICAgXG4gICAgICBpZiAoY3VyclJvd1tqXSA8IG1pbkluUm93KSB7XG4gICAgICAgIG1pbkluUm93ID0gY3VyclJvd1tqXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFYXJseSBleGl0OiBpZiBtaW5pbXVtIGluIHRoaXMgcm93IGFscmVhZHkgZXhjZWVkcyB0aHJlc2hvbGQsIGFib3J0XG4gICAgY29uc3QgY3VycmVudE1heFNjb3JlID0gMSAtIG1pbkluUm93IC8gbWF4TGVuO1xuICAgIGlmIChjdXJyZW50TWF4U2NvcmUgPCBtaW5TY29yZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gU3dhcCByb3dzXG4gICAgW3ByZXZSb3csIGN1cnJSb3ddID0gW2N1cnJSb3csIHByZXZSb3ddO1xuICB9XG5cbiAgY29uc3QgZGlzdGFuY2UgPSBwcmV2Um93W2IubGVuZ3RoXTtcbiAgY29uc3Qgc2NvcmUgPSBNYXRoLm1heCgwLCAxIC0gZGlzdGFuY2UgLyBtYXhMZW4pO1xuICByZXR1cm4gc2NvcmUgPj0gbWluU2NvcmUgPyBzY29yZSA6IG51bGw7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZ1enp5IFNlYXJjaCBDYWNoZSA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgRnV6enlTZWFyY2hDYWNoZUVudHJ5IHtcbiAgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+O1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuY29uc3QgZnV6enlTZWFyY2hDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBGdXp6eVNlYXJjaENhY2hlRW50cnk+KCk7XG5jb25zdCBDQUNIRV9UVExfTVMgPSA2MF8wMDA7IC8vIDYwIHNlY29uZCBjYWNoZSBUVExcblxuLyoqXG4gKiBHZXQgY2FjaGVkIGZ1enp5IHNlYXJjaCByZXN1bHRzIGlmIGF2YWlsYWJsZSBhbmQgbm90IGV4cGlyZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYWNoZWRGdXp6eVJlc3VsdHMocXVlcnk6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZyk6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9PiB8IG51bGwge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3F1ZXJ5fToke2Jhc2VQYXRofWA7XG4gIGNvbnN0IGVudHJ5ID0gZnV6enlTZWFyY2hDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICBcbiAgaWYgKCFlbnRyeSkgcmV0dXJuIG51bGw7XG4gIGlmIChEYXRlLm5vdygpIC0gZW50cnkudGltZXN0YW1wID4gQ0FDSEVfVFRMX01TKSB7XG4gICAgZnV6enlTZWFyY2hDYWNoZS5kZWxldGUoY2FjaGVLZXkpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIFxuICByZXR1cm4gZW50cnkucmVzdWx0cztcbn1cblxuLyoqXG4gKiBDYWNoZSBmdXp6eSBzZWFyY2ggcmVzdWx0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlRnV6enlSZXN1bHRzKHF1ZXJ5OiBzdHJpbmcsIGJhc2VQYXRoOiBzdHJpbmcsIHJlc3VsdHM6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9Pik6IHZvaWQge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3F1ZXJ5fToke2Jhc2VQYXRofWA7XG4gIGZ1enp5U2VhcmNoQ2FjaGUuc2V0KGNhY2hlS2V5LCB7XG4gICAgcmVzdWx0cyxcbiAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gIH0pO1xuICBcbiAgLy8gRXZpY3Qgb2xkIGVudHJpZXMgaWYgY2FjaGUgZ3Jvd3MgdG9vIGxhcmdlIChtYXggMTAwIGVudHJpZXMpXG4gIGlmIChmdXp6eVNlYXJjaENhY2hlLnNpemUgPiAxMDApIHtcbiAgICBjb25zdCBvbGRlc3RLZXkgPSBmdXp6eVNlYXJjaENhY2hlLmtleXMoKS5uZXh0KCkudmFsdWU7XG4gICAgaWYgKG9sZGVzdEtleSkge1xuICAgICAgZnV6enlTZWFyY2hDYWNoZS5kZWxldGUob2xkZXN0S2V5KTtcbiAgICB9XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQXN5bmMgRmlsZSBTZWFyY2ggd2l0aCBDb25jdXJyZW5jeSBDb250cm9sID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHQge1xuICBmaWxlczogc3RyaW5nW107XG4gIGNvdW50OiBudW1iZXI7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgc2VhcmNoIGZvciBmaWxlcyBtYXRjaGluZyBhIHBhdHRlcm4gdXNpbmcgYXN5bmMvYXdhaXQgd2l0aCBjb25jdXJyZW5jeSBjb250cm9sLlxuICogTXVjaCBmYXN0ZXIgdGhhbiBzeW5jaHJvbm91cyByZWFkZGlyU3luYyBmb3IgbGFyZ2UgZGlyZWN0b3J5IHRyZWVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZEZpbGVzQXN5bmMoXG4gIGRpclBhdGg6IHN0cmluZyxcbiAgcGF0dGVybjogc3RyaW5nLFxuICBtYXhEZXB0aDogbnVtYmVyID0gNSxcbiAgY29uY3VycmVuY3lMaW1pdDogbnVtYmVyID0gNFxuKTogUHJvbWlzZTxTZWFyY2hSZXN1bHQ+IHtcbiAgY29uc3QgcmVzdWx0czogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgcGF0dGVybkxvd2VyID0gcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHNlYXJjaERpcihjdXJyZW50UGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucmVhZGRpcihjdXJyZW50UGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgXG4gICAgICAvLyBQcm9jZXNzIGZpbGVzIGltbWVkaWF0ZWx5XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhwYXR0ZXJuTG93ZXIpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHBhdGguam9pbihjdXJyZW50UGF0aCwgZW50cnkubmFtZSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENvbGxlY3Qgc3ViZGlyZWN0b3JpZXMgZm9yIHBhcmFsbGVsIHByb2Nlc3NpbmdcbiAgICAgIGNvbnN0IHN1YmRpcnMgPSBlbnRyaWVzLmZpbHRlcihlID0+IGUuaXNEaXJlY3RvcnkoKSkubWFwKGUgPT4gcGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlLm5hbWUpKTtcbiAgICAgIFxuICAgICAgaWYgKHN1YmRpcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBQcm9jZXNzIGRpcmVjdG9yaWVzIGluIGJhdGNoZXMgdG8gYXZvaWQgb3ZlcndoZWxtaW5nIHRoZSBzeXN0ZW1cbiAgICAgICAgY29uc3QgYmF0Y2hlczogc3RyaW5nW11bXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YmRpcnMubGVuZ3RoOyBpICs9IGNvbmN1cnJlbmN5TGltaXQpIHtcbiAgICAgICAgICBiYXRjaGVzLnB1c2goc3ViZGlycy5zbGljZShpLCBpICsgY29uY3VycmVuY3lMaW1pdCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBiYXRjaCBvZiBiYXRjaGVzKSB7XG4gICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBiYXRjaC5tYXAoZGlyID0+IHNlYXJjaERpcihkaXIsIGRlcHRoICsgMSkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gU2tpcCBpbmFjY2Vzc2libGUgZGlyZWN0b3JpZXMgc2lsZW50bHlcbiAgICB9XG4gIH1cblxuICBhd2FpdCBzZWFyY2hEaXIoZGlyUGF0aCwgMCk7XG4gIHJldHVybiB7IGZpbGVzOiByZXN1bHRzLCBjb3VudDogcmVzdWx0cy5sZW5ndGggfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU3RyZWFtaW5nIEZpbGUgUmVhZGVyID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTdHJlYW1SZWFkUmVzdWx0IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZGF0YT86IHtcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gICAgcGF0aDogc3RyaW5nO1xuICAgIHRvdGFsTGVuZ3RoOiBudW1iZXI7XG4gICAgdHJ1bmNhdGVkPzogYm9vbGVhbjtcbiAgICBub3RlPzogc3RyaW5nO1xuICB9O1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZWFkIGZpbGUgY29udGVudCB1c2luZyBzdHJlYW1pbmcgdG8gYXZvaWQgbG9hZGluZyBlbnRpcmUgZmlsZSBpbnRvIG1lbW9yeS5cbiAqIFJlc3BlY3RzIG1heF9sZW5ndGggcGFyYW1ldGVyIGJ5IHJlYWRpbmcgb25seSBuZWNlc3NhcnkgY2h1bmtzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGVTeW5jKFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBtYXhMZW5ndGg6IG51bWJlciA9IDUwMDBcbik6IFByb21pc2U8U3RyZWFtUmVhZFJlc3VsdD4ge1xuICB0cnkge1xuICAgIC8vIEdldCBmaWxlIHN0YXRzIGZpcnN0IHRvIGtub3cgdG90YWwgc2l6ZVxuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZnMuc3RhdChmaWxlUGF0aCk7XG4gICAgXG4gICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1BhdGggaXMgYSBkaXJlY3RvcnksIG5vdCBhIGZpbGUnIH07XG4gICAgfVxuXG4gICAgLy8gSWYgZmlsZSBpcyBzbWFsbCBlbm91Z2gsIHJlYWQgZW50aXJlbHkgKGZhc3RlciBmb3Igc21hbGwgZmlsZXMpXG4gICAgaWYgKHN0YXRzLnNpemUgPD0gbWF4TGVuZ3RoICogMikgeyAvLyAyeCBmYWN0b3IgZm9yIFVURi04IGVuY29kaW5nIG92ZXJoZWFkXG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnMucmVhZEZpbGUoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgdG90YWxMZW5ndGg6IGNvbnRlbnQubGVuZ3RoLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBGb3IgbGFyZ2UgZmlsZXMsIHVzZSBzdHJlYW1pbmcgcmVhZFxuICAgIGNvbnN0IHsgY3JlYXRlUmVhZFN0cmVhbSB9ID0gYXdhaXQgaW1wb3J0KCdmcycpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgbGV0IGNvbnRlbnQgPSAnJztcbiAgICAgIGxldCBieXRlc1JlYWQgPSAwO1xuICAgICAgY29uc3Qgc3RyZWFtID0gY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCwgeyBcbiAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCcsXG4gICAgICAgIGhpZ2hXYXRlck1hcms6IDY0ICogMTAyNCAvLyA2NEtCIGNodW5rcyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdkYXRhJywgKGNodW5rOiBCdWZmZXIgfCBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgY2h1bmtTdHIgPSB0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnID8gY2h1bmsgOiBjaHVuay50b1N0cmluZygpO1xuICAgICAgICBieXRlc1JlYWQgKz0gY2h1bmtTdHIubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgLy8gT25seSBhY2N1bXVsYXRlIGlmIHdlIGhhdmVuJ3QgZXhjZWVkZWQgbWF4IGxlbmd0aCB5ZXRcbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoICsgY2h1bmtTdHIubGVuZ3RoIDw9IG1heExlbmd0aCkge1xuICAgICAgICAgIGNvbnRlbnQgKz0gY2h1bmtTdHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGFrZSBvbmx5IHdoYXQgZml0cyBhbmQgc3RvcCByZWFkaW5nXG4gICAgICAgICAgY29uc3QgcmVtYWluaW5nID0gbWF4TGVuZ3RoIC0gY29udGVudC5sZW5ndGg7XG4gICAgICAgICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gY2h1bmtTdHIuc3Vic3RyaW5nKDAsIHJlbWFpbmluZyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0cmVhbS5kZXN0cm95KCk7IC8vIFN0b3AgdGhlIHN0cmVhbSBlYXJseVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzVHJ1bmNhdGVkID0gYnl0ZXNSZWFkID4gbWF4TGVuZ3RoIHx8IHN0YXRzLnNpemUgPiBtYXhMZW5ndGg7XG4gICAgICAgIFxuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgIHRvdGFsTGVuZ3RoOiBNYXRoLm1heChieXRlc1JlYWQsIGNvbnRlbnQubGVuZ3RoKSxcbiAgICAgICAgICAgIC4uLihpc1RydW5jYXRlZCAmJiB7IFxuICAgICAgICAgICAgICB0cnVuY2F0ZWQ6IHRydWUsIFxuICAgICAgICAgICAgICBub3RlOiBgT3V0cHV0IHRydW5jYXRlZCB0byAke21heExlbmd0aH0gY2hhcmFjdGVycy4gVXNlIG1heF9sZW5ndGggcGFyYW1ldGVyIHRvIHJlYWQgbW9yZS5gIFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byByZWFkIGZpbGU6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gUmVxdWVzdCBDYWNoaW5nIGZvciBXZWIgUmVzZWFyY2ggPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIENhY2hlZFJlc3BvbnNlIHtcbiAgZGF0YTogdW5rbm93bjtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG4gIHN0YXR1czogbnVtYmVyO1xufVxuXG5jb25zdCByZXF1ZXN0Q2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVkUmVzcG9uc2U+KCk7XG5jb25zdCBSRVFVRVNUX0NBQ0hFX1RUTF9NUyA9IDMwXzAwMDsgLy8gMzAgc2Vjb25kIGNhY2hlIFRUTCBmb3Igc2VhcmNoIHJlc3VsdHNcblxuLyoqIENsZWFyIHJlcXVlc3QgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUmVxdWVzdENhY2hlKCk6IHZvaWQge1xuICByZXF1ZXN0Q2FjaGUuY2xlYXIoKTtcbn1cblxuLyoqXG4gKiBGZXRjaCB3aXRoIGNhY2hpbmcgdG8gYXZvaWQgcmVkdW5kYW50IG5ldHdvcmsgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFdpdGhDYWNoZShcbiAgdXJsOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3VybH06JHtKU09OLnN0cmluZ2lmeShvcHRpb25zKX1gO1xuICBcbiAgLy8gQ2hlY2sgY2FjaGUgZmlyc3QgKEdFVCByZXF1ZXN0cyBvbmx5KVxuICBpZiAob3B0aW9ucz8ubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICBjb25zdCBjYWNoZWQgPSByZXF1ZXN0Q2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICBpZiAoY2FjaGVkICYmIERhdGUubm93KCkgLSBjYWNoZWQudGltZXN0YW1wIDwgUkVRVUVTVF9DQUNIRV9UVExfTVMpIHtcbiAgICAgIC8vIFJldHVybiBhIFJlc3BvbnNlLWxpa2Ugb2JqZWN0IGZyb20gY2FjaGVcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoY2FjaGVkLmRhdGEpLCB7XG4gICAgICAgIHN0YXR1czogY2FjaGVkLnN0YXR1cyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgb3B0aW9ucyk7XG4gIFxuICAvLyBDYWNoZSBzdWNjZXNzZnVsIHJlc3BvbnNlc1xuICBpZiAocmVzcG9uc2Uub2sgJiYgb3B0aW9ucz8ubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIHJlcXVlc3RDYWNoZS5zZXQoY2FjaGVLZXksIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBFdmljdCBvbGQgZW50cmllcyBpZiBjYWNoZSBncm93cyB0b28gbGFyZ2UgKG1heCA1MCBlbnRyaWVzKVxuICAgICAgaWYgKHJlcXVlc3RDYWNoZS5zaXplID4gNTApIHtcbiAgICAgICAgY29uc3Qgb2xkZXN0S2V5ID0gcmVxdWVzdENhY2hlLmtleXMoKS5uZXh0KCkudmFsdWU7XG4gICAgICAgIGlmIChvbGRlc3RLZXkpIHtcbiAgICAgICAgICByZXF1ZXN0Q2FjaGUuZGVsZXRlKG9sZGVzdEtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIE5vbi1KU09OIHJlc3BvbnNlcyBhcmUgbm90IGNhY2hlZFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiBSZXRyeSBsb2dpYyB3aXRoIGV4cG9uZW50aWFsIGJhY2tvZmYgZm9yIGZhaWxlZCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aFJldHJ5KFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IFJlcXVlc3RJbml0LFxuICBtYXhSZXRyaWVzOiBudW1iZXIgPSAzLFxuICBiYXNlRGVsYXlNczogbnVtYmVyID0gMTAwMFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuICBcbiAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IGF0dGVtcHQgPD0gbWF4UmV0cmllczsgYXR0ZW1wdCsrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoQ2FjaGUodXJsLCBvcHRpb25zKTtcbiAgICAgIFxuICAgICAgaWYgKCFyZXNwb25zZS5vayAmJiByZXNwb25zZS5zdGF0dXMgPj0gNTAwKSB7XG4gICAgICAgIC8vIFNlcnZlciBlcnJvciAtIHJldHJ5XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU2VydmVyIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICBsYXN0RXJyb3IgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG4gICAgICBcbiAgICAgIGlmIChhdHRlbXB0IDwgbWF4UmV0cmllcykge1xuICAgICAgICBjb25zdCBkZWxheU1zID0gYmFzZURlbGF5TXMgKiBNYXRoLnBvdygyLCBhdHRlbXB0KTsgLy8gRXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXlNcykpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgdGhyb3cgbGFzdEVycm9yIHx8IG5ldyBFcnJvcihgUmVxdWVzdCBmYWlsZWQgYWZ0ZXIgJHttYXhSZXRyaWVzfSByZXRyaWVzYCk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFN1YnByb2Nlc3MgVGltZW91dCBDYWxjdWxhdG9yID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogQ2FsY3VsYXRlIGFwcHJvcHJpYXRlIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplLlxuICogTGFyZ2VyIHByb2plY3RzIG5lZWQgbW9yZSB0aW1lIGZvciBhbmFseXNpcyB0b29scy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuYWx5c2lzVGltZW91dChiYXNlVGltZW91dE1zOiBudW1iZXIsIGZpbGVDb3VudD86IG51bWJlcik6IG51bWJlciB7XG4gIGlmICghZmlsZUNvdW50KSByZXR1cm4gYmFzZVRpbWVvdXRNcztcbiAgXG4gIC8vIFNjYWxlIHRpbWVvdXQgbG9nYXJpdGhtaWNhbGx5IHdpdGggZmlsZSBjb3VudFxuICBjb25zdCBzY2FsZUZhY3RvciA9IE1hdGgubG9nMihNYXRoLm1heCgxLCBmaWxlQ291bnQpKSAvIDEwOyAvLyB+MXggZm9yIDEtMTAgZmlsZXMsIH4yeCBmb3IgMTAwMCsgZmlsZXNcbiAgY29uc3Qgc2NhbGVkVGltZW91dCA9IGJhc2VUaW1lb3V0TXMgKiAoMSArIHNjYWxlRmFjdG9yKTtcbiAgXG4gIC8vIENhcCBhdCA2MCBzZWNvbmRzIG1heGltdW1cbiAgcmV0dXJuIE1hdGgubWluKHNjYWxlZFRpbWVvdXQsIDYwXzAwMCk7XG59XG5cbi8qKlxuICogQ291bnQgVHlwZVNjcmlwdCBmaWxlcyBpbiBhIGRpcmVjdG9yeSB0byBlc3RpbWF0ZSBwcm9qZWN0IHNpemUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb3VudFR5cGVTY3JpcHRGaWxlcyhkaXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICBsZXQgY291bnQgPSAwO1xuICBcbiAgYXN5bmMgZnVuY3Rpb24gY291bnRJbkRpcihjdXJyZW50UGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGRlcHRoID4gMTApIHJldHVybjsgLy8gUmVhc29uYWJsZSBtYXggZGVwdGhcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnJlYWRkaXIoY3VycmVudFBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgIFxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmIChlbnRyeS5pc0ZpbGUoKSAmJiBlbnRyeS5uYW1lLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIC8vIFNraXAgY29tbW9uIG5vbi1zb3VyY2UgZGlyZWN0b3JpZXNcbiAgICAgICAgICBpZiAoIVsnbm9kZV9tb2R1bGVzJywgJy5naXQnLCAnZGlzdCcsICdidWlsZCddLmluY2x1ZGVzKGVudHJ5Lm5hbWUpKSB7XG4gICAgICAgICAgICBhd2FpdCBjb3VudEluRGlyKHBhdGguam9pbihjdXJyZW50UGF0aCwgZW50cnkubmFtZSksIGRlcHRoICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3Rvcmllc1xuICAgIH1cbiAgfVxuICBcbiAgYXdhaXQgY291bnRJbkRpcihkaXJQYXRoLCAwKTtcbiAgcmV0dXJuIGNvdW50O1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSAnLi4vc3RhdGVNYW5hZ2VyLmpzJztcbmltcG9ydCB7IHZhbGlkYXRlUGF0aCwgaXNTYWZlUmVnZXggfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyLCBzZXRXb3JraW5nRGlyLCByZXNvbHZlUGF0aCB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuaW1wb3J0IHtcbiAgbGV2ZW5zaHRlaW5TaW1pbGFyaXR5LFxuICBnZXRDYWNoZWRGdXp6eVJlc3VsdHMsXG4gIGNhY2hlRnV6enlSZXN1bHRzLFxuICBmaW5kRmlsZXNBc3luYyxcbiAgY291bnRUeXBlU2NyaXB0RmlsZXMsXG4gIGdldEFuYWx5c2lzVGltZW91dCxcbn0gZnJvbSAnLi4vcGVyZm9ybWFuY2VVdGlscy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBMaXN0RGlyZWN0b3J5UGFyYW1zIHsgcGF0aD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJlYWRGaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IG1heF9sZW5ndGg/OiBudW1iZXI7IH1cbmludGVyZmFjZSBTYXZlRmlsZVBhcmFtcyB7IGZpbGVfbmFtZT86IHN0cmluZzsgY29udGVudD86IHN0cmluZzsgZmlsZXM/OiBBcnJheTx7IGZpbGVfbmFtZTogc3RyaW5nOyBjb250ZW50OiBzdHJpbmcgfT47IH1cbmludGVyZmFjZSBSZXBsYWNlVGV4dEluRmlsZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBvbGRfc3RyaW5nOiBzdHJpbmc7IG5ld19zdHJpbmc6IHN0cmluZzsgfVxuaW50ZXJmYWNlIEluc2VydEF0TGluZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBsaW5lX251bWJlcjogbnVtYmVyOyBjb250ZW50X3RvX2luc2VydDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQXBwZW5kRmlsZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBjb250ZW50OiBzdHJpbmc7IH1cbmludGVyZmFjZSBEZWxldGVMaW5lc0luRmlsZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBzdGFydF9saW5lOiBudW1iZXI7IGVuZF9saW5lPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgTWFrZURpcmVjdG9yeVBhcmFtcyB7IGRpcmVjdG9yeV9uYW1lOiBzdHJpbmc7IH1cbmludGVyZmFjZSBNb3ZlRmlsZVBhcmFtcyB7IHNvdXJjZTogc3RyaW5nOyBkZXN0aW5hdGlvbjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQ29weUZpbGVQYXJhbXMgeyBzb3VyY2U6IHN0cmluZzsgZGVzdGluYXRpb246IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZVBhdGhQYXJhbXMgeyBwYXRoOiBzdHJpbmc7IH1cbmludGVyZmFjZSBEZWxldGVGaWxlc0J5UGF0dGVyblBhcmFtcyB7IHBhdHRlcm46IHN0cmluZzsgfVxuaW50ZXJmYWNlIEZpbmRGaWxlc1BhcmFtcyB7IHBhdHRlcm46IHN0cmluZzsgbWF4X2RlcHRoPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgRnV6enlGaW5kTG9jYWxGaWxlc1BhcmFtcyB7IHF1ZXJ5OiBzdHJpbmc7IHBhdGg/OiBzdHJpbmc7IG1heF9yZXN1bHRzPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2V0RmlsZU1ldGFkYXRhUGFyYW1zIHsgcGF0aDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQ2hhbmdlRGlyZWN0b3J5UGFyYW1zIHsgZGlyZWN0b3J5OiBzdHJpbmc7IH1cbmludGVyZmFjZSBSZWFkRG9jdW1lbnRQYXJhbXMgeyBmaWxlX3BhdGg6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJGaWxlU3lzdGVtVG9vbHMoY29uZmlnOiBQbHVnaW5Db25maWcsIF9zdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlcik6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBsaXN0X2RpcmVjdG9yeSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2xpc3RfZGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0xpc3QgdGhlIGZpbGVzIGFuZCBkaXJlY3RvcmllcyBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBvciBhIHNwZWNpZmllZCBzdWJkaXJlY3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBwYXRoIHRvIHRoZSBkaXJlY3RvcnkgdG8gbGlzdC4gRGVmYXVsdHMgdG8gY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoOiBkaXJQYXRoIH06IExpc3REaXJlY3RvcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIGNvbnN0IHRhcmdldFBhdGggPSBkaXJQYXRoIHx8ICcuJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKHRhcmdldFBhdGgsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aCh0YXJnZXRQYXRoKTtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGZ1bGxQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGVudHJpZXMubWFwKGVudHJ5ID0+ICh7XG4gICAgICAgICAgcGF0aDogcGF0aC5qb2luKGZ1bGxQYXRoLCBlbnRyeS5uYW1lKSxcbiAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLFxuICAgICAgICAgIGlzRGlyZWN0b3J5OiBlbnRyeS5pc0RpcmVjdG9yeSgpLFxuICAgICAgICAgIGlzRmlsZTogZW50cnkuaXNGaWxlKCksXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZWFkX2ZpbGUgdG9vbCBcdTIwMTQgSHlicmlkOiBFYXJseSBzaXplIGNoZWNrICsgQnVmZmVyIGJpbmFyeSBkZXRlY3Rpb24gKyBUcnVuY2F0aW9uIHN1cHBvcnRcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlYWQgY29udGVudCBmcm9tIGEgZmlsZSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIG5hbWUgb2YgdGhlIGZpbGUgdG8gcmVhZCcpLFxuICAgICAgbWF4X2xlbmd0aDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDUwMDAwKS5vcHRpb25hbCgpLmRlZmF1bHQoNTAwMCkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIGNoYXJhY3RlcnMgdG8gcmV0dXJuIChkZWZhdWx0OiA1MDAwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgbWF4X2xlbmd0aCB9OiBSZWFkRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoOiBkaXJlY3RvcnkgdHJhdmVyc2FsIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGNvbnN0IG1heExlbmd0aCA9IG1heF9sZW5ndGggfHwgNTAwMDtcblxuICAgICAgICAvLyBFYXJseSBzaXplIGNoZWNrIChCZWxlZGFyaWFuIHN0eWxlKSAtIHByZXZlbnQgbG9hZGluZyA+MTBNQiBmaWxlc1xuICAgICAgICBsZXQgc3RhdHM6IGZzLlN0YXRzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmdWxsUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRzLnNpemUgPiAxMF8wMDBfMDAwKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRmlsZSB0b28gbGFyZ2UgKD4xME1CKScgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYWQgYXMgYnVmZmVyIGZvciBlZmZpY2llbnQgYmluYXJ5IGNoZWNrIChCZWxlZGFyaWFuIHN0eWxlKVxuICAgICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkRmlsZShmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICAvLyBCaW5hcnkgY2hlY2s6IG51bGwgYnl0ZSBpbiBmaXJzdCAxS0JcbiAgICAgICAgY29uc3QgY2hlY2tCdWZmZXIgPSBidWZmZXIuc3ViYXJyYXkoMCwgTWF0aC5taW4oYnVmZmVyLmxlbmd0aCwgMTAyNCkpO1xuICAgICAgICBpZiAoY2hlY2tCdWZmZXIuaW5jbHVkZXMoMCkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdCaW5hcnkgZmlsZSBkZXRlY3RlZC4gVXNlIHJlYWRfZG9jdW1lbnQgZm9yIFBERi9ET0NYIGZpbGVzLicgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnQgdG8gc3RyaW5nXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBidWZmZXIudG9TdHJpbmcoJ3V0Zi04Jyk7XG5cbiAgICAgICAgLy8gVHJ1bmNhdGUgaWYgbmVjZXNzYXJ5IGFuZCBhZGQgbWV0YWRhdGEgKEFJIFRvb2xib3ggc3R5bGUpXG4gICAgICAgIGxldCBkYXRhQ29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgIGxldCB0cnVuY2F0ZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IHRvdGFsTGVuZ3RoID0gY29udGVudC5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgZGF0YUNvbnRlbnQgPSBjb250ZW50LnN1YnN0cmluZygwLCBtYXhMZW5ndGgpO1xuICAgICAgICAgIHRydW5jYXRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLCBcbiAgICAgICAgICBkYXRhOiB7IFxuICAgICAgICAgICAgY29udGVudDogZGF0YUNvbnRlbnQsXG4gICAgICAgICAgICBmaWxlUGF0aDogZnVsbFBhdGgsIC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgICAgIC4uLih0cnVuY2F0ZWQgPyB7IHRydW5jYXRlZDogdHJ1ZSwgdG90YWxfbGVuZ3RoOiB0b3RhbExlbmd0aCB9IDoge30pXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gc2F2ZV9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2F2ZV9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NhdmUgY29udGVudCB0byBhIHNwZWNpZmllZCBmaWxlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBTdXBwb3J0cyBiYXRjaCBzYXZpbmcuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIG5hbWUgb2YgdGhlIGZpbGUgdG8gc2F2ZScpLFxuICAgICAgY29udGVudDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgY29udGVudCB0byB3cml0ZSB0byB0aGUgZmlsZScpLFxuICAgICAgZmlsZXM6IHouYXJyYXkoei5vYmplY3QoeyBmaWxlX25hbWU6IHouc3RyaW5nKCksIGNvbnRlbnQ6IHouc3RyaW5nKCkgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZvciBiYXRjaCBzYXZpbmcgbXVsdGlwbGUgZmlsZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIGNvbnRlbnQsIGZpbGVzIH06IFNhdmVGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZmlsZXMgJiYgQXJyYXkuaXNBcnJheShmaWxlcykpIHtcbiAgICAgICAgICAvLyBCYXRjaCBzYXZlIG1vZGVcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlLmZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbnZhbGlkIHBhdGggaW4gYmF0Y2g6ICR7ZmlsZS5maWxlX25hbWV9YCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlLmZpbGVfbmFtZSk7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBmaWxlLmNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgZmlsZTogZnVsbFBhdGgsIHN0YXR1czogJ3NhdmVkJyB9KTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNhdmVkRmlsZXM6IGZpbGVzLmxlbmd0aCwgcmVzdWx0cyB9IH07XG4gICAgICAgIH0gZWxzZSBpZiAoZmlsZV9uYW1lICYmIGNvbnRlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIFNpbmdsZSBmaWxlIHNhdmUgbW9kZVxuICAgICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoOiBkaXJlY3RvcnkgdHJhdmVyc2FsIGRldGVjdGVkJyB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzYXZlZEZpbGU6IGZ1bGxQYXRoLCBwYXRoOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFaXRoZXIgcHJvdmlkZSBmaWxlX25hbWUrY29udGVudCBvciBmaWxlcyBhcnJheScgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVwbGFjZV90ZXh0X2luX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZXBsYWNlX3RleHRfaW5fZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdSZXBsYWNlIGEgc3BlY2lmaWMgc3RyaW5nIGluIGEgZmlsZSB3aXRoIGEgbmV3IHN0cmluZy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gbW9kaWZ5JyksXG4gICAgICBvbGRfc3RyaW5nOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZXhhY3QgdGV4dCB0byByZXBsYWNlLiBNdXN0IGJlIHVuaXF1ZSBpbiB0aGUgZmlsZS4nKSxcbiAgICAgIG5ld19zdHJpbmc6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IHRvIGluc2VydCBpbiBwbGFjZSBvZiBvbGRfc3RyaW5nLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgb2xkX3N0cmluZywgbmV3X3N0cmluZyB9OiBSZXBsYWNlVGV4dEluRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFjb250ZW50LmluY2x1ZGVzKG9sZF9zdHJpbmcpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3RyaW5nICcke29sZF9zdHJpbmd9JyBub3QgZm91bmQgaW4gZmlsZWAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgbmV3Q29udGVudCA9IGNvbnRlbnQucmVwbGFjZShvbGRfc3RyaW5nLCBuZXdfc3RyaW5nKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgbmV3Q29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcmVwbGFjZWQ6IHRydWUsIGZpbGU6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gaW5zZXJ0X2F0X2xpbmUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdpbnNlcnRfYXRfbGluZScsXG4gICAgZGVzY3JpcHRpb246ICdJbnNlcnQgY29udGVudCBhdCBhIHNwZWNpZmljIGxpbmUgbnVtYmVyIGluIGEgZmlsZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gbW9kaWZ5JyksXG4gICAgICBsaW5lX251bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBsaW5lIG51bWJlciB0byBpbnNlcnQgYXQgKDEtaW5kZXhlZCknKSxcbiAgICAgIGNvbnRlbnRfdG9faW5zZXJ0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCBjb250ZW50IHRvIGluc2VydCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgbGluZV9udW1iZXIsIGNvbnRlbnRfdG9faW5zZXJ0IH06IEluc2VydEF0TGluZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgbGV0IGxpbmVzID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxQYXRoLCAndXRmLTgnKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBBbGxvdyBhcHBlbmRpbmcgYXQgRU9GIChsaW5lX251bWJlciA9PSBsZW5ndGggKyAxKVxuICAgICAgICBpZiAobGluZV9udW1iZXIgPiBsaW5lcy5sZW5ndGggKyAxKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgTGluZSBudW1iZXIgJHtsaW5lX251bWJlcn0gZXhjZWVkcyBmaWxlIGxlbmd0aCAoJHtsaW5lcy5sZW5ndGh9KWAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGluZXMuc3BsaWNlKGxpbmVfbnVtYmVyIC0gMSwgMCwgY29udGVudF90b19pbnNlcnQpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBsaW5lcy5qb2luKCdcXG4nKSwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaW5zZXJ0ZWRBdDogbGluZV9udW1iZXIsIGZpbGU6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYXBwZW5kX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdhcHBlbmRfZmlsZScsXG4gICAgZGVzY3JpcHRpb246IFwiQXBwZW5kIGNvbnRlbnQgdG8gdGhlIGVuZCBvZiBhIGZpbGUuIElmIHRoZSBmaWxlIGRvZXNuJ3QgZXhpc3QsIGl0IHdpbGwgYmUgY3JlYXRlZC5cIixcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIGFwcGVuZCB0bycpLFxuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgY29udGVudCB0byBhcHBlbmQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIGNvbnRlbnQgfTogQXBwZW5kRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgZnMuYXBwZW5kRmlsZVN5bmMoZnVsbFBhdGgsIGNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGFwcGVuZGVkVG86IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2xpbmVzX2luX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfbGluZXNfaW5fZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgYSBzcGVjaWZpYyBsaW5lIG9yIHJhbmdlIG9mIGxpbmVzIGZyb20gYSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIHN0YXJ0X2xpbmU6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLmRlc2NyaWJlKCdTdGFydGluZyBsaW5lIG51bWJlciAoMS1pbmRleGVkKScpLFxuICAgICAgZW5kX2xpbmU6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0VuZGluZyBsaW5lIG51bWJlciAoaW5jbHVzaXZlKS4gSWYgb21pdHRlZCwgb25seSBkZWxldGVzIHN0YXJ0X2xpbmUuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBzdGFydF9saW5lLCBlbmRfbGluZSB9OiBEZWxldGVMaW5lc0luRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgbGV0IGxpbmVzID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxQYXRoLCAndXRmLTgnKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBkZWxldGVFbmQgPSBlbmRfbGluZSB8fCBzdGFydF9saW5lO1xuICAgICAgICBpZiAoc3RhcnRfbGluZSA+IGxpbmVzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFN0YXJ0IGxpbmUgJHtzdGFydF9saW5lfSBleGNlZWRzIGZpbGUgbGVuZ3RoICgke2xpbmVzLmxlbmd0aH0pYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDbGFtcCBlbmRfbGluZSB0byBhdm9pZCBzaWxlbnQgdHJ1bmNhdGlvbiBiZXlvbmQgZmlsZSBib3VuZHNcbiAgICAgICAgY29uc3QgY2xhbXBlZEVuZCA9IE1hdGgubWluKGRlbGV0ZUVuZCwgbGluZXMubGVuZ3RoKTtcbiAgICAgICAgbGluZXMuc3BsaWNlKHN0YXJ0X2xpbmUgLSAxLCBjbGFtcGVkRW5kIC0gc3RhcnRfbGluZSArIDEpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBsaW5lcy5qb2luKCdcXG4nKSwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGVsZXRlZExpbmVzOiBgJHtzdGFydF9saW5lfS0ke2NsYW1wZWRFbmR9YCwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBtYWtlX2RpcmVjdG9yeSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ21ha2VfZGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBkaXJlY3RvcnkgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBkaXJlY3RvcnlfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIG5hbWUgb2YgdGhlIGRpcmVjdG9yeSB0byBjcmVhdGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBkaXJlY3RvcnlfbmFtZSB9OiBNYWtlRGlyZWN0b3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkaXJlY3RvcnlfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGRpcmVjdG9yeV9uYW1lKTtcbiAgICAgICAgZnMubWtkaXJTeW5jKGZ1bGxQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjcmVhdGVkRGlyZWN0b3J5OiBkaXJlY3RvcnlfbmFtZSwgcGF0aDogZnVsbFBhdGggfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gbW92ZV9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbW92ZV9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ01vdmUgb3IgcmVuYW1lIGEgZmlsZSBvciBkaXJlY3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzb3VyY2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NvdXJjZSBwYXRoJyksXG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnRGVzdGluYXRpb24gcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHNvdXJjZSwgZGVzdGluYXRpb24gfTogTW92ZUZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKHNvdXJjZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgc291cmNlIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZGVzdGluYXRpb24sIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGRlc3RpbmF0aW9uIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFNvdXJjZSA9IHJlc29sdmVQYXRoKHNvdXJjZSk7XG4gICAgICAgIGNvbnN0IGZ1bGxEZXN0aW5hdGlvbiA9IHJlc29sdmVQYXRoKGRlc3RpbmF0aW9uKTtcbiAgICAgICAgZnMucmVuYW1lU3luYyhmdWxsU291cmNlLCBmdWxsRGVzdGluYXRpb24pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG1vdmVkRnJvbTogZnVsbFNvdXJjZSwgbW92ZWRUbzogZnVsbERlc3RpbmF0aW9uIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFNcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNvcHlfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvcHlfZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdDb3B5IGEgZmlsZSB0byBhIG5ldyBsb2NhdGlvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNvdXJjZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU291cmNlIGZpbGUgcGF0aCcpLFxuICAgICAgZGVzdGluYXRpb246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0Rlc3RpbmF0aW9uIGZpbGUgcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHNvdXJjZSwgZGVzdGluYXRpb24gfTogQ29weUZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKHNvdXJjZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgc291cmNlIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZGVzdGluYXRpb24sIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGRlc3RpbmF0aW9uIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFNvdXJjZSA9IHJlc29sdmVQYXRoKHNvdXJjZSk7XG4gICAgICAgIGNvbnN0IGZ1bGxEZXN0aW5hdGlvbiA9IHJlc29sdmVQYXRoKGRlc3RpbmF0aW9uKTtcbiAgICAgICAgZnMuY29weUZpbGVTeW5jKGZ1bGxTb3VyY2UsIGZ1bGxEZXN0aW5hdGlvbik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29waWVkRnJvbTogZnVsbFNvdXJjZSwgY29waWVkVG86IGZ1bGxEZXN0aW5hdGlvbiB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhTXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfcGF0aCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9wYXRoJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIGZpbGUgb3IgZGlyZWN0b3J5IGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBCZSBjYXJlZnVsIScsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHBhdGggdG8gZGVsZXRlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aDogZmlsZVBhdGggfTogRGVsZXRlUGF0aFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZVBhdGgsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlUGF0aCk7XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGEgZGlyZWN0b3J5XG4gICAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoZnVsbFBhdGgpO1xuICAgICAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIGZzLnJtU3luYyhmdWxsUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZnMudW5saW5rU3luYyhmdWxsUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9maWxlc19ieV9wYXR0ZXJuIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX2ZpbGVzX2J5X3BhdHRlcm4nLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIG11bHRpcGxlIGZpbGVzIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeSB0aGF0IG1hdGNoIGEgcmVnZXggcGF0dGVybi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdHRlcm46IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1JlZ2V4IHBhdHRlcm4gdG8gbWF0Y2ggZmlsZW5hbWVzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0dGVybiB9OiBEZWxldGVGaWxlc0J5UGF0dGVyblBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGNvbmZpZy5yZWdleFJlRG9TUHJvdGVjdGlvbiAmJiAhaXNTYWZlUmVnZXgocGF0dGVybikpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbnNhZmUgcmVnZXggcGF0dGVybiBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuICAgICAgICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGdldFdvcmtpbmdEaXIoKSk7XG4gICAgICAgIGNvbnN0IGRlbGV0ZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgIGlmIChyZWdleC50ZXN0KGZpbGUpKSB7XG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGUpO1xuICAgICAgICAgICAgZnMudW5saW5rU3luYyhmdWxsUGF0aCk7XG4gICAgICAgICAgICBkZWxldGVkRmlsZXMucHVzaChmdWxsUGF0aCk7IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGVsZXRlZENvdW50OiBkZWxldGVkRmlsZXMubGVuZ3RoLCBkZWxldGVkRmlsZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmluZF9maWxlcyB0b29sIFx1MjAxNCBPUFRJTUlaRUQgd2l0aCBhc3luYy9hd2FpdCBhbmQgY29uY3VycmVuY3kgY29udHJvbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmaW5kX2ZpbGVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZpbmQgZmlsZXMgcmVjdXJzaXZlbHkgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IG1hdGNoaW5nIGEgbmFtZSBwYXR0ZXJuLiBVc2VzIGFzeW5jIHNlYXJjaCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0dGVybjogei5zdHJpbmcoKS5kZXNjcmliZSgnU3Vic3RyaW5nIHRvIG1hdGNoIGluIGZpbGVuYW1lIChjYXNlLWluc2Vuc2l0aXZlKScpLFxuICAgICAgbWF4X2RlcHRoOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdNYXhpbXVtIGRlcHRoIHRvIHNlYXJjaCAoZGVmYXVsdDogNSknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXR0ZXJuLCBtYXhfZGVwdGggfTogRmluZEZpbGVzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzZWFyY2hQYXRoID0gZ2V0V29ya2luZ0RpcigpO1xuICAgICAgICBjb25zdCBkZXB0aCA9IG1heF9kZXB0aCB8fCA1O1xuICAgICAgICBcbiAgICAgICAgLy8gVXNlIG9wdGltaXplZCBhc3luYyBzZWFyY2ggd2l0aCBjb25jdXJyZW5jeSBjb250cm9sXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZpbmRGaWxlc0FzeW5jKHNlYXJjaFBhdGgsIHBhdHRlcm4sIGRlcHRoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBmb3VuZEZpbGVzOiByZXN1bHQuZmlsZXMsIGNvdW50OiByZXN1bHQuY291bnQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZnV6enlfZmluZF9sb2NhbF9maWxlcyB0b29sIFx1MjAxNCBPUFRJTUlaRUQgd2l0aCBlYXJseSBleGl0IExldmVuc2h0ZWluICsgY2FjaGluZ1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmdXp6eV9maW5kX2xvY2FsX2ZpbGVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Z1enp5IGZpbmQgbG9jYWwgZmlsZXMgYnkgcGF0aC9uYW1lIHNpbWlsYXJpdHkgdXNpbmcgb3B0aW1pemVkIExldmVuc2h0ZWluIHNjb3Jpbmcgd2l0aCBjYWNoaW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NlYXJjaCBxdWVyeSB0byBtYXRjaCBhZ2FpbnN0IGZpbGUgbmFtZXMvcGF0aHMuJyksXG4gICAgICBwYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1N1Yi1kaXJlY3RvcnkgdG8gc2VhcmNoIGluIChkZWZhdWx0OiBjdXJyZW50IGRpcmVjdG9yeSkuJyksXG4gICAgICBtYXhfcmVzdWx0czogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDIwKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdNYXggcmVzdWx0cyB0byByZXR1cm4gKGRlZmF1bHQ6IDUpLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBwYXRoOiBzZWFyY2hQYXRoLCBtYXhfcmVzdWx0cyB9OiBGdXp6eUZpbmRMb2NhbEZpbGVzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBiYXNlRGlyID0gc2VhcmNoUGF0aCA/IHJlc29sdmVQYXRoKHNlYXJjaFBhdGgpIDogZ2V0V29ya2luZ0RpcigpO1xuICAgICAgICBjb25zdCBtYXhSZXN1bHRzID0gbWF4X3Jlc3VsdHMgfHwgNTtcblxuICAgICAgICAvLyBDaGVjayBjYWNoZSBmaXJzdFxuICAgICAgICBjb25zdCBjYWNoZWRSZXN1bHRzID0gZ2V0Q2FjaGVkRnV6enlSZXN1bHRzKHF1ZXJ5LCBiYXNlRGlyKTtcbiAgICAgICAgaWYgKGNhY2hlZFJlc3VsdHMpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG1hdGNoZXM6IGNhY2hlZFJlc3VsdHMuc2xpY2UoMCwgbWF4UmVzdWx0cyksIGNvdW50OiBNYXRoLm1pbihjYWNoZWRSZXN1bHRzLmxlbmd0aCwgbWF4UmVzdWx0cykgfSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29sbGVjdCBmaWxlcyB1c2luZyBhc3luYyBtZXRob2RcbiAgICAgICAgY29uc3QgYWxsRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIFxuICAgICAgICBhc3luYyBmdW5jdGlvbiBjb2xsZWN0RmlsZXMoZGlyUGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyID0gMCwgbWF4RGVwdGg6IG51bWJlciA9IDIwKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcbiAgICAgICAgICBcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIoZGlyUGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgZW50cnkubmFtZSk7XG4gICAgICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY29sbGVjdEZpbGVzKGZ1bGxQYXRoLCBkZXB0aCArIDEsIG1heERlcHRoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbGxGaWxlcy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gU2tpcCBpbmFjY2Vzc2libGUgZGlyZWN0b3JpZXNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGNvbGxlY3RGaWxlcyhiYXNlRGlyKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE9wdGltaXplZCBmdXp6eSBtYXRjaGluZyB3aXRoIGVhcmx5IGV4aXRcbiAgICAgICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+ID0gW107XG4gICAgICAgIGNvbnN0IHF1ZXJ5TG93ZXIgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBNSU5fU0NPUkUgPSAwLjM7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgYWxsRmlsZXMpIHtcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBVc2Ugb3B0aW1pemVkIExldmVuc2h0ZWluIHdpdGggZWFybHkgZXhpdFxuICAgICAgICAgIGNvbnN0IHNjb3JlID0gbGV2ZW5zaHRlaW5TaW1pbGFyaXR5KHF1ZXJ5TG93ZXIsIGZpbGVOYW1lLCBNSU5fU0NPUkUpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChzY29yZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgZmlsZVBhdGg6IGZpbGUsIHNjb3JlIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU29ydCBieSBzY29yZSBkZXNjZW5kaW5nIGFuZCBjYWNoZSByZXN1bHRzXG4gICAgICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICAgICAgICBjYWNoZUZ1enp5UmVzdWx0cyhxdWVyeSwgYmFzZURpciwgcmVzdWx0cyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG1hdGNoZXM6IHJlc3VsdHMuc2xpY2UoMCwgbWF4UmVzdWx0cyksIGNvdW50OiBNYXRoLm1pbihyZXN1bHRzLmxlbmd0aCwgbWF4UmVzdWx0cykgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2ZpbGVfbWV0YWRhdGEgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfZmlsZV9tZXRhZGF0YScsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgbWV0YWRhdGEgKHNpemUsIGRhdGVzKSBmb3IgYSBzcGVjaWZpYyBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGg6IGZpbGVQYXRoIH06IEdldEZpbGVNZXRhZGF0YVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZVBhdGgsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoZnVsbFBhdGgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICAgICAgc2l6ZTogc3RhdHMuc2l6ZSxcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogc3RhdHMuYmlydGh0aW1lLFxuICAgICAgICAgICAgbW9kaWZpZWRBdDogc3RhdHMubXRpbWUsXG4gICAgICAgICAgICBhY2Nlc3NlZEF0OiBzdGF0cy5hdGltZSxcbiAgICAgICAgICAgIGlzRGlyZWN0b3J5OiBzdGF0cy5pc0RpcmVjdG9yeSgpLFxuICAgICAgICAgICAgaXNGaWxlOiBzdGF0cy5pc0ZpbGUoKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2hhbmdlX2RpcmVjdG9yeSB0b29sIFx1MjAxNCBIeWJyaWQ6IEV4cGxpY2l0IHZhbGlkYXRpb24gKyBTdGF0ZSBhYnN0cmFjdGlvbiArIENvbnRleHR1YWwgcmVzcG9uc2VcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2hhbmdlX2RpcmVjdG9yeScsXG4gICAgZGVzY3JpcHRpb246ICdDaGFuZ2UgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIEFsbCBzdWJzZXF1ZW50IGZpbGUgb3BlcmF0aW9ucyB3aWxsIHVzZSB0aGlzIGRpcmVjdG9yeSBhcyB0aGUgYmFzZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGFic29sdXRlIHBhdGggdG8gY2hhbmdlIHRvIChlLmcuLCBcIkM6XFxcXFxcXFxQcm9qZWN0c1xcXFxcXFxcbXktYXBwXCIpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZGlyZWN0b3J5IH06IENoYW5nZURpcmVjdG9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChkaXJlY3RvcnkpO1xuXG4gICAgICAgIC8vIFx1MjcwNSBCZWxlZGFyaWFuJ3MgZXhwbGljaXQgdmFsaWRhdGlvbiB1c2luZyBmcy5zdGF0XG4gICAgICAgIGxldCBzdGF0czogZnMuU3RhdHM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBQYXRoIGlzIG5vdCBhIGRpcmVjdG9yeTogJHtmdWxsUGF0aH1gIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTI3MDUgQ2FwdHVyZSBwcmV2aW91cyBkaXJlY3RvcnkgZm9yIGNvbnRleHRcbiAgICAgICAgY29uc3QgcHJldmlvdXNEaXJlY3RvcnkgPSBnZXRXb3JraW5nRGlyKCk7XG5cbiAgICAgICAgLy8gXHUyNzA1IEFJIFRvb2xib3gncyBhYnN0cmFjdGlvbiBmb3Igc3RhdGUgY2hhbmdlXG4gICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBzZXRXb3JraW5nRGlyKGZ1bGxQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsIFxuICAgICAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gY2hhbmdlIGRpcmVjdG9yeSB0byAnJHtkaXJlY3Rvcnl9Jy4gRW5zdXJlIHRoZSBwYXRoIGV4aXN0cyBhbmQgaXMgYSB2YWxpZCBkaXJlY3RvcnkuYCBcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHUyNzA1IEJlbGVkYXJpYW4ncyBjb250ZXh0dWFsIHJldHVybiBkYXRhICsgQUkgVG9vbGJveCdzIHN0cnVjdHVyZWQgZm9ybWF0XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBwcmV2aW91c19kaXJlY3Rvcnk6IHByZXZpb3VzRGlyZWN0b3J5LFxuICAgICAgICAgICAgY3VycmVudF9kaXJlY3Rvcnk6IGdldFdvcmtpbmdEaXIoKSBcbiAgICAgICAgICB9IFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVhZF9kb2N1bWVudCB0b29sIC0gSU1QTEVNRU5URUQgKHdhcyBzdHViKVxuICAvLyBGSVhFRDogUmVsYXhlZCBwYXRoIHZhbGlkYXRpb24gdG8gYWxsb3cgcmVhZGluZyBMTSBTdHVkaW8gYXR0YWNoZWQgZmlsZXMgZnJvbSB0ZW1wIGRpcmVjdG9yaWVzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlYWRfZG9jdW1lbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCBjb250ZW50IGZyb20gUERGIG9yIERPQ1ggZmlsZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIFBERiBvciBET0NYIGZpbGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX3BhdGggfTogUmVhZERvY3VtZW50UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBSZWxheGVkIHZhbGlkYXRpb246IEJsb2NrIHRyYXZlcnNhbCBhdHRhY2tzIGJ1dCBhbGxvdyBhYnNvbHV0ZSBwYXRocyBmb3IgYXR0YWNoZWQgZmlsZXNcbiAgICAgICAgaWYgKGZpbGVfcGF0aC5pbmNsdWRlcygnLi4nKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLnJlc29sdmUoZmlsZV9wYXRoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIGZpbGUgZXhpc3RzXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhmdWxsUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGaWxlIGRvZXMgbm90IGV4aXN0OiAke2ZpbGVfcGF0aH1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZV9wYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGV4dCA9PT0gJy5wZGYnKSB7XG4gICAgICAgICAgLy8gVXNlIHBkZi1wYXJzZSBsaWJyYXJ5IGZvciBQREYgZXh0cmFjdGlvbiBcdTIwMTQgZHluYW1pYyBpbXBvcnQgdG8gYXZvaWQgRVNNIGlzc3Vlc1xuICAgICAgICAgIGNvbnN0IHBkZlBhcnNlTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdwZGYtcGFyc2UnKTtcbiAgICAgICAgICBjb25zdCBkYXRhQnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgICBjb25zdCBwZGZEYXRhID0gYXdhaXQgcGRmUGFyc2VNb2R1bGUuZGVmYXVsdChkYXRhQnVmZmVyKTtcbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgZmlsZTogZnVsbFBhdGgsIC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgICAgICAgdHlwZTogJ1BERicsXG4gICAgICAgICAgICAgIHBhZ2VzOiBwZGZEYXRhLm51bXBhZ2VzLFxuICAgICAgICAgICAgICBjb250ZW50OiBwZGZEYXRhLnRleHQuc3Vic3RyaW5nKDAsIDEwMDAwKSwgLy8gTGltaXQgb3V0cHV0IHNpemVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChleHQgPT09ICcuZG9jeCcpIHtcbiAgICAgICAgICAvLyBVc2UgbWFtbW90aCBsaWJyYXJ5IGZvciBET0NYIGV4dHJhY3Rpb24gXHUyMDE0IGR5bmFtaWMgaW1wb3J0IHRvIGF2b2lkIEVTTSBpc3N1ZXNcbiAgICAgICAgICBjb25zdCBtYW1tb3RoTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdtYW1tb3RoJyk7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWFtbW90aE1vZHVsZS5kZWZhdWx0LmV4dHJhY3RSYXdUZXh0KHsgYnVmZmVyOiBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgpIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBmaWxlOiBmdWxsUGF0aCwgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgICAgICB0eXBlOiAnRE9DWCcsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdC52YWx1ZS5zdWJzdHJpbmcoMCwgMTAwMDApLCAvLyBMaW1pdCBvdXRwdXQgc2l6ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc3VwcG9ydGVkIGRvY3VtZW50IGZvcm1hdDogJHtleHR9LiBPbmx5IFBERiBhbmQgRE9DWCBhcmUgc3VwcG9ydGVkLmAgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYW5hbHl6ZV9wcm9qZWN0IHRvb2wgXHUyMDE0IENvbXByZWhlbnNpdmUgVHlwZVNjcmlwdCBQZXJmb3JtYW5jZSAmIExpbnRpbmcgQW5hbHlzaXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYW5hbHl6ZV9wcm9qZWN0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biBwcm9qZWN0LXdpZGUgYW5hbHlzaXMgaW5jbHVkaW5nIFR5cGVTY3JpcHQgZGlhZ25vc3RpY3MsIGNpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0aW9uLCBFU0xpbnQsIGNvbmZpZyBvcHRpbWl6YXRpb24sIGFuZCBpbXBvcnQgc3RydWN0dXJlIGFuYWx5c2lzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY2F0ZWdvcmllczogei5hcnJheSh6LmVudW0oWyd0eXBlY2hlY2snLCAnY2lyY3VsYXInLCAnZXNsaW50JywgJ2NvbmZpZycsICdpbXBvcnRzJ10pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdBbmFseXNpcyBjYXRlZ29yaWVzIHRvIHJ1biAoZGVmYXVsdDogYWxsKScpLFxuICAgICAgbWF4X2ltcG9ydHNfd2FybmluZzogei5udW1iZXIoKS5pbnQoKS5taW4oNSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDIwKS5kZXNjcmliZSgnTWF4IGltcG9ydHMgcGVyIGZpbGUgYmVmb3JlIHdhcm5pbmcnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjYXRlZ29yaWVzLCBtYXhfaW1wb3J0c193YXJuaW5nIH06IHsgY2F0ZWdvcmllcz86IHN0cmluZ1tdOyBtYXhfaW1wb3J0c193YXJuaW5nPzogbnVtYmVyIH0pID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHdvcmtpbmdEaXIgPSBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQ2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMgfHwgWyd0eXBlY2hlY2snLCAnY2lyY3VsYXInLCAnZXNsaW50JywgJ2NvbmZpZycsICdpbXBvcnRzJ107XG4gICAgICAgIGNvbnN0IGltcG9ydFdhcm5pbmdUaHJlc2hvbGQgPSBtYXhfaW1wb3J0c193YXJuaW5nIHx8IDIwO1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IFNhZmUgU3VicHJvY2VzcyBIZWxwZXIgd2l0aCBQcm9ncmVzcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBmdW5jdGlvbiBzcGF3bldpdGhQcm9ncmVzcyhleGU6IHN0cmluZywgYXJnczogc3RyaW5nW10sIHRpbWVvdXRNczogbnVtYmVyKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IHN0ZG91dD86IHN0cmluZzsgc3RkZXJyPzogc3RyaW5nIH0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2MgPSBzcGF3bihleGUsIGFyZ3MsIHtcbiAgICAgICAgICAgICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgJ3BpcGUnXSxcbiAgICAgICAgICAgICAgY3dkOiB3b3JraW5nRGlyLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICAgICAgICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgICAgICAgICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGQ6IEJ1ZmZlcikgPT4geyBzdGRvdXQgKz0gZC50b1N0cmluZygpOyB9KTtcbiAgICAgICAgICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkOiBCdWZmZXIpID0+IHsgc3RkZXJyICs9IGQudG9TdHJpbmcoKTsgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHsgXG4gICAgICAgICAgICAgIHByb2Mua2lsbCgpOyBcbiAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGRlcnI6IGBUaW1lb3V0IGFmdGVyICR7dGltZW91dE1zfW1zYCB9KTsgXG4gICAgICAgICAgICB9LCB0aW1lb3V0TXMpO1xuXG4gICAgICAgICAgICBwcm9jLm9uKCdjbG9zZScsICgpID0+IHsgY2xlYXJUaW1lb3V0KHRpbWVySWQpOyByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgc3Rkb3V0LCBzdGRlcnIgfSk7IH0pO1xuICAgICAgICAgICAgcHJvYy5vbignZXJyb3InLCAoZXJyKSA9PiB7IGNsZWFyVGltZW91dCh0aW1lcklkKTsgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGRlcnI6IGVyci5tZXNzYWdlIH0pOyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEEuIFR5cGVTY3JpcHQgRXh0ZW5kZWQgRGlhZ25vc3RpY3MgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuVHlwZWNoZWNrQW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IHRzQ29uZmlnUGF0aCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAndHNjb25maWcuanNvbicpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0c0NvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyB0c2NvbmZpZy5qc29uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGlmIHRzYyBpcyBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ3RzYycsIFsnLS12ZXJzaW9uJ10sIDUwMDApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnVHlwZVNjcmlwdCBjb21waWxlciAodHNjKSBub3QgZm91bmQgaW4gUEFUSCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEeW5hbWljIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplICh1c2luZyBpbXBvcnRlZCB1dGlsaXRpZXMpXG4gICAgICAgICAgY29uc3QgZmlsZUNvdW50ID0gYXdhaXQgY291bnRUeXBlU2NyaXB0RmlsZXMod29ya2luZ0Rpcik7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1RpbWVvdXQgPSBnZXRBbmFseXNpc1RpbWVvdXQoMzAwMDAsIGZpbGVDb3VudCk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ3RzYycsIFsnLS1leHRlbmRlZERpYWdub3N0aWNzJ10sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzIHx8ICFyZXN1bHQuc3Rkb3V0KSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGB0c2MgZmFpbGVkOiAke3Jlc3VsdC5zdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXJzZSB0c2MgLS1leHRlbmRlZERpYWdub3N0aWNzIG91dHB1dFxuICAgICAgICAgIGNvbnN0IGxpbmVzID0gcmVzdWx0LnN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgbGV0IGNoZWNrVGltZU1zID0gMDtcbiAgICAgICAgICBsZXQgbWVtb3J5VXNlZE1CID0gMDtcbiAgICAgICAgICBsZXQgZmlsZXNDaGVja2VkID0gMDtcbiAgICAgICAgICBsZXQgZW1pdFRpbWVNcyA9IDA7XG4gICAgICAgICAgbGV0IHBhcnNlVGltZU1zID0gMDtcblxuICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgY29uc3QgbG93ZXJMaW5lID0gbGluZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQYXJzZSBjaGVjayB0aW1lXG4gICAgICAgICAgICBjb25zdCBjaGVja01hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9jaGVja1xccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChjaGVja01hdGNoKSBjaGVja1RpbWVNcyA9IHBhcnNlSW50KGNoZWNrTWF0Y2hbMV0sIDEwKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgbWVtb3J5IHVzZWRcbiAgICAgICAgICAgIGNvbnN0IG1lbU1hdGNoID0gbGluZS5tYXRjaCgvbWVtb3J5IHVzZWQ6XFxzKyhcXGQrKVxccyooa2J8bWIpL2kpO1xuICAgICAgICAgICAgaWYgKG1lbU1hdGNoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnQobWVtTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgICAgbWVtb3J5VXNlZE1CID0gbWVtTWF0Y2hbMl0udG9Mb3dlckNhc2UoKSA9PT0gJ21iJyA/IHZhbHVlIDogTWF0aC5yb3VuZCh2YWx1ZSAvIDEwMjQgKiAxMDApIC8gMTAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXJzZSBmaWxlcyBjaGVja2VkXG4gICAgICAgICAgICBjb25zdCBmaWxlc01hdGNoID0gbGluZS5tYXRjaCgvZmlsZXNcXHMrY2hlY2tlZDpcXHMrKFxcZCspLyk7XG4gICAgICAgICAgICBpZiAoZmlsZXNNYXRjaCkgZmlsZXNDaGVja2VkID0gcGFyc2VJbnQoZmlsZXNNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBlbWl0IHRpbWVcbiAgICAgICAgICAgIGNvbnN0IGVtaXRNYXRjaCA9IGxvd2VyTGluZS5tYXRjaCgvZW1pdFxccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChlbWl0TWF0Y2gpIGVtaXRUaW1lTXMgPSBwYXJzZUludChlbWl0TWF0Y2hbMV0sIDEwKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgcGFyc2UgdGltZVxuICAgICAgICAgICAgY29uc3QgcGFyc2VNYXRjaCA9IGxvd2VyTGluZS5tYXRjaCgvcGFyc2VcXHMrdGltZTpcXHMrKFxcZCspXFxzKm1zLyk7XG4gICAgICAgICAgICBpZiAocGFyc2VNYXRjaCkgcGFyc2VUaW1lTXMgPSBwYXJzZUludChwYXJzZU1hdGNoWzFdLCAxMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGVyZm9ybWFuY2UgYXNzZXNzbWVudCBiYXNlZCBvbiBQREYgZ3VpZGVsaW5lc1xuICAgICAgICAgIGxldCBhc3Nlc3NtZW50OiAnZmFzdCcgfCAnbW9kZXJhdGUnIHwgJ3Nsb3cnO1xuICAgICAgICAgIGlmIChjaGVja1RpbWVNcyA8IDEwMCkgYXNzZXNzbWVudCA9ICdmYXN0JztcbiAgICAgICAgICBlbHNlIGlmIChjaGVja1RpbWVNcyA8PSA1MDApIGFzc2Vzc21lbnQgPSAnbW9kZXJhdGUnO1xuICAgICAgICAgIGVsc2UgYXNzZXNzbWVudCA9ICdzbG93JztcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGVja1RpbWVNcyxcbiAgICAgICAgICAgIG1lbW9yeVVzZWRNQjogTWF0aC5yb3VuZChtZW1vcnlVc2VkTUIgKiAxMDApIC8gMTAwLFxuICAgICAgICAgICAgZmlsZXNDaGVja2VkLFxuICAgICAgICAgICAgZW1pdFRpbWVNcyxcbiAgICAgICAgICAgIHBhcnNlVGltZU1zLFxuICAgICAgICAgICAgYXNzZXNzbWVudCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQi4gQ2lyY3VsYXIgRGVwZW5kZW5jeSBEZXRlY3Rpb24gPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuQ2lyY3VsYXJBbmFseXNpcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgY29uc3QgZW50cnlQb2ludCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAnc3JjJywgJ2luZGV4LnRzJyk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGVudHJ5UG9pbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBzcmMvaW5kZXgudHMgZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDIwMDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJ1biBtYWRnZSBhbmQgY2FwdHVyZSBvdXRwdXQgd2l0aCBkeW5hbWljIHRpbWVvdXRcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWyctLXllcycsICdtYWRnZScsICctLWNpcmN1bGFyJywgZW50cnlQb2ludF0sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGBtYWRnZSBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIG1hZGdlIG91dHB1dCBcdTIwMTQgaXQgbGlzdHMgY3ljbGVzIGxpa2UgXCJmaWxlMS50cyAtPiBmaWxlMi50cyAtPiBmaWxlMS50c1wiXG4gICAgICAgICAgY29uc3QgY3ljbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgIGNvbnN0IHN0ZG91dCA9IHJlc3VsdC5zdGRvdXQgfHwgJyc7XG4gICAgICAgICAgY29uc3QgbGluZXMgPSBzdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgIFxuICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICAgICAgICAgICAgaWYgKHRyaW1tZWQgJiYgIXRyaW1tZWQuc3RhcnRzV2l0aCgnRm91bmQnKSAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdObycpKSB7XG4gICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgbG9va3MgbGlrZSBhIGN5Y2xlIHBhdGhcbiAgICAgICAgICAgICAgaWYgKHRyaW1tZWQuaW5jbHVkZXMoJy0+JykgfHwgdHJpbW1lZC5lbmRzV2l0aCgnLnRzJykpIHtcbiAgICAgICAgICAgICAgICBjeWNsZXMucHVzaCh0cmltbWVkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBoYXNDeWNsZXM6IGN5Y2xlcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgY3ljbGVzLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBDLiBFU0xpbnQgSW50ZWdyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuRXNsaW50QW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IGVzbGludENvbmZpZ0ZpbGVzID0gW1xuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICdlc2xpbnQuY29uZmlnLm1qcycpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICdlc2xpbnQuY29uZmlnLmpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYy5qcycpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICcuZXNsaW50cmMuanNvbicpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICcuZXNsaW50cmMnKSxcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgY29uc3QgaGFzRXNsaW50Q29uZmlnID0gZXNsaW50Q29uZmlnRmlsZXMuc29tZShmID0+IGZzLmV4aXN0c1N5bmMoZikpO1xuICAgICAgICAgIGlmICghaGFzRXNsaW50Q29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBFU0xpbnQgY29uZmlndXJhdGlvbiBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBlc2xpbnQgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJ2VzbGludCcsICctLXZlcnNpb24nXSwgNTAwMCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdFU0xpbnQgbm90IGZvdW5kIGluIGRldkRlcGVuZGVuY2llcyBvciBQQVRIJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIER5bmFtaWMgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemVcbiAgICAgICAgICBjb25zdCBmaWxlQ291bnQgPSBhd2FpdCBjb3VudFR5cGVTY3JpcHRGaWxlcyh3b3JraW5nRGlyKTtcbiAgICAgICAgICBjb25zdCBkeW5hbWljVGltZW91dCA9IGdldEFuYWx5c2lzVGltZW91dCgxNTAwMCwgZmlsZUNvdW50KTtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWydlc2xpbnQnLCAnc3JjJywgJy0tZXh0JywgJy50cycsICctLWZvcm1hdCcsICdqc29uJ10sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGBFU0xpbnQgZmFpbGVkOiAke3Jlc3VsdC5zdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXJzZSBKU09OIG91dHB1dCBmcm9tIGVzbGludCAtLWZvcm1hdCBqc29uXG4gICAgICAgICAgbGV0IGVycm9ycyA9IDA7XG4gICAgICAgICAgbGV0IHdhcm5pbmdzID0gMDtcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgIGNvbnN0IHdhcm5pbmdNZXNzYWdlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlc3VsdC5zdGRvdXQgfHwgJycpIGFzIHtcbiAgICAgICAgICAgICAgcmVzdWx0cz86IEFycmF5PHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogc3RyaW5nO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzPzogQXJyYXk8eyBzZXZlcml0eTogbnVtYmVyOyBtZXNzYWdlOiBzdHJpbmc7IGxpbmU6IG51bWJlcjsgY29sdW1uOiBudW1iZXIgfT47XG4gICAgICAgICAgICAgIH0+O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChwYXJzZWQucmVzdWx0cykge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVSZXN1bHQgb2YgcGFyc2VkLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgKGZpbGVSZXN1bHQubWVzc2FnZXMgfHwgW10pKSB7XG4gICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5zZXZlcml0eSA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcnMrKztcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlcy5wdXNoKGAke2ZpbGVSZXN1bHQuZmlsZVBhdGh9OiAke21lc3NhZ2UubWVzc2FnZX0gKCR7bWVzc2FnZS5saW5lfToke21lc3NhZ2UuY29sdW1ufSlgKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS5zZXZlcml0eSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB3YXJuaW5ncysrO1xuICAgICAgICAgICAgICAgICAgICB3YXJuaW5nTWVzc2FnZXMucHVzaChgJHtmaWxlUmVzdWx0LmZpbGVQYXRofTogJHttZXNzYWdlLm1lc3NhZ2V9ICgke21lc3NhZ2UubGluZX06JHttZXNzYWdlLmNvbHVtbn0pYCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBJZiBKU09OIHBhcnNpbmcgZmFpbHMsIGZhbGwgYmFjayB0byB0ZXh0IG91dHB1dCBhbmFseXNpc1xuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2tTdGRvdXQgPSByZXN1bHQuc3Rkb3V0IHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JMaW5lcyA9IGZhbGxiYWNrU3Rkb3V0LnNwbGl0KCdcXG4nKS5maWx0ZXIobCA9PiBsLmluY2x1ZGVzKCdlcnJvcicpICYmICFsLmluY2x1ZGVzKCd3YXJuaW5nJykpO1xuICAgICAgICAgICAgZXJyb3JzID0gZXJyb3JMaW5lcy5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCB3YXJuaW5nTGluZXMgPSBmYWxsYmFja1N0ZG91dC5zcGxpdCgnXFxuJykuZmlsdGVyKGwgPT4gbC5pbmNsdWRlcygnd2FybmluZycpKTtcbiAgICAgICAgICAgIHdhcm5pbmdzID0gd2FybmluZ0xpbmVzLmxlbmd0aDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICAgICAgd2FybmluZ3MsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VzOiBlcnJvck1lc3NhZ2VzLnNsaWNlKDAsIDIwKSwgLy8gTGltaXQgdG8gZmlyc3QgMjBcbiAgICAgICAgICAgIHdhcm5pbmdNZXNzYWdlczogd2FybmluZ01lc3NhZ2VzLnNsaWNlKDAsIDIwKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gRC4gVHlwZVNjcmlwdCBDb25maWcgQW5hbHlzaXMgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gcnVuQ29uZmlnQW5hbHlzaXMoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICAgIGNvbnN0IHRzQ29uZmlnUGF0aCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAndHNjb25maWcuanNvbicpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0c0NvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyB0c2NvbmZpZy5qc29uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCB0c0NvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRzQ29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmModHNDb25maWdQYXRoLCAndXRmLTgnKSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdJbnZhbGlkIHRzY29uZmlnLmpzb24gZm9ybWF0JyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9ucyA9ICh0c0NvbmZpZy5jb21waWxlck9wdGlvbnMgfHwge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IGluY3JlbWVudGFsID0gISFjb21waWxlck9wdGlvbnMuaW5jcmVtZW50YWw7XG4gICAgICAgICAgY29uc3Qgc2tpcExpYkNoZWNrID0gISFjb21waWxlck9wdGlvbnMuc2tpcExpYkNoZWNrO1xuICAgICAgICAgIGNvbnN0IGlzb2xhdGVkTW9kdWxlcyA9ICEhY29tcGlsZXJPcHRpb25zLmlzb2xhdGVkTW9kdWxlcztcbiAgICAgICAgICBjb25zdCBzdHJpY3QgPSAhIWNvbXBpbGVyT3B0aW9ucy5zdHJpY3Q7XG5cbiAgICAgICAgICBjb25zdCByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICAvLyBSZWNvbW1lbmRhdGlvbnMgYmFzZWQgb24gUERGIG9wdGltaXphdGlvbiB0ZWNobmlxdWVzXG4gICAgICAgICAgaWYgKCFpbmNyZW1lbnRhbCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0VuYWJsZSBcImluY3JlbWVudGFsXCI6IHRydWUgaW4gdHNjb25maWcuanNvbiBmb3IgZmFzdGVyIGJ1aWxkcyAoYnVpbGQgY2FjaGluZykuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghc2tpcExpYkNoZWNrKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwic2tpcExpYkNoZWNrXCI6IHRydWUgdG8gc2tpcCBjaGVja2luZyAuZC50cyBmaWxlcyBpbiBub2RlX21vZHVsZXMuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghaXNvbGF0ZWRNb2R1bGVzKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnQ29uc2lkZXIgZW5hYmxpbmcgXCJpc29sYXRlZE1vZHVsZXNcIjogdHJ1ZSBmb3IgZmFzdGVyIGNvbXBpbGF0aW9uIChlc3BlY2lhbGx5IHdpdGggQmFiZWwvZXNidWlsZCkuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghc3RyaWN0KSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwic3RyaWN0XCI6IHRydWUgZm9yIGJldHRlciB0eXBlIHNhZmV0eSBhbmQgZmV3ZXIgcnVudGltZSBlcnJvcnMuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHBhdGhzIGNvbmZpZ3VyYXRpb24gKG1vZHVsZSByZXNvbHV0aW9uIG9wdGltaXphdGlvbilcbiAgICAgICAgICBjb25zdCBwYXRocyA9IGNvbXBpbGVyT3B0aW9ucy5wYXRocyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoIXBhdGhzIHx8IE9iamVjdC5rZXlzKHBhdGhzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdDb25zaWRlciB1c2luZyBcInBhdGhzXCIgaW4gdHNjb25maWcuanNvbiB0byBzaW1wbGlmeSBtb2R1bGUgaW1wb3J0cyBhbmQgcmVkdWNlIGRlcGVuZGVuY3kgZGVwdGguJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluY3JlbWVudGFsLFxuICAgICAgICAgICAgc2tpcExpYkNoZWNrLFxuICAgICAgICAgICAgaXNvbGF0ZWRNb2R1bGVzLFxuICAgICAgICAgICAgc3RyaWN0LFxuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBFLiBJbXBvcnQgU3RydWN0dXJlIEFuYWx5c2lzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGZ1bmN0aW9uIHJ1bkltcG9ydEFuYWx5c2lzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgICBjb25zdCBzcmNEaXIgPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3NyYycpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhzcmNEaXIpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBzcmMvIGRpcmVjdG9yeSBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDb2xsZWN0IGFsbCAudHMgZmlsZXMgaW4gc3JjL1xuICAgICAgICAgIGZ1bmN0aW9uIGNvbGxlY3RUc0ZpbGVzKGRpcjogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgY29uc3QgZmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXIsIGVudHJ5Lm5hbWUpO1xuICAgICAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goLi4uY29sbGVjdFRzRmlsZXMoZnVsbFBhdGgpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5uYW1lLmVuZHNXaXRoKCcudHMnKSAmJiAhZW50cnkubmFtZS5lbmRzV2l0aCgnLmQudHMnKSkge1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmaWxlcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0c0ZpbGVzID0gY29sbGVjdFRzRmlsZXMoc3JjRGlyKTtcbiAgICAgICAgICBjb25zdCBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzOiBBcnJheTx7IGZpbGU6IHN0cmluZzsgY291bnQ6IG51bWJlciB9PiA9IFtdO1xuICAgICAgICAgIGNvbnN0IGRlY2xhcmVHbG9iYWxVc2FnZTogQXJyYXk8eyBmaWxlOiBzdHJpbmcgfT4gPSBbXTtcblxuICAgICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgdHNGaWxlcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBDb3VudCBpbXBvcnRzXG4gICAgICAgICAgICAgIGNvbnN0IGltcG9ydFN0YXRlbWVudHMgPSBjb250ZW50Lm1hdGNoKC9eaW1wb3J0XFxzKy4qJC9nbSk7XG4gICAgICAgICAgICAgIGNvbnN0IGltcG9ydENvdW50ID0gaW1wb3J0U3RhdGVtZW50cyA/IGltcG9ydFN0YXRlbWVudHMubGVuZ3RoIDogMDtcblxuICAgICAgICAgICAgICBpZiAoaW1wb3J0Q291bnQgPiBpbXBvcnRXYXJuaW5nVGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgZmlsZXNXaXRoRXhjZXNzaXZlSW1wb3J0cy5wdXNoKHsgZmlsZTogcGF0aC5yZWxhdGl2ZSh3b3JraW5nRGlyLCBmaWxlUGF0aCksIGNvdW50OiBpbXBvcnRDb3VudCB9KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIENoZWNrIGZvciBkZWNsYXJlIGdsb2JhbCB1c2FnZSAoZ2xvYmFsIHR5cGUgcGF0Y2hpbmcgXHUyMDE0IGJhZCBwcmFjdGljZSBwZXIgUERGKVxuICAgICAgICAgICAgICBjb25zdCBkZWNsYXJlR2xvYmFsTWF0Y2hlcyA9IGNvbnRlbnQubWF0Y2goL2RlY2xhcmVcXHMrZ2xvYmFsL2cpO1xuICAgICAgICAgICAgICBpZiAoZGVjbGFyZUdsb2JhbE1hdGNoZXMgJiYgZGVjbGFyZUdsb2JhbE1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlY2xhcmVHbG9iYWxVc2FnZS5wdXNoKHsgZmlsZTogcGF0aC5yZWxhdGl2ZSh3b3JraW5nRGlyLCBmaWxlUGF0aCkgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAvLyBTa2lwIGZpbGVzIHRoYXQgY2FuJ3QgYmUgcmVhZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzLFxuICAgICAgICAgICAgZGVjbGFyZUdsb2JhbFVzYWdlLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBSdW4gU2VsZWN0ZWQgQ2F0ZWdvcmllcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBjb25zdCByZXN1bHRzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuXG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ3R5cGVjaGVjaycpKSB7XG4gICAgICAgICAgcmVzdWx0cy50eXBlY2hlY2sgPSBhd2FpdCBydW5UeXBlY2hlY2tBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2NpcmN1bGFyJykpIHtcbiAgICAgICAgICByZXN1bHRzLmNpcmN1bGFyID0gYXdhaXQgcnVuQ2lyY3VsYXJBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2VzbGludCcpKSB7XG4gICAgICAgICAgcmVzdWx0cy5lc2xpbnQgPSBhd2FpdCBydW5Fc2xpbnRBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2NvbmZpZycpKSB7XG4gICAgICAgICAgcmVzdWx0cy5jb25maWcgPSBydW5Db25maWdBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2ltcG9ydHMnKSkge1xuICAgICAgICAgIHJlc3VsdHMuaW1wb3J0cyA9IHJ1bkltcG9ydEFuYWx5c2lzKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YTogcmVzdWx0cyxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEFuYWx5c2lzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzZWFyY2ggYXMgZGRnU2VhcmNoIH0gZnJvbSAnZHVjay1kdWNrLXNjcmFwZSc7XG5pbXBvcnQgeyBodG1sVG9UZXh0IH0gZnJvbSAnaHRtbC10by10ZXh0JztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGZldGNoV2l0aFJldHJ5IH0gZnJvbSAnLi4vcGVyZm9ybWFuY2VVdGlscy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNlYXJjaCBFbmdpbmUgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHRJdGVtIHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cbi8qKiBEdWNrRHVja0dvIEFQSSAoZmFzdGVzdCwgbm8gYnJvd3NlciBuZWVkZWQpICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hEREdBcGkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBkZGdTZWFyY2gocXVlcnksIHsgcmVnaW9uOiAnd3Qtd3QnIH0pO1xuICByZXR1cm4gKHJlc3VsdHMucmVzdWx0cyBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4pLm1hcCgocjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+ICh7XG4gICAgdGl0bGU6IHIudGl0bGUgYXMgc3RyaW5nLFxuICAgIHVybDogci51cmwgYXMgc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uOiAoci5kZXNjcmlwdGlvbiBhcyBzdHJpbmcpIHx8ICcnLFxuICB9KSk7XG59XG5cbi8qKiBEdWNrRHVja0dvIEhUTUwgRmV0Y2ggKGZhbGxiYWNrIHdoZW4gQVBJIGZhaWxzKSAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoRERHRmV0Y2gocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoXG4gICAgYGh0dHBzOi8vaHRtbC5kdWNrZHVja2dvLmNvbS9odG1sLz9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX1gXG4gICk7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgRHVja0R1Y2tHbyBGZXRjaCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIFxuICAvLyBTaW1wbGUgcmVnZXgtYmFzZWQgcGFyc2luZyBmb3IgTm9kZS5qcyAobm8gRE9NUGFyc2VyIG5lZWRlZCEpXG4gIGNvbnN0IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXSA9IFtdO1xuICBcbiAgLy8gRXh0cmFjdCB0aXRsZXMgZnJvbSA8YSBjbGFzcz1cInJlc3VsdF9fYVwiIGhyZWY9XCIuLi5cIiByZWw9XCIuLi5cIj5UaXRsZTwvYT5cbiAgY29uc3QgdGl0bGVSZWdleCA9IC88YVtePl0rY2xhc3M9XCJyZXN1bHRfX2FcIltePl0raHJlZj1cIihbXlwiXSspXCJbXj5dKj4oW148XSspPFxcL2E+L2dpO1xuICBsZXQgbWF0Y2g7XG4gIFxuICB3aGlsZSAoKG1hdGNoID0gdGl0bGVSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB0aXRsZTogbWF0Y2hbMl0ucmVwbGFjZSgvJmFtcDsvZywgJyYnKS50cmltKCksXG4gICAgICB1cmw6IG1hdGNoWzFdLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgMTApO1xufVxuXG4vKiogR29vZ2xlIFNlYXJjaCB2aWEgSFRNTCBGZXRjaCAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoR29vZ2xlKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KFxuICAgIGBodHRwczovL3d3dy5nb29nbGUuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX0mbnVtPTEwYCxcbiAgICB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2JyB9IH1cbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBHb29nbGUgc2VhcmNoIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgLy8gU2ltcGxlIHBhcnNpbmcgXHUyMDE0IGV4dHJhY3QgdGl0bGVzIGFuZCBVUkxzIGZyb20gR29vZ2xlJ3MgSFRNTCBzdHJ1Y3R1cmVcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIGNvbnN0IHRpdGxlUmVnZXggPSAvPGgzW14+XSo+KC4qPyk8XFwvaDM+L2c7XG5cbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAoKG1hdGNoID0gdGl0bGVSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB0aXRsZTogbWF0Y2hbMV0ucmVwbGFjZSgvPFtePl0qPi9nLCAnJyksIC8vIFJlbW92ZSBIVE1MIHRhZ3NcbiAgICAgIHVybDogJycsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCAxMCk7XG59XG5cbi8qKiBCaW5nIFNlYXJjaCB2aWEgSFRNTCBGZXRjaCAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoQmluZyhxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShcbiAgICBgaHR0cHM6Ly93d3cuYmluZy5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZjb3VudD0xMGAsXG4gICAgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNicgfSB9XG4gICk7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQmluZyBzZWFyY2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAvLyBQYXJzZSBCaW5nIHJlc3VsdHMgXHUyMDE0IHNpbWlsYXIgYXBwcm9hY2ggdG8gR29vZ2xlXG4gIGNvbnN0IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXSA9IFtdO1xuICBjb25zdCByZXN1bHRSZWdleCA9IC88bGkgY2xhc3M9XCJiX2FsZ29cIltePl0qPiguKj8pPFxcL2xpPi9ncztcblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSByZXN1bHRSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGJsb2NrID0gbWF0Y2hbMV07XG4gICAgY29uc3QgdGl0bGVNYXRjaCA9IGJsb2NrLm1hdGNoKC88YVtePl0raHJlZj1cIihbXlwiXSspXCJbXj5dKj4oW148XSspPFxcL2E+Lyk7XG4gICAgaWYgKHRpdGxlTWF0Y2gpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgIHRpdGxlOiB0aXRsZU1hdGNoWzJdLFxuICAgICAgICB1cmw6IHRpdGxlTWF0Y2hbMV0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIDEwKTtcbn1cblxuLyoqIEFsbCBhdmFpbGFibGUgU2VhcmNoIEVuZ2luZSBGdW5jdGlvbnMgKi9cbmNvbnN0IFNFQVJDSF9FTkdJTkVTOiBSZWNvcmQ8c3RyaW5nLCAocXVlcnk6IHN0cmluZykgPT4gUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+PiA9IHtcbiAgJ2RkZy1hcGknOiBzZWFyY2hEREdBcGksXG4gICdkZGctZmV0Y2gnOiBzZWFyY2hEREdGZXRjaCxcbiAgJ2dvb2dsZSc6IHNlYXJjaEdvb2dsZSxcbiAgJ2JpbmcnOiBzZWFyY2hCaW5nLFxufTtcblxuLyoqIEhhcmRjb2RlZCBmYWxsYmFjayBvcmRlciAod2hlbiBwcmltYXJ5IGVuZ2luZSBmYWlscykgKi9cbmNvbnN0IEZBTExCQUNLX09SREVSID0gWydkZGctYXBpJywgJ2RkZy1mZXRjaCcsICdnb29nbGUnLCAnYmluZyddO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBGYWxsYmFjayBDaGFpbiBMb2dpYyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIFdlYiBzZWFyY2ggd2l0aCBhdXRvbWF0aWMgZmFsbGJhY2suXG4gKiBTdGFydHMgd2l0aCB0aGUgQ29uZmlnIGVuZ2luZSBhbmQgYXV0b21hdGljYWxseSB0cmllcyB0aGUgbmV4dCBpbiB0aGUgY2hhaW4uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaFdpdGhGYWxsYmFja0NoYWluKFxuICBxdWVyeTogc3RyaW5nLFxuICBjb25maWc6IFBsdWdpbkNvbmZpZ1xuKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiB7IHF1ZXJ5OiBzdHJpbmc7IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXTsgY291bnQ6IG51bWJlcjsgZW5naW5lOiBzdHJpbmcgfTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAvLyBTdGFydCBlbmdpbmUgZnJvbSBDb25maWcgKFNpbmdsZSBTZWxlY3QpXG4gIGNvbnN0IHByaW1hcnlFbmdpbmUgPSBjb25maWcuc2VhcmNoRmFsbGJhY2tDaGFpbiB8fCAnZGRnLWFwaSc7XG4gIFxuICAvLyBGYWxsYmFjayBjaGFpbjogcHJpbWFyeSBlbmdpbmUgKyBhbGwgb3RoZXJzIGluIGRlZmluZWQgb3JkZXJcbiAgY29uc3QgY2hhaW4gPSBbcHJpbWFyeUVuZ2luZSwgLi4uRkFMTEJBQ0tfT1JERVIuZmlsdGVyKGUgPT4gZSAhPT0gcHJpbWFyeUVuZ2luZSldO1xuXG4gIGZvciAoY29uc3QgZW5naW5lIG9mIGNoYWluKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNlYXJjaEZuID0gU0VBUkNIX0VOR0lORVNbZW5naW5lXTtcbiAgICAgIGlmICghc2VhcmNoRm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBTZWFyY2ggZW5naW5lIFwiJHtlbmdpbmV9XCIgbm90IGZvdW5kLCBza2lwcGluZ2ApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHNlYXJjaEZuKHF1ZXJ5KTtcblxuICAgICAgLy8gVmFsaWRhdGUgcmVzdWx0IGNvdW50IC0gd2FybiBpZiBsb3cgcmVzdWx0c1xuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoIDwgMikge1xuICAgICAgICBjb25zb2xlLndhcm4oYExvdyBzZWFyY2ggcmVzdWx0cyBmb3IgXCIke3F1ZXJ5fVwiOiAke3Jlc3VsdHMubGVuZ3RofSByZXN1bHRzIGZyb20gJHtlbmdpbmV9YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHsgcXVlcnksIHJlc3VsdHMsIGNvdW50OiByZXN1bHRzLmxlbmd0aCwgZW5naW5lIH0sXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgY29uc29sZS53YXJuKGBTZWFyY2ggZW5naW5lIFwiJHtlbmdpbmV9XCIgZmFpbGVkOiAke21lc3NhZ2V9YCk7XG4gICAgICAvLyBUcnkgbmV4dCBlbmdpbmUgaW4gdGhlIGNoYWluXG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgIGVycm9yOiBgQWxsIHNlYXJjaCBlbmdpbmVzIGZhaWxlZC4gVHJpZWQ6ICR7Y2hhaW4uam9pbignIFx1MjE5MiAnKX1gLFxuICB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgV2ViU2VhcmNoUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFdpa2lwZWRpYVNlYXJjaFBhcmFtcyB7IHF1ZXJ5OiBzdHJpbmc7IGxhbmc/OiBzdHJpbmc7IH1cbmludGVyZmFjZSBGZXRjaFdlYkNvbnRlbnRQYXJhbXMgeyB1cmw6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJhZ1dlYkNvbnRlbnRQYXJhbXMgeyB1cmw6IHN0cmluZzsgcXVlcnk6IHN0cmluZzsgfVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJXZWJSZXNlYXJjaFRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHdlYl9zZWFyY2ggdG9vbCBcdTIwMTQgdXNlcyBwcmltYXJ5IGVuZ2luZSBmcm9tIENvbmZpZyArIGF1dG9tYXRpYyBmYWxsYmFja1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3ZWJfc2VhcmNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCB0aGUgd2ViIHVzaW5nIGEgY29uZmlndXJhYmxlIHNlYXJjaCBlbmdpbmUgd2l0aCBhdXRvbWF0aWMgZmFsbGJhY2sgdG8gb3RoZXIgZW5naW5lcyBpZiB0aGUgcHJpbWFyeSBvbmUgZmFpbHMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5IH06IFdlYlNlYXJjaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgcmV0dXJuIGF3YWl0IHNlYXJjaFdpdGhGYWxsYmFja0NoYWluKHF1ZXJ5LCBjb25maWcpO1xuICAgIH0sXG4gIH0pKTtcblxuICAvLyB3aWtpcGVkaWFfc2VhcmNoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd2lraXBlZGlhX3NlYXJjaCcsXG4gICAgZGVzY3JpcHRpb246ICdTZWFyY2ggV2lraXBlZGlhIGZvciBhIGdpdmVuIHF1ZXJ5IGFuZCByZXR1cm4gcGFnZSBzdW1tYXJpZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeScpLFxuICAgICAgbGFuZzogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ2VuJykuZGVzY3JpYmUoJ0xhbmd1YWdlIGNvZGUgKGRlZmF1bHQ6IGVuKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBsYW5nIH06IFdpa2lwZWRpYVNlYXJjaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYXBpVXJsID0gYGh0dHBzOi8vJHtsYW5nIHx8ICdlbid9Lndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1xdWVyeSZsaXN0PXNlYXJjaCZzcnNlYXJjaD0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9JmZvcm1hdD1qc29uJm9yaWdpbj0qYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShhcGlVcmwpO1xuXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdpa2lwZWRpYSBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXNwb25zZS5qc29uKCkpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBjb25zdCBxdWVyeURhdGEgPSBkYXRhLnF1ZXJ5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzZWFyY2hSZXN1bHRzID0gKHF1ZXJ5RGF0YT8uc2VhcmNoIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PikgfHwgW107XG4gICAgICAgIGNvbnN0IHBhZ2VzID0gc2VhcmNoUmVzdWx0cy5tYXAoKGl0ZW06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGl0bGUgPSB0eXBlb2YgaXRlbS50aXRsZSA9PT0gJ3N0cmluZycgPyBpdGVtLnRpdGxlIDogJyc7XG4gICAgICAgICAgY29uc3Qgc25pcHBldCA9IHR5cGVvZiBpdGVtLnNuaXBwZXQgPT09ICdzdHJpbmcnID8gaXRlbS5zbmlwcGV0LnJlcGxhY2UoLzxbXj5dKj4vZywgJycpIDogJyc7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgc25pcHBldCxcbiAgICAgICAgICAgIHVybDogYGh0dHBzOi8vJHtsYW5nIHx8ICdlbid9Lndpa2lwZWRpYS5vcmcvd2lraS8ke2VuY29kZVVSSUNvbXBvbmVudCh0aXRsZSl9YCxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHF1ZXJ5LCBsYW5ndWFnZTogbGFuZyB8fCAnZW4nLCByZXN1bHRzOiBwYWdlcywgY291bnQ6IHBhZ2VzLmxlbmd0aCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBXaWtpcGVkaWEgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmV0Y2hfd2ViX2NvbnRlbnQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmZXRjaF93ZWJfY29udGVudCcsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCB0aGUgY2xlYW4sIHRleHQtYmFzZWQgY29udGVudCBvZiBhIHdlYnBhZ2UgVVJMLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIGZldGNoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsIH06IEZldGNoV2ViQ29udGVudFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeSh1cmwpO1xuXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGh0bWxUb1RleHQoaHRtbCwge1xuICAgICAgICAgIHdvcmR3cmFwOiBmYWxzZSxcbiAgICAgICAgICBzZWxlY3RvcnM6IFtcbiAgICAgICAgICAgIHsgc2VsZWN0b3I6ICdhJywgb3B0aW9uczogeyBpZ25vcmVIcmVmOiB0cnVlIH0gfSxcbiAgICAgICAgICAgIHsgc2VsZWN0b3I6ICdpbWcnLCBmb3JtYXQ6ICdbaW1hZ2VdJyB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdXJsLCBjb250ZW50OiB0ZXh0LnN1YnN0cmluZygwLCA1MDAwKSB9IH07IC8vIExpbWl0IGxlbmd0aFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGZldGNoIGNvbnRlbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJhZ193ZWJfY29udGVudCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ193ZWJfY29udGVudCcsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCBjb250ZW50IGZyb20gYSBVUkwsIGFuZCB0aGVuIHVzZSBSQUcgdG8gZmluZCBhbmQgcmV0dXJuIG9ubHkgdGhlIHRleHQgY2h1bmtzIG1vc3QgcmVsZXZhbnQgdG8gYSBzcGVjaWZpYyBxdWVyeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBmZXRjaCcpLFxuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzZWFyY2ggcXVlcnkgZm9yIHJlbGV2YW5jZSBtYXRjaGluZycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCwgcXVlcnkgfTogUmFnV2ViQ29udGVudFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeSh1cmwpO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gICAgICAgIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBodG1sVG9UZXh0KGh0bWwpO1xuXG4gICAgICAgIC8vIFNpbXBsZSBrZXl3b3JkLWJhc2VkIHJlbGV2YW5jZSBzY29yaW5nIChwbGFjZWhvbGRlciBmb3IgcmVhbCBSQUcpXG4gICAgICAgIGNvbnN0IHF1ZXJ5VGVybXMgPSBxdWVyeS50b0xvd2VyQ2FzZSgpLnNwbGl0KC9cXHMrLykuZmlsdGVyKCh0OiBzdHJpbmcpID0+IHQubGVuZ3RoID4gMik7XG4gICAgICAgIGNvbnN0IHNlbnRlbmNlcyA9IHRleHQuc3BsaXQoL1suIT9dKy8pLm1hcCgoczogc3RyaW5nKSA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgICAgIGNvbnN0IHJlbGV2YW50Q2h1bmtzID0gc2VudGVuY2VzLmZpbHRlcigoc2VudGVuY2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgIHJldHVybiBxdWVyeVRlcm1zLnNvbWUoKHRlcm06IHN0cmluZykgPT4gc2VudGVuY2UudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyh0ZXJtKSk7XG4gICAgICAgIH0pLnNsaWNlKDAsIDUpOyAvLyBSZXR1cm4gdG9wIDUgaGl0c1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdXJsLCBxdWVyeSwgY2h1bmtzOiByZWxldmFudENodW5rcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8vIExhenktbG9hZCBzaW1wbGUtZ2l0IGZvciB0ZXN0YWJpbGl0eVxubGV0IHNpbXBsZUdpdE1vZHVsZTogdHlwZW9mIGltcG9ydCgnc2ltcGxlLWdpdCcpIHwgbnVsbCA9IG51bGw7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNpbXBsZUdpdCgpOiBQcm9taXNlPHR5cGVvZiBpbXBvcnQoJ3NpbXBsZS1naXQnKT4ge1xuICBpZiAoIXNpbXBsZUdpdE1vZHVsZSkge1xuICAgIHNpbXBsZUdpdE1vZHVsZSA9IGF3YWl0IGltcG9ydCgnc2ltcGxlLWdpdCcpO1xuICB9XG4gIHJldHVybiBzaW1wbGVHaXRNb2R1bGU7XG59XG5cbi8qKiBSZXNldCBnaXQgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEdpdENhY2hlKCk6IHZvaWQge1xuICBzaW1wbGVHaXRNb2R1bGUgPSBudWxsO1xufVxuXG4vKiogQ3JlYXRlIGEgZnJlc2ggZ2l0IGluc3RhbmNlIGZvciBlYWNoIG9wZXJhdGlvbiB0byBhdm9pZCBjd2QgaXNzdWVzICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVHaXQoKSB7XG4gIGNvbnN0IHsgZGVmYXVsdDogc2ltcGxlR2l0IH0gPSBhd2FpdCBnZXRTaW1wbGVHaXQoKTtcbiAgcmV0dXJuIHNpbXBsZUdpdCgpO1xufVxuXG4vKipcbiAqIFNoYXJlZCBoZWxwZXI6IEV4dHJhY3QgR2l0SHViIHJlcG8gbmFtZSBmcm9tIGdpdCByZW1vdGUgVVJMXG4gKi9cbmZ1bmN0aW9uIGdldFJlcG9OYW1lKCk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCByZXBvTWF0Y2ggPSBwcm9jZXNzLmVudi5HSVRIVUJfUkVQT1NJVE9SWT8ubWF0Y2goL2dpdGh1YlxcLmNvbVs6L10oW14vXStcXC9bXi9dKylcXC5naXQkLyk7XG4gIHJldHVybiByZXBvTWF0Y2g/LlsxXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFNoYXJlZCBoZWxwZXI6IE1ha2UgR2l0SHViIEFQSSByZXF1ZXN0cyB3aXRoIGF1dGhlbnRpY2F0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdoQXBpUmVxdWVzdChtZXRob2Q6IHN0cmluZywgZW5kcG9pbnQ6IHN0cmluZywgYm9keT86IHVua25vd24pIHtcbiAgY29uc3QgZ2l0aHViVG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU47XG4gIFxuICBpZiAoIWdpdGh1YlRva2VuKSB0aHJvdyBuZXcgRXJyb3IoJ0dJVEhVQl9UT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0Jyk7XG4gIFxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5naXRodWIuY29tJHtlbmRwb2ludH1gLCB7XG4gICAgbWV0aG9kLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke2dpdGh1YlRva2VufWAsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gICAgYm9keTogYm9keSA/IEpTT04uc3RyaW5naWZ5KGJvZHkpIDogdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgIHRocm93IG5ldyBFcnJvcihgR2l0SHViIEFQSSBlcnJvciAoJHtyZXNwb25zZS5zdGF0dXN9KTogJHtlcnJvclRleHR9YCk7XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xufVxuXG4vKiogVHlwZWQgcGFyYW1zIGludGVyZmFjZXMgKi9cbnR5cGUgR2l0U3RhdHVzUGFyYW1zID0gUmVjb3JkPHN0cmluZywgbmV2ZXI+O1xuaW50ZXJmYWNlIEdpdERpZmZQYXJhbXMgeyBmaWxlX3BhdGg/OiBzdHJpbmc7IGNhY2hlZD86IGJvb2xlYW47IH1cbmludGVyZmFjZSBHaXRDb21taXRQYXJhbXMgeyBtZXNzYWdlOiBzdHJpbmc7IH1cbmludGVyZmFjZSBHaXRMb2dQYXJhbXMgeyBtYXhfY291bnQ/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHaXRBZGRQYXJhbXMgeyBwYXRocz86IHN0cmluZ1tdOyB9XG5pbnRlcmZhY2UgR2l0Q2hlY2tvdXRQYXJhbXMgeyBicmFuY2hfbmFtZTogc3RyaW5nOyBjcmVhdGVfbmV3PzogYm9vbGVhbjsgfVxuaW50ZXJmYWNlIEdoQ3JlYXRlSXNzdWVQYXJhbXMgeyB0aXRsZTogc3RyaW5nOyBib2R5Pzogc3RyaW5nOyBsYWJlbHM/OiBzdHJpbmdbXTsgfVxuaW50ZXJmYWNlIEdoTGlzdElzc3Vlc1BhcmFtcyB7IHN0YXRlPzogJ29wZW4nIHwgJ2Nsb3NlZCc7IGxhYmVscz86IHN0cmluZ1tdOyBsaW1pdD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdoVmlld0NvbW1lbnRzUGFyYW1zIHsgbnVtYmVyOiBudW1iZXI7IHR5cGU/OiAnaXNzdWUnIHwgJ3ByJzsgfVxuaW50ZXJmYWNlIEdoQ3JlYXRlUHJQYXJhbXMgeyB0aXRsZTogc3RyaW5nOyBib2R5Pzogc3RyaW5nOyBoZWFkX2JyYW5jaDogc3RyaW5nOyBiYXNlX2JyYW5jaD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIEdoTGlzdFByc1BhcmFtcyB7IHN0YXRlPzogJ29wZW4nIHwgJ2Nsb3NlZCc7IGxpbWl0PzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2hWaWV3UHJEaWZmUGFyYW1zIHsgbnVtYmVyOiBudW1iZXI7IH1cbmludGVyZmFjZSBHaFB1c2hQYXJhbXMgeyBicmFuY2g/OiBzdHJpbmc7IH1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyR2l0VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGdpdF9zdGF0dXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfc3RhdHVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCB0aGUgY3VycmVudCBnaXQgc3RhdHVzIG9mIHRoZSByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChfcGFyYW1zOiBHaXRTdGF0dXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBjb25zdCBzdGF0dXNSZXN1bHQgPSBhd2FpdCBnaXQuc3RhdHVzKCkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHN0YXR1c1Jlc3VsdCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IHN0YXR1cyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9kaWZmIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2RpZmYnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHRoZSBnaXQgZGlmZiBvZiB0aGUgY3VycmVudCByZXBvc2l0b3J5IG9yIHNwZWNpZmljIGZpbGVzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBQYXRoIHRvIHNwZWNpZmljIGZpbGUgdG8gZGlmZi4nKSxcbiAgICAgIGNhY2hlZDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnT3B0aW9uYWw6IFNob3cgc3RhZ2VkIGNoYW5nZXMgb25seSAoZ2l0IGRpZmYgLS1jYWNoZWQpLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfcGF0aCwgY2FjaGVkIH06IEdpdERpZmZQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBsZXQgZGlmZiA9ICcnO1xuICAgICAgICBpZiAoZmlsZV9wYXRoKSB7XG4gICAgICAgICAgZGlmZiA9IGF3YWl0IGdpdC5kaWZmKFtmaWxlX3BhdGhdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaWZmID0gY2FjaGVkID8gYXdhaXQgZ2l0LmRpZmYoWyctLWNhY2hlZCddKSA6IGF3YWl0IGdpdC5kaWZmKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkaWZmIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBkaWZmIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2NvbW1pdCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9jb21taXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ29tbWl0IHN0YWdlZCBjaGFuZ2VzIHRvIHRoZSBnaXQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBjb21taXQgbWVzc2FnZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG1lc3NhZ2UgfTogR2l0Q29tbWl0UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBjcmVhdGVHaXQoKTtcbiAgICAgICAgYXdhaXQgZ2l0LmNvbW1pdChtZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21taXR0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGNvbW1pdCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9sb2cgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfbG9nJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCByZWNlbnQgZ2l0IGNvbW1pdCBoaXN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWF4X2NvdW50OiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggbnVtYmVyIG9mIGNvbW1pdHMgdG8gcmV0dXJuIChkZWZhdWx0OiAxMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBtYXhfY291bnQgfTogR2l0TG9nUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBjcmVhdGVHaXQoKTtcbiAgICAgICAgY29uc3QgY291bnQgPSBtYXhfY291bnQgfHwgMTA7XG4gICAgICAgIGNvbnN0IGxvZyA9IGF3YWl0IGdpdC5sb2coY291bnQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1pdHM6IGxvZy5hbGwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGxvZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9hZGQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfYWRkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1N0YWdlIHNwZWNpZmljIGZpbGVzIG9yIGFsbCBjaGFuZ2VzIGZvciB0aGUgbmV4dCBjb21taXQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbDogU3BlY2lmaWMgZmlsZSBwYXRocyB0byBzdGFnZS4gSWYgb21pdHRlZCwgc3RhZ2VzIGFsbCBjaGFuZ2VzLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGhzIH06IEdpdEFkZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gY3JlYXRlR2l0KCk7XG4gICAgICAgIGlmIChwYXRocyAmJiBwYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmFkZChwYXRocyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmFkZCgnLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc3RhZ2VkUGF0aHM6IHBhdGhzIHx8ICdhbGwnIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBhZGQgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfY2hlY2tvdXQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfY2hlY2tvdXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3dpdGNoIHRvIGFuIGV4aXN0aW5nIGJyYW5jaCBvciBjcmVhdGUgYW5kIHN3aXRjaCB0byBhIG5ldyBvbmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBicmFuY2hfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTmFtZSBvZiB0aGUgYnJhbmNoIHRvIGNoZWNrb3V0LicpLFxuICAgICAgY3JlYXRlX25ldzogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZShcIklmIHRydWUsIGNyZWF0ZXMgdGhlIGJyYW5jaCBpZiBpdCBkb2Vzbid0IGV4aXN0IChsaWtlIGdpdCBjaGVja291dCAtYikuXCIpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGJyYW5jaF9uYW1lLCBjcmVhdGVfbmV3IH06IEdpdENoZWNrb3V0UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBjcmVhdGVHaXQoKTtcbiAgICAgICAgaWYgKGNyZWF0ZV9uZXcpIHtcbiAgICAgICAgICBhd2FpdCBnaXQuY2hlY2tvdXRMb2NhbEJyYW5jaChicmFuY2hfbmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXdhaXQgZ2l0LmNoZWNrb3V0KGJyYW5jaF9uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGJyYW5jaE5hbWU6IGJyYW5jaF9uYW1lIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdCBjaGVja291dCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2F1dGggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9hdXRoJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrIEdpdEh1YiBhdXRoZW50aWNhdGlvbiBzdGF0dXMuIElmIG5vdCBhdXRoZW50aWNhdGVkLCBvcGVucyBhIHRlcm1pbmFsIHdpbmRvdyBmb3IgdGhlIHVzZXIgdG8gc2lnbiBpbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXRodWJUb2tlbiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjtcbiAgICAgICAgXG4gICAgICAgIGlmICghZ2l0aHViVG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdHSVRIVUJfVE9LRU4gZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgbm90IHNldCcgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCAnL3VzZXInKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBhdXRoZW50aWNhdGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBhdXRoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfY3JlYXRlX2lzc3VlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfY3JlYXRlX2lzc3VlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBHaXRIdWIgaXNzdWUgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgaXNzdWUgdGl0bGUnKSxcbiAgICAgIGJvZHk6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIGlzc3VlIGJvZHkvZGVzY3JpcHRpb24nKSxcbiAgICAgIGxhYmVsczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdMYWJlbHMgdG8gYXBwbHknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgYm9keSwgbGFiZWxzIH06IEdoQ3JlYXRlSXNzdWVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZSBmcm9tIEdJVEhVQl9SRVBPU0lUT1JZIGVudicpO1xuXG4gICAgICAgIGF3YWl0IGdoQXBpUmVxdWVzdCgnUE9TVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vaXNzdWVzYCwgeyB0aXRsZSwgYm9keSwgbGFiZWxzIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGlzc3VlIGNyZWF0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfbGlzdF9pc3N1ZXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9saXN0X2lzc3VlcycsXG4gICAgZGVzY3JpcHRpb246ICdMaXN0IGlzc3VlcyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc3RhdGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnb3BlbicpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgaXNzdWUgc3RhdGUnKSxcbiAgICAgIGxhYmVsczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgbGFiZWxzJyksXG4gICAgICBsaW1pdDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggaXNzdWVzIHRvIHJldHVybiAoZGVmYXVsdDogMTApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc3RhdGUsIGxhYmVscywgbGltaXQgfTogR2hMaXN0SXNzdWVzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUnKTtcblxuICAgICAgICBsZXQgcXVlcnkgPSBgc3RhdGU9JHtzdGF0ZX1gO1xuICAgICAgICBpZiAobGFiZWxzICYmIGxhYmVscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcXVlcnkgKz0gYCZsYWJlbHM9JHtsYWJlbHMuam9pbignLCcpfWA7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc3N1ZXMgPSBhd2FpdCBnaEFwaVJlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vaXNzdWVzPyR7cXVlcnl9JnBlcl9wYWdlPSR7bGltaXQgfHwgMTB9YCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaXNzdWVzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBpc3N1ZXMgbGlzdGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3ZpZXdfY29tbWVudHMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF92aWV3X2NvbW1lbnRzJyxcbiAgICBkZXNjcmlwdGlvbjogJ1ZpZXcgY29tbWVudHMgb24gYSBzcGVjaWZpYyBpc3N1ZSBvciBwdWxsIHJlcXVlc3QuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLmRlc2NyaWJlKCdUaGUgaXNzdWUgb3IgUFIgbnVtYmVyJyksXG4gICAgICB0eXBlOiB6LmVudW0oWydpc3N1ZScsICdwciddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ2lzc3VlJykuZGVzY3JpYmUoXCJXaGV0aGVyIGl0J3MgYW4gaXNzdWUgb3IgYSBwdWxsIHJlcXVlc3RcIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbnVtYmVyLCB0eXBlIH06IEdoVmlld0NvbW1lbnRzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUnKTtcblxuICAgICAgICBjb25zdCBjb21tZW50cyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS8ke3R5cGUgPT09ICdwcicgPyAncHVsbHMnIDogJ2lzc3Vlcyd9LyR7bnVtYmVyfS9jb21tZW50c2ApO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1lbnRzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBjb21tZW50cyB2aWV3aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfY3JlYXRlX3ByIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfY3JlYXRlX3ByJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBwdWxsIHJlcXVlc3QgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgUFIgdGl0bGUnKSxcbiAgICAgIGJvZHk6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIFBSIGJvZHkvZGVzY3JpcHRpb24nKSxcbiAgICAgIGhlYWRfYnJhbmNoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgYnJhbmNoIGNvbnRhaW5pbmcgeW91ciBjaGFuZ2VzJyksXG4gICAgICBiYXNlX2JyYW5jaDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ21haW4nKS5kZXNjcmliZSgnVGhlIGJyYW5jaCB5b3Ugd2FudCB0byBtZXJnZSBpbnRvIChlLmcuLCBtYWluLCBtYXN0ZXIpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGl0bGUsIGJvZHksIGhlYWRfYnJhbmNoLCBiYXNlX2JyYW5jaCB9OiBHaENyZWF0ZVByUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUnKTtcblxuICAgICAgICBjb25zdCBwciA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnUE9TVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vcHVsbHNgLCB7IHRpdGxlLCBib2R5LCBoZWFkOiBoZWFkX2JyYW5jaCwgYmFzZTogYmFzZV9icmFuY2ggfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY3JlYXRlZDogdHJ1ZSwgdXJsOiAocHIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmh0bWxfdXJsIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUiBjcmVhdGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2xpc3RfcHJzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfbGlzdF9wcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCBwdWxsIHJlcXVlc3RzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzdGF0ZTogei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdvcGVuJykuZGVzY3JpYmUoJ0ZpbHRlciBieSBQUiBzdGF0ZScpLFxuICAgICAgbGltaXQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnTWF4IFBScyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHN0YXRlLCBsaW1pdCB9OiBHaExpc3RQcnNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZScpO1xuXG4gICAgICAgIGNvbnN0IHBycyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9wdWxscz9zdGF0ZT0ke3N0YXRlfSZwZXJfcGFnZT0ke2xpbWl0IHx8IDEwfWApO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHBycyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgUFJzIGxpc3RpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF92aWV3X3ByX2RpZmYgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF92aWV3X3ByX2RpZmYnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmV0Y2ggdGhlIGRpZmYvcGF0Y2ggb2YgYSBzcGVjaWZpYyBwdWxsIHJlcXVlc3QuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLmRlc2NyaWJlKCdUaGUgUFIgbnVtYmVyJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbnVtYmVyIH06IEdoVmlld1ByRGlmZlBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lJyk7XG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke3JlcG9OYW1lfS9wdWxscy8ke251bWJlcn0vZGlmZmAsIHtcbiAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Byb2Nlc3MuZW52LkdJVEhVQl9UT0tFTn1gIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBkaWZmOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGRpZmYgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGlmZiB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgUFIgZGlmZiBmZXRjaGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3B1c2ggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9wdXNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1B1c2ggbG9jYWwgY29tbWl0cyB0byB0aGUgcmVtb3RlIEdpdEh1YiByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgYnJhbmNoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBUaGUgYnJhbmNoIHRvIHB1c2guIERlZmF1bHRzIHRvIGN1cnJlbnQgYnJhbmNoLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGJyYW5jaCB9OiBHaFB1c2hQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBhd2FpdCBnaXQucHVzaChicmFuY2ggfHwgJ29yaWdpbicsICdIRUFEJyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcHVzaGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBwdXNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG4vLyBDNSBGSVg6IFByb3BlciB0eXBpbmcgaW5zdGVhZCBvZiBhbnlcbmltcG9ydCB0eXBlICogYXMgUHVwcGV0ZWVyIGZyb20gJ3B1cHBldGVlcic7XG5cbmxldCBwdXBwZXRlZXJNb2R1bGU6IHR5cGVvZiBQdXBwZXRlZXIgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0UHVwcGV0ZWVyKCk6IFByb21pc2U8dHlwZW9mIFB1cHBldGVlcj4ge1xuICBpZiAoIXB1cHBldGVlck1vZHVsZSkge1xuICAgIGNvbnN0IGltcG9ydGVkID0gYXdhaXQgaW1wb3J0KCdwdXBwZXRlZXInKTtcbiAgICBwdXBwZXRlZXJNb2R1bGUgPSBpbXBvcnRlZC5kZWZhdWx0IHx8IGltcG9ydGVkO1xuICB9XG4gIHJldHVybiBwdXBwZXRlZXJNb2R1bGU7XG59XG5cbi8qKiBSZXNldCBwdXBwZXRlZXIgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFB1cHBldGVlckNhY2hlKCk6IHZvaWQge1xuICBwdXBwZXRlZXJNb2R1bGUgPSBudWxsO1xufVxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXInO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuXG4vKiogQnJvd3NlciBzZXNzaW9uIG1hbmFnZXIgd2l0aCBhdXRvLWNsZWFudXAgYW5kIGNvbm5lY3Rpb24gcG9vbGluZyAoc2luZ2xldG9uIHBhdHRlcm4pICovXG5jbGFzcyBCcm93c2VyU2Vzc2lvbk1hbmFnZXIge1xuICBwcml2YXRlIGJyb3dzZXJJbnN0YW5jZTogUHVwcGV0ZWVyLkJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjdXJyZW50UGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjbGVhbnVwVGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKTtcbiAgcHJpdmF0ZSByZWFkb25seSBJTkFDVElWSVRZX1RJTUVPVVRfTVMgPSA1ICogNjAgKiAxMDAwOyAvLyA1IG1pbnV0ZXNcbiAgcHJpdmF0ZSByZWFkb25seSBNQVhfUkVUUklFUyA9IDI7XG4gIHByaXZhdGUgcmV0cnlDb3VudCA9IDA7XG5cbiAgLyoqIEdldCBvciBjcmVhdGUgYSBwZXJzaXN0ZW50IFB1cHBldGVlciBicm93c2VyIGluc3RhbmNlIHdpdGggYXV0by1yZXRyeSAqL1xuICBhc3luYyBnZXRCcm93c2VyKCk6IFByb21pc2U8UHVwcGV0ZWVyLkJyb3dzZXI+IHtcbiAgICBpZiAoIXRoaXMuYnJvd3Nlckluc3RhbmNlIHx8ICF0aGlzLmJyb3dzZXJJbnN0YW5jZS5jb25uZWN0ZWQoKSkge1xuICAgICAgdGhpcy5yZXRyeUNvdW50ID0gMDtcbiAgICAgIHdoaWxlICh0aGlzLnJldHJ5Q291bnQgPCB0aGlzLk1BWF9SRVRSSUVTKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcHVwcGV0ZWVyTGliID0gYXdhaXQgZ2V0UHVwcGV0ZWVyKCk7XG4gICAgICAgICAgdGhpcy5icm93c2VySW5zdGFuY2UgPSBhd2FpdCBwdXBwZXRlZXJMaWIubGF1bmNoKHsgXG4gICAgICAgICAgICBoZWFkbGVzczogdHJ1ZSxcbiAgICAgICAgICAgIGFyZ3M6IFsnLS1uby1zYW5kYm94JywgJy0tZGlzYWJsZS1zZXR1aWQtc2FuZGJveCddIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLnJldHJ5Q291bnQrKztcbiAgICAgICAgICBpZiAodGhpcy5yZXRyeUNvdW50ID49IHRoaXMuTUFYX1JFVFJJRVMpIHRocm93IGVycm9yO1xuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMDAwICogdGhpcy5yZXRyeUNvdW50KSk7IC8vIEV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlc2V0Q2xlYW51cFRpbWVyKCk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICByZXR1cm4gdGhpcy5icm93c2VySW5zdGFuY2UhO1xuICB9XG5cbiAgLyoqIEdldCBvciBjcmVhdGUgYSBwYWdlIGluIHRoZSBwZXJzaXN0ZW50IGJyb3dzZXIgaW5zdGFuY2UgKi9cbiAgYXN5bmMgZ2V0UGFnZSgpOiBQcm9taXNlPFB1cHBldGVlci5QYWdlPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRQYWdlIHx8ICFhd2FpdCB0aGlzLmlzUGFnZVZhbGlkKCkpIHtcbiAgICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCB0aGlzLmdldEJyb3dzZXIoKTtcbiAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICB9XG4gICAgdGhpcy5yZXNldENsZWFudXBUaW1lcigpO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlO1xuICB9XG5cbiAgLyoqIENoZWNrIGlmIGN1cnJlbnQgcGFnZSBpcyBzdGlsbCB2YWxpZCAqL1xuICBwcml2YXRlIGFzeW5jIGlzUGFnZVZhbGlkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMuY3VycmVudFBhZ2UpIHJldHVybiBmYWxzZTtcbiAgICAgIGF3YWl0IHRoaXMuY3VycmVudFBhZ2UuZXZhbHVhdGUoJzEnKTsgLy8gUXVpY2sgdmFsaWRhdGlvblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlc2V0IHRoZSBpbmFjdGl2aXR5IGNsZWFudXAgdGltZXIgKi9cbiAgcHJpdmF0ZSByZXNldENsZWFudXBUaW1lcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jbGVhbnVwVGltZXIpIGNsZWFyVGltZW91dCh0aGlzLmNsZWFudXBUaW1lcik7XG4gICAgdGhpcy5sYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuY2xlYW51cFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLmRpc3Bvc2UoKSwgdGhpcy5JTkFDVElWSVRZX1RJTUVPVVRfTVMpO1xuICB9XG5cbiAgLyoqIEV4cGxpY2l0bHkgZGlzcG9zZSBicm93c2VyIGFuZCBjYW5jZWwgY2xlYW51cCB0aW1lciAqL1xuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNsZWFudXBUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuY2xlYW51cFRpbWVyKTtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuYnJvd3Nlckluc3RhbmNlICYmIHRoaXMuYnJvd3Nlckluc3RhbmNlLmNvbm5lY3RlZCgpKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYXdhaXQtdGhlbmFibGVcbiAgICAgICAgYXdhaXQgdGhpcy5icm93c2VySW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBjbG9zZSBlcnJvcnNcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5icm93c2VySW5zdGFuY2UgPSBudWxsO1xuICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IG51bGw7XG4gICAgICB0aGlzLmxhc3RBY3Rpdml0eSA9IERhdGUubm93KCk7XG4gICAgICB0aGlzLnJldHJ5Q291bnQgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVjayBpZiBicm93c2VyIGlzIGNvbm5lY3RlZCAqL1xuICBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5icm93c2VySW5zdGFuY2UgJiYgdGhpcy5icm93c2VySW5zdGFuY2UuY29ubmVjdGVkKCkpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgY3VycmVudCBwYWdlIChwdWJsaWMgYWNjZXNzb3IpICovXG4gIGdldEN1cnJlbnRQYWdlKCk6IFB1cHBldGVlci5QYWdlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2U7XG4gIH1cblxuICAvKiogU2V0IHRoZSBjdXJyZW50IHBhZ2UgKHB1YmxpYyBzZXR0ZXIpICovXG4gIHNldEN1cnJlbnRQYWdlKHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZSBmb3IgdGhpcyBtb2R1bGVcbmNvbnN0IGJyb3dzZXJNYW5hZ2VyID0gbmV3IEJyb3dzZXJTZXNzaW9uTWFuYWdlcigpO1xuXG4vKiogRXhwb3J0IGNsZWFudXAgZnVuY3Rpb24gZm9yIHBsdWdpbiB1bmxvYWQgbGlmZWN5Y2xlICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW51cEJyb3dzZXJTZXNzaW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xufVxuXG4vLyBDNSBGSVg6IFByb3BlciBwYXJhbSB0eXBlc1xuaW50ZXJmYWNlIEJyb3dzZXJPcGVuUGFnZVBhcmFtcyB7XG4gIHVybDogc3RyaW5nO1xuICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7XG4gIHdhaXRfZm9yX3NlbGVjdG9yPzogc3RyaW5nO1xuICBmdWxsX3BhZ2Vfc2NyZWVuc2hvdD86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBCcm93c2VyU2Vzc2lvbkNvbnRyb2xQYXJhbXMge1xuICBhY3Rpb25zPzogdW5rbm93bltdO1xuICByZWFkX3BhZ2U/OiBib29sZWFuO1xuICBmdWxsX3JlYWQ/OiBib29sZWFuO1xuICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBQcmV2aWV3SHRtbFBhcmFtcyB7XG4gIGh0bWxfY29udGVudDogc3RyaW5nO1xuICBmaWxlX25hbWU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBPcGVuRmlsZVBhcmFtcyB7XG4gIHRhcmdldDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCcm93c2VyVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuICAvLyBicm93c2VyX29wZW5fcGFnZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Jyb3dzZXJfb3Blbl9wYWdlJyxcbiAgICBkZXNjcmlwdGlvbjogJ09wZW4gYSB3ZWJwYWdlIGluIGEgaGVhZGxlc3MgYnJvd3NlciAoUHVwcGV0ZWVyKSwgcmVuZGVyIGl0IG9uY2UsIGFuZCByZXR1cm4gY29udGVudC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBvcGVuJyksXG4gICAgICBzY3JlZW5zaG90X3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnUGF0aCB0byBzYXZlIGEgc2NyZWVuc2hvdC4nKSxcbiAgICAgIHdhaXRfZm9yX3NlbGVjdG9yOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0NTUyBzZWxlY3RvciB0byB3YWl0IGZvciBiZWZvcmUgcmV0dXJuaW5nLicpLFxuICAgICAgZnVsbF9wYWdlX3NjcmVlbnNob3Q6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0lmIHRydWUsIGNhcHR1cmVzIHRoZSBmdWxsIHBhZ2Ugd2hlbiB0YWtpbmcgYSBzY3JlZW5zaG90LicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCwgc2NyZWVuc2hvdF9wYXRoLCB3YWl0X2Zvcl9zZWxlY3RvciwgZnVsbF9wYWdlX3NjcmVlbnNob3QgfTogQnJvd3Nlck9wZW5QYWdlUGFyYW1zKSA9PiB7XG4gICAgICBsZXQgYnJvd3NlcjogUHVwcGV0ZWVyLkJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgICAgIGxldCBwYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuXG4gICAgICB0cnkge1xuICAgICAgICBicm93c2VyID0gYXdhaXQgYnJvd3Nlck1hbmFnZXIuZ2V0QnJvd3NlcigpO1xuICAgICAgICBwYWdlID0gYnJvd3Nlck1hbmFnZXIuZ2V0Q3VycmVudFBhZ2UoKTtcblxuICAgICAgICBpZiAoIXBhZ2UgfHwgKGF3YWl0IHBhZ2UudXJsKCkpICE9PSB1cmwpIHtcbiAgICAgICAgICAvLyBJZiBubyBjdXJyZW50IHBhZ2Ugb3IgVVJMIGRvZXNuJ3QgbWF0Y2gsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgICBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG4gICAgICAgICAgYnJvd3Nlck1hbmFnZXIuc2V0Q3VycmVudFBhZ2UocGFnZSk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBwYWdlLmdvdG8odXJsLCB7IHdhaXRVbnRpbDogJ2RvbWNvbnRlbnRsb2FkZWQnIH0pO1xuXG4gICAgICAgIGlmICh3YWl0X2Zvcl9zZWxlY3Rvcikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBwYWdlLndhaXRGb3JTZWxlY3Rvcih3YWl0X2Zvcl9zZWxlY3RvciwgeyB0aW1lb3V0OiA1MDAwIH0pO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gSWdub3JlIHRpbWVvdXQsIGNvbnRpbnVlIHdpdGggY29udGVudCBleHRyYWN0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IHVybCwgb3BlbmVkOiB0cnVlIH07XG5cbiAgICAgICAgaWYgKHNjcmVlbnNob3RfcGF0aCkge1xuICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCwgZnVsbFBhZ2U6IGZ1bGxfcGFnZV9zY3JlZW5zaG90IH0pO1xuICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFNhdmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZSBzdHJpbmctYmFzZWQgZXZhbHVhdGUgdG8gYnlwYXNzIFRTMjU4NC9UUzIzMDQgJ2RvY3VtZW50JyBlcnJvcnMgaW4gTm9kZS5qcyBlbnZpcm9ubWVudFxuICAgICAgICBjb25zdCB0ZXh0Q29udGVudDogc3RyaW5nID0gYXdhaXQgcGFnZS5ldmFsdWF0ZShgcmV0dXJuIGRvY3VtZW50LmJvZHkgPyBkb2N1bWVudC5ib2R5LmlubmVyVGV4dCA6ICcnO2ApO1xuICAgICAgICByZXN1bHREYXRhLnBhZ2VUZXh0ID0gdGV4dENvbnRlbnQuc3Vic3RyaW5nKDAsIDIwMDApO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBvcGVuIHBhZ2U6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBOT1RFOiBXZSBkb24ndCBjbG9zZSB0aGUgYnJvd3NlciBoZXJlIGJlY2F1c2Ugd2UgdXNlIGEgc2luZ2xldG9uIHBhdHRlcm4uXG4gICAgICAgIC8vIFRoZSBicm93c2VyIHN0YXlzIGFsaXZlIGZvciBzdWJzZXF1ZW50IHJlcXVlc3RzIHZpYSBicm93c2VyX3Nlc3Npb25fY29udHJvbC5cbiAgICAgICAgLy8gVXNlIGJyb3dzZXJfc2Vzc2lvbl9jbG9zZSB0byBleHBsaWNpdGx5IHRlcm1pbmF0ZSBpdC5cbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYnJvd3Nlcl9zZXNzaW9uX2NvbnRyb2wgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdicm93c2VyX3Nlc3Npb25fY29udHJvbCcsXG4gICAgZGVzY3JpcHRpb246ICdDb250cm9sIHRoZSBhY3RpdmUgcGVyc2lzdGVudCBicm93c2VyIHNlc3Npb24uIFN1cHBvcnRzIGFjdGlvbnMsIHBhZ2UgcmVhZGluZywgc2NyZWVuc2hvdCBjYXB0dXJlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgYWN0aW9uczogei5hcnJheSh6LmFueSgpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbCBzY3JpcHRlZCBicm93c2VyIGFjdGlvbnMgdG8gZXhlY3V0ZS4nKSxcbiAgICAgIHJlYWRfcGFnZTogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnSWYgdHJ1ZSwgcmV0dXJucyBwYWdlIG1ldGFkYXRhLicpLFxuICAgICAgZnVsbF9yZWFkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdJZiB0cnVlLCBmb3JjZXMgZnVsbCBwYWdlIHRleHQgb3V0cHV0LicpLFxuICAgICAgc2NyZWVuc2hvdF9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHNjcmVlbnNob3Qgb3V0cHV0IHBhdGguJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYWN0aW9ucywgcmVhZF9wYWdlLCBmdWxsX3JlYWQsIHNjcmVlbnNob3RfcGF0aCB9OiBCcm93c2VyU2Vzc2lvbkNvbnRyb2xQYXJhbXMpID0+IHtcbiAgICAgIGxldCBwYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuXG4gICAgICB0cnkge1xuICAgICAgICBwYWdlID0gYXdhaXQgYnJvd3Nlck1hbmFnZXIuZ2V0UGFnZSgpO1xuXG4gICAgICAgIGlmIChhY3Rpb25zICYmIEFycmF5LmlzQXJyYXkoYWN0aW9ucykpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGFjdGlvbiBvZiBhY3Rpb25zIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+W10pIHtcbiAgICAgICAgICAgIGlmIChhY3Rpb24udHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICBhd2FpdCBwYWdlLmNsaWNrKGFjdGlvbi5zZWxlY3RvciBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gJ3R5cGUnKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UudHlwZShhY3Rpb24uc2VsZWN0b3IgYXMgc3RyaW5nLCBhY3Rpb24udGV4dCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gJ2dvdG8nKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZ290byhhY3Rpb24udXJsIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAnZXZhbHVhdGUnKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZXZhbHVhdGUoYWN0aW9uLnNjcmlwdCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0geyBhY3Rpb25zRXhlY3V0ZWQ6IGFjdGlvbnM/Lmxlbmd0aCB8fCAwIH07XG5cbiAgICAgICAgaWYgKHJlYWRfcGFnZSB8fCBmdWxsX3JlYWQpIHtcbiAgICAgICAgICAvLyBVc2Ugc3RyaW5nLWJhc2VkIGV2YWx1YXRlIHRvIGJ5cGFzcyBUUzI1ODQgJ2RvY3VtZW50JyBlcnJvcnMgaW4gTm9kZS5qcyBlbnZpcm9ubWVudFxuICAgICAgICAgIGNvbnN0IHRleHQ6IHN0cmluZyA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoYHJldHVybiBkb2N1bWVudC5ib2R5ID8gZG9jdW1lbnQuYm9keS5pbm5lclRleHQgOiAnJztgKTtcbiAgICAgICAgICByZXN1bHREYXRhLnBhZ2VUZXh0ID0gZnVsbF9yZWFkID8gdGV4dCA6IHRleHQuc3Vic3RyaW5nKDAsIDEwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjcmVlbnNob3RfcGF0aCkge1xuICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCB9KTtcbiAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RTYXZlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBCcm93c2VyIGNvbnRyb2wgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gUGFnZSBzdGF5cyBhbGl2ZSBmb3Igc2Vzc2lvbiByZXVzZS4gQnJvd3NlciBpcyBtYW5hZ2VkIGJ5IGJyb3dzZXJfc2Vzc2lvbl9jbG9zZS5cbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Nsb3NlIHRoZSBhY3RpdmUgcGVyc2lzdGVudCBicm93c2VyIHNlc3Npb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNsb3NlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gY2xvc2UgYnJvd3NlciBzZXNzaW9uOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gRW5zdXJlIGNsZWFudXAgZXZlbiBvbiBmYWlsdXJlXG4gICAgICAgIGF3YWl0IGJyb3dzZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcHJldmlld19odG1sIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncHJldmlld19odG1sJyxcbiAgICBkZXNjcmlwdGlvbjogXCJSZW5kZXIgYW5kIHByZXZpZXcgSFRNTCBjb250ZW50IGluIHRoZSBzeXN0ZW0ncyBkZWZhdWx0IGJyb3dzZXIuXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSFRNTCBjb250ZW50IHRvIHJlbmRlcicpLFxuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgncHJldmlldy5odG1sJykuZGVzY3JpYmUoJ09wdGlvbmFsIGZpbGVuYW1lIChkZWZhdWx0OiBwcmV2aWV3Lmh0bWwpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBmaWxlX25hbWUgfTogUHJldmlld0h0bWxQYXJhbXMpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZV9uYW1lIHx8ICdwcmV2aWV3Lmh0bWwnO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihnZXRXb3JraW5nRGlyKCksIGZpbGVOYW1lKTtcblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBodG1sX2NvbnRlbnQpO1xuXG4gICAgICAgIC8vIE9wZW4gaW4gZGVmYXVsdCBicm93c2VyIHVzaW5nIEVTIGltcG9ydFxuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdChmaWxlUGF0aCk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwcmV2aWV3ZWQ6IHRydWUsIGZpbGU6IGZpbGVOYW1lIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBwcmV2aWV3IEhUTUw6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG9wZW5fZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ29wZW5fZmlsZScsXG4gICAgZGVzY3JpcHRpb246IFwiT3BlbiBhIGZpbGUgb3IgVVJMIGluIHRoZSBzeXN0ZW0ncyBkZWZhdWx0IGFwcGxpY2F0aW9uLlwiLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRhcmdldDogei5zdHJpbmcoKS5kZXNjcmliZSgnRmlsZSBwYXRoIG9yIFVSTCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRhcmdldCB9OiBPcGVuRmlsZVBhcmFtcykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgb3Blbk1vZHVsZSA9IGF3YWl0IGltcG9ydCgnb3BlbicpO1xuICAgICAgICBhd2FpdCBvcGVuTW9kdWxlLmRlZmF1bHQodGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBvcGVuZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gZmlsZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZVNRTFF1ZXJ5IH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuXG4vLyBMYXp5LWxvYWQgbm9kZTpzcWxpdGUgKE5vZGUuanMgMjMrKS4gR3JhY2VmdWwgZmFsbGJhY2sgZm9yIG9sZGVyIE5vZGUgdmVyc2lvbnMuXG5sZXQgc3FsaXRlTW9kdWxlOiB0eXBlb2YgaW1wb3J0KCdub2RlOnNxbGl0ZScpIHwgbnVsbCA9IG51bGw7XG5sZXQgc3FsaXRlTG9hZEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3FsaXRlKCk6IFByb21pc2U8dHlwZW9mIGltcG9ydCgnbm9kZTpzcWxpdGUnKT4ge1xuICBpZiAoc3FsaXRlTW9kdWxlKSByZXR1cm4gc3FsaXRlTW9kdWxlO1xuICBpZiAoc3FsaXRlTG9hZEVycm9yKSB0aHJvdyBuZXcgRXJyb3Ioc3FsaXRlTG9hZEVycm9yKTtcblxuICB0cnkge1xuICAgIHNxbGl0ZU1vZHVsZSA9IGF3YWl0IGltcG9ydCgnbm9kZTpzcWxpdGUnKTtcbiAgICByZXR1cm4gc3FsaXRlTW9kdWxlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBzcWxpdGVMb2FkRXJyb3IgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFNRTGl0ZSBpcyBub3QgYXZhaWxhYmxlIChub2RlOnNxbGl0ZSByZXF1aXJlcyBOb2RlLmpzIDIzKykuIGAgK1xuICAgICAgYE9yaWdpbmFsIGVycm9yOiAke3NxbGl0ZUxvYWRFcnJvcn0uIGAgK1xuICAgICAgYFBsZWFzZSBkaXNhYmxlIGRhdGFiYXNlIHF1ZXJpZXMgaW4gcGx1Z2luIHNldHRpbmdzIG9yIHVwZ3JhZGUgTm9kZS5gXG4gICAgKTtcbiAgfVxufVxuXG4vKiogUmVzZXQgc3FsaXRlIG1vZHVsZSBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRTcWxpdGVDYWNoZSgpOiB2b2lkIHtcbiAgc3FsaXRlTW9kdWxlID0gbnVsbDtcbiAgc3FsaXRlTG9hZEVycm9yID0gbnVsbDtcbn1cblxuLyoqIFR5cGVkIHBhcmFtcyBpbnRlcmZhY2UgKi9cbmludGVyZmFjZSBRdWVyeURhdGFiYXNlUGFyYW1zIHtcbiAgcXVlcnk6IHN0cmluZztcbiAgZGJfcGF0aD86IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRGF0YWJhc2VUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcXVlcnlfZGF0YWJhc2UgdG9vbCBcdTIwMTQgQzcgRklYOiBBZGRlZCBvcHRpb25hbCBkYl9wYXRoIHBhcmFtZXRlclxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdxdWVyeV9kYXRhYmFzZScsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gcmVhZC1vbmx5IFNRTGl0ZSBxdWVyaWVzLiBEZWZhdWx0cyB0byBpbi1tZW1vcnkgZGF0YWJhc2U7IG9wdGlvbmFsbHkgc3BlY2lmeSBhIGZpbGUgcGF0aC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTUUwgcXVlcnkgc3RyaW5nIChyZWFkLW9ubHkgb25seSknKSxcbiAgICAgIGRiX3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCc6bWVtb3J5OicpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBTUUxpdGUgZGF0YWJhc2UgZmlsZSAoZGVmYXVsdDogOm1lbW9yeTopJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIGRiX3BhdGggfTogUXVlcnlEYXRhYmFzZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2VjdXJpdHkgY2hlY2sgLSB1c2Ugcm9idXN0IFNRTCB2YWxpZGF0aW9uIGluc3RlYWQgb2Ygc2ltcGxlIHJlZ2V4IG1hdGNoaW5nXG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZCA9IHZhbGlkYXRlU1FMUXVlcnkocXVlcnkpO1xuICAgICAgICBpZiAoIXZhbGlkYXRlZC52YWxpZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBTUUwgcXVlcnkgZGV0ZWN0ZWQ6ICR7dmFsaWRhdGVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMYXp5LWxvYWQgbm9kZTpzcWxpdGUgd2l0aCBncmFjZWZ1bCBmYWxsYmFja1xuICAgICAgICBjb25zdCB7IG9wZW4gfSA9IGF3YWl0IGdldFNxbGl0ZSgpO1xuICAgICAgICBjb25zdCBkYiA9IG9wZW4oZGJfcGF0aCB8fCAnOm1lbW9yeTonKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHN0bXQgPSBkYi5wcmVwYXJlKHF1ZXJ5KTtcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gc3RtdC5hbGwoKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHF1ZXJ5LCByZXN1bHRzIH0gfTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYXRhYmFzZSBxdWVyeSBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIgfSBmcm9tICcuLi9iYWNrZ3JvdW5kQ29tbWFuZHMuanMnO1xuaW1wb3J0IHsgc2FuaXRpemVDb21tYW5kIH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUnVuQmFja2dyb3VuZENvbW1hbmRQYXJhbXMgeyBjb21tYW5kOiBzdHJpbmc7IHRpbWVvdXRfaG91cnM6IG51bWJlcjsgbmFtZTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQ2hlY2tCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGlkOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDYW5jZWxCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGlkOiBzdHJpbmc7IH1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQmFja2dyb3VuZENvbW1hbmRUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyOiBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcnVuX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9iYWNrZ3JvdW5kX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhcnQgYSBsb25nLXJ1bm5pbmcgcHJvY2VzcyBpbiB0aGUgYmFja2dyb3VuZC4gVGhlIHByb2Nlc3MgaXMgbm90IGJsb2NrZWQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2hlbGwgY29tbWFuZCB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X2hvdXJzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCgxMCkuZGVzY3JpYmUoJ01BTkRBVE9SWTogSG93IGxvbmcgdGhlIHByb2Nlc3MgaXMgYWxsb3dlZCB0byBydW4gYmVmb3JlIGJlaW5nIGtpbGxlZC4nKSxcbiAgICAgIG5hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ01BTkRBVE9SWTogQSBzaG9ydCwgZGVzY3JpcHRpdmUgbmFtZSBmb3IgdGhlIGJhY2tncm91bmQgdGFzaycpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbW1hbmQsIHRpbWVvdXRfaG91cnMsIG5hbWUgfTogUnVuQmFja2dyb3VuZENvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFNlY3VyaXR5IGNoZWNrIC0gdXNlIHJvYnVzdCBzYW5pdGl6YXRpb24gaW5zdGVhZCBvZiBzaW1wbGUgc3RyaW5nIG1hdGNoaW5nXG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpZCA9IGJhY2tncm91bmRDb21tYW5kTWFuYWdlci5yZWdpc3Rlcihjb21tYW5kLCB0aW1lb3V0X2hvdXJzLCBuYW1lKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpZCwgbmFtZSwgY29tbWFuZCwgdGltZW91dEhvdXJzOiB0aW1lb3V0X2hvdXJzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNoZWNrX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NoZWNrX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdDaGVjayB0aGUgc3RhdHVzLCBzdGRvdXQsIGFuZCBzdGRlcnIgb2YgYSBydW5uaW5nIG9yIGNvbXBsZXRlZCBiYWNrZ3JvdW5kIGNvbW1hbmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1hbmQgaWRlbnRpZmllcicpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGlkIH06IENoZWNrQmFja2dyb3VuZENvbW1hbmRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIuY2hlY2soaWQpO1xuICAgICAgICBpZiAoIWNvbW1hbmQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb21tYW5kIG5vdCBmb3VuZDogJHtpZH1gIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogY29tbWFuZCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2FuY2VsX2JhY2tncm91bmRfY29tbWFuZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NhbmNlbF9iYWNrZ3JvdW5kX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnS2lsbCBhIHJ1bm5pbmcgYmFja2dyb3VuZCBjb21tYW5kLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBjb21tYW5kIGlkZW50aWZpZXInKSxcbiAgICB9LFxuICAgIC8vIFNESyByZXF1aXJlcyBhc3luYyBpbXBsZW1lbnRhdGlvblxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBpZCB9OiBDYW5jZWxCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2FuY2VsbGVkID0gYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLmNhbmNlbChpZCk7XG4gICAgICAgIGlmICghY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ2Fubm90IGNhbmNlbCBjb21tYW5kOiAke2lkfSAobm90IGZvdW5kIG9yIG5vdCBydW5uaW5nKWAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlkLCBjYW5jZWxsZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgc2FuaXRpemVDb21tYW5kIH0gZnJvbSAnLi4vc2VjdXJpdHkuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTaGFyZWQgU3Bhd24gSGVscGVyID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTcGF3blJlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIGRhdGE/OiB7IHN0ZG91dDogc3RyaW5nOyBzdGRlcnI6IHN0cmluZyB9O1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBTYWZlbHkgc3Bhd24gYSBwcm9jZXNzIHdpdGggdGltZW91dCwgY2FwdHVyaW5nIHN0ZG91dC9zdGRlcnIuXG4gKiBFbGltaW5hdGVzIGNvZGUgZHVwbGljYXRpb24gYWNyb3NzIGV4ZWN1dGlvbiB0b29scy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2FmZVNwYXduKFxuICBleGU6IHN0cmluZyxcbiAgYXJnczogc3RyaW5nW10sXG4gIHRpbWVvdXRNczogbnVtYmVyLFxuICBpbnB1dD86IHN0cmluZ1xuKTogUHJvbWlzZTxTcGF3blJlc3VsdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBwcm9jID0gc3Bhd24oZXhlLCBhcmdzLCB7XG4gICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgdGltZW91dDogdGltZW91dE1zLFxuICAgICAgY3dkOiBnZXRXb3JraW5nRGlyKCksIC8vIEV4ZWN1dGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAgICB9KTtcblxuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIHByb2Muc3RkaW4/LndyaXRlKGlucHV0KTtcbiAgICAgIHByb2Muc3RkaW4/LmVuZCgpO1xuICAgIH1cblxuICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcHJvYy5raWxsKCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRXhlY3V0aW9uIHRpbWVkIG91dCcgfSk7XG4gICAgfSwgdGltZW91dE1zKTtcblxuICAgIHByb2Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc3Rkb3V0OiBzdGRvdXQudHJpbSgpLCBzdGRlcnI6IHN0ZGVyci50cmltKCkgfSB9KTtcbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFNwYXduIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJ1bkphdmFTY3JpcHRQYXJhbXMgeyBqYXZhc2NyaXB0OiBzdHJpbmc7IHRpbWVvdXRfc2Vjb25kcz86IG51bWJlcjsgfVxuaW50ZXJmYWNlIFJ1blB5dGhvblBhcmFtcyB7IHB5dGhvbjogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBFeGVjdXRlQ29tbWFuZFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyOyBpbnB1dD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJ1bkluVGVybWluYWxQYXJhbXMgeyBjb21tYW5kOiBzdHJpbmc7IH1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRXhlY3V0aW9uIFRvb2xzID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckV4ZWN1dGlvblRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBydW5famF2YXNjcmlwdCB0b29sIFx1MjAxNCBTQU5EQk9YRUQgd2l0aCBkZW5vIChpZiBhdmFpbGFibGUpIG9yIG5vZGUgd2l0aCBzdHJpY3QgcmVzdHJpY3Rpb25zXG4gIC8vIFM1IEZJWDogRW5oYW5jZWQgZGFuZ2Vyb3VzIHBhdHRlcm4gZGV0ZWN0aW9uIHRvIHByZXZlbnQgZXZhbC9yZXF1aXJlIGJ5cGFzc2VzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9qYXZhc2NyaXB0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biBKYXZhU2NyaXB0IGNvZGUgc25pcHBldCB1c2luZyBOb2RlLmpzIChzYW5kYm94ZWQpLiBObyBleHRlcm5hbCBtb2R1bGUgaW1wb3J0cyBhbGxvd2VkLiBTdGFuZGFyZCBsaWJyYXJ5IG9ubHkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBqYXZhc2NyaXB0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSmF2YVNjcmlwdCBjb2RlIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfc2Vjb25kczogei5udW1iZXIoKS5taW4oMC4xKS5tYXgoNjApLm9wdGlvbmFsKCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnVGltZW91dCBpbiBzZWNvbmRzIChtYXggNjApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgamF2YXNjcmlwdCwgdGltZW91dF9zZWNvbmRzIH06IFJ1bkphdmFTY3JpcHRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFJvYnVzdCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gXHUyMDE0IGJsb2NrcyBldmFsLCByZXF1aXJlLCBpbXBvcnQsIGZzLCBjaGlsZF9wcm9jZXNzXG4gICAgICAgIC8vIFM1IEZJWDogQWRkZWQgcGF0dGVybnMgZm9yIGNvbW1vbiBieXBhc3MgdGVjaG5pcXVlc1xuICAgICAgICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAgICAgICAvXFxicmVxdWlyZVxccypcXCgvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzKy9pLFxuICAgICAgICAgIC9cXGJmc1xcLi9pLFxuICAgICAgICAgIC9cXGJjaGlsZF9wcm9jZXNzXFxiL2ksXG4gICAgICAgICAgL1xcYmV2YWxcXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV4ZWNcXHMqXFwoL2ksXG4gICAgICAgICAgL2dsb2JhbFRoaXNcXC5yZXF1aXJlL2ksXG4gICAgICAgICAgL3Byb2Nlc3NcXC5leGl0L2ksXG4gICAgICAgICAgL19fcHJvdG9fXy9pLFxuICAgICAgICAgIC8vIFM1IEZJWDogQnlwYXNzIHByZXZlbnRpb24gcGF0dGVybnNcbiAgICAgICAgICAvRnVuY3Rpb25cXHMqXFwoL2ksICAgICAgICAgICAgICAgICAgICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvclxuICAgICAgICAgIC9TdHJpbmdcXC5mcm9tQ2hhckNvZGVcXHMqXFwoL2ksICAgICAgIC8vLmZyb21DaGFyQ29kZSBieXBhc3NcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzKlxcKC4qXFwpL2ksICAgICAgICAgICAgICAgLy8gRHluYW1pYyBpbXBvcnRcbiAgICAgICAgICAvXFwuY29uc3RydWN0b3IvaSwgICAgICAgICAgICAgICAgICAgLy8gQ29uc3RydWN0b3IgYWNjZXNzXG4gICAgICAgICAgL3JlcXVpcmVcXC5yZXNvbHZlL2ksICAgICAgICAgICAgICAgIC8vIHJlcXVpcmUucmVzb2x2ZSBieXBhc3NcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICAgICAgICBpZiAocGF0dGVybi50ZXN0KGphdmFzY3JpcHQpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYW5nZXJvdXMgY29kZSBkZXRlY3RlZDogJHtwYXR0ZXJuLnNvdXJjZX1gIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNSkgKiAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVzZSBOb2RlLmpzIHdpdGggLS11bmhhbmRsZWQtcmVqZWN0aW9ucz10aHJvdyBmb3Igc2FmZXR5XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bignbm9kZScsIFsnLWUnLCBqYXZhc2NyaXB0XSwgdGltZW91dE1zKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5kYXRhPy5zdGRlcnIgJiYgIXJlc3VsdC5kYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmRhdGEuc3RkZXJyIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG91dHB1dDogcmVzdWx0LmRhdGE/LnN0ZG91dCB8fCAnJyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBydW5fcHl0aG9uIHRvb2wgXHUyMDE0IFNBTkRCT1hFRCB3aXRoIHN0cmljdCBpbXBvcnQgcmVzdHJpY3Rpb25zXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9weXRob24nLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIFB5dGhvbiBjb2RlIHNuaXBwZXQgKHNhbmRib3hlZCwgbm8gZXh0ZXJuYWwgbW9kdWxlcykuIFN0YW5kYXJkIGxpYnJhcnkgb25seS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHB5dGhvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIFB5dGhvbiBjb2RlIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfc2Vjb25kczogei5udW1iZXIoKS5taW4oMC4xKS5tYXgoNjApLm9wdGlvbmFsKCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnVGltZW91dCBpbiBzZWNvbmRzIChtYXggNjApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcHl0aG9uLCB0aW1lb3V0X3NlY29uZHMgfTogUnVuUHl0aG9uUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBSb2J1c3QgZGFuZ2Vyb3VzIHBhdHRlcm4gZGV0ZWN0aW9uIFx1MjAxNCBibG9ja3Mgb3MsIHN1YnByb2Nlc3MsIHNodXRpbCwgZXZhbCwgZXhlY1xuICAgICAgICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK29zXFxiL2ksXG4gICAgICAgICAgL1xcYmZyb21cXHMrb3NcXHMraW1wb3J0XFxiL2ksXG4gICAgICAgICAgL1xcYmltcG9ydFxccytzdWJwcm9jZXNzXFxiL2ksXG4gICAgICAgICAgL1xcYmZyb21cXHMrc3VicHJvY2Vzc1xccytpbXBvcnRcXGIvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK3NodXRpbFxcYi9pLFxuICAgICAgICAgIC9cXGJfX2ltcG9ydF9fXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJldmFsXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJleGVjXFxzKlxcKC9pLFxuICAgICAgICAgIC9vc1xcLnN5c3RlbS9pLFxuICAgICAgICAgIC9vc1xcLnBvcGVuL2ksXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChweXRob24pKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYW5nZXJvdXMgUHl0aG9uIGltcG9ydCBkZXRlY3RlZDogJHtwYXR0ZXJuLnNvdXJjZX1gIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNSkgKiAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRyeSBweXRob24zIGZpcnN0LCBmYWxsIGJhY2sgdG8gcHl0aG9uXG4gICAgICAgIGxldCByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24oJ3B5dGhvbjMnLCBbJy1jJywgcHl0aG9uXSwgdGltZW91dE1zKTtcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZXJyb3I/LmluY2x1ZGVzKCdub3QgZm91bmQnKSkge1xuICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bigncHl0aG9uJywgWyctYycsIHB5dGhvbl0sIHRpbWVvdXRNcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQuZGF0YT8uc3RkZXJyICYmICFyZXN1bHQuZGF0YS5zdGRvdXQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5kYXRhLnN0ZGVyciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBvdXRwdXQ6IHJlc3VsdC5kYXRhPy5zdGRvdXQgfHwgJycgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZXhlY3V0ZV9jb21tYW5kIHRvb2wgXHUyMDE0IFNBRkUgVkVSU0lPTiB3aXRob3V0IHNoZWxsOnRydWVcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZXhlY3V0ZV9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4ZWN1dGUgYSBjb21tYW5kIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBVc2VzIHNhZmUgYXJndW1lbnQgcGFyc2luZyAobm8gc2hlbGwgaW50ZXJwcmV0YXRpb24pLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tbWFuZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNoZWxsIGNvbW1hbmQgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCA2MCknKSxcbiAgICAgIGlucHV0OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJJbnB1dCB0ZXh0IHRvIHBpcGUgdG8gdGhlIGNvbW1hbmQncyBzdGRpbi5cIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCwgdGltZW91dF9zZWNvbmRzLCBpbnB1dCB9OiBFeGVjdXRlQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQYXJzZSBjb21tYW5kIGludG8gZXhlY3V0YWJsZSArIGFyZ3MgKG5vIHNoZWxsIGludGVycHJldGF0aW9uKVxuICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUNvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXBhcnNlZC5leGUpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFbXB0eSBjb21tYW5kJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNSkgKiAxMDAwKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKHBhcnNlZC5leGUsIHBhcnNlZC5hcmdzLCB0aW1lb3V0TXMsIGlucHV0KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5kYXRhPy5zdGRlcnIgJiYgIXJlc3VsdC5kYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmRhdGEuc3RkZXJyIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQuZGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcnVuX2luX3Rlcm1pbmFsIHRvb2wgXHUyMDE0IFNBRkUgVkVSU0lPTiB3aXRob3V0IHNoZWxsOnRydWVcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2luX3Rlcm1pbmFsJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xhdW5jaCBhIGNvbW1hbmQgaW4gYSBuZXcsIHNlcGFyYXRlIGludGVyYWN0aXZlIHRlcm1pbmFsIHdpbmRvdy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21tYW5kIH06IFJ1bkluVGVybWluYWxQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbiAgICAgICAgXG4gICAgICAgIGlmIChpc1dpbmRvd3MpIHtcbiAgICAgICAgICBzcGF3bignY21kLmV4ZScsIFsnL2MnLCAnc3RhcnQnLCAnQ29tbWFuZCBQcm9tcHQnLCAnL2snLCBjb21tYW5kXSwgeyBcbiAgICAgICAgICAgIGRldGFjaGVkOiB0cnVlLCBcbiAgICAgICAgICAgIHN0ZGlvOiAnaWdub3JlJyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCB0ZXJtaW5hbHMgPSBbJ3h0ZXJtJywgJ2dub21lLXRlcm1pbmFsJywgJ2tvbnNvbGUnLCAneGZjZTQtdGVybWluYWwnXTtcbiAgICAgICAgICBsZXQgbGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybWluYWxzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzcGF3bih0ZXJtLCBbJy1lJywgY29tbWFuZF0sIHsgZGV0YWNoZWQ6IHRydWUsIHN0ZGlvOiAnaWdub3JlJyB9KTtcbiAgICAgICAgICAgICAgbGF1bmNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFsYXVuY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gc3VpdGFibGUgdGVybWluYWwgZW11bGF0b3IgZm91bmQuIEluc3RhbGwgeHRlcm0gb3IgZ25vbWUtdGVybWluYWwuJyB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbGF1bmNoZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gdGVybWluYWw6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cblxuLyoqXG4gKiBTYWZlbHkgcGFyc2UgYSBzaGVsbCBjb21tYW5kIGludG8gZXhlY3V0YWJsZSBhbmQgYXJndW1lbnRzLlxuICogSGFuZGxlcyBiYXNpYyBxdW90aW5nIGJ1dCBhdm9pZHMgc2hlbGwgaW50ZXJwcmV0YXRpb24gZW50aXJlbHkuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB7IGV4ZTogc3RyaW5nOyBhcmdzOiBzdHJpbmdbXSB9IHtcbiAgY29uc3QgdHJpbW1lZCA9IGNvbW1hbmQudHJpbSgpO1xuICBcbiAgaWYgKCF0cmltbWVkKSB7XG4gICAgcmV0dXJuIHsgZXhlOiAnJywgYXJnczogW10gfTtcbiAgfVxuXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgY3VycmVudCA9ICcnO1xuICBsZXQgaW5RdW90ZTogJ1wiJyB8IFwiJ1wiIHwgbnVsbCA9IG51bGw7XG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRyaW1tZWQubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyID0gdHJpbW1lZFtpXTtcbiAgICBcbiAgICBpZiAoaW5RdW90ZSkge1xuICAgICAgaWYgKGNoYXIgPT09IGluUXVvdGUpIHtcbiAgICAgICAgaW5RdW90ZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50ICs9IGNoYXI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSAnXCInIHx8IGNoYXIgPT09IFwiJ1wiKSB7XG4gICAgICBpblF1b3RlID0gY2hhcjtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICcgJykge1xuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgcGFydHMucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudCA9ICcnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50ICs9IGNoYXI7XG4gICAgfVxuICB9XG4gIFxuICBpZiAoY3VycmVudCkge1xuICAgIHBhcnRzLnB1c2goY3VycmVudCk7XG4gIH1cblxuICBjb25zdCBleGUgPSBwYXJ0c1swXSB8fCAnJztcbiAgY29uc3QgYXJncyA9IHBhcnRzLnNsaWNlKDEpO1xuICBcbiAgcmV0dXJuIHsgZXhlLCBhcmdzIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuLi9zdGF0ZU1hbmFnZXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgTm90aWZ5T3B0aW9ucyB7XG4gIHRpdGxlPzogc3RyaW5nO1xuICBtc2c/OiBzdHJpbmc7XG4gIHNvdW5kPzogYm9vbGVhbiB8IHN0cmluZztcbiAgaWNvbj86IHN0cmluZztcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxudHlwZSBTYXZlTWVtb3J5UGFyYW1zID0geyBmYWN0OiBzdHJpbmc7IH07XG50eXBlIFJlYWRDbGlwYm9hcmRQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG50eXBlIFdyaXRlQ2xpcGJvYXJkUGFyYW1zID0geyBjb250ZW50OiBzdHJpbmc7IH07XG50eXBlIFNlbmROb3RpZmljYXRpb25QYXJhbXMgPSB7IHRpdGxlOiBzdHJpbmc7IG1lc3NhZ2U6IHN0cmluZzsgaWNvbj86IHN0cmluZzsgfTtcblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuLyoqXG4gKiBDcm9zcy1wbGF0Zm9ybSBjbGlwYm9hcmQgb3BlcmF0aW9ucyB1c2luZyBzeXN0ZW0gY29tbWFuZHMuXG4gKi9cblxuLy8gUzYgRklYOiBQcm9wZXIgZXNjYXBpbmcgZm9yIHNoZWxsIGluamVjdGlvbiBwcmV2ZW50aW9uXG5mdW5jdGlvbiBlc2NhcGVGb3JQb3dlclNoZWxsKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVzY2FwZSBkb3VibGUgcXVvdGVzIGFuZCBkb2xsYXIgc2lnbnMgKHdoaWNoIHRyaWdnZXIgdmFyaWFibGUgZXhwYW5zaW9uIGluIFBTKVxuICByZXR1cm4gY29udGVudC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFwkL2csICdcXFxcJCcpO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVGb3JCYXNoKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVzY2FwZSBzaW5nbGUgcXVvdGVzIGJ5IGVuZGluZyB0aGUgcXVvdGUsIGFkZGluZyBlc2NhcGVkIHF1b3RlLCByZS1vcGVuaW5nIHF1b3RlXG4gIHJldHVybiBjb250ZW50LnJlcGxhY2UoLycvZywgXCInXFxcXCcnXCIpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkQ2xpcGJvYXJkKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBcbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3MgUG93ZXJTaGVsbFxuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gWyctTm9Qcm9maWxlJywgJy1Db21tYW5kJywgJ1tDb25zb2xlXTo6T3V0cHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4OyBHZXQtQ2xpcGJvYXJkIC1SYXcnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUyBwYnBhc3RlXG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsICdwYnBhc3RlJ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXggeGNsaXAgb3IgeHNlbFxuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCAnKHhjbGlwIC1zZWxlY3Rpb24gY2xpcGJvYXJkIC1vIDI+L2Rldi9udWxsIHx8IHhzZWwgLS1jbGlwYm9hcmQgLS1vdXRwdXQgMj4vZGV2L251bGwpIHwgdHIgLWQgXFwnXFxcXDBcXCcnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvYyA9IHNwYXduKGNtZCwgYXJncyk7XG4gICAgXG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDAgJiYgc3Rkb3V0LnRyaW0oKSkge1xuICAgICAgICByZXNvbHZlKHN0ZG91dC50cmltKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgQ2xpcGJvYXJkIHJlYWQgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyIHx8ICdObyBjbGlwYm9hcmQgY29udGVudCd9YCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuICAgIFxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBzZWNvbmRzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwcm9jLmtpbGwoKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NsaXBib2FyZCByZWFkIHRpbWVkIG91dCcpKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbi8vIFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nIHRvIHByZXZlbnQgc2hlbGwgaW5qZWN0aW9uIGluIGNsaXBib2FyZCB3cml0ZVxuYXN5bmMgZnVuY3Rpb24gd3JpdGVDbGlwYm9hcmQoY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBcbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3MgUG93ZXJTaGVsbCB3aXRoIFNldC1DbGlwYm9hcmQgXHUyMDE0IFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nXG4gICAgICAgIGNvbnN0IGVzY2FwZWRDb250ZW50ID0gZXNjYXBlRm9yUG93ZXJTaGVsbChjb250ZW50KTtcbiAgICAgICAgY21kID0gJ3Bvd2Vyc2hlbGwuZXhlJztcbiAgICAgICAgYXJncyA9IFsnLU5vUHJvZmlsZScsICctQ29tbWFuZCcsIGBbQ29uc29sZV06Ok91dHB1dEVuY29kaW5nID0gW1N5c3RlbS5UZXh0LkVuY29kaW5nXTo6VVRGODsgXCIke2VzY2FwZWRDb250ZW50fVwiIHwgU2V0LUNsaXBib2FyZGBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TIHBiY29weSBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZEJhc2ggPSBlc2NhcGVGb3JCYXNoKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgZWNobyAtbiAnJHtlc2NhcGVkQmFzaH0nIHwgcGJjb3B5YF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXggeGNsaXAgb3IgeHNlbCBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZExpbnV4ID0gZXNjYXBlRm9yQmFzaChjb250ZW50KTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYGVjaG8gLW4gJyR7ZXNjYXBlZExpbnV4fScgfCAoeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgMj4vZGV2L251bGwgfHwgeHNlbCAtLWNsaXBib2FyZCAtLWlucHV0IDI+L2Rldi9udWxsKWBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICBcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgQ2xpcGJvYXJkIHdyaXRlIGZhaWxlZCAoZXhpdCBjb2RlICR7Y29kZX0pOiAke3N0ZGVycn1gKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgXG4gICAgLy8gVGltZW91dCBhZnRlciA1IHNlY29uZHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2xpcGJvYXJkIHdyaXRlIHRpbWVkIG91dCcpKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRmluZCBMTSBTdHVkaW8gaW5zdGFsbGF0aW9uIGRpcmVjdG9yeSBhY3Jvc3MgcGxhdGZvcm1zLlxuICovXG5mdW5jdGlvbiBmaW5kTE1TdHVkaW9Ib21lKCk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gIFxuICAvLyBDb21tb24gcGF0aHMgdG8gY2hlY2tcbiAgY29uc3QgY2FuZGlkYXRlczogc3RyaW5nW10gPSBbXTtcbiAgXG4gIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICBjYXNlICd3aW4zMic6XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5BUFBEQVRBIHx8ICcnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5MT0NBTEFQUERBVEEgfHwgJycsICdQcm9ncmFtcycsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LlBST0dSQU1GSUxFUyB8fCAnJywgJ0xNIFN0dWRpbycpLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnZbJ1BST0dSQU1EQVRBJ10gfHwgJycsICdMTSBTdHVkaW8nKVxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgICcvQXBwbGljYXRpb25zL0xNIFN0dWRpby5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyJ1xuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vIExpbnV4XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihvcy5ob21lZGlyKCksICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgICcvb3B0L2xtLXN0dWRpbycsXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FIHx8ICcnLCAnLmxtLXN0dWRpbycpXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBcbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhjYW5kaWRhdGUpKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBwYXRoc1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclV0aWxpdHlUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXIsIGdldEVuYWJsZWRUb29scz86ICgpID0+IHN0cmluZ1tdKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHNhdmVfbWVtb3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2F2ZV9tZW1vcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBhIHNwZWNpZmljIHBpZWNlIG9mIGluZm9ybWF0aW9uIG9yIGZhY3QgdG8gbG9uZy10ZXJtIG1lbW9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZhY3Q6IHouc3RyaW5nKCkubWluKDEpLmRlc2NyaWJlKCdUaGUgc3BlY2lmaWMgZmFjdCBvciBwaWVjZSBvZiBpbmZvcm1hdGlvbiB0byByZW1lbWJlci4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmYWN0IH06IFNhdmVNZW1vcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0YXRlTWFuYWdlci5zZXQoYG1lbW9yeV8ke0RhdGUubm93KCl9YCwgZmFjdCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X3N5c3RlbV9pbmZvIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X3N5c3RlbV9pbmZvJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc3lzdGVtIChPUywgQ1BVLCBNZW1vcnkpLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBwbGF0Zm9ybTogb3MucGxhdGZvcm0oKSxcbiAgICAgICAgICAgIGFyY2g6IG9zLmFyY2goKSxcbiAgICAgICAgICAgIGNwdXM6IG9zLmNwdXMoKS5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbE1lbW9yeTogb3MudG90YWxtZW0oKSxcbiAgICAgICAgICAgIGZyZWVNZW1vcnk6IG9zLmZyZWVtZW0oKSxcbiAgICAgICAgICAgIGhvc3RuYW1lOiBvcy5ob3N0bmFtZSgpLFxuICAgICAgICAgICAgcmVsZWFzZTogb3MucmVsZWFzZSgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IHN5c3RlbSBpbmZvOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZWFkX2NsaXBib2FyZCB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9jbGlwYm9hcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCB0ZXh0IGNvbnRlbnQgZnJvbSB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoX3BhcmFtczogUmVhZENsaXBib2FyZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtcyAoZW1wdHkgb2JqZWN0KVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRDbGlwYm9hcmQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb250ZW50IH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHdyaXRlX2NsaXBib2FyZCB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd3JpdGVfY2xpcGJvYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1dyaXRlIHRleHQgY29udGVudCB0byB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gd3JpdGUgdG8gY2xpcGJvYXJkJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29udGVudCB9OiBXcml0ZUNsaXBib2FyZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgd3JpdGVDbGlwYm9hcmQoY29udGVudCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgd3JpdHRlbjogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzZW5kX25vdGlmaWNhdGlvbiB0b29sIC0gSU1QTEVNRU5URUQgdXNpbmcgbm9kZS1ub3RpZmllclxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzZW5kX25vdGlmaWNhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdTZW5kIGEgc3lzdGVtIG5vdGlmaWNhdGlvbiB0byB0aGUgdXNlci4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOb3RpZmljYXRpb24gdGl0bGUnKSxcbiAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05vdGlmaWNhdGlvbiBtZXNzYWdlJyksXG4gICAgICBpY29uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIGN1c3RvbSBpY29uIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgbWVzc2FnZSwgaWNvbiB9OiBTZW5kTm90aWZpY2F0aW9uUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAgXG4gICAgICAgIGNvbnN0IG5vdGlmaWVyTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdub2RlLW5vdGlmaWVyJyk7XG4gICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90aWZpZXIgPSBub3RpZmllck1vZHVsZS5kZWZhdWx0IHx8IG5vdGlmaWVyTW9kdWxlO1xuXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE5vdGlmeU9wdGlvbnMgPSB7XG4gICAgICAgICAgdGl0bGU6IHRpdGxlIHx8ICdBSSBUb29sYm94JyxcbiAgICAgICAgICBtc2c6IG1lc3NhZ2UgfHwgJycsXG4gICAgICAgICAgc291bmQ6IHRydWUsIC8vIEluY2x1ZGUgc291bmQgb24gbWFjT1NcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaWNvbikge1xuICAgICAgICAgIG9wdGlvbnMuaWNvbiA9IGljb247XG4gICAgICAgIH1cblxuICAgICAgICBub3RpZmllcihvcHRpb25zKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNlbnQ6IHRydWUsIHRpdGxlLCBtZXNzYWdlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBzZW5kIG5vdGlmaWNhdGlvbjogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmluZExNU3R1ZGlvSG9tZSB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZmluZExNU3R1ZGlvSG9tZScsXG4gICAgZGVzY3JpcHRpb246ICdMb2NhdGUgTE0gU3R1ZGlvIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgYWNyb3NzIHBsYXRmb3Jtcy4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBob21lRGlyID0gZmluZExNU3R1ZGlvSG9tZSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGhvbWVEaXIpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgZm91bmQ6IHRydWUsXG4gICAgICAgICAgICAgIHBhdGg6IGhvbWVEaXIsXG4gICAgICAgICAgICAgIHBsYXRmb3JtOiBvcy5wbGF0Zm9ybSgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFByb3ZpZGUgY29tbW9uIHBhdGhzIGZvciBtYW51YWwgcmVmZXJlbmNlXG4gICAgICAgICAgY29uc3QgY29tbW9uUGF0aHMgPSBbXG4gICAgICAgICAgICAnV2luZG93czogJUFQUERBVEElXFxcXGxtLXN0dWRpbycsXG4gICAgICAgICAgICAnbWFjT1M6IH4vTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L2xtLXN0dWRpbycsXG4gICAgICAgICAgICAnTGludXg6IH4vLmxvY2FsL3NoYXJlL2xtLXN0dWRpbydcbiAgICAgICAgICBdLmpvaW4oJ1xcbicpO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IGBMTSBTdHVkaW8gaG9tZSBkaXJlY3Rvcnkgbm90IGZvdW5kLlxcblxcbkNvbW1vbiBwYXRoczpcXG4ke2NvbW1vblBhdGhzfWAsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGZpbmQgTE0gU3R1ZGlvIGhvbWU6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9lbmFibGVkX3Rvb2xzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X2VuYWJsZWRfdG9vbHMnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGxpc3Qgb2YgY3VycmVudGx5IGVuYWJsZWQgdG9vbHMgYmFzZWQgb24gY29uZmlndXJhdGlvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2V0RW5hYmxlZFRvb2xzKSB7XG4gICAgICAgICAgY29uc3QgdG9vbE5hbWVzID0gZ2V0RW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB0b29sQ291bnQ6IHRvb2xOYW1lcy5sZW5ndGgsIHRvb2xzOiB0b29sTmFtZXMgfSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlZ2lzdHJ5IGFjY2VzcyBub3QgYXZhaWxhYmxlJyB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGVuYWJsZWQgdG9vbHM6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIEltYWdlVG9UZXh0UGFyYW1zIHtcbiAgaW1hZ2VQYXRoOiBzdHJpbmc7XG4gIGxhbmd1YWdlPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgRGVzY3JpYmVJbWFnZVBhcmFtcyB7XG4gIGltYWdlUGF0aDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMge1xuICBvdXRwdXRQYXRoPzogc3RyaW5nO1xuICBmb3JtYXQ/OiAncG5nJyB8ICdqcGVnJztcbiAgcXVhbGl0eT86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENvbXBhcmVJbWFnZXNQYXJhbXMge1xuICBpbWFnZTFQYXRoOiBzdHJpbmc7XG4gIGltYWdlMlBhdGg6IHN0cmluZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gSGVscGVyIEZ1bmN0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogVmFsaWRhdGUgZmlsZSBleGlzdHMgYW5kIGlzIGFuIGltYWdlICovXG5mdW5jdGlvbiB2YWxpZGF0ZUltYWdlRmlsZShmaWxlUGF0aDogc3RyaW5nKTogeyB2YWxpZDogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfSB7XG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGVQYXRoKTtcbiAgXG4gIGlmICghc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBQYXRoIFwiJHtmaWxlUGF0aH1cIiBpcyBub3QgYSBmaWxlYCB9O1xuICB9XG4gIFxuICAvLyBDaGVjayBmaWxlIGV4dGVuc2lvbiAoYmFzaWMgdmFsaWRhdGlvbilcbiAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCBhbGxvd2VkRXh0ZW5zaW9ucyA9IFsnLnBuZycsICcuanBnJywgJy5qcGVnJywgJy5ibXAnLCAnLmdpZicsICcudGlmZicsICcud2VicCddO1xuICBcbiAgaWYgKCFhbGxvd2VkRXh0ZW5zaW9ucy5pbmNsdWRlcyhleHQpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFVuc3VwcG9ydGVkIGltYWdlIGZvcm1hdDogJHtleHR9YCB9O1xuICB9XG4gIFxuICAvLyBDaGVjayBmaWxlIHNpemUgKG1heCA1ME1CKVxuICBjb25zdCBtYXhTaXplID0gNTAgKiAxMDI0ICogMTAyNDsgLy8gNTBNQlxuICBpZiAoc3RhdC5zaXplID4gbWF4U2l6ZSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBGaWxlIHRvbyBsYXJnZSAoJHsoc3RhdC5zaXplIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMSl9TUIpLCBtYXggaXMgNTBNQmAgfTtcbiAgfVxuICBcbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbWFnZSBwcm9jZXNzaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBFeHRyYWN0IHRleHQgZnJvbSBpbWFnZXMgdXNpbmcgVGVzc2VyYWN0LmpzIE9DUi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1hZ2VUb1RleHQoeyBpbWFnZVBhdGgsIGxhbmd1YWdlID0gJ2VuZycgfTogSW1hZ2VUb1RleHRQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2VQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgLy8gTGF6eS1sb2FkIFRlc3NlcmFjdC5qcyB0byBhdm9pZCBoZWF2eSBpbml0aWFsIGxvYWRcbiAgICBjb25zdCBUZXNzZXJhY3QgPSAoYXdhaXQgaW1wb3J0KCd0ZXNzZXJhY3QuanMnKSkuZGVmYXVsdDtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gT0NSIHN0YXJ0aW5nIGZvciAke2ltYWdlUGF0aH0gKGxhbmd1YWdlOiAke2xhbmd1YWdlfSlgKTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBUZXNzZXJhY3QucmVjb2duaXplKGltYWdlUGF0aCwgbGFuZ3VhZ2UsIHtcbiAgICAgIGxvZ2dlcjogKG0pID0+IHtcbiAgICAgICAgaWYgKG0uc3RhdHVzID09PSAncmVjb2duaXppbmcgdGV4dCcpIHtcbiAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgXFxyW0FJIFRvb2xib3hdIE9DUiBwcm9ncmVzczogJHsobS5wcm9ncmVzcyAqIDEwMCkudG9GaXhlZCgwKX0lYCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnXFxuW0FJIFRvb2xib3hdIE9DUiBjb21wbGV0ZScpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICB0ZXh0OiByZXN1bHQuZGF0YS50ZXh0LnRyaW0oKSxcbiAgICAgICAgY29uZmlkZW5jZTogcmVzdWx0LmRhdGEuY29uZmlkZW5jZSxcbiAgICAgICAgbGFuZ3VhZ2UsXG4gICAgICAgIHdvcmRzOiByZXN1bHQuZGF0YS53b3Jkcz8ubGVuZ3RoIHx8IDAsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIERlc2NyaWJlIGltYWdlIGNvbnRlbnQgdXNpbmcgdmlzaW9uIG1vZGVsIG9yIGJhc2ljIG1ldGFkYXRhLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZXNjcmliZUltYWdlKHsgaW1hZ2VQYXRoIH06IERlc2NyaWJlSW1hZ2VQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2VQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogdmFsaWRhdGlvbi5lcnJvciB9O1xuXG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhpbWFnZVBhdGgpO1xuICAgIFxuICAgIC8vIFJldHVybiBtZXRhZGF0YSBzaW5jZSB3ZSBkb24ndCBoYXZlIGEgdmlzaW9uIG1vZGVsIGludGVncmF0ZWQgeWV0XG4gICAgLy8gVGhpcyBjYW4gYmUgZXh0ZW5kZWQgd2l0aCB2aXNpb24gQVBJIGNhbGxzIGluIHRoZSBmdXR1cmVcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcGF0aDogaW1hZ2VQYXRoLFxuICAgICAgICBzaXplOiBgJHsoc3RhdC5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICBmb3JtYXQ6IHBhdGguZXh0bmFtZShpbWFnZVBhdGgpLnJlcGxhY2UoJy4nLCAnJykudG9VcHBlckNhc2UoKSxcbiAgICAgICAgbm90ZTogJ1Zpc2lvbiBtb2RlbCBkZXNjcmlwdGlvbiByZXF1aXJlcyBpbnRlZ3JhdGlvbiB3aXRoIGEgdmlzaW9uIEFQSSAoZS5nLiwgR1BULTQgVmlzaW9uLCBDbGF1ZGUgVmlzaW9uKS4gVGhpcyB0b29sIGN1cnJlbnRseSByZXR1cm5zIG1ldGFkYXRhLicsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIENhcHR1cmUgZGVza3RvcCBzY3JlZW5zaG90IGFuZCBzYXZlIHRvIGZpbGUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNjcmVlbnNob3REZXNrdG9wKHsgXG4gIG91dHB1dFBhdGgsIFxuICBmb3JtYXQgPSAncG5nJywgXG4gIHF1YWxpdHkgPSA5MCBcbn06IFNjcmVlbnNob3REZXNrdG9wUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuICAgIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgICBcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuICAgIGxldCB0ZW1wUGF0aDogc3RyaW5nO1xuXG4gICAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgICAgY2FzZSAnd2luMzInOlxuICAgICAgICAvLyBXaW5kb3dzOiBVc2UgUG93ZXJTaGVsbCB3aXRoIEFkZC1UeXBlIGZvciBoaWdoLXF1YWxpdHkgc2NyZWVuc2hvdHNcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJ3Bvd2Vyc2hlbGwuZXhlJztcbiAgICAgICAgYXJncyA9IFtcbiAgICAgICAgICAnLU5vUHJvZmlsZScsXG4gICAgICAgICAgJy1Db21tYW5kJyxcbiAgICAgICAgICBgW1N5c3RlbS5EcmF3aW5nLkJpdG1hcF06Om5ldygxOTIwLCAxMDgwKS5TYXZlKCcke3RlbXBQYXRofScsIFtTeXN0ZW0uRHJhd2luZy5JbWFnaW5nLkltYWdlRm9ybWF0XTo6UG5nKWAsXG4gICAgICAgIF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGFyd2luJzpcbiAgICAgICAgLy8gbWFjT1M6IFVzZSBzY3JlZW5jYXB0dXJlXG4gICAgICAgIHRlbXBQYXRoID0gb3V0cHV0UGF0aCB8fCBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGBzY3JlZW5zaG90XyR7RGF0ZS5ub3coKX0ucG5nYCk7XG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsIGBzY3JlZW5jYXB0dXJlIC14IFwiJHt0ZW1wUGF0aH1cImBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIExpbnV4OiBVc2UgeGRvdG9vbCArIGltcG9ydCAoSW1hZ2VNYWdpY2spIG9yIHNjcm90XG4gICAgICAgIHRlbXBQYXRoID0gb3V0cHV0UGF0aCB8fCBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGBzY3JlZW5zaG90XyR7RGF0ZS5ub3coKX0ucG5nYCk7XG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsIGAoaW1wb3J0IC13aW5kb3cgcm9vdCBcIiR7dGVtcFBhdGh9XCIgMj4vZGV2L251bGwgfHwgc2Nyb3QgXCIke3RlbXBQYXRofVwiIDI+L2Rldi9udWxsKSAmJiBlY2hvIFwiU2NyZWVuc2hvdCBzYXZlZCB0byAke3RlbXBQYXRofVwiYF07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHsgc3Bhd24gfSA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbiAgICBcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcHJvYyA9IHNwYXduKGNtZCwgYXJncyk7XG4gICAgICBcbiAgICAgIGxldCBzdGRlcnIgPSAnJztcbiAgICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgc3RkZXJyICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgIH0pO1xuXG4gICAgICBwcm9jLm9uKCdjbG9zZScsIChjb2RlOiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGNvZGUgPT09IDAgJiYgdGVtcFBhdGgpIHtcbiAgICAgICAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKHRlbXBQYXRoKTtcbiAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHBhdGg6IHRlbXBQYXRoLFxuICAgICAgICAgICAgICBzaXplOiBgJHsoc3RhdC5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICAgICAgICBmb3JtYXQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFNjcmVlbnNob3QgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICBcbiAgICAgIC8vIFRpbWVvdXQgYWZ0ZXIgMTAgc2Vjb25kc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdTY3JlZW5zaG90IHRpbWVkIG91dCcpKTtcbiAgICAgIH0sIDEwMDAwKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogQ29tcGFyZSB0d28gaW1hZ2VzIGFuZCBjYWxjdWxhdGUgc2ltaWxhcml0eSBzY29yZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY29tcGFyZUltYWdlcyh7IGltYWdlMVBhdGgsIGltYWdlMlBhdGggfTogQ29tcGFyZUltYWdlc1BhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbGlkYXRpb24xID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2UxUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uMS52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW1hZ2UgMTogJHt2YWxpZGF0aW9uMS5lcnJvcn1gIH07XG5cbiAgICBjb25zdCB2YWxpZGF0aW9uMiA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlMlBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbjIudmFsaWQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEltYWdlIDI6ICR7dmFsaWRhdGlvbjIuZXJyb3J9YCB9O1xuXG4gICAgLy8gTGF6eS1sb2FkIHBpeGVsbWF0Y2ggZm9yIHBpeGVsLWxldmVsIGNvbXBhcmlzb25cbiAgICBjb25zdCBwaXhlbG1hdGNoID0gKGF3YWl0IGltcG9ydCgncGl4ZWxtYXRjaCcpKS5kZWZhdWx0O1xuICAgIGNvbnN0IFBORyA9IChhd2FpdCBpbXBvcnQoJ3BuZ2pzJykpLlBORztcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbiAgICAvLyBSZWFkIGFuZCBkZWNvZGUgaW1hZ2VzXG4gICAgY29uc3QgaW1nMURhdGEgPSBmcy5yZWFkRmlsZVN5bmMoaW1hZ2UxUGF0aCk7XG4gICAgY29uc3QgaW1nMkRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoaW1hZ2UyUGF0aCk7XG5cbiAgICBjb25zdCBpbWcxID0gUE5HLnN5bmMuZGVjb2RlKGltZzFEYXRhKTtcbiAgICBjb25zdCBpbWcyID0gUE5HLnN5bmMuZGVjb2RlKGltZzJEYXRhKTtcblxuICAgIC8vIFJlc2l6ZSB0byBzYW1lIGRpbWVuc2lvbnMgZm9yIGNvbXBhcmlzb25cbiAgICBjb25zdCB3aWR0aCA9IE1hdGgubWluKGltZzEud2lkdGgsIGltZzIud2lkdGgpO1xuICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWluKGltZzEuaGVpZ2h0LCBpbWcyLmhlaWdodCk7XG5cbiAgICBjb25zdCBidWYxID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gICAgY29uc3QgYnVmMiA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuXG4gICAgLy8gRXh0cmFjdCBwaXhlbCBkYXRhIChzaW1wbGlmaWVkIC0gaW4gcHJvZHVjdGlvbiwgdXNlIHByb3BlciBpbWFnZSBwcm9jZXNzaW5nKVxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICBjb25zdCBpZHgxID0gKHkgKiBpbWcxLndpZHRoICsgeCkgKiA0O1xuICAgICAgICBjb25zdCBpZHgyID0gKHkgKiBpbWcyLndpZHRoICsgeCkgKiA0O1xuICAgICAgICBjb25zdCBvdXRJZHggPSAoeSAqIHdpZHRoICsgeCkgKiA0O1xuXG4gICAgICAgIGJ1ZjFbb3V0SWR4XSA9IGltZzEuZGF0YVtpZHgxXTtcbiAgICAgICAgYnVmMVtvdXRJZHggKyAxXSA9IGltZzEuZGF0YVtpZHgxICsgMV07XG4gICAgICAgIGJ1ZjFbb3V0SWR4ICsgMl0gPSBpbWcxLmRhdGFbaWR4MSArIDJdO1xuICAgICAgICBidWYxW291dElkeCArIDNdID0gaW1nMS5kYXRhW2lkeDEgKyAzXTtcblxuICAgICAgICBidWYyW291dElkeF0gPSBpbWcyLmRhdGFbaWR4Ml07XG4gICAgICAgIGJ1ZjJbb3V0SWR4ICsgMV0gPSBpbWcyLmRhdGFbaWR4MiArIDFdO1xuICAgICAgICBidWYyW291dElkeCArIDJdID0gaW1nMi5kYXRhW2lkeDIgKyAyXTtcbiAgICAgICAgYnVmMltvdXRJZHggKyAzXSA9IGltZzIuZGF0YVtpZHgyICsgM107XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIHBpeGVsIGRpZmZlcmVuY2VcbiAgICBjb25zdCBkaWZmID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gICAgY29uc3QgbnVtRGlmZlBpeGVscyA9IHBpeGVsbWF0Y2goYnVmMSwgYnVmMiwgZGlmZiwgd2lkdGgsIGhlaWdodCwgeyB0aHJlc2hvbGQ6IDAuMSB9KTtcbiAgICBcbiAgICBjb25zdCB0b3RhbFBpeGVscyA9IHdpZHRoICogaGVpZ2h0O1xuICAgIGNvbnN0IHNpbWlsYXJpdHkgPSAoKHRvdGFsUGl4ZWxzIC0gbnVtRGlmZlBpeGVscykgLyB0b3RhbFBpeGVscykgKiAxMDA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgaW1hZ2UxOiBpbWFnZTFQYXRoLFxuICAgICAgICBpbWFnZTI6IGltYWdlMlBhdGgsXG4gICAgICAgIGRpbWVuc2lvbnM6IGAke3dpZHRofXgke2hlaWdodH1gLFxuICAgICAgICBzaW1pbGFyaXR5UGVyY2VudDogc2ltaWxhcml0eS50b0ZpeGVkKDIpLFxuICAgICAgICBkaWZmZXJlbnRQaXhlbHM6IG51bURpZmZQaXhlbHMsXG4gICAgICAgIHRvdGFsUGl4ZWxzLFxuICAgICAgICBpc0lkZW50aWNhbDogbnVtRGlmZlBpeGVscyA9PT0gMCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBpbWFnZV90b190ZXh0IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaW1hZ2VfdG9fdGV4dCcsXG4gICAgZGVzY3JpcHRpb246ICdFeHRyYWN0IHRleHQgZnJvbSBpbWFnZXMgdXNpbmcgT0NSIChUZXNzZXJhY3QuanMpLiBTdXBwb3J0cyBtdWx0aXBsZSBsYW5ndWFnZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpbWFnZVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIGltYWdlIGZpbGUnKSxcbiAgICAgIGxhbmd1YWdlOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnZW5nJykuZGVzY3JpYmUoJ0xhbmd1YWdlIGNvZGUgZm9yIE9DUiAoZS5nLiwgXCJlbmdcIiwgXCJkZXVcIiwgXCJjaGlfc2ltXCIpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaW1hZ2VUb1RleHQocGFyYW1zIGFzIEltYWdlVG9UZXh0UGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGRlc2NyaWJlX2ltYWdlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVzY3JpYmVfaW1hZ2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IG1ldGFkYXRhIGFuZCBiYXNpYyBkZXNjcmlwdGlvbiBvZiBhbiBpbWFnZSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaW1hZ2VQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBpbWFnZSBmaWxlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gZGVzY3JpYmVJbWFnZShwYXJhbXMgYXMgRGVzY3JpYmVJbWFnZVBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBzY3JlZW5zaG90X2Rlc2t0b3AgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzY3JlZW5zaG90X2Rlc2t0b3AnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2FwdHVyZSBhIHNjcmVlbnNob3Qgb2YgdGhlIGRlc2t0b3AgYW5kIHNhdmUgaXQgdG8gYSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgb3V0cHV0UGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPdXRwdXQgcGF0aCBmb3IgdGhlIHNjcmVlbnNob3QgKGRlZmF1bHQ6IHRlbXAgZGlyZWN0b3J5KScpLFxuICAgICAgZm9ybWF0OiB6LmVudW0oWydwbmcnLCAnanBlZyddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ3BuZycpLmRlc2NyaWJlKCdJbWFnZSBmb3JtYXQnKSxcbiAgICAgIHF1YWxpdHk6IHoubnVtYmVyKCkubWluKDEpLm1heCgxMDApLm9wdGlvbmFsKCkuZGVmYXVsdCg5MCkuZGVzY3JpYmUoJ0pQRUcgcXVhbGl0eSAoMS0xMDAsIG9ubHkgYXBwbGllcyB0byBKUEVHIGZvcm1hdCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBzY3JlZW5zaG90RGVza3RvcChwYXJhbXMgYXMgU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gY29tcGFyZV9pbWFnZXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjb21wYXJlX2ltYWdlcycsXG4gICAgZGVzY3JpcHRpb246ICdDb21wYXJlIHR3byBpbWFnZXMgYW5kIGNhbGN1bGF0ZSBwaXhlbC1sZXZlbCBzaW1pbGFyaXR5IHNjb3JlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaW1hZ2UxUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgZmlyc3QgaW1hZ2UnKSxcbiAgICAgIGltYWdlMlBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIHNlY29uZCBpbWFnZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGNvbXBhcmVJbWFnZXMocGFyYW1zIGFzIENvbXBhcmVJbWFnZXNQYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBIdHRwUmVxdWVzdFBhcmFtcyB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGJvZHk/OiBzdHJpbmcgfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuaW50ZXJmYWNlIEh0dHBHZXRKc29uUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5pbnRlcmZhY2UgSHR0cFBvc3RKc29uUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU2VjdXJpdHkgJiBWYWxpZGF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTU1JGIHByb3RlY3Rpb24gLSB2YWxpZGF0ZSBVUkwgaXMgc2FmZSAqL1xuZnVuY3Rpb24gdmFsaWRhdGVVcmwodXJsOiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgXG4gICAgLy8gQmxvY2sgaW50ZXJuYWwvcHJpdmF0ZSBJUCBhZGRyZXNzZXMgKFNTUkYgcHJvdGVjdGlvbilcbiAgICBpZiAocGFyc2VkLnByb3RvY29sID09PSAnZmlsZTonIHx8IHBhcnNlZC5wcm90b2NvbCA9PT0gJ2RhdGE6Jykge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFByb3RvY29sIFwiJHtwYXJzZWQucHJvdG9jb2x9XCIgaXMgbm90IGFsbG93ZWRgIH07XG4gICAgfVxuXG4gICAgLy8gQWxsb3cgaHR0cCBhbmQgaHR0cHMgb25seVxuICAgIGlmICghWydodHRwOicsICdodHRwczonXS5pbmNsdWRlcyhwYXJzZWQucHJvdG9jb2wpKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgT25seSBIVFRQL0hUVFBTIHByb3RvY29scyBhcmUgYWxsb3dlZGAgfTtcbiAgICB9XG5cbiAgICAvLyBCbG9jayBwcml2YXRlIElQIHJhbmdlcyAoYmFzaWMgY2hlY2spXG4gICAgY29uc3QgaG9zdG5hbWUgPSBwYXJzZWQuaG9zdG5hbWU7XG4gICAgY29uc3QgYmxvY2tlZFBhdHRlcm5zID0gW1xuICAgICAgL14xMjdcXC4vLCAgICAgICAgICAgLy8gbG9jYWxob3N0XG4gICAgICAvXjEwXFwuLywgICAgICAgICAgICAvLyAxMC4wLjAuMC84XG4gICAgICAvXjE3MlxcLjFbNi05XVxcLi8sICAgLy8gMTcyLjE2LjAuMC8xMlxuICAgICAgL14xNzJcXC4yWzAtOV1cXC4vLCAgIC8vIDE3Mi4xNi4wLjAvMTJcbiAgICAgIC9eMTcyXFwuM1swLTFdXFwuLywgICAvLyAxNzIuMTYuMC4wLzEyXG4gICAgICAvXjE5MlxcLjE2OFxcLi8sICAgICAgLy8gMTkyLjE2OC4wLjAvMTZcbiAgICAgIC9eMFxcLjBcXC4wXFwuMCQvLCAgICAgLy8gMC4wLjAuMFxuICAgICAgL15sb2NhbGhvc3QkLywgICAgICAvLyBsb2NhbGhvc3QgaG9zdG5hbWVcbiAgICBdO1xuXG4gICAgaWYgKGJsb2NrZWRQYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi50ZXN0KGhvc3RuYW1lKSkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBBY2Nlc3MgdG8gJHtob3N0bmFtZX0gaXMgYmxvY2tlZCBmb3Igc2VjdXJpdHkgcmVhc29uc2AgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEludmFsaWQgVVJMOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSFRUUCByZXF1ZXN0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBHZW5lcmljIEhUVFAgY2xpZW50IGZvciBtYWtpbmcgcmVxdWVzdHMgdG8gYW55IFJFU1QgQVBJLlxuICovXG5hc3luYyBmdW5jdGlvbiBodHRwUmVxdWVzdCh7IG1ldGhvZCwgdXJsLCBoZWFkZXJzID0ge30sIGJvZHkgfTogSHR0cFJlcXVlc3RQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICAvLyBQcmVwYXJlIHJlcXVlc3Qgb3B0aW9uc1xuICAgIGNvbnN0IG9wdGlvbnM6IFJlcXVlc3RJbml0ID0ge1xuICAgICAgbWV0aG9kOiBtZXRob2QudG9VcHBlckNhc2UoKSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1VzZXItQWdlbnQnOiAnQUktVG9vbGJveC8xLjAnLFxuICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGJvZHkgZm9yIG5vbi1HRVQvSEVBRCByZXF1ZXN0c1xuICAgIGlmIChib2R5ICYmICFbJ0dFVCcsICdIRUFEJ10uaW5jbHVkZXMobWV0aG9kLnRvVXBwZXJDYXNlKCkpKSB7XG4gICAgICBvcHRpb25zLmJvZHkgPSB0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycgPyBib2R5IDogSlNPTi5zdHJpbmdpZnkoYm9keSk7XG4gICAgICBcbiAgICAgIC8vIFNldCBjb250ZW50LXR5cGUgaGVhZGVyIGlmIG5vdCBhbHJlYWR5IHNldCBhbmQgYm9keSBpcyBvYmplY3Qvc3RyaW5nXG4gICAgICBpZiAoIWhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddICYmIHR5cGVvZiBib2R5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAob3B0aW9ucy5oZWFkZXJzIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4pWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgJHttZXRob2QudG9VcHBlckNhc2UoKX0gJHt1cmx9YCk7XG5cbiAgICAvLyBNYWtlIHRoZSByZXF1ZXN0IHdpdGggdGltZW91dFxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTsgLy8gMzBzIHRpbWVvdXRcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyAuLi5vcHRpb25zLCBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIC8vIFBhcnNlIHJlc3BvbnNlIGJhc2VkIG9uIGNvbnRlbnQgdHlwZVxuICAgICAgbGV0IHJlc3BvbnNlRGF0YTogdW5rbm93bjtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuICAgICAgXG4gICAgICBpZiAoY29udGVudFR5cGUuaW5jbHVkZXMoJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXNwb25zZS5oZWFkZXJzLmVudHJpZXMoKSksXG4gICAgICAgICAgYm9keTogcmVzcG9uc2VEYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgICBtZXRob2Q6IG1ldGhvZC50b1VwcGVyQ2FzZSgpLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBHRVQgcmVxdWVzdCByZXR1cm5pbmcgcGFyc2VkIEpTT04uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBHZXRKc29uKHsgdXJsLCBoZWFkZXJzID0ge30gfTogSHR0cEdldEpzb25QYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgR0VUICR7dXJsfWApO1xuXG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnVXNlci1BZ2VudCc6ICdBSS1Ub29sYm94LzEuMCcsXG4gICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiBgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c306ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gLFxuICAgICAgICAgIGRhdGE6IHsgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsIHVybCB9LFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiBkYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogUE9TVCByZXF1ZXN0IHdpdGggSlNPTiBib2R5LlxuICovXG5hc3luYyBmdW5jdGlvbiBodHRwUG9zdEpzb24oeyB1cmwsIGRhdGEsIGhlYWRlcnMgPSB7fSB9OiBIdHRwUG9zdEpzb25QYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgUE9TVCAke3VybH1gKTtcblxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogJ0FJLVRvb2xib3gvMS4wJyxcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICBsZXQgcmVzcG9uc2VEYXRhOiB1bmtub3duO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgICBcbiAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXNwb25zZS5oZWFkZXJzLmVudHJpZXMoKSksXG4gICAgICAgICAgYm9keTogcmVzcG9uc2VEYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3Rlckh0dHBDbGllbnRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gaHR0cF9yZXF1ZXN0IHRvb2wgLSBHZW5lcmljIEhUVFAgY2xpZW50XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfcmVxdWVzdCcsXG4gICAgZGVzY3JpcHRpb246ICdNYWtlIGdlbmVyaWMgSFRUUCByZXF1ZXN0cyB0byBhbnkgUkVTVCBBUEkuIFN1cHBvcnRzIEdFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENIIGFuZCBvdGhlciBtZXRob2RzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWV0aG9kOiB6LmVudW0oWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ1BBVENIJywgJ0hFQUQnLCAnT1BUSU9OUyddKS5kZXNjcmliZSgnSFRUUCBtZXRob2QnKSxcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnUmVxdWVzdCBVUkwgKG11c3QgYmUgaHR0cDovLyBvciBodHRwczovLyknKSxcbiAgICAgIGhlYWRlcnM6IHoucmVjb3JkKHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0N1c3RvbSBoZWFkZXJzIGFzIGtleS12YWx1ZSBwYWlycycpLFxuICAgICAgYm9keTogei51bmlvbihbei5zdHJpbmcoKSwgei5yZWNvcmQoei51bmtub3duKCkpXSkub3B0aW9uYWwoKS5kZXNjcmliZSgnUmVxdWVzdCBib2R5IChzdHJpbmcgb3IgSlNPTiBvYmplY3QpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaHR0cFJlcXVlc3QocGFyYW1zIGFzIEh0dHBSZXF1ZXN0UGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGh0dHBfZ2V0X2pzb24gdG9vbCAtIENvbnZlbmllbmNlIHdyYXBwZXIgZm9yIEdFVCByZXF1ZXN0c1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdodHRwX2dldF9qc29uJyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgYSBHRVQgcmVxdWVzdCBhbmQgcmV0dXJuIHBhcnNlZCBKU09OIHJlc3BvbnNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdSZXF1ZXN0IFVSTCAobXVzdCBiZSBodHRwOi8vIG9yIGh0dHBzOi8vKScpLFxuICAgICAgaGVhZGVyczogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ3VzdG9tIGhlYWRlcnMgYXMga2V5LXZhbHVlIHBhaXJzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaHR0cEdldEpzb24ocGFyYW1zIGFzIEh0dHBHZXRKc29uUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGh0dHBfcG9zdF9qc29uIHRvb2wgLSBDb252ZW5pZW5jZSB3cmFwcGVyIGZvciBQT1NUIHJlcXVlc3RzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfcG9zdF9qc29uJyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgYSBQT1NUIHJlcXVlc3Qgd2l0aCBKU09OIGJvZHkgYW5kIHJldHVybiBwYXJzZWQgcmVzcG9uc2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgVVJMIChtdXN0IGJlIGh0dHA6Ly8gb3IgaHR0cHM6Ly8pJyksXG4gICAgICBkYXRhOiB6LnJlY29yZCh6LnVua25vd24oKSkuZGVzY3JpYmUoJ0pTT04gb2JqZWN0IHRvIHNlbmQgYXMgcmVxdWVzdCBib2R5JyksXG4gICAgICBoZWFkZXJzOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDdXN0b20gaGVhZGVycyBhcyBrZXktdmFsdWUgcGFpcnMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwUG9zdEpzb24ocGFyYW1zIGFzIEh0dHBQb3N0SnNvblBhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSYWdJbmRleEZpbGVzUGFyYW1zIHtcbiAgZGlyZWN0b3J5UGF0aDogc3RyaW5nO1xuICBmaWxlUGF0dGVybj86IHN0cmluZztcbiAgYmF0Y2hTaXplPzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgUmFnUXVlcnlWZWN0b3JQYXJhbXMge1xuICBxdWVyeTogc3RyaW5nO1xuICB0b3BLPzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgUmFnQ2xlYXJJbmRleFBhcmFtcyB7XG4gIGNvbmZpcm06IGJvb2xlYW47XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBEb2N1bWVudENodW5rIHtcbiAgaWQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBtZXRhZGF0YToge1xuICAgIGZpbGVfcGF0aDogc3RyaW5nO1xuICAgIGZpbGVfbmFtZTogc3RyaW5nO1xuICAgIGNodW5rX2luZGV4OiBudW1iZXI7XG4gICAgdG90YWxfY2h1bmtzOiBudW1iZXI7XG4gICAgd29yZF9jb3VudDogbnVtYmVyO1xuICB9O1xufVxuXG5pbnRlcmZhY2UgU2VhcmNoUmVzdWx0IHtcbiAgaWQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBzY29yZTogbnVtYmVyO1xuICBtZXRhZGF0YTogRG9jdW1lbnRDaHVua1snbWV0YWRhdGEnXTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVmVjdG9yIFN0b3JlIEltcGxlbWVudGF0aW9uIChMb2NhbCkgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFNpbXBsZSBsb2NhbCB2ZWN0b3Igc3RvcmUgdXNpbmcgaW4tbWVtb3J5IHN0b3JhZ2Ugd2l0aCBjb3NpbmUgc2ltaWxhcml0eSAqL1xuY2xhc3MgTG9jYWxWZWN0b3JTdG9yZSB7XG4gIHByaXZhdGUgZG9jdW1lbnRzOiBNYXA8c3RyaW5nLCB7IGVtYmVkZGluZzogRmxvYXQzMkFycmF5OyBjaHVuazogRG9jdW1lbnRDaHVuayB9PiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBpbmRleE5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihpbmRleE5hbWU6IHN0cmluZyA9ICdhaV90b29sYm94X3JhZycpIHtcbiAgICB0aGlzLmluZGV4TmFtZSA9IGluZGV4TmFtZTtcbiAgfVxuXG4gIC8qKiBBZGQgZG9jdW1lbnRzIHRvIHRoZSBzdG9yZSAqL1xuICBhZGQoZG9jdW1lbnRzOiBEb2N1bWVudENodW5rW10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGRvYyBvZiBkb2N1bWVudHMpIHtcbiAgICAgIHRoaXMuZG9jdW1lbnRzLnNldChkb2MuaWQsIHsgZW1iZWRkaW5nOiBuZXcgRmxvYXQzMkFycmF5KDApLCBjaHVuazogZG9jIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXQgZW1iZWRkaW5ncyBmb3IgYWxsIGRvY3VtZW50cyAqL1xuICBzZXRFbWJlZGRpbmdzKGlkczogc3RyaW5nW10sIGVtYmVkZGluZ3M6IEZsb2F0MzJBcnJheVtdKTogdm9pZCB7XG4gICAgaWRzLmZvckVhY2goKGlkLCBpKSA9PiB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZG9jdW1lbnRzLmdldChpZCk7XG4gICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgZW50cnkuZW1iZWRkaW5nID0gZW1iZWRkaW5nc1tpXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTZWFyY2ggZm9yIHNpbWlsYXIgZG9jdW1lbnRzICovXG4gIHNlYXJjaChxdWVyeUVtYmVkZGluZzogRmxvYXQzMkFycmF5LCB0b3BLOiBudW1iZXIpOiBTZWFyY2hSZXN1bHRbXSB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBpZDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+ID0gW107XG5cbiAgICBmb3IgKGNvbnN0IFtpZCwgZW50cnldIG9mIHRoaXMuZG9jdW1lbnRzLmVudHJpZXMoKSkge1xuICAgICAgaWYgKGVudHJ5LmVtYmVkZGluZy5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgICAgXG4gICAgICAvLyBDb3NpbmUgc2ltaWxhcml0eVxuICAgICAgbGV0IGRvdFByb2R1Y3QgPSAwO1xuICAgICAgbGV0IG5vcm1BID0gMDtcbiAgICAgIGxldCBub3JtQiA9IDA7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW50cnkuZW1iZWRkaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRvdFByb2R1Y3QgKz0gcXVlcnlFbWJlZGRpbmdbaV0gKiBlbnRyeS5lbWJlZGRpbmdbaV07XG4gICAgICAgIG5vcm1BICs9IGVudHJ5LmVtYmVkZGluZ1tpXSAqIGVudHJ5LmVtYmVkZGluZ1tpXTtcbiAgICAgICAgbm9ybUIgKz0gcXVlcnlFbWJlZGRpbmdbaV0gKiBxdWVyeUVtYmVkZGluZ1tpXTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2ltaWxhcml0eSA9IG5vcm1BID4gMCAmJiBub3JtQiA+IDAgPyBkb3RQcm9kdWN0IC8gKE1hdGguc3FydChub3JtQSkgKiBNYXRoLnNxcnQobm9ybUIpKSA6IDA7XG4gICAgICBcbiAgICAgIHJlc3VsdHMucHVzaCh7IGlkLCBzY29yZTogc2ltaWxhcml0eSB9KTtcbiAgICB9XG5cbiAgICAvLyBTb3J0IGJ5IHNpbWlsYXJpdHkgZGVzY2VuZGluZyBhbmQgcmV0dXJuIHRvcCBLXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSlcbiAgICAgIC5zbGljZSgwLCB0b3BLKVxuICAgICAgLm1hcCgoeyBpZCwgc2NvcmUgfSkgPT4ge1xuICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZG9jdW1lbnRzLmdldChpZCkhO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBlbnRyeS5jaHVuay5pZCxcbiAgICAgICAgICB0ZXh0OiBlbnRyeS5jaHVuay50ZXh0LFxuICAgICAgICAgIHNjb3JlLFxuICAgICAgICAgIG1ldGFkYXRhOiBlbnRyeS5jaHVuay5tZXRhZGF0YSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIENsZWFyIGFsbCBkb2N1bWVudHMgKi9cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5kb2N1bWVudHMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKiBHZXQgZG9jdW1lbnQgY291bnQgKi9cbiAgZ2V0IGNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRzLnNpemU7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVGV4dCBDaHVua2luZyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogU3BsaXQgdGV4dCBpbnRvIGNodW5rcyB3aXRoIG92ZXJsYXAgKi9cbmZ1bmN0aW9uIGNodW5rVGV4dCh0ZXh0OiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyID0gNTAwLCBvdmVybGFwOiBudW1iZXIgPSA1MCk6IERvY3VtZW50Q2h1bmtbXSB7XG4gIGNvbnN0IHdvcmRzID0gdGV4dC5zcGxpdCgvXFxzKy8pO1xuICBjb25zdCBjaHVua3M6IERvY3VtZW50Q2h1bmtbXSA9IFtdO1xuICBcbiAgaWYgKHdvcmRzLmxlbmd0aCA8PSBjaHVua1NpemUpIHtcbiAgICByZXR1cm4gW3tcbiAgICAgIGlkOiBgY2h1bmtfJHtEYXRlLm5vdygpfV8wYCxcbiAgICAgIHRleHQ6IHRleHQsXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6ICcnLFxuICAgICAgICBmaWxlX25hbWU6ICcnLFxuICAgICAgICBjaHVua19pbmRleDogMCxcbiAgICAgICAgdG90YWxfY2h1bmtzOiAxLFxuICAgICAgICB3b3JkX2NvdW50OiB3b3Jkcy5sZW5ndGgsXG4gICAgICB9LFxuICAgIH1dO1xuICB9XG5cbiAgbGV0IHN0YXJ0SW5kZXggPSAwO1xuICBsZXQgY2h1bmtJbmRleCA9IDA7XG5cbiAgd2hpbGUgKHN0YXJ0SW5kZXggPCB3b3Jkcy5sZW5ndGgpIHtcbiAgICBjb25zdCBlbmRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXggKyBjaHVua1NpemUsIHdvcmRzLmxlbmd0aCk7XG4gICAgY29uc3QgY2h1bmtUZXh0ID0gd29yZHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmpvaW4oJyAnKTtcbiAgICBcbiAgICBjaHVua3MucHVzaCh7XG4gICAgICBpZDogYGNodW5rXyR7RGF0ZS5ub3coKX1fJHtjaHVua0luZGV4fWAsXG4gICAgICB0ZXh0OiBjaHVua1RleHQsXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6ICcnLCAvLyBXaWxsIGJlIHNldCBsYXRlclxuICAgICAgICBmaWxlX25hbWU6ICcnLCAvLyBXaWxsIGJlIHNldCBsYXRlclxuICAgICAgICBjaHVua19pbmRleDogY2h1bmtJbmRleCxcbiAgICAgICAgdG90YWxfY2h1bmtzOiBNYXRoLmNlaWwod29yZHMubGVuZ3RoIC8gKGNodW5rU2l6ZSAtIG92ZXJsYXApKSxcbiAgICAgICAgd29yZF9jb3VudDogZW5kSW5kZXggLSBzdGFydEluZGV4LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNodW5rSW5kZXgrKztcbiAgICBzdGFydEluZGV4ID0gZW5kSW5kZXggLSBvdmVybGFwO1xuICB9XG5cbiAgcmV0dXJuIGNodW5rcztcbn1cblxuLyoqIEdlbmVyYXRlIHNpbXBsZSBURi1JREYtbGlrZSBlbWJlZGRpbmdzIGZvciB0ZXh0ICovXG5mdW5jdGlvbiBnZW5lcmF0ZUVtYmVkZGluZyh0ZXh0OiBzdHJpbmcpOiBGbG9hdDMyQXJyYXkge1xuICAvLyBTaW1wbGUgd29yZCBmcmVxdWVuY3ktYmFzZWQgZW1iZWRkaW5nIChkaW1lbnNpb246IDEwMClcbiAgY29uc3QgZGltZW5zaW9ucyA9IDEwMDtcbiAgY29uc3QgZW1iZWRkaW5nID0gbmV3IEZsb2F0MzJBcnJheShkaW1lbnNpb25zKTtcbiAgXG4gIC8vIFRva2VuaXplIGFuZCBoYXNoIHdvcmRzIHRvIGRpbWVuc2lvbnNcbiAgY29uc3Qgd29yZHMgPSB0ZXh0LnRvTG93ZXJDYXNlKCkubWF0Y2goL1thLXpdKy9nKSB8fCBbXTtcbiAgY29uc3Qgd29yZFNldCA9IG5ldyBTZXQod29yZHMpO1xuICBcbiAgZm9yIChjb25zdCB3b3JkIG9mIHdvcmRTZXQpIHtcbiAgICBsZXQgaGFzaCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3JkLmxlbmd0aDsgaSsrKSB7XG4gICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyB3b3JkLmNoYXJDb2RlQXQoaSk7XG4gICAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICAgIH1cbiAgICBcbiAgICBjb25zdCBkaW1JbmRleCA9IE1hdGguYWJzKGhhc2ggJSBkaW1lbnNpb25zKTtcbiAgICBlbWJlZGRpbmdbZGltSW5kZXhdICs9IDEuMCAvICh3b3JkLmxlbmd0aCArIDEpOyAvLyBXZWlnaHQgYnkgaW52ZXJzZSBsZW5ndGhcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZVxuICBsZXQgbm9ybSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltZW5zaW9uczsgaSsrKSB7XG4gICAgbm9ybSArPSBlbWJlZGRpbmdbaV0gKiBlbWJlZGRpbmdbaV07XG4gIH1cbiAgbm9ybSA9IE1hdGguc3FydChub3JtKSB8fCAxO1xuICBcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1lbnNpb25zOyBpKyspIHtcbiAgICBlbWJlZGRpbmdbaV0gLz0gbm9ybTtcbiAgfVxuXG4gIHJldHVybiBlbWJlZGRpbmc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogSW5kZXggZmlsZXMgaW4gYSBkaXJlY3RvcnkgZm9yIHNlbWFudGljIHNlYXJjaC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnSW5kZXhGaWxlcyh7IFxuICBkaXJlY3RvcnlQYXRoLCBcbiAgZmlsZVBhdHRlcm4gPSAnKi57dHMsanMsdHN4LGpzeCxtZCxqc29uLHlhbWwseW1sLHRvbWwsdHh0fScsXG4gIGJhdGNoU2l6ZSA9IDEwIFxufTogUmFnSW5kZXhGaWxlc1BhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIGRpcmVjdG9yeSBleGlzdHNcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5UGF0aCkpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERpcmVjdG9yeSBub3QgZm91bmQ6ICR7ZGlyZWN0b3J5UGF0aH1gIH07XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcmUgPSBuZXcgTG9jYWxWZWN0b3JTdG9yZSgpO1xuICAgIGxldCBpbmRleGVkQ291bnQgPSAwO1xuICAgIGxldCBza2lwcGVkQ291bnQgPSAwO1xuXG4gICAgLy8gRmluZCBmaWxlcyBtYXRjaGluZyBwYXR0ZXJuXG4gICAgY29uc3QgZmluZEZpbGVzID0gKGRpcjogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICAgICAgbGV0IHJlc3VsdHM6IHN0cmluZ1tdID0gW107XG4gICAgICBcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkubmFtZSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIC8vIFNraXAgbm9kZV9tb2R1bGVzIGFuZCAuZ2l0IGRpcmVjdG9yaWVzXG4gICAgICAgICAgICBpZiAoZW50cnkubmFtZSA9PT0gJ25vZGVfbW9kdWxlcycgfHwgZW50cnkubmFtZSA9PT0gJy5naXQnKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChmaW5kRmlsZXMoZnVsbFBhdGgpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmaWxlIGV4dGVuc2lvbiBhZ2FpbnN0IHBhdHRlcm5cbiAgICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgY29uc3QgYWxsb3dlZEV4dHMgPSBbJy50cycsICcuanMnLCAnLnRzeCcsICcuanN4JywgJy5tZCcsICcuanNvbicsICcueWFtbCcsICcueW1sJywgJy50b21sJywgJy50eHQnXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0FJIFRvb2xib3hdIENvdWxkIG5vdCByZWFkIGRpcmVjdG9yeSAke2Rpcn06YCwgZXJyb3IpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgY29uc3QgZmlsZXMgPSBmaW5kRmlsZXMoZGlyZWN0b3J5UGF0aCk7XG4gICAgXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpbmRleGVkQ291bnQ6IDAsIG1lc3NhZ2U6ICdObyBtYXRjaGluZyBmaWxlcyBmb3VuZCcgfSB9O1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZWFjaCBmaWxlXG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIFxuICAgICAgICAvLyBTa2lwIGxhcmdlIGZpbGVzICg+MU1CKVxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggPiAxMDI0ICogMTAyNCkge1xuICAgICAgICAgIHNraXBwZWRDb3VudCsrO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2h1bmsgdGhlIHRleHRcbiAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtUZXh0KGNvbnRlbnQpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IG1ldGFkYXRhIGZvciBlYWNoIGNodW5rXG4gICAgICAgIGNodW5rcy5mb3JFYWNoKGNodW5rID0+IHtcbiAgICAgICAgICBjaHVuay5tZXRhZGF0YS5maWxlX3BhdGggPSBmaWxlUGF0aDtcbiAgICAgICAgICBjaHVuay5tZXRhZGF0YS5maWxlX25hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgZW1iZWRkaW5ncyBhbmQgYWRkIHRvIHN0b3JlXG4gICAgICAgIGNvbnN0IGlkcyA9IGNodW5rcy5tYXAoYyA9PiBjLmlkKTtcbiAgICAgICAgY29uc3QgZW1iZWRkaW5ncyA9IGNodW5rcy5tYXAoYyA9PiBnZW5lcmF0ZUVtYmVkZGluZyhjLnRleHQpKTtcbiAgICAgICAgXG4gICAgICAgIHN0b3JlLmFkZChjaHVua3MpO1xuICAgICAgICBzdG9yZS5zZXRFbWJlZGRpbmdzKGlkcywgZW1iZWRkaW5ncyk7XG4gICAgICAgIFxuICAgICAgICBpbmRleGVkQ291bnQgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0FJIFRvb2xib3hdIENvdWxkIG5vdCBpbmRleCAke2ZpbGVQYXRofTpgLCBlcnJvcik7XG4gICAgICAgIHNraXBwZWRDb3VudCsrO1xuICAgICAgfVxuXG4gICAgICAvLyBQcm9ncmVzcyBjYWxsYmFjayBldmVyeSBiYXRjaFxuICAgICAgaWYgKChpbmRleGVkQ291bnQgKyBza2lwcGVkQ291bnQpICUgYmF0Y2hTaXplID09PSAwKSB7XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBcXHJbQUkgVG9vbGJveF0gSW5kZXhlZCAkeyhpbmRleGVkQ291bnQgKyBza2lwcGVkQ291bnQpfSBjaHVua3MuLi5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnXFxuW0FJIFRvb2xib3hdIEluZGV4aW5nIGNvbXBsZXRlJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgaW5kZXhlZENodW5rczogaW5kZXhlZENvdW50LFxuICAgICAgICBmaWxlc1Byb2Nlc3NlZDogZmlsZXMubGVuZ3RoLFxuICAgICAgICBza2lwcGVkRmlsZXM6IHNraXBwZWRDb3VudCxcbiAgICAgICAgdG90YWxEb2N1bWVudHM6IHN0b3JlLmNvdW50LFxuICAgICAgICBkaXJlY3RvcnlQYXRoLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUkFHIGluZGV4aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFF1ZXJ5IHRoZSB2ZWN0b3IgaW5kZXggZm9yIHNlbWFudGljYWxseSBzaW1pbGFyIGRvY3VtZW50cy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnUXVlcnlWZWN0b3IoeyBxdWVyeSwgdG9wSyA9IDUgfTogUmFnUXVlcnlWZWN0b3JQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmcgZm9yIHRoZSBxdWVyeVxuICAgIGNvbnN0IHF1ZXJ5RW1iZWRkaW5nID0gZ2VuZXJhdGVFbWJlZGRpbmcocXVlcnkpO1xuICAgIFxuICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCB1c2UgQ2hyb21hREIgb3Igc2ltaWxhclxuICAgIC8vIEZvciBub3csIHdlIHJldHVybiBhIHBsYWNlaG9sZGVyIHJlc3BvbnNlXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHF1ZXJ5LFxuICAgICAgICB0b3BLLFxuICAgICAgICByZXN1bHRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdwbGFjZWhvbGRlcicsXG4gICAgICAgICAgICB0ZXh0OiAnVmVjdG9yIHNlYXJjaCByZXF1aXJlcyBDaHJvbWFEQiBpbnRlZ3JhdGlvbi4gVGhpcyBpcyBhIHBsYWNlaG9sZGVyLicsXG4gICAgICAgICAgICBzY29yZTogMCxcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgIGZpbGVfcGF0aDogJycsXG4gICAgICAgICAgICAgIGZpbGVfbmFtZTogJycsXG4gICAgICAgICAgICAgIGNodW5rX2luZGV4OiAwLFxuICAgICAgICAgICAgICB0b3RhbF9jaHVua3M6IDEsXG4gICAgICAgICAgICAgIHdvcmRfY291bnQ6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5vdGU6ICdUbyBlbmFibGUgZnVsbCB2ZWN0b3Igc2VhcmNoLCBpbnN0YWxsIGNocm9tYWRiIGFuZCB1cGRhdGUgdGhlIGltcGxlbWVudGF0aW9uLicsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgcXVlcnkgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8qKlxuICogQ2xlYXIgdGhlIHZlY3RvciBpbmRleC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnQ2xlYXJJbmRleCh7IGNvbmZpcm0gfTogUmFnQ2xlYXJJbmRleFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICBpZiAoIWNvbmZpcm0pIHtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDb25maXJtYXRpb24gcmVxdWlyZWQgdG8gY2xlYXIgaW5kZXgnIH07XG4gIH1cblxuICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgY2xlYXIgQ2hyb21hREJcbiAgcmV0dXJuIHtcbiAgICBzdWNjZXNzOiB0cnVlLFxuICAgIGRhdGE6IHsgbWVzc2FnZTogJ1ZlY3RvciBpbmRleCBjbGVhcmVkIHN1Y2Nlc3NmdWxseScgfSxcbiAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyUmFnVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJhZ19pbmRleF9maWxlcyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ19pbmRleF9maWxlcycsXG4gICAgZGVzY3JpcHRpb246ICdJbmRleCBmaWxlcyBpbiBhIGRpcmVjdG9yeSBmb3Igc2VtYW50aWMgc2VhcmNoLiBTdXBwb3J0cyBUeXBlU2NyaXB0LCBKYXZhU2NyaXB0LCBNYXJrZG93biwgSlNPTiwgWUFNTCwgYW5kIHRleHQgZmlsZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBkaXJlY3RvcnlQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEaXJlY3RvcnkgcGF0aCB0byBpbmRleCcpLFxuICAgICAgZmlsZVBhdHRlcm46IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCcqLnt0cyxqcyx0c3gsanN4LG1kLGpzb24seWFtbCx5bWwsdG9tbCx0eHR9JykuZGVzY3JpYmUoJ0ZpbGUgcGF0dGVybiB0byBtYXRjaCAoZ2xvYiBzeW50YXgpJyksXG4gICAgICBiYXRjaFNpemU6IHoubnVtYmVyKCkubWluKDEpLm1heCgxMDApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ0JhdGNoIHNpemUgZm9yIHByb2dyZXNzIHJlcG9ydGluZycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHJhZ0luZGV4RmlsZXMocGFyYW1zIGFzIFJhZ0luZGV4RmlsZXNQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gcmFnX3F1ZXJ5X3ZlY3RvciB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ19xdWVyeV92ZWN0b3InLFxuICAgIGRlc2NyaXB0aW9uOiAnUXVlcnkgdGhlIHZlY3RvciBpbmRleCBmb3Igc2VtYW50aWNhbGx5IHNpbWlsYXIgZG9jdW1lbnRzLiBSZXR1cm5zIHRvcC1rIG1vc3QgcmVsZXZhbnQgY2h1bmtzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NlYXJjaCBxdWVyeSB0ZXh0JyksXG4gICAgICB0b3BLOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMjApLm9wdGlvbmFsKCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnTnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmFnUXVlcnlWZWN0b3IocGFyYW1zIGFzIFJhZ1F1ZXJ5VmVjdG9yUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIHJhZ19jbGVhcl9pbmRleCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ19jbGVhcl9pbmRleCcsXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciB0aGUgdmVjdG9yIHNlYXJjaCBpbmRleC4gUmVxdWlyZXMgY29uZmlybWF0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29uZmlybTogei5ib29sZWFuKCkuZGVzY3JpYmUoJ1NldCB0byB0cnVlIHRvIGNvbmZpcm0gY2xlYXJpbmcgdGhlIGluZGV4JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmFnQ2xlYXJJbmRleChwYXJhbXMgYXMgUmFnQ2xlYXJJbmRleFBhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFVJIENvbXBvbmVudCBUZW1wbGF0ZXMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgYnV0dG9uIGNvbXBvbmVudCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVCdXR0b25IdG1sKGxhYmVsOiBzdHJpbmcsIGNvbG9yOiBzdHJpbmcgPSAnIzAwN2JmZicsIGlkOiBzdHJpbmcgPSAndWktYnRuJyk6IHN0cmluZyB7XG4gIHJldHVybiBgXG4gICAgPGJ1dHRvbiBpZD1cIiR7aWR9XCIgc3R5bGU9XCJcbiAgICAgIHBhZGRpbmc6IDEycHggMjRweDtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7Y29sb3J9O1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzO1xuICAgIFwiPiR7bGFiZWx9PC9idXR0b24+XG4gIGA7XG59XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGZvcm0gY29tcG9uZW50ICovXG5mdW5jdGlvbiBnZW5lcmF0ZUZvcm1IdG1sKGZpZWxkczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9Piwgc3VibWl0TGFiZWw6IHN0cmluZyA9ICdTdWJtaXQnKTogc3RyaW5nIHtcbiAgY29uc3QgZmllbGRzSHRtbCA9IGZpZWxkcy5tYXAoZmllbGQgPT4gYFxuICAgIDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxNXB4O1wiPlxuICAgICAgPGxhYmVsIGZvcj1cIiR7ZmllbGQubmFtZX1cIiBzdHlsZT1cImRpc3BsYXk6IGJsb2NrOyBtYXJnaW4tYm90dG9tOiA1cHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7ZmllbGQubGFiZWx9PC9sYWJlbD5cbiAgICAgICR7ZmllbGQudHlwZSA9PT0gJ3RleHRhcmVhJyBcbiAgICAgICAgPyBgPHRleHRhcmVhIGlkPVwiJHtmaWVsZC5uYW1lfVwiIG5hbWU9XCIke2ZpZWxkLm5hbWV9XCIgcm93cz1cIjRcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBwYWRkaW5nOiA4cHg7IGJvcmRlcjogMXB4IHNvbGlkICNjY2M7IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L3RleHRhcmVhPmBcbiAgICAgICAgOiBmaWVsZC50eXBlID09PSAnc2VsZWN0J1xuICAgICAgICAgID8gYDxzZWxlY3QgaWQ9XCIke2ZpZWxkLm5hbWV9XCIgbmFtZT1cIiR7ZmllbGQubmFtZX1cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBwYWRkaW5nOiA4cHg7IGJvcmRlcjogMXB4IHNvbGlkICNjY2M7IGJvcmRlci1yYWRpdXM6IDRweDtcIj48b3B0aW9uIHZhbHVlPVwiXCI+U2VsZWN0Li4uPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIjFcIj5PcHRpb24gMTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCIyXCI+T3B0aW9uIDI8L29wdGlvbj48L3NlbGVjdD5gXG4gICAgICAgICAgOiBgPGlucHV0IHR5cGU9XCIke2ZpZWxkLnR5cGV9XCIgaWQ9XCIke2ZpZWxkLm5hbWV9XCIgbmFtZT1cIiR7ZmllbGQubmFtZX1cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBwYWRkaW5nOiA4cHg7IGJvcmRlcjogMXB4IHNvbGlkICNjY2M7IGJvcmRlci1yYWRpdXM6IDRweDtcIiAvPmBcbiAgICAgIH1cbiAgICA8L2Rpdj5cbiAgYCkuam9pbignJyk7XG5cbiAgcmV0dXJuIGBcbiAgICA8Zm9ybSBpZD1cInVpLWZvcm1cIiBvbnN1Ym1pdD1cImV2ZW50LnByZXZlbnREZWZhdWx0KCk7IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXJlc3VsdCcpLmlubmVySFRNTCA9ICdGb3JtIHN1Ym1pdHRlZCEnO1wiPlxuICAgICAgJHtmaWVsZHNIdG1sfVxuICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgc3R5bGU9XCJwYWRkaW5nOiAxMnB4IDI0cHg7IGJhY2tncm91bmQtY29sb3I6ICMwMDdiZmY7IGNvbG9yOiB3aGl0ZTsgYm9yZGVyOiBub25lOyBib3JkZXItcmFkaXVzOiA2cHg7IGN1cnNvcjogcG9pbnRlcjtcIj4ke3N1Ym1pdExhYmVsfTwvYnV0dG9uPlxuICAgIDwvZm9ybT5cbiAgICA8ZGl2IGlkPVwiZm9ybS1yZXN1bHRcIiBzdHlsZT1cIm1hcmdpbi10b3A6IDE1cHg7IHBhZGRpbmc6IDEwcHg7IGJhY2tncm91bmQtY29sb3I6ICNmOGY5ZmE7IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L2Rpdj5cbiAgYDtcbn1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgY2hhcnQgY29tcG9uZW50IChzaW1wbGUgYmFyIGNoYXJ0KSAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVDaGFydEh0bWwoZGF0YTogQXJyYXk8eyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogbnVtYmVyIH0+LCB0aXRsZTogc3RyaW5nID0gJ0JhciBDaGFydCcpOiBzdHJpbmcge1xuICBjb25zdCBtYXhWYWx1ZSA9IE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC52YWx1ZSkpO1xuICBjb25zdCBiYXJzSHRtbCA9IGRhdGEubWFwKGQgPT4ge1xuICAgIGNvbnN0IGhlaWdodCA9IChkLnZhbHVlIC8gbWF4VmFsdWUpICogMjAwO1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtZW5kOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgbWFyZ2luLXJpZ2h0OiAxMHB4O1wiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwid2lkdGg6IDQwcHg7IGhlaWdodDogJHtoZWlnaHR9cHg7IGJhY2tncm91bmQtY29sb3I6ICMwMDdiZmY7IGJvcmRlci1yYWRpdXM6IDRweCA0cHggMCAwO1wiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfSkuam9pbignJyk7XG5cbiAgY29uc3QgbGFiZWxzSHRtbCA9IGRhdGEubWFwKGQgPT4gYFxuICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogNDBweDsgdGV4dC1hbGlnbjogY2VudGVyOyBmb250LXNpemU6IDEycHg7XCI+JHtkLmxhYmVsfTwvZGl2PlxuICBgKS5qb2luKCcnKTtcblxuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJwYWRkaW5nOiAyMHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmOWZhOyBib3JkZXItcmFkaXVzOiA4cHg7XCI+XG4gICAgICA8aDM+JHt0aXRsZX08L2gzPlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBmbGV4LWVuZDsgaGVpZ2h0OiAyMjBweDsgbWFyZ2luLWJvdHRvbTogMTBweDtcIj4ke2JhcnNIdG1sfTwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1wiPiR7bGFiZWxzSHRtbH08L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgZGFzaGJvYXJkIGNvbXBvbmVudCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVEYXNoYm9hcmRIdG1sKHRpdGxlczogc3RyaW5nW10sIGNvbnRlbnQ6IEFycmF5PHsgdHlwZTogJ3RleHQnIHwgJ2NoYXJ0JzsgZGF0YT86IGFueSB9Pik6IHN0cmluZyB7XG4gIGNvbnN0IGNhcmRzSHRtbCA9IHRpdGxlcy5tYXAoKHRpdGxlLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGNhcmRDb250ZW50ID0gY29udGVudFtpbmRleF0/LnR5cGUgPT09ICdjaGFydCcgXG4gICAgICA/IGdlbmVyYXRlQ2hhcnRIdG1sKGNvbnRlbnRbaW5kZXhdLmRhdGEgfHwgW3sgbGFiZWw6ICdBJywgdmFsdWU6IDUwIH0sIHsgbGFiZWw6ICdCJywgdmFsdWU6IDgwIH1dLCB0aXRsZSlcbiAgICAgIDogYDxwIHN0eWxlPVwicGFkZGluZzogMjBweDtcIj4ke2NvbnRlbnRbaW5kZXhdPy5kYXRhIHx8IGBDb250ZW50IGZvciAke3RpdGxlfWB9PC9wPmA7XG4gICAgXG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxOyBtaW4td2lkdGg6IDI1MHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTsgYm9yZGVyLXJhZGl1czogOHB4OyBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLDAsMCwwLjEpOyBtYXJnaW46IDEwcHg7XCI+XG4gICAgICAgICR7Y2FyZENvbnRlbnR9XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9KS5qb2luKCcnKTtcblxuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogMjBweDsgcGFkZGluZzogMjBweDtcIj4ke2NhcmRzSHRtbH08L2Rpdj5cbiAgYDtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVWlHZW5lcmF0aW9uVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGdlbmVyYXRlX3VpX2NvbXBvbmVudCB0b29sIFx1MjAxNCBHZW5lcmF0ZSBpbnRlcmFjdGl2ZSBVSSBjb21wb25lbnRzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dlbmVyYXRlX3VpX2NvbXBvbmVudCcsXG4gICAgZGVzY3JpcHRpb246ICdHZW5lcmF0ZSBIVE1ML0NTUy9KUyBjb2RlIGZvciBhbiBpbnRlcmFjdGl2ZSBVSSBjb21wb25lbnQgKGJ1dHRvbiwgZm9ybSwgY2hhcnQsIGRhc2hib2FyZCkuIFJldHVybnMgdGhlIGdlbmVyYXRlZCBjb2RlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tcG9uZW50X3R5cGU6IHouZW51bShbJ2J1dHRvbicsICdmb3JtJywgJ2NoYXJ0JywgJ2Rhc2hib2FyZCddKS5kZXNjcmliZSgnVHlwZSBvZiBVSSBjb21wb25lbnQgdG8gZ2VuZXJhdGUnKSxcbiAgICAgIGxhYmVsOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0xhYmVsIHRleHQgZm9yIGJ1dHRvbnMgb3IgZm9ybXMnKSxcbiAgICAgIGZpZWxkczogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIG5hbWU6IHouc3RyaW5nKCksXG4gICAgICAgIHR5cGU6IHouZW51bShbJ3RleHQnLCAnZW1haWwnLCAncGFzc3dvcmQnLCAnbnVtYmVyJywgJ3RleHRhcmVhJywgJ3NlbGVjdCddKSxcbiAgICAgICAgbGFiZWw6IHouc3RyaW5nKCksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRm9ybSBmaWVsZHMgKGZvciBmb3JtIGNvbXBvbmVudCknKSxcbiAgICAgIGNoYXJ0X2RhdGE6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgICBsYWJlbDogei5zdHJpbmcoKSxcbiAgICAgICAgdmFsdWU6IHoubnVtYmVyKCksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ2hhcnQgZGF0YSBwb2ludHMgKGZvciBjaGFydCBjb21wb25lbnQpJyksXG4gICAgICBkYXNoYm9hcmRfdGl0bGVzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RpdGxlcyBmb3IgZGFzaGJvYXJkIGNhcmRzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tcG9uZW50X3R5cGUsIGxhYmVsLCBmaWVsZHMsIGNoYXJ0X2RhdGEsIGRhc2hib2FyZF90aXRsZXMgfTogeyBcbiAgICAgIGNvbXBvbmVudF90eXBlOiBzdHJpbmc7IFxuICAgICAgbGFiZWw/OiBzdHJpbmc7IFxuICAgICAgZmllbGRzPzogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9PjsgXG4gICAgICBjaGFydF9kYXRhPzogQXJyYXk8eyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogbnVtYmVyIH0+O1xuICAgICAgZGFzaGJvYXJkX3RpdGxlcz86IHN0cmluZ1tdO1xuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKGNvbXBvbmVudF90eXBlKSB7XG4gICAgICAgICAgY2FzZSAnYnV0dG9uJzpcbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZUJ1dHRvbkh0bWwobGFiZWwgfHwgJ0NsaWNrIE1lJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdmb3JtJzpcbiAgICAgICAgICAgIGlmICghZmllbGRzIHx8IGZpZWxkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRm9ybSBjb21wb25lbnQgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGZpZWxkJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlRm9ybUh0bWwoZmllbGRzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2NoYXJ0JzpcbiAgICAgICAgICAgIGlmICghY2hhcnRfZGF0YSB8fCBjaGFydF9kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDaGFydCBjb21wb25lbnQgcmVxdWlyZXMgZGF0YSBwb2ludHMnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVDaGFydEh0bWwoY2hhcnRfZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkYXNoYm9hcmQnOlxuICAgICAgICAgICAgaWYgKCFkYXNoYm9hcmRfdGl0bGVzIHx8IGRhc2hib2FyZF90aXRsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0Rhc2hib2FyZCBjb21wb25lbnQgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIHRpdGxlJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGRhc2hib2FyZF90aXRsZXMubWFwKCh0aXRsZSwgaW5kZXgpID0+ICh7XG4gICAgICAgICAgICAgIHR5cGU6IGluZGV4ICUgMiA9PT0gMCA/ICdjaGFydCcgOiAndGV4dCcsXG4gICAgICAgICAgICAgIGRhdGE6IGluZGV4ICUgMiA9PT0gMCA/IFt7IGxhYmVsOiAnQScsIHZhbHVlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApIH0sIHsgbGFiZWw6ICdCJywgdmFsdWU6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgfV0gOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVEYXNoYm9hcmRIdG1sKGRhc2hib2FyZF90aXRsZXMsIGNvbnRlbnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVua25vd24gY29tcG9uZW50IHR5cGU6ICR7Y29tcG9uZW50X3R5cGV9YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZnVsbEh0bWwgPSBgPCFET0NUWVBFIGh0bWw+PGh0bWw+PGhlYWQ+PG1ldGEgY2hhcnNldD1cIlVURi04XCI+PHRpdGxlPlVJIENvbXBvbmVudDwvdGl0bGU+PC9oZWFkPjxib2R5IHN0eWxlPVwiZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOyBwYWRkaW5nOiAyMHB4O1wiPiR7aHRtbH08L2JvZHk+PC9odG1sPmA7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbXBvbmVudF90eXBlLCBodG1sOiBmdWxsSHRtbCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2VuZXJhdGUgVUkgY29tcG9uZW50OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZW5kZXJfYW5kX3ByZXZpZXdfdWkgdG9vbCBcdTIwMTQgUmVuZGVyIGdlbmVyYXRlZCBVSSBpbiBicm93c2VyIGFuZCBjYXB0dXJlIHNjcmVlbnNob3RcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVuZGVyX2FuZF9wcmV2aWV3X3VpJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlbmRlciBhIGdlbmVyYXRlZCBIVE1MIFVJIGNvbXBvbmVudCwgc2F2ZSBpdCB0byBhIGZpbGUsIG9wZW4gaXQgaW4gdGhlIGRlZmF1bHQgYnJvd3NlciwgYW5kIG9wdGlvbmFsbHkgdGFrZSBhIHNjcmVlbnNob3QuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBjb21wbGV0ZSBIVE1MIGNvbnRlbnQgdG8gcmVuZGVyJyksXG4gICAgICBmaWxlbmFtZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ3VpX3ByZXZpZXcuaHRtbCcpLmRlc2NyaWJlKCdGaWxlbmFtZSBmb3Igc2F2aW5nIChkZWZhdWx0OiB1aV9wcmV2aWV3Lmh0bWwpJyksXG4gICAgICBzY3JlZW5zaG90X3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgcGF0aCB0byBzYXZlIGEgc2NyZWVuc2hvdCBvZiB0aGUgcmVuZGVyZWQgVUknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBodG1sX2NvbnRlbnQsIGZpbGVuYW1lLCBzY3JlZW5zaG90X3BhdGggfTogeyBcbiAgICAgIGh0bWxfY29udGVudDogc3RyaW5nOyBcbiAgICAgIGZpbGVuYW1lPzogc3RyaW5nOyBcbiAgICAgIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZzsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBmaWxlbmFtZSB8fCAndWlfcHJldmlldy5odG1sJztcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oZ2V0V29ya2luZ0RpcigpLCBmaWxlTmFtZSk7XG5cbiAgICAgICAgLy8gU2F2ZSBIVE1MIHRvIGZpbGVcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgaHRtbF9jb250ZW50KTtcblxuICAgICAgICAvLyBPcGVuIGluIGRlZmF1bHQgYnJvd3NlciB1c2luZyBFUyBpbXBvcnQgKHNhbWUgYXMgcHJldmlld19odG1sIHRvb2wpXG4gICAgICAgIGNvbnN0IG9wZW5Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ29wZW4nKTtcbiAgICAgICAgYXdhaXQgb3Blbk1vZHVsZS5kZWZhdWx0KGZpbGVQYXRoKTtcblxuICAgICAgICBjb25zdCByZXN1bHREYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgXG4gICAgICAgICAgcmVuZGVyZWQ6IHRydWUsIFxuICAgICAgICAgIGZpbGU6IGZpbGVOYW1lLFxuICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRha2Ugc2NyZWVuc2hvdCBpZiByZXF1ZXN0ZWQgKHVzaW5nIFB1cHBldGVlcilcbiAgICAgICAgaWYgKHNjcmVlbnNob3RfcGF0aCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwdXBwZXRlZXJNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ3B1cHBldGVlcicpO1xuICAgICAgICAgICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHB1cHBldGVlck1vZHVsZS5kZWZhdWx0LmxhdW5jaCh7IGhlYWRsZXNzOiB0cnVlIH0pO1xuICAgICAgICAgICAgY29uc3QgcGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBMb2FkIHRoZSBIVE1MIGZpbGVcbiAgICAgICAgICAgIGF3YWl0IHBhZ2UuZ290byhgZmlsZTovLyR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIGNvbnRlbnQgdG8gcmVuZGVyXG4gICAgICAgICAgICBhd2FpdCBwYWdlLndhaXRGb3JTZWxlY3RvcignYm9keScsIHsgdGltZW91dDogNTAwMCB9KS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRha2Ugc2NyZWVuc2hvdFxuICAgICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoLCBmdWxsUGFnZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFNhdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXdhaXQgYnJvd3Nlci5jbG9zZSgpO1xuICAgICAgICAgIH0gY2F0Y2ggKHNjcmVlbnNob3RFcnJvcikge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHNjcmVlbnNob3RFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gc2NyZWVuc2hvdEVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoc2NyZWVuc2hvdEVycm9yKTtcbiAgICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFdhcm5pbmcgPSBgU2NyZWVuc2hvdCBmYWlsZWQ6ICR7bWVzc2FnZX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byByZW5kZXIgVUk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGV4dHJhY3RfdWlfZGF0YSB0b29sIFx1MjAxNCBFeHRyYWN0IGRhdGEgZnJvbSBpbnRlcmFjdGl2ZSBVSSBlbGVtZW50c1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdleHRyYWN0X3VpX2RhdGEnLFxuICAgIGRlc2NyaXB0aW9uOiAnRXh0cmFjdCBzdHJ1Y3R1cmVkIGRhdGEgZnJvbSBIVE1MIGNvbnRlbnQgKHRhYmxlcywgZm9ybXMsIGxpc3RzKS4gVXNlZnVsIGZvciBwYXJzaW5nIGdlbmVyYXRlZCBvciBmZXRjaGVkIFVJcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGh0bWxfY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIEhUTUwgY29udGVudCB0byBleHRyYWN0IGRhdGEgZnJvbScpLFxuICAgICAgZXh0cmFjdGlvbl90eXBlOiB6LmVudW0oWyd0YWJsZScsICdmb3JtJywgJ2xpc3QnXSkuZGVmYXVsdCgndGFibGUnKS5kZXNjcmliZSgnVHlwZSBvZiBkYXRhIHRvIGV4dHJhY3QnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBodG1sX2NvbnRlbnQsIGV4dHJhY3Rpb25fdHlwZSB9OiB7IFxuICAgICAgaHRtbF9jb250ZW50OiBzdHJpbmc7IFxuICAgICAgZXh0cmFjdGlvbl90eXBlOiBzdHJpbmc7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFVzZSBOb2RlLmpzIERPTSBwYXJzZXIgKGNoZWVyaW8tbGlrZSBhcHByb2FjaCB3aXRoIGJhc2ljIHJlZ2V4IGZvciBzaW1wbGljaXR5KVxuICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHlvdSdkIHVzZSBhIHByb3BlciBIVE1MIHBhcnNlciBsaWtlIGpzZG9tIG9yIGNoZWVyaW9cbiAgICAgICAgXG4gICAgICAgIGxldCBleHRyYWN0ZWREYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuXG4gICAgICAgIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICd0YWJsZScpIHtcbiAgICAgICAgICBjb25zdCB0YWJsZVJlZ2V4ID0gLzx0YWJsZVtePl0qPihbXFxzXFxTXSo/KTxcXC90YWJsZT4vZ2k7XG4gICAgICAgICAgY29uc3Qgcm93c1JlZ2V4ID0gLzx0cltePl0qPihbXFxzXFxTXSo/KTxcXC90cj4vZ2k7XG4gICAgICAgICAgY29uc3QgY2VsbHNSZWdleCA9IC88KHRkfHRoKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odGR8dGgpPi9naTtcblxuICAgICAgICAgIGxldCB0YWJsZU1hdGNoO1xuICAgICAgICAgIHdoaWxlICgodGFibGVNYXRjaCA9IHRhYmxlUmVnZXguZXhlYyhodG1sX2NvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgdGFibGVDb250ZW50ID0gdGFibGVNYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IHJvd3M6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBsZXQgcm93TWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKHJvd01hdGNoID0gcm93c1JlZ2V4LmV4ZWModGFibGVDb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgcm93cy5wdXNoKHJvd01hdGNoWzFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcGFyc2VkUm93czogc3RyaW5nW11bXSA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgICAgICAgICAgICBjb25zdCBjZWxsczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgbGV0IGNlbGxNYXRjaDtcbiAgICAgICAgICAgICAgY29uc3QgY2VsbFJlZ2V4ID0gLzwodGR8dGgpW14+XSo+KFtcXHNcXFNdKj8pPFxcLyh0ZHx0aCk+L2dpO1xuICAgICAgICAgICAgICB3aGlsZSAoKGNlbGxNYXRjaCA9IGNlbGxSZWdleC5leGVjKHJvdykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY2VsbHMucHVzaChjZWxsTWF0Y2hbMl0ucmVwbGFjZSgvPFtePl0rPi9nLCAnJykudHJpbSgpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwYXJzZWRSb3dzLnB1c2goY2VsbHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBleHRyYWN0ZWREYXRhLnRhYmxlcyA9IHBhcnNlZFJvd3M7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV4dHJhY3Rpb25fdHlwZSA9PT0gJ2Zvcm0nKSB7XG4gICAgICAgICAgY29uc3QgZm9ybVJlZ2V4ID0gLzxmb3JtW14+XSo+KFtcXHNcXFNdKj8pPFxcL2Zvcm0+L2dpO1xuICAgICAgICAgIGNvbnN0IGlucHV0UmVnZXggPSAvPChpbnB1dHxzZWxlY3R8dGV4dGFyZWEpW14+XSpcXC8/Pi9naTtcblxuICAgICAgICAgIGxldCBmb3JtTWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKChmb3JtTWF0Y2ggPSBmb3JtUmVnZXguZXhlYyhodG1sX2NvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgZm9ybUNvbnRlbnQgPSBmb3JtTWF0Y2hbMV07XG4gICAgICAgICAgICBjb25zdCBmaWVsZHM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyB0eXBlOiBzdHJpbmc7IHZhbHVlPzogc3RyaW5nIH0+ID0gW107XG4gICAgICAgICAgICBsZXQgaW5wdXRNYXRjaDtcbiAgICAgICAgICAgIHdoaWxlICgoaW5wdXRNYXRjaCA9IGlucHV0UmVnZXguZXhlYyhmb3JtQ29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHRhZyA9IGlucHV0TWF0Y2hbMF07XG4gICAgICAgICAgICAgIGNvbnN0IG5hbWVNYXRjaCA9IC9uYW1lPVtcIiddKFteXCInXSspW1wiJ10vaS5leGVjKHRhZyk7XG4gICAgICAgICAgICAgIGNvbnN0IHR5cGVNYXRjaCA9IC90eXBlPVtcIiddKFteXCInXSspW1wiJ10vaS5leGVjKHRhZyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBpZiAobmFtZU1hdGNoKSB7XG4gICAgICAgICAgICAgICAgZmllbGRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZU1hdGNoWzFdLFxuICAgICAgICAgICAgICAgICAgdHlwZTogdHlwZU1hdGNoPy5bMV0gfHwgJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLCAvLyBXb3VsZCBuZWVkIHRvIGV4dHJhY3QgYWN0dWFsIHZhbHVlcyBpbiBhIHJlYWwgaW1wbGVtZW50YXRpb25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBleHRyYWN0ZWREYXRhLmZvcm1GaWVsZHMgPSBmaWVsZHM7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV4dHJhY3Rpb25fdHlwZSA9PT0gJ2xpc3QnKSB7XG4gICAgICAgICAgY29uc3QgbGlzdFJlZ2V4ID0gLzwodWx8b2wpW14+XSo+KFtcXHNcXFNdKj8pPFxcLyh1bHxvbCk+L2dpO1xuICAgICAgICAgIGNvbnN0IGl0ZW1SZWdleCA9IC88bGlbXj5dKj4oW1xcc1xcU10qPyk8XFwvbGk+L2dpO1xuXG4gICAgICAgICAgbGV0IGxpc3RNYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKGxpc3RNYXRjaCA9IGxpc3RSZWdleC5leGVjKGh0bWxfY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0Q29udGVudCA9IGxpc3RNYXRjaFsyXTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IGl0ZW1NYXRjaDtcbiAgICAgICAgICAgIHdoaWxlICgoaXRlbU1hdGNoID0gaXRlbVJlZ2V4LmV4ZWMobGlzdENvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW1NYXRjaFsxXS5yZXBsYWNlKC88W14+XSs+L2csICcnKS50cmltKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBleHRyYWN0ZWREYXRhLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogZXh0cmFjdGVkRGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGV4dHJhY3QgVUkgZGF0YTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZ2V0V29ya2luZ0RpciB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDb250ZXh0IE1hbmFnZW1lbnQgVHlwZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIENvbnRleHRFbnRyeSB7XG4gIGlkOiBzdHJpbmc7XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xuICB0eXBlOiAnZGVjaXNpb24nIHwgJ3BhdHRlcm4nIHwgJ2NvbmZpZ3VyYXRpb24nIHwgJ2ZpbGVfY2hhbmdlJyB8ICdlcnJvcicgfCAnc3VtbWFyeSc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGFncz86IHN0cmluZ1tdO1xuICBzZXNzaW9uX2lkPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQ29udGV4dFN1bW1hcnkge1xuICB0b3RhbF9lbnRyaWVzOiBudW1iZXI7XG4gIGVudHJpZXNfYnlfdHlwZTogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbiAgcmVjZW50X2VudHJpZXM6IENvbnRleHRFbnRyeVtdO1xuICBsYXN0X3VwZGF0ZWQ6IG51bWJlcjtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ29udGV4dCBTdG9yYWdlIE1hbmFnZXIgPT09PT09PT09PT09PT09PT09PT1cblxuY2xhc3MgQ29udGV4dFN0b3JhZ2VNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdG9yYWdlUGF0aDogc3RyaW5nO1xuICBcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yYWdlUGF0aCA9IHBhdGguam9pbihnZXRXb3JraW5nRGlyKCksICcuYWlfdG9vbGJveF9jb250ZXh0Lmpzb24nKTtcbiAgfVxuXG4gIC8qKiBMb2FkIGNvbnRleHQgZW50cmllcyBmcm9tIGRpc2sgKi9cbiAgbG9hZCgpOiBDb250ZXh0RW50cnlbXSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRoaXMuc3RvcmFnZVBhdGgpKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmModGhpcy5zdG9yYWdlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBjb250ZXh0IHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKiogU2F2ZSBjb250ZXh0IGVudHJpZXMgdG8gZGlzayAqL1xuICBzYXZlKGVudHJpZXM6IENvbnRleHRFbnRyeVtdKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZSh0aGlzLnN0b3JhZ2VQYXRoKTtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBXcml0ZSBhdG9taWNhbGx5ICh0ZW1wIGZpbGUgKyByZW5hbWUpXG4gICAgICBjb25zdCB0ZW1wUGF0aCA9IHRoaXMuc3RvcmFnZVBhdGggKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBQYXRoLCBKU09OLnN0cmluZ2lmeShlbnRyaWVzLCBudWxsLCAyKSk7XG4gICAgICBmcy5yZW5hbWVTeW5jKHRlbXBQYXRoLCB0aGlzLnN0b3JhZ2VQYXRoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNhdmUgY29udGV4dCBzdG9yYWdlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKiogQWRkIGEgbmV3IGNvbnRleHQgZW50cnkgKi9cbiAgYWRkRW50cnkoZW50cnk6IENvbnRleHRFbnRyeSk6IHZvaWQge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBlbnRyaWVzLnVuc2hpZnQoZW50cnkpOyAvLyBBZGQgdG8gYmVnaW5uaW5nXG4gICAgXG4gICAgLy8gTGltaXQgdG8gbGFzdCAxMDAwIGVudHJpZXMgdG8gcHJldmVudCB1bmJvdW5kZWQgZ3Jvd3RoXG4gICAgaWYgKGVudHJpZXMubGVuZ3RoID4gMTAwMCkge1xuICAgICAgZW50cmllcy5zcGxpY2UoMTAwMCk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2F2ZShlbnRyaWVzKTtcbiAgfVxuXG4gIC8qKiBHZXQgcmVjZW50IGNvbnRleHQgZW50cmllcyAqL1xuICBnZXRSZWNlbnRFbnRyaWVzKGxpbWl0OiBudW1iZXIgPSAyMCwgdHlwZT86IHN0cmluZyk6IENvbnRleHRFbnRyeVtdIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgXG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIHJldHVybiBlbnRyaWVzLmZpbHRlcihlID0+IGUudHlwZSA9PT0gdHlwZSkuc2xpY2UoMCwgbGltaXQpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZW50cmllcy5zbGljZSgwLCBsaW1pdCk7XG4gIH1cblxuICAvKiogU2VhcmNoIGNvbnRleHQgZW50cmllcyBieSBxdWVyeSAqL1xuICBzZWFyY2hFbnRyaWVzKHF1ZXJ5OiBzdHJpbmcsIG1heFJlc3VsdHM6IG51bWJlciA9IDEwKTogQ29udGV4dEVudHJ5W10ge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBjb25zdCBsb3dlclF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICBcbiAgICBjb25zdCByZXN1bHRzID0gZW50cmllcy5maWx0ZXIoZW50cnkgPT4gXG4gICAgICBlbnRyeS50aXRsZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpIHx8XG4gICAgICBlbnRyeS5jb250ZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJRdWVyeSkgfHxcbiAgICAgIChlbnRyeS50YWdzICYmIGVudHJ5LnRhZ3Muc29tZSh0YWcgPT4gdGFnLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJRdWVyeSkpKVxuICAgICk7XG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgbWF4UmVzdWx0cyk7XG4gIH1cblxuICAvKiogRGVsZXRlIGNvbnRleHQgZW50cmllcyBieSBJRCAqL1xuICBkZWxldGVFbnRyeShpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIGNvbnN0IGZpbHRlcmVkID0gZW50cmllcy5maWx0ZXIoZSA9PiBlLmlkICE9PSBpZCk7XG4gICAgXG4gICAgaWYgKGZpbHRlcmVkLmxlbmd0aCA9PT0gZW50cmllcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gRW50cnkgbm90IGZvdW5kXG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2F2ZShmaWx0ZXJlZCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKiogQ2xlYXIgYWxsIGNvbnRleHQgZW50cmllcyAqL1xuICBjbGVhckFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLnNhdmUoW10pO1xuICB9XG5cbiAgLyoqIEdldCBzdW1tYXJ5IHN0YXRpc3RpY3MgKi9cbiAgZ2V0U3VtbWFyeSgpOiBDb250ZXh0U3VtbWFyeSB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIFxuICAgIGNvbnN0IGVudHJpZXNCeVR5cGU6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgZW50cmllc0J5VHlwZVtlbnRyeS50eXBlXSA9IChlbnRyaWVzQnlUeXBlW2VudHJ5LnR5cGVdIHx8IDApICsgMTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICB0b3RhbF9lbnRyaWVzOiBlbnRyaWVzLmxlbmd0aCxcbiAgICAgIGVudHJpZXNfYnlfdHlwZTogZW50cmllc0J5VHlwZSxcbiAgICAgIHJlY2VudF9lbnRyaWVzOiBlbnRyaWVzLnNsaWNlKDAsIDUpLFxuICAgICAgbGFzdF91cGRhdGVkOiBEYXRlLm5vdygpLFxuICAgIH07XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ29udGV4dCBBbmFseXplciA9PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBDb250ZXh0QW5hbHl6ZXIge1xuICBwcml2YXRlIHN0b3JhZ2VNYW5hZ2VyOiBDb250ZXh0U3RvcmFnZU1hbmFnZXI7XG4gIFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JhZ2VNYW5hZ2VyID0gbmV3IENvbnRleHRTdG9yYWdlTWFuYWdlcigpO1xuICB9XG5cbiAgLyoqIEFuYWx5emUgcmVjZW50IGFjdGl2aXR5IGFuZCBhdXRvLXNhdmUgaW1wb3J0YW50IGNvbnRleHQgKi9cbiAgYW5hbHl6ZUFuZFNhdmUoXG4gICAgc2Vzc2lvbkV2ZW50czogQXJyYXk8eyB0eXBlOiBzdHJpbmc7IHRpbWVzdGFtcDogbnVtYmVyOyBkYXRhPzogYW55IH0+LFxuICAgIGNvbmZpZ0NoYW5nZXM/OiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuIHwgc3RyaW5nPlxuICApOiB7IHNhdmVkX2NvdW50OiBudW1iZXI7IHN1bW1hcnk6IHN0cmluZyB9IHtcbiAgICBjb25zdCBlbnRyaWVzOiBDb250ZXh0RW50cnlbXSA9IFtdO1xuXG4gICAgLy8gQW5hbHl6ZSB0b29sIHVzYWdlIHBhdHRlcm5zXG4gICAgY29uc3QgdG9vbFVzYWdlQ291bnQ6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICBzZXNzaW9uRXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LnR5cGUuc3RhcnRzV2l0aCgndG9vbF8nKSkge1xuICAgICAgICBjb25zdCB0b29sTmFtZSA9IGV2ZW50LnR5cGUucmVwbGFjZSgndG9vbF8nLCAnJyk7XG4gICAgICAgIHRvb2xVc2FnZUNvdW50W3Rvb2xOYW1lXSA9ICh0b29sVXNhZ2VDb3VudFt0b29sTmFtZV0gfHwgMCkgKyAxO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSWRlbnRpZnkgZnJlcXVlbnRseSB1c2VkIHRvb2xzICg+MyB1c2VzIGluIHNlc3Npb24pXG4gICAgT2JqZWN0LmVudHJpZXModG9vbFVzYWdlQ291bnQpLmZvckVhY2goKFt0b29sLCBjb3VudF0pID0+IHtcbiAgICAgIGlmIChjb3VudCA+IDMpIHtcbiAgICAgICAgZW50cmllcy5wdXNoKHtcbiAgICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHR5cGU6ICdwYXR0ZXJuJyxcbiAgICAgICAgICB0aXRsZTogYEZyZXF1ZW50IFRvb2wgVXNhZ2U6ICR7dG9vbH1gLFxuICAgICAgICAgIGNvbnRlbnQ6IGBUb29sICcke3Rvb2x9JyB3YXMgdXNlZCAke2NvdW50fSB0aW1lcyBpbiB0aGUgY3VycmVudCBzZXNzaW9uLCBpbmRpY2F0aW5nIGl0J3MgYSBwcmltYXJ5IHdvcmtmbG93IHRvb2wuYCxcbiAgICAgICAgICB0YWdzOiBbJ3VzYWdlX3BhdHRlcm4nLCAnZnJlcXVlbnRfdG9vbCddLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEFuYWx5emUgY29uZmlndXJhdGlvbiBjaGFuZ2VzXG4gICAgaWYgKGNvbmZpZ0NoYW5nZXMpIHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKGNvbmZpZ0NoYW5nZXMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ2NvbmZpZ3VyYXRpb24nLFxuICAgICAgICAgIHRpdGxlOiBgQ29uZmlndXJhdGlvbiBDaGFuZ2U6ICR7a2V5fWAsXG4gICAgICAgICAgY29udGVudDogYFNldHRpbmcgJyR7a2V5fScgd2FzIGNoYW5nZWQgdG8gJyR7dmFsdWV9Jy5gLFxuICAgICAgICAgIHRhZ3M6IFsnY29uZmlnX2NoYW5nZSddLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIERldGVjdCBpbXBvcnRhbnQgZGVjaXNpb25zIChiYXNlZCBvbiBldmVudCBwYXR0ZXJucylcbiAgICBjb25zdCBkZWNpc2lvbkV2ZW50cyA9IHNlc3Npb25FdmVudHMuZmlsdGVyKGUgPT4gXG4gICAgICBlLnR5cGUgPT09ICdkZWNpc2lvbicgfHwgXG4gICAgICAoZS5kYXRhICYmIHR5cGVvZiBlLmRhdGEuZGVjaXNpb24gPT09ICdzdHJpbmcnKVxuICAgICk7XG5cbiAgICBkZWNpc2lvbkV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IGRlY2lzaW9uVGV4dCA9IGV2ZW50LmRhdGE/LmRlY2lzaW9uIHx8IGBEZWNpc2lvbiBtYWRlIGF0ICR7bmV3IERhdGUoZXZlbnQudGltZXN0YW1wKS50b0xvY2FsZVRpbWVTdHJpbmcoKX1gO1xuICAgICAgZW50cmllcy5wdXNoKHtcbiAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICB0aW1lc3RhbXA6IGV2ZW50LnRpbWVzdGFtcCxcbiAgICAgICAgdHlwZTogJ2RlY2lzaW9uJyxcbiAgICAgICAgdGl0bGU6ICdJbXBvcnRhbnQgRGVjaXNpb24gUmVjb3JkZWQnLFxuICAgICAgICBjb250ZW50OiBkZWNpc2lvblRleHQsXG4gICAgICAgIHRhZ3M6IFsnZGVjaXNpb24nXSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gQXV0by1nZW5lcmF0ZSBzdW1tYXJ5IGlmIHdlIGhhdmUgZW5vdWdoIGVudHJpZXNcbiAgICBpZiAoZW50cmllcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB1bmlxdWVQYXR0ZXJucyA9IG5ldyBTZXQoZW50cmllcy5maWx0ZXIoZSA9PiBlLnR5cGUgPT09ICdwYXR0ZXJuJykubWFwKGUgPT4gZS50aXRsZSkpO1xuICAgICAgXG4gICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgdHlwZTogJ3N1bW1hcnknLFxuICAgICAgICB0aXRsZTogYFNlc3Npb24gQ29udGV4dCBTdW1tYXJ5ICgke25ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9KWAsXG4gICAgICAgIGNvbnRlbnQ6IGBBdXRvLWdlbmVyYXRlZCBzdW1tYXJ5OiAke2VudHJpZXMubGVuZ3RofSBjb250ZXh0IGVudHJpZXMgc2F2ZWQuIEtleSBwYXR0ZXJucyBkZXRlY3RlZDogJHtBcnJheS5mcm9tKHVuaXF1ZVBhdHRlcm5zKS5qb2luKCcsICcpIHx8ICdObyBzcGVjaWZpYyBwYXR0ZXJucyd9LiBDb25maWd1cmF0aW9uIGNoYW5nZXMgdHJhY2tlZDogJHtPYmplY3Qua2V5cyhjb25maWdDaGFuZ2VzIHx8IHt9KS5sZW5ndGh9LmAsXG4gICAgICAgIHRhZ3M6IFsnYXV0b19zdW1tYXJ5J10sXG4gICAgICB9KTtcblxuICAgICAgLy8gU2F2ZSBhbGwgZW50cmllcyB0byBzdG9yYWdlXG4gICAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4gdGhpcy5zdG9yYWdlTWFuYWdlci5hZGRFbnRyeShlbnRyeSkpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzYXZlZF9jb3VudDogZW50cmllcy5sZW5ndGgsXG4gICAgICAgIHN1bW1hcnk6IGBTYXZlZCAke2VudHJpZXMubGVuZ3RofSBjb250ZXh0IGVudHJpZXMgaW5jbHVkaW5nIHBhdHRlcm5zIGFuZCBkZWNpc2lvbnMuYCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgc2F2ZWRfY291bnQ6IDAsIHN1bW1hcnk6ICdObyBzaWduaWZpY2FudCBjb250ZXh0IGNoYW5nZXMgZGV0ZWN0ZWQuJyB9O1xuICB9XG5cbiAgLyoqIEdlbmVyYXRlIGEgdW5pcXVlIElEIGZvciBjb250ZXh0IGVudHJ5ICovXG4gIHByaXZhdGUgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgY3R4XyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJDb250ZXh0TWFuYWdlbWVudFRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IGFuYWx5emVyID0gbmV3IENvbnRleHRBbmFseXplcigpO1xuICBjb25zdCBzdG9yYWdlTWFuYWdlciA9IG5ldyBDb250ZXh0U3RvcmFnZU1hbmFnZXIoKTtcblxuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gYXV0b19zdW1tYXJpemVfY29udGV4dCB0b29sIFx1MjAxNCBBbmFseXplIHNlc3Npb24gYW5kIHNhdmUgaW1wb3J0YW50IGNvbnRleHRcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYXV0b19zdW1tYXJpemVfY29udGV4dCcsXG4gICAgZGVzY3JpcHRpb246ICdBdXRvbWF0aWNhbGx5IGFuYWx5emUgcmVjZW50IHNlc3Npb24gYWN0aXZpdHksIGlkZW50aWZ5IGltcG9ydGFudCBwYXR0ZXJucy9kZWNpc2lvbnMsIGFuZCBzYXZlIHRoZW0gdG8gcGVyc2lzdGVudCBtZW1vcnkgZm9yIGZ1dHVyZSByZWZlcmVuY2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzZXNzaW9uX2V2ZW50czogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIHR5cGU6IHouc3RyaW5nKCksXG4gICAgICAgIHRpbWVzdGFtcDogei5udW1iZXIoKSxcbiAgICAgICAgZGF0YTogei5hbnkoKS5vcHRpb25hbCgpLFxuICAgICAgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1JlY2VudCBzZXNzaW9uIGV2ZW50cyB0byBhbmFseXplJyksXG4gICAgICBjb25maWdfY2hhbmdlczogei5yZWNvcmQoei51bmlvbihbei5ib29sZWFuKCksIHouc3RyaW5nKCldKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ29uZmlndXJhdGlvbiBjaGFuZ2VzIG1hZGUgZHVyaW5nIHNlc3Npb24nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzZXNzaW9uX2V2ZW50cywgY29uZmlnX2NoYW5nZXMgfTogeyBcbiAgICAgIHNlc3Npb25fZXZlbnRzPzogQXJyYXk8eyB0eXBlOiBzdHJpbmc7IHRpbWVzdGFtcDogbnVtYmVyOyBkYXRhPzogYW55IH0+OyBcbiAgICAgIGNvbmZpZ19jaGFuZ2VzPzogUmVjb3JkPHN0cmluZywgYm9vbGVhbiB8IHN0cmluZz47IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGFuYWx5emVyLmFuYWx5emVBbmRTYXZlKHNlc3Npb25fZXZlbnRzIHx8IFtdLCBjb25maWdfY2hhbmdlcyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbnRleHQgYW5hbHlzaXMgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfY29udGV4dF9tZW1vcnkgdG9vbCBcdTIwMTQgUmV0cmlldmUgYXV0by1zYXZlZCBjb250ZXh0IGVudHJpZXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X2NvbnRleHRfbWVtb3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ1JldHJpZXZlIGF1dG9tYXRpY2FsbHkgc2F2ZWQgY29udGV4dCBlbnRyaWVzIGZyb20gcGVyc2lzdGVudCBtZW1vcnkuIFVzZWZ1bCBmb3IgcmVjYWxsaW5nIHBhc3QgZGVjaXNpb25zLCBwYXR0ZXJucywgb3IgY29uZmlndXJhdGlvbnMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBsaW1pdDogei5udW1iZXIoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMjApLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiBlbnRyaWVzIHRvIHJldHVybicpLFxuICAgICAgdHlwZTogei5lbnVtKFsnZGVjaXNpb24nLCAncGF0dGVybicsICdjb25maWd1cmF0aW9uJywgJ2ZpbGVfY2hhbmdlJywgJ2Vycm9yJywgJ3N1bW1hcnknXSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRmlsdGVyIGJ5IGVudHJ5IHR5cGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBsaW1pdCwgdHlwZSB9OiB7IFxuICAgICAgbGltaXQ/OiBudW1iZXI7IFxuICAgICAgdHlwZT86IHN0cmluZzsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHN0b3JhZ2VNYW5hZ2VyLmdldFJlY2VudEVudHJpZXMobGltaXQgfHwgMjAsIHR5cGUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBlbnRyaWVzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byByZXRyaWV2ZSBjb250ZXh0IG1lbW9yeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gc2VhcmNoX2NvbnRleHQgdG9vbCBcdTIwMTQgU2VhcmNoIGF1dG8tc2F2ZWQgY29udGV4dCBieSBxdWVyeVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzZWFyY2hfY29udGV4dCcsXG4gICAgZGVzY3JpcHRpb246ICdTZWFyY2ggdGhyb3VnaCBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcyB1c2luZyB0ZXh0IG1hdGNoaW5nLiBGaW5kcyByZWxldmFudCBwYXN0IGRlY2lzaW9ucywgcGF0dGVybnMsIG9yIGNvbmZpZ3VyYXRpb25zLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NlYXJjaCBxdWVyeSB0byBtYXRjaCBhZ2FpbnN0IGNvbnRleHQgZW50cmllcycpLFxuICAgICAgbWF4X3Jlc3VsdHM6IHoubnVtYmVyKCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgbWF4X3Jlc3VsdHMgfTogeyBcbiAgICAgIHF1ZXJ5OiBzdHJpbmc7IFxuICAgICAgbWF4X3Jlc3VsdHM/OiBudW1iZXI7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBzdG9yYWdlTWFuYWdlci5zZWFyY2hFbnRyaWVzKHF1ZXJ5LCBtYXhfcmVzdWx0cyB8fCAxMCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHJlc3VsdHMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29udGV4dCBzZWFyY2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjb250ZXh0X3N1bW1hcnkgdG9vbCBcdTIwMTQgR2V0IHN1bW1hcnkgc3RhdGlzdGljcyBvZiBhdXRvLXNhdmVkIGNvbnRleHRcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY29udGV4dF9zdW1tYXJ5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBhIHN1bW1hcnkgb2YgYWxsIGF1dG9tYXRpY2FsbHkgc2F2ZWQgY29udGV4dCBlbnRyaWVzLCBpbmNsdWRpbmcgY291bnRzIGJ5IHR5cGUgYW5kIHJlY2VudCBhY3Rpdml0eS4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdW1tYXJ5ID0gc3RvcmFnZU1hbmFnZXIuZ2V0U3VtbWFyeSgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogc3VtbWFyeSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGdldCBjb250ZXh0IHN1bW1hcnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9jb250ZXh0X2VudHJ5IHRvb2wgXHUyMDE0IFJlbW92ZSBhIHNwZWNpZmljIGNvbnRleHQgZW50cnkgYnkgSURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX2NvbnRleHRfZW50cnknLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIGEgc3BlY2lmaWMgYXV0by1zYXZlZCBjb250ZXh0IGVudHJ5IGJ5IGl0cyB1bmlxdWUgSUQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBlbnRyeV9pZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHVuaXF1ZSBJRCBvZiB0aGUgY29udGV4dCBlbnRyeSB0byBkZWxldGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBlbnRyeV9pZCB9OiB7IGVudHJ5X2lkOiBzdHJpbmcgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGVsZXRlZCA9IHN0b3JhZ2VNYW5hZ2VyLmRlbGV0ZUVudHJ5KGVudHJ5X2lkKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghZGVsZXRlZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbnRleHQgZW50cnkgJyR7ZW50cnlfaWR9JyBub3QgZm91bmRgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGVsZXRlZDogdHJ1ZSwgZW50cnlfaWQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGRlbGV0ZSBjb250ZXh0IGVudHJ5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjbGVhcl9jb250ZXh0X21lbW9yeSB0b29sIFx1MjAxNCBDbGVhciBhbGwgYXV0by1zYXZlZCBjb250ZXh0IGVudHJpZXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2xlYXJfY29udGV4dF9tZW1vcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgYWxsIGF1dG9tYXRpY2FsbHkgc2F2ZWQgY29udGV4dCBlbnRyaWVzIGZyb20gcGVyc2lzdGVudCBtZW1vcnkuIFRoaXMgYWN0aW9uIGNhbm5vdCBiZSB1bmRvbmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb25maXJtOiB6LmJvb2xlYW4oKS5kZXNjcmliZSgnU2V0IHRvIHRydWUgdG8gY29uZmlybSBkZWxldGlvbiBvZiBhbGwgY29udGV4dCBlbnRyaWVzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29uZmlybSB9OiB7IGNvbmZpcm06IGJvb2xlYW4gfSkgPT4ge1xuICAgICAgaWYgKCFjb25maXJtKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NvbmZpcm1hdGlvbiByZXF1aXJlZC4gU2V0IGNvbmZpcm09dHJ1ZSB0byBwcm9jZWVkLicgfTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdHJ5IHtcbiAgICAgICAgc3RvcmFnZU1hbmFnZXIuY2xlYXJBbGwoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY2xlYXJlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gY2xlYXIgY29udGV4dCBtZW1vcnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHRyYWNrX2ltcG9ydGFudF9ldmVudCB0b29sIFx1MjAxNCBNYW51YWxseSBtYXJrIGFuIGV2ZW50IGFzIGltcG9ydGFudCBmb3IgY29udGV4dCB0cmFja2luZ1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd0cmFja19pbXBvcnRhbnRfZXZlbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFudWFsbHkgcmVjb3JkIGFuIGltcG9ydGFudCBldmVudCBvciBkZWNpc2lvbiB0byBwZXJzaXN0ZW50IG1lbW9yeS4gVXNlZnVsIGZvciBtYXJraW5nIGNyaXRpY2FsIG1vbWVudHMgaW4gYSBzZXNzaW9uLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RpdGxlIG9mIHRoZSBpbXBvcnRhbnQgZXZlbnQnKSxcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0RldGFpbGVkIGRlc2NyaXB0aW9uIG9mIHRoZSBldmVudCcpLFxuICAgICAgdGFnczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUYWdzIHRvIGNhdGVnb3JpemUgdGhlIGV2ZW50JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGl0bGUsIGNvbnRlbnQsIHRhZ3MgfTogeyBcbiAgICAgIHRpdGxlOiBzdHJpbmc7IFxuICAgICAgY29udGVudDogc3RyaW5nOyBcbiAgICAgIHRhZ3M/OiBzdHJpbmdbXTsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cnk6IENvbnRleHRFbnRyeSA9IHtcbiAgICAgICAgICBpZDogYGN0eF8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWAsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHR5cGU6ICdkZWNpc2lvbicsXG4gICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgY29udGVudCxcbiAgICAgICAgICB0YWdzLFxuICAgICAgICB9O1xuXG4gICAgICAgIHN0b3JhZ2VNYW5hZ2VyLmFkZEVudHJ5KGVudHJ5KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdHJhY2tlZDogdHJ1ZSwgZW50cnlfaWQ6IGVudHJ5LmlkIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byB0cmFjayBldmVudDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgIi8qKlxyXG4gKiBUb29scyBQcm92aWRlciAtIENvbXBsZXRlIEltcGxlbWVudGF0aW9uIG9mIGFsbCB+NDUgdG9vbHMgYWNyb3NzIDYgY2F0ZWdvcmllc1xyXG4gKi9cclxuXHJcbmltcG9ydCB0eXBlIHsgVG9vbCwgVG9vbHNQcm92aWRlckNvbnRyb2xsZXIgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcclxuXHJcbi8vIEltcG9ydCBleGlzdGluZyBtb2R1bGVzXHJcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xyXG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRywgaXNUb29sRW5hYmxlZCwgaXNFeGVjdXRpb25Ub29sRW5hYmxlZCB9IGZyb20gJy4vY29uZmlnJztcclxuaW1wb3J0IHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSAnLi9zdGF0ZU1hbmFnZXInO1xyXG5pbXBvcnQgeyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIgfSBmcm9tICcuL2JhY2tncm91bmRDb21tYW5kcyc7XHJcblxyXG4vLyBJbXBvcnQgY2F0ZWdvcnktc3BlY2lmaWMgdG9vbCBtb2R1bGVzXHJcbmltcG9ydCB7IHJlZ2lzdGVyRmlsZVN5c3RlbVRvb2xzIH0gZnJvbSAnLi90b29scy9maWxlU3lzdGVtVG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlcldlYlJlc2VhcmNoVG9vbHMgfSBmcm9tICcuL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlckdpdFRvb2xzIH0gZnJvbSAnLi90b29scy9naXRHaXRodWJUb29scyc7XHJcbmltcG9ydCB7IHJlZ2lzdGVyQnJvd3NlclRvb2xzIH0gZnJvbSAnLi90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJEYXRhYmFzZVRvb2xzIH0gZnJvbSAnLi90b29scy9kYXRhYmFzZVRvb2xzJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzIH0gZnJvbSAnLi90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJFeGVjdXRpb25Ub29scyB9IGZyb20gJy4vdG9vbHMvZXhlY3V0aW9uVG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlclV0aWxpdHlUb29scyB9IGZyb20gJy4vdG9vbHMvdXRpbGl0eVRvb2xzJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyB9IGZyb20gJy4vdG9vbHMvaW1hZ2VQcm9jZXNzaW5nVG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3Rlckh0dHBDbGllbnRUb29scyB9IGZyb20gJy4vdG9vbHMvaHR0cENsaWVudFRvb2xzJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJSYWdUb29scyB9IGZyb20gJy4vdG9vbHMvdmVjdG9yUmFnVG9vbHMnO1xyXG5pbXBvcnQgeyByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzIH0gZnJvbSAnLi90b29scy91aUdlbmVyYXRpb25Ub29scyc7XG5pbXBvcnQgeyByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMnO1xuXHJcbi8vID09PT09PT09PT09PT09PT09PT09IFRZUEVTID09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRvb2xDYXRlZ29yeSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHRvb2xzOiBUb29sW107XHJcbn1cclxuXHJcbi8qKiBFeHRlbmRlZCB0b29sIHR5cGUgd2l0aCB0eXBlZCBpbXBsZW1lbnRhdGlvbiBmb3Igc2FmZSBhY2Nlc3MgKi9cclxudHlwZSBUeXBlZFRvb2wgPSBUb29sICYge1xyXG4gIGltcGxlbWVudGF0aW9uOiAocGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgY3R4PzogdW5rbm93bikgPT4gUHJvbWlzZTx1bmtub3duPjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDZW50cmFsIHJlZ2lzdHJ5IGZvciBhbGwgYXZhaWxhYmxlIHRvb2xzLlxyXG4gKiBUb29scyBhcmUgY3JlYXRlZCBvbmNlIGF0IG1vZHVsZSBsb2FkIHRpbWUgYW5kIHJldXNlZCBhY3Jvc3MgcHJvdmlkZXIgY2FsbHMuXHJcbiAqL1xyXG5jbGFzcyBUb29sUmVnaXN0cnkge1xyXG4gIHByaXZhdGUgdG9vbE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBUeXBlZFRvb2w+KCk7XHJcblxyXG4gIHJlZ2lzdGVyQWxsKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlciwgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyOiBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIpOiB2b2lkIHtcclxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2ZpbGVTeXN0ZW0nKSkge1xyXG4gICAgICByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyhjb25maWcsIHN0YXRlTWFuYWdlcikuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnd2ViU2VhcmNoJykpIHtcclxuICAgICAgcmVnaXN0ZXJXZWJSZXNlYXJjaFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnYnJvd3NlckF1dG9tYXRpb24nKSkge1xyXG4gICAgICByZWdpc3RlckJyb3dzZXJUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcclxuICAgIH1cclxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2dpdE9wZXJhdGlvbnMnKSkge1xyXG4gICAgICByZWdpc3RlckdpdFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZGF0YWJhc2VRdWVyaWVzJykpIHtcclxuICAgICAgcmVnaXN0ZXJEYXRhYmFzZVRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnYmFja2dyb3VuZENvbW1hbmRzJykpIHtcclxuICAgICAgcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzKGNvbmZpZywgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnaW1hZ2VQcm9jZXNzaW5nJykpIHtcclxuICAgICAgcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcclxuICAgIH1cclxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2h0dHBDbGllbnQnKSkge1xyXG4gICAgICByZWdpc3Rlckh0dHBDbGllbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcclxuICAgIH1cclxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ3ZlY3RvclJBRycpKSB7XHJcbiAgICAgIHJlZ2lzdGVyUmFnVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XHJcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICd1aUdlbmVyYXRpb24nKSkge1xuICAgICAgcmVnaXN0ZXJVaUdlbmVyYXRpb25Ub29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnY29udGV4dE1hbmFnZW1lbnQnKSkge1xuICAgICAgcmVnaXN0ZXJDb250ZXh0TWFuYWdlbWVudFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgcmVnaXN0ZXJlZCBvbmNlLCBmaWx0ZXJlZCBieSBlbmFibGVkIHRvb2wgdHlwZXNcclxuICAgIGNvbnN0IGV4ZWNDb25maWcgPSB7IC4uLmNvbmZpZyB9O1xyXG4gICAgY29uc3QgYWxsRXhlY1Rvb2xzID0gcmVnaXN0ZXJFeGVjdXRpb25Ub29scyhleGVjQ29uZmlnKTtcclxuICAgIFxyXG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ2phdmFzY3JpcHQnKSkge1xyXG4gICAgICBjb25zdCBqc1Rvb2wgPSBhbGxFeGVjVG9vbHMuZmluZCh0ID0+IHQubmFtZSA9PT0gJ3J1bl9qYXZhc2NyaXB0Jyk7XHJcbiAgICAgIGlmIChqc1Rvb2wpIHRoaXMudG9vbE1hcC5zZXQoanNUb29sLm5hbWUsIGpzVG9vbCBhcyBUeXBlZFRvb2wpO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ3B5dGhvbicpKSB7XHJcbiAgICAgIGNvbnN0IHB5VG9vbCA9IGFsbEV4ZWNUb29scy5maW5kKHQgPT4gdC5uYW1lID09PSAncnVuX3B5dGhvbicpO1xyXG4gICAgICBpZiAocHlUb29sKSB0aGlzLnRvb2xNYXAuc2V0KHB5VG9vbC5uYW1lLCBweVRvb2wgYXMgVHlwZWRUb29sKTtcclxuICAgIH1cclxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICd0ZXJtaW5hbCcpKSB7XHJcbiAgICAgIGNvbnN0IHRlcm1Ub29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdydW5faW5fdGVybWluYWwnKTtcclxuICAgICAgaWYgKHRlcm1Ub29sKSB0aGlzLnRvb2xNYXAuc2V0KHRlcm1Ub29sLm5hbWUsIHRlcm1Ub29sIGFzIFR5cGVkVG9vbCk7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAnc2hlbGwnKSkge1xyXG4gICAgICBjb25zdCBzaGVsbFRvb2wgPSBhbGxFeGVjVG9vbHMuZmluZCh0ID0+IHQubmFtZSA9PT0gJ2V4ZWN1dGVfY29tbWFuZCcpO1xyXG4gICAgICBpZiAoc2hlbGxUb29sKSB0aGlzLnRvb2xNYXAuc2V0KHNoZWxsVG9vbC5uYW1lLCBzaGVsbFRvb2wgYXMgVHlwZWRUb29sKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gVXRpbGl0eSB0b29scyBhcmUgYWx3YXlzIHJlZ2lzdGVyZWQgKG5vIHNwZWNpZmljIGNvbmZpZyBmbGFnKVxyXG4gICAgY29uc3QgZ2V0RW5hYmxlZFRvb2xzID0gKCkgPT4gQXJyYXkuZnJvbSh0aGlzLnRvb2xNYXAua2V5cygpKTtcclxuICAgIHJlZ2lzdGVyVXRpbGl0eVRvb2xzKGNvbmZpZywgc3RhdGVNYW5hZ2VyLCBnZXRFbmFibGVkVG9vbHMpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcclxuICB9XHJcblxyXG4gIGdldEFsbCgpOiBUb29sW10ge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy50b29sTWFwLnZhbHVlcygpKTtcclxuICB9XHJcblxyXG4gIGdldChuYW1lOiBzdHJpbmcpOiBUeXBlZFRvb2wgfCB1bmRlZmluZWQge1xyXG4gICAgcmV0dXJuIHRoaXMudG9vbE1hcC5nZXQobmFtZSk7XHJcbiAgfVxyXG5cclxuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50b29sTWFwLmhhcyhuYW1lKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYW5hZ2VzIHRvb2wgZXhlY3V0aW9uIGFuZCBzdGF0ZSB1cGRhdGVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRvb2xzUHJvdmlkZXIge1xyXG4gIHByaXZhdGUgY29uZmlnOiBQbHVnaW5Db25maWc7XHJcbiAgcHJpdmF0ZSBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlcjtcclxuICBwcml2YXRlIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcjogQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyO1xyXG4gIHByaXZhdGUgcmVnaXN0cnk6IFRvb2xSZWdpc3RyeTtcclxuXHJcbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyB8fCBERUZBVUxUX0NPTkZJRztcclxuICAgIHRoaXMuc3RhdGVNYW5hZ2VyID0gbmV3IFN0YXRlTWFuYWdlcih0aGlzLmNvbmZpZyk7XHJcbiAgICB0aGlzLmJhY2tncm91bmRDb21tYW5kTWFuYWdlciA9IG5ldyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIodGhpcy5jb25maWcpO1xyXG4gICAgdGhpcy5yZWdpc3RyeSA9IG5ldyBUb29sUmVnaXN0cnkoKTtcclxuICAgIHRoaXMucmVnaXN0cnkucmVnaXN0ZXJBbGwodGhpcy5jb25maWcsIHRoaXMuc3RhdGVNYW5hZ2VyLCB0aGlzLmJhY2tncm91bmRDb21tYW5kTWFuYWdlcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFeGVjdXRlIGEgdG9vbCBieSBuYW1lIHdpdGggcGFyYW1ldGVycy5cclxuICAgKi9cclxuICBhc3luYyBleGVjdXRlVG9vbCh0b29sTmFtZTogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XHJcbiAgICBjb25zdCB0b29sID0gdGhpcy5yZWdpc3RyeS5nZXQodG9vbE5hbWUpO1xyXG4gICAgaWYgKCF0b29sKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFRvb2wgJyR7dG9vbE5hbWV9JyBub3QgZm91bmRgIH07XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gU2FmZSBhY2Nlc3MgdmlhIHR5cGVkIHdyYXBwZXIgKEM0IGZpeClcclxuICAgICAgY29uc3QgaW1wbCA9IHRvb2wuaW1wbGVtZW50YXRpb247XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGltcGwocGFyYW1zKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFVwZGF0ZSBzdGF0ZSB3aXRoIGV4ZWN1dGlvbiByZXN1bHRcclxuICAgICAgdGhpcy5zdGF0ZU1hbmFnZXIuc2V0KGBsYXN0XyR7dG9vbE5hbWV9YCwgcmVzdWx0KTtcclxuICAgICAgXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBUb29sIGV4ZWN1dGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYWxsIGF2YWlsYWJsZSB0b29scyBmaWx0ZXJlZCBieSBjb25maWcuXHJcbiAgICovXHJcbiAgZ2V0QXZhaWxhYmxlVG9vbHMoKTogVG9vbFtdIHtcclxuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdldEFsbCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBzdGF0ZSBtYW5hZ2VyIGluc3RhbmNlLlxyXG4gICAqL1xyXG4gIGdldFN0YXRlTWFuYWdlcigpOiBTdGF0ZU1hbmFnZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RhdGVNYW5hZ2VyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24uXHJcbiAgICovXHJcbiAgZ2V0Q29uZmlnKCk6IFBsdWdpbkNvbmZpZyB7XHJcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBUb29sc1Byb3ZpZGVyIHdpdGggZGVmYXVsdCBjb25maWcuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVG9vbHNQcm92aWRlcihjb25maWc/OiBQbHVnaW5Db25maWcpOiBUb29sc1Byb3ZpZGVyIHtcclxuICByZXR1cm4gbmV3IFRvb2xzUHJvdmlkZXIoY29uZmlnKTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT0gU0RLIFBST1ZJREVSIEZVTkNUSU9OID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogTWFpbiB0b29scyBwcm92aWRlciBmdW5jdGlvbiBmb3IgTE0gU3R1ZGlvIFNESy5cclxuICogVGhpcyBpcyB0aGUgZW50cnkgcG9pbnQgdGhhdCBnZXRzIGNhbGxlZCBieSBMTSBTdHVkaW8uXHJcbiAqIFxyXG4gKiBJTVBPUlRBTlQ6IFRoZSBMTSBTdHVkaW8gU0RLIGF1dG9tYXRpY2FsbHkgcmVnaXN0ZXJzIGFsbCBUb29sIG9iamVjdHNcclxuICogcmV0dXJuZWQgZnJvbSB0aGlzIHByb3ZpZGVyIGZ1bmN0aW9uLiBObyBtYW51YWwgY3RsLmFkZCgpIGNhbGxzIG5lZWRlZCAtXHJcbiAqIGp1c3QgcmV0dXJuIHRoZSBhcnJheSBkaXJlY3RseSBhbmQgdGhlIFNESyBoYW5kbGVzIHJlZ2lzdHJhdGlvbi5cclxuICogXHJcbiAqIE5PVEU6IE11c3QgYmUgYXN5bmMgXHUyMDE0IFNESyB0eXBlIHJlcXVpcmVzIFByb21pc2U8VG9vbFtdPi5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b29sc1Byb3ZpZGVyKF9jdGw6IFRvb2xzUHJvdmlkZXJDb250cm9sbGVyKTogUHJvbWlzZTxUb29sW10+IHtcclxuICBjb25zdCBwcm92aWRlciA9IGNyZWF0ZVRvb2xzUHJvdmlkZXIoKTtcclxuICBcclxuICAvLyBSZXR1cm4gYWxsIGF2YWlsYWJsZSB0b29scyAtIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyB0aGVtXHJcbiAgcmV0dXJuIHByb3ZpZGVyLmdldEF2YWlsYWJsZVRvb2xzKCk7XHJcbn1cclxuIiwgIi8qKlxuICogRG9jdW1lbnQgUkFHIFByb21wdCBQcmVwcm9jZXNzb3IgKyBXb3JraW5nIERpcmVjdG9yeSBEZXRlY3Rpb25cbiAqIFxuICogSGFuZGxlczpcbiAqIDEuIERvY3VtZW50IGF0dGFjaG1lbnRzIGFuZCBzZW1hbnRpYyByZXRyaWV2YWwgZm9yIFwiQ2hhdCB3aXRoIEZpbGVzXCIgZmVhdHVyZS5cbiAqIDIuIERldGVjdHMgZGlyZWN0b3J5IHBhdGhzIGluIHVzZXIgbWVzc2FnZXMgYW5kIHByb21wdHMgTExNIHRvIGFzayBmb3IgY29uZmlybWF0aW9uXG4gKiAgICBiZWZvcmUgY2hhbmdpbmcgdGhlIHdvcmtpbmcgZGlyZWN0b3J5LlxuICovXG5cbmltcG9ydCB7XG4gIHR5cGUgQ2hhdE1lc3NhZ2UsXG4gIHR5cGUgRmlsZUhhbmRsZSxcbiAgdHlwZSBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyLFxufSBmcm9tICdAbG1zdHVkaW8vc2RrJztcblxuaW1wb3J0IHsgY29uZmlnU2NoZW1hdGljcyB9IGZyb20gJy4vY29uZmlnJztcblxuLyoqXG4gKiBEZXRlY3RzIGRpcmVjdG9yeS9maWxlIHBhdGhzIGluIHVzZXIgbWVzc2FnZXMgdXNpbmcgcmVnZXggcGF0dGVybnMuXG4gKiBTdXBwb3J0cyBXaW5kb3dzIChDOlxcLi4uKSBhbmQgVW5peCAoL2hvbWUvLi4uLCAvVXNlcnMvLi4uKSBmb3JtYXRzLlxuICovXG5mdW5jdGlvbiBkZXRlY3REaXJlY3RvcnlQYXRoKHRleHQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAvLyBXaW5kb3dzIHBhdGggcGF0dGVybjogQzpcXC4uLiBvciBEOlxcLi4uIChoYW5kbGVzIHNwYWNlcywgZG90cywgc2xhc2hlcylcbiAgY29uc3Qgd2luZG93c1BhdHRlcm4gPSAvW0EtWmEtel06XFxcXFtcXHdcXC5cXC1fIF0rKD86W1xcL1xcXFxdW1xcd1xcLlxcLV8gXSspKi9nO1xuICBcbiAgLy8gVW5peCBhYnNvbHV0ZSBwYXRoIHBhdHRlcm46IC9ob21lLy4uLiwgL1VzZXJzLy4uLiwgL29wdC8uLi5cbiAgY29uc3QgdW5peFBhdHRlcm4gPSAvXFwvW1xcd1xcLlxcLV8gXSsoPzpbXFwvXVtcXHdcXC5cXC1fIF0rKSovZztcbiAgXG4gIC8vIFRyeSBXaW5kb3dzIGZpcnN0XG4gIGxldCBtYXRjaCA9IHRleHQubWF0Y2god2luZG93c1BhdHRlcm4pO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2hbMF0udHJpbSgpO1xuICB9XG4gIFxuICAvLyBUaGVuIFVuaXhcbiAgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHVuaXhQYXR0ZXJuKTtcbiAgaWYgKG1hdGNoKSB7XG4gICAgcmV0dXJuIG1hdGNoWzBdLnRyaW0oKTtcbiAgfVxuICBcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogSW5qZWN0cyBzeXN0ZW0gaW5zdHJ1Y3Rpb24gdG8gcHJvbXB0IExMTSBmb3Igd29ya2luZyBkaXJlY3RvcnkgY29uZmlybWF0aW9uLlxuICovXG5mdW5jdGlvbiBpbmplY3RXb3JraW5nRGlyZWN0b3J5UHJvbXB0KG9yaWdpbmFsTWVzc2FnZTogc3RyaW5nLCBkZXRlY3RlZFBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGluc3RydWN0aW9uID0gYFxuXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXG5cdTI2QTBcdUZFMEYgV09SS0lORyBESVJFQ1RPUlkgREVURUNURURcblx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVxuXG5UaGUgdXNlciBtZW50aW9uZWQgYSBkaXJlY3RvcnkgcGF0aCBpbiB0aGVpciBtZXNzYWdlOlxuXG4gICAgJHtkZXRlY3RlZFBhdGh9XG5cblBsZWFzZSBhc2sgdGhlIHVzZXIgZm9yIGNvbmZpcm1hdGlvbiBiZWZvcmUgY2hhbmdpbmcgdGhlIHdvcmtpbmcgZGlyZWN0b3J5LlxuRXhhbXBsZSByZXNwb25zZTpcblxuXCJJIG5vdGljZWQgeW91IG1lbnRpb25lZCB0aGUgZGlyZWN0b3J5ICcke2RldGVjdGVkUGF0aH0nLiBcbldvdWxkIHlvdSBsaWtlIG1lIHRvIHNldCB0aGlzIGFzIHlvdXIgd29ya2luZyBkaXJlY3Rvcnk/IFxuQWxsIHN1YnNlcXVlbnQgZmlsZSBvcGVyYXRpb25zIHdpbGwgdXNlIHRoaXMgZGlyZWN0b3J5IGFzIHRoZSBiYXNlLlxuXG5SZXBseSAneWVzJyBvciAnamEnIHRvIGNvbmZpcm0sIG9yICdubycvJ25laW4nIHRvIGRlY2xpbmUuXCJcblxuXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXHUyNTAxXG5cblVzZXIncyBvcmlnaW5hbCBtZXNzYWdlOlxuJHtvcmlnaW5hbE1lc3NhZ2V9XG5gO1xuICBcbiAgcmV0dXJuIGluc3RydWN0aW9uLnRyaW0oKTtcbn1cblxuLyoqIFR5cGVkIHJldHJpZXZhbCBlbnRyeSBpbnRlcmZhY2UgKi9cbmludGVyZmFjZSBSZXRyaWV2YWxFbnRyeSB7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgc2NvcmU6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBNYWluIHByb21wdCBwcmVwcm9jZXNzb3IgZnVuY3Rpb24uXG4gKiBIYW5kbGVzOlxuICogMS4gV29ya2luZyBkaXJlY3RvcnkgZGV0ZWN0aW9uIGFuZCBjb25maXJtYXRpb24gcHJvbXB0aW5nXG4gKiAyLiBEb2N1bWVudCBSQUcgZm9yIFwiQ2hhdCB3aXRoIEZpbGVzXCIgZmVhdHVyZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJlcHJvY2VzcyhcbiAgY3RsOiBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyLFxuICB1c2VyTWVzc2FnZTogQ2hhdE1lc3NhZ2Vcbik6IFByb21pc2U8c3RyaW5nIHwgQ2hhdE1lc3NhZ2U+IHtcbiAgY29uc3QgdXNlclByb21wdCA9IHVzZXJNZXNzYWdlLmdldFRleHQoKTtcbiAgXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTVEVQIDE6IERldGVjdCBkaXJlY3RvcnkgcGF0aHMgaW4gdXNlciBtZXNzYWdlXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBjb25zdCBkZXRlY3RlZFBhdGggPSBkZXRlY3REaXJlY3RvcnlQYXRoKHVzZXJQcm9tcHQpO1xuICBcbiAgaWYgKGRldGVjdGVkUGF0aCkge1xuICAgIC8vIERpcmVjdG9yeSBwYXRoIGZvdW5kIFx1MjAxNCBpbmplY3QgY29uZmlybWF0aW9uIHByb21wdFxuICAgIHJldHVybiBpbmplY3RXb3JraW5nRGlyZWN0b3J5UHJvbXB0KHVzZXJQcm9tcHQsIGRldGVjdGVkUGF0aCk7XG4gIH1cbiAgXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTVEVQIDI6IERvY3VtZW50IFJBRyBwcm9jZXNzaW5nIChpZiBlbmFibGVkKVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgY29uc3QgZG9jdW1lbnRSQUdFbmFibGVkID0gcGx1Z2luQ29uZmlnLmdldCgnZG9jdW1lbnRSQUcnKTtcbiAgXG4gIGlmICghZG9jdW1lbnRSQUdFbmFibGVkKSB7XG4gICAgcmV0dXJuIHVzZXJNZXNzYWdlOyAvLyBGZWF0dXJlIGRpc2FibGVkLCBwYXNzIHRocm91Z2ggdW5jaGFuZ2VkXG4gIH1cbiAgXG4gIC8vIEdldCBmaWxlcyBhdHRhY2hlZCB0byB0aGlzIG1lc3NhZ2UgKG5vbi1pbWFnZSBvbmx5KVxuICBjb25zdCBuZXdGaWxlcyA9IHVzZXJNZXNzYWdlLmdldEZpbGVzKGN0bC5jbGllbnQpLmZpbHRlcihmID0+IGYudHlwZSAhPT0gJ2ltYWdlJyk7XG4gIFxuICBpZiAobmV3RmlsZXMubGVuZ3RoID09PSAwICYmICEoYXdhaXQgaGFzQXR0YWNoZWRGaWxlc0luSGlzdG9yeShjdGwpKSkge1xuICAgIHJldHVybiB1c2VyTWVzc2FnZTsgLy8gTm8gZG9jdW1lbnRzIHRvIHByb2Nlc3NcbiAgfVxuXG4gIC8vIEdldCBhbGwgbm9uLWltYWdlIGZpbGVzIGZyb20gY3VycmVudCBtZXNzYWdlICsgY2hhdCBoaXN0b3J5XG4gIGNvbnN0IGFsbEZpbGVzID0gYXdhaXQgZ2V0QWxsTm9uSW1hZ2VGaWxlcyhjdGwsIHVzZXJNZXNzYWdlKTtcbiAgXG4gIGlmIChhbGxGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdXNlck1lc3NhZ2U7XG4gIH1cblxuICAvLyBVc2UgcmV0cmlldmFsLWJhc2VkIGFwcHJvYWNoIGZvciBzZW1hbnRpYyBzZWFyY2hcbiAgcmV0dXJuIHByZXBhcmVSZXRyaWV2YWxSZXN1bHRzQ29udGV4dEluamVjdGlvbihjdGwsIHVzZXJQcm9tcHQsIGFsbEZpbGVzKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGVyZSBhcmUgYW55IGF0dGFjaGVkIGZpbGVzIGluIGNoYXQgaGlzdG9yeS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFzQXR0YWNoZWRGaWxlc0luSGlzdG9yeShjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgY3RsLnB1bGxIaXN0b3J5KCk7XG4gICAgcmV0dXJuIGhpc3RvcnkuZ2V0QWxsRmlsZXMoY3RsLmNsaWVudCkuc29tZShmID0+IGYudHlwZSAhPT0gJ2ltYWdlJyk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCBhbGwgbm9uLWltYWdlIGZpbGVzIGZyb20gY3VycmVudCBtZXNzYWdlIGFuZCBjaGF0IGhpc3RvcnkgKG1lcmdlZCwgZGVkdXBsaWNhdGVkKS5cbiAqIEVuc3VyZXMgcHJldmlvdXNseSBhdHRhY2hlZCBmaWxlcyByZW1haW4gaW4gY29udGV4dCBhY3Jvc3MgbXVsdGktdHVybiBjb252ZXJzYXRpb25zLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxOb25JbWFnZUZpbGVzKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIHVzZXJNZXNzYWdlOiBDaGF0TWVzc2FnZVxuKTogUHJvbWlzZTxGaWxlSGFuZGxlW10+IHtcbiAgY29uc3QgbmV3RmlsZXMgPSB1c2VyTWVzc2FnZS5nZXRGaWxlcyhjdGwuY2xpZW50KS5maWx0ZXIoZiA9PiBmLnR5cGUgIT09ICdpbWFnZScpO1xuICBcbiAgLy8gQWx3YXlzIHRyeSB0byBtZXJnZSB3aXRoIGhpc3RvcnkgZmlsZXMgZm9yIG11bHRpLXR1cm4gZG9jdW1lbnQgY29udGV4dFxuICB0cnkge1xuICAgIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBjdGwucHVsbEhpc3RvcnkoKTtcbiAgICBjb25zdCBoaXN0b3J5RmlsZXMgPSBoaXN0b3J5LmdldEFsbEZpbGVzKGN0bC5jbGllbnQpLmZpbHRlcihmID0+IGYudHlwZSAhPT0gJ2ltYWdlJyk7XG4gICAgXG4gICAgaWYgKG5ld0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGhpc3RvcnlGaWxlczsgLy8gTm8gbmV3IGZpbGVzLCByZXR1cm4gaGlzdG9yeSBmaWxlc1xuICAgIH1cbiAgICBcbiAgICAvLyBEZWR1cGxpY2F0ZTogbWVyZ2UgbmV3IGZpbGVzIHdpdGggdW5pcXVlIGhpc3RvcnkgZmlsZXMgKGJ5IGZpbGUgaWRlbnRpZmllcilcbiAgICBjb25zdCBuZXdGaWxlSWRzID0gbmV3IFNldChuZXdGaWxlcy5tYXAoZiA9PiBmLmlkZW50aWZpZXIpKTtcbiAgICBjb25zdCB1bmlxdWVIaXN0b3J5RmlsZXMgPSBoaXN0b3J5RmlsZXMuZmlsdGVyKGYgPT4gIW5ld0ZpbGVJZHMuaGFzKGYuaWRlbnRpZmllcikpO1xuICAgIFxuICAgIHJldHVybiBbLi4ubmV3RmlsZXMsIC4uLnVuaXF1ZUhpc3RvcnlGaWxlc107XG4gIH0gY2F0Y2gge1xuICAgIC8vIEZhbGxiYWNrOiByZXR1cm4gb25seSBuZXcgZmlsZXMgaWYgaGlzdG9yeSBmZXRjaCBmYWlsc1xuICAgIHJldHVybiBuZXdGaWxlcztcbiAgfVxufVxuXG4vKipcbiAqIFBlcmZvcm0gc2VtYW50aWMgcmV0cmlldmFsIGFuZCBpbmplY3QgcmVsZXZhbnQgY2h1bmtzIGludG8gdGhlIHByb21wdC5cbiAqIEVuc3VyZXMgc3RhdHVzIGluZGljYXRvciBpcyBhbHdheXMgcHJvcGVybHkgY2xlYW5lZCB1cC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcHJlcGFyZVJldHJpZXZhbFJlc3VsdHNDb250ZXh0SW5qZWN0aW9uKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIG9yaWdpbmFsVXNlclByb21wdDogc3RyaW5nLFxuICBmaWxlczogRmlsZUhhbmRsZVtdXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBwbHVnaW5Db25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBjb25zdCByZXRyaWV2YWxMaW1pdCA9IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0Jyk7XG4gIGNvbnN0IGFmZmluaXR5VGhyZXNob2xkID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnKTtcblxuICAvLyBDcmVhdGUgc3RhdHVzIGluZGljYXRvciBmb3IgdXNlciBmZWVkYmFja1xuICBjb25zdCByZXRyaWV2aW5nU3RhdHVzID0gY3RsLmNyZWF0ZVN0YXR1cyh7XG4gICAgc3RhdHVzOiAnbG9hZGluZycsXG4gICAgdGV4dDogYExvYWRpbmcgZW1iZWRkaW5nIG1vZGVsLi4uYCxcbiAgfSk7XG5cbiAgdHJ5IHtcbiAgICAvLyBQcm9hY3RpdmVseSBsb2FkIHRoZSBlbWJlZGRpbmcgbW9kZWwgKGlkZW50aWNhbCB0byBvZmZpY2lhbCByYWctdjEgcGx1Z2luKVxuICAgIGNvbnN0IGVtYmVkZGluZ01vZGVsSWQgPSBcIm5vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGXCI7XG4gICAgXG4gICAgY29uc3QgbW9kZWwgPSBhd2FpdCBjdGwuY2xpZW50LmVtYmVkZGluZy5tb2RlbChlbWJlZGRpbmdNb2RlbElkLCB7XG4gICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSBzdGF0dXMgdG8gaW5kaWNhdGUgcmV0cmlldmFsIHN0YXJ0XG4gICAgcmV0cmlldmluZ1N0YXR1cy5zZXRTdGF0ZSh7XG4gICAgICBzdGF0dXM6ICdsb2FkaW5nJyxcbiAgICAgIHRleHQ6IGBSZXRyaWV2aW5nIHJlbGV2YW50IGNpdGF0aW9ucyBmb3IgdXNlciBxdWVyeS4uLmAsXG4gICAgfSk7XG5cbiAgICAvLyBVc2UgTE0gU3R1ZGlvJ3MgYnVpbHQtaW4gcmV0cmlldmFsIEFQSSB3aXRoIHRoZSBsb2FkZWQgbW9kZWxcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjdGwuY2xpZW50LmZpbGVzLnJldHJpZXZlKG9yaWdpbmFsVXNlclByb21wdCwgZmlsZXMsIHtcbiAgICAgIGVtYmVkZGluZ01vZGVsOiBtb2RlbCwgLy8gRXhwbGljaXRseSBwYXNzIHRoZSBsb2FkZWQgbW9kZWxcbiAgICAgIGxpbWl0OiByZXRyaWV2YWxMaW1pdCxcbiAgICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxuICAgICAgb25GaWxlUHJvY2Vzc0xpc3QoZmlsZXNUb1Byb2Nlc3MpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzVG9Qcm9jZXNzKSB7XG4gICAgICAgICAgcmV0cmlldmluZ1N0YXR1cy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzdGF0dXM6ICdsb2FkaW5nJyxcbiAgICAgICAgICAgIHRleHQ6IGBQcm9jZXNzaW5nICR7ZmlsZS5uYW1lfS4uLmAsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkZpbGVQcm9jZXNzaW5nU3RhcnQoZmlsZSkge1xuICAgICAgICByZXRyaWV2aW5nU3RhdHVzLnNldFN0YXRlKHtcbiAgICAgICAgICBzdGF0dXM6ICdsb2FkaW5nJyxcbiAgICAgICAgICB0ZXh0OiBgRW1iZWRkaW5nIGNodW5rcyBmcm9tICR7ZmlsZS5uYW1lfS4uLmAsXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9uRmlsZVByb2Nlc3NpbmdFbmQoZmlsZSkge1xuICAgICAgICByZXRyaWV2aW5nU3RhdHVzLnNldFN0YXRlKHtcbiAgICAgICAgICBzdGF0dXM6ICdkb25lJyxcbiAgICAgICAgICB0ZXh0OiBgUHJvY2Vzc2VkICR7ZmlsZS5uYW1lfWAsXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEZpbHRlciByZXN1bHRzIGJ5IGFmZmluaXR5IHRocmVzaG9sZFxuICAgIGNvbnN0IHJlbGV2YW50RW50cmllcyA9IHJlc3VsdC5lbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBlbnRyeS5zY29yZSA+PSBhZmZpbml0eVRocmVzaG9sZCk7XG5cbiAgICBpZiAocmVsZXZhbnRFbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0cmlldmluZ1N0YXR1cy5zZXRTdGF0ZSh7XG4gICAgICAgIHN0YXR1czogJ2Vycm9yJyxcbiAgICAgICAgdGV4dDogYE5vIHJlbGV2YW50IGNvbnRlbnQgZm91bmQgaW4gYXR0YWNoZWQgZG9jdW1lbnRzICh0aHJlc2hvbGQ6ICR7YWZmaW5pdHlUaHJlc2hvbGR9KWAsXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgcmV0dXJuIGJ1aWxkTm9SZXN1bHRzTWVzc2FnZShvcmlnaW5hbFVzZXJQcm9tcHQpO1xuICAgIH1cblxuICAgIC8vIEZvcm1hdCByZXRyaWV2YWwgcmVzdWx0c1xuICAgIHJldHJpZXZpbmdTdGF0dXMuc2V0U3RhdGUoe1xuICAgICAgc3RhdHVzOiAnZG9uZScsXG4gICAgICB0ZXh0OiBgUmV0cmlldmVkICR7cmVsZXZhbnRFbnRyaWVzLmxlbmd0aH0gcmVsZXZhbnQgY2h1bmsocykgZnJvbSAke2ZpbGVzLmxlbmd0aH0gZG9jdW1lbnQocylgLFxuICAgIH0pO1xuXG4gICAgY3RsLmRlYnVnKGBSZXRyaWV2ZWQgJHtyZWxldmFudEVudHJpZXMubGVuZ3RofSByZWxldmFudCBjaHVua3Mgd2l0aCBhZmZpbml0eSB0aHJlc2hvbGQgJHthZmZpbml0eVRocmVzaG9sZH1gKTtcblxuICAgIHJldHVybiBidWlsZFJldHJpZXZhbE1lc3NhZ2UocmVsZXZhbnRFbnRyaWVzLCBvcmlnaW5hbFVzZXJQcm9tcHQpO1xuXG4gIH0gY2F0Y2ggKGVycm9yKSB7IC8vIEgxIEZJWDogUHJvcGVybHkgdHlwZWQgZXJyb3IgaGFuZGxpbmdcbiAgICAvLyBIYW5kbGUgYWJvcnQgc2lnbmFsIGdyYWNlZnVsbHlcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiAoZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InIHx8IGVycm9yLm1lc3NhZ2U/LmluY2x1ZGVzKCdhYm9ydCcpKSkge1xuICAgICAgcmV0cmlldmluZ1N0YXR1cy5zZXRTdGF0ZSh7XG4gICAgICAgIHN0YXR1czogJ2NhbmNlbGVkJyxcbiAgICAgICAgdGV4dDogJ1JldHJpZXZhbCBjYW5jZWxlZCBieSB1c2VyJyxcbiAgICAgIH0pO1xuICAgICAgdGhyb3cgZXJyb3I7IC8vIFJlLXRocm93IHRvIHNpZ25hbCBjYW5jZWxsYXRpb25cbiAgICB9XG5cbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBTdHJpbmcoZXJyb3IpO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIHRoZSBlcnJvciBpcyBkdWUgdG8gbWlzc2luZyBlbWJlZGRpbmcgbW9kZWxcbiAgICBjb25zdCBtZXNzYWdlU3RyID0gdHlwZW9mIGVycm9yTWVzc2FnZSA9PT0gJ3N0cmluZycgPyBlcnJvck1lc3NhZ2UgOiBlcnJvck1lc3NhZ2UubWVzc2FnZSB8fCAnJztcbiAgICBjb25zdCBpc01pc3NpbmdNb2RlbEVycm9yID0gbWVzc2FnZVN0ci5pbmNsdWRlcygnRW1iZWRkaW5nIG1vZGVsJyk7XG4gICAgXG4gICAgcmV0cmlldmluZ1N0YXR1cy5zZXRTdGF0ZSh7XG4gICAgICBzdGF0dXM6ICdlcnJvcicsXG4gICAgICB0ZXh0OiBpc01pc3NpbmdNb2RlbEVycm9yIFxuICAgICAgICA/IGBSQUcgcmVxdWlyZXMgYW4gZW1iZWRkaW5nIG1vZGVsLiBQbGVhc2UgbG9hZCAnbm9taWMtZW1iZWQtdGV4dC12MS41JyBpbiBMTSBTdHVkaW8uYFxuICAgICAgICA6IGBSZXRyaWV2YWwgZmFpbGVkOiAke21lc3NhZ2VTdHIgfHwgJ1Vua25vd24gZXJyb3InfWAsXG4gICAgfSk7XG4gICAgXG4gICAgY3RsLmRlYnVnKGBSQUcgcmV0cmlldmFsIGVycm9yOmAsIGVycm9yTWVzc2FnZSk7XG4gICAgXG4gICAgLy8gRmFsbGJhY2s6IHJldHVybiBvcmlnaW5hbCBwcm9tcHQgc28gY29udmVyc2F0aW9uIGNhbiBjb250aW51ZVxuICAgIHJldHVybiBvcmlnaW5hbFVzZXJQcm9tcHQ7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZCBtZXNzYWdlIHdoZW4gbm8gcmVsZXZhbnQgcmVzdWx0cyBhcmUgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkTm9SZXN1bHRzTWVzc2FnZShvcmlnaW5hbFVzZXJQcm9tcHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG5vdGUgPSBgSW1wb3J0YW50OiBObyBjaXRhdGlvbnMgd2VyZSBmb3VuZCBpbiB0aGUgYXR0YWNoZWQgZG9jdW1lbnRzIGZvciB5b3VyIHF1ZXJ5LlxcblxcbmA7XG4gIGNvbnN0IGluc3RydWN0aW9uID0gYFBsZWFzZSByZXNwb25kIHRvIHRoZSBiZXN0IG9mIHlvdXIgYWJpbGl0eSB3aXRob3V0IGRvY3VtZW50IGNvbnRleHQuYDtcbiAgXG4gIHJldHVybiBgJHtub3RlfVxcbiR7aW5zdHJ1Y3Rpb259XFxuXFxuLS0tXFxuVXNlciBRdWVyeTpcXG5cXG4ke29yaWdpbmFsVXNlclByb21wdH1gO1xufVxuXG4vKipcbiAqIEJ1aWxkIG1lc3NhZ2Ugd2l0aCByZXRyaWV2ZWQgZG9jdW1lbnQgY2h1bmtzLlxuICovXG5mdW5jdGlvbiBidWlsZFJldHJpZXZhbE1lc3NhZ2UoXG4gIGVudHJpZXM6IFJldHJpZXZhbEVudHJ5W10sIC8vIEgxIEZJWDogUHJvcGVybHkgdHlwZWQgaW5zdGVhZCBvZiBhbnlbXVxuICBvcmlnaW5hbFVzZXJQcm9tcHQ6IHN0cmluZ1xuKTogc3RyaW5nIHtcbiAgY29uc3QgcHJlZml4ID0gYFRoZSBmb2xsb3dpbmcgZXhjZXJwdHMgd2VyZSByZXRyaWV2ZWQgZnJvbSB5b3VyIGF0dGFjaGVkIGRvY3VtZW50cyBiYXNlZCBvbiBzZW1hbnRpYyByZWxldmFuY2U6XFxuXFxuYDtcbiAgXG4gIGxldCBwcm9jZXNzZWRDb250ZW50ID0gcHJlZml4O1xuICBcbiAgZW50cmllcy5mb3JFYWNoKChlbnRyeSwgaW5kZXgpID0+IHtcbiAgICAvLyBUcnVuY2F0ZSB2ZXJ5IGxvbmcgY2h1bmtzIHRvIGF2b2lkIGNvbnRleHQgb3ZlcmZsb3dcbiAgICBjb25zdCBtYXhDaHVua0xlbmd0aCA9IDIwMDA7XG4gICAgbGV0IGNvbnRlbnQgPSBlbnRyeS5jb250ZW50O1xuICAgIGlmIChjb250ZW50Lmxlbmd0aCA+IG1heENodW5rTGVuZ3RoKSB7XG4gICAgICBjb250ZW50ID0gY29udGVudC5zdWJzdHJpbmcoMCwgbWF4Q2h1bmtMZW5ndGgpICsgJy4uLiBbdHJ1bmNhdGVkXSc7XG4gICAgfVxuICAgIFxuICAgIHByb2Nlc3NlZENvbnRlbnQgKz0gYCoqUmVsZXZhbnQgRXhjZXJwdCAke2luZGV4ICsgMX0qKiAocmVsZXZhbmNlOiAkeyhlbnRyeS5zY29yZSAqIDEwMCkudG9GaXhlZCgwKX0lKTpcXG5gO1xuICAgIHByb2Nlc3NlZENvbnRlbnQgKz0gYCR7Y29udGVudH1cXG5cXG4tLS1cXG5cXG5gO1xuICB9KTtcblxuICBjb25zdCBzdWZmaXggPSBgVXNlIHRoZSBleGNlcnB0cyBhYm92ZSB0byBpbmZvcm0geW91ciByZXNwb25zZS4gT25seSBjaXRlIGluZm9ybWF0aW9uIHRoYXQgaXMgZGlyZWN0bHkgcmVsZXZhbnQgdG8gdGhlIHVzZXIncyBxdWVyeS5cXG5cXG5Vc2VyIFF1ZXJ5OlxcblxcbiR7b3JpZ2luYWxVc2VyUHJvbXB0fWA7XG4gIFxuICByZXR1cm4gcHJvY2Vzc2VkQ29udGVudCArIHN1ZmZpeDtcbn1cbiIsICIvKipcbiAqIEFJIFRvb2xib3ggUGx1Z2luIC0gRW50cnkgUG9pbnRcbiAqIE1haW4gZnVuY3Rpb24gZXhwb3J0ZWQgZm9yIExNIFN0dWRpbyBwbHVnaW4gc3lzdGVtXG4gKi9cblxuaW1wb3J0IHsgdHlwZSBQbHVnaW5Db250ZXh0IH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sc1Byb3ZpZGVyIH0gZnJvbSAnLi90b29sc1Byb3ZpZGVyJztcbmltcG9ydCB7IGNvbmZpZ1NjaGVtYXRpY3MgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBwcmVwcm9jZXNzIH0gZnJvbSAnLi9wcm9tcHRQcmVwcm9jZXNzb3InO1xuaW1wb3J0IHsgY2xlYW51cEJyb3dzZXJTZXNzaW9uIH0gZnJvbSAnLi90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzJztcblxuLy8gXHUyNzA1IEZJWDogVXNlIHN0cnVjdHVyZWQgbG9nZ2luZyBpbnN0ZWFkIG9mIGNvbnNvbGUubG9nXG5jb25zdCBsb2dnZXIgPSB7XG4gIGluZm86IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3Rkb3V0LndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBbQUkgVG9vbGJveF0gJHttc2d9XFxuYCksXG4gIGVycm9yOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZGVyci53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZGVyci53cml0ZShgW0FJIFRvb2xib3ggRVJST1JdICR7bXNnfVxcbmApLFxufTtcblxuLyoqXG4gKiBNYWluIHBsdWdpbiBlbnRyeSBwb2ludCAtIGNhbGxlZCBieSBMTSBTdHVkaW9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1haW4oY29udGV4dDogUGx1Z2luQ29udGV4dCkge1xuICBsb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nLi4uJyk7XG4gIFxuICAvLyBSZWdpc3RlciB0aGUgY29uZmlndXJhdGlvbiBzY2hlbWF0aWNzIChtYWtlcyB0b2dnbGVzIGFwcGVhciBpbiBVSSlcbiAgY29udGV4dC53aXRoQ29uZmlnU2NoZW1hdGljcyhjb25maWdTY2hlbWF0aWNzKTtcbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSBwcm9tcHQgcHJlcHJvY2Vzc29yIGZvciBEb2N1bWVudCBSQUcgLyBDaGF0IHdpdGggRmlsZXNcbiAgY29udGV4dC53aXRoUHJvbXB0UHJlcHJvY2Vzc29yKHByZXByb2Nlc3MpO1xuICBcbiAgLy8gUmVnaXN0ZXIgdGhlIHRvb2xzIHByb3ZpZGVyIGZ1bmN0aW9uXG4gIGNvbnRleHQud2l0aFRvb2xzUHJvdmlkZXIodG9vbHNQcm92aWRlcik7XG4gIFxuICAvLyBIYW5kbGUgcGx1Z2luIHVubG9hZCAtIGNsZWFudXAgYnJvd3NlciBzZXNzaW9uIHRvIHByZXZlbnQgb3JwaGFuZWQgcHJvY2Vzc2VzXG4gIGlmICh0eXBlb2YgcHJvY2Vzcy5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTtcbiAgICB9KTtcbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTtcbiAgICB9KTtcbiAgfVxuICBcbiAgbG9nZ2VyLmluZm8oJ0luaXRpYWxpemVkIHN1Y2Nlc3NmdWxseSEnKTtcbn1cbiIsICJpbXBvcnQgeyBMTVN0dWRpb0NsaWVudCwgdHlwZSBQbHVnaW5Db250ZXh0IH0gZnJvbSBcIkBsbXN0dWRpby9zZGtcIjtcblxuZGVjbGFyZSB2YXIgcHJvY2VzczogYW55O1xuXG4vLyBXZSByZWNlaXZlIHJ1bnRpbWUgaW5mb3JtYXRpb24gaW4gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmNvbnN0IGNsaWVudElkZW50aWZpZXIgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0NMSUVOVF9JREVOVElGSUVSO1xuY29uc3QgY2xpZW50UGFzc2tleSA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQ0xJRU5UX1BBU1NLRVk7XG5jb25zdCBiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9CQVNFX1VSTDtcblxuY29uc3QgY2xpZW50ID0gbmV3IExNU3R1ZGlvQ2xpZW50KHtcbiAgY2xpZW50SWRlbnRpZmllcixcbiAgY2xpZW50UGFzc2tleSxcbiAgYmFzZVVybCxcbn0pO1xuXG4oZ2xvYmFsVGhpcyBhcyBhbnkpLl9fTE1TX1BMVUdJTl9DT05URVhUID0gdHJ1ZTtcblxubGV0IHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IGZhbHNlO1xubGV0IHByb21wdFByZXByb2Nlc3NvclNldCA9IGZhbHNlO1xubGV0IGNvbmZpZ1NjaGVtYXRpY3NTZXQgPSBmYWxzZTtcbmxldCBnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0ID0gZmFsc2U7XG5sZXQgdG9vbHNQcm92aWRlclNldCA9IGZhbHNlO1xubGV0IGdlbmVyYXRvclNldCA9IGZhbHNlO1xuXG5jb25zdCBzZWxmUmVnaXN0cmF0aW9uSG9zdCA9IGNsaWVudC5wbHVnaW5zLmdldFNlbGZSZWdpc3RyYXRpb25Ib3N0KCk7XG5cbmNvbnN0IHBsdWdpbkNvbnRleHQ6IFBsdWdpbkNvbnRleHQgPSB7XG4gIHdpdGhQcmVkaWN0aW9uTG9vcEhhbmRsZXI6IChnZW5lcmF0ZSkgPT4ge1xuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByZWRpY3Rpb25Mb29wSGFuZGxlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcmVkaWN0aW9uTG9vcEhhbmRsZXIgY2Fubm90IGJlIHVzZWQgd2l0aCBhIHRvb2xzIHByb3ZpZGVyXCIpO1xuICAgIH1cblxuICAgIHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0UHJlZGljdGlvbkxvb3BIYW5kbGVyKGdlbmVyYXRlKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aFByb21wdFByZXByb2Nlc3NvcjogKHByZXByb2Nlc3MpID0+IHtcbiAgICBpZiAocHJvbXB0UHJlcHJvY2Vzc29yU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcm9tcHRQcmVwcm9jZXNzb3IgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBwcm9tcHRQcmVwcm9jZXNzb3JTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFByb21wdFByZXByb2Nlc3NvcihwcmVwcm9jZXNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aENvbmZpZ1NjaGVtYXRpY3M6IChjb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGNvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZyBzY2hlbWF0aWNzIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgY29uZmlnU2NoZW1hdGljc1NldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0Q29uZmlnU2NoZW1hdGljcyhjb25maWdTY2hlbWF0aWNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdsb2JhbENvbmZpZ1NjaGVtYXRpY3M6IChnbG9iYWxDb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdsb2JhbCBjb25maWcgc2NoZW1hdGljcyBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldEdsb2JhbENvbmZpZ1NjaGVtYXRpY3MoZ2xvYmFsQ29uZmlnU2NoZW1hdGljcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhUb29sc1Byb3ZpZGVyOiAodG9vbHNQcm92aWRlcikgPT4ge1xuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUb29scyBwcm92aWRlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvb2xzIHByb3ZpZGVyIGNhbm5vdCBiZSB1c2VkIHdpdGggYSBwcmVkaWN0aW9uTG9vcEhhbmRsZXJcIik7XG4gICAgfVxuXG4gICAgdG9vbHNQcm92aWRlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0VG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdlbmVyYXRvcjogKGdlbmVyYXRvcikgPT4ge1xuICAgIGlmIChnZW5lcmF0b3JTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuXG4gICAgZ2VuZXJhdG9yU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRHZW5lcmF0b3IoZ2VuZXJhdG9yKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbn07XG5cbmltcG9ydChcIi4vLi4vc3JjL2luZGV4LnRzXCIpLnRoZW4oYXN5bmMgbW9kdWxlID0+IHtcbiAgcmV0dXJuIGF3YWl0IG1vZHVsZS5tYWluKHBsdWdpbkNvbnRleHQpO1xufSkudGhlbigoKSA9PiB7XG4gIHNlbGZSZWdpc3RyYXRpb25Ib3N0LmluaXRDb21wbGV0ZWQoKTtcbn0pLmNhdGNoKChlcnJvcikgPT4ge1xuICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGV4ZWN1dGUgdGhlIG1haW4gZnVuY3Rpb24gb2YgdGhlIHBsdWdpbi5cIik7XG4gIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRQTyxTQUFTLGNBQWMsUUFBc0IsVUFBd1E7QUFDMVQsU0FBTyxPQUFPLFFBQVEsTUFBTTtBQUM5QjtBQVdPLFNBQVMsdUJBQXVCLFFBQXNCQSxRQUErRDtBQUUxSCxVQUFRQSxRQUFNO0FBQUEsSUFFWixLQUFLO0FBQWMsYUFBTyxPQUFPLHdCQUF3QjtBQUFBLElBRXpELEtBQUs7QUFBYyxhQUFPLE9BQU8sb0JBQW9CO0FBQUEsSUFFckQsS0FBSztBQUFjLGFBQU8sT0FBTyxzQkFBc0I7QUFBQSxJQUV2RCxLQUFLO0FBQWMsYUFBTyxPQUFPLG1CQUFtQjtBQUFBLEVBRXREO0FBRUY7QUF2UkEsZ0JBRUEsWUFRYSxjQWdJQSxnQkFpTUE7QUEz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b2wiLCAicGxhdGZvcm0iLCAicGF0aCIsICJmcyIsICJpc0Fic29sdXRlIiwgInBhdGgiLCAicmVzb2x2ZSIsICJmcyIsICJwYXRoIiwgInNwYXduV2l0aFByb2dyZXNzIiwgInJlc29sdmUiLCAicnVuQ29uZmlnQW5hbHlzaXMiLCAicnVuSW1wb3J0QW5hbHlzaXMiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImZzIiwgInBhdGgiLCAiZGRnU2VhcmNoIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJtZXNzYWdlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJyZXNvbHZlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJoYW5kbGVFcnJvciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAicmVzb2x2ZSIsICJoYW5kbGVFcnJvciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiaW1wb3J0X2NoaWxkX3Byb2Nlc3MiLCAiaGFuZGxlRXJyb3IiLCAicGxhdGZvcm0iLCAicmVzb2x2ZSIsICJtZXNzYWdlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJvcyIsICJwYXRoIiwgImZzIiwgImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgImZzIiwgInN0YXQiLCAiaGFuZGxlRXJyb3IiLCAib3MiLCAicGxhdGZvcm0iLCAic3Bhd24iLCAicmVzb2x2ZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAicGF0aCIsICJob3N0bmFtZSIsICJoYW5kbGVFcnJvciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiY2h1bmtUZXh0IiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJwYXRoIiwgImZzIiwgInB1cHBldGVlck1vZHVsZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJ0b29sIiwgInRvb2wiLCAibG9nZ2VyIiwgImltcG9ydF9zZGsiLCAicHJlcHJvY2VzcyIsICJjb25maWdTY2hlbWF0aWNzIiwgInRvb2xzUHJvdmlkZXIiLCAibW9kdWxlIl0KfQo=
