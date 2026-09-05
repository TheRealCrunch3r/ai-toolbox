/**
 * regexWorker — worker_threads isolation for synchronous regex evaluation (ITEM-B, 05.09).
 *
 * Pinned contracts:
 *   - first-match-per-line semantics (a line matching any pattern is reported exactly once, ascending indices);
 *   - /g-flagged patterns are stateless across lines (lastIndex reset per line — same as the pre-ITEM-B host loop);
 *   - the watchdog terminate()s a spinning catastrophic .test() (T1b class from docs/history/FIXHANG5_REDOS_RESULTS.md)
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
    // A healthy eval must NOT consume the watchdog budget — guards against a regression where every eval times out.
    expect(elapsed).toBeLessThan(REGEX_WORKER_BUDGET_MS);
  });

  test('invalid pattern source → kind=error with detail (worker posts {ok:false} and returns)', async () => {
    const r = await evaluateLinesInWorker([{ source: '([unclosed', flags: '' }], ['a']);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.kind).toBe('error');
      expect(typeof (r as { detail?: string }).detail).toBe('string');
    }
  });

  test('default budget constant is the documented single tunable (2000 ms, carried over from FIX-HANG-5)', () => {
    expect(REGEX_WORKER_BUDGET_MS).toBe(2000);
  });
});

describe('evaluateLinesInWorker — containment (the load-bearing ITEM-B guarantees)', () => {
  test('watchdog terminates a spinning catastrophic .test() (T1b class) and resolves kind=budget at ≈ budgetMs', async () => {
    // T1b payload shape from docs/history/FIXHANG5_REDOS_RESULTS.md: pattern ((a+){3}){4}x vs 15k-`a` line.
    // Proven live 30.08 (FIX-HANG-5c §5.2): this spin exceeds the 2000 ms watchdog — terminate() preempts it.
    const evilLine = 'a'.repeat(15_000);
    const t0 = Date.now();
    const r = await evaluateLinesInWorker([{ source: '((a+){3}){4}x', flags: '' }], [evilLine, 'control line'], { budgetMs: 800 });
    const elapsed = Date.now() - t0;

    expect(r.ok).toBe(false); // the spin must NOT complete — containment held
    if (!r.ok) expect(r.kind).toBe('budget');
    // Resolved by the watchdog (≈ budget), not by the spin finishing and not by any host-side timeout.
    expect(elapsed).toBeGreaterThanOrEqual(700);
    expect(elapsed).toBeLessThan(5000);
  }, 15_000);

  test('pre-aborted external signal → immediate aborted outcome (no worker work at all)', async () => {
    const ac = new AbortController();
    ac.abort(); // already-fired one-way host signal, as ToolCallContext would deliver after user cancel
    const t0 = Date.now();
    const r = await evaluateLinesInWorker([{ source: 'a', flags: '' }], ['a'], { externalSignal: ac.signal });
    expect(r).toEqual({ ok: false, kind: 'aborted' });
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
    expect(r).toEqual({ ok: false, kind: 'aborted' }); // terminated by the signal, NOT by the watchdog budget
    expect(Date.now() - t0).toBeLessThan(2000);
  }, 15_000);
});
