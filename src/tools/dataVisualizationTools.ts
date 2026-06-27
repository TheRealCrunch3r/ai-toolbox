/**
 * Data Visualization Tools — Generate charts from data using Puppeteer + Chart.js
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import type { PluginConfig } from '../config';
import { getWorkingDir, resolvePath } from '../workingDir';
import { validatePath } from '../security';

// ==================== Typed Params ====================

type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'doughnut' | 'radar' | 'polarArea';

interface GenerateChartParams {
  type: ChartType;
  data: Array<{ label: string; value: number }>;
  title?: string;
  output_path?: string;
  colors?: string[];
}

// ==================== Helper Functions ====================

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

/** Get chart type label from short name */
const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bar: 'Bar Chart',
  line: 'Line Chart',
  pie: 'Pie Chart',
  scatter: 'Scatter Plot',
  doughnut: 'Doughnut Chart',
  radar: 'Radar Chart',
  polarArea: 'Polar Area Chart',
};

/** Default color palette for charts */
const DEFAULT_COLORS = [
  '#4285F4', // Google Blue
  '#EA4335', // Google Red
  '#FBBC05', // Google Yellow
  '#34A853', // Google Green
  '#9C27B0', // Purple
  '#FF5722', // Deep Orange
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#8BC34A', // Light Green
];

/** Build Chart.js HTML page */
function buildChartHtml(params: GenerateChartParams): string {
  const chartType = params.type;
  const title = params.title || CHART_TYPE_LABELS[chartType] || 'Chart';
  const labels = params.data.map(d => d.label);
  const values = params.data.map(d => d.value);
  const colors = (params.colors && params.colors.length > 0) ? params.colors : DEFAULT_COLORS;

  // Generate color arrays (border and background with opacity for bar/line)
  const borderColors = JSON.stringify(colors.slice(0, labels.length));
  const bgColors = chartType === 'bar' || chartType === 'radar' || chartType === 'polarArea'
    ? JSON.stringify(colors.slice(0, labels.length).map(c => c + '80')) // 50% opacity
    : borderColors;

  let chartConfig: string;

  switch (chartType) {
    case 'bar':
      chartConfig = `
        type: 'bar',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: '${title.replace(/'/g, "\\'")}',
            data: ${JSON.stringify(values)},
            backgroundColor: ${bgColors},
            borderColor: ${borderColors},
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: '${title.replace(/'/g, "\\'")}', font: { size: 20 } } },
          scales: { y: { beginAtZero: true } },
        },`;
      break;

    case 'line':
      chartConfig = `
        type: 'line',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: '${title.replace(/'/g, "\\'")}',
            data: ${JSON.stringify(values)},
            borderColor: ${borderColors},
            backgroundColor: ${bgColors},
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: '${title.replace(/'/g, "\\'")}', font: { size: 20 } } },
          scales: { y: { beginAtZero: true } },
        },`;
      break;

    case 'pie':
      chartConfig = `
        type: 'pie',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            data: ${JSON.stringify(values)},
            backgroundColor: ${borderColors},
            borderWidth: 2,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: '${title.replace(/'/g, "\\'")}', font: { size: 20 } } },
        },`;
      break;

    case 'doughnut':
      chartConfig = `
        type: 'doughnut',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            data: ${JSON.stringify(values)},
            backgroundColor: ${borderColors},
            borderWidth: 2,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: '${title.replace(/'/g, "\\'")}', font: { size: 20 } } },
        },`;
      break;

    case 'scatter':
      chartConfig = `
        type: 'scatter',
        data: {
          datasets: [{
            label: '${title.replace(/'/g, "\\'")}',
            data: ${JSON.stringify(params.data.map(d => ({ x: d.value, y: Math.random() * 100 })))},
            backgroundColor: ${borderColors},
            borderColor: ${borderColors},
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: '${title.replace(/'/g, "\\'")}', font: { size: 20 } } },
          scales: { x: { type: 'linear', position: 'bottom' }, y: { beginAtZero: true } },
        },`;
      break;

    case 'radar':
      chartConfig = `
        type: 'radar',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: '${title.replace(/'/g, "\\'")}',
            data: ${JSON.stringify(values)},
            backgroundColor: ${bgColors},
            borderColor: ${borderColors},
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: '${title.replace(/'/g, "\\'")}', font: { size: 20 } } },
        },`;
      break;

    case 'polarArea':
      chartConfig = `
        type: 'polarArea',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            data: ${JSON.stringify(values)},
            backgroundColor: ${bgColors},
            borderColor: '#fff',
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: '${title.replace(/'/g, "\\'")}', font: { size: 20 } } },
        },`;
      break;

    default: {
      const _exhaustiveCheck: never = chartType;
      throw new Error(`Unsupported chart type: ${String(_exhaustiveCheck)}`);
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/'/g, "\\'")}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <style>
    body {
      margin: 0; padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8f9fa;
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh;
    }
    .chart-container {
      width: 800px; height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 30px;
    }
  </style>
</head>
<body>
  <div class="chart-container">
    <canvas id="myChart"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, { ${chartConfig} });
  </script>
</body>
</html>`;
}

/** Minimal Puppeteer page interface for type-safe access */
interface PuppeteerPage {
  setViewport(viewport: { width: number; height: number }): Promise<void>;
  goto(url: string, options?: { waitUntil?: string; timeout?: number }): Promise<unknown>;
  evaluateHandle<T = unknown>(pageFunction: string | ((...args: unknown[]) => T | Promise<T>)): Promise<unknown>;
  screenshot(options: { path: string; type?: 'png' | 'jpeg' }): Promise<Buffer>;
}

/** Utility to delay execution for a given number of milliseconds */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Render chart using Puppeteer and save screenshot */
async function renderChart(htmlContent: string, outputPath: string): Promise<boolean> {
  try {
    const puppeteerModule = await import('puppeteer');
    const puppeteer = puppeteerModule.default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage() as unknown as PuppeteerPage;
 
    await page.setViewport({ width: 1050, height: 800 });

    // Write HTML to temp file and serve it via file:// URL for Chart.js CDN compatibility
    const tmpHtmlPath = path.join(os.tmpdir(), `chart_${Date.now()}.html`);
    fs.writeFileSync(tmpHtmlPath, htmlContent, 'utf-8');

    const fileUrl = new URL(`file://${tmpHtmlPath}`).href;
   
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });

    // Wait for chart to render (Chart.js needs a moment) — use evaluateHandle with DOM check
   
    await page.evaluateHandle(`() => {
      const canvas = document.getElementById('myChart');
      if (canvas && canvas.getContext) return true;
      setTimeout(() => {}, 2000);
      return false;
    }`);

    // Small delay for chart animation to complete using proper Promise wrapper
    await delay(1500);

    const screenshotOptions = { type: 'png' as const };
  
    await page.screenshot({ path: outputPath, ...screenshotOptions });
    // Clean up temp file
    try { fs.unlinkSync(tmpHtmlPath); } catch { /* ignore */ }

    return true;
  } catch (error) {
    console.error('[generate_chart] Puppeteer render failed:', error);
    return false;
  }
}

/** Fallback: Generate chart as HTML file that can be opened in browser */
function saveChartHtml(htmlContent: string, outputPath: string): boolean {
  try {
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

// ==================== Tool Registration ====================

export function registerDataVisualizationTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // generate_chart tool — Create visual charts from data
  tools.push(tool({
    name: 'generate_chart',
    description: `Generate a visual chart from data and save it as an image file. Supports multiple chart types using Chart.js rendered via Puppeteer.\n\nSupported chart types: bar, line, pie, doughnut, scatter, radar, polarArea.\nThe output is saved as a PNG screenshot of the rendered chart. If Puppeteer fails (e.g., missing browser), falls back to saving an HTML file that can be opened in any browser.`,
    parameters: {
      type: z.enum(['bar', 'line', 'pie', 'doughnut', 'scatter', 'radar', 'polarArea'])
        .describe('Chart type: bar, line, pie, doughnut, scatter, radar, or polarArea'),
      data: z.array(z.object({
        label: z.string().describe('Label for this data point (x-axis category)'),
        value: z.number().describe('Numeric value for this data point'),
      })).min(1).max(50)
        .describe('Array of {label, value} objects. Max 50 data points.'),
      title: z.string().optional()
        .describe('Chart title (default: auto-generated from chart type)'),
      output_path: z.string().optional()
        .describe('Output file path for the PNG image (default: chart_<timestamp>.png in working directory). If Puppeteer fails, an HTML fallback is saved with .html extension.'),
      colors: z.array(z.string()).max(50).optional()
        .describe('Custom color array (hex strings) to override default palette. One color per data point.'),
    },
    implementation: async ({ type, data, title, output_path }) => {
      const workingDir = getWorkingDir();

      // Validate chart type
      if (!CHART_TYPE_LABELS[type]) {
        return handleError(new Error(`Unsupported chart type: ${type}`));
      }

      // Validate data
      if (data.length === 0) {
        return { success: false, error: 'Data array must contain at least one point' };
      }

      const totalValue = data.reduce((sum, d) => sum + d.value, 0);
      const maxValue = Math.max(...data.map(d => d.value));
      const minValue = Math.min(...data.map(d => d.value));

      // Determine output path
      let outputPath: string;
      if (output_path) {
        if (!validatePath(output_path, workingDir)) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        outputPath = resolvePath(output_path);
      } else {
        const timestamp = Date.now();
        const safeTitle = (title || type).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        outputPath = path.join(workingDir, `chart_${safeTitle}_${timestamp}.png`);
      }

      // Build chart HTML with type assertion for data array (SDK types differ from our interface)
      const buildParams: GenerateChartParams = {
        type,
        data: data,
        title,
        output_path: outputPath,
      };
      const htmlContent = buildChartHtml(buildParams);

      // Try to render with Puppeteer first (produces PNG)
      let rendered = false;
      try {
        rendered = await renderChart(htmlContent, outputPath);
      } catch {
        rendered = false;
      }

      if (rendered && fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        return {
          success: true,
          data: {
            chart_type: type,
            title: title || CHART_TYPE_LABELS[type],
            output_file: outputPath,
            file_size_bytes: stats.size,
            data_points: data.length,
            summary: {
              total_value: totalValue,
              max_value: maxValue,
              min_value: minValue,
              avg_value: Math.round((totalValue / data.length) * 100) / 100,
            },
            method: 'puppeteer',
          },
        };
      }

      // Fallback: save as HTML file that can be opened in browser
      const htmlPath = outputPath.replace(/\.png$/, '.html');
      if (saveChartHtml(htmlContent, htmlPath)) {
        return {
          success: true,
          data: {
            chart_type: type,
            title: title || CHART_TYPE_LABELS[type],
            output_file: htmlPath,
            data_points: data.length,
            summary: {
              total_value: totalValue,
              max_value: maxValue,
              min_value: minValue,
              avg_value: Math.round((totalValue / data.length) * 100) / 100,
            },
            method: 'html_fallback',
            note: 'Puppeteer rendering failed. Chart saved as HTML file — open it in your browser to view.',
          },
        };
      }

      return { success: false, error: 'Failed to generate chart — both Puppeteer and HTML fallback failed.' };
    },
  }));

  return tools;
}
