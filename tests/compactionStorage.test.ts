/**
 * C compaction family (24.09) — STEP 5 tests, part 2 of 3: on-disk verbatim store
 *
 * Covers src/utils/toolPayloadStorage.ts with REAL fs I/O in os.tmpdir (house convention — see
 * contextSearch.test.ts / patternScan.test.ts; jestRepoStoreGuard only blocks writes into the repo's
 * own live <rootDir>/.session_context, so a mkdtemp root is safe). Pins:
 * - sha256Hex canonical digests; compactionDirFor layout without creating anything;
 * - collectPrunedPayloadRefs digest pairing via getPrunablePayloadTexts (the policy's own decision
 *   function — scan/rewrite cannot drift), single payload vs multi-block '\n' join;
 * - storePrunedPayload: exclusive create under <digest>.payload, idempotent byte-exact re-store
 *   (created:false) and FAIL-LOUD on a digest/content mismatch (never silently overwrite);
 * - retrievePrunedPayload: null for malformed locators AND absent files (callers must say "unavailable"
 *   honestly), verbatim round-trip of stored content.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  COMPACTED_STORE_REL,
  DEFAULT_MAX_BYTES_PER_RESULT,
} from '../src/utils/toolPayloadCompaction';
import {
  COMPACTION_DIR_REL,
  compactionDirFor,
  collectPrunedPayloadRefs,
  ensureCompactionStore,
  retrievePrunedPayload,
  sha256Hex,
  storePrunedPayload,
} from '../src/utils/toolPayloadStorage';

describe('C compaction (24.09) — on-disk verbatim store', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-compstore-')); // real fs, isolated per test
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('sha256Hex produces canonical lowercase hex digests and compactionDirFor does not create anything', () => {
    // Known-vector pin (NIST test vector): SHA-256("abc") — guards against a silent digest change.
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('')).toMatch(/^[a-f0-9]{64}$/); // empty input still a well-formed digest

    const dir = compactionDirFor(tmp);
    expect(dir).toBe(path.join(tmp, '.ai_toolbox', 'compaction')); // absolute store layout
    expect(COMPACTION_DIR_REL).toBe(path.join('.ai_toolbox', 'compaction')); // relative layout constant
    expect(COMPACTED_STORE_REL).toBe('.ai_toolbox/compaction'); // slash form shown to users (retrieval hint)
    expect(fs.existsSync(dir)).toBe(false); // compactionDirFor must NOT create the directory
  });

  it('collectPrunedPayloadRefs pairs digests with exactly the payloads the policy will rewrite', () => {
    const big = 'a'.repeat(DEFAULT_MAX_BYTES_PER_RESULT + 10); // 16394 bytes > 16384 → prunable at the DEFAULT budget (strict >)

    const messages: Array<{ role?: string; content?: unknown }> = [
      { role: 'user', content: big }, // sacred role — never paired even though oversized
      { role: 'tool', content: big },
      { role: 'tool', content: [{ text: 'x'.repeat(DEFAULT_MAX_BYTES_PER_RESULT + 1) }] }, // blocks shape, one prunable block
    ];

    const refs = collectPrunedPayloadRefs(messages);
    expect(refs.length).toBe(2); // exactly the prunable messages, in array order
    expect(refs[0].digestHex).toBe(sha256Hex(big)); // digest names the exact stored bytes
    expect(refs[0].text).toBe(big);
    expect(refs[1].text).toBe('x'.repeat(DEFAULT_MAX_BYTES_PER_RESULT + 1)); // blocks → canonical text
    expect(refs[1].digestHex).toBe(sha256Hex('x'.repeat(DEFAULT_MAX_BYTES_PER_RESULT + 1)));

    // Multi-block join: two prunable blocks in ONE message store as '\n'-joined canonical text.
    const multi = 'm'.repeat(DEFAULT_MAX_BYTES_PER_RESULT + 1);
    const twoBlocks = collectPrunedPayloadRefs([{ role: 'tool', content: [{ text: multi }, { text: multi }] }]);
    expect(twoBlocks.length).toBe(1); // one storage object per message
    expect(twoBlocks[0].text).toBe([multi, multi].join('\n'));
    expect(twoBlocks[0].digestHex).toBe(sha256Hex([multi, multi].join('\n')));

    // Under-budget content yields no refs at all:
    expect(collectPrunedPayloadRefs([{ role: 'tool', content: 'small' }])).toEqual([]);
  });

  it('storePrunedPayload writes verbatim under the digest name and is idempotent for byte-exact re-stores', async () => {
    const text = 'stored-verbatim-' + 'Z'.repeat(20_000);
    const ref = { digestHex: sha256Hex(text), text };

    const first = await storePrunedPayload(tmp, ref);
    expect(first.created).toBe(true);
    expect(first.path).toBe(path.join(tmp, '.ai_toolbox', 'compaction', `${ref.digestHex}.payload`));
    expect(first.bytes).toBe(Buffer.byteLength(text, 'utf8')); // reported size = exact UTF-8 byte length
    expect(await fs.promises.readFile(first.path, 'utf8')).toBe(text); // verbatim on disk

    const dir = await ensureCompactionStore(tmp); // must be a no-op when the store already exists
    expect(dir).toBe(path.join(tmp, '.ai_toolbox', 'compaction'));
    expect(fs.existsSync(dir)).toBe(true);

    // Idempotency: identical content under the same digest → created:false, existing bytes reported.
    const second = await storePrunedPayload(tmp, ref);
    expect(second.created).toBe(false);
    expect(second.bytes).toBe(Buffer.byteLength(text, 'utf8'));
    expect(await fs.promises.readFile(first.path, 'utf8')).toBe(text); // untouched by the re-store
  });

  it('storePrunedPayload FAILS LOUD when an existing digest file holds DIFFERENT content (never overwrites)', async () => {
    const textA = 'content-A-' + 'A'.repeat(10_000);
    await storePrunedPayload(tmp, { digestHex: sha256Hex(textA), text: textA });

    // Different content reusing the SAME digest name = corruption or collision → refuse with a loud error.
    const conflicting = { digestHex: sha256Hex(textA), text: 'content-B' };
    let threw: unknown = null;
    try {
      await storePrunedPayload(tmp, conflicting);
    } catch (err) {
      threw = err;
    }
    expect(threw).toBeInstanceOf(Error);
    const msg = String((threw as Error).message);
    expect(msg).toContain('FAIL-LOUD');
    expect(msg).toContain(`${conflicting.digestHex}.payload`); // names the exact file for manual inspection

    // The original payload must survive intact — a conflicting store never clobbers it:
    const storedPath = path.join(tmp, '.ai_toolbox', 'compaction', `${sha256Hex(textA)}.payload`);
    expect(await fs.promises.readFile(storedPath, 'utf8')).toBe(textA);
  });

  it('retrievePrunedPayload round-trips stored payloads and returns null for malformed locators or absent files', async () => {
    const payload = 'round-trip-' + 'R'.repeat(4096) + '\nlast line'; // trailing newline must survive verbatim
    const ref = { digestHex: sha256Hex(payload), text: payload };
    await storePrunedPayload(tmp, ref);

    expect(await retrievePrunedPayload(tmp, `compaction://${ref.digestHex}`)).toBe(payload);

    // Absent file (content may have been cleaned out) → null — callers say "unavailable", never invent.
    expect(await retrievePrunedPayload(tmp, `compaction://${'0'.repeat(64)}`)).toBeNull();
    // Malformed / foreign locators are rejected before any fs access:
    expect(await retrievePrunedPayload(tmp, 'not-a-locator')).toBeNull();
    expect(await retrievePrunedPayload(tmp, ref.digestHex)).toBeNull(); // raw digest without the scheme is NOT a locator
  });
});
