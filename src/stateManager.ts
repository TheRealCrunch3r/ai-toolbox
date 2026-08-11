/**
 * Persistent state management for plugin operations — Per-Project Memory Isolation
 * 
 * 📌 PROTOCOL RULE (Permanent): Each project has its own isolated session memory file.
 * 
 * Architecture:
 * 1. Session Index (`ai_toolbox/.session_index.json`) — maps projects → paths + last_saved timestamps
 * 2. Per-Project Memory (`<project>/.session_context/.<name>_memory.msgpack`) — ONE file per project, NO double-write
 * 
 * Behavior:
 * - Writes go ONLY to the active project's memory file (no plugin-level fallback)
 * - Session index is updated with timestamp after every successful save
 * - New projects are registered automatically when first initialized; user prompted for confirmation on new registration
 */

import type { PluginConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { encode, decode } from '@msgpack/msgpack';

import { getWorkingDir } from './workingDir';
import type { ContextOrigin } from './contextTiers.js';
import { replaceTier, createContextNode } from './contextTiers.js';

interface StateEntry {
  key: string;
  value: unknown;
  timestamp: number;
  _origin?: ContextOrigin; // Tier provenance ("ast" = raw file/AST, "semantic" = derived insight) — graphify-inspired
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

/** Session index file — maps project names to their paths and tracks last saved timestamps */
const SESSION_INDEX_FILE = path.join(PLUGIN_ROOT, '.session_index.json');

interface SessionIndexEntry {
  path: string;
  last_session_saved: number | null; // Unix timestamp (ms), or null if never saved
  status: 'active' | 'registered';
}

/** Load the session index from disk */
async function loadSessionIndex(): Promise<Record<string, SessionIndexEntry>> {
  try {
    const content = await fs.readFile(SESSION_INDEX_FILE, 'utf-8');
    const data = JSON.parse(content) as { projects: Record<string, SessionIndexEntry> };
    if (data && data.projects) return data.projects;
  } catch {} // Ignore errors — fallback to empty index
  return {};
}

/** Save the session index back to disk */
async function saveSessionIndex(index: Record<string, SessionIndexEntry>): Promise<void> {
  const payload = JSON.stringify({
    index_version: '1.0',
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    projects: index,
  }, null, 2);

  try {
    await fs.mkdir(path.dirname(SESSION_INDEX_FILE), { recursive: true });
    const tempFile = SESSION_INDEX_FILE + '.tmp';
    await fs.writeFile(tempFile, payload, 'utf-8');
    // Atomic rename (Windows fallback handled below)
    try {
      await fs.rename(tempFile, SESSION_INDEX_FILE);
    } catch {
      await fs.writeFile(SESSION_INDEX_FILE, payload, 'utf-8'); // Direct write on Windows
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Failed to save session index: ${msg}`);
  }
}

async function getProjectMemoryFilePath(projectName: string): Promise<string | null> {
  const cwd = getWorkingDir();

  // Validate working directory exists and is valid
  try {
    await fs.access(cwd);
    const stats = await fs.stat(cwd);
    if (!stats.isDirectory()) throw new Error('Not a directory');
  } catch {
    logger.warn(`Configured workingDir invalid: ${cwd}. Project-level memory disabled.`);
    return null;
  }

  // Use project-specific filename instead of hardcoded .ai_toolbox_memory.msgpack
  const resolvedPath = path.join(cwd, '.session_context', `.${projectName}_memory.msgpack`);
  
  logger.info(`[StateManager] Resolved memory file for '${projectName}': ${resolvedPath}`);
  return resolvedPath;
}

/** Update the session index with last saved timestamp */
async function updateSessionIndex(projectName: string): Promise<void> {
  const index = await loadSessionIndex();
  
  if (index[projectName]) {
    // Only updates projects that are explicitly registered via register_project() tool.
    // Unregistered projects will fail silently — this prevents accidental registration on first save without user confirmation.
    index[projectName].last_session_saved = Date.now();
    
    // Auto-promote from 'registered' to 'active' after first save (only for previously-registered projects)
    if (index[projectName].status === 'registered') {
      logger.info(`[StateManager] Project '${projectName}' promoted to active status.`);
      index[projectName].status = 'active';
    }

    await saveSessionIndex(index);
  } else {
    // ⚠️ CRITICAL: This should NOT happen — project must be registered via register_project() tool first.
    logger.warn(`[StateManager.updateSessionIndex] Project '${projectName}' is not yet registered in index. ` +
                 `Call register_project(project_name="${projectName}", working_dir_path="<confirmed path>") to resolve.`);
  }
}

/** Get the current project name from context (defaults to active working dir's basename) */
function resolveProjectName(): string {
  const cwd = getWorkingDir();
  // Extract last directory component as fallback project name
  return path.basename(cwd).toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/** Plugin-level memory file path (global baseline — kept for backward compatibility) */
function getPluginMemoryFilePath(): string {
  return path.join(PLUGIN_ROOT, '.session_context', '.ai_toolbox_memory.msgpack');
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
    const data = Array.from(state.entries()).map(([_key, entry]) => ({
      key: entry.key,
      value: entry.value,
      timestamp: entry.timestamp,
    }));

    const dir = path.dirname(filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      logger.warn(`Could not create memory directory ${dir}: ${String(err)}`);
      return;
    }

    const encodedData = encode(data);
    
    // Use atomic write pattern: write to temp file, then rename.
    // On Windows, rename may fail due to file locks/antivirus — fall back to direct write.
    try {
      const tempFile = filePath + '.tmp';
      await fs.writeFile(tempFile, encodedData);
      await fs.rename(tempFile, filePath);
      
      // Create JSON backup for manual inspection (best-effort)
      try {
        await fs.writeFile(filePath + '.backup.json', JSON.stringify(data), 'utf-8');
      } catch { /* Non-critical — skip if backup fails */ }
    } catch {
      // Fallback: write directly to the final path (non-atomic but reliable on Windows)
      await fs.writeFile(filePath, encodedData);
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
  /** Plugin-level memory file path (global baseline — kept for backward compatibility) */
  private pluginMemoryFile: string = getPluginMemoryFilePath();
  /** Project-specific session context directory root */
  private projectContextDir: string | null = null;
  /** Current active project name resolved from working dir or explicit registration */
  private currentProjectName: string = resolveProjectName();
  private runningSize: number;

  /** Tracks initialization completion so reads wait for data */
  private _ready!: Promise<void>;

  // 🔹 P0 Optimization #1: Debounced save to reduce disk I/O during bulk ops
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  readonly SAVE_DEBOUNCE_MS = 500; // Coalesce rapid saves into single write

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

    // Resolve current project name from working dir or explicit config if provided
    interface PluginConfigWithProject extends Omit<PluginConfig, 'projectName'> {
      projectName?: string;
    }
    
    const typedConfig = (config ?? {}) as unknown as PluginConfigWithProject;
    this.currentProjectName = typedConfig.projectName || resolveProjectName();

    const persistenceEnabled = this.persistenceEnabled;
    const stateMap = this.state;

    // Initialize: load ONLY its session context file. Registration happens via register_project() tool only (explicit user confirmation).
    this._ready = (async () => {
      try {
        if (!persistenceEnabled) {
          logger.warn('State persistence is DISABLED. Data will not survive reloads.');
          return;
        }

        // Create project-specific context directory and resolve memory file path
        this.projectContextDir = path.join(getWorkingDir(), '.session_context');
        
        try {
          await fs.mkdir(this.projectContextDir, { recursive: true });
        } catch (err) {
          logger.warn(`Could not create session context dir ${this.projectContextDir}: ${String(err)}`);
          return; // Disable persistence if directory cannot be created
        }

        const projectMemoryFile = await getProjectMemoryFilePath(this.currentProjectName);
        
        if (!projectMemoryFile || !(await fs.access(projectMemoryFile).then(() => true).catch(() => false))) {
          logger.info(`No existing session memory for '${this.currentProjectName}'. Starting fresh.`);
          this.recalculateSize();
          return;
        }

        // Load ONLY project-specific file (no plugin-level merge)
        await loadMemoryFile(projectMemoryFile, stateMap, 0);
        
        // Recalculate running size after load
        this.recalculateSize();
        logger.info(`[StateManager] Initialized for '${this.currentProjectName}' — loaded ${stateMap.size} entries.`);

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

  // 🔹 P0 #1: Debounced save — ensures only ONE save per debounce window (prevents duplicate writes)
  private async _queueSave(): Promise<void> {
    if (!this.persistenceEnabled) return;

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(async () => {
      this.saveTimer = null;
      
      try {
        await this.saveToFile(); // Single save call — no queuing of multiple saves
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
    // Reload ONLY project-specific file (no plugin-level merge)
    if (!this.persistenceEnabled || !this.projectContextDir) return Array.from(this.state.keys());

    const projectMemoryFile = await getProjectMemoryFilePath(this.currentProjectName);
    
    if (!projectMemoryFile) return Array.from(this.state.keys());

    // Clear and reload fresh from project file only (syncs in-memory state with disk)
    this.state.clear();
    await loadMemoryFile(projectMemoryFile, this.state, 0);
    
    // Recalculate running size after cold read to keep memory tracking accurate
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
   * Set a state value with explicit tier provenance.
   * If _origin is set, enables tier-aware operations for batch replacement.
   */
  setWithTier(key: string, value: unknown, origin: ContextOrigin): void {
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
      _origin: origin,
    });

    if (this.persistenceEnabled) {
      this._keysCacheInvalidated = true;
      void this._queueSave();
    }
  }

  /**
   * Get all entries matching a specific tier origin.
   */
  getByOrigin(origin: ContextOrigin): Array<{ key: string; value: unknown; timestamp: number }> {
    return Array.from(this.state.entries())
      .filter(([, entry]) => entry._origin === origin)
      .map(([key, entry]) => ({ key, value: entry.value, timestamp: entry.timestamp }));
  }

  /**
   * Perform tier-aware batch replacement on state entries.
   * Converts StateEntry[] to ContextNode[], applies replaceTier(), converts back.
   * 
   * @param oldEntries — Current state entries (from load)
   * @param newEntries — Incoming entries with _origin set for tier scoping
   * @returns Merged entries with only changed tiers replaced
   */
  static mergeStateWithTiers(
    oldEntries: StateEntry[],
    newEntries: StateEntry[]
  ): StateEntry[] {
    // Convert to ContextNode format
    const oldNodes = oldEntries.map(e => ({
      id: e.key,
      _origin: e._origin ?? 'semantic',
      label: undefined,
      source_file: undefined,
      data: e.value,
      timestamp: e.timestamp,
    }));

    const newNodes = newEntries.map(e => createContextNode(
      e.key, 
      e._origin ?? 'semantic', 
      e.value, 
      undefined, 
      undefined
    ));

    // Apply tier replacement
    const mergedNodes = replaceTier(oldNodes, newNodes);

    // Convert back to StateEntry format
    return mergedNodes.map(n => ({
      key: n.id,
      value: n.data ?? {},
      timestamp: n.timestamp || Date.now(),
      _origin: n._origin,
    }));
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
   * Save state to project-specific memory file ONLY. No double-write.
   */
  private async saveToFile(): Promise<void> {
    if (!this.projectContextDir || !this.persistenceEnabled) return;

    const projectMemoryFile = await getProjectMemoryFilePath(this.currentProjectName);
    
    if (!projectMemoryFile) {
      logger.warn(`[StateManager.saveToFile] No memory file path for '${this.currentProjectName}'. Skip save.`);
      return;
    }

    try {
      // Create session context directory if missing
      await fs.mkdir(this.projectContextDir, { recursive: true });
      
      const filePath = projectMemoryFile;
      logger.info(`[StateManager.saveToFile] Writing to '${this.currentProjectName}': ${filePath}`);
      await saveMemoryFile(filePath, this.state);

      // Update session index timestamp after successful write
      await updateSessionIndex(this.currentProjectName);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`[StateManager.saveToFile] FAILED for '${this.currentProjectName}': ${msg}`);
    }
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
   * Get the current session memory path and project name.
   */
  getMemoryFilePath(): { filePath: string; projectName: string; indexPath: string | null } {
    return { 
      filePath: this.pluginMemoryFile, // Legacy compat — primary path for now
      projectName: this.currentProjectName,
      indexPath: SESSION_INDEX_FILE,
    };
  }

  /**
   * Force save to disk (useful for debugging).
   */
  async forceSave(): Promise<void> {
    await this.saveToFile();
  }

  /**
   * Force load from disk — reloads ONLY project-specific file.
   */
  async forceLoad(): Promise<void> {
    await this.ensureReady();
    
    if (!this.projectContextDir || !this.persistenceEnabled) return;

    const projectMemoryFile = await getProjectMemoryFilePath(this.currentProjectName);
    
    this.state.clear();
    this.runningSize = 0;
    
    if (projectMemoryFile && await fs.access(projectMemoryFile).then(() => true).catch(() => false)) {
      await loadMemoryFile(projectMemoryFile, this.state, 0);
    } else {
      logger.info(`[StateManager.forceLoad] No existing file for '${this.currentProjectName}'. State is empty.`);
    }

    this.recalculateSize();
  }
}
