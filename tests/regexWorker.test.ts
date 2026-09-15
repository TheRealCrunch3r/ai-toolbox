/**
 * regexWorker — worker_threads isolation for synchronous regex evaluation (ITEM-B, 05.09).
 *
 * Pinned contracts:
 *   - first-match-per-line semantics (a line matching any pattern is reported exactly once, ascending indices);
 *   - /g-flagged patterns are stateless across lines (lastIndex reset per line — same as the pre-ITEM-B host loop);
 *   - the watchdog terminate()s a spinning catastrophic .test() (T1b class — FIXHANG-5 redos probe; evidence doc removed 08.09, in git history)
 *     and resolves kind:'budget' at ≈ budgetMs — THE load-bearing containment guarantee of ITEM-B;
 *   - externalSignal aborts in-flight evals early → kind:'aborted'; pre-aborted signals skip the worker entirely;
 *   - invalid pattern sources resolve kind:'error' (worker posts {ok:false}) — never throw, never hang.
 *
 * These tests spawn REAL worker threads (testEnvironment: 'node'). No fake timers here on purpose: the watchdog and
 * abort paths are real-time guarantees by design.
 */

import { evaluateLinesInWorker, REGEX_WORKER_BUDGET_MS, REGEX_WORKER_POOL_SIZE, PROBE_TOTAL_BUDGET_MS, REGEX_WORKER_DRAIN_GRACE_MS, shutdownRegexWorkerPool } from '../src/utils/regexWorker';

describe('evaluateLinesInWorker — correctness', () => {
  test('basic match + case-insensitive flag respected (worker reconstructs RegExp from source+flags)', async () => {
    const r = await evaluateLinesInWorker(
      [{ source: 'NEEDLE', flags: '' }],
      ['nope', 'a NEEDLE here', 'NEEDLE at start', 'nothing'],
    );
    expect(r).toEqual({ ok: true, matchedLineIndices: [1, 2] });

    const ri = await evaluateLinesInWorker([{ source: 'needle', flags: 'i' }], ['Needle mixed case']);
    expect(ri).toEqual({ ok: true, matchedLineIndices: [0] });
  });

  test('first-match-per-line: a line matching multiple patterns is reported exactly once', async () => {
    const r = await evaluateLinesInWorker(
      [{ source: 'a+', flags: '' }, { source: 'b+', flags: '' }],
      ['ab both', 'only-a', 'none'],
    );
    expect(r).toEqual({ ok: true, matchedLineIndices: [0, 1] });
  });

  test('/g flag semantics: lastIndex reset per line — each line tested independently from position 0', async () => {
    const r = await evaluateLinesInWorker([{ source: 'x', flags: 'g' }], ['xx', 'no match', 'xxx']);
    expect(r).toEqual({ ok: true, matchedLineIndices: [0, 2] });
  });

  test('empty lines / empty patterns → immediate ok with no indices (fast path, no worker needed)', async () => {
    expect(await evaluateLinesInWorker([{ source: 'a', flags: '' }], [])).toEqual({ ok: true, matchedLineIndices: [] });
    expect(await evaluateLinesInWorker([], ['a'])).toEqual({ ok: true, matchedLineIndices: [] });
  });

  test('realistic volume: 5000 lines with a simple pattern complete well inside the default budget', async () => {
    const lines = Array.from({ length: 5000 }, (_, i) => (i % 7 === 0 ? `row ${i} NEEDLE` : `row ${i}`));
    const t0 = Date.now();
    const r = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], lines);
    const elapsed = Date.now() - t0;
    expect(r.ok).toBe(true);
    if (r.ok) {
      // every 7th line, indices ascending — exact set, not just a count
      expect(r.matchedLineIndices.length).toBe(715);
      expect(r.matchedLineIndices[0]).toBe(0);
      expect(r.matchedLineIndices.every((v, i) => (i === 0 ? true : v > r.matchedLineIndices[i - 1]))).toBe(true);
    }
    // A healthy eval must NOT consume the watchdog budget — guards against a regression where every eval spins.
    // NOTE (05.09): `elapsed` is WALL CLOCK from before acquireWorker() — after each prior test's release, the pool's
    // DRAIN rule has terminated idle workers, so this call pays one cold spawn (~43-67ms on this host) + up to ~120ms (tuned 06.09; was 250ms) of
    // REGEX_WORKER_SPAWN_MIN_INTERVAL_MS pacing before its eval even starts. Bound = budget + that worst-case warmup; the literal below
    // keeps the pre-tune 250 as a deliberately conservative over-bound and is intentionally NOT tightened (it must hold on any host/tuning).
    // the load-bearing guarantee (watchdog terminates any spin by its deadline) is pinned separately below in the T1b test.
    expect(elapsed).toBeLessThan(REGEX_WORKER_BUDGET_MS + 250);
  });

  test('invalid pattern source → kind=error with detail (worker posts {ok:false} and returns)', async () => {
    const r = await evaluateLinesInWorker([{ source: '([unclosed', flags: '' }], ['a']);
    // Pool outcome union is discriminated by presence of `ok`: non-ok variants carry NO ok property at all (v1-era
    // `{ ok:false, kind:... }` shape retired with the pool rework — callers branch on `'ok' in outcome`).
    expect('ok' in r).toBe(false);
    expect(r.kind).toBe('error');
    expect(typeof (r as { detail?: string }).detail).toBe('string');
  });

  test('default budget constant is the documented single tunable (250 ms per owner order 05.09 — fail-fast on contended hosts)', () => {
    expect(REGEX_WORKER_BUDGET_MS).toBe(250);
  });
});

describe('evaluateLinesInWorker — containment (the load-bearing ITEM-B guarantees)', () => {
  test('watchdog terminates a spinning catastrophic .test() (T1b class) and resolves kind=budget at ≈ budgetMs', async () => {
    // T1b payload shape (FIXHANG-5 redos probe — evidence doc removed 08.09): pattern ((a+){3}){4}x vs 15k-`a` line.
    // Proven live 30.08 (FIX-HANG-5c §5.2): this spin exceeds the 2000 ms watchdog — terminate() preempts it.
    const evilLine = 'a'.repeat(15_000);
    const t0 = Date.now();
    const r = await evaluateLinesInWorker([{ source: '((a+){3}){4}x', flags: '' }], [evilLine, 'control line'], { budgetMs: 800 });
    const elapsed = Date.now() - t0;

    // The spin must NOT complete — containment held; pool union carries no `ok` on non-ok variants (see note above).
    expect('ok' in r).toBe(false);
    expect(r.kind).toBe('budget');
    // Resolved by the watchdog (≈ budget), not by the spin finishing and not by any host-side timeout.
    expect(elapsed).toBeGreaterThanOrEqual(700);
    expect(elapsed).toBeLessThan(5000);
  }, 15_000);

  test('pre-aborted external signal → immediate aborted outcome (no worker work at all)', async () => {
    const ac = new AbortController();
    ac.abort(); // already-fired one-way host signal, as ToolCallContext would deliver after user cancel
    const t0 = Date.now();
    const r = await evaluateLinesInWorker([{ source: 'a', flags: '' }], ['a'], { externalSignal: ac.signal });
    expect(r).toEqual({ kind: 'aborted' }); // pool union: non-ok variants carry no `ok` property (v1 hybrid shape retired)
    expect(Date.now() - t0).toBeLessThan(500); // no spawn-and-spin window — the guard's abort is honored instantly
  });

  test('external signal abort DURING a spin → aborted outcome well before the budget (guard-cap interplay)', async () => {
    const evilLine = 'a'.repeat(15_000);
    const ac = new AbortController();
    const p = evaluateLinesInWorker([{ source: '((a+){3}){4}x', flags: '' }], [evilLine], { budgetMs: 2000, externalSignal: ac.signal });
    // Real timer — abort while the worker is spinning (simulates the grepGuard cap firing mid-eval).
    setTimeout(() => ac.abort(), 150);
    const t0 = Date.now();
    const r = await p;
    expect(r).toEqual({ kind: 'aborted' }); // terminated by the signal, NOT by the watchdog budget; pool union has no `ok` here
    expect(Date.now() - t0).toBeLessThan(2000);
  }, 15_000);
});

// ---------------------------------------------------------------------------
// FIX-33 regression net (13.09 incident follow-up: signal-blind capacity queue + unbounded startup probe)
// ---------------------------------------------------------------------------

describe('FIX-33 — pool acquire/probe hardening', () => {
  test('FIX-33a: abort DURING a capacity queue-wait resolves {kind:aborted} without occupying a worker (no unbounded wait)', async () => {
    // Occupy all REGEX_WORKER_POOL_SIZE slots deterministically: guaranteed-spin evals (T1b class) each capped by their OWN
    // watchdog budget — the spin can never finish early, so every slot stays busy for its full budget window.
    const evilLine = 'a'.repeat(15_000);
    const holders: Promise<unknown>[] = [];
    for (let i = 0; i < REGEX_WORKER_POOL_SIZE; i++) {
      holders.push(evaluateLinesInWorker([{ source: '((a+){3}){4}x', flags: '' }], [evilLine], { budgetMs: 800 }) as Promise<unknown>);
    }
    // Let the paced spawns (probe already ran in earlier describes of this file) settle into their busy windows first.
    await new Promise((r) => setTimeout(r, 700));

    const ac = new AbortController();
    const tB = Date.now();
    const pB = evaluateLinesInWorker([{ source: '((a+){3}){4}x', flags: '' }], [evilLine], { budgetMs: 5000, externalSignal: ac.signal });
    // Pre-FIX-33a this call sat in the FIFO until a slot freed and then burned that worker; post-fix the abort below must cut it
    // out of the queue immediately (or terminate it via the in-eval path if it had won a slot — either way: {kind:'aborted'}).
    setTimeout(() => ac.abort(), 250);
    const rB = await pB;
    const elapsedB = Date.now() - tB;

    expect(rB).toEqual({ kind: 'aborted' }); // by SIGNAL at ~250ms — not by its generous 5s budget, not a spawn error
    expect(elapsedB).toBeGreaterThanOrEqual(200); // it actually queued (a pre-aborted fast path would resolve in milliseconds)
    expect(elapsedB).toBeLessThan(REGEX_WORKER_BUDGET_MS + 1000); // resolved far before any holder could free capacity (~800ms+ after spawn)

    // Containment still holds under full-pool load and the pool stays healthy: every holder ends in its budget outcome
    // (the spin never completes within 800ms on any host — same class as the T1b pin above) and a normal eval succeeds.
    const settled = await Promise.all(holders);
    for (const h of settled) expect((h as { kind?: string }).kind).toBe('budget');
    const after = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], ['x NEEDLE y']);
    expect(after).toEqual({ ok: true, matchedLineIndices: [0] });
  }, 20_000);

  test('FIX-33b: startup probe is total-bounded — a re-probed pool serves its first eval well inside the old ~25s worst case', async () => {
    expect(PROBE_TOTAL_BUDGET_MS).toBeLessThanOrEqual(1000); // the bound itself, pinned (pre-fix: NO total bound — 5 samples x flat 5s)
    shutdownRegexWorkerPool(); // reset probeRan -> the next acquire re-runs the (now-bounded) probe from scratch

    const t0 = Date.now();
    const r = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], ['one NEEDLE here']);
    const elapsed = Date.now() - t0;
    expect(r).toEqual({ ok: true, matchedLineIndices: [0] });
    // Probe (~1s budget) + one cold spawn (43-67ms observed on user host) completes far inside the pre-fix worst case of
    // 5 samples x 5000ms ~ 25s; generous-but-meaningful so the pin holds on any host.
    expect(elapsed).toBeLessThan(10_000);
  }, 30_000);
});


// ---------------------------------------------------------------------------
// DRAIN-GRACE regression net (15.09: releaseWorker's immediate idle-drain thrashed warm workers between back-to-back per-file evals, so every
// re-acquire in a pattern_scan burst paid a fresh spawn (~43-67ms) + >=120ms pacing - proven root cause of the 15.09 stall; live log
// 2026-09-15.1.log @17:14). Real timers on purpose, like the rest of this file: the grace window is a real-time guarantee.
// ---------------------------------------------------------------------------

describe('DRAIN-GRACE (15.09) \u2014 delayed idle-drain', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    shutdownRegexWorkerPool(); // clean slate per test: empty pool, cleared grace timer + waiters, probe flag reset
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    shutdownRegexWorkerPool(); // never leave a pending grace sweep between tests (real timers - no fake cleanup available)
  });

  const spawnLogCount = (): number => logSpy.mock.calls.filter((c) => String(c[0]).includes('spawned worker')).length;
  const graceLogCount = (): number => logSpy.mock.calls.filter((c) => String(c[0]).includes('grace expired with no demand')).length;

  test('reuse within the grace window: back-to-back evals pay exactly ONE spawn (zero-spawn reuse)', async () => {
    const a = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], ['x NEEDLE y']);
    expect(a).toEqual({ ok: true, matchedLineIndices: [0] }); // first call pays probe-if-needed + cold spawn; its release schedules the grace

    // The second eval lands well inside REGEX_WORKER_DRAIN_GRACE_MS of the first release -> its acquire cancels the pending sweep and reuses the
    // warm idle worker. Pre-grace behavior drained that worker at the first release, forcing a second spawn here.
    const b = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], ['x NEEDLE y']);
    expect(b).toEqual({ ok: true, matchedLineIndices: [0] });

    expect(spawnLogCount()).toBe(1); // one spawn for both evals - the warm worker survived the inter-eval gap
  }, 20_000);

  test('quiet window expiry drains idle workers; the next eval pays exactly one fresh spawn', async () => {
    const a = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], ['x NEEDLE y']);
    expect(a.ok).toBe(true);
    expect(graceLogCount()).toBe(0); // still inside the quiet window

    await new Promise((r) => setTimeout(r, REGEX_WORKER_DRAIN_GRACE_MS + 300)); // outlive the full grace window (real timers)
    expect(graceLogCount()).toBe(1); // sweep fired and logged exactly one drain line for the idle worker

    const b = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], ['x NEEDLE y']);
    expect(b).toEqual({ ok: true, matchedLineIndices: [0] });
    expect(spawnLogCount()).toBe(2); // drained pool -> the post-grace eval pays a fresh spawn (the old cost, now bounded to once per quiet window)
  }, 25_000);

  test('shutdown clears a pending grace sweep - no stray drain activity after teardown', async () => {
    const a = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], ['x NEEDLE y']);
    expect(a.ok).toBe(true); // its release left a PENDING grace sweep (no waiters) - do not let it elapse here

    shutdownRegexWorkerPool(); // first line must cancel the pending timer
    await new Promise((r) => setTimeout(r, REGEX_WORKER_DRAIN_GRACE_MS + 300)); // outlive where an uncancelled sweep would have fired
    expect(graceLogCount()).toBe(0); // no stray post-teardown drain

    const b = await evaluateLinesInWorker([{ source: 'NEEDLE', flags: '' }], ['x NEEDLE y']); // teardown left a clean, re-usable pool
    expect(b).toEqual({ ok: true, matchedLineIndices: [0] });
    expect(spawnLogCount()).toBe(2); // one spawn for each of the two evals - no zombie state from the cancelled sweep
  }, 25_000);
});
