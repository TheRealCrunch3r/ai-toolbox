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
      // 24.08 fix: body must be streamable JSON text — wikipedia_search now parses via
      // readBoundedText + JSON.parse (last unbounded response.json() in this file was bounded).
      // The .json() alias is kept for compatibility; htmlToText stays mocked, so the
      // fetch_web_content tests are unaffected by what bytes the stream carries.
      body: streamFromChunks([new TextEncoder().encode(JSON.stringify({ query: { search: [{ title: 'Test', snippet: 'Test snippet' }] } }))]),
      json: () => Promise.resolve({ query: { search: [{ title: 'Test', snippet: 'Test snippet' }] } }),
    }),
  };
});

describe('Web Research Tools', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let tools: ReturnType<typeof registerWebResearchTools>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Test isolation (25.08 fix): clearAllMocks() does NOT reset implementations nor *Once queues, so stale
    // state queued by earlier tests could poison these shared mocks (proven: wikipedia_search passed alone
    // but failed in suite order). mockReset() + explicit re-apply of base values gives clean per-test state.
    const ddgMocked = require('duck-duck-scrape');
    (ddgMocked.search as jest.Mock).mockReset();
    (ddgMocked.search as jest.Mock).mockResolvedValue({
      results: [
        { title: 'Result 1', url: 'https://result1.com', description: 'Body 1' },
        { title: 'Result 2', url: 'https://result2.com', description: 'Body 2' },
      ],
    });
    const puMocked = require('../src/performanceUtils');
    (puMocked.fetchWithRetry as jest.Mock).mockReset();
    (puMocked.fetchWithRetry as jest.Mock).mockImplementation(async () => ({
      ok: true,
      headers: { get: () => null },
      body: streamFromChunks([new TextEncoder().encode(JSON.stringify({ query: { search: [{ title: 'Test', snippet: 'Test snippet' }] } }))]),
      json: () => Promise.resolve({ query: { search: [{ title: 'Test', snippet: 'Test snippet' }] } }),
    }));
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

  // 08.09 regression (live probe, 08.09 datacenter IP): HTTP-200-but-empty SERP pages — bot-blocked /
  // JS-shell responses (observed on google.com: consent redirect param + zero parseable result elements)
  // were returned as success:true with count:0, which STOPPED the fallback chain at that dead engine and
  // never let later engines run. These tests simulate exactly that shape per engine position.
  describe('web_search zero-result fallback (blocked-engine regression)', () => {
    const htmlStream = (text: string) => ({
      getReader: () => {
        let sent = false;
        return {
          read: async (): Promise<{ done: boolean; value?: Uint8Array }> =>
            sent ? { done: true } : ((sent = true), { done: false, value: new TextEncoder().encode(text) }),
          cancel: async () => {},
        };
      },
    });

    // google-style shell page: 200 OK, JS-required marker, zero parseable <h3> result elements
    const shellHtml = '<html><body>This page requires JavaScript. ucbcb=1</body></html>';
    // bing-style healthy page with real results (parse target of the exact regex in searchBing())
    const bingGoodHtml = [1, 2]
      .map((i) => `<li class="b_algo"><a href="https://ok.example/page${i}" rel="">Title ${i}</a></li>`)
      .join('');

    // Per-engine fetch sequence: ddg-fetch → shell (0), google → shell (0), bing → real results (2)
    const fetchSequence = [shellHtml, shellHtml, bingGoodHtml];
    let fetchCalls = 0;

    beforeEach(() => {
      fetchCalls = 0;
      // Force the chain past ddg-api (library mock must throw — simulates the live DDG anomaly block)
      const ddgMocked = require('duck-duck-scrape');
      (ddgMocked.search as jest.Mock).mockReset();
      (ddgMocked.search as jest.Mock).mockRejectedValue(new Error('anomaly'));
      const puMocked = require('../src/performanceUtils');
      (puMocked.fetchWithRetry as jest.Mock).mockImplementation(async (url: string) => {
        const html = fetchSequence[Math.min(fetchCalls++, fetchSequence.length - 1)];
        return { ok: true, url, headers: { get: () => null }, body: htmlStream(html) };
      });
    });

    test('empty SERP page from a mid-chain engine must not stop the fallback chain', async () => {
      const tool = tools?.find(t => t.name === 'web_search');
      expect(tool).toBeDefined(); // sanity guard — fail loudly if registration changed
      const result: any = await tool?.implementation({ query: 'blocked engine probe' });

      // Chain path: ddg-api throws → ddg-fetch 0 results (shell) → MUST CONTINUE → google 0 → bing real data
      expect(result.success).toBe(true);
      expect(result.data.engine).toBe('bing');
      expect(result.data.count).toBe(2);
      expect(fetchCalls).toBe(3); // ddg-fetch, google, bing — all three were reached
    });

    test('all engines empty reports blocked/empty wording, not "all failed"', async () => {
      const puMocked = require('../src/performanceUtils');
      (puMocked.fetchWithRetry as jest.Mock).mockImplementation(async (url: string) => ({
        ok: true, url, headers: { get: () => null }, body: htmlStream(shellHtml),
      }));

      const tool = tools?.find(t => t.name === 'web_search');
      const result: any = await tool?.implementation({ query: 'all engines blocked' });

      expect(result.success).toBe(false);
      // 08.09 wording change: distinguishes "responded but empty" (likely bot-blocked) from hard failures
      expect(String(result.error)).toContain('No search results found');
    });
  });
});
