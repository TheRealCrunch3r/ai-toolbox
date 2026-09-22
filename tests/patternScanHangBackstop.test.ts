/**
 * patternScanHangBackstop.test.ts — HANG-GUARD backstops for pattern_scan's cooperative abort contract (05.09; DE-STRAngle 16.09).
 *
 * Mirrors the grep_files hang-backstop contract in its post-DE-STRAngle form: the former PATTERN_SCAN_MAX_RUN_MS wall cap is
 * REMOVED — since FIX-34a (13.09) the pipeline is fully async with inline host eval, so no wall clock exists at all and
 * Cancellation = HOST SIGNAL only (createGrepGuard signal-only mode, deadlineMs=0 → NO timer armed). What this suite pins:
 *   - every cooperative boundary (worker file-loop condition) reads guard.signal.aborted;
 *   - disarm() in finally releases the host-signal listener on EVERY completion path — a healthy scan must never leak it or let
 *     any stray warn fire AFTER it returned (orphan-timer regression class of FIX-HANG-3, kept as the general contract);
 *   - NO wall-clock behavior remains: advancing a fake clock far past every former cap value still yields FULL un-aborted
 *     completion — a re-introduced timer/cap would abort early and fail this suite.
 *
 * The no-cap tests use jest fake timers + advanceTimersByTimeAsync so the clock advancement is deterministic; real fs I/O still
 * completes between advances (same recipe as the grep_files suite, green on user host).
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { patternScan } from '../src/tools/patternScan';

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

describe('pattern_scan HANG-GUARD abort contract (05.09; no wall cap since DE-STRAngle 16.09)', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('fast small scan resolves cleanly under the guard — no aborted flag, no stray cap warn', async () => {
    // Real timers: a 2-file fixture finishes fast. DE-STRAngle (16.09) removed pattern_scan's wall cap entirely — signal-only
    // mode arms NO timer, so there is nothing to fire; disarm() in finally releases the host-signal listener on every path.
    // (This suite does NOT set fakeTimers.enableGlobally, so this test runs with REAL timers.)
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const result = await patternScan({ pattern: 'needle', root: miniDir });
      expect(result.ok).toBe(true);
      expect(result.matches.length).toBe(1); // a.txt only — b.txt has no needle
      expect((result.aborted ?? false)).toBe(false); // healthy scan must NOT report itself aborted
      // No ORPHANED GUARD warn (the FIX-HANG-3 class): pattern_scan arms no wall-clock timer since DE-STRAngle (16.09) — with
      // deadlineMs=0 the guard's cap-warn line can never fire — and it no longer dispatches to the regex worker pool, so NO
      // '[pattern_scan]' warn is expected from this tool on a healthy scan: any match below means a stray timer/listener fired
      // after settle. Pins leakage of THIS tool, not global silence of unrelated suites.
      const strayCapWarns = warnSpy.mock.calls.filter((c) => typeof c[0] === 'string' && /\[pattern_scan\] wall-clock cap/.test(c[0]));
      expect(strayCapWarns).toEqual([]);
    } finally {
      warnSpy.mockRestore();
    }
  });

  // Explicit real-time budget (25 s vs global testTimeout 10 s, jest.config.cjs): the FAKE clock makes the advancement deterministic,
  // but this test's REAL cost is host-dependent — each advanceTimersByTimeAsync round flushes real fs I/O over the 400-file fixture,
  // which on a loaded/AV-scanned host can exceed 10 s (incident 14.09 ~17:48: suite failed at exactly the global timeout).
  test('NO wall cap exists (DE-STRAngle 16.09): fake clock far past every former cap value → full fixture completes un-aborted', async () => {
    // Real-time anchor captured BEFORE fake install (Phase 2's wall guard): default useFakeTimers() also fakes Date, so any
    // post-install read of the GLOBAL Date is FAKE time. Capture both a timestamp and a reference to the NATIVE constructor —
    // a closure that merely calls `Date.now()` would resolve the swapped (fake) global at call time.
    const realStartMs = Date.now();
    const NativeDate = Date; // pre-install reference — keeps working after the global is replaced by the fake
    jest.useFakeTimers();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined); // keep cap-fire warn out of test output
    let result: Awaited<ReturnType<typeof patternScan>> | null = null;
    try {
      // NOTE: maxTotalMatches raised above default (200) to avoid truncation from match-cap interference with this HANG-GUARD test's contract.
    // The resource limit `maxTotalMatches` is orthogonal to wall-clock aborts — we must scan all 400 files even when their
    // aggregate matches exceed the default cap; otherwise a truncated result would mask the true purpose of this suite (no time-based cutoff).
    const p = patternScan({ pattern: 'needle', root: fixtureDir, maxTotalMatches: FIXTURE_FILE_COUNT + 1 }); // start WITHOUT awaiting — signal-only mode, so NO internal deadline is armed; the probe below advances the FAKE clock instead
      let settled = false;
      p.then((r) => { result = r; settled = true; }, () => { settled = true; });
      // Phase 2 bounds (realStartMs + NativeDate captured at test head BEFORE install — see above): post-install global Date is fake.
      const REAL_DEADLINE_MS = 20_000; // wall-clock bound for Phase 2 (fits under the 25 s per-test budget below with margin)
      const wallElapsedMs = (): number => new NativeDate().getTime() - realStartMs;

      // PHASE 1 — deterministic far-past-cap advancement: FORMER_CAP_SLACK_MS of fake ms in bounded 30 ms steps while real
      // I/O flushes between advances. Nothing in this pipeline may fire at ANY of these deadlines (no wall cap since DE-STRAngle;
      // no regex-worker pool involvement): the fake clock is a PROBE instrument here — if advancing past every legacy cap value
      // produced an abort or early settle, that would be a re-introduced-timer regression failing this suite. The 14.09 stall
      // lesson still shapes the structure: Phase 2 below drains to settlement rather than assuming a fixed horizon (an unbounded
      // `await p` under faked Date/timers could sit on real time forever if anything stalled).
      const FORMER_CAP_SLACK_MS = 3_500; // ≫ every value this tool ever had (inherited GREP-era 500 ms / PATTERN_SCAN_MAX_RUN_MS=3000) — probe window, not a deadline
      const stepsToDeadline = Math.ceil(FORMER_CAP_SLACK_MS / 30);
      for (let i = 0; i < stepsToDeadline && !settled; i++) {
        if ((i + 1) * 30 > FORMER_CAP_SLACK_MS) break; // full probe window elapsed BEFORE the next flush
        await jest.advanceTimersByTimeAsync(30); // fake clock + flush pending real I/O each step; stop early if already settled
      }

      // PHASE 2 — settle-drain (14.09 root-cause fix, kept): advance until `p` settles, bounded by REAL wall time + a hard step
      // count. Each step is one more small fake-clock advance with the same real fs flushes as Phase 1; default useFakeTimers()
      // also fakes Date/nextTick with jobs draining only at tick boundaries, so pending fake timers/microtask-jobs get their
      // ticks here and an unbounded wait on a stuck promise would be invisible. On any sane host settlement lands long before
      // either bound (the wall guard exists because Date is faked).
      const MAX_SETTLE_STEPS = 40_000; // ≫ realistic settle depth (few hundred fake timers/jobs post-abort); hard backstop only
      for (let i = 0; !settled && i < MAX_SETTLE_STEPS && wallElapsedMs() < REAL_DEADLINE_MS; i++) {
        await jest.advanceTimersByTimeAsync(1); // one fake ms + flush pending real I/O each step; stops the moment `p` settles
      }

      result = await p;
    } finally {
      warnSpy.mockRestore();
    }

    expect(result!.ok).toBe(true);
    expect((result!.aborted ?? false)).toBe(false); // THE assertion of the new contract — no wall clock exists; only a HOST signal (none passed here) can abort
    expect(result!.stats.filesScanned).toBe(FIXTURE_FILE_COUNT); // FULL completion over all 400 files — any early cutoff would re-appear as a partial result
    expect(result!.skipped).toEqual([]);
    const needleMatches = result!.matches.filter((m) => m.content.includes('needle here'));
    expect(needleMatches.length).toBe(FIXTURE_FILE_COUNT); // every file's line 2 matched — full deterministic coverage, not just a survivor prefix
  }, 25_000); // explicit real-time budget (see note above the test) — fake clock stays deterministic; wall cost is host-dependent

  test('mid-scan HOST signal aborts cooperatively with PARTIAL results (DE-STRAngle 16.09 — now the only abort path)', async () => {
    // Post-DE-STRAngle contract for aborted=true: a HOST signal (user cancel / host timeout) checked at every file boundary.
    // Fake timers + bounded advances let the walk and a few sequential file boundaries pass before we fire the controller;
    // the drain loop then settles the scan on REAL time (same recipe as the no-cap test above). afterEach restores real timers.
    const realStartMs = Date.now();
    const NativeDate = Date; // pre-install reference — post-install global Date is fake
    jest.useFakeTimers();

    const ac = new AbortController();
    let result: Awaited<ReturnType<typeof patternScan>> | null = null;
    // Raise match cap well above expected survivors so that the ONLY stopping condition in this test is the HOST signal — not a match-cap truncation.
    const p = patternScan({ pattern: 'needle', root: fixtureDir, concurrency: 1, maxTotalMatches: FIXTURE_FILE_COUNT + 1, abortSignal: ac.signal }); // sequential → predictable boundary cadence
    let settled = false;
    p.then((r) => { result = r; settled = true; }, () => { settled = true; });

    // Let the walk + several file boundaries complete (each advance flushes pending real fs I/O), then cancel mid-scan.
    for (let i = 0; i < 40 && !settled; i++) await jest.advanceTimersByTimeAsync(1);
    expect(settled).toBe(false); // sanity: still in flight after a few boundaries — else this test would be vacuous (fail loudly on pipeline change)
    ac.abort(); // host cancel — the ONLY remaining abort source

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
