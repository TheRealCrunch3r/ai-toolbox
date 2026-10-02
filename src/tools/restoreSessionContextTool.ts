/**
 * Restore Session Context Tool (25.09) — single bootstrap read for "what does this project remember?"
 *
 * Owner requirement: when the user says "read session mem" after switching into a project, ONE call must
 * return everything persisted from previous sessions — latest session summary, explicit memory facts,
 * context entries (with auto-generated token-threshold checkpoints collapsed), persisted plans, and the
 * recent-sessions index. The existing narrow tools (get_session_summary / get_memory / get_context_memory /
 * context_summary) remain for targeted mid-session recall; this tool is the composite resume entry point.
 * Option B (single unified tool with sub-actions) was explicitly REJECTED by owner 25.09 — hence additive,
 * not a remodel of the four existing tools.
 *
 * READ-ONLY BY DESIGN: no family read may write to disk. In particular we call ContextStorageManager.load()
 * directly instead of getRecentEntries(), because the latter persists an inline TTL prune (save) — a "read"
 * tool must never mutate the shared store. Expiry is evaluated locally with the same predicate semantics.
 *
 * Seams (verified 25.09):
 * - SessionSummaryData / ContextStorageManager / SessionIndexManager: exported from contextManagementTools.ts
 * - PlanStorageManager + ActivePlan: exported (additive, 25.09) from taskPlanningTools.ts — load() is the
 *   single source of truth for plan paths (working dir primary, plugin root fallback) and Zod validation
 * - Session summary read mirrors get_session_summary exactly: RAM first (when a StateManager instance is
 *   available), then .msgpack file with BOTH value shapes (object + legacy JSON string)
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { decode } from '@msgpack/msgpack';

import type { PluginConfig } from '../config.js';
import type { StateManager } from '../stateManager.js';
// CONTAMINATION-FIX Part B (01.10): value import — the store file must be resolved with the SAME per-project
// name StateManager uses for its writes, not a hardcoded one (see RESEARCH_session-memory-contamination §4).
import { resolveProjectName } from '../stateManager.js';
import { getWorkingDir } from '../workingDir.js';
import { ContextStorageManager, SessionIndexManager } from './contextManagementTools.js';
import type { SessionSummaryData } from './contextManagementTools.js';
import { PlanStorageManager } from './taskPlanningTools.js';
import type { ActivePlan } from './taskPlanningTools.js';

/** Same 3-day staleness rule as get_session_summary and ContextStorageManager._isStale (mirrored, not imported — private there). */
const STALE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

/** Default dossier budget. Post-collapse dossiers land ~4–6k chars on a mature project; 12k leaves headroom for long decisions without risking grammar-payload bloat (minifyTools caps handle the rest). */
const DEFAULT_MAX_CHARS = 12000;
/** Floor for max_chars: below ~1k a dossier budget is meaningless — the staleness header alone exceeds it.
 * (Lowered from 2000 on 25.09: a 2000 floor made every seed-scale dossier (<~1600 chars) un-truncatable, so no legal
 * value could exercise/verify truncation — the budget parameter is only spec-able if it can sit BELOW a small dossier.) */
const MIN_MAX_CHARS = 1000;

/** Sessions-index depth in the dossier (full history stays reachable via list_sessions/search_sessions). */
const SESSIONS_INDEX_DEPTH = 8;

interface StateEntry { key: string; value: unknown; timestamp: number }

interface ContextEntryLike {
  id?: string;
  timestamp?: number;
  date?: string;
  type?: string;
  title?: string;
  content?: string;
  tags?: string[];
  scope?: 'global' | 'project' | 'session';
  ttl_ms?: number;
}

interface FamilyStaleness {
  session_summary: boolean | 'missing';
  context_entries: boolean;
  persisted_plans: boolean;
  sessions_index: boolean;
}

/** Per-expiry semantics of ContextStorageManager._isExpired (session scope + explicit TTL only). */
function isExpiredEntry(e: ContextEntryLike, now: number): boolean {
  return e.scope === 'session' && typeof e.ttl_ms === 'number' && typeof e.timestamp === 'number'
    ? (now - e.timestamp) > e.ttl_ms
    : false;
}

/** Parse the peak "(NN.N%)" token-usage figure out of a checkpoint entry's content, or null when absent. */
function parsePeakTokenPercent(content: string): number | null {
  let peak: number | null = null;
  const re = /\((\d+(?:\.\d+)?)%\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const v = parseFloat(m[1]);
    if (Number.isFinite(v) && (peak === null || v > peak)) peak = v;
  }
  return peak;
}

function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return 'unknown';
  }
}

export function registerRestoreSessionContextTool(
  _config: PluginConfig,
  stateManager?: StateManager,
): Tool[] {
  const restoreSessionContextTool: Tool = tool({
    name: 'restore_session_context',
    description: `Restore EVERYTHING persisted from previous sessions for the current project in ONE call — a compact per-project dossier.

CONTENTS (in priority order when truncation applies):
1. Latest session summary (full fields + staleness flag)
2. Persisted execution plans (.ai_toolbox_plans.json — goal, step statuses, progress; "no active plans" when absent)
3. Context entries in FULL: decisions, patterns, configurations, file changes, errors, manual summaries — newest first. Auto-generated token-threshold checkpoints (tag auto_checkpoint) are collapsed into a single count + date-range + peak-usage line instead of N near-identical blobs
4. Explicit memory facts (save_memory records)
5. Recent sessions index (top 8; use list_sessions/search_sessions for older history)

WHEN TO USE: at session start / right after switching into or opening a project, whenever the user asks to "read session mem", restore context, or continue previous work. For ONE targeted recall question mid-session prefer the narrow tools (get_session_summary, get_memory, get_context_memory with type filter, search_context).

READ-ONLY: this tool never writes or prunes anything — unlike some other memory reads it cannot mutate the shared store.

PARAMS: include_sessions_index (default true), max_chars (hard dossier budget, default 12000; sections beyond it are omitted with an explicit marker)`,
    parameters: {
      include_sessions_index: z.boolean().optional().default(true).describe('Include the recent-sessions index section (default true)'),
      max_chars: z.number().int().min(MIN_MAX_CHARS).optional().default(DEFAULT_MAX_CHARS).describe(`Hard budget for the rendered dossier in characters (default ${DEFAULT_MAX_CHARS}); when exceeded, lower-priority sections are omitted and listed in omitted_sections`),
    },
    implementation: async ({ include_sessions_index = true, max_chars = DEFAULT_MAX_CHARS }: {
      readonly include_sessions_index?: boolean;
      readonly max_chars?: number;
    }) => {
      const now = Date.now();
      let wd: string;
      try {
        wd = getWorkingDir();
      } catch (err) {
        return { success: false, error: `restore_session_context failed to resolve the working directory: ${String(err)}` };
      }

      const counts = {
        session_summary: 0,
        memory_facts: 0,
        context_entries_total: 0,
        auto_checkpoints_collapsed: 0,
        non_auto_context_entries: 0,
        expired_session_entries_skipped: 0,
        plans_on_disk: 0,
        sessions_indexed: 0,
      };

      const sectionNotes: Array<{ name: string; note: string }> = []; // self-describing per-family failures (house style FIX #21)
      const sections: Array<{ name: string; text: string }> = [];

      // ==================== Store file read (shared by summary + facts) ====================
      let storeRecords: StateEntry[] | null = null;
      let storeFileExists = false;
      // CONTAMINATION-FIX Part B1 (01.10): resolve the SAME per-project filename StateManager writes
      // (<wd>/.session_context/."<name>_memory.msgpack") instead of a hardcoded one — for every project whose
      // directory is not literally named "ai_toolbox" the old read either missed the real store or could surface
      // a foreign file planted under that name by the pre-fix frozen-identity bug (RESEARCH §4 Part B1).
      const storeProjectName = resolveProjectName();
      const storePath = path.join(wd, '.session_context', `.${storeProjectName}_memory.msgpack`);
      try {
        if (await fs.access(storePath).then(() => true).catch(() => false)) {
          storeFileExists = true;
          const decoded: unknown = decode(await fs.readFile(storePath));
          if (Array.isArray(decoded)) storeRecords = decoded as StateEntry[];
        }
      } catch (err) {
        sectionNotes.push({ name: 'store_file', note: `.${storeProjectName}_memory.msgpack exists but could not be parsed (${String(err)}) — summary/facts families unavailable from disk` });
      }

      // ==================== 1. Latest session summary (RAM first, file fallback — mirrors get_session_summary) ====================
      let summaryData: SessionSummaryData | null = null;
      try {
        if (stateManager) {
          // CONTAMINATION-FIX Part B2 (01.10): trust the RAM store ONLY while its identity matches the current
          // project. In long-lived host processes the frozen construction-time name can lag a mid-process CWD
          // switch — exactly then, unguarded, RAM would serve ANOTHER project's summary (the 30/09 false dossier).
          // On mismatch: fail closed to the disk read above and surface it in section notes. getMemoryFilePath()
          // is I/O-free by design (pure field/path computation) — see stateManager.ts.
          let ramIdentity: string | null = null;
          try {
            ramIdentity = stateManager.getMemoryFilePath().projectName;
          } catch {
            ramIdentity = null; // unresolvable identity → treat as mismatch (fail closed to disk)
          }
          if (ramIdentity === storeProjectName) {
            const ramHit = stateManager.get<SessionSummaryData>('session_summary_latest');
            if (ramHit && typeof ramHit === 'object') summaryData = ramHit;
          } else {
            sectionNotes.push({ name: 'session_summary', note: `RAM store identity '${ramIdentity ?? 'unknown'}' does not match current project '${storeProjectName}' — RAM skipped, disk fallback` });
          }
        }
        if (!summaryData && storeRecords) {
          const entry = storeRecords.find(e => e && typeof e === 'object' && e.key === 'session_summary_latest');
          if (entry && entry.value !== undefined) {
            if (typeof entry.value === 'string') {
              // Legacy format: value stored as JSON string instead of object
              try { summaryData = JSON.parse(entry.value) as SessionSummaryData; } catch { /* not valid JSON — treated as missing */ }
            } else if (typeof entry.value === 'object' && entry.value !== null) {
              summaryData = entry.value as SessionSummaryData;
            }
          }
        }
      } catch (err) {
        sectionNotes.push({ name: 'session_summary', note: `summary read failed (${String(err)})` });
      }

      if (summaryData && typeof summaryData === 'object') {
        counts.session_summary = 1;
        const lines = [
          `## Latest Session Summary — ${summaryData.date ?? fmtDate(summaryData.timestamp ?? now)}`,
          `- **Task:** ${summaryData.task_description || '(empty)'}`,
        ];
        if (summaryData.accomplishments) lines.push(`- **Accomplishments:**\n${indent(summaryData.accomplishments)}`);
        if (summaryData.pending_tasks) lines.push(`- **Pending tasks:**\n${indent(summaryData.pending_tasks)}`);
        if (summaryData.decisions_made) lines.push(`- **Decisions made:**\n${indent(summaryData.decisions_made)}`);
        if (summaryData.context_for_next_session) lines.push(`- **Context for next session:**\n${indent(summaryData.context_for_next_session)}`);
        sections.push({ name: 'latest_session_summary', text: lines.join('\n') });
      } else {
        sectionNotes.push({ name: 'session_summary', note: 'no session summary found (fresh project or lost to overwrite)' });
      }

      // ==================== 2. Persisted plans (PlanStorageManager = single source of truth for paths + validation) ====================
      let planStale = false;
      try {
        const planStore = new PlanStorageManager();
        const plans: Record<string, ActivePlan> = await planStore.load();
        const entries = Object.entries(plans);
        counts.plans_on_disk = entries.length;

        if (entries.length > 0) {
          // Same selection semantics as get_plan: the most recently created plan is "the" active plan.
          let bestId = '';
          let bestPlan: ActivePlan | null = null;
          for (const [id, plan] of entries) {
            if (!plan.createdAt) continue; // unvalidated/malformed — never a candidate
            if (!bestPlan || plan.createdAt > bestPlan.createdAt) { bestId = id; bestPlan = plan; }
          }

          if (bestPlan) {
            const done = bestPlan.steps.filter(s => s.status === 'done').length;
            const blocked = bestPlan.steps.filter(s => s.status === 'blocked').length;
            const inProgress = bestPlan.steps.filter(s => s.status === 'in_progress').length;
            planStale = (now - bestPlan.updatedAt) > STALE_THRESHOLD_MS;
            const lines = [
              `## Persisted Plan${entries.length > 1 ? ` (${bestId}; ${entries.length - 1} older plan(s) also on disk)` : ''} — updated ${fmtDate(bestPlan.updatedAt)} (stale: ${planStale})`,
              `- **Goal:** ${bestPlan.goal}`,
              `- **Progress:** ${done}/${bestPlan.steps.length} done, ${inProgress} in progress, ${blocked} blocked (${Math.round((done / bestPlan.steps.length) * 100)}%)`,
            ];
            for (const s of bestPlan.steps) {
              lines.push(`  [${s.status}] ${s.index + 1}. ${s.description}${s.note ? ` — note: ${s.note}` : ''}`);
            }
            sections.push({ name: 'persisted_plan', text: lines.join('\n') });
          } else {
            sectionNotes.push({ name: 'persisted_plans', note: `${entries.length} plan record(s) on disk but none passed validation` });
          }
        } else {
          sections.push({ name: 'persisted_plan', text: `## Persisted Plan — none (no .ai_toolbox_plans.json entries for this project)` });
        }
      } catch (err) {
        sectionNotes.push({ name: 'persisted_plans', note: `plan read failed (${String(err)})` });
      }

      // ==================== 3. Context entries — load() ONLY (read tool must not trigger the prune-save of getRecentEntries) ====================
      let contextStale = false;
      try {
        const ctxStore = new ContextStorageManager();
        const allEntries = await ctxStore.load();

        const live: ContextEntryLike[] = [];
        for (const e of allEntries as unknown as ContextEntryLike[]) {
          if (isExpiredEntry(e, now)) counts.expired_session_entries_skipped++;
          else live.push(e);
        }
        counts.context_entries_total = live.length;

        const newestTs = live.reduce((mx, e) => Math.max(mx, typeof e.timestamp === 'number' ? e.timestamp : 0), 0);
        contextStale = live.length > 0 && (now - newestTs) > STALE_THRESHOLD_MS; // mirrors ContextStorageManager._isStale

        const checkpoints: ContextEntryLike[] = [];
        const substantive: ContextEntryLike[] = [];
        for (const e of live) {
          if (Array.isArray(e.tags) && e.tags.includes('auto_checkpoint')) checkpoints.push(e);
          else substantive.push(e);
        }
        counts.auto_checkpoints_collapsed = checkpoints.length;
        counts.non_auto_context_entries = substantive.length;

        // Substantive entries first, newest-first: decisions/insights are the highest-value continuity content.
        substantive.sort((a, b) => (typeof b.timestamp === 'number' ? b.timestamp : 0) - (typeof a.timestamp === 'number' ? a.timestamp : 0));
        for (const e of substantive) {
          const tagLine = Array.isArray(e.tags) && e.tags.length > 0 ? ` \`${e.tags.join(' ')}\`` : '';
          sections.push({
            name: `context_entry:${typeof e.id === 'string' ? e.id : 'unknown'}`,
            text: `### [${e.type ?? 'summary'}] ${e.title ?? '(untitled)'} — ${e.date ?? (typeof e.timestamp === 'number' ? fmtDate(e.timestamp) : 'unknown')}${tagLine}\n${e.content ?? ''}`,
          });
        }

        // Checkpoint collapse: N near-identical token-threshold blobs → one line.
        if (checkpoints.length > 0) {
          let peakPct: number | null = null;
          let minTs = Number.POSITIVE_INFINITY;
          let maxTs = Number.NEGATIVE_INFINITY;
          for (const c of checkpoints) {
            const p = typeof c.content === 'string' ? parsePeakTokenPercent(c.content) : null;
            if (p !== null && (peakPct === null || p > peakPct)) peakPct = p;
            if (typeof c.timestamp === 'number') { minTs = Math.min(minTs, c.timestamp); maxTs = Math.max(maxTs, c.timestamp); }
          }
          const rangeLine = Number.isFinite(minTs) && Number.isFinite(maxTs)
            ? `${fmtDate(minTs)} → ${fmtDate(maxTs)}`
            : 'date range unknown';
          sections.push({
            name: 'auto_checkpoint_collapse',
            text: `### Auto-generated token-threshold checkpoints (collapsed): ${checkpoints.length} checkpoint(s), ${rangeLine}${peakPct !== null ? `, peak context usage ${peakPct}%` : ''} — machine-written, no manual content in this class`,
          });
        }

        if (live.length === 0) {
          sections.push({ name: 'context_entries', text: `## Context Entries — none stored for this project` });
        }
      } catch (err) {
        sectionNotes.push({ name: 'context_entries', note: `context read failed (${String(err)})` });
      }

      // ==================== 4. Explicit memory facts (memory_* records of the SAME shared store file) ====================
      if (storeRecords) {
        const factEntries: Array<{ key: string; value: unknown }> = [];
        for (const r of storeRecords) {
          if (!r || typeof r !== 'object' || typeof r.key !== 'string') continue;
          if (r.key.startsWith('memory_') && r.value !== undefined) factEntries.push({ key: r.key, value: r.value });
        }
        counts.memory_facts = factEntries.length;

        for (const f of factEntries) {
          let text: string;
          const v = f.value as Record<string, unknown> | null;
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            const tsVal = typeof v.timestamp === 'number' ? v.timestamp : 0;
            text = `### Fact \`${f.key}\` — ${tsVal > 0 ? fmtDate(tsVal) : 'unknown date'}\n${typeof v.fact === 'string' ? v.fact : JSON.stringify(v)}`;
          } else {
            text = `### Fact \`${f.key}\`\n${JSON.stringify(f.value)}`;
          }
          sections.push({ name: `memory_fact:${f.key}`, text });
        }

        if (factEntries.length === 0) {
          sections.push({ name: 'memory_facts', text: storeFileExists
            ? `## Memory Facts — none stored (store file holds ${storeRecords.length} record(s) of other type(s))`
            : `## Memory Facts — none stored (no .${storeProjectName}_memory.msgpack for this project)` });
        }
      } else {
        sections.push({ name: 'memory_facts', text: `## Memory Facts — unavailable (${storeFileExists ? 'store file unreadable' : 'no store file'})` });
      }

      // ==================== 5. Recent sessions index (navigational — last, cheapest to drop) ====================
      let indexStale = false;
      if (include_sessions_index) {
        try {
          const sessionIndex = new SessionIndexManager();
          const allSessions = await sessionIndex.getAllSessions(); // newest-first by construction
          counts.sessions_indexed = allSessions.length;

          if (allSessions.length > 0) {
            indexStale = (now - (allSessions[0].timestamp ?? 0)) > STALE_THRESHOLD_MS;
            const lines = [`## Recent Sessions Index — ${Math.min(SESSIONS_INDEX_DEPTH, allSessions.length)} of ${allSessions.length} (newest first)`];
            for (const s of allSessions.slice(0, SESSIONS_INDEX_DEPTH)) {
              lines.push(`- ${s.date}: ${s.task_description}`);
            }
            if (allSessions.length > SESSIONS_INDEX_DEPTH) {
              lines.push(`- … ${allSessions.length - SESSIONS_INDEX_DEPTH} older — use list_sessions (paginated browse) or search_sessions (query)`);
            }
            sections.push({ name: 'sessions_index', text: lines.join('\n') });
          } else {
            sections.push({ name: 'sessions_index', text: `## Recent Sessions Index — none indexed for this project` });
          }
        } catch (err) {
          sectionNotes.push({ name: 'sessions_index', note: `session index read failed (${String(err)})` });
        }
      } else {
        sections.push({ name: 'sessions_index', text: `## Recent Sessions Index — omitted (include_sessions_index=false)` });
      }

      // ==================== Staleness header (per family; same 3-day rule as the existing tools) ====================
      const staleness: FamilyStaleness = {
        session_summary: summaryData ? (now - (summaryData.timestamp ?? 0)) > STALE_THRESHOLD_MS : 'missing',
        context_entries: contextStale,
        persisted_plans: planStale && counts.plans_on_disk > 0,
        sessions_index: include_sessions_index && counts.sessions_indexed > 0 ? indexStale : false,
      };

      // ==================== Render within budget (sections keep their priority order) ====================
      const headerLines = [
        `# Session Memory Dossier — ${path.basename(wd)} @ ${fmtDate(now)}`,
        `Project: \`${wd}\``,
        `Staleness (>3 days): summary=${staleness.session_summary === 'missing' ? 'MISSING' : String(staleness.session_summary)} context=${String(staleness.context_entries)} plans=${String(staleness.persisted_plans)} index=${String(staleness.sessions_index)}`,
      ];
      if (counts.expired_session_entries_skipped > 0) {
        headerLines.push(`Note: ${counts.expired_session_entries_skipped} expired session-scoped context entrie(s) skipped locally (TTL; NOT persisted — read-only tool)`);
      }
      const headerText = headerLines.join('\n');

      let dossierText = headerText;
      const omitted: string[] = [];
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section.text.trim()) continue;
        if (dossierText.length + section.text.length + 2 > max_chars) {
          // Section order IS the priority order — once over budget, every remaining section is omitted.
          for (let j = i; j < sections.length; j++) omitted.push(sections[j].name);
          break;
        }
        dossierText += `\n\n${section.text}`;
      }

      let truncated = false;
      if (omitted.length > 0) {
        truncated = true;
        const shownNames = sections.filter(s => !omitted.includes(s.name)).map(s => s.name);
        dossierText += `\n\n… [TRUNCATED at max_chars=${max_chars}: ${shownNames.length} section(s) included, ${omitted.length} omitted — ${omitted.join(', ')}]`;
      }

      // Self-describing family-level notes (missing families are EXPECTED on fresh projects — surfaced, not errored).
      if (sectionNotes.length > 0) {
        dossierText += `\n\n## Notes\n${sectionNotes.map(n => `- ${n.name}: ${n.note}`).join('\n')}`;
      }

      return {
        success: true,
        data: {
          project: wd,
          generated_at: new Date(now).toISOString(),
          max_chars,
          truncated,
          counts,
          staleness,
          ...(sectionNotes.length > 0 ? { section_notes: sectionNotes } : {}),
          dossier_text: dossierText,
        },
      };
    },
  });

  return [restoreSessionContextTool];
}

/** Indent multi-line bullets under a labeled field without reformatting the stored text. */
function indent(text: string): string {
  return text.split('\n').map(l => l.length > 0 ? `  ${l}` : l).join('\n');
}
