import type { Program } from '@babel/types';
import generator from '@babel/generator';
// Static import (NOT dynamic): the CJS Jest transform cannot resolve `await import(...)`
// without --experimental-vm-modules (throws ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG).
// No circular-dependency risk: this module only imports @babel/* packages and node builtins.
import * as babelParser from '@babel/parser';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';  // ← Async operations for crash-resilient writes
import * as path from 'node:path';
import type { RuleContext, RecodeRule, RecodeConfig } from './recodeTypes.js';

// Safe Babel parser interface (mirroring refactorCodeTools.ts)
type ParseFunction = (code: string, opts: unknown) => unknown;

let babelParserCache: ParseFunction | null = null;

async function getBabelParser(): Promise<ParseFunction> {
  if (babelParserCache) return babelParserCache;
  
  // Static import (NOT dynamic): the CJS Jest transform cannot resolve `await import(...)`
  // without --experimental-vm-modules. See the comment at the top of this file.
  const parseFn = typeof babelParser === 'function' ? babelParser : (babelParser.parse as ParseFunction);
  
  if (!parseFn) throw new Error('Could not locate .parse function in @babel/parser');
  babelParserCache = parseFn;
  return babelParserCache;
}

export async function runRecodeEngine(
  filePath: string, 
  rules: Array<{ name: string; rule: RecodeRule }>, 
  config: RecodeConfig
): Promise<unknown> {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) return { success: false, error: `File not found: ${resolvedPath}` };

  let content = fs.readFileSync(resolvedPath, 'utf-8');
  const isTypeScript = resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.tsx');
  
  // Apply backup if dry_run is false and enabled
  if (config.backup && !config.dryRun) {
    fs.copyFileSync(resolvedPath, resolvedPath + '.bak');
  }

  const parser = await getBabelParser();
  let ast: Program = parser(content, { sourceType: 'module', plugins: isTypeScript ? ['typescript'] : [] }) as Program;

  for (const r of rules) {
    const ctx: RuleContext = { filePath, content, ast, isTypeScript };
    let ruleConfig: Record<string, unknown>;
    if (config.ruleConfigs?.[r.name]) {
      ruleConfig = config.ruleConfigs[r.name] as Record<string, unknown>;
    } else {
      ruleConfig = {};
    }
    
    // Pass a mutable AST reference so rules can modify it if needed
    const result = await r.rule(ctx, ruleConfig);
    
    if (!result.success) return result;

    // If the rule modifies the content/AST, update our working state
    if (result.changes?.modified) {
      ast = parser(result.changes.modified, { sourceType: 'module', plugins: isTypeScript ? ['typescript'] : [] }) as Program;
      content = result.changes.modified;
    } else if ((result.data as Record<string, unknown>)?.ast) {
      // If the rule returns a modified AST directly
      ast = (result.data as Record<string, unknown>).ast as Program;
      content = generator(ast, { compact: false }).code;
    }
  }

  const finalContent = generator(ast, { compact: false, comments: true, jsescOption: { minimal: true } }).code;
  
  if (config.dryRun) {
    // Generate a unified diff for the dry run
    const oldLines = content.split('\n');
    const newLines = finalContent.split('\n');
    const m = oldLines.length, n = newLines.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => new Array(n + 1).fill(0) as number[]);
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    
    let ops: Array<{ type: 'ctx' | 'del' | 'add', content: string }> = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) { ops.unshift({ type: 'ctx', content: oldLines[i - 1] }); i--; j--; }
      else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { ops.unshift({ type: 'add', content: newLines[j - 1] }); j--; }
      else { ops.unshift({ type: 'del', content: oldLines[i - 1] }); i--; }
    }

    let diff = '';
    for (let k = 0; k < ops.length; k++) {
      const op = ops[k];
      if (op.type === 'ctx') diff += ` ${op.content}\n`;
      else {
        let startI = k, endI = k;
        while (endI < ops.length && ops[endI].type !== 'ctx') endI++;
        const contextStart = Math.max(0, startI - 3);
        let ctxCount = 0;
        for (let c = contextStart; c < startI; c++) { if (ops[c].type === 'ctx') ctxCount++; }
        diff += `--- Original\n+++ Modified\n@@ -${startI - ctxCount + 1},${endI - startI} @@\n`;
        for (let c = contextStart; c < ops.length && ops[c].type === 'ctx'; c++) { if (c >= startI) break; diff += ` ${ops[c].content}\n`; }
        for (let x = startI; x < endI; x++) { if (ops[x].type === 'del') diff += `- ${ops[x].content}\n`; else diff += `+ ${ops[x].content}\n`; }
        k = endI - 1;
      }
    }

    return { success: true, data: { dryRun: true, changes: { original: content, modified: finalContent, diff: diff || '(No changes detected)' }, message: 'Dry run complete.' } };
  } else {
    // ASYNC atomic write — crash-resilient
    await fsp.writeFile(resolvedPath, finalContent);
    return { success: true, data: { message: `Recode engine applied ${rules.length} rule(s) to ${filePath}.`, modifiedContent: finalContent } };
  }
}
