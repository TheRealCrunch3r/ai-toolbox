/**
 * Backup Tools Module
 * Provides manual backup/restore functionality for plugin state files.
 */

import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import unzipper from 'unzipper';
import type { PluginConfig } from '../config';

// Backup directory location
const BACKUP_DIR = path.join(process.cwd(), '.ai_toolbox_backups');

// Files to backup by default
const DEFAULT_BACKUP_FILES = [
  '.ai_toolbox_state.json',      // State persistence
  '.ai_toolbox_context.json',    // Context memory entries
];

/**
 * Create a compressed ZIP archive of specified files.
 */
async function createZipArchive(
  sourceFiles: { filePath: string; archiveName: string }[],
  destinationPath: string,
): Promise<{ success: boolean; size?: number; error?: string }> {
  return new Promise((resolve) => {
    const output = fs.createWriteStream(destinationPath);
    const archive = archiver('zip', { zlib: { level: 9 } }); // Maximum compression

    let totalSize = 0;
    let hasError = false;

    // Listen for errors
    archive.on('error', (err: Error) => {
      hasError = true;
      resolve({ success: false, error: `Archive creation failed: ${err.message}` });
    });

    output.on('error', (err: Error) => {
      hasError = true;
      resolve({ success: false, error: `Write failed: ${err.message}` });
    });

    // Track completion
    output.on('close', () => {
      if (!hasError) {
        const stats = fs.statSync(destinationPath);
        resolve({ success: true, size: stats.size });
      }
    });

    // Pipe archive to output file
    archive.pipe(output);

    // Add files to archive
    for (const { filePath, archiveName } of sourceFiles) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          archive.file(filePath, { name: archiveName });
          totalSize += stat.size;
        }
      } catch (err) {
        console.warn(`[Backup] File not found or inaccessible: ${filePath}`);
      }
    }

    // Add metadata file
    const metadata = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      pluginVersion: '1.4.0',
      filesCount: sourceFiles.length,
      totalUncompressedSize: totalSize,
    };
    archive.append(JSON.stringify(metadata, null, 2), { name: 'backup-metadata.json' });

    // Finalize archive
    archive.finalize();
  });
}

/**
 * Extract files from a ZIP archive with path traversal protection.
 */
async function extractZipArchive(
  sourcePath: string,
  destinationDir: string,
): Promise<{ success: boolean; extractedFiles?: string[]; error?: string }> {
  try {
    const extractedFiles: string[] = [];
    const resolvedDestDir = path.resolve(destinationDir);

    // Use unzipper library for reliable extraction with streaming
    await fs.createReadStream(sourcePath)
      .pipe(unzipper.Parse())
      .on('entry', (entry: any) => {
        // SECURITY: Validate entry path to prevent directory traversal attacks
        const entryPath = entry.path || entry.fileName;
        
        // Skip directories
        if (entry.type === 'Directory') {
          entry.autodrain();
          return;
        }

        // Resolve the full target path
        const targetPath = path.resolve(resolvedDestDir, entryPath);
        
        // SECURITY: Ensure resolved path is within destination directory
        if (!targetPath.startsWith(resolvedDestDir + path.sep) && targetPath !== resolvedDestDir) {
          console.warn(`[Backup] Blocked path traversal attempt: ${entryPath}`);
          entry.autodrain();
          return;
        }

        // Ensure parent directory exists
        const parentDir = path.dirname(targetPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }

        // Extract file to destination
        entry.pipe(fs.createWriteStream(targetPath));
        
        entry.on('end', () => {
          extractedFiles.push(entryPath);
        });
      })
      .promise();

    return { success: true, extractedFiles };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Extraction failed: ${message}` };
  }
}

/**
 * Register backup-related tools.
 */
export function registerBackupTools(config: PluginConfig): any[] {
  const tools = [];

  // ======================================================================
  // Tool 1: create_backup
  // ======================================================================
  
  tools.push(tool({
    name: 'create_backup',
    description: `Create a compressed backup of plugin state files.

BACKED UP FILES:
- .ai_toolbox_state.json (persistent tool execution state)
- .ai_toolbox_context.json (context memory entries from auto-summarize_context)

STORAGE LOCATION:
Backups are stored in .ai_toolbox_backups/ directory with timestamped filenames.

EXAMPLE USAGE:
{"destination": "my-custom-backup.zip"}
→ Creates: .ai_toolbox_backups/my-custom-backup.zip`,
    parameters: {
      destination: z.string()
        .max(256)
        .describe('Custom backup filename (default: auto-generated with timestamp). Must end with .zip')
        .optional(),
      includeState: z.boolean()
        .default(true)
        .describe('Include state persistence file (.ai_toolbox_state.json)'),
      includeContext: z.boolean()
        .default(true)
        .describe('Include context memory file (.ai_toolbox_context.json)'),
    },
    implementation: async ({ destination, includeState, includeContext }) => {
      try {
        // 1. Validate parameters
        if (!includeState && !includeContext) {
          return {
            success: false,
            error: 'At least one file type must be selected for backup (includeState or includeContext)',
          };
        }

        // 2. Generate filename if not provided
        const timestamp = new Date().toISOString()
          .replace(/T/, '-')
          .replace(/:/g, '-')
          .replace(/\..*/, '');
        const backupName = destination || `backup-${timestamp}.zip`;

        // Validate filename
        if (!backupName.endsWith('.zip')) {
          return {
            success: false,
            error: 'Backup filename must end with .zip',
          };
        }

        // 3. Ensure backups directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
          fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const backupPath = path.join(BACKUP_DIR, backupName);

        // 4. Collect files to backup
        const filesToBackup: { filePath: string; archiveName: string }[] = [];

        if (includeState) {
          const stateFile = path.join(process.cwd(), '.ai_toolbox_state.json');
          if (fs.existsSync(stateFile)) {
            filesToBackup.push({ filePath: stateFile, archiveName: '.ai_toolbox_state.json' });
          }
        }

        if (includeContext) {
          const contextFile = path.join(process.cwd(), '.ai_toolbox_context.json');
          if (fs.existsSync(contextFile)) {
            filesToBackup.push({ filePath: contextFile, archiveName: '.ai_toolbox_context.json' });
          }
        }

        // 5. Check if any files found
        if (filesToBackup.length === 0) {
          return {
            success: false,
            error: 'No state files found to backup. The plugin may not have been used yet.',
            hint: 'Use the plugin first to generate state files, then create a backup.',
          };
        }

        // 6. Create ZIP archive
        const result = await createZipArchive(filesToBackup, backupPath);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        // 7. Return success with details
        return {
          success: true,
          message: `Backup created successfully`,
          backupPath: backupPath,
          filename: backupName,
          filesBackedUp: filesToBackup.map(f => f.archiveName),
          compressedSizeBytes: result.size,
          compressedSizeHuman: `${(result.size! / 1024).toFixed(2)} KB`,
          createdAt: new Date().toISOString(),
        };

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
  // Tool 2: list_backups
  // ======================================================================

  tools.push(tool({
    name: 'list_backups',
    description: `List all available backup files in the backups directory.

RETURNS:
- Array of backup objects with filename, path, size, and creation date
- Sorted by creation date (newest first)

EXAMPLE OUTPUT:
{
  "success": true,
  "backups": [
    {
      "filename": "backup-2026-05-30T19-45-00.zip",
      "path": ".ai_toolbox_backups/backup-2026-05-30T19-45-00.zip",
      "sizeBytes": 1234,
      "createdAt": "2026-05-30T19:45:00.000Z"
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
    implementation: async ({ sortBy, limit }) => {
      try {
        // Check if backup directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
          return {
            success: true,
            backups: [],
            message: 'No backups directory found. Create a backup first using create_backup.',
          };
        }

        // Read all .zip files
        const files = fs.readdirSync(BACKUP_DIR)
          .filter(f => f.toLowerCase().endsWith('.zip'))
          .map(filename => {
            const filePath = path.join(BACKUP_DIR, filename);
            const stats = fs.statSync(filePath);
            return {
              filename,
              path: filePath,
              sizeBytes: stats.size,
              createdAt: stats.mtime.toISOString(),
            };
          });

        // Sort results
        if (sortBy === 'date') {
          files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'size') {
          files.sort((a, b) => b.sizeBytes - a.sizeBytes);
        }

        // Apply limit
        const limitedFiles = files.slice(0, limit);

        return {
          success: true,
          backups: limitedFiles,
          totalCount: files.length,
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
  // Tool 3: restore_backup
  // ======================================================================

  tools.push(tool({
    name: 'restore_backup',
    description: `Restore state files from a backup archive.

⚠️ WARNING: This will OVERWRITE current state files!

RESTORED FILES:
- .ai_toolbox_state.json (if present in backup)
- .ai_toolbox_context.json (if present in backup)

SAFETY FEATURES:
- Requires explicit confirmation (confirm=true parameter)
- Creates temporary extraction directory
- Validates archive before restoration
- Reports which files were restored

EXAMPLE USAGE:
{
  "backupFile": "backup-2026-05-30T19-45-00.zip",
  "confirm": true
}
→ Restores state files from specified backup`,
    parameters: {
      backupFile: z.string()
        .max(256)
        .describe('Backup filename to restore (e.g., "backup-2026-05-30T19-45-00.zip")'),
      confirm: z.boolean()
        .default(false)
        .describe('⚠️ MUST be true to confirm restoration. This is a safety check against accidental data loss.'),
    },
    implementation: async ({ backupFile, confirm }) => {
      try {
        // 1. Safety check
        if (!confirm) {
          return {
            success: false,
            error: '⚠️ SAFETY CHECK FAILED',
            message: 'Restoration not performed. Set confirm=true to proceed.',
            hint: 'This is intentional to prevent accidental data loss. Example: {"backupFile": "...", "confirm": true}',
          };
        }

        // 2. Validate backup file exists
        const backupPath = path.join(BACKUP_DIR, backupFile);
        if (!fs.existsSync(backupPath)) {
          return {
            success: false,
            error: `Backup file not found: ${backupFile}`,
            hint: 'Use list_backups to see available backups.',
          };
        }

        // 3. Create temporary extraction directory
        const tempDir = path.join(BACKUP_DIR, `.temp_restore_${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        try {
          // 4. Extract archive to temp directory
          const extractResult = await extractZipArchive(backupPath, tempDir);

          if (!extractResult.success) {
            return { success: false, error: extractResult.error };
          }

          // 5. Identify files to restore (only state files)
          const restorableFiles = [
            '.ai_toolbox_state.json',
            '.ai_toolbox_context.json',
          ];

          const restoredFiles: string[] = [];
          const missingFiles: string[] = [];

          for (const fileName of restorableFiles) {
            const sourcePath = path.join(tempDir, fileName);
            if (fs.existsSync(sourcePath)) {
              // Get current working directory
              const destPath = path.join(process.cwd(), fileName);
              
              // Read and write to destination
              const content = fs.readFileSync(sourcePath);
              fs.writeFileSync(destPath, content);
              restoredFiles.push(fileName);
            } else {
              missingFiles.push(fileName);
            }
          }

          // 6. Return success
          return {
            success: true,
            message: `Restored ${restoredFiles.length} file(s) from backup`,
            backupFile,
            restoredFiles,
            extractedFilesCount: extractResult.extractedFiles?.length || 0,
            timestamp: new Date().toISOString(),
          };

        } finally {
          // 7. Cleanup temp directory
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (cleanupErr) {
            console.warn(`[Backup] Warning: Could not cleanup temp dir ${tempDir}`);
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
  // Tool 4: delete_backup (bonus tool)
  // ======================================================================

  tools.push(tool({
    name: 'delete_backup',
    description: `Delete a backup file from the backups directory.

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
        .describe('Backup filename to delete (e.g., "old-backup.zip")'),
      confirm: z.boolean()
        .default(false)
        .describe('⚠️ MUST be true to confirm deletion. This is a safety check.'),
    },
    implementation: async ({ backupFile, confirm }) => {
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

        // 3. Construct path and validate exists
        const backupPath = path.join(BACKUP_DIR, backupFile);
        if (!fs.existsSync(backupPath)) {
          return {
            success: false,
            error: `Backup file not found: ${backupFile}`,
          };
        }

        // 4. Delete the file
        fs.unlinkSync(backupPath);

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
