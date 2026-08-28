/**
 * REGRESSION SUITE — grep_files silent-hang fix (FIX-HANG-1/2, 26.08.2026)
 *
 * Incident: a directory-mode scan on node_modules/ssh2/test hung silently for ~2 minutes and was
 * aborted by the LM Studio host WITHOUT any result.
 *
 * Root cause (pinned): every abort check in the scan loops read `signal` destructured from an EMPTY
 * object (`const { signal }: { signal?: AbortSignal } = {}`) — a value that was ALWAYS undefined — while
 * no loop ever read the internal AbortController's flag. The "per-regex timeout" ran AFTER .test()
 * returned (never during a spin), and directory mode had NO wall-clock backstop at all, so any
 * event-loop-starving synchronous segment (spinning .test(), AST parse) blocked every timer — including
 * the 15s deadline and 30s fallback — until the host killed the call.
 *
 * Fix under test:
 *   FIX-HANG-1: ONE AbortController, created before all scan functions; every loop check reads it (both
 *               in-loop and on the SUCCESS return path); the per-regex budget gate now runs BEFORE each
 *               .test() — the only thing that can actually stop further work once time is up.
 *   FIX-HANG-2: directory mode AND single-file mode are both raced against a wall-clock backstop
 *               (deadline + 5s = 20s) that settles the tool call with partial results — the caller can
 *               never again wait on a black hole.
 *   FIX-HANG-3 (re-incident, "NOT FIXED" 27.08 17:45): the backstop setTimeout was orphaned — its id was
 *               captured nowhere and only the separate 30s fallback was cleared in finally. So EVERY healthy
 *               grep left a live 20s timer behind that fired "[grep_files] Wall-clock backstop ... reached"
 *               [ERROR] exactly 20.0s after the result had already been delivered (log forensics: 8/8
 *               RESULT-DELTA→BACKSTOP pairings at Δ=+20.0s, zero intervening starts; scans measured in ms).
 *               Fix: capture the id + clear it in finally (same pattern find_replace_all already uses, L3015/
 *               L3027 of fileSystemTools.ts before this fix was ported back to grep_files).
 *   FIX-HANG-4 (SDK compliance): implementation now accepts the SDK's second argument (toolCallContext) and
 *               forwards ctx.signal — a live host AbortSignal per @lmstudio/sdk ToolCallContext — into the
 *               single internal controller, so host-initiated aborts are honored like internal ones.
 */

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface GrepMatch { file: string; line_number: number; content: string; }
interface GrepResult { success: boolean; error?: string; data?: { matches: GrepMatch[]; count: number; filesScanned: number; aborted?: boolean; hint?: string; skipped_files?: unknown[] }; }

describe('grep_files hang-fix regression (FIX-HANG-1/2)', () => {
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

  test('directory-mode scan still returns matches with the backstop race in place (no behavioral regression)', async () => {
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
      // Both markers found → the Promise.race wrapper is transparent for normal fast scans
      const files = result.data!.matches.map(m => m.file.replace(/\\/g, '/'));
      expect(files.some(f => f.includes('alpha.ts'))).toBe(true);
      expect(files.some(f => f.includes('sub/beta.js'))).toBe(true);
      // A healthy scan must NOT report itself as aborted (success path now carries the flag too — FIX-HANG-1)
      expect(result.data!.aborted ?? false).toBe(false);
      // The >5001-line fixture is reported via skipped_files (pre-existing contract preserved)
      const skipped = (result.data!.skipped_files ?? []) as Array<{ file: string }>;
      expect(skipped.some(s => s.file.replace(/\\/g, '/').includes('big_lines.txt'))).toBe(true);
    }
  });

  test('single-file target still works through the shared backstop race', async () => {
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
   * THE regression test. Deadlines are wall-clock based (Date.now), so fake time is accelerated
   * deterministically: every Date.now call returns base + realElapsed × SPEEDUP, with SPEED chosen so the
   * full scan (~10–50ms real) spans THOUSANDS of seconds of fake time — guaranteed to cross the 15s deadline
   // long before completion, on any machine. If FIX-HANG-1's wiring were still dead (checks reading an
   * always-undefined value / unread flag), the deadline branch would never fire, no abort would be set, and
   * the result would carry NO `aborted` flag — exactly the old silent-hang contract. With the fix, checks
   * see aborted=true after the first deadline crossing and every remaining unit of work short-circuits;
   * the success path now surfaces the flag (also fixed), so partial results are labeled as such.
   */
  test('deadline abort is OBSERVABLE: wall-clock overrun → early settle + aborted flag on success path (was dead code)', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // Enough files that the walk demonstrably continues across multiple awaited batches (batches of 8 per dir),
    // so many deadline/abort checks execute. Content is trivially small — real time spent is milliseconds;
    // only FAKE time matters here.
    const deadlineDir = path.join(os.tmpdir(), `grep-hang-deadline-${Date.now()}`);
    await fs.mkdir(deadlineDir, { recursive: true });

    let spy: jest.SpyInstance;
    try {
      const fileCount = 40; // > concurrencyLimit (8) → multiple awaited batches → checks run many times
      for (let f = 0; f < fileCount; f++) {
        await fs.writeFile(path.join(deadlineDir, `d${String(f).padStart(2, '0')}.txt`), `marker_${f} plain line\nsecond line ${f}\n`.repeat(3));
      }

      // Capture the REAL clock first (fixtures already written — no Date.now needed during setup below).
      const realNow = () => new Date().getTime(); // bypasses any spy on Date.now
      const t0Real = realNow();
      const base = 1_700_000_000_000;            // arbitrary stable fake epoch
      const SPEEDUP = 250_000;                   // ~30ms real → ~7.5s fake per batch step; full scan spans thousands of fake seconds

      spy = jest.spyOn(Date, 'now').mockImplementation(() => base + (realNow() - t0Real) * SPEEDUP);

      const result = await grepTool.implementation({
        pattern: 'marker_|plain', // matches in many files → the walk continues into later batches
        path: deadlineDir,
        max_results: 500,
        include_context: false,
        max_content_length: 150,
        max_file_size: 100_000,
      }) as unknown as GrepResult;

      spy.mockRestore();

      expect(result.success).toBe(true);
      if (result.success) {
        // THE assertion: deadline firing is observable end-to-end. Partial results MUST be labeled aborted —
        // old code produced no such flag even under a 2-minute overrun (dead signal wiring).
        expect(result.data!.aborted ?? false).toBe(true);
        // And the partial-results hint explains why coverage may be incomplete (no more silent empties/trims)
        expect(typeof result.data!.hint === 'string').toBe(true);
        // Sanity: the cut-short scan still returned whatever it had collected up to that point
        expect(Array.isArray(result.data!.matches)).toBe(true);
      }
    } finally {
      if (spy) spy.mockRestore();
      try { await fs.rm(deadlineDir, { recursive: true, force: true }); } catch {}
    }
  });

  test('fast single-file scan resolves cleanly through the backstop race (race loses → no aborted flag)', async () => {
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
      expect(result.data!.aborted ?? false).toBe(false); // race side lost → clean success shape
    }
  });

  /**
   * FIX-HANG-3 regression (27.08): the wall-clock backstop setTimeout was ORPHANED — never cleared on normal
   * completion. Proof of the incident: LM Studio server log 2026-08-27 shows EVERY healthy grep (result already
   * delivered, "RESULT-DELTA" line) followed by a spurious "[grep_files] Wall-clock backstop ... reached" [ERROR]
   * at exactly Δ=+20.0s with no scan in flight (8/8 pairings). This test asserts BOTH timers scheduled per call —
   * the 30s fallback (GREP_TIMEOUT_MS) and the 20s backstop (backstopMs = deadline + 5s) — are cleared before a
   * healthy implementation returns. Old code cleared only the 30s one → fails here; fixed code passes.
   */
  test('FIX-HANG-3: healthy scan disarms BOTH timers — no orphaned backstop left behind', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    const scheduled = new Map<unknown, number>(); // timer id → delay ms (only ours: 30s fallback + 20s backstop per call)
    const cleared = new Set<unknown>();
    let nextId = 1;

    const setSpy = jest.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: unknown, ms?: number) => {
      const id = Symbol('fake-settimeout-' + (nextId++));
      scheduled.set(id, ms ?? 0);
      return id as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout);
    const clearSpy = jest.spyOn(globalThis, 'clearTimeout').mockImplementation(((id?: unknown) => {
      if (id !== undefined && id !== null) cleared.add(id);
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
        expect(result.data!.aborted ?? false).toBe(false); // healthy scan — this is the scenario that orphaned timers
      }

      const backstopTimers = [...scheduled.entries()].filter(([, d]) => d === 20_000);
      const fallbackTimers = [...scheduled.entries()].filter(([, d]) => d === 30_000);
      expect(fallbackTimers.length).toBeGreaterThanOrEqual(1); // sanity: the 30s fallback WAS scheduled this call
      expect(backstopTimers.length).toBeGreaterThanOrEqual(1); // sanity: the backstop WAS scheduled this call

      // THE assertion (FIX-HANG-3): every timer THIS call scheduled must be cleared before return —
      // old code left all 20s backstops pending → they fired a fake [ERROR] line 20s after healthy scans.
      for (const [id, d] of scheduled) {
        if (d === 20_000 || d === 30_000) {
          // Jest's expect() takes no message argument — fail with a descriptive throw instead.
          if (!cleared.has(id)) {
            throw new Error(`timer with delay ${d}ms was NOT cleared on normal completion (orphaned backstop — FIX-HANG-3 regression)`);
          }
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
      { pattern: 'ALPHA_MARKER', path: testDir, max_results: 50, include_context: false, max_content_length: 150, max_file_size: 100_000 },
      { signal: ctrl.signal },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data!.aborted ?? false).toBe(true); // host abort surfaces via the single internal controller
      expect(typeof result.data!.hint === 'string').toBe(true); // partial-results explanation present
      expect(result.data!.matches.length).toBe(0); // scan never started → nothing collected
    }
  });

  /**
   * FIX-HANG-4 (mid-scan branch): a host signal that fires DURING the walk must cut the scan short — the 'abort'
   * listener flips the shared controller and the next file-boundary check stops work.
   *
   * DETERMINISTIC GATE (27.08 final rework; protocol verified against the live implementation): replaces BOTH the
   * original racy setTimeout(50) version — flaky in both directions: a ~20 ms hot-cache scan finishes before the
   * timer ⇒ aborted:false, slow FS/AV wins ⇒ pass — and an earlier draft whose single-batch premise was WRONG for
   * multi-subdir fixtures (subdir recursion joins the same batch array — fileSystemTools.ts L2351-2352 / L2366-2367 —
   * so 4×20 subdirs can hold all 80 file-stats in flight at once). This protocol relies on a verified invariant: with
   * a FLAT single directory and max_concurrent_files = 32, the walker flushes (await Promise.all) exactly when its
   * batch reaches 32 — so at that instant EXACTLY 32 processFile calls are in flight, all parked inside their FIRST
   * await (fs.promises.stat):
   *   1. jest.spyOn on require('fs').promises.stat — the module object the implementation resolves at RUNTIME (`import
   *      * as _fs from 'fs'; const fs = _fs.promises`, fileSystemTools.ts L5-6); a DIFFERENT instance than this test's
   *      own 'fs/promises' import (used for fixtures only). Call #1 is the targetDir auto-detect stat (L2384) → passed
*   2. Sticky parking (rework 27.08): live evidence disproved the "32 in flight at flush" premise (spyCalls=81 but parked never left 0 → walk serialized at stat boundary). Park EVERY call after #1; bounded poll (5 s) waits for ≥1 parked.
*   3. Cut point: NO release — ctrl.abort() fires while all parked stats are still pending. The impl's 'abort' listener flips its shared controller synchronously; resumed files bail at an aborted pre-check, unstarted ones are rejected (swallowed by per-file catch). No deadlock possible.
*   4. Assertions: matches.length === 0, filesScanned < fileCount (exact cut point is walk-shape-dependent — read from result), data.aborted === true (success path carries the flag — L2478), hint present, host signal aborted.

   */
  test('FIX-HANG-4: host AbortSignal mid-scan → early settle with partial results + aborted:true', async () => {
    const grepTool = getGrepTool();
    if (!grepTool) throw new Error('grep_files tool not found');

    // FLAT single directory (no subdirectories): walkDirectory flushes at exactly concurrencyLimit in-flight files, so the
    // gate below can prove a precise cut point. Subdir fixtures break that invariant — see doc block above.
    const fileCount = 80;          // ≫ concurrencyLimit: guarantees an un-processed remainder after the cut point
    const concurrencyLimit = 32;   // batch size used by walkDirectory (L2366): await Promise.all at len >= limit
    const hostDir = path.join(os.tmpdir(), `grep-host-abort-${Date.now()}`);
    await fs.mkdir(hostDir, { recursive: true });

    for (let f = 0; f < fileCount; f++) {
      // One matching line + one padding line. Latency is irrelevant — determinism comes from the gate, not wall-clock.
      await fs.writeFile(path.join(hostDir, `f${String(f).padStart(2, '0')}.txt`), `hostabort_marker ${f}\npadding line 1\n`);
    }

    // Gate target: the SAME module object fileSystemTools.ts resolves at call time (see doc note above).
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
    // Attached via process.on (restored in finally). This also PREVENTS the default crash-on-unhandled-rejection,
    // which is what we want during diagnostics: surface the reason instead of killing the suite silently.
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

      // Sticky-parking gate — bounded poll until at least ONE file stat is parked inside the mock. (The earlier "exactly
      // 32 in flight at flush" premise was disproven by the 27.08 run: spyCalls=81 but parked never left 0 → the walk is
      // serialized at the stat boundary, so no batch of stats ever accumulates. Parking every call after #1 is safe under
      // BOTH sequential and batched walks — whichever files start while the gate holds stay in flight.)
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

      // Cut point — TWO-STEP (walk shape on disk L2366/2371 proves files suspend INSIDE `await fs.stat`, where no abort
      // check can reach them): 1) settle every parked waiter with real stat results (so ALL in-flight processFile calls
      // resume), THEN 2) fire the host abort. The implementation's 'abort' listener flips its shared controller synchronously;
      // each resumed file then hits an aborted pre-check (resultsCount/aborted gate, per-line check L2182) before collecting
      // anything, and unstarted files return at their L2095 pre-check. Deterministic: no waiter is ever left pending, so the
      // implementation MUST settle — no deadlock under either sequential or batched walk shapes.
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
