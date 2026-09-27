/**
 * patternScanHangBackstop.test.ts — HANG-GUARD backstops for pattern_scan's cooperative abort contract (05.09; cap RE-ARMED 24.09).
 *
 * Contract under test: createGrepGuard(hostSignal, PATTERN_SCAN_MAX_RUN_MS=3_000) — ONE guard with TWO abort sources: the wall-clock
 * deadline and any HOST signal (user cancel / host timeout via ToolCallContext.signal), converging on guard.signal. History: DE-STRAngle
 * (16.09) removed the cap (deadlineMs=0, signal-only); owner order 24.09 ("abort after 3 seconds") re-armed it after the >60 s
 * zero-payload incident on slow FS — an unbounded walk proved worse than bounded partials. What this suite pins:
 *   - every cooperative boundary (worker file-loop condition) reads guard.signal.aborted;
 *   - disarm() in finally releases the deadline timer AND the host-signal listener on EVERY completion path — a healthy scan must
 *     never leak either or let any stray warn fire AFTER it returned (orphan-timer regression class of FIX-HANG-3, kept as the general contract);
 *   - THE wall cap fires: advancing the fake clock past PATTERN_SCAN_MAX_RUN_MS yields an aborted=true PARTIAL result with genuine
 *     survivors; a fast scan settling well before the deadline stays un-aborted (regime-tolerant — host-speed dependent).
 *
 * The clock-dependent legs use jest fake timers + advanceTimersByTimeAsync so the clock advancement is deterministic; real fs I/O
 * still completes between advances (same recipe as the grep_files suite, green on user host).
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { patternScan } from '../src/tools/patternScan';
import { PATTERN_SCAN_MAX_RUN_MS } from '../src/utils/grepGuard'; // RE-ARM 24.09: leg A fires the deadline at exactly this fake-time offset

const FIXTURE_FILE_COUNT = 400; // full-coverage fixture for the no-cap contract — every file MUST be scanned to completion un-aborted
let fixtureDir: string;
let miniDir: string; // 2-file real-timer fixture for the healthy-path test (finishes fast on any sane machine)

beforeAll(async () => {
  fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ps-hang-backstop-'));
  const writes: Promise<unknown>[] = [];
  for (let i = 1; i <= FIXTURE_FILE_COUNT; i++) {
    writes.push(fs.writeFile(path.join(fixtureDir, `f${String(i).padStart(3, '0')}.txt`), `line one\nneedle here ${i}\nlast line\n`, 'utf-8'));
  }
  await Promise.all(writes);
  miniDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ps-hang-mini-'));
  await Promise.all([
    fs.writeFile(path.join(miniDir, 'a.txt'), 'needle one\n', 'utf-8'),
    fs.writeFile(path.join(miniDir, 'b.txt'), 'no match here\n'),
  ]);
});

afterAll(async () => {
  await fs.rm(fixtureDir, { recursive: true, force: true }).catch(() => undefined);
  await fs.rm(miniDir, { recursive: true, force: true }).catch(() => undefined);
});

describe('pattern_scan HANG-GUARD abort contract (05.09; wall cap RE-ARMED at PATTERN_SCAN_MAX_RUN_MS, owner order 24.09)', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('fast small scan resolves cleanly under the guard — no aborted flag, no stray cap warn', async () => {
    // Real timers: a 2-file fixture settles far inside the armed PATTERN_SCAN_MAX_RUN_MS deadline — nothing may fire before return;
    // disarm() in finally then releases the timer + host-signal listener on every path, so NO cap warn may leak after settle.
    // (This suite does NOT set fakeTimers.enableGlobally, so this test runs with REAL timers.)
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const result = await patternScan({ pattern: 'needle', root: miniDir });
      expect(result.ok).toBe(true);
      expect(result.matches.length).toBe(1); // a.txt only — b.txt has no needle
      expect((result.aborted ?? false)).toBe(false); // healthy scan must NOT report itself aborted
      // No ORPHANED GUARD warn (the FIX-HANG-3 class): the guard DOES arm a 3 s wall deadline since RE-ARM 24.09 — but on this healthy
      // fast scan it never fires, and disarm() in finally must cancel it after settle; any '[pattern_scan] wall-clock cap' line here
      // means an orphaned timer/listener survived past return (no regex-worker pool is involved, so nothing else can emit that warn).
      // Pins leakage of THIS tool, not global silence of unrelated suites.
      const strayCapWarns = warnSpy.mock.calls.filter((c) => typeof c[0] === 'string' && /\[pattern_scan\] wall-clock cap/.test(c[0]));
      expect(strayCapWarns).toEqual([]);
    } finally {
      warnSpy.mockRestore();
    }
  });

  // Explicit real-time budgets (30 s vs global testTimeout 10 s, jest.config.cjs): the FAKE clock makes advancement deterministic,
  // but each advanceTimersByTimeAsync round flushes REAL fs I/O over the fixture — on a loaded/AV-scanned host that is slow
  // (incident 14.09 ~17:48: suite failed at exactly the global timeout). afterEach restores real timers for every test here.

  test('wall cap RE-ARMED 24.09: fake clock past PATTERN_SCAN_MAX_RUN_MS → cooperative abort, PARTIAL result, cap warn fired', async () => {
    // Real-time anchor captured BEFORE fake install (Phase 2's wall guard): default useFakeTimers() also fakes Date, so any
    // post-install read of the GLOBAL Date is FAKE time. Capture both a timestamp and a reference to the NATIVE constructor —
    // a closure that merely calls `Date.now()` would resolve the swapped (fake) global at call time.
    const realStartMs = Date.now();
    const NativeDate = Date; // pre-install reference — keeps working after the global is replaced by the fake
    jest.useFakeTimers();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined); // keep cap-fire warn out of test output
    let result: Awaited<ReturnType<typeof patternScan>> | null = null;
    // 24.09 FIX (leg A red run): SNAPSHOT the call history INSIDE the try — jest-mock@30's mockRestore() → mockReset() →
    // mockClear() DELETES this mock's recorded calls from its registry (node_modules/jest-mock: f.mockClear = () => _mockState.delete(f)), and
    // any later `warnSpy.mock.calls` read recreates a FRESH empty state. Reading post-restore therefore reported 0 even though the
    // deadline warn fired at fake t=3000ms (aborted=true proved the fire). Capturing here pins exactly what this test's own window saw.
    let capWarnCalls: unknown[][] = [];
    try {
      // NOTE: maxTotalMatches raised above default (200) so the ONLY stopping condition in this test is the WALL DEADLINE — not a
      // match-cap truncation. concurrency=1 makes the survivor set deterministic for any given fire point (the exact cutoff file
      // count is host-I/O-speed dependent, so we pin SHAPE + abort semantics here; full-coverage completeness lives in leg B below).
      const p = patternScan({ pattern: 'needle', root: fixtureDir, concurrency: 1, maxTotalMatches: FIXTURE_FILE_COUNT + 1 }); // start WITHOUT awaiting — the probe below advances the FAKE clock (the guard's deadline is a fake timer under useFakeTimers)
      let settled = false;
      p.then((r) => { result = r; settled = true; }, () => { settled = true; });

      // PHASE 1 — fire the deadline DETERMINISTICALLY: advance to exactly PATTERN_SCAN_MAX_RUN_MS + 100 ms of fake time in bounded
      // steps (each step also flushes pending real fs I/O). Under fake timers the cap fires no matter how fast/slow host I/O is —
      // this leg cannot be flipped by host load. Stop early only if the scan already settled (a 400-file fixture does not settle
      // inside a few ms on any sane host; that regime belongs to leg B).
      const FIRE_AT_MS = PATTERN_SCAN_MAX_RUN_MS + 100;
      for (let fakeMs = 0; fakeMs < FIRE_AT_MS && !settled; fakeMs += 50) {
        await jest.advanceTimersByTimeAsync(Math.min(50, FIRE_AT_MS - fakeMs)); // last step lands exactly at the cap +100 ms slack
      }

      // PHASE 2 — settle-drain (14.09 root-cause fix, kept): advance until `p` settles, bounded by REAL wall time (Date is faked →
      // NativeDate anchor) + a hard step count. Post-abort there is little real work left (in-flight reads finish), so this drain
      // is short; the bounds exist only because an unbounded wait on a stuck promise would be invisible in fake time.
      const REAL_DEADLINE_MS = 25_000; // fits under the 30 s per-test budget below with margin
      const wallElapsedMs = (): number => new NativeDate().getTime() - realStartMs;
      let steps = 0;
      while (!settled && steps < 40_000 && wallElapsedMs() < REAL_DEADLINE_MS) {
        await jest.advanceTimersByTimeAsync(1); // one fake ms + flush pending real I/O each step; stops the moment `p` settles
        steps++;
      }

      result = await p;
      capWarnCalls = warnSpy.mock.calls.slice(); // 24.09 FIX: capture INSIDE the try — finally's mockRestore() wipes the registry state (see declaration above)
    } finally {
      warnSpy.mockRestore();
    }

    expect(result!.ok).toBe(true); // cooperative abort → successful PARTIAL result, never a throw
    expect((result!.aborted ?? false)).toBe(true); // THE assertion of the 24.09 contract — wall deadline surfaced end-to-end through the guard
    const capWarns = capWarnCalls.filter((c) => typeof c[0] === 'string' && /\[pattern_scan\] wall-clock cap/.test(c[0]));
    expect(capWarns.length).toBe(1); // exactly ONCE inside THIS test's spy window (pre-restore snapshot): zero = lost deadline timer, >1 = orphaned-guard contamination (FIX-HANG-3 class)
    expect(result!.stats.filesScanned).toBeGreaterThanOrEqual(1); // ≥1 file provably passed pre-abort
    for (const m of result!.matches) { // survivors are genuine fixture lines only — no spurious or truncated entries
      expect(m.content.startsWith('needle here ')).toBe(true);
    }
  }, 30_000);

  test('fast scan settling BEFORE the deadline completes un-aborted (regime-tolerant: host speed decides complete vs partial)', async () => {
    // REGIME-TOLERANT LEG (host-speed dependent, by design — no artificial delay injected): pins what a HEALTHY fast scan must
    // produce. The guard's 3 s deadline is a fake timer here; the loop advances tiny fake steps while flushing real I/O until the
    // promise settles or ~20_000 ms of FAKE time has passed — far past PATTERN_SCAN_MAX_RUN_MS, so on a SLOW host this scan
    // legitimately aborts at 3 s and the leg asserts partial shape instead of failing (the DETERMINISTIC cap-fire contract is the
    // test above). Real-time anchor before fake install: default useFakeTimers() also fakes Date.
    const realStartMs = Date.now();
    const NativeDate = Date; // pre-install reference — post-install global Date is fake
    jest.useFakeTimers();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined); // keep a legitimate cap-fire warn (slow-host regime) out of test output — no assertion on it here; leg A pins the count
    let result: Awaited<ReturnType<typeof patternScan>> | null = null;
    try {
      const p = patternScan({ pattern: 'needle', root: fixtureDir, concurrency: 4, maxTotalMatches: FIXTURE_FILE_COUNT + 1 }); // default-ish concurrency; start WITHOUT awaiting — the probe below advances the FAKE clock while real I/O flushes
      let settled = false;
      p.then((r) => { result = r; settled = true; }, () => { settled = true; });

      const FAKE_BUDGET_MS = 20_000; // fake-time horizon for the drain (≫ the cap — a slow host lands in the aborted regime by design)
      const REAL_DEADLINE_MS = 25_000; // real wall bound (fits under the 30 s per-test budget below with margin); Date is faked → NativeDate
      const wallElapsedMs = (): number => new NativeDate().getTime() - realStartMs;
      for (let fakeMs = 0; fakeMs < FAKE_BUDGET_MS && !settled && wallElapsedMs() < REAL_DEADLINE_MS; fakeMs += 25) {
        await jest.advanceTimersByTimeAsync(25); // flush pending real I/O each step
      }

      result = await p;
    } finally {
      warnSpy.mockRestore();
    }

    expect(result!.ok).toBe(true);
    for (const m of result!.matches) { // both regimes: survivors are genuine fixture lines only — no spurious or truncated entries
      expect(m.content.startsWith('needle here ')).toBe(true);
    }
    if (!(result!.aborted ?? false)) {
      // COMPLETE regime — sane host, scan settled well inside the deadline: FULL un-aborted coverage.
      expect(result!.stats.filesScanned).toBe(FIXTURE_FILE_COUNT);
      expect(result!.skipped).toEqual([]);
      const needleMatches = result!.matches.filter((m) => m.content.includes('needle here'));
      expect(needleMatches.length).toBe(FIXTURE_FILE_COUNT); // every file's line 2 matched — full deterministic coverage, not just a survivor prefix
    } else {
      // ABORTED regime — slow host: wall cap fired before completion (deterministic assertion for that outcome lives in leg A; here
      // we only require shape consistency so this leg never flips green↔red on host load).
      expect(result!.stats.filesScanned).toBeGreaterThanOrEqual(1);
      expect(result!.stats.filesScanned).toBeLessThan(FIXTURE_FILE_COUNT);
    }
  }, 30_000); // explicit real-time budget (host-load dependent, same rationale as leg A) — fake clock stays deterministic

  test('mid-scan HOST signal aborts cooperatively with PARTIAL results (RE-ARM 24.09: one of two abort sources, alongside the wall deadline)', async () => {
    // Contract for aborted=true via a HOST signal (user cancel / host timeout) — checked at every file boundary; since RE-ARM 24.09 the
    // armed wall deadline is the second, independent source (pinned in leg A above). Both converge on guard.signal.aborted.
    // Fake timers + bounded advances let the walk and a few sequential file boundaries pass before we fire the controller;
    // the drain loop then settles the scan on REAL time (same recipe as the no-cap test above). afterEach restores real timers.
    const realStartMs = Date.now();
    const NativeDate = Date; // pre-install reference — post-install global Date is fake
    jest.useFakeTimers();

    const ac = new AbortController();
    let result: Awaited<ReturnType<typeof patternScan>> | null = null;
    // Raise match cap well above expected survivors so that the stopping condition in this test is the HOST signal (fired ≪3000 ms of fake time) — not match-cap truncation or the wall deadline.
    const p = patternScan({ pattern: 'needle', root: fixtureDir, concurrency: 1, maxTotalMatches: FIXTURE_FILE_COUNT + 1, abortSignal: ac.signal }); // sequential → predictable boundary cadence
    let settled = false;
    p.then((r) => { result = r; settled = true; }, () => { settled = true; });

    // Let the walk + several file boundaries complete (each advance flushes pending real fs I/O), then cancel mid-scan.
    for (let i = 0; i < 40 && !settled; i++) await jest.advanceTimersByTimeAsync(1);
    expect(settled).toBe(false); // sanity: still in flight after a few boundaries — else this test would be vacuous (fail loudly on pipeline change)
    ac.abort(); // host cancel (independent of the armed wall deadline — this scan settles far before 3000 ms of fake time elapse)

    const REAL_DEADLINE_MS = 20_000; // wall-clock bound for the drain (fits under the 25 s per-test budget below with margin)
    const wallElapsedMs = (): number => new NativeDate().getTime() - realStartMs;
    let steps = 0;
    while (!settled && steps < 40_000 && wallElapsedMs() < REAL_DEADLINE_MS) { // drain until settled (bounded, as in the no-cap test above)
      await jest.advanceTimersByTimeAsync(1);
      steps++;
    }

    result = await p;
    expect(result.ok).toBe(true); // cooperative abort → successful PARTIAL result, never a throw
    expect((result.aborted ?? false)).toBe(true); // host signal surfaced end-to-end through the guard
    expect(result.stats.filesScanned).toBeGreaterThanOrEqual(1); // ≥1 boundary provably passed pre-abort (sanity check above)
    expect(result.stats.filesScanned).toBeLessThan(FIXTURE_FILE_COUNT); // remaining files were cut off at their next file boundary → partial, not full
    for (const m of result.matches) { // survivors are genuine fixture lines only — no spurious or truncated entries
      expect(m.content.startsWith('needle here ')).toBe(true);
    }
  }, 25_000); // explicit real-time budget (host-load dependent, same rationale as the no-cap test above)

  test('pre-aborted host signal: scan settles immediately with aborted flag (host cancel contract)', async () => {
    const ac = new AbortController();
    ac.abort(); // already-fired one-way host signal, as ToolCallContext would deliver after user cancel
    const result = await patternScan({ pattern: 'needle', root: fixtureDir, abortSignal: ac.signal });
    expect(result.ok).toBe(true);
    expect((result.aborted ?? false)).toBe(true);
    // Guard's constructor forwards an already-aborted host signal into the internal controller immediately — no I/O should be meaningful.
  });
});
