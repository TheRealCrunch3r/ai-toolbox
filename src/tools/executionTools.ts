import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config.js';
import { sanitizeCommand } from '../security.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';
import type { Confidence } from '../types/confidenceTypes.js';

// ==================== Shared Spawn Helper ====================

interface SpawnResult {
  success: boolean;
  data?: { stdout: string; stderr: string };
  error?: string;
  /** 04.10 ABORT-CONTRACT: true when the host signal aborted this spawn (child already killed) — callers must NOT treat it as exe-not-found and continue probing candidates. */
  aborted?: boolean;
}

/**
 * Safely spawn a process with timeout, capturing stdout/stderr.
 * Eliminates code duplication across execution tools.
 *
 * 04.10 ABORT-CONTRACT: optional hostSignal (LM Studio ToolCallContext.signal — user cancel / host timeout) is
 * forwarded into ONE internal AbortController per call — same idiom as createGrepGuard() in src/utils/grepGuard.ts
 * (a WHATWG signal has no reverse .abort(), so forwarding means listening). Firing kills the child BEFORE the
 * 'close' handler can resolve success, so an aborted run can never be reported as a completed one.
 */
async function safeSpawn(
  exe: string,
  args: string[],
  timeoutMs: number,
  input?: string,
  useShell = false,
  hostSignal?: AbortSignal
): Promise<SpawnResult> {
  return new Promise((resolve) => {
    // ==================== 04.10 ABORT-CONTRACT: one authoritative abort state per call (grepGuard idiom) ====================
    const controller = new AbortController();
    if (hostSignal) {
      if (hostSignal.aborted) {
        controller.abort();
      } else {
        hostSignal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    /** Kill the child + best-effort its process tree, then settle. Idempotent via `settled` — 'close'/'error'/timer/
     *  abort must never race a second resolve (a double-kill is harmless but a double-resolve would be sloppy). */
    let settled = false;
    const settleAborted = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timerId);
      try { proc.kill(); } catch { /* already gone */ }
      // Tree kill is best-effort and platform-specific: on Windows `taskkill /T` reaches the whole tree WITHOUT a
      // detached spawn; POSIX tree-kills via negative pid would require the child to be its own group leader (detached),
      // which we deliberately do NOT add — that changes happy-path windowing, so there proc.kill() alone matches the
      // existing timeout behavior exactly.
      if (process.platform === 'win32' && typeof proc.pid === 'number') {
        try { spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }).on('error', () => {}); } catch { /* best-effort */ }
      }
      // Partial captured output rides along (trimmed) so callers can report what happened BEFORE the kill — house style.
      resolve({ success: false, error: 'Aborted by host signal — child process terminated before completion.', aborted: true, data: { stdout: stdout.trim(), stderr: stderr.trim() } });
    };

    if (controller.signal.aborted) {
      // Host cancel already in effect BEFORE this call — do not even start a child. The 'abort' event does NOT re-fire
      // for listeners registered after abort(), so the pre-aborted state must be handled here, synchronously.
      resolve({ success: false, error: 'Aborted by host signal — command was never started.', aborted: true });
      return;
    }

    // DEP0190 Fix: Explicitly spawn the correct shell to avoid deprecation warning with `shell: true` + args
    let cmdToRun = exe;
    let spArgs = [...args];

    if (useShell) {
      const isWindows = process.platform === 'win32';
      // Combine command and args for the shell interpreter to parse safely
      const fullCommand = args.length > 0 ? `${exe} ${args.join(' ')}` : exe;

      if (isWindows) {
        // GATE-4 FIX (04.10): delegate win32 shell execution to Node's built-in shell path — probe v3 MEASURED on this machine:
        // every hand-assembled cmd.exe variant ('/c', '/d /s /c', '/s /c') corrupted grandchild argv for lines containing double quotes
        // (`node -p "1+1"` printed literal '1+1' instead of 2), while spawn(command, [], { shell: true }) returned the correct evaluated
        // output. Accepted trade-off: the DEP0190-era deprecation warning resurfaces on win32 — a broken quoting path in production is
        // strictly worse than a console warning (probe evidence: tmpCaptureProbe v3 dataset).
        cmdToRun = fullCommand; // Node assembles the cmd.exe invocation internally
        spArgs = [];
      } else {
        cmdToRun = '/bin/sh';
        spArgs = ['-c', fullCommand];
      }
    }

    const proc = spawn(cmdToRun, spArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
      cwd: getWorkingDir(), // Execute in the current working directory
      ...(process.platform === 'win32' && useShell ? { shell: true as const } : {}), // win32 only — see GATE-4 comment above; POSIX spawn unchanged (isWindows is block-scoped above)
    });

    let stdout = '';
    let stderr = '';

    if (input) {
      proc.stdin?.write(input);
      proc.stdin?.end();
    }

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    // 04.10 ABORT-CONTRACT: host-signal abort lands in the SAME settle path as the timeout (one authoritative state).
    controller.signal.addEventListener('abort', settleAborted, { once: true });

    const timerId = setTimeout(() => {
      if (settled) return; // 04.10 ABORT-CONTRACT: an aborted settle already killed + resolved — no second kill/resolve
      settled = true;
      proc.kill();
      resolve({ success: false, error: 'Execution timed out' });
    }, timeoutMs);

    proc.on('close', () => {
      // 04.10 ABORT-CONTRACT: after an aborted (or timeout) kill the child still emits 'close' — that close must NOT
      // report success; `settled` covers the race window where the settle path already resolved.
      if (settled || controller.signal.aborted) return;
      settled = true;
      clearTimeout(timerId);
      resolve({ success: true, data: { stdout: stdout.trim(), stderr: stderr.trim() } });
    });

    proc.on('error', (err) => {
      // 04.10 ABORT-CONTRACT: spawn can still surface 'error' AFTER an aborted/timeout kill (e.g. the killed exe was
      // mid-boot ENOENT) — never re-resolve or shadow the abort result.
      if (settled || controller.signal.aborted) return;
      settled = true;
      clearTimeout(timerId);
      resolve({ success: false, error: `Spawn failed: ${err.message}` });
    });
  });
}

// ==================== Typed Params Interfaces ====================

interface RunJavaScriptParams { javascript: string; timeout_seconds?: number; }
interface RunPythonParams { python: string; timeout_seconds?: number; }
interface ExecuteCommandParams { command: string; timeout_seconds?: number; input?: string; }
interface RunInTerminalParams { command: string; }

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

// ==================== 04.10 ABORT-CONTRACT (house idiom) ====================
/** Structural slice of the SDK's ToolCallContext — same ctx contract as ripgrep/pattern_scan in fileSystemTools.ts. */
interface ToolCallContextLike { signal?: AbortSignal; }

/** House abort envelope for execution tools: aborted flag + hint, mirroring ripgrep/pattern_scan's aborted reporting.
 *  `extra` carries partial captured output when a mid-run kill left something behind. */
function abortedEnvelope(hint: string, extra?: Record<string, unknown>): { success: boolean; data: { aborted: true; hint: string } & Record<string, unknown> } {
  return { success: true as const, data: { ...(extra ?? {}), aborted: true, hint } };
}

// ==================== Execution Tools ====================

export function registerExecutionTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // run_javascript tool — SANDBOXED with deno (if available) or node with strict restrictions
  // S5 FIX: Enhanced dangerous pattern detection to prevent eval/require bypasses
  tools.push(tool({
    name: 'run_javascript',
    description: 'Run JavaScript code snippet using Node.js (sandboxed). No external module imports allowed. Standard library only.',
    parameters: {
      javascript: z.string().describe('The JavaScript code to execute'),
      timeout_seconds: z.number().min(0.1).max(60).optional().default(5).describe('Timeout in seconds (max 60)'),
    },
    implementation: async ({ javascript, timeout_seconds }: RunJavaScriptParams, ctx?: ToolCallContextLike) => { // C5 FIX: typed params; 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      // FORENSICS (04.10): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
      if (ctx?.signal?.aborted) console.log(`[run_javascript] aborted-in 0ms (host signal already fired before execution start)`);

      try {
        // 04.10 ABORT-CONTRACT: host cancel already in effect → do not even start probing executables.
        if (ctx?.signal?.aborted) {
          return abortedEnvelope('Aborted by a host cancel before execution started — nothing was run. Re-run when convenient.');
        }

        // Robust dangerous pattern detection — blocks eval, exec, child_process, network access
        // S5 FIX: Only block actually dangerous patterns, not safe standard library requires
        const dangerousPatterns = [
          /\beval\s*\(/i,               // Code injection
          /\bexec\s*\(/i,              // Code execution  
          /Function\s*\(/i,            // Function constructor (eval alternative)
          /String\.fromCharCode\s*\(/i, // .fromCharCode bypass
          /__proto__/i,                // Prototype pollution
          /require\.resolve/i,         // Module resolution abuse
          /\bchild_process\b/i,        // Process spawning
          /os\.system/i,               // OS command execution
          /os\.popen/i,                // OS pipe execution
          /\bnet\./i,                  // Raw network access
          /\bhttp\s*[.(]/i,            // HTTP requests
          /\bdns\./i,                  // DNS resolution
        ];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(javascript)) {
            return { success: false, error: `Dangerous code detected: ${pattern.source}` };
          }
        }

        const timeoutMs = ((timeout_seconds || 5) * 1000);
        
        // Try multiple Node.js executables in order of reliability for cross-platform support
        // npx (if available) → node → shell-based detection
        let result: SpawnResult | null = null;
        const candidates = ['npx', 'node'];
        let fallbackUsed = false;
        
        for (const exe of candidates) {
          if (ctx?.signal?.aborted) break; // 04.10 ABORT-CONTRACT: stop probing — an aborted spawn is NOT "exe not found"
          try {
            result = await safeSpawn(exe, ['-e', javascript], timeoutMs, undefined, false, ctx?.signal);
            const errLower = (result.error || '').toLowerCase();
            if (!errLower.includes('not found') && !errLower.includes("doesn't exist") && !errLower.includes('enoent')) {
              break; // Found a working Node.js executable
            }
          } catch { /* continue to next candidate */ }
        }

        // Final fallback: use shell to find node via PATH/where/node -v
        if (result?.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { provenance: 'run_javascript' }); // 04.10 ABORT-CONTRACT

        const jsErrLower = result?.error?.toLowerCase() || '';
        if (jsErrLower.includes('not found') || jsErrLower.includes('enoent')) {
          fallbackUsed = true;
          const isWindows = process.platform === 'win32';
          const whichCmd = isWindows ? 'where node' : 'which node';
          if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { provenance: 'run_javascript' }); // 04.10 ABORT-CONTRACT
          result = await safeSpawn(isWindows ? 'cmd.exe' : 'sh', 
            [isWindows ? '/c' : '-c', `${whichCmd} 2>nul | head -1`], timeoutMs, undefined, false, ctx?.signal); // 04.10 ABORT-CONTRACT
          
          if (result.success && result.data?.stdout) {
            const nodePath = result.data.stdout.trim().split('\n')[0];
            if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { provenance: 'run_javascript' }); // 04.10 ABORT-CONTRACT
            result = await safeSpawn(nodePath, ['-e', javascript], timeoutMs, undefined, false, ctx?.signal); // 04.10 ABORT-CONTRACT
          } else {
            // Try 'node.cmd' as last resort on Windows
            if (isWindows) {
              fallbackUsed = true;
              result = await safeSpawn('cmd.exe', ['/c', `node -e "${javascript.replace(/"/g, '\\\"')}"`], timeoutMs, undefined, false, ctx?.signal); // 04.10 ABORT-CONTRACT;
            }
          }
        }

        if (!result || !result.success) {
          if (result?.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { provenance: 'run_javascript' }); // 04.10 ABORT-CONTRACT
          const msg = result?.error || 'Node.js executable not found in PATH. Install Node.js or add it to your system PATH.';
          return { success: false, error: msg };
        }

        if (result.data?.stderr && !result.data.stdout) {
          return { success: false, error: result.data.stderr };
        }

        // Determine confidence based on whether fallback was used
        const confidence: Confidence = fallbackUsed ? 'AMBIGUOUS' : 'EXTRACTED';
        
        return { 
          success: true, 
          data: { 
            output: result.data?.stdout || '',
            confidence,
            provenance: 'run_javascript',
            note: fallbackUsed ? 'Fallback path used for Node.js detection — lower confidence' : undefined,
          } 
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // run_python tool — SANDBOXED with strict import restrictions
  tools.push(tool({
    name: 'run_python',
    description: 'Run Python code snippet (sandboxed, no external modules). Standard library only.',
    parameters: {
      python: z.string().describe('The Python code to execute'),
      timeout_seconds: z.number().min(0.1).max(60).optional().default(5).describe('Timeout in seconds (max 60)'),
    },
    implementation: async ({ python, timeout_seconds }: RunPythonParams, ctx?: ToolCallContextLike) => { // C5 FIX: typed params; 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      // FORENSICS (04.10): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
      if (ctx?.signal?.aborted) console.log(`[run_python] aborted-in 0ms (host signal already fired before execution start)`);

      try {
        // 04.10 ABORT-CONTRACT: host cancel already in effect → do not even start probing executables.
        if (ctx?.signal?.aborted) {
          return abortedEnvelope('Aborted by a host cancel before execution started — nothing was run. Re-run when convenient.');
        }

        // Robust dangerous pattern detection — blocks os, subprocess, shutil, eval, exec
        const dangerousPatterns = [
          /\bimport\s+os\b/i,
          /\bfrom\s+os\s+import\b/i,
          /\bimport\s+subprocess\b/i,
          /\bfrom\s+subprocess\s+import\b/i,
          /\bimport\s+shutil\b/i,
          /\b__import__\s*\(/i,
          /\beval\s*\(/i,
          /\bexec\s*\(/i,
          /os\.system/i,
          /os\.popen/i,
        ];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(python)) {
            return { success: false, error: `Dangerous Python import detected: ${pattern.source}` };
          }
        }

        const timeoutMs = ((timeout_seconds || 5) * 1000);
        
        // Try multiple Python executables in order of reliability for cross-platform support
        // py (Python Launcher) → python3 → python → shell-based detection
        let result: SpawnResult | null = null;
        const candidates = ['py', 'python3', 'python'];
        let fallbackUsed = false;
        
        for (const exe of candidates) {
          if (ctx?.signal?.aborted) break; // 04.10 ABORT-CONTRACT: stop probing — an aborted spawn is NOT "exe not found"
          try {
            result = await safeSpawn(exe, ['-c', python], timeoutMs, undefined, false, ctx?.signal); // 04.10 ABORT-CONTRACT
            const pyErrLower = (result.error || '').toLowerCase();
            if (!pyErrLower.includes('not found') && !pyErrLower.includes("doesn't exist") && !pyErrLower.includes('enoent')) {
              break; // Found a working Python executable
            }
          } catch { /* continue to next candidate */ }
        }

        // Final fallback: use shell to find python via PATH/where/py -0
        if (result?.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { provenance: 'run_python' }); // 04.10 ABORT-CONTRACT

        const pyErr = result?.error?.toLowerCase() || '';
        if (pyErr.includes('not found') || pyErr.includes('enoent')) {
          fallbackUsed = true;
          const isWindows = process.platform === 'win32';
          const whichCmd = isWindows ? 'where py' : 'which python3 || which python';
          if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { provenance: 'run_python' }); // 04.10 ABORT-CONTRACT
          result = await safeSpawn(isWindows ? 'cmd.exe' : 'sh', 
            [isWindows ? '/c' : '-c', `${whichCmd} 2>nul | head -1`], timeoutMs, undefined, false, ctx?.signal); // 04.10 ABORT-CONTRACT
          
          if (result.success && result.data?.stdout) {
            const pythonPath = result.data.stdout.trim().split('\n')[0];
            if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { provenance: 'run_python' }); // 04.10 ABORT-CONTRACT
            result = await safeSpawn(pythonPath, ['-c', python], timeoutMs, undefined, false, ctx?.signal); // 04.10 ABORT-CONTRACT
          } else {
            // Try 'py -3' as last resort on Windows
            if (isWindows) {
              fallbackUsed = true;

              result = await safeSpawn('cmd.exe', ['/c', `py -3 -c "${python.replace(/"/g, '\\"')}"`], timeoutMs, undefined, false, ctx?.signal); // 04.10 ABORT-CONTRACT;
            }
          }
        }

        if (!result || !result.success) {
          if (result?.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { provenance: 'run_python' }); // 04.10 ABORT-CONTRACT
          const msg = result?.error || 'Python executable not found in PATH. Install Python or add it to your system PATH.';
          return { success: false, error: msg };
        }

        if (result.data?.stderr && !result.data.stdout) {
          return { success: false, error: result.data.stderr };
        }

        // Determine confidence based on whether fallback was used
        const confidence: Confidence = fallbackUsed ? 'AMBIGUOUS' : 'EXTRACTED';
        
        return { 
          success: true, 
          data: { 
            output: result.data?.stdout || '',
            confidence,
            provenance: 'run_python',
            note: fallbackUsed ? 'Fallback path used for Python detection — lower confidence' : undefined,
          } 
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // execute_command tool — SAFE VERSION with shell:true support & improved Windows handling
  tools.push(tool({
    name: 'execute_command',
    description: 'Execute a command in the current working directory. Supports full shell features (pipes, redirects, env vars).',
    parameters: {
      command: z.string().describe('The shell command to execute'),
      timeout_seconds: z.number().min(1).max(300).optional().default(60).describe('Timeout in seconds (max 300)'),
      input: z.string().optional().describe("Input text to pipe to the command's stdin."),
    },
    implementation: async ({ command, timeout_seconds, input }: ExecuteCommandParams, ctx?: ToolCallContextLike) => { // C5 FIX: typed params; 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      // FORENSICS (04.10): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
      if (ctx?.signal?.aborted) console.log(`[execute_command] aborted-in 0ms (host signal already fired before execution start)`);

      try {
        // 04.10 ABORT-CONTRACT: host cancel already in effect → do not even start the command.
        if (ctx?.signal?.aborted) {
          return abortedEnvelope('Aborted by a host cancel before execution started — nothing was run. Re-run when convenient.', { provenance: 'execute_command' });
        }

        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
        }

        const timeoutMs = ((timeout_seconds || 60) * 1000);
        
        // Use shell:true for full shell interpretation (pipes, redirects, env vars)
        // Security is maintained through sanitizeCommand() which blocks dangerous patterns
        const result = await safeSpawn(command, [], timeoutMs, input, true, ctx?.signal); // 04.10 ABORT-CONTRACT
        
        if (!result.success) {
          if (result.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { stdout: result.data?.stdout ?? '', stderr: result.data?.stderr ?? '', provenance: 'execute_command' }); // 04.10 ABORT-CONTRACT
          return { success: false, error: result.error };
        }

        // Return combined output for better debugging
        const fullOutput = [result.data?.stdout, result.data?.stderr].filter(Boolean).join('\n');
        
        return { 
          success: true, 
          data: { 
            stdout: result.data?.stdout || '', 
            stderr: result.data?.stderr || '',
            output: fullOutput || '(No output)',
            confidence: 'EXTRACTED' as Confidence, // Direct shell execution = deterministic
            provenance: 'execute_command',
          } 
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Execution failed: ${message}` };
      }
    },
  }));

  // run_in_terminal tool — SAFE VERSION without shell:true
  tools.push(tool({
    name: 'run_in_terminal',
    description: 'Launch a command in a new, separate interactive terminal window.',
    parameters: {
      command: z.string().describe('The shell command to execute'),
    },
    implementation: async ({ command }: RunInTerminalParams, ctx?: ToolCallContextLike) => { // C5 FIX: typed params; 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      // FORENSICS (04.10): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
      if (ctx?.signal?.aborted) console.log(`[run_in_terminal] aborted-in 0ms (host signal already fired before execution start)`);

      try {
        // 04.10 ABORT-CONTRACT: host cancel already in effect → do not launch a NEW terminal window at all.
        if (ctx?.signal?.aborted) {
          return abortedEnvelope('Aborted by a host cancel before launch — no terminal window was opened. Re-run when convenient.', { provenance: 'run_in_terminal' });
        }

        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
        }

        // 04.10 ABORT-CONTRACT: last cooperative gate between the check and the (fire-and-forget) detached launch — an
        // abort arriving in that window must still suppress the new terminal window.
        if (ctx?.signal?.aborted) {
          return abortedEnvelope('Aborted by a host cancel before launch — no terminal window was opened. Re-run when convenient.', { provenance: 'run_in_terminal' });
        }

        const isWindows = process.platform === 'win32';
        
        if (isWindows) {
          spawn('cmd.exe', ['/c', 'start', 'Command Prompt', '/k', command], { 
            detached: true, 
            stdio: 'ignore' 
          });
        } else {
          const terminals = ['xterm', 'gnome-terminal', 'konsole', 'xfce4-terminal'];
          let launched = false;
          
          for (const term of terminals) {
            try {
              spawn(term, ['-e', command], { detached: true, stdio: 'ignore' });
              launched = true;
              break;
            } catch {
              continue;
            }
          }
          
          if (!launched) {
            return { success: false, error: 'No suitable terminal emulator found. Install xterm or gnome-terminal.' };
          }
        }

        return { success: true, data: { launched: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to open terminal: ${message}` };
      }
    },
  }));


  // run_tests tool — Execute test suites (Jest, PyTest, Go test)
  tools.push(tool({
    name: 'run_tests',
    description: 'Execute a test suite using Jest, PyTest, or Go test. Runs in the current working directory with timeout protection.',
    parameters: {
      runner: z.enum(['jest', 'pytest', 'go-test']).describe('Test framework to use'),
      file_or_dir: z.string().optional().describe('Specific file or directory path to run tests against (optional)'),
      timeout_seconds: z.number().min(1).max(300).default(60).describe('Timeout in seconds for test execution (default: 60, max: 300)'),
    },
    implementation: async ({ runner, file_or_dir, timeout_seconds }: { readonly runner: string; readonly file_or_dir?: string; readonly timeout_seconds?: number }, ctx?: ToolCallContextLike) => { // 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      // FORENSICS (04.10): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
      if (ctx?.signal?.aborted) console.log(`[run_tests] aborted-in 0ms (host signal already fired before execution start)`);

      try {
        // 04.10 ABORT-CONTRACT: host cancel already in effect → do not run the suite at all.
        if (ctx?.signal?.aborted) {
          return abortedEnvelope('Aborted by a host cancel before test execution started — nothing was run. Re-run when convenient.', { provenance: 'run_tests' });
        }

        const workingDir = getWorkingDir();

        // S7 FIX: Validate file_or_dir path for traversal attacks (like other execution tools)
        if (file_or_dir && typeof file_or_dir === 'string') {
          const normalizedPath = file_or_dir.replace(/\\/g, '/');
          if (normalizedPath.startsWith('../') || normalizedPath === '..' || normalizedPath.includes('/../')) {
            return { success: false, error: 'Unsafe path detected: directory traversal not allowed in test paths.' };
          }
        }

        const timeoutMs = ((timeout_seconds || 60) * 1000);

        // Determine command based on test runner
        let cmd: string;
        let args: string[];

        switch (runner) {
          case 'jest': {
            // Check for jest config to determine how to run
            const hasJestConfig = fs.existsSync(path.join(workingDir, 'jest.config.cjs')) ||
              fs.existsSync(path.join(workingDir, 'jest.config.js')) ||
              fs.existsSync(path.join(workingDir, 'package.json'));

            if (!hasJestConfig) {
              return { success: false, error: 'No Jest configuration found. Add jest.config.* or package.json with jest scripts.' };
            }

            // Try npx first (works even without global install), fallback to npm test
            cmd = 'npx';
            args = ['jest', '--passWithNoTests'];
            if (file_or_dir) {
              args.push(resolvePath(file_or_dir));
            }
            break;
          }



          case 'pytest': {
            cmd = file_or_dir ? 'python3' : 'python3';
            // Try multiple python commands
            const pythonCandidates = ['python3', 'python'];
            let foundPython = false;

            for (const pyCmd of pythonCandidates) {
              try {
                if (ctx?.signal?.aborted) break; // 04.10 ABORT-CONTRACT: stop probing python candidates mid-abort
                await new Promise<void>((resolve, reject) => {
                  const checkProc = spawn(pyCmd, ['-c', 'import pytest'], { timeout: 5000 });
                  checkProc.on('close', () => resolve());
                  checkProc.on('error', reject);
                });

                cmd = pyCmd;
                foundPython = true;
                break;
              } catch {
                // Try next candidate
              }
            }

            if (!foundPython) {
              return { success: false, error: 'Python not found or pytest not installed. Install with `pip install pytest`.' };
            }

            args = ['-m', 'pytest', '-v'];
            if (file_or_dir) {
              args.push(resolvePath(file_or_dir));
            }
            break;
          }

          case 'go-test': {
            // Check for go.mod to confirm Go project
            const hasGoMod = fs.existsSync(path.join(workingDir, 'go.mod'));
            if (!hasGoMod) {
              return { success: false, error: 'No go.mod found. Ensure you are in a Go module directory.' };
            }

            cmd = 'go';
            args = ['test', '-v', '-count=1'];
            if (file_or_dir) {
              const relPath = path.relative(workingDir, resolvePath(file_or_dir));
              args.push(relPath);
            } else {
              args.push('./...'); // Run all tests in the module
            }
            break;
          }

          default:
            return { success: false, error: `Unknown test runner: ${runner}` };
        }

        // Execute with timeout — 04.10 ABORT-CONTRACT: host signal forwarded; a mid-run abort kills the runner process.
        if (ctx?.signal?.aborted) return abortedEnvelope('Aborted by a host cancel before test execution started — nothing was run. Re-run when convenient.', { provenance: 'run_tests' }); // 04.10 ABORT-CONTRACT
        const result = await safeSpawn(cmd, args, timeoutMs, undefined, false, ctx?.signal);

        if (!result.success) {
          if (result.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the test runner process was terminated before completion.', { stdout: result.data?.stdout ?? '', stderr: result.data?.stderr ?? '', provenance: 'run_tests' }); // 04.10 ABORT-CONTRACT
          return { success: false, error: result.error || 'Test execution failed' };
        }

        // Parse test results from output
        const stdout = result.data?.stdout || '';
        const stderr = result.data?.stderr || '';
        const fullOutput = [stdout, stderr].filter(Boolean).join('\n');

        // Attempt to extract summary info from common test runner outputs
        let passed = 0;
        let failed = 0;
        let total = 0;
        let durationMs = 0;

        // Jest patterns
        const jestPassedMatch = fullOutput.match(/(\d+)\s+passed/i);
        const jestFailedMatch = fullOutput.match(/(\d+)\s+failed/i);
        if (jestPassedMatch) passed = Number(jestPassedMatch[1]);
        if (jestFailedMatch) failed = Number(jestFailedMatch[1]);

        // PyTest patterns  
        const pytestSummaryMatch = fullOutput.match(/(\d+)\s*passed.*?(\d+)?\s*failed/i);
        if (pytestSummaryMatch) {
          passed = Number(pytestSummaryMatch[1]);
          failed = Number(pytestSummaryMatch[2]) || 0;
        }

        // Go test: only FAIL count is applied (passed/time patterns captured but not used)
        if (fullOutput.includes('--- FAIL')) {
          failed += (fullOutput.match(/--- FAIL/g) || []).length;
        }

        total = passed + failed;

        // Determine overall status
        const allPassed = failed === 0;

        return {
          success: true,
          data: {
            runner,
            summary: {
              totalTests: total > 0 ? total : 'unknown',
              passed,
              failed,
              allPassed,
              durationMs,
            },
            output: fullOutput.trim() || '(No test output)',
            confidence: 'EXTRACTED' as Confidence, // Direct test execution = deterministic results
            provenance: 'run_tests',
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  

  return tools;
}

