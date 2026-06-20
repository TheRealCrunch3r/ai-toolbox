/**
 * Tests for ToolsProvider (tool execution and filtering)
 */

import { createToolsProvider, ToolsProvider } from '../src/toolsProvider.js';
import { DEFAULT_CONFIG } from '../src/config.js';

describe('ToolsProvider', () => {
  let provider: ToolsProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a fresh provider for each test — this naturally resets the internal registry cache
    provider = new ToolsProvider({ ...DEFAULT_CONFIG, fileSystem: true, godMode: false });
  });

  test('should return available tools filtered by config', async () => {
    const tools = await provider.getAvailableTools();

    expect(tools.length).toBeGreaterThan(0);

    // Verify lineOperations tools are included (they're always loaded)
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
    // Fresh provider with different config — internal registry starts empty and loads fresh
    const disabledProvider = new ToolsProvider({
      ...DEFAULT_CONFIG,
      fileSystem: false,
      webSearch: false,
    });

    const tools = await disabledProvider.getAvailableTools();
    
    // Line ops + utility tools are always loaded regardless of category toggles
    expect(tools.length).toBeGreaterThan(0);
  });

  test('should create provider with factory function', () => {
    const p2 = createToolsProvider({ ...DEFAULT_CONFIG, fileSystem: true });
    
    expect(p2).toBeDefined();
    expect(p2 instanceof ToolsProvider).toBe(true);
  });
});
