import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
// C5 FIX: Proper typing instead of any
import type * as Puppeteer from 'puppeteer';

let puppeteerModule: typeof Puppeteer | null = null;

async function getPuppeteer(): Promise<typeof Puppeteer> {
  if (!puppeteerModule) {
    const imported = await import('puppeteer');
    puppeteerModule = imported.default || imported;
  }
  return puppeteerModule;
}

import type { PluginConfig } from './config';
import { getWorkingDir } from './workingDir';
import * as fs from 'fs';
import * as path from 'path';

/** Browser action interface for type safety */
interface BrowserAction {
  type: 'click' | 'type' | 'goto' | 'evaluate' | 'wait_for_selector' | 'press' | 'select' | 'hover' | 'scroll';
  selector?: string;
  text?: string;
  url?: string;
  script?: string;
  key?: string;
  value?: string;
  milliseconds?: number;
  x?: number;
  y?: number;
}

/** Browser session manager with auto-cleanup and connection pooling (singleton pattern) */
class BrowserSessionManager {
  private browserInstance: Puppeteer.Browser | null = null; // C5 FIX: typed
  private currentPage: Puppeteer.Page | null = null;       // C5 FIX: typed
  private cleanupTimer: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private readonly INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 2;
  private retryCount = 0;
  
  // M5 FIX: Simple lock to prevent race conditions in getPage()
  private pageLockPromise: Promise<void> | null = null;

  /** Get or create a persistent Puppeteer browser instance with auto-retry */
  async getBrowser(): Promise<Puppeteer.Browser> { // C5 FIX: typed return
    if (!this.browserInstance || !this.browserInstance.connected()) {
      this.retryCount = 0;
      while (this.retryCount < this.MAX_RETRIES) {
        try {
          const puppeteerLib = await getPuppeteer();
          this.browserInstance = await puppeteerLib.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Performance optimizations
          });
          break;
        } catch (error) {
          this.retryCount++;
          if (this.retryCount >= this.MAX_RETRIES) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount)); // Exponential backoff
        }
      }
    }
    this.resetCleanupTimer();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.browserInstance!; // Safe: we just created or verified it exists
  }

  /** M5 FIX: getPage() with lock to prevent race conditions */
  async getPage(): Promise<Puppeteer.Page> { // C5 FIX: typed return
    // Wait for any ongoing page creation to complete
    if (this.pageLockPromise) {
      await this.pageLockPromise;
    }

    // Create a new lock for this operation
    const acquirePage = async (): Promise<void> => {
      try {
        if (!this.currentPage || !await this.isPageValid()) {
          const browser = await this.getBrowser();
          this.currentPage = await browser.newPage();
        }
        this.resetCleanupTimer();
      } finally {
        this.pageLockPromise = null;
      }
    };

    this.pageLockPromise = acquirePage();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.pageLockPromise.then(() => this.currentPage!);
  }

  /** Check if current page is still valid */
  private async isPageValid(): Promise<boolean> {
    try {
      if (!this.currentPage) return false;
      await this.currentPage.evaluate('1'); // Quick validation
      return true;
    } catch {
      return false;
    }
  }

  /** Reset the inactivity cleanup timer */
  private resetCleanupTimer(): void {
    if (this.cleanupTimer) clearTimeout(this.cleanupTimer);
    this.lastActivity = Date.now();
    this.cleanupTimer = setTimeout(() => this.dispose(), this.INACTIVITY_TIMEOUT_MS);
  }

  /** Explicitly dispose browser and cancel cleanup timer */
  async dispose(): Promise<void> {
    if (this.cleanupTimer) clearTimeout(this.cleanupTimer);
    try {
      if (this.browserInstance && this.browserInstance.connected()) {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await this.browserInstance.close();
      }
    } catch {
      // Ignore close errors
    } finally {
      this.browserInstance = null;
      this.currentPage = null;
      this.lastActivity = Date.now();
      this.retryCount = 0;
    }
  }

  /** Check if browser is connected */
  isConnected(): boolean {
    return !!(this.browserInstance && this.browserInstance.connected());
  }

  /** Get the current page (public accessor) */
  getCurrentPage(): Puppeteer.Page | null { // C5 FIX: typed return
    return this.currentPage;
  }

  /** Set the current page (public setter) */
  setCurrentPage(page: Puppeteer.Page | null): void { // C5 FIX: typed param
    this.currentPage = page;
  }
}

// Singleton instance for this module
const browserManager = new BrowserSessionManager();

/** Export cleanup function for plugin unload lifecycle */
export function cleanupBrowserSession(): Promise<void> {
  return browserManager.dispose();
}

export function registerBrowserTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];
  
  // Helper type for browser tool params
  interface BrowserOpenPageParams {
    url: string;
    screenshot_path?: string;
    wait_for_selector?: string;
    full_page_screenshot?: boolean;
  }

  interface BrowserSessionControlParams {
    actions?: BrowserAction[];
    read_page?: boolean;
    full_read?: boolean;
    screenshot_path?: string;
  }

  // browser_open_page tool
  tools.push(tool({
    name: 'browser_open_page',
    description: 'Open a webpage in a headless browser (Puppeteer), render it once, and return content.',
    parameters: {
      url: z.string().url().describe('The URL to open'),
      screenshot_path: z.string().optional().describe('Path to save a screenshot.'),
      wait_for_selector: z.string().optional().describe('CSS selector to wait for before returning.'),
      full_page_screenshot: z.boolean().optional().default(false).describe('If true, captures the full page when taking a screenshot.'),
    },
    implementation: async ({ url, screenshot_path, wait_for_selector, full_page_screenshot }: BrowserOpenPageParams) => { // C5 FIX: typed params
      let browser: Puppeteer.Browser | null = null; // C5 FIX: typed
      let page: Puppeteer.Page | null = null;       // C5 FIX: typed

      try {
        browser = await browserManager.getBrowser();
        page = browserManager.getCurrentPage();
        
        if (!page || (await page.url()) !== url) {
          // If no current page or URL doesn't match, create a new one
          page = await browser.newPage();
          browserManager.setCurrentPage(page);
        }

        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        if (wait_for_selector) {
          try {
            await page.waitForSelector(wait_for_selector, { timeout: 5000 });
          } catch {
            // Ignore timeout, continue with content extraction
          }
        }

        const resultData: Record<string, unknown> = { url, opened: true }; // C5 FIX: typed
        
        if (screenshot_path) {
          await page.screenshot({ path: screenshot_path, fullPage: full_page_screenshot });
          resultData.screenshotSaved = true;
        }

        // Use string-based evaluate to bypass TS2584/TS2304 'document' errors in Node.js environment
        const textContent: string = await page.evaluate(`return document.body ? document.body.innerText : '';`);
        resultData.pageText = textContent.substring(0, 2000);

        return { success: true, data: resultData };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to open page: ${message}` };
      } finally {
        // NOTE: We don't close the browser here because we use a singleton pattern.
        // The browser stays alive for subsequent requests via browser_session_control.
        // Use browser_session_close to explicitly terminate it.
      }
    },
  }));

  // browser_session_control tool
  tools.push(tool({
    name: 'browser_session_control',
    description: 'Control the active persistent browser session. Supports actions, page reading, screenshot capture.',
    parameters: {
      actions: z.array(z.any()).optional().describe('Optional scripted browser actions to execute.'),
      read_page: z.boolean().optional().default(false).describe('If true, returns page metadata.'),
      full_read: z.boolean().optional().default(false).describe('If true, forces full page text output.'),
      screenshot_path: z.string().optional().describe('Optional screenshot output path.'),
    },
    implementation: async ({ actions, read_page, full_read, screenshot_path }: BrowserSessionControlParams) => { // C5 FIX: typed params
      let page: Puppeteer.Page | null = null; // C5 FIX: typed

      try {
        page = await browserManager.getPage();
        
        if (actions && Array.isArray(actions)) {
          for (const action of actions) {
            try { // M4 FIX: wrap each action in try/catch
              if (action.type === 'click' && action.selector) {
                await page.click(action.selector);
              } else if (action.type === 'type' && action.selector && action.text !== undefined) {
                await page.type(action.selector, action.text);
              } else if (action.type === 'goto' && action.url) {
                await page.goto(action.url);
              } else if (action.type === 'evaluate' && action.script) {
                await page.evaluate(action.script);
              }
            } catch (actionError) { // M4 FIX: handle individual action errors
              const msg = actionError instanceof Error ? actionError.message : String(actionError);
              console.error(`Browser action failed (${action.type}): ${msg}`);
            }
          }
        }

        const resultData: Record<string, unknown> = { actionsExecuted: actions?.length || 0 }; // C5 FIX: typed

        if (read_page || full_read) {
          // Use string-based evaluate to bypass TS2584 'document' errors in Node.js environment
          const text: string = await page.evaluate(`return document.body ? document.body.innerText : '';`);
          resultData.pageText = full_read ? text : text.substring(0, 1000);
        }

        if (screenshot_path) {
          await page.screenshot({ path: screenshot_path });
          resultData.screenshotSaved = true;
        }

        return { success: true, data: resultData };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Browser control failed: ${message}` };
      } finally {
        // Page stays alive for session reuse. Browser is managed by browser_session_close.
      }
    },
  }));

  // browser_session_close tool
  tools.push(tool({
    name: 'browser_session_close',
    description: 'Close the active persistent browser session.',
    parameters: {},
    implementation: async () => {
      try {
        await browserManager.dispose();
        return { success: true, data: { closed: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to close browser session: ${message}` };
      } finally {
        // Ensure cleanup even on failure
        await browserManager.dispose();
      }
    },
  }));

  // preview_html tool
  tools.push(tool({
    name: 'preview_html',
    description: "Render and preview HTML content in the system's default browser.",
    parameters: {
      html_content: z.string().describe('The HTML content to render'),
      file_name: z.string().optional().default('preview.html').describe('Optional filename (default: preview.html)'),
    },
    implementation: async ({ html_content, file_name }: { html_content: string; file_name?: string }) => { // C5 FIX: typed params
      try {
        const fileName = file_name || 'preview.html';
         
        const filePath = path.join(getWorkingDir(), fileName);
        
        fs.writeFileSync(filePath, html_content);
        
        // Open in default browser using ES import
        const openModule = await import('open');
        await openModule.default(filePath);

        return { success: true, data: { previewed: true, file: fileName } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to preview HTML: ${message}` };
      }
    },
  }));

  // open_file tool
  tools.push(tool({
    name: 'open_file',
    description: "Open a file or URL in the system's default application.",
    parameters: {
      target: z.string().describe('File path or URL'),
    },
    implementation: async ({ target }: { target: string }) => { // C5 FIX: typed params
      try {
        const openModule = await import('open');
        await openModule.default(target);
        return { success: true, data: { opened: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to open file: ${message}` };
      }
    },
  }));

  return tools;
}
