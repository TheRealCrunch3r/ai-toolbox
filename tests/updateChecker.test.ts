/**
 * UPDATE-CHECK (19.10, owner GO) — hermetic tests for src/updateChecker.ts + the version-bump rule codification.
 *
 * Isolation contract (house convention): temp dataDir via setDataDirOverride() — NEVER the developer's real
 * ~/.lmstudio data dir; global.fetch is a jest mock in every case (no network, no real GitHub calls); override
 * and fetch are restored in afterEach so nothing leaks into other suites. Cases per approved design: fresh cache
 * no-network · TTL expiry refetch · newer/same/older · dismissed · failure → null (with TTL-stamp semantics).
 */

// DEFECT #2 (21.10): module-scoped factory mock — forwards EVERY fs call to the real module but wraps writeFileSync in a jest.fn so state-file
// writes are countable per test. Required because this environment's CJS core-module namespace properties are non-configurable —
// jest.spyOn(fs, 'writeFileSync') fails with 'Cannot redefine property'. The factory body may only reference out-of-scope names matching /^mock/i
// (babel-plugin-jest-hoist), hence all real-fs access goes through requireActual inside the factory. All other suites in this file keep full
// REAL fs behavior: every non-writeFileSync member passes through untouched (bound where a method needs its own `this`).
jest.mock('fs', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- requireActual returns the untyped core-module namespace; the Proxy below keeps runtime behavior byte-exact.
  const actual: any = jest.requireActual('fs');
  // The wrapped writeFileSync is the REAL jest.fn itself (so .mock.calls / count assertions in tests work) and delegates to the real implementation.
  const writeSpy = jest.fn((...args: unknown[]) => actual.writeFileSync(...args));
  return new Proxy(actual, {
    get(target, prop) {
      if (prop === 'writeFileSync') return writeSpy;
      const value = (target as Record<PropertyKey, unknown>)[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
});

import { readFileSync } from 'fs';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { setDataDirOverride } from '../src/dataDir';
import { __resetUpdateAnnouncementForTests, CACHE_TTL_MS, getPendingUpdateAnnouncement, LOCAL_VERSION, compareVersions, dismissVersion, getUpdateStatus, hasBeenDismissed, hasBeenNotified, markNotified, markToastDispatched, setVersionDirOverride } from '../src/updateChecker';


const REPO_ROOT = path.join(__dirname, '..');

/** Quiet same-version .VERSION body (house format is v-prefixed) — keeps suites hermetic with a deterministic null result. */
const QUIET_BODY = LOCAL_VERSION; // 'v1.9.21'

/** Shape-1 response mock: hub serves the plain-text file content directly (the clean case). */
function fakeVersionResponse(v: string): { ok: boolean; text: () => Promise<string> } {
  return { ok: true, text: async () => v };
}

/** Shape-2 response mock: lmstudio.ai /files/<name> serves a Next.js HTML page with the file content embedded in the SSR
 * flight payload (verified live against package.json, 19.10) — plus realistic page noise: a CDN beacon version and the
 * schema.org revision number, which the extractor must NOT mistake for the published version. */
function fakeVersionPage(v: string): { ok: boolean; text: () => Promise<string> } {
  return {
    ok: true,
    text: async () =>
      `<!DOCTYPE html><html><head></head><body>` +
      `<script>self.__next_f.push([1,"file content ${v} embedded in flight payload"])</script>` +
      `<script data-cf-beacon='{"version":"2024.11.0"}'></script>` +
      `{"@type":"CreativeWork","name":"crunch3r/ai-toolbox","version":"86"}</body></html>`,
  };
}


describe('compareVersions (semver-ish x.y.z, v-prefix tolerant)', () => {
  test('v-prefix and bare forms compare equal', () => {
    expect(compareVersions('v1.9.21', '1.9.21')).toBe(0);
    expect(compareVersions('V1.9.21', 'v1.9.21')).toBe(0);
  });

  test('numeric (not lexicographic) segment ordering', () => {
    expect(compareVersions('1.10.0', '1.9.9')).toBe(1); // lexicographic would say 1.10 < 1.9
    expect(compareVersions('2.0.0', '10.0.0')).toBe(-1);
    expect(compareVersions('1.9.22', LOCAL_VERSION)).toBe(1);
    expect(compareVersions('1.9.20', LOCAL_VERSION)).toBe(-1);
  });

  test('shorter form is zero-padded (trailing segments count as 0)', () => {
    expect(compareVersions('v1.0', 'v1.0.0')).toBe(0);
    expect(compareVersions('v2', 'v2.1.0')).toBe(-1);
  });

  test('non-numeric segments degrade to 0 without throwing', () => {
    expect(compareVersions('abc.def', '0.0.0')).toBe(0);
  });
});

describe('getUpdateStatus — hermetic (temp dataDir + mocked fetch)', () => {
  const origFetch = globalThis.fetch;
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-updater-')); // real fs, isolated per test
    setDataDirOverride(tmp); // never touch the developer's real data dir
  });

  afterEach(() => {
    setDataDirOverride(undefined); // never leak an override into other suites
    globalThis.fetch = origFetch; // restore the environment fetch exactly
    jest.restoreAllMocks();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('newer release → status + state file cached under dataDir', async () => {
    const fetchMock = jest.fn().mockResolvedValue(fakeVersionResponse('v99.9.9'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const status = await getUpdateStatus();
    // Deep link is the hub marketplace page (20.10 owner GO) — users update from the hub, not a GitHub tag.
    expect(status).toEqual({ version: '99.9.9', url: 'https://lmstudio.ai/crunch3r/ai-toolbox' });

    // State persists in the (survives-reinstall) data dir, not the wiped code dir
    const state = JSON.parse(readFileSync(path.join(tmp, 'update-check.json'), 'utf8')) as Record<string, unknown>;
    expect(state.latestVersion).toBe('99.9.9');
    expect(typeof state.checkedAt).toBe('number');
    expect(state.notifiedVersion).toBeUndefined(); // latch unset until the hosting provider fires (NOTIF-DEDUPE, 19.10 E2E)
  });

  test('fresh cache → NO second network call within TTL', async () => {
    const fetchMock = jest.fn().mockResolvedValue(fakeVersionResponse('v99.0.0'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    expect(await getUpdateStatus()).not.toBeNull(); // attempt 1 — outbound
    expect(await getUpdateStatus()).toEqual({ version: '99.0.0', url: expect.any(String) }); // attempt 2 — cache
    expect(fetchMock).toHaveBeenCalledTimes(1); // the whole point of the 24h TTL
  });

  test('TTL expiry → refetch picks up the newer release', async () => {
    fs.writeFileSync(path.join(tmp, 'update-check.json'), JSON.stringify({
      latestVersion: '99.0.0',
      url: 'https://lmstudio.ai/crunch3r/ai-toolbox',
      checkedAt: Date.now() - CACHE_TTL_MS - 5000, // stale by design
    }));
    const fetchMock = jest.fn().mockResolvedValue(fakeVersionResponse('v100.0.0'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    expect(await getUpdateStatus()).toEqual({ version: '100.0.0', url: expect.any(String) });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('same release → quiet (null), no nag loop possible', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(fakeVersionResponse(LOCAL_VERSION)) as unknown as typeof fetch;
    expect(await getUpdateStatus()).toBeNull();
  });

  test('older release (tag older than LOCAL_VERSION) → quiet', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(fakeVersionResponse('v1.0.0')) as unknown as typeof fetch;
    expect(await getUpdateStatus()).toBeNull();
  });

  test('dismissed version stays quiet on every later check (cache-backed)', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(fakeVersionResponse('v99.1.0')) as unknown as typeof fetch;

    const status = await getUpdateStatus(); // v99.1.0 found
    expect(status?.version).toBe('99.1.0');

    dismissVersion(status!.version);
    expect(hasBeenDismissed('99.1.0')).toBe(true);
    expect(await getUpdateStatus()).toBeNull(); // dismissed — quiet, and NO refetch (TTL fresh)
  });

  test('dismissal is idempotent per version', async () => {
    dismissVersion('2.0.0');
    dismissVersion('v2.0.0'); // prefix variants collapse to the same bare form
    expect(hasBeenDismissed('2.0.0')).toBe(true);
  });

  test('fetch failure → null, TTL still stamped (offline hosts do not retry every turn)', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('simulated offline')) as unknown as typeof fetch;

    expect(await getUpdateStatus()).toBeNull(); // attempt 1 — failed outbound
    const stateAfterFail = JSON.parse(readFileSync(path.join(tmp, 'update-check.json'), 'utf8')) as Record<string, unknown>;
    expect(typeof stateAfterFail.checkedAt).toBe('number'); // TTL covers failures too

    expect(await getUpdateStatus()).toBeNull(); // attempt 2 — served from (empty) cache
    expect(globalThis.fetch).toHaveBeenCalledTimes(1); // ≤1 outbound/day even offline
  });

  test('non-OK HTTP response → null, no crash on rate-limit (403) shapes', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;
    expect(await getUpdateStatus()).toBeNull();
  });

  test('malformed .VERSION payload → null (never throws into the hosting turn)', async () => {
    // Neither a raw version string nor an HTML document → unparseable by construction.
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => 'this body carries no x.y.z version' }) as unknown as typeof fetch;
    expect(await getUpdateStatus()).toBeNull();
  });

  test('hub HTML page (shape 2) → version extracted from embedded content, page noise ignored', async () => {
    // lmstudio.ai /files/<name> serves a Next.js document with the file content in the SSR flight payload (verified live 19.10);
    // realistic noise — CDN beacon '2024.11.0' + schema.org revision "86" — must never be mistaken for the published version.
    globalThis.fetch = jest.fn().mockResolvedValue(fakeVersionPage('v97.5.3')) as unknown as typeof fetch;

    expect(await getUpdateStatus()).toEqual({ version: '97.5.3', url: 'https://lmstudio.ai/crunch3r/ai-toolbox' });
    const state = JSON.parse(readFileSync(path.join(tmp, 'update-check.json'), 'utf8')) as Record<string, unknown>;
    expect(state.latestVersion).toBe('97.5.3'); // channel-feed persists the extracted value for the in-chat layer
  });

  test('HTML page with NO extractable version → quiet null (ambiguity degrades to silence by house rule)', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => '<!DOCTYPE html><html><body>no dotted versions here</body></html>' }) as unknown as typeof fetch;
    expect(await getUpdateStatus()).toBeNull();
  });

  test('corrupt pre-existing state file → treated as fresh install (no throw)', async () => {
    fs.writeFileSync(path.join(tmp, 'update-check.json'), '{ this is not json ');
    globalThis.fetch = jest.fn().mockResolvedValue(fakeVersionResponse('v98.0.0')) as unknown as typeof fetch;
    expect(await getUpdateStatus()).toEqual({ version: '98.0.0', url: expect.any(String) }); // recovered, refetched
  });
});

describe('NOTIF-DEDUPE (19.10 E2E): per-version notify latch — the host re-invokes the provider every model step, exactly ONE toast per release', () => {
  const origFetch = globalThis.fetch;
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-updt-dedupe-')); // real fs, isolated per test
    setDataDirOverride(tmp); // never touch the developer's real data dir
  });

  afterEach(() => {
    setDataDirOverride(undefined); // never leak an override into other suites
    globalThis.fetch = origFetch; // restore the environment fetch exactly
    jest.restoreAllMocks();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('latch is fresh (unset) on a clean state — first notify for the version may fire', () => {
    expect(hasBeenNotified('1.9.22')).toBe(false);
  });

  test('markNotified latches exactly that version; other versions stay armable', async () => {
    markNotified('v9.8.7'); // v- form input — consumer normalizes, same as dismissVersion parity
    const state = JSON.parse(readFileSync(path.join(tmp, 'update-check.json'), 'utf8')) as Record<string, unknown>;
    expect(state.notifiedVersion).toBe('9.8.7'); // bare x.y.z persisted on disk

    expect(hasBeenNotified('9.8.7')).toBe(true);
    expect(hasBeenNotified('v9.8.7')).toBe(true); // v- prefix parity, mirrors hasBeenDismissed consumer contract
    expect(hasBeenNotified('1.9.22')).toBe(false); // different version unaffected — a newer release re-fires once again

    markNotified('v9.8.7'); // idempotent per version
    const stateAfter = JSON.parse(readFileSync(path.join(tmp, 'update-check.json'), 'utf8')) as Record<string, unknown>;
    expect(stateAfter.notifiedVersion).toBe('9.8.7');
  });

  test('provider-style repeat calls (one per model step) → notify exactly ONCE for the same release', async () => {
    // Simulate what toolsProvider does on each invocation: evaluate, latch-before-await, then notify (host hop faked).
    globalThis.fetch = jest.fn().mockResolvedValue(fakeVersionResponse('v1.9.22')) as unknown as typeof fetch;

    let notificationsFired = 0;
    const providerStep = async () => {
      const status = await getUpdateStatus();
      if (status && !hasBeenNotified(status.version)) {
        markNotified(status.version); // latch BEFORE the host hop — same order as toolsProvider
        notificationsFired += 1; // stand-in for client.system.notify(...)
      }
    };

    await providerStep(); // turn, step 1 — FIRST notify fires (owner observed this one live)
    await providerStep(); // step 2 of the SAME agentic turn → suppressed (THE bug: was a second toast pre-fix)
    await providerStep(); // step 3 → still suppressed; no re-fetch either (TTL fresh)
    expect(notificationsFired).toBe(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const state = JSON.parse(readFileSync(path.join(tmp, 'update-check.json'), 'utf8')) as Record<string, unknown>;
    expect(state.notifiedVersion).toBe('1.9.22'); // survives restarts — the latch is on disk, not in memory
  });
});

describe('version-bump rule codification (package.json ⟷ manifest.json ⟷ LOCAL_VERSION)', () => {
  test('all three version sources agree exactly', () => {
    const pkg = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8')) as { version: string };
    const manifest = JSON.parse(readFileSync(path.join(REPO_ROOT, 'manifest.json'), 'utf8')) as { version: string };

    // The single source inside the code must track BOTH metadata files — a bump that moves only one or two of
    // the three fails loud here instead of silently shipping a mismatched update-check (rule #1 → 3 files, 19.10).
    expect(pkg.version).toBe(LOCAL_VERSION);
    expect(manifest.version).toBe(LOCAL_VERSION);
    expect(pkg.version).toMatch(/^v\d+\.\d+\.\d+$/); // v-prefixed x.y.z shape (house versioning format)
  });
});


// ==================== .VERSION test knob (19.10 owner GO v2 — replaces the day-one in-code const with a runtime file read) ====================
// The dummy version now lives in a plain-text .VERSION file at the plugin root, READ AT RUNTIME by getUpdateStatus() — edit +
// save needs no rebuild/reload. Tests pin setVersionDirOverride(tmp) so they NEVER read/write this repo's live .VERSION; no
// isolated-module registry surgery is needed anymore because the value is a fresh fs read on every call (RC#2/RC#3 class gone).

describe('.VERSION test knob: one dummy version file gates getUpdateStatus (runtime read; blank = off)', () => {
  const origFetch = globalThis.fetch;
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-version-file-')); // real fs, isolated per test
    setDataDirOverride(tmp); // state file — never touch the developer's real data dir
    setVersionDirOverride(tmp); // .VERSION knob — NEVER this repo's live file (house rule: suites stay hermetic)
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setDataDirOverride(undefined);
    setVersionDirOverride(undefined);
    globalThis.fetch = origFetch;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  function writeKnob(value: string): void {
    fs.writeFileSync(path.join(tmp, '.VERSION'), value, 'utf8');
  }

  test('newer dummy (9.9.9) → synthetic status with release-tag URL, ZERO network, disk untouched', async () => {
    const fetchMock = jest.fn().mockResolvedValue(fakeVersionResponse('v1.9.22')); // would win if the early-return weren't there — must NOT be called
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    fs.writeFileSync(path.join(tmp, 'update-check.json'), JSON.stringify({ latestVersion: '0.0.1', checkedAt: 1 }));
    writeKnob('9.9.9');

    expect(await getUpdateStatus()).toEqual({ version: '9.9.9', url: 'https://github.com/crunch3r/ai_toolbox/releases/tag/v9.9.9' });

    expect(fetchMock).toHaveBeenCalledTimes(0); // zero network — the whole point of a local test file
    const rawAfter = readFileSync(path.join(tmp, 'update-check.json'), 'utf8');
    // CHANNEL-FEED (21.10 owner spec A): knob outcomes now persist latestVersion+url so the in-chat UPDATE-ANNOUNCE layer can render them
    // when desktop notifications are OFF — but a test knob must NEVER stamp checkedAt/TTL or any notify latch (supersedes old zero-disk-write pin).
    expect(JSON.parse(rawAfter)).toEqual({ latestVersion: '9.9.9', checkedAt: 1, url: 'https://github.com/crunch3r/ai_toolbox/releases/tag/v9.9.9' });
  });

  test('same-version dummy (= LOCAL_VERSION) → falls through to the real check (mocked same tag → quiet null)', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(fakeVersionResponse(LOCAL_VERSION)) as unknown as typeof fetch;
    writeKnob(LOCAL_VERSION); // 'v1.9.21' — v-prefix tolerated on this path too

    expect(await getUpdateStatus()).toBeNull(); // not strictly newer → no synthetic status; real path also quiet here
  });

  test('blank knob (production default) + missing file → pure pre-feature behavior: disk-backed, TTL-cached', async () => {
    const fetchMock = jest.fn().mockResolvedValue(fakeVersionResponse(LOCAL_VERSION)) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;
    writeKnob('   \n'); // whitespace-only = OFF

    expect(await getUpdateStatus()).toBeNull(); // real check ran, same tag → quiet
    expect(fetchMock).toHaveBeenCalledTimes(1); // proof we took the REAL path, not a synthetic early-return

    fs.rmSync(path.join(tmp, '.VERSION'), { force: true }); // missing file is the normal production case — still OFF
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    expect(await getUpdateStatus()).toBeNull();
  });

  test('v- prefix and surrounding whitespace in the knob are tolerated', async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
    writeKnob('\tv9.8.1 \n');

    expect(await getUpdateStatus()).toEqual({ version: '9.8.1', url: expect.stringContaining('tag/v9.8.1') });
    expect(globalThis.fetch).toHaveBeenCalledTimes(0);
  });

  test('repeatable by design AND live-editable: rewrites between calls change the outcome (no rebuild/reload)', async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
    writeKnob('9.9.9');
    expect(await getUpdateStatus()).toEqual(expect.objectContaining({ version: '9.9.9' })); // no latch, no state — repeat at will
    expect(await getUpdateStatus()).toEqual(expect.objectContaining({ version: '9.9.9' }));

    writeKnob('1.9.25'); // the runtime-read property: editing the file mid-run takes effect on the very next call
    expect(await getUpdateStatus()).toEqual(expect.objectContaining({ version: '1.9.25' }));
  });

  test('channel-feed persists ONCE per distinct knob value — repeated identical calls rewrite nothing (21.10 defect #2: no per-model-step disk I/O)', async () => {
    // The provider re-invokes getUpdateStatus on EVERY model step of an agentic turn; pre-fix the channel-feed saved
    // byte-identical JSON every time (observed live 21.10 ~22:4x — update-check.json mtime churned mid-turn). Pin both
    // directions via the module-scoped fs factory mock's writeFileSync wrapper (jest.spyOn(fs, …) is impossible here —
    // this environment's CJS core-module namespace properties are non-configurable; 'Cannot redefine property').
    // Only STATE-file writes count: writeKnob() itself calls writeFileSync on '.VERSION', which must stay excluded.
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
    const stateWritesSince = (baseline: number): number => {
      const fn = (fs as { writeFileSync: jest.Mock }).writeFileSync;
      return fn.mock.calls.filter((c) => String(c[0] ?? '').endsWith('update-check.json')).length - baseline;
    };

    const base = stateWritesSince(0); // absolute count — earlier tests in this suite may have written state too

    writeKnob('9.9.9');
    expect(await getUpdateStatus()).toEqual(expect.objectContaining({ version: '9.9.9' })); // call 1 feeds the state
    expect(stateWritesSince(base)).toBe(1); // exactly one persist for this distinct value

    for (let i = 0; i < 3; i += 1) {
      expect(await getUpdateStatus()).toEqual(expect.objectContaining({ version: '9.9.9' })); // repeated model steps
    }
    expect(stateWritesSince(base)).toBe(1); // ZERO further writes — the whole point of defect #2

    writeKnob('9.9.8'); // a genuinely different (still-newer) value must persist again on its first call
    expect(await getUpdateStatus()).toEqual(expect.objectContaining({ version: '9.9.8' }));
    expect(stateWritesSince(base)).toBe(2); // guard suppresses repeats, never distinct values
  });
});


// ==================== UPDATE-ANNOUNCE (19.10 owner GO) — once-per-process in-chat announcement accessor ====================

describe('getPendingUpdateAnnouncement: cached newer + not dismissed, latched once per process', () => {
  const origFetch = globalThis.fetch;
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-announce-')); // real fs, isolated per test
    setDataDirOverride(tmp); // state file — never touch the developer's real data dir
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setDataDirOverride(undefined);
    globalThis.fetch = origFetch;
    fs.rmSync(tmp, { recursive: true, force: true });
    __resetUpdateAnnouncementForTests(); // latch is module state — reset between cases (house one-shot test-hook convention)
  });

  function seedState(partial: Record<string, unknown>): void {
    fs.writeFileSync(path.join(tmp, 'update-check.json'), JSON.stringify({ checkedAt: Date.now(), ...partial }), 'utf8');
  }

  test('newer cached + not dismissed → {version,url}; second call same process → null (one-shot latch)', () => {
    seedState({ latestVersion: '1.9.24', url: 'https://github.com/crunch3r/ai_toolbox/releases/tag/v1.9.24' });

    expect(getPendingUpdateAnnouncement()).toEqual({ version: '1.9.24', url: 'https://github.com/crunch3r/ai_toolbox/releases/tag/v1.9.24' });
    expect(getPendingUpdateAnnouncement()).toBeNull(); // already announced this process — the notice never re-injects
  });

  test('dismissed version → null (in-chat layer honors "not now")', () => {
    seedState({ latestVersion: '1.9.24' });
    dismissVersion('1.9.24'); // owner dismissed via dismiss_update_reminder — the dismissal machinery gates BOTH layers

    expect(getPendingUpdateAnnouncement()).toBeNull();
  });

  test('no successful check yet / same-or-older cached → null', () => {
    seedState({}); // fresh install: no latestVersion at all

    expect(getPendingUpdateAnnouncement()).toBeNull();

    seedState({ latestVersion: LOCAL_VERSION }); // equal — not strictly newer
    expect(getPendingUpdateAnnouncement()).toBeNull();
  });

  test('missing url in state → release-tag URL synthesized', () => {
    seedState({ latestVersion: '9.9.9' });

    expect(getPendingUpdateAnnouncement()).toEqual({ version: '9.9.9', url: 'https://github.com/crunch3r/ai_toolbox/releases/tag/v9.9.9' });
  });

  test('DEFAULT (no toggle arg) + desktop toast dispatched → in-chat stays quiet (MUTUAL EXCLUSION — pre-fix semantics, byte-exact)', () => {
    seedState({ latestVersion: '1.9.24' });
    markToastDispatched('v1.9.24'); // desktop channel already told the user — post-dispatch flag, not the pre-await notifiedVersion latch

    expect(getPendingUpdateAnnouncement()).toBeNull(); // default arg = ON path: chat layer must not repeat what the toast said
  });

  test('OFF toggle + previously toasted version → in-chat still announces (SPEC A XOR fix, 21.10 live-E2E deadlock)', () => {
    seedState({ latestVersion: '9.9.9' });
    markToastDispatched('v9.9.9'); // earlier live test with the toggle ON toasted this version — latches persist on disk

    expect(getPendingUpdateAnnouncement(false)).toEqual(expect.objectContaining({ version: '9.9.9' })); // chat is THE selected channel — must speak
    expect(getPendingUpdateAnnouncement()).toBeNull(); // default arg (ON) stays quiet for the same state — pre-fix path untouched
  });

  test('OFF toggle + not toasted → announces; ON toggle + toasted → silent (channel selector both ways)', () => {
    seedState({ latestVersion: '9.8.7' }); // no toast latch at all (host without system.notify shape)

    expect(getPendingUpdateAnnouncement(false)).toEqual(expect.objectContaining({ version: '9.8.7' }));

    __resetUpdateAnnouncementForTests(); // per-process latch — re-arm for the opposite-channel probe
    seedState({ latestVersion: '1.9.24', notifiedVersion: '1.9.24' });
    markToastDispatched('v1.9.24');

    expect(getPendingUpdateAnnouncement(true)).toBeNull(); // explicit ON = pre-fix mutual exclusion
  });

  test('host WITHOUT system.notify (notifiedVersion latched but no dispatch flag) → in-chat still announces (fallback)', () => {
    seedState({ latestVersion: '1.9.24', notifiedVersion: '1.9.24' }); // pre-await dedupe latch set by toolsProvider, toast never dispatched

    expect(getPendingUpdateAnnouncement()).toEqual(expect.objectContaining({ version: '1.9.24' })); // chat is exactly their channel
  });
});
