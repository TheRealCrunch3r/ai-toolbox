import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { RecodeRule } from '../recodeTypes.js';

interface TypeSuggestion {
  kind: 'variable' | 'parameter' | 'return';
  originalType: string;
  suggestedType: string;
  line?: number;
}

/** Check if a TS annotation is `any` (handles both TSAnyKeyword and TSTypeReference to any) */
function isAnyType(ann: t.TSType): boolean {
  // Direct any keyword
  if (t.isTSAnyKeyword(ann)) return true;
  
  // Type reference to 'any'
  if (t.isTSTypeReference(ann)) {
    const typeName = ann.typeName;
    return t.isIdentifier(typeName) && typeName.name === 'any';
  }
  
  return false;
}

/** Safely get the inner type from a TS annotation node */
function unwrapTypeAnnotation(ann: t.Noop | t.TSTypeAnnotation | t.TypeAnnotation): t.TSType | null {
  if (!t.isTSTypeAnnotation(ann)) return null;
  return ann.typeAnnotation;
}

/** Check if a TS annotation node is `any` */
function isAnyAnnotation(ann: t.Noop | t.TSTypeAnnotation | t.TypeAnnotation): boolean {
  const inner = unwrapTypeAnnotation(ann);
  return inner !== null && isAnyType(inner);
}

/**
 * Type Inference / Annotation Fixes Rule (Tier 1)
 * 
 * Identifies explicit `any` annotations and suggests better types or placeholders.
 * Examples:
 * - const x: any = "hello" -> const x: string
 * - function foo(x: any): void -> function foo(x: unknown): void
 */
export const typeInferenceRule: RecodeRule = async (ctx) => {
  const { ast } = ctx;

  const suggestions: TypeSuggestion[] = [];

  traverse(ast, {
    // Check variable declarations with explicit any type
    VariableDeclarator(pathNode) {
      if (!t.isIdentifier(pathNode.node.id)) return;
      
      const idTypeAnnotation = pathNode.node.id.typeAnnotation;
      if (!idTypeAnnotation || !isAnyAnnotation(idTypeAnnotation)) return;

      // Try to infer better type from initializer
      let suggested: string = 'unknown';
      if (pathNode.node.init) {
        switch (pathNode.node.init.type) {
          case 'StringLiteral': suggested = 'string'; break;
          case 'NumericLiteral': suggested = 'number'; break;
          case 'BooleanLiteral': suggested = 'boolean'; break;
          case 'ObjectExpression': suggested = 'Record<string, any>'; break;
          case 'ArrayExpression': suggested = 'any[]'; break;
        }
      }
      
      suggestions.push({ 
        kind: 'variable', 
        originalType: 'any', 
        suggestedType: suggested,
        line: pathNode.node.loc?.start.line
      });
    },

    // Check function parameters and return types
    FunctionDeclaration(pathNode) {
      checkFunctionAnnotations(pathNode.node, suggestions);
    },
    ArrowFunctionExpression(pathNode) {
      checkFunctionAnnotations(pathNode.node, suggestions);
    },
    FunctionExpression(pathNode) {
      checkFunctionAnnotations(pathNode.node, suggestions);
    },
  });

  return { 
    success: true, 
    message: suggestions.length > 0 ? `Found ${suggestions.length} instance(s) of explicit 'any' type that could be improved.` : 'No obvious opportunities for type inference found.',
    data: { typeSuggestions: suggestions }
  };
};

function checkFunctionAnnotations(
  funcNode: t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression, 
  suggestions: TypeSuggestion[]
): void {
  // Check parameters
  const params = funcNode.params;
  for (const param of params) {
    if (!t.isIdentifier(param)) continue;
    
    const paramTypeAnnotation = param.typeAnnotation;
    if (!paramTypeAnnotation || !isAnyAnnotation(paramTypeAnnotation)) continue;

    suggestions.push({ kind: 'parameter', originalType: 'any', suggestedType: 'unknown' });
  }

  // Check return type
  const returnType = funcNode.returnType;
  if (returnType && isAnyAnnotation(returnType)) {
    suggestions.push({ kind: 'return', originalType: 'any', suggestedType: 'unknown' });
  }
}
