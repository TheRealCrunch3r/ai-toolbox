/**
 * Persistent state management for plugin operations
 * 
 * 📌 PROTOCOL RULE (Permanent): User Specified Working Directory takes absolute precedence.
 * 
 * Hierarchy:
 * 1. PRIMARY: User Specified Working Directory (First place to read/write).
 *    - Path: `<workingDir>/.session_context/.ai_toolbox_memory.msgpack`
 * 2. SECONDARY: Plugin Directory (Fallback/Backup source).
 *    - Path: `<pluginRoot>/.session_context/.ai_toolbox_memory.msgpack`
 * 
 * Behavior:
 * - Reading: Project data is loaded AFTER plugin data, ensuring it overrides keys (Precedence).
 * - Writing: Data is written to Project directory FIRST, then Plugin directory.
 */

import type { PluginConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { encode, decode } from '@msgpack/msgpack';

import { getWorkingDir } from './workingDir';

interface StateEntry {
  key: string;
  value: unknown;
  timestamp: number;
}

/** Minimal logger for state manager (avoids circular dependency with index.ts) */
const isTestEnvironment = !!process.env.JEST_WORKER_ID;

const logger = {
  warn: (msg: string) => !isTestEnvironment && typeof process.stderr.write === 'function' && process.stderr.write(`[StateManager] ${msg}\n`),
  info: (msg: string) => !isTestEnvironment && typeof process.stdout.write === 'function' && process.stdout.write(`[StateManager] ${msg}\n`),
  error: (msg: string) => !isTestEnvironment && typeof process.stderr.write === 'function' && process.stderr.write(`[StateManager ERROR] ${msg}\n`),
};

/** Plugin root directory (always valid) */
const PLUGIN_ROOT = path.join(__dirname, '..');

/** Plugin-level memory file path (global, survives project changes) */
function getPluginMemoryFilePath(): string {
  return path.join(PLUGIN_ROOT, '.session_context', '.ai_toolbox_memory.msgpack');
}

// 🔹 P2 #6: Cache resolved project path with 5s TTL to avoid duplicate fs.stat() calls
let _projectPathCache: string | null = null;
let _lastProjectPathCheck = 0;
const PROJECT_PATH_CACHE_TTL_MS = 5000; // 5 seconds

/**
 * Resolve the project-level memory file path.
 * Returns null when workingDir is invalid (stale/deleted).
 */
async function getProjectMemoryFilePath(): Promise<string | null> {
  const now = Date.now();
  
  // Skip validation if cache is fresh
  if (_projectPathCache && (now - _lastProjectPathCheck) < PROJECT_PATH_CACHE_TTL_MS) {
    return _projectPathCache;
  }

  let cwd = getWorkingDir();

  // Validate: ensure it's an actual accessible directory
  try {
    await fs.access(cwd);
    const stats = await fs.stat(cwd);
    if (!stats.isDirectory()) throw new Error('Not a directory');
  } catch {
    // WorkingDir is stale (e.g. from test temp dir cleanup)
    logger.warn(`Configured workingDir invalid: ${cwd}. Project-level memory disabled.`);
    _projectPathCache = null; // Invalidate cache
    return null;
  }

  const resolvedPath = path.join(cwd, '.session_context', '.ai_toolbox_memory.msgpack');
  _projectPathCache = resolvedPath;
  _lastProjectPathCheck = now;
  return resolvedPath;
}

/**
 * Load a single msgpack memory file and merge entries into the provided map.
 * Later calls override earlier entries with the same key.
 */
async function loadMemoryFile(filePath: string, state: Map<string, StateEntry>, _runningSize: number): Promise<number> {
  try {
    if (!await fs.access(filePath).then(() => true).catch(() => false)) {
      logger.info(`No existing memory file found at ${filePath}.`);
      return 0;
    }

    const buffer = await fs.readFile(filePath);

    let data: StateEntry[];
    try {
      data = decode(buffer) as StateEntry[];
    } catch {
      logger.warn(`Corrupted state file detected at ${filePath}, removing...`);
      try { await fs.unlink(filePath); } catch { /* ignore */ }
      data = [];
    }

    let loaded = 0;
    for (const entry of data) {
      if (entry && typeof entry.key === 'string' && typeof entry.timestamp === 'number') {
        // Remove old size if key already exists
        const existing = state.get(entry.key);
        if (existing) {
          // We'll recalculate size after, so just track the replacement
        }
        state.set(entry.key, entry);
        loaded++;
      }
    }

    logger.info(`Loaded ${loaded} entries from ${filePath}.`);
    return loaded;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Failed to load memory file ${filePath}: ${message}`);
    return 0;
  }
}

/**
 * Save the merged state map to a single msgpack file atomically.
 */
async function saveMemoryFile(filePath: string, state: Map<string, StateEntry>): Promise<void> {
  try {
    logger.warn(`[StateManager.saveMemoryFile] START writing to: ${filePath}`);
    
    const data = Array.from(state.entries()).map(([_key, entry]) => ({
      key: entry.key,
      value: entry.value,
      timestamp: entry.timestamp,
    }));

    logger.warn(`[StateManager.saveMemoryFile] Data entries count: ${data.length}`);

    const dir = path.dirname(filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
      logger.warn(`[StateManager.saveMemoryFile] Created directory: ${dir}`);
    } catch (err) {
      logger.warn(`Could not create memory directory ${dir}: ${String(err)}`);
      return;
    }

    const encodedData = encode(data);
    logger.warn(`[StateManager.saveMemoryFile] Encoded size: ${encodedData.byteLength} bytes`);
    
    const tempFile = filePath + '.tmp';
    await fs.writeFile(tempFile, encodedData);
    logger.warn(`[StateManager.saveMemoryFile] Wrote to temp file: ${tempFile}`);
    
    // Write to temp file first
    try {
      await fs.rename(tempFile, filePath);
      logger.warn(`[StateManager.saveMemoryFile] SUCCESS - renamed to: ${filePath}`);
      
      // Create JSON backup for manual inspection
      try {
        await fs.writeFile(filePath + '.backup.json', JSON.stringify(data), 'utf-8');
        logger.warn(`[StateManager.saveMemoryFile] Created backup json`);
      } catch (bakErr) {
        const bakMsg = bakErr instanceof Error ? bakErr.message : String(bakErr);
        logger.warn(`[StateManager.saveMemoryFile] Backup failed: ${bakMsg}`);
      }
    } catch (renameError) {
      const renameMsg = renameError instanceof Error ? renameError.message : String(renameError);
      logger.warn(`[StateManager.saveMemoryFile] Atomic rename failed (${renameMsg}), falling back to direct write`);
      // Fallback: overwrite directly if atomic rename fails
      await fs.writeFile(filePath, encodedData);
      logger.warn(`[StateManager.saveMemoryFile] Fallback write completed for: ${filePath}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[StateManager.saveMemoryFile] FAILED for ${filePath}: ${message}`);
  }
}

export class StateManager {
  private state: Map<string, StateEntry>;
  private maxSize: number;
  private persistenceEnabled: boolean;
  private pluginMemoryFile: string = getPluginMemoryFilePath();
  private projectMemoryFile: string | null = null;
  private runningSize: number;

  /** Tracks initialization completion so reads wait for data */
  private _ready!: Promise<void>;

  // 🔹 P0 Optimization #1: Debounced saves to reduce disk I/O during bulk ops
  private saveQueue: (() => Promise<void>)[] = [];
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  readonly SAVE_DEBOUNCE_MS = 500; // Coalesce rapid saves

  // 🔹 P0 Optimization #2: Key cache with invalidation to avoid O(n) disk reads on getAllKeys()
  private _keysCache: string[] | null = null;
  private _keysCacheInvalidated = true;
  readonly KEYS_CACHE_TTL_MS = 1000; // 1 second TTL
  private _lastKeysCacheTime: number | null = null;

  // 🔹 P2 #5: Cache for getSizeOfValue() to avoid repeated JSON.stringify on complex objects
  private sizeValueCache = new Map<string, number>();

  constructor(config?: PluginConfig) {
    this.state = new Map();
    this.runningSize = 0;

    const defaults = typeof DEFAULT_CONFIG !== 'undefined' ? DEFAULT_CONFIG : {};
    const effectiveConfig = { ...defaults, ...(config || {}) };

    this.maxSize = effectiveConfig.stateMaxSize ?? 10240;
    this.persistenceEnabled = effectiveConfig.statePersistenceEnabled !== undefined
      ? effectiveConfig.statePersistenceEnabled
      : true;

    const persistenceEnabled = this.persistenceEnabled;
    const stateMap = this.state;

    // Synchronous initialization — load plugin first, then project (project overrides)
    this._ready = (async () => {
      try {
        this.projectMemoryFile = await getProjectMemoryFilePath();

        if (persistenceEnabled && stateMap.size === 0) {
          // Load plugin-level memory first (global baseline)
          await loadMemoryFile(this.pluginMemoryFile, stateMap, 0);
          // Load project-level memory second (overrides plugin for same keys)
          if (this.projectMemoryFile) {
            await loadMemoryFile(this.projectMemoryFile, stateMap, 0);
          }
          // Recalculate running size after merge
          this.recalculateSize();
        } else {
          logger.warn('State persistence is DISABLED. Data will not survive reloads.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to initialize state manager: ${message}`);
      }
    })();
  }

  /** Ensure initialization completes before reading/writing */
  private async ensureReady(): Promise<void> {
    return this._ready;
  }

  /** Recalculate running size from current state map */
  private recalculateSize(): void {
    this.runningSize = 0;
    for (const [, entry] of this.state) {
      this.runningSize += this.getSizeOfValue(entry.value);
    }
  }

  // 🔹 P0 #1: Debounced save queue handler
  private async _queueSave(): Promise<void> {
    if (!this.persistenceEnabled) return;

    const queueEntry = () => this.saveToFile();
    this.saveQueue.push(queueEntry);

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(async () => {
      this.saveTimer = null;
      const queue = [...this.saveQueue];
      this.saveQueue = []; // Clear queue before executing
      
      try {
        await Promise.all(queue.map(fn => fn()));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to persist state via debounced save: ${message}`);
      }
    }, this.SAVE_DEBOUNCE_MS);
  }

  /**
   * Set a state value with key and optional metadata.
   * Disk persistence is now debounced (non-blocking batched writes).
   */
  set(key: string, value: unknown): void {
    const newValueSize = this.getSizeOfValue(value);
    const oldValueSize = this.getExistingValueSize(key);

    if (this.runningSize - oldValueSize + newValueSize > this.maxSize) {
      throw new Error(`State size exceeds maximum (${this.maxSize} bytes)`);
    }

    this.runningSize = this.runningSize - oldValueSize + newValueSize;

    this.state.set(key, {
      key,
      value,
      timestamp: Date.now(),
    });

    // 🔹 P0 #2: Invalidate key cache on mutation
    if (this.persistenceEnabled) {
      this._keysCacheInvalidated = true;
      // 🔹 P0 #1: Queue save instead of fire-and-forget
      void this._queueSave();
    }
  }

  /**
   * Get a state value by key.
   */
  get<T>(key: string): T | undefined {
    const entry = this.state.get(key);
    if (!entry) return undefined;
    return entry.value as T;
  }

  /**
   * Delete a state entry.
   */
  delete(key: string): boolean {
    const entry = this.state.get(key);
    if (!entry) return false;

    this.runningSize -= this.getSizeOfValue(entry.value);
    this._keysCacheInvalidated = true; // 🔹 P0 #2: Invalidate cache on mutation
    
    const deleted = this.state.delete(key);

    if (deleted && this.persistenceEnabled) {
      void this._queueSave(); // 🔹 P0 #1: Debounced save
    }

    return deleted;
  }

  /**
   * Get all state keys. Uses cached results to avoid O(n) disk reads on every call.
   */
  async getAllKeys(): Promise<string[]> {
    await this.ensureReady();

    if (!this.persistenceEnabled) {
      return Array.from(this.state.keys());
    }

    // 🔹 P0 #2: Return cached keys if valid and not expired
    if (this._keysCacheInvalidated || !this._keysCache) {
      this._keysCache = await this._rebuildKeysCache();
      this._keysCacheInvalidated = false;
    } else if (Date.now() - (this._lastKeysCacheTime ?? 0) > this.KEYS_CACHE_TTL_MS) {
      // Expired — rebuild
      this._keysCache = await this._rebuildKeysCache();
    }

    return [...this._keysCache]; // Return copy to prevent mutation
  }

  /** Rebuild the keys cache by reloading from disk and syncing with active state */
  private async _rebuildKeysCache(): Promise<string[]> {
    const newProjectPath = await getProjectMemoryFilePath();
    if (newProjectPath !== this.projectMemoryFile) {
      logger.info(`Working dir changed: ${this.projectMemoryFile} → ${newProjectPath}`);
      this.projectMemoryFile = newProjectPath;
    }

    // Load directly into the active state map instead of a local one.
    await loadMemoryFile(this.pluginMemoryFile, this.state, 0);
    if (this.projectMemoryFile) {
      await loadMemoryFile(this.projectMemoryFile, this.state, 0);
    }

    // Recalculate running size to keep memory usage tracking accurate after a cold read.
    this.recalculateSize(); 

    this._keysCacheInvalidated = true; 
    this._lastKeysCacheTime = Date.now();

    return Array.from(this.state.keys()); 
  }

  /**
   * Clear all state.
   */
  clear(): void {
    this.runningSize = 0;
    this.state.clear();
    this._keysCacheInvalidated = true; // 🔹 P0 #2: Invalidate cache on mutation

    if (this.persistenceEnabled) {
      void this._queueSave(); // 🔹 P0 #1: Debounced save
    }
  }

  /**
   * Get size of existing value for a key (for incremental updates).
   */
  private getExistingValueSize(key: string): number {
    const entry = this.state.get(key);
    return entry ? this.getSizeOfValue(entry.value) : 0;
  }

  /**
   * Estimate size of a value in bytes (cached for objects).
   */
  private getSizeOfValue(value: unknown): number {
    if (typeof value === 'string') return value.length;
    if (typeof value === 'number') return 8;
    if (typeof value === 'boolean') return 1;

    // Skip cache for primitives — only objects benefit from caching
    const isObject = typeof value === 'object' && value !== null;

    if (isObject) {
      const objKey = JSON.stringify(value);
      const cachedSize = this.sizeValueCache.get(objKey);
      if (cachedSize !== undefined) {
        return cachedSize;
      }
    }

    let size: number;

    if (Array.isArray(value)) {
      size = value.reduce((sum: number, elem: unknown) => sum + this.getSizeOfValue(elem), 0);
    } else if (value instanceof Map) {
      size = value.size * 16; // Estimate per-entry overhead
    } else if (isObject && !(value instanceof Date)) {
      const objKey = JSON.stringify(value);
      size = objKey.length;
      this.sizeValueCache.set(objKey, size);
      return size;
    } else {
      size = 0;
    }

    if (isObject) {
      // Only cache objects that went through the fallback path
      const fallbackKey = JSON.stringify(value);
      this.sizeValueCache.set(fallbackKey, size);
    }

    return size;
  }

  /**
   * Save merged state to BOTH plugin-level and project-level files atomically.
   * 
   * 📌 PROTOCOL RULE: User Specified Working Directory is the FIRST place to write.
   */
  private async saveToFile(): Promise<void> {
    // Re-resolve project path in case working dir changed mid-session
    const newProjectPath = await getProjectMemoryFilePath();
    if (newProjectPath !== this.projectMemoryFile) {
      this.projectMemoryFile = newProjectPath;
    }

    // 1. PRIMARY WRITE: User Specified Working Directory (Highest Priority)
    if (this.projectMemoryFile) {
      logger.info(`[StateManager.saveToFile] Writing to PRIMARY location (User Dir): ${this.projectMemoryFile}`);
      await saveMemoryFile(this.projectMemoryFile, this.state);
    }

    // 2. SECONDARY WRITE: Plugin Directory (Backup/Fallback)
    logger.info(`[StateManager.saveToFile] Writing to SECONDARY location (Plugin Dir): ${this.pluginMemoryFile}`);
    await saveMemoryFile(this.pluginMemoryFile, this.state);
  }

  /**
   * Export state for persistence (JSON serialization).
   */
  exportState(): string {
    const data = Array.from(this.state.entries()).map(([_key, entry]) => ({
      key: entry.key,
      value: entry.value,
      timestamp: entry.timestamp,
    }));
    return JSON.stringify(data);
  }

  /**
   * Import state from JSON string.
   */
  importState(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString) as StateEntry[];
      this.state.clear();
      this.runningSize = 0;
      for (const entry of data) {
        this.state.set(entry.key, entry);
        this.runningSize += this.getSizeOfValue(entry.value);
      }

      if (this.persistenceEnabled) {
        void this._queueSave().catch((err: unknown) => { // 🔹 P0 #1: Debounced save
          const msg = err instanceof Error ? err.message : String(err);
          logger.warn(`Failed to persist state import: ${msg}`);
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to import state: ${message}`);
    }
  }

  /**
   * Get the path(s) to the memory file(s) on disk.
   */
  getMemoryFilePath(): { plugin: string; project: string | null } {
    return { plugin: this.pluginMemoryFile, project: this.projectMemoryFile };
  }

  /**
   * Force save to disk (useful for debugging).
   */
  async forceSave(): Promise<void> {
    await this.saveToFile();
  }

  /**
   * Force load from disk (useful for debugging).
   */
  async forceLoad(): Promise<void> {
    await this.ensureReady();
    this.state.clear();
    this.runningSize = 0;
    await loadMemoryFile(this.pluginMemoryFile, this.state, 0);
    if (this.projectMemoryFile) {
      await loadMemoryFile(this.projectMemoryFile, this.state, 0);
    }
    this.recalculateSize();
  }
}
