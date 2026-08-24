/**
 * Performance Utilities for AI Toolbox Plugin
 * Optimized algorithms with early exit, caching, and async operations
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// ==================== Levenshtein Distance with Early Exit ====================

/**
 * Optimized Levenshtein distance calculation with early exit threshold.
 * Stops calculating if the minimum possible score drops below the threshold.
 * 
 * @param a - First string
 * @param b - Second string  
 * @param minScore - Minimum acceptable similarity score (0-1). Results below this are pruned early.
 * @returns Similarity score between 0 and 1, or null if below threshold
 */
export function levenshteinSimilarity(a: string, b: string, minScore: number = 0.3): number | null {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  // Quick rejection: if strings differ too much in length, skip expensive calculation
  const lenDiff = Math.abs(a.length - b.length);
  if (lenDiff / maxLen > (1 - minScore)) {
    return null; // Early exit for very different lengths
  }

  // Use two-row optimization instead of full matrix (saves memory)
  let prevRow: number[] = [];
  for (let i = 0; i <= b.length; i++) {
    prevRow.push(0);
  }
  let currRow: number[] = [];

  for (let i = 0; i <= b.length; i++) {
    prevRow[i] = i;
  }

  for (let i = 1; i <= a.length; i++) {
    currRow[0] = i;
    
    // Early exit optimization: if current row's minimum exceeds threshold, abort
    let minInRow = i;
    
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,         // deletion
        currRow[j - 1] + 1,     // insertion  
        prevRow[j - 1] + cost   // substitution
      );
      
      if (currRow[j] < minInRow) {
        minInRow = currRow[j];
      }
    }

    // Early exit: if minimum in this row already exceeds threshold, abort
    const currentMaxScore = 1 - minInRow / maxLen;
    if (currentMaxScore < minScore) {
      return null;
    }

    // Swap rows
    [prevRow, currRow] = [currRow, prevRow];
  }

  const distance = prevRow[b.length];
  const score = Math.max(0, 1 - distance / maxLen);
  return score >= minScore ? score : null;
}

// ==================== Fuzzy Search Cache ====================

interface FuzzySearchCacheEntry {
  results: Array<{ filePath: string; score: number }>;
  timestamp: number;
}

const fuzzySearchCache = new Map<string, FuzzySearchCacheEntry>();
const CACHE_TTL_MS = 60_000; // 60 second cache TTL

// 🔹 P3 Optimization #3: Enforce hard LRU size cap to prevent unbounded memory growth
const MAX_FUZZY_CACHE_SIZE = 100;
function evictOldestFuzzyCache(): void {
  while (fuzzySearchCache.size > MAX_FUZZY_CACHE_SIZE) {
    const firstKey = fuzzySearchCache.keys().next().value;
    if (firstKey !== undefined) fuzzySearchCache.delete(firstKey);
    else break;
  }
}

/**
 * Get cached fuzzy search results if available and not expired.
 */
export function getCachedFuzzyResults(query: string, basePath: string): Array<{ filePath: string; score: number }> | null {
  const cacheKey = `${query}:${basePath}`;
  const entry = fuzzySearchCache.get(cacheKey);
  
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    fuzzySearchCache.delete(cacheKey);
    return null;
  }
  
  return entry.results;
}

/**
 * Cache fuzzy search results (LRU eviction).
 */
export function cacheFuzzyResults(query: string, basePath: string, results: Array<{ filePath: string; score: number }>): void {
  const cacheKey = `${query}:${basePath}`;
  
  // Move to end (most recently used) — Map preserves insertion order!
  fuzzySearchCache.delete(cacheKey); // Remove if exists
  fuzzySearchCache.set(cacheKey, {
    results,
    timestamp: Date.now(),
  }); // Insert at end
  
  // Evict oldest entries (front of Map) if over limit
  evictOldestFuzzyCache();
}

// ==================== Request Caching for Web Research ====================

interface SearchResult {
  files: string[];
  count: number;
}

/**
 * Recursively search for files matching a pattern using async/await with concurrency control.
 * Much faster than synchronous readdirSync for large directory trees.
 * Automatically excludes large/bloat directories (node_modules, .git, etc.) to save tokens.
 */
export async function findFilesAsync(
  dirPath: string,
  pattern: string,
  maxDepth: number = 5,
  concurrencyLimit: number = 4
): Promise<SearchResult> {
  const results: string[] = [];
  const patternLower = pattern.toLowerCase();

  // TOKEN-SAVING: Default excluded directories (large/bloat that wastes tokens)
  const DEFAULT_EXCLUDED = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '__pycache__', '.cache', 'vendor']);

  async function searchDir(currentPath: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      // Process files immediately
      for (const entry of entries) {
        if (entry.isFile() && entry.name.toLowerCase().includes(patternLower)) {
          results.push(path.join(currentPath, entry.name));
        }
      }

      // Collect subdirectories for parallel processing — TOKEN-SAVING: exclude large dirs
      const subdirs = entries
        .filter(e => e.isDirectory() && !DEFAULT_EXCLUDED.has(e.name) && !e.name.startsWith('.'))
        .map(e => path.join(currentPath, e.name));
      
      if (subdirs.length > 0) {
        // Process directories in batches to avoid overwhelming the system
        const batches: string[][] = [];
        for (let i = 0; i < subdirs.length; i += concurrencyLimit) {
          batches.push(subdirs.slice(i, i + concurrencyLimit));
        }

        for (const batch of batches) {
          await Promise.all(
            batch.map(dir => searchDir(dir, depth + 1))
          );
        }
      }
    } catch {
      // Skip inaccessible directories silently
    }
  }

  await searchDir(dirPath, 0);
  return { files: results, count: results.length };
}

// ==================== Streaming File Reader ====================

interface StreamReadResult {
  success: boolean;
  data?: {
    content: string;
    path: string;
    totalLength: number;
    truncated?: boolean;
    note?: string;
  };
  error?: string;
}

/**
 * Read file content using streaming to avoid loading entire file into memory.
 * Respects max_length parameter by reading only necessary chunks.
 */
export async function readFileSync(
  filePath: string,
  maxLength: number = 5000
): Promise<StreamReadResult> {
  try {
    // Get file stats first to know total size
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      return { success: false, error: 'Path is a directory, not a file' };
    }

    // If file is small enough, read entirely (faster for small files)
    if (stats.size <= maxLength * 2) { // 2x factor for UTF-8 encoding overhead
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        success: true,
        data: {
          content,
          path: filePath,
          totalLength: content.length,
        },
      };
    }

    // For large files, use streaming read
    const { createReadStream } = await import('fs');
    
    return new Promise((resolve) => {
      let content = '';
      let bytesRead = 0;
      const stream = createReadStream(filePath, { 
        encoding: 'utf-8',
        highWaterMark: 64 * 1024 // 64KB chunks for better performance
      });

      stream.on('data', (chunk: Buffer | string) => {
        const chunkStr = typeof chunk === 'string' ? chunk : chunk.toString();
        bytesRead += chunkStr.length;
        
        // Only accumulate if we haven't exceeded max length yet
        if (content.length + chunkStr.length <= maxLength) {
          content += chunkStr;
        } else {
          // Take only what fits and stop reading
          const remaining = maxLength - content.length;
          if (remaining > 0) {
            content += chunkStr.substring(0, remaining);
          }
          stream.destroy(); // Stop the stream early
        }
      });

      stream.on('end', () => {
        const isTruncated = bytesRead > maxLength || stats.size > maxLength;
        
        resolve({
          success: true,
          data: {
            content,
            path: filePath,
            totalLength: Math.max(bytesRead, content.length),
            ...(isTruncated && { 
              truncated: true, 
              note: `Output truncated to ${maxLength} characters. Use max_length parameter to read more.` 
            }),
          },
        });
      });

      stream.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to read file: ${message}` };
  }
}

// ==================== Request Caching for Web Research ====================

interface CachedResponse {
  data: unknown;
  timestamp: number;
  status: number;
}

const requestCache = new Map<string, CachedResponse>();
const REQUEST_CACHE_TTL_MS = 30_000; // 30 second cache TTL for search results

// 🔹 P3 Optimization #3: Enforce hard LRU size cap to prevent unbounded memory growth
const MAX_REQUEST_CACHE_SIZE = 50;
function evictOldestRequestCache(): void {
  while (requestCache.size > MAX_REQUEST_CACHE_SIZE) {
    const firstKey = requestCache.keys().next().value;
    if (firstKey !== undefined) requestCache.delete(firstKey);
    else break;
  }
}

/** Clear request cache (for testing) */
export function clearRequestCache(): void {
  requestCache.clear();
}

/**
 * Fetch with caching to avoid redundant network requests.
 */
export async function fetchWithCache(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  
  // Check cache first (GET requests only)
  if (options?.method !== 'POST') {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < REQUEST_CACHE_TTL_MS) {
      // Return a Response-like object from cache
      return new Response(JSON.stringify(cached.data), {
        status: cached.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const response = await fetch(url, options);
  
  // Cache successful responses (GET only)
  if (response.ok && options?.method !== 'POST') {
    try {
      // ✅ OOM GUARD: gate on the declared Content-Type BEFORE touching any stream. Previously .json() was
      // attempted on every ok response — for HTML pages fetch reads the ENTIRE cloned body into memory before
      // JSON.parse throws (spec-mandated text read), silently allocating a second full-size copy of large pages.
      const ctype = response.headers.get('content-type') ?? '';
      if (!/application\/json/.test(ctype)) return response;

      // ✅ FIX: Clone before reading to preserve the original stream for the caller
      const clonedResponse = response.clone();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Response.json() returns Promise<any>, safely cast to unknown for caching
      const data = await clonedResponse.json();

      requestCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        status: response.status,
      });
      // Enforce LRU size cap after adding new entry
      evictOldestRequestCache();
    } catch {
      // Non-JSON responses are not cached (safe to ignore)
    }

  }

  return response;
}

// ==================== Bounded Body Reading (OOM Guard) ====================

/** Per-attempt timeout for web fetches — matches the 30 s convention used by http_* tools. */
export const WEB_FETCH_TIMEOUT_MS = 30_000;

/**
 * Read a response body as text while enforcing a hard character budget DURING transfer.
 *
 * Why: `await response.text()` materializes the ENTIRE body before any size check can run, so an
 * oversized page allocates its full size into the heap first — the cap would only fire after the
 * damage (observed as "Ineffective mark-compacts near heap limit" in LM Studio dev log 2026-08-24).
 * This reader streams instead and cancels the socket the moment the budget is exceeded.
 *
 * @param response   The Response to read (body stream must be unconsumed)
 * @param maxChars   Hard character budget for the decoded text. The Content-Length fast path compares
 *                   against the compressed wire size, which is always <= expanded size — a safe direction.
 * @throws Error     When declared or streamed size exceeds the budget, or on stream failure
 */
export async function readBoundedText(response: Response, maxChars: number): Promise<string> {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > 0 && contentLength > maxChars) {
    await response.body?.cancel().catch(() => {}); // Release the socket without reading anything
    throw new Error(
      `Page too large (${(contentLength / 1024).toFixed(1)} KB declared). Max allowed is ${maxChars / 1024} KB.`,
    );
  }

  if (!response.body) {
    return ''; // Edge case: non-streamable body (e.g., some cached/mock responses)
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let out = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      out += decoder.decode(value, { stream: true });
      if (out.length > maxChars) {
        throw new Error(
          `Page too large (> ${(maxChars / 1024).toFixed(1)} KB streamed). Max allowed is ${maxChars / 1024} KB.`,
        );
      }
    }
    return out + decoder.decode(); // Flush any final partial UTF-8 sequence
  } finally {
    await reader.cancel().catch(() => {}); // Releases the socket early on both success and error paths
  }
}

/**
 * Read a response body as text up to a hard character budget WITHOUT throwing on size.
 * Stops reading at the budget and cancels the socket — used where PARTIAL content is still
 * useful (search-engine result pages: the first N characters contain the top results even if
 * the page is truncated). For "fail loudly" behavior use readBoundedText() instead.
 *
 * @param response   The Response to read (body stream must be unconsumed)
 * @param maxChars   Maximum decoded characters to accumulate
 */
export async function readCappedText(response: Response, maxChars: number): Promise<string> {
  if (!response.body) return ''; // Edge case: non-streamable body (e.g., some cached/mock responses)

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let out = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      out += decoder.decode(value, { stream: true });
      if (out.length >= maxChars) break; // Budget reached — stop, discard the rest
    }
    return out.slice(0, maxChars);
  } finally {
    await reader.cancel().catch(() => {}); // Releases the socket on both success and error paths
  }
}

// ==================== Heap Pressure Watchdog (OOM Attribution) ====================

/** Log threshold: when heap usage crosses this before a tool call starts, flag that tool as suspect. */
const HEAP_WARN_BYTES = 1024 * 1024 * 1024; // 1 GB — crashes were observed at ~4 GB (V8 default old-space limit)

let heapWarnEmitted = false;

/**
 * Pre-tool-call heap probe. Called from the toolsProvider wrapper BEFORE every tool executes.
 * If the heap is already near the V8 wall when a call STARTS, that call (or its in-flight
 * network read) is the prime suspect for the next OOM — this line lands in the log immediately
 * before any crash, making attribution possible without attaching a debugger.
 * Best-effort: never throws, never delays tool execution measurably.
 */
export function checkHeapPressure(toolName: string): void {
  try {
    const mu = process.memoryUsage();
    if (!heapWarnEmitted && mu.heapUsed > HEAP_WARN_BYTES) {
      heapWarnEmitted = true;
      console.error(
        `[HEAP-GUARD] ⚠️ ${(mu.heapUsed / 1048576).toFixed(0)} MB heap in use BEFORE "${toolName}" started — ` +
        'this call is now the prime suspect for an OOM window (V8 aborts near ~4 GB). ' +
        'Check the DELTA lines above for what ran just before.',
      );
    }
  } catch {
    // Non-fatal by design: measurement must never break a tool call.
  }
}

/**
 * Retry logic with exponential backoff for failed requests.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      let response: Response;
      if (options?.signal) {
        // Caller manages cancellation — respect their signal as-is.
        response = await fetchWithCache(url, options);
      } else {
        // OOM/latency guard: bound every attempt by WEB_FETCH_TIMEOUT_MS (previously unbounded).
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort(new Error(`Web fetch timed out after ${WEB_FETCH_TIMEOUT_MS} ms`));
        }, WEB_FETCH_TIMEOUT_MS);
        try {
          response = await fetchWithCache(url, { ...options, signal: controller.signal });
        } finally {
          clearTimeout(timeoutId);
        }
      }
      
      if (!response.ok && response.status >= 500) {
        // Server error - retry
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError || new Error(`Request failed after ${maxRetries} retries`);
}

// ==================== Subprocess Timeout Calculator ====================

/**
 * Calculate appropriate timeout based on project size.
 * Larger projects need more time for analysis tools.
 */
export function getAnalysisTimeout(baseTimeoutMs: number, fileCount?: number): number {
  if (!fileCount) return baseTimeoutMs;
  
  // Scale timeout logarithmically with file count
  const scaleFactor = Math.log2(Math.max(1, fileCount)) / 10; // ~1x for 1-10 files, ~2x for 1000+ files
  const scaledTimeout = baseTimeoutMs * (1 + scaleFactor);
  
  // Cap at 60 seconds maximum
  return Math.min(scaledTimeout, 60_000);
}

/**
 * Count TypeScript files in a directory to estimate project size.
 */
export async function countTypeScriptFiles(dirPath: string): Promise<number> {
  let count = 0;
  
  async function countInDir(currentPath: string, depth: number): Promise<void> {
    if (depth > 10) return; // Reasonable max depth
    
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.ts')) {
          count++;
        } else if (entry.isDirectory()) {
          // Skip common non-source directories
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            await countInDir(path.join(currentPath, entry.name), depth + 1);
          }
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }
  
  await countInDir(dirPath, 0);
  return count;
}
