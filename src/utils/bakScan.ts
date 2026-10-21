/**
 * Shared recursive .bak scanner for the backup-lifecycle tools (cleanup_backups, list_available_bak_backups).
 *
 * RC (21.10): both scan sites used a single-level fs.readdir(workingDir) — nested edit backups
 * (e.g. src/config.ts.bak) were invisible to listing AND deletion, so confirm=true sweeps silently
 * missed every backup below the working-dir root (observed live: src/config.ts.bak survived a full sweep).
 * This walker is recursive with bounded exclusions:
 * - node_modules / .git are never descended into (perf + never sweep third-party or VCS state)
 * - plugin-internal state dirs (.session_context, .ai_toolbox_backups) are excluded — session-memory
 *   stores and project-level zip archives are NOT edit backups and must survive a cleanup sweep
 * - symlinks are never followed (only real directories are descended → no cycles)
 */

import * as fs from 'fs/promises';
import path from 'path';

/** Directories the walker must never descend into (lowercase comparison). */
const EXCLUDED_DIRS: ReadonlySet<string> = new Set([
  'node_modules',
  '.git',
  // Plugin-internal state — session memory, plan store, project-level zip backups. Never edit backups.
  '.session_context',
  '.ai_toolbox_backups',
]);

export interface BakFileEntry {
  /** Backup path relative to the scan root (platform separators), INCLUDING the .bak suffix */
  relPath: string;
  /** Original file path with the .bak suffix stripped, relative to the scan root */
  originalRelPath: string;
  sizeBytes: number;
  modifiedAtIso: string;
}

/**
 * Recursively find every *.bak file under rootDir.
 * Unreadable directories are skipped (non-fatal); per-file stat failures skip that entry only —
 * same lenient contract as the legacy single-level scans they replace.
 * Results sorted by relative path for deterministic output across readdir orderings.
 */
export async function findBakFiles(rootDir: string): Promise<BakFileEntry[]> {
  const found: BakFileEntry[] = [];

  const walk = async (dir: string, relPrefix: string): Promise<void> => {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return; // unreadable dir — skip non-fatally
    }

    for (const entry of entries) {
      const relPath = relPrefix === '' ? entry.name : path.join(relPrefix, entry.name);

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name.toLowerCase())) continue; // never descend into excluded dirs
        await walk(path.join(dir, entry.name), relPath);
        continue;
      }

      // Symlinks / special files report isFile() === false → not followed and never treated as backups.
      if (!entry.isFile()) continue;
      if (!entry.name.toLowerCase().endsWith('.bak')) continue;

      try {
        const stat = await fs.stat(path.join(dir, entry.name));
        found.push({
          relPath,
          originalRelPath: relPath.slice(0, -4), // strip ".bak"
          sizeBytes: stat.size,
          modifiedAtIso: stat.mtime.toISOString(),
        });
      } catch {
        // Skip inaccessible files (non-fatal) — legacy behavior preserved
      }
    }
  };

  await walk(rootDir, '');
  found.sort((a, b) => a.relPath.localeCompare(b.relPath));
  return found;
}
