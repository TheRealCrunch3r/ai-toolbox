import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as _fs from 'fs';
const fs = _fs.promises;
import * as path from 'path';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config.js';
import type { StateManager } from '../stateManager.js';
import { validatePath, isSafeRegex } from '../security.js';
import { recordFileModification } from './fileModTracker.js';
import { patternScan } from './patternScan.js';
// 14.09 TOOL SWAP (owner directive): grep_files is REMOVED and replaced by a standalone `ripgrep` tool — the ENTIRE search
// (file walk AND pattern matching) runs natively inside ONE worker-isolated ripgrep process (src/utils/ripgrepEngine.ts).
// The 13.09 wedge class stays structurally gone: rg's native walk runs off-thread and its budget watchdog terminates it on
// the GREP_FILES_MAX_RUN_MS cap. Dialect parse errors auto-retry as fixed strings (-F); invalid patterns surface typed.
import { runRipgrepEngine } from '../utils/ripgrepEngine.js';
import { createGrepGuard, FIND_REPLACE_ALL_MAX_RUN_MS, GREP_FILES_MAX_RUN_MS, PATTERN_SCAN_MAX_RUN_MS } from '../utils/grepGuard.js';
import { getWorkingDir, setWorkingDir, resolvePath } from '../workingDir.js';
import {
  levenshteinSimilarity,
  getCachedFuzzyResults,
  cacheFuzzyResults,
  findFilesAsync,
  countTypeScriptFiles,
  getAnalysisTimeout,
} from '../performanceUtils.js';

// ==================== Module-level constants (exported for test imports & shared use) ====================
/** Default max file size in bytes to search (100 KB). Files exceeding this are silently skipped. */
export const MAX_FILE_SIZE = 100_000;

/** Default per-file line cap used by find_replace_all's max_lines param (inherited from the old regex-mode
 *  grep_files, removed in the 14.09 TOOL SWAP) — prevents catastrophic backtracking on very long files. */
export const MAX_LINES_PER_FILE = 5000;

// ==================== DEFAULT EXCLUSIONS (PERFORMANCE & TOKEN SAVING) ====================
/** Default directory exclusions for the ripgrep tool — applied only when NO include_glob is given (see the
 *  ripgrep implementation below). Exported at module scope so tests and pattern_scan's ripgrep mirror can import
 *  the exact same set. Set contents unchanged by the hoist from the old grep_files walker (14.09 TOOL SWAP). */
export const DEFAULT_EXCLUDED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build',
  '.next', '.nuxt', '__pycache__', '.cache',
  'vendor', '.vscode', '.idea', '.vs'
]);

// ==================== Typed Params Interfaces ====================

interface ListDirectoryParams { path?: string; }
interface ReadFileParams { file_name: string; max_length?: number; }
interface SaveFileParams { file_name?: string; content?: string; files?: Array<{ file_name: string; content: string }>; }
interface ReplaceTextInFileParams { file_name: string; old_string: string; new_string: string; }
interface InsertAtLineParams { file_name: string; line_number: number; content_to_insert?: string; content?: string; }
interface ReadFileChunkedParams { file_name: string; chunk_size?: number; max_chunks?: number; };

interface AppendFileParams { file_name: string; content: string; }
interface DeleteLinesInFileParams { file_name: string; start_line: number; end_line?: number; }
interface MakeDirectoryParams { directory_name: string; }
interface MoveFileParams { source: string; destination: string; }
interface CopyFileParams { source: string; destination: string; }
interface DeletePathParams { path: string; }
interface DeleteFilesByPatternParams { pattern: string; }
interface FindFilesParams { pattern: string; max_depth?: number; }
interface FuzzyFindLocalFilesParams { query: string; path?: string; max_results?: number; }
interface GetFileMetadataParams { path: string; }
interface ChangeDirectoryParams { directory: string; }

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

/** Create backup announcement message for LLM awareness of .bak files */
function createBackupAnnouncement(backupPath: string | null): string | null {
  if (!backupPath) return null;
  
  // Extract just the filename (not full path) for readability
  const bakFilename = backupPath.split(path.sep).pop() || backupPath;
  const originalFile = bakFilename.slice(0, -4); // Remove .bak suffix
  
  return `📋 BACKUP AVAILABLE: A .bak file was created at '${bakFilename}'. If you need to undo this change, use the 'restore_from_bak' tool with file_name='${originalFile}'`;
}


/** Helper — reads file, checks binary, splits into chunks (shared by read_file & read_file_chunked) */
async function _readFileWithChunks(
  fullPath: string,
  chunkSize: number,
): Promise<{ success: true; data: { filePath: string; totalCharacters: number; chunksReturned: number; isTruncated: boolean; chunks: Array<{ index: number; content: string; startChar: number; endChar: number; truncated: boolean }> }; } | { success: false; error: string }> {
  try {
    const buffer = await fs.readFile(fullPath);

    // Binary check: null byte in first 1KB
    const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 1024));
    if (checkBuffer.includes(0)) {
      return { success: false, error: 'Binary file detected. Use read_document for PDF/DOCX files.' };
    }

    const content = buffer.toString('utf-8');
    const totalChars = content.length;

    // If file fits within chunkSize, return it whole (no chunking needed)
    if (totalChars <= chunkSize) {
      return {
        success: true,
        data: {
          filePath: fullPath,
          totalCharacters: totalChars,
          chunksReturned: 1,
          isTruncated: false,
          chunks: [{ index: 0, content, startChar: 0, endChar: totalChars, truncated: false }],
        },
      };
    }

    // Split into chunks manually (since read_file doesn't support offset/seek)
    const chunks: Array<{ index: number; content: string; startChar: number; endChar: number; truncated: boolean }> = [];
    let startIndex = 0;

    for (let i = 0; i < Math.ceil(totalChars / chunkSize); i++) {
      const endIndex = Math.min(startIndex + chunkSize, totalChars);
      chunks.push({
        index: i,
        content: content.substring(startIndex, endIndex),
        startChar: startIndex,
        endChar: endIndex,
        truncated: endIndex < totalChars,
      });
      startIndex = endIndex;
    }

    return {
      success: true,
      data: {
        filePath: fullPath,
        totalCharacters: totalChars,
        chunksReturned: chunks.length,
        isTruncated: startIndex < totalChars,
        chunks,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export function registerFileSystemTools(config: PluginConfig, _stateManager: StateManager): Tool[] {
  const tools: Tool[] = [];

  // list_directory tool — ASYNC optimized with fs.promises.readdir
  tools.push(tool({
    name: 'list_directory',
    description: 'List the files and directories in the current working directory or a specified subdirectory.',
    parameters: {
      path: z.string().optional().describe('The path to the directory to list. Defaults to current working directory.'),
    },
    implementation: async ({ path: dirPath }: ListDirectoryParams) => { // C5 FIX: typed params
      const targetPath = dirPath || '.';
      try {
        if (!validatePath(targetPath, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        const fullPath = resolvePath(targetPath);
        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        const result = entries.map(entry => ({
          path: path.join(fullPath, entry.name),
          name: entry.name,
          isDirectory: entry.isDirectory(),
          isFile: entry.isFile(),
        }));
        return { success: true, data: result };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // read_file tool — Hybrid: Early size check + Buffer binary detection + Truncation support
  tools.push(tool({
    name: 'read_file',
    description: 'Read content from a file in the current working directory. Automatically chunks large files to return all content without truncation.',
    parameters: {
      file_name: z.string().describe('The name of the file to read'),
      max_length: z.number().int().min(1).max(50000).optional().default(5000).describe('Maximum number of characters to return (default: 5000)'),
    },
    implementation: async ({ file_name, max_length }: ReadFileParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        
        const fullPath = resolvePath(file_name);
        const maxLength = max_length || 5000;

        // Early size check (Beledarian style) - prevent loading >10MB files
        let stats: _fs.Stats;
        try {
          stats = await fs.stat(fullPath);
        } catch (e: unknown) {
           return handleError(e);
        }

        if (stats.size > 10_000_000) {
          return { success: false, error: 'File too large (>10MB)' };
        }

        // Read as buffer for efficient binary check (Beledarian style) — ASYNC
        const buffer = await fs.readFile(fullPath);
        
        // Binary check: null byte in first 1KB
        const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 1024));
        if (checkBuffer.includes(0)) {
          return { success: false, error: 'Binary file detected. Use read_document for PDF/DOCX files.' };
        }

        // Convert to string
        const content = buffer.toString('utf-8');

        // Auto-chunk if file exceeds maxLength — prevents truncation & manual retry
        if (content.length > maxLength) {
          const chunkResult = await _readFileWithChunks(fullPath, 50000);
          if (!chunkResult.success) {
            return { success: false, error: chunkResult.error };
          }
          return { success: true, data: chunkResult.data };
        }

        // File fits within maxLength — return as single string (backward compatible)
        return { 
          success: true, 
          data: { 
            content: content,
            filePath: fullPath,
          }
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // read_file_chunked tool — Reads files larger than max_length by splitting into chunks
  tools.push(tool({
    name: 'read_file_chunked',
    description: 'Read a file in chunks to bypass character limits. ALWAYS use this instead of read_file if read_file returned truncated output, or if you know the file is very large (>50k chars). Returns structured chunks with start/end indices and truncation status.',
    parameters: {
      file_name: z.string().describe('The name of the file to read'),
      chunk_size: z.number().int().min(100).max(50000).optional().default(50000).describe('Maximum characters per chunk (default: 50000)'),
      max_chunks: z.number().int().min(1).max(100).optional().default(20).describe('Maximum number of chunks to return (default: 20)'),
    },
    implementation: async ({ file_name, chunk_size, max_chunks }: ReadFileChunkedParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        const fullPath = resolvePath(file_name);

        // Get file metadata first — ASYNC
        let stats: _fs.Stats;
        try {
          stats = await fs.stat(fullPath);
        } catch (e: unknown) {
          return handleError(e);
        }

        if (stats.size > 10_000_000) {
          return { success: false, error: 'File too large (>10MB)' };
        }

        // Read entire file content — ASYNC
        const buffer = await fs.readFile(fullPath);
        
        // Binary check
        const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 1024));
        if (checkBuffer.includes(0)) {
          return { success: false, error: 'Binary file detected. Use read_document for PDF/DOCX files.' };
        }

        const content = buffer.toString('utf-8');
        const totalChars = content.length;

        // Resolve optional parameters with defaults (TypeScript strict mode)
        const effectiveChunkSize = chunk_size ?? 50000;
        const effectiveMaxChunks = max_chunks ?? 20;

        // If file fits within chunk_size, return it whole (no chunking needed)
        if (totalChars <= effectiveChunkSize) {
          return {
            success: true,
            data: {
              filePath: fullPath,
              totalCharacters: totalChars,
              chunksReturned: 1,
              isTruncated: false,
              chunks: [{
                index: 0,
                content: content,
                startChar: 0,
                endChar: totalChars,
                truncated: false,
              }],
            },
          };
        }

        // Split into chunks manually (since read_file doesn't support offset/seek)
        const chunks: Array<{ index: number; content: string; startChar: number; endChar: number; truncated: boolean }> = [];
        let startIndex = 0;

        for (let i = 0; i < effectiveMaxChunks && startIndex < totalChars; i++) {
          const endIndex = Math.min(startIndex + effectiveChunkSize, totalChars);
          
          chunks.push({
            index: i,
            content: content.substring(startIndex, endIndex),
            startChar: startIndex,
            endChar: endIndex,
            truncated: endIndex < totalChars,
          });

          startIndex = endIndex;
        }

        return {
          success: true,
          data: {
            filePath: fullPath,
            totalCharacters: totalChars,
            chunkSize: effectiveChunkSize,
            maxChunks: effectiveMaxChunks,
            chunksReturned: chunks.length,
            isTruncated: startIndex < totalChars,
            chunks,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // save_file tool — Atomic writes with size limits, parent dir creation & overwrite protection
  tools.push(tool({
    name: 'save_file',
    description: 'Save content to a specified file in the current working directory. Supports batch saving.',
    parameters: {
      file_name: z.string().optional().describe('The name of the file to save'),
      content: z.string().optional().describe('Content to write'),
      files: z.array(z.object({ file_name: z.string(), content: z.string() })).max(10).optional().describe('For batch saving multiple files (max 10)'),
    },
    implementation: async ({ file_name, content, files }: SaveFileParams) => { // C5 FIX: typed params
      try {
        if (files && Array.isArray(files)) {
          // Batch save mode — atomic writes with temp files + rename
          const results = [];
          for (const file of files) {
            if (!validatePath(file.file_name, getWorkingDir())) {
              return { success: false, error: `Invalid path in batch: ${file.file_name}` };
            }
            try {
              await atomicWriteFile(resolvePath(file.file_name), file.content);
              results.push({ file: resolvePath(file.file_name), status: 'saved' });
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              return { success: false, error: `Batch save failed at ${file.file_name}: ${message}` };
            }
          }
          return { success: true, data: { savedFiles: files.length, results } };
        } else if (file_name && content !== undefined) {
          // Single file save mode — atomic write with parent dir creation
          if (!validatePath(file_name, getWorkingDir())) {
            return { success: false, error: 'Invalid path: directory traversal detected' };
          }
          try {
            await atomicWriteFile(resolvePath(file_name), content);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: `Failed to save file: ${message}` };
          }
          return { success: true, data: { savedFile: resolvePath(file_name), path: resolvePath(file_name) } };
        } else {
          return { success: false, error: 'Either provide file_name+content or files array' };
        }
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // Helper: Atomic file write with parent directory creation and size validation — ASYNC
  async function atomicWriteFile(filePath: string, content: string): Promise<void> {
    const bufferSize = Buffer.byteLength(content, 'utf-8');
    if (bufferSize > 10_000_000) {
      throw new Error(`Content too large (${(bufferSize / 1_048_576).toFixed(2)}MB, max 10MB)`);
    }

    // Create parent directories if they don't exist — ASYNC
    const dirPath = path.dirname(filePath);
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      throw new Error(`Failed to create directory ${dirPath}: ${(err as Error).message}`);
    }

    // Atomic write: temp file → rename (prevents partial/corrupt writes) — ASYNC
    const tempPath = filePath + '.tmp';
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, filePath);
  }

// replace_text_in_file tool — FIXED: All 8 issues resolved (P0-P3 priority)
  tools.push(tool({
    name: 'replace_text_in_file',
    description: 'Replace text in a file with comprehensive safety features. Supports global replacement, binary protection, size limits, atomic writes, and optional backups.',
    parameters: {
      file_name: z.string().describe('The file to modify'),
      old_string: z.string().min(1).describe('The exact text to replace (must be non-empty)'),
      new_string: z.string().optional().default('').describe('The replacement text (default: empty string = delete)'),
      global: z.boolean().optional().default(true).describe('Replace all occurrences (true) or only first (false). Default: true'),
      backup: z.boolean().optional().default(true).describe('Create .bak backup before modification. Default: true for safety'),
      normalize_line_endings: z.boolean().optional().default(true).describe('Normalize \\r\\n to \\n for matching (handles mixed line ending files). Default: true'),
    },
    implementation: async ({ file_name, old_string, new_string = '', global = true, backup = true, normalize_line_endings = true }: ReplaceTextInFileParams & { global?: boolean; backup?: boolean; normalize_line_endings?: boolean }) => {
      try {
        // ========== P2 FIX: Parameter Validation (Bug #7) ==========
        if (!old_string || old_string.length === 0) {
          return { success: false, error: 'Parameter validation failed: old_string must be non-empty' };
        }
        if (old_string.length > 100_000) {
          return { success: false, error: `Parameter validation failed: old_string too large (${old_string.length} chars, max 100KB)` };
        }
        if ((new_string || '').length > 1_000_000) {
          return { success: false, error: `Parameter validation failed: new_string too large (${(new_string||'').length} chars, max 1MB)` };
        }

        // ========== P2 FIX: Path Validation ==========
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        const fullPath = resolvePath(file_name);

        // ========== P2 FIX: File Size Limit (Bug #3) ==========
        let stats: _fs.Stats;
        try {
          stats = await fs.stat(fullPath);
        } catch {
          return { success: false, error: `File not found or inaccessible: ${file_name}` };
        }
        if (!stats.isFile()) {
          return { success: false, error: `Path is not a file: ${file_name}` };
        }
        if (stats.size > 10_000_000) {
          return { success: false, error: `File too large (${(stats.size / 1_048_576).toFixed(2)}MB, max 10MB). Use read_file_chunked for large files.` };
        }

        const buffer = await fs.readFile(fullPath);
        const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 8192));
        if (checkBuffer.includes(0)) {
          return { success: false, error: 'Binary file detected. This tool only supports text files. Use save_file for binary content.' };
        }
        const content = buffer.toString('utf-8');

        // ========== P1 FIX: Line Ending Normalization (Bug #9) ==========
        // Detect original line ending style to preserve it
        const hasCRLF = content.includes('\r\n');


        // Normalize both file content and search string for matching
        let normalizedContent = content;
        let normalizedOld = old_string;
        // FIX P0: Also normalize the replacement string to prevent \r\r\n corruption
        // When hasCRLF=true, the restore step converts ALL \n to \r\n.
        // If new_string already had \r\n, those become \r\r\n → double carriage return.
        let normalizedNew = new_string;
        if (normalize_line_endings) {
          normalizedContent = content.replace(/\r\n/g, '\n');
          normalizedOld = old_string.replace(/\r\n/g, '\n');
          normalizedNew = new_string.replace(/\r\n/g, '\n');
        }

        // ========== P0 FIX: Verify old_string exists in file ==========
        const firstIndex = normalizedContent.indexOf(normalizedOld);
        if (firstIndex === -1) {
          return { success: false, error: `String not found in file: '${old_string}'` };
        }

        // ========== P0 FIX: Global Replace Option (Bug #1) ==========
        let newContent: string;
        if (global) {
          // Replace ALL occurrences using split/join on normalized content
          newContent = normalizedContent.split(normalizedOld).join(normalizedNew);
        } else {
          // Replace only FIRST occurrence (firstIndex already computed above)
          newContent = normalizedContent.substring(0, firstIndex) + normalizedNew + normalizedContent.substring(firstIndex + normalizedOld.length);
        }

        // ========== P1 FIX: Restore original line ending style ==========
        // Convert result back to the file's original line ending format
        if (hasCRLF) {
          newContent = newContent.replace(/\n/g, '\r\n');
        }

        // ========== P1 FIX: Create Backup if requested (Bug #5) ==========
        let backupPath: string | null = null;
        if (backup) {
          backupPath = fullPath + '.bak';
          try {
            await fs.copyFile(fullPath, backupPath);
          } catch (e: unknown) {
            return { success: false, error: `Failed to create backup at ${backupPath}: ${e instanceof Error ? e.message : String(e)}` };
          }
        }

        // ========== P1 FIX: Count occurrences for return data ==========
        let occurrences = 0;
        if (global) {
          occurrences = normalizedContent.split(normalizedOld).length - 1;
        } else {
          occurrences = normalizedContent.indexOf(normalizedOld) !== -1 ? 1 : 0;
        }

        // ========== P1 FIX: Atomic Write (Bug #4) ==========
        try { await atomicWriteFile(fullPath, newContent); } catch (err) { if (backupPath) { try { await fs.copyFile(backupPath, fullPath); } catch {} }; return handleError(err); }

        const modTracking = recordFileModification(fullPath, 'replace_text_in_file');


        // ========== P3 FIX: Rich Return Data with Context ==========
        const responseData: {
          success: boolean;
          data: {
            file: string;
            replacements: number;
            bytesWritten: number;
            backupCreated: string | null;
            guidance?: string;
            backupMessage?: string;
          };
        } = {
          success: true,
          data: {
            file: fullPath,
            replacements: global ? occurrences : 1,
            bytesWritten: Buffer.byteLength(newContent, 'utf-8'),
            backupCreated: backupPath,
          },
        };

        if (modTracking.guidance) {
          responseData.data.guidance = modTracking.guidance;
        }

        // Announce .bak backup availability for LLM awareness during corruption recovery
        const bakAnnouncement = createBackupAnnouncement(backupPath);
        if (bakAnnouncement) {
          responseData.data.backupMessage = bakAnnouncement;
        }

        return responseData;
      } catch (error) {
        // ========== P3 FIX: Enhanced Error Context ==========
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to replace text in '${file_name}': ${message}` };
      }
    },
  }));


// insert_at_line tool — FIXED: All safety features + READ-BACK DRIFT DETECTION (P0-P3 priority)
  tools.push(tool({
    name: 'insert_at_line',
    description: `Insert content at a specific line number in a file. Includes binary protection, size limits, atomic writes, optional backups, and STRICT read-back drift detection.

⚠️ CRITICAL — Line Number Drift (STRICT MODE):
After each insertion, ALL subsequent lines shift DOWN by the number of inserted lines.
For MULTIPLE sequential inserts in the same file, hard line numbers become STALE after the first insertion.

This tool will FAIL (not warn) if drift is detected during post-write verification. This prevents silent file corruption from stale line numbers.

RECOMMENDATIONS:
- Single insert at known position: OK (no drift risk)
- Multiple sequential edits (3+ operations): Use save_file or replace_text_in_file for atomic replacement instead
- Structural changes (adding fields to schema + default + configSchematics): Always use save_file or replace_text_in_file
- Line-number-resistant alternative: insert_after_pattern / insert_before_pattern (in line_operations tool) — finds target by text content, not line numbers

If using hard line numbers for multiple operations, recalculate after each insertion: new_line = original_line + sum(lines_added_so_far).`,
    parameters: {
      file_name: z.string().describe('The file to modify'),
      line_number: z.number().int().min(1).describe('The line number to insert at (1-indexed)'),
      content_to_insert: z.string().optional().describe('The text content to insert'),
      content: z.string().optional().describe('Alias for content_to_insert'),
      backup: z.boolean().optional().default(true).describe('Create .bak backup before modification. Default: true for safety'),
    },
    implementation: async ({ file_name, line_number, content_to_insert, content, backup = true }: InsertAtLineParams & { backup?: boolean }) => {
      try {
        // ========== P2 FIX: Parameter Validation (Bug #7) ==========
        const textToInsert = content_to_insert ?? content;
        if (textToInsert === undefined) {
          return { success: false, error: 'Either "content_to_insert" or "content" parameter is required' };
        }
        if ((textToInsert || '').length > 1_000_000) {
          return { success: false, error: `Content too large (${(textToInsert||'').length} chars, max 1MB)` };
        }

        // ========== P2 FIX: Path Validation ==========
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        const fullPath = resolvePath(file_name);

        // ========== P2 FIX: File Size Limit (Bug #3) ==========
        let stats: _fs.Stats;
        try {
          stats = await fs.stat(fullPath);
        } catch {
          return { success: false, error: `File not found or inaccessible: ${file_name}` };
        }
        if (!stats.isFile()) {
          return { success: false, error: `Path is not a file: ${file_name}` };
        }
        if (stats.size > 10_000_000) {
          return { success: false, error: `File too large (${(stats.size / 1_048_576).toFixed(2)}MB, max 10MB). Use read_file_chunked for large files.` };
        }

        // ========== P2 FIX: Binary File Detection (Bug #2) ==========
        const buffer = await fs.readFile(fullPath);
        const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 8192));
        if (checkBuffer.includes(0)) {
          return { success: false, error: 'Binary file detected. This tool only supports text files.' };
        }
        const contentStr = buffer.toString('utf-8');

        // ========== P0 FIX: Validate line number bounds ==========
        // ========== P1 FIX: Detect original line ending style ==========
        const hasCRLF_insert = contentStr.includes('\r\n');
        let lines = hasCRLF_insert ? contentStr.split('\r\n') : contentStr.split('\n');
        if (line_number > lines.length + 1) {
          return { success: false, error: `Line number ${line_number} exceeds file length (${lines.length}). Max allowed: ${lines.length + 1}` };
        }

        // ========== P1 FIX: Create Backup if requested (Bug #5) ==========
        let backupPath: string | null = null;
        if (backup) {
          backupPath = fullPath + '.bak';
          try {
            await fs.copyFile(fullPath, backupPath);
          } catch (e: unknown) {
            return { success: false, error: `Failed to create backup at ${backupPath}: ${e instanceof Error ? e.message : String(e)}` };
          }
        }

        // ========== P0 FIX: Insert content ==========
        // FIX: Split multi-line content to prevent mixed line endings in CRLF files
        const insertLines = textToInsert.split(/\r?\n/);
        lines.splice(line_number - 1, 0, ...insertLines);
        const newContent = hasCRLF_insert ? lines.join('\r\n') : lines.join('\n');

        // ========== P1 FIX: Atomic Write (Bug #4) ==========
try { await atomicWriteFile(fullPath, newContent); } catch (err) { if (backupPath) { try { await fs.copyFile(backupPath, fullPath); } catch {} }; return handleError(err); }


        // ========== HARD FIX -- Read-Back Drift Detection (v2 -- full content verification) ==========
        let driftError: string | null = null;
        try {
          const postWriteBuffer = await fs.readFile(fullPath);
          const postWriteContent = postWriteBuffer.toString('utf-8');
          // Normalize both sides to the same line ending style for reliable comparison
          const postHasCRLF = postWriteContent.includes('\r\n');
          const normalizedPost = postHasCRLF ? postWriteContent.replace(/\r\n/g, '\n').split('\n') : postWriteContent.split('\n');

          // Build the expected inserted lines (normalized to LF for comparison)
          const insertLinesList = textToInsert.replace(/\r\n/g, '\n').split('\n');

          // Search within a +/-3 line window starting at target position
          const searchStart = Math.max(1, line_number - 3);
          const expectedEndLine = line_number + insertLinesList.length;
          const searchEnd = Math.min(normalizedPost.length, expectedEndLine + 3);

          let foundAtLine: number | null = null;

          // Try to find ALL inserted lines contiguously starting at or near the target position
          for (let startIdx = searchStart - 1; startIdx < Math.min(searchEnd, normalizedPost.length); startIdx++) {
            let allMatch = true;
            for (let j = 0; j < insertLinesList.length; j++) {
              const postIdx = startIdx + j;
              if (postIdx >= normalizedPost.length || normalizedPost[postIdx] !== insertLinesList[j]) {
                allMatch = false;
                break;
              }
            }
            if (allMatch) {
              foundAtLine = startIdx + 1; // Convert to 1-indexed
              break;
            }
          }

          if (foundAtLine !== null && Math.abs(foundAtLine - line_number) > 3) {
            driftError = `DRIFT DETECTED: Content inserted at lines ${foundAtLine}-${foundAtLine + insertLinesList.length - 1} instead of requested lines ${line_number}-${expectedEndLine}. Previous edits shifted the file. Use save_file or replace_text_in_file for multi-step changes.`;
          } else if (foundAtLine === null) {
            // Content not found within search window -- likely corruption from prior edits
            driftError = `DRIFT DETECTED: Inserted content NOT FOUND near line ${line_number} after write. File may be corrupted by previous edits. Use save_file or replace_text_in_file for multi-step changes.`;
          }

        } catch (driftErr) {
          // Non-critical -- drift detection failure should not block success if content was written
          console.warn(`[insert_at_line] Drift detection read-back failed: ${(driftErr as Error).message}`);
        }
        // ========== P3 FIX: Rich Return Data with Context ==========
        const responseData: {
          success: boolean;
          data: {
            insertedAt: number;
            file: string;
            bytesWritten: number;
            backupCreated: string | null;
            totalLines: number;
            guidance?: string;
            backupMessage?: string;
          };
        } = {
          success: true,
          data: {
            insertedAt: line_number,
            file: fullPath,
            bytesWritten: Buffer.byteLength(newContent, 'utf-8'),
            backupCreated: backupPath,
            totalLines: lines.length,
          },
        };


        // Announce .bak backup availability for LLM awareness during corruption recovery
        const bakAnnouncement = createBackupAnnouncement(backupPath);
        if (bakAnnouncement) {
          responseData.data.backupMessage = bakAnnouncement;
        }

        // STRICT MODE: Fail on drift detection to prevent silent corruption
        if (driftError) {
          return { success: false, error: driftError };
        }
        // Track consecutive modifications for drift warning -- ONLY if drift check passed
        const modTracking = recordFileModification(fullPath, 'insert_at_line');

        if (modTracking.guidance) {
          responseData.data.guidance = modTracking.guidance;
        }


        return responseData;
      } catch (error) {
        // ========== P3 FIX: Enhanced Error Context ==========
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to insert at line ${line_number} in '${file_name}': ${message}` };
      }
    },
  }));

// append_file tool — FIXED: All safety features added (P0 - MOST CRITICAL)
  tools.push(tool({
    name: 'append_file',
    description: "Append content to the end of a file safely. Includes binary protection, size limits, atomic writes, and optional backups. If file doesn't exist, it will be created.",
    parameters: {
      file_name: z.string().describe('The file to append to'),
      content: z.string().describe('The text content to append'),
      backup: z.boolean().optional().default(true).describe('Create .bak backup before modification. Default: true for safety'),
    },
    implementation: async ({ file_name, content, backup = true }: AppendFileParams & { backup?: boolean }) => {
      try {
        // ========== P2 FIX: Parameter Validation (Bug #7) ==========
        if (!content || content.length === 0) {
          return { success: false, error: 'Content cannot be empty. Provide text to append.' };
        }
        if (content.length > 1_000_000) {
          return { success: false, error: `Content too large (${content.length} chars, max 1MB)` };
        }

        // ========== P2 FIX: Path Validation ==========
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        const fullPath = resolvePath(file_name);

        // Check if file exists and get stats
        let existingSize = 0;
        let stats: _fs.Stats | null = null;
        try {
          stats = await fs.stat(fullPath);
          if (!stats.isFile()) {
            return { success: false, error: `Path is not a file: ${file_name}` };
          }
          existingSize = stats.size;
        } catch (error) {
          // File doesn't exist yet — that's OK for append
          const err = error as Error;
          if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            return { success: false, error: `Cannot access file '${file_name}': ${err.message}` };
          }
        }

        // ========== P2 FIX: File Size Limit (Bug #3) ==========
        const contentBytes = Buffer.byteLength(content, 'utf-8');
        const totalSize = existingSize + contentBytes;
        if (totalSize > 10_000_000) {
          return { success: false, error: `Append would exceed 10MB limit. Existing: ${(existingSize / 1048576).toFixed(2)}MB, Adding: ${(contentBytes / 1048576).toFixed(2)}MB` };
        }

        // ========== P2 FIX: Binary File Detection (Bug #2) ==========
        if (stats && existingSize > 0) {
          const buffer = await fs.readFile(fullPath);
          const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 8192));
          if (checkBuffer.includes(0)) {
            return { success: false, error: 'Binary file detected. Cannot append to binary files.' };
          }
        }

        // ========== P1 FIX: Create Backup if requested (Bug #5) ==========
        let backupPath: string | null = null;
        if (backup && stats) {
          backupPath = fullPath + '.bak';
          try {
            await fs.copyFile(fullPath, backupPath);
          } catch (e: unknown) {
            return { success: false, error: `Failed to create backup at ${backupPath}: ${e instanceof Error ? e.message : String(e)}` };
          }
        }

        // ========== P1 FIX: Atomic Write (Bug #4) ==========
        // For append, we must read existing content + new content, then atomic write
        let existingContent = '';
        if (stats && existingSize > 0) {
          const buffer = await fs.readFile(fullPath);
          existingContent = buffer.toString('utf-8');
        }
        const fullContent = existingContent + content;
        
        // Use atomic write instead of appendFile
try { await atomicWriteFile(fullPath, fullContent); } catch (err) { if (backupPath) { try { await fs.copyFile(backupPath, fullPath); } catch {} }; return handleError(err); }

        // Track consecutive modifications for drift warning
        const modTracking = recordFileModification(fullPath, 'append_file');


        // ========== P3 FIX: Rich Return Data with Context ==========
        const responseData: {
          success: boolean;
          data: {
            appendedTo: string;
            bytesAppended: number;
            totalFileSize: number;
            backupCreated: string | null;
            guidance?: string;
            backupMessage?: string;
          };
        } = {
          success: true,
          data: {
            appendedTo: fullPath,
            bytesAppended: contentBytes,
            totalFileSize: totalSize,
            backupCreated: backupPath,
          },
        };

        if (modTracking.guidance) {
          responseData.data.guidance = modTracking.guidance;
        }

        // Announce .bak backup availability for LLM awareness during corruption recovery
        const bakAnnouncement = createBackupAnnouncement(backupPath);
        if (bakAnnouncement) {
          responseData.data.backupMessage = bakAnnouncement;
        }

        return responseData;
      } catch (error) {
        // ========== P3 FIX: Enhanced Error Context ==========
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to append to '${file_name}': ${message}` };
      }
    },
  }));


// delete_lines_in_file tool — FIXED: All safety features added (P1)
  tools.push(tool({
    name: 'delete_lines_in_file',
    description: 'Delete a specific line or range of lines from a file. Includes binary protection, size limits, atomic writes, and optional backups.',
    parameters: {
      file_name: z.string().describe('The file to modify'),
      start_line: z.number().int().min(1).describe('Starting line number (1-indexed)'),
      end_line: z.number().int().min(1).optional().describe('Ending line number (inclusive). If omitted, only deletes start_line.'),
      backup: z.boolean().optional().default(true).describe('Create .bak backup before deletion. Default: true'),
    },
    implementation: async ({ file_name, start_line, end_line, backup = true }: DeleteLinesInFileParams & { backup?: boolean }) => {
      try {
        // ========== P2 FIX: Path Validation ==========
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        const fullPath = resolvePath(file_name);

        // ========== P2 FIX: File Size Limit (Bug #3) ==========
        let stats: _fs.Stats;
        try {
          stats = await fs.stat(fullPath);
        } catch {
          return { success: false, error: `File not found or inaccessible: ${file_name}` };
        }
        if (!stats.isFile()) {
          return { success: false, error: `Path is not a file: ${file_name}` };
        }
        if (stats.size > 10_000_000) {
          return { success: false, error: `File too large (${(stats.size / 1_048_576).toFixed(2)}MB, max 10MB). Use read_file_chunked for large files.` };
        }

        // ========== P2 FIX: Binary File Detection (Bug #2) ==========
        const buffer = await fs.readFile(fullPath);
        const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 8192));
        if (checkBuffer.includes(0)) {
          return { success: false, error: 'Binary file detected. This tool only supports text files.' };
        }
        const contentStr = buffer.toString('utf-8');

        // ========== P0 FIX: Validate line bounds ==========
        // ========== P1 FIX: Detect original line ending style ==========
        const hasCRLF_delete = contentStr.includes('\r\n');
        let lines = hasCRLF_delete ? contentStr.split('\r\n') : contentStr.split('\n');
        const deleteEnd = end_line || start_line;
        
        if (start_line > lines.length) {
          return { success: false, error: `Start line ${start_line} exceeds file length (${lines.length})` };
        }

        // Clamp end_line to avoid silent truncation beyond file bounds
        const clampedEnd = Math.min(deleteEnd, lines.length);
        
        if (clampedEnd < start_line) {
          return { success: false, error: `Invalid range: end line (${deleteEnd}) is before start line (${start_line})` };
        }

        const linesToDelete = clampedEnd - start_line + 1;

        // ========== P1 FIX: Create Backup if requested (Bug #5) — DEFAULT TRUE FOR SAFETY ==========
        let backupPath: string | null = null;
        if (backup) {
          backupPath = fullPath + '.bak';
          try {
            await fs.copyFile(fullPath, backupPath);
          } catch (e: unknown) {
            return { success: false, error: `Failed to create backup at ${backupPath}: ${e instanceof Error ? e.message : String(e)}` };
          }
        }

        // ========== P0 FIX: Delete lines ==========
        lines.splice(start_line - 1, linesToDelete);
        const newContent = hasCRLF_delete ? lines.join('\r\n') : lines.join('\n');

        // ========== P1 FIX: Atomic Write (Bug #4) ==========
try { await atomicWriteFile(fullPath, newContent); } catch (err) { if (backupPath) { try { await fs.copyFile(backupPath, fullPath); } catch {} }; return handleError(err); }

        // Track consecutive modifications for drift warning
        const modTracking = recordFileModification(fullPath, 'delete_lines_in_file');

        // ========== P3 FIX: Rich Return Data with Context ==========
        const responseData: {
          success: boolean;
          data: {
            deletedLines: string;
            linesDeleted: number;
            file: string;
            bytesWritten: number;
            backupCreated: string | null;
            remainingLines: number;
            guidance?: string;
            backupMessage?: string;
          };
        } = {
          success: true,
          data: {
            deletedLines: `${start_line}-${clampedEnd}`,
            linesDeleted: linesToDelete,
            file: fullPath,
            bytesWritten: Buffer.byteLength(newContent, 'utf-8'),
            backupCreated: backupPath,
            remainingLines: lines.length,
          },
        };

        if (modTracking.guidance) {
          responseData.data.guidance = modTracking.guidance;
        }

        // Announce .bak backup availability for LLM awareness during corruption recovery
        const bakAnnouncement = createBackupAnnouncement(backupPath);
        if (bakAnnouncement) {
          responseData.data.backupMessage = bakAnnouncement;
        }

        return responseData;
      } catch (error) {
        // ========== P3 FIX: Enhanced Error Context ==========
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete lines ${start_line}-${end_line || start_line} in '${file_name}': ${message}` };
      }
    },
  }));


  // make_directory tool — ASYNC mkdir
  tools.push(tool({
    name: 'make_directory',
    description: 'Create a new directory in the current working directory.',
    parameters: {
      directory_name: z.string().describe('The name of the directory to create'),
    },
    implementation: async ({ directory_name }: MakeDirectoryParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(directory_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path' };
        }
        const fullPath = resolvePath(directory_name);
        await fs.mkdir(fullPath, { recursive: true });  // ASYNC
        return { success: true, data: { createdDirectory: directory_name, path: fullPath } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // move_file tool — ASYNC rename
  tools.push(tool({
    name: 'move_file',
    description: 'Move or rename a file or directory.',
    parameters: {
      source: z.string().describe('Source path'),
      destination: z.string().describe('Destination path'),
    },
    implementation: async ({ source, destination }: MoveFileParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(source, getWorkingDir())) {
          return { success: false, error: 'Invalid source path' };
        }
        if (!validatePath(destination, getWorkingDir())) {
          return { success: false, error: 'Invalid destination path' };
        }
        const fullSource = resolvePath(source);
        const fullDestination = resolvePath(destination);
        await fs.rename(fullSource, fullDestination);  // ASYNC
        return { success: true, data: { movedFrom: fullSource, movedTo: fullDestination } }; // ✅ FULL PATHS
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // copy_file tool — ASYNC cp
  tools.push(tool({
    name: 'copy_file',
    description: 'Copy a file to a new location.',
    parameters: {
      source: z.string().describe('Source file path'),
      destination: z.string().describe('Destination file path'),
    },
    implementation: async ({ source, destination }: CopyFileParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(source, getWorkingDir())) {
          return { success: false, error: 'Invalid source path' };
        }
        if (!validatePath(destination, getWorkingDir())) {
          return { success: false, error: 'Invalid destination path' };
        }
        const fullSource = resolvePath(source);
        const fullDestination = resolvePath(destination);
        await fs.copyFile(fullSource, fullDestination);  // ASYNC
        return { success: true, data: { copiedFrom: fullSource, copiedTo: fullDestination } }; // ✅ FULL PATHS
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // delete_path tool — ASYNC stat + unlink/rm
  tools.push(tool({
    name: 'delete_path',
    description: 'Delete a file or directory in the current working directory. Be careful!',
    parameters: {
      path: z.string().describe('The path to delete'),
    },
    implementation: async ({ path: filePath }: DeletePathParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(filePath, getWorkingDir())) {
          return { success: false, error: 'Invalid path' };
        }
        const fullPath = resolvePath(filePath);
        
        // Check if it's a directory — ASYNC stat
        const stats = await fs.stat(fullPath);  // ASYNC
        if (stats.isDirectory()) {
          await fs.rm(fullPath, { recursive: true });  // ASYNC rm
        } else {
          await fs.unlink(fullPath);  // ASYNC unlink
        }
        return { success: true, data: { deleted: fullPath } }; // ✅ FULL PATH
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // delete_files_by_pattern tool — ASYNC readdir + unlink
  tools.push(tool({
    name: 'delete_files_by_pattern',
    description: 'Delete multiple files in the current directory that match a regex pattern.',
    parameters: {
      pattern: z.string().describe('Regex pattern to match filenames'),
    },
    implementation: async ({ pattern }: DeleteFilesByPatternParams) => { // C5 FIX: typed params
      try {
        if (config.regexReDoSProtection && !isSafeRegex(pattern)) {
          return { success: false, error: 'Unsafe regex pattern detected' };
        }
        
        const regex = new RegExp(pattern);
        const files = await fs.readdir(getWorkingDir());  // ASYNC
        const deletedFiles: string[] = [];
        
        for (const file of files) {
          if (regex.test(file)) {
            const fullPath = resolvePath(file);
            await fs.unlink(fullPath);  // ASYNC unlink
            deletedFiles.push(fullPath); // ✅ FULL PATH
          }
        }
        
        return { success: true, data: { deletedCount: deletedFiles.length, deletedFiles } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // find_files tool — OPTIMIZED with async/await and concurrency control (already async)
  tools.push(tool({
    name: 'find_files',
    description: 'Find files recursively in the current directory matching a name pattern. Uses async search for better performance.',
    parameters: {
      pattern: z.string().describe('Substring to match in filename (case-insensitive)'),
      max_depth: z.number().int().min(1).optional().describe('Maximum depth to search (default: 5)'),
    },
    implementation: async ({ pattern, max_depth }: FindFilesParams) => { // C5 FIX: typed params
      try {
        const searchPath = getWorkingDir();
        const depth = max_depth || 5;
        
        // Use optimized async search with concurrency control
        const result = await findFilesAsync(searchPath, pattern, depth);
        return { success: true, data: { foundFiles: result.files, count: result.count } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // fuzzy_find_local_files tool — OPTIMIZED with early exit Levenshtein + caching (already async)
  tools.push(tool({
    name: 'fuzzy_find_local_files',
    description: 'Fuzzy find local files by path/name similarity using optimized Levenshtein scoring with caching. Automatically excludes large directories (node_modules, .git, etc.) to save tokens.',
    parameters: {
      query: z.string().describe('Search query to match against file names/paths.'),
      path: z.string().optional().describe('Sub-directory to search in (default: current directory).'),
      max_results: z.number().int().min(1).max(20).optional().describe('Max results to return (default: 5).'),
    },
    implementation: async ({ query, path: searchPath, max_results }: FuzzyFindLocalFilesParams) => { // C5 FIX: typed params
      try {
        const baseDir = searchPath ? resolvePath(searchPath) : getWorkingDir();
        const maxResults = max_results || 5;

        // Check cache first
        const cachedResults = getCachedFuzzyResults(query, baseDir);
        if (cachedResults) {
          return { success: true, data: { matches: cachedResults.slice(0, maxResults), count: Math.min(cachedResults.length, maxResults) } };
        }

        // TOKEN-SAVING: Default excluded directories (large/bloat that wastes tokens)
        const DEFAULT_EXCLUDED = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '__pycache__', '.cache', 'vendor']);

        // Collect files using async method
        const allFiles: string[] = [];
        
        async function collectFiles(dirPath: string, depth: number = 0, maxDepth: number = 20): Promise<void> {
          if (depth > maxDepth) return;
          
          try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });  // ASYNC
            
            for (const entry of entries) {
              // TOKEN-SAVING: Skip hidden dirs and large/bloat directories
              if (entry.isDirectory() && (entry.name.startsWith('.') || DEFAULT_EXCLUDED.has(entry.name))) continue;

              const fullPath = path.join(dirPath, entry.name);
              if (entry.isDirectory()) {
                await collectFiles(fullPath, depth + 1, maxDepth);
              } else {
                allFiles.push(fullPath);
              }
            }
          } catch {
            // Skip inaccessible directories
          }
        }
        
        await collectFiles(baseDir);
        
        // Optimized fuzzy matching with early exit
        const results: Array<{ filePath: string; score: number }> = [];
        const queryLower = query.toLowerCase();
        const MIN_SCORE = 0.3;
        
        for (const file of allFiles) {
          const fileName = path.basename(file).toLowerCase();
          
          // Use optimized Levenshtein with early exit
          const score = levenshteinSimilarity(queryLower, fileName, MIN_SCORE);
          
          if (score !== null) {
            results.push({ filePath: file, score });
          }
        }
        
        // Sort by score descending and cache results
        results.sort((a, b) => b.score - a.score);
        cacheFuzzyResults(query, baseDir, results);
        
        return { success: true, data: { matches: results.slice(0, maxResults), count: Math.min(results.length, maxResults) } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // get_file_metadata tool — ASYNC stat
  tools.push(tool({
    name: 'get_file_metadata',
    description: 'Get metadata (size, dates) for a specific file.',
    parameters: {
      path: z.string().describe('The file path'),
    },
    implementation: async ({ path: filePath }: GetFileMetadataParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(filePath, getWorkingDir())) {
          return { success: false, error: 'Invalid path' };
        }
        const fullPath = resolvePath(filePath);
        const stats = await fs.stat(fullPath);  // ASYNC
        
        return {
          success: true,
          data: {
            path: fullPath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            accessedAt: stats.atime,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // change_directory tool — Hybrid: Explicit validation + State abstraction + Contextual response (already async)
  tools.push(tool({
    name: 'change_directory',
    description: 'Change the current working directory. All subsequent file operations will use this directory as the base.',
    parameters: {
      directory: z.string().describe('The absolute path to change to (e.g., "C:\\\\Projects\\\\my-app")'),
    },
    implementation: async ({ directory }: ChangeDirectoryParams) => { // C5 FIX: typed params
      try {
        const fullPath = resolvePath(directory);

        // ✅ Beledarian's explicit validation using fs.stat — ASYNC
        let stats: _fs.Stats;
        try {
          stats = await fs.stat(fullPath);  // ASYNC
        } catch (e: unknown) {
           return handleError(e);
        }

        if (!stats.isDirectory()) {
          return { success: false, error: `Path is not a directory: ${fullPath}` };
        }

        // ✅ Capture previous directory for context
        const previousDirectory = getWorkingDir();

        // ✅ AI Toolbox's abstraction for state change
        const success = setWorkingDir(fullPath);
        
        if (!success) {
          return { 
            success: false, 
            error: `Failed to change directory to '${directory}'. Ensure the path exists and is a valid directory.` 
          };
        }

        // ✅ Beledarian's contextual return data + AI Toolbox's structured format
        return { 
          success: true, 
          data: { 
            previous_directory: previousDirectory,
            current_directory: getWorkingDir() 
          } 
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));


  // analyze_project tool — Comprehensive TypeScript Performance & Linting Analysis (already async)
  tools.push(tool({
    name: 'analyze_project',
    description: 'Run project-wide analysis including TypeScript diagnostics, circular dependency detection, ESLint, config optimization, and import structure analysis.',
    parameters: {
      categories: z.array(z.enum(['typecheck', 'circular', 'eslint', 'config', 'imports'])).optional().describe('Analysis categories to run (default: all)'),
      max_imports_warning: z.number().int().min(5).max(100).optional().default(20).describe('Max imports per file before warning'),
    },
    implementation: async ({ categories, max_imports_warning }: { categories?: string[]; max_imports_warning?: number }) => { // C5 FIX: typed params
      try {
        const workingDir = getWorkingDir();
        const selectedCategories = categories || ['typecheck', 'circular', 'eslint', 'config', 'imports'];
        const importWarningThreshold = max_imports_warning || 20;

        // ==================== Safe Subprocess Helper with Progress ====================
        function spawnWithProgress(exe: string, args: string[], timeoutMs: number): Promise<{ success: boolean; stdout?: string; stderr?: string }> {
          return new Promise((resolve) => {
            // ✅ FIX FROM BELEDARIANS: Use shell:true for proper Windows .cmd resolution
            // 🔹 FIX #19 (2026-08-22): DEP0190 — Node ≥ 23 deprecates passing an ARGS ARRAY to spawn() with
            // shell:true (args are concatenated into a shell command line without escaping → DeprecationWarning +
            // injection surface). Fix: build ONE pre-quoted command string. All current call sites pass internal
            // literal flags (tsc/eslint/madge) plus at most one project-derived path, so quoting here is provably
            // safe. INVARIANT: never extend spawnWithProgress with user-controlled arguments without routing them
            // through quoteArg() first.
            const quoteArg = (a: string): string => (/["\s]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a);
            const commandLine = [exe, ...args].map(quoteArg).join(' ');
            const proc = spawn(commandLine, {
              stdio: ['pipe', 'pipe', 'pipe'],
              cwd: workingDir,
              shell: true,  // ← CRITICAL (kept on purpose): Enables PATH resolution and .cmd file execution on Windows
            });

            let stdout = '';
            let stderr = '';

            proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
            proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });

            const timerId = setTimeout(() => { 
              proc.kill(); 
              resolve({ success: false, stderr: `Timeout after ${timeoutMs}ms` }); 
            }, timeoutMs);

            proc.on('close', () => { clearTimeout(timerId); resolve({ success: true, stdout, stderr }); });
            proc.on('error', (err) => { clearTimeout(timerId); resolve({ success: false, stderr: err.message }); });
          });
        }

        // ==================== A. TypeScript Extended Diagnostics ====================
        async function runTypecheckAnalysis(): Promise<Record<string, unknown>> {
          const tsConfigPath = path.join(workingDir, 'tsconfig.json');
          if (!await fs.stat(tsConfigPath).then(() => true).catch(() => false)) {  // ASYNC check
            return { skipped: true, reason: 'No tsconfig.json found' };
          }

          // Use npx tsc instead of just tsc (works even without global TypeScript install)
          try {
            await spawnWithProgress('npx', ['tsc', '--version'], 5000);
          } catch {
            return { skipped: true, reason: 'TypeScript compiler (tsc) not found' };
          }

          // Dynamic timeout based on project size (using imported utilities)
          const fileCount = await countTypeScriptFiles(workingDir);
          const dynamicTimeout = getAnalysisTimeout(30000, fileCount);
          
          const result = await spawnWithProgress('npx', ['tsc', '--extendedDiagnostics'], dynamicTimeout);
          
          if (!result.success || !result.stdout) {
            return { skipped: true, reason: `tsc failed: ${result.stderr || 'Unknown error'}` };
          }

          // Parse tsc --extendedDiagnostics output
          const lines = result.stdout.split('\n');
          let checkTimeMs = 0;
          let memoryUsedMB = 0;
          let filesChecked = 0;
          let emitTimeMs = 0;
          let parseTimeMs = 0;

          for (const line of lines) {
            const lowerLine = line.toLowerCase();
            
            // Parse check time
            const checkMatch = lowerLine.match(/check\s+time:\s+(\d+)\s*ms/);
            if (checkMatch) checkTimeMs = parseInt(checkMatch[1], 10);

            // Parse memory used
            const memMatch = line.match(/memory used:\s+(\d+)\s*(kb|mb)/i);
            if (memMatch) {
              const value = parseInt(memMatch[1], 10);
              memoryUsedMB = memMatch[2].toLowerCase() === 'mb' ? value : Math.round(value / 1024 * 100) / 100;
            }

            // Parse files checked
            const filesMatch = line.match(/files\s+checked:\s+(\d+)/);
            if (filesMatch) filesChecked = parseInt(filesMatch[1], 10);

            // Parse emit time
            const emitMatch = lowerLine.match(/emit\s+time:\s+(\d+)\s*ms/);
            if (emitMatch) emitTimeMs = parseInt(emitMatch[1], 10);

            // Parse parse time
            const parseMatch = lowerLine.match(/parse\s+time:\s+(\d+)\s*ms/);
            if (parseMatch) parseTimeMs = parseInt(parseMatch[1], 10);
          }

          // Performance assessment based on PDF guidelines
          let assessment: 'fast' | 'moderate' | 'slow';
          if (checkTimeMs < 100) assessment = 'fast';
          else if (checkTimeMs <= 500) assessment = 'moderate';
          else assessment = 'slow';

          return {
            checkTimeMs,
            memoryUsedMB: Math.round(memoryUsedMB * 100) / 100,
            filesChecked,
            emitTimeMs,
            parseTimeMs,
            assessment,
          };
        }

        // ==================== B. Circular Dependency Detection ====================
        async function runCircularAnalysis(): Promise<Record<string, unknown>> {
          const entryPoint = path.join(workingDir, 'src', 'index.ts');
          
          if (!await fs.stat(entryPoint).then(() => true).catch(() => false)) {  // ASYNC check
            return { skipped: true, reason: 'No src/index.ts found' };
          }

          // Dynamic timeout based on project size
          const fileCount = await countTypeScriptFiles(workingDir);
          const dynamicTimeout = getAnalysisTimeout(20000, fileCount);
          
          // Run madge and capture output with dynamic timeout
          const result = await spawnWithProgress('npx', ['--yes', 'madge', '--circular', entryPoint], dynamicTimeout);
          
          if (!result.success) {
            return { skipped: true, reason: `madge failed: ${result.stderr || 'Unknown error'}` };
          }

          // Parse madge output — it lists cycles like "file1.ts -> file2.ts -> file1.ts"
          const cycles: string[] = [];
          const stdout = result.stdout || '';
          const lines = stdout.split('\n');
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('Found') && !trimmed.startsWith('No')) {
              // Check if this looks like a cycle path
              if (trimmed.includes('->') || trimmed.endsWith('.ts')) {
                cycles.push(trimmed);
              }
            }
          }

          return {
            hasCycles: cycles.length > 0,
            cycles,
          };
        }

        // ==================== C. ESLint Integration ====================
        async function runEslintAnalysis(): Promise<Record<string, unknown>> {
          const eslintConfigFiles = [
            path.join(workingDir, 'eslint.config.mjs'),
            path.join(workingDir, 'eslint.config.js'),
            path.join(workingDir, '.eslintrc.js'),
            path.join(workingDir, '.eslintrc.json'),
            path.join(workingDir, '.eslintrc'),
          ];

          // Check if any eslint config exists — ASYNC
          const hasEslintConfig = await Promise.all(eslintConfigFiles.map(f => 
            fs.stat(f).then(() => true).catch(() => false)
          )).then(results => results.some(r => r));

          if (!hasEslintConfig) {
            return { skipped: true, reason: 'No ESLint configuration found' };
          }

          // Check if eslint is available
          try {
            await spawnWithProgress('npx', ['eslint', '--version'], 5000);
          } catch {
            return { skipped: true, reason: 'ESLint not found in devDependencies or PATH' };
          }

          // Dynamic timeout based on project size
          const fileCount = await countTypeScriptFiles(workingDir);
          const dynamicTimeout = getAnalysisTimeout(15000, fileCount);
          
          const result = await spawnWithProgress('npx', ['eslint', 'src', '--ext', '.ts', '--format', 'json'], dynamicTimeout);
          
          if (!result.success) {
            return { skipped: true, reason: `ESLint failed: ${result.stderr || 'Unknown error'}` };
          }

          // Parse JSON output from eslint --format json
          let errors = 0;
          let warnings = 0;
          const errorMessages: string[] = [];
          const warningMessages: string[] = [];

          try {
            const parsed = JSON.parse(result.stdout || '') as {
              results?: Array<{
                filePath: string;
                messages?: Array<{ severity: number; message: string; line: number; column: number }>;
              }>;
            };
            if (parsed.results) {
              for (const fileResult of parsed.results) {
                for (const message of (fileResult.messages || [])) {
                  if (message.severity === 2) {
                    errors++;
                    errorMessages.push(`${fileResult.filePath}: ${message.message} (${message.line}:${message.column})`);
                  } else if (message.severity === 1) {
                    warnings++;
                    warningMessages.push(`${fileResult.filePath}: ${message.message} (${message.line}:${message.column})`);
                  }
                }
              }
            }
          } catch {
            // If JSON parsing fails, fall back to text output analysis
            const fallbackStdout = result.stdout || '';
            const errorLines = fallbackStdout.split('\n').filter(l => l.includes('error') && !l.includes('warning'));
            errors = errorLines.length;
            const warningLines = fallbackStdout.split('\n').filter(l => l.includes('warning'));
            warnings = warningLines.length;
          }

          return {
            errors,
            warnings,
            errorMessages: errorMessages.slice(0, 20), // Limit to first 20
            warningMessages: warningMessages.slice(0, 20),
          };
        }

        // ==================== D. TypeScript Config Analysis — ASYNC read ===
        async function runConfigAnalysis(): Promise<Record<string, unknown>> {
          const tsConfigPath = path.join(workingDir, 'tsconfig.json');
          if (!await fs.stat(tsConfigPath).then(() => true).catch(() => false)) {  // ASYNC check
            return { skipped: true, reason: 'No tsconfig.json found' };
          }

          let tsConfig: Record<string, unknown>;
          try {
            const content = await fs.readFile(tsConfigPath, 'utf-8');  // ASYNC read
            tsConfig = JSON.parse(content) as Record<string, unknown>;
          } catch {
            return { skipped: true, reason: 'Invalid tsconfig.json format' };
          }

          const compilerOptions = (tsConfig.compilerOptions || {}) as Record<string, unknown>;
          
          const incremental = !!compilerOptions.incremental;
          const skipLibCheck = !!compilerOptions.skipLibCheck;
          const isolatedModules = !!compilerOptions.isolatedModules;
          const strict = !!compilerOptions.strict;

          const recommendations: string[] = [];

          // Recommendations based on PDF optimization techniques
          if (!incremental) {
            recommendations.push('Enable "incremental": true in tsconfig.json for faster builds (build caching).');
          }
          if (!skipLibCheck) {
            recommendations.push('Enable "skipLibCheck": true to skip checking .d.ts files in node_modules.');
          }
          if (!isolatedModules) {
            recommendations.push('Consider enabling "isolatedModules": true for faster compilation (especially with Babel/esbuild).');
          }
          if (!strict) {
            recommendations.push('Enable "strict": true for better type safety and fewer runtime errors.');
          }

          // Check for paths configuration (module resolution optimization)
          const paths = compilerOptions.paths as Record<string, unknown> | undefined;
          if (!paths || Object.keys(paths).length === 0) {
            recommendations.push('Consider using "paths" in tsconfig.json to simplify module imports and reduce dependency depth.');
          }

          return {
            incremental,
            skipLibCheck,
            isolatedModules,
            strict,
            recommendations,
          };
        }

        // ==================== E. Import Structure Analysis — ASYNC read ===
        async function runImportAnalysis(): Promise<Record<string, unknown>> {
          const srcDir = path.join(workingDir, 'src');
          if (!await fs.stat(srcDir).then(() => true).catch(() => false)) {  // ASYNC check
            return { skipped: true, reason: 'No src/ directory found' };
          }

          // Collect all .ts files in src/ — ASYNC recursive traversal
          async function collectTsFiles(dir: string): Promise<string[]> {
            const files: string[] = [];
            try {
              const entries = await fs.readdir(dir, { withFileTypes: true });  // ASYNC
            
              for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                  files.push(...await collectTsFiles(fullPath));  // ASYNC recursive
                } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
                  files.push(fullPath);
                }
              }
            } catch {
              // Skip inaccessible directories
            }
            
            return files;
          }

          const tsFiles = await collectTsFiles(srcDir);  // ASYNC
          const filesWithExcessiveImports: Array<{ file: string; count: number }> = [];
          const declareGlobalUsage: Array<{ file: string }> = [];

          for (const filePath of tsFiles) {
            try {
              const content = await fs.readFile(filePath, 'utf-8');  // ASYNC read
                
                // Count imports
                const importStatements = content.match(/^import\s+.*$/gm);
                const importCount = importStatements ? importStatements.length : 0;

                if (importCount > importWarningThreshold) {
                  filesWithExcessiveImports.push({ file: path.relative(workingDir, filePath), count: importCount });
                }

                // Check for declare global usage (global type patching — bad practice per PDF)
                const declareGlobalMatches = content.match(/declare\s+global/g);
                if (declareGlobalMatches && declareGlobalMatches.length > 0) {
                  declareGlobalUsage.push({ file: path.relative(workingDir, filePath) });
                }
              } catch {
                // Skip files that can't be read
              }
            }

          return {
            filesWithExcessiveImports,
            declareGlobalUsage,
          };
        }

        // ==================== Run Selected Categories ===
        const results: Record<string, unknown> = {};

        if (selectedCategories.includes('typecheck')) {
          results.typecheck = await runTypecheckAnalysis();  // ASYNC
        }
        if (selectedCategories.includes('circular')) {
          results.circular = await runCircularAnalysis();  // ASYNC
        }
        if (selectedCategories.includes('eslint')) {
          results.eslint = await runEslintAnalysis();  // ASYNC
        }
        if (selectedCategories.includes('config')) {
          results.config = await runConfigAnalysis();  // ASYNC
        }
        if (selectedCategories.includes('imports')) {
          results.imports = await runImportAnalysis();  // ASYNC
        }

        return {
          success: true,
          data: results,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Analysis failed: ${message}` };
      }
    },
  }));


  // file_diff tool — Compare two files side by side with unified diff output — ASYNC read ===
  tools.push(tool({
    name: 'file_diff',
    description: 'Compare two files and return a unified diff with +/− markers and line numbers.',
    parameters: {
      file_a: z.string().describe('First file path'),
      file_b: z.string().describe('Second file path'),
    },
    implementation: async ({ file_a, file_b }: { file_a: string; file_b: string }) => {  // ASYNC params
      try {
        if (!validatePath(file_a, getWorkingDir()) || !validatePath(file_b, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        const fullPathA = resolvePath(file_a);
        const fullPathB = resolvePath(file_b);

        let contentA: string;
        let contentB: string;

        try {
          contentA = await fs.readFile(fullPathA, 'utf-8');  // ASYNC read
        } catch (e: unknown) {
          return handleError(e);
        }

        try {
          contentB = await fs.readFile(fullPathB, 'utf-8');  // ASYNC read
        } catch (e: unknown) {
          return handleError(e);
        }

        const linesA = contentA.split('\n');
        const linesB = contentB.split('\n');

        // Simple LCS-based diff algorithm
        const m = linesA.length;
        const n = linesB.length;
        const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0) as number[]);

        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            if (linesA[i - 1] === linesB[j - 1]) {
              lcs[i][j] = lcs[i - 1][j - 1] + 1;
            } else {
              lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
            }
          }
        }

        // Backtrack to collect diff lines
        const diffLines: Array<{ type: 'context' | 'add' | 'remove'; lineNum: number; content: string }> = [];
        let i = m;
        let j = n;

        while (i > 0 || j > 0) {
          if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
            diffLines.push({ type: 'context', lineNum: i, content: linesA[i - 1] });
            i--;
            j--;
          } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
            diffLines.push({ type: 'add', lineNum: j, content: linesB[j - 1] });
            j--;
          } else if (i > 0) {
            diffLines.push({ type: 'remove', lineNum: i, content: linesA[i - 1] });
            i--;
          }
        }

        // Format as unified diff output
        const outputParts: string[] = [];
        for (const dl of diffLines.reverse()) {
          if (dl.type === 'context') {
            outputParts.push(` ${dl.content}`);
          } else if (dl.type === 'add') {
            outputParts.push(`+${dl.content}`);
          } else {
            outputParts.push(`-${dl.content}`);
          }
        }

        return { success: true, data: { diff: outputParts.join('\n').trim(), files: [file_a, file_b] } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));


// directory_tree tool — Visualize directory structure with depth control & token-efficient summaries — ASYNC ===
  tools.push(tool({
    name: 'directory_tree',
    description: 'Visualize the directory structure of a path in a tree-like format. Supports max depth, optional file sizes, and automatic exclusion of large directories (node_modules, .git, dist, etc.) to save tokens. Returns both a visual tree and structured summary statistics.',
    parameters: {
      path: z.string().default('.').describe('Root directory to visualize'),
      max_depth: z.number().int().min(1).max(20).default(3).describe('Maximum nesting depth (default: 3)'),
      show_size: z.boolean().default(false).describe('Show file sizes in the output'),
    },
    implementation: async ({ path: dirPath, max_depth, show_size }: { readonly path?: string; readonly max_depth?: number; readonly show_size?: boolean }) => {
      try {
        const resolvedDirPath = dirPath || '.';
        const targetDir = resolvePath(resolvedDirPath);

        if (!validatePath(resolvedDirPath, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        // TOKEN-SAVING: Default excluded directories (large/bloat that wastes tokens)
        const DEFAULT_EXCLUDED = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '__pycache__', '.cache', 'vendor', '.vscode', '.idea']);

        const lines: string[] = [];
        const depthLimit = max_depth || 3;
        const displayShowSize = show_size ?? false;

        // Summary statistics for structured output (token-efficient)
        let dirCount = 0;
        let fileCount = 0;
        let totalSizeBytes = 0;

        async function buildTree(currentPath: string, prefix: string, currentDepth: number): Promise<void> {  // ASYNC recursive
          if (currentDepth > depthLimit) return;

          let entries: _fs.Dirent[];
          try {
            entries = await fs.readdir(currentPath, { withFileTypes: true });  // ASYNC read
          } catch {
            lines.push(`${prefix}⚠️  [Cannot read directory]`);
            return;
          }

          // Sort: directories first, then files (both alphabetically)
          const dirs: _fs.Dirent[] = [];
          const files: _fs.Dirent[] = [];

          for (const entry of entries) {
            if (entry.name.startsWith('.')) continue; // Skip hidden files/dirs
            // TOKEN-SAVING: Exclude large/bloat directories by default
            if (DEFAULT_EXCLUDED.has(entry.name)) continue;

            if (entry.isDirectory()) {
              dirs.push(entry);
            } else {
              files.push(entry);
            }
          }

          const sortedEntries = [...dirs, ...files].sort((a, b) => a.name.localeCompare(b.name));

          for (let i = 0; i < sortedEntries.length; i++) {
            const entry = sortedEntries[i];
            const isLast = i === sortedEntries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const childPrefix = prefix + (isLast ? '    ' : '│   ');

            if (entry.isDirectory()) {
              dirCount++;
              lines.push(`${prefix}${connector}📁 ${entry.name}/`);
              await buildTree(path.join(currentPath, entry.name), childPrefix, currentDepth + 1);  // ASYNC recursive
            } else {
              fileCount++;
              let sizeInfo = '';
              if (displayShowSize) {
                try {
                  const stats = await fs.stat(path.join(currentPath, entry.name));  // ASYNC stat
                  totalSizeBytes += stats.size;
                  const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
                  sizeInfo = ` (${sizeKB < 1 ? `${Math.round(stats.size)}B` : `${sizeKB}KB`})`;
                } catch {
                  // Skip size info if stat fails
                }
              }
              lines.push(`${prefix}${connector}📄 ${entry.name}${sizeInfo}`);
            }
          }
        }

        const rootName = path.basename(targetDir);
        lines.push(`📁 ${rootName}/`);
        await buildTree(targetDir, '', 1);  // ASYNC call

        // Format total size for human readability
        let totalSizeHuman = '0B';
        if (totalSizeBytes > 0) {
          if (totalSizeBytes < 1024) totalSizeHuman = `${totalSizeBytes}B`;
          else if (totalSizeBytes < 1024 * 1024) totalSizeHuman = `${(totalSizeBytes / 1024).toFixed(1)}KB`;
          else totalSizeHuman = `${(totalSizeBytes / (1024 * 1024)).toFixed(2)}MB`;
        }

        return { 
          success: true, 
          data: { 
            tree: lines.join('\n'), 
            path: targetDir, 
            depth: depthLimit,
            // STRUCTURED SUMMARY — token-efficient statistics instead of raw dumps
            summary: {
              directories: dirCount,
              files: fileCount,
              totalSizeBytes,
              totalSizeHuman,
              excludedDirectories: Array.from(DEFAULT_EXCLUDED),
              note: 'Large directories (node_modules, .git, dist, etc.) are automatically excluded to save tokens. Use list_directory on specific paths if you need to inspect them.',
            },
          } 
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));


  // ==================== HANG-GUARD LIVE INDICATOR (28.08.2026; v3 text 04.09; pattern_scan cap clause added 13.09; identity-only slim 15.09) ====================
  // Emitted ONCE per plugin load so the LM Studio console proves which build is actually running in memory:
  // if a hung session's logs lack this line, the process is executing a STALE pre-fix bundle — i.e., the shared
  // grepGuard (src/utils/grepGuard.ts) with its single cap timer was NOT loaded. This converts "is the fix live?"
  // from inference to a log fact. Owner decision 15.09: marker stays identity-only; wall-clock caps referenced here
  // BY CONSTANT NAME — literal values in comments rot (stale "500ms" banner incident, 14.09):
  //   ripgrep tool       -> GREP_FILES_MAX_RUN_MS      (src/utils/grepGuard.ts)
  //   find_replace_all   -> FIND_REPLACE_ALL_MAX_RUN_MS (src/utils/grepGuard.ts; shared abort guard)
  //   pattern_scan       -> PATTERN_SCAN_MAX_RUN_MS     (src/utils/grepGuard.ts)
  console.log('[ai_toolbox] BUILD MARKER (14.09 TOOL SWAP) — grep_files REMOVED; standalone ripgrep tool = worker-isolated rg engine off the host thread');


  // ripgrep tool — standalone recursive content search (14.09 TOOL SWAP, owner directive). Replaces the removed
  // grep_files: file walk AND pattern matching run natively inside ONE worker-isolated ripgrep process
  // (src/utils/ripgrepEngine.ts) — the host thread only awaits + parses JSON, so the 13.09 wedge class stays dead by
  // construction; a wedged worker is terminated by the engine's single wall-clock watchdog at GREP_FILES_MAX_RUN_MS.
  // No AST mode (dropped with grep_files), no result limits as of now: maxMatches = Number.MAX_SAFE_INTEGER,
  // matched-line content shaped by the engine default (150 chars + '…'). Dialect parse errors auto-retry once as
  // fixed strings (-F) — surfaced via pattern_mode. Case-insensitive is the DEFAULT (legacy -i contract).
  tools.push(tool({
    name: 'ripgrep',
    description: `Recursively search file contents under a directory (or within a single file) with ripgrep, returning matching lines as {file, line_number, content}.

The ENTIRE scan (file walk + pattern match) runs inside ONE worker-isolated ripgrep process off the host thread; a 3s wall-clock watchdog terminates wedged workers, so the plugin host can never freeze. Default exclusions (exactly 12: node_modules/.git/dist/build/.next/.nuxt/__pycache__/.cache/vendor/.vscode/.idea/.vs — mirrors DEFAULT_EXCLUDED_DIRS; applies only when no include_glob is given; explicit exclude_globs are always appended on top of them.

Pattern handling: mode "regex" compiles via Rust regex first; if compilation fails the SAME search automatically re-runs as fixed strings (literal semantics), reported via pattern_mode="fixed-strings". Use mode "literal" to skip straight to fixed-string matching. Matching is CASE-INSENSITIVE by default (set case_insensitive:false for exact-case). Relative paths resolve against the current working directory; a single-file target reports matches under its basename. Results are NOT capped — long scans settle at the 3s watchdog with an aborted=true hint instead of truncating results.`,
    parameters: {
      pattern: z.string().min(1).describe('Search pattern (Rust regex by default; use mode "literal" for plain text)'),
      path: z.string().optional().describe('Directory or single file to search (default: current working directory); relative paths resolve against the working directory'),
      mode: z.enum(['regex', 'literal']).optional().describe('Pattern interpretation. Default "regex"; invalid Rust regexes auto-demotion-retry as literal, reported via pattern_mode'),
      case_insensitive: z.boolean().optional().default(true).describe('Case-insensitive matching (rg -i; default true — legacy grep_files contract)'),
      include_glob: z.string().optional().describe('Positive file filter glob (e.g. "*.ts", "src/**/*.md"); when set, the default directory exclusions are NOT applied'),
      exclude_globs: z.array(z.string()).optional().describe('Negative filter globs (a matching directory is pruned whole); always appended on top of the default exclusions'),
      max_depth: z.number().int().min(1).optional().describe('Maximum directory depth below root (omitted = unbounded)'),
    },
    implementation: async ({ pattern, path: targetPath, mode, case_insensitive = true, include_glob, exclude_globs, max_depth }: {
      pattern: string;
      path?: string;
      mode?: 'regex' | 'literal';
      case_insensitive?: boolean;
      include_glob?: string;
      exclude_globs?: string[];
      max_depth?: number;
    }, ctx?: { signal?: AbortSignal }) => { // host abort signal — same ctx contract as pattern_scan
      // FORENSICS: make host-originated pre-aborts observable in main.log (same invisible-abort gap class).
      if (ctx?.signal?.aborted) console.log(`[ripgrep] aborted-in 0ms (host signal already fired before scan start)`);

      const effectivePath = targetPath || '.';
      try {
        if (!validatePath(effectivePath, getWorkingDir())) {
          return { success: false as const, error: 'Invalid path: directory traversal detected' };
        }
        const rootDir = resolvePath(effectivePath);

        // Default exclusions apply ONLY when no positive filter is given (rg include globs narrow the file set;
        // stacking both would silently prune e.g. "dist/x.ts" behind the user's explicit "*.ts"). User excludes
        // are ALWAYS added on top of the defaults — they can only narrow further, never widen.
        const excludeGlobs = [
          ...(!include_glob && !exclude_globs?.length ? Array.from(DEFAULT_EXCLUDED_DIRS) : []),
          ...(exclude_globs ?? []),
        ];

        const outcome = await runRipgrepEngine({
          rootDir,
          pattern,
          mode: mode === 'literal' ? 'literal' : 'regex',
          caseInsensitive: case_insensitive,
          includeGlob: include_glob,
          excludeGlobs,
          maxDepth: max_depth, // undefined/≤0/non-finite → engine emits no --max-depth flag (unbounded)
          budgetMs: GREP_FILES_MAX_RUN_MS,
          maxMatches: Number.MAX_SAFE_INTEGER, // owner directive 14.09: NO result limits as of now
          abortSignal: ctx?.signal,
        });

        // Union narrowing: only the success member carries `ok` — the 'in' guard splits the union;
        // every subsequent check runs against the kind-discriminated remainder (no-matches | spawn-failure | timeout | aborted).
        if ('ok' in outcome) {
          return {
            success: true as const,
            data: {
              matches: outcome.matches,
              count: outcome.matches.length,
              filesScanned: new Set(outcome.matches.map((m) => m.file)).size,
              mode: mode ?? 'regex', // echoes the requested mode (sibling branches already do) — 14.09 cosmetic fix
              pattern_mode: outcome.effectiveMode,
              ...(mode !== 'literal' && outcome.effectiveMode === 'fixed-strings'
                ? { hint: 'Pattern was not a valid Rust regex — the search automatically re-ran as fixed strings (literal semantics). Use mode "literal" explicitly to avoid the retry cost.' }
                : {}), // 14.09 cosmetic fix: an explicit mode="literal" request is NOT a demotion — no misleading wording
            },
          };
        }

        if (outcome.kind === 'no-matches') {
          // The engine discards effectiveMode on zero matches, so a regex-mode miss can be either a clean regex
          // negative or an unobservable -F demotion — report the honest lower bound instead of guessing.
          return { success: true as const, data: { matches: [], count: 0, filesScanned: 0, mode: mode ?? 'regex', pattern_mode: mode === 'literal' ? 'fixed-strings' : 'regex-or-demotion' } };
        }

        // timeout & aborted: the engine has already terminated the worker — partial state is empty by design.
        if (outcome.kind === 'timeout' || outcome.kind === 'aborted') {
          return {
            success: true as const,
            data: {
              matches: [],
              count: 0,
              filesScanned: 0,
              mode: mode ?? 'regex',
              aborted: true,
              hint: outcome.kind === 'timeout'
                ? `Scan was cut short at the ${GREP_FILES_MAX_RUN_MS}ms wall-clock watchdog (worker terminated; host stayed responsive) — results are PARTIAL. Re-run with narrower scope (smaller path/include_glob) for full coverage.`
                : 'Aborted by a host cancel before or mid-scan — no partial results returned. Re-run when convenient.',
            },
          };
        }

        // spawn-failure (worker boot / dependency / exit-code-2 in literal mode): typed error, never a silent empty.
        return { success: false as const, error: `ripgrep engine failed: ${outcome.detail}` };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false as const, error: `ripgrep search failed: ${message}` };
      }
    },
  }));


  // find_replace_all tool — Multi-file search & replace with regex, dry-run support, and safety guards
  tools.push(tool({
    name: 'find_replace_all',
    description: 'Search and replace text across multiple files in a directory using regex. Supports dry-run mode and safety confirmations.',
    parameters: {
      directory: z.string().optional().describe('The directory to search in (defaults to current working directory)'),
      pattern: z.string().describe('Regex pattern to search for'),
      replacement: z.string().default('').describe('The replacement string'),
      dry_run: z.boolean().optional().default(true).describe('Preview changes without modifying files. Default: true for safety'),
      confirm: z.boolean().optional().default(false).describe('Explicitly confirm file modifications. Required if dry_run is false'),
      backup: z.boolean().optional().default(true).describe('Create .bak backup before modification. Default: true'),
      file_extensions: z.array(z.string()).optional().describe('Optional file extensions to filter (e.g., ["ts", "js", "md"])'),
      max_files: z.number().int().min(1).max(1000).optional().default(100).describe('Maximum number of files to process'),
      max_file_size: z.number().int().min(1024).default(100_000).describe('Maximum file size in bytes to process (default: 100KB)'),
      max_depth: z.number().int().min(1).max(50).optional().default(10).describe('Maximum directory depth to search (default: 10, prevents infinite recursion)'),
      max_lines: z.number().int().min(100).optional().default(MAX_LINES_PER_FILE).describe(`Max lines per file to process (default ${MAX_LINES_PER_FILE}). Files with more lines are reported in "skipped", not processed silently.`),
    },
    implementation: async ({ directory, pattern, replacement, dry_run = true, confirm = false, backup = true, file_extensions, max_files = 100, max_file_size = 100_000, max_depth = 10, max_lines = MAX_LINES_PER_FILE }) => {
      try {
        // Safety: dry_run defaults to true. Modifications require explicit confirm: true.
        if (!dry_run && !confirm) {
          return { success: false, error: 'Modification requested but dry_run is true. Set dry_run: false and confirm: true to modify files.' };
        }

        const targetDir = directory ? resolvePath(directory) : getWorkingDir();
        if (!validatePath(directory || '.', getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        // HANG-GUARD v3 (FIX-DEBLOAT 04.09): shared cancellation primitive — one authoritative abort state for the
        // whole scan (host-signal forwarding unavailable here: this tool takes no ctx param, so cap-only mode with
        // FIND_REPLACE_ALL_MAX_RUN_MS; see src/utils/grepGuard.ts). Replaces the local controller + wall-clock race.
        const guard = createGrepGuard(undefined, FIND_REPLACE_ALL_MAX_RUN_MS, 'find_replace_all');

        let regex: RegExp;
        try {
          regex = new RegExp(pattern, 'gi');
          if (!isSafeRegex(pattern)) {
            return { success: false, error: 'Unsafe regex pattern detected (ReDoS risk). Please use a simpler pattern.' };
          }
        } catch {
          return handleError(new Error(`Invalid regex pattern: ${pattern}`));
        }

        // File walking & processing
        const filesProcessed: Array<{ file: string; matches: number }> = [];
        const filesSkipped: Array<{ file: string; reason: string }> = [];
        let totalMatches = 0;

        // ==================== FIX-DEBLOAT (04.09): shared guard gates for unpreemptible segments ====================
        // A single content.match(regex)/content.replace(...) over a whole file is ONE unpreemptible synchronous
        // segment: JS cannot interrupt it mid-execution and NO timer (including the guard's cap) can fire while it
        // spins — measured 210ms for a .test() on a 23-char near-miss with ~x4 growth per char. Defense in depth
        // (same posture as grep_files): pattern analysis is NOT the binding guarantee; the pre-call cooperative
        // check before every synchronous regex op is. The wall-clock deadline itself lives inside the shared guard
        // (FIND_REPLACE_ALL_MAX_RUN_MS — historical full-scan budget kept: this tool modifies files, so a short cap
        // would cut batches mid-apply).
        /** Cooperative abort gate — call BEFORE starting any synchronous regex work on file content. */
        function abortIfDeadlineExceeded(where: string): boolean {
          if (guard.signal.aborted) {
            console.warn(`[find_replace_all] Scan deadline (${FIND_REPLACE_ALL_MAX_RUN_MS}ms) exceeded ${where} — aborting to prevent hang`);
            guard.abort();
            return true;
          }
          return false;
        }

        async function walkDir(dirPath: string, currentDepth: number = 0): Promise<void> {
          // DEPTH LIMIT ENFORCEMENT — prevent infinite recursion
          if (currentDepth > max_depth) return;

          if (filesProcessed.length >= max_files) return;

          // ABORT/CAP CHECK — shared guard (single source of truth for the whole scan, see createGrepGuard above)
          if (guard.signal.aborted) return;

          let entries: _fs.Dirent[];
          try {
            entries = await fs.readdir(dirPath, { withFileTypes: true });
          } catch {
            return;
          }

          for (const entry of entries) {
            if (filesProcessed.length >= max_files) return;
            
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
              await walkDir(fullPath, currentDepth + 1);
            } else if (entry.isFile()) {
              // Extension filter
              const ext = path.extname(entry.name).replace('.', '').toLowerCase();
              if (file_extensions && !file_extensions.map(e => e.toLowerCase()).includes(ext)) {
                continue;
              }

              // Size limit
              let stats: _fs.Stats;
              try {
                stats = await fs.stat(fullPath);
              } catch {
                continue;
              }
              if (stats.size > max_file_size) {
                filesSkipped.push({ file: path.relative(targetDir, fullPath), reason: `exceeds max_file_size (${stats.size} bytes > ${max_file_size} bytes) — re-run with a higher max_file_size to include it` });
                continue;
              }

              // Binary check
              const buffer = await fs.readFile(fullPath);
              const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 8192));
              if (checkBuffer.includes(0)) {
                filesSkipped.push({ file: path.relative(targetDir, fullPath), reason: 'binary file — search skipped to prevent corruption or hangs' });
                continue;
              }

              const content = buffer.toString('utf-8');

              // CRITICAL FIX: Limit per-file processing to prevent catastrophic backtracking.
              // FIX-G3b (22.08.2026): cap is now configurable via max_lines (default MAX_LINES_PER_FILE) — same contract as grep_files
              const fileLines = content.split('\n');
              if (fileLines.length > max_lines) {
                filesSkipped.push({ file: path.relative(targetDir, fullPath), reason: `exceeds ${max_lines} line limit (${fileLines.length} lines — per-file safety cap to prevent catastrophic regex backtracking)` });
                continue;
              }

              // FIX-HANG-F2: gate BEFORE the whole-file .match() — a single spinning call can block the event
              // loop (and with it every timer) for minutes. The pre-call wall-clock check is the binding defense.
              if (abortIfDeadlineExceeded(`before .match() on ${path.relative(targetDir, fullPath)}`)) return;

              // Count matches
              const matches = content.match(regex);
              const matchCount = matches ? matches.length : 0;
              
              if (matchCount > 0) {
                totalMatches += matchCount;
                filesProcessed.push({ file: path.relative(targetDir, fullPath), matches: matchCount });
                
                // If not dry run, perform replacement
                if (!dry_run) {
                  // FIX-HANG-F2: gate BEFORE the whole-file .replace() (same unpreemptible-segment hazard as .match()).
                  if (abortIfDeadlineExceeded(`before .replace() on ${path.relative(targetDir, fullPath)}`)) return;
                  const newContent = content.replace(regex, replacement);
                  
                  // Backup
                  let backupPath: string | null = null;
                  if (backup) {
                    backupPath = fullPath + '.bak';
                    try { await fs.copyFile(fullPath, backupPath); } catch (e: unknown) {
                      throw new Error(`Failed to create backup at ${backupPath}: ${(e as Error).message}`);
                    }
                  }

                  // Atomic write
                  try { await atomicWriteFile(fullPath, newContent); } catch (err) {
                    if (backupPath) { try { await fs.copyFile(backupPath, fullPath); } catch {} };
                    throw new Error(`Failed to save file: ${(err as Error).message}`);
                  }

                  if (backupPath) {
                    try { await fs.unlink(backupPath); } catch {}
                  }
                }
              }
            }
          }
        }

        // SCAN AWAIT + DISARM (FIX-DEBLOAT 04.09): no backstop race — the shared guard's single cap timer settles this
        // call at FIND_REPLACE_ALL_MAX_RUN_MS with whatever partial results exist, and disarm() in finally releases it on
        // EVERY completion path (healthy, aborted or thrown) so no stray timer can fire after the return.
        try {
          await walkDir(targetDir);
        } catch (err) {
          guard.disarm();
          if (!guard.signal.aborted) return handleError(err); // genuine error → previous behavior preserved
          // Aborted mid-apply: NOT a hard failure — report the partial state below so the caller knows exactly what was modified.
        } finally {
          guard.disarm();
        }

        const aborted = guard.signal.aborted;

        if (dry_run) {
          return {
            success: true,
            data: {
              dryRun: true,
              totalMatches,
              filesAffected: filesProcessed.length,
              files: filesProcessed,
              skipped: filesSkipped,
              // FIX-DEBLOAT: surface cooperative aborts on the SUCCESS path too — otherwise a cap-trimmed scan is indistinguishable from a normal completion.
              ...(aborted && { aborted: true }),
              ...(aborted
                ? { message: `Dry run cut short at ${FIND_REPLACE_ALL_MAX_RUN_MS}ms deadline (partial results). Re-run with narrower scope or higher limits for full coverage.` }
                : { message: 'Dry run complete. Set dry_run: false and confirm: true to apply changes.' }),
            },
          };
        }

        return {
          success: true,
          data: {
            dryRun: false,
            totalMatches,
            filesModified: filesProcessed.length,
            files: filesProcessed,
            skipped: filesSkipped,
            // FIX-DEBLOAT: surface cooperative aborts on the SUCCESS path too. In apply mode this doubles as a
            // mid-batch safety report — files listed above were modified; files after the cut point were NOT touched.
            ...(aborted && { aborted: true }),
            ...(aborted
              ? { message: `Changes applied to ${filesProcessed.length} file(s) BEFORE the scan was cut short by the ${FIND_REPLACE_ALL_MAX_RUN_MS}ms deadline (partial results). Remaining files in scope were NOT modified — re-run with narrower scope or higher limits for full coverage.` }
              : { message: 'Changes applied successfully.' }),
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

    // pattern_scan tool — standalone recursive content search with ReDoS gate + resource caps
  tools.push(tool({
    name: 'pattern_scan',
    description: `Recursively search file contents under a directory (or within a single file) for a pattern, returning matching lines as {file, line, content}.

Positioning vs ripgrep: pattern_scan is the bounded JS engine — fails fast on unsafe or syntactically invalid regexes by auto-demoting to literal mode (reported via demotedToLiteral), fully async with bounded concurrency, hard per-file and total match caps (stats.truncated when hit), explicit skipped[] reporting for oversized/line-capped/binary/regex-timeout files, deterministic ordering (file, then line); use ripgrep for unbounded native full-coverage scans.
Directories node_modules/.git/dist/build/out/.next/.nuxt/__pycache__/.venv/coverage are always pruned. Relative roots resolve against the current working directory.`,
    parameters: {
      pattern: z.string().min(1).describe('Non-empty search pattern (regex by default; use mode "literal" for plain text)'),
      root: z.string().optional().describe('Directory or single file to scan (default: current working directory); relative paths resolve against the working directory'),
      mode: z.enum(['regex', 'literal']).optional().describe('Pattern interpretation. Default "regex"; unsafe/invalid regexes are auto-demoted to literal and reported via demotedToLiteral'),
      caseSensitive: z.boolean().optional().describe('Case-sensitive matching (default true)'),
      includeGlobs: z.array(z.string()).optional().describe('Directory mode only — glob patterns of files to scan, e.g. ["*.ts", "src/**/*.md"] (matched against relative path and basename)'),
      excludeGlobs: z.array(z.string()).optional().describe('Glob patterns for files/dirs to exclude; a matching directory is pruned whole'),
      maxDepth: z.number().int().min(1).max(50).optional().describe('Max directory depth below root (default 10)'),
      maxFileSizeBytes: z.number().int().min(1024).optional().describe('Skip files larger than this many bytes, reported in skipped[] (default 262144)'),
      maxFileLines: z.number().int().min(100).max(50000).optional().describe('Stop scanning a file after this many lines; longer files reported as line-cap skips (default 10000)'),
      maxMatchesPerFile: z.number().int().min(1).max(2000).optional().describe('Max matches kept per single file (default 50)'),
      maxTotalMatches: z.number().int().min(1).max(5000).optional().describe('Global cap on returned matches; stats.truncated is true when hit (default 200)'),
      matchLineLength: z.number().int().min(10).max(2000).optional().describe('Truncate matched line content beyond this many chars with an ellipsis (default 300)'),
      concurrency: z.number().int().min(1).max(16).optional().describe('Files read in parallel, clamped to 1-16 (default 4)'),
    },
    implementation: async ({ pattern, root, mode, caseSensitive, includeGlobs, excludeGlobs, maxDepth, maxFileSizeBytes, maxFileLines, maxMatchesPerFile, maxTotalMatches, matchLineLength, concurrency }: {
      pattern: string;
      root?: string;
      mode?: 'regex' | 'literal';
      caseSensitive?: boolean;
      includeGlobs?: string[];
      excludeGlobs?: string[];
      maxDepth?: number;
      maxFileSizeBytes?: number;
      maxFileLines?: number;
      maxMatchesPerFile?: number;
      maxTotalMatches?: number;
      matchLineLength?: number;
      concurrency?: number;
    }, ctx?: { signal?: AbortSignal }) => { // HANG-GUARD (05.09): host abort signal — same ctx contract as grep_files above
      // FORENSICS (05.09): make host-originated pre-aborts observable in main.log (same invisible-abort gap as grep_files).
      if (ctx?.signal?.aborted) console.log(`[pattern_scan] aborted-in 0ms (host signal already fired before scan start)`);

      // patternScan resolves relative roots against process.cwd() — bridge to the plugin working dir.
      const effectiveRoot = root ? resolvePath(root) : getWorkingDir();
      try {
        const result = await patternScan({
          pattern,
          root: effectiveRoot,
          mode,
          caseSensitive,
          includeGlobs,
          excludeGlobs,
          maxDepth,
          maxFileSizeBytes,
          maxFileLines,
          maxMatchesPerFile,
          maxTotalMatches,
          matchLineLength,
          concurrency,
          // HANG-GUARD (05.09): forward the host abort signal into the scan's shared cap guard.
          abortSignal: ctx?.signal,
        });
        if (!result.ok) {
          return { success: false as const, error: result.error ?? 'pattern_scan failed' };
        }
        return {
          success: true as const,
          data: {
            matches: result.matches,
            skipped: result.skipped,
            excluded_dirs: result.excludedDirs,
            stats: result.stats,
            // HANG-GUARD (05.09) forensics: cap/host aborts leave a host-log line + explicit partial-results fields.
            ...(result.aborted
              ? { aborted: true, hint: `Scan was cut short at the ${PATTERN_SCAN_MAX_RUN_MS}ms wall-clock cap or by a host abort — results are PARTIAL; re-run with narrower scope (smaller root/includeGlobs) for full coverage.` }
              : {}),
            ...(result.demotedToLiteral ? { demoted_to_literal: result.demotedToLiteral } : {}),
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false as const, error: `pattern_scan failed: ${message}` };
      }
    },
  }));

return tools;
}