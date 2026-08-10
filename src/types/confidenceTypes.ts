/**
 * Confidence-Tagged Results — Graphify-Inspired Pattern
 * 
 * This module defines confidence levels and metadata structures for tool execution outputs.
 * Confidence tags indicate result reliability to help users filter/rank results and prevent
 * over-trusting LLM-derived insights.
 * 
 * Design follows graphify_integration_analysis.md Section 1 (Confidence-Tagged Results).
 */

// ==================== Confidence Levels ====================

/**
 * Confidence level for tool execution results.
 * 
 * - EXTRACTED: Direct, deterministic source match or computation
 *   Examples: file reads, grep matches, direct API responses, successful executions
 * 
 * - INFERRED: Semantic relevance, computed values, derived insights
 *   Examples: RAG queries (semantic similarity), heuristic scoring, analysis results
 * 
 * - AMBIGUOUS: Uncertain relationships, low-quality data, fallback paths used
 *   Examples: error conditions with partial data, multiple fallback attempts, ambiguous matches
 */
export type Confidence = 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';

// ==================== Metadata Interface ====================

/**
 * Optional metadata attached to tool execution results for traceability.
 */
export interface ToolResultMetadata {
  /**
   * Confidence level of the result (0-1 scale mapped to enum).
   */
  confidence: Confidence;
  
  /**
   * Provenance identifier indicating source or operation type.
   * Examples: "file:src/utils.ts L42", "rag_query_vector", "grep_files", "context_search"
   */
  provenance?: string;
  
  /**
   * Additional context for the confidence assessment (optional).
   * Example: "Semantic similarity score: 0.73 — moderate relevance"
   */
  note?: string;
}

// ==================== Helper Functions ====================

/**
 * Determine confidence level based on operation type and result quality.
 * 
 * @param operationType - The type of operation being performed
 * @param success - Whether the operation succeeded
 * @param fallbackUsed - Whether a fallback path was used (indicates lower confidence)
 * @returns Confidence level appropriate for the context
 */
export function determineConfidence(
  operationType: 'extraction' | 'inference' | 'execution' | 'search',
  success: boolean,
  fallbackUsed = false
): Confidence {
  if (!success) return 'AMBIGUOUS';
  
  switch (operationType) {
    case 'extraction':
      // Direct file reads, grep matches — deterministic
      return fallbackUsed ? 'AMBIGUOUS' : 'EXTRACTED';
    
    case 'inference':
      // Semantic queries, heuristic scoring — derived insights
      return 'INFERRED';
    
    case 'execution':
      // Tool execution results — direct when successful
      return fallbackUsed ? 'AMBIGUOUS' : 'EXTRACTED';
    
    case 'search':
      // Context search with scoring — inferred relevance
      return 'INFERRED';
  }
}

/**
 * Create a complete tool result object with confidence metadata.
 * 
 * @param data - The main result data
 * @param confidence - Confidence level
 * @param provenance - Provenance identifier (optional)
 * @param note - Additional context (optional)
 */
export function createToolResult<T>(
  data: T,
  confidence: Confidence,
  options?: { provenance?: string; note?: string }
): { success: true; data: T & ToolResultMetadata } {
  return {
    success: true,
    data: {
      ...data,
      confidence,
      ...(options?.provenance ? { provenance: options.provenance } : {}),
      ...(options?.note ? { note: options.note } : {}),
    },
  };
}

/**
 * Create an error result with AMBIGUOUS confidence.
 */
export function createErrorResult(message: string, provenance?: string): { success: false; error: string; data: ToolResultMetadata } {
  return {
    success: false,
    error: message,
    data: {
      confidence: 'AMBIGUOUS',
      provenance: provenance || 'error',
    },
  };
}
