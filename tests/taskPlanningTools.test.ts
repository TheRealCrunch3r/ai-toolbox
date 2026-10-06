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
