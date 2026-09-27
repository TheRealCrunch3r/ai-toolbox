/**
 * Per-tool pipeline wrapper for ai_toolbox
 * Ensures finalizeContent invariant and outcome taxonomy for every tool.
 */

import { ToolExecutionPipeline } from './ToolExecutionPipeline';
import type { FinalizeContent } from './ToolExecutionPipeline';

let sharedPipeline: ToolExecutionPipeline | null = null;

export function getPipeline(): ToolExecutionPipeline {
  if (!sharedPipeline) {
    sharedPipeline = new ToolExecutionPipeline({
      enableMonotonicGuard: true,
    });
  }
  return sharedPipeline;
}

/**
 * Wrap a tool implementation with pipeline hygiene.
 * The wrapper preserves legacy {success,data/error} return shape for backward compatibility
 * while enforcing finalizeContent and outcome taxonomy internally.
 */
export function withPipeline(
  toolName: string,
  args: unknown,
  impl: () => unknown,
  finalizer?: FinalizeContent
) {
  const pipeline = getPipeline();
  return pipeline.execute(toolName, args, impl, finalizer);
}

/**
 * Register a per-tool finalizeContent hook.
 */
export function registerToolFinalizer(toolName: string, fn: FinalizeContent) {
  getPipeline().registerFinalizer(toolName, fn);
}

/**
 * Reset monotonic guard – typically at start of new turn / session.
 */
export function resetToolGuard() {
  getPipeline().resetGuard();
}
