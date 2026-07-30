/**
 * LM Studio REST API Integration Module
 * 
 * Fetches authoritative token counts from LM Studio's local server via the 
 * OpenAI-compatible /v1/chat/completions endpoint, bypassing SDK estimation bugs.
 * 
 * According to session memory (2026-07-26):
 * - OpenAI-Compatible (/v1/chat/completions) returns {usage: {prompt_tokens, completion_tokens, total_tokens}}
 * - Native v1 (/api/v1/chat) returns {stats: {...}}
 * 
 * This module implements the authoritative REST API approach for accurate token tracking.
 */

import type { PluginConfig } from './config.js';

// ==================== Type Definitions ====================

/** Response structure from LM Studio's /v1/chat/completions endpoint */
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string | null; reasoning_content?: string };
    finish_reason: string | null;
  }>;
  usage?: {
    // OpenAI-compatible field (standard)
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
    // LM Studio native field (may also appear on /v1/chat/completions)
    input_tokens?: number;          // "Number of input tokens. Includes formatting, tool definitions, and prior messages in the chat."
  };
}

/** Response structure from LM Studio's native /api/v1/chat endpoint */
interface NativeChatResponse {
  model_instance_id: string;
  output: Array<{ type: string; content?: string; reasoning_content?: string }>;
  stats: {
    input_tokens: number;           // "Number of input tokens. Includes formatting, tool definitions, and prior messages in the chat."
    total_output_tokens: number;
    reasoning_output_tokens?: number;
    tokens_per_second?: number;
    time_to_first_token_seconds?: number;
  };
}

/** Token count data extracted from REST API response */
export interface ApiTokenData {
  /** Total tokens consumed (prompt + completion) */
  totalTokens: number;
  /** Tokens in the prompt (input) */
  promptTokens?: number;
  /** Tokens generated in the response */
  completionTokens?: number;
  /** Reasoning tokens (for models like o1/o3-mini that use chain-of-thought) */
  reasoningTokens?: number;
  /** Model ID that was used */
  modelId?: string;
  /** Timestamp when this count was recorded (epoch ms) */
  timestamp: number;
}

/** Accumulated session token data with history */
export interface SessionTokenData {
  /** Current total tokens for the session */
  currentTotalTokens: number;
  /** History of individual request token counts */
  requestHistory: ApiTokenData[];
  /** Last recorded timestamp */
  lastUpdated: number;
}

// ==================== Configuration & State ====================

/** Common ports where LM Studio's local API server may be running */
const COMMON_LM_STUDIO_PORTS = [1234, 8080, 3000, 5000, 8000];

/** Base URL for LM Studio's local API server */
let apiBaseUrl: string | null = null;
let apiAuthHeader: string | null = null; // Bearer token if configured
let isApiAvailable: boolean | null = null;
let lastTokenData: ApiTokenData | null = null;

/** Accumulated session state (persisted across predictions) */
const sessionState: SessionTokenData = {
  currentTotalTokens: 0,
  requestHistory: [],
  lastUpdated: Date.now(),
};

// ==================== API Connection Management ====================

/**
 * Attempts to connect to LM Studio's local API server.
 * Tries multiple common ports with short timeouts for fast failure.
 * 
 * Note: This runs asynchronously and doesn't block plugin initialization.
 * If connection fails, token counting gracefully falls back to SDK/estimation methods.
 */
export async function detectApiServer(): Promise<string | null> {
  if (apiBaseUrl) return apiBaseUrl; // Already connected

  const portsToTry = [...COMMON_LM_STUDIO_PORTS]; // Use expanded port list
  
  let lastError: string | null = null;
  
  for (const port of portsToTry) {
    try {
      const url = `http://localhost:${port}/v1/models`;
      const response = await fetch(url, { 
        method: 'GET',
        signal: AbortSignal.timeout(1000), // Very short timeout for fast failure
      });
      
      if (response.ok) {
        apiBaseUrl = `http://localhost:${port}`;
        console.log(`[LM Studio API] ✅ Connected to server at ${apiBaseUrl} (port ${port})`);
        isApiAvailable = true;
        return apiBaseUrl;
      }
    } catch (err) {
      // Connection failed on this port - try next one
      lastError = err instanceof Error ? err.message : 'Unknown error';
      continue;
    }
  }

  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
  // Only log if we've never tried before (avoid spamming on every token count call)
  const hasTriedBefore = (detectApiServer as any)._hasAttempted;
  if (!hasTriedBefore) {
    console.warn('[LM Studio API] ⚠️ Could not connect to LM Studio local server. Tried ports: ' + 
                  portsToTry.join(', ') + '. Last error: ' + lastError);
    console.log('[LM Studio API] ℹ️ Token counting will fall back to SDK/estimation methods.');
    (detectApiServer as any)._hasAttempted = true; // Mark as tried
  }
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
  
  isApiAvailable = false;
  return null;
}

/**
 * Sets the authentication header for API requests.
 * Call this with your LM Studio API key if required by your setup.
 */
export function setAuthHeader(token: string): void {
  apiAuthHeader = `Bearer ${token}`;
  console.log('[LM Studio API] 🔑 Authentication header configured.');
}

/**
 * Configures the module from plugin config (if URL/port is exposed in settings).
 */
export function configureFromConfig(_config: PluginConfig): void {
  // If you add apiBaseUrl or apiKey to your PluginConfig schema, read it here:
  // const customUrl = _config.customLmStudioApiUrl; // if added to config.ts
  // if (customUrl) apiBaseUrl = customUrl;
  
  // Placeholder for future API key configuration:
  // const apiKey = (_config as any).lmStudioApiKey || '';
  // if (apiKey) { setAuthHeader(apiKey); }
}

// ==================== Token Fetching Implementation ====================

/**
 * Builds the authentication headers for API requests.
 */
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'AI-Toolbox/1.0',
  };

  if (apiAuthHeader) {
    headers['Authorization'] = apiAuthHeader;
  }

  return headers;
}

/**
 * Fetches token usage from LM Studio's native /api/v1/chat endpoint.
 * 
 * This is the authoritative source for token counts, matching exactly what 
 * LM Studio's sidebar displays. The native endpoint tracks full context window
 * usage including prior messages, tool definitions, and formatting overhead.
 * 
 * @returns ApiTokenData on success, or null if REST API is unavailable (graceful fallback)
 */
export async function fetchTokenCount(
  messages: Array<{ role: string; content: string }>,
  modelId?: string,
  maxTokens?: number,
): Promise<ApiTokenData | null> {
  // Ensure we're connected to the API server (non-blocking)
  if (!apiBaseUrl) {
    try {
      await detectApiServer();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown';
      console.warn(`[LM Studio API] Connection attempt failed: ${errorMsg}. Falling back to estimation.`);
      return null; // Graceful fallback - don't throw
    }
  }

  if (!apiBaseUrl) {
    // Server not available after detection attempts
    return null; // Graceful fallback
  }

  const baseUrl = apiBaseUrl;

  // Try native /api/v1/chat endpoint first (stateful, tracks full context)
  try {
    const url = `${baseUrl}/api/v1/chat`;
    
    // Build input array from ALL messages (LM Studio native format per docs)
    // LM Studio expects `type: "text" | "image"` for the discriminator
    const inputArray = messages.map(m => ({ 
      type: 'text' as const, 
      content: typeof m.content === 'string' ? m.content : '' 
    }));

    const requestBody: Record<string, unknown> = {
      model: modelId || 'current-model',
      input: inputArray.length > 0 ? inputArray : [{ type: 'message', content: '' }],
      stream: false,
      temperature: 0.1, // Minimal output for counting
      max_output_tokens: 1,
    };

    // 🔥 DEBUG: Log the exact request body being sent (sanitized)
    const debugPayload = JSON.stringify({
      model: requestBody.model,
      messageCount: messages.length,
      totalContentLength: messages.reduce((sum, m) => sum + (typeof m.content === 'string' ? m.content.length : 0), 0),
      stream: false,
    });
    console.log(`[LM Studio API] Native token counting request payload: ${debugPayload}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    let responseData: unknown;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      responseData = await response.json();
    } finally {
      clearTimeout(timeoutId);
    }

    // Parse the native response to extract token usage
    const parsed = responseData as NativeChatResponse;
    
    if (!parsed.stats) {
      throw new Error('Native API response missing "stats" field - check LM Studio server logs');
    }

    const reasoningTokens = parsed.stats.reasoning_output_tokens ?? 0;

    // 🔥 Use input_tokens (includes formatting, tool definitions, and prior messages in chat)
    const tokenData: ApiTokenData = {
      totalTokens: parsed.stats.input_tokens + parsed.stats.total_output_tokens,
      promptTokens: parsed.stats.input_tokens,
      completionTokens: parsed.stats.total_output_tokens,
      reasoningTokens: reasoningTokens > 0 ? reasoningTokens : undefined,
      modelId: parsed.model_instance_id || modelId,
      timestamp: Date.now(),
    };

    // Update session state
    lastTokenData = tokenData;
    sessionState.currentTotalTokens += tokenData.totalTokens;
    sessionState.requestHistory.push(tokenData);
    sessionState.lastUpdated = Date.now();

    const completionLog = tokenData.completionTokens?.toLocaleString() ?? 'N/A';
    const reasoningLog = reasoningTokens > 0 ? `, reasoning: ${reasoningTokens.toLocaleString()}` : '';
    
    console.log(`[LM Studio API] Token count fetched (native): ${tokenData.totalTokens.toLocaleString()} tokens (input_tokens: ${(tokenData.promptTokens || 0).toLocaleString()}, completion: ${completionLog}${reasoningLog})`);
    
    return tokenData;

  } catch (error) {
    // 🔥 DEBUG: Capture full error details including HTTP status/body if available
    const nativeError = error instanceof Error ? error.message : String(error);
    
    // Try to extract response body if it's a fetch error
    let detailedMessage = nativeError;
    if (nativeError.includes('HTTP 4') || nativeError.includes('HTTP 5')) {
      // Extract status code and message from the error string
      const match = nativeError.match(/HTTP (\d+): (.+)/);
      if (match) {
        detailedMessage = `[HTTP ${match[1]}] ${match[2]}`;
      } else {
        detailedMessage = `Native API returned HTTP error: ${nativeError}`;
      }
    }
    
    console.error(`[LM Studio API] ❌ Native /api/v1/chat FAILED:`, detailedMessage);
    console.warn('[LM Studio API] Falling back to OpenAI-compatible endpoint.');
  }

  // Fallback: Try OpenAI-compatible /v1/chat/completions endpoint
  try {
    const url = `${baseUrl}/v1/chat/completions`;

    // Defensive normalization: ensure every message has a valid 'content' string.
    const normalizedMessages = messages.map(msg => ({
      role: msg.role || 'user',
      content: typeof msg.content === 'string' ? msg.content : '',
    }));

    const requestBody: Record<string, unknown> = {
      model: modelId || 'current-model',
      messages: normalizedMessages,
      temperature: 0.1,
      max_tokens: maxTokens || 1,
      stream: false,
    };

    const debugPayload = JSON.stringify({
      model: requestBody.model,
      messageCount: normalizedMessages.length,
      totalContentLength: normalizedMessages.reduce((sum, m) => sum + (typeof m.content === 'string' ? m.content.length : 0), 0),
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      stream: requestBody.stream,
    });
    console.log(`[LM Studio API] Fallback token counting request payload: ${debugPayload}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    let responseData: unknown;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      responseData = await response.json();
    } finally {
      clearTimeout(timeoutId);
    }

    // Parse the response to extract token usage
    const parsed = responseData as ChatCompletionResponse;
    
    if (!parsed.usage) {
      throw new Error('API response missing "usage" field - check LM Studio server logs');
    }

    const reasoningTokens = parsed.usage.completion_tokens_details?.reasoning_tokens ?? 0;

    // 🔥 PRIORITY: Use input_tokens if available, otherwise fall back to prompt_tokens
    const effectivePromptTokens = parsed.usage.input_tokens ?? parsed.usage.prompt_tokens;

    const tokenData: ApiTokenData = {
      totalTokens: parsed.usage.total_tokens,
      promptTokens: effectivePromptTokens,
      completionTokens: parsed.usage.completion_tokens,
      reasoningTokens: reasoningTokens > 0 ? reasoningTokens : undefined,
      modelId: parsed.model,
      timestamp: Date.now(),
    };

    // Update session state
    lastTokenData = tokenData;
    sessionState.currentTotalTokens += tokenData.totalTokens;
    sessionState.requestHistory.push(tokenData);
    sessionState.lastUpdated = Date.now();

    const completionLog = tokenData.completionTokens?.toLocaleString() ?? 'N/A';
    const reasoningLog = reasoningTokens > 0 ? `, reasoning: ${reasoningTokens.toLocaleString()}` : '';
    
    // Log which field was used for transparency
    const sourceField = parsed.usage.input_tokens != null ? 'input_tokens' : 'prompt_tokens';
    console.log(`[LM Studio API] Token count fetched (fallback): ${tokenData.totalTokens.toLocaleString()} tokens (${sourceField}: ${(effectivePromptTokens || 0).toLocaleString()}, completion: ${completionLog}${reasoningLog})`);
    
    return tokenData;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[LM Studio API] OpenAI-compatible fallback failed: ${message}. Falling back to estimation.`);
    
    // If connection failed, mark as unavailable until next retry
    isApiAvailable = false;
    apiBaseUrl = null;
    
    return null; // Graceful fallback instead of throwing
  }
}

/**
 * Gets the accumulated session token total (sum of all API requests).
 */
export function getSessionTotalTokens(): number {
  return sessionState.currentTotalTokens;
}

/**
 * Resets the accumulated session state (call on chat reset).
 */
export function resetSessionState(): void {
  sessionState.currentTotalTokens = 0;
  sessionState.requestHistory = [];
  sessionState.lastUpdated = Date.now();
  lastTokenData = null;
  console.log('[LM Studio API] Session state reset.');
}

/**
 * Gets the most recently fetched token data.
 */
export function getLastTokenData(): ApiTokenData | null {
  return lastTokenData;
}

/**
 * Checks if the REST API is available and connected.
 */
export function isApiAvailableFlag(): boolean {
  return !!isApiAvailable && !!apiBaseUrl;
}

/**
 * Returns a human-readable summary of token usage from REST API.
 */
export function getTokenSummary(): string | null {
  if (!lastTokenData) return null;

  const parts: string[] = [];
  
  if (lastTokenData.promptTokens != null) {
    parts.push(`Prompt: ${lastTokenData.promptTokens.toLocaleString()} tokens`);
  }
  if (lastTokenData.completionTokens != null) {
    parts.push(`Generated: ${lastTokenData.completionTokens.toLocaleString()} tokens`);
  }
  if (lastTokenData.reasoningTokens != null && lastTokenData.reasoningTokens > 0) {
    parts.push(`Reasoning: ${lastTokenData.reasoningTokens.toLocaleString()} tokens`);
  }
  parts.push(`Total: ${lastTokenData.totalTokens.toLocaleString()} tokens`);
  
  if (sessionState.currentTotalTokens > 0 && sessionState.requestHistory.length > 1) {
    parts.push(`Session total: ${sessionState.currentTotalTokens.toLocaleString()} tokens (${sessionState.requestHistory.length} requests)`);
  }

  return `[LM Studio REST API] ${parts.join(' | ')}`;
}
