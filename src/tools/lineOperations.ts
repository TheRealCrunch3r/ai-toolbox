/**
 * Line Operations Tool - Delete lines from files safely (Async + Atomic)
 * 
 * Converted from synchronous to async operations to prevent event loop blocking.
 * Uses shared atomicWrite utility for crash-resilient writes.
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import * as fs from 'fs/promises';  // ← Async import
import { z } from 'zod';
import type { PluginConfig } from '../config.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';
import { validatePath } from '../security.js';
import { recordFileModification } from './fileModTracker.js';
import { atomicWriteFile } from '../utils/atomicWrite.js';  // ← New import

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
        verify_before_delete: z.string().max(500).optional().describe(
          'Content expected at target lines before deletion. Mismatch blocks operation and shows actual context.'
        ),
      },
      implementation: async ({
        file_name,
        start_line,
        end_line,
        verify_before_delete,
      }: {
        readonly file_name: string;
        readonly start_line: number;
        readonly end_line?: number;
        readonly verify_before_delete?: string;
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

          // Check file exists — ASYNC
          try {
            await fs.stat(fullPath);
          } catch {
            return { success: false, error: `File not found: ${fullPath}` };
          }

          // Read file content — ASYNC (prevents event loop blocking)
          const content = await fs.readFile(fullPath, 'utf-8');
          
          // ========== FIX: Detect original line ending style ==========
          const hasCRLF_dl = content.includes('\r\n');
          const lines = hasCRLF_dl ? content.split('\r\n') : content.split('\n');

          // ========== DRIFT DETECTION: Verify content before deletion ==========
          if (verify_before_delete) {
            const expectedLines = verify_before_delete.split('\n');
            let matchFound = false;
            
            for (let i = 0; i <= lines.length - expectedLines.length; i++) {
              const candidate = lines.slice(i, i + expectedLines.length);
              
              if (candidate.every((line, idx) => line.trim() === expectedLines[idx].trim())) {
                matchFound = true;
                // Adjust start_line to actual found position (0-indexed → 1-indexed)
                start_line = i + 1;
                break;
              }
            }
            
            if (!matchFound) {
              const contextStart = Math.max(0, start_line - 4);
              const contextEnd = Math.min(lines.length, start_line + 3);
              const actualContext = lines.slice(contextStart, contextEnd).map((l, idx) => `Line ${contextStart + idx + 1}: ${l}`).join('\n');
              
              return {
                success: false, 
                error: 'Drift detected: content at target line does not match expected.',
                data: {
                  actualInsertionLine: start_line,
                  expectedContent: verify_before_delete,
                  actualContext,
                  guidance: 'File has been modified since you calculated these line numbers. Re-read the file and retry with updated positions.'
                }
              };
            }
          }

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

          // Write back using shared atomic utility — crash-resilient + ASYNC
          try {
            await atomicWriteFile(fullPath, hasCRLF_dl ? lines.join('\r\n') : lines.join('\n'));
          } catch (writeErr) {
            return { success: false, error: `Failed to write file: ${(writeErr as Error).message}` };
          }

          // Track consecutive modifications for drift warning
          const modTracking = recordFileModification(fullPath, 'delete_lines');

          const responseData: {
            success: boolean;
            data: {
              deletedLines: number;
              deletedToLine: number;
              actualLine?: number;  // Actual line where deletion occurred (if drift detected)
              linesDeleted: number;
              remainingLines: number;
              filePath: string;
              guidance?: string;
            };
          } = {
            success: true,
            data: {
              deletedLines: start_line,
              deletedToLine: effectiveEndLine,
              actualLine: verify_before_delete ? start_line : undefined,
              linesDeleted: deletedCount,
              remainingLines: lines.length,
              filePath: fullPath,
            },
          };

          if (modTracking.guidance) {
            responseData.data.guidance = modTracking.guidance;
          }

          return responseData;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { success: false, error: `Failed to delete lines: ${message}` };
        }
      },
    }),
  ];
}
