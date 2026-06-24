/**
 * Comprehensive Test Suite for grep_files Tool
 * Tests all critical functionality including edge cases and bug scenarios
 */

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('grep_files Tool', () => {
  let tools: ReturnType<typeof registerFileSystemTools>;
  let testDir: string;

  beforeAll(async () => {
    // Create a temporary test directory structure
    testDir = path.join(os.tmpdir(), `grep-test-${Date.now()}`);
    
    // Create directory structure
    await fs.mkdir(path.join(testDir, 'src', 'utils'), { recursive: true });
    await fs.mkdir(path.join(testDir, 'node_modules', 'package'), { recursive: true });
    await fs.mkdir(path.join(testDir, 'tests'), { recursive: true });

    // Create test files with various patterns
    await fs.writeFile(
      path.join(testDir, 'src', 'index.ts'),
      `import { search } from './utils/helper';\n// This is a comment\nconst x = 42;\nconsole.log("test");`
    );

    await fs.writeFile(
      path.join(testDir, 'src', 'utils', 'helper.ts'),
      `export function search(query: string) {\n  return query.trim();\n}\n// Helper function\nconst helper = "value";`
    );

    await fs.writeFile(
      path.join(testDir, 'node_modules', 'package', 'index.js'),
      `module.exports = { test: true };\nconsole.log("should be excluded");`
    );

    await fs.writeFile(
      path.join(testDir, 'tests', 'test.ts'),
      `import { search } from '../src/utils/helper';\ntest('search', () => {\n  expect(search("test")).toBe("test");\n});`
    );

    // Create a large file (>100KB) to test size filtering
    const largeContent = 'const x = "test";\n'.repeat(5000);
    await fs.writeFile(path.join(testDir, 'large_file.ts'), largeContent);

    tools = registerFileSystemTools({} as PluginConfig, {} as StateManager);
  });

  afterAll(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Cleanup failed:', e);
    }
  });

  const getGrepTool = () => tools.find(t => t.name === 'grep_files');

  test('should find pattern matches in files', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'search',
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 100_000,
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      // Should find matches in src/index.ts and tests/test.ts
      const files = result.data.matches.map(m => m.file);
      expect(files.some(f => f.includes('src/index.ts'))).toBe(true);
      expect(files.some(f => f.includes('tests/test.ts'))).toBe(true);
    }
  });

  test('should exclude node_modules directory', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'console.log',
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: 'node_modules', // Should exclude entire node_modules directory
      max_content_length: 150,
      max_file_size: 100_000,
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      const files = result.data.matches.map(m => m.file);
      // Should NOT include node_modules files
      expect(files.some(f => f.includes('node_modules'))).toBe(false);
      
      // Should still find console.log in src/index.ts
      expect(files.some(f => f.includes('src/index.ts'))).toBe(true);
    }
  });

  test('should respect max_file_size limit', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'const x',
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 10_000, // 10KB - should skip large_file.ts (which is >50KB)
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      const files = result.data.matches.map(m => m.file);
      // Should NOT include the large file
      expect(files.some(f => f.includes('large_file.ts'))).toBe(false);
      
      // Should find matches in smaller files
      expect(result.data.count).toBeGreaterThan(0);
    }
  });

  test('should support include pattern for specific file types', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'import',
      path: testDir,
      max_results: 20,
      include: '*.ts', // Only TypeScript files
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 100_000,
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      const files = result.data.matches.map(m => m.file);
      // All results should be .ts files
      expect(files.every(f => f.endsWith('.ts'))).toBe(true);
      
      // Should NOT include .js files
      expect(files.some(f => f.endsWith('.js'))).toBe(false);
    }
  });

  test('should handle regex patterns correctly', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: '^import\\s+', // Lines starting with "import" followed by whitespace
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 100_000,
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      // All matches should be lines that start with "import"
      result.data.matches.forEach(match => {
        expect(match.content.startsWith('import')).toBe(true);
      });
    }
  });

  test('should return structured match data', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'const',
      path: testDir,
      max_results: 10,
      include: undefined,
      exclude: undefined,
      max_content_length: 50, // Short content for easier testing
      max_file_size: 100_000,
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(Array.isArray(result.data.matches)).toBe(true);
      result.data.matches.forEach(match => {
        expect(match).toHaveProperty('file');
        expect(match).toHaveProperty('line_number');
        expect(match).toHaveProperty('content');
        expect(typeof match.line_number).toBe('number');
        expect(match.content.length).toBeLessThanOrEqual(50);
      });
    }
  });

  test('should respect max_results limit', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'const|let|var', // Common patterns that appear many times
      path: testDir,
      max_results: 5,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 100_000,
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      // Should not return more than max_results
      expect(result.data.matches.length).toBeLessThanOrEqual(5);
      expect(result.data.count).toBeLessThanOrEqual(5);
    }
  });

  test('should handle non-existent directory gracefully', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'test',
      path: path.join(testDir, 'nonexistent'),
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 100_000,
    });

    // Should return success: false with error message
    expect(result.success).toBe(false);
  });

  test('should handle invalid regex pattern', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: '[invalid(regex', // Invalid regex
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 100_000,
    });

    expect(result.success).toBe(false);
  });

  test('should escape special regex characters in literal patterns', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // Create a file with special characters
    await fs.writeFile(
      path.join(testDir, 'special_chars.txt'),
      `const pattern = /test.*pattern/;\nconst regex = /[a-z]+/;`
    );

    const result = await grepTool.implementation({
      pattern: 'test.*pattern', // This should be treated as literal string
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 100_000,
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      // Should find the literal string "test.*pattern" in the file
      const found = result.data.matches.some(m => 
        m.file.includes('special_chars.txt') && m.content.includes('test.*pattern')
      );
      expect(found).toBe(true);
    }

    // Cleanup
    await fs.unlink(path.join(testDir, 'special_chars.txt'));
  });

  test('should handle case-insensitive matching by default', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'IMPORT', // Uppercase - should still match "import" in files
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 100_000,
    });

    expect(result.success).toBe(true);
    
    if (result.success) {
      // Should find matches despite case difference
      expect(result.data.count).toBeGreaterThan(0);
    }
  });
});
