/**
 * Tests for run_powershell tool (added 16.11 — direct spawn of powershell.exe, NO cmd/shell layer).
 * Key guarantee under test: the script travels as ONE argv element, untransformed (Quoting-Kanary).
 */

import { registerExecutionTools } from '../src/tools/executionTools';
import { DEFAULT_CONFIG } from '../src/config';

// Mock child_process with a controllable fake proc factory (per-test stdout/stderr/close control)
jest.mock('child_process', () => ({ spawn: jest.fn() }));
import { spawn as mockedSpawnFn } from 'child_process';

const mockedSpawn = mockedSpawnFn as unknown as jest.Mock;

// Mock security — house style: block a canary pattern, pass everything else through
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

/** Build a fake child process whose stdout/stderr/close are driven per test. */
function makeFakeProc(opts: { stdoutText?: string; stderrText?: string; exitCode?: number } = {}): void {
  const { stdoutText = '', stderrText = '', exitCode = 0 } = opts;
  const proc: Record<string, unknown> = {
    pid: 424242,
    kill: jest.fn(),
    stdin: { write: jest.fn(), end: jest.fn() },
    stdout: {
      on: (ev: string, cb: (d: Buffer) => void) => {
        if (ev === 'data' && stdoutText) setImmediate(() => cb(Buffer.from(stdoutText)));
      },
    },
    stderr: {
      on: (ev: string, cb: (d: Buffer) => void) => {
        if (ev === 'data' && stderrText) setImmediate(() => cb(Buffer.from(stderrText)));
      },
    },
    on: (ev: string, cb: (...a: unknown[]) => void) => {
      if (ev === 'close') setImmediate(() => cb(exitCode));
      return proc;
    },
  };
  mockedSpawn.mockReturnValue(proc);
}

describe('run_powershell', () => {
  let tools: ReturnType<typeof registerExecutionTools>;

  beforeEach(() => {
    jest.clearAllMocks();
    makeFakeProc({ stdoutText: 'OK\n' });
    tools = registerExecutionTools(DEFAULT_CONFIG);
  });

  const getTool = () => tools.find(t => t.name === 'run_powershell');

  test('is registered among execution tools', () => {
    expect(getTool()).toBeDefined();
  });

  describe('happy path (direct spawn contract)', () => {
    test('spawns powershell.exe with the exact flag set and NO shell option', async () => {
      makeFakeProc({ stdoutText: 'hello\n' });
      const result = await getTool()?.implementation({ script: "Write-Output 'hello'" });

      expect(mockedSpawn).toHaveBeenCalledTimes(1);
      const [exe, args, options] = mockedSpawn.mock.calls[0];
      expect(exe).toBe('powershell.exe');
      expect(args.slice(0, 4)).toEqual(['-NoProfile', '-NonInteractive', '-NoLogo', '-Command']);
      // useShell=false must hold: no `shell` option may ever be set for this tool
      expect(options?.shell ?? false).toBe(false);

      const r = result as { success: boolean; data?: Record<string, unknown> };
      expect(r.success).toBe(true);
      expect(r.data?.stdout).toContain('hello');
      expect(r.data?.provenance).toBe('run_powershell');
      expect(r.data?.confidence).toBe('EXTRACTED');
    });

    test('Quoting-Kanary: script with quotes/backticks/$ arrives as ONE untransformed argv element', async () => {
      makeFakeProc({ stdoutText: 'x' });
      const nasty = "Write-Output \"a\"\"b\" & 'c d' + `$x` + (1+2) # -NoProfile";
      await getTool()?.implementation({ script: nasty, timeout_seconds: 5 });

      expect(mockedSpawn).toHaveBeenCalledTimes(1);
      const [, args] = mockedSpawn.mock.calls[0];
      // THE core guarantee: byte-identical pass-through as a single argument — no layer re-parses it.
      expect(args).toHaveLength(5);
      expect(args[4]).toBe(nasty);
    });

    test('pipes provided input to the script via stdin', async () => {
      makeFakeProc({ stdoutText: '' });
      await getTool()?.implementation({ script: '$input | Out-Null', input: 'line1\n' });

      // Read the fake proc AFTER the spawn call has happened (mock.results is populated at call time).
      const proc = mockedSpawn.mock.results[0]?.value as any;
      expect(proc?.stdin.write).toHaveBeenCalledWith('line1\n');
    });
  });

  describe('error semantics', () => {
    test('PS terminating error (exit 1) surfaces via stderr/output — documented house semantics', async () => {
      makeFakeProc({ stdoutText: '', stderrText: 'boom: Exception thrown.\n' });
      const result = await getTool()?.implementation({ script: "throw 'boom'" });

      const r = result as { success: boolean; data?: Record<string, unknown> };
      // safeSpawn reports a clean process close as success (same contract as execute_command); the error is visible in streams.
      expect(r.success).toBe(true);
      expect(String(r.data?.stderr)).toContain('boom');
      expect(String(r.data?.output)).toContain('boom');
    });

    test('blocked by sanitizeCommand', async () => {
      const result = await getTool()?.implementation({ script: 'rm -rf C:\\' });
      const r = result as { success: boolean; error?: string };
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/Unsafe/i);
      expect(mockedSpawn).not.toHaveBeenCalled();
    });
  });

  describe('abort contract', () => {
    test('pre-fired host signal → aborted envelope, nothing spawned', async () => {
      makeFakeProc({ stdoutText: 'x' });
      const controller = new AbortController();
      controller.abort();

      const result = await getTool()?.implementation({ script: "Write-Output 1" }, { signal: controller.signal });
      const r = result as { success: boolean; data?: Record<string, unknown> };

      expect(r.data?.aborted).toBe(true);
      expect(mockedSpawn).not.toHaveBeenCalled();
    });
  });

  describe('platform gate', () => {
    afterEach(() => {
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });

    const originalPlatform = process.platform;

    test('fails fast on non-Windows hosts (no spawn probing)', async () => {
      makeFakeProc({ stdoutText: 'x' });
      Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });

      const result = await getTool()?.implementation({ script: 'Get-Item' });
      const r = result as { success: boolean; error?: string };

      expect(r.success).toBe(false);
      expect(String(r.error)).toMatch(/Windows-only/i);
      expect(mockedSpawn).not.toHaveBeenCalled();
    });
  });
});
