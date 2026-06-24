/**
 * File Search Utility — Workaround for grep_files single-file path bug
 * 
 * BUG: grep_files(path="file.ts") fails silently because it treats the file as a directory.
 * FIX: This module provides reliable search across both directories and individual files.
 */

interface SearchResult {
  file: string;
  line_number: number;
  content: string;
}

/** Search within a SINGLE file for pattern matches */
export async function grepFile(filePath: string, pattern: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    // Read the entire file and search line by line
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let regex;
    try {
      regex = new RegExp(pattern, 'i'); // case-insensitive
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid regex pattern '${pattern}': ${msg}`);
    }
    
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        results.push({
          file: filePath,
          line_number: i + 1, // 1-indexed
          content: lines[i].trim(),
        });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to search file ${filePath}: ${message}`);
  }
  
  return results;
}

/** Search across MULTIPLE files in a directory */
export async function grepDir(dirPath: string, pattern: string, includePattern?: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    const fs = await import('fs/promises');
    const pathModule = await import('path');
    
    // Get all files in directory (non-recursive)
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      
      const fullPath = pathModule.join(dirPath, entry.name);
      
      // Apply include filter if provided
      if (includePattern && !entry.name.match(includePattern)) {
        continue;
      }
      
      const matches = await grepFile(fullPath, pattern);
      results.push(...matches);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to search directory ${dirPath}: ${message}`);
  }
  
  return results;
}

/** Unified search — works with both files and directories */
export async function grepSearch(target: string, pattern: string, includePattern?: string): Promise<SearchResult[]> {
  const fs = await import('fs/promises');
  const pathModule = await import('path');

  // Resolve to absolute path relative to current working directory
  const fullPath = pathModule.resolve(target);

  try {
    // Try file read first — this is the common case for single-file searches
    let content: string;
    
    try {
      content = await fs.readFile(fullPath, 'utf-8');
      
      // Search it directly (same logic as grepFile)
      const lines = content.split('\n');
      let regex;
      try {
        regex = new RegExp(pattern, 'i'); // case-insensitive
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Invalid regex pattern '${pattern}': ${msg}`);
      }
      
      const results: SearchResult[] = [];
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          results.push({
            file: fullPath,
            line_number: i + 1, // 1-indexed
            content: lines[i].trim(),
          });
        }
      }
      
      return results;
    } catch (readErr) {
      // File read failed — check if it's a directory instead
      try {
        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        
        // It's a directory — search inside it
        const results: SearchResult[] = [];
        for (const entry of entries) {
          if (!entry.isFile()) continue;
          
          const fileFullPath = pathModule.join(fullPath, entry.name);
          
          if (includePattern && !entry.name.match(includePattern)) {
            continue;
          }
          
          try {
            const matches = await grepFile(fileFullPath, pattern);
            results.push(...matches);
          } catch (innerErr) {
            // Skip files that can't be read (binary, permission issues, etc.)
            console.warn('[grepSearch] Skipping file:', entry.name, '-', innerErr instanceof Error ? innerErr.message : String(innerErr));
          }
        }
        
        return results;
      } catch {
        // Neither file nor directory — throw ENOENT error using readErr from outer scope
        const msg = readErr instanceof Error ? `: ${readErr.message}` : '';
        throw new Error(`Target not found '${target}'${msg}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? `: ${err.message}` : '';
    throw new Error(`Target not found '${target}'${msg}`);
  }

  return [];
}
