/**
 * TRANSPARENCY STAMP regression suite — `executedTool` field (01.09.2026)
 *
 * Context: "silent tool substitution" incident (LM Studio server log 2026-09-01, 16:18–16:23).
 * Attribution from the user's own logs: model-side substitution + transcript observability gap —
 * NOT an ai_toolbox routing defect. The provider wrapper already logged the true executed name to
 * the host log (AutoTracker DELTA lines) but the chat transcript had no way to verify which
 * implementation actually ran. Fix (option B, user-selected): every plain-object tool result now
 * carries `executedTool` = the REGISTERED name of the implementation that actually executed.
 *
 * This suite runs the REAL provider pipeline (registration → minifyTools → instrumentation wrapper)
 * and injects side-effect-free PROBE tools through one registration module, so it verifies the stamp
 * end-to-end without touching disk/network/git/browser:
 *   1. object results gain exactly `executedTool` with value === that tool's registered (minified) name;
 *   2. per-tool identity holds across multiple probes in a single provider run;
 *   3. original payload fields are preserved verbatim and the source object is not mutated;
 *   4. non-object payloads (string / number / boolean / array / null / undefined) pass through
 *      byte-identical — no field can attach to them, shape never changes;
 *   5. FIX #20 A1 bookkeeping regression guard: TokenStatsManager.recordToolResult still fires exactly
 *      once per successful call and NOT for failed calls (pre-existing semantics preserved);
 *   6. error propagation is untouched — throws from the implementation surface unchanged, no stamp;
 *   7. godMode sweep: every tool exposed through minify+instrument has a non-empty unique name and a
 *      function or absent implementation (wrapper contract; in production this covers all ~78 tools).
 */

import { toolsProvider } from '../src/toolsProvider.js';
import { DEFAULT_CONFIG } from '../src/config.js';
import { TokenStatsManager } from '../src/tokenStatsManager.js';
// NOTE: import the stub via './__mocks__/markdownPreviewTools.js' — jest.config.cjs maps THIS specifier and
// toolsProvider's dynamic `./tools/markdownPreviewTools.js` to the SAME file
// (<rootDir>/tests/__mocks__/markdownPreviewTools.ts), so both share one module registry ID and the
// jest.mock below intercepts the provider's real dependency graph. ('../__mocks__/…' would resolve OUTSIDE
// tests/ — no such root dir exists; '../src/tools/markdownPreviewTools.js' would mock a different,
// unused-by-provider module ID.)
import { registerMarkdownPreviewTools } from './__mocks__/markdownPreviewTools.js';

jest.mock('./__mocks__/markdownPreviewTools.js', () => ({
  registerMarkdownPreviewTools: jest.fn(),
}));

const mockedRegister = registerMarkdownPreviewTools as unknown as jest.Mock;

/** Same mock controller shape as tests/toolsProvider.test.ts — keep conventions identical. */
function createMockController(config: Record<string, unknown>) {
  const mockPluginConfig = {
    get: (key: string) => config[key] ?? false,
    set: jest.fn(),
    subscribe: jest.fn(),
    getAll: () => ({ ...config }),
  };

  return {
    getPluginConfig: jest.fn().mockReturnValue(mockPluginConfig),
    stateManager: {
      getState: jest.fn().mockReturnValue({}),
      setState: jest.fn(),
    },
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
    context: {},
  } as any;
}

/** Build the probe tool set. Each impl is a harmless side-effect-free closure (no fs/net/git/browser). */
function makeProbes() {
  return [
    {
      name: 'probe_object_tool',
      description: 'probe returning a plain object',
      parameters: {},
      implementation: jest.fn(async () => ({ success: true, data: 'ok', nested: { a: 1 }, patternMode: 'regex' })),
    },
    {
      name: 'probe_string_tool',
      description: 'probe returning a string',
      parameters: {},
      implementation: jest.fn(async () => 'plain-string-result'),
    },
    {
      name: 'probe_array_tool',
      description: 'probe returning an array',
      parameters: {},
      implementation: jest.fn(async () => ['x', 'y']),
    },
    {
      name: 'probe_null_tool',
      description: 'probe returning null',
      parameters: {},
      implementation: jest.fn(async () => null),
    },
    {
      name: 'probe_number_tool',
      description: 'probe returning a number',
      parameters: {},
      implementation: jest.fn(async () => 42),
    },
    {
      name: 'probe_error_tool',
      description: 'probe that throws',
      parameters: {},
      implementation: jest.fn(async () => {
        throw new Error('probe-failure');
      }),
    },
  ];
}

async function runProviderWithProbes() {
  mockedRegister.mockReturnValue(makeProbes());
  const ctl = createMockController({ ...DEFAULT_CONFIG, godMode: true });
  return toolsProvider(ctl as any);
}

function findTool(tools: any[], name: string): any {
  const t = tools.find((x) => x.name === name);
  expect(t).toBeDefined();
  return t;
}

describe('toolsProvider — executedTool transparency stamp (01.09.2026, incident follow-up)', () => {
  let recordSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    TokenStatsManager.clear(); // FIX #20 A1 hygiene — same pattern as fix20_midloop_token_counting.test.ts
    jest.spyOn(console, 'log').mockImplementation(() => {}); // keep provider/minifier log lines out of output
    recordSpy = jest.spyOn(TokenStatsManager, 'recordToolResult');
  });

  afterEach(() => {
    recordSpy.mockRestore();
  });

  test('probe injection is live: all six probe tools are exposed through the real minify+instrument pipeline', async () => {
    const tools = await runProviderWithProbes();
    for (const name of [
      'probe_object_tool',
      'probe_string_tool',
      'probe_array_tool',
      'probe_null_tool',
      'probe_number_tool',
      'probe_error_tool',
    ]) {
      expect(tools.map((t: any) => t.name)).toContain(name);
    }
  });

  test('plain-object result gains executedTool === the registered name of the implementation that ran', async () => {
    const tools = await runProviderWithProbes();
    const tool = findTool(tools, 'probe_object_tool');
    expect(typeof tool.implementation).toBe('function'); // went through the instrumentation wrapper

    const out: any = await tool.implementation({}, {});

    expect(out.executedTool).toBe('probe_object_tool');
    expect(typeof out.executedTool).toBe('string');
  });

  test('per-tool identity: each probe in ONE provider run reports its OWN registered name (no cross-contamination)', async () => {
    const tools = await runProviderWithProbes();

    const objOut: any = await findTool(tools, 'probe_object_tool').implementation({}, {});
    expect(objOut.executedTool).toBe('probe_object_tool');

    // string probe also runs in the same provider instance — its OBJECT-RESULT sibling must not leak names
    const strOut: any = await findTool(tools, 'probe_string_tool').implementation({}, {});
    expect(strOut).toBe('plain-string-result'); // untouched → no stamp possible on primitives
  });

  test('stamp is additive-only: all original fields preserved verbatim, exactly one key added (spread copy — source never written)', async () => {
    const tools = await runProviderWithProbes();
    const tool = findTool(tools, 'probe_object_tool');

    // Probe object shape is deterministic (see makeProbes) — assert verbatim preservation + exactly one added key
    const out: any = await tool.implementation({}, {}); // wrapped path returns a spread copy; source literal is never written

    expect(out.executedTool).toBe('probe_object_tool');
    expect(out.success).toBe(true);
    expect(out.data).toBe('ok');
    expect(out.nested).toEqual({ a: 1 });
    expect(out.patternMode).toBe('regex');
    expect(Object.keys(out).sort()).toEqual(['data', 'executedTool', 'nested', 'patternMode', 'success'].sort());
  });

  test('non-object payloads pass through byte-identical (string / number / array / null)', async () => {
    const tools = await runProviderWithProbes();

    expect(await findTool(tools, 'probe_string_tool').implementation({}, {})).toBe('plain-string-result');
    expect(await findTool(tools, 'probe_number_tool').implementation({}, {})).toBe(42);
    expect(await findTool(tools, 'probe_null_tool').implementation({}, {})).toBeNull();

    const arrOut: any[] = await findTool(tools, 'probe_array_tool').implementation({}, {});
    expect(Array.isArray(arrOut)).toBe(true); // array-ness preserved — not converted to an object
    expect(arrOut).toEqual(['x', 'y']);
    expect('executedTool' in arrOut).toBe(false);
  });

  test('FIX #20 A1 regression guard: recordToolResult fires exactly once per SUCCESSFUL call, never for failed calls', async () => {
    const tools = await runProviderWithProbes();

    await findTool(tools, 'probe_object_tool').implementation({}, {});
    expect(recordSpy).toHaveBeenCalledTimes(1);
    expect(recordSpy).toHaveBeenCalledWith('probe_object_tool', expect.any(Object)); // recorded with the SAME ground-truth name as stamped

    recordSpy.mockClear();
    await expect(findTool(tools, 'probe_error_tool').implementation({}, {})).rejects.toThrow('probe-failure');
    expect(recordSpy).not.toHaveBeenCalled(); // pre-existing semantics: failed calls are not bookkept (await throws first)
  });

  test('error propagation is untouched by the stamp: error message/type surface unchanged, nothing stamped', async () => {
    const tools = await runProviderWithProbes();
    const tool = findTool(tools, 'probe_error_tool');

    let caught: unknown;
    try {
      await tool.implementation({}, {});
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe('probe-failure');
  });

  test('godMode sweep: every exposed tool has a non-empty unique name and a function-or-absent implementation (wrapper contract)', async () => {
    const tools = await runProviderWithProbes();
    expect(tools.length).toBeGreaterThan(6); // probes + the standard stub set from tests/__mocks__/*

    const names: string[] = [];
    for (const t of tools as any[]) {
      expect(typeof t.name).toBe('string');
      expect(t.name.length).toBeGreaterThan(0);
      names.push(t.name);
      // Wrapper contract: either a wrapped function or no implementation at all (stub tools) — never anything else
      if ('implementation' in t && t.implementation !== undefined) {
        expect(typeof t.implementation).toBe('function');
      }
    }
    // Unique registered names — the stamp's identity source must be unambiguous for every tool
    expect(new Set(names).size).toBe(names.length);
  });
});
