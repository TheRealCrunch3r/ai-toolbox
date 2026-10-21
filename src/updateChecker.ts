/**
 * Published-.VERSION update check (LM Studio hub) + in-app notification state (19.10, owner GO; source switched from
 * GitHub releases/latest to the lmstudio.ai .VERSION file on 20.10 per owner GO — see PUBLISHED_VERSION_URL below).
 *
 * Design: QUIET by construction — at most ONE outbound request per machine per day (24h TTL, stamped on
 * every attempt incl. failures), no new LLM tool, no OS permissions; the only user-visible surface is a
 * single in-app notification (client.system.notify) when a strictly-newer published version exists and has
 * not been dismissed for this version. Every step is non-fatal by house rule: any failure (network,
 * timeout, malformed JSON, data-dir I/O) degrades to console.warn + null — nothing here may ever throw
 * into the toolsProvider turn that hosts it.
 *
 * State file: <dataDir>/update-check.json — lives in the persistent plugin DATA dir (survives
 * `lms dev --install` code wipes, same isolation as session/project data), so dismissing a version does
 * not re-nag after a reinstall or plugin update.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { getDataDir } from './dataDir.js';

/**
 * Single source for the installed plugin version INSIDE THE CODE (19.10): becomes file #3 on the
 * version-bump checklist alongside package.json and manifest.json — all three must move together on
 * every bump (mechanically guarded by tests/updateChecker.test.ts, which fails loud on any drift).
 */
export const LOCAL_VERSION = 'v1.9.21';

/** Published .VERSION file on the LM Studio hub (20.10 owner GO — supersedes the GitHub releases endpoint): the single line of
 * text is THE current published version, maintained with every publish exactly like package.json/LOCAL_VERSION (3-file bump rule). */
const PUBLISHED_VERSION_URL = 'https://lmstudio.ai/crunch3r/ai-toolbox/files/.VERSION';

/** Hub marketplace landing page for this artifact — the deep link surfaced in update notifications (users install/update from here, not
 * from a GitHub tag that does not exist: repo is private and no public releases are published). */
const HUB_ARTIFACT_PAGE = 'https://lmstudio.ai/crunch3r/ai-toolbox';

/** ≥24h between outbound attempts — stamped on EVERY attempt (success or failure) so offline hosts still cap at one try/day. */
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Hard wall-clock fetch cap (same pattern as lmStudioApi.ts's AbortSignal.timeout usage). */
const FETCH_TIMEOUT_MS = 4000;

const STATE_FILE_NAME = 'update-check.json';

interface UpdateState {
  /** Latest known release version ('v'-stripped x.y.z); undefined until the first successful fetch. */
  latestVersion?: string;
  /** html_url of that release (deep link target for the notification). */
  url?: string;
  /** Epoch ms of the last ATTEMPT (success or failure) — drives the TTL. */
  checkedAt?: number;
  /** Versions the owner has dismissed ("not now") — never nags again per version. */
  dismissed?: string[];
  /** Version we already fired the in-app notification for (NOTIF-DEDUPE, 19.10 E2E): LM Studio re-invokes the
   * hosting provider on EVERY model step of an agentic turn, so without this latch the owner gets one toast per
   * tool call for the same release. A strictly-newer release carries a different version string and notifies once again. */
  notifiedVersion?: string;
  /** Version whose desktop-toast dispatch CONFIRMED (post-await, set by markToastDispatched() from the toolsProvider
   * update-check block) — drives MUTUAL EXCLUSION with the in-chat UPDATE-ANNOUNCE channel: getPendingUpdateAnnouncement()
   * returns null for a version already toasted. Hosts lacking system.notify (or a failed hop) never set it, so the chat
   * announcement is their fallback by construction. Deliberately separate from notifiedVersion (the pre-await dedupe latch). */
  toastDispatchedVersion?: string;
}

/** Strip a leading 'v' so both release tags and local versions compare as bare x.y.z. */
function normalizeVersion(v: string): string {
  return v.trim().replace(/^v/i, '');
}

/** Semver-ish numeric comparison of bare x.y.z strings (extra segments tolerated). Returns -1 | 0 | 1. Non-numeric segments count as 0. */
export function compareVersions(a: string, b: string): number {
  // Explicit arrow callback — NEVER pass Number.parseInt bare to .map(): map passes (element, INDEX), and the
  // index would become parseInt's RADIX arg (e.g. segment '22' at index 2 → radix-2 parse → NaN) — verified broken live on 19.10.
  const pa = normalizeVersion(a).split('.').map((s) => Number.parseInt(s, 10));
  const pb = normalizeVersion(b).split('.').map((s) => Number.parseInt(s, 10));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    // `|| 0`: missing segment OR non-numeric segment → 0. Behaviorally identical to a Number.isFinite ternary here,
    // without the type-no-op casts that @typescript-eslint/no-unnecessary-type-assertion rejects (19.10 ESLint gate).
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

function stateFilePath(): string {
  // getDataDir() is sync + best-effort mkdir by design — safe on this fire-and-forget path.
  return path.join(getDataDir(), STATE_FILE_NAME);
}

/** Read cached state; ANY I/O or parse failure degrades to a fresh empty state (never throws). */
function loadState(): UpdateState {
  try {
    const raw = fs.readFileSync(stateFilePath(), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    // All UpdateState fields are optional, so the narrowed plain object is structurally assignable without an assertion.
    if (parsed !== null && typeof parsed === 'object') return parsed;
    return {};
  } catch {
    return {}; // missing/corrupt state file is the normal fresh-install case — not even worth a warn
  }
}

/** Persist state best-effort; failure only costs the next attempt a re-fetch (TTL semantics degrade safely). */
function saveState(state: UpdateState): void {
  try {
    fs.writeFileSync(stateFilePath(), JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.warn('[AI Toolbox] [UPDATE-CHECK] State write failed (non-fatal, next attempt re-checks):', err);
  }
}

/** True when the owner dismissed this exact version (checked against bare x.y.z form). */
export function hasBeenDismissed(version: string): boolean {
  const v = normalizeVersion(version);
  return (loadState().dismissed ?? []).some((d) => normalizeVersion(String(d)) === v);
}

/** Record a dismissal for this version — idempotent, non-fatal. */
export function dismissVersion(version: string): void {
  const state = loadState();
  const v = normalizeVersion(version);
  const dismissed = Array.from(new Set([...(state.dismissed ?? []).map((d) => normalizeVersion(String(d))), v]));
  saveState({ ...state, dismissed });
}

/** True when the in-app notification for this exact version already fired (checked against bare x.y.z form). */
export function hasBeenNotified(version: string): boolean {
  const s = loadState();
  return s.notifiedVersion !== undefined && normalizeVersion(String(s.notifiedVersion)) === normalizeVersion(version);
}

/** Record that the desktop-toast dispatch SUCCEEDED for this version — idempotent, non-fatal. Set AFTER the awaited host
 * notify resolves (toolsProvider update-check block), in contrast to notifiedVersion which latches BEFORE the await for
 * dedupe purposes. This is what makes the two channels mutually exclusive (19.10 owner GO): a version whose toast
 * actually dispatched is never repeated in-chat; hosts without system.notify (or a failed hop) never set it, so the
 * in-chat announcement covers exactly those users. */
export function markToastDispatched(version: string): void {
  try {
    const state = loadState();
    saveState({ ...state, toastDispatchedVersion: normalizeVersion(version) });
  } catch (err) {
    console.warn('[AI Toolbox] [UPDATE-CHECK] Toast-dispatch latch write failed (non-fatal — in-chat may repeat once):', err);
  }
}

/** Record that the in-app notification for this version fired — idempotent, non-fatal. Consumer side is the
 * toolsProvider update-check block (see notifiedVersion doc): latch BEFORE awaiting the host notify hop. */
export function markNotified(version: string): void {
  const state = loadState();
  saveState({ ...state, notifiedVersion: normalizeVersion(version) });
}

export interface UpdateStatus {
  /** Bare x.y.z of the newer release. */
  version: string;
  /** Hub marketplace page of the artifact (deep link for update instructions — users install/update from the hub, not GitHub). */
  url?: string;
}

/** Extract the published version from a fetched .VERSION body (test seam — keeps both response shapes in one place, cf. old parseLatestRelease).
  * Shape 1 — raw plain text: trimmed body must be exactly v?x.y.z (the house publish format; strict by design — a non-conforming body degrades to null rather than risk persisting a corrupted version string). What any clean file route serves.
 * Shape 2 — HTML page: lmstudio.ai /files/<name> routes serve a Next.js document with the file content EMBEDDED in the SSR flight payload
 * (verified live against /crunch3r/ai-toolbox/files/package.json, 19.10). The version is recovered by scanning for dotted x.y.z tokens:
 * v-prefixed candidates win first (house format — package.json/.VERSION are written v-prefixed, cf. the drift pin in tests/updateChecker.test.ts);
 * a single DISTINCT bare candidate also wins; anything ambiguous (page noise such as CDN versions) or absent → null → quiet by house rule. */
function parsePublishedVersionBody(body: string): { version: string; url?: string } | null {
  const text = body.trim();
  // Shape 1 — raw plain-text file content (exact match on the trimmed body; whitespace tolerance via trim only).
  if (/^v?\d+\.\d+\.\d+$/i.test(text)) return { version: normalizeVersion(text), url: HUB_ARTIFACT_PAGE };
  // Shape 2 — hub serves an HTML page with the embedded file content.
  if (!/<\s*(?:!doctype\s+)?html/i.test(text)) return null; // neither raw text nor a document → malformed, quiet
  const distinct = (re: RegExp): string[] => Array.from(new Set((body.match(re) ?? []).map(normalizeVersion))).filter(Boolean);
  const vPrefixed = distinct(/v\d+\.\d+\.\d+/gi);
  if (vPrefixed.length === 1) return { version: vPrefixed[0], url: HUB_ARTIFACT_PAGE };
  const bare = distinct(/\b\d+\.\d+\.\d+(?!\.)/g);
  if (bare.length === 1 && vPrefixed.length === 0) return { version: bare[0], url: HUB_ARTIFACT_PAGE };
  return null; // ambiguous or missing → null (call site warns; nothing here ever throws into the hosting turn)
}

// ==================== .VERSION test knob (19.10 owner GO v2 — replaces the day-one in-code const with a runtime file read) ====================
// Plain-text file at the plugin root holding a dummy "latest release" version for local toast/link rendering tests.
const VERSION_FILE_NAME = '.VERSION';
let versionDirOverride: string | undefined; // hermetic-test seam — mirrors dataDir.ts's setDataDirOverride convention

/** Test-only: pin where .VERSION is read from (real-src tests point it at a temp dir, never this repo's live knob). */
export function setVersionDirOverride(dir?: string): void {
  versionDirOverride = dir;
}

function getVersionFilePath(): string {
  // Precedence mirrors dataDir.ts: explicit env > test override > jest temp fallback (so suites NEVER read/write the repo's
  // live .VERSION) > plugin root. The compiled module sits in <root>/dist/ under every build layout, so '..' = the directory
  // that owns .VERSION: this repo's root when lms dev runs it in place, the installed plugin dir in production (file absent
  // there by default → knob is off).
  const base =
    process.env.AI_TOOLBOX_VERSION_DIR ?? versionDirOverride
      ?? (process.env.JEST_WORKER_ID ? path.join(os.tmpdir(), 'ai_toolbox_test_version_dir') : undefined)
      ?? path.resolve(__dirname, '..');
  return path.join(base, VERSION_FILE_NAME);
}

/** Read the .VERSION knob at RUNTIME (fresh on every call — edit + save needs no rebuild/reload). Returns the bare x.y.z, or
 * null when the file is missing/blank/unreadable = OFF. Never throws: any I/O failure degrades to off by house rule. */
function readTestLatestVersion(): string | null {
  try {
    const v = normalizeVersion(fs.readFileSync(getVersionFilePath(), 'utf8'));
    return v === '' ? null : v;
  } catch {
    return null; // missing or unreadable file is the normal production case — not even worth a warn (cf. loadState)
  }
}

/**
 * Check the published .VERSION on the LM Studio hub for a strictly-newer version and report it — or null (quiet) in
 * every other case.
 * Returns null when: check is fresh-cached without an update, network/timeout/malformed failure, same or
 * older version, or the newer version was dismissed by the owner. `force=true` bypasses the TTL (one-shot
 * manual re-check; still single-flight per call — no background retries are ever scheduled).
 */
export async function getUpdateStatus(force = false): Promise<UpdateStatus | null> {
  // .VERSION test knob: see readTestLatestVersion() above. Read fresh on every call → no rebuild/reload needed to change it.
  const testV = readTestLatestVersion();
  if (testV !== null && compareVersions(testV, LOCAL_VERSION) > 0) {
    const url = `https://github.com/crunch3r/ai_toolbox/releases/tag/v${testV}`;
    // CHANNEL-FEED (21.10 owner spec A): persist the knob's version so the in-chat UPDATE-ANNOUNCE layer — whose ONLY
    // input is state.latestVersion — can render knob-driven updates when desktop notifications are off (XOR channel
    // selection, toolsProvider gate). NO checkedAt/TTL stamp on purpose: test knobs must never suppress real 24h release
    // checks; saveState() degrades non-fatally by construction.
    const prev = loadState();
    // NO-OP GUARD (21.10 defect #2): this early-return re-runs on EVERY model step of an agentic turn (toolsProvider's
    // documented re-invocation pattern), so without a content-compare the channel-feed would rewrite update-check.json
    // with byte-identical JSON on every call — pure disk I/O + mtime churn, observed live 21.10 ~22:4x (file rewritten
    // mid-turn while state was unchanged). The RETURN value is independent of this write (it synthesizes from testV), so
    // skipping an unchanged save is behaviorally invisible; a genuinely changed knob value still persists on its first call.
    if (prev.latestVersion !== testV || prev.url !== url) {
      saveState({ ...prev, latestVersion: testV, url });
    }
    return { version: testV, url };
  }

  let state: UpdateState;
  try {
    state = loadState();
  } catch (err) {
    console.warn('[AI Toolbox] [UPDATE-CHECK] State read failed (non-fatal, skipping this check):', err);
    return null;
  }

  const now = Date.now();
  const fresh = !force && typeof state.checkedAt === 'number' && now - state.checkedAt < CACHE_TTL_MS;

  let latest: { version: string; url?: string } | null = null;
  if (fresh) {
    // Cache hit — reuse the last known good release, no network I/O this turn.
    latest = typeof state.latestVersion === 'string' ? { version: normalizeVersion(state.latestVersion), url: state.url } : null;
  } else {
    try {
      const res = await fetch(PUBLISHED_VERSION_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (res.ok) {
        const parsed = parsePublishedVersionBody(await res.text());
        if (parsed === null) {
          // 200 but no extractable version (hub layout change / page noise) — degrades quietly like any other miss.
          console.warn('[AI Toolbox] [UPDATE-CHECK] Published .VERSION body unparseable — skipping (non-fatal)');
        } else {
          latest = parsed;
        }
      } else {
        // Non-2xx from the hub file route is benign, quiet-skip (same degradation class as the old GitHub 403/404 case).
        console.warn(`[AI Toolbox] [UPDATE-CHECK] Hub version endpoint responded ${res.status} — skipping (non-fatal)`);
      }
    } catch (err) {
      // Timeout / DNS / offline → degrade to the last known good release; checkedAt below still stamps the TTL.
      console.warn(`[AI Toolbox] [UPDATE-CHECK] Fetch failed (non-fatal, using cached state): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Stamp the attempt AFTER the outcome is known: on fetch failure keep the previous latestVersion/url so a
  // later offline window still has something to evaluate; TTL covers failures too (≤1 outbound call/day).
  saveState({
    ...state,
    ...(latest !== null ? { latestVersion: latest.version, url: latest.url } : {}),
    checkedAt: now,
  });

  if (!latest) return null;
  if (hasBeenDismissed(latest.version)) return null; // owner said "not now" for this version — quiet forever per version
  if (compareVersions(latest.version, LOCAL_VERSION) > 0) {
    return { version: latest.version, url: latest.url };
  }
  return null; // same or older release — nothing to say
}


// ==================== UPDATE-ANNOUNCE (19.10 owner GO): once-per-process in-chat announcement for notification-suppressed users ====================
// The desktop toast is the best-effort layer — many hosts/users have OS notifications off, and BackendNotification cannot carry a clickable
// link anyway (no url/action field; verified against installed d.ts + live E2E 19.10). This accessor gives preprocess() a one-shot,
// sync, zero-network line so the model tells such users IN CHAT (clickable markdown link) — at most once per process lifetime per version.

let announcedVersion: string | undefined; // per-process latch — re-announces on plugin reload or new release, never repeats within a process

/** Test-only reset of the announcement latch (mirrors the house one-shot test-hook convention). */
export function __resetUpdateAnnouncementForTests(): void {
  announcedVersion = undefined;
}

/** Synchronous accessor for the in-chat announcement: cached newer + not dismissed, once per process per version. Null when there is nothing
 * to say or it was already announced this process lifetime. Never throws (house rule).
 * notificationsEnabled (21.10 spec A XOR fix): the plugin panel "Desktop Notifications" toggle picks THE channel for update messages —
 * strict `=== false` mirrors the tier-2 house gate convention; undefined/default keeps pre-fix semantics byte-exactly (default arg, so every
 * existing zero-arg caller/test is untouched). */
export function getPendingUpdateAnnouncement(notificationsEnabled?: boolean): { version: string; url?: string } | null {
  try {
    const s = loadState();
    if (typeof s.latestVersion !== 'string') return null; // no successful check yet — nothing to announce
    const v = normalizeVersion(s.latestVersion);
    if (!v || compareVersions(v, LOCAL_VERSION) <= 0) return null; // same/older/corrupt → quiet
    if (hasBeenDismissed(v)) return null; // owner said "not now" — the in-chat layer honors that too
    // MUTUAL EXCLUSION + CHANNEL SELECTION (19.10 owner GO, 21.10 spec A XOR fix): with the DEFAULT/ON channel the desktop toast is
    // authoritative — once it actually dispatched for this version the user was told → stay quiet here (hosts lacking system.notify /
    // failed hops never set the latch → in-chat remains their fallback by construction). With an EXPLICIT OFF, the panel toggle chose
    // in-chat as THE channel: a version ALSO toasted earlier (toggle ON at the time, or an earlier live test) must still be announced
    // once here — 'exactly one message per session via the SELECTED channel', not 'at most one across all channels ever' (21.10 22:1x
    // live-E2E deadlock: latches on a toasted version permanently silenced the OFF channel). Strict `=== false` only; undefined keeps
    // pre-fix behavior byte-exactly for every existing caller.
    if (notificationsEnabled !== false && typeof s.toastDispatchedVersion === 'string' && normalizeVersion(s.toastDispatchedVersion) === v) return null;
    if (announcedVersion === v) return null; // already announced this process lifetime for this version
    announcedVersion = v;
    return { version: v, url: s.url ?? `https://github.com/crunch3r/ai_toolbox/releases/tag/v${v}` };
  } catch {
    return null; // never throw into preprocess() (house rule)
  }
}
