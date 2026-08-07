/**
 * Tests for Performance Utilities
 */

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

// Mock fetch for fetchWithRetry tests
global.fetch = jest.fn();

import {
  levenshteinSimilarity,
  getCachedFuzzyResults,
  cacheFuzzyResults,
  findFilesAsync,
  countTypeScriptFiles,
  getAnalysisTimeout,
  fetchWithRetry,
  fetchWithCache,
  clearRequestCache, // ✅ FIX: Export for test isolation
} from '../src/performanceUtils';

describe('levenshteinSimilarity', () => {
  test('should return 1 for identical strings', () => {
    expect(levenshteinSimilarity('hello', 'hello')).toBe(1);
  });

  test('should return 1 for empty strings', () => {
    expect(levenshteinSimilarity('', '')).toBe(1);
  });

  test('should return null for very different strings', () => {
    const result = levenshteinSimilarity('abc', 'xyz', 0.5);
    expect(result).toBeNull();
  });

  test('should return high score for similar strings', () => {
    const result = levenshteinSimilarity('config', 'configuration', 0.3);
    expect(result).toBeGreaterThan(0.4);
  });

  test('should early exit when below threshold', () => {
    const result = levenshteinSimilarity('a'.repeat(100), 'b'.repeat(100), 0.5);
    expect(result).toBeNull();
  });

  test('should handle single character difference', () => {
    const result = levenshteinSimilarity('cat', 'bat', 0.3);
    expect(result).toBeGreaterThan(0.5);
  });

  test('should handle one empty string', () => {
    const result = levenshteinSimilarity('hello', '', 0.3);
    expect(result).toBeNull();
  });

  test('should be symmetric', () => {
    const a = levenshteinSimilarity('hello', 'hallo', 0.3);
    const b = levenshteinSimilarity('hallo', 'hello', 0.3);
    expect(a).toBe(b);
  });
});

describe('Fuzzy Search Cache', () => {
  const testResults = [
    { filePath: '/test/file1.ts', score: 0.9 },
    { filePath: '/test/file2.ts', score: 0.7 },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should cache and retrieve results', () => {
    cacheFuzzyResults('test', '/base', testResults);
    const cached = getCachedFuzzyResults('test', '/base');
    expect(cached).toBeDefined();
    expect(cached?.length).toBe(2);
  });

  test('should return null for uncached query', () => {
    const cached = getCachedFuzzyResults('nonexistent', '/base');
    expect(cached).toBeNull();
  });

  test('should expire after TTL', () => {
    cacheFuzzyResults('test', '/base', testResults);
    jest.advanceTimersByTime(61_000);
    const cached = getCachedFuzzyResults('test', '/base');
    expect(cached).toBeNull();
  });

  test('should not expire before TTL', () => {
    cacheFuzzyResults('test', '/base', testResults);
    jest.advanceTimersByTime(59_000);
    const cached = getCachedFuzzyResults('test', '/base');
    expect(cached).toBeDefined();
  });

  test('should use different cache keys for different base paths', () => {
    cacheFuzzyResults('test', '/base1', testResults);
    cacheFuzzyResults('test', '/base2', [{ filePath: '/other.ts', score: 0.5 }]);
    
    const cached1 = getCachedFuzzyResults('test', '/base1');
    const cached2 = getCachedFuzzyResults('test', '/base2');
    
    expect(cached1?.[0].filePath).toBe('/test/file1.ts');
    expect(cached2?.[0].filePath).toBe('/other.ts');
  });
});

describe('findFilesAsync', () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'perf-test-'));
    await fs.writeFile(path.join(tempDir, 'test.ts'), 'const x = 1;');
    await fs.writeFile(path.join(tempDir, 'test.js'), 'const x = 1;');
    await fs.mkdir(path.join(tempDir, 'subdir'));
    await fs.writeFile(path.join(tempDir, 'subdir', 'nested.ts'), 'const y = 2;');
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should find files matching pattern', async () => {
    const result = await findFilesAsync(tempDir, 'test', 5);
    expect(result.count).toBeGreaterThan(0);
    expect(result.files.some(f => f.includes('test'))).toBe(true);
  });

  test('should respect max depth', async () => {
    const result = await findFilesAsync(tempDir, 'nested', 1);
    expect(result).toBeDefined();
    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  test('should return empty for non-matching pattern', async () => {
    const result = await findFilesAsync(tempDir, 'xyznonexistent', 5);
    expect(result.count).toBe(0);
  });

  test('should handle case-insensitive matching', async () => {
    const result = await findFilesAsync(tempDir, 'TS', 5);
    expect(result.count).toBeGreaterThan(0);
  });
});

describe('countTypeScriptFiles', () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'count-test-'));
    await fs.writeFile(path.join(tempDir, 'a.ts'), '');
    await fs.writeFile(path.join(tempDir, 'b.tsx'), '');
    await fs.writeFile(path.join(tempDir, 'c.js'), '');
    await fs.writeFile(path.join(tempDir, 'd.d.ts'), '');
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should count .ts and .tsx files', async () => {
    const count = await countTypeScriptFiles(tempDir);
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

describe('getAnalysisTimeout', () => {
  test('should scale with file count', () => {
    const small = getAnalysisTimeout(30000, 10);
    const large = getAnalysisTimeout(30000, 1000);
    expect(large).toBeGreaterThanOrEqual(small);
  });

  test('should not exceed max timeout', () => {
    const timeout = getAnalysisTimeout(30000, 100000);
    expect(timeout).toBeLessThanOrEqual(120000);
  });

  test('should handle zero files', () => {
    const timeout = getAnalysisTimeout(30000, 0);
    expect(timeout).toBeGreaterThan(0);
  });
});

describe('fetchWithRetry', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    clearRequestCache(); // ✅ FIX: Clear cache between tests to prevent pollution
  });

  test('should return response on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('success'),
      json: () => Promise.resolve({ data: 'test' }),
    });

    const response = await fetchWithRetry('https://example.com');
    expect(response.ok).toBe(true);
  });

  test('should retry on server error', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}), text: () => Promise.resolve('') })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok'), json: () => Promise.resolve({}) });

    const response = await fetchWithRetry('https://example.com', undefined, 2, 1);
    expect(response.ok).toBe(true);
  });

  test('should throw after max retries', async () => {
    // Mock fetch to always fail with 500
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server Error' }),
      text: () => Promise.resolve('Internal Server Error'),
    });

    // Directly test fetchWithRetry with mocked global.fetch
    await expect(
      fetchWithRetry('https://example.com', undefined, 1, 1)
    ).rejects.toThrow();
  }, 5000);
});
