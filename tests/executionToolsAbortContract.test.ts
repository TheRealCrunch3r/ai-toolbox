/**
 * 04.10 ABORT-CONTRACT — tool-level abort tests for the child-process tools (src/tools/executionTools.ts):
 * execute_command / run_javascript / run_python / run_tests / run_in_terminal now forward LM Studio's
 * ToolCallContext.signal into safeSpawn's ONE authoritative AbortController per call (grepGuard idiom).
 *
 * CONTRACT UNDER TEST (pinned against the implementation, 04.10):
 *  • PRE-ABORTED ctx signal → house aborted envelope { success:true, data:{aborted:true, hint[, provenance]} }
 *    with ZERO child processes spawned — an aborted run can never start a command or probe executables.
 *  • MID-RUN abort (host cancel while the child is alive) → no silent completion: either the positive aborted
 *    envelope (kill lands first) OR src's documented refusal of success for an already-aborted signal at close/error —
 *    NEVER {success:true} without an abort marker; settle stays fast, partial output rides along trimmed.
 *  • NO ctx at all → happy path: the command runs to completion with the normal success shape.
 *
 * LAYERING (04.10 gate fixes — three owner-gate iterations, ALL test-side, zero src changes):
 *  child_process is replaced via a jest.mock FACTORY whose spawn wraps the REAL implementation and records both
 *  every call's args AND the returned ChildProcess object — real processes, real timers only (the abort is a genuine
 *  host event). This mirrors tests/executionTools.test.ts's house pattern. Three defects were caught at owner gates:
 *   GATE-1 RED: original layer used `import * as cp` + `jest.spyOn(cp, 'spawn')` — impossible under this repo's ts-jest
 *     CJS emit: TS compiles namespace imports to __importStar(require('child_process')), a wrapper object whose
 *     properties are NON-CONFIGURABLE getters (tslib-style __createBinding), so jest-mock 30's spyOn → defineProperty
 *     throws `TypeError: Cannot redefine property: spawn`; and even patched it would have missed src's named-import call sites.
 *   GATE-2 RED: factory used plain `require('child_process')` — from INSIDE a mock factory that re-enters the jest
 *     registry for the same specifier and re-invokes the factory → infinite recursion (RangeError at requireModuleOrMock).
 *     Fix: jest.requireActual() is the documented in-factory bypass.
 *   GATE-3 RED: (a) mid-run test used a blind 600 ms wait — on slow boot the abort fired before the node grandchild
 *     existed; Windows taskkill /T /F silently misses a half-launched tree, the healthy child completes its natural exit
 *     and src CORRECTLY refuses success for an aborted signal (its own guarantee) → no `aborted` flag. Fix: event-driven
 *     gate — abort only once a recorded ChildProcess exposes a real .pid. (b) happy-path first-launch stdout capture came
 *     back '(No output)' on an exit-0 run (Windows console pipe flush under the jest worker). Fix: 3-attempt union retry,
 *     loud failure with diagnostics if all attempts empty.
 */

import { registerExecutionTools } from '../src/tools/executionTools';
import type { ChildProcess } from 'child_process';
import type { PluginConfig } from '../src/config';

// ==================== Tool harness (same shape as tests/ripgrepTools.test.ts) ====================
interface ExecToolResult {
  success: boolean;
  data?: Record<string, unknown> & { aborted?: true };
  error?: string;
}

const tools = registerExecutionTools({} as unknown as PluginConfig);
function implOf(name: string): (a: Record<string, unknown>, c?: { signal?: AbortSignal }) => Promise<ExecToolResult> {
  const t = tools.find((x) => x.name === name);
  if (!t) throw new Error(`tool "${name}" not registered (regression: tool registry changed?)`);
  return t.implementation as unknown as (a: Record<string, unknown>, c?: { signal?: AbortSignal }) => Promise<ExecToolResult>;
}

const executeCommandImpl = implOf('execute_command');
const runJavaScriptImpl = implOf('run_javascript');
const runTestsImpl = implOf('run_tests');

// ==================== child_process factory mock (pass-through spawn recorder) ====================
// House pattern — same mechanism as tests/executionTools.test.ts: the factory runs when src/tools/executionTools.ts
// first requires 'child_process' inside this file's registry, so EVERY production call site (safeSpawn, taskkill
// tree-kill, probe loops, run_in_terminal fire-and-forget, pytest check) resolves to THIS spawn.
// The mock-prefixed names are MANDATED by jest-hoist: the hoisted factory may only reference top-level bindings
// starting with 'mock'. Both arrays are reset IN PLACE in beforeEach (length = 0): the factory's closures hold these
// references — reassignment would orphan them.
const mockSpawnCalls: unknown[][] = [];
const mockSpawnedProcs: ChildProcess[] = [];

jest.mock('child_process', () => {
  // jest.requireActual (NOT plain require): from INSIDE a mock factory, require() of the same specifier re-enters the
  // jest registry and re-invokes THIS factory → infinite recursion (gate-2 RangeError). requireActual bypasses mocks.
  const actual = jest.requireActual('child_process');
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- recording wrapper keeps the real behavior intact
    spawn: (...args: any[]) => {
      mockSpawnCalls.push(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const proc = (actual.spawn as any)(...args) as ChildProcess;
      mockSpawnedProcs.push(proc);
      return proc;
    },
  };
});

beforeEach(() => {
  // Quiet the tools' production forensic logging under jest (house pattern — see webResearchTools.test.ts).
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockSpawnCalls.length = 0; // in-place reset (see header)
  mockSpawnedProcs.length = 0;
});

afterEach(() => {
  jest.restoreAllMocks();
});

/** PRE-ABORT contract check — the child was NEVER started, so exactly one shape exists:
 *  house envelope for EXEC tools: success:true + data.aborted (mirrors ripgrep/pattern_scan). */
const PRE_ABORT_ENVELOPE_SHAPE = (res: ExecToolResult): void => {
  expect(res.success).toBe(true);
  expect(res.data?.aborted).toBe(true);
  if (res.data?.aborted !== true) throw new Error('expected the aborted envelope');
  expect(typeof res.data.hint).toBe('string'); // caller must be told this is not a completed run
};

describe('execution tools — ABORT-CONTRACT (04.10)', () => {
  test('all five execution tools are registered with the expected names', () => {
    const names = tools.map((t) => t.name);
    for (const n of ['run_javascript', 'run_python', 'execute_command', 'run_in_terminal', 'run_tests']) expect(names).toContain(n);
  });

  // ---------- pre-aborted ctx signal: envelope + ZERO spawn ----------

  test('execute_command + pre-aborted ctx → aborted envelope with zero child processes spawned', async () => {
    const ctrl = new AbortController();
    ctrl.abort(); // fired BEFORE the call — gate must return before safeSpawn ever runs

    const res = await executeCommandImpl({ command: 'node -e "console.log(1)"' }, { signal: ctrl.signal });

    PRE_ABORT_ENVELOPE_SHAPE(res);
    expect(res.data?.provenance).toBe('execute_command');
    expect(mockSpawnCalls.length).toBe(0); // THE assertion: nothing was started for an already-cancelled call
  }, 10_000);

  test('run_javascript + pre-aborted ctx → aborted envelope, executable probing suppressed entirely', async () => {
    const ctrl = new AbortController();
    ctrl.abort();

    const res = await runJavaScriptImpl({ javascript: 'console.log(1)' }, { signal: ctrl.signal });

    PRE_ABORT_ENVELOPE_SHAPE(res);
    expect(mockSpawnCalls.length).toBe(0); // no npx/node probing for a cancelled call (aborted ≠ exe-not-found)
  }, 10_000);

  test('run_tests + pre-aborted ctx → aborted envelope before any runner work', async () => {
    const ctrl = new AbortController();
    ctrl.abort();

    const res = await runTestsImpl({ runner: 'jest' }, { signal: ctrl.signal });

    PRE_ABORT_ENVELOPE_SHAPE(res);
    expect(mockSpawnCalls.length).toBe(0);
  }, 10_000);

  // ---------- happy path (no ctx): zero-change guard for the wiring ----------

  test('execute_command without ctx → normal success shape on a real child process', async () => {
    // NO ctx at all. Real child + Windows console pipe: under some jest-worker conditions the first launch's stdout
    // flush can arrive empty (gate-3 ~20:08 — '(No output)' on an exit-0 run). Retry up to 3x and assert over the UNION
    // of captured outputs; all-empty ⇒ real environment/capture finding → fail loudly with diagnostics.
    const cmd = `node -e "console.log('ABORT_SUITE_OK_1234')"`;
    let lastOutput = '(No output)';
    let anyOutputSeen = false;
    for (let attempt = 1; attempt <= 3 && !anyOutputSeen; attempt++) {
      const res = await executeCommandImpl({ command: cmd });
      expect(res.success).toBe(true);
      if (res.data) {
        expect(res.data.aborted).toBeFalsy(); // a healthy run must NEVER report itself aborted (v3 guard class)
        expect(res.data.provenance).toBe('execute_command');
        lastOutput = String(res.data.output ?? '');
        anyOutputSeen = lastOutput.includes('ABORT_SUITE_OK_1234');
      } else {
        throw new Error('expected success data');
      }
    }
    if (!anyOutputSeen) {
      // MUST precede any bare expect: jest reports the first throw only. console.error is suite-muted by beforeEach (house pattern),
      // so THIS thrown message IS the loud diagnostic — it carries the last captured output verbatim (the evidence we need).
      throw new Error(`happy-path capture failed on all 3 attempts (last output: ${JSON.stringify(lastOutput)}) — environment/pipe finding, not a contract pass`);
    }
    expect(mockSpawnCalls.length).toBeGreaterThan(0); // sanity: the child really ran through the recording pass-through
  }, 45_000);

  // ---------- mid-run abort: no silent completion, fast settle ----------

  test('execute_command + mid-run abort → aborted contract honored (envelope OR documented refusal), fast settle', async () => {
    const ctrl = new AbortController(); // NOT yet aborted — the cancel is a genuine host event (real timers)

    const t0 = Date.now();
    const pending = executeCommandImpl(
      { command: `node -e "setTimeout(function(){},60000)"` }, // long-lived child, well past its natural lifetime
      { signal: ctrl.signal },
    );
    // GATE-3 FIX: event-driven gate instead of a blind 600 ms wait — abort only once a recorded ChildProcess exposes a
    // real .pid (a killable process exists). Firing at a half-launched tree let taskkill /T /F silently miss on Windows,
    // after which src's close handler CORRECTLY refused success for an aborted signal (its own guarantee) → no flag.
    const deadline = Date.now() + 5_000;
    let sawPid = false;
    while (Date.now() < deadline) {
      if (mockSpawnedProcs.some((p) => typeof p?.pid === 'number')) { sawPid = true; break; }
      await new Promise((r) => setTimeout(r, 50));
    }
    expect(sawPid).toBe(true); // the child really started — this is a mid-run kill, not a pre-launch gate (recorder saw it)
    ctrl.abort(); // fire against a LIVE process now — deterministic kill target

    const res = await pending;
    const elapsedMs = Date.now() - t0;

    // CONTRACT-AWARE assertion: for "signal already aborted when close/error lands", src's documented behavior is to REFUSE
    // success (an aborted run can never be reported as completed) — so EITHER the positive envelope OR a failure-shaped
    // abort result is contract-correct. The invariant this test pins: NEVER {success:true} without an abort marker.
    const hasPositiveEnvelope = res.success === true && res.data?.aborted === true;
    const hasRefusedShape = res.success === false && typeof res.error === 'string' && res.error.toLowerCase().includes('abort');
    if (!hasPositiveEnvelope && !hasRefusedShape) {
      // console.error is suite-muted by beforeEach (house pattern), so THIS thrown message IS the forensic dump — full envelope + elapsed ride along.
      throw new Error(`mid-run abort settled NEITHER as aborted envelope NOR documented refusal: ${JSON.stringify(res)} (elapsedMs=${elapsedMs})`);
    }
    if (!hasPositiveEnvelope) {
      expect((res as { error: string }).error).toBeDefined(); // refusal branch: the failure shape must exist at all
      expect(typeof res.error === 'string' && res.error.length > 0).toBe(true); // the refusal carries the abort reason, not an empty/missing error
    } else {
      expect(res.data?.provenance).toBe('execute_command');
      for (const k of ['stdout', 'stderr']) expect(typeof res.data?.[k]).toBe('string'); // partial output rides along trimmed — strings even when empty
    }
    expect(ctrl.signal.aborted).toBe(true); // sanity: the fire actually happened (a broken controller would void the test)
    expect(mockSpawnCalls.length).toBeGreaterThan(0); // recorded pass-through saw the spawn
    expect(elapsedMs).toBeLessThan(8_000); // killed promptly — never rides out the child's 60 s lifetime or any timeout path
  }, 25_000);
});
