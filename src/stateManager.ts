/**
 * Persistent state management for plugin operations
 * Dual-layer storage: plugin-level (global) + project-level (per-working-dir)
 * Project entries override plugin entries with the same key.
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
};

/** Plugin root directory (always valid) */
const PLUGIN_ROOT = path.join(__dirname, '..');

/** Plugin-level memory file path (global, survives project changes) */
function getPluginMemoryFilePath(): string {
  return path.join(PLUGIN_ROOT, '.ai_toolbox_memory.msgpack');
}

/**
 * Resolve the project-level memory file path.
 * Returns null when workingDir is invalid (stale/deleted).
 */
async function getProjectMemoryFilePath(): Promise<string | null> {
  let cwd = getWorkingDir();

  // Validate: ensure it's an actual accessible directory
  try {
    await fs.access(cwd);
    const stats = await fs.stat(cwd);
    if (!stats.isDirectory()) throw new Error('Not a directory');
  } catch {
    // WorkingDir is stale (e.g. from test temp dir cleanup)
    logger.warn(`Configured workingDir invalid: ${cwd}. Project-level memory disabled.`);
    return null;
  }

  return path.join(cwd, '.ai_toolbox_memory.msgpack');
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
    const tempFile = filePath + '.tmp';
    await fs.writeFile(tempFile, encodedData);
    await fs.rename(tempFile, filePath);

    // Create JSON backup for manual inspection
    try {
      await fs.writeFile(filePath + '.backup.json', JSON.stringify(data), 'utf-8');
    } catch {
      // Ignore backup creation errors
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Failed to save memory file ${filePath}: ${message}`);
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

  /**
   * Set a state value with key and optional metadata.
   * Disk persistence is fire-and-forget (non-blocking).
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

    // Fire-and-forget: save merged state to BOTH files
    if (this.persistenceEnabled) {
      void this.saveToFile().catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to persist state immediately: ${message}`);
      });
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
    const deleted = this.state.delete(key);

    // Fire-and-forget: save merged state to BOTH files
    if (deleted && this.persistenceEnabled) {
      void this.saveToFile().catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to persist state delete immediately: ${message}`);
      });
    }

    return deleted;
  }

  /**
   * Get all state keys. Re-loads from disk to handle working dir changes mid-session.
   */
  async getAllKeys(): Promise<string[]> {
    await this.ensureReady();

    if (!this.persistenceEnabled) {
      return Array.from(this.state.keys());
    }

    // Re-resolve project path in case working dir changed
    const newProjectPath = await getProjectMemoryFilePath();
    if (newProjectPath !== this.projectMemoryFile) {
      logger.info(`Working dir changed: ${this.projectMemoryFile} → ${newProjectPath}`);
      this.projectMemoryFile = newProjectPath;
    }

    logger.info(`getAllKeys: reloading dual-layer state`);

    try {
      // Clear and reload: plugin first, then project overrides
      this.state.clear();
      this.runningSize = 0;

      await loadMemoryFile(this.pluginMemoryFile, this.state, 0);
      if (this.projectMemoryFile) {
        await loadMemoryFile(this.projectMemoryFile, this.state, 0);
      }
      this.recalculateSize();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`Failed to reload state from disk in getAllKeys: ${message}`);
    }

    return Array.from(this.state.keys());
  }

  /**
   * Clear all state.
   */
  clear(): void {
    this.runningSize = 0;
    this.state.clear();

    if (this.persistenceEnabled) {
      void this.saveToFile().catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to persist state clear immediately: ${message}`);
      });
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
   * Estimate size of a value in bytes.
   */
  private getSizeOfValue(value: unknown): number {
    if (typeof value === 'string') return value.length;
    if (typeof value === 'number') return 8;
    if (typeof value === 'boolean') return 1;
    if (Array.isArray(value)) {
      return value.reduce((sum: number, elem: unknown) => sum + this.getSizeOfValue(elem), 0);
    }
    if (value instanceof Map) return value.size * 16;
    if (value instanceof Object && !(value instanceof Date)) {
      return JSON.stringify(value).length;
    }
    return 0;
  }

  /**
   * Save merged state to BOTH plugin-level and project-level files atomically.
   */
  private async saveToFile(): Promise<void> {
    // Re-resolve project path in case working dir changed mid-session
    const newProjectPath = await getProjectMemoryFilePath();
    if (newProjectPath !== this.projectMemoryFile) {
      this.projectMemoryFile = newProjectPath;
    }

    // Save to plugin file (always)
    await saveMemoryFile(this.pluginMemoryFile, this.state);

    // Save to project file (if working dir is valid)
    if (this.projectMemoryFile) {
      await saveMemoryFile(this.projectMemoryFile, this.state);
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
        void this.saveToFile().catch((err: unknown) => {
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
