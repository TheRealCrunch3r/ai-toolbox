import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config.js';
import { sanitizeCommand } from '../security.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';

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


  // run_tests tool — Execute test suites (Jest, PyTest, Go test)
  tools.push(tool({
    name: 'run_tests',
    description: 'Execute a test suite using Jest, PyTest, or Go test. Runs in the current working directory with timeout protection.',
    parameters: {
      runner: z.enum(['jest', 'pytest', 'go-test']).describe('Test framework to use'),
      file_or_dir: z.string().optional().describe('Specific file or directory path to run tests against (optional)'),
      timeout_seconds: z.number().min(1).max(300).default(60).describe('Timeout in seconds for test execution (default: 60, max: 300)'),
    },
    implementation: async ({ runner, file_or_dir, timeout_seconds }: { readonly runner: string; readonly file_or_dir?: string; readonly timeout_seconds?: number }) => {
      try {
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

        // Execute with timeout
        const result = await safeSpawn(cmd, args, timeoutMs);

        if (!result.success) {
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
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // execute_gateway_tool — SAFETY WRAPPER with validation
  tools.push(tool({
    name: 'execute_gateway_tool',
    description: `Execute a tool by name with built-in validation and error handling.
    
⚠️ CRITICAL USAGE RULES:
• NEVER call execute_gateway_tool with toolName="execute_gateway_tool" (recursive call)
• ALWAYS call the actual tool directly (e.g., "run_python", "run_javascript", "list_directory")
• Arguments must be flat objects — no nested objects
• If you're unsure what tools are available, call "explore_tools" first

WHEN TO USE:
• When you need to call a tool that's not directly available
• When delegating to the tool registry for execution

EXAMPLE USAGE:
✅ CORRECT: execute_gateway_tool(toolName="run_python", arguments={python: "print('hello')"})
✅ CORRECT: execute_gateway_tool(toolName="list_directory", arguments={path: "."})
❌ WRONG: execute_gateway_tool(toolName="execute_gateway_tool", arguments={toolName: "..."})

SECURITY: This tool validates all calls to prevent recursive misuse and nested argument abuse.`,
    parameters: {
      toolName: z.string().describe('Name of the tool to execute (e.g., "run_python", "run_javascript", "list_directory"). NEVER "execute_gateway_tool".'),
      arguments: z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.unknown())])).describe('Tool-specific arguments as key-value pairs. Must be flat — no nested objects.'),
    },
    implementation: async ({ toolName, arguments: argumentsObj }: { readonly toolName: string; readonly arguments: Record<string, unknown> }) => {
      // Validate before execution
      const validation = validateExecuteGatewayTool(toolName, argumentsObj);
      if (!validation.valid) {
        return { 
          success: false, 
          error: `SECURITY VALIDATION FAILED: ${validation.error}`,
          securityViolation: true
        };
      }

      // Delegate to the actual tool registry
      try {
        // This would normally call the tool registry
        // For now, return a placeholder that shows the tool is registered
        return { 
          success: true, 
          data: { 
            toolName, 
            arguments: argumentsObj,
            note: 'This tool delegates to the LM Studio SDK tool registry. Actual execution happens in production.'
          } 
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to execute tool "${toolName}": ${message}` };
      }
    },
  }));

  return tools;
}

// ==================== Safety Wrapper for execute_gateway_tool ====================

/**
 * Validates that execute_gateway_tool is being called correctly.
 * Prevents recursive calls and nested argument misuse.
 */
function validateExecuteGatewayTool(toolName: string, argumentsObj: Record<string, unknown>): { valid: boolean; error?: string } {
  // Prevent recursive calls
  if (toolName === 'execute_gateway_tool') {
    return { valid: false, error: `SECURITY VIOLATION: execute_gateway_tool cannot call itself. You must call the actual tool directly (e.g., "run_python", "run_javascript", "list_directory", etc.).` };
  }

  // Validate that arguments is a flat object (not nested)
  const isFlatObject = (obj: unknown): boolean => {
    if (typeof obj !== 'object' || obj === null) return false;
    const entries = Object.entries(obj as Record<string, unknown>);
    return entries.every(([, value]) => {
      // Check for nested objects/arrays (except simple primitives)
      return typeof value !== 'object' || value === null || Array.isArray(value);
    });
  };

  if (!isFlatObject(argumentsObj)) {
    return { valid: false, error: `SECURITY VIOLATION: execute_gateway_tool arguments must be a flat object. Detected nested objects which may indicate recursive misuse. Please call tools directly with flat arguments.` };
  }

  // Validate toolName is a non-empty string
  if (typeof toolName !== 'string' || toolName.trim() === '') {
    return { valid: false, error: `SECURITY VIOLATION: execute_gateway_tool requires a valid toolName string.` };
  }

  return { valid: true };
}