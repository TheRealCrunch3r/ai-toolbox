/**
 * Tool-Definition Overhead Estimator (src/toolOverhead.ts) — hermetic unit suite.
 *
 * Class B of the 10.11 TOKEN-DIVERGENCE arc: tools exposing a LIVE zod schema must be credited at
 * their WIRE-SHAPE size ({name, description, parameters: z2js(schema)}) — the same zod-to-json-schema
 * chain + `parametersSchema ?? parameters` key convention the host meter counts (wire_harness.cjs /
 * @lmstudio/sdk) — while plain-object tool variants keep the legacy full-JSON.stringify credit.
 * The module-level signature cache must make repeated reports O(1).
 *
 * House-style notes:
 * - jest.mock('zod-to-json-schema') mirrors browserAutomationTools.test.ts (external dep mocked for
 *   determinism — unit tests never run real schema conversion; the REAL chain is covered by the wire harness).
 * - No resetModules idiom exists in this repo, so module-level state (cachedChars/hasCache) is isolated by
 *   reporting a DISTINCT tool name per test: fresh signature → guaranteed recompute. The cache-hit test
 *   below intentionally repeats one signature.
 */

jest.mock('zod-to-json-schema', () => ({
  zodToJsonSchema: jest.fn(),
}));

import { reportToolSchemas, getToolOverheadChars } from '../src/toolOverhead';
import { zodToJsonSchema } from 'zod-to-json-schema';

const z2js = zodToJsonSchema as unknown as jest.Mock;

/** Minimal live-zod duck: what toolsProvider entries carry (SDK stores params as live root ZodObject). */
function fakeLiveZod(): Record<string, unknown> {
  return {
    parse: (v: unknown) => v,
    safeParse: (v: unknown) => ({ success: true, data: v }),
    _def: {},
  };
}

describe('toolOverhead — Class B wire-shape credit', () => {
  beforeEach(() => {
    z2js.mockReset();
  });

  it('credits a live-zod tool at WIRE shape only, via the same z2js call chain as the host meter', () => {
    const schemaOut = { type: 'object' as const, properties: { q: { type: 'string' } }, required: ['q'] };
    z2js.mockReturnValue(schemaOut);

    const tool = {
      name: 'wire_tool_a',
      description: 'desc a',
      parametersSchema: fakeLiveZod(),
      legacyInternalProp: 'x'.repeat(500), // must NOT ride in the credited span (z2js output replaces it)
    };
    reportToolSchemas([tool]);

    const expected = JSON.stringify({ name: 'wire_tool_a', description: 'desc a', parameters: schemaOut }).length;
    expect(getToolOverheadChars()).toBe(expected);

    // The host-mirrored chain: z2js called exactly once, on the LIVE SCHEMA object itself.
    expect(z2js).toHaveBeenCalledTimes(1);
    expect(z2js.mock.calls[0][0]).toBe(tool.parametersSchema);

    // The wire shape is strictly SMALLER than what legacy full-JSON.stringify would have credited —
    // that delta IS the Class B fix. EXACT pin (verified in Node): both sides are closed fixtures, so
    // 600 − 130 = 470 is stable. The 500-char internal prop dominates, but the ~90 chars of mock JSON-
    // schema text credited on the wire side bring it below a naive "≥ 500".
    const legacyCredit = JSON.stringify(tool).length;
    expect(legacyCredit - expected).toBe(470);
  });

  it('uses the `parameters` key when parametersSchema is absent (host key convention: parametersSchema ?? parameters)', () => {
    z2js.mockReturnValue({ type: 'object' as const });
    const schema = fakeLiveZod();
    reportToolSchemas([{ name: 'wire_tool_b', description: 'd', parameters: schema }]);

    expect(z2js).toHaveBeenCalledTimes(1);
    expect(z2js.mock.calls[0][0]).toBe(schema); // the `parameters` object, not undefined/other entry field
  });

  it('keeps legacy full-JSON credit for plain-object tools (no live schema) — pre-Class-B behavior preserved', () => {
    z2js.mockReturnValue({ type: 'object' as const });
    const tool = { name: 'plain_tool_c', description: 'd', parameters: { type: 'object', properties: {} } };

    reportToolSchemas([tool]);

    expect(getToolOverheadChars()).toBe(JSON.stringify(tool).length); // exact legacy parity pin
    expect(z2js).not.toHaveBeenCalled();                              // never touches the z2js chain for plain objects
  });

  it('skips non-serializable entries instead of breaking reporting (never-break-provider contract)', () => {
    const cyclic: Record<string, unknown> = { name: 'cyclic_tool_d', description: 'd' };
    cyclic.self = cyclic; // JSON.stringify(cyclic) throws → must be skipped silently

    const okEntry = { name: 'ok_tool_e', description: '' };
    reportToolSchemas([cyclic, okEntry]);

    // Cyclic entry skipped (0 chars) + plain-object entry keeps its FULL legacy stringify credit.
    expect(getToolOverheadChars()).toBe(JSON.stringify(okEntry).length);
  });

  it('credits a live-zod tool with missing description/name as the minimal wire shape (no empty-string keys)', () => {
    z2js.mockReturnValue(undefined); // z2js may yield undefined-ish output for edge schemas → no parameters key
    const schema = fakeLiveZod();

    reportToolSchemas([{ name: 'sparse_tool_f', description: '', parametersSchema: schema }]);

    expect(getToolOverheadChars()).toBe(JSON.stringify({ name: 'sparse_tool_f' }).length);
  });
});

describe('toolOverhead — signature cache (O(1) repeat reports)', () => {
  it('recomputes once per distinct tool set; repeat reports are O(1) cache hits', () => {
    // Getter on `name` is an instrumentation hook. EVERY report rebuilds the cheap name signature
    // (+1 read per instrumented entry) BEFORE any cache check; a full recompute reads it exactly ONE
    // more time — when legacyChars JSON.stringify serializes the entry (both counts verified in Node).
    const t1: Record<string, unknown> = {};
    let nameReads = 0;
    // enumerable: true is REQUIRED — JSON.stringify only invokes getters of ENUMERABLE properties.
    Object.defineProperty(t1, 'name', { get: () => { nameReads++; return 'cache_tool_g'; }, enumerable: true });
    t1.description = 'd'; // plain value — not instrumented

    reportToolSchemas([t1]);
    expect(getToolOverheadChars()).toBe(JSON.stringify({ name: 'cache_tool_g', description: 'd' }).length);
    expect(nameReads).toBe(2); // full recompute ran (signature + legacy stringify)

    reportToolSchemas([t1]); // identical signature → cache hit
    expect(getToolOverheadChars()).toBe(JSON.stringify({ name: 'cache_tool_g', description: 'd' }).length);
    expect(nameReads).toBe(3); // +1 = signature rebuild/comparison only — the char recompute did NOT run

    // Changed tool set (distinct name) → one more full pass is forced; the NEW plain entry proves it,
    // because a stale cache would still report the previous (different-length) credit.
    const t2 = { name: 'cache_tool_g2', description: 'd' }; // 13-char name vs 12 — different wire size
    reportToolSchemas([t2]);
    expect(nameReads).toBe(3); // +0 — signature rebuild reads only t2's PLAIN name (not instrumented)…
    expect(getToolOverheadChars()).toBe(JSON.stringify(t2).length); // …yet a recompute provably happened (different-length credit)
  });
});
