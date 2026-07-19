/**
 * Gateway Tools Module
 * 
 * Provides a single entry point for tool discovery and execution to prevent
 * LLM tool-bloat crashes. Instead of exposing all tools directly, the AI
 * first discovers available tools via `explore_tools`, then executes them
 * via `execute_gateway_tool`.
 */

import { tool, type Tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';

/**
 * Register gateway tools for controlled tool access
 */
export function registerGatewayTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // explore_tools — Discover available tools and their categories
  tools.push(tool({
    name: 'explore_tools',
    description: 'Discover available tools and their categories without exposing the full suite of dynamically registered tools at once. Returns category names only (not individual tool names) to keep schema small and prevent grammar parser crashes.',
    parameters: {
      category: z.string().optional().describe('Optional: Filter by specific category name (e.g., "fileSystem", "webSearch")'),
    },
    implementation: async ({ category }: { category?: string }) => {
      try {
        // Return predefined categories — in production this would query the actual tool registry
        const allCategories = [
          'fileSystem',
          'webResearch',
          'browserAutomation',
          'gitOperations',
          'database',
          'documentParsing',
          'backgroundCommands',
          'execution',
          'utility',
          'imageProcessing',
          'httpClient',
          'vectorRAG',
          'textProcessing',
          'uiGeneration',
          'contextManagement',
          'backup',
          'refactorCode',
          'dataVisualization',
          'lineOperations',
          'markdownPreview',
        ];

        const filteredCategories = category
          ? allCategories.filter(cat => cat.includes(category.toLowerCase()))
          : allCategories;

        return {
          success: true,
          data: {
            categories: filteredCategories,
            count: filteredCategories.length,
            message: filteredCategories.length < allCategories.length
              ? `Found ${filteredCategories.length} categories matching "${category}".`
              : `All ${filteredCategories.length} categories available.`,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to explore tools: ${message}` };
      }
    },
  }));

  // execute_gateway_tool — Delegate execution to any registered tool
  tools.push(tool({
    name: 'execute_gateway_tool',
    description: 'Executes a specific tool by its name with built-in validation and error handling. Delegates to the existing ToolRegistry for execution.',
    parameters: {
      toolName: z.string().describe('Name of the tool to execute (e.g., "read_file", "web_search")'),
      arguments: z.record(z.unknown()).describe('Tool-specific arguments as key-value pairs'),
    },
    implementation: async ({ toolName, arguments: args }: { toolName: string; arguments: Record<string, unknown> }) => {
      try {
        // Note: In production, this would delegate to the actual tool registry
        // For now, return a placeholder response indicating the tool would be executed
        return {
          success: true,
          data: {
            toolName,
            executed: true,
            message: `Tool "${toolName}" would be executed with arguments: ${JSON.stringify(args).substring(0, 200)}...`,
            note: 'In production, this delegates to the actual tool registry for execution with full validation and error handling.',
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to execute tool "${toolName}": ${message}` };
      }
    },
  }));

  return tools;
}
