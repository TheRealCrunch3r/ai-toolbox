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
        // Filter to only return entries from this project's working directory
        const filtered = entries.filter(e => 
          e.project_path === this.workingDirPath || !e.project_path  // legacy entries without path
        );
        if (Array.isArray(filtered)) {
          if (filtered.length === 0 && entries.length > 0) {
            console.warn(`[ContextStorage.load] ⚠️ Working Dir file exists but all ${entries.length} entries filtered out by project_path. Falling back to Plugin Root.`);
          } else {
            console.log(`[ContextStorage.load] Loaded ${filtered.length} entries from Working Dir. (${entries.length - filtered.length} cross-project entries excluded)`);
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
        const legacyOnly = allEntries.filter(e => !e.project_path || e.project_path === this.workingDirPath);
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

  /** Add a new context entry — ASYNC === */
  async addEntry(entry: ContextEntry): Promise<void> {  // MADE ASYNC
    const entries = await this.load();  // ASYNC load
    
    // 🔹 FIX #5: Clone input object to prevent mutation of caller's reference
    const clonedEntry = { ...entry };
    
    // Apply default scope if not provided (defaults to 'global')
    if (!clonedEntry.scope) {
      clonedEntry.scope = 'global';
    }

    // Inject project identity for cross-project isolation
    if (!clonedEntry.project_path) {
      clonedEntry.project_path = this.workingDirPath;
    }

    // Set TTL for session-scoped memories (only if not already set)
    if (clonedEntry.scope === 'session' && !clonedEntry.ttl_ms) {
      clonedEntry.ttl_ms = SESSION_TTL_MS;
    }

    // 🔹 FIX #1: Increment frequency ONLY if entry with matching ID exists — don't create duplicates
    const existingIdx = entries.findIndex(e => e.id === clonedEntry.id);
    if (existingIdx !== -1) {
      // Update existing entry's frequency instead of creating duplicate
      entries[existingIdx].frequency = (entries[existingIdx].frequency || 0) + 1;
      entries[existingIdx] = { ...entries[existingIdx], ...clonedEntry }; // Merge updated data
    } else {
      clonedEntry.frequency = 1; // New entry starts at frequency 1
      entries.unshift(clonedEntry); // Add new entry to beginning
    }
    
    // Limit to last 1000 entries to prevent unbounded growth
    if (entries.length > 1000) {
      entries.splice(1000);
    }
    
    await this.save(entries);  // ASYNC save
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

  /** Get recent context entries — ASYNC === */
  async getRecentEntries(limit: number = 20, type?: string): Promise<{ data: ContextEntry[], isStale: boolean }> {  // MADE ASYNC
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
      isStale: this._isStale(scoredEntries) 
    };
  }

  /** Search context entries by query — ASYNC === */
  async searchEntries(query: string, maxResults: number = 10): Promise<{ results: ContextEntry[], isStale: boolean }> {  // MADE ASYNC
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
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );

    // Apply deterministic heuristic scoring and sort by score descending
    const scoredResults = results.map(entry => ({
      entry,
      score: this._calculateScore(entry),
    })).sort((a, b) => b.score - a.score).map(({ entry }) => entry);

    return { 
      results: scoredResults.slice(0, maxResults), 
      isStale: this._isStale(scoredResults) 
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

  /** Get project info by working directory path */
  async getProjectByPath(workingDirPath: string): Promise<RegisteredProject | null> {
    const data = await this.load();
    return data?.projects.find(p => p.path === workingDirPath) || null;
  }

  /** Get all registered projects sorted by last access (newest first) */
  async getAllProjects(): Promise<RegisteredProject[]> {
    const data = await this.load();
    return data?.projects || [];
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

  /** Search projects by name or path */
  async search(query: string, maxResults: number = 10): Promise<RegisteredProject[]> {
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
        
        return { success: true, data: { entries: result.data, isStale: result.isStale } };
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
        
        return { success: true, data: { results: result.results, isStale: result.isStale } };
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
            return { success: true, data: { ...latest, isStale } };
          }
        } catch (memErr) {
          const msg = memErr instanceof Error ? memErr.message : String(memErr);
          console.warn(`[ContextManagement.get_session_summary] Memory lookup failed (${msg}). Falling back to disk.`);
        }
      }

      // 🔹 FIX #6 + FIX #4 (schema alignment): RESTORE .msgpack disk fallback with correct ContextEntry schema
      try {
        const wd = getWorkingDir();
        const localPath = path.join(wd, '.session_context', '.ai_toolbox_memory.msgpack');
        
        if (await fs.access(localPath).then(() => true).catch(() => false)) {
          const buffer = await fs.readFile(localPath);
          // 🔹 FIX #4: Read as ContextEntry[] — session_summary_latest stored with id field, not key
          const entries = decode(buffer) as ContextEntry[];
          
          const summaryEntry = entries.find(e => e.id === 'session_summary_latest');
          if (summaryEntry && typeof summaryEntry.content === 'string') {
            // Parse the task_description from content field (stored as structured JSON string in older versions)
            try {
              const parsedSummary = JSON.parse(summaryEntry.content) as SessionSummaryData;
              console.log(`[ContextManagement.get_session_summary] ✅ Loaded from DISK FALLBACK (.msgpack).`);
              return { success: true, data: { ...parsedSummary, isStale: (Date.now() - (parsedSummary.timestamp ?? 0)) > threeDaysMs } };
            } catch {
              // Fallback: treat content as plain text summary
              console.log(`[ContextManagement.get_session_summary] ✅ Loaded from DISK FALLBACK (.msgpack) — legacy format.`);
              return { success: true, data: { task_description: summaryEntry.content, timestamp: summaryEntry.timestamp, date: summaryEntry.date, isStale: (Date.now() - (summaryEntry.timestamp ?? 0)) > threeDaysMs } as unknown as SessionSummaryData };
            }
          }
        }
      } catch (diskErr) {
        console.warn(`[ContextManagement.get_session_summary] Disk fallback failed: ${String(diskErr)}`);
      }

      // 🔹 FINAL: No data found anywhere
      console.log(`[ContextManagement.get_session_summary] ❌ No session summary found.`);
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
    description: `Switch the context storage to a different project's working directory. This allows accessing session memory from another project.\n\nWHEN TO USE:\n• User explicitly asks to switch to another project's context\n• When working on multiple projects in the same LM Studio instance`,
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