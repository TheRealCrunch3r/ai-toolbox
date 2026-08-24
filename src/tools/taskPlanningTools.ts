/**
 * Task Planning Tools - Structured multi-step workflow management
 * 
 * Provides tools for creating, tracking, and updating execution plans.
 * Inspired by vibe-lm's planning system but implemented from scratch with ai_toolbox safety patterns.
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

import type { PluginConfig } from '../config.js';
import { getWorkingDir } from '../workingDir.js';

// ==================== Plan Data Types ====================

type StepStatus = 'pending' | 'in_progress' | 'done' | 'blocked';

interface PlanStep {
  index: number;
  description: string;
  status: StepStatus;
  note?: string;
}

interface ActivePlan {
  goal: string;
  steps: PlanStep[];
  createdAt: number;
  updatedAt: number;
}

/** Zod schema for raw JSON data loaded from disk — provides runtime validation and static typing */
const RawPlanDataSchema = z.object({
  version: z.number().optional(),
  plans: z.record(z.unknown()).optional(),
});

type ParsedRawPlanData = z.infer<typeof RawPlanDataSchema>;

/** Schema for validating individual plan objects from disk */
const ActivePlanSchema = z.object({
  goal: z.string(),
  steps: z.array(
    z.object({
      index: z.number(),
      description: z.string(),
      status: z.enum(['pending', 'in_progress', 'done', 'blocked']).optional().default('pending'),
      note: z.string().optional(),
    })
  ),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// ==================== Persistent Storage Manager ====================

/**
 * Manages plan persistence to disk with atomic writes.
 * Uses the same pattern as contextManagementTools (temp file + rename).
 */
class PlanStorageManager {
  private pluginRootPath: string;

  constructor() {
    const baseDir = path.resolve(__dirname, '..');
    this.pluginRootPath = path.join(baseDir, '.session_context', '.ai_toolbox_plans.json');
  }

  /** Resolve the plan file for the CURRENT working directory.
   * Re-resolved on every call so mid-session change_directory() is honored (FIX: previously captured once at construction). */
  private getWorkingDirPlanPath(): string {
    return path.join(getWorkingDir(), '.session_context', '.ai_toolbox_plans.json');
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

  /** Load all plans from disk */
  async load(): Promise<Record<string, ActivePlan>> {
    // Re-resolve per call — mid-session change_directory() must be honored (FIX: stale construction-time capture)
    const workingDirPlanPath = this.getWorkingDirPlanPath();

    let plans = await this.loadPlansFromFile(workingDirPlanPath);
    
    // Fallback: Plugin Root if no plans found in Working Directory
    if (Object.keys(plans).length === 0) {
      plans = await this.loadPlansFromFile(this.pluginRootPath);
    }
    
    return plans;
  }

  /** Helper: parse and validate plan data from a specific file path */
  private async loadPlansFromFile(filePath: string): Promise<Record<string, ActivePlan>> {
    const result: Record<string, ActivePlan> = {};
    
    try {
      if (!await fs.access(filePath).then(() => true).catch(() => false)) return result;
      
      const raw = await fs.readFile(filePath, 'utf-8');
      // Zod .parse() returns properly typed data — no unsafe any assignments
      const parsed: ParsedRawPlanData = RawPlanDataSchema.parse(JSON.parse(raw));
      
      if (!parsed.plans) return result;
      
      for (const [id, plan] of Object.entries(parsed.plans)) {
        // Validate each plan against schema before adding to result
        const validated = ActivePlanSchema.safeParse(plan);
        if (validated.success) {
          const typedPlan = validated.data;
          result[id] = {
            goal: typedPlan.goal,
            steps: typedPlan.steps.map(s => ({ ...s })),
            createdAt: typedPlan.createdAt,
            updatedAt: typedPlan.updatedAt,
          };
        }
      }
    } catch (error) {
      console.warn(`[PlanStorage.load] Failed to load from ${filePath}: ${String(error)}`);
    }
    
    return result;
  }

  /** Save all plans to disk with atomic write */
  async save(plans: Record<string, ActivePlan>): Promise<void> {
    const data = { version: 1, plans };

    // Re-resolve per call — mid-session change_directory() must be honored (FIX: stale construction-time capture)
    const workingDirPlanPath = this.getWorkingDirPlanPath();

    
    // Write to working dir first (primary)
    try {
      await this.ensureDirectory(workingDirPlanPath);
      const tempPath = workingDirPlanPath + '.tmp';
      await fs.writeFile(tempPath, JSON.stringify(data), 'utf-8');
      await fs.rename(tempPath, workingDirPlanPath);
      
      // Sync to plugin root (secondary)
      if (this.pluginRootPath !== workingDirPlanPath) {
        try {
          await this.ensureDirectory(this.pluginRootPath);
          const pluginTemp = this.pluginRootPath + '.tmp';
          await fs.writeFile(pluginTemp, JSON.stringify(data), 'utf-8');
          await fs.rename(pluginTemp, this.pluginRootPath);
        } catch (syncError) {
          console.error(`[PlanStorage.save] Failed to sync to plugin root: ${String(syncError)}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[PlanStorage.save] FAILED for ${workingDirPlanPath}: ${message}`);
    }
  }

  /** Generate unique plan ID (public for external plan creation) */
  public createPlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== State Machine Validation ====================

/**
 * Validates step status transitions according to the defined state machine:
 * pending → in_progress → done
 * any   → blocked
 */
function validateStatusTransition(currentStatus: StepStatus, newStatus: StepStatus): boolean {
  const validTransitions: Record<StepStatus, StepStatus[]> = {
    'pending': ['in_progress', 'blocked'],
    'in_progress': ['done', 'blocked'],
    'done': [], // Terminal state - no transitions allowed
    'blocked': ['pending'], // Can unblock and retry
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

// ==================== Tool Implementations ====================

/**
 * Register task planning tools.
 * These tools are enabled by default (taskPlanning: true in config).
 */
export function registerTaskPlanningTools(_config: PluginConfig): Tool[] {
  const storageManager = new PlanStorageManager();

  // create_plan tool - Create a new execution plan with goal and steps
  const createPlanTool: Tool = tool({
    name: 'create_plan',
    description: `Creates or replaces the current session's execution plan — an ordered list of concrete steps toward a goal.
USE WHEN: A task requires multiple actions to complete. Create the plan, then execute each step with your tools (file operations, bash terminal, etc.).
RULES: Each step must be a clear, actionable description (1-500 chars). Only one plan can be active at a time; creating a new plan replaces the old one.
EXAMPLE: create_plan({ goal: "Refactor auth module", steps: ["Read current auth.ts file", "Identify refactoring opportunities", "Implement changes", "Run tests to verify"] })`,
    parameters: {
      goal: z.string().min(1).max(2000).describe('The overall goal or task the plan aims to achieve'),
      steps: z.array(z.string().min(1).max(500)).min(1).max(30).describe('Ordered list of concrete, actionable steps (1-30 steps)'),
    },
    implementation: async ({ goal, steps }: { 
      readonly goal: string; 
      readonly steps: string[]; 
    }) => {
      try {
        const plans = await storageManager.load();
        const id = storageManager.createPlanId();
        
        const plan: ActivePlan = {
          goal,
          steps: steps.map((desc, index) => ({
            index,
            description: desc.trim(),
            status: 'pending',
          })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        plans[id] = plan;
        await storageManager.save(plans);

        return {
          success: true,
          data: {
            planId: id,
            goal,
            stepCount: steps.length,
            message: `Plan created with ${steps.length} step(s). Use update_plan_step to track progress.`,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to create plan: ${message}` };
      }
    },
  });

  // update_plan_step tool - Update the status of one step in a plan
  const updatePlanStepTool: Tool = tool({
    name: 'update_plan_step',
    description: `Updates the status of one step in an active plan.
USE WHEN: You start working on a step (set to "in_progress"), complete it ("done"), or encounter blockers ("blocked").
STATE MACHINE: pending → in_progress → done | any → blocked | blocked → pending
EXAMPLES: update_plan_step({ planId: "...", index: 0, status: "done" })`,
    parameters: {
      planId: z.string().min(1).describe('The unique ID of the plan (returned by create_plan)'),
      index: z.number().int().min(0).describe('Zero-based step index to update'),
      status: z.enum(['pending', 'in_progress', 'done', 'blocked']).describe('New status for the step'),
      note: z.string().max(1000).optional().describe('Optional context explaining the status change (required when blocked)'),
    },
    implementation: async ({ planId, index, status, note }: { 
      readonly planId: string; 
      readonly index: number; 
      readonly status: StepStatus; 
      readonly note?: string; 
    }) => {
      try {
        const plans = await storageManager.load();
        
        // Validate plan exists
        if (!plans[planId]) {
          return { success: false, error: `Plan '${planId}' not found. Use create_plan first.` };
        }

        const plan = plans[planId];
        
        // Validate step index
        if (index < 0 || index >= plan.steps.length) {
          return { 
            success: false, 
            error: `Step index ${index} out of range. Plan has ${plan.steps.length} steps (indices 0-${plan.steps.length - 1}).` 
          };
        }

        const step = plan.steps[index];
        
        // Validate status transition
        if (!validateStatusTransition(step.status, status)) {
          return { 
            success: false, 
            error: `Invalid transition: "${step.status}" → "${status}". Valid transitions from ${step.status}: [${Object.entries({ pending: 'in_progress, blocked', in_progress: 'done, blocked', done: '(terminal)', blocked: 'pending' }).map(([from, tos]) => `${from}→[${tos}]`).join(', ')}]` 
          };
        }

        // Update step
        const previousStatus = step.status;
        step.status = status;
        
        if (status === 'blocked') {
          if (!note) {
            return { success: false, error: 'Note is required when marking a step as blocked.' };
          }
          step.note = note.trim();
        } else if (status === 'done' && !step.note) {
          // Optional completion note for done steps
          step.note = undefined;
        }

        plan.updatedAt = Date.now();
        
        // Save updated plan
        plans[planId] = plan;
        await storageManager.save(plans);

        return {
          success: true,
          data: {
            planId,
            stepIndex: index,
            previousStatus,
            newStatus: status,
            completedSteps: plan.steps.filter(s => s.status === 'done').length,
            totalSteps: plan.steps.length,
            allDone: plan.steps.every(s => s.status === 'done'),
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to update step: ${message}` };
      }
    },
  });

  // get_plan tool - Return the current plan and step statuses
  const getPlanTool: Tool = tool({
    name: 'get_plan',
    description: `Returns the active plan details including goal, steps with their statuses, and progress.
USE WHEN: You need to check what's left in the plan or review overall progress. Returns null if no plan exists.
EXAMPLE: get_plan()`,
    parameters: {},
    implementation: async () => {
      try {
        const plans = await storageManager.load();
        
        // Return first/last active plan (ai_toolbox uses single-plan model)
        const planEntries = Object.entries(plans);
        if (planEntries.length === 0) {
          return { success: true, data: null };
        }

        // Use the most recently created plan.
        // FIX: reduce's seed was a placeholder ('', {}) — when no plan carried createdAt (e.g., every
        // entry failed validation), the placeholder survived as "latest" and the `!plan.goal` guard
        // silently swallowed it, so get_plan returned data:null although valid plans existed on disk.
        const [planId, plan] = planEntries.reduce<[string, ActivePlan | null]>((acc, entry) => {
          const candidateCreatedAt = entry[1].createdAt;
          if (!candidateCreatedAt) return acc; // unvalidated/malformed entry — never a candidate
          const incumbentCreatedAt = acc[1]?.createdAt ?? 0;
          return candidateCreatedAt > incumbentCreatedAt ? entry : acc;
        }, ['', null]);

        if (!plan || !plan.goal) {
          return { success: true, data: null };
        }

        // Calculate progress metrics
        const completedSteps = plan.steps.filter(s => s.status === 'done').length;
        const blockedSteps = plan.steps.filter(s => s.status === 'blocked').length;
        const inProgressSteps = plan.steps.filter(s => s.status === 'in_progress').length;
        const pendingSteps = plan.steps.length - completedSteps - blockedSteps - inProgressSteps;

        // Calculate elapsed time since creation (human-readable)
        const createdAtMs = plan.createdAt;
        const elapsedMs = Date.now() - createdAtMs;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        let elapsedTime: string;
        
        if (elapsedSeconds < 60) {
          elapsedTime = `${elapsedSeconds}s`;
        } else if (elapsedSeconds < 3600) {
          elapsedTime = `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;
        } else {
          elapsedTime = `${Math.floor(elapsedSeconds / 3600)}h ${Math.floor((elapsedSeconds % 3600) / 60)}m`;
        }

        return {
          success: true,
          data: {
            planId,
            goal: plan.goal,
            steps: plan.steps.map(s => ({
              index: s.index,
              description: s.description,
              status: s.status,
              note: s.note || undefined,
            })),
            progress: {
              completedSteps,
              blockedSteps,
              inProgressSteps,
              pendingSteps,
              totalSteps: plan.steps.length,
              completionPercentage: Math.round((completedSteps / plan.steps.length) * 100),
            },
            timestamps: {
              createdAt: new Date(createdAtMs).toISOString(),
              updatedAt: new Date(plan.updatedAt).toISOString(),
              elapsedSinceCreation: elapsedTime,
            },
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to retrieve plan: ${message}` };
      }
    },
  });

  // Return all three tools sorted alphabetically
  return [createPlanTool, getPlanTool, updatePlanStepTool].sort((a, b) => a.name.localeCompare(b.name));
}
