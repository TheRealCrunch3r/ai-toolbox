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
// FIX-HANG-5: worker_threads TYPES only (type-only import = zero runtime cost; the value is still lazy-required at call time).
import type * as workerThreads from 'worker_threads';
import { recordFileModification } from './fileModTracker.js';
import { patternScan } from './patternScan.js';
import { searchCandidates, type RipgrepResult } from '../utils/ripgrepEngine.js';
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

/** Hard cap on lines per file for regex-mode grep_files — prevents catastrophic backtracking. */
export const MAX_LINES_PER_FILE = 5000;

// ==================== DEFAULT EXCLUSIONS (PERFORMANCE & TOKEN SAVING) ====================
/** Directory names pruned wholesale by the grep_files walker when NO include pattern is given (see
 *  walkDirectory). Hoisted from walkDirectory to module scope so the ripgrep phase-1 prefilter can
 *  mirror the exact same pruning via `-g '!<name>'` flags. Set contents unchanged by the hoist. */
export const DEFAULT_EXCLUDED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build',
  '.next', '.nuxt', '__pycache__', '.cache',
  'vendor', '.vscode', '.idea', '.vs'
]);

// ==================== FIX-HANG-5: WORKER-ISOLATED REGEX EVALUATION (29.08) ====================
// Residual hang class that survived FIX-HANG-1..4: a SINGLE catastrophic-backtracking
// RegExp.prototype.test() call blocks the JS event loop for minutes and starves EVERY timer —
// including the 15s scan deadline, the 30s fallback AND the 20s wall-clock backstop (timers cannot
// fire while one synchronous call is spinning). No cooperative gating between calls can preempt an
// in-flight .test(). The only mechanism that preempts synchronous JS in Node.js is a separate
// thread: risky patterns are therefore evaluated inside a worker and hard-killed via
// worker.terminate() when the budget expires (node:worker_threads — terminate() kills unpreemptible
// work, per Node docs; nothing else can). Safe patterns keep the inline .test() fast path → zero
// overhead for the common case.

/** Hard-kill budget for one file's worth of regex work in the worker (well under the 15s scan deadline). */
const WORKER_KILL_MS = 2000;

/**
 * Inline worker source: receives { lines, patterns }, tests every line against each pattern
 * (first match per line wins — mirrors the inline loop), posts back matched LINE INDICES. The main
 * thread keeps all match shaping / context extraction; the worker only does the unpreemptible work.
 * Plain ES5 on purpose — no imports, runs identically in every Node ≥ 12 runtime (LM Studio host).
 */
const REGEX_TEST_WORKER_SOURCE = [
  // FIX-HANG-5c (30.08): this runs in a node:worker_threads Worker (see `new WorkerCtor(..., { eval: true })`),
  // NOT a browser Web Worker — so `self.onmessage`/`e.data` are the wrong API and threw "self is not defined" at
  // boot: every risky pattern crashed at worker start (zero regex work) yet was reported as a 2000ms kill.
  // Correct contract here: parentPort's 'message' handler receives the payload value DIRECTLY (no MessageEvent).
  // Verified offline in this runtime (Node v24.15.0): safe pattern returns exact indices; T1b-exact catastrophic
  // payload is hard-killed by worker.terminate() at 2000ms (see docs/history/GATE_PROBE_EVIDENCE_fixhang5c.md, FIX-HANG-5c).
  'var pt; try { pt = require("worker_threads").parentPort; } catch (e) { pt = null; }',
  'if (!pt) throw new Error("no parentPort");',
  'pt.on("message", function (data) {',
  '  var out = [];',
  '  try {',
  '    for (var i = 0; i < data.lines.length; i++) {',
  '      var line = data.lines[i];',
  '      if (!line) continue;',
  '      for (var p = 0; p < data.patterns.length; p++) {',
  '        if (data.patterns[p].test(line)) { out.push(i); break; }',
  '      }',
  '    }',
  '  } catch (err) {',
  '    try { pt.postMessage({ error: String(err && err.message || err) }); } catch (_) {}',
  '    return;',
  '  }',
  '  try { pt.postMessage(out); } catch (_2) {}',
  '});',
].join('\n');

/**
 * FIX-HANG-5 triage — STRICTER than isSafeRegex (which is a deny-list that misses shapes such as
 * brace-bounded nested quantifiers `(a+){25}`, backreferences and deeply nested groups). Anything the
 * gate cannot PROVE cheap goes to the killable worker; the false-positive cost is ~one 10–30ms worker
 * spawn per affected file, hard-capped at WORKER_KILL_MS. Conservative by design: a mis-triaged-safe
 * pattern can hang the host (the incident we are fixing), a mis-triaged-risky one just costs ms.
 */
export function patternNeedsWorkerIsolation(pattern: string): boolean {
  if (!pattern || pattern.length === 0) return false;

  let i = 0;
  const n = pattern.length;
  // Per open group: does the group BODY already contain a quantifier (+ * ? or {...})?
  // A closing ')' followed by ANY quantifier on such a body is the canonical catastrophic shape.
  const groupBodyHasQuantifier: boolean[] = [];
  let sawBackreference = false;

  while (i < n) {
    const c = pattern[i];
    if (c === '\\' && i + 1 < n) { // escaped char — not syntax
      if (/^[1-9]$/.test(pattern[i + 1])) sawBackreference = true; // backrefs: \1, \2…
      i += 2;
      continue;
    }
    if (c === '[') { // character class — skip to closing ']' (escaped ] inside is literal); a quantified class marks its enclosing group body like any other quantifier
      i++;
      while (i < n && pattern[i] !== ']') {
        if (pattern[i] === '\\' && i + 1 < n) i += 2;
        else i++;
      }
      i++; // consume ']'
      let j = i;
      while (j < n && (pattern[j] === ' ' || pattern[j] === '\t')) j++;
      if ((pattern[j] === '+' || pattern[j] === '*' || pattern[j] === '?') || /^\{[0-9]+(,[0-9]*)?\}/.test(pattern.slice(j))) {
        const top = groupBodyHasQuantifier.length - 1;
        if (top >= 0) groupBodyHasQuantifier[top] = true;
      }
      continue;
    }
    if (c === '(') {
      groupBodyHasQuantifier.push(false);
      i++;
      continue;
    }
    if (c === ')') {
      const bodyHadQuantifier = groupBodyHasQuantifier.pop() ?? false;
      // What follows the closing paren?
      let j = i + 1;
      while (j < n && (pattern[j] === ' ' || pattern[j] === '\t')) j++;
      if (bodyHadQuantifier) {
        const q = pattern[j];
        if (q === '+' || q === '*') return true;            // nested unbounded quantifiers: (a+)+, (.*)* …
        if (q === '{') return /^\{[0-9]+(,[0-9]*)?\}/.test(pattern.slice(j)); // FIX-HANG-5b (30.08): UNANCHORED prefix test — the $ anchor required the ENTIRE remaining pattern to be just {n[,m]}, so any trailing content ("{4}x") defeated triage: ((a+){3}){4}x was mis-routed INLINE (T1b double-freeze root cause). Any valid brace quantifier on an unbounded (+/*) body is catastrophic at ANY count form, with or without a following operator.
        // A QUANTIFIED sub-group is itself a repeating unit wherever it sits in an enclosing body — even with
        // literal text between it and the outer ')': ((a+)b)+ = O(n^2) split ambiguity. Forward to the
        // enclosing scope unconditionally (top-level stack empty → no-op). Fixes ((a+)b)+c mis-triage.
        const topQfwd = groupBodyHasQuantifier.length - 1;
        if (topQfwd >= 0) groupBodyHasQuantifier[topQfwd] = true;
      } else {
        const q = pattern[j];
        // Alternation inside a quantified group where two or more branches share a common prefix can also
        // explode (ambiguous segmentation → exponential backtracking on non-matching input): (ab|abc)+d.
        // The inline path has no preemption for that class either, so route it to the killable worker — false
        // positives cost ~one 10–30ms spawn per affected file only (conservative-by-design posture).
        if ((q === '+' || q === '*' || (q === '{' && /^\{[0-9]+(,[0-9]*)?\}/.test(pattern.slice(j))))) {
          const body = pattern.substring(1, i); // between the matched '(' and this ')'
          // Split on TOP-LEVEL pipes only (depth 0 w.r.t. nested groups / char classes).
          const branches: string[] = [];
          let depth2 = 0;
          let startIdx = 0;
          for (let k = 0; k < body.length; k++) {
            if (body[k] === '\\') { k++; continue; }
            if (body[k] === '[') {
              let e = k + 1;
              while (e < body.length && body[e] !== ']') { if (body[e] === '\\') e += 2; else e++; }
              k = e; continue;
            }
            if (body[k] === '(') depth2++;
            else if (body[k] === ')') depth2--;
            else if (body[k] === '|' && depth2 === 0) { branches.push(body.substring(startIdx, k)); startIdx = k + 1; }
          }
          branches.push(body.substring(startIdx));
          // If one branch is a proper prefix of another, segmentation becomes ambiguous → isolate.
          for (let x = 0; x < branches.length; x++) {
            for (let y = 0; y < branches.length; y++) {
              if (x === y) continue;
              const A = branches[x], B = branches[y];
              if (A && B && (B.startsWith(A) || A.startsWith(B))) return true;
            }
          }
        }
      }
      i += 1;
      // After handling ')', fall through to quantifier detection on the same char for the ENCLOSING scope:
      const qAfter = j < n ? pattern[j] : '';
      if (qAfter === '+' || qAfter === '*' || /^{[0-9]+(,[0-9]*)?\}$/.test(qAfter) || qAfter === '?') {
        // Mark the enclosing group body as containing a quantifier.
        const top = groupBodyHasQuantifier.length - 1;
        if (top >= 0) groupBodyHasQuantifier[top] = true;
      } else if (/^\{[0-9]+(,[0-9]*)?\}/.test(pattern.slice(j))) {
        const top = groupBodyHasQuantifier.length - 1;
        if (top >= 0) groupBodyHasQuantifier[top] = true;
      }
      continue;
    }
    // Bare quantifiers mark the enclosing group body as "contains a quantifier".
    if (c === '+' || c === '*' || c === '?') {
      const top = groupBodyHasQuantifier.length - 1;
      if (top >= 0) groupBodyHasQuantifier[top] = true;
      i++;
      continue;
    }
    if (c === '{') {
      // A brace quantifier inside a group body. VARIABLE-length forms ({n,m}, {n,}) are true
      // split-ambiguity sources when that group is later repeated — treat as body quantifiers like +/*/?;
      // fixed {n} stays safe (unique partition) and must NOT mark the body.
      const braceM = pattern.slice(i).match(/^\{[0-9]+(,[0-9]*)?\}/);
      if (braceM) {
        if (/^\{[0-9]+,[0-9]*\}/.test(pattern.slice(i))) {
          const top = groupBodyHasQuantifier.length - 1;
          if (top >= 0) groupBodyHasQuantifier[top] = true;
        }
        i += braceM[0].length;
      } else {
        i++;
      }
      continue;
    }
    i++;
  }

  // Backreferences can force expensive matching on non-matching inputs (engine re-scans alternatives).
  if (sawBackreference) return true;

  return false;
}

/**
 * FIX-HANG-5 — evaluate lines against risky patterns INSIDE a worker with a hard-kill watchdog.
 * Resolves to matched line indices on success, or null when the worker was killed (budget overrun)
 * or failed — callers treat null as "this file's regex work could not complete" and record it in
 * skipped_files instead of letting anything run unbounded on the main thread.
 */
export async function testLinesInWorker(
  lines: string[],
  patterns: RegExp[],
): Promise<number[] | null> {
  try {
    // Lazy require at call time (not module top-level) so unit-test environments that don't use this
    // path — and any runtime where worker_threads is unavailable — never pay for or break on the import.
    // Intentional: load worker_threads lazily at call time so environments without it never pay for / break on the import.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy require is a deliberate design decision (see comment above)
    const WorkerCtor = (require('worker_threads') as typeof workerThreads).Worker;

    return await new Promise<number[] | null>((resolve) => {
      let settled = false;
      let worker: workerThreads.Worker;
      try {
        worker = new WorkerCtor(REGEX_TEST_WORKER_SOURCE, { eval: true });
      } catch (spawnErr) {
        // Environment without worker support → caller falls back to inline matching (documented posture).
        console.warn(`[grep_files] FIX-HANG-5: worker spawn failed (${(spawnErr as Error)?.message}) — falling back to inline regex`);
        resolve(null);
        return;
      }

      const killTimer = setTimeout(() => {
        if (settled) return;
        settled = true;
        console.warn(`[grep_files] FIX-HANG-5: worker exceeded ${WORKER_KILL_MS}ms budget — terminated (possible ReDoS)`);
        worker.terminate().catch(() => { /* already dead */ });
        resolve(null); // killed → report as skipped, NEVER let the spin continue anywhere
      }, WORKER_KILL_MS);

      const onMessage = (msg: unknown): void => {
        if (settled) return;
        settled = true;
        clearTimeout(killTimer);
        worker.removeAllListeners();
        const arr = msg as number[] | { error?: string };
        if (Array.isArray(arr)) resolve(arr.filter((v) => typeof v === 'number'));
        else resolve(null); // worker reported an internal error — treat like a kill for safety
      };
      const onError = (err: Error): void => {
        if (settled) return;
        settled = true;
        clearTimeout(killTimer);
        console.warn(`[grep_files] FIX-HANG-5: worker error (${err.message}) — treating as skipped`);
        worker.terminate().catch(() => { /* already dead */ });
        resolve(null);
      };

      worker.on('message', onMessage);
      worker.once('error', onError);
      // NOTE: 'exit' without a message = killed or crashed → the killTimer (or its settlement) already resolved;
      // nothing to do here, but we keep a listener so an unhandled exit can't surface as noise.
      worker.once('exit', () => { /* handled */ });

      try {
        worker.postMessage({ lines, patterns });
      } catch (postErr) {
        if (!settled) {
          settled = true;
          clearTimeout(killTimer);
          console.warn(`[grep_files] FIX-HANG-5: postMessage failed (${(postErr as Error)?.message})`);
          worker.terminate().catch(() => { /* already dead */ });
        }
        resolve(null);
      }
    });
  } catch (e) {
    console.warn(`[grep_files] FIX-HANG-5: isolation layer failed (${(e as Error)?.message})`);
    return null; // caller treats as "could not complete" and records the skip — safe default
  }
}

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

interface InsertAtLineParams { file_name: string; line_number: number; content_to_insert?: string; content?: string; verify_after_insert?: boolean; }
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


  // ==================== HANG-GUARD LIVE INDICATOR (28.08.2026) ====================
  // Emitted ONCE per plugin load so the LM Studio console proves which build is actually running in memory:
  // if a hung session's logs lack this line, the process is executing a STALE pre-fix bundle — i.e., the
  // FIX-HANG-1/2/4 hard stops (real AbortController, 15s deadline gates, 20s wall-clock backstop) were NOT
  // loaded. This converts "is the fix live?" from inference to a log fact.
  console.log('[ai_toolbox] HANG-GUARD v2 ACTIVE — grep_files + find_replace_all: real abort controller | 15s scan deadline gates | 20s wall-clock backstop (FIX-HANG-1/2/4, FIX-HANG-F1/F2/F3)');

// grep_files tool — Search file contents across directory with regex support (OPTIMIZED FOR TOKEN SAVINGS) — ASYNC ===
  tools.push(tool({
    name: 'grep_files',
    description: 'Search file contents across a directory. ⚠️ Files above max_file_size (default 100KB) OR with more lines than the max_lines cap (default 5000) are SKIPPED — raise those parameters to include them. Skips reported in skipped_files.',
    parameters: {
      pattern: z.string().describe('Regex or literal string to search for'),
      path: z.string().default('.').describe('Directory to search in (defaults to current working directory)'),
      mode: z.enum(['regex', 'ast']).optional().default('regex').describe('Search mode: "regex" for pattern matching or "ast" for structural code analysis'),
      include_context: z.boolean().optional().default(false).describe('Include surrounding lines (2 before/after) in results'),
      max_content_length: z.number().int().min(10).max(500).optional().default(150).describe('Max chars per matched line content (default: 150)'),
      include: z.string().optional().describe('File glob pattern to include (e.g., "*.ts", "src/**/*.js")'),
      exclude: z.string().optional().describe('Glob pattern for files/directories to exclude (e.g., "node_modules", "*.bak"); same glob semantics as include'),
      max_results: z.number().int().min(1).max(500).default(20).describe('Maximum number of results to return (default: 20, max: 500)'),
      max_file_size: z.number().int().min(1024).default(100_000).describe('Max file size in bytes to search (default: 100KB). Files above this limit are NOT searched and appear in skipped_files. Raise this value (e.g., 300_000) to include them.'),
      max_lines: z.number().int().min(100).optional().default(MAX_LINES_PER_FILE).describe(`Max lines per file to search (default ${MAX_LINES_PER_FILE}). Files with more lines are NOT searched and appear in skipped_files. Raise this value (e.g., 10_000) to include very long files such as generated .d.ts bundles.`),
      max_concurrent_files: z.number().int().min(1).max(32).optional().default(8).describe('Maximum files to process concurrently for performance tuning'),
      max_depth: z.number().int().min(1).max(50).optional().default(10).describe('Maximum directory depth to search (default: 10, prevents infinite recursion)'),
    },
    implementation: async ({ pattern, path: searchPath = '.', mode = 'regex', include, exclude, max_results, max_file_size, max_content_length, include_context = false, max_lines, max_concurrent_files, max_depth }: {
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
      max_lines?: number;
      max_depth?: number;
    }, ctx?: { signal?: AbortSignal }) => {
      try {
        // FIX-HANG-4 (SDK compliance, 27.08): @lmstudio/sdk calls implementations as (args, toolCallContext) where
        // ToolCallContext.signal is "a signal that should be listened to in order to know when to abort the tool call"
        // (verified: node_modules/@lmstudio/sdk/dist/index.d.ts + index.cjs passes ongoingToolCall.abortController.signal).
        // Forward host aborts into the single internal controller so EVERY existing cooperative check reacts.
        const abortController = new AbortController();

        // FIX-HANG-1 (silent 2-min hang, root-caused 26.08): ONE authoritative abort state for the whole scan.
        // Previously `signal` was destructured from an empty object — every "abort check" below tested a value
        // that was ALWAYS undefined, and no loop ever read the internal controller's flag. So when the deadline
        // fired, all in-flight work kept running to completion (the observed silent hang; host had to kill it).

        // FIX-HANG-4: forward host aborts into the single internal controller. Host signals are one-way per
        // WHATWG DOM spec (no reverse .abort()), so we LISTEN — every existing cooperative check then reacts.
        const hostSignal = ctx?.signal;
        if (hostSignal) {
          if (hostSignal.aborted) abortController.abort();
          else hostSignal.addEventListener('abort', () => abortController.abort(), { once: true });
        }

        const targetDir = resolvePath(searchPath);

        if (!validatePath(searchPath, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        // Configuration with defaults - TOKEN LIMITING + DEPTH LIMIT
        const MAX_RESULTS = max_results ?? 20;
        const effectiveMaxFileSize = max_file_size ?? MAX_FILE_SIZE; // use module-level default
        const MAX_CONTENT_LENGTH = max_content_length ?? 150;
        const MAX_DEPTH = max_depth ?? 10; // Prevent infinite recursion
        const effectiveMaxLines = max_lines ?? MAX_LINES_PER_FILE; // FIX-G3: line cap is configurable (ReDoS posture preserved at default)

        // RIPGREP PHASE-1 state (Option A engine swap, plan_1788282568340_z5a4r521c P2-G7): null = prefilter
        // disabled or fell back → the full-JS walk below runs EXACTLY as before (byte-for-byte fallback).
        let rgCandidateRelPaths: Set<string> | null = null;
        let resultsCount = 0;
        let filesScanned = 0; // Count of files that passed all gates and were actually searched
        const matches: Array<{ file: string; line_number: number; content: string; node_type?: string; context?: { function_signature?: string; class_context?: string; docblock?: string } }> = [];

        // FIX (silent-skip bug): track files dropped by size/line gates so callers are never
        // left with an unexplained empty result. Mirrors find_replace_all's filesSkipped pattern.
        const skippedFiles: Array<{ file: string; reason: string }> = [];

        // ==================== REGEX VALIDATION + AUTO-ESCAPE ====================
        let regexes: RegExp[] = [];  // ← Changed from single regex to array of regexes
        let patternMode: 'regex' | 'literal' | 'auto_escaped' = 'regex';

        /**
         * Check if a top-level alternation (|) exists in the pattern, NOT inside parentheses.
         * Returns true if the pattern uses | at the top level (e.g., "a|b", "x\\(|y").
         */
        function hasTopLevelAlternation(p: string): boolean {
          let depth = 0;
          for (let i = 0; i < p.length; i++) {
            const c = p[i];
            // Escape-aware (BUG FIX): skip escaped chars so \(\ ) \| are NOT counted as
            // group delimiters / alternation operators. Without this, "countTokens\(" corrupts
            // the depth count and a top-level | later in the pattern is misclassified.
            if (c === '\\' && i + 1 < p.length) { i++; continue; }
            if (c === '(') depth++;
            else if (c === ')') depth--;
            else if (c === '|' && depth === 0) return true;
          }
          return false;
        }

        // FIX: Auto-detect code signatures and auto-escape special characters
        // If pattern contains C/C++/Rust code indicators (*, &, ->, ::, template <>) and
        // lacks explicit regex escaping (\*, \(, \)), treat as literal search.
        const codeSignatureIndicators = ['::', '->', '<', '>'];
        const hasCodeIndicator = codeSignatureIndicators.some(ind => pattern.includes(ind));
        // NOTE: Even if the user escaped SOME chars (like \( \)), unescaped * + ? still cause hangs.
        const hasUnescapedBacktrackingChar = /(?<!\\)[*+?]/.test(pattern);
        // REV-24: bare & REMOVED (same false-positive as security.ts isSafeRegex — "& word" is ordinary
        // prose, e.g. section names like "Git & GitHub"; zero backtracking risk since & has no metachar).
        // Real code-signature cases still caught via the -> / :: / <T> indicators + unescaped [*+?].
        const hasUnescapedCodeChar = /(?<!\\)[*]/.test(pattern);
        const looksLikeCodeSignature = hasCodeIndicator && (hasUnescapedBacktrackingChar || hasUnescapedCodeChar);

        try {
          if (looksLikeCodeSignature) {
            // Auto-escape: treat as literal string search (prevents catastrophic backtracking on C++ signatures)
            regexes = [new RegExp(escapeRegExp(pattern), 'i')];
            patternMode = 'auto_escaped';
          } else if (!isSafeRegex(pattern)) {
            regexes = [new RegExp(escapeRegExp(pattern), 'i')];
            patternMode = 'literal';
          } else if (hasTopLevelAlternation(pattern)) {
            // CRITICAL FIX: Split top-level alternation into separate regexes to prevent
            // catastrophic backtracking when branches share overlapping substrings.
            // e.g., "validateImageFile\(|\.resolvedPath!|await validateImageFile" → 3 separate tests
            const branches: string[] = [];
            let currentBranch = '';
            let branchDepth = 0;
            for (let i = 0; i < pattern.length; i++) {
              // Escape-aware (BUG FIX): consume the escaped char so \(\ ) \| are treated as
              // literal text, not group/alternation syntax. This is what makes "a\(|b" split
              // into ["a\\(", "b"] instead of mis-nesting and gluing branches together.
              if (pattern[i] === '\\' && i + 1 < pattern.length) {
                currentBranch += pattern[i] + pattern[i + 1];
                i++;
                continue;
              }
              if (pattern[i] === '(') branchDepth++;
              else if (pattern[i] === ')') branchDepth--;
              else if (pattern[i] === '|' && branchDepth === 0) {
                branches.push(currentBranch);
                currentBranch = '';
              } else {
                currentBranch += pattern[i];
              }
            }
            if (currentBranch.length > 0) branches.push(currentBranch);

            regexes = branches.map(branch => new RegExp(branch, 'i'));
            patternMode = 'regex';
          } else {
            regexes = [new RegExp(pattern, 'i')];
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
          
          // ABORT SIGNAL CHECK - LM Studio compliance (FIX-HANG-1: real controller, was dead code)
          if (abortController.signal.aborted) return;

          try {
            // RIPGREP PHASE-1 GATE (Option A engine swap) + SKIP-RECORD PARITY (round-3 fix): when the rg prefilter
            // succeeded, files it did not name can never yield matches by construction — but they MUST still pass
            // through BOTH size gates so skipped_files keeps its pre-swap contract ("files above max_file_size OR
            // over the line cap are reported in skipped_files", pinned by grep_files_hang_backstop + grepFilesParity).
            // rg runs WITHOUT --max-filesize (engine header §5: size gate stays in phase 2, exact-byte records), so a
            // non-named file can still be over the size cap; the stat below restores that record at ~1 syscall cost.
            const stats = await fs.stat(fullPath);
            if (stats.size > effectiveMaxFileSize) {
              skippedFiles.push({ file: relativePath, reason: `exceeds max_file_size (${stats.size} bytes > ${effectiveMaxFileSize} bytes) — re-run with a higher max_file_size to include it` });
              return;
            }
            if (rgCandidateRelPaths !== null && !rgCandidateNamed(relativePath)) {
              // Non-named + size gate passed → old full-JS flow would read the file and apply the line cap before any
              // regex work. Re-read ONLY to count lines so over-cap non-matching files get their record too — this is
              // exactly what the pre-swap walker did (it always read every gate-passing file) at ~stat+read cost per
              // such file; NO .test() runs, no shaping, no worker. Named candidates skip straight to the shared read.
              const probe = await fs.readFile(fullPath); // Buffer: newline counting needs no utf8 decode of content
              let newlines = 0;
              for (let k = 0; k < probe.length; k++) if (probe[k] === 10) newlines++;
              const lineCount = newlines + 1; // split('\n') semantics: N newline bytes → N+1 elements (trailing empty counts)
              if (lineCount > effectiveMaxLines) {
                skippedFiles.push({ file: relativePath, reason: `exceeds ${effectiveMaxLines} line limit (${lineCount} lines — per-file safety cap to prevent catastrophic regex backtracking; raise max_lines to include this file)` });
                console.log(`[grep_files] Skipping file ${relativePath} (${lineCount} lines, exceeds ${effectiveMaxLines} line limit)`);
              }
              return;
            }

            // Named candidate (or full-JS fallback walk): both gates already cleared above — proceed to shared read/shaping.
            const content = await fs.readFile(fullPath, 'utf-8');

            if (mode === 'ast') {
              // ==================== AST MODE ====================
              const ast = parseToAST(content, fullPath);
              if (!ast) {
                // AST parsing failed — fall back to regex for this file
                return processWithRegex(content, relativePath, regexes);
              }

              // File passed size gate in AST mode → count as scanned
              filesScanned++;
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
              await processWithRegex(content, relativePath, regexes);
            }
          } catch {
            // Skip binary files or unreadable files
          }
        }

        // ==================== HARD STOP FOR SYNCHRONOUS REGEX WORK (BUG FIX) ====================
        // JS cannot preempt a spinning synchronous .test() call, and the external 30s AbortSignal
        // timer CANNOT fire while such a loop is running. So we enforce cooperative stops HERE:
        //   1. A wall-clock deadline — checked every line; exceeded → abort (sets signal.aborted).
        //   2. A per-line length cap — pathological single lines are never meaningful matches and
        //      dominate .test() cost, so skip them instead of scanning MB-sized strings.
        const GREP_SCAN_DEADLINE_MS = 15000;      // hard ceiling for the whole synchronous scan (well under host timeout)
        const MAX_LINE_CHARS_REGEX_MODE = 20000;  // skip individual lines longer than this in regex mode
        const PER_REGEX_TIMEOUT_MS = 500;         // max ms a single .test() may take before that branch is abandoned
        const grepScanStartedAt = Date.now();

        /**
         * Process file with regex pattern matching.
         */
        async function processWithRegex(content: string, relativePath: string, compiledRegexes: RegExp[]): Promise<void> {
          const lines = content.split('\n');

          // CRITICAL FIX: Limit per-file processing to prevent catastrophic backtracking on large files
          // JavaScript has no mechanism to abort sync .test() calls — we must limit input size.
          if (lines.length > effectiveMaxLines) {
            skippedFiles.push({ file: relativePath, reason: `exceeds ${effectiveMaxLines} line limit (${lines.length} lines — per-file safety cap to prevent catastrophic regex backtracking; raise max_lines to include this file)` });
            // FIX (v1.9.10): was console.warn — this is an expected, informational skip event
            // (already reported to the caller via skippedFiles). warn→stderr showed it as [ERROR] in LM Studio logs.
            console.log(`[grep_files] Skipping file ${relativePath} (${lines.length} lines, exceeds ${effectiveMaxLines} line limit)`);
            return;
          }

          // File passed both size gate AND line-cap gate → count as scanned
          filesScanned++;

          // ==================== FIX-HANG-5: worker isolation for risky patterns (29.08) ====================
          // A single catastrophic-backtracking .test() on a RISKY pattern (nested quantifiers / backrefs —
          // see patternNeedsWorkerIsolation) blocks the event loop and starves EVERY timer, so the 15s scan
          // deadline, 30s fallback and 20s wall-clock backstop all cannot fire while it spins. Such patterns are
          // therefore evaluated for this whole file INSIDE a worker (single round-trip; hard-terminated after
          // WORKER_KILL_MS via worker.terminate()). Safe patterns keep the inline .test() fast path — zero overhead.
          const hasRiskyPatterns = compiledRegexes.some(r => patternNeedsWorkerIsolation(r.source));
          let riskyMatchedLineSet: Set<number> | null = null;
          if (hasRiskyPatterns) {
            // Abort/deadline may have fired between gates — honor before spending the round-trip.
            if (!abortController.signal.aborted && resultsCount < MAX_RESULTS && Date.now() - grepScanStartedAt <= GREP_SCAN_DEADLINE_MS) {
              const idx = await testLinesInWorker(lines, compiledRegexes);
              if (idx === null) {
                // Worker killed/failed — likely ReDoS: record the skip and stop this file. The host is now SAFE:
                // nothing unbounded runs on it for this file (the kill budget already burned). Other files continue.
                skippedFiles.push({ file: relativePath, reason: `regex evaluation terminated in isolated worker after ${WORKER_KILL_MS}ms — likely ReDoS-prone pattern (nested quantifiers / backreference); refine the pattern or narrow the search scope` });
                console.log(`[grep_files] FIX-HANG-5: skipped ${relativePath} (worker kill — possible ReDoS)`);
                return;
              }
              const s = new Set<number>();
              for (const i of idx) { if (i >= 0 && i < lines.length) s.add(i); }
              riskyMatchedLineSet = s;
            } else {
              // Deadline/abort already tripped → skip the round-trip entirely; per-line checks below exit.
              riskyMatchedLineSet = null;
            }
          }

          // Gate above guarantees lines.length <= effectiveMaxLines here — no truncation possible
          for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            // ABORT SIGNAL CHECK per-line - LM Studio compliance for long files (FIX-HANG-1: real controller)
            if (abortController.signal.aborted) return;
            // STRICT LIMIT CHECK before processing each line
            if (resultsCount >= MAX_RESULTS) return;

            // HARD STOP 1: wall-clock deadline — a spinning .test() can never be preempted by the
            // external timer, so we self-police here and abort cooperatively once time is up. (For
            // worker-isolated files this also bounds the NUMBER of killable round-trips.)
            if (Date.now() - grepScanStartedAt > GREP_SCAN_DEADLINE_MS) {
              console.warn(`[grep_files] Scan deadline (${GREP_SCAN_DEADLINE_MS}ms) exceeded — aborting to prevent hang`);
              // Internal controller only: the host AbortSignal is one-way (no .abort() method per WHATWG DOM spec).
              abortController.abort();
              return;
            }

            // HARD STOP 2: per-line length cap — skip pathological single lines (e.g. minified or
            // generated one-liners) that dominate .test() cost but are never useful matches.
            if (lines[lineIdx].length > MAX_LINE_CHARS_REGEX_MODE) continue;

            let matched = false;
            const lineText = lines[lineIdx];

            if (riskyMatchedLineSet !== null) {
              // FIX-HANG-5: this file carries a risky pattern — the whole-file evaluation already ran in an
              // isolated, killable worker (see pre-loop block). The result is a pure lookup now; no unpreemptible
              // regex work executes on the main thread for this line.
              matched = riskyMatchedLineSet.has(lineIdx);
            } else {
            for (const r of compiledRegexes) {
              // HARD STOP 3 (FIXED, 26.08): a spinning .test() CANNOT be preempted — JS has no way to
              // interrupt it mid-execution. The only real defense is to never START new regex work once the
              // budget is exhausted. The previous check ran AFTER test() returned (i.e., never during the
              // spin), so a single pathological call could block the event loop — and with it ALL timers,
              // including the deadline and the 30s abort timer — for minutes. Gate BEFORE each test:
              if (abortController.signal.aborted) return;
              if (Date.now() - grepScanStartedAt > GREP_SCAN_DEADLINE_MS) {
                console.warn(`[grep_files] Scan deadline (${GREP_SCAN_DEADLINE_MS}ms) exceeded mid-regex — aborting to prevent hang`);
                abortController.abort();
                return;
              }
              const reStart = Date.now();
              if (r.test(lineText)) {
                matched = true;
                break;
              }
              // Post-test observation only (informational): a single test() that took longer than budget is
              // reported, but the binding guarantee is the pre-test gate above + the outer backstop race.
              if (Date.now() - reStart > PER_REGEX_TIMEOUT_MS) {
                console.warn(`[grep_files] Regex timed out (>${PER_REGEX_TIMEOUT_MS}ms per test) on line ${lineIdx + 1}; skipping remaining patterns for this line`);
              }
            }
            } // end FIX-HANG-5 inline fast path (safe patterns only)
            if (matched) {
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

        // Round-3 parity helper: O(1) membership test for the rg candidate set in BOTH normalized forms —
        // forward slashes (the stored form, incl. out-of-root absolute no-op entries) and native separators.
        function rgCandidateNamed(relPathNative: string): boolean {
          if (!rgCandidateRelPaths || rgCandidateRelPaths.size === 0) return false;
          const norm = relPathNative.split(path.sep).join('/');
          if (rgCandidateRelPaths.has(norm)) return true;
          // Windows-only belt & braces: native backslash form in case a caller ever passes an un-normalized path.
          if (path.sep !== '/') { const bs = norm.split('/').join('\\'); if (rgCandidateRelPaths.has(bs)) return true; }
          return false;
        }

        async function walkDirectory(dirPath: string, concurrencyLimit: number, currentDepth: number = 0): Promise<void> {
          // DEPTH LIMIT ENFORCEMENT — prevent infinite recursion
          if (currentDepth > MAX_DEPTH) return;

          // OPTIMIZATION: Early exit if we have enough results
          if (resultsCount >= MAX_RESULTS) return;
          
          // ABORT SIGNAL CHECK - LM Studio compliance (FIX-HANG-1: real controller, was dead code)
          if (abortController.signal.aborted) return;

          let entries: _fs.Dirent[];
          try {
            entries = await fs.readdir(dirPath, { withFileTypes: true });
          } catch {
            return; // Skip inaccessible directories
          }

          // (DEFAULT_EXCLUDED_DIRS hoisted to module scope — see constants block above; walkDirectory references it via closure)

          const batchPromises: Array<Promise<void>> = [];

          for (const entry of entries) {
            // Skip large/bloat directories by default (unless explicitly included via include pattern)
            if (!include && DEFAULT_EXCLUDED_DIRS.has(entry.name)) continue;
            
            const fullPath = path.join(dirPath, entry.name);

            // Check user-provided exclude patterns — FIX-G4: glob semantics via the same matchGlob as include
            if (exclude) {
              const relEntry = path.relative(targetDir, fullPath);
              if (matchGlob(relEntry, entry.name, exclude)) continue;
            }

            if (entry.isDirectory()) {
              batchPromises.push(walkDirectory(fullPath, concurrencyLimit, currentDepth + 1));
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

        // ==================== OPERATION TIMEOUT + ABORT HANDLING ====================
        // FIX: Prevent indefinite hangs from regex backtracking or large directory trees
        // LM Studio compliance: Support both AbortSignal (ctx.signal) and setTimeout fallback
        
        const GREP_TIMEOUT_MS = 30000; // 30 seconds max fallback timeout
        
        // FIX-HANG-1: `abortController` is created ONCE at the top of this implementation (single source of
        // truth for all loop checks). The old code declared a SECOND controller here that only this timer
        // referenced, while every loop check read an always-undefined `signal` — so the 30s abort was never observed.
        
        // Fallback timeout: sets the authoritative aborted flag after GREP_TIMEOUT_MS. (If synchronous work is
        // starving the event loop, even THIS timer cannot fire until it yields — that residual window is closed by
        // the wall-clock backstop race below, which settles the tool call regardless.)
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        // FIX-HANG-3: declared OUTSIDE the try — a finally block cannot see variables scoped to the try body.
        let backstopId: ReturnType<typeof setTimeout> | undefined;
        timeoutId = setTimeout(() => abortController.abort(), GREP_TIMEOUT_MS);

        try {
          // ==================== RIPGREP PHASE 1 — candidate-file prefilter (Option A engine swap) ====================
          // Directory + regex mode only. On 'ok' the walker's per-file gate below restricts phase-2 processing to
          // rg-named candidates; ANY other outcome (fallback-required incl. dialect parse error / missing dep /
          // unexpected throw) leaves rgCandidateRelPaths null → the full-JS walk runs byte-for-byte as before,
          // with every existing hang guard intact. Phase 1 is awaited BEFORE scan start, so its cost is outside
          // the GREP_SCAN_DEADLINE window and cannot consume budget meant for line work.
          if (mode === 'regex' && targetStats.isDirectory()) {
            let rgRes: RipgrepResult | null = null;
            try {
              rgRes = await searchCandidates({
                rootDir: targetDir,
                pattern,                    // raw user input — boolean-equivalent to the split-branch set for per-line presence output (ripgrepEngine header §6)
                mode: patternMode === 'auto_escaped' || patternMode === 'literal' ? 'literal' : 'regex',
                caseInsensitive: true,      // production compiles every grep_files regex with 'i' (verified P1 source read L2322/2325/2354/2357)
                excludeGlobs: include ? [] : Array.from(DEFAULT_EXCLUDED_DIRS),  // mirrors walker conditional pruning (include suppresses defaults — preserved by hoist)
                maxDepth: MAX_DEPTH,
              });
            } catch {
              rgRes = null;                 // searchCandidates is contractually non-throwing; this is belt & braces for the fallback guarantee
            }
            if (rgRes?.status === 'ok') {
              const set = new Set<string>();
              for (const p of rgRes.files ?? []) {
                let norm = p.split('\\').join('/'); // rg emits forward slashes; normalize defensively anyway
                // G9 round-2 parity fix (01.09.2026): rg ran with an ABSOLUTE rootDir, so it reports matched files by absolute path — but the
                // processFile gate above compares against targetDir-RELATIVE paths (path.relative). Without relativizing here the set never
                // intersects and every file early-returns: matches=[], skipped_files absent, filesScanned=0. Paths that do not sit under
                // targetDir are kept in normalized absolute form so they can never match a relativePath (safe no-op).
                norm = path.relative(targetDir, norm.split('/').join(path.sep)).split(path.sep).join('/');
                set.add(norm);
              }
              rgCandidateRelPaths = set;
              console.log(`[grep_files] ripgrep phase-1 → ok (${set.size} candidate file(s))`);
            } else {
              console.log(`[grep_files] ripgrep phase-1 → ${rgRes ? rgRes.status + `${rgRes.reason ? ` (${rgRes.reason})` : ''}` : 'unexpected error'} — full-JS walk (fallback path)`);
            }
          }

          // ==================== WALL-CLOCK BACKSTOP FOR BOTH TARGET TYPES (FIX-HANG-2, 26.08) ====================
          // A spinning synchronous segment (.test(), AST parse) starves every timer — including the one above.
          // This race therefore settles the TOOL CALL itself at deadline+5s with whatever partial results exist,
          // instead of letting the caller wait on a black hole (observed failure: silent 2-minute hang, host had
          // to abort the call without any result). The scan keeps running in the background if it slips past;
          // its writes go into arrays nobody reads after this function returns.
          const backstopMs = GREP_SCAN_DEADLINE_MS + 5000; // generous backstop over the internal deadline
          let scanPromise: Promise<void>;
          if (targetStats.isFile()) {
            // ==================== TARGET IS A FILE — search within it directly ====================
            console.log(`[grep_files] Detected single file '${targetDir}' — searching in-file instead of listing directory`);
            scanPromise = processFile(targetDir, path.basename(targetDir));
          } else {
            // ==================== TARGET IS A DIRECTORY — walk and search recursively (concurrent) ====================
            const concurrencyLimit = max_concurrent_files ?? 8;
            scanPromise = walkDirectory(targetDir, concurrencyLimit);
          }
          await Promise.race([
            scanPromise,
            new Promise<'backstop'>((resolve) => {
              backstopId = setTimeout(() => {
                abortController.abort(); // declare aborted state; partial results already accumulated in `matches`
                console.warn(`[grep_files] Wall-clock backstop (${backstopMs}ms) reached — returning partial results to prevent hang`);
                resolve('backstop');
              }, backstopMs);
            }),
          ]);
        } catch (error) {
          // Check if this was an abort vs a real error
          if (abortController.signal.aborted) { // FIX-HANG-1: single controller; old `|| signal?.aborted` referred to a variable that no longer exists
            // Return partial results with aborted flag per LM Studio pattern
            console.warn(`[grep_files] aborted in ${Date.now() - grepScanStartedAt}ms (host/timeout) — ${filesScanned} file(s) scanned, ${resultsCount} match(es), ${skippedFiles.length} skipped [partial results]`);
            return {
              success: true,
              data: {
                matches,
                count: resultsCount,
                filesScanned,
                truncated: resultsCount >= MAX_RESULTS,
                mode,
                patternMode,
                ...(skippedFiles.length > 0 && { skipped_files: skippedFiles }),
                ...(matches.length === 0 && skippedFiles.length > 0 && { warning: `No matches found and ${skippedFiles.length} file(s) were NOT searched because they exceeded limits (defaults: max_file_size=100KB, line cap=${MAX_LINES_PER_FILE} — both raisable via the max_file_size / max_lines parameters). Check the "skipped_files" list above — matches may exist in those files. Re-run with higher max_file_size/max_lines or use read_file directly on them.` }),
                aborted: true,
                hint: 'Operation was aborted by host or timeout. Partial results returned.',
                ...(patternMode === 'auto_escaped' && { autoEscaped: true, hint: "Pattern fell back to LITERAL mode (auto-escaped): the ENTIRE pattern is treated as one exact string, so alternation (|) cannot match branch-by-branch — 0 matches here is expected behavior of literal mode, not absence of content. To fix: escape special characters per branch (e.g. 'Git \\& GitHub') or split the search into 2–4 smaller grep_files calls; note patterns >500 chars are also forced to literal mode." }),
              },
            };
          }
          throw error; // Re-throw non-abort errors
        } finally {
          // Clean up timeouts to prevent memory leaks.
          // FIX-HANG-3: the backstop timer MUST be disarmed on normal completion too — it was previously orphaned,
          // so 20s after EVERY healthy grep (scan already returned its full result) it fired a spurious
          // "[grep_files] Wall-clock backstop ... reached" [ERROR]. Root cause of the "recurring >20s hang":
          // log forensics 27.08 show 8/8 pairings of RESULT-DELTA → BACKSTOP-ERROR at exactly Δ=+20.0s with no scan in flight.
          if (timeoutId) clearTimeout(timeoutId);
          if (backstopId !== undefined) clearTimeout(backstopId);
        }

        // Completion telemetry (30.08): per-call wall-clock via console.warn → stderr, the ONLY channel LM Studio
        // persists to logs\main.log (stdout is dropped). Lets log forensics separate scan time from model-generation time.
        console.warn(`[grep_files] completed in ${Date.now() - grepScanStartedAt}ms — ${filesScanned} file(s) scanned, ${resultsCount} match(es), ${skippedFiles.length} skipped${abortController.signal.aborted ? ' [ABORTED — partial results]' : ''}`);
        return {
          success: true,
          data: {
            matches,
            count: resultsCount,
            filesScanned,
            truncated: resultsCount >= MAX_RESULTS,
            mode,
            patternMode,
            // FIX-HANG-1: surface cooperative aborts on the SUCCESS path too — otherwise a deadline-trimmed scan is
            // indistinguishable from a normal completion (the catch-path `aborted` flag only fires when the walk throws).
            ...(abortController.signal.aborted && { aborted: true, hint: 'Scan was cut short by an internal deadline/timeout. Results are partial; re-run with narrower scope or higher limits if you need full coverage.' }),
            ...(skippedFiles.length > 0 && { skipped_files: skippedFiles }),
            ...(matches.length === 0 && skippedFiles.length > 0 && { warning: `No matches found and ${skippedFiles.length} file(s) were NOT searched because they exceeded limits (defaults: max_file_size=100KB, line cap=${MAX_LINES_PER_FILE} — both raisable via the max_file_size / max_lines parameters). Check the "skipped_files" list above — matches may exist in those files. Re-run with higher max_file_size/max_lines or use read_file directly on them.` }),
            ...(patternMode === 'auto_escaped' && { autoEscaped: true, hint: "Pattern fell back to LITERAL mode (auto-escaped): the ENTIRE pattern is treated as one exact string, so alternation (|) cannot match branch-by-branch — 0 matches here is expected behavior of literal mode, not absence of content. To fix: escape special characters per branch (e.g. 'Git \\& GitHub') or split the search into 2–4 smaller grep_files calls; note patterns >500 chars are also forced to literal mode." }),
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

  /** Glob pattern matcher (supports *, ?, **) — FIX-G1: anchored last, char-by-char build */
  function matchGlob(fullPath: string, filename: string, pattern: string): boolean {
    // FIX-G1 (2026-08-22): build the regex char-by-char from the RAW glob and anchor LAST.
    // Previous version prepended "^" before escaping specials — its escape pass turned the
    // anchor into a literal \^ character match, so EVERY include pattern matched nothing:
    // grep_files(include="*.ts") silently scanned 0 files (no skipped_files, no warning).
    let regexStr = '';
    for (let i = 0; i < pattern.length; i++) {
      const c = pattern[i];
      if (c === '*') {
        // ** → match across path separators (multi-segment); lone * → within one segment only
        if (pattern[i + 1] === '*') {
          regexStr += '.*';
          i++;
        } else {
          regexStr += '[^/]*';
        }
      } else if (c === '?') {
        // ? → exactly one character that is not a path separator
        regexStr += '[^/]';
      } else {
        // Escape remaining literal regex-specials (generated fragments never re-escaped)
        regexStr += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
      }
    }
    try {
      // Anchor at the start AND end so globs match whole path segments (e.g. "*.ts" must not match "x.ts.bak")
      const regex = new RegExp('^' + regexStr + '$', 'i');
      // Normalize Windows backslash separators so "/"-style glob patterns match on every platform
      const normalized = fullPath.replace(/\\/g, '/');
      return regex.test(normalized) || regex.test(filename);
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

        // FIX-HANG-F1 (port of grep_files FIX-HANG-1, 27.08): ONE authoritative abort state for the whole scan.
        // The old code destructured `signal` from an EMPTY object literal — every "abort check" below tested a
        // value that was ALWAYS undefined, so no loop ever observed any abort (host had to kill the process).
        const abortController = new AbortController();

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

        // ==================== FIX-HANG-F2/F3 (port of grep_files hard stops, 27.08) ====================
        // A single content.match(regex)/content.replace(...) over a whole file is ONE unpreemptible synchronous
        // segment: JS cannot interrupt it mid-execution and NO timer (abort, deadline, host fallback) can fire
        // while it spins — measured 210ms for a .test() on a 23-char near-miss with ~x4 growth per char.
        // Defense in depth (same posture as grep_files): pattern analysis is NOT the binding guarantee;
        //   1. pre-call wall-clock gate before every synchronous regex op,
        //   2. backstop race that settles this tool call at deadline+5s regardless of what is still spinning.
        const FRA_SCAN_DEADLINE_MS = 15000;     // hard ceiling for the whole scan (well under host kill time)
        const fraScanStartedAt = Date.now();

        /** Cooperative deadline check — call BEFORE starting any synchronous regex work on file content. */
        function abortIfDeadlineExceeded(where: string): boolean {
          if (abortController.signal.aborted || Date.now() - fraScanStartedAt > FRA_SCAN_DEADLINE_MS) {
            console.warn(`[find_replace_all] Scan deadline (${FRA_SCAN_DEADLINE_MS}ms) exceeded ${where} — aborting to prevent hang`);
            abortController.abort();
            return true;
          }
          return false;
        }

        async function walkDir(dirPath: string, currentDepth: number = 0): Promise<void> {
          // DEPTH LIMIT ENFORCEMENT — prevent infinite recursion
          if (currentDepth > max_depth) return;

          if (filesProcessed.length >= max_files) return;

          // ABORT SIGNAL CHECK - LM Studio compliance (FIX-HANG-F1: real controller flag — was a dead check on an always-undefined `signal`)
          if (abortController.signal.aborted) return;

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

        // ==================== FIX-HANG-F3 (port of grep_files FIX-HANG-2): WALL-CLOCK BACKSTOP RACE ====================
        // A spinning .match()/.replace() segment starves EVERY timer — without this race the only way out is a host
        // kill (~120s, observed failure class). The backstop settles THIS tool call at deadline+5s with whatever partial
        // results exist; when it fires we return below with aborted:true. Any still-spinning background work writes into
        // arrays nobody reads after the return, and its next file-boundary check sees the abort flag and stops there.
        let backstopId: ReturnType<typeof setTimeout> | undefined; // cleared on normal completion — otherwise the timer would fire a stray warn 20s after every healthy scan
        try {
          await Promise.race([
            walkDir(targetDir),
            new Promise<'backstop'>((resolve) => {
              backstopId = setTimeout(() => {
                abortController.abort(); // declare aborted state; partial results already accumulated in filesProcessed/totalMatches
                console.warn(`[find_replace_all] Wall-clock backstop (${FRA_SCAN_DEADLINE_MS + 5000}ms) reached — returning partial results to prevent hang`);
                resolve('backstop');
              }, FRA_SCAN_DEADLINE_MS + 5000);
            }),
          ]);
        } catch (err) {
          if (!abortController.signal.aborted) return handleError(err); // genuine error → previous behavior preserved
          // Aborted mid-apply: NOT a hard failure — report the partial state below so the caller knows exactly what was modified.
        } finally {
          // Always disarm the backstop once settled (either outcome) to prevent a stray warn firing later.
          if (backstopId) clearTimeout(backstopId);
        }

        const aborted = abortController.signal.aborted;

        if (dry_run) {
          return {
            success: true,
            data: {
              dryRun: true,
              totalMatches,
              filesAffected: filesProcessed.length,
              files: filesProcessed,
              skipped: filesSkipped,
              // FIX-HANG-F1 (port): surface cooperative aborts on the SUCCESS path too — otherwise a deadline-trimmed scan is indistinguishable from a normal completion.
              ...(aborted && { aborted: true }),
              ...(aborted
                ? { message: `Dry run cut short at ${FRA_SCAN_DEADLINE_MS}ms deadline (partial results). Re-run with narrower scope or higher limits for full coverage.` }
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
            // FIX-HANG-F1 (port): surface cooperative aborts on the SUCCESS path too. In apply mode this doubles as a
            // mid-batch safety report — files listed above were modified; files after the cut point were NOT touched.
            ...(aborted && { aborted: true }),
            ...(aborted
              ? { message: `Changes applied to ${filesProcessed.length} file(s) BEFORE the scan was cut short by the ${FRA_SCAN_DEADLINE_MS}ms deadline (partial results). Remaining files in scope were NOT modified — re-run with narrower scope or higher limits for full coverage.` }
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

Differences vs grep_files: fails fast on unsafe or syntactically invalid regexes by auto-demoting to literal mode (reported via demotedToLiteral), fully async with bounded concurrency, hard per-file and total match caps (stats.truncated when hit), explicit skipped[] reporting for oversized/line-capped/binary files, deterministic ordering (file, then line).
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
    }) => {
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