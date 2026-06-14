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
import { getWorkingDir } from '../workingDir.js';
import * as pathModule from 'path';

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
async function readFileWithLimit(filePath: string): Promise<string> {
  const stats = await fs.stat(filePath);
  if (stats.size > 10_000_000) {
    throw new Error('File too large (>10MB)');
  }
  return fs.readFile(filePath, 'utf-8');
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
      pattern: z.string().describe('Regex or literal pattern to match'),
      replacement: z.string().optional().describe('Replacement text (supports $1, $2 for capture groups)'),
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

        const fullPath = pathModule.resolve(file_name);

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

        // Build regex with flags
        const flagString = flags || 'g';
        const regex = new RegExp(pattern, flagString.includes('i') ? `${flagString.replace('g', '')}gi` : flagString);

        let changesApplied = 0;
        let transformedContent: string;

        if (lines?.start !== undefined || lines?.end !== undefined) {
          // Apply transformation to specific line range
          const linesArray = content.split('\n');
          const startLine = Math.max(1, lines.start ?? 1);
          const endLine = Math.min(lines.end ?? linesArray.length, linesArray.length);

          for (let i = startLine - 1; i < endLine; i++) {
            if (replacement) {
              // Count replacements in this line before applying
              const matches = linesArray[i].match(new RegExp(pattern, 'g'));
              if (matches) changesApplied += matches.length;

              // Apply replacement with capture groups ($1, $2, etc.)
              linesArray[i] = linesArray[i].replace(regex, replacement);
            } else {
              // Delete matching lines
              const matches = linesArray[i].match(new RegExp(pattern, 'g'));
              if (matches) changesApplied += matches.length;

              linesArray[i] = '';
            }
          }

          transformedContent = linesArray.join('\n');
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

        const fullPath = pathModule.resolve(file_name);

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
      operation: z.enum(['insert', 'delete', 'move']).default('insert').describe('Operation to perform'),
      target_line: z.number().int().min(1).optional().describe('Target line number for insert/delete/move operations'),
      content: z.string().optional().describe('For insert operation - text to insert'),
      move_from: z.number().int().optional().describe('Source line for move operation'),
      move_to: z.number().int().optional().describe('Destination line for move operation')
    },
    implementation: async (params: { 
      file_name: string;
      operation: 'insert' | 'delete' | 'move';
      target_line?: number;
      content?: string;
      move_from?: number;
      move_to?: number;
    }) => {
      const { file_name, operation, target_line, content, move_from, move_to } = params; // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        const fullPath = pathModule.resolve(file_name);

        let file_content: string;
        try {
          file_content = await readFileWithLimit(fullPath);
        } catch (error) {
          return handleError(error);
        }

        const lines = file_content.split('\n');
        let changes_made = 0;

        switch (operation) {
          case 'insert':
            if (!content && content !== '') {
              return { success: false, error: 'Insert operation requires "content" parameter' };
            }
            const insert_line = target_line ?? (lines.length + 1);
            lines.splice(insert_line - 1, 0, content || '');
            changes_made = 1;
            break;

          case 'delete':
            if (!target_line) {
              return { success: false, error: 'Delete operation requires "target_line" parameter' };
            }
            if (target_line < 1 || target_line > lines.length) {
              return { success: false, error: `Line number ${target_line} out of range (1-${lines.length})` };
            }
            lines.splice(target_line - 1, 1);
            changes_made = 1;
            break;

          case 'move':
            if (!move_from || !move_to) {
              return { success: false, error: 'Move operation requires "move_from" and "move_to" parameters' };
            }
            if (move_from < 1 || move_from > lines.length || move_to < 1 || move_to > lines.length) {
              return { success: false, error: `Line numbers out of range (1-${lines.length})` };
            }
            const moved_line = lines.splice(move_from - 1, 1)[0];
            // Adjust target if moving within same direction
            let adjusted_to = move_to;
            if (move_from < move_to) {
              adjusted_to--;
            }
            lines.splice(adjusted_to - 1, 0, moved_line);
            changes_made = 1;
            break;

          default:
            return { success: false, error: `Unknown operation: ${String(operation)}` };
        }

        // Write back atomically
        try {
          await writeFileAtomic(fullPath, lines.join('\n'));
        } catch (error) {
          return handleError(error);
        }

        return { success: true, data: { 
          operations_performed: operation,
          changes_applied: changes_made,
          total_lines_after: lines.length,
          message: `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation completed successfully`
        }};
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  return tools;
}
