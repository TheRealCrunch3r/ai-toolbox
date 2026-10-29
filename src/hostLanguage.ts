/**
 * Host language detection (UNIFIED LANGUAGE v2, step 3 — 26.10).
 *
 * Resolves the LM Studio HOST's UI language so 'auto' mode (step 5) can follow the app instead of
 * guessing. Resolution chain:
 *   home     := env AI_TOOLBOX_LM_HOME                        (hermetic-test seam; read FRESH per call)
 *             ?? <homedir>/.lmstudio-home-pointer → target dir  (real pointer file on 26.10 — verified live:
 *                                                              its content is a JSON-ENCODED path string, so the
 *                      raw trimmed value is accepted too if it isn't valid JSON)
 *             ?? <homedir>/.lmstudio
 *   homedir  := setLmHomeOverride() pin                        (TEST-ONLY user-home substitute, never set in prod)
 *                    ?? os.homedir()
 *   language := <home>/settings.json → "language" field.
 * The host value maps onto the shipped LanguageCode set; unknown values ('ja', 'fr', …) and EVERY failure
 * mode (no pointer, no home dir, unreadable/corrupt settings.json, non-string field) return '' — this module
 * NEVER throws: it runs on a per-turn prompt path where one bad read must not kill the turn. Step 4/5 consume
 * '' as "host has no usable preference" and continue their fallback chain (OS detect → en).
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { LanguageCode } from './locales/types.js'; // type-only — erased at runtime, never jest-resolved

/**
 * Result of host-language resolution: a shipped locale ID OR the empty-string sentinel meaning "the host
 * gave no usable preference" (unknown value like 'ja', missing pointer/home/settings.json, corrupt JSON).
 * Step 4/5 consumers narrow on `!== ''` and continue their fallback chain (OS detect → en) when it is ''.
 */
export type HostLocale = LanguageCode | '';

/** Hermetic-test seam: fixture LM-Studio home dir (must contain a settings.json). Read fresh on every call. */
export const LM_HOME_ENV = 'AI_TOOLBOX_LM_HOME';

/**
 * Hermetic-test seam (TEST-ONLY): pin of the USER HOME DIR — substitutes for os.homedir() inside resolveLmHome(),
 * so the pointer/default-home chain then runs against the pinned profile exactly as it would with a real home. The
 * env seam AI_TOOLBOX_LM_HOME still wins over the pin (it stands in for a resolved LM home, not a user profile).
 * Pass a dir to pin; pass undefined/'' to clear. Exists because under this repo's jest runner os.homedir() IGNORED
 * USERPROFILE/HOME overrides (26.10 gate: 8 cases leaked the developer's real profile) while plain node honored them
 * — libuv/platform-specific, so tests must not depend on it. Same house pattern as dataDir.ts setDataDirOverride /
 * updateChecker setVersionDirOverride; a no-op in production (nothing outside tests ever calls it). Read fresh per call.
 */
let lmHomeOverride: string | null = null;

export function setLmHomeOverride(dir?: string): void {
  lmHomeOverride = typeof dir === 'string' && dir.trim().length > 0 ? dir : null;
}

const POINTER_FILE_NAME = '.lmstudio-home-pointer';
const SETTINGS_FILE_NAME = 'settings.json';

/** Host `language` values → shipped locale IDs. Case-insensitive; unknown/absent host languages map to ''. */
const HOST_LOCALE_MAP: ReadonlyMap<string, LanguageCode> = new Map([
  ['en', 'en'],
  ['de', 'de'],
  ['es', 'es'],
  // Simplified Chinese — exact key verified on the live LM Studio settings.json (26.10).
  ['zh-cn', 'zh-CN'],
  ['zh-tw', 'zh-TW'],
]);

function isDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Read the host home-pointer file. Real-world format (verified on this machine, 26.10): a JSON-encoded path
 * string, e.g. `"C:\\Users\\root.MPITS\\.lmstudio"`. A non-JSON raw path is accepted as a fallback so both
 * writer styles resolve; anything empty or unparseable returns null. Never throws.
 */
function readPointerTarget(homedir: string): string | null {
  try {
    const raw = fs.readFileSync(path.join(homedir, POINTER_FILE_NAME), 'utf8').trim();
    if (raw.length === 0) return null;
    if (raw.startsWith('"')) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return null; // malformed JSON — do not guess at a partial path
      }
      return typeof parsed === 'string' && parsed.length > 0 ? parsed : null;
    }
    return raw;
  } catch {
    return null;
  }
}

/** Resolve the LM Studio home directory (env seam → pointer target → ~/.lmstudio, with a test-only user-home pin). Null when none exists. */
export function resolveLmHome(): string | null {
  const envHome = process.env[LM_HOME_ENV];
  if (typeof envHome === 'string' && envHome.trim().length > 0) {
    return isDirectory(envHome.trim()) ? envHome.trim() : null;
  }
  const homedir = lmHomeOverride ?? os.homedir(); // TEST-ONLY pin substitutes for the user home dir (see setLmHomeOverride)
  const pointerTarget = readPointerTarget(homedir);
  if (pointerTarget !== null && isDirectory(pointerTarget)) {
    return pointerTarget;
  }
  const defaultHome = path.join(homedir, '.lmstudio');
  return isDirectory(defaultHome) ? defaultHome : null;
}

/** Read settings.json's "language" field from an LM home dir. Null when absent/unreadable/not a string. */
export function readHostLanguageSetting(home: string): string | null {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(path.join(home, SETTINGS_FILE_NAME), 'utf8'));
    if (typeof parsed !== 'object' || parsed === null) return null;
    const language = (parsed as Record<string, unknown>).language;
    return typeof language === 'string' ? language : null;
  } catch {
    return null; // missing file, corrupt JSON, permissions — all collapse to "no preference"
  }
}

/** Map a host `language` value onto the shipped locale set. Case-insensitive; unknown values (e.g. 'ja') → ''. */
export function mapHostLanguage(value: string | null): HostLocale {
  if (value === null) return '';
  const v = value.trim().toLowerCase();
  return HOST_LOCALE_MAP.get(v) ?? '';
}

/** One-call entry point for step 4/5 consumers. NEVER throws — '' (the HostLocale sentinel) on any failure anywhere in the chain. */
export function getHostLocale(): HostLocale {
  try {
    const home = resolveLmHome();
    if (home === null) return '';
    return mapHostLanguage(readHostLanguageSetting(home));
  } catch {
    return ''; // belt-and-braces: the chain above is already failure-closed, this keeps the contract absolute
  }
}


/**
 * OS-level locale fallback for step 4/5 per-turn resolution. Uses `new Intl.NumberFormat().resolvedOptions().locale`
 * — the spec-standard way to read the runtime's default locale (ICU-backed: LANG-derived on unix,
 * user-profile locale on Windows; no non-standard Intl properties involved). Returns '' when nothing usable is
 * available; NEVER throws. Trimmed + lowercased first tag so callers compare directly ('de' matches 'de-DE').
 */
export function getOsLocale(): string {
  try {
    const tag = new Intl.NumberFormat().resolvedOptions().locale ?? '';
    return String(tag).split('-')[0].trim().toLowerCase();
  } catch {
    return ''; // exotic ICU/locale environments — the resolution chain treats '' as "no preference"
  }
}
