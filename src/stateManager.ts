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
// 🔹 D-LOST-WRITE (20.09): per-path in-process lock for the shared state store — see src/sharedFileLock.ts
import { withSharedFileLock } from './sharedFileLock';
import type { ContextOrigin } from './contextTiers.js';
import { replaceTier, createContextNode } from './contextTiers.js';

/** 🔹 SPEC-C (20.09, memory-store incident): default byte cap for the per-project state store
 * (was a hardcoded 10240 inline in the constructor). The 20.09 incident proved that with the old
 * default a single active session exhausts the budget and set() throws on EVERY subsequent write —
 * the "poisoned store" failure mode (save_memory / save_session_summary fail permanently until manual
 * data repair). Raised to 256 KiB; bounded memory_* eviction in set()/setWithTier() is the second line
 * of defense so even this larger budget can never hard-fail again while evictable records exist. */
const DEFAULT_MAX_STATE_SIZE_BYTES = 262144;

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
    // Only updates projects that are explicitly registered via manage_projects(action='register') tool (register_project remains a deprecated alias).
    // Unregistered projects will fail silently — this prevents accidental registration on first save without user confirmation.
    index[projectName].last_session_saved = Date.now();
    
    // Auto-promote from 'registered' to 'active' after first save (only for previously-registered projects)
    if (index[projectName].status === 'registered') {
      logger.info(`[StateManager] Project '${projectName}' promoted to active status.`);
      index[projectName].status = 'active';
    }

    await saveSessionIndex(index);
  } else {
    // 🔹 FIX #32 (12.09): SILENT SKIP — this per-copy legacy index is ORPHANED by design since REG-MOVE.
    // Project registration now lives ONLY in the persistent data-dir registry (~/.lmstudio/extensions/data/
    // crunch3r/ai-toolbox/project_registry.json); NO code path seeds <PLUGIN_ROOT>/.session_index.json anymore,
    // and the install dir is wiped on every `lms dev --install` — so a missing file/entry is the NORMAL state
    // of any fresh copy, not an error. The old warn fired on EVERY state save (observed live 12.09 ~22:22 in
    // LM Studio's main.log) and its suggested remedy was unperformable: manage_projects(action='register')
    // never writes to this file. No data impact — memory/summaries persist via the working-dir msgpack stores;
    // only this legacy bookkeeping timestamp (consumed solely by ProjectRegistryManager's READ-ONLY migration
    // fallback _loadFromSessionIndex) is skipped here. Removing the whole mechanism = tracked Option C.
    return;
  }
}

/** Get the current project name from context (defaults to active working dir's basename) */
// ? CONTAMINATION-FIX Part B export (01.10): readers must resolve the SAME name StateManager uses for its
// store filename, so they can detect identity drift (frozen construction-time name vs. live CWD) and/or read
// the correct per-project file instead of a hardcoded one. RESEARCH_session-memory-contamination_2026-10-01 §4.
export function resolveProjectName(): string {
  const cwd = getWorkingDir();
  // Extract last directory component as fallback project name
  return path.basename(cwd).toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// 🔹 SPEC-C follow-up (20.09 PM): getPluginMemoryFilePath() REMOVED — its only consumer was the
// constructor field pluginMemoryFile, which fed getMemoryFilePath()'s stale "Legacy compat" return value
// (PLUGIN_ROOT-based path frozen at construction while real I/O is working-dir-based). Removing both kills
// the wrong-location contract at the root; per-project resolution lives in getProjectMemoryFilePath().

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

    // 🔹 SPEC-C follow-up (20.09 PM): a torn/partial write can decode "successfully" to a NON-ARRAY single
    // value — msgpack is self-delimiting, so a truncated or interleaved buffer may yield one valid scalar
    // while the trailing bytes are ignored by strict decoders' partial reads / accepted as complete values.
    // The old code then hit `for (const entry of data)` TypeError, which the OUTER catch swallowed as
    // "Failed to load memory file": no quarantine, no recovery, silent empty store — the exact failure
    // signature observed in csmSharedFileRegression Suites B/D (0 quarantines for a corrupt primary).
    // Route non-array decodes into the SAME recovery/quarantine branch below.
    let data: StateEntry[];
    try {
      const decoded: unknown = decode(buffer);
      if (!Array.isArray(decoded)) {
        throw new Error(`decoded value is not an array (torn write, got ${typeof decoded})`);
      }
      data = decoded as StateEntry[];
    } catch (decodeErr: unknown) {
      // 🔹 F3 (10.09): QUARANTINE, never delete — an undecodable file may be a torn/partial write
      // from the non-atomic fallback below, not logically corrupted data. Renaming to .corrupt-*
      // preserves it for inspection/restore and stops the destroy-and-recreate cycle (old behavior:
      // fs.unlink + empty state → next save wrote an empty file over the destroyed one).
      const reason = decodeErr instanceof Error ? decodeErr.message : String(decodeErr);

      // 🔹 SPEC-C Primary 1 (20.09, bug #3): this store is SHARED with ContextStorageManager (context
      // entries {id,type,title,content…} — see FIX #23/#25 in contextManagementTools.ts). Quarantining a
      // corrupted shared file destroys BOTH layers at once (observed live 20.09 incident: two .corrupt-*
      // quarantines, store left with no usable records after). saveMemoryFile() writes a last-known-good
      // mirror (<filePath>.backup.json) after every successful save — recover from it BEFORE the plain
      // quarantine so the shared file is never left destroyed. Strict gate: only a NON-EMPTY array where
      // EVERY record is state-shaped (string key + number timestamp) or context-shaped (id+type+content
      // strings) qualifies; anything else falls through to the old quarantine-only path below.
      let recoveredState: StateEntry[] | null = null;
      try {
        const backupPath = `${filePath}.backup.json`;
        if (await fs.access(backupPath).then(() => true).catch(() => false)) {
          const rawBackup: unknown = JSON.parse(await fs.readFile(backupPath, 'utf-8'));
          const isRecoverableRecord = (r: unknown): boolean => {
            if (!r || typeof r !== 'object' || Array.isArray(r)) return false;
            const o = r as Record<string, unknown>;
            const stateShape = typeof o.key === 'string' && typeof o.timestamp === 'number';
            const contextShape = typeof o.id === 'string' && typeof o.type === 'string' && typeof o.content === 'string';
            return stateShape || contextShape;
          };
          if (Array.isArray(rawBackup) && rawBackup.length > 0 && rawBackup.every(isRecoverableRecord)) {
            // Step 1: quarantine the corrupt bytes FIRST — preserves evidence AND frees the primary slot.
            let quarantinedAs: string | null = null;
            try {
              const corruptPath = `${filePath}.corrupt-${Date.now()}`;
              await fs.rename(filePath, corruptPath);
              quarantinedAs = corruptPath;
            } catch (qErr: unknown) {
              // Locked file that cannot be renamed → abort recovery entirely; the plain path below handles it.
              const qMsg = qErr instanceof Error ? qErr.message : String(qErr);
              logger.error(`[StateManager.loadMemoryFile] Corrupt at ${filePath} (${reason}); quarantine rename failed — recovery aborted: ${qMsg}`);
            }
            if (quarantinedAs) {
              // Step 2: restore the last-known-good mirror into the freed slot. The primary is a msgpack
              // file, so re-encode to msgpack (the .backup.json mirror is JSON — inspection format only).
              const tempFile = `${filePath}.restore-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.tmp`;
              try {
                await fs.writeFile(tempFile, encode(rawBackup as StateEntry[]));
                await fs.rename(tempFile, filePath);
                recoveredState = rawBackup.filter((r): r is StateEntry => (r as StateEntry) && typeof (r as StateEntry).key === 'string' && typeof (r as StateEntry).timestamp === 'number');
                logger.info(`[StateManager.loadMemoryFile] ✅ RECOVERED ${recoveredState.length} state record(s) (+ context records) from last-known-good mirror; corrupt bytes preserved at ${quarantinedAs}.`);
              } catch (restoreErr: unknown) {
                const rMsg = restoreErr instanceof Error ? restoreErr.message : String(restoreErr);
                try { await fs.unlink(tempFile); } catch { /* keep fallbacks clean */ }
                logger.error(`[StateManager.loadMemoryFile] Restore of mirror FAILED (${rMsg}) — starting empty; both files preserved (corrupt + .backup.json).`);
              }
            }
          } else {
            logger.warn(`[StateManager.loadMemoryFile] Last-known-good mirror at ${backupPath} failed validation — quarantine only.`);
          }
        }
      } catch (recoverErr: unknown) {
        // Mirror missing/unparseable — NOT an error state by itself; continue with plain quarantine.
        const recMsg = recoverErr instanceof Error ? recoverErr.message : String(recoverErr);
        logger.warn(`[StateManager.loadMemoryFile] No usable last-known-good mirror (${recMsg}) — quarantining without recovery.`);
      }

      if (recoveredState === null) {
        // Plain F3 path: no recovery performed (no/invalid mirror, or recovery aborted).
        logger.error(`[StateManager.loadMemoryFile] Corrupted/unreadable memory file at ${filePath} — quarantining (NO DELETE). Reason: ${reason}`);
        try {
          await fs.rename(filePath, `${filePath}.corrupt-${Date.now()}`);
          logger.info(`[StateManager.loadMemoryFile] Quarantined as ${filePath}.corrupt-*`);
        } catch (quarantineErr: unknown) {
          // Rename can fail while the file is locked — do NOT fall back to unlink. Start empty; original preserved on disk.
          const qMsg = quarantineErr instanceof Error ? quarantineErr.message : String(quarantineErr);
          logger.error(`[StateManager.loadMemoryFile] QUARANTINE FAILED (file left in place, NO DELETE): ${qMsg}`);
        }
      }
      data = recoveredState ?? [];
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
    // 🔹 FIX B3: Preserve tier provenance (_origin) on save — previously dropped silently
    const data = Array.from(state.entries()).map(([_key, entry]) => {
      const result: { key: string; value: unknown; timestamp: number; _origin?: ContextOrigin } =
        { key: entry.key, value: entry.value, timestamp: entry.timestamp };
      if (entry._origin !== undefined) result._origin = entry._origin;
      return result;
    });

    const dir = path.dirname(filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      logger.warn(`Could not create memory directory ${dir}: ${String(err)}`);
      return;
    }

    // 🔹 D-RACE / merge-on-write retry (20.09 PM): this file is shared with ContextStorageManager.save() — both writers run
    // read-snapshot → merge-foreign → writeTemp → rename, and a snapshot taken BEFORE the other writer's rename means OUR
    // rename silently discards their new records (stale-read last-writer-wins; pinned by csmSharedFileRegression Suite D:
    // final file held both state records + zero context entries). Reordering alone cannot close the window — any gap between
    // "last disk read" and "our rename" still loses a concurrent write. Bounded merge-on-write loop instead: on EVERY attempt
    // re-snapshot, re-merge, unique-temp, rename; then VERIFY our own records survived (post-rename self-integrity check). A
    // clobber is detected by the missing/changed RAM record and healed with ONE fresh merge (the other writer's contribution
    // is now in the snapshot, so it enters preservedForeign); a lost RACE is undetectable on disk (no content signal), so we
    // rely on CSM's symmetric loop — two writers each retry once ⇒ union. Bounded (3) because production serializes tool calls;
    // after the bound we log loudly and keep last state. Mirrored in ContextStorageManager.save() (same file, same hazard).
    // 🔹 D-LOST-WRITE fix (20.09, csmSharedFileRegression Suite D): the loop above only heals "the other writer renamed
    // AFTER us" — a stale-snapshot commit where WE are the last renamer is undetectable by content (our own records pass
    // verification; the lost record belongs to the other layer and was simply never in our snapshot). Serialize the whole
    // snap→rename critical section per resolved file path so every snapshot sees all prior commits of in-process writers.
    const MAX_WRITE_ATTEMPTS = 3;
    let writeSucceeded = false;
    await withSharedFileLock(filePath, async () => {
    for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS && !writeSucceeded; attempt++) {
      // 🔹 FIX #25 (30.08): Preserve foreign (non-State) records on write-back — mirrors FIX #23 in ContextStorageManager.save().
      // Previously this function encoded ONLY its own state map, so every debounced State save wiped all context-layer
      // entries ({ id, type, title, content… }) from the shared file until a later CSM write. Proven live 30.08 ~15:30/~15:34
      // (save_session_summary and save_memory flushes each erased a tracked event within seconds). The inverse of FIX #23's
      // bug class, same shared file — both writers must now preserve the other writer's record shapes on write-back.
      // Snapshot is re-taken INSIDE the loop so attempt 2+ merges the freshest disk content (D-RACE heal).
      const preservedForeign: unknown[] = [];
      try {
        if (await fs.access(filePath).then(() => true).catch(() => false)) {
          let existing: unknown;
          try {
            existing = decode(await fs.readFile(filePath));
          } catch {
            existing = null; // corrupted → nothing preservable (same drop semantics as loadMemoryFile)
          }
          if (Array.isArray(existing)) {
            for (const r of existing) {
              const isStateShape = !!r && typeof r === 'object' && !Array.isArray(r)
                && typeof (r as { key?: unknown }).key === 'string'
                && typeof (r as { timestamp?: unknown }).timestamp === 'number';
              if (!isStateShape) preservedForeign.push(r); // context shape (or unknown legacy shape) — keep it
            }
          }
        }
      } catch { /* best-effort — a read error must never block the save */ }

      // 🔹 FIX #25: encode state + preserved foreign records so the .backup.json mirror below reflects the real file contents.
      const finalRecords = [...data, ...preservedForeign];
      const encodedData = encode(finalRecords);

      // 🔹 SPEC-C (20.09): the temp name is UNIQUE PER WRITE (per ATTEMPT here). This file is shared with
      // ContextStorageManager.save() (contextManagementTools.ts) — both writers previously used the SAME fixed
      // <file>.tmp in this same directory, so interleaved saves could corrupt each other's buffers and this
      // function's rename-failure fallback would unlink() the OTHER writer's pending temp. The per-write unique
      // name removes that cross-writer hazard at the root (20.09 incident: two .corrupt-* quarantines on record).
      const tempFile = `${filePath}.tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

      // Use atomic write pattern: write to temp file, then rename.
      // On Windows, rename may fail due to file locks/antivirus — fall back to direct write.
      try {
        await fs.writeFile(tempFile, encodedData);
        await fs.rename(tempFile, filePath);

        // 🔹 D-RACE: post-rename self-integrity check — if the shared file no longer carries ALL of our state records,
        // another writer renamed over us after our snapshot; do NOT report success (their content is already merged into
        // the next attempt's preservedForeign).
        let intact = true;
        try {
          // 🔹 TS FIX (20.09, gate-1): the .then() callback must be async — it awaits readFile inside; a plain arrow is a TS1308 violation. Chain semantics unchanged: any access/read/decode failure → .catch(() => null) → verify=null → clobber path below.
          const verify: unknown = await fs.access(filePath).then(async () => decode(await fs.readFile(filePath))).catch(() => null);
          if (!Array.isArray(verify)) {
            intact = false;
          } else {
            for (const rec of data) {
              const hit = (verify as Array<Record<string, unknown>>).find(r => !!r && typeof r === 'object' && !Array.isArray(r)
                // 🔹 LINT FIX (20.09, gate-2): r/hit are already inferred as Record<string, unknown> from the .find() element type — casts removed (no-op asserts).
                && r.key === rec.key);
              if (!hit || JSON.stringify(hit.value) !== JSON.stringify(rec.value)) { intact = false; break; }
            }
          }
        } catch { /* verify read failed — treat as intact to preserve old behavior (rename itself succeeded) */ }

        if (intact) {
          writeSucceeded = true;
          // Create JSON backup for manual inspection (best-effort)
          try {
            await fs.writeFile(filePath + '.backup.json', JSON.stringify(finalRecords), 'utf-8'); // 🔹 FIX #25: mirror the REAL file contents (state + preserved foreign)
          } catch { /* Non-critical — skip if backup fails */ }
        } else {
          logger.warn(`[StateManager.saveMemoryFile] Clobber detected after rename on ${filePath} (attempt ${attempt}/${MAX_WRITE_ATTEMPTS}) — concurrent shared-file writer landed between our snapshot and rename; re-merging from fresh disk content.`);
        }
      } catch (renameErr: unknown) {
        // 🔹 D-RACE: a rename FAILURE is not retryable here (lock/antivirus won't clear within the bounded loop;
        // the fallback semantics below are the terminal ones for this save attempt) — stop the retry loop.
        writeSucceeded = true; // loop-terminator only: success is NOT asserted — see outcome logs
        // 🔹 F3 (10.09): Non-atomic direct overwrite of an EXISTING file is the torn-write hazard that fed
        // loadMemoryFile's old destroy cycle — a partial write leaves undecodable bytes, and concurrent readers
        // may observe the truncation window. Behavior split:
        //  - target already exists → ABORT this save (RAM state intact; next debounced save retries). The complete,
        //    current file is never at risk from a non-atomic write.
        //  - target missing (first-ever save) → direct write is acceptable: no prior data can be torn or destroyed.
        const rMsg = renameErr instanceof Error ? renameErr.message : String(renameErr);
        // 🔹 SPEC-C (20.09): tempFile above is the UNIQUE per-write name — unlinking it can never touch another writer's buffer.
        try { await fs.unlink(tempFile); } catch { /* not needed — keep fallbacks clean */ }
        if (await fs.access(filePath).then(() => true).catch(() => false)) {
          logger.error(`[StateManager.saveMemoryFile] RENAME FAILED (${rMsg}) and target EXISTS — aborting save to avoid non-atomic overwrite of ${filePath}. RAM state preserved; next save will retry.`);
        } else {
          try {
            await fs.writeFile(filePath, encodedData);
            logger.warn(`[StateManager.saveMemoryFile] RENAME FAILED (${rMsg}); target was missing → direct write completed (non-atomic, first-save path).`);
          } catch (writeErr: unknown) {
            const wMsg = writeErr instanceof Error ? writeErr.message : String(writeErr);
            logger.error(`[StateManager.saveMemoryFile] RENAME FAILED (${rMsg}) AND fallback direct write FAILED for ${filePath}: ${wMsg}`);
          }
        }
      }
    }

    if (!writeSucceeded) {
      // 🔹 D-RACE: bound exhausted with clobber detected on every attempt — RAM state is intact; the next
      // debounced/forced save re-merges from disk. Logged LOUDLY (error level): a record may still be missing
      // from the shared file until that retry lands.
      logger.error(`[StateManager.saveMemoryFile] ${MAX_WRITE_ATTEMPTS} write attempts all clobbered by concurrent shared-file writers on ${filePath} — RAM state intact, next save retries; inspect .session_context for lost context records.`);
    }
    }); // end withSharedFileLock — critical section spans every attempt's snap→rename (D-LOST-WRITE)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[StateManager.saveMemoryFile] FAILED for ${filePath}: ${message}`);
  }
}

export class StateManager {
  private state: Map<string, StateEntry>;
  private maxSize: number;
  private persistenceEnabled: boolean;
  // 🔹 SPEC-C follow-up (20.09 PM): former field `pluginMemoryFile` REMOVED — it was the frozen-at-construction
  // PLUGIN_ROOT path returned by getMemoryFilePath(); see removal note at getPluginMemoryFilePath() above.
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

    // 🔹 SPEC-C (20.09, memory-store incident): default cap raised — see DEFAULT_MAX_STATE_SIZE_BYTES above.
    // PluginConfig.stateMaxSize still overrides when explicitly set by the host config.
    this.maxSize = effectiveConfig.stateMaxSize ?? DEFAULT_MAX_STATE_SIZE_BYTES;
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

    // Initialize: load ONLY its session context file. Registration happens via manage_projects(action='register') tool only (explicit user confirmation).
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
        await this.ensureReady(); // 🔹 FIX B1: Wait for initial load to settle before serializing (prevents flush-with-incomplete-state)
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

    // 🔹 SPEC-C (20.09, memory-store incident) — TWO-PHASE overflow contract:
    // 1) PLAN bounded eviction of the OLDEST EVICTABLE records (memory_* only — never session_summary_latest,
    //    id-shaped ctx_*/id_* records, or any other named key); nothing is mutated yet.
    // 2) Re-check fit on the PROJECTED size; if it still doesn't fit → throw with state untouched
    //    (the last resort stays an honest failure for tool callers — no partial write). Only when the check
    //    passes are evictions + the new value committed together. Pre-fix this ran eviction EAGERLY before
    //    the post-check, so a failing overflow had already deleted records ("poisoned store" amplification).
    const planned = this._planOldestEvictable(key, newValueSize - oldValueSize);
    // Last-resort check on the PROJECTED size (current minus everything the plan would remove), using the
    // SAME predicate as the planning loop — a throw here means no evictable record could make it fit.
    const projectedRunning = this.runningSize - planned.reduce((sum, v) => sum + this.getSizeOfValue(v.value), 0);
    if (projectedRunning + Math.max(0, newValueSize - oldValueSize) > this.maxSize) {
      throw new Error(`State size exceeds maximum (${this.maxSize} bytes) even after evicting evictable records.`);
    }

    this._commitPlannedEvictions(planned);
    if (planned.length > 0) {
      logger.warn(`[StateManager] Store near cap (${this.maxSize} bytes): evicted ${planned.length} oldest evictable record(s) to make room for '${key}'.`);
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

    // 🔹 FIX B2: Merge instead of clear+reload — preserves unflushed in-RAM entries.
    // Load disk into a temp map, then overlay onto existing RAM state (newer timestamp wins).
    const tempState = new Map<string, StateEntry>();
    await loadMemoryFile(projectMemoryFile, tempState, 0);

    for (const [key, diskEntry] of tempState.entries()) {
      const ramEntry = this.state.get(key);
      // Keep RAM entry if it's newer (unflushed write), otherwise use disk version
      if (!ramEntry || diskEntry.timestamp > ramEntry.timestamp) {
        this.state.set(key, diskEntry);
      }
    }

    // Recalculate running size after merge to keep memory tracking accurate
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

    // 🔹 SPEC-C (20.09): same two-phase overflow contract as set() — eviction is PLANNED first and
    // committed ONLY if the projected size fits; last-resort throw leaves state untouched.
    // (Tier-provenanced writes share the cap.) See _planOldestEvictable().
    const planned = this._planOldestEvictable(key, newValueSize - oldValueSize);
    // Last-resort check mirrors the planning loop predicate exactly (see set()).
    const projectedRunning = this.runningSize - planned.reduce((sum, v) => sum + this.getSizeOfValue(v.value), 0);
    if (projectedRunning + Math.max(0, newValueSize - oldValueSize) > this.maxSize) {
      throw new Error(`State size exceeds maximum (${this.maxSize} bytes) even after evicting evictable records.`);
    }

    this._commitPlannedEvictions(planned);
    if (planned.length > 0) {
      logger.warn(`[StateManager] Store near cap (${this.maxSize} bytes): evicted ${planned.length} oldest evictable record(s) to make room for '${key}'.`);
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
  /**
   * 🔹 SPEC-C (20.09, memory-store incident) — TWO-PHASE bounded eviction: PLANS the oldest evictable
   * records that must drop for an incoming write of `netDeltaBytes` to fit under maxSize. MUTATES NOTHING —
   * returns the victim list as a plan; the caller (set()/setWithTier()) commits it ONLY if the write then
   * provably fits, otherwise discards the plan and throws with state byte-for-byte untouched ("no partial
   * write" contract — verified by tests/stateManagerEviction.test.ts "last resort … THROWS"). The 20.09
   * pre-fix implementation deleted victims eagerly before its post-check, so a last-resort throw had already
   * mutated the store (silent data loss on every failed overflow).
   *
   * Eviction contract:
   * - ONLY keys starting with 'memory_' are evictable (the unique-keyed save_memory/checkpoint class —
   *   the monotonic-growth source of the poisoned-store incident).
   * - NEVER evicted: session_summary_latest, context/id-shaped records (keys like ctx_ or id_), and every other non-memory_*
   *   key (plan state, tier records, anything a specific consumer reads back by name).
   * - The incoming write's own key is excluded when it already exists (replacing in place is not "making room").
   * Oldest-by-timestamp order; ties break toward the lexicographically smaller key for determinism.
   */
  private _planOldestEvictable(excludeKey: string, netDeltaBytes: number): StateEntry[] {
    const victims: StateEntry[] = [];
    const plannedKeys = new Set<string>(); // each key is planned at most ONCE — the live state map is not
                                            // mutated during planning, so already-planned keys must be excluded
                                            // from later candidate passes (re-planning the same victim would drive
                                            // the projection unboundedly negative and mask a true last-resort throw).
    let projectedRunning = this.runningSize;
    while (projectedRunning + Math.max(0, netDeltaBytes) > this.maxSize) {
      const candidates = Array.from(this.state.values())
        .filter(e => e.key.startsWith('memory_') && e.key !== excludeKey && !plannedKeys.has(e.key));
      if (candidates.length === 0) break; // nothing evictable left — caller's post-check throws (last resort) or fits
      candidates.sort((a, b) => a.timestamp - b.timestamp || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
      const victim = candidates[0];
      plannedKeys.add(victim.key);
      projectedRunning -= this.getSizeOfValue(victim.value);
      victims.push(victim);
    }
    return victims;
  }

  /** Commit a previously planned eviction (only reached after the caller's fit-check succeeded). */
  private _commitPlannedEvictions(victims: StateEntry[]): void {
    let applied = 0;
    for (const victim of victims) {
      const current = this.state.get(victim.key);
      if (!current || current !== victim) continue; // defensive: entry changed between plan and commit — skip, never double-free size
      this.state.delete(victim.key);
      this.runningSize -= this.getSizeOfValue(current.value);
      applied++;
    }
    if (applied > 0) {
      this._keysCacheInvalidated = true; // eviction mutates the key set — cache must rebuild
    }
  }

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
    // 🔹 SPEC-C follow-up (20.09 PM): settle the constructor's async load BEFORE any save path serializes
    // RAM — forceSave()/debounced flushes that raced ahead of _ready would write a snapshot MISSING every
    // disk record, clobbering the shared file's other layer mid-interleave (the hazard pinned by
    // csmSharedFileRegression Suite D). ensureReady() is idempotent; _queueSave already awaits it too.
    await this.ensureReady();

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
    // 🔹 SPEC-C follow-up (20.09 PM): previously returned this.pluginMemoryFile — a PLUGIN_ROOT-based field frozen AT
    // CONSTRUCTION ("Legacy compat"). Every real load/save path instead re-resolves getWorkingDir() at CALL time via
    // getProjectMemoryFilePath(), so the getter reported a location no code ever writes to (under jest: <repo>/.session_context/…;
    // csmSharedFileRegression Suite B/D path-pins exposed the drift as 4 failures while unpinned consumer suites passed).
    // Now reports the same contract load/save use — computed live, I/O-free (callers that need existence validation keep using
    // getProjectMemoryFilePath()). ARCHITECTURE.md L319/358 documents exactly this resolution.
    return {
      filePath: path.join(getWorkingDir(), '.session_context', `.${this.currentProjectName}_memory.msgpack`),
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

  /**
   * REBIND-IDENTITY (CONTAMINATION-FIX Part A, 01.10): re-resolve this manager's project identity after a
   * working-directory switch that has ALREADY taken effect at the call site (`change_directory`, Step 0.7
   * `applyProjectCwdSwitch`). See RESEARCH_session-memory-contamination_2026-10-01.md §4.
   *
   * Without this, the name frozen at construction (field init / constructor) desyncs from the live CWD that
   * every I/O path resolves: after a mid-process switch A→B all writes would target
   * `<B>/.session_context/."A"_memory.msgpack` — a foreign file planted in B's folder under A's name — while
   * RAM keeps serving A's records (cross-project reads, RAM-first eviction+flush merging across projects).
   *
   * ORDER MATTERS and deliberately deviates from the research doc's pseudocode comment ("dir still resolves
   * live inside saveToFile → old file"), which was correct only if this ran BEFORE setWorkingDir(): every real
   * call site invokes us AFTER the switch, so a plain `saveToFile()` here would resolve the path against the
   * NEW directory and write A's RAM into `<B>/<.A>` — reproducing the exact artifact. The old-project flush
   * therefore uses an EXPLICIT path built from (previousWorkingDir, frozen name):
   * 1) cancel any pending debounced flush (it would later fire with the NEW name over OLD RAM),
   * 2) write A's RAM to `<A>/.session_context/."A"_memory.msgpack` + update the legacy index for A,
   * 3) rebind `currentProjectName` / `projectContextDir` to the new project (live resolution now agrees),
   * 4) forceLoad() so RAM serves ONLY the new project's records.
   *
   * Non-fatal by contract: a failure must not break change_directory / CWD-switch UX — it is logged and the
   * identity stays UNREBOUND (the next switch retries; worst case = pre-fix behavior, never data loss). No-op
   * when persistence is disabled or the resolved name did not change.
   * @param previousWorkingDir Absolute path of the working directory in effect BEFORE this switch — needed
   * because live resolution already points at the new directory by the time we run (see above).
   */
  async refreshProject(previousWorkingDir: string): Promise<void> {
    if (!this.persistenceEnabled) return;

    const oldName = this.currentProjectName; // frozen identity: construction-time CWD basename or config override
    const newName = resolveProjectName();    // live resolution against the CURRENT (post-switch) working dir
    if (newName === oldName) return;         // same project — nothing to rebind

    await this.ensureReady();                // settle constructor load before any flush/load below

    // 1) Cancel a pending debounced flush: we take over persistence for both sides from here on. A timer left
    //    running would fire with the NEW name while RAM still holds OLD records → cross-project clobber.
    if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = null; }

    // 2) Flush the old project's RAM state into its OWN file — explicit path, see doc comment above.
    const oldDir = previousWorkingDir || getWorkingDir();
    let flushedOld = false;
    try {
      await fs.mkdir(path.join(oldDir, '.session_context'), { recursive: true });
      const oldFile = path.join(oldDir, '.session_context', `.${oldName}_memory.msgpack`);
      logger.info(`[StateManager.refreshProject] Flushing '${oldName}' state to ${oldFile} before rebind`);
      await saveMemoryFile(oldFile, this.state);
      await updateSessionIndex(oldName); // legacy bookkeeping for the project whose state just landed
      flushedOld = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`[StateManager.refreshProject] FAILED to flush '${oldName}' to previous dir (${oldDir}): ${msg}`);
    }

    // 3) Rebind identity. RAM is untouched — it still holds the old project's records, which are on disk in A's
    //    own file when flushedOld; from step 4 on they can no longer leak into B (guard + clean RAM).
    this.currentProjectName = newName;
    try {
      this.projectContextDir = path.join(getWorkingDir(), '.session_context');
      await fs.mkdir(this.projectContextDir, { recursive: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`[StateManager.refreshProject] Could not create session context dir for '${newName}': ${msg}`);
    }

    // 4) Load the new project's store into RAM (clears the old records; empty state when B has no file yet).
    await this.forceLoad();

    logger.info(`[StateManager.refreshProject] Identity rebind complete: '${oldName}' → '${newName}' (old flush ${flushedOld ? 'OK' : 'FAILED — see error above'})`);
  }
}
