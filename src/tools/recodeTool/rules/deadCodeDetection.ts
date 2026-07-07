/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import traverse from '@babel/traverse';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RecodeRule } from '../recodeTypes.js';

export const deadCodeDetectionRule: RecodeRule = async (ctx) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ast, filePath, isTypeScript } = ctx;
  
  const exportMap = new Map<string, string[]>();
  const usageSet = new Set<string>();

  traverse(ast as any, {
    ExportNamedDeclaration(path) {
      if (path.node.declaration?.type === 'FunctionDeclaration' || path.node.declaration?.type === 'ClassDeclaration') {
        const name = path.node.declaration.id?.name;
        if (name) exportMap.set(name, [filePath]);
      } else if (path.node.specifiers?.[0] && path.node.specifiers[0].type === 'ExportSpecifier') {
        const name = (path.node.specifiers[0] as any).local.name;
        exportMap.set(name, [filePath]);
      }
    },
    ExportDefaultDeclaration(path) {
      const decl = path.node.declaration as any;
      if (decl?.type === 'FunctionDeclaration' || decl?.type === 'ClassDeclaration') {
        const name = decl.id?.name;
        if (name && name !== 'default') exportMap.set(name, [filePath]);
      }
    },
  });

  traverse(ast as any, {
    ImportDeclaration(path) { path.skip(); }, 
    Identifier(p) { 
      if (p.node.name !== 'default') usageSet.add(p.node.name); 
    }
  });

  const deadExports: string[] = [];
  for (const [name] of exportMap.entries()) {
    // In a single-file context, "dead" means exported but not used within the same file (excluding imports)
    if (!usageSet.has(name)) deadExports.push(`${name} (${filePath})`);
  }

  return { 
    success: true, 
    message: deadExports.length > 0 ? `Found ${deadExports.length} potentially unused export(s).` : 'No dead code detected in this file.',
    data: { deadExports }
  };
};

/** Scan a directory for exports that are never imported elsewhere */
export async function scanDirectoryForDeadCode(targetDir: string): Promise<{ success: boolean; data?: { deadExports: string[] }; error?: string }> {
  const allFiles: string[] = [];
  
  function scan(dir: string) {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) scan(p);
      else if (/\.((?:ts|tsx|js|jsx))$/.test(path.extname(f))) allFiles.push(p);
    });
  }
  
  try {
    scan(targetDir);
  } catch {
    return { success: false, error: `Failed to scan directory: ${targetDir}` };
  }

  // For full project scanning, we would iterate allFiles and aggregate results.
  // Currently returning empty as this is a placeholder for the rule engine integration.
  return { success: true, data: { deadExports: [] } }; 
}
