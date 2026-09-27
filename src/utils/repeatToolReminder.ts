/**
 * Repeat Tool Reminder — Loop Hygiene for ai_toolbox
 * Implements research item B: repeat-tool-reminder with threshold ladder [3,5,8]
 *
 * Counts identical tool+args calls across turns and nudges the model when a loop is detected.
 * Advisory only — does not block execution. Canonicalization uses stable JSON to ignore key order.
 */

export interface RepeatEntry {
  count: number;
  firstTurn: number;
  lastTurn: number;
}

type ReminderMap = Map<string, RepeatEntry>;

const THRESHOLDS = [3, 5, 8];

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

function canonicalKey(toolName: string, args: unknown): string {
  return `${toolName}::${stableStringify(args)}`;
}

/**
 * Session-scoped repeat tool reminder.
 * Create one instance per session / project context.
 */
export class RepeatToolReminder {
  private readonly map: ReminderMap = new Map();
  private turnCounter = 0;

  /** Advance to next turn — call once per toolsProvider invocation. */
  nextTurn(): number {
    this.turnCounter += 1;
    return this.turnCounter;
  }

  /**
   * Record a tool call and return advisory guidance if thresholds are crossed.
   * Returns null if no nudge is needed.
   */
  check(toolName: string, args: unknown): string | null {
    const key = canonicalKey(toolName, args);
    const entry = this.map.get(key);

    let count: number;
    let firstTurn: number;
    let lastTurn: number;

    if (entry) {
      count = entry.count + 1;
      firstTurn = entry.firstTurn;
      lastTurn = this.turnCounter;
    } else {
      count = 1;
      firstTurn = this.turnCounter;
      lastTurn = this.turnCounter;
    }

    this.map.set(key, { count, firstTurn, lastTurn });

    // Only nudge on thresholds
    if (!THRESHOLDS.includes(count)) return null;

    const turnsSpan = lastTurn - firstTurn + 1;

    let msg = `\n⚠️ Loop hygiene: '${toolName}' has been called ${count} times with identical arguments ` +
      `(first seen ${turnsSpan} turn${turnsSpan > 1 ? 's' : ''} ago).`;

    if (count === 3) {
      msg += ` Consider varying parameters or checking previous results before repeating.`;
    } else if (count === 5) {
      msg += ` You are in a repetition pattern. Try a different approach, broaden the query, or summarize what you have so far.`;
    } else if (count === 8) {
      msg += ` Strong recommendation to break the loop: the same call is unlikely to yield new information. ` +
        `Use a different tool or ask for a summary of progress.`;
    }

    return msg;
  }

  /** Reset counters — call at session boundaries. */
  reset(): void {
    this.map.clear();
    this.turnCounter = 0;
  }

  /** For testing / introspection. */
  getCount(toolName: string, args: unknown): number {
    const entry = this.map.get(canonicalKey(toolName, args));
    return entry?.count ?? 0;
  }
}

/** Singleton for simple usage — reset per session via reset(). */
export const repeatReminder = new RepeatToolReminder();

/**
 * Convenience helper used by toolsProvider.
 * Advances turn and returns advisory if any threshold is crossed.
 */
export function recordAndNudge(toolName: string, args: unknown, turnId?: number): string | null {
  if (turnId !== undefined) {
    // allow external turn control
    // turnCounter is internal; we just advance if needed
  }
  return repeatReminder.check(toolName, args);
}
