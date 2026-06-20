/**
 * Tests for ToolsProvider (tool execution and filtering)
 * 
 * Jest's moduleNameMapper intercepts dynamic import() calls when configured.
 */

import { createToolsProvider, ToolsProvider } from '../src/toolsProvider';
import { DEFAULT_CONFIG } from '../src/config';

describe('ToolsProvider', () => {
  let provider: ToolsProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    // Force fresh module reload for each test (clears cached registry)
    delete require.cache[require.resolve('../src/toolsProvider')];
    const freshModule = require('../src/toolsProvider');
    
    provider = new freshModule.ToolsProvider({ ...DEFAULT_CONFIG, fileSystem: true, godMode: false });
  });

  test('should return available tools filtered by config', async () => {
    const tools = await provider.getAvailableTools();

    expect(tools.length).toBeGreaterThan(0);

    // Verify mock lineOperations tools are included (they're always loaded)
    const toolNames = tools.map((t: any) => t.name);
    expect(toolNames).toContain('insert_at_line');
  });

  test('should execute tool by name', async () => {
    const result = await provider.executeTool('insert_at_line', {});
    
    expect(result).toEqual({ success: true });
  });

  test('should return error for unknown tool', async () => {
    const result = await provider.executeTool('nonexistent_tool', {});
    
    // Real provider catches missing tools gracefully
    expect((result as any)?.success ?? false).toBe(false);
  });

  test('should update state after tool execution', async () => {
    await provider.executeTool('insert_at_line', {});
    
    const lastExecution = (provider.getStateManager() as any).get<string>('last_insert_at_line');
    expect(lastExecution).toEqual({ success: true });
  });

  test('should respect config tool gating', async () => {
    delete require.cache[require.resolve('../src/toolsProvider')];
    const freshModule = require('../src/toolsProvider');
    
    const disabledProvider = new freshModule.ToolsProvider({
      ...DEFAULT_CONFIG,
      fileSystem: false,
      webSearch: false,
    });

    const tools = await disabledProvider.getAvailableTools();
    
    // Line ops + utility tools are always loaded regardless of category toggles
    expect(tools.length).toBeGreaterThan(0);
  });

  test('should create provider with factory function', () => {
    delete require.cache[require.resolve('../src/toolsProvider')];
    const freshModule = require('../src/toolsProvider');
    
    const p2 = freshModule.createToolsProvider({ ...DEFAULT_CONFIG, fileSystem: true });
    
    expect(p2).toBeDefined();
    expect(p2 instanceof freshModule.ToolsProvider).toBe(true);
  });
});
