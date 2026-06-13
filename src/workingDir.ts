/**
 * Working Directory Manager with Persistent Storage
 * 
 * Tracks a mutable working directory that persists across sandbox resets.
 * Uses file-based storage to survive isolated execution contexts.
 */

import * as path from 'path';
import * as fs from 'fs';

// Base directory: plugin root (where package.json lives)
const BASE_DIR = path.join(__dirname, '..');

// Persistent storage file for working directory
const STATE_FILE = path.join(BASE_DIR, '.ai_toolbox_state.json');

/** Load persisted state from disk */
function loadState(): { workingDir?: string } {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Ignore errors - use defaults
  }
  return {};
}

/** Save state to disk */
function saveState(state: { workingDir?: string }): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`[WorkingDir] Failed to persist state: ${errorMessage}`);
  }
}

// Mutable working directory — loaded from persistent storage or defaults to plugin root
const persistedState = loadState();
let currentWorkingDir: string = persistedState.workingDir || BASE_DIR;

/** Get the current working directory */
export function getWorkingDir(): string {
  return currentWorkingDir;
}

/**
 * Set the working directory to a new absolute path.
 * Validates that the path exists and is an absolute directory.
 * PERSISTS the change to disk so it survives sandbox resets.
 */
export function setWorkingDir(newDir: string): boolean {
  // Resolve to absolute path
  const resolved = path.resolve(newDir);

  // Must be an absolute path
  if (!path.isAbsolute(resolved)) {
    console.warn(`setWorkingDir rejected: not absolute — '${newDir}'`);
    return false;
  }

  // Must exist and be a directory
  try {
    const stats = fs.statSync(resolved);
    if (!stats.isDirectory()) {
      console.warn(`setWorkingDir rejected: not a directory — '${resolved}'`);
      return false;
    }
  } catch {
    console.warn(`setWorkingDir rejected: path does not exist — '${resolved}'`);
    return false;
  }

  currentWorkingDir = resolved;
  
  // PERSIST the change to disk (FIX for sandbox reset issue)
  saveState({ workingDir: resolved });
  console.warn(`[WorkingDir] Persisted new working directory: ${resolved}`);
  
  return true;
}

/** 
 * Reset the working directory back to the plugin root
 * Also clears persisted state.
 */
export function resetWorkingDir(): void {
  currentWorkingDir = BASE_DIR;
  saveState({ workingDir: undefined }); // Clear persisted state
  console.warn(`[WorkingDir] Reset to plugin root: ${BASE_DIR}`);
}

/** Resolve a user-provided path against the current working directory */
export function resolvePath(userPath: string): string {
  return path.resolve(currentWorkingDir, userPath);
}

/** Get allowed base directories for absolute-path validation */
export function getAllowedBases(): string[] {
  // Allow both the plugin root and the current working directory
  const bases: readonly string[] = [BASE_DIR, currentWorkingDir];
  return Array.from(new Set(bases)); // Deduplicate
}

/** Get the plugin installation directory (never changes) */
export function getPluginRoot(): string {
  return BASE_DIR;
}
