/**
 * Persistent state management for plugin operations
 * Stores data to disk as JSON file for survival across reloads
 */

import type { PluginConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface StateEntry {
  key: string;
  value: unknown;
  timestamp: number;
}

/** Minimal logger for state manager (avoids circular dependency with index.ts) */
const logger = {
  warn: (msg: string) => typeof process.stderr.write === 'function' && process.stderr.write(`[StateManager] ${msg}\n`),
};

/** Debounced async state persistence (500ms delay) */
function createDebouncedSave(saveFn: () => void, delayMs: number = 500): (() => void) {
  let timerId: NodeJS.Timeout | null = null;
  
  return function debouncedSave(): void {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      saveFn();
      timerId = null;
    }, delayMs);
  };
}

/**
 * Default memory file location (in LM Studio plugin data directory)
 */
function getMemoryFilePath(): string {
  // Try to find LM Studio's app data directory for persistence
  const platform = os.platform();
  
  let baseDir: string;
  switch (platform) {
    case 'win32':
      baseDir = path.join(process.env.APPDATA || '', 'lm-studio', 'plugins');
      break;
    case 'darwin':
      baseDir = path.join(os.homedir(), 'Library', 'Application Support', 'lm-studio', 'plugins');
      break;
    default:
      baseDir = path.join(process.env.HOME || '', '.local', 'share', 'lm-studio', 'plugins');
  }
  
  return path.join(baseDir, 'ai-toolbox-memory.json');
}

export class StateManager {
  private state: Map<string, StateEntry>;
  private maxSize: number;
  private persistenceEnabled: boolean;
  private memoryFile: string;
  private runningSize: number; // Track size incrementally for O(1) checks
  private debouncedSave: () => void;

  constructor(config?: PluginConfig) {
    this.state = new Map();
    this.runningSize = 0;
    const effectiveConfig = config || DEFAULT_CONFIG;
    this.maxSize = effectiveConfig.stateMaxSize;
    this.persistenceEnabled = effectiveConfig.statePersistenceEnabled;
    this.memoryFile = getMemoryFilePath();
    
    // Create debounced save function (500ms delay)
    this.debouncedSave = createDebouncedSave(() => this.saveToFile(), 500);
    
    // Auto-load from disk if persistence is enabled
    if (this.persistenceEnabled) {
      this.loadFromFile();
    }
  }

  /**
   * Set a state value with key and optional metadata
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
    
    // Debounced auto-save to disk (500ms delay) — only if persistence enabled
    if (this.persistenceEnabled) {
      this.debouncedSave();
    }
  }

  /**
   * Get a state value by key
   */
  get<T>(key: string): T | undefined {
    const entry = this.state.get(key);
    if (!entry) return undefined;
    return entry.value as T;
  }

  /**
   * Delete a state entry
   */
  delete(key: string): boolean {
    const entry = this.state.get(key);
    if (!entry) return false;
    
    // Update running size before deleting
    this.runningSize -= this.getSizeOfValue(entry.value);
    const deleted = this.state.delete(key);
    
    // Debounced auto-save to disk after deletion
    if (deleted && this.persistenceEnabled) {
      this.debouncedSave();
    }
    
    return deleted;
  }

  /**
   * Get all state keys
   */
  getAllKeys(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.runningSize = 0;
    this.state.clear();
    
    // Debounced auto-save to disk after clearing
    if (this.persistenceEnabled) {
      this.debouncedSave();
    }
  }

  /**
   * Get size of existing value for a key (for incremental updates)
   */
  private getExistingValueSize(key: string): number {
    const entry = this.state.get(key);
    return entry ? this.getSizeOfValue(entry.value) : 0;
  }

  /**
   * Estimate size of a value in bytes
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
   * Save state to disk as JSON file with optimized serialization
   */
  private saveToFile(): void {
    try {
      const data = Array.from(this.state.entries()).map(([_key, entry]) => ({
        key: entry.key,
        value: entry.value,
        timestamp: entry.timestamp,
      }));
      
      // Ensure directory exists
      const dir = path.dirname(this.memoryFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Optimized JSON serialization (no pretty-printing for performance)
      const jsonString = JSON.stringify(data);
      
      // Write to temp file first, then rename for atomic operation
      const tempFile = this.memoryFile + '.tmp';
      fs.writeFileSync(tempFile, jsonString, 'utf-8');
      fs.renameSync(tempFile, this.memoryFile);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to save to disk: ${message}`); // M2 fix: no console.warn
    }
  }

  /**
   * Load state from disk JSON file with corruption recovery
   */
  private loadFromFile(): void {
    try {
      if (!fs.existsSync(this.memoryFile)) return;
      
      const jsonString = fs.readFileSync(this.memoryFile, 'utf-8');
      
      // Try to parse JSON with error recovery
      let data: StateEntry[];
      try {
        data = JSON.parse(jsonString) as StateEntry[];
      } catch { // C1 fix: removed unused parseError variable
        logger.warn(`Corrupted state file detected, attempting recovery...`);

        // Try to recover by reading line by line or using backup
        const backupFile = this.memoryFile + '.backup';
        if (fs.existsSync(backupFile)) {
          try {
            const backupString = fs.readFileSync(backupFile, 'utf-8');
            data = JSON.parse(backupString) as StateEntry[];
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
        // Validate entry structure before adding
        if (entry && typeof entry.key === 'string' && typeof entry.timestamp === 'number') {
          this.state.set(entry.key, entry);
          this.runningSize += this.getSizeOfValue(entry.value);
        }
      }
      
      // Create backup after successful load
      try {
        fs.writeFileSync(this.memoryFile + '.backup', jsonString, 'utf-8');
      } catch {
        // Ignore backup creation errors
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to load from disk: ${message}`);
    }
  }

  /**
   * Export state for persistence (JSON serialization) — kept for backward compatibility
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
   * Import state from JSON string — kept for backward compatibility
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
      
      // Debounced auto-save after import
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
  getMemoryFilePath(): string {
    return this.memoryFile;
  }

  /**
   * Force save to disk (useful for debugging)
   */
  forceSave(): void {
    this.saveToFile();
  }

  /**
   * Force load from disk (useful for debugging)
   */
  forceLoad(): void {
    this.loadFromFile();
  }
}
