/**
 * Persistent state management for plugin operations
 * Stores data to disk as JSON file for survival across reloads
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

/**
 * Resolve the memory file location — ALWAYS in a valid working directory.
 * Falls back to plugin root when configured workingDir is stale/invalid (e.g., deleted test temp).
 */
async function getMemoryFilePath(): Promise<string> {
  let cwd = getWorkingDir();

  // Validate: ensure it's an actual accessible directory, not a deleted test path
  try {
    await fs.access(cwd);
    const stats = await fs.stat(cwd);
    if (!stats.isDirectory()) throw new Error('Not a directory');
  } catch {
    // WorkingDir is stale (e.g. from workingDir.test.ts temp dir cleanup) — use plugin root
    logger.warn(`Configured workingDir invalid: ${cwd}. Falling back to plugin root.`);
    cwd = PLUGIN_ROOT;
  }

  return path.join(cwd, '.ai_toolbox_memory.msgpack');
}

export class StateManager {
  private state: Map<string, StateEntry>;
  private maxSize: number;
  private persistenceEnabled: boolean;
  private memoryFile!: string; // NON-NULL ASSERTION (TS2564 fix)
  private runningSize: number; // Track size incrementally for O(1) checks
  
  /** FIX: Tracks initialization completion so reads wait for data */
  private _ready!: Promise<void>;

  constructor(config?: PluginConfig) {
    this.state = new Map();
    this.runningSize = 0;
    
    // FIX: Use DEFAULT_CONFIG as fallback, then merge with passed config (if any)
    const defaults = typeof DEFAULT_CONFIG !== 'undefined' ? DEFAULT_CONFIG : {};
    const effectiveConfig = { ...defaults, ...(config || {}) };

    this.maxSize = effectiveConfig.stateMaxSize ?? 10240;
    
    // FIX: Default to true even when no config is passed (e.g. in tests or standalone usage)
    this.persistenceEnabled = effectiveConfig.statePersistenceEnabled !== undefined 
      ? effectiveConfig.statePersistenceEnabled 
      : true;
    
    // FIX: Capture values in locals to satisfy TypeScript control flow analysis
    // (async callbacks run later, so TS doesn't track constructor assignments)
    const persistenceEnabled = this.persistenceEnabled;
    const stateMap = this.state;
    
    // FIX: Synchronous initialization path — no fire-and-forget race condition
    this._ready = (async () => {
      try {
        const resolvedPath = await getMemoryFilePath();
        this.memoryFile = resolvedPath;
        
        if (persistenceEnabled && stateMap.size === 0) {
          await this.loadFromFile(); // Now awaited, not fire-and-forget
        } else {
          logger.warn('State persistence is DISABLED. Data will not survive reloads.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to initialize state manager: ${message}`);
        this.memoryFile = path.join(PLUGIN_ROOT, '.ai_toolbox_memory.msgpack'); // Fallback
      }
    })();
  }

  /** FIX: Ensure initialization completes before reading/writing */
  private async ensureReady(): Promise<void> {
    return this._ready;
  }

  /**
   * Set a state value with key and optional metadata.
   * Disk persistence is fire-and-forget (non-blocking).
   */
  set(key: string, value: unknown): void {
    const newValueSize = this.getSizeOfValue(value);
    const oldValueSize = this.getExistingValueSize(key);
    
    // Check size limit using running total
    if (this.runningSize - oldValueSize + newValueSize > this.maxSize) {
      throw new Error(`State size exceeds maximum (${this.maxSize} bytes)`);
    }
    
    // Update running size before setting
    this.runningSize = this.runningSize - oldValueSize + newValueSize;
    
    this.state.set(key, {
      key,
      value,
      timestamp: Date.now(),
    });
    
    // Fire-and-forget async save to disk (fixes persistence issues across reloads)
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
    
    // Update running size before deleting
    this.runningSize -= this.getSizeOfValue(entry.value);
    const deleted = this.state.delete(key);
    
    // Fire-and-forget save after deletion
    if (deleted && this.persistenceEnabled) {
      void this.saveToFile().catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to persist state delete immediately: ${message}`);
      });
    }
    
    return deleted;
  }

  /**
   * Get all state keys. FIX: Waits for initialization if not ready yet.
   */
  async getAllKeys(): Promise<string[]> {
    await this.ensureReady(); // FIX: Ensure data is loaded before reading keys
    return Array.from(this.state.keys());
  }

  /**
   * Clear all state.
   */
  clear(): void {
    this.runningSize = 0;
    this.state.clear();
    
    // Fire-and-forget save after clearing
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
      // Calculate actual size of array elements
      return value.reduce((sum: number, elem: unknown) => sum + this.getSizeOfValue(elem), 0);
    }
    if (value instanceof Map) return value.size * 16;
    if (value instanceof Object && !(value instanceof Date)) {
      return JSON.stringify(value).length;
    }
    return 0;
  }

  /**
   * Save state to disk as msgpack binary file with optimized serialization.
   */
  private async saveToFile(): Promise<void> {
    try {
      // 🔥 🔥 🔥 FIX: Re-resolve memory file path on EVERY save. 
      // This ensures data persists to the *actual* current working directory, 
      // even if the LLM changed directories via `change_directory` during runtime.
      this.memoryFile = await getMemoryFilePath(); 
      
      const data = Array.from(this.state.entries()).map(([_key, entry]) => ({
        key: entry.key,
        value: entry.value,
        timestamp: entry.timestamp,
      }));
      
      // Ensure directory exists (create it if missing)
      const dir = path.dirname(this.memoryFile);
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err) {
        logger.warn(`Could not create memory directory ${dir}: ${String(err)}`);
        return; // Abort save if we can't create the dir
      }

      // Encode to msgpack binary format (much smaller than JSON)
      const encodedData = encode(data);
      
      // Write to temp file first, then rename for atomic operation
      const tempFile = this.memoryFile + '.tmp';
      await fs.writeFile(tempFile, encodedData);  // Buffer write (msgpack format)
      await fs.rename(tempFile, this.memoryFile);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to save to disk: ${message}`); // M2 fix: no console.warn
    }
  }

  /**
   * Load state from disk msgpack binary file with corruption recovery.
   */
  private async loadFromFile(): Promise<void> {
    try {
      if (!await fs.access(this.memoryFile).then(() => true).catch(() => false)) {
        logger.info(`No existing memory file found at ${this.memoryFile}. Starting fresh.`);
        return;
      }
      
      const buffer = await fs.readFile(this.memoryFile);  // Read as Buffer (msgpack format)
      
      // Try to decode msgpack with error recovery
      let data: StateEntry[];
      try {
        data = decode(buffer) as StateEntry[];
      } catch { // C1 fix: removed unused parseError variable
        logger.warn(`Corrupted state file detected, removing and starting fresh...`);

        // Attempt to remove the corrupted file to prevent repeated errors
        try {
          await fs.unlink(this.memoryFile);
          logger.info(`Removed corrupted memory file: ${this.memoryFile}`);
        } catch {
          logger.warn(`Could not automatically remove corrupted file. Please manually delete: ${this.memoryFile}`);
        }

        data = [];
      }
      
      this.state.clear();
      this.runningSize = 0;
      
      for (const entry of data) {
        // Validate entry structure before adding
        if (entry && typeof entry.key === 'string' && typeof entry.timestamp === 'number') {
          this.state.set(entry.key, entry);
          this.runningSize += this.getSizeOfValue(entry.value);
        }
      }
      
      logger.info(`Loaded ${this.state.size} entries from memory.`);

      // Create backup after successful load (still JSON for manual inspection)
      try {
        const backupData = Array.from(this.state.entries()).map(([_key, entry]) => ({
          key: entry.key,
          value: entry.value,
          timestamp: entry.timestamp,
        }));
        await fs.writeFile(this.memoryFile + '.backup.json', JSON.stringify(backupData), 'utf-8');
      } catch {
        // Ignore backup creation errors
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to load from disk: ${message}`);
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
      
      // Fire-and-forget save after import
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
   * Get the path to the memory file on disk.
   */
  getMemoryFilePath(): string {
    return this.memoryFile;
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
    await this.loadFromFile();
  }
}
