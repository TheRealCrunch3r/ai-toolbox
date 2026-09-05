/**
 * REGRESSION SUITE — grep_files hang fixes (FIX-HANG-1/2/3/4, 26.08–27.08; v3 architecture 04.09)
 *
 * Historical incidents pinned by this suite:
 *   FIX-HANG-1: every abort check read `signal` destructured from an EMPTY object — ALWAYS undefined;
 *               a real AbortController existed but nothing ever read its flag (silent ~2-minute hang on
 *               node_modules/ssh2/test, aborted by the host without any result).
 *   FIX-HANG-2: directory mode had NO wall-clock backstop at all.
 *   FIX-HANG-3: the backstop setTimeout was orphaned — a spurious [ERROR] fired exactly 20.0s after EVERY
 *               healthy grep (log forensics 27.08: 8/8 RESULT-DELTA→BACKSTOP pairings at Δ=+20.0s).
 *   FIX-HANG-4: SDK compliance — implementation accepts ToolCallContext and forwards ctx.signal so host
 *               aborts are honored like internal ones.
 *
 * ARCHITECTURE UNDER TEST (v3, 04.09 FIX-DEBLOAT): the stacked timer machinery is replaced by ONE shared
 * cancellation primitive per call — src/utils/grepGuard.ts createGrepGuard(ctx?.signal, GREP_MAX_RUN_MS=500ms):
 *   - host AbortSignal forwarded INTO an internal AbortController (one-way signals can only be listened to);
 *   - a single real setTimeout arms the wall-clock cap; at the deadline it calls controller.abort();
 *   - every cooperative check reads guard.signal.aborted; disarm() clears the timer on EVERY completion path.
 * KNOWN TRADE-OFF (pre-ITEM-B): a spinning synchronous .test() starves the event loop, so no timer can fire mid-spin —
 * the abort applies at the next file/line boundary instead. ITEM-B (05.09) removed this trade-off at the source:
 * regex evaluation now runs in an isolated worker (src/utils/regexWorker.ts) whose watchdog terminate() preempts
 * even a spinning .test(); upstream gates remain (isSafeRegex/literal demotion, size/line gates, 20k-char line skip).
 */

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import { GREP_MAX_RUN_MS } from '../src/utils/grepGuard'; // static import — keeps this suite in lockstep with production (no hardcoded 500)
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface GrepMatch { file: string; line_number: number; content: string; }
interface GrepResult { success: boolean; error?: string; data?: { matches: GrepMatch[]; count: number; filesScanned: number; aborted?: boolean; hint?: string; skipped_files?: unknown[] }; }

describe('grep_files hang-fix regression (FIX-HANG-1/2 → v3 shared guard)', () => {
  let tools: ReturnType<typeof registerFileSystemTools>;
  let testDir: string;

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `grep-hang-test-${Date.now()}`);
    await fs.mkdir(path.join(testDir, 'sub'), { recursive: true });
    // Deterministic fixtures — every file passes all gates (small, short lines)
    await fs.writeFile(path.join(testDir, 'alpha.ts'), 'const ALPHA_MARKER = 1;\nexport const x = 2;\n');
    await fs.writeFile(path.join(testDir, 'sub', 'beta.js'), '// BETA_MARKER lives in sub/\nvar y = 3;\n');
    // A file with >5001 lines after split to exercise skipped_files alongside a normal scan
    await fs.writeFile(path.join(testDir, 'big_lines.txt'), 'pad\n'.repeat(5001));

    tools = registerFileSystemTools({} as PluginConfig, {} as StateManager);
  });

  afterAll(async () => {
    try { await fs.rm(testDir, { recursive: true, force: true }); } catch (e) { console.error('Cleanup failed:', e); }
  });

  const getGrepTool = () => tools.find(t => t.name === 'grep_files');

  test('directory-mode scan still returns matches under the shared guard (no behavioral regression)', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'ALPHA_MARKER|BETA_MARKER', // top-level alternation → 2 separate regexes (exercises the pre-test gate loop)
      path: testDir,
      max_results: 20,
      include_context: false,
      max_content_length: 150,
      max_file_size: 100_000,
    }) as unknown as GrepResult;

    expect(result.success).toBe(true);
    if (result.success) {
      // Both markers found → the guard's plain await is transparent for normal fast scans
      const files = result.data!.matches.map(m => m.file.replace(/\\/g, '/'));
      expect(files.some(f => f.includes('alpha.ts'))).toBe(true);
      expect(files.some(f => f.includes('sub/beta.js'))).toBe(true);
      // A healthy scan must NOT report itself as aborted (success path carries the flag — v3 guard)
      expect(result.data!.aborted ?? false).toBe(false);
      // The >5001-line fixture is reported via skipped_files (pre-existing contract preserved)
      const skipped = (result.data!.skipped_files ?? []) as Array<{ file: string }>;
      expect(skipped.some(s => s.file.replace(/\\/g, '/').includes('big_lines.txt'))).toBe(true);
    }
  });

  test('single-file target still works through the shared guard', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'BETA_MARKER',
      path: path.join(testDir, 'sub', 'beta.js'), // direct file target → processFile branch
      max_results: 10,
      include_context: false,
      max_content_length: 150,
      max_file_size: 100_000,
    }) as unknown as GrepResult;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data!.matches.length).toBeGreaterThanOrEqual(1);
      expect(result.data!.matches[0].content).toContain('BETA_MARKER');
      expect(result.data!.aborted ?? false).toBe(false);
    }
  });

  /**
   * THE regression test (rewritten for v3, 04.09). The guard arms a REAL setTimeout(GREP_MAX_RUN_MS=500ms) —
   * the old Date.now SPEEDUP hack cannot fake timer expiry, so this now uses jest modern fake timers:
   * the implementation starts under a frozen clock (guard timer scheduled but not yet fired), real fs I/O
   * proceeds while we advance the fake clock past 500ms with advanceTimersByTimeAsync (which also flushes
   * microtasks between steps, letting in-flight native I/O complete). The cap then aborts via the internal
   * controller; every remaining file/line boundary sees guard.signal.aborted and short-circuits. If the
   * wiring were dead (checks reading an unread flag / undefined value), no abort would ever be set and the
   * result would carry NO `aborted` flag — exactly the old silent-hang contract.
   */
  test('deadline abort is OBSERVABLE: wall-clock cap expiry → early settle + aborted flag on success path', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // Enough files that the walk demonstrably continues across multiple awaited batches (batches of 8 per dir),
    // so many deadline/abort checks execute. Content is trivially small — real time spent is milliseconds;
    // only FAKE time matters here.
    const deadlineDir = path.join(os.tmpdir(), `grep-hang-deadline-${Date.now()}`);
    await fs.mkdir(deadlineDir, { recursive: true });

    try {
      const fileCount = 40; // > concurrencyLimit (8) → multiple awaited batches → checks run many times
      for (let f = 0; f < fileCount; f++) {
        await fs.writeFile(path.join(deadlineDir, `d${String(f).padStart(2, '0')}.txt`), `marker_${f} plain line\nsecond line ${f}\n`.repeat(3));
      }

      jest.useFakeTimers();
      try {
        // Start the implementation WITHOUT awaiting — at this instant the guard has scheduled its 500ms cap on
        // the FAKE clock and no real time can elapse to fire it prematurely.
        const implPromise = grepTool.implementation({
          pattern: 'marker_|plain', // matches in many files → the walk would continue into later batches without the abort
          path: deadlineDir,
          max_results: 500,
          include_context: false,
          max_content_length: 150,
          max_file_size: 100_000,
        }) as Promise<GrepResult>;

        // Advance the fake clock past the cap. advanceTimersByTimeAsync steps through time in small increments,
        // flushing microtasks after each — that is also where the real (libuv) fs callbacks of the in-flight scan
        // get their chance to run between steps. At 500ms the guard timer fires → controller.abort() → every
        // subsequent boundary check aborts and the call settles with partial results.
        await jest.advanceTimersByTimeAsync(700);

        const result = await implPromise;
        expect(result.success).toBe(true);
        if (result.success) {
          // THE assertion: cap firing is observable end-to-end. Partial results MUST be labeled aborted —
          // old code produced no such flag even under a 2-minute overrun (dead signal wiring).
          expect(result.data!.aborted ?? false).toBe(true);
          // And the partial-results hint explains why coverage may be incomplete (no more silent empties/trims)
          expect(typeof result.data!.hint === 'string').toBe(true);
          // Sanity: the cut-short scan still returned whatever it had collected up to that point
          expect(Array.isArray(result.data!.matches)).toBe(true);
        }
      } finally {
        jest.useRealTimers();
      }
    } finally {
      try { await fs.rm(deadlineDir, { recursive: true, force: true }); } catch {}
    }
  });

  test('fast single-file scan resolves cleanly under the shared guard (cap never fires → no aborted flag)', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const result = await grepTool.implementation({
      pattern: 'ALPHA_MARKER',
      path: path.join(testDir, 'alpha.ts'),
      max_results: 10,
      include_context: false,
      max_content_length: 150,
      max_file_size: 100_000,
    }) as unknown as GrepResult;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data!.matches.length).toBeGreaterThanOrEqual(1);
      expect(result.data!.aborted ?? false).toBe(false); // real cap timer never fired → clean success shape
    }
  });

  /**
   * v3 orphan-timer regression (successor of FIX-HANG-3, 27.08): the guard arms exactly ONE setTimeout per call
   * — the GREP_MAX_RUN_MS cap (default 500ms) — and disarm() in finally must clear it on EVERY completion path,
   * so no stray "[grep_files] wall-clock cap ... reached" warn can fire after a healthy scan has already
   * returned. This test spies on setTimeout/clearTimeout, runs one healthy single-file scan and asserts that
   * every 500ms timer this call scheduled was cleared before the implementation resolved. Old code left its
   * backstop timers pending (8/8 spurious [ERROR] lines at Δ=+20s in log forensics); fixed code clears all.
   */
  test('v3 guard: healthy scan disarms its cap timer — no orphaned setTimeout left behind', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const capTimerIds: unknown[] = []; // unique fake ids of timers scheduled with the guard's delay
    const clearedIds = new Set<unknown>();

    const setSpy = jest.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: (...a: unknown[]) => void, ms?: number) => {
      const id = Symbol('fake-timer'); // inert — nothing real may fire in this test; the id is only tracked for clear-verification
      if (ms === GREP_MAX_RUN_MS) capTimerIds.push(id); // only the guard's cap timer qualifies by delay
      return id as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout);
    const clearSpy = jest.spyOn(globalThis, 'clearTimeout').mockImplementation(((id?: unknown) => {
      if (id !== undefined && id !== null) clearedIds.add(id);
    }) as typeof clearTimeout);

    try {
      const result = await (grepTool.implementation as unknown as (args: object, ctx?: { signal?: AbortSignal }) => Promise<GrepResult>)({
        pattern: 'ALPHA_MARKER',
        path: path.join(testDir, 'alpha.ts'), // fast single-file target → normal completion
        max_results: 10,
        include_context: false,
        max_content_length: 150,
        max_file_size: 100_000,
      }) as unknown as GrepResult;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data!.aborted ?? false).toBe(false); // healthy scan — this is the scenario that orphaned timers pre-v3
      }

      expect(capTimerIds.length).toBeGreaterThanOrEqual(1); // sanity: the guard's cap timer WAS scheduled this call

      // THE assertion (v3): EVERY cap timer THIS call scheduled must be cleared before return.
      for (const id of capTimerIds) {
        if (!clearedIds.has(id)) {
          throw new Error(`guard cap timer (${GREP_MAX_RUN_MS}ms) was NOT cleared on normal completion (orphaned — spurious post-return warn regression)`);
        }
      }
    } finally {
      setSpy.mockRestore();
      clearSpy.mockRestore();
    }
  });

  /**
   * FIX-HANG-4 regression (27.08, SDK compliance): @lmstudio/sdk passes a live host AbortSignal as the second
   * implementation argument (ToolCallContext.signal — verified in node_modules/@lmstudio/sdk/dist/index.d.ts).
   * Deterministic branch: an ALREADY-aborted signal must abort the scan before any file is processed.
   */
  test('FIX-HANG-4: pre-aborted host AbortSignal → immediate aborted:true, zero files scanned', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const ctrl = new AbortController();
    ctrl.abort(); // already aborted before the call — no timing involved

    const result = await (grepTool.implementation as unknown as (args: object, ctx?: { signal?: AbortSignal }) => Promise<GrepResult>)(
      { pattern: 'ALPHA_MARKER', path: testDir, max_results: 500, include_context: false, max_content_length: 150, max_file_size: 100_000 },
      { signal: ctrl.signal },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data!.aborted ?? false).toBe(true); // host abort surfaces via the shared guard controller
      expect(typeof result.data!.hint === 'string').toBe(true); // partial-results explanation present
      expect(result.data!.matches.length).toBe(0); // scan never started → nothing collected
    }
  });

  /**
   * FIX-HANG-4 (mid-scan branch): a host signal that fires DURING the walk must cut the scan short — the guard's
   * 'abort' listener flips the shared controller and the next file-boundary check stops work.
   *
   * Protocol (verified against the live implementation; unchanged by v3 except for line refs): with a FLAT single
   * directory, every processFile call suspends at its FIRST await (fs.promises.stat). The spy parks all stat calls
   * after #1 (the targetDir auto-detect stat passes through to real fs); bounded poll waits for ≥1 parked; then ALL
   * waiters are settled with real stat results and the host abort fires. Every resumed file bails at its next
   * aborted pre-check, unstarted ones return at their entry check — zero matches collected, no deadlock possible
   * (no waiter is ever left pending).
   */
  test('FIX-HANG-4: host AbortSignal mid-scan → early settle with partial results + aborted:true', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // FLAT single directory (no subdirectories): walkDirectory flushes at exactly concurrencyLimit in-flight files, so the
    // gate below can prove a precise cut point. Subdir fixtures break that invariant — see doc block above.
    const fileCount = 80;          // ≫ concurrencyLimit: guarantees an un-processed remainder after the cut point
    const concurrencyLimit = 32;   // batch size used by walkDirectory: await Promise.all at len >= limit
    const hostDir = path.join(os.tmpdir(), `grep-host-abort-${Date.now()}`);
    await fs.mkdir(hostDir, { recursive: true });

    for (let f = 0; f < fileCount; f++) {
      // One matching line + one padding line. Latency is irrelevant — determinism comes from the gate, not wall-clock.
      await fs.writeFile(path.join(hostDir, `f${String(f).padStart(2, '0')}.txt`), `hostabort_marker ${f}\npadding line 1\n`);
    }

    // Gate target: the SAME module object fileSystemTools.ts resolves at call time (`import * as _fs from 'fs'; const fs = _fs.promises`).
    const nodeFs = require('fs') as typeof import('fs');
    type StatResult = Awaited<ReturnType<typeof nodeFs.promises.stat>>;
    interface StatWaiter { p: Parameters<typeof nodeFs.promises.stat>[0]; opts?: unknown; resolve: (v: StatResult) => void; reject: (e: unknown) => void; }

    const ctrl = new AbortController();
    let parkedCount = 0;            // per-file stats currently held inside the gate
    const waiters: StatWaiter[] = [];

    // Capture the ORIGINAL stat BEFORE installing the spy. Calling nodeFs.promises.stat from INSIDE mockImplementation
    // would re-enter the spy itself (infinite recursion → RangeError on call #1, before any file can park).
    const realStat = nodeFs.promises.stat.bind(nodeFs.promises);

    let spyCalls = 0; // count how many times the mock stat function was entered (diagnostic for module-split / interception failures)

    const statSpy = jest.spyOn(nodeFs.promises, 'stat').mockImplementation(
      (p: Parameters<typeof nodeFs.promises.stat>[0], opts?: Parameters<typeof nodeFs.promises.stat>[1]) => {
        spyCalls++; // ← diagnostic: if this is 0 at gate timeout, the implementation never hit this module instance
        if (spyCalls === 1) return realStat(p, opts as never); // call #1 = targetDir auto-detect stat: pass through to REAL fs so the walk can start
        parkedCount++;
        return new Promise<StatResult>((resolve, reject) => {
          waiters.push({ p, opts, resolve, reject });
        });
      },
    );

    // Global unhandledrejection trap — catches any silent rejection in the scan's promise chain before it settles.
    const unhandledRejections: unknown[] = [];
    const urhListener = (reason: unknown) => { unhandledRejections.push(reason); };
    process.on('unhandledRejection', urhListener);

    try {
      const implPromise = (grepTool.implementation as unknown as (args: object, ctx?: { signal?: AbortSignal }) => Promise<GrepResult>)(
        { pattern: 'hostabort_marker', path: hostDir, max_results: 500, include_context: false, max_content_length: 150, max_file_size: 100_000, max_concurrent_files: concurrencyLimit },
        { signal: ctrl.signal },
      );

      // Non-interfering observer: capture the implementation's early settle state (diagnostic for gate failures).
      let implEarlyState = 'pending';
      implPromise.then(
        (r) => { implEarlyState = `resolved success=${(r as GrepResult).success} error=${(r as GrepResult).error ?? '-'} filesScanned=${(r.data as unknown as {filesScanned?: number})?.filesScanned}`; },
        (e: unknown) => { implEarlyState = `rejected ${String(e).slice(0, 200)}`; },
      );

      // Sticky-parking gate — bounded poll until at least ONE file stat is parked inside the mock. Parking every call
      // after #1 is safe under BOTH sequential and batched walks — whichever files start while the gate holds stay in flight.
      const deadline = Date.now() + 5000;
      while (parkedCount < 1) {
        if (Date.now() > deadline) throw new Error(
          `gate timeout: parked=${parkedCount} after 5s — spyCalls=${spyCalls}, unhandledRejections=${unhandledRejections.length}${unhandledRejections.length ? ' → ' + String(unhandledRejections[0]).slice(0, 300) : ''}, implState=${implEarlyState}`
        );
        await new Promise<void>((r) => setImmediate(r)); // yield one full turn of the event loop (setImmediate: immune to global setTimeout mocks)
      }

      if (unhandledRejections.length > 0) {
        console.warn(`[DIAGNOSTIC] ${unhandledRejections.length} unhandled rejection(s) during gate-wait:`, unhandledRejections);
      }

      // Cut point — TWO-STEP: 1) settle every parked waiter with real stat results (so ALL in-flight processFile calls
      // resume), THEN 2) fire the host abort. The guard's 'abort' listener flips its controller synchronously; each
      // resumed file then hits an aborted pre-check before collecting anything, and unstarted files return at their
      // entry check. Deterministic: no waiter is ever left pending, so the implementation MUST settle.
      for (const w of waiters.splice(0)) realStat(w.p, (w.opts ?? undefined) as never).then(w.resolve, w.reject); // real fs settles each parked waiter
      ctrl.abort();

      const result = await implPromise;
      expect(result.success).toBe(true);
      if (result.success) {
        expect(parkedCount).toBeGreaterThanOrEqual(1); // protocol check: at least one stat was in flight inside our gate when we cut
        expect(ctrl.signal.aborted).toBe(true);        // the host signal we sent is the abort source
        const data = result.data as GrepResult['data'] & { filesScanned?: number };
        expect(data!.matches.length).toBe(0);          // every file bails at an aborted pre-check — zero matches collected (fixture: 80 × 1 marker line)
        expect((data!.filesScanned ?? 0)).toBeLessThan(fileCount); // cut mid-scan: a remainder of files was never fully scanned (walk shape decides the exact count — read, don't assume)
        expect(data!.aborted ?? false).toBe(true);     // host abort observed at a file boundary → labeled partial on the success path
        expect(typeof data!.hint === 'string' && data!.hint.length > 0).toBe(true); // partial-results explanation present

        // Fail-fast cleanup of any still-pending waiters (only reachable if some processFile never consumed its stat — i.e. a
        // leak, which must surface as an unhandledRejection rather than hang the suite):
        for (const w of waiters.splice(0)) { try { w.reject(new Error('test aborted: parked stat leaked')); } catch {} }
      }
    } finally {
      process.removeListener('unhandledRejection', urhListener);
      try { statSpy.mockRestore(); } catch {}
      try { await fs.rm(hostDir, { recursive: true, force: true }); } catch {}
    }
  });

});
