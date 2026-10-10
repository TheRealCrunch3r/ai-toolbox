/**
 * FIX #21 (09.10, two-tier spec) — TIER 2: the mid-loop FORCED session-memory save at
 * contextGuardCompressionPercent of the window (default 90%). Pins the toolsProvider wrapper behavior
 * that shipped live on 09.10 ~17:2x ahead of its close-out:
 *   - publish-hook stale/absent handling (≤10 messages / null list → nothing summarizable, latch holds)
 *   - trigger ON/OFF incl. strict `=== true` gate and LIVE percent read from pluginConfig
 *   - exact-threshold boundary (>= fires at exactly limit*percent/100; below stays silent)
 *   - once-per-turn idempotency across many tool results ("two [TIER-2] lines in one turn = defect")
 *   - save-failure non-fatal (persist {saved:false} → telemetry-only log, result intact) + keepLast=10 slice
 *   - footer-OFF independence (tier 2 fires with contextUsageFooter=false — structurally a sibling block)
 *   - suppression-warn gate regression pin (baseline === 0, warn once, re-arm on live baseline)
 *
 * Harness: same wrapper-integration pattern as tests/contextUsageFooter.test.ts — ONE registration module
 * (textProcessingTools) is replaced with a probe tool so no real implementation runs. The guard instance is
 * swapped via the one-way setContextGuard() hook (test-harness contract documented at promptPreprocessor L97);
 * persistGeneratedSessionSummary is mocked on the SAME registry ID toolsProvider's own './sessionSummaryPersist.js'
 * import resolves to under jest.config.cjs (first-match-wins; both specifiers map into <rootDir>/src/sessionSummaryPersist).
 */
import { toolsProvider, resetForcedSaveFlagForTests } from '../src/toolsProvider.js';
import { setContextGuard } from '../src/promptPreprocessor.js';
import { TokenStatsManager, estimateTokensFromChars } from '../src/tokenStatsManager.js';
import { FOOTER_TOKEN_ESTIMATE } from '../src/utils/contextUsageFooter.js';
import { DEFAULT_CONFIG } from '../src/config.js';

// Probe registration — registry-ID identity per house rule (see contextUsageFooter.test.ts header): the request string
// below MUST map to tests/__mocks__/textProcessingTools.ts, the SAME module ID toolsProvider's static import of
// './tools/textProcessingTools.js' resolves to, or the factory lands on a different ID and nothing registers.
const DEFAULT_PROBE_TOOL = {
  name: 'tier2_probe_tool',
  description: 'Test-only probe for FIX #21 tier-2 wrapper integration (fake, no side effects).',
  parameters: { type: 'object', properties: {} },
} as const;

jest.mock('./__mocks__/textProcessingTools.js', () => ({
  registerTextProcessingTools: jest.fn((): Array<Record<string, unknown>> => [
    { ...DEFAULT_PROBE_TOOL, implementation: async (): Promise<Record<string, unknown>> => ({ success: true }) },
  ]),
}));

// Canonical persist path — mocked on the same registry ID toolsProvider's './sessionSummaryPersist.js' import
// resolves to (jest.config.cjs single-dot entry → <rootDir>/src/sessionSummaryPersist.ts). Deterministic {saved}
// control per test; a wrong module ID would surface loudly as mock.calls === [] in the first-firing test.
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

/** Fake ContextGuard — only the method surface the wrapper consumes (typeof-gated in production). */
function makeGuard(impl: (...args: unknown[]) => Promise<unknown> | unknown): {
  guard: Record<string, unknown>;
  generate: jest.Mock;
} {
  const generate = jest.fn(impl);
  return { guard: { generateSessionContinuity: generate } as unknown as Record<string, unknown>, generate };
}

/** Build a 20-message fake turn list (role/content pairs — the wrapper only reads length + slice). */
function makeTurnMessages(count: number): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, i) => ({ role: 'user', content: `m${i}` }));
}

describe('FIX #21 tier-2 mid-loop forced session-memory save — wrapper integration', () => {
  const LIMIT = 64000; // tokens — mirrors the 64k window used across the footer suite's projection math
  const PERCENT = 90; // default contextGuardCompressionPercent (zod min 50 / max 100)

  function createHermeticController(opts: {
    guardEnabled?: boolean | undefined;
    percent?: number | string | undefined;
    footer?: boolean;
  } = {}): unknown {
    // Everything OFF except textProcessing (the mocked family) + the toggles under test — hermetic registration.
    const base: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      base[key] = false;
    }
    base.textProcessing = true;
    base.contextGuardEnabled = opts.guardEnabled; // default undefined → strict `=== true` gate must SKIP (pinned below)
    if (opts.percent !== undefined) base.contextGuardCompressionPercent = opts.percent; // LIVE read path under test
    base.contextUsageFooter = opts.footer ?? false; // OFF by default — tier-2 independence is the point of this suite
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
    const probe = tools.find((t) => t.name === 'tier2_probe_tool');
    expect(probe).toBeDefined(); // loud failure if the mock registry ID ever diverges from toolsProvider's import
    return (probe as { implementation: (...args: unknown[]) => Promise<unknown> }).implementation!;
  }

  beforeEach(() => {
    TokenStatsManager.resetMidLoopDelta(); // fresh turn state — no baseline/limit/delta/message-list leaks between cases
    resetForcedSaveFlagForTests(); // re-arm the one-shot latch (module state in toolsProvider.ts)
    setContextGuard(null); // no guard installed unless a test installs its fake explicitly
    mockPersist.mockReset();
    mockTextProcessingTools.registerTextProcessingTools.mockClear();
  });

  afterEach(() => {
    TokenStatsManager.clearActiveToolCallsForTests();
    setContextGuard(null);
    jest.restoreAllMocks(); // release any console spies (probe/factory jest.fn() state is per-test by design)
  });

  it('fires ONCE when projected usage crosses the compression threshold mid-loop and persists the keepLast=10 slice', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    // Baseline 57600 = exactly the 90% line of LIMIT; a positive payload delta guarantees projected >= threshold.
    TokenStatsManager.setTurnEvaluation(57600, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    mockTextProcessingTools.registerTextProcessingTools.mockClear(); // provider-run calls are not the assertion target
    const result = (await call({}, undefined)) as Record<string, unknown>;
    expect(result.executedTool).toBe('tier2_probe_tool'); // tool result flows through normally

    expect(generate).toHaveBeenCalledTimes(1);
    expect(mockPersist).toHaveBeenCalledTimes(1);
    expect(mockPersist.mock.calls[0][0]).toEqual({ task_description: 't' });
  });

  it('applies the caller-side keepLast=10 exclusion to the published list (slice contract with PART B)', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    TokenStatsManager.setTurnEvaluation(57600, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(25)); // 15 summarizable + 10 kept live

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call({}, undefined);

    expect(generate).toHaveBeenCalledTimes(1);
    const passed = generate.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(passed).toHaveLength(15); // slice(0, 25-10) — the last 10 messages stay out of the summary
    expect(passed[0].content).toBe('m0');
    expect(passed[passed.length - 1].content).toBe('m14');
  });

  it('fires INCLUSIVELY at exactly projected === limit*percent/100 (>= boundary)', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    // Exact-threshold construction: probe returns a 100-char STRING (no object stamp, footer OFF → no ctx_footer),
    // so projected = baseline + estimateTokensFromChars(100) + FOOTER_TOKEN_ESTIMATE — exactly the wrapper's math.
    stubProbeImplementation(async () => 'x'.repeat(100));
    const exactBaseline = 57600 - (estimateTokensFromChars(100) + FOOTER_TOKEN_ESTIMATE);
    TokenStatsManager.setTurnEvaluation(exactBaseline, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call({}, undefined);
    expect(generate).toHaveBeenCalledTimes(1); // >= is inclusive at the exact line
  });

  it('does NOT fire one token below the threshold', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);

    stubProbeImplementation(async () => 'x'.repeat(100)); // same payload as the boundary test above
    const belowBaseline = 57600 - (estimateTokensFromChars(100) + FOOTER_TOKEN_ESTIMATE) - 1;
    TokenStatsManager.setTurnEvaluation(belowBaseline, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call({}, undefined);
    expect(generate).not.toHaveBeenCalled(); // strictly below → silent; PART B at the next user message still covers it
  });

  it('is idempotent once per turn across many tool results (two [TIER-2] lines in one turn = defect)', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    TokenStatsManager.setTurnEvaluation(57600, LIMIT); // threshold already crossed before the first result
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    for (let i = 0; i < 3; i += 1) {
      // Each pass re-enters the wrapper with a fresh payload — projected stays far above threshold every time.
      await call({}, undefined);
    }
    expect(generate).toHaveBeenCalledTimes(1); // latch: exactly one forced save per turn, no matter how many results
    expect(mockPersist).toHaveBeenCalledTimes(1);
  });

  it('re-arms on a NEW provider run (= new turn per the resetToolGuard convention) and fires again', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    TokenStatsManager.setTurnEvaluation(57600, LIMIT); // crossed in the FIRST run…
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    const call1 = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call1({}, undefined);
    expect(generate).toHaveBeenCalledTimes(1);

    TokenStatsManager.resetMidLoopDelta(); // …then the next preprocess() reset (new turn)…
    TokenStatsManager.setTurnEvaluation(57600, LIMIT); // …re-publishes a fresh live state…
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    const call2 = await getProbeImplementation({ guardEnabled: true, percent: PERCENT }); // provider entry re-arms the flag
    await call2({}, undefined);
    expect(generate).toHaveBeenCalledTimes(2); // one per turn — never zero on a fresh crossing turn
  });

  it('skips when contextGuardEnabled is NOT strictly true (undefined/false/0 all silent)', async () => {
    for (const value of [false, 0, undefined]) {
      const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
      setContextGuard(guard);

      TokenStatsManager.setTurnEvaluation(57600, LIMIT); // threshold crossed — gate must still refuse
      TokenStatsManager.setTurnMessages(makeTurnMessages(20));
      const call = await getProbeImplementation({ guardEnabled: value as boolean });
      await call({}, undefined);
      expect(generate).not.toHaveBeenCalled(); // strict `=== true` mirrors PART B; harness stubs return undefined for unknown keys

      TokenStatsManager.resetMidLoopDelta(); // fresh window per sub-case (module-state hygiene)
    }
  });

  it('skips on non-numeric or non-positive percent even when the threshold is crossed', async () => {
    for (const value of ['90' as unknown as number, 0, -10]) {
      const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
      setContextGuard(guard);

      TokenStatsManager.setTurnEvaluation(57600, LIMIT); // threshold crossed — percent gate must still refuse
      TokenStatsManager.setTurnMessages(makeTurnMessages(20));
      const call = await getProbeImplementation({ guardEnabled: true, percent: value });
      await call({}, undefined);
      expect(generate).not.toHaveBeenCalled();

      TokenStatsManager.resetMidLoopDelta(); // fresh window per sub-case
    }
  });

  it('treats a persistence failure as telemetry-only: result intact, no throw into the tool call', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: false, error: 'disk full (fake)' }); // documented non-throwing failure contract

    TokenStatsManager.setTurnEvaluation(57600, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    // Direct await is the no-throw pin (a rejecting wrapper fails here with its own error). The old
    // `expect(async () => {...}).not.toThrow()` pattern cannot work under jest 30: toThrow resolves an
    // async function lazily (node_modules/expect/build/index.js L2242–2247), so the returned promise was
    // never awaited and `result` below was still undefined at assert time — gate-5 F1 red, root-caused 09.10.
    const result = (await call({}, undefined)) as Record<string, unknown>;
    expect(result).toMatchObject({ success: true, executedTool: 'tier2_probe_tool' }); // tool outcome fully intact

    const telemetryLines = [...warnSpy.mock.calls, ...logSpy.mock.calls]
      .map((c) => String(c[0]))
      .filter((l) => l.includes('[TIER-2]'));
    expect(telemetryLines.length).toBeGreaterThanOrEqual(1); // the persist-failed branch names itself in the log
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('logs the deterministic skip when the published list has ≤10 messages past keepLast — latch still holds', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(57600, LIMIT); // threshold crossed…
    TokenStatsManager.setTurnMessages(makeTurnMessages(12)); // …but 12 - keepLast(10) = 2 → below the >10 guard
    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call({}, undefined);

    expect(generate).not.toHaveBeenCalled(); // nothing summarizable — deterministic skip, not an error
    const skips = [...logSpy.mock.calls].map((c) => String(c[0])).filter((l) => l.includes('[TIER-2]'));
    expect(skips.some((l) => l.includes('nothing summarizable'))).toBe(true);

    // Latch: a later result the SAME turn (even with enough messages now published) must not fire.
    TokenStatsManager.setTurnMessages(makeTurnMessages(30));
    await call({}, undefined);
    expect(generate).not.toHaveBeenCalled();
  });

  it('handles an ABSENT publish point (getTurnMessages() === null) without throwing — nothing summarizable, latch holds', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(57600, LIMIT); // baseline/limit published…
    // …but the message-list publish (same finally point) was skipped → null. The ?? [] guard must swallow it.
    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    // Direct await is the no-throw pin (same jest 30 toThrow/async laziness lesson as the persist-failure test above).
    const result = (await call({}, undefined)) as Record<string, unknown>; // a rejecting wrapper would fail here
    expect(result.executedTool).toBe('tier2_probe_tool');
    expect(generate).not.toHaveBeenCalled();

    const tier2Lines = [...logSpy.mock.calls, ...errorSpy.mock.calls].map((c) => String(c[0])).filter((l) => l.includes('[TIER-2]'));
    expect(tier2Lines.length).toBeLessThanOrEqual(1); // telemetry-only lines at most — never a thrown stack
  });

  it('fires with contextUsageFooter OFF (sibling-block independence — tier 2 must not ride the footer gate)', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    TokenStatsManager.setTurnEvaluation(57600, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    // footer explicitly OFF — pre-#21 this would have silently disabled the save (the defect class fixed 09.10).
    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT, footer: false });
    const result = (await call({}, undefined)) as Record<string, unknown>;
    expect(result.ctx_footer).toBeUndefined(); // footer itself stays off…
    expect(generate).toHaveBeenCalledTimes(1); // …while the forced save still fires — independent gate, sibling scope
  });

  it('warns exactly ONCE when the turn baseline was never published (suppression-warn regression pin)', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    // No setTurnEvaluation after beforeEach resetMidLoopDelta(): baseline === 0 — the exact state left behind by a
    // preprocess() run whose single publish point never executed. Footer ON (the only condition that gates the warn).
    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT, footer: true });
    const r1 = (await call({}, undefined)) as Record<string, unknown>;
    expect(r1.ctx_footer).toBeUndefined(); // suppression itself stays silent on the payload

    let suppressed = warnSpy.mock.calls.map((c) => String(c[0])).filter(
      (l) => l.includes('[CTX-FOOTER]') && l.includes('suppressed'),
    );
    expect(suppressed).toHaveLength(1); // one fail-loud warn per suppression window…
    expect(String(suppressed[0])).toContain('turn baseline not published');

    const r2 = (await call({}, undefined)) as Record<string, unknown>; // …same window, second result — no repeat
    expect(r2.ctx_footer).toBeUndefined();
    suppressed = warnSpy.mock.calls.map((c) => String(c[0])).filter(
      (l) => l.includes('[CTX-FOOTER]') && l.includes('suppressed'),
    );
    expect(suppressed).toHaveLength(1);

    TokenStatsManager.setTurnEvaluation(48320, LIMIT); // live baseline arrives mid-window…
    const r3 = (await call({}, undefined)) as Record<string, unknown>; // …footer back on the very next result
    expect(r3.ctx_footer).toBeDefined(); // no sticky suppression after a publish

    TokenStatsManager.resetMidLoopDelta(); // next turn's reset without republish — a FRESH window…
    const r4 = (await call({}, undefined)) as Record<string, unknown>; // …warns fresh exactly once on its own
    expect(r4.ctx_footer).toBeUndefined();
    suppressed = warnSpy.mock.calls.map((c) => String(c[0])).filter(
      (l) => l.includes('[CTX-FOOTER]') && l.includes('suppressed'),
    );
    expect(suppressed).toHaveLength(2); // window 1 + window 2 — the re-arm semantics pinned for pre-#21 parity
  });
});
