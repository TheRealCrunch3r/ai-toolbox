import { spillTextIfNeeded } from '../src/utils/toolPayloadSpill.js';

describe('toolPayloadSpill', () => {
  test('small text unchanged', async () => {
    const txt = 'hello';
    const out = await spillTextIfNeeded(txt, 1024);
    expect(out).toBe(txt);
  });

  test('oversized text is spilled with marker', async () => {
    const txt = 'a'.repeat(20000);
    const out = await spillTextIfNeeded(txt, 1024);
    expect(out.startsWith('[ai_toolbox compaction]')).toBe(true);
    expect(out).toContain('compaction://');
  });

  test('idempotency - already spilled stays unchanged', async () => {
    const already = '[ai_toolbox compaction] Tool payload too large...';
    const out = await spillTextIfNeeded(already, 1024);
    expect(out).toBe(already);
  });
});
