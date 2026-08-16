/**
 * Project Auto-Detection & Registration Module (v1.9.8+)
 * 
 * ⚠️ IMPORTANT: Silent auto-registration has been REMOVED as of v1.9.8.
 * Projects must be registered explicitly via the register_project tool with user confirmation.
 * This module only provides detection utilities and explicit registration functions —
 * NO automatic registration occurs during plugin startup or search operations.
 * 
 * Workflow (v1.9.8+):
 * 1. User mentions project name → searches Cross-Project Registry
 * 2. If empty → LLM asks user for confirmed working directory path
 * 3. User confirms → register_project tool called explicitly with confirmation flag
 * 4. Searches again with normalized name (hyphen ↔ underscore)
 */

import fs from 'node:fs';
import path from 'node:path';

// ==================== Structured Logging ====================

/** Lightweight logger — mirrors the pattern in index.ts */
const logger = {
  info: (msg: string) => typeof process.stdout.write === 'function' && process.stdout.write(`[ProjectAutoDetect] ${msg}\n`),
  warn: (msg: string) => typeof process.stderr.write === 'function' && process.stderr.write(`[ProjectAutoDetect WARN] ${msg}\n`),
  error: (msg: string) => typeof process.stderr.write === 'function' && process.stderr.write(`[ProjectAutoDetect ERROR] ${msg}\n`),
};

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
 * ⚠️ CRITICAL SAFETY GATE (v1.9.8 fix): This function MUST only be called explicitly
 * by user-facing tools (register_project). It is NOT called during startup — that was
 * a bug in v1.6–v1.9.7 where silent auto-registration registered wrong paths without
 * confirmation. Registration now requires explicit user action via the register_project tool.
 * 
 * Uses user-mentioned name as override if provided (stronger signal than auto-detected).
 * 
 * @param cwd - Current working directory to detect and register
 * @param preferredName - User-provided project name (higher priority than auto-detected)
 * @param explicitConfirmation - Must be true when called from user-facing tools. Prevents silent registration.
 */
export function autoDetectAndRegister(
  cwd: string,
  preferredName?: string,
  explicitConfirmation: boolean = false
): { registered: boolean; projectName: string } {
  const detection = detectProjectFromPath(cwd);
  
  if (!detection.isValid) {
    return { registered: false, projectName: '' };
  }

  // ⚠️ SAFETY CHECK: Require explicit confirmation when called from user-facing tools.
  // This prevents silent auto-registration of wrong paths (v1.9.8 fix).
  if (!explicitConfirmation) {
    logger.warn(`[ProjectAutoDetect] Registration blocked — no explicit confirmation provided.`);
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
 * Search with explicit user-triggered registration fallback.
 * 
 * ⚠️ CRITICAL SAFETY GATE (v1.9.8 fix): This function MUST only be called explicitly
 * by the LLM when the user asks to register a project. It no longer auto-registers silently.
 * Registration requires explicitConfirmation=true — see autoDetectAndRegister().
 * 
 * If no projects are found in the registry, attempts to detect and register cwd
 * ONLY if explicit confirmation is provided.
 */
export async function searchWithAutoRegister(
  query: string,
  cwd: string,
  maxResults: number = 10,
  explicitConfirmation: boolean = false
): Promise<Array<{ name: string; path: string }>> {
  // First attempt: search registry as-is
  let results = await enhancedSearchProjects(query, maxResults);
  
  if (results.length === 0) {
    // ⚠️ SAFETY CHECK: Require explicit confirmation — no silent auto-registration.
    if (!explicitConfirmation) {
      logger.warn(`[ProjectAutoDetect] Registration blocked in searchWithAutoRegister — no explicit confirmation.`);
      return results;  // Return empty, let the caller handle it (e.g., ask user for path)
    }
    
    logger.info(`[ProjectAutoDetect] No projects found. Attempting to register current directory...`);
    
    // Auto-detect and register cwd with explicit confirmation
    const autoDetected = autoDetectAndRegister(cwd, query, true /* explicitConfirmation */);
    
    if (autoDetected.registered) {
      logger.info(`[ProjectAutoDetect] Registered "${autoDetected.projectName}" from CWD detection.`);
      
      // Search again with the newly registered project
      results = await enhancedSearchProjects(query, maxResults);
    } else {
      logger.warn(`[ProjectAutoDetect] Current directory does not appear to be a valid project.`);
    }
  }
  
  return results;
}

// ==================== Startup Initialization (DEPRECATED — v1.9.8+) ====================

/**
 * ⚠️ DEPRECATED: initializeProjectDetection on startup.
 * 
 * This function was removed from index.ts in v1.9.8 to prevent silent auto-registration
 * of wrong/stale paths without user confirmation. It is retained for backward compatibility
 * but will NOT register any project — it only detects and logs.
 * 
 * To register a project, use the explicit `register_project` tool with confirmation.
 */
export function initializeProjectDetection(cwd: string): void {
  const detection = detectProjectFromPath(cwd);
  
  if (detection.isValid) {
    logger.info(`[ProjectAutoDetect] Detected project at startup:`);
    logger.info(`  Name: ${detection.name}`);
    logger.info(`  Path: ${detection.path}`);
    logger.info(`  Confidence: ${(detection.confidence * 100).toFixed(0)}%`);
    logger.warn(`[ProjectAutoDetect] ⚠️ Registration SKIPPED — silent auto-registration disabled in v1.9.8.`);
    logger.warn(`[ProjectAutoDetect] Use the register_project tool explicitly to register this project.`);
  } else {
    logger.info(`[ProjectAutoDetect] Current directory does not appear to be a project.`);
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
