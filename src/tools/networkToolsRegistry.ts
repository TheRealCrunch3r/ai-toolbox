/**
 * Network Tools Registry — Consolidated HTTP client & web research tools
 * 
 * Merged from httpClientTools.ts + webResearchTools.ts (2026-08-01)
 * 
 * Categories:
 * - HTTP Client: Generic requests, JSON GET/POST wrappers
 * - Web Research: Search engines, Wikipedia, content fetching
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import { search as ddgSearch } from 'duck-duck-scrape';
import { htmlToText } from 'html-to-text';
import type { PluginConfig } from '../config.js';
import { fetchWithRetry } from '../performanceUtils.js';

// ==================== Typed Params Interfaces ====================

interface HttpRequestParams {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
}

interface HttpGetJsonParams {
  url: string;
  headers?: Record<string, string>;
}

interface HttpPostJsonParams {
  url: string;
  data: Record<string, unknown>;
  headers?: Record<string, string>;
}

interface WebSearchParams { query: string; }
interface WikipediaSearchParams { query: string; lang?: string; }
interface FetchWebContentParams { url: string; }
interface RagWebContentParams { url: string; query: string; }

// ==================== Search Engine Implementations ====================

interface SearchResultItem {
  title: string;
  url: string;
  description: string;
}

/** DuckDuckGo API (fastest, no browser needed) */
async function searchDDGApi(query: string): Promise<SearchResultItem[]> {
  const results = await ddgSearch(query, { region: 'wt-wt' });
  return (results.results as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => ({
    title: r.title as string,
    url: r.url as string,
    description: (r.description as string) || '',
  }));
}

/** DuckDuckGo HTML Fetch (fallback when API fails) */
async function searchDDGFetch(query: string): Promise<SearchResultItem[]> {
  const response = await fetchWithRetry(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error(`DuckDuckGo Fetch failed: ${response.status}`);

  const html = await response.text();
  
  // Simple regex-based parsing for Node.js (no DOMParser needed!)
  const results: SearchResultItem[] = [];
  
  // Extract titles from <a class="result__a" href="..." rel="...">Title</a>
  const titleRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let match;
  
  while ((match = titleRegex.exec(html)) !== null) {
    results.push({
      title: match[2].replace(/&amp;/g, '&').trim(),
      url: match[1],
      description: '',
    });
  }

  return results.slice(0, 10);
}

/** Google Search via HTML Fetch */
async function searchGoogle(query: string): Promise<SearchResultItem[]> {
  const response = await fetchWithRetry(
    `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
  );
  if (!response.ok) throw new Error(`Google search failed: ${response.status}`);

  const html = await response.text();
  // Simple parsing — extract titles and URLs from Google's HTML structure
  const results: SearchResultItem[] = [];
  const titleRegex = /<h3[^>]*>(.*?)<\/h3>/g;

  let match;
  while ((match = titleRegex.exec(html)) !== null) {
    results.push({
      title: match[1].replace(/<[^>]*>/g, ''), // Remove HTML tags
      url: '',
      description: '',
    });
  }

  return results.slice(0, 10);
}

/** Bing Search via HTML Fetch */
async function searchBing(query: string): Promise<SearchResultItem[]> {
  const response = await fetchWithRetry(
    `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
  );
  if (!response.ok) throw new Error(`Bing search failed: ${response.status}`);

  const html = await response.text();
  // Parse Bing results — similar approach to Google
  const results: SearchResultItem[] = [];
  const resultRegex = /<li class="b_algo"[^>]*>(.*?)<\/li>/gs;

  let match;
  while ((match = resultRegex.exec(html)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/);
    if (titleMatch) {
      results.push({
        title: titleMatch[2],
        url: titleMatch[1],
        description: '',
      });
    }
  }

  return results.slice(0, 10);
}

/** All available Search Engine Functions */
const SEARCH_ENGINES: Record<string, (query: string) => Promise<SearchResultItem[]>> = {
  'ddg-api': searchDDGApi,
  'ddg-fetch': searchDDGFetch,
  'google': searchGoogle,
  'bing': searchBing,
};

/** Hardcoded fallback order — DuckDuckGo API is always tried first (Google/Bing block automated requests) */
const FALLBACK_ORDER: readonly string[] = ['ddg-api', 'ddg-fetch', 'google', 'bing'];

// ==================== Fallback Chain Logic ====================

/**
 * Web search with automatic fallback.
 * DuckDuckGo API is always the primary engine — UI config is ignored to prevent broken search.
 */
async function searchWithFallbackChain(
  query: string,
  _config: PluginConfig
): Promise<{ success: boolean; data?: { query: string; results: SearchResultItem[]; count: number; engine: string }; error?: string }> {
  // DuckDuckGo API is always first — it's the only engine that doesn't block automated requests
  const chain = [...FALLBACK_ORDER];

  for (const engine of chain) {
    try {
      const searchFn = SEARCH_ENGINES[engine];
      if (!searchFn) {
        console.error(`Search engine "${engine}" not found, skipping`);
        continue;
      }

      const results = await searchFn(query);

      // Validate result count - warn if low results
      if (results.length < 2) {
        console.log(`Low search results for "${query}": ${results.length} results from ${engine}`);
      }

      return {
        success: true,
        data: { query, results, count: results.length, engine },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Search engine "${engine}" failed: ${message}`);
      // Try next engine in the chain
      continue;
    }
  }

  return {
    success: false,
    error: `All search engines failed. Tried: ${chain.join(' → ')}`,
  };
}

// ==================== HTTP Client — Security & Validation ====================

/** SSRF protection - validate URL is safe */
function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    
    // Block internal/private IP addresses (SSRF protection)
    if (parsed.protocol === 'file:' || parsed.protocol === 'data:') {
      return { valid: false, error: `Protocol "${parsed.protocol}" is not allowed` };
    }

    // Allow http and https only
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: `Only HTTP/HTTPS protocols are allowed` };
    }

    // Block private IP ranges (basic check)
    const hostname = parsed.hostname;
    const blockedPatterns = [
      /^127\./,           // localhost
      /^10\./,            // 10.0.0.0/8
      /^172\.1[6-9]\./,   // 172.16.0.0/12
      /^172\.2[0-9]\./,   // 172.16.0.0/12
      /^172\.3[0-1]\./,   // 172.16.0.0/12
      /^192\.168\./,      // 192.168.0.0/16
      /^0\.0\.0\.0$/,     // 0.0.0.0
      /^localhost$/,      // localhost hostname
    ];

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      return { valid: false, error: `Access to ${hostname} is blocked for security reasons` };
    }

    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: `Invalid URL: ${message}` };
  }
}

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: `HTTP request failed: ${message}` };
}

// ==================== HTTP Client — Tool Implementations ====================

/**
 * Generic HTTP client for making requests to any REST API.
 */
async function httpRequest({ method, url, headers = {}, body }: HttpRequestParams): Promise<unknown> {
  try {
    // Validate URL for SSRF protection
    const validation = validateUrl(url);
    if (!validation.valid) return { success: false, error: validation.error };

    // Prepare request options
    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'User-Agent': 'AI-Toolbox/1.0',
        ...headers,
      },
    };

    // Handle body for non-GET/HEAD requests
    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
      
      // Set content-type header if not already set and body is object/string
      if (!headers['Content-Type'] && typeof body !== 'string') {
        (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
      }
    }

    console.log(`[AI Toolbox] HTTP ${method.toUpperCase()} ${url}`);

    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      // Parse response based on content type
      let responseData: unknown;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          // H1 FIX: Use [...(response.headers as Iterable<[string, string]>)] instead of .entries() — DOM Headers types don't expose .entries() publicly
headers: Object.fromEntries([...(response.headers as Iterable<[string, string]>)]),
          body: responseData,
          url,
          method: method.toUpperCase(),
        },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET request returning parsed JSON.
 */
async function httpGetJson({ url, headers = {} }: HttpGetJsonParams): Promise<unknown> {
  try {
    // Validate URL for SSRF protection
    const validation = validateUrl(url);
    if (!validation.valid) return { success: false, error: validation.error };

    console.log(`[AI Toolbox] HTTP GET ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'AI-Toolbox/1.0',
          Accept: 'application/json',
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data: { status: response.status, url },
        };
      }

      const data: unknown = await response.json();

      return {
        success: true,
        data: {
          status: response.status,
          // H1 FIX: Use [...(response.headers as Iterable<[string, string]>)] instead of .entries() — DOM Headers types don't expose .entries() publicly
headers: Object.fromEntries([...(response.headers as Iterable<[string, string]>)]),
          body: data,
          url,
        },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST request with JSON body.
 */
async function httpPostJson({ url, data, headers = {} }: HttpPostJsonParams): Promise<unknown> {
  try {
    // Validate URL for SSRF protection
    const validation = validateUrl(url);
    if (!validation.valid) return { success: false, error: validation.error };

    console.log(`[AI Toolbox] HTTP POST ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': 'AI-Toolbox/1.0',
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseData: unknown;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        success: true,
        data: {
          status: response.status,
          // H1 FIX: Use [...(response.headers as Iterable<[string, string]>)] instead of .entries() — DOM Headers types don't expose .entries() publicly
headers: Object.fromEntries([...(response.headers as Iterable<[string, string]>)]),
          body: responseData,
          url,
        },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return handleError(error);
  }
}

// ==================== Web Research — Tool Implementations ====================

/**
 * Wikipedia search via MediaWiki API.
 */
async function wikipediaSearch({ query, lang = 'en' }: WikipediaSearchParams): Promise<unknown> {
  try {
    const apiUrl = `https://${lang || 'en'}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const response = await fetchWithRetry(apiUrl);

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const queryData = data.query as Record<string, unknown> | undefined;
    const searchResults = (queryData?.search as Array<Record<string, unknown>>) || [];
    const pages = searchResults.map((item: Record<string, unknown>) => {
      const title = typeof item.title === 'string' ? item.title : '';
      const snippet = typeof item.snippet === 'string' ? item.snippet.replace(/<[^>]*>/g, '') : '';
      return {
        title,
        snippet,
        url: `https://${lang || 'en'}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      };
    });

    return { success: true, data: { query, language: lang || 'en', results: pages, count: pages.length } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Wikipedia search failed: ${message}` };
  }
}

/**
 * Fetch clean text content from a webpage URL.
 */
async function fetchWebContent({ url }: FetchWebContentParams): Promise<unknown> {
  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();
    
    // Hard cap on fetched content to prevent OOM (50KB max)
    const MAX_HTML_SIZE = 50_000;
    if (html.length > MAX_HTML_SIZE) {
      return { success: false, error: `Page too large (${(html.length / 1024).toFixed(1)} KB). Max allowed is ${MAX_HTML_SIZE / 1024} KB. Use searxng_search + summary_only for large pages.` };
    }

    const text = htmlToText(html, {
      wordwrap: false,
    });

    return { success: true, data: { url, content: text.substring(0, 5000) } }; // Limit length
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to fetch content: ${message}` };
  }
}

/**
 * Fetch URL content and extract relevant chunks matching a query.
 */
async function ragWebContent({ url, query }: RagWebContentParams): Promise<unknown> {
  try {
    const response = await fetchWithRetry(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const html = await response.text();
    
    // Hard cap on fetched content to prevent OOM (50KB max)
    const MAX_HTML_SIZE = 50_000;
    if (html.length > MAX_HTML_SIZE) {
      return { success: false, error: `Page too large (${(html.length / 1024).toFixed(1)} KB). Max allowed is ${MAX_HTML_SIZE / 1024} KB. Use searxng_search + summary_only for large pages.` };
    }

    const text = htmlToText(html);

    // Simple keyword-based relevance scoring (placeholder for real RAG)
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
    const sentences = text.split(/[.!?]+/).map((s: string) => s.trim()).filter(Boolean);

    const relevantChunks = sentences.filter((sentence: string) => {
      return queryTerms.some((term: string) => sentence.toLowerCase().includes(term));
    }).slice(0, 5); // Return top 5 hits

    return { success: true, data: { url, query, chunks: relevantChunks } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `RAG search failed: ${message}` };
  }
}

// ==================== Tool Registration ====================

export function registerNetworkTools(config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // ===== HTTP Client Tools =====

  // http_request tool - Generic HTTP client
  tools.push(tool({
    name: 'http_request',
    description: 'Make generic HTTP requests to any REST API. Supports GET, POST, PUT, DELETE, PATCH and other methods.',
    parameters: {
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).describe('HTTP method'),
      url: z.string().url().describe('Request URL (must be http:// or https://)'),
      headers: z.record(z.string()).optional().describe('Custom headers as key-value pairs'),
      body: z.union([z.string(), z.record(z.unknown())]).optional().describe('Request body (string or JSON object)'),
    },
    implementation: async (params) => httpRequest(params as HttpRequestParams),
  }));

  // http_get_json tool - Convenience wrapper for GET requests
  tools.push(tool({
    name: 'http_get_json',
    description: 'Make a GET request and return parsed JSON response.',
    parameters: {
      url: z.string().url().describe('Request URL (must be http:// or https://)'),
      headers: z.record(z.string()).optional().describe('Custom headers as key-value pairs'),
    },
    implementation: async (params) => httpGetJson(params as HttpGetJsonParams),
  }));

  // http_post_json tool - Convenience wrapper for POST requests
  tools.push(tool({
    name: 'http_post_json',
    description: 'Make a POST request with JSON body and return parsed response.',
    parameters: {
      url: z.string().url().describe('Request URL (must be http:// or https://)'),
      data: z.record(z.unknown()).describe('JSON object to send as request body'),
      headers: z.record(z.string()).optional().describe('Custom headers as key-value pairs'),
    },
    implementation: async (params) => httpPostJson(params as HttpPostJsonParams),
  }));

  // ===== Web Research Tools =====

  // web_search tool — uses primary engine from Config + automatic fallback
  tools.push(tool({
    name: 'web_search',
    description: 'Search the web using a configurable search engine with automatic fallback to other engines if the primary one fails.',
    parameters: {
      query: z.string().describe('The search query'),
    },
    implementation: async ({ query }: WebSearchParams) => { // C5 FIX: typed params
      return await searchWithFallbackChain(query, config);
    },
  }));

  // wikipedia_search tool
  tools.push(tool({
    name: 'wikipedia_search',
    description: 'Search Wikipedia for a given query and return page summaries.',
    parameters: {
      query: z.string().describe('The search query'),
      lang: z.string().optional().default('en').describe('Language code (default: en)'),
    },
    implementation: async ({ query, lang }: WikipediaSearchParams) => { // C5 FIX: typed params
      return await wikipediaSearch({ query, lang });
    },
  }));

  // fetch_web_content tool
  tools.push(tool({
    name: 'fetch_web_content',
    description: 'Fetch the clean, text-based content of a webpage URL.',
    parameters: {
      url: z.string().url().describe('The URL to fetch'),
    },
    implementation: async ({ url }: FetchWebContentParams) => { // C5 FIX: typed params
      return await fetchWebContent({ url });
    },
  }));

  // rag_web_content tool — note: also exists in vectorRagTools.ts (potential duplicate name)
  tools.push(tool({
    name: 'rag_web_content',
    description: 'Fetch content from a URL, and then use RAG to find and return only the text chunks most relevant to a specific query.',
    parameters: {
      url: z.string().url().describe('The URL to fetch'),
      query: z.string().describe('The search query for relevance matching'),
    },
    implementation: async ({ url, query }: RagWebContentParams) => { // C5 FIX: typed params
      return await ragWebContent({ url, query });
    },
  }));

  return tools;
}
