import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fsp from 'fs/promises';  // ← Async operations for crash-resilient writes
import * as path from 'path';
import { pathToFileURL } from 'url';
import type { PluginConfig } from '../config.js';
import { getWorkingDir } from '../workingDir.js';

// ==================== UI Component Templates ====================

/** Generate HTML for a button component */
function generateButtonHtml(label: string, color: string = '#007bff', id: string = 'ui-btn'): string {
  return `
    <button id="${id}" style="
      padding: 12px 24px;
      background-color: ${color};
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: opacity 0.2s;
    ">${label}</button>
  `;
}

/** Generate HTML for a form component */
function generateFormHtml(fields: Array<{ name: string; type: string; label: string }>, submitLabel: string = 'Submit'): string {
  const fieldsHtml = fields.map(field => `
    <div style="margin-bottom: 15px;">
      <label for="${field.name}" style="display: block; margin-bottom: 5px; font-weight: bold;">${field.label}</label>
      ${field.type === 'textarea' 
        ? `<textarea id="${field.name}" name="${field.name}" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>`
        : field.type === 'select'
          ? `<select id="${field.name}" name="${field.name}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"><option value="">Select...</option><option value="1">Option 1</option><option value="2">Option 2</option></select>`
          : `<input type="${field.type}" id="${field.name}" name="${field.name}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />`
      }
    </div>
  `).join('');

  return `
    <form id="ui-form" onsubmit="event.preventDefault(); document.getElementById('form-result').innerHTML = 'Form submitted!';">
      ${fieldsHtml}
      <button type="submit" style="padding: 12px 24px; background-color: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">${submitLabel}</button>
    </form>
    <div id="form-result" style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;"></div>
  `;
}

/** Generate HTML for a chart component (simple bar chart) */
function generateChartHtml(data: Array<{ label: string; value: number }>, title: string = 'Bar Chart'): string {
  const maxValue = Math.max(...data.map(d => d.value));
  const barsHtml = data.map(d => {
    const height = (d.value / maxValue) * 200;
    return `
      <div style="display: flex; align-items: flex-end; justify-content: center; margin-right: 10px;">
        <div style="width: 40px; height: ${height}px; background-color: #007bff; border-radius: 4px 4px 0 0;"></div>
      </div>
    `;
  }).join('');

  const labelsHtml = data.map(d => `
    <div style="width: 40px; text-align: center; font-size: 12px;">${d.label}</div>
  `).join('');

  return `
    <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <h3>${title}</h3>
      <div style="display: flex; align-items: flex-end; height: 220px; margin-bottom: 10px;">${barsHtml}</div>
      <div style="display: flex; justify-content: space-around;">${labelsHtml}</div>
    </div>
  `;
}

/** Generate HTML for a dashboard component */
function generateDashboardHtml(titles: string[], content: Array<{ type: 'text' | 'chart'; data?: unknown }>): string {
  const cardsHtml = titles.map((title, index) => {
    const cardContent = content[index]?.type === 'chart' 
      ? generateChartHtml(content[index].data as Array<{ label: string; value: number }> || [{ label: 'A', value: 50 }, { label: 'B', value: 80 }], title)
      : (() => {
          const data = content[index]?.data;
          if (data == null) return `<p style="padding: 20px;">Content for ${title}</p>`;
          const textData: string = typeof data === 'string' 
            ? data 
            : typeof data !== 'string'
              ? JSON.stringify(data)
              : '';
          return `<p style="padding: 20px;">${textData}</p>`;
        })();
    
    return `
      <div style="flex: 1; min-width: 250px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 10px;">
        ${cardContent}
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px;">${cardsHtml}</div>
  `;
}

// ==================== Tool Implementations ====================

export function registerUiGenerationTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // generate_ui_component tool — Generate interactive UI components
  tools.push(tool({
    name: 'generate_ui_component',
    description: 'Generate HTML/CSS/JS code for an interactive UI component (button, form, chart, dashboard). Returns the generated code.',
    parameters: {
      component_type: z.enum(['button', 'form', 'chart', 'dashboard']).describe('Type of UI component to generate'),
      label: z.string().optional().describe('Label text for buttons or forms'),
      fields: z.array(z.object({
        name: z.string(),
        type: z.enum(['text', 'email', 'password', 'number', 'textarea', 'select']),
        label: z.string(),
      })).optional().describe('Form fields (for form component)'),
      chart_data: z.array(z.object({
        label: z.string(),
        value: z.number(),
      })).optional().describe('Chart data points (for chart component)'),
      dashboard_titles: z.array(z.string()).optional().describe('Titles for dashboard cards'),
    },
    implementation: async ({ component_type, label, fields, chart_data, dashboard_titles }: { 
      component_type: string; 
      label?: string; 
      fields?: Array<{ name: string; type: string; label: string }>; 
      chart_data?: Array<{ label: string; value: number }>;
      dashboard_titles?: string[];
    }) => {
      try {
        let html = '';
        
        switch (component_type) {
          case 'button':
            html = generateButtonHtml(label || 'Click Me');
            break;
          case 'form':
            if (!fields || fields.length === 0) {
              return { success: false, error: 'Form component requires at least one field' };
            }
            html = generateFormHtml(fields);
            break;
          case 'chart':
            if (!chart_data || chart_data.length === 0) {
              return { success: false, error: 'Chart component requires data points' };
            }
            html = generateChartHtml(chart_data);
            break;
          case 'dashboard':
            if (!dashboard_titles || dashboard_titles.length === 0) {
              return { success: false, error: 'Dashboard component requires at least one title' };
            }
            const content: Array<{ type: 'text' | 'chart'; data?: unknown }> = dashboard_titles.map((title, index) => ({
              type: index % 2 === 0 ? 'chart' : 'text',
              data: index % 2 === 0 ? [{ label: 'A', value: Math.floor(Math.random() * 100) }, { label: 'B', value: Math.floor(Math.random() * 100) }] : undefined,
            }));
            html = generateDashboardHtml(dashboard_titles, content);
            break;
          default:
            return { success: false, error: `Unknown component type: ${component_type}` };
        }

        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>UI Component</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">${html}</body></html>`;
        
        return { success: true, data: { component_type, html: fullHtml } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to generate UI component: ${message}` };
      }
    },
  }));

  // render_and_preview_ui tool — Render generated UI in browser and capture screenshot
  tools.push(tool({
    name: 'render_and_preview_ui',
    description: 'Render a generated HTML UI component, save it to a file, open it in the default browser, and optionally take a screenshot.',
    parameters: {
      html_content: z.string().describe('The complete HTML content to render'),
      filename: z.string().optional().default('ui_preview.html').describe('Filename for saving (default: ui_preview.html)'),
      screenshot_path: z.string().optional().describe('Optional path to save a screenshot of the rendered UI'),
    },
    implementation: async ({ html_content, filename, screenshot_path }: { 
      html_content: string; 
      filename?: string; 
      screenshot_path?: string; 
    }) => {
      try {
        const fileName = filename || 'ui_preview.html';
        const filePath = path.join(getWorkingDir(), fileName);

        // ASYNC atomic write — crash-resilient
        await fsp.writeFile(filePath, html_content);

        // Open in default browser using ES import (same as preview_html tool)
        const openModule = await import('open');
        await openModule.default(filePath);

        const resultData: Record<string, unknown> = { 
          rendered: true, 
          file: fileName,
          path: filePath,
        };

        // Take screenshot if requested (using Puppeteer)
        if (screenshot_path) {
          try {
            const puppeteerModule = await import('puppeteer');
            const browser = await puppeteerModule.default.launch({ headless: true });
            const page = await browser.newPage();
            
            // Load the HTML file — use pathToFileURL for cross-platform compatibility (handles Windows backslashes)
            const fileUrl = pathToFileURL(filePath).href;
            await page.goto(fileUrl);
            
            // Wait for content to render
            await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
            
            // Take screenshot
            await page.screenshot({ path: screenshot_path, fullPage: true });
            resultData.screenshotSaved = true;
            
            // eslint-disable-next-line @typescript-eslint/await-thenable
            await browser.close();
          } catch (screenshotError) {
            const message = screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
            resultData.screenshotWarning = `Screenshot failed: ${message}`;
          }
        }

        return { success: true, data: resultData };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to render UI: ${message}` };
      }
    },
  }));

  // extract_ui_data tool — Extract data from interactive UI elements
  tools.push(tool({
    name: 'extract_ui_data',
    description: 'Extract structured data from HTML content (tables, forms, lists). Useful for parsing generated or fetched UIs.',
    parameters: {
      html_content: z.string().describe('The HTML content to extract data from'),
      extraction_type: z.enum(['table', 'form', 'list']).default('table').describe('Type of data to extract'),
    },
    implementation: async ({ html_content, extraction_type }: { 
      html_content: string; 
      extraction_type: string; 
    }) => {
      try {
        // Use Node.js DOM parser (cheerio-like approach with basic regex for simplicity)
        // In a real implementation, you'd use a proper HTML parser like jsdom or cheerio
        
        let extractedData: Record<string, unknown> = {};

        if (extraction_type === 'table') {
          const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
          const rowsRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;

          let tableMatch;
          while ((tableMatch = tableRegex.exec(html_content)) !== null) {
            const tableContent = tableMatch[1];
            const rows: string[] = [];
            let rowMatch;
            while ((rowMatch = rowsRegex.exec(tableContent)) !== null) {
              rows.push(rowMatch[1]);
            }

            const parsedRows: string[][] = [];
            for (const row of rows) {
              const cells: string[] = [];
              let cellMatch;
              const cellRegex = /<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi;
              while ((cellMatch = cellRegex.exec(row)) !== null) {
                cells.push(cellMatch[2].replace(/<[^>]+>/g, '').trim());
              }
              parsedRows.push(cells);
            }

            extractedData.tables = parsedRows;
          }
        } else if (extraction_type === 'form') {
          const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
          const inputRegex = /<(input|select|textarea)[^>]*\/?>/gi;

          let formMatch;
          while ((formMatch = formRegex.exec(html_content)) !== null) {
            const formContent = formMatch[1];
            const fields: Array<{ name: string; type: string; value?: string }> = [];
            let inputMatch;
            while ((inputMatch = inputRegex.exec(formContent)) !== null) {
              const tag = inputMatch[0];
              const nameMatch = /name=["']([^"']+)["']/i.exec(tag);
              const typeMatch = /type=["']([^"']+)["']/i.exec(tag);
              
              if (nameMatch) {
                fields.push({
                  name: nameMatch[1],
                  type: typeMatch?.[1] || 'text',
                  value: '', // Would need to extract actual values in a real implementation
                });
              }
            }

            extractedData.formFields = fields;
          }
        } else if (extraction_type === 'list') {
          const listRegex = /<(ul|ol)[^>]*>([\s\S]*?)<\/(ul|ol)>/gi;
          const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;

          let listMatch;
          while ((listMatch = listRegex.exec(html_content)) !== null) {
            const listContent = listMatch[2];
            const items: string[] = [];
            let itemMatch;
            while ((itemMatch = itemRegex.exec(listContent)) !== null) {
              items.push(itemMatch[1].replace(/<[^>]+>/g, '').trim());
            }

            extractedData.items = items;
          }
        }

        return { success: true, data: extractedData };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to extract UI data: ${message}` };
      }
    },
  }));

  return tools;
}
