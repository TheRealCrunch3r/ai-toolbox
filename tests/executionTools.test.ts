/**
 * Tests for Execution Tools
 */

import { registerExecutionTools } from '../src/tools/executionTools';
import { DEFAULT_CONFIG } from '../src/config';

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => ({
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn((event, cb) => {
      if (event === 'close') cb(0);
    }),
    stdin: { write: jest.fn(), end: jest.fn() },
  })),
}));

// Mock security
jest.mock('../src/security', () => ({
  sanitizeCommand: jest.fn().mockImplementation((cmd: string) => ({
    safe: !cmd.includes('rm -rf'),
    reason: cmd.includes('rm -rf') ? 'Dangerous command' : undefined,
  })),
}));

// Mock workingDir
jest.mock('../src/workingDir', () => ({
  getWorkingDir: jest.fn().mockReturnValue('/test/dir'),
}));

describe('Execution Tools', () => {
  let tools: ReturnType<typeof registerExecutionTools>;

  beforeEach(() => {
    jest.clearAllMocks();
    tools = registerExecutionTools(DEFAULT_CONFIG);
  });

  test('should register execution tools', () => {
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
  });

  describe('run_javascript', () => {
    test('should execute safe JavaScript', async () => {
      const tool = tools?.find(t => t.name === 'run_javascript');
      const result = await tool?.implementation({ javascript: 'console.log("hello")', timeout_seconds: 5 });
      expect((result as any).success).toBe(true);
    });

    test('should reject dangerous patterns', async () => {
      const tool = tools?.find(t => t.name === 'run_javascript');
      const result = await tool?.implementation({
        javascript: 'require("child_process").exec("rm -rf /")',
      });
      expect((result as any).success).toBe(false);
    });
  });

  describe('run_python', () => {
    test('should execute Python code', async () => {
      const tool = tools?.find(t => t.name === 'run_python');
      const result = await tool?.implementation({ python: 'print("hello")', timeout_seconds: 5 });
      expect((result as any).success).toBe(true);
    });
  });

  describe('execute_command', () => {
    test('should execute safe command', async () => {
      const tool = tools?.find(t => t.name === 'execute_command');
      const result = await tool?.implementation({ command: 'ls -la', timeout_seconds: 10 });
      expect((result as any).success).toBe(true);
    });

    test('should reject unsafe command', async () => {
      const tool = tools?.find(t => t.name === 'execute_command');
      const result = await tool?.implementation({ command: 'rm -rf /' });
      expect((result as any).success).toBe(false);
    });
  });

  describe('run_in_terminal', () => {
    test('should launch command in terminal', async () => {
      const tool = tools?.find(t => t.name === 'run_in_terminal');
      const result = await tool?.implementation({ command: 'code .' });
      expect((result as any).success).toBe(true);
    });
  });
});
