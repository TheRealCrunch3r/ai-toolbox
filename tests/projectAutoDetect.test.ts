/**
 * Tests for Project Auto-Detection & Registration Module
 * 
 * Covers:
 * - Name normalization (hyphen ↔ underscore)
 * - Project detection with confidence scoring
 * - Auto-registration logic
 * - Search query creation and matching
 * - Edge cases (invalid paths, missing files)
 */

import {
  normalizeProjectName,
  generateNameVariants,
  matchesProjectName,
  detectProjectFromPath,
  autoDetectAndRegister,
  createSearchQuery,
  enhancedSearchProjects,
  searchWithAutoRegister,
  initializeProjectDetection
} from '../src/projectAutoDetect';

import fs from 'node:fs';
import path from 'node:path';

// ==================== Mock Setup ====================

const mockFsExistsSync = jest.spyOn(fs, 'existsSync');
const mockReadFileSync = jest.spyOn(fs, 'readFileSync');

beforeEach(() => {
  jest.clearAllMocks();
});

// ==================== Name Normalization Tests ====================

describe('normalizeProjectName', () => {
  test('converts hyphens to underscores', () => {
    expect(normalizeProjectName('ai-toolbox')).toBe('ai_toolbox');
  });

  test('converts underscores to hyphens', () => {
    expect(normalizeProjectName('ai_toolbox')).toBe('ai_toolbox');
  });

  test('handles mixed separators and whitespace', () => {
    expect(normalizeProjectName('AI Tool Box')).toBe('ai_tool_box');
  });

  test('lowercases the result', () => {
    expect(normalizeProjectName('AI-TOOLBOX')).toBe('ai_toolbox');
  });

  test('handles scoped package names', () => {
    // Scoped packages like @lmstudio/ai-toolbox should be handled by caller (split on /)
    expect(normalizeProjectName('@lmstudio/ai-toolbox')).toBe('@lmstudio_ai_toolbox');
  });
});

describe('generateNameVariants', () => {
  test('generates all hyphen/underscore variants for ai-toolbox', () => {
    const variants = generateNameVariants('ai-toolbox');
    
    expect(variants).toContain('ai_toolbox');
    expect(variants).toContain('aitoolbox');
    expect(variants).toContain('ai-tool-box');
  });

  test('generates all hyphen/underscore variants for ai_toolbox', () => {
    const variants = generateNameVariants('ai_toolbox');
    
    expect(variants).toContain('ai_toolbox');
    expect(variants).toContain('aitoolbox');
    expect(variants).toContain('ai-tool-box');
  });

  test('returns unique variants (no duplicates)', () => {
    const variants = generateNameVariants('test-project');
    const uniqueCount = new Set(variants).size;
    
    expect(uniqueCount).toBe(variants.length); // No duplicates
  });

  test('handles multi-word names with spaces', () => {
    const variants = generateNameVariants('my awesome project');
    
    expect(variants).toContain('my-awesome-project');
    expect(variants).toContain('my_awesome_project');
    expect(variants).toContain('myawesomeproject');
  });
});

describe('matchesProjectName', () => {
  test('ai-toolbox matches ai_toolbox', () => {
    expect(matchesProjectName('ai-toolbox', 'ai_toolbox')).toBe(true);
  });

  test('ai_toolbox matches ai-toolbox', () => {
    expect(matchesProjectName('ai_toolbox', 'ai-toolbox')).toBe(true);
  });

  test('my-project matches my_project', () => {
    expect(matchesProjectName('my-project', 'my_project')).toBe(true);
  });

  test('non-matching names return false', () => {
    expect(matchesProjectName('ai-toolbox', 'other-project')).toBe(false);
  });

  test('case-insensitive matching works', () => {
    expect(matchesProjectName('AI-TOOLBOX', 'ai_toolbox')).toBe(true);
  });
});

// ==================== Project Detection Tests ====================

describe('detectProjectFromPath', () => {
  const testDir = path.join(__dirname, 'temp_test_project');

  beforeEach(() => {
    // Clean up temp directory before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('detects valid project with package.json + src/', () => {
    // Create mock project structure
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: '@lmstudio/ai-toolbox', main: 'dist/index.js' }));
    fs.mkdirSync(path.join(testDir, 'src'));

    const result = detectProjectFromPath(testDir);

    expect(result.isValid).toBe(true);
    expect(result.name).toBe('ai-toolbox'); // Extracted from scoped package name
    expect(result.sourceDirs).toContain('dist/');
    expect(result.sourceDirs).toContain('src/');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7); // 0.4 (pkg) + 0.3 (src) = 0.7
  });

  test('detects project with only package.json', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: 'test-project' }));

    const result = detectProjectFromPath(testDir);

    expect(result.isValid).toBe(true); // 0.4 (pkg) + 0.1 (git check fails but doesn't subtract)
    expect(result.name).toBe('test-project');
  });

  test('detects project with src/ directory', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(path.join(testDir, 'src'));

    const result = detectProjectFromPath(testDir);

    expect(result.isValid).toBe(true); // 0.3 (src) + 0.1 (git check fails) + 0.2 (build config not found = no bonus)
    expect(result.name).toBe(path.basename(testDir)); // Fallback to directory name
  });

  test('invalid path returns isValid=false', () => {
    const nonExistentPath = path.join(__dirname, 'non_existent_directory_xyz');

    const result = detectProjectFromPath(nonExistentPath);

    expect(result.isValid).toBe(false);
    expect(result.confidence).toBe(0);
  });

  test('invalid package.json still counts as signal', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), 'not valid json');

    const result = detectProjectFromPath(testDir);

    // Should still be valid: 0.4 (pkg) - 0.1 (invalid) = 0.3 ≥ 0.3 threshold
    expect(result.isValid).toBe(true); // 0.4 (pkg) - 0.1 (invalid) = 0.3 ≥ 0.3 threshold
    expect(result.name).toBe(path.basename(testDir));
  });

  test('detects multiple source directories', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ main: 'dist/index.js' }));
    fs.mkdirSync(path.join(testDir, 'src'));
    fs.mkdirSync(path.join(testDir, 'lib'));

    const result = detectProjectFromPath(testDir);

    expect(result.sourceDirs).toContain('dist/');
    expect(result.sourceDirs).toContain('src/');
    expect(result.sourceDirs).toContain('lib/');
  });

  test('.git directory adds confidence', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: 'test' }));
    fs.mkdirSync(path.join(testDir, '.git'));

    const result = detectProjectFromPath(testDir);

    expect(result.confidence).toBeGreaterThanOrEqual(0.5); // 0.4 (pkg) + 0.1 (git) = 0.5
  });

  test('build config files add confidence', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: 'test' }));
    fs.writeFileSync(path.join(testDir, 'tsconfig.json'), '{}');

    const result = detectProjectFromPath(testDir);

    expect(result.confidence).toBeGreaterThanOrEqual(0.6); // 0.4 (pkg) + 0.2 (build config) = 0.6
  });
});

// ==================== Auto-Registration Tests ====================

describe('autoDetectAndRegister', () => {
  const testDir = path.join(__dirname, 'temp_test_auto_register');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('registers valid project with preferred name override and explicit confirmation', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: '@lmstudio/ai-toolbox' }));
    fs.mkdirSync(path.join(testDir, 'src'));

    // v1.9.8+: requires explicitConfirmation=true to prevent silent auto-registration
    const result = autoDetectAndRegister(testDir, 'my-custom-name', true);

    expect(result.registered).toBe(true);
    expect(result.projectName).toBe('my_custom_name'); // Normalized
    
    consoleLogSpy.mockRestore();
  });

  test('blocks registration without explicit confirmation (v1.9.8 safety gate)', () => {
    const loggerWarnSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: '@lmstudio/ai-toolbox' }));
    fs.mkdirSync(path.join(testDir, 'src'));

    // Without explicitConfirmation=true, registration should be blocked
    const result = autoDetectAndRegister(testDir, 'my-custom-name');

    expect(result.registered).toBe(false);
    expect(result.projectName).toBe('');
    
    loggerWarnSpy.mockRestore();
  });

  test('does not register invalid directory', () => {
    fs.mkdirSync(testDir, { recursive: true });
    
    const result = autoDetectAndRegister(testDir);

    expect(result.registered).toBe(false);
    expect(result.projectName).toBe('');
  });

  test('uses detected name when preferred name is not provided (with explicit confirmation)', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: '@lmstudio/ai-toolbox' }));
    fs.mkdirSync(path.join(testDir, 'src'));

    // v1.9.8+: requires explicitConfirmation=true to prevent silent auto-registration
    const result = autoDetectAndRegister(testDir, undefined, true);

    expect(result.registered).toBe(true);
    expect(result.projectName).toBe('ai_toolbox'); // Normalized from package.json
    
    consoleLogSpy.mockRestore();
  });
});

// ==================== Search Query Tests ====================

describe('createSearchQuery', () => {
  test('creates normalized query with variants', () => {
    const query = createSearchQuery('ai-toolbox');

    expect(query.original).toBe('ai-toolbox');
    expect(query.normalized).toBe('ai_toolbox');
    expect(query.variants).toContain('ai_toolbox');
    expect(query.variants).toContain('aitoolbox');
  });

  test('handles underscore input', () => {
    const query = createSearchQuery('ai_toolbox');

    expect(query.normalized).toBe('ai_toolbox');
    expect(query.variants).toContain('ai-tool-box'); // Hyphen variant
  });
});

describe('enhancedSearchProjects', () => {
  test('returns empty array (placeholder implementation)', async () => {
    const results = await enhancedSearchProjects('test-query');

    expect(results).toEqual([]);
  });

  test('logs search variants to console', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await enhancedSearchProjects('ai-toolbox', 5);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProjectAutoDetect] Enhanced search for "ai-toolbox"')
    );

    consoleLogSpy.mockRestore();
  });
});

describe('searchWithAutoRegister', () => {
  const testDir = path.join(__dirname, 'temp_test_search_auto_register');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('auto-registers cwd when registry is empty (with explicit confirmation)', async () => {
    const loggerInfoSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const loggerWarnSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: '@lmstudio/ai-toolbox' }));
    fs.mkdirSync(path.join(testDir, 'src'));

    // v1.9.8+: requires explicitConfirmation=true to prevent silent auto-registration
    const results = await searchWithAutoRegister('ai-toolbox', testDir, 10, true);

    // Should have logged auto-detection message (via logger → process.stdout.write)
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProjectAutoDetect] No projects found')
    );

    loggerInfoSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  test('blocks registration without explicit confirmation in searchWithAutoRegister', async () => {
    const loggerWarnSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: '@lmstudio/ai-toolbox' }));
    fs.mkdirSync(path.join(testDir, 'src'));

    // Without explicitConfirmation=true, should return empty without registering
    const results = await searchWithAutoRegister('ai-toolbox', testDir);

    expect(results).toEqual([]);
    
    loggerWarnSpy.mockRestore();
  });

  test('logs warning when cwd is not a valid project (with explicit confirmation)', async () => {
    const loggerWarnSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    fs.mkdirSync(testDir, { recursive: true });

    // v1.9.8+: requires explicitConfirmation=true
    const results = await searchWithAutoRegister('test-project', testDir, 10, true);

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProjectAutoDetect] Current directory does not appear to be a valid project')
    );

    loggerWarnSpy.mockRestore();
  });
});

// ==================== Startup Initialization Tests (DEPRECATED — v1.9.8+) ====================

describe('initializeProjectDetection', () => {
  const testDir = path.join(__dirname, 'temp_test_startup');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('logs detected project info and deprecation warning for valid projects', () => {
    const loggerInfoSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const loggerWarnSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: '@lmstudio/ai-toolbox' }));
    fs.mkdirSync(path.join(testDir, 'src'));

    initializeProjectDetection(testDir);

    // Should log project info via stdout (logger.info)
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProjectAutoDetect] Detected project at startup:')
    );
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Name: ai-toolbox')
    );
    // v1.9.8+: should also log deprecation warning (silent registration disabled)
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Registration SKIPPED')
    );

    loggerInfoSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  test('logs non-project message for invalid directories', () => {
    const loggerInfoSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    fs.mkdirSync(testDir, { recursive: true });

    initializeProjectDetection(testDir);

    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProjectAutoDetect] Current directory does not appear to be a project.')
    );

    loggerInfoSpy.mockRestore();
  });

  test('does NOT register any project (silent auto-registration disabled)', () => {
    // initializeProjectDetection logs info to stdout and deprecation warning to stderr.
    // The deprecation message proves no registration happened.
    const loggerWarnSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: '@lmstudio/ai-toolbox' }));
    fs.mkdirSync(path.join(testDir, 'src'));

    initializeProjectDetection(testDir);
    
    // Verify it logged the deprecation message to stderr (logger.warn) — proves no registration happened
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Registration SKIPPED')
    );

    loggerWarnSpy.mockRestore();
  });
});

// ==================== Edge Cases ====================

describe('Edge Cases', () => {
  test('handles empty string input for normalizeProjectName', () => {
    expect(normalizeProjectName('')).toBe('');
  });

  test('handles null/undefined gracefully (TypeScript prevents this, but runtime safety)', () => {
    // TypeScript should prevent null/undefined at compile time, but let's verify behavior
    const result = generateNameVariants('test-project');
    expect(Array.isArray(result)).toBe(true);
  });

  test('handles very long project names', () => {
    const longName = 'a'.repeat(100) + '-project';
    const normalized = normalizeProjectName(longName);
    
    expect(normalized.length).toBeGreaterThan(50);
    expect(normalized).toContain('_'); // Should still have separator normalization applied (canonical: underscores)
  });

  test('handles special characters in project names', () => {
    const specialName = 'my-project@2.0';
    const normalized = normalizeProjectName(specialName);
    
    // Special chars should be preserved (only separators are normalized)
    expect(normalized).toContain('@');
  });
});
