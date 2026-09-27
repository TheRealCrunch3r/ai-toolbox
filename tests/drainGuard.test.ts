/**
 * C compaction family (24.09) — STEP 5 tests, part 3 of 3: serialization drain guard
 *
 * Covers the active tool-turn tracking + bounded drain in src/tokenStatsManager.ts (drainActiveToolTurns /
 * shouldDeferForActiveTools / begin-endToolCall). LM Studio can deliver a new user message WHILE the
 * previous turn's agentic loop is still executing; preprocess() must therefore DRAIN with a BOUNDED wait
 * before touching turn state. House rule: on timeout, fail loud and proceed — a user message must never
 * be able to deadlock. Injectable sampleActive/sleep (+ mocked Date.now in the timeout test) make every
 * path deterministic — no SDK mocks, no real 15s waits (F1-helper style).
 */

// Mocks must be declared before the imports below are evaluated by Jest.
jest.mock('../src/lmStudioApi', () => ({
  getSessionTotalTokens: jest.fn().mockReturnValue(0),
  getLastTokenData: jest.fn().mockReturnValue(null),
  resetSessionState: jest.fn(),
  getTokenSummary: jest.fn().mockReturnValue(''),
}));

import {
  DEFAULT_DRAIN_MAX_WAIT_MS,
  TokenStatsManager,
  drainActiveToolTurns,
  shouldDeferForActiveTools,
} from '../src/tokenStatsManager';

describe('C compaction (24.09) — serialization drain guard', () => {
  beforeEach(() => {
    TokenStatsManager.clearActiveToolCallsForTests(); // module state is shared across suites — never leak in-flight counts
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as unknown as { mockRestore: () => void }).mockRestore(); // house cast pattern — see fix20 suite
    (console.warn as unknown as { mockRestore: () => void }).mockRestore();
    (console.error as unknown as { mockRestore: () => void }).mockRestore();
  });

  it('fast path: resolves true immediately when no tool calls are in flight, without polling or logging', async () => {
    const sleep = jest.fn().mockResolvedValue(undefined);
    const out = await drainActiveToolTurns({ sampleActive: () => 0, sleep });

    expect(out).toBe(true);
    expect(sleep).not.toHaveBeenCalled(); // no loop entered — returns before the first poll
    // Pure decision exported for tests + bounded cap pinned (a user message must never wait indefinitely):
    expect(shouldDeferForActiveTools(0)).toBe(false);
    expect(shouldDeferForActiveTools(1)).toBe(true);
    expect(DEFAULT_DRAIN_MAX_WAIT_MS).toBe(15_000);
  });

  it('announces the deferral, polls at pollMs until the loop settles, and reports a clean drain', async () => {
    let active = 3;
    const sleepCalls: number[] = [];
    const out = await drainActiveToolTurns({
      pollMs: 250,
      maxWaitMs: DEFAULT_DRAIN_MAX_WAIT_MS,
      sampleActive: () => active,
      // Settles on the 4th poll → 4 sleeps total, then the NEXT loop check sees zero and resolves.
      sleep: async ms => {
        sleepCalls.push(ms);
        if (sleepCalls.length === 4) active = 0;
      },
    });

    expect(out).toBe(true);
    expect(sleepCalls).toEqual([250, 250, 250, 250]); // polled exactly at pollMs — no busy-spinning
    const warnSpy = console.warn as unknown as jest.Mock;
    expect(warnSpy).toHaveBeenCalledTimes(1); // one deferral announcement per drain call
    expect(String(warnSpy.mock.calls[0][0])).toContain('[DRAIN] tool turn(s) still active (3)'); // live count at deferral time
    const logs = ((console.log as unknown as jest.Mock).mock.calls.map(c => String(c[0])));
    expect(logs.some(l => l.includes('drained cleanly'))).toBe(true);
  });

  it('FAILS LOUD and returns false when the cap is reached with tools still in flight (never blocks a user message)', async () => {
    // Fake wall clock: starts at the real now and advances by pollMs on every sleep — so the whole wait
    // takes milliseconds of real time while exercising the Date.now-based budget check for real.
    let t = Date.now();
    const nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => t);

    const sleepCalls: number[] = [];
    const out = await drainActiveToolTurns({
      pollMs: 25,
      maxWaitMs: 100, // budget exhausted after exactly 4 polls (t advances 25 per sleep)
      sampleActive: () => 2, // stuck loop — never settles
      sleep: async ms => {
        t += ms;
        sleepCalls.push(ms);
      },
    });

    expect(out).toBe(false); // fail loud + degrade safe: the caller proceeds with compression anyway
    expect(sleepCalls.length).toBe(4); // cap check fires on loop iteration 5, after exactly maxWaitMs/pollMs polls
    const errs = (console.error as unknown as jest.Mock).mock.calls.map(c => String(c[0]));
    expect(errs.length).toBe(1);
    expect(String(errs[0])).toContain('[DRAIN] FAIL-LOUD');
    expect(String(errs[0])).toContain('cap (100ms) reached with 2 tool call(s) STILL in flight'); // names the stuck count
    nowSpy.mockRestore();
  });

  it('beginToolCall/endToolCall track in-flight calls (end floors at zero, no negative counts)', () => {
    expect(TokenStatsManager.getActiveToolCalls()).toBe(0);

    TokenStatsManager.beginToolCall('read_file');
    TokenStatsManager.beginToolCall('web_fetch'); // concurrent tools are counted independently
    expect(TokenStatsManager.getActiveToolCalls()).toBe(2);

    TokenStatsManager.endToolCall('read_file');
    expect(TokenStatsManager.getActiveToolCalls()).toBe(1);

    // End without a matching begin must never drive the counter below zero (house fail-safe):
    TokenStatsManager.endToolCall();
    TokenStatsManager.endToolCall('web_fetch');
    TokenStatsManager.endToolCall('phantom');
    expect(TokenStatsManager.getActiveToolCalls()).toBe(0);

    // The drain guard reads exactly this state — the fast path engages once all tools have settled:
    const out = drainActiveToolTurns({}); // no injection → real getActiveToolCalls sampler + real sleeper (fast path never sleeps)
    return expect(out).resolves.toBe(true);
  });

  it('clear() drops in-flight tool counts, so a fresh session starts drained', () => {
    TokenStatsManager.beginToolCall('read_file');
    TokenStatsManager.beginToolCall(); // unnamed call — counter does not care about the name
    expect(TokenStatsManager.getActiveToolCalls()).toBe(2);

    TokenStatsManager.clear();

    expect(TokenStatsManager.getActiveToolCalls()).toBe(0); // fresh session ⇒ no in-flight loop (C compaction invariant)
  });
});
