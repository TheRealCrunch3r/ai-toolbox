/**
 * F1 (17.09 G-B fix) — unit tests for the PURE checkpoint-notice helper exported from promptPreprocessor.ts.
 * No SDK mocks needed by design: buildCheckpointSavedNotice() takes plain values and returns string | null.
 * Context: 17.09 log verdict (memory_1789659390790) — the threshold prompt generated at 17:16:31 was consumed in
 * the same preprocess run with zero user-visible acknowledgement; this helper + its PART B wiring close gap G-B.
 */

import { buildCheckpointSavedNotice } from '../src/promptPreprocessor';

describe('buildCheckpointSavedNotice (F1 G-B fix, 17.09)', () => {
  it('returns a one-shot notice when the checkpoint saved while a warning was live', () => {
    const out = buildCheckpointSavedNotice({
      snapshotSaved: true,
      warningWasLive: true,
      usagePercent: 183.912,
      sessionId: 'sess_abc123',
    });
    expect(typeof out).toBe('string');
    expect(out).toContain('AUTO-CHECKPOINT SAVED BEFORE COMPRESSION');
    expect(out).toContain('~183.9% of context'); // one-decimal rounding
    expect(out).toContain('(checkpoint sess_abc123)');
    expect(out).not.toContain('<SYSTEM_INSTRUCTION>'); // informational notice, not a YES/NO prompt block
  });

  it('returns null when the snapshot did NOT save (warning path behavior unchanged)', () => {
    const out = buildCheckpointSavedNotice({ snapshotSaved: false, warningWasLive: true, usagePercent: 90 });
    expect(out).toBeNull();
  });

  it('returns null when no warning was live in this run', () => {
    const out = buildCheckpointSavedNotice({ snapshotSaved: true, warningWasLive: false, usagePercent: 90, sessionId: 'x' });
    expect(out).toBeNull();
  });

  it('omits unknown/non-finite percent and missing session id gracefully but still notifies', () => {
    for (const pct of [null, Number.NaN]) {
      const out = buildCheckpointSavedNotice({ snapshotSaved: true, warningWasLive: true, usagePercent: pct });
      expect(out).not.toBeNull();
      expect(out).toContain('AUTO-CHECKPOINT SAVED BEFORE COMPRESSION');
      expect(out).not.toContain('% of context');
    }
    const noId = buildCheckpointSavedNotice({ snapshotSaved: true, warningWasLive: true, usagePercent: 50 });
    expect(noId).not.toBeNull();
    expect(noId).not.toContain('(checkpoint ');
  });
});
