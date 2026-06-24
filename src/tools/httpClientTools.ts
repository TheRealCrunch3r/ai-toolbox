import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';

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

// ==================== Security & Validation ====================

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

// ==================== Tool Implementations ====================

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

    console.warn(`[AI Toolbox] HTTP ${method.toUpperCase()} ${url}`);

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
          headers: Object.fromEntries(response.headers.entries()),
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

    console.warn(`[AI Toolbox] HTTP GET ${url}`);

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

      const data = await response.json();

      return {
        success: true,
        data: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
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

    console.warn(`[AI Toolbox] HTTP POST ${url}`);

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
          headers: Object.fromEntries(response.headers.entries()),
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

// ==================== Tool Registration ====================

export function registerHttpClientTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

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

  return tools;
}
