/**
 * i18n language manager - switches between translation sets
 */

import type { LanguageCode, FullTranslationSet } from './types';
import { enTranslations } from './en';
import { deTranslations } from './de';

export class I18nManager {
  private translations: Map<LanguageCode, FullTranslationSet>;
  private currentLanguage: LanguageCode;

  constructor() {
    this.translations = new Map();
    this.translations.set('en', enTranslations);
    this.translations.set('de', deTranslations);
    
    // Register zh-CN and zh-TW (fallback to English translations for now)
    this.translations.set('zh-CN', enTranslations);
    this.translations.set('zh-TW', enTranslations);
    
    this.currentLanguage = 'en'; // Default language
  }

  /**
   * Set current language
   */
  setLanguage(language: LanguageCode): void {
    if (!this.translations.has(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    this.currentLanguage = language;
  }

  /**
   * Get current translation set
   */
  getTranslations(): FullTranslationSet {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.translations.get(this.currentLanguage)!;
  }

  /**
   * Get a specific translation by category and key
   */
  get(category: keyof FullTranslationSet, key?: string): unknown {
    const translations = this.getTranslations();
    if (key) {
      const categoryTranslations = translations[category] as Record<string, unknown>;
      return categoryTranslations[key];
    }
    return translations[category];
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): LanguageCode[] {
    return Array.from(this.translations.keys());
  }

  /**
   * Get current language code
   */
  getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }
}
