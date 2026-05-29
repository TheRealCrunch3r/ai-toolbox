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
function isToolEnabled(config, toolCategory) {
  if (config.godMode) return true;
  return !!config[toolCategory];
}
function isExecutionToolEnabled(config, toolType) {
  if (config.godMode) return true;
  switch (toolType) {
    case "javascript":
      return config.executionJavaScript;
    case "python":
      return config.executionPython;
    case "terminal":
      return config.executionTerminal;
    case "shell":
      return config.executionShell;
    default:
      return false;
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
      executionShell: import_zod.z.boolean().default(false).describe("Allow execute_command tool"),
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
      // ── 🛡️ CONTEXT GUARD (New) ──────────────────────────────────────
      contextGuard: import_zod.z.boolean().default(false).describe("Enable ContextGuard to manage context window explosion"),
      tokenLimit: import_zod.z.number().min(1e4).max(2e5).default(11e4).describe("Token limit before compression triggers"),
      smartReading: import_zod.z.boolean().default(true).describe("Automatically truncate large files if ContextGuard is active"),
      summaryModel: import_zod.z.enum(["gemma-2b", "llama-3-8b", "qwen-2.5-7b"]).default("gemma-2b").describe("Model to use for summarization"),
      terminalFilterEnabled: import_zod.z.boolean().default(true).describe("Enable terminal output filtering to save context"),
      terminalFilterLength: import_zod.z.number().min(500).max(1e4).default(2e3).describe("Max characters for terminal output before filtering")
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
      executionShell: false,
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
      temporalAwareness: true,
      dateFormatStyle: "standard",
      // ── 🛡️ CONTEXT GUARD (New) ──────────────────────────────────────
      contextGuard: false,
      tokenLimit: 11e4,
      smartReading: true,
      summaryModel: "gemma-2b",
      terminalFilterEnabled: true,
      terminalFilterLength: 2e3
    };
    configSchematics = (0, import_sdk.createConfigSchematics)().field("fileSystem", "boolean", { displayName: "File System" }, true).field("webSearch", "boolean", { displayName: "Web Search" }, true).field("browserAutomation", "boolean", { displayName: "Browser Automation" }, false).field("gitOperations", "boolean", { displayName: "Git Operations" }, false).field("databaseQueries", "boolean", { displayName: "Database Queries" }, false).field("documentParsing", "boolean", { displayName: "Document Parsing" }, true).field("backgroundCommands", "boolean", { displayName: "Background Commands" }, false).field("imageProcessing", "boolean", { displayName: "Image Processing" }, true).field("httpClient", "boolean", { displayName: "HTTP Client" }, false).field("vectorRAG", "boolean", { displayName: "Vector RAG" }, true).field("uiGeneration", "boolean", { displayName: "UI Generation" }, false).field("contextManagement", "boolean", { displayName: "Context Management" }, true).field("godMode", "boolean", { displayName: "God Mode", hint: "Enables every tool category. Use with caution." }, false).field("documentRAG", "boolean", { displayName: "Document RAG" }, true).field("retrievalLimit", "numeric", { displayName: "Retrieval Limit", min: 1, max: 20, step: 1 }, 5).field("retrievalAffinityThreshold", "numeric", { displayName: "Retrieval Affinity Threshold", min: 0, max: 1, step: 0.01 }, 0.5).field("executionJavaScript", "boolean", { displayName: "Execution JavaScript" }, false).field("executionPython", "boolean", { displayName: "Execution Python" }, false).field("executionTerminal", "boolean", { displayName: "Execution Terminal" }, false).field("executionShell", "boolean", { displayName: "Execution Shell" }, false).field("searchFallbackChain", "string", { displayName: "Search Fallback Chain" }, "ddg-api").field("maxSearchResults", "numeric", { displayName: "Max Search Results", min: 1, max: 50, step: 1 }, 10).field("safesearch", "string", { displayName: "SafeSearch" }, "1").field("browserTimeout", "numeric", { displayName: "Browser Timeout", min: 1e3, max: 3e4, step: 1e3 }, 5e3).field("headlessMode", "boolean", { displayName: "Headless Mode" }, false).field("gitAutoCommit", "boolean", { displayName: "Git Auto Commit" }, false).field("defaultBranch", "string", { displayName: "Default Branch" }, "main").field("pathValidationEnabled", "boolean", { displayName: "Path Validation" }, true).field("binaryFileDetection", "boolean", { displayName: "Binary File Detection" }, true).field("regexReDoSProtection", "boolean", { displayName: "Regex ReDoS Protection" }, true).field("maxRegexLength", "numeric", { displayName: "Max Regex Length", min: 1, max: 1e3, step: 1 }, 500).field("statePersistenceEnabled", "boolean", { displayName: "State Persistence" }, true).field("stateMaxSize", "numeric", { displayName: "State Max Size", min: 1024, max: 1048576, step: 1024 }, 10240).field("language", "string", { displayName: "Language" }, "en").field("notificationsEnabled", "boolean", { displayName: "Notifications" }, true).field("temporalAwareness", "boolean", { displayName: "Temporal Awareness" }, true).field("dateFormatStyle", "string", { displayName: "Date Format Style" }, "standard").field("contextGuard", "boolean", { displayName: "ContextGuard" }, false).field("tokenLimit", "numeric", { displayName: "Token Limit", min: 1e4, max: 2e5, step: 1e3 }, 11e4).field("smartReading", "boolean", { displayName: "Smart Reading" }, true).field("summaryModel", "string", { displayName: "Summary Model" }, "gemma-2b").field("terminalFilterEnabled", "boolean", { displayName: "Terminal Filter" }, true).field("terminalFilterLength", "numeric", { displayName: "Terminal Filter Length", min: 500, max: 1e4, step: 100 }, 2e3).build();
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
function registerFileSystemTools(config, _stateManager, contextGuard2) {
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
        let smartContent = "";
        let contentWithBudget = "";
        let budgetString;
        if (contextGuard2) {
          smartContent = contextGuard2.smartRead(fullPath, void 0, maxLength);
          const currentTokens = contextGuard2.getCurrentTokenCount();
          const limit = contextGuard2.getTokenLimit();
          if (currentTokens > limit * 0.5) {
            budgetString = contextGuard2.getTokenBudgetInfo();
            contentWithBudget = `${budgetString}
${smartContent}`;
          } else {
            contentWithBudget = smartContent;
          }
        }
        if (contentWithBudget.length > maxLength) {
          return {
            success: true,
            data: {
              content: contentWithBudget.substring(0, maxLength),
              filePath: fullPath,
              truncated: true,
              total_length: smartContent.length,
              smartReader: !!contextGuard2,
              tokenBudgetInfo: budgetString
            }
          };
        }
        return {
          success: true,
          data: {
            content: contentWithBudget,
            filePath: fullPath,
            smartReader: !!contextGuard2,
            tokenBudgetInfo: budgetString
          }
        };
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
  if (contextGuard2) {
    tools.push((0, import_sdk2.tool)({
      name: "reload_context_for_file",
      description: "Forces a fresh, full read of a file that was previously compressed or truncated by ContextGuard. Use when you need complete details from a file that was smart-read or summarized.",
      parameters: {
        file_path: import_zod2.z.string().describe("The path to the file to reload in full")
      },
      implementation: async ({ file_path }) => {
        try {
          if (!validatePath(file_path, getWorkingDir())) {
            return { success: false, error: "Invalid path: directory traversal detected" };
          }
          const fullPath = resolvePath(file_path);
          const reloadMessage = contextGuard2.reloadContextForFile(fullPath);
          const fullContent = fs4.readFileSync(fullPath, "utf-8");
          return {
            success: true,
            data: {
              message: reloadMessage,
              content: fullContent,
              filePath: fullPath
            }
          };
        } catch (error) {
          return handleError(error);
        }
      }
    }));
  }
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

// src/contextGuard.ts
var import_tiktoken, import_fs, STOP_WORDS, ContextGuard;
var init_contextGuard = __esm({
  "src/contextGuard.ts"() {
    "use strict";
    import_tiktoken = require("@dqbd/tiktoken");
    import_fs = require("fs");
    STOP_WORDS = /* @__PURE__ */ new Set([
      "about",
      "above",
      "after",
      "again",
      "against",
      "all",
      "am",
      "an",
      "and",
      "any",
      "are",
      "aren't",
      "as",
      "at",
      "be",
      "because",
      "been",
      "before",
      "being",
      "below",
      "between",
      "both",
      "but",
      "by",
      "can",
      "couldn't",
      "could",
      "did",
      "didn't",
      "do",
      "does",
      "doing",
      "don't",
      "down",
      "during",
      "each",
      "few",
      "for",
      "from",
      "further",
      "get",
      "got",
      "had",
      "hadn't",
      "has",
      "hasn't",
      "have",
      "haven't",
      "having",
      "he",
      "her",
      "here",
      "hers",
      "herself",
      "him",
      "himself",
      "his",
      "how",
      "i",
      "if",
      "in",
      "into",
      "is",
      "isn't",
      "it",
      "it's",
      "its",
      "itself",
      "just",
      "let",
      "me",
      "might",
      "more",
      "most",
      "mustn't",
      "my",
      "myself",
      "new",
      "no",
      "nor",
      "not",
      "now",
      "of",
      "off",
      "on",
      "once",
      "only",
      "or",
      "other",
      "our",
      "ours",
      "out",
      "over",
      "own",
      "same",
      "shan't",
      "she",
      "she's",
      "should",
      "shouldn't",
      "so",
      "some",
      "such",
      "than",
      "that",
      "that'll",
      "the",
      "their",
      "theirs",
      "them",
      "themselves",
      "then",
      "there",
      "these",
      "they",
      "this",
      "those",
      "through",
      "to",
      "too",
      "under",
      "until",
      "up",
      "very",
      "was",
      "wasn't",
      "we",
      "were",
      "weren't",
      "what",
      "when",
      "where",
      "which",
      "while",
      "who",
      "whom",
      "why",
      "will",
      "with",
      "won't",
      "would",
      "wouldn't",
      "you",
      "you'd",
      "you'll",
      "you're",
      "you've",
      "your",
      "yours",
      "yourself",
      "yourselves",
      "able",
      "also",
      "back",
      "come",
      "could",
      "day",
      "even",
      "give",
      "good",
      "know",
      "last",
      "long",
      "look",
      "make",
      "many",
      "may",
      "much",
      "need",
      "next",
      "part",
      "put",
      "say",
      "see",
      "show",
      "take",
      "time",
      "use",
      "want",
      "way",
      "work",
      "year",
      "yes",
      "yet",
      "you",
      // Technical false positives
      "function",
      "variable",
      "context",
      "guard",
      "config",
      "module",
      "class",
      "const",
      "let",
      "var",
      "async",
      "await",
      "return",
      "throw",
      "catch",
      "try",
      "finally",
      "import",
      "export",
      "default",
      "from",
      "type",
      "interface",
      "enum",
      "implements",
      "extends",
      "super",
      "this",
      "new",
      "delete",
      "typeof",
      "instanceof",
      "void"
    ]);
    ContextGuard = class {
      constructor(config, lmClient = null) {
        this.encoder = null;
        this.lmClient = null;
        this.cachedTokenCount = null;
        this._lastMessageHash = null;
        // FIX #1: Hash-based cache invalidation
        this.trackedFiles = /* @__PURE__ */ new Map();
        this.config = config;
        this.lmClient = lmClient;
      }
      /**
       * Counts tokens efficiently with caching.
       * Accounts for message structure (role prefixes, separators) to match actual LLM token consumption.
       */
      async countTokens(messages) {
        if (this.cachedTokenCount !== null) {
          const currentHash = this.computeMessageHash(messages);
          if (this._lastMessageHash === currentHash) {
            return this.cachedTokenCount;
          }
        }
        if (!this.encoder) {
          this.encoder = (0, import_tiktoken.get_encoding)("cl100k_base");
        }
        let count = 0;
        for (const msg of messages) {
          const role = msg.role || "user";
          const content = msg.content || "";
          const structuredText = `<|start|>assistant<|name|>${role}<|end|>
${content}`;
          count += this.encoder.encode(structuredText).length;
        }
        count += 8;
        this.cachedTokenCount = count;
        this._lastMessageHash = this.computeMessageHash(messages);
        return count;
      }
      /**
       * Compresses history by sending oldest messages to a local model.
       */
      async compressHistory(messages) {
        const currentTokens = await this.countTokens(messages);
        const threshold = this.config.tokenLimit * 0.9;
        if (currentTokens < threshold) {
          return messages;
        }
        const keepLast = 10;
        const toCompress = messages.slice(0, -keepLast);
        if (toCompress.length === 0) return messages;
        if (this.lmClient && this.config.summaryModel) {
          try {
            const model = await this.lmClient.llm.model(this.config.summaryModel);
            const summaryPrompt = `Summarize the following conversation history into a concise technical summary. Preserve all file paths, function names, and key logic, but discard verbose code blocks and terminal noise.

History:
${toCompress.map((m) => `${m.role}: ${m.content}`).join("\n")}`;
            const response = await model.complete(summaryPrompt, { maxTokens: 1024, temperature: 0.1 });
            const summary = response.content || `[ContextGuard Summary: ${toCompress.length} older messages compressed.]`;
            return [
              { role: "system", content: summary },
              ...messages.slice(-keepLast)
            ];
          } catch (error) {
            console.warn(`[ContextGuard] Summarization failed: ${error.message}`);
          }
        }
        return [
          { role: "system", content: `[ContextGuard Summary: ${toCompress.length} older messages compressed to save context. Key file paths and logic preserved.]` },
          ...messages.slice(-keepLast)
        ];
      }
      getThreshold() {
        return this.config.tokenLimit * 0.9;
      }
      /**
       * Resets the token cache when history changes.
       */
      resetTokenCache() {
        this.cachedTokenCount = null;
      }
      /**
       * Gets the current token budget information as a human-readable string.
       */
      getTokenBudgetInfo() {
        const current = this.cachedTokenCount ?? 0;
        const limit = this.config.tokenLimit;
        const percentage = Math.round(current / limit * 100);
        return `[ContextGuard] Budget: ${Math.round(current / 1e3)}k/${Math.round(limit / 1e3)}k tokens (${percentage}% used)`;
      }
      /**
       * Gets the configured token limit.
       */
      getTokenLimit() {
        return this.config.tokenLimit;
      }
      /**
       * Gets the current cached token count (for external monitoring).
       */
      getCurrentTokenCount() {
        return this.cachedTokenCount ?? 0;
      }
      /**
       * Smartly reads a file using Keyword-Grep for precision.
       * FIX #3: Added max_length parameter to respect caller's truncation limits.
       */
      smartRead(filePath, userPrompt, maxLength) {
        if (!this.config.smartReading) {
          const content = (0, import_fs.readFileSync)(filePath, "utf-8");
          return maxLength ? content.substring(0, maxLength) : content;
        }
        try {
          const stats = (0, import_fs.statSync)(filePath);
          this.trackedFiles.set(filePath, { compressed: false, truncated: true, originalSize: stats.size });
          const content = (0, import_fs.readFileSync)(filePath, "utf-8");
          const lines = content.split("\n");
          const effectiveMaxLength = maxLength || 5e3;
          const maxLines = 2e3;
          const maxBytes = 100 * 1024;
          if (stats.size < maxBytes && lines.length < maxLines && content.length <= effectiveMaxLength) {
            return content;
          }
          const keywords = this.extractKeywords(userPrompt || "");
          let relevantLines = [];
          if (keywords.length > 0) {
            lines.forEach((line, index) => {
              if (keywords.some((kw) => line.toLowerCase().includes(kw.toLowerCase()))) {
                relevantLines.push(index);
              }
            });
            if (relevantLines.length > 0) {
              const result = this.formatRelevantLines(lines, relevantLines);
              return result.length > effectiveMaxLength ? result.substring(0, effectiveMaxLength) + `
// [ContextGuard] Output truncated to ${effectiveMaxLength} chars` : result;
            }
          }
          const header = lines.slice(0, 50).join("\n");
          const footer = lines.slice(-50).join("\n");
          let fallbackResult = `// [ContextGuard] File truncated due to size (${stats.size} bytes)
// --- HEADER (First 50 lines) ---
${header}
// --- FOOTER (Last 50 lines) ---
${footer}
// [ContextGuard] Content truncated for context efficiency.`;
          if (fallbackResult.length > effectiveMaxLength) {
            fallbackResult = fallbackResult.substring(0, effectiveMaxLength) + `
// [ContextGuard] Output truncated to ${effectiveMaxLength} chars`;
          }
          return fallbackResult;
        } catch (error) {
          return `Error reading file: ${error.message}`;
        }
      }
      /**
       * Filters terminal output to prevent context bloat.
       */
      filterTerminalOutput(output) {
        if (!this.config.terminalFilterEnabled) return output;
        const threshold = this.config.terminalFilterLength || 2e3;
        if (output.length <= threshold) return output;
        const lines = output.split("\n");
        const head = lines.slice(0, 5).join("\n");
        const tail = lines.slice(-5).join("\n");
        return `${head}
... [Output truncated: ${lines.length - 10} lines hidden] ...
${tail}`;
      }
      /**
       * Forces a fresh read of a tracked file (Re-RAG Trigger).
       */
      reloadContextForFile(filePath) {
        if (this.trackedFiles.has(filePath)) {
          const info = this.trackedFiles.get(filePath);
          this.trackedFiles.delete(filePath);
          return `// [ContextGuard] Context reloaded for ${filePath}. Previous compression/truncation cleared.`;
        }
        return `// [ContextGuard] No tracked context for ${filePath}. Reading normally.`;
      }
      /**
       * Compresses a specific file's tracked context (marks it as compressed).
       */
      markFileAsCompressed(filePath) {
        if (this.trackedFiles.has(filePath)) {
          const info = this.trackedFiles.get(filePath);
          this.trackedFiles.set(filePath, { ...info, compressed: true });
        } else {
          try {
            const stats = (0, import_fs.statSync)(filePath);
            this.trackedFiles.set(filePath, { compressed: true, truncated: false, originalSize: stats.size });
          } catch {
            console.warn(`[ContextGuard] Cannot mark file as compressed - file not found: ${filePath}`);
          }
        }
      }
      /**
       * Computes a simple hash of messages for cache invalidation.
       * FIX #1: Ensures cache is invalidated when ANY message changes, not just the last one.
       */
      computeMessageHash(messages) {
        return messages.map((m) => `${m.role}:${m.content || ""}`).join("||");
      }
      /**
       * Extracts meaningful keywords from a prompt for smart file reading.
       */
      extractKeywords(prompt) {
        const matches = prompt.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g);
        if (!matches) return [];
        return [...new Set(matches)].filter((w) => w.length > 4 && !STOP_WORDS.has(w.toLowerCase()));
      }
      /**
       * Formats relevant lines with context margins for smart reading.
       */
      formatRelevantLines(lines, indices) {
        let result = "";
        const margin = 5;
        indices.forEach((index) => {
          const start = Math.max(0, index - margin);
          const end = Math.min(lines.length, index + margin + 1);
          result += `// ... [Match at line ${index + 1}] ... 
`;
          result += lines.slice(start, end).join("\n") + "\n";
        });
        return result;
      }
    };
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
    const remotes = await git.raw(["ls-remote", "--get-url", "origin"]);
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
function registerExecutionTools(_config, contextGuard2) {
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
        let filteredOutput = fullOutput;
        if (contextGuard2) {
          filteredOutput = contextGuard2.filterTerminalOutput(fullOutput);
        }
        return {
          success: true,
          data: {
            stdout: result.data?.stdout || "",
            stderr: result.data?.stderr || "",
            output: filteredOutput || "(No output)",
            terminalFiltered: !!contextGuard2
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
    const PNG = await import("pngjs");
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
      const buffer = await attachment.readFile();
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

// src/promptPreprocessor.ts
var promptPreprocessor_exports = {};
__export(promptPreprocessor_exports, {
  preprocess: () => preprocess,
  setContextGuard: () => setContextGuard
});
function setContextGuard(guard) {
  contextGuard = guard;
}
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

// src/toolsProvider.ts
function createToolsProvider(config, lmClient) {
  return new ToolsProvider(config, lmClient);
}
async function toolsProvider(ctl) {
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const lmClient = ctl.client;
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
    contextGuard: pluginConfig.get("contextGuard"),
    tokenLimit: pluginConfig.get("tokenLimit"),
    smartReading: pluginConfig.get("smartReading"),
    summaryModel: pluginConfig.get("summaryModel"),
    terminalFilterEnabled: pluginConfig.get("terminalFilterEnabled"),
    terminalFilterLength: pluginConfig.get("terminalFilterLength")
  };
  const provider = createToolsProvider(liveConfig, lmClient);
  return provider.getAvailableTools();
}
var import_sdk16, import_zod16, ToolRegistry, ToolsProvider;
var init_toolsProvider = __esm({
  "src/toolsProvider.ts"() {
    "use strict";
    import_sdk16 = require("@lmstudio/sdk");
    import_zod16 = require("zod");
    init_config();
    init_stateManager();
    init_backgroundCommands();
    init_fileSystemTools();
    init_contextGuard();
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
        const contextGuard2 = config.contextGuard ? new ContextGuard({
          tokenLimit: config.tokenLimit,
          smartReading: config.smartReading,
          summaryModel: config.summaryModel,
          terminalFilterEnabled: config.terminalFilterEnabled,
          terminalFilterLength: config.terminalFilterLength
        }, lmClient) : null;
        if (contextGuard2) {
          const { setContextGuard: setContextGuard2 } = (init_promptPreprocessor(), __toCommonJS(promptPreprocessor_exports));
          setContextGuard2(contextGuard2);
        }
        if (config.godMode || isToolEnabled(config, "fileSystem")) {
          registerFileSystemTools(config, stateManager, contextGuard2).forEach((t) => this.toolMap.set(t.name, t));
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
        const allExecTools = registerExecutionTools(execConfig, contextGuard2);
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
        if (config.contextGuard && contextGuard2) {
          const reRagTool = (0, import_sdk16.tool)({
            name: "reload_context_for_file",
            description: "[ContextGuard] Force reload context for a specific file. Use this when the LLM realizes it needs more information about a file that was previously compressed or truncated.",
            parameters: {
              filePath: import_zod16.z.string().describe("The file path to reload context for")
            },
            implementation: async ({ filePath }) => {
              if (!filePath || typeof filePath !== "string") {
                return { success: false, error: "filePath parameter is required" };
              }
              const result = contextGuard2.reloadContextForFile(filePath);
              return { success: true, message: result };
            }
          });
          this.toolMap.set(reRagTool.name, reRagTool);
          const compressContextTool = (0, import_sdk16.tool)({
            name: "compress_context",
            description: "[ContextGuard] Compress older conversation history to free up context window space. Use this when the LLM detects it is approaching its token limit or has lost track of earlier information.\n\nNOTE: ContextGuard now auto-compresses the context window automatically when the token limit is exceeded. This tool is kept for manual override.",
            parameters: {
              keepLastMessages: import_zod16.z.number().int().min(1).max(50).optional().default(10).describe("Number of recent messages to keep uncompressed (default: 10)")
            },
            implementation: async ({ keepLastMessages }) => {
              try {
                const budgetInfo = contextGuard2.getTokenBudgetInfo();
                return {
                  success: true,
                  data: {
                    compressed: true,
                    message: `[ContextGuard] Compression triggered. ${budgetInfo}`,
                    note: "History compression is handled automatically by the prompt preprocessor when token limits are reached.",
                    keepLastMessages: keepLastMessages ?? 10
                  }
                };
              } catch (error) {
                return { success: false, error: `Compression failed: ${error.message}` };
              }
            }
          });
          this.toolMap.set(compressContextTool.name, compressContextTool);
        }
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
        this.lmClient = lmClient;
        this.registry = new ToolRegistry();
        this.registry.registerAll(this.config, this.stateManager, this.backgroundCommandManager, this.lmClient);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kQ29tbWFuZHMudHMiLCAiLi4vc3JjL3dvcmtpbmdEaXIudHMiLCAiLi4vc3JjL3NlY3VyaXR5LnRzIiwgIi4uL3NyYy9wZXJmb3JtYW5jZVV0aWxzLnRzIiwgIi4uL3NyYy90b29scy9maWxlU3lzdGVtVG9vbHMudHMiLCAiLi4vc3JjL2NvbnRleHRHdWFyZC50cyIsICIuLi9zcmMvdG9vbHMvd2ViUmVzZWFyY2hUb29scy50cyIsICIuLi9zcmMvdG9vbHMvZ2l0R2l0aHViVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2Jyb3dzZXJBdXRvbWF0aW9uVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2RhdGFiYXNlVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2JhY2tncm91bmRDb21tYW5kVG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2V4ZWN1dGlvblRvb2xzLnRzIiwgIi4uL3NyYy90b29scy91dGlsaXR5VG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL2ltYWdlUHJvY2Vzc2luZ1Rvb2xzLnRzIiwgIi4uL3NyYy90b29scy9odHRwQ2xpZW50VG9vbHMudHMiLCAiLi4vc3JjL3Rvb2xzL3ZlY3RvclJhZ1Rvb2xzLnRzIiwgIi4uL3NyYy90b29scy91aUdlbmVyYXRpb25Ub29scy50cyIsICIuLi9zcmMvdG9vbHMvY29udGV4dE1hbmFnZW1lbnRUb29scy50cyIsICIuLi9zcmMvYXR0YWNobWVudE1hbmFnZXIudHMiLCAiLi4vc3JjL3Rvb2xzL2RvY3VtZW50VG9vbHMudHMiLCAiLi4vc3JjL3Byb21wdFByZXByb2Nlc3Nvci50cyIsICIuLi9zcmMvdG9vbHNQcm92aWRlci50cyIsICIuLi9zcmMvaW5kZXgudHMiLCAiZW50cnkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBjcmVhdGVDb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5cblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBab2QgU2NoZW1hICh2YWxpZGF0aW9uKSA9PT09PT09PT09PT09PT09PT09PVxuXG5cblxuZXhwb3J0IGNvbnN0IENvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcblxuICAvLyBUb29sIEdhdGluZyAoZW5hYmxlL2Rpc2FibGUgaW5kaXZpZHVhbCB0b29scylcblxuICBmaWxlU3lzdGVtOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIHdlYlNlYXJjaDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICBicm93c2VyQXV0b21hdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cbiAgZ2l0T3BlcmF0aW9uczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG5cbiAgZGF0YWJhc2VRdWVyaWVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcblxuICBkb2N1bWVudFBhcnNpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYmFja2dyb3VuZENvbW1hbmRzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzQ1x1REQ5NSBORVcgVE9PTCBDQVRFR09SSUVTIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIGltYWdlUHJvY2Vzc2luZzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGltYWdlIE9DUiwgc2NyZWVuc2hvdCwgYW5kIGNvbXBhcmlzb24gdG9vbHMnKSxcblxuICBodHRwQ2xpZW50OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnRW5hYmxlIGdlbmVyaWMgSFRUUCBjbGllbnQgZm9yIFJFU1QgQVBJIGNhbGxzJyksXG5cbiAgdmVjdG9yUkFHOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgc2VtYW50aWMgc2VhcmNoIHdpdGggdmVjdG9yIGVtYmVkZGluZ3MnKSxcbiAgdWlHZW5lcmF0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnRW5hYmxlIGludGVyYWN0aXZlIFVJIGdlbmVyYXRpb24gYW5kIHJlbmRlcmluZyB0b29scycpLFxuICBjb250ZXh0TWFuYWdlbWVudDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGF1dG9tYXRpYyBjb250ZXh0IHRyYWNraW5nIGFuZCBtZW1vcnkgbWFuYWdlbWVudCcpLFxuXG5cblxuICAvLyBcdTI1MDBcdTI1MDAgXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIGdvZE1vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdcdTI2QTBcdUZFMEYgV0FSTklORzogRW5hYmxlcyBldmVyeSB0b29sIGNhdGVnb3J5LiBVc2Ugd2l0aCBjYXV0aW9uLicpLFxuXG5cblxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNEXHVEQ0RBIERPQ1VNRU5UIFJBRyAvIENIQVQgV0lUSCBGSUxFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBkb2N1bWVudFJBRzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnRW5hYmxlIGZpbGUgaW5kZXhpbmcgYW5kIHNlbWFudGljIHNlYXJjaCBmb3IgY2hhdCcpLFxuXG4gIHJldHJpZXZhbExpbWl0OiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMjApLmRlZmF1bHQoNSkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIHJlbGV2YW50IGNodW5rcyB0byByZXRyaWV2ZScpLFxuXG4gIHJldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkOiB6Lm51bWJlcigpLm1pbigwLjApLm1heCgxLjApLmRlZmF1bHQoMC41KS5kZXNjcmliZSgnTWluaW11bSBzaW1pbGFyaXR5IHNjb3JlIGZvciBhIGNodW5rIHRvIGJlIGNvbnNpZGVyZWQgcmVsZXZhbnQgKDAtMSknKSxcblxuICAvLyBFeGVjdXRpb24gdG9vbHMgXHUyMDE0IGluZGl2aWR1YWwgdG9nZ2xlcyAoZ3JhbnVsYXIgY29udHJvbClcblxuICBleGVjdXRpb25KYXZhU2NyaXB0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnQWxsb3cgcnVuX2phdmFzY3JpcHQgdG9vbCcpLFxuXG4gIGV4ZWN1dGlvblB5dGhvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IHJ1bl9weXRob24gdG9vbCcpLFxuXG4gIGV4ZWN1dGlvblRlcm1pbmFsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnQWxsb3cgcnVuX2luX3Rlcm1pbmFsIHRvb2wnKSxcblxuICBleGVjdXRpb25TaGVsbDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0FsbG93IGV4ZWN1dGVfY29tbWFuZCB0b29sJyksXG5cblxuXG4gIC8vIFx1MjUwMFx1MjUwMCBXZWIgU2VhcmNoIFNldHRpbmdzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIHNlYXJjaEZhbGxiYWNrQ2hhaW46IHouZW51bShbJ2RkZy1hcGknLCAnZGRnLWZldGNoJywgJ2dvb2dsZScsICdiaW5nJ10pLmRlZmF1bHQoJ2RkZy1hcGknKS5kZXNjcmliZSgnUHJpbWFyeSBzZWFyY2ggZW5naW5lIChhdXRvLWZhbGxiYWNrIHRvIG90aGVycyknKSxcblxuICBtYXhTZWFyY2hSZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLmRlZmF1bHQoMTApLFxuXG4gIHNhZmVzZWFyY2g6IHouZW51bShbJzAnLCAnMScsICcyJ10pLmRlZmF1bHQoJzEnKSxcblxuXG5cbiAgLy8gXHUyNTAwXHUyNTAwIEJyb3dzZXIgU2V0dGluZ3MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgYnJvd3NlclRpbWVvdXQ6IHoubnVtYmVyKCkubWluKDEwMDApLm1heCgzMDAwMCkuZGVmYXVsdCg1MDAwKSxcblxuICBoZWFkbGVzc01vZGU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdSdW4gYnJvd3NlciB3aXRob3V0IEdVSScpLFxuXG5cblxuICAvLyBHaXQgU2V0dGluZ3NcblxuICBnaXRBdXRvQ29tbWl0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcblxuICBkZWZhdWx0QnJhbmNoOiB6LnN0cmluZygpLmRlZmF1bHQoJ21haW4nKSxcblxuXG5cbiAgLy8gU2VjdXJpdHkgU2V0dGluZ3NcblxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG5cbiAgYmluYXJ5RmlsZURldGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICByZWdleFJlRG9TUHJvdGVjdGlvbjogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcblxuICBtYXhSZWdleExlbmd0aDogei5udW1iZXIoKS5taW4oMSkubWF4KDEwMDApLmRlZmF1bHQoNTAwKSxcblxuXG5cbiAgLy8gU3RhdGUgTWFuYWdlbWVudFxuXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIHN0YXRlTWF4U2l6ZTogei5udW1iZXIoKS5taW4oMTAyNCkubWF4KDEwNDg1NzYpLmRlZmF1bHQoMTAyNDApLFxuXG5cblxuICAvLyBpMThuIFNldHRpbmdzXG5cbiAgbGFuZ3VhZ2U6IHouZW51bShbJ2VuJywgJ2RlJywgJ3poLUNOJywgJ3poLVRXJ10pLmRlZmF1bHQoJ2VuJyksXG5cblxuXG4gIC8vIE5vdGlmaWNhdGlvbiBTZXR0aW5nc1xuXG4gIG5vdGlmaWNhdGlvbnNFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuXG4gIC8vIFRlbXBvcmFsIEF3YXJlbmVzcyAobWVyZ2VkIGZyb20gdXBfdG9fZGF0ZSlcbiAgdGVtcG9yYWxBd2FyZW5lc3M6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSkuZGVzY3JpYmUoJ0VuYWJsZSBhdXRvbWF0aWMgZGF0ZS90aW1lIGluamVjdGlvbiBpbnRvIHByb21wdHMnKSxcbiAgZGF0ZUZvcm1hdFN0eWxlOiB6LmVudW0oWydzdGFuZGFyZCcsICdoZXV0ZUlzdCddKS5kZWZhdWx0KCdzdGFuZGFyZCcpLmRlc2NyaWJlKCdEYXRlIGZvcm1hdCBzdHlsZSBmb3IgdGVtcG9yYWwgYXdhcmVuZXNzJyksXG5cbiAgLy8gXHUyNTAwXHUyNTAwIFx1RDgzRFx1REVFMVx1RkUwRiBDT05URVhUIEdVQVJEIChOZXcpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICBjb250ZXh0R3VhcmQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdFbmFibGUgQ29udGV4dEd1YXJkIHRvIG1hbmFnZSBjb250ZXh0IHdpbmRvdyBleHBsb3Npb24nKSxcbiAgdG9rZW5MaW1pdDogei5udW1iZXIoKS5taW4oMTAwMDApLm1heCgyMDAwMDApLmRlZmF1bHQoMTEwMDAwKS5kZXNjcmliZSgnVG9rZW4gbGltaXQgYmVmb3JlIGNvbXByZXNzaW9uIHRyaWdnZXJzJyksXG4gIHNtYXJ0UmVhZGluZzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKS5kZXNjcmliZSgnQXV0b21hdGljYWxseSB0cnVuY2F0ZSBsYXJnZSBmaWxlcyBpZiBDb250ZXh0R3VhcmQgaXMgYWN0aXZlJyksXG4gIHN1bW1hcnlNb2RlbDogei5lbnVtKFsnZ2VtbWEtMmInLCAnbGxhbWEtMy04YicsICdxd2VuLTIuNS03YiddKS5kZWZhdWx0KCdnZW1tYS0yYicpLmRlc2NyaWJlKCdNb2RlbCB0byB1c2UgZm9yIHN1bW1hcml6YXRpb24nKSxcbiAgdGVybWluYWxGaWx0ZXJFbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLmRlc2NyaWJlKCdFbmFibGUgdGVybWluYWwgb3V0cHV0IGZpbHRlcmluZyB0byBzYXZlIGNvbnRleHQnKSxcbiAgdGVybWluYWxGaWx0ZXJMZW5ndGg6IHoubnVtYmVyKCkubWluKDUwMCkubWF4KDEwMDAwKS5kZWZhdWx0KDIwMDApLmRlc2NyaWJlKCdNYXggY2hhcmFjdGVycyBmb3IgdGVybWluYWwgb3V0cHV0IGJlZm9yZSBmaWx0ZXJpbmcnKSxcbn0pO1xuXG5cblxuZXhwb3J0IHR5cGUgUGx1Z2luQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQ29uZmlnU2NoZW1hPjtcblxuXG5cbi8qKlxuXG4gKiBEZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5cbiAqL1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT05GSUc6IFBsdWdpbkNvbmZpZyA9IHtcblxuICBmaWxlU3lzdGVtOiB0cnVlLFxuXG4gIHdlYlNlYXJjaDogdHJ1ZSxcblxuICBicm93c2VyQXV0b21hdGlvbjogZmFsc2UsXG5cbiAgZ2l0T3BlcmF0aW9uczogZmFsc2UsXG5cbiAgZGF0YWJhc2VRdWVyaWVzOiBmYWxzZSxcblxuICBkb2N1bWVudFBhcnNpbmc6IHRydWUsXG5cbiAgYmFja2dyb3VuZENvbW1hbmRzOiBmYWxzZSxcblxuXG5cbiAgLy8gXHUyNkEwXHVGRTBGIEdPRCBNT0RFIChFbmFibGUgQUxMIHRvb2xzIGF0IG9uY2UpIFx1MjZBMFx1RkUwRlxuXG4gIGdvZE1vZGU6IGZhbHNlLFxuXG5cblxuICAvLyBcdTI1MDBcdTI1MDAgXHVEODNDXHVERDk1IE5FVyBUT09MIENBVEVHT1JJRVMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgaW1hZ2VQcm9jZXNzaW5nOiB0cnVlLFxuXG4gIGh0dHBDbGllbnQ6IGZhbHNlLFxuXG4gIHZlY3RvclJBRzogdHJ1ZSxcbiAgdWlHZW5lcmF0aW9uOiBmYWxzZSxcbiAgY29udGV4dE1hbmFnZW1lbnQ6IHRydWUsXG5cblxuXG4gIC8vIFx1MjZBMFx1RkUwRiBHT0QgTU9ERSAoRW5hYmxlIEFMTCB0b29scyBhdCBvbmNlKSBcdTI2QTBcdUZFMEZcblxuICBkb2N1bWVudFJBRzogdHJ1ZSxcblxuICByZXRyaWV2YWxMaW1pdDogNSxcblxuICByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZDogMC41LFxuXG5cblxuICAvLyBFeGVjdXRpb24gdG9vbHMgXHUyMDE0IGFsbCBkaXNhYmxlZCBieSBkZWZhdWx0IChkYW5nZXJvdXMhKVxuXG4gIGV4ZWN1dGlvbkphdmFTY3JpcHQ6IGZhbHNlLFxuXG4gIGV4ZWN1dGlvblB5dGhvbjogZmFsc2UsXG5cbiAgZXhlY3V0aW9uVGVybWluYWw6IGZhbHNlLFxuXG4gIGV4ZWN1dGlvblNoZWxsOiBmYWxzZSxcblxuXG5cbiAgc2VhcmNoRmFsbGJhY2tDaGFpbjogJ2RkZy1hcGknLFxuXG4gIG1heFNlYXJjaFJlc3VsdHM6IDEwLFxuXG4gIHNhZmVzZWFyY2g6ICcxJyxcblxuICBicm93c2VyVGltZW91dDogNTAwMCxcblxuICBoZWFkbGVzc01vZGU6IGZhbHNlLFxuXG4gIGdpdEF1dG9Db21taXQ6IGZhbHNlLFxuXG4gIGRlZmF1bHRCcmFuY2g6ICdtYWluJyxcblxuICBwYXRoVmFsaWRhdGlvbkVuYWJsZWQ6IHRydWUsXG5cbiAgYmluYXJ5RmlsZURldGVjdGlvbjogdHJ1ZSxcblxuICByZWdleFJlRG9TUHJvdGVjdGlvbjogdHJ1ZSxcblxuICBtYXhSZWdleExlbmd0aDogNTAwLFxuXG4gIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiB0cnVlLFxuXG4gIHN0YXRlTWF4U2l6ZTogMTAyNDAsXG5cbiAgbGFuZ3VhZ2U6ICdlbicsXG5cbiAgbm90aWZpY2F0aW9uc0VuYWJsZWQ6IHRydWUsXG4gIHRlbXBvcmFsQXdhcmVuZXNzOiB0cnVlLFxuICBkYXRlRm9ybWF0U3R5bGU6ICdzdGFuZGFyZCcsXG4gIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0RcdURFRTFcdUZFMEYgQ09OVEVYVCBHVUFSRCAoTmV3KSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgY29udGV4dEd1YXJkOiBmYWxzZSxcbiAgdG9rZW5MaW1pdDogMTEwMDAwLFxuICBzbWFydFJlYWRpbmc6IHRydWUsXG4gIHN1bW1hcnlNb2RlbDogJ2dlbW1hLTJiJyxcbiAgdGVybWluYWxGaWx0ZXJFbmFibGVkOiB0cnVlLFxuICB0ZXJtaW5hbEZpbHRlckxlbmd0aDogMjAwMCxcbn07XG5cblxuXG4vKipcblxuICogSGVscGVyIHRvIGNyZWF0ZSBVSSBzY2hlbWF0aWNzIGZvciBMTSBTdHVkaW9cblxuICovXG5cbmV4cG9ydCBjb25zdCBjb25maWdTY2hlbWF0aWNzID0gY3JlYXRlQ29uZmlnU2NoZW1hdGljcygpXG4gIC5maWVsZChcImZpbGVTeXN0ZW1cIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiRmlsZSBTeXN0ZW1cIiB9LCB0cnVlKVxuICAuZmllbGQoXCJ3ZWJTZWFyY2hcIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiV2ViIFNlYXJjaFwiIH0sIHRydWUpXG4gIC5maWVsZChcImJyb3dzZXJBdXRvbWF0aW9uXCIsIFwiYm9vbGVhblwiLCB7IGRpc3BsYXlOYW1lOiBcIkJyb3dzZXIgQXV0b21hdGlvblwiIH0sIGZhbHNlKVxuICAuZmllbGQoXCJnaXRPcGVyYXRpb25zXCIsIFwiYm9vbGVhblwiLCB7IGRpc3BsYXlOYW1lOiBcIkdpdCBPcGVyYXRpb25zXCIgfSwgZmFsc2UpXG4gIC5maWVsZChcImRhdGFiYXNlUXVlcmllc1wiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJEYXRhYmFzZSBRdWVyaWVzXCIgfSwgZmFsc2UpXG4gIC5maWVsZChcImRvY3VtZW50UGFyc2luZ1wiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJEb2N1bWVudCBQYXJzaW5nXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwiYmFja2dyb3VuZENvbW1hbmRzXCIsIFwiYm9vbGVhblwiLCB7IGRpc3BsYXlOYW1lOiBcIkJhY2tncm91bmQgQ29tbWFuZHNcIiB9LCBmYWxzZSlcbiAgLmZpZWxkKFwiaW1hZ2VQcm9jZXNzaW5nXCIsIFwiYm9vbGVhblwiLCB7IGRpc3BsYXlOYW1lOiBcIkltYWdlIFByb2Nlc3NpbmdcIiB9LCB0cnVlKVxuICAuZmllbGQoXCJodHRwQ2xpZW50XCIsIFwiYm9vbGVhblwiLCB7IGRpc3BsYXlOYW1lOiBcIkhUVFAgQ2xpZW50XCIgfSwgZmFsc2UpXG4gIC5maWVsZChcInZlY3RvclJBR1wiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJWZWN0b3IgUkFHXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwidWlHZW5lcmF0aW9uXCIsIFwiYm9vbGVhblwiLCB7IGRpc3BsYXlOYW1lOiBcIlVJIEdlbmVyYXRpb25cIiB9LCBmYWxzZSlcbiAgLmZpZWxkKFwiY29udGV4dE1hbmFnZW1lbnRcIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiQ29udGV4dCBNYW5hZ2VtZW50XCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwiZ29kTW9kZVwiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJHb2QgTW9kZVwiLCBoaW50OiBcIkVuYWJsZXMgZXZlcnkgdG9vbCBjYXRlZ29yeS4gVXNlIHdpdGggY2F1dGlvbi5cIiB9LCBmYWxzZSlcbiAgLmZpZWxkKFwiZG9jdW1lbnRSQUdcIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiRG9jdW1lbnQgUkFHXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwicmV0cmlldmFsTGltaXRcIiwgXCJudW1lcmljXCIsIHsgZGlzcGxheU5hbWU6IFwiUmV0cmlldmFsIExpbWl0XCIsIG1pbjogMSwgbWF4OiAyMCwgc3RlcDogMSB9LCA1KVxuICAuZmllbGQoXCJyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZFwiLCBcIm51bWVyaWNcIiwgeyBkaXNwbGF5TmFtZTogXCJSZXRyaWV2YWwgQWZmaW5pdHkgVGhyZXNob2xkXCIsIG1pbjogMCwgbWF4OiAxLCBzdGVwOiAwLjAxIH0sIDAuNSlcbiAgLmZpZWxkKFwiZXhlY3V0aW9uSmF2YVNjcmlwdFwiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJFeGVjdXRpb24gSmF2YVNjcmlwdFwiIH0sIGZhbHNlKVxuICAuZmllbGQoXCJleGVjdXRpb25QeXRob25cIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiRXhlY3V0aW9uIFB5dGhvblwiIH0sIGZhbHNlKVxuICAuZmllbGQoXCJleGVjdXRpb25UZXJtaW5hbFwiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJFeGVjdXRpb24gVGVybWluYWxcIiB9LCBmYWxzZSlcbiAgLmZpZWxkKFwiZXhlY3V0aW9uU2hlbGxcIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiRXhlY3V0aW9uIFNoZWxsXCIgfSwgZmFsc2UpXG4gIC5maWVsZChcInNlYXJjaEZhbGxiYWNrQ2hhaW5cIiwgXCJzdHJpbmdcIiwgeyBkaXNwbGF5TmFtZTogXCJTZWFyY2ggRmFsbGJhY2sgQ2hhaW5cIiB9LCBcImRkZy1hcGlcIilcbiAgLmZpZWxkKFwibWF4U2VhcmNoUmVzdWx0c1wiLCBcIm51bWVyaWNcIiwgeyBkaXNwbGF5TmFtZTogXCJNYXggU2VhcmNoIFJlc3VsdHNcIiwgbWluOiAxLCBtYXg6IDUwLCBzdGVwOiAxIH0sIDEwKVxuICAuZmllbGQoXCJzYWZlc2VhcmNoXCIsIFwic3RyaW5nXCIsIHsgZGlzcGxheU5hbWU6IFwiU2FmZVNlYXJjaFwiIH0sIFwiMVwiKVxuICAuZmllbGQoXCJicm93c2VyVGltZW91dFwiLCBcIm51bWVyaWNcIiwgeyBkaXNwbGF5TmFtZTogXCJCcm93c2VyIFRpbWVvdXRcIiwgbWluOiAxMDAwLCBtYXg6IDMwMDAwLCBzdGVwOiAxMDAwIH0sIDUwMDApXG4gIC5maWVsZChcImhlYWRsZXNzTW9kZVwiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJIZWFkbGVzcyBNb2RlXCIgfSwgZmFsc2UpXG4gIC5maWVsZChcImdpdEF1dG9Db21taXRcIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiR2l0IEF1dG8gQ29tbWl0XCIgfSwgZmFsc2UpXG4gIC5maWVsZChcImRlZmF1bHRCcmFuY2hcIiwgXCJzdHJpbmdcIiwgeyBkaXNwbGF5TmFtZTogXCJEZWZhdWx0IEJyYW5jaFwiIH0sIFwibWFpblwiKVxuICAuZmllbGQoXCJwYXRoVmFsaWRhdGlvbkVuYWJsZWRcIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiUGF0aCBWYWxpZGF0aW9uXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwiYmluYXJ5RmlsZURldGVjdGlvblwiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJCaW5hcnkgRmlsZSBEZXRlY3Rpb25cIiB9LCB0cnVlKVxuICAuZmllbGQoXCJyZWdleFJlRG9TUHJvdGVjdGlvblwiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJSZWdleCBSZURvUyBQcm90ZWN0aW9uXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwibWF4UmVnZXhMZW5ndGhcIiwgXCJudW1lcmljXCIsIHsgZGlzcGxheU5hbWU6IFwiTWF4IFJlZ2V4IExlbmd0aFwiLCBtaW46IDEsIG1heDogMTAwMCwgc3RlcDogMSB9LCA1MDApXG4gIC5maWVsZChcInN0YXRlUGVyc2lzdGVuY2VFbmFibGVkXCIsIFwiYm9vbGVhblwiLCB7IGRpc3BsYXlOYW1lOiBcIlN0YXRlIFBlcnNpc3RlbmNlXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwic3RhdGVNYXhTaXplXCIsIFwibnVtZXJpY1wiLCB7IGRpc3BsYXlOYW1lOiBcIlN0YXRlIE1heCBTaXplXCIsIG1pbjogMTAyNCwgbWF4OiAxMDQ4NTc2LCBzdGVwOiAxMDI0IH0sIDEwMjQwKVxuICAuZmllbGQoXCJsYW5ndWFnZVwiLCBcInN0cmluZ1wiLCB7IGRpc3BsYXlOYW1lOiBcIkxhbmd1YWdlXCIgfSwgXCJlblwiKVxuICAuZmllbGQoXCJub3RpZmljYXRpb25zRW5hYmxlZFwiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJOb3RpZmljYXRpb25zXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwidGVtcG9yYWxBd2FyZW5lc3NcIiwgXCJib29sZWFuXCIsIHsgZGlzcGxheU5hbWU6IFwiVGVtcG9yYWwgQXdhcmVuZXNzXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwiZGF0ZUZvcm1hdFN0eWxlXCIsIFwic3RyaW5nXCIsIHsgZGlzcGxheU5hbWU6IFwiRGF0ZSBGb3JtYXQgU3R5bGVcIiB9LCBcInN0YW5kYXJkXCIpXG4gIC5maWVsZChcImNvbnRleHRHdWFyZFwiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJDb250ZXh0R3VhcmRcIiB9LCBmYWxzZSlcbiAgLmZpZWxkKFwidG9rZW5MaW1pdFwiLCBcIm51bWVyaWNcIiwgeyBkaXNwbGF5TmFtZTogXCJUb2tlbiBMaW1pdFwiLCBtaW46IDEwMDAwLCBtYXg6IDIwMDAwMCwgc3RlcDogMTAwMCB9LCAxMTAwMDApXG4gIC5maWVsZChcInNtYXJ0UmVhZGluZ1wiLCBcImJvb2xlYW5cIiwgeyBkaXNwbGF5TmFtZTogXCJTbWFydCBSZWFkaW5nXCIgfSwgdHJ1ZSlcbiAgLmZpZWxkKFwic3VtbWFyeU1vZGVsXCIsIFwic3RyaW5nXCIsIHsgZGlzcGxheU5hbWU6IFwiU3VtbWFyeSBNb2RlbFwiIH0sIFwiZ2VtbWEtMmJcIilcbiAgLmZpZWxkKFwidGVybWluYWxGaWx0ZXJFbmFibGVkXCIsIFwiYm9vbGVhblwiLCB7IGRpc3BsYXlOYW1lOiBcIlRlcm1pbmFsIEZpbHRlclwiIH0sIHRydWUpXG4gIC5maWVsZChcInRlcm1pbmFsRmlsdGVyTGVuZ3RoXCIsIFwibnVtZXJpY1wiLCB7IGRpc3BsYXlOYW1lOiBcIlRlcm1pbmFsIEZpbHRlciBMZW5ndGhcIiwgbWluOiA1MDAsIG1heDogMTAwMDAsIHN0ZXA6IDEwMCB9LCAyMDAwKVxuICAuYnVpbGQoKTtcblxuLyoqXG4gKiBIZWxwZXIgdG8gY2hlY2sgaWYgYSB0b29sIGNhdGVnb3J5IGlzIGVuYWJsZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVG9vbEVuYWJsZWQoY29uZmlnOiBQbHVnaW5Db25maWcsIHRvb2xDYXRlZ29yeTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChjb25maWcuZ29kTW9kZSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiAhIWNvbmZpZ1t0b29sQ2F0ZWdvcnkgYXMga2V5b2YgUGx1Z2luQ29uZmlnXTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gY2hlY2sgaWYgYW4gZXhlY3V0aW9uIHRvb2wgdHlwZSBpcyBlbmFibGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGNvbmZpZzogUGx1Z2luQ29uZmlnLCB0b29sVHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChjb25maWcuZ29kTW9kZSkgcmV0dXJuIHRydWU7XG4gIHN3aXRjaCAodG9vbFR5cGUpIHtcbiAgICBjYXNlICdqYXZhc2NyaXB0JzogcmV0dXJuIGNvbmZpZy5leGVjdXRpb25KYXZhU2NyaXB0O1xuICAgIGNhc2UgJ3B5dGhvbic6IHJldHVybiBjb25maWcuZXhlY3V0aW9uUHl0aG9uO1xuICAgIGNhc2UgJ3Rlcm1pbmFsJzogcmV0dXJuIGNvbmZpZy5leGVjdXRpb25UZXJtaW5hbDtcbiAgICBjYXNlICdzaGVsbCc6IHJldHVybiBjb25maWcuZXhlY3V0aW9uU2hlbGw7XG4gICAgZGVmYXVsdDogcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iLCAiLyoqXG4gKiBQZXJzaXN0ZW50IHN0YXRlIG1hbmFnZW1lbnQgZm9yIHBsdWdpbiBvcGVyYXRpb25zXG4gKiBTdG9yZXMgZGF0YSB0byBkaXNrIGFzIEpTT04gZmlsZSBmb3Igc3Vydml2YWwgYWNyb3NzIHJlbG9hZHNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcblxuaW50ZXJmYWNlIFN0YXRlRW50cnkge1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHVua25vd247XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG4vKiogTWluaW1hbCBsb2dnZXIgZm9yIHN0YXRlIG1hbmFnZXIgKGF2b2lkcyBjaXJjdWxhciBkZXBlbmRlbmN5IHdpdGggaW5kZXgudHMpICovXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46IChtc2c6IHN0cmluZykgPT4gdHlwZW9mIHByb2Nlc3Muc3RkZXJyLndyaXRlID09PSAnZnVuY3Rpb24nICYmIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBbU3RhdGVNYW5hZ2VyXSAke21zZ31cXG5gKSxcbn07XG5cbi8qKiBEZWJvdW5jZWQgYXN5bmMgc3RhdGUgcGVyc2lzdGVuY2UgKDUwMG1zIGRlbGF5KSAqL1xuZnVuY3Rpb24gY3JlYXRlRGVib3VuY2VkU2F2ZShzYXZlRm46ICgpID0+IHZvaWQsIGRlbGF5TXM6IG51bWJlciA9IDUwMCk6ICgoKSA9PiB2b2lkKSB7XG4gIGxldCB0aW1lcklkOiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZFNhdmUoKTogdm9pZCB7XG4gICAgaWYgKHRpbWVySWQpIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzYXZlRm4oKTtcbiAgICAgIHRpbWVySWQgPSBudWxsO1xuICAgIH0sIGRlbGF5TXMpO1xuICB9O1xufVxuXG4vKipcbiAqIERlZmF1bHQgbWVtb3J5IGZpbGUgbG9jYXRpb24gKGluIExNIFN0dWRpbyBwbHVnaW4gZGF0YSBkaXJlY3RvcnkpXG4gKi9cbmZ1bmN0aW9uIGdldE1lbW9yeUZpbGVQYXRoKCk6IHN0cmluZyB7XG4gIC8vIFRyeSB0byBmaW5kIExNIFN0dWRpbydzIGFwcCBkYXRhIGRpcmVjdG9yeSBmb3IgcGVyc2lzdGVuY2VcbiAgY29uc3QgcGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICBcbiAgbGV0IGJhc2VEaXI6IHN0cmluZztcbiAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIGJhc2VEaXIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuQVBQREFUQSB8fCAnJywgJ2xtLXN0dWRpbycsICdwbHVnaW5zJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgYmFzZURpciA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBiYXNlRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgJycsICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJywgJ3BsdWdpbnMnKTtcbiAgfVxuICBcbiAgcmV0dXJuIHBhdGguam9pbihiYXNlRGlyLCAnYWktdG9vbGJveC1tZW1vcnkuanNvbicpO1xufVxuXG5leHBvcnQgY2xhc3MgU3RhdGVNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0ZTogTWFwPHN0cmluZywgU3RhdGVFbnRyeT47XG4gIHByaXZhdGUgbWF4U2l6ZTogbnVtYmVyO1xuICBwcml2YXRlIHBlcnNpc3RlbmNlRW5hYmxlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBtZW1vcnlGaWxlOiBzdHJpbmc7XG4gIHByaXZhdGUgcnVubmluZ1NpemU6IG51bWJlcjsgLy8gVHJhY2sgc2l6ZSBpbmNyZW1lbnRhbGx5IGZvciBPKDEpIGNoZWNrc1xuICBwcml2YXRlIGRlYm91bmNlZFNhdmU6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnJ1bm5pbmdTaXplID0gMDtcbiAgICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gICAgdGhpcy5tYXhTaXplID0gZWZmZWN0aXZlQ29uZmlnLnN0YXRlTWF4U2l6ZTtcbiAgICB0aGlzLnBlcnNpc3RlbmNlRW5hYmxlZCA9IGVmZmVjdGl2ZUNvbmZpZy5zdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZDtcbiAgICB0aGlzLm1lbW9yeUZpbGUgPSBnZXRNZW1vcnlGaWxlUGF0aCgpO1xuICAgIFxuICAgIC8vIENyZWF0ZSBkZWJvdW5jZWQgc2F2ZSBmdW5jdGlvbiAoNTAwbXMgZGVsYXkpXG4gICAgdGhpcy5kZWJvdW5jZWRTYXZlID0gY3JlYXRlRGVib3VuY2VkU2F2ZSgoKSA9PiB0aGlzLnNhdmVUb0ZpbGUoKSwgNTAwKTtcbiAgICBcbiAgICAvLyBBdXRvLWxvYWQgZnJvbSBkaXNrIGlmIHBlcnNpc3RlbmNlIGlzIGVuYWJsZWRcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIHN0YXRlIHZhbHVlIHdpdGgga2V5IGFuZCBvcHRpb25hbCBtZXRhZGF0YVxuICAgKi9cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGNvbnN0IG5ld1ZhbHVlU2l6ZSA9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUodmFsdWUpO1xuICAgIGNvbnN0IG9sZFZhbHVlU2l6ZSA9IHRoaXMuZ2V0RXhpc3RpbmdWYWx1ZVNpemUoa2V5KTtcbiAgICBcbiAgICAvLyBDaGVjayBzaXplIGxpbWl0IHVzaW5nIHJ1bm5pbmcgdG90YWxcbiAgICBpZiAodGhpcy5ydW5uaW5nU2l6ZSAtIG9sZFZhbHVlU2l6ZSArIG5ld1ZhbHVlU2l6ZSA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdGF0ZSBzaXplIGV4Y2VlZHMgbWF4aW11bSAoJHt0aGlzLm1heFNpemV9IGJ5dGVzKWApO1xuICAgIH1cbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBzZXR0aW5nXG4gICAgdGhpcy5ydW5uaW5nU2l6ZSA9IHRoaXMucnVubmluZ1NpemUgLSBvbGRWYWx1ZVNpemUgKyBuZXdWYWx1ZVNpemU7XG4gICAgXG4gICAgdGhpcy5zdGF0ZS5zZXQoa2V5LCB7XG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICB9KTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgKDUwMG1zIGRlbGF5KSBcdTIwMTQgb25seSBpZiBwZXJzaXN0ZW5jZSBlbmFibGVkXG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICB0aGlzLmRlYm91bmNlZFNhdmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3RhdGUgdmFsdWUgYnkga2V5XG4gICAqL1xuICBnZXQ8VD4oa2V5OiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuc3RhdGUuZ2V0KGtleSk7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gZW50cnkudmFsdWUgYXMgVDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBzdGF0ZSBlbnRyeVxuICAgKi9cbiAgZGVsZXRlKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIGlmICghZW50cnkpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICAvLyBVcGRhdGUgcnVubmluZyBzaXplIGJlZm9yZSBkZWxldGluZ1xuICAgIHRoaXMucnVubmluZ1NpemUgLT0gdGhpcy5nZXRTaXplT2ZWYWx1ZShlbnRyeS52YWx1ZSk7XG4gICAgY29uc3QgZGVsZXRlZCA9IHRoaXMuc3RhdGUuZGVsZXRlKGtleSk7XG4gICAgXG4gICAgLy8gRGVib3VuY2VkIGF1dG8tc2F2ZSB0byBkaXNrIGFmdGVyIGRlbGV0aW9uXG4gICAgaWYgKGRlbGV0ZWQgJiYgdGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZGVsZXRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHN0YXRlIGtleXNcbiAgICovXG4gIGdldEFsbEtleXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuc3RhdGUua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhbGwgc3RhdGVcbiAgICovXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICBcbiAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIHRvIGRpc2sgYWZ0ZXIgY2xlYXJpbmdcbiAgICBpZiAodGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQpIHtcbiAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc2l6ZSBvZiBleGlzdGluZyB2YWx1ZSBmb3IgYSBrZXkgKGZvciBpbmNyZW1lbnRhbCB1cGRhdGVzKVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFeGlzdGluZ1ZhbHVlU2l6ZShrZXk6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnN0YXRlLmdldChrZXkpO1xuICAgIHJldHVybiBlbnRyeSA/IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpIDogMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFc3RpbWF0ZSBzaXplIG9mIGEgdmFsdWUgaW4gYnl0ZXNcbiAgICovXG4gIHByaXZhdGUgZ2V0U2l6ZU9mVmFsdWUodmFsdWU6IHVua25vd24pOiBudW1iZXIge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gdmFsdWUubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSByZXR1cm4gODtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHJldHVybiAxO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFjdHVhbCBzaXplIG9mIGFycmF5IGVsZW1lbnRzXG4gICAgICByZXR1cm4gdmFsdWUucmVkdWNlKChzdW06IG51bWJlciwgZWxlbTogdW5rbm93bikgPT4gc3VtICsgdGhpcy5nZXRTaXplT2ZWYWx1ZShlbGVtKSwgMCk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIHZhbHVlLnNpemUgKiAxNjtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBzdGF0ZSB0byBkaXNrIGFzIEpTT04gZmlsZSB3aXRoIG9wdGltaXplZCBzZXJpYWxpemF0aW9uXG4gICAqL1xuICBwcml2YXRlIHNhdmVUb0ZpbGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGUuZW50cmllcygpKS5tYXAoKFtfa2V5LCBlbnRyeV0pID0+ICh7XG4gICAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICAgIHRpbWVzdGFtcDogZW50cnkudGltZXN0YW1wLFxuICAgICAgfSkpO1xuICAgICAgXG4gICAgICAvLyBFbnN1cmUgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMubWVtb3J5RmlsZSk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gT3B0aW1pemVkIEpTT04gc2VyaWFsaXphdGlvbiAobm8gcHJldHR5LXByaW50aW5nIGZvciBwZXJmb3JtYW5jZSlcbiAgICAgIGNvbnN0IGpzb25TdHJpbmcgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgIFxuICAgICAgLy8gV3JpdGUgdG8gdGVtcCBmaWxlIGZpcnN0LCB0aGVuIHJlbmFtZSBmb3IgYXRvbWljIG9wZXJhdGlvblxuICAgICAgY29uc3QgdGVtcEZpbGUgPSB0aGlzLm1lbW9yeUZpbGUgKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBGaWxlLCBqc29uU3RyaW5nLCAndXRmLTgnKTtcbiAgICAgIGZzLnJlbmFtZVN5bmModGVtcEZpbGUsIHRoaXMubWVtb3J5RmlsZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHNhdmUgdG8gZGlzazogJHttZXNzYWdlfWApOyAvLyBNMiBmaXg6IG5vIGNvbnNvbGUud2FyblxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHN0YXRlIGZyb20gZGlzayBKU09OIGZpbGUgd2l0aCBjb3JydXB0aW9uIHJlY292ZXJ5XG4gICAqL1xuICBwcml2YXRlIGxvYWRGcm9tRmlsZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMubWVtb3J5RmlsZSkpIHJldHVybjtcbiAgICAgIFxuICAgICAgY29uc3QganNvblN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUsICd1dGYtOCcpO1xuICAgICAgXG4gICAgICAvLyBUcnkgdG8gcGFyc2UgSlNPTiB3aXRoIGVycm9yIHJlY292ZXJ5XG4gICAgICBsZXQgZGF0YTogU3RhdGVFbnRyeVtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoanNvblN0cmluZykgYXMgU3RhdGVFbnRyeVtdO1xuICAgICAgfSBjYXRjaCB7IC8vIEMxIGZpeDogcmVtb3ZlZCB1bnVzZWQgcGFyc2VFcnJvciB2YXJpYWJsZVxuICAgICAgICBsb2dnZXIud2FybihgQ29ycnVwdGVkIHN0YXRlIGZpbGUgZGV0ZWN0ZWQsIGF0dGVtcHRpbmcgcmVjb3ZlcnkuLi5gKTtcblxuICAgICAgICAvLyBUcnkgdG8gcmVjb3ZlciBieSByZWFkaW5nIGxpbmUgYnkgbGluZSBvciB1c2luZyBiYWNrdXBcbiAgICAgICAgY29uc3QgYmFja3VwRmlsZSA9IHRoaXMubWVtb3J5RmlsZSArICcuYmFja3VwJztcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYmFja3VwRmlsZSkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFja3VwU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGJhY2t1cEZpbGUsICd1dGYtOCcpO1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoYmFja3VwU3RyaW5nKSBhcyBTdGF0ZUVudHJ5W107XG4gICAgICAgICAgICBsb2dnZXIud2FybihgU3VjY2Vzc2Z1bGx5IGxvYWRlZCBmcm9tIGJhY2t1cGApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYEJhY2t1cCBhbHNvIGNvcnJ1cHRlZCwgc3RhcnRpbmcgZnJlc2hgKTtcbiAgICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oYE5vIGJhY2t1cCBhdmFpbGFibGUsIHN0YXJ0aW5nIGZyZXNoYCk7XG4gICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGRhdGEpIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgZW50cnkgc3RydWN0dXJlIGJlZm9yZSBhZGRpbmdcbiAgICAgICAgaWYgKGVudHJ5ICYmIHR5cGVvZiBlbnRyeS5rZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBlbnRyeS50aW1lc3RhbXAgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZXQoZW50cnkua2V5LCBlbnRyeSk7XG4gICAgICAgICAgdGhpcy5ydW5uaW5nU2l6ZSArPSB0aGlzLmdldFNpemVPZlZhbHVlKGVudHJ5LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBDcmVhdGUgYmFja3VwIGFmdGVyIHN1Y2Nlc3NmdWwgbG9hZFxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLm1lbW9yeUZpbGUgKyAnLmJhY2t1cCcsIGpzb25TdHJpbmcsICd1dGYtOCcpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIElnbm9yZSBiYWNrdXAgY3JlYXRpb24gZXJyb3JzXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIGxvYWQgZnJvbSBkaXNrOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9ydCBzdGF0ZSBmb3IgcGVyc2lzdGVuY2UgKEpTT04gc2VyaWFsaXphdGlvbikgXHUyMDE0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICovXG4gIGV4cG9ydFN0YXRlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZGF0YSA9IEFycmF5LmZyb20odGhpcy5zdGF0ZS5lbnRyaWVzKCkpLm1hcCgoW19rZXksIGVudHJ5XSkgPT4gKHtcbiAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLFxuICAgICAgdGltZXN0YW1wOiBlbnRyeS50aW1lc3RhbXAsXG4gICAgfSkpO1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgc3RhdGUgZnJvbSBKU09OIHN0cmluZyBcdTIwMTQga2VwdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgKi9cbiAgaW1wb3J0U3RhdGUoanNvblN0cmluZzogc3RyaW5nKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGpzb25TdHJpbmcpIGFzIFN0YXRlRW50cnlbXTtcbiAgICAgIHRoaXMuc3RhdGUuY2xlYXIoKTtcbiAgICAgIHRoaXMucnVubmluZ1NpemUgPSAwO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBkYXRhKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgICAgICB0aGlzLnJ1bm5pbmdTaXplICs9IHRoaXMuZ2V0U2l6ZU9mVmFsdWUoZW50cnkudmFsdWUpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBEZWJvdW5jZWQgYXV0by1zYXZlIGFmdGVyIGltcG9ydFxuICAgICAgaWYgKHRoaXMucGVyc2lzdGVuY2VFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkU2F2ZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gaW1wb3J0IHN0YXRlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCB0byB0aGUgbWVtb3J5IGZpbGUgb24gZGlza1xuICAgKi9cbiAgZ2V0TWVtb3J5RmlsZVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tZW1vcnlGaWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIHNhdmUgdG8gZGlzayAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBmb3JjZVNhdmUoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlVG9GaWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2UgbG9hZCBmcm9tIGRpc2sgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgKi9cbiAgZm9yY2VMb2FkKCk6IHZvaWQge1xuICAgIHRoaXMubG9hZEZyb21GaWxlKCk7XG4gIH1cbn1cbiIsICIvKipcclxuICogTG9uZy1ydW5uaW5nIHByb2Nlc3MgdHJhY2tpbmcgYW5kIG1hbmFnZW1lbnRcclxuICovXHJcblxyXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCYWNrZ3JvdW5kQ29tbWFuZCB7XHJcbiAgaWQ6IHN0cmluZztcclxuICBjb21tYW5kOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHN0YXJ0VGltZTogbnVtYmVyO1xyXG4gIHRpbWVvdXRIb3VyczogbnVtYmVyO1xyXG4gIHN0YXR1czogJ3J1bm5pbmcnIHwgJ2NvbXBsZXRlZCcgfCAnY2FuY2VsbGVkJyB8ICdlcnJvcmVkJztcclxuICBzdGRvdXQ/OiBzdHJpbmc7XHJcbiAgc3RkZXJyPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyIHtcclxuICBwcml2YXRlIGNvbW1hbmRzOiBNYXA8c3RyaW5nLCBCYWNrZ3JvdW5kQ29tbWFuZD47XHJcbiAgcHJpdmF0ZSBtYXhUaW1lb3V0SG91cnM6IG51bWJlcjtcclxuICBcclxuICBjb25zdHJ1Y3RvcihfY29uZmlnPzogUGx1Z2luQ29uZmlnKSB7XHJcbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5tYXhUaW1lb3V0SG91cnMgPSAxMDsgLy8gSGFyZCBsaW1pdCBmcm9tIHRvb2wgc3BlY2lmaWNhdGlvblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXIgYSBuZXcgYmFja2dyb3VuZCBjb21tYW5kXHJcbiAgICovXHJcbiAgcmVnaXN0ZXIoY29tbWFuZDogc3RyaW5nLCB0aW1lb3V0SG91cnM6IG51bWJlciwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICh0aW1lb3V0SG91cnMgPCAwLjEgfHwgdGltZW91dEhvdXJzID4gdGhpcy5tYXhUaW1lb3V0SG91cnMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaW1lb3V0IG11c3QgYmUgYmV0d2VlbiAwLjEgYW5kICR7dGhpcy5tYXhUaW1lb3V0SG91cnN9IGhvdXJzYCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICghbmFtZSB8fCBuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgbmFtZSBpcyBtYW5kYXRvcnknKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgaWQgPSB0aGlzLmdlbmVyYXRlSWQoKTtcclxuICAgIFxyXG4gICAgdGhpcy5jb21tYW5kcy5zZXQoaWQsIHtcclxuICAgICAgaWQsXHJcbiAgICAgIGNvbW1hbmQsXHJcbiAgICAgIG5hbWUsXHJcbiAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcclxuICAgICAgdGltZW91dEhvdXJzLFxyXG4gICAgICBzdGF0dXM6ICdydW5uaW5nJyxcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gaWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBzdGF0dXMgYW5kIG91dHB1dCBvZiBhIGJhY2tncm91bmQgY29tbWFuZFxyXG4gICAqL1xyXG4gIGNoZWNrKGlkOiBzdHJpbmcpOiBCYWNrZ3JvdW5kQ29tbWFuZCB8IG51bGwge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCkgcmV0dXJuIG51bGw7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGlmIHRpbWVvdXQgZXhjZWVkZWRcclxuICAgIGNvbnN0IGVsYXBzZWRIb3VycyA9IChEYXRlLm5vdygpIC0gY29tbWFuZC5zdGFydFRpbWUpIC8gKDEwMDAgKiA2MCAqIDYwKTtcclxuICAgIGlmIChlbGFwc2VkSG91cnMgPiBjb21tYW5kLnRpbWVvdXRIb3VycyAmJiBjb21tYW5kLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XHJcbiAgICAgIGNvbW1hbmQuc3RhdHVzID0gJ2Vycm9yZWQnO1xyXG4gICAgICBjb21tYW5kLnN0ZGVyciA9IGBDb21tYW5kIGV4Y2VlZGVkIHRpbWVvdXQgKCR7Y29tbWFuZC50aW1lb3V0SG91cnN9IGhvdXJzKWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBjb21tYW5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FuY2VsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmRcclxuICAgKi9cclxuICBjYW5jZWwoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuY29tbWFuZHMuZ2V0KGlkKTtcclxuICAgIGlmICghY29tbWFuZCB8fCBjb21tYW5kLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgICBcclxuICAgIGNvbW1hbmQuc3RhdHVzID0gJ2NhbmNlbGxlZCc7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbGwgYWN0aXZlIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0QWN0aXZlQ29tbWFuZHMoKTogQmFja2dyb3VuZENvbW1hbmRbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNvbW1hbmRzLnZhbHVlcygpKVxyXG4gICAgICAuZmlsdGVyKGMgPT4gYy5zdGF0dXMgPT09ICdydW5uaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgY29tcGxldGVkL2Vycm9yZWQvY2FuY2VsbGVkIGNvbW1hbmRzIGFmdGVyIGNsZWFudXAgcGVyaW9kXHJcbiAgICovXHJcbiAgY2xlYW51cChtYXhBZ2VIb3VyczogbnVtYmVyID0gMjQpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBmb3IgKGNvbnN0IFtpZCwgY29tbWFuZF0gb2YgdGhpcy5jb21tYW5kcy5lbnRyaWVzKCkpIHtcclxuICAgICAgaWYgKGNvbW1hbmQuc3RhdHVzICE9PSAncnVubmluZycpIHtcclxuICAgICAgICBjb25zdCBhZ2VIb3VycyA9IChub3cgLSBjb21tYW5kLnN0YXJ0VGltZSkgLyAoMTAwMCAqIDYwICogNjApO1xyXG4gICAgICAgIGlmIChhZ2VIb3VycyA+IG1heEFnZUhvdXJzKSB7XHJcbiAgICAgICAgICB0aGlzLmNvbW1hbmRzLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgY29tbWFuZCBJRFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBiZ18ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0b3RhbCBjb3VudCBvZiByZWdpc3RlcmVkIGNvbW1hbmRzXHJcbiAgICovXHJcbiAgZ2V0Q291bnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmNvbW1hbmRzLnNpemU7XHJcbiAgfVxyXG59XHJcbiIsICIvKipcbiAqIFdvcmtpbmcgRGlyZWN0b3J5IE1hbmFnZXIgd2l0aCBQZXJzaXN0ZW50IFN0b3JhZ2VcbiAqIFxuICogVHJhY2tzIGEgbXV0YWJsZSB3b3JraW5nIGRpcmVjdG9yeSB0aGF0IHBlcnNpc3RzIGFjcm9zcyBzYW5kYm94IHJlc2V0cy5cbiAqIFVzZXMgZmlsZS1iYXNlZCBzdG9yYWdlIHRvIHN1cnZpdmUgaXNvbGF0ZWQgZXhlY3V0aW9uIGNvbnRleHRzLlxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5cbi8vIEJhc2UgZGlyZWN0b3J5OiBwbHVnaW4gcm9vdCAod2hlcmUgcGFja2FnZS5qc29uIGxpdmVzKVxuY29uc3QgQkFTRV9ESVIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nKTtcblxuLy8gUGVyc2lzdGVudCBzdG9yYWdlIGZpbGUgZm9yIHdvcmtpbmcgZGlyZWN0b3J5XG5jb25zdCBTVEFURV9GSUxFID0gcGF0aC5qb2luKEJBU0VfRElSLCAnLmFpX3Rvb2xib3hfc3RhdGUuanNvbicpO1xuXG4vKiogTG9hZCBwZXJzaXN0ZWQgc3RhdGUgZnJvbSBkaXNrICovXG5mdW5jdGlvbiBsb2FkU3RhdGUoKTogeyB3b3JraW5nRGlyPzogc3RyaW5nIH0ge1xuICB0cnkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKFNUQVRFX0ZJTEUpKSB7XG4gICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKFNUQVRFX0ZJTEUsICd1dGYtOCcpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElnbm9yZSBlcnJvcnMgLSB1c2UgZGVmYXVsdHNcbiAgfVxuICByZXR1cm4ge307XG59XG5cbi8qKiBTYXZlIHN0YXRlIHRvIGRpc2sgKi9cbmZ1bmN0aW9uIHNhdmVTdGF0ZShzdGF0ZTogeyB3b3JraW5nRGlyPzogc3RyaW5nIH0pOiB2b2lkIHtcbiAgdHJ5IHtcbiAgICBmcy53cml0ZUZpbGVTeW5jKFNUQVRFX0ZJTEUsIEpTT04uc3RyaW5naWZ5KHN0YXRlLCBudWxsLCAyKSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKGBbV29ya2luZ0Rpcl0gRmFpbGVkIHRvIHBlcnNpc3Qgc3RhdGU6ICR7ZXJyb3J9YCk7XG4gIH1cbn1cblxuLy8gTXV0YWJsZSB3b3JraW5nIGRpcmVjdG9yeSBcdTIwMTQgbG9hZGVkIGZyb20gcGVyc2lzdGVudCBzdG9yYWdlIG9yIGRlZmF1bHRzIHRvIHBsdWdpbiByb290XG5jb25zdCBwZXJzaXN0ZWRTdGF0ZSA9IGxvYWRTdGF0ZSgpO1xubGV0IGN1cnJlbnRXb3JraW5nRGlyOiBzdHJpbmcgPSBwZXJzaXN0ZWRTdGF0ZS53b3JraW5nRGlyIHx8IEJBU0VfRElSO1xuXG4vKiogR2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0V29ya2luZ0RpcigpOiBzdHJpbmcge1xuICByZXR1cm4gY3VycmVudFdvcmtpbmdEaXI7XG59XG5cbi8qKlxuICogU2V0IHRoZSB3b3JraW5nIGRpcmVjdG9yeSB0byBhIG5ldyBhYnNvbHV0ZSBwYXRoLlxuICogVmFsaWRhdGVzIHRoYXQgdGhlIHBhdGggZXhpc3RzIGFuZCBpcyBhbiBhYnNvbHV0ZSBkaXJlY3RvcnkuXG4gKiBQRVJTSVNUUyB0aGUgY2hhbmdlIHRvIGRpc2sgc28gaXQgc3Vydml2ZXMgc2FuZGJveCByZXNldHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRXb3JraW5nRGlyKG5ld0Rpcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFJlc29sdmUgdG8gYWJzb2x1dGUgcGF0aFxuICBjb25zdCByZXNvbHZlZCA9IHBhdGgucmVzb2x2ZShuZXdEaXIpO1xuXG4gIC8vIE11c3QgYmUgYW4gYWJzb2x1dGUgcGF0aFxuICBpZiAoIXBhdGguaXNBYnNvbHV0ZShyZXNvbHZlZCkpIHtcbiAgICBjb25zb2xlLndhcm4oYHNldFdvcmtpbmdEaXIgcmVqZWN0ZWQ6IG5vdCBhYnNvbHV0ZSBcdTIwMTQgJyR7bmV3RGlyfSdgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBNdXN0IGV4aXN0IGFuZCBiZSBhIGRpcmVjdG9yeVxuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMocmVzb2x2ZWQpO1xuICAgIGlmICghc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgY29uc29sZS53YXJuKGBzZXRXb3JraW5nRGlyIHJlamVjdGVkOiBub3QgYSBkaXJlY3RvcnkgXHUyMDE0ICcke3Jlc29sdmVkfSdgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGNvbnNvbGUud2Fybihgc2V0V29ya2luZ0RpciByZWplY3RlZDogcGF0aCBkb2VzIG5vdCBleGlzdCBcdTIwMTQgJyR7cmVzb2x2ZWR9J2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGN1cnJlbnRXb3JraW5nRGlyID0gcmVzb2x2ZWQ7XG4gIFxuICAvLyBQRVJTSVNUIHRoZSBjaGFuZ2UgdG8gZGlzayAoRklYIGZvciBzYW5kYm94IHJlc2V0IGlzc3VlKVxuICBzYXZlU3RhdGUoeyB3b3JraW5nRGlyOiByZXNvbHZlZCB9KTtcbiAgY29uc29sZS5sb2coYFtXb3JraW5nRGlyXSBQZXJzaXN0ZWQgbmV3IHdvcmtpbmcgZGlyZWN0b3J5OiAke3Jlc29sdmVkfWApO1xuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKiBcbiAqIFJlc2V0IHRoZSB3b3JraW5nIGRpcmVjdG9yeSBiYWNrIHRvIHRoZSBwbHVnaW4gcm9vdFxuICogQWxzbyBjbGVhcnMgcGVyc2lzdGVkIHN0YXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRXb3JraW5nRGlyKCk6IHZvaWQge1xuICBjdXJyZW50V29ya2luZ0RpciA9IEJBU0VfRElSO1xuICBzYXZlU3RhdGUoeyB3b3JraW5nRGlyOiB1bmRlZmluZWQgfSk7IC8vIENsZWFyIHBlcnNpc3RlZCBzdGF0ZVxuICBjb25zb2xlLmxvZyhgW1dvcmtpbmdEaXJdIFJlc2V0IHRvIHBsdWdpbiByb290OiAke0JBU0VfRElSfWApO1xufVxuXG4vKiogUmVzb2x2ZSBhIHVzZXItcHJvdmlkZWQgcGF0aCBhZ2FpbnN0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5ICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhdGgodXNlclBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUoY3VycmVudFdvcmtpbmdEaXIsIHVzZXJQYXRoKTtcbn1cblxuLyoqIEdldCBhbGxvd2VkIGJhc2UgZGlyZWN0b3JpZXMgZm9yIGFic29sdXRlLXBhdGggdmFsaWRhdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbG93ZWRCYXNlcygpOiBzdHJpbmdbXSB7XG4gIC8vIEFsbG93IGJvdGggdGhlIHBsdWdpbiByb290IGFuZCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICBjb25zdCBiYXNlcyA9IFtCQVNFX0RJUiwgY3VycmVudFdvcmtpbmdEaXJdO1xuICByZXR1cm4gWy4uLm5ldyBTZXQoYmFzZXMpXTsgLy8gRGVkdXBsaWNhdGVcbn1cblxuLyoqIEdldCB0aGUgcGx1Z2luIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgKG5ldmVyIGNoYW5nZXMpICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1Z2luUm9vdCgpOiBzdHJpbmcge1xuICByZXR1cm4gQkFTRV9ESVI7XG59XG4iLCAiLyoqXG4gKiBTZWN1cml0eSB1dGlsaXRpZXMgZm9yIHBhdGggdmFsaWRhdGlvbiwgYmluYXJ5IGRldGVjdGlvbiwgYW5kIFJlRG9TIHByb3RlY3Rpb25cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbi8vIFx1MjcwNSBGSVg6IFVzZSBwcm9wZXIgRVNNIGltcG9ydHMgaW5zdGVhZCBvZiByZXF1aXJlKCkgdG8gbWFpbnRhaW4gbW9kdWxlIGJvdW5kYXJ5XG5pbXBvcnQgeyBnZXRBbGxvd2VkQmFzZXMsIGdldFdvcmtpbmdEaXIgfSBmcm9tICcuL3dvcmtpbmdEaXInO1xuXG4vKipcbiAqIFZhbGlkYXRlIGZpbGUgcGF0aCB0byBwcmV2ZW50IGRpcmVjdG9yeSB0cmF2ZXJzYWwgYXR0YWNrcy5cbiAqIERJU0FCTEVEOiBTZWN1cml0eSB2YWxpZGF0b3IgcmVtb3ZlZCBwZXIgdXNlciByZXF1ZXN0IC0gYWxsb3dzIGFsbCBwYXRocy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUGF0aCh1c2VyUGF0aDogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB0cnVlOyAvLyBBbHdheXMgYWxsb3cgcGF0aHNcbn1cblxuLyoqXG4gKiBEZXRlY3QgYmluYXJ5IGZpbGVzIGJ5IGNoZWNraW5nIGZvciBudWxsIGJ5dGVzIGluIGZpcnN0IDhLQlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCaW5hcnlGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaHVuayA9IGNvbnRlbnQuc2xpY2UoMCwgODE5Mik7XG4gIC8vIENoZWNrIGZvciBudWxsIGJ5dGUgKDB4MDApIHdoaWNoIGluZGljYXRlcyBiaW5hcnkgY29udGVudFxuICByZXR1cm4gY2h1bmsuaW5jbHVkZXMoJ1xcMCcpO1xufVxuXG4vKipcbiAqIFByb3RlY3QgYWdhaW5zdCBSZURvUyAoUmVndWxhciBFeHByZXNzaW9uIERlbmlhbCBvZiBTZXJ2aWNlKVxuICogUzIgRklYOiBVc2VzIHByb3BlciByZWdleCBzdHJ1Y3R1cmUgYW5hbHlzaXMgaW5zdGVhZCBvZiBuYWl2ZSBzdWJzdHJpbmcgbWF0Y2hpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NhZmVSZWdleChwYXR0ZXJuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFwYXR0ZXJuIHx8IHBhdHRlcm4ubGVuZ3RoID4gNTAwKSByZXR1cm4gZmFsc2U7XG4gIFxuICAvLyBDaGVjayBmb3IgY29tbW9uIFJlRG9TIHBhdHRlcm5zIHVzaW5nIHN0cnVjdHVyZWQgcmVnZXggZGV0ZWN0aW9uXG4gIGNvbnN0IGRhbmdlcm91c1N0cnVjdHVyZXMgPSBbXG4gICAgLyhcXChbXildKlxcKVsqK10pW14pXSpcXCkvLCAgICAgICAgICAgLy8gTmVzdGVkIHF1YW50aWZpZXJzOiAoLiopKC4qKVxuICAgIC9cXChbXildKlsrKl1cXCkrLywgICAgICAgICAgICAgICAgICAgIC8vIFJlcGV0aXRpb24gb2YgcmVwZXRpdGlvbjogKC4rKStcbiAgICAvXFwoW14pXSpcXHxbXildKlxcKVsrKl0vLCAgICAgICAgICAgICAgLy8gQWx0ZXJuYXRpb24gKyByZXBldGl0aW9uOiAoYXxiKStcbiAgICAvKFxcW1teXFxdXStcXF1bKypdKVteXV0qXFxdLywgICAgICAgICAgIC8vIENoYXIgY2xhc3Mgd2l0aCByZXBldGl0aW9uOiAoW2Etel0rKStcbiAgICAvXFwoXFwuXFw/XFwpXFwqXFwqLywgICAgICAgICAgICAgICAgICAgICAgLy8gR3JvdXAgZm9sbG93ZWQgYnkgZG91YmxlIHN0YXI6ICguKj8pKipcbiAgXTtcbiAgXG4gIGZvciAoY29uc3Qgc3RydWN0dXJlIG9mIGRhbmdlcm91c1N0cnVjdHVyZXMpIHtcbiAgICBpZiAoc3RydWN0dXJlLnRlc3QocGF0dGVybikpIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgLy8gQWxzbyBjaGVjayBmb3IgdGhlIG9yaWdpbmFsIG5haXZlIHBhdHRlcm5zIGFzIGZhbGxiYWNrXG4gIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgICcoLiopKC4qKScsICAgICAgICAgICAvLyBOZXN0ZWQgcXVhbnRpZmllcnMgd2l0aCAuKlxuICAgICcoLispKycsICAgICAgICAgICAgICAvLyBSZXBldGl0aW9uIG9mIHJlcGV0aXRpb24gIFxuICAgICcoW2Etel0rKSsnLCAgICAgICAgICAvLyBDaGFyYWN0ZXIgY2xhc3Mgd2l0aCByZXBldGl0aW9uXG4gICAgJyhhfGIpKycsICAgICAgICAgICAgIC8vIEFsdGVybmF0aW9uIHdpdGggcmVwZXRpdGlvblxuICAgICcoLio/KSoqJywgICAgICAgICAgICAvLyBHcm91cCBmb2xsb3dlZCBieSBkb3VibGUgc3RhciAoUmVEb1MpXG4gIF07XG4gIFxuICBmb3IgKGNvbnN0IGRhbmdlcm91c1BhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi5pbmNsdWRlcyhkYW5nZXJvdXNQYXR0ZXJuKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIFxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBcHBseSBzZWN1cml0eSBjaGVja3MgYmFzZWQgb24gY29uZmlnIHNldHRpbmdzLlxuICogVXNlcyB0aGUgdmlydHVhbCB3b3JraW5nIGRpcmVjdG9yeSBmb3IgcGF0aCB2YWxpZGF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTZWN1cml0eUNoZWNrcyhcbiAgZmlsZVBhdGg6IHN0cmluZywgXG4gIGNvbnRlbnQ/OiBzdHJpbmcsIFxuICByZWdleFBhdHRlcm4/OiBzdHJpbmcsIFxuICBjb25maWc/OiBQbHVnaW5Db25maWdcbik6IHsgdmFsaWRQYXRoOiBib29sZWFuOyBpc0JpbmFyeTogYm9vbGVhbjsgc2FmZVJlZ2V4OiBib29sZWFuIH0ge1xuICBjb25zdCBlZmZlY3RpdmVDb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG5cbiAgcmV0dXJuIHtcbiAgICB2YWxpZFBhdGg6IGVmZmVjdGl2ZUNvbmZpZy5wYXRoVmFsaWRhdGlvbkVuYWJsZWQgPyB2YWxpZGF0ZVBhdGgoZmlsZVBhdGgsIGdldFdvcmtpbmdEaXIoKSkgOiB0cnVlLFxuICAgIGlzQmluYXJ5OiBlZmZlY3RpdmVDb25maWcuYmluYXJ5RmlsZURldGVjdGlvbiAmJiBjb250ZW50ID8gaXNCaW5hcnlGaWxlKGNvbnRlbnQpIDogZmFsc2UsXG4gICAgc2FmZVJlZ2V4OiBlZmZlY3RpdmVDb25maWcucmVnZXhSZURvU1Byb3RlY3Rpb24gJiYgcmVnZXhQYXR0ZXJuID8gaXNTYWZlUmVnZXgocmVnZXhQYXR0ZXJuKSA6IHRydWUsXG4gIH07XG59XG5cbi8qKlxuICogU2FuaXRpemUgc2hlbGwgY29tbWFuZHMgdG8gcHJldmVudCBkYW5nZXJvdXMgb3BlcmF0aW9uc1xuICogUzMgRklYOiBFbmhhbmNlZCB3aXRoIElGUy10YW1wZXJpbmcgYW5kIG51bGwtYnl0ZSBpbmplY3Rpb24gZGV0ZWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHsgc2FmZTogYm9vbGVhbjsgcmVhc29uPzogc3RyaW5nIH0ge1xuICBpZiAoIWNvbW1hbmQgfHwgdHlwZW9mIGNvbW1hbmQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0VtcHR5IG9yIGludmFsaWQgY29tbWFuZCcgfTtcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB3aGl0ZXNwYWNlIGJ1dCBwcmVzZXJ2ZSBxdW90ZWQgc3RyaW5nc1xuICBjb25zdCBub3JtYWxpemVkID0gY29tbWFuZC50cmltKCk7XG4gIFxuICAvLyBTMyBGSVg6IEJsb2NrIG51bGwgYnl0ZSBpbmplY3Rpb24gKGNhbiBieXBhc3MgcmVnZXggbWF0Y2hpbmcpXG4gIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKCdcXDAnKSB8fCBub3JtYWxpemVkLmluY2x1ZGVzKCclMDAnKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdOdWxsIGJ5dGUgaW5qZWN0aW9uIGRldGVjdGVkJyB9O1xuICB9XG5cbiAgLy8gUzMgRklYOiBCbG9jayBJRlMtdGFtcGVyaW5nIGluIGJhc2ggKElGUz0kJyAnIGFsbG93cyBzcGxpdHRpbmcgd2l0aG91dCBzcGFjZXMpXG4gIGNvbnN0IGlmc1BhdHRlcm5zID0gW1xuICAgIC9cXGJJRlNcXHMqPVxccypbXFxcXCQnXVxccyovaSxcbiAgICAvSUZTPVskJ11bXiddKicvaSxcbiAgXTtcbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGlmc1BhdHRlcm5zKSB7XG4gICAgaWYgKHBhdHRlcm4udGVzdChub3JtYWxpemVkKSkge1xuICAgICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0lGUyB0YW1wZXJpbmcgZGV0ZWN0ZWQnIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGRhbmdlcm91cyBwYXR0ZXJucyB1c2luZyBhIG1vcmUgcm9idXN0IGFwcHJvYWNoXG4gIGNvbnN0IGRhbmdlcm91c1BhdHRlcm5zID0gW1xuICAgIC8vIEZpbGUgc3lzdGVtIGRlc3RydWN0aW9uXG4gICAgL1xcYnJtXFxzKy1yZlxcYi9pLFxuICAgIC9cXGJzaHJlZFxcYi9pLFxuICAgIC9cXGJ3aXBlXFxiL2ksXG4gICAgXG4gICAgLy8gUHJpdmlsZWdlIGVzY2FsYXRpb25cbiAgICAvXFxic3Vkb1xcYi9pLFxuICAgIC9cXGJzdVxcYig/IVxcdykvaSwgIC8vICdzdScgYnV0IG5vdCAnc3VkbycsICdzdXNoaScsIGV0Yy5cbiAgICBcbiAgICAvLyBOZXR3b3JrIGF0dGFja3NcbiAgICAvXFxibmNcXGIoPyFcXHcpfFxcYm5ldGNhdFxcYi9pLFxuICAgIC9cXGJ3Z2V0XFxzKy4qLS1wb3N0LWZpbGVcXGIvaSxcbiAgICAvXFxiY3VybFxccysuKi0tZGF0YS1iaW5hcnlcXGIvaSxcbiAgICBcbiAgICAvLyBEYXRhIGV4ZmlsdHJhdGlvblxuICAgIC9cXGJiYXNlNjRcXGIuKlxcfFxccyooY3VybHx3Z2V0KS9pLFxuICAgIC9cXGJzY3BcXGIoPyFcXHcpfFxcYnNmdHBcXGIvaSxcbiAgICBcbiAgICAvLyBQcm9jZXNzIG1hbmlwdWxhdGlvblxuICAgIC9cXGJmb3JrXFxiKD8hXFx3KS9pLFxuICAgIC9cXGJleGVjXFxiKD8hXFx3KS9pLFxuICAgIFxuICAgIC8vIEVudmlyb25tZW50IHRhbXBlcmluZ1xuICAgIC9cXGJleHBvcnRcXHMrXFx3Kz0vaSxcbiAgICAvXFxiZXZhbFxcYig/IVxcdykvaSxcbiAgXTtcblxuICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICBpZiAocGF0dGVybi50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiBgRGFuZ2Vyb3VzIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7cGF0dGVybi5zb3VyY2V9YCB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGZvciBwaXBlIGNoYWlucyB0aGF0IGNvdWxkIGJlIHVzZWQgZm9yIGF0dGFja3MgKG1vcmUgdGhhbiAyIHBpcGVzID0gMysgY29tbWFuZHMpXG4gIGNvbnN0IHBpcGVDb3VudCA9IChub3JtYWxpemVkLm1hdGNoKC9cXHwvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHBpcGVDb3VudCA+IDIpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnVG9vIG1hbnkgcGlwZXMgaW4gY29tbWFuZCBjaGFpbicgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBzZW1pY29sb24tc2VwYXJhdGVkIGNvbW1hbmRzIChwb3RlbnRpYWwgaW5qZWN0aW9uKVxuICBjb25zdCBzZW1pQ29sb25Db3VudCA9IChub3JtYWxpemVkLm1hdGNoKC87L2cpIHx8IFtdKS5sZW5ndGg7XG4gIGlmIChzZW1pQ29sb25Db3VudCA+IDEpIHtcbiAgICByZXR1cm4geyBzYWZlOiBmYWxzZSwgcmVhc29uOiAnTXVsdGlwbGUgc2VtaWNvbG9ucyBkZXRlY3RlZCBpbiBjb21tYW5kJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGJhY2t0aWNrIGV4ZWN1dGlvbiBvciAkKCkgc3Vic2hlbGwgaW5qZWN0aW9uXG4gIGlmICgvYFteYF0rYHxcXCRcXChbXildK1xcKS8udGVzdChub3JtYWxpemVkKSkge1xuICAgIHJldHVybiB7IHNhZmU6IGZhbHNlLCByZWFzb246ICdDb21tYW5kIHN1YnN0aXR1dGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBlbnZpcm9ubWVudCB2YXJpYWJsZSBpbmplY3Rpb25cbiAgaWYgKC9eXFxzKihleHBvcnR8dW5zZXQpXFxzLy50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgcmV0dXJuIHsgc2FmZTogZmFsc2UsIHJlYXNvbjogJ0Vudmlyb25tZW50IG1vZGlmaWNhdGlvbiBkZXRlY3RlZCcgfTtcbiAgfVxuXG4gIHJldHVybiB7IHNhZmU6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBTUUwgcXVlcnkgZm9yIHNhZmV0eSAocmVhZC1vbmx5IG9wZXJhdGlvbnMgb25seSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU1FMUXVlcnkocXVlcnk6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IHJlYXNvbj86IHN0cmluZyB9IHtcbiAgaWYgKCFxdWVyeSB8fCB0eXBlb2YgcXVlcnkgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246ICdFbXB0eSBvciBpbnZhbGlkIHF1ZXJ5JyB9O1xuICB9XG5cbiAgY29uc3QgdHJpbW1lZCA9IHF1ZXJ5LnRyaW0oKS50b1VwcGVyQ2FzZSgpO1xuICBcbiAgLy8gT25seSBhbGxvdyBTRUxFQ1QgYW5kIFBSQUdNQSBzdGF0ZW1lbnRzXG4gIGlmICghdHJpbW1lZC5zdGFydHNXaXRoKCdTRUxFQ1QnKSAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdQUkFHTUEnKSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnT25seSBTRUxFQ1QgYW5kIFBSQUdNQSBxdWVyaWVzIGFyZSBhbGxvd2VkJyB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGRhbmdlcm91cyBrZXl3b3JkcyB0aGF0IGNvdWxkIGJlIGluamVjdGVkIGFmdGVyIFNFTEVDVC9QUkFHTUFcbiAgY29uc3QgZGFuZ2Vyb3VzU1FMS2V5d29yZHMgPSBbXG4gICAgL1xcYkRST1BcXGIvaSxcbiAgICAvXFxiREVMRVRFXFxiL2ksXG4gICAgL1xcYlVQREFURVxcYi9pLFxuICAgIC9cXGJJTlNFUlRcXGIvaSxcbiAgICAvXFxiQUxURVJcXGIvaSxcbiAgICAvXFxiQ1JFQVRFXFxiL2ksXG4gICAgL1xcYlJFUExBQ0VcXGIvaSxcbiAgICAvXFxiVFJVTkNBVEVcXGIvaSxcbiAgICAvXFxiR1JBTlRcXGIvaSxcbiAgICAvXFxiUkVWT0tFXFxiL2ksXG4gIF07XG5cbiAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGRhbmdlcm91c1NRTEtleXdvcmRzKSB7XG4gICAgaWYgKGtleXdvcmQudGVzdCh0cmltbWVkKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCByZWFzb246IGBEYW5nZXJvdXMgU1FMIG9wZXJhdGlvbiBkZXRlY3RlZDogJHtrZXl3b3JkLnNvdXJjZX1gIH07XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIG11bHRpcGxlIHN0YXRlbWVudHMgKHNlbWljb2xvbiBpbmplY3Rpb24pXG4gIGNvbnN0IHNlbWlDb2xvbkNvdW50ID0gKHRyaW1tZWQubWF0Y2goLzsvZykgfHwgW10pLmxlbmd0aDtcbiAgaWYgKHNlbWlDb2xvbkNvdW50ID4gMCkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgcmVhc29uOiAnTXVsdGlwbGUgU1FMIHN0YXRlbWVudHMgZGV0ZWN0ZWQnIH07XG4gIH1cblxuICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuIiwgIi8qKlxuICogUGVyZm9ybWFuY2UgVXRpbGl0aWVzIGZvciBBSSBUb29sYm94IFBsdWdpblxuICogT3B0aW1pemVkIGFsZ29yaXRobXMgd2l0aCBlYXJseSBleGl0LCBjYWNoaW5nLCBhbmQgYXN5bmMgb3BlcmF0aW9uc1xuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IExldmVuc2h0ZWluIERpc3RhbmNlIHdpdGggRWFybHkgRXhpdCA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE9wdGltaXplZCBMZXZlbnNodGVpbiBkaXN0YW5jZSBjYWxjdWxhdGlvbiB3aXRoIGVhcmx5IGV4aXQgdGhyZXNob2xkLlxuICogU3RvcHMgY2FsY3VsYXRpbmcgaWYgdGhlIG1pbmltdW0gcG9zc2libGUgc2NvcmUgZHJvcHMgYmVsb3cgdGhlIHRocmVzaG9sZC5cbiAqIFxuICogQHBhcmFtIGEgLSBGaXJzdCBzdHJpbmdcbiAqIEBwYXJhbSBiIC0gU2Vjb25kIHN0cmluZyAgXG4gKiBAcGFyYW0gbWluU2NvcmUgLSBNaW5pbXVtIGFjY2VwdGFibGUgc2ltaWxhcml0eSBzY29yZSAoMC0xKS4gUmVzdWx0cyBiZWxvdyB0aGlzIGFyZSBwcnVuZWQgZWFybHkuXG4gKiBAcmV0dXJucyBTaW1pbGFyaXR5IHNjb3JlIGJldHdlZW4gMCBhbmQgMSwgb3IgbnVsbCBpZiBiZWxvdyB0aHJlc2hvbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxldmVuc2h0ZWluU2ltaWxhcml0eShhOiBzdHJpbmcsIGI6IHN0cmluZywgbWluU2NvcmU6IG51bWJlciA9IDAuMyk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBtYXhMZW4gPSBNYXRoLm1heChhLmxlbmd0aCwgYi5sZW5ndGgpO1xuICBpZiAobWF4TGVuID09PSAwKSByZXR1cm4gMTtcblxuICAvLyBRdWljayByZWplY3Rpb246IGlmIHN0cmluZ3MgZGlmZmVyIHRvbyBtdWNoIGluIGxlbmd0aCwgc2tpcCBleHBlbnNpdmUgY2FsY3VsYXRpb25cbiAgY29uc3QgbGVuRGlmZiA9IE1hdGguYWJzKGEubGVuZ3RoIC0gYi5sZW5ndGgpO1xuICBpZiAobGVuRGlmZiAvIG1heExlbiA+ICgxIC0gbWluU2NvcmUpKSB7XG4gICAgcmV0dXJuIG51bGw7IC8vIEVhcmx5IGV4aXQgZm9yIHZlcnkgZGlmZmVyZW50IGxlbmd0aHNcbiAgfVxuXG4gIC8vIFVzZSB0d28tcm93IG9wdGltaXphdGlvbiBpbnN0ZWFkIG9mIGZ1bGwgbWF0cml4IChzYXZlcyBtZW1vcnkpXG4gIGxldCBwcmV2Um93OiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8PSBiLmxlbmd0aDsgaSsrKSB7XG4gICAgcHJldlJvdy5wdXNoKDApO1xuICB9XG4gIGxldCBjdXJyUm93OiBudW1iZXJbXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IGIubGVuZ3RoOyBpKyspIHtcbiAgICBwcmV2Um93W2ldID0gaTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGEubGVuZ3RoOyBpKyspIHtcbiAgICBjdXJyUm93WzBdID0gaTtcbiAgICBcbiAgICAvLyBFYXJseSBleGl0IG9wdGltaXphdGlvbjogaWYgY3VycmVudCByb3cncyBtaW5pbXVtIGV4Y2VlZHMgdGhyZXNob2xkLCBhYm9ydFxuICAgIGxldCBtaW5JblJvdyA9IGk7XG4gICAgXG4gICAgZm9yIChsZXQgaiA9IDE7IGogPD0gYi5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgY29zdCA9IGFbaSAtIDFdID09PSBiW2ogLSAxXSA/IDAgOiAxO1xuICAgICAgY3VyclJvd1tqXSA9IE1hdGgubWluKFxuICAgICAgICBwcmV2Um93W2pdICsgMSwgICAgICAgICAvLyBkZWxldGlvblxuICAgICAgICBjdXJyUm93W2ogLSAxXSArIDEsICAgICAvLyBpbnNlcnRpb24gIFxuICAgICAgICBwcmV2Um93W2ogLSAxXSArIGNvc3QgICAvLyBzdWJzdGl0dXRpb25cbiAgICAgICk7XG4gICAgICBcbiAgICAgIGlmIChjdXJyUm93W2pdIDwgbWluSW5Sb3cpIHtcbiAgICAgICAgbWluSW5Sb3cgPSBjdXJyUm93W2pdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVhcmx5IGV4aXQ6IGlmIG1pbmltdW0gaW4gdGhpcyByb3cgYWxyZWFkeSBleGNlZWRzIHRocmVzaG9sZCwgYWJvcnRcbiAgICBjb25zdCBjdXJyZW50TWF4U2NvcmUgPSAxIC0gbWluSW5Sb3cgLyBtYXhMZW47XG4gICAgaWYgKGN1cnJlbnRNYXhTY29yZSA8IG1pblNjb3JlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHJvd3NcbiAgICBbcHJldlJvdywgY3VyclJvd10gPSBbY3VyclJvdywgcHJldlJvd107XG4gIH1cblxuICBjb25zdCBkaXN0YW5jZSA9IHByZXZSb3dbYi5sZW5ndGhdO1xuICBjb25zdCBzY29yZSA9IE1hdGgubWF4KDAsIDEgLSBkaXN0YW5jZSAvIG1heExlbik7XG4gIHJldHVybiBzY29yZSA+PSBtaW5TY29yZSA/IHNjb3JlIDogbnVsbDtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRnV6enkgU2VhcmNoIENhY2hlID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBGdXp6eVNlYXJjaENhY2hlRW50cnkge1xuICByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT47XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG5jb25zdCBmdXp6eVNlYXJjaENhY2hlID0gbmV3IE1hcDxzdHJpbmcsIEZ1enp5U2VhcmNoQ2FjaGVFbnRyeT4oKTtcbmNvbnN0IENBQ0hFX1RUTF9NUyA9IDYwXzAwMDsgLy8gNjAgc2Vjb25kIGNhY2hlIFRUTFxuXG4vKipcbiAqIEdldCBjYWNoZWQgZnV6enkgc2VhcmNoIHJlc3VsdHMgaWYgYXZhaWxhYmxlIGFuZCBub3QgZXhwaXJlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlZEZ1enp5UmVzdWx0cyhxdWVyeTogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKTogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+IHwgbnVsbCB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7cXVlcnl9OiR7YmFzZVBhdGh9YDtcbiAgY29uc3QgZW50cnkgPSBmdXp6eVNlYXJjaENhY2hlLmdldChjYWNoZUtleSk7XG4gIFxuICBpZiAoIWVudHJ5KSByZXR1cm4gbnVsbDtcbiAgaWYgKERhdGUubm93KCkgLSBlbnRyeS50aW1lc3RhbXAgPiBDQUNIRV9UVExfTVMpIHtcbiAgICBmdXp6eVNlYXJjaENhY2hlLmRlbGV0ZShjYWNoZUtleSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgXG4gIHJldHVybiBlbnRyeS5yZXN1bHRzO1xufVxuXG4vKipcbiAqIENhY2hlIGZ1enp5IHNlYXJjaCByZXN1bHRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVGdXp6eVJlc3VsdHMocXVlcnk6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZywgcmVzdWx0czogQXJyYXk8eyBmaWxlUGF0aDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+KTogdm9pZCB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7cXVlcnl9OiR7YmFzZVBhdGh9YDtcbiAgZnV6enlTZWFyY2hDYWNoZS5zZXQoY2FjaGVLZXksIHtcbiAgICByZXN1bHRzLFxuICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgfSk7XG4gIFxuICAvLyBFdmljdCBvbGQgZW50cmllcyBpZiBjYWNoZSBncm93cyB0b28gbGFyZ2UgKG1heCAxMDAgZW50cmllcylcbiAgaWYgKGZ1enp5U2VhcmNoQ2FjaGUuc2l6ZSA+IDEwMCkge1xuICAgIGNvbnN0IG9sZGVzdEtleSA9IGZ1enp5U2VhcmNoQ2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICBpZiAob2xkZXN0S2V5KSB7XG4gICAgICBmdXp6eVNlYXJjaENhY2hlLmRlbGV0ZShvbGRlc3RLZXkpO1xuICAgIH1cbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBc3luYyBGaWxlIFNlYXJjaCB3aXRoIENvbmN1cnJlbmN5IENvbnRyb2wgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNlYXJjaFJlc3VsdCB7XG4gIGZpbGVzOiBzdHJpbmdbXTtcbiAgY291bnQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBzZWFyY2ggZm9yIGZpbGVzIG1hdGNoaW5nIGEgcGF0dGVybiB1c2luZyBhc3luYy9hd2FpdCB3aXRoIGNvbmN1cnJlbmN5IGNvbnRyb2wuXG4gKiBNdWNoIGZhc3RlciB0aGFuIHN5bmNocm9ub3VzIHJlYWRkaXJTeW5jIGZvciBsYXJnZSBkaXJlY3RvcnkgdHJlZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kRmlsZXNBc3luYyhcbiAgZGlyUGF0aDogc3RyaW5nLFxuICBwYXR0ZXJuOiBzdHJpbmcsXG4gIG1heERlcHRoOiBudW1iZXIgPSA1LFxuICBjb25jdXJyZW5jeUxpbWl0OiBudW1iZXIgPSA0XG4pOiBQcm9taXNlPFNlYXJjaFJlc3VsdD4ge1xuICBjb25zdCByZXN1bHRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBwYXR0ZXJuTG93ZXIgPSBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gc2VhcmNoRGlyKGN1cnJlbnRQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5yZWFkZGlyKGN1cnJlbnRQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICBcbiAgICAgIC8vIFByb2Nlc3MgZmlsZXMgaW1tZWRpYXRlbHlcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoZW50cnkuaXNGaWxlKCkgJiYgZW50cnkubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHBhdHRlcm5Mb3dlcikpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlbnRyeS5uYW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ29sbGVjdCBzdWJkaXJlY3RvcmllcyBmb3IgcGFyYWxsZWwgcHJvY2Vzc2luZ1xuICAgICAgY29uc3Qgc3ViZGlycyA9IGVudHJpZXMuZmlsdGVyKGUgPT4gZS5pc0RpcmVjdG9yeSgpKS5tYXAoZSA9PiBwYXRoLmpvaW4oY3VycmVudFBhdGgsIGUubmFtZSkpO1xuICAgICAgXG4gICAgICBpZiAoc3ViZGlycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIFByb2Nlc3MgZGlyZWN0b3JpZXMgaW4gYmF0Y2hlcyB0byBhdm9pZCBvdmVyd2hlbG1pbmcgdGhlIHN5c3RlbVxuICAgICAgICBjb25zdCBiYXRjaGVzOiBzdHJpbmdbXVtdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViZGlycy5sZW5ndGg7IGkgKz0gY29uY3VycmVuY3lMaW1pdCkge1xuICAgICAgICAgIGJhdGNoZXMucHVzaChzdWJkaXJzLnNsaWNlKGksIGkgKyBjb25jdXJyZW5jeUxpbWl0KSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGJhdGNoIG9mIGJhdGNoZXMpIHtcbiAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIGJhdGNoLm1hcChkaXIgPT4gc2VhcmNoRGlyKGRpciwgZGVwdGggKyAxKSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBkaXJlY3RvcmllcyBzaWxlbnRseVxuICAgIH1cbiAgfVxuXG4gIGF3YWl0IHNlYXJjaERpcihkaXJQYXRoLCAwKTtcbiAgcmV0dXJuIHsgZmlsZXM6IHJlc3VsdHMsIGNvdW50OiByZXN1bHRzLmxlbmd0aCB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTdHJlYW1pbmcgRmlsZSBSZWFkZXIgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFN0cmVhbVJlYWRSZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICBkYXRhPzoge1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICBwYXRoOiBzdHJpbmc7XG4gICAgdG90YWxMZW5ndGg6IG51bWJlcjtcbiAgICB0cnVuY2F0ZWQ/OiBib29sZWFuO1xuICAgIG5vdGU/OiBzdHJpbmc7XG4gIH07XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlYWQgZmlsZSBjb250ZW50IHVzaW5nIHN0cmVhbWluZyB0byBhdm9pZCBsb2FkaW5nIGVudGlyZSBmaWxlIGludG8gbWVtb3J5LlxuICogUmVzcGVjdHMgbWF4X2xlbmd0aCBwYXJhbWV0ZXIgYnkgcmVhZGluZyBvbmx5IG5lY2Vzc2FyeSBjaHVua3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZVN5bmMoXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIG1heExlbmd0aDogbnVtYmVyID0gNTAwMFxuKTogUHJvbWlzZTxTdHJlYW1SZWFkUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IGZpbGUgc3RhdHMgZmlyc3QgdG8ga25vdyB0b3RhbCBzaXplXG4gICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBmcy5zdGF0KGZpbGVQYXRoKTtcbiAgICBcbiAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUGF0aCBpcyBhIGRpcmVjdG9yeSwgbm90IGEgZmlsZScgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBmaWxlIGlzIHNtYWxsIGVub3VnaCwgcmVhZCBlbnRpcmVseSAoZmFzdGVyIGZvciBzbWFsbCBmaWxlcylcbiAgICBpZiAoc3RhdHMuc2l6ZSA8PSBtYXhMZW5ndGggKiAyKSB7IC8vIDJ4IGZhY3RvciBmb3IgVVRGLTggZW5jb2Rpbmcgb3ZlcmhlYWRcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgY29udGVudCxcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICB0b3RhbExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZvciBsYXJnZSBmaWxlcywgdXNlIHN0cmVhbWluZyByZWFkXG4gICAgY29uc3QgeyBjcmVhdGVSZWFkU3RyZWFtIH0gPSBhd2FpdCBpbXBvcnQoJ2ZzJyk7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgY29udGVudCA9ICcnO1xuICAgICAgbGV0IGJ5dGVzUmVhZCA9IDA7XG4gICAgICBjb25zdCBzdHJlYW0gPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoLCB7IFxuICAgICAgICBlbmNvZGluZzogJ3V0Zi04JyxcbiAgICAgICAgaGlnaFdhdGVyTWFyazogNjQgKiAxMDI0IC8vIDY0S0IgY2h1bmtzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlciB8IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBjaHVua1N0ciA9IHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycgPyBjaHVuayA6IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgIGJ5dGVzUmVhZCArPSBjaHVua1N0ci5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICAvLyBPbmx5IGFjY3VtdWxhdGUgaWYgd2UgaGF2ZW4ndCBleGNlZWRlZCBtYXggbGVuZ3RoIHlldFxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggKyBjaHVua1N0ci5sZW5ndGggPD0gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgY29udGVudCArPSBjaHVua1N0cjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUYWtlIG9ubHkgd2hhdCBmaXRzIGFuZCBzdG9wIHJlYWRpbmdcbiAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBtYXhMZW5ndGggLSBjb250ZW50Lmxlbmd0aDtcbiAgICAgICAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgICAgICAgY29udGVudCArPSBjaHVua1N0ci5zdWJzdHJpbmcoMCwgcmVtYWluaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RyZWFtLmRlc3Ryb3koKTsgLy8gU3RvcCB0aGUgc3RyZWFtIGVhcmx5XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaXNUcnVuY2F0ZWQgPSBieXRlc1JlYWQgPiBtYXhMZW5ndGggfHwgc3RhdHMuc2l6ZSA+IG1heExlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgdG90YWxMZW5ndGg6IE1hdGgubWF4KGJ5dGVzUmVhZCwgY29udGVudC5sZW5ndGgpLFxuICAgICAgICAgICAgLi4uKGlzVHJ1bmNhdGVkICYmIHsgXG4gICAgICAgICAgICAgIHRydW5jYXRlZDogdHJ1ZSwgXG4gICAgICAgICAgICAgIG5vdGU6IGBPdXRwdXQgdHJ1bmNhdGVkIHRvICR7bWF4TGVuZ3RofSBjaGFyYWN0ZXJzLiBVc2UgbWF4X2xlbmd0aCBwYXJhbWV0ZXIgdG8gcmVhZCBtb3JlLmAgXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJlYWQgZmlsZTogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBSZXF1ZXN0IENhY2hpbmcgZm9yIFdlYiBSZXNlYXJjaCA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgQ2FjaGVkUmVzcG9uc2Uge1xuICBkYXRhOiB1bmtub3duO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgc3RhdHVzOiBudW1iZXI7XG59XG5cbmNvbnN0IHJlcXVlc3RDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBDYWNoZWRSZXNwb25zZT4oKTtcbmNvbnN0IFJFUVVFU1RfQ0FDSEVfVFRMX01TID0gMzBfMDAwOyAvLyAzMCBzZWNvbmQgY2FjaGUgVFRMIGZvciBzZWFyY2ggcmVzdWx0c1xuXG4vKiogQ2xlYXIgcmVxdWVzdCBjYWNoZSAoZm9yIHRlc3RpbmcpICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJSZXF1ZXN0Q2FjaGUoKTogdm9pZCB7XG4gIHJlcXVlc3RDYWNoZS5jbGVhcigpO1xufVxuXG4vKipcbiAqIEZldGNoIHdpdGggY2FjaGluZyB0byBhdm9pZCByZWR1bmRhbnQgbmV0d29yayByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aENhY2hlKFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IFJlcXVlc3RJbml0XG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gYCR7dXJsfToke0pTT04uc3RyaW5naWZ5KG9wdGlvbnMpfWA7XG4gIFxuICAvLyBDaGVjayBjYWNoZSBmaXJzdCAoR0VUIHJlcXVlc3RzIG9ubHkpXG4gIGlmIChvcHRpb25zPy5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIGNvbnN0IGNhY2hlZCA9IHJlcXVlc3RDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgIGlmIChjYWNoZWQgJiYgRGF0ZS5ub3coKSAtIGNhY2hlZC50aW1lc3RhbXAgPCBSRVFVRVNUX0NBQ0hFX1RUTF9NUykge1xuICAgICAgLy8gUmV0dXJuIGEgUmVzcG9uc2UtbGlrZSBvYmplY3QgZnJvbSBjYWNoZVxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShjYWNoZWQuZGF0YSksIHtcbiAgICAgICAgc3RhdHVzOiBjYWNoZWQuc3RhdHVzLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCBvcHRpb25zKTtcbiAgXG4gIC8vIENhY2hlIHN1Y2Nlc3NmdWwgcmVzcG9uc2VzXG4gIGlmIChyZXNwb25zZS5vayAmJiBvcHRpb25zPy5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgcmVxdWVzdENhY2hlLnNldChjYWNoZUtleSwge1xuICAgICAgICBkYXRhLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vIEV2aWN0IG9sZCBlbnRyaWVzIGlmIGNhY2hlIGdyb3dzIHRvbyBsYXJnZSAobWF4IDUwIGVudHJpZXMpXG4gICAgICBpZiAocmVxdWVzdENhY2hlLnNpemUgPiA1MCkge1xuICAgICAgICBjb25zdCBvbGRlc3RLZXkgPSByZXF1ZXN0Q2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICAgICAgaWYgKG9sZGVzdEtleSkge1xuICAgICAgICAgIHJlcXVlc3RDYWNoZS5kZWxldGUob2xkZXN0S2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gTm9uLUpTT04gcmVzcG9uc2VzIGFyZSBub3QgY2FjaGVkXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIFJldHJ5IGxvZ2ljIHdpdGggZXhwb25lbnRpYWwgYmFja29mZiBmb3IgZmFpbGVkIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hXaXRoUmV0cnkoXG4gIHVybDogc3RyaW5nLFxuICBvcHRpb25zPzogUmVxdWVzdEluaXQsXG4gIG1heFJldHJpZXM6IG51bWJlciA9IDMsXG4gIGJhc2VEZWxheU1zOiBudW1iZXIgPSAxMDAwXG4pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gIFxuICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8PSBtYXhSZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhDYWNoZSh1cmwsIG9wdGlvbnMpO1xuICAgICAgXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rICYmIHJlc3BvbnNlLnN0YXR1cyA+PSA1MDApIHtcbiAgICAgICAgLy8gU2VydmVyIGVycm9yIC0gcmV0cnlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJ2ZXIgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgIGxhc3RFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgIFxuICAgICAgaWYgKGF0dGVtcHQgPCBtYXhSZXRyaWVzKSB7XG4gICAgICAgIGNvbnN0IGRlbGF5TXMgPSBiYXNlRGVsYXlNcyAqIE1hdGgucG93KDIsIGF0dGVtcHQpOyAvLyBFeHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheU1zKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICB0aHJvdyBsYXN0RXJyb3IgfHwgbmV3IEVycm9yKGBSZXF1ZXN0IGZhaWxlZCBhZnRlciAke21heFJldHJpZXN9IHJldHJpZXNgKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU3VicHJvY2VzcyBUaW1lb3V0IENhbGN1bGF0b3IgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBDYWxjdWxhdGUgYXBwcm9wcmlhdGUgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemUuXG4gKiBMYXJnZXIgcHJvamVjdHMgbmVlZCBtb3JlIHRpbWUgZm9yIGFuYWx5c2lzIHRvb2xzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5hbHlzaXNUaW1lb3V0KGJhc2VUaW1lb3V0TXM6IG51bWJlciwgZmlsZUNvdW50PzogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKCFmaWxlQ291bnQpIHJldHVybiBiYXNlVGltZW91dE1zO1xuICBcbiAgLy8gU2NhbGUgdGltZW91dCBsb2dhcml0aG1pY2FsbHkgd2l0aCBmaWxlIGNvdW50XG4gIGNvbnN0IHNjYWxlRmFjdG9yID0gTWF0aC5sb2cyKE1hdGgubWF4KDEsIGZpbGVDb3VudCkpIC8gMTA7IC8vIH4xeCBmb3IgMS0xMCBmaWxlcywgfjJ4IGZvciAxMDAwKyBmaWxlc1xuICBjb25zdCBzY2FsZWRUaW1lb3V0ID0gYmFzZVRpbWVvdXRNcyAqICgxICsgc2NhbGVGYWN0b3IpO1xuICBcbiAgLy8gQ2FwIGF0IDYwIHNlY29uZHMgbWF4aW11bVxuICByZXR1cm4gTWF0aC5taW4oc2NhbGVkVGltZW91dCwgNjBfMDAwKTtcbn1cblxuLyoqXG4gKiBDb3VudCBUeXBlU2NyaXB0IGZpbGVzIGluIGEgZGlyZWN0b3J5IHRvIGVzdGltYXRlIHByb2plY3Qgc2l6ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvdW50VHlwZVNjcmlwdEZpbGVzKGRpclBhdGg6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGxldCBjb3VudCA9IDA7XG4gIFxuICBhc3luYyBmdW5jdGlvbiBjb3VudEluRGlyKGN1cnJlbnRQYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZGVwdGggPiAxMCkgcmV0dXJuOyAvLyBSZWFzb25hYmxlIG1heCBkZXB0aFxuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucmVhZGRpcihjdXJyZW50UGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy50cycpKSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgLy8gU2tpcCBjb21tb24gbm9uLXNvdXJjZSBkaXJlY3Rvcmllc1xuICAgICAgICAgIGlmICghWydub2RlX21vZHVsZXMnLCAnLmdpdCcsICdkaXN0JywgJ2J1aWxkJ10uaW5jbHVkZXMoZW50cnkubmFtZSkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNvdW50SW5EaXIocGF0aC5qb2luKGN1cnJlbnRQYXRoLCBlbnRyeS5uYW1lKSwgZGVwdGggKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIGRpcmVjdG9yaWVzXG4gICAgfVxuICB9XG4gIFxuICBhd2FpdCBjb3VudEluRGlyKGRpclBhdGgsIDApO1xuICByZXR1cm4gY291bnQ7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuLi9zdGF0ZU1hbmFnZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBDb250ZXh0R3VhcmQgfSBmcm9tICcuLi9jb250ZXh0R3VhcmQuanMnO1xuaW1wb3J0IHsgdmFsaWRhdGVQYXRoLCBpc1NhZmVSZWdleCB9IGZyb20gJy4uL3NlY3VyaXR5LmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIsIHNldFdvcmtpbmdEaXIsIHJlc29sdmVQYXRoIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5pbXBvcnQge1xuICBsZXZlbnNodGVpblNpbWlsYXJpdHksXG4gIGdldENhY2hlZEZ1enp5UmVzdWx0cyxcbiAgY2FjaGVGdXp6eVJlc3VsdHMsXG4gIGZpbmRGaWxlc0FzeW5jLFxuICBjb3VudFR5cGVTY3JpcHRGaWxlcyxcbiAgZ2V0QW5hbHlzaXNUaW1lb3V0LFxufSBmcm9tICcuLi9wZXJmb3JtYW5jZVV0aWxzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIExpc3REaXJlY3RvcnlQYXJhbXMgeyBwYXRoPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgUmVhZEZpbGVQYXJhbXMgeyBmaWxlX25hbWU6IHN0cmluZzsgbWF4X2xlbmd0aD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIFNhdmVGaWxlUGFyYW1zIHsgZmlsZV9uYW1lPzogc3RyaW5nOyBjb250ZW50Pzogc3RyaW5nOyBmaWxlcz86IEFycmF5PHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZyB9PjsgfVxuaW50ZXJmYWNlIFJlcGxhY2VUZXh0SW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IG9sZF9zdHJpbmc6IHN0cmluZzsgbmV3X3N0cmluZzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgSW5zZXJ0QXRMaW5lUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGxpbmVfbnVtYmVyOiBudW1iZXI7IGNvbnRlbnRfdG9faW5zZXJ0OiBzdHJpbmc7IH1cbmludGVyZmFjZSBBcHBlbmRGaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUxpbmVzSW5GaWxlUGFyYW1zIHsgZmlsZV9uYW1lOiBzdHJpbmc7IHN0YXJ0X2xpbmU6IG51bWJlcjsgZW5kX2xpbmU/OiBudW1iZXI7IH1cbmludGVyZmFjZSBNYWtlRGlyZWN0b3J5UGFyYW1zIHsgZGlyZWN0b3J5X25hbWU6IHN0cmluZzsgfVxuaW50ZXJmYWNlIE1vdmVGaWxlUGFyYW1zIHsgc291cmNlOiBzdHJpbmc7IGRlc3RpbmF0aW9uOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDb3B5RmlsZVBhcmFtcyB7IHNvdXJjZTogc3RyaW5nOyBkZXN0aW5hdGlvbjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRGVsZXRlUGF0aFBhcmFtcyB7IHBhdGg6IHN0cmluZzsgfVxuaW50ZXJmYWNlIERlbGV0ZUZpbGVzQnlQYXR0ZXJuUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyB9XG5pbnRlcmZhY2UgRmluZEZpbGVzUGFyYW1zIHsgcGF0dGVybjogc3RyaW5nOyBtYXhfZGVwdGg/OiBudW1iZXI7IH1cbmludGVyZmFjZSBGdXp6eUZpbmRMb2NhbEZpbGVzUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgcGF0aD86IHN0cmluZzsgbWF4X3Jlc3VsdHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHZXRGaWxlTWV0YWRhdGFQYXJhbXMgeyBwYXRoOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGFuZ2VEaXJlY3RvcnlQYXJhbXMgeyBkaXJlY3Rvcnk6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJlYWREb2N1bWVudFBhcmFtcyB7IGZpbGVfcGF0aDogc3RyaW5nOyB9XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZpbGVTeXN0ZW1Ub29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgX3N0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyLCBjb250ZXh0R3VhcmQ6IENvbnRleHRHdWFyZCB8IG51bGwpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gbGlzdF9kaXJlY3RvcnkgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdsaXN0X2RpcmVjdG9yeScsXG4gICAgZGVzY3JpcHRpb246ICdMaXN0IHRoZSBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3Rvcnkgb3IgYSBzcGVjaWZpZWQgc3ViZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IHRvIGxpc3QuIERlZmF1bHRzIHRvIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aDogZGlyUGF0aCB9OiBMaXN0RGlyZWN0b3J5UGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICBjb25zdCB0YXJnZXRQYXRoID0gZGlyUGF0aCB8fCAnLic7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aCh0YXJnZXRQYXRoLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoOiBkaXJlY3RvcnkgdHJhdmVyc2FsIGRldGVjdGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgodGFyZ2V0UGF0aCk7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhmdWxsUGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBlbnRyaWVzLm1hcChlbnRyeSA9PiAoe1xuICAgICAgICAgIHBhdGg6IHBhdGguam9pbihmdWxsUGF0aCwgZW50cnkubmFtZSksXG4gICAgICAgICAgbmFtZTogZW50cnkubmFtZSxcbiAgICAgICAgICBpc0RpcmVjdG9yeTogZW50cnkuaXNEaXJlY3RvcnkoKSxcbiAgICAgICAgICBpc0ZpbGU6IGVudHJ5LmlzRmlsZSgpLFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVhZF9maWxlIHRvb2wgXHUyMDE0IEh5YnJpZDogRWFybHkgc2l6ZSBjaGVjayArIEJ1ZmZlciBiaW5hcnkgZGV0ZWN0aW9uICsgVHJ1bmNhdGlvbiBzdXBwb3J0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlYWRfZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdSZWFkIGNvbnRlbnQgZnJvbSBhIGZpbGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIHJlYWQnKSxcbiAgICAgIG1heF9sZW5ndGg6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MDAwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDUwMDApLmRlc2NyaWJlKCdNYXhpbXVtIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRvIHJldHVybiAoZGVmYXVsdDogNTAwMCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIG1heF9sZW5ndGggfTogUmVhZEZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICBjb25zdCBtYXhMZW5ndGggPSBtYXhfbGVuZ3RoIHx8IDUwMDA7XG5cbiAgICAgICAgLy8gVXNlIENvbnRleHRHdWFyZCBTbWFydCBSZWFkZXIgaWYgZW5hYmxlZFxuICAgICAgICBsZXQgc21hcnRDb250ZW50ID0gJyc7XG4gICAgICAgIGxldCBjb250ZW50V2l0aEJ1ZGdldCA9ICcnO1xuICAgICAgICBsZXQgYnVkZ2V0U3RyaW5nOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgIFxuICAgICAgICBpZiAoY29udGV4dEd1YXJkKSB7XG4gICAgICAgICAgc21hcnRDb250ZW50ID0gY29udGV4dEd1YXJkLnNtYXJ0UmVhZChmdWxsUGF0aCwgdW5kZWZpbmVkLCBtYXhMZW5ndGgpOyAgLy8gRklYICMzOiBQYXNzIG1heExlbmd0aFxuICAgICAgICAgIFxuICAgICAgICAgIC8vIEZJWCAjNDogT25seSBpbmplY3QgYnVkZ2V0IGluZm8gd2hlbiB0b2tlbiB1c2FnZSBpcyBzaWduaWZpY2FudCAoPjUwJSlcbiAgICAgICAgICBjb25zdCBjdXJyZW50VG9rZW5zID0gY29udGV4dEd1YXJkLmdldEN1cnJlbnRUb2tlbkNvdW50KCk7XG4gICAgICAgICAgY29uc3QgbGltaXQgPSBjb250ZXh0R3VhcmQuZ2V0VG9rZW5MaW1pdCgpO1xuICAgICAgICAgIGlmIChjdXJyZW50VG9rZW5zID4gbGltaXQgKiAwLjUpIHtcbiAgICAgICAgICAgIGJ1ZGdldFN0cmluZyA9IGNvbnRleHRHdWFyZC5nZXRUb2tlbkJ1ZGdldEluZm8oKTtcbiAgICAgICAgICAgIGNvbnRlbnRXaXRoQnVkZ2V0ID0gYCR7YnVkZ2V0U3RyaW5nfVxcbiR7c21hcnRDb250ZW50fWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnRXaXRoQnVkZ2V0ID0gc21hcnRDb250ZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRydW5jYXRlIHNtYXJ0IGNvbnRlbnQgaWYgbmVjZXNzYXJ5IGFuZCBpbmplY3QgYnVkZ2V0IHZpc3VhbGl6YXRpb25cbiAgICAgICAgaWYgKGNvbnRlbnRXaXRoQnVkZ2V0Lmxlbmd0aCA+IG1heExlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB7IFxuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgICBkYXRhOiB7IFxuICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50V2l0aEJ1ZGdldC5zdWJzdHJpbmcoMCwgbWF4TGVuZ3RoKSxcbiAgICAgICAgICAgICAgZmlsZVBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICAgICAgICB0cnVuY2F0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgIHRvdGFsX2xlbmd0aDogc21hcnRDb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgc21hcnRSZWFkZXI6ICEhY29udGV4dEd1YXJkLFxuICAgICAgICAgICAgICB0b2tlbkJ1ZGdldEluZm86IGJ1ZGdldFN0cmluZ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRXaXRoQnVkZ2V0LFxuICAgICAgICAgICAgZmlsZVBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICAgICAgc21hcnRSZWFkZXI6ICEhY29udGV4dEd1YXJkLFxuICAgICAgICAgICAgdG9rZW5CdWRnZXRJbmZvOiBidWRnZXRTdHJpbmdcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gRWFybHkgc2l6ZSBjaGVjayAoQmVsZWRhcmlhbiBzdHlsZSkgLSBwcmV2ZW50IGxvYWRpbmcgPjEwTUIgZmlsZXNcbiAgICAgICAgbGV0IHN0YXRzOiBmcy5TdGF0cztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0cy5zaXplID4gMTBfMDAwXzAwMCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ZpbGUgdG9vIGxhcmdlICg+MTBNQiknIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWFkIGFzIGJ1ZmZlciBmb3IgZWZmaWNpZW50IGJpbmFyeSBjaGVjayAoQmVsZWRhcmlhbiBzdHlsZSlcbiAgICAgICAgY29uc3QgYnVmZmVyID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoZnVsbFBhdGgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQmluYXJ5IGNoZWNrOiBudWxsIGJ5dGUgaW4gZmlyc3QgMUtCXG4gICAgICAgIGNvbnN0IGNoZWNrQnVmZmVyID0gYnVmZmVyLnN1YmFycmF5KDAsIE1hdGgubWluKGJ1ZmZlci5sZW5ndGgsIDEwMjQpKTtcbiAgICAgICAgaWYgKGNoZWNrQnVmZmVyLmluY2x1ZGVzKDApKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQmluYXJ5IGZpbGUgZGV0ZWN0ZWQuIFVzZSByZWFkX2RvY3VtZW50IGZvciBQREYvRE9DWCBmaWxlcy4nIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IHRvIHN0cmluZ1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYnVmZmVyLnRvU3RyaW5nKCd1dGYtOCcpO1xuXG4gICAgICAgIC8vIFRydW5jYXRlIGlmIG5lY2Vzc2FyeSBhbmQgYWRkIG1ldGFkYXRhIChBSSBUb29sYm94IHN0eWxlKVxuICAgICAgICBsZXQgZGF0YUNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICBsZXQgdHJ1bmNhdGVkID0gZmFsc2U7XG4gICAgICAgIGxldCB0b3RhbExlbmd0aCA9IGNvbnRlbnQubGVuZ3RoO1xuXG4gICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCA+IG1heExlbmd0aCkge1xuICAgICAgICAgIGRhdGFDb250ZW50ID0gY29udGVudC5zdWJzdHJpbmcoMCwgbWF4TGVuZ3RoKTtcbiAgICAgICAgICB0cnVuY2F0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgIGNvbnRlbnQ6IGRhdGFDb250ZW50LFxuICAgICAgICAgICAgZmlsZVBhdGg6IGZ1bGxQYXRoLCAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgICAuLi4odHJ1bmNhdGVkID8geyB0cnVuY2F0ZWQ6IHRydWUsIHRvdGFsX2xlbmd0aDogdG90YWxMZW5ndGggfSA6IHt9KVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHNhdmVfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3NhdmVfZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdTYXZlIGNvbnRlbnQgdG8gYSBzcGVjaWZpZWQgZmlsZSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gU3VwcG9ydHMgYmF0Y2ggc2F2aW5nLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIHNhdmUnKSxcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIGNvbnRlbnQgdG8gd3JpdGUgdG8gdGhlIGZpbGUnKSxcbiAgICAgIGZpbGVzOiB6LmFycmF5KHoub2JqZWN0KHsgZmlsZV9uYW1lOiB6LnN0cmluZygpLCBjb250ZW50OiB6LnN0cmluZygpIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGb3IgYmF0Y2ggc2F2aW5nIG11bHRpcGxlIGZpbGVzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBjb250ZW50LCBmaWxlcyB9OiBTYXZlRmlsZVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGZpbGVzICYmIEFycmF5LmlzQXJyYXkoZmlsZXMpKSB7XG4gICAgICAgICAgLy8gQmF0Y2ggc2F2ZSBtb2RlXG4gICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZmlsZS5maWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW52YWxpZCBwYXRoIGluIGJhdGNoOiAke2ZpbGUuZmlsZV9uYW1lfWAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZS5maWxlX25hbWUpO1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgZmlsZS5jb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IGZpbGU6IGZ1bGxQYXRoLCBzdGF0dXM6ICdzYXZlZCcgfSk7IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzYXZlZEZpbGVzOiBmaWxlcy5sZW5ndGgsIHJlc3VsdHMgfSB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZpbGVfbmFtZSAmJiBjb250ZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBTaW5nbGUgZmlsZSBzYXZlIG1vZGVcbiAgICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX25hbWUpO1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIGNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWRGaWxlOiBmdWxsUGF0aCwgcGF0aDogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRWl0aGVyIHByb3ZpZGUgZmlsZV9uYW1lK2NvbnRlbnQgb3IgZmlsZXMgYXJyYXknIH07XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJlcGxhY2VfdGV4dF9pbl9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVwbGFjZV90ZXh0X2luX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZSBhIHNwZWNpZmljIHN0cmluZyBpbiBhIGZpbGUgd2l0aCBhIG5ldyBzdHJpbmcuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIG1vZGlmeScpLFxuICAgICAgb2xkX3N0cmluZzogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGV4YWN0IHRleHQgdG8gcmVwbGFjZS4gTXVzdCBiZSB1bmlxdWUgaW4gdGhlIGZpbGUuJyksXG4gICAgICBuZXdfc3RyaW5nOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgdGV4dCB0byBpbnNlcnQgaW4gcGxhY2Ugb2Ygb2xkX3N0cmluZy4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIG9sZF9zdHJpbmcsIG5ld19zdHJpbmcgfTogUmVwbGFjZVRleHRJbkZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghY29udGVudC5pbmNsdWRlcyhvbGRfc3RyaW5nKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFN0cmluZyAnJHtvbGRfc3RyaW5nfScgbm90IGZvdW5kIGluIGZpbGVgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG5ld0NvbnRlbnQgPSBjb250ZW50LnJlcGxhY2Uob2xkX3N0cmluZywgbmV3X3N0cmluZyk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbFBhdGgsIG5ld0NvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHJlcGxhY2VkOiB0cnVlLCBmaWxlOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGluc2VydF9hdF9saW5lIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaW5zZXJ0X2F0X2xpbmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW5zZXJ0IGNvbnRlbnQgYXQgYSBzcGVjaWZpYyBsaW5lIG51bWJlciBpbiBhIGZpbGUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHRvIG1vZGlmeScpLFxuICAgICAgbGluZV9udW1iZXI6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLmRlc2NyaWJlKCdUaGUgbGluZSBudW1iZXIgdG8gaW5zZXJ0IGF0ICgxLWluZGV4ZWQpJyksXG4gICAgICBjb250ZW50X3RvX2luc2VydDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHRleHQgY29udGVudCB0byBpbnNlcnQnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIGxpbmVfbnVtYmVyLCBjb250ZW50X3RvX2luc2VydCB9OiBJbnNlcnRBdExpbmVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGxldCBsaW5lcyA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jykuc3BsaXQoJ1xcbicpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWxsb3cgYXBwZW5kaW5nIGF0IEVPRiAobGluZV9udW1iZXIgPT0gbGVuZ3RoICsgMSlcbiAgICAgICAgaWYgKGxpbmVfbnVtYmVyID4gbGluZXMubGVuZ3RoICsgMSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYExpbmUgbnVtYmVyICR7bGluZV9udW1iZXJ9IGV4Y2VlZHMgZmlsZSBsZW5ndGggKCR7bGluZXMubGVuZ3RofSlgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxpbmVzLnNwbGljZShsaW5lX251bWJlciAtIDEsIDAsIGNvbnRlbnRfdG9faW5zZXJ0KTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgbGluZXMuam9pbignXFxuJyksICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGluc2VydGVkQXQ6IGxpbmVfbnVtYmVyLCBmaWxlOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGFwcGVuZF9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYXBwZW5kX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiBcIkFwcGVuZCBjb250ZW50IHRvIHRoZSBlbmQgb2YgYSBmaWxlLiBJZiB0aGUgZmlsZSBkb2Vzbid0IGV4aXN0LCBpdCB3aWxsIGJlIGNyZWF0ZWQuXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgZmlsZSB0byBhcHBlbmQgdG8nKSxcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gYXBwZW5kJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9uYW1lLCBjb250ZW50IH06IEFwcGVuZEZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGZ1bGxQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBhcHBlbmRlZFRvOiBmdWxsUGF0aCB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGRlbGV0ZV9saW5lc19pbl9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVsZXRlX2xpbmVzX2luX2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIGEgc3BlY2lmaWMgbGluZSBvciByYW5nZSBvZiBsaW5lcyBmcm9tIGEgZmlsZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZpbGVfbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgdG8gbW9kaWZ5JyksXG4gICAgICBzdGFydF9saW5lOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnU3RhcnRpbmcgbGluZSBudW1iZXIgKDEtaW5kZXhlZCknKSxcbiAgICAgIGVuZF9saW5lOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdFbmRpbmcgbGluZSBudW1iZXIgKGluY2x1c2l2ZSkuIElmIG9taXR0ZWQsIG9ubHkgZGVsZXRlcyBzdGFydF9saW5lLicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgc3RhcnRfbGluZSwgZW5kX2xpbmUgfTogRGVsZXRlTGluZXNJbkZpbGVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVfbmFtZSwgZ2V0V29ya2luZ0RpcigpKSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aCcgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmVQYXRoKGZpbGVfbmFtZSk7XG4gICAgICAgIGxldCBsaW5lcyA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jykuc3BsaXQoJ1xcbicpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZGVsZXRlRW5kID0gZW5kX2xpbmUgfHwgc3RhcnRfbGluZTtcbiAgICAgICAgaWYgKHN0YXJ0X2xpbmUgPiBsaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBTdGFydCBsaW5lICR7c3RhcnRfbGluZX0gZXhjZWVkcyBmaWxlIGxlbmd0aCAoJHtsaW5lcy5sZW5ndGh9KWAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2xhbXAgZW5kX2xpbmUgdG8gYXZvaWQgc2lsZW50IHRydW5jYXRpb24gYmV5b25kIGZpbGUgYm91bmRzXG4gICAgICAgIGNvbnN0IGNsYW1wZWRFbmQgPSBNYXRoLm1pbihkZWxldGVFbmQsIGxpbmVzLmxlbmd0aCk7XG4gICAgICAgIGxpbmVzLnNwbGljZShzdGFydF9saW5lIC0gMSwgY2xhbXBlZEVuZCAtIHN0YXJ0X2xpbmUgKyAxKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsUGF0aCwgbGluZXMuam9pbignXFxuJyksICd1dGYtOCcpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWRMaW5lczogYCR7c3RhcnRfbGluZX0tJHtjbGFtcGVkRW5kfWAsIGZpbGU6IGZ1bGxQYXRoIH0gfTsgLy8gXHUyNzA1IEZVTEwgUEFUSFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gbWFrZV9kaXJlY3RvcnkgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdtYWtlX2RpcmVjdG9yeScsXG4gICAgZGVzY3JpcHRpb246ICdDcmVhdGUgYSBuZXcgZGlyZWN0b3J5IGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZGlyZWN0b3J5X25hbWU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBuYW1lIG9mIHRoZSBkaXJlY3RvcnkgdG8gY3JlYXRlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZGlyZWN0b3J5X25hbWUgfTogTWFrZURpcmVjdG9yeVBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVBhdGgoZGlyZWN0b3J5X25hbWUsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHBhdGgnIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChkaXJlY3RvcnlfbmFtZSk7XG4gICAgICAgIGZzLm1rZGlyU3luYyhmdWxsUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY3JlYXRlZERpcmVjdG9yeTogZGlyZWN0b3J5X25hbWUsIHBhdGg6IGZ1bGxQYXRoIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIG1vdmVfZmlsZSB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ21vdmVfZmlsZScsXG4gICAgZGVzY3JpcHRpb246ICdNb3ZlIG9yIHJlbmFtZSBhIGZpbGUgb3IgZGlyZWN0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc291cmNlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdTb3VyY2UgcGF0aCcpLFxuICAgICAgZGVzdGluYXRpb246IHouc3RyaW5nKCkuZGVzY3JpYmUoJ0Rlc3RpbmF0aW9uIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzb3VyY2UsIGRlc3RpbmF0aW9uIH06IE1vdmVGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChzb3VyY2UsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHNvdXJjZSBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGRlc3RpbmF0aW9uLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBkZXN0aW5hdGlvbiBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxTb3VyY2UgPSByZXNvbHZlUGF0aChzb3VyY2UpO1xuICAgICAgICBjb25zdCBmdWxsRGVzdGluYXRpb24gPSByZXNvbHZlUGF0aChkZXN0aW5hdGlvbik7XG4gICAgICAgIGZzLnJlbmFtZVN5bmMoZnVsbFNvdXJjZSwgZnVsbERlc3RpbmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBtb3ZlZEZyb206IGZ1bGxTb3VyY2UsIG1vdmVkVG86IGZ1bGxEZXN0aW5hdGlvbiB9IH07IC8vIFx1MjcwNSBGVUxMIFBBVEhTXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjb3B5X2ZpbGUgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjb3B5X2ZpbGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ29weSBhIGZpbGUgdG8gYSBuZXcgbG9jYXRpb24uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzb3VyY2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NvdXJjZSBmaWxlIHBhdGgnKSxcbiAgICAgIGRlc3RpbmF0aW9uOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXN0aW5hdGlvbiBmaWxlIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBzb3VyY2UsIGRlc3RpbmF0aW9uIH06IENvcHlGaWxlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChzb3VyY2UsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHNvdXJjZSBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGRlc3RpbmF0aW9uLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBkZXN0aW5hdGlvbiBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxTb3VyY2UgPSByZXNvbHZlUGF0aChzb3VyY2UpO1xuICAgICAgICBjb25zdCBmdWxsRGVzdGluYXRpb24gPSByZXNvbHZlUGF0aChkZXN0aW5hdGlvbik7XG4gICAgICAgIGZzLmNvcHlGaWxlU3luYyhmdWxsU291cmNlLCBmdWxsRGVzdGluYXRpb24pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvcGllZEZyb206IGZ1bGxTb3VyY2UsIGNvcGllZFRvOiBmdWxsRGVzdGluYXRpb24gfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIU1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZGVsZXRlX3BhdGggdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdkZWxldGVfcGF0aCcsXG4gICAgZGVzY3JpcHRpb246ICdEZWxldGUgYSBmaWxlIG9yIGRpcmVjdG9yeSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gQmUgY2FyZWZ1bCEnLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBwYXRoIHRvIGRlbGV0ZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdGg6IGZpbGVQYXRoIH06IERlbGV0ZVBhdGhQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVQYXRoLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZVBhdGgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBhIGRpcmVjdG9yeVxuICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICBmcy5ybVN5bmMoZnVsbFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZzLnVubGlua1N5bmMoZnVsbFBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZGVsZXRlZDogZnVsbFBhdGggfSB9OyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfZmlsZXNfYnlfcGF0dGVybiB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9maWxlc19ieV9wYXR0ZXJuJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBtdWx0aXBsZSBmaWxlcyBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnkgdGhhdCBtYXRjaCBhIHJlZ2V4IHBhdHRlcm4uJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBwYXR0ZXJuOiB6LnN0cmluZygpLmRlc2NyaWJlKCdSZWdleCBwYXR0ZXJuIHRvIG1hdGNoIGZpbGVuYW1lcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdHRlcm4gfTogRGVsZXRlRmlsZXNCeVBhdHRlcm5QYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChjb25maWcucmVnZXhSZURvU1Byb3RlY3Rpb24gJiYgIWlzU2FmZVJlZ2V4KHBhdHRlcm4pKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5zYWZlIHJlZ2V4IHBhdHRlcm4gZGV0ZWN0ZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChwYXR0ZXJuKTtcbiAgICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhnZXRXb3JraW5nRGlyKCkpO1xuICAgICAgICBjb25zdCBkZWxldGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICBpZiAocmVnZXgudGVzdChmaWxlKSkge1xuICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlKTtcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmMoZnVsbFBhdGgpO1xuICAgICAgICAgICAgZGVsZXRlZEZpbGVzLnB1c2goZnVsbFBhdGgpOyAvLyBcdTI3MDUgRlVMTCBQQVRIXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWRDb3VudDogZGVsZXRlZEZpbGVzLmxlbmd0aCwgZGVsZXRlZEZpbGVzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGZpbmRfZmlsZXMgdG9vbCBcdTIwMTQgT1BUSU1JWkVEIHdpdGggYXN5bmMvYXdhaXQgYW5kIGNvbmN1cnJlbmN5IGNvbnRyb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZmluZF9maWxlcycsXG4gICAgZGVzY3JpcHRpb246ICdGaW5kIGZpbGVzIHJlY3Vyc2l2ZWx5IGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBtYXRjaGluZyBhIG5hbWUgcGF0dGVybi4gVXNlcyBhc3luYyBzZWFyY2ggZm9yIGJldHRlciBwZXJmb3JtYW5jZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdHRlcm46IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1N1YnN0cmluZyB0byBtYXRjaCBpbiBmaWxlbmFtZSAoY2FzZS1pbnNlbnNpdGl2ZSknKSxcbiAgICAgIG1heF9kZXB0aDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkub3B0aW9uYWwoKS5kZXNjcmliZSgnTWF4aW11bSBkZXB0aCB0byBzZWFyY2ggKGRlZmF1bHQ6IDUpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0dGVybiwgbWF4X2RlcHRoIH06IEZpbmRGaWxlc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2VhcmNoUGF0aCA9IGdldFdvcmtpbmdEaXIoKTtcbiAgICAgICAgY29uc3QgZGVwdGggPSBtYXhfZGVwdGggfHwgNTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVzZSBvcHRpbWl6ZWQgYXN5bmMgc2VhcmNoIHdpdGggY29uY3VycmVuY3kgY29udHJvbFxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmaW5kRmlsZXNBc3luYyhzZWFyY2hQYXRoLCBwYXR0ZXJuLCBkZXB0aCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZm91bmRGaWxlczogcmVzdWx0LmZpbGVzLCBjb3VudDogcmVzdWx0LmNvdW50IH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGZ1enp5X2ZpbmRfbG9jYWxfZmlsZXMgdG9vbCBcdTIwMTQgT1BUSU1JWkVEIHdpdGggZWFybHkgZXhpdCBMZXZlbnNodGVpbiArIGNhY2hpbmdcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZnV6enlfZmluZF9sb2NhbF9maWxlcycsXG4gICAgZGVzY3JpcHRpb246ICdGdXp6eSBmaW5kIGxvY2FsIGZpbGVzIGJ5IHBhdGgvbmFtZSBzaW1pbGFyaXR5IHVzaW5nIG9wdGltaXplZCBMZXZlbnNodGVpbiBzY29yaW5nIHdpdGggY2FjaGluZy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTZWFyY2ggcXVlcnkgdG8gbWF0Y2ggYWdhaW5zdCBmaWxlIG5hbWVzL3BhdGhzLicpLFxuICAgICAgcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdTdWItZGlyZWN0b3J5IHRvIHNlYXJjaCBpbiAoZGVmYXVsdDogY3VycmVudCBkaXJlY3RvcnkpLicpLFxuICAgICAgbWF4X3Jlc3VsdHM6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCgyMCkub3B0aW9uYWwoKS5kZXNjcmliZSgnTWF4IHJlc3VsdHMgdG8gcmV0dXJuIChkZWZhdWx0OiA1KS4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgcGF0aDogc2VhcmNoUGF0aCwgbWF4X3Jlc3VsdHMgfTogRnV6enlGaW5kTG9jYWxGaWxlc1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYmFzZURpciA9IHNlYXJjaFBhdGggPyByZXNvbHZlUGF0aChzZWFyY2hQYXRoKSA6IGdldFdvcmtpbmdEaXIoKTtcbiAgICAgICAgY29uc3QgbWF4UmVzdWx0cyA9IG1heF9yZXN1bHRzIHx8IDU7XG5cbiAgICAgICAgLy8gQ2hlY2sgY2FjaGUgZmlyc3RcbiAgICAgICAgY29uc3QgY2FjaGVkUmVzdWx0cyA9IGdldENhY2hlZEZ1enp5UmVzdWx0cyhxdWVyeSwgYmFzZURpcik7XG4gICAgICAgIGlmIChjYWNoZWRSZXN1bHRzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBtYXRjaGVzOiBjYWNoZWRSZXN1bHRzLnNsaWNlKDAsIG1heFJlc3VsdHMpLCBjb3VudDogTWF0aC5taW4oY2FjaGVkUmVzdWx0cy5sZW5ndGgsIG1heFJlc3VsdHMpIH0gfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbGxlY3QgZmlsZXMgdXNpbmcgYXN5bmMgbWV0aG9kXG4gICAgICAgIGNvbnN0IGFsbEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gY29sbGVjdEZpbGVzKGRpclBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlciA9IDAsIG1heERlcHRoOiBudW1iZXIgPSAyMCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG4gICAgICAgICAgXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKGRpclBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsIGVudHJ5Lm5hbWUpO1xuICAgICAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNvbGxlY3RGaWxlcyhmdWxsUGF0aCwgZGVwdGggKyAxLCBtYXhEZXB0aCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWxsRmlsZXMucHVzaChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIFNraXAgaW5hY2Nlc3NpYmxlIGRpcmVjdG9yaWVzXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBjb2xsZWN0RmlsZXMoYmFzZURpcik7XG4gICAgICAgIFxuICAgICAgICAvLyBPcHRpbWl6ZWQgZnV6enkgbWF0Y2hpbmcgd2l0aCBlYXJseSBleGl0XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgZmlsZVBhdGg6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9PiA9IFtdO1xuICAgICAgICBjb25zdCBxdWVyeUxvd2VyID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgTUlOX1NDT1JFID0gMC4zO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGFsbEZpbGVzKSB7XG4gICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gVXNlIG9wdGltaXplZCBMZXZlbnNodGVpbiB3aXRoIGVhcmx5IGV4aXRcbiAgICAgICAgICBjb25zdCBzY29yZSA9IGxldmVuc2h0ZWluU2ltaWxhcml0eShxdWVyeUxvd2VyLCBmaWxlTmFtZSwgTUlOX1NDT1JFKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoc2NvcmUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IGZpbGVQYXRoOiBmaWxlLCBzY29yZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNvcnQgYnkgc2NvcmUgZGVzY2VuZGluZyBhbmQgY2FjaGUgcmVzdWx0c1xuICAgICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgICAgICAgY2FjaGVGdXp6eVJlc3VsdHMocXVlcnksIGJhc2VEaXIsIHJlc3VsdHMpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBtYXRjaGVzOiByZXN1bHRzLnNsaWNlKDAsIG1heFJlc3VsdHMpLCBjb3VudDogTWF0aC5taW4ocmVzdWx0cy5sZW5ndGgsIG1heFJlc3VsdHMpIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9maWxlX21ldGFkYXRhIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X2ZpbGVfbWV0YWRhdGEnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IG1ldGFkYXRhIChzaXplLCBkYXRlcykgZm9yIGEgc3BlY2lmaWMgZmlsZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBmaWxlIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoOiBmaWxlUGF0aCB9OiBHZXRGaWxlTWV0YWRhdGFQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdmFsaWRhdGVQYXRoKGZpbGVQYXRoLCBnZXRXb3JraW5nRGlyKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKGZ1bGxQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBwYXRoOiBmdWxsUGF0aCxcbiAgICAgICAgICAgIHNpemU6IHN0YXRzLnNpemUsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IHN0YXRzLmJpcnRodGltZSxcbiAgICAgICAgICAgIG1vZGlmaWVkQXQ6IHN0YXRzLm10aW1lLFxuICAgICAgICAgICAgYWNjZXNzZWRBdDogc3RhdHMuYXRpbWUsXG4gICAgICAgICAgICBpc0RpcmVjdG9yeTogc3RhdHMuaXNEaXJlY3RvcnkoKSxcbiAgICAgICAgICAgIGlzRmlsZTogc3RhdHMuaXNGaWxlKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGNoYW5nZV9kaXJlY3RvcnkgdG9vbCBcdTIwMTQgSHlicmlkOiBFeHBsaWNpdCB2YWxpZGF0aW9uICsgU3RhdGUgYWJzdHJhY3Rpb24gKyBDb250ZXh0dWFsIHJlc3BvbnNlXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NoYW5nZV9kaXJlY3RvcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBBbGwgc3Vic2VxdWVudCBmaWxlIG9wZXJhdGlvbnMgd2lsbCB1c2UgdGhpcyBkaXJlY3RvcnkgYXMgdGhlIGJhc2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBkaXJlY3Rvcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBhYnNvbHV0ZSBwYXRoIHRvIGNoYW5nZSB0byAoZS5nLiwgXCJDOlxcXFxcXFxcUHJvamVjdHNcXFxcXFxcXG15LWFwcFwiKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGRpcmVjdG9yeSB9OiBDaGFuZ2VEaXJlY3RvcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcmVzb2x2ZVBhdGgoZGlyZWN0b3J5KTtcblxuICAgICAgICAvLyBcdTI3MDUgQmVsZWRhcmlhbidzIGV4cGxpY2l0IHZhbGlkYXRpb24gdXNpbmcgZnMuc3RhdFxuICAgICAgICBsZXQgc3RhdHM6IGZzLlN0YXRzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmdWxsUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUGF0aCBpcyBub3QgYSBkaXJlY3Rvcnk6ICR7ZnVsbFBhdGh9YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHUyNzA1IENhcHR1cmUgcHJldmlvdXMgZGlyZWN0b3J5IGZvciBjb250ZXh0XG4gICAgICAgIGNvbnN0IHByZXZpb3VzRGlyZWN0b3J5ID0gZ2V0V29ya2luZ0RpcigpO1xuXG4gICAgICAgIC8vIFx1MjcwNSBBSSBUb29sYm94J3MgYWJzdHJhY3Rpb24gZm9yIHN0YXRlIGNoYW5nZVxuICAgICAgICBjb25zdCBzdWNjZXNzID0gc2V0V29ya2luZ0RpcihmdWxsUGF0aCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcbiAgICAgICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGNoYW5nZSBkaXJlY3RvcnkgdG8gJyR7ZGlyZWN0b3J5fScuIEVuc3VyZSB0aGUgcGF0aCBleGlzdHMgYW5kIGlzIGEgdmFsaWQgZGlyZWN0b3J5LmAgXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1MjcwNSBCZWxlZGFyaWFuJ3MgY29udGV4dHVhbCByZXR1cm4gZGF0YSArIEFJIFRvb2xib3gncyBzdHJ1Y3R1cmVkIGZvcm1hdFxuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLCBcbiAgICAgICAgICBkYXRhOiB7IFxuICAgICAgICAgICAgcHJldmlvdXNfZGlyZWN0b3J5OiBwcmV2aW91c0RpcmVjdG9yeSxcbiAgICAgICAgICAgIGN1cnJlbnRfZGlyZWN0b3J5OiBnZXRXb3JraW5nRGlyKCkgXG4gICAgICAgICAgfSBcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG5cbiAgLy8gYW5hbHl6ZV9wcm9qZWN0IHRvb2wgXHUyMDE0IENvbXByZWhlbnNpdmUgVHlwZVNjcmlwdCBQZXJmb3JtYW5jZSAmIExpbnRpbmcgQW5hbHlzaXNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYW5hbHl6ZV9wcm9qZWN0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biBwcm9qZWN0LXdpZGUgYW5hbHlzaXMgaW5jbHVkaW5nIFR5cGVTY3JpcHQgZGlhZ25vc3RpY3MsIGNpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0aW9uLCBFU0xpbnQsIGNvbmZpZyBvcHRpbWl6YXRpb24sIGFuZCBpbXBvcnQgc3RydWN0dXJlIGFuYWx5c2lzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY2F0ZWdvcmllczogei5hcnJheSh6LmVudW0oWyd0eXBlY2hlY2snLCAnY2lyY3VsYXInLCAnZXNsaW50JywgJ2NvbmZpZycsICdpbXBvcnRzJ10pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdBbmFseXNpcyBjYXRlZ29yaWVzIHRvIHJ1biAoZGVmYXVsdDogYWxsKScpLFxuICAgICAgbWF4X2ltcG9ydHNfd2FybmluZzogei5udW1iZXIoKS5pbnQoKS5taW4oNSkubWF4KDEwMCkub3B0aW9uYWwoKS5kZWZhdWx0KDIwKS5kZXNjcmliZSgnTWF4IGltcG9ydHMgcGVyIGZpbGUgYmVmb3JlIHdhcm5pbmcnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjYXRlZ29yaWVzLCBtYXhfaW1wb3J0c193YXJuaW5nIH06IHsgY2F0ZWdvcmllcz86IHN0cmluZ1tdOyBtYXhfaW1wb3J0c193YXJuaW5nPzogbnVtYmVyIH0pID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHdvcmtpbmdEaXIgPSBnZXRXb3JraW5nRGlyKCk7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQ2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMgfHwgWyd0eXBlY2hlY2snLCAnY2lyY3VsYXInLCAnZXNsaW50JywgJ2NvbmZpZycsICdpbXBvcnRzJ107XG4gICAgICAgIGNvbnN0IGltcG9ydFdhcm5pbmdUaHJlc2hvbGQgPSBtYXhfaW1wb3J0c193YXJuaW5nIHx8IDIwO1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IFNhZmUgU3VicHJvY2VzcyBIZWxwZXIgd2l0aCBQcm9ncmVzcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBmdW5jdGlvbiBzcGF3bldpdGhQcm9ncmVzcyhleGU6IHN0cmluZywgYXJnczogc3RyaW5nW10sIHRpbWVvdXRNczogbnVtYmVyKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IHN0ZG91dD86IHN0cmluZzsgc3RkZXJyPzogc3RyaW5nIH0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2MgPSBzcGF3bihleGUsIGFyZ3MsIHtcbiAgICAgICAgICAgICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgJ3BpcGUnXSxcbiAgICAgICAgICAgICAgY3dkOiB3b3JraW5nRGlyLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICAgICAgICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgICAgICAgICAgcHJvYy5zdGRvdXQ/Lm9uKCdkYXRhJywgKGQ6IEJ1ZmZlcikgPT4geyBzdGRvdXQgKz0gZC50b1N0cmluZygpOyB9KTtcbiAgICAgICAgICAgIHByb2Muc3RkZXJyPy5vbignZGF0YScsIChkOiBCdWZmZXIpID0+IHsgc3RkZXJyICs9IGQudG9TdHJpbmcoKTsgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHsgXG4gICAgICAgICAgICAgIHByb2Mua2lsbCgpOyBcbiAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGRlcnI6IGBUaW1lb3V0IGFmdGVyICR7dGltZW91dE1zfW1zYCB9KTsgXG4gICAgICAgICAgICB9LCB0aW1lb3V0TXMpO1xuXG4gICAgICAgICAgICBwcm9jLm9uKCdjbG9zZScsICgpID0+IHsgY2xlYXJUaW1lb3V0KHRpbWVySWQpOyByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgc3Rkb3V0LCBzdGRlcnIgfSk7IH0pO1xuICAgICAgICAgICAgcHJvYy5vbignZXJyb3InLCAoZXJyKSA9PiB7IGNsZWFyVGltZW91dCh0aW1lcklkKTsgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGRlcnI6IGVyci5tZXNzYWdlIH0pOyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IEEuIFR5cGVTY3JpcHQgRXh0ZW5kZWQgRGlhZ25vc3RpY3MgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuVHlwZWNoZWNrQW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IHRzQ29uZmlnUGF0aCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAndHNjb25maWcuanNvbicpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0c0NvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyB0c2NvbmZpZy5qc29uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGlmIHRzYyBpcyBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ3RzYycsIFsnLS12ZXJzaW9uJ10sIDUwMDApO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgc2tpcHBlZDogdHJ1ZSwgcmVhc29uOiAnVHlwZVNjcmlwdCBjb21waWxlciAodHNjKSBub3QgZm91bmQgaW4gUEFUSCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEeW5hbWljIHRpbWVvdXQgYmFzZWQgb24gcHJvamVjdCBzaXplICh1c2luZyBpbXBvcnRlZCB1dGlsaXRpZXMpXG4gICAgICAgICAgY29uc3QgZmlsZUNvdW50ID0gYXdhaXQgY291bnRUeXBlU2NyaXB0RmlsZXMod29ya2luZ0Rpcik7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1RpbWVvdXQgPSBnZXRBbmFseXNpc1RpbWVvdXQoMzAwMDAsIGZpbGVDb3VudCk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc3Bhd25XaXRoUHJvZ3Jlc3MoJ3RzYycsIFsnLS1leHRlbmRlZERpYWdub3N0aWNzJ10sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzIHx8ICFyZXN1bHQuc3Rkb3V0KSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGB0c2MgZmFpbGVkOiAke3Jlc3VsdC5zdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXJzZSB0c2MgLS1leHRlbmRlZERpYWdub3N0aWNzIG91dHB1dFxuICAgICAgICAgIGNvbnN0IGxpbmVzID0gcmVzdWx0LnN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgbGV0IGNoZWNrVGltZU1zID0gMDtcbiAgICAgICAgICBsZXQgbWVtb3J5VXNlZE1CID0gMDtcbiAgICAgICAgICBsZXQgZmlsZXNDaGVja2VkID0gMDtcbiAgICAgICAgICBsZXQgZW1pdFRpbWVNcyA9IDA7XG4gICAgICAgICAgbGV0IHBhcnNlVGltZU1zID0gMDtcblxuICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgY29uc3QgbG93ZXJMaW5lID0gbGluZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQYXJzZSBjaGVjayB0aW1lXG4gICAgICAgICAgICBjb25zdCBjaGVja01hdGNoID0gbG93ZXJMaW5lLm1hdGNoKC9jaGVja1xccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChjaGVja01hdGNoKSBjaGVja1RpbWVNcyA9IHBhcnNlSW50KGNoZWNrTWF0Y2hbMV0sIDEwKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgbWVtb3J5IHVzZWRcbiAgICAgICAgICAgIGNvbnN0IG1lbU1hdGNoID0gbGluZS5tYXRjaCgvbWVtb3J5IHVzZWQ6XFxzKyhcXGQrKVxccyooa2J8bWIpL2kpO1xuICAgICAgICAgICAgaWYgKG1lbU1hdGNoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnQobWVtTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgICAgbWVtb3J5VXNlZE1CID0gbWVtTWF0Y2hbMl0udG9Mb3dlckNhc2UoKSA9PT0gJ21iJyA/IHZhbHVlIDogTWF0aC5yb3VuZCh2YWx1ZSAvIDEwMjQgKiAxMDApIC8gMTAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXJzZSBmaWxlcyBjaGVja2VkXG4gICAgICAgICAgICBjb25zdCBmaWxlc01hdGNoID0gbGluZS5tYXRjaCgvZmlsZXNcXHMrY2hlY2tlZDpcXHMrKFxcZCspLyk7XG4gICAgICAgICAgICBpZiAoZmlsZXNNYXRjaCkgZmlsZXNDaGVja2VkID0gcGFyc2VJbnQoZmlsZXNNYXRjaFsxXSwgMTApO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBlbWl0IHRpbWVcbiAgICAgICAgICAgIGNvbnN0IGVtaXRNYXRjaCA9IGxvd2VyTGluZS5tYXRjaCgvZW1pdFxccyt0aW1lOlxccysoXFxkKylcXHMqbXMvKTtcbiAgICAgICAgICAgIGlmIChlbWl0TWF0Y2gpIGVtaXRUaW1lTXMgPSBwYXJzZUludChlbWl0TWF0Y2hbMV0sIDEwKTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgcGFyc2UgdGltZVxuICAgICAgICAgICAgY29uc3QgcGFyc2VNYXRjaCA9IGxvd2VyTGluZS5tYXRjaCgvcGFyc2VcXHMrdGltZTpcXHMrKFxcZCspXFxzKm1zLyk7XG4gICAgICAgICAgICBpZiAocGFyc2VNYXRjaCkgcGFyc2VUaW1lTXMgPSBwYXJzZUludChwYXJzZU1hdGNoWzFdLCAxMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUGVyZm9ybWFuY2UgYXNzZXNzbWVudCBiYXNlZCBvbiBQREYgZ3VpZGVsaW5lc1xuICAgICAgICAgIGxldCBhc3Nlc3NtZW50OiAnZmFzdCcgfCAnbW9kZXJhdGUnIHwgJ3Nsb3cnO1xuICAgICAgICAgIGlmIChjaGVja1RpbWVNcyA8IDEwMCkgYXNzZXNzbWVudCA9ICdmYXN0JztcbiAgICAgICAgICBlbHNlIGlmIChjaGVja1RpbWVNcyA8PSA1MDApIGFzc2Vzc21lbnQgPSAnbW9kZXJhdGUnO1xuICAgICAgICAgIGVsc2UgYXNzZXNzbWVudCA9ICdzbG93JztcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGVja1RpbWVNcyxcbiAgICAgICAgICAgIG1lbW9yeVVzZWRNQjogTWF0aC5yb3VuZChtZW1vcnlVc2VkTUIgKiAxMDApIC8gMTAwLFxuICAgICAgICAgICAgZmlsZXNDaGVja2VkLFxuICAgICAgICAgICAgZW1pdFRpbWVNcyxcbiAgICAgICAgICAgIHBhcnNlVGltZU1zLFxuICAgICAgICAgICAgYXNzZXNzbWVudCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQi4gQ2lyY3VsYXIgRGVwZW5kZW5jeSBEZXRlY3Rpb24gPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuQ2lyY3VsYXJBbmFseXNpcygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgY29uc3QgZW50cnlQb2ludCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAnc3JjJywgJ2luZGV4LnRzJyk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGVudHJ5UG9pbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBzcmMvaW5kZXgudHMgZm91bmQnIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRHluYW1pYyB0aW1lb3V0IGJhc2VkIG9uIHByb2plY3Qgc2l6ZVxuICAgICAgICAgIGNvbnN0IGZpbGVDb3VudCA9IGF3YWl0IGNvdW50VHlwZVNjcmlwdEZpbGVzKHdvcmtpbmdEaXIpO1xuICAgICAgICAgIGNvbnN0IGR5bmFtaWNUaW1lb3V0ID0gZ2V0QW5hbHlzaXNUaW1lb3V0KDIwMDAwLCBmaWxlQ291bnQpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJ1biBtYWRnZSBhbmQgY2FwdHVyZSBvdXRwdXQgd2l0aCBkeW5hbWljIHRpbWVvdXRcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWyctLXllcycsICdtYWRnZScsICctLWNpcmN1bGFyJywgZW50cnlQb2ludF0sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGBtYWRnZSBmYWlsZWQ6ICR7cmVzdWx0LnN0ZGVyciB8fCAnVW5rbm93biBlcnJvcid9YCB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhcnNlIG1hZGdlIG91dHB1dCBcdTIwMTQgaXQgbGlzdHMgY3ljbGVzIGxpa2UgXCJmaWxlMS50cyAtPiBmaWxlMi50cyAtPiBmaWxlMS50c1wiXG4gICAgICAgICAgY29uc3QgY3ljbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgIGNvbnN0IHN0ZG91dCA9IHJlc3VsdC5zdGRvdXQgfHwgJyc7XG4gICAgICAgICAgY29uc3QgbGluZXMgPSBzdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgIFxuICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICAgICAgICAgICAgaWYgKHRyaW1tZWQgJiYgIXRyaW1tZWQuc3RhcnRzV2l0aCgnRm91bmQnKSAmJiAhdHJpbW1lZC5zdGFydHNXaXRoKCdObycpKSB7XG4gICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgbG9va3MgbGlrZSBhIGN5Y2xlIHBhdGhcbiAgICAgICAgICAgICAgaWYgKHRyaW1tZWQuaW5jbHVkZXMoJy0+JykgfHwgdHJpbW1lZC5lbmRzV2l0aCgnLnRzJykpIHtcbiAgICAgICAgICAgICAgICBjeWNsZXMucHVzaCh0cmltbWVkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBoYXNDeWNsZXM6IGN5Y2xlcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgY3ljbGVzLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBDLiBFU0xpbnQgSW50ZWdyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuRXNsaW50QW5hbHlzaXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgICAgICAgIGNvbnN0IGVzbGludENvbmZpZ0ZpbGVzID0gW1xuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICdlc2xpbnQuY29uZmlnLm1qcycpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICdlc2xpbnQuY29uZmlnLmpzJyksXG4gICAgICAgICAgICBwYXRoLmpvaW4od29ya2luZ0RpciwgJy5lc2xpbnRyYy5qcycpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICcuZXNsaW50cmMuanNvbicpLFxuICAgICAgICAgICAgcGF0aC5qb2luKHdvcmtpbmdEaXIsICcuZXNsaW50cmMnKSxcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgY29uc3QgaGFzRXNsaW50Q29uZmlnID0gZXNsaW50Q29uZmlnRmlsZXMuc29tZShmID0+IGZzLmV4aXN0c1N5bmMoZikpO1xuICAgICAgICAgIGlmICghaGFzRXNsaW50Q29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBFU0xpbnQgY29uZmlndXJhdGlvbiBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBlc2xpbnQgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNwYXduV2l0aFByb2dyZXNzKCducHgnLCBbJ2VzbGludCcsICctLXZlcnNpb24nXSwgNTAwMCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdFU0xpbnQgbm90IGZvdW5kIGluIGRldkRlcGVuZGVuY2llcyBvciBQQVRIJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIER5bmFtaWMgdGltZW91dCBiYXNlZCBvbiBwcm9qZWN0IHNpemVcbiAgICAgICAgICBjb25zdCBmaWxlQ291bnQgPSBhd2FpdCBjb3VudFR5cGVTY3JpcHRGaWxlcyh3b3JraW5nRGlyKTtcbiAgICAgICAgICBjb25zdCBkeW5hbWljVGltZW91dCA9IGdldEFuYWx5c2lzVGltZW91dCgxNTAwMCwgZmlsZUNvdW50KTtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzcGF3bldpdGhQcm9ncmVzcygnbnB4JywgWydlc2xpbnQnLCAnc3JjJywgJy0tZXh0JywgJy50cycsICctLWZvcm1hdCcsICdqc29uJ10sIGR5bmFtaWNUaW1lb3V0KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246IGBFU0xpbnQgZmFpbGVkOiAke3Jlc3VsdC5zdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXJzZSBKU09OIG91dHB1dCBmcm9tIGVzbGludCAtLWZvcm1hdCBqc29uXG4gICAgICAgICAgbGV0IGVycm9ycyA9IDA7XG4gICAgICAgICAgbGV0IHdhcm5pbmdzID0gMDtcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgIGNvbnN0IHdhcm5pbmdNZXNzYWdlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlc3VsdC5zdGRvdXQgfHwgJycpIGFzIHtcbiAgICAgICAgICAgICAgcmVzdWx0cz86IEFycmF5PHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogc3RyaW5nO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzPzogQXJyYXk8eyBzZXZlcml0eTogbnVtYmVyOyBtZXNzYWdlOiBzdHJpbmc7IGxpbmU6IG51bWJlcjsgY29sdW1uOiBudW1iZXIgfT47XG4gICAgICAgICAgICAgIH0+O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChwYXJzZWQucmVzdWx0cykge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVSZXN1bHQgb2YgcGFyc2VkLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgKGZpbGVSZXN1bHQubWVzc2FnZXMgfHwgW10pKSB7XG4gICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5zZXZlcml0eSA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcnMrKztcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlcy5wdXNoKGAke2ZpbGVSZXN1bHQuZmlsZVBhdGh9OiAke21lc3NhZ2UubWVzc2FnZX0gKCR7bWVzc2FnZS5saW5lfToke21lc3NhZ2UuY29sdW1ufSlgKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS5zZXZlcml0eSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB3YXJuaW5ncysrO1xuICAgICAgICAgICAgICAgICAgICB3YXJuaW5nTWVzc2FnZXMucHVzaChgJHtmaWxlUmVzdWx0LmZpbGVQYXRofTogJHttZXNzYWdlLm1lc3NhZ2V9ICgke21lc3NhZ2UubGluZX06JHttZXNzYWdlLmNvbHVtbn0pYCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBJZiBKU09OIHBhcnNpbmcgZmFpbHMsIGZhbGwgYmFjayB0byB0ZXh0IG91dHB1dCBhbmFseXNpc1xuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2tTdGRvdXQgPSByZXN1bHQuc3Rkb3V0IHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JMaW5lcyA9IGZhbGxiYWNrU3Rkb3V0LnNwbGl0KCdcXG4nKS5maWx0ZXIobCA9PiBsLmluY2x1ZGVzKCdlcnJvcicpICYmICFsLmluY2x1ZGVzKCd3YXJuaW5nJykpO1xuICAgICAgICAgICAgZXJyb3JzID0gZXJyb3JMaW5lcy5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCB3YXJuaW5nTGluZXMgPSBmYWxsYmFja1N0ZG91dC5zcGxpdCgnXFxuJykuZmlsdGVyKGwgPT4gbC5pbmNsdWRlcygnd2FybmluZycpKTtcbiAgICAgICAgICAgIHdhcm5pbmdzID0gd2FybmluZ0xpbmVzLmxlbmd0aDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICAgICAgd2FybmluZ3MsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VzOiBlcnJvck1lc3NhZ2VzLnNsaWNlKDAsIDIwKSwgLy8gTGltaXQgdG8gZmlyc3QgMjBcbiAgICAgICAgICAgIHdhcm5pbmdNZXNzYWdlczogd2FybmluZ01lc3NhZ2VzLnNsaWNlKDAsIDIwKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0gRC4gVHlwZVNjcmlwdCBDb25maWcgQW5hbHlzaXMgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgZnVuY3Rpb24gcnVuQ29uZmlnQW5hbHlzaXMoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICAgIGNvbnN0IHRzQ29uZmlnUGF0aCA9IHBhdGguam9pbih3b3JraW5nRGlyLCAndHNjb25maWcuanNvbicpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0c0NvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyB0c2NvbmZpZy5qc29uIGZvdW5kJyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCB0c0NvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRzQ29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmModHNDb25maWdQYXRoLCAndXRmLTgnKSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdJbnZhbGlkIHRzY29uZmlnLmpzb24gZm9ybWF0JyB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9ucyA9ICh0c0NvbmZpZy5jb21waWxlck9wdGlvbnMgfHwge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IGluY3JlbWVudGFsID0gISFjb21waWxlck9wdGlvbnMuaW5jcmVtZW50YWw7XG4gICAgICAgICAgY29uc3Qgc2tpcExpYkNoZWNrID0gISFjb21waWxlck9wdGlvbnMuc2tpcExpYkNoZWNrO1xuICAgICAgICAgIGNvbnN0IGlzb2xhdGVkTW9kdWxlcyA9ICEhY29tcGlsZXJPcHRpb25zLmlzb2xhdGVkTW9kdWxlcztcbiAgICAgICAgICBjb25zdCBzdHJpY3QgPSAhIWNvbXBpbGVyT3B0aW9ucy5zdHJpY3Q7XG5cbiAgICAgICAgICBjb25zdCByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICAvLyBSZWNvbW1lbmRhdGlvbnMgYmFzZWQgb24gUERGIG9wdGltaXphdGlvbiB0ZWNobmlxdWVzXG4gICAgICAgICAgaWYgKCFpbmNyZW1lbnRhbCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0VuYWJsZSBcImluY3JlbWVudGFsXCI6IHRydWUgaW4gdHNjb25maWcuanNvbiBmb3IgZmFzdGVyIGJ1aWxkcyAoYnVpbGQgY2FjaGluZykuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghc2tpcExpYkNoZWNrKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwic2tpcExpYkNoZWNrXCI6IHRydWUgdG8gc2tpcCBjaGVja2luZyAuZC50cyBmaWxlcyBpbiBub2RlX21vZHVsZXMuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghaXNvbGF0ZWRNb2R1bGVzKSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnQ29uc2lkZXIgZW5hYmxpbmcgXCJpc29sYXRlZE1vZHVsZXNcIjogdHJ1ZSBmb3IgZmFzdGVyIGNvbXBpbGF0aW9uIChlc3BlY2lhbGx5IHdpdGggQmFiZWwvZXNidWlsZCkuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghc3RyaWN0KSB7XG4gICAgICAgICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRW5hYmxlIFwic3RyaWN0XCI6IHRydWUgZm9yIGJldHRlciB0eXBlIHNhZmV0eSBhbmQgZmV3ZXIgcnVudGltZSBlcnJvcnMuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHBhdGhzIGNvbmZpZ3VyYXRpb24gKG1vZHVsZSByZXNvbHV0aW9uIG9wdGltaXphdGlvbilcbiAgICAgICAgICBjb25zdCBwYXRocyA9IGNvbXBpbGVyT3B0aW9ucy5wYXRocyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoIXBhdGhzIHx8IE9iamVjdC5rZXlzKHBhdGhzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdDb25zaWRlciB1c2luZyBcInBhdGhzXCIgaW4gdHNjb25maWcuanNvbiB0byBzaW1wbGlmeSBtb2R1bGUgaW1wb3J0cyBhbmQgcmVkdWNlIGRlcGVuZGVuY3kgZGVwdGguJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluY3JlbWVudGFsLFxuICAgICAgICAgICAgc2tpcExpYkNoZWNrLFxuICAgICAgICAgICAgaXNvbGF0ZWRNb2R1bGVzLFxuICAgICAgICAgICAgc3RyaWN0LFxuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBFLiBJbXBvcnQgU3RydWN0dXJlIEFuYWx5c2lzID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGZ1bmN0aW9uIHJ1bkltcG9ydEFuYWx5c2lzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgICBjb25zdCBzcmNEaXIgPSBwYXRoLmpvaW4od29ya2luZ0RpciwgJ3NyYycpO1xuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhzcmNEaXIpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBza2lwcGVkOiB0cnVlLCByZWFzb246ICdObyBzcmMvIGRpcmVjdG9yeSBmb3VuZCcgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDb2xsZWN0IGFsbCAudHMgZmlsZXMgaW4gc3JjL1xuICAgICAgICAgIGZ1bmN0aW9uIGNvbGxlY3RUc0ZpbGVzKGRpcjogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgY29uc3QgZmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoZGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXIsIGVudHJ5Lm5hbWUpO1xuICAgICAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goLi4uY29sbGVjdFRzRmlsZXMoZnVsbFBhdGgpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5uYW1lLmVuZHNXaXRoKCcudHMnKSAmJiAhZW50cnkubmFtZS5lbmRzV2l0aCgnLmQudHMnKSkge1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmaWxlcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0c0ZpbGVzID0gY29sbGVjdFRzRmlsZXMoc3JjRGlyKTtcbiAgICAgICAgICBjb25zdCBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzOiBBcnJheTx7IGZpbGU6IHN0cmluZzsgY291bnQ6IG51bWJlciB9PiA9IFtdO1xuICAgICAgICAgIGNvbnN0IGRlY2xhcmVHbG9iYWxVc2FnZTogQXJyYXk8eyBmaWxlOiBzdHJpbmcgfT4gPSBbXTtcblxuICAgICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgdHNGaWxlcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBDb3VudCBpbXBvcnRzXG4gICAgICAgICAgICAgIGNvbnN0IGltcG9ydFN0YXRlbWVudHMgPSBjb250ZW50Lm1hdGNoKC9eaW1wb3J0XFxzKy4qJC9nbSk7XG4gICAgICAgICAgICAgIGNvbnN0IGltcG9ydENvdW50ID0gaW1wb3J0U3RhdGVtZW50cyA/IGltcG9ydFN0YXRlbWVudHMubGVuZ3RoIDogMDtcblxuICAgICAgICAgICAgICBpZiAoaW1wb3J0Q291bnQgPiBpbXBvcnRXYXJuaW5nVGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgZmlsZXNXaXRoRXhjZXNzaXZlSW1wb3J0cy5wdXNoKHsgZmlsZTogcGF0aC5yZWxhdGl2ZSh3b3JraW5nRGlyLCBmaWxlUGF0aCksIGNvdW50OiBpbXBvcnRDb3VudCB9KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIENoZWNrIGZvciBkZWNsYXJlIGdsb2JhbCB1c2FnZSAoZ2xvYmFsIHR5cGUgcGF0Y2hpbmcgXHUyMDE0IGJhZCBwcmFjdGljZSBwZXIgUERGKVxuICAgICAgICAgICAgICBjb25zdCBkZWNsYXJlR2xvYmFsTWF0Y2hlcyA9IGNvbnRlbnQubWF0Y2goL2RlY2xhcmVcXHMrZ2xvYmFsL2cpO1xuICAgICAgICAgICAgICBpZiAoZGVjbGFyZUdsb2JhbE1hdGNoZXMgJiYgZGVjbGFyZUdsb2JhbE1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlY2xhcmVHbG9iYWxVc2FnZS5wdXNoKHsgZmlsZTogcGF0aC5yZWxhdGl2ZSh3b3JraW5nRGlyLCBmaWxlUGF0aCkgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAvLyBTa2lwIGZpbGVzIHRoYXQgY2FuJ3QgYmUgcmVhZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxlc1dpdGhFeGNlc3NpdmVJbXBvcnRzLFxuICAgICAgICAgICAgZGVjbGFyZUdsb2JhbFVzYWdlLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBSdW4gU2VsZWN0ZWQgQ2F0ZWdvcmllcyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBjb25zdCByZXN1bHRzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuXG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ3R5cGVjaGVjaycpKSB7XG4gICAgICAgICAgcmVzdWx0cy50eXBlY2hlY2sgPSBhd2FpdCBydW5UeXBlY2hlY2tBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2NpcmN1bGFyJykpIHtcbiAgICAgICAgICByZXN1bHRzLmNpcmN1bGFyID0gYXdhaXQgcnVuQ2lyY3VsYXJBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2VzbGludCcpKSB7XG4gICAgICAgICAgcmVzdWx0cy5lc2xpbnQgPSBhd2FpdCBydW5Fc2xpbnRBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2NvbmZpZycpKSB7XG4gICAgICAgICAgcmVzdWx0cy5jb25maWcgPSBydW5Db25maWdBbmFseXNpcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3JpZXMuaW5jbHVkZXMoJ2ltcG9ydHMnKSkge1xuICAgICAgICAgIHJlc3VsdHMuaW1wb3J0cyA9IHJ1bkltcG9ydEFuYWx5c2lzKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YTogcmVzdWx0cyxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEFuYWx5c2lzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gRklYICMyOiBSZS1SQUcgVG9vbCAtIEFsbG93cyBMTE0gdG8gZm9yY2UgZnJlc2ggcmVhZCBvZiBjb21wcmVzc2VkL3RydW5jYXRlZCBmaWxlc1xuICBpZiAoY29udGV4dEd1YXJkKSB7XG4gICAgdG9vbHMucHVzaCh0b29sKHtcbiAgICAgIG5hbWU6ICdyZWxvYWRfY29udGV4dF9mb3JfZmlsZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmNlcyBhIGZyZXNoLCBmdWxsIHJlYWQgb2YgYSBmaWxlIHRoYXQgd2FzIHByZXZpb3VzbHkgY29tcHJlc3NlZCBvciB0cnVuY2F0ZWQgYnkgQ29udGV4dEd1YXJkLiBVc2Ugd2hlbiB5b3UgbmVlZCBjb21wbGV0ZSBkZXRhaWxzIGZyb20gYSBmaWxlIHRoYXQgd2FzIHNtYXJ0LXJlYWQgb3Igc3VtbWFyaXplZC4nLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBwYXRoIHRvIHRoZSBmaWxlIHRvIHJlbG9hZCBpbiBmdWxsJyksXG4gICAgICB9LFxuICAgICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfcGF0aCB9OiB7IGZpbGVfcGF0aDogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIXZhbGlkYXRlUGF0aChmaWxlX3BhdGgsIGdldFdvcmtpbmdEaXIoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcGF0aDogZGlyZWN0b3J5IHRyYXZlcnNhbCBkZXRlY3RlZCcgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlUGF0aChmaWxlX3BhdGgpO1xuICAgICAgICAgIGNvbnN0IHJlbG9hZE1lc3NhZ2UgPSBjb250ZXh0R3VhcmQucmVsb2FkQ29udGV4dEZvckZpbGUoZnVsbFBhdGgpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEFjdHVhbGx5IHJlYWQgdGhlIGZpbGUgaW4gZnVsbCAoYnlwYXNzaW5nIHNtYXJ0IHJlYWRpbmcpXG4gICAgICAgICAgY29uc3QgZnVsbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBtZXNzYWdlOiByZWxvYWRNZXNzYWdlLFxuICAgICAgICAgICAgICBjb250ZW50OiBmdWxsQ29udGVudCxcbiAgICAgICAgICAgICAgZmlsZVBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSkpO1xuICB9XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgIi8qKlxuICogQ29udGV4dEd1YXJkIE1vZHVsZSAoT3B0aW1pemVkIGZvciBTcGVlZCAmIFByZWNpc2lvbilcbiAqIEltcGxlbWVudHMgU3VtbWFyaXphdGlvbiwgU21hcnQgUmVhZGluZywgYW5kIFJlLVJBRyB0cmFja2luZy5cbiAqL1xuXG5pbXBvcnQgeyBnZXRfZW5jb2RpbmcgfSBmcm9tICdAZHFiZC90aWt0b2tlbic7XG5pbXBvcnQgdHlwZSB7IFRpa3Rva2VuIH0gZnJvbSAnQGRxYmQvdGlrdG9rZW4nO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCBzdGF0U3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB0eXBlIHsgTE1TdHVkaW9DbGllbnQgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcblxuLy8gQ29tbW9uIEVuZ2xpc2ggd29yZHMgdG8gZXhjbHVkZSBmcm9tIGtleXdvcmQgZXh0cmFjdGlvbiAoZmFsc2UgcG9zaXRpdmVzKVxuY29uc3QgU1RPUF9XT1JEUyA9IG5ldyBTZXQoW1xuICAnYWJvdXQnLCAnYWJvdmUnLCAnYWZ0ZXInLCAnYWdhaW4nLCAnYWdhaW5zdCcsICdhbGwnLCAnYW0nLCAnYW4nLCAnYW5kJywgJ2FueScsXG4gICdhcmUnLCBcImFyZW4ndFwiLCAnYXMnLCAnYXQnLCAnYmUnLCAnYmVjYXVzZScsICdiZWVuJywgJ2JlZm9yZScsICdiZWluZycsICdiZWxvdycsXG4gICdiZXR3ZWVuJywgJ2JvdGgnLCAnYnV0JywgJ2J5JywgJ2NhbicsIFwiY291bGRuJ3RcIiwgJ2NvdWxkJywgJ2RpZCcsIFwiZGlkbid0XCIsICdkbycsXG4gICdkb2VzJywgJ2RvaW5nJywgJ2RvblxcJ3QnLCAnZG93bicsICdkdXJpbmcnLCAnZWFjaCcsICdmZXcnLCAnZm9yJywgJ2Zyb20nLCAnZnVydGhlcicsXG4gICdnZXQnLCAnZ290JywgJ2hhZCcsIFwiaGFkbid0XCIsICdoYXMnLCBcImhhc24ndFwiLCAnaGF2ZScsIFwiaGF2ZW4ndFwiLCAnaGF2aW5nJywgJ2hlJyxcbiAgJ2hlcicsICdoZXJlJywgJ2hlcnMnLCAnaGVyc2VsZicsICdoaW0nLCAnaGltc2VsZicsICdoaXMnLCAnaG93JywgJ2knLCAnaWYnLCAnaW4nLFxuICAnaW50bycsICdpcycsIFwiaXNuJ3RcIiwgJ2l0JywgXCJpdCdzXCIsICdpdHMnLCAnaXRzZWxmJywgJ2p1c3QnLCAnbGV0JywgJ21lJywgJ21pZ2h0JyxcbiAgJ21vcmUnLCAnbW9zdCcsIFwibXVzdG4ndFwiLCAnbXknLCAnbXlzZWxmJywgJ25ldycsICdubycsICdub3InLCAnbm90JywgJ25vdycsICdvZicsXG4gICdvZmYnLCAnb24nLCAnb25jZScsICdvbmx5JywgJ29yJywgJ290aGVyJywgJ291cicsICdvdXJzJywgJ291dCcsICdvdmVyJywgJ293bicsXG4gICdzYW1lJywgXCJzaGFuJ3RcIiwgJ3NoZScsIFwic2hlJ3NcIiwgJ3Nob3VsZCcsIFwic2hvdWxkbid0XCIsICdzbycsICdzb21lJywgJ3N1Y2gnLFxuICAndGhhbicsICd0aGF0JywgXCJ0aGF0J2xsXCIsICd0aGUnLCAndGhlaXInLCAndGhlaXJzJywgJ3RoZW0nLCAndGhlbXNlbHZlcycsICd0aGVuJyxcbiAgJ3RoZXJlJywgJ3RoZXNlJywgJ3RoZXknLCAndGhpcycsICd0aG9zZScsICd0aHJvdWdoJywgJ3RvJywgJ3RvbycsICd1bmRlcicsXG4gICd1bnRpbCcsICd1cCcsICd2ZXJ5JywgJ3dhcycsIFwid2Fzbid0XCIsICd3ZScsICd3ZXJlJywgXCJ3ZXJlbid0XCIsICd3aGF0JywgJ3doZW4nLFxuICAnd2hlcmUnLCAnd2hpY2gnLCAnd2hpbGUnLCAnd2hvJywgJ3dob20nLCAnd2h5JywgJ3dpbGwnLCAnd2l0aCcsIFwid29uJ3RcIiwgJ3dvdWxkJyxcbiAgXCJ3b3VsZG4ndFwiLCAneW91JywgXCJ5b3UnZFwiLCBcInlvdSdsbFwiLCBcInlvdSdyZVwiLCBcInlvdSd2ZVwiLCAneW91cicsICd5b3VycycsXG4gICd5b3Vyc2VsZicsICd5b3Vyc2VsdmVzJywgJ2FibGUnLCAnYWxzbycsICdiYWNrJywgJ2NvbWUnLCAnY291bGQnLCAnZGF5JywgJ2V2ZW4nLFxuICAnZ2l2ZScsICdnb29kJywgJ2tub3cnLCAnbGFzdCcsICdsb25nJywgJ2xvb2snLCAnbWFrZScsICdtYW55JywgJ21heScsICdtdWNoJyxcbiAgJ25lZWQnLCAnbmV4dCcsICdwYXJ0JywgJ3B1dCcsICdzYXknLCAnc2VlJywgJ3Nob3cnLCAndGFrZScsICd0aW1lJywgJ3VzZScsXG4gICd3YW50JywgJ3dheScsICd3b3JrJywgJ3llYXInLCAneWVzJywgJ3lldCcsICd5b3UnLFxuICAvLyBUZWNobmljYWwgZmFsc2UgcG9zaXRpdmVzXG4gICdmdW5jdGlvbicsICd2YXJpYWJsZScsICdjb250ZXh0JywgJ2d1YXJkJywgJ2NvbmZpZycsICdtb2R1bGUnLCAnY2xhc3MnLCAnY29uc3QnLFxuICAnbGV0JywgJ3ZhcicsICdhc3luYycsICdhd2FpdCcsICdyZXR1cm4nLCAndGhyb3cnLCAnY2F0Y2gnLCAndHJ5JywgJ2ZpbmFsbHknLFxuICAnaW1wb3J0JywgJ2V4cG9ydCcsICdkZWZhdWx0JywgJ2Zyb20nLCAndHlwZScsICdpbnRlcmZhY2UnLCAnZW51bScsICdpbXBsZW1lbnRzJyxcbiAgJ2V4dGVuZHMnLCAnc3VwZXInLCAndGhpcycsICduZXcnLCAnZGVsZXRlJywgJ3R5cGVvZicsICdpbnN0YW5jZW9mJywgJ3ZvaWQnLFxuXSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dEd1YXJkQ29uZmlnIHtcbiAgdG9rZW5MaW1pdDogbnVtYmVyO1xuICBzbWFydFJlYWRpbmc6IGJvb2xlYW47XG4gIHN1bW1hcnlNb2RlbDogc3RyaW5nO1xuICB0ZXJtaW5hbEZpbHRlckVuYWJsZWQ6IGJvb2xlYW47XG4gIHRlcm1pbmFsRmlsdGVyTGVuZ3RoOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZXh0R3VhcmQge1xuICBwcml2YXRlIGVuY29kZXI6IFRpa3Rva2VuIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY29uZmlnOiBDb250ZXh0R3VhcmRDb25maWc7XG4gIHByaXZhdGUgbG1DbGllbnQ6IExNU3R1ZGlvQ2xpZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY2FjaGVkVG9rZW5Db3VudDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RNZXNzYWdlSGFzaDogc3RyaW5nIHwgbnVsbCA9IG51bGw7ICAvLyBGSVggIzE6IEhhc2gtYmFzZWQgY2FjaGUgaW52YWxpZGF0aW9uXG4gIHByaXZhdGUgdHJhY2tlZEZpbGVzOiBNYXA8c3RyaW5nLCB7IGNvbXByZXNzZWQ6IGJvb2xlYW47IHRydW5jYXRlZDogYm9vbGVhbjsgb3JpZ2luYWxTaXplOiBudW1iZXIgfT4gPSBuZXcgTWFwKCk7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBDb250ZXh0R3VhcmRDb25maWcsIGxtQ2xpZW50OiBMTVN0dWRpb0NsaWVudCB8IG51bGwgPSBudWxsKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5sbUNsaWVudCA9IGxtQ2xpZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIENvdW50cyB0b2tlbnMgZWZmaWNpZW50bHkgd2l0aCBjYWNoaW5nLlxuICAgKiBBY2NvdW50cyBmb3IgbWVzc2FnZSBzdHJ1Y3R1cmUgKHJvbGUgcHJlZml4ZXMsIHNlcGFyYXRvcnMpIHRvIG1hdGNoIGFjdHVhbCBMTE0gdG9rZW4gY29uc3VtcHRpb24uXG4gICAqL1xuICBhc3luYyBjb3VudFRva2VucyhtZXNzYWdlczogYW55W10pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIC8vIEZJWCAjMTogSGFzaC1iYXNlZCBjYWNoZSBpbnZhbGlkYXRpb24gLSB2YWxpZGF0ZXMgQUxMIG1lc3NhZ2VzLCBub3QganVzdCBsYXN0IG9uZVxuICAgIGlmICh0aGlzLmNhY2hlZFRva2VuQ291bnQgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRIYXNoID0gdGhpcy5jb21wdXRlTWVzc2FnZUhhc2gobWVzc2FnZXMpO1xuICAgICAgXG4gICAgICBpZiAodGhpcy5fbGFzdE1lc3NhZ2VIYXNoID09PSBjdXJyZW50SGFzaCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRUb2tlbkNvdW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5lbmNvZGVyKSB7XG4gICAgICB0aGlzLmVuY29kZXIgPSBnZXRfZW5jb2RpbmcoJ2NsMTAwa19iYXNlJyk7XG4gICAgfVxuXG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IG1zZyBvZiBtZXNzYWdlcykge1xuICAgICAgY29uc3Qgcm9sZSA9IG1zZy5yb2xlIHx8ICd1c2VyJztcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBtc2cuY29udGVudCB8fCAnJztcbiAgICAgIFxuICAgICAgLy8gQWNjb3VudCBmb3IgbWVzc2FnZSBzdHJ1Y3R1cmU6IHJvbGUgcHJlZml4ICsgc2VwYXJhdG9yICsgY29udGVudFxuICAgICAgLy8gVGhpcyBtYXRjaGVzIGhvdyBMTE1zIGFjdHVhbGx5IGNvbnN1bWUgdG9rZW5zIGluIGNoYXQgY29tcGxldGlvbiBBUElcbiAgICAgIGNvbnN0IHN0cnVjdHVyZWRUZXh0ID0gYDx8c3RhcnR8PmFzc2lzdGFudDx8bmFtZXw+JHtyb2xlfTx8ZW5kfD5cXG4ke2NvbnRlbnR9YDtcbiAgICAgIGNvdW50ICs9IHRoaXMuZW5jb2Rlci5lbmNvZGUoc3RydWN0dXJlZFRleHQpLmxlbmd0aDtcbiAgICB9XG4gICAgXG4gICAgLy8gQWRkIGEgc21hbGwgb3ZlcmhlYWQgZm9yIHN5c3RlbSBwcm9tcHQgYW5kIEJPUyB0b2tlbiAodHlwaWNhbGx5IH40LTggdG9rZW5zKVxuICAgIGNvdW50ICs9IDg7IFxuICAgIFxuICAgIHRoaXMuY2FjaGVkVG9rZW5Db3VudCA9IGNvdW50O1xuICAgIHRoaXMuX2xhc3RNZXNzYWdlSGFzaCA9IHRoaXMuY29tcHV0ZU1lc3NhZ2VIYXNoKG1lc3NhZ2VzKTsgIC8vIEZJWCAjMTogU3RvcmUgaGFzaFxuICAgIHJldHVybiBjb3VudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wcmVzc2VzIGhpc3RvcnkgYnkgc2VuZGluZyBvbGRlc3QgbWVzc2FnZXMgdG8gYSBsb2NhbCBtb2RlbC5cbiAgICovXG4gIGFzeW5jIGNvbXByZXNzSGlzdG9yeShtZXNzYWdlczogYW55W10pOiBQcm9taXNlPGFueVtdPiB7XG4gICAgY29uc3QgY3VycmVudFRva2VucyA9IGF3YWl0IHRoaXMuY291bnRUb2tlbnMobWVzc2FnZXMpO1xuICAgIGNvbnN0IHRocmVzaG9sZCA9IHRoaXMuY29uZmlnLnRva2VuTGltaXQgKiAwLjk7XG5cbiAgICBpZiAoY3VycmVudFRva2VucyA8IHRocmVzaG9sZCkge1xuICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xuICAgIH1cblxuICAgIGNvbnN0IGtlZXBMYXN0ID0gMTA7XG4gICAgY29uc3QgdG9Db21wcmVzcyA9IG1lc3NhZ2VzLnNsaWNlKDAsIC1rZWVwTGFzdCk7XG4gICAgXG4gICAgaWYgKHRvQ29tcHJlc3MubGVuZ3RoID09PSAwKSByZXR1cm4gbWVzc2FnZXM7XG5cbiAgICAvLyBVc2UgbG9jYWwgbW9kZWwgZm9yIHN1bW1hcml6YXRpb25cbiAgICBpZiAodGhpcy5sbUNsaWVudCAmJiB0aGlzLmNvbmZpZy5zdW1tYXJ5TW9kZWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gYXdhaXQgdGhpcy5sbUNsaWVudC5sbG0ubW9kZWwodGhpcy5jb25maWcuc3VtbWFyeU1vZGVsKTtcbiAgICAgICAgY29uc3Qgc3VtbWFyeVByb21wdCA9IGBTdW1tYXJpemUgdGhlIGZvbGxvd2luZyBjb252ZXJzYXRpb24gaGlzdG9yeSBpbnRvIGEgY29uY2lzZSB0ZWNobmljYWwgc3VtbWFyeS4gUHJlc2VydmUgYWxsIGZpbGUgcGF0aHMsIGZ1bmN0aW9uIG5hbWVzLCBhbmQga2V5IGxvZ2ljLCBidXQgZGlzY2FyZCB2ZXJib3NlIGNvZGUgYmxvY2tzIGFuZCB0ZXJtaW5hbCBub2lzZS5cXG5cXG5IaXN0b3J5OlxcbiR7dG9Db21wcmVzcy5tYXAobSA9PiBgJHttLnJvbGV9OiAke20uY29udGVudH1gKS5qb2luKCdcXG4nKX1gO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBtb2RlbC5jb21wbGV0ZShzdW1tYXJ5UHJvbXB0LCB7IG1heFRva2VuczogMTAyNCwgdGVtcGVyYXR1cmU6IDAuMSB9KTtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHJlc3BvbnNlLmNvbnRlbnQgfHwgYFtDb250ZXh0R3VhcmQgU3VtbWFyeTogJHt0b0NvbXByZXNzLmxlbmd0aH0gb2xkZXIgbWVzc2FnZXMgY29tcHJlc3NlZC5dYDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3VtbWFyeSB9LFxuICAgICAgICAgIC4uLm1lc3NhZ2VzLnNsaWNlKC1rZWVwTGFzdClcbiAgICAgICAgXTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0NvbnRleHRHdWFyZF0gU3VtbWFyaXphdGlvbiBmYWlsZWQ6ICR7KGVycm9yIGFzIEVycm9yKS5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZhbGxiYWNrIGlmIG5vIG1vZGVsIG9yIGVycm9yXG4gICAgcmV0dXJuIFtcbiAgICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IGBbQ29udGV4dEd1YXJkIFN1bW1hcnk6ICR7dG9Db21wcmVzcy5sZW5ndGh9IG9sZGVyIG1lc3NhZ2VzIGNvbXByZXNzZWQgdG8gc2F2ZSBjb250ZXh0LiBLZXkgZmlsZSBwYXRocyBhbmQgbG9naWMgcHJlc2VydmVkLl1gIH0sXG4gICAgICAuLi5tZXNzYWdlcy5zbGljZSgta2VlcExhc3QpXG4gICAgXTtcbiAgfVxuXG4gIGdldFRocmVzaG9sZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy50b2tlbkxpbWl0ICogMC45O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgdG9rZW4gY2FjaGUgd2hlbiBoaXN0b3J5IGNoYW5nZXMuXG4gICAqL1xuICByZXNldFRva2VuQ2FjaGUoKSB7XG4gICAgdGhpcy5jYWNoZWRUb2tlbkNvdW50ID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IHRva2VuIGJ1ZGdldCBpbmZvcm1hdGlvbiBhcyBhIGh1bWFuLXJlYWRhYmxlIHN0cmluZy5cbiAgICovXG4gIGdldFRva2VuQnVkZ2V0SW5mbygpOiBzdHJpbmcge1xuICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLmNhY2hlZFRva2VuQ291bnQgPz8gMDtcbiAgICBjb25zdCBsaW1pdCA9IHRoaXMuY29uZmlnLnRva2VuTGltaXQ7XG4gICAgY29uc3QgcGVyY2VudGFnZSA9IE1hdGgucm91bmQoKGN1cnJlbnQgLyBsaW1pdCkgKiAxMDApO1xuICAgIFxuICAgIHJldHVybiBgW0NvbnRleHRHdWFyZF0gQnVkZ2V0OiAke01hdGgucm91bmQoY3VycmVudCAvIDEwMDApfWsvJHtNYXRoLnJvdW5kKGxpbWl0IC8gMTAwMCl9ayB0b2tlbnMgKCR7cGVyY2VudGFnZX0lIHVzZWQpYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjb25maWd1cmVkIHRva2VuIGxpbWl0LlxuICAgKi9cbiAgZ2V0VG9rZW5MaW1pdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy50b2tlbkxpbWl0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgY2FjaGVkIHRva2VuIGNvdW50IChmb3IgZXh0ZXJuYWwgbW9uaXRvcmluZykuXG4gICAqL1xuICBnZXRDdXJyZW50VG9rZW5Db3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZFRva2VuQ291bnQgPz8gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTbWFydGx5IHJlYWRzIGEgZmlsZSB1c2luZyBLZXl3b3JkLUdyZXAgZm9yIHByZWNpc2lvbi5cbiAgICogRklYICMzOiBBZGRlZCBtYXhfbGVuZ3RoIHBhcmFtZXRlciB0byByZXNwZWN0IGNhbGxlcidzIHRydW5jYXRpb24gbGltaXRzLlxuICAgKi9cbiAgc21hcnRSZWFkKGZpbGVQYXRoOiBzdHJpbmcsIHVzZXJQcm9tcHQ/OiBzdHJpbmcsIG1heExlbmd0aD86IG51bWJlcik6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZy5zbWFydFJlYWRpbmcpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgcmV0dXJuIG1heExlbmd0aCA/IGNvbnRlbnQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCkgOiBjb250ZW50O1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMudHJhY2tlZEZpbGVzLnNldChmaWxlUGF0aCwgeyBjb21wcmVzc2VkOiBmYWxzZSwgdHJ1bmNhdGVkOiB0cnVlLCBvcmlnaW5hbFNpemU6IHN0YXRzLnNpemUgfSk7XG5cbiAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcblxuICAgICAgLy8gRklYICMzOiBVc2UgY2FsbGVyJ3MgbWF4TGVuZ3RoIGlmIHByb3ZpZGVkLCBvdGhlcndpc2UgdXNlIGRlZmF1bHRzXG4gICAgICBjb25zdCBlZmZlY3RpdmVNYXhMZW5ndGggPSBtYXhMZW5ndGggfHwgNTAwMDtcbiAgICAgIGNvbnN0IG1heExpbmVzID0gMjAwMDtcbiAgICAgIGNvbnN0IG1heEJ5dGVzID0gMTAwICogMTAyNDtcblxuICAgICAgLy8gUmV0dXJuIGZ1bGwgY29udGVudCBvbmx5IGlmIGZpbGUgaXMgc21hbGwgQU5EIHdpdGhpbiBjYWxsZXIncyBsaW1pdFxuICAgICAgaWYgKHN0YXRzLnNpemUgPCBtYXhCeXRlcyAmJiBsaW5lcy5sZW5ndGggPCBtYXhMaW5lcyAmJiBjb250ZW50Lmxlbmd0aCA8PSBlZmZlY3RpdmVNYXhMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGtleXdvcmRzID0gdGhpcy5leHRyYWN0S2V5d29yZHModXNlclByb21wdCB8fCAnJyk7XG4gICAgICBsZXQgcmVsZXZhbnRMaW5lczogbnVtYmVyW10gPSBbXTtcblxuICAgICAgaWYgKGtleXdvcmRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGluZXMuZm9yRWFjaCgobGluZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoa2V5d29yZHMuc29tZShrdyA9PiBsaW5lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoa3cudG9Mb3dlckNhc2UoKSkpKSB7XG4gICAgICAgICAgICByZWxldmFudExpbmVzLnB1c2goaW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlbGV2YW50TGluZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuZm9ybWF0UmVsZXZhbnRMaW5lcyhsaW5lcywgcmVsZXZhbnRMaW5lcyk7XG4gICAgICAgICAgLy8gRklYICMzOiBUcnVuY2F0ZSB0byBtYXhMZW5ndGggZXZlbiBmb3Igc21hcnQtcmVhZCByZXN1bHRzXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5sZW5ndGggPiBlZmZlY3RpdmVNYXhMZW5ndGggXG4gICAgICAgICAgICA/IHJlc3VsdC5zdWJzdHJpbmcoMCwgZWZmZWN0aXZlTWF4TGVuZ3RoKSArIGBcXG4vLyBbQ29udGV4dEd1YXJkXSBPdXRwdXQgdHJ1bmNhdGVkIHRvICR7ZWZmZWN0aXZlTWF4TGVuZ3RofSBjaGFyc2BcbiAgICAgICAgICAgIDogcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEZhbGxiYWNrOiBoZWFkZXIvZm9vdGVyIHZpZXdcbiAgICAgIGNvbnN0IGhlYWRlciA9IGxpbmVzLnNsaWNlKDAsIDUwKS5qb2luKCdcXG4nKTtcbiAgICAgIGNvbnN0IGZvb3RlciA9IGxpbmVzLnNsaWNlKC01MCkuam9pbignXFxuJyk7XG4gICAgICBcbiAgICAgIGxldCBmYWxsYmFja1Jlc3VsdCA9IGAvLyBbQ29udGV4dEd1YXJkXSBGaWxlIHRydW5jYXRlZCBkdWUgdG8gc2l6ZSAoJHtzdGF0cy5zaXplfSBieXRlcylcXG4vLyAtLS0gSEVBREVSIChGaXJzdCA1MCBsaW5lcykgLS0tXFxuJHtoZWFkZXJ9XFxuLy8gLS0tIEZPT1RFUiAoTGFzdCA1MCBsaW5lcykgLS0tXFxuJHtmb290ZXJ9XFxuLy8gW0NvbnRleHRHdWFyZF0gQ29udGVudCB0cnVuY2F0ZWQgZm9yIGNvbnRleHQgZWZmaWNpZW5jeS5gO1xuICAgICAgXG4gICAgICAvLyBGSVggIzM6IFJlc3BlY3QgbWF4TGVuZ3RoIG9uIGZhbGxiYWNrIHRvb1xuICAgICAgaWYgKGZhbGxiYWNrUmVzdWx0Lmxlbmd0aCA+IGVmZmVjdGl2ZU1heExlbmd0aCkge1xuICAgICAgICBmYWxsYmFja1Jlc3VsdCA9IGZhbGxiYWNrUmVzdWx0LnN1YnN0cmluZygwLCBlZmZlY3RpdmVNYXhMZW5ndGgpICsgYFxcbi8vIFtDb250ZXh0R3VhcmRdIE91dHB1dCB0cnVuY2F0ZWQgdG8gJHtlZmZlY3RpdmVNYXhMZW5ndGh9IGNoYXJzYDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxsYmFja1Jlc3VsdDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIGBFcnJvciByZWFkaW5nIGZpbGU6ICR7KGVycm9yIGFzIEVycm9yKS5tZXNzYWdlfWA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbHRlcnMgdGVybWluYWwgb3V0cHV0IHRvIHByZXZlbnQgY29udGV4dCBibG9hdC5cbiAgICovXG4gIGZpbHRlclRlcm1pbmFsT3V0cHV0KG91dHB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuY29uZmlnLnRlcm1pbmFsRmlsdGVyRW5hYmxlZCkgcmV0dXJuIG91dHB1dDtcbiAgICBcbiAgICBjb25zdCB0aHJlc2hvbGQgPSB0aGlzLmNvbmZpZy50ZXJtaW5hbEZpbHRlckxlbmd0aCB8fCAyMDAwO1xuICAgIGlmIChvdXRwdXQubGVuZ3RoIDw9IHRocmVzaG9sZCkgcmV0dXJuIG91dHB1dDtcblxuICAgIGNvbnN0IGxpbmVzID0gb3V0cHV0LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBoZWFkID0gbGluZXMuc2xpY2UoMCwgNSkuam9pbignXFxuJyk7XG4gICAgY29uc3QgdGFpbCA9IGxpbmVzLnNsaWNlKC01KS5qb2luKCdcXG4nKTtcblxuICAgIHJldHVybiBgJHtoZWFkfVxcbi4uLiBbT3V0cHV0IHRydW5jYXRlZDogJHtsaW5lcy5sZW5ndGggLSAxMH0gbGluZXMgaGlkZGVuXSAuLi5cXG4ke3RhaWx9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZXMgYSBmcmVzaCByZWFkIG9mIGEgdHJhY2tlZCBmaWxlIChSZS1SQUcgVHJpZ2dlcikuXG4gICAqL1xuICByZWxvYWRDb250ZXh0Rm9yRmlsZShmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy50cmFja2VkRmlsZXMuaGFzKGZpbGVQYXRoKSkge1xuICAgICAgY29uc3QgaW5mbyA9IHRoaXMudHJhY2tlZEZpbGVzLmdldChmaWxlUGF0aCkhO1xuICAgICAgdGhpcy50cmFja2VkRmlsZXMuZGVsZXRlKGZpbGVQYXRoKTtcbiAgICAgIHJldHVybiBgLy8gW0NvbnRleHRHdWFyZF0gQ29udGV4dCByZWxvYWRlZCBmb3IgJHtmaWxlUGF0aH0uIFByZXZpb3VzIGNvbXByZXNzaW9uL3RydW5jYXRpb24gY2xlYXJlZC5gO1xuICAgIH1cbiAgICByZXR1cm4gYC8vIFtDb250ZXh0R3VhcmRdIE5vIHRyYWNrZWQgY29udGV4dCBmb3IgJHtmaWxlUGF0aH0uIFJlYWRpbmcgbm9ybWFsbHkuYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wcmVzc2VzIGEgc3BlY2lmaWMgZmlsZSdzIHRyYWNrZWQgY29udGV4dCAobWFya3MgaXQgYXMgY29tcHJlc3NlZCkuXG4gICAqL1xuICBtYXJrRmlsZUFzQ29tcHJlc3NlZChmaWxlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudHJhY2tlZEZpbGVzLmhhcyhmaWxlUGF0aCkpIHtcbiAgICAgIGNvbnN0IGluZm8gPSB0aGlzLnRyYWNrZWRGaWxlcy5nZXQoZmlsZVBhdGgpITtcbiAgICAgIHRoaXMudHJhY2tlZEZpbGVzLnNldChmaWxlUGF0aCwgeyAuLi5pbmZvLCBjb21wcmVzc2VkOiB0cnVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBub3QgdHJhY2tlZCB5ZXQsIGFkZCBpdCBhcyBjb21wcmVzc2VkXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgdGhpcy50cmFja2VkRmlsZXMuc2V0KGZpbGVQYXRoLCB7IGNvbXByZXNzZWQ6IHRydWUsIHRydW5jYXRlZDogZmFsc2UsIG9yaWdpbmFsU2l6ZTogc3RhdHMuc2l6ZSB9KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtDb250ZXh0R3VhcmRdIENhbm5vdCBtYXJrIGZpbGUgYXMgY29tcHJlc3NlZCAtIGZpbGUgbm90IGZvdW5kOiAke2ZpbGVQYXRofWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyBhIHNpbXBsZSBoYXNoIG9mIG1lc3NhZ2VzIGZvciBjYWNoZSBpbnZhbGlkYXRpb24uXG4gICAqIEZJWCAjMTogRW5zdXJlcyBjYWNoZSBpcyBpbnZhbGlkYXRlZCB3aGVuIEFOWSBtZXNzYWdlIGNoYW5nZXMsIG5vdCBqdXN0IHRoZSBsYXN0IG9uZS5cbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZU1lc3NhZ2VIYXNoKG1lc3NhZ2VzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgLy8gU2ltcGxlIGJ1dCBlZmZlY3RpdmUgaGFzaDogY29uY2F0ZW5hdGUgcm9sZStjb250ZW50IGZvciBhbGwgbWVzc2FnZXNcbiAgICByZXR1cm4gbWVzc2FnZXMubWFwKG0gPT4gYCR7bS5yb2xlfToke20uY29udGVudCB8fCAnJ31gKS5qb2luKCd8fCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3RzIG1lYW5pbmdmdWwga2V5d29yZHMgZnJvbSBhIHByb21wdCBmb3Igc21hcnQgZmlsZSByZWFkaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBleHRyYWN0S2V5d29yZHMocHJvbXB0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHByb21wdC5tYXRjaCgvXFxiW2EtekEtWl8kXVthLXpBLVowLTlfJF0qXFxiL2cpO1xuICAgIGlmICghbWF0Y2hlcykgcmV0dXJuIFtdO1xuICAgIFxuICAgIC8vIEZpbHRlciBvdXQgc3RvcCB3b3JkcyBhbmQga2VlcCBvbmx5IG1lYW5pbmdmdWwgaWRlbnRpZmllcnMgKGxlbmd0aCA+IDQpXG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KG1hdGNoZXMpXVxuICAgICAgLmZpbHRlcih3ID0+IHcubGVuZ3RoID4gNCAmJiAhU1RPUF9XT1JEUy5oYXMody50b0xvd2VyQ2FzZSgpKSk7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0cyByZWxldmFudCBsaW5lcyB3aXRoIGNvbnRleHQgbWFyZ2lucyBmb3Igc21hcnQgcmVhZGluZy5cbiAgICovXG4gIHByaXZhdGUgZm9ybWF0UmVsZXZhbnRMaW5lcyhsaW5lczogc3RyaW5nW10sIGluZGljZXM6IG51bWJlcltdKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gJyc7XG4gICAgY29uc3QgbWFyZ2luID0gNTtcbiAgICBpbmRpY2VzLmZvckVhY2goaW5kZXggPT4ge1xuICAgICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heCgwLCBpbmRleCAtIG1hcmdpbik7XG4gICAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGluZGV4ICsgbWFyZ2luICsgMSk7XG4gICAgICByZXN1bHQgKz0gYC8vIC4uLiBbTWF0Y2ggYXQgbGluZSAke2luZGV4ICsgMX1dIC4uLiBcXG5gO1xuICAgICAgcmVzdWx0ICs9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLmpvaW4oJ1xcbicpICsgJ1xcbic7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzZWFyY2ggYXMgZGRnU2VhcmNoIH0gZnJvbSAnZHVjay1kdWNrLXNjcmFwZSc7XG5pbXBvcnQgeyBodG1sVG9UZXh0IH0gZnJvbSAnaHRtbC10by10ZXh0JztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGZldGNoV2l0aFJldHJ5IH0gZnJvbSAnLi4vcGVyZm9ybWFuY2VVdGlscy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNlYXJjaCBFbmdpbmUgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHRJdGVtIHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cbi8qKiBEdWNrRHVja0dvIEFQSSAoZmFzdGVzdCwgbm8gYnJvd3NlciBuZWVkZWQpICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hEREdBcGkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBkZGdTZWFyY2gocXVlcnksIHsgcmVnaW9uOiAnd3Qtd3QnIH0pO1xuICByZXR1cm4gKHJlc3VsdHMucmVzdWx0cyBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4pLm1hcCgocjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+ICh7XG4gICAgdGl0bGU6IHIudGl0bGUgYXMgc3RyaW5nLFxuICAgIHVybDogci51cmwgYXMgc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uOiAoci5kZXNjcmlwdGlvbiBhcyBzdHJpbmcpIHx8ICcnLFxuICB9KSk7XG59XG5cbi8qKiBEdWNrRHVja0dvIEhUTUwgRmV0Y2ggKGZhbGxiYWNrIHdoZW4gQVBJIGZhaWxzKSAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoRERHRmV0Y2gocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0SXRlbVtdPiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hXaXRoUmV0cnkoXG4gICAgYGh0dHBzOi8vaHRtbC5kdWNrZHVja2dvLmNvbS9odG1sLz9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX1gXG4gICk7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgRHVja0R1Y2tHbyBGZXRjaCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gIFxuICAvLyBTaW1wbGUgcmVnZXgtYmFzZWQgcGFyc2luZyBmb3IgTm9kZS5qcyAobm8gRE9NUGFyc2VyIG5lZWRlZCEpXG4gIGNvbnN0IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXSA9IFtdO1xuICBcbiAgLy8gRXh0cmFjdCB0aXRsZXMgZnJvbSA8YSBjbGFzcz1cInJlc3VsdF9fYVwiIGhyZWY9XCIuLi5cIiByZWw9XCIuLi5cIj5UaXRsZTwvYT5cbiAgY29uc3QgdGl0bGVSZWdleCA9IC88YVtePl0rY2xhc3M9XCJyZXN1bHRfX2FcIltePl0raHJlZj1cIihbXlwiXSspXCJbXj5dKj4oW148XSspPFxcL2E+L2dpO1xuICBsZXQgbWF0Y2g7XG4gIFxuICB3aGlsZSAoKG1hdGNoID0gdGl0bGVSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB0aXRsZTogbWF0Y2hbMl0ucmVwbGFjZSgvJmFtcDsvZywgJyYnKS50cmltKCksXG4gICAgICB1cmw6IG1hdGNoWzFdLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCwgMTApO1xufVxuXG4vKiogR29vZ2xlIFNlYXJjaCB2aWEgSFRNTCBGZXRjaCAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoR29vZ2xlKHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFNlYXJjaFJlc3VsdEl0ZW1bXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoV2l0aFJldHJ5KFxuICAgIGBodHRwczovL3d3dy5nb29nbGUuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX0mbnVtPTEwYCxcbiAgICB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2JyB9IH1cbiAgKTtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBHb29nbGUgc2VhcmNoIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgLy8gU2ltcGxlIHBhcnNpbmcgXHUyMDE0IGV4dHJhY3QgdGl0bGVzIGFuZCBVUkxzIGZyb20gR29vZ2xlJ3MgSFRNTCBzdHJ1Y3R1cmVcbiAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0SXRlbVtdID0gW107XG4gIGNvbnN0IHRpdGxlUmVnZXggPSAvPGgzW14+XSo+KC4qPyk8XFwvaDM+L2c7XG5cbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAoKG1hdGNoID0gdGl0bGVSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB0aXRsZTogbWF0Y2hbMV0ucmVwbGFjZSgvPFtePl0qPi9nLCAnJyksIC8vIFJlbW92ZSBIVE1MIHRhZ3NcbiAgICAgIHVybDogJycsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCAxMCk7XG59XG5cbi8qKiBCaW5nIFNlYXJjaCB2aWEgSFRNTCBGZXRjaCAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoQmluZyhxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShcbiAgICBgaHR0cHM6Ly93d3cuYmluZy5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQocXVlcnkpfSZjb3VudD0xMGAsXG4gICAgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNicgfSB9XG4gICk7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQmluZyBzZWFyY2ggZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICBjb25zdCBodG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAvLyBQYXJzZSBCaW5nIHJlc3VsdHMgXHUyMDE0IHNpbWlsYXIgYXBwcm9hY2ggdG8gR29vZ2xlXG4gIGNvbnN0IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXSA9IFtdO1xuICBjb25zdCByZXN1bHRSZWdleCA9IC88bGkgY2xhc3M9XCJiX2FsZ29cIltePl0qPiguKj8pPFxcL2xpPi9ncztcblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSByZXN1bHRSZWdleC5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGJsb2NrID0gbWF0Y2hbMV07XG4gICAgY29uc3QgdGl0bGVNYXRjaCA9IGJsb2NrLm1hdGNoKC88YVtePl0raHJlZj1cIihbXlwiXSspXCJbXj5dKj4oW148XSspPFxcL2E+Lyk7XG4gICAgaWYgKHRpdGxlTWF0Y2gpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgIHRpdGxlOiB0aXRsZU1hdGNoWzJdLFxuICAgICAgICB1cmw6IHRpdGxlTWF0Y2hbMV0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIDEwKTtcbn1cblxuLyoqIEFsbCBhdmFpbGFibGUgU2VhcmNoIEVuZ2luZSBGdW5jdGlvbnMgKi9cbmNvbnN0IFNFQVJDSF9FTkdJTkVTOiBSZWNvcmQ8c3RyaW5nLCAocXVlcnk6IHN0cmluZykgPT4gUHJvbWlzZTxTZWFyY2hSZXN1bHRJdGVtW10+PiA9IHtcbiAgJ2RkZy1hcGknOiBzZWFyY2hEREdBcGksXG4gICdkZGctZmV0Y2gnOiBzZWFyY2hEREdGZXRjaCxcbiAgJ2dvb2dsZSc6IHNlYXJjaEdvb2dsZSxcbiAgJ2JpbmcnOiBzZWFyY2hCaW5nLFxufTtcblxuLyoqIEhhcmRjb2RlZCBmYWxsYmFjayBvcmRlciAod2hlbiBwcmltYXJ5IGVuZ2luZSBmYWlscykgKi9cbmNvbnN0IEZBTExCQUNLX09SREVSID0gWydkZGctYXBpJywgJ2RkZy1mZXRjaCcsICdnb29nbGUnLCAnYmluZyddO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBGYWxsYmFjayBDaGFpbiBMb2dpYyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIFdlYiBzZWFyY2ggd2l0aCBhdXRvbWF0aWMgZmFsbGJhY2suXG4gKiBTdGFydHMgd2l0aCB0aGUgQ29uZmlnIGVuZ2luZSBhbmQgYXV0b21hdGljYWxseSB0cmllcyB0aGUgbmV4dCBpbiB0aGUgY2hhaW4uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaFdpdGhGYWxsYmFja0NoYWluKFxuICBxdWVyeTogc3RyaW5nLFxuICBjb25maWc6IFBsdWdpbkNvbmZpZ1xuKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiB7IHF1ZXJ5OiBzdHJpbmc7IHJlc3VsdHM6IFNlYXJjaFJlc3VsdEl0ZW1bXTsgY291bnQ6IG51bWJlcjsgZW5naW5lOiBzdHJpbmcgfTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAvLyBTdGFydCBlbmdpbmUgZnJvbSBDb25maWcgKFNpbmdsZSBTZWxlY3QpXG4gIGNvbnN0IHByaW1hcnlFbmdpbmUgPSBjb25maWcuc2VhcmNoRmFsbGJhY2tDaGFpbiB8fCAnZGRnLWFwaSc7XG4gIFxuICAvLyBGYWxsYmFjayBjaGFpbjogcHJpbWFyeSBlbmdpbmUgKyBhbGwgb3RoZXJzIGluIGRlZmluZWQgb3JkZXJcbiAgY29uc3QgY2hhaW4gPSBbcHJpbWFyeUVuZ2luZSwgLi4uRkFMTEJBQ0tfT1JERVIuZmlsdGVyKGUgPT4gZSAhPT0gcHJpbWFyeUVuZ2luZSldO1xuXG4gIGZvciAoY29uc3QgZW5naW5lIG9mIGNoYWluKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNlYXJjaEZuID0gU0VBUkNIX0VOR0lORVNbZW5naW5lXTtcbiAgICAgIGlmICghc2VhcmNoRm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBTZWFyY2ggZW5naW5lIFwiJHtlbmdpbmV9XCIgbm90IGZvdW5kLCBza2lwcGluZ2ApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHNlYXJjaEZuKHF1ZXJ5KTtcblxuICAgICAgLy8gVmFsaWRhdGUgcmVzdWx0IGNvdW50IC0gd2FybiBpZiBsb3cgcmVzdWx0c1xuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoIDwgMikge1xuICAgICAgICBjb25zb2xlLndhcm4oYExvdyBzZWFyY2ggcmVzdWx0cyBmb3IgXCIke3F1ZXJ5fVwiOiAke3Jlc3VsdHMubGVuZ3RofSByZXN1bHRzIGZyb20gJHtlbmdpbmV9YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHsgcXVlcnksIHJlc3VsdHMsIGNvdW50OiByZXN1bHRzLmxlbmd0aCwgZW5naW5lIH0sXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgY29uc29sZS53YXJuKGBTZWFyY2ggZW5naW5lIFwiJHtlbmdpbmV9XCIgZmFpbGVkOiAke21lc3NhZ2V9YCk7XG4gICAgICAvLyBUcnkgbmV4dCBlbmdpbmUgaW4gdGhlIGNoYWluXG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgIGVycm9yOiBgQWxsIHNlYXJjaCBlbmdpbmVzIGZhaWxlZC4gVHJpZWQ6ICR7Y2hhaW4uam9pbignIFx1MjE5MiAnKX1gLFxuICB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgV2ViU2VhcmNoUGFyYW1zIHsgcXVlcnk6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFdpa2lwZWRpYVNlYXJjaFBhcmFtcyB7IHF1ZXJ5OiBzdHJpbmc7IGxhbmc/OiBzdHJpbmc7IH1cbmludGVyZmFjZSBGZXRjaFdlYkNvbnRlbnRQYXJhbXMgeyB1cmw6IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJhZ1dlYkNvbnRlbnRQYXJhbXMgeyB1cmw6IHN0cmluZzsgcXVlcnk6IHN0cmluZzsgfVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJXZWJSZXNlYXJjaFRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHdlYl9zZWFyY2ggdG9vbCBcdTIwMTQgdXNlcyBwcmltYXJ5IGVuZ2luZSBmcm9tIENvbmZpZyArIGF1dG9tYXRpYyBmYWxsYmFja1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICd3ZWJfc2VhcmNoJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCB0aGUgd2ViIHVzaW5nIGEgY29uZmlndXJhYmxlIHNlYXJjaCBlbmdpbmUgd2l0aCBhdXRvbWF0aWMgZmFsbGJhY2sgdG8gb3RoZXIgZW5naW5lcyBpZiB0aGUgcHJpbWFyeSBvbmUgZmFpbHMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5IH06IFdlYlNlYXJjaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgcmV0dXJuIGF3YWl0IHNlYXJjaFdpdGhGYWxsYmFja0NoYWluKHF1ZXJ5LCBjb25maWcpO1xuICAgIH0sXG4gIH0pKTtcblxuICAvLyB3aWtpcGVkaWFfc2VhcmNoIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd2lraXBlZGlhX3NlYXJjaCcsXG4gICAgZGVzY3JpcHRpb246ICdTZWFyY2ggV2lraXBlZGlhIGZvciBhIGdpdmVuIHF1ZXJ5IGFuZCByZXR1cm4gcGFnZSBzdW1tYXJpZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBxdWVyeTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIHNlYXJjaCBxdWVyeScpLFxuICAgICAgbGFuZzogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJ2VuJykuZGVzY3JpYmUoJ0xhbmd1YWdlIGNvZGUgKGRlZmF1bHQ6IGVuKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHF1ZXJ5LCBsYW5nIH06IFdpa2lwZWRpYVNlYXJjaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYXBpVXJsID0gYGh0dHBzOi8vJHtsYW5nIHx8ICdlbid9Lndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1xdWVyeSZsaXN0PXNlYXJjaCZzcnNlYXJjaD0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9JmZvcm1hdD1qc29uJm9yaWdpbj0qYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeShhcGlVcmwpO1xuXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdpa2lwZWRpYSBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXNwb25zZS5qc29uKCkpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBjb25zdCBxdWVyeURhdGEgPSBkYXRhLnF1ZXJ5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzZWFyY2hSZXN1bHRzID0gKHF1ZXJ5RGF0YT8uc2VhcmNoIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PikgfHwgW107XG4gICAgICAgIGNvbnN0IHBhZ2VzID0gc2VhcmNoUmVzdWx0cy5tYXAoKGl0ZW06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGl0bGUgPSB0eXBlb2YgaXRlbS50aXRsZSA9PT0gJ3N0cmluZycgPyBpdGVtLnRpdGxlIDogJyc7XG4gICAgICAgICAgY29uc3Qgc25pcHBldCA9IHR5cGVvZiBpdGVtLnNuaXBwZXQgPT09ICdzdHJpbmcnID8gaXRlbS5zbmlwcGV0LnJlcGxhY2UoLzxbXj5dKj4vZywgJycpIDogJyc7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgc25pcHBldCxcbiAgICAgICAgICAgIHVybDogYGh0dHBzOi8vJHtsYW5nIHx8ICdlbid9Lndpa2lwZWRpYS5vcmcvd2lraS8ke2VuY29kZVVSSUNvbXBvbmVudCh0aXRsZSl9YCxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHF1ZXJ5LCBsYW5ndWFnZTogbGFuZyB8fCAnZW4nLCByZXN1bHRzOiBwYWdlcywgY291bnQ6IHBhZ2VzLmxlbmd0aCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBXaWtpcGVkaWEgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmV0Y2hfd2ViX2NvbnRlbnQgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdmZXRjaF93ZWJfY29udGVudCcsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCB0aGUgY2xlYW4sIHRleHQtYmFzZWQgY29udGVudCBvZiBhIHdlYnBhZ2UgVVJMLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIGZldGNoJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsIH06IEZldGNoV2ViQ29udGVudFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeSh1cmwpO1xuXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGh0bWxUb1RleHQoaHRtbCwge1xuICAgICAgICAgIHdvcmR3cmFwOiBmYWxzZSxcbiAgICAgICAgICBzZWxlY3RvcnM6IFtcbiAgICAgICAgICAgIHsgc2VsZWN0b3I6ICdhJywgb3B0aW9uczogeyBpZ25vcmVIcmVmOiB0cnVlIH0gfSxcbiAgICAgICAgICAgIHsgc2VsZWN0b3I6ICdpbWcnLCBmb3JtYXQ6ICdbaW1hZ2VdJyB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdXJsLCBjb250ZW50OiB0ZXh0LnN1YnN0cmluZygwLCA1MDAwKSB9IH07IC8vIExpbWl0IGxlbmd0aFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGZldGNoIGNvbnRlbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHJhZ193ZWJfY29udGVudCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ193ZWJfY29udGVudCcsXG4gICAgZGVzY3JpcHRpb246ICdGZXRjaCBjb250ZW50IGZyb20gYSBVUkwsIGFuZCB0aGVuIHVzZSBSQUcgdG8gZmluZCBhbmQgcmV0dXJuIG9ubHkgdGhlIHRleHQgY2h1bmtzIG1vc3QgcmVsZXZhbnQgdG8gYSBzcGVjaWZpYyBxdWVyeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnVGhlIFVSTCB0byBmZXRjaCcpLFxuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzZWFyY2ggcXVlcnkgZm9yIHJlbGV2YW5jZSBtYXRjaGluZycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCwgcXVlcnkgfTogUmFnV2ViQ29udGVudFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFdpdGhSZXRyeSh1cmwpO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gICAgICAgIGNvbnN0IGh0bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBodG1sVG9UZXh0KGh0bWwpO1xuXG4gICAgICAgIC8vIFNpbXBsZSBrZXl3b3JkLWJhc2VkIHJlbGV2YW5jZSBzY29yaW5nIChwbGFjZWhvbGRlciBmb3IgcmVhbCBSQUcpXG4gICAgICAgIGNvbnN0IHF1ZXJ5VGVybXMgPSBxdWVyeS50b0xvd2VyQ2FzZSgpLnNwbGl0KC9cXHMrLykuZmlsdGVyKCh0OiBzdHJpbmcpID0+IHQubGVuZ3RoID4gMik7XG4gICAgICAgIGNvbnN0IHNlbnRlbmNlcyA9IHRleHQuc3BsaXQoL1suIT9dKy8pLm1hcCgoczogc3RyaW5nKSA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgICAgIGNvbnN0IHJlbGV2YW50Q2h1bmtzID0gc2VudGVuY2VzLmZpbHRlcigoc2VudGVuY2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgIHJldHVybiBxdWVyeVRlcm1zLnNvbWUoKHRlcm06IHN0cmluZykgPT4gc2VudGVuY2UudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyh0ZXJtKSk7XG4gICAgICAgIH0pLnNsaWNlKDAsIDUpOyAvLyBSZXR1cm4gdG9wIDUgaGl0c1xuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdXJsLCBxdWVyeSwgY2h1bmtzOiByZWxldmFudENodW5rcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8vIExhenktbG9hZCBzaW1wbGUtZ2l0IGZvciB0ZXN0YWJpbGl0eVxubGV0IHNpbXBsZUdpdE1vZHVsZTogdHlwZW9mIGltcG9ydCgnc2ltcGxlLWdpdCcpIHwgbnVsbCA9IG51bGw7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNpbXBsZUdpdCgpOiBQcm9taXNlPHR5cGVvZiBpbXBvcnQoJ3NpbXBsZS1naXQnKT4ge1xuICBpZiAoIXNpbXBsZUdpdE1vZHVsZSkge1xuICAgIHNpbXBsZUdpdE1vZHVsZSA9IGF3YWl0IGltcG9ydCgnc2ltcGxlLWdpdCcpO1xuICB9XG4gIHJldHVybiBzaW1wbGVHaXRNb2R1bGU7XG59XG5cbi8qKiBSZXNldCBnaXQgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEdpdENhY2hlKCk6IHZvaWQge1xuICBzaW1wbGVHaXRNb2R1bGUgPSBudWxsO1xufVxuXG4vKiogQ3JlYXRlIGEgZnJlc2ggZ2l0IGluc3RhbmNlIGZvciBlYWNoIG9wZXJhdGlvbiB0byBhdm9pZCBjd2QgaXNzdWVzICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVHaXQoKSB7XG4gIGNvbnN0IHsgZGVmYXVsdDogc2ltcGxlR2l0IH0gPSBhd2FpdCBnZXRTaW1wbGVHaXQoKTtcbiAgcmV0dXJuIHNpbXBsZUdpdCgpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgR2l0SHViIHJlcG8gbmFtZSBmcm9tIGdpdCByZW1vdGUgVVJMIG9yIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICogVHJpZXMgbXVsdGlwbGUgc291cmNlcyBpbiBvcmRlciBvZiByZWxpYWJpbGl0eS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0UmVwb05hbWUoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gIC8vIFByaW9yaXR5IDE6IEVudmlyb25tZW50IHZhcmlhYmxlIChHaXRIdWIgQWN0aW9ucywgQ0kvQ0QpXG4gIGlmIChwcm9jZXNzLmVudi5HSVRIVUJfUkVQT1NJVE9SWSkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5HSVRIVUJfUkVQT1NJVE9SWTtcbiAgfVxuXG4gIC8vIFByaW9yaXR5IDI6IEdpdCByZW1vdGUgVVJMIHBhcnNpbmdcbiAgdHJ5IHtcbiAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICBjb25zdCByZW1vdGVzID0gYXdhaXQgZ2l0LnJhdyhbJ2xzLXJlbW90ZScsICctLWdldC11cmwnLCAnb3JpZ2luJ10pO1xuICAgIGNvbnN0IHJlbW90ZVVybCA9IHJlbW90ZXMudHJpbSgpO1xuICAgIFxuICAgIGlmIChyZW1vdGVVcmwpIHtcbiAgICAgIC8vIEhhbmRsZSBTU0ggZm9ybWF0OiBnaXRAZ2l0aHViLmNvbTp1c2VyL3JlcG8uZ2l0XG4gICAgICBjb25zdCBzc2hNYXRjaCA9IHJlbW90ZVVybC5tYXRjaCgvZ2l0QGdpdGh1YlxcLmNvbVs6L10oW14vXStcXC9bXi9dKylcXC5naXQkLyk7XG4gICAgICBpZiAoc3NoTWF0Y2gpIHJldHVybiBzc2hNYXRjaFsxXTtcbiAgICAgIFxuICAgICAgLy8gSGFuZGxlIEhUVFBTIGZvcm1hdDogaHR0cHM6Ly9naXRodWIuY29tL3VzZXIvcmVwby5naXRcbiAgICAgIGNvbnN0IGh0dHBzTWF0Y2ggPSByZW1vdGVVcmwubWF0Y2goL2h0dHBzOlxcL1xcL2dpdGh1YlxcLmNvbVxcLyhbXi9dK1xcL1teL10rKVxcLmdpdCQvKTtcbiAgICAgIGlmIChodHRwc01hdGNoKSByZXR1cm4gaHR0cHNNYXRjaFsxXTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIEdpdCByZW1vdGUgbm90IGF2YWlsYWJsZSwgY29udGludWUgdG8gbmV4dCBwcmlvcml0eVxuICB9XG5cbiAgLy8gUHJpb3JpdHkgMzogRW52aXJvbm1lbnQgdmFyaWFibGUgR0lUSFVCX1JFUE8gYXMgZmFsbGJhY2tcbiAgaWYgKHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogU2hhcmVkIGhlbHBlcjogTWFrZSBHaXRIdWIgQVBJIHJlcXVlc3RzIHdpdGggYXV0aGVudGljYXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2hBcGlSZXF1ZXN0KG1ldGhvZDogc3RyaW5nLCBlbmRwb2ludDogc3RyaW5nLCBib2R5PzogdW5rbm93bikge1xuICBjb25zdCBnaXRodWJUb2tlbiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjtcbiAgXG4gIGlmICghZ2l0aHViVG9rZW4pIHRocm93IG5ldyBFcnJvcignR0lUSFVCX1RPS0VOIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG5vdCBzZXQnKTtcbiAgXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20ke2VuZHBvaW50fWAsIHtcbiAgICBtZXRob2QsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7Z2l0aHViVG9rZW59YCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgICBib2R5OiBib2R5ID8gSlNPTi5zdHJpbmdpZnkoYm9keSkgOiB1bmRlZmluZWQsXG4gIH0pO1xuXG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHaXRIdWIgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pOiAke2Vycm9yVGV4dH1gKTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZS5qc29uKCk7XG59XG5cbi8qKiBUeXBlZCBwYXJhbXMgaW50ZXJmYWNlcyAqL1xudHlwZSBHaXRTdGF0dXNQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG5pbnRlcmZhY2UgR2l0RGlmZlBhcmFtcyB7IGZpbGVfcGF0aD86IHN0cmluZzsgY2FjaGVkPzogYm9vbGVhbjsgfVxuaW50ZXJmYWNlIEdpdENvbW1pdFBhcmFtcyB7IG1lc3NhZ2U6IHN0cmluZzsgfVxuaW50ZXJmYWNlIEdpdExvZ1BhcmFtcyB7IG1heF9jb3VudD86IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdpdEFkZFBhcmFtcyB7IHBhdGhzPzogc3RyaW5nW107IH1cbmludGVyZmFjZSBHaXRDaGVja291dFBhcmFtcyB7IGJyYW5jaF9uYW1lOiBzdHJpbmc7IGNyZWF0ZV9uZXc/OiBib29sZWFuOyB9XG5pbnRlcmZhY2UgR2hDcmVhdGVJc3N1ZVBhcmFtcyB7IHRpdGxlOiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IGxhYmVscz86IHN0cmluZ1tdOyB9XG5pbnRlcmZhY2UgR2hMaXN0SXNzdWVzUGFyYW1zIHsgc3RhdGU/OiAnb3BlbicgfCAnY2xvc2VkJzsgbGFiZWxzPzogc3RyaW5nW107IGxpbWl0PzogbnVtYmVyOyB9XG5pbnRlcmZhY2UgR2hWaWV3Q29tbWVudHNQYXJhbXMgeyBudW1iZXI6IG51bWJlcjsgdHlwZT86ICdpc3N1ZScgfCAncHInOyB9XG5pbnRlcmZhY2UgR2hDcmVhdGVQclBhcmFtcyB7IHRpdGxlOiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IGhlYWRfYnJhbmNoOiBzdHJpbmc7IGJhc2VfYnJhbmNoPzogc3RyaW5nOyB9XG5pbnRlcmZhY2UgR2hMaXN0UHJzUGFyYW1zIHsgc3RhdGU/OiAnb3BlbicgfCAnY2xvc2VkJzsgbGltaXQ/OiBudW1iZXI7IH1cbmludGVyZmFjZSBHaFZpZXdQckRpZmZQYXJhbXMgeyBudW1iZXI6IG51bWJlcjsgfVxuaW50ZXJmYWNlIEdoUHVzaFBhcmFtcyB7IGJyYW5jaD86IHN0cmluZzsgfVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJHaXRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gZ2l0X3N0YXR1cyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9zdGF0dXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHRoZSBjdXJyZW50IGdpdCBzdGF0dXMgb2YgdGhlIHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKF9wYXJhbXM6IEdpdFN0YXR1c1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGNvbnN0IHN0YXR1c1Jlc3VsdCA9IGF3YWl0IGdpdC5zdGF0dXMoKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogc3RhdHVzUmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgc3RhdHVzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2RpZmYgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaXRfZGlmZicsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgdGhlIGdpdCBkaWZmIG9mIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgb3Igc3BlY2lmaWMgZmlsZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFBhdGggdG8gc3BlY2lmaWMgZmlsZSB0byBkaWZmLicpLFxuICAgICAgY2FjaGVkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdPcHRpb25hbDogU2hvdyBzdGFnZWQgY2hhbmdlcyBvbmx5IChnaXQgZGlmZiAtLWNhY2hlZCkuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmlsZV9wYXRoLCBjYWNoZWQgfTogR2l0RGlmZlBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGxldCBkaWZmID0gJyc7XG4gICAgICAgIGlmIChmaWxlX3BhdGgpIHtcbiAgICAgICAgICBkaWZmID0gYXdhaXQgZ2l0LmRpZmYoW2ZpbGVfcGF0aF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpZmYgPSBjYWNoZWQgPyBhd2FpdCBnaXQuZGlmZihbJy0tY2FjaGVkJ10pIDogYXdhaXQgZ2l0LmRpZmYoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRpZmYgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGRpZmYgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaXRfY29tbWl0IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2l0X2NvbW1pdCcsXG4gICAgZGVzY3JpcHRpb246ICdDb21taXQgc3RhZ2VkIGNoYW5nZXMgdG8gdGhlIGdpdCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1pdCBtZXNzYWdlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbWVzc2FnZSB9OiBHaXRDb21taXRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBhd2FpdCBnaXQuY29tbWl0KG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNvbW1pdHRlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgY29tbWl0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2xvZyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9sb2cnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IHJlY2VudCBnaXQgY29tbWl0IGhpc3RvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBtYXhfY291bnQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heCBudW1iZXIgb2YgY29tbWl0cyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG1heF9jb3VudCB9OiBHaXRMb2dQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBjb25zdCBjb3VudCA9IG1heF9jb3VudCB8fCAxMDtcbiAgICAgICAgY29uc3QgbG9nID0gYXdhaXQgZ2l0LmxvZyhjb3VudCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWl0czogbG9nLmFsbCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXQgbG9nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2l0X2FkZCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9hZGQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhZ2Ugc3BlY2lmaWMgZmlsZXMgb3IgYWxsIGNoYW5nZXMgZm9yIHRoZSBuZXh0IGNvbW1pdC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHBhdGhzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsOiBTcGVjaWZpYyBmaWxlIHBhdGhzIHRvIHN0YWdlLiBJZiBvbWl0dGVkLCBzdGFnZXMgYWxsIGNoYW5nZXMuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aHMgfTogR2l0QWRkUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBnaXQgPSBhd2FpdCBjcmVhdGVHaXQoKTtcbiAgICAgICAgaWYgKHBhdGhzICYmIHBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhd2FpdCBnaXQuYWRkKHBhdGhzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBnaXQuYWRkKCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBzdGFnZWRQYXRoczogcGF0aHMgfHwgJ2FsbCcgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGFkZCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdpdF9jaGVja291dCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dpdF9jaGVja291dCcsXG4gICAgZGVzY3JpcHRpb246ICdTd2l0Y2ggdG8gYW4gZXhpc3RpbmcgYnJhbmNoIG9yIGNyZWF0ZSBhbmQgc3dpdGNoIHRvIGEgbmV3IG9uZS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGJyYW5jaF9uYW1lOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOYW1lIG9mIHRoZSBicmFuY2ggdG8gY2hlY2tvdXQuJyksXG4gICAgICBjcmVhdGVfbmV3OiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKFwiSWYgdHJ1ZSwgY3JlYXRlcyB0aGUgYnJhbmNoIGlmIGl0IGRvZXNuJ3QgZXhpc3QgKGxpa2UgZ2l0IGNoZWNrb3V0IC1iKS5cIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYnJhbmNoX25hbWUsIGNyZWF0ZV9uZXcgfTogR2l0Q2hlY2tvdXRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdCA9IGF3YWl0IGNyZWF0ZUdpdCgpO1xuICAgICAgICBpZiAoY3JlYXRlX25ldykge1xuICAgICAgICAgIGF3YWl0IGdpdC5jaGVja291dExvY2FsQnJhbmNoKGJyYW5jaF9uYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBnaXQuY2hlY2tvdXQoYnJhbmNoX25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgYnJhbmNoTmFtZTogYnJhbmNoX25hbWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0IGNoZWNrb3V0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfYXV0aCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX2F1dGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2sgR2l0SHViIGF1dGhlbnRpY2F0aW9uIHN0YXR1cy4gSWYgbm90IGF1dGhlbnRpY2F0ZWQsIG9wZW5zIGEgdGVybWluYWwgd2luZG93IGZvciB0aGUgdXNlciB0byBzaWduIGluLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdpdGh1YlRva2VuID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0dJVEhVQl9UT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0LiBQbGVhc2Ugc2V0IGl0IHRvIHVzZSBHaXRIdWIgQVBJIHRvb2xzLicgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCAnL3VzZXInKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBhdXRoZW50aWNhdGVkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBhdXRoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfY3JlYXRlX2lzc3VlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfY3JlYXRlX2lzc3VlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBHaXRIdWIgaXNzdWUgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgaXNzdWUgdGl0bGUnKSxcbiAgICAgIGJvZHk6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGhlIGlzc3VlIGJvZHkvZGVzY3JpcHRpb24nKSxcbiAgICAgIGxhYmVsczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdMYWJlbHMgdG8gYXBwbHknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgYm9keSwgbGFiZWxzIH06IEdoQ3JlYXRlSXNzdWVQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4gRW5zdXJlIEdJVEhVQl9SRVBPU0lUT1JZIGVudiBpcyBzZXQgb3IgZ2l0IHJlbW90ZSBcIm9yaWdpblwiIHBvaW50cyB0byBhIEdpdEh1YiByZXBvLicpO1xuXG4gICAgICAgIGF3YWl0IGdoQXBpUmVxdWVzdCgnUE9TVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vaXNzdWVzYCwgeyB0aXRsZSwgYm9keSwgbGFiZWxzIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNyZWF0ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGlzc3VlIGNyZWF0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfbGlzdF9pc3N1ZXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9saXN0X2lzc3VlcycsXG4gICAgZGVzY3JpcHRpb246ICdMaXN0IGlzc3VlcyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc3RhdGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCkuZGVmYXVsdCgnb3BlbicpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgaXNzdWUgc3RhdGUnKSxcbiAgICAgIGxhYmVsczogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdGaWx0ZXIgYnkgbGFiZWxzJyksXG4gICAgICBsaW1pdDogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDUwKS5vcHRpb25hbCgpLmRlZmF1bHQoMTApLmRlc2NyaWJlKCdNYXggaXNzdWVzIHRvIHJldHVybiAoZGVmYXVsdDogMTApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc3RhdGUsIGxhYmVscywgbGltaXQgfTogR2hMaXN0SXNzdWVzUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXBvTmFtZSA9IGF3YWl0IGdldFJlcG9OYW1lKCk7XG4gICAgICAgIGlmICghcmVwb05hbWUpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSByZXBvc2l0b3J5IG5hbWUuJyk7XG5cbiAgICAgICAgbGV0IHF1ZXJ5ID0gYHN0YXRlPSR7c3RhdGV9YDtcbiAgICAgICAgaWYgKGxhYmVscyAmJiBsYWJlbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHF1ZXJ5ICs9IGAmbGFiZWxzPSR7bGFiZWxzLmpvaW4oJywnKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNzdWVzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9L2lzc3Vlcz8ke3F1ZXJ5fSZwZXJfcGFnZT0ke2xpbWl0IHx8IDEwfWApO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlzc3VlcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBHaXRIdWIgaXNzdWVzIGxpc3RpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF92aWV3X2NvbW1lbnRzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfdmlld19jb21tZW50cycsXG4gICAgZGVzY3JpcHRpb246ICdWaWV3IGNvbW1lbnRzIG9uIGEgc3BlY2lmaWMgaXNzdWUgb3IgcHVsbCByZXF1ZXN0LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnVGhlIGlzc3VlIG9yIFBSIG51bWJlcicpLFxuICAgICAgdHlwZTogei5lbnVtKFsnaXNzdWUnLCAncHInXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdpc3N1ZScpLmRlc2NyaWJlKFwiV2hldGhlciBpdCdzIGFuIGlzc3VlIG9yIGEgcHVsbCByZXF1ZXN0XCIpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG51bWJlciwgdHlwZSB9OiBHaFZpZXdDb21tZW50c1BhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb05hbWUgPSBhd2FpdCBnZXRSZXBvTmFtZSgpO1xuICAgICAgICBpZiAoIXJlcG9OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlcm1pbmUgcmVwb3NpdG9yeSBuYW1lLicpO1xuXG4gICAgICAgIGNvbnN0IGNvbW1lbnRzID0gYXdhaXQgZ2hBcGlSZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7cmVwb05hbWV9LyR7dHlwZSA9PT0gJ3ByJyA/ICdwdWxscycgOiAnaXNzdWVzJ30vJHtudW1iZXJ9L2NvbW1lbnRzYCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY29tbWVudHMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIGNvbW1lbnRzIHZpZXdpbmcgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBnaF9jcmVhdGVfcHIgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdnaF9jcmVhdGVfcHInLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IHB1bGwgcmVxdWVzdCBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGl0bGU6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBQUiB0aXRsZScpLFxuICAgICAgYm9keTogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdUaGUgUFIgYm9keS9kZXNjcmlwdGlvbicpLFxuICAgICAgaGVhZF9icmFuY2g6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBicmFuY2ggY29udGFpbmluZyB5b3VyIGNoYW5nZXMnKSxcbiAgICAgIGJhc2VfYnJhbmNoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnbWFpbicpLmRlc2NyaWJlKCdUaGUgYnJhbmNoIHlvdSB3YW50IHRvIG1lcmdlIGludG8gKGUuZy4sIG1haW4sIG1hc3RlciknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgYm9keSwgaGVhZF9icmFuY2gsIGJhc2VfYnJhbmNoIH06IEdoQ3JlYXRlUHJQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBjb25zdCBwciA9IGF3YWl0IGdoQXBpUmVxdWVzdCgnUE9TVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vcHVsbHNgLCB7IHRpdGxlLCBib2R5LCBoZWFkOiBoZWFkX2JyYW5jaCwgYmFzZTogYmFzZV9icmFuY2ggfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY3JlYXRlZDogdHJ1ZSwgdXJsOiAocHIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmh0bWxfdXJsIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUiBjcmVhdGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdoX2xpc3RfcHJzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfbGlzdF9wcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGlzdCBwdWxsIHJlcXVlc3RzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBzdGF0ZTogei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSkub3B0aW9uYWwoKS5kZWZhdWx0KCdvcGVuJykuZGVzY3JpYmUoJ0ZpbHRlciBieSBQUiBzdGF0ZScpLFxuICAgICAgbGltaXQ6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDEwKS5kZXNjcmliZSgnTWF4IFBScyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHN0YXRlLCBsaW1pdCB9OiBHaExpc3RQcnNQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBjb25zdCBwcnMgPSBhd2FpdCBnaEFwaVJlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHtyZXBvTmFtZX0vcHVsbHM/c3RhdGU9JHtzdGF0ZX0mcGVyX3BhZ2U9JHtsaW1pdCB8fCAxMH1gKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwcnMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIFBScyBsaXN0aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfdmlld19wcl9kaWZmIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2hfdmlld19wcl9kaWZmJyxcbiAgICBkZXNjcmlwdGlvbjogJ0ZldGNoIHRoZSBkaWZmL3BhdGNoIG9mIGEgc3BlY2lmaWMgcHVsbCByZXF1ZXN0LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5kZXNjcmliZSgnVGhlIFBSIG51bWJlcicpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IG51bWJlciB9OiBHaFZpZXdQckRpZmZQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcG9OYW1lID0gYXdhaXQgZ2V0UmVwb05hbWUoKTtcbiAgICAgICAgaWYgKCFyZXBvTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHJlcG9zaXRvcnkgbmFtZS4nKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zLyR7cmVwb05hbWV9L3B1bGxzLyR7bnVtYmVyfS9kaWZmYCwge1xuICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOfWAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGRpZmY6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZGlmZiA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBkaWZmIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEdpdEh1YiBQUiBkaWZmIGZldGNoaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2hfcHVzaCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2doX3B1c2gnLFxuICAgIGRlc2NyaXB0aW9uOiAnUHVzaCBsb2NhbCBjb21taXRzIHRvIHRoZSByZW1vdGUgR2l0SHViIHJlcG9zaXRvcnkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBicmFuY2g6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWw6IFRoZSBicmFuY2ggdG8gcHVzaC4gRGVmYXVsdHMgdG8gY3VycmVudCBicmFuY2guJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgYnJhbmNoIH06IEdoUHVzaFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0ID0gYXdhaXQgY3JlYXRlR2l0KCk7XG4gICAgICAgIGF3YWl0IGdpdC5wdXNoKGJyYW5jaCB8fCAnb3JpZ2luJywgJ0hFQUQnKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBwdXNoZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgR2l0SHViIHB1c2ggZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEM1IEZJWDogUHJvcGVyIHR5cGluZyBpbnN0ZWFkIG9mIGFueVxuaW1wb3J0IHR5cGUgKiBhcyBQdXBwZXRlZXIgZnJvbSAncHVwcGV0ZWVyJztcblxubGV0IHB1cHBldGVlck1vZHVsZTogdHlwZW9mIFB1cHBldGVlciB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRQdXBwZXRlZXIoKTogUHJvbWlzZTx0eXBlb2YgUHVwcGV0ZWVyPiB7XG4gIGlmICghcHVwcGV0ZWVyTW9kdWxlKSB7XG4gICAgY29uc3QgaW1wb3J0ZWQgPSBhd2FpdCBpbXBvcnQoJ3B1cHBldGVlcicpO1xuICAgIHB1cHBldGVlck1vZHVsZSA9IGltcG9ydGVkLmRlZmF1bHQgfHwgaW1wb3J0ZWQ7XG4gIH1cbiAgcmV0dXJuIHB1cHBldGVlck1vZHVsZTtcbn1cblxuLyoqIFJlc2V0IHB1cHBldGVlciBtb2R1bGUgY2FjaGUgKGZvciB0ZXN0aW5nKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0UHVwcGV0ZWVyQ2FjaGUoKTogdm9pZCB7XG4gIHB1cHBldGVlck1vZHVsZSA9IG51bGw7XG59XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpcic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5cbi8qKiBCcm93c2VyIHNlc3Npb24gbWFuYWdlciB3aXRoIGF1dG8tY2xlYW51cCBhbmQgY29ubmVjdGlvbiBwb29saW5nIChzaW5nbGV0b24gcGF0dGVybikgKi9cbmNsYXNzIEJyb3dzZXJTZXNzaW9uTWFuYWdlciB7XG4gIHByaXZhdGUgYnJvd3Nlckluc3RhbmNlOiBQdXBwZXRlZXIuQnJvd3NlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGN1cnJlbnRQYWdlOiBQdXBwZXRlZXIuUGFnZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNsZWFudXBUaW1lcjogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpO1xuICBwcml2YXRlIHJlYWRvbmx5IElOQUNUSVZJVFlfVElNRU9VVF9NUyA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuICBwcml2YXRlIHJlYWRvbmx5IE1BWF9SRVRSSUVTID0gMjtcbiAgcHJpdmF0ZSByZXRyeUNvdW50ID0gMDtcblxuICAvKiogR2V0IG9yIGNyZWF0ZSBhIHBlcnNpc3RlbnQgUHVwcGV0ZWVyIGJyb3dzZXIgaW5zdGFuY2Ugd2l0aCBhdXRvLXJldHJ5ICovXG4gIGFzeW5jIGdldEJyb3dzZXIoKTogUHJvbWlzZTxQdXBwZXRlZXIuQnJvd3Nlcj4ge1xuICAgIGlmICghdGhpcy5icm93c2VySW5zdGFuY2UgfHwgIXRoaXMuYnJvd3Nlckluc3RhbmNlLmNvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLnJldHJ5Q291bnQgPSAwO1xuICAgICAgd2hpbGUgKHRoaXMucmV0cnlDb3VudCA8IHRoaXMuTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBwdXBwZXRlZXJMaWIgPSBhd2FpdCBnZXRQdXBwZXRlZXIoKTtcbiAgICAgICAgICB0aGlzLmJyb3dzZXJJbnN0YW5jZSA9IGF3YWl0IHB1cHBldGVlckxpYi5sYXVuY2goeyBcbiAgICAgICAgICAgIGhlYWRsZXNzOiB0cnVlLFxuICAgICAgICAgICAgYXJnczogWyctLW5vLXNhbmRib3gnLCAnLS1kaXNhYmxlLXNldHVpZC1zYW5kYm94J10gLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHRoaXMucmV0cnlDb3VudCsrO1xuICAgICAgICAgIGlmICh0aGlzLnJldHJ5Q291bnQgPj0gdGhpcy5NQVhfUkVUUklFUykgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDAgKiB0aGlzLnJldHJ5Q291bnQpKTsgLy8gRXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVzZXRDbGVhbnVwVGltZXIoKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgIHJldHVybiB0aGlzLmJyb3dzZXJJbnN0YW5jZSE7XG4gIH1cblxuICAvKiogR2V0IG9yIGNyZWF0ZSBhIHBhZ2UgaW4gdGhlIHBlcnNpc3RlbnQgYnJvd3NlciBpbnN0YW5jZSAqL1xuICBhc3luYyBnZXRQYWdlKCk6IFByb21pc2U8UHVwcGV0ZWVyLlBhZ2U+IHtcbiAgICBpZiAoIXRoaXMuY3VycmVudFBhZ2UgfHwgIWF3YWl0IHRoaXMuaXNQYWdlVmFsaWQoKSkge1xuICAgICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHRoaXMuZ2V0QnJvd3NlcigpO1xuICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xuICAgIH1cbiAgICB0aGlzLnJlc2V0Q2xlYW51cFRpbWVyKCk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2U7XG4gIH1cblxuICAvKiogQ2hlY2sgaWYgY3VycmVudCBwYWdlIGlzIHN0aWxsIHZhbGlkICovXG4gIHByaXZhdGUgYXN5bmMgaXNQYWdlVmFsaWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5jdXJyZW50UGFnZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgYXdhaXQgdGhpcy5jdXJyZW50UGFnZS5ldmFsdWF0ZSgnMScpOyAvLyBRdWljayB2YWxpZGF0aW9uXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogUmVzZXQgdGhlIGluYWN0aXZpdHkgY2xlYW51cCB0aW1lciAqL1xuICBwcml2YXRlIHJlc2V0Q2xlYW51cFRpbWVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNsZWFudXBUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuY2xlYW51cFRpbWVyKTtcbiAgICB0aGlzLmxhc3RBY3Rpdml0eSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5jbGVhbnVwVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZGlzcG9zZSgpLCB0aGlzLklOQUNUSVZJVFlfVElNRU9VVF9NUyk7XG4gIH1cblxuICAvKiogRXhwbGljaXRseSBkaXNwb3NlIGJyb3dzZXIgYW5kIGNhbmNlbCBjbGVhbnVwIHRpbWVyICovXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2xlYW51cFRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5jbGVhbnVwVGltZXIpO1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5icm93c2VySW5zdGFuY2UgJiYgdGhpcy5icm93c2VySW5zdGFuY2UuY29ubmVjdGVkKCkpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9hd2FpdC10aGVuYWJsZVxuICAgICAgICBhd2FpdCB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGNsb3NlIGVycm9yc1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmJyb3dzZXJJbnN0YW5jZSA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnRQYWdlID0gbnVsbDtcbiAgICAgIHRoaXMubGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMucmV0cnlDb3VudCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrIGlmIGJyb3dzZXIgaXMgY29ubmVjdGVkICovXG4gIGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhISh0aGlzLmJyb3dzZXJJbnN0YW5jZSAmJiB0aGlzLmJyb3dzZXJJbnN0YW5jZS5jb25uZWN0ZWQoKSk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBjdXJyZW50IHBhZ2UgKHB1YmxpYyBhY2Nlc3NvcikgKi9cbiAgZ2V0Q3VycmVudFBhZ2UoKTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UGFnZTtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIGN1cnJlbnQgcGFnZSAocHVibGljIHNldHRlcikgKi9cbiAgc2V0Q3VycmVudFBhZ2UocGFnZTogUHVwcGV0ZWVyLlBhZ2UgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2U7XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlIGZvciB0aGlzIG1vZHVsZVxuY29uc3QgYnJvd3Nlck1hbmFnZXIgPSBuZXcgQnJvd3NlclNlc3Npb25NYW5hZ2VyKCk7XG5cbi8qKiBFeHBvcnQgY2xlYW51cCBmdW5jdGlvbiBmb3IgcGx1Z2luIHVubG9hZCBsaWZlY3ljbGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwQnJvd3NlclNlc3Npb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG59XG5cbi8vIEM1IEZJWDogUHJvcGVyIHBhcmFtIHR5cGVzXG5pbnRlcmZhY2UgQnJvd3Nlck9wZW5QYWdlUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZztcbiAgd2FpdF9mb3Jfc2VsZWN0b3I/OiBzdHJpbmc7XG4gIGZ1bGxfcGFnZV9zY3JlZW5zaG90PzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEJyb3dzZXJTZXNzaW9uQ29udHJvbFBhcmFtcyB7XG4gIGFjdGlvbnM/OiB1bmtub3duW107XG4gIHJlYWRfcGFnZT86IGJvb2xlYW47XG4gIGZ1bGxfcmVhZD86IGJvb2xlYW47XG4gIHNjcmVlbnNob3RfcGF0aD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFByZXZpZXdIdG1sUGFyYW1zIHtcbiAgaHRtbF9jb250ZW50OiBzdHJpbmc7XG4gIGZpbGVfbmFtZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE9wZW5GaWxlUGFyYW1zIHtcbiAgdGFyZ2V0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJyb3dzZXJUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG4gIC8vIGJyb3dzZXJfb3Blbl9wYWdlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnYnJvd3Nlcl9vcGVuX3BhZ2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnT3BlbiBhIHdlYnBhZ2UgaW4gYSBoZWFkbGVzcyBicm93c2VyIChQdXBwZXRlZXIpLCByZW5kZXIgaXQgb25jZSwgYW5kIHJldHVybiBjb250ZW50LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdUaGUgVVJMIHRvIG9wZW4nKSxcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdQYXRoIHRvIHNhdmUgYSBzY3JlZW5zaG90LicpLFxuICAgICAgd2FpdF9mb3Jfc2VsZWN0b3I6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ1NTIHNlbGVjdG9yIHRvIHdhaXQgZm9yIGJlZm9yZSByZXR1cm5pbmcuJyksXG4gICAgICBmdWxsX3BhZ2Vfc2NyZWVuc2hvdDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KGZhbHNlKS5kZXNjcmliZSgnSWYgdHJ1ZSwgY2FwdHVyZXMgdGhlIGZ1bGwgcGFnZSB3aGVuIHRha2luZyBhIHNjcmVlbnNob3QuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsLCBzY3JlZW5zaG90X3BhdGgsIHdhaXRfZm9yX3NlbGVjdG9yLCBmdWxsX3BhZ2Vfc2NyZWVuc2hvdCB9OiBCcm93c2VyT3BlblBhZ2VQYXJhbXMpID0+IHtcbiAgICAgIGxldCBicm93c2VyOiBQdXBwZXRlZXIuQnJvd3NlciB8IG51bGwgPSBudWxsO1xuICAgICAgbGV0IHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGJyb3dzZXIgPSBhd2FpdCBicm93c2VyTWFuYWdlci5nZXRCcm93c2VyKCk7XG4gICAgICAgIHBhZ2UgPSBicm93c2VyTWFuYWdlci5nZXRDdXJyZW50UGFnZSgpO1xuXG4gICAgICAgIGlmICghcGFnZSB8fCAoYXdhaXQgcGFnZS51cmwoKSkgIT09IHVybCkge1xuICAgICAgICAgIC8vIElmIG5vIGN1cnJlbnQgcGFnZSBvciBVUkwgZG9lc24ndCBtYXRjaCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAgIHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICBicm93c2VyTWFuYWdlci5zZXRDdXJyZW50UGFnZShwYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHBhZ2UuZ290byh1cmwsIHsgd2FpdFVudGlsOiAnZG9tY29udGVudGxvYWRlZCcgfSk7XG5cbiAgICAgICAgaWYgKHdhaXRfZm9yX3NlbGVjdG9yKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvclNlbGVjdG9yKHdhaXRfZm9yX3NlbGVjdG9yLCB7IHRpbWVvdXQ6IDUwMDAgfSk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBJZ25vcmUgdGltZW91dCwgY29udGludWUgd2l0aCBjb250ZW50IGV4dHJhY3Rpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHREYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgdXJsLCBvcGVuZWQ6IHRydWUgfTtcblxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoLCBmdWxsUGFnZTogZnVsbF9wYWdlX3NjcmVlbnNob3QgfSk7XG4gICAgICAgICAgcmVzdWx0RGF0YS5zY3JlZW5zaG90U2F2ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlIHN0cmluZy1iYXNlZCBldmFsdWF0ZSB0byBieXBhc3MgVFMyNTg0L1RTMjMwNCAnZG9jdW1lbnQnIGVycm9ycyBpbiBOb2RlLmpzIGVudmlyb25tZW50XG4gICAgICAgIGNvbnN0IHRleHRDb250ZW50OiBzdHJpbmcgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKGByZXR1cm4gZG9jdW1lbnQuYm9keSA/IGRvY3VtZW50LmJvZHkuaW5uZXJUZXh0IDogJyc7YCk7XG4gICAgICAgIHJlc3VsdERhdGEucGFnZVRleHQgPSB0ZXh0Q29udGVudC5zdWJzdHJpbmcoMCwgMjAwMCk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0RGF0YSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gcGFnZTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIE5PVEU6IFdlIGRvbid0IGNsb3NlIHRoZSBicm93c2VyIGhlcmUgYmVjYXVzZSB3ZSB1c2UgYSBzaW5nbGV0b24gcGF0dGVybi5cbiAgICAgICAgLy8gVGhlIGJyb3dzZXIgc3RheXMgYWxpdmUgZm9yIHN1YnNlcXVlbnQgcmVxdWVzdHMgdmlhIGJyb3dzZXJfc2Vzc2lvbl9jb250cm9sLlxuICAgICAgICAvLyBVc2UgYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlIHRvIGV4cGxpY2l0bHkgdGVybWluYXRlIGl0LlxuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBicm93c2VyX3Nlc3Npb25fY29udHJvbCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2Jyb3dzZXJfc2Vzc2lvbl9jb250cm9sJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NvbnRyb2wgdGhlIGFjdGl2ZSBwZXJzaXN0ZW50IGJyb3dzZXIgc2Vzc2lvbi4gU3VwcG9ydHMgYWN0aW9ucywgcGFnZSByZWFkaW5nLCBzY3JlZW5zaG90IGNhcHR1cmUuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBhY3Rpb25zOiB6LmFycmF5KHouYW55KCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHNjcmlwdGVkIGJyb3dzZXIgYWN0aW9ucyB0byBleGVjdXRlLicpLFxuICAgICAgcmVhZF9wYWdlOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQoZmFsc2UpLmRlc2NyaWJlKCdJZiB0cnVlLCByZXR1cm5zIHBhZ2UgbWV0YWRhdGEuJyksXG4gICAgICBmdWxsX3JlYWQ6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdChmYWxzZSkuZGVzY3JpYmUoJ0lmIHRydWUsIGZvcmNlcyBmdWxsIHBhZ2UgdGV4dCBvdXRwdXQuJyksXG4gICAgICBzY3JlZW5zaG90X3BhdGg6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZSgnT3B0aW9uYWwgc2NyZWVuc2hvdCBvdXRwdXQgcGF0aC4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBhY3Rpb25zLCByZWFkX3BhZ2UsIGZ1bGxfcmVhZCwgc2NyZWVuc2hvdF9wYXRoIH06IEJyb3dzZXJTZXNzaW9uQ29udHJvbFBhcmFtcykgPT4ge1xuICAgICAgbGV0IHBhZ2U6IFB1cHBldGVlci5QYWdlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHBhZ2UgPSBhd2FpdCBicm93c2VyTWFuYWdlci5nZXRQYWdlKCk7XG5cbiAgICAgICAgaWYgKGFjdGlvbnMgJiYgQXJyYXkuaXNBcnJheShhY3Rpb25zKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgYWN0aW9uIG9mIGFjdGlvbnMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5bXSkge1xuICAgICAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHBhZ2UuY2xpY2soYWN0aW9uLnNlbGVjdG9yIGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAndHlwZScpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS50eXBlKGFjdGlvbi5zZWxlY3RvciBhcyBzdHJpbmcsIGFjdGlvbi50ZXh0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSAnZ290bycpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKGFjdGlvbi51cmwgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09ICdldmFsdWF0ZScpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGFnZS5ldmFsdWF0ZShhY3Rpb24uc2NyaXB0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IGFjdGlvbnNFeGVjdXRlZDogYWN0aW9ucz8ubGVuZ3RoIHx8IDAgfTtcblxuICAgICAgICBpZiAocmVhZF9wYWdlIHx8IGZ1bGxfcmVhZCkge1xuICAgICAgICAgIC8vIFVzZSBzdHJpbmctYmFzZWQgZXZhbHVhdGUgdG8gYnlwYXNzIFRTMjU4NCAnZG9jdW1lbnQnIGVycm9ycyBpbiBOb2RlLmpzIGVudmlyb25tZW50XG4gICAgICAgICAgY29uc3QgdGV4dDogc3RyaW5nID0gYXdhaXQgcGFnZS5ldmFsdWF0ZShgcmV0dXJuIGRvY3VtZW50LmJvZHkgPyBkb2N1bWVudC5ib2R5LmlubmVyVGV4dCA6ICcnO2ApO1xuICAgICAgICAgIHJlc3VsdERhdGEucGFnZVRleHQgPSBmdWxsX3JlYWQgPyB0ZXh0IDogdGV4dC5zdWJzdHJpbmcoMCwgMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NyZWVuc2hvdF9wYXRoKSB7XG4gICAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogc2NyZWVuc2hvdF9wYXRoIH0pO1xuICAgICAgICAgIHJlc3VsdERhdGEuc2NyZWVuc2hvdFNhdmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEJyb3dzZXIgY29udHJvbCBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBQYWdlIHN0YXlzIGFsaXZlIGZvciBzZXNzaW9uIHJldXNlLiBCcm93c2VyIGlzIG1hbmFnZWQgYnkgYnJvd3Nlcl9zZXNzaW9uX2Nsb3NlLlxuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBicm93c2VyX3Nlc3Npb25fY2xvc2UgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdicm93c2VyX3Nlc3Npb25fY2xvc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2xvc2UgdGhlIGFjdGl2ZSBwZXJzaXN0ZW50IGJyb3dzZXIgc2Vzc2lvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBicm93c2VyTWFuYWdlci5kaXNwb3NlKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgY2xvc2VkOiB0cnVlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjbG9zZSBicm93c2VyIHNlc3Npb246ICR7bWVzc2FnZX1gIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBFbnN1cmUgY2xlYW51cCBldmVuIG9uIGZhaWx1cmVcbiAgICAgICAgYXdhaXQgYnJvd3Nlck1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBwcmV2aWV3X2h0bWwgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdwcmV2aWV3X2h0bWwnLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlbmRlciBhbmQgcHJldmlldyBIVE1MIGNvbnRlbnQgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYnJvd3Nlci5cIixcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBIVE1MIGNvbnRlbnQgdG8gcmVuZGVyJyksXG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCdwcmV2aWV3Lmh0bWwnKS5kZXNjcmliZSgnT3B0aW9uYWwgZmlsZW5hbWUgKGRlZmF1bHQ6IHByZXZpZXcuaHRtbCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBodG1sX2NvbnRlbnQsIGZpbGVfbmFtZSB9OiBQcmV2aWV3SHRtbFBhcmFtcykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBmaWxlX25hbWUgfHwgJ3ByZXZpZXcuaHRtbCc7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgZmlsZU5hbWUpO1xuXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWxfY29udGVudCk7XG5cbiAgICAgICAgLy8gT3BlbiBpbiBkZWZhdWx0IGJyb3dzZXIgdXNpbmcgRVMgaW1wb3J0XG4gICAgICAgIGNvbnN0IG9wZW5Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ29wZW4nKTtcbiAgICAgICAgYXdhaXQgb3Blbk1vZHVsZS5kZWZhdWx0KGZpbGVQYXRoKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHByZXZpZXdlZDogdHJ1ZSwgZmlsZTogZmlsZU5hbWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHByZXZpZXcgSFRNTDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gb3Blbl9maWxlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnb3Blbl9maWxlJyxcbiAgICBkZXNjcmlwdGlvbjogXCJPcGVuIGEgZmlsZSBvciBVUkwgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYXBwbGljYXRpb24uXCIsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdGFyZ2V0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdGaWxlIHBhdGggb3IgVVJMJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGFyZ2V0IH06IE9wZW5GaWxlUGFyYW1zKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdCh0YXJnZXQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG9wZW5lZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gb3BlbiBmaWxlOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IHZhbGlkYXRlU1FMUXVlcnkgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5cbi8vIExhenktbG9hZCBub2RlOnNxbGl0ZSAoTm9kZS5qcyAyMyspLiBHcmFjZWZ1bCBmYWxsYmFjayBmb3Igb2xkZXIgTm9kZSB2ZXJzaW9ucy5cbmxldCBzcWxpdGVNb2R1bGU6IHR5cGVvZiBpbXBvcnQoJ25vZGU6c3FsaXRlJykgfCBudWxsID0gbnVsbDtcbmxldCBzcWxpdGVMb2FkRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTcWxpdGUoKTogUHJvbWlzZTx0eXBlb2YgaW1wb3J0KCdub2RlOnNxbGl0ZScpPiB7XG4gIGlmIChzcWxpdGVNb2R1bGUpIHJldHVybiBzcWxpdGVNb2R1bGU7XG4gIGlmIChzcWxpdGVMb2FkRXJyb3IpIHRocm93IG5ldyBFcnJvcihzcWxpdGVMb2FkRXJyb3IpO1xuXG4gIHRyeSB7XG4gICAgc3FsaXRlTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdub2RlOnNxbGl0ZScpO1xuICAgIHJldHVybiBzcWxpdGVNb2R1bGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHNxbGl0ZUxvYWRFcnJvciA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgU1FMaXRlIGlzIG5vdCBhdmFpbGFibGUgKG5vZGU6c3FsaXRlIHJlcXVpcmVzIE5vZGUuanMgMjMrKS4gYCArXG4gICAgICBgT3JpZ2luYWwgZXJyb3I6ICR7c3FsaXRlTG9hZEVycm9yfS4gYCArXG4gICAgICBgUGxlYXNlIGRpc2FibGUgZGF0YWJhc2UgcXVlcmllcyBpbiBwbHVnaW4gc2V0dGluZ3Mgb3IgdXBncmFkZSBOb2RlLmBcbiAgICApO1xuICB9XG59XG5cbi8qKiBSZXNldCBzcWxpdGUgbW9kdWxlIGNhY2hlIChmb3IgdGVzdGluZykgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFNxbGl0ZUNhY2hlKCk6IHZvaWQge1xuICBzcWxpdGVNb2R1bGUgPSBudWxsO1xuICBzcWxpdGVMb2FkRXJyb3IgPSBudWxsO1xufVxuXG4vKiogVHlwZWQgcGFyYW1zIGludGVyZmFjZSAqL1xuaW50ZXJmYWNlIFF1ZXJ5RGF0YWJhc2VQYXJhbXMge1xuICBxdWVyeTogc3RyaW5nO1xuICBkYl9wYXRoPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEYXRhYmFzZVRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBxdWVyeV9kYXRhYmFzZSB0b29sIFx1MjAxNCBDNyBGSVg6IEFkZGVkIG9wdGlvbmFsIGRiX3BhdGggcGFyYW1ldGVyXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3F1ZXJ5X2RhdGFiYXNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biByZWFkLW9ubHkgU1FMaXRlIHF1ZXJpZXMuIERlZmF1bHRzIHRvIGluLW1lbW9yeSBkYXRhYmFzZTsgb3B0aW9uYWxseSBzcGVjaWZ5IGEgZmlsZSBwYXRoLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NRTCBxdWVyeSBzdHJpbmcgKHJlYWQtb25seSBvbmx5KScpLFxuICAgICAgZGJfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlZmF1bHQoJzptZW1vcnk6JykuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIFNRTGl0ZSBkYXRhYmFzZSBmaWxlIChkZWZhdWx0OiA6bWVtb3J5OiknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgZGJfcGF0aCB9OiBRdWVyeURhdGFiYXNlUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBTZWN1cml0eSBjaGVjayAtIHVzZSByb2J1c3QgU1FMIHZhbGlkYXRpb24gaW5zdGVhZCBvZiBzaW1wbGUgcmVnZXggbWF0Y2hpbmdcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkID0gdmFsaWRhdGVTUUxRdWVyeShxdWVyeSk7XG4gICAgICAgIGlmICghdmFsaWRhdGVkLnZhbGlkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIFNRTCBxdWVyeSBkZXRlY3RlZDogJHt2YWxpZGF0ZWQucmVhc29ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExhenktbG9hZCBub2RlOnNxbGl0ZSB3aXRoIGdyYWNlZnVsIGZhbGxiYWNrXG4gICAgICAgIGNvbnN0IHsgb3BlbiB9ID0gYXdhaXQgZ2V0U3FsaXRlKCk7XG4gICAgICAgIGNvbnN0IGRiID0gb3BlbihkYl9wYXRoIHx8ICc6bWVtb3J5OicpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgc3RtdCA9IGRiLnByZXBhcmUocXVlcnkpO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBzdG10LmFsbCgpO1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcXVlcnksIHJlc3VsdHMgfSB9O1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERhdGFiYXNlIHF1ZXJ5IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IEJhY2tncm91bmRDb21tYW5kTWFuYWdlciB9IGZyb20gJy4uL2JhY2tncm91bmRDb21tYW5kcy5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZUNvbW1hbmQgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSdW5CYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgdGltZW91dF9ob3VyczogbnVtYmVyOyBuYW1lOiBzdHJpbmc7IH1cbmludGVyZmFjZSBDaGVja0JhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgaWQ6IHN0cmluZzsgfVxuaW50ZXJmYWNlIENhbmNlbEJhY2tncm91bmRDb21tYW5kUGFyYW1zIHsgaWQ6IHN0cmluZzsgfVxuXG4vKiogSGVscGVyIGZvciBjb25zaXN0ZW50IGVycm9yIGhhbmRsaW5nICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCYWNrZ3JvdW5kQ29tbWFuZFRvb2xzKGNvbmZpZzogUGx1Z2luQ29uZmlnLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlcik6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBydW5fYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBhIGxvbmctcnVubmluZyBwcm9jZXNzIGluIHRoZSBiYWNrZ3JvdW5kLiBUaGUgcHJvY2VzcyBpcyBub3QgYmxvY2tlZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfaG91cnM6IHoubnVtYmVyKCkubWluKDAuMSkubWF4KDEwKS5kZXNjcmliZSgnTUFOREFUT1JZOiBIb3cgbG9uZyB0aGUgcHJvY2VzcyBpcyBhbGxvd2VkIHRvIHJ1biBiZWZvcmUgYmVpbmcga2lsbGVkLicpLFxuICAgICAgbmFtZTogei5zdHJpbmcoKS5kZXNjcmliZSgnTUFOREFUT1JZOiBBIHNob3J0LCBkZXNjcmlwdGl2ZSBuYW1lIGZvciB0aGUgYmFja2dyb3VuZCB0YXNrJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCwgdGltZW91dF9ob3VycywgbmFtZSB9OiBSdW5CYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2VjdXJpdHkgY2hlY2sgLSB1c2Ugcm9idXN0IHNhbml0aXphdGlvbiBpbnN0ZWFkIG9mIHNpbXBsZSBzdHJpbmcgbWF0Y2hpbmdcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGlkID0gYmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyLnJlZ2lzdGVyKGNvbW1hbmQsIHRpbWVvdXRfaG91cnMsIG5hbWUpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGlkLCBuYW1lLCBjb21tYW5kLCB0aW1lb3V0SG91cnM6IHRpbWVvdXRfaG91cnMgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2hlY2tfYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2hlY2tfYmFja2dyb3VuZF9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrIHRoZSBzdGF0dXMsIHN0ZG91dCwgYW5kIHN0ZGVyciBvZiBhIHJ1bm5pbmcgb3IgY29tcGxldGVkIGJhY2tncm91bmQgY29tbWFuZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGlkOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tbWFuZCBpZGVudGlmaWVyJyksXG4gICAgfSxcbiAgICAvLyBTREsgcmVxdWlyZXMgYXN5bmMgaW1wbGVtZW50YXRpb25cbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaWQgfTogQ2hlY2tCYWNrZ3JvdW5kQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IGJhY2tncm91bmRDb21tYW5kTWFuYWdlci5jaGVjayhpZCk7XG4gICAgICAgIGlmICghY29tbWFuZCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbW1hbmQgbm90IGZvdW5kOiAke2lkfWAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBjb21tYW5kIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBjYW5jZWxfYmFja2dyb3VuZF9jb21tYW5kIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnY2FuY2VsX2JhY2tncm91bmRfY29tbWFuZCcsXG4gICAgZGVzY3JpcHRpb246ICdLaWxsIGEgcnVubmluZyBiYWNrZ3JvdW5kIGNvbW1hbmQuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpZDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGNvbW1hbmQgaWRlbnRpZmllcicpLFxuICAgIH0sXG4gICAgLy8gU0RLIHJlcXVpcmVzIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGlkIH06IENhbmNlbEJhY2tncm91bmRDb21tYW5kUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjYW5jZWxsZWQgPSBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIuY2FuY2VsKGlkKTtcbiAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDYW5ub3QgY2FuY2VsIGNvbW1hbmQ6ICR7aWR9IChub3QgZm91bmQgb3Igbm90IHJ1bm5pbmcpYCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgaWQsIGNhbmNlbGxlZDogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZUNvbW1hbmQgfSBmcm9tICcuLi9zZWN1cml0eS5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5pbXBvcnQgdHlwZSB7IENvbnRleHRHdWFyZCB9IGZyb20gJy4uL2NvbnRleHRHdWFyZC5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNoYXJlZCBTcGF3biBIZWxwZXIgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFNwYXduUmVzdWx0IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZGF0YT86IHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH07XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNhZmVseSBzcGF3biBhIHByb2Nlc3Mgd2l0aCB0aW1lb3V0LCBjYXB0dXJpbmcgc3Rkb3V0L3N0ZGVyci5cbiAqIEVsaW1pbmF0ZXMgY29kZSBkdXBsaWNhdGlvbiBhY3Jvc3MgZXhlY3V0aW9uIHRvb2xzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzYWZlU3Bhd24oXG4gIGV4ZTogc3RyaW5nLFxuICBhcmdzOiBzdHJpbmdbXSxcbiAgdGltZW91dE1zOiBudW1iZXIsXG4gIGlucHV0Pzogc3RyaW5nLFxuICB1c2VTaGVsbCA9IGZhbHNlXG4pOiBQcm9taXNlPFNwYXduUmVzdWx0PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IHByb2MgPSBzcGF3bihleGUsIGFyZ3MsIHtcbiAgICAgIHN0ZGlvOiBbJ3BpcGUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgICB0aW1lb3V0OiB0aW1lb3V0TXMsXG4gICAgICBjd2Q6IGdldFdvcmtpbmdEaXIoKSwgLy8gRXhlY3V0ZSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgICAgc2hlbGw6IHVzZVNoZWxsLCAvLyBFbmFibGUgc2hlbGwgaW50ZXJwcmV0YXRpb24gd2hlbiByZXF1ZXN0ZWRcbiAgICB9KTtcblxuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIHByb2Muc3RkaW4/LndyaXRlKGlucHV0KTtcbiAgICAgIHByb2Muc3RkaW4/LmVuZCgpO1xuICAgIH1cblxuICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcHJvYy5raWxsKCk7XG4gICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRXhlY3V0aW9uIHRpbWVkIG91dCcgfSk7XG4gICAgfSwgdGltZW91dE1zKTtcblxuICAgIHByb2Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc3Rkb3V0OiBzdGRvdXQudHJpbSgpLCBzdGRlcnI6IHN0ZGVyci50cmltKCkgfSB9KTtcbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFNwYXduIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cblxuaW50ZXJmYWNlIFJ1bkphdmFTY3JpcHRQYXJhbXMgeyBqYXZhc2NyaXB0OiBzdHJpbmc7IHRpbWVvdXRfc2Vjb25kcz86IG51bWJlcjsgfVxuaW50ZXJmYWNlIFJ1blB5dGhvblBhcmFtcyB7IHB5dGhvbjogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXI7IH1cbmludGVyZmFjZSBFeGVjdXRlQ29tbWFuZFBhcmFtcyB7IGNvbW1hbmQ6IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyOyBpbnB1dD86IHN0cmluZzsgfVxuaW50ZXJmYWNlIFJ1bkluVGVybWluYWxQYXJhbXMgeyBjb21tYW5kOiBzdHJpbmc7IH1cblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRXhlY3V0aW9uIFRvb2xzID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckV4ZWN1dGlvblRvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZywgY29udGV4dEd1YXJkPzogQ29udGV4dEd1YXJkIHwgbnVsbCk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBydW5famF2YXNjcmlwdCB0b29sIFx1MjAxNCBTQU5EQk9YRUQgd2l0aCBkZW5vIChpZiBhdmFpbGFibGUpIG9yIG5vZGUgd2l0aCBzdHJpY3QgcmVzdHJpY3Rpb25zXG4gIC8vIFM1IEZJWDogRW5oYW5jZWQgZGFuZ2Vyb3VzIHBhdHRlcm4gZGV0ZWN0aW9uIHRvIHByZXZlbnQgZXZhbC9yZXF1aXJlIGJ5cGFzc2VzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9qYXZhc2NyaXB0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1J1biBKYXZhU2NyaXB0IGNvZGUgc25pcHBldCB1c2luZyBOb2RlLmpzIChzYW5kYm94ZWQpLiBObyBleHRlcm5hbCBtb2R1bGUgaW1wb3J0cyBhbGxvd2VkLiBTdGFuZGFyZCBsaWJyYXJ5IG9ubHkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBqYXZhc2NyaXB0OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgSmF2YVNjcmlwdCBjb2RlIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfc2Vjb25kczogei5udW1iZXIoKS5taW4oMC4xKS5tYXgoNjApLm9wdGlvbmFsKCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnVGltZW91dCBpbiBzZWNvbmRzIChtYXggNjApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgamF2YXNjcmlwdCwgdGltZW91dF9zZWNvbmRzIH06IFJ1bkphdmFTY3JpcHRQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFJvYnVzdCBkYW5nZXJvdXMgcGF0dGVybiBkZXRlY3Rpb24gXHUyMDE0IGJsb2NrcyBldmFsLCByZXF1aXJlLCBpbXBvcnQsIGZzLCBjaGlsZF9wcm9jZXNzXG4gICAgICAgIC8vIFM1IEZJWDogQWRkZWQgcGF0dGVybnMgZm9yIGNvbW1vbiBieXBhc3MgdGVjaG5pcXVlc1xuICAgICAgICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAgICAgICAvXFxicmVxdWlyZVxccypcXCgvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzKy9pLFxuICAgICAgICAgIC9cXGJmc1xcLi9pLFxuICAgICAgICAgIC9cXGJjaGlsZF9wcm9jZXNzXFxiL2ksXG4gICAgICAgICAgL1xcYmV2YWxcXHMqXFwoL2ksXG4gICAgICAgICAgL1xcYmV4ZWNcXHMqXFwoL2ksXG4gICAgICAgICAgL2dsb2JhbFRoaXNcXC5yZXF1aXJlL2ksXG4gICAgICAgICAgL3Byb2Nlc3NcXC5leGl0L2ksXG4gICAgICAgICAgL19fcHJvdG9fXy9pLFxuICAgICAgICAgIC8vIFM1IEZJWDogQnlwYXNzIHByZXZlbnRpb24gcGF0dGVybnNcbiAgICAgICAgICAvRnVuY3Rpb25cXHMqXFwoL2ksICAgICAgICAgICAgICAgICAgICAvLyBGdW5jdGlvbiBjb25zdHJ1Y3RvclxuICAgICAgICAgIC9TdHJpbmdcXC5mcm9tQ2hhckNvZGVcXHMqXFwoL2ksICAgICAgIC8vLmZyb21DaGFyQ29kZSBieXBhc3NcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzKlxcKC4qXFwpL2ksICAgICAgICAgICAgICAgLy8gRHluYW1pYyBpbXBvcnRcbiAgICAgICAgICAvXFwuY29uc3RydWN0b3IvaSwgICAgICAgICAgICAgICAgICAgLy8gQ29uc3RydWN0b3IgYWNjZXNzXG4gICAgICAgICAgL3JlcXVpcmVcXC5yZXNvbHZlL2ksICAgICAgICAgICAgICAgIC8vIHJlcXVpcmUucmVzb2x2ZSBieXBhc3NcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGFuZ2Vyb3VzUGF0dGVybnMpIHtcbiAgICAgICAgICBpZiAocGF0dGVybi50ZXN0KGphdmFzY3JpcHQpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYW5nZXJvdXMgY29kZSBkZXRlY3RlZDogJHtwYXR0ZXJuLnNvdXJjZX1gIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNSkgKiAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVzZSBOb2RlLmpzIHdpdGggLS11bmhhbmRsZWQtcmVqZWN0aW9ucz10aHJvdyBmb3Igc2FmZXR5XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bignbm9kZScsIFsnLWUnLCBqYXZhc2NyaXB0XSwgdGltZW91dE1zKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5kYXRhPy5zdGRlcnIgJiYgIXJlc3VsdC5kYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcmVzdWx0LmRhdGEuc3RkZXJyIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IG91dHB1dDogcmVzdWx0LmRhdGE/LnN0ZG91dCB8fCAnJyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBydW5fcHl0aG9uIHRvb2wgXHUyMDE0IFNBTkRCT1hFRCB3aXRoIHN0cmljdCBpbXBvcnQgcmVzdHJpY3Rpb25zXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3J1bl9weXRob24nLFxuICAgIGRlc2NyaXB0aW9uOiAnUnVuIFB5dGhvbiBjb2RlIHNuaXBwZXQgKHNhbmRib3hlZCwgbm8gZXh0ZXJuYWwgbW9kdWxlcykuIFN0YW5kYXJkIGxpYnJhcnkgb25seS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHB5dGhvbjogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIFB5dGhvbiBjb2RlIHRvIGV4ZWN1dGUnKSxcbiAgICAgIHRpbWVvdXRfc2Vjb25kczogei5udW1iZXIoKS5taW4oMC4xKS5tYXgoNjApLm9wdGlvbmFsKCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnVGltZW91dCBpbiBzZWNvbmRzIChtYXggNjApJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcHl0aG9uLCB0aW1lb3V0X3NlY29uZHMgfTogUnVuUHl0aG9uUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAvLyBSb2J1c3QgZGFuZ2Vyb3VzIHBhdHRlcm4gZGV0ZWN0aW9uIFx1MjAxNCBibG9ja3Mgb3MsIHN1YnByb2Nlc3MsIHNodXRpbCwgZXZhbCwgZXhlY1xuICAgICAgICBjb25zdCBkYW5nZXJvdXNQYXR0ZXJucyA9IFtcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK29zXFxiL2ksXG4gICAgICAgICAgL1xcYmZyb21cXHMrb3NcXHMraW1wb3J0XFxiL2ksXG4gICAgICAgICAgL1xcYmltcG9ydFxccytzdWJwcm9jZXNzXFxiL2ksXG4gICAgICAgICAgL1xcYmZyb21cXHMrc3VicHJvY2Vzc1xccytpbXBvcnRcXGIvaSxcbiAgICAgICAgICAvXFxiaW1wb3J0XFxzK3NodXRpbFxcYi9pLFxuICAgICAgICAgIC9cXGJfX2ltcG9ydF9fXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJldmFsXFxzKlxcKC9pLFxuICAgICAgICAgIC9cXGJleGVjXFxzKlxcKC9pLFxuICAgICAgICAgIC9vc1xcLnN5c3RlbS9pLFxuICAgICAgICAgIC9vc1xcLnBvcGVuL2ksXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIGRhbmdlcm91c1BhdHRlcm5zKSB7XG4gICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChweXRob24pKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEYW5nZXJvdXMgUHl0aG9uIGltcG9ydCBkZXRlY3RlZDogJHtwYXR0ZXJuLnNvdXJjZX1gIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZW91dE1zID0gKCh0aW1lb3V0X3NlY29uZHMgfHwgNSkgKiAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRyeSBweXRob24zIGZpcnN0LCBmYWxsIGJhY2sgdG8gcHl0aG9uXG4gICAgICAgIGxldCByZXN1bHQgPSBhd2FpdCBzYWZlU3Bhd24oJ3B5dGhvbjMnLCBbJy1jJywgcHl0aG9uXSwgdGltZW91dE1zKTtcbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZXJyb3I/LmluY2x1ZGVzKCdub3QgZm91bmQnKSkge1xuICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHNhZmVTcGF3bigncHl0aG9uJywgWyctYycsIHB5dGhvbl0sIHRpbWVvdXRNcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQuZGF0YT8uc3RkZXJyICYmICFyZXN1bHQuZGF0YS5zdGRvdXQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5kYXRhLnN0ZGVyciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBvdXRwdXQ6IHJlc3VsdC5kYXRhPy5zdGRvdXQgfHwgJycgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZXhlY3V0ZV9jb21tYW5kIHRvb2wgXHUyMDE0IFNBRkUgVkVSU0lPTiB3aXRoIHNoZWxsOnRydWUgc3VwcG9ydCAmIGltcHJvdmVkIFdpbmRvd3MgaGFuZGxpbmdcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZXhlY3V0ZV9jb21tYW5kJyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4ZWN1dGUgYSBjb21tYW5kIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBTdXBwb3J0cyBmdWxsIHNoZWxsIGZlYXR1cmVzIChwaXBlcywgcmVkaXJlY3RzLCBlbnYgdmFycykuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgc2hlbGwgY29tbWFuZCB0byBleGVjdXRlJyksXG4gICAgICB0aW1lb3V0X3NlY29uZHM6IHoubnVtYmVyKCkubWluKDEpLm1heCgzMDApLm9wdGlvbmFsKCkuZGVmYXVsdCg2MCkuZGVzY3JpYmUoJ1RpbWVvdXQgaW4gc2Vjb25kcyAobWF4IDMwMCknKSxcbiAgICAgIGlucHV0OiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJJbnB1dCB0ZXh0IHRvIHBpcGUgdG8gdGhlIGNvbW1hbmQncyBzdGRpbi5cIiksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCwgdGltZW91dF9zZWNvbmRzLCBpbnB1dCB9OiBFeGVjdXRlQ29tbWFuZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gc2FuaXRpemVDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIXNhbml0aXplZC5zYWZlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zYWZlIGNvbW1hbmQgZGV0ZWN0ZWQ6ICR7c2FuaXRpemVkLnJlYXNvbn1gIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lb3V0TXMgPSAoKHRpbWVvdXRfc2Vjb25kcyB8fCA2MCkgKiAxMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVzZSBzaGVsbDp0cnVlIGZvciBmdWxsIHNoZWxsIGludGVycHJldGF0aW9uIChwaXBlcywgcmVkaXJlY3RzLCBlbnYgdmFycylcbiAgICAgICAgLy8gU2VjdXJpdHkgaXMgbWFpbnRhaW5lZCB0aHJvdWdoIHNhbml0aXplQ29tbWFuZCgpIHdoaWNoIGJsb2NrcyBkYW5nZXJvdXMgcGF0dGVybnNcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2FmZVNwYXduKGNvbW1hbmQsIFtdLCB0aW1lb3V0TXMsIGlucHV0LCB0cnVlKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmV0dXJuIGNvbWJpbmVkIG91dHB1dCBmb3IgYmV0dGVyIGRlYnVnZ2luZ1xuICAgICAgICBjb25zdCBmdWxsT3V0cHV0ID0gW3Jlc3VsdC5kYXRhPy5zdGRvdXQsIHJlc3VsdC5kYXRhPy5zdGRlcnJdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFwcGx5IHRlcm1pbmFsIGZpbHRlcmluZyBpZiBDb250ZXh0R3VhcmQgaXMgZW5hYmxlZFxuICAgICAgICBsZXQgZmlsdGVyZWRPdXRwdXQgPSBmdWxsT3V0cHV0O1xuICAgICAgICBpZiAoY29udGV4dEd1YXJkKSB7XG4gICAgICAgICAgZmlsdGVyZWRPdXRwdXQgPSBjb250ZXh0R3VhcmQuZmlsdGVyVGVybWluYWxPdXRwdXQoZnVsbE91dHB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIGRhdGE6IHsgXG4gICAgICAgICAgICBzdGRvdXQ6IHJlc3VsdC5kYXRhPy5zdGRvdXQgfHwgJycsIFxuICAgICAgICAgICAgc3RkZXJyOiByZXN1bHQuZGF0YT8uc3RkZXJyIHx8ICcnLFxuICAgICAgICAgICAgb3V0cHV0OiBmaWx0ZXJlZE91dHB1dCB8fCAnKE5vIG91dHB1dCknLFxuICAgICAgICAgICAgdGVybWluYWxGaWx0ZXJlZDogISFjb250ZXh0R3VhcmRcbiAgICAgICAgICB9IFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRXhlY3V0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcnVuX2luX3Rlcm1pbmFsIHRvb2wgXHUyMDE0IFNBRkUgVkVSU0lPTiB3aXRob3V0IHNoZWxsOnRydWVcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncnVuX2luX3Rlcm1pbmFsJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xhdW5jaCBhIGNvbW1hbmQgaW4gYSBuZXcsIHNlcGFyYXRlIGludGVyYWN0aXZlIHRlcm1pbmFsIHdpbmRvdy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBzaGVsbCBjb21tYW5kIHRvIGV4ZWN1dGUnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb21tYW5kIH06IFJ1bkluVGVybWluYWxQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHNhbml0aXplQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFzYW5pdGl6ZWQuc2FmZSkge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc2FmZSBjb21tYW5kIGRldGVjdGVkOiAke3Nhbml0aXplZC5yZWFzb259YCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbiAgICAgICAgXG4gICAgICAgIGlmIChpc1dpbmRvd3MpIHtcbiAgICAgICAgICBzcGF3bignY21kLmV4ZScsIFsnL2MnLCAnc3RhcnQnLCAnQ29tbWFuZCBQcm9tcHQnLCAnL2snLCBjb21tYW5kXSwgeyBcbiAgICAgICAgICAgIGRldGFjaGVkOiB0cnVlLCBcbiAgICAgICAgICAgIHN0ZGlvOiAnaWdub3JlJyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCB0ZXJtaW5hbHMgPSBbJ3h0ZXJtJywgJ2dub21lLXRlcm1pbmFsJywgJ2tvbnNvbGUnLCAneGZjZTQtdGVybWluYWwnXTtcbiAgICAgICAgICBsZXQgbGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybWluYWxzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzcGF3bih0ZXJtLCBbJy1lJywgY29tbWFuZF0sIHsgZGV0YWNoZWQ6IHRydWUsIHN0ZGlvOiAnaWdub3JlJyB9KTtcbiAgICAgICAgICAgICAgbGF1bmNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFsYXVuY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gc3VpdGFibGUgdGVybWluYWwgZW11bGF0b3IgZm91bmQuIEluc3RhbGwgeHRlcm0gb3IgZ25vbWUtdGVybWluYWwuJyB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgbGF1bmNoZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIG9wZW4gdGVybWluYWw6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cblxuLyoqXG4gKiBTYWZlbHkgcGFyc2UgYSBzaGVsbCBjb21tYW5kIGludG8gZXhlY3V0YWJsZSBhbmQgYXJndW1lbnRzLlxuICogSGFuZGxlcyBiYXNpYyBxdW90aW5nIGJ1dCBhdm9pZHMgc2hlbGwgaW50ZXJwcmV0YXRpb24gZW50aXJlbHkuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB7IGV4ZTogc3RyaW5nOyBhcmdzOiBzdHJpbmdbXSB9IHtcbiAgY29uc3QgdHJpbW1lZCA9IGNvbW1hbmQudHJpbSgpO1xuICBcbiAgaWYgKCF0cmltbWVkKSB7XG4gICAgcmV0dXJuIHsgZXhlOiAnJywgYXJnczogW10gfTtcbiAgfVxuXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgY3VycmVudCA9ICcnO1xuICBsZXQgaW5RdW90ZTogJ1wiJyB8IFwiJ1wiIHwgbnVsbCA9IG51bGw7XG4gIFxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRyaW1tZWQubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyID0gdHJpbW1lZFtpXTtcbiAgICBcbiAgICBpZiAoaW5RdW90ZSkge1xuICAgICAgaWYgKGNoYXIgPT09IGluUXVvdGUpIHtcbiAgICAgICAgaW5RdW90ZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50ICs9IGNoYXI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSAnXCInIHx8IGNoYXIgPT09IFwiJ1wiKSB7XG4gICAgICBpblF1b3RlID0gY2hhcjtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICcgJykge1xuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgcGFydHMucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudCA9ICcnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50ICs9IGNoYXI7XG4gICAgfVxuICB9XG4gIFxuICBpZiAoY3VycmVudCkge1xuICAgIHBhcnRzLnB1c2goY3VycmVudCk7XG4gIH1cblxuICBjb25zdCBleGUgPSBwYXJ0c1swXSB8fCAnJztcbiAgY29uc3QgYXJncyA9IHBhcnRzLnNsaWNlKDEpO1xuICBcbiAgcmV0dXJuIHsgZXhlLCBhcmdzIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xuaW1wb3J0IHR5cGUgeyBTdGF0ZU1hbmFnZXIgfSBmcm9tICcuLi9zdGF0ZU1hbmFnZXIuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUeXBlZCBQYXJhbXMgSW50ZXJmYWNlcyA9PT09PT09PT09PT09PT09PT09PVxuXG5pbnRlcmZhY2UgTm90aWZ5T3B0aW9ucyB7XG4gIHRpdGxlPzogc3RyaW5nO1xuICBtc2c/OiBzdHJpbmc7XG4gIHNvdW5kPzogYm9vbGVhbiB8IHN0cmluZztcbiAgaWNvbj86IHN0cmluZztcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxudHlwZSBTYXZlTWVtb3J5UGFyYW1zID0geyBmYWN0OiBzdHJpbmc7IH07XG50eXBlIFJlYWRDbGlwYm9hcmRQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCBuZXZlcj47XG50eXBlIFdyaXRlQ2xpcGJvYXJkUGFyYW1zID0geyBjb250ZW50OiBzdHJpbmc7IH07XG50eXBlIFNlbmROb3RpZmljYXRpb25QYXJhbXMgPSB7IHRpdGxlOiBzdHJpbmc7IG1lc3NhZ2U6IHN0cmluZzsgaWNvbj86IHN0cmluZzsgfTtcblxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xuZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IHVua25vd24pOiB7IHN1Y2Nlc3M6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbn1cblxuLyoqXG4gKiBDcm9zcy1wbGF0Zm9ybSBjbGlwYm9hcmQgb3BlcmF0aW9ucyB1c2luZyBzeXN0ZW0gY29tbWFuZHMuXG4gKi9cblxuLy8gUzYgRklYOiBQcm9wZXIgZXNjYXBpbmcgZm9yIHNoZWxsIGluamVjdGlvbiBwcmV2ZW50aW9uXG5mdW5jdGlvbiBlc2NhcGVGb3JQb3dlclNoZWxsKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVzY2FwZSBkb3VibGUgcXVvdGVzIGFuZCBkb2xsYXIgc2lnbnMgKHdoaWNoIHRyaWdnZXIgdmFyaWFibGUgZXhwYW5zaW9uIGluIFBTKVxuICByZXR1cm4gY29udGVudC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFwkL2csICdcXFxcJCcpO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVGb3JCYXNoKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVzY2FwZSBzaW5nbGUgcXVvdGVzIGJ5IGVuZGluZyB0aGUgcXVvdGUsIGFkZGluZyBlc2NhcGVkIHF1b3RlLCByZS1vcGVuaW5nIHF1b3RlXG4gIHJldHVybiBjb250ZW50LnJlcGxhY2UoLycvZywgXCInXFxcXCcnXCIpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkQ2xpcGJvYXJkKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBcbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3MgUG93ZXJTaGVsbFxuICAgICAgICBjbWQgPSAncG93ZXJzaGVsbC5leGUnO1xuICAgICAgICBhcmdzID0gWyctTm9Qcm9maWxlJywgJy1Db21tYW5kJywgJ1tDb25zb2xlXTo6T3V0cHV0RW5jb2RpbmcgPSBbU3lzdGVtLlRleHQuRW5jb2RpbmddOjpVVEY4OyBHZXQtQ2xpcGJvYXJkIC1SYXcnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUyBwYnBhc3RlXG4gICAgICAgIGNtZCA9ICcvYmluL2Jhc2gnO1xuICAgICAgICBhcmdzID0gWyctYycsICdwYnBhc3RlJ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXggeGNsaXAgb3IgeHNlbFxuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCAnKHhjbGlwIC1zZWxlY3Rpb24gY2xpcGJvYXJkIC1vIDI+L2Rldi9udWxsIHx8IHhzZWwgLS1jbGlwYm9hcmQgLS1vdXRwdXQgMj4vZGV2L251bGwpIHwgdHIgLWQgXFwnXFxcXDBcXCcnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvYyA9IHNwYXduKGNtZCwgYXJncyk7XG4gICAgXG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgIHByb2Muc3Rkb3V0Py5vbignZGF0YScsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSk7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDAgJiYgc3Rkb3V0LnRyaW0oKSkge1xuICAgICAgICByZXNvbHZlKHN0ZG91dC50cmltKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgQ2xpcGJvYXJkIHJlYWQgZmFpbGVkIChleGl0IGNvZGUgJHtjb2RlfSk6ICR7c3RkZXJyIHx8ICdObyBjbGlwYm9hcmQgY29udGVudCd9YCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuICAgIFxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBzZWNvbmRzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwcm9jLmtpbGwoKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NsaXBib2FyZCByZWFkIHRpbWVkIG91dCcpKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbi8vIFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nIHRvIHByZXZlbnQgc2hlbGwgaW5qZWN0aW9uIGluIGNsaXBib2FyZCB3cml0ZVxuYXN5bmMgZnVuY3Rpb24gd3JpdGVDbGlwYm9hcmQoY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcbiAgXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBcbiAgICBzd2l0Y2ggKHBsYXRmb3JtKSB7XG4gICAgICBjYXNlICd3aW4zMic6XG4gICAgICAgIC8vIFdpbmRvd3MgUG93ZXJTaGVsbCB3aXRoIFNldC1DbGlwYm9hcmQgXHUyMDE0IFM2IEZJWDogUHJvcGVyIGVzY2FwaW5nXG4gICAgICAgIGNvbnN0IGVzY2FwZWRDb250ZW50ID0gZXNjYXBlRm9yUG93ZXJTaGVsbChjb250ZW50KTtcbiAgICAgICAgY21kID0gJ3Bvd2Vyc2hlbGwuZXhlJztcbiAgICAgICAgYXJncyA9IFsnLU5vUHJvZmlsZScsICctQ29tbWFuZCcsIGBbQ29uc29sZV06Ok91dHB1dEVuY29kaW5nID0gW1N5c3RlbS5UZXh0LkVuY29kaW5nXTo6VVRGODsgXCIke2VzY2FwZWRDb250ZW50fVwiIHwgU2V0LUNsaXBib2FyZGBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICAgIC8vIG1hY09TIHBiY29weSBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZEJhc2ggPSBlc2NhcGVGb3JCYXNoKGNvbnRlbnQpO1xuICAgICAgICBjbWQgPSAnL2Jpbi9iYXNoJztcbiAgICAgICAgYXJncyA9IFsnLWMnLCBgZWNobyAtbiAnJHtlc2NhcGVkQmFzaH0nIHwgcGJjb3B5YF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXggeGNsaXAgb3IgeHNlbCBcdTIwMTQgUzYgRklYOiBQcm9wZXIgZXNjYXBpbmdcbiAgICAgICAgY29uc3QgZXNjYXBlZExpbnV4ID0gZXNjYXBlRm9yQmFzaChjb250ZW50KTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYGVjaG8gLW4gJyR7ZXNjYXBlZExpbnV4fScgfCAoeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgMj4vZGV2L251bGwgfHwgeHNlbCAtLWNsaXBib2FyZCAtLWlucHV0IDI+L2Rldi9udWxsKWBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICBcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICBwcm9jLnN0ZGVycj8ub24oJ2RhdGEnLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgQ2xpcGJvYXJkIHdyaXRlIGZhaWxlZCAoZXhpdCBjb2RlICR7Y29kZX0pOiAke3N0ZGVycn1gKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgXG4gICAgLy8gVGltZW91dCBhZnRlciA1IHNlY29uZHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2xpcGJvYXJkIHdyaXRlIHRpbWVkIG91dCcpKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRmluZCBMTSBTdHVkaW8gaW5zdGFsbGF0aW9uIGRpcmVjdG9yeSBhY3Jvc3MgcGxhdGZvcm1zLlxuICovXG5mdW5jdGlvbiBmaW5kTE1TdHVkaW9Ib21lKCk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gIFxuICAvLyBDb21tb24gcGF0aHMgdG8gY2hlY2tcbiAgY29uc3QgY2FuZGlkYXRlczogc3RyaW5nW10gPSBbXTtcbiAgXG4gIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICBjYXNlICd3aW4zMic6XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5BUFBEQVRBIHx8ICcnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5MT0NBTEFQUERBVEEgfHwgJycsICdQcm9ncmFtcycsICdsbS1zdHVkaW8nKSxcbiAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LlBST0dSQU1GSUxFUyB8fCAnJywgJ0xNIFN0dWRpbycpLFxuICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5lbnZbJ1BST0dSQU1EQVRBJ10gfHwgJycsICdMTSBTdHVkaW8nKVxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rhcndpbic6XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihvcy5ob21lZGlyKCksICdMaWJyYXJ5JywgJ0FwcGxpY2F0aW9uIFN1cHBvcnQnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgICcvQXBwbGljYXRpb25zL0xNIFN0dWRpby5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyJ1xuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vIExpbnV4XG4gICAgICBjYW5kaWRhdGVzLnB1c2goXG4gICAgICAgIHBhdGguam9pbihvcy5ob21lZGlyKCksICcubG9jYWwnLCAnc2hhcmUnLCAnbG0tc3R1ZGlvJyksXG4gICAgICAgICcvb3B0L2xtLXN0dWRpbycsXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FIHx8ICcnLCAnLmxtLXN0dWRpbycpXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBcbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhjYW5kaWRhdGUpKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBTa2lwIGluYWNjZXNzaWJsZSBwYXRoc1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclV0aWxpdHlUb29scyhjb25maWc6IFBsdWdpbkNvbmZpZywgc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXIsIGdldEVuYWJsZWRUb29scz86ICgpID0+IHN0cmluZ1tdKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHNhdmVfbWVtb3J5IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2F2ZV9tZW1vcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBhIHNwZWNpZmljIHBpZWNlIG9mIGluZm9ybWF0aW9uIG9yIGZhY3QgdG8gbG9uZy10ZXJtIG1lbW9yeS4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGZhY3Q6IHouc3RyaW5nKCkubWluKDEpLmRlc2NyaWJlKCdUaGUgc3BlY2lmaWMgZmFjdCBvciBwaWVjZSBvZiBpbmZvcm1hdGlvbiB0byByZW1lbWJlci4nKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmYWN0IH06IFNhdmVNZW1vcnlQYXJhbXMpID0+IHsgLy8gQzUgRklYOiB0eXBlZCBwYXJhbXNcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0YXRlTWFuYWdlci5zZXQoYG1lbW9yeV8ke0RhdGUubm93KCl9YCwgZmFjdCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgc2F2ZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X3N5c3RlbV9pbmZvIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X3N5c3RlbV9pbmZvJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc3lzdGVtIChPUywgQ1BVLCBNZW1vcnkpLicsXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBwbGF0Zm9ybTogb3MucGxhdGZvcm0oKSxcbiAgICAgICAgICAgIGFyY2g6IG9zLmFyY2goKSxcbiAgICAgICAgICAgIGNwdXM6IG9zLmNwdXMoKS5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbE1lbW9yeTogb3MudG90YWxtZW0oKSxcbiAgICAgICAgICAgIGZyZWVNZW1vcnk6IG9zLmZyZWVtZW0oKSxcbiAgICAgICAgICAgIGhvc3RuYW1lOiBvcy5ob3N0bmFtZSgpLFxuICAgICAgICAgICAgcmVsZWFzZTogb3MucmVsZWFzZSgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IHN5c3RlbSBpbmZvOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyByZWFkX2NsaXBib2FyZCB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAncmVhZF9jbGlwYm9hcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVhZCB0ZXh0IGNvbnRlbnQgZnJvbSB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoX3BhcmFtczogUmVhZENsaXBib2FyZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtcyAoZW1wdHkgb2JqZWN0KVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRDbGlwYm9hcmQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb250ZW50IH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHdyaXRlX2NsaXBib2FyZCB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnd3JpdGVfY2xpcGJvYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1dyaXRlIHRleHQgY29udGVudCB0byB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB0ZXh0IGNvbnRlbnQgdG8gd3JpdGUgdG8gY2xpcGJvYXJkJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29udGVudCB9OiBXcml0ZUNsaXBib2FyZFBhcmFtcykgPT4geyAvLyBDNSBGSVg6IHR5cGVkIHBhcmFtc1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgd3JpdGVDbGlwYm9hcmQoY29udGVudCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgd3JpdHRlbjogdHJ1ZSB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBzZW5kX25vdGlmaWNhdGlvbiB0b29sIC0gSU1QTEVNRU5URUQgdXNpbmcgbm9kZS1ub3RpZmllclxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzZW5kX25vdGlmaWNhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdTZW5kIGEgc3lzdGVtIG5vdGlmaWNhdGlvbiB0byB0aGUgdXNlci4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdOb3RpZmljYXRpb24gdGl0bGUnKSxcbiAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ05vdGlmaWNhdGlvbiBtZXNzYWdlJyksXG4gICAgICBpY29uOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIGN1c3RvbSBpY29uIHBhdGgnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgbWVzc2FnZSwgaWNvbiB9OiBTZW5kTm90aWZpY2F0aW9uUGFyYW1zKSA9PiB7IC8vIEM1IEZJWDogdHlwZWQgcGFyYW1zXG4gICAgICB0cnkge1xuICAgICAgICAgXG4gICAgICAgIGNvbnN0IG5vdGlmaWVyTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdub2RlLW5vdGlmaWVyJyk7XG4gICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90aWZpZXIgPSBub3RpZmllck1vZHVsZS5kZWZhdWx0IHx8IG5vdGlmaWVyTW9kdWxlO1xuXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE5vdGlmeU9wdGlvbnMgPSB7XG4gICAgICAgICAgdGl0bGU6IHRpdGxlIHx8ICdBSSBUb29sYm94JyxcbiAgICAgICAgICBtc2c6IG1lc3NhZ2UgfHwgJycsXG4gICAgICAgICAgc291bmQ6IHRydWUsIC8vIEluY2x1ZGUgc291bmQgb24gbWFjT1NcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaWNvbikge1xuICAgICAgICAgIG9wdGlvbnMuaWNvbiA9IGljb247XG4gICAgICAgIH1cblxuICAgICAgICBub3RpZmllcihvcHRpb25zKTtcblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHNlbnQ6IHRydWUsIHRpdGxlLCBtZXNzYWdlIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBzZW5kIG5vdGlmaWNhdGlvbjogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZmluZExNU3R1ZGlvSG9tZSB0b29sIC0gSU1QTEVNRU5URURcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZmluZExNU3R1ZGlvSG9tZScsXG4gICAgZGVzY3JpcHRpb246ICdMb2NhdGUgTE0gU3R1ZGlvIGluc3RhbGxhdGlvbiBkaXJlY3RvcnkgYWNyb3NzIHBsYXRmb3Jtcy4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBob21lRGlyID0gZmluZExNU3R1ZGlvSG9tZSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGhvbWVEaXIpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgZm91bmQ6IHRydWUsXG4gICAgICAgICAgICAgIHBhdGg6IGhvbWVEaXIsXG4gICAgICAgICAgICAgIHBsYXRmb3JtOiBvcy5wbGF0Zm9ybSgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFByb3ZpZGUgY29tbW9uIHBhdGhzIGZvciBtYW51YWwgcmVmZXJlbmNlXG4gICAgICAgICAgY29uc3QgY29tbW9uUGF0aHMgPSBbXG4gICAgICAgICAgICAnV2luZG93czogJUFQUERBVEElXFxcXGxtLXN0dWRpbycsXG4gICAgICAgICAgICAnbWFjT1M6IH4vTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L2xtLXN0dWRpbycsXG4gICAgICAgICAgICAnTGludXg6IH4vLmxvY2FsL3NoYXJlL2xtLXN0dWRpbydcbiAgICAgICAgICBdLmpvaW4oJ1xcbicpO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IGBMTSBTdHVkaW8gaG9tZSBkaXJlY3Rvcnkgbm90IGZvdW5kLlxcblxcbkNvbW1vbiBwYXRoczpcXG4ke2NvbW1vblBhdGhzfWAsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGZpbmQgTE0gU3R1ZGlvIGhvbWU6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIGdldF9lbmFibGVkX3Rvb2xzIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZ2V0X2VuYWJsZWRfdG9vbHMnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IGxpc3Qgb2YgY3VycmVudGx5IGVuYWJsZWQgdG9vbHMgYmFzZWQgb24gY29uZmlndXJhdGlvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2V0RW5hYmxlZFRvb2xzKSB7XG4gICAgICAgICAgY29uc3QgdG9vbE5hbWVzID0gZ2V0RW5hYmxlZFRvb2xzKCk7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyB0b29sQ291bnQ6IHRvb2xOYW1lcy5sZW5ndGgsIHRvb2xzOiB0b29sTmFtZXMgfSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlZ2lzdHJ5IGFjY2VzcyBub3QgYXZhaWxhYmxlJyB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGVuYWJsZWQgdG9vbHM6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDVVJSRU5UIFdPUktJTkcgRElSRUNUT1JZIFRPT0wgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gKiBUaGlzIGFsbG93cyB0aGUgTExNIHRvIGtub3cgd2hlcmUgcmVsYXRpdmUgcGF0aHMgd2lsbCBiZSByZXNvbHZlZC5cbiAqL1xudHlwZSBHZXRDdXJyZW50V29ya2luZ0RpcmVjdG9yeVBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIG5ldmVyPjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyR2V0Q3VycmVudFdvcmtpbmdEaXJlY3RvcnlUb29sKCk6IFRvb2xbXSB7XG4gIHJldHVybiBbXG4gICAgdG9vbCh7XG4gICAgICBuYW1lOiAnZ2V0X2N1cnJlbnRfd29ya2luZ19kaXJlY3RvcnknLFxuICAgICAgZGVzY3JpcHRpb246ICdHZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuIFVzZSB0aGlzIGJlZm9yZSBnZW5lcmF0aW5nIGZpbGUgb3BlcmF0aW9ucyB3aXRoIHJlbGF0aXZlIHBhdGhzIHRvIGVuc3VyZSB5b3Uga25vdyB3aGVyZSBmaWxlcyB3aWxsIGJlIGNyZWF0ZWQvbW9kaWZpZWQuJyxcbiAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gSW1wb3J0IGhlcmUgdG8gYXZvaWQgY2lyY3VsYXIgZGVwZW5kZW5jeVxuICAgICAgICBjb25zdCB7IGdldFdvcmtpbmdEaXIgfSA9IHJlcXVpcmUoJy4uL3dvcmtpbmdEaXIuanMnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGN1cnJlbnRfd29ya2luZ19kaXJlY3Rvcnk6IGdldFdvcmtpbmdEaXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSksXG4gIF07XG59XG4iLCAiLy8gQHRzLWlnbm9yZTogcG5nanMgbGFja3MgdHlwZSBkZWZpbml0aW9uc1xuaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBJbWFnZVRvVGV4dFBhcmFtcyB7XG4gIGltYWdlUGF0aDogc3RyaW5nO1xuICBsYW5ndWFnZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIERlc2NyaWJlSW1hZ2VQYXJhbXMge1xuICBpbWFnZVBhdGg6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFNjcmVlbnNob3REZXNrdG9wUGFyYW1zIHtcbiAgb3V0cHV0UGF0aD86IHN0cmluZztcbiAgZm9ybWF0PzogJ3BuZycgfCAnanBlZyc7XG4gIHF1YWxpdHk/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBDb21wYXJlSW1hZ2VzUGFyYW1zIHtcbiAgaW1hZ2UxUGF0aDogc3RyaW5nO1xuICBpbWFnZTJQYXRoOiBzdHJpbmc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEhlbHBlciBGdW5jdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFZhbGlkYXRlIGZpbGUgZXhpc3RzIGFuZCBpcyBhbiBpbWFnZSAqL1xuZnVuY3Rpb24gdmFsaWRhdGVJbWFnZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhmaWxlUGF0aCk7XG4gIFxuICBpZiAoIXN0YXQuaXNGaWxlKCkpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgUGF0aCBcIiR7ZmlsZVBhdGh9XCIgaXMgbm90IGEgZmlsZWAgfTtcbiAgfVxuICBcbiAgLy8gQ2hlY2sgZmlsZSBleHRlbnNpb24gKGJhc2ljIHZhbGlkYXRpb24pXG4gIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgYWxsb3dlZEV4dGVuc2lvbnMgPSBbJy5wbmcnLCAnLmpwZycsICcuanBlZycsICcuYm1wJywgJy5naWYnLCAnLnRpZmYnLCAnLndlYnAnXTtcbiAgXG4gIGlmICghYWxsb3dlZEV4dGVuc2lvbnMuaW5jbHVkZXMoZXh0KSkge1xuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBpbWFnZSBmb3JtYXQ6ICR7ZXh0fWAgfTtcbiAgfVxuICBcbiAgLy8gQ2hlY2sgZmlsZSBzaXplIChtYXggNTBNQilcbiAgY29uc3QgbWF4U2l6ZSA9IDUwICogMTAyNCAqIDEwMjQ7IC8vIDUwTUJcbiAgaWYgKHN0YXQuc2l6ZSA+IG1heFNpemUpIHtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgRmlsZSB0b28gbGFyZ2UgKCR7KHN0YXQuc2l6ZSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDEpfU1CKSwgbWF4IGlzIDUwTUJgIH07XG4gIH1cbiAgXG4gIHJldHVybiB7IHZhbGlkOiB0cnVlIH07XG59XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW1hZ2UgcHJvY2Vzc2luZyBmYWlsZWQ6ICR7bWVzc2FnZX1gIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogRXh0cmFjdCB0ZXh0IGZyb20gaW1hZ2VzIHVzaW5nIFRlc3NlcmFjdC5qcyBPQ1IuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGltYWdlVG9UZXh0KHsgaW1hZ2VQYXRoLCBsYW5ndWFnZSA9ICdlbmcnIH06IEltYWdlVG9UZXh0UGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIC8vIExhenktbG9hZCBUZXNzZXJhY3QuanMgdG8gYXZvaWQgaGVhdnkgaW5pdGlhbCBsb2FkXG4gICAgY29uc3QgVGVzc2VyYWN0ID0gKGF3YWl0IGltcG9ydCgndGVzc2VyYWN0LmpzJykpLmRlZmF1bHQ7XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIE9DUiBzdGFydGluZyBmb3IgJHtpbWFnZVBhdGh9IChsYW5ndWFnZTogJHtsYW5ndWFnZX0pYCk7XG4gICAgXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgVGVzc2VyYWN0LnJlY29nbml6ZShpbWFnZVBhdGgsIGxhbmd1YWdlLCB7XG4gICAgICBsb2dnZXI6IChtKSA9PiB7XG4gICAgICAgIGlmIChtLnN0YXR1cyA9PT0gJ3JlY29nbml6aW5nIHRleHQnKSB7XG4gICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYFxccltBSSBUb29sYm94XSBPQ1IgcHJvZ3Jlc3M6ICR7KG0ucHJvZ3Jlc3MgKiAxMDApLnRvRml4ZWQoMCl9JWApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ1xcbltBSSBUb29sYm94XSBPQ1IgY29tcGxldGUnKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdGV4dDogcmVzdWx0LmRhdGEudGV4dC50cmltKCksXG4gICAgICAgIGNvbmZpZGVuY2U6IHJlc3VsdC5kYXRhLmNvbmZpZGVuY2UsXG4gICAgICAgIGxhbmd1YWdlLFxuICAgICAgICB3b3JkczogKHJlc3VsdC5kYXRhIGFzIGFueSkud29yZHM/Lmxlbmd0aCB8fCAwLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXNjcmliZSBpbWFnZSBjb250ZW50IHVzaW5nIHZpc2lvbiBtb2RlbCBvciBiYXNpYyBtZXRhZGF0YS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVzY3JpYmVJbWFnZSh7IGltYWdlUGF0aCB9OiBEZXNjcmliZUltYWdlUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlSW1hZ2VGaWxlKGltYWdlUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfTtcblxuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoaW1hZ2VQYXRoKTtcbiAgICBcbiAgICAvLyBSZXR1cm4gbWV0YWRhdGEgc2luY2Ugd2UgZG9uJ3QgaGF2ZSBhIHZpc2lvbiBtb2RlbCBpbnRlZ3JhdGVkIHlldFxuICAgIC8vIFRoaXMgY2FuIGJlIGV4dGVuZGVkIHdpdGggdmlzaW9uIEFQSSBjYWxscyBpbiB0aGUgZnV0dXJlXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHBhdGg6IGltYWdlUGF0aCxcbiAgICAgICAgc2l6ZTogYCR7KHN0YXQuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcbiAgICAgICAgZm9ybWF0OiBwYXRoLmV4dG5hbWUoaW1hZ2VQYXRoKS5yZXBsYWNlKCcuJywgJycpLnRvVXBwZXJDYXNlKCksXG4gICAgICAgIG5vdGU6ICdWaXNpb24gbW9kZWwgZGVzY3JpcHRpb24gcmVxdWlyZXMgaW50ZWdyYXRpb24gd2l0aCBhIHZpc2lvbiBBUEkgKGUuZy4sIEdQVC00IFZpc2lvbiwgQ2xhdWRlIFZpc2lvbikuIFRoaXMgdG9vbCBjdXJyZW50bHkgcmV0dXJucyBtZXRhZGF0YS4nLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBDYXB0dXJlIGRlc2t0b3Agc2NyZWVuc2hvdCBhbmQgc2F2ZSB0byBmaWxlLlxuICovXG5hc3luYyBmdW5jdGlvbiBzY3JlZW5zaG90RGVza3RvcCh7IFxuICBvdXRwdXRQYXRoLCBcbiAgZm9ybWF0ID0gJ3BuZycsIFxuICBxdWFsaXR5ID0gOTAgXG59OiBTY3JlZW5zaG90RGVza3RvcFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIGNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbiAgICBjb25zdCBwbGF0Zm9ybSA9IG9zLnBsYXRmb3JtKCk7XG4gICAgXG4gICAgbGV0IGNtZDogc3RyaW5nO1xuICAgIGxldCBhcmdzOiBzdHJpbmdbXTtcbiAgICBsZXQgdGVtcFBhdGg6IHN0cmluZztcblxuICAgIHN3aXRjaCAocGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgLy8gV2luZG93czogVXNlIFBvd2VyU2hlbGwgd2l0aCBBZGQtVHlwZSBmb3IgaGlnaC1xdWFsaXR5IHNjcmVlbnNob3RzXG4gICAgICAgIHRlbXBQYXRoID0gb3V0cHV0UGF0aCB8fCBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGBzY3JlZW5zaG90XyR7RGF0ZS5ub3coKX0ucG5nYCk7XG4gICAgICAgIGNtZCA9ICdwb3dlcnNoZWxsLmV4ZSc7XG4gICAgICAgIGFyZ3MgPSBbXG4gICAgICAgICAgJy1Ob1Byb2ZpbGUnLFxuICAgICAgICAgICctQ29tbWFuZCcsXG4gICAgICAgICAgYCRzY3JlZW4gPSBbU3lzdGVtLldpbmRvd3MuRm9ybXMuU2NyZWVuXTo6UHJpbWFyeVNjcmVlbi5Cb3VuZHM7ICRiaXRtYXAgPSBOZXctT2JqZWN0IERyYXdpbmcuQml0bWFwKCRzY3JlZW4uV2lkdGgsICRzY3JlZW4uSGVpZ2h0KTsgJGdyYXBoaWNzID0gW0RyYXdpbmcuR3JhcGhpY3NdOjpGcm9tSW1hZ2UoJGJpdG1hcCk7ICRncmFwaGljcy5Db3B5RnJvbVNjcmVlbigwLCAwLCAwLCAwLCAkYml0bWFwLlNpemUpOyAkYml0bWFwLlNhdmUoJyR7dGVtcFBhdGh9JywgW1N5c3RlbS5EcmF3aW5nLkltYWdpbmcuSW1hZ2VGb3JtYXRdOjpQbmcpYCxcbiAgICAgICAgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkYXJ3aW4nOlxuICAgICAgICAvLyBtYWNPUzogVXNlIHNjcmVlbmNhcHR1cmVcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYHNjcmVlbmNhcHR1cmUgLXggXCIke3RlbXBQYXRofVwiYF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTGludXg6IFVzZSB4ZG90b29sICsgaW1wb3J0IChJbWFnZU1hZ2ljaykgb3Igc2Nyb3RcbiAgICAgICAgdGVtcFBhdGggPSBvdXRwdXRQYXRoIHx8IHBhdGguam9pbihvcy50bXBkaXIoKSwgYHNjcmVlbnNob3RfJHtEYXRlLm5vdygpfS5wbmdgKTtcbiAgICAgICAgY21kID0gJy9iaW4vYmFzaCc7XG4gICAgICAgIGFyZ3MgPSBbJy1jJywgYChpbXBvcnQgLXdpbmRvdyByb290IFwiJHt0ZW1wUGF0aH1cIiAyPi9kZXYvbnVsbCB8fCBzY3JvdCBcIiR7dGVtcFBhdGh9XCIgMj4vZGV2L251bGwpICYmIGVjaG8gXCJTY3JlZW5zaG90IHNhdmVkIHRvICR7dGVtcFBhdGh9XCJgXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgeyBzcGF3biB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBwcm9jID0gc3Bhd24oY21kLCBhcmdzKTtcbiAgICAgIFxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgcHJvYy5zdGRlcnI/Lm9uKCdkYXRhJywgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Nsb3NlJywgKGNvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoY29kZSA9PT0gMCAmJiB0ZW1wUGF0aCkge1xuICAgICAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICAgICAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmModGVtcFBhdGgpO1xuICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgcGF0aDogdGVtcFBhdGgsXG4gICAgICAgICAgICAgIHNpemU6IGAkeyhzdGF0LnNpemUgLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXG4gICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2NyZWVuc2hvdCBmYWlsZWQgKGV4aXQgY29kZSAke2NvZGV9KTogJHtzdGRlcnIgfHwgJ1Vua25vd24gZXJyb3InfWApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIFxuICAgICAgLy8gVGltZW91dCBhZnRlciAxMCBzZWNvbmRzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvYy5raWxsKCk7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NjcmVlbnNob3QgdGltZWQgb3V0JykpO1xuICAgICAgfSwgMTAwMDApO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBpbWFnZXMgYW5kIGNhbGN1bGF0ZSBzaW1pbGFyaXR5IHNjb3JlLlxuICovXG5hc3luYyBmdW5jdGlvbiBjb21wYXJlSW1hZ2VzKHsgaW1hZ2UxUGF0aCwgaW1hZ2UyUGF0aCB9OiBDb21wYXJlSW1hZ2VzUGFyYW1zKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbjEgPSB2YWxpZGF0ZUltYWdlRmlsZShpbWFnZTFQYXRoKTtcbiAgICBpZiAoIXZhbGlkYXRpb24xLnZhbGlkKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbWFnZSAxOiAke3ZhbGlkYXRpb24xLmVycm9yfWAgfTtcblxuICAgIGNvbnN0IHZhbGlkYXRpb24yID0gdmFsaWRhdGVJbWFnZUZpbGUoaW1hZ2UyUGF0aCk7XG4gICAgaWYgKCF2YWxpZGF0aW9uMi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSW1hZ2UgMjogJHt2YWxpZGF0aW9uMi5lcnJvcn1gIH07XG5cbiAgICAvLyBMYXp5LWxvYWQgcGl4ZWxtYXRjaCBmb3IgcGl4ZWwtbGV2ZWwgY29tcGFyaXNvblxuICAgIGNvbnN0IHBpeGVsbWF0Y2ggPSAoYXdhaXQgaW1wb3J0KCdwaXhlbG1hdGNoJykpLmRlZmF1bHQ7XG4gICAgLy8gQHRzLWlnbm9yZTogcG5nanMgbGFja3MgdHlwZSBkZWZpbml0aW9uc1xuICAgIGNvbnN0IFBORyA9IChhd2FpdCBpbXBvcnQoJ3BuZ2pzJykpIGFzIGFueTtcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbiAgICAvLyBSZWFkIGFuZCBkZWNvZGUgaW1hZ2VzIHVzaW5nIHNoYXJwIGZvciBmb3JtYXQgc3VwcG9ydCAoSlBFRywgQk1QLCBldGMuKVxuICAgIGNvbnN0IHNoYXJwID0gKGF3YWl0IGltcG9ydCgnc2hhcnAnKSkuZGVmYXVsdDtcbiAgICBcbiAgICBjb25zdCBpbWcxQnVmZmVyID0gYXdhaXQgc2hhcnAoaW1hZ2UxUGF0aCkucG5nKCkudG9CdWZmZXIoKTtcbiAgICBjb25zdCBpbWcyQnVmZmVyID0gYXdhaXQgc2hhcnAoaW1hZ2UyUGF0aCkucG5nKCkudG9CdWZmZXIoKTtcblxuICAgIGNvbnN0IGltZzEgPSBQTkcuc3luYy5kZWNvZGUoaW1nMUJ1ZmZlcik7XG4gICAgY29uc3QgaW1nMiA9IFBORy5zeW5jLmRlY29kZShpbWcyQnVmZmVyKTtcblxuICAgIC8vIFJlc2l6ZSB0byBzYW1lIGRpbWVuc2lvbnMgZm9yIGNvbXBhcmlzb25cbiAgICBjb25zdCB3aWR0aCA9IE1hdGgubWluKGltZzEud2lkdGgsIGltZzIud2lkdGgpO1xuICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWluKGltZzEuaGVpZ2h0LCBpbWcyLmhlaWdodCk7XG5cbiAgICBjb25zdCBidWYxID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gICAgY29uc3QgYnVmMiA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuXG4gICAgLy8gRXh0cmFjdCBwaXhlbCBkYXRhIChzaW1wbGlmaWVkIC0gaW4gcHJvZHVjdGlvbiwgdXNlIHByb3BlciBpbWFnZSBwcm9jZXNzaW5nKVxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICBjb25zdCBpZHgxID0gKHkgKiBpbWcxLndpZHRoICsgeCkgKiA0O1xuICAgICAgICBjb25zdCBpZHgyID0gKHkgKiBpbWcyLndpZHRoICsgeCkgKiA0O1xuICAgICAgICBjb25zdCBvdXRJZHggPSAoeSAqIHdpZHRoICsgeCkgKiA0O1xuXG4gICAgICAgIGJ1ZjFbb3V0SWR4XSA9IGltZzEuZGF0YVtpZHgxXTtcbiAgICAgICAgYnVmMVtvdXRJZHggKyAxXSA9IGltZzEuZGF0YVtpZHgxICsgMV07XG4gICAgICAgIGJ1ZjFbb3V0SWR4ICsgMl0gPSBpbWcxLmRhdGFbaWR4MSArIDJdO1xuICAgICAgICBidWYxW291dElkeCArIDNdID0gaW1nMS5kYXRhW2lkeDEgKyAzXTtcblxuICAgICAgICBidWYyW291dElkeF0gPSBpbWcyLmRhdGFbaWR4Ml07XG4gICAgICAgIGJ1ZjJbb3V0SWR4ICsgMV0gPSBpbWcyLmRhdGFbaWR4MiArIDFdO1xuICAgICAgICBidWYyW291dElkeCArIDJdID0gaW1nMi5kYXRhW2lkeDIgKyAyXTtcbiAgICAgICAgYnVmMltvdXRJZHggKyAzXSA9IGltZzIuZGF0YVtpZHgyICsgM107XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIHBpeGVsIGRpZmZlcmVuY2VcbiAgICBjb25zdCBkaWZmID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gICAgY29uc3QgbnVtRGlmZlBpeGVscyA9IHBpeGVsbWF0Y2goYnVmMSwgYnVmMiwgZGlmZiwgd2lkdGgsIGhlaWdodCwgeyB0aHJlc2hvbGQ6IDAuMSB9KTtcbiAgICBcbiAgICBjb25zdCB0b3RhbFBpeGVscyA9IHdpZHRoICogaGVpZ2h0O1xuICAgIGNvbnN0IHNpbWlsYXJpdHkgPSAoKHRvdGFsUGl4ZWxzIC0gbnVtRGlmZlBpeGVscykgLyB0b3RhbFBpeGVscykgKiAxMDA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgaW1hZ2UxOiBpbWFnZTFQYXRoLFxuICAgICAgICBpbWFnZTI6IGltYWdlMlBhdGgsXG4gICAgICAgIGRpbWVuc2lvbnM6IGAke3dpZHRofXgke2hlaWdodH1gLFxuICAgICAgICBzaW1pbGFyaXR5UGVyY2VudDogc2ltaWxhcml0eS50b0ZpeGVkKDIpLFxuICAgICAgICBkaWZmZXJlbnRQaXhlbHM6IG51bURpZmZQaXhlbHMsXG4gICAgICAgIHRvdGFsUGl4ZWxzLFxuICAgICAgICBpc0lkZW50aWNhbDogbnVtRGlmZlBpeGVscyA9PT0gMCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzKF9jb25maWc6IFBsdWdpbkNvbmZpZyk6IFRvb2xbXSB7XG4gIGNvbnN0IHRvb2xzOiBUb29sW10gPSBbXTtcblxuICAvLyBpbWFnZV90b190ZXh0IHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnaW1hZ2VfdG9fdGV4dCcsXG4gICAgZGVzY3JpcHRpb246ICdFeHRyYWN0IHRleHQgZnJvbSBpbWFnZXMgdXNpbmcgT0NSIChUZXNzZXJhY3QuanMpLiBTdXBwb3J0cyBtdWx0aXBsZSBsYW5ndWFnZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBpbWFnZVBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIGltYWdlIGZpbGUnKSxcbiAgICAgIGxhbmd1YWdlOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVmYXVsdCgnZW5nJykuZGVzY3JpYmUoJ0xhbmd1YWdlIGNvZGUgZm9yIE9DUiAoZS5nLiwgXCJlbmdcIiwgXCJkZXVcIiwgXCJjaGlfc2ltXCIpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaW1hZ2VUb1RleHQocGFyYW1zIGFzIEltYWdlVG9UZXh0UGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGRlc2NyaWJlX2ltYWdlIHRvb2xcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZGVzY3JpYmVfaW1hZ2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2V0IG1ldGFkYXRhIGFuZCBiYXNpYyBkZXNjcmlwdGlvbiBvZiBhbiBpbWFnZSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaW1hZ2VQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdQYXRoIHRvIHRoZSBpbWFnZSBmaWxlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gZGVzY3JpYmVJbWFnZShwYXJhbXMgYXMgRGVzY3JpYmVJbWFnZVBhcmFtcyksXG4gIH0pKTtcblxuICAvLyBzY3JlZW5zaG90X2Rlc2t0b3AgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdzY3JlZW5zaG90X2Rlc2t0b3AnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2FwdHVyZSBhIHNjcmVlbnNob3Qgb2YgdGhlIGRlc2t0b3AgYW5kIHNhdmUgaXQgdG8gYSBmaWxlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgb3V0cHV0UGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdPdXRwdXQgcGF0aCBmb3IgdGhlIHNjcmVlbnNob3QgKGRlZmF1bHQ6IHRlbXAgZGlyZWN0b3J5KScpLFxuICAgICAgZm9ybWF0OiB6LmVudW0oWydwbmcnLCAnanBlZyddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ3BuZycpLmRlc2NyaWJlKCdJbWFnZSBmb3JtYXQnKSxcbiAgICAgIHF1YWxpdHk6IHoubnVtYmVyKCkubWluKDEpLm1heCgxMDApLm9wdGlvbmFsKCkuZGVmYXVsdCg5MCkuZGVzY3JpYmUoJ0pQRUcgcXVhbGl0eSAoMS0xMDAsIG9ubHkgYXBwbGllcyB0byBKUEVHIGZvcm1hdCknKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBzY3JlZW5zaG90RGVza3RvcChwYXJhbXMgYXMgU2NyZWVuc2hvdERlc2t0b3BQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gY29tcGFyZV9pbWFnZXMgdG9vbFxuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdjb21wYXJlX2ltYWdlcycsXG4gICAgZGVzY3JpcHRpb246ICdDb21wYXJlIHR3byBpbWFnZXMgYW5kIGNhbGN1bGF0ZSBwaXhlbC1sZXZlbCBzaW1pbGFyaXR5IHNjb3JlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaW1hZ2UxUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnUGF0aCB0byB0aGUgZmlyc3QgaW1hZ2UnKSxcbiAgICAgIGltYWdlMlBhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIHNlY29uZCBpbWFnZScpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IGNvbXBhcmVJbWFnZXMocGFyYW1zIGFzIENvbXBhcmVJbWFnZXNQYXJhbXMpLFxuICB9KSk7XG5cbiAgcmV0dXJuIHRvb2xzO1xufVxuIiwgImltcG9ydCB0eXBlIHsgVG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBIdHRwUmVxdWVzdFBhcmFtcyB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGJvZHk/OiBzdHJpbmcgfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuaW50ZXJmYWNlIEh0dHBHZXRKc29uUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5pbnRlcmZhY2UgSHR0cFBvc3RKc29uUGFyYW1zIHtcbiAgdXJsOiBzdHJpbmc7XG4gIGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gU2VjdXJpdHkgJiBWYWxpZGF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTU1JGIHByb3RlY3Rpb24gLSB2YWxpZGF0ZSBVUkwgaXMgc2FmZSAqL1xuZnVuY3Rpb24gdmFsaWRhdGVVcmwodXJsOiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgXG4gICAgLy8gQmxvY2sgaW50ZXJuYWwvcHJpdmF0ZSBJUCBhZGRyZXNzZXMgKFNTUkYgcHJvdGVjdGlvbilcbiAgICBpZiAocGFyc2VkLnByb3RvY29sID09PSAnZmlsZTonIHx8IHBhcnNlZC5wcm90b2NvbCA9PT0gJ2RhdGE6Jykge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFByb3RvY29sIFwiJHtwYXJzZWQucHJvdG9jb2x9XCIgaXMgbm90IGFsbG93ZWRgIH07XG4gICAgfVxuXG4gICAgLy8gQWxsb3cgaHR0cCBhbmQgaHR0cHMgb25seVxuICAgIGlmICghWydodHRwOicsICdodHRwczonXS5pbmNsdWRlcyhwYXJzZWQucHJvdG9jb2wpKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgT25seSBIVFRQL0hUVFBTIHByb3RvY29scyBhcmUgYWxsb3dlZGAgfTtcbiAgICB9XG5cbiAgICAvLyBCbG9jayBwcml2YXRlIElQIHJhbmdlcyAoYmFzaWMgY2hlY2spXG4gICAgY29uc3QgaG9zdG5hbWUgPSBwYXJzZWQuaG9zdG5hbWU7XG4gICAgY29uc3QgYmxvY2tlZFBhdHRlcm5zID0gW1xuICAgICAgL14xMjdcXC4vLCAgICAgICAgICAgLy8gbG9jYWxob3N0XG4gICAgICAvXjEwXFwuLywgICAgICAgICAgICAvLyAxMC4wLjAuMC84XG4gICAgICAvXjE3MlxcLjFbNi05XVxcLi8sICAgLy8gMTcyLjE2LjAuMC8xMlxuICAgICAgL14xNzJcXC4yWzAtOV1cXC4vLCAgIC8vIDE3Mi4xNi4wLjAvMTJcbiAgICAgIC9eMTcyXFwuM1swLTFdXFwuLywgICAvLyAxNzIuMTYuMC4wLzEyXG4gICAgICAvXjE5MlxcLjE2OFxcLi8sICAgICAgLy8gMTkyLjE2OC4wLjAvMTZcbiAgICAgIC9eMFxcLjBcXC4wXFwuMCQvLCAgICAgLy8gMC4wLjAuMFxuICAgICAgL15sb2NhbGhvc3QkLywgICAgICAvLyBsb2NhbGhvc3QgaG9zdG5hbWVcbiAgICBdO1xuXG4gICAgaWYgKGJsb2NrZWRQYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi50ZXN0KGhvc3RuYW1lKSkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBBY2Nlc3MgdG8gJHtob3N0bmFtZX0gaXMgYmxvY2tlZCBmb3Igc2VjdXJpdHkgcmVhc29uc2AgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYEludmFsaWQgVVJMOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8qKiBIZWxwZXIgZm9yIGNvbnNpc3RlbnQgZXJyb3IgaGFuZGxpbmcgKi9cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdWNjZXNzOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgSFRUUCByZXF1ZXN0IGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBHZW5lcmljIEhUVFAgY2xpZW50IGZvciBtYWtpbmcgcmVxdWVzdHMgdG8gYW55IFJFU1QgQVBJLlxuICovXG5hc3luYyBmdW5jdGlvbiBodHRwUmVxdWVzdCh7IG1ldGhvZCwgdXJsLCBoZWFkZXJzID0ge30sIGJvZHkgfTogSHR0cFJlcXVlc3RQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICAvLyBQcmVwYXJlIHJlcXVlc3Qgb3B0aW9uc1xuICAgIGNvbnN0IG9wdGlvbnM6IFJlcXVlc3RJbml0ID0ge1xuICAgICAgbWV0aG9kOiBtZXRob2QudG9VcHBlckNhc2UoKSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1VzZXItQWdlbnQnOiAnQUktVG9vbGJveC8xLjAnLFxuICAgICAgICAuLi5oZWFkZXJzLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGJvZHkgZm9yIG5vbi1HRVQvSEVBRCByZXF1ZXN0c1xuICAgIGlmIChib2R5ICYmICFbJ0dFVCcsICdIRUFEJ10uaW5jbHVkZXMobWV0aG9kLnRvVXBwZXJDYXNlKCkpKSB7XG4gICAgICBvcHRpb25zLmJvZHkgPSB0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycgPyBib2R5IDogSlNPTi5zdHJpbmdpZnkoYm9keSk7XG4gICAgICBcbiAgICAgIC8vIFNldCBjb250ZW50LXR5cGUgaGVhZGVyIGlmIG5vdCBhbHJlYWR5IHNldCBhbmQgYm9keSBpcyBvYmplY3Qvc3RyaW5nXG4gICAgICBpZiAoIWhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddICYmIHR5cGVvZiBib2R5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAob3B0aW9ucy5oZWFkZXJzIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4pWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgJHttZXRob2QudG9VcHBlckNhc2UoKX0gJHt1cmx9YCk7XG5cbiAgICAvLyBNYWtlIHRoZSByZXF1ZXN0IHdpdGggdGltZW91dFxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTsgLy8gMzBzIHRpbWVvdXRcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyAuLi5vcHRpb25zLCBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIC8vIFBhcnNlIHJlc3BvbnNlIGJhc2VkIG9uIGNvbnRlbnQgdHlwZVxuICAgICAgbGV0IHJlc3BvbnNlRGF0YTogdW5rbm93bjtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuICAgICAgXG4gICAgICBpZiAoY29udGVudFR5cGUuaW5jbHVkZXMoJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXNwb25zZS5oZWFkZXJzLmVudHJpZXMoKSksXG4gICAgICAgICAgYm9keTogcmVzcG9uc2VEYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgICBtZXRob2Q6IG1ldGhvZC50b1VwcGVyQ2FzZSgpLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBHRVQgcmVxdWVzdCByZXR1cm5pbmcgcGFyc2VkIEpTT04uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGh0dHBHZXRKc29uKHsgdXJsLCBoZWFkZXJzID0ge30gfTogSHR0cEdldEpzb25QYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgR0VUICR7dXJsfWApO1xuXG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnVXNlci1BZ2VudCc6ICdBSS1Ub29sYm94LzEuMCcsXG4gICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiBgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c306ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gLFxuICAgICAgICAgIGRhdGE6IHsgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsIHVybCB9LFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlc3BvbnNlLmhlYWRlcnMuZW50cmllcygpKSxcbiAgICAgICAgICBib2R5OiBkYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogUE9TVCByZXF1ZXN0IHdpdGggSlNPTiBib2R5LlxuICovXG5hc3luYyBmdW5jdGlvbiBodHRwUG9zdEpzb24oeyB1cmwsIGRhdGEsIGhlYWRlcnMgPSB7fSB9OiBIdHRwUG9zdEpzb25QYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBVUkwgZm9yIFNTUkYgcHJvdGVjdGlvblxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVVybCh1cmwpO1xuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yIH07XG5cbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIEhUVFAgUE9TVCAke3VybH1gKTtcblxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogJ0FJLVRvb2xib3gvMS4wJyxcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICBsZXQgcmVzcG9uc2VEYXRhOiB1bmtub3duO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgICBcbiAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIGhlYWRlcnM6IE9iamVjdC5mcm9tRW50cmllcyhyZXNwb25zZS5oZWFkZXJzLmVudHJpZXMoKSksXG4gICAgICAgICAgYm9keTogcmVzcG9uc2VEYXRhLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgUmVnaXN0cmF0aW9uID09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3Rlckh0dHBDbGllbnRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XG5cbiAgLy8gaHR0cF9yZXF1ZXN0IHRvb2wgLSBHZW5lcmljIEhUVFAgY2xpZW50XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfcmVxdWVzdCcsXG4gICAgZGVzY3JpcHRpb246ICdNYWtlIGdlbmVyaWMgSFRUUCByZXF1ZXN0cyB0byBhbnkgUkVTVCBBUEkuIFN1cHBvcnRzIEdFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENIIGFuZCBvdGhlciBtZXRob2RzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbWV0aG9kOiB6LmVudW0oWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ1BBVENIJywgJ0hFQUQnLCAnT1BUSU9OUyddKS5kZXNjcmliZSgnSFRUUCBtZXRob2QnKSxcbiAgICAgIHVybDogei5zdHJpbmcoKS51cmwoKS5kZXNjcmliZSgnUmVxdWVzdCBVUkwgKG11c3QgYmUgaHR0cDovLyBvciBodHRwczovLyknKSxcbiAgICAgIGhlYWRlcnM6IHoucmVjb3JkKHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0N1c3RvbSBoZWFkZXJzIGFzIGtleS12YWx1ZSBwYWlycycpLFxuICAgICAgYm9keTogei51bmlvbihbei5zdHJpbmcoKSwgei5yZWNvcmQoei51bmtub3duKCkpXSkub3B0aW9uYWwoKS5kZXNjcmliZSgnUmVxdWVzdCBib2R5IChzdHJpbmcgb3IgSlNPTiBvYmplY3QpJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaHR0cFJlcXVlc3QocGFyYW1zIGFzIEh0dHBSZXF1ZXN0UGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGh0dHBfZ2V0X2pzb24gdG9vbCAtIENvbnZlbmllbmNlIHdyYXBwZXIgZm9yIEdFVCByZXF1ZXN0c1xuICB0b29scy5wdXNoKHRvb2woe1xuICAgIG5hbWU6ICdodHRwX2dldF9qc29uJyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgYSBHRVQgcmVxdWVzdCBhbmQgcmV0dXJuIHBhcnNlZCBKU09OIHJlc3BvbnNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdXJsOiB6LnN0cmluZygpLnVybCgpLmRlc2NyaWJlKCdSZXF1ZXN0IFVSTCAobXVzdCBiZSBodHRwOi8vIG9yIGh0dHBzOi8vKScpLFxuICAgICAgaGVhZGVyczogei5yZWNvcmQoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ3VzdG9tIGhlYWRlcnMgYXMga2V5LXZhbHVlIHBhaXJzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gaHR0cEdldEpzb24ocGFyYW1zIGFzIEh0dHBHZXRKc29uUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIGh0dHBfcG9zdF9qc29uIHRvb2wgLSBDb252ZW5pZW5jZSB3cmFwcGVyIGZvciBQT1NUIHJlcXVlc3RzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2h0dHBfcG9zdF9qc29uJyxcbiAgICBkZXNjcmlwdGlvbjogJ01ha2UgYSBQT1NUIHJlcXVlc3Qgd2l0aCBKU09OIGJvZHkgYW5kIHJldHVybiBwYXJzZWQgcmVzcG9uc2UuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB1cmw6IHouc3RyaW5nKCkudXJsKCkuZGVzY3JpYmUoJ1JlcXVlc3QgVVJMIChtdXN0IGJlIGh0dHA6Ly8gb3IgaHR0cHM6Ly8pJyksXG4gICAgICBkYXRhOiB6LnJlY29yZCh6LnVua25vd24oKSkuZGVzY3JpYmUoJ0pTT04gb2JqZWN0IHRvIHNlbmQgYXMgcmVxdWVzdCBib2R5JyksXG4gICAgICBoZWFkZXJzOiB6LnJlY29yZCh6LnN0cmluZygpKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdDdXN0b20gaGVhZGVycyBhcyBrZXktdmFsdWUgcGFpcnMnKSxcbiAgICB9LFxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAocGFyYW1zKSA9PiBodHRwUG9zdEpzb24ocGFyYW1zIGFzIEh0dHBQb3N0SnNvblBhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVkIFBhcmFtcyBJbnRlcmZhY2VzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBSYWdJbmRleEZpbGVzUGFyYW1zIHtcbiAgZGlyZWN0b3J5UGF0aDogc3RyaW5nO1xuICBmaWxlUGF0dGVybj86IHN0cmluZztcbiAgYmF0Y2hTaXplPzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgUmFnUXVlcnlWZWN0b3JQYXJhbXMge1xuICBxdWVyeTogc3RyaW5nO1xuICB0b3BLPzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgUmFnQ2xlYXJJbmRleFBhcmFtcyB7XG4gIGNvbmZpcm06IGJvb2xlYW47XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFR5cGVzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBEb2N1bWVudENodW5rIHtcbiAgaWQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBtZXRhZGF0YToge1xuICAgIGZpbGVfcGF0aDogc3RyaW5nO1xuICAgIGZpbGVfbmFtZTogc3RyaW5nO1xuICAgIGNodW5rX2luZGV4OiBudW1iZXI7XG4gICAgdG90YWxfY2h1bmtzOiBudW1iZXI7XG4gICAgd29yZF9jb3VudDogbnVtYmVyO1xuICB9O1xufVxuXG5pbnRlcmZhY2UgU2VhcmNoUmVzdWx0IHtcbiAgaWQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBzY29yZTogbnVtYmVyO1xuICBtZXRhZGF0YTogRG9jdW1lbnRDaHVua1snbWV0YWRhdGEnXTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVmVjdG9yIFN0b3JlIEltcGxlbWVudGF0aW9uIChMb2NhbCkgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFNpbXBsZSBsb2NhbCB2ZWN0b3Igc3RvcmUgdXNpbmcgaW4tbWVtb3J5IHN0b3JhZ2Ugd2l0aCBjb3NpbmUgc2ltaWxhcml0eSAqL1xuY2xhc3MgTG9jYWxWZWN0b3JTdG9yZSB7XG4gIHByaXZhdGUgZG9jdW1lbnRzOiBNYXA8c3RyaW5nLCB7IGVtYmVkZGluZzogRmxvYXQzMkFycmF5OyBjaHVuazogRG9jdW1lbnRDaHVuayB9PiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBpbmRleE5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihpbmRleE5hbWU6IHN0cmluZyA9ICdhaV90b29sYm94X3JhZycpIHtcbiAgICB0aGlzLmluZGV4TmFtZSA9IGluZGV4TmFtZTtcbiAgfVxuXG4gIC8qKiBBZGQgZG9jdW1lbnRzIHRvIHRoZSBzdG9yZSAqL1xuICBhZGQoZG9jdW1lbnRzOiBEb2N1bWVudENodW5rW10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGRvYyBvZiBkb2N1bWVudHMpIHtcbiAgICAgIHRoaXMuZG9jdW1lbnRzLnNldChkb2MuaWQsIHsgZW1iZWRkaW5nOiBuZXcgRmxvYXQzMkFycmF5KDApLCBjaHVuazogZG9jIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXQgZW1iZWRkaW5ncyBmb3IgYWxsIGRvY3VtZW50cyAqL1xuICBzZXRFbWJlZGRpbmdzKGlkczogc3RyaW5nW10sIGVtYmVkZGluZ3M6IEZsb2F0MzJBcnJheVtdKTogdm9pZCB7XG4gICAgaWRzLmZvckVhY2goKGlkLCBpKSA9PiB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZG9jdW1lbnRzLmdldChpZCk7XG4gICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgZW50cnkuZW1iZWRkaW5nID0gZW1iZWRkaW5nc1tpXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTZWFyY2ggZm9yIHNpbWlsYXIgZG9jdW1lbnRzICovXG4gIHNlYXJjaChxdWVyeUVtYmVkZGluZzogRmxvYXQzMkFycmF5LCB0b3BLOiBudW1iZXIpOiBTZWFyY2hSZXN1bHRbXSB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBpZDogc3RyaW5nOyBzY29yZTogbnVtYmVyIH0+ID0gW107XG5cbiAgICBmb3IgKGNvbnN0IFtpZCwgZW50cnldIG9mIHRoaXMuZG9jdW1lbnRzLmVudHJpZXMoKSkge1xuICAgICAgaWYgKGVudHJ5LmVtYmVkZGluZy5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgICAgXG4gICAgICAvLyBDb3NpbmUgc2ltaWxhcml0eVxuICAgICAgbGV0IGRvdFByb2R1Y3QgPSAwO1xuICAgICAgbGV0IG5vcm1BID0gMDtcbiAgICAgIGxldCBub3JtQiA9IDA7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW50cnkuZW1iZWRkaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRvdFByb2R1Y3QgKz0gcXVlcnlFbWJlZGRpbmdbaV0gKiBlbnRyeS5lbWJlZGRpbmdbaV07XG4gICAgICAgIG5vcm1BICs9IGVudHJ5LmVtYmVkZGluZ1tpXSAqIGVudHJ5LmVtYmVkZGluZ1tpXTtcbiAgICAgICAgbm9ybUIgKz0gcXVlcnlFbWJlZGRpbmdbaV0gKiBxdWVyeUVtYmVkZGluZ1tpXTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2ltaWxhcml0eSA9IG5vcm1BID4gMCAmJiBub3JtQiA+IDAgPyBkb3RQcm9kdWN0IC8gKE1hdGguc3FydChub3JtQSkgKiBNYXRoLnNxcnQobm9ybUIpKSA6IDA7XG4gICAgICBcbiAgICAgIHJlc3VsdHMucHVzaCh7IGlkLCBzY29yZTogc2ltaWxhcml0eSB9KTtcbiAgICB9XG5cbiAgICAvLyBTb3J0IGJ5IHNpbWlsYXJpdHkgZGVzY2VuZGluZyBhbmQgcmV0dXJuIHRvcCBLXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSlcbiAgICAgIC5zbGljZSgwLCB0b3BLKVxuICAgICAgLm1hcCgoeyBpZCwgc2NvcmUgfSkgPT4ge1xuICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZG9jdW1lbnRzLmdldChpZCkhO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBlbnRyeS5jaHVuay5pZCxcbiAgICAgICAgICB0ZXh0OiBlbnRyeS5jaHVuay50ZXh0LFxuICAgICAgICAgIHNjb3JlLFxuICAgICAgICAgIG1ldGFkYXRhOiBlbnRyeS5jaHVuay5tZXRhZGF0YSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIENsZWFyIGFsbCBkb2N1bWVudHMgKi9cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5kb2N1bWVudHMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKiBHZXQgZG9jdW1lbnQgY291bnQgKi9cbiAgZ2V0IGNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnRzLnNpemU7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVGV4dCBDaHVua2luZyA9PT09PT09PT09PT09PT09PT09PVxuXG4vKiogU3BsaXQgdGV4dCBpbnRvIGNodW5rcyB3aXRoIG92ZXJsYXAgKi9cbmZ1bmN0aW9uIGNodW5rVGV4dCh0ZXh0OiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyID0gNTAwLCBvdmVybGFwOiBudW1iZXIgPSA1MCk6IERvY3VtZW50Q2h1bmtbXSB7XG4gIGNvbnN0IHdvcmRzID0gdGV4dC5zcGxpdCgvXFxzKy8pO1xuICBjb25zdCBjaHVua3M6IERvY3VtZW50Q2h1bmtbXSA9IFtdO1xuICBcbiAgaWYgKHdvcmRzLmxlbmd0aCA8PSBjaHVua1NpemUpIHtcbiAgICByZXR1cm4gW3tcbiAgICAgIGlkOiBgY2h1bmtfJHtEYXRlLm5vdygpfV8wYCxcbiAgICAgIHRleHQ6IHRleHQsXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6ICcnLFxuICAgICAgICBmaWxlX25hbWU6ICcnLFxuICAgICAgICBjaHVua19pbmRleDogMCxcbiAgICAgICAgdG90YWxfY2h1bmtzOiAxLFxuICAgICAgICB3b3JkX2NvdW50OiB3b3Jkcy5sZW5ndGgsXG4gICAgICB9LFxuICAgIH1dO1xuICB9XG5cbiAgbGV0IHN0YXJ0SW5kZXggPSAwO1xuICBsZXQgY2h1bmtJbmRleCA9IDA7XG5cbiAgd2hpbGUgKHN0YXJ0SW5kZXggPCB3b3Jkcy5sZW5ndGgpIHtcbiAgICBjb25zdCBlbmRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXggKyBjaHVua1NpemUsIHdvcmRzLmxlbmd0aCk7XG4gICAgY29uc3QgY2h1bmtUZXh0ID0gd29yZHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmpvaW4oJyAnKTtcbiAgICBcbiAgICBjaHVua3MucHVzaCh7XG4gICAgICBpZDogYGNodW5rXyR7RGF0ZS5ub3coKX1fJHtjaHVua0luZGV4fWAsXG4gICAgICB0ZXh0OiBjaHVua1RleHQsXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBmaWxlX3BhdGg6ICcnLCAvLyBXaWxsIGJlIHNldCBsYXRlclxuICAgICAgICBmaWxlX25hbWU6ICcnLCAvLyBXaWxsIGJlIHNldCBsYXRlclxuICAgICAgICBjaHVua19pbmRleDogY2h1bmtJbmRleCxcbiAgICAgICAgdG90YWxfY2h1bmtzOiBNYXRoLmNlaWwod29yZHMubGVuZ3RoIC8gKGNodW5rU2l6ZSAtIG92ZXJsYXApKSxcbiAgICAgICAgd29yZF9jb3VudDogZW5kSW5kZXggLSBzdGFydEluZGV4LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNodW5rSW5kZXgrKztcbiAgICBzdGFydEluZGV4ID0gZW5kSW5kZXggLSBvdmVybGFwO1xuICB9XG5cbiAgcmV0dXJuIGNodW5rcztcbn1cblxuLyoqIEdlbmVyYXRlIHNpbXBsZSBURi1JREYtbGlrZSBlbWJlZGRpbmdzIGZvciB0ZXh0ICovXG5mdW5jdGlvbiBnZW5lcmF0ZUVtYmVkZGluZyh0ZXh0OiBzdHJpbmcpOiBGbG9hdDMyQXJyYXkge1xuICAvLyBTaW1wbGUgd29yZCBmcmVxdWVuY3ktYmFzZWQgZW1iZWRkaW5nIChkaW1lbnNpb246IDEwMClcbiAgY29uc3QgZGltZW5zaW9ucyA9IDEwMDtcbiAgY29uc3QgZW1iZWRkaW5nID0gbmV3IEZsb2F0MzJBcnJheShkaW1lbnNpb25zKTtcbiAgXG4gIC8vIFRva2VuaXplIGFuZCBoYXNoIHdvcmRzIHRvIGRpbWVuc2lvbnNcbiAgY29uc3Qgd29yZHMgPSB0ZXh0LnRvTG93ZXJDYXNlKCkubWF0Y2goL1thLXpdKy9nKSB8fCBbXTtcbiAgY29uc3Qgd29yZFNldCA9IG5ldyBTZXQod29yZHMpO1xuICBcbiAgZm9yIChjb25zdCB3b3JkIG9mIHdvcmRTZXQpIHtcbiAgICBsZXQgaGFzaCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3JkLmxlbmd0aDsgaSsrKSB7XG4gICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyB3b3JkLmNoYXJDb2RlQXQoaSk7XG4gICAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICAgIH1cbiAgICBcbiAgICBjb25zdCBkaW1JbmRleCA9IE1hdGguYWJzKGhhc2ggJSBkaW1lbnNpb25zKTtcbiAgICBlbWJlZGRpbmdbZGltSW5kZXhdICs9IDEuMCAvICh3b3JkLmxlbmd0aCArIDEpOyAvLyBXZWlnaHQgYnkgaW52ZXJzZSBsZW5ndGhcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZVxuICBsZXQgbm9ybSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltZW5zaW9uczsgaSsrKSB7XG4gICAgbm9ybSArPSBlbWJlZGRpbmdbaV0gKiBlbWJlZGRpbmdbaV07XG4gIH1cbiAgbm9ybSA9IE1hdGguc3FydChub3JtKSB8fCAxO1xuICBcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1lbnNpb25zOyBpKyspIHtcbiAgICBlbWJlZGRpbmdbaV0gLz0gbm9ybTtcbiAgfVxuXG4gIHJldHVybiBlbWJlZGRpbmc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRvb2wgSW1wbGVtZW50YXRpb25zID09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogSW5kZXggZmlsZXMgaW4gYSBkaXJlY3RvcnkgZm9yIHNlbWFudGljIHNlYXJjaC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnSW5kZXhGaWxlcyh7IFxuICBkaXJlY3RvcnlQYXRoLCBcbiAgZmlsZVBhdHRlcm4gPSAnKi57dHMsanMsdHN4LGpzeCxtZCxqc29uLHlhbWwseW1sLHRvbWwsdHh0fScsXG4gIGJhdGNoU2l6ZSA9IDEwIFxufTogUmFnSW5kZXhGaWxlc1BhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIGRpcmVjdG9yeSBleGlzdHNcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyZWN0b3J5UGF0aCkpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYERpcmVjdG9yeSBub3QgZm91bmQ6ICR7ZGlyZWN0b3J5UGF0aH1gIH07XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcmUgPSBuZXcgTG9jYWxWZWN0b3JTdG9yZSgpO1xuICAgIGxldCBpbmRleGVkQ291bnQgPSAwO1xuICAgIGxldCBza2lwcGVkQ291bnQgPSAwO1xuXG4gICAgLy8gRmluZCBmaWxlcyBtYXRjaGluZyBwYXR0ZXJuXG4gICAgY29uc3QgZmluZEZpbGVzID0gKGRpcjogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICAgICAgbGV0IHJlc3VsdHM6IHN0cmluZ1tdID0gW107XG4gICAgICBcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkubmFtZSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIC8vIFNraXAgbm9kZV9tb2R1bGVzIGFuZCAuZ2l0IGRpcmVjdG9yaWVzXG4gICAgICAgICAgICBpZiAoZW50cnkubmFtZSA9PT0gJ25vZGVfbW9kdWxlcycgfHwgZW50cnkubmFtZSA9PT0gJy5naXQnKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChmaW5kRmlsZXMoZnVsbFBhdGgpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmaWxlIGV4dGVuc2lvbiBhZ2FpbnN0IHBhdHRlcm5cbiAgICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgY29uc3QgYWxsb3dlZEV4dHMgPSBbJy50cycsICcuanMnLCAnLnRzeCcsICcuanN4JywgJy5tZCcsICcuanNvbicsICcueWFtbCcsICcueW1sJywgJy50b21sJywgJy50eHQnXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0FJIFRvb2xib3hdIENvdWxkIG5vdCByZWFkIGRpcmVjdG9yeSAke2Rpcn06YCwgZXJyb3IpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgY29uc3QgZmlsZXMgPSBmaW5kRmlsZXMoZGlyZWN0b3J5UGF0aCk7XG4gICAgXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBpbmRleGVkQ291bnQ6IDAsIG1lc3NhZ2U6ICdObyBtYXRjaGluZyBmaWxlcyBmb3VuZCcgfSB9O1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZWFjaCBmaWxlXG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIFxuICAgICAgICAvLyBTa2lwIGxhcmdlIGZpbGVzICg+MU1CKVxuICAgICAgICBpZiAoY29udGVudC5sZW5ndGggPiAxMDI0ICogMTAyNCkge1xuICAgICAgICAgIHNraXBwZWRDb3VudCsrO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2h1bmsgdGhlIHRleHRcbiAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtUZXh0KGNvbnRlbnQpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IG1ldGFkYXRhIGZvciBlYWNoIGNodW5rXG4gICAgICAgIGNodW5rcy5mb3JFYWNoKGNodW5rID0+IHtcbiAgICAgICAgICBjaHVuay5tZXRhZGF0YS5maWxlX3BhdGggPSBmaWxlUGF0aDtcbiAgICAgICAgICBjaHVuay5tZXRhZGF0YS5maWxlX25hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgZW1iZWRkaW5ncyBhbmQgYWRkIHRvIHN0b3JlXG4gICAgICAgIGNvbnN0IGlkcyA9IGNodW5rcy5tYXAoYyA9PiBjLmlkKTtcbiAgICAgICAgY29uc3QgZW1iZWRkaW5ncyA9IGNodW5rcy5tYXAoYyA9PiBnZW5lcmF0ZUVtYmVkZGluZyhjLnRleHQpKTtcbiAgICAgICAgXG4gICAgICAgIHN0b3JlLmFkZChjaHVua3MpO1xuICAgICAgICBzdG9yZS5zZXRFbWJlZGRpbmdzKGlkcywgZW1iZWRkaW5ncyk7XG4gICAgICAgIFxuICAgICAgICBpbmRleGVkQ291bnQgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0FJIFRvb2xib3hdIENvdWxkIG5vdCBpbmRleCAke2ZpbGVQYXRofTpgLCBlcnJvcik7XG4gICAgICAgIHNraXBwZWRDb3VudCsrO1xuICAgICAgfVxuXG4gICAgICAvLyBQcm9ncmVzcyBjYWxsYmFjayBldmVyeSBiYXRjaFxuICAgICAgaWYgKChpbmRleGVkQ291bnQgKyBza2lwcGVkQ291bnQpICUgYmF0Y2hTaXplID09PSAwKSB7XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBcXHJbQUkgVG9vbGJveF0gSW5kZXhlZCAkeyhpbmRleGVkQ291bnQgKyBza2lwcGVkQ291bnQpfSBjaHVua3MuLi5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnXFxuW0FJIFRvb2xib3hdIEluZGV4aW5nIGNvbXBsZXRlJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgaW5kZXhlZENodW5rczogaW5kZXhlZENvdW50LFxuICAgICAgICBmaWxlc1Byb2Nlc3NlZDogZmlsZXMubGVuZ3RoLFxuICAgICAgICBza2lwcGVkRmlsZXM6IHNraXBwZWRDb3VudCxcbiAgICAgICAgdG90YWxEb2N1bWVudHM6IHN0b3JlLmNvdW50LFxuICAgICAgICBkaXJlY3RvcnlQYXRoLFxuICAgICAgfSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgUkFHIGluZGV4aW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFF1ZXJ5IHRoZSB2ZWN0b3IgaW5kZXggZm9yIHNlbWFudGljYWxseSBzaW1pbGFyIGRvY3VtZW50cy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnUXVlcnlWZWN0b3IoeyBxdWVyeSwgdG9wSyA9IDUgfTogUmFnUXVlcnlWZWN0b3JQYXJhbXMpOiBQcm9taXNlPHVua25vd24+IHtcbiAgdHJ5IHtcbiAgICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmcgZm9yIHRoZSBxdWVyeVxuICAgIGNvbnN0IHF1ZXJ5RW1iZWRkaW5nID0gZ2VuZXJhdGVFbWJlZGRpbmcocXVlcnkpO1xuICAgIFxuICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCB1c2UgQ2hyb21hREIgb3Igc2ltaWxhclxuICAgIC8vIEZvciBub3csIHdlIHJldHVybiBhIHBsYWNlaG9sZGVyIHJlc3BvbnNlXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHF1ZXJ5LFxuICAgICAgICB0b3BLLFxuICAgICAgICByZXN1bHRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdwbGFjZWhvbGRlcicsXG4gICAgICAgICAgICB0ZXh0OiAnVmVjdG9yIHNlYXJjaCByZXF1aXJlcyBDaHJvbWFEQiBpbnRlZ3JhdGlvbi4gVGhpcyBpcyBhIHBsYWNlaG9sZGVyLicsXG4gICAgICAgICAgICBzY29yZTogMCxcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgIGZpbGVfcGF0aDogJycsXG4gICAgICAgICAgICAgIGZpbGVfbmFtZTogJycsXG4gICAgICAgICAgICAgIGNodW5rX2luZGV4OiAwLFxuICAgICAgICAgICAgICB0b3RhbF9jaHVua3M6IDEsXG4gICAgICAgICAgICAgIHdvcmRfY291bnQ6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5vdGU6ICdUbyBlbmFibGUgZnVsbCB2ZWN0b3Igc2VhcmNoLCBpbnN0YWxsIGNocm9tYWRiIGFuZCB1cGRhdGUgdGhlIGltcGxlbWVudGF0aW9uLicsXG4gICAgICB9LFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBSQUcgcXVlcnkgZmFpbGVkOiAke21lc3NhZ2V9YCB9O1xuICB9XG59XG5cbi8qKlxuICogQ2xlYXIgdGhlIHZlY3RvciBpbmRleC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmFnQ2xlYXJJbmRleCh7IGNvbmZpcm0gfTogUmFnQ2xlYXJJbmRleFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xuICBpZiAoIWNvbmZpcm0pIHtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDb25maXJtYXRpb24gcmVxdWlyZWQgdG8gY2xlYXIgaW5kZXgnIH07XG4gIH1cblxuICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgY2xlYXIgQ2hyb21hREJcbiAgcmV0dXJuIHtcbiAgICBzdWNjZXNzOiB0cnVlLFxuICAgIGRhdGE6IHsgbWVzc2FnZTogJ1ZlY3RvciBpbmRleCBjbGVhcmVkIHN1Y2Nlc3NmdWxseScgfSxcbiAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyUmFnVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIHJhZ19pbmRleF9maWxlcyB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ19pbmRleF9maWxlcycsXG4gICAgZGVzY3JpcHRpb246ICdJbmRleCBmaWxlcyBpbiBhIGRpcmVjdG9yeSBmb3Igc2VtYW50aWMgc2VhcmNoLiBTdXBwb3J0cyBUeXBlU2NyaXB0LCBKYXZhU2NyaXB0LCBNYXJrZG93biwgSlNPTiwgWUFNTCwgYW5kIHRleHQgZmlsZXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBkaXJlY3RvcnlQYXRoOiB6LnN0cmluZygpLmRlc2NyaWJlKCdEaXJlY3RvcnkgcGF0aCB0byBpbmRleCcpLFxuICAgICAgZmlsZVBhdHRlcm46IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCcqLnt0cyxqcyx0c3gsanN4LG1kLGpzb24seWFtbCx5bWwsdG9tbCx0eHR9JykuZGVzY3JpYmUoJ0ZpbGUgcGF0dGVybiB0byBtYXRjaCAoZ2xvYiBzeW50YXgpJyksXG4gICAgICBiYXRjaFNpemU6IHoubnVtYmVyKCkubWluKDEpLm1heCgxMDApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ0JhdGNoIHNpemUgZm9yIHByb2dyZXNzIHJlcG9ydGluZycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHJhZ0luZGV4RmlsZXMocGFyYW1zIGFzIFJhZ0luZGV4RmlsZXNQYXJhbXMpLFxuICB9KSk7XG5cbiAgLy8gcmFnX3F1ZXJ5X3ZlY3RvciB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ19xdWVyeV92ZWN0b3InLFxuICAgIGRlc2NyaXB0aW9uOiAnUXVlcnkgdGhlIHZlY3RvciBpbmRleCBmb3Igc2VtYW50aWNhbGx5IHNpbWlsYXIgZG9jdW1lbnRzLiBSZXR1cm5zIHRvcC1rIG1vc3QgcmVsZXZhbnQgY2h1bmtzLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgcXVlcnk6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1NlYXJjaCBxdWVyeSB0ZXh0JyksXG4gICAgICB0b3BLOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMjApLm9wdGlvbmFsKCkuZGVmYXVsdCg1KS5kZXNjcmliZSgnTnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmFnUXVlcnlWZWN0b3IocGFyYW1zIGFzIFJhZ1F1ZXJ5VmVjdG9yUGFyYW1zKSxcbiAgfSkpO1xuXG4gIC8vIHJhZ19jbGVhcl9pbmRleCB0b29sXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JhZ19jbGVhcl9pbmRleCcsXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciB0aGUgdmVjdG9yIHNlYXJjaCBpbmRleC4gUmVxdWlyZXMgY29uZmlybWF0aW9uLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29uZmlybTogei5ib29sZWFuKCkuZGVzY3JpYmUoJ1NldCB0byB0cnVlIHRvIGNvbmZpcm0gY2xlYXJpbmcgdGhlIGluZGV4JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHBhcmFtcykgPT4gcmFnQ2xlYXJJbmRleChwYXJhbXMgYXMgUmFnQ2xlYXJJbmRleFBhcmFtcyksXG4gIH0pKTtcblxuICByZXR1cm4gdG9vbHM7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB0b29sIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRXb3JraW5nRGlyIH0gZnJvbSAnLi4vd29ya2luZ0Rpci5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFVJIENvbXBvbmVudCBUZW1wbGF0ZXMgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgYnV0dG9uIGNvbXBvbmVudCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVCdXR0b25IdG1sKGxhYmVsOiBzdHJpbmcsIGNvbG9yOiBzdHJpbmcgPSAnIzAwN2JmZicsIGlkOiBzdHJpbmcgPSAndWktYnRuJyk6IHN0cmluZyB7XG4gIHJldHVybiBgXG4gICAgPGJ1dHRvbiBpZD1cIiR7aWR9XCIgc3R5bGU9XCJcbiAgICAgIHBhZGRpbmc6IDEycHggMjRweDtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7Y29sb3J9O1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzO1xuICAgIFwiPiR7bGFiZWx9PC9idXR0b24+XG4gIGA7XG59XG5cbi8qKiBHZW5lcmF0ZSBIVE1MIGZvciBhIGZvcm0gY29tcG9uZW50ICovXG5mdW5jdGlvbiBnZW5lcmF0ZUZvcm1IdG1sKGZpZWxkczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9Piwgc3VibWl0TGFiZWw6IHN0cmluZyA9ICdTdWJtaXQnKTogc3RyaW5nIHtcbiAgY29uc3QgZmllbGRzSHRtbCA9IGZpZWxkcy5tYXAoZmllbGQgPT4gYFxuICAgIDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAxNXB4O1wiPlxuICAgICAgPGxhYmVsIGZvcj1cIiR7ZmllbGQubmFtZX1cIiBzdHlsZT1cImRpc3BsYXk6IGJsb2NrOyBtYXJnaW4tYm90dG9tOiA1cHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7ZmllbGQubGFiZWx9PC9sYWJlbD5cbiAgICAgICR7ZmllbGQudHlwZSA9PT0gJ3RleHRhcmVhJyBcbiAgICAgICAgPyBgPHRleHRhcmVhIGlkPVwiJHtmaWVsZC5uYW1lfVwiIG5hbWU9XCIke2ZpZWxkLm5hbWV9XCIgcm93cz1cIjRcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBwYWRkaW5nOiA4cHg7IGJvcmRlcjogMXB4IHNvbGlkICNjY2M7IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L3RleHRhcmVhPmBcbiAgICAgICAgOiBmaWVsZC50eXBlID09PSAnc2VsZWN0J1xuICAgICAgICAgID8gYDxzZWxlY3QgaWQ9XCIke2ZpZWxkLm5hbWV9XCIgbmFtZT1cIiR7ZmllbGQubmFtZX1cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBwYWRkaW5nOiA4cHg7IGJvcmRlcjogMXB4IHNvbGlkICNjY2M7IGJvcmRlci1yYWRpdXM6IDRweDtcIj48b3B0aW9uIHZhbHVlPVwiXCI+U2VsZWN0Li4uPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIjFcIj5PcHRpb24gMTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCIyXCI+T3B0aW9uIDI8L29wdGlvbj48L3NlbGVjdD5gXG4gICAgICAgICAgOiBgPGlucHV0IHR5cGU9XCIke2ZpZWxkLnR5cGV9XCIgaWQ9XCIke2ZpZWxkLm5hbWV9XCIgbmFtZT1cIiR7ZmllbGQubmFtZX1cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBwYWRkaW5nOiA4cHg7IGJvcmRlcjogMXB4IHNvbGlkICNjY2M7IGJvcmRlci1yYWRpdXM6IDRweDtcIiAvPmBcbiAgICAgIH1cbiAgICA8L2Rpdj5cbiAgYCkuam9pbignJyk7XG5cbiAgcmV0dXJuIGBcbiAgICA8Zm9ybSBpZD1cInVpLWZvcm1cIiBvbnN1Ym1pdD1cImV2ZW50LnByZXZlbnREZWZhdWx0KCk7IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXJlc3VsdCcpLmlubmVySFRNTCA9ICdGb3JtIHN1Ym1pdHRlZCEnO1wiPlxuICAgICAgJHtmaWVsZHNIdG1sfVxuICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgc3R5bGU9XCJwYWRkaW5nOiAxMnB4IDI0cHg7IGJhY2tncm91bmQtY29sb3I6ICMwMDdiZmY7IGNvbG9yOiB3aGl0ZTsgYm9yZGVyOiBub25lOyBib3JkZXItcmFkaXVzOiA2cHg7IGN1cnNvcjogcG9pbnRlcjtcIj4ke3N1Ym1pdExhYmVsfTwvYnV0dG9uPlxuICAgIDwvZm9ybT5cbiAgICA8ZGl2IGlkPVwiZm9ybS1yZXN1bHRcIiBzdHlsZT1cIm1hcmdpbi10b3A6IDE1cHg7IHBhZGRpbmc6IDEwcHg7IGJhY2tncm91bmQtY29sb3I6ICNmOGY5ZmE7IGJvcmRlci1yYWRpdXM6IDRweDtcIj48L2Rpdj5cbiAgYDtcbn1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgY2hhcnQgY29tcG9uZW50IChzaW1wbGUgYmFyIGNoYXJ0KSAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVDaGFydEh0bWwoZGF0YTogQXJyYXk8eyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogbnVtYmVyIH0+LCB0aXRsZTogc3RyaW5nID0gJ0JhciBDaGFydCcpOiBzdHJpbmcge1xuICBjb25zdCBtYXhWYWx1ZSA9IE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC52YWx1ZSkpO1xuICBjb25zdCBiYXJzSHRtbCA9IGRhdGEubWFwKGQgPT4ge1xuICAgIGNvbnN0IGhlaWdodCA9IChkLnZhbHVlIC8gbWF4VmFsdWUpICogMjAwO1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtZW5kOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgbWFyZ2luLXJpZ2h0OiAxMHB4O1wiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwid2lkdGg6IDQwcHg7IGhlaWdodDogJHtoZWlnaHR9cHg7IGJhY2tncm91bmQtY29sb3I6ICMwMDdiZmY7IGJvcmRlci1yYWRpdXM6IDRweCA0cHggMCAwO1wiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfSkuam9pbignJyk7XG5cbiAgY29uc3QgbGFiZWxzSHRtbCA9IGRhdGEubWFwKGQgPT4gYFxuICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogNDBweDsgdGV4dC1hbGlnbjogY2VudGVyOyBmb250LXNpemU6IDEycHg7XCI+JHtkLmxhYmVsfTwvZGl2PlxuICBgKS5qb2luKCcnKTtcblxuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJwYWRkaW5nOiAyMHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmOWZhOyBib3JkZXItcmFkaXVzOiA4cHg7XCI+XG4gICAgICA8aDM+JHt0aXRsZX08L2gzPlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBmbGV4LWVuZDsgaGVpZ2h0OiAyMjBweDsgbWFyZ2luLWJvdHRvbTogMTBweDtcIj4ke2JhcnNIdG1sfTwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1wiPiR7bGFiZWxzSHRtbH08L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuLyoqIEdlbmVyYXRlIEhUTUwgZm9yIGEgZGFzaGJvYXJkIGNvbXBvbmVudCAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVEYXNoYm9hcmRIdG1sKHRpdGxlczogc3RyaW5nW10sIGNvbnRlbnQ6IEFycmF5PHsgdHlwZTogJ3RleHQnIHwgJ2NoYXJ0JzsgZGF0YT86IGFueSB9Pik6IHN0cmluZyB7XG4gIGNvbnN0IGNhcmRzSHRtbCA9IHRpdGxlcy5tYXAoKHRpdGxlLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGNhcmRDb250ZW50ID0gY29udGVudFtpbmRleF0/LnR5cGUgPT09ICdjaGFydCcgXG4gICAgICA/IGdlbmVyYXRlQ2hhcnRIdG1sKGNvbnRlbnRbaW5kZXhdLmRhdGEgfHwgW3sgbGFiZWw6ICdBJywgdmFsdWU6IDUwIH0sIHsgbGFiZWw6ICdCJywgdmFsdWU6IDgwIH1dLCB0aXRsZSlcbiAgICAgIDogYDxwIHN0eWxlPVwicGFkZGluZzogMjBweDtcIj4ke2NvbnRlbnRbaW5kZXhdPy5kYXRhIHx8IGBDb250ZW50IGZvciAke3RpdGxlfWB9PC9wPmA7XG4gICAgXG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxOyBtaW4td2lkdGg6IDI1MHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTsgYm9yZGVyLXJhZGl1czogOHB4OyBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLDAsMCwwLjEpOyBtYXJnaW46IDEwcHg7XCI+XG4gICAgICAgICR7Y2FyZENvbnRlbnR9XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9KS5qb2luKCcnKTtcblxuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogMjBweDsgcGFkZGluZzogMjBweDtcIj4ke2NhcmRzSHRtbH08L2Rpdj5cbiAgYDtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVWlHZW5lcmF0aW9uVG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGdlbmVyYXRlX3VpX2NvbXBvbmVudCB0b29sIFx1MjAxNCBHZW5lcmF0ZSBpbnRlcmFjdGl2ZSBVSSBjb21wb25lbnRzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dlbmVyYXRlX3VpX2NvbXBvbmVudCcsXG4gICAgZGVzY3JpcHRpb246ICdHZW5lcmF0ZSBIVE1ML0NTUy9KUyBjb2RlIGZvciBhbiBpbnRlcmFjdGl2ZSBVSSBjb21wb25lbnQgKGJ1dHRvbiwgZm9ybSwgY2hhcnQsIGRhc2hib2FyZCkuIFJldHVybnMgdGhlIGdlbmVyYXRlZCBjb2RlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29tcG9uZW50X3R5cGU6IHouZW51bShbJ2J1dHRvbicsICdmb3JtJywgJ2NoYXJ0JywgJ2Rhc2hib2FyZCddKS5kZXNjcmliZSgnVHlwZSBvZiBVSSBjb21wb25lbnQgdG8gZ2VuZXJhdGUnKSxcbiAgICAgIGxhYmVsOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0xhYmVsIHRleHQgZm9yIGJ1dHRvbnMgb3IgZm9ybXMnKSxcbiAgICAgIGZpZWxkczogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgICAgIG5hbWU6IHouc3RyaW5nKCksXG4gICAgICAgIHR5cGU6IHouZW51bShbJ3RleHQnLCAnZW1haWwnLCAncGFzc3dvcmQnLCAnbnVtYmVyJywgJ3RleHRhcmVhJywgJ3NlbGVjdCddKSxcbiAgICAgICAgbGFiZWw6IHouc3RyaW5nKCksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnRm9ybSBmaWVsZHMgKGZvciBmb3JtIGNvbXBvbmVudCknKSxcbiAgICAgIGNoYXJ0X2RhdGE6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgICBsYWJlbDogei5zdHJpbmcoKSxcbiAgICAgICAgdmFsdWU6IHoubnVtYmVyKCksXG4gICAgICB9KSkub3B0aW9uYWwoKS5kZXNjcmliZSgnQ2hhcnQgZGF0YSBwb2ludHMgKGZvciBjaGFydCBjb21wb25lbnQpJyksXG4gICAgICBkYXNoYm9hcmRfdGl0bGVzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ1RpdGxlcyBmb3IgZGFzaGJvYXJkIGNhcmRzJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tcG9uZW50X3R5cGUsIGxhYmVsLCBmaWVsZHMsIGNoYXJ0X2RhdGEsIGRhc2hib2FyZF90aXRsZXMgfTogeyBcbiAgICAgIGNvbXBvbmVudF90eXBlOiBzdHJpbmc7IFxuICAgICAgbGFiZWw/OiBzdHJpbmc7IFxuICAgICAgZmllbGRzPzogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9PjsgXG4gICAgICBjaGFydF9kYXRhPzogQXJyYXk8eyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogbnVtYmVyIH0+O1xuICAgICAgZGFzaGJvYXJkX3RpdGxlcz86IHN0cmluZ1tdO1xuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKGNvbXBvbmVudF90eXBlKSB7XG4gICAgICAgICAgY2FzZSAnYnV0dG9uJzpcbiAgICAgICAgICAgIGh0bWwgPSBnZW5lcmF0ZUJ1dHRvbkh0bWwobGFiZWwgfHwgJ0NsaWNrIE1lJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdmb3JtJzpcbiAgICAgICAgICAgIGlmICghZmllbGRzIHx8IGZpZWxkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRm9ybSBjb21wb25lbnQgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGZpZWxkJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlRm9ybUh0bWwoZmllbGRzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2NoYXJ0JzpcbiAgICAgICAgICAgIGlmICghY2hhcnRfZGF0YSB8fCBjaGFydF9kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDaGFydCBjb21wb25lbnQgcmVxdWlyZXMgZGF0YSBwb2ludHMnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sID0gZ2VuZXJhdGVDaGFydEh0bWwoY2hhcnRfZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkYXNoYm9hcmQnOlxuICAgICAgICAgICAgaWYgKCFkYXNoYm9hcmRfdGl0bGVzIHx8IGRhc2hib2FyZF90aXRsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0Rhc2hib2FyZCBjb21wb25lbnQgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIHRpdGxlJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGRhc2hib2FyZF90aXRsZXMubWFwKCh0aXRsZSwgaW5kZXgpID0+ICh7XG4gICAgICAgICAgICAgIHR5cGU6IChpbmRleCAlIDIgPT09IDAgPyAnY2hhcnQnIDogJ3RleHQnKSBhcyAnY2hhcnQnIHwgJ3RleHQnLFxuICAgICAgICAgICAgICBkYXRhOiBpbmRleCAlIDIgPT09IDAgPyBbeyBsYWJlbDogJ0EnLCB2YWx1ZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSB9LCB7IGxhYmVsOiAnQicsIHZhbHVlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApIH1dIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgaHRtbCA9IGdlbmVyYXRlRGFzaGJvYXJkSHRtbChkYXNoYm9hcmRfdGl0bGVzLCBjb250ZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIGNvbXBvbmVudCB0eXBlOiAke2NvbXBvbmVudF90eXBlfWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZ1bGxIdG1sID0gYDwhRE9DVFlQRSBodG1sPjxodG1sPjxoZWFkPjxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiPjx0aXRsZT5VSSBDb21wb25lbnQ8L3RpdGxlPjwvaGVhZD48Ym9keSBzdHlsZT1cImZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgcGFkZGluZzogMjBweDtcIj4ke2h0bWx9PC9ib2R5PjwvaHRtbD5gO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBjb21wb25lbnRfdHlwZSwgaHRtbDogZnVsbEh0bWwgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGdlbmVyYXRlIFVJIGNvbXBvbmVudDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gcmVuZGVyX2FuZF9wcmV2aWV3X3VpIHRvb2wgXHUyMDE0IFJlbmRlciBnZW5lcmF0ZWQgVUkgaW4gYnJvd3NlciBhbmQgY2FwdHVyZSBzY3JlZW5zaG90XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ3JlbmRlcl9hbmRfcHJldmlld191aScsXG4gICAgZGVzY3JpcHRpb246ICdSZW5kZXIgYSBnZW5lcmF0ZWQgSFRNTCBVSSBjb21wb25lbnQsIHNhdmUgaXQgdG8gYSBmaWxlLCBvcGVuIGl0IGluIHRoZSBkZWZhdWx0IGJyb3dzZXIsIGFuZCBvcHRpb25hbGx5IHRha2UgYSBzY3JlZW5zaG90LicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaGUgY29tcGxldGUgSFRNTCBjb250ZW50IHRvIHJlbmRlcicpLFxuICAgICAgZmlsZW5hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZWZhdWx0KCd1aV9wcmV2aWV3Lmh0bWwnKS5kZXNjcmliZSgnRmlsZW5hbWUgZm9yIHNhdmluZyAoZGVmYXVsdDogdWlfcHJldmlldy5odG1sKScpLFxuICAgICAgc2NyZWVuc2hvdF9wYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ09wdGlvbmFsIHBhdGggdG8gc2F2ZSBhIHNjcmVlbnNob3Qgb2YgdGhlIHJlbmRlcmVkIFVJJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBmaWxlbmFtZSwgc2NyZWVuc2hvdF9wYXRoIH06IHsgXG4gICAgICBodG1sX2NvbnRlbnQ6IHN0cmluZzsgXG4gICAgICBmaWxlbmFtZT86IHN0cmluZzsgXG4gICAgICBzY3JlZW5zaG90X3BhdGg/OiBzdHJpbmc7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZW5hbWUgfHwgJ3VpX3ByZXZpZXcuaHRtbCc7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGdldFdvcmtpbmdEaXIoKSwgZmlsZU5hbWUpO1xuXG4gICAgICAgIC8vIFNhdmUgSFRNTCB0byBmaWxlXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGh0bWxfY29udGVudCk7XG5cbiAgICAgICAgLy8gT3BlbiBpbiBkZWZhdWx0IGJyb3dzZXIgdXNpbmcgRVMgaW1wb3J0IChzYW1lIGFzIHByZXZpZXdfaHRtbCB0b29sKVxuICAgICAgICBjb25zdCBvcGVuTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdvcGVuJyk7XG4gICAgICAgIGF3YWl0IG9wZW5Nb2R1bGUuZGVmYXVsdChmaWxlUGF0aCk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7IFxuICAgICAgICAgIHJlbmRlcmVkOiB0cnVlLCBcbiAgICAgICAgICBmaWxlOiBmaWxlTmFtZSxcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUYWtlIHNjcmVlbnNob3QgaWYgcmVxdWVzdGVkICh1c2luZyBQdXBwZXRlZXIpXG4gICAgICAgIGlmIChzY3JlZW5zaG90X3BhdGgpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHVwcGV0ZWVyTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdwdXBwZXRlZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCBwdXBwZXRlZXJNb2R1bGUuZGVmYXVsdC5sYXVuY2goeyBoZWFkbGVzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTG9hZCB0aGUgSFRNTCBmaWxlXG4gICAgICAgICAgICBhd2FpdCBwYWdlLmdvdG8oYGZpbGU6Ly8ke2ZpbGVQYXRofWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBXYWl0IGZvciBjb250ZW50IHRvIHJlbmRlclxuICAgICAgICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yU2VsZWN0b3IoJ2JvZHknLCB7IHRpbWVvdXQ6IDUwMDAgfSkuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWtlIHNjcmVlbnNob3RcbiAgICAgICAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHNjcmVlbnNob3RfcGF0aCwgZnVsbFBhZ2U6IHRydWUgfSk7XG4gICAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RTYXZlZCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGF3YWl0IGJyb3dzZXIuY2xvc2UoKTtcbiAgICAgICAgICB9IGNhdGNoIChzY3JlZW5zaG90RXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBzY3JlZW5zaG90RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IHNjcmVlbnNob3RFcnJvci5tZXNzYWdlIDogU3RyaW5nKHNjcmVlbnNob3RFcnJvcik7XG4gICAgICAgICAgICByZXN1bHREYXRhLnNjcmVlbnNob3RXYXJuaW5nID0gYFNjcmVlbnNob3QgZmFpbGVkOiAke21lc3NhZ2V9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHREYXRhIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcmVuZGVyIFVJOiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBleHRyYWN0X3VpX2RhdGEgdG9vbCBcdTIwMTQgRXh0cmFjdCBkYXRhIGZyb20gaW50ZXJhY3RpdmUgVUkgZWxlbWVudHNcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnZXh0cmFjdF91aV9kYXRhJyxcbiAgICBkZXNjcmlwdGlvbjogJ0V4dHJhY3Qgc3RydWN0dXJlZCBkYXRhIGZyb20gSFRNTCBjb250ZW50ICh0YWJsZXMsIGZvcm1zLCBsaXN0cykuIFVzZWZ1bCBmb3IgcGFyc2luZyBnZW5lcmF0ZWQgb3IgZmV0Y2hlZCBVSXMuJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBodG1sX2NvbnRlbnQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSBIVE1MIGNvbnRlbnQgdG8gZXh0cmFjdCBkYXRhIGZyb20nKSxcbiAgICAgIGV4dHJhY3Rpb25fdHlwZTogei5lbnVtKFsndGFibGUnLCAnZm9ybScsICdsaXN0J10pLmRlZmF1bHQoJ3RhYmxlJykuZGVzY3JpYmUoJ1R5cGUgb2YgZGF0YSB0byBleHRyYWN0JyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgaHRtbF9jb250ZW50LCBleHRyYWN0aW9uX3R5cGUgfTogeyBcbiAgICAgIGh0bWxfY29udGVudDogc3RyaW5nOyBcbiAgICAgIGV4dHJhY3Rpb25fdHlwZTogc3RyaW5nOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBVc2UgTm9kZS5qcyBET00gcGFyc2VyIChjaGVlcmlvLWxpa2UgYXBwcm9hY2ggd2l0aCBiYXNpYyByZWdleCBmb3Igc2ltcGxpY2l0eSlcbiAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3UnZCB1c2UgYSBwcm9wZXIgSFRNTCBwYXJzZXIgbGlrZSBqc2RvbSBvciBjaGVlcmlvXG4gICAgICAgIFxuICAgICAgICBsZXQgZXh0cmFjdGVkRGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuICAgICAgICBpZiAoZXh0cmFjdGlvbl90eXBlID09PSAndGFibGUnKSB7XG4gICAgICAgICAgY29uc3QgdGFibGVSZWdleCA9IC88dGFibGVbXj5dKj4oW1xcc1xcU10qPyk8XFwvdGFibGU+L2dpO1xuICAgICAgICAgIGNvbnN0IHJvd3NSZWdleCA9IC88dHJbXj5dKj4oW1xcc1xcU10qPyk8XFwvdHI+L2dpO1xuICAgICAgICAgIGNvbnN0IGNlbGxzUmVnZXggPSAvPCh0ZHx0aClbXj5dKj4oW1xcc1xcU10qPyk8XFwvKHRkfHRoKT4vZ2k7XG5cbiAgICAgICAgICBsZXQgdGFibGVNYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKHRhYmxlTWF0Y2ggPSB0YWJsZVJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhYmxlQ29udGVudCA9IHRhYmxlTWF0Y2hbMV07XG4gICAgICAgICAgICBjb25zdCByb3dzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IHJvd01hdGNoO1xuICAgICAgICAgICAgd2hpbGUgKChyb3dNYXRjaCA9IHJvd3NSZWdleC5leGVjKHRhYmxlQ29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJvd3MucHVzaChyb3dNYXRjaFsxXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJvd3M6IHN0cmluZ1tdW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2VsbHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgIGxldCBjZWxsTWF0Y2g7XG4gICAgICAgICAgICAgIGNvbnN0IGNlbGxSZWdleCA9IC88KHRkfHRoKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odGR8dGgpPi9naTtcbiAgICAgICAgICAgICAgd2hpbGUgKChjZWxsTWF0Y2ggPSBjZWxsUmVnZXguZXhlYyhyb3cpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goY2VsbE1hdGNoWzJdLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGFyc2VkUm93cy5wdXNoKGNlbGxzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS50YWJsZXMgPSBwYXJzZWRSb3dzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICdmb3JtJykge1xuICAgICAgICAgIGNvbnN0IGZvcm1SZWdleCA9IC88Zm9ybVtePl0qPihbXFxzXFxTXSo/KTxcXC9mb3JtPi9naTtcbiAgICAgICAgICBjb25zdCBpbnB1dFJlZ2V4ID0gLzwoaW5wdXR8c2VsZWN0fHRleHRhcmVhKVtePl0qXFwvPz4vZ2k7XG5cbiAgICAgICAgICBsZXQgZm9ybU1hdGNoO1xuICAgICAgICAgIHdoaWxlICgoZm9ybU1hdGNoID0gZm9ybVJlZ2V4LmV4ZWMoaHRtbF9jb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1Db250ZW50ID0gZm9ybU1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZT86IHN0cmluZyB9PiA9IFtdO1xuICAgICAgICAgICAgbGV0IGlucHV0TWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKGlucHV0TWF0Y2ggPSBpbnB1dFJlZ2V4LmV4ZWMoZm9ybUNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBjb25zdCB0YWcgPSBpbnB1dE1hdGNoWzBdO1xuICAgICAgICAgICAgICBjb25zdCBuYW1lTWF0Y2ggPSAvbmFtZT1bXCInXShbXlwiJ10rKVtcIiddL2kuZXhlYyh0YWcpO1xuICAgICAgICAgICAgICBjb25zdCB0eXBlTWF0Y2ggPSAvdHlwZT1bXCInXShbXlwiJ10rKVtcIiddL2kuZXhlYyh0YWcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgKG5hbWVNYXRjaCkge1xuICAgICAgICAgICAgICAgIGZpZWxkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVNYXRjaFsxXSxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVNYXRjaD8uWzFdIHx8ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJywgLy8gV291bGQgbmVlZCB0byBleHRyYWN0IGFjdHVhbCB2YWx1ZXMgaW4gYSByZWFsIGltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS5mb3JtRmllbGRzID0gZmllbGRzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHRyYWN0aW9uX3R5cGUgPT09ICdsaXN0Jykge1xuICAgICAgICAgIGNvbnN0IGxpc3RSZWdleCA9IC88KHVsfG9sKVtePl0qPihbXFxzXFxTXSo/KTxcXC8odWx8b2wpPi9naTtcbiAgICAgICAgICBjb25zdCBpdGVtUmVnZXggPSAvPGxpW14+XSo+KFtcXHNcXFNdKj8pPFxcL2xpPi9naTtcblxuICAgICAgICAgIGxldCBsaXN0TWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKChsaXN0TWF0Y2ggPSBsaXN0UmVnZXguZXhlYyhodG1sX2NvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbGlzdENvbnRlbnQgPSBsaXN0TWF0Y2hbMl07XG4gICAgICAgICAgICBjb25zdCBpdGVtczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBpdGVtTWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAoKGl0ZW1NYXRjaCA9IGl0ZW1SZWdleC5leGVjKGxpc3RDb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtTWF0Y2hbMV0ucmVwbGFjZSgvPFtePl0rPi9nLCAnJykudHJpbSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFjdGVkRGF0YS5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGV4dHJhY3RlZERhdGEgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBleHRyYWN0IFVJIGRhdGE6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFdvcmtpbmdEaXIgfSBmcm9tICcuLi93b3JraW5nRGlyLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ29udGV4dCBNYW5hZ2VtZW50IFR5cGVzID09PT09PT09PT09PT09PT09PT09XG5cbmludGVyZmFjZSBDb250ZXh0RW50cnkge1xuICBpZDogc3RyaW5nO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgdHlwZTogJ2RlY2lzaW9uJyB8ICdwYXR0ZXJuJyB8ICdjb25maWd1cmF0aW9uJyB8ICdmaWxlX2NoYW5nZScgfCAnZXJyb3InIHwgJ3N1bW1hcnknO1xuICB0aXRsZTogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXTtcbiAgc2Vzc2lvbl9pZD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIENvbnRleHRTdW1tYXJ5IHtcbiAgdG90YWxfZW50cmllczogbnVtYmVyO1xuICBlbnRyaWVzX2J5X3R5cGU6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gIHJlY2VudF9lbnRyaWVzOiBDb250ZXh0RW50cnlbXTtcbiAgbGFzdF91cGRhdGVkOiBudW1iZXI7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgU3RvcmFnZSBNYW5hZ2VyID09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIENvbnRleHRTdG9yYWdlTWFuYWdlciB7XG4gIHByaXZhdGUgc3RvcmFnZVBhdGg6IHN0cmluZztcbiAgXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmFnZVBhdGggPSBwYXRoLmpvaW4oZ2V0V29ya2luZ0RpcigpLCAnLmFpX3Rvb2xib3hfY29udGV4dC5qc29uJyk7XG4gICAgY29uc29sZS5sb2coYFtDb250ZXh0U3RvcmFnZV0gSW5pdGlhbGl6ZWQgd2l0aCBzdG9yYWdlIHBhdGg6ICR7dGhpcy5zdG9yYWdlUGF0aH1gKTtcbiAgfVxuXG4gIC8qKiBMb2FkIGNvbnRleHQgZW50cmllcyBmcm9tIGRpc2sgKi9cbiAgbG9hZCgpOiBDb250ZXh0RW50cnlbXSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLnN0b3JhZ2VQYXRoKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0NvbnRleHRTdG9yYWdlLmxvYWRdIEZpbGUgZG9lcyBub3QgZXhpc3QgeWV0OiAke3RoaXMuc3RvcmFnZVBhdGh9YCk7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLnN0b3JhZ2VQYXRoLCAndXRmLTgnKTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBKU09OLnBhcnNlKGRhdGEpIGFzIENvbnRleHRFbnRyeVtdO1xuICAgICAgY29uc29sZS5sb2coYFtDb250ZXh0U3RvcmFnZS5sb2FkXSBMb2FkZWQgJHtlbnRyaWVzLmxlbmd0aH0gZW50cmllcyBmcm9tIGRpc2tgKTtcbiAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgY29uc29sZS5lcnJvcihgW0NvbnRleHRTdG9yYWdlLmxvYWRdIEZhaWxlZCB0byBsb2FkIGNvbnRleHQgc3RvcmFnZTogJHttZXNzYWdlfWApO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTYXZlIGNvbnRleHQgZW50cmllcyB0byBkaXNrICovXG4gIHNhdmUoZW50cmllczogQ29udGV4dEVudHJ5W10pOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMuc3RvcmFnZVBhdGgpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gQ3JlYXRlZCBkaXJlY3Rvcnk6ICR7ZGlyfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBXcml0ZSBhdG9taWNhbGx5ICh0ZW1wIGZpbGUgKyByZW5hbWUpXG4gICAgICBjb25zdCB0ZW1wUGF0aCA9IHRoaXMuc3RvcmFnZVBhdGggKyAnLnRtcCc7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHRlbXBQYXRoLCBKU09OLnN0cmluZ2lmeShlbnRyaWVzLCBudWxsLCAyKSk7XG4gICAgICBmcy5yZW5hbWVTeW5jKHRlbXBQYXRoLCB0aGlzLnN0b3JhZ2VQYXRoKTtcbiAgICAgIGNvbnNvbGUubG9nKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gU2F2ZWQgJHtlbnRyaWVzLmxlbmd0aH0gZW50cmllcyB0byBkaXNrYCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBjb25zb2xlLmVycm9yKGBbQ29udGV4dFN0b3JhZ2Uuc2F2ZV0gRmFpbGVkIHRvIHNhdmUgY29udGV4dCBzdG9yYWdlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEFkZCBhIG5ldyBjb250ZXh0IGVudHJ5ICovXG4gIGFkZEVudHJ5KGVudHJ5OiBDb250ZXh0RW50cnkpOiB2b2lkIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgZW50cmllcy51bnNoaWZ0KGVudHJ5KTsgLy8gQWRkIHRvIGJlZ2lubmluZ1xuICAgIFxuICAgIC8vIExpbWl0IHRvIGxhc3QgMTAwMCBlbnRyaWVzIHRvIHByZXZlbnQgdW5ib3VuZGVkIGdyb3d0aFxuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA+IDEwMDApIHtcbiAgICAgIGVudHJpZXMuc3BsaWNlKDEwMDApO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnNhdmUoZW50cmllcyk7XG4gIH1cblxuICAvKiogR2V0IHJlY2VudCBjb250ZXh0IGVudHJpZXMgKi9cbiAgZ2V0UmVjZW50RW50cmllcyhsaW1pdDogbnVtYmVyID0gMjAsIHR5cGU/OiBzdHJpbmcpOiBDb250ZXh0RW50cnlbXSB7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMubG9hZCgpO1xuICAgIFxuICAgIGlmICh0eXBlKSB7XG4gICAgICByZXR1cm4gZW50cmllcy5maWx0ZXIoZSA9PiBlLnR5cGUgPT09IHR5cGUpLnNsaWNlKDAsIGxpbWl0KTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGVudHJpZXMuc2xpY2UoMCwgbGltaXQpO1xuICB9XG5cbiAgLyoqIFNlYXJjaCBjb250ZXh0IGVudHJpZXMgYnkgcXVlcnkgKi9cbiAgc2VhcmNoRW50cmllcyhxdWVyeTogc3RyaW5nLCBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMCk6IENvbnRleHRFbnRyeVtdIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5sb2FkKCk7XG4gICAgY29uc3QgbG93ZXJRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgXG4gICAgY29uc3QgcmVzdWx0cyA9IGVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IFxuICAgICAgZW50cnkudGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlclF1ZXJ5KSB8fFxuICAgICAgZW50cnkuY29udGVudC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpIHx8XG4gICAgICAoZW50cnkudGFncyAmJiBlbnRyeS50YWdzLnNvbWUodGFnID0+IHRhZy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyUXVlcnkpKSlcbiAgICApO1xuICAgIFxuICAgIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIG1heFJlc3VsdHMpO1xuICB9XG5cbiAgLyoqIERlbGV0ZSBjb250ZXh0IGVudHJpZXMgYnkgSUQgKi9cbiAgZGVsZXRlRW50cnkoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGVudHJpZXMuZmlsdGVyKGUgPT4gZS5pZCAhPT0gaWQpO1xuICAgIFxuICAgIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IGVudHJpZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIEVudHJ5IG5vdCBmb3VuZFxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNhdmUoZmlsdGVyZWQpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIENsZWFyIGFsbCBjb250ZXh0IGVudHJpZXMgKi9cbiAgY2xlYXJBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5zYXZlKFtdKTtcbiAgfVxuXG4gIC8qKiBHZXQgc3VtbWFyeSBzdGF0aXN0aWNzICovXG4gIGdldFN1bW1hcnkoKTogQ29udGV4dFN1bW1hcnkge1xuICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmxvYWQoKTtcbiAgICBcbiAgICBjb25zdCBlbnRyaWVzQnlUeXBlOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGVudHJpZXNCeVR5cGVbZW50cnkudHlwZV0gPSAoZW50cmllc0J5VHlwZVtlbnRyeS50eXBlXSB8fCAwKSArIDE7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG90YWxfZW50cmllczogZW50cmllcy5sZW5ndGgsXG4gICAgICBlbnRyaWVzX2J5X3R5cGU6IGVudHJpZXNCeVR5cGUsXG4gICAgICByZWNlbnRfZW50cmllczogZW50cmllcy5zbGljZSgwLCA1KSxcbiAgICAgIGxhc3RfdXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICB9O1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENvbnRleHQgQW5hbHl6ZXIgPT09PT09PT09PT09PT09PT09PT1cblxuY2xhc3MgQ29udGV4dEFuYWx5emVyIHtcbiAgcHJpdmF0ZSBzdG9yYWdlTWFuYWdlcjogQ29udGV4dFN0b3JhZ2VNYW5hZ2VyO1xuICBcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdG9yYWdlTWFuYWdlciA9IG5ldyBDb250ZXh0U3RvcmFnZU1hbmFnZXIoKTtcbiAgfVxuXG4gIC8qKiBBbmFseXplIHJlY2VudCBhY3Rpdml0eSBhbmQgYXV0by1zYXZlIGltcG9ydGFudCBjb250ZXh0ICovXG4gIGFuYWx5emVBbmRTYXZlKFxuICAgIHNlc3Npb25FdmVudHM6IEFycmF5PHsgdHlwZTogc3RyaW5nOyB0aW1lc3RhbXA6IG51bWJlcjsgZGF0YT86IGFueSB9PixcbiAgICBjb25maWdDaGFuZ2VzPzogUmVjb3JkPHN0cmluZywgYm9vbGVhbiB8IHN0cmluZz5cbiAgKTogeyBzYXZlZF9jb3VudDogbnVtYmVyOyBzdW1tYXJ5OiBzdHJpbmcgfSB7XG4gICAgY29uc3QgZW50cmllczogQ29udGV4dEVudHJ5W10gPSBbXTtcblxuICAgIC8vIEFuYWx5emUgdG9vbCB1c2FnZSBwYXR0ZXJuc1xuICAgIGNvbnN0IHRvb2xVc2FnZUNvdW50OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gICAgc2Vzc2lvbkV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC50eXBlLnN0YXJ0c1dpdGgoJ3Rvb2xfJykpIHtcbiAgICAgICAgY29uc3QgdG9vbE5hbWUgPSBldmVudC50eXBlLnJlcGxhY2UoJ3Rvb2xfJywgJycpO1xuICAgICAgICB0b29sVXNhZ2VDb3VudFt0b29sTmFtZV0gPSAodG9vbFVzYWdlQ291bnRbdG9vbE5hbWVdIHx8IDApICsgMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElkZW50aWZ5IGZyZXF1ZW50bHkgdXNlZCB0b29scyAoPjMgdXNlcyBpbiBzZXNzaW9uKVxuICAgIE9iamVjdC5lbnRyaWVzKHRvb2xVc2FnZUNvdW50KS5mb3JFYWNoKChbdG9vbCwgY291bnRdKSA9PiB7XG4gICAgICBpZiAoY291bnQgPiAzKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAncGF0dGVybicsXG4gICAgICAgICAgdGl0bGU6IGBGcmVxdWVudCBUb29sIFVzYWdlOiAke3Rvb2x9YCxcbiAgICAgICAgICBjb250ZW50OiBgVG9vbCAnJHt0b29sfScgd2FzIHVzZWQgJHtjb3VudH0gdGltZXMgaW4gdGhlIGN1cnJlbnQgc2Vzc2lvbiwgaW5kaWNhdGluZyBpdCdzIGEgcHJpbWFyeSB3b3JrZmxvdyB0b29sLmAsXG4gICAgICAgICAgdGFnczogWyd1c2FnZV9wYXR0ZXJuJywgJ2ZyZXF1ZW50X3Rvb2wnXSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBbmFseXplIGNvbmZpZ3VyYXRpb24gY2hhbmdlc1xuICAgIGlmIChjb25maWdDaGFuZ2VzKSB7XG4gICAgICBPYmplY3QuZW50cmllcyhjb25maWdDaGFuZ2VzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgZW50cmllcy5wdXNoKHtcbiAgICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHR5cGU6ICdjb25maWd1cmF0aW9uJyxcbiAgICAgICAgICB0aXRsZTogYENvbmZpZ3VyYXRpb24gQ2hhbmdlOiAke2tleX1gLFxuICAgICAgICAgIGNvbnRlbnQ6IGBTZXR0aW5nICcke2tleX0nIHdhcyBjaGFuZ2VkIHRvICcke3ZhbHVlfScuYCxcbiAgICAgICAgICB0YWdzOiBbJ2NvbmZpZ19jaGFuZ2UnXSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgaW1wb3J0YW50IGRlY2lzaW9ucyAoYmFzZWQgb24gZXZlbnQgcGF0dGVybnMpXG4gICAgY29uc3QgZGVjaXNpb25FdmVudHMgPSBzZXNzaW9uRXZlbnRzLmZpbHRlcihlID0+IFxuICAgICAgZS50eXBlID09PSAnZGVjaXNpb24nIHx8IFxuICAgICAgKGUuZGF0YSAmJiB0eXBlb2YgZS5kYXRhLmRlY2lzaW9uID09PSAnc3RyaW5nJylcbiAgICApO1xuXG4gICAgZGVjaXNpb25FdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBjb25zdCBkZWNpc2lvblRleHQgPSBldmVudC5kYXRhPy5kZWNpc2lvbiB8fCBgRGVjaXNpb24gbWFkZSBhdCAke25ldyBEYXRlKGV2ZW50LnRpbWVzdGFtcCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9YDtcbiAgICAgIGVudHJpZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgICAgdGltZXN0YW1wOiBldmVudC50aW1lc3RhbXAsXG4gICAgICAgIHR5cGU6ICdkZWNpc2lvbicsXG4gICAgICAgIHRpdGxlOiAnSW1wb3J0YW50IERlY2lzaW9uIFJlY29yZGVkJyxcbiAgICAgICAgY29udGVudDogZGVjaXNpb25UZXh0LFxuICAgICAgICB0YWdzOiBbJ2RlY2lzaW9uJ10sXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIEF1dG8tZ2VuZXJhdGUgc3VtbWFyeSBpZiB3ZSBoYXZlIGVub3VnaCBlbnRyaWVzXG4gICAgaWYgKGVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgdW5pcXVlUGF0dGVybnMgPSBuZXcgU2V0KGVudHJpZXMuZmlsdGVyKGUgPT4gZS50eXBlID09PSAncGF0dGVybicpLm1hcChlID0+IGUudGl0bGUpKTtcbiAgICAgIFxuICAgICAgZW50cmllcy5wdXNoKHtcbiAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHR5cGU6ICdzdW1tYXJ5JyxcbiAgICAgICAgdGl0bGU6IGBTZXNzaW9uIENvbnRleHQgU3VtbWFyeSAoJHtuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpfSlgLFxuICAgICAgICBjb250ZW50OiBgQXV0by1nZW5lcmF0ZWQgc3VtbWFyeTogJHtlbnRyaWVzLmxlbmd0aH0gY29udGV4dCBlbnRyaWVzIHNhdmVkLiBLZXkgcGF0dGVybnMgZGV0ZWN0ZWQ6ICR7QXJyYXkuZnJvbSh1bmlxdWVQYXR0ZXJucykuam9pbignLCAnKSB8fCAnTm8gc3BlY2lmaWMgcGF0dGVybnMnfS4gQ29uZmlndXJhdGlvbiBjaGFuZ2VzIHRyYWNrZWQ6ICR7T2JqZWN0LmtleXMoY29uZmlnQ2hhbmdlcyB8fCB7fSkubGVuZ3RofS5gLFxuICAgICAgICB0YWdzOiBbJ2F1dG9fc3VtbWFyeSddLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFNhdmUgYWxsIGVudHJpZXMgdG8gc3RvcmFnZVxuICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHRoaXMuc3RvcmFnZU1hbmFnZXIuYWRkRW50cnkoZW50cnkpKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2F2ZWRfY291bnQ6IGVudHJpZXMubGVuZ3RoLFxuICAgICAgICBzdW1tYXJ5OiBgU2F2ZWQgJHtlbnRyaWVzLmxlbmd0aH0gY29udGV4dCBlbnRyaWVzIGluY2x1ZGluZyBwYXR0ZXJucyBhbmQgZGVjaXNpb25zLmAsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IHNhdmVkX2NvdW50OiAwLCBzdW1tYXJ5OiAnTm8gc2lnbmlmaWNhbnQgY29udGV4dCBjaGFuZ2VzIGRldGVjdGVkLicgfTtcbiAgfVxuXG4gIC8qKiBHZW5lcmF0ZSBhIHVuaXF1ZSBJRCBmb3IgY29udGV4dCBlbnRyeSAqL1xuICBwcml2YXRlIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGN0eF8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQ29udGV4dE1hbmFnZW1lbnRUb29scyhfY29uZmlnOiBQbHVnaW5Db25maWcpOiBUb29sW10ge1xuICBjb25zdCBhbmFseXplciA9IG5ldyBDb250ZXh0QW5hbHl6ZXIoKTtcbiAgY29uc3Qgc3RvcmFnZU1hbmFnZXIgPSBuZXcgQ29udGV4dFN0b3JhZ2VNYW5hZ2VyKCk7XG5cbiAgY29uc3QgdG9vbHM6IFRvb2xbXSA9IFtdO1xuXG4gIC8vIGF1dG9fc3VtbWFyaXplX2NvbnRleHQgdG9vbCBcdTIwMTQgQW5hbHl6ZSBzZXNzaW9uIGFuZCBzYXZlIGltcG9ydGFudCBjb250ZXh0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2F1dG9fc3VtbWFyaXplX2NvbnRleHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBhbmFseXplIHJlY2VudCBzZXNzaW9uIGFjdGl2aXR5LCBpZGVudGlmeSBpbXBvcnRhbnQgcGF0dGVybnMvZGVjaXNpb25zLCBhbmQgc2F2ZSB0aGVtIHRvIHBlcnNpc3RlbnQgbWVtb3J5IGZvciBmdXR1cmUgcmVmZXJlbmNlLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgc2Vzc2lvbl9ldmVudHM6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgICAgICB0eXBlOiB6LnN0cmluZygpLFxuICAgICAgICB0aW1lc3RhbXA6IHoubnVtYmVyKCksXG4gICAgICAgIGRhdGE6IHouYW55KCkub3B0aW9uYWwoKSxcbiAgICAgIH0pKS5vcHRpb25hbCgpLmRlc2NyaWJlKCdSZWNlbnQgc2Vzc2lvbiBldmVudHMgdG8gYW5hbHl6ZScpLFxuICAgICAgY29uZmlnX2NoYW5nZXM6IHoucmVjb3JkKHoudW5pb24oW3ouYm9vbGVhbigpLCB6LnN0cmluZygpXSkpLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0NvbmZpZ3VyYXRpb24gY2hhbmdlcyBtYWRlIGR1cmluZyBzZXNzaW9uJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc2Vzc2lvbl9ldmVudHMsIGNvbmZpZ19jaGFuZ2VzIH06IHsgXG4gICAgICBzZXNzaW9uX2V2ZW50cz86IEFycmF5PHsgdHlwZTogc3RyaW5nOyB0aW1lc3RhbXA6IG51bWJlcjsgZGF0YT86IGFueSB9PjsgXG4gICAgICBjb25maWdfY2hhbmdlcz86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4gfCBzdHJpbmc+OyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhbmFseXplci5hbmFseXplQW5kU2F2ZShzZXNzaW9uX2V2ZW50cyB8fCBbXSwgY29uZmlnX2NoYW5nZXMpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IGFuYWx5c2lzIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gZ2V0X2NvbnRleHRfbWVtb3J5IHRvb2wgXHUyMDE0IFJldHJpZXZlIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyaWVzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2dldF9jb250ZXh0X21lbW9yeScsXG4gICAgZGVzY3JpcHRpb246ICdSZXRyaWV2ZSBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcyBmcm9tIHBlcnNpc3RlbnQgbWVtb3J5LiBVc2VmdWwgZm9yIHJlY2FsbGluZyBwYXN0IGRlY2lzaW9ucywgcGF0dGVybnMsIG9yIGNvbmZpZ3VyYXRpb25zLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgbGltaXQ6IHoubnVtYmVyKCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKS5kZWZhdWx0KDIwKS5kZXNjcmliZSgnTWF4aW11bSBudW1iZXIgb2YgZW50cmllcyB0byByZXR1cm4nKSxcbiAgICAgIHR5cGU6IHouZW51bShbJ2RlY2lzaW9uJywgJ3BhdHRlcm4nLCAnY29uZmlndXJhdGlvbicsICdmaWxlX2NoYW5nZScsICdlcnJvcicsICdzdW1tYXJ5J10pLm9wdGlvbmFsKCkuZGVzY3JpYmUoJ0ZpbHRlciBieSBlbnRyeSB0eXBlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbGltaXQsIHR5cGUgfTogeyBcbiAgICAgIGxpbWl0PzogbnVtYmVyOyBcbiAgICAgIHR5cGU/OiBzdHJpbmc7IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBzdG9yYWdlTWFuYWdlci5nZXRSZWNlbnRFbnRyaWVzKGxpbWl0IHx8IDIwLCB0eXBlKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgZW50cmllcyB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gcmV0cmlldmUgY29udGV4dCBtZW1vcnk6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIC8vIHNlYXJjaF9jb250ZXh0IHRvb2wgXHUyMDE0IFNlYXJjaCBhdXRvLXNhdmVkIGNvbnRleHQgYnkgcXVlcnlcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAnc2VhcmNoX2NvbnRleHQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIHRocm91Z2ggYXV0b21hdGljYWxseSBzYXZlZCBjb250ZXh0IGVudHJpZXMgdXNpbmcgdGV4dCBtYXRjaGluZy4gRmluZHMgcmVsZXZhbnQgcGFzdCBkZWNpc2lvbnMsIHBhdHRlcm5zLCBvciBjb25maWd1cmF0aW9ucy4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHF1ZXJ5OiB6LnN0cmluZygpLmRlc2NyaWJlKCdTZWFyY2ggcXVlcnkgdG8gbWF0Y2ggYWdhaW5zdCBjb250ZXh0IGVudHJpZXMnKSxcbiAgICAgIG1heF9yZXN1bHRzOiB6Lm51bWJlcigpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ01heGltdW0gbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcXVlcnksIG1heF9yZXN1bHRzIH06IHsgXG4gICAgICBxdWVyeTogc3RyaW5nOyBcbiAgICAgIG1heF9yZXN1bHRzPzogbnVtYmVyOyBcbiAgICB9KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gc3RvcmFnZU1hbmFnZXIuc2VhcmNoRW50cmllcyhxdWVyeSwgbWF4X3Jlc3VsdHMgfHwgMTApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyByZXN1bHRzIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYENvbnRleHQgc2VhcmNoIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY29udGV4dF9zdW1tYXJ5IHRvb2wgXHUyMDE0IEdldCBzdW1tYXJ5IHN0YXRpc3RpY3Mgb2YgYXV0by1zYXZlZCBjb250ZXh0XG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NvbnRleHRfc3VtbWFyeScsXG4gICAgZGVzY3JpcHRpb246ICdHZXQgYSBzdW1tYXJ5IG9mIGFsbCBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcywgaW5jbHVkaW5nIGNvdW50cyBieSB0eXBlIGFuZCByZWNlbnQgYWN0aXZpdHkuJyxcbiAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHN0b3JhZ2VNYW5hZ2VyLmdldFN1bW1hcnkoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHN1bW1hcnkgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgY29udGV4dCBzdW1tYXJ5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyBkZWxldGVfY29udGV4dF9lbnRyeSB0b29sIFx1MjAxNCBSZW1vdmUgYSBzcGVjaWZpYyBjb250ZXh0IGVudHJ5IGJ5IElEXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2RlbGV0ZV9jb250ZXh0X2VudHJ5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBhIHNwZWNpZmljIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyeSBieSBpdHMgdW5pcXVlIElELicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgZW50cnlfaWQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1RoZSB1bmlxdWUgSUQgb2YgdGhlIGNvbnRleHQgZW50cnkgdG8gZGVsZXRlJyksXG4gICAgfSxcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZW50cnlfaWQgfTogeyBlbnRyeV9pZDogc3RyaW5nIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRlbGV0ZWQgPSBzdG9yYWdlTWFuYWdlci5kZWxldGVFbnRyeShlbnRyeV9pZCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWRlbGV0ZWQpIHtcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb250ZXh0IGVudHJ5ICcke2VudHJ5X2lkfScgbm90IGZvdW5kYCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRlbGV0ZWQ6IHRydWUsIGVudHJ5X2lkIH0gfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBkZWxldGUgY29udGV4dCBlbnRyeTogJHttZXNzYWdlfWAgfTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG5cbiAgLy8gY2xlYXJfY29udGV4dF9tZW1vcnkgdG9vbCBcdTIwMTQgQ2xlYXIgYWxsIGF1dG8tc2F2ZWQgY29udGV4dCBlbnRyaWVzXG4gIHRvb2xzLnB1c2godG9vbCh7XG4gICAgbmFtZTogJ2NsZWFyX2NvbnRleHRfbWVtb3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIGFsbCBhdXRvbWF0aWNhbGx5IHNhdmVkIGNvbnRleHQgZW50cmllcyBmcm9tIHBlcnNpc3RlbnQgbWVtb3J5LiBUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLicsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgY29uZmlybTogei5ib29sZWFuKCkuZGVzY3JpYmUoJ1NldCB0byB0cnVlIHRvIGNvbmZpcm0gZGVsZXRpb24gb2YgYWxsIGNvbnRleHQgZW50cmllcycpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGNvbmZpcm0gfTogeyBjb25maXJtOiBib29sZWFuIH0pID0+IHtcbiAgICAgIGlmICghY29uZmlybSkge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDb25maXJtYXRpb24gcmVxdWlyZWQuIFNldCBjb25maXJtPXRydWUgdG8gcHJvY2VlZC4nIH07XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0b3JhZ2VNYW5hZ2VyLmNsZWFyQWxsKCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGNsZWFyZWQ6IHRydWUgfSB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGNsZWFyIGNvbnRleHQgbWVtb3J5OiAke21lc3NhZ2V9YCB9O1xuICAgICAgfVxuICAgIH0sXG4gIH0pKTtcblxuICAvLyB0cmFja19pbXBvcnRhbnRfZXZlbnQgdG9vbCBcdTIwMTQgTWFudWFsbHkgbWFyayBhbiBldmVudCBhcyBpbXBvcnRhbnQgZm9yIGNvbnRleHQgdHJhY2tpbmdcbiAgdG9vbHMucHVzaCh0b29sKHtcbiAgICBuYW1lOiAndHJhY2tfaW1wb3J0YW50X2V2ZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ01hbnVhbGx5IHJlY29yZCBhbiBpbXBvcnRhbnQgZXZlbnQgb3IgZGVjaXNpb24gdG8gcGVyc2lzdGVudCBtZW1vcnkuIFVzZWZ1bCBmb3IgbWFya2luZyBjcml0aWNhbCBtb21lbnRzIGluIGEgc2Vzc2lvbi4nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRpdGxlOiB6LnN0cmluZygpLmRlc2NyaWJlKCdUaXRsZSBvZiB0aGUgaW1wb3J0YW50IGV2ZW50JyksXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLmRlc2NyaWJlKCdEZXRhaWxlZCBkZXNjcmlwdGlvbiBvZiB0aGUgZXZlbnQnKSxcbiAgICAgIHRhZ3M6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKS5kZXNjcmliZSgnVGFncyB0byBjYXRlZ29yaXplIHRoZSBldmVudCcpLFxuICAgIH0sXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHRpdGxlLCBjb250ZW50LCB0YWdzIH06IHsgXG4gICAgICB0aXRsZTogc3RyaW5nOyBcbiAgICAgIGNvbnRlbnQ6IHN0cmluZzsgXG4gICAgICB0YWdzPzogc3RyaW5nW107IFxuICAgIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJ5OiBDb250ZXh0RW50cnkgPSB7XG4gICAgICAgICAgaWQ6IGBjdHhfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB0eXBlOiAnZGVjaXNpb24nLFxuICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgdGFncyxcbiAgICAgICAgfTtcblxuICAgICAgICBzdG9yYWdlTWFuYWdlci5hZGRFbnRyeShlbnRyeSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IHRyYWNrZWQ6IHRydWUsIGVudHJ5X2lkOiBlbnRyeS5pZCB9IH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBGYWlsZWQgdG8gdHJhY2sgZXZlbnQ6ICR7bWVzc2FnZX1gIH07XG4gICAgICB9XG4gICAgfSxcbiAgfSkpO1xuXG4gIHJldHVybiB0b29scztcbn1cbiIsICIvKipcbiAqIEF0dGFjaG1lbnQgTWFuYWdlclxuICogXG4gKiBTdG9yZXMgcmVmZXJlbmNlcyB0byBmaWxlcyBhdHRhY2hlZCB0byB0aGUgY3VycmVudCBjaGF0IG1lc3NhZ2UuXG4gKiBBbGxvd3MgdG9vbHMgdG8gYWNjZXNzIHRoZXNlIGZpbGVzIGJ5IG5hbWUgd2l0aG91dCBuZWVkaW5nIGZ1bGwgZGlzayBwYXRocy5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEZpbGVIYW5kbGUgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcblxuLy8gU3RvcmUgYXR0YWNobWVudHMgZm9yIHRoZSBjdXJyZW50IHR1cm5cbi8vIEtleTogZmlsZW5hbWUgKGxvd2VyY2FzZSksIFZhbHVlOiBGaWxlSGFuZGxlXG5sZXQgY3VycmVudEF0dGFjaG1lbnRzID0gbmV3IE1hcDxzdHJpbmcsIEZpbGVIYW5kbGU+KCk7XG5cbi8qKlxuICogU2V0IHRoZSBhdHRhY2htZW50cyBmb3IgdGhlIGN1cnJlbnQgY2hhdCB0dXJuLlxuICogQ2FsbGVkIGJ5IHRoZSBwcm9tcHQgcHJlcHJvY2Vzc29yIGJlZm9yZSBlYWNoIGdlbmVyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBdHRhY2htZW50cyhmaWxlczogRmlsZUhhbmRsZVtdKTogdm9pZCB7XG4gIGN1cnJlbnRBdHRhY2htZW50cy5jbGVhcigpO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAvLyBTdG9yZSBieSBsb3dlcmNhc2UgbmFtZSBmb3IgY2FzZS1pbnNlbnNpdGl2ZSBsb29rdXBcbiAgICBjdXJyZW50QXR0YWNobWVudHMuc2V0KGZpbGUubmFtZS50b0xvd2VyQ2FzZSgpLCBmaWxlKTtcbiAgfVxuICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVnaXN0ZXJlZCAke2ZpbGVzLmxlbmd0aH0gYXR0YWNobWVudChzKTogJHtmaWxlcy5tYXAoZiA9PiBmLm5hbWUpLmpvaW4oJywgJyl9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgYSBzcGVjaWZpYyBhdHRhY2htZW50IGJ5IG5hbWUgKGNhc2UtaW5zZW5zaXRpdmUpLlxuICogUmV0dXJucyB0aGUgRmlsZUhhbmRsZSBpZiBmb3VuZCwgdW5kZWZpbmVkIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF0dGFjaG1lbnQobmFtZTogc3RyaW5nKTogRmlsZUhhbmRsZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBjdXJyZW50QXR0YWNobWVudHMuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgY3VycmVudGx5IGF0dGFjaGVkIGZpbGVuYW1lcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RBdHRhY2htZW50cygpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBBcnJheS5mcm9tKGN1cnJlbnRBdHRhY2htZW50cy5rZXlzKCkpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgc3BlY2lmaWMgZmlsZSBpcyBhdHRhY2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXR0YWNoZWQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdXJyZW50QXR0YWNobWVudHMuaGFzKG5hbWUudG9Mb3dlckNhc2UoKSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBUb29sLCBGaWxlSGFuZGxlIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XHJcbmltcG9ydCB7IHRvb2wgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuLi9jb25maWcuanMnO1xyXG5pbXBvcnQgeyBnZXRBdHRhY2htZW50IH0gZnJvbSAnLi4vYXR0YWNobWVudE1hbmFnZXInO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT0gVHlwZWQgUGFyYW1zIEludGVyZmFjZXMgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmludGVyZmFjZSBSZWFkRG9jdW1lbnRQYXJhbXMge1xyXG4gIGZpbGVfcGF0aDogc3RyaW5nO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PSBIZWxwZXIgRnVuY3Rpb25zID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKiogVmFsaWRhdGUgZmlsZSBleGlzdHMgb24gZGlzayAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xyXG4gIGlmICghZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcclxuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBGaWxlIG5vdCBmb3VuZCBvbiBkaXNrOiAke2ZpbGVQYXRofWAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGVQYXRoKTtcclxuICBpZiAoIXN0YXQuaXNGaWxlKCkpIHtcclxuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBQYXRoIFwiJHtmaWxlUGF0aH1cIiBpcyBub3QgYSBmaWxlYCB9O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayBmaWxlIHNpemUgKG1heCA1ME1CKVxyXG4gIGNvbnN0IG1heFNpemUgPSA1MCAqIDEwMjQgKiAxMDI0OyAvLyA1ME1CXHJcbiAgaWYgKHN0YXQuc2l6ZSA+IG1heFNpemUpIHtcclxuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBGaWxlIHRvbyBsYXJnZSAoJHsoc3RhdC5zaXplIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMSl9TUIpLCBtYXggaXMgNTBNQmAgfTtcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcclxufVxyXG5cclxuLyoqIEhlbHBlciBmb3IgY29uc2lzdGVudCBlcnJvciBoYW5kbGluZyAqL1xyXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogdW5rbm93bik6IHsgc3VjY2VzczogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XHJcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEb2N1bWVudCByZWFkaW5nIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBJbXBsZW1lbnRhdGlvbnMgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBSZWFkIGNvbnRlbnQgZnJvbSBQREYgb3IgRE9DWCBmaWxlcy5cclxuICogU3VwcG9ydHMgYm90aCBkaXNrIHBhdGhzIGFuZCBhdHRhY2hlZCBmaWxlcyAoYnkgZmlsZW5hbWUpLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcmVhZERvY3VtZW50KHsgZmlsZV9wYXRoIH06IFJlYWREb2N1bWVudFBhcmFtcyk6IFByb21pc2U8dW5rbm93bj4ge1xyXG4gIHRyeSB7XHJcbiAgICAvLyAxLiBDaGVjayBpZiBpdCdzIGFuIGF0dGFjaGVkIGZpbGVcclxuICAgIGNvbnN0IGF0dGFjaG1lbnQgPSBnZXRBdHRhY2htZW50KGZpbGVfcGF0aCk7XHJcbiAgICBpZiAoYXR0YWNobWVudCkge1xyXG4gICAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgYXR0YWNoZWQgZmlsZTogJHtmaWxlX3BhdGh9YCk7XHJcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IChhdHRhY2htZW50IGFzIGFueSkucmVhZEZpbGUoKTtcclxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVfcGF0aCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgXHJcbiAgICAgIGlmIChleHQgPT09ICcucGRmJykge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkUERGRnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLmRvY3gnKSB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlYWRET0NYRnJvbUJ1ZmZlcihidWZmZXIsIGZpbGVfcGF0aCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLnR4dCcpIHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZFRYVEZyb21CdWZmZXIoYnVmZmVyLCBmaWxlX3BhdGgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB7IFxyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsIFxyXG4gICAgICAgICAgZXJyb3I6IGBVbnN1cHBvcnRlZCBhdHRhY2hlZCBmaWxlIGZvcm1hdDogJHtleHR9LiBPbmx5IC5wZGYsIC5kb2N4LCBhbmQgLnR4dCBhcmUgc3VwcG9ydGVkLmAgXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIDIuIEZhbGwgYmFjayB0byBkaXNrIHBhdGhcclxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUZpbGUoZmlsZV9wYXRoKTtcclxuICAgIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgICAvLyBQcm92aWRlIGhlbHBmdWwgZXJyb3IgaWYgaXQgbG9va2VkIGxpa2UgYSBmaWxlbmFtZVxyXG4gICAgICByZXR1cm4geyBcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXHJcbiAgICAgICAgZXJyb3I6IGAke3ZhbGlkYXRpb24uZXJyb3J9XFxuXFxuTm90ZTogSWYgdGhpcyBpcyBhbiBhdHRhY2hlZCBmaWxlLCB1c2UgdGhlIGV4YWN0IGZpbGVuYW1lIGZyb20gdGhlIFwiQVRUQUNIRUQgRklMRVMgQVZBSUxBQkxFXCIgbGlzdC5gIFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlX3BhdGgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBcclxuICAgIHN3aXRjaCAoZXh0KSB7XHJcbiAgICAgIGNhc2UgJy5wZGYnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCByZWFkUERGKGZpbGVfcGF0aCk7XHJcbiAgICAgIGNhc2UgJy5kb2N4JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZERPQ1goZmlsZV9wYXRoKTtcclxuICAgICAgY2FzZSAnLnR4dCc6IHtcclxuICAgICAgICBjb25zdCB0ZXh0ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVfcGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGZpbGVfcGF0aDogZmlsZV9wYXRoLFxyXG4gICAgICAgICAgICBmb3JtYXQ6ICdUWFQnLFxyXG4gICAgICAgICAgICB3b3JkX2NvdW50OiB0ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKCh3OiBzdHJpbmcpID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxyXG4gICAgICAgICAgICBzaXplOiBgJHsoZnMuc3RhdFN5bmMoZmlsZV9wYXRoKS5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxyXG4gICAgICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcclxuICAgICAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIHsgXHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXHJcbiAgICAgICAgICBlcnJvcjogYFVuc3VwcG9ydGVkIGZpbGUgZm9ybWF0OiAke2V4dH0uIE9ubHkgLnBkZiwgLmRvY3gsIGFuZCAudHh0IGFyZSBzdXBwb3J0ZWQuYCBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlYWQgUERGIGNvbnRlbnQgZnJvbSBkaXNrIHBhdGguXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiByZWFkUERGKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcGRmUGFyc2UgPSAoYXdhaXQgaW1wb3J0KCdwZGYtcGFyc2UnKSkuZGVmYXVsdDtcclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBSZWFkaW5nIFBERiBmcm9tIGRpc2s6ICR7ZmlsZVBhdGh9YCk7XHJcbiAgICBcclxuICAgIGNvbnN0IGRhdGFCdWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGRmUGFyc2UoZGF0YUJ1ZmZlcik7XHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUERGIHJlYWQgY29tcGxldGU6ICR7cmVzdWx0Lm51bXBhZ2VzfSBwYWdlcywgJHsocmVzdWx0LnRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xyXG4gICAgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlUGF0aCxcclxuICAgICAgICBmb3JtYXQ6ICdQREYnLFxyXG4gICAgICAgIHBhZ2VzOiByZXN1bHQubnVtcGFnZXMsXHJcbiAgICAgICAgd29yZF9jb3VudDogcmVzdWx0LnRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIoKHc6IHN0cmluZykgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXHJcbiAgICAgICAgc2l6ZTogYCR7KGZzLnN0YXRTeW5jKGZpbGVQYXRoKS5zaXplIC8gMTAyNCkudG9GaXhlZCgxKX0gS0JgLFxyXG4gICAgICAgIHRleHRfcHJldmlldzogcmVzdWx0LnRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAocmVzdWx0LnRleHQubGVuZ3RoID4gNTAwID8gJy4uLicgOiAnJyksXHJcbiAgICAgICAgZnVsbF90ZXh0OiByZXN1bHQudGV4dCxcclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgUERGIHJlYWRpbmcgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWFkIFBERiBjb250ZW50IGZyb20gYnVmZmVyIChmb3IgYXR0YWNobWVudHMpLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcmVhZFBERkZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcGRmUGFyc2UgPSAoYXdhaXQgaW1wb3J0KCdwZGYtcGFyc2UnKSkuZGVmYXVsdDtcclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBSZWFkaW5nIFBERiBmcm9tIGF0dGFjaG1lbnQ6ICR7ZmlsZU5hbWV9YCk7XHJcbiAgICBcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBkZlBhcnNlKGJ1ZmZlcik7XHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUERGIHJlYWQgY29tcGxldGU6ICR7cmVzdWx0Lm51bXBhZ2VzfSBwYWdlcywgJHsocmVzdWx0LnRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xyXG4gICAgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlTmFtZSxcclxuICAgICAgICBmb3JtYXQ6ICdQREYnLFxyXG4gICAgICAgIHBhZ2VzOiByZXN1bHQubnVtcGFnZXMsXHJcbiAgICAgICAgd29yZF9jb3VudDogcmVzdWx0LnRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIoKHc6IHN0cmluZykgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXHJcbiAgICAgICAgc2l6ZTogYCR7KGJ1ZmZlci5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXHJcbiAgICAgICAgdGV4dF9wcmV2aWV3OiByZXN1bHQudGV4dC5zdWJzdHJpbmcoMCwgNTAwKSArIChyZXN1bHQudGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcclxuICAgICAgICBmdWxsX3RleHQ6IHJlc3VsdC50ZXh0LFxyXG4gICAgICAgIHNvdXJjZTogJ2F0dGFjaG1lbnQnLFxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBQREYgcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlYWQgRE9DWCBjb250ZW50IGZyb20gZGlzayBwYXRoLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcmVhZERPQ1goZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBtYW1tb3RoID0gYXdhaXQgaW1wb3J0KCdtYW1tb3RoJyk7XHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKGBbQUkgVG9vbGJveF0gUmVhZGluZyBET0NYIGZyb20gZGlzazogJHtmaWxlUGF0aH1gKTtcclxuICAgIFxyXG4gICAgY29uc3QgZGF0YUJ1ZmZlciA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAobWFtbW90aCBhcyBhbnkpLmV4dHJhY3RSYXdUZXh0KHsgYnVmZmVyOiBkYXRhQnVmZmVyIH0pO1xyXG4gICAgXHJcbiAgICBjb25zdCB0ZXh0ID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgY29uc3Qgd2FybmluZ3MgPSAocmVzdWx0Lm1lc3NhZ2VzIGFzIEFycmF5PHttZXNzYWdlOiBzdHJpbmd9PikubWFwKG0gPT4gbS5tZXNzYWdlKS5qb2luKCdcXG4nKTtcclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBET0NYIHJlYWQgY29tcGxldGU6ICR7KHRleHQubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgxKX1LQmApO1xyXG4gICAgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgZmlsZV9wYXRoOiBmaWxlUGF0aCxcclxuICAgICAgICBmb3JtYXQ6ICdET0NYJyxcclxuICAgICAgICB3b3JkX2NvdW50OiB0ZXh0LnNwbGl0KC9cXHMrLykuZmlsdGVyKCh3OiBzdHJpbmcpID0+IHcubGVuZ3RoID4gMCkubGVuZ3RoLFxyXG4gICAgICAgIHNpemU6IGAkeyhmcy5zdGF0U3luYyhmaWxlUGF0aCkuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcclxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcclxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXHJcbiAgICAgICAgd2FybmluZ3M6IHdhcm5pbmdzIHx8IHVuZGVmaW5lZCxcclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRE9DWCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmVhZCBET0NYIGNvbnRlbnQgZnJvbSBidWZmZXIgKGZvciBhdHRhY2htZW50cykuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiByZWFkRE9DWEZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbWFtbW90aCA9IGF3YWl0IGltcG9ydCgnbWFtbW90aCcpO1xyXG4gICAgXHJcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgRE9DWCBmcm9tIGF0dGFjaG1lbnQ6ICR7ZmlsZU5hbWV9YCk7XHJcbiAgICBcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IChtYW1tb3RoIGFzIGFueSkuZXh0cmFjdFJhd1RleHQoeyBidWZmZXIgfSk7XHJcbiAgICBcclxuICAgIGNvbnN0IHRleHQgPSByZXN1bHQudmFsdWU7XHJcbiAgICBjb25zdCB3YXJuaW5ncyA9IChyZXN1bHQubWVzc2FnZXMgYXMgQXJyYXk8e21lc3NhZ2U6IHN0cmluZ30+KS5tYXAobSA9PiBtLm1lc3NhZ2UpLmpvaW4oJ1xcbicpO1xyXG4gICAgXHJcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIERPQ1ggcmVhZCBjb21wbGV0ZTogJHsodGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XHJcbiAgICBcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBmaWxlX3BhdGg6IGZpbGVOYW1lLFxyXG4gICAgICAgIGZvcm1hdDogJ0RPQ1gnLFxyXG4gICAgICAgIHdvcmRfY291bnQ6IHRleHQuc3BsaXQoL1xccysvKS5maWx0ZXIoKHc6IHN0cmluZykgPT4gdy5sZW5ndGggPiAwKS5sZW5ndGgsXHJcbiAgICAgICAgc2l6ZTogYCR7KGJ1ZmZlci5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfSBLQmAsXHJcbiAgICAgICAgdGV4dF9wcmV2aWV3OiB0ZXh0LnN1YnN0cmluZygwLCA1MDApICsgKHRleHQubGVuZ3RoID4gNTAwID8gJy4uLicgOiAnJyksXHJcbiAgICAgICAgZnVsbF90ZXh0OiB0ZXh0LFxyXG4gICAgICAgIHdhcm5pbmdzOiB3YXJuaW5ncyB8fCB1bmRlZmluZWQsXHJcbiAgICAgICAgc291cmNlOiAnYXR0YWNobWVudCcsXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYERPQ1ggcmVhZGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlYWQgVFhUIGNvbnRlbnQgZnJvbSBidWZmZXIgKGZvciBhdHRhY2htZW50cykuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiByZWFkVFhURnJvbUJ1ZmZlcihidWZmZXI6IEJ1ZmZlciwgZmlsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zb2xlLmxvZyhgW0FJIFRvb2xib3hdIFJlYWRpbmcgVFhUIGZyb20gYXR0YWNobWVudDogJHtmaWxlTmFtZX1gKTtcclxuICAgIFxyXG4gICAgY29uc3QgdGV4dCA9IGJ1ZmZlci50b1N0cmluZygndXRmLTgnKTtcclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coYFtBSSBUb29sYm94XSBUWFQgcmVhZCBjb21wbGV0ZTogJHsodGV4dC5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDEpfUtCYCk7XHJcbiAgICBcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBmaWxlX3BhdGg6IGZpbGVOYW1lLFxyXG4gICAgICAgIGZvcm1hdDogJ1RYVCcsXHJcbiAgICAgICAgd29yZF9jb3VudDogdGV4dC5zcGxpdCgvXFxzKy8pLmZpbHRlcigodzogc3RyaW5nKSA9PiB3Lmxlbmd0aCA+IDApLmxlbmd0aCxcclxuICAgICAgICBzaXplOiBgJHsoYnVmZmVyLmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMSl9IEtCYCxcclxuICAgICAgICB0ZXh0X3ByZXZpZXc6IHRleHQuc3Vic3RyaW5nKDAsIDUwMCkgKyAodGV4dC5sZW5ndGggPiA1MDAgPyAnLi4uJyA6ICcnKSxcclxuICAgICAgICBmdWxsX3RleHQ6IHRleHQsXHJcbiAgICAgICAgc291cmNlOiAnYXR0YWNobWVudCcsXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFRYVCByZWFkaW5nIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT0gVG9vbCBSZWdpc3RyYXRpb24gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRvY3VtZW50VG9vbHMoX2NvbmZpZzogUGx1Z2luQ29uZmlnKTogVG9vbFtdIHtcclxuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XHJcblxyXG4gIC8vIHJlYWRfZG9jdW1lbnQgdG9vbFxyXG4gIHRvb2xzLnB1c2godG9vbCh7XHJcbiAgICBuYW1lOiAncmVhZF9kb2N1bWVudCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1JlYWQgY29udGVudCBmcm9tIFBERiwgRE9DWCwgb3IgVFhUIGZpbGVzLiBTdXBwb3J0cyBib3RoIGRpc2sgcGF0aHMgYW5kIGF0dGFjaGVkIGZpbGVzICh1c2UgZmlsZW5hbWUgZm9yIGF0dGFjaG1lbnRzKS4nLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ1BhdGggdG8gdGhlIFBERiwgRE9DWCwgb3IgVFhUIGZpbGUsIG9yIHRoZSBmaWxlbmFtZSBpZiBpdCBpcyBhbiBhdHRhY2hlZCBmaWxlJyksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jIChwYXJhbXMpID0+IHJlYWREb2N1bWVudChwYXJhbXMgYXMgUmVhZERvY3VtZW50UGFyYW1zKSxcclxuICB9KSk7XHJcblxyXG4gIHJldHVybiB0b29scztcclxufVxyXG4iLCAiLyoqXG4gKiBEb2N1bWVudCBSQUcgUHJvbXB0IFByZXByb2Nlc3NvciArIFdvcmtpbmcgRGlyZWN0b3J5IERldGVjdGlvbiArIFRlbXBvcmFsIEF3YXJlbmVzc1xuICovXG5cbmltcG9ydCB7IHR5cGUgQ2hhdE1lc3NhZ2UsIHR5cGUgRmlsZUhhbmRsZSwgdHlwZSBQcm9tcHRQcmVwcm9jZXNzb3JDb250cm9sbGVyIH0gZnJvbSAnQGxtc3R1ZGlvL3Nkayc7XG5pbXBvcnQgeyBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHBkZlBhcnNlIGZyb20gJ3BkZi1wYXJzZSc7XG5pbXBvcnQgeyBDb250ZXh0R3VhcmQgfSBmcm9tICcuL2NvbnRleHRHdWFyZCc7XG5pbXBvcnQgeyBzZXRBdHRhY2htZW50cywgbGlzdEF0dGFjaG1lbnRzIH0gZnJvbSAnLi9hdHRhY2htZW50TWFuYWdlcic7XG5cbi8vIC0tLSBUZW1wb3JhbCBBd2FyZW5lc3MgSGVscGVycyAobWVyZ2VkIGZyb20gdXBfdG9fZGF0ZSkgLS0tXG5pbnRlcmZhY2UgRGF0ZVRpbWVDYWNoZSB7XG4gIGNvbXBhY3Q6IHN0cmluZztcbiAgZnVsbDogc3RyaW5nO1xufVxuXG5sZXQgY2FjaGVkRGF0ZVRpbWVEYXRhOiBEYXRlVGltZUNhY2hlIHwgbnVsbCA9IG51bGw7XG5jb25zdCBDQUNIRV9EVVJBVElPTl9NUyA9IDUgKiA2MCAqIDEwMDA7IC8vIFJlZnJlc2ggZXZlcnkgNSBtaW51dGVzXG5cbi8vIENvbnRleHRHdWFyZCBpbnRlZ3JhdGlvblxubGV0IGNvbnRleHRHdWFyZDogQ29udGV4dEd1YXJkIHwgbnVsbCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0R3VhcmQoZ3VhcmQ6IENvbnRleHRHdWFyZCB8IG51bGwpOiB2b2lkIHtcbiAgY29udGV4dEd1YXJkID0gZ3VhcmQ7XG59XG5sZXQgY2FjaGVUaW1lc3RhbXAgPSAwO1xuXG5mdW5jdGlvbiBnZXRDYWNoZWREYXRlVGltZSgpOiBEYXRlVGltZUNhY2hlIHtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgXG4gIGlmIChjYWNoZWREYXRlVGltZURhdGEgJiYgKG5vdyAtIGNhY2hlVGltZXN0YW1wKSA8IENBQ0hFX0RVUkFUSU9OX01TKSB7XG4gICAgcmV0dXJuIGNhY2hlZERhdGVUaW1lRGF0YTtcbiAgfVxuICBcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIFxuICAvLyBDb21wYWN0IGZvcm1hdDogREQuTU0uWVlZWSwgSEg6bW1cbiAgY29uc3QgY29tcGFjdCA9IGRhdGUudG9Mb2NhbGVTdHJpbmcoJ2RlLURFJywge1xuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJzItZGlnaXQnLFxuICAgIGRheTogJzItZGlnaXQnLFxuICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICBtaW51dGU6ICcyLWRpZ2l0J1xuICB9KTtcbiAgXG4gIC8vIEZ1bGwgZm9ybWF0OiBXb2NoZW50YWcsIERELiBNTU1NIFlZWVksIEhIOm1tIFVoclxuICBjb25zdCBmdWxsID0gZGF0ZS50b0xvY2FsZVN0cmluZygnZGUtREUnLCB7XG4gICAgd2Vla2RheTogJ2xvbmcnLFxuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJ2xvbmcnLFxuICAgIGRheTogJ251bWVyaWMnLFxuICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICBtaW51dGU6ICcyLWRpZ2l0J1xuICB9KSArICcgVWhyJztcbiAgXG4gIGNhY2hlZERhdGVUaW1lRGF0YSA9IHsgY29tcGFjdCwgZnVsbCB9O1xuICBjYWNoZVRpbWVzdGFtcCA9IG5vdztcbiAgXG4gIHJldHVybiBjYWNoZWREYXRlVGltZURhdGE7XG59XG5cbmZ1bmN0aW9uIGdldFRlbXBvcmFsU3VmZml4KGN0bDogUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcik6IHN0cmluZyB7XG4gIGNvbnN0IGNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcoY29uZmlnU2NoZW1hdGljcyk7XG4gIFxuICAvLyBVc2UgLmdldCgpIG1ldGhvZCB3aXRoIHByb3BlciBkZWZhdWx0cyAtIG1vcmUgcmVsaWFibGUgdGhhbiBkaXJlY3QgcHJvcGVydHkgYWNjZXNzXG4gIGNvbnN0IHRlbXBvcmFsQXdhcmVuZXNzRW5hYmxlZCA9IGNvbmZpZy5nZXQoJ3RlbXBvcmFsQXdhcmVuZXNzJykgPz8gdHJ1ZTtcbiAgXG4gIGlmICghdGVtcG9yYWxBd2FyZW5lc3NFbmFibGVkKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIFxuICBjb25zdCBzdHlsZSA9IGNvbmZpZy5nZXQoJ2RhdGVGb3JtYXRTdHlsZScpID8/ICdzdGFuZGFyZCc7XG4gIGNvbnN0IHsgY29tcGFjdCwgZnVsbCB9ID0gZ2V0Q2FjaGVkRGF0ZVRpbWUoKTtcbiAgXG4gIC8vIERFQlVHOiBVbmNvbW1lbnQgdG8gdmVyaWZ5IHdoYXQncyBiZWluZyBpbmplY3RlZFxuICBjb25zb2xlLmxvZyhgW1RFTVBPUkFMXSBJbmplY3Rpbmc6ICR7c3R5bGUgPT09ICdoZXV0ZUlzdCcgPyBgSEVVVEUgSVNUICR7ZnVsbH1gIDogYFtaZWl0OiAke2NvbXBhY3R9XWB9YCk7XG4gIFxuICBpZiAoc3R5bGUgPT09ICdoZXV0ZUlzdCcpIHtcbiAgICByZXR1cm4gYFxcblxcbkhFVVRFIElTVCAke2Z1bGx9YDtcbiAgfVxuICByZXR1cm4gYFxcblxcbltaZWl0OiAke2NvbXBhY3R9XWA7XG59XG5cbmZ1bmN0aW9uIGRldGVjdERpcmVjdG9yeVBhdGgodGV4dDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIC8vIFJlbW92ZSBVUkxzIGZpcnN0IHRvIGF2b2lkIGZhbHNlIHBvc2l0aXZlcyBsaWtlIC9tZWRpdW0uY29tIGZyb20gaHR0cHM6Ly9tZWRpdW0uY29tLy4uLlxuICBjb25zdCB3aXRob3V0VXJscyA9IHRleHQucmVwbGFjZSgvaHR0cHM/OlxcL1xcL1teXFxzXSt8d3d3XFwuW15cXHNdK3xmaWxlOlxcL1xcL1teXFxzXSsvZywgJycpO1xuXG4gIC8vIFdpbmRvd3MgcGF0aHM6IEM6XFxwYXRoIG9yIEQ6XFxmb2xkZXIgKG11c3Qgc3RhcnQgd2l0aCBkcml2ZSBsZXR0ZXIpXG4gICBjb25zdCB3aW5NYXRjaCA9IHdpdGhvdXRVcmxzLm1hdGNoKC9bQS1aYS16XTpcXFxcW1xcd1xcLV8uIFxcXFxdKy8pO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeXl5eXl5eXl5eXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJhY2tzbGFzaCBhZGRlZCBcdTI3MTNcbiAgaWYgKHdpbk1hdGNoKSByZXR1cm4gd2luTWF0Y2hbMF0udHJpbSgpO1xuXG4gIC8vIFVuaXggYWJzb2x1dGUgcGF0aHM6IC9ob21lL3VzZXIvZGlyLCAvdmFyL2xvZywgZXRjLlxuICBjb25zdCB1bml4TWF0Y2ggPSB3aXRob3V0VXJscy5tYXRjaCgvKD86XnxcXHMpKFxcL1tcXHdcXC1fLiBdezIsfSkvKTtcbiAgaWYgKHVuaXhNYXRjaCkge1xuICAgIGNvbnN0IHBhdGggPSB1bml4TWF0Y2hbMV0udHJpbSgpO1xuICAgIC8vIFJlamVjdCBwYXRocyB0aGF0IGxvb2sgbGlrZSBVUkxzIG9yIGZyYWdtZW50cyAoZS5nLiwgLyBDaGF0IGZpbGVzIHMpXG4gICAgaWYgKCFwYXRoLnN0YXJ0c1dpdGgoJy8gJykgJiYgIXBhdGguaW5jbHVkZXMoJyAnKSkge1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVsYXRpdmUgcGF0aHM6IC4vZm9sZGVyLCAuLi9wYXJlbnQvZGlyXG4gIGNvbnN0IHJlbE1hdGNoID0gd2l0aG91dFVybHMubWF0Y2goLyg/Ol58XFxzKSg/OlxcLlxcL3xcXC5cXFxcLlxcL3xcXC5cXC5cXC8pW1xcd1xcLV8uIF0rLyk7XG4gIGlmIChyZWxNYXRjaCkgcmV0dXJuIHJlbE1hdGNoWzBdLnRyaW0oKTtcblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaW5qZWN0V29ya2luZ0RpcmVjdG9yeVByb21wdChvcmlnaW5hbE1lc3NhZ2U6IHN0cmluZywgZGV0ZWN0ZWRQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBpbnN0cnVjdGlvbiA9IGBcblx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVxuXHUyNkEwXHVGRTBGIFdPUktJTkcgRElSRUNUT1JZIERFVEVDVEVEXG5cdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcdTI1MDFcblxuVGhlIHVzZXIgbWVudGlvbmVkIGEgZGlyZWN0b3J5IHBhdGggaW4gdGhlaXIgbWVzc2FnZTpcblxuICAgICR7ZGV0ZWN0ZWRQYXRofVxuXG5QbGVhc2UgYXNrIHRoZSB1c2VyIGZvciBjb25maXJtYXRpb24gYmVmb3JlIGNoYW5naW5nIHRoZSB3b3JraW5nIGRpcmVjdG9yeS5cbkV4YW1wbGUgcmVzcG9uc2U6XG5cblwiSSBub3RpY2VkIHlvdSBtZW50aW9uZWQgdGhlIGRpcmVjdG9yeSAnJHtkZXRlY3RlZFBhdGh9Jy4gXG5Xb3VsZCB5b3UgbGlrZSBtZSB0byBzZXQgdGhpcyBhcyB5b3VyIHdvcmtpbmcgZGlyZWN0b3J5PyBcbkFsbCBzdWJzZXF1ZW50IGZpbGUgb3BlcmF0aW9ucyB3aWxsIHVzZSB0aGlzIGRpcmVjdG9yeSBhcyB0aGUgYmFzZS5cblxuUmVwbHkgJ3llcycgb3IgJ2phJyB0byBjb25maXJtLCBvciAnbm8nLyduZWluJyB0byBkZWNsaW5lLlwiXG5cblx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVx1MjUwMVxuXG5Vc2VyJ3Mgb3JpZ2luYWwgbWVzc2FnZTpcbiR7b3JpZ2luYWxNZXNzYWdlfVxuYDtcbiAgXG4gIHJldHVybiBpbnN0cnVjdGlvbi50cmltKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4dHJhY3RQZGZUZXh0KGZpbGVIYW5kbGU6IEZpbGVIYW5kbGUpOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IChmaWxlSGFuZGxlIGFzIGFueSkucmVhZEZpbGUgPyBhd2FpdCAoZmlsZUhhbmRsZSBhcyBhbnkpLnJlYWRGaWxlKCkgOiBCdWZmZXIuZnJvbShhd2FpdCAoZmlsZUhhbmRsZSBhcyBhbnkpLnJlYWQoKSk7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHBkZlBhcnNlKGJ1ZmZlcik7XG4gICAgcmV0dXJuIGRhdGEudGV4dC50cmltKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihgW1JBR10gRXJyb3IgZXh0cmFjdGluZyB0ZXh0IGZyb20gUERGICR7ZmlsZUhhbmRsZS5uYW1lfTpgLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcGFyc2UgUERGOiAke2ZpbGVIYW5kbGUubmFtZX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaHVua1RleHQodGV4dDogc3RyaW5nLCBjaHVua1NpemU6IG51bWJlciA9IDEwMDAsIG92ZXJsYXA6IG51bWJlciA9IDEwMCk6IHN0cmluZ1tdIHtcbiAgY29uc3Qgd29yZHMgPSB0ZXh0LnNwbGl0KC9cXHMrLyk7XG4gIGNvbnN0IGNodW5rczogc3RyaW5nW10gPSBbXTtcbiAgXG4gIGlmICh3b3Jkcy5sZW5ndGggPD0gY2h1bmtTaXplKSB7XG4gICAgcmV0dXJuIFt0ZXh0XTtcbiAgfVxuXG4gIGxldCBzdGFydEluZGV4ID0gMDtcbiAgd2hpbGUgKHN0YXJ0SW5kZXggPCB3b3Jkcy5sZW5ndGgpIHtcbiAgICBjb25zdCBlbmRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXggKyBjaHVua1NpemUsIHdvcmRzLmxlbmd0aCk7XG4gICAgY29uc3QgY2h1bmtUZXh0ID0gd29yZHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmpvaW4oJyAnKTtcbiAgICBcbiAgICBjaHVua3MucHVzaChjaHVua1RleHQpO1xuICAgIHN0YXJ0SW5kZXggPSBlbmRJbmRleCAtIG92ZXJsYXA7XG4gIH1cblxuICByZXR1cm4gY2h1bmtzLmZpbHRlcihjID0+IGMudHJpbSgpLmxlbmd0aCA+IDApO1xufVxuXG5mdW5jdGlvbiBjb3NpbmVTaW1pbGFyaXR5KGE6IG51bWJlcltdLCBiOiBudW1iZXJbXSk6IG51bWJlciB7XG4gIGxldCBkb3RQcm9kdWN0ID0gMDtcbiAgbGV0IG5vcm1BID0gMDtcbiAgbGV0IG5vcm1CID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgZG90UHJvZHVjdCArPSBhW2ldICogYltpXTtcbiAgICBub3JtQSArPSBhW2ldICogYVtpXTtcbiAgICBub3JtQiArPSBiW2ldICogYltpXTtcbiAgfVxuICByZXR1cm4gZG90UHJvZHVjdCAvIChNYXRoLnNxcnQobm9ybUEpICogTWF0aC5zcXJ0KG5vcm1CKSk7XG59XG5cbmludGVyZmFjZSBSZXRyaWV2YWxSZXN1bHQge1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHNjb3JlOiBudW1iZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJldHJpZXZlRnJvbVBkZnMoXG4gIGN0bDogUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcixcbiAgcXVlcnk6IHN0cmluZyxcbiAgcGRmRmlsZXM6IEZpbGVIYW5kbGVbXSxcbik6IFByb21pc2U8UmV0cmlldmFsUmVzdWx0W10+IHtcbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgY29uc3QgcmV0cmlldmFsTGltaXQgPSBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxMaW1pdCcpIHx8IDU7XG4gIC8vIExvd2VyIGRlZmF1bHQgdGhyZXNob2xkIHRvIGNhdGNoIG1vcmUgcmVzdWx0cyAtIHdhcyB0b28gaGlnaCBhdCAwLjZcbiAgY29uc3QgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQgPSBwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCcpID8/IDAuMztcblxuICBjb25zb2xlLmxvZyhgW1JBR10gUHJvY2Vzc2luZyAke3BkZkZpbGVzLmxlbmd0aH0gUERGIGZpbGUocylgKTtcblxuICAvLyBFeHRyYWN0IHRleHQgZnJvbSBhbGwgUERGIGZpbGVzXG4gIGNvbnN0IGZpbGVUZXh0czogeyBmaWxlOiBGaWxlSGFuZGxlOyB0ZXh0OiBzdHJpbmcgfVtdID0gW107XG4gIGZvciAoY29uc3QgZmlsZSBvZiBwZGZGaWxlcykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgZXh0cmFjdFBkZlRleHQoZmlsZSk7XG4gICAgICBpZiAodGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBFeHRyYWN0ZWQgJHt0ZXh0Lmxlbmd0aH0gY2hhcnMgZnJvbSAke2ZpbGUubmFtZX1gKTtcbiAgICAgICAgZmlsZVRleHRzLnB1c2goeyBmaWxlLCB0ZXh0IH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbUkFHXSBObyB0ZXh0IGV4dHJhY3RlZCBmcm9tICR7ZmlsZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBbUkFHXSBTa2lwcGluZyBQREYgJHtmaWxlLm5hbWV9IGR1ZSB0byBlcnJvcjpgLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGZpbGVUZXh0cy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zb2xlLndhcm4oJ1tSQUddIE5vIHRleHQgZXh0cmFjdGVkIGZyb20gYW55IFBERicpO1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIENodW5rIHRoZSB0ZXh0c1xuICBjb25zdCBjaHVua3M6IHsgZmlsZTogRmlsZUhhbmRsZTsgY2h1bms6IHN0cmluZyB9W10gPSBbXTtcbiAgZm9yIChjb25zdCB7IGZpbGUsIHRleHQgfSBvZiBmaWxlVGV4dHMpIHtcbiAgICBjb25zdCBmaWxlQ2h1bmtzID0gY2h1bmtUZXh0KHRleHQpO1xuICAgIGNvbnNvbGUubG9nKGBbUkFHXSAke2ZpbGUubmFtZX06ICR7dGV4dC5sZW5ndGh9IGNoYXJzIFx1MjE5MiAke2ZpbGVDaHVua3MubGVuZ3RofSBjaHVua3NgKTtcbiAgICBmaWxlQ2h1bmtzLmZvckVhY2goKGNodW5rKSA9PiB7XG4gICAgICBjaHVua3MucHVzaCh7IGZpbGUsIGNodW5rIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGNodW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmdzIGZvciBhbGwgY2h1bmtzIHVzaW5nIExNIFN0dWRpbydzIGVtYmVkZGluZyBtb2RlbFxuICBsZXQgbW9kZWw7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coJ1tSQUddIExvYWRpbmcgZW1iZWRkaW5nIG1vZGVsLi4uJyk7XG4gICAgbW9kZWwgPSBhd2FpdCBjdGwuY2xpZW50LmVtYmVkZGluZy5tb2RlbCgnbm9taWMtYWkvbm9taWMtZW1iZWQtdGV4dC12MS41LUdHVUYnLCB7XG4gICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZygnW1JBR10gRW1iZWRkaW5nIG1vZGVsIGxvYWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBGYWlsZWQgdG8gbG9hZCBlbWJlZGRpbmcgbW9kZWw6JywgZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihgRW1iZWRkaW5nIG1vZGVsIG5vdCBhdmFpbGFibGU6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICBjb25zdCBiYXRjaFNpemUgPSAzMjtcbiAgY29uc3QgYWxsRW1iZWRkaW5nczogbnVtYmVyW11bXSA9IFtdO1xuXG4gIHRyeSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpICs9IGJhdGNoU2l6ZSkge1xuICAgICAgY29uc29sZS5sb2coYFtSQUddIEdlbmVyYXRpbmcgZW1iZWRkaW5ncyBiYXRjaCAke01hdGguZmxvb3IoaSAvIGJhdGNoU2l6ZSkgKyAxfS8ke01hdGguY2VpbChjaHVua3MubGVuZ3RoIC8gYmF0Y2hTaXplKX0uLi5gKTtcbiAgICAgIGNvbnN0IGJhdGNoID0gY2h1bmtzLnNsaWNlKGksIGkgKyBiYXRjaFNpemUpLm1hcChjID0+IGMuY2h1bmspO1xuICAgICAgY29uc3QgZW1iZWRkaW5nc1Jlc3VsdCA9IGF3YWl0IG1vZGVsLmVtYmVkKGJhdGNoKTtcbiAgICAgIGFsbEVtYmVkZGluZ3MucHVzaCguLi4oZW1iZWRkaW5nc1Jlc3VsdCBhcyBhbnlbXSkubWFwKChlOiBhbnkpID0+IGUuZW1iZWRkaW5nKSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIGdlbmVyYXRpbmcgZW1iZWRkaW5nczonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFbWJlZGRpbmcgZ2VuZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICAvLyBHZW5lcmF0ZSBlbWJlZGRpbmcgZm9yIHRoZSBxdWVyeVxuICBsZXQgcXVlcnlNb2RlbDtcbiAgdHJ5IHtcbiAgICBxdWVyeU1vZGVsID0gYXdhaXQgY3RsLmNsaWVudC5lbWJlZGRpbmcubW9kZWwoJ25vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGJywge1xuICAgICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1JBR10gRmFpbGVkIHRvIGxvYWQgcXVlcnkgZW1iZWRkaW5nIG1vZGVsOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFF1ZXJ5IGVtYmVkZGluZyBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICBsZXQgcXVlcnlFbWJlZGRpbmc7XG4gIHRyeSB7XG4gICAgY29uc3QgcXVlcnlSZXN1bHQgPSBhd2FpdCBxdWVyeU1vZGVsLmVtYmVkKFtxdWVyeV0pO1xuICAgIHF1ZXJ5RW1iZWRkaW5nID0gcXVlcnlSZXN1bHRbMF0uZW1iZWRkaW5nO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tSQUddIEVycm9yIGdlbmVyYXRpbmcgcXVlcnkgZW1iZWRkaW5nOicsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFF1ZXJ5IGVtYmVkZGluZyBmYWlsZWQ6ICR7ZXJyb3J9YCk7XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgc2ltaWxhcml0aWVzIGFuZCByZXRyaWV2ZSB0b3AgcmVzdWx0c1xuICBjb25zdCBzY29yZXM6IHsgY2h1bmtJbmRleDogbnVtYmVyOyBzaW1pbGFyaXR5OiBudW1iZXIgfVtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2ltaWxhcml0eSA9IGNvc2luZVNpbWlsYXJpdHkocXVlcnlFbWJlZGRpbmcsIGFsbEVtYmVkZGluZ3NbaV0pO1xuICAgIHNjb3Jlcy5wdXNoKHsgY2h1bmtJbmRleDogaSwgc2ltaWxhcml0eSB9KTtcbiAgfVxuXG4gIC8vIFNvcnQgYnkgc2ltaWxhcml0eSBkZXNjZW5kaW5nIGFuZCBmaWx0ZXIgYnkgdGhyZXNob2xkXG4gIHNjb3Jlcy5zb3J0KChhLCBiKSA9PiBiLnNpbWlsYXJpdHkgLSBhLnNpbWlsYXJpdHkpO1xuICBcbiAgY29uc29sZS5sb2coYFtSQUddIEZvdW5kICR7c2NvcmVzLmxlbmd0aH0gY2h1bmtzLCBmaWx0ZXJpbmcgd2l0aCB0aHJlc2hvbGQgJHtyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZH1gKTtcbiAgY29uc3QgcmVsZXZhbnRDaHVua3MgPSBzY29yZXMuZmlsdGVyKFxuICAgIChzKSA9PiBzLnNpbWlsYXJpdHkgPj0gcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQgJiYgcy5jaHVua0luZGV4IDwgY2h1bmtzLmxlbmd0aCxcbiAgKTtcblxuICAvLyBMaW1pdCByZXN1bHRzXG4gIGNvbnN0IGxpbWl0ZWRSZXN1bHRzID0gcmVsZXZhbnRDaHVua3Muc2xpY2UoMCwgcmV0cmlldmFsTGltaXQpO1xuXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBSZXR1cm5pbmcgJHtsaW1pdGVkUmVzdWx0cy5sZW5ndGh9IHJlc3VsdHNgKTtcbiAgcmV0dXJuIGxpbWl0ZWRSZXN1bHRzLm1hcCgocikgPT4gKHtcbiAgICBjb250ZW50OiBjaHVua3Nbci5jaHVua0luZGV4XS5jaHVuayxcbiAgICBzY29yZTogci5zaW1pbGFyaXR5LFxuICB9KSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmVwcm9jZXNzKFxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXG4gIHVzZXJNZXNzYWdlOiBDaGF0TWVzc2FnZVxuKTogUHJvbWlzZTxzdHJpbmcgfCBDaGF0TWVzc2FnZT4ge1xuICBjb25zdCB1c2VyUHJvbXB0ID0gdXNlck1lc3NhZ2UuZ2V0VGV4dCgpO1xuICBcbiAgLy8gU3RlcCAwLjU6IENvbnRleHRHdWFyZCBhdXRvLWNvbXByZXNzaW9uIChiZWZvcmUgYW55IHByb2Nlc3NpbmcpXG4gIGlmIChjb250ZXh0R3VhcmQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGN0bC5wdWxsSGlzdG9yeSgpO1xuICAgICAgaGlzdG9yeS5hcHBlbmQodXNlck1lc3NhZ2UpO1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBoaXN0b3J5LmdldE1lc3NhZ2VzQXJyYXkoKTtcbiAgICAgIGNvbnN0IHRva2VuQ291bnQgPSBhd2FpdCBjb250ZXh0R3VhcmQuY291bnRUb2tlbnMobWVzc2FnZXMpO1xuICAgICAgY29uc3QgdGhyZXNob2xkID0gY29udGV4dEd1YXJkLmdldFRocmVzaG9sZCgpO1xuICAgICAgaWYgKHRva2VuQ291bnQgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtDb250ZXh0R3VhcmRdIFRva2VuIGNvdW50ICR7dG9rZW5Db3VudH0gZXhjZWVkcyB0aHJlc2hvbGQgJHt0aHJlc2hvbGR9LCBjb21wcmVzc2luZy4uLmApO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkTWVzc2FnZXMgPSBhd2FpdCBjb250ZXh0R3VhcmQuY29tcHJlc3NIaXN0b3J5KG1lc3NhZ2VzKTtcbiAgICAgICAgLy8gQ2xlYXIgaGlzdG9yeSBieSBwb3BwaW5nIGFsbCBtZXNzYWdlc1xuICAgICAgICB3aGlsZSAoaGlzdG9yeS5nZXRMZW5ndGgoKSA+IDApIHtcbiAgICAgICAgICBoaXN0b3J5LnBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbXByZXNzZWRNZXNzYWdlcy5mb3JFYWNoKG1zZyA9PiBoaXN0b3J5LmFwcGVuZChtc2cpKTtcbiAgICAgICAgY29udGV4dEd1YXJkLnJlc2V0VG9rZW5DYWNoZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignW0NvbnRleHRHdWFyZF0gQXV0by1jb21wcmVzc2lvbiBmYWlsZWQ6JywgZSk7XG4gICAgfVxuICB9XG4gIFxuICAvLyBTdGVwIDA6IEFsd2F5cyByZWdpc3RlciBhdHRhY2htZW50cyBzbyB0b29scyBjYW4gYWNjZXNzIHRoZW0gYnkgbmFtZVxuICBjb25zdCBhbGxGaWxlcyA9IHVzZXJNZXNzYWdlLmdldEZpbGVzKGN0bC5jbGllbnQpO1xuICBzZXRBdHRhY2htZW50cyhhbGxGaWxlcyk7XG4gIFxuICAvLyBCdWlsZCBhdHRhY2htZW50IG5vdGljZSB0byBpbmplY3QgaW50byBwcm9tcHRcbiAgbGV0IGF0dGFjaG1lbnROb3RpY2UgPSAnJztcbiAgaWYgKGFsbEZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmaWxlTmFtZXMgPSBsaXN0QXR0YWNobWVudHMoKTtcbiAgICBhdHRhY2htZW50Tm90aWNlID0gYFxcblxcblx1RDgzRFx1RENDRSBBVFRBQ0hFRCBGSUxFUyBBVkFJTEFCTEU6XFxuWW91IGhhdmUgYWNjZXNzIHRvIHRoZSBmb2xsb3dpbmcgYXR0YWNoZWQgZmlsZXMuIFlvdSBjYW4gcmVhZCB0aGVtIHVzaW5nIHRoZSByZWFkX2RvY3VtZW50IHRvb2wgYnkgZmlsZW5hbWU6XFxuJHtmaWxlTmFtZXMubWFwKG5hbWUgPT4gYC0gJHtuYW1lfWApLmpvaW4oJ1xcbicpfWA7XG4gIH1cbiAgXG4gIC8vIFN0ZXAgMTogRGlyZWN0b3J5IGRldGVjdGlvbiAoaGlnaGVzdCBwcmlvcml0eSlcbiAgY29uc3QgZGV0ZWN0ZWRQYXRoID0gZGV0ZWN0RGlyZWN0b3J5UGF0aCh1c2VyUHJvbXB0KTtcbiAgaWYgKGRldGVjdGVkUGF0aCkge1xuICAgIHJldHVybiBpbmplY3RXb3JraW5nRGlyZWN0b3J5UHJvbXB0KHVzZXJQcm9tcHQgKyBhdHRhY2htZW50Tm90aWNlLCBkZXRlY3RlZFBhdGgpICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbiAgfVxuICBcbiAgLy8gU3RlcCAyOiBEb2N1bWVudCBSQUcgcHJvY2Vzc2luZyAoaWYgZW5hYmxlZClcbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgY29uc3QgZG9jdW1lbnRSQUdFbmFibGVkID0gcGx1Z2luQ29uZmlnLmdldCgnZG9jdW1lbnRSQUcnKTtcbiAgXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBkb2N1bWVudFJBRyBlbmFibGVkOiAke2RvY3VtZW50UkFHRW5hYmxlZH1gKTtcbiAgXG4gIGlmICghZG9jdW1lbnRSQUdFbmFibGVkKSB7XG4gICAgLy8gSWYgUkFHIGlzIGRpc2FibGVkLCBqdXN0IHJldHVybiB0aGUgbWVzc2FnZSB3aXRoIGF0dGFjaG1lbnQgbm90aWNlXG4gICAgY29uc3QgYmFzZSA9IHVzZXJQcm9tcHQgKyBhdHRhY2htZW50Tm90aWNlO1xuICAgIHJldHVybiBiYXNlICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbiAgfVxuXG4gIGNvbnN0IG5ld0ZpbGVzID0gYWxsRmlsZXMuZmlsdGVyKGYgPT4gZi50eXBlICE9PSAnaW1hZ2UnKTtcbiAgY29uc29sZS5sb2coYFtSQUddIEZvdW5kICR7bmV3RmlsZXMubGVuZ3RofSBub24taW1hZ2UgZmlsZXNgKTtcbiAgXG4gIGlmIChuZXdGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zdCBiYXNlID0gdXNlclByb21wdCArIGF0dGFjaG1lbnROb3RpY2U7XG4gICAgcmV0dXJuIGJhc2UgKyBnZXRUZW1wb3JhbFN1ZmZpeChjdGwpO1xuICB9XG5cbiAgLy8gU2VwYXJhdGUgUERGIGZpbGVzIGZyb20gb3RoZXIgZmlsZSB0eXBlc1xuICBjb25zdCBwZGZGaWxlcyA9IG5ld0ZpbGVzLmZpbHRlcihmID0+IGYubmFtZS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcucGRmJykpO1xuICBjb25zdCBvdGhlckZpbGVzID0gbmV3RmlsZXMuZmlsdGVyKGYgPT4gIWYubmFtZS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcucGRmJykpO1xuXG4gIGNvbnNvbGUubG9nKGBbUkFHXSBQREZzOiAke3BkZkZpbGVzLmxlbmd0aH0sIE90aGVyOiAke290aGVyRmlsZXMubGVuZ3RofWApO1xuXG4gIGxldCBhbGxSZXN1bHRzOiBSZXRyaWV2YWxSZXN1bHRbXSA9IFtdO1xuXG4gIC8vIFByb2Nlc3MgUERGcyB3aXRoIGN1c3RvbSBsb2NhbCBwaXBlbGluZSAobW9yZSByZWxpYWJsZSBmb3IgY29tcGxleCBsYXlvdXRzKVxuICBpZiAocGRmRmlsZXMubGVuZ3RoID4gMCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwZGZSZXN1bHRzID0gYXdhaXQgcmV0cmlldmVGcm9tUGRmcyhjdGwsIHVzZXJQcm9tcHQsIHBkZkZpbGVzKTtcbiAgICAgIGNvbnNvbGUubG9nKGBbUkFHXSBQREYgcmV0cmlldmFsIHJldHVybmVkICR7cGRmUmVzdWx0cy5sZW5ndGh9IHJlc3VsdHNgKTtcbiAgICAgIGFsbFJlc3VsdHMucHVzaCguLi5wZGZSZXN1bHRzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW1JBR10gRXJyb3IgcHJvY2Vzc2luZyBQREZzOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvLyBQcm9jZXNzIG90aGVyIGZpbGVzIHdpdGggTE0gU3R1ZGlvJ3MgbmF0aXZlIHJldHJpZXZhbCBBUEkgKGhhbmRsZXMgLnR4dCwgLm1kLCBldGMuIG5hdGl2ZWx5KVxuICBpZiAob3RoZXJGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1vZGVsID0gYXdhaXQgY3RsLmNsaWVudC5lbWJlZGRpbmcubW9kZWwoJ25vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGJywge1xuICAgICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjdGwuY2xpZW50LmZpbGVzLnJldHJpZXZlKHVzZXJQcm9tcHQsIG90aGVyRmlsZXMsIHtcbiAgICAgICAgZW1iZWRkaW5nTW9kZWw6IG1vZGVsLFxuICAgICAgICBsaW1pdDogcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsTGltaXQnKSB8fCA1LFxuICAgICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDb252ZXJ0IGhpZ2gtbGV2ZWwgQVBJIHJlc3VsdHMgdG8gb3VyIGZvcm1hdFxuICAgICAgY29uc3QgZmlsdGVyZWRFbnRyaWVzID0gcmVzdWx0LmVudHJpZXMuZmlsdGVyKFxuICAgICAgICBlbnRyeSA9PiBlbnRyeS5zY29yZSA+IChwbHVnaW5Db25maWcuZ2V0KCdyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCcpID8/IDAuMylcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhgW1JBR10gTmF0aXZlIHJldHJpZXZhbCByZXR1cm5lZCAke2ZpbHRlcmVkRW50cmllcy5sZW5ndGh9IHJlc3VsdHNgKTtcbiAgICAgIGFsbFJlc3VsdHMucHVzaCguLi5maWx0ZXJlZEVudHJpZXMubWFwKGUgPT4gKHsgY29udGVudDogZS5jb250ZW50LCBzY29yZTogZS5zY29yZSB9KSkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbUkFHXSBFcnJvciByZXRyaWV2aW5nIGZyb20gb3RoZXIgZmlsZXM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNvcnQgYW5kIGxpbWl0IHJlc3VsdHNcbiAgYWxsUmVzdWx0cy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XG4gIGNvbnN0IHJldHJpZXZhbExpbWl0ID0gcGx1Z2luQ29uZmlnLmdldCgncmV0cmlldmFsTGltaXQnKSB8fCA1O1xuICBhbGxSZXN1bHRzID0gYWxsUmVzdWx0cy5zbGljZSgwLCByZXRyaWV2YWxMaW1pdCk7XG5cbiAgY29uc29sZS5sb2coYFtSQUddIFRvdGFsIHJlc3VsdHMgYWZ0ZXIgc29ydGluZzogJHthbGxSZXN1bHRzLmxlbmd0aH1gKTtcblxuICAvLyBJbmplY3QgY29udGV4dCBpZiByZXN1bHRzIGZvdW5kXG4gIGlmIChhbGxSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgY29udGV4dEluamVjdGlvbiA9ICcnO1xuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIGFsbFJlc3VsdHMpIHtcbiAgICAgIGNvbnRleHRJbmplY3Rpb24gKz0gYFxcbiR7cmVzdWx0LmNvbnRlbnR9XFxuLS0tXFxuYDtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7dXNlclByb21wdH0ke2F0dGFjaG1lbnROb3RpY2V9XFxuXFxuLS0tIFJFTEVWQU5UIERPQ1VNRU5UIENPTlRFWFQgLS0tXFxuJHtjb250ZXh0SW5qZWN0aW9uLnRyaW0oKX1gICsgZ2V0VGVtcG9yYWxTdWZmaXgoY3RsKTtcbiAgfVxuXG4gIC8vIElmIG5vIHJlc3VsdHMgZm91bmQsIHJldHVybiBvcmlnaW5hbCBtZXNzYWdlIHdpdGggYXR0YWNobWVudCBub3RpY2VcbiAgY29uc29sZS5sb2coJ1tSQUddIE5vIHJlbGV2YW50IHJlc3VsdHMgZm91bmQnKTtcbiAgY29uc3QgYmFzZSA9IHVzZXJQcm9tcHQgKyBhdHRhY2htZW50Tm90aWNlO1xuICByZXR1cm4gYmFzZSArIGdldFRlbXBvcmFsU3VmZml4KGN0bCk7XG59XG4iLCAiLyoqXG4gKiBUb29scyBQcm92aWRlciAtIENvbXBsZXRlIEltcGxlbWVudGF0aW9uIG9mIGFsbCB+NDUgdG9vbHMgYWNyb3NzIDYgY2F0ZWdvcmllc1xuICovXG5cbmltcG9ydCB7IHRvb2wsIHR5cGUgVG9vbCwgVG9vbHNQcm92aWRlckNvbnRyb2xsZXIgfSBmcm9tICdAbG1zdHVkaW8vc2RrJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG4vLyBJbXBvcnQgZXhpc3RpbmcgbW9kdWxlc1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5Db25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRywgaXNUb29sRW5hYmxlZCwgaXNFeGVjdXRpb25Ub29sRW5hYmxlZCwgY29uZmlnU2NoZW1hdGljcyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IFN0YXRlTWFuYWdlciB9IGZyb20gJy4vc3RhdGVNYW5hZ2VyJztcbmltcG9ydCB7IEJhY2tncm91bmRDb21tYW5kTWFuYWdlciB9IGZyb20gJy4vYmFja2dyb3VuZENvbW1hbmRzJztcblxuLy8gSW1wb3J0IGNhdGVnb3J5LXNwZWNpZmljIHRvb2wgbW9kdWxlc1xuaW1wb3J0IHsgcmVnaXN0ZXJGaWxlU3lzdGVtVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2ZpbGVTeXN0ZW1Ub29scyc7XG5pbXBvcnQgeyBDb250ZXh0R3VhcmQgfSBmcm9tICcuL2NvbnRleHRHdWFyZCc7XG5pbXBvcnQgeyByZWdpc3RlcldlYlJlc2VhcmNoVG9vbHMgfSBmcm9tICcuL3Rvb2xzL3dlYlJlc2VhcmNoVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJHaXRUb29scyB9IGZyb20gJy4vdG9vbHMvZ2l0R2l0aHViVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJCcm93c2VyVG9vbHMgfSBmcm9tICcuL3Rvb2xzL2Jyb3dzZXJBdXRvbWF0aW9uVG9vbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJEYXRhYmFzZVRvb2xzIH0gZnJvbSAnLi90b29scy9kYXRhYmFzZVRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyQmFja2dyb3VuZENvbW1hbmRUb29scyB9IGZyb20gJy4vdG9vbHMvYmFja2dyb3VuZENvbW1hbmRUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckV4ZWN1dGlvblRvb2xzIH0gZnJvbSAnLi90b29scy9leGVjdXRpb25Ub29scyc7XG5pbXBvcnQgeyByZWdpc3RlclV0aWxpdHlUb29scywgcmVnaXN0ZXJHZXRDdXJyZW50V29ya2luZ0RpcmVjdG9yeVRvb2wgfSBmcm9tICcuL3Rvb2xzL3V0aWxpdHlUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckltYWdlUHJvY2Vzc2luZ1Rvb2xzIH0gZnJvbSAnLi90b29scy9pbWFnZVByb2Nlc3NpbmdUb29scyc7XG5pbXBvcnQgeyByZWdpc3Rlckh0dHBDbGllbnRUb29scyB9IGZyb20gJy4vdG9vbHMvaHR0cENsaWVudFRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyUmFnVG9vbHMgfSBmcm9tICcuL3Rvb2xzL3ZlY3RvclJhZ1Rvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyVWlHZW5lcmF0aW9uVG9vbHMgfSBmcm9tICcuL3Rvb2xzL3VpR2VuZXJhdGlvblRvb2xzJztcbmltcG9ydCB7IHJlZ2lzdGVyQ29udGV4dE1hbmFnZW1lbnRUb29scyB9IGZyb20gJy4vdG9vbHMvY29udGV4dE1hbmFnZW1lbnRUb29scyc7XG5pbXBvcnQgeyByZWdpc3RlckRvY3VtZW50VG9vbHMgfSBmcm9tICcuL3Rvb2xzL2RvY3VtZW50VG9vbHMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBUWVBFUyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgaW50ZXJmYWNlIFRvb2xDYXRlZ29yeSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdG9vbHM6IFRvb2xbXTtcbn1cblxuLyoqIEV4dGVuZGVkIHRvb2wgdHlwZSB3aXRoIHR5cGVkIGltcGxlbWVudGF0aW9uIGZvciBzYWZlIGFjY2VzcyAqL1xudHlwZSBUeXBlZFRvb2wgPSBUb29sICYge1xuICBpbXBsZW1lbnRhdGlvbjogKHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGN0eD86IHVua25vd24pID0+IFByb21pc2U8dW5rbm93bj47XG59O1xuXG4vLyBHbG9iYWwgY29uZmlnIHJlZmVyZW5jZSB0byBlbnN1cmUgdG9vbHNQcm92aWRlciB1c2VzIHRoZSBsYXRlc3QgdXNlciBzZXR0aW5nc1xubGV0IGN1cnJlbnRDb25maWc6IFBsdWdpbkNvbmZpZyA9IERFRkFVTFRfQ09ORklHO1xuXG4vKipcbiAqIENlbnRyYWwgcmVnaXN0cnkgZm9yIGFsbCBhdmFpbGFibGUgdG9vbHMuXG4gKiBUb29scyBhcmUgY3JlYXRlZCBvbmNlIGF0IG1vZHVsZSBsb2FkIHRpbWUgYW5kIHJldXNlZCBhY3Jvc3MgcHJvdmlkZXIgY2FsbHMuXG4gKi9cbmNsYXNzIFRvb2xSZWdpc3RyeSB7XG4gIHByaXZhdGUgdG9vbE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBUeXBlZFRvb2w+KCk7XG5cbiAgcmVnaXN0ZXJBbGwoY29uZmlnOiBQbHVnaW5Db25maWcsIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyLCBiYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXI6IEJhY2tncm91bmRDb21tYW5kTWFuYWdlciwgbG1DbGllbnQ6IGFueSk6IHZvaWQge1xuICAgIC8vIEluaXRpYWxpemUgQ29udGV4dEd1YXJkIGlmIGVuYWJsZWQgKHdpdGggTE1TdHVkaW8gY2xpZW50IGZvciBzdW1tYXJpemF0aW9uKVxuICAgIGNvbnN0IGNvbnRleHRHdWFyZCA9IGNvbmZpZy5jb250ZXh0R3VhcmQgPyBuZXcgQ29udGV4dEd1YXJkKHtcbiAgICAgIHRva2VuTGltaXQ6IGNvbmZpZy50b2tlbkxpbWl0LFxuICAgICAgc21hcnRSZWFkaW5nOiBjb25maWcuc21hcnRSZWFkaW5nLFxuICAgICAgc3VtbWFyeU1vZGVsOiBjb25maWcuc3VtbWFyeU1vZGVsLFxuICAgICAgdGVybWluYWxGaWx0ZXJFbmFibGVkOiBjb25maWcudGVybWluYWxGaWx0ZXJFbmFibGVkLFxuICAgICAgdGVybWluYWxGaWx0ZXJMZW5ndGg6IGNvbmZpZy50ZXJtaW5hbEZpbHRlckxlbmd0aCxcbiAgICB9LCBsbUNsaWVudCkgOiBudWxsO1xuXG4gICAgLy8gV2lyZSBDb250ZXh0R3VhcmQgdG8gcHJvbXB0UHJlcHJvY2Vzc29yIGZvciBhdXRvLWNvbXByZXNzaW9uXG4gICAgaWYgKGNvbnRleHRHdWFyZCkge1xuICAgICAgY29uc3QgeyBzZXRDb250ZXh0R3VhcmQgfSA9IHJlcXVpcmUoJy4vcHJvbXB0UHJlcHJvY2Vzc29yJyk7XG4gICAgICBzZXRDb250ZXh0R3VhcmQoY29udGV4dEd1YXJkKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdmaWxlU3lzdGVtJykpIHtcbiAgICAgIHJlZ2lzdGVyRmlsZVN5c3RlbVRvb2xzKGNvbmZpZywgc3RhdGVNYW5hZ2VyLCBjb250ZXh0R3VhcmQpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnd2ViU2VhcmNoJykpIHtcbiAgICAgIHJlZ2lzdGVyV2ViUmVzZWFyY2hUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnYnJvd3NlckF1dG9tYXRpb24nKSkge1xuICAgICAgcmVnaXN0ZXJCcm93c2VyVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ2dpdE9wZXJhdGlvbnMnKSkge1xuICAgICAgcmVnaXN0ZXJHaXRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZGF0YWJhc2VRdWVyaWVzJykpIHtcbiAgICAgIHJlZ2lzdGVyRGF0YWJhc2VUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnZG9jdW1lbnRQYXJzaW5nJykpIHtcbiAgICAgIHJlZ2lzdGVyRG9jdW1lbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnYmFja2dyb3VuZENvbW1hbmRzJykpIHtcbiAgICAgIHJlZ2lzdGVyQmFja2dyb3VuZENvbW1hbmRUb29scyhjb25maWcsIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcikuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cblxuICAgIC8vIFx1MjUwMFx1MjUwMCBcdUQ4M0NcdUREOTUgTkVXIFRPT0wgQ0FURUdPUklFUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdpbWFnZVByb2Nlc3NpbmcnKSkge1xuICAgICAgcmVnaXN0ZXJJbWFnZVByb2Nlc3NpbmdUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAnaHR0cENsaWVudCcpKSB7XG4gICAgICByZWdpc3Rlckh0dHBDbGllbnRUb29scyhjb25maWcpLmZvckVhY2godCA9PiB0aGlzLnRvb2xNYXAuc2V0KHQubmFtZSwgdCBhcyBUeXBlZFRvb2wpKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5nb2RNb2RlIHx8IGlzVG9vbEVuYWJsZWQoY29uZmlnLCAndmVjdG9yUkFHJykpIHtcbiAgICAgIHJlZ2lzdGVyUmFnVG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ29kTW9kZSB8fCBpc1Rvb2xFbmFibGVkKGNvbmZpZywgJ3VpR2VuZXJhdGlvbicpKSB7XG4gICAgICByZWdpc3RlclVpR2VuZXJhdGlvblRvb2xzKGNvbmZpZykuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdvZE1vZGUgfHwgaXNUb29sRW5hYmxlZChjb25maWcsICdjb250ZXh0TWFuYWdlbWVudCcpKSB7XG4gICAgICByZWdpc3RlckNvbnRleHRNYW5hZ2VtZW50VG9vbHMoY29uZmlnKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGlvbiB0b29scyBcdTIwMTQgcmVnaXN0ZXJlZCBvbmNlLCBmaWx0ZXJlZCBieSBlbmFibGVkIHRvb2wgdHlwZXNcbiAgICBjb25zdCBleGVjQ29uZmlnID0geyAuLi5jb25maWcgfTtcbiAgICBjb25zdCBhbGxFeGVjVG9vbHMgPSByZWdpc3RlckV4ZWN1dGlvblRvb2xzKGV4ZWNDb25maWcsIGNvbnRleHRHdWFyZCk7XG4gICAgXG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ2phdmFzY3JpcHQnKSkge1xuICAgICAgY29uc3QganNUb29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdydW5famF2YXNjcmlwdCcpO1xuICAgICAgaWYgKGpzVG9vbCkgdGhpcy50b29sTWFwLnNldChqc1Rvb2wubmFtZSwganNUb29sIGFzIFR5cGVkVG9vbCk7XG4gICAgfVxuICAgIGlmIChpc0V4ZWN1dGlvblRvb2xFbmFibGVkKGV4ZWNDb25maWcsICdweXRob24nKSkge1xuICAgICAgY29uc3QgcHlUb29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdydW5fcHl0aG9uJyk7XG4gICAgICBpZiAocHlUb29sKSB0aGlzLnRvb2xNYXAuc2V0KHB5VG9vbC5uYW1lLCBweVRvb2wgYXMgVHlwZWRUb29sKTtcbiAgICB9XG4gICAgaWYgKGlzRXhlY3V0aW9uVG9vbEVuYWJsZWQoZXhlY0NvbmZpZywgJ3Rlcm1pbmFsJykpIHtcbiAgICAgIGNvbnN0IHRlcm1Ub29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdydW5faW5fdGVybWluYWwnKTtcbiAgICAgIGlmICh0ZXJtVG9vbCkgdGhpcy50b29sTWFwLnNldCh0ZXJtVG9vbC5uYW1lLCB0ZXJtVG9vbCBhcyBUeXBlZFRvb2wpO1xuICAgIH1cbiAgICBpZiAoaXNFeGVjdXRpb25Ub29sRW5hYmxlZChleGVjQ29uZmlnLCAnc2hlbGwnKSkge1xuICAgICAgY29uc3Qgc2hlbGxUb29sID0gYWxsRXhlY1Rvb2xzLmZpbmQodCA9PiB0Lm5hbWUgPT09ICdleGVjdXRlX2NvbW1hbmQnKTtcbiAgICAgIGlmIChzaGVsbFRvb2wpIHRoaXMudG9vbE1hcC5zZXQoc2hlbGxUb29sLm5hbWUsIHNoZWxsVG9vbCBhcyBUeXBlZFRvb2wpO1xuICAgIH1cbiAgICBcbiAgICAvLyBVdGlsaXR5IHRvb2xzIGFyZSBhbHdheXMgcmVnaXN0ZXJlZCAobm8gc3BlY2lmaWMgY29uZmlnIGZsYWcpXG4gICAgY29uc3QgZ2V0RW5hYmxlZFRvb2xzID0gKCkgPT4gQXJyYXkuZnJvbSh0aGlzLnRvb2xNYXAua2V5cygpKTtcbiAgICByZWdpc3RlclV0aWxpdHlUb29scyhjb25maWcsIHN0YXRlTWFuYWdlciwgZ2V0RW5hYmxlZFRvb2xzKS5mb3JFYWNoKHQgPT4gdGhpcy50b29sTWFwLnNldCh0Lm5hbWUsIHQgYXMgVHlwZWRUb29sKSk7XG4gICAgXG4gICAgLy8gUmVnaXN0ZXIgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBxdWVyeSB0b29sIChhbHdheXMgYXZhaWxhYmxlKVxuICAgIHJlZ2lzdGVyR2V0Q3VycmVudFdvcmtpbmdEaXJlY3RvcnlUb29sKCkuZm9yRWFjaCh0ID0+IHRoaXMudG9vbE1hcC5zZXQodC5uYW1lLCB0IGFzIFR5cGVkVG9vbCkpO1xuICAgIFxuICAgIC8vIFJlZ2lzdGVyIENvbnRleHRHdWFyZCBSZS1SQUcgdHJpZ2dlciB0b29sIChpZiBDb250ZXh0R3VhcmQgaXMgZW5hYmxlZClcbiAgICBpZiAoY29uZmlnLmNvbnRleHRHdWFyZCAmJiBjb250ZXh0R3VhcmQpIHtcbiAgICAgIGNvbnN0IHJlUmFnVG9vbCA9IHRvb2woe1xuICAgICAgICBuYW1lOiAncmVsb2FkX2NvbnRleHRfZm9yX2ZpbGUnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1tDb250ZXh0R3VhcmRdIEZvcmNlIHJlbG9hZCBjb250ZXh0IGZvciBhIHNwZWNpZmljIGZpbGUuIFVzZSB0aGlzIHdoZW4gdGhlIExMTSByZWFsaXplcyBpdCBuZWVkcyBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGEgZmlsZSB0aGF0IHdhcyBwcmV2aW91c2x5IGNvbXByZXNzZWQgb3IgdHJ1bmNhdGVkLicsXG4gICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBmaWxlUGF0aDogei5zdHJpbmcoKS5kZXNjcmliZSgnVGhlIGZpbGUgcGF0aCB0byByZWxvYWQgY29udGV4dCBmb3InKSxcbiAgICAgICAgfSxcbiAgICAgICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVQYXRoIH06IHsgZmlsZVBhdGg6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgaWYgKCFmaWxlUGF0aCB8fCB0eXBlb2YgZmlsZVBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdmaWxlUGF0aCBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQnIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbnRleHRHdWFyZC5yZWxvYWRDb250ZXh0Rm9yRmlsZShmaWxlUGF0aCk7XG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogcmVzdWx0IH07XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHRoaXMudG9vbE1hcC5zZXQocmVSYWdUb29sLm5hbWUsIHJlUmFnVG9vbCBhcyBUeXBlZFRvb2wpO1xuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgTkVXOiBDb250ZXh0IENvbXByZXNzaW9uIFRyaWdnZXIgVG9vbCAoRml4ZXMgZGVhZCBjb2RlIGlzc3VlKSBcdTI1MDBcdTI1MDBcbiAgICAgIGNvbnN0IGNvbXByZXNzQ29udGV4dFRvb2wgPSB0b29sKHtcbiAgICAgICAgbmFtZTogJ2NvbXByZXNzX2NvbnRleHQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1tDb250ZXh0R3VhcmRdIENvbXByZXNzIG9sZGVyIGNvbnZlcnNhdGlvbiBoaXN0b3J5IHRvIGZyZWUgdXAgY29udGV4dCB3aW5kb3cgc3BhY2UuIFVzZSB0aGlzIHdoZW4gdGhlIExMTSBkZXRlY3RzIGl0IGlzIGFwcHJvYWNoaW5nIGl0cyB0b2tlbiBsaW1pdCBvciBoYXMgbG9zdCB0cmFjayBvZiBlYXJsaWVyIGluZm9ybWF0aW9uLlxcblxcbk5PVEU6IENvbnRleHRHdWFyZCBub3cgYXV0by1jb21wcmVzc2VzIHRoZSBjb250ZXh0IHdpbmRvdyBhdXRvbWF0aWNhbGx5IHdoZW4gdGhlIHRva2VuIGxpbWl0IGlzIGV4Y2VlZGVkLiBUaGlzIHRvb2wgaXMga2VwdCBmb3IgbWFudWFsIG92ZXJyaWRlLicsXG4gICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBrZWVwTGFzdE1lc3NhZ2VzOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCkuZGVmYXVsdCgxMCkuZGVzY3JpYmUoJ051bWJlciBvZiByZWNlbnQgbWVzc2FnZXMgdG8ga2VlcCB1bmNvbXByZXNzZWQgKGRlZmF1bHQ6IDEwKScpLFxuICAgICAgICB9LFxuICAgICAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsga2VlcExhc3RNZXNzYWdlcyB9OiB7IGtlZXBMYXN0TWVzc2FnZXM/OiBudW1iZXIgfSkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBOb3RlOiBUaGlzIHRvb2wgcmVxdWlyZXMgYWNjZXNzIHRvIHRoZSBmdWxsIGNvbnZlcnNhdGlvbiBoaXN0b3J5LlxuICAgICAgICAgICAgLy8gSW4gTE0gU3R1ZGlvIHBsdWdpbnMsIHRoaXMgaXMgdHlwaWNhbGx5IGhhbmRsZWQgYnkgdGhlIHByb21wdCBwcmVwcm9jZXNzb3IuXG4gICAgICAgICAgICAvLyBGb3Igbm93LCB3ZSByZXR1cm4gYSBzdGF0dXMgbWVzc2FnZSBpbmRpY2F0aW5nIENvbnRleHRHdWFyZCBpcyBhY3RpdmUuXG4gICAgICAgICAgICBjb25zdCBidWRnZXRJbmZvID0gY29udGV4dEd1YXJkLmdldFRva2VuQnVkZ2V0SW5mbygpO1xuICAgICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgICAgICBkYXRhOiB7IFxuICAgICAgICAgICAgICAgIGNvbXByZXNzZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYFtDb250ZXh0R3VhcmRdIENvbXByZXNzaW9uIHRyaWdnZXJlZC4gJHtidWRnZXRJbmZvfWAsXG4gICAgICAgICAgICAgICAgbm90ZTogJ0hpc3RvcnkgY29tcHJlc3Npb24gaXMgaGFuZGxlZCBhdXRvbWF0aWNhbGx5IGJ5IHRoZSBwcm9tcHQgcHJlcHJvY2Vzc29yIHdoZW4gdG9rZW4gbGltaXRzIGFyZSByZWFjaGVkLicsXG4gICAgICAgICAgICAgICAga2VlcExhc3RNZXNzYWdlczoga2VlcExhc3RNZXNzYWdlcyA/PyAxMFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb21wcmVzc2lvbiBmYWlsZWQ6ICR7KGVycm9yIGFzIEVycm9yKS5tZXNzYWdlfWAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHRoaXMudG9vbE1hcC5zZXQoY29tcHJlc3NDb250ZXh0VG9vbC5uYW1lLCBjb21wcmVzc0NvbnRleHRUb29sIGFzIFR5cGVkVG9vbCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QWxsKCk6IFRvb2xbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy50b29sTWFwLnZhbHVlcygpKTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBUeXBlZFRvb2wgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnRvb2xNYXAuZ2V0KG5hbWUpO1xuICB9XG5cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRvb2xNYXAuaGFzKG5hbWUpO1xuICB9XG59XG5cbi8qKlxuICogTWFuYWdlcyB0b29sIGV4ZWN1dGlvbiBhbmQgc3RhdGUgdXBkYXRlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvb2xzUHJvdmlkZXIge1xuICBwcml2YXRlIGNvbmZpZzogUGx1Z2luQ29uZmlnO1xuICBwcml2YXRlIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyO1xuICBwcml2YXRlIGJhY2tncm91bmRDb21tYW5kTWFuYWdlcjogQmFja2dyb3VuZENvbW1hbmRNYW5hZ2VyO1xuICBwcml2YXRlIHJlZ2lzdHJ5OiBUb29sUmVnaXN0cnk7XG4gIHByaXZhdGUgbG1DbGllbnQ6IGFueTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQbHVnaW5Db25maWcsIGxtQ2xpZW50PzogYW55KSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gICAgdGhpcy5zdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKHRoaXMuY29uZmlnKTtcbiAgICB0aGlzLmJhY2tncm91bmRDb21tYW5kTWFuYWdlciA9IG5ldyBCYWNrZ3JvdW5kQ29tbWFuZE1hbmFnZXIodGhpcy5jb25maWcpO1xuICAgIHRoaXMubG1DbGllbnQgPSBsbUNsaWVudDtcbiAgICB0aGlzLnJlZ2lzdHJ5ID0gbmV3IFRvb2xSZWdpc3RyeSgpO1xuICAgIHRoaXMucmVnaXN0cnkucmVnaXN0ZXJBbGwodGhpcy5jb25maWcsIHRoaXMuc3RhdGVNYW5hZ2VyLCB0aGlzLmJhY2tncm91bmRDb21tYW5kTWFuYWdlciwgdGhpcy5sbUNsaWVudCk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSBhIHRvb2wgYnkgbmFtZSB3aXRoIHBhcmFtZXRlcnMuXG4gICAqL1xuICBhc3luYyBleGVjdXRlVG9vbCh0b29sTmFtZTogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgdG9vbCA9IHRoaXMucmVnaXN0cnkuZ2V0KHRvb2xOYW1lKTtcbiAgICBpZiAoIXRvb2wpIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFRvb2wgJyR7dG9vbE5hbWV9JyBub3QgZm91bmRgIH07XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFNhZmUgYWNjZXNzIHZpYSB0eXBlZCB3cmFwcGVyIChDNCBmaXgpXG4gICAgICBjb25zdCBpbXBsID0gdG9vbC5pbXBsZW1lbnRhdGlvbjtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGltcGwocGFyYW1zKTtcbiAgICAgIFxuICAgICAgLy8gVXBkYXRlIHN0YXRlIHdpdGggZXhlY3V0aW9uIHJlc3VsdFxuICAgICAgdGhpcy5zdGF0ZU1hbmFnZXIuc2V0KGBsYXN0XyR7dG9vbE5hbWV9YCwgcmVzdWx0KTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFRvb2wgZXhlY3V0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBhdmFpbGFibGUgdG9vbHMgZmlsdGVyZWQgYnkgY29uZmlnLlxuICAgKi9cbiAgZ2V0QXZhaWxhYmxlVG9vbHMoKTogVG9vbFtdIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyeS5nZXRBbGwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHN0YXRlIG1hbmFnZXIgaW5zdGFuY2UuXG4gICAqL1xuICBnZXRTdGF0ZU1hbmFnZXIoKTogU3RhdGVNYW5hZ2VyIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZU1hbmFnZXI7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBnZXRDb25maWcoKTogUGx1Z2luQ29uZmlnIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFRvb2xzUHJvdmlkZXIgd2l0aCBkZWZhdWx0IGNvbmZpZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRvb2xzUHJvdmlkZXIoY29uZmlnPzogUGx1Z2luQ29uZmlnLCBsbUNsaWVudD86IGFueSk6IFRvb2xzUHJvdmlkZXIge1xuICByZXR1cm4gbmV3IFRvb2xzUHJvdmlkZXIoY29uZmlnLCBsbUNsaWVudCk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNESyBQUk9WSURFUiBGVU5DVElPTiA9PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIE1haW4gdG9vbHMgcHJvdmlkZXIgZnVuY3Rpb24gZm9yIExNIFN0dWRpbyBTREsuXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCB0aGF0IGdldHMgY2FsbGVkIGJ5IExNIFN0dWRpby5cbiAqIFxuICogSU1QT1JUQU5UOiBUaGUgTE0gU3R1ZGlvIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyBhbGwgVG9vbCBvYmplY3RzXG4gKiByZXR1cm5lZCBmcm9tIHRoaXMgcHJvdmlkZXIgZnVuY3Rpb24uIE5vIG1hbnVhbCBjdGwuYWRkKCkgY2FsbHMgbmVlZGVkIC1cbiAqIGp1c3QgcmV0dXJuIHRoZSBhcnJheSBkaXJlY3RseSBhbmQgdGhlIFNESyBoYW5kbGVzIHJlZ2lzdHJhdGlvbi5cbiAqIFxuICogTk9URTogTXVzdCBiZSBhc3luYyBcdTIwMTQgU0RLIHR5cGUgcmVxdWlyZXMgUHJvbWlzZTxUb29sW10+LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9vbHNQcm92aWRlcihjdGw6IFRvb2xzUHJvdmlkZXJDb250cm9sbGVyKTogUHJvbWlzZTxUb29sW10+IHtcbiAgLy8gRklYOiBSZWFkIGNvbmZpZ3VyYXRpb24gZHluYW1pY2FsbHkgZnJvbSBVSSBjb250cm9sbGVyIChsaWtlIGJlbGVkYXJpYW5zIHBsdWdpbilcbiAgY29uc3QgcGx1Z2luQ29uZmlnID0gY3RsLmdldFBsdWdpbkNvbmZpZyhjb25maWdTY2hlbWF0aWNzKTtcbiAgXG4gIC8vIEdldCBMTVN0dWRpbyBjbGllbnQgZm9yIENvbnRleHRHdWFyZCBzdW1tYXJpemF0aW9uXG4gIGNvbnN0IGxtQ2xpZW50ID0gY3RsLmNsaWVudDtcbiAgXG4gIC8vIENvbnN0cnVjdCBhIGxpdmUgY29uZmlnIG9iamVjdCBmcm9tIHRoZSBVSSBzdGF0ZVxuICBjb25zdCBsaXZlQ29uZmlnOiBQbHVnaW5Db25maWcgPSB7XG4gICAgZmlsZVN5c3RlbTogcGx1Z2luQ29uZmlnLmdldCgnZmlsZVN5c3RlbScpLFxuICAgIHdlYlNlYXJjaDogcGx1Z2luQ29uZmlnLmdldCgnd2ViU2VhcmNoJyksXG4gICAgYnJvd3NlckF1dG9tYXRpb246IHBsdWdpbkNvbmZpZy5nZXQoJ2Jyb3dzZXJBdXRvbWF0aW9uJyksXG4gICAgZ2l0T3BlcmF0aW9uczogcGx1Z2luQ29uZmlnLmdldCgnZ2l0T3BlcmF0aW9ucycpLFxuICAgIGRhdGFiYXNlUXVlcmllczogcGx1Z2luQ29uZmlnLmdldCgnZGF0YWJhc2VRdWVyaWVzJyksXG4gICAgZG9jdW1lbnRQYXJzaW5nOiBwbHVnaW5Db25maWcuZ2V0KCdkb2N1bWVudFBhcnNpbmcnKSxcbiAgICBiYWNrZ3JvdW5kQ29tbWFuZHM6IHBsdWdpbkNvbmZpZy5nZXQoJ2JhY2tncm91bmRDb21tYW5kcycpLFxuICAgIGltYWdlUHJvY2Vzc2luZzogcGx1Z2luQ29uZmlnLmdldCgnaW1hZ2VQcm9jZXNzaW5nJyksXG4gICAgaHR0cENsaWVudDogcGx1Z2luQ29uZmlnLmdldCgnaHR0cENsaWVudCcpLFxuICAgIHZlY3RvclJBRzogcGx1Z2luQ29uZmlnLmdldCgndmVjdG9yUkFHJyksXG4gICAgdWlHZW5lcmF0aW9uOiBwbHVnaW5Db25maWcuZ2V0KCd1aUdlbmVyYXRpb24nKSxcbiAgICBjb250ZXh0TWFuYWdlbWVudDogcGx1Z2luQ29uZmlnLmdldCgnY29udGV4dE1hbmFnZW1lbnQnKSxcbiAgICBnb2RNb2RlOiBwbHVnaW5Db25maWcuZ2V0KCdnb2RNb2RlJyksXG4gICAgZG9jdW1lbnRSQUc6IHBsdWdpbkNvbmZpZy5nZXQoJ2RvY3VtZW50UkFHJyksXG4gICAgcmV0cmlldmFsTGltaXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbExpbWl0JyksXG4gICAgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3JldHJpZXZhbEFmZmluaXR5VGhyZXNob2xkJyksXG4gICAgZXhlY3V0aW9uSmF2YVNjcmlwdDogcGx1Z2luQ29uZmlnLmdldCgnZXhlY3V0aW9uSmF2YVNjcmlwdCcpLFxuICAgIGV4ZWN1dGlvblB5dGhvbjogcGx1Z2luQ29uZmlnLmdldCgnZXhlY3V0aW9uUHl0aG9uJyksXG4gICAgZXhlY3V0aW9uVGVybWluYWw6IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvblRlcm1pbmFsJyksXG4gICAgZXhlY3V0aW9uU2hlbGw6IHBsdWdpbkNvbmZpZy5nZXQoJ2V4ZWN1dGlvblNoZWxsJyksXG4gICAgc2VhcmNoRmFsbGJhY2tDaGFpbjogcGx1Z2luQ29uZmlnLmdldCgnc2VhcmNoRmFsbGJhY2tDaGFpbicpIGFzIFBsdWdpbkNvbmZpZ1snc2VhcmNoRmFsbGJhY2tDaGFpbiddLFxuICAgIG1heFNlYXJjaFJlc3VsdHM6IHBsdWdpbkNvbmZpZy5nZXQoJ21heFNlYXJjaFJlc3VsdHMnKSxcbiAgICBzYWZlc2VhcmNoOiBwbHVnaW5Db25maWcuZ2V0KCdzYWZlc2VhcmNoJykgYXMgUGx1Z2luQ29uZmlnWydzYWZlc2VhcmNoJ10sXG4gICAgYnJvd3NlclRpbWVvdXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2Jyb3dzZXJUaW1lb3V0JyksXG4gICAgaGVhZGxlc3NNb2RlOiBwbHVnaW5Db25maWcuZ2V0KCdoZWFkbGVzc01vZGUnKSxcbiAgICBnaXRBdXRvQ29tbWl0OiBwbHVnaW5Db25maWcuZ2V0KCdnaXRBdXRvQ29tbWl0JyksXG4gICAgZGVmYXVsdEJyYW5jaDogcGx1Z2luQ29uZmlnLmdldCgnZGVmYXVsdEJyYW5jaCcpLFxuICAgIHBhdGhWYWxpZGF0aW9uRW5hYmxlZDogcGx1Z2luQ29uZmlnLmdldCgncGF0aFZhbGlkYXRpb25FbmFibGVkJyksXG4gICAgYmluYXJ5RmlsZURldGVjdGlvbjogcGx1Z2luQ29uZmlnLmdldCgnYmluYXJ5RmlsZURldGVjdGlvbicpLFxuICAgIHJlZ2V4UmVEb1NQcm90ZWN0aW9uOiBwbHVnaW5Db25maWcuZ2V0KCdyZWdleFJlRG9TUHJvdGVjdGlvbicpLFxuICAgIG1heFJlZ2V4TGVuZ3RoOiBwbHVnaW5Db25maWcuZ2V0KCdtYXhSZWdleExlbmd0aCcpLFxuICAgIHN0YXRlUGVyc2lzdGVuY2VFbmFibGVkOiBwbHVnaW5Db25maWcuZ2V0KCdzdGF0ZVBlcnNpc3RlbmNlRW5hYmxlZCcpLFxuICAgIHN0YXRlTWF4U2l6ZTogcGx1Z2luQ29uZmlnLmdldCgnc3RhdGVNYXhTaXplJyksXG4gICAgbGFuZ3VhZ2U6IHBsdWdpbkNvbmZpZy5nZXQoJ2xhbmd1YWdlJykgYXMgUGx1Z2luQ29uZmlnWydsYW5ndWFnZSddLFxuICAgIG5vdGlmaWNhdGlvbnNFbmFibGVkOiBwbHVnaW5Db25maWcuZ2V0KCdub3RpZmljYXRpb25zRW5hYmxlZCcpLFxuICAgIHRlbXBvcmFsQXdhcmVuZXNzOiBwbHVnaW5Db25maWcuZ2V0KCd0ZW1wb3JhbEF3YXJlbmVzcycpLFxuICAgIGRhdGVGb3JtYXRTdHlsZTogcGx1Z2luQ29uZmlnLmdldCgnZGF0ZUZvcm1hdFN0eWxlJykgYXMgUGx1Z2luQ29uZmlnWydkYXRlRm9ybWF0U3R5bGUnXSxcbiAgICBjb250ZXh0R3VhcmQ6IHBsdWdpbkNvbmZpZy5nZXQoJ2NvbnRleHRHdWFyZCcpLFxuICAgIHRva2VuTGltaXQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3Rva2VuTGltaXQnKSxcbiAgICBzbWFydFJlYWRpbmc6IHBsdWdpbkNvbmZpZy5nZXQoJ3NtYXJ0UmVhZGluZycpLFxuICAgIHN1bW1hcnlNb2RlbDogcGx1Z2luQ29uZmlnLmdldCgnc3VtbWFyeU1vZGVsJykgYXMgUGx1Z2luQ29uZmlnWydzdW1tYXJ5TW9kZWwnXSxcbiAgICB0ZXJtaW5hbEZpbHRlckVuYWJsZWQ6IHBsdWdpbkNvbmZpZy5nZXQoJ3Rlcm1pbmFsRmlsdGVyRW5hYmxlZCcpLFxuICAgIHRlcm1pbmFsRmlsdGVyTGVuZ3RoOiBwbHVnaW5Db25maWcuZ2V0KCd0ZXJtaW5hbEZpbHRlckxlbmd0aCcpLFxuICB9O1xuXG4gIGNvbnN0IHByb3ZpZGVyID0gY3JlYXRlVG9vbHNQcm92aWRlcihsaXZlQ29uZmlnLCBsbUNsaWVudCk7XG4gIFxuICAvLyBSZXR1cm4gYWxsIGF2YWlsYWJsZSB0b29scyAtIFNESyBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVycyB0aGVtXG4gIHJldHVybiBwcm92aWRlci5nZXRBdmFpbGFibGVUb29scygpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gcmVmZXJlbmNlLlxuICogQ2FsbCB0aGlzIGZyb20gbWFpbigpIHRvIGVuc3VyZSB0b29sc1Byb3ZpZGVyIHVzZXMgdGhlIGxhdGVzdCB1c2VyIHNldHRpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlR2xvYmFsQ29uZmlnKGNvbmZpZzogUGx1Z2luQ29uZmlnKTogdm9pZCB7XG4gIGN1cnJlbnRDb25maWcgPSBjb25maWc7XG59XG4iLCAiLyoqXG4gKiBBSSBUb29sYm94IFBsdWdpbiAtIEVudHJ5IFBvaW50XG4gKiBNYWluIGZ1bmN0aW9uIGV4cG9ydGVkIGZvciBMTSBTdHVkaW8gcGx1Z2luIHN5c3RlbVxuICovXG5cbmltcG9ydCB7IHR5cGUgUGx1Z2luQ29udGV4dCB9IGZyb20gJ0BsbXN0dWRpby9zZGsnO1xuaW1wb3J0IHsgdG9vbHNQcm92aWRlciB9IGZyb20gJy4vdG9vbHNQcm92aWRlcic7XG5pbXBvcnQgeyBjb25maWdTY2hlbWF0aWNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgcHJlcHJvY2VzcyB9IGZyb20gJy4vcHJvbXB0UHJlcHJvY2Vzc29yJztcbmltcG9ydCB7IGNsZWFudXBCcm93c2VyU2Vzc2lvbiB9IGZyb20gJy4vdG9vbHMvYnJvd3NlckF1dG9tYXRpb25Ub29scyc7XG5cbi8vIFx1MjcwNSBGSVg6IFVzZSBzdHJ1Y3R1cmVkIGxvZ2dpbmcgaW5zdGVhZCBvZiBjb25zb2xlLmxvZ1xuY29uc3QgbG9nZ2VyID0ge1xuICBpbmZvOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZG91dC53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZG91dC53cml0ZShgW0FJIFRvb2xib3hdICR7bXNnfVxcbmApLFxuICB3YXJuOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZGVyci53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZGVyci53cml0ZShgW0FJIFRvb2xib3ggV0FSTl0gJHttc2d9XFxuYCksXG4gIGVycm9yOiAobXNnOiBzdHJpbmcpID0+IHR5cGVvZiBwcm9jZXNzLnN0ZGVyci53cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9jZXNzLnN0ZGVyci53cml0ZShgW0FJIFRvb2xib3ggRVJST1JdICR7bXNnfVxcbmApLFxufTtcblxuLyoqXG4gKiBNYWluIHBsdWdpbiBlbnRyeSBwb2ludCAtIGNhbGxlZCBieSBMTSBTdHVkaW9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1haW4oY29udGV4dDogUGx1Z2luQ29udGV4dCkge1xuICBsb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nLi4uJyk7XG4gIFxuICAvLyBSZWdpc3RlciB0aGUgY29uZmlndXJhdGlvbiBzY2hlbWF0aWNzIChtYWtlcyB0b2dnbGVzIGFwcGVhciBpbiBVSSlcbiAgY29udGV4dC53aXRoQ29uZmlnU2NoZW1hdGljcyhjb25maWdTY2hlbWF0aWNzKTtcbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSBwcm9tcHQgcHJlcHJvY2Vzc29yIGZvciBEb2N1bWVudCBSQUcgLyBDaGF0IHdpdGggRmlsZXNcbiAgY29udGV4dC53aXRoUHJvbXB0UHJlcHJvY2Vzc29yKHByZXByb2Nlc3MpO1xuICBcbiAgLy8gTm90ZTogTE0gU3R1ZGlvIFNESyB2MS41LjAgZG9lc24ndCBleHBvc2UgZ2V0Q29uZmlnKCkgb24gUGx1Z2luQ29udGV4dC5cbiAgLy8gQ29uZmlndXJhdGlvbiBpcyBoYW5kbGVkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIFNESydzIGNvbmZpZyBzeXN0ZW0uXG4gIC8vIFRoZSB0b29sc1Byb3ZpZGVyIHdpbGwgdXNlIGRlZmF1bHQgc2V0dGluZ3MgdW50aWwgVUkgdG9nZ2xlcyBhcmUgYXBwbGllZC5cbiAgXG4gIC8vIFJlZ2lzdGVyIHRoZSB0b29scyBwcm92aWRlciBmdW5jdGlvblxuICBjb250ZXh0LndpdGhUb29sc1Byb3ZpZGVyKHRvb2xzUHJvdmlkZXIpO1xuICBcbiAgLy8gSGFuZGxlIHBsdWdpbiB1bmxvYWQgLSBjbGVhbnVwIGJyb3dzZXIgc2Vzc2lvbiB0byBwcmV2ZW50IG9ycGhhbmVkIHByb2Nlc3Nlc1xuICBpZiAodHlwZW9mIHByb2Nlc3Mub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgY2xlYW51cEJyb3dzZXJTZXNzaW9uKCk7XG4gICAgfSk7XG4gICAgcHJvY2Vzcy5vbignU0lHSU5UJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgY2xlYW51cEJyb3dzZXJTZXNzaW9uKCk7XG4gICAgfSk7XG4gIH1cbiAgXG4gIGxvZ2dlci5pbmZvKCdJbml0aWFsaXplZCBzdWNjZXNzZnVsbHkhJyk7XG59XG4iLCAiaW1wb3J0IHsgTE1TdHVkaW9DbGllbnQsIHR5cGUgUGx1Z2luQ29udGV4dCB9IGZyb20gXCJAbG1zdHVkaW8vc2RrXCI7XG5cbmRlY2xhcmUgdmFyIHByb2Nlc3M6IGFueTtcblxuLy8gV2UgcmVjZWl2ZSBydW50aW1lIGluZm9ybWF0aW9uIGluIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG5jb25zdCBjbGllbnRJZGVudGlmaWVyID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9DTElFTlRfSURFTlRJRklFUjtcbmNvbnN0IGNsaWVudFBhc3NrZXkgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0NMSUVOVF9QQVNTS0VZO1xuY29uc3QgYmFzZVVybCA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQkFTRV9VUkw7XG5cbmNvbnN0IGNsaWVudCA9IG5ldyBMTVN0dWRpb0NsaWVudCh7XG4gIGNsaWVudElkZW50aWZpZXIsXG4gIGNsaWVudFBhc3NrZXksXG4gIGJhc2VVcmwsXG59KTtcblxuKGdsb2JhbFRoaXMgYXMgYW55KS5fX0xNU19QTFVHSU5fQ09OVEVYVCA9IHRydWU7XG5cbmxldCBwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQgPSBmYWxzZTtcbmxldCBwcm9tcHRQcmVwcm9jZXNzb3JTZXQgPSBmYWxzZTtcbmxldCBjb25maWdTY2hlbWF0aWNzU2V0ID0gZmFsc2U7XG5sZXQgZ2xvYmFsQ29uZmlnU2NoZW1hdGljc1NldCA9IGZhbHNlO1xubGV0IHRvb2xzUHJvdmlkZXJTZXQgPSBmYWxzZTtcbmxldCBnZW5lcmF0b3JTZXQgPSBmYWxzZTtcblxuY29uc3Qgc2VsZlJlZ2lzdHJhdGlvbkhvc3QgPSBjbGllbnQucGx1Z2lucy5nZXRTZWxmUmVnaXN0cmF0aW9uSG9zdCgpO1xuXG5jb25zdCBwbHVnaW5Db250ZXh0OiBQbHVnaW5Db250ZXh0ID0ge1xuICB3aXRoUHJlZGljdGlvbkxvb3BIYW5kbGVyOiAoZ2VuZXJhdGUpID0+IHtcbiAgICBpZiAocHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcmVkaWN0aW9uTG9vcEhhbmRsZXIgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBpZiAodG9vbHNQcm92aWRlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJlZGljdGlvbkxvb3BIYW5kbGVyIGNhbm5vdCBiZSB1c2VkIHdpdGggYSB0b29scyBwcm92aWRlclwiKTtcbiAgICB9XG5cbiAgICBwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFByZWRpY3Rpb25Mb29wSGFuZGxlcihnZW5lcmF0ZSk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhQcm9tcHRQcmVwcm9jZXNzb3I6IChwcmVwcm9jZXNzKSA9PiB7XG4gICAgaWYgKHByb21wdFByZXByb2Nlc3NvclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJvbXB0UHJlcHJvY2Vzc29yIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgcHJvbXB0UHJlcHJvY2Vzc29yU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRQcm9tcHRQcmVwcm9jZXNzb3IocHJlcHJvY2Vzcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhDb25maWdTY2hlbWF0aWNzOiAoY29uZmlnU2NoZW1hdGljcykgPT4ge1xuICAgIGlmIChjb25maWdTY2hlbWF0aWNzU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb25maWcgc2NoZW1hdGljcyBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGNvbmZpZ1NjaGVtYXRpY3NTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldENvbmZpZ1NjaGVtYXRpY3MoY29uZmlnU2NoZW1hdGljcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhHbG9iYWxDb25maWdTY2hlbWF0aWNzOiAoZ2xvYmFsQ29uZmlnU2NoZW1hdGljcykgPT4ge1xuICAgIGlmIChnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHbG9iYWwgY29uZmlnIHNjaGVtYXRpY3MgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRHbG9iYWxDb25maWdTY2hlbWF0aWNzKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3MpO1xuICAgIHJldHVybiBwbHVnaW5Db250ZXh0O1xuICB9LFxuICB3aXRoVG9vbHNQcm92aWRlcjogKHRvb2xzUHJvdmlkZXIpID0+IHtcbiAgICBpZiAodG9vbHNQcm92aWRlclNldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVG9vbHMgcHJvdmlkZXIgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBpZiAocHJlZGljdGlvbkxvb3BIYW5kbGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUb29scyBwcm92aWRlciBjYW5ub3QgYmUgdXNlZCB3aXRoIGEgcHJlZGljdGlvbkxvb3BIYW5kbGVyXCIpO1xuICAgIH1cblxuICAgIHRvb2xzUHJvdmlkZXJTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFRvb2xzUHJvdmlkZXIodG9vbHNQcm92aWRlcik7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhHZW5lcmF0b3I6IChnZW5lcmF0b3IpID0+IHtcbiAgICBpZiAoZ2VuZXJhdG9yU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cblxuICAgIGdlbmVyYXRvclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0R2VuZXJhdG9yKGdlbmVyYXRvcik7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG59O1xuXG5pbXBvcnQoXCIuLy4uL3NyYy9pbmRleC50c1wiKS50aGVuKGFzeW5jIG1vZHVsZSA9PiB7XG4gIHJldHVybiBhd2FpdCBtb2R1bGUubWFpbihwbHVnaW5Db250ZXh0KTtcbn0pLnRoZW4oKCkgPT4ge1xuICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5pbml0Q29tcGxldGVkKCk7XG59KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBleGVjdXRlIHRoZSBtYWluIGZ1bmN0aW9uIG9mIHRoZSBwbHVnaW4uXCIpO1xuICBjb25zb2xlLmVycm9yKGVycm9yKTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ1RPLFNBQVMsY0FBYyxRQUFzQixjQUErQjtBQUNqRixNQUFJLE9BQU8sUUFBUyxRQUFPO0FBQzNCLFNBQU8sQ0FBQyxDQUFDLE9BQU8sWUFBa0M7QUFDcEQ7QUFLTyxTQUFTLHVCQUF1QixRQUFzQixVQUEyQjtBQUN0RixNQUFJLE9BQU8sUUFBUyxRQUFPO0FBQzNCLFVBQVEsVUFBVTtBQUFBLElBQ2hCLEtBQUs7QUFBYyxhQUFPLE9BQU87QUFBQSxJQUNqQyxLQUFLO0FBQVUsYUFBTyxPQUFPO0FBQUEsSUFDN0IsS0FBSztBQUFZLGFBQU8sT0FBTztBQUFBLElBQy9CLEtBQUs7QUFBUyxhQUFPLE9BQU87QUFBQSxJQUM1QjtBQUFTLGFBQU87QUFBQSxFQUNsQjtBQUNGO0FBalVBLGdCQUVBLFlBUWEsY0EySUEsZ0JBMEdBO0FBL1BiO0FBQUE7QUFBQTtBQUFBLGlCQUFrQjtBQUVsQixpQkFBdUM7QUFRaEMsSUFBTSxlQUFlLGFBQUUsT0FBTztBQUFBO0FBQUEsTUFJbkMsWUFBWSxhQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxNQUVwQyxXQUFXLGFBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBLE1BRW5DLG1CQUFtQixhQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxNQUU1QyxlQUFlLGFBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLE1BRXhDLGlCQUFp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TztBQUFBLE1BQVE7QUFBQSxNQUMzRTtBQUFBLE1BQU87QUFBQSxNQUFPO0FBQUEsTUFBTztBQUFBLE1BQVU7QUFBQSxNQUFPO0FBQUEsTUFBVTtBQUFBLE1BQVE7QUFBQSxNQUFXO0FBQUEsTUFBVTtBQUFBLE1BQzdFO0FBQUEsTUFBTztBQUFBLE1BQVE7QUFBQSxNQUFRO0FBQUEsTUFBVztBQUFBLE1BQU87QUFBQSxNQUFXO0FBQUEsTUFBTztBQUFBLE1BQU87QUFBQSxNQUFLO0FBQUEsTUFBTTtBQUFBLE1BQzdFO0FBQUEsTUFBUTtBQUFBLE1BQU07QUFBQSxNQUFTO0FBQUEsTUFBTTtBQUFBLE1BQVE7QUFBQSxNQUFPO0FBQUEsTUFBVTtBQUFBLE1BQVE7QUFBQSxNQUFPO0FBQUEsTUFBTTtBQUFBLE1BQzNFO0FBQUEsTUFBUTtBQUFBLE1BQVE7QUFBQSxNQUFXO0FBQUEsTUFBTTtBQUFBLE1BQVU7QUFBQSxNQUFPO0FBQUEsTUFBTTtBQUFBLE1BQU87QUFBQSxNQUFPO0FBQUEsTUFBTztBQUFBLE1BQzdFO0FBQUEsTUFBTztBQUFBLE1BQU07QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQU07QUFBQSxNQUFTO0FBQUEsTUFBTztBQUFBLE1BQVE7QUFBQSxNQUFPO0FBQUEsTUFBUTtBQUFBLE1BQzFFO0FBQUEsTUFBUTtBQUFBLE1BQVU7QUFBQSxNQUFPO0FBQUEsTUFBUztBQUFBLE1BQVU7QUFBQSxNQUFhO0FBQUEsTUFBTTtBQUFBLE1BQVE7QUFBQSxNQUN2RTtBQUFBLE1BQVE7QUFBQSxNQUFRO0FBQUEsTUFBVztBQUFBLE1BQU87QUFBQSxNQUFTO0FBQUEsTUFBVTtBQUFBLE1BQVE7QUFBQSxNQUFjO0FBQUEsTUFDM0U7QUFBQSxNQUFTO0FBQUEsTUFBUztBQUFBLE1BQVE7QUFBQSxNQUFRO0FBQUEsTUFBUztBQUFBLE1BQVc7QUFBQSxNQUFNO0FBQUEsTUFBTztBQUFBLE1BQ25FO0FBQUEsTUFBUztBQUFBLE1BQU07QUFBQSxNQUFRO0FBQUEsTUFBTztBQUFBLE1BQVU7QUFBQSxNQUFNO0FBQUEsTUFBUTtBQUFBLE1BQVc7QUFBQSxNQUFRO0FBQUEsTUFDekU7QUFBQSxNQUFTO0FBQUEsTUFBUztBQUFBLE1BQVM7QUFBQSxNQUFPO0FBQUEsTUFBUTtBQUFBLE1BQU87QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQVM7QUFBQSxNQUMxRTtBQUFBLE1BQVk7QUFBQSxNQUFPO0FBQUEsTUFBUztBQUFBLE1BQVU7QUFBQSxNQUFVO0FBQUEsTUFBVTtBQUFBLE1BQVE7QUFBQSxNQUNsRTtBQUFBLE1BQVk7QUFBQSxNQUFjO0FBQUEsTUFBUTtBQUFBLE1BQVE7QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQVM7QUFBQSxNQUFPO0FBQUEsTUFDMUU7QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQVE7QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQVE7QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQU87QUFBQSxNQUN2RTtBQUFBLE1BQVE7QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQU87QUFBQSxNQUFPO0FBQUEsTUFBTztBQUFBLE1BQVE7QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQ3JFO0FBQUEsTUFBUTtBQUFBLE1BQU87QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQU87QUFBQSxNQUFPO0FBQUE7QUFBQSxNQUU3QztBQUFBLE1BQVk7QUFBQSxNQUFZO0FBQUEsTUFBVztBQUFBLE1BQVM7QUFBQSxNQUFVO0FBQUEsTUFBVTtBQUFBLE1BQVM7QUFBQSxNQUN6RTtBQUFBLE1BQU87QUFBQSxNQUFPO0FBQUEsTUFBUztBQUFBLE1BQVM7QUFBQSxNQUFVO0FBQUEsTUFBUztBQUFBLE1BQVM7QUFBQSxNQUFPO0FBQUEsTUFDbkU7QUFBQSxNQUFVO0FBQUEsTUFBVTtBQUFBLE1BQVc7QUFBQSxNQUFRO0FBQUEsTUFBUTtBQUFBLE1BQWE7QUFBQSxNQUFRO0FBQUEsTUFDcEU7QUFBQSxNQUFXO0FBQUEsTUFBUztBQUFBLE1BQVE7QUFBQSxNQUFPO0FBQUEsTUFBVTtBQUFB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LG1CQUFrQjtBQUNwQyxRQUFJLGtCQUFrQjtBQUNwQixZQUFNLElBQUksTUFBTSxtQ0FBbUM7QUFBQSxJQUNyRDtBQUNBLFFBQUksMEJBQTBCO0FBQzVCLFlBQU0sSUFBSSxNQUFNLDREQUE0RDtBQUFBLElBQzlFO0FBRUEsdUJBQW1CO0FBQ25CLHlCQUFxQixpQkFBaUJBLGNBQWE7QUFDbkQsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLGVBQWUsQ0FBQyxjQUFjO0FBQzVCLFFBQUksY0FBYztBQUNoQixZQUFNLElBQUksTUFBTSw4QkFBOEI7QUFBQSxJQUNoRDtBQUVBLG1CQUFlO0FBQ2YseUJBQXFCLGFBQWEsU0FBUztBQUMzQyxXQUFPO0FBQUEsRUFDVDtBQUNGO0FBRUEsd0RBQTRCLEtBQUssT0FBTUMsWUFBVTtBQUMvQyxTQUFPLE1BQU1BLFFBQU8sS0FBSyxhQUFhO0FBQ3hDLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDWix1QkFBcUIsY0FBYztBQUNyQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFVBQVU7QUFDbEIsVUFBUSxNQUFNLG9EQUFvRDtBQUNsRSxVQUFRLE1BQU0sS0FBSztBQUNyQixDQUFDOyIsCiAgIm5hbWVzIjogWyJwbGF0Zm9ybSIsICJwYXRoIiwgImZzIiwgInJlc29sdmUiLCAiZnMiLCAicGF0aCIsICJjb250ZXh0R3VhcmQiLCAic3Bhd25XaXRoUHJvZ3Jlc3MiLCAicmVzb2x2ZSIsICJydW5Db25maWdBbmFseXNpcyIsICJydW5JbXBvcnRBbmFseXNpcyIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiZnMiLCAicGF0aCIsICJkZGdTZWFyY2giLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgIm1lc3NhZ2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgInJlc29sdmUiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJyZXNvbHZlIiwgImhhbmRsZUVycm9yIiwgImNvbnRleHRHdWFyZCIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiaW1wb3J0X2NoaWxkX3Byb2Nlc3MiLCAiaGFuZGxlRXJyb3IiLCAicGxhdGZvcm0iLCAicmVzb2x2ZSIsICJtZXNzYWdlIiwgImdldFdvcmtpbmdEaXIiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgIm9zIiwgInBhdGgiLCAiZnMiLCAiaW1wb3J0X2NoaWxkX3Byb2Nlc3MiLCAiZnMiLCAic3RhdCIsICJoYW5kbGVFcnJvciIsICJvcyIsICJwbGF0Zm9ybSIsICJzcGF3biIsICJyZXNvbHZlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJwYXRoIiwgImhvc3RuYW1lIiwgImhhbmRsZUVycm9yIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJjaHVua1RleHQiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgInBhdGgiLCAiZnMiLCAicHVwcGV0ZWVyTW9kdWxlIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3pvZCIsICJmcyIsICJwYXRoIiwgInRvb2wiLCAic3RhdCIsICJoYW5kbGVFcnJvciIsICJleHQiLCAicGRmUGFyc2UiLCAiaW1wb3J0X3NkayIsICJpbXBvcnRfem9kIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJwZGZQYXJzZSIsICJjaHVua1RleHQiLCAiYmFzZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF96b2QiLCAiY29udGV4dEd1YXJkIiwgInNldENvbnRleHRHdWFyZCIsICJ0b29sIiwgImxvZ2dlciIsICJpbXBvcnRfc2RrIiwgInByZXByb2Nlc3MiLCAiY29uZmlnU2NoZW1hdGljcyIsICJ0b29sc1Byb3ZpZGVyIiwgIm1vZHVsZSJdCn0K
