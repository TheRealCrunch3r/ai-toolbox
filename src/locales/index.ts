/**
 * i18n locale registry (i18n-CONFIRM arc, 06.10) — first LIVE consumer of src/locales/*.ts.
 *
 * Scope: the confirmation prompts only (session-memory checkpoint save + project/CWD switch).
 * - DISPLAY: getConfirmationWords(language) returns ONE configured language's words ("🌐 Language"
 *   menu, config.ts); unknown/unset values fall back to English (config default is 'en').
 * - ACCEPTANCE: ALL_CONFIRM_WORDS / ALL_DECLINE_WORDS are unions derived from EVERY locale set at
 *   module load. Reply parsing is deliberately language-AGNOSTIC by design (owner verdict 06.10):
 *   a user with German configured may still reply YES, and any user may reply in any shipped
 *   language. Deriving the union from the same files that drive display keeps ONE source of truth —
 *   a locale added later is accepted automatically.
 */

import type { FullTranslationSet, LanguageCode, RuntimeTexts, UiLabels } from './types';
import { enTranslations } from './en';
import { deTranslations } from './de';
import { esTranslations } from './es';
import { zhCNTranslations } from './zh-CN';
import { zhTWTranslations } from './zh-TW';

/** Registry of all shipped locale sets, keyed by the config `language` value. */
const SETS: Record<LanguageCode, FullTranslationSet> = {
  en: enTranslations,
  de: deTranslations,
  es: esTranslations,
  'zh-CN': zhCNTranslations,
  'zh-TW': zhTWTranslations,
};

/** Resolve a configured language to its locale set; unknown/unset values fall back to English. */
function resolveSet(language: string | null | undefined): FullTranslationSet {
  return SETS[language as LanguageCode] ?? SETS.en;
}

/** The confirmation words to DISPLAY for the user's configured language (one pair, never bilingual). */
export function getConfirmationWords(language?: string | null): { yes: string; no: string } {
  const set = resolveSet(language);
  return { yes: set.general.yesWord, no: set.general.noWord };
}

// ---- Acceptance sets (language-agnostic by design — see module docblock) -------------------------

function buildAcceptedWords(pick: (set: FullTranslationSet) => string): ReadonlySet<string> {
  const out = new Set<string>();
  for (const set of Object.values(SETS)) {
    const word = pick(set).trim().toUpperCase();
    if (word.length > 0) out.add(word);
  }
  return out;
}

/** Every confirm word in every shipped language. Canonical members: YES, JA, SÍ, 确认, 確認. */
export const ALL_CONFIRM_WORDS: ReadonlySet<string> = buildAcceptedWords((s) => s.general.yesWord);

/** Every decline word in every shipped language. Canonical members: NO, NEIN, 取消 (Spanish 'NO' dedupes onto English). */
export const ALL_DECLINE_WORDS: ReadonlySet<string> = buildAcceptedWords((s) => s.general.noWord);


// ---- UNIFIED LANGUAGE v2 (step 4, 27.10): runtime-text access for the per-turn message layer ----------
// The resolver itself lives in promptPreprocessor.ts ('message layer' placement — Option B) so this file
// stays hostLanguage-free and no additional jest mapper entries are needed; it only hands out bundle data.

/**
 * The RUNTIME texts (prompt banners, warnings, answer-language line) for a language code or raw config
 * value: unknown/unset values fall back to English via resolveSet() — same contract as getConfirmationWords().
 */
export function getRuntimeTexts(language?: string | null): RuntimeTexts {
  return resolveSet(language).runtimeTexts;
}

/** Human-readable display names per shipped locale (v2: feeds the answerLanguageLine's {language} slot). */
export const LANGUAGE_DISPLAY_NAMES: Readonly<Record<LanguageCode, string>> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

/**
 * The SETTINGS-PANEL labels (displayName/subtitle/hint per config row) for a language code or raw config
 * value: unknown/unset values fall back to English via resolveSet() — same contract as getRuntimeTexts().
 * UNIFIED LANGUAGE v2 step 5 (27.10): the boot-time baker consumes this (uiLabelBake.ts); buildConfigSchematics()
 * falls back to EN literals field-by-field when called without a bundle, so an absent argument is byte-safe.
 */
export function getUiLabels(language?: string | null): UiLabels {
  return resolveSet(language).uiLabels;
}

/**
 * Fill `{name}` placeholders in a runtime-text template with the given values. Unknown placeholders are
 * left VERBATIM (visible drift over silent loss) — no en template contains stray braces, so this is safe.
 */
export function fillTemplate(template: string, values: Record<string, string>): string {
  // typeof guard first: the regex capture is typed `any` — accessing [k] directly trips @typescript-eslint/no-unsafe-member-access.
  return template.replace(/\{(\w+)\}/g, (m, k) => (typeof k === 'string' && k in values ? values[k] : m));
}
