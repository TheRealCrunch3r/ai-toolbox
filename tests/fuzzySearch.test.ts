/**
 * Tests for fuzzy file search (Levenshtein-based)
 */

import { levenshteinDistance, calculateMatchScore, fuzzySearchFiles } from '../src/fuzzySearch';

describe('levenshteinDistance', () => {
  test('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  test('should return length for empty vs non-empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  test('should calculate correct distance', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('abc', 'abd')).toBe(1);
  });
});

describe('calculateMatchScore', () => {
  test('should return 1 for identical strings', () => {
    expect(calculateMatchScore('file.txt', 'file.txt')).toBe(1);
  });

  test('should return high score for similar strings', () => {
    const score = calculateMatchScore('config', 'configuration');
    // 'config' vs 'configuration' has Levenshtein distance of ~5, max length 13
    // Score = 1 - (5/13) ≈ 0.62, but actual calculation may vary slightly
    expect(score).toBeGreaterThan(0.4);
  });

  test('should return low score for dissimilar strings', () => {
    const score = calculateMatchScore('file.txt', 'database.sql');
    expect(score).toBeLessThan(0.3);
  });

  test('should be case-insensitive', () => {
    expect(calculateMatchScore('File.TXT', 'file.txt')).toBe(1);
  });
});

describe('fuzzySearchFiles', () => {
  const fileList = [
    'src/index.ts',
    'src/config.ts',
    'src/toolsProvider.ts',
    'tests/config.test.ts',
    'package.json',
  ];

  test('should return matches above threshold', () => {
    const results = fuzzySearchFiles('config', fileList, 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].filePath).toContain('config');
  });

  test('should sort by score descending', () => {
    const results = fuzzySearchFiles('src', fileList, 5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test('should limit results count', () => {
    const results = fuzzySearchFiles('ts', fileList, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  test('should return empty for no matches', () => {
    const results = fuzzySearchFiles('xyznonexistent', fileList, 5);
    expect(results.length).toBe(0);
  });
});
