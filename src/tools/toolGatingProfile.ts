/**
 * Tool Gating Profile — persistent user tool-gating preferences (v1.9.17)
 *
 * WHY: LM Studio's getPluginConfig() falls back to schematic defaults for values the host
 * has not explicitly persisted, so a toggle flipped in one chat can reset in the next.
 * This module gives the plugin its own user-level memory of tool toggles.
 *
 * DESIGN (agreed with user 08.09.2026):
 *   - AUTO-CAPTURE: any live boolean config value that differs from DEFAULT_CONFIG is a
 *     user choice and is captured automatically — no extra UI, the toggle act itself persists.
 *   - SPARSE STORAGE: only touched booleans are stored (keys at default are never written),
 *     so defaults can evolve across plugin versions without corrupting saved intent.
 *   - USER-LEVEL PATH: <home>/.ai_toolbox/tool_gating_profile.json — survives plugin
 *     reinstalls/updates because it lives outside the plugin directory. Written via
 *     atomicWriteFile (temp + rename), so a crash can never leave a half-written file.
 *   - STICKY KEYS (conservative contract): a fresh chat hands back schematic defaults for every
 *     unset key (SDK: getPluginConfig is PER-CHAT scoped), which looks byte-identical to an explicit
 *     revert-to-default. The two are indistinguishable by value alone, so only NON-DEFAULT live values
 *     that differ from storage count as re-toggles and overwrite it; default-valued differences keep
 *     the sticky stored value across chats. Clearing a saved choice means deleting/replacing this
 *     profile file (or flipping godMode off is NOT enough for per-chat defaults — see docs).
 *   - BOOLEANS ONLY: this profile stores category toggles — never paths, tokens or secrets.
 *   - GOD MODE keeps its full bypass semantics untouched: capture is independent of gating,
 *     and godMode=true is itself captured like any other toggle.
 */

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';

import { DEFAULT_CONFIG } from '../config.js';
import { atomicWriteFile } from '../utils/atomicWrite.js';

/** Tool-gating keys = every boolean category flag in the config schema. */
const BOOLEAN_KEYS: ReadonlyArray<keyof typeof DEFAULT_CONFIG> = (
  Object.keys(DEFAULT_CONFIG) as Array<keyof typeof DEFAULT_CONFIG>
).filter((k) => typeof DEFAULT_CONFIG[k] === 'boolean');

export interface GatedProfile {
  /** Sparse map of booleans the user has explicitly chosen (= value differs from default). */
  toggles: Record<string, boolean>;
}

const EMPTY_PROFILE: GatedProfile = { toggles: {} };

let cachedProfile: GatedProfile | null = null;
/** Absolute path this cache belongs to (invalidated on override/reset or env change). */
let cachePath: string | null = null;

/**
 * Resolve the profile file location.
 * Test hook: set AI_TOOLBOX_GATING_PROFILE_PATH to redirect storage anywhere
 * (Jest suites must never touch the real user home — see tests/setup.ts).
 */
export function getProfilePath(): string {
  const override = process.env.AI_TOOLBOX_GATING_PROFILE_PATH;
  if (override && override.trim().length > 0) {
    return path.resolve(override);
  }
  // os.homedir() is the platform-correct home on Windows/macOS/Linux — unlike env-only
  // lookups, it cannot end up empty. Matches the agreed user-level location.
  return path.join(os.homedir(), '.ai_toolbox', 'tool_gating_profile.json');
}

/**
 * Load the persisted profile (cached per resolved path).
 * A missing file → empty profile (first run); corrupt JSON or a non-object shape → empty
 * profile, so a bad file can NEVER break tool registration — worst case: defaults apply.
 */
export async function loadGatingProfile(): Promise<GatedProfile> {
  const p = getProfilePath();
  if (cachedProfile !== null && cachePath === p) {
    return cachedProfile;
  }

  let parsed: unknown = null;
  try {
    const raw = await fs.readFile(p, 'utf-8');
    parsed = JSON.parse(raw);
  } catch {
    parsed = null; // missing or unreadable file → treat as first run
  }

  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    const t = obj.toggles;
    if (typeof t === 'object' && t !== null && !Array.isArray(t)) {
      cachedProfile = { toggles: { ...(t as Record<string, boolean>) } };
      cachePath = p;
      return cachedProfile;
    }
  }

  cachedProfile = { ...EMPTY_PROFILE, toggles: {} };
  cachePath = p;
  return cachedProfile;
}

/**
 * Read the currently loaded (in-memory) sparse profile.
 * Returns null until loadGatingProfile()/syncToolGatingProfile() has run for this path —
 * callers must treat that as "no memory yet", never as an empty user choice set.
 */
export function getLoadedGatingProfile(): GatedProfile | null {
  if (cachedProfile === null || cachePath !== getProfilePath()) return null;
  return cachedProfile;
}

/** Apply the stored profile over a config draft: sticky keys win over host/panel values. */
export function applyGatingOverlay(config: Record<string, unknown>): void {
  const profile = getLoadedGatingProfile();
  if (profile === null) {
    // No memory yet for this path (e.g. first pass of a fresh process) -> nothing to overlay.
    return;
  }
  for (const key of Object.keys(profile.toggles)) {
    if (!BOOLEAN_KEYS.includes(key as keyof typeof DEFAULT_CONFIG)) continue; // ignore unknown keys
    config[key] = profile.toggles[key]; // concrete index-signature type -> write allowed (no TS2862)
  }
}
/**
 * SINGLE-ENTRY-PASS FOR TOOLS PROVIDERS — applies the agreed semantics atomically:
 *   1. RECONCILE: stored keys whose PRISTINE live value is a NON-DEFAULT that differs from storage
 *      are unambiguous user re-toggles and beat sticky storage; default-valued differences (fresh-chat
 *      fallback vs. explicit revert — indistinguishable, per-chat scope) keep the sticky value;
 *   2. OVERLAY: all other stored values win over host/panel values that fell back to defaults in
 *      new chats ("sticky keys"); non-sticky fields are never touched;
 *   3. FINALIZE: storage is rebuilt from the final config — sticky values persist (they are in the
 *      config), evicted defaults drop out — and persisted EXACTLY ONCE, only when anything changed
 *      (no disk I/O in steady state). The in-memory cache ends equal to what's on disk.
 * Returns true when storage was actually written. `config` is mutated (overlay + re-toggles); a
 * failed write leaves the previous file intact and self-heals on the next pass because finalize
 * rebuilds from the config rather than diffing files.
 */
export async function syncToolGatingProfile(config: Record<string, unknown>): Promise<boolean> {
  const p = getProfilePath();
  if (cachedProfile === null || cachePath !== p) {
    await loadGatingProfile(); // ensure the cache belongs to the current path (no-op when warm)
  }

  // Snapshot BEFORE any mutation — change detection must compare against this, not post-reconcile state.
  const before: GatedProfile = cachedProfile ? { toggles: { ...cachedProfile.toggles } } : EMPTY_PROFILE;

  // ── Phase 1: RECONCILE (unambiguous live re-toggles beat sticky storage) ────────────────────
  // Per the SDK, getPluginConfig is PER-CHAT scoped ("Per-chat configs are stored per chat"), so a
  // fresh chat hands back schematic defaults for every unset key — byte-identical to what an
  // explicit revert-to-default would look like. The two cases are indistinguishable by value alone
  // (the controller exposes no chat identity). Hence the conservative contract: only a NON-DEFAULT
  // live value that differs from storage is a definitive re-toggle; default-valued differences keep
  // the sticky stored value ("sticky keys" per the agreed design — turning a toggle back to its
  // default requires deleting/replacing this profile, e.g. via the planned clear tool).
  const reToggled = new Set<string>();
  for (const key of Object.keys(before.toggles)) {
    if (!BOOLEAN_KEYS.includes(key as keyof typeof DEFAULT_CONFIG)) continue; // ignore unknown entries
    const liveValue = config[key];
    if (typeof liveValue !== 'boolean') continue; // host supplied no usable value → not a re-toggle
    if (liveValue === before.toggles[key]) continue; // matches storage → no new intent this pass
    if (liveValue === DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG]) {
      continue; // default-valued: fresh-chat fallback OR explicit revert — keep sticky, never evict here
    }
    reToggled.add(key); // non-default AND ≠ stored → user set a different value in this chat
  }

  // ── Phase 2: OVERLAY (sticky values, except where the user just acted) ──────────────────────
  for (const [key, stored] of Object.entries(before.toggles)) {
    if (!BOOLEAN_KEYS.includes(key as keyof typeof DEFAULT_CONFIG)) continue; // ignore unknown keys
    if (reToggled.has(key)) continue; // panel is the live control — keep the live value
    config[key] = stored;
  }

  // ── Phase 3: FINALIZE (rebuild storage from final config, persist once on change) ───────────
  const next: GatedProfile = { toggles: {} };
  for (const key of BOOLEAN_KEYS) {
    const value = config[key];
    if (typeof value !== 'boolean') continue; // booleans only — never paths/tokens/secrets
    if (value === DEFAULT_CONFIG[key]) continue; // at default → not a stored choice (sparse eviction)
    next.toggles[key] = value; // user's current intent, live or sticky
  }

  const changedKeys: string[] = [];
  for (const key of Object.keys(next.toggles)) {
    if (before.toggles[key] !== next.toggles[key]) changedKeys.push(key);
  }
  for (const key of Object.keys(before.toggles)) {
    if (!(key in next.toggles) && before.toggles[key] !== undefined) changedKeys.push(key); // evicted to default
  }

  let wrote = false;
  if (changedKeys.length > 0) {
    await atomicWriteFile(p, JSON.stringify(next, null, 2));
    wrote = true;
    console.log(
      `[AI Toolbox] Tool gating profile updated (${Object.keys(next.toggles).length} stored toggle(s); changed: ${changedKeys.join(', ')})`,
    );
  }

  // Cache ends the pass equal to disk → the next overlay/call is authoritative without a re-read.
  cachedProfile = next;
  cachePath = p;
  return wrote;
}

/** Clear the persisted profile and the in-memory copy. Safe to call repeatedly; resolves true when done. */
export async function clearGatingProfile(): Promise<boolean> {
  const p = getProfilePath();
  try {
    await fs.unlink(p);
  } catch {
    // no-op if already absent
  }
  cachedProfile = null;
  cachePath = null;
  return true;
}

/** Test hook: drop the in-memory profile cache so the next access re-reads disk. */
export function resetGatingProfileCache(): void {
  cachedProfile = null;
  cachePath = null;
}
