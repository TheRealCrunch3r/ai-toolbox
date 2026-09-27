/**
 * Tests for Q5=A consolidation (23.09) + NEXT-REV alias removal (23.09): EOL-accurate line engine,
 * verify_before_delete semantics and error payload contracts on delete_lines_in_file.
 *
 * Background — root cause under test (23.09 DRIFT-FIX v2, docs/tool-consolidation-draft.md §8a/§9):
 * the old delete path split file content with boolean `hasCRLF ? split('\r\n') : split('\n')`. On
 * mixed-EOL files that merged every bare-LF line into its CRLF neighbor ("m1\r\nm2\nm3\r\n" →
 * ["m1", "m2\nm3", "\r"] — 2 lines instead of 3), causing systematic false-positive drift errors and
 * wrong-index deletions. The new segment engine (segmentLines / joinWithoutSegments / findVerifyWindow
 * in src/tools/fileSystemTools.ts) keeps every line + terminator as a distinct pair; these tests pin
 * that contract byte-exact, plus the verify_before_delete re-anchor/block semantics absorbed from the
 * retired delete_lines tool (its one-cycle deprecated alias was REMOVED in NEXT-REV, 23.09 — the error
 * payload contracts below now pin delete_lines_in_file's own shapes directly).
 *
 * ⚠️ KNOWN DEFECTS PINNED (23.09 post-review): for files WITHOUT a trailing newline, split() yields an
 * ODD parts list whose final element is dangling TEXT (not ''), so `lineCount = floor(parts.length/2)`
 * undercounts by one: the last line of every unterminated file is unreachable, deletions report wrong
 * remainingLines, drift-block context is truncated to the undercounted bounds, and a verify re-anchor
 * past those bounds trips a spurious out-of-bounds error. The failing tests below are PENDING-FAIL markers
 * for that off-by-one (owner to fix in segmentLines/lineCount — verified minimal fix: lineCount =
 * parts[parts.length - 1] === '' ? Math.floor(parts.length / 2) : Math.ceil(parts.length / 2); a plain
 * Math.ceil would REGRESS trailing-terminated files, whose odd parts list already ends in ''). Do NOT "fix"
 * these expectations until the source is fixed. (Note: the engine's doc comment claiming
 * "Line count === ceil(parts.length / 2)" is itself only half-right — floor is correct on trailing files.)
 */

import * as fs from 'fs';
import * as path from 'path';

// Mock fs (conventions copied verbatim from tests/fileSystemTools.test.ts header)
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    readFileSync: jest.fn().mockReturnValue('file content'),
    writeFileSync: jest.fn(),
    appendFileSync: jest.fn(),
    readdirSync: jest.fn().mockReturnValue([]),
    statSync: jest.fn().mockReturnValue({
      isDirectory: () => false,
      isFile: () => true,
      size: 100,
      birthtime: new Date(),
      mtime: new Date(),
      atime: new Date(),
    } as fs.Stats),
    existsSync: jest.fn().mockReturnValue(true),
    rmSync: jest.fn(),
    unlinkSync: jest.fn(),
    renameSync: jest.fn(),
    copyFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
      stat: jest.fn().mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        size: 100,
      } as fs.Stats),
      readFile: jest.fn().mockResolvedValue(Buffer.from('file content')),
      readdir: jest.fn().mockResolvedValue([]),
      writeFile: jest.fn().mockResolvedValue(undefined),
      appendFile: jest.fn().mockResolvedValue(undefined),
      mkdir: jest.fn().mockResolvedValue(undefined),
      rm: jest.fn().mockResolvedValue(undefined),
      unlink: jest.fn().mockResolvedValue(undefined),
      rename: jest.fn().mockResolvedValue(undefined),
      copyFile: jest.fn().mockResolvedValue(undefined),
      access: jest.fn(),
    },
  };
});

// Mock security (verbatim)
jest.mock('../src/security', () => ({
  validatePath: jest.fn().mockReturnValue(true),
  isSafeRegex: jest.fn().mockReturnValue(true),
}));

// Mock workingDir (verbatim)
jest.mock('../src/workingDir', () => ({
  getWorkingDir: jest.fn().mockReturnValue('/test/working/dir'),
  setWorkingDir: jest.fn().mockReturnValue(true),
  resolvePath: jest.fn((p: string) => `/test/working/dir/${p}`),
}));

// Mock performanceUtils (verbatim)
jest.mock('../src/performanceUtils', () => ({
  levenshteinSimilarity: jest.fn().mockReturnValue(0.8),
  getCachedFuzzyResults: jest.fn().mockReturnValue(null),
  cacheFuzzyResults: jest.fn(),
  findFilesAsync: jest.fn().mockResolvedValue({ files: ['/test/file.ts'], count: 1 }),
  countTypeScriptFiles: jest.fn().mockResolvedValue(5),
  getAnalysisTimeout: jest.fn().mockReturnValue(30000),
}));

import { registerFileSystemTools, segmentLines, joinWithoutSegments, findVerifyWindow } from '../src/tools/fileSystemTools';
import { DEFAULT_CONFIG } from '../src/config';
import { StateManager } from '../src/stateManager';

describe('lineOpsCrlf — 23.09 DRIFT-FIX v2 engine + Q5=A alias', () => {
  let tools: ReturnType<typeof registerFileSystemTools>;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs = fs as jest.Mocked<typeof fs>;
    const stateManager = new StateManager(DEFAULT_CONFIG);
    tools = registerFileSystemTools(DEFAULT_CONFIG, stateManager);
  });

  /** Content actually handed to atomicWriteFile (the writeFile call for the '.tmp' path). */
  function writtenContent(): string {
    const writeSpy = mockFs.promises.writeFile as jest.Mock;
    const call = writeSpy.mock.calls.find((c) => String(c[0]).endsWith('.tmp'));
    return call ? String(call[1]) : '<nothing written>';
  }

  // ==================== Segment engine — unit ====================
  describe('segmentLines (unit)', () => {
    test('uniform CRLF, NO trailing newline: parts list is ODD with dangling final text (documents split() shape)', () => {
      // split() appends a '' ONLY for a trailing terminator; an unterminated last line leaves bare TEXT.
      // ⚠️ This oddness is why floor(parts.length/2) undercounts one on no-trailing files — see pending-fail tests.
      expect(segmentLines('a\r\nb\r\nc')).toEqual(['a', '\r\n', 'b', '\r\n', 'c']);
    });

    test('pure LF, NO trailing newline: same odd shape with bare-LF terminators (empty string = one empty line)', () => {
      expect(segmentLines('a\nb\nc')).toEqual(['a', '\n', 'b', '\n', 'c']);
      expect(segmentLines('')).toEqual(['']);
    });

    test("MIXED EOL with trailing terminator: every line stays a distinct pair (the shape the old boolean split got wrong)", () => {
      // Old logic: hasCRLF → "m1\r\nm2\nm3\r\n".split('\r\n') = ["m1", "m2\nm3", "\r"] — 2 lines, L2 swallowed.
      // New engine: 3 distinct text+terminator pairs (+ split's final '' segment).
      expect(segmentLines('m1\r\nm2\nm3\r\n')).toEqual(['m1', '\r\n', 'm2', '\n', 'm3', '\r\n', '']);
    });

    test("trailing terminator: the file ends with split's final '' segment (line count = floor(len/2) stays exact here)", () => {
      expect(segmentLines('a\r\nb\r\n')).toEqual(['a', '\r\n', 'b', '\r\n', '']); // exactly 2 lines → floor(5/2)=2 ✓
    });

    test('single unterminated line: bare text, no terminator pair (len=1 → lineCount=floor(1/2)=0 ⚠️)', () => {
      expect(segmentLines('solo')).toEqual(['solo']);
    });
  });

  describe('joinWithoutSegments (unit)', () => {
    test('uniform CRLF: deletes middle line byte-exact', () => {
      expect(joinWithoutSegments(segmentLines('a\r\nb\r\nc'), 2, 2)).toBe('a\r\nc');
    });

    test('pure LF range delete keeps remaining terminators LF', () => {
      expect(joinWithoutSegments(segmentLines('l1\nl2\nl3\nl4'), 2, 3)).toBe('l1\nl4');
    });

    test("MIXED EOL regression (THE pin): deleting the bare-LF line removes exactly it, CRLFs untouched", () => {
      // Old boolean split produced ["m1", "m2\nm3", "\r"] — a "delete L2" wrote 'm1\r' and lost m3.
      expect(joinWithoutSegments(segmentLines('m1\r\nm2\nm3\r\n'), 2, 2)).toBe('m1\r\nm3\r\n');
    });

    test('deleting the unterminated LAST line of a no-trailing file is byte-exact (dangling text drops cleanly)', () => {
      expect(joinWithoutSegments(segmentLines('x\r\ny'), 2, 2)).toBe('x\r\n');
    });

    test('range entirely beyond file bounds: full content round-trips unchanged', () => {
      const parts = segmentLines('a\r\nb\nc\r\n');
      expect(joinWithoutSegments(parts, 9, 10)).toBe('a\r\nb\nc\r\n');
    });
  });

  describe('findVerifyWindow (unit)', () => {
    test('exact hit at requested line', () => {
      expect(findVerifyWindow(['alpha', 'beta', 'gamma'], 2, 'beta')).toBe(2);
    });

    test('multi-line verify matches contiguously (trim-compared) and returns the block start line', () => {
      const lines = ['keep', '  target one ', 'target two', 'tail'];
      expect(findVerifyWindow(lines, 2, 'target one\ntarget two')).toBe(2);
    });

    test('re-anchoring window: content up to 3 lines ABOVE or 2 lines BELOW the request still matches (start_line −3 … +2)', () => {
      const lines = ['one', 'two', 'three', 'delta', 'five'];
      expect(findVerifyWindow(lines, 4, 'one')).toBe(1); // requested L4, found at L1 (−3)
      expect(findVerifyWindow(lines, 2, 'delta')).toBe(4); // requested L2, found at L4 (+2)
    });

    test('content beyond the window: null (genuine drift)', () => {
      const lines = ['a', 'b', 'c', 'd', 'e'];
      expect(findVerifyWindow(lines, 1, 'e')).toBeNull(); // +3 below L1 → outside [L−3 … L+2]
    });

    test('empty expected block is a hard reject (k===0 guard); shorter file than the block: null', () => {
      expect(findVerifyWindow(['a'], 1, '')).toBeNull(); // ''.split(/\r?\n/) === [''] — never k=0; guard pins intent
      expect(findVerifyWindow([], 1, 'x')).toBeNull();
    });

    test('expected block longer than the file: null', () => {
      expect(findVerifyWindow(['a'], 1, 'a\nb\nc')).toBeNull();
    });
  });

  // ==================== delete_lines_in_file — EOL behavior (tool level) ====================
  describe('delete_lines_in_file — CRLF / mixed-EOL byte-exactness', () => {
    test('uniform CRLF file: single-line delete keeps every other line CRLF, counts correct', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('line1\r\nline2\r\nline3'));
      const result: any = await tool?.implementation({ file_name: 'crlf1.txt', start_line: 2 });
      expect(result.success).toBe(true);
      expect(writtenContent()).toBe('line1\r\nline3'); // byte-exact, mid-file deletion is unaffected by the no-trailing count bug
      expect(result.data.deletedLines).toBe('2-2');
      expect(result.data.linesDeleted).toBe(1);
    });

    test('uniform CRLF file (trailing): range delete stays byte-exact with correct counts', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      // Trailing terminator → lineCount exact, so remainingLines is trustworthy here (no-trail variant is pinned in PENDING-FAIL).
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('l1\r\nl2\r\nl3\r\nl4\r\n'));
      const result: any = await tool?.implementation({ file_name: 'crlf2.txt', start_line: 2, end_line: 3 });
      expect(result.success).toBe(true);
      // Byte-exact: l4 keeps its OWN terminator (join never rewrites terminators — 23.09 gate review fixed a missing \r\n here)
      expect(writtenContent()).toBe('l1\r\nl4\r\n');
      expect(result.data.linesDeleted).toBe(2);
      expect(result.data.remainingLines).toBe(2); // trailing file → lineCount exact (4)
    });

    test("MIXED-EOL file with trailing terminator (THE regression): deleting the bare-LF line is byte-exact", async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      // Old boolean split: ["m1", "m2\nm3", "\r"] → 2 lines; a "delete L2" wrote 'm1\r' and lost m3 entirely.
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('m1\r\nm2\nm3\r\n'));
      const result: any = await tool?.implementation({ file_name: 'mix2.txt', start_line: 2 });
      expect(result.success).toBe(true);
      expect(writtenContent()).toBe('m1\r\nm3\r\n'); // byte-exact: only the bare-LF line is gone
      expect(result.data.linesDeleted).toBe(1);
    });

    test('pure LF file stays pure LF (no CRLF injection)', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('p1\np2\np3'));
      const result: any = await tool?.implementation({ file_name: 'lf1.txt', start_line: 2 });
      expect(result.success).toBe(true);
      expect(writtenContent()).toBe('p1\np3');
    });

    test('deleting the last line of a trailing-terminated CRLF file ends cleanly with one terminator, counts exact', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\r\nb\r\n'));
      const result: any = await tool?.implementation({ file_name: 'crlf3.txt', start_line: 2 });
      expect(result.success).toBe(true);
      expect(writtenContent()).toBe('a\r\n');
      expect(result.data.remainingLines).toBe(1); // trailing file → lineCount exact (2) − 1
    });

    test('start line beyond file length → clean error, NOTHING written', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\r\nb'));
      const result: any = await tool?.implementation({ file_name: 'oob1.txt', start_line: 9 });
      expect(result.success).toBe(false);
      // ⚠️ error says "file length (1)" but the file has 2 real lines — no-trailing lineCount undercount;
      // pf3 below pins the true count. Only the fragment is asserted here so this test stays fix-proof.
      expect(result.error).toContain('exceeds file length');
      expect(writtenContent()).toBe('<nothing written>');
    });

    test('binary file is rejected before any write', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from([0x00, 0x01, 0x02]));
      const result: any = await tool?.implementation({ file_name: 'bin.exe', start_line: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Binary file detected');
      expect(writtenContent()).toBe('<nothing written>');
    });

    test('success payload carries backupCreated + deletedLines contract (trailing file)', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\r\nb\r\nc\r\n'));
      const result: any = await tool?.implementation({ file_name: 'payload.txt', start_line: 2 });
      expect(result.success).toBe(true);
      expect(result.data.file).toBe('/test/working/dir/payload.txt');
      expect(result.data.backupCreated).toBe('/test/working/dir/payload.txt.bak');
      expect(result.data.deletedLines).toBe('2-2');
      expect(result.data.linesDeleted).toBe(1);
      expect(result.data.remainingLines).toBe(2); // 3 trailing lines − 1 (exact)
    });

    test('re-anchor with explicit end_line below the hit (trailing CRLF file) → clean range error, NOTHING written', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      // Trailing-terminated twin of pf5's no-trailing pin: anchor re-anchors 2→4; explicit end_line=3 < hit.
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\r\nb\r\nc\r\nbeta\r\n'));
      const result: any = await tool?.implementation({ file_name: 'range1.txt', start_line: 2, end_line: 3, verify_before_delete: 'beta' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid range: end line (3) is before start line (4)');
      expect(writtenContent()).toBe('<nothing written>');
    });
  });

  // ==================== verify_before_delete — re-anchor & block (absorbed from retired delete_lines, Q5=A) ====================
  describe('delete_lines_in_file + verify_before_delete', () => {
    test('anchor matches exactly: deletion proceeds at the requested line', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\r\nbeta\r\nc'));
      const result: any = await tool?.implementation({ file_name: 'v1.txt', start_line: 2, verify_before_delete: 'beta' });
      expect(result.success).toBe(true);
      expect(writtenContent()).toBe('a\r\nc'); // byte-exact (remainingLines is off-by-one on no-trailing — pinned below)
    });

    // NOTE: the re-anchor-success case (content at L4, requested L2) is pinned as PENDING-FAIL pf6 below —
    // on no-trailing files the re-anchored hit currently trips a spurious out-of-bounds error.

    test('anchor absent outside window → BLOCKED with actual context, NOTHING written', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\nb\nc'));
      const result: any = await tool?.implementation({ file_name: 'v3.txt', start_line: 2, verify_before_delete: 'expected-elsewhere' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Drift detected');
      expect(typeof result.data.actualContext).toBe('string');
      expect(result.data.guidance).toBeDefined();
      // Context window [start−3 … start+2] clamped to lineCount: no-trailing 3-line file reports (2) → only L1..L2 shown ⚠️ count bug.
      expect(result.data.actualContext).toContain('Line 1: a');
      expect(result.data.actualContext).toContain('Line 2: b');
      expect(writtenContent()).toBe('<nothing written>');
    });

    test('block path on mixed-EOL file shows the true line view (old boolean split would have misreported it)', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      // 3 real lines; old split saw 2 ("m1", "m2\nm3"). Trailing terminator → context shows all 3 lines.
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('m1\r\nm2\nm3\r\n'));
      const result: any = await tool?.implementation({ file_name: 'v4.txt', start_line: 2, verify_before_delete: 'nope' });
      expect(result.success).toBe(false);
      expect(result.data.actualContext).toContain('Line 2: m2'); // bare-LF line reported as its OWN line — the drift fix at work
      expect(result.data.actualContext).toContain('Line 3: m3');
      expect(writtenContent()).toBe('<nothing written>');
    });

    test('multi-line anchor: contiguous block re-anchored, requested range deleted from the hit line', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      // Block 't1\nt2' actually starts at L4 (requested L3 → drift +1); end_line=5 deletes through L5.
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('h1\nh2\npre\nt1\nt2\nafter'));
      const result: any = await tool?.implementation({ file_name: 'v5.txt', start_line: 3, end_line: 5, verify_before_delete: 't1\nt2' });
      expect(result.success).toBe(true);
      expect(writtenContent()).toBe('h1\nh2\npre\nafter'); // t1 (re-anchored L4) + requested L5 deleted; L6 stays
    });

    // NOTE: the end-before-re-anchored-start scenario is actively pinned twice now (trailing twin in this suite's
    // byte-exactness block, no-trailing original as pf5 below) — former placeholder removed 23.09 post-fix (redundant).
  });

  // ==================== delete_lines_in_file — error payload contract (NEXT-REV, 23.09: former alias T3/T4 re-pointed) ====================
  describe('delete_lines_in_file — error payload contract', () => {
    test('out-of-bounds start fails with the NO-DATA error shape ({success:false,error}, no data field), NOTHING written', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\nb'));
      const result: any = await tool?.implementation({ file_name: 'noData1.txt', start_line: 9 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds file length');
      expect(result.data === undefined || result.data === null).toBe(true); // exact no-data shape (was pinned via the alias pass-through)
      expect(writtenContent()).toBe('<nothing written>');
    });

    test('drift block fails with the DATA-CARRYING error shape ({success:false,error,data:{actualContext,guidance}}), NOTHING written', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\nb\nc'));
      const result: any = await tool?.implementation({ file_name: 'noData2.txt', start_line: 2, verify_before_delete: 'missing-anchor' });
      expect(result.success).toBe(false);
      expect(String(result.error)).toContain('Drift detected');
      expect(typeof result.data.actualContext).toBe('string'); // data rides the structured payload (was pinned as the alias " | data=" JSON)
      expect(Object.keys(result.data)).toEqual(expect.arrayContaining(['actualContext', 'guidance']));
      expect(writtenContent()).toBe('<nothing written>');
    });
  });

  // ==================== Removal guard — alias + stub module deleted (NEXT-REV, 23.09) ====================
  describe('delete_lines removal', () => {
    test('src/tools/lineOperations.ts is GONE from the source tree', () => {
      const realFs = jest.requireActual('fs') as typeof fs; // suite's fs mock hardcodes existsSync→true — must bypass it
      expect(realFs.existsSync(path.join(__dirname, '..', 'src', 'tools', 'lineOperations.ts'))).toBe(false);
    });

    test('delete_lines is NOT registered (alias removed; successor exists exactly ONCE — no double registration)', () => {
      const names = tools?.map(t => t.name) ?? [];
      expect(names.filter(n => n === 'delete_lines')).toHaveLength(0);
      expect(names.filter(n => n === 'delete_lines_in_file')).toHaveLength(1);
    });
  });

  // ============================================================================
  // FIXED 23.09 @19:08 — no-trailing-newline off-by-one (was PENDING-FAIL; source fix applied, all green below)
  // ============================================================================
  // Root cause: split(/(\r\n|\n)/) yields an ODD parts list for no-trailing content whose FINAL
  // element is dangling TEXT, not ''; the documented contract ("'' for a final unterminated line")
  // is not implemented. Consequently `lineCount = floor(parts.length/2)` undercounts by one:
  //   • last line unreachable (bounds check rejects a valid deletion),
  //   • remainingLines wrong on every no-trailing delete,
  //   • drift-block context window truncated, verify re-anchor can exceed reported bounds.
  // These tests encode the CORRECT (contract) behavior and are expected to FAIL until fixed —
  // do not adjust expectations to make them pass; fix segmentLines/lineCount instead (verified minimal
  // fix in the file header above — NOT a plain Math.ceil, which regresses trailing-terminated files).
  describe('no-trailing-newline off-by-one — FIXED in source 23.09 (gate closed; markers kept as regression pins)', () => {
    // Owner decision 23.09 @19:08 (Option A): segmentLines keeps its ODD-list shape for unterminated content —
    // the dangling final TEXT is documented, not padded with '' (padding would flip 4 active shape-pins in this file).
    test('segmentLines contract for a single unterminated line: ODD list [text] — lineCount recovers via ceil branch', () => {
      expect(segmentLines('solo')).toEqual(['solo']); // dangling TEXT, no terminator pair (odd len=1)
      // The deleted [pending-fail] variant asserted an idealized ['solo',''] representation; the BEHAVIORAL contract it
      // implied is what pf1 below enforces: with lineCount = ceil(1/2)=1 the solo line IS reachable/deletable.
    });

    test('[was pending-fail, now fixed] no-trailing file: the last line IS deletable (bounds check accepts it)', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\r\nb')); // 2 real lines, no trailing \n
      const result: any = await tool?.implementation({ file_name: 'pf1.txt', start_line: 2 });
      expect(result.success).toBe(true); // currently: false — "Start line 2 exceeds file length (1)"
    });

    test('[was pending-fail, now fixed] no-trailing delete reports correct remainingLines', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('line1\r\nline2\r\nline3')); // 3 lines, no trailing \n
      const result: any = await tool?.implementation({ file_name: 'pf2.txt', start_line: 2 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(writtenContent()).toBe('line1\r\nline3'); // byte-exactness already holds even pre-fix
        expect(result.data.remainingLines).toBe(2); // currently: 1 (floor(5/2)=2 reported lineCount − 1)
      }
    });

    test('[was pending-fail, now fixed] no-trailing out-of-bounds error reports the TRUE line count', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\r\nb')); // 2 lines, no trailing \n
      const result: any = await tool?.implementation({ file_name: 'pf3.txt', start_line: 9 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds file length (2)'); // currently: "...file length (1)"
    });

    test('[was pending-fail, now fixed] no-trailing drift block shows the FULL context window incl. last line', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\nb\nc')); // 3 lines, no trailing \n
      const result: any = await tool?.implementation({ file_name: 'pf4.txt', start_line: 2, verify_before_delete: 'expected-elsewhere' });
      expect(result.success).toBe(false);
      if (result.success === false && result.data) {
        expect(String(result.data.actualContext)).toContain('Line 3: c'); // currently truncated at Line 2 (lineCount undercount → ctxEnd=2)
      }
    });

    test('[was pending-fail, now fixed] no-trailing verify re-anchor + explicit end_line before hit → clean RANGE error (not a spurious out-of-bounds), NOTHING written', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      // 4 real lines, no trailing \n. Anchor 'beta' re-anchors to L4; end_line=1 < effStartLine=4.
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('a\nb\nc\nbeta'));
      const result: any = await tool?.implementation({ file_name: 'pf5.txt', start_line: 2, end_line: 1, verify_before_delete: 'beta' });
      expect(result.success).toBe(false);
      // Correct behavior (fixed lineCount=4): range error "end line (1) is before start line (4)".
      // Currently FAILS this assertion: undercounted lineCount(3) makes effStartLine(4) trip the spurious
      // out-of-bounds check first → "Start line 2 exceeds file length (3)" instead.
      expect(result.error).toContain('is before start line');
      expect(writtenContent()).toBe('<nothing written>');
    });

    test('[was pending-fail, now fixed] no-trailing verify re-anchor past undercounted bounds → should succeed (delete the real L4)', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      // 4 real lines, no trailing \n. Anchor 'beta' sits at L4; requested start is L2 (+2 drift, in window).
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('x\ny\nz\nbeta'));
      const result: any = await tool?.implementation({ file_name: 'v2.txt', start_line: 2, verify_before_delete: 'beta' });
      expect(result.success).toBe(true); // currently FAILS: "Start line 2 exceeds file length (3)" — re-anchored L4 vs undercounted lineCount
      if (result.success) {
        // beta was unterminated; deleting it leaves line 3's OWN terminator → trailing '\n' (editor-standard).
        expect(writtenContent()).toBe('x\ny\nz\n');
        expect(result.data.deletedLines).toBe('4-4');
      }
    });

  });
});
