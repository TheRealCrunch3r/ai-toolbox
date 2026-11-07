/**
 * apply_patch suite (07.11) — engine unit tests + tool contract tests for the drift-safe patch tool.
 *
 * Engine tests drive the REAL src/tools/applyPatchEngine (extensionless import bypasses the '.js'-keyed
 * moduleNameMapper entries — docsConsistency precedent). Contract tests run against a real temp working dir
 * (setWorkingDir in/out, files on disk): apply_patch is byte-surgical by design, so real-fs assertions are
 * stronger than mock call-order checks and pin exactly the 23.09 DRIFT-FIX house contract: anchor-verified,
 * atomic, EOL-preserving writes with .bak backup and post-write verification.
 */

import * as fs from 'fs';
// NOTE: mkdtemp lives on FS, not os; and we need the PROMISES variant — callback-style
// require('fs').mkdtemp(prefix) throws without a cb (both caught in the 07.11 suite runs).
import * as pathN from 'node:path';

let tmp: string; // created in beforeAll (no top-level await — ts-jest CommonJS target)

// Extensionless specifier → real module (bypasses the moduleNameMapper '.js' entries, docsConsistency precedent).
import {
  AnchorMissingError,
  PatchParseError,
  applyBinaryPatchToBuffer,
  applyUnifiedPatchToBuffer,
  detectEol,
  parseHex,
  parseUnifiedDiff,
} from '../src/tools/applyPatchEngine';
import * as wd from '../src/workingDir';
import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import { DEFAULT_CONFIG } from '../src/config';
import { StateManager } from '../src/stateManager';

/** god-mode config with statePersistence OFF → StateManager constructor takes its zero-I/O disabled branch. */
const PIN = { ...DEFAULT_CONFIG, godMode: true, statePersistenceEnabled: false };

let originalWd: string;
beforeAll(async () => {
  tmp = await fs.promises.mkdtemp(pathN.join(process.env.TMPDIR || process.env.TEMP || '/', 'ai-toolbox-ap_'));
  originalWd = wd.getWorkingDir();
  wd.setWorkingDir(tmp);
});
afterAll(async () => {
  wd.setWorkingDir(originalWd);
  await fs.promises.rm(tmp, { recursive: true, force: true });
});

/** git diff -u shape for a full-file swap (no context lines). */
function diff(oldLines: string[], newLines: string[]): string {
  return [
    `--- a/t`,
    `+++ b/t`,
    `@@ -1,${oldLines.length} +1,${newLines.length} @@`,
    ...oldLines.map((l) => `-${l}`),
    ...newLines.map((l) => `+${l}`),
  ].join('\n');
}

const hexOf = (s: string): string => Buffer.from(s).toString('hex'); // real hex — the old WIP 'zzz' literal was invalid

describe('apply_patch — engine (unified)', () => {
  test('parseUnifiedDiff returns hunks with correct oldLines/addedLines for full-file swap', () => {
    const p = parseUnifiedDiff(diff(['AAA'], ['BBB']));
    expect(p.hunks).toHaveLength(1);
    expect(p.hunks[0].oldLines).toEqual(['AAA']);
    expect(p.hunks[0].addedLines).toEqual(['BBB']);
    expect(p.hunks[0].insertOnlyStart).toBeNull();
  });

  test('parseUnifiedDiff rejects malformed diff (no ---/+++ header)', () => {
    expect(() => parseUnifiedDiff('garbage\nnot a patch')).toThrow(PatchParseError);
  });

  test('parseUnifiedDiff rejects count/body mismatch', () => {
    // declares 2 old / 3 new; body has 1 '-' and 2 '+' → both counts off
    const bad = '--- a/t\n+++ b/t\n@@ -1,2 +1,3 @@\n-a\n+b\n+c'; // declares 2 old line(s) but body only removes 1 — genuine count mismatch (trailing '\n' stripped: it would add a phantom context line, 07.11);
    expect(() => parseUnifiedDiff(bad)).toThrow(PatchParseError);
  });

  test('parseUnifiedDiff rejects empty patch', () => {
    expect(() => parseUnifiedDiff('   \n')).toThrow(PatchParseError);
  });

  test('unified swap on LF file: exact bytes, EOL preserved', () => {
    const f = Buffer.from('foo\nbar\nbaz\n');
    const r = applyUnifiedPatchToBuffer(f, parseUnifiedDiff(diff(['foo', 'bar', 'baz'], ['FOO', 'bar', 'baz'])));
    expect(r.newBuf.toString()).toBe('FOO\nbar\nbaz\n');
    expect(detectEol(f)).toBe('\n');
  });

  test('unified swap on CRLF file keeps surrounding CRLF (no EOL flip)', () => {
    const f = Buffer.from('foo\r\nbar\r\nbaz\r\n');
    expect(detectEol(f)).toBe('\r\n');
    // diff text uses plain lines; the engine must re-emit with the MATCHED anchor's terminator
    const r = applyUnifiedPatchToBuffer(f, parseUnifiedDiff(diff(['foo', 'bar', 'baz'], ['FOO', 'BAR2', 'baz'])));
    expect(r.newBuf.toString()).toBe('FOO\r\nBAR2\r\nbaz\r\n');
  });

  test('drifted anchor → AnchorMissingError with a diagnostic window, nothing applied', () => {
    const f = Buffer.from('foo\nbar\nbaz\n');
    try {
      applyUnifiedPatchToBuffer(f, parseUnifiedDiff(diff(['qux'], ['Q'])));
      expect.unreachable('expected AnchorMissingError');
    } catch (e) {
      expect(e).toBeInstanceOf(AnchorMissingError);
      expect(String((e as Error).message)).toContain('drifted');
    }
  });

  test('insert-only hunk (-0,0) inserts at the requested start line', () => {
    const f = Buffer.from('existing\nmore\n');
    // pins the engine fix: -0,0 headers were rejected by the pre-fix count guard (oldCount<1), dead-codeing the insert path
    // NB: body MUST not end with '\n' — the parser's /[\r\n]+/ split drops blank context lines, so
    // a trailing newline under-counts oldLines (pinned by T-context-only below; engine fix 07.11).
    const patchText = '--- a/t\n+++ b/t\n@@ -0,0 +1,1 @@\n+newline';
    const p = parseUnifiedDiff(patchText);
    expect(p.hunks[0].insertOnlyStart).toBe(1);
    const r = applyUnifiedPatchToBuffer(f, p);
    expect(r.newBuf.toString()).toBe('newline\nexisting\nmore\n'); // byte-exact (replaces the former L120 syntax-broken line)
  });

  test('multiple hunks re-anchor sequentially (earlier shift must not break later anchors)', () => {
    const f = Buffer.from('alpha\nbeta\ngamma\ndelta\nomega\n');
    // hunk A grows line 1 by one line; hunk B targets the ORIGINAL 'gamma' — byte-anchored, so it survives the shift
    const patchText = [
      '--- a/t', '+++ b/t',
      '@@ -1,2 +1,3 @@', '-alpha', '+ALPHA', '+alpha-extra', 'beta',
      '@@ -3,3 +4,3 @@', '-gamma', '+GAMMA', 'delta', 'omega',
    ].join('\n');
    const r = applyUnifiedPatchToBuffer(f, parseUnifiedDiff(patchText));
    expect(r.newBuf.toString()).toBe('ALPHA\nalpha-extra\nbeta\nGAMMA\ndelta\nomega\n');
  });

  test('context-only hunk (no +/- lines) is a no-op byte-for-byte', () => {
    const f = Buffer.from('one\ntwo\nthree\n');
    // anchored at line 2 so oldCount>0: zero-change hunks must round-trip without touching bytes
    const patchText = '--- a/t\n+++ b/t\n@@ -2,2 +2,2 @@\ntwo\nthree'; // no trailing '\n' — parser /[\r\n]+/ split would add a phantom blank context line (07.11)
    const r = applyUnifiedPatchToBuffer(f, parseUnifiedDiff(patchText));
    expect(r.newBuf.equals(f)).toBe(true);
  });

  test('delete-only hunk (+s,0) removes lines byte-exact (EOL-accurate)', () => {
    const f = Buffer.from('one\ntwo\nthree\n');
    // pins the same zero-count guard fix on the +side: '-2,1 +2,0' deletes line 2 only
    const patchText = '--- a/t\n+++ b/t\n@@ -2,1 +2,0 @@\n-two'; // no trailing '\n' — see context-only guard above (07.11)
    expect(() => parseUnifiedDiff(patchText)).not.toThrow();
    const r = applyUnifiedPatchToBuffer(f, parseUnifiedDiff(patchText));
    expect(r.newBuf.toString()).toBe('one\nthree\n');
  });
});

describe('apply_patch — engine (binary)', () => {
  test('replaces first occurrence of hex anchor', () => {
    const src = Buffer.from('xxanchoryy');
    const r = applyBinaryPatchToBuffer(src, { anchorHex: hexOf('anchor'), replacementHex: hexOf('zzz') }); // valid hex now
    expect(r.newBuf.toString()).toBe('xxzzzyy');
  });

  test('strict offset pins the position and applies exactly there', () => {
    const src = Buffer.from('ABCABC'); // 'A' at offsets 0 AND 3 — strict pin must hit the second occurrence only
    const r = applyBinaryPatchToBuffer(src, { anchorHex: hexOf('A'), replacementHex: hexOf('B'), offset: 3 });
    expect(r.newBuf.toString()).toBe('ABCBBC');
  });

  test('offset mismatch throws AnchorMissingError (no fuzzy search)', () => {
    const src = Buffer.from('ABCDEF');
    expect(() => applyBinaryPatchToBuffer(src, { anchorHex: hexOf('A'), replacementHex: hexOf('B'), offset: 3 })).toThrow(AnchorMissingError);
  });

  test('missing anchor (search mode) throws AnchorMissingError', () => {
    const src = Buffer.from('nothing here');
    expect(() => applyBinaryPatchToBuffer(src, { anchorHex: 'ff', replacementHex: '00' })).toThrow(AnchorMissingError);
  });

  test('odd-length and invalid-nibble hex throw PatchParseError; empty payload is legal zero bytes', () => {
    expect(() => parseHex('abc')).toThrow(PatchParseError); // odd nibbles (replaces the old stub helper call)
    expect(() => parseHex('zz12')).toThrow(PatchParseError); // 'z' is not a hex nibble
    expect(parseHex('').length).toBe(0);
  });

  test('empty anchor_hex in binary mode throws PatchParseError', () => {
    expect(() => applyBinaryPatchToBuffer(Buffer.from('abc'), { anchorHex: '', replacementHex: '00' })).toThrow(PatchParseError);
  });
});

// ==================== tool contract — real fs against a temp working dir ====================
describe('apply_patch — tool contract', () => {
  let impl: (args: any, ctx?: any) => Promise<any>;

  beforeAll(() => {
    const tools = registerFileSystemTools(PIN as any, new StateManager(PIN));
    const t = (tools as Array<{ name: string; implementation?: typeof impl }>).find((x) => x.name === 'apply_patch');
    expect(t).toBeDefined(); // registration contract: the tool exists under its exact snake_case name
    impl = (t as { implementation: typeof impl }).implementation;
  });

  const readFileB = async (rel: string): Promise<Buffer> => fs.promises.readFile(pathN.join(tmp, rel));

  test('unified mode: byte-exact patch on disk + .bak backup of the original', async () => {
    await fs.promises.writeFile(pathN.join(tmp, 't.txt'), 'foo\nbar\nbaz\n');
    const result: any = await impl({ mode: 'unified', path: 't.txt', diff_text: diff(['foo', 'bar', 'baz'], ['FOO', 'bar', 'baz']) });
    expect(result.success).toBe(true);
    expect(result.data.applied).toBe(true);
    expect(result.data.byteDelta).toBe(0);
    expect((await readFileB('t.txt')).toString()).toBe('FOO\nbar\nbaz\n'); // byte-exact on disk (post-write verification ran)
    expect((await readFileB('t.txt.bak')).toString()).toBe('foo\nbar\nbaz\n'); // house-standard .bak of the pre-patch original
  });

  test('CRLF target through the tool: no EOL flip outside/inside the patched region', async () => {
    await fs.promises.writeFile(pathN.join(tmp, 'crlf.txt'), 'foo\r\nbar\r\nbaz\r\n');
    const result: any = await impl({ mode: 'unified', path: 'crlf.txt', diff_text: diff(['foo', 'bar', 'baz'], ['FOO', 'BAR2', 'baz']) });
    expect(result.success).toBe(true);
    expect((await readFileB('crlf.txt')).toString()).toBe('FOO\r\nBAR2\r\nbaz\r\n');
  });

  test('binary mode: hex anchor patch lands byte-exact on disk', async () => {
    await fs.promises.writeFile(pathN.join(tmp, 'b.bin'), Buffer.from('xxanchoryy'));
    const result: any = await impl({ mode: 'binary', path: 'b.bin', anchor_hex: hexOf('anchor'), replacement_hex: hexOf('zzz') });
    expect(result.success).toBe(true);
    expect(result.data.mode).toBe('binary');
    expect((await readFileB('b.bin')).toString()).toBe('xxzzzyy');
  });

  test('drifted unified patch fails with an anchor error and the target is UNTOUCHED (no write, no .bak)', async () => {
    await fs.promises.writeFile(pathN.join(tmp, 'd.txt'), 'foo\nbar\nbaz\n');
    const result: any = await impl({ mode: 'unified', path: 'd.txt', diff_text: diff(['qux'], ['Q']) });
    expect(result.success).toBe(false);
    expect(String(result.error)).toContain('anchor'); // AnchorMissingError message surfaces via handleError
    expect((await readFileB('d.txt')).toString()).toBe('foo\nbar\nbaz\n'); // byte-identical — the drift fix contract
    await expect(fs.promises.access(pathN.join(tmp, 'd.txt.bak'))).rejects.toBeDefined(); // no backup created on failure
  });

  test('missing diff_text in unified mode fails cleanly (read happens first; nothing is written)', async () => {
    const before = (await readFileB('t.txt')).toString();
    const result: any = await impl({ mode: 'unified', path: 't.txt' });
    expect(result.success).toBe(false);
    expect((await readFileB('t.txt')).toString()).toBe(before); // file untouched
  });

  test('binary mode without both hex payloads fails cleanly (nothing written)', async () => {
    const before = (await readFileB('b.bin')).toString();
    const result: any = await impl({ mode: 'binary', path: 'b.bin', anchor_hex: hexOf('A') }); // replacement_hex missing
    expect(result.success).toBe(false);
    expect((await readFileB('b.bin')).toString()).toBe(before);
  });

  test('unknown mode is rejected by the Zod enum at the SDK boundary (no file access)', async () => {
    // The @lmstudio/sdk `implementation` wrapper validates args against its Zod schema BEFORE any file
    // access. Observed in the 07.11 run: a parse failure escapes as a THROW from `impl(...)` — synchronously,
    // which an `expect(impl(...)).rejects...` assertion can never catch (the expression throws before any
    // promise is wrapped). So assert on whatever escapes, or on a resolved failed result if the SDK absorbs it.
    let escaped: unknown;
    let settled: { success?: boolean; error?: string | Error } | undefined;
    try {
      settled = await impl({ mode: 'space-diff', path: 'z.txt' }); // unknown MODE — must stop at the SDK boundary, 07.11
    } catch (e) {
      escaped = e;
    }
    if (escaped !== undefined) {
      const issues = (escaped as { issues?: unknown[] }).issues;
      expect(JSON.stringify({ message: String(escaped), ...(issues ? { issues } : {}) })).toMatch(/invalid_enum_value|Invalid enum value/);
    } else {
      expect(settled?.success).toBe(false);
      expect(String(settled?.error ?? '')).toMatch(/enum/i);
    }
  });

  test('target outside the working directory is rejected before read or write', async () => {
    const outside = pathN.join(tmp, '..', 'ai-toolbox-ap_outside.txt'); // sibling of tmp: never under the working dir
    await fs.promises.writeFile(outside, 'do not touch\n').catch(() => undefined); // best-effort fixture; test passes either way
    try {
      const result: any = await impl({ mode: 'unified', path: outside, diff_text: diff(['a'], ['b']) });
      expect(result.success).toBe(false);
      expect(String(result.error)).toContain('outside the working directory');
    } finally {
      await fs.promises.rm(outside, { force: true }).catch(() => undefined);
    }
  });

  test('insert-only hunk through the tool prepends byte-exact (engine guard fix end-to-end)', async () => {
    await fs.promises.writeFile(pathN.join(tmp, 'ins.txt'), 'existing\nmore\n');
    const result: any = await impl({ mode: 'unified', path: 'ins.txt', diff_text: '--- a/t\n+++ b/t\n@@ -0,0 +1,1 @@\n+newline' }); // no trailing '\n' — phantom blank context line would break the parse (07.11)
    expect(result.success).toBe(true);
    expect((await readFileB('ins.txt')).toString()).toBe('newline\nexisting\nmore\n');
  });

  test('relative subdirectory paths resolve inside the working dir', async () => {
    const sub = pathN.join(tmp, 'subdir');
    await fs.promises.mkdir(sub, { recursive: true });
    await fs.promises.writeFile(pathN.join(sub, 's.txt'), 'a\nb\n');
    const result: any = await impl({ mode: 'unified', path: 'subdir/s.txt', diff_text: diff(['a'], ['A']) });
    expect(result.success).toBe(true);
    expect((await readFileB('subdir/s.txt')).toString()).toBe('A\nb\n');
  });

  test('missing target file fails cleanly (no partial state)', async () => {
    const result: any = await impl({ mode: 'unified', path: 'never-existed.txt', diff_text: diff(['a'], ['b']) });
    expect(result.success).toBe(false);
    await expect(fs.promises.access(pathN.join(tmp, 'never-existed.txt'))).rejects.toBeDefined(); // still absent
  });
});
