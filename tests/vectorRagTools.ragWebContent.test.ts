/**
 * Regression tests for rag_web_content (vectorRagTools.ts) — 24.08.2026 OOM/correctness fix.
 *
 * Contract under test:
 * 1. Fetched HTML is stripped via html-to-text BEFORE chunking/embedding — the returned
 *    bestMatch.text must be readable prose and never contain markup (old behavior embedded
 *    raw tag soup, wasting ~40–60% of the budget on markup tokens).
 * 2. Oversized pages use a SOFT cap (readCappedText): partial content still returns
 *    success:true with truncated: true. The old hard "Page too large" failure made typical
 *    Wikipedia articles (>250k chars of HTML) fail every time while consuming the maximum
 *    allocation first — the exact Weinstein-lookup pattern from the 24.08 screenshot.
 * 3. Per-call heap stays bounded: one string of at most MAX_RAG_HTML_CHARS (250,000) is the
 *    largest single transient allocation on this path.
 *
 * MOCKING NOTE (24.08 OOM investigation): fetchWithRetry is stubbed with a PLAIN CLOSURE via
 * mockFetchImpl — NOT jest.fn().mockImplementation(). Jest's mock state (per-call args/results
 * history) retained the >100KB response objects of the large-page tests and deterministically
 * OOM'd this suite in the sandbox (~2–4 GB in ~6 s); a plain closure holds no per-call history.
 */

import { registerRagTools } from '../src/tools/vectorRagTools';
import { DEFAULT_CONFIG } from '../src/config';
import { htmlToText } from 'html-to-text'; // real implementation — core behavior must not be mocked away

// --- Helper to build a mock Response compatible with readCappedText (streaming reader) ---
function streamFromChunks(chunks: Uint8Array[]): unknown {
  let idx = 0;
  return {
    getReader: () => ({
      read: async (): Promise<{ done: boolean; value?: Uint8Array }> => {
        if (idx < chunks.length) {
          const v = chunks[idx++];
          return { done: false, value: v };
        }
        return { done: true, value: undefined };
      },
      cancel: async (): Promise<void> => {},
    }),
    cancel: async (): Promise<void> => {},
  };
}

function jsonResponse(bodyText: string): Record<string, unknown> {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: { get: () => null }, // no Content-Length → chunked-stream path
    body: streamFromChunks([new TextEncoder().encode(bodyText)]),
  };
}

/** Per-test stub for fetchWithRetry. A plain closure — zero call/result history retained (see MOCKING NOTE). */
type FetchStub = (url: string, options?: RequestInit) => Promise<unknown>;
let mockFetchImpl: FetchStub | undefined; // name starts with 'mock' → allowed inside the jest.mock factory below

jest.mock('../src/performanceUtils', () => {
  const actual = jest.requireActual('../src/performanceUtils');
  return {
    ...actual,
    // Plain closure delegating to mockFetchImpl (read at CALL time). readCappedText stays the REAL implementation.
    fetchWithRetry: async (url: string, options?: RequestInit): Promise<unknown> => {
      if (!mockFetchImpl) throw new Error('fetchWithRetry test stub not configured for this case');
      return mockFetchImpl(url, options);
    },
  };
});

describe('rag_web_content — markup stripping + soft-cap contract', () => {
  let tools: ReturnType<typeof registerRagTools>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockFetchImpl = async () => jsonResponse(
      '<html><body><div class="article">' +
        '<h2>Eric Weinstein is a theoretical physicist and hedge fund manager.</h2>' +
        '<p>He completed his PhD at Harvard University in nineteen ninety-eight before founding Millennium Management.</p>' +
        '</div></body></html>',
    );
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    tools = registerRagTools(DEFAULT_CONFIG);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    mockFetchImpl = undefined; // no cross-test state (replaces the old jest.clearAllMocks())
  });

  test('tool is registered exactly once under the vectorRAG registry', () => {
    const matches = tools.filter(t => t.name === 'rag_web_content');
    expect(matches.length).toBe(1);
  });

  test('strips markup BEFORE chunking/embedding — bestMatch.text is readable prose, never HTML', async () => {
    const tool = tools.find(t => t.name === 'rag_web_content');
    const result = (await tool?.implementation({
      url: 'https://en.wikipedia.org/wiki/Eric_Weinstein',
      query: 'Eric Weinstein education Harvard PhD',
    })) as any;

    expect(result.success).toBe(true);
    const data = result.data;
    expect(data.truncated).toBe(false);
    // The prose made it through html-to-text (proves stripping happened before chunking):
    expect(String(data.bestMatch.text)).toMatch(/Harvard/);
    // And NO markup survived into the returned text:
    expect(String(data.bestMatch.text)).not.toContain('<');
  });

  test('oversized page → soft cap: success:true + truncated flag, partial content still usable', async () => {
    // ~260k chars of HTML in two chunks — exceeds the 250_000 budget mid-stream.
    const fillerSentence = '<p>He studied theoretical physics and information theory at the frontier of modern science.</p>';
    const html = '<html><body>' + fillerSentence.repeat(4600) + '</body></html>';
    const half = Math.floor(html.length / 2);
    mockFetchImpl = async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => null },
      body: streamFromChunks([
        new TextEncoder().encode(html.substring(0, half)),
        new TextEncoder().encode(html.substring(half)),
      ]),
    });

    const tool = tools.find(t => t.name === 'rag_web_content');
    const result = (await tool?.implementation({
      url: 'https://en.wikipedia.org/wiki/Eric_Weinstein',
      query: 'Eric Weinstein education Harvard PhD dissertation',
    })) as any;

    expect(result.success).toBe(true); // soft cap — must NOT be a hard "Page too large" failure
    expect(result.error).toBeUndefined();
    const data = result.data;
    expect(data.truncated).toBe(true);
    expect(Array.isArray(data.chunks)).toBe(true);
    expect(data.chunks.length).toBeGreaterThan(0);
    // Returned chunk text is stripped prose (no markup), bounded by the budget:
    for (const c of data.chunks) {
      expect(String(c.text)).not.toContain('<');
    }
  });

  test('network failure → success:false with RAG error contract preserved', async () => {
    mockFetchImpl = async () => { throw new Error('ECONNRESET'); };
    const tool = tools.find(t => t.name === 'rag_web_content');
    const result = (await tool?.implementation({
      url: 'https://en.wikipedia.org/wiki/Eric_Weinstein',
      query: 'test',
    })) as any;
    expect(result.success).toBe(false);
    expect(String(result.error)).toContain('RAG search failed');
  });

  test('sanity: real htmlToText on the sample markup yields no angle brackets (guards helper assumptions)', () => {
    const text = htmlToText(
      '<div class="article"><h2>Eric Weinstein is a theoretical physicist.</h2></div>',
      { wordwrap: false },
    );
    expect(text).not.toContain('<');
    // html-to-text uppercases <h*> headings by default (uppercaseHeadings) — compare case-insensitively.
    expect(text.toLowerCase()).toContain('theoretical physicist');
  });
});
