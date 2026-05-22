/**
 * Tests for Browser Actions validation
 */

import { validateAction, BrowserAction } from '../src/browserActions';

describe('validateAction', () => {
  test('should allow valid wait action', () => {
    const action: BrowserAction = { type: 'wait', milliseconds: 1000 };
    expect(validateAction(action)).toBe(true);
  });

  test('should reject wait exceeding timeout', () => {
    const action: BrowserAction = { type: 'wait', milliseconds: 35000 };
    expect(validateAction(action)).toBe(false);
  });

  test('should require selector for click action', () => {
    const action: BrowserAction = { type: 'click' }; // No selector
    expect(validateAction(action)).toBe(false);
  });

  test('should allow click with selector', () => {
    const action: BrowserAction = { type: 'click', selector: '#button' };
    expect(validateAction(action)).toBe(true);
  });

  test('should reject overly long evaluate script', () => {
    const action: BrowserAction = { 
      type: 'evaluate', 
      script: 'x'.repeat(10001) 
    };
    expect(validateAction(action)).toBe(false);
  });

  test('should allow short evaluate script', () => {
    const action: BrowserAction = { 
      type: 'evaluate', 
      script: 'console.log("hello")' 
    };
    expect(validateAction(action)).toBe(true);
  });

  test('should reject negative wait milliseconds', () => {
    const action: BrowserAction = { type: 'wait', milliseconds: -100 };
    expect(validateAction(action)).toBe(false);
  });
});