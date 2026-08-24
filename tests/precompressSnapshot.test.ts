/**
 * PART B Regression Test — Pre-Compression-Snapshot ordering (Plan plan_1787328136940, Step 4).
 *
 * Safety property under test: whenever ContextGuard's compression threshold is exceeded in
 * promptPreprocessor.preprocess(), AutoTracker.autoSaveSessionMemory() MUST be awaited BEFORE
 * ContextGuard.compressHistory() destroys the uncheckpointed history. A silent re-ordering of
 * these two calls (or deletion of the snapshot) would regress to data loss — exactly the defect
 * Part B exists to fix. No PromptPreprocessor mock framework exists for @lmstudio/sdk, so this
 * test drives preprocess() with a minimal controller/ history stub and spies on both sides.
 */

import { preprocess, setContextGuard } from '../src/promptPreprocessor';
import { autoTracker } from '../src/autoTracker';

interface HarnessOpts {
  tokenCount: number;
  maxTokens: number;
}

function createHarness(opts: HarnessOpts) {
  const calls: string[] = [];

  // Native-history-style message stubs (getText used by the historyTextLength loop), backed by a MUTABLE list —
  // production pop()/append() change getLength(); without that, the compression branch's `while (getLength() > 0) pop()`
  // would loop forever.
  const liveMessages: unknown[] = [
    { role: 'user', content: 'hello' },
    { role: 'assistant', content: 'world' },
  ].map((m) => ({ ...m, getText: () => m.content }));

  const history = {
    append: (m: unknown) => void liveMessages.push(m),
    pop: (): unknown => {
      calls.push('history.pop');
      return liveMessages.pop();
    },
    getLength: () => liveMessages.length,
    at: (i: number): unknown => liveMessages[i],
    // MANDATORY — preprocess() CALLS this immediately after append; without it a TypeError is thrown inside
    // Step 0.5's try block and swallowed by the outer catch, silently skipping counting + snapshot + compression.
    getMessagesArray: () => liveMessages as unknown[],
  };

  const compressHistory = jest.fn(async (_messages: unknown[]) => {
    calls.push('compressHistory');
    return [{ role: 'assistant', content: '[compressed]' }];
  });
  const resetTokenCache = jest.fn(() => void calls.push('resetTokenCache'));

  // Mirrors the real ContextGuard contract (countTokens / getTokenLimit / getThreshold @0.9 / compressHistory)
  const guard = {
    countTokens: async (..._args: unknown[]) => {
      calls.push('countTokens');
      return opts.tokenCount;
    },
    getTokenLimit: () => opts.maxTokens,
    getThreshold: () => Math.floor(opts.maxTokens * 0.9),
    compressHistory,
    resetTokenCache,
  };

  const ctl = {
    pullHistory: async () => history,
    // Minimal plugin-config stub — documentRAG=false takes the fast return path after Step 0.6;
    // temporalAwareness=false keeps the returned prompt deterministic.
    getPluginConfig: (_schematics: unknown) => ({
      get: (key: string): unknown => {
        switch (key) {
          case 'autoTrackingEnabled': return true;
          case 'documentRAG': return false;
          case 'temporalAwareness': return false;
          default: return undefined;
        }
      },
    }),
    client: {}, // no .llm → model auto-detection is skipped (matches production catch-path)
  };

  // getFiles MUST exist (production ChatMessage always has it): `userMessage.getFiles?.(client) ?? []` only
  // yields [] when the method exists and returns empty — a missing property would leave allFiles === undefined.
  const userMessage = { getText: async () => 'hello there', getFiles: () => [] } as unknown as Parameters<typeof preprocess>[1];

  return { guard, ctl, calls, compressHistory, resetTokenCache, userMessage };
}

/**
 * Per-test spy helper (NOT in beforeEach/afterEach on purpose): the singleton must not accumulate
 * call counts across tests. A local spy + mockRestore() inside a try/finally is immune to
 * hook-ordering failures, and expect.assertions() makes an unbalanced call count fail loudly.
 */
function withAutoSaveSpy<T>(mockImpl: (...args: unknown[]) => T | Promise<T>, body: (autoSaveSpy: jest.SpyInstance) => void | Promise<void>): Promise<void> {
  const autoSaveSpy = jest.spyOn(autoTracker, 'autoSaveSessionMemory').mockImplementation(mockImpl as never);
  return (async () => {
    try {
      await body(autoSaveSpy);
    } finally {
      autoSaveSpy.mockRestore();
    }
  })();
}

describe('PART B — Pre-Compression-Snapshot (ordering regression)', () => {
  beforeEach(() => {
    // Fresh FSM per test (the spy is created locally inside each test via withAutoSaveSpy)
    autoTracker.resetTokenThreshold();
  });

  afterEach(() => {
    setContextGuard(null);
  });

  it('awaits the snapshot BEFORE compressHistory() when tokenCount > threshold', async () => {
    const harness = createHarness({ tokenCount: 28000, maxTokens: 30000 }); // 93.3% > 90% (threshold = floor(30k*0.9))

    setContextGuard(harness.guard as never);
    await withAutoSaveSpy(async (...args: unknown[]) => {
      harness.calls.push(`autoSaveSessionMemory:${String(args[0])}tok`); // record interleaving at call time
      return { saved: true, sessionId: 'ctx_test_checkpoint' };
    }, async (autoSaveSpy) => {
      expect.assertions(4); // fails loudly if preprocess() ever calls the snapshot 0× or 2×
      await preprocess(harness.ctl as never, harness.userMessage);

      expect(autoSaveSpy).toHaveBeenCalledTimes(1);
      expect(harness.compressHistory).toHaveBeenCalledTimes(1);

      const snapshotIdx = harness.calls.findIndex((c) => c.startsWith('autoSaveSessionMemory'));
      const compressIdx = harness.calls.indexOf('compressHistory');
      expect(snapshotIdx).toBeGreaterThanOrEqual(0); // snapshot actually ran in the compression branch
      // 🔹 THE core ordering assertion: snapshot was fully awaited before compressHistory() even started
      expect(compressIdx).toBeGreaterThan(snapshotIdx);
    });
  });

  it('passes the exact pre-compression values (tokenCount, maxTokens, messageCount) to the snapshot', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000 }); // 105% → definitely above threshold

    setContextGuard(harness.guard as never);
    await withAutoSaveSpy(async () => ({ saved: true, sessionId: 'ctx_test_checkpoint_2' }), (autoSaveSpy) => {
      expect.assertions(4);
      return preprocess(harness.ctl as never, harness.userMessage).then(() => {
        expect(autoSaveSpy).toHaveBeenCalledTimes(1);
        const [tokens, maxTokens, messageCount] = autoSaveSpy.mock.calls[0] as unknown as [number, number, number];
        expect(tokens).toBe(31500); // count BEFORE compression — NOT re-counted after
        expect(maxTokens).toBe(30000);
        // 3 = 2 seeded stubs + the current userMessage appended by preprocess() BEFORE Step 0.5 captures getLength().
        // This mirrors production: a checkpoint taken mid-turn legitimately includes the in-flight message.
        expect(messageCount).toBe(3);
      });
    });
  });

  it('still compresses when the snapshot fails (non-fatal guarantee)', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000 });

    setContextGuard(harness.guard as never);
    await withAutoSaveSpy(async () => {
      throw new Error('storage unavailable'); // rejected promise — B-1's catch must swallow this
    }, (autoSaveSpy) => {
      expect.assertions(3);
      return preprocess(harness.ctl as never, harness.userMessage).then(() => {
        expect(autoSaveSpy).toHaveBeenCalledTimes(1);
        expect(harness.compressHistory).toHaveBeenCalledTimes(1); // compression proceeded despite snapshot failure
        expect(harness.resetTokenCache).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('does NOT call the snapshot when below threshold (no regression for normal operation)', async () => {
    const harness = createHarness({ tokenCount: 5000, maxTokens: 30000 }); // well below 90%

    setContextGuard(harness.guard as never);
    await withAutoSaveSpy(async () => ({ saved: true, sessionId: 'ctx_should_not_happen' }), (autoSaveSpy) => {
      expect.assertions(2); // an unexpected snapshot call fails BOTH this count and the assertions balance
      return preprocess(harness.ctl as never, harness.userMessage).then(() => {
        expect(autoSaveSpy).not.toHaveBeenCalled();
        expect(harness.compressHistory).not.toHaveBeenCalled();
      });
    });
  });

  it('B-2: consumes a pending checkpoint prompt after successful snapshot (no redundant YES/NO re-injection)', async () => {
    // Seed the FSM into THRESHOLD_REACHED with a live warning, as Step 0.5b would for >=75% usage
    const maxTokens = 30000;
    autoTracker.checkAndGeneratePrompt(27000, maxTokens); // 90% → triggers threshold (default 75%)
    expect(autoTracker.hasPendingWarning()).toBe(true);

    const harness = createHarness({ tokenCount: 28000, maxTokens });
    setContextGuard(harness.guard as never);
    await withAutoSaveSpy(async () => ({ saved: true, sessionId: 'ctx_test_b2' }), async (autoSaveSpy) => {
      // expect.assertions() counts ALL asserts in the test — 5 inside this body + 1 seed assert above = 6.
      // No extra expects MAY be added anywhere without updating this count.
      expect.assertions(6);
      const result = await preprocess(harness.ctl as never, harness.userMessage) as string;

      expect(autoSaveSpy).toHaveBeenCalledTimes(1);
      expect(harness.compressHistory).toHaveBeenCalledTimes(1);
      // The pending prompt must NOT be re-injected into the model input on this turn:
      expect(result).not.toContain('<SYSTEM_INSTRUCTION>');
      expect(result).not.toContain('TOKEN LIMIT WARNING');
      // FSM mirrored to CONFIRMED via canonical path (hasPendingWarning is false, state advanced)
      expect(autoTracker.hasPendingWarning()).toBe(false);
    });
  });

  it('B-2: appends a last-chance note when snapshot fails but prompt is pending', async () => {
    const maxTokens = 30000;
    autoTracker.checkAndGeneratePrompt(27000, maxTokens);
    expect(autoTracker.hasPendingWarning()).toBe(true);

    const harness = createHarness({ tokenCount: 28000, maxTokens });
    setContextGuard(harness.guard as never);
    await withAutoSaveSpy(async () => ({ saved: false }), (autoSaveSpy) => {
      // 3 body asserts + 1 seed assert above = 4 (expect.assertions() spans the whole test).
      expect.assertions(4); // storage failed without throwing — snapshot was still attempted exactly once
      return preprocess(harness.ctl as never, harness.userMessage).then((result) => {
        const out = result as string;
        expect(autoSaveSpy).toHaveBeenCalledTimes(1);
        expect(out).toContain('LAST chance before history is compressed');
        expect(harness.compressHistory).toHaveBeenCalledTimes(1); // compression still runs (non-fatal)
      });
    });
  });
});
