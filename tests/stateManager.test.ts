/**
 * Tests for StateManager (persistent state management)
 */

import { StateManager } from '../src/stateManager';
import { DEFAULT_CONFIG } from '../src/config';

describe('StateManager', () => {
  let manager: StateManager;

  beforeEach(() => {
    const testConfig = { ...DEFAULT_CONFIG, statePersistenceEnabled: false };
    manager = new StateManager(testConfig);
    manager.clear(); // Isolate tests from persistent disk state
  });

  test('should set and get values', () => {
    manager.set('key1', 'value1');
    expect(manager.get<string>('key1')).toBe('value1');
  });

  test('should return undefined for missing keys', () => {
    expect(manager.get<string>('nonexistent')).toBe(undefined);
  });

  test('should delete entries', () => {
    manager.set('key1', 'value1');
    manager.delete('key1');
    expect(manager.get<string>('key1')).toBe(undefined);
  });

  test('should get all keys', async () => {
    manager.set('a', 1);
    manager.set('b', 2);
    await expect(manager.getAllKeys()).resolves.toEqual(['a', 'b']);
  });

  test('should clear all state', async () => {
    manager.set('key1', 'value1');
    manager.clear();
    await expect(manager.getAllKeys()).resolves.toEqual([]);
  });

  test('should enforce size limit', () => {
    // Use a very small max size to trigger the limit quickly
    const limitedManager = new StateManager({ ...DEFAULT_CONFIG, stateMaxSize: 10 });
    
    // Setting a value that exceeds the limit should throw synchronously
    let errorThrown = false;
    try {
      limitedManager.set('key', 'a'.repeat(20)); // 20 bytes > 10 byte limit
    } catch (e) {
      errorThrown = true;
      expect((e as Error).message).toContain('State size exceeds maximum');
    }
    expect(errorThrown).toBe(true);
  });

  test('should export and import state', () => {
    manager.set('key1', 'value1');
    manager.set('key2', { nested: true });
    
    const exported = manager.exportState();
    expect(exported).toBeDefined();
    
    manager.clear();
    manager.importState(exported);
    
    expect(manager.get<string>('key1')).toBe('value1');
  });

  test('should reject invalid import JSON', () => {
    expect(() => manager.importState('not valid json')).toThrow();
  });
});
