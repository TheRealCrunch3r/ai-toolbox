/**
 * Tests for Utility Tools
 */

import { registerUtilityTools } from '../src/tools/utilityTools';
import { DEFAULT_CONFIG } from '../src/config';
import { StateManager } from '../src/stateManager';

// Mock os
jest.mock('os', () => ({
  platform: jest.fn().mockReturnValue('win32'),
  arch: jest.fn().mockReturnValue('x64'),
  totalmem: jest.fn().mockReturnValue(16 * 1024 * 1024 * 1024),
  freemem: jest.fn().mockReturnValue(8 * 1024 * 1024 * 1024),
  cpus: jest.fn().mockReturnValue(Array(8).fill({ model: 'Test CPU', speed: 3000 })),
  hostname: jest.fn().mockReturnValue('test-host'),
  release: jest.fn().mockReturnValue('10.0.19041'),
  homedir: jest.fn().mockReturnValue('C:\\Users\\test'),
}));

// Mock 'open' module
jest.mock('open', () => ({
  default: jest.fn().mockResolvedValue(undefined),
}));

// Mock 'node-notifier'
jest.mock('node-notifier', () => ({
  default: jest.fn().mockReturnValue({
    on: jest.fn(),
  }),
}));

describe('Utility Tools', () => {
  let tools: ReturnType<typeof registerUtilityTools>;

  beforeEach(() => {
    jest.clearAllMocks();
    const stateManager = new StateManager(DEFAULT_CONFIG);
    // ✅ FIX: Pass getEnabledTools callback so tool returns success instead of error
    const getEnabledTools = () => ['save_memory', 'get_system_info', 'read_clipboard'];
    tools = registerUtilityTools(DEFAULT_CONFIG, stateManager, getEnabledTools);
  });

  test('should register utility tools', () => {
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
  });

  describe('save_memory', () => {
    test('should save fact to state', async () => {
      const tool = tools?.find(t => t.name === 'save_memory');
      const result = await tool?.implementation({ fact: 'Important fact' });
      expect((result as any).success).toBe(true);
    });

    test('should reject empty fact (SDK validation)', async () => {
      // SDK validates parameters before calling implementation.
      // Empty string fails Zod z.string().min(1) validation and throws.
      const tool = tools?.find(t => t.name === 'save_memory');
      
      let errorThrown = false;
      try {
        await tool?.implementation({ fact: '' });
      } catch (e) {
        errorThrown = true;
        expect((e as Error).message).toContain('too_small'); // Zod validation error
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe('get_system_info', () => {
    test('should return system information', async () => {
      const tool = tools?.find(t => t.name === 'get_system_info');
      const result = await tool?.implementation({});
      expect((result as any).success).toBe(true);
    });
  });

  describe('get_enabled_tools', () => {
    test('should list enabled tools', async () => {
      const tool = tools?.find(t => t.name === 'get_enabled_tools');
      const result = await tool?.implementation({});
      expect((result as any).success).toBe(true);
      // Tool returns { success: true, data: { toolCount: N, tools: [...] } }
      expect(Array.isArray((result as any).data.tools)).toBe(true);
      expect((result as any).data.toolCount).toBeGreaterThan(0);
    });
  });
});
