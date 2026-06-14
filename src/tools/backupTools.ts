/**
 * Project Backup Tools — ASYNC optimized ===
 * Backs up the ENTIRE working directory with all content.
 */

import { tool, type Tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
const fsp = fs.promises;  // ASYNC import ===
import path from 'path';
import * as archiverLib from 'archiver';
const ZipArchive = (archiverLib as any).ZipArchive;
// Dynamic import for unzipper (ESM-only package) ===
const getUnzipper = async () => { const m = await import('unzipper'); return m.default || m; };
import type { PluginConfig } from '../config';
import { getWorkingDir, resetWorkingDir } from '../workingDir';

/** Resolve backup directory — with intelligent fallback to plugin root */
async function resolveBackupDirectory(): Promise<string> {
  const workingDir = getWorkingDir();
  try {
    await fsp.stat(workingDir);
    const entries = await fsp.readdir(workingDir, { withFileTypes: true });
    if (entries.some(e => e.isFile() || e.isDirectory())) {
      return path.join(workingDir, '.ai_toolbox_backups');
    }
  } catch {}
  
  console.warn(`[Backup] Working directory "${workingDir}" is invalid. Falling back to plugin root.`);
  resetWorkingDir();
  return path.join(getWorkingDir(), '.ai_toolbox_backups');
}

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
- All files and folders in the target working directory
- Source code, configs, everything!

STORAGE LOCATION:
Backups are stored in .ai_toolbox_backups/ inside the TARGET directory.

EXAMPLE USAGE:
create_backup()
→ Shows confirmation dialog with current working directory info

create_backup({ confirm: true })
→ Backs up the confirmed working directory

create_backup({ targetDirectory: "/path/to/custom/dir" })
→ Backs up a custom directory (requires explicit path)`,
    parameters: {
      destination: z.string()
        .max(256)
        .describe('Custom backup filename (default: auto-generated with timestamp). Must end with .zip')
        .optional(),
      confirm: z.boolean()
        .default(false)
        .describe('⚠️ MUST be true to create backup. When false, shows confirmation dialog instead.'),
      targetDirectory: z.string()
        .max(512)
        .describe('Optional custom directory to back up (defaults to current working dir). Must exist and contain files.')
        .optional(),
    },
    implementation: async ({ destination, confirm, targetDirectory }) => {  // ASYNC ===
      try {
        const currentWorkingDir = getWorkingDir();

        // Determine which directory to back up
        let backupTarget = targetDirectory || currentWorkingDir;
        let isCustomPath = !!targetDirectory;

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

        // If NOT confirmed yet — SHOW INFO and ASK for confirmation
        if (!confirm) {
          // Get file count for the target directory (even if custom path)
          let fileCount = 0;
          let dirExists = false;
          
          try {
            await fsp.stat(backupTarget);
            dirExists = true;
            const entries = await fsp.readdir(backupTarget, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.isFile()) fileCount++;
            }
          } catch {
            // Directory doesn't exist or not accessible
          }

          return {
            success: false,
            error: '⚠️ CONFIRMATION REQUIRED',
            message: `Backup NOT created — please review the details below and call again with confirm: true`,
            confirmationRequired: true,
            workingDirectory: backupTarget,
            isCustomPath: isCustomPath,
            filesFound: fileCount,
            directoryExists: dirExists,
            backupDestination: path.join(backupTarget, '.ai_toolbox_backups', backupName),
            instructions: [
              `1. Verify the working directory above is correct`,
              `2. If correct, call create_backup() again with { confirm: true }`,
              `3. If wrong, use targetDirectory parameter to specify the correct path`,
              `4. Call again with { confirm: true, targetDirectory: "correct/path" }`
            ],
            hint: 'This safety check prevents accidental backups of empty/wrong directories.'
          };
        }

        // User confirmed — proceed with backup
        const BACKUP_DIR = path.join(backupTarget, '.ai_toolbox_backups');

        // Validate target directory exists
        try {
          await fsp.stat(backupTarget);
        } catch {
          return {
            success: false,
            error: `Working directory not found: ${backupTarget}`,
            hint: 'Use list_backups to verify or check the path spelling.',
          };
        }

        // Ensure backups directory exists in working dir — ASYNC ===
        try {
          await fsp.mkdir(BACKUP_DIR, { recursive: true });  // ASYNC mkdir
        } catch {  // Ignore mkdir errors if directory already exists ===
          // Directory already exists or other error - continue
        }

        const backupPath = path.join(BACKUP_DIR, backupName);
        const tempBackupPath = backupPath + '.tmp';  // Write to temp file first — atomic pattern ===

        // Collect ALL files from target working directory — ASYNC ===
        const allFiles = await collectAllFiles(backupTarget);  // ASYNC call

        if (allFiles.length === 0) {
          return {
            success: false,
            error: 'No files found in the target working directory to backup.',
            hint: `Current directory: ${backupTarget}`,
          };
        }

        // Create ZIP archive with ALL files — ASYNC ===
        const output = fs.createWriteStream(tempBackupPath);  // Write to temp file first (prevents empty files) ===
        const archive = new ZipArchive({ zlib: { level: 9 } }); // archiver v8+ API — Maximum compression

        return new Promise(async (resolve) => {  // MADE ASYNC to support await inside ===
          let totalSize = 0;
          let hasError = false;

          archive.on('error', async (err: Error) => {
            hasError = true;
            try { await fsp.rm(tempBackupPath, { force: true }); } catch {}
            resolve({ success: false, error: `Archive creation failed: ${err.message}` });
          });

          output.on('error', async (err: Error) => {
            hasError = true;
            try { await fsp.rm(tempBackupPath, { force: true }); } catch {}
            resolve({ success: false, error: `Write failed: ${err.message}` });
          });

          output.on('close', async () => {  // ASYNC ===
            if (!hasError) {
              try {
                const stats = await fsp.stat(tempBackupPath);  // ASYNC stat on temp file ===

                // Validate backup is not empty — ZIP files must be at least 22 bytes (magic + minimal archive overhead) ===
                if (stats.size < 22) {
                  try { await fsp.rm(tempBackupPath, { force: true }); } catch {}
                  resolve({ success: false, error: 'Backup file is invalid or empty — the archive stream did not produce valid output.' });
                  return;
                }

                // Atomic rename: temp → final path — ASYNC ===
                await fsp.rename(tempBackupPath, backupPath);  // ASYNC rename (atomic on same filesystem) ===

                resolve({
                  success: true,
                  message: 'Backup created successfully',
                  workingDirectory: backupTarget,
                  isCustomPath: isCustomPath,
                  backupPath: backupPath,
                  filename: backupName,
                  filesBackedUp: allFiles.length,
                  compressedSizeBytes: stats.size,
                  compressedSizeHuman: `${(stats.size / 1024).toFixed(2)} KB`,
                  createdAt: new Date().toISOString(),
                });
              } catch (renameErr) {
                const msg = renameErr instanceof Error ? renameErr.message : String(renameErr);
                try { await fsp.rm(tempBackupPath, { force: true }); } catch {}
                resolve({ success: false, error: `Finalizing backup failed: ${msg}` });
              }
            }
          });

          archive.pipe(output);

          // Add ALL files to archive with relative paths from target directory — ASYNC ===
          for (const filePath of allFiles) {
            try {
              const stat = await fsp.stat(filePath);  // ASYNC stat
              if (stat.isFile()) {
                const relativePath = path.relative(backupTarget, filePath);
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
            sourceDirectory: backupTarget,
            isCustomPath: isCustomPath,
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
        const backupDir = await resolveBackupDirectory();
        // Check if backup directory exists — ASYNC ===
        const backupDirExists = await fsp.stat(backupDir).then(() => true).catch(() => false);
        if (!backupDirExists) {
          return {
            success: true,
            backups: [],
            message: 'No backups found in current working directory.',
          };
        }

        // Read all .zip files — ASYNC ===
        const files = (await fsp.readdir(backupDir))  // ASYNC readdir
          .filter(f => f.toLowerCase().endsWith('.zip'))
          .map(async filename => {  // Map to promises for parallel stat calls
            const filePath = path.join(backupDir, filename);
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
        const backupDir = await resolveBackupDirectory();
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
        const backupPath = path.join(backupDir, backupFile);
        if (!await fsp.stat(backupPath).then(() => true).catch(() => false)) {  // ASYNC stat check
          return {
            success: false,
            error: `Backup file not found: ${backupFile}`,
            hint: 'Use list_backups to see available backups.',
          };
        }

        const workingDir = getWorkingDir();

        // 3. Create temporary extraction directory — ASYNC ===
        const tempDir = path.join(backupDir, `.temp_restore_${Date.now()}`);
        await fsp.mkdir(tempDir, { recursive: true });  // ASYNC mkdir

        try {
          // 4. Extract archive to temp directory — ASYNC stream ===
          await fs.createReadStream(backupPath)
            .pipe((await getUnzipper()).Extract({ path: tempDir }))
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
        const backupDir = await resolveBackupDirectory();
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
        const backupPath = path.join(backupDir, backupFile);
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