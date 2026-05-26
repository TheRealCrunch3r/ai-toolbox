/**
 * Tests for Working Directory Manager
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// We need to test the workingDir module in isolation
// Mock the module to control __dirname
jest.mock('../src/workingDir', () => {
  const actual = jest.requireActual('../src/workingDir');
  return actual;
});

import { getWorkingDir, setWorkingDir, resetWorkingDir, resolvePath, getAllowedBases, getPluginRoot } from '../src/workingDir';

describe('Working Directory Manager', () => {
  let tempDir: string;

  beforeAll(async () => {
    // Create a temp directory for testing
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ai-toolbox-test-'));
  });

  afterAll(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    resetWorkingDir();
  });

  describe('getWorkingDir', () => {
    test('should return a valid directory path', () => {
      const dir = getWorkingDir();
      expect(typeof dir).toBe('string');
      expect(dir.length).toBeGreaterThan(0);
    });

    test('should return consistent value', () => {
      const dir1 = getWorkingDir();
      const dir2 = getWorkingDir();
      expect(dir1).toBe(dir2);
    });
  });

  describe('setWorkingDir', () => {
    test('should set valid directory', () => {
      const result = setWorkingDir(tempDir);
      expect(result).toBe(true);
      expect(getWorkingDir()).toBe(path.resolve(tempDir));
    });

    test('should reject non-existent directory', () => {
      const fakePath = path.join(os.tmpdir(), 'does-not-exist-xyz');
      const result = setWorkingDir(fakePath);
      expect(result).toBe(false);
    });

    test('should reject file path (not a directory)', () => {
      const filePath = path.join(tempDir, 'test-file.txt');
      fs.writeFileSync(filePath, 'test');
      const result = setWorkingDir(filePath);
      expect(result).toBe(false);
      fs.unlinkSync(filePath);
    });

    test('should resolve relative paths to absolute', () => {
      const subDir = path.join(tempDir, 'subdir');
      fs.mkdirSync(subDir, { recursive: true });
      const result = setWorkingDir(subDir);
      expect(result).toBe(true);
      expect(getWorkingDir()).toBe(path.resolve(subDir));
    });

    test('should handle Windows-style paths on Windows', () => {
      if (process.platform === 'win32') {
        const winPath = tempDir.replace(/\\/g, '/');
  describe(' resetWorking', () => {
 test(' should NOT reset to plugin root (Option B: context preservation)', () => {
      set WorkingDir(tempDir);
 const currentDirBefore = getWorking();
      
      // Call reset - it should now be a no-op per Option B
      resetWorking(); 
      
 expect(getWorking()).toBe(currentDirBefore); // Should still be tempDir, not plugin root
    });
  });
      setWorkingDir(tempDir);
      resetWorkingDir();
      const root = getPluginRoot();
      expect(getWorkingDir()).toBe(root);
    });
  });

  describe('resolvePath', () => {
    beforeEach(() => {
      setWorkingDir(tempDir);
    });

    test('should resolve relative path against working dir', () => {
      const resolved = resolvePath('subdir/file.txt');
      expect(resolved).toContain(tempDir);
      expect(resolved).toContain('subdir');
    });

    test('should handle root-relative path', () => {
      const resolved = resolvePath('file.txt');
      expect(resolved).toBe(path.join(tempDir, 'file.txt'));
    });

    test('should handle absolute path (pass through)', () => {
      const absPath = path.join(tempDir, 'absolute.txt');
      const resolved = resolvePath(absPath);
      expect(resolved).toBe(absPath);
    });

    test('should handle empty string', () => {
      const resolved = resolvePath('');
      expect(resolved).toBe(tempDir);
    });
  });

  describe('getAllowedBases', () => {
    test('should return at least plugin root', () => {
      const bases = getAllowedBases();
      expect(bases.length).toBeGreaterThan(0);
      expect(bases).toContain(getPluginRoot());
    });

    test('should deduplicate bases', () => {
      resetWorkingDir(); // Set working dir to plugin root
      const bases = getAllowedBases();
      const unique = new Set(bases);
      expect(bases.length).toBe(unique.size);
    });

    test('should include current working dir when different from plugin root', () => {
      setWorkingDir(tempDir);
      const bases = getAllowedBases();
      expect(bases).toContain(path.resolve(tempDir));
    });
  });

  describe('getPluginRoot', () => {
    test('should return plugin installation directory', () => {
      const root = getPluginRoot();
      expect(typeof root).toBe('string');
      expect(root).toContain('ai_toolbox');
    });

    test('should be consistent across calls', () => {
      const root1 = getPluginRoot();
      const root2 = getPluginRoot();
      expect(root1).toBe(root2);
    });

    test('should not change when working dir changes', () => {
      const rootBefore = getPluginRoot();
      setWorkingDir(tempDir);
      const rootAfter = getPluginRoot();
      expect(rootBefore).toBe(rootAfter);
    });
  });
});
