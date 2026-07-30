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
import type { Node, Statement, Program, ArrowFunctionExpression } from '@babel/types';
import traverse from '@babel/traverse';
import * as babelParser from '@babel/parser';
import generator, { type GeneratorOptions } from '@babel/generator';
import { runRecodeEngine } from './recodeTool/recodeEngine';
import { unusedImportsRule } from './recodeTool/rules/unusedImports';

// Safe Babel parser interface
type ParseFunction = (code: string, opts: any) => Node;

/** LRU cache entry for Babel parser */
interface ParserCacheEntry {
  parseFn: ParseFunction;
  timestamp: number;
}

const babelParserLRU = new Map<string, ParserCacheEntry>();
const MAX_PARSER_CACHE_SIZE = 5; // Limit to prevent unbounded memory growth
const PARSER_CACHE_TTL_MS = 60_000; // 1 minute TTL for cache entries

// Global fallback for backward compatibility with existing code (dead_code_detection)
let babelParserCache: ParseFunction | null = null;

async function getBabelParser(): Promise<ParseFunction> {
  const cacheKey = '@babel/parser';
  
  // Check LRU cache first (LRU eviction on access)
  const cached = babelParserLRU.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < PARSER_CACHE_TTL_MS) {
    return cached.parseFn;
  }
  
  // Try global fallback for backward compatibility
  if (babelParserCache) return babelParserCache;
  
  try {
    // @babel/parser default export is the parse function itself
    const parseFn = typeof babelParser === 'function' ? babelParser : (babelParser.parse as ParseFunction);
    if (!parseFn) throw new Error('Could not locate .parse function in @babel/parser');
    
    // Update LRU cache (move to end by delete + reinsert)
    babelParserLRU.delete(cacheKey);
    babelParserLRU.set(cacheKey, { parseFn, timestamp: Date.now() });
    
    // Evict oldest entry if over limit (Map preserves insertion order)
    while (babelParserLRU.size > MAX_PARSER_CACHE_SIZE) {
      const firstKey = babelParserLRU.keys().next().value;
      if (firstKey !== undefined) {
        babelParserLRU.delete(firstKey);
      } else {
        break;
      }
    }
    
    // Also update global fallback for backward compatibility
    babelParserCache = parseFn;
    
    return parseFn;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Babel parser failed to load: ${errorMsg}`);
  }
}

/** Reset babel module caches (for testing) */
export function resetBabelCache(): void {
  babelParserLRU.clear();
  babelParserCache = null;
}

/** Minimal Unified Diff Generator */
function generateUnifiedDiff(oldText: string, newText: string): string {
  // Performance guard: limit diff calculation to prevent O(n²) on large files
  const MAX_DIFF_LINES = 100;
  if (oldText.split('\n').length > MAX_DIFF_LINES || newText.split('\n').length > MAX_DIFF_LINES) {
    return '(Diff truncated — file too large for unified diff preview. Max 100 lines.)';
  }
  
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => new Array(n + 1).fill(0) as number[]);
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  
  let i = m, j = n;
  const ops: { type: 'ctx' | 'del' | 'add', content: string }[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.unshift({ type: 'ctx', content: oldLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: 'add', content: newLines[j - 1] });
      j--;
    } else {
      ops.unshift({ type: 'del', content: oldLines[i - 1] });
      i--;
    }
  }
  
  let output = '';
  for (let k = 0; k < ops.length; k++) {
    const op = ops[k];
    if (op.type === 'ctx') {
      output += ` ${op.content}\n`;
    } else {
      let startI = k, endI = k;
      while (endI < ops.length && ops[endI].type !== 'ctx') endI++;
      
      const contextStart = Math.max(0, startI - 3);
      let ctxCount = 0;
      for (let c = contextStart; c < startI; c++) { if (ops[c].type === 'ctx') ctxCount++; }
      
      output += `--- Original\n+++ Modified\n@@ -${startI - ctxCount + 1},${endI - startI} @@\n`;
      for (let c = contextStart; c < ops.length && ops[c].type === 'ctx'; c++) {
        if (c >= startI) break;
        output += ` ${ops[c].content}\n`;
      }
      
      for (let x = startI; x < endI; x++) {
        if (ops[x].type === 'del') output += `- ${ops[x].content}\n`;
        else output += `+ ${ops[x].content}\n`;
      }
      
      k = endI - 1;
    }
  }
  
  return output || '(No changes detected)';
}

/** Typed params interface */
interface RefactorCodeParams {
  file_path: string;
  operation: 'rename_identifier' | 'move_function' | 'extract_function' | 'unused_import_cleanup' | 'dead_code_detection';
  old_name?: string;
  new_name?: string;
  function_name?: string;
  target_path?: string;
  extraction_lines?: string;
  dry_run?: boolean;
}

export function registerRefactorCodeTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  tools.push(tool({
    name: 'refactor_code',
    description: 'Perform AST-based code refactoring operations. Supports renaming identifiers, moving functions (including Arrow Functions and Class Methods), extracting code blocks into new functions, cleaning up unused imports, and detecting dead code.',
    parameters: {
      file_path: z.string().describe('Path to the file or directory to refactor'),
      operation: z.enum(['rename_identifier', 'move_function', 'extract_function', 'unused_import_cleanup', 'dead_code_detection']).describe('Refactoring operation to perform'),
      old_name: z.string().optional().describe('Old identifier/function name (required for rename and move)'),
      new_name: z.string().optional().describe('New function name (required for extract)'),
      function_name: z.string().optional().describe('Function name to move'),
      target_path: z.string().optional().describe('Target file path for moving functions'),
      extraction_lines: z.string().optional().describe('Line range to extract — deprecated, use old_name instead.'),
      dry_run: z.boolean().optional().default(false).describe('If true, return a unified diff preview without modifying files'),
    },
    implementation: async ({ file_path, operation, old_name, new_name, function_name, target_path, dry_run }: RefactorCodeParams) => {
      try {
        if (operation === 'dead_code_detection') {
          const resolvedPath = path.resolve(file_path);
          if (!fs.existsSync(resolvedPath)) return { success: false, error: `Directory not found: ${resolvedPath}` };
          
          let targetDir = resolvedPath;
          if (fs.statSync(resolvedPath).isFile()) {
            targetDir = path.dirname(resolvedPath);
          }

          const allFiles: string[] = [];
          function scan(dir: string) {
            fs.readdirSync(dir).forEach(f => {
              const p = path.join(dir, f);
              if (fs.statSync(p).isDirectory()) scan(p);
              else if (/\.((ts|tsx|js|jsx))$/.test(path.extname(f))) allFiles.push(p);
            });
          }
          scan(targetDir);

          const exportMap = new Map<string, { name: string; file: string }[]>();
          const usageSet = new Set<string>();

          for (const f of allFiles) {
            try {
              const code = fs.readFileSync(f, 'utf-8');
              const isTS = f.endsWith('.ts') || f.endsWith('.tsx');
              
              let localParser: ParseFunction | null = babelParserCache;
              if (!localParser) {
                try {
                  const parseFn = typeof babelParser === 'function' ? babelParser : (babelParser.parse as ParseFunction);
                  if (!parseFn) throw new Error('Could not locate .parse function in @babel/parser');
                  localParser = parseFn;
                  babelParserCache = localParser;
                } catch (err) {
                  throw new Error(`Babel parser unavailable: ${err instanceof Error ? err.message : String(err)}`);
                }
              }

              const ast = localParser(code, { sourceType: 'module', plugins: isTS ? ['typescript'] : [] }) as Program;
              
              // Single-pass optimization: combine export collection + usage tracking in one traversal
              traverse(ast, {
                ExportNamedDeclaration(path) {
                  if (path.node.declaration?.type === 'FunctionDeclaration' || 
                      path.node.declaration?.type === 'ClassDeclaration') {
                    const name = path.node.declaration.id?.name;
                    if (name) exportMap.set(name, [...(exportMap.get(name) || []) as { name: string; file: string }[], { name, file: f }]);
                  } else if (path.node.specifiers?.[0] && path.node.specifiers[0].type === 'ExportSpecifier') {
                    const name = (path.node.specifiers[0] as any).local.name;
                    exportMap.set(name, [...(exportMap.get(name) || []) as { name: string; file: string }[], { name, file: f }]);
                  }
                },
                ExportDefaultDeclaration(path) {
                  const decl = path.node.declaration as any;
                  if (decl?.type === 'FunctionDeclaration' || decl?.type === 'ClassDeclaration') {
                    const name = decl.id?.name;
                    if (name && name !== 'default') exportMap.set(name, [...(exportMap.get(name) || []) as { name: string; file: string }[], { name, file: f }]);
                  }
                },
                ImportDeclaration(path) {
                  path.node.specifiers.forEach((s: any) => usageSet.add(s.local.name));
                },
                Identifier(p) {
                  if (p.node.name !== 'default') {
                    // Check if identifier is inside an export declaration using Babel parentPath API
                    let current: any = p.parentPath;
                    let isInsideExport = false;
                    while (current && current.node) {
                      const nodeType = current.node.type;
                      if (nodeType === 'ExportNamedDeclaration' || nodeType === 'ExportDefaultDeclaration') {
                        isInsideExport = true;
                        break;
                      }
                      current = current.parentPath;
                    }
                    
                    if (!isInsideExport) {
                      usageSet.add(p.node.name);
                    }
                  }
                },
              });

            } catch (err: any) {
              console.error(`Error parsing ${f}:`, err.message);
            }
          }

          const deadExports: string[] = [];
          for (const [name, locs] of exportMap.entries()) {
            if (!usageSet.has(name)) deadExports.push(`${name} (${locs.map(l => path.relative(targetDir, l.file)).join(', ')})`);
          }

          if (deadExports.length === 0) return { success: true, data: { operation, message: 'No dead code detected.', dryRun: !!dry_run, deadExports: [] } };
          
          const msg = `Found ${deadExports.length} unused export(s):\n${deadExports.join('\n')}`;
          return { success: true, data: { operation, message: msg, dryRun: !!dry_run, deadExports } };
        }

        const resolvedPath = path.resolve(file_path);
        if (!fs.existsSync(resolvedPath)) {
          return { success: false, error: `File not found: ${resolvedPath}` };
        }

        const content = fs.readFileSync(resolvedPath, 'utf-8');
        const isTypeScript = resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.tsx');
        const genOpts: GeneratorOptions = { compact: false, comments: true, jsescOption: { minimal: true } };

        const parser = await getBabelParser();
        let ast = parser(content, { sourceType: 'module', plugins: isTypeScript ? ['typescript'] : [] }) as Program;

        // Perform the operation
        let success = false;
        let message = '';
        let newContent = content;
        let extraData: any = {};

        if (operation === 'rename_identifier' && old_name && new_name) {
          traverse(ast, {
            Identifier(path) { const ident = path.node as any; if (ident.name === old_name) ident.name = new_name; },
            BindingIdentifier(path) { const ident = path.node as any; if (ident.name === old_name) ident.name = new_name; },
          });
          
          newContent = generator(ast, genOpts).code;
          success = true; message = `Renamed identifier '${old_name}' to '${new_name}'`;
        } else if (operation === 'move_function' && function_name && target_path) {
          const resolvedTarget = path.resolve(target_path);
          
          let funcNode: Node | null = null;
          
          traverse(ast, {
            FunctionDeclaration(path) { if (path.node.id?.name === function_name) { funcNode = path.node; path.remove(); } },
            ArrowFunctionExpression(path: any) {
              const arrowFn = path.node as unknown as ArrowFunctionExpression;
              if (arrowFn.body.type === 'BlockStatement') {
                const parentNode = path.parentPath?.node as any;
                if (parentNode && parentNode.id?.name === function_name) { funcNode = path.node; path.remove(); }
              } else {
                const declarator = path.parentPath?.node as any;
                if ((declarator?.kind === 'const' || declarator?.kind === 'let' || declarator?.kind === 'var') && declarator.declarations?.[0]?.id?.name === function_name) { funcNode = path.node; path.remove(); }
              }
            },
          });

          // Fallback for variable declarations with Arrow Functions
          if (!funcNode) {
            traverse(ast, { VariableDeclaration(path: any) { const decl = path.node as any; if ((decl.kind === 'const' || decl.kind === 'let' || decl.kind === 'var') && decl.declarations?.[0]?.id?.name === function_name) { funcNode = path.node; path.remove(); } } });
          }

          // Handle class methods safely by filtering the body array directly
          if (!funcNode) {
            traverse(ast, { ClassBody(path: any) { 
              const methodIdx = path.node.body.findIndex((m: any) => m.key?.name === function_name && m.kind !== 'constructor');
              if (methodIdx !== -1) {
                funcNode = path.node.body[methodIdx];
                path.node.body.splice(methodIdx, 1);
              }
            }});
          }

          if (!funcNode) return { success: false, error: `Function '${function_name}' not found in ${resolvedPath}` };

          let targetContent = '';
          const actualTargetPath = target_path || '';
          if (fs.existsSync(actualTargetPath)) {
            targetContent = fs.readFileSync(actualTargetPath, 'utf-8');
          } else {
            fs.writeFileSync(actualTargetPath, '');
          }

          const targetAst = parser(targetContent || 'export {}', { sourceType: 'module', plugins: isTypeScript ? ['typescript'] : [] }) as Program;
          traverse(targetAst, { Program(path) { if (funcNode) path.node.body.push(funcNode as Statement); } });

          newContent = generator(ast, genOpts).code;
          const newTargetContent = generator(targetAst, genOpts).code;
          
          extraData.diffSourceFile = generateUnifiedDiff(content, newContent);
          extraData.diffTargetFile = generateUnifiedDiff(targetContent || '', newTargetContent);
          extraData.newTargetContent = newTargetContent; 
          
          success = true; message = `Moved function '${function_name}' from ${resolvedPath} to ${resolvedTarget}`;
        } else if (operation === 'extract_function' && new_name) {
          const extractedCode = old_name || '';
          if (!extractedCode.trim()) return { success: false, error: 'No code provided for extraction. Please provide the function body as a string.' };

          try {
            // Parse extracted code directly by wrapping in an IIFE to safely extract body statements without module overhead
            const parserOpts = { sourceType: 'module', plugins: isTypeScript ? ['typescript'] : [] };
            
            const wrapperCode = `(function() {\n${extractedCode}\n})`; 
            const extractedAst = parser(wrapperCode, parserOpts) as Program;
            
            // Extract the function body statements from the IIFE wrapper using traversal
            let extractedStmts: Statement[] = [];
            traverse(extractedAst as any, { FunctionExpression(path) {
              if (path.node.body?.type === 'BlockStatement') {
                extractedStmts = path.node.body.body as Statement[];
              }
            }});

            if (!extractedStmts || extractedStmts.length === 0) return { success: false, error: 'Extracted code block contains no valid statements.' };

            const tempFn = parser(`function ${new_name}() {}`, parserOpts);
            let newFunctionNode: Node | null = null;

            traverse(tempFn as Program, { FunctionDeclaration(path) { if (path.node.body?.type === 'BlockStatement') { path.node.body.body = extractedStmts; newFunctionNode = path.node; } } });

            if (!newFunctionNode) return { success: false, error: `Could not create function '${new_name}' from extracted code.` };

            // Remove original statements and insert new function
            traverse(ast, { Program(path) {
              const totalToRemove = Math.min(extractedStmts.length, path.node.body.filter(s => s.type !== 'ExportDefaultDeclaration').length);
              let removedCount = 0;
              for (let i = path.node.body.length - 1; i >= 0 && removedCount < totalToRemove; i--) {
                if (path.node.body[i].type !== 'ExportDefaultDeclaration') {
                  path.node.body.splice(i, 1);
                  removedCount++;
                }
              }
              // Insert new function at the end
              if (newFunctionNode) path.node.body.push(newFunctionNode as Statement);
            }});

            newContent = generator(ast, genOpts).code;
            
            success = true; message = `Successfully extracted code into function '${new_name}'. Removed ${extractedStmts.length} statement(s) from source.`;
          } catch (err: any) {
            const errorMsg = err.message || String(err);
            return { success: false, error: `Failed to parse extracted code block: ${errorMsg}. Ensure the provided code contains valid JavaScript/TypeScript statements.` };
          }
        } else if (operation === 'unused_import_cleanup') {
          // Use the new Recode Engine for unused import cleanup
          const result = await runRecodeEngine(resolvedPath, [
            { name: 'unusedImports', rule: unusedImportsRule }
          ], { dryRun: !!dry_run, backup: true });

          return result as Record<string, unknown>;
        } else {
          return { success: false, error: `Invalid parameters for operation '${operation}'. Check required fields.` };
        }

        // FINALIZE WRITES (for operations not handled by the engine)
        if (success && !dry_run) {
          const backupPath = resolvedPath + '.bak';
          fs.copyFileSync(resolvedPath, backupPath);
          
          // Write source file
          fs.writeFileSync(resolvedPath, newContent); 
          
          // Write target file for move_function if calculated
          if (operation === 'move_function' && extraData.newTargetContent) {
            const resolvedFinalTarget = path.resolve(target_path || '');
            fs.writeFileSync(resolvedFinalTarget, extraData.newTargetContent);
          }

          return { success: true, data: { operation, message, backupPath, ...extraData } };
        } else if (success && dry_run) {
          extraData.diff = generateUnifiedDiff(content, newContent);
          return { success: true, data: { operation, message, dryRun: true, ...extraData } };
        } else {
          return { success: false, error: `Refactoring failed: ${message}` };
        }
      } catch (error: any) {
        const message = error.message || String(error);
        return { success: false, error: `Refactoring failed: ${message}` };
      }
    },
  }));

  return tools;
}
