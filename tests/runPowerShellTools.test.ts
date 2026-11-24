/**
 * Tests for run_powershell tool (added 16.11; B1a owner GO 18.11 — win32 cmd-intermediated spawn: the FULL command line travels as ONE
 * shell-parsed string via useShell=true, the script inside as ONE double-quoted -Command argument; B1b 20.11 adds backslash escaping of
 * embedded double quotes so they cannot close cmd's quote window early).
 * Key guarantee under test (Quoting-Kanary): the user script reaches PowerShell BYTE-EXACT — in the cmd-parsed line its inner
 * double quotes are escaped (\") and PowerShell unescapes them exactly once.
 */

import { registerExecutionTools } from '../src/tools/executionTools';
import { DEFAULT_CONFIG } from '../src/config';

// Mock child_process with a controllable fake proc factory (per-test stdout/stderr/close control)
jest.mock('child_process', () => ({ spawn: jest.fn() }));
import { spawn as mockedSpawnFn } from 'child_process';

const mockedSpawn = mockedSpawnFn as unknown as jest.Mock;

// 18.11 (owner GO): run_powershell binary resolution — the pre-existing pins below exercise the FALLBACK path (built-in Windows PowerShell),
// so every test in this file runs under a deterministic "no pwsh anywhere" fs environment via statSync spying + per-test cache reset.
// 18.11: core-module namespaces are non-redefinable under the CJS transform — swap statSync via a module mock with requireActual (house style), keep every other fs call real.
jest.mock('fs', () => Object.assign(Object.create(null) as Record<string, unknown>, jest.requireActual('fs') as Record<string, unknown>, { statSync: jest.fn(), existsSync: jest.fn() })); // 24.11 FIX: existsSync joins the house idiom — import-namespace props are getter-only (Babel interop), so per-test swaps must mutate the shared jest.fn via mockReturnValue/mockReset, never reassign the property
import * as realFs from 'fs';
import { resolveShellExe, resetShellResolveCacheForTests } from '../src/tools/executionTools';
const fsStatSpy = (realFs as unknown as { statSync: jest.Mock }).statSync;

// Mock security — house style: block a canary pattern, pass everything else through
jest.mock('../src/security', () => {
  const psBlock = (s: string) => /\bRemove-Item\b[\s\S]*-\s*(Recurse|Force)\b/i.test(s); // mirrors the native destructive-vector rule
  return {
    sanitizeCommand: jest.fn().mockImplementation((cmd: string) => ({
      safe: !cmd.includes('rm -rf'),
      reason: cmd.includes('rm -rf') ? 'Dangerous command' : undefined,
    })),
    // 16.11 (owner GO): run_powershell now uses the PS-aware profile — house style mock: block the native canary, pass everything else.
    sanitizePowerShellScript: jest.fn().mockImplementation((script: string) => ({
      safe: !psBlock(script),
      reason: psBlock(script) ? 'Destructive Remove-Item detected' : undefined,
    })),
  };
});

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

  // 18.11: deterministic FALLBACK env for all pre-existing pins — no pwsh on disk → resolveShellExe() returns built-in powershell.exe (pins L-expect(exe).toBe('powershell.exe') stay green)
  beforeEach(() => {
    resetShellResolveCacheForTests();
    fsStatSpy.mockImplementation((): never => { throw new Error('ENOENT: forced no-pwsh test env'); });
  });

  test('is registered among execution tools', () => {
    expect(getTool()).toBeDefined();
  });

  describe('happy path (B1a cmd-line spawn contract)', () => {
    test('spawns the full pwsh command line via useShell=true — flag set + single -Command token intact', async () => {
      makeFakeProc({ stdoutText: 'hello\n' });
      const result = await getTool()?.implementation({ script: "Write-Output 'hello'" });

      expect(mockedSpawn).toHaveBeenCalledTimes(1);
      // B1a (owner GO 18.11): safeSpawn(win32, useShell=true) passes the FULL command line as ONE string — Node wraps it in one quote
      // pair, cmd /d /s /c strips that outer pair and parses by standard rules; pwsh receives -Command as ONE token.
      const [cmdLine, args, options] = mockedSpawn.mock.calls[0];
      expect(cmdLine).toBe('powershell.exe -NoProfile -NonInteractive -NoLogo -Command "try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}; Write-Output \'hello\'"');
      expect(args).toEqual([]); // no separate argv — the shell parses the line (GATE-4 win32 path)
      // useShell=true MUST hold for this tool on win32: it is the measured defect fix, not an optimization.
      expect(options?.shell ?? false).toBe(true);

      const r = result as { success: boolean; data?: Record<string, unknown> };
      expect(r.success).toBe(true);
      expect(r.data?.stdout).toContain('hello');
      expect(r.data?.provenance).toBe('run_powershell');
      expect(r.data?.confidence).toBe('EXTRACTED');
    });

    test('Quoting-Kanary: script with quotes/backticks/$ survives as ONE double-quoted -Command token (B1a+B1b)', async () => {
      makeFakeProc({ stdoutText: 'x' });
      const nasty = "Write-Output \"a\"\"b\" & 'c d' + `$x` + (1+2) # -NoProfile";
      await getTool()?.implementation({ script: nasty, timeout_seconds: 5 });

      expect(mockedSpawn).toHaveBeenCalledTimes(1);
      const [cmdLine] = mockedSpawn.mock.calls[0];
      // THE core guarantee (B1a owner GO 18.11; B1b 20.11): the user script rides as ONE double-quoted -Command token; its inner
      // double quotes are backslash-escaped in the CMD-PARSED line so they cannot close cmd's quote window early — PowerShell then
      // unescapes \" → " exactly once, so pwsh receives the script BYTE-EXACT. Only the measured UTF8-prelude is prepended.
      const PS_UTF8_PRELUDE = 'try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}; '; // mirrors src/tools/executionTools.ts (house style)
      expect(cmdLine).toContain(`-Command "${PS_UTF8_PRELUDE}${nasty.replace(/"/g, '\\"')}"`); // value of the replace arg: \" (one backslash + quote)
    });

  // B1a contract pins (owner GO 18.11 — npm-shim-Arc): the cmd-intermediated spawn mechanics, pinned on the EXACT line that reaches cmd.exe.
  describe('B1a cmd-line contract (18.11, owner GO)', () => {
    const PS_UTF8_PRELUDE = 'try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}; '; // mirrors src/tools/executionTools.ts (house style)

    test('B1a token round-trip: user script stays ONE double-quoted -Command token — no fragmentation of the line (B1b escaping)', async () => {
      makeFakeProc({ stdoutText: 'x' });
      const nasty = String.raw`Write-Output "a""b" & 'c d' + ${'$x'} + (1+2) # -NoProfile`; // cmd metachars (&, $()), quotes — the exact 16.11 canary class
      await getTool()?.implementation({ script: nasty });

      const [cmdLine] = mockedSpawn.mock.calls[0];
      // B1b (20.11): inner double quotes are backslash-escaped in the cmd-parsed line — cmd's /d /s parse keeps them INSIDE the
      // -Command window, then PowerShell unescapes \" → " once → pwsh gets the verbatim script text as ONE token.
      const ESC_Q = String.fromCharCode(92, 34); // B1b escape pair \" — charCode idiom: zero literal backslashes in source (escape-layer-safe)
      const nastyEscaped = nasty.replace(/"/g, ESC_Q);
      const token = `"${PS_UTF8_PRELUDE}${nastyEscaped}"`;
      expect(cmdLine).toContain(`-Command ${token}`);
      expect((cmdLine.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length).toBe(1); // exactly ONE occurrence — no fragmentation of the script
    });

    test('B1a pwsh 7.x: resolved shell path leads the line (spaces in Program Files survive cmd tokenization — quoted, 20.11 fix)', async () => {
      resetShellResolveCacheForTests();
      const savedPF = process.env['ProgramFiles']; // canonical-install dir for this pin — set + restore inline (house env pattern of the resolveShellExe unit block)
      process.env['ProgramFiles'] = 'C:\\Program Files';
      try {
        const pfPwsh = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe';
        fsStatSpy.mockImplementation(((p: string) => ({ isFile: () => p === pfPwsh, path: p }) as unknown as realFs.Stats));
        makeFakeProc({ stdoutText: 'x' });

        await getTool()?.implementation({ script: "Write-Output 'pw7'" });

        const [cmdLine] = mockedSpawn.mock.calls[0];
        expect(cmdLine).toBe(`"${pfPwsh}" -NoProfile -NonInteractive -NoLogo -Command "${PS_UTF8_PRELUDE}Write-Output 'pw7'"`);
      } finally {
        if (savedPF === undefined) delete process.env['ProgramFiles']; else process.env['ProgramFiles'] = savedPF;
        resetShellResolveCacheForTests(); // don't leak this pin's resolved binary into later tests
      }
    });

    // B1b (20.11): double-quote escape regression pins — measured live defect on this host: an embedded quote pair closed cmd's
    // -Command window EARLY, so the remainder of the line was re-parsed as separate tokens (git saw 'C:\Source' from a quoted spaced
    // path; other shapes hung pwsh until tool timeout). Escaping is now the only transformation applied to script text.
    test('B1b: embedded double quotes are escaped — exactly ONE unescaped -Command quote window survives in the cmd line', async () => {
      makeFakeProc({ stdoutText: 'x' });
      const spacedPath = String.raw`C:\Source Code\LM Studio Plugins\ai_toolbox`; // exact live-repro shape (20.11 17:3x)
      await getTool()?.implementation({ script: `git -C "${spacedPath}" log --oneline -1`, timeout_seconds: 5 });

      const [cmdLine] = mockedSpawn.mock.calls[0];
      expect(cmdLine).toContain(`-C \\"${spacedPath}\\"`); // escaped pair rides INSIDE the window as literal \" text
      // THE defect class pinned: unescaped double quotes in the line must be exactly TWO — the single -Command window pair.
      // (The fallback env of this file resolves space-free powershell.exe, so the path prefix contributes no quote of its own.)
      const unescapedQuotes = (cmdLine.match(/(?<!\\)"/g) ?? []).length;
      expect(unescapedQuotes).toBe(2);
    });
  });

    
    // 20.11 regression: space-free resolution (powershell.exe fallback) stays UNQUOTED — line byte-identical to pre-fix behavior
    test('no-spaces path (powershell.exe fallback) stays unquoted in the cmd line (20.11 regression pin)', async () => {
      const PS_UTF8_PRELUDE = 'try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}; '; // mirrors src/tools/executionTools.ts (house style)
      makeFakeProc({ stdoutText: 'x' });
      await getTool()?.implementation({ script: "Write-Output 'ns'" });

      const [cmdLine] = mockedSpawn.mock.calls[0];
      expect(cmdLine).toBe(`powershell.exe -NoProfile -NonInteractive -NoLogo -Command "${PS_UTF8_PRELUDE}Write-Output 'ns'"`);
    })

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

    test('blocked by the PS-aware sanitization profile (native destructive vector, 16.11)', async () => {
      const result = await getTool()?.implementation({ script: 'Remove-Item -Path C:\\Data -Recurse -Force' });
      const r = result as { success: boolean; error?: string };
      expect(r.success).toBe(false);
      expect(String(r.error)).toMatch(/Unsafe PowerShell script/i);
      expect(mockedSpawn).not.toHaveBeenCalled();
    });

    test('PS idioms the cmd/sh profile used to reject now spawn (16.11 live findings F1/F2)', async () => {
      makeFakeProc({ stdoutText: 'ok' });
      // Finding F1: multiple semicolons on one line are standard PS statement separators.
      await getTool()?.implementation({ script: "Write-Output 1; Write-Output 2; Get-Process", timeout_seconds: 5 });
      expect(mockedSpawn).toHaveBeenCalledTimes(1);

      makeFakeProc({ stdoutText: 'ok' });
      // Finding F2: backtick-pair quote escapes + subexpression — the exact class blocked in live test 2.
      await getTool()?.implementation({ script: '$x = "He said `"hi`""; Write-Output $x', timeout_seconds: 5 });
      expect(mockedSpawn).toHaveBeenCalledTimes(2);
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

  // F-PS1/F-PS2 live-debug fixes (16.11 ~21:4x, owner GO): PS 5.1 redirected output was OEM/cp850 on a de-DE host
  // (measured bytes 84 94 81 e1 3f for "äöüß€" → Node UTF-8 decode = U+FFFD); exit codes were dropped by the close handler.
  describe('F-PS1/F-PS2 fixes (16.11 ~21:4x)', () => {
    const PS_UTF8_PRELUDE = 'try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}; '; // mirrors src constant (house style)

    test('F-PS1: UTF-8 prelude prepended, user script byte-suffix intact inside the single -Command token (B1a)', async () => {
      makeFakeProc({ stdoutText: 'x' });
      const user = "Write-Output \"a\"; Write-Host \"b\"";
      await getTool()?.implementation({ script: user });

      expect(mockedSpawn).toHaveBeenCalledTimes(1);
      const [cmdLine] = mockedSpawn.mock.calls[0];
      // B1a (owner GO 18.11) + B1b (20.11): prelude + suffix ride inside ONE double-quoted -Command token of the cmd-parsed line;
      // inner double quotes backslash-escaped for cmd, unescaped once by PowerShell → byte-exact at pwsh. No other transformation.
      expect(cmdLine).toContain(`-Command "${PS_UTF8_PRELUDE}${user.replace(/"/g, String.fromCharCode(92, 34))}"`);
    });

    test('F-PS2: clean close with code 0 → envelope.exitCode = 0, no note', async () => {
      makeFakeProc({ stdoutText: 'ok\n', exitCode: 0 });
      const r = (await getTool()?.implementation({ script: "Write-Output 'ok'" })) as { success: boolean; data?: Record<string, unknown> };

      expect(r.success).toBe(true);
      expect(r.data?.exitCode).toBe(0);
      expect(r.data?.note).toBeUndefined();
    });

    test('F-PS2: non-zero close code → exitCode surfaced + note, success semantics UNCHANGED (option a)', async () => {
      makeFakeProc({ stdoutText: 'partial\n', stderrText: '', exitCode: 7 });
      const r = (await getTool()?.implementation({ script: 'exit 7' })) as { success: boolean; data?: Record<string, unknown> };

      expect(r.success).toBe(true); // documented house semantics: non-zero ≠ failed run (probe/diff-style scripts)
      expect(r.data?.exitCode).toBe(7);
      expect(String(r.data?.note)).toMatch(/exited with code 7/);
    });
  });

  // 24.11 TIMEOUT-HYGIENE + ENV-ENRICHMENT (owner GO): a timed-out run must carry its partial streams (before: bare 'Execution timed out',
  // zero output — indistinguishable from "wrapper swallowed everything") and win32 kills the process TREE; children of safeSpawn get the
  // missing Windows user-env vars completed additively from USERPROFILE.
  describe('24.11 timeout hygiene + env enrichment (owner GO)', () => {
    test('timeout carries partial stdout/stderr in the envelope AND win32 kills the process tree (taskkill /T)', async () => {
      jest.useFakeTimers();
      try {
        // Custom proc: emits ONE data chunk, never closes on its own — only the internal timer may settle.
        let dataHandler: ((d: Buffer) => void) | null = null;
        const proc: Record<string, unknown> = {
          pid: 987654,
          kill: jest.fn(),
          stdin: { write: jest.fn(), end: jest.fn() },
          stdout: { on: (ev: string, cb: (d: Buffer) => void) => { if (ev === 'data') dataHandler = cb; } },
          stderr: { on: () => {} },
          on: () => proc as never, // swallow close/error — the timeout is the authoritative settle here
        };
        mockedSpawn.mockReturnValue(proc);

        const pending = getTool()!.implementation({ script: "Write-Output 'early'", timeout_seconds: 1 });
        await Promise.resolve();
        dataHandler?.(Buffer.from('EARLY-LINE\n')); // partial output captured before the kill
        jest.advanceTimersByTime(1005); // fire safeSpawn's internal setTimeout(timeoutMs)

        const r = (await pending) as { success: boolean; error?: string; stdout?: string };
        expect(r.success).toBe(false);
        expect(String(r.error)).toMatch(/timed out after 1s/i);
        // THE fix pinned: a timeout no longer hides early work — partial streams ride along in the failure envelope.
        expect(r.stdout).toContain('EARLY-LINE');
        // Tree kill per house idiom (mirrors settleAborted): bare proc.kill() would orphan pwsh grandchildren after a timeout.
        const taskKillCalls = mockedSpawn.mock.calls.filter((c) => c[0] === 'taskkill');
        expect(taskKillCalls.length).toBe(1);
        expect(taskKillCalls[0][1]).toEqual(['/pid', '987654', '/T', '/F']);
      } finally {
        jest.useRealTimers();
      }
    });

    test('win32 spawn enriches the child env additively from USERPROFILE (measured 24.11: APPDATA/LOCALAPPDATA absent in host children)', async () => {
      const saved = process.env['USERPROFILE'];
      // 24.11 FIX (restore TypeError): the fs import namespace is getter-only under Babel interop — direct property assignment throws in strict mode and would be invisible to the implementation's own binding anyway; mutate the shared jest.fn instead (house idiom, cf. fsStatSpy line 24).
      const existsSyncMock = realFs.existsSync as unknown as jest.Mock;
      try {
        // Deterministic fixture HOME on the temp drive — existsSync is stubbed TRUE so no disk dependency (real FS stays for everything else).
        existsSyncMock.mockReturnValue(true);
        process.env['USERPROFILE'] = 'C:\\Users\\arc2411';

        makeFakeProc({ stdoutText: 'env-ok' });
        await getTool()?.implementation({ script: "Write-Output 'env'" });

        const [, , options] = mockedSpawn.mock.calls[0];
        const env = (options as { env?: NodeJS.ProcessEnv } | undefined)?.env;
        // THE fix pinned: the missing standard user vars are derived from USERPROFILE and passed to the child…
        expect(env?.APPDATA).toBe('C:\\Users\\arc2411\\AppData\\Roaming');
        expect(env?.LOCALAPPDATA).toBe('C:\\Users\\arc2411\\AppData\\Local');
        // …while every pre-existing host variable passes through untouched (purely additive, never overwriting).
        expect(env?.PATH).toBe(process.env.PATH);
      } finally {
        if (saved === undefined) delete process.env['USERPROFILE']; else process.env['USERPROFILE'] = saved;
        existsSyncMock.mockReset(); // 24.11 FIX: drops the stub (later tests see undefined again = pre-enrichment behavior); no descriptor surgery on a getter-only namespace
      }
    });
  });
});


// 18.11 (owner GO): unit tests for resolveShellExe() — pwsh 7.x preferred, WindowsApps alias trap skipped, deterministic fallback to built-in 5.1.
describe('resolveShellExe (18.11 binary resolution)', () => {
  const REAL_PF = process.env['ProgramFiles'] ?? '';
  let savedPath: string | undefined;

  beforeEach(() => {
    resetShellResolveCacheForTests();
    fsStatSpy.mockRestore();
    savedPath = process.env.PATH;
  });

  afterEach(() => {
    if (REAL_PF) process.env['ProgramFiles'] = REAL_PF; else delete process.env['ProgramFiles'];
    process.env.PATH = savedPath as string;
    fsStatSpy.mockReset();
  });

  const existsAt = (paths: string[]) => {
    fsStatSpy.mockImplementation(((p: string) => ({ isFile: () => paths.includes(p), path: p }) as unknown as realFs.Stats));
  };

  test('prefers the canonical Program Files pwsh install over PATH entries', () => {
    process.env['ProgramFiles'] = 'C:\\PF';
    const pfPwsh = 'C:\\PF\\PowerShell\\7\\pwsh.exe';
    existsAt([pfPwsh, 'D:\\bin\\pwsh.exe']);
    process.env.PATH = ['D:\\bin'].join(';');
    expect(resolveShellExe()).toBe(pfPwsh);
  });

  test('skips WindowsApps PATH entries (Store App Execution Alias trap) -> falls back to built-in powershell.exe', () => {
    process.env['ProgramFiles'] = 'C:\\PF-missing'; // canonical install absent
    existsAt([]); // nothing on disk at all — the alias sits in PATH but must never be resolved
    process.env.PATH = ['C:\\Users\\x\\AppData\\Local\\Microsoft\\WindowsApps', 'D:\\bin'].join(';');
    expect(resolveShellExe()).toBe('powershell.exe');
  });

  test('resolves pwsh.exe from a regular PATH dir when the canonical install is absent', () => {
    process.env['ProgramFiles'] = 'C:\\PF-missing';
    const pathPwsh = 'D:\\bin\\pwsh.exe';
    existsAt([pathPwsh]);
    process.env.PATH = ['C:\\Windows\\System32', 'D:\\bin'].join(';');
    expect(resolveShellExe()).toBe(pathPwsh);
  });

  test('caches the resolution for the process lifetime; only the reset hook re-arms it', () => {
    process.env['ProgramFiles'] = 'C:\\PF';
    const pfPwsh = 'C:\\PF\\PowerShell\\7\\pwsh.exe';
    existsAt([pfPwsh]);
    expect(resolveShellExe()).toBe(pfPwsh);
    fsStatSpy.mockImplementation((): never => { throw new Error('ENOENT'); }); // disk "changes" afterwards...
    expect(resolveShellExe()).toBe(pfPwsh); // ...but the cache holds until reset (per-process one-shot by design)
    resetShellResolveCacheForTests();
    expect(resolveShellExe()).toBe('powershell.exe'); // after re-arm + no pwsh on disk -> fallback
  });
});
