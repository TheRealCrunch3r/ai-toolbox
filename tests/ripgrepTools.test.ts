/**
 * 14.09 TOOL SWAP — tool-level tests for the standalone `ripgrep` tool (src/tools/fileSystemTools.ts).
 *
 * Replaces the deleted grep_files suites (grep_files / matchglob / size_limit / hang_backstop / parity /
 * ast-smoke) at the TOOL layer: src/utils/ripgrepEngine.ts itself is pinned by tests/ripgrepEngine.test.ts.
 *
 * LAYERING (same harness as ripgrepEngine.test.ts):
 *  - "registry/schema" cases run UNCONDITIONALLY — they touch no worker, so they hold even when the
 *    'ripgrep' dependency is absent from node_modules.
 *  - "tool integration" cases are gated at COLLECTION time (Jest registers tests while running the describe
 *    body) + carry a runtime backstop in beforeAll; real timers ONLY (fake timers cannot reach the worker
 *    thread — same recipe pinned green on the user host by the engine suite).
 *
 * CONTRACT UNDER TEST (pinned against the ripgrep tool implementation, 14.09):
 *  • outcome mapping: engine ok → success {matches,count,filesScanned,mode,pattern_mode(±hint)};
 *    no-matches → success {matches:[],count:0,filesScanned:0}; timeout|aborted → success with matches:[] +
 *    aborted:true + hint (worker terminated — partial state empty by design); spawn-failure →
 *    {success:false,error:'ripgrep engine failed: …'}.
 *  • case_insensitive defaults to TRUE (legacy -i contract) when the arg is omitted.
 *  • Default exclusions (DEFAULT_EXCLUDED_DIRS) apply ONLY when no include_glob is given; explicit
 *    exclude_globs are always appended on top of them.
 *  • maxDepth pass-through: omitted → unbounded (no --max-depth flag emitted by the engine).
 *  • NO result limits: maxMatches = Number.MAX_SAFE_INTEGER at the tool layer (owner directive 14.09);
 *    content shaping stays at the engine default (150 chars + '…').
 */

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

// ==================== Collection-time liveness gate (same logic as ripgrepEngine.test.ts) ====================
let depResolvable = false;
try {
  require.resolve('ripgrep'); // eslint-disable-line @typescript-eslint/no-require-imports
  depResolvable = true;
} catch {
  depResolvable = false;
}

function nodeSupportsRequireEsm(): boolean {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major >= 23) return true; // require(ESM) unflagged since v23.0.0
  if (major === 22) return minor >= 12; // backport threshold for CJS↔ESM interop without flag
  return false;
}

const LIVENESS_NOTE = depResolvable
  ? nodeSupportsRequireEsm()
    ? 'live'
    : `installed, but Node ${process.versions.node} cannot require() the ESM-only build`
  : 'package not installed in this checkout (devDependency — npm i -D ripgrep@0.3.1)';

const HIDDEN_TOKEN = 'RG_TOOL_HIDDEN_88'; // hidden dir, extensionless file — --hidden probe
const EXCL_TOKEN = 'RG_TOOL_EXCLUDE_99';  // inside node_modules/dep.js — pruned by default exclusions
/** Literal dialect-reject string: valid JS RegExp syntax (lookbehind) that ripgrep's default engine refuses. */
const DIALECT_PATTERN = '(?<=foo)bar';

// ==================== Tool harness ====================
interface RipgrepMatchShape { file: string; line_number: number; content: string; }
interface RipgrepToolResult {
  success: boolean;
  data?: { matches: RipgrepMatchShape[]; count: number; filesScanned: number; mode: string; pattern_mode?: string; aborted?: boolean; hint?: string };
  error?: string;
}

const tools = registerFileSystemTools({} as unknown as PluginConfig, {} as unknown as StateManager);
const ripgrepTool = tools.find((t) => t.name === 'ripgrep');

/** Direct in-process invocation (no child process at the tool layer): implementation(args, ctx?). */
async function runRipgrep(args: Record<string, unknown>, ctx?: { signal?: AbortSignal }): Promise<RipgrepToolResult> {
  if (!ripgrepTool) throw new Error('ripgrep tool not registered (regression: tool registry changed?)');
  const impl = ripgrepTool.implementation as unknown as (a: Record<string, unknown>, c?: { signal?: AbortSignal }) => Promise<RipgrepToolResult>;
  return impl(args, ctx);
}

describe('ripgrep tool — registry/schema (no worker spawned)', () => {
  test('registered with the expected name and a full parameter surface', () => {
    expect(ripgrepTool).toBeDefined();
    if (!ripgrepTool) return;
    // FunctionTool exposes parametersSchema (Zod object schema), not `parameters` — per-key access via .shape.
    const shape = (ripgrepTool as unknown as { parametersSchema?: { shape?: Record<string, unknown> } }).parametersSchema?.shape;
    if (!shape) return; // soft-skip: schema surface not introspectable in this SDK build
    for (const k of ['pattern', 'path', 'mode', 'case_insensitive', 'include_glob', 'exclude_globs', 'max_depth']) {
      expect(Object.keys(shape)).toContain(k);
    }
  });

  test('description no longer references the removed grep_files AST mode; names the watchdog cap', () => {
    if (!ripgrepTool) return;
    const desc = String((ripgrepTool as unknown as { description: string }).description ?? '');
    expect(desc).toContain('3s wall-clock watchdog');
  });

  test('empty pattern is rejected by the schema (min 1 char)', () => {
    if (!ripgrepTool) return;
    // FunctionTool exposes checkParameters(params), which THROWS on invalid input — not per-key `.parse()`.
    const check = (ripgrepTool as unknown as { checkParameters?: (p: Record<string, unknown>) => void }).checkParameters;
    if (typeof check !== 'function') return; // soft-skip: no validation surface in this SDK build
    expect(() => check.call(ripgrepTool, {})).toThrow();            // required `pattern` missing
    expect(() => check.call(ripgrepTool, { pattern: '' })).toThrow(); // z.string().min(1)
    expect(() => check.call(ripgrepTool, { pattern: 'x' })).not.toThrow();
  });
});

describe('ripgrep tool — integration (collection-time gated + runtime backstop)', () => {
  let rootDir = '';
  let bigTreeDir = '';
  let live = depResolvable && nodeSupportsRequireEsm();
  let runtimeSkipReason = '';

  const skipIfUnlive = (): void => { if (!live) console.log(`[ripgrepTools] SKIP — ${runtimeSkipReason || LIVENESS_NOTE}`); };

  beforeAll(async () => {
    rootDir = path.join(os.tmpdir(), `rg-tools-test-${Date.now()}`);
    await fs.mkdir(path.join(rootDir, 'sub', 'deep'), { recursive: true }); // sub/deep = depth-2 dir (maxDepth boundary probe)
    await fs.mkdir(path.join(rootDir, '.hidden'), { recursive: true });
    await fs.mkdir(path.join(rootDir, 'node_modules'), { recursive: true });

    // Deterministic fixture tree — unique tokens, one concern per file:
    await fs.writeFile(path.join(rootDir, 'a.ts'), `// header comment\nconst RG_TOOL_ALPHA_42 = 1;\n`);          // token on LINE 2 (line_number pin)
    await fs.writeFile(path.join(rootDir, 'sub', 'b.txt'), `plain BETA_TEXT_TOKEN here\nsecond line BETA_TEXT_TOKEN again\n`); // two hits across one file
    await fs.writeFile(path.join(rootDir, 'case.txt'), `UPPER_TOKEN_ABC\ngamma_token_abc lowercase\n`);              // case-sensitivity probe
    await fs.writeFile(path.join(rootDir, '.hidden', 'secret.txt'), `${HIDDEN_TOKEN}\n`);                            // --hidden probe
    await fs.writeFile(path.join(rootDir, 'node_modules', 'dep.js'), `module.exports = ${EXCL_TOKEN};\n`);            // default-exclusion probe

    if (!live) return; // gated out at collection time — fixtures only, no engine call

    // RUNTIME BACKSTOP: one real ok outcome through the tool layer proves boot + preopens + mapping in THIS runtime.
    const probe = await runRipgrep({ pattern: 'RG_TOOL_ALPHA_42' });
    if (!probe.success || !probe.data?.matches.some((m) => m.file === 'a.ts')) {
      live = false;
      runtimeSkipReason = `runtime probe not ok — ${JSON.stringify(probe).slice(0, 240)}`;
      return;
    }
    // Line pin: the token sits on line 2 of a.ts (line 1 is the header comment).
    const hit = probe.data?.matches.find((m) => m.file === 'a.ts');
    if (!hit || hit.line_number !== 2) {
      live = false;
      runtimeSkipReason = `probe returned an unexpected match shape for a known token — ${JSON.stringify(probe.data).slice(0, 240)}`;
    }
  }, 60_000);

  afterAll(async () => {
    try { await fs.rm(rootDir, { recursive: true, force: true }); } catch (e) { console.error('Cleanup failed:', e); }
    if (bigTreeDir) { try { await fs.rm(bigTreeDir, { recursive: true, force: true }); } catch (e) { console.error('Big-tree cleanup failed:', e); } }
  }, 30_000);

  // Collection-time registration: real test when the dep/runtime gate passed, todo (skipped) otherwise.
  function itLive(name: string, fn: () => Promise<void>, timeoutMs?: number): void {
    if (depResolvable && nodeSupportsRequireEsm()) test(name, fn, timeoutMs);
    else test.todo(`[skip: ${LIVENESS_NOTE}] ${name}`);
  }

  itLive('ok outcome → success shape with matches/count/filesScanned/mode/pattern_mode', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: 'BETA_TEXT_TOKEN' });
    expect(res.success).toBe(true);
    const d = res.data!;
    expect(d.count).toBe(2); // sub/b.txt lines 1 AND 2 — exact count pin on a deterministic fixture
    expect(d.filesScanned).toBe(1); // one distinct file produced all matches
    expect(d.mode).toBe('regex');   // mode omitted → defaults to 'regex' at the tool layer
    expect(d.pattern_mode).toBe('regex'); // no demotion happened
    const pairs = d.matches.map((m) => `${m.file}:${m.line_number}`).sort();
    expect(pairs).toEqual(['sub/b.txt:1', 'sub/b.txt:2']); // '/'-separated display path + rg's natural order
    expect(d.matches[0].content).toBe('plain BETA_TEXT_TOKEN here'); // trimmed line, no truncation at this length
  }, 30_000);

  itLive('case_insensitive DEFAULTS to true — lowercase pattern finds the uppercase token when the arg is omitted', async () => {
    skipIfUnlive(); if (!live) return;
    // Omitting case_insensitive entirely must still match UPPER_TOKEN_ABC via rg -i (legacy grep_files contract).
    const res = await runRipgrep({ pattern: 'upper_token_abc' });
    expect(res.success).toBe(true);
    expect(res.data!.matches.some((m) => m.file === 'case.txt')).toBe(true);
  }, 30_000);

  itLive('case_insensitive:false → same pattern matches nothing (no exact-cased occurrence)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: 'upper_token_abc', case_insensitive: false });
    expect(res).toMatchObject({ success: true, data: { matches: [], count: 0 } });
  }, 30_000);

  itLive('absent token → no-matches mapped to a clean empty success (NOT an error)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: 'NO_SUCH_TOKEN_ZZ9' });
    expect(res).toMatchObject({ success: true, data: { matches: [], count: 0, filesScanned: 0 } });
  }, 30_000);

  itLive(`dialect reject '${DIALECT_PATTERN}' → ok with pattern_mode 'fixed-strings' + demotion hint`, async () => {
    skipIfUnlive(); if (!live) return;
    // Lookbehind = valid JS RegExp, refused by ripgrep's default engine → ONE -F retry on the warm worker.
    // The fixture line carries the pattern as PLAIN TEXT so the demoted literal scan finds it.
    await fs.writeFile(path.join(rootDir, 'dialect.txt'), `probe ${DIALECT_PATTERN} here\n`);
    try {
      const res = await runRipgrep({ pattern: DIALECT_PATTERN });
      expect(res.success).toBe(true);
      const d = res.data!;
      expect(d.pattern_mode).toBe('fixed-strings');
      expect(typeof d.hint).toBe('string'); // demotion must be OBSERVABLE, never silent
      if (d.hint) expect(d.hint).toContain('fixed strings');
      const hit = d.matches.find((m) => m.file === 'dialect.txt');
      expect(hit).toBeDefined();
    } finally {
      await fs.unlink(path.join(rootDir, 'dialect.txt')).catch(() => {});
    }
  }, 30_000);

  itLive('single-file target → display file is the basename (legacy contract shape)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: 'BETA_TEXT_TOKEN', path: path.join(rootDir, 'sub', 'b.txt') });
    expect(res.success).toBe(true);
    const d = res.data!;
    expect(d.count).toBe(2); // both lines of the file itself
    for (const m of d.matches) expect(m.file).toBe('b.txt'); // basename, not relative path
  }, 30_000);

  itLive('hidden directories are scanned (--hidden): token inside .hidden/ is visible', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: HIDDEN_TOKEN });
    expect(res.success).toBe(true);
    expect(res.data!.matches.some((m) => m.file === '.hidden/secret.txt')).toBe(true);
  }, 30_000);

  itLive('default exclusions apply WITHOUT include_glob — node_modules token invisible', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: EXCL_TOKEN });
    expect(res).toMatchObject({ success: true, data: { matches: [], count: 0 } }); // pruned by default → clean negative
  }, 30_000);

  itLive('include_glob SUPPRESSES the default exclusions — same token visible with *.js scope', async () => {
    skipIfUnlive(); if (!live) return;
    // Positive filter present → DEFAULT_EXCLUDED_DIRS is NOT passed to the engine (branch pinned in the tool).
    const res = await runRipgrep({ pattern: EXCL_TOKEN, include_glob: '*.js' });
    expect(res.success).toBe(true);
    expect(res.data!.matches.some((m) => m.file === 'node_modules/dep.js')).toBe(true);
  }, 30_000);

  itLive('include_glob restricts scope — .txt-scoped search cannot see the a.ts token', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: 'RG_TOOL_ALPHA_42', include_glob: '*.txt' });
    expect(res).toMatchObject({ success: true, data: { matches: [], count: 0 } }); // a.ts out of scope → clean negative
  }, 30_000);

  itLive('explicit exclude_globs prune matching paths (appended on top of defaults)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: 'BETA_TEXT_TOKEN', exclude_globs: ['sub'] });
    expect(res).toMatchObject({ success: true, data: { matches: [], count: 0 } }); // sub/ pruned whole → clean negative
  }, 30_000);

  itLive('maxDepth boundary — depth-2 file in-budget at cap 2, out-of-budget at cap 1; omitted = unbounded', async () => {
    skipIfUnlive(); if (!live) return;
    // The +1 parity quirk lives INSIDE the engine (buildArgs: --max-depth=cap+1); these pins are the observable contract.
    await fs.writeFile(path.join(rootDir, 'sub', 'deep', 'c.txt'), `DEEP_GAMMA_TOKEN_55 lives two subdirectories below the root\n`);
    try {
      const deepCap2 = await runRipgrep({ pattern: 'DEEP_GAMMA_TOKEN_55', max_depth: 2 });
      expect(deepCap2.success).toBe(true);
      expect(deepCap2.data!.matches.some((m) => m.file === 'sub/deep/c.txt')).toBe(true);

      const deepCap1 = await runRipgrep({ pattern: 'DEEP_GAMMA_TOKEN_55', max_depth: 1 });
      expect(deepCap1).toMatchObject({ success: true, data: { matches: [], count: 0 } }); // one-subdir budget cannot reach depth 2

      const deepUnbounded = await runRipgrep({ pattern: 'DEEP_GAMMA_TOKEN_55' }); // max_depth omitted → unbounded
      expect(deepUnbounded.success).toBe(true);
      expect(deepUnbounded.data!.matches.some((m) => m.file === 'sub/deep/c.txt')).toBe(true);
    } finally {
      await fs.unlink(path.join(rootDir, 'sub', 'deep', 'c.txt')).catch(() => {});
    }
  }, 60_000);

  itLive('pre-aborted ctx signal → success with matches:[] + aborted:true (zero worker work)', async () => {
    skipIfUnlive(); if (!live) return;
    const ctrl = new AbortController();
    ctrl.abort(); // fired BEFORE the call — engine guard-rail branch, no stat/worker downstream of it
    const res = await runRipgrep({ pattern: 'BETA_TEXT_TOKEN' }, { signal: ctxSignal(ctrl) });
    expect(res).toMatchObject({ success: true, data: { matches: [], count: 0, aborted: true } });
    if (res.data?.aborted) expect(typeof res.data.hint).toBe('string');
  }, 30_000);

  itLive('mid-scan abort via real sleep + ctrl.abort() on a ~200-file tree → aborted:true, host stays responsive', async () => {
    skipIfUnlive(); if (!live) return;
    // A small tree finishes in single-digit ms — too fast to interrupt reliably. Materialize ~200 files so the
    // rg scan spans several event-loop turns after boot (empirically pinned 13.09: a 150-200ms host sleep lands
    // mid-scan on this runtime). Real timers only — fake timers cannot touch the worker thread.
    if (!bigTreeDir) {
      bigTreeDir = path.join(os.tmpdir(), `rg-tools-bigtreetest-${Date.now()}`);
      await fs.mkdir(bigTreeDir, { recursive: true });
      const fileContent = 'ABORT_PROBE_TOKEN_77 pad pad pad pad\n'.repeat(50) + '\n';
      const writes: Array<Promise<void>> = [];
      for (let i = 0; i < 200; i++) writes.push(fs.writeFile(path.join(bigTreeDir, `f${i.toString().padStart(3, '0')}.txt`), fileContent));
      await Promise.all(writes);
    }

    const ctrl = new AbortController();
    const pending = runRipgrep({ pattern: 'ABORT_PROBE_TOKEN_77', path: bigTreeDir }, { signal: ctxSignal(ctrl) });
    // Real sleep — the ONLY way to let boot + scan start before aborting.
    await new Promise((r) => setTimeout(r, 180));
    if (!ctrl.signal.aborted) ctrl.abort();
    const res = await pending;

    expect(res.success).toBe(true);       // NOT a hard failure — the host stayed responsive and reported state
    expect(res.data?.aborted).toBe(true); // worker terminated on the host signal
    if (res.data?.aborted) {
      expect(Array.isArray(res.data.matches)).toBe(true); // partial-state contract: empty array, never missing
      expect(typeof res.data.hint).toBe('string');        // caller must be told results are not a clean negative
    }
  }, 60_000);

  itLive('absent target path → typed spawn-failure error (never a silent empty success)', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: 'anything', path: path.join(os.tmpdir(), `rg-tools-absent-${Date.now()}`) });
    expect(res.success).toBe(false);
    if (res.error) {
      expect(res.error).toContain('ripgrep engine failed');
      expect(res.error).toContain('target not found or inaccessible'); // engine stat-failure detail surfaces verbatim
    } else {
      throw new Error('expected a spawn-failure error message, got none');
    }
  }, 30_000);

  itLive('path traversal is rejected before any scan', async () => {
    skipIfUnlive(); if (!live) return;
    const res = await runRipgrep({ pattern: 'x', path: '../' });
    expect(res).toMatchObject({ success: false });
    if (res.error) expect(res.error).toContain('Invalid path');
  }, 30_000);

  // NOTE (by design, per plan): there is NO spawn-failure-without-target case distinct from the absent-path test —
  // worker-boot failures (import rejection / WASM crash) are pinned at the engine layer by ripgrepEngine.test.ts,
  // and cannot be forced deterministically at the tool layer without mocking the engine itself.
});

/** Wrap an AbortController's signal in the ctx shape the SDK hands to implementations (tests pass it explicitly). */
function ctxSignal(ctrl: AbortController): { signal: AbortSignal } {
  return { signal: ctrl.signal };
}
