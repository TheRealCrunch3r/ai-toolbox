import { RepeatToolReminder } from '../src/utils/repeatToolReminder.js';

describe('RepeatToolReminder', () => {
  let reminder: RepeatToolReminder;

  beforeEach(() => {
    reminder = new RepeatToolReminder();
  });

  test('no nudge on first call', () => {
    reminder.nextTurn();
    expect(reminder.check('read_file', { path: '/a' })).toBeNull();
    expect(reminder.getCount('read_file', { path: '/a' })).toBe(1);
  });

  test('nudge at thresholds 3,5,8', () => {
    for (let i = 0; i < 7; i++) reminder.nextTurn();
    const args = { path: '/b' };
    let msg: string | null = null;
    for (let i = 1; i <= 8; i++) {
      msg = reminder.check('read_file', args);
      if ([3,5,8].includes(i)) expect(msg).not.toBeNull();
      else expect(msg).toBeNull();
    }
    expect(reminder.getCount('read_file', args)).toBe(8);
  });

  test('canonicalization ignores key order', () => {
    reminder.nextTurn();
    reminder.check('tool', { b: 2, a: 1 });
    reminder.nextTurn();
    const msg = reminder.check('tool', { a: 1, b: 2 });
    expect(reminder.getCount('tool', { a: 1, b: 2 })).toBe(2);
    expect(msg).toBeNull(); // threshold not hit
  });

  test('reset clears counters', () => {
    reminder.nextTurn();
    reminder.check('x', {});
    reminder.reset();
    expect(reminder.getCount('x', {})).toBe(0);
  });
});
