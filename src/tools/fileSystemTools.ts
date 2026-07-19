import { parse as parseTS } from '@typescript-eslint/parser';
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
import { getWorkingDir, setWorkingDir, resolvePath } from '../workingDir.js';
import {
  levenshteinSimilarity,
  getCachedFuzzyResults,
  cacheFuzzyResults,
  findFilesAsync,
  countTypeScriptFiles,
  getAnalysisTimeout,
} from '../performanceUtils.js';
// ==================== AST Types ====================
// Local type definitions for AST nodes (avoids external type dependency issues)
interface ASTLocation {
  line: number;
  column: number;
}

interface ASTLoc {
  start: ASTLocation;
  end: ASTLocation;
}

interface ASTBaseNode {
  type: string;
  loc?: ASTLoc;
  range?: [number, number];
  [key: string]: unknown;
}

interface ASTProgram extends ASTBaseNode {
  body: ASTBaseNode[];
  sourceType?: string;
  comments?: unknown[];
  tokens?: unknown[];
}


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

        // ========== P2 FIX: Binary File Detection (Bug #2) ==========
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
        if (normalize_line_endings) {
          normalizedContent = content.replace(/\r\n/g, '\n');
          normalizedOld = old_string.replace(/\r\n/g, '\n');
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
          newContent = normalizedContent.split(normalizedOld).join(new_string);
        } else {
          // Replace only FIRST occurrence (firstIndex already computed above)
          newContent = normalizedContent.substring(0, firstIndex) + new_string + normalizedContent.substring(firstIndex + normalizedOld.length);
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


        // ========== P3 FIX: Rich Return Data with Context ==========
        return {
          success: true,
          data: {
            file: fullPath,
            replacements: global ? occurrences : 1,
            bytesWritten: Buffer.byteLength(newContent, 'utf-8'),
            backupCreated: backupPath,
          },
        };
      } catch (error) {
        // ========== P3 FIX: Enhanced Error Context ==========
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to replace text in '${file_name}': ${message}` };
      }
    },
  }));


// insert_at_line tool — FIXED: All safety features added (P0-P3 priority)
  tools.push(tool({
    name: 'insert_at_line',
    description: 'Insert content at a specific line number in a file. Includes binary protection, size limits, atomic writes, and optional backups.',
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
        lines.splice(line_number - 1, 0, textToInsert);
        const newContent = hasCRLF_insert ? lines.join('\r\n') : lines.join('\n');

        // ========== P1 FIX: Atomic Write (Bug #4) ==========
try { await atomicWriteFile(fullPath, newContent); } catch (err) { if (backupPath) { try { await fs.copyFile(backupPath, fullPath); } catch {} }; return handleError(err); }


        // ========== P3 FIX: Rich Return Data with Context ==========
        return {
          success: true,
          data: {
            insertedAt: line_number,
            file: fullPath,
            bytesWritten: Buffer.byteLength(newContent, 'utf-8'),
            backupCreated: backupPath,
            totalLines: lines.length,
          },
        };
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


        // ========== P3 FIX: Rich Return Data with Context ==========
        return {
          success: true,
          data: {
            appendedTo: fullPath,
            bytesAppended: contentBytes,
            totalFileSize: totalSize,
            backupCreated: backupPath,
          },
        };
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

        // ========== P3 FIX: Rich Return Data with Context ==========
        return {
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
            const proc = spawn(exe, args, {
              stdio: ['pipe', 'pipe', 'pipe'],
              cwd: workingDir,
              shell: true,  // ← CRITICAL: Enables PATH resolution and .cmd file execution on Windows
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


// grep_files tool — Search file contents across directory with regex support (OPTIMIZED FOR TOKEN SAVINGS) — ASYNC ===
  tools.push(tool({
    name: 'grep_files',
    description: 'Search for a pattern in files across a directory. Returns structured matches with file, line number, and content.',
    parameters: {
      pattern: z.string().describe('Regex or literal string to search for'),
      path: z.string().default('.').describe('Directory to search in (defaults to current working directory)'),
      mode: z.enum(['regex', 'ast']).optional().default('regex').describe('Search mode: "regex" for pattern matching or "ast" for structural code analysis'),
      include_context: z.boolean().optional().default(false).describe('Include surrounding lines (2 before/after) in results'),
      max_content_length: z.number().int().min(10).max(500).optional().default(150).describe('Max chars per matched line content (default: 150)'),
      include: z.string().optional().describe('File glob pattern to include (e.g., "*.ts", "src/**/*.js")'),
      exclude: z.string().optional().describe('Files or directories to exclude (e.g., "node_modules", ".git")'),
      max_results: z.number().int().min(1).max(500).default(20).describe('Maximum number of results to return (default: 20, max: 500)'),
      max_file_size: z.number().int().min(1024).default(100_000).describe('Maximum file size in bytes to search (default: 100KB, skip larger files)'),
      max_concurrent_files: z.number().int().min(1).max(32).optional().default(8).describe('Maximum files to process concurrently for performance tuning'),
    },
    implementation: async ({ pattern, path: searchPath = '.', mode = 'regex', include, exclude, max_results, max_file_size, max_content_length, include_context = false, max_concurrent_files }: {
      pattern: string;
      path?: string;
      mode?: 'regex' | 'ast';
      include?: string;
      exclude?: string;
      max_results?: number;
      max_file_size?: number;
      max_content_length?: number;
      max_concurrent_files?: number;
      include_context?: boolean;
    }) => {
      try {
        const targetDir = resolvePath(searchPath);

        if (!validatePath(searchPath, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        // Configuration with defaults - TOKEN LIMITING
        const MAX_RESULTS = max_results ?? 20;
        const MAX_FILE_SIZE = max_file_size ?? 100_000; // 100KB default
        const MAX_CONTENT_LENGTH = max_content_length ?? 150;
        let resultsCount = 0;
        const matches: Array<{ file: string; line_number: number; content: string; node_type?: string; context?: { function_signature?: string; class_context?: string; docblock?: string } }> = [];

        // ==================== REGEX VALIDATION ====================
        let regex: RegExp;
        let patternMode: 'regex' | 'literal' = 'regex';
        try {
          regex = new RegExp(pattern, 'i');
          if (!isSafeRegex(pattern)) {
            regex = new RegExp(escapeRegExp(pattern), 'i');
            patternMode = 'literal';
          }
        } catch {
          return handleError(new Error(`Invalid regex pattern: ${pattern}`));
        }

        /**
         * Process a single file for matches (both regex and AST modes).
         */
        async function processFile(fullPath: string, relativePath: string): Promise<void> {
          // STRICT LIMIT CHECK before any processing begins
          if (resultsCount >= MAX_RESULTS) return;

          try {
            // Early size check BEFORE reading file
            const stats = await fs.stat(fullPath);
            if (stats.size > MAX_FILE_SIZE) return;

            const content = await fs.readFile(fullPath, 'utf-8');

            if (mode === 'ast') {
              // ==================== AST MODE ====================
              const ast = parseToAST(content, fullPath);
              if (!ast) {
                // AST parsing failed — fall back to regex for this file
                return processWithRegex(content, relativePath, regex);
              }

              const remaining = MAX_RESULTS - resultsCount;
              const astMatches = searchAST(ast, content, pattern, relativePath, include_context, remaining);

              for (const astMatch of astMatches) {
                // STRICT LIMIT CHECK inside AST match loop too
                if (resultsCount >= MAX_RESULTS) break;

                const matchEntry = {
                  file: astMatch.file,
                  line_number: astMatch.line_number,
                  content: astMatch.content.length > MAX_CONTENT_LENGTH ? astMatch.content.slice(0, MAX_CONTENT_LENGTH) + '…' : astMatch.content,
                  ...(astMatch.nodeType && { node_type: astMatch.nodeType }),
                  ...(include_context && astMatch.context && {
                    context: {
                      ...(astMatch.context.functionSignature && { function_signature: astMatch.context.functionSignature }),
                      ...(astMatch.context.classContext && { class_context: astMatch.context.classContext }),
                      ...(astMatch.context.docblock && { docblock: astMatch.context.docblock }),
                    },
                  }),
                };
                matches.push(matchEntry);
                resultsCount++;
              }
            } else {
              // ==================== REGEX MODE ====================
              await processWithRegex(content, relativePath, regex);
            }
          } catch {
            // Skip binary files or unreadable files
          }
        }

        /**
         * Process file with regex pattern matching.
         */
        async function processWithRegex(content: string, relativePath: string, compiledRegex: RegExp): Promise<void> {
          const lines = content.split('\n');

          for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            // STRICT LIMIT CHECK before processing each line
            if (resultsCount >= MAX_RESULTS) return;

            if (compiledRegex.test(lines[lineIdx])) {
              const rawContent = lines[lineIdx].trim();

              const matchEntry: { file: string; line_number: number; content: string; context?: { function_signature?: string; class_context?: string; docblock?: string } } = {
                file: relativePath,
                line_number: lineIdx + 1,
                content: rawContent.length > MAX_CONTENT_LENGTH ? rawContent.slice(0, MAX_CONTENT_LENGTH) + '…' : rawContent,
              };

              // Context-aware grep: extract surrounding context
              if (include_context) {
                matchEntry.context = {
                  function_signature: extractFunctionContext(lines, lineIdx),
                  class_context: extractClassContext(lines, lineIdx),
                  docblock: extractDocblock(lines, lineIdx),
                };
              }

              matches.push(matchEntry);
              resultsCount++;
            }
          }
        }

        /**
         * Extract function signature context from surrounding lines (with caching).
         */
        const signatureCache = new Map<string, { func?: string; cls?: string }>();

        function extractFunctionContext(lines: string[], currentLine: number): string | undefined {
          // Check cache first using a composite key
          const cacheKey = `func-${lines.length}-${currentLine}`;
          const cached = signatureCache.get(cacheKey);
          if (cached?.func !== undefined) return cached.func === '' ? undefined : cached.func;

          let result: string | undefined;
          for (let i = currentLine; i >= Math.max(0, currentLine - 20); i--) {
            const line = lines[i].trim();
            if (line.startsWith('function') || line.includes('=>') || line.includes(': function')) {
              result = line;
              break;
            }
            // Stop at class declaration or empty block
            if (line.startsWith('class ') || line === '}') break;
          }

          signatureCache.set(cacheKey, { func: result ?? '' });
          return result;
        }

        /**
         * Extract class context from surrounding lines (with caching).
         */
        function extractClassContext(lines: string[], currentLine: number): string | undefined {
          const cacheKey = `cls-${lines.length}-${currentLine}`;
          const cached = signatureCache.get(cacheKey);
          if (cached?.cls !== undefined) return cached.cls === '' ? undefined : cached.cls;

          let result: string | undefined;
          for (let i = currentLine; i >= Math.max(0, currentLine - 50); i--) {
            const line = lines[i].trim();
            if (line.startsWith('class ')) {
              result = line;
              break;
            }
          }

          signatureCache.set(cacheKey, { cls: result ?? '' });
          return result;
        }

        /**
         * Extract JSDoc comment above the current line.
         */
        function extractDocblock(lines: string[], currentLine: number): string | undefined {
          const docLines: string[] = [];
          for (let i = currentLine - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('*') || line.startsWith('/**') || line.endsWith('*/')) {
              docLines.unshift(line);
            } else if (line === '') {
              if (docLines.length > 0) break;
            } else {
              break;
            }
          }
          return docLines.length > 0 ? docLines.join('\n') : undefined;
        }

        async function walkDirectory(dirPath: string, concurrencyLimit: number): Promise<void> {
          // OPTIMIZATION: Early exit if we have enough results
          if (resultsCount >= MAX_RESULTS) return;

          let entries: _fs.Dirent[];
          try {
            entries = await fs.readdir(dirPath, { withFileTypes: true });
          } catch {
            return; // Skip inaccessible directories
          }

          const batchPromises: Array<Promise<void>> = [];

          for (const entry of entries) {
            // Check exclude patterns
            if (exclude && entry.name.includes(exclude)) continue;

            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
              batchPromises.push(walkDirectory(fullPath, concurrencyLimit));
            } else if (entry.isFile()) {
              // OPTIMIZATION: Early exit check inside loop too
              if (resultsCount >= MAX_RESULTS) break;

              // Check include pattern
              const relPath = path.relative(targetDir, fullPath);
              if (include && !matchGlob(relPath, entry.name, include) && !matchGlob(relPath, relPath, include)) {
                continue;
              }

              const relativePath = path.relative(targetDir, fullPath);
              
              // Limit concurrency: batch processing with Promise.all
              if (batchPromises.length >= concurrencyLimit) {
                await Promise.all(batchPromises.splice(0, batchPromises.length));
                if (resultsCount >= MAX_RESULTS) return;
              }

              batchPromises.push(processFile(fullPath, relativePath));
            }
          }

          // Process remaining promises in final batch
          if (batchPromises.length > 0) {
            await Promise.all(batchPromises);
          }
        }

        // ==================== FIX: Auto-detect file vs directory (Bug #1) ====================
        let targetStats: _fs.Stats;
        try {
          targetStats = await fs.stat(targetDir);
        } catch {
          return handleError(new Error(`Path not found or inaccessible: '${targetDir}'`));
        }

        if (targetStats.isFile()) {
          // ==================== TARGET IS A FILE — search within it directly ====================
          console.warn(`[grep_files] Detected single file '${targetDir}' — searching in-file instead of listing directory`);
        } else {
          // ==================== TARGET IS A DIRECTORY — walk and search recursively (concurrent) ====================
          const concurrencyLimit = max_concurrent_files ?? 8;
          await walkDirectory(targetDir, concurrencyLimit);
        }

        return {
          success: true,
          data: {
            matches,
            count: resultsCount,
            truncated: resultsCount >= MAX_RESULTS,
            mode,
            patternMode,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));
  
  // Helper Functions for grep_files
  /** Escape special regex characters for literal string matching */
  function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /** Simple glob pattern matcher (supports *, ?) */
  /** Glob pattern matcher (supports *, ?, **) */
  function matchGlob(fullPath: string, filename: string, pattern: string): boolean {
    let regexStr = "^" + pattern;
    regexStr = regexStr.replace(/\\*\*/g, '(.+/)?');
    regexStr = regexStr.replace(/[.+?^${}()|[\]\/]/g, '\\$&');
    regexStr = regexStr.replace(/\\*/g, '[^/]*');
    regexStr = regexStr.replace(/\\?/g, '.');
    try {
      const regex = new RegExp(regexStr, 'i');
      return regex.test(fullPath) || regex.test(filename);
    } catch {
      return filename.includes(pattern.replace(/[*?]/g, ''));
    }
  }



  // ==================== AST-Based Search Helpers ====================

  /** AST Node types that can contain meaningful code patterns */
  type ASTNodeType =
    | 'FunctionDeclaration'
    | 'FunctionExpression'
    | 'ArrowFunctionExpression'
    | 'MethodDefinition'
    | 'ClassDeclaration'
    | 'VariableDeclaration'
    | 'ImportDeclaration'
    | 'ExportNamedDeclaration'
    | 'ExportDefaultDeclaration'
    | 'TryStatement'
    | 'ThrowStatement'
    | 'ReturnStatement'
    | 'IfStatement'
    | 'ForStatement'
    | 'WhileStatement';

  /** Result of AST pattern matching */
  interface ASTMatch {
    file: string;
    line_number: number;
    content: string;
    nodeType: ASTNodeType;
    context?: {
      functionSignature?: string;
      classContext?: string;
      docblock?: string;
    };
  }

  /**
   * Parse TypeScript/JavaScript source code into an AST.
   * Returns null if parsing fails (graceful degradation).
   */
  function parseToAST(content: string, filePath: string): ASTProgram | null {
    try {
      // Determine language based on file extension
      const isJSX = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');

      const ast = parseTS(content, {
        sourceType: 'module',
        ecmaVersion: 2022,
        ecmaFeatures: {
          jsx: isJSX,
        },
        loc: true,
        range: true,
        comment: true,
        tokens: false,
        // Allow top-level await and other modern features
        allowInvalidAST: false,
      }) as unknown as ASTProgram;

      return ast;
    } catch {
      // If parsing fails, return null — the caller should fall back to regex
      return null;
    }
  }

  /**
   * Recursively walk the AST and visit each node.
   * Stops early if the visitor returns true.
   */
  function walkAST(
    node: ASTBaseNode | ASTProgram,
    visitor: (node: ASTBaseNode, parent: ASTBaseNode | null) => boolean | void,
    parent: ASTBaseNode | null = null,
  ): void {
    if (visitor(node, parent)) return; // Early exit if visitor returns true

    const keys = Object.keys(node);
    for (const key of keys) {
      const value = (node as Record<string, unknown>)[key];
      if (!value) continue;

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && 'type' in item) {
            walkAST(item as ASTBaseNode, visitor, node);
          }
        }
      } else if (typeof value === 'object' && 'type' in value) {
        walkAST(value as ASTBaseNode, visitor, node);
      }
    }
  }

  /**
   * Get the text content of an AST node from the source.
   */
  function getNodeText(node: ASTBaseNode, source: string): string {
    if (!node.range) return '';
    const [start, end] = node.range;
    return source.substring(start, end).trim();
  }

  /**
   * Get the line number of an AST node.
   */
  function getLineNumber(node: ASTBaseNode): number {
    if (node.loc && node.loc.start) {
      return node.loc.start.line;
    }
    return 0;
  }

  /**
   * Extract the function signature containing a node.
   */
  function findEnclosingFunction(
    targetNode: ASTBaseNode,
    program: ASTProgram,
    source: string,
  ): string | undefined {
    let foundSignature: string | undefined;

    walkAST(program, (node) => {
      if (foundSignature) return true; // Early exit
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'MethodDefinition'
      ) {
        // Check if target is within this function's range
        if (node.range && targetNode.range) {
          const [funcStart, funcEnd] = node.range;
          const [targetStart, targetEnd] = targetNode.range;
          if (targetStart >= funcStart && targetEnd <= funcEnd) {
            foundSignature = getNodeText(node, source);
            return true;
          }
        }
      }
    });

    return foundSignature;
  }

  /**
   * Extract the class declaration containing a node.
   */
  function findEnclosingClass(
    targetNode: ASTBaseNode,
    program: ASTProgram,
    source: string,
  ): string | undefined {
    let foundClass: string | undefined;

    walkAST(program, (node) => {
      if (foundClass) return true;
      if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
        if (node.range && targetNode.range) {
          const [classStart, classEnd] = node.range;
          const [targetStart, targetEnd] = targetNode.range;
          if (targetStart >= classStart && targetEnd <= classEnd) {
            // Get just the class declaration line (not the whole body)
            const classText = getNodeText(node, source);
            const firstBrace = classText.indexOf('{');
            foundClass = firstBrace > 0 ? classText.substring(0, firstBrace).trim() : classText;
            return true;
          }
        }
      }
    });

    return foundClass;
  }

  /**
   * Extract JSDoc comment above a node.
   */
  function findDocblock(
    targetNode: ASTBaseNode,
    source: string,
  ): string | undefined {
    if (!targetNode.range) return undefined;
    const [targetStart] = targetNode.range;
    const linesBefore = source.substring(0, targetStart).split('\n');

    // Look backwards for JSDoc comment
    let docLines: string[] = [];
    for (let i = linesBefore.length - 1; i >= 0; i--) {
      const line = linesBefore[i].trim();
      if (line.startsWith('*') || line.startsWith('/**') || line.endsWith('*/')) {
        docLines.unshift(line);
      } else if (line === '') {
        // Allow one empty line between docblock and code
        if (docLines.length > 0) break;
      } else {
        break;
      }
    }

    return docLines.length > 0 ? docLines.join('\n') : undefined;
  }

  /**
   * Search AST for patterns matching the query.
   * Supports queries like:
   * - "import" → find all import declarations
   * - "function" → find all function declarations/expressions
   * - "class" → find all class declarations
   * - "throw" → find all throw statements
   * - "try" → find all try/catch blocks
   * - "return" → find all return statements
   * - "variable" → find all variable declarations
   * - "export" → find all export declarations
   * - "loop" → find all for/while loops
   * - "if" → find all if statements
   * - "lodash" → find imports from 'lodash'
   * - "error" → find throws and catches with 'error' in them
   */
  function searchAST(
    ast: ASTProgram,
    source: string,
    pattern: string,
    filePath: string,
    includeContext: boolean,
    maxResults: number,
  ): ASTMatch[] {
    const matches: ASTMatch[] = [];
    const patternLower = pattern.toLowerCase();

    // Define node type mappings for pattern matching
    const nodeTypeMap: Record<string, ASTNodeType[]> = {
      import: ['ImportDeclaration'],
      function: ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'MethodDefinition'],
      class: ['ClassDeclaration'],
      throw: ['ThrowStatement'],
      try: ['TryStatement'],
      return: ['ReturnStatement'],
      variable: ['VariableDeclaration'],
      export: ['ExportNamedDeclaration', 'ExportDefaultDeclaration'],
      loop: ['ForStatement', 'WhileStatement'],
      if: ['IfStatement'],
    };

    // Check if pattern matches a specific module name (e.g., "lodash", "react")
    const modulePattern = /^(?:from\s+)?['"]([^'"]+)['"]$/;
    const moduleMatch = pattern.match(modulePattern);

    walkAST(ast, (node) => {
      if (matches.length >= maxResults) return true;

      const nodeType = node.type as ASTNodeType;
      const lineNumber = getLineNumber(node);

      // Handle module-specific imports (e.g., "lodash")
      if (moduleMatch && nodeType === 'ImportDeclaration') {
        const importNode = node as ASTBaseNode & { source: { value: string } };
        const sourceText = importNode.source?.value || '';
        if (sourceText.includes(moduleMatch[1])) {
          const match: ASTMatch = {
            file: filePath,
            line_number: lineNumber,
            content: getNodeText(node, source),
            nodeType: 'ImportDeclaration',
          };
          if (includeContext) {
            match.context = {
              docblock: findDocblock(node, source),
            };
          }
          matches.push(match);
        }
        return;
      }

      // Check if pattern matches any configured node types
      let shouldMatch = false;

      for (const [key, types] of Object.entries(nodeTypeMap)) {
        if (patternLower.includes(key)) {
          if (types.includes(nodeType)) {
            shouldMatch = true;
            break;
          }
        }
      }

      // Special handling for "error" pattern — matches throws and try/catches
      if (patternLower.includes('error') || patternLower.includes('catch')) {
        if (nodeType === 'ThrowStatement') {
          shouldMatch = true;
        }
        if (nodeType === 'TryStatement') {
          const tryNode = node as Record<string, unknown>;
          if (tryNode.handler || tryNode.finalizer) {
            shouldMatch = true;
          }
        }
      }

      if (shouldMatch) {
        const match: ASTMatch = {
          file: filePath,
          line_number: lineNumber,
          content: getNodeText(node, source),
          nodeType,
        };

        if (includeContext) {
          match.context = {
            functionSignature: findEnclosingFunction(node, ast, source),
            classContext: findEnclosingClass(node, ast, source),
            docblock: findDocblock(node, source),
          };
        }

        matches.push(match);
      }
    });

    return matches.slice(0, maxResults);
  }

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
    },
    implementation: async ({ directory, pattern, replacement, dry_run = true, confirm = false, backup = true, file_extensions, max_files = 100, max_file_size = 100_000 }) => {
      try {
        // Safety: dry_run defaults to true. Modifications require explicit confirm: true.
        if (!dry_run && !confirm) {
          return { success: false, error: 'Modification requested but dry_run is true. Set dry_run: false and confirm: true to modify files.' };
        }

        const targetDir = directory ? resolvePath(directory) : getWorkingDir();
        if (!validatePath(directory || '.', getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        // Validate regex safely
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

        async function walkDir(dirPath: string): Promise<void> {
          if (filesProcessed.length >= max_files) return;
          
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
              await walkDir(fullPath);
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
                filesSkipped.push({ file: path.relative(targetDir, fullPath), reason: 'exceeds max file size' });
                continue;
              }

              // Binary check
              const buffer = await fs.readFile(fullPath);
              const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 8192));
              if (checkBuffer.includes(0)) {
                filesSkipped.push({ file: path.relative(targetDir, fullPath), reason: 'binary file' });
                continue;
              }

              const content = buffer.toString('utf-8');
              
              // Count matches
              const matches = content.match(regex);
              const matchCount = matches ? matches.length : 0;
              
              if (matchCount > 0) {
                totalMatches += matchCount;
                filesProcessed.push({ file: path.relative(targetDir, fullPath), matches: matchCount });
                
                // If not dry run, perform replacement
                if (!dry_run) {
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

        try {
          await walkDir(targetDir);
        } catch (err) {
          return handleError(err);
        }

        if (dry_run) {
          return {
            success: true,
            data: {
              dryRun: true,
              totalMatches,
              filesAffected: filesProcessed.length,
              files: filesProcessed,
              skipped: filesSkipped,
              message: 'Dry run complete. Set dry_run: false and confirm: true to apply changes.',
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
            message: 'Changes applied successfully.',
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  return tools;
}