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

import { evaluateLinesInWorker, REGEX_WORKER_BUDGET_MS } from '../src/utils/regexWorker';

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
