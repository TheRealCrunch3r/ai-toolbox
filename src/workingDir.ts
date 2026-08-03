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
      return JSON.parse(data) as { workingDir?: string };
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
    console.error(`[WorkingDir] Failed to persist state: ${errorMessage}`);
  }
}

// Mutable working directory — resolved on each call with priority: persisted > process.cwd() > BASE_DIR
let cachedWorkingDir: string | null = null;

function resolveWorkingDir(): string {
  // Check cache first (avoids repeated disk reads)
  if (cachedWorkingDir !== null) return cachedWorkingDir;
  
  // Priority 1: Persisted state file — BUT only if it still exists
  try {
    const persistedState = loadState();
    if (persistedState.workingDir && fs.existsSync(persistedState.workingDir)) {
      cachedWorkingDir = path.resolve(persistedState.workingDir);
      console.log(`[WorkingDir] Resolved from state file: ${cachedWorkingDir}`);
      return cachedWorkingDir;
    } else if (persistedState.workingDir && !fs.existsSync(persistedState.workingDir)) {
      // FIX: Persisted path no longer exists — clear stale state and fall through
      console.log(`[WorkingDir] WARNING: Persisted working dir '${persistedState.workingDir}' no longer exists. Clearing stale state.`);
      saveState({ workingDir: undefined });
    }
  } catch {} // Ignore errors
  
  // Priority 2: Actual process working directory (handles LM Studio sandbox changes)
  const cwd = path.resolve(process.cwd());
  if (fs.existsSync(cwd)) {
    console.log(`[WorkingDir] Resolved from process.cwd(): ${cwd}`);
    cachedWorkingDir = cwd;
    return cwd;
  }
  
  // Priority 3: Plugin root as absolute fallback
  console.log(`[WorkingDir] Resolved to plugin root (fallback): ${BASE_DIR}`);
  cachedWorkingDir = BASE_DIR;
  return BASE_DIR;
}

/** Get the current working directory — resolves fresh on each call */
export function getWorkingDir(): string {
  // Reset cache if state file changed (detects external modifications)
  try {
    const persistedState = loadState();
    const expected = cachedWorkingDir === BASE_DIR || !cachedWorkingDir ? null : cachedWorkingDir;
    if (persistedState.workingDir && path.resolve(persistedState.workingDir) !== expected) {
      cachedWorkingDir = null; // Force re-resolution
    }
  } catch {}
  
  return resolveWorkingDir();
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
    console.log(`setWorkingDir rejected: not absolute — '${newDir}'`);
    return false;
  }

  // Must exist and be a directory
  try {
    const stats = fs.statSync(resolved);
    if (!stats.isDirectory()) {
      console.log(`setWorkingDir rejected: not a directory — '${resolved}'`);
      return false;
    }
  } catch {
    console.log(`setWorkingDir rejected: path does not exist — '${resolved}'`);
    return false;
  }

  cachedWorkingDir = resolved;
  
  // PERSIST the change to disk (FIX for sandbox reset issue)
  saveState({ workingDir: resolved });
  console.log(`[WorkingDir] Persisted new working directory: ${resolved}`);
  
  return true;
}

/** 
 * Reset the working directory back to the plugin root
 * Also clears persisted state.
 */
export function resetWorkingDir(): void {
  cachedWorkingDir = BASE_DIR;
  saveState({ workingDir: undefined }); // Clear persisted state
  console.log(`[WorkingDir] Reset to plugin root: ${BASE_DIR}`);
}

/** Resolve a user-provided path against the current working directory */
export function resolvePath(userPath: string): string {
  return path.resolve(getWorkingDir(), userPath);
}

/** Get allowed base directories for absolute-path validation */
export function getAllowedBases(): string[] {
  // Allow both the plugin root and the current working directory
  const bases: readonly string[] = [BASE_DIR, getWorkingDir()];
  return Array.from(new Set(bases)); // Deduplicate
}

/** Get the plugin installation directory (never changes) */
export function getPluginRoot(): string {
  return BASE_DIR;
}
