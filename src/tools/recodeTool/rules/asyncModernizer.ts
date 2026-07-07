import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { RecodeRule } from '../recodeTypes.js';

interface AsyncSuggestion {
  kind: 'callback' | 'promiseChain';
  functionSignature: string;
  line?: number;
}

/** Safely extract the first parameter's name if it matches 'err' */
function isFirstParamErr(params: t.FunctionParameter[]): boolean {
  const p = params[0];
  if (t.isIdentifier(p)) return p.name === 'err';
  if (t.isRestElement(p) && t.isIdentifier(p.argument)) return p.argument.name === 'err';
  return false;
}

/** Check if a callback signature matches Node.js style: `(err, data) => { ... }` */
function isNodeStyleCallback(funcNode: t.FunctionExpression | t.ArrowFunctionExpression): boolean {
  const params = funcNode.params;
  return params.length >= 2 && isFirstParamErr(params);
}

/** Check if a function body contains callback-style error handling */
function hasCallbackErrorHandling(funcNode: t.FunctionExpression | t.ArrowFunctionExpression): boolean {
  let found = false;
  
  traverse(funcNode.body, {
    IfStatement(path) {
      const test = path.node.test;
      if (t.isBinaryExpression(test)) {
        // Check for `if (err)` or `if (!data)` patterns
        if ((test.operator === '==' || test.operator === '===') && 
            t.isNullLiteral(test.right) && t.isIdentifier(test.left)) {
          found = true;
        }
      }
    },
  });
  
  return found;
}

/** Safely get parameter names for display */
function getParamNames(params: t.FunctionParameter[]): string[] {
  const names: string[] = [];
  for (const p of params) {
    if (t.isIdentifier(p)) names.push(p.name);
    else if (t.isRestElement(p)) names.push(`...${(p.argument as t.Identifier).name}`);
    else names.push('');
  }
  return names.filter(Boolean);
}

/**
 * Callback → async/await Conversion Rule (Tier 2)
 * 
 * Identifies callback-style functions that can be modernized to use async/await.
 * Examples:
 * - `(err, data) => { if (err) throw err; handle(data); }` → `async () => { const data = await fetchData(); handle(data); }`
 */
export const asyncModernizerRule: RecodeRule = async (ctx) => {
  const { ast } = ctx;

  const suggestions: AsyncSuggestion[] = [];

  traverse(ast, {
    // Check function expressions and arrow functions for callback patterns
    FunctionExpression(pathNode) {
      if (isNodeStyleCallback(pathNode.node)) {
        if (hasCallbackErrorHandling(pathNode.node)) {
          const paramNames = getParamNames(pathNode.node.params);
          suggestions.push({ 
            kind: 'callback', 
            functionSignature: `(${paramNames.join(', ')}) => ...`,
            line: pathNode.node.loc?.start.line
          });
        }
      }
    },
    ArrowFunctionExpression(pathNode) {
      if (isNodeStyleCallback(pathNode.node)) {
        if (hasCallbackErrorHandling(pathNode.node)) {
          const paramNames = getParamNames(pathNode.node.params);
          suggestions.push({ 
            kind: 'callback', 
            functionSignature: `(${paramNames.join(', ')}) => ...`,
            line: pathNode.node.loc?.start.line
          });
        }
      }
    },

    // Check for Promise `.then()` chains that could be simplified with async/await
    CallExpression(pathNode) {
      const callee = pathNode.node.callee;
      
      if (t.isMemberExpression(callee) && 
          t.isIdentifier(callee.property) && 
          callee.property.name === 'then') {
        
        suggestions.push({ 
          kind: 'promiseChain', 
          functionSignature: `${callee.object.type}().then(...)`,
          line: pathNode.node.loc?.start.line
        });
      }
    },
  });

  return { 
    success: true, 
    message: suggestions.length > 0 ? `Found ${suggestions.length} async/await conversion opportunity(s).` : 'No obvious callback or promise chain patterns found.',
    data: { asyncSuggestions: suggestions }
  };
};
