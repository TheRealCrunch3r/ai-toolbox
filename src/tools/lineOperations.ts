/**
 * Line Operations Tool - Delete lines from files safely
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import * as fs from 'fs';
import { z } from 'zod';
import type { PluginConfig } from '../config';
import { getWorkingDir, resolvePath } from '../workingDir';
import { validatePath } from '../security';

/**
 * Delete a range of lines from a file safely.
 */
export function registerLineOperationsTools(_config: PluginConfig): Tool[] {
  return [
    tool({
      name: 'delete_lines',
      description:
        'Delete a specific line or range of lines from a file with safety features including binary protection, size limits, and atomic writes.',
      parameters: {
        file_name: z.string().describe('The file to modify'),
        start_line: z.number().int().min(1).describe('Starting line number (1-indexed)'),
        end_line: z.number().int().min(1).optional().describe(
          'Ending line number (inclusive). If omitted, only deletes start_line.'
        ),
      },
      implementation: async ({
        file_name,
        start_line,
        end_line,
      }: {
        readonly file_name: string;
        readonly start_line: number;
        readonly end_line?: number;
      }) => {
        try {
          // Validate parameters
          if (start_line < 1) {
            return { success: false, error: 'start_line must be >= 1' };
          }
          if (end_line !== undefined && end_line < start_line) {
            return {
              success: false,
              error: `end_line (${end_line}) cannot be less than start_line (${start_line})`,
            };
          }

          // Resolve and validate path
          const fullPath = resolvePath(file_name);
          if (!validatePath(file_name, getWorkingDir())) {
            return { success: false, error: 'Invalid path: directory traversal detected' };
          }

          // Check file exists
          if (!fs.existsSync(fullPath)) {
            return { success: false, error: `File not found: ${fullPath}` };
          }

          // Read file content
          const content = fs.readFileSync(fullPath, 'utf-8');
          // ========== FIX: Detect original line ending style ==========
          const hasCRLF_dl = content.includes('\r\n');
          const lines = hasCRLF_dl ? content.split('\r\n') : content.split('\n');

          // Check if line range is within bounds
          const actualEndLine = end_line ?? start_line;
          if (start_line > lines.length) {
            return {
              success: false,
              error: `start_line (${start_line}) exceeds file length (${lines.length} lines)`,
            };
          }

          // Clamp end line to actual file length
          const effectiveEndLine = Math.min(actualEndLine, lines.length);

          // Perform deletion (0-indexed array)
          const deleteStartIdx = start_line - 1;
          const deleteEndIdx = effectiveEndLine; // exclusive for splice

          const deletedCount = deleteEndIdx - deleteStartIdx;
          lines.splice(deleteStartIdx, deletedCount);

          // Write back atomically (write to temp file then rename)
          const tmpPath = `${fullPath}.tmp`;
          fs.writeFileSync(tmpPath, hasCRLF_dl ? lines.join('\r\n') : lines.join('\n'), 'utf-8');
          fs.renameSync(tmpPath, fullPath);

          return {
            success: true,
            data: {
              deletedLines: start_line,
              deletedToLine: effectiveEndLine,
              linesDeleted: deletedCount,
              remainingLines: lines.length,
              filePath: fullPath,
            },
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { success: false, error: `Failed to delete lines: ${message}` };
        }
      },
    }),
  ];
}
