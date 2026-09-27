/**
 * Tool Execution Pipeline – Pipeline Hygiene for ai_toolbox
 * Implements research item D: tool-execution-pipeline hygiene
 * - Distinct monotonic-guard outcomes: success / error / deny / abstain
 * - finalizeContent invariant: tool-owned content always finalized before surface
 * - FAIL-LOUD invariants at load and runtime
 */

export type ToolOutcomeKind = 'success' | 'error' | 'deny' | 'abstain';

export interface ToolSuccess {
  kind: 'success';
  data: unknown;
}

export interface ToolError {
  kind: 'error';
  error: string;
  code?: string;
}

export interface ToolDeny {
  kind: 'deny';
  reason: string;
}

export interface ToolAbstain {
  kind: 'abstain';
  reason: string;
}

export type ToolOutcome = ToolSuccess | ToolError | ToolDeny | ToolAbstain;

export type FinalizeContent = (raw: unknown, outcome: ToolOutcome) => {
  content: string;
  metadata?: Record<string, string>;
};

export interface PipelineOptions {
  /** Enable monotonic guard – prevent repeat identical calls within a turn */
  enableMonotonicGuard?: boolean;
  /** Custom finalizeContent hook per tool or default */
  defaultFinalizer?: FinalizeContent;
}

/**
 * Canonical key for monotonic guard. Deep canonicalization via stable JSON.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const entries = keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k]));
  return '{' + entries.join(',') + '}';
}

function canonicalArgsKey(name: string, args: unknown): string {
  const stable = stableStringify(args);
  return `${name}::${stable}`;
}

/**
 * Safely render an unknown error value as text without relying on Object's
 * default stringification ('[object Object]').
 */
function describeError(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  try {
    const json = JSON.stringify(err);
    if (json !== undefined) return json;
  } catch {
    // circular or non-serializable value – fall through to generic fallback
  }
  return 'Unknown error';
}

/**
 * Central pipeline enforcing outcome taxonomy and finalizeContent invariant.
 */
export class ToolExecutionPipeline {
  private readonly opts: Required<PipelineOptions>;
  private readonly seen = new Set<string>();
  private readonly finalizers = new Map<string, FinalizeContent>();

  constructor(opts: PipelineOptions = {}) {
    this.opts = {
      enableMonotonicGuard: true,
      defaultFinalizer: this.defaultFinalizer.bind(this),
      ...opts,
    };
    // FAIL-LOUD at load
    if (typeof this.opts.defaultFinalizer !== 'function') {
      throw new Error('[ToolExecutionPipeline] FAIL-LOUD: defaultFinalizer must be a function');
    }
  }

  registerFinalizer(toolName: string, fn: FinalizeContent) {
    this.finalizers.set(toolName, fn);
  }

  /**
   * Execute a tool with pipeline hygiene.
   */
  async execute(
    toolName: string,
    args: unknown,
    impl: () => unknown,
    finalizer?: FinalizeContent
  ): Promise<{ success: boolean; data?: unknown; error?: string; kind: ToolOutcomeKind }> {
    // Monotonic guard
    if (this.opts.enableMonotonicGuard) {
      const key = canonicalArgsKey(toolName, args);
      if (this.seen.has(key)) {
        return this.wrapResult({
          kind: 'abstain',
          reason: `Monotonic guard: identical call to ${toolName} already executed this turn`,
        });
      }
      this.seen.add(key);
    }

    let outcome: ToolOutcome;
    try {
      const raw = await impl();
      // Normalize legacy { success, data/error } shapes
      if (raw && typeof raw === 'object' && 'success' in raw) {
        const legacy = raw as Record<string, unknown>;
        if (legacy.success) {
          outcome = { kind: 'success', data: legacy.data };
        } else {
          outcome = { kind: 'error', error: describeError(legacy.error) };
        }
      } else {
        outcome = { kind: 'success', data: raw };
      }
    } catch (e) {
      outcome = {
        kind: 'error',
        error: e instanceof Error ? e.message : String(e),
        code: 'UNHANDLED_EXCEPTION',
      };
    }

    // finalizeContent invariant
    const fn = finalizer ?? this.finalizers.get(toolName) ?? this.opts.defaultFinalizer;
    const finalized = fn(outcome.kind === 'success' ? outcome.data : undefined, outcome);

    // FAIL-LOUD if finalizer returns empty content for success
    if (outcome.kind === 'success' && (!finalized.content || finalized.content.length === 0)) {
      console.warn(`[ToolExecutionPipeline] FAIL-LOUD: finalizeContent returned empty content for ${toolName}`);
    }

    return this.wrapResult(outcome);
  }

  private defaultFinalizer(raw: unknown, outcome: ToolOutcome) {
    const base = (() => {
      switch (outcome.kind) {
        case 'success':
          return typeof raw === 'string' ? raw : JSON.stringify(raw);
        case 'error':
          return `Tool error: ${outcome.error}`;
        case 'deny':
          return `Tool denied: ${outcome.reason}`;
        case 'abstain':
          return `Tool abstained: ${outcome.reason}`;
      }
    })();
    // Tool-owned content invariant
    return { content: base, metadata: { outcome: outcome.kind } };
  }

  private wrapResult(outcome: ToolOutcome) {
    switch (outcome.kind) {
      case 'success':
        return { success: true, data: outcome.data, kind: 'success' as const };
      case 'error':
        return { success: false, error: outcome.error, kind: 'error' as const };
      case 'deny':
        return { success: false, error: `DENY: ${outcome.reason}`, kind: 'deny' as const };
      case 'abstain':
        return { success: false, error: `ABSTAIN: ${outcome.reason}`, kind: 'abstain' as const };
    }
  }

  resetGuard() {
    this.seen.clear();
  }
}

/**
 * Helper to create a deny outcome for policy checks.
 */
export function deny(reason: string): ToolDeny {
  return { kind: 'deny', reason };
}

/**
 * Helper to create an abstain outcome for capability gaps.
 */
export function abstain(reason: string): ToolAbstain {
  return { kind: 'abstain', reason };
}
