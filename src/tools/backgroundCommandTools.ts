import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';
import type { BackgroundCommandManager } from '../backgroundCommands.js';
import { sanitizeCommand } from '../security.js';

// ==================== Typed Params Interfaces ====================

interface RunBackgroundCommandParams { command: string; timeout_hours: number; name: string; }
interface CheckBackgroundCommandParams { id: string; }
interface CancelBackgroundCommandParams { id: string; }

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

export function registerBackgroundCommandTools(config: PluginConfig, backgroundCommandManager: BackgroundCommandManager): Tool[] {
  const tools: Tool[] = [];

  // run_background_command tool
  tools.push(tool({
    name: 'run_background_command',
    description: 'Start a long-running process in the background. The process is not blocked.',
    parameters: {
      command: z.string().describe('The shell command to execute'),
      timeout_hours: z.number().min(0.1).max(10).describe('MANDATORY: How long the process is allowed to run before being killed.'),
      name: z.string().describe('MANDATORY: A short, descriptive name for the background task'),
    },
    // SDK requires async implementation
    implementation: async ({ command, timeout_hours, name }: RunBackgroundCommandParams) => { // C5 FIX: typed params
      try {
        // Security check - use robust sanitization instead of simple string matching
        const sanitized = sanitizeCommand(command);
        if (!sanitized.safe) {
          return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
        }
        
        const id = backgroundCommandManager.register(command, timeout_hours, name);
        return { success: true, data: { id, name, command, timeoutHours: timeout_hours } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // check_background_command tool
  tools.push(tool({
    name: 'check_background_command',
    description: 'Check the status, stdout, and stderr of a running or completed background command.',
    parameters: {
      id: z.string().describe('The command identifier'),
    },
    // SDK requires async implementation
    implementation: async ({ id }: CheckBackgroundCommandParams) => { // C5 FIX: typed params
      try {
        const command = backgroundCommandManager.check(id);
        if (!command) {
          return { success: false, error: `Command not found: ${id}` };
        }
        return { success: true, data: command };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // cancel_background_command tool
  tools.push(tool({
    name: 'cancel_background_command',
    description: 'Kill a running background command.',
    parameters: {
      id: z.string().describe('The command identifier'),
    },
    // SDK requires async implementation
    implementation: async ({ id }: CancelBackgroundCommandParams) => { // C5 FIX: typed params
      try {
        const cancelled = backgroundCommandManager.cancel(id);
        if (!cancelled) {
          return { success: false, error: `Cannot cancel command: ${id} (not found or not running)` };
        }
        return { success: true, data: { id, cancelled: true } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  return tools;
}
