/**
 * Mock for performanceUtils — prevents all real network requests during tests.
 * This file is automatically loaded by Jest when importing from '../src/performanceUtils' 
 * or '../performanceUtils.js'.
 */

export const levenshteinSimilarity = jest.fn((a: string, b: string) => {
  // Simple mock: return 1 if strings match, 0 otherwise
  return a === b ? 1 : 0;
});

export const getCachedFuzzyResults = jest.fn(() => null);

export const cacheFuzzyResults = jest.fn();

export const findFilesAsync = jest.fn().mockResolvedValue({ files: [], count: 0 });

export const readFileSync = jest.fn().mockResolvedValue({
  success: true,
  data: { content: 'Mocked file content', path: '/mock/path', totalLength: 21 },
});

/**
 * Mock fetch response builder.
 */
function createMockResponse(options: {
  ok?: boolean;
  status?: number;
  html?: string;
  jsonBody?: Record<string, unknown>;
} = {}) {
  const { ok = true, status = 200, html = '<html><body>Test content</body></html>', jsonBody = {} } = options;

  return {
    ok,
    status,
    text: () => Promise.resolve(html),
    json: () => Promise.resolve(jsonBody),
  };
}

// Default mock — always succeeds with empty-ish response
export const fetchWithCache = jest.fn().mockResolvedValue(createMockResponse());
export const fetchWithRetry = jest.fn().mockResolvedValue(createMockResponse({
  html: '<html><body>Test content</body></html>',
  jsonBody: { query: { search: [{ title: 'Test', snippet: 'Snippet' }] } },
}));

export const clearRequestCache = jest.fn();

export const getAnalysisTimeout = jest.fn((base: number) => base);

export const countTypeScriptFiles = jest.fn().mockResolvedValue(0);
