/**
 * FIX-A (09.10, owner GO) — user-visible notification of mid-loop threshold crossings.
 *
 * Root cause pinned by this suite: guardMidLoopThreshold() deliberately never touches the FSM and armed NO state —
 * its console.log "user will be notified on next message" was a promise no state carried across turns. The next
 * turn's checkAndGeneratePrompt() re-evaluates usage from scratch, so a crossing followed by compression or a
 * context-window increase dropping usage below threshold vanished with zero user-visible mention (09.10 verification
 * session: silent 75%+/92.2% checkpoints). FIX-A arms a one-shot notice on every successful mid-loop save; the text
 * is rendered + consumed by takePendingMidLoopNotice() and injected F1-style in preprocess() (promptPreprocessor —
 * pinned separately, it rides userPrompt so it reaches EVERY return path).
 *
 * Harness: same AutoTracker + RecordingStorageManager static-state pattern as tests/fix20_midloop_token_counting.test.ts
 * (AutoTracker constructs a FRESH storage instance per save call → only static state survives across instances).
 */

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
import { TokenStatsManager } from '../src/tokenStatsManager';

/** Records every added entry; can fail on demand. STATIC state — see fix-20 suite header for the why. */
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

const savedEntries = () => RecordingStorageManager.entries;

describe('FIX-A (09.10) — one-shot mid-loop crossing notice', () => {
  let tracker: AutoTracker;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    TokenStatsManager.clear();
    RecordingStorageManager.entries.length = 0;
    RecordingStorageManager.failNext = false;
    // AutoTracker calls `new Ctor()` on the injected storage — pass the CLASS (not an instance).
    tracker = new AutoTracker({ autoTrackingEnabled: true }, RecordingStorageManager);
  });

  afterEach(() => {
    (console.log as unknown as { mockRestore: () => void }).mockRestore();
    (console.error as unknown as { mockRestore: () => void }).mockRestore();
    (console.warn as unknown as { mockRestore: () => void }).mockRestore();
    TokenStatsManager.clearActiveToolCallsForTests();
  });

  it('arms the notice on a successful mid-loop save and renders usage AT CROSSING with the checkpoint id', async () => {
    // Boundary math mirrors fix-20: fire needs cumulative >= 0.75*10000 + OVERHEAD(8) = 7508 at threshold 75%.
    // est('x'×33) = ceil(9.075) = 10 → baseline 7498 + 10 = exactly 7508. usage = ((7508−8)/10000)*100 = "75.0".
    TokenStatsManager.setTurnEvaluation(7498, 10000);
    const res = await tracker.guardMidLoopThreshold(TokenStatsManager.getTurnBaseline(), 10, 10000);
    expect(res.fired).toBe(true);
    expect(res.saved).toBe(true);

    // The armed record names the crossing usage (75.0% — at crossing, NOT the configured 75 threshold) and the checkpoint id.
    const text = tracker.takePendingMidLoopNotice();
    expect(typeof text).toBe('string');
    expect(text).toContain('MID-LOOP CONTEXT THRESHOLD NOTICE');
    expect(text).toContain('~75.0% of the model context window used'); // usage AT CROSSING pin (large jumps cross well past 75)
    expect(text).toContain(`(checkpoint ${res.sessionId})`);
    expect(text).toContain('Briefly acknowledge this to the user');
    expect(text).toContain('no YES/NO reply or further action is required'); // never a demand — acknowledgement only

    // One-shot: consumed on first call, second take returns null (never re-injected on later turns).
    expect(tracker.hasPendingMidLoopNotice()).toBe(false);
    expect(tracker.takePendingMidLoopNotice()).toBeNull();
  });

  it('arms NOTHING while usage stays below the threshold', async () => {
    TokenStatsManager.setTurnEvaluation(7000, 10000); // small delta → cumulative well under 75.08%
    const res = await tracker.guardMidLoopThreshold(7000, 66, 10000);
    expect(res.fired).toBe(false);
    expect(savedEntries().length).toBe(0);

    expect(tracker.hasPendingMidLoopNotice()).toBe(false);
    expect(tracker.takePendingMidLoopNotice()).toBeNull(); // common case stays silent — no phantom notices
  });

  it('arms NOTHING when the save fails; a later successful retry arms exactly one notice (latest crossing)', async () => {
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    RecordingStorageManager.failNext = true; // first save attempt fails → guard rolls back to first-crossing
    const failed = await tracker.guardMidLoopThreshold(TokenStatsManager.getTurnBaseline(), 1238, 10000);
    expect(failed.fired).toBe(true);
    expect(failed.saved).toBe(false);
    expect(tracker.takePendingMidLoopNotice()).toBeNull(); // a failed save must NOT announce itself

    // Same-turn retry (production shape): nothing resets the turn's published baseline mid-loop — only preprocess() does,
    // and resetMidLoopDelta() is that new-turn hook (it zeroes baseline+limit), so it must NOT be used here. The guard's own
    // save-failure rollback (_midLoopGuardedAt -> 0) is what makes this call behave like the FIRST crossing again.
    const retry = await tracker.guardMidLoopThreshold(TokenStatsManager.getTurnBaseline(), 1240, 10000);
    expect(retry.fired).toBe(true);
    expect(retry.saved).toBe(true);

    const text = tracker.takePendingMidLoopNotice();
    expect(typeof text).toBe('string'); // exactly one notice for the SUCCESSFUL save…
    expect(text).toContain(`(checkpoint ${retry.sessionId})`);
    expect(tracker.takePendingMidLoopNotice()).toBeNull(); // …and it is consumed once
  });

  it('leaves the FSM untouched — no YES/NO prompt state, next-turn prompt flow runs independently', async () => {
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const res = await tracker.guardMidLoopThreshold(TokenStatsManager.getTurnBaseline(), 1238, 10000); // cumulative 8238 → fires + saves
    expect(res.saved).toBe(true);

    // The documented guard contract: mid-loop crossings must NOT change the prompt state machine — otherwise a tool
    // loop could silently arm an interactive YES/NO prompt that only surfaces on the next user message.
    expect(tracker.getState()).toBe(AutoTrackState.IDLE);
    expect(tracker.hasPendingWarning()).toBe(false);
  });

  it('replaces (not stacks) the pending notice when the guard re-fires after the hysteresis floor — latest crossing wins', async () => {
    // Window 200k: threshold = 150_008 incl. overhead; floor = max(4096, 5%·200k) = 10_000 (same boundary math as autoTracker.test.ts F2 block).
    TokenStatsManager.setTurnEvaluation(149_000, 200_000);
    const first = await tracker.guardMidLoopThreshold(TokenStatsManager.getTurnBaseline(), 1500, 200_000); // cumulative 150_500 → usage "75.2"
    expect(first.fired).toBe(true);
    expect(first.saved).toBe(true);

    TokenStatsManager.resetMidLoopDelta();
    const re = await tracker.guardMidLoopThreshold(149_000, 11_500, 200_000); // cumulative 160_500 → growth +10_000 == floor → fires; usage "80.2"
    expect(re.fired).toBe(true);
    expect(re.saved).toBe(true);

    const text = tracker.takePendingMidLoopNotice();
    expect(typeof text).toBe('string');
    expect(text).toContain('~80.2% of the model context window used'); // LATEST crossing…
    expect(text).not.toContain('~75.2%'); // …the first one is replaced, never stacked (one-shot = exactly one fact per cycle)
  });

  it('survives onContextCompressed() — compression re-arms the FSM but must NOT swallow an armed notice', async () => {
    TokenStatsManager.setTurnEvaluation(7000, 10000);
    const fired = await tracker.guardMidLoopThreshold(TokenStatsManager.getTurnBaseline(), 1238, 10000); // arms the notice
    expect(fired.saved).toBe(true);

    // The exact 09.10 incident sequence: mid-loop checkpoint saved → next user message compresses (onCompression fires)
    // → usage now below threshold. Pre-FIX-A this is where the owner NEVER heard about the crossing; post-FIX-A the
    // notice must still be pending for preprocess() to inject on that very same turn.
    tracker.onContextCompressed();
    expect(tracker.hasPendingMidLoopNotice()).toBe(true);

    const text = tracker.takePendingMidLoopNotice();
    expect(typeof text).toBe('string');
    expect(text).toContain(`(checkpoint ${fired.sessionId})`);
  });
});
