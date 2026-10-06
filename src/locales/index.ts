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

import type { FullTranslationSet, LanguageCode } from './types';
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
