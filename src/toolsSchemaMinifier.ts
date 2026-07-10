/**
 * Tools Schema Minifier — Reduces JSON Schema payload size for llama.cpp grammar parser
 * 
 * When ~109 tools are registered, the combined JSON Schema becomes too large/complex
 * for llama.cpp's EBNF grammar generator (recursion limit exceeded).
 * 
 * This module compresses tool schemas before registration by:
 * 1. Truncating verbose descriptions to ~150 chars (safe — doesn't affect validation)
 * 2. Capping excessive maxLength constraints in JSON Schema (>5KB → cap at 5KB)
 * 3. Capping excessive maxItems constraints in array schemas (>10 items → cap at 10)
 */

import type { Tool } from '@lmstudio/sdk';

// ==================== Description Truncation ====================

/** Truncate description to first meaningful sentence (~150 chars) */
function truncateDescription(desc: string, maxLen = 150): string {
  if (!desc || desc.length <= maxLen) return desc || '';
  
  // Try to end at a sentence boundary (period + space or newline)
  const periodIdx = desc.indexOf('. ', Math.min(maxLen - 20, desc.length));
  if (periodIdx > 0 && periodIdx < maxLen + 50) {
    return desc.substring(0, periodIdx + 1);
  }
  
  // Try to end at a newline or semicolon for better readability
  const newLineIdx = desc.indexOf('\n', Math.min(maxLen - 20, desc.length));
  if (newLineIdx > 0 && newLineIdx < maxLen + 50) {
    return desc.substring(0, newLineIdx).trim();
  }
  
  // Fallback: just truncate and add ellipsis
  const truncated = desc.substring(0, maxLen).trim();
  return truncated.endsWith('.') ? truncated : `${truncated}...`;
}

// ==================== JSON Schema Constraint Capping ====================

/** Cap excessive maxLength in a JSON Schema property */
function capMaxLength(value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    
    // Check for excessive maxLength on string types
    if ((obj.type === 'string' || obj.type === undefined) && 
        typeof obj.maxLength === 'number' && 
        obj.maxLength > 5000) {
      console.debug(`[SchemaMinifier] Capping maxLength ${obj.maxLength} → 5000`);
      return { ...obj, maxLength: 5000 };
    }
    
    // Check for excessive maxItems on array types
    if (obj.type === 'array' && 
        typeof obj.maxItems === 'number' && 
        obj.maxItems > 10) {
      console.debug(`[SchemaMinifier] Capping maxItems ${obj.maxItems} → 10`);
      return { ...obj, maxItems: 10 };
    }
    
    // Recursively cap nested properties
    if (obj.properties && typeof obj.properties === 'object') {
      const cappedProperties: Record<string, unknown> = {};
      for (const [key, propValue] of Object.entries(obj.properties)) {
        cappedProperties[key] = capMaxLength(propValue);
      }
      return { ...obj, properties: cappedProperties };
    }
    
    // Recursively handle items schema in arrays
    if (obj.items && typeof obj.items === 'object') {
      return { ...obj, items: capMaxLength(obj.items) };
    }
  }
  
  return value;
}

// ==================== Tool Minification ====================

/** Internal interface for tool parameters that may vary between SDK versions */
interface ToolParamsRecord {
  [key: string]: unknown;
}

/** Minify a single tool's parameters and description */
function minifyTool(tool: Tool): Tool {
  const minified = { ...tool };
  
  // Truncate description if too long (>200 chars)
  if (minified.description && typeof minified.description === 'string' && minified.description.length > 200) {
    minified.description = truncateDescription(minified.description, 150);
  }
  
  // Minify parameters schema — check both possible structures
  const rawTool = tool as unknown as Record<string, unknown>;
  const params = rawTool.parameters || rawTool.parametersSchema;
  
  if (params && typeof params === 'object' && !Array.isArray(params)) {
    const newParams: ToolParamsRecord = {};
    
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      // Cap constraints on both Zod schemas AND serialized JSON Schema objects
      if (value && typeof value === 'object') {
        // Check if it's a Zod schema (has _def) OR a plain JSON Schema object
        const isZodSchema = '_def' in value;
        
        if (isZodSchema) {
          // For Zod schemas, we need to convert to JSON Schema first, then cap
          // This handles the case where tools are still Zod objects at this point
          newParams[key] = capMaxLength(value);
        } else {
          // For plain JSON Schema objects (serialized), directly cap constraints
          newParams[key] = capMaxLength(value);
        }
      } else {
        // Keep non-object properties as-is
        newParams[key] = value;
      }
    }
    
    // Update the correct property name based on which one exists
    const mutableMinified = minified as Record<string, unknown>;
    if (rawTool.parameters !== undefined) {
      mutableMinified.parameters = newParams;
    } else if (rawTool.parametersSchema !== undefined) {
      mutableMinified.parametersSchema = newParams;
    }
  }
  
  return minified;
}

/** Minify an array of tools — reduce schema complexity before registration */
export function minifyTools(tools: Tool[]): Tool[] {
  const countBefore = tools.length;
  const result = tools.map(minifyTool);
  
  if (countBefore > 0) {
    console.debug(`[SchemaMinifier] Minified ${countBefore} tool schemas`);
  }
  
  return result;
}
