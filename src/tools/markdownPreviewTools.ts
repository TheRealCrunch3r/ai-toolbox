import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import open from 'open';
import MarkdownIt from 'markdown-it';

/** Typed params interface */
interface MarkdownPreviewParams {
  file_path: string;
}

export function registerMarkdownPreviewTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  tools.push(tool({
    name: 'markdown_preview',
    description: 'Render a markdown file to HTML and open it in the default browser.',
    parameters: {
      file_path: z.string().describe('Path to the markdown file to render'),
    },
    implementation: async ({ file_path }: MarkdownPreviewParams) => {
      try {
        // Validate file exists
        const resolvedPath = path.resolve(file_path);
        if (!fs.existsSync(resolvedPath)) {
          return { success: false, error: `Markdown file not found: ${resolvedPath}` };
        }

        // Read markdown content
        const mdContent = fs.readFileSync(resolvedPath, 'utf-8');

        // Convert to HTML
        const md = new MarkdownIt({
          html: true,
          linkify: true,
          typographer: true,
          breaks: false,
        });
        const html = md.render(mdContent);

        // Create temp HTML file
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `markdown_preview_${Date.now()}.html`);
        fs.writeFileSync(tempFile, `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.6;color:#333;}code{background:#f4f4f4;padding:2px 6px;border-radius:3px;}.highlight{background:#f0f0f0;padding:10px;border-radius:5px;}</style></head><body>${html}</body></html>`);

        // Open in browser
        await open(tempFile);

        return { success: true, data: { rendered: true, outputPath: tempFile } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Markdown preview failed: ${message}` };
      }
    },
  }));

  return tools;
}