import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs/promises';  // ASYNC import ===
import * as path from 'path';
import * as crypto from 'crypto';
import { encode, decode } from '@msgpack/msgpack';

import type { PluginConfig } from '../config.js';
import type { StateManager } from '../stateManager.js';
import type { BackgroundCommandManager } from '../backgroundCommands.js';
import { getWorkingDir } from '../workingDir.js';
import type { ContextOrigin, ContextNode } from '../contextTiers.js';
import { replaceTier, createContextNode } from '../contextTiers.js';
import type { Confidence } from '../types/confidenceTypes.js';

// ==================== Session Summary Types ====================

export interface SessionSummaryData {
  task_description: string;
  accomplishments?: string;
  pending_tasks?: string;
  decisions_made?: string;
  context_for_next_session?: string;
  timestamp?: number;
  date?: string;
}

// ==================== Context Management Types ====================

export type MemoryScope = 'global' | 'project' | 'session';

interface ContextEntry {
  id: string;
  timestamp: number;
  date: string;
  type: 'decision' | 'pattern' | 'configuration' | 'file_change' | 'error' | 'summary';
  title: string;
  content: string;
  tags?: string[];
  session_id?: string;
  scope?: MemoryScope; // NEW: Explicit scoping for context isolation
  frequency?: number;   // NEW: Access count for heuristic scoring
  ttl_ms?: number;      // NEW: Time-to-live in milliseconds (for session pruning)
  project_path?: string; // NEW: Working directory that created this entry (isolation key)
  _origin?: ContextOrigin; // NEW: Tier provenance ("ast" = raw file/AST, "semantic" = derived insight) — graphify-inspired
}

interface ContextSummary {
  total_entries: number;
  entries_by_type: Record<string, number>;
  recent_entries: ContextEntry[];
  last_updated: number;
}

// ==================== Context Storage Manager — ASYNC ===

/** Default TTL for session-scoped memories (24 hours) */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; 

export class ContextStorageManager {
  private workingDirPath: string;
  private pluginRootPath: string;
  
  constructor() {
    // Use dedicated subdirectory for session/context memory
    const wd = getWorkingDir();
    this.workingDirPath = path.join(wd, '.session_context', '.ai_toolbox_memory.msgpack');
    
    const baseDir = path.resolve(__dirname, '..');
    this.pluginRootPath = path.join(baseDir, '.session_context', '.ai_toolbox_memory.msgpack');
  }

  /** 🔹 FIX #15 (search_context crash, 2026-08-19): Structural shape guard. The shared
   * .ai_toolbox_memory.msgpack file holds BOTH context entries ({id,type,title,content,...})
   * AND StateManager records ({key,value,timestamp}); the blind cast in load() previously let
   * state records through and crash searchEntries' unguarded field access. */
  private isContextEntry(e: unknown): e is ContextEntry {
    if (!e || typeof e !== 'object' || Array.isArray(e)) return false;
    const o = e as Record<string, unknown>;
    return (
      typeof o.id === 'string' &&
      typeof o.timestamp === 'number' &&
      typeof o.type === 'string' &&
      ['decision', 'pattern', 'configuration', 'file_change', 'error', 'summary'].includes(o.type)
    );
  }

  /** Ensure the .session_context directory exists */
  private async ensureDirectory(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /** Load context entries from disk — Strict W.D. -> Plugin Fallback WITH PROJECT FILTER */
  async load(): Promise<ContextEntry[]> {
    // Priority 1: Working Directory (Always check first)
    try {
      if (await fs.access(this.workingDirPath).then(() => true).catch(() => false)) {
        const buffer = await fs.readFile(this.workingDirPath);
        const entries = decode(buffer) as ContextEntry[];
        // Filter to only return context entries belonging to this project's working directory.
        // 🔹 FIX #16 (misleading warning, 2026-08-20): split rejection reasons so diagnostics are accurate —
        // StateManager records ({key,value,timestamp} from save_session_summary/save_memory) in this shared
        // file are EXPECTED and must not emit a scary stderr ERROR; previously ANY rejection (including the
        // FIX #15 shape-guard dropping state records) was misreported as "filtered out by project_path".
        const contextEntries = entries.filter(e => this.isContextEntry(e));  // 🔹 FIX #15: shape-check first
        const filtered = contextEntries.filter(e =>
          e.project_path === this.workingDirPath || !e.project_path  // legacy entries have no project_path
        );
        if (Array.isArray(filtered)) {
          if (filtered.length === 0 && entries.length > 0) {
            if (contextEntries.length === 0) {
              console.log(`[ContextStorage.load] Working Dir file holds ${entries.length} state record(s) only — no context entries. Nothing to load.`);
            } else {
              console.warn(`[ContextStorage.load] ⚠️ All ${contextEntries.length} context entry(ies) rejected by project_path (current: ${this.workingDirPath}). Falling back to Plugin Root.`);
            }
          } else if (filtered.length > 0) {
            const excluded = entries.length - filtered.length;
            console.log(excluded > 0
              ? `[ContextStorage.load] Loaded ${filtered.length} entries from Working Dir. (${excluded} non-context/cross-project records excluded)`
              : `[ContextStorage.load] Loaded ${filtered.length} entries from Working Dir.`);
          }
          return filtered;
        }
      }
    } catch (error) {
      console.warn(`[ContextStorage.load] Failed to load from Working Dir: ${String(error)}`);
    }

    // Fallback: Plugin Root — ONLY for legacy entries lacking project_path
    try {
      if (await fs.access(this.pluginRootPath).then(() => true).catch(() => false)) {
        const buffer = await fs.readFile(this.pluginRootPath);
        const allEntries = decode(buffer) as ContextEntry[];
        // Only return legacy entries that DON'T have project_path set 
        // (entries from projects whose working dir storage was lost/corrupted)
        // 🔹 FIX #15 (2026-08-19): state records lack id/type — never treat them as context entries
        const legacyOnly = allEntries.filter(e => this.isContextEntry(e) && (!e.project_path || e.project_path === this.workingDirPath));
        if (legacyOnly.length > 0) {
          console.log(`[ContextStorage.load] Working Dir empty/missing. Loaded ${legacyOnly.length} legacy entries from Plugin Root fallback.`);
          return legacyOnly;
        }
      }
    } catch (error) {
      console.warn(`[ContextStorage.load] Failed to load from Plugin Root: ${String(error)}`);
    }

    console.log('[ContextStorage.load] No context storage found in either location.');
    return [];
  }

  /** Save context entries to disk — Primary W.D., NO fallback sync */
  async save(entries: ContextEntry[], targetPath?: string): Promise<void> {
    try {
      const filePath = targetPath || this.workingDirPath; // Default to working dir for writes
      
      await this.ensureDirectory(filePath);
      
      // Write atomically (temp file + rename) — ASYNC ===
      const tempPath = filePath + '.tmp';
      const encoded = encode(entries);  // Encode to msgpack Buffer
      await fs.writeFile(tempPath, encoded);  // ASYNC write (Buffer format)
      await fs.rename(tempPath, filePath);  // ASYNC rename
      
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ContextStorage.save] Failed to save context storage: ${message}`);
    }
  }

  /**
   * Convert ContextEntry[] to ContextNode[] for tier operations.
   * Maps _origin from entry if present, defaults to 'semantic'.
   */
  private entriesToNodes(entries: ContextEntry[]): ContextNode[] {
    return entries.map(e => ({
      id: e.id,
      _origin: e._origin ?? 'semantic', // Default to semantic for backward compat
      label: e.title,
      source_file: undefined,
      data: { type: e.type, content: e.content, tags: e.tags },
      timestamp: e.timestamp,
    }));
  }

  /**
   * Convert ContextNode[] back to ContextEntry[].
   */
  private nodesToEntries(nodes: ContextNode[]): ContextEntry[] {
    return nodes.map(n => ({
      id: n.id,
      timestamp: n.timestamp ?? Date.now(),
      date: new Date().toLocaleString(),
      type: (n.data as Record<string, unknown>)?.type as ContextEntry['type'] || 'summary',
      title: n.label || '',
      content: (n.data as Record<string, unknown>)?.content as string || '',
      tags: (n.data as Record<string, unknown>)?.tags as string[] || [],
      scope: 'global', // Default scope for converted entries (inferred from MemoryScope union)
      frequency: 1,
      ttl_ms: undefined,
      project_path: this.workingDirPath,
      _origin: n._origin, // Preserve provenance
    }));
  }

  /**
   * Merge new entry into existing entries with tier-aware replacement.
   * If incoming entry has _origin set, performs tier-scoped merge (graphify pattern).
   * Otherwise falls back to simple ID-based overwrite (backward compatible).
   */
  private async mergeEntriesWithTiers(
    entries: ContextEntry[],
    newEntry: ContextEntry
  ): Promise<ContextEntry[]> {
    // Clone input entry
    const cloned = { ...newEntry };

    // Apply defaults
    if (!cloned.scope) cloned.scope = 'global';
    if (!cloned.project_path) cloned.project_path = this.workingDirPath;
    if (cloned.scope === 'session' && !cloned.ttl_ms) cloned.ttl_ms = SESSION_TTL_MS;

    // 🔹 Tiered replacement path: only when _origin is explicitly set
    if (cloned._origin !== undefined) {
      const oldNodes = this.entriesToNodes(entries);
      const newNode = createContextNode(cloned.id, cloned._origin, {
        type: cloned.type,
        content: cloned.content,
        title: cloned.title,
        tags: cloned.tags,
        frequency: (entries.find(e => e.id === cloned.id)?.frequency || 0) + 1,
      }, undefined, cloned.title);

      const mergedNodes = replaceTier(oldNodes, [newNode]);
      const mergedEntries = this.nodesToEntries(mergedNodes);

      // Re-apply scope/project_path/TTL to entries that didn't come from nodes
      for (const entry of mergedEntries) {
        if (!entry.scope) entry.scope = 'global';
        if (!entry.project_path) entry.project_path = this.workingDirPath;
      }

      return mergedEntries;
    }

    // 🔹 Fallback: simple ID-based merge (backward compatible)
    const existingIdx = entries.findIndex(e => e.id === cloned.id);
    if (existingIdx !== -1) {
      entries[existingIdx].frequency = (entries[existingIdx].frequency || 0) + 1;
      entries[existingIdx] = { ...entries[existingIdx], ...cloned }; // Merge updated data
    } else {
      cloned.frequency = 1;
      entries.unshift(cloned);
    }

    return entries;
  }

  /** Add a new context entry — ASYNC === */
  async addEntry(entry: ContextEntry): Promise<void> {  // MADE ASYNC
    const entries = await this.load();  // ASYNC load
    
    const mergedEntries = await this.mergeEntriesWithTiers(entries, entry);
    
    // Limit to last 1000 entries to prevent unbounded growth
    if (mergedEntries.length > 1000) {
      mergedEntries.splice(1000);
    }
    
    await this.save(mergedEntries);  // ASYNC save
  }

  /** Check if stored entries are stale (>3 days old) */
  private _isStale(entries: ContextEntry[]): boolean {
    if (!entries || entries.length === 0) return false;
    const newestTimestamp = Math.max(...entries.map(e => e.timestamp));
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
    return (Date.now() - newestTimestamp) > threeDaysMs;
  }

  /** Determine if a session-scoped entry has expired based on TTL */
  private _isExpired(entry: ContextEntry): boolean {
    if (entry.scope !== 'session' || !entry.ttl_ms || !entry.timestamp) {
      return false; // Only session entries with explicit TTL are subject to expiration
    }
    const age = Date.now() - entry.timestamp;
    return age > entry.ttl_ms;
  }

  /** Prune expired session-scoped entries from the dataset */
  async pruneExpiredSessionEntries(): Promise<number> {
    const entries = await this.load();
    const initialCount = entries.length;
    
    // Filter out expired session entries
    const pruned = entries.filter(entry => !this._isExpired(entry));
    
    if (pruned.length < initialCount) {
      console.log(`[ContextStorage.prune] Removed ${initialCount - pruned.length} expired session entry(s).`);
      await this.save(pruned);
    }
    
    return initialCount - pruned.length;
  }

  /** Calculate deterministic heuristic score for an entry (Recency + Frequency) */
  private _calculateScore(entry: ContextEntry): number {
    const now = Date.now();
    
    // Recency Decay: Exponential decay based on age (lambda ~ 1 day)
    const ageMs = now - entry.timestamp;
    // 🔹 FIX #14: Clamp recencyFactor to prevent floating-point underflow for entries >30 days old
    const recencyFactor = Math.max(0.001, Math.exp(-ageMs / (24 * 60 * 60 * 1000))); 
    
    // Frequency Saturation: Saturated frequency to prevent staleness bias
    const freq = entry.frequency ?? 1;
    const frequencyFactor = freq / (freq + 5); 
    
    // Weighted composite score (Recency 70%, Frequency 30%)
    return (recencyFactor * 0.7) + (frequencyFactor * 0.3);
  }

  /** 🔹 FIX #18 (2026-08-22, self-describing empty results): Inspect the raw storage file and report
   * WHAT it actually contains — total record count, how many pass the context-entry shape guard, and
   * the keys of StateManager records ({key,value,timestamp}) that share this same file. This makes an
   * "empty" result distinguishable from "file holds only other record types", which previously could
   * only be discovered by reading the raw .msgpack manually (e.g. session_summary_latest). */
  async getStoreDiagnostics(): Promise<{
    storage_file_exists: boolean;
    total_records_in_file: number;
    context_entries_found: number;
    non_context_record_keys?: string[];
  }> {
    const filePath = this.workingDirPath;

    if (!await fs.access(filePath).then(() => true).catch(() => false)) {
      return { storage_file_exists: false, total_records_in_file: 0, context_entries_found: 0 };
    }

    try {
      const buffer = await fs.readFile(filePath);
      // 🔹 LINT FIX (2026-08-22): @msgpack/msgpack's decode() is typed to return `any` — the previous
      // "as unknown" assertion was a no-op type-wise and tripped @typescript-eslint/no-unnecessary-type-assertion.
      const records = decode(buffer);
      if (!Array.isArray(records)) {
        return { storage_file_exists: true, total_records_in_file: 1, context_entries_found: 0 };
      }

      let contextCount = 0;
      for (const r of records) {
        if (this.isContextEntry(r)) contextCount++;
      }

      const stateKeys: string[] = [];
      for (const r of records) {
        if (!r || typeof r !== 'object' || Array.isArray(r)) continue;
        const keyVal = (r as Record<string, unknown>).key;
        if (typeof keyVal === 'string') stateKeys.push(keyVal);
      }

      return {
        storage_file_exists: true,
        total_records_in_file: records.length,
        context_entries_found: contextCount,
        non_context_record_keys: stateKeys.length > 0 ? [...new Set(stateKeys)] : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[ContextStorage.getStoreDiagnostics] Failed to inspect storage file: ${message}`);
      return { storage_file_exists: true, total_records_in_file: 0, context_entries_found: 0 };
    }
  }

  /** Get recent context entries — ASYNC === */
  async getRecentEntries(limit: number = 20, type?: string): Promise<{ data: ContextEntry[], isStale: boolean; confidence: Confidence }> {  // MADE ASYNC
    let entries = await this.load();  // ASYNC load
    
    // 🔹 FIX #2: Inline pruning to eliminate double-load race condition (single I/O)
    const initialCount = entries.length;
    entries = entries.filter(entry => !this._isExpired(entry));
    if (entries.length < initialCount) {
      console.log(`[ContextStorage.getRecentEntries] Pruned ${initialCount - entries.length} expired session entry(s).`);
      await this.save(entries); // Save pruned entries immediately — no reload needed
    }

    let filtered = entries;
    
    // Apply type filter if specified
    if (type) {
      filtered = filtered.filter(e => e.type === type);
    }

    // Apply deterministic heuristic scoring and sort by score descending
    const scoredEntries = filtered.map(entry => ({
      entry,
      score: this._calculateScore(entry),
    })).sort((a, b) => b.score - a.score).map(({ entry }) => entry);

    return { 
      data: scoredEntries.slice(0, limit), 
      isStale: this._isStale(scoredEntries),
      confidence: 'INFERRED' as Confidence, // Heuristic scoring = inferred relevance
    };
  }

  /** Search context entries by query — ASYNC === */
  async searchEntries(query: string, maxResults: number = 10): Promise<{ results: ContextEntry[], isStale: boolean; confidence: Confidence }> {  // MADE ASYNC
    let entries = await this.load();  // ASYNC load
    
    // 🔹 FIX #2 (searchEntries): Inline pruning to eliminate double-load race condition
    const initialCount = entries.length;
    entries = entries.filter(entry => !this._isExpired(entry));
    if (entries.length < initialCount) {
      console.log(`[ContextStorage.searchEntries] Pruned ${initialCount - entries.length} expired session entry(s).`);
      await this.save(entries); // Save pruned entries immediately — no reload needed
    }

    const lowerQuery = query.toLowerCase();
    
    let results = entries.filter(entry => 
      // 🔹 FIX #15 (search_context crash, 2026-08-19): type-guard every field access. The shared
      // .ai_toolbox_memory.msgpack file can contain StateManager records ({key,value,timestamp})
      // alongside context entries; load()'s blind cast let those reach this filter and the
      // unguarded .toLowerCase() calls threw "Cannot read properties of undefined".
      (typeof entry.title === 'string' && entry.title.toLowerCase().includes(lowerQuery)) ||
      (typeof entry.content === 'string' && entry.content.toLowerCase().includes(lowerQuery)) ||
      (Array.isArray(entry.tags) && entry.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(lowerQuery)))
    );

    // Apply deterministic heuristic scoring and sort by score descending
    const scoredResults = results.map(entry => ({
      entry,
      score: this._calculateScore(entry),
    })).sort((a, b) => b.score - a.score).map(({ entry }) => entry);

    return { 
      results: scoredResults.slice(0, maxResults), 
      isStale: this._isStale(scoredResults),
      confidence: 'INFERRED' as Confidence, // Semantic search with scoring = inferred relevance
    };
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
  async getSummary(): Promise<ContextSummary & { isStale: boolean }> {  // MADE ASYNC
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
      isStale: this._isStale(entries),
    };
  }

  /** Remove entries from other projects — identifies by project_path mismatch */
  async removeCrossProjectEntries(): Promise<number> {
    const entries = await this.load();
    const initialCount = entries.length;
    
    // Filter: keep only entries matching this working directory or legacy (no project_path)
    const filtered = entries.filter(e => 
      e.project_path === this.workingDirPath || !e.project_path
    );
    
    if (filtered.length < initialCount) {
      console.log(`[ContextStorage.cleanup] Removed ${initialCount - filtered.length} cross-project entry(s).`);
      await this.save(filtered);
    }
    
    return initialCount - filtered.length;
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
          date: new Date().toLocaleString(),
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
          date: new Date().toLocaleString(),
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
      (e.data && typeof ((e.data as Record<string, unknown>)?.decision) === 'string')  // 🔹 FIX #12: Optional chaining to prevent runtime error
    );

    decisionEvents.forEach(event => {
      const decisionText = ((event.data as { decision?: string })?.decision) || `Decision made at ${event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'unknown time'}`;  // 🔹 FIX #12: Optional chaining on property access
      entries.push({
        id: this.generateId(),
        timestamp: event.timestamp || Date.now(),
        date: event.timestamp ? new Date(event.timestamp).toLocaleString() : new Date().toLocaleString(),
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
        date: new Date().toLocaleString(),
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
    // 🔹 FIX #6: Use crypto.randomBytes (static ESM import, no dynamic require)
    return `ctx_${Date.now()}_${crypto.randomBytes(9).toString('hex')}`;
  }
}

// ==================== Session Index Manager — Lightweight JSON index ===

export interface SessionIndexEntry {
  task_description: string;
  timestamp: number;
  date: string;
}

interface SessionIndexData {
  sessions: SessionIndexEntry[];
  total_count: number;
  last_updated: number;
}

const SESSION_INDEX_MAX_ENTRIES = 50; // Prune oldest when exceeding this limit

export class SessionIndexManager {
  private workingDirPath: string;
  private pluginRootPath: string;
  
  constructor() {
    const wd = getWorkingDir();
    this.workingDirPath = path.join(wd, '.session_context', 'sessions.json');
    
    const baseDir = path.resolve(__dirname, '..');
    this.pluginRootPath = path.join(baseDir, '.session_context', 'sessions.json');
  }

  private async ensureDirectory(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /** Load session index from disk */
  async load(): Promise<SessionIndexData | null> {
    function validateSessionIndexData(obj: unknown): obj is SessionIndexData {
      if (!obj || typeof obj !== 'object') return false;
      const o = obj as Record<string, unknown>;
      return (
        Array.isArray(o.sessions) &&
        typeof o.total_count === 'number' &&
        typeof o.last_updated === 'number'
      );
    }

    // Try working dir first
    try {
      if (await fs.access(this.workingDirPath).then(() => true).catch(() => false)) {
        const raw = await fs.readFile(this.workingDirPath, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        if (!validateSessionIndexData(parsed)) throw new Error('Invalid session index format');
        const data: SessionIndexData = parsed;
        console.log(`[SessionIndex.load] Loaded ${data.sessions.length} sessions from Working Dir.`);
        return data;
      }
    } catch (error) {
      console.warn(`[SessionIndex.load] Failed to load from Working Dir: ${String(error)}`);
    }

    // Fallback to plugin root
    try {
      if (await fs.access(this.pluginRootPath).then(() => true).catch(() => false)) {
        const raw = await fs.readFile(this.pluginRootPath, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        if (!validateSessionIndexData(parsed)) throw new Error('Invalid session index format');
        const data: SessionIndexData = parsed;
        console.log(`[SessionIndex.load] Loaded ${data.sessions.length} sessions from Plugin Root.`);
        return data;
      }
    } catch (error) {
      console.warn(`[SessionIndex.load] Failed to load from Plugin Root: ${String(error)}`);
    }

    console.log('[SessionIndex.load] No session index found.');
    return null;
  }

  /** Save session index to disk */
  async save(data: SessionIndexData): Promise<void> {
    const filePath = this.workingDirPath; // Primary: working dir
    
    await this.ensureDirectory(filePath);
    
    const json = JSON.stringify(data, null, 2);
    const tempPath = filePath + '.tmp';
    await fs.writeFile(tempPath, json, 'utf-8');
    await fs.rename(tempPath, filePath);
    
    // Sync to plugin root as well (best-effort)
    if (this.pluginRootPath !== this.workingDirPath) {
      try {
        await this.ensureDirectory(this.pluginRootPath);
        const pluginTemp = this.pluginRootPath + '.tmp';
        await fs.writeFile(pluginTemp, json, 'utf-8');
        await fs.rename(pluginTemp, this.pluginRootPath);
      } catch (syncError) {
        console.error(`[SessionIndex.save] Failed to sync to plugin root: ${String(syncError)}`);
      }
    }
  }

  /** Add a session entry to the index */
  async addEntry(task_description: string, timestamp: number, date: string): Promise<void> {
    let data = await this.load() || { sessions: [], total_count: 0, last_updated: Date.now() };
    
    // Append new entry (newest first)
    data.sessions.unshift({ task_description, timestamp, date });
    data.last_updated = Date.now();
    
    // Prune oldest entries if exceeding limit
    if (data.sessions.length > SESSION_INDEX_MAX_ENTRIES) {
      data.sessions.splice(SESSION_INDEX_MAX_ENTRIES);
    }
    
    // 🔹 FIX #7: Update total_count AFTER pruning to maintain consistency
    data.total_count = data.sessions.length;
    
    await this.save(data);
  }

  /** Get all sessions sorted by date descending */
  async getAllSessions(): Promise<SessionIndexEntry[]> {
    const data = await this.load();
    return data?.sessions || [];
  }

  /** Search sessions by query (matches task_description) */
  async search(query: string, maxResults: number = 10): Promise<SessionIndexEntry[]> {
    const allSessions = await this.getAllSessions();
    const lowerQuery = query.toLowerCase();
    
    return allSessions
      .filter(s => s.task_description.toLowerCase().includes(lowerQuery))
      .slice(0, maxResults);
  }

  /** Delete a session entry by index position */
  async deleteByIndex(index: number): Promise<boolean> {
    const data = await this.load();
    if (!data || !data.sessions[index]) return false;
    
    data.sessions.splice(index, 1);
    data.total_count = data.sessions.length;
    data.last_updated = Date.now();
    
    await this.save(data);
    return true;
  }

  /** Clear all session index entries */
  async clearAll(): Promise<void> {
    await this.save({ sessions: [], total_count: 0, last_updated: Date.now() });
  }
}

// ==================== Project Registry — Cross-Project Context Locator ===

/** Represents a registered project in the registry */
export interface RegisteredProject {
  name: string;              // Human-readable project name (e.g., "ai_toolbox", "Direct2D App")
  path: string;              // Absolute working directory path
  lastAccessed?: number;     // Timestamp of last access
  sessionCount?: number;     // Number of sessions in this project
  sourceDirs?: string[];     // Known source directories within the project (e.g., "src/", "lib/")
}

/** Registry data structure */
interface ProjectRegistryData {
  projects: RegisteredProject[];
  lastUpdated: number;
}

const PROJECT_REGISTRY_MAX_ENTRIES = 100; // Prune oldest when exceeding this limit

/** Session Index file path — legacy project registration format (StateManager) === */
function getSessionIndexPath(): string {
  const baseDir = path.resolve(__dirname, '..');
  return path.join(baseDir, '.session_index.json');
}

/** Legacy session index entry format from stateManager.ts === */
interface LegacySessionIndexEntry {
  path: string;
  last_session_saved?: number | null;
  status?: 'active' | 'registered';
}

export class ProjectRegistryManager {
  private registryPath: string;  // Stored in plugin root (shared across all projects)
  
  constructor() {
    const baseDir = path.resolve(__dirname, '..');
    this.registryPath = path.join(baseDir, '.session_context', 'project_registry.json');
  }

  /** Ensure the .session_context directory exists */
  private async ensureDirectory(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /** Load legacy session index from .session_index.json (StateManager format) === */
  private async _loadFromSessionIndex(): Promise<RegisteredProject[]> {
    const indexPath = getSessionIndexPath();
    
    try {
      if (!await fs.access(indexPath).then(() => true).catch(() => false)) {
        return [];
      }
      
      const raw = await fs.readFile(indexPath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      
      if (!parsed || typeof parsed !== 'object') return [];
      const o = parsed as Record<string, unknown>;
      
      // Expected format: { projects: { name: { path, last_session_saved, status } } }
      const projectsObj = o.projects;
      if (typeof projectsObj !== 'object' || Array.isArray(projectsObj)) return [];
      
      const legacyEntries = projectsObj as Record<string, LegacySessionIndexEntry>;
      
      // Convert to RegisteredProject[] format
      const projects: RegisteredProject[] = Object.entries(legacyEntries).map(([name, entry]) => ({
        name,
        path: entry.path,
        lastAccessed: entry.last_session_saved || undefined,
        sessionCount: 0, // Not tracked in legacy format
        sourceDirs: [],    // Not tracked in legacy format
      }));
      
      console.log(`[ProjectRegistry._loadFromSessionIndex] Loaded ${projects.length} project(s) from .session_index.json fallback.`);
      return projects;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[ProjectRegistry._loadFromSessionIndex] Failed to load session index: ${message}`);
      return [];
    }
  }

  /** 🔹 FIX: Auto-sync project registry from session memory files.
   * Scans all known project paths for .ai_toolbox_memory.msgpack files,
   * extracts their project_path field, and registers any missing projects.
   * Called lazily before getAllProjects() to ensure registry freshness after restarts. */
  private async _syncFromSessionMemory(): Promise<void> {
    const data = await this.load();
    if (!data) return;

    // Get all registered project paths for quick lookup
    const registeredPaths = new Set(data.projects.map(p => p.path));

    // Scan each registered project's working directory for session memory files
    for (const project of data.projects) {
      const memPath = path.join(project.path, '.session_context', '.ai_toolbox_memory.msgpack');
      
      try {
        if (!await fs.access(memPath).then(() => true).catch(() => false)) {
          continue; // No session memory for this project — skip
        }

        const buffer = await fs.readFile(memPath);
        const entries = decode(buffer) as ContextEntry[];

        // Extract unique project_path values from entries (identifies which projects created this data)
        const discoveredPaths = new Set(
          entries
            .filter((e): e is ContextEntry & { project_path: string } => 
              e.project_path != null && typeof e.project_path === 'string'
            )
            .map(e => e.project_path)
        );

        // Register any newly discovered projects not already in registry
        for (const discoveredPath of discoveredPaths) {
          if (!registeredPaths.has(discoveredPath)) {
            const projectName = path.basename(discoveredPath);
            console.log(`[ProjectRegistry._syncFromSessionMemory] Auto-registering discovered project: "${projectName}" at ${discoveredPath}`);
            
            // Register the new project (this will also save to disk)
            await this.registerProject(projectName, discoveredPath);
            registeredPaths.add(discoveredPath);
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`[ProjectRegistry._syncFromSessionMemory] Failed to sync session memory for ${project.path}: ${msg}`);
        // Non-fatal — continue scanning other projects
      }
    }

    // Also scan plugin root fallback (legacy entries without project_path)
    const legacyMemPath = path.join(path.resolve(__dirname, '..'), '.session_context', '.ai_toolbox_memory.msgpack');
    try {
      if (!await fs.access(legacyMemPath).then(() => true).catch(() => false)) {
        return; // No plugin root memory file — nothing to sync
      }

      const buffer = await fs.readFile(legacyMemPath);
      const entries = decode(buffer) as ContextEntry[];

      // Legacy entries without project_path — extract from session_summary_latest if available
      const summaryEntries = entries.filter(e => 
        e.type === 'summary' && e.title?.toLowerCase().includes('session context summary')
      );

      for (const summary of summaryEntries) {
        // Try to extract working directory path from session summary content
        const wdMatch = summary.content.match(/working dir|working directory|path[:\s]+([A-Z]:\\[^"'\s]+)/i);
        if (wdMatch && wdMatch[1]) {
          const extractedPath = wdMatch[1].replace(/["']$/g, ''); // Remove trailing quote if present
          
          if (!registeredPaths.has(extractedPath)) {
            console.log(`[ProjectRegistry._syncFromSessionMemory] Auto-registering legacy project: "${path.basename(extractedPath)}" at ${extractedPath}`);
            await this.registerProject(path.basename(extractedPath), extractedPath);
            registeredPaths.add(extractedPath);
          }
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[ProjectRegistry._syncFromSessionMemory] Failed to sync legacy session memory: ${msg}`);
    }
  }

  /** Load project registry from disk */
  async load(): Promise<ProjectRegistryData | null> {
    function validateProjectRegistryData(obj: unknown): obj is ProjectRegistryData {
      if (!obj || typeof obj !== 'object') return false;
      const o = obj as Record<string, unknown>;
      return (
        Array.isArray(o.projects) &&
        typeof o.lastUpdated === 'number'
      );
    }

    try {
      if (await fs.access(this.registryPath).then(() => true).catch(() => false)) {
        const raw = await fs.readFile(this.registryPath, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        if (!validateProjectRegistryData(parsed)) throw new Error('Invalid project registry format');
        const data: ProjectRegistryData = parsed;
        console.log(`[ProjectRegistry.load] Loaded ${data.projects.length} projects.`);
        return data;
      }
    } catch (error) {
      console.warn(`[ProjectRegistry.load] Failed to load from disk: ${String(error)}`);
    }

    console.log('[ProjectRegistry.load] No project registry found.');
    return null;
  }

  /** Save project registry to disk */
  async save(data: ProjectRegistryData): Promise<void> {
    const filePath = this.registryPath; // Primary: plugin root (shared)
    
    await this.ensureDirectory(filePath);
    
    const json = JSON.stringify(data, null, 2);
    const tempPath = filePath + '.tmp';
    await fs.writeFile(tempPath, json, 'utf-8');
    await fs.rename(tempPath, filePath);
    
    console.log(`[ProjectRegistry.save] Saved ${data.projects.length} projects.`);
  }

  /** Register or update a project in the registry */
  async registerProject(projectName: string, workingDirPath: string, sourceDirs?: string[]): Promise<void> {
    let data = await this.load() || { projects: [], lastUpdated: Date.now() };
    
    // Check if project already exists (match by path)
    const existingIdx = data.projects.findIndex(p => p.path === workingDirPath);
    
    if (existingIdx !== -1) {
      // Update existing project
      data.projects[existingIdx].name = projectName;
      data.projects[existingIdx].lastAccessed = Date.now();
      data.projects[existingIdx].sourceDirs = sourceDirs || data.projects[existingIdx].sourceDirs;
      console.log(`[ProjectRegistry.register] Updated project: ${projectName}`);
    } else {
      // Add new project (newest first)
      const newProject: RegisteredProject = {
        name: projectName,
        path: workingDirPath,
        lastAccessed: Date.now(),
        sessionCount: 0,
        sourceDirs: sourceDirs || [],
      };
      
      data.projects.unshift(newProject);
      console.log(`[ProjectRegistry.register] Registered new project: ${projectName}`);
    }
    
    data.lastUpdated = Date.now();
    
    // Prune oldest entries if exceeding limit
    if (data.projects.length > PROJECT_REGISTRY_MAX_ENTRIES) {
      data.projects.splice(PROJECT_REGISTRY_MAX_ENTRIES);
    }
    
    await this.save(data);
  }

  /** Get project info by working directory path. ===
   * Falls back to .session_index.json if primary registry is empty/missing. */
  async getProjectByPath(workingDirPath: string): Promise<RegisteredProject | null> {
    const data = await this.load();
    
    // Primary: project_registry.json
    const found = data?.projects.find(p => p.path === workingDirPath);
    if (found) return found;
    
    // Fallback: .session_index.json
    const fallback = await this._loadFromSessionIndex();
    return fallback.find(p => p.path === workingDirPath) || null;
  }

  /** Get all registered projects sorted by last access (newest first). ===
   * Falls back to .session_index.json if primary registry is empty/missing.
   * 🔹 FIX: Auto-syncs from session memory files before returning results. */
  async getAllProjects(): Promise<RegisteredProject[]> {
    // 🔹 FIX: Lazy auto-sync — scan for projects with persisted session memory and register them
    await this._syncFromSessionMemory();

    const data = await this.load();
    
    // Primary: project_registry.json
    if (data && data.projects.length > 0) {
      console.log(`[ProjectRegistry.getAllProjects] Loaded ${data.projects.length} project(s) from primary registry.`);
      return data.projects;
    }
    
    // Fallback: .session_index.json (StateManager legacy format)
    const fallback = await this._loadFromSessionIndex();
    if (fallback.length > 0) {
      console.log(`[ProjectRegistry.getAllProjects] Primary registry empty. Loaded ${fallback.length} project(s) from session index fallback.`);
      return fallback;
    }
    
    console.log('[ProjectRegistry.getAllProjects] No projects found in any registry.');
    return [];
  }

  /** Increment session count for a project */
  async incrementSessionCount(workingDirPath: string): Promise<void> {
    let data = await this.load() || { projects: [], lastUpdated: Date.now() };
    
    const existingIdx = data.projects.findIndex(p => p.path === workingDirPath);
    if (existingIdx !== -1) {
      data.projects[existingIdx].sessionCount = (data.projects[existingIdx].sessionCount || 0) + 1;
      await this.save(data);
    }
  }

  /** Search projects by name or path. ===
   * Uses getAllProjects() which already includes session index fallback + auto-sync from session memory. */
  async search(query: string, maxResults: number = 10): Promise<RegisteredProject[]> {
    // 🔹 FIX: getAllProjects() now calls _syncFromSessionMemory() internally — no need to call it again here
    const allProjects = await this.getAllProjects();
    const lowerQuery = query.toLowerCase();
    
    return allProjects
      .filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.path.toLowerCase().includes(lowerQuery)
      )
      .slice(0, maxResults);
  }

  /** Get context storage path for a specific project */
  async getContextStoragePath(workingDirPath: string): Promise<string | null> {
    // Return the working directory's session_context path if it exists
    const localContextPath = path.join(workingDirPath, '.session_context', '.ai_toolbox_memory.msgpack');
    
    try {
      await fs.access(localContextPath);
      console.log(`[ProjectRegistry.getContextStoragePath] Found context storage for project: ${localContextPath}`);
      return localContextPath;
    } catch {
      // Try plugin root fallback (legacy entries only)
      const fallbackPath = path.join(path.resolve(__dirname, '..'), '.session_context', '.ai_toolbox_memory.msgpack');
      try {
        await fs.access(fallbackPath);
        console.log(`[ProjectRegistry.getContextStoragePath] Using plugin root fallback: ${fallbackPath}`);
        return fallbackPath;
      } catch {
        return null;
      }
    }
  }

  /** Clear all session index entries */
  async clearAll(): Promise<void> {
    await this.save({ projects: [], lastUpdated: Date.now() });
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
  const sessionIndex = new SessionIndexManager();

  /** 🔹 FIX #18 (2026-08-22): Self-describing session-index metadata. get_session_summary returns only the LATEST
   * summary by design — but its response previously carried NO signal that N earlier sessions exist in the index,
   * making "fresh project with 1 session" indistinguishable from a long history (root cause of a real misread on
   * 2026-08-22: 21 indexed sessions invisible to consumers). Surfaces index size + recent task descriptions so
   * callers are routed to list_sessions / search_sessions for earlier history. */
  const getSessionIndexMeta = async (currentTaskDescription?: string): Promise<{
    total_sessions: number;
    other_recent_sessions: Array<{ task_description: string; date: string }>;
    hint: string;
  } | undefined> => {
    try {
      const allSessions = await sessionIndex.getAllSessions();
      if (!allSessions || allSessions.length === 0) return undefined;

      const others = allSessions
        .filter(s => s.task_description !== currentTaskDescription)
        .slice(0, 3);

      return {
        total_sessions: allSessions.length,
        other_recent_sessions: others.map(s => ({ task_description: s.task_description.slice(0, 200), date: s.date })),
        hint: `This tool returns only the LATEST session summary. ${allSessions.length} session(s) are indexed — use list_sessions (paginated browse) or search_sessions (query) to access earlier sessions.`,
      };
    } catch (metaErr) {
      const msg = metaErr instanceof Error ? metaErr.message : String(metaErr);
      console.warn(`[ContextManagement.get_session_summary] Session-index metadata unavailable: ${msg}`);
      return undefined;
    }
  };

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
        data: z.unknown().optional(),
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
        const result = await storageManager.getRecentEntries(limit || 20, type);  // ASYNC call

        // 🔹 FIX #18 (2026-08-22): Self-describing empty results — report what the store actually holds so an
        // empty entry list can never be mistaken for "no memory exists" (the file may hold other record types,
        // e.g. session_summary_latest served by get_session_summary). Previously this information was only logged to stderr.
        const storeDiagnostics = await storageManager.getStoreDiagnostics();

        let note: string | undefined;
        if (result.data.length === 0 && storeDiagnostics.storage_file_exists) {
          if (storeDiagnostics.total_records_in_file > 0 && storeDiagnostics.context_entries_found === 0) {
            const keys = storeDiagnostics.non_context_record_keys?.join(', ') || 'state records';
            note = `Storage file exists but holds ${storeDiagnostics.total_records_in_file} record(s) of other type(s): [${keys}]. Those are served by get_session_summary/get_memory — no context entries have been saved yet (use track_important_event to add one).`;
          } else {
            note = 'Storage file exists and is readable but currently holds 0 records.';
          }
        }

        return { 
          success: true, 
          data: { 
            entries: result.data, 
            isStale: result.isStale,
            confidence: result.confidence,
            provenance: 'get_context_memory' as const,
            store_diagnostics: storeDiagnostics,
            ...(note ? { note } : {}),
          } 
        };
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
        const result = await storageManager.searchEntries(query, max_results || 10);  // ASYNC call
        
        return { 
          success: true, 
          data: { 
            results: result.results, 
            isStale: result.isStale,
            confidence: result.confidence,
            provenance: 'search_context' as const,
          } 
        };
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
          date: new Date().toLocaleString(),
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
      task_description: z.string().min(1).max(2500).describe('Brief description of what was being worked on (max 2.5KB)'),
      accomplishments: z.string().max(2500).optional().describe('List key accomplishments or completed tasks (max 2.5KB)'),
      pending_tasks: z.string().max(2500).optional().describe('List remaining work that needs to continue in the next session (max 2.5KB)'),
      decisions_made: z.string().max(2500).optional().describe('Key architectural or implementation decisions made during this session (max 2.5KB)'),
      context_for_next_session: z.string().max(2500).optional().describe('Important context, file locations, or setup steps needed for the next session (max 2.5KB)'),
    },
    implementation: async ({ task_description, accomplishments, pending_tasks, decisions_made, context_for_next_session }: { 
      readonly task_description: string; 
      readonly accomplishments?: string; 
      readonly pending_tasks?: string; 
      readonly decisions_made?: string; 
      readonly context_for_next_session?: string; 
    }) => {
      try {
        // 🔹 FIX #3: Declare index save status at function scope for visibility across branches
        let indexSaveSuccess = true;

        // 🔹 P0 FIX: Truncate large content fields to prevent state cap overflow.
        // Each field is capped at 2 KB (2048 chars). This prevents a single session summary
        // from consuming excessive memory, especially in long sessions with verbose LLM output.
        const MAX_FIELD_LENGTH = 2048;
        const TRUNCATION_SUFFIX = '\n… (truncated for size)'; // 21 chars
        const SAFE_SLICE_LEN = MAX_FIELD_LENGTH - TRUNCATION_SUFFIX.length; // 2027
        
        const truncate = (text?: string): { content: string; truncated: boolean } => {
          if (!text || text.length <= MAX_FIELD_LENGTH) return { content: text ?? '', truncated: false };
          console.warn(`[save_session_summary] Truncated field from ${text.length} to ${MAX_FIELD_LENGTH} chars.`);
          return { 
            content: text.slice(0, SAFE_SLICE_LEN) + TRUNCATION_SUFFIX, 
            truncated: true 
          };
        };

        // 🔹 FIX #3: Cache truncate results to avoid double-calls (performance + logic)
        const taskDesc = truncate(task_description);
        const accomplishmentsTrunc = truncate(accomplishments);
        const pendingTasksTrunc = truncate(pending_tasks);
        const decisionsMadeTrunc = truncate(decisions_made);
        const contextForNextSessionTrunc = truncate(context_for_next_session);

        const summaryData: SessionSummaryData = {
          task_description: taskDesc.content,
          accomplishments: accomplishmentsTrunc.content,
          pending_tasks: pendingTasksTrunc.content,
          decisions_made: decisionsMadeTrunc.content,
          context_for_next_session: contextForNextSessionTrunc.content,
          timestamp: Date.now(),
          date: new Date().toLocaleString(),
        };

        if (memoryStore) {
          console.log('[ContextManagement.save_session_summary] memoryStore exists, setting data...');
          
          // 🔹 P0 FIX: Evict ALL previous session summaries before saving the new one.
          // This prevents unbounded accumulation of duplicate entries across sessions.
          const allKeys = await memoryStore.getAllKeys();
          let evictedCount = 0;
          for (const key of allKeys) {
            // 🔹 FIX #6: Only evict the authoritative key, not all session_summary_* variants
            if (key === 'session_summary_latest') {
              memoryStore.delete(key);
              evictedCount++;
            }
          }
          if (evictedCount > 0) {
            console.log(`[save_session_summary] Evicted ${evictedCount} old session summary(s).`);
          }

          // 🔹 FIX #1: Set new summary BEFORE forceSave to guarantee atomic state transition
          memoryStore.set('session_summary_latest', summaryData);
          
          // 🔹 FIX #3a: Flush StateManager FIRST to guarantee durable summary on disk
          try {
            console.log('[ContextManagement.save_session_summary] Calling forceSave()...');
            await memoryStore.forceSave();
            console.log('[ContextManagement.save_session_summary] forceSave() completed.');
          } catch (diskErr) {
            const msg = diskErr instanceof Error ? diskErr.message : String(diskErr);
            console.error(`[save_session_summary] Disk persistence FAILED: ${msg}`);
            return { success: false, error: `Failed to persist session summary to disk: ${msg}` };
          }

          // 🔹 FIX #3b: Now safely update index (disk is already durable)
          try {
            await sessionIndex.addEntry(summaryData.task_description, Date.now(), new Date().toLocaleString());
          } catch (indexErr) {
            const msg = indexErr instanceof Error ? indexErr.message : String(indexErr);
            console.warn(`[save_session_summary] Session index update failed (summary already persisted): ${msg}`);
            indexSaveSuccess = false; // Non-fatal — summary is safe on disk
          }

        } else {
          // 🔹 FIX #4: Return error when StateManager is null to prevent silent data loss
          console.error('[ContextManagement.save_session_summary] ❌ No StateManager provided — persistence DISABLED.');
          return { 
            success: false, 
            error: 'StateManager not available. Session summary saved to RAM only and will be lost on reload.' 
          };
        }

        // 🔹 FIX #3 (continued): Use cached truncate results for truncatedFields calculation
        const truncatedFields = [
          ...(accomplishmentsTrunc.truncated ? ['accomplishments'] : []),
          ...(pendingTasksTrunc.truncated ? ['pending_tasks'] : []),
          ...(decisionsMadeTrunc.truncated ? ['decisions_made'] : []),
          ...(contextForNextSessionTrunc.truncated ? ['context_for_next_session'] : []),
        ];

        return { 
          success: true, 
          data: { 
            saved: true, 
            task_description: summaryData.task_description,
            truncatedFields,
            indexUpdated: indexSaveSuccess // Already boolean — no ?? needed
          } 
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.save_session_summary] ERROR: ${message}`);
        return { success: false, error: `Failed to save session summary: ${message}` };
      }
    },
  }));

  // get_session_summary tool — OPTIMIZED: In-Memory Map (O(1)) → Disk Fallback ===
  tools.push(tool({
    name: 'get_session_summary',
    description: `Retrieve the most recent saved session summary for continuity across sessions.\n\nPRIORITY ORDER:\n1. In-Memory State (RAM) — O(1) Map lookup, fastest\n2. Local Project File (Working Dir/.session_context/) — Fallback disk read\n3. Plugin Root Memory (Plugin Dir/.session_context/) — Last resort disk read`,
    parameters: {},
    implementation: async () => {
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      // 🔹 PRIORITY 1: In-Memory Map (O(1) lookup — no disk I/O, no full-file scan)
      if (memoryStore) {
        try {
          const latest = memoryStore.get<SessionSummaryData>('session_summary_latest');
          if (latest && typeof latest === 'object') {
            const isStale = (Date.now() - (latest.timestamp ?? 0)) > threeDaysMs;
            console.log(`[ContextManagement.get_session_summary] ✅ Loaded from IN-MEMORY STATE (RAM).`);
            // 🔹 FIX #18: attach session-index metadata — a single-summary response must not look like "no history"
            const sessionIndexMeta = await getSessionIndexMeta(latest.task_description);
            return { success: true, data: { ...latest, isStale, ...(sessionIndexMeta ? { session_index_meta: sessionIndexMeta } : {}) } };
          }
        } catch (memErr) {
          const msg = memErr instanceof Error ? memErr.message : String(memErr);
          console.warn(`[ContextManagement.get_session_summary] Memory lookup failed (${msg}). Falling back to disk.`);
        }
      }

      // 🔹 FIX #7 (write/read symmetry): Read StateEntry[] from project-specific memory file
      interface StateEntry { key: string; value: unknown; timestamp: number }
      
      try {
        const wd = getWorkingDir();
        // Try project-specific path first, then legacy fallback
        const projectName = path.basename(wd).toLowerCase().replace(/[^a-z0-9]/g, '_');
        const projectPath = path.join(wd, '.session_context', `.${projectName}_memory.msgpack`);
        const legacyPath = path.join(wd, '.session_context', '.ai_toolbox_memory.msgpack');
        
        let diskBuffer: Buffer | null = null;
        for (const candidate of [projectPath, legacyPath]) {
          if (await fs.access(candidate).then(() => true).catch(() => false)) {
            diskBuffer = await fs.readFile(candidate);
            console.log(`[ContextManagement.get_session_summary] ✅ Disk fallback read from: ${candidate}`);
            break;
          }
        }
        
        if (diskBuffer) {
          const entries = decode(diskBuffer) as StateEntry[];
          
          // 🔹 FIX #7: Look for 'session_summary_latest' by key (StateEntry format)
          const summaryEntry = entries.find(e => e.key === 'session_summary_latest');
          if (summaryEntry && typeof summaryEntry.value === 'object' && summaryEntry.value !== null) {
            const parsedSummary = summaryEntry.value as SessionSummaryData;
            console.log(`[ContextManagement.get_session_summary] ✅ Loaded from DISK FALLBACK (.msgpack, StateEntry format).`);
            // 🔹 FIX #18: attach session-index metadata (same contract as the RAM path)
            const sessionIndexMeta = await getSessionIndexMeta(parsedSummary.task_description);
            return { 
              success: true, 
              data: { ...parsedSummary, isStale: (Date.now() - (parsedSummary.timestamp ?? 0)) > threeDaysMs, ...(sessionIndexMeta ? { session_index_meta: sessionIndexMeta } : {}) } 
            };
          } else if (summaryEntry && typeof summaryEntry.value === 'string') {
            // Legacy format: value stored as JSON string instead of object
            try {
              const parsedSummary = JSON.parse(summaryEntry.value) as SessionSummaryData;
              console.log(`[ContextManagement.get_session_summary] ✅ Loaded from DISK FALLBACK (.msgpack, legacy string format).`);
              // 🔹 FIX #18: attach session-index metadata (same contract as the RAM path)
              const sessionIndexMeta = await getSessionIndexMeta(parsedSummary.task_description);
              return { 
                success: true, 
                data: { ...parsedSummary, isStale: (Date.now() - (parsedSummary.timestamp ?? 0)) > threeDaysMs, ...(sessionIndexMeta ? { session_index_meta: sessionIndexMeta } : {}) } 
              };
            } catch {
              console.warn(`[ContextManagement.get_session_summary] Legacy string value not valid JSON.`);
            }
          }
        }
      } catch (diskErr) {
        console.warn(`[ContextManagement.get_session_summary] Disk fallback failed: ${String(diskErr)}`);
      }

      // 🔹 FINAL: No data found anywhere — FIX #21 (2026-08-28): self-describing failure.
      // Previously returned a bare "No session summary found." identical to a genuinely fresh project,
      // making it impossible for callers to distinguish "summary lost/corrupted" from "never saved".
      console.log(`[ContextManagement.get_session_summary] ❌ No session summary found.`);

      // Surface what IS in the lightweight index so the caller (LLM/user) can still recover history.
      const fallback = await getSessionIndexMeta();
      if (fallback && fallback.total_sessions > 0) {
        console.log(`[ContextManagement.get_session_summary] ⚠️ But ${fallback.total_sessions} session(s) exist in index — reporting metadata.`);
        return {
          success: false,
          error: 'No detailed session summary found in storage (possibly lost to a fresh-start overwrite).',
          data: {
            note: `The latest-summary record is missing from .msgpack storage, but ${fallback.total_sessions} past sessions ARE indexed in sessions.json. Use list_sessions() or read .session_context/sessions.json directly to review full history.`,
            ...fallback,
          },
        };
      }

      return { success: false, error: 'No session summary found.' };
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
          // 🔹 FIX #21 Part B (2026-08-28): Guard against fresh-start data loss.
          const preSaveKeys = await memoryStore.getAllKeys();
          if (preSaveKeys.length === 0) {
            console.warn('[ContextManagement.save_memory] ⚠️ StateManager has ZERO prior entries in RAM. ' +
              'This forceSave() will create a FRESH .msgpack file containing only this entry — any previously ' +
              'persisted session summaries or context records WILL BE LOST.');
          }

          memoryStore.set(key, { fact, timestamp: Date.now(), date: new Date().toLocaleString() });
          await memoryStore.forceSave(); // Immediate disk persistence
        } else {
          console.log('[ContextManagement] No StateManager provided. Memory saved to RAM only.');
        }

        return { success: true, data: { saved: true, key } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to save memory: ${message}` };
      }
    },
  }));

  // get_memory tool — LOCAL FIRST: Read project file → Fallback to RAM/Plugin ===
  tools.push(tool({
    name: 'get_memory',
    description: `Retrieve all saved memory entries. Returns a list of all facts stored via save_memory.\n\nPRIORITY ORDER:\n1. Local Project File (Working Dir/.session_context/) — Checked FIRST\n2. Plugin Root Memory (Plugin Dir/.session_context/) — Fallback\n3. In-Memory State (RAM) — Last resort`,
    parameters: {},
    implementation: async () => {
      try {
        const wd = getWorkingDir();
        const localPath = path.join(wd, '.session_context', '.ai_toolbox_memory.msgpack');

        // 🔹 PRIORITY 1: Check Local Project File FIRST
        if (await fs.access(localPath).then(() => true).catch(() => false)) {
          try {
            const buffer = await fs.readFile(localPath);
            const entries = decode(buffer) as Array<{ key: string; value: unknown; timestamp: number }>;
            
            // Filter memory_ keys from local file
            const memories = entries
              .filter(e => e.key.startsWith('memory_'))
              .map(e => ({ key: e.key, value: e.value }))
              .filter(m => m.value !== undefined);

            if (memories.length > 0) {
              console.log(`[ContextManagement.get_memory] ✅ Loaded ${memories.length} entries from LOCAL PROJECT FILE.`);
              return { success: true, data: memories };
            }

            // 🔹 FIX #18 (2026-08-22): Self-describing empty result — the file EXISTS and holds records of other types;
            // previously this fell through to an ambiguous "No memory entries found" error identical to "no store at all".
            const presentKeys = [...new Set(
              (entries as Array<{ key?: unknown }>)
                .map(e => e && typeof e === 'object' ? e.key : undefined)
                .filter((k): k is string => typeof k === 'string')
            )].slice(0, 10);
            console.log(`[ContextManagement.get_memory] Local file exists but holds 0 memory_* records (present keys: ${presentKeys.join(', ') || 'none'}).`);
            return {
              success: true,
              data: {
                memories: [] as Array<{ key: string; value: unknown }>,
                store_diagnostics: { storage_file_exists: true, source: 'local_project_file', total_records_in_file: (entries as unknown[]).length, memory_entries_found: 0, other_record_keys: presentKeys },
              },
            };
          } catch (parseErr) {
            console.warn(`[ContextManagement.get_memory] Local file parse failed: ${String(parseErr)}. Falling back.`);
          }
        }

        // 🔹 FALLBACK 1: Plugin Root File
        const pluginPath = path.join(path.resolve(__dirname, '..'), '.session_context', '.ai_toolbox_memory.msgpack');
        if (await fs.access(pluginPath).then(() => true).catch(() => false)) {
          try {
            const buffer = await fs.readFile(pluginPath);
            const entries = decode(buffer) as Array<{ key: string; value: unknown; timestamp: number }>;
            
            const memories = entries
              .filter(e => e.key.startsWith('memory_'))
              .map(e => ({ key: e.key, value: e.value }))
              .filter(m => m.value !== undefined);
            
            if (memories.length > 0) {
              console.log(`[ContextManagement.get_memory] ✅ Loaded ${memories.length} entries from PLUGIN ROOT FILE.`);
              return { success: true, data: memories };
            }
          } catch (parseErr) {
            console.warn(`[ContextManagement.get_memory] Plugin file parse failed: ${String(parseErr)}. Falling back to RAM.`);
          }
        }

        // 🔹 FALLBACK 2: In-Memory State (RAM)
        if (memoryStore) {
          await memoryStore.forceLoad();
          
          const keys = await memoryStore.getAllKeys();
          const memories = keys
            .filter(k => k.startsWith('memory_'))
            .map(k => ({ key: k, value: memoryStore.get<unknown>(k) }))
            .filter(m => m.value !== undefined);
          
          if (memories.length > 0) {
            console.log(`[ContextManagement.get_memory] ⚠️ Loaded ${memories.length} entries from IN-MEMORY STATE (RAM).`);
            return { success: true, data: memories };
          }
        }

        console.log(`[ContextManagement.get_memory] ❌ No memory entries found in any location.`);
        return { success: false, error: 'No memory entries found.' };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.get_memory] ERROR: ${message}`);
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
          console.log('[ContextManagement] No StateManager provided. Cannot delete from disk.');
          return { success: false, error: 'StateManager not available.' };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete memory: ${message}` };
      }
    },
  }));

  // list_sessions tool — BROWSE ALL SAVED SESSIONS BY TASK DESCRIPTION + DATE ===
  tools.push(tool({
    name: 'list_sessions',
    description: `Browse all saved session summaries. Returns a paginated list of sessions with task descriptions and dates.
    
WHEN TO USE:
• User asks "what sessions have I worked on?" or "show me my history"
• You need to find a specific past session before reading its full summary
• Cross-session continuity — discover what work was done in previous days/weeks`,
    parameters: {
      limit: z.number().min(1).max(50).optional().default(20).describe('Maximum number of sessions to return (default: 20)'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset for browsing older sessions'),
    },
    implementation: async ({ limit = 20, offset = 0 }: { 
      readonly limit?: number; 
      readonly offset?: number; 
    }) => {
      try {
        const allSessions = await sessionIndex.getAllSessions();
        const total = allSessions.length;
        
        // Apply pagination (sessions are already sorted newest-first)
        const paginated = allSessions.slice(offset, offset + limit);
        
        return { success: true, data: { sessions: paginated, total, hasMore: offset + limit < total } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.list_sessions] ERROR: ${message}`);
        return { success: false, error: `Failed to list sessions: ${message}` };
      }
    },
  }));

  // search_sessions tool — SEARCH SESSION INDEX BY TASK DESCRIPTION ===
  tools.push(tool({
    name: 'search_sessions',
    description: `Search saved session summaries by task description. Returns matching sessions sorted by date (newest first).`,
    parameters: {
      query: z.string().describe('Search query to match against task descriptions'),
      max_results: z.number().min(1).max(50).optional().default(10).describe('Maximum number of results to return'),
    },
    implementation: async ({ query, max_results = 10 }: { 
      readonly query: string; 
      readonly max_results?: number; 
    }) => {
      try {
        const results = await sessionIndex.search(query, max_results);
        
        return { success: true, data: { sessions: results, total: results.length } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.search_sessions] ERROR: ${message}`);
        return { success: false, error: `Failed to search sessions: ${message}` };
      }
    },
  }));

  // clear_session_index tool — CLEAR ALL SESSION INDEX ENTRIES ===
  tools.push(tool({
    name: 'clear_session_index',
    description: 'Clear all session index entries. This only removes the lightweight index (sessions.json), not the actual session summaries.',
    parameters: {
      confirm: z.boolean().describe('Set to true to confirm deletion of all session index entries'),
    },
    implementation: async ({ confirm }: { readonly confirm: boolean }) => {
      if (!confirm) {
        return { success: false, error: 'Confirmation required. Set confirm=true to proceed.' };
      }
      
      try {
        await sessionIndex.clearAll();
        
        return { success: true, data: { cleared: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.clear_session_index] ERROR: ${message}`);
        return { success: false, error: `Failed to clear session index: ${message}` };
      }
    },
  }));

  // ==================== Project Registry Tools ===

  const projectRegistry = new ProjectRegistryManager();

  // register_project tool — REGISTER OR UPDATE A PROJECT IN THE REGISTRY ===
  tools.push(tool({
    name: 'register_project',
    description: `Register or update a project in the cross-project registry. This enables switching between projects and accessing their session memory.\n\nWHEN TO USE:\n• When starting work on a new project directory\n• When user changes working directory to a different project\n• Before saving context for a specific project`,
    parameters: {
      project_name: z.string().describe('Human-readable project name (e.g., "ai_toolbox", "Direct2D App")'),
      working_dir_path: z.string().describe('Absolute path to the project working directory'),
      source_dirs: z.array(z.string()).optional().describe('Known source directories within the project (e.g., ["src/", "lib/"])'),
    },
    implementation: async ({ project_name, working_dir_path, source_dirs }: { 
      readonly project_name: string; 
      readonly working_dir_path: string; 
      readonly source_dirs?: string[]; 
    }) => {
      try {
        await projectRegistry.registerProject(project_name, working_dir_path, source_dirs);
        
        return { success: true, data: { registered: true, project_name } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.register_project] ERROR: ${message}`);
        return { success: false, error: `Failed to register project: ${message}` };
      }
    },
  }));

  // get_project_info tool — GET INFO ABOUT A SPECIFIC PROJECT ===
  tools.push(tool({
    name: 'get_project_info',
    description: `Get information about a specific registered project by its working directory path.`,
    parameters: {
      working_dir_path: z.string().describe('Absolute path to the project working directory'),
    },
    implementation: async ({ working_dir_path }: { readonly working_dir_path: string }) => {
      try {
        const project = await projectRegistry.getProjectByPath(working_dir_path);
        
        if (!project) {
          return { success: false, error: `Project not found for path: ${working_dir_path}` };
        }
        
        return { success: true, data: project };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.get_project_info] ERROR: ${message}`);
        return { success: false, error: `Failed to get project info: ${message}` };
      }
    },
  }));

  // list_projects tool — LIST ALL REGISTERED PROJECTS ===
  tools.push(tool({
    name: 'list_projects',
    description: `List all registered projects in the cross-project registry. Shows project names, paths, last accessed time, and session counts.\n\nWHEN TO USE:\n• User asks "what projects have I worked on?"\n• Before switching to a different project's context\n• Checking which projects are tracked`,
    parameters: {},
    implementation: async () => {
      try {
        const projects = await projectRegistry.getAllProjects();
        
        return { success: true, data: { projects } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.list_projects] ERROR: ${message}`);
        return { success: false, error: `Failed to list projects: ${message}` };
      }
    },
  }));

  // search_projects tool — SEARCH PROJECTS BY NAME OR PATH ===
  tools.push(tool({
    name: 'search_projects',
    description: `Search registered projects by name or path.`,
    parameters: {
      query: z.string().describe('Search query to match against project names or paths'),
      max_results: z.number().min(1).max(50).optional().default(10).describe('Maximum number of results to return'),
    },
    implementation: async ({ query, max_results = 10 }: { 
      readonly query: string; 
      readonly max_results?: number; 
    }) => {
      try {
        const results = await projectRegistry.search(query, max_results);
        
        return { success: true, data: { projects: results } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.search_projects] ERROR: ${message}`);
        return { success: false, error: `Failed to search projects: ${message}` };
      }
    },
  }));

  // switch_context tool — SWITCH TO A DIFFERENT PROJECT'S CONTEXT STORAGE ===
  tools.push(tool({
    name: 'switch_context',
    description: `Switch the context storage to a different project's working directory. This allows accessing session memory from another project.\n⚠️ The working directory is NOT changed by this tool — file operations still target the current CWD. If you also want file operations to run in that project, call change_directory afterwards with the same path.\n\nWHEN TO USE:\n• User explicitly asks to switch to another project's context\n• When working on multiple projects in the same LM Studio instance`,
    parameters: {
      target_working_dir_path: z.string().describe('Absolute path to the target project\'s working directory'),
    },
    implementation: async ({ target_working_dir_path }: { readonly target_working_dir_path: string }) => {
      try {
        // Check if project is registered
        const project = await projectRegistry.getProjectByPath(target_working_dir_path);
        
        if (!project) {
          console.warn(`[ContextManagement.switch_context] Project not registered. Registering it now.`);
          await projectRegistry.registerProject(
            path.basename(target_working_dir_path), // Use directory name as fallback
            target_working_dir_path
          );
        }
        
        // Get context storage path for the target project
        const contextPath = await projectRegistry.getContextStoragePath(target_working_dir_path);
        
        if (!contextPath) {
          return { success: false, error: `No context storage found for project: ${target_working_dir_path}` };
        }
        
        // 🔹 FIX #10: Validate contextPath before unsafe cast — ensure it's a valid msgpack file path
        try {
          await fs.access(contextPath);  // Verify file exists and is readable
        } catch {
          console.warn(`[ContextManagement.switch_context] Invalid context path detected: ${contextPath}`);
          return { success: false, error: `Invalid context storage path: ${contextPath}` };
        }
        
        // Update storage manager's working directory path for project switching
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- Required to switch internal workingDirPath for cross-project context access
        (storageManager as any).workingDirPath = contextPath;
        
        console.log(`[ContextManagement.switch_context] Switched to project: ${project?.name || path.basename(target_working_dir_path)}`);
        
        return { 
          success: true, 
          data: { 
            switched: true, 
            target_path: target_working_dir_path,
            context_storage_path: contextPath,
            project_name: project?.name || path.basename(target_working_dir_path),
            working_dir_unchanged: true,
            hint: 'The working directory was NOT changed. Call change_directory with the same path if file operations should target this project.',
          } 
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ContextManagement.switch_context] ERROR: ${message}`);
        return { success: false, error: `Failed to switch context: ${message}` };
      }
    },
  }));

  return tools;
}