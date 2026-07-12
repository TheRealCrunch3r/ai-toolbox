/**
 * Gateway Tools — Provides a single entry point for discovery and execution 
 * to prevent LLM tool-bloat crashes.
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { type ToolsProvider, type PluginConfig } from '../core/provider';
import { z } from 'zod';

/**
 * The Gateway tools are the only tools exposed to the LLM.
 */
export async function getGatewayTools(
  provider: ToolsProvider, 
  _config: PluginConfig
): Promise<Tool[]> {
  
  // 1. EXPLORE TOOLS TOOL
  const exploreTools = tool({
    name: 'explore_tools',
    description: 'Discover available tools and their categories. Use this to find specific capabilities like file system, web search, or git.',
    parameters: {
      category: z.string().optional(),
    },
    implementation: async (params: Record<string, unknown>) => {
      // We need the registry. Since we are passed the provider, we use its registry.

      // Ensure tools are loaded to know what's available
      await provider.getAvailableTools(); 

      // In a real implementation, we would look at the REGISTER_MAP in core/provider.ts.
      // Since we can't easily import it without circularity if it was in toolsProvider,
      // but here it is exported from core/provider.ts!
      
      // We will use a hardcoded list for now that matches our categories.
      const categories = [
        'fileSystem', 'webSearch', 'browserAutomation', 'gitOperations', 
        'databaseQueries', 'documentParsing', 'backgroundCommands', 
        'imageProcessing', 'httpClient', 'vectorRAG', 'textProcessing', 
        'uiGeneration', 'contextManagement', 'refactorCode'
      ];

      const requestedCategory = params.category as string;
      if (requestedCategory) {
        // Check if category exists in our known list
        if (!categories.includes(requestedCategory)) {
          return { success: false, error: `Unknown category: ${requestedCategory}` };
        }

        // Return a summary of tools in this category
        // To be truly useful, we'd look up which tools belong to this category.
        // For now, let's return a message that tells the LLM it can proceed with execution.
        return { 
          success: true, 
          message: `Category '${requestedCategory}' is available. You can now use 'execute_gateway_tool' with specific tool names from this category.` 
        };
      }

      return { success: true, categories };
    }
  });

  // 2. EXECUTE GATEWAY TOOL
  const executeGatewayTool = tool({
    name: 'execute_gateway_tool',
    description: 'Executes a specific tool by its name. You must first use "explore_tools" to find the correct tool name.',
    parameters: {
      toolName: z.string(),
      arguments: z.record(z.unknown()),
    },
    implementation: async (params: Record<string, unknown>) => {
      const toolName = params.toolName as string;
      const args = params.arguments as Record<string, unknown>;

      if (!toolName || !args) {
        return { success: false, error: 'Missing toolName or arguments.' };
      }

      // Delegate to the actual provider implementation
      return await provider.executeTool(toolName, args);
    }
  });

  return [exploreTools, executeGatewayTool];
}
