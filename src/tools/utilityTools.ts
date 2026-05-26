import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config.js';
import type { StateManager } from '../stateManager.js';

// ==================== Typed Params Interfaces ====================

interface NotifyOptions {
  title?: string;
  msg?: string;
  sound?: boolean | string;
  icon?: string;
  [key: string]: unknown;
}

type SaveMemoryParams = { fact: string; };
type ReadClipboardParams = Record<string, never>;
type WriteClipboardParams = { content: string; };
type SendNotificationParams = { title: string; message: string; icon?: string; };

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

/**
 * Cross-platform clipboard operations using system commands.
 */

// S6 FIX: Proper escaping for shell injection prevention
function escapeForPowerShell(content: string): string {
  // Escape double quotes and dollar signs (which trigger variable expansion in PS)
  return content.replace(/"/g, '\\"').replace(/\$/g, '\\$');
}

function escapeForBash(content: string): string {
  // Escape single quotes by ending the quote, adding escaped quote, re-opening quote
  return content.replace(/'/g, "'\\''");
}

async function readClipboard(): Promise<string> {
  const platform = os.platform();
  
  return new Promise((resolve, reject) => {
    let cmd: string;
    let args: string[];
    
    switch (platform) {
      case 'win32':
        // Windows PowerShell
        cmd = 'powershell.exe';
        args = ['-NoProfile', '-Command', '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-Clipboard -Raw'];
        break;
      case 'darwin':
        // macOS pbpaste
        cmd = '/bin/bash';
        args = ['-c', 'pbpaste'];
        break;
      default:
        // Linux xclip or xsel
        cmd = '/bin/bash';
        args = ['-c', '(xclip -selection clipboard -o 2>/dev/null || xsel --clipboard --output 2>/dev/null) | tr -d \'\\0\''];
        break;
    }

    const proc = spawn(cmd, args);
    
    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && stdout.trim()) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Clipboard read failed (exit code ${code}): ${stderr || 'No clipboard content'}`));
      }
    });

    proc.on('error', reject);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      proc.kill();
      reject(new Error('Clipboard read timed out'));
    }, 5000);
  });
}

// S6 FIX: Proper escaping to prevent shell injection in clipboard write
async function writeClipboard(content: string): Promise<void> {
  const platform = os.platform();
  
  return new Promise((resolve, reject) => {
    let cmd: string;
    let args: string[];
    
    switch (platform) {
      case 'win32':
        // Windows PowerShell with Set-Clipboard — S6 FIX: Proper escaping
        const escapedContent = escapeForPowerShell(content);
        cmd = 'powershell.exe';
        args = ['-NoProfile', '-Command', `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; "${escapedContent}" | Set-Clipboard`];
        break;
      case 'darwin':
        // macOS pbcopy — S6 FIX: Proper escaping
        const escapedBash = escapeForBash(content);
        cmd = '/bin/bash';
        args = ['-c', `echo -n '${escapedBash}' | pbcopy`];
        break;
      default:
        // Linux xclip or xsel — S6 FIX: Proper escaping
        const escapedLinux = escapeForBash(content);
        cmd = '/bin/bash';
        args = ['-c', `echo -n '${escapedLinux}' | (xclip -selection clipboard 2>/dev/null || xsel --clipboard --input 2>/dev/null)`];
        break;
    }

    const proc = spawn(cmd, args);
    
    let stderr = '';

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Clipboard write failed (exit code ${code}): ${stderr}`));
      }
    });

    proc.on('error', reject);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      proc.kill();
      reject(new Error('Clipboard write timed out'));
    }, 5000);
  });
}

/**
 * Find LM Studio installation directory across platforms.
 */
function findLMStudioHome(): string | null {
  const platform = os.platform();
  
  // Common paths to check
  const candidates: string[] = [];
  
  switch (platform) {
    case 'win32':
      candidates.push(
        path.join(process.env.APPDATA || '', 'lm-studio'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'lm-studio'),
        path.join(process.env.PROGRAMFILES || '', 'LM Studio'),
        path.join(process.env['PROGRAMDATA'] || '', 'LM Studio')
      );
      break;
    case 'darwin':
      candidates.push(
        path.join(os.homedir(), 'Library', 'Application Support', 'lm-studio'),
        '/Applications/LM Studio.app/Contents/Resources/app.asar'
      );
      break;
    default: // Linux
      candidates.push(
        path.join(os.homedir(), '.local', 'share', 'lm-studio'),
        '/opt/lm-studio',
        path.join(process.env.HOME || '', '.lm-studio')
      );
      break;
  }

  
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // Skip inaccessible paths
    }
  }
  
  return null;
}

export function registerUtilityTools(config: PluginConfig, stateManager: StateManager, getEnabledTools?: () => string[]): Tool[] {
  const tools: Tool[] = [];

  // save_memory tool
  tools.push(tool({
    name: 'save_memory',
    description: 'Save a specific piece of information or fact to long-term memory.',
    parameters: {
      fact: z.string().min(1).describe('The specific fact or piece of information to remember.'),
    },
    implementation: async ({ fact }: SaveMemoryParams) => { // C5 FIX: typed params
      try {
        stateManager.set(`memory_${Date.now()}`, fact);
        return { success: true, data: { saved: true } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // get_system_info tool
  tools.push(tool({
    name: 'get_system_info',
    description: 'Get information about the system (OS, CPU, Memory).',
    parameters: {},
    implementation: async () => {
      try {
        return {
          success: true,
          data: {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            hostname: os.hostname(),
            release: os.release(),
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get system info: ${message}` };
      }
    },
  }));

  // read_clipboard tool - IMPLEMENTED
  tools.push(tool({
    name: 'read_clipboard',
    description: 'Read text content from the system clipboard.',
    parameters: {},
    implementation: async (_params: ReadClipboardParams) => { // C5 FIX: typed params (empty object)
      try {
        const content = await readClipboard();
        return { success: true, data: { content } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // write_clipboard tool - IMPLEMENTED
  tools.push(tool({
    name: 'write_clipboard',
    description: 'Write text content to the system clipboard.',
    parameters: {
      content: z.string().describe('The text content to write to clipboard'),
    },
    implementation: async ({ content }: WriteClipboardParams) => { // C5 FIX: typed params
      try {
        await writeClipboard(content);
        return { success: true, data: { written: true } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // send_notification tool - IMPLEMENTED using node-notifier
  tools.push(tool({
    name: 'send_notification',
    description: 'Send a system notification to the user.',
    parameters: {
      title: z.string().describe('Notification title'),
      message: z.string().describe('Notification message'),
      icon: z.string().optional().describe('Optional custom icon path'),
    },
    implementation: async ({ title, message, icon }: SendNotificationParams) => { // C5 FIX: typed params
      try {
         
        const notifierModule = await import('node-notifier');
         
        const notifier = notifierModule.default || notifierModule;

        const options: NotifyOptions = {
          title: title || 'AI Toolbox',
          msg: message || '',
          sound: true, // Include sound on macOS
        };

        if (icon) {
          options.icon = icon;
        }

        notifier(options);

        return { success: true, data: { sent: true, title, message } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to send notification: ${message}` };
      }
    },
  }));

  // findLMStudioHome tool - IMPLEMENTED
  tools.push(tool({
    name: 'findLMStudioHome',
    description: 'Locate LM Studio installation directory across platforms.',
    parameters: {},
    implementation: async () => {
      try {
        const homeDir = findLMStudioHome();
        
        if (homeDir) {
          return {
            success: true,
            data: {
              found: true,
              path: homeDir,
              platform: os.platform(),
            },
          };
        } else {
          // Provide common paths for manual reference
          const commonPaths = [
            'Windows: %APPDATA%\\lm-studio',
            'macOS: ~/Library/Application Support/lm-studio',
            'Linux: ~/.local/share/lm-studio'
          ].join('\n');

          return {
            success: false,
            error: `LM Studio home directory not found.\n\nCommon paths:\n${commonPaths}`,
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to find LM Studio home: ${message}` };
      }
    },
  }));

  // get_enabled_tools tool
  tools.push(tool({
    name: 'get_enabled_tools',
    description: 'Get list of currently enabled tools based on configuration.',
    parameters: {},
    implementation: async () => {
      try {
        if (getEnabledTools) {
          const toolNames = getEnabledTools();
          return { success: true, data: { toolCount: toolNames.length, tools: toolNames } };
        } else {
          return { success: false, error: 'Registry access not available' };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get enabled tools: ${message}` };
      }
    },
  }));

  return tools;
}


// ==================== CURRENT WORKING DIRECTORY TOOL ====================

/**
 * Get the current working directory.
 * This allows the LLM to know where relative paths will be resolved.
 */
type GetCurrentWorkingDirectoryParams = Record<string, never>;

export function registerGetCurrentWorkingDirectoryTool(): Tool[] {
  return [
    tool({
      name: 'get_current_working_directory',
      description: 'Get the current working directory. Use this before generating file operations with relative paths to ensure you know where files will be created/modified.',
      parameters: {},
      implementation: async () => {
        // Import here to avoid circular dependency
        const { getWorkingDir } = require('../workingDir.js');
        return {
          success: true,
          data: {
            current_working_directory: getWorkingDir()
          }
        };
      },
    }),
  ];
}
