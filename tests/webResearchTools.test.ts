/**
 * Tests for Web Research Tools
 */

import { registerWebResearchTools } from '../src/tools/webResearchTools';
import { DEFAULT_CONFIG } from '../src/config';

// Mock duck-duck-scrape
jest.mock('duck-duck-scrape', () => ({
  search: jest.fn().mockResolvedValue({
    results: [
      { title: 'Result 1', url: 'https://result1.com', description: 'Body 1' },
      { title: 'Result 2', url: 'https://result2.com', description: 'Body 2' },
    ],
  }),
}));

// Mock html-to-text
jest.mock('html-to-text', () => ({
  htmlToText: jest.fn().mockReturnValue('Plain text content'),
}));

// Mock fetchWithRetry from performanceUtils
jest.mock('../src/performanceUtils', () => {
  const actual = jest.requireActual('../src/performanceUtils');
  return {
    ...actual,
    fetchWithRetry: jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html><body>Test content</body></html>'),
      json: () => Promise.resolve({ query: { search: [{ title: 'Test', snippet: 'Test snippet' }] } }),
    }),
  };
});

describe('Web Research Tools', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let tools: ReturnType<typeof registerWebResearchTools>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress search engine fallback warnings in tests (expected behavior)
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    tools = registerWebResearchTools(DEFAULT_CONFIG);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should register web research tools', () => {
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
  });

  describe('web_search', () => {
    test('should search via DDG API', async () => {
      const tool = tools?.find(t => t.name === 'web_search');
      const result = await tool?.implementation({ query: 'test query' });
      expect((result as any).success).toBe(true);
    });

    test('should handle search error', async () => {
      const { search } = require('duck-duck-scrape');
      (search as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const tool = tools?.find(t => t.name === 'web_search');
      const result = await tool?.implementation({ query: 'test' });
      // Should fall back to next engine, not fail completely
      expect(result).toBeDefined();
    });
  });

  describe('fetch_web_content', () => {
    test('should fetch and extract text', async () => {
      const tool = tools?.find(t => t.name === 'fetch_web_content');
      const result = await tool?.implementation({ url: 'https://example.com' });
      expect((result as any).success).toBe(true);
    });

    test('should handle fetch error', async () => {
      const { fetchWithRetry } = require('../src/performanceUtils');
      (fetchWithRetry as jest.Mock).mockRejectedValueOnce(new Error('Timeout'));
      const tool = tools?.find(t => t.name === 'fetch_web_content');
      const result = await tool?.implementation({ url: 'https://slow-site.com' });
      expect((result as any).success).toBe(false);
    });
  });

  describe('wikipedia_search', () => {
    test('should search Wikipedia', async () => {
      const tool = tools?.find(t => t.name === 'wikipedia_search');
      const result = await tool?.implementation({ query: 'test topic' });
      expect((result as any).success).toBe(true);
    });

    test('should handle Wikipedia API error', async () => {
      const { fetchWithRetry } = require('../src/performanceUtils');
      (fetchWithRetry as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      const tool = tools?.find(t => t.name === 'wikipedia_search');
      const result = await tool?.implementation({ query: 'test' });
      expect((result as any).success).toBe(false);
    });
  });
});
