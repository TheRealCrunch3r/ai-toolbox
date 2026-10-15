/**
 * FIX #20 — AutoTracker mid-loop token counting (A1 delta bookkeeping + A2 mid-loop guard)
 *
 * Regression suite for future_improvements/autoTracker_midloop_fix_plan.md:
 * - A1: TokenStatsManager records per-turn tool payload deltas (shared agentic density via
 *   estimateTokensFromChars — the same function as the ContextGuard.countTokens() primary path, 10.11).
 *   Deltas are strictly per-TURN and must be reset at
 *   every preprocess() start or next turn's native history count would double-count them.
 * - A2: autoTracker.guardMidLoopThreshold() proactively saves a session-memory checkpoint when the
 *   turn-start baseline + cumulative delta crosses the configured threshold — no user prompt is
 *   possible mid-turn (preprocess only runs on user messages).
 *
 * 15.10 DENSITY-ADAPTIVE REWRITE (owner request "make AGENTIC_CHARS_PER_TOKEN user editable"): every
 * expectation that depends on the chars-per-token density is now DERIVED at runtime from
 * estimateTokensFromChars() / getAgenticCharsPerToken() instead of hardcoding values computed under
 * one fixed ÷3.4 quotient. Owner changes to the contextGuardAgenticDensity menu field (or the default
 * const in tokenStatsManager.ts) therefore NEVER break this suite. What stays pinned EXACTLY is the
 * structural contract: fire line = floor(threshold%·limit) + CONTEXT_GUARD_OVERHEAD(8), one-cumulative-
 * token-below does not fire, hysteresis floor max(4096, 5%·limit), rollback-on-failed-save semantics.
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
import { TokenStatsManager, estimateTokensFromChars, getAgenticCharsPerToken, setAgenticCharsPerToken } from '../src/tokenStatsManager';

// Note: threshold boundary math below uses CONTEXT_GUARD_OVERHEAD (= 8, private in autoTracker) —
// the same constant tests/autoTracker.test.ts pins (7508/10000 = exactly 75.0% effective).
const OVERHEAD = 8;
const LIMIT = 10_000;
/** Exact A2 fire line at the default 75% threshold: cumulative must reach floor(0.75·limit) + overhead. */
const FIRE_LINE = Math.floor(0.75 * LIMIT) + OVERHEAD; // 7508 — threshold/overhead math, density-INDEPENDENT

/** Storage manager that records every added entry (and can fail on demand) for assertions.
 * STATE IS STATIC because AutoTracker constructs a FRESH instance per flush/save call
 * (`new Ctor()`) — only shared static state survives across those instances. */
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

  it('estimates tokens with the live shared agentic density (adaptive — never a hardcoded quotient)', () => {
    // 15.10: expectations DERIVED from getAgenticCharsPerToken() so owner menu changes
    // (contextGuardAgenticDensity) cannot break this suite. FP note preserved: JS double quotients of
    // chars/density may sit marginally above/below exact decimal arithmetic; Math.ceil keeps the +1 boundary
    // direction conservative (early-snapshot side). Do NOT "simplify" to exact integer math.
    const d = getAgenticCharsPerToken();
    expect(d).toBeGreaterThan(0);
    expect(Number.isFinite(d)).toBe(true);

    expect(estimateTokensFromChars(0)).toBe(0); // empty payload is always zero — density-independent
    expect(estimateTokensFromChars(-5)).toBe(0); // negative input clamps to zero (Math.max(0, chars))

    // Ceiling verified structurally: the smallest char count estimating EXACTLY n tokens has n·d - 1 < chars ≤ n·d.
    const n = 60; // mirrors the former /3.4 probe at est(204)=60 — same n, live density
    expect(estimateTokensFromChars(Math.floor(d * n))).toBeLessThanOrEqual(n); // just below the boundary → ≤ n
    expect(estimateTokensFromChars(Math.ceil(d * (n + 1)))).toBeGreaterThanOrEqual(n + 1); // one step past → ≥ n+1
    expect(estimateTokensFromChars(Math.ceil(d * n))).toBeLessThanOrEqual(n); // at-or-just-past the boundary stays ≤ n …
    const onePast = estimateTokensFromChars(Math.floor(d * n) + Math.max(1, Math.ceil(d / 2)));
    expect(onePast).toBeGreaterThanOrEqual(n); // …and only grows by the ceil step (monotone non-decreasing)

    // Monotonicity over a sweep — holds for ANY positive density:
    let prev = 0;
    for (let chars = 1; chars <= Math.ceil(d * 25); chars += Math.max(1, Math.floor(d / 4))) {
      const est = estimateTokensFromChars(chars);
      expect(est).toBeGreaterThanOrEqual(prev);
      prev = est;
    }
  });

  it('accumulates string payloads per turn and exposes the estimated delta (derived under live density)', () => {
    // Shared agentic density (live value, tokenStatsManager) — values DERIVED from the same production function,
    // so this mirrors the ContextGuard primary path exactly for whatever density is configured:
    const first = TokenStatsManager.recordToolResult('read_file', 'x'.repeat(400));
    const second = TokenStatsManager.recordToolResult('grep_files', 'y'.repeat(800));

    expect(first).toBe(estimateTokensFromChars(400)); // exact same-function parity (no hardcoded quotient)
    expect(second).toBe(estimateTokensFromChars(800));
    // Per-record ceils accumulate — deliberately NOT re-estimated from total chars, because ceil is not additive
    // across FP boundaries. Do NOT "simplify" to exact integer math.
    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(estimateTokensFromChars(400) + estimateTokensFromChars(800));
    expect(TokenStatsManager.getMidLoopDeltaChars()).toBe(1200); // raw char sum — always density-independent
  });

  it('measures object payloads via JSON serialization and string arrays by summing', () => {
    const obj = TokenStatsManager.recordToolResult('list_directory', { success: true, files: ['a.ts', 'b.ts'] });
    expect(obj).toBe(estimateTokensFromChars(JSON.stringify({ success: true, files: ['a.ts', 'b.ts'] }).length));

    TokenStatsManager.resetMidLoopDelta();
    const arr = TokenStatsManager.recordToolResult('run_tests', ['line1', 'line2']);
    expect(arr).toBe(estimateTokensFromChars('line1'.length + 'line2'.length));
  });

  it('resets the per-turn delta so the next turn is not double-counted (A1 invariant)', () => {
    TokenStatsManager.recordToolResult('read_file', 'z'.repeat(4000)); // exact est value intentionally NOT pinned — density-dependent
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

  it('setAgenticCharsPerToken() rejects junk and estimateTokensFromChars follows the live density (15.10)', () => {
    // The user-editable path: a valid change takes effect immediately for all estimations…
    const prev = getAgenticCharsPerToken();
    const original = estimateTokensFromChars(204);
    try {
      expect(() => setAgenticCharsPerToken(NaN)).not.toThrow(); // NaN → safe no-op, value preserved
      expect(getAgenticCharsPerToken()).toBe(prev);
      expect(() => setAgenticCharsPerToken(0)).not.toThrow(); // ≤ 0 → safe no-op (would make every estimate Infinity)
      expect(() => setAgenticCharsPerToken(-3.45)).not.toThrow();
      expect(getAgenticCharsPerToken()).toBe(prev);

      // …a valid change flips the quotient in the expected direction (larger density = denser content = fewer tokens).
      const d2 = prev / 2; // e.g. 3.6 → 1.8 (default since 15.10): same chars, roughly double the estimated tokens
      setAgenticCharsPerToken(d2);
      expect(getAgenticCharsPerToken()).toBe(d2);
      expect(estimateTokensFromChars(204)).toBeGreaterThanOrEqual(original); // half the density ⇒ ≥ as many tokens
    } finally {
      setAgenticCharsPerToken(prev); // restore — suite isolation (other suites must see the default)
    }
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

  /** Chars needed so estimateTokensFromChars(chars) ≥ minEst — density-independent crossing payload. */
  const charsForAtLeast = (minEst: number): number => Math.max(1, Math.ceil((minEst - 1) * getAgenticCharsPerToken()) + 1);

  it('does NOT fire while cumulative usage stays below the threshold', async () => {
    // Turn started at 70% of a 10k window; a small tool result keeps us under the fire line (7508) for ANY density:
    // est(240 chars) ≤ 240 tokens even at schema-min density 1 → cumulative ≤ 7240 < 7508.
    TokenStatsManager.setTurnEvaluation(7000, LIMIT);
    const below = await runToolReturn('x'.repeat(240));
    expect(below.fired).toBe(false);
    expect(savedEntries().length).toBe(0);
  });

  it('fires exactly at the threshold boundary (75.00% incl. overhead) and saves a checkpoint', async () => {
    // Boundary math mirrors tests/autoTracker.test.ts: effective = (cumulative − OVERHEAD) / maxTokens.
    // Fire needs cumulative ≥ FIRE_LINE (= floor(0.75·10k)+8 = 7508) at threshold 75% — density-INDEPENDENT;
    // the payload size is derived so the cumulative lands EXACTLY on the fire line under the live density:
    const e32ish = estimateTokensFromChars(charsForAtLeast(1)); // ≥1 est token for ANY density
    TokenStatsManager.setTurnEvaluation(FIRE_LINE - e32ish, LIMIT); // baseline + payload est = exactly FIRE_LINE
    const res = await runToolReturn('x'.repeat(charsForAtLeast(1)));

    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(e32ish); // exact same-function parity (no hardcoded quotient)
    expect(FIRE_LINE - e32ish + TokenStatsManager.getMidLoopDeltaTokens()).toBe(FIRE_LINE); // cumulative on the fire line
    expect(res.fired).toBe(true); // (FIRE_LINE − OVERHEAD)/10000 = exactly 75.0% → fires
    expect(res.saved).toBe(true);
    expect(res.sessionId?.startsWith('ctx_')).toBe(true);
    const checkpoint = savedEntries().find(e => (e as { tags?: string[] })?.tags?.includes('auto_checkpoint'));
    expect(checkpoint).toBeDefined();
  });

  it('does NOT fire one cumulative token below the boundary', async () => {
    // Case A: no growth (delta ≤ 0) short-circuits before any percentage math.
    TokenStatsManager.setTurnEvaluation(FIRE_LINE - 1, LIMIT);
    const zeroDelta = await tracker.guardMidLoopThreshold(TokenStatsManager.getTurnBaseline(), 0, LIMIT);
    expect(zeroDelta.fired).toBe(false);
    expect(savedEntries().length).toBe(0);

    // Case B: positive growth reaching exactly ONE cumulative token under the fire line → effective < 75% (any density):
    TokenStatsManager.clear();
    tracker.resetCounter();
    const payloadChars = charsForAtLeast(1);
    const e = estimateTokensFromChars(payloadChars);
    TokenStatsManager.setTurnEvaluation(FIRE_LINE - e - 1, LIMIT);
    const below = await runToolReturn('x'.repeat(payloadChars)); // cumulative = FIRE_LINE − 1 (one token under the fire line)
    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(e);
    expect(below.fired).toBe(false);
    expect(savedEntries().length).toBe(0);
  });

  it('re-fires only after growth since the last save reaches the hysteresis floor (F2, 17.09 — supersedes legacy any-growth dedupe)', async () => {
    // Hysteresis floor = max(4096, 5%·limit) mirrors autoTracker's formula at this limit → 4096 (density-independent).
    const FLOOR = Math.max(4096, Math.floor(LIMIT * 0.05)); // = 4096
    const BASELINE = 7000;

    // First return crosses: payload derived so cumulative > FIRE_LINE for ANY density in [1, 20].
    TokenStatsManager.setTurnEvaluation(BASELINE, LIMIT);
    const crossChars = charsForAtLeast(FIRE_LINE - BASELINE + 1); // est ≥ 509 ⇒ cumulative ≥ 7509 > fire line
    const first = await runToolReturn('x'.repeat(crossChars));
    expect(first.fired).toBe(true);
    const guardedLevel = BASELINE + TokenStatsManager.getMidLoopDeltaTokens(); // armed here (density-derived, not hardcoded)

    // Second evaluation: positive growth since the last save but below the floor → suppressed.
    TokenStatsManager.resetMidLoopDelta();
    const noReFire = await tracker.guardMidLoopThreshold(BASELINE, guardedLevel + FLOOR - 1 - BASELINE, LIMIT);
    expect(noReFire.fired).toBe(false);

    // Third evaluation: growth since the guarded level reaches EXACTLY the floor → boundary re-fire (growth >= floor fires).
    TokenStatsManager.resetMidLoopDelta();
    const bigger = await tracker.guardMidLoopThreshold(BASELINE, guardedLevel + FLOOR - BASELINE, LIMIT);
    expect(bigger.fired).toBe(true);
    const checkpoints = savedEntries().filter(e => (e as { tags?: string[] })?.tags?.includes('auto_checkpoint'));
    expect(checkpoints.length).toBe(2); // first crossing + exactly-one floor re-fire — structural pin
  });

  it('flushes buffered auto-tracked actions together with the checkpoint snapshot', async () => {
    tracker.analyzeMessage('I decided to keep the delta bookkeeping in TokenStatsManager'); // decision → buffer
    expect(tracker.getBufferedActionCount()).toBe(1);

    const BASELINE = 7000;
    TokenStatsManager.setTurnEvaluation(BASELINE, LIMIT);
    const res = await runToolReturn('x'.repeat(charsForAtLeast(FIRE_LINE - BASELINE + 1))); // crossing for any density
    expect(res.saved).toBe(true);

    // One checkpoint entry + one flushed action entry.
    const tags = savedEntries().map(e => (e as { tags?: string[] })?.tags ?? []);
    expect(tags.some(t => t.includes('auto_checkpoint'))).toBe(true);
    expect(tags.some(t => t.includes('auto_track') && t.includes('decision'))).toBe(true);
    expect(tracker.getBufferedActionCount()).toBe(0);
  });

  it('does not touch the FSM — next turn prompt flow still runs independently', async () => {
    const BASELINE = 7000;
    TokenStatsManager.setTurnEvaluation(BASELINE, LIMIT);
    const res = await runToolReturn('x'.repeat(charsForAtLeast(FIRE_LINE - BASELINE + 1))); // crossing for any density
    expect(res.saved).toBe(true);

    // FSM must remain IDLE: guard is a side-effect path only (design decision — see method docblock).
    expect(tracker.getState()).toBe(AutoTrackState.IDLE);
  });

  it('rolls back the guard level when the snapshot save fails, so a larger payload can retry', async () => {
    const BASELINE = 7000;
    TokenStatsManager.setTurnEvaluation(BASELINE, LIMIT);
    RecordingStorageManager.failNext = true; // must be static — AutoTracker news up its own instance per save call
    const failed = await runToolReturn('x'.repeat(charsForAtLeast(FIRE_LINE - BASELINE + 1))); // first crossing → fires, save fails
    expect(failed.fired).toBe(true);
    expect(failed.saved).toBe(false);

    TokenStatsManager.resetMidLoopDelta();
    const retry = await tracker.guardMidLoopThreshold(BASELINE, FIRE_LINE - BASELINE, LIMIT); // cumulative ≥ fire line again
    expect(retry.fired).toBe(true); // rollback-to-zero makes the retry a FIRST crossing — F2 hysteresis floor must not swallow it
    expect(retry.saved).toBe(true);
    expect(savedEntries().filter(e => (e as { tags?: string[] })?.tags?.includes('auto_checkpoint')).length).toBe(1);
  });

  it('never fires when auto-tracking is disabled or no context limit is known', async () => {
    const disabled = new AutoTracker({ autoTrackingEnabled: false }, RecordingStorageManager);
    TokenStatsManager.setTurnEvaluation(9000, LIMIT);
    expect((await disabled.guardMidLoopThreshold(9000, 500, LIMIT)).fired).toBe(false);

    const noLimit = new AutoTracker({ autoTrackingEnabled: true }, RecordingStorageManager);
    TokenStatsManager.setTurnEvaluation(9000, 0); // maxTokens = 0 → unknown limit
    expect((await noLimit.guardMidLoopThreshold(9000, 500, 0)).fired).toBe(false);

    expect(savedEntries().length).toBe(0);
  });

  it('simulates the full tool loop from the plan: repeated large returns cross the threshold mid-loop', async () => {
    // Plan verification scenario (15.10 adaptive): turn starts at 60% of a 100k window; each tool call returns a payload
    // sized so its estimate ALONE crosses the fire line under ANY configured density — the loop must therefore fire on
    // return #1 and bookkeep exactly 5 × est(payload) for whatever the live density is.
    TokenStatsManager.setTurnEvaluation(60_000, 100_000);

    const FIRE_LINE_LOOP = Math.floor(0.75 * 100_000) + OVERHEAD; // 75080 — threshold/overhead math, density-independent
    const payloadChars = charsForAtLeast(FIRE_LINE_LOOP - 60_000 + 1); // est ≥ 15081 ⇒ cumulative after return #1 > fire line

    const firePoints: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const res = await runToolReturn('x'.repeat(payloadChars));
      if (res.fired && res.saved) firePoints.push(i);
    }

    expect(TokenStatsManager.getMidLoopDeltaTokens()).toBe(5 * estimateTokensFromChars(payloadChars)); // full loop bookkept (A1; derived, not hardcoded)
    expect(firePoints.length).toBeGreaterThanOrEqual(1);              // at least one proactive snapshot…
    expect(firePoints[0]).toBeLessThanOrEqual(2);                     // …within the first two returns, not next turn
  });

  it('resets guard level on context compression and new session so re-crossing fires again', async () => {
    const BASELINE = 7000;
    TokenStatsManager.setTurnEvaluation(BASELINE, LIMIT);
    const payloadChars = charsForAtLeast(FIRE_LINE - BASELINE + 1); // crossing for any density
    const fired = await runToolReturn('x'.repeat(payloadChars));
    expect(fired.fired).toBe(true);

    tracker.onContextCompressed(); // compression → fresh context below threshold
    TokenStatsManager.setTurnEvaluation(BASELINE, LIMIT);
    const afterCompress = await runToolReturn('x'.repeat(payloadChars));
    expect(afterCompress.fired).toBe(true); // re-armed — would be skipped without the reset

    tracker.resetCounter(); // new session
    TokenStatsManager.setTurnEvaluation(BASELINE, LIMIT);
    const afterSessionReset = await runToolReturn('x'.repeat(payloadChars));
    expect(afterSessionReset.fired).toBe(true);
  });
});
