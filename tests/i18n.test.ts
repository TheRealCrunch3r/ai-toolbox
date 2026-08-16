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