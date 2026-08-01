/**
 * Aggregator for all Execution tools.
 * Consolidates multiple execution tool registrations into a single function 
 * to reduce import count and special-case logic in the main provider file.
 */

import type { Tool } from '@lmstudio/sdk';
import type { PluginConfig } from '../config.js';

import { registerExecutionTools as _allExecTools } from './executionTools.js';

/**
 * Registers all execution tools, filtering by individual config toggles.
 */
export function registerExecutionTools(config: PluginConfig): Tool[] {
  const allExecTools = _allExecTools({} as PluginConfig); // Get unfiltered list
  
  const tools: Tool[] = [];

  // Helper to add tool if enabled or God Mode is on
  const addIfEnabled = (toolName: string, isEnabled: boolean) => {
    if (isEnabled || config.godMode) {
      const foundTool = allExecTools.find(t => t.name === toolName);
      if (foundTool) tools.push(foundTool);
    }
  };

  // run_javascript — gated by executionJavaScript (or GOD MODE)
  addIfEnabled('run_javascript', config.executionJavaScript);

  // run_python — gated by executionPython (or GOD MODE)
  addIfEnabled('run_python', config.executionPython);

  // run_in_terminal — gated by executionTerminal (or GOD MODE)
  addIfEnabled('run_in_terminal', config.executionTerminal);

  // execute_command — gated by executionShell (or GOD MODE)
  addIfEnabled('execute_command', config.executionShell);

  // run_tests — gated by executionTests (or GOD MODE)
  addIfEnabled('run_tests', config.executionTests);

  return tools;
}
