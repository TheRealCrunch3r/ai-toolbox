import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import type { PluginConfig } from '../config.js';
import { getWorkingDir } from '../workingDir.js';

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

// ==================== Context Storage Manager ====================

class ContextStorageManager {
  private storagePath: string;
  
  constructor() {
    this.storagePath = path.join(getWorkingDir(), '.ai_toolbox_context.json');
    console.log(`[ContextStorage] Initialized with storage path: ${this.storagePath}`);
  }

  /** Load context entries from disk */
  load(): ContextEntry[] {
    try {
      if (!fs.existsSync(this.storagePath)) {
        console.log(`[ContextStorage.load] File does not exist yet: ${this.storagePath}`);
        return [];
      }
      
      const data = fs.readFileSync(this.storagePath, 'utf-8');
      const entries = JSON.parse(data) as ContextEntry[];
      console.log(`[ContextStorage.load] Loaded ${entries.length} entries from disk`);
      return entries;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ContextStorage.load] Failed to load context storage: ${message}`);
      return [];
    }
  }

  /** Save context entries to disk */
  save(entries: ContextEntry[]): void {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[ContextStorage.save] Created directory: ${dir}`);
      }
      
      // Write atomically (temp file + rename)
      const tempPath = this.storagePath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(entries, null, 2));
      fs.renameSync(tempPath, this.storagePath);
      console.log(`[ContextStorage.save] Saved ${entries.length} entries to disk`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ContextStorage.save] Failed to save context storage: ${message}`);
    }
  }

  /** Add a new context entry */
  addEntry(entry: ContextEntry): void {
    const entries = this.load();
    entries.unshift(entry); // Add to beginning
    
    // Limit to last 1000 entries to prevent unbounded growth
    if (entries.length > 1000) {
      entries.splice(1000);
    }
    
    this.save(entries);
  }

  /** Get recent context entries */
  getRecentEntries(limit: number = 20, type?: string): ContextEntry[] {
    const entries = this.load();
    
    if (type) {
      return entries.filter(e => e.type === type).slice(0, limit);
    }
    
    return entries.slice(0, limit);
  }

  /** Search context entries by query */
  searchEntries(query: string, maxResults: number = 10): ContextEntry[] {
    const entries = this.load();
    const lowerQuery = query.toLowerCase();
    
    const results = entries.filter(entry => 
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
    
    return results.slice(0, maxResults);
  }

  /** Delete context entries by ID */
  deleteEntry(id: string): boolean {
    const entries = this.load();
    const filtered = entries.filter(e => e.id !== id);
    
    if (filtered.length === entries.length) {
      return false; // Entry not found
    }
    
    this.save(filtered);
    return true;
  }

  /** Clear all context entries */
  clearAll(): void {
    this.save([]);
  }

  /** Get summary statistics */
  getSummary(): ContextSummary {
    const entries = this.load();
    
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

// ==================== Context Analyzer ====================

class ContextAnalyzer {
  private storageManager: ContextStorageManager;
  
  constructor() {
    this.storageManager = new ContextStorageManager();
  }

  /** Analyze recent activity and auto-save important context */
  analyzeAndSave(
    sessionEvents: Array<{ type?: string; timestamp?: number; data?: any }>,
    configChanges?: Record<string, boolean | string>
  ): { saved_count: number; summary: string } {
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
      (e.data && typeof e.data.decision === 'string')
    );

    decisionEvents.forEach(event => {
      const decisionText = event.data?.decision || `Decision made at ${event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'unknown time'}`;
      entries.push({
        id: this.generateId(),
        timestamp: event.timestamp || Date.now(),
        type: 'decision',
        title: 'Important Decision Recorded',
        content: decisionText,
        tags: ['decision'],
      });
    });

    // Auto-generate summary if we have enough entries
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

      // Save all entries to storage
      entries.forEach(entry => this.storageManager.addEntry(entry));

      return {
        saved_count: entries.length,
        summary: `Saved ${entries.length} context entries including patterns and decisions.`,
      };
    }

    return { saved_count: 0, summary: 'No significant context changes detected.' };
  }

  /** Generate a unique ID for context entry */
  private generateId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== Tool Implementations ====================

export function registerContextManagementTools(_config: PluginConfig): Tool[] {
  const analyzer = new ContextAnalyzer();
  const storageManager = new ContextStorageManager();

  const tools: Tool[] = [];

  // auto_summarize_context tool — Analyze session and save important context
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
      readonly session_events?: Array<{ type?: string; data?: any; timestamp?: number }>; 
      readonly config_changes?: Record<string, boolean | string>; 
    }) => {
      try {
        const result = analyzer.analyzeAndSave(session_events || [], config_changes);
        
        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Context analysis failed: ${message}` };
      }
    },
  }));

  // get_context_memory tool — Retrieve auto-saved context entries
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
        const entries = storageManager.getRecentEntries(limit || 20, type);
        
        return { success: true, data: { entries } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to retrieve context memory: ${message}` };
      }
    },
  }));

  // search_context tool — Search auto-saved context by query
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
        const results = storageManager.searchEntries(query, max_results || 10);
        
        return { success: true, data: { results } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Context search failed: ${message}` };
      }
    },
  }));

  // context_summary tool — Get summary statistics of auto-saved context
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
        const summary = storageManager.getSummary();
        
        return { success: true, data: summary };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get context summary: ${message}` };
      }
    },
  }));

  // delete_context_entry tool — Remove a specific context entry by ID
  tools.push(tool({
    name: 'delete_context_entry',
    description: 'Delete a specific auto-saved context entry by its unique ID.',
    parameters: {
      entry_id: z.string().describe('The unique ID of the context entry to delete'),
    },
    implementation: async ({ entry_id }: { readonly entry_id: string }) => {
      try {
        const deleted = storageManager.deleteEntry(entry_id);
        
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

  // clear_context_memory tool — Clear all auto-saved context entries
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
        storageManager.clearAll();
        
        return { success: true, data: { cleared: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to clear context memory: ${message}` };
      }
    },
  }));

  // track_important_event tool — Manually mark an event as important for context tracking
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

        storageManager.addEntry(entry);
        
        return { success: true, data: { tracked: true, entry_id: entry.id } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to track event: ${message}` };
      }
    },
  }));

  return tools;
}
