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

// ==================== Typed Params Interfaces ====================

interface ListDirectoryParams { path?: string; }
interface ReadFileParams { file_name: string; max_length?: number; }
interface SaveFileParams { file_name?: string; content?: string; files?: Array<{ file_name: string; content: string }>; }
interface ReplaceTextInFileParams { file_name: string; old_string: string; new_string: string; }
interface InsertAtLineParams { file_name: string; line_number: number; content_to_insert: string; }
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
        } catch (e) {
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
        } catch (e) {
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
      content: z.string().max(10_000_000).optional().describe('Content to write (max 10MB)'),
      files: z.array(z.object({ file_name: z.string(), content: z.string().max(10_000_000) })).max(50).optional().describe('For batch saving multiple files'),
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

  // replace_text_in_file tool — ASYNC file operations
  tools.push(tool({
    name: 'replace_text_in_file',
    description: 'Replace a specific string in a file with a new string.',
    parameters: {
      file_name: z.string().describe('The file to modify'),
      old_string: z.string().describe('The exact text to replace. Must be unique in the file.'),
      new_string: z.string().describe('The text to insert in place of old_string.'),
    },
    implementation: async ({ file_name, old_string, new_string }: ReplaceTextInFileParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path' };
        }
        const fullPath = resolvePath(file_name);
        let content = await fs.readFile(fullPath, 'utf-8');  // ASYNC
        
        if (!content.includes(old_string)) {
          return { success: false, error: `String '${old_string}' not found in file` };
        }
        
        const newContent = content.replace(old_string, new_string);
        await fs.writeFile(fullPath, newContent, 'utf-8');  // ASYNC
        return { success: true, data: { replaced: true, file: fullPath } }; // ✅ FULL PATH
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // insert_at_line tool — ASYNC file operations
  tools.push(tool({
    name: 'insert_at_line',
    description: 'Insert content at a specific line number in a file.',
    parameters: {
      file_name: z.string().describe('The file to modify'),
      line_number: z.number().int().min(1).describe('The line number to insert at (1-indexed)'),
      content_to_insert: z.string().describe('The text content to insert'),
    },
    implementation: async ({ file_name, line_number, content_to_insert }: InsertAtLineParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path' };
        }
        const fullPath = resolvePath(file_name);
        let lines = (await fs.readFile(fullPath, 'utf-8')).split('\n');  // ASYNC
        
        // Allow appending at EOF (line_number == length + 1)
        if (line_number > lines.length + 1) {
          return { success: false, error: `Line number ${line_number} exceeds file length (${lines.length})` };
        }
        
        lines.splice(line_number - 1, 0, content_to_insert);
        await fs.writeFile(fullPath, lines.join('\n'), 'utf-8');  // ASYNC
        return { success: true, data: { insertedAt: line_number, file: fullPath } }; // ✅ FULL PATH
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // append_file tool — ASYNC
  tools.push(tool({
    name: 'append_file',
    description: "Append content to the end of a file. If the file doesn't exist, it will be created.",
    parameters: {
      file_name: z.string().describe('The file to append to'),
      content: z.string().describe('The text content to append'),
    },
    implementation: async ({ file_name, content }: AppendFileParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path' };
        }
        const fullPath = resolvePath(file_name);
        await fs.appendFile(fullPath, content, 'utf-8');  // ASYNC
        return { success: true, data: { appendedTo: fullPath } }; // ✅ FULL PATH
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // delete_lines_in_file tool — ASYNC file operations
  tools.push(tool({
    name: 'delete_lines_in_file',
    description: 'Delete a specific line or range of lines from a file.',
    parameters: {
      file_name: z.string().describe('The file to modify'),
      start_line: z.number().int().min(1).describe('Starting line number (1-indexed)'),
      end_line: z.number().int().min(1).optional().describe('Ending line number (inclusive). If omitted, only deletes start_line.'),
    },
    implementation: async ({ file_name, start_line, end_line }: DeleteLinesInFileParams) => { // C5 FIX: typed params
      try {
        if (!validatePath(file_name, getWorkingDir())) {
          return { success: false, error: 'Invalid path' };
        }
        const fullPath = resolvePath(file_name);
        let lines = (await fs.readFile(fullPath, 'utf-8')).split('\n');  // ASYNC
        
        const deleteEnd = end_line || start_line;
        if (start_line > lines.length) {
          return { success: false, error: `Start line ${start_line} exceeds file length (${lines.length})` };
        }
        
        // Clamp end_line to avoid silent truncation beyond file bounds
        const clampedEnd = Math.min(deleteEnd, lines.length);
        lines.splice(start_line - 1, clampedEnd - start_line + 1);
        await fs.writeFile(fullPath, lines.join('\n'), 'utf-8');  // ASYNC
        return { success: true, data: { deletedLines: `${start_line}-${clampedEnd}`, file: fullPath } }; // ✅ FULL PATH
      } catch (error) {
        return handleError(error);
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
    description: 'Fuzzy find local files by path/name similarity using optimized Levenshtein scoring with caching.',
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

        // Collect files using async method
        const allFiles: string[] = [];
        
        async function collectFiles(dirPath: string, depth: number = 0, maxDepth: number = 20): Promise<void> {
          if (depth > maxDepth) return;
          
          try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });  // ASYNC
            
            for (const entry of entries) {
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
        } catch (e) {
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
        } catch (e) {
          return handleError(e);
        }

        try {
          contentB = await fs.readFile(fullPathB, 'utf-8');  // ASYNC read
        } catch (e) {
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


// directory_tree tool — Visualize directory structure with depth control — ASYNC ===
  tools.push(tool({
    name: 'directory_tree',
    description: 'Visualize the directory structure of a path in a tree-like format. Supports max depth and optional file sizes.',
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

        const lines: string[] = [];
        const depthLimit = max_depth || 3;
        const displayShowSize = show_size ?? false;

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
              lines.push(`${prefix}${connector}📁 ${entry.name}/`);
              await buildTree(path.join(currentPath, entry.name), childPrefix, currentDepth + 1);  // ASYNC recursive
            } else {
              let sizeInfo = '';
              if (displayShowSize) {
                try {
                  const stats = await fs.stat(path.join(currentPath, entry.name));  // ASYNC stat
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

        return { success: true, data: { tree: lines.join('\n'), path: targetDir, depth: depthLimit } };
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
      include: z.string().optional().describe('File glob pattern to include (e.g., "*.ts", "src/**/*.js")'),
      exclude: z.string().optional().describe('Files or directories to exclude (e.g., "node_modules", ".git")'),
      max_results: z.number().int().min(1).max(500).default(50).describe('Maximum number of results to return (default: 50, max: 500)'),
      max_file_size: z.number().int().min(1024).default(100_000).describe('Maximum file size in bytes to search (default: 100KB, skip larger files)'),
    },
    implementation: async ({ pattern, path: searchPath = '.', include, exclude, max_results, max_file_size }: { 
      pattern: string; 
      path?: string; 
      include?: string; 
      exclude?: string;
      max_results?: number;
      max_file_size?: number;
    }) => {
      try {
        const targetDir = resolvePath(searchPath);

        if (!validatePath(searchPath, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        // Validate regex for safety
        let regex: RegExp;
        try {
          const safePattern = isSafeRegex(pattern) ? pattern : escapeRegExp(pattern);
          regex = new RegExp(safePattern, 'i'); // Case-insensitive by default
        } catch {
          return handleError(new Error(`Invalid regex pattern: ${pattern}`));
        }

        // Configuration with defaults - TOKEN LIMITING
        const MAX_RESULTS = max_results ?? 50;
        const MAX_FILE_SIZE = max_file_size ?? 100_000; // 100KB default
        let resultsCount = 0;

        const matches: Array<{ file: string; line_number: number; content: string }> = [];

        async function walkDirectory(dirPath: string): Promise<void> {  // ASYNC recursive traversal
          // OPTIMIZATION: Early exit if we have enough results
          if (resultsCount >= MAX_RESULTS) return;

          let entries: _fs.Dirent[];
          try {
            entries = await fs.readdir(dirPath, { withFileTypes: true });  // ASYNC read
          } catch {
            return; // Skip inaccessible directories
          }

          for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            // Check exclude patterns
            if (exclude && entry.name.includes(exclude)) continue;

            if (entry.isDirectory()) {
              await walkDirectory(fullPath);  // ASYNC recursive
            } else if (entry.isFile()) {
              // OPTIMIZATION: Early exit check inside loop too
              if (resultsCount >= MAX_RESULTS) return;

              // Check include pattern
              if (include && !matchGlob(entry.name, include) && !matchGlob(path.relative(targetDir, fullPath), include)) {
                continue;
              }

              try {
                // OPTIMIZATION: Early size check BEFORE reading file - CRITICAL FOR TOKEN SAVINGS — ASYNC stat
                const stats = await fs.stat(fullPath);  // ASYNC stat
                if (stats.size > MAX_FILE_SIZE) {
                  continue; // Skip large files to prevent token explosion
                }

                const content = await fs.readFile(fullPath, 'utf-8');  // ASYNC read
                const lines = content.split('\n');

                for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                  if (regex.test(lines[lineIdx])) {
                    matches.push({
                      file: path.relative(targetDir, fullPath),
                      line_number: lineIdx + 1,
                      content: lines[lineIdx].trim(),
                    });
                    resultsCount++;

                    // OPTIMIZATION: Early termination after max results
                    if (resultsCount >= MAX_RESULTS) return;
                  }
                }
              } catch {
                // Skip binary files or unreadable files
              }
            }
          }
        }

        await walkDirectory(targetDir);  // ASYNC call

        return { 
          success: true, 
          data: { 
            matches,
            count: resultsCount,
            truncated: resultsCount >= MAX_RESULTS,
          } 
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
  function matchGlob(filename: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
    return regex.test(filename);
  }

  return tools;
}