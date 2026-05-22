/**
 * Working Directory Manager
 * 
 * Tracks a mutable working directory that can be changed at runtime via setWorkingDir().
 * All file operations resolve paths against this directory.
 * Falls back to the plugin installation directory (BASE_DIR) on reset.
 */

import * as path from 'path';
import * as fs from 'fs';

// Base directory: plugin root (where package.json lives)
const BASE_DIR = path.join(__dirname, '..');

// Mutable working directory — defaults to plugin root
let currentWorkingDir: string = BASE_DIR;

/** Get the current working directory */
export function getWorkingDir(): string {
  return currentWorkingDir;
}

/**
 * Set the working directory to a new absolute path.
 * Validates that the path exists and is an absolute directory.
 */
export function setWorkingDir(newDir: string): boolean {
  // Resolve to absolute path
  const resolved = path.resolve(newDir);

  // Must be an absolute path
  if (!path.isAbsolute(resolved)) {
    console.warn(`setWorkingDir rejected: not absolute — '${newDir}'`);
    return false;
  }

  // Must exist and be a directory
  try {
    const stats = fs.statSync(resolved);
    if (!stats.isDirectory()) {
      console.warn(`setWorkingDir rejected: not a directory — '${resolved}'`);
      return false;
    }
  } catch {
    console.warn(`setWorkingDir rejected: path does not exist — '${resolved}'`);
    return false;
  }

  currentWorkingDir = resolved;
  return true;
}

/** Reset the working directory back to the plugin root */
export function resetWorkingDir(): void {
  currentWorkingDir = BASE_DIR;
}

/** Resolve a user-provided path against the current working directory */
export function resolvePath(userPath: string): string {
  return path.resolve(currentWorkingDir, userPath);
}

/** Get allowed base directories for absolute-path validation */
export function getAllowedBases(): string[] {
  // Allow both the plugin root and the current working directory
  const bases = [BASE_DIR, currentWorkingDir];
  return [...new Set(bases)]; // Deduplicate
}

/** Get the plugin installation directory (never changes) */
export function getPluginRoot(): string {
  return BASE_DIR;
}
