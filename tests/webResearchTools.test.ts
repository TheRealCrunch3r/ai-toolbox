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

// --- Helpers to build mock Response objects compatible with readBoundedText (streaming reader) ---

function streamFromChunks(chunks: Uint8Array[], hooks?: { onRead?: () => void; onCancel?: () => void }) {
  let idx = 0;
  // Both reader-level and body-level cancellation count as "socket released".
  const fireCancel = async (): Promise<void> => { if (hooks?.onCancel) hooks.onCancel(); };
  return {
    getReader: () => ({
      read: async (): Promise<{ done: boolean; value?: Uint8Array }> => {
        if (hooks?.onRead) hooks.onRead();
        return idx < chunks.length ? { done: false, value: chunks[idx++] } : { done: true, value: undefined };
      },
      cancel: fireCancel,
    }),
    cancel: fireCancel,
  };
}

// Mock fetchWithRetry from performanceUtils. The resolved response must expose a streamable `body`
// because the OOM fix (readBoundedText) no longer calls response.text().
jest.mock('../src/performanceUtils', () => {
  const actual = jest.requireActual('../src/performanceUtils');
  return {
    ...actual,
    fetchWithRetry: jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => null },
      body: streamFromChunks([new TextEncoder().encode('<html><body>Test content</body></html>')]),
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

    // OOM regression tests (LM Studio dev log 2026-08-24): oversized pages must be rejected
    // DURING transfer, never after buffering the full body into the heap.
    describe('oversized page protection', () => {
      test('fast-rejects via Content-Length without reading the stream', async () => {
        const { fetchWithRetry } = require('../src/performanceUtils');
        let readCalls = 0;
        let cancelled = false;
        (fetchWithRetry as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: { get: (n: string) => (n.toLowerCase() === 'content-length' ? String(500_000) : null) },
          body: streamFromChunks([new TextEncoder().encode('x'.repeat(100))], {
            onRead: () => { readCalls++; },
            onCancel: () => { cancelled = true; },
          }),
        });
        const tool = tools?.find(t => t.name === 'fetch_web_content');
        const result = await tool?.implementation({ url: 'https://example.com/huge' }) as any;
        expect(result.success).toBe(false);
        expect(result.error).toContain('Page too large');
        expect(readCalls).toBe(0); // never started streaming the body
        expect(cancelled).toBe(true); // socket released immediately
      });

      test('stops chunked stream the moment the 50KB budget is exceeded', async () => {
        const { fetchWithRetry } = require('../src/performanceUtils');
        let readCalls = 0;
        let cancelled = false;
        // Three 30,000-char chunks, no Content-Length: budget must trip mid-stream (after chunk 2).
        (fetchWithRetry as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: { get: () => null },
          body: streamFromChunks(
            [
              new TextEncoder().encode('a'.repeat(30_000)),
              new TextEncoder().encode('b'.repeat(30_000)),
              new TextEncoder().encode('c'.repeat(30_000)),
            ],
            { onRead: () => { readCalls++; }, onCancel: () => { cancelled = true; } },
          ),
        });
        const tool = tools?.find(t => t.name === 'fetch_web_content');
        const result = await tool?.implementation({ url: 'https://example.com/streamy' }) as any;
        expect(result.success).toBe(false);
        expect(result.error).toContain('Page too large');
        expect(readCalls).toBe(2); // chunk 3 was never pulled — transfer aborted early
        expect(cancelled).toBe(true);
      });
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
