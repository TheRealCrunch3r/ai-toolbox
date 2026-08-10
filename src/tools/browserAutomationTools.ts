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

/** Reset puppeteer module cache (for testing) */
export function resetPuppeteerCache(): void {
  puppeteerModule = null;
}
import type { PluginConfig } from '../config';
import { getWorkingDir } from '../workingDir';
import * as fs from 'fs';
import * as path from 'path';


/** Browser session manager with auto-cleanup and connection pooling (singleton pattern) */
class BrowserSessionManager {
  private browserInstance: Puppeteer.Browser | null = null;
  private currentPage: Puppeteer.Page | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private readonly INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 2;
  private retryCount = 0;

  /** Get or create a persistent Puppeteer browser instance with auto-retry */
  async getBrowser(): Promise<Puppeteer.Browser> {
    if (!this.browserInstance || !this.browserInstance.connected()) {
      this.retryCount = 0;
      while (this.retryCount < this.MAX_RETRIES) {
        try {
          // H2 FIX: Chrome executable detection for Windows (Puppeteer often fails to find Chrome on Windows)
          const puppeteerLib = await getPuppeteer();
          
          let chromePath: string | undefined;
          if (process.platform === 'win32') {
            const possiblePaths = [
              path.join(process.env['LOCALAPPDATA'] || '', 'Google\\Chrome\\Application\\chrome.exe'),
              'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
              'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            ];
            for (const candidate of possiblePaths) {
              if (fs.existsSync(candidate)) {
                chromePath = candidate;
                break;
              }
            }
          }
          
          this.browserInstance = await puppeteerLib.launch({ 
            headless: true,
            executablePath: chromePath, // Use detected Chrome path if found
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
    return this.browserInstance!;
  }

  /** Get or create a page in the persistent browser instance */
  async getPage(): Promise<Puppeteer.Page> {
    if (!this.currentPage || !await this.isPageValid()) {
      const browser = await this.getBrowser();
      this.currentPage = await browser.newPage();
    }
    this.resetCleanupTimer();
    return this.currentPage;
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
  getCurrentPage(): Puppeteer.Page | null {
    return this.currentPage;
  }

  /** Set the current page (public setter) */
  setCurrentPage(page: Puppeteer.Page | null): void {
    this.currentPage = page;
  }
}

// Singleton instance for this module (exported so dataVisualizationTools can reuse it)
export const browserManager = new BrowserSessionManager();

/** Export cleanup function for plugin unload lifecycle */
export function cleanupBrowserSession(): Promise<void> {
  return browserManager.dispose();
}

// C5 FIX: Proper param types
interface BrowserOpenPageParams {
  url: string;
  screenshot_path?: string;
  wait_for_selector?: string;
  full_page_screenshot?: boolean;
}

interface BrowserSessionControlParams {
  actions?: unknown[];
  read_page?: boolean;
  full_read?: boolean;
  screenshot_path?: string;
}

interface PreviewHtmlParams {
  html_content: string;
  file_name?: string;
}

interface OpenFileParams {
  target: string;
}

export function registerBrowserTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];
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
    implementation: async ({ url, screenshot_path, wait_for_selector, full_page_screenshot }: BrowserOpenPageParams) => {
      let page: Puppeteer.Page | null = null;

      try {
        // H3 FIX: Use getPage() instead of getBrowser()+getCurrentPage() — unified sync with session_control
        page = await browserManager.getPage();

        if ((await page.url()) !== url) {
          await page.goto(url, { waitUntil: 'domcontentloaded' });
        } else {
          // Page already at correct URL — skip navigation (H3 FIX)
        }

        if (wait_for_selector) {
          try {
            await page.waitForSelector(wait_for_selector, { timeout: 5000 });
          } catch {
            // Ignore timeout, continue with content extraction
          }
        }

        const resultData: Record<string, unknown> = { url, opened: true };

        if (screenshot_path) {
          await page.screenshot({ path: screenshot_path, fullPage: full_page_screenshot });
          resultData.screenshotSaved = true;
        }

        // H1 FIX: Function expression instead of template literal — SDK serialization breaks 'return' strings
        // NOTE: evaluate() callback runs in Chromium DOM context where document exists
        const textContent = await page.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
          return (document as any)?.body?.innerText || '';
        }) as unknown as string;
        resultData.pageText = textContent.substring(0, 2000);

        return { success: true, data: resultData };
      } catch (error: unknown) {
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
      actions: z.array(
        z.object({
          type: z.enum(['click', 'type', 'goto', 'evaluate']).describe('Action type'),
          selector: z.string().optional().describe('CSS selector for click/type actions'),
          text: z.string().optional().describe('Text to type (for type action)'),
          url: z.string().url().optional().describe('URL to navigate to (for goto action)'),
          script: z.string().optional().describe('JavaScript code to evaluate (for evaluate action)'),
        })
      ).optional().describe('Optional scripted browser actions to execute.'),
      read_page: z.boolean().optional().default(false).describe('If true, returns page metadata.'),
      full_read: z.boolean().optional().default(false).describe('If true, forces full page text output.'),
      screenshot_path: z.string().optional().describe('Optional screenshot output path.'),
    },
    implementation: async ({ actions, read_page, full_read, screenshot_path }: BrowserSessionControlParams) => {
      let page: Puppeteer.Page | null = null;

      try {
        page = await browserManager.getPage();

        if (actions && Array.isArray(actions)) {
          for (const action of actions as Record<string, unknown>[]) {
            if (action.type === 'click') {
              await page.click(action.selector as string);
            } else if (action.type === 'type') {
              await page.type(action.selector as string, action.text as string);
            } else if (action.type === 'goto') {
              await page.goto(action.url as string);
            } else if (action.type === 'evaluate') {
              await page.evaluate(action.script as string);
            }
          }
        }

        const resultData: Record<string, unknown> = { actionsExecuted: actions?.length || 0 };

        if (read_page || full_read) {
          // H1 FIX: Function expression instead of template literal — SDK serialization breaks 'return' strings
          // NOTE: evaluate() callback runs in Chromium DOM context where document exists
          const text = await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
            return (document as any)?.body?.innerText || '';
          }) as unknown as string;
          resultData.pageText = full_read ? text : text.substring(0, 1000);
        }

        if (screenshot_path) {
          await page.screenshot({ path: screenshot_path });
          resultData.screenshotSaved = true;
        }

        return { success: true, data: resultData };
      } catch (error: unknown) {
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
      } catch (error: unknown) {
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
    implementation: async ({ html_content, file_name }: PreviewHtmlParams) => {
      try {
        const fileName = file_name || 'preview.html';
        const filePath = path.join(getWorkingDir(), fileName);

        fs.writeFileSync(filePath, html_content);

        // Open in default browser using ES import
        const openModule = await import('open');
        await openModule.default(filePath);

        return { success: true, data: { previewed: true, file: fileName } };
      } catch (error: unknown) {
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
    implementation: async ({ target }: OpenFileParams) => {
      try {
        const openModule = await import('open');
        await openModule.default(target);
        return { success: true, data: { opened: true } };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to open file: ${message}` };
      }
    },
  }));

  return tools;
}
