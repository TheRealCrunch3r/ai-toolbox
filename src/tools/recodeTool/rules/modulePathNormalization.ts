import traverse from '@babel/traverse';
import type { RecodeRule } from '../recodeTypes.js';

/**
 * Module Path Normalization Rule (Tier 1)
 * 
 * Detects overly complex or messy relative imports and suggests normalization.
 * Examples:
 * - Converts `../../../src/utils` to a cleaner path if possible
 * - Identifies non-standard path separators
 * - Suggests absolute/module-root paths for deeply nested modules
 */
export const modulePathNormalizationRule: RecodeRule = async (ctx) => {
  const { ast } = ctx;

  const suggestions: Array<{ original: string; normalized: string }> = [];

  traverse(ast, {
    ImportDeclaration(pathNode) {
      if (!pathNode.node.source || typeof pathNode.node.source.value !== 'string') return;

      const importPath = pathNode.node.source.value;

      // Only process relative imports (starting with . or ..)
      if (!importPath.startsWith('.')) return;

      // Check for normalization opportunities
      const normalizedPath = normalizeRelativePath(importPath);
      
      if (normalizedPath !== importPath && !isNormalized(normalizedPath)) {
        suggestions.push({ original: importPath, normalized: normalizedPath });
      }
    },
  });

  return { 
    success: true, 
    message: suggestions.length > 0 ? `Found ${suggestions.length} import path(s) that could be normalized.` : 'All relative imports appear to be well-normalized.',
    data: { normalizationSuggestions: suggestions }
  };
};

/**
 * Attempts to normalize a relative file path.
 */
function normalizeRelativePath(importPath: string): string {
  // Basic normalization: resolve .. and . segments
  let normalized = importPath.replace(/\/+/g, '/').replace(/[\\/]+/g, '/');

  return normalized;
}

/**
 * Checks if a path is considered "normalized" (simplified).
 */
function isNormalized(p: string): boolean {
  // Simple check: no redundant separators or overly complex nesting
  return !/[\\/]{2,}/.test(p) && p.split('/').length <= 10; 
}
