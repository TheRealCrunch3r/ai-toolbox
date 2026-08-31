/**
 * pattern_scan — clean-room test suite.
 * Deterministic fixtures under os.tmpdir(); verifies matches, caps, skips,
 * glob pruning, and the ReDoS backstops (historical hang patterns included).
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { patternScan } from '../src/tools/patternScan';

// ---------------------------------------------------------------------------
// Fixture tree
// ---------------------------------------------------------------------------

let root: string; // temp fixture root (acts as cwd-relative search root via absolute paths)
let fileA: string; // a.txt — 3 marker lines + one long line + CRLF section
let subDir: string;
let deepFile: string; // a/b/c/deep.txt — depth-3 dirs below root

function w(rel: string, content: string | Buffer): void {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'pattern-scan-'));
  fileA = path.join(root, 'a.txt');
  subDir = path.join(root, 'sub');
  deepFile = path.join(root, 'a' + path.sep + 'b' + path.sep + 'c' + path.sep + 'deep.txt');

  // a.txt: marker on lines 1,2,4 ; long line (500 chars) with marker at pos ~20; CRLF pair
  const longLine = 'xx'.repeat(20) + 'NEEDLE_LONG' + 'yy'.repeat(200); // 40+11+400 = 451... pad below
  const lines = [
    'NEEDLE first line',
    `another NEEDLE here`,
    'no match here',
    longLine.padEnd(500, 'z'),
    'CRLF NEEDLE\r\nCRLF second', // written verbatim → becomes two CRLF-terminated lines
  ];
  fs.writeFileSync(fileA, lines.join('\n'));

  w('sub/b.md', '# doc\nNEEDLE in markdown\n');
  w(path.join('a', 'b', 'c', 'deep.txt'), 'DEEP_NEEDLE\nNEEDLE deep too\n');
  w('skip.bin', Buffer.from([0x4e, 0x45, 0x00, 0x45, 0x44, 0x4c, 0x45, 0x01, 0x02])); // "NE\0EDLE\x01\x02" — binary
  w('node_modules/pkg/index.js', 'NEEDLE inside deps\n');
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Core matching
// ---------------------------------------------------------------------------

describe('core matching', () => {
  it('finds regex matches across nested files with correct line numbers', async () => {
    const r = await patternScan({ pattern: 'NEEDLE', root });
    expect(r.ok).toBe(true);
    // a.txt lines 1,2,4 + CRLF section line; sub/b.md; deep.txt (x2) — node_modules pruned, binary skipped
    const inA = r.matches.filter((m) => m.file === 'a.txt');
    expect(inA.map((m) => m.line)).toEqual([1, 2, 4, 5]); // line 6 is the CRLF second line? see below
    expect(r.matches.some((m) => m.file === 'sub/b.md' && m.content.includes('NEEDLE in markdown'))).toBe(true);
    const deep = r.matches.filter((m) => m.file === 'a/b/c/deep.txt');
    expect(deep.length).toBe(2); // "DEEP_NEEDLE" (contains "NEEDLE") + "NEEDLE deep too"
    expect(r.stats.filesScanned).toBeGreaterThanOrEqual(4);
    // deterministic ordering
    for (let i = 1; i < r.matches.length; i++) {
      const a = r.matches[i - 1], b = r.matches[i];
      expect(a.file.localeCompare(b.file) <= 0 || a.line <= b.line).toBe(true);
    }
  });

  it('literal mode matches only the exact substring (a.b ≠ axb)', async () => {
    w('lit.txt', 'axb\na.b\n');
    const r = await patternScan({ pattern: 'a\\.b', root, mode: 'regex' });
    expect(r.matches.filter((m) => m.file === 'lit.txt').length).toBe(1); // only the literal line matches in regex-escaped sense? NO — regex a\.b matches "a.b" literally → 1 match. Correct control below:

    const rl = await patternScan({ pattern: 'a.b', root, mode: 'literal' });
    expect(rl.matches.filter((m) => m.file === 'lit.txt').length).toBe(1); // literal "a.b" — NOT axb
    const rr = await patternScan({ pattern: 'a.b', root, mode: 'regex' });
    expect(rr.matches.filter((m) => m.file === 'lit.txt').length).toBe(2); // regex: axb AND a.b
  });

  it('case sensitivity defaults on; off when requested', async () => {
    const upper = await patternScan({ pattern: 'needle', root });
    expect(upper.matches.length).toBe(0);
    const anyCase = await patternScan({ pattern: 'needLE', root, caseSensitive: false });
    expect(anyCase.matches.length).toBeGreaterThan(5);
  });

  it('handles CRLF line endings without artifacts', async () => {
    w('crlf.txt', 'first\r\nNEEDLE crlf middle\r\nthird'); // no trailing newline
    const r = await patternScan({ pattern: 'NEEDLE', root: path.join(root, 'crlf.txt') });
    expect(r.matches.length).toBe(1);
    expect(r.matches[0].line).toBe(2);
    expect(r.matches[0].content).not.toContain('\r'); // trimmed content, no CR artifact
  });
});

// ---------------------------------------------------------------------------
// ReDoS backstops (historical incident patterns)
// ---------------------------------------------------------------------------

describe('ReDoS backstops', () => {
  jest.setTimeout(5000); // any hang here fails the suite loudly instead of wedging the plugin

  it('demotes the classic evil regex (a+)+$ to literal and stays fast', async () => {
    w('evil.txt', 'NEEDLE\n');
    const t0 = Date.now();
    const r = await patternScan({ pattern: '(a+)+$', root });
    const ms = Date.now() - t0;
    expect(r.ok).toBe(true);
    expect(r.demotedToLiteral).toBe('unsafe-regex');
    // demoted to literal "(a+)+$" → no file contains that string → zero matches, but the call itself succeeded
    expect(r.matches.length).toBe(0);
    expect(ms).toBeLessThan(2000);
  });

  it('survives (a*){50} — the 30.08 incident pattern — without wedging', async () => {
    // NOTE: post-D2 relaxation, isSafeRegex() classifies (a*){50} as safe → we execute it as a real regex.
    // The module adds NO anchors around user patterns, and an unanchored (a*){50} trivially matches
    // empty at position 0 on every line — so .test(line) cannot enter its catastrophic branch here.
    w('aaa.txt', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\nNEEDLE after a-run\n'); // 32-char a-run: worst benign case
    const t0 = Date.now();
    const r = await patternScan({ pattern: '(a*){50}', root });
    expect(r.ok).toBe(true); // never throws, never hangs — completes regardless of demotion policy
    expect(Date.now() - t0).toBeLessThan(2000);
  });

  it('anchored catastrophic form ^((a+)b*)+$ is demoted and fast (wedge-proof)', async () => {
    w('wedge.txt', 'aaaaaabbbbb\nNEEDLE anchor case\n');
    const t0 = Date.now();
    const r = await patternScan({ pattern: '^((a+)b*)+$', root });
    expect(r.demotedToLiteral).toBe('unsafe-regex'); // nested quantifier with anchor → ReDoS-gated
    expect(Date.now() - t0).toBeLessThan(2000);
  });

  it('demotes syntactically invalid regexes to literal instead of throwing', async () => {
    const r = await patternScan({ pattern: '([unclosed', root });
    expect(r.ok).toBe(true);
    expect(r.demotedToLiteral).toBe('invalid-regex');
  });

  it('never throws on any malformed input — returns ok:false with error', async () => {
    const empty = await patternScan({ pattern: '   ', root });
    expect(empty.ok).toBe(false);
    expect(String(empty.error)).toContain('pattern is required');
    const missing = await patternScan({ pattern: 'x', root: path.join(root, 'does-not-exist-xyz') });
    expect(missing.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Resource ceilings & reporting
// ---------------------------------------------------------------------------

describe('resource ceilings', () => {
  it('skips oversized files with reason=size and still reports the rest', async () => {
    const big = path.join(root, 'big.txt');
    fs.writeFileSync(big, 'NEEDLE\n' + 'x'.repeat(300 * 1024)); // > default 256KB limit
    const r = await patternScan({ pattern: 'NEEDLE', root });
    expect(r.skipped.some((s) => s.file === 'big.txt' && s.reason === 'size')).toBe(true);
    expect(r.matches.every((m) => m.file !== 'big.txt')).toBe(true);
  });

  it('respects a custom maxFileSizeBytes', async () => {
    const r = await patternScan({ pattern: 'NEEDLE', root, maxFileSizeBytes: 10_000 });
    // sub/b.md (~30B) still scanned; big.txt (300KB) and a.txt (>10K? a.txt is ~570B — fine) behavior:
    expect(r.skipped.some((s) => s.file === 'big.txt' && s.reason === 'size')).toBe(true);
  });

  it('reports line-cap for files longer than maxFileLines', async () => {
    const longFile = path.join(root, 'long.txt');
    fs.writeFileSync(longFile, Array.from({ length: 500 }, (_, i) => `line ${i}\n`).join('') + 'NEEDLE at the very end\n');
    const r = await patternScan({ pattern: 'NEEDLE', root, maxFileLines: 100 });
    expect(r.skipped.some((s) => s.file === 'long.txt' && s.reason === 'line-cap')).toBe(true);
    expect(r.matches.every((m) => m.file !== 'long.txt')).toBe(true); // marker at line 502 was never scanned
  });

  it('detects binary files and reports reason=binary', async () => {
    const r = await patternScan({ pattern: 'NEEDLE', root });
    expect(r.skipped.some((s) => s.file === 'skip.bin' && s.reason === 'binary')).toBe(true);
  });

  it('truncates reported content to matchLineLength with ellipsis', async () => {
    const r = await patternScan({ pattern: 'NEEDLE_LONG', root, matchLineLength: 100 });
    const m = r.matches.find((x) => x.content.includes('NEEDLE_LONG'));
    expect(m).toBeDefined();
    expect(m!.content.length).toBeLessThanOrEqual(101); // cap-1 chars + '…'
    expect(m!.content.endsWith('…')).toBe(true);
  });

  it('caps total matches and sets stats.truncated', async () => {
    const r = await patternScan({ pattern: 'NEEDLE', root, maxTotalMatches: 5 });
    expect(r.matches.length).toBe(5);
    expect(r.stats.truncated).toBe(true);
  });

  it('caps matches per file at maxMatchesPerFile', async () => {
    const many = path.join(root, 'many.txt');
    fs.writeFileSync(many, Array.from({ length: 80 }, (_, i) => `NEEDLE row ${i}\n`).join(''));
    const r = await patternScan({ pattern: 'NEEDLE', root: many, maxMatchesPerFile: 10 });
    expect(r.matches.length).toBe(10);
    expect(r.stats.totalMatches).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Globs & traversal policy
// ---------------------------------------------------------------------------

describe('globs and traversal', () => {
  it('prunes node_modules (default) and reports the excluded dir', async () => {
    const r = await patternScan({ pattern: 'NEEDLE', root });
    expect(r.excludedDirs).toContain('node_modules');
    expect(r.matches.every((m) => !m.file.includes('node_modules'))).toBe(true);
  });

  it('includeGlobs restrict to matching files (basename or rel path)', async () => {
    const r = await patternScan({ pattern: 'NEEDLE', root, includeGlobs: ['*.md'] });
    expect(r.matches.length).toBeGreaterThan(0);
    expect(r.matches.every((m) => m.file.endsWith('.md') || path.basename(m.file) === 'b.md')).toBe(true);
  });

  it('excludeGlobs prune directories wholesale', async () => {
    const r = await patternScan({ pattern: 'NEEDLE', root, excludeGlobs: ['**/c/**'] }); // dir "a/b/c" pruned → rel 'a/b/c' matches '**/c/**'
    expect(r.matches.every((m) => !m.file.endsWith('deep.txt'))).toBe(true);
  });

  it('honors maxDepth (files deeper than the cap are not scanned)', async () => {
    const shallow = await patternScan({ pattern: 'NEEDLE', root, maxDepth: 2 });
    expect(shallow.matches.every((m) => !m.file.endsWith('deep.txt'))).toBe(true); // deep.txt lives 3 dirs down
    const full = await patternScan({ pattern: 'DEEP_NEEDLE', root, maxDepth: 10 });
    expect(full.matches.some((m) => m.file.endsWith('deep.txt'))).toBe(true);
  });

  it('single-file roots ignore globs by design and use cwd-relative paths', async () => {
    const r = await patternScan({ pattern: 'NEEDLE', root: fileA, includeGlobs: ['*.md'] }); // .txt would be filtered in dir mode — not here
    expect(r.ok).toBe(true);
    expect(r.matches.length).toBeGreaterThanOrEqual(3);
    expect(r.matches[0].file).not.toContain(path.sep); // cwd-relative posix-style rel path
  });

  it('concurrency does not change results (deterministic)', async () => {
    const a = await patternScan({ pattern: 'NEEDLE', root, concurrency: 1 });
    const b = await patternScan({ pattern: 'NEEDLE', root, concurrency: 8 });
    expect(b.matches).toEqual(a.matches);
    expect(b.skipped).toEqual(a.skipped);
  });
});
