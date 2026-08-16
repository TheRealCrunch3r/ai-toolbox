/**
 * Tests for config validation and schema
 */

import { ConfigSchema, validateConfig, DEFAULT_CONFIG, isToolEnabled } from '../src/config';

describe('Config Schema', () => {
  test('should validate valid config', () => {
    const result = ConfigSchema.safeParse(DEFAULT_CONFIG);
    expect(result.success).toBe(true);
  });

  test('should reject invalid config', () => {
    const invalidConfig = { fileSystem: 'yes' }; // Wrong type
    const result = ConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  test('should use defaults for missing fields', () => {
    const partialConfig = {};
    const result = ConfigSchema.safeParse(partialConfig);
    expect(result.success).toBe(true);
    expect(result.data!.fileSystem).toBe(true); // Default value
  });
});

describe('validateConfig', () => {
  test('should return valid config object', () => {
    const validated = validateConfig(DEFAULT_CONFIG);
    expect(validated).toEqual(DEFAULT_CONFIG);
  });

  test('should throw on invalid config', () => {
    expect(() => validateConfig({ browserTimeout: -1 })).toThrow();
  });
});

describe('isToolEnabled', () => {
  test('should return true for enabled category', () => {
    expect(isToolEnabled(DEFAULT_CONFIG, 'fileSystem')).toBe(true);
  });

  test('should return false for disabled category', () => {
    const config = { ...DEFAULT_CONFIG, browserAutomation: false };
    expect(isToolEnabled(config, 'browserAutomation')).toBe(false);
  });
});
