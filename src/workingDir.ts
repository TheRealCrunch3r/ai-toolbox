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

// Verbose [WorkingDir] traces follow the project convention (contextGuard.ts DEBUG_MODE).
// Enable with AI_TOOLBOX_DEBUG=1. Rare/anomalous logs (rejections, stale-state warning) stay visible always.
const DEBUG_MODE = !!process.env.AI_TOOLBOX_DEBUG;
function debugLog(message: string): void {
  if (DEBUG_MODE) console.log(message);
}

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
      debugLog(`[WorkingDir] Resolved from state file: ${cachedWorkingDir}`);
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
    debugLog(`[WorkingDir] Resolved from process.cwd(): ${cwd}`);
    cachedWorkingDir = cwd;
    return cwd;
  }
  
  // Priority 3: Plugin root as absolute fallback
  debugLog(`[WorkingDir] Resolved to plugin root (fallback): ${BASE_DIR}`);
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
  debugLog(`[WorkingDir] Persisted new working directory: ${resolved}`);
  
  return true;
}

/** 
 * Reset the working directory back to the plugin root
 * Also clears persisted state.
 */
export function resetWorkingDir(): void {
  cachedWorkingDir = BASE_DIR;
  saveState({ workingDir: undefined }); // Clear persisted state
  debugLog(`[WorkingDir] Reset to plugin root: ${BASE_DIR}`);
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


// ==================== Registered Project Discovery (CWD level) ====================

/** Minimal project entry used for CWD resolution and keyword matching */
export interface KnownProject {
  name: string;
  path: string;
  /** Last accessed/saved timestamp in ms, if known by any source */
  lastSeen?: number;
}

/**
 * List registered projects from the plugin root's state files (lightweight, side-effect free).
 * Primary source: <baseDir>/.session_context/project_registry.json — { projects: [{ name, path, lastAccessed }] }
 * Fallback source: <baseDir>/.session_index.json (legacy StateManager format) — { projects: { name: { path, last_session_saved } } }
 * Entries are merged and deduplicated by resolved path; when both sources know a project, the most recent timestamp wins.
 * Safe to call on the prompt hot path (plain JSON reads, no registration side effects).
 */
export function listRegisteredProjects(baseDir: string = BASE_DIR): KnownProject[] {
  const seen = new Map<string, KnownProject>();

  const addEntry = (name: string, rawPath: string, lastSeen?: number): void => {
    if (!rawPath) return;
    const key = path.resolve(rawPath);
    const existing = seen.get(key);
    if (existing) {
      // Keep first-seen identity, upgrade timestamp to the most recent across sources
      if ((lastSeen ?? 0) > (existing.lastSeen ?? 0)) existing.lastSeen = lastSeen;
      return;
    }
    seen.set(key, { name, path: key, lastSeen });
  };

  // Primary: project_registry.json (ProjectRegistryManager format)
  try {
    const registryPath = path.join(baseDir, '.session_context', 'project_registry.json');
    if (fs.existsSync(registryPath)) {
      const parsed: unknown = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      const o = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
      if (Array.isArray(o.projects)) {
        for (const p of o.projects) {
          if (!p || typeof p !== 'object') continue;
          const e = p as { name?: string; path?: string; lastAccessed?: number };
          if (typeof e.name === 'string' && typeof e.path === 'string') {
            addEntry(e.name, e.path, typeof e.lastAccessed === 'number' ? e.lastAccessed : undefined);
          }
        }
      }
    }
  } catch {
    // Invalid/unreadable registry — fall through to legacy source
  }

  // Fallback: .session_index.json (legacy StateManager format)
  try {
    const indexPath = path.join(baseDir, '.session_index.json');
    if (fs.existsSync(indexPath)) {
      const parsed: unknown = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      const o = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
      if (o.projects && typeof o.projects === 'object' && !Array.isArray(o.projects)) {
        for (const [name, rawEntry] of Object.entries(o.projects as Record<string, unknown>)) {
          if (!rawEntry || typeof rawEntry !== 'object') continue;
          const e = rawEntry as { path?: string; last_session_saved?: number | null };
          if (typeof e.path === 'string') {
            addEntry(name, e.path, typeof e.last_session_saved === 'number' ? e.last_session_saved : undefined);
          }
        }
      }
    }
  } catch {
    // Invalid/unreadable session index — ignore
  }

  return Array.from(seen.values());
}

/**
 * Restore the last-active project as working directory at session start.
 * Only acts when there is NO valid persisted workingDir state (i.e., resolution would otherwise
 * fall back to process.cwd() — e.g., stale/missing state file after a plugin reinstall).
 * Picks the most recently seen registered project whose path still exists.
 */
export function restoreLastActiveProjectCwd(baseDir: string = BASE_DIR): { restored: boolean; project?: string } {
  // Idempotent guard: valid persisted state already present → nothing to do
  try {
    const st = loadState();
    if (st.workingDir && fs.existsSync(st.workingDir)) return { restored: false };
  } catch {}

  const candidates = listRegisteredProjects(baseDir)
    .filter((p): boolean => {
      try {
        return fs.statSync(p.path).isDirectory();
      } catch {
        return false; // Path no longer exists — skip
      }
    })
    .sort((a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0));

  for (const candidate of candidates) {
    if (setWorkingDir(candidate.path)) {
      console.log(`[WorkingDir] Restored last-active project CWD: "${candidate.name}" → ${candidate.path}`);
      return { restored: true, project: candidate.path };
    }
  }

  return { restored: false };
}
