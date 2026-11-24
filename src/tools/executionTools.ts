import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config.js';
import { sanitizePowerShellScript, sanitizeCommand } from '../security.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';
import type { Confidence } from '../types/confidenceTypes.js';

/** 18.11 (owner GO): shell binary resolution for run_powershell — prefer pwsh 7.x when installed, fall back to the built-in Windows PowerShell 5.1.
 * The canonical install path is checked BEFORE any PATH walk on purpose: %LOCALAPPDATA%\Microsoft\WindowsApps\pwsh.exe is a Store App Execution
 * Alias that can exist without PowerShell 7 actually being installed (spawning it opens Microsoft Store, not a shell) — so Program Files wins and
 * WindowsApps entries are excluded from the PATH scan entirely. Resolved once per process (module cache; deterministic for tests via env + fs mocks). */
let cachedShellExe: string | null = null;
export function resolveShellExe(): string {
  if (cachedShellExe) return cachedShellExe;
  const candidates: string[] = [];
  const programFiles = process.env['ProgramFiles'] ?? 'C:\\Program Files';
  candidates.push(path.join(programFiles, 'PowerShell', '7', 'pwsh.exe'));
  for (const dir of (process.env.PATH ?? '').split(';')) {
    if (!dir || /windowsapps/i.test(dir)) continue; // Store alias trap — never resolve into App Execution Aliases
    candidates.push(path.join(dir, 'pwsh.exe'), path.join(dir, 'pwsh'));
  }
  const found = candidates.find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });
  cachedShellExe = found ?? 'powershell.exe'; // fallback: built-in Windows PowerShell (5.1) — always present on Windows
  return cachedShellExe;
}

/** Test hook: reset the per-process shell resolution cache so suites can re-resolve under mocked env/fs. */
export function resetShellResolveCacheForTests(): void {
  cachedShellExe = null;
}

// ==================== Shared Spawn Helper ====================

interface SpawnResult {
  success: boolean;
  /** code = child exit code, present ONLY on a clean 'close' (never set by abort/timeout/settle paths). */
  data?: { stdout: string; stderr: string; code?: number };
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

    // 24.11 ENV-ENRICHMENT (owner GO, measured on this host): the LM Studio/Electron host hands children a REDUCED env block —
    // the run_powershell child had only 18 variables with APPDATA and LOCALAPPDATA absent, so any script using $env:APPDATA /
    // %APPDATA% broke SILENTLY (empty path → CWD-relative operations). Additively complete those two from USERPROFILE (stable
    // Windows layout; injected ONLY when the derived directory exists), never overwrite values already present. POSIX unchanged,
    // computed per call so a host env change inside a long-lived process is picked up; zero-object cost when nothing is missing.
    let spawnEnv: NodeJS.ProcessEnv | undefined;
    if (process.platform === 'win32') {
      const userProfile = process.env['USERPROFILE'];
      if (userProfile) {
        const additions: [string, string][] = [];
        const appDataDir = path.join(userProfile, 'AppData', 'Roaming');
        const localDataDir = path.join(userProfile, 'AppData', 'Local');
        if (!process.env.APPDATA && fs.existsSync(appDataDir)) additions.push(['APPDATA', appDataDir]);
        if (!process.env.LOCALAPPDATA && fs.existsSync(localDataDir)) additions.push(['LOCALAPPDATA', localDataDir]);
        if (additions.length > 0) spawnEnv = { ...process.env, ...Object.fromEntries(additions) };
      }
    }
    const proc = spawn(cmdToRun, spArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
      cwd: getWorkingDir(), // Execute in the current working directory
      ...(process.platform === 'win32' && useShell ? { shell: true as const } : {}), // win32 only — see GATE-4 comment above; POSIX spawn unchanged (isWindows is block-scoped above)
      ...(spawnEnv ? { env: spawnEnv } : {}), // 24.11 ENV-ENRICHMENT: completed Windows user-env copy, undefined = inherit host env as before
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
      // 24.11 TIMEOUT-HYGIENE (owner GO): best-effort TREE kill on win32 like the abort path — a bare proc.kill() only terminates
      // the DIRECT child (cmd.exe under shell:true) and leaves native grandchildren (pwsh, node, …) orphaned after a timeout;
      // taskkill /T is best-effort per house idiom (see settleAborted above). POSIX unchanged.
      if (process.platform === 'win32' && typeof proc.pid === 'number') {
        try { spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }).on('error', () => {}); } catch { /* best-effort */ }
      }
      // 24.11 TIMEOUT-HYGIENE (owner GO): partial captured output RIDES ALONG on timeout — same house style as the abort path. Before this fix a timeout envelope carried ZERO stdout/stderr, indistinguishable from "wrapper swallowed everything" (>60s scripts reported 'Execution timed out' with no early output at all).
      resolve({ success: false, error: `Execution timed out after ${Math.round(timeoutMs / 1000)}s — partial captured output included if any.`, data: { stdout: stdout.trim(), stderr: stderr.trim() } });
    }, timeoutMs);

    proc.on('close', (code: number | null) => {
      // 04.10 ABORT-CONTRACT: after an aborted (or timeout) kill the child still emits 'close' — that close must NOT
      // report success; `settled` covers the race window where the settle path already resolved.
      if (settled || controller.signal.aborted) return;
      settled = true;
      clearTimeout(timerId);
      // 16.11 F-PS2 fix: surface the child exit code (clean-close only) so callers can report it — additive, never
      // changes success semantics (non-zero exit ≠ failed run for probe/diff-style scripts; see house decision 16.11).
      resolve({ success: true, data: { stdout: stdout.trim(), stderr: stderr.trim(), ...(typeof code === 'number' ? { code } : {}) } });
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
interface RunPowerShellParams { script: string; timeout_seconds?: number; input?: string; }


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
    description: 'Execute a command in the current working directory via cmd.exe (Windows) / sh (POSIX). Supports full shell features (pipes, redirects, env vars). On Windows prefer run_powershell for shell/CLI tasks — use this tool there only when cmd-specific behavior is required.',
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
          // 24.11 TIMEOUT-HYGIENE (owner GO): non-abort failures carrying captured partial output (the timeout path) surface the streams — a bare error string must not hide early work again.
          return { success: false, error: result.error, ...(result.data ? { stdout: result.data.stdout, stderr: result.data.stderr } : {}) };
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

  

    // run_powershell tool — PowerShell execution on win32 via cmd-intermediated spawn (B1a, owner GO 18.11): the full command line travels as ONE shell-parsed string with useShell=true (contract comment in the handler below); F-PS1/F-PS2 unchanged
  // F-PS1 fix (16.11 ~21:4x, owner GO): PS 5.1 writes redirected stdout/stderr in the OEM console codepage — measured on a
  // de-DE host: "äöüß€" → bytes 0x84 0x94 0x81 0xE1 0x3F (cp850) while Node decodes UTF-8 → U+FFFD mojibake for every
  // non-ASCII output AND every localized error message. This prelude switches console + pipeline encoding to UTF-8 for the
  // whole session BEFORE user code runs. Verified byte-exact on this machine: plain scripts, leading-newline/indent shapes
  // (LLM style) and piped stdin all stay valid; -EncodedCommand was REJECTED (only encodes the INPUT script — output stayed
  // OEM — plus spurious CLIXML blobs on stderr). Cost: ~90 chars per call; zero behavior change beyond readable output.
  const PS_UTF8_PRELUDE = 'try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}; ';

  // Design decision (16.11, sharpened by owner GO same day ~19:35): stays SEPARATE from execute_command;
  // PowerShell ALWAYS has priority on Windows for shell/CLI tasks — enforced on DESCRIPTION level only
  // (+ tier 'high' in toolPriority.ts so budget filtering never drops it before execute_command), not via
  // runtime shell fallback: one tool = one dialect anchor, no AMBIGUOUS semantics, zero regression on the shipped default.
  tools.push(tool({
    name: 'run_powershell',
    description: 'The PREFERRED shell tool on WINDOWS (owner priority, 16.11): run any CLI/shell task as a PowerShell script via the resolved shell binary — pwsh 7.x preferred when installed, Windows PowerShell 5.1 as fallback (auto-resolved once per process; result data carries the resolved `shell` path). On Windows the invocation runs through cmd /s (measured fix for silent grandchild death under a direct Electron→pwsh spawn); your script travels as ONE double-quoted -Command argument whose inner double quotes are escaped (\" reaches PowerShell byte-exact), cmd metacharacters (& | < > ^) are inert in it, and only %VAR% pairs are expanded by cmd before the script runs — use single-quoted literals or $env:-style PS syntax to avoid accidental expansion. Always prefer this over wrapping PowerShell in execute_command for .NET APIs (e.g. GDI+/WIC), CIM/WMI queries, PS-semantics file operations and general shell work on Windows. Runs with -NoProfile -NonInteractive -NoLogo; Windows PowerShell 5.1 syntax. Uses your normal ExecutionPolicy — for a policy bypass use execute_command instead.',
    parameters: {
      script: z.string().describe('PowerShell code to execute (statements / script block)'),
      timeout_seconds: z.number().min(1).max(300).optional().default(60).describe('Timeout in seconds (max 300)'),
      input: z.string().optional().describe("Input text to pipe to the script's stdin."),
    },
    implementation: async ({ script, timeout_seconds, input }: RunPowerShellParams, ctx?: ToolCallContextLike) => { // C5 FIX typed params; 04.10 ABORT-CONTRACT: host abort signal (2nd impl param per SDK contract)
      // FORENSICS (house idiom): make host-originated pre-aborts observable in main.log — same gap class as ripgrep/pattern_scan.
      if (ctx?.signal?.aborted) console.log(`[run_powershell] aborted-in 0ms (host signal already fired before execution start)`);

      try {
        // 04.10 ABORT-CONTRACT: host cancel already in effect → do not even start the process.
        if (ctx?.signal?.aborted) {
          return abortedEnvelope('Aborted by a host cancel before execution started — nothing was run. Re-run when convenient.', { provenance: 'run_powershell' });
        }

        // Windows-only tool: powershell.exe does not exist on POSIX hosts — fail fast, no probing.
        if (process.platform !== 'win32') {
          return { success: false, error: 'run_powershell is Windows-only.' };
        }

        // 16.11 (owner GO): PS-aware sanitization profile — the script goes to pwsh as ONE -Command argument, so cmd/sh heuristics
        // (`;`, backtick pairs, $(), pipe caps) are replaced by PowerShell-native checks (see src/security.ts). NOTE: on win32 the line
        // is still cmd-PARSED first (B1a), so the script text must survive a single standard parse — see the spawn comment below.
        const sanitized = sanitizePowerShellScript(script);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe PowerShell script detected: ${sanitized.reason}` };
        }

        // B1a (owner GO 18.11 — npm-shim-Arc): win32 cmd-intermediated spawn. MEASURED on this host: a DIRECT Electron→pwsh spawn
        // silently kills every NATIVE grandchild the script starts (npm/npx .ps1 shims, node.exe --version, even `cmd /c echo`) — stdout
        // lost and $LASTEXITCODE never set, so the tool reported success+0 for dead work; the same line under a cmd parent works
        // (A/B isolation: v26.13.0 + exit 0). Root cause sits in console/stdio plumbing of PowerShell under a GUI parent — not fully
        // proven, but the cmd intermediate layer is measured effective, so it becomes the product contract (house style: measure, then fix).
        // Mechanics (characterized via %CMDCMDLINE%, GATE-4): safeSpawn(win32, useShell=true) passes this ONE string to Node's shell
        // path → Node wraps it in exactly one quote pair; cmd /d /s /c strips that outer pair and parses the remainder by standard
        // rules — so the double-quoted -Command argument reaches pwsh as ONE token and PowerShell delivers the script byte-exact.
        // Accepted trade-off (documented in the tool description): cmd expands %VAR% inside that text, and cmd metacharacters (& | < > ^)
        // are active there — scripts must avoid them or quote literals single-quoted; exit codes: pwsh propagates -Command exit N on 7.x,
        // 5.1 clamps to 5 (F-PS2 surface unchanged). POSIX never reaches this line (tool fails fast above) — no behavioral change off-Windows.
        // 20.11 FIX (spaced-path defect, measured live on this host): resolveShellExe() returns ABSOLUTE paths that may contain spaces —
        // the canonical pwsh location C:\Program Files\PowerShell\7\pwsh.exe is exactly one, i.e. EVERY standard install. Unquoted in the
        // cmd-parsed B1a line it fragments at cmd tokenization into "C:\Program" + remainder → 'Der Befehl "C:\Program" ist entweder falsch
        // geschrieben oder konnte nicht gefunden werden', exit 1 — the script never reaches PowerShell (repro: tmp_ps_debug_probe.cjs, A/B vs C/D).
        // Fix = wrap the path in double quotes ONLY when it contains whitespace: space-free paths (powershell.exe fallback) stay byte-identical to the
        // pre-fix line (all existing pins untouched); the quoted form was measured green end-to-end. cmd's /d /s outer-pair stripping is unaffected —
        // the quoted path survives as ONE token, the -Command payload keeps its own quote pair byte-exact (B1a contract unchanged).
        const shellExe = resolveShellExe();
        const quotedShell = /\s/.test(shellExe) ? `"${shellExe}"` : shellExe;
        // 20.11 B1b (measured live on this host — successor to the spaced-path fix above): double quotes INSIDE the script
        // previously CLOSED cmd's -Command quote window early: everything after the first embedded " was parsed by cmd as a
        // SEPARATE token stream and PowerShell received a fragmented, truncated argument set (repro 20.11 17:3x: git -C with a
        // quoted spaced path → 'cannot change to C:\Source'; any embedded quote pair also hung pwsh until tool timeout).
        // Fix = backslash-escape every " of the prelude+script text before embedding it in the ONE double-quoted -Command token.
        // Round-trip: cmd's standard parse keeps the escaped pair INSIDE the window (the \" is not a delimiter to cmd), and
        // PowerShell's own tokenizer then unescapes \" → " exactly once — pwsh therefore receives the script BYTE-EXACT again,
        // this time through a properly closed single -Command argument. Side benefit (measured): with the window properly closed,
        // cmd metacharacters (& | < > ^) are INERT in the payload — they no longer act as command separators even though they sit
        // inside PowerShell string literals. Trade-off UNCHANGED from B1a: cmd still expands %VAR% pairs before pwsh ever sees
        // them (documented in the tool description). Scripts WITHOUT double quotes stay byte-identical to pre-fix lines (all
        // existing pins untouched — escape is a no-op there by construction).
        const psPayload = PS_UTF8_PRELUDE + script.replace(/"/g, '\\"');
        const result = await safeSpawn(`${quotedShell} -NoProfile -NonInteractive -NoLogo -Command "${psPayload}"`, [], ((timeout_seconds || 60) * 1000), input, true /*useShell — B1a/B1b: cmd-intermediated spawn (see contract comments above)*/, ctx?.signal); // 04.10 ABORT-CONTRACT

        if (!result.success) {
          if (result.aborted) return abortedEnvelope('Aborted by a host cancel mid-run — the child process was terminated before completion.', { stdout: result.data?.stdout ?? '', stderr: result.data?.stderr ?? '', provenance: 'run_powershell' }); // 04.10 ABORT-CONTRACT
          // 24.11 TIMEOUT-HYGIENE (owner GO): non-abort failures carrying captured partial output (the timeout path) surface the streams — a bare error string must not hide early work again.
          return { success: false, error: result.error, ...(result.data ? { stdout: result.data.stdout, stderr: result.data.stderr } : {}) };
        }

        const fullOutput = [result.data?.stdout, result.data?.stderr].filter(Boolean).join('\n');
        // F-PS2 fix (16.11 ~21:4x, owner GO — option a): surface the child exit code; success semantics UNCHANGED
        // (non-zero ≠ failed run for probe/diff-style scripts), but the model gets the full verdict data instead of guessing.
        const exitCode = typeof result.data?.code === 'number' ? result.data.code : 0;

        return {
          success: true,
          data: {
            stdout: result.data?.stdout || '',
            stderr: result.data?.stderr || '',
            output: fullOutput || '(No output)',
            exitCode,
            ...(exitCode !== 0 ? { note: `PowerShell exited with code ${exitCode} — inspect the captured streams before treating this as a failure.` } : {}),
            confidence: 'EXTRACTED' as Confidence, // Direct spawn = deterministic
            shell: resolveShellExe(), provenance: 'run_powershell',
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  return tools;
}

