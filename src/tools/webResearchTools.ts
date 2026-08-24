import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import { search as ddgSearch } from 'duck-duck-scrape';
import { htmlToText } from 'html-to-text';
import type { PluginConfig } from '../config.js';
import { fetchWithRetry, readBoundedText } from '../performanceUtils.js';

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

// ==================== Typed Params Interfaces ====================

interface WebSearchParams { query: string; }
interface WikipediaSearchParams { query: string; lang?: string; }
interface FetchWebContentParams { url: string; }
// NOTE (v1.9.x dup-removal): the former local rag_web_content tool and its RagWebContentParams
// interface were removed here; it is now registered exclusively by vectorRagTools.ts ('vectorRAG' toggle)
// to avoid a duplicate entry in LM Studio's tool list.

export function registerWebResearchTools(config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

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
      try {
        const response = await fetchWithRetry(url);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        // OOM guard: hard cap enforced DURING transfer (streaming read + early socket cancel).
        // Previously response.text() buffered the ENTIRE body before this check could run — an
        // oversized page then exhausted the plugin host's heap (dev log 2026-08-24, OOM fatal).
        const MAX_HTML_SIZE = 50_000;
        let html: string;
        try {
          html = await readBoundedText(response, MAX_HTML_SIZE);
        } catch (sizeError) {
          const sizeMsg = sizeError instanceof Error ? sizeError.message : String(sizeError);
          return { success: false, error: `${sizeMsg} Use searxng_search + summary_only for large pages.` };
        }

        const text = htmlToText(html, {
          wordwrap: false,
        });

        return { success: true, data: { url, content: text.substring(0, 5000) } }; // Limit length
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to fetch content: ${message}` };
      }
    },
  }));

  // FIX (v1.9.x dup-removal): rag_web_content intentionally NOT registered here.
  // It is provided by vectorRagTools.ts under the 'vectorRAG' toggle — registering it in BOTH
  // registries produced a duplicate entry in LM Studio's tool list and non-deterministic dispatch.

  return tools;
}
