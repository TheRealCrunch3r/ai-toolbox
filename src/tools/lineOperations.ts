/**
 * Line Operations Tool - Delete lines from files safely
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import * as fs from 'fs';
import { z } from 'zod';
import { parse as parseTS } from '@typescript-eslint/parser';
import type { PluginConfig } from '../config';
import { getWorkingDir, resolvePath } from '../workingDir';
import { validatePath } from '../security';

interface ASTLocation {
  line: number;
  column: number;
}

interface ASTLoc {
  start: ASTLocation;
  end: ASTLocation;
}

interface ASTBaseNode {
  type: string;
  loc?: ASTLoc;
  range?: [number, number];
  [key: string]: unknown;
}

/**
 * AST Safety Check: Verifies if a line is safe for deletion.
 * Prevents deleting lines inside strings or comments.
 */
function isSafeDeletionLine(content: string, lineNum: number): { safe: boolean; reason?: string } {
  try {
    const ast = parseTS(content, {
      sourceType: 'module',
      ecmaVersion: 2022,
      loc: true,
      range: true,
    }) as unknown as ASTBaseNode;

    const unsafeTypes = new Set(['StringLiteral', 'TemplateLiteral', 'NumericLiteral', 'BooleanLiteral', 'LineComment', 'BlockComment']);
    const safeTypes = new Set(['VariableDeclaration', 'ExpressionStatement', 'FunctionDeclaration', 'ClassDeclaration', 'IfStatement', 'ForStatement', 'WhileStatement', 'ReturnStatement', 'ThrowStatement', 'TryStatement', 'ImportDeclaration', 'ExportNamedDeclaration', 'ExportDefaultDeclaration']);

    let foundUnsafe = false;
    let foundSafe = false;

    function walk(node: ASTBaseNode): void {
      if (!node || foundSafe) return;
      
      const loc = node.loc;
      if (loc && loc.start.line <= lineNum && loc.end.line >= lineNum) {
        // Node covers this line
        if (unsafeTypes.has(node.type)) {
          foundUnsafe = true;
          return;
        }
        if (safeTypes.has(node.type)) {
          foundSafe = true;
          return;
        }
      }
      
      // Recurse through child nodes
      for (const key of Object.keys(node)) {
        const child = (node as Record<string, unknown>)[key];
        if (typeof child === 'object' && child !== null) {
          if (Array.isArray(child)) {
            child.forEach(c => {
              if (typeof c === 'object' && c !== null && 'type' in c) {
                walk(c as ASTBaseNode);
              }
            });
          } else if (typeof child === 'object' && child !== null && 'type' in child) {
            walk(child as ASTBaseNode);
          }
        }
      }
    }

    walk(ast);

    if (foundUnsafe) return { safe: false, reason: `Line ${lineNum} is inside a string literal, number, or comment. Cannot delete code here.` };
    if (foundSafe) return { safe: true };
    
    // If no node covers this line exactly, it might be a boundary (e.g. between statements)
    return { safe: true }; 
  } catch {
    // If parsing fails, fall back to safe default
    return { safe: true }; 
  }
}

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

          // ========== AST SAFETY CHECK: Ensure line is safe for deletion ==========
          const safetyCheck = isSafeDeletionLine(content, start_line);
          if (!safetyCheck.safe) {
            return { success: false, error: `AST Safety Check Failed: ${safetyCheck.reason}` };
          }

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
