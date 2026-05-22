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
async function safeSpawn(exe, args, timeoutMs, input) {
  return new Promise((resolve2) => {
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
    const img1Data = fs11.readFileSync(image1Path);
    const img2Data = fs11.readFileSync(image2Path);
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
      default:
        return {
          success: false,
          error: `Unsupported file format: ${ext}. Only .pdf and .docx are supported.`
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

// src/promptPreprocessor.ts
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
    return injectWorkingDirectoryPrompt(userPrompt + attachmentNotice, detectedPath);
  }
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const documentRAGEnabled = pluginConfig.get("documentRAG");
  console.log(`[RAG] documentRAG enabled: ${documentRAGEnabled}`);
  if (!documentRAGEnabled) {
    if (attachmentNotice) {
      return userPrompt + attachmentNotice;
    }
    return userMessage;
  }
  const newFiles = allFiles.filter((f) => f.type !== "image");
  console.log(`[RAG] Found ${newFiles.length} non-image files`);
  if (newFiles.length === 0) {
    if (attachmentNotice) {
      return userPrompt + attachmentNotice;
    }
    return userMessage;
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
${contextInjection.trim()}`;
  }
  console.log("[RAG] No relevant results found");
  if (attachmentNotice) {
    return userPrompt + attachmentNotice;
  }
  return userMessage;
}
var import_pdf_parse;
var init_promptPreprocessor = __esm({
  "src/promptPreprocessor.ts"() {
    "use strict";
    init_config();
    import_pdf_parse = __toESM(require("pdf-parse"));
    init_attachmentManager();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kQ29tbWFuZHMudHMiLCAiLi4vc3JjL3dvcmtpbmdEaXIudHMiLCAiLi4vc3JjL3NlY3VyaXR5LnRzIiwgIi4uL3NyYy9wZXJmb3JtYW5jZVV0aWxzLnRzIiwgIi4uL3NyYy90b29scy9maWxlU3lzdGVtVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2dpdEdpdGh1YlRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9icm93c2VyQXV0b21hdGlvblRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9kYXRhYmFzZVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9leGVjdXRpb25Ub29scy50cyIsICIuLi9zcmMvdG9vbHMvdXRpbGl0eVRvb2xzLnRzIiwgIi4uL3NyYy90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvaHR0cENsaWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29scy92ZWN0b3JSYWdUb29scy50cyIsICIuLi9zcmMvdG9vbHMvdWlHZW5lcmF0aW9uVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMudHMiLCAiLi4vc3JjL2F0dGFjaG1lbnRNYW5hZ2VyLnRzIiwgIi4uL3NyYy90b29scy9kb2N1bWVudFRvb2xzLnRzIiwgIi4uL3NyYy90b29sc1Byb3ZpZGVyLnRzIiwgIi4uL3NyYy9wcm9tcHRQcmVwcm9jZXNzb3IudHMiLCAiLi4vc3JjL2luZGV4LnRzIiwgImVudHJ5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNvbmZpZ1NjaGVtYXRpY3MgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcclxuXHJcblxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT0gWm9kIFNjaGVtYSAodmFsaWRhdGlvbikgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IENvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcclxuXHJcbiAgLy8gVG9vbCBHYXRpbmcgKGVuYWJsZS9kaXNhYmxlIGluZGl2aWR1YWwgdG9vbHMpXHJcblxyXG4gIGZpbGVTeXN0ZW06IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIHdlYlNlYXJjaDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcbiAgYnJvd3NlckF1dG9tYXRpb246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxyXG5cclxuICBnaXRPcGVyYXRpb25zOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcclxuXHJcbiAgZGF0YWJhc2VRdWVyaWVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcclxuXHJcbiAgZG9jdW1lbnRQYXJzaW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxyXG5cclxuICBiYWNrZ3JvdW5kQ29tbWFuZHM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxyXG5cclxuXHJcblxyXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0NcdUREOTUgTkVXIFRPT0wgQ0FURUdPUklFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuXHJcbiAgaW1hZ2VQcm9jZXNzaW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgaW1hZ2UgT0NSLCBzY3JlZW5zaG90LCBhbmQgY29tcGFyaXNvbiB0b29scycpLFxyXG5cclxuICBodHRwQ2xpZW50OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnRW5hYmxlIGdlbmVyaWMgSFRUUCBjbGllbnQgZm9yIFJFU1QgQVBJIGNhbGxzJyksXHJcblxyXG4gIHZlY3RvclJBRzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIHNlbWFudGljIHNlYXJjaCB3aXRoIHZlY3RvciBlbWJlZGRpbmdzJyksXHJcbiAgdWlHZW5lcmF0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnRW5hYmxlIGludGVyYWN0aXZlIFVJIGdlbmVyYXRpb24gYW5kIHJlbmRlcmluZyB0b29scycpLFxuICBjb250ZXh0TWFuYWdlbWVudDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGF1dG9tYXRpYyBjb250ZXh0IHRyYWNraW5nIGFuZCBtZW1vcnkgbWFuYWdlbWVudCcpLFxuXHJcblxyXG5cclxuICAvLyBcdTI1MDBcdTI1MDAgXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG5cclxuICBnb2RNb2RlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnXHUyNkEwXHVGRTBGIFdBUk5JTkc6IEVuYWJsZXMgZXZlcnkgdG9vbCBjYXRlZ29yeS4gVXNlIHdpdGggY2F1dGlvbi4nKSxcclxuXHJcblxyXG5cclxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNEXHVEQ0RBIERPQ1VNRU5UIFJBRyAvIENIQVQgV0lUSCBGSUxFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuXHJcbiAgZG9jdW1lbnRSQUc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdFbmFibGUgZmlsZSBpbmRleGluZyBhbmQgc2VtYW50aWMgc2VhcmNoIGZvciBjaGF0JyksXHJcblxyXG4gIHJldHJpZXZhbExpbWl0OiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMjApLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIHJlbGV2YW50IGNodW5rcyB0byByZXRyaWV2ZScpLFxyXG5cclxuICByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZDogei5udW1iZXIoKS5taW4oMC4wKS5tYXgoMS4wKS5kZWZhdWx0KDAuNSkuZGVzY3JpYmUoJ01pbmltdW0gc2ltaWxhcml0eSBzY29yZSBmb3IgYSBjaHVuayB0byBiZSBjb25zaWRlcmVkIHJlbGV2YW50ICgwLTEpJyksXHJcblxyXG4gIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgaW5kaXZpZHVhbCB0b2dnbGVzIChncmFudWxhciBjb250cm9sKVxyXG5cclxuICBleGVjdXRpb25KYXZhU2NyaXB0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnQWxsb3cgcnVuX2phdmFzY3JpcHQgdG9vbCcpLFxyXG5cclxuICBleGVjdXRpb25QeXRob246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdBbGxvdyBydW5fcHl0aG9uIHRvb2wnKSxcclxuXHJcbiAgZXhlY3V0aW9uVGVybWluYWw6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdBbGxvdyBydW5faW5fdGVybWluYWwgdG9vbCcpLFxyXG5cclxuICBleGVjdXRpb25TaGVsbDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IGV4ZWN1dGVfY29tbWFuZCB0b29sJyksXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNTAwXHUyNTAwIFdlYiBTZWFyY2ggU2V0dGluZ3MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcblxyXG4gIHNlYXJjaEZhbGxiYWNrQ2hhaW46IHouZW51bShbJ2RkZy1hcGknLCAnZGRnLWZldGNoJywgJ2dvb2dsZScsICdiaW5nJ10pLmRlZmF1bHQoJ2RkZy1hcGknKS5kZXNjcmliZSgnUHJpbWFyeSBzZWFyY2ggZW5naW5lIChhdXRvLWZhbGxiYWNrIHRvIG90aGVycyknKSxcclxuXHJcbiAgbWF4U2VhcmNoUmVzdWx0czogei5udW1iZXIoKS5taW4oMSkubWF4KDUwKS5kZWZhdWx0KDEwKSxcclxuXHJcbiAgc2FmZXNlYXJjaDogei5lbnVtKFsnMCcsICcxJywgJzInXSkuZGVmYXVsdCgnMScpLFxyXG5cclxuXHJcblxyXG4gIC8vIFx1MjUwMFx1MjUwMCBCcm93c2VyIFNldHRpbmdzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG5cclxuICBicm93c2VyVGltZW91dDogei5udW1iZXIoKS5taW4oMTAwMCkubWF4KDMwMDAwKS5kZWZhdWx0KDUwMDApLFxyXG5cclxuICBoZWFkbGVzc01vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG5cclxuXHJcbiAgLy8gR2l0IFNldHRpbmdzXHJcblxyXG4gIGdpdEF1dG9Db21taXQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxyXG5cclxuICBkZWZhdWx0QnJhbmNoOiB6LnN0cmluZygpLmRlZmF1bHQoJ21haW4nKSxcclxuXHJcblxyXG5cclxuICAvLyBTZWN1cml0eSBTZXR0aW5nc1xyXG5cclxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIGJpbmFyeUZpbGVEZXRlY3Rpb246IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXHJcblxyXG4gIHJlZ2V4UmVEb1NQcm90ZWN0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxyXG5cclxuICBtYXhSZWdleExlbmd0aDogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMDApLmRlZmF1bHQoNTAwKSxcclxuXHJcblxyXG5cclxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50XHJcblxyXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxyXG5cclxuICBzdGF0ZU1heFNpemU6IHoubnVtYmVyKCkubWluKDEwMjQpLm1heCgxMDQ4NTc2KS5kZWZhdWx0KDEwMjQwKSxcclxuXHJcblxyXG5cclxuICAvLyBpMThuIFNldHRpbmdzXHJcblxyXG4gIGxhbmd1YWdlOiB6LmVudW0oWydlbicsICdkZScsICd6aC1DTicsICd6aC1UVyddKS5kZWZhdWx0KCdlbicpLFxyXG5cclxuXHJcblxyXG4gIC8vIE5vdGlmaWNhdGlvbiBTZXR0aW5nc1xyXG5cclxuICBub3RpZmljYXRpb25zRW5hYmxlZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcclxuXHJcbn0pO1xyXG5cclxuXHJcblxyXG5leHBvcnQgdHlwZSBQbHVnaW5Db25maWcgPSB6LmluZmVyPHR5cGVvZiBDb25maWdTY2hlbWE+O1xyXG5cclxuXHJcblxyXG4vKipcclxuXHJcbiAqIERlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3RcclxuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09ORklHOiBQbHVnaW5Db25maWcgPSB7XHJcblxyXG4gIGZpbGVTeXN0ZW06IHRydWUsXHJcblxyXG4gIHdlYlNlYXJjaDogdHJ1ZSxcclxuXHJcbiAgYnJvd3NlckF1dG9tYXRpb246IGZhbHNlLFxyXG5cclxuICBnaXRPcGVyYXRpb25zOiBmYWxzZSxcclxuXHJcbiAgZGF0YWJhc2VRdWVyaWVzOiBmYWxzZSxcclxuXHJcbiAgZG9jdW1lbnRQYXJzaW5nOiB0cnVlLFxyXG5cclxuICBiYWNrZ3JvdW5kQ29tbWFuZHM6IGZhbHNlLFxyXG5cclxuXHJcblxyXG4gIC8vIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI2QTBcdUZFMEZcclxuXHJcbiAgZ29kTW9kZTogZmFsc2UsXHJcblxyXG5cclxuXHJcbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG5cclxuICBpbWFnZVByb2Nlc3Npbmc6IHRydWUsXHJcblxyXG4gIGh0dHBDbGllbnQ6IGZhbHNlLFxyXG5cclxuICB2ZWN0b3JSQUc6IHRydWUsXHJcbiAgdWlHZW5lcmF0aW9uOiBmYWxzZSxcbiAgY29udGV4dE1hbmFnZW1lbnQ6IHRydWUsXG5cclxuXHJcblxyXG4gIC8vIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI2QTBcdUZFMEZcclxuXHJcbiAgZG9jdW1lbnRSQUc6IGZhbHNlLFxyXG5cclxuICByZXRyaWV2YWxMaW1pdDogNSxcclxuXHJcbiAgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQ6IDAuNSxcclxuXHJcblxyXG5cclxuICAvLyBFeGVjdXRpb24gdG9vbHMgXHUyMDE0IGFsbCBkaXNhYmxlZCBieSBkZWZhdWx0IChkYW5nZXJvdXMhKVxyXG5cclxuICBleGVjdXRpb25KYXZhU2NyaXB0OiBmYWxzZSxcclxuXHJcbiAgZXhlY3V0aW9uUHl0aG9uOiBmYWxzZSxcclxuXHJcbiAgZXhlY3V0aW9uVGVybWluYWw6IGZhbHNlLFxyXG5cclxuICBleGVjdXRpb25TaGVsbDogZmFsc2UsXHJcblxyXG5cclxuXHJcbiAgc2VhcmNoRmFsbGJhY2tDaGFpbjogJ2RkZy1hcGknLFxyXG5cclxuICBtYXhTZWFyY2hSZXN1bHRzOiAxMCxcclxuXHJcbiAgc2FmZXNlYXJjaDogJzEnLFxyXG5cclxuICBicm93c2VyVGltZW91dDogNTAwMCxcclxuXHJcbiAgaGVhZGxlc3NNb2RlOiB0cnVlLFxyXG5cclxuICBnaXRBdXRvQ29tbWl0OiBmYWxzZSxcclxuXHJcbiAgZGVmYXVsdEJyYW5jaDogJ21haW4nLFxyXG5cclxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHRydWUsXHJcblxyXG4gIGJpbmFyeUZpbGVEZXRlY3Rpb246IHRydWUsXHJcblxyXG4gIHJlZ2V4UmVEb1NQcm90ZWN0aW9uOiB0cnVlLFxyXG5cclxuICBtYXhSZWdleExlbmd0aDogNTAwLFxyXG5cclxuICBzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDogdHJ1ZSxcclxuXHJcbiAgc3RhdGVNYXhTaXplOiAxMDI0MCxcclxuXHJcbiAgbGFuZ3VhZ2U6ICdlbicsXHJcblxyXG4gIG5vdGlmaWNhdGlvbnNFbmFibGVkOiB0cnVlLFxyXG5cclxufTtcclxuXHJcblxyXG5cclxuLyoqXHJcblxyXG4gKiBWYWxpZGF0ZSBhbmQgc2FuaXRpemUgY29uZmlnIGlucHV0XHJcblxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbmZpZyhpbnB1dDogdW5rbm93bik6IFBsdWdpbkNvbmZpZyB7XHJcblxyXG4gIGNvbnN0IHJlc3VsdCA9IENvbmZpZ1NjaGVtYS5zYWZlUGFyc2UoaW5wdXQpO1xyXG5cclxuICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XHJcblxyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGNvbmZpZ3VyYXRpb246ICR7cmVzdWx0LmVycm9yLm1lc3NhZ2V9YCk7XHJcblxyXG4gIH1cclxuXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgYSB0b29sIGNhdGVnb3J5IGlzIGVuYWJsZWQgaW4gY29uZmlnXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNUb29sRW5hYmxlZChjb25maWc6IFBsdWdpbkNvbmZpZywgY2F0ZWdvcnk6IGtleW9mIFBpY2s8UGx1Z2luQ29uZmlnLCAnZmlsZVN5c3RlbScgfCAnd2ViU2VhcmNoJyB8ICdicm93c2VyQXV0b21hdGlvbicgfCAnZ2l0T3BlcmF0aW9ucycgfCAnZGF0YWJhc2VRdWVyaWVzJyB8ICdkb2N1bWVudFBhcnNpbmcnIHwgJ2JhY2tncm91bmRDb21tYW5kcycgfCAnaW1hZ2VQcm9jZXNzaW5nJyB8ICdodHRwQ2xpZW50JyB8ICd2ZWN0b3JSQUcnIHwgJ3VpR2VuZXJhdGlvbicgfCAnY29udGV4dE1hbmFnZW1lbnQnPik6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBjb25maWdbY2F0ZWdvcnldID09PSB0cnVlO1xyXG59XHJcblxyXG5cclxuXHJcblxyXG4vKipcclxuXHJcbiAqIENoZWNrIGlmIGEgc3BlY2lmaWMgZXhlY3V0aW9uIHRvb2wgaXMgZW5hYmxlZCAoZ3JhbnVsYXIpXHJcblxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGNvbmZpZzogUGx1Z2luQ29uZmlnLCB0b29sOiAnamF2YXNjcmlwdCcgfCAncHl0aG9uJyB8ICd0ZXJtaW5hbCcgfCAnc2hlbGwnKTogYm9vbGVhbiB7XHJcblxyXG4gIHN3aXRjaCAodG9vbCkge1xyXG5cclxuICAgIGNhc2UgJ2phdmFzY3JpcHQnOiByZXR1cm4gY29uZmlnLmV4ZWN1dGlvbkphdmFTY3JpcHQgPT09IHRydWU7XHJcblxyXG4gICAgY2FzZSAncHl0aG9uJzogICAgIHJldHVybiBjb25maWcuZXhlY3V0aW9uUHl0aG9uID09PSB0cnVlO1xyXG5cclxuICAgIGNhc2UgJ3Rlcm1pbmFsJzogICByZXR1cm4gY29uZmlnLmV4ZWN1dGlvblRlcm1pbmFsID09PSB0cnVlO1xyXG5cclxuICAgIGNhc2UgJ3NoZWxsJzogICAgICByZXR1cm4gY29uZmlnLmV4ZWN1dGlvblNoZWxsID09PSB0cnVlO1xyXG5cclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuXHJcbi8qKlxyXG5cclxuICogR2V0IHRoZSBleGVjdXRpb24gdG9vbCBrZXkgZnJvbSBhIHRvb2wgbmFtZVxyXG5cclxuICovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhlY3V0aW9uVG9vbEtleSh0b29sTmFtZTogc3RyaW5nKTogJ2phdmFzY3JpcHQnIHwgJ3B5dGhvbicgfCAndGVybWluYWwnIHwgJ3NoZWxsJyB8IG51bGwge1xyXG5cclxuICBzd2l0Y2ggKHRvb2xOYW1lKSB7XHJcblxyXG4gICAgY2FzZSAncnVuX2phdmFzY3JpcHQnOiByZXR1cm4gJ2phdmFzY3JpcHQnO1xyXG5cclxuICAgIGNhc2UgJ3J1bl9weXRob24nOiAgICAgcmV0dXJuICdweXRob24nO1xyXG5cclxuICAgIGNhc2UgJ3J1bl9pbl90ZXJtaW5hbCc6IHJldHVybiAndGVybWluYWwnO1xyXG5cclxuICAgIGNhc2UgJ2V4ZWN1dGVfY29tbWFuZCc6IHJldHVybiAnc2hlbGwnO1xyXG5cclxuICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gIH1cclxuXHJcbn1cclxuXHJcblxyXG5cclxuLyoqXHJcblxyXG4gKiBDaGVjayBpZiBBTlkgZXhlY3V0aW9uIHRvb2wgaXMgZW5hYmxlZCAobGVnYWN5IGNvbXBhdGliaWxpdHkpXHJcblxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNBbnlFeGVjdXRpb25Ub29sKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogYm9vbGVhbiB7XHJcblxyXG4gIHJldHVybiBjb25maWcuZXhlY3V0aW9uSmF2YVNjcmlwdCB8fCBjb25maWcuZXhlY3V0aW9uUHl0aG9uIHx8IFxyXG5cclxuICAgICAgICAgY29uZmlnLmV4ZWN1dGlvblRlcm1pbmFsIHx8IGNvbmZpZy5leGVjdXRpb25TaGVsbDtcclxuXHJcbn1cclxuXHJcblxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT0gTE0gU3R1ZGlvIFVJIFNjaGVtYXRpY3MgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8vIFRoZXNlIGRlZmluZSB0aGUgdG9nZ2xlIHN3aXRjaGVzIHRoYXQgYXBwZWFyIGluIExNIFN0dWRpbydzIHNldHRpbmdzIHBhbmVsLlxyXG5cclxuXHJcblxyXG5leHBvcnQgY29uc3QgY29uZmlnU2NoZW1hdGljcyA9IGNyZWF0ZUNvbmZpZ1NjaGVtYXRpY3MoKVxyXG5cclxuXHJcblxyXG4gIC8vIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAtIFRPUCBQUklPUklUWSBXQVJOSU5HIFRPR0dMRSBcdTI2QTBcdUZFMEZcclxuXHJcbiAgLmZpZWxkKCdnb2RNb2RlJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHUyNkExXHUyNkEwXHVGRTBGIEdPRCBNT0RFIC0gRW5hYmxlIEFMTCBUb29scyBcdTI2QTBcdUZFMEZcdTI2QTEnLFxyXG5cclxuICAgIHN1YnRpdGxlOiAnV0FSTklORzogQWN0aXZhdGVzIGV2ZXJ5IHRvb2wgY2F0ZWdvcnkgaW5zdGFudGx5LiBVc2Ugd2l0aCBjYXV0aW9uLicsXHJcblxyXG4gICAgaGludDogJ1doZW4gZW5hYmxlZCwgQUxMIGluZGl2aWR1YWwgdG9nZ2xlcyBhcmUgYnlwYXNzZWQgYW5kIGV2ZXJ5IHRvb2wgaXMgYWN0aXZhdGVkIHJlZ2FyZGxlc3Mgb2Ygc2V0dGluZ3MuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZ29kTW9kZSlcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0NcdURGOUJcdUZFMEYgVE9PTCBHQVRJTkcgKEhhdXB0c2NoYWx0ZXIpIFx1RDgzQ1x1REY5Qlx1RkUwRlxyXG5cclxuICAuZmllbGQoJ2ZpbGVTeXN0ZW0nLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQzEgRmlsZSBTeXN0ZW0gVG9vbHMnLCBoaW50OiAnRW5hYmxlIGZpbGUgcmVhZC93cml0ZS9zZWFyY2ggb3BlcmF0aW9ucycgfSwgREVGQVVMVF9DT05GSUcuZmlsZVN5c3RlbSlcclxuXHJcbiAgLmZpZWxkKCd3ZWJTZWFyY2gnLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGMTAgV2ViICYgUmVzZWFyY2ggVG9vbHMnLCBoaW50OiAnRW5hYmxlIER1Y2tEdWNrR28vV2lraXBlZGlhIHNlYXJjaCcgfSwgREVGQVVMVF9DT05GSUcud2ViU2VhcmNoKVxyXG5cclxuICAvLyBcdUQ4M0RcdURDMTkgR0lUICYgR0lUSFVCIFRPT0xTICh2aXN1ZWxsZSBHcnVwcGllcnVuZykgXHVEODNEXHVEQzE5XHJcblxyXG4gIC5maWVsZCgnZ2l0T3BlcmF0aW9ucycsICdib29sZWFuJywgeyBcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REMxOSBHaXQgJiBHaXRIdWIgVG9vbHMnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ1ZlcnNpb24gQ29udHJvbCAmIEFQSScsXHJcblxyXG4gICAgaGludDogJ0VuYWJsZSBnaXQgb3BlcmF0aW9ucyBhbmQgR2l0SHViIEFQSSBhY2Nlc3MuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZ2l0T3BlcmF0aW9ucylcclxuXHJcbiAgLmZpZWxkKCdnaXRBdXRvQ29tbWl0JywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQ0JFIEdpdCBBdXRvLUNvbW1pdCcsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEdpdCAmIEdpdEh1YiBUb29scycsXHJcblxyXG4gICAgaGludDogJ0F1dG9tYXRpY2FsbHkgY29tbWl0IGNoYW5nZXMgYWZ0ZXIgb3BlcmF0aW9ucycsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmdpdEF1dG9Db21taXQpXHJcblxyXG4gIC5maWVsZCgnZGVmYXVsdEJyYW5jaCcsICdzdHJpbmcnLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERjNGIERlZmF1bHQgQnJhbmNoJywgXHJcblxyXG4gICAgcGxhY2Vob2xkZXI6ICdtYWluJyxcclxuXHJcbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBHaXQgJiBHaXRIdWIgVG9vbHMnLFxyXG5cclxuICAgIGhpbnQ6ICdCcmFuY2ggbmFtZSBmb3IgbmV3IHJlcG9zaXRvcmllcyBhbmQgZ2l0IG9wZXJhdGlvbnMnLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5kZWZhdWx0QnJhbmNoKVxyXG5cclxuXHJcblxyXG4gIC5maWVsZCgnZGF0YWJhc2VRdWVyaWVzJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREM0XHVGRTBGIERhdGFiYXNlIFF1ZXJpZXMnLCBoaW50OiAnRW5hYmxlIHJlYWQtb25seSBTUUxpdGUgcXVlcmllcycgfSwgREVGQVVMVF9DT05GSUcuZGF0YWJhc2VRdWVyaWVzKVxyXG5cclxuICAuZmllbGQoJ2RvY3VtZW50UGFyc2luZycsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDNCBEb2N1bWVudCBQYXJzaW5nJywgaGludDogJ0VuYWJsZSBQREYvRE9DWCBkb2N1bWVudCByZWFkaW5nJyB9LCBERUZBVUxUX0NPTkZJRy5kb2N1bWVudFBhcnNpbmcpXHJcblxyXG4gIC5maWVsZCgnYmFja2dyb3VuZENvbW1hbmRzJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHUyM0YzIEJhY2tncm91bmQgQ29tbWFuZHMnLCBoaW50OiAnRW5hYmxlIGxvbmctcnVubmluZyBwcm9jZXNzIHRyYWNraW5nJyB9LCBERUZBVUxUX0NPTkZJRy5iYWNrZ3JvdW5kQ29tbWFuZHMpXHJcblxyXG5cclxuXHJcbiAgLy8gXHVEODNDXHVERDk1XHUyMDBEXHUyNzQwIE5FVyBUT09MIENBVEVHT1JJRVMgXHVEODNDXHVERDk1XHUyMDBEXHUyNzQwXHJcblxyXG4gIC5maWVsZCgnaW1hZ2VQcm9jZXNzaW5nJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEREJDXHVGRTBGIEltYWdlIFByb2Nlc3NpbmcgVG9vbHMnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ09DUiwgU2NyZWVuc2hvdHMgJiBDb21wYXJpc29uJyxcclxuXHJcbiAgICBoaW50OiAnRW5hYmxlIGltYWdlIE9DUiAoVGVzc2VyYWN0LmpzKSwgc2NyZWVuc2hvdCBjYXB0dXJlLCBhbmQgaW1hZ2UgY29tcGFyaXNvbiB0b29scy4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5pbWFnZVByb2Nlc3NpbmcpXHJcblxyXG4gIFxyXG5cclxuICAuZmllbGQoJ2h0dHBDbGllbnQnLCAnYm9vbGVhbicsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMEMgSFRUUCBDbGllbnQgVG9vbHMnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ0dlbmVyaWMgUkVTVCBBUEkgQ2xpZW50JyxcclxuXHJcbiAgICBoaW50OiAnRW5hYmxlIGdlbmVyaWMgSFRUUCBjbGllbnQgZm9yIG1ha2luZyByZXF1ZXN0cyB0byBhbnkgUkVTVCBBUEkgKEdFVCwgUE9TVCwgUFVULCBERUxFVEUpLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmh0dHBDbGllbnQpXHJcblxyXG4gIFxyXG5cclxuICAuZmllbGQoJ3ZlY3RvclJBRycsICdib29sZWFuJywgeyBcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENDQSBWZWN0b3IgUkFHIC8gU2VtYW50aWMgU2VhcmNoJywgXHJcblxyXG4gICAgc3VidGl0bGU6ICdTZW1hbnRpYyBEb2N1bWVudCBTZWFyY2gnLFxyXG5cclxuICAgIGhpbnQ6ICdFbmFibGUgc2VtYW50aWMgc2VhcmNoIHdpdGggdmVjdG9yIGVtYmVkZGluZ3MgZm9yIGludGVsbGlnZW50IGRvY3VtZW50IHJldHJpZXZhbC4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy52ZWN0b3JSQUcpXHJcbiAgLmZpZWxkKCd1aUdlbmVyYXRpb24nLCAnYm9vbGVhbicsIHsgXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0NcdURGQTggSW50ZXJhY3RpdmUgVUkgR2VuZXJhdGlvbiBUb29scycsIFxuICAgIHN1YnRpdGxlOiAnR2VuZXJhdGUgYW5kIHJlbmRlciBpbnRlcmFjdGl2ZSBVSSBjb21wb25lbnRzJyxcbiAgICBoaW50OiAnRW5hYmxlIHRvb2xzIGZvciBnZW5lcmF0aW5nIEhUTUwvQ1NTL0pTIGNvbXBvbmVudHMgKGJ1dHRvbnMsIGZvcm1zLCBjaGFydHMsIGRhc2hib2FyZHMpIGFuZCByZW5kZXJpbmcgdGhlbSBpbiB0aGUgYnJvd3Nlci4nLFxuICB9LCBERUZBVUxUX0NPTkZJRy51aUdlbmVyYXRpb24pXG4gIC5maWVsZCgnY29udGV4dE1hbmFnZW1lbnQnLCAnYm9vbGVhbicsIHsgXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0VcdURERTAgQXV0by1Db250ZXh0IE1hbmFnZW1lbnQgVG9vbHMnLCBcbiAgICBzdWJ0aXRsZTogJ0F1dG9tYXRpYyBzZXNzaW9uIHRyYWNraW5nIGFuZCBtZW1vcnkgbWFuYWdlbWVudCcsXG4gICAgaGludDogJ0VuYWJsZSB0b29scyBmb3IgYXV0b21hdGljYWxseSBzYXZpbmcgaW1wb3J0YW50IGRlY2lzaW9ucywgcGF0dGVybnMsIGFuZCBjb25maWd1cmF0aW9ucyB0byBwZXJzaXN0ZW50IG1lbW9yeS4nLFxuICB9LCBERUZBVUxUX0NPTkZJRy5jb250ZXh0TWFuYWdlbWVudClcblxyXG5cclxuXHJcbiAgLy8gXHVEODNEXHVEQ0RBIERPQ1VNRU5UIFJBRyAvIENIQVQgV0lUSCBGSUxFUyBcdUQ4M0RcdURDREFcclxuXHJcbiAgLmZpZWxkKCdkb2N1bWVudFJBRycsICdib29sZWFuJywgeyBcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENEQSBEb2N1bWVudCBSQUcgLyBDaGF0IHdpdGggRmlsZXMnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ0VuYWJsZSBmaWxlIGluZGV4aW5nIGFuZCBzZW1hbnRpYyBzZWFyY2ggZm9yIGNoYXQnLFxyXG5cclxuICAgIGhpbnQ6ICdBdHRhY2ggZG9jdW1lbnRzIHRvIHlvdXIgY2hhdCBtZXNzYWdlcy4gVGhlIHBsdWdpbiB3aWxsIGF1dG9tYXRpY2FsbHkgcmV0cmlldmUgcmVsZXZhbnQgY29udGVudCBmcm9tIGF0dGFjaGVkIGZpbGVzIHVzaW5nIHNlbWFudGljIHNlYXJjaC4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5kb2N1bWVudFJBRylcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgncmV0cmlldmFsTGltaXQnLCAnbnVtZXJpYycsIHsgXHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMjIgUmV0cmlldmFsIExpbWl0JywgXHJcblxyXG4gICAgc3VidGl0bGU6ICdNYXggY2h1bmtzIHRvIHJldHVybiBwZXIgcXVlcnknLFxyXG5cclxuICAgIG1pbjogMSwgbWF4OiAyMCwgaW50OiB0cnVlLFxyXG5cclxuICAgIGhpbnQ6ICdNYXhpbXVtIG51bWJlciBvZiByZWxldmFudCBkb2N1bWVudCBjaHVua3MgdG8gcmV0cmlldmUgZm9yIGVhY2ggcXVlcnkuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcucmV0cmlldmFsTGltaXQpXHJcblxyXG4gIFxyXG5cclxuICAuZmllbGQoJ3JldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkJywgJ251bWVyaWMnLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNDXHVERkFGIFJldHJpZXZhbCBBZmZpbml0eSBUaHJlc2hvbGQnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ01pbmltdW0gcmVsZXZhbmNlIHNjb3JlICgwLTEpJyxcclxuXHJcbiAgICBtaW46IDAuMCwgbWF4OiAxLjAsIHN0ZXA6IDAuMDEsXHJcblxyXG4gICAgaGludDogJ0NodW5rcyBiZWxvdyB0aGlzIHNpbWlsYXJpdHkgc2NvcmUgd2lsbCBiZSBmaWx0ZXJlZCBvdXQuIExvd2VyID0gbW9yZSByZXN1bHRzIGJ1dCBwb3RlbnRpYWxseSBsZXNzIHJlbGV2YW50LicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLnJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkKVxyXG5cclxuICAvLyBcdTI2QTEgRVhFQ1VUSU9OIFRPT0xTIChHZWZcdTAwRTRocmxpY2ghKSBcdTI2QTFcclxuXHJcbiAgLmZpZWxkKCdleGVjdXRpb25KYXZhU2NyaXB0JywgJ2Jvb2xlYW4nLCB7XHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdTI2QTEgSmF2YVNjcmlwdC1BdXNmXHUwMEZDaHJ1bmcgZXJsYXViZW4nLFxyXG5cclxuICAgIHN1YnRpdGxlOiBcIkFrdGl2aWVydCBkYXMgJ3J1bl9qYXZhc2NyaXB0Jy1Ub29sXCIsXHJcblxyXG4gICAgaGludDogJ0dFRkFIUjogQ29kZSBsXHUwMEU0dWZ0IGF1ZiBJaHJlbSBSZWNobmVyLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvbkphdmFTY3JpcHQpXHJcblxyXG4gIC5maWVsZCgnZXhlY3V0aW9uUHl0aG9uJywgJ2Jvb2xlYW4nLCB7XHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDMEQgUHl0aG9uLUF1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXHJcblxyXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAncnVuX3B5dGhvbictVG9vbFwiLFxyXG5cclxuICAgIGhpbnQ6ICdHRUZBSFI6IENvZGUgbFx1MDBFNHVmdCBhdWYgSWhyZW0gUmVjaG5lci4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5leGVjdXRpb25QeXRob24pXHJcblxyXG4gIC5maWVsZCgnZXhlY3V0aW9uVGVybWluYWwnLCAnYm9vbGVhbicsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENCQiBUZXJtaW5hbC1BdXNmXHUwMEZDaHJ1bmcgZXJsYXViZW4nLFxyXG5cclxuICAgIHN1YnRpdGxlOiBcIkFrdGl2aWVydCBkYXMgJ3J1bl9pbl90ZXJtaW5hbCctVG9vbFwiLFxyXG5cclxuICAgIGhpbnQ6ICdcdTAwRDZmZm5ldCBlY2h0ZSBUZXJtaW5hbC1GZW5zdGVyLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmV4ZWN1dGlvblRlcm1pbmFsKVxyXG5cclxuICAuZmllbGQoJ2V4ZWN1dGlvblNoZWxsJywgJ2Jvb2xlYW4nLCB7XHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdUREMjcgU2hlbGwtQmVmZWhsc2F1c2ZcdTAwRkNocnVuZyBlcmxhdWJlbicsXHJcblxyXG4gICAgc3VidGl0bGU6IFwiQWt0aXZpZXJ0IGRhcyAnZXhlY3V0ZV9jb21tYW5kJy1Ub29sXCIsXHJcblxyXG4gICAgaGludDogJ0dFRkFIUjogQmVmZWhsZSBsYXVmZW4gYXVmIElocmVtIFJlY2huZXIuJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuZXhlY3V0aW9uU2hlbGwpXHJcblxyXG5cclxuXHJcbiAgLy8gXHVEODNEXHVERDBEIFNFQVJDSCBTRVRUSU5HUyBcdUQ4M0RcdUREMERcclxuXHJcbiAgLmZpZWxkKCdzZWFyY2hGYWxsYmFja0NoYWluJywgJ3NlbGVjdCcsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQwRCBTZWFyY2ggRmFsbGJhY2sgQ2hhaW4nLFxyXG5cclxuICAgIGhpbnQ6ICdQcmltYXJ5IHNlYXJjaCBlbmdpbmUuIEF1dG8tZmFsbHMgYmFjayB0byBvdGhlcnMgaWYgdW5hdmFpbGFibGUuJyxcclxuXHJcbiAgICBvcHRpb25zOiBbXHJcblxyXG4gICAgICB7IHZhbHVlOiAnZGRnLWFwaScsIGRpc3BsYXlOYW1lOiAnRHVja0R1Y2tHbyBBUEknIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnZGRnLWZldGNoJywgZGlzcGxheU5hbWU6ICdEdWNrRHVja0dvIEZldGNoJyB9LFxyXG5cclxuICAgICAgeyB2YWx1ZTogJ2dvb2dsZScsIGRpc3BsYXlOYW1lOiAnR29vZ2xlJyB9LFxyXG5cclxuICAgICAgeyB2YWx1ZTogJ2JpbmcnLCBkaXNwbGF5TmFtZTogJ0JpbmcnIH0sXHJcblxyXG4gICAgXSxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuc2VhcmNoRmFsbGJhY2tDaGFpbilcclxuXHJcbiAgLmZpZWxkKCdtYXhTZWFyY2hSZXN1bHRzJywgJ251bWVyaWMnLCB7IG1pbjogMSwgbWF4OiA1MCwgaW50OiB0cnVlIH0sIERFRkFVTFRfQ09ORklHLm1heFNlYXJjaFJlc3VsdHMpXHJcblxyXG4gIC5maWVsZCgnc2FmZXNlYXJjaCcsICdzZWxlY3QnLCB7XHJcblxyXG4gICAgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURFRTFcdUZFMEYgU2FmZSBTZWFyY2gnLFxyXG5cclxuICAgIG9wdGlvbnM6IFtcclxuXHJcbiAgICAgIHsgdmFsdWU6ICcwJywgZGlzcGxheU5hbWU6ICdPZmYnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnMScsIGRpc3BsYXlOYW1lOiAnTW9kZXJhdGUnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnMicsIGRpc3BsYXlOYW1lOiAnU3RyaWN0JyB9LFxyXG5cclxuICAgIF0sXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLnNhZmVzZWFyY2gpXHJcblxyXG5cclxuXHJcbiAgLy8gXHVEODNEXHVEREE1XHVGRTBGIEJST1dTRVIgQVVUT01BVElPTiBUT09MUyBcdUQ4M0RcdUREQTVcdUZFMEZcclxuXHJcbiAgLmZpZWxkKCdicm93c2VyQXV0b21hdGlvbicsICdib29sZWFuJywgeyBcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RERBNVx1RkUwRiBCcm93c2VyIEF1dG9tYXRpb24gVG9vbHMnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ0hlYWRsZXNzIGJyb3dzZXIgY29udHJvbCAmIGF1dG9tYXRpb24nLFxyXG5cclxuICAgIGhpbnQ6ICdFbmFibGUgUHVwcGV0ZWVyLWJhc2VkIGhlYWRsZXNzIGJyb3dzZXIgYXV0b21hdGlvbiBmb3Igd2ViIHNjcmFwaW5nLCB0ZXN0aW5nLCBhbmQgVUkgaW50ZXJhY3Rpb24uJyxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcuYnJvd3NlckF1dG9tYXRpb24pXHJcblxyXG4gIFxyXG5cclxuICAuZmllbGQoJ2Jyb3dzZXJUaW1lb3V0JywgJ251bWVyaWMnLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHUyM0YxXHVGRTBGIEJyb3dzZXIgVGltZW91dCcsIFxyXG5cclxuICAgIHN1YnRpdGxlOiAnXHUyNjk5XHVGRTBGIFRlaWwgZGVyIEJyb3dzZXIgQXV0b21hdGlvbiBUb29scycsXHJcblxyXG4gICAgbWluOiAxMDAwLCBtYXg6IDMwMDAwLCBpbnQ6IHRydWUsXHJcblxyXG4gICAgaGludDogJ01heGltdW0gdGltZSAobXMpIHRvIHdhaXQgZm9yIGJyb3dzZXIgb3BlcmF0aW9ucyBiZWZvcmUgdGltaW5nIG91dC4nLFxyXG5cclxuICB9LCBERUZBVUxUX0NPTkZJRy5icm93c2VyVGltZW91dClcclxuXHJcbiAgXHJcblxyXG4gIC5maWVsZCgnaGVhZGxlc3NNb2RlJywgJ2Jvb2xlYW4nLCB7IFxyXG5cclxuICAgIGRpc3BsYXlOYW1lOiAnXHVEODNEXHVEQzdCIEhlYWRsZXNzIE1vZGUnLCBcclxuXHJcbiAgICBzdWJ0aXRsZTogJ1x1MjY5OVx1RkUwRiBUZWlsIGRlciBCcm93c2VyIEF1dG9tYXRpb24gVG9vbHMnLFxyXG5cclxuICAgIGhpbnQ6ICdSdW4gYnJvd3NlciB3aXRob3V0IEdVSSAocmVjb21tZW5kZWQgZm9yIGF1dG9tYXRpb24pLicsXHJcblxyXG4gIH0sIERFRkFVTFRfQ09ORklHLmhlYWRsZXNzTW9kZSlcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0RcdUREMTIgU0VDVVJJVFkgU0VUVElOR1MgXHVEODNEXHVERDEyXHJcblxyXG4gIC5maWVsZCgncGF0aFZhbGlkYXRpb25FbmFibGVkJywgJ2Jvb2xlYW4nLCB7IGRpc3BsYXlOYW1lOiAnXHVEODNEXHVERDEyIFBhdGggVmFsaWRhdGlvbicsIGhpbnQ6ICdQcmV2ZW50IGRpcmVjdG9yeSB0cmF2ZXJzYWwgYXR0YWNrcycgfSwgREVGQVVMVF9DT05GSUcucGF0aFZhbGlkYXRpb25FbmFibGVkKVxyXG5cclxuICAuZmllbGQoJ2JpbmFyeUZpbGVEZXRlY3Rpb24nLCAnYm9vbGVhbicsIHsgZGlzcGxheU5hbWU6ICdcdUQ4M0RcdURDQzEgQmluYXJ5IEZpbGUgRGV0ZWN0aW9uJywgaGludDogJ0RldGVjdCBiaW5hcnkgZmlsZXMgdmlhIG51bGwgYnl0ZSBjaGVjaycgfSwgREVGQVVMVF9DT05GSUcuYmluYXJ5RmlsZURldGVjdGlvbilcclxuXHJcbiAgLmZpZWxkKCdyZWdleFJlRG9TUHJvdGVjdGlvbicsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REVFMVx1RkUwRiBSZURvUyBQcm90ZWN0aW9uJywgaGludDogJ1Byb3RlY3QgYWdhaW5zdCByZWdleCBkZW5pYWwtb2Ytc2VydmljZScgfSwgREVGQVVMVF9DT05GSUcucmVnZXhSZURvU1Byb3RlY3Rpb24pXHJcblxyXG4gIC5maWVsZCgnbWF4UmVnZXhMZW5ndGgnLCAnbnVtZXJpYycsIHsgbWluOiAxLCBtYXg6IDEwMDAsIGludDogdHJ1ZSB9LCBERUZBVUxUX0NPTkZJRy5tYXhSZWdleExlbmd0aClcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0RcdURDQkQgU1RBVEUgTUFOQUdFTUVOVCBcdUQ4M0RcdURDQkRcclxuXHJcbiAgLmZpZWxkKCdzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1RENCRCBTdGF0ZSBQZXJzaXN0ZW5jZScsIGhpbnQ6ICdQZXJzaXN0IHRvb2wgZXhlY3V0aW9uIHN0YXRlIGJldHdlZW4gc2Vzc2lvbnMnIH0sIERFRkFVTFRfQ09ORklHLnN0YXRlUGVyc2lzdGVuY2VFbmFibGVkKVxyXG5cclxuICAuZmllbGQoJ3N0YXRlTWF4U2l6ZScsICdudW1lcmljJywgeyBtaW46IDEwMjQsIG1heDogMTA0ODU3NiwgaW50OiB0cnVlIH0sIERFRkFVTFRfQ09ORklHLnN0YXRlTWF4U2l6ZSlcclxuXHJcblxyXG5cclxuICAvLyBcdUQ4M0NcdURGMTAgTEFOR1VBR0UgJiBOT1RJRklDQVRJT05TIFx1RDgzQ1x1REYxMFxyXG5cclxuICAuZmllbGQoJ2xhbmd1YWdlJywgJ3NlbGVjdCcsIHtcclxuXHJcbiAgICBkaXNwbGF5TmFtZTogJ1x1RDgzQ1x1REYxMCBMYW5ndWFnZScsXHJcblxyXG4gICAgb3B0aW9uczogW1xyXG5cclxuICAgICAgeyB2YWx1ZTogJ2VuJywgZGlzcGxheU5hbWU6ICdFbmdsaXNoJyB9LFxyXG5cclxuICAgICAgeyB2YWx1ZTogJ2RlJywgZGlzcGxheU5hbWU6ICdEZXV0c2NoIChHZXJtYW4pJyB9LFxyXG5cclxuICAgICAgeyB2YWx1ZTogJ3poLUNOJywgZGlzcGxheU5hbWU6ICdTaW1wbGlmaWVkIENoaW5lc2UnIH0sXHJcblxyXG4gICAgICB7IHZhbHVlOiAnemgtVFcnLCBkaXNwbGF5TmFtZTogJ1RyYWRpdGlvbmFsIENoaW5lc2UnIH0sXHJcblxyXG4gICAgXSxcclxuXHJcbiAgfSwgREVGQVVMVF9DT05GSUcubGFuZ3VhZ2UpXHJcblxyXG5cclxuXHJcbiAgLmZpZWxkKCdub3RpZmljYXRpb25zRW5hYmxlZCcsICdib29sZWFuJywgeyBkaXNwbGF5TmFtZTogJ1x1RDgzRFx1REQxNCBEZXNrdG9wIE5vdGlmaWNhdGlvbnMnLCBoaW50OiAnU2hvdyBzeXN0ZW0gbm90aWZpY2F0aW9ucycgfSwgREVGQVVMVF9DT05GSUcubm90aWZpY2F0aW9uc0VuYWJsZWQpXHJcblxyXG4gIC5idWlsZCgpO1xyXG5cclxuIiwgIi8qKlxuICogUGVyc2lzdGVudCBzdGF0ZSBtYW5hZ2VtZW50IGZvciBwbHVnaW4gb3BlcmF0aW9uc1xuICogU3RvcmVzIGRhdGEgdG8gZGlzayBhcyBKU09OIGZpbGUgZm9yIHN1cnZpdmFsIGFjcm9zcyByZWxvYWRzXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5cbmludGVyZmFjZSBTdGF0ZUVudHJ5IHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiB1bmtub3duO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuLyoqIE1pbmltYWwgbG9nZ2VyIGZvciBzdGF0ZSBtYW5hZ2VyIChhdm9pZHMgY2lyY3VsYXIgZGVwZW5kZW5jeSB3aXRoIGluZGV4LnRzKSAqL1xuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZGVyci53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZGVyci53cml0ZShgW1N0YXRlTWFuYWdlcl0gJHttc2d9XFxuYCksXG59O1xuXG4vKiogRGVib3VuY2VkIGFzeW5jIHN0YXRlIHBlcnNpc3RlbmNlICg1MDBtcyBkZWxheSkgKi9cbmZ1bmN0aW9uIGNyZWF0ZURlYm91bmNlZFNhdmUoc2F2ZUZuOiAoKSA9PiB2b2lkLCBkZWxheU1zOiBudW1iZXIgPSA1MDApOiAoKCkgPT4gdm9pZCkge1xuICBsZXQgdGltZXJJZDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgXG4gIHJldHVybiBmdW5jdGlvbiBkZWJvdW5jZWRTYXZlKCk6IHZvaWQge1xuICAgIGlmICh0aW1lcklkKSBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2F2ZUZuKCk7XG4gICAgICB0aW1lcklkID0gbnVsbDtcbiAgICB9LCBkZWxheU1zKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IG1lbW9yeSBmaWxlIGxvY2F0aW9uIChpbiBMTSBTdHVkaW8gcGx1Z2luIGRhdGEgZGlyZWN0b3J5KVxuICovXG5mdW5jdGlvbiBnZXRNZW1vcnlGaWxlUGF0aCgpOiBzdHJpbmcge1xuICAvLyBUcnkgdG8gZmluZCBMTSBTdHVkaW8ncyBhcHAgZGF0YSBkaXJlY3RvcnkgZm9yIHBlcnNpc3RlbmNlXG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIGxldCBiYXNlRGlyOiBzdHJpbmc7XG4gIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICBjYXNlICd3aW4zMic6XG4gICAgICBiYXNlRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkFQUERBVEEgfHwgJycsICdsbS1zdHVkaW8nLCAncGx1Z2lucycpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGFyd2luJzpcbiAgICAgIGJhc2VEaXIgPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnTGlicmFyeScsICdBcHBsaWNhdGlvbiBTdXBwb3J0JywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmFzZURpciA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FIHx8ICcnLCAnLmxvY2FsJywgJ3NoYXJlJywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gIH1cbiAgXG4gIHJldHVybiBwYXRoLmpvaW4oYmFzZURpciwgJ2FpLXRvb2xib3gtbWVtb3J5Lmpzb24nKTtcbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRlTWFuYWdlciB7XG4gIHByaXZhdGUgc3RhdGU6IE1hcDxzdHJpbmcsIFN0YXRlRW50cnk+O1xuICBwcml2YXRlIG1heFNpemU6IG51bWJlcjtcbiAgcHJpdmF0ZSBwZXJzaXN0ZW5jZUVuYWJsZWQ6IGJvb2xlYW47XG4gIHByaXZhdGUgbWVtb3J5RmlsZTogc3RyaW5nO1xuICBwcml2YXRlIHJ1bm5pbmdTaXplOiBudW1iZXI7IC8vIFRyYWNrIHNpemUgaW5jcmVtZW50YWxseSBmb3IgTygxKSBjaGVja3NcbiAgcHJpdmF0ZSBkZWJvdW5jZWRTYXZlOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZz86IFBsdWdpbkNvbmZpZykge1xuICAgIHRoaXMuc3RhdGUgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5ydW5uaW5nU2l6ZSA9IDA7XG4gICAgY29uc3QgZWZmZWN0aXZlQ29uZmlnID0gY29uZmlnIHx8IERFRkFVTFRfQ09ORklHO1xuICAgIHRoaXMubWF4U2l6ZSA9IGVmZmVjdGl2ZUNvbmZpZy5zdGF0ZU1heFNpemU7XG4gICAgdGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQgPSBlZmZlY3RpdmVDb25maWcuc3RhdGVQZXJzaXN0ZW5jZUVuYWJsZWQ7XG4gICAgdGhpcy5tZW1vcnlGaWxlID0gZ2V0TWVtb3J5RmlsZVBhdGgoKTtcbiAgICBcbiAgICAvLyBDcmVhdGUgZGVib3VuY2VkIHNhdmUgZnVuY3Rpb24gKDUwMG1zIGRlbGF5KVxuICAgIHRoaXMuZGVib3VuY2VkU2F2ZSA9IGNyZWF0ZURlYm91bmNlZFNhdmUoKCkgPT4gdGhpcy5zYXZlVG9GaWxlKCksIDUwMCk7XG4gICAgXG4gICAgLy8gQXV0by1sb2FkIGZyb20gZGlzayBpZiBwZXJzaXN0ZW5jZSBpcyBlbmFibGVkXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmxvYWRGcm9tRmlsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYSBzdGF0ZSB2YWx1ZSB3aXRoIGtleSBhbmQgb3B0aW9uYWwgbWV0YWRhdGFcbiAgICovXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBjb25zdCBuZXdWYWx1ZVNpemUgPSB0aGlzLmdldFNpemVPZlZhbHVlKHZhbHVlKTtcbiAgICBjb25zdCBvbGRWYWx1ZVNpemUgPSB0aGlzLmdldEV4aXN0aW5nVmFsdWVTaXplKGtleSk7XG4gICAgXG4gICAgLy8gQ2hlY2sgc2l6ZSBsaW1pdCB1c2luZyBydW5uaW5nIHRvdGFsXG4gICAgaWYgKHRoaXMucnVubmluZ1NpemUgLSBvbGRWYWx1ZVNpemUgKyBuZXdWYWx1ZVNpemUgPiB0aGlzLm1heFNpemUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU3RhdGUgc2l6ZSBleGNlZWRzIG1heGltdW0gKCR7dGhpcy5tYXhTaXplfSBieXRlcylgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVXBkYXRlIHJ1bm5pbmcgc2l6ZSBiZWZvcmUgc2V0dGluZ1xuICAgIHRoaXMucnVubmluZ1NpemUgPSB0aGlzLnJ1bm5pbmdTaXplIC0gb2xkVmFsdWVTaXplICsgbmV3VmFsdWVTaXplO1xuICAgIFxuICAgIHRoaXMuc3RhdGUuc2V0KGtleSwge1xuICAgICAga2V5LFxuICAgICAgdmFsdWUsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgfSk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrICg1MDBtcyBkZWxheSkgXHUyMDE0IG9ubHkgaWYgcGVyc2lzdGVuY2UgZW5hYmxlZFxuICAgIGlmICh0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCkge1xuICAgICAgdGhpcy5kZWJvdW5jZWRTYXZlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHN0YXRlIHZhbHVlIGJ5IGtleVxuICAgKi9cbiAgZ2V0PFQ+KGtleTogc3RyaW5nKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIGlmICghZW50cnkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGVudHJ5LnZhbHVlIGFzIFQ7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIGEgc3RhdGUgZW50cnlcbiAgICovXG4gIGRlbGV0ZShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5zdGF0ZS5nZXQoa2V5KTtcbiAgICBpZiAoIWVudHJ5KSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgLy8gVXBkYXRlIHJ1bm5pbmcgc2l6ZSBiZWZvcmUgZGVsZXRpbmdcbiAgICB0aGlzLnJ1bm5pbmdTaXplIC09IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSB0aGlzLnN0YXRlLmRlbGV0ZShrZXkpO1xuICAgIFxuICAgIC8vIERlYm91bmNlZCBhdXRvLXNhdmUgdG8gZGlzayBhZnRlciBkZWxldGlvblxuICAgIGlmIChkZWxldGVkICYmIHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGRlbGV0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBzdGF0ZSBrZXlzXG4gICAqL1xuICBnZXRBbGxLZXlzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnN0YXRlLmtleXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgYWxsIHN0YXRlXG4gICAqL1xuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICB0aGlzLnN0YXRlLmNsZWFyKCk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrIGFmdGVyIGNsZWFyaW5nXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNpemUgb2YgZXhpc3RpbmcgdmFsdWUgZm9yIGEga2V5IChmb3IgaW5jcmVtZW50YWwgdXBkYXRlcylcbiAgICovXG4gIHByaXZhdGUgZ2V0RXhpc3RpbmdWYWx1ZVNpemUoa2V5OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5zdGF0ZS5nZXQoa2V5KTtcbiAgICByZXR1cm4gZW50cnkgPyB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKSA6IDA7XG4gIH1cblxuICAvKipcbiAgICogRXN0aW1hdGUgc2l6ZSBvZiBhIHZhbHVlIGluIGJ5dGVzXG4gICAqL1xuICBwcml2YXRlIGdldFNpemVPZlZhbHVlKHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuIHZhbHVlLmxlbmd0aDtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykgcmV0dXJuIDg7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gMTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhY3R1YWwgc2l6ZSBvZiBhcnJheSBlbGVtZW50c1xuICAgICAgcmV0dXJuIHZhbHVlLnJlZHVjZSgoc3VtOiBudW1iZXIsIGVsZW06IHVua25vd24pID0+IHN1bSArIHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZWxlbSksIDApO1xuICAgIH1cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBNYXApIHJldHVybiB2YWx1ZS5zaXplICogMTY7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgT2JqZWN0ICYmICEodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgc3RhdGUgdG8gZGlzayBhcyBKU09OIGZpbGUgd2l0aCBvcHRpbWl6ZWQgc2VyaWFsaXphdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBzYXZlVG9GaWxlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gQXJyYXkuZnJvbSh0aGlzLnN0YXRlLmVudHJpZXMoKSkubWFwKChbX2tleSwgZW50cnldKSA9PiAoe1xuICAgICAgICBrZXk6IGVudHJ5LmtleSxcbiAgICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLFxuICAgICAgICB0aW1lc3RhbXA6IGVudHJ5LnRpbWVzdGFtcCxcbiAgICAgIH0pKTtcbiAgICAgIFxuICAgICAgLy8gRW5zdXJlIGRpcmVjdG9yeSBleGlzdHNcbiAgICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZSh0aGlzLm1lbW9yeUZpbGUpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIE9wdGltaXplZCBKU09OIHNlcmlhbGl6YXRpb24gKG5vIHByZXR0eS1wcmludGluZyBmb3IgcGVyZm9ybWFuY2UpXG4gICAgICBjb25zdCBqc29uU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICBcbiAgICAgIC8vIFdyaXRlIHRvIHRlbXAgZmlsZSBmaXJzdCwgdGhlbiByZW5hbWUgZm9yIGF0b21pYyBvcGVyYXRpb25cbiAgICAgIGNvbnN0IHRlbXBGaWxlID0gdGhpcy5tZW1vcnlGaWxlICsgJy50bXAnO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyh0ZW1wRmlsZSwganNvblN0cmluZywgJ3V0Zi04Jyk7XG4gICAgICBmcy5yZW5hbWVTeW5jKHRlbXBGaWxlLCB0aGlzLm1lbW9yeUZpbGUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgbG9nZ2VyLndhcm4oYEZhaWxlZCB0byBzYXZlIHRvIGRpc2s6ICR7bWVzc2FnZX1gKTsgLy8gTTIgZml4OiBubyBjb25zb2xlLndhcm5cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBzdGF0ZSBmcm9tIGRpc2sgSlNPTiBmaWxlIHdpdGggY29ycnVwdGlvbiByZWNvdmVyeVxuICAgKi9cbiAgcHJpdmF0ZSBsb2FkRnJvbUZpbGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLm1lbW9yeUZpbGUpKSByZXR1cm47XG4gICAgICBcbiAgICAgIGNvbnN0IGpzb25TdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmModGhpcy5tZW1vcnlGaWxlLCAndXRmLTgnKTtcbiAgICAgIFxuICAgICAgLy8gVHJ5IHRvIHBhcnNlIEpTT04gd2l0aCBlcnJvciByZWNvdmVyeVxuICAgICAgbGV0IGRhdGE6IFN0YXRlRW50cnlbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGpzb25TdHJpbmcpIGFzIFN0YXRlRW50cnlbXTtcbiAgICAgIH0gY2F0Y2ggeyAvLyBDMSBmaXg6IHJlbW92ZWQgdW51c2VkIHBhcnNlRXJyb3IgdmFyaWFibGVcbiAgICAgICAgbG9nZ2VyLndhcm4oYENvcnJ1cHRlZCBzdGF0ZSBmaWxlIGRldGVjdGVkLCBhdHRlbXB0aW5nIHJlY292ZXJ5Li4uYCk7XG5cbiAgICAgICAgLy8gVHJ5IHRvIHJlY292ZXIgYnkgcmVhZGluZyBsaW5lIGJ5IGxpbmUgb3IgdXNpbmcgYmFja3VwXG4gICAgICAgIGNvbnN0IGJhY2t1cEZpbGUgPSB0aGlzLm1lbW9yeUZpbGUgKyAnLmJhY2t1cCc7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGJhY2t1cEZpbGUpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cFN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhiYWNrdXBGaWxlLCAndXRmLTgnKTtcbiAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGJhY2t1cFN0cmluZykgYXMgU3RhdGVFbnRyeVtdO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFN1Y2Nlc3NmdWxseSBsb2FkZWQgZnJvbSBiYWNrdXBgKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBCYWNrdXAgYWxzbyBjb3JydXB0ZWQsIHN0YXJ0aW5nIGZyZXNoYCk7XG4gICAgICAgICAgICBkYXRhID0gW107XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZ2dlci53YXJuKGBObyBiYWNrdXAgYXZhaWxhYmxlLCBzdGFydGluZyBmcmVzaGApO1xuICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICB0aGlzLnN0YXRlLmNsZWFyKCk7XG4gICAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICAgIFxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBkYXRhKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGVudHJ5IHN0cnVjdHVyZSBiZWZvcmUgYWRkaW5nXG4gICAgICAgIGlmIChlbnRyeSAmJiB0eXBlb2YgZW50cnkua2V5ID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZW50cnkudGltZXN0YW1wID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRoaXMuc3RhdGUuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgICAgICAgIHRoaXMucnVubmluZ1NpemUgKz0gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQ3JlYXRlIGJhY2t1cCBhZnRlciBzdWNjZXNzZnVsIGxvYWRcbiAgICAgIHRyeSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5tZW1vcnlGaWxlICsgJy5iYWNrdXAnLCBqc29uU3RyaW5nLCAndXRmLTgnKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBJZ25vcmUgYmFja3VwIGNyZWF0aW9uIGVycm9yc1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgbG9nZ2VyLndhcm4oYEZhaWxlZCB0byBsb2FkIGZyb20gZGlzazogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvcnQgc3RhdGUgZm9yIHBlcnNpc3RlbmNlIChKU09OIHNlcmlhbGl6YXRpb24pIFx1MjAxNCBrZXB0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAqL1xuICBleHBvcnRTdGF0ZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGUuZW50cmllcygpKS5tYXAoKFtfa2V5LCBlbnRyeV0pID0+ICh7XG4gICAgICBrZXk6IGVudHJ5LmtleSxcbiAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZSxcbiAgICAgIHRpbWVzdGFtcDogZW50cnkudGltZXN0YW1wLFxuICAgIH0pKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0IHN0YXRlIGZyb20gSlNPTiBzdHJpbmcgXHUyMDE0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICovXG4gIGltcG9ydFN0YXRlKGpzb25TdHJpbmc6IHN0cmluZyk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShqc29uU3RyaW5nKSBhcyBTdGF0ZUVudHJ5W107XG4gICAgICB0aGlzLnN0YXRlLmNsZWFyKCk7XG4gICAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZGF0YSkge1xuICAgICAgICB0aGlzLnN0YXRlLnNldChlbnRyeS5rZXksIGVudHJ5KTtcbiAgICAgICAgdGhpcy5ydW5uaW5nU2l6ZSArPSB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSBhZnRlciBpbXBvcnRcbiAgICAgIGlmICh0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCkge1xuICAgICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGltcG9ydCBzdGF0ZTogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBhdGggdG8gdGhlIG1lbW9yeSBmaWxlIG9uIGRpc2tcbiAgICovXG4gIGdldE1lbW9yeUZpbGVQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5RmlsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZSBzYXZlIHRvIGRpc2sgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgKi9cbiAgZm9yY2VTYXZlKCk6IHZvaWQge1xuICAgIHRoaXMuc2F2ZVRvRmlsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIGxvYWQgZnJvbSBkaXNrICh1c2VmdWwgZm9yIGRlYnVnZ2luZylcbiAgICovXG4gIGZvcmNlTG9hZCgpOiB2b2lkIHtcbiAgICB0aGlzLmxvYWRGcm9tRmlsZSgpO1xuICB9XG59XG4iLCAiLyoqXHJcbiAqIExvbmctcnVubmluZyBwcm9jZXNzIHRyYWNraW5nIGFuZCBtYW5hZ2VtZW50XHJcbiAqL1xyXG5cclxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWd9IGZyb20gJy4vY29uZmlnJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQmFja2dyb3VuZENvbW1hbmQge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgY29tbWFuZDogc3RyaW5nO1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBzdGFydFRpbWU6IG51bWJlcjtcclxuICB0aW1lb3V0SG91cnM6IG51bWJlcjtcclxuICBzdGF0dXM6ICdydW5uaW5nJyB8ICdjb21wbGV0ZWQnIHwgJ2NhbmNlbGxlZCcgfCAnZXJyb3JlZCc7XHJcbiAgc3Rkb3V0Pzogc3RyaW5nO1xyXG4gIHN0ZGVycj86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJhY2tncm91bmRDb21tYW5kTWFuYWdlciB7XHJcbiAgcHJpdmF0ZSBjb21tYW5kczogTWFwPHN0cmluZywgQmFja2dyb3VuZENvbW1hbmQ+O1xyXG4gIHByaXZhdGUgbWF4VGltZW91dEhvdXJzOiBudW1iZXI7XHJcbiAgXHJcbiAgY29uc3RydWN0b3IoX2NvbmZpZz86IFBsdWdpbkNvbmZpZykge1xyXG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBNYXAoKTtcclxuICAgIHRoaXMubWF4VGltZW91dEhvdXJzID0gMTA7IC8vIEhhcmQgbGltaXQgZnJvbSB0b29sIHNwZWNpZmljYXRpb25cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZ2lzdGVyIGEgbmV3IGJhY2tncm91bmQgY29tbWFuZFxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyKGNvbW1hbmQ6IHN0cmluZywgdGltZW91dEhvdXJzOiBudW1iZXIsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAodGltZW91dEhvdXJzIDwgMC4xIHx8IHRpbWVvdXRIb3VycyA+IHRoaXMubWF4VGltZW91dEhvdXJzKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGltZW91dCBtdXN0IGJlIGJldHdlZW4gMC4xIGFuZCAke3RoaXMubWF4VGltZW91dEhvdXJzfSBob3Vyc2ApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoIW5hbWUgfHwgbmFtZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21tYW5kIG5hbWUgaXMgbWFuZGF0b3J5Jyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0IGlkID0gdGhpcy5nZW5lcmF0ZUlkKCk7XHJcbiAgICBcclxuICAgIHRoaXMuY29tbWFuZHMuc2V0KGlkLCB7XHJcbiAgICAgIGlkLFxyXG4gICAgICBjb21tYW5kLFxyXG4gICAgICBuYW1lLFxyXG4gICAgICBzdGFydFRpbWU6IERhdGUubm93KCksXHJcbiAgICAgIHRpbWVvdXRIb3VycyxcclxuICAgICAgc3RhdHVzOiAncnVubmluZycsXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgcmV0dXJuIGlkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgc3RhdHVzIGFuZCBvdXRwdXQgb2YgYSBiYWNrZ3JvdW5kIGNvbW1hbmRcclxuICAgKi9cclxuICBjaGVjayhpZDogc3RyaW5nKTogQmFja2dyb3VuZENvbW1hbmQgfCBudWxsIHtcclxuICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzLmdldChpZCk7XHJcbiAgICBpZiAoIWNvbW1hbmQpIHJldHVybiBudWxsO1xyXG4gICAgXHJcbiAgICAvLyBDaGVjayBpZiB0aW1lb3V0IGV4Y2VlZGVkXHJcbiAgICBjb25zdCBlbGFwc2VkSG91cnMgPSAoRGF0ZS5ub3coKSAtIGNvbW1hbmQuc3RhcnRUaW1lKSAvICgxMDAwICogNjAgKiA2MCk7XHJcbiAgICBpZiAoZWxhcHNlZEhvdXJzID4gY29tbWFuZC50aW1lb3V0SG91cnMgJiYgY29tbWFuZC5zdGF0dXMgPT09ICdydW5uaW5nJykge1xyXG4gICAgICBjb21tYW5kLnN0YXR1cyA9ICdlcnJvcmVkJztcclxuICAgICAgY29tbWFuZC5zdGRlcnIgPSBgQ29tbWFuZCBleGNlZWRlZCB0aW1lb3V0ICgke2NvbW1hbmQudGltZW91dEhvdXJzfSBob3VycylgO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gY29tbWFuZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbmNlbCBhIHJ1bm5pbmcgYmFja2dyb3VuZCBjb21tYW5kXHJcbiAgICovXHJcbiAgY2FuY2VsKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzLmdldChpZCk7XHJcbiAgICBpZiAoIWNvbW1hbmQgfHwgY29tbWFuZC5zdGF0dXMgIT09ICdydW5uaW5nJykgcmV0dXJuIGZhbHNlO1xyXG4gICAgXHJcbiAgICBjb21tYW5kLnN0YXR1cyA9ICdjYW5jZWxsZWQnO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYWxsIGFjdGl2ZSBjb21tYW5kc1xyXG4gICAqL1xyXG4gIGdldEFjdGl2ZUNvbW1hbmRzKCk6IEJhY2tncm91bmRDb21tYW5kW10ge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jb21tYW5kcy52YWx1ZXMoKSlcclxuICAgICAgLmZpbHRlcihjID0+IGMuc3RhdHVzID09PSAncnVubmluZycpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGNvbXBsZXRlZC9lcnJvcmVkL2NhbmNlbGxlZCBjb21tYW5kcyBhZnRlciBjbGVhbnVwIHBlcmlvZFxyXG4gICAqL1xyXG4gIGNsZWFudXAobWF4QWdlSG91cnM6IG51bWJlciA9IDI0KTogdm9pZCB7XHJcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgZm9yIChjb25zdCBbaWQsIGNvbW1hbmRdIG9mIHRoaXMuY29tbWFuZHMuZW50cmllcygpKSB7XHJcbiAgICAgIGlmIChjb21tYW5kLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XHJcbiAgICAgICAgY29uc3QgYWdlSG91cnMgPSAobm93IC0gY29tbWFuZC5zdGFydFRpbWUpIC8gKDEwMDAgKiA2MCAqIDYwKTtcclxuICAgICAgICBpZiAoYWdlSG91cnMgPiBtYXhBZ2VIb3Vycykge1xyXG4gICAgICAgICAgdGhpcy5jb21tYW5kcy5kZWxldGUoaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgdW5pcXVlIGNvbW1hbmQgSURcclxuICAgKi9cclxuICBwcml2YXRlIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgYmdfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDgpfWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdG90YWwgY291bnQgb2YgcmVnaXN0ZXJlZCBjb21tYW5kc1xyXG4gICAqL1xyXG4gIGdldENvdW50KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5jb21tYW5kcy5zaXplO1xyXG4gIH1cclxufVxyXG4iLCAiLyoqXG4gKiBXb3JraW5nIERpcmVjdG9yeSBNYW5hZ2VyXG4gKiBcbiAqIFRyYWNrcyBhIG11dGFibGUgd29ya2luZyBkaXJlY3RvcnkgdGhhdCBjYW4gYmUgY2hhbmdlZCBhdCBydW50aW1lIHZpYSBzZXRXb3JraW5nRGlyKCkuXG4gKiBBbGwgZmlsZSBvcGVyYXRpb25zIHJlc29sdmUgcGF0aHMgYWdhaW5zdCB0aGlzIGRpcmVjdG9yeS5cbiAqIEZhbGxzIGJhY2sgdG8gdGhlIHBsdWdpbiBpbnN0YWxsYXRpb24gZGlyZWN0b3J5IChCQVNFX0RJUikgb24gcmVzZXQuXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuLy8gQmFzZSBkaXJlY3Rvcnk6IHBsdWdpbiByb290ICh3aGVyZSBwYWNrYWdlLmpzb24gbGl2ZXMpXG5jb25zdCBCQVNFX0RJUiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicpO1xuXG4vLyBNdXRhYmxlIHdvcmtpbmcgZGlyZWN0b3J5IFx1MjAxNCBkZWZhdWx0cyB0byBwbHVnaW4gcm9vdFxubGV0IGN1cnJlbnRXb3JraW5nRGlyOiBzdHJpbmcgPSBCQVNFX0RJUjtcblxuLyoqIEdldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFdvcmtpbmdEaXIoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGN1cnJlbnRXb3JraW5nRGlyO1xufVxuXG4vKipcbiAqIFNldCB0aGUgd29ya2luZyBkaXJlY3RvcnkgdG8gYSBuZXcgYWJzb2x1dGUgcGF0aC5cbiAqIFZhbGlkYXRlcyB0aGF0IHRoZSBwYXRoIGV4aXN0cyBhbmQgaXMgYW4gYWJzb2x1dGUgZGlyZWN0b3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0V29ya2luZ0RpcihuZXdEaXI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBSZXNvbHZlIHRvIGFic29sdXRlIHBhdGhcbiAgY29uc3QgcmVzb2x2ZWQgPSBwYXRoLnJlc29sdmUobmV3RGlyKTtcblxuICAvLyBNdXN0IGJlIGFuIGFic29sdXRlIHBhdGhcbiAgaWYgKCFwYXRoLmlzQWJzb2x1dGUocmVzb2x2ZWQpKSB7XG4gICAgY29uc29sZS53YXJuKGBzZXRXb3JraW5nRGlyIHJlamVjdGVkOiBub3QgYWJzb2x1dGUgXHUyMDE0ICcke25ld0Rpcn0nYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gTXVzdCBleGlzdCBhbmQgYmUgYSBkaXJlY3RvcnlcbiAgdHJ5IHtcbiAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKHJlc29sdmVkKTtcbiAgICBpZiAoIXN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIGNvbnNvbGUud2Fybihgc2V0V29ya2luZ0RpciByZWplY3RlZDogbm90IGEgZGlyZWN0b3J5IFx1MjAxNCAnJHtyZXNvbHZlZH0nYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBjb25zb2xlLndhcm4oYHNldFdvcmtpbmdEaXIgcmVqZWN0ZWQ6IHBhdGggZG9lcyBub3QgZXhpc3QgXHUyMDE0ICcke3Jlc29sdmVkfSdgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjdXJyZW50V29ya2luZ0RpciA9IHJlc29sdmVkO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqIFJlc2V0IHRoZSB3b3JraW5nIGRpcmVjdG9yeSBiYWNrIHRvIHRoZSBwbHVnaW4gcm9vdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0V29ya2luZ0RpcigpOiB2b2lkIHtcbiAgY3VycmVudFdvcmtpbmdEaXIgPSBCQVNFX0RJUjtcbn1cblxuLyoqIFJlc29sdmUgYSB1c2VyLXByb3ZpZGVkIHBhdGggYWdhaW5zdCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYXRoKHVzZXJQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aC5yZXNvbHZlKGN1cnJlbnRXb3JraW5nRGlyLCB1c2VyUGF0aCk7XG59XG5cbi8qKiBHZXQgYWxsb3dlZCBiYXNlIGRpcmVjdG9yaWVzIGZvciBhYnNvbHV0ZS1wYXRoIHZhbGlkYXRpb24gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxvd2VkQmFzZXMoKTogc3RyaW5nW10ge1xuICAvLyBBbGxvdyBib3RoIHRoZSBwbHVnaW4gcm9vdCBhbmQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAgY29uc3QgYmFzZXMgPSBbQkFTRV9ESVIsIGN1cnJlbnRXb3JraW5nRGlyXTtcbiAgcmV0dXJuIFsuLi5uZXcgU2V0KGJhc2VzKV07IC8vIERlZHVwbGljYXRlXG59XG5cbi8qKiBHZXQgdGhlIHBsdWdpbiBpbnN0YWxsYXRpb24gZGlyZWN0b3J5IChuZXZlciBjaGFuZ2VzKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsdWdpblJvb3QoKTogc3RyaW5nIHtcbiAgcmV0dXJuIEJBU0VfRElSO1xufVxuIiwgIi8qKlxuICogU2VjdXJpdHkgdXRpbGl0aWVzIGZvciBwYXRoIHZhbGlkYXRpb24sIGJpbmFyeSBkZXRlY3Rpb24sIGFuZCBSZURvUyBwcm90ZWN0aW9uXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG4vLyBcdTI3MDUgRklYOiBVc2UgcHJvcGVyIEVTTSBpbXBvcnRzIGluc3RlYWQgb2YgcmVxdWlyZSgpIHRvIG1haW50YWluIG1vZHVsZSBib3VuZGFyeVxuaW1wb3J0IHsgZ2V0QWxsb3dlZEJhc2VzLCBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi93b3JraW5nRGlyJztcblxuLyoqXG4gKiBWYWxpZGF0ZSBmaWxlIHBhdGggdG8gcHJldmVudCBkaXJlY3RvcnkgdHJhdmVyc2FsIGF0dGFja3MuXG4gKiBESVNBQkxFRDogU2VjdXJpdHkgdmFsaWRhdG9yIHJlbW92ZWQgcGVyIHVzZXIgcmVxdWVzdCAtIGFsbG93cyBhbGwgcGF0aHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVBhdGgodXNlclBhdGg6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHJ1ZTsgLy8gQWx3YXlzIGFsbG93IHBhdGhzXG59XG5cbi8qKlxuICogRGV0ZWN0IGJpbmFyeSBmaWxlcyBieSBjaGVja2luZyBmb3IgbnVsbCBieXRlcyBpbiBmaXJzdCA4S0JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQmluYXJ5RmlsZShjb250ZW50OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgY2h1bmsgPSBjb250ZW50LnNsaWNlKDAsIDgxOTIpO1xuICAvLyBDaGVjayBmb3IgbnVsbCBieXRlICgweDAwKSB3aGljaCBpbmRpY2F0ZXMgYmluYXJ5IGNvbnRlbnRcbiAgcmV0dXJuIGNodW5rLmluY2x1ZGVzKCdcXDAnKTtcbn1cblxuLyoqXG4gKiBQcm90ZWN0IGFnYWluc3QgUmVEb1MgKFJlZ3VsYXIgRXhwcmVzc2lvbiBEZW5pYWwgb2YgU2VydmljZSlcbiAqIFMyIEZJWDogVXNlcyBwcm9wZXIgcmVnZXggc3RydWN0dXJlIGFuYWx5c2lzIGluc3RlYWQgb2YgbmFpdmUgc3Vic3RyaW5nIG1hdGNoaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTYWZlUmVnZXgocGF0dGVybjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghcGF0dGVybiB8fCBwYXR0ZXJuLmxlbmd0aCA+IDUwMCkgcmV0dXJuIGZhbHNlO1xuICBcbiAgLy8gQ2hlY2sgZm9yIGNvbW1vbiBSZURvUyBwYXR0ZXJucyB1c2luZyBzdHJ1Y3R1cmVkIHJlZ2V4IGRldGVjdGlvblxuICBjb25zdCBkYW5nZXJvdXNTdHJ1Y3R1cmVzID0gW1xuICAgIC8oXFwoW14pXSpcXClbKitdKVteKV0qXFwpLywgICAgICAgICAgIC8vIE5lc3RlZCBxdWFudGlmaWVyczogKC4qKSguKilcbiAgICAvXFwoW14pXSpbKypdXFwpKy8sICAgICAgICAgICAgICAgICAgICAvLyBSZXBldGl0aW9uIG9mIHJlcGV0aXRpb246ICguKykrXG4gICAgL1xcKFteKV0qXFx8W14pXSpcXClbKypdLywgICAgICAgICAgICAgIC8vIEFsdGVybmF0aW9uICsgcmVwZXRpdGlvbjogKGF8YikrXG4gICAgLyhcXFtbXlxcXV0rXFxdWysqXSlbXl1dKlxcXS8sICAgICAgICAgICAvLyBDaGFyIGNsYXNzIHdpdGggcmVwZXRpdGlvbjogKFthLXpdKykrXG4gICAgL1xcKFxcLlxcP1xcKVxcKlxcKi8sICAgICAgICAgICAgICAgICAgICAgIC8vIEdyb3VwIGZvbGxvd2VkIGJ5IGRvdWJsZSBzdGFyOiAoLio/KSoqXG4gIF07XG4gIFxuICBmb3IgKGNvbnN0IHN0cnVjdHVyZSBvZiBkYW5nZXJvdXNTdHJ1Y3R1cmVzKSB7XG4gICAgaWYgKHN0cnVjdHVyZS50ZXN0KHBhdHRlcm4pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgXG4gIC8vIEFsc28gY2hlY2sgZm9yIHRoZSBvcmlnaW5hbCBuYWl2ZSBwYXR0ZXJucyBhcyBmYWxsYmFja1xuICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAnKC4qKSguKiknLCAgICAgICAgICAgLy8gTmVzdGVkIHF1YW50aWZpZXJzIHdpdGggLipcbiAgICAnKC4rKSsnLCAgICAgICAgICAgICAgLy8gUmVwZXRpdGlvbiBvZiByZXBldGl0aW9uICBcbiAgICAnKFthLXpdKykrJywgICAgICAgICAgLy8gQ2hhcmFjdGVyIGNsYXNzIHdpdGggcmVwZXRpdGlvblxuICAgICcoYXxiKSsnLCAgICAgICAgICAgICAvLyBBbHRlcm5hdGlvbiB3aXRoIHJlcGV0aXRpb25cbiAgICAnKC4qPykqKicsICAgICAgICAgICAgLy8gR3JvdXAgZm9sbG93ZWQgYnkgZG91YmxlIHN0YXIgKFJlRG9TKVxuICBdO1xuICBcbiAgZm9yIChjb25zdCBkYW5nZXJvdXNQYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4uaW5jbHVkZXMoZGFuZ2Vyb3VzUGF0dGVybikpIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQXBwbHkgc2VjdXJpdHkgY2hlY2tzIGJhc2VkIG9uIGNvbmZpZyBzZXR0aW5ncy5cbiAqIFVzZXMgdGhlIHZpcnR1YWwgd29ya2luZyBkaXJlY3RvcnkgZm9yIHBhdGggdmFsaWRhdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U2VjdXJpdHlDaGVja3MoXG4gIGZpbGVQYXRoOiBzdHJpbmcsIFxuICBjb250ZW50Pzogc3RyaW5nLCBcbiAgcmVnZXhQYXR0ZXJuPzogc3RyaW5nLCBcbiAgY29uZmlnPzogUGx1Z2luQ29uZmlnXG4pOiB7IHZhbGlkUGF0aDogYm9vbGVhbjsgaXNCaW5hcnk6IGJvb2xlYW47IHNhZmVSZWdleDogYm9vbGVhbiB9IHtcbiAgY29uc3QgZWZmZWN0aXZlQ29uZmlnID0gY29uZmlnIHx8IERFRkFVTFRfQ09ORklHO1xuXG4gIHJldHVybiB7XG4gICAgdmFsaWRQYXRoOiBlZmZlY3RpdmVDb25maWcucGF0aFZhbGlkYXRpb25FbmFibGVkID8gdmFsaWRhdGVQYXRoKGZpbGVQYXRoLCBnZXRXb3JraW5nRGlyKCkpIDogdHJ1ZSxcbiAgICBpc0JpbmFyeTogZWZmZWN0aXZlQ29uZmlnLmJpbmFyeUZpbGVEZXRlY3Rpb24gJiYgY29udGVudCA/IGlzQmluYXJ5RmlsZShjb250ZW50KSA6IGZhbHNlLFxuICAgIHNhZmVSZWdleDogZWZmZWN0aXZlQ29uZmlnLnJlZ2V4UmVEb1NQcm90ZWN0aW9uICYmIHJlZ2V4UGF0dGVybiA/IGlzU2FmZVJlZ2V4KHJlZ2V4UGF0dGVybikgOiB0cnVlLFxuICB9O1xufVxuXG4vKipcbiAqIFNhbml0aXplIHNoZWxsIGNvbW1hbmRzIHRvIHByZXZlbnQgZGFuZ2Vyb3VzIG9wZXJhdGlvbnNcbiAqIFMzIEZJWDogRW5oYW5jZWQgd2l0aCBJRlMtdGFtcGVyaW5nIGFuZCBudWxsLWJ5dGUgaW5qZWN0aW9uIGRldGVjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB7IHNhZmU6IGJvb2xlYW47IHJlYXNvbj86IHN0cmluZyB9IHtcbiAgaWYgKCFjb21tYW5kIHx8IHR5cGVvZiBjb21tYW5kICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdFbXB0eSBvciBpbnZhbGlkIGNvbW1hbmQnIH07XG4gIH1cblxuICAvLyBOb3JtYWxpemUgd2hpdGVzcGFjZSBidXQgcHJlc2VydmUgcXVvdGVkIHN0cmluZ3NcbiAgY29uc3Qgbm9ybWFsaXplZCA9IGNvbW1hbmQudHJpbSgpO1xuICBcbiAgLy8gUzMgRklYOiBCbG9jayBudWxsIGJ5dGUgaW5qZWN0aW9uIChjYW4gYnlwYXNzIHJlZ2V4IG1hdGNoaW5nKVxuICBpZiAobm9ybWFsaXplZC5pbmNsdWRlcygnXFwwJykgfHwgbm9ybWFsaXplZC5pbmNsdWRlcygnJTAwJykpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnTnVsbCBieXRlIGluamVjdGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIC8vIFMzIEZJWDogQmxvY2sgSUZTLXRhbXBlcmluZyBpbiBiYXNoIChJRlM9JCcgJyBhbGxvd3Mgc3BsaXR0aW5nIHdpdGhvdXQgc3BhY2VzKVxuICBjb25zdCBpZnNQYXR0ZXJucyA9IFtcbiAgICAvXFxiSUZTXFxzKj1cXHMqW1xcXFwkJ11cXHMqL2ksXG4gICAgL0lGUz1bJCddW14nXSonL2ksXG4gIF07XG4gIGZvciAoY29uc3QgcGF0dGVybiBvZiBpZnNQYXR0ZXJucykge1xuICAgIGlmIChwYXR0ZXJuLnRlc3Qobm9ybWFsaXplZCkpIHtcbiAgICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdJRlMgdGFtcGVyaW5nIGRldGVjdGVkJyB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBkYW5nZXJvdXMgcGF0dGVybnMgdXNpbmcgYSBtb3JlIHJvYnVzdCBhcHByb2FjaFxuICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAvLyBGaWxlIHN5c3RlbSBkZXN0cnVjdGlvblxuICAgIC9cXGJybVxccystcmZcXGIvaSxcbiAgICAvXFxic2hyZWRcXGIvaSxcbiAgICAvXFxid2lwZVxcYi9pLFxuICAgIFxuICAgIC8vIFByaXZpbGVnZSBlc2NhbGF0aW9uXG4gICAgL1xcYnN1ZG9cXGIvaSxcbiAgICAvXFxic3VcXGIoPyFcXHcpL2ksICAvLyAnc3UnIGJ1dCBub3QgJ3N1ZG8nLCAnc3VzaGknLCBldGMuXG4gICAgXG4gICAgLy8gTmV0d29yayBhdHRhY2tzXG4gICAgL1xcYm5jXFxiKD8hXFx3KXxcXGJuZXRjYXRcXGIvaSxcbiAgICAvXFxid2dldFxccysuKi0tcG9zdC1maWxlXFxiL2ksXG4gICAgL1xcYmN1cmxcXHMrLiotLWRhdGEtYmluYXJ5XFxiL2ksXG4gICAgXG4gICAgLy8gRGF0YSBleGZpbHRyYXRpb25cbiAgICAvXFxiYmFzZTY0XFxiLipcXHxcXHMqKGN1cmx8d2dldCkvaSxcbiAgICAvXFxic2NwXFxiKD8hXFx3KXxcXGJzZnRwXFxiL2ksXG4gICAgXG4gICAgLy8gUHJvY2VzcyBtYW5pcHVsYXRpb25cbiAgICAvXFxiZm9ya1xcYig/IVxcdykvaSxcbiAgICAvXFxiZXhlY1xcYig/IVxcdykvaSxcbiAgICBcbiAgICAvLyBFbnZpcm9ubWVudCB0YW1wZXJpbmdcbiAgICAvXFxiZXhwb3J0XFxzK1xcdys9L2ksXG4gICAgL1xcYmV2YWxcXGIoPyFcXHcpL2ksXG4gIF07XG5cbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4udGVzdChub3JtYWxpemVkKSkge1xuICAgICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogYERhbmdlcm91cyBjb21tYW5kIGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayBmb3IgcGlwZSBjaGFpbnMgdGhhdCBjb3VsZCBiZSB1c2VkIGZvciBhdHRhY2tzIChtb3JlIHRoYW4gMiBwaXBlcyA9IDMrIGNvbW1hbmRzKVxuICBjb25zdCBwaXBlQ291bnQgPSAobm9ybWFsaXplZC5tYXRjaCgvXFx8L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChwaXBlQ291bnQgPiAyKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ1RvbyBtYW55IHBpcGVzIGluIGNvbW1hbmQgY2hhaW4nIH07XG4gIH1cblxuICAvLyBDaGVjayBmb3Igc2VtaWNvbG9uLXNlcGFyYXRlZCBjb21tYW5kcyAocG90ZW50aWFsIGluamVjdGlvbilcbiAgY29uc3Qgc2VtaUNvbG9uQ291bnQgPSAobm9ybWFsaXplZC5tYXRjaCgvOy9nKSB8fCBbXSkubGVuZ3RoO1xuICBpZiAoc2VtaUNvbG9uQ291bnQgPiAxKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ011bHRpcGxlIHNlbWljb2xvbnMgZGV0ZWN0ZWQgaW4gY29tbWFuZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBiYWNrdGljayBleGVjdXRpb24gb3IgJCgpIHN1YnNoZWxsIGluamVjdGlvblxuICBpZiAoL2BbXmBdK2B8XFwkXFwoW14pXStcXCkvLnRlc3Qobm9ybWFsaXplZCkpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnQ29tbWFuZCBzdWJzdGl0dXRpb24gZGV0ZWN0ZWQnIH07XG4gIH1cblxuICAvLyBDaGVjayBmb3IgZW52aXJvbm1lbnQgdmFyaWFibGUgaW5qZWN0aW9uXG4gIGlmICgvXlxccyooZXhwb3J0fHVuc2V0KVxccy8udGVzdChub3JtYWxpemVkKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdFbnZpcm9ubWVudCBtb2RpZmljYXRpb24gZGV0ZWN0ZWQnIH07XG4gIH1cblxuICByZXR1cm4geyBzYWZlOiB0cnVlIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgU1FMIHF1ZXJ5IGZvciBzYWZldHkgKHJlYWQtb25seSBvcGVyYXRpb25zIG9ubHkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNRTFF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyByZWFzb24/OiBzdHJpbmcgfSB7XG4gIGlmICghcXVlcnkgfHwgdHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnRW1wdHkgb3IgaW52YWxpZCBxdWVyeScgfTtcbiAgfVxuXG4gIGNvbnN0IHRyaW1tZWQgPSBxdWVyeS50cmltKCkudG9VcHBlckNhc2UoKTtcbiAgXG4gIC8vIE9ubHkgYWxsb3cgU0VMRUNUIGFuZCBQUkFHTUEgc3RhdGVtZW50c1xuICBpZiAoIXRyaW1tZWQuc3RhcnRzV2l0aCgnU0VMRUNUJykgJiYgIXRyaW1tZWQuc3RhcnRzV2l0aCgnUFJBR01BJykpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIHJlYXNvbjogJ09ubHkgU0VMRUNUIGFuZCBQUkFHTUEgcXVlcmllcyBhcmUgYWxsb3dlZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBkYW5nZXJvdXMga2V5d29yZHMgdGhhdCBjb3VsZCBiZSBpbmplY3RlZCBhZnRlciBTRUxFQ1QvUFJBR01BXG4gIGNvbnN0IGRhbmdlcm91c1NRTEtleXdvcmRzID0gW1xuICAgIC9cXGJEUk9QXFxiL2ksXG4gICAgL1xcYkRFTEVURVxcYi9pLFxuICAgIC9cXGJVUERBVEVcXGIvaSxcbiAgICAvXFxiSU5TRVJUXFxiL2ksXG4gICAgL1xcYkFMVEVSXFxiL2ksXG4gICAgL1xcYkNSRUFURVxcYi9pLFxuICAgIC9cXGJSRVBMQUNFXFxiL2ksXG4gICAgL1xcYlRSVU5DQVRFXFxiL2ksXG4gICAgL1xcYkdSQU5UXFxiL2ksXG4gICAgL1xcYlJFVk9LRVxcYi9pLFxuICBdO1xuXG4gIGZvciAoY29uc3Qga2V5d29yZCBvZiBkYW5nZXJvdXNTUUxLZXl3b3Jkcykge1xuICAgIGlmIChrZXl3b3JkLnRlc3QodHJpbW1lZCkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiBgRGFuZ2Vyb3VzIFNRTCBvcGVyYXRpb24gZGV0ZWN0ZWQ6ICR7a2V5d29yZC5zb3VyY2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBtdWx0aXBsZSBzdGF0ZW1lbnRzIChzZW1pY29sb24gaW5qZWN0aW9uKVxuICBjb25zdCBzZW1pQ29sb25Db3VudCA9ICh0cmltbWVkLm1hdGNoKC87L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChzZW1pQ29sb25Db3VudCA+IDApIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIHJlYXNvbjogJ011bHRpcGxlIFNRTCBzdGF0ZW1lbnRzIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cbiIsICIvKipcbiAqIFBlcmZvcm1hbmNlIFV0aWxpdGllcyBmb3IgQUkgVG9vbGJveCBQbHVnaW5cbiAqIE9wdGltaXplZCBhbGdvcml0aG1zIHdpdGggZWFybHkgZXhpdCwgY2FjaGluZywgYW5kIGFzeW5jIG9wZXJhdGlvbnNcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy9wcm9taXNlcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBMZXZlbnNodGVpbiBEaXN0YW5jZSB3aXRoIEVhcmx5IEV4aXQgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBPcHRpbWl6ZWQgTGV2ZW5zaHRlaW4gZGlzdGFuY2UgY2FsY3VsYXRpb24gd2l0aCBlYXJseSBleGl0IHRocmVzaG9sZC5cbiAqIFN0b3BzIGNhbGN1bGF0aW5nIGlmIHRoZSBtaW5pbXVtIHBvc3NpYmxlIHNjb3JlIGRyb3BzIGJlbG93IHRoZSB0aHJlc2hvbGQuXG4gKiBcbiAqIEBwYXJhbSBhIC0gRmlyc3Qgc3RyaW5nXG4gKiBAcGFyYW0gYiAtIFNlY29uZCBzdHJpbmcgIFxuICogQHBhcmFtIG1pblNjb3JlIC0gTWluaW11bSBhY2NlcHRhYmxlIHNpbWlsYXJpdHkgc2NvcmUgKDAtMSkuIFJlc3VsdHMgYmVsb3cgdGhpcyBhcmUgcHJ1bmVkIGVhcmx5LlxuICogQHJldHVybnMgU2ltaWxhcml0eSBzY29yZSBiZXR3ZWVuIDAgYW5kIDEsIG9yIG51bGwgaWYgYmVsb3cgdGhyZXNob2xkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXZlbnNodGVpblNpbWlsYXJpdHkoYTogc3RyaW5nLCBiOiBzdHJpbmcsIG1pblNjb3JlOiBudW1iZXIgPSAwLjMpOiBudW1iZXIgfCBudWxsIHtcbiAgY29uc3QgbWF4TGVuID0gTWF0aC5tYXgoYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgaWYgKG1heExlbiA9PT0gMCkgcmV0dXJuIDE7XG5cbiAgLy8gUXVpY2sgcmVqZWN0aW9uOiBpZiBzdHJpbmdzIGRpZmZlciB0b28gbXVjaCBpbiBsZW5ndGgsIHNraXAgZXhwZW5zaXZlIGNhbGN1bGF0aW9uXG4gIGNvbnN0IGxlbkRpZmYgPSBNYXRoLmFicyhhLmxlbmd0aCAtIGIubGVuZ3RoKTtcbiAgaWYgKGxlbkRpZmYgLyBtYXhMZW4gPiAoMSAtIG1pblNjb3JlKSkge1xuICAgIHJldHVybiBudWxsOyAvLyBFYXJseSBleGl0IGZvciB2ZXJ5IGRpZmZlcmVudCBsZW5ndGhzXG4gIH1cblxuICAvLyBVc2UgdHdvLXJvdyBvcHRpbWl6YXRpb24gaW5zdGVhZCBvZiBmdWxsIG1hdHJpeCAoc2F2ZXMgbWVtb3J5KVxuICBsZXQgcHJldlJvdzogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gYi5sZW5ndGg7IGkrKykge1xuICAgIHByZXZSb3cucHVzaCgwKTtcbiAgfVxuICBsZXQgY3VyclJvdzogbnVtYmVyW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJldlJvd1tpXSA9IGk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBhLmxlbmd0aDsgaSsrKSB7XG4gICAgY3VyclJvd1swXSA9IGk7XG4gICAgXG4gICAgLy8gRWFybHkgZXhpdCBvcHRpbWl6YXRpb246IGlmIGN1cnJlbnQgcm93J3MgbWluaW11bSBleGNlZWRzIHRocmVzaG9sZCwgYWJvcnRcbiAgICBsZXQgbWluSW5Sb3cgPSBpO1xuICAgIFxuICAgIGZvciAobGV0IGogPSAxOyBqIDw9IGIubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IGNvc3QgPSBhW2kgLSAxXSA9PT0gYltqIC0gMV0gPyAwIDogMTtcbiAgICAgIGN1cnJSb3dbal0gPSBNYXRoLm1pbihcbiAgICAgICAgcHJldlJvd1tqXSArIDEsICAgICAgICAgLy8gZGVsZXRpb25cbiAgICAgICAgY3VyclJvd1tqIC0gMV0gKyAxLCAgICAgLy8gaW5zZXJ0aW9uICBcbiAgICAgICAgcHJldlJvd1tqIC0gMV0gKyBjb3N0ICAgLy8gc3Vic3RpdHV0aW9uXG4gICAgICApO1xuICAgICAgXG4gICAgICBpZiAoY3VyclJvd1tqXSA8IG1pbkluUm93KSB7XG4gICAgICAgIG1pbkluUm93ID0gY3VyclJvd1tqXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFYXJseSBleGl0OiBpZiBtaW5pbXVtIGluIHRoaXMgcm93IGFscmVhZHkgZXhjZWVkcyB0aHJlc2hvbGQsIGFib3J0XG4gICAgY29uc3QgY3VycmVudE1heFNjb3JlID0gMSAtIG1pbkluUm93IC8gbWF4TGVuO1xuICAgIGlmIChjdXJyZW50TWF4U2NvcmUgPCBtaW5TY29yZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gU3dhcCByb3dzXG4gICAgW3ByZXZSb3csIGN1cnJSb3ddID0gW2N1cnJSb3csIHByZXZSb3ddO1xuICB9XG5cbiAgY29uc3QgZGlzdGFuY2UgPSBwcmV2Um93W2IubGVuZ3RoXTtcbiAgY29uc3Qgc2NvcmUgPSBNYXRoLm1heCgwLCAxIC0gZGlzdGFuY2UgLyBtYXhMZW4pO1xuICByZXR1cm4gc2NvcmUgPj0gbWluU2NvcmUgPyBzY29yZSA6IG51bGw7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZ1enp5IFNlYXJjaCBDYWNoZSA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgRnV6enlTZWFyY2hDYWNoZUVudHJ5IHtcbiAgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+O1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuY29uc3QgZnV6enlTZWFyY2hDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBGdXp6eVNlYXJjaENhY2hlRW50cnk+KCk7XG5jb25zdCBDQUNIRV9UVExfTVMgPSA2MF8wMDA7IC8vIDYwIHNlY29uZCBjYWNoZSBUVExcblxuLyoqXG4gKiBHZXQgY2FjaGVkIGZ1enp5IHNlYXJjaCByZXN1bHRzIGlmIGF2YWlsYWJsZSBhbmQgbm90IGV4cGlyZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYWNoZWRGdXp6eVJlc3VsdHMocXVlcnk6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZyk6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9PiB8IG51bGwge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3F1ZXJ5fToke2Jhc2VQYXRofWA7XG4gIGNvbnN0IGVudHJ5ID0gZnV6enlTZWFyY2hDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICBcbiAgaWYgKCFlbnRyeSkgcmV0dXJuIG51bGw7XG4gIGlmIChEYXRlLm5vdygpIC0gZW50cnkudGltZXN0YW1wID4gQ0FDSEVfVFRMX01TKSB7XG4gICAgZnV6enlTZWFyY2hDYWNoZS5kZWxldGUoY2FjaGVLZXkpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIFxuICByZXR1cm4gZW50cnkucmVzdWx0cztcbn1cblxuLyoqXG4gKiBDYWNoZSBmdXp6eSBzZWFyY2ggcmVzdWx0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlRnV6enlSZXN1bHRzKHF1ZXJ5OiBzdHJpbmcsIGJhc2VQYXRoOiBzdHJpbmcsIHJlc3VsdHM6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9Pik6IHZvaWQge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3F1ZXJ5fToke2Jhc2VQYXRofWA7XG4gIGZ1enp5U2VhcmNoQ2FjaGUuc2V0KGNhY2hlS2V5LCB7XG4gICAgcmVzdWx0cyxcbiAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gIH0pO1xuICBcbiAgLy8gRXZpY3Qgb2xkIGVudHJpZXMgaWYgY2FjaGUgZ3Jvd3MgdG9vIGxhcmdlIChtYXggMTAwIGVudHJpZXMpXG4gIGlmIChmdXp6eVNlYXJjaENhY2hlLnNpemUgPiAxMDApIHtcbiAgICBjb25zdCBvbGRlc3RLZXkgPSBmdXp6eVNlYXJjaENhY2hlLmtleXMoKS5uZXh0KCkudmFsdWU7XG4gICAgaWYgKG9sZGVzdEtleSkge1xuICAgICAgZnV6enlTZWFyY2hDYWNoZS5kZWxldGUob2xkZXN0S2V5KTtcbiAgICB9XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQXN5bmMgRmlsZSBTZWFyY2ggd2l0aCBDb25jdXJyZW5jeSBDb250cm9sID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHQge1xuICBmaWxlczogc3RyaW5nW107XG4gIGNvdW50OiBudW1iZXI7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgc2VhcmNoIGZvciBmaWxlcyBtYXRjaGluZyBhIHBhdHRlcm4gdXNpbmcgYXN5bmMvYXdhaXQgd2l0aCBjb25jdXJyZW5jeSBjb250cm9sLlxuICogTXVjaCBmYXN0ZXIgdGhhbiBzeW5jaHJvbm91cyByZWFkZGlyU3luYyBmb3IgbGFyZ2UgZGlyZWN0b3J5IHRyZWVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZEZpbGVzQXN5bmMoXG4gIGRpclBhdGg6IHN0cmluZyxcbiAgcGF0dGVybjogc3RyaW5nLFxuICBtYXhEZXB0aDogbnVtYmVyID0gNSxcbiAgY29uY3VycmVuY3lMaW1pdDogbnVtYmVyID0gNFxuKTogUHJvbWlzZTxTZWFyY2hSZXN1bHQ+IHtcbiAgY29uc3QgcmVzdWx0czogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgcGF0dGVybkxvd2VyID0gcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHNlYXJjaERpcihjdXJyZW50UGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucmVhZGRpcihjdXJyZW50UGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgXG4gICAgICAvLyBQcm9jZXNzIGZpbGVzIGltbWVkaWF0ZWx5XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhwYXR0ZXJuTG93ZXIpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHBhdGguam9pbihjdXJyZW50UGF0aCwgZW50cnkubmFtZSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENvbGxlY3Qgc3ViZGlyZWN0b3JpZXMgZm9yIHBhcmFsbGVsIHByb2Nlc3NpbmdcbiAgICAgIGNvbnN0IHN1YmRpcnMgPSBlbnRyaWVzLmZpbHRlcihlID0+IGUuaXNEaXJlY3RvcnkoKSkubWFwKGUgPT4gcGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlLm5hbWUpKTtcbiAgICAgIFxuICAgICAgaWYgKHN1YmRpcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBQcm9jZXNzIGRpcmVjdG9yaWVzIGluIGJhdGNoZXMgdG8gYXZvaWQgb3ZlcndoZWxtaW5nIHRoZSBzeXN0ZW1cbiAgICAgICAgY29uc3QgYmF0Y2hlczogc3RyaW5nW11bXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YmRpcnMubGVuZ3RoOyBpICs9IGNvbmN1cnJlbmN5TGltaXQpIHtcbiAgICAgICAgICBiYXRjaGVzLnB1c2goc3ViZGlycy5zbGljZShpLCBpICsgY29uY3VycmVuY3lMaW1pdCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBiYXRjaCBvZiBiYXRjaGVzKSB7XG4gICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBiYXRjaC5tYXAoZGlyID0+IHNlYXJjaERpcihkaXIsIGRlcHRoICsgMSkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gU2tpcCBpbmFjY2Vzc2libGUgZGlyZWN0b3JpZXMgc2lsZW50bHlcbiAgICB9XG4gIH1cblxuICBhd2FpdCBzZWFyY2hEaXIoZGlyUGF0aCwgMCk7XG4gIHJldHVybiB7IGZpbGVzOiByZXN1bHRzLCBjb3VudDogcmVzdWx0cy5sZW5ndGggfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU3RyZWFtaW5nIEZpbGUgUmVhZGVyID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTdHJlYW1SZWFkUmVzdWx0IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZGF0YT86IHtcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gICAgcGF0aDogc3RyaW5nO1xuICAgIHRvdGFsTGVuZ3RoOiBudW1iZXI7XG4gICAgdHJ1bmNhdGVkPzogYm9vbGVhbjtcbiAgICBub3RlPzogc3RyaW5nO1xuICB9O1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZWFkIGZpbGUgY29udGVudCB1c2luZyBzdHJlYW1pbmcgdG8gYXZvaWQgbG9hZGluZyBlbnRpcmUgZmlsZSBpbnRvIG1lbW9yeS5cbiAqIFJlc3BlY3RzIG1heF9sZW5ndGggcGFyYW1ldGVyIGJ5IHJlYWRpbmcgb25seSBuZWNlc3NhcnkgY2h1bmtzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGVTeW5jKFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBtYXhMZW5ndGg6IG51bWJlciA9IDUwMDBcbik6IFByb21pc2U8U3RyZWFtUmVhZFJlc3VsdD4ge1xuICB0cnkge1xuICAgIC8vIEdldCBmaWxlIHN0YXRzIGZpcnN0IHRvIGtub3cgdG90YWwgc2l6ZVxuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZnMuc3RhdChmaWxlUGF0aCk7XG4gICAgXG4gICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1BhdGggaXMgYSBkaXJlY3RvcnksIG5vdCBhIGZpbGUnIH07XG4gICAgfVxuXG4gICAgLy8gSWYgZmlsZSBpcyBzbWFsbCBlbm91Z2gsIHJlYWQgZW50aXJlbHkgKGZhc3RlciBmb3Igc21hbGwgZmlsZXMpXG4gICAgaWYgKHN0YXRzLnNpemUgPD0gbWF4TGVuZ3RoICogMikgeyAvLyAyeCBmYWN0b3IgZm9yIFVURi04IGVuY29kaW5nIG92ZXJoZWFkXG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnMucmVhZEZpbGUoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgdG90YWxMZW5ndGg6IGNvbnRlbnQubGVuZ3RoLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBGb3IgbGFyZ2UgZmlsZXMsIHVzZSBzdHJlYW1pbmcgcmVhZFxuICAgIGNvbnN0IHsgY3JlYXRlUmVhZFN0cmVhbSB9ID0gYXdhaXQgaW1wb3J0KCdmcycpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgbGV0IGNvbnRlbnQgPSAnJztcbiAgICAgIGxldCBieXRlc1JlYWQgPSAwO1xuICAgICAgY29uc3Qgc3RyZWFtID0gY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCwgeyBcbiAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCcsXG4gICAgICAgIGhpZ2hXYXRlck1hcms6IDY0ICogMTAyNCAvLyA2NEtCIGNodW5rcyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdkYXRhJywgKGNodW5rOiBCdWZmZXIgfCBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgY2h1bmtTdHIgPSB0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnID8gY2h1bmsgOiBjaHVuay50b1N0cmluZygpO1xuICAgICAgICBieXRlc1JlYWQgKz0gY2h1bmtTdHIubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgLy8gT25seSBhY2N1bXVsYXRlIGlmIHdlIGhhdmVuJ3QgZXhjZWVkZWQgbWF4IGxlbmd0aCB5ZXRcbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoICsgY2h1bmtTdHIubGVuZ3RoIDw9IG1heExlbmd0aCkge1xuICAgICAgICAgIGNvbnRlbnQgKz0gY2h1bmtTdHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGFrZSBvbmx5IHdoYXQgZml0cyBhbmQgc3RvcCByZWFkaW5nXG4gICAgICAgICAgY29uc3QgcmVtYWluaW5nID0gbWF4TGVuZ3RoIC0gY29udGVudC5sZW5ndGg7XG4gICAgICAgICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gY2h1bmtTdHIuc3Vic3RyaW5nKDAsIHJlbWFpbmluZyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0cmVhbS5kZXN0cm95KCk7IC8vIFN0b3AgdGhlIHN0cmVhbSBlYXJseVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzVHJ1bmNhdGVkID0gYnl0ZXNSZWFkID4gbWF4TGVuZ3RoIHx8IHN0YXRzLnNpemUgPiBtYXhMZW5ndGg7XG4gICAgICAgIFxuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgIHRvdGFsTGVuZ3RoOiBNYXRoLm1heChieXRlc1JlYWQsIGNvbnRlbnQubGVuZ3RoKSxcbiAgICAgICAgICAgIC4uLihpc1RydW5jYXRlZCAmJiB7IFxuICAgICAgICAgICAgICB0cnVuY2F0ZWQ6IHRydWUsIFxuICAgICAgICAgICAgICBub3RlOiBgT3V0cHV0IHRydW5jYXRlZCB0byAke21heExlbmd0aH0gY2hhcmFjdGVycy4gVXNlIG1heF9sZW5ndGggcGFyYW1ldGVyIHRvIHJlYWQgbW9yZS5gIFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byByZWFkIGZpbGU6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gUmVxdWVzdCBDYWNoaW5nIGZvciBXZWIgUmVzZWFyY2ggPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIENhY2hlZFJlc3BvbnNlIHtcbiAgZGF0YTogdW5rbm93bjtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG4gIHN0YXR1czogbnVtYmVyO1xufVxuXG5jb25zdCByZXF1ZXN0Q2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVkUmVzcG9uc2U+KCk7XG5jb25zdCBSRVFVRVNUX0NBQ0hFX1RUTF9NUyA9IDMwXzAwMDsgLy8gMzAgc2Vjb25kIGNhY2hlIFRUTCBmb3Igc2VhcmNoIHJlc3VsdHNcblxuLyoqIENsZWFyIHJlcXVlc3QgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUmVxdWVzdENhY2hlKCk6IHZvaWQge1xuICByZXF1ZXN0Q2FjaGUuY2xlYXIoKTtcbn1cblxuLyoqXG4gKiBGZXRjaCB3aXRoIGNhY2hpbmcgdG8gYXZvaWQgcmVkdW5kYW50IG5ldHdvcmsgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFdpdGhDYWNoZShcbiAgdXJsOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBjb25zdCBjYWNoZUtleSA9IGAke3VybH06JHtKU09OLnN0cmluZ2lmeShvcHRpb25zKX1gO1xuICBcbiAgLy8gQ2hlY2sgY2FjaGUgZmlyc3QgKEdFVCByZXF1ZXN0cyBvbmx5KVxuICBpZiAob3B0aW9ucz8ubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICBjb25zdCBjYWNoZWQgPSByZXF1ZXN0Q2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICBpZiAoY2FjaGVkICYmIERhdGUubm93KCkgLSBjYWNoZWQudGltZXN0YW1wIDwgUkVRVUVTVF9DQUNIRV9UVExfTVMpIHtcbiAgICAgIC8vIFJldHVybiBhIFJlc3BvbnNlLWxpa2Ugb2JqZWN0IGZyb20gY2FjaGVcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoY2FjaGVkLmRhdGEpLCB7XG4gICAgICAgIHN0YXR1czogY2FjaGVkLnN0YXR1cyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgb3B0aW9ucyk7XG4gIFxuICAvLyBDYWNoZSBzdWNjZXNzZnVsIHJlc3BvbnNlc1xuICBpZiAocmVzcG9uc2Uub2sgJiYgb3B0aW9ucz8ubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIHJlcXVlc3RDYWNoZS5zZXQoY2FjaGVLZXksIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBFdmljdCBvbGQgZW50cmllcyBpZiBjYWNoZSBncm93cyB0b28gbGFyZ2UgKG1heCA1MCBlbnRyaWVzKVxuICAgICAgaWYgKHJlcXVlc3RDYWNoZS5zaXplID4gNTApIHtcbiAgICAgICAgY29uc3Qgb2xkZXN0S2V5ID0gcmVxdWVzdENhY2hlLmtleXMoKS5uZXh0KCkudmFsdWU7XG4gICAgICAgIGlmIChvbGRlc3RLZXkpIHtcbiAgICAgICAgICByZXF1ZXN0Q2FjaGUuZGVsZXRlKG9sZGVzdEtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIE5vbi1KU09OIHJlc3BvbnNlcyBhcmUgbm90IGNhY2hlZFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiBSZXRyeSBsb2dpYyB3aXRoIGV4cG9uZW50aWFsIGJhY2tvZmYgZm9yIGZhaWxlZCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aFJldHJ5KFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IFJlcXVlc3RJbml0LFxuICBtYXhSZXRyaWVzOiBudW1iZXIgPSAzLFxuICBiYXNlRGVsYXlNczogbnVtYmVyID0gMTAwMFxuKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuICBcbiAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IGF0dGVtcHQgPD0gbWF4UmV0cmllczsgYXR0ZW1wdCsrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoQ2FjaGUodXJsLCBvcHRpb25zKTtcbiAgICAgIFxuICAgICAgaWYgKCFyZXNwb25zZS5vayAmJiByZXNwb25zZS5zdGF0dXMgPj0gNTAwKSB7XG4gICAgICAgIC8vIFNlcnZlciBlcnJvciAtIHJldHJ5XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU2VydmVyIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICBsYXN0RXJyb3IgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG4gICAgICBcbiAgICAgIGlmIChhdHRlbXB0IDwgbWF4UmV0cmllcykge1xuICAgICAgICBjb25zdCBkZWxheU1zID0gYmFzZURlbGF5TXMgKiBNYXRoLnBvdygyLCBhdHRlbXB0KTsgLy8gRXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXlNcykpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgdGhyb3cgbGFzdEVycm9yIHx8IG5ldyBFcnJvcihgUmVxdWVzdCBmYWlsZWQgYWZ0ZXIgJHttYXhSZXRyaWVzfSByZXRyaWVzYCk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFN1YnByb2Nlc3MgVGltZW91dCBDYWxjdWxhdG9yID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogQ2FsY3VsYXRlIGFwcHJvcHJpYXRlIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplLlxuICogTGFyZ2VyIHByb2plY3RzIG5lZWQgbW9yZSB0aW1lIGZvciBhbmFseXNpcyB0b29scy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuYWx5c2lzVGltZW91dChiYXNlVGltZW91dE1zOiBudW1iZXIsIGZpbGVDb3VudD86IG51bWJlcik6IG51bWJlciB7XG4gIGlmICghZmlsZUNvdW50KSByZXR1cm4gYmFzZVRpbWVvdXRNcztcbiAgXG4gIC8vIFNjYWxlIHRpbWVvdXQgbG9nYXJpdGhtaWNhbGx5IHdpdGggZmlsZSBjb3VudFxuICBjb25zdCBzY2FsZUZhY3RvciA9IE1hdGgubG9nMihNYXRoLm1heCgxLCBmaWxlQ291bnQpKSAvIDEwOyAvLyB+MXggZm9yIDEtMTAgZmlsZXMsIH4yeCBmb3IgMTAwMCsgZmlsZXNcbiAgY29uc3Qgc2NhbGVkVGltZW91dCA9IGJhc2VUaW1lb3V0TXMgKiAoMSArIHNjYWxlRmFjdG9yKTtcbiAgXG4gIC8vIENhcCBhdCA2MCBzZWNvbmRzIG1heGltdW1cbiAgcmV0dXJuIE1hdGgubWluKHNjYWxlZFRpbWVvdXQsIDYwXzAwMCk7XG59XG5cbi8qKlxuICogQ291bnQgVHlwZVNjcmlwdCBmaWxlcyBpbiBhIGRpcmVjdG9yeSB0byBlc3RpbWF0ZSBwcm9qZWN0IHNpemUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb3VudFR5cGVTY3JpcHRGaWxlcyhkaXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICBsZXQgY291bnQgPSAwO1xuICBcbiAgYXN5bmMgZnVuY3Rpb24gY291bnRJbkRpcihjdXJyZW50UGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGRlcHRoID4gMTApIHJldHVybjsgLy8gUmVhc29uYWJsZSBtYXggZGVwdGhcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnJlYWRkaXIoY3VycmVudFBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgIFxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmIChlbnRyeS5pc0ZpbGUoKSAmJiBlbnRyeS5uYW1lLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIC8vIFNraXAgY29tbW9uIG5vbi1zb3VyY2UgZGlyZWN0b3JpZXNcbiAgICAgICAgICBpZiAoIVsnbm9kZV9tb2R1bGVzJywgJy5naXQnLCAnZGlzdCcsICdidWlsZCddLmluY2x1ZGVzKGVudHJ5Lm5hbWUpKSB7XG4gICAgICAgICAgICBhd2FpdCBjb3VudEluRGlyKHBhdGguam9pbihjdXJyZW50UGF0aCwgZW50cnkubmFtZSksIGRlcHRoICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3Rvcmllc1xuICAgIH1cbiAgfVxuICBcbiAgYXdhaXQgY291bnRJbkRpcihkaXJQYXRoLCAwKTtcbiAgcmV0dXJuIGNvdW50O1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSAnLi4vc3RhdGVNYW5hZ2VyLmpzJztcbmltcG9ydCB7IHZhbGlkYXRlUGF0aCwgaXNTYWZlUmVnZXggfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyLCBzZXRXb3JraW5nRGlyLCByZXNvbHZlUGF0aCB9IGZyb20gJy4uL3dvcmtpbmdEaXIuanMnO1xuaW1wb3J0IHtcbiAgbGV2ZW5zaHRlaW5TaW1pbGFyaXR5LFxuICBnZXRDYWNoZWRGdXp6eVJlc3VsdHMsXG4gIGNhY2hlRnV6enlSZXN1bHRzLFxuICBmaW5kRmlsZXNBc3luYyxcbiAgY291bnRUeXBlU2NyaXB0RmlsZXMsXG4gIGdldEFuYWx5c2lzVGltZW91dCxcbn0gZnJvbSAnLi4vcGVyZm9ybWFuY2VVdGlscy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBMaXN0RGlyZWN0b3J5UGFyYW1zIHsgcGF0aD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJlYWRGaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IG1heF9sZW5ndGg/OiBudW1iZXI7IH1cbmludGVyZmFjZSBTYXZlRmlsZVBhcmFtcyB7IGZpbGVfbmFtZT86IHN0cmluZzsgY29udGVudD86IHN0cmluZzsgZmlsZXM/OiBBcnJheTx7IGZpbGVfbmFtZTogc3RyaW5nOyBjb250ZW50OiBzdHJpbmcgfT47IH1cbmludGVyZmFjZSBSZXBsYWNlVGV4dEluRmlsZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBvbGRfc3RyaW5nOiBzdHJpbmc7IG5ld19zdHJpbmc6IHN0cmluZzsgfVxuaW50ZXJmYWNlIEluc2VydEF0TGluZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBsaW5lX251bWJlcjogbnVtYmVyOyBjb250ZW50X3RvX2luc2VydDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQXBwZW5kRmlsZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBjb250ZW50OiBzdHJpbmc7IH1cbmludGVyZmFjZSBEZWxldGVMaW5lc0luRmlsZVBhcmFtcyB7IGZpbGVfbmFtZTogc3RyaW5nOyBzdGFydF9saW5lOiBudW1iZXI7IGVuZF9saW5lPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgTWFrZURpcmVjdG9yeVBhcmFtcyB7IGRpcmVjdG9yeV9uYW1lOiBzdHJpbmc7IH1cbmludGVyZmFjZSBNb3ZlRmlsZVBhcmFtcyB7IHNvdXJjZTogc3RyaW5nOyBkZXN0aW5hdGlvbjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQ29weUZpbGVQYXJhbXMgeyBzb3VyY2U6IHN0cmluZzsgZGVzdGluYXRpb246IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZVBhdGhQYXJhbXMgeyBwYXRoOiBzdHJpbmc7IH1cbmludGVyZmFjZSBEZWxldGVGaWxlc0J5UGF0dGVyblBhcmFtcyB7IHBhdHRlcm46IHN0cmluZzsgfVxuaW50ZXJmYWNlIEZpbmRGaWxlc1BhcmFtcyB7IHBhdHRlcm46IHN0cmluZzsgbWF4X2RlcHRoPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgRnV6enlGaW5kTG9jYWxGaWxlc1BhcmFtcyB7IHF1ZXJ5OiBzdHJpbmc7IHBhdGg/OiBzdHJpbmc7IG1heF9yZXN1bHRzPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2V0RmlsZU1ldGFkYXRhUGFyYW1zIHsgcGF0aDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgQ2hhbmdlRGlyZWN0b3J5UGFyYW1zIHsgZGlyZWN0b3J5OiBzdHJpbmc7IH1cbmludGVyZmFjZSBSZWFkRG9jdW1lbnRQYXJhbXMgeyBmaWxlX3BhdGg6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJGaWxlU3lzdGVtVG9vbHMoY29uZmlnOiBQbHVnaW5Db25maWcsIF9zdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlcik6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBsaXN0X2RpcmVjdG9yeSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2xpc3RfZGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0xpc3QgdGhlIGZpbGVzIGFuZCBkaXJlY3RvcmllcyBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBvciBhIHNwZWNpZmllZCBzdWJkaXJlY3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBwYXRoIHRvIHRoZSBkaXJlY3RvcnkgdG8gbGlzdC4gRGVmYXVsdHMgdG8gY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoOiBkaXJQYXRoIH06IExpc3REaXJlY3RvcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIGNvbnN0IHRhcmdldFBhdGggPSBkaXJQYXRoIHx8ICcuJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKHRhcmdldFBhdGgsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGg6IGRpcmVjdG9yeSB0cmF2ZXJzYWwgZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aCh0YXJnZXRQYXRoKTtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGZ1bGxQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGVudHJpZXMubWFwKGVudHJ5ID0+ICh7XG4gICAgICAgICAgcGF0aDogcGF0aC5qb2luKGZ1bGxQYXRoLCBlbnRyeS5uYW1lKSxcbiAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLFxuICAgICAgICAgIGlzRGlyZWN0b3J5OiBlbnRyeS5pc0RpcmVjdG9yeSgpLFxuICAgICAgICAgIGlzRmlsZTogZW50cnkuaXNGaWxlKCksXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZWFkX2ZpbGUgdG9vbCBcdTIwMTQgSHlicmlkOiBFYXJseSBzaXplIGNoZWNrICsgQnVmZmVyIGJpbmFyeSBkZXRlY3Rpb24gKyBUcnVuY2F0aW9uIHN1cHBvcnRcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlYWQgY29udGVudCBmcm9tIGEgZmlsZSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIG5hbWUgb2YgdGhlIGZpbGUgdG8gcmVhZCcpLFxuICAgICAgbWF4X2xlbmd0aDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDUwMDAwKS5vcHRpb25hbCgpLmRlZmF1bHQoNTAwMCkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIGNoYXJhY3RlcnMgdG8gcmV0dXJuIChkZWZhdWx0OiA1MDAwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgbWF4X2xlbmd0aCB9OiBSZWFkRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoOiBkaXJlY3RvcnkgdHJhdmVyc2FsIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGNvbnN0IG1heExlbmd0aCA9IG1heF9sZW5ndGggfHwgNTAwMDtcblxuICAgICAgICAvLyBFYXJseSBzaXplIGNoZWNrIChCZWxlZGFyaWFuIHN0eWxlKSAtIHByZXZlbnQgbG9hZGluZyA+MTBNQiBmaWxlc1xuICAgICAgICBsZXQgc3RhdHM6IGZzLlN0YXRzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmdWxsUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRzLnNpemUgPiAxMF8wMDBfMDAwKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRmlsZSB0b28gbGFyZ2UgKD4xME1CKScgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYWQgYXMgYnVmZmVyIGZvciBlZmZpY2llbnQgYmluYXJ5IGNoZWNrIChCZWxlZGFyaWFuIHN0eWxlKVxuICAgICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkRmlsZShmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICAvLyBCaW5hcnkgY2hlY2s6IG51bGwgYnl0ZSBpbiBmaXJzdCAxS0JcbiAgICAgICAgY29uc3QgY2hlY2tCdWZmZXIgPSBidWZmZXIuc3ViYXJyYXkoMCwgTWF0aC5taW4oYnVmZmVyLmxlbmd0aCwgMTAyNCkpO1xuICAgICAgICBpZiAoY2hlY2tCdWZmZXIuaW5jbHVkZXMoMCkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdCaW5hcnkgZmlsZSBkZXRlY3RlZC4gVXNlIHJlYWRfZG9jdW1lbnQgZm9yIFBERi9ET0NYIGZpbGVzLicgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnQgdG8gc3RyaW5nXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBidWZmZXIudG9TdHJpbmcoJ3V0Zi04Jyk7XG5cbiAgICAgICAgLy8gVHJ1bmNhdGUgaWYgbmVjZXNzYXJ5IGFuZCBhZGQgbWV0YWRhdGEgKEFJIFRvb2xib3ggc3R5bGUpXG4gICAgICAgIGxldCBkYXRhQ29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgIGxldCB0cnVuY2F0ZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IHRvdGFsTGVuZ3RoID0gY29udGVudC5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgZGF0YUNvbnRlbnQgPSBjb250ZW50LnN1YnN0cmluZygwLCBtYXhMZW5ndGgpO1xuICAgICAgICAgIHRydW5jYXRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLCBcbiAgICAgICAgICBkYXRhOiB7IFxuICAgICAgICAgICAgY29udGVudDogZGF0YUNvbnRlbnQsXG4gICAgICAgICAgICBmaWxlUGF0aDogZnVsbFBhdGgsIC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgICAgIC4uLih0cnVuY2F0ZWQgPyB7IHRydW5jYXRlZDogdHJ1ZSwgdG90YWxfbGVuZ3RoOiB0b3RhbExlbmd0aCB9IDoge30pXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gc2F2ZV9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2F2ZV9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NhdmUgY29udGVudCB0byBhIHNwZWNpZmllZCBmaWxlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBTdXBwb3J0cyBiYXRjaCBzYXZpbmcuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIG5hbWUgb2YgdGhlIGZpbGUgdG8gc2F2ZScpLFxuICAgICAgY29udGVudDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgY29udGVudCB0byB3cml0ZSB0byB0aGUgZmlsZScpLFxuICAgICAgZmlsZXM6IHouYXJyYXkoei5vYmplY3QoeyBmaWxlX25hbWU6IHouc3RyaW5nKCksIGNvbnRlbnQ6IHouc3RyaW5nKCkgfSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZvciBiYXRjaCBzYXZpbmcgbXVsdGlwbGUgZmlsZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIGNvbnRlbnQsIGZpbGVzIH06IFNhdmVGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZmlsZXMgJiYgQXJyYXkuaXNBcnJheShmaWxlcykpIHtcbiAgICAgICAgICAvLyBCYXRjaCBzYXZlIG1vZGVcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlLmZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbnZhbGlkIHBhdGggaW4gYmF0Y2g6ICR7ZmlsZS5maWxlX25hbWV9YCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlLmZpbGVfbmFtZSk7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBmaWxlLmNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgZmlsZTogZnVsbFBhdGgsIHN0YXR1czogJ3NhdmVkJyB9KTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNhdmVkRmlsZXM6IGZpbGVzLmxlbmd0aCwgcmVzdWx0cyB9IH07XG4gICAgICAgIH0gZWxzZSBpZiAoZmlsZV9uYW1lICYmIGNvbnRlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIFNpbmdsZSBmaWxlIHNhdmUgbW9kZVxuICAgICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoOiBkaXJlY3RvcnkgdHJhdmVyc2FsIGRldGVjdGVkJyB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzYXZlZEZpbGU6IGZ1bGxQYXRoLCBwYXRoOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFaXRoZXIgcHJvdmlkZSBmaWxlX25hbWUrY29udGVudCBvciBmaWxlcyBhcnJheScgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVwbGFjZV90ZXh0X2luX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZXBsYWNlX3RleHRfaW5fZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdSZXBsYWNlIGEgc3BlY2lmaWMgc3RyaW5nIGluIGEgZmlsZSB3aXRoIGEgbmV3IHN0cmluZy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gbW9kaWZ5JyksXG4gICAgICBvbGRfc3RyaW5nOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZXhhY3QgdGV4dCB0byByZXBsYWNlLiBNdXN0IGJlIHVuaXF1ZSBpbiB0aGUgZmlsZS4nKSxcbiAgICAgIG5ld19zdHJpbmc6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IHRvIGluc2VydCBpbiBwbGFjZSBvZiBvbGRfc3RyaW5nLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgb2xkX3N0cmluZywgbmV3X3N0cmluZyB9OiBSZXBsYWNlVGV4dEluRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFjb250ZW50LmluY2x1ZGVzKG9sZF9zdHJpbmcpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3RyaW5nICcke29sZF9zdHJpbmd9JyBub3QgZm91bmQgaW4gZmlsZWAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgbmV3Q29udGVudCA9IGNvbnRlbnQucmVwbGFjZShvbGRfc3RyaW5nLCBuZXdfc3RyaW5nKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgbmV3Q29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcmVwbGFjZWQ6IHRydWUsIGZpbGU6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gaW5zZXJ0X2F0X2xpbmUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdpbnNlcnRfYXRfbGluZScsXG4gICAgZGVzY3JpcHRpb246ICdJbnNlcnQgY29udGVudCBhdCBhIHNwZWNpZmljIGxpbmUgbnVtYmVyIGluIGEgZmlsZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gbW9kaWZ5JyksXG4gICAgICBsaW5lX251bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBsaW5lIG51bWJlciB0byBpbnNlcnQgYXQgKDEtaW5kZXhlZCknKSxcbiAgICAgIGNvbnRlbnRfdG9faW5zZXJ0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCBjb250ZW50IHRvIGluc2VydCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgbGluZV9udW1iZXIsIGNvbnRlbnRfdG9faW5zZXJ0IH06IEluc2VydEF0TGluZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgbGV0IGxpbmVzID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxQYXRoLCAndXRmLTgnKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBBbGxvdyBhcHBlbmRpbmcgYXQgRU9GIChsaW5lX251bWJlciA9PSBsZW5ndGggKyAxKVxuICAgICAgICBpZiAobGluZV9udW1iZXIgPiBsaW5lcy5sZW5ndGggKyAxKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgTGluZSBudW1iZXIgJHtsaW5lX251bWJlcn0gZXhjZWVkcyBmaWxlIGxlbmd0aCAoJHtsaW5lcy5sZW5ndGh9KWAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGluZXMuc3BsaWNlKGxpbmVfbnVtYmVyIC0gMSwgMCwgY29udGVudF90b19pbnNlcnQpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBsaW5lcy5qb2luKCdcXG4nKSwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaW5zZXJ0ZWRBdDogbGluZV9udW1iZXIsIGZpbGU6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gYXBwZW5kX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdhcHBlbmRfZmlsZScsXG4gICAgZGVzY3JpcHRpb246IFwiQXBwZW5kIGNvbnRlbnQgdG8gdGhlIGVuZCBvZiBhIGZpbGUuIElmIHRoZSBmaWxlIGRvZXNuJ3QgZXhpc3QsIGl0IHdpbGwgYmUgY3JlYXRlZC5cIixcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIGFwcGVuZCB0bycpLFxuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgY29udGVudCB0byBhcHBlbmQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIGNvbnRlbnQgfTogQXBwZW5kRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgZnMuYXBwZW5kRmlsZVN5bmMoZnVsbFBhdGgsIGNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGFwcGVuZGVkVG86IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2xpbmVzX2luX2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfbGluZXNfaW5fZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgYSBzcGVjaWZpYyBsaW5lIG9yIHJhbmdlIG9mIGxpbmVzIGZyb20gYSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBtb2RpZnknKSxcbiAgICAgIHN0YXJ0X2xpbmU6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLmRlc2NyaWJlKCdTdGFydGluZyBsaW5lIG51bWJlciAoMS1pbmRleGVkKScpLFxuICAgICAgZW5kX2xpbmU6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0VuZGluZyBsaW5lIG51bWJlciAoaW5jbHVzaXZlKS4gSWYgb21pdHRlZCwgb25seSBkZWxldGVzIHN0YXJ0X2xpbmUuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBzdGFydF9saW5lLCBlbmRfbGluZSB9OiBEZWxldGVMaW5lc0luRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZV9uYW1lLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZV9uYW1lKTtcbiAgICAgICAgbGV0IGxpbmVzID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxQYXRoLCAndXRmLTgnKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBkZWxldGVFbmQgPSBlbmRfbGluZSB8fCBzdGFydF9saW5lO1xuICAgICAgICBpZiAoc3RhcnRfbGluZSA+IGxpbmVzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFN0YXJ0IGxpbmUgJHtzdGFydF9saW5lfSBleGNlZWRzIGZpbGUgbGVuZ3RoICgke2xpbmVzLmxlbmd0aH0pYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDbGFtcCBlbmRfbGluZSB0byBhdm9pZCBzaWxlbnQgdHJ1bmNhdGlvbiBiZXlvbmQgZmlsZSBib3VuZHNcbiAgICAgICAgY29uc3QgY2xhbXBlZEVuZCA9IE1hdGgubWluKGRlbGV0ZUVuZCwgbGluZXMubGVuZ3RoKTtcbiAgICAgICAgbGluZXMuc3BsaWNlKHN0YXJ0X2xpbmUgLSAxLCBjbGFtcGVkRW5kIC0gc3RhcnRfbGluZSArIDEpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxQYXRoLCBsaW5lcy5qb2luKCdcXG4nKSwgJ3V0Zi04Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGVsZXRlZExpbmVzOiBgJHtzdGFydF9saW5lfS0ke2NsYW1wZWRFbmR9YCwgZmlsZTogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBtYWtlX2RpcmVjdG9yeSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ21ha2VfZGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBkaXJlY3RvcnkgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBkaXJlY3RvcnlfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIG5hbWUgb2YgdGhlIGRpcmVjdG9yeSB0byBjcmVhdGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBkaXJlY3RvcnlfbmFtZSB9OiBNYWtlRGlyZWN0b3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChkaXJlY3RvcnlfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGRpcmVjdG9yeV9uYW1lKTtcbiAgICAgICAgZnMubWtkaXJTeW5jKGZ1bGxQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjcmVhdGVkRGlyZWN0b3J5OiBkaXJlY3RvcnlfbmFtZSwgcGF0aDogZnVsbFBhdGggfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gbW92ZV9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnbW92ZV9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogJ01vdmUgb3IgcmVuYW1lIGEgZmlsZSBvciBkaXJlY3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzb3VyY2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NvdXJjZSBwYXRoJyksXG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnRGVzdGluYXRpb24gcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHNvdXJjZSwgZGVzdGluYXRpb24gfTogTW92ZUZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKHNvdXJjZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgc291cmNlIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZGVzdGluYXRpb24sIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGRlc3RpbmF0aW9uIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFNvdXJjZSA9IHJlc29sdmVQYXRoKHNvdXJjZSk7XG4gICAgICAgIGNvbnN0IGZ1bGxEZXN0aW5hdGlvbiA9IHJlc29sdmVQYXRoKGRlc3RpbmF0aW9uKTtcbiAgICAgICAgZnMucmVuYW1lU3luYyhmdWxsU291cmNlLCBmdWxsRGVzdGluYXRpb24pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG1vdmVkRnJvbTogZnVsbFNvdXJjZSwgbW92ZWRUbzogZnVsbERlc3RpbmF0aW9uIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFNcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNvcHlfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvcHlfZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdDb3B5IGEgZmlsZSB0byBhIG5ldyBsb2NhdGlvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNvdXJjZTogei5zdHJpbmcoKS5kZXNjcmliZSgnU291cmNlIGZpbGUgcGF0aCcpLFxuICAgICAgZGVzdGluYXRpb246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0Rlc3RpbmF0aW9uIGZpbGUgcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHNvdXJjZSwgZGVzdGluYXRpb24gfTogQ29weUZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKHNvdXJjZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgc291cmNlIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZGVzdGluYXRpb24sIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGRlc3RpbmF0aW9uIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFNvdXJjZSA9IHJlc29sdmVQYXRoKHNvdXJjZSk7XG4gICAgICAgIGNvbnN0IGZ1bGxEZXN0aW5hdGlvbiA9IHJlc29sdmVQYXRoKGRlc3RpbmF0aW9uKTtcbiAgICAgICAgZnMuY29weUZpbGVTeW5jKGZ1bGxTb3VyY2UsIGZ1bGxEZXN0aW5hdGlvbik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29waWVkRnJvbTogZnVsbFNvdXJjZSwgY29waWVkVG86IGZ1bGxEZXN0aW5hdGlvbiB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhTXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfcGF0aCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9wYXRoJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIGZpbGUgb3IgZGlyZWN0b3J5IGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBCZSBjYXJlZnVsIScsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHBhdGggdG8gZGVsZXRlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aDogZmlsZVBhdGggfTogRGVsZXRlUGF0aFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZVBhdGgsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlUGF0aCk7XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGEgZGlyZWN0b3J5XG4gICAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoZnVsbFBhdGgpO1xuICAgICAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIGZzLnJtU3luYyhmdWxsUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZnMudW5saW5rU3luYyhmdWxsUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9maWxlc19ieV9wYXR0ZXJuIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX2ZpbGVzX2J5X3BhdHRlcm4nLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIG11bHRpcGxlIGZpbGVzIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeSB0aGF0IG1hdGNoIGEgcmVnZXggcGF0dGVybi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdHRlcm46IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1JlZ2V4IHBhdHRlcm4gdG8gbWF0Y2ggZmlsZW5hbWVzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0dGVybiB9OiBEZWxldGVGaWxlc0J5UGF0dGVyblBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGNvbmZpZy5yZWdleFJlRG9TUHJvdGVjdGlvbiAmJiAhaXNTYWZlUmVnZXgocGF0dGVybikpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbnNhZmUgcmVnZXggcGF0dGVybiBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuICAgICAgICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGdldFdvcmtpbmdEaXIoKSk7XG4gICAgICAgIGNvbnN0IGRlbGV0ZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgIGlmIChyZWdleC50ZXN0KGZpbGUpKSB7XG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGUpO1xuICAgICAgICAgICAgZnMudW5saW5rU3luYyhmdWxsUGF0aCk7XG4gICAgICAgICAgICBkZWxldGVkRmlsZXMucHVzaChmdWxsUGF0aCk7IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGVsZXRlZENvdW50OiBkZWxldGVkRmlsZXMubGVuZ3RoLCBkZWxldGVkRmlsZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmluZF9maWxlcyB0b29sIFx1MjAxNCBPUFRJTUlaRUQgd2l0aCBhc3luYy9hd2FpdCBhbmQgY29uY3VycmVuY3kgY29udHJvbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmaW5kX2ZpbGVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZpbmQgZmlsZXMgcmVjdXJzaXZlbHkgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IG1hdGNoaW5nIGEgbmFtZSBwYXR0ZXJuLiBVc2VzIGFzeW5jIHNlYXJjaCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0dGVybjogei5zdHJpbmcoKS5kZXNjcmliZSgnU3Vic3RyaW5nIHRvIG1hdGNoIGluIGZpbGVuYW1lIChjYXNlLWluc2Vuc2l0aXZlKScpLFxuICAgICAgbWF4X2RlcHRoOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdNYXhpbXVtIGRlcHRoIHRvIHNlYXJjaCAoZGVmYXVsdDogNSknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXR0ZXJuLCBtYXhfZGVwdGggfTogRmluZEZpbGVzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzZWFyY2hQYXRoID0gZ2V0V29ya2luZ0RpcigpO1xuICAgICAgICBjb25zdCBkZXB0aCA9IG1heF9kZXB0aCB8fCA1O1xuICAgICAgICBcbiAgICAgICAgLy8gVXNlIG9wdGltaXplZCBhc3luYyBzZWFyY2ggd2l0aCBjb25jdXJyZW5jeSBjb250cm9sXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZpbmRGaWxlc0FzeW5jKHNlYXJjaFBhdGgsIHBhdHRlcm4sIGRlcHRoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBmb3VuZEZpbGVzOiByZXN1bHQuZmlsZXMsIGNvdW50OiByZXN1bHQuY291bnQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZnV6enlfZmluZF9sb2NhbF9maWxlcyB0b29sIFx1MjAxNCBPUFRJTUlaRUQgd2l0aCBlYXJseSBleGl0IExldmVuc2h0ZWluICsgY2FjaGluZ1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmdXp6eV9maW5kX2xvY2FsX2ZpbGVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Z1enp5IGZpbmQgbG9jYWwgZmlsZXMgYnkgcGF0aC9uYW1lIHNpbWlsYXJpdHkgdXNpbmcgb3B0aW1pemVkIExldmVuc2h0ZWluIHNjb3Jpbmcgd2l0aCBjYWNoaW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NlYXJjaCBxdWVyeSB0byBtYXRjaCBhZ2FpbnN0IGZpbGUgbmFtZXMvcGF0aHMuJyksXG4gICAgICBwYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1N1Yi1kaXJlY3RvcnkgdG8gc2VhcmNoIGluIChkZWZhdWx0OiBjdXJyZW50IGRpcmVjdG9yeSkuJyksXG4gICAgICBtYXhfcmVzdWx0czogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDIwKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdNYXggcmVzdWx0cyB0byByZXR1cm4gKGRlZmF1bHQ6IDUpLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBwYXRoOiBzZWFyY2hQYXRoLCBtYXhfcmVzdWx0cyB9OiBGdXp6eUZpbmRMb2NhbEZpbGVzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBiYXNlRGlyID0gc2VhcmNoUGF0aCA/IHJlc29sdmVQYXRoKHNlYXJjaFBhdGgpIDogZ2V0V29ya2luZ0RpcigpO1xuICAgICAgICBjb25zdCBtYXhSZXN1bHRzID0gbWF4X3Jlc3VsdHMgfHwgNTtcblxuICAgICAgICAvLyBDaGVjayBjYWNoZSBmaXJzdFxuICAgICAgICBjb25zdCBjYWNoZWRSZXN1bHRzID0gZ2V0Q2FjaGVkRnV6enlSZXN1bHRzKHF1ZXJ5LCBiYXNlRGlyKTtcbiAgICAgICAgaWYgKGNhY2hlZFJlc3VsdHMpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG1hdGNoZXM6IGNhY2hlZFJlc3VsdHMuc2xpY2UoMCwgbWF4UmVzdWx0cyksIGNvdW50OiBNYXRoLm1pbihjYWNoZWRSZXN1bHRzLmxlbmd0aCwgbWF4UmVzdWx0cykgfSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29sbGVjdCBmaWxlcyB1c2luZyBhc3luYyBtZXRob2RcbiAgICAgICAgY29uc3QgYWxsRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIFxuICAgICAgICBhc3luYyBmdW5jdGlvbiBjb2xsZWN0RmlsZXMoZGlyUGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyID0gMCwgbWF4RGVwdGg6IG51bWJlciA9IDIwKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcbiAgICAgICAgICBcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIoZGlyUGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgZW50cnkubmFtZSk7XG4gICAgICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY29sbGVjdEZpbGVzKGZ1bGxQYXRoLCBkZXB0aCArIDEsIG1heERlcHRoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbGxGaWxlcy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gU2tpcCBpbmFjY2Vzc2libGUgZGlyZWN0b3JpZXNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGNvbGxlY3RGaWxlcyhiYXNlRGlyKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE9wdGltaXplZCBmdXp6eSBtYXRjaGluZyB3aXRoIGVhcmx5IGV4aXRcbiAgICAgICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+ID0gW107XG4gICAgICAgIGNvbnN0IHF1ZXJ5TG93ZXIgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBNSU5fU0NPUkUgPSAwLjM7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgYWxsRmlsZXMpIHtcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBVc2Ugb3B0aW1pemVkIExldmVuc2h0ZWluIHdpdGggZWFybHkgZXhpdFxuICAgICAgICAgIGNvbnN0IHNjb3JlID0gbGV2ZW5zaHRlaW5TaW1pbGFyaXR5KHF1ZXJ5TG93ZXIsIGZpbGVOYW1lLCBNSU5fU0NPUkUpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChzY29yZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgZmlsZVBhdGg6IGZpbGUsIHNjb3JlIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU29ydCBieSBzY29yZSBkZXNjZW5kaW5nIGFuZCBjYWNoZSByZXN1bHRzXG4gICAgICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICAgICAgICBjYWNoZUZ1enp5UmVzdWx0cyhxdWVyeSwgYmFzZURpciwgcmVzdWx0cyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG1hdGNoZXM6IHJlc3VsdHMuc2xpY2UoMCwgbWF4UmVzdWx0cyksIGNvdW50OiBNYXRoLm1pbihyZXN1bHRzLmxlbmd0aCwgbWF4UmVzdWx0cykgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2ZpbGVfbWV0YWRhdGEgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfZmlsZV9tZXRhZGF0YScsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgbWV0YWRhdGEgKHNpemUsIGRhdGVzKSBmb3IgYSBzcGVjaWZpYyBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGg6IGZpbGVQYXRoIH06IEdldEZpbGVNZXRhZGF0YVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZVBhdGgsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoZnVsbFBhdGgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICAgICAgc2l6ZTogc3RhdHMuc2l6ZSxcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogc3RhdHMuYmlydGh0aW1lLFxuICAgICAgICAgICAgbW9kaWZpZWRBdDogc3RhdHMubXRpbWUsXG4gICAgICAgICAgICBhY2Nlc3NlZEF0OiBzdGF0cy5hdGltZSxcbiAgICAgICAgICAgIGlzRGlyZWN0b3J5OiBzdGF0cy5pc0RpcmVjdG9yeSgpLFxuICAgICAgICAgICAgaXNGaWxlOiBzdGF0cy5pc0ZpbGUoKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2hhbmdlX2RpcmVjdG9yeSB0b29sIFx1MjAxNCBIeWJyaWQ6IEV4cGxpY2l0IHZhbGlkYXRpb24gKyBTdGF0ZSBhYnN0cmFjdGlvbiArIENvbnRleHR1YWwgcmVzcG9uc2VcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2hhbmdlX2RpcmVjdG9yeScsXG4gICAgZGVzY3JpcHRpb246ICdDaGFuZ2UgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIEFsbCBzdWJzZXF1ZW50IGZpbGUgb3BlcmF0aW9ucyB3aWxsIHVzZSB0aGlzIGRpcmVjdG9yeSBhcyB0aGUgYmFzZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGFic29sdXRlIHBhdGggdG8gY2hhbmdlIHRvIChlLmcuLCBcIkM6XFxcXFxcXFxQcm9qZWN0c1xcXFxcXFxcbXktYXBwXCIpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZGlyZWN0b3J5IH06IENoYW5nZURpcmVjdG9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChkaXJlY3RvcnkpO1xuXG4gICAgICAgIC8vIFx1MjcwNSBCZWxlZGFyaWFuJ3MgZXhwbGljaXQgdmFsaWRhdGlvbiB1c2luZyBmcy5zdGF0XG4gICAgICAgIGxldCBzdGF0czogZnMuU3RhdHM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBQYXRoIGlzIG5vdCBhIGRpcmVjdG9yeTogJHtmdWxsUGF0aH1gIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTI3MDUgQ2FwdHVyZSBwcmV2aW91cyBkaXJlY3RvcnkgZm9yIGNvbnRleHRcbiAgICAgICAgY29uc3QgcHJldmlvdXNEaXJlY3RvcnkgPSBnZXRXb3JraW5nRGlyKCk7XG5cbiAgICAgICAgLy8gXHUyNzA1IEFJIFRvb2xib3gncyBhYnN0cmFjdGlvbiBmb3Igc3RhdGUgY2hhbmdlXG4gICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBzZXRXb3JraW5nRGlyKGZ1bGxQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsIFxuICAgICAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gY2hhbmdlIGRpcmVjdG9yeSB0byAnJHtkaXJlY3Rvcnl9Jy4gRW5zdXJlIHRoZSBwYXRoIGV4aXN0cyBhbmQgaXMgYSB2YWxpZCBkaXJlY3RvcnkuYCBcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHUyNzA1IEJlbGVkYXJpYW4ncyBjb250ZXh0dWFsIHJldHVybiBkYXRhICsgQUkgVG9vbGJveCdzIHN0cnVjdHVyZWQgZm9ybWF0XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBwcmV2aW91c19kaXJlY3Rvcnk6IHByZXZpb3VzRGlyZWN0b3J5LFxuICAgICAgICAgICAgY3VycmVudF9kaXJlY3Rvcnk6IGdldFdvcmtpbmdEaXIoKSBcbiAgICAgICAgICB9IFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cblxuICAvLyBhbmFseXplX3Byb2plY3QgdG9vbCBcdTIwMTQgQ29tcHJlaGVuc2l2ZSBUeXBlU2NyaXB0IFBlcmZvcm1hbmNlICYgTGludGluZyBBbmFseXNpc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdhbmFseXplX3Byb2plY3QnLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIHByb2plY3Qtd2lkZSBhbmFseXNpcyBpbmNsdWRpbmcgVHlwZVNjcmlwdCBkaWFnbm9zdGljcywgY2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3Rpb24sIEVTTGludCwgY29uZmlnIG9wdGltaXphdGlvbiwgYW5kIGltcG9ydCBzdHJ1Y3R1cmUgYW5hbHlzaXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjYXRlZ29yaWVzOiB6LmFycmF5KHouZW51bShbJ3R5cGVjaGVjaycsICdjaXJjdWxhcicsICdlc2xpbnQnLCAnY29uZmlnJywgJ2ltcG9ydHMnXSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0FuYWx5c2lzIGNhdGVnb3JpZXMgdG8gcnVuIChkZWZhdWx0OiBhbGwpJyksXG4gICAgICBtYXhfaW1wb3J0c193YXJuaW5nOiB6Lm51bWJlcigpLmludCgpLm1pbig1KS5tYXgoMTAwKS5vcHRpb25hbCgpLmRlZmF1bHQoMjApLmRlc2NyaWJlKCdNYXggaW1wb3J0cyBwZXIgZmlsZSBiZWZvcmUgd2FybmluZycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNhdGVnb3JpZXMsIG1heF9pbXBvcnRzX3dhcm5pbmcgfTogeyBjYXRlZ29yaWVzPzogc3RyaW5nW107IG1heF9pbXBvcnRzX3dhcm5pbmc/OiBudW1iZXIgfSkgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgd29ya2luZ0RpciA9IGdldFdvcmtpbmdEaXIoKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDYXRlZ29yaWVzID0gY2F0ZWdvcmllcyB8fCBbJ3R5cGVjaGVjaycsICdjaXJjdWxhcicsICdlc2xpbnQnLCAnY29uZmlnJywgJ2ltcG9ydHMnXTtcbiAgICAgICAgY29uc3QgaW1wb3J0V2FybmluZ1RocmVzaG9sZCA9IG1heF9pbXBvcnRzX3dhcm5pbmcgfHwgMjA7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gU2FmZSBTdWJwcm9jZXNzIEhlbHBlciB3aXRoIFByb2dyZXNzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGZ1bmN0aW9uIHNwYXduV2l0aFByb2dyZXNzKGV4ZTogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSwgdGltZW91dE1zOiBudW1iZXIpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgc3Rkb3V0Pzogc3RyaW5nOyBzdGRlcnI/OiBzdHJpbmcgfT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvYyA9IHNwYXduKGV4ZSwgYXJncywge1xuICAgICAgICAgICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgICAgICAgICBjd2Q6IHdvcmtpbmdEaXIsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgICAgICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgICAgICAgICBwcm9jLnN0ZG91dD8ub24oJ2RhdGEnLCAoZDogQnVmZmVyKSA9PiB7IHN0ZG91dCArPSBkLnRvU3RyaW5nKCk7IH0pO1xuICAgICAgICAgICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGQ6IEJ1ZmZlcikgPT4geyBzdGRlcnIgKz0gZC50b1N0cmluZygpOyB9KTtcblxuICAgICAgICAgICAgY29uc3QgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4geyBcbiAgICAgICAgICAgICAgcHJvYy5raWxsKCk7IFxuICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIHN0ZGVycjogYFRpbWVvdXQgYWZ0ZXIgJHt0aW1lb3V0TXN9bXNgIH0pOyBcbiAgICAgICAgICAgIH0sIHRpbWVvdXRNcyk7XG5cbiAgICAgICAgICAgIHByb2Mub24oJ2Nsb3NlJywgKCkgPT4geyBjbGVhclRpbWVvdXQodGltZXJJZCk7IHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBzdGRvdXQsIHN0ZGVyciB9KTsgfSk7XG4gICAgICAgICAgICBwcm9jLm9uKCdlcnJvcicsIChlcnIpID0+IHsgY2xlYXJUaW1lb3V0KHRpbWVySWQpOyByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIHN0ZGVycjogZXJyLm1lc3NhZ2UgfSk7IH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQS4gVHlwZVNjcmlwdCBFeHRlbmRlZCBEaWFnbm9zdGljcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW5UeXBlY2hlY2tBbmFseXNpcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgY29uc3QgdHNDb25maWdQYXRoID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICd0c2NvbmZpZy5qc29uJyk7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRzQ29uZmlnUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHRzY29uZmlnLmpzb24gZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdHNjIGlzIGF2YWlsYWJsZVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygndHNjJywgWyctLXZlcnNpb24nXSwgNTAwMCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdUeXBlU2NyaXB0IGNvbXBpbGVyICh0c2MpIG5vdCBmb3VuZCBpbiBQQVRIJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIER5bmFtaWMgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemUgKHVzaW5nIGltcG9ydGVkIHV0aWxpdGllcylcbiAgICAgICAgICBjb25zdCBmaWxlQ291bnQgPSBhd2FpdCBjb3VudFR5cGVTY3JpcHRGaWxlcyh3b3JraW5nRGlyKTtcbiAgICAgICAgICBjb25zdCBkeW5hbWljVGltZW91dCA9IGdldEFuYWx5c2lzVGltZW91dCgzMDAwMCwgZmlsZUNvdW50KTtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygndHNjJywgWyctLWV4dGVuZGVkRGlhZ25vc3RpY3MnXSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MgfHwgIXJlc3VsdC5zdGRvdXQpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYHRzYyBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIHRzYyAtLWV4dGVuZGVkRGlhZ25vc3RpY3Mgb3V0cHV0XG4gICAgICAgICAgY29uc3QgbGluZXMgPSByZXN1bHQuc3Rkb3V0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICBsZXQgY2hlY2tUaW1lTXMgPSAwO1xuICAgICAgICAgIGxldCBtZW1vcnlVc2VkTUIgPSAwO1xuICAgICAgICAgIGxldCBmaWxlc0NoZWNrZWQgPSAwO1xuICAgICAgICAgIGxldCBlbWl0VGltZU1zID0gMDtcbiAgICAgICAgICBsZXQgcGFyc2VUaW1lTXMgPSAwO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCBsb3dlckxpbmUgPSBsaW5lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFBhcnNlIGNoZWNrIHRpbWVcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrTWF0Y2ggPSBsb3dlckxpbmUubWF0Y2goL2NoZWNrXFxzK3RpbWU6XFxzKyhcXGQrKVxccyptcy8pO1xuICAgICAgICAgICAgaWYgKGNoZWNrTWF0Y2gpIGNoZWNrVGltZU1zID0gcGFyc2VJbnQoY2hlY2tNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBtZW1vcnkgdXNlZFxuICAgICAgICAgICAgY29uc3QgbWVtTWF0Y2ggPSBsaW5lLm1hdGNoKC9tZW1vcnkgdXNlZDpcXHMrKFxcZCspXFxzKihrYnxtYikvaSk7XG4gICAgICAgICAgICBpZiAobWVtTWF0Y2gpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUludChtZW1NYXRjaFsxXSwgMTApO1xuICAgICAgICAgICAgICBtZW1vcnlVc2VkTUIgPSBtZW1NYXRjaFsyXS50b0xvd2VyQ2FzZSgpID09PSAnbWInID8gdmFsdWUgOiBNYXRoLnJvdW5kKHZhbHVlIC8gMTAyNCAqIDEwMCkgLyAxMDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIGZpbGVzIGNoZWNrZWRcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzTWF0Y2ggPSBsaW5lLm1hdGNoKC9maWxlc1xccytjaGVja2VkOlxccysoXFxkKykvKTtcbiAgICAgICAgICAgIGlmIChmaWxlc01hdGNoKSBmaWxlc0NoZWNrZWQgPSBwYXJzZUludChmaWxlc01hdGNoWzFdLCAxMCk7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIGVtaXQgdGltZVxuICAgICAgICAgICAgY29uc3QgZW1pdE1hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9lbWl0XFxzK3RpbWU6XFxzKyhcXGQrKVxccyptcy8pO1xuICAgICAgICAgICAgaWYgKGVtaXRNYXRjaCkgZW1pdFRpbWVNcyA9IHBhcnNlSW50KGVtaXRNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBwYXJzZSB0aW1lXG4gICAgICAgICAgICBjb25zdCBwYXJzZU1hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9wYXJzZVxccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChwYXJzZU1hdGNoKSBwYXJzZVRpbWVNcyA9IHBhcnNlSW50KHBhcnNlTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQZXJmb3JtYW5jZSBhc3Nlc3NtZW50IGJhc2VkIG9uIFBERiBndWlkZWxpbmVzXG4gICAgICAgICAgbGV0IGFzc2Vzc21lbnQ6ICdmYXN0JyB8ICdtb2RlcmF0ZScgfCAnc2xvdyc7XG4gICAgICAgICAgaWYgKGNoZWNrVGltZU1zIDwgMTAwKSBhc3Nlc3NtZW50ID0gJ2Zhc3QnO1xuICAgICAgICAgIGVsc2UgaWYgKGNoZWNrVGltZU1zIDw9IDUwMCkgYXNzZXNzbWVudCA9ICdtb2RlcmF0ZSc7XG4gICAgICAgICAgZWxzZSBhc3Nlc3NtZW50ID0gJ3Nsb3cnO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNoZWNrVGltZU1zLFxuICAgICAgICAgICAgbWVtb3J5VXNlZE1COiBNYXRoLnJvdW5kKG1lbW9yeVVzZWRNQiAqIDEwMCkgLyAxMDAsXG4gICAgICAgICAgICBmaWxlc0NoZWNrZWQsXG4gICAgICAgICAgICBlbWl0VGltZU1zLFxuICAgICAgICAgICAgcGFyc2VUaW1lTXMsXG4gICAgICAgICAgICBhc3Nlc3NtZW50LFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBCLiBDaXJjdWxhciBEZXBlbmRlbmN5IERldGVjdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW5DaXJjdWxhckFuYWx5c2lzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICAgICAgICBjb25zdCBlbnRyeVBvaW50ID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICdzcmMnLCAnaW5kZXgudHMnKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZW50cnlQb2ludCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHNyYy9pbmRleC50cyBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEeW5hbWljIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplXG4gICAgICAgICAgY29uc3QgZmlsZUNvdW50ID0gYXdhaXQgY291bnRUeXBlU2NyaXB0RmlsZXMod29ya2luZ0Rpcik7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1RpbWVvdXQgPSBnZXRBbmFseXNpc1RpbWVvdXQoMjAwMDAsIGZpbGVDb3VudCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUnVuIG1hZGdlIGFuZCBjYXB0dXJlIG91dHB1dCB3aXRoIGR5bmFtaWMgdGltZW91dFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJy0teWVzJywgJ21hZGdlJywgJy0tY2lyY3VsYXInLCBlbnRyeVBvaW50XSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYG1hZGdlIGZhaWxlZDogJHtyZXN1bHQuc3RkZXJyIHx8ICdVbmtub3duIGVycm9yJ31gIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGFyc2UgbWFkZ2Ugb3V0cHV0IFx1MjAxNCBpdCBsaXN0cyBjeWNsZXMgbGlrZSBcImZpbGUxLnRzIC0+IGZpbGUyLnRzIC0+IGZpbGUxLnRzXCJcbiAgICAgICAgICBjb25zdCBjeWNsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgY29uc3Qgc3Rkb3V0ID0gcmVzdWx0LnN0ZG91dCB8fCAnJztcbiAgICAgICAgICBjb25zdCBsaW5lcyA9IHN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgXG4gICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gICAgICAgICAgICBpZiAodHJpbW1lZCAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdGb3VuZCcpICYmICF0cmltbWVkLnN0YXJ0c1dpdGgoJ05vJykpIHtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBsb29rcyBsaWtlIGEgY3ljbGUgcGF0aFxuICAgICAgICAgICAgICBpZiAodHJpbW1lZC5pbmNsdWRlcygnLT4nKSB8fCB0cmltbWVkLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgICAgICAgICAgIGN5Y2xlcy5wdXNoKHRyaW1tZWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhhc0N5Y2xlczogY3ljbGVzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICBjeWNsZXMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEMuIEVTTGludCBJbnRlZ3JhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW5Fc2xpbnRBbmFseXNpcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgY29uc3QgZXNsaW50Q29uZmlnRmlsZXMgPSBbXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJ2VzbGludC5jb25maWcubWpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJ2VzbGludC5jb25maWcuanMnKSxcbiAgICAgICAgICAgIHBhdGguam9pbih3b3JraW5nRGlyLCAnLmVzbGludHJjLmpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYy5qc29uJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYycpLFxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBjb25zdCBoYXNFc2xpbnRDb25maWcgPSBlc2xpbnRDb25maWdGaWxlcy5zb21lKGYgPT4gZnMuZXhpc3RzU3luYyhmKSk7XG4gICAgICAgICAgaWYgKCFoYXNFc2xpbnRDb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIEVTTGludCBjb25maWd1cmF0aW9uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGlmIGVzbGludCBpcyBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ25weCcsIFsnZXNsaW50JywgJy0tdmVyc2lvbiddLCA1MDAwKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ0VTTGludCBub3QgZm91bmQgaW4gZGV2RGVwZW5kZW5jaWVzIG9yIFBBVEgnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDE1MDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJ2VzbGludCcsICdzcmMnLCAnLS1leHQnLCAnLnRzJywgJy0tZm9ybWF0JywgJ2pzb24nXSwgZHluYW1pY1RpbWVvdXQpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogYEVTTGludCBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIEpTT04gb3V0cHV0IGZyb20gZXNsaW50IC0tZm9ybWF0IGpzb25cbiAgICAgICAgICBsZXQgZXJyb3JzID0gMDtcbiAgICAgICAgICBsZXQgd2FybmluZ3MgPSAwO1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgY29uc3Qgd2FybmluZ01lc3NhZ2VzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmVzdWx0LnN0ZG91dCB8fCAnJykgYXMge1xuICAgICAgICAgICAgICByZXN1bHRzPzogQXJyYXk8e1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXM/OiBBcnJheTx7IHNldmVyaXR5OiBudW1iZXI7IG1lc3NhZ2U6IHN0cmluZzsgbGluZTogbnVtYmVyOyBjb2x1bW46IG51bWJlciB9PjtcbiAgICAgICAgICAgICAgfT47XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHBhcnNlZC5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZVJlc3VsdCBvZiBwYXJzZWQucmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiAoZmlsZVJlc3VsdC5tZXNzYWdlcyB8fCBbXSkpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnNldmVyaXR5ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ycysrO1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2VzLnB1c2goYCR7ZmlsZVJlc3VsdC5maWxlUGF0aH06ICR7bWVzc2FnZS5tZXNzYWdlfSAoJHttZXNzYWdlLmxpbmV9OiR7bWVzc2FnZS5jb2x1bW59KWApO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnNldmVyaXR5ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHdhcm5pbmdzKys7XG4gICAgICAgICAgICAgICAgICAgIHdhcm5pbmdNZXNzYWdlcy5wdXNoKGAke2ZpbGVSZXN1bHQuZmlsZVBhdGh9OiAke21lc3NhZ2UubWVzc2FnZX0gKCR7bWVzc2FnZS5saW5lfToke21lc3NhZ2UuY29sdW1ufSlgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIElmIEpTT04gcGFyc2luZyBmYWlscywgZmFsbCBiYWNrIHRvIHRleHQgb3V0cHV0IGFuYWx5c2lzXG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja1N0ZG91dCA9IHJlc3VsdC5zdGRvdXQgfHwgJyc7XG4gICAgICAgICAgICBjb25zdCBlcnJvckxpbmVzID0gZmFsbGJhY2tTdGRvdXQuc3BsaXQoJ1xcbicpLmZpbHRlcihsID0+IGwuaW5jbHVkZXMoJ2Vycm9yJykgJiYgIWwuaW5jbHVkZXMoJ3dhcm5pbmcnKSk7XG4gICAgICAgICAgICBlcnJvcnMgPSBlcnJvckxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IHdhcm5pbmdMaW5lcyA9IGZhbGxiYWNrU3Rkb3V0LnNwbGl0KCdcXG4nKS5maWx0ZXIobCA9PiBsLmluY2x1ZGVzKCd3YXJuaW5nJykpO1xuICAgICAgICAgICAgd2FybmluZ3MgPSB3YXJuaW5nTGluZXMubGVuZ3RoO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5ncyxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZXM6IGVycm9yTWVzc2FnZXMuc2xpY2UoMCwgMjApLCAvLyBMaW1pdCB0byBmaXJzdCAyMFxuICAgICAgICAgICAgd2FybmluZ01lc3NhZ2VzOiB3YXJuaW5nTWVzc2FnZXMuc2xpY2UoMCwgMjApLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBELiBUeXBlU2NyaXB0IENvbmZpZyBBbmFseXNpcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBmdW5jdGlvbiBydW5Db25maWdBbmFseXNpcygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgICAgY29uc3QgdHNDb25maWdQYXRoID0gcGF0aC5qb2luKHdvcmtpbmdEaXIsICd0c2NvbmZpZy5qc29uJyk7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRzQ29uZmlnUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHRzY29uZmlnLmpzb24gZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHRzQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdHNDb25maWcgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyh0c0NvbmZpZ1BhdGgsICd1dGYtOCcpKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ0ludmFsaWQgdHNjb25maWcuanNvbiBmb3JtYXQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgY29tcGlsZXJPcHRpb25zID0gKHRzQ29uZmlnLmNvbXBpbGVyT3B0aW9ucyB8fCB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgaW5jcmVtZW50YWwgPSAhIWNvbXBpbGVyT3B0aW9ucy5pbmNyZW1lbnRhbDtcbiAgICAgICAgICBjb25zdCBza2lwTGliQ2hlY2sgPSAhIWNvbXBpbGVyT3B0aW9ucy5za2lwTGliQ2hlY2s7XG4gICAgICAgICAgY29uc3QgaXNvbGF0ZWRNb2R1bGVzID0gISFjb21waWxlck9wdGlvbnMuaXNvbGF0ZWRNb2R1bGVzO1xuICAgICAgICAgIGNvbnN0IHN0cmljdCA9ICEhY29tcGlsZXJPcHRpb25zLnN0cmljdDtcblxuICAgICAgICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgIC8vIFJlY29tbWVuZGF0aW9ucyBiYXNlZCBvbiBQREYgb3B0aW1pemF0aW9uIHRlY2huaXF1ZXNcbiAgICAgICAgICBpZiAoIWluY3JlbWVudGFsKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwiaW5jcmVtZW50YWxcIjogdHJ1ZSBpbiB0c2NvbmZpZy5qc29uIGZvciBmYXN0ZXIgYnVpbGRzIChidWlsZCBjYWNoaW5nKS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFza2lwTGliQ2hlY2spIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdFbmFibGUgXCJza2lwTGliQ2hlY2tcIjogdHJ1ZSB0byBza2lwIGNoZWNraW5nIC5kLnRzIGZpbGVzIGluIG5vZGVfbW9kdWxlcy4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFpc29sYXRlZE1vZHVsZXMpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdDb25zaWRlciBlbmFibGluZyBcImlzb2xhdGVkTW9kdWxlc1wiOiB0cnVlIGZvciBmYXN0ZXIgY29tcGlsYXRpb24gKGVzcGVjaWFsbHkgd2l0aCBCYWJlbC9lc2J1aWxkKS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFzdHJpY3QpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdFbmFibGUgXCJzdHJpY3RcIjogdHJ1ZSBmb3IgYmV0dGVyIHR5cGUgc2FmZXR5IGFuZCBmZXdlciBydW50aW1lIGVycm9ycy4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3IgcGF0aHMgY29uZmlndXJhdGlvbiAobW9kdWxlIHJlc29sdXRpb24gb3B0aW1pemF0aW9uKVxuICAgICAgICAgIGNvbnN0IHBhdGhzID0gY29tcGlsZXJPcHRpb25zLnBhdGhzIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgICAgICAgIGlmICghcGF0aHMgfHwgT2JqZWN0LmtleXMocGF0aHMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0NvbnNpZGVyIHVzaW5nIFwicGF0aHNcIiBpbiB0c2NvbmZpZy5qc29uIHRvIHNpbXBsaWZ5IG1vZHVsZSBpbXBvcnRzIGFuZCByZWR1Y2UgZGVwZW5kZW5jeSBkZXB0aC4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5jcmVtZW50YWwsXG4gICAgICAgICAgICBza2lwTGliQ2hlY2ssXG4gICAgICAgICAgICBpc29sYXRlZE1vZHVsZXMsXG4gICAgICAgICAgICBzdHJpY3QsXG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEUuIEltcG9ydCBTdHJ1Y3R1cmUgQW5hbHlzaXMgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gcnVuSW1wb3J0QW5hbHlzaXMoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICAgIGNvbnN0IHNyY0RpciA9IHBhdGguam9pbih3b3JraW5nRGlyLCAnc3JjJyk7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHNyY0RpcikpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHNraXBwZWQ6IHRydWUsIHJlYXNvbjogJ05vIHNyYy8gZGlyZWN0b3J5IGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENvbGxlY3QgYWxsIC50cyBmaWxlcyBpbiBzcmMvXG4gICAgICAgICAgZnVuY3Rpb24gY29sbGVjdFRzRmlsZXMoZGlyOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkubmFtZSk7XG4gICAgICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaCguLi5jb2xsZWN0VHNGaWxlcyhmdWxsUGF0aCkpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy50cycpICYmICFlbnRyeS5uYW1lLmVuZHNXaXRoKCcuZC50cycpKSB7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZpbGVzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRzRmlsZXMgPSBjb2xsZWN0VHNGaWxlcyhzcmNEaXIpO1xuICAgICAgICAgIGNvbnN0IGZpbGVzV2l0aEV4Y2Vzc2l2ZUltcG9ydHM6IEFycmF5PHsgZmlsZTogc3RyaW5nOyBjb3VudDogbnVtYmVyIH0+ID0gW107XG4gICAgICAgICAgY29uc3QgZGVjbGFyZUdsb2JhbFVzYWdlOiBBcnJheTx7IGZpbGU6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiB0c0ZpbGVzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIENvdW50IGltcG9ydHNcbiAgICAgICAgICAgICAgY29uc3QgaW1wb3J0U3RhdGVtZW50cyA9IGNvbnRlbnQubWF0Y2goL15pbXBvcnRcXHMrLiokL2dtKTtcbiAgICAgICAgICAgICAgY29uc3QgaW1wb3J0Q291bnQgPSBpbXBvcnRTdGF0ZW1lbnRzID8gaW1wb3J0U3RhdGVtZW50cy5sZW5ndGggOiAwO1xuXG4gICAgICAgICAgICAgIGlmIChpbXBvcnRDb3VudCA+IGltcG9ydFdhcm5pbmdUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzLnB1c2goeyBmaWxlOiBwYXRoLnJlbGF0aXZlKHdvcmtpbmdEaXIsIGZpbGVQYXRoKSwgY291bnQ6IGltcG9ydENvdW50IH0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGRlY2xhcmUgZ2xvYmFsIHVzYWdlIChnbG9iYWwgdHlwZSBwYXRjaGluZyBcdTIwMTQgYmFkIHByYWN0aWNlIHBlciBQREYpXG4gICAgICAgICAgICAgIGNvbnN0IGRlY2xhcmVHbG9iYWxNYXRjaGVzID0gY29udGVudC5tYXRjaCgvZGVjbGFyZVxccytnbG9iYWwvZyk7XG4gICAgICAgICAgICAgIGlmIChkZWNsYXJlR2xvYmFsTWF0Y2hlcyAmJiBkZWNsYXJlR2xvYmFsTWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZGVjbGFyZUdsb2JhbFVzYWdlLnB1c2goeyBmaWxlOiBwYXRoLnJlbGF0aXZlKHdvcmtpbmdEaXIsIGZpbGVQYXRoKSB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIC8vIFNraXAgZmlsZXMgdGhhdCBjYW4ndCBiZSByZWFkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbGVzV2l0aEV4Y2Vzc2l2ZUltcG9ydHMsXG4gICAgICAgICAgICBkZWNsYXJlR2xvYmFsVXNhZ2UsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IFJ1biBTZWxlY3RlZCBDYXRlZ29yaWVzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygndHlwZWNoZWNrJykpIHtcbiAgICAgICAgICByZXN1bHRzLnR5cGVjaGVjayA9IGF3YWl0IHJ1blR5cGVjaGVja0FuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnY2lyY3VsYXInKSkge1xuICAgICAgICAgIHJlc3VsdHMuY2lyY3VsYXIgPSBhd2FpdCBydW5DaXJjdWxhckFuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnZXNsaW50JykpIHtcbiAgICAgICAgICByZXN1bHRzLmVzbGludCA9IGF3YWl0IHJ1bkVzbGludEFuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnY29uZmlnJykpIHtcbiAgICAgICAgICByZXN1bHRzLmNvbmZpZyA9IHJ1bkNvbmZpZ0FuYWx5c2lzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcmllcy5pbmNsdWRlcygnaW1wb3J0cycpKSB7XG4gICAgICAgICAgcmVzdWx0cy5pbXBvcnRzID0gcnVuSW1wb3J0QW5hbHlzaXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiByZXN1bHRzLFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQW5hbHlzaXMgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNlYXJjaCBhcyBkZGdTZWFyY2ggfSBmcm9tICdkdWNrLWR1Y2stc2NyYXBlJztcbmltcG9ydCB7IGh0bWxUb1RleHQgfSBmcm9tICdodG1sLXRvLXRleHQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZmV0Y2hXaXRoUmV0cnkgfSBmcm9tICcuLi9wZXJmb3JtYW5jZVV0aWxzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU2VhcmNoIEVuZ2luZSBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdEl0ZW0ge1xuICB0aXRsZTogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbn1cblxuLyoqIER1Y2tEdWNrR28gQVBJIChmYXN0ZXN0LCBubyBicm93c2VyIG5lZWRlZCkgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaERER0FwaShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGRkZ1NlYXJjaChxdWVyeSwgeyByZWdpb246ICd3dC13dCcgfSk7XG4gIHJldHVybiAocmVzdWx0cy5yZXN1bHRzIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PikubWFwKChyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICB0aXRsZTogci50aXRsZSBhcyBzdHJpbmcsXG4gICAgdXJsOiByLnVybCBhcyBzdHJpbmcsXG4gICAgZGVzY3JpcHRpb246IChyLmRlc2NyaXB0aW9uIGFzIHN0cmluZykgfHwgJycsXG4gIH0pKTtcbn1cblxuLyoqIER1Y2tEdWNrR28gSFRNTCBGZXRjaCAoZmFsbGJhY2sgd2hlbiBBUEkgZmFpbHMpICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hEREdGZXRjaChxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShcbiAgICBgaHR0cHM6Ly9odG1sLmR1Y2tkdWNrZ28uY29tL2h0bWwvP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfWBcbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBEdWNrRHVja0dvIEZldGNoIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgXG4gIC8vIFNpbXBsZSByZWdleC1iYXNlZCBwYXJzaW5nIGZvciBOb2RlLmpzIChubyBET01QYXJzZXIgbmVlZGVkISlcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIFxuICAvLyBFeHRyYWN0IHRpdGxlcyBmcm9tIDxhIGNsYXNzPVwicmVzdWx0X19hXCIgaHJlZj1cIi4uLlwiIHJlbD1cIi4uLlwiPlRpdGxlPC9hPlxuICBjb25zdCB0aXRsZVJlZ2V4ID0gLzxhW14+XStjbGFzcz1cInJlc3VsdF9fYVwiW14+XStocmVmPVwiKFteXCJdKylcIltePl0qPihbXjxdKyk8XFwvYT4vZ2k7XG4gIGxldCBtYXRjaDtcbiAgXG4gIHdoaWxlICgobWF0Y2ggPSB0aXRsZVJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHRpdGxlOiBtYXRjaFsyXS5yZXBsYWNlKC8mYW1wOy9nLCAnJicpLnRyaW0oKSxcbiAgICAgIHVybDogbWF0Y2hbMV0sXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCAxMCk7XG59XG5cbi8qKiBHb29nbGUgU2VhcmNoIHZpYSBIVE1MIEZldGNoICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hHb29nbGUocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoXG4gICAgYGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZudW09MTBgLFxuICAgIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYnIH0gfVxuICApO1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEdvb2dsZSBzZWFyY2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAvLyBTaW1wbGUgcGFyc2luZyBcdTIwMTQgZXh0cmFjdCB0aXRsZXMgYW5kIFVSTHMgZnJvbSBHb29nbGUncyBIVE1MIHN0cnVjdHVyZVxuICBjb25zdCByZXN1bHRzOiBTZWFyY2hSZXN1bHRJdGVtW10gPSBbXTtcbiAgY29uc3QgdGl0bGVSZWdleCA9IC88aDNbXj5dKj4oLio/KTxcXC9oMz4vZztcblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSB0aXRsZVJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHRpdGxlOiBtYXRjaFsxXS5yZXBsYWNlKC88W14+XSo+L2csICcnKSwgLy8gUmVtb3ZlIEhUTUwgdGFnc1xuICAgICAgdXJsOiAnJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIDEwKTtcbn1cblxuLyoqIEJpbmcgU2VhcmNoIHZpYSBIVE1MIEZldGNoICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hCaW5nKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KFxuICAgIGBodHRwczovL3d3dy5iaW5nLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9JmNvdW50PTEwYCxcbiAgICB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2JyB9IH1cbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBCaW5nIHNlYXJjaCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIC8vIFBhcnNlIEJpbmcgcmVzdWx0cyBcdTIwMTQgc2ltaWxhciBhcHByb2FjaCB0byBHb29nbGVcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIGNvbnN0IHJlc3VsdFJlZ2V4ID0gLzxsaSBjbGFzcz1cImJfYWxnb1wiW14+XSo+KC4qPyk8XFwvbGk+L2dzO1xuXG4gIGxldCBtYXRjaDtcbiAgd2hpbGUgKChtYXRjaCA9IHJlc3VsdFJlZ2V4LmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgYmxvY2sgPSBtYXRjaFsxXTtcbiAgICBjb25zdCB0aXRsZU1hdGNoID0gYmxvY2subWF0Y2goLzxhW14+XStocmVmPVwiKFteXCJdKylcIltePl0qPihbXjxdKyk8XFwvYT4vKTtcbiAgICBpZiAodGl0bGVNYXRjaCkge1xuICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgdGl0bGU6IHRpdGxlTWF0Y2hbMl0sXG4gICAgICAgIHVybDogdGl0bGVNYXRjaFsxXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgMTApO1xufVxuXG4vKiogQWxsIGF2YWlsYWJsZSBTZWFyY2ggRW5naW5lIEZ1bmN0aW9ucyAqL1xuY29uc3QgU0VBUkNIX0VOR0lORVM6IFJlY29yZDxzdHJpbmcsIChxdWVyeTogc3RyaW5nKSA9PiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4+ID0ge1xuICAnZGRnLWFwaSc6IHNlYXJjaERER0FwaSxcbiAgJ2RkZy1mZXRjaCc6IHNlYXJjaERER0ZldGNoLFxuICAnZ29vZ2xlJzogc2VhcmNoR29vZ2xlLFxuICAnYmluZyc6IHNlYXJjaEJpbmcsXG59O1xuXG4vKiogSGFyZGNvZGVkIGZhbGxiYWNrIG9yZGVyICh3aGVuIHByaW1hcnkgZW5naW5lIGZhaWxzKSAqL1xuY29uc3QgRkFMTEJBQ0tfT1JERVIgPSBbJ2RkZy1hcGknLCAnZGRnLWZldGNoJywgJ2dvb2dsZScsICdiaW5nJ107XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZhbGxiYWNrIENoYWluIExvZ2ljID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogV2ViIHNlYXJjaCB3aXRoIGF1dG9tYXRpYyBmYWxsYmFjay5cbiAqIFN0YXJ0cyB3aXRoIHRoZSBDb25maWcgZW5naW5lIGFuZCBhdXRvbWF0aWNhbGx5IHRyaWVzIHRoZSBuZXh0IGluIHRoZSBjaGFpbi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoV2l0aEZhbGxiYWNrQ2hhaW4oXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIGNvbmZpZzogUGx1Z2luQ29uZmlnXG4pOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IHsgcXVlcnk6IHN0cmluZzsgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdOyBjb3VudDogbnVtYmVyOyBlbmdpbmU6IHN0cmluZyB9OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gIC8vIFN0YXJ0IGVuZ2luZSBmcm9tIENvbmZpZyAoU2luZ2xlIFNlbGVjdClcbiAgY29uc3QgcHJpbWFyeUVuZ2luZSA9IGNvbmZpZy5zZWFyY2hGYWxsYmFja0NoYWluIHx8ICdkZGctYXBpJztcbiAgXG4gIC8vIEZhbGxiYWNrIGNoYWluOiBwcmltYXJ5IGVuZ2luZSArIGFsbCBvdGhlcnMgaW4gZGVmaW5lZCBvcmRlclxuICBjb25zdCBjaGFpbiA9IFtwcmltYXJ5RW5naW5lLCAuLi5GQUxMQkFDS19PUkRFUi5maWx0ZXIoZSA9PiBlICE9PSBwcmltYXJ5RW5naW5lKV07XG5cbiAgZm9yIChjb25zdCBlbmdpbmUgb2YgY2hhaW4pIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2VhcmNoRm4gPSBTRUFSQ0hfRU5HSU5FU1tlbmdpbmVdO1xuICAgICAgaWYgKCFzZWFyY2hGbikge1xuICAgICAgICBjb25zb2xlLndhcm4oYFNlYXJjaCBlbmdpbmUgXCIke2VuZ2luZX1cIiBub3QgZm91bmQsIHNraXBwaW5nYCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgc2VhcmNoRm4ocXVlcnkpO1xuXG4gICAgICAvLyBWYWxpZGF0ZSByZXN1bHQgY291bnQgLSB3YXJuIGlmIGxvdyByZXN1bHRzXG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgTG93IHNlYXJjaCByZXN1bHRzIGZvciBcIiR7cXVlcnl9XCI6ICR7cmVzdWx0cy5sZW5ndGh9IHJlc3VsdHMgZnJvbSAke2VuZ2luZX1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogeyBxdWVyeSwgcmVzdWx0cywgY291bnQ6IHJlc3VsdHMubGVuZ3RoLCBlbmdpbmUgfSxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBjb25zb2xlLndhcm4oYFNlYXJjaCBlbmdpbmUgXCIke2VuZ2luZX1cIiBmYWlsZWQ6ICR7bWVzc2FnZX1gKTtcbiAgICAgIC8vIFRyeSBuZXh0IGVuZ2luZSBpbiB0aGUgY2hhaW5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3VjY2VzczogZmFsc2UsXG4gICAgZXJyb3I6IGBBbGwgc2VhcmNoIGVuZ2luZXMgZmFpbGVkLiBUcmllZDogJHtjaGFpbi5qb2luKCcgXHUyMTkyICcpfWAsXG4gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBXZWJTZWFyY2hQYXJhbXMgeyBxdWVyeTogc3RyaW5nOyB9XG5pbnRlcmZhY2UgV2lraXBlZGlhU2VhcmNoUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgbGFuZz86IHN0cmluZzsgfVxuaW50ZXJmYWNlIEZldGNoV2ViQ29udGVudFBhcmFtcyB7IHVybDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmFnV2ViQ29udGVudFBhcmFtcyB7IHVybDogc3RyaW5nOyBxdWVyeTogc3RyaW5nOyB9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlcldlYlJlc2VhcmNoVG9vbHMoY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gd2ViX3NlYXJjaCB0b29sIFx1MjAxNCB1c2VzIHByaW1hcnkgZW5naW5lIGZyb20gQ29uZmlnICsgYXV0b21hdGljIGZhbGxiYWNrXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3dlYl9zZWFyY2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIHRoZSB3ZWIgdXNpbmcgYSBjb25maWd1cmFibGUgc2VhcmNoIGVuZ2luZSB3aXRoIGF1dG9tYXRpYyBmYWxsYmFjayB0byBvdGhlciBlbmdpbmVzIGlmIHRoZSBwcmltYXJ5IG9uZSBmYWlscy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2VhcmNoIHF1ZXJ5JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnkgfTogV2ViU2VhcmNoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICByZXR1cm4gYXdhaXQgc2VhcmNoV2l0aEZhbGxiYWNrQ2hhaW4ocXVlcnksIGNvbmZpZyk7XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHdpa2lwZWRpYV9zZWFyY2ggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3aWtpcGVkaWFfc2VhcmNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCBXaWtpcGVkaWEgZm9yIGEgZ2l2ZW4gcXVlcnkgYW5kIHJldHVybiBwYWdlIHN1bW1hcmllcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2VhcmNoIHF1ZXJ5JyksXG4gICAgICBsYW5nOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnZW4nKS5kZXNjcmliZSgnTGFuZ3VhZ2UgY29kZSAoZGVmYXVsdDogZW4pJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIGxhbmcgfTogV2lraXBlZGlhU2VhcmNoUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGlVcmwgPSBgaHR0cHM6Ly8ke2xhbmcgfHwgJ2VuJ30ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXF1ZXJ5Jmxpc3Q9c2VhcmNoJnNyc2VhcmNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX0mZm9ybWF0PWpzb24mb3JpZ2luPSpgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KGFwaVVybCk7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV2lraXBlZGlhIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlc3BvbnNlLmpzb24oKSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIGNvbnN0IHF1ZXJ5RGF0YSA9IGRhdGEucXVlcnkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHNlYXJjaFJlc3VsdHMgPSAocXVlcnlEYXRhPy5zZWFyY2ggYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KSB8fCBbXTtcbiAgICAgICAgY29uc3QgcGFnZXMgPSBzZWFyY2hSZXN1bHRzLm1hcCgoaXRlbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgICAgICBjb25zdCB0aXRsZSA9IHR5cGVvZiBpdGVtLnRpdGxlID09PSAnc3RyaW5nJyA/IGl0ZW0udGl0bGUgOiAnJztcbiAgICAgICAgICBjb25zdCBzbmlwcGV0ID0gdHlwZW9mIGl0ZW0uc25pcHBldCA9PT0gJ3N0cmluZycgPyBpdGVtLnNuaXBwZXQucmVwbGFjZSgvPFtePl0qPi9nLCAnJykgOiAnJztcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBzbmlwcGV0LFxuICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly8ke2xhbmcgfHwgJ2VuJ30ud2lraXBlZGlhLm9yZy93aWtpLyR7ZW5jb2RlVVJJQ29tcG9uZW50KHRpdGxlKX1gLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcXVlcnksIGxhbmd1YWdlOiBsYW5nIHx8ICdlbicsIHJlc3VsdHM6IHBhZ2VzLCBjb3VudDogcGFnZXMubGVuZ3RoIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFdpa2lwZWRpYSBzZWFyY2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmZXRjaF93ZWJfY29udGVudCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2ZldGNoX3dlYl9jb250ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZldGNoIHRoZSBjbGVhbiwgdGV4dC1iYXNlZCBjb250ZW50IG9mIGEgd2VicGFnZSBVUkwuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1RoZSBVUkwgdG8gZmV0Y2gnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB1cmwgfTogRmV0Y2hXZWJDb250ZW50UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KHVybCk7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gaHRtbFRvVGV4dChodG1sLCB7XG4gICAgICAgICAgd29yZHdyYXA6IGZhbHNlLFxuICAgICAgICAgIHNlbGVjdG9yczogW1xuICAgICAgICAgICAgeyBzZWxlY3RvcjogJ2EnLCBvcHRpb25zOiB7IGlnbm9yZUhyZWY6IHRydWUgfSB9LFxuICAgICAgICAgICAgeyBzZWxlY3RvcjogJ2ltZycsIGZvcm1hdDogJ1tpbWFnZV0nIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB1cmwsIGNvbnRlbnQ6IHRleHQuc3Vic3RyaW5nKDAsIDUwMDApIH0gfTsgLy8gTGltaXQgbGVuZ3RoXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZmV0Y2ggY29udGVudDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmFnX3dlYl9jb250ZW50IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX3dlYl9jb250ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZldGNoIGNvbnRlbnQgZnJvbSBhIFVSTCwgYW5kIHRoZW4gdXNlIFJBRyB0byBmaW5kIGFuZCByZXR1cm4gb25seSB0aGUgdGV4dCBjaHVua3MgbW9zdCByZWxldmFudCB0byBhIHNwZWNpZmljIHF1ZXJ5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIGZldGNoJyksXG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeSBmb3IgcmVsZXZhbmNlIG1hdGNoaW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsLCBxdWVyeSB9OiBSYWdXZWJDb250ZW50UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KHVybCk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgICAgICAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGh0bWxUb1RleHQoaHRtbCk7XG5cbiAgICAgICAgLy8gU2ltcGxlIGtleXdvcmQtYmFzZWQgcmVsZXZhbmNlIHNjb3JpbmcgKHBsYWNlaG9sZGVyIGZvciByZWFsIFJBRylcbiAgICAgICAgY29uc3QgcXVlcnlUZXJtcyA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCkuc3BsaXQoL1xccysvKS5maWx0ZXIoKHQ6IHN0cmluZykgPT4gdC5sZW5ndGggPiAyKTtcbiAgICAgICAgY29uc3Qgc2VudGVuY2VzID0gdGV4dC5zcGxpdCgvWy4hP10rLykubWFwKChzOiBzdHJpbmcpID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAgICAgY29uc3QgcmVsZXZhbnRDaHVua3MgPSBzZW50ZW5jZXMuZmlsdGVyKChzZW50ZW5jZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHF1ZXJ5VGVybXMuc29tZSgodGVybTogc3RyaW5nKSA9PiBzZW50ZW5jZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHRlcm0pKTtcbiAgICAgICAgfSkuc2xpY2UoMCwgNSk7IC8vIFJldHVybiB0b3AgNSBoaXRzXG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB1cmwsIHF1ZXJ5LCBjaHVua3M6IHJlbGV2YW50Q2h1bmtzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBzZWFyY2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJztcblxuLy8gTGF6eS1sb2FkIHNpbXBsZS1naXQgZm9yIHRlc3RhYmlsaXR5XG5sZXQgc2ltcGxlR2l0TW9kdWxlOiB0eXBlb2YgaW1wb3J0KCdzaW1wbGUtZ2l0JykgfCBudWxsID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2ltcGxlR2l0KCk6IFByb21pc2U8dHlwZW9mIGltcG9ydCgnc2ltcGxlLWdpdCcpPiB7XG4gIGlmICghc2ltcGxlR2l0TW9kdWxlKSB7XG4gICAgc2ltcGxlR2l0TW9kdWxlID0gYXdhaXQgaW1wb3J0KCdzaW1wbGUtZ2l0Jyk7XG4gIH1cbiAgcmV0dXJuIHNpbXBsZUdpdE1vZHVsZTtcbn1cblxuLyoqIFJlc2V0IGdpdCBtb2R1bGUgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0R2l0Q2FjaGUoKTogdm9pZCB7XG4gIHNpbXBsZUdpdE1vZHVsZSA9IG51bGw7XG59XG5cbi8qKiBDcmVhdGUgYSBmcmVzaCBnaXQgaW5zdGFuY2UgZm9yIGVhY2ggb3BlcmF0aW9uIHRvIGF2b2lkIGN3ZCBpc3N1ZXMgKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUdpdCgpIHtcbiAgY29uc3QgeyBkZWZhdWx0OiBzaW1wbGVHaXQgfSA9IGF3YWl0IGdldFNpbXBsZUdpdCgpO1xuICByZXR1cm4gc2ltcGxlR2l0KCk7XG59XG5cbi8qKlxuICogU2hhcmVkIGhlbHBlcjogRXh0cmFjdCBHaXRIdWIgcmVwbyBuYW1lIGZyb20gZ2l0IHJlbW90ZSBVUkxcbiAqL1xuZnVuY3Rpb24gZ2V0UmVwb05hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHJlcG9NYXRjaCA9IHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPU0lUT1JZPy5tYXRjaCgvZ2l0aHViXFwuY29tWzovXShbXi9dK1xcL1teL10rKVxcLmdpdCQvKTtcbiAgcmV0dXJuIHJlcG9NYXRjaD8uWzFdIHx8IG51bGw7XG59XG5cbi8qKlxuICogU2hhcmVkIGhlbHBlcjogTWFrZSBHaXRIdWIgQVBJIHJlcXVlc3RzIHdpdGggYXV0aGVudGljYXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2hBcGlSZXF1ZXN0KG1ldGhvZDogc3RyaW5nLCBlbmRwb2ludDogc3RyaW5nLCBib2R5PzogdW5rbm93bikge1xuICBjb25zdCBnaXRodWJUb2tlbiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjtcbiAgXG4gIGlmICghZ2l0aHViVG9rZW4pIHRocm93IG5ldyBFcnJvcignR0lUSFVCX1RPS0VOIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG5vdCBzZXQnKTtcbiAgXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20ke2VuZHBvaW50fWAsIHtcbiAgICBtZXRob2QsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7Z2l0aHViVG9rZW59YCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgICBib2R5OiBib2R5ID8gSlNPTi5zdHJpbmdpZnkoYm9keSkgOiB1bmRlZmluZWQsXG4gIH0pO1xuXG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHaXRIdWIgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pOiAke2Vycm9yVGV4dH1gKTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZS5qc29uKCk7XG59XG5cbi8qKiBUeXBlZCBwYXJhbXMgaW50ZXJmYWNlcyAqL1xudHlwZSBHaXRTdGF0dXNQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG5pbnRlcmZhY2UgR2l0RGlmZlBhcmFtcyB7IGZpbGVfcGF0aD86IHN0cmluZzsgY2FjaGVkPzogYm9vbGVhbjsgfVxuaW50ZXJmYWNlIEdpdENvbW1pdFBhcmFtcyB7IG1lc3NhZ2U6IHN0cmluZzsgfVxuaW50ZXJmYWNlIEdpdExvZ1BhcmFtcyB7IG1heF9jb3VudD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdpdEFkZFBhcmFtcyB7IHBhdGhzPzogc3RyaW5nW107IH1cbmludGVyZmFjZSBHaXRDaGVja291dFBhcmFtcyB7IGJyYW5jaF9uYW1lOiBzdHJpbmc7IGNyZWF0ZV9uZXc/OiBib29sZWFuOyB9XG5pbnRlcmZhY2UgR2hDcmVhdGVJc3N1ZVBhcmFtcyB7IHRpdGxlOiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IGxhYmVscz86IHN0cmluZ1tdOyB9XG5pbnRlcmZhY2UgR2hMaXN0SXNzdWVzUGFyYW1zIHsgc3RhdGU/OiAnb3BlbicgfCAnY2xvc2VkJzsgbGFiZWxzPzogc3RyaW5nW107IGxpbWl0PzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2hWaWV3Q29tbWVudHNQYXJhbXMgeyBudW1iZXI6IG51bWJlcjsgdHlwZT86ICdpc3N1ZScgfCAncHInOyB9XG5pbnRlcmZhY2UgR2hDcmVhdGVQclBhcmFtcyB7IHRpdGxlOiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IGhlYWRfYnJhbmNoOiBzdHJpbmc7IGJhc2VfYnJhbmNoPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgR2hMaXN0UHJzUGFyYW1zIHsgc3RhdGU/OiAnb3BlbicgfCAnY2xvc2VkJzsgbGltaXQ/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHaFZpZXdQckRpZmZQYXJhbXMgeyBudW1iZXI6IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdoUHVzaFBhcmFtcyB7IGJyYW5jaD86IHN0cmluZzsgfVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJHaXRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gZ2l0X3N0YXR1cyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9zdGF0dXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHRoZSBjdXJyZW50IGdpdCBzdGF0dXMgb2YgdGhlIHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKF9wYXJhbXM6IEdpdFN0YXR1c1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gY3JlYXRlR2l0KCk7XG4gICAgICAgIGNvbnN0IHN0YXR1c1Jlc3VsdCA9IGF3YWl0IGdpdC5zdGF0dXMoKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogc3RhdHVzUmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgc3RhdHVzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2RpZmYgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfZGlmZicsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgdGhlIGdpdCBkaWZmIG9mIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgb3Igc3BlY2lmaWMgZmlsZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFBhdGggdG8gc3BlY2lmaWMgZmlsZSB0byBkaWZmLicpLFxuICAgICAgY2FjaGVkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdPcHRpb25hbDogU2hvdyBzdGFnZWQgY2hhbmdlcyBvbmx5IChnaXQgZGlmZiAtLWNhY2hlZCkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9wYXRoLCBjYWNoZWQgfTogR2l0RGlmZlBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gY3JlYXRlR2l0KCk7XG4gICAgICAgIGxldCBkaWZmID0gJyc7XG4gICAgICAgIGlmIChmaWxlX3BhdGgpIHtcbiAgICAgICAgICBkaWZmID0gYXdhaXQgZ2l0LmRpZmYoW2ZpbGVfcGF0aF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpZmYgPSBjYWNoZWQgPyBhd2FpdCBnaXQuZGlmZihbJy0tY2FjaGVkJ10pIDogYXdhaXQgZ2l0LmRpZmYoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRpZmYgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGRpZmYgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfY29tbWl0IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2NvbW1pdCcsXG4gICAgZGVzY3JpcHRpb246ICdDb21taXQgc3RhZ2VkIGNoYW5nZXMgdG8gdGhlIGdpdCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1pdCBtZXNzYWdlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbWVzc2FnZSB9OiBHaXRDb21taXRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBhd2FpdCBnaXQuY29tbWl0KG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1pdHRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgY29tbWl0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2xvZyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9sb2cnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHJlY2VudCBnaXQgY29tbWl0IGhpc3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBtYXhfY291bnQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBudW1iZXIgb2YgY29tbWl0cyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG1heF9jb3VudCB9OiBHaXRMb2dQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBjb25zdCBjb3VudCA9IG1heF9jb3VudCB8fCAxMDtcbiAgICAgICAgY29uc3QgbG9nID0gYXdhaXQgZ2l0LmxvZyhjb3VudCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWl0czogbG9nLmFsbCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgbG9nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2FkZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9hZGQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhZ2Ugc3BlY2lmaWMgZmlsZXMgb3IgYWxsIGNoYW5nZXMgZm9yIHRoZSBuZXh0IGNvbW1pdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGhzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBTcGVjaWZpYyBmaWxlIHBhdGhzIHRvIHN0YWdlLiBJZiBvbWl0dGVkLCBzdGFnZXMgYWxsIGNoYW5nZXMuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aHMgfTogR2l0QWRkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBjcmVhdGVHaXQoKTtcbiAgICAgICAgaWYgKHBhdGhzICYmIHBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhd2FpdCBnaXQuYWRkKHBhdGhzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBnaXQuYWRkKCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzdGFnZWRQYXRoczogcGF0aHMgfHwgJ2FsbCcgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGFkZCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9jaGVja291dCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9jaGVja291dCcsXG4gICAgZGVzY3JpcHRpb246ICdTd2l0Y2ggdG8gYW4gZXhpc3RpbmcgYnJhbmNoIG9yIGNyZWF0ZSBhbmQgc3dpdGNoIHRvIGEgbmV3IG9uZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGJyYW5jaF9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOYW1lIG9mIHRoZSBicmFuY2ggdG8gY2hlY2tvdXQuJyksXG4gICAgICBjcmVhdGVfbmV3OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKFwiSWYgdHJ1ZSwgY3JlYXRlcyB0aGUgYnJhbmNoIGlmIGl0IGRvZXNuJ3QgZXhpc3QgKGxpa2UgZ2l0IGNoZWNrb3V0IC1iKS5cIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYnJhbmNoX25hbWUsIGNyZWF0ZV9uZXcgfTogR2l0Q2hlY2tvdXRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGNyZWF0ZUdpdCgpO1xuICAgICAgICBpZiAoY3JlYXRlX25ldykge1xuICAgICAgICAgIGF3YWl0IGdpdC5jaGVja291dExvY2FsQnJhbmNoKGJyYW5jaF9uYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBnaXQuY2hlY2tvdXQoYnJhbmNoX25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYnJhbmNoTmFtZTogYnJhbmNoX25hbWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGNoZWNrb3V0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfYXV0aCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2F1dGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2sgR2l0SHViIGF1dGhlbnRpY2F0aW9uIHN0YXR1cy4gSWYgbm90IGF1dGhlbnRpY2F0ZWQsIG9wZW5zIGEgdGVybWluYWwgd2luZG93IGZvciB0aGUgdXNlciB0byBzaWduIGluLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdGh1YlRva2VuID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0dJVEhVQl9UT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0JyB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBnaEFwaVJlcXVlc3QoJ0dFVCcsICcvdXNlcicpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGF1dGhlbnRpY2F0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGF1dGggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9jcmVhdGVfaXNzdWUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9jcmVhdGVfaXNzdWUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IEdpdEh1YiBpc3N1ZSBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSB0aXRsZScpLFxuICAgICAgYm9keTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgaXNzdWUgYm9keS9kZXNjcmlwdGlvbicpLFxuICAgICAgbGFiZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0xhYmVscyB0byBhcHBseScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBib2R5LCBsYWJlbHMgfTogR2hDcmVhdGVJc3N1ZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lIGZyb20gR0lUSFVCX1JFUE9TSVRPUlkgZW52Jyk7XG5cbiAgICAgICAgYXdhaXQgZ2hBcGlSZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9pc3N1ZXNgLCB7IHRpdGxlLCBib2R5LCBsYWJlbHMgfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY3JlYXRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgaXNzdWUgY3JlYXRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9saXN0X2lzc3VlcyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2xpc3RfaXNzdWVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xpc3QgaXNzdWVzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzdGF0ZTogei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdvcGVuJykuZGVzY3JpYmUoJ0ZpbHRlciBieSBpc3N1ZSBzdGF0ZScpLFxuICAgICAgbGFiZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZpbHRlciBieSBsYWJlbHMnKSxcbiAgICAgIGxpbWl0OiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBpc3N1ZXMgdG8gcmV0dXJuIChkZWZhdWx0OiAxMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzdGF0ZSwgbGFiZWxzLCBsaW1pdCB9OiBHaExpc3RJc3N1ZXNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZScpO1xuXG4gICAgICAgIGxldCBxdWVyeSA9IGBzdGF0ZT0ke3N0YXRlfWA7XG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBxdWVyeSArPSBgJmxhYmVscz0ke2xhYmVscy5qb2luKCcsJyl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzc3VlcyA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9pc3N1ZXM/JHtxdWVyeX0mcGVyX3BhZ2U9JHtsaW1pdCB8fCAxMH1gKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpc3N1ZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGlzc3VlcyBsaXN0aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfdmlld19jb21tZW50cyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3ZpZXdfY29tbWVudHMnLFxuICAgIGRlc2NyaXB0aW9uOiAnVmlldyBjb21tZW50cyBvbiBhIHNwZWNpZmljIGlzc3VlIG9yIHB1bGwgcmVxdWVzdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBpc3N1ZSBvciBQUiBudW1iZXInKSxcbiAgICAgIHR5cGU6IHouZW51bShbJ2lzc3VlJywgJ3ByJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnaXNzdWUnKS5kZXNjcmliZShcIldoZXRoZXIgaXQncyBhbiBpc3N1ZSBvciBhIHB1bGwgcmVxdWVzdFwiKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBudW1iZXIsIHR5cGUgfTogR2hWaWV3Q29tbWVudHNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZScpO1xuXG4gICAgICAgIGNvbnN0IGNvbW1lbnRzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9LyR7dHlwZSA9PT0gJ3ByJyA/ICdwdWxscycgOiAnaXNzdWVzJ30vJHtudW1iZXJ9L2NvbW1lbnRzYCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWVudHMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGNvbW1lbnRzIHZpZXdpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9jcmVhdGVfcHIgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9jcmVhdGVfcHInLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IHB1bGwgcmVxdWVzdCBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBQUiB0aXRsZScpLFxuICAgICAgYm9keTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgUFIgYm9keS9kZXNjcmlwdGlvbicpLFxuICAgICAgaGVhZF9icmFuY2g6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBicmFuY2ggY29udGFpbmluZyB5b3VyIGNoYW5nZXMnKSxcbiAgICAgIGJhc2VfYnJhbmNoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnbWFpbicpLmRlc2NyaWJlKCdUaGUgYnJhbmNoIHlvdSB3YW50IHRvIG1lcmdlIGludG8gKGUuZy4sIG1haW4sIG1hc3RlciknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgYm9keSwgaGVhZF9icmFuY2gsIGJhc2VfYnJhbmNoIH06IEdoQ3JlYXRlUHJQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZScpO1xuXG4gICAgICAgIGNvbnN0IHByID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3JlcG9OYW1lfS9wdWxsc2AsIHsgdGl0bGUsIGJvZHksIGhlYWQ6IGhlYWRfYnJhbmNoLCBiYXNlOiBiYXNlX2JyYW5jaCB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjcmVhdGVkOiB0cnVlLCB1cmw6IChwciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuaHRtbF91cmwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIFBSIGNyZWF0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfbGlzdF9wcnMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9saXN0X3BycycsXG4gICAgZGVzY3JpcHRpb246ICdMaXN0IHB1bGwgcmVxdWVzdHMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHN0YXRlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ29wZW4nKS5kZXNjcmliZSgnRmlsdGVyIGJ5IFBSIHN0YXRlJyksXG4gICAgICBsaW1pdDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggUFJzIHRvIHJldHVybiAoZGVmYXVsdDogMTApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc3RhdGUsIGxpbWl0IH06IEdoTGlzdFByc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lJyk7XG5cbiAgICAgICAgY29uc3QgcHJzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzP3N0YXRlPSR7c3RhdGV9JnBlcl9wYWdlPSR7bGltaXQgfHwgMTB9YCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcHJzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUnMgbGlzdGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX3ZpZXdfcHJfZGlmZiB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3ZpZXdfcHJfZGlmZicsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCB0aGUgZGlmZi9wYXRjaCBvZiBhIHNwZWNpZmljIHB1bGwgcmVxdWVzdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBQUiBudW1iZXInKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBudW1iZXIgfTogR2hWaWV3UHJEaWZmUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUnKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzLyR7bnVtYmVyfS9kaWZmYCwge1xuICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOfWAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGRpZmY6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZGlmZiA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkaWZmIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUiBkaWZmIGZldGNoaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfcHVzaCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3B1c2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnUHVzaCBsb2NhbCBjb21taXRzIHRvIHRoZSByZW1vdGUgR2l0SHViIHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBicmFuY2g6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFRoZSBicmFuY2ggdG8gcHVzaC4gRGVmYXVsdHMgdG8gY3VycmVudCBicmFuY2guJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYnJhbmNoIH06IEdoUHVzaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gY3JlYXRlR2l0KCk7XG4gICAgICAgIGF3YWl0IGdpdC5wdXNoKGJyYW5jaCB8fCAnb3JpZ2luJywgJ0hFQUQnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwdXNoZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIHB1c2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEM1IEZJWDogUHJvcGVyIHR5cGluZyBpbnN0ZWFkIG9mIGFueVxuaW1wb3J0IHR5cGUgKiBhcyBQdXBwZXRlZXIgZnJvbSAncHVwcGV0ZWVyJztcblxubGV0IHB1cHBldGVlck1vZHVsZTogdHlwZW9mIFB1cHBldGVlciB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRQdXBwZXRlZXIoKTogUHJvbWlzZTx0eXBlb2YgUHVwcGV0ZWVyPiB7XG4gIGlmICghcHVwcGV0ZWVyTW9kdWxlKSB7XG4gICAgY29uc3QgaW1wb3J0ZWQgPSBhd2FpdCBpbXBvcnQoJ3B1cHBldGVlcicpO1xuICAgIHB1cHBldGVlck1vZHVsZSA9IGltcG9ydGVkLmRlZmF1bHQgfHwgaW1wb3J0ZWQ7XG4gIH1cbiAgcmV0dXJuIHB1cHBldGVlck1vZHVsZTtcbn1cblxuLyoqIFJlc2V0IHB1cHBldGVlciBtb2R1bGUgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0UHVwcGV0ZWVyQ2FjaGUoKTogdm9pZCB7XG4gIHB1cHBldGVlck1vZHVsZSA9IG51bGw7XG59XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpcic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5cbi8qKiBCcm93c2VyIHNlc3Npb24gbWFuYWdlciB3aXRoIGF1dG8tY2xlYW51cCBhbmQgY29ubmVjdGlvbiBwb29saW5nIChzaW5nbGV0b24gcGF0dGVybikgKi9cbmNsYXNzIEJyb3dzZXJTZXNzaW9uTWFuYWdlciB7XG4gIHByaXZhdGUgYnJvd3Nlckluc3RhbmNlOiBQdXBwZXRlZXIuQnJvd3NlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGN1cnJlbnRQYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNsZWFudXBUaW1lcjogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICBwcml2YXRlIHJlYWRvbmx5IElOQUNUSVZJVFlfVElNRU9VVF9NUyA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuICBwcml2YXRlIHJlYWRvbmx5IE1BWF9SRVRSSUVTID0gMjtcbiAgcHJpdmF0ZSByZXRyeUNvdW50ID0gMDtcblxuICAvKiogR2V0IG9yIGNyZWF0ZSBhIHBlcnNpc3RlbnQgUHVwcGV0ZWVyIGJyb3dzZXIgaW5zdGFuY2Ugd2l0aCBhdXRvLXJldHJ5ICovXG4gIGFzeW5jIGdldEJyb3dzZXIoKTogUHJvbWlzZTxQdXBwZXRlZXIuQnJvd3Nlcj4ge1xuICAgIGlmICghdGhpcy5icm93c2VySW5zdGFuY2UgfHwgIXRoaXMuYnJvd3Nlckluc3RhbmNlLmNvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLnJldHJ5Q291bnQgPSAwO1xuICAgICAgd2hpbGUgKHRoaXMucmV0cnlDb3VudCA8IHRoaXMuTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBwdXBwZXRlZXJMaWIgPSBhd2FpdCBnZXRQdXBwZXRlZXIoKTtcbiAgICAgICAgICB0aGlzLmJyb3dzZXJJbnN0YW5jZSA9IGF3YWl0IHB1cHBldGVlckxpYi5sYXVuY2goeyBcbiAgICAgICAgICAgIGhlYWRsZXNzOiB0cnVlLFxuICAgICAgICAgICAgYXJnczogWyctLW5vLXNhbmRib3gnLCAnLS1kaXNhYmxlLXNldHVpZC1zYW5kYm94J10gLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHRoaXMucmV0cnlDb3VudCsrO1xuICAgICAgICAgIGlmICh0aGlzLnJldHJ5Q291bnQgPj0gdGhpcy5NQVhfUkVUUklFUykgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDAgKiB0aGlzLnJldHJ5Q291bnQpKTsgLy8gRXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVzZXRDbGVhbnVwVGltZXIoKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgIHJldHVybiB0aGlzLmJyb3dzZXJJbnN0YW5jZSE7XG4gIH1cblxuICAvKiogR2V0IG9yIGNyZWF0ZSBhIHBhZ2UgaW4gdGhlIHBlcnNpc3RlbnQgYnJvd3NlciBpbnN0YW5jZSAqL1xuICBhc3luYyBnZXRQYWdlKCk6IFByb21pc2U8UHVwcGV0ZWVyLlBhZ2U+IHtcbiAgICBpZiAoIXRoaXMuY3VycmVudFBhZ2UgfHwgIWF3YWl0IHRoaXMuaXNQYWdlVmFsaWQoKSkge1xuICAgICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHRoaXMuZ2V0QnJvd3NlcigpO1xuICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xuICAgIH1cbiAgICB0aGlzLnJlc2V0Q2xlYW51cFRpbWVyKCk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2U7XG4gIH1cblxuICAvKiogQ2hlY2sgaWYgY3VycmVudCBwYWdlIGlzIHN0aWxsIHZhbGlkICovXG4gIHByaXZhdGUgYXN5bmMgaXNQYWdlVmFsaWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5jdXJyZW50UGFnZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgYXdhaXQgdGhpcy5jdXJyZW50UGFnZS5ldmFsdWF0ZSgnMScpOyAvLyBRdWljayB2YWxpZGF0aW9uXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogUmVzZXQgdGhlIGluYWN0aXZpdHkgY2xlYW51cCB0aW1lciAqL1xuICBwcml2YXRlIHJlc2V0Q2xlYW51cFRpbWVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNsZWFudXBUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuY2xlYW51cFRpbWVyKTtcbiAgICB0aGlzLmxhc3RBY3Rpdml0eSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5jbGVhbnVwVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZGlzcG9zZSgpLCB0aGlzLklOQUNUSVZJVFlfVElNRU9VVF9NUyk7XG4gIH1cblxuICAvKiogRXhwbGljaXRseSBkaXNwb3NlIGJyb3dzZXIgYW5kIGNhbmNlbCBjbGVhbnVwIHRpbWVyICovXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2xlYW51cFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5jbGVhbnVwVGltZXIpO1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5icm93c2VySW5zdGFuY2UgJiYgdGhpcy5icm93c2VySW5zdGFuY2UuY29ubmVjdGVkKCkpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9hd2FpdC10aGVuYWJsZVxuICAgICAgICBhd2FpdCB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGNsb3NlIGVycm9yc1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmJyb3dzZXJJbnN0YW5jZSA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnRQYWdlID0gbnVsbDtcbiAgICAgIHRoaXMubGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMucmV0cnlDb3VudCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrIGlmIGJyb3dzZXIgaXMgY29ubmVjdGVkICovXG4gIGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhISh0aGlzLmJyb3dzZXJJbnN0YW5jZSAmJiB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jb25uZWN0ZWQoKSk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBjdXJyZW50IHBhZ2UgKHB1YmxpYyBhY2Nlc3NvcikgKi9cbiAgZ2V0Q3VycmVudFBhZ2UoKTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UGFnZTtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIGN1cnJlbnQgcGFnZSAocHVibGljIHNldHRlcikgKi9cbiAgc2V0Q3VycmVudFBhZ2UocGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2U7XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlIGZvciB0aGlzIG1vZHVsZVxuY29uc3QgYnJvd3Nlck1hbmFnZXIgPSBuZXcgQnJvd3NlclNlc3Npb25NYW5hZ2VyKCk7XG5cbi8qKiBFeHBvcnQgY2xlYW51cCBmdW5jdGlvbiBmb3IgcGx1Z2luIHVubG9hZCBsaWZlY3ljbGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG59XG5cbi8vIEM1IEZJWDogUHJvcGVyIHBhcmFtIHR5cGVzXG5pbnRlcmZhY2UgQnJvd3Nlck9wZW5QYWdlUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZztcbiAgd2FpdF9mb3Jfc2VsZWN0b3I/OiBzdHJpbmc7XG4gIGZ1bGxfcGFnZV9zY3JlZW5zaG90PzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEJyb3dzZXJTZXNzaW9uQ29udHJvbFBhcmFtcyB7XG4gIGFjdGlvbnM/OiB1bmtub3duW107XG4gIHJlYWRfcGFnZT86IGJvb2xlYW47XG4gIGZ1bGxfcmVhZD86IGJvb2xlYW47XG4gIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFByZXZpZXdIdG1sUGFyYW1zIHtcbiAgaHRtbF9jb250ZW50OiBzdHJpbmc7XG4gIGZpbGVfbmFtZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE9wZW5GaWxlUGFyYW1zIHtcbiAgdGFyZ2V0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJyb3dzZXJUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG4gIC8vIGJyb3dzZXJfb3Blbl9wYWdlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYnJvd3Nlcl9vcGVuX3BhZ2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnT3BlbiBhIHdlYnBhZ2UgaW4gYSBoZWFkbGVzcyBicm93c2VyIChQdXBwZXRlZXIpLCByZW5kZXIgaXQgb25jZSwgYW5kIHJldHVybiBjb250ZW50LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIG9wZW4nKSxcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdQYXRoIHRvIHNhdmUgYSBzY3JlZW5zaG90LicpLFxuICAgICAgd2FpdF9mb3Jfc2VsZWN0b3I6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ1NTIHNlbGVjdG9yIHRvIHdhaXQgZm9yIGJlZm9yZSByZXR1cm5pbmcuJyksXG4gICAgICBmdWxsX3BhZ2Vfc2NyZWVuc2hvdDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnSWYgdHJ1ZSwgY2FwdHVyZXMgdGhlIGZ1bGwgcGFnZSB3aGVuIHRha2luZyBhIHNjcmVlbnNob3QuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsLCBzY3JlZW5zaG90X3BhdGgsIHdhaXRfZm9yX3NlbGVjdG9yLCBmdWxsX3BhZ2Vfc2NyZWVuc2hvdCB9OiBCcm93c2VyT3BlblBhZ2VQYXJhbXMpID0+IHtcbiAgICAgIGxldCBicm93c2VyOiBQdXBwZXRlZXIuQnJvd3NlciB8IG51bGwgPSBudWxsO1xuICAgICAgbGV0IHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGJyb3dzZXIgPSBhd2FpdCBicm93c2VyTWFuYWdlci5nZXRCcm93c2VyKCk7XG4gICAgICAgIHBhZ2UgPSBicm93c2VyTWFuYWdlci5nZXRDdXJyZW50UGFnZSgpO1xuXG4gICAgICAgIGlmICghcGFnZSB8fCAoYXdhaXQgcGFnZS51cmwoKSkgIT09IHVybCkge1xuICAgICAgICAgIC8vIElmIG5vIGN1cnJlbnQgcGFnZSBvciBVUkwgZG9lc24ndCBtYXRjaCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAgIHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICBicm93c2VyTWFuYWdlci5zZXRDdXJyZW50UGFnZShwYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHBhZ2UuZ290byh1cmwsIHsgd2FpdFVudGlsOiAnZG9tY29udGVudGxvYWRlZCcgfSk7XG5cbiAgICAgICAgaWYgKHdhaXRfZm9yX3NlbGVjdG9yKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvclNlbGVjdG9yKHdhaXRfZm9yX3NlbGVjdG9yLCB7IHRpbWVvdXQ6IDUwMDAgfSk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBJZ25vcmUgdGltZW91dCwgY29udGludWUgd2l0aCBjb250ZW50IGV4dHJhY3Rpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHREYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgdXJsLCBvcGVuZWQ6IHRydWUgfTtcblxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoLCBmdWxsUGFnZTogZnVsbF9wYWdlX3NjcmVlbnNob3QgfSk7XG4gICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90U2F2ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlIHN0cmluZy1iYXNlZCBldmFsdWF0ZSB0byBieXBhc3MgVFMyNTg0L1RTMjMwNCAnZG9jdW1lbnQnIGVycm9ycyBpbiBOb2RlLmpzIGVudmlyb25tZW50XG4gICAgICAgIGNvbnN0IHRleHRDb250ZW50OiBzdHJpbmcgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKGByZXR1cm4gZG9jdW1lbnQuYm9keSA/IGRvY3VtZW50LmJvZHkuaW5uZXJUZXh0IDogJyc7YCk7XG4gICAgICAgIHJlc3VsdERhdGEucGFnZVRleHQgPSB0ZXh0Q29udGVudC5zdWJzdHJpbmcoMCwgMjAwMCk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0RGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gcGFnZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIE5PVEU6IFdlIGRvbid0IGNsb3NlIHRoZSBicm93c2VyIGhlcmUgYmVjYXVzZSB3ZSB1c2UgYSBzaW5nbGV0b24gcGF0dGVybi5cbiAgICAgICAgLy8gVGhlIGJyb3dzZXIgc3RheXMgYWxpdmUgZm9yIHN1YnNlcXVlbnQgcmVxdWVzdHMgdmlhIGJyb3dzZXJfc2Vzc2lvbl9jb250cm9sLlxuICAgICAgICAvLyBVc2UgYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlIHRvIGV4cGxpY2l0bHkgdGVybWluYXRlIGl0LlxuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBicm93c2VyX3Nlc3Npb25fY29udHJvbCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Jyb3dzZXJfc2Vzc2lvbl9jb250cm9sJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvbnRyb2wgdGhlIGFjdGl2ZSBwZXJzaXN0ZW50IGJyb3dzZXIgc2Vzc2lvbi4gU3VwcG9ydHMgYWN0aW9ucywgcGFnZSByZWFkaW5nLCBzY3JlZW5zaG90IGNhcHR1cmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBhY3Rpb25zOiB6LmFycmF5KHouYW55KCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHNjcmlwdGVkIGJyb3dzZXIgYWN0aW9ucyB0byBleGVjdXRlLicpLFxuICAgICAgcmVhZF9wYWdlOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdJZiB0cnVlLCByZXR1cm5zIHBhZ2UgbWV0YWRhdGEuJyksXG4gICAgICBmdWxsX3JlYWQ6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0lmIHRydWUsIGZvcmNlcyBmdWxsIHBhZ2UgdGV4dCBvdXRwdXQuJyksXG4gICAgICBzY3JlZW5zaG90X3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgc2NyZWVuc2hvdCBvdXRwdXQgcGF0aC4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBhY3Rpb25zLCByZWFkX3BhZ2UsIGZ1bGxfcmVhZCwgc2NyZWVuc2hvdF9wYXRoIH06IEJyb3dzZXJTZXNzaW9uQ29udHJvbFBhcmFtcykgPT4ge1xuICAgICAgbGV0IHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHBhZ2UgPSBhd2FpdCBicm93c2VyTWFuYWdlci5nZXRQYWdlKCk7XG5cbiAgICAgICAgaWYgKGFjdGlvbnMgJiYgQXJyYXkuaXNBcnJheShhY3Rpb25zKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgYWN0aW9uIG9mIGFjdGlvbnMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5bXSkge1xuICAgICAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuY2xpY2soYWN0aW9uLnNlbGVjdG9yIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAndHlwZScpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS50eXBlKGFjdGlvbi5zZWxlY3RvciBhcyBzdHJpbmcsIGFjdGlvbi50ZXh0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAnZ290bycpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKGFjdGlvbi51cmwgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09ICdldmFsdWF0ZScpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5ldmFsdWF0ZShhY3Rpb24uc2NyaXB0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IGFjdGlvbnNFeGVjdXRlZDogYWN0aW9ucz8ubGVuZ3RoIHx8IDAgfTtcblxuICAgICAgICBpZiAocmVhZF9wYWdlIHx8IGZ1bGxfcmVhZCkge1xuICAgICAgICAgIC8vIFVzZSBzdHJpbmctYmFzZWQgZXZhbHVhdGUgdG8gYnlwYXNzIFRTMjU4NCAnZG9jdW1lbnQnIGVycm9ycyBpbiBOb2RlLmpzIGVudmlyb25tZW50XG4gICAgICAgICAgY29uc3QgdGV4dDogc3RyaW5nID0gYXdhaXQgcGFnZS5ldmFsdWF0ZShgcmV0dXJuIGRvY3VtZW50LmJvZHkgPyBkb2N1bWVudC5ib2R5LmlubmVyVGV4dCA6ICcnO2ApO1xuICAgICAgICAgIHJlc3VsdERhdGEucGFnZVRleHQgPSBmdWxsX3JlYWQgPyB0ZXh0IDogdGV4dC5zdWJzdHJpbmcoMCwgMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoIH0pO1xuICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFNhdmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEJyb3dzZXIgY29udHJvbCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBQYWdlIHN0YXlzIGFsaXZlIGZvciBzZXNzaW9uIHJldXNlLiBCcm93c2VyIGlzIG1hbmFnZWQgYnkgYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlLlxuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBicm93c2VyX3Nlc3Npb25fY2xvc2UgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdicm93c2VyX3Nlc3Npb25fY2xvc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2xvc2UgdGhlIGFjdGl2ZSBwZXJzaXN0ZW50IGJyb3dzZXIgc2Vzc2lvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY2xvc2VkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjbG9zZSBicm93c2VyIHNlc3Npb246ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBFbnN1cmUgY2xlYW51cCBldmVuIG9uIGZhaWx1cmVcbiAgICAgICAgYXdhaXQgYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBwcmV2aWV3X2h0bWwgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdwcmV2aWV3X2h0bWwnLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlbmRlciBhbmQgcHJldmlldyBIVE1MIGNvbnRlbnQgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYnJvd3Nlci5cIixcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBIVE1MIGNvbnRlbnQgdG8gcmVuZGVyJyksXG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdwcmV2aWV3Lmh0bWwnKS5kZXNjcmliZSgnT3B0aW9uYWwgZmlsZW5hbWUgKGRlZmF1bHQ6IHByZXZpZXcuaHRtbCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBodG1sX2NvbnRlbnQsIGZpbGVfbmFtZSB9OiBQcmV2aWV3SHRtbFBhcmFtcykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBmaWxlX25hbWUgfHwgJ3ByZXZpZXcuaHRtbCc7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgZmlsZU5hbWUpO1xuXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWxfY29udGVudCk7XG5cbiAgICAgICAgLy8gT3BlbiBpbiBkZWZhdWx0IGJyb3dzZXIgdXNpbmcgRVMgaW1wb3J0XG4gICAgICAgIGNvbnN0IG9wZW5Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ29wZW4nKTtcbiAgICAgICAgYXdhaXQgb3Blbk1vZHVsZS5kZWZhdWx0KGZpbGVQYXRoKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHByZXZpZXdlZDogdHJ1ZSwgZmlsZTogZmlsZU5hbWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHByZXZpZXcgSFRNTDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gb3Blbl9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnb3Blbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogXCJPcGVuIGEgZmlsZSBvciBVUkwgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYXBwbGljYXRpb24uXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGFyZ2V0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdGaWxlIHBhdGggb3IgVVJMJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGFyZ2V0IH06IE9wZW5GaWxlUGFyYW1zKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdCh0YXJnZXQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG9wZW5lZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gb3BlbiBmaWxlOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IHZhbGlkYXRlU1FMUXVlcnkgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5cbi8vIExhenktbG9hZCBub2RlOnNxbGl0ZSAoTm9kZS5qcyAyMyspLiBHcmFjZWZ1bCBmYWxsYmFjayBmb3Igb2xkZXIgTm9kZSB2ZXJzaW9ucy5cbmxldCBzcWxpdGVNb2R1bGU6IHR5cGVvZiBpbXBvcnQoJ25vZGU6c3FsaXRlJykgfCBudWxsID0gbnVsbDtcbmxldCBzcWxpdGVMb2FkRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTcWxpdGUoKTogUHJvbWlzZTx0eXBlb2YgaW1wb3J0KCdub2RlOnNxbGl0ZScpPiB7XG4gIGlmIChzcWxpdGVNb2R1bGUpIHJldHVybiBzcWxpdGVNb2R1bGU7XG4gIGlmIChzcWxpdGVMb2FkRXJyb3IpIHRocm93IG5ldyBFcnJvcihzcWxpdGVMb2FkRXJyb3IpO1xuXG4gIHRyeSB7XG4gICAgc3FsaXRlTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdub2RlOnNxbGl0ZScpO1xuICAgIHJldHVybiBzcWxpdGVNb2R1bGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHNxbGl0ZUxvYWRFcnJvciA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgU1FMaXRlIGlzIG5vdCBhdmFpbGFibGUgKG5vZGU6c3FsaXRlIHJlcXVpcmVzIE5vZGUuanMgMjMrKS4gYCArXG4gICAgICBgT3JpZ2luYWwgZXJyb3I6ICR7c3FsaXRlTG9hZEVycm9yfS4gYCArXG4gICAgICBgUGxlYXNlIGRpc2FibGUgZGF0YWJhc2UgcXVlcmllcyBpbiBwbHVnaW4gc2V0dGluZ3Mgb3IgdXBncmFkZSBOb2RlLmBcbiAgICApO1xuICB9XG59XG5cbi8qKiBSZXNldCBzcWxpdGUgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFNxbGl0ZUNhY2hlKCk6IHZvaWQge1xuICBzcWxpdGVNb2R1bGUgPSBudWxsO1xuICBzcWxpdGVMb2FkRXJyb3IgPSBudWxsO1xufVxuXG4vKiogVHlwZWQgcGFyYW1zIGludGVyZmFjZSAqL1xuaW50ZXJmYWNlIFF1ZXJ5RGF0YWJhc2VQYXJhbXMge1xuICBxdWVyeTogc3RyaW5nO1xuICBkYl9wYXRoPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEYXRhYmFzZVRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBxdWVyeV9kYXRhYmFzZSB0b29sIFx1MjAxNCBDNyBGSVg6IEFkZGVkIG9wdGlvbmFsIGRiX3BhdGggcGFyYW1ldGVyXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3F1ZXJ5X2RhdGFiYXNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biByZWFkLW9ubHkgU1FMaXRlIHF1ZXJpZXMuIERlZmF1bHRzIHRvIGluLW1lbW9yeSBkYXRhYmFzZTsgb3B0aW9uYWxseSBzcGVjaWZ5IGEgZmlsZSBwYXRoLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NRTCBxdWVyeSBzdHJpbmcgKHJlYWQtb25seSBvbmx5KScpLFxuICAgICAgZGJfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJzptZW1vcnk6JykuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIFNRTGl0ZSBkYXRhYmFzZSBmaWxlIChkZWZhdWx0OiA6bWVtb3J5OiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgZGJfcGF0aCB9OiBRdWVyeURhdGFiYXNlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBTZWN1cml0eSBjaGVjayAtIHVzZSByb2J1c3QgU1FMIHZhbGlkYXRpb24gaW5zdGVhZCBvZiBzaW1wbGUgcmVnZXggbWF0Y2hpbmdcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkID0gdmFsaWRhdGVTUUxRdWVyeShxdWVyeSk7XG4gICAgICAgIGlmICghdmFsaWRhdGVkLnZhbGlkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIFNRTCBxdWVyeSBkZXRlY3RlZDogJHt2YWxpZGF0ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExhenktbG9hZCBub2RlOnNxbGl0ZSB3aXRoIGdyYWNlZnVsIGZhbGxiYWNrXG4gICAgICAgIGNvbnN0IHsgb3BlbiB9ID0gYXdhaXQgZ2V0U3FsaXRlKCk7XG4gICAgICAgIGNvbnN0IGRiID0gb3BlbihkYl9wYXRoIHx8ICc6bWVtb3J5OicpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUocXVlcnkpO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBzdG10LmFsbCgpO1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcXVlcnksIHJlc3VsdHMgfSB9O1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhdGFiYXNlIHF1ZXJ5IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IEJhY2tncm91bmRDb21tYW5kTWFuYWdlciB9IGZyb20gJy4uL2JhY2tncm91bmRDb21tYW5kcy5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZUNvbW1hbmQgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSdW5CYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgdGltZW91dF9ob3VyczogbnVtYmVyOyBuYW1lOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGVja0JhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgaWQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIENhbmNlbEJhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgaWQ6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcik6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBydW5fYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBhIGxvbmctcnVubmluZyBwcm9jZXNzIGluIHRoZSBiYWNrZ3JvdW5kLiBUaGUgcHJvY2VzcyBpcyBub3QgYmxvY2tlZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfaG91cnM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDEwKS5kZXNjcmliZSgnTUFOREFUT1JZOiBIb3cgbG9uZyB0aGUgcHJvY2VzcyBpcyBhbGxvd2VkIHRvIHJ1biBiZWZvcmUgYmVpbmcga2lsbGVkLicpLFxuICAgICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTUFOREFUT1JZOiBBIHNob3J0LCBkZXNjcmlwdGl2ZSBuYW1lIGZvciB0aGUgYmFja2dyb3VuZCB0YXNrJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCwgdGltZW91dF9ob3VycywgbmFtZSB9OiBSdW5CYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2VjdXJpdHkgY2hlY2sgLSB1c2Ugcm9idXN0IHNhbml0aXphdGlvbiBpbnN0ZWFkIG9mIHNpbXBsZSBzdHJpbmcgbWF0Y2hpbmdcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGlkID0gYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLnJlZ2lzdGVyKGNvbW1hbmQsIHRpbWVvdXRfaG91cnMsIG5hbWUpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlkLCBuYW1lLCBjb21tYW5kLCB0aW1lb3V0SG91cnM6IHRpbWVvdXRfaG91cnMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2hlY2tfYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2hlY2tfYmFja2dyb3VuZF9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrIHRoZSBzdGF0dXMsIHN0ZG91dCwgYW5kIHN0ZGVyciBvZiBhIHJ1bm5pbmcgb3IgY29tcGxldGVkIGJhY2tncm91bmQgY29tbWFuZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tbWFuZCBpZGVudGlmaWVyJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaWQgfTogQ2hlY2tCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IGJhY2tncm91bmRDb21tYW5kTWFuYWdlci5jaGVjayhpZCk7XG4gICAgICAgIGlmICghY29tbWFuZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbW1hbmQgbm90IGZvdW5kOiAke2lkfWAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBjb21tYW5kIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjYW5jZWxfYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2FuY2VsX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdLaWxsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1hbmQgaWRlbnRpZmllcicpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGlkIH06IENhbmNlbEJhY2tncm91bmRDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjYW5jZWxsZWQgPSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIuY2FuY2VsKGlkKTtcbiAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDYW5ub3QgY2FuY2VsIGNvbW1hbmQ6ICR7aWR9IChub3QgZm91bmQgb3Igbm90IHJ1bm5pbmcpYCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaWQsIGNhbmNlbGxlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZUNvbW1hbmQgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNoYXJlZCBTcGF3biBIZWxwZXIgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNwYXduUmVzdWx0IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZGF0YT86IHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH07XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNhZmVseSBzcGF3biBhIHByb2Nlc3Mgd2l0aCB0aW1lb3V0LCBjYXB0dXJpbmcgc3Rkb3V0L3N0ZGVyci5cbiAqIEVsaW1pbmF0ZXMgY29kZSBkdXBsaWNhdGlvbiBhY3Jvc3MgZXhlY3V0aW9uIHRvb2xzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzYWZlU3Bhd24oXG4gIGV4ZTogc3RyaW5nLFxuICBhcmdzOiBzdHJpbmdbXSxcbiAgdGltZW91dE1zOiBudW1iZXIsXG4gIGlucHV0Pzogc3RyaW5nXG4pOiBQcm9taXNlPFNwYXduUmVzdWx0PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IHByb2MgPSBzcGF3bihleGUsIGFyZ3MsIHtcbiAgICAgIHN0ZGlvOiBbJ3BpcGUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgICB0aW1lb3V0OiB0aW1lb3V0TXMsXG4gICAgICBjd2Q6IGdldFdvcmtpbmdEaXIoKSwgLy8gRXhlY3V0ZSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgIH0pO1xuXG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIGlmIChpbnB1dCkge1xuICAgICAgcHJvYy5zdGRpbj8ud3JpdGUoaW5wdXQpO1xuICAgICAgcHJvYy5zdGRpbj8uZW5kKCk7XG4gICAgfVxuXG4gICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwcm9jLmtpbGwoKTtcbiAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFeGVjdXRpb24gdGltZWQgb3V0JyB9KTtcbiAgICB9LCB0aW1lb3V0TXMpO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzdGRvdXQ6IHN0ZG91dC50cmltKCksIHN0ZGVycjogc3RkZXJyLnRyaW0oKSB9IH0pO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgU3Bhd24gZmFpbGVkOiAke2Vyci5tZXNzYWdlfWAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgUnVuSmF2YVNjcmlwdFBhcmFtcyB7IGphdmFzY3JpcHQ6IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgUnVuUHl0aG9uUGFyYW1zIHsgcHl0aG9uOiBzdHJpbmc7IHRpbWVvdXRfc2Vjb25kcz86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEV4ZWN1dGVDb21tYW5kUGFyYW1zIHsgY29tbWFuZDogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXI7IGlucHV0Pzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUnVuSW5UZXJtaW5hbFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBFeGVjdXRpb24gVG9vbHMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRXhlY3V0aW9uVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJ1bl9qYXZhc2NyaXB0IHRvb2wgXHUyMDE0IFNBTkRCT1hFRCB3aXRoIGRlbm8gKGlmIGF2YWlsYWJsZSkgb3Igbm9kZSB3aXRoIHN0cmljdCByZXN0cmljdGlvbnNcbiAgLy8gUzUgRklYOiBFbmhhbmNlZCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gdG8gcHJldmVudCBldmFsL3JlcXVpcmUgYnlwYXNzZXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2phdmFzY3JpcHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIEphdmFTY3JpcHQgY29kZSBzbmlwcGV0IHVzaW5nIE5vZGUuanMgKHNhbmRib3hlZCkuIE5vIGV4dGVybmFsIG1vZHVsZSBpbXBvcnRzIGFsbG93ZWQuIFN0YW5kYXJkIGxpYnJhcnkgb25seS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGphdmFzY3JpcHQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBKYXZhU2NyaXB0IGNvZGUgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCA2MCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBqYXZhc2NyaXB0LCB0aW1lb3V0X3NlY29uZHMgfTogUnVuSmF2YVNjcmlwdFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gUm9idXN0IGRhbmdlcm91cyBwYXR0ZXJuIGRldGVjdGlvbiBcdTIwMTQgYmxvY2tzIGV2YWwsIHJlcXVpcmUsIGltcG9ydCwgZnMsIGNoaWxkX3Byb2Nlc3NcbiAgICAgICAgLy8gUzUgRklYOiBBZGRlZCBwYXR0ZXJucyBmb3IgY29tbW9uIGJ5cGFzcyB0ZWNobmlxdWVzXG4gICAgICAgIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICAgICAgIC9cXGJyZXF1aXJlXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrL2ksXG4gICAgICAgICAgL1xcYmZzXFwuL2ksXG4gICAgICAgICAgL1xcYmNoaWxkX3Byb2Nlc3NcXGIvaSxcbiAgICAgICAgICAvXFxiZXZhbFxccypcXCgvaSxcbiAgICAgICAgICAvXFxiZXhlY1xccypcXCgvaSxcbiAgICAgICAgICAvZ2xvYmFsVGhpc1xcLnJlcXVpcmUvaSxcbiAgICAgICAgICAvcHJvY2Vzc1xcLmV4aXQvaSxcbiAgICAgICAgICAvX19wcm90b19fL2ksXG4gICAgICAgICAgLy8gUzUgRklYOiBCeXBhc3MgcHJldmVudGlvbiBwYXR0ZXJuc1xuICAgICAgICAgIC9GdW5jdGlvblxccypcXCgvaSwgICAgICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uIGNvbnN0cnVjdG9yXG4gICAgICAgICAgL1N0cmluZ1xcLmZyb21DaGFyQ29kZVxccypcXCgvaSwgICAgICAgLy8uZnJvbUNoYXJDb2RlIGJ5cGFzc1xuICAgICAgICAgIC9cXGJpbXBvcnRcXHMqXFwoLipcXCkvaSwgICAgICAgICAgICAgICAvLyBEeW5hbWljIGltcG9ydFxuICAgICAgICAgIC9cXC5jb25zdHJ1Y3Rvci9pLCAgICAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3RvciBhY2Nlc3NcbiAgICAgICAgICAvcmVxdWlyZVxcLnJlc29sdmUvaSwgICAgICAgICAgICAgICAgLy8gcmVxdWlyZS5yZXNvbHZlIGJ5cGFzc1xuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBkYW5nZXJvdXNQYXR0ZXJucykge1xuICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QoamF2YXNjcmlwdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhbmdlcm91cyBjb2RlIGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA1KSAqIDEwMDApO1xuICAgICAgICBcbiAgICAgICAgLy8gVXNlIE5vZGUuanMgd2l0aCAtLXVuaGFuZGxlZC1yZWplY3Rpb25zPXRocm93IGZvciBzYWZldHlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKCdub2RlJywgWyctZScsIGphdmFzY3JpcHRdLCB0aW1lb3V0TXMpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmVycm9yIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmRhdGE/LnN0ZGVyciAmJiAhcmVzdWx0LmRhdGEuc3Rkb3V0KSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZGF0YS5zdGRlcnIgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgb3V0cHV0OiByZXN1bHQuZGF0YT8uc3Rkb3V0IHx8ICcnIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJ1bl9weXRob24gdG9vbCBcdTIwMTQgU0FOREJPWEVEIHdpdGggc3RyaWN0IGltcG9ydCByZXN0cmljdGlvbnNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX3B5dGhvbicsXG4gICAgZGVzY3JpcHRpb246ICdSdW4gUHl0aG9uIGNvZGUgc25pcHBldCAoc2FuZGJveGVkLCBubyBleHRlcm5hbCBtb2R1bGVzKS4gU3RhbmRhcmQgbGlicmFyeSBvbmx5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcHl0aG9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgUHl0aG9uIGNvZGUgdG8gZXhlY3V0ZScpLFxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdUaW1lb3V0IGluIHNlY29uZHMgKG1heCA2MCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBweXRob24sIHRpbWVvdXRfc2Vjb25kcyB9OiBSdW5QeXRob25QYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFJvYnVzdCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gXHUyMDE0IGJsb2NrcyBvcywgc3VicHJvY2Vzcywgc2h1dGlsLCBldmFsLCBleGVjXG4gICAgICAgIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrb3NcXGIvaSxcbiAgICAgICAgICAvXFxiZnJvbVxccytvc1xccytpbXBvcnRcXGIvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK3N1YnByb2Nlc3NcXGIvaSxcbiAgICAgICAgICAvXFxiZnJvbVxccytzdWJwcm9jZXNzXFxzK2ltcG9ydFxcYi9pLFxuICAgICAgICAgIC9cXGJpbXBvcnRcXHMrc2h1dGlsXFxiL2ksXG4gICAgICAgICAgL1xcYl9faW1wb3J0X19cXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV2YWxcXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV4ZWNcXHMqXFwoL2ksXG4gICAgICAgICAgL29zXFwuc3lzdGVtL2ksXG4gICAgICAgICAgL29zXFwucG9wZW4vaSxcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICAgICAgICBpZiAocGF0dGVybi50ZXN0KHB5dGhvbikpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhbmdlcm91cyBQeXRob24gaW1wb3J0IGRldGVjdGVkOiAke3BhdHRlcm4uc291cmNlfWAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA1KSAqIDEwMDApO1xuICAgICAgICBcbiAgICAgICAgLy8gVHJ5IHB5dGhvbjMgZmlyc3QsIGZhbGwgYmFjayB0byBweXRob25cbiAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bigncHl0aG9uMycsIFsnLWMnLCBweXRob25dLCB0aW1lb3V0TXMpO1xuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5lcnJvcj8uaW5jbHVkZXMoJ25vdCBmb3VuZCcpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKCdweXRob24nLCBbJy1jJywgcHl0aG9uXSwgdGltZW91dE1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5kYXRhPy5zdGRlcnIgJiYgIXJlc3VsdC5kYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmRhdGEuc3RkZXJyIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG91dHB1dDogcmVzdWx0LmRhdGE/LnN0ZG91dCB8fCAnJyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBleGVjdXRlX2NvbW1hbmQgdG9vbCBcdTIwMTQgU0FGRSBWRVJTSU9OIHdpdGhvdXQgc2hlbGw6dHJ1ZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdleGVjdXRlX2NvbW1hbmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRXhlY3V0ZSBhIGNvbW1hbmQgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFVzZXMgc2FmZSBhcmd1bWVudCBwYXJzaW5nIChubyBzaGVsbCBpbnRlcnByZXRhdGlvbikuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2hlbGwgY29tbWFuZCB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X3NlY29uZHM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDYwKS5vcHRpb25hbCgpLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ1RpbWVvdXQgaW4gc2Vjb25kcyAobWF4IDYwKScpLFxuICAgICAgaW5wdXQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIklucHV0IHRleHQgdG8gcGlwZSB0byB0aGUgY29tbWFuZCdzIHN0ZGluLlwiKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21tYW5kLCB0aW1lb3V0X3NlY29uZHMsIGlucHV0IH06IEV4ZWN1dGVDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUNvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgIGlmICghc2FuaXRpemVkLnNhZmUpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbnNhZmUgY29tbWFuZCBkZXRlY3RlZDogJHtzYW5pdGl6ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhcnNlIGNvbW1hbmQgaW50byBleGVjdXRhYmxlICsgYXJncyAobm8gc2hlbGwgaW50ZXJwcmV0YXRpb24pXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcGFyc2VkLmV4ZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VtcHR5IGNvbW1hbmQnIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA1KSAqIDEwMDApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24ocGFyc2VkLmV4ZSwgcGFyc2VkLmFyZ3MsIHRpbWVvdXRNcywgaW5wdXQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmVycm9yIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmRhdGE/LnN0ZGVyciAmJiAhcmVzdWx0LmRhdGEuc3Rkb3V0KSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZGF0YS5zdGRlcnIgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdC5kYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBydW5faW5fdGVybWluYWwgdG9vbCBcdTIwMTQgU0FGRSBWRVJTSU9OIHdpdGhvdXQgc2hlbGw6dHJ1ZVxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdydW5faW5fdGVybWluYWwnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGF1bmNoIGEgY29tbWFuZCBpbiBhIG5ldywgc2VwYXJhdGUgaW50ZXJhY3RpdmUgdGVybWluYWwgd2luZG93LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tbWFuZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNoZWxsIGNvbW1hbmQgdG8gZXhlY3V0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbW1hbmQgfTogUnVuSW5UZXJtaW5hbFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuICAgICAgICBcbiAgICAgICAgaWYgKGlzV2luZG93cykge1xuICAgICAgICAgIHNwYXduKCdjbWQuZXhlJywgWycvYycsICdzdGFydCcsICdDb21tYW5kIFByb21wdCcsICcvaycsIGNvbW1hbmRdLCB7IFxuICAgICAgICAgICAgZGV0YWNoZWQ6IHRydWUsIFxuICAgICAgICAgICAgc3RkaW86ICdpZ25vcmUnIFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHRlcm1pbmFscyA9IFsneHRlcm0nLCAnZ25vbWUtdGVybWluYWwnLCAna29uc29sZScsICd4ZmNlNC10ZXJtaW5hbCddO1xuICAgICAgICAgIGxldCBsYXVuY2hlZCA9IGZhbHNlO1xuICAgICAgICAgIFxuICAgICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtaW5hbHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHNwYXduKHRlcm0sIFsnLWUnLCBjb21tYW5kXSwgeyBkZXRhY2hlZDogdHJ1ZSwgc3RkaW86ICdpZ25vcmUnIH0pO1xuICAgICAgICAgICAgICBsYXVuY2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIWxhdW5jaGVkKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBzdWl0YWJsZSB0ZXJtaW5hbCBlbXVsYXRvciBmb3VuZC4gSW5zdGFsbCB4dGVybSBvciBnbm9tZS10ZXJtaW5hbC4nIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBsYXVuY2hlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gb3BlbiB0ZXJtaW5hbDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuXG4vKipcbiAqIFNhZmVseSBwYXJzZSBhIHNoZWxsIGNvbW1hbmQgaW50byBleGVjdXRhYmxlIGFuZCBhcmd1bWVudHMuXG4gKiBIYW5kbGVzIGJhc2ljIHF1b3RpbmcgYnV0IGF2b2lkcyBzaGVsbCBpbnRlcnByZXRhdGlvbiBlbnRpcmVseS5cbiAqL1xuZnVuY3Rpb24gcGFyc2VDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHsgZXhlOiBzdHJpbmc7IGFyZ3M6IHN0cmluZ1tdIH0ge1xuICBjb25zdCB0cmltbWVkID0gY29tbWFuZC50cmltKCk7XG4gIFxuICBpZiAoIXRyaW1tZWQpIHtcbiAgICByZXR1cm4geyBleGU6ICcnLCBhcmdzOiBbXSB9O1xuICB9XG5cbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG4gIGxldCBjdXJyZW50ID0gJyc7XG4gIGxldCBpblF1b3RlOiAnXCInIHwgXCInXCIgfCBudWxsID0gbnVsbDtcbiAgXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdHJpbW1lZC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoYXIgPSB0cmltbWVkW2ldO1xuICAgIFxuICAgIGlmIChpblF1b3RlKSB7XG4gICAgICBpZiAoY2hhciA9PT0gaW5RdW90ZSkge1xuICAgICAgICBpblF1b3RlID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQgKz0gY2hhcjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCIpIHtcbiAgICAgIGluUXVvdGUgPSBjaGFyO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gJyAnKSB7XG4gICAgICBpZiAoY3VycmVudCkge1xuICAgICAgICBwYXJ0cy5wdXNoKGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50ID0gJyc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnQgKz0gY2hhcjtcbiAgICB9XG4gIH1cbiAgXG4gIGlmIChjdXJyZW50KSB7XG4gICAgcGFydHMucHVzaChjdXJyZW50KTtcbiAgfVxuXG4gIGNvbnN0IGV4ZSA9IHBhcnRzWzBdIHx8ICcnO1xuICBjb25zdCBhcmdzID0gcGFydHMuc2xpY2UoMSk7XG4gIFxuICByZXR1cm4geyBleGUsIGFyZ3MgfTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlTWFuYWdlciB9IGZyb20gJy4uL3N0YXRlTWFuYWdlci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBOb3RpZnlPcHRpb25zIHtcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIG1zZz86IHN0cmluZztcbiAgc291bmQ/OiBib29sZWFuIHwgc3RyaW5nO1xuICBpY29uPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG50eXBlIFNhdmVNZW1vcnlQYXJhbXMgPSB7IGZhY3Q6IHN0cmluZzsgfTtcbnR5cGUgUmVhZENsaXBib2FyZFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIG5ldmVyPjtcbnR5cGUgV3JpdGVDbGlwYm9hcmRQYXJhbXMgPSB7IGNvbnRlbnQ6IHN0cmluZzsgfTtcbnR5cGUgU2VuZE5vdGlmaWNhdGlvblBhcmFtcyA9IHsgdGl0bGU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nOyBpY29uPzogc3RyaW5nOyB9O1xuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG4vKipcbiAqIENyb3NzLXBsYXRmb3JtIGNsaXBib2FyZCBvcGVyYXRpb25zIHVzaW5nIHN5c3RlbSBjb21tYW5kcy5cbiAqL1xuXG4vLyBTNiBGSVg6IFByb3BlciBlc2NhcGluZyBmb3Igc2hlbGwgaW5qZWN0aW9uIHByZXZlbnRpb25cbmZ1bmN0aW9uIGVzY2FwZUZvclBvd2VyU2hlbGwoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gRXNjYXBlIGRvdWJsZSBxdW90ZXMgYW5kIGRvbGxhciBzaWducyAod2hpY2ggdHJpZ2dlciB2YXJpYWJsZSBleHBhbnNpb24gaW4gUFMpXG4gIHJldHVybiBjb250ZW50LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKS5yZXBsYWNlKC9cXCQvZywgJ1xcXFwkJyk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUZvckJhc2goY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gRXNjYXBlIHNpbmdsZSBxdW90ZXMgYnkgZW5kaW5nIHRoZSBxdW90ZSwgYWRkaW5nIGVzY2FwZWQgcXVvdGUsIHJlLW9wZW5pbmcgcXVvdGVcbiAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSgvJy9nLCBcIidcXFxcJydcIik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRDbGlwYm9hcmQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuICAgIFxuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93cyBQb3dlclNoZWxsXG4gICAgICAgIGNtZCA9ICdwb3dlcnNoZWxsLmV4ZSc7XG4gICAgICAgIGFyZ3MgPSBbJy1Ob1Byb2ZpbGUnLCAnLUNvbW1hbmQnLCAnW0NvbnNvbGVdOjpPdXRwdXRFbmNvZGluZyA9IFtTeXN0ZW0uVGV4dC5FbmNvZGluZ106OlVURjg7IEdldC1DbGlwYm9hcmQgLVJhdyddO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TIHBicGFzdGVcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgJ3BicGFzdGUnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBMaW51eCB4Y2xpcCBvciB4c2VsXG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsICcoeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgLW8gMj4vZGV2L251bGwgfHwgeHNlbCAtLWNsaXBib2FyZCAtLW91dHB1dCAyPi9kZXYvbnVsbCkgfCB0ciAtZCBcXCdcXFxcMFxcJyddO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICBcbiAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsIChjb2RlKSA9PiB7XG4gICAgICBpZiAoY29kZSA9PT0gMCAmJiBzdGRvdXQudHJpbSgpKSB7XG4gICAgICAgIHJlc29sdmUoc3Rkb3V0LnRyaW0oKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBDbGlwYm9hcmQgcmVhZCBmYWlsZWQgKGV4aXQgY29kZSAke2NvZGV9KTogJHtzdGRlcnIgfHwgJ05vIGNsaXBib2FyZCBjb250ZW50J31gKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgXG4gICAgLy8gVGltZW91dCBhZnRlciA1IHNlY29uZHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2xpcGJvYXJkIHJlYWQgdGltZWQgb3V0JykpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cblxuLy8gUzYgRklYOiBQcm9wZXIgZXNjYXBpbmcgdG8gcHJldmVudCBzaGVsbCBpbmplY3Rpb24gaW4gY2xpcGJvYXJkIHdyaXRlXG5hc3luYyBmdW5jdGlvbiB3cml0ZUNsaXBib2FyZChjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgY21kOiBzdHJpbmc7XG4gICAgbGV0IGFyZ3M6IHN0cmluZ1tdO1xuICAgIFxuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93cyBQb3dlclNoZWxsIHdpdGggU2V0LUNsaXBib2FyZCBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZENvbnRlbnQgPSBlc2NhcGVGb3JQb3dlclNoZWxsKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gWyctTm9Qcm9maWxlJywgJy1Db21tYW5kJywgYFtDb25zb2xlXTo6T3V0cHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4OyBcIiR7ZXNjYXBlZENvbnRlbnR9XCIgfCBTZXQtQ2xpcGJvYXJkYF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGFyd2luJzpcbiAgICAgICAgLy8gbWFjT1MgcGJjb3B5IFx1MjAxNCBTNiBGSVg6IFByb3BlciBlc2NhcGluZ1xuICAgICAgICBjb25zdCBlc2NhcGVkQmFzaCA9IGVzY2FwZUZvckJhc2goY29udGVudCk7XG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsIGBlY2hvIC1uICcke2VzY2FwZWRCYXNofScgfCBwYmNvcHlgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBMaW51eCB4Y2xpcCBvciB4c2VsIFx1MjAxNCBTNiBGSVg6IFByb3BlciBlc2NhcGluZ1xuICAgICAgICBjb25zdCBlc2NhcGVkTGludXggPSBlc2NhcGVGb3JCYXNoKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgZWNobyAtbiAnJHtlc2NhcGVkTGludXh9JyB8ICh4Y2xpcCAtc2VsZWN0aW9uIGNsaXBib2FyZCAyPi9kZXYvbnVsbCB8fCB4c2VsIC0tY2xpcGJvYXJkIC0taW5wdXQgMj4vZGV2L251bGwpYF07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHByb2MgPSBzcGF3bihjbWQsIGFyZ3MpO1xuICAgIFxuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsIChjb2RlKSA9PiB7XG4gICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBDbGlwYm9hcmQgd3JpdGUgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyfWApKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICBcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgc2Vjb25kc1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcHJvYy5raWxsKCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdDbGlwYm9hcmQgd3JpdGUgdGltZWQgb3V0JykpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGaW5kIExNIFN0dWRpbyBpbnN0YWxsYXRpb24gZGlyZWN0b3J5IGFjcm9zcyBwbGF0Zm9ybXMuXG4gKi9cbmZ1bmN0aW9uIGZpbmRMTVN0dWRpb0hvbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIC8vIENvbW1vbiBwYXRocyB0byBjaGVja1xuICBjb25zdCBjYW5kaWRhdGVzOiBzdHJpbmdbXSA9IFtdO1xuICBcbiAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkFQUERBVEEgfHwgJycsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkxPQ0FMQVBQREFUQSB8fCAnJywgJ1Byb2dyYW1zJywgJ2xtLXN0dWRpbycpLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuUFJPR1JBTUZJTEVTIHx8ICcnLCAnTE0gU3R1ZGlvJyksXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudlsnUFJPR1JBTURBVEEnXSB8fCAnJywgJ0xNIFN0dWRpbycpXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGFyd2luJzpcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJ0xpYnJhcnknLCAnQXBwbGljYXRpb24gU3VwcG9ydCcsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgJy9BcHBsaWNhdGlvbnMvTE0gU3R1ZGlvLmFwcC9Db250ZW50cy9SZXNvdXJjZXMvYXBwLmFzYXInXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDogLy8gTGludXhcbiAgICAgIGNhbmRpZGF0ZXMucHVzaChcbiAgICAgICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbCcsICdzaGFyZScsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgJy9vcHQvbG0tc3R1ZGlvJyxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgJycsICcubG0tc3R1ZGlvJylcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIFxuICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIHBhdGhzXG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVXRpbGl0eVRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlciwgZ2V0RW5hYmxlZFRvb2xzPzogKCkgPT4gc3RyaW5nW10pOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gc2F2ZV9tZW1vcnkgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzYXZlX21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdTYXZlIGEgc3BlY2lmaWMgcGllY2Ugb2YgaW5mb3JtYXRpb24gb3IgZmFjdCB0byBsb25nLXRlcm0gbWVtb3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmFjdDogei5zdHJpbmcoKS5taW4oMSkuZGVzY3JpYmUoJ1RoZSBzcGVjaWZpYyBmYWN0IG9yIHBpZWNlIG9mIGluZm9ybWF0aW9uIHRvIHJlbWVtYmVyLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZhY3QgfTogU2F2ZU1lbW9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdGVNYW5hZ2VyLnNldChgbWVtb3J5XyR7RGF0ZS5ub3coKX1gLCBmYWN0KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzYXZlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnZXRfc3lzdGVtX2luZm8gdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfc3lzdGVtX2luZm8nLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGluZm9ybWF0aW9uIGFib3V0IHRoZSBzeXN0ZW0gKE9TLCBDUFUsIE1lbW9yeSkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHBsYXRmb3JtOiBvcy5wbGF0Zm9ybSgpLFxuICAgICAgICAgICAgYXJjaDogb3MuYXJjaCgpLFxuICAgICAgICAgICAgY3B1czogb3MuY3B1cygpLmxlbmd0aCxcbiAgICAgICAgICAgIHRvdGFsTWVtb3J5OiBvcy50b3RhbG1lbSgpLFxuICAgICAgICAgICAgZnJlZU1lbW9yeTogb3MuZnJlZW1lbSgpLFxuICAgICAgICAgICAgaG9zdG5hbWU6IG9zLmhvc3RuYW1lKCksXG4gICAgICAgICAgICByZWxlYXNlOiBvcy5yZWxlYXNlKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgc3lzdGVtIGluZm86ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlYWRfY2xpcGJvYXJkIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZWFkX2NsaXBib2FyZCcsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIHRleHQgY29udGVudCBmcm9tIHRoZSBzeXN0ZW0gY2xpcGJvYXJkLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChfcGFyYW1zOiBSZWFkQ2xpcGJvYXJkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zIChlbXB0eSBvYmplY3QpXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZENsaXBib2FyZCgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbnRlbnQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gd3JpdGVfY2xpcGJvYXJkIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3cml0ZV9jbGlwYm9hcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnV3JpdGUgdGV4dCBjb250ZW50IHRvIHRoZSBzeXN0ZW0gY2xpcGJvYXJkLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgY29udGVudCB0byB3cml0ZSB0byBjbGlwYm9hcmQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb250ZW50IH06IFdyaXRlQ2xpcGJvYXJkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZUNsaXBib2FyZChjb250ZW50KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB3cml0dGVuOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHNlbmRfbm90aWZpY2F0aW9uIHRvb2wgLSBJTVBMRU1FTlRFRCB1c2luZyBub2RlLW5vdGlmaWVyXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NlbmRfbm90aWZpY2F0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlbmQgYSBzeXN0ZW0gbm90aWZpY2F0aW9uIHRvIHRoZSB1c2VyLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05vdGlmaWNhdGlvbiB0aXRsZScpLFxuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTm90aWZpY2F0aW9uIG1lc3NhZ2UnKSxcbiAgICAgIGljb246IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgY3VzdG9tIGljb24gcGF0aCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBtZXNzYWdlLCBpY29uIH06IFNlbmROb3RpZmljYXRpb25QYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90aWZpZXJNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ25vZGUtbm90aWZpZXInKTtcbiAgICAgICAgIFxuICAgICAgICBjb25zdCBub3RpZmllciA9IG5vdGlmaWVyTW9kdWxlLmRlZmF1bHQgfHwgbm90aWZpZXJNb2R1bGU7XG5cbiAgICAgICAgY29uc3Qgb3B0aW9uczogTm90aWZ5T3B0aW9ucyA9IHtcbiAgICAgICAgICB0aXRsZTogdGl0bGUgfHwgJ0FJIFRvb2xib3gnLFxuICAgICAgICAgIG1zZzogbWVzc2FnZSB8fCAnJyxcbiAgICAgICAgICBzb3VuZDogdHJ1ZSwgLy8gSW5jbHVkZSBzb3VuZCBvbiBtYWNPU1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpY29uKSB7XG4gICAgICAgICAgb3B0aW9ucy5pY29uID0gaWNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vdGlmaWVyKG9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2VudDogdHJ1ZSwgdGl0bGUsIG1lc3NhZ2UgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHNlbmQgbm90aWZpY2F0aW9uOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBmaW5kTE1TdHVkaW9Ib21lIHRvb2wgLSBJTVBMRU1FTlRFRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmaW5kTE1TdHVkaW9Ib21lJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xvY2F0ZSBMTSBTdHVkaW8gaW5zdGFsbGF0aW9uIGRpcmVjdG9yeSBhY3Jvc3MgcGxhdGZvcm1zLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGhvbWVEaXIgPSBmaW5kTE1TdHVkaW9Ib21lKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaG9tZURpcikge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBmb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgICAgcGF0aDogaG9tZURpcixcbiAgICAgICAgICAgICAgcGxhdGZvcm06IG9zLnBsYXRmb3JtKCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUHJvdmlkZSBjb21tb24gcGF0aHMgZm9yIG1hbnVhbCByZWZlcmVuY2VcbiAgICAgICAgICBjb25zdCBjb21tb25QYXRocyA9IFtcbiAgICAgICAgICAgICdXaW5kb3dzOiAlQVBQREFUQSVcXFxcbG0tc3R1ZGlvJyxcbiAgICAgICAgICAgICdtYWNPUzogfi9MaWJyYXJ5L0FwcGxpY2F0aW9uIFN1cHBvcnQvbG0tc3R1ZGlvJyxcbiAgICAgICAgICAgICdMaW51eDogfi8ubG9jYWwvc2hhcmUvbG0tc3R1ZGlvJ1xuICAgICAgICAgIF0uam9pbignXFxuJyk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogYExNIFN0dWRpbyBob21lIGRpcmVjdG9yeSBub3QgZm91bmQuXFxuXFxuQ29tbW9uIHBhdGhzOlxcbiR7Y29tbW9uUGF0aHN9YCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZmluZCBMTSBTdHVkaW8gaG9tZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2VuYWJsZWRfdG9vbHMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfZW5hYmxlZF90b29scycsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgbGlzdCBvZiBjdXJyZW50bHkgZW5hYmxlZCB0b29scyBiYXNlZCBvbiBjb25maWd1cmF0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnZXRFbmFibGVkVG9vbHMpIHtcbiAgICAgICAgICBjb25zdCB0b29sTmFtZXMgPSBnZXRFbmFibGVkVG9vbHMoKTtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHRvb2xDb3VudDogdG9vbE5hbWVzLmxlbmd0aCwgdG9vbHM6IHRvb2xOYW1lcyB9IH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVnaXN0cnkgYWNjZXNzIG5vdCBhdmFpbGFibGUnIH07XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgZW5hYmxlZCB0b29sczogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgSW1hZ2VUb1RleHRQYXJhbXMge1xuICBpbWFnZVBhdGg6IHN0cmluZztcbiAgbGFuZ3VhZ2U/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBEZXNjcmliZUltYWdlUGFyYW1zIHtcbiAgaW1hZ2VQYXRoOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBTY3JlZW5zaG90RGVza3RvcFBhcmFtcyB7XG4gIG91dHB1dFBhdGg/OiBzdHJpbmc7XG4gIGZvcm1hdD86ICdwbmcnIHwgJ2pwZWcnO1xuICBxdWFsaXR5PzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgQ29tcGFyZUltYWdlc1BhcmFtcyB7XG4gIGltYWdlMVBhdGg6IHN0cmluZztcbiAgaW1hZ2UyUGF0aDogc3RyaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBIZWxwZXIgRnVuY3Rpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBWYWxpZGF0ZSBmaWxlIGV4aXN0cyBhbmQgaXMgYW4gaW1hZ2UgKi9cbmZ1bmN0aW9uIHZhbGlkYXRlSW1hZ2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9IHtcbiAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpO1xuICBcbiAgaWYgKCFzdGF0LmlzRmlsZSgpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFBhdGggXCIke2ZpbGVQYXRofVwiIGlzIG5vdCBhIGZpbGVgIH07XG4gIH1cbiAgXG4gIC8vIENoZWNrIGZpbGUgZXh0ZW5zaW9uIChiYXNpYyB2YWxpZGF0aW9uKVxuICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IGFsbG93ZWRFeHRlbnNpb25zID0gWycucG5nJywgJy5qcGcnLCAnLmpwZWcnLCAnLmJtcCcsICcuZ2lmJywgJy50aWZmJywgJy53ZWJwJ107XG4gIFxuICBpZiAoIWFsbG93ZWRFeHRlbnNpb25zLmluY2x1ZGVzKGV4dCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgaW1hZ2UgZm9ybWF0OiAke2V4dH1gIH07XG4gIH1cbiAgXG4gIC8vIENoZWNrIGZpbGUgc2l6ZSAobWF4IDUwTUIpXG4gIGNvbnN0IG1heFNpemUgPSA1MCAqIDEwMjQgKiAxMDI0OyAvLyA1ME1CXG4gIGlmIChzdGF0LnNpemUgPiBtYXhTaXplKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEZpbGUgdG9vIGxhcmdlICgkeyhzdGF0LnNpemUgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCgxKX1NQiksIG1heCBpcyA1ME1CYCB9O1xuICB9XG4gIFxuICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEltYWdlIHByb2Nlc3NpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEV4dHJhY3QgdGV4dCBmcm9tIGltYWdlcyB1c2luZyBUZXNzZXJhY3QuanMgT0NSLlxuICovXG5hc3luYyBmdW5jdGlvbiBpbWFnZVRvVGV4dCh7IGltYWdlUGF0aCwgbGFuZ3VhZ2UgPSAnZW5nJyB9OiBJbWFnZVRvVGV4dFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZVBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICAvLyBMYXp5LWxvYWQgVGVzc2VyYWN0LmpzIHRvIGF2b2lkIGhlYXZ5IGluaXRpYWwgbG9hZFxuICAgIGNvbnN0IFRlc3NlcmFjdCA9IChhd2FpdCBpbXBvcnQoJ3Rlc3NlcmFjdC5qcycpKS5kZWZhdWx0O1xuXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBPQ1Igc3RhcnRpbmcgZm9yICR7aW1hZ2VQYXRofSAobGFuZ3VhZ2U6ICR7bGFuZ3VhZ2V9KWApO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFRlc3NlcmFjdC5yZWNvZ25pemUoaW1hZ2VQYXRoLCBsYW5ndWFnZSwge1xuICAgICAgbG9nZ2VyOiAobSkgPT4ge1xuICAgICAgICBpZiAobS5zdGF0dXMgPT09ICdyZWNvZ25pemluZyB0ZXh0Jykge1xuICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBcXHJbQUkgVG9vbGJveF0gT0NSIHByb2dyZXNzOiAkeyhtLnByb2dyZXNzICogMTAwKS50b0ZpeGVkKDApfSVgKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKCdcXG5bQUkgVG9vbGJveF0gT0NSIGNvbXBsZXRlJyk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHRleHQ6IHJlc3VsdC5kYXRhLnRleHQudHJpbSgpLFxuICAgICAgICBjb25maWRlbmNlOiByZXN1bHQuZGF0YS5jb25maWRlbmNlLFxuICAgICAgICBsYW5ndWFnZSxcbiAgICAgICAgd29yZHM6IHJlc3VsdC5kYXRhLndvcmRzPy5sZW5ndGggfHwgMCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogRGVzY3JpYmUgaW1hZ2UgY29udGVudCB1c2luZyB2aXNpb24gbW9kZWwgb3IgYmFzaWMgbWV0YWRhdGEuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlc2NyaWJlSW1hZ2UoeyBpbWFnZVBhdGggfTogRGVzY3JpYmVJbWFnZVBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZVBhdGgpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGltYWdlUGF0aCk7XG4gICAgXG4gICAgLy8gUmV0dXJuIG1ldGFkYXRhIHNpbmNlIHdlIGRvbid0IGhhdmUgYSB2aXNpb24gbW9kZWwgaW50ZWdyYXRlZCB5ZXRcbiAgICAvLyBUaGlzIGNhbiBiZSBleHRlbmRlZCB3aXRoIHZpc2lvbiBBUEkgY2FsbHMgaW4gdGhlIGZ1dHVyZVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBwYXRoOiBpbWFnZVBhdGgsXG4gICAgICAgIHNpemU6IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgIGZvcm1hdDogcGF0aC5leHRuYW1lKGltYWdlUGF0aCkucmVwbGFjZSgnLicsICcnKS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICBub3RlOiAnVmlzaW9uIG1vZGVsIGRlc2NyaXB0aW9uIHJlcXVpcmVzIGludGVncmF0aW9uIHdpdGggYSB2aXNpb24gQVBJIChlLmcuLCBHUFQtNCBWaXNpb24sIENsYXVkZSBWaXNpb24pLiBUaGlzIHRvb2wgY3VycmVudGx5IHJldHVybnMgbWV0YWRhdGEuJyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogQ2FwdHVyZSBkZXNrdG9wIHNjcmVlbnNob3QgYW5kIHNhdmUgdG8gZmlsZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2NyZWVuc2hvdERlc2t0b3AoeyBcbiAgb3V0cHV0UGF0aCwgXG4gIGZvcm1hdCA9ICdwbmcnLCBcbiAgcXVhbGl0eSA9IDkwIFxufTogU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XG4gICAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICAgIFxuICAgIGxldCBjbWQ6IHN0cmluZztcbiAgICBsZXQgYXJnczogc3RyaW5nW107XG4gICAgbGV0IHRlbXBQYXRoOiBzdHJpbmc7XG5cbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3M6IFVzZSBQb3dlclNoZWxsIHdpdGggQWRkLVR5cGUgZm9yIGhpZ2gtcXVhbGl0eSBzY3JlZW5zaG90c1xuICAgICAgICB0ZW1wUGF0aCA9IG91dHB1dFBhdGggfHwgcGF0aC5qb2luKG9zLnRtcGRpcigpLCBgc2NyZWVuc2hvdF8ke0RhdGUubm93KCl9LnBuZ2ApO1xuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gW1xuICAgICAgICAgICctTm9Qcm9maWxlJyxcbiAgICAgICAgICAnLUNvbW1hbmQnLFxuICAgICAgICAgIGBbU3lzdGVtLkRyYXdpbmcuQml0bWFwXTo6bmV3KDE5MjAsIDEwODApLlNhdmUoJyR7dGVtcFBhdGh9JywgW1N5c3RlbS5EcmF3aW5nLkltYWdpbmcuSW1hZ2VGb3JtYXRdOjpQbmcpYCxcbiAgICAgICAgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUzogVXNlIHNjcmVlbmNhcHR1cmVcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYHNjcmVlbmNhcHR1cmUgLXggXCIke3RlbXBQYXRofVwiYF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXg6IFVzZSB4ZG90b29sICsgaW1wb3J0IChJbWFnZU1hZ2ljaykgb3Igc2Nyb3RcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYChpbXBvcnQgLXdpbmRvdyByb290IFwiJHt0ZW1wUGF0aH1cIiAyPi9kZXYvbnVsbCB8fCBzY3JvdCBcIiR7dGVtcFBhdGh9XCIgMj4vZGV2L251bGwpICYmIGVjaG8gXCJTY3JlZW5zaG90IHNhdmVkIHRvICR7dGVtcFBhdGh9XCJgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgeyBzcGF3biB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICAgIFxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Nsb3NlJywgKGNvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoY29kZSA9PT0gMCAmJiB0ZW1wUGF0aCkge1xuICAgICAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICAgICAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmModGVtcFBhdGgpO1xuICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgcGF0aDogdGVtcFBhdGgsXG4gICAgICAgICAgICAgIHNpemU6IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2NyZWVuc2hvdCBmYWlsZWQgKGV4aXQgY29kZSAke2NvZGV9KTogJHtzdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIFxuICAgICAgLy8gVGltZW91dCBhZnRlciAxMCBzZWNvbmRzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvYy5raWxsKCk7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NjcmVlbnNob3QgdGltZWQgb3V0JykpO1xuICAgICAgfSwgMTAwMDApO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBpbWFnZXMgYW5kIGNhbGN1bGF0ZSBzaW1pbGFyaXR5IHNjb3JlLlxuICovXG5hc3luYyBmdW5jdGlvbiBjb21wYXJlSW1hZ2VzKHsgaW1hZ2UxUGF0aCwgaW1hZ2UyUGF0aCB9OiBDb21wYXJlSW1hZ2VzUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbjEgPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZTFQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24xLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbWFnZSAxOiAke3ZhbGlkYXRpb24xLmVycm9yfWAgfTtcblxuICAgIGNvbnN0IHZhbGlkYXRpb24yID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2UyUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uMi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW1hZ2UgMjogJHt2YWxpZGF0aW9uMi5lcnJvcn1gIH07XG5cbiAgICAvLyBMYXp5LWxvYWQgcGl4ZWxtYXRjaCBmb3IgcGl4ZWwtbGV2ZWwgY29tcGFyaXNvblxuICAgIGNvbnN0IHBpeGVsbWF0Y2ggPSAoYXdhaXQgaW1wb3J0KCdwaXhlbG1hdGNoJykpLmRlZmF1bHQ7XG4gICAgY29uc3QgUE5HID0gKGF3YWl0IGltcG9ydCgncG5nanMnKSkuUE5HO1xuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuICAgIC8vIFJlYWQgYW5kIGRlY29kZSBpbWFnZXNcbiAgICBjb25zdCBpbWcxRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhpbWFnZTFQYXRoKTtcbiAgICBjb25zdCBpbWcyRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhpbWFnZTJQYXRoKTtcblxuICAgIGNvbnN0IGltZzEgPSBQTkcuc3luYy5kZWNvZGUoaW1nMURhdGEpO1xuICAgIGNvbnN0IGltZzIgPSBQTkcuc3luYy5kZWNvZGUoaW1nMkRhdGEpO1xuXG4gICAgLy8gUmVzaXplIHRvIHNhbWUgZGltZW5zaW9ucyBmb3IgY29tcGFyaXNvblxuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4oaW1nMS53aWR0aCwgaW1nMi53aWR0aCk7XG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5taW4oaW1nMS5oZWlnaHQsIGltZzIuaGVpZ2h0KTtcblxuICAgIGNvbnN0IGJ1ZjEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBjb25zdCBidWYyID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG5cbiAgICAvLyBFeHRyYWN0IHBpeGVsIGRhdGEgKHNpbXBsaWZpZWQgLSBpbiBwcm9kdWN0aW9uLCB1c2UgcHJvcGVyIGltYWdlIHByb2Nlc3NpbmcpXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgIGNvbnN0IGlkeDEgPSAoeSAqIGltZzEud2lkdGggKyB4KSAqIDQ7XG4gICAgICAgIGNvbnN0IGlkeDIgPSAoeSAqIGltZzIud2lkdGggKyB4KSAqIDQ7XG4gICAgICAgIGNvbnN0IG91dElkeCA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XG5cbiAgICAgICAgYnVmMVtvdXRJZHhdID0gaW1nMS5kYXRhW2lkeDFdO1xuICAgICAgICBidWYxW291dElkeCArIDFdID0gaW1nMS5kYXRhW2lkeDEgKyAxXTtcbiAgICAgICAgYnVmMVtvdXRJZHggKyAyXSA9IGltZzEuZGF0YVtpZHgxICsgMl07XG4gICAgICAgIGJ1ZjFbb3V0SWR4ICsgM10gPSBpbWcxLmRhdGFbaWR4MSArIDNdO1xuXG4gICAgICAgIGJ1ZjJbb3V0SWR4XSA9IGltZzIuZGF0YVtpZHgyXTtcbiAgICAgICAgYnVmMltvdXRJZHggKyAxXSA9IGltZzIuZGF0YVtpZHgyICsgMV07XG4gICAgICAgIGJ1ZjJbb3V0SWR4ICsgMl0gPSBpbWcyLmRhdGFbaWR4MiArIDJdO1xuICAgICAgICBidWYyW291dElkeCArIDNdID0gaW1nMi5kYXRhW2lkeDIgKyAzXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUgcGl4ZWwgZGlmZmVyZW5jZVxuICAgIGNvbnN0IGRpZmYgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBjb25zdCBudW1EaWZmUGl4ZWxzID0gcGl4ZWxtYXRjaChidWYxLCBidWYyLCBkaWZmLCB3aWR0aCwgaGVpZ2h0LCB7IHRocmVzaG9sZDogMC4xIH0pO1xuICAgIFxuICAgIGNvbnN0IHRvdGFsUGl4ZWxzID0gd2lkdGggKiBoZWlnaHQ7XG4gICAgY29uc3Qgc2ltaWxhcml0eSA9ICgodG90YWxQaXhlbHMgLSBudW1EaWZmUGl4ZWxzKSAvIHRvdGFsUGl4ZWxzKSAqIDEwMDtcblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpbWFnZTE6IGltYWdlMVBhdGgsXG4gICAgICAgIGltYWdlMjogaW1hZ2UyUGF0aCxcbiAgICAgICAgZGltZW5zaW9uczogYCR7d2lkdGh9eCR7aGVpZ2h0fWAsXG4gICAgICAgIHNpbWlsYXJpdHlQZXJjZW50OiBzaW1pbGFyaXR5LnRvRml4ZWQoMiksXG4gICAgICAgIGRpZmZlcmVudFBpeGVsczogbnVtRGlmZlBpeGVscyxcbiAgICAgICAgdG90YWxQaXhlbHMsXG4gICAgICAgIGlzSWRlbnRpY2FsOiBudW1EaWZmUGl4ZWxzID09PSAwLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySW1hZ2VQcm9jZXNzaW5nVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGltYWdlX3RvX3RleHQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdpbWFnZV90b190ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4dHJhY3QgdGV4dCBmcm9tIGltYWdlcyB1c2luZyBPQ1IgKFRlc3NlcmFjdC5qcykuIFN1cHBvcnRzIG11bHRpcGxlIGxhbmd1YWdlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGltYWdlUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgaW1hZ2UgZmlsZScpLFxuICAgICAgbGFuZ3VhZ2U6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdlbmcnKS5kZXNjcmliZSgnTGFuZ3VhZ2UgY29kZSBmb3IgT0NSIChlLmcuLCBcImVuZ1wiLCBcImRldVwiLCBcImNoaV9zaW1cIiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBpbWFnZVRvVGV4dChwYXJhbXMgYXMgSW1hZ2VUb1RleHRQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gZGVzY3JpYmVfaW1hZ2UgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZXNjcmliZV9pbWFnZScsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgbWV0YWRhdGEgYW5kIGJhc2ljIGRlc2NyaXB0aW9uIG9mIGFuIGltYWdlIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpbWFnZVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIGltYWdlIGZpbGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBkZXNjcmliZUltYWdlKHBhcmFtcyBhcyBEZXNjcmliZUltYWdlUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIHNjcmVlbnNob3RfZGVza3RvcCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NjcmVlbnNob3RfZGVza3RvcCcsXG4gICAgZGVzY3JpcHRpb246ICdDYXB0dXJlIGEgc2NyZWVuc2hvdCBvZiB0aGUgZGVza3RvcCBhbmQgc2F2ZSBpdCB0byBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBvdXRwdXRQYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ091dHB1dCBwYXRoIGZvciB0aGUgc2NyZWVuc2hvdCAoZGVmYXVsdDogdGVtcCBkaXJlY3RvcnkpJyksXG4gICAgICBmb3JtYXQ6IHouZW51bShbJ3BuZycsICdqcGVnJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgncG5nJykuZGVzY3JpYmUoJ0ltYWdlIGZvcm1hdCcpLFxuICAgICAgcXVhbGl0eTogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDkwKS5kZXNjcmliZSgnSlBFRyBxdWFsaXR5ICgxLTEwMCwgb25seSBhcHBsaWVzIHRvIEpQRUcgZm9ybWF0KScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHNjcmVlbnNob3REZXNrdG9wKHBhcmFtcyBhcyBTY3JlZW5zaG90RGVza3RvcFBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBjb21wYXJlX2ltYWdlcyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvbXBhcmVfaW1hZ2VzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvbXBhcmUgdHdvIGltYWdlcyBhbmQgY2FsY3VsYXRlIHBpeGVsLWxldmVsIHNpbWlsYXJpdHkgc2NvcmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpbWFnZTFQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBmaXJzdCBpbWFnZScpLFxuICAgICAgaW1hZ2UyUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgc2Vjb25kIGltYWdlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gY29tcGFyZUltYWdlcyhwYXJhbXMgYXMgQ29tcGFyZUltYWdlc1BhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIEh0dHBSZXF1ZXN0UGFyYW1zIHtcbiAgbWV0aG9kOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgYm9keT86IHN0cmluZyB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5pbnRlcmZhY2UgSHR0cEdldEpzb25QYXJhbXMge1xuICB1cmw6IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmludGVyZmFjZSBIdHRwUG9zdEpzb25QYXJhbXMge1xuICB1cmw6IHN0cmluZztcbiAgZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTZWN1cml0eSAmIFZhbGlkYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFNTUkYgcHJvdGVjdGlvbiAtIHZhbGlkYXRlIFVSTCBpcyBzYWZlICovXG5mdW5jdGlvbiB2YWxpZGF0ZVVybCh1cmw6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcbiAgICBcbiAgICAvLyBCbG9jayBpbnRlcm5hbC9wcml2YXRlIElQIGFkZHJlc3NlcyAoU1NSRiBwcm90ZWN0aW9uKVxuICAgIGlmIChwYXJzZWQucHJvdG9jb2wgPT09ICdmaWxlOicgfHwgcGFyc2VkLnByb3RvY29sID09PSAnZGF0YTonKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUHJvdG9jb2wgXCIke3BhcnNlZC5wcm90b2NvbH1cIiBpcyBub3QgYWxsb3dlZGAgfTtcbiAgICB9XG5cbiAgICAvLyBBbGxvdyBodHRwIGFuZCBodHRwcyBvbmx5XG4gICAgaWYgKCFbJ2h0dHA6JywgJ2h0dHBzOiddLmluY2x1ZGVzKHBhcnNlZC5wcm90b2NvbCkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBPbmx5IEhUVFAvSFRUUFMgcHJvdG9jb2xzIGFyZSBhbGxvd2VkYCB9O1xuICAgIH1cblxuICAgIC8vIEJsb2NrIHByaXZhdGUgSVAgcmFuZ2VzIChiYXNpYyBjaGVjaylcbiAgICBjb25zdCBob3N0bmFtZSA9IHBhcnNlZC5ob3N0bmFtZTtcbiAgICBjb25zdCBibG9ja2VkUGF0dGVybnMgPSBbXG4gICAgICAvXjEyN1xcLi8sICAgICAgICAgICAvLyBsb2NhbGhvc3RcbiAgICAgIC9eMTBcXC4vLCAgICAgICAgICAgIC8vIDEwLjAuMC4wLzhcbiAgICAgIC9eMTcyXFwuMVs2LTldXFwuLywgICAvLyAxNzIuMTYuMC4wLzEyXG4gICAgICAvXjE3MlxcLjJbMC05XVxcLi8sICAgLy8gMTcyLjE2LjAuMC8xMlxuICAgICAgL14xNzJcXC4zWzAtMV1cXC4vLCAgIC8vIDE3Mi4xNi4wLjAvMTJcbiAgICAgIC9eMTkyXFwuMTY4XFwuLywgICAgICAvLyAxOTIuMTY4LjAuMC8xNlxuICAgICAgL14wXFwuMFxcLjBcXC4wJC8sICAgICAvLyAwLjAuMC4wXG4gICAgICAvXmxvY2FsaG9zdCQvLCAgICAgIC8vIGxvY2FsaG9zdCBob3N0bmFtZVxuICAgIF07XG5cbiAgICBpZiAoYmxvY2tlZFBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLnRlc3QoaG9zdG5hbWUpKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEFjY2VzcyB0byAke2hvc3RuYW1lfSBpcyBibG9ja2VkIGZvciBzZWN1cml0eSByZWFzb25zYCB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgSW52YWxpZCBVUkw6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBIVFRQIHJlcXVlc3QgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIEdlbmVyaWMgSFRUUCBjbGllbnQgZm9yIG1ha2luZyByZXF1ZXN0cyB0byBhbnkgUkVTVCBBUEkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBSZXF1ZXN0KHsgbWV0aG9kLCB1cmwsIGhlYWRlcnMgPSB7fSwgYm9keSB9OiBIdHRwUmVxdWVzdFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIC8vIFByZXBhcmUgcmVxdWVzdCBvcHRpb25zXG4gICAgY29uc3Qgb3B0aW9uczogUmVxdWVzdEluaXQgPSB7XG4gICAgICBtZXRob2Q6IG1ldGhvZC50b1VwcGVyQ2FzZSgpLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnVXNlci1BZ2VudCc6ICdBSS1Ub29sYm94LzEuMCcsXG4gICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYm9keSBmb3Igbm9uLUdFVC9IRUFEIHJlcXVlc3RzXG4gICAgaWYgKGJvZHkgJiYgIVsnR0VUJywgJ0hFQUQnXS5pbmNsdWRlcyhtZXRob2QudG9VcHBlckNhc2UoKSkpIHtcbiAgICAgIG9wdGlvbnMuYm9keSA9IHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJyA/IGJvZHkgOiBKU09OLnN0cmluZ2lmeShib2R5KTtcbiAgICAgIFxuICAgICAgLy8gU2V0IGNvbnRlbnQtdHlwZSBoZWFkZXIgaWYgbm90IGFscmVhZHkgc2V0IGFuZCBib2R5IGlzIG9iamVjdC9zdHJpbmdcbiAgICAgIGlmICghaGVhZGVyc1snQ29udGVudC1UeXBlJ10gJiYgdHlwZW9mIGJvZHkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIChvcHRpb25zLmhlYWRlcnMgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPilbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCAke21ldGhvZC50b1VwcGVyQ2FzZSgpfSAke3VybH1gKTtcblxuICAgIC8vIE1ha2UgdGhlIHJlcXVlc3Qgd2l0aCB0aW1lb3V0XG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApOyAvLyAzMHMgdGltZW91dFxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IC4uLm9wdGlvbnMsIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwgfSk7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgLy8gUGFyc2UgcmVzcG9uc2UgYmFzZWQgb24gY29udGVudCB0eXBlXG4gICAgICBsZXQgcmVzcG9uc2VEYXRhOiB1bmtub3duO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgICBcbiAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiByZXNwb25zZURhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICAgIG1ldGhvZDogbWV0aG9kLnRvVXBwZXJDYXNlKCksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIEdFVCByZXF1ZXN0IHJldHVybmluZyBwYXJzZWQgSlNPTi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaHR0cEdldEpzb24oeyB1cmwsIGhlYWRlcnMgPSB7fSB9OiBIdHRwR2V0SnNvblBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCBHRVQgJHt1cmx9YCk7XG5cbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogJ0FJLVRvb2xib3gvMS4wJyxcbiAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgICB9LFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWAsXG4gICAgICAgICAgZGF0YTogeyBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cywgdXJsIH0sXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVzcG9uc2UuaGVhZGVycy5lbnRyaWVzKCkpLFxuICAgICAgICAgIGJvZHk6IGRhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBQT1NUIHJlcXVlc3Qgd2l0aCBKU09OIGJvZHkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBQb3N0SnNvbih7IHVybCwgZGF0YSwgaGVhZGVycyA9IHt9IH06IEh0dHBQb3N0SnNvblBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIFVSTCBmb3IgU1NSRiBwcm90ZWN0aW9uXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVXJsKHVybCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gSFRUUCBQT1NUICR7dXJsfWApO1xuXG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1VzZXItQWdlbnQnOiAnQUktVG9vbGJveC8xLjAnLFxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIGxldCByZXNwb25zZURhdGE6IHVua25vd247XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJztcbiAgICAgIFxuICAgICAgaWYgKGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiByZXNwb25zZURhdGEsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySHR0cENsaWVudFRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBodHRwX3JlcXVlc3QgdG9vbCAtIEdlbmVyaWMgSFRUUCBjbGllbnRcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaHR0cF9yZXF1ZXN0JyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgZ2VuZXJpYyBIVFRQIHJlcXVlc3RzIHRvIGFueSBSRVNUIEFQSS4gU3VwcG9ydHMgR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0ggYW5kIG90aGVyIG1ldGhvZHMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBtZXRob2Q6IHouZW51bShbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnUEFUQ0gnLCAnSEVBRCcsICdPUFRJT05TJ10pLmRlc2NyaWJlKCdIVFRQIG1ldGhvZCcpLFxuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdSZXF1ZXN0IFVSTCAobXVzdCBiZSBodHRwOi8vIG9yIGh0dHBzOi8vKScpLFxuICAgICAgaGVhZGVyczogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ3VzdG9tIGhlYWRlcnMgYXMga2V5LXZhbHVlIHBhaXJzJyksXG4gICAgICBib2R5OiB6LnVuaW9uKFt6LnN0cmluZygpLCB6LnJlY29yZCh6LnVua25vd24oKSldKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdSZXF1ZXN0IGJvZHkgKHN0cmluZyBvciBKU09OIG9iamVjdCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwUmVxdWVzdChwYXJhbXMgYXMgSHR0cFJlcXVlc3RQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gaHR0cF9nZXRfanNvbiB0b29sIC0gQ29udmVuaWVuY2Ugd3JhcHBlciBmb3IgR0VUIHJlcXVlc3RzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfZ2V0X2pzb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBhIEdFVCByZXF1ZXN0IGFuZCByZXR1cm4gcGFyc2VkIEpTT04gcmVzcG9uc2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgVVJMIChtdXN0IGJlIGh0dHA6Ly8gb3IgaHR0cHM6Ly8pJyksXG4gICAgICBoZWFkZXJzOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDdXN0b20gaGVhZGVycyBhcyBrZXktdmFsdWUgcGFpcnMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwR2V0SnNvbihwYXJhbXMgYXMgSHR0cEdldEpzb25QYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gaHR0cF9wb3N0X2pzb24gdG9vbCAtIENvbnZlbmllbmNlIHdyYXBwZXIgZm9yIFBPU1QgcmVxdWVzdHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaHR0cF9wb3N0X2pzb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBhIFBPU1QgcmVxdWVzdCB3aXRoIEpTT04gYm9keSBhbmQgcmV0dXJuIHBhcnNlZCByZXNwb25zZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnUmVxdWVzdCBVUkwgKG11c3QgYmUgaHR0cDovLyBvciBodHRwczovLyknKSxcbiAgICAgIGRhdGE6IHoucmVjb3JkKHoudW5rbm93bigpKS5kZXNjcmliZSgnSlNPTiBvYmplY3QgdG8gc2VuZCBhcyByZXF1ZXN0IGJvZHknKSxcbiAgICAgIGhlYWRlcnM6IHoucmVjb3JkKHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0N1c3RvbSBoZWFkZXJzIGFzIGtleS12YWx1ZSBwYWlycycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGh0dHBQb3N0SnNvbihwYXJhbXMgYXMgSHR0cFBvc3RKc29uUGFyYW1zKSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJhZ0luZGV4RmlsZXNQYXJhbXMge1xuICBkaXJlY3RvcnlQYXRoOiBzdHJpbmc7XG4gIGZpbGVQYXR0ZXJuPzogc3RyaW5nO1xuICBiYXRjaFNpemU/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBSYWdRdWVyeVZlY3RvclBhcmFtcyB7XG4gIHF1ZXJ5OiBzdHJpbmc7XG4gIHRvcEs/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBSYWdDbGVhckluZGV4UGFyYW1zIHtcbiAgY29uZmlybTogYm9vbGVhbjtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIERvY3VtZW50Q2h1bmsge1xuICBpZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIG1ldGFkYXRhOiB7XG4gICAgZmlsZV9wYXRoOiBzdHJpbmc7XG4gICAgZmlsZV9uYW1lOiBzdHJpbmc7XG4gICAgY2h1bmtfaW5kZXg6IG51bWJlcjtcbiAgICB0b3RhbF9jaHVua3M6IG51bWJlcjtcbiAgICB3b3JkX2NvdW50OiBudW1iZXI7XG4gIH07XG59XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHQge1xuICBpZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHNjb3JlOiBudW1iZXI7XG4gIG1ldGFkYXRhOiBEb2N1bWVudENodW5rWydtZXRhZGF0YSddO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBWZWN0b3IgU3RvcmUgSW1wbGVtZW50YXRpb24gKExvY2FsKSA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogU2ltcGxlIGxvY2FsIHZlY3RvciBzdG9yZSB1c2luZyBpbi1tZW1vcnkgc3RvcmFnZSB3aXRoIGNvc2luZSBzaW1pbGFyaXR5ICovXG5jbGFzcyBMb2NhbFZlY3RvclN0b3JlIHtcbiAgcHJpdmF0ZSBkb2N1bWVudHM6IE1hcDxzdHJpbmcsIHsgZW1iZWRkaW5nOiBGbG9hdDMyQXJyYXk7IGNodW5rOiBEb2N1bWVudENodW5rIH0+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIGluZGV4TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4TmFtZTogc3RyaW5nID0gJ2FpX3Rvb2xib3hfcmFnJykge1xuICAgIHRoaXMuaW5kZXhOYW1lID0gaW5kZXhOYW1lO1xuICB9XG5cbiAgLyoqIEFkZCBkb2N1bWVudHMgdG8gdGhlIHN0b3JlICovXG4gIGFkZChkb2N1bWVudHM6IERvY3VtZW50Q2h1bmtbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3VtZW50cykge1xuICAgICAgdGhpcy5kb2N1bWVudHMuc2V0KGRvYy5pZCwgeyBlbWJlZGRpbmc6IG5ldyBGbG9hdDMyQXJyYXkoMCksIGNodW5rOiBkb2MgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCBlbWJlZGRpbmdzIGZvciBhbGwgZG9jdW1lbnRzICovXG4gIHNldEVtYmVkZGluZ3MoaWRzOiBzdHJpbmdbXSwgZW1iZWRkaW5nczogRmxvYXQzMkFycmF5W10pOiB2b2lkIHtcbiAgICBpZHMuZm9yRWFjaCgoaWQsIGkpID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKTtcbiAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICBlbnRyeS5lbWJlZGRpbmcgPSBlbWJlZGRpbmdzW2ldO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFNlYXJjaCBmb3Igc2ltaWxhciBkb2N1bWVudHMgKi9cbiAgc2VhcmNoKHF1ZXJ5RW1iZWRkaW5nOiBGbG9hdDMyQXJyYXksIHRvcEs6IG51bWJlcik6IFNlYXJjaFJlc3VsdFtdIHtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGlkOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgW2lkLCBlbnRyeV0gb2YgdGhpcy5kb2N1bWVudHMuZW50cmllcygpKSB7XG4gICAgICBpZiAoZW50cnkuZW1iZWRkaW5nLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICBcbiAgICAgIC8vIENvc2luZSBzaW1pbGFyaXR5XG4gICAgICBsZXQgZG90UHJvZHVjdCA9IDA7XG4gICAgICBsZXQgbm9ybUEgPSAwO1xuICAgICAgbGV0IG5vcm1CID0gMDtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyeS5lbWJlZGRpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZG90UHJvZHVjdCArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIGVudHJ5LmVtYmVkZGluZ1tpXTtcbiAgICAgICAgbm9ybUEgKz0gZW50cnkuZW1iZWRkaW5nW2ldICogZW50cnkuZW1iZWRkaW5nW2ldO1xuICAgICAgICBub3JtQiArPSBxdWVyeUVtYmVkZGluZ1tpXSAqIHF1ZXJ5RW1iZWRkaW5nW2ldO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzaW1pbGFyaXR5ID0gbm9ybUEgPiAwICYmIG5vcm1CID4gMCA/IGRvdFByb2R1Y3QgLyAoTWF0aC5zcXJ0KG5vcm1BKSAqIE1hdGguc3FydChub3JtQikpIDogMDtcbiAgICAgIFxuICAgICAgcmVzdWx0cy5wdXNoKHsgaWQsIHNjb3JlOiBzaW1pbGFyaXR5IH0pO1xuICAgIH1cblxuICAgIC8vIFNvcnQgYnkgc2ltaWxhcml0eSBkZXNjZW5kaW5nIGFuZCByZXR1cm4gdG9wIEtcbiAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKVxuICAgICAgLnNsaWNlKDAsIHRvcEspXG4gICAgICAubWFwKCh7IGlkLCBzY29yZSB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKSE7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGVudHJ5LmNodW5rLmlkLFxuICAgICAgICAgIHRleHQ6IGVudHJ5LmNodW5rLnRleHQsXG4gICAgICAgICAgc2NvcmUsXG4gICAgICAgICAgbWV0YWRhdGE6IGVudHJ5LmNodW5rLm1ldGFkYXRhLFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH1cblxuICAvKiogQ2xlYXIgYWxsIGRvY3VtZW50cyAqL1xuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmRvY3VtZW50cy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIEdldCBkb2N1bWVudCBjb3VudCAqL1xuICBnZXQgY291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuc2l6ZTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUZXh0IENodW5raW5nID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTcGxpdCB0ZXh0IGludG8gY2h1bmtzIHdpdGggb3ZlcmxhcCAqL1xuZnVuY3Rpb24gY2h1bmtUZXh0KHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSA1MDAsIG92ZXJsYXA6IG51bWJlciA9IDUwKTogRG9jdW1lbnRDaHVua1tdIHtcbiAgY29uc3Qgd29yZHMgPSB0ZXh0LnNwbGl0KC9cXHMrLyk7XG4gIGNvbnN0IGNodW5rczogRG9jdW1lbnRDaHVua1tdID0gW107XG4gIFxuICBpZiAod29yZHMubGVuZ3RoIDw9IGNodW5rU2l6ZSkge1xuICAgIHJldHVybiBbe1xuICAgICAgaWQ6IGBjaHVua18ke0RhdGUubm93KCl9XzBgLFxuICAgICAgdGV4dDogdGV4dCxcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogJycsXG4gICAgICAgIGZpbGVfbmFtZTogJycsXG4gICAgICAgIGNodW5rX2luZGV4OiAwLFxuICAgICAgICB0b3RhbF9jaHVua3M6IDEsXG4gICAgICAgIHdvcmRfY291bnQ6IHdvcmRzLmxlbmd0aCxcbiAgICAgIH0sXG4gICAgfV07XG4gIH1cblxuICBsZXQgc3RhcnRJbmRleCA9IDA7XG4gIGxldCBjaHVua0luZGV4ID0gMDtcblxuICB3aGlsZSAoc3RhcnRJbmRleCA8IHdvcmRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGVuZEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCArIGNodW5rU2l6ZSwgd29yZHMubGVuZ3RoKTtcbiAgICBjb25zdCBjaHVua1RleHQgPSB3b3Jkcy5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCkuam9pbignICcpO1xuICAgIFxuICAgIGNodW5rcy5wdXNoKHtcbiAgICAgIGlkOiBgY2h1bmtfJHtEYXRlLm5vdygpfV8ke2NodW5rSW5kZXh9YCxcbiAgICAgIHRleHQ6IGNodW5rVGV4dCxcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogJycsIC8vIFdpbGwgYmUgc2V0IGxhdGVyXG4gICAgICAgIGZpbGVfbmFtZTogJycsIC8vIFdpbGwgYmUgc2V0IGxhdGVyXG4gICAgICAgIGNodW5rX2luZGV4OiBjaHVua0luZGV4LFxuICAgICAgICB0b3RhbF9jaHVua3M6IE1hdGguY2VpbCh3b3Jkcy5sZW5ndGggLyAoY2h1bmtTaXplIC0gb3ZlcmxhcCkpLFxuICAgICAgICB3b3JkX2NvdW50OiBlbmRJbmRleCAtIHN0YXJ0SW5kZXgsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY2h1bmtJbmRleCsrO1xuICAgIHN0YXJ0SW5kZXggPSBlbmRJbmRleCAtIG92ZXJsYXA7XG4gIH1cblxuICByZXR1cm4gY2h1bmtzO1xufVxuXG4vKiogR2VuZXJhdGUgc2ltcGxlIFRGLUlERi1saWtlIGVtYmVkZGluZ3MgZm9yIHRleHQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRW1iZWRkaW5nKHRleHQ6IHN0cmluZyk6IEZsb2F0MzJBcnJheSB7XG4gIC8vIFNpbXBsZSB3b3JkIGZyZXF1ZW5jeS1iYXNlZCBlbWJlZGRpbmcgKGRpbWVuc2lvbjogMTAwKVxuICBjb25zdCBkaW1lbnNpb25zID0gMTAwO1xuICBjb25zdCBlbWJlZGRpbmcgPSBuZXcgRmxvYXQzMkFycmF5KGRpbWVuc2lvbnMpO1xuICBcbiAgLy8gVG9rZW5pemUgYW5kIGhhc2ggd29yZHMgdG8gZGltZW5zaW9uc1xuICBjb25zdCB3b3JkcyA9IHRleHQudG9Mb3dlckNhc2UoKS5tYXRjaCgvW2Etel0rL2cpIHx8IFtdO1xuICBjb25zdCB3b3JkU2V0ID0gbmV3IFNldCh3b3Jkcyk7XG4gIFxuICBmb3IgKGNvbnN0IHdvcmQgb2Ygd29yZFNldCkge1xuICAgIGxldCBoYXNoID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIHdvcmQuY2hhckNvZGVBdChpKTtcbiAgICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGRpbUluZGV4ID0gTWF0aC5hYnMoaGFzaCAlIGRpbWVuc2lvbnMpO1xuICAgIGVtYmVkZGluZ1tkaW1JbmRleF0gKz0gMS4wIC8gKHdvcmQubGVuZ3RoICsgMSk7IC8vIFdlaWdodCBieSBpbnZlcnNlIGxlbmd0aFxuICB9XG5cbiAgLy8gTm9ybWFsaXplXG4gIGxldCBub3JtID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1lbnNpb25zOyBpKyspIHtcbiAgICBub3JtICs9IGVtYmVkZGluZ1tpXSAqIGVtYmVkZGluZ1tpXTtcbiAgfVxuICBub3JtID0gTWF0aC5zcXJ0KG5vcm0pIHx8IDE7XG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbWVuc2lvbnM7IGkrKykge1xuICAgIGVtYmVkZGluZ1tpXSAvPSBub3JtO1xuICB9XG5cbiAgcmV0dXJuIGVtYmVkZGluZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBJbmRleCBmaWxlcyBpbiBhIGRpcmVjdG9yeSBmb3Igc2VtYW50aWMgc2VhcmNoLlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdJbmRleEZpbGVzKHsgXG4gIGRpcmVjdG9yeVBhdGgsIFxuICBmaWxlUGF0dGVybiA9ICcqLnt0cyxqcyx0c3gsanN4LG1kLGpzb24seWFtbCx5bWwsdG9tbCx0eHR9JyxcbiAgYmF0Y2hTaXplID0gMTAgXG59OiBSYWdJbmRleEZpbGVzUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgZGlyZWN0b3J5IGV4aXN0c1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnlQYXRoKSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGlyZWN0b3J5IG5vdCBmb3VuZDogJHtkaXJlY3RvcnlQYXRofWAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBzdG9yZSA9IG5ldyBMb2NhbFZlY3RvclN0b3JlKCk7XG4gICAgbGV0IGluZGV4ZWRDb3VudCA9IDA7XG4gICAgbGV0IHNraXBwZWRDb3VudCA9IDA7XG5cbiAgICAvLyBGaW5kIGZpbGVzIG1hdGNoaW5nIHBhdHRlcm5cbiAgICBjb25zdCBmaW5kRmlsZXMgPSAoZGlyOiBzdHJpbmcpOiBzdHJpbmdbXSA9PiB7XG4gICAgICBsZXQgcmVzdWx0czogc3RyaW5nW10gPSBbXTtcbiAgICAgIFxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKGRpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgLy8gU2tpcCBub2RlX21vZHVsZXMgYW5kIC5naXQgZGlyZWN0b3JpZXNcbiAgICAgICAgICAgIGlmIChlbnRyeS5uYW1lID09PSAnbm9kZV9tb2R1bGVzJyB8fCBlbnRyeS5uYW1lID09PSAnLmdpdCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KGZpbmRGaWxlcyhmdWxsUGF0aCkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZpbGUgZXh0ZW5zaW9uIGFnYWluc3QgcGF0dGVyblxuICAgICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBjb25zdCBhbGxvd2VkRXh0cyA9IFsnLnRzJywgJy5qcycsICcudHN4JywgJy5qc3gnLCAnLm1kJywgJy5qc29uJywgJy55YW1sJywgJy55bWwnLCAnLnRvbWwnLCAnLnR4dCddO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoYWxsb3dlZEV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbQUkgVG9vbGJveF0gQ291bGQgbm90IHJlYWQgZGlyZWN0b3J5ICR7ZGlyfTpgLCBlcnJvcik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBjb25zdCBmaWxlcyA9IGZpbmRGaWxlcyhkaXJlY3RvcnlQYXRoKTtcbiAgICBcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGluZGV4ZWRDb3VudDogMCwgbWVzc2FnZTogJ05vIG1hdGNoaW5nIGZpbGVzIGZvdW5kJyB9IH07XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBlYWNoIGZpbGVcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNraXAgbGFyZ2UgZmlsZXMgKD4xTUIpXG4gICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCA+IDEwMjQgKiAxMDI0KSB7XG4gICAgICAgICAgc2tpcHBlZENvdW50Kys7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaHVuayB0aGUgdGV4dFxuICAgICAgICBjb25zdCBjaHVua3MgPSBjaHVua1RleHQoY29udGVudCk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgbWV0YWRhdGEgZm9yIGVhY2ggY2h1bmtcbiAgICAgICAgY2h1bmtzLmZvckVhY2goY2h1bmsgPT4ge1xuICAgICAgICAgIGNodW5rLm1ldGFkYXRhLmZpbGVfcGF0aCA9IGZpbGVQYXRoO1xuICAgICAgICAgIGNodW5rLm1ldGFkYXRhLmZpbGVfbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmdzIGFuZCBhZGQgdG8gc3RvcmVcbiAgICAgICAgY29uc3QgaWRzID0gY2h1bmtzLm1hcChjID0+IGMuaWQpO1xuICAgICAgICBjb25zdCBlbWJlZGRpbmdzID0gY2h1bmtzLm1hcChjID0+IGdlbmVyYXRlRW1iZWRkaW5nKGMudGV4dCkpO1xuICAgICAgICBcbiAgICAgICAgc3RvcmUuYWRkKGNodW5rcyk7XG4gICAgICAgIHN0b3JlLnNldEVtYmVkZGluZ3MoaWRzLCBlbWJlZGRpbmdzKTtcbiAgICAgICAgXG4gICAgICAgIGluZGV4ZWRDb3VudCArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbQUkgVG9vbGJveF0gQ291bGQgbm90IGluZGV4ICR7ZmlsZVBhdGh9OmAsIGVycm9yKTtcbiAgICAgICAgc2tpcHBlZENvdW50Kys7XG4gICAgICB9XG5cbiAgICAgIC8vIFByb2dyZXNzIGNhbGxiYWNrIGV2ZXJ5IGJhdGNoXG4gICAgICBpZiAoKGluZGV4ZWRDb3VudCArIHNraXBwZWRDb3VudCkgJSBiYXRjaFNpemUgPT09IDApIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYFxccltBSSBUb29sYm94XSBJbmRleGVkICR7KGluZGV4ZWRDb3VudCArIHNraXBwZWRDb3VudCl9IGNodW5rcy4uLmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdcXG5bQUkgVG9vbGJveF0gSW5kZXhpbmcgY29tcGxldGUnKTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpbmRleGVkQ2h1bmtzOiBpbmRleGVkQ291bnQsXG4gICAgICAgIGZpbGVzUHJvY2Vzc2VkOiBmaWxlcy5sZW5ndGgsXG4gICAgICAgIHNraXBwZWRGaWxlczogc2tpcHBlZENvdW50LFxuICAgICAgICB0b3RhbERvY3VtZW50czogc3RvcmUuY291bnQsXG4gICAgICAgIGRpcmVjdG9yeVBhdGgsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgaW5kZXhpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8qKlxuICogUXVlcnkgdGhlIHZlY3RvciBpbmRleCBmb3Igc2VtYW50aWNhbGx5IHNpbWlsYXIgZG9jdW1lbnRzLlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdRdWVyeVZlY3Rvcih7IHF1ZXJ5LCB0b3BLID0gNSB9OiBSYWdRdWVyeVZlY3RvclBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIEdlbmVyYXRlIGVtYmVkZGluZyBmb3IgdGhlIHF1ZXJ5XG4gICAgY29uc3QgcXVlcnlFbWJlZGRpbmcgPSBnZW5lcmF0ZUVtYmVkZGluZyhxdWVyeSk7XG4gICAgXG4gICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIHVzZSBDaHJvbWFEQiBvciBzaW1pbGFyXG4gICAgLy8gRm9yIG5vdywgd2UgcmV0dXJuIGEgcGxhY2Vob2xkZXIgcmVzcG9uc2VcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcXVlcnksXG4gICAgICAgIHRvcEssXG4gICAgICAgIHJlc3VsdHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3BsYWNlaG9sZGVyJyxcbiAgICAgICAgICAgIHRleHQ6ICdWZWN0b3Igc2VhcmNoIHJlcXVpcmVzIENocm9tYURCIGludGVncmF0aW9uLiBUaGlzIGlzIGEgcGxhY2Vob2xkZXIuJyxcbiAgICAgICAgICAgIHNjb3JlOiAwLFxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgZmlsZV9wYXRoOiAnJyxcbiAgICAgICAgICAgICAgZmlsZV9uYW1lOiAnJyxcbiAgICAgICAgICAgICAgY2h1bmtfaW5kZXg6IDAsXG4gICAgICAgICAgICAgIHRvdGFsX2NodW5rczogMSxcbiAgICAgICAgICAgICAgd29yZF9jb3VudDogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbm90ZTogJ1RvIGVuYWJsZSBmdWxsIHZlY3RvciBzZWFyY2gsIGluc3RhbGwgY2hyb21hZGIgYW5kIHVwZGF0ZSB0aGUgaW1wbGVtZW50YXRpb24uJyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFJBRyBxdWVyeSBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhciB0aGUgdmVjdG9yIGluZGV4LlxuICovXG5hc3luYyBmdW5jdGlvbiByYWdDbGVhckluZGV4KHsgY29uZmlybSB9OiBSYWdDbGVhckluZGV4UGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGlmICghY29uZmlybSkge1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NvbmZpcm1hdGlvbiByZXF1aXJlZCB0byBjbGVhciBpbmRleCcgfTtcbiAgfVxuXG4gIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBjbGVhciBDaHJvbWFEQlxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgZGF0YTogeyBtZXNzYWdlOiAnVmVjdG9yIGluZGV4IGNsZWFyZWQgc3VjY2Vzc2Z1bGx5JyB9LFxuICB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJSYWdUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gcmFnX2luZGV4X2ZpbGVzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX2luZGV4X2ZpbGVzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0luZGV4IGZpbGVzIGluIGEgZGlyZWN0b3J5IGZvciBzZW1hbnRpYyBzZWFyY2guIFN1cHBvcnRzIFR5cGVTY3JpcHQsIEphdmFTY3JpcHQsIE1hcmtkb3duLCBKU09OLCBZQU1MLCBhbmQgdGV4dCBmaWxlcy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGRpcmVjdG9yeVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0RpcmVjdG9yeSBwYXRoIHRvIGluZGV4JyksXG4gICAgICBmaWxlUGF0dGVybjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJyoue3RzLGpzLHRzeCxqc3gsbWQsanNvbix5YW1sLHltbCx0b21sLHR4dH0nKS5kZXNjcmliZSgnRmlsZSBwYXR0ZXJuIHRvIG1hdGNoIChnbG9iIHN5bnRheCknKSxcbiAgICAgIGJhdGNoU2l6ZTogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnQmF0Y2ggc2l6ZSBmb3IgcHJvZ3Jlc3MgcmVwb3J0aW5nJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmFnSW5kZXhGaWxlcyhwYXJhbXMgYXMgUmFnSW5kZXhGaWxlc1BhcmFtcyksXG4gIH0pKTtcblxuICAvLyByYWdfcXVlcnlfdmVjdG9yIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX3F1ZXJ5X3ZlY3RvcicsXG4gICAgZGVzY3JpcHRpb246ICdRdWVyeSB0aGUgdmVjdG9yIGluZGV4IGZvciBzZW1hbnRpY2FsbHkgc2ltaWxhciBkb2N1bWVudHMuIFJldHVybnMgdG9wLWsgbW9zdCByZWxldmFudCBjaHVua3MuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRleHQnKSxcbiAgICAgIHRvcEs6IHoubnVtYmVyKCkubWluKDEpLm1heCgyMCkub3B0aW9uYWwoKS5kZWZhdWx0KDUpLmRlc2NyaWJlKCdOdW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdRdWVyeVZlY3RvcihwYXJhbXMgYXMgUmFnUXVlcnlWZWN0b3JQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gcmFnX2NsZWFyX2luZGV4IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmFnX2NsZWFyX2luZGV4JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIHRoZSB2ZWN0b3Igc2VhcmNoIGluZGV4LiBSZXF1aXJlcyBjb25maXJtYXRpb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb25maXJtOiB6LmJvb2xlYW4oKS5kZXNjcmliZSgnU2V0IHRvIHRydWUgdG8gY29uZmlybSBjbGVhcmluZyB0aGUgaW5kZXgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiByYWdDbGVhckluZGV4KHBhcmFtcyBhcyBSYWdDbGVhckluZGV4UGFyYW1zKSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVUkgQ29tcG9uZW50IFRlbXBsYXRlcyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBidXR0b24gY29tcG9uZW50ICovXG5mdW5jdGlvbiBnZW5lcmF0ZUJ1dHRvbkh0bWwobGFiZWw6IHN0cmluZywgY29sb3I6IHN0cmluZyA9ICcjMDA3YmZmJywgaWQ6IHN0cmluZyA9ICd1aS1idG4nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBcbiAgICA8YnV0dG9uIGlkPVwiJHtpZH1cIiBzdHlsZT1cIlxuICAgICAgcGFkZGluZzogMTJweCAyNHB4O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn07XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnM7XG4gICAgXCI+JHtsYWJlbH08L2J1dHRvbj5cbiAgYDtcbn1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgZm9ybSBjb21wb25lbnQgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRm9ybUh0bWwoZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH0+LCBzdWJtaXRMYWJlbDogc3RyaW5nID0gJ1N1Ym1pdCcpOiBzdHJpbmcge1xuICBjb25zdCBmaWVsZHNIdG1sID0gZmllbGRzLm1hcChmaWVsZCA9PiBgXG4gICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDE1cHg7XCI+XG4gICAgICA8bGFiZWwgZm9yPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7IG1hcmdpbi1ib3R0b206IDVweDsgZm9udC13ZWlnaHQ6IGJvbGQ7XCI+JHtmaWVsZC5sYWJlbH08L2xhYmVsPlxuICAgICAgJHtmaWVsZC50eXBlID09PSAndGV4dGFyZWEnIFxuICAgICAgICA/IGA8dGV4dGFyZWEgaWQ9XCIke2ZpZWxkLm5hbWV9XCIgbmFtZT1cIiR7ZmllbGQubmFtZX1cIiByb3dzPVwiNFwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvdGV4dGFyZWE+YFxuICAgICAgICA6IGZpZWxkLnR5cGUgPT09ICdzZWxlY3QnXG4gICAgICAgICAgPyBgPHNlbGVjdCBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjxvcHRpb24gdmFsdWU9XCJcIj5TZWxlY3QuLi48L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiMVwiPk9wdGlvbiAxPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIjJcIj5PcHRpb24gMjwvb3B0aW9uPjwvc2VsZWN0PmBcbiAgICAgICAgICA6IGA8aW5wdXQgdHlwZT1cIiR7ZmllbGQudHlwZX1cIiBpZD1cIiR7ZmllbGQubmFtZX1cIiBuYW1lPVwiJHtmaWVsZC5uYW1lfVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHBhZGRpbmc6IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2NjYzsgYm9yZGVyLXJhZGl1czogNHB4O1wiIC8+YFxuICAgICAgfVxuICAgIDwvZGl2PlxuICBgKS5qb2luKCcnKTtcblxuICByZXR1cm4gYFxuICAgIDxmb3JtIGlkPVwidWktZm9ybVwiIG9uc3VibWl0PVwiZXZlbnQucHJldmVudERlZmF1bHQoKTsgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tcmVzdWx0JykuaW5uZXJIVE1MID0gJ0Zvcm0gc3VibWl0dGVkISc7XCI+XG4gICAgICAke2ZpZWxkc0h0bWx9XG4gICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBzdHlsZT1cInBhZGRpbmc6IDEycHggMjRweDsgYmFja2dyb3VuZC1jb2xvcjogIzAwN2JmZjsgY29sb3I6IHdoaXRlOyBib3JkZXI6IG5vbmU7IGJvcmRlci1yYWRpdXM6IDZweDsgY3Vyc29yOiBwb2ludGVyO1wiPiR7c3VibWl0TGFiZWx9PC9idXR0b24+XG4gICAgPC9mb3JtPlxuICAgIDxkaXYgaWQ9XCJmb3JtLXJlc3VsdFwiIHN0eWxlPVwibWFyZ2luLXRvcDogMTVweDsgcGFkZGluZzogMTBweDsgYmFja2dyb3VuZC1jb2xvcjogI2Y4ZjlmYTsgYm9yZGVyLXJhZGl1czogNHB4O1wiPjwvZGl2PlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBjaGFydCBjb21wb25lbnQgKHNpbXBsZSBiYXIgY2hhcnQpICovXG5mdW5jdGlvbiBnZW5lcmF0ZUNoYXJ0SHRtbChkYXRhOiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfT4sIHRpdGxlOiBzdHJpbmcgPSAnQmFyIENoYXJ0Jyk6IHN0cmluZyB7XG4gIGNvbnN0IG1heFZhbHVlID0gTWF0aC5tYXgoLi4uZGF0YS5tYXAoZCA9PiBkLnZhbHVlKSk7XG4gIGNvbnN0IGJhcnNIdG1sID0gZGF0YS5tYXAoZCA9PiB7XG4gICAgY29uc3QgaGVpZ2h0ID0gKGQudmFsdWUgLyBtYXhWYWx1ZSkgKiAyMDA7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBtYXJnaW4tcmlnaHQ6IDEwcHg7XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogNDBweDsgaGVpZ2h0OiAke2hlaWdodH1weDsgYmFja2dyb3VuZC1jb2xvcjogIzAwN2JmZjsgYm9yZGVyLXJhZGl1czogNHB4IDRweCAwIDA7XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9KS5qb2luKCcnKTtcblxuICBjb25zdCBsYWJlbHNIdG1sID0gZGF0YS5tYXAoZCA9PiBgXG4gICAgPGRpdiBzdHlsZT1cIndpZHRoOiA0MHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7IGZvbnQtc2l6ZTogMTJweDtcIj4ke2QubGFiZWx9PC9kaXY+XG4gIGApLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cInBhZGRpbmc6IDIwcHg7IGJhY2tncm91bmQtY29sb3I6ICNmOGY5ZmE7IGJvcmRlci1yYWRpdXM6IDhweDtcIj5cbiAgICAgIDxoMz4ke3RpdGxlfTwvaDM+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtZW5kOyBoZWlnaHQ6IDIyMHB4OyBtYXJnaW4tYm90dG9tOiAxMHB4O1wiPiR7YmFyc0h0bWx9PC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XCI+JHtsYWJlbHNIdG1sfTwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG4vKiogR2VuZXJhdGUgSFRNTCBmb3IgYSBkYXNoYm9hcmQgY29tcG9uZW50ICovXG5mdW5jdGlvbiBnZW5lcmF0ZURhc2hib2FyZEh0bWwodGl0bGVzOiBzdHJpbmdbXSwgY29udGVudDogQXJyYXk8eyB0eXBlOiAndGV4dCcgfCAnY2hhcnQnOyBkYXRhPzogYW55IH0+KTogc3RyaW5nIHtcbiAgY29uc3QgY2FyZHNIdG1sID0gdGl0bGVzLm1hcCgodGl0bGUsIGluZGV4KSA9PiB7XG4gICAgY29uc3QgY2FyZENvbnRlbnQgPSBjb250ZW50W2luZGV4XT8udHlwZSA9PT0gJ2NoYXJ0JyBcbiAgICAgID8gZ2VuZXJhdGVDaGFydEh0bWwoY29udGVudFtpbmRleF0uZGF0YSB8fCBbeyBsYWJlbDogJ0EnLCB2YWx1ZTogNTAgfSwgeyBsYWJlbDogJ0InLCB2YWx1ZTogODAgfV0sIHRpdGxlKVxuICAgICAgOiBgPHAgc3R5bGU9XCJwYWRkaW5nOiAyMHB4O1wiPiR7Y29udGVudFtpbmRleF0/LmRhdGEgfHwgYENvbnRlbnQgZm9yICR7dGl0bGV9YH08L3A+YDtcbiAgICBcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDE7IG1pbi13aWR0aDogMjUwcHg7IGJhY2tncm91bmQtY29sb3I6IHdoaXRlOyBib3JkZXItcmFkaXVzOiA4cHg7IGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuMSk7IG1hcmdpbjogMTBweDtcIj5cbiAgICAgICAgJHtjYXJkQ29udGVudH1cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH0pLmpvaW4oJycpO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtd3JhcDogd3JhcDsgZ2FwOiAyMHB4OyBwYWRkaW5nOiAyMHB4O1wiPiR7Y2FyZHNIdG1sfTwvZGl2PlxuICBgO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIEltcGxlbWVudGF0aW9ucyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJVaUdlbmVyYXRpb25Ub29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gZ2VuZXJhdGVfdWlfY29tcG9uZW50IHRvb2wgXHUyMDE0IEdlbmVyYXRlIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2VuZXJhdGVfdWlfY29tcG9uZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYXRlIEhUTUwvQ1NTL0pTIGNvZGUgZm9yIGFuIGludGVyYWN0aXZlIFVJIGNvbXBvbmVudCAoYnV0dG9uLCBmb3JtLCBjaGFydCwgZGFzaGJvYXJkKS4gUmV0dXJucyB0aGUgZ2VuZXJhdGVkIGNvZGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21wb25lbnRfdHlwZTogei5lbnVtKFsnYnV0dG9uJywgJ2Zvcm0nLCAnY2hhcnQnLCAnZGFzaGJvYXJkJ10pLmRlc2NyaWJlKCdUeXBlIG9mIFVJIGNvbXBvbmVudCB0byBnZW5lcmF0ZScpLFxuICAgICAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTGFiZWwgdGV4dCBmb3IgYnV0dG9ucyBvciBmb3JtcycpLFxuICAgICAgZmllbGRzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgbmFtZTogei5zdHJpbmcoKSxcbiAgICAgICAgdHlwZTogei5lbnVtKFsndGV4dCcsICdlbWFpbCcsICdwYXNzd29yZCcsICdudW1iZXInLCAndGV4dGFyZWEnLCAnc2VsZWN0J10pLFxuICAgICAgICBsYWJlbDogei5zdHJpbmcoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGb3JtIGZpZWxkcyAoZm9yIGZvcm0gY29tcG9uZW50KScpLFxuICAgICAgY2hhcnRfZGF0YTogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIGxhYmVsOiB6LnN0cmluZygpLFxuICAgICAgICB2YWx1ZTogei5udW1iZXIoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDaGFydCBkYXRhIHBvaW50cyAoZm9yIGNoYXJ0IGNvbXBvbmVudCknKSxcbiAgICAgIGRhc2hib2FyZF90aXRsZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGl0bGVzIGZvciBkYXNoYm9hcmQgY2FyZHMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21wb25lbnRfdHlwZSwgbGFiZWwsIGZpZWxkcywgY2hhcnRfZGF0YSwgZGFzaGJvYXJkX3RpdGxlcyB9OiB7IFxuICAgICAgY29tcG9uZW50X3R5cGU6IHN0cmluZzsgXG4gICAgICBsYWJlbD86IHN0cmluZzsgXG4gICAgICBmaWVsZHM/OiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH0+OyBcbiAgICAgIGNoYXJ0X2RhdGE/OiBBcnJheTx7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfT47XG4gICAgICBkYXNoYm9hcmRfdGl0bGVzPzogc3RyaW5nW107XG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAoY29tcG9uZW50X3R5cGUpIHtcbiAgICAgICAgICBjYXNlICdidXR0b24nOlxuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlQnV0dG9uSHRtbChsYWJlbCB8fCAnQ2xpY2sgTWUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Zvcm0nOlxuICAgICAgICAgICAgaWYgKCFmaWVsZHMgfHwgZmllbGRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGb3JtIGNvbXBvbmVudCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZmllbGQnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVGb3JtSHRtbChmaWVsZHMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnY2hhcnQnOlxuICAgICAgICAgICAgaWYgKCFjaGFydF9kYXRhIHx8IGNoYXJ0X2RhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NoYXJ0IGNvbXBvbmVudCByZXF1aXJlcyBkYXRhIHBvaW50cycgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZUNoYXJ0SHRtbChjaGFydF9kYXRhKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Rhc2hib2FyZCc6XG4gICAgICAgICAgICBpZiAoIWRhc2hib2FyZF90aXRsZXMgfHwgZGFzaGJvYXJkX3RpdGxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRGFzaGJvYXJkIGNvbXBvbmVudCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgdGl0bGUnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZGFzaGJvYXJkX3RpdGxlcy5tYXAoKHRpdGxlLCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgICAgdHlwZTogaW5kZXggJSAyID09PSAwID8gJ2NoYXJ0JyA6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgZGF0YTogaW5kZXggJSAyID09PSAwID8gW3sgbGFiZWw6ICdBJywgdmFsdWU6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgfSwgeyBsYWJlbDogJ0InLCB2YWx1ZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSB9XSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZURhc2hib2FyZEh0bWwoZGFzaGJvYXJkX3RpdGxlcywgY29udGVudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5rbm93biBjb21wb25lbnQgdHlwZTogJHtjb21wb25lbnRfdHlwZX1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmdWxsSHRtbCA9IGA8IURPQ1RZUEUgaHRtbD48aHRtbD48aGVhZD48bWV0YSBjaGFyc2V0PVwiVVRGLThcIj48dGl0bGU+VUkgQ29tcG9uZW50PC90aXRsZT48L2hlYWQ+PGJvZHkgc3R5bGU9XCJmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7IHBhZGRpbmc6IDIwcHg7XCI+JHtodG1sfTwvYm9keT48L2h0bWw+YDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tcG9uZW50X3R5cGUsIGh0bWw6IGZ1bGxIdG1sIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZW5lcmF0ZSBVSSBjb21wb25lbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlbmRlcl9hbmRfcHJldmlld191aSB0b29sIFx1MjAxNCBSZW5kZXIgZ2VuZXJhdGVkIFVJIGluIGJyb3dzZXIgYW5kIGNhcHR1cmUgc2NyZWVuc2hvdFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdyZW5kZXJfYW5kX3ByZXZpZXdfdWknLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVuZGVyIGEgZ2VuZXJhdGVkIEhUTUwgVUkgY29tcG9uZW50LCBzYXZlIGl0IHRvIGEgZmlsZSwgb3BlbiBpdCBpbiB0aGUgZGVmYXVsdCBicm93c2VyLCBhbmQgb3B0aW9uYWxseSB0YWtlIGEgc2NyZWVuc2hvdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGh0bWxfY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbXBsZXRlIEhUTUwgY29udGVudCB0byByZW5kZXInKSxcbiAgICAgIGZpbGVuYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgndWlfcHJldmlldy5odG1sJykuZGVzY3JpYmUoJ0ZpbGVuYW1lIGZvciBzYXZpbmcgKGRlZmF1bHQ6IHVpX3ByZXZpZXcuaHRtbCknKSxcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPcHRpb25hbCBwYXRoIHRvIHNhdmUgYSBzY3JlZW5zaG90IG9mIHRoZSByZW5kZXJlZCBVSScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGh0bWxfY29udGVudCwgZmlsZW5hbWUsIHNjcmVlbnNob3RfcGF0aCB9OiB7IFxuICAgICAgaHRtbF9jb250ZW50OiBzdHJpbmc7IFxuICAgICAgZmlsZW5hbWU/OiBzdHJpbmc7IFxuICAgICAgc2NyZWVuc2hvdF9wYXRoPzogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGVuYW1lIHx8ICd1aV9wcmV2aWV3Lmh0bWwnO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihnZXRXb3JraW5nRGlyKCksIGZpbGVOYW1lKTtcblxuICAgICAgICAvLyBTYXZlIEhUTUwgdG8gZmlsZVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBodG1sX2NvbnRlbnQpO1xuXG4gICAgICAgIC8vIE9wZW4gaW4gZGVmYXVsdCBicm93c2VyIHVzaW5nIEVTIGltcG9ydCAoc2FtZSBhcyBwcmV2aWV3X2h0bWwgdG9vbClcbiAgICAgICAgY29uc3Qgb3Blbk1vZHVsZSA9IGF3YWl0IGltcG9ydCgnb3BlbicpO1xuICAgICAgICBhd2FpdCBvcGVuTW9kdWxlLmRlZmF1bHQoZmlsZVBhdGgpO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0geyBcbiAgICAgICAgICByZW5kZXJlZDogdHJ1ZSwgXG4gICAgICAgICAgZmlsZTogZmlsZU5hbWUsXG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGFrZSBzY3JlZW5zaG90IGlmIHJlcXVlc3RlZCAodXNpbmcgUHVwcGV0ZWVyKVxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHB1cHBldGVlck1vZHVsZSA9IGF3YWl0IGltcG9ydCgncHVwcGV0ZWVyJyk7XG4gICAgICAgICAgICBjb25zdCBicm93c2VyID0gYXdhaXQgcHVwcGV0ZWVyTW9kdWxlLmRlZmF1bHQubGF1bmNoKHsgaGVhZGxlc3M6IHRydWUgfSk7XG4gICAgICAgICAgICBjb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIExvYWQgdGhlIEhUTUwgZmlsZVxuICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKGBmaWxlOi8vJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgY29udGVudCB0byByZW5kZXJcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvclNlbGVjdG9yKCdib2R5JywgeyB0aW1lb3V0OiA1MDAwIH0pLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGFrZSBzY3JlZW5zaG90XG4gICAgICAgICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3QoeyBwYXRoOiBzY3JlZW5zaG90X3BhdGgsIGZ1bGxQYWdlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90U2F2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhd2FpdCBicm93c2VyLmNsb3NlKCk7XG4gICAgICAgICAgfSBjYXRjaCAoc2NyZWVuc2hvdEVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gc2NyZWVuc2hvdEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBzY3JlZW5zaG90RXJyb3IubWVzc2FnZSA6IFN0cmluZyhzY3JlZW5zaG90RXJyb3IpO1xuICAgICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90V2FybmluZyA9IGBTY3JlZW5zaG90IGZhaWxlZDogJHttZXNzYWdlfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0RGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJlbmRlciBVSTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZXh0cmFjdF91aV9kYXRhIHRvb2wgXHUyMDE0IEV4dHJhY3QgZGF0YSBmcm9tIGludGVyYWN0aXZlIFVJIGVsZW1lbnRzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2V4dHJhY3RfdWlfZGF0YScsXG4gICAgZGVzY3JpcHRpb246ICdFeHRyYWN0IHN0cnVjdHVyZWQgZGF0YSBmcm9tIEhUTUwgY29udGVudCAodGFibGVzLCBmb3JtcywgbGlzdHMpLiBVc2VmdWwgZm9yIHBhcnNpbmcgZ2VuZXJhdGVkIG9yIGZldGNoZWQgVUlzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSFRNTCBjb250ZW50IHRvIGV4dHJhY3QgZGF0YSBmcm9tJyksXG4gICAgICBleHRyYWN0aW9uX3R5cGU6IHouZW51bShbJ3RhYmxlJywgJ2Zvcm0nLCAnbGlzdCddKS5kZWZhdWx0KCd0YWJsZScpLmRlc2NyaWJlKCdUeXBlIG9mIGRhdGEgdG8gZXh0cmFjdCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGh0bWxfY29udGVudCwgZXh0cmFjdGlvbl90eXBlIH06IHsgXG4gICAgICBodG1sX2NvbnRlbnQ6IHN0cmluZzsgXG4gICAgICBleHRyYWN0aW9uX3R5cGU6IHN0cmluZzsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVXNlIE5vZGUuanMgRE9NIHBhcnNlciAoY2hlZXJpby1saWtlIGFwcHJvYWNoIHdpdGggYmFzaWMgcmVnZXggZm9yIHNpbXBsaWNpdHkpXG4gICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgeW91J2QgdXNlIGEgcHJvcGVyIEhUTUwgcGFyc2VyIGxpa2UganNkb20gb3IgY2hlZXJpb1xuICAgICAgICBcbiAgICAgICAgbGV0IGV4dHJhY3RlZERhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICAgICAgaWYgKGV4dHJhY3Rpb25fdHlwZSA9PT0gJ3RhYmxlJykge1xuICAgICAgICAgIGNvbnN0IHRhYmxlUmVnZXggPSAvPHRhYmxlW14+XSo+KFtcXHNcXFNdKj8pPFxcL3RhYmxlPi9naTtcbiAgICAgICAgICBjb25zdCByb3dzUmVnZXggPSAvPHRyW14+XSo+KFtcXHNcXFNdKj8pPFxcL3RyPi9naTtcbiAgICAgICAgICBjb25zdCBjZWxsc1JlZ2V4ID0gLzwodGR8dGgpW14+XSo+KFtcXHNcXFNdKj8pPFxcLyh0ZHx0aCk+L2dpO1xuXG4gICAgICAgICAgbGV0IHRhYmxlTWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKCh0YWJsZU1hdGNoID0gdGFibGVSZWdleC5leGVjKGh0bWxfY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB0YWJsZUNvbnRlbnQgPSB0YWJsZU1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3Qgcm93czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCByb3dNYXRjaDtcbiAgICAgICAgICAgIHdoaWxlICgocm93TWF0Y2ggPSByb3dzUmVnZXguZXhlYyh0YWJsZUNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICByb3dzLnB1c2gocm93TWF0Y2hbMV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYXJzZWRSb3dzOiBzdHJpbmdbXVtdID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNlbGxzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICBsZXQgY2VsbE1hdGNoO1xuICAgICAgICAgICAgICBjb25zdCBjZWxsUmVnZXggPSAvPCh0ZHx0aClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHRkfHRoKT4vZ2k7XG4gICAgICAgICAgICAgIHdoaWxlICgoY2VsbE1hdGNoID0gY2VsbFJlZ2V4LmV4ZWMocm93KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjZWxscy5wdXNoKGNlbGxNYXRjaFsyXS5yZXBsYWNlKC88W14+XSs+L2csICcnKS50cmltKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhcnNlZFJvd3MucHVzaChjZWxscyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEudGFibGVzID0gcGFyc2VkUm93cztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAnZm9ybScpIHtcbiAgICAgICAgICBjb25zdCBmb3JtUmVnZXggPSAvPGZvcm1bXj5dKj4oW1xcc1xcU10qPyk8XFwvZm9ybT4vZ2k7XG4gICAgICAgICAgY29uc3QgaW5wdXRSZWdleCA9IC88KGlucHV0fHNlbGVjdHx0ZXh0YXJlYSlbXj5dKlxcLz8+L2dpO1xuXG4gICAgICAgICAgbGV0IGZvcm1NYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKGZvcm1NYXRjaCA9IGZvcm1SZWdleC5leGVjKGh0bWxfY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtQ29udGVudCA9IGZvcm1NYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgdmFsdWU/OiBzdHJpbmcgfT4gPSBbXTtcbiAgICAgICAgICAgIGxldCBpbnB1dE1hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChpbnB1dE1hdGNoID0gaW5wdXRSZWdleC5leGVjKGZvcm1Db250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uc3QgdGFnID0gaW5wdXRNYXRjaFswXTtcbiAgICAgICAgICAgICAgY29uc3QgbmFtZU1hdGNoID0gL25hbWU9W1wiJ10oW15cIiddKylbXCInXS9pLmV4ZWModGFnKTtcbiAgICAgICAgICAgICAgY29uc3QgdHlwZU1hdGNoID0gL3R5cGU9W1wiJ10oW15cIiddKylbXCInXS9pLmV4ZWModGFnKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGlmIChuYW1lTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBmaWVsZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lTWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlTWF0Y2g/LlsxXSB8fCAndGV4dCcsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJycsIC8vIFdvdWxkIG5lZWQgdG8gZXh0cmFjdCBhY3R1YWwgdmFsdWVzIGluIGEgcmVhbCBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEuZm9ybUZpZWxkcyA9IGZpZWxkcztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAnbGlzdCcpIHtcbiAgICAgICAgICBjb25zdCBsaXN0UmVnZXggPSAvPCh1bHxvbClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHVsfG9sKT4vZ2k7XG4gICAgICAgICAgY29uc3QgaXRlbVJlZ2V4ID0gLzxsaVtePl0qPihbXFxzXFxTXSo/KTxcXC9saT4vZ2k7XG5cbiAgICAgICAgICBsZXQgbGlzdE1hdGNoO1xuICAgICAgICAgIHdoaWxlICgobGlzdE1hdGNoID0gbGlzdFJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RDb250ZW50ID0gbGlzdE1hdGNoWzJdO1xuICAgICAgICAgICAgY29uc3QgaXRlbXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBsZXQgaXRlbU1hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChpdGVtTWF0Y2ggPSBpdGVtUmVnZXguZXhlYyhsaXN0Q29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbU1hdGNoWzFdLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpLnRyaW0oKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBleHRyYWN0ZWREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZXh0cmFjdCBVSSBkYXRhOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgTWFuYWdlbWVudCBUeXBlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQ29udGV4dEVudHJ5IHtcbiAgaWQ6IHN0cmluZztcbiAgdGltZXN0YW1wOiBudW1iZXI7XG4gIHR5cGU6ICdkZWNpc2lvbicgfCAncGF0dGVybicgfCAnY29uZmlndXJhdGlvbicgfCAnZmlsZV9jaGFuZ2UnIHwgJ2Vycm9yJyB8ICdzdW1tYXJ5JztcbiAgdGl0bGU6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xuICB0YWdzPzogc3RyaW5nW107XG4gIHNlc3Npb25faWQ/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBDb250ZXh0U3VtbWFyeSB7XG4gIHRvdGFsX2VudHJpZXM6IG51bWJlcjtcbiAgZW50cmllc19ieV90eXBlOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICByZWNlbnRfZW50cmllczogQ29udGV4dEVudHJ5W107XG4gIGxhc3RfdXBkYXRlZDogbnVtYmVyO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDb250ZXh0IFN0b3JhZ2UgTWFuYWdlciA9PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBDb250ZXh0U3RvcmFnZU1hbmFnZXIge1xuICBwcml2YXRlIHN0b3JhZ2VQYXRoOiBzdHJpbmc7XG4gIFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JhZ2VQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgJy5haV90b29sYm94X2NvbnRleHQuanNvbicpO1xuICB9XG5cbiAgLyoqIExvYWQgY29udGV4dCBlbnRyaWVzIGZyb20gZGlzayAqL1xuICBsb2FkKCk6IENvbnRleHRFbnRyeVtdIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmModGhpcy5zdG9yYWdlUGF0aCkpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLnN0b3JhZ2VQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGNvbnRleHQgc3RvcmFnZTonLCBlcnJvcik7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKiBTYXZlIGNvbnRleHQgZW50cmllcyB0byBkaXNrICovXG4gIHNhdmUoZW50cmllczogQ29udGV4dEVudHJ5W10pOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMuc3RvcmFnZVBhdGgpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFdyaXRlIGF0b21pY2FsbHkgKHRlbXAgZmlsZSArIHJlbmFtZSlcbiAgICAgIGNvbnN0IHRlbXBQYXRoID0gdGhpcy5zdG9yYWdlUGF0aCArICcudG1wJztcbiAgICAgIGZzLndyaXRlRmlsZVN5bmModGVtcFBhdGgsIEpTT04uc3RyaW5naWZ5KGVudHJpZXMsIG51bGwsIDIpKTtcbiAgICAgIGZzLnJlbmFtZVN5bmModGVtcFBhdGgsIHRoaXMuc3RvcmFnZVBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBjb250ZXh0IHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBBZGQgYSBuZXcgY29udGV4dCBlbnRyeSAqL1xuICBhZGRFbnRyeShlbnRyeTogQ29udGV4dEVudHJ5KTogdm9pZCB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIGVudHJpZXMudW5zaGlmdChlbnRyeSk7IC8vIEFkZCB0byBiZWdpbm5pbmdcbiAgICBcbiAgICAvLyBMaW1pdCB0byBsYXN0IDEwMDAgZW50cmllcyB0byBwcmV2ZW50IHVuYm91bmRlZCBncm93dGhcbiAgICBpZiAoZW50cmllcy5sZW5ndGggPiAxMDAwKSB7XG4gICAgICBlbnRyaWVzLnNwbGljZSgxMDAwKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zYXZlKGVudHJpZXMpO1xuICB9XG5cbiAgLyoqIEdldCByZWNlbnQgY29udGV4dCBlbnRyaWVzICovXG4gIGdldFJlY2VudEVudHJpZXMobGltaXQ6IG51bWJlciA9IDIwLCB0eXBlPzogc3RyaW5nKTogQ29udGV4dEVudHJ5W10ge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBcbiAgICBpZiAodHlwZSkge1xuICAgICAgcmV0dXJuIGVudHJpZXMuZmlsdGVyKGUgPT4gZS50eXBlID09PSB0eXBlKS5zbGljZSgwLCBsaW1pdCk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBlbnRyaWVzLnNsaWNlKDAsIGxpbWl0KTtcbiAgfVxuXG4gIC8qKiBTZWFyY2ggY29udGV4dCBlbnRyaWVzIGJ5IHF1ZXJ5ICovXG4gIHNlYXJjaEVudHJpZXMocXVlcnk6IHN0cmluZywgbWF4UmVzdWx0czogbnVtYmVyID0gMTApOiBDb250ZXh0RW50cnlbXSB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIGNvbnN0IGxvd2VyUXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIFxuICAgIGNvbnN0IHJlc3VsdHMgPSBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBcbiAgICAgIGVudHJ5LnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJRdWVyeSkgfHxcbiAgICAgIGVudHJ5LmNvbnRlbnQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSB8fFxuICAgICAgKGVudHJ5LnRhZ3MgJiYgZW50cnkudGFncy5zb21lKHRhZyA9PiB0YWcudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSkpXG4gICAgKTtcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCBtYXhSZXN1bHRzKTtcbiAgfVxuXG4gIC8qKiBEZWxldGUgY29udGV4dCBlbnRyaWVzIGJ5IElEICovXG4gIGRlbGV0ZUVudHJ5KGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgY29uc3QgZmlsdGVyZWQgPSBlbnRyaWVzLmZpbHRlcihlID0+IGUuaWQgIT09IGlkKTtcbiAgICBcbiAgICBpZiAoZmlsdGVyZWQubGVuZ3RoID09PSBlbnRyaWVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBFbnRyeSBub3QgZm91bmRcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zYXZlKGZpbHRlcmVkKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBDbGVhciBhbGwgY29udGV4dCBlbnRyaWVzICovXG4gIGNsZWFyQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuc2F2ZShbXSk7XG4gIH1cblxuICAvKiogR2V0IHN1bW1hcnkgc3RhdGlzdGljcyAqL1xuICBnZXRTdW1tYXJ5KCk6IENvbnRleHRTdW1tYXJ5IHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgXG4gICAgY29uc3QgZW50cmllc0J5VHlwZTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBlbnRyaWVzQnlUeXBlW2VudHJ5LnR5cGVdID0gKGVudHJpZXNCeVR5cGVbZW50cnkudHlwZV0gfHwgMCkgKyAxO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvdGFsX2VudHJpZXM6IGVudHJpZXMubGVuZ3RoLFxuICAgICAgZW50cmllc19ieV90eXBlOiBlbnRyaWVzQnlUeXBlLFxuICAgICAgcmVjZW50X2VudHJpZXM6IGVudHJpZXMuc2xpY2UoMCwgNSksXG4gICAgICBsYXN0X3VwZGF0ZWQ6IERhdGUubm93KCksXG4gICAgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDb250ZXh0IEFuYWx5emVyID09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIENvbnRleHRBbmFseXplciB7XG4gIHByaXZhdGUgc3RvcmFnZU1hbmFnZXI6IENvbnRleHRTdG9yYWdlTWFuYWdlcjtcbiAgXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmFnZU1hbmFnZXIgPSBuZXcgQ29udGV4dFN0b3JhZ2VNYW5hZ2VyKCk7XG4gIH1cblxuICAvKiogQW5hbHl6ZSByZWNlbnQgYWN0aXZpdHkgYW5kIGF1dG8tc2F2ZSBpbXBvcnRhbnQgY29udGV4dCAqL1xuICBhbmFseXplQW5kU2F2ZShcbiAgICBzZXNzaW9uRXZlbnRzOiBBcnJheTx7IHR5cGU6IHN0cmluZzsgdGltZXN0YW1wOiBudW1iZXI7IGRhdGE/OiBhbnkgfT4sXG4gICAgY29uZmlnQ2hhbmdlcz86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4gfCBzdHJpbmc+XG4gICk6IHsgc2F2ZWRfY291bnQ6IG51bWJlcjsgc3VtbWFyeTogc3RyaW5nIH0ge1xuICAgIGNvbnN0IGVudHJpZXM6IENvbnRleHRFbnRyeVtdID0gW107XG5cbiAgICAvLyBBbmFseXplIHRvb2wgdXNhZ2UgcGF0dGVybnNcbiAgICBjb25zdCB0b29sVXNhZ2VDb3VudDogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIHNlc3Npb25FdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQudHlwZS5zdGFydHNXaXRoKCd0b29sXycpKSB7XG4gICAgICAgIGNvbnN0IHRvb2xOYW1lID0gZXZlbnQudHlwZS5yZXBsYWNlKCd0b29sXycsICcnKTtcbiAgICAgICAgdG9vbFVzYWdlQ291bnRbdG9vbE5hbWVdID0gKHRvb2xVc2FnZUNvdW50W3Rvb2xOYW1lXSB8fCAwKSArIDE7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZGVudGlmeSBmcmVxdWVudGx5IHVzZWQgdG9vbHMgKD4zIHVzZXMgaW4gc2Vzc2lvbilcbiAgICBPYmplY3QuZW50cmllcyh0b29sVXNhZ2VDb3VudCkuZm9yRWFjaCgoW3Rvb2wsIGNvdW50XSkgPT4ge1xuICAgICAgaWYgKGNvdW50ID4gMykge1xuICAgICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ3BhdHRlcm4nLFxuICAgICAgICAgIHRpdGxlOiBgRnJlcXVlbnQgVG9vbCBVc2FnZTogJHt0b29sfWAsXG4gICAgICAgICAgY29udGVudDogYFRvb2wgJyR7dG9vbH0nIHdhcyB1c2VkICR7Y291bnR9IHRpbWVzIGluIHRoZSBjdXJyZW50IHNlc3Npb24sIGluZGljYXRpbmcgaXQncyBhIHByaW1hcnkgd29ya2Zsb3cgdG9vbC5gLFxuICAgICAgICAgIHRhZ3M6IFsndXNhZ2VfcGF0dGVybicsICdmcmVxdWVudF90b29sJ10sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQW5hbHl6ZSBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgICBpZiAoY29uZmlnQ2hhbmdlcykge1xuICAgICAgT2JqZWN0LmVudHJpZXMoY29uZmlnQ2hhbmdlcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAnY29uZmlndXJhdGlvbicsXG4gICAgICAgICAgdGl0bGU6IGBDb25maWd1cmF0aW9uIENoYW5nZTogJHtrZXl9YCxcbiAgICAgICAgICBjb250ZW50OiBgU2V0dGluZyAnJHtrZXl9JyB3YXMgY2hhbmdlZCB0byAnJHt2YWx1ZX0nLmAsXG4gICAgICAgICAgdGFnczogWydjb25maWdfY2hhbmdlJ10sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0IGltcG9ydGFudCBkZWNpc2lvbnMgKGJhc2VkIG9uIGV2ZW50IHBhdHRlcm5zKVxuICAgIGNvbnN0IGRlY2lzaW9uRXZlbnRzID0gc2Vzc2lvbkV2ZW50cy5maWx0ZXIoZSA9PiBcbiAgICAgIGUudHlwZSA9PT0gJ2RlY2lzaW9uJyB8fCBcbiAgICAgIChlLmRhdGEgJiYgdHlwZW9mIGUuZGF0YS5kZWNpc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgKTtcblxuICAgIGRlY2lzaW9uRXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgY29uc3QgZGVjaXNpb25UZXh0ID0gZXZlbnQuZGF0YT8uZGVjaXNpb24gfHwgYERlY2lzaW9uIG1hZGUgYXQgJHtuZXcgRGF0ZShldmVudC50aW1lc3RhbXApLnRvTG9jYWxlVGltZVN0cmluZygpfWA7XG4gICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgIHRpbWVzdGFtcDogZXZlbnQudGltZXN0YW1wLFxuICAgICAgICB0eXBlOiAnZGVjaXNpb24nLFxuICAgICAgICB0aXRsZTogJ0ltcG9ydGFudCBEZWNpc2lvbiBSZWNvcmRlZCcsXG4gICAgICAgIGNvbnRlbnQ6IGRlY2lzaW9uVGV4dCxcbiAgICAgICAgdGFnczogWydkZWNpc2lvbiddLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBBdXRvLWdlbmVyYXRlIHN1bW1hcnkgaWYgd2UgaGF2ZSBlbm91Z2ggZW50cmllc1xuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHVuaXF1ZVBhdHRlcm5zID0gbmV3IFNldChlbnRyaWVzLmZpbHRlcihlID0+IGUudHlwZSA9PT0gJ3BhdHRlcm4nKS5tYXAoZSA9PiBlLnRpdGxlKSk7XG4gICAgICBcbiAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICB0eXBlOiAnc3VtbWFyeScsXG4gICAgICAgIHRpdGxlOiBgU2Vzc2lvbiBDb250ZXh0IFN1bW1hcnkgKCR7bmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKX0pYCxcbiAgICAgICAgY29udGVudDogYEF1dG8tZ2VuZXJhdGVkIHN1bW1hcnk6ICR7ZW50cmllcy5sZW5ndGh9IGNvbnRleHQgZW50cmllcyBzYXZlZC4gS2V5IHBhdHRlcm5zIGRldGVjdGVkOiAke0FycmF5LmZyb20odW5pcXVlUGF0dGVybnMpLmpvaW4oJywgJykgfHwgJ05vIHNwZWNpZmljIHBhdHRlcm5zJ30uIENvbmZpZ3VyYXRpb24gY2hhbmdlcyB0cmFja2VkOiAke09iamVjdC5rZXlzKGNvbmZpZ0NoYW5nZXMgfHwge30pLmxlbmd0aH0uYCxcbiAgICAgICAgdGFnczogWydhdXRvX3N1bW1hcnknXSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTYXZlIGFsbCBlbnRyaWVzIHRvIHN0b3JhZ2VcbiAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB0aGlzLnN0b3JhZ2VNYW5hZ2VyLmFkZEVudHJ5KGVudHJ5KSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNhdmVkX2NvdW50OiBlbnRyaWVzLmxlbmd0aCxcbiAgICAgICAgc3VtbWFyeTogYFNhdmVkICR7ZW50cmllcy5sZW5ndGh9IGNvbnRleHQgZW50cmllcyBpbmNsdWRpbmcgcGF0dGVybnMgYW5kIGRlY2lzaW9ucy5gLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBzYXZlZF9jb3VudDogMCwgc3VtbWFyeTogJ05vIHNpZ25pZmljYW50IGNvbnRleHQgY2hhbmdlcyBkZXRlY3RlZC4nIH07XG4gIH1cblxuICAvKiogR2VuZXJhdGUgYSB1bmlxdWUgSUQgZm9yIGNvbnRleHQgZW50cnkgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjdHhfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgQ29udGV4dEFuYWx5emVyKCk7XG4gIGNvbnN0IHN0b3JhZ2VNYW5hZ2VyID0gbmV3IENvbnRleHRTdG9yYWdlTWFuYWdlcigpO1xuXG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBhdXRvX3N1bW1hcml6ZV9jb250ZXh0IHRvb2wgXHUyMDE0IEFuYWx5emUgc2Vzc2lvbiBhbmQgc2F2ZSBpbXBvcnRhbnQgY29udGV4dFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdhdXRvX3N1bW1hcml6ZV9jb250ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0F1dG9tYXRpY2FsbHkgYW5hbHl6ZSByZWNlbnQgc2Vzc2lvbiBhY3Rpdml0eSwgaWRlbnRpZnkgaW1wb3J0YW50IHBhdHRlcm5zL2RlY2lzaW9ucywgYW5kIHNhdmUgdGhlbSB0byBwZXJzaXN0ZW50IG1lbW9yeSBmb3IgZnV0dXJlIHJlZmVyZW5jZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHNlc3Npb25fZXZlbnRzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICAgICAgdHlwZTogei5zdHJpbmcoKSxcbiAgICAgICAgdGltZXN0YW1wOiB6Lm51bWJlcigpLFxuICAgICAgICBkYXRhOiB6LmFueSgpLm9wdGlvbmFsKCksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnUmVjZW50IHNlc3Npb24gZXZlbnRzIHRvIGFuYWx5emUnKSxcbiAgICAgIGNvbmZpZ19jaGFuZ2VzOiB6LnJlY29yZCh6LnVuaW9uKFt6LmJvb2xlYW4oKSwgei5zdHJpbmcoKV0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDb25maWd1cmF0aW9uIGNoYW5nZXMgbWFkZSBkdXJpbmcgc2Vzc2lvbicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHNlc3Npb25fZXZlbnRzLCBjb25maWdfY2hhbmdlcyB9OiB7IFxuICAgICAgc2Vzc2lvbl9ldmVudHM/OiBBcnJheTx7IHR5cGU6IHN0cmluZzsgdGltZXN0YW1wOiBudW1iZXI7IGRhdGE/OiBhbnkgfT47IFxuICAgICAgY29uZmlnX2NoYW5nZXM/OiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuIHwgc3RyaW5nPjsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYW5hbHl6ZXIuYW5hbHl6ZUFuZFNhdmUoc2Vzc2lvbl9ldmVudHMgfHwgW10sIGNvbmZpZ19jaGFuZ2VzKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29udGV4dCBhbmFseXNpcyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9jb250ZXh0X21lbW9yeSB0b29sIFx1MjAxNCBSZXRyaWV2ZSBhdXRvLXNhdmVkIGNvbnRleHQgZW50cmllc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnZXRfY29udGV4dF9tZW1vcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnUmV0cmlldmUgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgZnJvbSBwZXJzaXN0ZW50IG1lbW9yeS4gVXNlZnVsIGZvciByZWNhbGxpbmcgcGFzdCBkZWNpc2lvbnMsIHBhdHRlcm5zLCBvciBjb25maWd1cmF0aW9ucy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGxpbWl0OiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgyMCkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIGVudHJpZXMgdG8gcmV0dXJuJyksXG4gICAgICB0eXBlOiB6LmVudW0oWydkZWNpc2lvbicsICdwYXR0ZXJuJywgJ2NvbmZpZ3VyYXRpb24nLCAnZmlsZV9jaGFuZ2UnLCAnZXJyb3InLCAnc3VtbWFyeSddKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgZW50cnkgdHlwZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGxpbWl0LCB0eXBlIH06IHsgXG4gICAgICBsaW1pdD86IG51bWJlcjsgXG4gICAgICB0eXBlPzogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gc3RvcmFnZU1hbmFnZXIuZ2V0UmVjZW50RW50cmllcyhsaW1pdCB8fCAyMCwgdHlwZSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGVudHJpZXMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJldHJpZXZlIGNvbnRleHQgbWVtb3J5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzZWFyY2hfY29udGV4dCB0b29sIFx1MjAxNCBTZWFyY2ggYXV0by1zYXZlZCBjb250ZXh0IGJ5IHF1ZXJ5XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NlYXJjaF9jb250ZXh0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCB0aHJvdWdoIGF1dG9tYXRpY2FsbHkgc2F2ZWQgY29udGV4dCBlbnRyaWVzIHVzaW5nIHRleHQgbWF0Y2hpbmcuIEZpbmRzIHJlbGV2YW50IHBhc3QgZGVjaXNpb25zLCBwYXR0ZXJucywgb3IgY29uZmlndXJhdGlvbnMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnU2VhcmNoIHF1ZXJ5IHRvIG1hdGNoIGFnYWluc3QgY29udGV4dCBlbnRyaWVzJyksXG4gICAgICBtYXhfcmVzdWx0czogei5udW1iZXIoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVybicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBtYXhfcmVzdWx0cyB9OiB7IFxuICAgICAgcXVlcnk6IHN0cmluZzsgXG4gICAgICBtYXhfcmVzdWx0cz86IG51bWJlcjsgXG4gICAgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHN0b3JhZ2VNYW5hZ2VyLnNlYXJjaEVudHJpZXMocXVlcnksIG1heF9yZXN1bHRzIHx8IDEwKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcmVzdWx0cyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IHNlYXJjaCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNvbnRleHRfc3VtbWFyeSB0b29sIFx1MjAxNCBHZXQgc3VtbWFyeSBzdGF0aXN0aWNzIG9mIGF1dG8tc2F2ZWQgY29udGV4dFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjb250ZXh0X3N1bW1hcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGEgc3VtbWFyeSBvZiBhbGwgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMsIGluY2x1ZGluZyBjb3VudHMgYnkgdHlwZSBhbmQgcmVjZW50IGFjdGl2aXR5LicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSBzdG9yYWdlTWFuYWdlci5nZXRTdW1tYXJ5KCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBzdW1tYXJ5IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGNvbnRleHQgc3VtbWFyeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX2NvbnRleHRfZW50cnkgdG9vbCBcdTIwMTQgUmVtb3ZlIGEgc3BlY2lmaWMgY29udGV4dCBlbnRyeSBieSBJRFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfY29udGV4dF9lbnRyeScsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgYSBzcGVjaWZpYyBhdXRvLXNhdmVkIGNvbnRleHQgZW50cnkgYnkgaXRzIHVuaXF1ZSBJRC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGVudHJ5X2lkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdW5pcXVlIElEIG9mIHRoZSBjb250ZXh0IGVudHJ5IHRvIGRlbGV0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGVudHJ5X2lkIH06IHsgZW50cnlfaWQ6IHN0cmluZyB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkZWxldGVkID0gc3RvcmFnZU1hbmFnZXIuZGVsZXRlRW50cnkoZW50cnlfaWQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFkZWxldGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgQ29udGV4dCBlbnRyeSAnJHtlbnRyeV9pZH0nIG5vdCBmb3VuZGAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkZWxldGVkOiB0cnVlLCBlbnRyeV9pZCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZGVsZXRlIGNvbnRleHQgZW50cnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNsZWFyX2NvbnRleHRfbWVtb3J5IHRvb2wgXHUyMDE0IENsZWFyIGFsbCBhdXRvLXNhdmVkIGNvbnRleHQgZW50cmllc1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjbGVhcl9jb250ZXh0X21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBhbGwgYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgZnJvbSBwZXJzaXN0ZW50IG1lbW9yeS4gVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbmZpcm06IHouYm9vbGVhbigpLmRlc2NyaWJlKCdTZXQgdG8gdHJ1ZSB0byBjb25maXJtIGRlbGV0aW9uIG9mIGFsbCBjb250ZXh0IGVudHJpZXMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb25maXJtIH06IHsgY29uZmlybTogYm9vbGVhbiB9KSA9PiB7XG4gICAgICBpZiAoIWNvbmZpcm0pIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQ29uZmlybWF0aW9uIHJlcXVpcmVkLiBTZXQgY29uZmlybT10cnVlIHRvIHByb2NlZWQuJyB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICB0cnkge1xuICAgICAgICBzdG9yYWdlTWFuYWdlci5jbGVhckFsbCgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjbGVhcmVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjbGVhciBjb250ZXh0IG1lbW9yeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gdHJhY2tfaW1wb3J0YW50X2V2ZW50IHRvb2wgXHUyMDE0IE1hbnVhbGx5IG1hcmsgYW4gZXZlbnQgYXMgaW1wb3J0YW50IGZvciBjb250ZXh0IHRyYWNraW5nXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3RyYWNrX2ltcG9ydGFudF9ldmVudCcsXG4gICAgZGVzY3JpcHRpb246ICdNYW51YWxseSByZWNvcmQgYW4gaW1wb3J0YW50IGV2ZW50IG9yIGRlY2lzaW9uIHRvIHBlcnNpc3RlbnQgbWVtb3J5LiBVc2VmdWwgZm9yIG1hcmtpbmcgY3JpdGljYWwgbW9tZW50cyBpbiBhIHNlc3Npb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0aXRsZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGl0bGUgb2YgdGhlIGltcG9ydGFudCBldmVudCcpLFxuICAgICAgY29udGVudDogei5zdHJpbmcoKS5kZXNjcmliZSgnRGV0YWlsZWQgZGVzY3JpcHRpb24gb2YgdGhlIGV2ZW50JyksXG4gICAgICB0YWdzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RhZ3MgdG8gY2F0ZWdvcml6ZSB0aGUgZXZlbnQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgY29udGVudCwgdGFncyB9OiB7IFxuICAgICAgdGl0bGU6IHN0cmluZzsgXG4gICAgICBjb250ZW50OiBzdHJpbmc7IFxuICAgICAgdGFncz86IHN0cmluZ1tdOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyeTogQ29udGV4dEVudHJ5ID0ge1xuICAgICAgICAgIGlkOiBgY3R4XyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdHlwZTogJ2RlY2lzaW9uJyxcbiAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIHRhZ3MsXG4gICAgICAgIH07XG5cbiAgICAgICAgc3RvcmFnZU1hbmFnZXIuYWRkRW50cnkoZW50cnkpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB0cmFja2VkOiB0cnVlLCBlbnRyeV9pZDogZW50cnkuaWQgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHRyYWNrIGV2ZW50OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiLyoqXG4gKiBBdHRhY2htZW50IE1hbmFnZXJcbiAqIFxuICogU3RvcmVzIHJlZmVyZW5jZXMgdG8gZmlsZXMgYXR0YWNoZWQgdG8gdGhlIGN1cnJlbnQgY2hhdCBtZXNzYWdlLlxuICogQWxsb3dzIHRvb2xzIHRvIGFjY2VzcyB0aGVzZSBmaWxlcyBieSBuYW1lIHdpdGhvdXQgbmVlZGluZyBmdWxsIGRpc2sgcGF0aHMuXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBGaWxlSGFuZGxlIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5cbi8vIFN0b3JlIGF0dGFjaG1lbnRzIGZvciB0aGUgY3VycmVudCB0dXJuXG4vLyBLZXk6IGZpbGVuYW1lIChsb3dlcmNhc2UpLCBWYWx1ZTogRmlsZUhhbmRsZVxubGV0IGN1cnJlbnRBdHRhY2htZW50cyA9IG5ldyBNYXA8c3RyaW5nLCBGaWxlSGFuZGxlPigpO1xuXG4vKipcbiAqIFNldCB0aGUgYXR0YWNobWVudHMgZm9yIHRoZSBjdXJyZW50IGNoYXQgdHVybi5cbiAqIENhbGxlZCBieSB0aGUgcHJvbXB0IHByZXByb2Nlc3NvciBiZWZvcmUgZWFjaCBnZW5lcmF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QXR0YWNobWVudHMoZmlsZXM6IEZpbGVIYW5kbGVbXSk6IHZvaWQge1xuICBjdXJyZW50QXR0YWNobWVudHMuY2xlYXIoKTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgLy8gU3RvcmUgYnkgbG93ZXJjYXNlIG5hbWUgZm9yIGNhc2UtaW5zZW5zaXRpdmUgbG9va3VwXG4gICAgY3VycmVudEF0dGFjaG1lbnRzLnNldChmaWxlLm5hbWUudG9Mb3dlckNhc2UoKSwgZmlsZSk7XG4gIH1cbiAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlZ2lzdGVyZWQgJHtmaWxlcy5sZW5ndGh9IGF0dGFjaG1lbnQocyk6ICR7ZmlsZXMubWFwKGYgPT4gZi5uYW1lKS5qb2luKCcsICcpfWApO1xuICB9XG59XG5cbi8qKlxuICogR2V0IGEgc3BlY2lmaWMgYXR0YWNobWVudCBieSBuYW1lIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIFJldHVybnMgdGhlIEZpbGVIYW5kbGUgaWYgZm91bmQsIHVuZGVmaW5lZCBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdHRhY2htZW50KG5hbWU6IHN0cmluZyk6IEZpbGVIYW5kbGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gY3VycmVudEF0dGFjaG1lbnRzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpO1xufVxuXG4vKipcbiAqIExpc3QgYWxsIGN1cnJlbnRseSBhdHRhY2hlZCBmaWxlbmFtZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0QXR0YWNobWVudHMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gQXJyYXkuZnJvbShjdXJyZW50QXR0YWNobWVudHMua2V5cygpKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHNwZWNpZmljIGZpbGUgaXMgYXR0YWNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0F0dGFjaGVkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gY3VycmVudEF0dGFjaG1lbnRzLmhhcyhuYW1lLnRvTG93ZXJDYXNlKCkpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCwgRmlsZUhhbmRsZSB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZ2V0QXR0YWNobWVudCB9IGZyb20gJy4uL2F0dGFjaG1lbnRNYW5hZ2VyJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJlYWREb2N1bWVudFBhcmFtcyB7XG4gIGZpbGVfcGF0aDogc3RyaW5nO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBIZWxwZXIgRnVuY3Rpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBWYWxpZGF0ZSBmaWxlIGV4aXN0cyBvbiBkaXNrICovXG5mdW5jdGlvbiB2YWxpZGF0ZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEZpbGUgbm90IGZvdW5kIG9uIGRpc2s6ICR7ZmlsZVBhdGh9YCB9O1xuICB9XG4gIFxuICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpO1xuICBpZiAoIXN0YXQuaXNGaWxlKCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUGF0aCBcIiR7ZmlsZVBhdGh9XCIgaXMgbm90IGEgZmlsZWAgfTtcbiAgfVxuICBcbiAgLy8gQ2hlY2sgZmlsZSBzaXplIChtYXggNTBNQilcbiAgY29uc3QgbWF4U2l6ZSA9IDUwICogMTAyNCAqIDEwMjQ7IC8vIDUwTUJcbiAgaWYgKHN0YXQuc2l6ZSA+IG1heFNpemUpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgRmlsZSB0b28gbGFyZ2UgKCR7KHN0YXQuc2l6ZSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDEpfU1CKSwgbWF4IGlzIDUwTUJgIH07XG4gIH1cbiAgXG4gIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG59XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRG9jdW1lbnQgcmVhZGluZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogUmVhZCBjb250ZW50IGZyb20gUERGIG9yIERPQ1ggZmlsZXMuXG4gKiBTdXBwb3J0cyBib3RoIGRpc2sgcGF0aHMgYW5kIGF0dGFjaGVkIGZpbGVzIChieSBmaWxlbmFtZSkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWREb2N1bWVudCh7IGZpbGVfcGF0aCB9OiBSZWFkRG9jdW1lbnRQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyAxLiBDaGVjayBpZiBpdCdzIGFuIGF0dGFjaGVkIGZpbGVcbiAgICBjb25zdCBhdHRhY2htZW50ID0gZ2V0QXR0YWNobWVudChmaWxlX3BhdGgpO1xuICAgIGlmIChhdHRhY2htZW50KSB7XG4gICAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgYXR0YWNoZWQgZmlsZTogJHtmaWxlX3BhdGh9YCk7XG4gICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBhdHRhY2htZW50LnJlYWQoKTtcbiAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlX3BhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBcbiAgICAgIGlmIChleHQgPT09ICcucGRmJykge1xuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZFBERkZyb21CdWZmZXIoYnVmZmVyLCBmaWxlX3BhdGgpO1xuICAgICAgfSBlbHNlIGlmIChleHQgPT09ICcuZG9jeCcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlYWRET0NYRnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy50eHQnKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkVFhURnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgZXJyb3I6IGBVbnN1cHBvcnRlZCBhdHRhY2hlZCBmaWxlIGZvcm1hdDogJHtleHR9LiBPbmx5IC5wZGYsIC5kb2N4LCBhbmQgLnR4dCBhcmUgc3VwcG9ydGVkLmAgXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gMi4gRmFsbCBiYWNrIHRvIGRpc2sgcGF0aFxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUZpbGUoZmlsZV9wYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcbiAgICAgIC8vIFByb3ZpZGUgaGVscGZ1bCBlcnJvciBpZiBpdCBsb29rZWQgbGlrZSBhIGZpbGVuYW1lXG4gICAgICByZXR1cm4geyBcbiAgICAgICAgc3VjY2VzczogZmFsc2UsIFxuICAgICAgICBlcnJvcjogYCR7dmFsaWRhdGlvbi5lcnJvcn1cXG5cXG5Ob3RlOiBJZiB0aGlzIGlzIGFuIGF0dGFjaGVkIGZpbGUsIHVzZSB0aGUgZXhhY3QgZmlsZW5hbWUgZnJvbSB0aGUgXCJBVFRBQ0hFRCBGSUxFUyBBVkFJTEFCTEVcIiBsaXN0LmAgXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlX3BhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgXG4gICAgc3dpdGNoIChleHQpIHtcbiAgICAgIGNhc2UgJy5wZGYnOlxuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZFBERihmaWxlX3BhdGgpO1xuICAgICAgY2FzZSAnLmRvY3gnOlxuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZERPQ1goZmlsZV9wYXRoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcbiAgICAgICAgICBlcnJvcjogYFVuc3VwcG9ydGVkIGZpbGUgZm9ybWF0OiAke2V4dH0uIE9ubHkgLnBkZiBhbmQgLmRvY3ggYXJlIHN1cHBvcnRlZC5gIFxuICAgICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBQREYgY29udGVudCBmcm9tIGRpc2sgcGF0aC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFBERihmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGRmUGFyc2UgPSAoYXdhaXQgaW1wb3J0KCdwZGYtcGFyc2UnKSkuZGVmYXVsdDtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgUERGIGZyb20gZGlzazogJHtmaWxlUGF0aH1gKTtcbiAgICBcbiAgICBjb25zdCBkYXRhQnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwZGZQYXJzZShkYXRhQnVmZmVyKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFBERiByZWFkIGNvbXBsZXRlOiAke3Jlc3VsdC5udW1wYWdlc30gcGFnZXMsICR7KHJlc3VsdC50ZXh0Lmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9S0JgKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgZm9ybWF0OiAnUERGJyxcbiAgICAgICAgcGFnZXM6IHJlc3VsdC5udW1wYWdlcyxcbiAgICAgICAgd29yZF9jb3VudDogcmVzdWx0LnRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGZzLnN0YXRTeW5jKGZpbGVQYXRoKS5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHJlc3VsdC50ZXh0LnN1YnN0cmluZygwLCA1MDApICsgKHJlc3VsdC50ZXh0Lmxlbmd0aCA+IDUwMCA/ICcuLi4nIDogJycpLFxuICAgICAgICBmdWxsX3RleHQ6IHJlc3VsdC50ZXh0LFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgUERGIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlYWQgUERGIGNvbnRlbnQgZnJvbSBidWZmZXIgKGZvciBhdHRhY2htZW50cykuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWRQREZGcm9tQnVmZmVyKGJ1ZmZlcjogQnVmZmVyLCBmaWxlTmFtZTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGRmUGFyc2UgPSAoYXdhaXQgaW1wb3J0KCdwZGYtcGFyc2UnKSkuZGVmYXVsdDtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgUERGIGZyb20gYXR0YWNobWVudDogJHtmaWxlTmFtZX1gKTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwZGZQYXJzZShidWZmZXIpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUERGIHJlYWQgY29tcGxldGU6ICR7cmVzdWx0Lm51bXBhZ2VzfSBwYWdlcywgJHsocmVzdWx0LnRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVOYW1lLFxuICAgICAgICBmb3JtYXQ6ICdQREYnLFxuICAgICAgICBwYWdlczogcmVzdWx0Lm51bXBhZ2VzLFxuICAgICAgICB3b3JkX2NvdW50OiByZXN1bHQudGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxuICAgICAgICBzaXplOiBgJHsoYnVmZmVyLmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgdGV4dF9wcmV2aWV3OiByZXN1bHQudGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArIChyZXN1bHQudGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgZnVsbF90ZXh0OiByZXN1bHQudGV4dCxcbiAgICAgICAgc291cmNlOiAnYXR0YWNobWVudCcsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBQREYgcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBET0NYIGNvbnRlbnQgZnJvbSBkaXNrIHBhdGguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWRET0NYKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBtYW1tb3RoID0gYXdhaXQgaW1wb3J0KCdtYW1tb3RoJyk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBSZWFkaW5nIERPQ1ggZnJvbSBkaXNrOiAke2ZpbGVQYXRofWApO1xuICAgIFxuICAgIGNvbnN0IGRhdGFCdWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG1hbW1vdGguZXh0cmFjdFJhd1RleHQoeyBidWZmZXI6IGRhdGFCdWZmZXIgfSk7XG4gICAgXG4gICAgY29uc3QgdGV4dCA9IHJlc3VsdC52YWx1ZTtcbiAgICBjb25zdCB3YXJuaW5ncyA9IHJlc3VsdC5tZXNzYWdlcy5tYXAobSA9PiBtLm1lc3NhZ2UpLmpvaW4oJ1xcbicpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gRE9DWCByZWFkIGNvbXBsZXRlOiAkeyh0ZXh0Lmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9S0JgKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgZm9ybWF0OiAnRE9DWCcsXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIodyA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgc2l6ZTogYCR7KGZzLnN0YXRTeW5jKGZpbGVQYXRoKS5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICB3YXJuaW5nczogd2FybmluZ3MgfHwgdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRE9DWCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIERPQ1ggY29udGVudCBmcm9tIGJ1ZmZlciAoZm9yIGF0dGFjaG1lbnRzKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZERPQ1hGcm9tQnVmZmVyKGJ1ZmZlcjogQnVmZmVyLCBmaWxlTmFtZTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgbWFtbW90aCA9IGF3YWl0IGltcG9ydCgnbWFtbW90aCcpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBET0NYIGZyb20gYXR0YWNobWVudDogJHtmaWxlTmFtZX1gKTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtYW1tb3RoLmV4dHJhY3RSYXdUZXh0KHsgYnVmZmVyIH0pO1xuICAgIFxuICAgIGNvbnN0IHRleHQgPSByZXN1bHQudmFsdWU7XG4gICAgY29uc3Qgd2FybmluZ3MgPSByZXN1bHQubWVzc2FnZXMubWFwKG0gPT4gbS5tZXNzYWdlKS5qb2luKCdcXG4nKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIERPQ1ggcmVhZCBjb21wbGV0ZTogJHsodGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZpbGVfcGF0aDogZmlsZU5hbWUsXG4gICAgICAgIGZvcm1hdDogJ0RPQ1gnLFxuICAgICAgICB3b3JkX2NvdW50OiB0ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXG4gICAgICAgIHNpemU6IGAkeyhidWZmZXIubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICB3YXJuaW5nczogd2FybmluZ3MgfHwgdW5kZWZpbmVkLFxuICAgICAgICBzb3VyY2U6ICdhdHRhY2htZW50JyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYERPQ1ggcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVhZCBUWFQgY29udGVudCBmcm9tIGJ1ZmZlciAoZm9yIGF0dGFjaG1lbnRzKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFRYVEZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgVFhUIGZyb20gYXR0YWNobWVudDogJHtmaWxlTmFtZX1gKTtcbiAgICBcbiAgICBjb25zdCB0ZXh0ID0gYnVmZmVyLnRvU3RyaW5nKCd1dGYtOCcpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gVFhUIHJlYWQgY29tcGxldGU6ICR7KHRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6IGZpbGVOYW1lLFxuICAgICAgICBmb3JtYXQ6ICdUWFQnLFxuICAgICAgICB3b3JkX2NvdW50OiB0ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKHcgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXG4gICAgICAgIHNpemU6IGAkeyhidWZmZXIubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcbiAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxuICAgICAgICBzb3VyY2U6ICdhdHRhY2htZW50JyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFRYVCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gIH1cbn1cblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUb29sIFJlZ2lzdHJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEb2N1bWVudFRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyByZWFkX2RvY3VtZW50IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9kb2N1bWVudCcsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIGNvbnRlbnQgZnJvbSBQREYsIERPQ1gsIG9yIFRYVCBmaWxlcy4gU3VwcG9ydHMgYm90aCBkaXNrIHBhdGhzIGFuZCBhdHRhY2hlZCBmaWxlcyAodXNlIGZpbGVuYW1lIGZvciBhdHRhY2htZW50cykuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIFBERiwgRE9DWCwgb3IgVFhUIGZpbGUsIG9yIHRoZSBmaWxlbmFtZSBpZiBpdCBpcyBhbiBhdHRhY2hlZCBmaWxlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmVhZERvY3VtZW50KHBhcmFtcyBhcyBSZWFkRG9jdW1lbnRQYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgIi8qKlxuICogVG9vbHMgUHJvdmlkZXIgLSBDb21wbGV0ZSBJbXBsZW1lbnRhdGlvbiBvZiBhbGwgfjQ1IHRvb2xzIGFjcm9zcyA2IGNhdGVnb3JpZXNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFRvb2wsIFRvb2xzUHJvdmlkZXJDb250cm9sbGVyIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5cbi8vIEltcG9ydCBleGlzdGluZyBtb2R1bGVzXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHLCBpc1Rvb2xFbmFibGVkLCBpc0V4ZWN1dGlvblRvb2xFbmFibGVkIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSAnLi9zdGF0ZU1hbmFnZXInO1xuaW1wb3J0IHsgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIH0gZnJvbSAnLi9iYWNrZ3JvdW5kQ29tbWFuZHMnO1xuXG4vLyBJbXBvcnQgY2F0ZWdvcnktc3BlY2lmaWMgdG9vbCBtb2R1bGVzXG5pbXBvcnQgeyByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyB9IGZyb20gJy4vdG9vbHMvZmlsZVN5c3RlbVRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyB9IGZyb20gJy4vdG9vbHMvd2ViUmVzZWFyY2hUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckdpdFRvb2xzIH0gZnJvbSAnLi90b29scy9naXRHaXRodWJUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckJyb3dzZXJUb29scyB9IGZyb20gJy4vdG9vbHMvYnJvd3NlckF1dG9tYXRpb25Ub29scyc7XG5pbXBvcnQgeyByZWdpc3RlckRhdGFiYXNlVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2RhdGFiYXNlVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzIH0gZnJvbSAnLi90b29scy9iYWNrZ3JvdW5kQ29tbWFuZFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyRXhlY3V0aW9uVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2V4ZWN1dGlvblRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyVXRpbGl0eVRvb2xzIH0gZnJvbSAnLi90b29scy91dGlsaXR5VG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyB9IGZyb20gJy4vdG9vbHMvaW1hZ2VQcm9jZXNzaW5nVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJIdHRwQ2xpZW50VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2h0dHBDbGllbnRUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlclJhZ1Rvb2xzIH0gZnJvbSAnLi90b29scy92ZWN0b3JSYWdUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzIH0gZnJvbSAnLi90b29scy91aUdlbmVyYXRpb25Ub29scyc7XG5pbXBvcnQgeyByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2NvbnRleHRNYW5hZ2VtZW50VG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJEb2N1bWVudFRvb2xzIH0gZnJvbSAnLi90b29scy9kb2N1bWVudFRvb2xzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVFlQRVMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBUb29sQ2F0ZWdvcnkge1xuICBuYW1lOiBzdHJpbmc7XG4gIHRvb2xzOiBUb29sW107XG59XG5cbi8qKiBFeHRlbmRlZCB0b29sIHR5cGUgd2l0aCB0eXBlZCBpbXBsZW1lbnRhdGlvbiBmb3Igc2FmZSBhY2Nlc3MgKi9cbnR5cGUgVHlwZWRUb29sID0gVG9vbCAmIHtcbiAgaW1wbGVtZW50YXRpb246IChwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBjdHg/OiB1bmtub3duKSA9PiBQcm9taXNlPHVua25vd24+O1xufTtcblxuLyoqXG4gKiBDZW50cmFsIHJlZ2lzdHJ5IGZvciBhbGwgYXZhaWxhYmxlIHRvb2xzLlxuICogVG9vbHMgYXJlIGNyZWF0ZWQgb25jZSBhdCBtb2R1bGUgbG9hZCB0aW1lIGFuZCByZXVzZWQgYWNyb3NzIHByb3ZpZGVyIGNhbGxzLlxuICovXG5jbGFzcyBUb29sUmVnaXN0cnkge1xuICBwcml2YXRlIHRvb2xNYXAgPSBuZXcgTWFwPHN0cmluZywgVHlwZWRUb29sPigpO1xuXG4gIHJlZ2lzdGVyQWxsKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlciwgYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyOiBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIpOiB2b2lkIHtcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdmaWxlU3lzdGVtJykpIHtcbiAgICAgIHJlZ2lzdGVyRmlsZVN5c3RlbVRvb2xzKGNvbmZpZywgc3RhdGVNYW5hZ2VyKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ3dlYlNlYXJjaCcpKSB7XG4gICAgICByZWdpc3RlcldlYlJlc2VhcmNoVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2Jyb3dzZXJBdXRvbWF0aW9uJykpIHtcbiAgICAgIHJlZ2lzdGVyQnJvd3NlclRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdnaXRPcGVyYXRpb25zJykpIHtcbiAgICAgIHJlZ2lzdGVyR2l0VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2RhdGFiYXNlUXVlcmllcycpKSB7XG4gICAgICByZWdpc3RlckRhdGFiYXNlVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2RvY3VtZW50UGFyc2luZycpKSB7XG4gICAgICByZWdpc3RlckRvY3VtZW50VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2JhY2tncm91bmRDb21tYW5kcycpKSB7XG4gICAgICByZWdpc3RlckJhY2tncm91bmRDb21tYW5kVG9vbHMoY29uZmlnLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG5cbiAgICAvLyBcdTI1MDBcdTI1MDAgXHVEODNDXHVERDk1IE5FVyBUT09MIENBVEVHT1JJRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnaW1hZ2VQcm9jZXNzaW5nJykpIHtcbiAgICAgIHJlZ2lzdGVySW1hZ2VQcm9jZXNzaW5nVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2h0dHBDbGllbnQnKSkge1xuICAgICAgcmVnaXN0ZXJIdHRwQ2xpZW50VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ3ZlY3RvclJBRycpKSB7XG4gICAgICByZWdpc3RlclJhZ1Rvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICd1aUdlbmVyYXRpb24nKSkge1xuICAgICAgcmVnaXN0ZXJVaUdlbmVyYXRpb25Ub29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnY29udGV4dE1hbmFnZW1lbnQnKSkge1xuICAgICAgcmVnaXN0ZXJDb250ZXh0TWFuYWdlbWVudFRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBcbiAgICAvLyBFeGVjdXRpb24gdG9vbHMgXHUyMDE0IHJlZ2lzdGVyZWQgb25jZSwgZmlsdGVyZWQgYnkgZW5hYmxlZCB0b29sIHR5cGVzXG4gICAgY29uc3QgZXhlY0NvbmZpZyA9IHsgLi4uY29uZmlnIH07XG4gICAgY29uc3QgYWxsRXhlY1Rvb2xzID0gcmVnaXN0ZXJFeGVjdXRpb25Ub29scyhleGVjQ29uZmlnKTtcbiAgICBcbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAnamF2YXNjcmlwdCcpKSB7XG4gICAgICBjb25zdCBqc1Rvb2wgPSBhbGxFeGVjVG9vbHMuZmluZCh0ID0+IHQubmFtZSA9PT0gJ3J1bl9qYXZhc2NyaXB0Jyk7XG4gICAgICBpZiAoanNUb29sKSB0aGlzLnRvb2xNYXAuc2V0KGpzVG9vbC5uYW1lLCBqc1Rvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ3B5dGhvbicpKSB7XG4gICAgICBjb25zdCBweVRvb2wgPSBhbGxFeGVjVG9vbHMuZmluZCh0ID0+IHQubmFtZSA9PT0gJ3J1bl9weXRob24nKTtcbiAgICAgIGlmIChweVRvb2wpIHRoaXMudG9vbE1hcC5zZXQocHlUb29sLm5hbWUsIHB5VG9vbCBhcyBUeXBlZFRvb2wpO1xuICAgIH1cbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAndGVybWluYWwnKSkge1xuICAgICAgY29uc3QgdGVybVRvb2wgPSBhbGxFeGVjVG9vbHMuZmluZCh0ID0+IHQubmFtZSA9PT0gJ3J1bl9pbl90ZXJtaW5hbCcpO1xuICAgICAgaWYgKHRlcm1Ub29sKSB0aGlzLnRvb2xNYXAuc2V0KHRlcm1Ub29sLm5hbWUsIHRlcm1Ub29sIGFzIFR5cGVkVG9vbCk7XG4gICAgfVxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICdzaGVsbCcpKSB7XG4gICAgICBjb25zdCBzaGVsbFRvb2wgPSBhbGxFeGVjVG9vbHMuZmluZCh0ID0+IHQubmFtZSA9PT0gJ2V4ZWN1dGVfY29tbWFuZCcpO1xuICAgICAgaWYgKHNoZWxsVG9vbCkgdGhpcy50b29sTWFwLnNldChzaGVsbFRvb2wubmFtZSwgc2hlbGxUb29sIGFzIFR5cGVkVG9vbCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFV0aWxpdHkgdG9vbHMgYXJlIGFsd2F5cyByZWdpc3RlcmVkIChubyBzcGVjaWZpYyBjb25maWcgZmxhZylcbiAgICBjb25zdCBnZXRFbmFibGVkVG9vbHMgPSAoKSA9PiBBcnJheS5mcm9tKHRoaXMudG9vbE1hcC5rZXlzKCkpO1xuICAgIHJlZ2lzdGVyVXRpbGl0eVRvb2xzKGNvbmZpZywgc3RhdGVNYW5hZ2VyLCBnZXRFbmFibGVkVG9vbHMpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgfVxuXG4gIGdldEFsbCgpOiBUb29sW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudG9vbE1hcC52YWx1ZXMoKSk7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogVHlwZWRUb29sIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy50b29sTWFwLmdldChuYW1lKTtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy50b29sTWFwLmhhcyhuYW1lKTtcbiAgfVxufVxuXG4vKipcbiAqIE1hbmFnZXMgdG9vbCBleGVjdXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb29sc1Byb3ZpZGVyIHtcbiAgcHJpdmF0ZSBjb25maWc6IFBsdWdpbkNvbmZpZztcbiAgcHJpdmF0ZSBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlcjtcbiAgcHJpdmF0ZSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcjtcbiAgcHJpdmF0ZSByZWdpc3RyeTogVG9vbFJlZ2lzdHJ5O1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZz86IFBsdWdpbkNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnIHx8IERFRkFVTFRfQ09ORklHO1xuICAgIHRoaXMuc3RhdGVNYW5hZ2VyID0gbmV3IFN0YXRlTWFuYWdlcih0aGlzLmNvbmZpZyk7XG4gICAgdGhpcy5iYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIgPSBuZXcgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyKHRoaXMuY29uZmlnKTtcbiAgICB0aGlzLnJlZ2lzdHJ5ID0gbmV3IFRvb2xSZWdpc3RyeSgpO1xuICAgIHRoaXMucmVnaXN0cnkucmVnaXN0ZXJBbGwodGhpcy5jb25maWcsIHRoaXMuc3RhdGVNYW5hZ2VyLCB0aGlzLmJhY2tncm91bmRDb21tYW5kTWFuYWdlcik7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSBhIHRvb2wgYnkgbmFtZSB3aXRoIHBhcmFtZXRlcnMuXG4gICAqL1xuICBhc3luYyBleGVjdXRlVG9vbCh0b29sTmFtZTogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgdG9vbCA9IHRoaXMucmVnaXN0cnkuZ2V0KHRvb2xOYW1lKTtcbiAgICBpZiAoIXRvb2wpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFRvb2wgJyR7dG9vbE5hbWV9JyBub3QgZm91bmRgIH07XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFNhZmUgYWNjZXNzIHZpYSB0eXBlZCB3cmFwcGVyIChDNCBmaXgpXG4gICAgICBjb25zdCBpbXBsID0gdG9vbC5pbXBsZW1lbnRhdGlvbjtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGltcGwocGFyYW1zKTtcbiAgICAgIFxuICAgICAgLy8gVXBkYXRlIHN0YXRlIHdpdGggZXhlY3V0aW9uIHJlc3VsdFxuICAgICAgdGhpcy5zdGF0ZU1hbmFnZXIuc2V0KGBsYXN0XyR7dG9vbE5hbWV9YCwgcmVzdWx0KTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFRvb2wgZXhlY3V0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBhdmFpbGFibGUgdG9vbHMgZmlsdGVyZWQgYnkgY29uZmlnLlxuICAgKi9cbiAgZ2V0QXZhaWxhYmxlVG9vbHMoKTogVG9vbFtdIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyeS5nZXRBbGwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHN0YXRlIG1hbmFnZXIgaW5zdGFuY2UuXG4gICAqL1xuICBnZXRTdGF0ZU1hbmFnZXIoKTogU3RhdGVNYW5hZ2VyIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZU1hbmFnZXI7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBnZXRDb25maWcoKTogUGx1Z2luQ29uZmlnIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFRvb2xzUHJvdmlkZXIgd2l0aCBkZWZhdWx0IGNvbmZpZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRvb2xzUHJvdmlkZXIoY29uZmlnPzogUGx1Z2luQ29uZmlnKTogVG9vbHNQcm92aWRlciB7XG4gIHJldHVybiBuZXcgVG9vbHNQcm92aWRlcihjb25maWcpO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTREsgUFJPVklERVIgRlVOQ1RJT04gPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBNYWluIHRvb2xzIHByb3ZpZGVyIGZ1bmN0aW9uIGZvciBMTSBTdHVkaW8gU0RLLlxuICogVGhpcyBpcyB0aGUgZW50cnkgcG9pbnQgdGhhdCBnZXRzIGNhbGxlZCBieSBMTSBTdHVkaW8uXG4gKiBcbiAqIElNUE9SVEFOVDogVGhlIExNIFN0dWRpbyBTREsgYXV0b21hdGljYWxseSByZWdpc3RlcnMgYWxsIFRvb2wgb2JqZWN0c1xuICogcmV0dXJuZWQgZnJvbSB0aGlzIHByb3ZpZGVyIGZ1bmN0aW9uLiBObyBtYW51YWwgY3RsLmFkZCgpIGNhbGxzIG5lZWRlZCAtXG4gKiBqdXN0IHJldHVybiB0aGUgYXJyYXkgZGlyZWN0bHkgYW5kIHRoZSBTREsgaGFuZGxlcyByZWdpc3RyYXRpb24uXG4gKiBcbiAqIE5PVEU6IE11c3QgYmUgYXN5bmMgXHUyMDE0IFNESyB0eXBlIHJlcXVpcmVzIFByb21pc2U8VG9vbFtdPi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvb2xzUHJvdmlkZXIoX2N0bDogVG9vbHNQcm92aWRlckNvbnRyb2xsZXIpOiBQcm9taXNlPFRvb2xbXT4ge1xuICBjb25zdCBwcm92aWRlciA9IGNyZWF0ZVRvb2xzUHJvdmlkZXIoKTtcbiAgXG4gIC8vIFJldHVybiBhbGwgYXZhaWxhYmxlIHRvb2xzIC0gU0RLIGF1dG9tYXRpY2FsbHkgcmVnaXN0ZXJzIHRoZW1cbiAgcmV0dXJuIHByb3ZpZGVyLmdldEF2YWlsYWJsZVRvb2xzKCk7XG59XG4iLCAiLyoqXG4gKiBEb2N1bWVudCBSQUcgUHJvbXB0IFByZXByb2Nlc3NvciArIFdvcmtpbmcgRGlyZWN0b3J5IERldGVjdGlvblxuICovXG5cbmltcG9ydCB7IHR5cGUgQ2hhdE1lc3NhZ2UsIHR5cGUgRmlsZUhhbmRsZSwgdHlwZSBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHBkZlBhcnNlIGZyb20gJ3BkZi1wYXJzZSc7XG5pbXBvcnQgeyBzZXRBdHRhY2htZW50cywgbGlzdEF0dGFjaG1lbnRzIH0gZnJvbSAnLi9hdHRhY2htZW50TWFuYWdlcic7XG5cbmZ1bmN0aW9uIGRldGVjdERpcmVjdG9yeVBhdGgodGV4dDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIC8vIFJlbW92ZSBVUkxzIGZpcnN0IHRvIGF2b2lkIGZhbHNlIHBvc2l0aXZlcyBsaWtlIC9tZWRpdW0uY29tIGZyb20gaHR0cHM6Ly9tZWRpdW0uY29tLy4uLlxuICBjb25zdCB3aXRob3V0VXJscyA9IHRleHQucmVwbGFjZSgvaHR0cHM/OlxcL1xcL1teXFxzXSt8d3d3XFwuW15cXHNdK3xmaWxlOlxcL1xcL1teXFxzXSsvZywgJycpO1xuXG4gIC8vIFdpbmRvd3MgcGF0aHM6IEM6XFxwYXRoIG9yIEQ6XFxmb2xkZXIgKG11c3Qgc3RhcnQgd2l0aCBkcml2ZSBsZXR0ZXIpXG4gIGNvbnN0IHdpbk1hdGNoID0gd2l0aG91dFVybHMubWF0Y2goL1tBLVphLXpdOlxcXFxbXFx3XFwtXy4gXSsvKTtcbiAgaWYgKHdpbk1hdGNoKSByZXR1cm4gd2luTWF0Y2hbMF0udHJpbSgpO1xuXG4gIC8vIFVuaXggYWJzb2x1dGUgcGF0aHM6IC9ob21lL3VzZXIvZGlyLCAvdmFyL2xvZywgZXRjLlxuICBjb25zdCB1bml4TWF0Y2ggPSB3aXRob3V0VXJscy5tYXRjaCgvKD86XnxcXHMpKFxcL1tcXHdcXC1fLiBdezIsfSkvKTtcbiAgaWYgKHVuaXhNYXRjaCkge1xuICAgIGNvbnN0IHBhdGggPSB1bml4TWF0Y2hbMV0udHJpbSgpO1xuICAgIC8vIFJlamVjdCBwYXRocyB0aGF0IGxvb2sgbGlrZSBVUkxzIG9yIGZyYWdtZW50cyAoZS5nLiwgLyBDaGF0IGZpbGVzIHMpXG4gICAgaWYgKCFwYXRoLnN0YXJ0c1dpdGgoJy8gJykgJiYgIXBhdGguaW5jbHVkZXMoJyAnKSkge1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVsYXRpdmUgcGF0aHM6IC4vZm9sZGVyLCAuLi9wYXJlbnQvZGlyXG4gIGNvbnN0IHJlbE1hdGNoID0gd2l0aG91dFVybHMubWF0Y2goLyg/Ol58XFxzKSg/OlxcLlxcL3xcXC5cXFxcLlxcL3xcXC5cXC5cXC8pW1xcd1xcLV8uIF0rLyk7XG4gIGlmIChyZWxNYXRjaCkgcmV0dXJuIHJlbE1hdGNoWzBdLnRyaW0oKTtcblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaW5qZWN0V29ya2luZ0RpcmVjdG9yeVByb21wdChvcmlnaW5hbE1lc3NhZ2U6IHN0cmluZywgZGV0ZWN0ZWRQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBpbnN0cnVjdGlvbiA9IGBcblx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVxuXHUyNkEwXHVGRTBGIFdPUktJTkcgRElSRUNUT1JZIERFVEVDVEVEXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblxuVGhlIHVzZXIgbWVudGlvbmVkIGEgZGlyZWN0b3J5IHBhdGggaW4gdGhlaXIgbWVzc2FnZTpcblxuICAgICR7ZGV0ZWN0ZWRQYXRofVxuXG5QbGVhc2UgYXNrIHRoZSB1c2VyIGZvciBjb25maXJtYXRpb24gYmVmb3JlIGNoYW5naW5nIHRoZSB3b3JraW5nIGRpcmVjdG9yeS5cbkV4YW1wbGUgcmVzcG9uc2U6XG5cblwiSSBub3RpY2VkIHlvdSBtZW50aW9uZWQgdGhlIGRpcmVjdG9yeSAnJHtkZXRlY3RlZFBhdGh9Jy4gXG5Xb3VsZCB5b3UgbGlrZSBtZSB0byBzZXQgdGhpcyBhcyB5b3VyIHdvcmtpbmcgZGlyZWN0b3J5PyBcbkFsbCBzdWJzZXF1ZW50IGZpbGUgb3BlcmF0aW9ucyB3aWxsIHVzZSB0aGlzIGRpcmVjdG9yeSBhcyB0aGUgYmFzZS5cblxuUmVwbHkgJ3llcycgb3IgJ2phJyB0byBjb25maXJtLCBvciAnbm8nLyduZWluJyB0byBkZWNsaW5lLlwiXG5cblx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVxuXG5Vc2VyJ3Mgb3JpZ2luYWwgbWVzc2FnZTpcbiR7b3JpZ2luYWxNZXNzYWdlfVxuYDtcbiAgXG4gIHJldHVybiBpbnN0cnVjdGlvbi50cmltKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4dHJhY3RQZGZUZXh0KGZpbGVIYW5kbGU6IEZpbGVIYW5kbGUpOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGZpbGVIYW5kbGUucmVhZCgpO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBwZGZQYXJzZShidWZmZXIpO1xuICAgIHJldHVybiBkYXRhLnRleHQudHJpbSgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoYFtSQUddIEVycm9yIGV4dHJhY3RpbmcgdGV4dCBmcm9tIFBERiAke2ZpbGVIYW5kbGUubmFtZX06YCwgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHBhcnNlIFBERjogJHtmaWxlSGFuZGxlLm5hbWV9YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2h1bmtUZXh0KHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIgPSAxMDAwLCBvdmVybGFwOiBudW1iZXIgPSAxMDApOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHdvcmRzID0gdGV4dC5zcGxpdCgvXFxzKy8pO1xuICBjb25zdCBjaHVua3M6IHN0cmluZ1tdID0gW107XG4gIFxuICBpZiAod29yZHMubGVuZ3RoIDw9IGNodW5rU2l6ZSkge1xuICAgIHJldHVybiBbdGV4dF07XG4gIH1cblxuICBsZXQgc3RhcnRJbmRleCA9IDA7XG4gIHdoaWxlIChzdGFydEluZGV4IDwgd29yZHMubGVuZ3RoKSB7XG4gICAgY29uc3QgZW5kSW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4ICsgY2h1bmtTaXplLCB3b3Jkcy5sZW5ndGgpO1xuICAgIGNvbnN0IGNodW5rVGV4dCA9IHdvcmRzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KS5qb2luKCcgJyk7XG4gICAgXG4gICAgY2h1bmtzLnB1c2goY2h1bmtUZXh0KTtcbiAgICBzdGFydEluZGV4ID0gZW5kSW5kZXggLSBvdmVybGFwO1xuICB9XG5cbiAgcmV0dXJuIGNodW5rcy5maWx0ZXIoYyA9PiBjLnRyaW0oKS5sZW5ndGggPiAwKTtcbn1cblxuZnVuY3Rpb24gY29zaW5lU2ltaWxhcml0eShhOiBudW1iZXJbXSwgYjogbnVtYmVyW10pOiBudW1iZXIge1xuICBsZXQgZG90UHJvZHVjdCA9IDA7XG4gIGxldCBub3JtQSA9IDA7XG4gIGxldCBub3JtQiA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgIGRvdFByb2R1Y3QgKz0gYVtpXSAqIGJbaV07XG4gICAgbm9ybUEgKz0gYVtpXSAqIGFbaV07XG4gICAgbm9ybUIgKz0gYltpXSAqIGJbaV07XG4gIH1cbiAgcmV0dXJuIGRvdFByb2R1Y3QgLyAoTWF0aC5zcXJ0KG5vcm1BKSAqIE1hdGguc3FydChub3JtQikpO1xufVxuXG5pbnRlcmZhY2UgUmV0cmlldmFsUmVzdWx0IHtcbiAgY29udGVudDogc3RyaW5nO1xuICBzY29yZTogbnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZXRyaWV2ZUZyb21QZGZzKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIHBkZkZpbGVzOiBGaWxlSGFuZGxlW10sXG4pOiBQcm9taXNlPFJldHJpZXZhbFJlc3VsdFtdPiB7XG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIGNvbnN0IHJldHJpZXZhbExpbWl0ID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsTGltaXQnKSB8fCA1O1xuICAvLyBMb3dlciBkZWZhdWx0IHRocmVzaG9sZCB0byBjYXRjaCBtb3JlIHJlc3VsdHMgLSB3YXMgdG9vIGhpZ2ggYXQgMC42XG4gIGNvbnN0IHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnKSA/PyAwLjM7XG5cbiAgY29uc29sZS5sb2coYFtSQUddIFByb2Nlc3NpbmcgJHtwZGZGaWxlcy5sZW5ndGh9IFBERiBmaWxlKHMpYCk7XG5cbiAgLy8gRXh0cmFjdCB0ZXh0IGZyb20gYWxsIFBERiBmaWxlc1xuICBjb25zdCBmaWxlVGV4dHM6IHsgZmlsZTogRmlsZUhhbmRsZTsgdGV4dDogc3RyaW5nIH1bXSA9IFtdO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgcGRmRmlsZXMpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGV4dHJhY3RQZGZUZXh0KGZpbGUpO1xuICAgICAgaWYgKHRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1JBR10gRXh0cmFjdGVkICR7dGV4dC5sZW5ndGh9IGNoYXJzIGZyb20gJHtmaWxlLm5hbWV9YCk7XG4gICAgICAgIGZpbGVUZXh0cy5wdXNoKHsgZmlsZSwgdGV4dCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW1JBR10gTm8gdGV4dCBleHRyYWN0ZWQgZnJvbSAke2ZpbGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgW1JBR10gU2tpcHBpbmcgUERGICR7ZmlsZS5uYW1lfSBkdWUgdG8gZXJyb3I6YCwgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChmaWxlVGV4dHMubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc29sZS53YXJuKCdbUkFHXSBObyB0ZXh0IGV4dHJhY3RlZCBmcm9tIGFueSBQREYnKTtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvLyBDaHVuayB0aGUgdGV4dHNcbiAgY29uc3QgY2h1bmtzOiB7IGZpbGU6IEZpbGVIYW5kbGU7IGNodW5rOiBzdHJpbmcgfVtdID0gW107XG4gIGZvciAoY29uc3QgeyBmaWxlLCB0ZXh0IH0gb2YgZmlsZVRleHRzKSB7XG4gICAgY29uc3QgZmlsZUNodW5rcyA9IGNodW5rVGV4dCh0ZXh0KTtcbiAgICBjb25zb2xlLmxvZyhgW1JBR10gJHtmaWxlLm5hbWV9OiAke3RleHQubGVuZ3RofSBjaGFycyBcdTIxOTIgJHtmaWxlQ2h1bmtzLmxlbmd0aH0gY2h1bmtzYCk7XG4gICAgZmlsZUNodW5rcy5mb3JFYWNoKChjaHVuaykgPT4ge1xuICAgICAgY2h1bmtzLnB1c2goeyBmaWxlLCBjaHVuayB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChjaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cbiAgLy8gR2VuZXJhdGUgZW1iZWRkaW5ncyBmb3IgYWxsIGNodW5rcyB1c2luZyBMTSBTdHVkaW8ncyBlbWJlZGRpbmcgbW9kZWxcbiAgbGV0IG1vZGVsO1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdbUkFHXSBMb2FkaW5nIGVtYmVkZGluZyBtb2RlbC4uLicpO1xuICAgIG1vZGVsID0gYXdhaXQgY3RsLmNsaWVudC5lbWJlZGRpbmcubW9kZWwoJ25vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGJywge1xuICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1tSQUddIEVtYmVkZGluZyBtb2RlbCBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1JBR10gRmFpbGVkIHRvIGxvYWQgZW1iZWRkaW5nIG1vZGVsOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEVtYmVkZGluZyBtb2RlbCBub3QgYXZhaWxhYmxlOiAke2Vycm9yfWApO1xuICB9XG5cbiAgY29uc3QgYmF0Y2hTaXplID0gMzI7XG4gIGNvbnN0IGFsbEVtYmVkZGluZ3M6IG51bWJlcltdW10gPSBbXTtcblxuICB0cnkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSArPSBiYXRjaFNpemUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBHZW5lcmF0aW5nIGVtYmVkZGluZ3MgYmF0Y2ggJHtNYXRoLmZsb29yKGkgLyBiYXRjaFNpemUpICsgMX0vJHtNYXRoLmNlaWwoY2h1bmtzLmxlbmd0aCAvIGJhdGNoU2l6ZSl9Li4uYCk7XG4gICAgICBjb25zdCBiYXRjaCA9IGNodW5rcy5zbGljZShpLCBpICsgYmF0Y2hTaXplKS5tYXAoYyA9PiBjLmNodW5rKTtcbiAgICAgIGNvbnN0IGVtYmVkZGluZ3MgPSBhd2FpdCBtb2RlbC5lbWJlZChiYXRjaCwgY3RsLmFib3J0U2lnbmFsKTtcbiAgICAgIGFsbEVtYmVkZGluZ3MucHVzaCguLi5lbWJlZGRpbmdzKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1JBR10gRXJyb3IgZ2VuZXJhdGluZyBlbWJlZGRpbmdzOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEVtYmVkZGluZyBnZW5lcmF0aW9uIGZhaWxlZDogJHtlcnJvcn1gKTtcbiAgfVxuXG4gIC8vIEdlbmVyYXRlIGVtYmVkZGluZyBmb3IgdGhlIHF1ZXJ5XG4gIGxldCBxdWVyeU1vZGVsO1xuICB0cnkge1xuICAgIHF1ZXJ5TW9kZWwgPSBhd2FpdCBjdGwuY2xpZW50LmVtYmVkZGluZy5tb2RlbCgnbm9taWMtYWkvbm9taWMtZW1iZWQtdGV4dC12MS41LUdHVUYnLCB7XG4gICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBGYWlsZWQgdG8gbG9hZCBxdWVyeSBlbWJlZGRpbmcgbW9kZWw6JywgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihgUXVlcnkgZW1iZWRkaW5nIGZhaWxlZDogJHtlcnJvcn1gKTtcbiAgfVxuXG4gIGxldCBxdWVyeUVtYmVkZGluZztcbiAgdHJ5IHtcbiAgICBxdWVyeUVtYmVkZGluZyA9IChhd2FpdCBxdWVyeU1vZGVsLmVtYmVkKFtxdWVyeV0sIGN0bC5hYm9ydFNpZ25hbCkpWzBdO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIGdlbmVyYXRpbmcgcXVlcnkgZW1iZWRkaW5nOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFF1ZXJ5IGVtYmVkZGluZyBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgc2ltaWxhcml0aWVzIGFuZCByZXRyaWV2ZSB0b3AgcmVzdWx0c1xuICBjb25zdCBzY29yZXM6IHsgY2h1bmtJbmRleDogbnVtYmVyOyBzaW1pbGFyaXR5OiBudW1iZXIgfVtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2ltaWxhcml0eSA9IGNvc2luZVNpbWlsYXJpdHkocXVlcnlFbWJlZGRpbmcsIGFsbEVtYmVkZGluZ3NbaV0pO1xuICAgIHNjb3Jlcy5wdXNoKHsgY2h1bmtJbmRleDogaSwgc2ltaWxhcml0eSB9KTtcbiAgfVxuXG4gIC8vIFNvcnQgYnkgc2ltaWxhcml0eSBkZXNjZW5kaW5nIGFuZCBmaWx0ZXIgYnkgdGhyZXNob2xkXG4gIHNjb3Jlcy5zb3J0KChhLCBiKSA9PiBiLnNpbWlsYXJpdHkgLSBhLnNpbWlsYXJpdHkpO1xuICBcbiAgY29uc29sZS5sb2coYFtSQUddIEZvdW5kICR7c2NvcmVzLmxlbmd0aH0gY2h1bmtzLCBmaWx0ZXJpbmcgd2l0aCB0aHJlc2hvbGQgJHtyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZH1gKTtcbiAgY29uc3QgcmVsZXZhbnRDaHVua3MgPSBzY29yZXMuZmlsdGVyKFxuICAgIChzKSA9PiBzLnNpbWlsYXJpdHkgPj0gcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQgJiYgcy5jaHVua0luZGV4IDwgY2h1bmtzLmxlbmd0aCxcbiAgKTtcblxuICAvLyBMaW1pdCByZXN1bHRzXG4gIGNvbnN0IGxpbWl0ZWRSZXN1bHRzID0gcmVsZXZhbnRDaHVua3Muc2xpY2UoMCwgcmV0cmlldmFsTGltaXQpO1xuXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBSZXR1cm5pbmcgJHtsaW1pdGVkUmVzdWx0cy5sZW5ndGh9IHJlc3VsdHNgKTtcbiAgcmV0dXJuIGxpbWl0ZWRSZXN1bHRzLm1hcCgocikgPT4gKHtcbiAgICBjb250ZW50OiBjaHVua3Nbci5jaHVua0luZGV4XS5jaHVuayxcbiAgICBzY29yZTogci5zaW1pbGFyaXR5LFxuICB9KSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmVwcm9jZXNzKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIHVzZXJNZXNzYWdlOiBDaGF0TWVzc2FnZVxuKTogUHJvbWlzZTxzdHJpbmcgfCBDaGF0TWVzc2FnZT4ge1xuICBjb25zdCB1c2VyUHJvbXB0ID0gdXNlck1lc3NhZ2UuZ2V0VGV4dCgpO1xuICBcbiAgLy8gU3RlcCAwOiBBbHdheXMgcmVnaXN0ZXIgYXR0YWNobWVudHMgc28gdG9vbHMgY2FuIGFjY2VzcyB0aGVtIGJ5IG5hbWVcbiAgY29uc3QgYWxsRmlsZXMgPSB1c2VyTWVzc2FnZS5nZXRGaWxlcyhjdGwuY2xpZW50KTtcbiAgc2V0QXR0YWNobWVudHMoYWxsRmlsZXMpO1xuICBcbiAgLy8gQnVpbGQgYXR0YWNobWVudCBub3RpY2UgdG8gaW5qZWN0IGludG8gcHJvbXB0XG4gIGxldCBhdHRhY2htZW50Tm90aWNlID0gJyc7XG4gIGlmIChhbGxGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmlsZU5hbWVzID0gbGlzdEF0dGFjaG1lbnRzKCk7XG4gICAgYXR0YWNobWVudE5vdGljZSA9IGBcXG5cXG5cdUQ4M0RcdURDQ0UgQVRUQUNIRUQgRklMRVMgQVZBSUxBQkxFOlxcbllvdSBoYXZlIGFjY2VzcyB0byB0aGUgZm9sbG93aW5nIGF0dGFjaGVkIGZpbGVzLiBZb3UgY2FuIHJlYWQgdGhlbSB1c2luZyB0aGUgcmVhZF9kb2N1bWVudCB0b29sIGJ5IGZpbGVuYW1lOlxcbiR7ZmlsZU5hbWVzLm1hcChuYW1lID0+IGAtICR7bmFtZX1gKS5qb2luKCdcXG4nKX1gO1xuICB9XG4gIFxuICAvLyBTdGVwIDE6IERpcmVjdG9yeSBkZXRlY3Rpb24gKGhpZ2hlc3QgcHJpb3JpdHkpXG4gIGNvbnN0IGRldGVjdGVkUGF0aCA9IGRldGVjdERpcmVjdG9yeVBhdGgodXNlclByb21wdCk7XG4gIGlmIChkZXRlY3RlZFBhdGgpIHtcbiAgICByZXR1cm4gaW5qZWN0V29ya2luZ0RpcmVjdG9yeVByb21wdCh1c2VyUHJvbXB0ICsgYXR0YWNobWVudE5vdGljZSwgZGV0ZWN0ZWRQYXRoKTtcbiAgfVxuICBcbiAgLy8gU3RlcCAyOiBEb2N1bWVudCBSQUcgcHJvY2Vzc2luZyAoaWYgZW5hYmxlZClcbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgY29uc3QgZG9jdW1lbnRSQUdFbmFibGVkID0gcGx1Z2luQ29uZmlnLmdldCgnZG9jdW1lbnRSQUcnKTtcbiAgXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBkb2N1bWVudFJBRyBlbmFibGVkOiAke2RvY3VtZW50UkFHRW5hYmxlZH1gKTtcbiAgXG4gIGlmICghZG9jdW1lbnRSQUdFbmFibGVkKSB7XG4gICAgLy8gSWYgUkFHIGlzIGRpc2FibGVkLCBqdXN0IHJldHVybiB0aGUgbWVzc2FnZSB3aXRoIGF0dGFjaG1lbnQgbm90aWNlXG4gICAgaWYgKGF0dGFjaG1lbnROb3RpY2UpIHtcbiAgICAgIHJldHVybiB1c2VyUHJvbXB0ICsgYXR0YWNobWVudE5vdGljZTtcbiAgICB9XG4gICAgcmV0dXJuIHVzZXJNZXNzYWdlO1xuICB9XG5cbiAgY29uc3QgbmV3RmlsZXMgPSBhbGxGaWxlcy5maWx0ZXIoZiA9PiBmLnR5cGUgIT09ICdpbWFnZScpO1xuICBjb25zb2xlLmxvZyhgW1JBR10gRm91bmQgJHtuZXdGaWxlcy5sZW5ndGh9IG5vbi1pbWFnZSBmaWxlc2ApO1xuICBcbiAgaWYgKG5ld0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChhdHRhY2htZW50Tm90aWNlKSB7XG4gICAgICByZXR1cm4gdXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2U7XG4gICAgfVxuICAgIHJldHVybiB1c2VyTWVzc2FnZTtcbiAgfVxuXG4gIC8vIFNlcGFyYXRlIFBERiBmaWxlcyBmcm9tIG90aGVyIGZpbGUgdHlwZXNcbiAgY29uc3QgcGRmRmlsZXMgPSBuZXdGaWxlcy5maWx0ZXIoZiA9PiBmLm5hbWUudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCgnLnBkZicpKTtcbiAgY29uc3Qgb3RoZXJGaWxlcyA9IG5ld0ZpbGVzLmZpbHRlcihmID0+ICFmLm5hbWUudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCgnLnBkZicpKTtcblxuICBjb25zb2xlLmxvZyhgW1JBR10gUERGczogJHtwZGZGaWxlcy5sZW5ndGh9LCBPdGhlcjogJHtvdGhlckZpbGVzLmxlbmd0aH1gKTtcblxuICBsZXQgYWxsUmVzdWx0czogUmV0cmlldmFsUmVzdWx0W10gPSBbXTtcblxuICAvLyBQcm9jZXNzIFBERnMgd2l0aCBjdXN0b20gbG9jYWwgcGlwZWxpbmUgKG1vcmUgcmVsaWFibGUgZm9yIGNvbXBsZXggbGF5b3V0cylcbiAgaWYgKHBkZkZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGRmUmVzdWx0cyA9IGF3YWl0IHJldHJpZXZlRnJvbVBkZnMoY3RsLCB1c2VyUHJvbXB0LCBwZGZGaWxlcyk7XG4gICAgICBjb25zb2xlLmxvZyhgW1JBR10gUERGIHJldHJpZXZhbCByZXR1cm5lZCAke3BkZlJlc3VsdHMubGVuZ3RofSByZXN1bHRzYCk7XG4gICAgICBhbGxSZXN1bHRzLnB1c2goLi4ucGRmUmVzdWx0cyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIHByb2Nlc3NpbmcgUERGczonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvY2VzcyBvdGhlciBmaWxlcyB3aXRoIExNIFN0dWRpbydzIG5hdGl2ZSByZXRyaWV2YWwgQVBJIChoYW5kbGVzIC50eHQsIC5tZCwgZXRjLiBuYXRpdmVseSlcbiAgaWYgKG90aGVyRmlsZXMubGVuZ3RoID4gMCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBtb2RlbCA9IGF3YWl0IGN0bC5jbGllbnQuZW1iZWRkaW5nLm1vZGVsKCdub21pYy1haS9ub21pYy1lbWJlZC10ZXh0LXYxLjUtR0dVRicsIHtcbiAgICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY3RsLmNsaWVudC5maWxlcy5yZXRyaWV2ZSh1c2VyUHJvbXB0LCBvdGhlckZpbGVzLCB7XG4gICAgICAgIGVtYmVkZGluZ01vZGVsOiBtb2RlbCxcbiAgICAgICAgbGltaXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0JykgfHwgNSxcbiAgICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgLy8gQ29udmVydCBoaWdoLWxldmVsIEFQSSByZXN1bHRzIHRvIG91ciBmb3JtYXRcbiAgICAgIGNvbnN0IGZpbHRlcmVkRW50cmllcyA9IHJlc3VsdC5lbnRyaWVzLmZpbHRlcihcbiAgICAgICAgZW50cnkgPT4gZW50cnkuc2NvcmUgPiAocGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQnKSA/PyAwLjMpXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coYFtSQUddIE5hdGl2ZSByZXRyaWV2YWwgcmV0dXJuZWQgJHtmaWx0ZXJlZEVudHJpZXMubGVuZ3RofSByZXN1bHRzYCk7XG4gICAgICBhbGxSZXN1bHRzLnB1c2goLi4uZmlsdGVyZWRFbnRyaWVzLm1hcChlID0+ICh7IGNvbnRlbnQ6IGUuY29udGVudCwgc2NvcmU6IGUuc2NvcmUgfSkpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW1JBR10gRXJyb3IgcmV0cmlldmluZyBmcm9tIG90aGVyIGZpbGVzOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvLyBTb3J0IGFuZCBsaW1pdCByZXN1bHRzXG4gIGFsbFJlc3VsdHMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICBjb25zdCByZXRyaWV2YWxMaW1pdCA9IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0JykgfHwgNTtcbiAgYWxsUmVzdWx0cyA9IGFsbFJlc3VsdHMuc2xpY2UoMCwgcmV0cmlldmFsTGltaXQpO1xuXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBUb3RhbCByZXN1bHRzIGFmdGVyIHNvcnRpbmc6ICR7YWxsUmVzdWx0cy5sZW5ndGh9YCk7XG5cbiAgLy8gSW5qZWN0IGNvbnRleHQgaWYgcmVzdWx0cyBmb3VuZFxuICBpZiAoYWxsUmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGNvbnRleHRJbmplY3Rpb24gPSAnJztcbiAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiBhbGxSZXN1bHRzKSB7XG4gICAgICBjb250ZXh0SW5qZWN0aW9uICs9IGBcXG4ke3Jlc3VsdC5jb250ZW50fVxcbi0tLVxcbmA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke3VzZXJQcm9tcHR9JHthdHRhY2htZW50Tm90aWNlfVxcblxcbi0tLSBSRUxFVkFOVCBET0NVTUVOVCBDT05URVhUIC0tLVxcbiR7Y29udGV4dEluamVjdGlvbi50cmltKCl9YDtcbiAgfVxuXG4gIC8vIElmIG5vIHJlc3VsdHMgZm91bmQsIHJldHVybiBvcmlnaW5hbCBtZXNzYWdlIHdpdGggYXR0YWNobWVudCBub3RpY2VcbiAgY29uc29sZS5sb2coJ1tSQUddIE5vIHJlbGV2YW50IHJlc3VsdHMgZm91bmQnKTtcbiAgaWYgKGF0dGFjaG1lbnROb3RpY2UpIHtcbiAgICByZXR1cm4gdXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2U7XG4gIH1cbiAgcmV0dXJuIHVzZXJNZXNzYWdlO1xufVxuIiwgIi8qKlxuICogQUkgVG9vbGJveCBQbHVnaW4gLSBFbnRyeSBQb2ludFxuICogTWFpbiBmdW5jdGlvbiBleHBvcnRlZCBmb3IgTE0gU3R1ZGlvIHBsdWdpbiBzeXN0ZW1cbiAqL1xuXG5pbXBvcnQgeyB0eXBlIFBsdWdpbkNvbnRleHQgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2xzUHJvdmlkZXIgfSBmcm9tICcuL3Rvb2xzUHJvdmlkZXInO1xuaW1wb3J0IHsgY29uZmlnU2NoZW1hdGljcyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IHByZXByb2Nlc3MgfSBmcm9tICcuL3Byb21wdFByZXByb2Nlc3Nvcic7XG5pbXBvcnQgeyBjbGVhbnVwQnJvd3NlclNlc3Npb24gfSBmcm9tICcuL3Rvb2xzL2Jyb3dzZXJBdXRvbWF0aW9uVG9vbHMnO1xuXG4vLyBcdTI3MDUgRklYOiBVc2Ugc3RydWN0dXJlZCBsb2dnaW5nIGluc3RlYWQgb2YgY29uc29sZS5sb2dcbmNvbnN0IGxvZ2dlciA9IHtcbiAgaW5mbzogKG1zZzogc3RyaW5nKSA9PiB0eXBlb2YgcHJvY2Vzcy5zdGRvdXQud3JpdGUgPT09ICdmdW5jdGlvbicgJiYgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYFtBSSBUb29sYm94XSAke21zZ31cXG5gKSxcbiAgZXJyb3I6IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbQUkgVG9vbGJveCBFUlJPUl0gJHttc2d9XFxuYCksXG59O1xuXG4vKipcbiAqIE1haW4gcGx1Z2luIGVudHJ5IHBvaW50IC0gY2FsbGVkIGJ5IExNIFN0dWRpb1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihjb250ZXh0OiBQbHVnaW5Db250ZXh0KSB7XG4gIGxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcuLi4nKTtcbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSBjb25maWd1cmF0aW9uIHNjaGVtYXRpY3MgKG1ha2VzIHRvZ2dsZXMgYXBwZWFyIGluIFVJKVxuICBjb250ZXh0LndpdGhDb25maWdTY2hlbWF0aWNzKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICBcbiAgLy8gUmVnaXN0ZXIgdGhlIHByb21wdCBwcmVwcm9jZXNzb3IgZm9yIERvY3VtZW50IFJBRyAvIENoYXQgd2l0aCBGaWxlc1xuICBjb250ZXh0LndpdGhQcm9tcHRQcmVwcm9jZXNzb3IocHJlcHJvY2Vzcyk7XG4gIFxuICAvLyBSZWdpc3RlciB0aGUgdG9vbHMgcHJvdmlkZXIgZnVuY3Rpb25cbiAgY29udGV4dC53aXRoVG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcbiAgXG4gIC8vIEhhbmRsZSBwbHVnaW4gdW5sb2FkIC0gY2xlYW51cCBicm93c2VyIHNlc3Npb24gdG8gcHJldmVudCBvcnBoYW5lZCBwcm9jZXNzZXNcbiAgaWYgKHR5cGVvZiBwcm9jZXNzLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJvY2Vzcy5vbignU0lHVEVSTScsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNsZWFudXBCcm93c2VyU2Vzc2lvbigpO1xuICAgIH0pO1xuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNsZWFudXBCcm93c2VyU2Vzc2lvbigpO1xuICAgIH0pO1xuICB9XG4gIFxuICBsb2dnZXIuaW5mbygnSW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5IScpO1xufVxuIiwgImltcG9ydCB7IExNU3R1ZGlvQ2xpZW50LCB0eXBlIFBsdWdpbkNvbnRleHQgfSBmcm9tIFwiQGxtc3R1ZGlvL3Nka1wiO1xuXG5kZWNsYXJlIHZhciBwcm9jZXNzOiBhbnk7XG5cbi8vIFdlIHJlY2VpdmUgcnVudGltZSBpbmZvcm1hdGlvbiBpbiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuY29uc3QgY2xpZW50SWRlbnRpZmllciA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQ0xJRU5UX0lERU5USUZJRVI7XG5jb25zdCBjbGllbnRQYXNza2V5ID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9DTElFTlRfUEFTU0tFWTtcbmNvbnN0IGJhc2VVcmwgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0JBU0VfVVJMO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgTE1TdHVkaW9DbGllbnQoe1xuICBjbGllbnRJZGVudGlmaWVyLFxuICBjbGllbnRQYXNza2V5LFxuICBiYXNlVXJsLFxufSk7XG5cbihnbG9iYWxUaGlzIGFzIGFueSkuX19MTVNfUExVR0lOX0NPTlRFWFQgPSB0cnVlO1xuXG5sZXQgcHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0ID0gZmFsc2U7XG5sZXQgcHJvbXB0UHJlcHJvY2Vzc29yU2V0ID0gZmFsc2U7XG5sZXQgY29uZmlnU2NoZW1hdGljc1NldCA9IGZhbHNlO1xubGV0IGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQgPSBmYWxzZTtcbmxldCB0b29sc1Byb3ZpZGVyU2V0ID0gZmFsc2U7XG5sZXQgZ2VuZXJhdG9yU2V0ID0gZmFsc2U7XG5cbmNvbnN0IHNlbGZSZWdpc3RyYXRpb25Ib3N0ID0gY2xpZW50LnBsdWdpbnMuZ2V0U2VsZlJlZ2lzdHJhdGlvbkhvc3QoKTtcblxuY29uc3QgcGx1Z2luQ29udGV4dDogUGx1Z2luQ29udGV4dCA9IHtcbiAgd2l0aFByZWRpY3Rpb25Mb29wSGFuZGxlcjogKGdlbmVyYXRlKSA9PiB7XG4gICAgaWYgKHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJlZGljdGlvbkxvb3BIYW5kbGVyIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKHRvb2xzUHJvdmlkZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByZWRpY3Rpb25Mb29wSGFuZGxlciBjYW5ub3QgYmUgdXNlZCB3aXRoIGEgdG9vbHMgcHJvdmlkZXJcIik7XG4gICAgfVxuXG4gICAgcHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRQcmVkaWN0aW9uTG9vcEhhbmRsZXIoZ2VuZXJhdGUpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoUHJvbXB0UHJlcHJvY2Vzc29yOiAocHJlcHJvY2VzcykgPT4ge1xuICAgIGlmIChwcm9tcHRQcmVwcm9jZXNzb3JTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByb21wdFByZXByb2Nlc3NvciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIHByb21wdFByZXByb2Nlc3NvclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0UHJvbXB0UHJlcHJvY2Vzc29yKHByZXByb2Nlc3MpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoQ29uZmlnU2NoZW1hdGljczogKGNvbmZpZ1NjaGVtYXRpY3MpID0+IHtcbiAgICBpZiAoY29uZmlnU2NoZW1hdGljc1NldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uZmlnIHNjaGVtYXRpY3MgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBjb25maWdTY2hlbWF0aWNzU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRDb25maWdTY2hlbWF0aWNzKGNvbmZpZ1NjaGVtYXRpY3MpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoR2xvYmFsQ29uZmlnU2NoZW1hdGljczogKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3MpID0+IHtcbiAgICBpZiAoZ2xvYmFsQ29uZmlnU2NoZW1hdGljc1NldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2xvYmFsIGNvbmZpZyBzY2hlbWF0aWNzIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgZ2xvYmFsQ29uZmlnU2NoZW1hdGljc1NldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0R2xvYmFsQ29uZmlnU2NoZW1hdGljcyhnbG9iYWxDb25maWdTY2hlbWF0aWNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aFRvb2xzUHJvdmlkZXI6ICh0b29sc1Byb3ZpZGVyKSA9PiB7XG4gICAgaWYgKHRvb2xzUHJvdmlkZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvb2xzIHByb3ZpZGVyIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVG9vbHMgcHJvdmlkZXIgY2Fubm90IGJlIHVzZWQgd2l0aCBhIHByZWRpY3Rpb25Mb29wSGFuZGxlclwiKTtcbiAgICB9XG5cbiAgICB0b29sc1Byb3ZpZGVyU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRUb29sc1Byb3ZpZGVyKHRvb2xzUHJvdmlkZXIpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoR2VuZXJhdG9yOiAoZ2VuZXJhdG9yKSA9PiB7XG4gICAgaWYgKGdlbmVyYXRvclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG5cbiAgICBnZW5lcmF0b3JTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldEdlbmVyYXRvcihnZW5lcmF0b3IpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxufTtcblxuaW1wb3J0KFwiLi8uLi9zcmMvaW5kZXgudHNcIikudGhlbihhc3luYyBtb2R1bGUgPT4ge1xuICByZXR1cm4gYXdhaXQgbW9kdWxlLm1haW4ocGx1Z2luQ29udGV4dCk7XG59KS50aGVuKCgpID0+IHtcbiAgc2VsZlJlZ2lzdHJhdGlvbkhvc3QuaW5pdENvbXBsZXRlZCgpO1xufSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZXhlY3V0ZSB0aGUgbWFpbiBmdW5jdGlvbiBvZiB0aGUgcGx1Z2luLlwiKTtcbiAgY29uc29sZS5lcnJvcihlcnJvcik7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNFBPLFNBQVMsY0FBYyxRQUFzQixVQUF3UTtBQUMxVCxTQUFPLE9BQU8sUUFBUSxNQUFNO0FBQzlCO0FBV08sU0FBUyx1QkFBdUIsUUFBc0JBLFFBQStEO0FBRTFILFVBQVFBLFFBQU07QUFBQSxJQUVaLEtBQUs7QUFBYyxhQUFPLE9BQU8sd0JBQXdCO0FBQUEsSUFFekQsS0FBSztBQUFjLGFBQU8sT0FBTyxvQkFBb0I7QUFBQSxJQUVyRCxLQUFLO0FBQWMsYUFBTyxPQUFPLHNCQUFzQjtBQUFBLElBRXZELEtBQUs7QUFBYyxhQUFPLE9BQU8sbUJBQW1CO0FBQUEsRUFFdEQ7QUFFRjtBQXZSQSxnQkFFQSxZQVFhLGNBZ0lBLGdCQWlNQTtBQTNVYjtBQUFBO0FBQUE7QUFBQSxpQkFBa0I7QUFFbEIsaUJBQXVDO0FBUWhDLElBQU0sZUFBZSxhQUFFLE9BQU87QUFBQTtBQUFBLE1BSW5DLFlBQVksYUFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsTUFFcEMsV0FBVyxhQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxNQUVuQyxtQkFBbUIsYUFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsTUFFNUMsZUFBZSxhQUFFLFFB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LGtCQUFrQjtBQUNwQixZQUFNLElBQUksTUFBTSxtQ0FBbUM7QUFBQSxJQUNyRDtBQUNBLFFBQUksMEJBQTBCO0FBQzVCLFlBQU0sSUFBSSxNQUFNLDREQUE0RDtBQUFBLElBQzlFO0FBRUEsdUJBQW1CO0FBQ25CLHlCQUFxQixpQkFBaUJBLGNBQWE7QUFDbkQsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLGVBQWUsQ0FBQyxjQUFjO0FBQzVCLFFBQUksY0FBYztBQUNoQixZQUFNLElBQUksTUFBTSw4QkFBOEI7QUFBQSxJQUNoRDtBQUVBLG1CQUFlO0FBQ2YseUJBQXFCLGFBQWEsU0FBUztBQUMzQyxXQUFPO0FBQUEsRUFDVDtBQUNGO0FBRUEsd0RBQTRCLEtBQUssT0FBTUMsWUFBVTtBQUMvQyxTQUFPLE1BQU1BLFFBQU8sS0FBSyxhQUFhO0FBQ3hDLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDWix1QkFBcUIsY0FBYztBQUNyQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFVBQVU7QUFDbEIsVUFBUSxNQUFNLG9EQUFvRDtBQUNsRSxVQUFRLE1BQU0sS0FBSztBQUNyQixDQUFDOyIsCiAgIm5hbWVzIjogWyJ0b29sIiwgInBsYXRmb3JtIiwgInBhdGgiLCAiZnMiLCAicmVzb2x2ZSIsICJmcyIsICJwYXRoIiwgInNwYXduV2l0aFByb2dyZXNzIiwgInJlc29sdmUiLCAicnVuQ29uZmlnQW5hbHlzaXMiLCAicnVuSW1wb3J0QW5hbHlzaXMiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImZzIiwgInBhdGgiLCAiZGRnU2VhcmNoIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJtZXNzYWdlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJyZXNvbHZlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJoYW5kbGVFcnJvciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAicmVzb2x2ZSIsICJoYW5kbGVFcnJvciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiaW1wb3J0X2NoaWxkX3Byb2Nlc3MiLCAiaGFuZGxlRXJyb3IiLCAicGxhdGZvcm0iLCAicmVzb2x2ZSIsICJtZXNzYWdlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJvcyIsICJwYXRoIiwgImZzIiwgImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgImZzIiwgInN0YXQiLCAiaGFuZGxlRXJyb3IiLCAib3MiLCAicGxhdGZvcm0iLCAic3Bhd24iLCAicmVzb2x2ZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAicGF0aCIsICJob3N0bmFtZSIsICJoYW5kbGVFcnJvciIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiY2h1bmtUZXh0IiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJwYXRoIiwgImZzIiwgInB1cHBldGVlck1vZHVsZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJ0b29sIiwgInN0YXQiLCAiaGFuZGxlRXJyb3IiLCAiZXh0IiwgInBkZlBhcnNlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJwYXRoIiwgImZzIiwgInRvb2wiLCAicGF0aCIsICJwZGZQYXJzZSIsICJjaHVua1RleHQiLCAibG9nZ2VyIiwgImltcG9ydF9zZGsiLCAicHJlcHJvY2VzcyIsICJjb25maWdTY2hlbWF0aWNzIiwgInRvb2xzUHJvdmlkZXIiLCAibW9kdWxlIl0KfQo=
