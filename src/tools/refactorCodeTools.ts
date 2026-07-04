/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Node, Statement, FunctionDeclaration, Program } from '@babel/types';
import traverse from '@babel/traverse';
import generator, { type GeneratorOptions } from '@babel/generator';

// Safe Babel parser interface
type ParseFunction = (code: string, opts: any) => Node;

let babelParserCache: ParseFunction | null = null;
let babelParserError: string | null = null;

async function getBabelParser(): Promise<ParseFunction> {
  if (babelParserCache) return babelParserCache;
  if (babelParserError) throw new Error(babelParserError);
  try {
    const mod = await import('@babel/parser');
    babelParserCache = mod.parse as ParseFunction;
    return babelParserCache;
  } catch (err) {
    babelParserError = err instanceof Error ? err.message : String(err);
    throw new Error(`Babel parser failed to load: ${babelParserError}`);
  }
}

/** Reset babel module caches (for testing) */
export function resetBabelCache(): void {
  babelParserCache = null;
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
  extraction_lines?: string;
}

export function registerRefactorCodeTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  tools.push(tool({
    name: 'refactor_code',
    description: 'Perform AST-based code refactoring operations. Supports renaming identifiers, moving functions, and extracting code blocks into new functions.',
    parameters: {
      file_path: z.string().describe('Path to the file to refactor'),
      operation: z.enum(['rename_identifier', 'move_function', 'extract_function']).describe('Refactoring operation to perform'),
      old_name: z.string().optional().describe('Old identifier/function name (required for rename and move)'),
      new_name: z.string().optional().describe('New function name (required for extract)'),
      function_name: z.string().optional().describe('Function name to move'),
      target_path: z.string().optional().describe('Target file path for moving functions'),
      extraction_lines: z.string().optional().describe('Line range to extract (e.g., "10-20")'),
    },
    implementation: async ({ file_path, operation, old_name, new_name, function_name, target_path, extraction_lines }: RefactorCodeParams) => {
      try {
        const resolvedPath = path.resolve(file_path);
        if (!fs.existsSync(resolvedPath)) {
          return { success: false, error: `File not found: ${resolvedPath}` };
        }

        const content = fs.readFileSync(resolvedPath, 'utf-8');
        const isTypeScript = resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.tsx');

        const parser = await getBabelParser();
        const ast = parser(content, {
          sourceType: 'module',
          plugins: isTypeScript ? ['typescript'] : [],
        }) as Program;

        // Perform the operation
        let success = false;
        let message = '';

        if (operation === 'rename_identifier' && old_name && new_name) {
          traverse(ast, {
            Identifier(path) {
              const ident = path.node;
              if (ident.name === old_name) {
                ident.name = new_name;
              }
            },
            BindingIdentifier(path) {
              const ident = path.node;
              if (ident.name === old_name) {
                ident.name = new_name;
              }
            },
          });
          success = true;
          message = `Renamed identifier '${old_name}' to '${new_name}'`;
        } else if (operation === 'move_function' && old_name && function_name && target_path) {
          const generatorOpts: GeneratorOptions = {
            compact: false,
            comments: true,
            jsescOption: { minimal: true },
          };

          let funcNode: Node | null = null;
          traverse(ast, {
            FunctionDeclaration(path) {
              if (path.node.id?.name === function_name) {
                funcNode = path.node;
                path.remove();
              }
            },
            FunctionExpression(path) {
              const fnExpr = path.node as unknown as FunctionDeclaration | undefined;
              if (fnExpr?.id?.name === function_name) {
                funcNode = path.node;
                path.remove();
              }
            },
          });

          if (!funcNode) {
            return { success: false, error: `Function '${function_name}' not found in ${resolvedPath}` };
          }

          const resolvedTarget = path.resolve(target_path);
          let targetContent = '';
          if (fs.existsSync(resolvedTarget)) {
            targetContent = fs.readFileSync(resolvedTarget, 'utf-8');
          }

          const targetAst = parser(targetContent, {
            sourceType: 'module',
            plugins: isTypeScript ? ['typescript'] : [],
          }) as Program;

          traverse(targetAst, {
            Program(path) {
              if (funcNode) path.node.body.push(funcNode as Statement);
            },
          });

          const newTargetContent = generator(targetAst, generatorOpts).code;
          fs.writeFileSync(resolvedTarget, newTargetContent);
          
          const sourceOpts: GeneratorOptions = { compact: false, comments: true };
          fs.writeFileSync(resolvedPath, generator(ast, sourceOpts).code);

          success = true;
          message = `Moved function '${function_name}' from ${resolvedPath} to ${resolvedTarget}`;
        } else if (operation === 'extract_function' && new_name && extraction_lines) {
          const generatorOpts: GeneratorOptions = {
            compact: false,
            comments: true,
            retainLines: true,
          };

          const lineRange = extraction_lines.split('-').map(Number);
          if (lineRange.length !== 2 || lineRange.some(isNaN)) {
            return { success: false, error: 'Invalid extraction_lines format. Use "start-end" (e.g., "10-20")' };
          }

          const [startLine, endLine] = lineRange;
          const sourceLines = content.split('\n');
          
          if (startLine < 1 || endLine > sourceLines.length || startLine > endLine) {
            return { success: false, error: `Invalid line range. File contains ${sourceLines.length} lines.` };
          }

          let extractedText = '';
          for (let i = startLine - 1; i < endLine; i++) {
            extractedText += sourceLines[i] + '\n';
          }
          extractedText = extractedText.trim();

          try {
            const extractedAst = parser(extractedText, {
              sourceType: 'module',
              plugins: isTypeScript ? ['typescript'] : [],
            }) as Program;

            if (!extractedAst || !extractedAst.body) {
              return { success: false, error: 'Extracted block contains no valid statements.' };
            }

            const tempFn = parser(`function temp() {}`, { sourceType: 'module' });
            
            let newFunctionNode: Node | null = null;

            traverse(tempFn as Program, {
              FunctionDeclaration(path) {
                if (path.node.body?.type === 'BlockStatement') {
                  path.node.body.body = extractedAst.body;
                  const id = path.node.id;
                  if (id) id.name = new_name;
                  newFunctionNode = path.node;
                }
              },
            });

            traverse(ast, {
              Program(path) {
                if (newFunctionNode) path.node.body.push(newFunctionNode as Statement);
              },
            });

            const newContent = generator(ast, generatorOpts).code;
            fs.writeFileSync(resolvedPath, newContent);

            success = true;
            message = `Successfully extracted ${lineRange[1] - startLine + 1} lines into function '${new_name}'. The new function has been appended to the file. Original lines remain; you may replace them with a call to '${new_name}()' manually or via another refactoring step.`;
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            return { success: false, error: `Failed to parse extracted code block: ${errorMsg}. Ensure the selected lines contain valid JavaScript/TypeScript statements.` };
          }
        } else {
          return { success: false, error: `Invalid parameters for operation '${operation}'. Check required fields.` };
        }

        if (success) {
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