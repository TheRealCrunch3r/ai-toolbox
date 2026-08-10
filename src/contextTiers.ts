/**
 * Context Tier Provenance System (graphify-inspired)
 * 
 * Provides typed provenance markers and tier-scoped replacement logic
 * to prevent data loss during incremental context updates.
 * 
 * Inspired by graphify's build_merge pattern: only replace changed tiers,
 * preserve unchanged ones via _origin markers.
 */

// ==================== Tier Provenance Types ====================

/** Data origin — distinguishes raw file content from derived AI insights */
export type ContextOrigin = 'ast' | 'semantic';

/** Extended context entry with provenance tracking */
export interface ContextNode {
  id: string;
  _origin: ContextOrigin;         // "ast" (raw file/AST) or "semantic" (derived insight)
  label?: string;                 // Human-readable label
  source_file?: string;           // Original file path (for ast origin)
  data?: unknown;                 // Payload/data
  timestamp?: number;             // Optional timestamp for ordering
}

/** Generic state entry with optional tier provenance */
export interface TieredStateEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  _origin?: ContextOrigin;        // Optional provenance marker
}

// ==================== Tier-Scoped Replacement Logic ====================

/**
 * Perform tier-scoped replacement of context nodes.
 * 
 * Replaces only the nodes whose origin matches and whose ID exists in newNodes,
 * preserving all other nodes from oldNodes unchanged.
 * 
 * This mimics graphify's build_merge pattern:
 * - oldAst + oldSem → split by _origin
 * - newAst + newSem → split by _origin  
 * - Merge: keep old nodes not replaced, add new nodes for each tier
 * 
 * @param oldNodes — Current context nodes (before update)
 * @param newNodes — Incoming context nodes (update payload)
 * @returns Merged node list with only changed tiers replaced
 */
export function replaceTier(
  oldNodes: ContextNode[],
  newNodes: ContextNode[]
): ContextNode[] {
  // Split by origin tier
  const oldAst = oldNodes.filter(n => n._origin === 'ast');
  const oldSem = oldNodes.filter(n => n._origin === 'semantic');
  
  const newAst = newNodes.filter(n => n._origin === 'ast');
  const newSem = newNodes.filter(n => n._origin === 'semantic');
  
  // Replace only the tier that changed, keep rest intact
  return [
    ...oldAst.filter(a => !newAst.some(n => n.id === a.id)),  // Old AST not replaced
    ...newAst,                                                  // New AST
    ...oldSem.filter(s => !newSem.some(n => n.id === s.id)),  // Old Sem not replaced
    ...newSem                                                   // New Sem
  ];
}

/**
 * Filter context nodes by origin tier.
 */
export function filterByOrigin(nodes: ContextNode[], origin: ContextOrigin): ContextNode[] {
  return nodes.filter(n => n._origin === origin);
}

/**
 * Check if a node exists in the new set (for replacement detection).
 */
export function isReplaced(oldId: string, newNodes: ContextNode[]): boolean {
  return newNodes.some(n => n.id === oldId);
}

// ==================== Utility Functions ====================

/** Generate a provenance-aware ID from source file and label */
export function makeProvenanceId(sourceFile: string, label?: string): string {
  const stem = sourceFile.split('/').pop()?.split('.').shift() || 'unknown';
  return `ctx_${stem}_${label || 'default'}`;
}

/** Create a new context node with default provenance */
export function createContextNode(
  id: string,
  origin: ContextOrigin,
  data: unknown,
  sourceFile?: string,
  label?: string
): ContextNode {
  return {
    id,
    _origin: origin,
    label,
    source_file: sourceFile,
    data,
    timestamp: Date.now(),
  };
}

/** Create an AST-tier node (raw file content) */
export function createAstNode(id: string, data: unknown, sourceFile?: string): ContextNode {
  return createContextNode(id, 'ast', data, sourceFile);
}

/** Create a semantic-tier node (derived insight/AI output) */
export function createSemanticNode(
  id: string, 
  data: unknown, 
  label?: string
): ContextNode {
  return createContextNode(id, 'semantic', data, undefined, label);
}
