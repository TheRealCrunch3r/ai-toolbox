/**
 * 04.10 ABORT-CONTRACT — tool-level abort tests for the HTTP client tools (src/tools/httpClientTools.ts):
 * http_request / http_get_json / http_post_json now forward LM Studio's ToolCallContext.signal (host cancel)
 * into ONE authoritative AbortController per call, merged with the pre-existing 30 s timeout (grepGuard idiom).
 *
 * CONTRACT UNDER TEST (pinned against the implementation, 04.10):
 *  • PRE-ABORTED ctx signal → { success:false, aborted:true } envelope — NO generic "HTTP request failed" error,
 *    and no network work beyond the single fetch that rejects on the already-aborted merged signal.
 *  • MID-RUN abort (signal fires while the request is in flight) → same aborted envelope; settle is fast (the
 *    pending request never resolves) — a host cancel must not wait out the 30 s timeout.
 *  • NO ctx at all → happy path byte-identical: fetch called with an UNABORTED signal and the success shape
 *    returned (zero-change guard for the abort wiring).
 *
 * LAYERING: global.fetch is mocked per-test (no real network, no timers advanced — mergeHostSignal's internal
 * 30 s timer is unref'd and irrelevant at these settle times). Response bodies use REAL `new Response()` so the
 * production readBoundedText() streaming reader exercises its genuine code path.
 */

import { registerHttpClientTools } from '../src/tools/httpClientTools';
import type { PluginConfig } from '../src/config';

// ==================== Tool harness (same shape as tests/ripgrepTools.test.ts) ====================
interface HttpToolResult {
  success: boolean;
  aborted?: true;
  error?: string;
  data?: Record<string, unknown>;
}

const tools = registerHttpClientTools({} as unknown as PluginConfig);
function implOf(name: string): (a: Record<string, unknown>, c?: { signal?: AbortSignal }) => Promise<HttpToolResult> {
  const t = tools.find((x) => x.name === name);
  if (!t) throw new Error(`tool "${name}" not registered (regression: tool registry changed?)`);
  return t.implementation as unknown as (a: Record<string, unknown>, c?: { signal?: AbortSignal }) => Promise<HttpToolResult>;
}

const httpRequestImpl = implOf('http_request');
const httpGetJsonImpl = implOf('http_get_json');
const httpPostJsonImpl = implOf('http_post_json');

/** Real Response whose body stream settles only when the (merged) signal aborts — simulates an in-flight request. */
function pendingResponse(signal: AbortSignal | undefined): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!signal) return; // no signal → never settles (tests always pass a signal on the pending paths)
    const fire = (): void => {
      const e = new Error('The operation was aborted.');
      e.name = 'AbortError';
      reject(e);
    };
    if (signal.aborted) return void fire();
    signal.addEventListener('abort', fire, { once: true });
  });
}

const realFetch = globalThis.fetch;

afterAll(() => {
  // Restore in case a test left the spy installed.
  (globalThis as Record<string, unknown>).fetch = realFetch;
});

// Quiet the tools' production logging under jest (house pattern — see webResearchTools.test.ts).
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe('http client tools — ABORT-CONTRACT (04.10)', () => {
  test('all three tools are registered with the expected names', () => {
    const names = tools.map((t) => t.name);
    for (const n of ['http_request', 'http_get_json', 'http_post_json']) expect(names).toContain(n);
  });

  // ---------- pre-aborted ctx signal: envelope, no generic failure ----------

  test('http_request + pre-aborted ctx → {success:false, aborted:true}; fetch seen an already-aborted merged signal', async () => {
    const ctrl = new AbortController();
    ctrl.abort(); // fired BEFORE the call — guard-rail branch upstream of any real network work

    let sawAbortedSignal = false;
    (globalThis as Record<string, unknown>).fetch = jest.fn((_url: string, init?: RequestInit) => {
      sawAbortedSignal = !!init?.signal?.aborted; // the merged controller must already be aborted
      return pendingResponse(init?.signal); // rejects immediately on the pre-aborted signal
    });

    const res = await httpRequestImpl({ method: 'GET', url: 'https://example.com/abort-pre' }, { signal: ctrl.signal });

    expect(res).toMatchObject({ success: false, aborted: true });
    if (res.aborted) expect(typeof res.error).toBe('string'); // envelope carries the house hint style
    expect(sawAbortedSignal).toBe(true); // one-controller idiom: pre-abort propagated SYNCHRONOUSLY into fetch's signal
  }, 10_000);

  test('http_get_json + pre-aborted ctx → aborted envelope (no generic HTTP failure)', async () => {
    const ctrl = new AbortController();
    ctrl.abort();

    const fetchSpy = jest.fn((_url: string, init?: RequestInit) => pendingResponse(init?.signal));
    (globalThis as Record<string, unknown>).fetch = fetchSpy;

    const res = await httpGetJsonImpl({ url: 'https://example.com/abort-pre-json' }, { signal: ctrl.signal });

    expect(res).toMatchObject({ success: false, aborted: true });
    if (!res.aborted) throw new Error('expected the aborted envelope');
    expect(fetchSpy).toHaveBeenCalledTimes(1); // exactly one attempt — no retry cascade on a host cancel
  }, 10_000);

  test('http_post_json + pre-aborted ctx → aborted envelope', async () => {
    const ctrl = new AbortController();
    ctrl.abort();

    (globalThis as Record<string, unknown>).fetch = jest.fn((_url: string, init?: RequestInit) => pendingResponse(init?.signal));

    const res = await httpPostJsonImpl({ url: 'https://example.com/abort-pre-post', data: { a: 1 } }, { signal: ctrl.signal });

    expect(res).toMatchObject({ success: false, aborted: true });
  }, 10_000);

  // ---------- mid-run abort: in-flight request cancelled well before the 30 s timeout ----------

  test('http_request + mid-run abort → aborted envelope with fast settle (no 30 s wait)', async () => {
    const ctrl = new AbortController(); // NOT yet aborted — fires ~250 ms into the "request"

    (globalThis as Record<string, unknown>).fetch = jest.fn((_url: string, init?: RequestInit) => pendingResponse(init?.signal));

    const t0 = Date.now();
    const pending = httpRequestImpl({ method: 'GET', url: 'https://example.com/abort-mid' }, { signal: ctrl.signal });
    await new Promise((r) => setTimeout(r, 250)); // let the "request" go in flight (real timers — host cancel is a real event)
    if (!ctrl.signal.aborted) ctrl.abort();
    const res = await pending;
    const elapsedMs = Date.now() - t0;

    expect(res).toMatchObject({ success: false, aborted: true }); // NOT "HTTP request failed: …" — the cancel is distinguished
    expect(ctrl.signal.aborted).toBe(true); // sanity: the fire actually happened (a broken controller would void the test)
    expect(elapsedMs).toBeLessThan(5_000); // the abort must settle fast, not ride out the 30 s timeout path
  }, 10_000);

  // ---------- zero-change guard: no ctx → happy path untouched by the wiring ----------

  test('http_request without ctx → success shape unchanged; fetch received a non-aborted (timeout-only) signal', async () => {
    let seenAborted = true;
    (globalThis as Record<string, unknown>).fetch = jest.fn((_url: string, init?: RequestInit) => {
      seenAborted = !!init?.signal?.aborted; // the 30 s timeout controller starts un-aborted
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }));
    });

    const res = await httpRequestImpl({ method: 'GET', url: 'https://example.com/happy' }); // NO ctx at all

    expect(seenAborted).toBe(false);
    expect(res.success).toBe(true);
    if (res.data) {
      expect(res.data.status).toBe(200);
      expect(res.data.body).toEqual({ ok: true });
    } else {
      throw new Error('expected success data');
    }
  }, 10_000);

  test('http_get_json without ctx → parsed JSON body via the real bounded reader (happy path regression)', async () => {
    const payload = { hello: 'world', n: 42 };
    (globalThis as Record<string, unknown>).fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } })),
    );

    const res = await httpGetJsonImpl({ url: 'https://example.com/happy-json' });

    expect(res.success).toBe(true);
    if (res.data) expect(res.data.body).toEqual(payload); // production readBoundedText() path on a real Response stream
  }, 10_000);
});
