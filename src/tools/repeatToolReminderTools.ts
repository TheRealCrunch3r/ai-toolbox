import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';
import { repeatReminder } from '../utils/repeatToolReminder.js';

/**
 * Repeat Tool Reminder Tools
 * Provides read-only visibility into the loop hygiene state.
 * Does not modify result shapes of other tools.
 */

export function registerRepeatToolReminderTools(_config: PluginConfig): Tool[] {
  return [
    tool({
      name: 'get_repeat_tool_advice',
      description: 'Returns current repeat-tool reminder state and any active nudges. Use to check if the model is in a repetition loop.',
      parameters: {
        toolName: z.string().optional().describe('Optional specific tool name to query. If omitted, returns summary for all tracked calls.'),
        args: z.any().optional().describe('Optional arguments object to query a specific call signature. Omitted means all signatures for the given tool.'),
      },
      implementation: async ({ toolName, args }: { toolName?: string; args?: unknown }) => {
        // The repeatReminder instance is shared across provider turns.
        // For safety, we expose only counts and advice, never internal maps directly.
        // Do NOT call check() here – it would increment counters. Use getCount for read-only reporting.
        if (toolName && args !== undefined) {
          const count = repeatReminder.getCount(toolName, args);
          const advice = count >= 3
            ? count === 3 ? 'Consider varying parameters or checking previous results before repeating.'
              : count === 5 ? 'You are in a repetition pattern. Try a different approach, broaden the query, or summarize what you have so far.'
              : count >= 8 ? 'Strong recommendation to break the loop: the same call is unlikely to yield new information. Use a different tool or ask for a summary of progress.'
              : null
            : null;
          return {
            toolName,
            args,
            count,
            advice
          };
        }
        if (toolName) {
          // Summary for a specific tool – we cannot enumerate all keys without exposing map.
          // Return placeholder indicating query mode.
          return {
            toolName,
            note: 'Provide args to get exact count. Use this tool to inspect specific signatures.'
          };
        }
        return {
          note: 'Repeat tool reminder is active with thresholds [3,5,8]. Use toolName and args to query specific calls.',
          thresholds: [3, 5, 8]
        };
      }
    })
  ];
}
