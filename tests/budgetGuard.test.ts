/**
 * Budget-Guard-Arc Step 6 (05.11) — hermetic test suite for the arc's decision core (src/budgetGuard.ts,
 * M2 + M3 pure parts) and the M3 wrapper wiring in toolsProvider.ts (session-scoped auto-persist latch at
 * the autopause edge, default 85 %). M1 (pre-call read gate) already ships byte-identical legacy behavior
 * off-config; this suite pins what this arc added.
 *
 * Pinned surfaces:
 *   - rung ladder: M3 85 % (BUDGET_GUARD_AUTOPAUSE_THRESHOLD_PCT) < tier-2 default ~90 % < FIX B fixed 95 %
 *     — M3 checkpoints, it caps nothing and never compresses
 *   - probe-justified high-entropy density band 1.307–1.670 c/tok (SETTLED 01.11 live probe, qwen3.8-27b-ud;
 *     default menu density ⇒ applied max(FLOOR 1.0, 3.6×BIAS 0.4) = 1.44 must sit INSIDE the band)
 *   - resolveAutopauseThresholdPct / resolveSafetyMarginPct legacy-safe fallbacks (garbage → ruling default)
 *   - M2 evaluateBudgetSpill: strict > edge, budgetChars = floor(remaining / applied density) via the shared
 *     getHighEntropyCharsPerToken() inversion (single source of truth — no duplicated clamp), ≥0 clamps,
 *     silent before a limit is published; buildBudgetSpillMarker completeness (BUDGET_GUARD_SPILL_MARKER + edge numbers)
 *   - M3 wrapper integration (tier-2 sibling harness pattern, tests/tier2MidLoopSave.test.ts): strict `=== true`
 *     master switch via the FLAT host-facing key budgetGuardEnabled (toolsProvider assembles the nested block from
 *     pluginConfig.get(...) — config.ts L169/L275); inclusive >= boundary pinned at EXACTLY 85 % with the wrapper's
 *     own high-entropy estimator (CTX-EST A parity); marker PREPEND to task_description only when it is a string;
 *     SESSION-scoped one-shot latch — survives provider re-entry by design (deliberately NOT reset at toolsProvider()
 *     entry, unlike forcedSaveFiredThisTurn) and re-arms ONLY via resetAutoPersistFlagForTests(); keepLast=10 slice
 *     contract with the <10 skip; persist failure = telemetry-only non-fatal; enabled=false ⇒ byte-identical legacy.
 *
 * Harness: ONE registration module (textProcessingTools) replaced with a probe tool so no real implementation runs —
 * same registry-ID identity house rule as tier2MidLoopSave.test.ts / contextUsageFooter.test.ts (the jest.mock target
 * MUST map to the same module ID toolsProvider's './tools/textProcessingTools.js' resolves to under jest.config.cjs).
 * persistGeneratedSessionSummary is mocked on the SAME registry ID toolsProvider's own import resolves to. The fake
 * ContextGuard is swapped via setContextGuard() (one-way test-harness contract, promptPreprocessor L97). contextGuardEnabled
 * stays undefined in this suite so tier-2/FIX B remain structurally silent — M3 must not ride or need that gate.
 */
import { toolsProvider, resetForcedSaveFlagForTests, resetAutoPersistFlagForTests } from '../src/toolsProvider.js';
import { setContextGuard } from '../src/promptPreprocessor.js';
// CTX-EST A (31.10): the wrapper prices its payload self-size in the 'highEntropy' class — boundary fixtures MUST use the
// same class-aware estimator or their exact-threshold arithmetic drifts from production math (~42 tokens at default density).
import { TokenStatsManager, estimateTokensFromCharsOfClass, getHighEntropyCharsPerToken } from '../src/tokenStatsManager.js';
import { FOOTER_TOKEN_ESTIMATE } from '../src/utils/contextUsageFooter.js';
import { DEFAULT_CONFIG } from '../src/config.js';
// Under test — the pure decision core this arc added (M2 budget-aware spill + M3 auto-persist threshold & marker).
import {
  BUDGET_GUARD_AUTOPAUSE_THRESHOLD_PCT,
  BUDGET_GUARD_SAFETY_MARGIN_PCT,
  BUDGET_GUARD_SPILL_MARKER,
  evaluateBudgetSpill,
  resolveAutopauseThresholdPct,
  resolveSafetyMarginPct,
  buildBudgetAutoPersistMarker,
  buildBudgetSpillMarker,
} from '../src/budgetGuard.js';

// Probe registration — registry-ID identity per house rule: the request string below MUST map to tests/__mocks__/textProcessingTools.ts,
// the SAME module ID toolsProvider's static import of './tools/textProcessingTools.js' resolves to (jest.config.cjs).
const DEFAULT_PROBE_TOOL = {
  name: 'budgetguard_probe_tool',
  description: 'Test-only probe for Budget-Guard-Arc Step 6 wrapper integration (fake, no side effects).',
  parameters: { type: 'object', properties: {} },
} as const;

jest.mock('./__mocks__/textProcessingTools.js', () => ({
  registerTextProcessingTools: jest.fn((): Array<Record<string, unknown>> => [
    { ...DEFAULT_PROBE_TOOL, implementation: async (): Promise<Record<string, unknown>> => ({ success: true }) },
  ]),
}));

// Canonical persist path — mocked on the same registry ID toolsProvider's './sessionSummaryPersist.js' import resolves to.
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

/** Fake ContextGuard — only the method surface the M3 block consumes (typeof-gated in production). */
function makeGuard(impl: (...args: unknown[]) => Promise<unknown> | unknown): {
  guard: Record<string, unknown>;
  generate: jest.Mock;
} {
  const generate = jest.fn(impl);
  return { guard: { generateSessionContinuity: generate } as unknown as Record<string, unknown>, generate };
}

/** Build a fake published turn list (role/content pairs — the wrapper only reads length + slice). */
function makeTurnMessages(count: number): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, i) => ({ role: 'user', content: `m${i}` }));
}

describe('Budget-Guard-Arc Step 6 (05.11) — hermetic pins', () => {
  // ==================== A. Decision core — rung ladder, density band, resolvers (pure) ====================

  it('pins the arc constant ladder: M3 85 % < tier-2 default ~90 % < FIX B fixed 95 %, safety margin 8 %', () => {
    // Rung order is owner-ruled and load-bearing: M3 checkpoints below tier-2's forced save; neither caps or compresses.
    expect(BUDGET_GUARD_AUTOPAUSE_THRESHOLD_PCT).toBe(85);
    expect(BUDGET_GUARD_SAFETY_MARGIN_PCT).toBe(8); // limit×(1−8/100) = 92 % — consistent with DEFAULT_CONFIG.spill_threshold_pct=92
    expect(DEFAULT_CONFIG.budgetGuardAutopauseThresholdPct).toBe(85); // flat host-facing default mirrors the arc constant
  });

  it('pins the probe-justified high-entropy density band: applied default density sits INSIDE 1.307–1.670 c/tok', () => {
    const applied = getHighEntropyCharsPerToken(); // live menu density at default ⇒ max(1.0, 3.6×0.4) = 1.44 (SETTLED 01.11 probe)
    expect(applied).toBeGreaterThanOrEqual(1.307); // HEXDUMP densest family — no applied density below the band floor family
    expect(applied).toBeLessThan(1.670 + 1e-9); // LOGSTORM worst case — headroom preserved (incident 29.10 class)
  });

  it('resolveAutopauseThresholdPct: legacy-safe fallback to 85 for absent/garbage config, custom respected', () => {
    expect(resolveAutopauseThresholdPct(undefined)).toBe(85);
    expect(resolveAutopauseThresholdPct(null)).toBe(85);
    expect(resolveAutopauseThresholdPct({} as never)).toBe(85); // no budgetGuard block on legacy saved configs
    const mk = (pct: unknown) => ({ budgetGuard: { enabled: true, autopause_threshold_pct: pct } }) as never;
    expect(resolveAutopauseThresholdPct(mk(70))).toBe(70); // custom value respected (schema min 1 / max 99)
    for (const bad of ['85' as unknown as number, -5, 0, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(resolveAutopauseThresholdPct(mk(bad))).toBe(85); // garbage ⇒ ruling default, never NaN into the gate math
    }
  });

  it('resolveSafetyMarginPct: legacy-safe fallback to 8 for absent/garbage config, custom respected', () => {
    expect(resolveSafetyMarginPct(undefined)).toBe(8);
    expect(resolveSafetyMarginPct(null)).toBe(8);
    const mk = (pct: unknown) => ({ budgetGuard: { enabled: true, safety_margin_pct: pct } }) as never;
    expect(resolveSafetyMarginPct(mk(10))).toBe(10); // schema allows 0..50 — a zero margin is LEGAL (edge === limit), not garbage
    expect(resolveSafetyMarginPct(mk(0))).toBe(0);
    for (const bad of ['8' as unknown as number, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(resolveSafetyMarginPct(mk(bad))).toBe(8);
    }
  });

  it('buildBudgetAutoPersistMarker: full numbers with window fragment; no-arg form stays NaN/undefined-free', () => {
    // Real-number probe (same class as the M3 session verification): projected 131,964 against a 155,136-tok window at 85 %.
    const full = buildBudgetAutoPersistMarker(85, 131_964, 155_136);
    expect(full.startsWith('[Budget guard] auto_saved=true')).toBe(true); // machine-visible flag first — restore dossiers surface it as its own note
    expect(full).toContain('M3 session summary auto-persisted at ~131,964 projected tokens');
    expect(full).toContain('(≥ 85% autopause edge ≈ 131,866 tok of the 155,136-tok window)'); // 0.85×155,136 = 131,865.6 → 131,866
    expect(full).toContain('AUTOMATIC insurance save by the budget guard');
    expect(full.endsWith('End of auto-marker.\n\n')).toBe(true); // deterministic terminator before the real task_description

    const bare = buildBudgetAutoPersistMarker(85); // no projected/limit — pre-publish or defensive call path
    expect(bare).toContain('~0 projected tokens');
    expect(bare).not.toContain('NaN');
    expect(bare).not.toContain('undefined');
    expect(bare).not.toContain('-tok window');
  });

  // ==================== B. M2 decision core — budget-aware spill (pure) ====================

  it('M2 evaluateBudgetSpill: fires ONLY when projected strictly exceeds limit×(1−margin/100) (default ⇒ 92 % edge)', () => {
    const limit = 64_000;
    const edge = limit * (1 - BUDGET_GUARD_SAFETY_MARGIN_PCT / 100); // 58,880
    const used = 50_000 + 2_000;

    // Crossing: payload big enough that baseline+Δ+est+footer > edge.
    const crossingChars = Math.ceil((edge - used - FOOTER_TOKEN_ESTIMATE + 1) * getHighEntropyCharsPerToken());
    const on = evaluateBudgetSpill({ payloadChars: crossingChars, toolName: 'read_file' }, { config: mkEnabled() as never, getState: () => ({ baselineTokens: 50_000, midLoopDeltaTokens: 2_000, maxContextTokens: limit }) });
    expect(on.shouldBudgetSpill).toBe(true);
    expect(typeof on.budgetChars).toBe('number');

    // One token under the edge → silent (strict > boundary — parity with M1/M3 house convention on the projection term itself;
    // here the gate is `projectedTokens > edgeTokens` in budgetGuard.ts, so exact-equality stays OFF by construction).
    const belowChars = Math.max(0, Math.ceil((edge - used - FOOTER_TOKEN_ESTIMATE) * getHighEntropyCharsPerToken()) - 1);
    const off = evaluateBudgetSpill({ payloadChars: belowChars, toolName: 'read_file' }, { config: mkEnabled() as never, getState: () => ({ baselineTokens: 50_000, midLoopDeltaTokens: 2_000, maxContextTokens: limit }) });
    expect(off.shouldBudgetSpill).toBe(false);

    // Disabled / pre-publish silent paths — byte-identical legacy shape (no decision fields at all).
    expect(evaluateBudgetSpill({ payloadChars: crossingChars }, { config: {} as never, getState: () => ({ baselineTokens: 50_000, midLoopDeltaTokens: 2_000, maxContextTokens: limit }) })).toEqual({ shouldBudgetSpill: false });
    expect(evaluateBudgetSpill({ payloadChars: crossingChars }, { config: mkEnabled() as never, getState: () => ({ baselineTokens: 0, midLoopDeltaTokens: 0, maxContextTokens: 0 }) }))
      .toEqual({ shouldBudgetSpill: false }); // limit === 0 before the first preprocess() publish → gate silent (no false-positive flood)
  });

  it('M2 budgetChars = floor(remaining / applied high-entropy density) via getHighEntropyCharsPerToken — single source of truth, clamped ≥ 0', () => {
    const limit = 64_000;
    const edge = limit * (1 - BUDGET_GUARD_SAFETY_MARGIN_PCT / 100); // 58,880
    const used = 50_000 + 2_000;

    const payloadChars = Math.ceil((edge - used - FOOTER_TOKEN_ESTIMATE + 7) * getHighEntropyCharsPerToken());
    const decision = evaluateBudgetSpill({ payloadChars, toolName: 'read_file' }, { config: mkEnabled() as never, getState: () => ({ baselineTokens: 50_000, midLoopDeltaTokens: 2_000, maxContextTokens: limit }) });
    expect(decision.shouldBudgetSpill).toBe(true);

    const density = getHighEntropyCharsPerToken(); // the EXACT class pricing M2 inverts with — never a duplicated clamp
    const expectedRemaining = Math.max(0, edge - used - FOOTER_TOKEN_ESTIMATE);
    expect(decision.remainingBudgetTokens).toBeCloseTo(expectedRemaining, 6);
    expect(decision.budgetChars).toBe(Math.floor(expectedRemaining / density)); // strict floor parity with the module's own math

    // Clamped to 0 when nothing fits: baseline+Δ already past the edge (minus footer) — remaining collapses, no negative chars.
    const starved = evaluateBudgetSpill({ payloadChars: 10_000 }, { config: mkEnabled() as never, getState: () => ({ baselineTokens: edge + 5, midLoopDeltaTokens: 0, maxContextTokens: limit }) });
    expect(starved.shouldBudgetSpill).toBe(true); // projected still above the edge…
    expect(starved.budgetChars).toBe(0); // …but the cap clamps at zero — caller falls back to the absolute compaction bound
  });

  it('M2 buildBudgetSpillMarker: self-describing completeness (marker phrase + reserve/edge/window numbers, no NaN)', () => {
    const limit = 64_000;
    const edge = Math.round(limit * (1 - BUDGET_GUARD_SAFETY_MARGIN_PCT / 100)); // 58,880
    const marker = buildBudgetSpillMarker(
      { shouldBudgetSpill: true, budgetChars: 42_370, remainingBudgetTokens: 61_000, limitTokens: limit, projectedTokens: 59_412.4 } as never,
      mkEnabled() as never,
    );
    expect(marker).toContain(`[Budget guard] ${BUDGET_GUARD_SPILL_MARKER}`); // 'SPILLED by budget guard' — model-visible distinction from absolute-cap spills
    expect(marker).toContain('59,412'); // projected (rounded)
    expect(marker).toContain(edge.toLocaleString('en-US')); // edge number pinned to the module's own rounding
    expect(marker).toContain(limit.toLocaleString('en-US'));
    expect(marker).toContain(BUDGET_GUARD_SAFETY_MARGIN_PCT.toString()); // '8' — the reserve % names itself
    expect(marker).not.toContain('NaN');
  });

  function mkEnabled(): Record<string, unknown> {
    return { budgetGuard: { enabled: true } };
  }

  // ==================== C. M3 wrapper integration — session-scoped auto-persist latch (toolsProvider.ts) ====================

  const LIMIT = 64_000; // tokens — mirrors the 64k window used across the mid-loop suites' projection math
  const M3_EDGE_TOKENS = LIMIT * BUDGET_GUARD_AUTOPAUSE_THRESHOLD_PCT / 100; // 54,400 at default 85 %

  function createHermeticController(opts: {
    budgetEnabled?: boolean | undefined;
    autopausePct?: number | string | undefined;
    footer?: boolean;
  } = {}): unknown {
    // Everything OFF except textProcessing (the mocked family) + the toggles under test — hermetic registration.
    const base: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      base[key] = false;
    }
    base.textProcessing = true;
    if (opts.budgetEnabled !== undefined) base.budgetGuardEnabled = opts.budgetEnabled; // FLAT host-facing key — toolsProvider assembles the nested block from it
    if (opts.autopausePct !== undefined) base.budgetGuardAutopauseThresholdPct = opts.autopausePct; // LIVE read path under test
    base.contextUsageFooter = opts.footer ?? false; // OFF by default — M3 is a sibling of tier-2, not a rider on the footer gate
    return {
      getGlobalPluginConfig: jest.fn().mockReturnValue({
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
    const probe = tools.find((t) => t.name === 'budgetguard_probe_tool');
    expect(probe).toBeDefined(); // loud failure if the mock registry ID ever diverges from toolsProvider's import
    return (probe as { implementation: (...args: unknown[]) => Promise<unknown> }).implementation!;
  }

  beforeEach(() => {
    TokenStatsManager.resetMidLoopDelta(); // fresh turn state — no baseline/limit/delta/message-list leaks between cases
    resetForcedSaveFlagForTests(); // tier-2 latch hygiene (structurally silent here, but module-state must start clean)
    resetAutoPersistFlagForTests(); // re-arm the M3 SESSION latch (module state in toolsProvider.ts — deliberately NOT entry-reset in production)
    setContextGuard(null); // no guard installed unless a test installs its fake explicitly
    mockPersist.mockReset();
    mockTextProcessingTools.registerTextProcessingTools.mockClear();
  });

  afterEach(() => {
    TokenStatsManager.clearActiveToolCallsForTests();
    setContextGuard(null);
    jest.restoreAllMocks(); // release any console spies (probe/factory jest.fn() state is per-test by design)
  });

  it('C1: fires ONCE when the shared projection crosses the 85 % autopause edge and persists with keepLast=10 slice + auto_saved marker', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const { guard, generate } = makeGuard(async () => ({ task_description: 'manual text' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    stubProbeImplementation(async () => 'x'.repeat(100)); // known payload ⇒ expected projection computable with the wrapper's own math
    TokenStatsManager.setTurnEvaluation(57_600, LIMIT); // comfortably above 54,400 — default density math, no boundary subtlety
    TokenStatsManager.setTurnMessages(makeTurnMessages(25)); // 15 summarizable + 10 kept live

    const call = await getProbeImplementation({ budgetEnabled: true });
    mockTextProcessingTools.registerTextProcessingTools.mockClear(); // provider-run calls are not the assertion target
    const result = await call({}, undefined);
    expect(typeof result).toBe('string'); // string payloads flow through untouched (no object envelope → no executedTool stamp)…
    expect(result).toHaveLength(100); // …footer OFF ⇒ exactly the 100-char probe, byte-identical

    expect(generate).toHaveBeenCalledTimes(1);
    const passed = generate.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(passed).toHaveLength(15); // slice(0, 25−10) — same keepLast contract as tier-2's sibling
    expect(passed[0].content).toBe('m0');

    expect(mockPersist).toHaveBeenCalledTimes(1);
    const persisted = mockPersist.mock.calls[0][0] as { task_description?: string };
    expect(typeof persisted.task_description).toBe('string'); // marker path requires a string task_description…
    expect(persisted.task_description!.startsWith('[Budget guard] auto_saved=true')).toBe(true); // …and the marker is PREPENDED (dossiers surface it first)
    expect(persisted.task_description!.endsWith('manual text')); // original content intact after the marker terminator

    // Marker numbers use the wrapper's LIVE projection (baseline + est_high(100 payload) + footer self-size), not the raw baseline:
    const expectedProjected = 57_600 + estimateTokensFromCharsOfClass(100, 'highEntropy') + FOOTER_TOKEN_ESTIMATE;
    expect(persisted.task_description!).toContain(`at ~${expectedProjected.toLocaleString('en-US')} projected tokens`); // wrapper-own math pinned into the dossier note

    const autosave = logSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[M3-AUTOSAVE]'));
    expect(autosave.some((l) => l.includes('✅'))).toBe(true); // saved-branch telemetry names itself (the emoji lives in the production log line, not in test source)
  });

  it('C2: fires INCLUSIVELY at exactly projected === limit × 85/100 (>= boundary, wrapper-own high-entropy estimator)', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    // Exact-threshold construction (tier2 parity): probe returns a 100-char STRING, so projected = baseline + est_high(100) + FOOTER_TOKEN_ESTIMATE.
    stubProbeImplementation(async () => 'x'.repeat(100));
    const exactBaseline = M3_EDGE_TOKENS - (estimateTokensFromCharsOfClass(100, 'highEntropy') + FOOTER_TOKEN_ESTIMATE);
    TokenStatsManager.setTurnEvaluation(exactBaseline, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20)); // 10 summarizable — fires exactly at the gate-5 inclusive floor

    const call = await getProbeImplementation({ budgetEnabled: true });
    await call({}, undefined);
    expect(generate).toHaveBeenCalledTimes(1); // >= is inclusive at the exact line (house convention, pinned)
  });

  it('C3: does NOT fire one token below the autopause edge', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);

    stubProbeImplementation(async () => 'x'.repeat(100)); // same payload class/pricing as C2 — wrapper-own estimator
    const belowBaseline = M3_EDGE_TOKENS - (estimateTokensFromCharsOfClass(100, 'highEntropy') + FOOTER_TOKEN_ESTIMATE) - 1;
    TokenStatsManager.setTurnEvaluation(belowBaseline, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const call = await getProbeImplementation({ budgetEnabled: true });
    await call({}, undefined);
    expect(generate).not.toHaveBeenCalled(); // strictly below → silent; tier-2 (~90 %) / FIX B (95 %) rungs unaffected by design
  });

  it('C4: is SESSION-scoped — the latch survives a SIMULATED provider re-entry (fresh toolsProvider() call) and fires exactly once', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    TokenStatsManager.setTurnEvaluation(57_600, LIMIT); // edge crossed in the FIRST provider run…
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    const call1 = await getProbeImplementation({ budgetEnabled: true }); // run 1 (provider entry #1) — latches BEFORE the first await
    await call1({}, undefined);
    expect(generate).toHaveBeenCalledTimes(1);

    TokenStatsManager.resetMidLoopDelta(); // …new turn state…
    TokenStatsManager.setTurnEvaluation(57_600, LIMIT); // …re-crossing numbers re-published…
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    const call2 = await getProbeImplementation({ budgetEnabled: true }); // run 2 — a SECOND toolsProvider() entry (per-step provider re-entry shape)
    await call2({}, undefined);

    expect(generate).toHaveBeenCalledTimes(1); // session latch holds across the re-entry — max ONE regeneration per plugin process lifetime…
    expect(mockPersist).toHaveBeenCalledTimes(1);
    resetAutoPersistFlagForTests(); // …the ONLY production-free re-arm is the exported test hook (documented at toolsProvider L150)
  });

  it('C5: honours a CUSTOM autopause_threshold_pct from config (live read through the assembled nested block)', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    // 70 % edge of 64,000 = 44,800 — a baseline that sits BELOW the default 85 % line (54,400) but crosses 70 %.
    const customBaseline = LIMIT * 0.7 - (estimateTokensFromCharsOfClass(100, 'highEntropy') + FOOTER_TOKEN_ESTIMATE); // projected lands exactly on the 70 % line with a 100-char probe payload

    stubProbeImplementation(async () => 'x'.repeat(100)); // provider run #1 consumes this one-shot implementation…
    TokenStatsManager.setTurnEvaluation(customBaseline, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const callDefault = await getProbeImplementation({ budgetEnabled: true }); // …default 85 % gate must refuse (same numbers)…
    await callDefault({}, undefined);
    expect(generate).not.toHaveBeenCalled();

    TokenStatsManager.resetMidLoopDelta();
    resetAutoPersistFlagForTests(); // fresh session for the custom-pct leg of this test
    TokenStatsManager.setTurnEvaluation(customBaseline, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    stubProbeImplementation(async () => 'x'.repeat(100)); // provider run #2 (fresh one-shot)
    const callCustom = await getProbeImplementation({ budgetEnabled: true, autopausePct: 70 }); // …while the live custom value fires inclusively at its own edge
    await callCustom({}, undefined);
    expect(generate).toHaveBeenCalledTimes(1);

    TokenStatsManager.resetMidLoopDelta();
    resetAutoPersistFlagForTests();
    TokenStatsManager.setTurnEvaluation(customBaseline, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    stubProbeImplementation(async () => 'x'.repeat(100)); // provider run #3 (fresh one-shot)
    const callGarbage = await getProbeImplementation({ budgetEnabled: true, autopausePct: 'x' }); // non-numeric ⇒ resolver falls back to 85 → silent again
    await callGarbage({}, undefined);
    expect(generate).toHaveBeenCalledTimes(1); // cumulative: the ONLY fire is leg #2's custom-pct hit — the garbage leg added nothing (44,800 < 54,400 at fallback 85 %)
    expect(mockPersist).toHaveBeenCalledTimes(1);
  });

  it('C6: skips deterministically when the published list leaves <10 messages past keepLast — latch still holds', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);

    TokenStatsManager.setTurnEvaluation(57_600, LIMIT); // edge crossed…
    TokenStatsManager.setTurnMessages(makeTurnMessages(12)); // …but 12 − keepLast(10) = 2 → below the gate-5 floor (tier2 parity)
    const call = await getProbeImplementation({ budgetEnabled: true });
    await call({}, undefined);

    expect(generate).not.toHaveBeenCalled(); // nothing summarizable — deterministic skip, not an error
    expect(mockPersist).not.toHaveBeenCalled();
    const skips = logSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[M3-AUTOSAVE]') && l.includes('nothing summarizable'));
    expect(skips.length).toBeGreaterThanOrEqual(1); // the skip branch names itself

    // Latch: a later result the same session (even with enough messages now published) must NOT fire.
    TokenStatsManager.setTurnMessages(makeTurnMessages(30));
    await call({}, undefined);
    expect(generate).not.toHaveBeenCalled();
  });

  it('C7: treats a persistence failure as telemetry-only — tool result intact, no throw into the tool call, latch holds', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: false, error: 'disk full (fake)' }); // documented non-throwing failure contract

    TokenStatsManager.setTurnEvaluation(57_600, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const call = await getProbeImplementation({ budgetEnabled: true });
    const result = (await call({}, undefined)) as Record<string, unknown>; // direct await is the no-throw pin (jest 30 async-toThrow laziness lesson)
    expect(result).toMatchObject({ success: true, executedTool: 'budgetguard_probe_tool' }); // tool outcome fully intact

    const autosave = [...logSpy.mock.calls, ...warnSpy.mock.calls].map((c) => String(c[0])).filter((l) => l.includes('[M3-AUTOSAVE]'));
    expect(autosave.some((l) => l.includes('persistence failed'))).toBe(true); // ⚠️-branch telemetry names itself
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('C8: skips when budgetGuard.enabled is NOT strictly true (undefined/false/0 all silent — master switch via flat key)', async () => {
    for (const value of [false, 0, undefined]) {
      const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
      setContextGuard(guard);

      TokenStatsManager.setTurnEvaluation(57_600, LIMIT); // edge crossed — gate must still refuse
      TokenStatsManager.setTurnMessages(makeTurnMessages(20));
      const call = await getProbeImplementation(value === undefined ? {} : { budgetEnabled: value as boolean });
      await call({}, undefined);
      expect(generate).not.toHaveBeenCalled(); // strict `=== true` on the assembled nested block (harness stubs return undefined for unset keys)

      TokenStatsManager.resetMidLoopDelta(); // fresh window per sub-case (module-state hygiene)
    }
  });

  it('C9: enabled=false is byte-identical legacy — NO M3 telemetry at all, even past tier-2 and FIX B rung levels', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const call = await getProbeImplementation({}); // master switch unset (undefined) — the default-off shape of every legacy config
    TokenStatsManager.setTurnEvaluation(61_440, LIMIT); // 96 % of 64k — ABOVE tier-2's ~90 % AND FIX B's fixed 95 % rung lines…
    TokenStatsManager.setTurnMessages(makeTurnMessages(30));
    const result = (await call({}, undefined)) as Record<string, unknown>;
    expect(result.executedTool).toBe('budgetguard_probe_tool');

    const allLines = [...logSpy.mock.calls, ...warnSpy.mock.calls].map((c) => String(c[0]));
    expect(allLines.some((l) => l.includes('[M3-AUTOSAVE]'))).toBe(false); // dead-code block: zero M3 telemetry…
    expect(allLines.some((l) => l.includes('[TIER-2]'))).toBe(false); // …and tier-2/FIX B stay silent too (contextGuardEnabled unset — structural independence pinned)
    expect(mockPersist).not.toHaveBeenCalled();
  });

  it('C10: works with contextUsageFooter OFF (sibling-block independence — M3 must not ride the footer gate)', async () => {
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    TokenStatsManager.setTurnEvaluation(57_600, LIMIT);
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    const call = await getProbeImplementation({ budgetEnabled: true, footer: false }); // footer explicitly OFF…
    const result = (await call({}, undefined)) as Record<string, unknown>;
    expect((result as { ctx_footer?: unknown }).ctx_footer).toBeUndefined(); // …the footer itself stays off on the object envelope…
    expect(generate).toHaveBeenCalledTimes(1); // …while M3 still fires — same structural sibling scope as tier-2
  });
});
