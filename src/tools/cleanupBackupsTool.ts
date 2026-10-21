/**
 * cleanup_backups tool — Lists and optionally deletes .bak files created by edit operations.
 * Backups persist until explicitly deleted so the LLM can verify edits before cleaning up.
 */

import { tool, type Tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs/promises';
import path from 'path';
import { getWorkingDir } from '../workingDir';
import { findBakFiles } from '../utils/bakScan';
import type { PluginConfig } from '../config.js';

export function registerCleanupBackupsTool(_config: PluginConfig): Tool[] {
  return [tool({
    name: 'cleanup_backups',
    description: `List and optionally delete .bak backup files created by edit operations.

BEHAVIOR:
- Without confirm=true: Recursively lists all .bak files under the working directory (shows what would be deleted)
- With confirm=true: Deletes every listed .bak file, including nested ones (e.g. src/tools/x.ts.bak)

SCAN SCOPE:
- Recursive from the working directory through all subdirectories
- Never descends into node_modules, .git, or plugin state dirs (.session_context, .ai_toolbox_backups)

SAFETY:
- confirm=false (default): DRY-RUN mode — lists backups for inspection only
- confirm=true: ACTUAL deletion of all .bak backup files

USE THIS TOOL AFTER verifying that all edits made by other tools were correct.`,
    parameters: {
      confirm: z.boolean()
        .optional()
        .describe('⚠️ Set to true to actually delete .bak files. Default false = dry-run (list only).'),
    },
    implementation: async ({ confirm }) => {
      try {
        const workingDir = getWorkingDir();

        // List all .bak files under the working directory (RECURSIVE — 21.10 fix for missed nested backups)
        let bakFiles: Array<{ path: string; size: number; modifiedAt: string }>;

        try {
          await fs.stat(workingDir);
          const entries = await findBakFiles(workingDir); // recursive; excludes node_modules/.git/plugin-state dirs
          bakFiles = entries.map(e => ({
            path: path.join(workingDir, e.relPath),
            size: e.sizeBytes,
            modifiedAt: e.modifiedAtIso,
          }));
        } catch {
          bakFiles = [];
        }

        // DRY-RUN mode: list backups for inspection
        if (!confirm) {
          return {
            success: true,
            action: 'list',
            message: bakFiles.length > 0
              ? `Found ${bakFiles.length} .bak backup file(s). Set confirm=true to delete them.`
              : 'No .bak backup files found.',
            backups: bakFiles.map(f => ({
              path: f.path,
              sizeBytes: f.size,
              sizeHuman: `${(f.size / 1024).toFixed(2)} KB`,
              modifiedAt: f.modifiedAt,
            })),
            totalCount: bakFiles.length,
            hint: 'Review the list above. If edits were correct, call cleanup_backups({ confirm: true }) to delete.',
          };
        }

        // CONFIRMED mode: delete all .bak files
        let deletedCount = 0;
        const errors: string[] = [];

        for (const file of bakFiles) {
          try {
            await fs.unlink(file.path);
            deletedCount++;
          } catch (e: unknown) {
            errors.push(`${file.path}: ${(e as Error).message}`);
          }
        }

        return {
          success: true,
          action: 'delete',
          message: `Deleted ${deletedCount} .bak backup file(s).`,
          deletedFiles: bakFiles.slice(0, deletedCount).map(f => f.path),
          errors: errors.length > 0 ? errors : undefined,
          totalCount: deletedCount,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `cleanup_backups failed: ${message}` };
      }
    },
  })];
}
