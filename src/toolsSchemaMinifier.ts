/**
 * Tools Schema Minifier — Reduces JSON Schema payload size for llama.cpp grammar parser
 * 
 * When ~109 tools are registered, the combined JSON Schema becomes too large/complex
 * for llama.cpp's EBNF grammar generator (recursion limit exceeded).
 * 
 * This module compresses tool schemas before registration by:
 * 1. Truncating verbose descriptions (>200 chars) to ~150 chars at a sentence boundary (safe — doesn't affect validation)
 * 2. Capping excessive maxLength constraints in JSON Schema (>2000 → cap at 2000, per llama.cpp PR #17381 repetition-bound limit)
 * 3. Capping excessive maxItems constraints in array schemas (>2000 → cap at 2000, same PR); recurses into nested properties/items
 * 4. Truncating property-level describes (>80 chars) to ~80 at a sentence boundary (Lever 1, 08.10 wire-payload arc —
 *    both per-field Zod v3 instances and serialized JSON Schema; safe — doesn't affect validation)
 */

import type { Tool } from '@lmstudio/sdk';

/** Property-level describe cap — Lever 1 (08.10 wire-payload arc): 218 property fields averaged ~71 wire-chars of
 * description (49 fields ≥ 90); truncating at this bound targets the long tail with a sentence-boundary preference,
 * same provenance class as tool-level truncateDescription() — describes never affect schema validation. */
const PROPERTY_DESCRIBE_MAX = 80;

/** Depth cap for the shared-schema walk (tools' schemas are flat-ish: wrapper → core → items/fields). */
const DESCRIBE_WALK_DEPTH = 8;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** One pass over every reachable node of a parameter schema (plain JSON Schema or Zod v3 instance) truncating any
 * `description` longer than PROPERTY_DESCRIBE_MAX at the first sentence boundary. Idempotent: a second pass finds
 * nothing above the cap, so in-place mutation of shared module-level zod schemas is safe across re-registrations. */
function truncatePropertyDescribes(node: unknown, depth: number, seen: Set<object>): void {
  if (depth > DESCRIBE_WALK_DEPTH || !isPlainObject(node) || seen.has(node)) return;
  seen.add(node);

  // Live Zod v3 instances: `.description` is a GETTER-ONLY accessor on ZodType.prototype (reads `_def.description`)
  // — assigning to it throws in strict mode, so the truncation lands on the backing def object instead. That keeps
  // instance identity intact for shared module-level schemas and the getter picks the value up at host serialization.
  const def = node._def;

  const desc = node.description;
  if (typeof desc === 'string' && desc.length > PROPERTY_DESCRIBE_MAX) {
    const truncated = truncateDescription(desc, PROPERTY_DESCRIBE_MAX);
    if (isPlainObject(def)) {
      def.description = truncated; // Zod v3: reflected through the getter-only accessor (verified against zod ^3.25)
    } else {
      node.description = truncated; // serialized JSON Schema object: ordinary own property
    }
  }

  // Plain JSON Schema recursion (serialized parameters). `properties`/`items` are schema children; a node WITHOUT a
  // 'type' key cannot be a schema itself (zod v3 serialization always emits one) — treat such records as
  // properties-map containers and walk their values.
  if (isPlainObject(node.properties)) {
    for (const value of Object.values(node.properties)) truncatePropertyDescribes(value, depth + 1, seen);
  } else if (!('type' in node) && !isPlainObject(node._def)) {
    // No 'type' key AND no Zod `_def` → not a schema itself (zod v3 serialization always emits type; live instances
    // carry _def): this is a properties-map container — walk its values.
    for (const value of Object.values(node)) truncatePropertyDescribes(value, depth + 1, seen);
  }
  if (isPlainObject(node.items)) truncatePropertyDescribes(node.items, depth + 1, seen);

  // Zod v3 internals: _def.schema (effects), _def.innerType (optional/default/nullable wrappers),
  // _def.options[0] (union first member — `types` was a misremembered key, zod ^3.25 verified), _def.type (array
  // element schema) and _def.shape() (ZodObject field record: per-field instances nested in z.object params).
  if (isPlainObject(def)) {
    for (const key of ['schema', 'innerType', 'type']) {
      const inner = def[key];
      if (isPlainObject(inner)) truncatePropertyDescribes(inner, depth + 1, seen);
    }
    for (const key of ['options', 'types']) {
      if (Array.isArray(def[key]) && isPlainObject(def[key][0])) {
        truncatePropertyDescribes(def[key][0], depth + 1, seen);
      }
    }
    const shape = def.shape;
    if (typeof shape === 'function') {
      try {
        const fields = (shape as () => unknown)();
        if (isPlainObject(fields)) {
          for (const value of Object.values(fields)) truncatePropertyDescribes(value, depth + 1, seen);
        }
      } catch {
        // shape() must not throw on well-formed v3 schemas; skip defensively rather than break registration.
      }
    }
  }
}

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
    
    // llama.cpp PR #17381 enforces a hard limit of 2000 on repetition bounds
    if ((obj.type === 'string' || obj.type === undefined) && 
        typeof obj.maxLength === 'number' && 
        obj.maxLength > 2000) {
      console.debug(`[SchemaMinifier] Capping maxLength ${obj.maxLength} → 2000`);
      return { ...obj, maxLength: 2000 };
    }
    
    // llama.cpp PR #17381 enforces a hard limit of 2000 on repetition bounds
    if (obj.type === 'array' && 
        typeof obj.maxItems === 'number' && 
        obj.maxItems > 2000) {
      console.debug(`[SchemaMinifier] Capping maxItems ${obj.maxItems} → 2000`);
      return { ...obj, items: capMaxLength(obj.items) };
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

/** LIVE ROOT ZODOBJECT guard — distinguishes the SDK production form (a single z.object(rawShape) instance passed as
 * the whole `parameters`/`parametersSchema`) from a per-field shape record ({ field: schema, ... }) and a serialized
 * { type:'object', properties } object. Discriminators live on the DEF record, not the instance: v3 instances expose NO
 * own `typeName` (verified empirically against zod 3.25.76 — instance own-enumerable keys are ~29 ctor props: bound
 * methods + `_def`/`_cached`; an initial version of this guard read instance.typeName and silently no-oped, which is
 * exactly the class of bug Lever 1 exists to kill). Only ZodObject defs carry `typeName === 'ZodObject'` AND a
 * `_def.shape` function (zod ^3.25 verified); both checks are required. */
function isLiveZodObjectRoot(record: Record<string, unknown>): boolean {
  const def = record._def;
  if (!isPlainObject(def) || def.typeName !== 'ZodObject') return false;
  return typeof def.shape === 'function';
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
    const paramRecord = params as Record<string, unknown>;
    let newParams: ToolParamsRecord = {};

    // Serialized ROOT layout ({ type:'object', properties:{...} }): entries are schema members, not field schemas —
    // walk + cap the record as ONE node so nested describes and constraint caps reach every depth. The per-field
    // shape (the live production form) keeps entry-wise processing below.
    if (paramRecord.type === 'object' && isPlainObject(paramRecord.properties)) {
      truncatePropertyDescribes(params, 0, new Set());
      // capMaxLength() then caps the nested serialized-form constraints (no-op on live Zod objects).
      newParams = capMaxLength(params) as ToolParamsRecord;
    } else if (isLiveZodObjectRoot(paramRecord)) {
      // LIVE ROOT ZODOBJECT — the SDK tool() production form (@lmstudio/sdk/dist/index.mjs ~L11353 stores
      // parametersSchema = z.object(rawShape)). v3 ZodObject instances have NO own .type/.properties, so the
      // serialized check above can never match them and the per-entry fallback below would iterate ~25 ctor props
      // without ever opening _def.shape() → zero truncation (08.10 wire-harness round: exactly-zero delta on 37k
      // param chars, forensics memory_1791481751431). Walk + cap the root as ONE node instead — the shared walk's
      // _def.shape() call then reaches every field instance. Same pass-through contract as the serialized-root
      // branch: describes mutate in place on shared module-level schemas; newParams reuses the SAME object, so
      // only the tool wrapper is copied (byte-stable for everything else).
      truncatePropertyDescribes(params, 0, new Set());
      // capMaxLength() is a no-op on live Zod objects by construction (bonus finding stays out of Lever-1 scope).
      newParams = params as ToolParamsRecord;
    } else {
    
    for (const [key, value] of Object.entries(paramRecord)) {
      // Cap constraints on both Zod schemas AND serialized JSON Schema objects
      if (value && typeof value === 'object') {
        
        // Lever 1 (08.10 wire-payload arc): truncate property-level describes on BOTH shapes — per-field Zod v3
        // instances (host serializes to JSON Schema at registration; no zodToJsonSchema call exists in src/) and
        // serialized JSON Schema objects. Only `description` values are ever mutated (on `_def.description` for live
        // Zod instances), so validation behavior is untouched by construction; idempotent across re-registrations of
        // shared module-level schemas.
        truncatePropertyDescribes(value, 0, new Set());
        // capMaxLength() then caps the serialized-form constraints (no-op on live Zod objects).
        newParams[key] = capMaxLength(value);
      } else {
        // Keep non-object properties as-is
        newParams[key] = value;
      }
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
