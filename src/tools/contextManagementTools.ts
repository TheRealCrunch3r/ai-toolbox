import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs/promises';  // ASYNC import ===
import * as path from 'path';
import { encode, decode } from '@msgpack/msgpack';

import type { PluginConfig } from '../config.js';
import type { StateManager } from '../stateManager.js';
import type { BackgroundCommandManager } from '../backgroundCommands.js';
import { getWorkingDir } from '../workingDir.js';

// ==================== Session Summary Types ====================

export interface SessionSummaryData {
  task_description: string;
  accomplishments?: string;
  pending_tasks?: string;
  decisions_made?: string;
  context_for_next_session?: string;
}

// ==================== Context Management Types ====================

interface ContextEntry {
  id: string;
  timestamp: number;
  type: 'decision' | 'pattern' | 'configuration' | 'file_change' | 'error' | 'summary';
  title: string;
  content: string;
  tags?: string[];
  session_id?: string;
}

interface ContextSummary {
  total_entries: number;
  entries_by_type: Record<string, number>;
  recent_entries: ContextEntry[];
  last_updated: number;
}

// ==================== Context Storage Manager — ASYNC ===

export class ContextStorageManager {
  private workingDirPath: string;
  private pluginRootPath: string;
  
  constructor() {
    // Use dedicated subdirectory for session/context memory
    const wd = getWorkingDir();
    this.workingDirPath = path.join(wd, '.session_context', '.ai_toolbox_memory.msgpack');
    
    const baseDir = path.resolve(__dirname, '..');
    this.pluginRootPath = path.join(baseDir, '.session_context', '.ai_toolbox_memory.msgpack');
    
    console.warn(`[ContextStorage] Initialized — Working Dir: ${this.workingDirPath}`);
    console.warn(`[ContextStorage] Plugin Root Fallback: ${this.pluginRootPath}`);
  }

  /** Ensure the .session_context directory exists */
  private async ensureDirectory(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!await fs.access(dir).then(() => true).catch(() => false)) {
      await fs.mkdir(dir, { recursive: true });
      console.warn(`[ContextStorage] Created directory: ${dir}`);
    }
  }

  /** Resolve storage path with working-dir-first / plugin-root fallback */
  private async resolveActiveStorage(): Promise<{ filePath: string; isWorkingDir: boolean }> {
    // Priority 1: Working directory (always checked first)
    if (await fs.access(this.workingDirPath).then(() => true).catch(() => false)) {
      return { filePath: this.workingDirPath, isWorkingDir: true };
    }
    
    // Priority 2: Plugin root fallback
    if (await fs.access(this.pluginRootPath).then(() => true).catch(() => false)) {
      console.warn(`[ContextStorage] Working dir not found. Falling back to plugin root.`);
      return { filePath: this.pluginRootPath, isWorkingDir: false };
    }
    
    // Default to working directory if neither exists (for new writes)
    return { filePath: this.workingDirPath, isWorkingDir: true };
  }

  /** Load context entries from disk — ASYNC === */
  async load(): Promise<ContextEntry[]> {  // MADE ASYNC
    try {
      const { filePath, isWorkingDir } = await this.resolveActiveStorage();
      
      if (!await fs.access(filePath).then(() => true).catch(() => false)) {
        console.warn(`[ContextStorage.load] No context storage found at ${filePath}`);
        return [];
      }
      
      const buffer = await fs.readFile(filePath);  // Read as Buffer (msgpack format)
      const entries = decode(buffer) as ContextEntry[];
      console.warn(`[ContextStorage.load] Loaded ${entries.length} entries from ${isWorkingDir ? 'working dir' : 'plugin root'}: ${filePath}`);
      return entries;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ContextStorage.load] Failed to load context storage: ${message}`);
      return [];
    }
  }

  /** Save context entries to disk — ASYNC === */
  async save(entries: ContextEntry[], targetPath?: string): Promise<void> {  // MADE ASYNC
    try {
      const filePath = targetPath || this.workingDirPath; // Default to working dir for writes
      
      // Ensure the .session_context directory exists
      await this.ensureDirectory(filePath);
      
      // Write atomically (temp file + rename) — ASYNC ===
      const tempPath = filePath + '.tmp';
      const encoded = encode(entries);  // Encode to msgpack Buffer
      await fs.writeFile(tempPath, encoded);  // ASYNC write (Buffer format)
      await fs.rename(tempPath, filePath);  // ASYNC rename
      console.warn(`[ContextStorage.save] Saved ${entries.length} entries to working dir: ${filePath}`);

      // 🔹 DUAL WRITE: Always sync to plugin root as well
      if (this.pluginRootPath !== this.workingDirPath) {
        try {
          await this.ensureDirectory(this.pluginRootPath);
          const pluginTemp = this.pluginRootPath + '.tmp';
          await fs.writeFile(pluginTemp, encoded);
          await fs.rename(pluginTemp, this.pluginRootPath);
          console.warn(`[ContextStorage.save] Synced to plugin root: ${this.pluginRootPath}`);
        } catch (syncError) {
          const syncMsg = syncError instanceof Error ? syncError.message : String(syncError);
          console.error(`[ContextStorage.save] Failed to sync to plugin root: ${syncMsg}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ContextStorage.save] Failed to save context storage: ${message}`);
    }
  }

  /** Add a new context entry — ASYNC === */
  async addEntry(entry: ContextEntry): Promise<void> {  // MADE ASYNC
    const entries = await this.load();  // ASYNC load
    entries.unshift(entry); // Add to beginning
    
    // Limit to last 1000 entries to prevent unbounded growth
    if (entries.length > 1000) {
      entries.splice(1000);
    }
    
    await this.save(entries);  // ASYNC save
  }

  /** Get recent context entries — ASYNC === */
  async getRecentEntries(limit: number = 20, type?: string): Promise<ContextEntry[]> {  // MADE ASYNC
    const entries = await this.load();  // ASYNC load
    
    if (type) {
      return entries.filter(e => e.type === type).slice(0, limit);
    }
    
    return entries.slice(0, limit);
  }

  /** Search context entries by query — ASYNC === */
  async searchEntries(query: string, maxResults: number = 10): Promise<ContextEntry[]> {  // MADE ASYNC
    const entries = await this.load();  // ASYNC load
    const lowerQuery = query.toLowerCase();
    
    const results = entries.filter(entry => 
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
    
    return results.slice(0, maxResults);
  }

  /** Delete context entries by ID — ASYNC === */
  async deleteEntry(id: string): Promise<boolean> {  // MADE ASYNC
    const entries = await this.load();  // ASYNC load
    const filtered = entries.filter(e => e.id !== id);
    
    if (filtered.length === entries.length) {
      return false; // Entry not found
    }
    
    await this.save(filtered);  // ASYNC save
    return true;
  }

  /** Clear all context entries — ASYNC === */
  async clearAll(): Promise<void> {  // MADE ASYNC
    await this.save([]);  // ASYNC save
  }

  /** Get summary statistics — ASYNC === */
  async getSummary(): Promise<ContextSummary> {  // MADE ASYNC
    const entries = await this.load();  // ASYNC load
    
    const entriesByType: Record<string, number> = {};
    entries.forEach(entry => {
      entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
    });

    return {
      total_entries: entries.length,
      entries_by_type: entriesByType,
      recent_entries: entries.slice(0, 5),
      last_updated: Date.now(),
    };
  }
}

// ==================== Context Analyzer — ASYNC ===

class ContextAnalyzer {
  private storageManager: ContextStorageManager;
  
  constructor() {
    this.storageManager = new ContextStorageManager();
  }

  /** Analyze recent activity and auto-save important context — ASYNC === */
  async analyzeAndSave(
    sessionEvents: Array<{ type?: string; timestamp?: number; data?: unknown }>,
    configChanges?: Record<string, boolean | string>
  ): Promise<{ saved_count: number; summary: string }> {  // MADE ASYNC
    const entries: ContextEntry[] = [];

    // Analyze tool usage patterns
    const toolUsageCount: Record<string, number> = {};
    sessionEvents.forEach(event => {
      if (event.type && event.type.startsWith('tool_')) {
        const toolName = event.type.replace('tool_', '');
        toolUsageCount[toolName] = (toolUsageCount[toolName] || 0) + 1;
      }
    });

    // Identify frequently used tools (>3 uses in session)
    Object.entries(toolUsageCount).forEach(([tool, count]) => {
      if (count > 3) {
        entries.push({
          id: this.generateId(),
          timestamp: Date.now(),
          type: 'pattern',
          title: `Frequent Tool Usage: ${tool}`,
          content: `Tool '${tool}' was used ${count} times in the current session, indicating it's a primary workflow tool.`,
          tags: ['usage_pattern', 'frequent_tool'],
        });
      }
    });

    // Analyze configuration changes
    if (configChanges) {
      Object.entries(configChanges).forEach(([key, value]) => {
        entries.push({
          id: this.generateId(),
          timestamp: Date.now(),
          type: 'configuration',
          title: `Configuration Change: ${key}`,
          content: `Setting '${key}' was changed to '${value}'.`,
          tags: ['config_change'],
        });
      });
    }

    // Detect important decisions (based on event patterns)
    const decisionEvents = sessionEvents.filter(e => 
      e.type === 'decision' || 
      (e.data && typeof (e.data as Record<string, unknown>).decision === 'string')
    );

    decisionEvents.forEach(event => {
      const decisionText = (event.data as { decision?: string })?.decision || `Decision made at ${event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'unknown time'}`;
      entries.push({
        id: this.generateId(),
        timestamp: event.timestamp || Date.now(),
        type: 'decision',
        title: 'Important Decision Recorded',
        content: decisionText,
        tags: ['decision'],
      });
    });

    // Auto-generate summary if we have enough entries — ASYNC ===
    if (entries.length > 0) {
      const uniquePatterns = new Set(entries.filter(e => e.type === 'pattern').map(e => e.title));
      
      entries.push({
        id: this.generateId(),
        timestamp: Date.now(),
        type: 'summary',
        title: `Session Context Summary (${new Date().toLocaleTimeString()})`,
        content: `Auto-generated summary: ${entries.length} context entries saved. Key patterns detected: ${Array.from(uniquePatterns).join(', ') || 'No specific patterns'}. Configuration changes tracked: ${Object.keys(configChanges || {}).length}.`,
        tags: ['auto_summary'],
      });

      // Save all entries to storage — ASYNC ===
      for (const entry of entries) {
        await this.storageManager.addEntry(entry);  // ASYNC call
      }

      return {
        saved_count: entries.length,
        summary: `Saved ${entries.length} context entries including patterns and decisions.`,
      };
    }

    return { saved_count: 0, summary: 'No significant context changes detected.' };
  }

  /** Generate a unique ID for context entry — ASYNC already === */
  private generateId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== Tool Implementations — ASYNC ===

export function registerContextManagementTools(
  _config: PluginConfig,
  stateManager?: StateManager,
  _bgCommandManager?: BackgroundCommandManager,
): Tool[] {
  const analyzer = new ContextAnalyzer();
  const storageManager = new ContextStorageManager();

  // Use provided stateManager if available (from toolsProvider), otherwise fallback to direct file ops
  const memoryStore = stateManager || null;

  const tools: Tool[] = [];

  // auto_summarize_context tool — ANALYZE AND SAVE — ASYNC ===
  tools.push(tool({
    name: 'auto_summarize_context',
    description: `Automatically analyze recent session activity to identify patterns, frequent tool usage, configuration changes, and decisions worth remembering. Saves findings to persistent memory.

WHEN TO USE:
• At the end of a long session to capture key learnings
• After significant configuration or workflow changes
• When user asks you to "summarize what happened" or "remember this session"
• Periodically during extended work sessions`,
    parameters: {
      session_events: z.array(z.object({
        type: z.string(),
        timestamp: z.number(),
        data: z.any().optional(),
      })).optional().describe('Recent session events to analyze'),
      config_changes: z.record(z.union([z.boolean(), z.string()])).optional().describe('Configuration changes made during session'),
    },
    implementation: async ({ session_events = [], config_changes }: { 
      readonly session_events?: Array<{ type?: string; data?: unknown; timestamp?: number }>; 
      readonly config_changes?: Record<string, boolean | string>; 
    }) => {
      try {
        const result = await analyzer.analyzeAndSave(session_events || [], config_changes);  // ASYNC call
        
        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Context analysis failed: ${message}` };
      }
    },
  }));

  // get_context_memory tool — RETRIEVE AUTO-SAVED CONTEXT — ASYNC ===
  tools.push(tool({
    name: 'get_context_memory',
    description: `Retrieve your persistent memory entries from past sessions. Access recorded decisions, patterns, configurations, and events.

WHEN TO USE:
• User asks about previous work or "what happened before"
• You want to review recent important events automatically tracked
• Checking what context has been saved for continuity across sessions
• User wants a summary of remembered information`,
    parameters: {
      limit: z.number().min(1).max(50).optional().default(20).describe('Maximum number of entries to return'),
      type: z.enum(['decision', 'pattern', 'configuration', 'file_change', 'error', 'summary']).optional().describe('Filter by entry type'),
    },
    implementation: async ({ limit = 20, type }: { 
      readonly limit?: number; 
      readonly type?: string; 
    }) => {
      try {
        const entries = await storageManager.getRecentEntries(limit || 20, type);  // ASYNC call
        
        return { success: true, data: { entries } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to retrieve context memory: ${message}` };
      }
    },
  }));

  // search_context tool — SEARCH AUTO-SAVED CONTEXT BY QUERY — ASYNC ===
  tools.push(tool({
    name: 'search_context',
    description: `Search through your persistent memory for past decisions, patterns, configurations, and events. 

WHEN TO USE:
• User asks "what did we decide before?" or similar recall questions
• You need to reference previous architectural decisions
• Checking if a similar problem was solved in a prior session
• User wants to know what you've learned from past work`,
    parameters: {
      query: z.string().describe('Search query to match against context entries'),
      max_results: z.number().min(1).max(50).optional().default(10).describe('Maximum number of results to return'),
    },
    implementation: async ({ query, max_results = 10 }: { 
      readonly query: string; 
      readonly max_results?: number; 
    }) => {
      try {
        const results = await storageManager.searchEntries(query, max_results || 10);  // ASYNC call
        
        return { success: true, data: { results } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Context search failed: ${message}` };
      }
    },
  }));

  // context_summary tool — GET SUMMARY STATISTICS OF AUTO-SAVED CONTEXT — ASYNC ===
  tools.push(tool({
    name: 'context_summary',
    description: `Get a statistical overview of your persistent memory: total entries, breakdown by type (decisions, patterns, configurations), and recent activity.

WHEN TO USE:
• User asks "what have you remembered?" or "show me your memory"
• You want to provide an overview before detailed retrieval
• Checking if any relevant context exists before searching`,
    parameters: {},
    implementation: async () => {
      try {
        const summary = await storageManager.getSummary();  // ASYNC call
        
        return { success: true, data: summary };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get context summary: ${message}` };
      }
    },
  }));

  // delete_context_entry tool — REMOVE A SPECIFIC CONTEXT ENTRY BY ID — ASYNC ===
  tools.push(tool({
    name: 'delete_context_entry',
    description: 'Delete a specific auto-saved context entry by its unique ID.',
    parameters: {
      entry_id: z.string().describe('The unique ID of the context entry to delete'),
    },
    implementation: async ({ entry_id }: { readonly entry_id: string }) => {
      try {
        const deleted = await storageManager.deleteEntry(entry_id);  // ASYNC call
        
        if (!deleted) {
          return { success: false, error: `Context entry '${entry_id}' not found` };
        }
        
        return { success: true, data: { deleted: true, entry_id } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete context entry: ${message}` };
      }
    },
  }));

  // clear_context_memory tool — CLEAR ALL AUTO-SAVED CONTEXT ENTRIES — ASYNC ===
  tools.push(tool({
    name: 'clear_context_memory',
    description: 'Clear all automatically saved context entries from persistent memory. This action cannot be undone.',
    parameters: {
      confirm: z.boolean().describe('Set to true to confirm deletion of all context entries'),
    },
    implementation: async ({ confirm }: { readonly confirm: boolean }) => {
      if (!confirm) {
        return { success: false, error: 'Confirmation required. Set confirm=true to proceed.' };
      }
      
      try {
        await storageManager.clearAll();  // ASYNC call
        
        return { success: true, data: { cleared: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to clear context memory: ${message}` };
      }
    },
  }));

  // track_important_event tool — MANUALLY MARK AN EVENT AS IMPORTANT FOR CONTEXT TRACKING — ASYNC ===
  tools.push(tool({
    name: 'track_important_event',
    description: `Manually record an important event, decision, or milestone to persistent memory across sessions. 

WHEN TO USE:
• After making a significant architectural or design decision
• When completing a major task milestone successfully
• When discovering patterns worth remembering for future work
• When user explicitly asks you to "remember" something
• Before ending a session with important learnings`,
    parameters: {
      title: z.string().describe('Title of the important event'),
      content: z.string().describe('Detailed description of the event'),
      tags: z.array(z.string()).optional().describe('Tags to categorize the event'),
    },
    implementation: async ({ title, content, tags }: { 
      readonly title: string; 
      readonly content: string; 
      readonly tags?: string[]; 
    }) => {
      try {
        const entry: ContextEntry = {
          id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: 'decision',
          title,
          content,
          tags,
        };

        await storageManager.addEntry(entry);  // ASYNC call
        
        return { success: true, data: { tracked: true, entry_id: entry.id } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to track event: ${message}` };
      }
    },
  }));

  // save_session_summary tool — PERSIST SESSION DATA TO MEMORY + DISK (working dir → plugin root) ===
  tools.push(tool({
    name: 'save_session_summary',
    description: `Save a structured session summary for cross-session continuity. Includes accomplishments, pending tasks, decisions made, and context for the next session.\n\nPERSISTENCE BEHAVIOR:\n• Saves to internal state manager (RAM)\n• ALWAYS writes atomic copy to working dir (.ai_toolbox_memory.msgpack)\n• Falls back to plugin root if working dir is invalid/stale`,
    parameters: {
      task_description: z.string().describe('Brief description of what was being worked on'),
      accomplishments: z.string().optional().describe('List key accomplishments or completed tasks'),
      pending_tasks: z.string().optional().describe('List remaining work that needs to continue in the next session'),
      decisions_made: z.string().optional().describe('Key architectural or implementation decisions made during this session'),
      context_for_next_session: z.string().optional().describe('Important context, file locations, or setup steps needed for the next session'),
    },
    implementation: async ({ task_description, accomplishments, pending_tasks, decisions_made, context_for_next_session }: { 
      readonly task_description: string; 
      readonly accomplishments?: string; 
      readonly pending_tasks?: string; 
      readonly decisions_made?: string; 
      readonly context_for_next_session?: string; 
    }) => {
      try {
        const summaryData: SessionSummaryData = {
          task_description,
          accomplishments,
          pending_tasks,
          decisions_made,
          context_for_next_session,
        };

        if (memoryStore) {
          console.warn('[ContextManagement.save_session_summary] memoryStore exists, setting data...');
          memoryStore.set('session_summary_latest', summaryData);
          memoryStore.set(`session_summary_${Date.now()}`, summaryData); // versioned backup
          
          console.warn('[ContextManagement.save_session_summary] Calling forceSave()...');
          await memoryStore.forceSave();
          console.warn('[ContextManagement.save_session_summary] forceSave() completed.');
        } else {
          console.warn('[ContextManagement.save_session_summary] No StateManager provided. Session summary saved to RAM only.');
        }

        return { success: true, data: { saved: true, task_description } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.save_session_summary] ERROR: ${message}`);
        return { success: false, error: `Failed to save session summary: ${message}` };
      }
    },
  }));

  // get_session_summary tool — RETRIEVE LATEST SAVED SESSION SUMMARY ===
  tools.push(tool({
    name: 'get_session_summary',
    description: `Retrieve the most recent saved session summary for continuity across sessions.`,
    parameters: {},
    implementation: async () => {
      try {
        if (memoryStore) {
          // Force reload from disk to ensure we have latest state
          await memoryStore.forceLoad();
          
          const latest = memoryStore.get<SessionSummaryData>('session_summary_latest');
          if (latest) {
            return { success: true, data: latest };
          }
        }

        return { success: false, error: 'No session summary found in memory.' };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to retrieve session summary: ${message}` };
      }
    },
  }));

  // save_memory tool — SAVE KEY-VALUE PAIR TO MEMORY + PERSIST TO DISK ===
  tools.push(tool({
    name: 'save_memory',
    description: `Save a specific piece of information or fact to long-term memory.\n\nPERSISTENCE:\n• Writes to internal state manager (RAM)\n• ALWAYS writes atomic copy to working dir (.ai_toolbox_memory.msgpack)\n• Falls back to plugin root if working dir is invalid`,
    parameters: {
      fact: z.string().min(1).describe('The specific fact or piece of information to remember.'),
    },
    implementation: async ({ fact }: { readonly fact: string }) => {
      try {
        const key = `memory_${Date.now()}`;
        
        if (memoryStore) {
          memoryStore.set(key, { fact, timestamp: Date.now() });
          await memoryStore.forceSave(); // Immediate disk persistence
        } else {
          console.warn('[ContextManagement] No StateManager provided. Memory saved to RAM only.');
        }

        return { success: true, data: { saved: true, key } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to save memory: ${message}` };
      }
    },
  }));

  // get_memory tool — RETRIEVE ALL SAVED MEMORY ENTRIES ===
  tools.push(tool({
    name: 'get_memory',
    description: `Retrieve all saved memory entries. Returns a list of all facts stored via save_memory.`,
    parameters: {},
    implementation: async () => {
      try {
        if (memoryStore) {
          // Force reload from disk to ensure we have latest state
          await memoryStore.forceLoad();
          
          const keys = await memoryStore.getAllKeys();
          const memories = keys
            .filter(k => k.startsWith('memory_'))
            .map(k => ({ key: k, value: memoryStore.get<unknown>(k) }))
            .filter(m => m.value !== undefined);
          
          if (memories.length > 0) {
            return { success: true, data: memories };
          }
        }

        return { success: false, error: 'No memory entries found.' };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to retrieve memory: ${message}` };
      }
    },
  }));

  // delete_memory tool — DELETE A SAVED MEMORY ENTRY BY KEY ===
  tools.push(tool({
    name: 'delete_memory',
    description: `Delete a saved memory entry by its ID (returned from save_memory or get_memory).`,
    parameters: {
      entry_id: z.string().describe('The unique key of the memory entry to delete'),
    },
    implementation: async ({ entry_id }: { readonly entry_id: string }) => {
      try {
        if (memoryStore) {
          const deleted = memoryStore.delete(entry_id);
          
          if (!deleted) {
            return { success: false, error: `Memory entry '${entry_id}' not found` };
          }
          
          // Force disk persistence after deletion
          await memoryStore.forceSave();
          
          return { success: true, data: { deleted: true, entry_id } };
        } else {
          console.warn('[ContextManagement] No StateManager provided. Cannot delete from disk.');
          return { success: false, error: 'StateManager not available.' };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete memory: ${message}` };
      }
    },
  }));

  return tools;
}