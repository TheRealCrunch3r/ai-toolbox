/**
 * PLAN-HYGIENE (05.10): plan-lifecycle REMOVAL tests — auto-removal of completed plans by update_plan_step,
 * plus the explicit confirm-gated remove_plan tool for unfinished plans.
 *
 * Root cause fixed: the planning toolset had NO removal operation, so terminal plans accumulated in
 * .ai_toolbox_plans.json (29 stale entries audited + slimmed 05.10). House rule since: a plan is removed
 * from the working-state store at natural completion; remove_plan covers abandoned/superseded plans only.
 *
 * Conventions (see contextSearch.test.ts / cwdConsistency.test.ts): hermetic fixtures under os.tmpdir so the
 * repo's own .session_context is never touched; resetWorkingDir() in afterEach — established convention,
 * never leak CWD state between tests. Real implementation imported directly (no mock seam needed).
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// 🔹 FIX-B (14.10): encode() pins the REAL production context-store format in the supersede-on-close-out tests —
// ContextStorageManager.load()/removeEntriesMatching() must operate on genuine msgpack, not a mock stand-in.
import { encode } from '@msgpack/msgpack';

import type { PluginConfig } from '../src/config';
import { registerTaskPlanningTools } from '../src/tools/taskPlanningTools';
import { setWorkingDir, resetWorkingDir } from '../src/workingDir';

/** Recursive JSON value type — tool responses are plain JSON envelopes (no functions/symbols). */
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

// 🔹 PLAN-SEAM (06.10): PlanStorageManager now uses the CURRENT working dir as its SINGLE store — the former
// plugin-root mirror (save) + fallback read (load) was removed from production code, so no cross-suite scrubbing
// of a shared mirror file is needed anymore: every test's isolated tmpdir stays hermetic on its own.

interface ToolEnvelope {
  success?: boolean;
  dryRun?: boolean;
  error?: unknown;
  data?: Json;
}

/** Minimal structural view of the SDK Tool object for direct implementation invocation in tests. */
interface PlanToolStub {
  name: string;
  implementation?: (args: Record<string, unknown>) => Promise<ToolEnvelope>;
}

function planFileOf(wd: string): string {
  return path.join(wd, '.session_context', '.ai_toolbox_plans.json');
}

function readStore(wd: string): Record<string, Json> {
  const raw = fs.readFileSync(planFileOf(wd), 'utf-8');
  const parsed = JSON.parse(raw) as { plans?: Record<string, Json> };
  return parsed.plans ?? {};
}

describe('task planning tools — plan removal lifecycle (PLAN-HYGIENE 05.10)', () => {
  let tmpDir: string;
  let byName: Map<string, PlanToolStub>;

  const invoke = async (name: string, args: Record<string, unknown> = {}): Promise<ToolEnvelope> => {
    const t = byName.get(name);
    if (!t || !t.implementation) throw new Error(`tool '${name}' missing or lacks implementation`);
    return await t.implementation(args);
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'planhygiene-'));
    expect(setWorkingDir(tmpDir)).toBe(true); // point ALL plan storage at the isolated dir
    const tools = registerTaskPlanningTools(null as unknown as PluginConfig) as unknown as PlanToolStub[];
    byName = new Map(tools.map((t) => [t.name, t]));
  });

  afterEach(() => {
    resetWorkingDir(); // established convention — never leak CWD state between tests
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('registers exactly the four planning tools (guard against a mapper redirect to the empty mock)', () => {
    expect([...byName.keys()].sort()).toEqual(['create_plan', 'get_plan', 'remove_plan', 'update_plan_step']);
    for (const t of byName.values()) expect(typeof t.implementation).toBe('function');
  });

  /** create a plan and return its id */
  const makePlan = async (steps: string[]): Promise<string> => {
    const res = await invoke('create_plan', { goal: `goal (${steps.length} steps)`, steps });
    expect(res.success).toBe(true);
    const data = res.data as { planId?: string };
    return String(data.planId ?? '');
  };

  /** drive one step through the state machine pending → in_progress → done */
  const completeStep = async (planId: string, index: number): Promise<void> => {
    let r = await invoke('update_plan_step', { planId, index, status: 'in_progress' });
    expect(r.success).toBe(true);
    r = await invoke('update_plan_step', { planId, index, status: 'done' });
    expect(r.success).toBe(true);
  };

  it('AUTO-REMOVES a plan at natural completion and preserves sibling plans (surgical removal)', async () => {
    const keepId = await makePlan(['survivor step']); // sibling that must survive the other plan's removal
    const id = await makePlan(['a', 'b', 'c']);

    await completeStep(id, 0);
    expect(readStore(tmpDir)[id]).toBeDefined(); // partial (1/3) — still present on disk

    await completeStep(id, 1);
    expect(readStore(tmpDir)[id]).toBeDefined(); // partial (2/3) — still present on disk

    const r = await invoke('update_plan_step', { planId: id, index: 2, status: 'in_progress' });
    expect(r.success).toBe(true);
    const terminal = await invoke('update_plan_step', { planId: id, index: 2, status: 'done' });

    // Terminal response carries full final stats for transcript provenance
    expect(terminal.success).toBe(true);
    const data = terminal.data as Record<string, Json>;
    expect(data.removedOnCompletion).toBe(true);
    expect(data.allDone).toBe(true);
    expect(Number(data.completedSteps)).toBe(3);
    expect(Number(data.totalSteps)).toBe(3);

    // Store state: the completed plan is gone, the sibling survives, file still valid JSON v1 envelope
    const parsed = JSON.parse(fs.readFileSync(planFileOf(tmpDir), 'utf-8')) as { version?: number; plans: Record<string, Json> };
    expect(parsed.version).toBe(1);
    expect(Object.keys(parsed.plans)).toEqual([keepId]);
  });

  it('NEVER auto-removes a plan while any step is blocked (blocked → pending re-entry can still complete + remove)', async () => {
    const id = await makePlan(['only']);
    let r = await invoke('update_plan_step', { planId: id, index: 0, status: 'in_progress' });
    expect(r.success).toBe(true);

    // in_progress → blocked (any→blocked allowed) — a blocked plan must stay on disk, never auto-removed
    const blockR = await invoke('update_plan_step', { planId: id, index: 0, status: 'blocked', note: 'waiting on owner gate' });
    expect(blockR.success).toBe(true);
    expect(readStore(tmpDir)[id]).toBeDefined();

    r = await invoke('update_plan_step', { planId: id, index: 0, status: 'pending' }); // unblock (blocked → pending)
    expect(r.success).toBe(true);
    await completeStep(id, 0);
    const terminal = readStore(tmpDir);
    expect(terminal[id]).toBeUndefined(); // natural completion after re-entry still removes
  });

  it('remove_plan: dry-run (no confirm) previews WITHOUT modifying the store', async () => {
    const id = await makePlan(['x', 'y']);
    await invoke('update_plan_step', { planId: id, index: 0, status: 'in_progress' }); // one in_progress → not terminal

    const before = fs.readFileSync(planFileOf(tmpDir), 'utf-8');
    const preview = await invoke('remove_plan', { planId: id });

    expect(preview.success).toBe(true);
    expect(preview.dryRun).toBe(true);
    const d = preview.data as Record<string, Json>;
    expect(d.removed).toBe(false);
    expect(String(d.planId)).toBe(id);
    expect(Number(d.stepCount)).toBe(2);
    expect(d.statusCounts).toEqual({ pending: 1, in_progress: 1, done: 0, blocked: 0 });

    const after = fs.readFileSync(planFileOf(tmpDir), 'utf-8');
    expect(after).toBe(before); // byte-identical — dry-run is a pure read
    expect(readStore(tmpDir)[id]).toBeDefined();
  });

  it('remove_plan with confirm=true removes the plan and returns its summary for provenance', async () => {
    const id = await makePlan(['x']);
    const res = await invoke('remove_plan', { planId: id, confirm: true });

    expect(res.success).toBe(true);
    const d = res.data as Record<string, Json>;
    expect(d.removed).toBe(true);
    expect(String(d.planId)).toBe(id);
    expect(Number(d.stepCount)).toBe(1);
    expect(typeof d.createdAt).toBe('string');
    expect(Object.keys(readStore(tmpDir))).toEqual([]); // store empty but file valid
  });

  it('remove_plan: unknown planId → clean error, no throw, store untouched', async () => {
    const id = await makePlan(['x']);
    const res = await invoke('remove_plan', { planId: 'plan_nonexistent_123', confirm: true });
    expect(res.success).toBe(false);
    expect(String(res.error)).toContain('not found');
    expect(readStore(tmpDir)[id]).toBeDefined();
  });

  it('get_plan reflects auto-removal (returns the newest surviving plan, not a removed one)', async () => {
    const older = await makePlan(['older']);
    const newer = await makePlan(['newer']); // created later → "active" per single-plan model
    expect(older).not.toBe(newer);

    await completeStep(newer, 0); // natural completion of the NEWEST plan → removed from store
    const g = await invoke('get_plan');
    expect(g.success).toBe(true);
    const data = g.data as { planId?: string };
    expect(String(data.planId ?? '')).toBe(older); // falls through to the surviving older plan
  });
});


// ==================== FIX-B (14.10): supersede-on-close-out ====================
/**
 * Fix B — when an arc/plan closes out (natural completion OR explicit remove_plan), machine-tracked open-item
 * context entries that accrued during the arc's lifetime are retired, so a closed arc never leaves its pending
 * items looking active to future sessions. STRICT eligibility: tagged 'auto_track' + type 'decision' +
 * timestamp >= plan.createdAt. Explicitly recorded owner content (no machine tag) and pre-arc entries survive.
 */

/** Write real msgpack context entries into the hermetic working dir's shared store file (production format). */
function seedContextEntries(wd: string, entries: Record<string, unknown>[]): void {
  const memDir = path.join(wd, '.session_context');
  fs.mkdirSync(memDir, { recursive: true });
  fs.writeFileSync(path.join(memDir, '.ai_toolbox_memory.msgpack'), encode(entries));
}

function readContextEntries(wd: string): Record<string, unknown>[] {
  const memPath = path.join(wd, '.session_context', '.ai_toolbox_memory.msgpack');
  if (!fs.existsSync(memPath)) return [];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { decode } = require('@msgpack/msgpack') as { decode: (buf: Buffer) => unknown };
  const raw = decode(fs.readFileSync(memPath));
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

describe('task planning tools — supersede-on-close-out (FIX-B 14.10)', () => {
  let tmpDir: string;
  let byName: Map<string, PlanToolStub>;

  const invoke = async (name: string, args: Record<string, unknown> = {}): Promise<ToolEnvelope> => {
    const t = byName.get(name);
    if (!t || !t.implementation) throw new Error(`tool '${name}' missing or lacks implementation`);
    return await t.implementation(args);
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fixb-'));
    expect(setWorkingDir(tmpDir)).toBe(true); // point ALL plan + context storage at the isolated dir
    const tools = registerTaskPlanningTools(null as unknown as PluginConfig) as unknown as PlanToolStub[];
    byName = new Map(tools.map((t) => [t.name, t]));
  });

  afterEach(() => {
    resetWorkingDir(); // established convention — never leak CWD state between tests
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const makePlan = async (steps: string[]): Promise<string> => {
    const res = await invoke('create_plan', { goal: `goal (${steps.length} steps)`, steps });
    expect(res.success).toBe(true);
    return String((res.data as { planId?: string }).planId ?? '');
  };

  /** Seed the three entry classes that must behave differently at close-out. */
  const seedArcEntries = (createdAt: number): void => {
    const tDuringArc = createdAt + 5000; // inside the arc's lifetime → eligible
    seedContextEntries(tmpDir, [
      { id: 'auto_track_decision_during', timestamp: tDuringArc, date: new Date(tDuringArc).toISOString(), type: 'decision', title: 'machine gate decision', content: 'auto-tracked during this arc', tags: ['auto_track', 'gate'] }, // RETIRED at close-out
      { id: 'owner_decision_during', timestamp: tDuringArc, date: new Date(tDuringArc).toISOString(), type: 'decision', title: 'explicitly recorded decision', content: 'track_important_event owner content — no machine tag' }, // SURVIVES (strict predicate)
      { id: 'auto_track_decision_before', timestamp: createdAt - 60_000, date: new Date(createdAt - 60_000).toISOString(), type: 'decision', title: 'machine decision from earlier work', content: 'accrued before this arc started', tags: ['auto_track', 'gate'] }, // SURVIVES (pre-arc)
    ]);
  };

  const completeAllSteps = async (planId: string, stepCount: number): Promise<ToolEnvelope> => {
    let last: ToolEnvelope = { success: false, error: 'not started' };
    for (let i = 0; i < stepCount; i += 1) {
      last = await invoke('update_plan_step', { planId, index: i, status: 'in_progress' });
      expect(last.success).toBe(true);
      const terminal = await invoke('update_plan_step', { planId, index: i, status: 'done' });
      if (i === stepCount - 1) last = terminal;
    }
    return last;
  };

  it('NATURAL completion retires only machine-tracked entries accrued during the arc', async () => {
    const id = await makePlan(['a']);
    const createdAt = Number((readStore(tmpDir)[id] as Record<string, Json>)?.createdAt ?? Date.now());
    seedArcEntries(createdAt);

    const terminal = await completeAllSteps(id, 1);
    expect(terminal.success).toBe(true);
    const data = terminal.data as Record<string, Json>;
    expect(data.removedOnCompletion).toBe(true); // plan itself removed per house rule (unchanged)
    expect(Number(data.retiredContextEntries)).toBe(1); // exactly the eligible machine entry

    // Disk: eligible entry gone; owner decision + pre-arc machine entry survive, file still valid msgpack.
    const survivors = readContextEntries(tmpDir).map(e => e.id).sort();
    expect(survivors).toEqual(['auto_track_decision_before', 'owner_decision_during']);
  });

  it('remove_plan dry-run PREVIEWs the retirement without writing (byte-identical store)', async () => {
    const id = await makePlan(['x', 'y']);
    const createdAt = Number((readStore(tmpDir)[id] as Record<string, Json>)?.createdAt ?? Date.now());
    seedArcEntries(createdAt);
    expect(await invoke('update_plan_step', { planId: id, index: 0, status: 'in_progress' })).toMatchObject({ success: true });

    const memBefore = fs.readFileSync(path.join(tmpDir, '.session_context', '.ai_toolbox_memory.msgpack'));
    const plansBefore = fs.readFileSync(planFileOf(tmpDir), 'utf-8');

    const preview = await invoke('remove_plan', { planId: id }); // no confirm → dry-run
    expect(preview.success).toBe(true);
    expect(preview.dryRun).toBe(true);
    const d = preview.data as Record<string, Json>;
    expect(Number(d.wouldRetireContextEntries)).toBe(1);
    expect(readStore(tmpDir)[id]).toBeDefined(); // plan still present

    expect(fs.readFileSync(path.join(tmpDir, '.session_context', '.ai_toolbox_memory.msgpack')).equals(memBefore)).toBe(true); // pure read
    expect(fs.readFileSync(planFileOf(tmpDir), 'utf-8')).toBe(plansBefore);
  });

  it('remove_plan with confirm retires machine entries and removes the plan (owner + pre-arc entries survive)', async () => {
    const id = await makePlan(['x']);
    const createdAt = Number((readStore(tmpDir)[id] as Record<string, Json>)?.createdAt ?? Date.now());
    seedArcEntries(createdAt);

    const res = await invoke('remove_plan', { planId: id, confirm: true });
    expect(res.success).toBe(true);
    const d = res.data as Record<string, Json>;
    expect(d.removed).toBe(true);
    expect(Number(d.retiredContextEntries)).toBe(1);
    expect(Object.keys(readStore(tmpDir))).toEqual([]); // plan store empty but valid

    const survivors = readContextEntries(tmpDir).map(e => e.id).sort();
    expect(survivors).toEqual(['auto_track_decision_before', 'owner_decision_during']);
  });

  it('close-out with NO eligible entries reports 0 and leaves the context store byte-identical', async () => {
    const id = await makePlan(['x']);
    const createdAt = Number((readStore(tmpDir)[id] as Record<string, Json>)?.createdAt ?? Date.now());
    seedArcEntries(createdAt);
    // Retire nothing yet eligible by removing the only machine entry's eligibility: rewrite store without it.
    const memPath = path.join(tmpDir, '.session_context', '.ai_toolbox_memory.msgpack');
    seedContextEntries(tmpDir, readContextEntries(tmpDir).filter(e => e.id !== 'auto_track_decision_during'));
    // 🔹 GATE-RED FIX (14.10): baseline captured AFTER the eligibility rewrite — round-1 gate RED was this line sitting ABOVE it:
    // the byte-compare then ran a 2-entry post-close-out store against a 3-entry pre-rewrite baseline (guaranteed mismatch) even
    // though close-out performed zero writes. Production untouched; one-line move only.
    const before = fs.readFileSync(memPath);

    await completeAllSteps(id, 1); // natural completion — nothing eligible to retire
    expect(fs.readFileSync(memPath).equals(before)).toBe(true); // zero retirement = zero writes (save skipped)
  });
});
