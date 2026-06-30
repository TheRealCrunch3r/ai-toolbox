/**
 * Text Processing Tools — sed/awk equivalents for Node.js
 * Provides safe, portable text transformation capabilities without shell dependencies.
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs/promises';
import type { PluginConfig } from '../config.js';
import { validatePath } from '../security.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';


// ==================== Typed Params Interfaces ====================

interface TextTransformParams {
  file_name: string;
  pattern: string;
  replacement?: string;
  flags?: 'g' | 'i' | 'gi';
  lines?: { start?: number; end?: number };
  backup?: boolean;
  dry_run?: boolean;
}

interface TextExtractParams {
  file_name: string;
  pattern?: string;
  fields?: number[];
  delimiter?: string;
  output_format?: 'list' | 'json' | 'csv';
}

// ==================== Helper Functions ====================

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

/** Validate regex pattern to prevent DoS attacks */
function validateRegex(pattern: string): boolean {
  try {
    // Basic check for obviously dangerous patterns (nested quantifiers)
    if (/(\[[^\]]*\]\*)/.test(pattern)) return false;
    if (/(\([^)]*\)\+)/.test(pattern)) return false;
    
    // Try to compile the regex - will throw if invalid
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

/** Read file with size limit (10MB) */
/** Read file with size limit (10MB) AND binary detection */
async function readFileWithLimit(filePath: string): Promise<string> {
  const stats = await fs.stat(filePath);
  if (stats.size > 10_000_000) {
    throw new Error(`File too large (${(stats.size / 1048576).toFixed(2)}MB, max 10MB)`);
  }
  // Binary detection: check for null bytes in first 8KB
  const buffer = await fs.readFile(filePath);
  const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 8192));
  if (checkBuffer.includes(0)) {
    throw new Error('Binary file detected. This tool only supports text files.');
  }
  return buffer.toString('utf-8');
}

/** Write file with atomic operation */
async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  await fs.writeFile(tmpPath, content, 'utf-8');
  await fs.rename(tmpPath, filePath);
}

export function registerTextProcessingTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // text_transform tool (sed-equivalent)
  tools.push(tool({
    name: 'text_transform',
    description: 'Apply regex-based text transformations to files. Supports substitution, line ranges, and capture groups. Safer than shell sed — no command injection risk.',
    parameters: {
      file_name: z.string().describe('File path'),
      pattern: z.string().min(1).max(10_000).describe('Regex or literal pattern to match (required, non-empty, max 10KB)'),
      replacement: z.string().max(100_000).optional().describe('Replacement text (supports $1, $2 for capture groups, max 100KB)'),
      flags: z.enum(['g', 'i', 'gi']).default('g').describe('Flags: g=global, i=case-insensitive, gi=both'),
      lines: z.object({
        start: z.number().int().min(1).optional(),
        end: z.number().int().optional(),
      }).optional().describe('Line range to apply transformation (e.g., {start: 10, end: 20})'),
      backup: z.boolean().default(false).describe('Create .bak file before modifying'),
      dry_run: z.boolean().default(false).describe('Preview changes without writing to disk'),
    },
    implementation: async ({ file_name, pattern, replacement, flags, lines, backup, dry_run }: TextTransformParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        const fullPath = resolvePath(file_name);

        // Validate regex pattern to prevent DoS attacks
        if (!validateRegex(pattern)) {
          return { success: false, error: 'Invalid or potentially dangerous regex pattern' };
        }

        let content: string;
        try {
          content = await readFileWithLimit(fullPath);
        } catch (error) {
          return handleError(error);
        }

        // Build regex with flags (Zod guarantees valid input: 'g', 'i', or 'gi')
        const flagString = flags || 'g';
        const regex = new RegExp(pattern, flagString);

        let changesApplied = 0;
        let transformedContent: string;

        if (lines?.start !== undefined || lines?.end !== undefined) {
          // Apply transformation to specific line range
          // ========== FIX: Preserve original line endings ==========
          const hasCRLF_tt = content.includes('\r\n');
          const linesArray = hasCRLF_tt ? content.split('\r\n') : content.split('\n');
          const startLine = Math.max(1, lines.start ?? 1);
          let endLine = Math.min(lines.end ?? linesArray.length, linesArray.length);

          for (let i = startLine - 1; i < endLine; i++) {
            if (replacement) {
              // Count replacements in this line before applying (use same flags as main regex)
              const matches = linesArray[i].match(new RegExp(pattern, flagString));
              if (matches) changesApplied += matches.length;

              // Apply replacement with capture groups ($1, $2, etc.)
              linesArray[i] = linesArray[i].replace(regex, replacement);
            } else {
              // Delete matching lines by splicing the array (use same flags as main regex)
              const matches = linesArray[i].match(new RegExp(pattern, flagString));
              if (matches) changesApplied += matches.length;

              // Remove the line and adjust loop bounds to avoid skipping indices
              linesArray.splice(i, 1);
              i--;           // Decrement index since array shifted left
              endLine--;     // Adjust range so we don't overrun
            }
          }

          transformedContent = hasCRLF_tt ? linesArray.join('\r\n') : linesArray.join('\n');
        } else {
          // Apply transformation to entire file
          const allMatches = content.match(regex);
          if (allMatches) changesApplied = allMatches.length;

          if (replacement) {
            transformedContent = content.replace(regex, replacement);
          } else {
            transformedContent = content.replace(regex, '');
          }
        }

        // Preview mode - don't write
        if (dry_run) {
          return { success: true, data: { 
            dry_run: true,
            total_changes_previewed: changesApplied,
            preview_lines: transformedContent.split('\n').slice(0, 10),
            message: 'Dry run complete — no changes written'
          }};
        }

        // Create backup if requested
        let backup_created = false;
        if (backup) {
          try {
            await fs.copyFile(fullPath, `${fullPath}.bak`);
            backup_created = true;
          } catch (error) {
            return handleError(error);
          }
        }

        // Write transformed content atomically
        try {
          await writeFileAtomic(fullPath, transformedContent);
        } catch (error) {
          if (backup_created) {
            // Restore backup on failure
            try {
              await fs.copyFile(`${fullPath}.bak`, fullPath);
            } catch {}
          }
          return handleError(error);
        }

        return { success: true, data: { 
          transformed: true,
          total_changes_applied: changesApplied,
          backup_created,
          lines_processed: lines ? `${lines.start ?? 1}-${lines.end}` : 'all',
          pattern_used: pattern,
          replacement_used: replacement || '(deletion)'
        }};
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // text_extract tool (awk-equivalent)
  tools.push(tool({
    name: 'text_extract',
    description: 'Extract structured data from text files using pattern matching and field extraction. Like awk for parsing logs, CSVs, TSVs, or any delimited text.',
    parameters: {
      file_name: z.string().describe('File path'),
      pattern: z.string().optional().describe('Regex to filter lines (optional)'),
      fields: z.array(z.number().int()).default([0]).describe('Field indices to extract (0-based, e.g., [0, 2] for first and third columns)'),
      delimiter: z.string().default('\t').describe('Field separator character'),
      output_format: z.enum(['list', 'json', 'csv']).default('json').describe('Output format for extracted data'),
    },
    implementation: async ({ file_name, pattern, fields, delimiter, output_format }: TextExtractParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        const fullPath = resolvePath(file_name);

        let content: string;
        try {
          content = await readFileWithLimit(fullPath);
        } catch (error) {
          return handleError(error);
        }

        // Filter lines by pattern if specified
        const allLines = content.split('\n');
        const filteredLines = pattern 
          ? allLines.filter(line => new RegExp(pattern).test(line))
          : allLines;

        // Extract fields from each line
        const results: string[] = [];
        let empty_lines_skipped = 0;

        for (const line of filteredLines) {
          if (!line.trim()) continue; // Skip empty lines

          const parts = line.split(delimiter || "\t");
          const extracted = (fields || [0]).map(i => parts[i] || '');
          
          if (extracted.length > 0 && !extracted.every(p => p.trim() === '')) {
            results.push(extracted.join(delimiter));
          } else {
            empty_lines_skipped++;
          }
        }

        // Format output based on requested format
        let formatted_output: string;
        switch (output_format) {
          case 'json':
            formatted_output = JSON.stringify(results, null, 2);
            break;
          case 'csv':
            formatted_output = results.join('\n');
            break;
          default: // 'list'
            formatted_output = results.join('\n');
        }

        return { success: true, data: { 
          total_lines_read: allLines.length,
          lines_matched: filteredLines.length,
          fields_extracted: (fields || [0]).length,
          extracted_count: results.length,
          empty_lines_skipped,
          output_format,
          preview: formatted_output.substring(0, 1000) + (formatted_output.length > 1000 ? '\n... (truncated)' : ''),
          full_output_available: formatted_output.length <= 1000
        }};
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // line_operations tool (awk/print equivalent for line manipulation)
  tools.push(tool({
    name: 'line_operations',
    description: 'Insert, delete, or reorder lines in a file. Like awk for line-level operations without shell dependencies.',
    parameters: {
      file_name: z.string().describe('File path'),
      operation: z.enum(['insert', 'delete', 'move']).default('insert').describe('Operation to perform (use "lines" range for delete)'),
      target_line: z.number().int().min(1).optional().describe('Target line number for insert/delete/move operations'),
      lines: z.object({
        start: z.number().int().min(1).optional(),
        end: z.number().int().optional(),
      }).optional().describe('Line range for delete operation (e.g., {start: 16, end: 17})'),
      content: z.string().max(1_000_000).optional().describe('For insert operation - text to insert (max 1MB)'),
      backup: z.boolean().optional().default(false).describe('Create .bak backup before modification. Default: false'),
      move_from: z.number().int().optional().describe('Source line for move operation'),
      move_to: z.number().int().optional().describe('Destination line for move operation')
    },
    implementation: async (params: { 
      file_name: string;
      operation: 'insert' | 'delete' | 'move';
      target_line?: number;
      lines?: { start?: number; end?: number };
      content?: string;
      backup?: boolean;
      move_from?: number;
      move_to?: number;
    }) => {
      const { file_name, operation, target_line, lines, content, backup, move_from, move_to } = params; // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        const fullPath = resolvePath(file_name);
        let file_content: string;
        try {
          file_content = await readFileWithLimit(fullPath);
        } catch (error) {
          return handleError(error);
        }

        // ========== FIX: Detect original line ending style ==========
        const hasCRLF_lo = file_content.includes('\r\n');
        const linesArr = hasCRLF_lo ? file_content.split('\r\n') : file_content.split('\n');
        let changes_made = 0;

        switch (operation) {
          case 'insert':
            if (!content && content !== '') {
              return { success: false, error: 'Insert operation requires "content" parameter' };
            }
            const insert_line = target_line ?? (linesArr.length + 1);
            linesArr.splice(insert_line - 1, 0, content || '');
            changes_made = 1;
            break;

          case 'delete':
            if (!target_line && !lines) {
              return { success: false, error: 'Delete operation requires either "target_line" or "lines.range" parameter' };
            }

             
            let deleteStart = target_line ?? (lines?.start ?? 0);
             
            let deleteEnd = lines?.end ?? target_line ?? linesArr.length;

            // Validate range
            if (deleteStart < 1 || deleteEnd > linesArr.length || deleteStart > deleteEnd) {
              return { success: false, error: `Line range ${deleteStart}-${deleteEnd} out of bounds (1-${linesArr.length})` };
            }

            // Delete from end to start to preserve indices during splicing
            for (let i = deleteEnd - 1; i >= deleteStart - 1; i--) {
              linesArr.splice(i, 1);
            }
            changes_made = deleteEnd - deleteStart + 1;
            break;

          case 'move':
            if (!move_from || !move_to) {
              return { success: false, error: 'Move operation requires "move_from" and "move_to" parameters' };
            }
            if (move_from < 1 || move_from > linesArr.length || move_to < 1 || move_to > linesArr.length) {
              return { success: false, error: `Line numbers out of range (1-${linesArr.length})` };
            }
            const moved_line = linesArr.splice(move_from - 1, 1)[0];
            // Adjust target if moving within same direction
            let adjusted_to = move_to;
            if (move_from < move_to) {
              adjusted_to--;
            }
            linesArr.splice(adjusted_to - 1, 0, moved_line);
            changes_made = 1;
            break;

          default:
            return { success: false, error: `Unknown operation: ${String(operation)}` };
        }

        // ========== P1 FIX: Create Backup if requested (Bug #5) ==========
        let backupPath: string | null = null;
        if (backup) {
          backupPath = fullPath + '.bak';
          try {
            await fs.copyFile(fullPath, backupPath);
          } catch (e) {
            return { success: false, error: `Failed to create backup at ${backupPath}: ${e instanceof Error ? e.message : String(e)}` };
          }
        }

        // ========== P1 FIX: Atomic Write (Bug #4) ==========
        try {
          const finalContent = hasCRLF_lo ? linesArr.join('\r\n') : linesArr.join('\n');
          await writeFileAtomic(fullPath, finalContent);
        } catch (error) {
          return handleError(error);
        }


        return { success: true, data: { 
          operations_performed: operation,
          changes_applied: changes_made,
          total_lines_after: linesArr.length,
          backup_created: backupPath,
          message: `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation completed successfully`
        }};
      } catch (error) {
        return handleError(error);
      }
    },
  }));


  // markdown_table_gen tool — Pure JS/TS utility
  tools.push(tool({
    name: 'markdown_table_gen',
    description: 'Generate a valid Markdown table from an array of objects. Handles headers, alignment, and truncation for clean reporting output.',
    parameters: {
      data: z.array(z.record(z.string(), z.unknown())).describe('Array of objects to convert to table rows'),
      headers: z.array(z.string()).optional().describe('Optional: Custom header names. If omitted, uses object keys.'),
      max_column_width: z.number().int().min(10).max(100).optional().default(40).describe('Maximum width per column before truncation (default: 40)'),
      truncate_ellipsis: z.string().optional().default('…').describe('Ellipsis character for truncated values (default: …)'),
    },
    implementation: async ({ data, headers, max_column_width, truncate_ellipsis }: { 
      data: Array<Record<string, unknown>>; 
      headers?: string[]; 
      max_column_width?: number; 
      truncate_ellipsis?: string; 
    }) => {
      try {
        if (!data || data.length === 0) {
          return { success: false, error: 'markdown_table_gen requires a non-empty "data" array' };
        }

        // Determine headers
        const columnHeaders = headers || Object.keys(data[0]);
        const rowCount = data.length;

        // Calculate column widths
        const colWidths: number[] = [];
        for (let i = 0; i < columnHeaders.length; i++) {
          let maxW = columnHeaders[i].length;
          for (let j = 0; j < rowCount; j++) {
            const val = data[j][columnHeaders[i]];
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            const strVal = val === null || val === undefined ? '' : String(val);
            maxW = Math.max(maxW, strVal.length);
          }
          // Cap width at max_column_width
          colWidths.push(Math.min(maxW, max_column_width || 40));
        }

        // Helper to format cell
        const formatCell = (val: unknown, width: number): string => {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const str = val === null || val === undefined ? '' : String(val);
          if (str.length > width) {
            return str.substring(0, width - 1) + (truncate_ellipsis || '…');
          }
          return str.padEnd(width);
        };

        // Build table rows
        const separator = colWidths.map(w => '-'.repeat(w)).join('|');
        const headerRow = '|' + columnHeaders.map((h, i) => formatCell(h, colWidths[i])).join('|') + '|';
        const dataRows = data.map(row => 
          '|' + columnHeaders.map((h, i) => formatCell(row[h], colWidths[i])).join('|') + '|'
        );

        const markdownTable = [headerRow, separator, ...dataRows].join('\n');

        return { success: true, data: { 
          markdown_table: markdownTable,
          columns: columnHeaders.length,
          rows: rowCount,
          column_widths: colWidths,
          preview: markdownTable.substring(0, 500) + (markdownTable.length > 500 ? '\n... (truncated)' : '')
        }};
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
      }
    },
  }));


  return tools;
}