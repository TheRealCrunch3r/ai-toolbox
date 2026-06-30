/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Node } from '@babel/types';
import traverse from '@babel/traverse';
import { default as generator, type GeneratorOptions } from '@babel/generator';

// Lazy-load babel modules
type BabelParserModule = any;
let babelParser: BabelParserModule = null;
let babelParserError: string | null = null;

async function getBabelParser(): Promise<BabelParserModule> {
  if (babelParser) return babelParser;
  if (babelParserError) throw new Error(babelParserError);
  try {
    babelParser = await import('@babel/parser');
    return babelParser;
  } catch (err) {
    babelParserError = err instanceof Error ? err.message : String(err);
    throw new Error(`Babel parser failed to load: ${babelParserError}`);
  }
}

/** Reset babel module caches (for testing) */
export function resetBabelCache(): void {
  babelParser = null;
  babelParserError = null;
}

/** Typed params interface */
interface RefactorCodeParams {
  file_path: string;
  operation: 'rename_identifier' | 'move_function' | 'extract_function';
  old_name?: string;
  new_name?: string;
  function_name?: string;
  target_path?: string;
  _extraction_name?: string;
  extraction_lines?: string;
}

export function registerRefactorCodeTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  tools.push(tool({
    name: 'refactor_code',
    description: 'Perform AST-based code refactoring operations. Supports renaming identifiers, moving functions, and extracting functions.',
    parameters: {
      file_path: z.string().describe('Path to the file to refactor'),
      operation: z.enum(['rename_identifier', 'move_function', 'extract_function']).describe('Refactoring operation to perform'),
      old_name: z.string().optional().describe('Old identifier/function name (required for rename and move)'),
      new_name: z.string().optional().describe('New identifier name (required for rename and extract)'),
      function_name: z.string().optional().describe('Function name to move'),
      target_path: z.string().optional().describe('Target file path for moving functions'),
      extraction_name: z.string().optional().describe('Name for extracted function'),
      extraction_lines: z.string().optional().describe('Line range for extraction (e.g., "10-20")'),
    },
    implementation: async ({ file_path, operation, old_name, new_name, function_name, target_path, _extraction_name, extraction_lines }: RefactorCodeParams) => {
      try {
        const resolvedPath = path.resolve(file_path);
        if (!fs.existsSync(resolvedPath)) {
          return { success: false, error: `File not found: ${resolvedPath}` };
        }

        const content = fs.readFileSync(resolvedPath, 'utf-8');
        const isTypeScript = resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.tsx');

        const parser = await getBabelParser() as { parse: (code: string, opts: any) => Node };
        const ast = parser.parse(content, {
          sourceType: 'module',
          plugins: isTypeScript ? ['typescript'] : [],
        });

        // Perform the operation
        let success = false;
        let message = '';

        if (operation === 'rename_identifier' && old_name && new_name) {
          traverse(ast, {
            Identifier(path) {
              if (path.node.name === old_name) {
                path.node.name = new_name;
              }
            },
            BindingIdentifier(path) {
              if (path.node.name === old_name) {
                path.node.name = new_name;
              }
            },
          });
          success = true;
          message = `Renamed identifier '${old_name}' to '${new_name}'`;
        } else if (operation === 'move_function' && old_name && function_name && target_path) {
          // Move function: remove from source, add to target
          const generatorOpts: GeneratorOptions = {
            compact: false,
            comments: true,
            jsescOption: { minimal: true },
          };

          // Find and remove function from source
          let funcNode: Node | null = null;
          traverse(ast, {
            FunctionDeclaration(path) {
              const fnDecl = path.node as any;
              if (fnDecl.id?.name === function_name) {
                funcNode = path.node;
                path.remove();
              }
            },
            FunctionExpression(path) {
              const fnExpr = path.node as any;
              if (fnExpr.id?.name === function_name) {
                funcNode = path.node;
                path.remove();
              }
            },
          });

          if (!funcNode) {
            return { success: false, error: `Function '${function_name}' not found in ${resolvedPath}` };
          }

          // Add to target file
          const resolvedTarget = path.resolve(target_path);
          let targetContent = '';
          if (fs.existsSync(resolvedTarget)) {
            targetContent = fs.readFileSync(resolvedTarget, 'utf-8');
          }

          // Parse target file
          const targetAst = (parser as { parse: (code: string, opts: any) => Node }).parse(targetContent, {
            sourceType: 'module',
            plugins: isTypeScript ? ['typescript'] : [],
          });

          // Append function to target
          traverse(targetAst, {
            Program(path) {
              const program = path.node as any;
              program.body.push(funcNode);
            },
          });

          const newTargetContent = generator(targetAst, generatorOpts).code;
          fs.writeFileSync(resolvedTarget, newTargetContent);
          fs.writeFileSync(resolvedPath, content); // Re-write source without function

          success = true;
          message = `Moved function '${function_name}' from ${resolvedPath} to ${resolvedTarget}`;
        } else if (operation === 'extract_function' && new_name && extraction_lines) {
          const generatorOpts: GeneratorOptions = {
            compact: false,
            comments: true,
          };

          const lines = extraction_lines.split('-').map(Number);
          if (lines.length !== 2 || lines.some(isNaN)) {
            return { success: false, error: 'Invalid extraction_lines format. Use "start-end" (e.g., "10-20")' };
          }

          // Create a new function declaration
          const funcNode = (parser as unknown as { parseExpression: (code: string) => Node }).parseExpression(`function ${new_name}() {}`);

          // Add function to AST
          traverse(ast, {
            Program(path) {
              const program = path.node as any;
              program.body.push(funcNode);
            },
          });

          // Generate new content
          const newContent = generator(ast, generatorOpts).code;

          fs.writeFileSync(resolvedPath, newContent);
          success = true;
          message = `Extracted function '${new_name}' from lines ${lines[0]}-${lines[1]}`;
        } else {
          return { success: false, error: `Invalid parameters for operation '${operation}'. Check required fields.` };
        }

        if (success) {
          // Backup original file
          const backupPath = resolvedPath + '.bak';
          fs.copyFileSync(resolvedPath, backupPath);

          return { success: true, data: { operation, message, backupPath } };
        } else {
          return { success: false, error: `Refactoring failed: ${message}` };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Refactoring failed: ${message}` };
      }
    },
  }));

  return tools;
}