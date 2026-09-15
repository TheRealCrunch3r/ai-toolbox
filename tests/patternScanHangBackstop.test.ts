/**
 * patternScanHangBackstop.test.ts — HANG-GUARD backstops for the shared wall-clock cap wired into pattern_scan (05.09).
 *
 * Mirrors the grep_files hang-backstop contract (suite deleted in 14.09 TOOL SWAP):
 *   - ONE real setTimeout arms the PATTERN_SCAN_MAX_RUN_MS (3000 ms since 13.09 FIX-34a follow-up; was GREP_MAX_RUN_MS=500 inherited) cap inside createGrepGuard;
 *   - every cooperative boundary (B' gate loop, worker file-loop condition) reads guard.signal.aborted;
 *   - disarm() in finally clears the timer on EVERY completion path — a healthy scan must never let a stray
 *     "wall-clock cap reached" warn fire AFTER it returned (orphan-timer regression class of FIX-HANG-3).
 *
 * Cap-fire test uses jest fake timers + advanceTimersByTimeAsync so the guard's deadline fires deterministically;
 * real fs I/O still completes between advances (same recipe as the grep_files suite, green 10/10 on user host).
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { patternScan } from '../src/tools/patternScan';
import { PATTERN_SCAN_MAX_RUN_MS } from '../src/utils/grepGuard.js';

const FIXTURE_FILE_COUNT = 400; // comfortably more files than a scan can finish inside the fake cap window (13.09: constant now PATTERN_SCAN_MAX_RUN_MS=3000)
let fixtureDir: string;
let miniDir: string; // 2-file real-timer fixture — must finish inside a REAL cap window on any sane machine

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

describe('pattern_scan HANG-GUARD wall-clock cap (05.09)', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('fast small scan resolves cleanly under the guard — no aborted flag, no stray cap warn', async () => {
    // Real timers: a 2-file fixture finishes far inside the real wall window → cap timer must be disarmed pre-fire.
    // (14.09 read-back fix: this suite does NOT set fakeTimers.enableGlobally, so test #1 runs with REAL timers and is
    // governed by pattern_scan's OWN PATTERN_SCAN_MAX_RUN_MS=3000 guard — the "500 ms" here was stale inherited-GREP-era text.)
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const result = await patternScan({ pattern: 'needle', root: miniDir });
      expect(result.ok).toBe(true);
      expect(result.matches.length).toBe(1); // a.txt only — b.txt has no needle
      expect((result.aborted ?? false)).toBe(false); // healthy scan must NOT report itself aborted
      // No ORPHANED CAP-TIMER warn (the FIX-HANG-3 class): the guard's line reads `[pattern_scan] wall-clock cap (...ms) reached — aborting`.
      // Benign worker-pool lifecycle warns ([worker-pool] probe baseline / spawn / drain — added 05.09 pool rework, console.warn by
      // design until their log-level audit lands) are allowed: this test pins the stray-cap-timer regression, not a global silence.
      const strayCapWarns = warnSpy.mock.calls.filter((c) => typeof c[0] === 'string' && /\[pattern_scan\] wall-clock cap/.test(c[0]));
      expect(strayCapWarns).toEqual([]);
    } finally {
      warnSpy.mockRestore();
    }
  });

  // Explicit real-time budget (25 s vs global testTimeout 10 s, jest.config.cjs): determinism of the cap firing comes from
  // the FAKE clock (Phase 1 advances exactly to ~3060 ms = PATTERN_SCAN_MAX_RUN_MS+60; Phase 2 then drains until settle — see below),
  // but this test's REAL cost is host-dependent — each
  // advanceTimersByTimeAsync round flushes real fs I/O over the 400-file fixture, which on a loaded/AV-scanned host can
  // exceed 10 s (incident 14.09 ~17:48: suite failed at exactly the global timeout; assertions themselves are unchanged).
  test('cap expiry is OBSERVABLE: fake-clock advance past the pattern_scan wall cap mid-scan → early settle + aborted flag', async () => {
    // Real-time anchor captured BEFORE fake install (Phase 2's wall guard): default useFakeTimers() also fakes Date, so any
    // post-install read of the GLOBAL Date is FAKE time. Capture both a timestamp and a reference to the NATIVE constructor —
    // a closure that merely calls `Date.now()` would resolve the swapped (fake) global at call time.
    const realStartMs = Date.now();
    const NativeDate = Date; // pre-install reference — keeps working after the global is replaced by the fake
    jest.useFakeTimers();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined); // keep cap-fire warn out of test output
    let result: Awaited<ReturnType<typeof patternScan>> | null = null;
    try {
      const p = patternScan({ pattern: 'needle', root: fixtureDir }); // start WITHOUT awaiting — guard arms its PATTERN_SCAN_MAX_RUN_MS deadline now
      let settled = false;
      p.then((r) => { result = r; settled = true; }, () => { settled = true; });
      // Phase 2 bounds (realStartMs + NativeDate captured at test head BEFORE install — see above): post-install global Date is fake.
      const REAL_DEADLINE_MS = 20_000; // wall-clock bound for Phase 2 (fits under the 25 s per-test budget below with margin)
      const wallElapsedMs = (): number => new NativeDate().getTime() - realStartMs;

      // PHASE 1 — deterministic deadline crossing (13.09 FIX-34a follow-up: advance past the tool's OWN cap constant, not a
      // fixed window sized to the old inherited 500 ms wall): exactly PATTERN_SCAN_MAX_RUN_MS+60 (=3060) fake ms in bounded
      // 30 ms steps guarantees the guard's faked setTimeout(PATTERN_SCAN_MAX_RUN_MS) fires while real I/O flushes between
      // advances. The crossed deadline is a FLOOR, not a ceiling: after abort, completion still rides on pending FAKE timers
      // inside regexWorker.ts (capacity-wake setTimeout(0), spawn rate-limit sleep(), per-eval watchdog — some deadlines can
      // land past 3060) and default useFakeTimers() also fakes Date/nextTick/queueMicrotask with jobs draining only at tick
      // boundaries. The 14.09 stall: the old loop broke out of this phase even while `p` was unsettled, after which NOTHING
      // could fire those pending fake timers/jobs → `await p` stalled on real time forever (identical failure at both 10 s
      // and 25 s budgets = permanent stall, not host load).
      const stepsToDeadline = Math.ceil((PATTERN_SCAN_MAX_RUN_MS + 60) / 30);
      for (let i = 0; i < stepsToDeadline && !settled; i++) {
        if ((i + 1) * 30 > PATTERN_SCAN_MAX_RUN_MS + 60) break; // deadline provably crossed (+60ms settle slack) BEFORE the next flush
        await jest.advanceTimersByTimeAsync(30); // fake clock + flush pending real I/O each step; stop early if already settled
      }

      // PHASE 2 — settle-drain (14.09 root-cause fix): advance until `p` settles, bounded by REAL wall time + a hard step
      // count. Each step is one more small fake-clock advance with the same real fs flushes as Phase 1, so pending fake
      // timers/microtask-jobs whose deadlines land past 3060 now get their ticks and fire; on any sane host settlement lands
      // long before either bound (the wall guard exists because Date is faked — without it an overrun would be invisible).
      const MAX_SETTLE_STEPS = 40_000; // ≫ realistic settle depth (few hundred fake timers/jobs post-abort); hard backstop only
      for (let i = 0; !settled && i < MAX_SETTLE_STEPS && wallElapsedMs() < REAL_DEADLINE_MS; i++) {
        await jest.advanceTimersByTimeAsync(1); // one fake ms + flush pending real I/O each step; stops the moment `p` settles
      }

      result = await p;
    } finally {
      warnSpy.mockRestore();
    }

    expect(result!.ok).toBe(true); // cap-trimmed scan still returns a successful PARTIAL result (never throws)
    expect((result!.aborted ?? false)).toBe(true); // THE assertion: deadline firing is observable end-to-end
    expect(result!.matches.length).toBeLessThanOrEqual(FIXTURE_FILE_COUNT);
    expect(result!.stats.filesScanned).toBeLessThan(FIXTURE_FILE_COUNT); // partial — most targets never reached a worker boundary
  }, 25_000); // explicit real-time budget (see note above the test) — fake clock stays deterministic; wall cost is host-dependent

  test('pre-aborted host signal: scan settles immediately with aborted flag (host cancel contract)', async () => {
    const ac = new AbortController();
    ac.abort(); // already-fired one-way host signal, as ToolCallContext would deliver after user cancel
    const result = await patternScan({ pattern: 'needle', root: fixtureDir, abortSignal: ac.signal });
    expect(result.ok).toBe(true);
    expect((result.aborted ?? false)).toBe(true);
    // Guard's constructor forwards an already-aborted host signal into the internal controller immediately — no I/O should be meaningful.
  });
});
