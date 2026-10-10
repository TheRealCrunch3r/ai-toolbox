/**
 * FIX #3 (04.10, CTX-FOOTER arc part 3 — publish hardening) — regression suite for the turn-baseline
 * publish in promptPreprocessor.preprocess().
 *
 * Incident: 3.10 record ctx_1791025835710 — after auto-compression, `ctx_footer` was absent on EVERY
 * tool result of that turn (~93–95% real usage) while `executedTool` stayed present, with zero
 * [CTX-FOOTER] log lines. Static root cause: `TokenStatsManager.setTurnEvaluation()` had EXACTLY ONE
 * publish site inside the big Step 0.5 try; any throw between resetMidLoopDelta() and that line (STEP 6
 * countTokens re-throw, STEP 9 auto-tracker re-throw, prune/checkpoint/compress/recount failures, or an
 * early return) skipped it, leaving turnBaselineTokens === 0 for the whole tool loop → mid-loop guard +
 * footer silently no-op. Fix: publish moved into a FINALLY on that try (promptPreprocessor.ts).
 *
 * This suite drives the REAL preprocess() end-to-end with fake controllers/guards — the throw sites live
 * in promptPreprocessor's own control flow, which is exactly what module-level unit gates (that pin
 * TokenStatsManager directly) cannot observe. Per case: reset→(synthetic failure)→publish must still run;
 * assertions read ground truth via getTurnBaseline()/getMaxContextTokens(). Zero fs/network side effects:
 * documentRAG disabled, no attachments, empty history, autoTracker seams spied (real singleton state is
 * never allowed to mutate across cases).
 */
import { preprocess, setContextGuard } from '../src/promptPreprocessor.js';
import { TokenStatsManager } from '../src/tokenStatsManager.js';
import { autoTracker } from '../src/autoTracker.js';
// Type-only import (erased at transform time — no runtime require): the fake guard is cast to this type
// so setContextGuard() accepts it; the object itself only implements the surface preprocess() touches.
import { type ContextGuard } from '../src/contextGuard.js';

// SDK types are needed for the fake cast ONLY — type-only imports, erased at transform time (no runtime
// require of @lmstudio/sdk under jest).
type PreprocessCtl = Parameters<typeof preprocess>[0];
type ChatMessageLike = Parameters<typeof preprocess>[1];

const MAX_TOKENS = 30_000; // fake model window for every case — one known constant, easy math

interface GuardOpts {
  /** STEP 6 behavior: resolve a count (default) or reject with the given Error. */
  countResult?: number;
  countThrows?: Error;
  /** Compression path only: reject compressHistory instead of resolving compressed messages. */
  compressThrows?: Error;
}

/** Minimal ContextGuard surface — exactly what preprocess() touches in this test's code paths. */
function makeGuard(opts: GuardOpts = {}): unknown {
  const countTokens = async (..._args: unknown[]): Promise<number> => {
    if (opts.countThrows) throw opts.countThrows;
    return opts.countResult ?? 10_000;
  };
  let compressHistory: ((..._a: unknown[]) => Promise<unknown>) | undefined;
  if (opts.compressThrows) {
    compressHistory = async (..._a: unknown[]): Promise<unknown> => {
      throw opts.compressThrows!;
    };
  } else {
    compressHistory = async (): Promise<unknown[]> => []; // resolves — pop/append then no-op on empty history
  }
  return {
    updateConfig: (_c: Record<string, unknown>): void => {}, // menu compression-percentage re-seed (07.10; was absolute tokenLimit) — swallow
    countTokens,
    getTokenLimit: (): number => MAX_TOKENS,
    getThreshold: (): number => 25_000, // 28k test counts exceed it → compression branch; 10k stays below
    compressHistory,
    resetTokenCache: (): void => {},
  } as unknown as ContextGuard;
}

/** Empty-history fake — append/pop no-ops; getMessagesArray() [] so the counting block runs hermetically. */
function makeEmptyHistory(): Record<string, unknown> {
  return {
    append: (..._a: unknown[]): void => {},
    pop: (): void => {},
    getLength: (): number => 0,
    at: (_i?: number): null => null,
    getMessagesArray: (): unknown[] => [],
  };
}

/** Fake PromptPreprocessorController: no client (skips setLMClient + model autodetection), RAG off. */
function makeCtl(history: Record<string, unknown>): PreprocessCtl {
  const values: Record<string, unknown> = { contextGuardCompressionPercent: 90, documentRAG: false }; // 07.10: was contextGuardTokenLimit (absolute tokens)
  return {
    client: undefined,
    abortSignal: new AbortController().signal,
    pullHistory: async (): Promise<Record<string, unknown>> => history,
    getPluginConfig: (_schematics: unknown) => ({ get: (k: string): unknown => values[k] }),
  } as unknown as PreprocessCtl;
}

function makeUserMessage(text = 'Please continue with the token analysis.'): ChatMessageLike {
  return { getText: async (): Promise<string> => text } as unknown as ChatMessageLike;
}

describe('FIX #3 publish hardening — setTurnEvaluation survives preprocess() failures (04.10)', () => {
  let checkPromptSpy: jest.SpyInstance;
  let saveSessionSpy: jest.SpyInstance;

  beforeEach(() => {
    // Deterministic autoTracker seams across all cases: the real singleton must neither warn-prompt,
    // mutate FSM state, nor touch any storage during these runs. Restored in afterEach.
    checkPromptSpy = jest.spyOn(autoTracker, 'checkAndGeneratePrompt').mockReturnValue({ triggered: false });
    saveSessionSpy = jest.spyOn(autoTracker, 'autoSaveSessionMemory').mockResolvedValue({ saved: false });
  });

  afterEach(() => {
    checkPromptSpy.mockRestore();
    saveSessionSpy.mockRestore();
    setContextGuard(null); // never leak a fake guard into another suite's module state
    TokenStatsManager.resetMidLoopDelta();
  });

  it('healthy turn: publishes the counted baseline + limit (pre-existing contract, unchanged by FIX #3)', async () => {
    setContextGuard(makeGuard({ countResult: 42_000 }));
    const result = await preprocess(makeCtl(makeEmptyHistory()), makeUserMessage());
    expect(typeof result).toBe('string'); // full flow returned a prompt (RAG off → base + temporal suffix)
    expect(TokenStatsManager.getTurnBaseline()).toBe(42_000);
    expect(TokenStatsManager.getMaxContextTokens()).toBe(MAX_TOKENS);
  });

  it('STEP 6 re-throw (countTokens failure): publish STILL runs — with the safe 0/0 no-op state', async () => {
    setContextGuard(makeGuard({ countThrows: new Error('synthetic STEP 6 countTokens failure') }));
    const result = await preprocess(makeCtl(makeEmptyHistory()), makeUserMessage());
    expect(typeof result).toBe('string'); // the outer catch swallowed it (existing non-fatal behavior) — turn proceeds
    // tokenCount never assigned + maxTokens assignment happens AFTER the count → both stay 0: byte-equivalent
    // state to the pre-FIX skip, i.e. safe no-op guard, NOT a stale previous-turn baseline.
    expect(TokenStatsManager.getTurnBaseline()).toBe(0);
    expect(TokenStatsManager.getMaxContextTokens()).toBe(0);
    expect(checkPromptSpy).not.toHaveBeenCalled(); // STEP 9 unreachable — confirms the throw site
  });

  it('STEP 9 re-throw (auto-tracker failure after a successful count): publishes the ALREADY-COUNTED baseline', async () => {
    setContextGuard(makeGuard({ countResult: 31_500 }));
    checkPromptSpy.mockImplementation(() => {
      throw new Error('synthetic STEP 9 auto-tracker failure');
    });
    const result = await preprocess(makeCtl(makeEmptyHistory()), makeUserMessage());
    expect(typeof result).toBe('string'); // outer catch swallowed it — turn proceeds (existing behavior)
    // FIX #3 regression: pre-fix this throw skipped the publish entirely → baseline 0 for the whole loop.
    expect(TokenStatsManager.getTurnBaseline()).toBe(31_500);
    expect(TokenStatsManager.getMaxContextTokens()).toBe(MAX_TOKENS);
  });

  it('compression-path throw (compressHistory failure after count + limit known): still publishes; no stale-high baseline', async () => {
    // 28k > threshold 25k → compression branch runs: prune pass is hermetic (empty messages), PART B
    // checkpoint returns saved:false via the spy, then compressHistory throws BEFORE any history mutation.
    setContextGuard(makeGuard({ countResult: 28_000, compressThrows: new Error('synthetic compression failure') }));
    const result = await preprocess(makeCtl(makeEmptyHistory()), makeUserMessage());
    expect(typeof result).toBe('string'); // outer catch swallowed it — turn proceeds (existing behavior)
    // History was NOT replaced (throw before pop/append), so the PRE-compression count is exactly right.
    expect(TokenStatsManager.getTurnBaseline()).toBe(28_000);
    expect(TokenStatsManager.getMaxContextTokens()).toBe(MAX_TOKENS);
  });

  it('early return path (pullHistory() undefined): finally-publish still runs with 0/0 — no baseline leak', async () => {
    const badCtl = makeCtl(makeEmptyHistory());
    (badCtl as unknown as { pullHistory: () => Promise<null> }).pullHistory = async (): Promise<null> => null;
    setContextGuard(makeGuard({ countResult: 99_000 })); // would publish a huge baseline if the early return bypassed finally semantics wrongly
    const result = await preprocess(badCtl, makeUserMessage());
    expect(typeof result).toBe('string'); // early return hands back the raw user prompt
    expect(TokenStatsManager.getTurnBaseline()).toBe(0);
    expect(TokenStatsManager.getMaxContextTokens()).toBe(0);
  });
});
