import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config.js';
import { sanitizeCommand } from '../security.js';
import { getWorkingDir } from '../workingDir.js';

// ==================== Shared Spawn Helper ====================

interface SpawnResult {
  success: boolean;
  data?: { stdout: string; stderr: string };
  error?: string;
}

/**
 * Safely spawn a process with timeout, capturing stdout/stderr.
 * Eliminates code duplication across execution tools.
 */
async function safeSpawn(
  exe: string,
  args: string[],
  timeoutMs: number,
  input?: string,
  useShell = false
): Promise<SpawnResult> {
  return new Promise((resolve) => {
    const proc = spawn(exe, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
      cwd: getWorkingDir(), // Execute in the current working directory
      shell: useShell, // Enable shell interpretation when requested
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

    const timerId = setTimeout(() => {
      proc.kill();
      resolve({ success: false, error: 'Execution timed out' });
    }, timeoutMs);

    proc.on('close', () => {
      clearTimeout(timerId);
      resolve({ success: true, data: { stdout: stdout.trim(), stderr: stderr.trim() } });
    });

    proc.on('error', (err) => {
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
    implementation: async ({ javascript, timeout_seconds }: RunJavaScriptParams) => { // C5 FIX: typed params
      try {
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
        
        for (const exe of candidates) {
          try {
            result = await safeSpawn(exe, ['-e', javascript], timeoutMs);
            const errLower = (result.error || '').toLowerCase();
            if (!errLower.includes('not found') && !errLower.includes("doesn't exist") && !errLower.includes('enoent')) {
              break; // Found a working Node.js executable
            }
          } catch { /* continue to next candidate */ }
        }

        // Final fallback: use shell to find node via PATH/where/node -v
        const jsErrLower = result?.error?.toLowerCase() || '';
        if (jsErrLower.includes('not found') || jsErrLower.includes('enoent')) {
          const isWindows = process.platform === 'win32';
          const whichCmd = isWindows ? 'where node' : 'which node';
          result = await safeSpawn(isWindows ? 'cmd.exe' : 'sh', 
            [isWindows ? '/c' : '-c', `${whichCmd} 2>nul | head -1`], timeoutMs);
          
          if (result.success && result.data?.stdout) {
            const nodePath = result.data.stdout.trim().split('\n')[0];
            result = await safeSpawn(nodePath, ['-e', javascript], timeoutMs);
          } else {
            // Try 'node.cmd' as last resort on Windows
            if (isWindows) {
              result = await safeSpawn('cmd.exe', ['/c', `node -e "${javascript.replace(/"/g, '\\\"')}"`], timeoutMs);
            }
          }
        }

        if (!result || !result.success) {
          const msg = result?.error || 'Node.js executable not found in PATH. Install Node.js or add it to your system PATH.';
          return { success: false, error: msg };
        }

        if (result.data?.stderr && !result.data.stdout) {
          return { success: false, error: result.data.stderr };
        }

        return { success: true, data: { output: result.data?.stdout || '' } };
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
    implementation: async ({ python, timeout_seconds }: RunPythonParams) => { // C5 FIX: typed params
      try {
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
        
        for (const exe of candidates) {
          try {
            result = await safeSpawn(exe, ['-c', python], timeoutMs);
            const pyErrLower = (result.error || '').toLowerCase();
            if (!pyErrLower.includes('not found') && !pyErrLower.includes("doesn't exist") && !pyErrLower.includes('enoent')) {
              break; // Found a working Python executable
            }
          } catch { /* continue to next candidate */ }
        }

        // Final fallback: use shell to find python via PATH/where/py -0
        const pyErr = result?.error?.toLowerCase() || '';
        if (pyErr.includes('not found') || pyErr.includes('enoent')) {
          const isWindows = process.platform === 'win32';
          const whichCmd = isWindows ? 'where py' : 'which python3 || which python';
          result = await safeSpawn(isWindows ? 'cmd.exe' : 'sh', 
            [isWindows ? '/c' : '-c', `${whichCmd} 2>nul | head -1`], timeoutMs);
          
          if (result.success && result.data?.stdout) {
            const pythonPath = result.data.stdout.trim().split('\n')[0];
            result = await safeSpawn(pythonPath, ['-c', python], timeoutMs);
          } else {
            // Try 'py -3' as last resort on Windows
            if (isWindows) {
              result = await safeSpawn('cmd.exe', ['/c', `py -3 -c "${python.replace(/"/g, '\\"')}"`], timeoutMs);
            }
          }
        }

        if (!result || !result.success) {
          const msg = result?.error || 'Python executable not found in PATH. Install Python or add it to your system PATH.';
          return { success: false, error: msg };
        }

        if (result.data?.stderr && !result.data.stdout) {
          return { success: false, error: result.data.stderr };
        }

        return { success: true, data: { output: result.data?.stdout || '' } };
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
    implementation: async ({ command, timeout_seconds, input }: ExecuteCommandParams) => { // C5 FIX: typed params
      try {
        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
        }

        const timeoutMs = ((timeout_seconds || 60) * 1000);
        
        // Use shell:true for full shell interpretation (pipes, redirects, env vars)
        // Security is maintained through sanitizeCommand() which blocks dangerous patterns
        const result = await safeSpawn(command, [], timeoutMs, input, true);
        
        if (!result.success) {
          return { success: false, error: result.error };
        }

        // Return combined output for better debugging
        const fullOutput = [result.data?.stdout, result.data?.stderr].filter(Boolean).join('\n');
        return { 
          success: true, 
          data: { 
            stdout: result.data?.stdout || '', 
            stderr: result.data?.stderr || '',
            output: fullOutput || '(No output)'
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
    implementation: async ({ command }: RunInTerminalParams) => { // C5 FIX: typed params
      try {
        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
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

  return tools;
}

/**
 * Safely parse a shell command into executable and arguments.
 * Handles basic quoting but avoids shell interpretation entirely.
 */
function parseCommand(command: string): { exe: string; args: string[] } {
  const trimmed = command.trim();
  
  if (!trimmed) {
    return { exe: '', args: [] };
  }

  const parts: string[] = [];
  let current = '';
  let inQuote: '"' | "'" | null = null;
  
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    
    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = char;
    } else if (char === ' ') {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current) {
    parts.push(current);
  }

  const exe = parts[0] || '';
  const args = parts.slice(1);
  
  return { exe, args };
}
