/**
 * Atomic File Write Utility — Crash-Resilient
 * 
 * Protects against file corruption during process crashes/OOM by writing to a
 * randomized temp file first, then atomically renaming it. The rename() syscall
 * is atomic on all major OSes (POSIX, Windows NT+), meaning either the entire
 * operation completes or none of it does — no partial writes possible.
 * 
 * Usage:
 *   await atomicWriteFile(filePath, content);           // text files
 *   await atomicWriteBinaryFile(filePath, buffer);      // binary files (images, etc.)
 */

import * as fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

/** Maximum file size for atomic writes (10MB — matches existing tool limits) */
const MAX_FILE_SIZE = 10_000_000;

export async function atomicWriteFile(filePath: string, content: string | Buffer): Promise<void> {
  const dirPath = path.dirname(filePath);
  
  // Ensure parent directory exists (recursive mkdir is safe if already exists)
  await fs.mkdir(dirPath, { recursive: true });

  // Validate size before writing (Buffer.byteLength accepts both string and Buffer)
  const bufferSize = Buffer.byteLength(content, 'utf-8');
  if (bufferSize > MAX_FILE_SIZE) {
    throw new Error(`Content too large (${(bufferSize / 1_048_576).toFixed(2)}MB, max ${MAX_FILE_SIZE / 1_048_576}MB)`);
  }

  // Use randomized temp filename to prevent collision and orphan detection
  const tempPath = `${filePath}.tmp.${randomUUID().slice(0, 8)}`;
  
  try {
    await fs.writeFile(tempPath, content, 'utf-8');
    // rename() is atomic on all major OSes — either completes fully or not at all
    await fs.rename(tempPath, filePath);
  } catch (err) {
    // Cleanup orphaned temp file to prevent disk clutter
    await fs.unlink(tempPath).catch(() => {});
    throw err;
  }
}

/**
 * Atomic write for binary content (images, buffers, etc.)
 * Uses 'binary' encoding to preserve exact byte sequences.
 */
export async function atomicWriteBinaryFile(filePath: string, buffer: Buffer): Promise<void> {
  const dirPath = path.dirname(filePath);
  
  await fs.mkdir(dirPath, { recursive: true });

  // Validate size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Content too large (${(buffer.length / 1_048_576).toFixed(2)}MB, max ${MAX_FILE_SIZE / 1_048_576}MB)`);
  }

  const tempPath = `${filePath}.tmp.${randomUUID().slice(0, 8)}`;
  
  try {
    await fs.writeFile(tempPath, buffer);
    await fs.rename(tempPath, filePath);
  } catch (err) {
    await fs.unlink(tempPath).catch(() => {});
    throw err;
  }
}

/**
 * Reset function for testing — clears any in-memory state if needed.
 * Currently unused but reserved for future lock manager integration.
 */
export function resetAtomicWriteState(): void {
  // Reserved for future use (e.g., tracking orphaned temp files)
}
