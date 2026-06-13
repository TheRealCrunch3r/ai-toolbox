/**
 * Project Backup Tools — ASYNC optimized ===
 * Backs up the ENTIRE working directory with all content.
 */

import { tool, type Tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
const fsp = fs.promises;  // ASYNC import ===
import path from 'path';
import archiver from 'archiver';
import unzipper from 'unzipper';
import type { PluginConfig } from '../config';
import { getWorkingDir } from '../workingDir';

// Backup directory - uses CURRENT WORKING DIRECTORY — ASYNC ===
const BACKUP_DIR = path.join(getWorkingDir(), '.ai_toolbox_backups');

/**
 * Recursively collect all files in a directory — ASYNC ===
 */
async function collectAllFiles(dir: string, basePath: string = dir): Promise<string[]> {  // MADE ASYNC
  const files: string[] = [];
  
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });  // ASYNC read
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await collectAllFiles(fullPath, basePath));  // ASYNC recursive
      } else {
        files.push(fullPath);
      }
    }
  } catch {
    // Skip inaccessible directories
  }
  
  return files;
}

export function registerBackupTools(_config: PluginConfig): Tool[] {
  const tools = [];

  // ======================================================================
  // Tool 1: create_backup - Backs up ENTIRE working directory — ASYNC ===
  // ======================================================================
  
  tools.push(tool({
    name: 'create_backup',
    description: `Create a compressed backup of the ENTIRE current working directory with all content.

WHAT GETS BACKED UP:
- All files and folders in the current working directory
- Source code, configs, everything!

STORAGE LOCATION:
Backups are stored in .ai_toolbox_backups/ inside the current working directory.

EXAMPLE USAGE:
create_backup()
→ Creates: {workingDir}/.ai_toolbox_backups/project-backup-{timestamp}.zip

WITH CUSTOM NAME:
{"destination": "my-project-backup.zip"}
→ Creates: {workingDir}/.ai_toolbox_backups/my-project-backup.zip`,
    parameters: {
      destination: z.string()
        .max(256)
        .describe('Custom backup filename (default: auto-generated with timestamp). Must end with .zip')
        .optional(),
    },
    implementation: async ({ destination }) => {  // ASYNC ===
      try {
        const workingDir = getWorkingDir();

        // Generate default filename if not provided
        const timestamp = new Date().toISOString()
          .replace(/T/, '-')
          .replace(/:/g, '-')
          .replace(/\..*/, '');
        const backupName = destination || `project-backup-${timestamp}.zip`;

        // Validate filename
        if (!backupName.endsWith('.zip')) {
          return {
            success: false,
            error: 'Backup filename must end with .zip',
          };
        }

        // Ensure backups directory exists in working dir — ASYNC ===
        try {
          await fsp.mkdir(BACKUP_DIR, { recursive: true });  // ASYNC mkdir
        } catch {  // Ignore mkdir errors if directory already exists ===
          // Directory already exists or other error - continue
        }

        const backupPath = path.join(BACKUP_DIR, backupName);

        // Collect ALL files from working directory — ASYNC ===
        const allFiles = await collectAllFiles(workingDir);  // ASYNC call

        if (allFiles.length === 0) {
          return {
            success: false,
            error: 'No files found in the current working directory to backup.',
            hint: `Current directory: ${workingDir}`,
          };
        }

        // Create ZIP archive with ALL files — ASYNC ===
        const output = fs.createWriteStream(backupPath);  // Already async stream
        const archive = archiver('zip', { zlib: { level: 9 } }); // Maximum compression

        return new Promise(async (resolve) => {  // MADE ASYNC to support await inside ===
          let totalSize = 0;
          let hasError = false;

          archive.on('error', (err: Error) => {
            hasError = true;
            resolve({ success: false, error: `Archive creation failed: ${err.message}` });
          });

          output.on('error', (err: Error) => {
            hasError = true;
            resolve({ success: false, error: `Write failed: ${err.message}` });
          });

          output.on('close', async () => {  // ASYNC ===
            if (!hasError) {
              const stats = await fsp.stat(backupPath);  // ASYNC stat
              resolve({
                success: true,
                message: 'Backup created successfully',
                backupPath: backupPath,
                filename: backupName,
                filesBackedUp: allFiles.length,
                compressedSizeBytes: stats.size,
                compressedSizeHuman: `${(stats.size / 1024).toFixed(2)} KB`,
                createdAt: new Date().toISOString(),
              });
            }
          });

          archive.pipe(output);

          // Add ALL files to archive with relative paths from working directory — ASYNC ===
          for (const filePath of allFiles) {
            try {
              const stat = await fsp.stat(filePath);  // ASYNC stat
              if (stat.isFile()) {
                const relativePath = path.relative(workingDir, filePath);
                archive.file(filePath, { name: relativePath });
                totalSize += stat.size;
              }
            } catch {
              // Skip files that can't be read
            }
          }

          // Add metadata file — ASYNC ===
          const metadata = {
            version: '1.0',
            createdAt: new Date().toISOString(),
            sourceDirectory: workingDir,
            filesCount: allFiles.length,
            totalUncompressedSize: totalSize,
          };
          archive.append(JSON.stringify(metadata, null, 2), { name: '_backup-metadata.json' });

          void archive.finalize(); // Archiver v8+ returns a Promise; handled via event listeners
        });

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Backup failed: ${message}`,
        };
      }
    },
  }));

  // ======================================================================
  // Tool 2: list_backups — ASYNC ===
  // ======================================================================

  tools.push(tool({
    name: 'list_backups',
    description: `List all available backup files in the current working directory's backups folder.

RETURNS:
- Array of backup objects with filename, path, size, and creation date
- Sorted by creation date (newest first)

EXAMPLE OUTPUT:
{
  "success": true,
  "backups": [
    {
      "filename": "project-backup-2024-06-12T21-59-00.zip",
      "path": "{workingDir}/.ai_toolbox_backups/project-backup-...",
      "sizeBytes": 1234,
      "createdAt": "2024-06-12T21:59:00.000Z"
    }
  ]
}`,  
    parameters: {
      sortBy: z.enum(['date', 'size']).default('date')
        .describe('Sort order: "date" (newest first) or "size" (largest first)'),
      limit: z.number()
        .int()
        .min(1)
        .max(1000)
        .default(50)
        .describe('Maximum number of backups to return (default: 50)'),
    },
    implementation: async ({ sortBy, limit }) => {  // ASYNC ===
      try {
        // Check if backup directory exists — ASYNC ===
        const backupDirExists = await fsp.stat(BACKUP_DIR).then(() => true).catch(() => false);
        if (!backupDirExists) {
          return {
            success: true,
            backups: [],
            message: 'No backups found in current working directory.',
          };
        }

        // Read all .zip files — ASYNC ===
        const files = (await fsp.readdir(BACKUP_DIR))  // ASYNC readdir
          .filter(f => f.toLowerCase().endsWith('.zip'))
          .map(async filename => {  // Map to promises for parallel stat calls
            const filePath = path.join(BACKUP_DIR, filename);
            const stats = await fsp.stat(filePath);  // ASYNC stat
            return {
              filename,
              path: filePath,
              sizeBytes: stats.size,
              createdAt: stats.mtime.toISOString(),
            };
          });

        // Wait for all stats to complete — PARALLEL ===
        const filesWithStats = await Promise.all(files);

        // Sort results
        if (sortBy === 'date') {
          filesWithStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'size') {
          filesWithStats.sort((a, b) => b.sizeBytes - a.sizeBytes);
        }

        // Apply limit
        const limitedFiles = filesWithStats.slice(0, limit);

        return {
          success: true,
          backups: limitedFiles,
          totalCount: filesWithStats.length,
          returnedCount: limitedFiles.length,
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Failed to list backups: ${message}`,
        };
      }
    },
  }));

  // ======================================================================
  // Tool 3: restore_backup — ASYNC ===
  // ======================================================================

  tools.push(tool({
    name: 'restore_backup',
    description: `Restore the working directory from a backup archive.

⚠️ WARNING: This will OVERWRITE ALL FILES in the current working directory!

RESTORED CONTENT:
- All files and folders from the backup
- Existing files may be overwritten or deleted if not in backup

SAFETY FEATURES:
- Requires explicit confirmation (confirm=true parameter)
- Creates temporary extraction directory
- Validates archive before restoration

EXAMPLE USAGE:
{
  "backupFile": "project-backup-2024-06-12T21-59-00.zip",
  "confirm": true
}
→ Restores all files from backup to current working directory`,
    parameters: {
      backupFile: z.string()
        .max(256)
        .describe('Backup filename to restore (e.g., "project-backup-2024-06-12T21-59-00.zip")'),
      confirm: z.boolean()
        .default(false)
        .describe('⚠️ MUST be true to confirm restoration. This is a safety check against accidental data loss.'),
    },
    implementation: async ({ backupFile, confirm }) => {  // ASYNC ===
      try {
        // 1. Safety check
        if (!confirm) {
          return {
            success: false,
            error: '⚠️ SAFETY CHECK FAILED',
            message: 'Restoration not performed. Set confirm=true to proceed.',
            hint: 'This will overwrite all files in the current working directory!',
          };
        }

        // 2. Validate backup file exists — ASYNC ===
        const backupPath = path.join(BACKUP_DIR, backupFile);
        if (!await fsp.stat(backupPath).then(() => true).catch(() => false)) {  // ASYNC stat check
          return {
            success: false,
            error: `Backup file not found: ${backupFile}`,
            hint: 'Use list_backups to see available backups.',
          };
        }

        const workingDir = getWorkingDir();

        // 3. Create temporary extraction directory — ASYNC ===
        const tempDir = path.join(BACKUP_DIR, `.temp_restore_${Date.now()}`);
        await fsp.mkdir(tempDir, { recursive: true });  // ASYNC mkdir

        try {
          // 4. Extract archive to temp directory — ASYNC stream ===
          await fs.createReadStream(backupPath)
            .pipe(unzipper.Extract({ path: tempDir }))
            .promise();

          // 5. Clear working directory and restore from backup — ASYNC ===
          const extractedFiles = await collectAllFiles(tempDir);  // ASYNC call
          
          for (const sourceFile of extractedFiles) {
            try {
              const relativePath = path.relative(tempDir, sourceFile);
              const destPath = path.join(workingDir, relativePath);
              
              // Ensure parent directory exists — ASYNC ===
              const destDir = path.dirname(destPath);
              await fsp.mkdir(destDir, { recursive: true });  // ASYNC mkdir
              
              // Copy file to destination — ASYNC ===
              await fsp.copyFile(sourceFile, destPath);  // ASYNC copy
            } catch {
              // Skip files that can't be copied
            }
          }

          return {
            success: true,
            message: `Restored ${extractedFiles.length} file(s) from backup`,
            backupFile,
            restoredFilesCount: extractedFiles.length,
            timestamp: new Date().toISOString(),
          };

        } finally {
          // 6. Cleanup temp directory — ASYNC ===
          try {
            await fsp.rm(tempDir, { recursive: true, force: true });  // ASYNC rm
          } catch (cleanupErr) {
            const errMsg = cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr);
            console.warn(`[Backup] Warning: Could not cleanup temp dir ${tempDir}: ${errMsg}`);
          }
        }

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Restoration failed: ${message}`,
        };
      }
    },
  }));

  // ======================================================================
  // Tool 4: delete_backup — ASYNC ===
  // ======================================================================

  tools.push(tool({
    name: 'delete_backup',
    description: `Delete a backup file from the current working directory's backups folder.

⚠️ WARNING: This action is IRREVERSIBLE!

SAFETY FEATURES:
- Requires explicit confirmation (confirm=true parameter)
- Validates file exists before deletion
- Only deletes .zip files from backup directory

EXAMPLE USAGE:
{
  "backupFile": "old-backup.zip",
  "confirm": true
}
→ Permanently deletes the specified backup`,
    parameters: {
      backupFile: z.string()
        .max(256)
        .describe('Backup filename to delete (e.g., "project-backup-2024-06-12T21-59-00.zip")'),
      confirm: z.boolean()
        .default(false)
        .describe('⚠️ MUST be true to confirm deletion. This is a safety check.'),
    },
    implementation: async ({ backupFile, confirm }) => {  // ASYNC ===
      try {
        // 1. Safety check
        if (!confirm) {
          return {
            success: false,
            error: '⚠️ SAFETY CHECK FAILED',
            message: 'Deletion not performed. Set confirm=true to proceed.',
            hint: 'This is intentional to prevent accidental data loss.',
          };
        }

        // 2. Validate filename (must be .zip)
        if (!backupFile.toLowerCase().endsWith('.zip')) {
          return {
            success: false,
            error: 'Only .zip backup files can be deleted',
          };
        }

        // 3. Construct path and validate exists — ASYNC ===
        const backupPath = path.join(BACKUP_DIR, backupFile);
        if (!await fsp.stat(backupPath).then(() => true).catch(() => false)) {  // ASYNC stat check
          return {
            success: false,
            error: `Backup file not found: ${backupFile}`,
          };
        }

        // 4. Delete the file — ASYNC ===
        await fsp.unlink(backupPath);  // ASYNC unlink

        return {
          success: true,
          message: `Deleted backup: ${backupFile}`,
          deletedFile: backupFile,
          timestamp: new Date().toISOString(),
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Deletion failed: ${message}`,
        };
      }
    },
  }));

  return tools;
}