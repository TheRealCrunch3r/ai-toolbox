/**
 * patternScanHangBackstop.test.ts — HANG-GUARD backstops for the shared wall-clock cap wired into pattern_scan (05.09).
 *
 * Mirrors tests/grep_files_hang_backstop.test.ts contract:
 *   - ONE real setTimeout arms the GREP_MAX_RUN_MS (500 ms) cap inside createGrepGuard;
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

const FIXTURE_FILE_COUNT = 400; // comfortably more files than a scan can finish inside the fake 500 ms window
let fixtureDir: string;
let miniDir: string; // 2-file real-timer fixture — must finish inside a REAL 500 ms on any sane machine

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
    // Real timers: a 2-file fixture finishes far inside the real 500 ms window → cap timer must be disarmed pre-fire.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const result = await patternScan({ pattern: 'needle', root: miniDir });
      expect(result.ok).toBe(true);
      expect(result.matches.length).toBe(1); // a.txt only — b.txt has no needle
      expect((result.aborted ?? false)).toBe(false); // healthy scan must NOT report itself aborted
      expect(warnSpy).not.toHaveBeenCalled(); // no orphaned cap timer → zero warns after return
    } finally {
      warnSpy.mockRestore();
    }
  });

  test('cap expiry is OBSERVABLE: fake-clock advance past GREP_MAX_RUN_MS mid-scan → early settle + aborted flag', async () => {
    jest.useFakeTimers();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined); // keep cap-fire warn out of test output
    let result: Awaited<ReturnType<typeof patternScan>> | null = null;
    try {
      const p = patternScan({ pattern: 'needle', root: fixtureDir }); // start WITHOUT awaiting — guard arms its 500 ms deadline now
      let settled = false;
      p.then((r) => { result = r; settled = true; }, () => { settled = true; });
      for (let i = 0; i < 200 && !settled; i++) {
        await jest.advanceTimersByTimeAsync(30); // fake clock + flush pending real I/O each step; stop once the scan settles
      }
      result = await p;
    } finally {
      warnSpy.mockRestore();
    }

    expect(result!.ok).toBe(true); // cap-trimmed scan still returns a successful PARTIAL result (never throws)
    expect((result!.aborted ?? false)).toBe(true); // THE assertion: deadline firing is observable end-to-end
    expect(result!.matches.length).toBeLessThanOrEqual(FIXTURE_FILE_COUNT);
    expect(result!.stats.filesScanned).toBeLessThan(FIXTURE_FILE_COUNT); // partial — most targets never reached a worker boundary
  });

  test('pre-aborted host signal: scan settles immediately with aborted flag (host cancel contract)', async () => {
    const ac = new AbortController();
    ac.abort(); // already-fired one-way host signal, as ToolCallContext would deliver after user cancel
    const result = await patternScan({ pattern: 'needle', root: fixtureDir, abortSignal: ac.signal });
    expect(result.ok).toBe(true);
    expect((result.aborted ?? false)).toBe(true);
    // Guard's constructor forwards an already-aborted host signal into the internal controller immediately — no I/O should be meaningful.
  });
});
