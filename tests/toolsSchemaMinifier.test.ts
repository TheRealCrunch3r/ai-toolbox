/**
 * Lever 1 (08.10 wire-payload arc) — property-level describe truncation in src/toolsSchemaMinifier.ts.
 *
 * Pins BOTH parameter shapes that reach minifyTools() at registration time:
 *   A) per-field Zod v3 instances (`parameters: { field: z.string().describe(...) }`) — the live shape used by
 *      every tool module (verified 08.10; no zodToJsonSchema call exists in src/, the host serializes to JSON
 *      Schema at registration from the SAME instance, so truncating `_def.description` on it is what lands on the
 *      wire — `.description` itself is getter-only on ZodType.prototype and cannot be assigned (zod ^3.25));
 *   B) serialized JSON Schema objects (`parameters: { type:'object', properties: { field: { description } } }`).
 *
 * Assertions are deterministic against truncateDescription()'s exact cut contract (shared with tool-level
 * truncation): hard cut at the cap + '...' when no sentence boundary exists in [cap-20, cap+50), otherwise cut
 * AT the first '. ' boundary inside that window. Validation behavior is pinned to be untouched: parses before
 * and after minification give identical accept/reject results, and idempotency pins safe re-registration of
 * shared module-level schemas (second pass changes nothing).
 */
import { z } from 'zod';
import type { Tool } from '@lmstudio/sdk';
import { minifyTools } from '../src/toolsSchemaMinifier';

// 120 chars, NO '. ' and NO '\n' anywhere → fallback hard cut: substring(0,80) + '...' = exactly 83.
const HARD_120 = 'a'.repeat(70) + 'b'.repeat(50);
// 121 chars with '. ' at index 75 (inside the [60,130) boundary window) → cut AT the period: length 76.
const PERIOD_121 = 'p'.repeat(75) + '. ' + 'q'.repeat(44);

function asTool(name: string, parameters: Record<string, unknown>, description?: string): Tool {
  return (description !== undefined
    ? { name, description, parameters }
    : { name, parameters }) as unknown as Tool;
}

describe('minifyTools — property-level describe truncation (Lever 1, 08.10)', () => {
  it('truncates per-field Zod describes IN PLACE on the live instance (host-serialization path) and keeps validation intact', () => {
    const target = z.string().describe(HARD_120);
    const tools = [asTool('t_zod_hard', { target })];

    minifyTools(tools);

    // In-place: the SAME module-level instance carries the truncated description (this is what reaches the wire).
    expect(target.description).toHaveLength(83); // 80-char hard cut + '...'
    expect(target.description).toBe('a'.repeat(70) + 'b'.repeat(10) + '...');
    // Validation untouched — accepts and rejects exactly as before.
    expect(target.parse('ok')).toBe('ok');
    expect(() => target.parse(null)).toThrow();
  });

  it('cuts at the sentence boundary for Zod describes (shared truncateDescription contract)', () => {
    const flag = z.boolean().describe(PERIOD_121);
    minifyTools([asTool('t_zod_period', { flag })]);

    expect(flag.description).toHaveLength(76); // cut AT the '. ' boundary found at index 75 → substring(0,76)
    expect(flag.description.endsWith('.')).toBe(true);
    expect(flag.description.endsWith('...')).toBe(false);
    expect(flag.parse(true)).toBe(true);
  });

  it('truncates describes on optional-wrapped Zod fields and keeps accept/reject behavior', () => {
    const opt = z.number().optional().describe(HARD_120);
    minifyTools([asTool('t_zod_optional', { opt })]);

    expect(opt.description).toHaveLength(83);
    // Optional semantics preserved: undefined accepted, non-number rejected.
    expect(opt.parse(undefined)).toBeUndefined();
    expect(opt.safeParse('x').success).toBe(false);
  });

  it('truncates describes on effect-wrapped Zod fields (refine) without altering the refinement', () => {
    const eff = z.string().refine((v) => v.length > 0).describe(PERIOD_121);
    minifyTools([asTool('t_zod_effects', { eff })]);

    expect(eff.description).toHaveLength(76);
    expect(eff.safeParse('').success).toBe(false); // refinement still enforced
    expect(eff.safeParse('abc').success).toBe(true);
  });

  it('truncates describes in serialized JSON Schema parameters (properties + items recursion)', () => {
    const short = 'short description stays';
    const jsonTool = asTool('t_json', {
      type: 'object',
      properties: {
        hard: { type: 'string', description: HARD_120 },
        period: { type: 'string', description: PERIOD_121 },
        shortDesc: { type: 'string', description: short },
        arr: { type: 'array', items: { type: 'string', description: HARD_120 } },
      },
    });

    minifyTools([jsonTool]);

    const params = (jsonTool.parameters as Record<string, unknown>).properties as Record<
      string,
      Record<string, unknown>
    >;
    expect((params.hard.description as string)).toHaveLength(83);
    expect((params.period.description as string)).toHaveLength(76);
    expect(params.shortDesc.description).toBe(short); // ≤ 80 chars → untouched
    const items = (params.arr.items as Record<string, unknown>).description;
    expect(items as string).toHaveLength(83); // nested array item describes reach the walk too
  });

  it('is idempotent — a second minifyTools() pass changes nothing', () => {
    // zod ^3.25 .describe() CLONES _def (verified) → each round below gets its own def object, exactly like the
    // shared-module case where one original long string is re-minified across registrations: deterministic cut.
    const mkLive = () => z.string().describe(HARD_120);
    let live = mkLive();
    const jsonTool = asTool('t_idem', { type: 'object', properties: { x: { type: 'string', description: PERIOD_121 } } });

    minifyTools([asTool('t_a', { live }), jsonTool]);
    const afterFirstZod = live.description;
    const paramsAfterFirst = (jsonTool.parameters as Record<string, unknown>).properties as Record<
      string,
      Record<string, unknown>
    >;

    live = mkLive(); // fresh def per .describe() — identical ORIGINAL input to round one (re-registration)
    minifyTools([asTool('t_a', { live }), jsonTool]);

    expect(live.description).toBe(afterFirstZod);
    const paramsAfterSecond = (jsonTool.parameters as Record<string, unknown>).properties as Record<
      string,
      Record<string, unknown>
    >;
    for (const key of Object.keys(paramsAfterFirst)) {
      expect(paramsAfterSecond[key]).toEqual(paramsAfterFirst[key]); // deep-equal per field: byte-stable
    }
  });

  it('keeps tool-level description truncation (>200 → ~150) unchanged', () => {
    // Realistic prose (length 203, no '. ' / '\n' in the [130,200) window → deterministic hard cut to exactly 153).
    const longDesc =
      'Run a full project-wide analysis including TypeScript diagnostics, circular dependency detection, ESLint rules, config optimization and import structure analysis across all registered source directories.';
    const tool = asTool('t_tooldesc', {}, longDesc);

    // minifyTools() returns the MINIFIED array (the production registration path — toolsProvider.ts:298):
    // description truncation lands on that copy, not on the caller's original objects.
    const [minified] = minifyTools([tool]);
    expect(tool.description).toBe(longDesc); // original untouched (copy semantics)

    expect(minified.description).not.toBe(longDesc);
    expect(minified.description as string).toHaveLength(153); // 150 hard cut + '...' — exact, not just ≤ 153
  });

  it('keeps the maxLength cap (llama.cpp PR #17381) working on serialized schemas', () => {
    const tool = asTool('t_cap', { type: 'object', properties: { big: { type: 'string', maxLength: 5000 } } });

    // Cap lands on the RETURNED minified copy (production registration path); describes are mutated in place.
    const [minified] = minifyTools([tool]);

    const params = (minified.parameters as Record<string, unknown>).properties as Record<
      string,
      Record<string, unknown>
    >;
    expect(params.big.maxLength).toBe(2000);
  });

  it('truncates describes on nested ZodObject fields and ZodArray element schemas (production z.object / z.array(z.object(...)) params)', () => {
    const objField = z.string().describe(HARD_120); // field INSIDE a per-param z.object shape() record
    const arrItemField = z.number().describe(PERIOD_121); // field inside the array ELEMENT object
    const linesParam = z.object({ start: z.number().int(), note: objField }).optional();
    const filesParam = z.array(z.object({ path: z.string(), size: arrItemField })).describe('f'.repeat(85));

    minifyTools([asTool('t_nested', { lines: linesParam, files: filesParam })]);

    // Same live instances (shape()/type references) now carry the truncated describes.
    expect(objField.description).toHaveLength(83); // z.object shape field — HARD_120 hard cut
    expect(arrItemField.description).toHaveLength(76); // array element object field — boundary cut
    expect(filesParam.description).toHaveLength(83); // ZodArray wrapper's own describe capped too ('f'×85 → 80+'...')
    // Semantics untouched.
    expect(linesParam.parse(undefined)).toBeUndefined(); // optional intact
    expect(filesParam.safeParse(['nope']).success).toBe(false); // element object shape still enforced
  });

  it('truncates describes on union member schemas (z.union — members live in _def.options, zod ^3.25 verified)', () => {
    const first = z.string().describe(HARD_120);
    const second = z.number();
    minifyTools([asTool('t_union', { either: z.union([first, second]) })]);

    expect(first.description).toHaveLength(83); // first member reached via _def.options[0]
    expect((second._def as Record<string, unknown>).description ?? null).toBeNull(); // untouched member def stays clean
  });
});

describe('minifyTools — LIVE root ZodObject (SDK tool() production shape; harness-zero-delta regression, 08.10)', () => {
  // @lmstudio/sdk/dist/index.mjs ~L11353: parametersSchema = z.object(rawShape) → the WHOLE params is ONE live v3
  // ZodObject (no own .type/.properties). The 08.10 wire-harness round measured exactly-zero delta on this shape
  // because the per-entry fallback iterated ctor props without ever opening _def.shape() — these tests pin that the
  // root-Zod pre-check now reaches every field instance end-to-end (forensics memory_1791481751431).
  function asSdkRootTool(name: string, schema: z.ZodType): Tool {
    return { name, parametersSchema: schema } as unknown as Tool;
  }

  it('truncates field describes on a live root ZodObject passed as parametersSchema (host-serialization path)', () => {
    const startField = z.number().int().describe(HARD_120); // depth-1 shape() field → hard cut
    const noteField = z.string().describe(PERIOD_121); // depth-1 shape() field → boundary cut
    const shortField = z.boolean().describe('short field description'); // ≤ 80 chars → untouched
    const nestedSize = z.number().describe(HARD_120); // field INSIDE a nested z.object (via _def.innerType) → hard cut
    const arrItemPath = z.string().describe(PERIOD_121); // field inside z.array(z.object(...)) ELEMENT → boundary cut
    const linesParam = z.object({ path: z.string(), size: nestedSize }).optional();
    const filesParam = z.array(z.object({ path: arrItemPath }));

    const schema = z.object({ start: startField, note: noteField, short: shortField, lines: linesParam, files: filesParam });
    const [minified] = minifyTools([asSdkRootTool('t_sdk_root', schema)]);

    // In-place on the SAME live instances — this is exactly what zodToJsonSchema() serializes onto the wire.
    expect(startField.description).toHaveLength(83);
    expect(noteField.description).toHaveLength(76);
    expect(shortField.description).toBe('short field description'); // ≤ cap → byte-identical
    expect(nestedSize.description).toHaveLength(83); // optional-wrapped nested object reached via innerType
    expect(arrItemPath.description).toHaveLength(76); // array element object fields reached too
    // Pass-through contract: only the tool wrapper is copied; the schema object itself stays live and shared.
    expect(minified.parametersSchema).toBe(schema);
    // Validation semantics untouched by construction (only _def.description values ever mutated).
    const parsed = linesParam.parse({ path: 'x', size: 1 });
    expect(parsed.size).toBe(1);
    expect(schema.safeParse({ start: 'nope' }).success).toBe(false);
    expect(filesParam.safeParse([{ path: 'ok' }]).success).toBe(true);
  });

  it('is idempotent across re-registration of a shared live root ZodObject (second pass byte-stable)', () => {
    const f1 = z.string().describe(HARD_120);
    const schema = z.object({ a: f1, b: z.number() });
    const tool = asSdkRootTool('t_sdk_root_idem', schema);

    minifyTools([tool]);
    const firstPass = f1.description;

    // Re-registration of the SAME shared module-level schema (toolsProvider re-minifies on reload):
    // the second walk must find nothing above the cap and mutate nothing further.
    const [minified2] = minifyTools([tool]);
    expect(f1.description).toBe(firstPass); // byte-stable, no double truncation
    expect(minified2.parametersSchema).toBe(schema);
  });

  it('does not misfire the root-Zod guard on per-field shape records or serialized roots (regression gate)', () => {
    // Plain shape record ({ field: schema }) — the pre-check must stay false so entry-wise handling is unchanged.
    const pf = z.string().describe(HARD_120);
    minifyTools([asTool('t_perfield_gate', { x: pf })]);
    expect(pf.description).toHaveLength(83);

    // Serialized root still takes the serialized-root branch (maxLength cap lands on the returned copy — proof it did
    // NOT take the live-Zod pass-through, which reuses the same object without capping).
    const ser = asTool('t_ser_root_gate', { type: 'object', properties: { big: { type: 'string', maxLength: 5000 } } });
    const [serMin] = minifyTools([ser]);
    const props = (serMin.parameters as Record<string, unknown>).properties as Record<string, Record<string, unknown>>;
    expect(props.big.maxLength).toBe(2000); // cap applied → serialized-root branch was taken
  });
});
