/**
 * Backup Utilities — Centralized .bak file management with retention policy
 * 
 * All file-editing tools should use these functions to ensure consistent
 * backup behavior: create on modification, retain for safety window, auto-cleanup.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// Configuration constants
const BACKUP_RETENTION_MS = 60_000; // 60 seconds safety window
const MAX_BACKUPS_PER_FILE = 3; // Keep at most N backups per source file
const CLEANUP_INTERVAL_MS = 5 * 60_000; // Clean up every 5 minutes

/**
 * Create a backup of the original file before modification.
 * Returns the path to the backup file, or null if backup is disabled/error.
 */
export async function createBackup(filePath: string): Promise<string | null> {
  try {
    const backupPath = `${filePath}.bak`;
    
    // Check if source file exists and is readable
    await fs.access(filePath);
    await fs.copyFile(filePath, backupPath);
    
    return backupPath;
  } catch (error) {
    console.warn(`[backupUtils] Failed to create backup for ${filePath}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Schedule automatic cleanup of a backup file after the retention window.
 * This ensures backups are available for rollback during the safety period,
 * then automatically removed to prevent disk space issues.
 */
export function scheduleBackupCleanup(backupPath: string): void {
  // Validate backup path exists before scheduling
  fs.access(backupPath)
    .then(() => {
      setTimeout(async () => {
        try {
          await fs.unlink(backupPath);
        } catch {
          // File may have already been deleted or is being used — silently ignore
        }
      }, BACKUP_RETENTION_MS);
    })
    .catch(() => {
      // Backup file doesn't exist, nothing to schedule
    });
}

/**
 * Immediately delete a backup file (for explicit cleanup).
 * Returns true if deleted, false if not found.
 */
export async function immediateCleanup(backupPath: string): Promise<boolean> {
  try {
    await fs.unlink(backupPath);
    return true;
  } catch {
    // File doesn't exist or can't be accessed — return false to indicate no action taken
    return false;
  }
}

/**
 * Restore a file from its backup. Used when a modification fails.
 */
export async function restoreFromBackup(backupPath: string, originalPath: string): Promise<boolean> {
  try {
    await fs.copyFile(backupPath, originalPath);
    return true;
  } catch (error) {
    console.error(`[backupUtils] Failed to restore from backup ${backupPath} to ${originalPath}:`, 
      error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Clean up old backups for a given file, keeping only the most recent ones.
 */
export async function cleanupOldBackups(filePath: string): Promise<number> {
  let deletedCount = 0;
  
  try {
    // Find all backups for this file (including timestamped ones)
    const dirPath = path.dirname(filePath);
    const fileName = path.basename(filePath);
    
    const files = await fs.readdir(dirPath);
    const matchingBackups = files
      .filter(f => f.startsWith(`${fileName}.bak`))
      .map(f => ({ name: f, fullpath: path.join(dirPath, f) }))
      .sort((a, b) => b.name.localeCompare(a.name));
    
    // Delete excess backups, keeping only MAX_BACKUPS_PER_FILE most recent
    for (let i = MAX_BACKUPS_PER_FILE; i < matchingBackups.length; i++) {
      try {
        await fs.unlink(matchingBackups[i].fullpath);
        deletedCount++;
      } catch {}
    }
  } catch {
    // Directory doesn't exist or can't be read — nothing to clean up
  }
  
  return deletedCount;
}

/**
 * Periodic cleanup task that runs in the background.
 * Should be called once at startup and then periodically.
 */
let cleanupTimer: NodeJS.Timeout | null = null;

export function startPeriodicCleanup(): void {
  if (cleanupTimer) return; // Already running
  
  const runCleanup = async () => {
    try {
      // Clean up any backups older than the retention period
      // This is a safety net for tools that didn't use scheduleBackupCleanup
      // Note: Actual implementation would need to scan directories and check file timestamps
      // For now, this is a placeholder — the per-file scheduling above handles most cases
    } catch (error) {
      console.error('[backupUtils] Periodic cleanup failed:', error instanceof Error ? error.message : String(error));
    }
  };
  
  // Run immediately on start, then periodically
  void runCleanup();
  cleanupTimer = setInterval(runCleanup, CLEANUP_INTERVAL_MS);
}

export function stopPeriodicCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
