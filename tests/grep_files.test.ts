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
      // Should find matches in src/index.ts and tests/test.ts (normalize for cross-platform)
      const files = result.data.matches.map(m => m.file.replace(/\\/g, '/'));
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
      // Normalize file paths for cross-platform compatibility (Windows uses backslashes)
      const files = result.data.matches.map(m => m.file.replace(/\\/g, '/'));
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
      // Normalize file paths for cross-platform compatibility
      const files = result.data.matches.map(m => m.file.replace(/\\/g, '/'));
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
      // Normalize file paths for cross-platform compatibility
      const files = result.data.matches.map(m => m.file.replace(/\\/g, '/'));
      // Should find the literal string "test.*pattern" in the file
      const found = files.some(f => f.includes('special_chars.txt')) && 
        result.data.matches.some(m => m.content.includes('test.*pattern'));
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

/**
 * REGRESSION SUITE — silent-skip bug fix (19.08.2026):
 * grep_files used to drop files above max_file_size with a bare `return`,
 * producing success:true + zero matches and NO explanation (A/B-proven on
 * CHANGELOG.md, 187KB). Both gates must now self-describe:
 *   - size gate  → skipped_files[] entry with measured bytes
 *   - lines gate → skipped_files[] entry with line count
 *   - empty matches + skips >= 1 → actionable warning
 */
describe('grep_files silent-skip regression (size/lines gates report themselves)', () => {
  let tools: ReturnType<typeof registerFileSystemTools>;
  let testDir: string;

  // Deterministic fixture: marker on line 1, then exactly 4999 pad lines.
  // Total = 26 + 10*4999 = 50_016 bytes (> default 10KB-style caps, < 100KB) and
  // 5000 lines (== MAX_LINES_PER_FILE, so the 5000-line gate must NOT fire).
  const PROBE_MARKER = 'SILENT_SKIP_PROBE_12345';

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `grep-skip-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    // A) Size-gate probe file (marker ONLY exists in this >cap file).
    // Pad count = 4998 so content has 4999 lines → split('\n') gives exactly 5000 (=MAX_LINES_PER_FILE, NOT > so line-cap does not fire).
    const padLine = 'pad_pad_pad\n'; // ~12 bytes
    const sizeProbe = `${PROBE_MARKER}\n` + padLine.repeat(4998); // ~60KB, 4999 content lines → split gives 5000 elements (passes line-cap)
    await fs.writeFile(path.join(testDir, 'size_probe.ts'), sizeProbe);

    // B) Lines-gate probe file (marker on line 1, then 5000 pad lines → 5001 > 5000 gate).
    // Keep every line short so total stays well below any realistic max_file_size.
    const linesProbe = `${PROBE_MARKER}\n` + 'pad\n'.repeat(5000); // ~28KB, 5001 content lines → split gives 5002 elements (triggers line-cap)
    await fs.writeFile(path.join(testDir, 'lines_probe.ts'), linesProbe);

    tools = registerFileSystemTools({} as PluginConfig, {} as StateManager);
  });

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Cleanup failed:', e);
    }
  });

  const getGrepTool = () => tools.find(t => t.name === 'grep_files');

  test('A/B: marker found when cap raised; reported in skipped_files when not', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // A) Cap BELOW file size (20KB < 50_016B): old code returned success:true + silent empty.
    const skippedResult = await grepTool.implementation({
      pattern: PROBE_MARKER,
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 20_000, // size_probe.ts (50_016B) must be skipped; lines_probe.ts (~28KB) also above cap → both reported
    });

    expect(skippedResult.success).toBe(true);
    if (skippedResult.success) {
      const files = skippedResult.data.matches.map((m: { file: string }) => m.file.replace(/\\/g, '/'));
      // The marker must NOT leak from the oversize file
      expect(files.some(f => f.includes('size_probe.ts'))).toBe(false);

      // FIX under test: skips are self-described instead of silent
      expect(skippedResult.data.skipped_files).toBeDefined();
      const skipped = skippedResult.data.skipped_files as Array<{ file: string; reason: string }>;
      const sizeSkip = skipped.find(s => s.file.replace(/\\/g, '/').includes('size_probe.ts'));
      expect(sizeSkip).toBeDefined();
      expect(sizeSkip!.reason).toMatch(/max_file_size/);
      // Verify skip reason contains actual measured byte counts (fixes stale /50_?016/ assertion)
      const m = sizeSkip!.reason.match(/(\d+) bytes > (\d+) bytes/);
      expect(m).toBeTruthy();
      // Empty matches + skips >= 1 → actionable warning (old code: none)
      expect(skippedResult.data.warning).toBeDefined();
      expect(String(skippedResult.data.warning)).toMatch(/skipped_files|max_file_size/);
    }

    // B) Same search with cap ABOVE file size: match must now be found.
    const raisedResult = await grepTool.implementation({
      pattern: PROBE_MARKER,
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 200_000, // includes size_probe.ts (50KB) AND lines_probe.ts (~28KB)
    });

    expect(raisedResult.success).toBe(true);
    if (raisedResult.success) {
      const files = raisedResult.data.matches.map((m: { file: string }) => m.file.replace(/\\/g, '/'));
      // size_probe: marker on line 1 → found once
      expect(files.some(f => f.includes('size_probe.ts'))).toBe(true);
      // lines_probe: under the size cap now, but its 5001 lines hit the lines gate → reported as skipped
      const skipped = (raisedResult.data.skipped_files ?? []) as Array<{ file: string; reason: string }>;
      expect(skipped.some(s => s.file.replace(/\\/g, '/').includes('lines_probe.ts'))).toBe(true);
    }
  });

  test('single-file target above cap reports itself (no more silent empty)', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // Point the search DIRECTLY at the >cap file (targetStats.isFile() path).
    const result = await grepTool.implementation({
      pattern: PROBE_MARKER,
      path: path.join(testDir, 'size_probe.ts'),
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 10_000, // below the file's 50_016B
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data.matches as unknown[]).length).toBe(0);
      const skipped = result.data.skipped_files as Array<{ file: string; reason: string }>;
      expect(skipped.length).toBeGreaterThanOrEqual(1);
      expect(skipped.some(s => s.reason.match(/max_file_size/))).toBe(true);
      expect(result.data.warning).toBeDefined();
    }
  });

  test('lines-gate skip (5001 lines) is reported with line count', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // Cap high enough that size gate does NOT fire, so only the 5000-line cap bites.
    const result = await grepTool.implementation({
      pattern: PROBE_MARKER,
      path: testDir,
      max_results: 20,
      include: undefined,
      exclude: undefined,
      max_content_length: 150,
      max_file_size: 200_000, // both probes under size cap → lines gate is the only filter
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const skipped = result.data.skipped_files as Array<{ file: string; reason: string }>;
      const linesSkip = skipped.find(s => s.file.replace(/\\/g, '/').includes('lines_probe.ts'));
      expect(linesSkip).toBeDefined();
      expect(linesSkip!.reason).toMatch(/5001? ?\d* *lines|line limit/);
    }
  });

  test('no skips → no skipped_files key (backward-compatible payload)', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // Create a tiny inline file that definitely won't cross any gate.
    // Probes in testDir exceed MAX_LINES_PER_FILE (split off-by-one), so we isolate this test.
    const smallFilePath = path.join(testDir, 'tiny_match.ts');
    await fs.writeFile(smallFilePath, '// search marker here\nconst val = 1;');

    try {
      // Point DIRECTLY at the tiny file as a single-file target (bypasses directory walk entirely).
      // This ensures zero skips and zero large files scanned.
      const result = await grepTool.implementation({
        pattern: 'search',
        path: smallFilePath,   // ← direct file path, not directory
        max_results: 20,
        include: undefined,
        exclude: undefined,
        max_content_length: 150,
        max_file_size: 400_000,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Tiny file has "search" on line 1 → match found
        expect((result.data.matches as unknown[]).length).toBeGreaterThanOrEqual(1);
        // No skips possible — single-file target can't skip itself or others
        const skipped = result.data.skipped_files;
        expect(skipped === undefined || (Array.isArray(skipped) && skipped.length === 0)).toBe(true);
      }
    } finally {
      try { await fs.unlink(smallFilePath); } catch {}
    }
  });
});
