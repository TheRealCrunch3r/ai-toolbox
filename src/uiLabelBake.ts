/**
 * Boot-time UI-label bake (UNIFIED LANGUAGE v2, step 5 — 27.10).
 *
 * The settings panel is registered ONCE at boot via context.withGlobalConfigSchematics() (Option A, 02.11 — global scope) and the SDK's
 * PluginContext exposes no config getter at that point (see index.ts note), so a user's concrete
 * language pick made in the UI cannot be read directly at load time. This module closes the gap:
 *
 *   1. resolvePanelUiLanguage(configured?) — boot-time resolution of ONE concrete locale for the
 *      panel labels. Chain (mirrors promptPreprocessor.resolveTurnLanguage() exactly, minus the
 *      per-turn config read): concretely configured value → LM Studio host preference
 *      (getHostLocale()) → OS locale first tag (getOsLocale()) → English. 'auto' falls through by
 *      construction, so a default('auto') schema can never leak into the panel as a language.
 *   2. readPersistedUiLanguageCode() / persistConcretePick(code) — reload consistency via
 *      `<dataDir>/ui-label-state.json` in the persistent plugin DATA area (survives reinstalls,
 *      isolated under jest — see dataDir.ts). The per-turn layer persists the EFFECTIVE language it
 *      resolved for this session (promptPreprocessor.preprocess(), step-5 hook); at boot a persisted
 *      concrete pick wins over host/OS re-resolution so the panel matches what prompts already render.
 *
 * EN byte-safety: when no state file exists, resolution lands wherever host/OS lands — but callers in
 * index.ts only pass the result to buildConfigSchematics(), whose per-field `??` EN-literal fallbacks
 * keep every label valid; for en-bundle picks the panel is byte-identical to pre-v2 except the new
 * 'auto' option.
 *
 * Failure contract: NOTHING here throws — a bad state file or unreadable dir degrades to "no cached
 * pick" / "skip persist", and resolution falls through to English at worst. Boot must never fail on i18n.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDataDir } from './dataDir'; // extensionless: ts-jest resolves via moduleFileExtensions — no jest mapper entry needed (same convention as stateManager → sharedFileLock)
import { getHostLocale, getOsLocale } from './hostLanguage'; // extensionless: real-src pure read-only module; './hostLanguage.js' already mapped for promptPreprocessor's suffixed form
import type { LanguageCode } from './locales/types.js'; // type-only — erased at runtime, never jest-resolved (same convention as promptPreprocessor); UiLabels not needed here — getUiLabels re-exports its own typed signature from ./locales

/** State file name inside the persistent plugin data dir (see getDataDir()). */
const UI_LABEL_STATE_FILE = 'ui-label-state.json';

/**
 * Shipped locale IDs keyed by their lowercase config form. MIRRORS promptPreprocessor.ts
 * SHIPPED_LANGUAGE_CODES verbatim — keep in sync if a locale is added/renamed; the two maps must
 * accept exactly the same value sets (config schema enum is the third copy, pinned by tests).
 */
const SHIPPED_UI_CODES: Readonly<Record<string, LanguageCode>> = {
  en: 'en',
  de: 'de',
  es: 'es',
  'zh-cn': 'zh-CN',
  'zh-tw': 'zh-TW',
};

/** In-memory copy of the last known persisted pick — makes repeat reads within a boot/turn free. */
let cachedUiLanguageCode: LanguageCode | null = null;

function stateFilePath(): string {
  return path.join(getDataDir(), UI_LABEL_STATE_FILE);
}

/** Map a raw configured value onto the shipped locale set. Null for 'auto'/unknown/absent (fall through). */
export function mapConfiguredUiLanguage(configured?: string | null): LanguageCode | null {
  if (typeof configured !== 'string') return null;
  return SHIPPED_UI_CODES[configured.trim().toLowerCase()] ?? null;
}

/**
 * Resolve the ONE concrete language to bake into the settings-panel labels at boot.
 * Pure function of its inputs + host/OS probes — never touches fs, so jest can pin it hermetically
 * (host probe via AI_TOOLBOX_LM_HOME env seam / setLmHomeOverride, see hostLanguage.ts).
 */
export function resolvePanelUiLanguage(configured?: string | null): LanguageCode {
  const concrete = mapConfiguredUiLanguage(configured);
  if (concrete) return concrete; // explicit user pick wins — 'auto' and unknowns fall through by construction
  const persisted = readPersistedUiLanguageCode();
  if (persisted !== null) return persisted; // reload consistency: last effective pick beats host/OS re-resolution
  const hostLocale = getHostLocale();
  if (hostLocale !== '') return hostLocale;
  const osTag = getOsLocale().split('-')[0];
  return SHIPPED_UI_CODES[osTag] ?? 'en'; // OS first tag → shipped set → English (never '', never throws)
}

/**
 * Read the persisted concrete UI language code. Returns null when the file is absent, unreadable,
 * corrupt, or holds an unknown value — NEVER throws (a bad state file must not block plugin boot).
 */
export function readPersistedUiLanguageCode(): LanguageCode | null {
  if (cachedUiLanguageCode !== null) return cachedUiLanguageCode; // in-memory repeat read (set by persistConcretePick this process lifetime)
  try {
    const raw = fs.readFileSync(stateFilePath(), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const v = (parsed as Record<string, unknown>).uiLanguage;
    if (typeof v === 'string') {
      const code = SHIPPED_UI_CODES[v.trim().toLowerCase()];
      if (code) {
        cachedUiLanguageCode = code;
        return code;
      }
    }
    return null; // absent/unknown value — fall through the resolution chain
  } catch {
    return null; // missing file, corrupt JSON, permissions — all "no cached pick"
  }
}

/**
 * Persist a concrete UI language pick so the next boot bakes the same panel language (reload
 * consistency). Atomic-enough single small write: this is one tiny JSON object in the plugin's own
 * data dir. Returns true when the write landed; false on any failure — NEVER throws, and failures are
 * silent here because callers run on boot/turn paths where i18n must stay non-fatal (index.ts logs).
 */
export function persistConcretePick(code: LanguageCode): boolean {
  if (!(Object.values(SHIPPED_UI_CODES) as string[]).includes(code)) return false; // defensive: only the five concrete shipped codes may be persisted — 'auto' must never land on disk
  if (cachedUiLanguageCode === code) return true; // unchanged this process lifetime — skip a redundant same-content write (per-turn hot path in preprocess())
  try {
    fs.writeFileSync(stateFilePath(), `${JSON.stringify({ uiLanguage: code }, null, 2)}\n`, 'utf8');
    cachedUiLanguageCode = code;
    return true;
  } catch {
    return false; // non-fatal by contract — panel falls back to host/OS chain on next boot
  }
}

/** The settings-panel bundle for a language code or raw config value (EN fallback) — thin passthrough so index.ts imports one module for the whole bake. */
export { getUiLabels } from './locales'; // extensionless re-export: resolves via ts-jest like promptPreprocessor's own './locales' import
