/**
 * Context Usage Footer (02.10; trigger surface widened 03.10 per option B) — LLM-side limit awareness
 *
 * Part 1 — contract tests for buildContextUsageFooter (pure formatter in
 * src/utils/contextUsageFooter.ts): gate behavior at 50% (owner decision),
 * format A rendering, the >=90% near-limit escalation, and suppression when
 * usage/limit data is unavailable (no-misleading-numbers rule).
 *
 * Part 2 — wrapper integration through the REAL toolsProvider pipeline with a fake probe tool:
 * the 02.10 string-append form stays byte-exact; the 03.10 additive `ctx_footer` field lands on
 * plain-object results exactly when gated (and only there). See jest.mock below for how ONE
 * registration module is replaced so no real tool implementation ever runs.
 */
import {
  buildContextUsageFooter,
  DEFAULT_FOOTER_MIN_PERCENT,
  NEAR_LIMIT_PERCENT,
  FOOTER_TOKEN_ESTIMATE,
  CONTEXT_USAGE_FOOTER_MARKER,
} from '../src/utils/contextUsageFooter.js';
import { toolsProvider, resetFooterSuppressionWarnForTests } from '../src/toolsProvider.js';
import { TokenStatsManager, estimateTokensFromChars } from '../src/tokenStatsManager.js';
import { DEFAULT_CONFIG } from '../src/config.js';

// Fake implementation surface for the wrapper-integration part: replace ONE registration module so the
// probe tool is the only real implementation that can run (hermetic; no fs/network side effects). The
// factory returns a single tool whose plain-object envelope we fully control. The exported registration
// function is a jest.fn() so individual tests can swap what it yields via mockImplementationOnce — a
// one-shot override that can never leak into the next test's provider run.
const DEFAULT_PROBE_TOOL = {
  name: 'ctx_footer_probe_tool',
  description: 'Test-only probe for CTX-FOOTER wrapper integration (fake, no side effects).',
  parameters: { type: 'object', properties: {} },
} as const;

// Registry-ID identity (03.10 re-gate fix): the request string MUST map to tests/__mocks__/textProcessingTools.ts —
// the SAME module ID toolsProvider's static import './tools/textProcessingTools.js' resolves to under Jest (explicit
// moduleNameMapper entry in jest.config.cjs). A '../src/tools/...' specifier would register this factory on a DIFFERENT
// module ID that nothing in the provider graph loads → probe never registers, and every test below fails silently at
// expect(probe).toBeDefined() because the manual stub returns an (implementation-less) tool array without throwing.
jest.mock('./__mocks__/textProcessingTools.js', () => ({
  registerTextProcessingTools: jest.fn((): Array<Record<string, unknown>> => [
    { ...DEFAULT_PROBE_TOOL, implementation: async (): Promise<Record<string, unknown>> => ({ success: true, data: 'probe' }) },
  ]),
}));

// Handle to the mocked registration function (plain factory module object — no deep-mock proxy needed).
const mockTextProcessingTools = require('./__mocks__/textProcessingTools.js') as {
  registerTextProcessingTools: jest.Mock;
};

/** One-shot swap of what the probe tool returns, consumed by the NEXT provider run in this test. */
function stubProbeImplementation(implementation: (...args: unknown[]) => Promise<unknown>): void {
  mockTextProcessingTools.registerTextProcessingTools.mockImplementationOnce(() => [
    { ...DEFAULT_PROBE_TOOL, implementation },
  ]);
}

describe('buildContextUsageFooter', () => {
  describe('50% gate (owner decision: append when usage crosses 50%)', () => {
    it('defaults to a 50% gate constant', () => {
      expect(DEFAULT_FOOTER_MIN_PERCENT).toBe(50);
    });

    it('is silent below the gate', () => {
      // 3136/64000 = 49% — no footer, by design (below-gate turns pay zero tokens)
      expect(buildContextUsageFooter(3136, 64000)).toBeUndefined();
    });

    it('appears exactly at the gate (inclusive)', () => {
      // 32000/64000 = 50% — boundary is inclusive ("crosses" implemented as >=)
      expect(buildContextUsageFooter(32000, 64000)).toBe('[ctx ~32k/64k = 50%]');
    });

    it('respects a custom gate (e.g. always-on with minPercent=0)', () => {
      expect(buildContextUsageFooter(950, 64000, 0)).toBe('[ctx ~950/64k = 1%]');
      expect(buildContextUsageFooter(950, 64000, 2)).toBeUndefined();
    });
  });

  describe('format A rendering', () => {
    it('renders fractional thousands with one decimal and the estimate tilde on usage only', () => {
      // 48320/64000 = 75.5% -> rounds to 76%
      expect(buildContextUsageFooter(48320, 64000)).toBe('[ctx ~48.3k/64k = 76%]');
    });

    it('drops the trailing .0 for whole thousands', () => {
      expect(buildContextUsageFooter(51200, 64000)).toBe('[ctx ~51.2k/64k = 80%]');
      // limit side: 65536 -> 65.5k (both operands truncated identically at toFixed(1))
      expect(buildContextUsageFooter(65536, 65536)).toContain('/65.5k = 100%');
    });

    it('renders sub-1k values as plain integers', () => {
      // 800/1600 = 50% exactly; used < 1000 -> no k, limit >= 1000 -> k
      expect(buildContextUsageFooter(800, 1600)).toBe('[ctx ~800/1.6k = 50%]');
    });

    it('rounds the percentage to the nearest integer', () => {
      // 49999/64000 = 78.12% -> 78%; 50000/64000 = 78.12...% boundary sanity
      expect(buildContextUsageFooter(49999, 64000)).toContain('= 78%');
      // 3137/64000 = 49.02% -> 49% (still below gate: undefined)
      expect(buildContextUsageFooter(3137, 64000)).toBeUndefined();
    });

    it('starts every footer with the stable marker', () => {
      for (const used of [32000, 48320, 57600, 99999]) {
        const footer = buildContextUsageFooter(used, 64000);
        expect(footer).toBeDefined();
        expect(footer!.startsWith(CONTEXT_USAGE_FOOTER_MARKER)).toBe(true);
      }
    });

    it('keeps the base format within its ~10-token budget in characters', () => {
      // [ctx ~48.3k/64k = 76%] — bounded length so per-call overhead stays minimal;
      // assert on char count (token claims are calibrated, not testable here).
      const footer = buildContextUsageFooter(48320, 64000)!;
      expect(footer.length).toBeLessThanOrEqual(32);
    });
  });

  describe('near-limit escalation (>=90%)', () => {
    it('adds the advisory exactly at the escalation boundary', () => {
      // 57600/64000 = 90% — NEAR_LIMIT_PERCENT is inclusive
      expect(NEAR_LIMIT_PERCENT).toBe(90);
      const footer = buildContextUsageFooter(57600, 64000);
      expect(footer).toBe('[ctx ~57.6k/64k = 90% | NEAR LIMIT - prefer small reads; wrap up if done]');
    });

    it('keeps the advisory for all higher readings', () => {
      const footer = buildContextUsageFooter(61440, 64000); // 96%
      expect(footer).toContain('= 96% | NEAR LIMIT - prefer small reads; wrap up if done]');
    });

    it('shows over-limit readings unclamped (honest past-the-window signal)', () => {
      const footer = buildContextUsageFooter(68000, 64000); // 106%
      expect(footer).toContain('= 106% | NEAR LIMIT');
    });

    it('omits the advisory between gate and escalation', () => {
      const footer = buildContextUsageFooter(51200, 64000); // 80%
      expect(footer).not.toContain('NEAR LIMIT');
    });

    it('keeps brackets balanced in both branches (regression: missing ] fix)', () => {
      for (const used of [32000, 57600, 99999]) {
        const footer = buildContextUsageFooter(used, 64000)!;
        expect(footer.startsWith('[') && footer.endsWith(']')).toBe(true);
      }
    });
  });

  describe('suppression — no misleading numbers (baseline/limit unavailable)', () => {
    it('returns undefined when the limit is unknown or non-positive', () => {
      expect(buildContextUsageFooter(40000, 0)).toBeUndefined();
      expect(buildContextUsageFooter(40000, -64000)).toBeUndefined();
    });

    it('returns undefined on non-finite inputs (NaN/Infinity from failed counting)', () => {
      expect(buildContextUsageFooter(Number.NaN, 64000)).toBeUndefined();
      expect(buildContextUsageFooter(48000, Number.POSITIVE_INFINITY)).toBeUndefined();
      expect(buildContextUsageFooter(Number.NEGATIVE_INFINITY, 64000)).toBeUndefined();
    });

    it('returns undefined on negative usage', () => {
      expect(buildContextUsageFooter(-5, 64000)).toBeUndefined();
    });
  });

  describe('self-size accounting constant', () => {
    it('exports a finite positive self-size estimate for the caller projection', () => {
      // The wrapper adds FOOTER_TOKEN_ESTIMATE to its projected delta so the gate
      // decision accounts for the footer's own cost; it must be sane.
      expect(Number.isFinite(FOOTER_TOKEN_ESTIMATE)).toBe(true);
      expect(FOOTER_TOKEN_ESTIMATE).toBeGreaterThan(0);
      expect(FOOTER_TOKEN_ESTIMATE).toBeLessThan(100);
    });
  });
});

// ==================== Wrapper integration through the REAL toolsProvider pipeline (02.10 form + 03.10 option B) ====================
// Drives the ACTUAL instrumentation wrapper (src/toolsProvider.ts) end-to-end with the fake probe tool above:
// gate math, payload self-sizing and both footer forms are asserted on what the model would literally see.
describe('toolsProvider CTX-FOOTER wrapper integration', () => {
  const LIMIT = 64000; // tokens — mirrors the 64k window used across this suite's formatter table

  function createHermeticController(contextUsageFooter: boolean): unknown {
    // Everything OFF except textProcessing (the mocked family) + the feature toggle under test —
    // hermetic registration: no real tool implementation is ever constructed or invoked.
    const base: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      base[key] = false;
    }
    base.textProcessing = true;
    base.contextUsageFooter = contextUsageFooter;
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
    } as any;
  }

  async function getProbeImplementation(contextUsageFooter: boolean): Promise<(...args: unknown[]) => Promise<unknown>> {
    const tools = await toolsProvider(createHermeticController(contextUsageFooter) as never);
    const probe = tools.find((t) => (t as { name?: string }).name === 'ctx_footer_probe_tool');
    expect(probe).toBeDefined();
    return (probe as unknown as { implementation: (...args: unknown[]) => Promise<unknown> }).implementation;
  }

  beforeEach(() => {
    // Fresh turn state per test — no baseline/limit/delta leaks between cases or into other suites.
    TokenStatsManager.resetMidLoopDelta();
  });

  afterEach(() => {
    TokenStatsManager.clearActiveToolCallsForTests();
  });

  describe('string form (02.10 regression — byte-exact)', () => {
    it('appends the footer exactly once to gated string results', async () => {
      // Fake implementation temporarily returning a raw string (no registered ai_toolbox tool does today —
      // this pins the 02.10 append form, which the wrapper still owns).
      stubProbeImplementation(async () => 'hello world');

      TokenStatsManager.setTurnEvaluation(32000, LIMIT); // exactly 50% — inclusive gate
      const call = await getProbeImplementation(true);
      const result = (await call({}, undefined)) as string;
      expect(typeof result).toBe('string');
      const payloadChars = 'hello world'.length;
      const projected = 32000 + estimateTokensFromChars(payloadChars) + FOOTER_TOKEN_ESTIMATE;
      expect(result.endsWith(`\n\n${buildContextUsageFooter(projected, LIMIT)}`)).toBe(true);
      // Appended exactly once — never doubled by re-entry or a second pass.
      const occurrences = (result.match(/\[ctx /g) ?? []).length;
      expect(occurrences).toBe(1);
    });

    it('leaves below-gate string results byte-identical', async () => {
      stubProbeImplementation(async () => 'tiny');

      TokenStatsManager.setTurnEvaluation(100, LIMIT); // ~0.2% — far below the 50% gate
      const call = await getProbeImplementation(true);
      expect(await call({}, undefined)).toBe('tiny');
    });
  });

  describe('object form (03.10 option B — additive ctx_footer field)', () => {
    it('adds ctx_footer with the same message when gated, alongside the executedTool stamp', async () => {
      TokenStatsManager.setTurnEvaluation(48320, LIMIT); // 75.5% → over the gate, below escalation
      const call = await getProbeImplementation(true);
      const result = (await call({}, undefined)) as Record<string, unknown>;
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype); // still a plain object after both stamps

      const payloadChars = JSON.stringify({ success: true, data: 'probe' }).length;
      const projected = 48320 + estimateTokensFromChars(payloadChars) + FOOTER_TOKEN_ESTIMATE;
      expect(projected / LIMIT).toBeGreaterThan(0.5); // sanity: this case really is above the gate

      expect(result.ctx_footer).toBeDefined();
      expect(typeof result.ctx_footer).toBe('string');
      expect(result.ctx_footer as string).toMatch(/^\[ctx ~\d+(\.\d)?k\/64k = \d+%\]$/);
      expect(result.ctx_footer).toBe(buildContextUsageFooter(projected, LIMIT)); // identical message to the string form
      expect((result as Record<string, unknown>).executedTool).toBe('ctx_footer_probe_tool'); // stamp coexists
    });

    it('adds NO ctx_footer below the gate (zero-token cost for quiet turns)', async () => {
      TokenStatsManager.setTurnEvaluation(100, LIMIT);
      const call = await getProbeImplementation(true);
      const result = (await call({}, undefined)) as Record<string, unknown>;
      expect(result.ctx_footer).toBeUndefined();
      expect(result.executedTool).toBe('ctx_footer_probe_tool'); // the stamp itself is still additive + independent
    });

    it('adds NO ctx_footer when no turn baseline was published (baseline === 0 — no-misleading-numbers rule)', async () => {
      // resetMidLoopDelta() in beforeEach left turnBaseline at 0 — exactly the pre-preprocess() state.
      const call = await getProbeImplementation(true);
      const result = (await call({}, undefined)) as Record<string, unknown>;
      expect(result.ctx_footer).toBeUndefined();
    });

    // Fail-loud pin for the 03.10 publish-skip incident (record ctx_1791025835710): a suppressed footer is now
    // self-evidencing in the log — exactly ONE warn per suppression window, results byte-identical. The flag
    // under test is module state in toolsProvider.ts; beforeEach/afterEach re-arm it via the exported hook so
    // this describe's assertions are order-independent (same house pattern as clearActiveToolCallsForTests).
    describe('suppression visibility — fail-loud warn (03.10 incident pin)', () => {
      // LIVE spy reference, not a snapshot: mock.calls must be filtered at ASSERTION time — capturing
      // a filtered copy in beforeEach would always yield [] because no tool call has run yet.
      let warnSpy: jest.SpyInstance;

      /** Suppression warns captured so far (both markers — immune to other log noise). */
      const suppressedWarns = () =>
        warnSpy.mock.calls.filter(
          (c) => String(c[0]).includes('[CTX-FOOTER]') && String(c[0]).includes('suppressed'),
        );

      beforeEach(() => {
        resetFooterSuppressionWarnForTests(); // fresh suppression window per test, regardless of case order
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      });

      afterEach(() => {
        jest.restoreAllMocks(); // release the console.warn spy (probe-tool jest.fn() state is per-test by design)
        resetFooterSuppressionWarnForTests();
      });

      it('warns exactly ONCE when the turn baseline was never published — window stays quiet afterwards', async () => {
        // No setTurnEvaluation after the suite-level beforeEach resetMidLoopDelta(): the exact state left behind
        // by a preprocess() run whose single publish point (setTurnEvaluation) never executed.
        const call = await getProbeImplementation(true);
        const r1 = (await call({}, undefined)) as Record<string, unknown>;
        expect(r1.ctx_footer).toBeUndefined(); // behavior unchanged — suppression itself is still silent on the payload
        let msgs = suppressedWarns().map((c) => c[0]);
        expect(msgs).toHaveLength(1);
        expect(String(msgs[0])).toContain('turn baseline not published');

        const r2 = (await call({}, undefined)) as Record<string, unknown>; // same window, second result…
        expect(r2.ctx_footer).toBeUndefined();
        msgs = suppressedWarns().map((c) => c[0]);
        expect(msgs).toHaveLength(1); // …and the warn must NOT repeat — one per window, never spam

        TokenStatsManager.setTurnEvaluation(48320, LIMIT); // publish arrives mid-window…
        const r3 = (await call({}, undefined)) as Record<string, unknown>;
        expect(r3.ctx_footer).toBeDefined(); // …footer back on the very next result — no sticky suppression
      });

      it('re-arms after a live-baseline turn: a LATER publish-skip warns fresh', async () => {
        TokenStatsManager.setTurnEvaluation(48320, LIMIT); // 75.5% — above gate; this pass re-arms the flag via the live branch
        const call = await getProbeImplementation(true);
        expect(((await call({}, undefined)) as Record<string, unknown>).ctx_footer).toBeDefined();

        TokenStatsManager.resetMidLoopDelta(); // next preprocess() reset without a republish — new suppression window
        const r2 = (await call({}, undefined)) as Record<string, unknown>;
        expect(r2.ctx_footer).toBeUndefined();
        const msgs = suppressedWarns().map((c) => c[0]);
        expect(msgs).toHaveLength(1); // the re-armed window warns exactly once on its own
      });
    });

    it('adds NO ctx_footer when the feature toggle is off', async () => {
      TokenStatsManager.setTurnEvaluation(48320, LIMIT);
      const call = await getProbeImplementation(false);
      const result = (await call({}, undefined)) as Record<string, unknown>;
      expect(result.ctx_footer).toBeUndefined();
    });

    it('includes the near-limit advisory in ctx_footer at >=90%', async () => {
      TokenStatsManager.setTurnEvaluation(57600, LIMIT); // exactly 90% → escalation clause (inclusive boundary)
      const call = await getProbeImplementation(true);
      const result = (await call({}, undefined)) as Record<string, unknown>;
      expect(result.ctx_footer).toContain('NEAR LIMIT - prefer small reads; wrap up if done');
    });

    it('never clobbers an implementation-owned ctx_footer value', async () => {
      stubProbeImplementation(async () => ({ success: true, ctx_footer: 'tool-owned' }));

      TokenStatsManager.setTurnEvaluation(48320, LIMIT);
      const call = await getProbeImplementation(true);
      const result = (await call({}, undefined)) as Record<string, unknown>;
      expect(result.ctx_footer).toBe('tool-owned'); // tool value wins — wrapper never overwrites existing keys
    });

    it('records the post-footer payload size in the mid-loop delta (guard sees what enters context)', async () => {
      TokenStatsManager.setTurnEvaluation(48320, LIMIT);
      const call = await getProbeImplementation(true);
      await call({}, undefined);
      // measurePayloadChars (JSON) on {success:true,data:'probe',ctx_footer:<footer>} — the footer must be inside.
      expect(TokenStatsManager.getMidLoopDeltaChars()).toBeGreaterThan(JSON.stringify({ success: true, data: 'probe' }).length);
    });

    it('leaves arrays and class instances byte-identical (non-plain objects pass through untouched)', async () => {
      for (const value of [
        ['a', 'b'], // array — excluded by the !Array.isArray check
        new Date(), // class instance — excluded by the prototype check
        42, // number — not an object at all
        null, // null — explicitly guarded
      ]) {
        stubProbeImplementation(async () => value);

        TokenStatsManager.setTurnEvaluation(48320, LIMIT); // far above the gate — any mutation would be visible
        const call = await getProbeImplementation(true);
        const result = (await call({}, undefined)) as unknown;
        if (value === null) {
          expect(result).toBeNull();
        } else {
          expect(Object.getPrototypeOf(result)).not.toBe(Object.prototype); // no executedTool stamp either
          expect((result as Record<string, unknown>).ctx_footer).toBeUndefined();
        }
      }
    });
  });
});
