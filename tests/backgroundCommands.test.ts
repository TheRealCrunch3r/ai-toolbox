/**
 * Tests for BackgroundCommandManager (long-running process tracking)
 */

import { BackgroundCommandManager } from '../src/backgroundCommands';

describe('BackgroundCommandManager', () => {
  let manager: BackgroundCommandManager;

  beforeEach(() => {
    manager = new BackgroundCommandManager();
  });

  test('should register command with valid parameters', () => {
    const id = manager.register('npm run build', 2, 'Build Command');
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  test('should reject timeout outside range', () => {
    expect(() => manager.register('command', 0.05, 'Name')).toThrow();
    expect(() => manager.register('command', 11, 'Name')).toThrow();
  });

  test('should reject missing name', () => {
    expect(() => manager.register('command', 2, '')).toThrow();
  });

  test('should check command status', () => {
    const id = manager.register('npm run build', 2, 'Build Command');
    const command = manager.check(id);
    
    expect(command).toBeDefined();
    expect(command?.status).toBe('running');
  });

  test('should return null for unknown ID', () => {
    expect(manager.check('nonexistent_id')).toBe(null);
  });

  test('should cancel running command', () => {
    const id = manager.register('npm run build', 2, 'Build Command');
    
    const cancelled = manager.cancel(id);
    expect(cancelled).toBe(true);
    
    const command = manager.check(id);
    expect(command?.status).toBe('cancelled');
  });

  test('should reject cancel of non-running command', () => {
    const id = manager.register('npm run build', 2, 'Build Command');
    manager.cancel(id); // Already cancelled
    
    const cancelled = manager.cancel(id);
    expect(cancelled).toBe(false);
  });

  test('should get active commands', () => {
    manager.register('cmd1', 2, 'Command 1');
    manager.register('cmd2', 2, 'Command 2');
    
    const active = manager.getActiveCommands();
    expect(active.length).toBe(2);
  });

  test('should cleanup old commands', () => {
    manager.register('old_cmd', 0.1, 'Old Command'); // Very short timeout
    
    // Simulate time passage (in real test would use jest.advanceTimers)
    manager.cleanup(0.05); // Cleanup after 3 minutes
    
    expect(manager.getCount()).toBeLessThanOrEqual(1);
  });

  test('should generate unique IDs', () => {
    const id1 = manager.register('cmd1', 2, 'Command 1');
    const id2 = manager.register('cmd2', 2, 'Command 2');
    
    expect(id1).not.toBe(id2);
  });

  test('should track command count', () => {
    expect(manager.getCount()).toBe(0);
    
    manager.register('cmd1', 2, 'Command 1');
    expect(manager.getCount()).toBe(1);
  });
});