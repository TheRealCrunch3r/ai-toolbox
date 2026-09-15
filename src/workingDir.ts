/**
 * Working Directory Manager with Persistent Storage
 * 
 * Tracks a mutable working directory that persists across sandbox resets.
 * Uses file-based storage to survive isolated execution contexts.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os'; // 🔹 FIX #31 (12.09): jest-guarded temp state file location
import { decode } from '@msgpack/msgpack';
import { getDataDir } from './dataDir.js'; // 🔹 REG-MOVE (12.09): persistent data dir for the project registry

// Base directory: plugin root (where package.json lives)
const BASE_DIR = path.join(__dirname, '..');

// ==================== Registry bootstrap (11.09 reinstall-forensics fix) ====================
// REGRESSION FIXED: after a clean uninstall+reinstall both registry sources under the plugin dir
// (<baseDir>/.session_context/project_registry.json and <baseDir>/.session_index.json) are absent, so
// restoreLastActiveProjectCwd() and keyword detection booted with an EMPTY registry until some lazy
// tool call (register_project / switch_context / list_projects auto-sync) happened to write one.
// Session memory (.ai_toolbox_memory.msgpack entries carry a project_path stamp set by
// ContextStorageManager from the actual working dir — never guessed paths) is the durable source of
// "projects this plugin actually worked on". bootstrapRegistryFromSessionMemory() materializes those
// stamped directories into the PRIMARY registry file under baseDir when no candidates exist yet.
// Provenance rule mirrors ProjectRegistryManager._syncFromSessionMemory (contextManagementTools.ts):
// <wd>/.session_context/<file.msgpack> → register dirname(dirname(stamp)); bare-directory stamps are
// honored only if they still exist as real directories. No cwd-guessing, no free-text mining — this is
// recovery of already-persisted knowledge, within the no-auto-registration rule (index.ts L2).

/** Resolve a stored project_path stamp to an actual working directory, or null if not one (F2 rule). */
function resolveStampToDirectory(stamp: string): string | null {
  let candidate = stamp;
  try {
    const parentDir = path.dirname(stamp);
    if (path.basename(stamp).toLowerCase().endsWith('.msgpack') && parentDir.toLowerCase().endsWith(path.sep + '.session_context')) {
      candidate = path.dirname(parentDir); // canonical shape: <wd>/.session_context/<file>.msgpack → <wd>
    }
    const stats = fs.statSync(candidate);
    return stats.isDirectory() ? candidate : null;
  } catch {
    return null; // stale/nonexistent — skip, never register ghosts
  }
}

/** Scan one msgpack memory file for project_path stamps; returns deduped existing working directories. */
function collectStampedDirectories(memPath: string): string[] {
  try {
    if (!fs.existsSync(memPath)) return [];
    const raw = decode(fs.readFileSync(memPath));
    if (!Array.isArray(raw)) return [];
    const dirs = new Set<string>();
    for (const e of raw) {
      if (!e || typeof e !== 'object' || Array.isArray(e)) continue; // state records / malformed — never registration sources
      const pp = (e as Record<string, unknown>).project_path;
      if (typeof pp === 'string' && pp.length > 0) {
        const dir = resolveStampToDirectory(pp);
        if (dir) dirs.add(dir);
      }
    }
    return Array.from(dirs);
  } catch {
    return []; // unreadable/corrupt store — non-fatal, skip source
  }
}

// Jest guard — mirrors stateManager.isTestEnvironment (JEST_WORKER_ID). Under jest, BASE_DIR/getWorkingDir()
// resolve into the real dev repo; its live memory store must not leak actual projects into test fixtures.
const isTestEnvironment = !!process.env.JEST_WORKER_ID;

/**
 * Boot-time registry bootstrap. Materializes session-memory-stamped directories into the primary
 * registry file at <baseDir>/.session_context/project_registry.json when neither registry source yet
 * yields candidates (e.g., fresh install after clean uninstall). Idempotent: existing entries keep
 * their name; lastAccessed is bumped to now on every materialized entry. Returns count written (0 = no-op).
 */
function bootstrapRegistryFromSessionMemory(baseDir: string): number {
  // No-op when any registry source already knows projects — never clobber or race the lazy writers.
  if (listRegisteredProjects(baseDir).length > 0) return 0;

  const sources = new Set<string>();
  // Plugin-root legacy shared store (pre-isolation installs + plugin-level saves land here)
  sources.add(path.join(baseDir, '.session_context', '.ai_toolbox_memory.msgpack'));
  // Active working dir's per-project store — after a reinstall its stamp recovers the previous project.
  // Jest guard: under jest, getWorkingDir() resolves into the real dev repo; that live memory store would
  // otherwise materialize an actual registry entry into isolated fixtures (empty-registry assertions break).
  if (!isTestEnvironment) {
    try { sources.add(path.join(getWorkingDir(), '.session_context', '.ai_toolbox_memory.msgpack')); } catch { /* non-fatal */ }
  }

  const dirs: string[] = [];
  for (const src of sources) {
    for (const d of collectStampedDirectories(src)) {
      if (!dirs.includes(d)) dirs.push(d);
    }
  }
  if (dirs.length === 0) return 0;

  let projects: Array<{ name: string; path: string; lastAccessed: number; sessionCount?: number; sourceDirs?: string[] }> = [];
  try { // preserve any entries created concurrently between check and write
    const existingPath = path.join(baseDir, '.session_context', 'project_registry.json');
    if (fs.existsSync(existingPath)) {
      const parsed: unknown = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
      const o = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
      if (Array.isArray(o.projects)) {
        projects = (o.projects as Array<Record<string, unknown>>)
          .filter(p => p && typeof p.name === 'string' && typeof p.path === 'string')
          .map(p => ({ name: String(p.name), path: String(p.path), lastAccessed: typeof p.lastAccessed === 'number' ? p.lastAccessed : 0, sessionCount: typeof p.sessionCount === 'number' ? p.sessionCount : undefined, sourceDirs: Array.isArray(p.sourceDirs) ? (p.sourceDirs as string[]) : [] }));
      }
    }
  } catch { /* unreadable existing — rebuild from stamped dirs below */ }

  const now = Date.now();
  for (const dir of dirs) {
    const idx = projects.findIndex(p => path.resolve(p.path) === path.resolve(dir));
    if (idx !== -1) projects[idx].lastAccessed = now; // known project — refresh recency only
    else projects.push({ name: path.basename(dir) || dir, path: dir, lastAccessed: now, sessionCount: 0, sourceDirs: [] });
  }

  try {
    // 🔹 REG-MOVE (12.09): boot-time writes target the persistent data dir too (single writer location per env).
    const registryPath = path.join(getDataDir(), 'project_registry.json');
    fs.mkdirSync(path.dirname(registryPath), { recursive: true });
    const json = JSON.stringify({ projects, lastUpdated: now }, null, 2);
    fs.writeFileSync(registryPath + '.tmp', json);
    try {
      fs.renameSync(registryPath + '.tmp', registryPath); // atomic; same pattern as stateManager.saveSessionIndex
    } catch {
      fs.writeFileSync(registryPath, json); // Windows fallback (file lock)
    }
    // 🔹 FIX #28 (11.09): this boot-time writer shares the primary file with ProjectRegistryManager —
    // keep the plugin-dir backup copy in sync for it as well, so load()'s corruption recovery always has a
    // last-known-good state regardless of which writer tore the primary. Non-fatal: primary is already durable.
    try {
      const bakPath = registryPath + '.bak';
      fs.writeFileSync(bakPath + '.tmp', json);
      fs.renameSync(bakPath + '.tmp', bakPath); // atomic backup update (same dir → same volume)
    } catch (bakErr) {
      const bakMsg = bakErr instanceof Error ? bakErr.message : String(bakErr);
      console.warn(`[WorkingDir] Registry bootstrap: backup copy update failed (primary IS saved): ${bakMsg}`);
    }
    console.log(`[WorkingDir] Registry bootstrap: materialized ${projects.length} project(s) from session memory into ${registryPath}`);
    return projects.length;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[WorkingDir] Registry bootstrap write failed (non-fatal): ${msg}`);
    return 0;
  }
}


// Persistent storage file for working directory.
// 🔹 FIX #31 (12.09, test-hygiene leak): under jest the module's __dirname is the REAL dev repo, so
// saveState() persisted whatever a suite set as working dir (workingDir.test.ts → os.tmpdir()/ai-toolbox-test-*)
// into <repoRoot>/.ai_toolbox_state.json. `lms dev --install` ships that file into the plugin snapshot and
// the stale tmp path broke post-restart CWD resolution live on 12.09 (canary d). Under jest the state file is
// therefore redirected to a per-run temp dir — same convention as isTestEnvironment above + dataDir.ts' guard.
// 🔹 FIX #31b (12.09): resolution must be LAZY and mock-safe. The original module-scope call crashed suites
// that fully-mock 'os' without tmpdir (utilityTools.test.ts: jest.mock('os', factory) + import chain via
// utilityTools → workingDir = "TypeError: os.tmpdir is not a function" at suite setup), and a fixed path broke
// cwdConsistency's on-disk persistence assertion. Lazy resolution skips suites that never persist state; the
// try/catch keeps any mock-shaped 'os' from breaking import/use. Production (no JEST_WORKER_ID) = unchanged path.
const PRODUCTION_STATE_FILE = path.join(BASE_DIR, '.ai_toolbox_state.json');
let jestStateFile: string | null = null;

function resolveJestStateFile(): string {
  if (jestStateFile !== null) return jestStateFile; // one location per process — reads & writes must agree
  let loc = '';
  try {
    const tmpBase = typeof os.tmpdir === 'function' ? os.tmpdir() : fs.mkdtempSync(''); // '' → OS default temp dir, no 'os' needed
    loc = path.join(fs.mkdtempSync(path.join(tmpBase, 'ai-toolbox-state-test-')), '.ai_toolbox_state.json');
  } catch {
    loc = path.join(process.cwd(), `.ai_toolbox_state.jest-${process.pid}.json`); // last resort: distinct name, never the production file
  }
  jestStateFile = loc;
  return loc;
}

/** 🔹 FIX #31b: single source of truth for the state-file location — tests assert against this, not a re-derived path. */
export function getStateFilePath(): string {
  return process.env.JEST_WORKER_ID ? resolveJestStateFile() : PRODUCTION_STATE_FILE;
}

// Verbose [WorkingDir] traces follow the project convention (contextGuard.ts DEBUG_MODE).
// Enable with AI_TOOLBOX_DEBUG=1. Rare/anomalous logs (rejections, stale-state warning) stay visible always.
const DEBUG_MODE = !!process.env.AI_TOOLBOX_DEBUG;
function debugLog(message: string): void {
  if (DEBUG_MODE) console.log(message);
}

/** Load persisted state from disk (🔹 FIX #31b: path via getStateFilePath — jest-safe + single source of truth) */
function loadState(): { workingDir?: string } {
  try {
    const stateFile = getStateFilePath();
    if (fs.existsSync(stateFile)) {
      const data = fs.readFileSync(stateFile, 'utf-8');
      return JSON.parse(data) as { workingDir?: string };
    }
  } catch {
    // Ignore errors - use defaults
  }
  return {};
}

/** Save state to disk (🔹 FIX #31b: same getStateFilePath seam — writes and reads always agree) */
function saveState(state: { workingDir?: string }): void {
  try {
    fs.writeFileSync(getStateFilePath(), JSON.stringify(state, null, 2));
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

  // 🔹 REG-MOVE (12.09) — highest priority: persistent data-dir primary (survives `lms dev --install` wipes).
  try {
    const dataRegistryPath = path.join(getDataDir(), 'project_registry.json');
    if (fs.existsSync(dataRegistryPath)) {
      const parsed: unknown = JSON.parse(fs.readFileSync(dataRegistryPath, 'utf-8'));
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
  } catch { /* unreadable data-dir registry — fall through to install-dir sources */ }

  // Primary: project_registry.json (ProjectRegistryManager format) — kept as fallback for the migration window
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
  // 🔹 FIX #29 (12.09, "elephant in the room" — registry bootstrap skipped after reinstall):
  // The 11.09 bootstrap call sat BELOW the idempotent guard and was therefore only reachable when the
  // persisted CWD state was missing/invalid. That is exactly the post-reinstall hazard: an uninstall+reinstall
  // wipes both plugin-dir registries (project_registry.json + .session_index.json) while .ai_toolbox_state.json
  // can still hold a VALID workingDir → the guard early-returned, bootstrap never ran, and list_projects /
  // search_projects / keyword detection ran against an EMPTY registry for the whole session until some lazy tool
  // write (register_project / switch_context) happened to create one (observed live 12.09: both tools returned
  // [] although durable session-memory stamps existed in plugin-dir + project msgpack stores).
  // Bootstrap now runs BEFORE the guard on every boot. It is already self-conservative — no-op when EITHER
  // registry source yields ≥1 project, and it only materializes directories that still exist on disk (no ghosts,
  // no auto-registration: index.ts rule #2 intact) — so the healthy-case cost is two small JSON reads per boot.
  try {
    bootstrapRegistryFromSessionMemory(baseDir);
  } catch { /* non-fatal — resolution proceeds with whatever is on disk */ }

  // Idempotent guard: valid persisted state already present → nothing to do.
  // (The bootstrap above may have repaired the registry, but the CWD itself needs no restore in that case.)
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
