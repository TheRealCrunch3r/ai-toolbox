import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import { search as ddgSearch } from 'duck-duck-scrape';
import { htmlToText } from 'html-to-text';
import type { PluginConfig } from '../config.js';
import { fetchWithRetry, readBoundedText, readCappedText, WEB_FETCH_TIMEOUT_MS } from '../performanceUtils.js';

// 04.10 ABORT-CONTRACT: duck-duck-scrape 2.2.7's RUNTIME search() takes a third `needleOptions` argument (verified in the
// installed lib/search/search.js — it is forwarded to BOTH the VQD token request and the main needle() call), but its
// bundled .d.ts declares only two parameters, so tsc rejects the three-arg call (TS2554). Runtime behavior is unchanged
// by this alias — same function, same arguments. Re-check if duck-duck-scrape is bumped: drop the alias when its types catch up.
type DDGSearchCompat = (
  query: string,
  options?: Record<string, unknown>,
  needleOptions?: { signal?: AbortSignal; headers?: Record<string, string> },
) => Promise<{ results: Array<Record<string, unknown>> }>;
const ddgSearchWithSignal = ddgSearch as unknown as DDGSearchCompat;

// OOM guard: search-engine result pages are parsed via regex — a hard cap during transfer bounds the
// worst-case allocation. Partial pages still yield their top results (soft cap by design).
const MAX_SEARCH_HTML_CHARS = 300_000; // ~45k words — ample for 10 results on DDG/Google/Bing HTML

// 04.10 ABORT-CONTRACT: VERBATIM mirror of duck-duck-scrape 2.2.7's internal COMMON_HEADERS
// (node_modules/duck-duck-scrape/lib/util.js). dds search() passes needleOptions straight to the VQD token request —
// `getVQD()` does NOT merge its own header defaults — so an options object that carries a signal but no headers makes
// the VQD hop go out with Node's default User-Agent, i.e. LESS bot-resistant than the no-signal baseline (which dds
// sends with these browser headers). Re-supplied only on the hostSignal branch: without a host signal we still pass
// undefined and dds's own defaults apply — byte-identical happy path. If duck-duck-scrape is bumped, re-diff this against
// its util.js COMMON_HEADERS.
const DDG_COMMON_HEADERS: Record<string, string> = {
  'sec-ch-ua': '"Not=A?Brand";v="8", "Chromium";v="129"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'sec-gpc': '1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
};

// ==================== 04.10 ABORT-CONTRACT (house idiom) ====================
/** Structural slice of the SDK's ToolCallContext — same ctx contract as executionTools.ts / ripgrep in fileSystemTools.ts. */
interface ToolCallContextLike { signal?: AbortSignal; }

/** House abort envelope for fetch-based tools: mirrors httpClientTools' aborted reporting (no partial payload
 *  exists for web research — the flag presence is the contract). */
function abortedEnvelope(hint: string): { success: boolean; aborted: true; error: string } {
  return { success: false as const, aborted: true, error: hint };
}

// ==================== Search Engine Implementations ====================

interface SearchResultItem {
  title: string;
  url: string;
  description: string;
}

/** DuckDuckGo API (fastest, no browser needed) */
async function searchDDGApi(query: string, hostSignal?: AbortSignal): Promise<SearchResultItem[]> { // 04.10 ABORT-CONTRACT
  // Forward the host signal into duck-duck-scrape's third argument (needleOptions — needle 3.x accepts an AbortSignal
  // natively and rejects pre-aborted ones; verified in installed needle 3.5.0, lib/needle.js lines ~800-804). Passed
  // ONLY when a signal exists so no-signal calls stay byte-identical to before: with undefined, dds falls back to its
  // internal {headers: COMMON_HEADERS} for the VQD request and needle defaults for the main one. WITH a signal we must
  // re-supply DDG_COMMON_HEADERS (see above) — an options object REPLACES dds's default rather than extending it.
  const results = await ddgSearchWithSignal(query, { region: 'wt-wt' }, hostSignal ? { signal: hostSignal, headers: DDG_COMMON_HEADERS } : undefined);
  // The DDGSearchCompat alias types results.results exactly — no assertion needed (04.10 lint fix: no-unnecessary-type-assertion)
  return results.results.map((r: Record<string, unknown>) => ({
    title: r.title as string,
    url: r.url as string,
    description: (r.description as string) || '',
  }));
}

/** DuckDuckGo HTML Fetch (fallback when API fails) */
async function searchDDGFetch(query: string, hostSignal?: AbortSignal): Promise<SearchResultItem[]> { // 04.10 ABORT-CONTRACT
  const signal = mergeHostSignal(hostSignal); // grepGuard idiom — helper below the engines table; null keeps fetchWithRetry's own 30 s guard path byte-identical
  const response = await fetchWithRetry(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    signal ? { signal } : undefined
  );
  if (!response.ok) throw new Error(`DuckDuckGo Fetch failed: ${response.status}`);

  // OOM guard: bounded DURING transfer (was unbounded response.text() — full page buffered first,
  // the exact pattern that exhausted the plugin host heap on 2026-08-24 during fallback-engine runs).
  const html = await readCappedText(response, MAX_SEARCH_HTML_CHARS);
  
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
async function searchGoogle(query: string, hostSignal?: AbortSignal): Promise<SearchResultItem[]> { // 04.10 ABORT-CONTRACT
  const signal = mergeHostSignal(hostSignal); // grepGuard idiom — helper below the engines table; null keeps fetchWithRetry's own 30 s guard path byte-identical
  const response = await fetchWithRetry(
    `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, ...(signal && { signal }) } // spread is a no-op without hostSignal — happy path untouched
  );
  if (!response.ok) throw new Error(`Google search failed: ${response.status}`);

  // OOM guard: bounded DURING transfer (was unbounded response.text() — full page buffered first,
  // the exact pattern that exhausted the plugin host heap on 2026-08-24 during fallback-engine runs).
  const html = await readCappedText(response, MAX_SEARCH_HTML_CHARS);
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
async function searchBing(query: string, hostSignal?: AbortSignal): Promise<SearchResultItem[]> { // 04.10 ABORT-CONTRACT
  const signal = mergeHostSignal(hostSignal); // grepGuard idiom — helper below the engines table; null keeps fetchWithRetry's own 30 s guard path byte-identical
  const response = await fetchWithRetry(
    `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, ...(signal && { signal }) } // spread is a no-op without hostSignal — happy path untouched
  );
  if (!response.ok) throw new Error(`Bing search failed: ${response.status}`);

  // OOM guard: bounded DURING transfer (was unbounded response.text() — full page buffered first,
  // the exact pattern that exhausted the plugin host heap on 2026-08-24 during fallback-engine runs).
  const html = await readCappedText(response, MAX_SEARCH_HTML_CHARS);
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
type SearchEngineFn = (query: string, hostSignal?: AbortSignal) => Promise<SearchResultItem[]>; // 04.10 ABORT-CONTRACT
const SEARCH_ENGINES: Record<string, SearchEngineFn> = {
  'ddg-api': searchDDGApi,
  'ddg-fetch': searchDDGFetch,
  'google': searchGoogle,
  'bing': searchBing,
};

/** Hardcoded fallback order — DuckDuckGo API is always tried first (Google/Bing block automated requests) */
const FALLBACK_ORDER: readonly string[] = ['ddg-api', 'ddg-fetch', 'google', 'bing'];

// ==================== 04.10 ABORT-CONTRACT (house idiom, continued) ====================
/**
 * ONE authoritative AbortController per fetch call (grepGuard idiom, src/utils/grepGuard.ts): the host signal is
 * forwarded INTO it — a WHATWG signal has no reverse .abort(), so forwarding = listen {once:true} plus a synchronous
 * pre-aborted check. The existing WEB_FETCH_TIMEOUT_MS guard rides on the SAME controller: when we return one,
 * fetchWithRetry() takes its "caller manages cancellation" branch and skips its internal timer — net timeout is
 * unchanged (30 s). Returns null without hostSignal so call sites stay byte-identical to before.
 */
function mergeHostSignal(hostSignal?: AbortSignal): AbortSignal | null {
  if (!hostSignal) return null;
  const controller = new AbortController();
  if (hostSignal.aborted) {
    controller.abort(); // pre-abort: the 'abort' event does NOT re-fire for late listeners — handle synchronously
  } else {
    hostSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  const timeoutId = setTimeout(() => controller.abort(), WEB_FETCH_TIMEOUT_MS);
  // Unref'd by design: the guard must never keep the event loop (or a jest worker) alive after the guarded request has
  // settled — in production the plugin host keeps the loop busy regardless; if it fires late, aborting an already-
  // settled controller is a harmless no-op. The explicit clear on 'abort' covers the early-settle paths.
  if (typeof timeoutId.unref === 'function') timeoutId.unref();
  controller.signal.addEventListener('abort', () => clearTimeout(timeoutId), { once: true });
  return controller.signal;
}

// ==================== Fallback Chain Logic ====================

/**
 * Web search with automatic fallback.
 * DuckDuckGo API is always the primary engine — UI config is ignored to prevent broken search.
 */
async function searchWithFallbackChain(
  query: string,
  _config: PluginConfig,
  hostSignal?: AbortSignal // 04.10 ABORT-CONTRACT: LM Studio ToolCallContext.signal (user cancel / host timeout)
): Promise<{ success: boolean; data?: { query: string; results: SearchResultItem[]; count: number; engine: string }; error?: string; aborted?: true }> {
  // FORENSICS (04.10): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
  if (hostSignal?.aborted) console.log(`[web_search] aborted-in 0ms (host signal already fired before search start)`);

  // DuckDuckGo API is always first — it's the only engine that doesn't block automated requests
  const chain = [...FALLBACK_ORDER];
  let anyEngineEmpty = false; // 08.09 fix: distinguishes "all engines blocked/empty" from hard failures in the final error message

  for (const engine of chain) {
    // 04.10 ABORT-CONTRACT: a host cancel is NOT an engine failure — stop the chain instead of cascading into the
    // remaining engines after the user already asked to stop.
    if (hostSignal?.aborted) return abortedEnvelope('Aborted by a host cancel — search stopped before completion. Re-run when convenient.');
    try {
      const searchFn = SEARCH_ENGINES[engine];
      if (!searchFn) {
        console.error(`Search engine "${engine}" not found, skipping`);
        continue;
      }

      const results = await searchFn(query, hostSignal); // 04.10 ABORT-CONTRACT: raw host signal — each engine merges/forwards per its transport (fetch vs needle)

      // 08.09 fix: HTTP-200-but-empty is the signature of a bot-blocked / JS-shell SERP page (observed
      // live on google.com from datacenter IPs: consent redirect + zero parseable result elements). The
      // old code returned success:true with count:0, which STOPPED the fallback chain at that dead engine
      // — later engines were never tried. Treat 0 as a soft failure and continue; <2 stays log-only (real
      // but genuinely sparse results are still worth returning).
      if (results.length === 0) {
        anyEngineEmpty = true;
        console.log(`Search engine "${engine}" returned 0 results (likely blocked/JS-shell page), trying next`);
        continue;
      }

      // Validate result count - warn if low results
      if (results.length < 2) {
        console.log(`Low search results for "${query}": ${results.length} results from ${engine}`);
      }

      return {
        success: true,
        data: { query, results, count: results.length, engine },
      };
    } catch (error) {
      // 04.10 ABORT-CONTRACT: a host cancel surfaces inside the engine's rejection — report it directly; never treat
      // it as "engine failed" and cascade into the next one.
      if (hostSignal?.aborted) return abortedEnvelope('Aborted by a host cancel mid-search — request was cancelled before completion. Re-run when convenient.');
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Search engine "${engine}" failed: ${message}`);
      // Try next engine in the chain
      continue;
    }
  }

  // 08.09 fix: when every engine returned an (empty) response rather than throwing, say so —
  // "all failed" was misleading for the blocked/JS-shell case that motivated this change.
  return {
    success: false,
    error: anyEngineEmpty
      ? `No search results found — engines responded but returned no parseable results (possibly bot-blocked). Tried: ${chain.join(' → ')}`
      : `All search engines failed. Tried: ${chain.join(' → ')}`,
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
    implementation: async ({ query }: WebSearchParams, ctx?: ToolCallContextLike) => { // C5 FIX: typed params; 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      return await searchWithFallbackChain(query, config, ctx?.signal); // 04.10 ABORT-CONTRACT
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
    implementation: async ({ query, lang }: WikipediaSearchParams, ctx?: ToolCallContextLike) => { // C5 FIX: typed params; 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      // FORENSICS (04.10): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
      if (ctx?.signal?.aborted) console.log(`[wikipedia_search] aborted-in 0ms (host signal already fired before search start)`);
      try {
        // 04.10 ABORT-CONTRACT: host cancel already in effect → do not even issue the request.
        if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel — Wikipedia search was never started. Re-run when convenient.');

        const apiUrl = `https://${lang || 'en'}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        // 04.10 ABORT-CONTRACT: one merged controller (host + existing 30 s guard); null → byte-identical pre-change path (fetchWithRetry's own guard).
        const hostAbort = mergeHostSignal(ctx?.signal);
        const response = await fetchWithRetry(apiUrl, hostAbort ? { signal: hostAbort } : undefined);

        if (!response.ok) {
          throw new Error(`Wikipedia API error: ${response.status}`);
        }

        // OOM guard: bounded read DURING transfer + parse (was unbounded response.json() — last
        // full-buffering read left in the web-research path; MediaWiki JSON is small but a hostile/
        // oversized payload must not materialize fully before any check can run).
        const data = JSON.parse(await readBoundedText(response, 200_000)) as Record<string, unknown>;
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
        // 04.10 ABORT-CONTRACT: host cancel → aborted envelope, not generic search failure (timeout/network errors unchanged below).
        if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel — Wikipedia request was cancelled before completion. Re-run when convenient.');
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
    implementation: async ({ url }: FetchWebContentParams, ctx?: ToolCallContextLike) => { // C5 FIX: typed params; 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      // FORENSICS (04.10): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
      if (ctx?.signal?.aborted) console.log(`[fetch_web_content] aborted-in 0ms (host signal already fired before fetch start)`);
      try {
        // 04.10 ABORT-CONTRACT: host cancel already in effect → do not even issue the request.
        if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel — page fetch was never started. Re-run when convenient.');

        // 04.10 ABORT-CONTRACT: one merged controller (host + existing 30 s guard); null → byte-identical pre-change path (fetchWithRetry's own guard).
        const hostAbort = mergeHostSignal(ctx?.signal);
        const response = await fetchWithRetry(url, hostAbort ? { signal: hostAbort } : undefined);

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
        // 04.10 ABORT-CONTRACT: host cancel → aborted envelope, not generic fetch failure (timeout/OOM-guard errors unchanged below).
        if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel — page fetch was cancelled before completion. Re-run when convenient.');
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
