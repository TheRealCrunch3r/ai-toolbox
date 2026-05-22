/**
 * Puppeteer action engine for browser automation
 */

import type { PluginConfig} from './config';
import { DEFAULT_CONFIG } from './config';
// H1 FIX: Import Puppeteer types instead of using any
import type * as Puppeteer from 'puppeteer';

export type BrowserActionType = 
  | 'wait_for_selector'
  | 'wait'
  | 'click'
  | 'type'
  | 'press'
  | 'select'
  | 'hover'
  | 'scroll'
  | 'evaluate';

export interface BrowserAction {
  type: BrowserActionType;
  selector?: string; // For selector-based actions
  text?: string;     // For type action
  value?: string;    // For select action
  key?: string;      // For press action (e.g., Enter, Tab)
  milliseconds?: number; // For wait action (0-30000)
  x?: number;        // Horizontal scroll delta
  y?: number;        // Vertical scroll delta
  script?: string;   // JavaScript snippet for evaluate action
}

/** Result type for browser actions */
interface BrowserActionResult {
  type: BrowserActionType;
  success: boolean;
  error?: string;
  result?: unknown;
}

/** Extended Page interface with additional properties needed for browser automation */
interface ExtendedPage extends Puppeteer.Page {
  keyboard: { press(key: string): Promise<void> };
  mouse: { move(x: number, y: number): Promise<void> };
  $eval(selector: string, evaluate: (el: unknown, arg: unknown) => void | Promise<void>, arg?: unknown): Promise<void>;
  $(selector: string): Promise<unknown>;
}

/** Helper to safely access extended page properties */
function getExtendedPage(page: Puppeteer.Page): ExtendedPage {
  return page as ExtendedPage;
}

/**
 * Validate browser action parameters based on config
 */
export function validateAction(action: BrowserAction, config?: PluginConfig): boolean {
  const effectiveConfig = config || DEFAULT_CONFIG;
  
  // Check timeout limits
  if (action.type === 'wait' && action.milliseconds) {
    if (action.milliseconds < 0 || action.milliseconds > 30000) return false;
    if (action.milliseconds > effectiveConfig.browserTimeout) return false;
  }
  
  // Check script length for evaluate actions
  if (action.type === 'evaluate' && action.script) {
    if (action.script.length > 10000) return false;
  }
  
  // Ensure selector-based actions have selectors
  const selectorActions: BrowserActionType[] = ['wait_for_selector', 'click', 'type', 'select', 'hover'];
  if (selectorActions.includes(action.type) && !action.selector) {
    return false;
  }
  
  return true;
}

/**
 * Execute browser actions sequence (pseudo-implementation for SDK integration)
 */
export async function executeBrowserActions(
  page: Puppeteer.Page, // H1 FIX: Properly typed instead of any
  actions: BrowserAction[], 
  config?: PluginConfig
): Promise<{ success: boolean; results: BrowserActionResult[] }> { // H1 FIX: Properly typed results
  const results: BrowserActionResult[] = []; // H1 FIX: Properly typed
  
  for (const action of actions) {
    if (!validateAction(action, config)) {
      results.push({ type: action.type, success: false, error: 'Invalid action parameters' });
      continue;
    }
    
    try {
      switch (action.type) {
        case 'wait_for_selector': {
          // H3 FIX: Use optional chaining + default timeout instead of ! assertion
          await page.waitForSelector(action.selector ?? '', { timeout: action.milliseconds || 5000 });
          results.push({ type: action.type, success: true });
          break;
        }
          
        case 'wait':
          await new Promise(resolve => setTimeout(resolve, action.milliseconds || 1000));
          results.push({ type: action.type, success: true });
          break;
          
        case 'click': {
          // H3 FIX: Use null check instead of ! assertion
          if (!action.selector) throw new Error('Selector is required for click');
          await page.click(action.selector);
          results.push({ type: action.type, success: true });
          break;
        }
          
        case 'type': {
          // H3 FIX: Use null check instead of ! assertion
          if (!action.selector) throw new Error('Selector is required for type');
          await page.type(action.selector, action.text ?? '');
          results.push({ type: action.type, success: true });
          break;
        }
          
        case 'press': {
          // H3 FIX: Use null check instead of ! assertion
          if (!action.key) throw new Error('Key is required for press');
          const extendedPage = getExtendedPage(page);
          if (extendedPage.keyboard && typeof extendedPage.keyboard.press === 'function') {
            await extendedPage.keyboard.press(action.key);
          }
          results.push({ type: action.type, success: true });
          break;
        }
          
        case 'select': {
          // H3 FIX: Use null check instead of ! assertion
          if (!action.selector) throw new Error('Selector is required for select');
          const extendedPage = getExtendedPage(page);
          await extendedPage.$eval(action.selector, (el: unknown, arg: unknown) => {
            const value = arg as string;
            if (el && typeof el === 'object' && 'tagName' in el && 'options' in el) {
              const element = el as Record<string, unknown>;
              if ((element.tagName as string).toLowerCase() === 'select') {
                element.value = value;
                (element.dispatchEvent as (e: Event) => void)(new Event('change', { bubbles: true }));
              }
            }
          }, action.value ?? '');
          results.push({ type: action.type, success: true });
          break;
        }
          
        case 'hover': {
          // H3 FIX: Use null check instead of ! assertion
          if (!action.selector) throw new Error('Selector is required for hover');
          const extendedPage = getExtendedPage(page);
          const element = await extendedPage.$(action.selector);
          if (element && typeof element === 'object' && 'boundingBox' in element) {
            const boxResult: { x: number; y: number; width: number; height: number } | null = 
              await ((element as Record<string, unknown>).boundingBox as () => Promise<{ x: number; y: number; width: number; height: number } | null>)();
            if (boxResult && extendedPage.mouse && typeof extendedPage.mouse.move === 'function') {
              await extendedPage.mouse.move(boxResult.x + boxResult.width / 2, boxResult.y + boxResult.height / 2);
            }
          }
          results.push({ type: action.type, success: true });
          break;
        }
          
        case 'scroll': {
          // H1 FIX: Properly typed scrollBy call (no globalThis as any)
          const x = action.x || 0;
          const y = action.y || 0;
          await page.evaluate((xVal: number, yVal: number) => {
            (globalThis as typeof globalThis & { scrollBy: (x: number, y: number) => void }).scrollBy(xVal, yVal);
          }, x, y);
          results.push({ type: action.type, success: true });
          break;
        }
          
        case 'evaluate': {
          // H3 FIX: Use null check instead of ! assertion
          if (!action.script) throw new Error('Script is required for evaluate');
          const result = await page.evaluate(action.script);
          results.push({ type: action.type, success: true, result });
          break;
        }
      }
    } catch (error) { // H1 FIX: Properly typed error handling
      const message = error instanceof Error ? error.message : String(error);
      results.push({ type: action.type, success: false, error: message });
    }
  }
  
  return { success: results.every(r => r.success), results };
}
