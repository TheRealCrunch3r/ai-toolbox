/**
 * C compaction family (24.09) — STEP 5 tests, part 1 of 3: PURE policy layer
 *
 * Covers src/utils/toolPayloadCompaction.ts in the established F1-helper style — no SDK mocks, no fs:
 * the policy functions take plain values and return plain values (see that module's docblock). Pins:
 * - opaque-locator format (compaction://<sha256hex>) + parse/round-trip/reject semantics;
 * - isOversized byte math (UTF-8 bytes, strict >);
 * - buildPreview head/tail budgets and the elision marker;
 * - buildCompactedContent marker/store-path/locale byte figures/locator composition;
 * - getPrunablePayloadTexts — the SINGLE decision source shared with the storage backend's digest
 *   pairing: role 'tool' only, string/blocks/textObject shapes, idempotency guards (marker prefix /
 *   __compacted);
 * - pruneOversizedToolPayloads in-place rewrite + fail-loud skip on missing/malformed digests
 *   (opaque-id contract: digests are never minted with fake values).
 */

import { createHash } from 'node:crypto';
import {
  COMPACTED_MARKER_PREFIX,
  COMPACTED_STORE_REL,
  DEFAULT_MAX_BYTES_PER_RESULT,
  buildCompactedContent,
  buildLocator,
  buildPreview,
  getPrunablePayloadTexts,
  isLocator,
  isOversized,
  measureMessagesBytes,
  parseLocator,
  pruneOversizedToolPayloads,
} from '../src/utils/toolPayloadCompaction';

/** Same canonical hash the storage backend uses (node:crypto only — no fs involved). */
const sha256 = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');

describe('C compaction (24.09) — pure policy layer', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // keep FAIL-LOUD lines out of test output
  });

  afterEach(() => {
    (console.error as unknown as { mockRestore: () => void }).mockRestore();
  });

  it('locator format round-trips and rejects malformed or foreign ids', () => {
    const hex = sha256('payload-a');
    expect(hex).toMatch(/^[a-f0-9]{64}$/); // digest is the opaque id — lowercase hex, exactly 64 chars

    const loc = buildLocator(hex);
    expect(loc).toBe(`compaction://${hex}`);
    expect(parseLocator(loc)).toBe(hex);
    expect(isLocator(loc)).toBe(true);

    // Anything that is not a well-formed compaction locator must be rejected (never guessed):
    expect(parseLocator(`${loc}x`)).toBeNull(); // extra trailing char — 65 hex chars fails the exact match
    expect(parseLocator('other://' + hex)).toBeNull(); // foreign scheme
    expect(parseLocator(hex.toUpperCase())).toBeNull(); // no scheme prefix AND uppercase hex
    expect(parseLocator(hex.slice(0, 63))).toBeNull(); // 63 chars — too short
    expect(isLocator('not a locator')).toBe(false);
    expect(isLocator(null)).toBe(false); // non-string degrades to rejection, not throw
  });

  it('isOversized compares UTF-8 bytes (not chars) with a strict > boundary', () => {
    expect(DEFAULT_MAX_BYTES_PER_RESULT).toBe(16 * 1024); // 16 KiB default budget pinned

    const atBudget = 'x'.repeat(2048);
    expect(isOversized(atBudget, 2048)).toBe(false); // exactly AT the limit is NOT oversized (strict >)
    expect(isOversized('x'.repeat(2049), 2048)).toBe(true);

    // Multibyte: each 'é' is 2 UTF-8 bytes → 513 chars = 1026 bytes. Char-counting would get this wrong.
    expect(isOversized('é'.repeat(512), 1024)).toBe(false); // exactly 1024 bytes — at the limit
    expect(isOversized('é'.repeat(513), 1025)).toBe(true); // 1026 bytes > 1025

    expect(isOversized(123 as unknown as string, 10)).toBe(false); // non-string → safe false
  });

  it('buildPreview keeps the head and tail slices around an elision marker', () => {
    // 4460 chars: head budget 2048 + middle 1900 + tail 512 (tailStart = max(2048, 4460-512) = 3948).
    const text = 'a'.repeat(2048) + 'M'.repeat(1900) + 'z'.repeat(512);
    const preview = buildPreview(text, 1900);

    expect(preview.startsWith('a'.repeat(2048))).toBe(true); // head slice verbatim
    expect(preview.includes('[1900 bytes omitted — full payload stored]')).toBe(true);
    expect(preview.endsWith('z'.repeat(512))).toBe(true); // tail slice verbatim (trimEnd cannot eat 'z')

    // Tiny payloads: no elision region, marker still present with zero hidden.
    const small = buildPreview('tiny', 0);
    expect(small.startsWith('tiny')).toBe(true);
    expect(small).toContain('[0 bytes omitted — full payload stored]');
  });

  it('buildCompactedContent composes marker + store path + locale byte figures + locator + preview', () => {
    const big = 'b'.repeat(20_000);
    const digest = sha256(big);
    const content = buildCompactedContent(big, digest, DEFAULT_MAX_BYTES_PER_RESULT);

    expect(content.startsWith(COMPACTED_MARKER_PREFIX)).toBe(true); // idempotency guard for later passes
    expect(content).toContain(`${COMPACTED_STORE_REL}/${digest}.payload`); // retrieval hint with the opaque name
    // toLocaleString('en-US') formatting pinned — the figures the model/user actually sees:
    expect(content).toContain('20,000 bytes > 16,384 limit');
    expect(content).toContain(`locator="compaction://${digest}"`);
    expect(content).toContain('[17440 bytes omitted — full payload stored]'); // hidden = 20000 - 2048 - 512

    // The head preview is embedded verbatim after the hint line (no 512-run of 'b' exists inside it):
    expect(content.indexOf('b'.repeat(512))).toBeGreaterThan(COMPACTED_MARKER_PREFIX.length);
    expect(content).toContain('b'.repeat(2048)); // full head slice embedded verbatim
  });

  it('getPrunablePayloadTexts only ever considers role "tool" messages (user/assistant/system are sacred)', () => {
    const big = 'x'.repeat(4096);
    expect(getPrunablePayloadTexts({ role: 'user', content: big }, 1024)).toBeNull();
    expect(getPrunablePayloadTexts({ role: 'assistant', content: big }, 1024)).toBeNull();
    expect(getPrunablePayloadTexts({ role: 'system', content: big }, 1024)).toBeNull();
    // Unrecognized content shapes degrade to a safe no-op even on tool messages:
    expect(getPrunablePayloadTexts({ role: 'tool', content: { json: [1, 2] } }, 1024)).toBeNull();
    expect(getPrunablePayloadTexts({ role: 'tool' }, 1024)).toBeNull(); // missing content

    const tool = getPrunablePayloadTexts({ role: 'tool', content: big }, 1024);
    expect(tool).toEqual([big]); // the positive control
  });

  it('getPrunablePayloadTexts handles all three payload shapes with idempotency guards', () => {
    const big = 'y'.repeat(3072);
    const small = 'ok';

    // string shape — marker prefix is the re-prune guard:
    expect(getPrunablePayloadTexts({ role: 'tool', content: small }, 1024)).toBeNull(); // under budget
    expect(getPrunablePayloadTexts({ role: 'tool', content: big }, 1024)).toEqual([big]);
    expect(getPrunablePayloadTexts({ role: 'tool', content: COMPACTED_MARKER_PREFIX + big }, 1024)).toBeNull();

    // blocks shape — only oversized block texts qualify; others are ignored, not an error:
    const blocks = [
      { text: big },
      { type: 'text' }, // no .text → skipped
      { text: small },
      { text: COMPACTED_MARKER_PREFIX + big }, // already compacted in a previous pass
    ];
    expect(getPrunablePayloadTexts({ role: 'tool', content: blocks }, 1024)).toEqual([big]);
    expect(
      getPrunablePayloadTexts({ role: 'tool', content: [{ text: small }, { text: big.slice(0, 50) }] }, 1024),
    ).toBeNull(); // nothing prunable → null (not an empty array)

    // textObject shape — __compacted flag is the re-prune guard:
    expect(getPrunablePayloadTexts({ role: 'tool', content: { text: big } }, 1024)).toEqual([big]);
    expect(getPrunablePayloadTexts({ role: 'tool', content: { text: big, __compacted: true } }, 1024)).toBeNull();
    expect(getPrunablePayloadTexts({ role: 'tool', content: { data: { nested: big } } }, 1024)).toBeNull(); // no .text key
  });

  it('pruneOversizedToolPayloads rewrites oversized payloads in place with the paired digest locator', () => {
    const payloadA = 'p'.repeat(5000);
    const payloadB = 'q'.repeat(7000);
    const messages: Array<{ role?: string; content?: unknown }> = [
      { role: 'user', content: 'hello' }, // never touched — even if oversized it is sacred
      { role: 'tool', content: payloadA },
      { role: 'assistant', content: 'thinking…' },
      { role: 'tool', content: payloadB },
    ];
    const before = measureMessagesBytes(messages);

    const out = pruneOversizedToolPayloads(messages, {
      maxBytesPerResult: 1024,
      digests: [sha256(payloadA), sha256(payloadB)], // digest[i] pairs with the i-th pruned message
    });

    expect(out.prunedCount).toBe(2);
    expect(out.skippedCount).toBe(0);
    expect(out.locators).toEqual([`compaction://${sha256(payloadA)}`, `compaction://${sha256(payloadB)}`]);
    expect(out.bytesSaved).toBe(before - measureMessagesBytes(messages)); // reported exactly what it saved
    expect(out.bytesSaved).toBeGreaterThan(0);

    expect(messages[0].content).toBe('hello'); // user message verbatim
    expect(typeof messages[1].content).toBe('string');
    expect((messages[1].content as string).startsWith(COMPACTED_MARKER_PREFIX)).toBe(true);
    expect(messages[2].content).toBe('thinking…'); // assistant untouched

    // Idempotency: a second pass over the already-rewritten array prunes nothing.
    const again = pruneOversizedToolPayloads(messages, { maxBytesPerResult: 1024, digests: [] });
    expect(again.prunedCount).toBe(0);
    expect(again.skippedCount).toBe(0); // no digest was consumed because nothing needed one
  });

  it('pruneOversizedToolPayloads FAILS LOUD and skips when a pruned payload has no paired digest (never mints fake ids)', () => {
    const big = 'r'.repeat(4096);
    const messages: Array<{ role?: string; content?: unknown }> = [
      { role: 'tool', content: big }, // prunable #1 → gets digests[0] = malformed 'deadbeef'
      { role: 'tool', content: 's'.repeat(5000) }, // prunable #2 → cursor already exhausted (digests[1] undefined)
    ];

    const out = pruneOversizedToolPayloads(messages, { maxBytesPerResult: 1024, digests: ['deadbeef'] });

    expect(out.prunedCount).toBe(0); // NOTHING rewritten without a valid digest
    expect(out.skippedCount).toBe(2); // the malformed one AND the exhausted cursor (digests array too short)
    expect(messages[0].content).toBe(big); // untouched — identical to not having this feature at all
    expect(messages[1].content).toBe('s'.repeat(5000));
    const errSpy = console.error as unknown as jest.Mock;
    expect(errSpy).toHaveBeenCalledTimes(2); // fail-loud house rule: every skip is logged, never silent
    expect(String(errSpy.mock.calls[0][0])).toContain('FAIL-LOUD');
  });

  it('measureMessagesBytes reports the serialized JSON size of the message array', () => {
    const messages = [
      { role: 'user', content: 'hi' },
      { role: 'tool', content: 'x'.repeat(100) },
    ];
    expect(measureMessagesBytes(messages)).toBe(JSON.stringify(messages).length); // same measurement the prune pass reports
  });
});
