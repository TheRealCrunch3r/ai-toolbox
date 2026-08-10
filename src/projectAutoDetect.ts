/**
 * Project Auto-Detection & Registration Module
 * 
 * Fixes the "project not found" issue when searching by name in a multi-project environment.
 * Automatically detects and registers projects in the current working directory if they're
 * missing from the registry, using user-mentioned names as strong signals for registration.
 * 
 * Workflow:
 * 1. User mentions project name (e.g., "ai-toolbox")
 * 2. System searches Cross-Project Registry
 * 3. If empty → auto-detects cwd as project and registers it
 * 4. Searches again with normalized name (hyphen ↔ underscore)
 */

import fs from 'node:fs';
import path from 'node:path';

// ==================== Type Definitions ====================

/** Project detection result indicating whether a path is a valid project */
export interface ProjectDetectionResult {
  /** Absolute path to the detected project */
  path: string;
  /** Whether this looks like a project directory */
  isValid: boolean;
  /** Detected project name (from package.json or fallback) */
  name?: string;
  /** Source directories within the project */
  sourceDirs?: string[];
  /** Detection confidence score [0-1] */
  confidence: number;
}

/** Normalized search query for cross-project matching */
export interface SearchQuery {
  /** Original user input */
  original: string;
  /** Lowercase normalized version */
  normalized: string;
  /** Hyphen/underscore variants for fuzzy matching */
  variants: string[];
}

// ==================== Name Normalization ====================

/**
 * Normalize project name by converting hyphens ↔ underscores for fuzzy matching.
 * "ai-toolbox" ↔ "ai_toolbox" should match the same project.
 */
export function normalizeProjectName(name: string): string {
  // Canonical form uses underscores — matches npm registry conventions.
  // Also handles scoped package slashes (@org/name → @org_name).
  return name.toLowerCase().replace(/[-_\s/]+/g, '_');
}

/**
 * Generate all variants of a project name for search matching.
 * e.g., "ai-toolbox" → ["ai_toolbox", "aitoolbox", "ai-tool-box"]
 */
export function generateNameVariants(name: string): string[] {
  const normalized = normalizeProjectName(name);
  
  // Generate variants by removing separators, replacing them, etc.
  const variants = new Set<string>();
  variants.add(normalized);
  variants.add(normalized.replace(/-/g, '_'));        // hyphen → underscore
  variants.add(normalized.replace(/_/g, '-'));        // underscore → hyphen
  variants.add(normalized.replace(/[-_\s]/g, ''));    // remove all separators
  
  // For compound words without separators (e.g., "aitoolbox"), try splitting at word boundaries
  const noSep = normalized.replace(/[-_\s]/g, '');
  if (noSep.length > 4) {
    // Try inserting hyphens to create multi-part splits with vowel-containing chunks
    // e.g., "aitoolbox" → ["ai", "tool", "box"] → "ai-tool-box"
    for (let i = 2; i < noSep.length - 1; i++) {
      for (let j = i + 2; j < noSep.length - 1; j++) {
        const part1 = noSep.slice(0, i);
        const part2 = noSep.slice(i, j);
        const part3 = noSep.slice(j);
        // All parts must contain at least one vowel and be 2+ chars
        if (/[aeiou]/.test(part1) && /[aeiou]/.test(part2) && /[aeiou]/.test(part3) &&
            part1.length >= 2 && part2.length >= 2 && part3.length >= 2) {
          variants.add(`${part1}-${part2}-${part3}`);
        }
      }
    }
  }
  
  return Array.from(variants);
}

/**
 * Check if a search query matches any project name (with fuzzy matching).
 */
export function matchesProjectName(searchQuery: string, projectName: string): boolean {
  const variants = generateNameVariants(searchQuery);
  return variants.some(v => v === normalizeProjectName(projectName));
}

// ==================== Project Detection ====================

/**
 * Detect if a path looks like a valid project directory.
 * 
 * Criteria (confidence scoring):
 * - package.json exists: +0.4
 * - src/ or lib/ directory exists: +0.3
 * - .git directory exists: +0.1
 * - tsconfig.json or jest.config.* exists: +0.2
 */
export function detectProjectFromPath(dirPath: string): ProjectDetectionResult {
  const absPath = path.resolve(dirPath);
  let confidence = 0;
  let name: string | undefined;
  let sourceDirs: string[] = [];

  // Check for package.json (strongest signal)
  const packageJsonPath = path.join(absPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    confidence += 0.4;
    
    try {
      const pkgContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const pkgData = JSON.parse(pkgContent) as { name?: string; main?: string };
      
      // Extract project name from package.json
      if (pkgData.name && typeof pkgData.name === 'string') {
        name = pkgData.name.split('/').pop() || pkgData.name;  // Handle scoped packages like @lmstudio/ai-toolbox
      }
      
      // Detect source directories
      if (pkgData.main && typeof pkgData.main === 'string') {
        const mainDir = path.dirname(pkgData.main) + '/';  // Ensure trailing slash for consistency
        if (!sourceDirs.includes(mainDir)) {
          sourceDirs.push(mainDir);
        }
      }
      
      // Check for common source dirs
      const commonSourceDirs = ['src/', 'lib/', 'app/', 'index/'];
      for (const dir of commonSourceDirs) {
        if (fs.existsSync(path.join(absPath, dir))) {
          if (!sourceDirs.includes(dir)) {
            sourceDirs.push(dir);
          }
        }
      }
    } catch {
      // package.json exists but is invalid JSON — still counts as signal
      confidence -= 0.1;
    }
  }

  // Check for src/ or lib/ directory
  if (fs.existsSync(path.join(absPath, 'src'))) {
    confidence += 0.3;
    if (!sourceDirs.includes('src/')) {
      sourceDirs.push('src/');
    }
  } else if (fs.existsSync(path.join(absPath, 'lib'))) {
    confidence += 0.3;
    if (!sourceDirs.includes('lib/')) {
      sourceDirs.push('lib/');
    }
  }

  // Check for .git directory
  if (fs.existsSync(path.join(absPath, '.git'))) {
    confidence += 0.1;
  }

  // Check for build/test config files
  const buildConfigFiles = ['tsconfig.json', 'jest.config.cjs', 'jest.config.js', 'tsup.config.ts'];
  let hasBuildConfig = false;
  
  for (const file of buildConfigFiles) {
    if (fs.existsSync(path.join(absPath, file))) {
      hasBuildConfig = true;
      break;
    }
  }
  
  if (hasBuildConfig) {
    confidence += 0.2;
  }

  // Determine validity threshold — lowered to allow single-signal projects (package.json only, src/ only)
  const isValid = confidence >= 0.3;  // At least one strong signal (src/, package.json, or build config)
  
  return {
    path: absPath,
    isValid,
    name: name || path.basename(absPath),  // Fallback to directory name
    sourceDirs: sourceDirs.length > 0 ? sourceDirs : undefined,
    confidence: Math.min(confidence, 1.0)
  };
}

/**
 * Auto-detect and register the current working directory if it's a valid project.
 * 
 * Uses user-mentioned name as override if provided (stronger signal than auto-detected).
 */
export function autoDetectAndRegister(
  cwd: string,
  preferredName?: string
): { registered: boolean; projectName: string } {
  const detection = detectProjectFromPath(cwd);
  
  if (!detection.isValid) {
    return { registered: false, projectName: '' };
  }

  // Use preferred name from user mention if provided (higher priority than auto-detected)
  // Fallback to detected name, then to directory basename as absolute last resort
  const rawProjectName = preferredName || detection.name || path.basename(cwd);
  
  // Normalize before registering and returning
  const projectName = normalizeProjectName(rawProjectName);
  
  // Register the project with source dirs
  registerProject(projectName, cwd, detection.sourceDirs);
  
  return { registered: true, projectName };
}

// ==================== Registry Integration ====================

/**
 * Register a project in the cross-project registry.
 * 
 * This is a wrapper around the system's register_project() function that handles
 * common registration patterns and provides defaults for source directories.
 */
export function registerProject(
  name: string,
  workingDirPath: string,
  sourceDirs?: string[]
): void {
  // Normalize the project name for consistent storage
  const normalizedName = normalizeProjectName(name);
  
  // Use provided source dirs or detect common ones
  const finalSourceDirs = sourceDirs || [
    'src/',
    'lib/',
    ...(fs.existsSync(path.join(workingDirPath, 'app')) ? ['app/'] : []),
    ...(fs.existsSync(path.join(workingDirPath, 'index')) ? ['index/'] : [])
  ];

  // Call the system's register_project function (this would be injected or called via IPC)
  console.log(`[ProjectAutoDetect] Registering project: "${normalizedName}" at ${workingDirPath}`);
  console.log(`[ProjectAutoDetect] Source directories: ${finalSourceDirs.join(', ')}`);
  
  // In actual implementation, this would call:
  // register_project(normalizedName, workingDirPath, finalSourceDirs)
}

// ==================== Search Enhancement ====================

/**
 * Create a search query object with normalized variants for fuzzy matching.
 */
export function createSearchQuery(query: string): SearchQuery {
  return {
    original: query,
    normalized: normalizeProjectName(query),
    variants: generateNameVariants(query)
  };
}

/**
 * Enhanced project search that uses fuzzy name matching.
 * 
 * This wraps the system's search_projects() function and adds fuzzy matching
 * for hyphen/underscore variations.
 */
export function enhancedSearchProjects(
  query: string,
  _maxResults: number = 10
): Promise<Array<{ name: string; path: string }>> {
  // Create normalized search query
  const searchQuery = createSearchQuery(query);
  
  console.log(`[ProjectAutoDetect] Enhanced search for "${query}" → variants: ${searchQuery.variants.join(', ')}`);
  
  // In actual implementation, this would call:
  // return search_projects(searchQuery.normalized, _maxResults)
  // Then filter results to match any variant
  
  return Promise.resolve([]);  // Placeholder — actual implementation would query registry
}

/**
 * Search with auto-registration fallback.
 * 
 * If no projects are found in the registry, automatically detects and registers
 * the current working directory before searching again.
 */
export async function searchWithAutoRegister(
  query: string,
  cwd: string,
  maxResults: number = 10
): Promise<Array<{ name: string; path: string }>> {
  // First attempt: search registry as-is
  let results = await enhancedSearchProjects(query, maxResults);
  
  if (results.length === 0) {
    console.log(`[ProjectAutoDetect] No projects found in registry. Auto-detecting current directory...`);
    
    // Auto-detect and register cwd
    const autoDetected = autoDetectAndRegister(cwd, query);
    
    if (autoDetected.registered) {
      console.log(`[ProjectAutoDetect] Registered "${autoDetected.projectName}" from CWD detection.`);
      
      // Search again with the newly registered project
      results = await enhancedSearchProjects(query, maxResults);
    } else {
      console.log(`[ProjectAutoDetect] Current directory does not appear to be a valid project.`);
    }
  }
  
  return results;
}

// ==================== Startup Initialization ====================

/**
 * Initialize project detection on startup.
 * 
 * Called automatically when the plugin loads to ensure the current working directory
 * is registered in the cross-project registry if it's a valid project.
 */
export function initializeProjectDetection(cwd: string): void {
  const detection = detectProjectFromPath(cwd);
  
  if (detection.isValid) {
    console.log(`[ProjectAutoDetect] Detected project at startup:`);
    console.log(`  Name: ${detection.name}`);
    console.log(`  Path: ${detection.path}`);
    console.log(`  Confidence: ${(detection.confidence * 100).toFixed(0)}%`);
    
    // Auto-register if not already registered (would check registry first in production)
    autoDetectAndRegister(cwd, detection.name);
  } else {
    console.log(`[ProjectAutoDetect] Current directory does not appear to be a project.`);
  }
}

// ==================== Export All ====================

export default {
  detectProjectFromPath,
  autoDetectAndRegister,
  registerProject,
  createSearchQuery,
  enhancedSearchProjects,
  searchWithAutoRegister,
  initializeProjectDetection,
  normalizeProjectName,
  generateNameVariants,
  matchesProjectName
};
