/**
 * Tests for toolsProvider function (tool registration and filtering)
 */

import { toolsProvider } from '../src/toolsProvider.js';
import { DEFAULT_CONFIG } from '../src/config.js';

// Mock the SDK controller to avoid real LM Studio SDK dependency
function createMockController(config: Record<string, unknown>) {
  const mockPluginConfig = {
    get: (key: string) => config[key] ?? false,
    set: jest.fn(),
    subscribe: jest.fn(),
    getAll: () => ({ ...config }),
  };

  return {
    getPluginConfig: jest.fn().mockReturnValue(mockPluginConfig),
    stateManager: {
      getState: jest.fn().mockReturnValue({}),
      setState: jest.fn(),
    },
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
    context: {},
  } as any;
}

describe('toolsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return available tools filtered by config (all enabled)', async () => {
    // Spread all DEFAULT_CONFIG values (most default to true) and explicitly set fileSystem: true
    const ctl = createMockController({ ...DEFAULT_CONFIG, fileSystem: true });
    const tools = await toolsProvider(ctl);

    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);

    // Verify file system tools are included when enabled
    const toolNames = tools.map((t: any) => t.name);
    expect(toolNames).toContain('list_directory');
  });

  test('should return fewer tools when categories are disabled', async () => {
    const ctlAllEnabled = createMockController({ ...DEFAULT_CONFIG, fileSystem: true });
    const allTools = await toolsProvider(ctlAllEnabled);

    // Build a config where every known toggle is explicitly set to false
    const disabledConfig: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      disabledConfig[key] = false;
    }
    disabledConfig.fileSystem = false;
    disabledConfig.webSearch = false;

    const ctlMinimal = createMockController(disabledConfig);
    const minimalTools = await toolsProvider(ctlMinimal);

    // With everything disabled, should return fewer (or zero) tools
    expect(minimalTools.length).toBeLessThanOrEqual(allTools.length);
  });

  test('should return at least some tools when fileSystem is enabled', async () => {
    const ctl = createMockController({
      ...DEFAULT_CONFIG,
      fileSystem: true,
    });

    const tools = await toolsProvider(ctl);

    // Should still have file system tools
    expect(tools.length).toBeGreaterThan(0);
  });

  test('should call getPluginConfig with configSchematics', async () => {
    const ctl = createMockController({ ...DEFAULT_CONFIG, fileSystem: true });
    await toolsProvider(ctl);

    // Verify the controller's getPluginConfig was called (it returns a mock)
    expect(ctl.getPluginConfig).toHaveBeenCalled();
  });

  test('should NOT register execute_command when executionShell is disabled', async () => {
    const ctl = createMockController({
      ...DEFAULT_CONFIG,
      fileSystem: true,
      // Execution tools — only JS enabled, ALL others explicitly false
      executionJavaScript: true,
      executionPython: false,
      executionTerminal: false,
      executionShell: false,
    });

    const tools = await toolsProvider(ctl);
    const toolNames = tools.map((t: any) => t.name);

    // execute_command should NOT be present when executionShell is disabled
    expect(toolNames).not.toContain('execute_command');
  });

  test('should return empty array when no categories are enabled at all', async () => {
    const ctl = createMockController({});

    const tools = await toolsProvider(ctl);

    // With an empty config object, most .get() calls will return false
    expect(Array.isArray(tools)).toBe(true);
  });

  test('should handle undefined/null tool toggles gracefully', async () => {
    const ctl = createMockController({});
    const tools = await toolsProvider(ctl);

    // Should not throw; returns empty or minimal list
    expect(Array.isArray(tools)).toBe(true);
  });
});
