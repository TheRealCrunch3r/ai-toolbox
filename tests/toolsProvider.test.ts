/**
 * Tests for ToolsProvider (tool execution and filtering)
 */

import { ToolsProvider, createToolsProvider } from '../src/toolsProvider';
import { DEFAULT_CONFIG } from '../src/config';

describe('ToolsProvider', () => {
  let provider: ToolsProvider;

  beforeEach(() => {
    provider = new ToolsProvider();
  });

  test('should return available tools filtered by config', async () => {
    const tools = provider.getAvailableTools();
    expect(tools.length).toBeGreaterThan(0);
    
    // Should include file system tools (enabled by default)
    const fsToolNames = tools.filter(t => t.name.startsWith('list_directory') || 
                                          t.name.startsWith('read_file') ||
                                          t.name.startsWith('save_file')).map(t => t.name);
    expect(fsToolNames.length).toBeGreaterThan(0);
  });

  test('should execute tool by name', async () => {
    const result = await provider.executeTool('list_directory', {});
    expect(result).toBeDefined();
  });

  test('should return error for unknown tool', async () => {
    const result = await provider.executeTool('nonexistent_tool', {});
    expect((result as any).success).toBe(false);
    expect((result as any).error).toContain('not found');
  });

  test('should update state after tool execution', async () => {
    await provider.executeTool('list_directory', {});
    
    const lastExecution = provider['stateManager'].get<string>('last_list_directory');
    expect(lastExecution).toBeDefined();
  });

  test('should respect config tool gating', async () => {
    const disabledProvider = new ToolsProvider({
      ...DEFAULT_CONFIG,
      fileSystem: false,
      webSearch: false,
    });
    
    const tools = disabledProvider.getAvailableTools();
    // Utility tools are always registered, so we check that major categories are disabled
    const hasFsTools = tools.some(t => t.name.startsWith('list_directory') || 
                                       t.name.startsWith('read_file'));
    expect(hasFsTools).toBe(false);
  });

  test('should create provider with factory function', () => {
    const provider2 = createToolsProvider();
    expect(provider2).toBeDefined();
  });
});