/**
 * Tests for i18n language manager
 */

import { I18nManager } from '../src/locales/i18n';

describe('I18nManager', () => {
  let manager: I18nManager;

  beforeEach(() => {
    manager = new I18nManager();
  });

  test('should default to English', () => {
    expect(manager.getCurrentLanguage()).toBe('en');
  });

  test('should switch languages', () => {
    manager.setLanguage('de');
    expect(manager.getCurrentLanguage()).toBe('de');
    
    manager.setLanguage('zh-CN');
    expect(manager.getCurrentLanguage()).toBe('zh-CN');
  });

  test('should throw on unsupported language', () => {
    expect(() => manager.setLanguage('fr' as any)).toThrow();
  });

  test('should get translations by category', () => {
    const fileSystem = manager.get('fileSystem');
    expect(fileSystem).toBeDefined();
    expect((fileSystem as any).categoryTitle).toContain('File System');
  });

  test('should get specific translation key', () => {
    const pluginName = manager.get('general', 'pluginName');
    expect(pluginName).toBe('AI Toolbox Plugin');
  });

  test('should list available languages', () => {
    const languages = manager.getAvailableLanguages();
    expect(languages).toContain('en');
    expect(languages).toContain('de');
    expect(languages).toContain('zh-CN');
    expect(languages).toContain('zh-TW');
  });

  test('should return different translations for different languages', () => {
    manager.setLanguage('en');
    const enTitle = (manager.get('fileSystem') as any).categoryTitle;
    
    manager.setLanguage('de');
    const deTitle = (manager.get('fileSystem') as any).categoryTitle;
    
    expect(enTitle).not.toBe(deTitle);
  });
});

describe('I18nManager translation coverage guards (anti-stub)', () => {
  // Guards against aliasing a language to another's translation set
  // (the zh -> en fallback that shipped in v1.9.x) and against silent
  // key drift between languages.

  const HAN = /[\u3400-\u4DBF\u4E00-\u9FFF]/;

  const hanCount = (s: string): number => (s.match(/[\u4E00-\u9FFF]/g) ?? []).length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asAny = (x: unknown): any => x;

  test('all languages share the exact category + tool structure of English', () => {
    const enManager = new I18nManager();
    const base = asAny(enManager.getTranslations());
    for (const lang of ['de', 'es', 'zh-CN', 'zh-TW']) {
      const m = new I18nManager();
      m.setLanguage(lang);
      const set = asAny(m.getTranslations());
      expect(Object.keys(set).sort()).toEqual(Object.keys(base).sort());
      for (const cat of Object.keys(base)) {
        if (cat === 'general') continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const baseTools: string[] = base[cat].tools.map((t: any) => t.toolName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const langTools: string[] = set[cat].tools.map((t: any) => t.toolName);
        expect(langTools).toEqual(baseTools);
      }
    }
  });

  test('no language is an alias of English (category titles must differ)', () => {
    const enManager = new I18nManager();
    const base = asAny(enManager.getTranslations());
    const violations: string[] = [];
    for (const lang of ['de', 'es', 'zh-CN', 'zh-TW']) {
      const m = new I18nManager();
      m.setLanguage(lang);
      const set = asAny(m.getTranslations());
      for (const cat of Object.keys(base)) {
        if (cat === 'general') continue;
        if (set[cat].categoryTitle === base[cat].categoryTitle) {
          violations.push(`${lang}/${cat}: category title identical to English`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  test('zh-CN and zh-TW are genuinely Chinese (CJK residue guard)', () => {
    const violations: string[] = [];
    for (const lang of ['zh-CN', 'zh-TW']) {
      const m = new I18nManager();
      m.setLanguage(lang);
      const set = asAny(m.getTranslations());
      if (!HAN.test(set.general.pluginName)) {
        violations.push(`${lang}/general: pluginName lacks CJK text`);
      }
      for (const cat of Object.keys(set)) {
        if (cat === 'general') continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tools: any[] = set[cat].tools;
        for (const t of tools) {
          if (!HAN.test(t.description)) {
            violations.push(`${lang}/${t.toolName}: description lacks CJK text: ${JSON.stringify(t.description)}`);
          } else if (hanCount(t.description) < 2) {
            violations.push(`${lang}/${t.toolName}: only one CJK char in description: ${JSON.stringify(t.description)}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  test('zh-TW and zh-CN are distinct variants, not copies of each other', () => {
    const cnM = new I18nManager();
    cnM.setLanguage('zh-CN');
    const twM = new I18nManager();
    twM.setLanguage('zh-TW');
    const cn = asAny(cnM.getTranslations());
    const tw = asAny(twM.getTranslations());
    let diffs = 0;
    for (const cat of Object.keys(cn)) {
      if (cat === 'general') continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cn[cat].tools.forEach((t: any, i: number) => {
        if (tw[cat].tools[i].description !== t.description) diffs++;
      });
    }
    expect(diffs).toBeGreaterThan(0);
  });
});
