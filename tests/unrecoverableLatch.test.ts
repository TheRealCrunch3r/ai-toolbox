/**
 * LATCH SUB-ITEM (30.10, owner GO — FIX #1 Part A guard): proven-unrecoverable window latch for the toolsProvider
 * mid-loop gates. Root cause pinned 30.10: in an unrecoverable window (host history still >= compression threshold
 * after a FRESH pullHistory() post-compression recount — plugins cannot shrink LM Studio's real history, SDK copy-
 * contract), PART B re-published the true baseline every turn while EVERY model step re-entered toolsProvider(),
 * resetting forcedSaveFiredThisTurn / midLoopCompactionFiredThisTurn and re-firing TIER-2 (Arc-C regeneration +
 * persist) and FIX B (prune → snapshot → Arc-C → compressHistory, up to a 60s summarization prediction) as pure no-op
 * spend per step. The latch (TokenStatsManager state — survives provider re-entry; wrapper-local vars do not) is set
 * by PART B's FIX-1B branch, cleared by its below-threshold else + TokenStatsManager.clear(), and makes both gates'
 * would-have-fired paths skip with a one-shot-per-window FAIL-LOUD line.
 *
 * Suite A pins the latch API contract; suite B reuses the tier2MidLoopSave.test.ts wrapper-integration harness
 * (probe tool via the tests/__mocks__/textProcessingTools manual-mock registry ID + fake guard via setContextGuard)
 * to pin gate-level suppression end-to-end.
 */
import { toolsProvider, resetForcedSaveFlagForTests } from '../src/toolsProvider.js';
import { setContextGuard } from '../src/promptPreprocessor.js';
import { TokenStatsManager } from '../src/tokenStatsManager.js';
import { DEFAULT_CONFIG } from '../src/config.js';

const PROBE_TOOL = {
  name: 'latch_probe_tool',
  description: 'Test-only probe for the LATCH SUB-ITEM gate integration (fake, no side effects).',
  parameters: { type: 'object', properties: {} },
} as const;

jest.mock('./__mocks__/textProcessingTools.js', () => ({
  registerTextProcessingTools: jest.fn((): Array<Record<string, unknown>> => [
    { ...PROBE_TOOL, implementation: async (): Promise<Record<string, unknown>> => ({ success: true }) },
  ]),
}));

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

function makeGuard(impl: (...args: unknown[]) => Promise<unknown> | unknown): {
  guard: Record<string, unknown>;
  generate: jest.Mock;
} {
  const generate = jest.fn(impl);
  return { guard: { generateSessionContinuity: generate } as unknown as Record<string, unknown>, generate };
}

function makeTurnMessages(count: number): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, i) => ({ role: 'user', content: `m${i}` }));
}

describe('TokenStatsManager unrecoverable-window latch — API contract (LATCH SUB-ITEM 30.10)', () => {
  beforeEach(() => {
    TokenStatsManager.resetMidLoopDelta(); // fresh turn state per case (module-state hygiene)
    TokenStatsManager.setUnrecoverableWindowForTests(false);
  });

  it('defaults to CLEAR — the latch is a proven-unrecoverable marker, never a default-on suppression', () => {
    expect(TokenStatsManager.getUnrecoverableWindow()).toBe(false);
  });

  it('SET records provenance and CLEARED re-arms; double clear / set-before-set are idempotent no-logs', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    TokenStatsManager.setUnrecoverableWindow(150000, 200000);
    expect(TokenStatsManager.getUnrecoverableWindow()).toBe(true);

    TokenStatsManager.clearUnrecoverableWindow(); // transition → exactly one CLEARED line
    expect(logSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('CLEARED'))).toHaveLength(1);
    expect(TokenStatsManager.getUnrecoverableWindow()).toBe(false);

    TokenStatsManager.clearUnrecoverableWindow(); // second clear = no-op, no repeat line
    expect(logSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('CLEARED'))).toHaveLength(1);
  });

  it('skip log is ONE-SHOT per gate per transition: first call logs (with provenance), repeats are silent, a fresh transition re-logs', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    TokenStatsManager.setUnrecoverableWindow(150000, 200000);

    TokenStatsManager.logUnrecoverableSkip('tier2');
    let tier2Lines = warnSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]') && l.includes('TIER-2'));
    expect(tier2Lines).toHaveLength(1);
    expect(String(tier2Lines[0])).toContain('proven 150,000/200,000 tok at set'); // provenance retained for the line only

    TokenStatsManager.logUnrecoverableSkip('tier2'); // later model step — silent
    tier2Lines = warnSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]') && l.includes('TIER-2'));
    expect(tier2Lines).toHaveLength(1);

    TokenStatsManager.logUnrecoverableSkip('fixb'); // other gate: independent one-shot, also logs once
    const fixbLines = warnSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]') && l.includes('FIX B compression'));
    expect(fixbLines).toHaveLength(1);

    // Fresh transition (re-set, as PART B re-affirms at a boundary recount) ⇒ both gates may log once more.
    TokenStatsManager.setUnrecoverableWindow(150000, 200000);
    TokenStatsManager.logUnrecoverableSkip('tier2');
    tier2Lines = warnSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]') && l.includes('TIER-2'));
    expect(tier2Lines).toHaveLength(2); // one per transition — never per model step

    TokenStatsManager.clearUnrecoverableWindow(); // and a clear also re-arms the log state
    TokenStatsManager.setUnrecoverableWindowForTests(false);
  });

  it('chat reset (TokenStatsManager.clear()) is the hard clear path — latch + provenance + skip-log state all gone', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    TokenStatsManager.setUnrecoverableWindow(150000, 200000);
    TokenStatsManager.logUnrecoverableSkip('tier2'); // window-1 line consumed
    expect(TokenStatsManager.getUnrecoverableWindow()).toBe(true);

    TokenStatsManager.clear(); // chat reset — the only true in-band recovery
    expect(TokenStatsManager.getUnrecoverableWindow()).toBe(false);

    const preResetLines = warnSpy.mock.calls.length; // window-1's consumed skip line (legit provenance) stays OUT of scope…
    TokenStatsManager.logUnrecoverableSkip('tier2'); // post-reset call: no provenance recorded (window 0) …
    const lines = warnSpy.mock.calls.slice(preResetLines).map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]'));
    expect(lines.some((l) => l.includes('proven '))).toBe(false); // … so the POST-RESET line never claims stale provenance (gate-4 fix: filter scoped to post-reset — the pre-clear window-1 line legitimately carries its own provenance in the same spy)
  });

  it('resetMidLoopDelta() does NOT clear the latch — within one turn nothing can shrink host history back under threshold', () => {
    TokenStatsManager.setUnrecoverableWindow(150000, 200000);
    TokenStatsManager.resetMidLoopDelta(); // what preprocess() runs at every turn start
    expect(TokenStatsManager.getUnrecoverableWindow()).toBe(true); // re-evaluation is PART B boundary work only
    TokenStatsManager.clearUnrecoverableWindow();
  });

  afterEach(() => {
    jest.restoreAllMocks(); // gate-5 fix (30.10): restore console.warn/log spies — without this, the FIRST
                           // integration case's exact-count assertion saw Suite A's accumulated lines in the
                           // SAME shared spy instance (jest-mock spyOn returns the existing mock when a spy is
                           // still installed on the property; verified against node_modules/jest-mock/build/index.js)
  });
});

describe('LATCH SUB-ITEM gate integration — toolsProvider wrapper (harness: tier2MidLoopSave.test.ts pattern)', () => {
  const LIMIT = 64000; // mirrors the 64k window used across the mid-loop suites' projection math
  const PERCENT = 90; // default contextGuardCompressionPercent

  function createHermeticController(opts: { guardEnabled?: boolean | undefined; percent?: number | undefined } = {}): unknown {
    const base: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) base[key] = false; // hermetic: only the toggles under test are on
    base.textProcessing = true;
    base.contextGuardEnabled = opts.guardEnabled;
    if (opts.percent !== undefined) base.contextGuardCompressionPercent = opts.percent;
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
    const probe = tools.find((t) => t.name === 'latch_probe_tool');
    expect(probe).toBeDefined(); // loud failure if the mock registry ID ever diverges from toolsProvider's import
    return (probe as { implementation: (...args: unknown[]) => Promise<unknown> }).implementation!;
  }

  beforeEach(() => {
    TokenStatsManager.resetMidLoopDelta();
    TokenStatsManager.setUnrecoverableWindowForTests(false); // the suite under test — never leak latch state between cases
    resetForcedSaveFlagForTests();
    setContextGuard(null);
    mockPersist.mockReset();
    mockTextProcessingTools.registerTextProcessingTools.mockClear();
  });

  afterEach(() => {
    TokenStatsManager.clearActiveToolCallsForTests();
    TokenStatsManager.setUnrecoverableWindowForTests(false);
    setContextGuard(null);
    jest.restoreAllMocks();
  });

  it('TIER-2: latch SET + threshold crossed → save suppressed, exactly one FAIL-LOUD skip line per transition (later model steps silent)', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never); // no compressMidLoop → FIX B gate inert here
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    TokenStatsManager.setTurnEvaluation(57600, LIMIT); // exactly the 90% line — without the latch this pass FIRES (pinned by the regression test below)
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    TokenStatsManager.setUnrecoverableWindow(64000, LIMIT); // PART B would have set exactly this: recount >= threshold

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    const r1 = (await call({}, undefined)) as Record<string, unknown>;
    expect(r1.executedTool).toBe('latch_probe_tool'); // tool result flows through untouched
    expect(generate).not.toHaveBeenCalled(); // the no-op spend is gone…
    expect(mockPersist).not.toHaveBeenCalled();

    let skipLines = warnSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]') && l.includes('TIER-2'));
    expect(skipLines).toHaveLength(1); // …but the suppression is FAIL-LOUD exactly once…

    // gate-5 fix (30.10): the console.warn spy instance is shared suite-wide (jest-mock re-spyOn returns the
    // already-installed mock — see Suite A's afterEach), so step 2 gets a FRESH record instead of a second install:
    warnSpy.mockClear();
    resetForcedSaveFlagForTests(); // next model step: host re-entered toolsProvider(), one-shot flag reset — the exact bug shape
    const r2 = (await call({}, undefined)) as Record<string, unknown>;
    expect(r2.executedTool).toBe('latch_probe_tool');
    expect(generate).not.toHaveBeenCalled(); // still suppressed across provider re-entries…
    skipLines = warnSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]') && l.includes('TIER-2'));
    expect(skipLines).toHaveLength(0); // …and step 2 adds ZERO lines (one-shot consumed in pass 1, no transition since — silence is the contract; gate-5 fix 30.10: empty record after mockClear pins it directly)
  });

  it('TIER-2 regression: latch CLEAR + threshold crossed → the gate fires EXACTLY as before this arc (behavior parity)', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { guard, generate } = makeGuard(async () => ({ task_description: 't' }) as never);
    setContextGuard(guard);
    mockPersist.mockResolvedValue({ saved: true });

    TokenStatsManager.setTurnEvaluation(57600, LIMIT); // 90% line crossed
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));
    expect(TokenStatsManager.getUnrecoverableWindow()).toBe(false); // default-clear state

    const call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call({}, undefined);

    expect(generate).toHaveBeenCalledTimes(1); // the arc changed NOTHING on healthy turns…
    expect(mockPersist).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls.map((c) => String(c[0])).some((l) => l.includes('[LATCH-UNRECOVERABLE]'))).toBe(false); // …no new lines anywhere
  });

  it('FIX B: latch SET + 95% crossed → compressMidLoop NEVER called, one FAIL-LOUD skip line; latch CLEAR → full pipeline runs', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Guard with compressMidLoop (FIX B surface) but NO generateSessionContinuity → TIER-2's typeof gate stays inert.
    const compressMidLoop = jest.fn(async () => ({ compressed: true, messages: makeTurnMessages(5) }));
    const countTokens = jest.fn(async () => 1000);
    const fixbGuard = { compressMidLoop, countTokens } as unknown as Record<string, unknown>;

    TokenStatsManager.setTurnEvaluation(Math.round(LIMIT * 0.96), LIMIT); // above the 95% pre-emptive line (PREEMPTIVE_COMPRESSION_PERCENT)
    TokenStatsManager.setTurnMessages(makeTurnMessages(20));

    // LATCH SET — suppression pin:
    setContextGuard(fixbGuard);
    TokenStatsManager.setUnrecoverableWindow(Math.round(LIMIT * 1.0), LIMIT);
    let call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT });
    await call({}, undefined);
    expect(compressMidLoop).not.toHaveBeenCalled(); // the up-to-60s no-op pipeline is gone…
    const fixbSkips = warnSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]') && l.includes('FIX B'));
    expect(fixbSkips).toHaveLength(1); // …with the one-shot FAIL-LOUD line

    resetForcedSaveFlagForTests(); // next model step — still suppressed, still silent
    await call({}, undefined);
    expect(compressMidLoop).not.toHaveBeenCalled();
    const fixbSkips2 = warnSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('[LATCH-UNRECOVERABLE]') && l.includes('FIX B'));
    expect(fixbSkips2).toHaveLength(1);

    // LATCH CLEARED (PART B recounted below threshold / chat reset) — same state must run the full pipeline again:
    TokenStatsManager.clearUnrecoverableWindow();
    resetForcedSaveFlagForTests();
    call = await getProbeImplementation({ guardEnabled: true, percent: PERCENT }); // fresh provider entry
    await call({}, undefined);
    expect(compressMidLoop).toHaveBeenCalledTimes(1); // re-armed after the latch cleared — no sticky suppression
  });
});
