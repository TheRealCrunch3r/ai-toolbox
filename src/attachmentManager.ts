/**
 * Attachment Manager
 * 
 * Stores references to files attached to the current chat message.
 * Allows tools to access these files by name without needing full disk paths.
 */

import type { FileHandle } from '@lmstudio/sdk';

// Store attachments for the current turn
// Key: filename (lowercase), Value: FileHandle
let currentAttachments = new Map<string, FileHandle>();

/**
 * Set the attachments for the current chat turn.
 * Called by the prompt preprocessor before each generation.
 */
export function setAttachments(files: FileHandle[]): void {
  currentAttachments.clear();
  for (const file of files) {
    // Store by lowercase name for case-insensitive lookup
    currentAttachments.set(file.name.toLowerCase(), file);
  }
  if (files.length > 0) {
    console.warn(`[AI Toolbox] Registered ${files.length} attachment(s): ${files.map(f => f.name).join(', ')}`);
  }
}

/**
 * Get a specific attachment by name (case-insensitive).
 * Returns the FileHandle if found, undefined otherwise.
 */
export function getAttachment(name: string): FileHandle | undefined {
  return currentAttachments.get(name.toLowerCase());
}

/**
 * List all currently attached filenames.
 */
export function listAttachments(): string[] {
  return Array.from(currentAttachments.keys());
}

/**
 * Check if a specific file is attached.
 */
export function isAttached(name: string): boolean {
  return currentAttachments.has(name.toLowerCase());
}
