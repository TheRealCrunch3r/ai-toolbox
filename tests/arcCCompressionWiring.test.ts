/**
 * ARC C (07.10) — Wiring regression tests for the FORCED structured session-memory save in
 * promptPreprocessor.preprocess() PART B (the compression branch).
 *
 * Safety properties under test:
 *  - When contextGuardForceSummaryOnCompress === true AND the ContextGuard instance exposes
 *    generateSessionContinuity AND the history has >10 messages, the block runs AFTER PART B's telemetry
 *    snapshot + warning settlement and BEFORE compressHistory(): flushActionsToMemory → generate over
 *    slice(0, len-keepLast=10) → persist — with strict === true gate semantics (undefined must NOT enable).
 *  - Any failure inside the block is non-fatal: compression MUST still run.
 *  - When any gate fails (toggle off/undefined, method missing, ≤10 messages) the arc-C path is skipped and
 *    behavior stays byte-identical to legacy (the pinned tests/precompressSnapshot.test.ts suite — whose stubs
 *    lack the method and seed only 3 messages — proves that side; this file pins the positive + failure sides).
 *
 * Registry-ID note: jest.mock('../src/sessionSummaryPersist') lands on the SAME registry entry as
 * promptPreprocessor's './sessionSummaryPersist.js' import (mapper target <rootDir>/src/sessionSummaryPersist.ts),
 * so the persist spy intercepts every call in this suite without loading the real store machinery.
 */

jest.mock('../src/sessionSummaryPersist', () => ({ persistGeneratedSessionSummary: jest.fn() }));

import { preprocess, setContextGuard } from '../src/promptPreprocessor';
import { autoTracker } from '../src/autoTracker';
import * as sessionSummaryPersist from '../src/sessionSummaryPersist';
import type { SessionSummaryData } from '../src/tools/contextManagementTools';

const persistMock = () => (sessionSummaryPersist.persistGeneratedSessionSummary as jest.Mock);

interface WireOpts {
  tokenCount: number;
  maxTokens: number;
  /** Seed history length BEFORE the current user message is appended. Default 14 → 15 total > the gate's 10. */
  seedMessages?: number;
  /** Value served for 'contextGuardForceSummaryOnCompress' — undefined pins the strict `=== true` gate negative. */
  forceSummary?: boolean;
  /** When set, the guard stub carries generateSessionContinuity resolving to this summary (or null). */
  continuity?: SessionSummaryData | null;
}

const SAMPLE_SUMMARY: SessionSummaryData = {
  task_description: 'wiring test continuity',
  accomplishments: '- arc-c wiring verified',
  pending_tasks: '- docs + audit',
  decisions_made: 'non-fatal by design',
  context_for_next_session: 'pinned by tests/arcCCompressionWiring.test.ts',
};

function createHarness(opts: WireOpts) {
  const calls: string[] = [];
  const seedCount = opts.seedMessages ?? 14;

  // Mutable message list — pop()/append() keep getLength() honest through the compression rebuild loop.
  const liveMessages: unknown[] = Array.from({ length: seedCount }, (_, i) => ({ role: 'user', content: `seed-${i}` }))
    .map((m) => {
      const o = m as { role?: string; content?: unknown };
      return { ...o, getText: () => String(o.content ?? '') };
    });

  const history = {
    append: (m: unknown) => void liveMessages.push(m),
    pop: (): unknown => {
      calls.push('history.pop');
      return liveMessages.pop();
    },
    getLength: () => liveMessages.length,
    at: (i: number): unknown => liveMessages[i],
    // MANDATORY — preprocess() calls this right after append (see the pinned harness note).
    getMessagesArray: () => liveMessages as unknown[],
  };

  const compressHistory = jest.fn(async (_messages: unknown[]) => {
    calls.push('compressHistory');
    return [{ role: 'assistant', content: '[compressed]' }];
  });
  const resetTokenCache = jest.fn(() => void calls.push('resetTokenCache'));

  const guardStub: Record<string, unknown> = {
    countTokens: async (..._args: unknown[]) => {
      calls.push('countTokens');
      return opts.tokenCount;
    },
    getTokenLimit: () => opts.maxTokens,
    getThreshold: () => Math.floor(opts.maxTokens * 0.9),
    compressHistory,
    resetTokenCache,
  };
  if (opts.continuity !== undefined) {
    guardStub.generateSessionContinuity = jest.fn(async (msgs: unknown[]) => {
      calls.push(`generate:${Array.isArray(msgs) ? msgs.length : -1}`);
      return opts.continuity ?? null;
    });
  }

  const ctl = {
    pullHistory: async () => history,
    // Minimal plugin-config stub — documentRAG=false takes the fast return path after Step 0.6;
    // temporalAwareness=false keeps the returned prompt deterministic. The arc-C key is served from opts so
    // both the `=== true` positive and the `undefined`/`false` strict-gate negatives are exercisable.
    getPluginConfig: (_schematics: unknown) => ({
      get: (key: string): unknown => {
        switch (key) {
          case 'autoTrackingEnabled': return true;
          case 'documentRAG': return false;
          case 'temporalAwareness': return false;
          case 'contextGuardForceSummaryOnCompress': return opts.forceSummary;
          default: return undefined;
        }
      },
    }),
    client: {}, // no .llm → model auto-detection is skipped (matches production catch-path)
  };

  const userMessage = { getText: async () => 'hello there', getFiles: () => [] } as unknown as Parameters<typeof preprocess>[1];

  // liveMessages is exposed for slice-identity assertions (toEqual against a harness-owned snapshot — no clock or I/O involved).
  return { guard: guardStub, ctl, calls, compressHistory, resetTokenCache, userMessage, liveMessages };
}

/** Per-test hygiene (NOT in beforeEach/afterEach on purpose — see the pinned suite's rationale): the persist
 * spy is a module-level jest.fn(), so its call counts must be reset around every test body. */
async function arcCBody(body: () => void | Promise<void>): Promise<void> {
  persistMock().mockReset(); // fresh per test — call counts must not leak across tests
  await body();
}

describe('ARC C — forced structured session-memory save wiring (PART B)', () => {
  afterEach(() => {
    setContextGuard(null);
    persistMock().mockReset();
  });

  it('runs flush → generate(slice(0, len-10)) → persist BEFORE compressHistory when every gate is met', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000, forceSummary: true, continuity: SAMPLE_SUMMARY });

    setContextGuard(harness.guard as never);
    await arcCBody(async () => {
      expect.assertions(12); // 4 call-count + 4 ordering + 3 slice/keepLast + 1 persist payload — recount whenever this test gains/loses assertions
      // Single shared log channel: persist pushes itself so all four markers order in ONE array.
      persistMock().mockImplementation(async (_s: SessionSummaryData) => {
        harness.calls.push('persist');
        return { saved: true };
      });
      const flushSpy = jest.spyOn(autoTracker, 'flushActionsToMemory').mockImplementation(async () => {
        harness.calls.push('flush');
        return 0;
      });
      // Snapshot the first five seeds BEFORE preprocess(): after compressHistory() returns, preprocess() rebuilds
      // history IN-PLACE (pop-all → append of the compressed marker), so by assertion time liveMessages holds only
      // '[compressed]' — asserting against it would compare the pre-compression slice to post-compression state.
      const firstFivePreCompress = harness.liveMessages.slice(0, 5);
      try {
        await preprocess(harness.ctl as never, harness.userMessage);

        const generate = harness.guard.generateSessionContinuity as jest.Mock;
        // Gate met: every arc-C call fired exactly once…
        expect(flushSpy).toHaveBeenCalledTimes(1);
        expect(generate).toHaveBeenCalledTimes(1);
        expect(persistMock()).toHaveBeenCalledTimes(1);
        expect(harness.compressHistory).toHaveBeenCalledTimes(1);

        // …in the exact safe order, all BEFORE history destruction.
        const iFlush = harness.calls.indexOf('flush');
        const iGen = harness.calls.findIndex((c) => c.startsWith('generate:'));
        const iPersist = harness.calls.indexOf('persist');
        const iCompress = harness.calls.indexOf('compressHistory');
        expect(iFlush).toBeGreaterThanOrEqual(0); // buffered auto-tracked actions are durable before generation
        expect(iGen).toBeGreaterThan(iFlush);     // flush is awaited BEFORE generate
        expect(iPersist).toBeGreaterThan(iGen);   // persist only after a summary exists
        expect(iCompress).toBeGreaterThan(iPersist); // history destruction strictly last

        // keepLast=10 exclusion on the caller side: 15 total → exactly the FIRST 5 messages go to the model.
        const passed = generate.mock.calls[0][0] as unknown[];
        // Pin SLICE IDENTITY (pre-compression snapshot), not just length/edges — proves keepLast=10 excluded exactly
        // the LAST 10 of the 15. The snapshot is taken before preprocess() because compression rebuilds history in-place.
        expect(passed).toEqual(firstFivePreCompress);
        expect(passed).toHaveLength(5);
        expect((passed[4] as { content?: unknown }).content ?? null).toBe('seed-4'); // last element of slice(0,5)
        // persist received the generated summary verbatim.
        expect(persistMock().mock.calls[0][0]).toEqual(SAMPLE_SUMMARY);
      } finally {
        flushSpy.mockRestore();
      }
    });
  });

  it('skips arc-C entirely when the toggle is FALSE (legacy path byte-identical)', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000, forceSummary: false, continuity: SAMPLE_SUMMARY });

    setContextGuard(harness.guard as never);
    await arcCBody(async () => {
      expect.assertions(3);
      persistMock().mockResolvedValue({ saved: true });
      await preprocess(harness.ctl as never, harness.userMessage);

      expect(harness.guard.generateSessionContinuity as jest.Mock).not.toHaveBeenCalled();
      expect(persistMock()).not.toHaveBeenCalled();
      expect(harness.compressHistory).toHaveBeenCalledTimes(1); // compression still runs — legacy behavior intact
    });
  });

  it('skips arc-C when the toggle is UNDEFINED (strict === true gate)', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000 /* forceSummary omitted → undefined */ , continuity: SAMPLE_SUMMARY });

    setContextGuard(harness.guard as never);
    await arcCBody(async () => {
      expect.assertions(3);
      persistMock().mockResolvedValue({ saved: true });
      await preprocess(harness.ctl as never, harness.userMessage);

      expect(harness.guard.generateSessionContinuity as jest.Mock).not.toHaveBeenCalled();
      expect(persistMock()).not.toHaveBeenCalled();
      expect(harness.compressHistory).toHaveBeenCalledTimes(1);
    });
  });

  it('skips arc-C when the guard LACKS generateSessionContinuity (legacy/stub guards stay byte-identical)', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000 /* no continuity key */ , forceSummary: true });

    setContextGuard(harness.guard as never);
    await arcCBody(async () => {
      expect.assertions(2);
      persistMock().mockResolvedValue({ saved: true });
      await preprocess(harness.ctl as never, harness.userMessage);

      expect(persistMock()).not.toHaveBeenCalled();
      expect(harness.compressHistory).toHaveBeenCalledTimes(1); // compression unaffected by the missing method
    });
  });

  it('skips arc-C when history has ≤10 messages (non-empty summarizable span required)', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000, seedMessages: 9 /* +userMessage = 10 → NOT >10 */, forceSummary: true, continuity: SAMPLE_SUMMARY });

    setContextGuard(harness.guard as never);
    await arcCBody(async () => {
      expect.assertions(3);
      persistMock().mockResolvedValue({ saved: true });
      await preprocess(harness.ctl as never, harness.userMessage);

      expect(harness.guard.generateSessionContinuity as jest.Mock).not.toHaveBeenCalled();
      expect(persistMock()).not.toHaveBeenCalled();
      expect(harness.compressHistory).toHaveBeenCalledTimes(1);
    });
  });

  it('still compresses when generateSessionContinuity THROWS (non-fatal guarantee)', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000, forceSummary: true, continuity: SAMPLE_SUMMARY });
    setContextGuard(harness.guard as never);

    // Override the stub to reject — arc-C's catch must swallow it and let compression proceed.
    harness.guard.generateSessionContinuity = jest.fn(async () => {
      throw new Error('summary model unavailable');
    }) as never;

    await arcCBody(async () => {
      expect.assertions(3);
      persistMock().mockResolvedValue({ saved: true });
      await preprocess(harness.ctl as never, harness.userMessage);

      expect(persistMock()).not.toHaveBeenCalled(); // no summary was produced → nothing to persist
      expect(harness.compressHistory).toHaveBeenCalledTimes(1); // compression proceeded despite the throw
      expect(harness.resetTokenCache).toHaveBeenCalledTimes(1); // and its post-compression bookkeeping ran
    });
  });

  it('still compresses when persistence FAILS (telemetry fallback; summary was generated but not durable)', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000, forceSummary: true, continuity: SAMPLE_SUMMARY });

    setContextGuard(harness.guard as never);
    await arcCBody(async () => {
      expect.assertions(4);
      persistMock().mockResolvedValue({ saved: false, error: 'disk full' });
      await preprocess(harness.ctl as never, harness.userMessage);

      expect((harness.guard.generateSessionContinuity as jest.Mock)).toHaveBeenCalledTimes(1); // generation itself succeeded
      expect(persistMock()).toHaveBeenCalledTimes(1);
      expect(harness.compressHistory).toHaveBeenCalledTimes(1); // failure is non-fatal — compression runs
      expect(harness.resetTokenCache).toHaveBeenCalledTimes(1);
    });
  });

  it('still compresses when generate returns null (no parsable model output → deterministic fallback)', async () => {
    const harness = createHarness({ tokenCount: 31500, maxTokens: 30000, forceSummary: true, continuity: null });

    setContextGuard(harness.guard as never);
    await arcCBody(async () => {
      expect.assertions(3);
      persistMock().mockResolvedValue({ saved: true });
      await preprocess(harness.ctl as never, harness.userMessage);

      expect((harness.guard.generateSessionContinuity as jest.Mock)).toHaveBeenCalledTimes(1);
      expect(persistMock()).not.toHaveBeenCalled(); // null summary → persist must NOT be called with a hole
      expect(harness.compressHistory).toHaveBeenCalledTimes(1);
    });
  });
});
