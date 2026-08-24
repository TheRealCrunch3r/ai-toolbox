/**
 * FIX #20 — AutoTracker mid-loop token counting (A1 delta bookkeeping + A2 mid-loop guard)
 *
 * Regression suite for future_improvements/autoTracker_midloop_fix_plan.md:
 * - A1: TokenStatsManager records per-turn tool payload deltas (chars × 0.25 × 1.10 — same ratio as
 *   the ContextGuard.countTokens() primary path). Deltas are strictly per-TURN and must be reset at
 *   every preprocess() start or next turn's native history count would double-count them.
 * - A2: autoTracker.guardMidLoopThreshold() proactively saves a session-memory checkpoint when the
 *   turn-start baseline + cumulative delta crosses the configured threshold — no user prompt is
 *   possible mid-turn (preprocess only runs on user messages).
 */

// Mocks must be declared before the imports below are evaluated by Jest.
jest.mock('../src/lmStudioApi', () => ({
  getSessionTotalTokens: jest.fn().mockReturnValue(0),
  getLastTokenData: jest.fn().mockReturnValue(null),
  resetSessionState: jest.fn(),
  getTokenSummary: jest.fn().mockReturnValue(''),
}));

jest.mock('../src/tools/contextManagementTools', () => {
  class MockContextStorageManager {
    addEntry = jest.fn().mockResolvedValue(undefined);
  }
  return { ContextStorageManager: MockContextStorageManager };
});

import { AutoTracker, AutoTrackState } from '../src/autoTracker';
import { TokenStatsManager, estimateTokensFromChars } from '../src/tokenStatsManager';

// Note: threshold boundary math below uses CONTEXT_GUARD_OVERHEAD (= 8, private in autoTracker) —
// the same constant tests/autoTracker.test.ts pins (7508/10000 = exactly 75.0% effective).

/**
 * Storage manager that records every added entry (and can fail on demand) for assertions.
 * STATE IS STATIC because AutoTracker constructs a FRESH instance per flush/save call
 * (`new Ctor()`) — only shared static state survives across those instances.
 */
class RecordingStorageManager {
  static entries: unknown[] = [];
  static failNext = false;
  addEntry(entry: unknown): Promise<void> {
    if (RecordingStorageManager.failNext) {
      RecordingStorageManager.failNext = false;
      return Promise.reject(new Error('mock storage failure'));
    }
    RecordingStorageManager.entries.push(entry);
    return Promise.resolve();
  }
}

/** Convenience accessor for the shared static entry list. */
const savedEntries = () => RecordingStorageManager.entries;

// ==================== A1 — TokenStatsManager delta bookkeeping ====================

describe('FIX #20 A1 — per-turn tool payload delta bookkeeping', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {}); // keep DELTA log lines out of test output
    TokenStatsManager.clear();
  });

  afterEach(() => {
    (console.log as unknown as { mockRestore: () => void }).mockRestore();
  });

  it('estimates tokens with the ContextGuard ratio chars × 0.25 × 1.10 (ceiling)', () => {
    // IEEE-754: double(1.1) is slightly ABOVE exact 1.1, so 100×1.1 === 110.00000000000001 and
    // ceil() → 111 (real-arithmetic would give exactly 110). This matches the ContextGuard primary
    // path EXACTLY (same formula, contextGuard.ts:156) — do NOT "simplify" either side to exact
    // integer math without updating both; +1 on boundaries is the conservative (early-snapshot) direction.
    expect(estimateTokensFromChars(400)).toBe(111);
    expect(estimateTokensFromChars(401)).toBe(111); // ceil(110.275) = 111 — ceiling verified
    expect(estimateTokensFromChars(0)).toBe(0);
  });

  it('accumulates string payloads per turn and exposes the estimated delta', () => {
    // IEEE-754: double(1.1) is slightly above exact 1.1, so the raw products are NOT integers here —
    // values verified empirically in Node and MUST mirror the ContextGuard primary path exactly (same formula):
    const first = TokenStatsManager.recordToolResult('read_file', 'x'.repeat(400)); // raw 110.00000000000001 → ceil = 111
    const second = TokenStatsManager.recordToolResult('grep_files', 'y'.repeat(800)); // raw 220.00000000000003 → ceil = 221

    expect(first).toBe(111);
    expect(second).toBe(221);
    // Per-record ceils accumulate (111 + 221 = 332) — deliberately NOT re-estimated from total chars,
    // because ceil is not additive across FP boundaries. Do NOT "simplify" to exact integer math.
    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(332);
    expect(TokenStatsManager.getMidLoopDeltaChars()).toBe(1200);
  });

  it('measures object payloads via JSON serialization and string arrays by summing', () => {
    const obj = TokenStatsManager.recordToolResult('list_directory', { success: true, files: ['a.ts', 'b.ts'] });
    expect(obj).toBe(estimateTokensFromChars(JSON.stringify({ success: true, files: ['a.ts', 'b.ts'] }).length));

    TokenStatsManager.resetMidLoopDelta();
    const arr = TokenStatsManager.recordToolResult('run_tests', ['line1', 'line2']);
    expect(arr).toBe(estimateTokensFromChars('line1'.length + 'line2'.length));
  });

  it('resets the per-turn delta so the next turn is not double-counted (A1 invariant)', () => {
    TokenStatsManager.recordToolResult('read_file', 'z'.repeat(4000)); // 1100 tok
    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBeGreaterThan(0);

    // This is what promptPreprocessor.preprocess() does at the start of every user turn:
    TokenStatsManager.resetMidLoopDelta();

    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(0);
    expect(TokenStatsManager.getMidLoopDeltaChars()).toBe(0);
  });

  it('clear() also drops baseline/limit published for the mid-loop guard', () => {
    TokenStatsManager.setTurnEvaluation(5000, 10000);
    TokenStatsManager.recordToolResult('t', 'a'.repeat(400));

    TokenStatsManager.clear();

    expect(TokenStatsManager.getTurnBaseline()).toBe(0);
    expect(TokenStatsManager.getMaxContextTokens()).toBe(0);
    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(0);
  });
});

// ==================== A2 — AutoTracker mid-loop guard ====================

describe('FIX #20 A2 — mid-loop proactive checkpoint (guardMidLoopThreshold)', () => {
  let tracker: AutoTracker;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    TokenStatsManager.clear();
    RecordingStorageManager.entries.length = 0;
    RecordingStorageManager.failNext = false;
    // AutoTracker calls `new Ctor()` on the injected storage — pass the CLASS (not an instance),
    // exactly like tests/autoTracker.test.ts. Static state makes entries visible across instances.
    tracker = new AutoTracker({ autoTrackingEnabled: true }, RecordingStorageManager);
  });

  afterEach(() => {
    (console.log as unknown as { mockRestore: () => void }).mockRestore();
    (console.error as unknown as { mockRestore: () => void }).mockRestore();
    (console.warn as unknown as { mockRestore: () => void }).mockRestore();
  });

  /** Full A1+A2 simulation of one tool return inside an agentic loop (returns the guard outcome). */
  async function runToolReturn(
    payload: unknown,
  ): Promise<{ fired: boolean; saved?: boolean; sessionId?: string }> {
    TokenStatsManager.recordToolResult('read_file', payload); // wrapper's recording step (A1)
    return tracker.guardMidLoopThreshold(                    // wrapper's guard evaluation (A2)
      TokenStatsManager.getTurnBaseline(),
      TokenStatsManager.getMidLoopDeltaTokens(),
      TokenStatsManager.getMaxContextTokens(),
    );
  }

  it('does NOT fire while cumulative usage stays below the threshold', async () => {
    // Turn started at 70% of a 10k window; a small tool result keeps us under 75%.
    // est(240 chars) = ceil(66.0) = 66 → cumulative 7066 < 7508 (threshold incl. OVERHEAD).
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const below = await runToolReturn('x'.repeat(240));
    expect(below.fired).toBe(false);
    expect(savedEntries().length).toBe(0);
  });

  it('fires exactly at the threshold boundary (75.00% incl. overhead) and saves a checkpoint', async () => {
    // Boundary math mirrors tests/autoTracker.test.ts: effective = (cumulative − OVERHEAD) / maxTokens.
    // Fire needs cumulative ≥ 0.75 × 10000 + OVERHEAD = 7508 at threshold 75%.
    // est(33 chars) = ceil(9.075) = 10 → baseline 7498 + 10 = exactly 7508 → (7508−8)/10000 = 75.0% → fires.
    TokenStatsManager.setTurnEvaluation(7498, 10000);
    const res = await runToolReturn('x'.repeat(33));

    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(10); // est arithmetic pinned explicitly
    expect(res.fired).toBe(true);
    expect(res.saved).toBe(true);
    expect(res.sessionId?.startsWith('ctx_')).toBe(true);
    const checkpoint = savedEntries().find(e => (e as { tags?: string[] })?.tags?.includes('auto_checkpoint'));
    expect(checkpoint).toBeDefined();
  });

  it('does NOT fire one cumulative token below the boundary', async () => {
    // Case A: no growth (delta ≤ 0) short-circuits before any percentage math.
    TokenStatsManager.setTurnEvaluation(7507, 10000);
    const zeroDelta = await tracker.guardMidLoopThreshold(TokenStatsManager.getTurnBaseline(), 0, 10000);
    expect(zeroDelta.fired).toBe(false);
    expect(savedEntries().length).toBe(0);

    // Case B: positive growth reaching cumulative 7507 → effective 7499/10000 = 74.99% < 75%.
    TokenStatsManager.clear();
    tracker.resetCounter();
    TokenStatsManager.setTurnEvaluation(7498, 10000);
    const below = await runToolReturn('x'.repeat(32)); // est = ceil(8.8) = 9 → cumulative 7507
    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(9);
    expect(below.fired).toBe(false);
    expect(savedEntries().length).toBe(0);
  });

  it('re-fires only if usage grows beyond the level already guarded (dedupe within a turn)', async () => {
    // First return crosses: est(4500) = ceil(1237.5) = 1238 → cumulative 8238, guard armed at 8238.
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const first = await runToolReturn('x'.repeat(4500));
    expect(first.fired).toBe(true);

    // Second evaluation: usage still above the threshold but NOT beyond the guarded level → deduped.
    TokenStatsManager.resetMidLoopDelta();
    const noReFire = await tracker.guardMidLoopThreshold(7000, 1233, 10000); // cumulative 8233 ≤ 8238
    expect(noReFire.fired).toBe(false);

    // Third evaluation: usage climbed beyond the guarded level → re-fires.
    TokenStatsManager.resetMidLoopDelta();
    const bigger = await tracker.guardMidLoopThreshold(7000, 1500, 10000); // cumulative 8500 > 8238
    expect(bigger.fired).toBe(true);
    const checkpoints = savedEntries().filter(e => (e as { tags?: string[] })?.tags?.includes('auto_checkpoint'));
    expect(checkpoints.length).toBe(2);
  });

  it('flushes buffered auto-tracked actions together with the checkpoint snapshot', async () => {
    tracker.analyzeMessage('I decided to keep the delta bookkeeping in TokenStatsManager'); // decision → buffer
    expect(tracker.getBufferedActionCount()).toBe(1);

    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const res = await runToolReturn('x'.repeat(4500));
    expect(res.saved).toBe(true);

    // One checkpoint entry + one flushed action entry.
    const tags = savedEntries().map(e => (e as { tags?: string[] })?.tags ?? []);
    expect(tags.some(t => t.includes('auto_checkpoint'))).toBe(true);
    expect(tags.some(t => t.includes('auto_track') && t.includes('decision'))).toBe(true);
    expect(tracker.getBufferedActionCount()).toBe(0);
  });

  it('does not touch the FSM — next turn prompt flow still runs independently', async () => {
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const res = await runToolReturn('x'.repeat(4500));
    expect(res.saved).toBe(true);

    // FSM must remain IDLE: guard is a side-effect path only (design decision — see method docblock).
    expect(tracker.getState()).toBe(AutoTrackState.IDLE);
  });

  it('rolls back the guard level when the snapshot save fails, so a larger payload can retry', async () => {
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    RecordingStorageManager.failNext = true; // must be static — AutoTracker news up its own instance per save call
    const failed = await runToolReturn('x'.repeat(4500)); // cumulative ≈ 8238 → save fails
    expect(failed.fired).toBe(true);
    expect(failed.saved).toBe(false);

    TokenStatsManager.resetMidLoopDelta();
    const retry = await tracker.guardMidLoopThreshold(7000, 1240, 10000); // cumulative 8240 > rolled-back level (6999)
    expect(retry.fired).toBe(true); // guard was rolled back on failure → crossing still active → fires again
    expect(retry.saved).toBe(true);
    expect(savedEntries().filter(e => (e as { tags?: string[] })?.tags?.includes('auto_checkpoint')).length).toBe(1);
  });

  it('never fires when auto-tracking is disabled or no context limit is known', async () => {
    const disabled = new AutoTracker({ autoTrackingEnabled: false }, RecordingStorageManager);
    TokenStatsManager.setTurnEvaluation(9000, 10000);
    expect((await disabled.guardMidLoopThreshold(9000, 500, 10000)).fired).toBe(false);

    const noLimit = new AutoTracker({ autoTrackingEnabled: true }, RecordingStorageManager);
    TokenStatsManager.setTurnEvaluation(9000, 0); // maxTokens = 0 → unknown limit
    expect((await noLimit.guardMidLoopThreshold(9000, 500, 0)).fired).toBe(false);

    expect(savedEntries().length).toBe(0);
  });

  it('simulates the full tool loop from the plan: 5 × ~30k-char returns cross the threshold mid-loop', async () => {
    // Plan verification scenario: turn starts at 60% of a 100k window; each of 5 tool calls returns
    // ~30,000 chars (≈8,250 est. tok). Crossing must happen on the FIRST such return, not at next user msg.
    TokenStatsManager.setTurnEvaluation(60000, 100000);

    const firePoints: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const res = await runToolReturn('x'.repeat(30000)); // ≈ ceil(30000 × 0.275) = 8250 tok each
      if (res.fired && res.saved) firePoints.push(i);
    }

    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(5 * 8250); // full loop delta bookkept (A1)
    expect(firePoints.length).toBeGreaterThanOrEqual(1);              // at least one proactive snapshot…
    expect(firePoints[0]).toBeLessThanOrEqual(2);                     // …within the first two returns, not next turn
  });

  it('resets guard level on context compression and new session so re-crossing fires again', async () => {
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const fired = await runToolReturn('x'.repeat(4500)); // guarded at ≈8238
    expect(fired.fired).toBe(true);

    tracker.onContextCompressed(); // compression → fresh context below threshold
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const afterCompress = await runToolReturn('x'.repeat(4500));
    expect(afterCompress.fired).toBe(true); // re-armed — would be skipped without the reset

    tracker.resetCounter(); // new session
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const afterSessionReset = await runToolReturn('x'.repeat(4500));
    expect(afterSessionReset.fired).toBe(true);
  });
});
