/**
 * Persistent state management for plugin operations
 * Stores data to disk as JSON file for survival across reloads
 */

import type { PluginConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import * as fs from 'fs/promises';  // ASYNC import — FIX P2: Static import instead of require ===
import * as path from 'path';
import { getWorkingDir } from './workingDir.js';  // STATIC IMPORT (FIX P2)

interface StateEntry {
  key: string;
  value: unknown;
  timestamp: number;
}

/** Minimal logger for state manager (avoids circular dependency with index.ts) */
const logger = {
  warn: (msg: string) => typeof process.stderr.write === 'function' && process.stderr.write(`[StateManager] ${msg}\n`),
  info: (msg: string) => typeof process.stdout.write === 'function' && process.stdout.write(`[StateManager] ${msg}\n`),
};

/**
 * Default memory file location (in CURRENT WORKING DIRECTORY) — ASYNC ===
 */
async function getMemoryFilePath(): Promise<string> {  // MADE ASYNC for consistency
  const cwd = getWorkingDir();
  
  // Safety check: ensure we are in a valid directory — ASYNC stat
  try {
    await fs.access(cwd);  // ASYNC access check
    const stats = await fs.stat(cwd);  // ASYNC stat
    if (!stats.isDirectory()) {
      throw new Error('Not a directory');
    }
  } catch {
    logger.warn(`Working directory is invalid or inaccessible: ${cwd}. Defaulting to plugin root.`);
    return path.join(__dirname, '..', '.ai_toolbox_memory.json');
  }

  const memoryFile = path.join(cwd, '.ai_toolbox_memory.json');
  logger.info(`Memory file path: ${memoryFile}`);
  return memoryFile;
}

export class StateManager {
  private state: Map<string, StateEntry>;
  private maxSize: number;
  private persistenceEnabled: boolean;
  private memoryFile!: string; // NON-NULL ASSERTION (TS2564 fix) ===
  private runningSize: number; // Track size incrementally for O(1) checks

  constructor(config?: PluginConfig) {
    this.state = new Map();
    this.runningSize = 0;
    const effectiveConfig = config || DEFAULT_CONFIG;
    this.maxSize = effectiveConfig.stateMaxSize;
    this.persistenceEnabled = effectiveConfig.statePersistenceEnabled;
    
    // Resolve path immediately — ASYNC call (but we await in constructor via Promise)
    getMemoryFilePath().then(resolvedPath => {
      this.memoryFile = resolvedPath;
      
      // Auto-load from disk if persistence is enabled — ASYNC load
      if (this.persistenceEnabled && this.state.size === 0) {
        void this.loadFromFile();  // Fire and forget for constructor context
      } else {
        logger.warn('State persistence is DISABLED. Data will not survive reloads.');
      }
    }).catch(err => {
      logger.warn(`Failed to resolve memory file path: ${err.message}`);
      this.memoryFile = path.join(__dirname, '..', '.ai_toolbox_memory.json');  // Fallback
    });
  }

  /**
   * Set a state value with key and optional metadata — ASYNC save ===
   */
  async set(key: string, value: unknown): Promise<void> {
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
    
    // IMMEDIATE async save to disk (fixes persistence issues across reloads) — ASYNC ===
    if (this.persistenceEnabled) {
      try {
        await this.saveToFile();  // ASYNC call
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to persist state immediately: ${message}`);
      }
    }
  }

  /**
   * Get a state value by key — ASYNC ===
   */
  async get<T>(key: string): Promise<T | undefined> {  // MADE ASYNC for consistency
    const entry = this.state.get(key);
    if (!entry) return undefined;
    return entry.value as T;
  }

  /**
   * Delete a state entry — ASYNC save ===
   */
  async delete(key: string): Promise<boolean> {  // MADE ASYNC for consistency
    const entry = this.state.get(key);
    if (!entry) return false;
    
    // Update running size before deleting
    this.runningSize -= this.getSizeOfValue(entry.value);
    const deleted = this.state.delete(key);
    
    // Immediate save after deletion — ASYNC ===
    if (deleted && this.persistenceEnabled) {
      try {
        await this.saveToFile();  // ASYNC call
      } catch (error) {
        logger.warn(`Failed to persist state delete immediately: ${String(error)}`);
      }
    }
    
    return deleted;
  }

  /**
   * Get all state keys — ASYNC ===
   */
  getAllKeys(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * Clear all state — ASYNC save ===
   */
  async clear(): Promise<void> {  // MADE ASYNC for consistency
    this.runningSize = 0;
    this.state.clear();
    
    // Immediate save after clearing — ASYNC ===
    if (this.persistenceEnabled) {
      try {
        await this.saveToFile();  // ASYNC call
      } catch (error) {
        logger.warn(`Failed to persist state clear immediately: ${String(error)}`);
      }
    }
  }

  /**
   * Get size of existing value for a key (for incremental updates) — ASYNC ===
   */
  private getExistingValueSize(key: string): number {
    const entry = this.state.get(key);
    return entry ? this.getSizeOfValue(entry.value) : 0;
  }

  /**
   * Estimate size of a value in bytes — ASYNC already ===
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
   * Save state to disk as JSON file with optimized serialization — ASYNC ===
   */
  private async saveToFile(): Promise<void> {  // MADE ASYNC
    try {
      const data = Array.from(this.state.entries()).map(([_key, entry]) => ({
        key: entry.key,
        value: entry.value,
        timestamp: entry.timestamp,
      }));
      
      // Ensure directory exists (create it if missing) — ASYNC ===
      const dir = path.dirname(this.memoryFile);
      try {
        await fs.mkdir(dir, { recursive: true });  // ASYNC mkdir
      } catch (err) {
        logger.warn(`Could not create memory directory ${dir}: ${String(err)}`);
        return; // Abort save if we can't create the dir
      }

      // Optimized JSON serialization (no pretty-printing for performance) — ASYNC ===
      const jsonString = JSON.stringify(data);
      
      // Write to temp file first, then rename for atomic operation — ASYNC ===
      const tempFile = this.memoryFile + '.tmp';
      await fs.writeFile(tempFile, jsonString, 'utf-8');  // ASYNC write
      await fs.rename(tempFile, this.memoryFile);  // ASYNC rename
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to save to disk: ${message}`); // M2 fix: no console.warn
    }
  }

  /**
   * Load state from disk JSON file with corruption recovery — ASYNC ===
   */
  private async loadFromFile(): Promise<void> {  // MADE ASYNC
    try {
      if (!await fs.access(this.memoryFile).then(() => true).catch(() => false)) {  // ASYNC access check
        logger.info(`No existing memory file found at ${this.memoryFile}. Starting fresh.`);
        return;
      }
      
      const jsonString = await fs.readFile(this.memoryFile, 'utf-8');  // ASYNC read
      
      // Try to parse JSON with error recovery
      let data: StateEntry[];
      try {
        data = JSON.parse(jsonString) as StateEntry[];
      } catch { // C1 fix: removed unused parseError variable
        logger.warn(`Corrupted state file detected, attempting recovery...`);

        // Try to recover by reading line by line or using backup — ASYNC ===
        const backupFile = this.memoryFile + '.backup';
        if (await fs.access(backupFile).then(() => true).catch(() => false)) {  // ASYNC access check
          try {
            const backupString = await fs.readFile(backupFile, 'utf-8');  // ASYNC read
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
      
      logger.info(`Loaded ${this.state.size} entries from memory.`);

      // Create backup after successful load — ASYNC ===
      try {
        await fs.writeFile(this.memoryFile + '.backup', jsonString, 'utf-8');  // ASYNC write
      } catch {
        // Ignore backup creation errors
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to load from disk: ${message}`);
    }
  }

  /**
   * Export state for persistence (JSON serialization) — kept for backward compatibility — ASYNC ===
   */
  async exportState(): Promise<string> {  // MADE ASYNC for consistency
    const data = Array.from(this.state.entries()).map(([_key, entry]) => ({
      key: entry.key,
      value: entry.value,
      timestamp: entry.timestamp,
    }));
    return JSON.stringify(data);
  }

  /**
   * Import state from JSON string — kept for backward compatibility — ASYNC ===
   */
  async importState(jsonString: string): Promise<void> {  // MADE ASYNC for consistency
    try {
      const data = JSON.parse(jsonString) as StateEntry[];
      this.state.clear();
      this.runningSize = 0;
      for (const entry of data) {
        this.state.set(entry.key, entry);
        this.runningSize += this.getSizeOfValue(entry.value);
      }
      
      // Immediate save after import — ASYNC ===
      if (this.persistenceEnabled) {
        try {
          await this.saveToFile();  // ASYNC call
        } catch (error) {
          logger.warn(`Failed to persist state import: ${String(error)}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to import state: ${message}`);
    }
  }

  /**
   * Get the path to the memory file on disk — ASYNC ===
   */
  async getMemoryFilePath(): Promise<string> {  // MADE ASYNC for consistency
    return this.memoryFile;
  }

  /**
   * Force save to disk (useful for debugging) — ASYNC ===
   */
  async forceSave(): Promise<void> {  // MADE ASYNC for consistency
    await this.saveToFile();  // ASYNC call
  }

  /**
   * Force load from disk (useful for debugging) — ASYNC ===
   */
  async forceLoad(): Promise<void> {  // MADE ASYNC for consistency
    await this.loadFromFile();  // ASYNC call
  }
}