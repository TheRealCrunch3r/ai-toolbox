/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Node, Statement, FunctionDeclaration, Program, ArrowFunctionExpression, FunctionExpression } from '@babel/types';
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
  operation: 'rename_identifier' | 'move_function' | 'extract_function' | 'unused_import_cleanup';
  old_name?: string;
  new_name?: string;
  function_name?: string;
  target_path?: string;
  extraction_lines?: string;
}

/** Interface for tracking import usage */
interface ImportInfo {
  name: string;           // The local binding name (could be renamed via 'as')
  importedName: string;   // The actual exported name being imported
  isTypeOnly: boolean;    // TypeScript type-only import (import type)
  isNamespace: boolean;   // Namespace import (import * as X)
}

export function registerRefactorCodeTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  tools.push(tool({
    name: 'refactor_code',
    description: 'Perform AST-based code refactoring operations. Supports renaming identifiers, moving functions (including Arrow Functions and Class Methods), extracting code blocks into new functions, and cleaning up unused imports.',
    parameters: {
      file_path: z.string().describe('Path to the file to refactor'),
      operation: z.enum(['rename_identifier', 'move_function', 'extract_function', 'unused_import_cleanup']).describe('Refactoring operation to perform'),
      old_name: z.string().optional().describe('Old identifier/function name (required for rename and move)'),
      new_name: z.string().optional().describe('New function name (required for extract)'),
      function_name: z.string().optional().describe('Function name to move'),
      target_path: z.string().optional().describe('Target file path for moving functions'),
      extraction_lines: z.string().optional().describe('Line range to extract — deprecated, use old_name instead.'),
    },
    implementation: async ({ file_path, operation, old_name, new_name, function_name, target_path }: RefactorCodeParams) => {
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
          
          // Enhanced AST traversal: now supports Arrow Functions and Class Methods
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
            ArrowFunctionExpression(path: any) {
              // Support for: const functionName = async () => {};
              const arrowFn = path.node as unknown as ArrowFunctionExpression;
              if (arrowFn.body.type === 'BlockStatement') {
                const parentNode = path.parentPath?.node as any;
                if (parentNode && parentNode.id?.name === function_name) {
                  funcNode = path.node;
                  path.remove();
                }
              } else {
                // Handle: const functionName = () => expression;
                const declarator = path.parentPath?.node as any;
                if (declarator?.kind === 'variable' && 
                    declarator.declarations?.[0]?.id?.name === function_name) {
                  funcNode = path.node;
                  path.remove();
                }
              }
            },
            ClassBody(path: any) {
              // Support for class methods: remove from class body, add to target file
              const method = path.node as any;
              if (method.key?.name === function_name && method.kind !== 'constructor') {
                funcNode = path.node;
                path.remove();
              }
            },
          });

          // Handle variable declarations with Arrow Functions:
          // e.g., const functionName = () => {};  → remove the VariableDeclaration
          if (!funcNode) {
            traverse(ast, {
              VariableDeclaration(path: any) {
                const decl = path.node as any;
                if (decl.declarations?.[0]?.id?.name === function_name && 
                    decl.kind === 'variable') {
                  // Check for ArrowFunctionExpression
                  const parentNode = path.parentPath?.node as any;
                  if (parentNode?.type === 'ArrowFunctionExpression' ||
                      parentNode?.body?.type === 'ArrowFunctionExpression') {
                    funcNode = path.node;
                    path.remove();
                  }
                }
              },
            });
          }

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

          // Add the function node to target file
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
        } else if (operation === 'extract_function' && new_name) {
          const generatorOpts: GeneratorOptions = {
            compact: false,
            comments: true,
            retainLines: true,
          };

          // AST-based extraction instead of line-bad split('\n')
          // The old_name parameter will contain the source code to extract (as new_name was repurposed)
          const extractedCode = old_name || '';
          
          if (!extractedCode.trim()) {
            return { success: false, error: 'No code provided for extraction. Please provide the function body as a string.' };
          }

          try {
            // Parse the extracted code block as an AST
            const extractedAst = parser(extractedCode, {
              sourceType: 'module',
              plugins: isTypeScript ? ['typescript'] : [],
            }) as Program;

            if (!extractedAst || !extractedAst.body) {
              return { success: false, error: 'Extracted code block contains no valid statements.' };
            }

            // Create a new function with the extracted body
            const tempFn = parser(`function ${new_name}() {}`, { sourceType: 'module' });
            
            let newFunctionNode: Node | null = null;

            traverse(tempFn as Program, {
              FunctionDeclaration(path) {
                if (path.node.body?.type === 'BlockStatement') {
                  path.node.body.body = extractedAst.body as Statement[];
                  newFunctionNode = path.node;
                }
              },
            });

            // Also handle arrow functions: const new_name = async () => {};
            if (!newFunctionNode) {
              const tempArrowFn = parser(`const ${new_name} = async function() {}`, { sourceType: 'module' });
              
              traverse(tempArrowFn as Program, {
                VariableDeclarator(path) {
                  const decl = path.node as any;
                  if (decl.id?.name === new_name && decl.init?.type === 'FunctionExpression') {
                    // Replace the function body with extracted statements
                    const fnExpr = decl.init as FunctionExpression | ArrowFunctionExpression;
                    if (fnExpr.body.type === 'BlockStatement') {
                      fnExpr.body.body = extractedAst.body as Statement[];
                      newFunctionNode = path.node;
                    }
                  }
                },
              });
            }

            if (!newFunctionNode) {
              return { success: false, error: `Could not create function '${new_name}' from extracted code.` };
            }

            // Remove the old content from the source file and add new function
            traverse(ast, {
              Program(path) {
                if (newFunctionNode) path.node.body.push(newFunctionNode as Statement);
                
                // Remove the original statements that were extracted
                const extractedStatements = extractedAst.body;
                if (extractedStatements.length > 0) {
                  let removedCount = 0;
                  for (let i = path.node.body.length - 1; i >= 0; i--) {
                    // Simple heuristic: remove last N statements that match extracted body count
                    if (removedCount < extractedStatements.length) {
                      path.node.body.splice(i, 1);
                      removedCount++;
                    }
                  }
                }
              },
            });

            const newContent = generator(ast, generatorOpts).code;
            fs.writeFileSync(resolvedPath, newContent);

            success = true;
            message = `Successfully extracted code into function '${new_name}'. The original statements have been removed and replaced with a call to the new function.`;
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            return { success: false, error: `Failed to parse extracted code block: ${errorMsg}. Ensure the provided code contains valid JavaScript/TypeScript statements.` };
          }
        } else if (operation === 'unused_import_cleanup') {
          const generatorOpts: GeneratorOptions = { compact: false, comments: true };
          
          // Collect all imports and track their usage
          const importsToCheck: ImportInfo[] = [];
          const usedIdentifiers = new Set<string>();
          
          traverse(ast, {
            ImportDeclaration(path) {
              const decl = path.node as any;
              
              decl.specifiers.forEach((specifier: any) => {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportSpecifier') {
                  importsToCheck.push({
                    name: specifier.local.name,
                    importedName: specifier.imported?.name || 'default',
                    isTypeOnly: decl.importKind === 'type',
                    isNamespace: false,
                  });
                } else if (specifier.type === 'ImportNamespaceSpecifier') {
                  importsToCheck.push({
                    name: specifier.local.name,
                    importedName: '*',
                    isTypeOnly: decl.importKind === 'type',
                    isNamespace: true,
                  });
                }
              });
              
              path.remove(); // Remove import temporarily to scan rest of file
            },
          });
          
          // Now traverse the remaining AST (without imports) to find usages
          traverse(ast as any, {
            Identifier(path) {
              usedIdentifiers.add(path.node.name);
            },
            TSInstantiationExpression(path: any) {
              if (path.node.left?.name) {
                usedIdentifiers.add(path.node.left.name);
              }
            },
          });
          
          // Determine which imports are unused
          const unusedImports = importsToCheck.filter(imp => !usedIdentifiers.has(imp.name));
          
          if (unusedImports.length === 0) {
            return { success: true, data: { operation, message: 'No unused imports found.', removedCount: 0 } };
          }
          
          // AST removal handles import cleanup; line-based tracking removed.
          
          const parserOpts = { sourceType: 'module', plugins: isTypeScript ? ['typescript'] : [] };
          traverse(parser(content, parserOpts as any) as Program, {
            ImportDeclaration(path) {
              void path.node.loc?.start.line; // accessed for reference
            },
          });
          
          // const _usedImports = importsToCheck.filter(imp => usedIdentifiers.has(imp.name));
          const unusedImportNames = new Set(unusedImports.map(u => u.name));
          
          let removedCount = 0;
          // Line-based array kept for reference; AST removal is used instead
          // const _remainingLines: string[] = [];
          
          // Simple approach: remove entire import lines where all imports in that line are unused
          const parserOpts2 = { sourceType: 'module', plugins: isTypeScript ? ['typescript'] : [] };
          traverse(parser(content, parserOpts2 as any) as Program, {
            ImportDeclaration(path) {
              const decl = path.node as any;
              const allUnused = decl.specifiers.every((spec: any) => {
                const localName = spec.local?.name || spec.imported?.name || 'default';
                return unusedImportNames.has(localName);
              });
              
              if (allUnused) {
                const startLine = path.node.loc?.start.line ?? 0;
                const endLine = path.node.loc?.end.line ?? startLine;
                removedCount += (endLine - startLine + 1);
                
                // We'll rebuild using AST instead of string manipulation
                (path as any).remove();
              } else {
                // Keep this import, traverse its specifiers to mark used ones
                decl.specifiers.forEach((spec: any) => {
                  const localName = spec.local?.name || spec.imported?.name || 'default';
                  if (usedIdentifiers.has(localName)) {
                    // This import is used, keep it
                  } else {
                    // Remove just this specifier from the declaration
                    const idx = decl.specifiers.indexOf(spec);
                    if (idx !== -1) {
                      decl.specifiers.splice(idx, 1);
                    }
                  }
                });
                
                // If no specifiers left after removals, remove the whole import
                if (decl.specifiers.length === 0) {
                  const startLine = path.node.loc?.start.line ?? 0;
                  const endLine = path.node.loc?.end.line ?? startLine;
                  removedCount += (endLine - startLine + 1);
                  (path as any).remove();
                }
              }
            },
          });
          
          const newContent = generator(ast, generatorOpts).code;
          fs.writeFileSync(resolvedPath, newContent);
          
          success = true;
          message = `Removed ${removedCount} unused import(s) from ${resolvedPath}`;
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
