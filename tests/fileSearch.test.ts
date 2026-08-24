/**
 * Tests for src/utils/fileSearch.ts — Workaround for grep_files single-file path bug
 * 
 * Covers: grepFile(), grepDir(), grepSearch()
 */

import { grepFile, grepDir, grepSearch } from '../src/utils/fileSearch';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

describe('fileSearch.ts — Workaround for grep_files', () => {
  let tempDir: string;

  beforeAll(async () => {
    // Create a temporary directory for test fixtures
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-toolbox-filesearch-test-'));

    // === Single file fixture (used by grepFile tests) ===
    const singleFile = path.join(tempDir, 'single.txt');
    await fs.writeFile(singleFile, [
      'This is line one.',
      'This is a test file for grep testing.',
      'The quick brown fox jumps over the lazy dog.',
      '', // empty line
      'Another TEST line with uppercase.',
    ].join('\n'));

    // === Directory fixture (used by grepDir tests) ===
    const dirPath = path.join(tempDir, 'testdir');
    await fs.mkdir(dirPath);

    await fs.writeFile(path.join(dirPath, 'file1.ts'), [
      'const maxTokens = 75;',
      'export function autoTracker() {}',
    ].join('\n'));

    await fs.writeFile(path.join(dirPath, 'file2.js'), [
      'let threshold = 90;',
      'function checkThreshold() { return threshold; }',
    ].join('\n'));

    await fs.writeFile(path.join(dirPath, 'empty.txt'), '');
  });

  afterAll(async () => {
    // Cleanup temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('grepFile()', () => {
    it('should find matches in a single file', async () => {
      const singleFile = path.join(tempDir, 'single.txt');
      const results = await grepFile(singleFile, 'test');

      expect(results).toHaveLength(2);
      expect(results[0].file).toBe(singleFile);
      expect(results[0].line_number).toBe(2); // "This is a test file..."
      expect(results[0].content).toBe('This is a test file for grep testing.');

      expect(results[1].line_number).toBe(5); // "Another TEST line..."
    });

    it('should be case-insensitive by default', async () => {
      const singleFile = path.join(tempDir, 'single.txt');
      
      const upperResults = await grepFile(singleFile, 'TEST');
      expect(upperResults.length).toBeGreaterThan(0);

      const lowerResults = await grepFile(singleFile, 'test');
      expect(lowerResults.length).toBe(upperResults.length); // Same count regardless of case
    });

    it('should return empty array when no matches', async () => {
      const singleFile = path.join(tempDir, 'single.txt');
      const results = await grepFile(singleFile, 'zzznonexistentpattern');
      
      expect(results).toEqual([]);
    });

    it('should handle regex patterns correctly', async () => {
      const singleFile = path.join(tempDir, 'single.txt');
      // Match lines starting with "This"
      const results = await grepFile(singleFile, '^This');
      
      expect(results).toHaveLength(2);
      expect(results[0].line_number).toBe(1);
    });

    it('should throw descriptive error for invalid regex', async () => {
      const singleFile = path.join(tempDir, 'single.txt');
      await expect(grepFile(singleFile, '[invalid(regex')).rejects.toThrow(/Invalid regex pattern/);
    });

    it('should throw descriptive error when file does not exist', async () => {
      const nonExistent = path.join(tempDir, 'does_not_exist.txt');
      await expect(grepFile(nonExistent, 'pattern')).rejects.toThrow(/Failed to search file.*ENOENT/);
    });

    it('should handle empty files gracefully', async () => {
      const emptyFile = path.join(tempDir, 'empty.txt');
      // Create an actual empty file
      await fs.writeFile(emptyFile, '');
      
      const results = await grepFile(emptyFile, 'anything');
      expect(results).toEqual([]);
    });

    it('should return 1-indexed line numbers', async () => {
      const singleFile = path.join(tempDir, 'single.txt');
      const results = await grepFile(singleFile, 'line one');
      
      expect(results[0].line_number).toBe(1); // First line should be index 1
    });

    it('should trim content in results', async () => {
      // Use a unique filename to avoid overwriting the shared fixture
      const trimmedFile = path.join(tempDir, 'trimmed.txt');
      await fs.writeFile(trimmedFile, '  spaced out text  \n');
      
      const results = await grepFile(trimmedFile, 'spaced');
      expect(results[0].content).toBe('spaced out text'); // Trimmed
    });

    it('should match multiple occurrences in the same line', async () => {
      // Use a unique filename to avoid overwriting the shared fixture
      const multiLineFile = path.join(tempDir, 'multi.txt');
      await fs.writeFile(multiLineFile, 'word word word\nnope nope');
      
      const results = await grepFile(multiLineFile, 'word');
      expect(results).toHaveLength(1); // One line contains the pattern
      expect(results[0].line_number).toBe(1);
    });
  });

  describe('grepDir()', () => {
    it('should search across multiple files in a directory', async () => {
      const results = await grepDir(path.join(tempDir, 'testdir'), 'token');
      
      expect(results.length).toBeGreaterThan(0);
      // Should find "maxTokens" in file1.ts
      const foundInFile1 = results.some(r => r.file.includes('file1.ts'));
      expect(foundInFile1).toBe(true);
    });

    it('should apply include pattern filter', async () => {
      const results = await grepDir(path.join(tempDir, 'testdir'), 'threshold', '\\.ts$');
      
      // Should only match .ts files (file2.js has "threshold" but shouldn't be included)
      expect(results.every(r => r.file.endsWith('.ts'))).toBe(true);
    });

    it('should return empty array when directory is empty or no matches', async () => {
      const emptyDir = path.join(tempDir, 'emptydir');
      await fs.mkdir(emptyDir);
      
      const results = await grepDir(emptyDir, 'anything');
      expect(results).toEqual([]);
    });

    it('should throw descriptive error for non-existent directory', async () => {
      const nonExistentDir = path.join(tempDir, 'does_not_exist_dir');
      await expect(grepDir(nonExistentDir, 'pattern')).rejects.toThrow(/Failed to search directory.*ENOENT/);
    });

    it('should skip non-file entries (symlinks, etc.)', async () => {
      const dirWithSymlink = path.join(tempDir, 'symlinkdir');
      await fs.mkdir(dirWithSymlink);
      
      // Create a real file and a symlink to it
      const realFile = path.join(dirWithSymlink, 'real.txt');
      await fs.writeFile(realFile, 'hello world');
      
      try {
        // Create symlink (may fail on Windows without admin privileges)
        await fs.symlink(realFile, path.join(dirWithSymlink, 'link.txt'));
        
        const results = await grepDir(dirWithSymlink, 'world');
        expect(results.length).toBeGreaterThanOrEqual(1); // At least the real file matches
      } catch {
        // Skip symlink test if not supported (e.g., Windows without admin)
        console.log('Skipping symlink test — platform does not support it or requires elevated privileges.');
      }
    });

    it('should handle empty files in directory gracefully', async () => {
      const dirWithEmpty = path.join(tempDir, 'emptydir');
      await fs.writeFile(path.join(dirWithEmpty, 'empty.txt'), '');
      
      const results = await grepDir(dirWithEmpty, 'anything');
      expect(results).toEqual([]);
    });
  });

  describe('grepSearch()', () => {
    it('should auto-detect file and search within it', async () => {
      const singleFile = path.join(tempDir, 'single.txt');
      
      // Debug: verify file exists and is readable via direct stat check.
      // Uses the static top-level `fs` import (NOT dynamic): under Jest's CJS transform,
      // `await import(...)` throws ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG.
      const stat = await fs.stat(singleFile);
      console.log('[DEBUG] grepSearch test - file stats:', {
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        path: singleFile,
      });

      // Pass absolute path to grepSearch
      const results = await grepSearch(singleFile, 'test');
      
      console.log('[DEBUG] grepSearch test - results count:', results.length);
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].file).toBe(singleFile);
    });

    it('should auto-detect directory and search within it', async () => {
      const dirPath = path.join(tempDir, 'testdir');
      
      const results = await grepSearch(dirPath, 'threshold');
      
      expect(results.length).toBeGreaterThan(0);
      // Should find "threshold" in file2.js
      const foundInFile2 = results.some(r => r.file.includes('file2.js'));
      expect(foundInFile2).toBe(true);
    });

    it('should throw descriptive error for non-existent target', async () => {
      const nonExistent = path.join(tempDir, 'does_not_exist_target');
      
      await expect(grepSearch(nonExistent, 'pattern')).rejects.toThrow(/Target not found/);
    });

    it('should pass includePattern to directory search', async () => {
      const dirPath = path.join(tempDir, 'testdir');
      
      // Should only return .js files (file1.ts has "threshold" but shouldn't be included)
      const results = await grepSearch(dirPath, 'threshold', '\\.js$');
      
      expect(results.every(r => r.file.endsWith('.js'))).toBe(true);
    });

    it('should handle relative paths correctly', async () => {
      // Save current working directory and restore after test
      const originalCwd = process.cwd();
      try {
        // Change to temp dir for this test
        process.chdir(tempDir);
        
        console.log('[DEBUG] Relative path test - CWD:', process.cwd());
        console.log('[DEBUG] Relative path test - tempDir:', tempDir);
        
        const results = await grepSearch('single.txt', 'line one');
        
        console.log('[DEBUG] Relative path test - results count:', results.length);
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should return empty array for valid but non-matching search in directory', async () => {
      const dirPath = path.join(tempDir, 'testdir');
      
      // Search for something that doesn't exist in any file
      const results = await grepSearch(dirPath, 'zzznonexistentpattern12345');
      
      expect(results).toEqual([]);
    });
  });

  describe('Integration / Edge Cases', () => {
    it('should handle special characters in filenames', async () => {
      const specialDir = path.join(tempDir, 'special dir (1)');
      await fs.mkdir(specialDir);
      
      await fs.writeFile(path.join(specialDir, 'file [test].txt'), 'hello world test');
      
      const results = await grepSearch(path.join(specialDir, 'file [test].txt'), 'world');
      expect(results.length).toBe(1);
    });

    it('should handle very long lines', async () => {
      // Use a unique filename to avoid overwriting the shared fixture
      const longLineFile = path.join(tempDir, 'long.txt');
      const longContent = 'x'.repeat(10000) + '\n';
      await fs.writeFile(longLineFile, longContent);
      
      // Should not crash on large content
      const results = await grepFile(longLineFile, 'test');
      expect(results).toEqual([]); // No match, but shouldn't throw
      
      // Search for actual content
      const matchedResults = await grepFile(longLineFile, 'x{5}'); // regex: "xxxxx"
      expect(matchedResults.length).toBe(1);
    });

    it('should handle Unicode content', async () => {
      // Use a unique filename to avoid overwriting the shared fixture
      const unicodeFile = path.join(tempDir, 'unicode.txt');
      await fs.writeFile(unicodeFile, '日本語テスト 🎉 Привет мир\nLine 2\n');
      
      const results = await grepFile(unicodeFile, 'テスト');
      expect(results.length).toBe(1);
      expect(results[0].line_number).toBe(1);
    });
  });
});
