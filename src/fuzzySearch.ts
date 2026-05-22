/**
 * Levenshtein-based fuzzy file search implementation
 */

export interface FuzzyMatchResult {
  filePath: string;
  score: number; // Higher is better match (0-1)
  query: string;
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Calculate match score (normalized, higher is better)
 */
export function calculateMatchScore(query: string, target: string): number {
  const distance = levenshteinDistance(query.toLowerCase(), target.toLowerCase());
  const maxLength = Math.max(query.length, target.length);
  
  if (maxLength === 0) return 1;
  
  // Score: 1 - (distance / max_length), clamped to 0-1
  return Math.max(0, 1 - distance / maxLength);
}

/**
 * Fuzzy search files by path/name similarity
 */
export function fuzzySearchFiles(
  query: string, 
  fileList: string[], 
  maxResults: number = 5
): FuzzyMatchResult[] {
  const results: FuzzyMatchResult[] = [];
  
  for (const filePath of fileList) {
    // Extract filename from path
    const fileName = filePath.split('/').pop() || filePath;
    
    const score = calculateMatchScore(query, fileName);
    
    if (score > 0.3) { // Minimum threshold for meaningful match
      results.push({
        filePath,
        score,
        query,
      });
    }
  }
  
  // Sort by score descending and limit results
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

/**
 * Fuzzy find in-page content/selectors (for browser automation context)
 */
export function fuzzyFindInPageContent(
  query: string, 
  pageText: string[], 
  maxResults: number = 5
): FuzzyMatchResult[] {
  return fuzzySearchFiles(query, pageText, maxResults);
}