/**
 * Restore from .bak Backup Tool
 * 
 * Provides an explicit, LLM-accessible way to restore files from their .bak backups.
 * When file-modifying tools (replace_text_in_file, insert_at_line, etc.) create
 * a backup, the .bak file sits next to the source. This tool lets the LLM discover
 * and restore from those backups when corruption or errors occur.
 */

import { tool, type Tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs/promises';
import type { PluginConfig } from '../config.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';
import { findBakFiles } from '../utils/bakScan';

/**
 * Scan the working directory RECURSIVELY for all .bak backup files.
 * Returns structured data about available backups (paths relative to the working dir).
 */
async function scanBakFiles(): Promise<Array<{ file: string; backupFile: string; sizeBytes: number }>> {
  const workingDir = getWorkingDir();
  let entries;

  try {
    await fs.stat(workingDir); // missing working dir → same [] contract as before
    // Recursive walker (21.10 fix): finds nested backups like src/tools/x.ts.bak that the old
    // single-level readdir missed. Excludes node_modules/.git/plugin-state dirs; never follows symlinks.
    entries = await findBakFiles(workingDir);
  } catch {
    return [];
  }

  return entries.map(e => ({
    file: e.originalRelPath,   // relative to working dir — root-level files keep the legacy bare-filename form
    backupFile: e.relPath,     // disambiguates same-basename backups in different subdirs
    sizeBytes: e.sizeBytes,
  }));
}

export function registerRestoreFromBakTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // =====================================================================
  // Tool 1: restore_from_bak — Restore a file from its .bak backup
  // =====================================================================

  tools.push(tool({
    name: 'restore_from_bak',
    description: `Restore a file from its .bak backup created by file-modifying tools (replace_text_in_file, insert_at_line, append_file, delete_lines_in_file).

BEHAVIOR:
- Finds the {file_name}.bak file next to the target file
- Copies the .bak content back to the original file
- Deletes the .bak file after successful restoration
- Returns success/failure with details

USE WHEN:
- A recent edit corrupted a file and you need to revert it
- You want to undo the last modification to a specific file
- The LLM created a .bak backup but subsequent edits went wrong

EXAMPLE USAGE:
restore_from_bak({ file_name: "src/tools/fileSystemTools.ts" })
→ Restores src/tools/fileSystemTools.ts from its .bak backup

RESTRICTIONS:
- Only restores files that have an existing .bak backup in the same directory
- If no .bak exists, returns a clear error message
- Does NOT affect project-level backups (.zip in .ai_toolbox_backups/)`,
    parameters: {
      file_name: z.string()
        .describe('The original filename to restore (without .bak extension). E.g., "src/tools/fileSystemTools.ts"'),
    },
    implementation: async ({ file_name }: { file_name: string }) => {
      try {
        // Validate path safety
        if (!file_name || file_name.length === 0) {
          return {
            success: false,
            error: 'Parameter validation failed: file_name is required and must be non-empty',
          };
        }

        const fullPath = resolvePath(file_name);
        const bakPath = fullPath + '.bak';

        // Check if .bak backup exists
        let bakExists: boolean;
        try {
          await fs.access(bakPath);
          bakExists = true;
        } catch {
          bakExists = false;
        }

        if (!bakExists) {
          return {
            success: false,
            error: `No .bak backup found for '${file_name}'`,
            hint: 'Available .bak files in working directory:',
            availableBackups: await scanBakFiles(),
          };
        }

        // Check if original file exists (it may have been deleted)
        let origExists: boolean;
        try {
          await fs.access(fullPath);
          origExists = true;
        } catch {
          origExists = false;
        }

        const wasNewFile = !origExists; // Track if file was newly created vs restored over existing

        // Read backup content
        const bakContent = await fs.readFile(bakPath, 'utf-8');

        // Write original file from backup
        await fs.writeFile(fullPath, bakContent, 'utf-8');

        // Delete the .bak file (restoration is complete)
        try {
          await fs.unlink(bakPath);
        } catch {
          // Non-critical — .bak deletion failure doesn't block success
          console.warn(`[restore_from_bak] Failed to delete backup ${bakPath}`);
        }

        return {
          success: true,
          message: wasNewFile
            ? `Successfully created '${file_name}' from its .bak backup (original file did not exist)`
            : `Successfully restored '${file_name}' from its .bak backup`,
          restoredFile: fullPath,
          originalSizeBytes: bakContent.length,
          wasNewFile,
          timestamp: new Date().toISOString(),
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Failed to restore from .bak for '${file_name}': ${message}`,
        };
      }
    },
  }));

  // =====================================================================
  // Tool 2: list_available_bak_backups — Scan and report all available .bak files
  // =====================================================================

  tools.push(tool({
    name: 'list_available_bak_backups',
    description: `Recursively scan under the current working directory for all .bak backup files created by file-modifying tools.

USE WHEN:
- You need to know what backups are available before restoring
- A file is corrupted and you want to see if a .bak exists
- You're troubleshooting which edits have backups available

SCAN SCOPE:
- Recursive through subdirectories (e.g. src/tools/x.ts.bak)
- Never descends into node_modules, .git, or plugin state dirs (.session_context, .ai_toolbox_backups)

RETURNS:
- Array of { file, backupFile, sizeBytes } for each .bak found; paths are relative to the working directory
- Empty array if no .bak files exist under the working directory

EXAMPLE OUTPUT:
{
  "success": true,
  "backups": [
    {"file": "src/tools/fileSystemTools.ts", "backupFile": "src/tools/fileSystemTools.ts.bak", "sizeBytes": 45678}
  ]
}`,
    parameters: {},
    implementation: async () => {
      try {
        const backups = await scanBakFiles();

        return {
          success: true,
          message: `Found ${backups.length} .bak backup file(s)`,
          backups,
          totalCount: backups.length,
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Failed to scan for .bak files: ${message}`,
        };
      }
    },
  }));

  return tools;
}
