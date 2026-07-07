/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import traverse from '@babel/traverse';
import generator from '@babel/generator';
import type { RecodeRule } from '../recodeTypes.js';

export const unusedImportsRule: RecodeRule = async (ctx) => {
  const { ast, content } = ctx;
  
  const importsToCheck: Array<{ name: string; importedName: string; isTypeOnly: boolean }> = [];
  const usedIdentifiers = new Set<string>();

  // 1. Collect Imports
  traverse(ast as any, {
    ImportDeclaration(path) {
      const decl = path.node as any;
      decl.specifiers.forEach((specifier: any) => {
        if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportSpecifier') {
          importsToCheck.push({ name: specifier.local.name, importedName: specifier.imported?.name || 'default', isTypeOnly: decl.importKind === 'type' });
        } else if (specifier.type === 'ImportNamespaceSpecifier') {
          importsToCheck.push({ name: specifier.local.name, importedName: '*', isTypeOnly: decl.importKind === 'type' });
        }
      });
    },
  });

  // 2. Collect Usage (excluding import declarations)
  traverse(ast as any, {
    Identifier(p) {
      if (p.node.name !== 'default') {
        const parent = p.parentPath?.node;
        // Explicitly check for known import specifier types to exclude them from usage
        if (parent && (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier')) {
          return; 
        }
        usedIdentifiers.add(p.node.name);
      }
    },
  });

  const unusedImports = importsToCheck.filter(imp => !usedIdentifiers.has(imp.name));
  
  if (unusedImports.length === 0) {
    return { success: true, message: 'No unused imports found.' };
  }

  // 3. Remove Unused Imports from AST
  const unusedImportNames = new Set(unusedImports.map(u => u.name));
  let removedCount = 0;

  traverse(ast as any, { ImportDeclaration(path) {
    const decl = path.node as any;
    const allUnused = decl.specifiers.every((spec: any) => {
      const localName = spec.local?.name || spec.imported?.name || 'default';
      return unusedImportNames.has(localName);
    });
    
    if (allUnused) { removedCount++; path.remove(); } 
    else {
      decl.specifiers.forEach((spec: any) => {
        const localName = spec.local?.name || spec.imported?.name || 'default';
        if (!usedIdentifiers.has(localName)) { const idx = decl.specifiers.indexOf(spec); if (idx !== -1) decl.specifiers.splice(idx, 1); }
      });
      if (decl.specifiers.length === 0) { removedCount++; path.remove(); }
    }
  }});

  const modifiedContent = generator(ast, { compact: false, comments: true }).code;

  return { 
    success: true, 
    message: `Removed ${removedCount} unused import(s).`, 
    data: { removedCount },
    changes: { original: content, modified: modifiedContent, diff: '(No diff generated)' }
  };
};
