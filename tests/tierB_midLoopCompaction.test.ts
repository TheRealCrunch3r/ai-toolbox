/**
 * FIX B (09.10, owner GO) — TIER B: pre-emptive mid-loop COMPRESSION at PREEMPTIVE_COMPRESSION_PERCENT = 95% of the
 * model window. Pins the toolsProvider wrapper behavior that fills the rung MISSING between tier-2's ~90% forced SAVE
 * (memory only, never shrinks context) and the model's 100% hard stop — before this a run-away turn crossing 90% mid-loop
 * accumulated straight to the wall (happened twice on 09.10 until the owner enlarged the context window):
 *   - trigger ON/OFF incl. strict `contextGuardEnabled === true` gate + exact 95% boundary (>= inclusive; one token below silent)
 *   - full success path: compressMidLoop() called with PART-parity opts, host history pop/append SWAP via the duck-typed
 *     ctx.client.llm.history() handle, post-compression setTurnMessages republish + recount-based baseline re-publish
 *   - once-per-turn idempotency across many tool results ("two [TIER-2-COMPACT] fires in one turn = defect")
 *   - INDEPENDENCE from tier-2's forced-save latch: at >=95% BOTH tier-2 save and B compaction fire in the SAME turn
 *   - ≤10 published messages → deterministic skip, latch holds even if the list grows same-turn
 *   - stub guard WITHOUT compressMidLoop → silent deterministic skip (tier-2 on the SAME fake still works)
 *   - failure non-fatal: rejecting compressMidLoop never breaks or delays a successful tool call; result + executedTool intact
 *   - outcome.compressed=false (internal recount below trigger) → no swap attempted, deterministic log
 *
 * Harness: same wrapper-integration pattern as tests/tier2MidLoopSave.test.ts — ONE registration module (textProcessingTools)
 * replaced with a probe tool so no real implementation runs; the guard instance swapped via setContextGuard(). Projection math:
 * the wrapper computes projected BEFORE recordToolResult for this pass (first pass delta ≈ 0):
 *   projected = baseline + getMidLoopDeltaTokens() + estimateTokensFromChars(payloadChars) + FOOTER_TOKEN_ESTIMATE(=25).
 */
import { toolsProvider, resetForcedSaveFlagForTests, resetMidLoopCompactionFlagForTests } from '../src/toolsProvider.js';
import { setContextGuard } from '../src/promptPreprocessor.js';
import { TokenStatsManager, estimateTokensFromChars } from '../src/tokenStatsManager.js';
import { FOOTER_TOKEN_ESTIMATE } from '../src/utils/contextUsageFooter.js';
import { DEFAULT_CONFIG } from '../src/config.js';

// Probe registration — registry-ID identity per house rule (same as tier2MidLoopSave / contextUsageFooter suites).
const DEFAULT_PROBE_TOOL = {
  name: 'tierb_probe_tool',
  description: 'Test-only probe for FIX B wrapper integration (fake, no side effects).',
  parameters: { type: 'object', properties: {} },
} as const;

jest.mock('./__mocks__/textProcessingTools.js', () => ({
  registerTextProcessingTools: jest.fn((): Array<Record<string, unknown>> => [
    { ...DEFAULT_PROBE_TOOL, implementation: async (): Promise<Record<string, unknown>> => ({ success: true }) },
  ]),
}));

// Canonical persist path — tier-2 can fire in this suite (the independence test WANTS it to); mock keeps writes hermetic.
jest.mock('../src/sessionSummaryPersist.js', () => ({
  persistGeneratedSessionSummary: jest.fn(),
}));

const mockTextProcessingTools = require('./__mocks__/textProcessingTools.js') as {
  registerTextProcessingTools: jest.Mock;
};
const mockPersistModule = require('../src/sessionSummaryPersist.js') as {
  persistGeneratedSessionSummary: jest.Mock;
};
const mockPersist = mockPersistModule.persistGeneratedSessionSummary;

/** One-shot swap of what the probe tool returns, consumed by the NEXT provider run in this test. */
function stubProbeImplementation(implementation: (...args: unknown[]) => Promise<unknown>): void {
  mockTextProcessingTools.registerTextProcessingTools.mockImplementationOnce(() => [
    { ...DEFAULT_PROBE_TOOL, implementation },
  ]);
}

/** Fake ContextGuard exposing the FIX B surface (compressMidLoop + countTokens for the wrapper's recount). */
function makeCompactGuard(impl: (...args: unknown[]) => Promise<unknown> | unknown, countResult = 20_000): {
  guard: Record<string, unknown>;
  compact: jest.Mock;
  count: jest.Mock;
} {
  const compact = jest.fn(impl);
  const count = jest.fn(async () => countResult);
  return { guard: { compressMidLoop: compact, countTokens: count } as unknown as Record<string, unknown>, compact, count };
}

/** Fake ContextGuard exposing BOTH tier-2 and FIX B surfaces — the independence test needs both on one instance. */
function makeBothGuard(impl: (...args: unknown[]) => Promise<unknown> | unknown): {
  guard: Record<string, unknown>;
  generate: jest.Mock;
  compact: jest.Mock;
} {
  const generate = jest.fn(async () => ({ task_description: 't' }) as never);
  const count = jest.fn(async () => 20_000);
  const compact = jest.fn(impl);
  return { guard: { generateSessionContinuity: generate, compressMidLoop: compact, countTokens: count } as unknown as Record<string, unknown>, generate, compact };
}

/** Duck-typed host history (the shape the wrapper's PluginContextLike hop reaches): mutable length + append log. */
function makeHostHistory(initialLength: number): { obj: object; appended: unknown[]; state: { len: number } } {
  const state = { len: initialLength };
  const appended: unknown[] = [];
  return {
    state,
    appended,
    obj: {
      getLength: () => state.len,
      pop: (): void => {
        state.len -= 1;
      },
      append: (m: unknown): void => {
        state.len += 1;
        appended.push(m);
      },
    },
  };
}

/** Build a fake turn list of role/content pairs — the wrapper only reads length + passes it through. */
function makeTurnMessages(count: number): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, i) => ({ role: 'user', content: `m${i}` }));
}

describe('FIX B (09.10) — pre-emptive mid-loop compression @95% — wrapper integration', () => {
  const LIMIT = 64_000; // tokens — mirrors the 64k window used across tier-2/footer suites
  const PERCENT = 90; // tier-2's default contextGuardCompressionPercent (present so BOTH tiers can fire where intended)
  const B_LINE = (LIMIT * 95) / 100; // 60_800 — PREEMPTIVE_COMPRESSION_PERCENT is a fixed module constant in toolsProvider

  function createHermeticController(opts: {
    guardEnabled?: boolean | undefined;
    percent?: number | string | undefined;
    footer?: boolean;
    compaction?: boolean;
    forceSummary?: boolean | undefined;
  } = {}): unknown {
    const base: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      base[key] = false; // everything OFF except textProcessing + the toggles under test — hermetic registration
    }
    base.textProcessing = true;
    base.contextGuardEnabled = opts.guardEnabled; // default undefined → strict `=== true` gate must SKIP (pinned below)
    if (opts.percent !== undefined) base.contextGuardCompressionPercent = opts.percent;
    if (opts.compaction !== undefined) base.compactionEnabled = opts.compaction;
    if (opts.forceSummary !== undefined) base.contextGuardForceSummaryOnCompress = opts.forceSummary; // STRICT ===true gate under test
    base.contextUsageFooter = opts.footer ?? false; // OFF by default — B independence from the footer gate is structural
    return {
      getPluginConfig: jest.fn().mockReturnValue({
        get: (key: string) => base[key],
        set: jest.fn(),
        subscribe: jest.fn(),
        getAll: () => ({ ...base }),
      }),
      stateManager: { getState: jest.fn().mockReturnValue({}), setState: jest.fn() },
      logger: { info: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn() },
      context: {},
    } as unknown;
  }

  async function getProbeImplementation(controllerOpts?: Parameters<typeof createHermeticController>[0]): Promise<(...args: unknown[]) => Promise<unknown>> {
    const tools = (await toolsProvider(createHermeticController(controllerOpts) as never)) as Array<{ name?: string; implementation?: (...a: unknown[]) => Promise<unknown> }>;
    const probe = tools.find((t) => t.name === 'tierb_probe_tool');
    expect(probe).toBeDefined(); // loud failure if the mock registry ID ever diverges from toolsProvider's import
    return (probe as { implementation: (...args: unknown[]) => Promise<unknown> }).implementation!;
  }

  beforeEach(() => {
    TokenStatsManager.resetMidLoopDelta(); // fresh turn state — no baseline/limit/delta/message-list leaks between cases
    resetForcedSaveFlagForTests(); // re-arm tier-2's independent latch (module state in toolsProvider.ts)
    resetMidLoopCompactionFlagForTests(); // re-arm FIX B's independent latch
    setContextGuard(null); // no guard installed unless a test installs its fake explicitly
    mockPersist.mockReset();
    mockTextProcessingTools.registerTextProcessingTools.mockClear();
  });

  afterEach(() => {
    TokenStatsManager.clearActiveToolCallsForTests();
    setContextGuard(null);
    jest.restoreAllMocks(); // release any console spies (probe/factory jest.fn() state is per-test by design)
  });

  it('fires ONCE at projected >= 95%: compressMidLoop with PART-parity opts, host-history swap, republish + recount', async () => {
    const replacement = makeTurnMessages(14); // post-compression array the fake produces (summary msg + keepLast-style tail)
    const { guard, compact, count } = makeCompactGuard(async () => ({ compressed: true, messages: replacement }), 20_000);
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(61_500, LIMIT); // +payload est(16 chars)=5 + footer 25 → projected 61_530 ≥ 60_800
    const published = makeTurnMessages(24);
    TokenStatsManager.setTurnMessages(published);

    const host = makeHostHistory(24); // pre-compression host history length (the wrapper pops it to zero first)
    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT, compaction: true });
    const result = (await call({}, { client: { llm: { history: async () => host.obj } } })) as Record<string, unknown>;

    expect(result.executedTool).toBe('tierb_probe_tool'); // tool outcome flows through normally
    expect(compact).toHaveBeenCalledTimes(1);
    const [passedMessages, passedOpts] = compact.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(passedMessages).toEqual(published); // the published live list is what gets summarized…
    expect(passedOpts.compactionEnabled).toBe(true); // …pruning ON per controller (forwarding fidelity)
    expect(passedOpts.forceSummaryOnCompress).toBe(false); // strict gate: false base → false forwarded (not truthy-coerced)
    expect(passedOpts.maxTokens).toBe(LIMIT);
    expect(typeof passedOpts.currentTokens).toBe('number');
    expect((passedOpts.currentTokens as number)).toBeGreaterThanOrEqual(B_LINE);

    // Host history swap — EXACTLY PART B's pop-to-zero/append pattern: old 24 gone, the replacement array in.
    expect(host.state.len).toBe(replacement.length);
    expect(host.appended).toEqual(replacement);
    // Republish + recount re-publish: guard state now reflects POST-compression reality (conservative-direction input).
    expect(TokenStatsManager.getTurnMessages()).toEqual(replacement);
    expect(count).toHaveBeenCalledTimes(1);
    const [countArg] = count.mock.calls[0] as [unknown];
    expect(countArg).toEqual(replacement); // recount ran over the NEW array, not the destroyed one
    expect(TokenStatsManager.getTurnBaseline()).toBe(20_000);
    expect(TokenStatsManager.getMaxContextTokens()).toBe(LIMIT);
  });

  it('fires INCLUSIVELY at exactly projected === limit*95/100 and stays silent one token below', async () => {
    // Exact-threshold construction (tier-2 boundary pattern): probe returns a 100-char STRING, so on the first pass
    // projected = baseline + est(100) + FOOTER_TOKEN_ESTIMATE — exactly the wrapper's math with delta ≈ 0.
    const exactBaseline = B_LINE - (estimateTokensFromChars(100) + FOOTER_TOKEN_ESTIMATE);

    stubProbeImplementation(async () => 'x'.repeat(100));
    const { guard: g1, compact: c1 } = makeCompactGuard(async () => ({ compressed: true, messages: makeTurnMessages(4) }));
    setContextGuard(g1);
    TokenStatsManager.setTurnEvaluation(exactBaseline, LIMIT); // → projected exactly 60_800
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    const call1 = await getProbeImplementation({ guardEnabled: true });
    await call1({}, undefined); // no ctx client — the no-swap fallback path (still a valid success outcome)
    expect(c1).toHaveBeenCalledTimes(1); // >= is inclusive at the exact line

    TokenStatsManager.resetMidLoopDelta(); // fresh turn window…
    resetMidLoopCompactionFlagForTests(); // …and re-arm (mirrors the provider-entry convention the new run performs)
    const { guard: g2, compact: c2 } = makeCompactGuard(async () => ({ compressed: true, messages: makeTurnMessages(4) }));
    setContextGuard(g2);
    TokenStatsManager.setTurnEvaluation(exactBaseline - 1, LIMIT); // → projected one token below the line
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    const call2 = await getProbeImplementation({ guardEnabled: true });
    await call2({}, undefined);
    expect(c2).not.toHaveBeenCalled(); // strictly below → silent; PART B at the next user message still covers it
  });

  it('stays SILENT in the 90–95% band — tier-2 territory, not B\'s (compaction stays at the boundary or >=95%)', async () => {
    const { guard, compact } = makeCompactGuard(async () => ({ compressed: true, messages: makeTurnMessages(10) }));
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(57_600, LIMIT); // exactly tier-2's default 90% line + payload est+footer ≈ 90.1% < 95%

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call({}, undefined);
    expect(compact).not.toHaveBeenCalled(); // B must NOT preempt below its fixed 95 line — that would fight tier-2's design split
  });

  it('is idempotent once per turn across many tool results (two [TIER-2-COMPACT] fires in one turn = defect)', async () => {
    const replacement = makeTurnMessages(10);
    let calls = 0;
    const { guard, compact } = makeCompactGuard(async () => {
      calls += 1;
      return { compressed: true, messages: replacement };
    }, 20_000);
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(61_500, LIMIT); // above the B line before the first result…
    TokenStatsManager.setTurnMessages(makeTurnMessages(30)); // …and stays above it on every later pass (fresh payload each time)

    const call = await getProbeImplementation({ guardEnabled: true });
    for (let i = 0; i < 3; i += 1) {
      await call({}, undefined);
    }
    expect(compact).toHaveBeenCalledTimes(1); // latch: exactly one pre-emptive compression per turn, no matter how many results
    expect(calls).toBe(1);
  });

  it('fires INDEPENDENTLY of the tier-2 forced save — at >=95% BOTH run in the SAME turn (two latches, two facts)', async () => {
    mockPersist.mockResolvedValue({ saved: true });
    const replacement = makeTurnMessages(10);
    const { guard, generate, compact } = makeBothGuard(async () => ({ compressed: true, messages: replacement }));
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(61_500, LIMIT); // crosses BOTH the 90% tier-2 line AND the fixed 95% B line
    TokenStatsManager.setTurnMessages(makeTurnMessages(24)); // >10 → both consumers have something to work on

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call({}, undefined);

    expect(generate).toHaveBeenCalledTimes(1); // tier-2 forced save fired…
    expect(compact).toHaveBeenCalledTimes(1); // …AND the pre-emptive compaction fired — INDEPENDENT latches by design. A save at ~90%
    // must not suppress compression at ~95%, and vice versa; the republished post-compression baseline drops later
    // projections under both gates for this turn anyway.
  });

  it('skips deterministically when ≤10 messages are published — latch holds even if the list grows same-turn', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const { guard, compact } = makeCompactGuard(async () => ({ compressed: true, messages: [] }));
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(61_500, LIMIT); // B line crossed…
    TokenStatsManager.setTurnMessages(makeTurnMessages(8)); // …but nothing summarizable past keepLast(10) yet

    const call = await getProbeImplementation({ guardEnabled: true });
    await call({}, undefined);
    expect(compact).not.toHaveBeenCalled();
    const skips = [...logSpy.mock.calls].map((c) => String(c[0])).filter((l) => l.includes('[TIER-2-COMPACT]'));
    expect(skips.some((l) => l.includes('compression skipped this pass'))).toBe(true);

    TokenStatsManager.setTurnMessages(makeTurnMessages(40)); // a later result SAME turn publishes enough…
    await call({}, undefined);
    expect(compact).not.toHaveBeenCalled(); // …the latch still holds — no late fire (same one-shot semantics as tier-2's gate-5)
  });

  it('skips silently on a stub guard WITHOUT compressMidLoop while tier-2 on the SAME fake still fires', async () => {
    mockPersist.mockResolvedValue({ saved: true });
    const generate = jest.fn(async () => ({ task_description: 't' }) as never); // NO compressMidLoop key → typeof gate skips B
    setContextGuard({ generateSessionContinuity: generate } as unknown as Record<string, unknown>);

    TokenStatsManager.setTurnEvaluation(61_500, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(24));

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    const result = (await call({}, undefined)) as Record<string, unknown>;
    expect(result.executedTool).toBe('tierb_probe_tool'); // no throw on the unimplemented-method path…
    expect(generate).toHaveBeenCalledTimes(1); // …and tier-2 is unaffected — stub-safe by construction for tests + legacy builds
  });

  it('treats a compressMidLoop rejection as non-fatal: warn, result intact with executedTool stamp', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const boom = new Error('synthetic compression failure');
    const { guard, compact } = makeCompactGuard(async () => {
      throw boom;
    });
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(61_500, LIMIT); // B line crossed…
    TokenStatsManager.setTurnMessages(makeTurnMessages(24)); // …rejection must not reach the tool caller

    const call = await getProbeImplementation({ guardEnabled: true });
    const result = (await call({}, undefined)) as Record<string, unknown>; // direct await is the no-throw pin (jest 30 lesson)
    expect(result).toMatchObject({ success: true, executedTool: 'tierb_probe_tool' }); // tool outcome fully intact

    const telemetry = [...warnSpy.mock.calls, ...logSpy.mock.calls].map((c) => String(c[0])).filter((l) => l.includes('[TIER-2-COMPACT]'));
    expect(telemetry.some((l) => l.includes('Mid-loop compression failed (non-fatal)'))).toBe(true); // failure names itself in the log
  });

  it('when compressMidLoop reports compressed=false — NO swap, no recount, deterministic "no compression ran" log', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    // compressMidLoop's internal authoritative recount came in below its own trigger — nothing ran (safe direction).
    const { guard } = makeCompactGuard(async () => ({ compressed: false, messages: [] }));
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(61_500, LIMIT);
    const published = makeTurnMessages(24);
    TokenStatsManager.setTurnMessages(published);

    const host = makeHostHistory(24);
    const call = await getProbeImplementation({ guardEnabled: true });
    await call({}, { client: { llm: { history: async () => host.obj } } });

    expect(host.appended).toHaveLength(0); // NO swap attempted — the untouched original history stays authoritative…
    expect(host.state.len).toBe(24); // …and the published list is unchanged (no republish of a no-op)…
    expect(TokenStatsManager.getTurnMessages()).toEqual(published); // …with no recount-driven baseline rewrite.
    const logs = [...logSpy.mock.calls, ...warnSpy.mock.calls].map((c) => String(c[0])).filter((l) => l.includes('[TIER-2-COMPACT]'));
    expect(logs.some((l) => l.includes('no compression ran this pass'))).toBe(true); // wrapper-side deterministic line
  });

  it('skips when contextGuardEnabled is NOT strictly true (undefined/false — even with the B line crossed)', async () => {
    for (const value of [false, undefined]) {
      const { guard, compact } = makeCompactGuard(async () => ({ compressed: true, messages: [] }));
      setContextGuard(guard);

      TokenStatsManager.setTurnEvaluation(61_500, LIMIT); // B line crossed — gate must still refuse
      TokenStatsManager.setTurnMessages(makeTurnMessages(24));
      const call = await getProbeImplementation({ guardEnabled: value as boolean });
      await call({}, undefined);
      expect(compact).not.toHaveBeenCalled(); // strict `=== true` mirrors tier-2/PART B — harness stubs return undefined for unknown keys

      TokenStatsManager.resetMidLoopDelta(); // fresh window per sub-case (module-state hygiene)
    }
  });

  it('forwards the STRICT Arc-C flag: contextGuardForceSummaryOnCompress === true reaches compressMidLoop opts', async () => {
    const replacement = makeTurnMessages(10);
    const { guard, compact } = makeCompactGuard(async () => ({ compressed: true, messages: replacement }), 20_000);
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(61_500, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(24));

    const call = await getProbeImplementation({ guardEnabled: true, forceSummary: true });
    await call({}, undefined);

    expect(compact).toHaveBeenCalledTimes(1);
    const [, passedOpts] = compact.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(passedOpts.forceSummaryOnCompress).toBe(true); // strict ===true read forwarded verbatim — Arc C gate parity with PART B
  });
});
