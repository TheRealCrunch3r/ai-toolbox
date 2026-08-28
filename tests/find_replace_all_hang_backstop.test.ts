/**
 * REGRESSION SUITE — find_replace_all hang-fix port (FIX-HANG-F1/F2/F3, 27.08.2026)
 *
 * Incident class: the same defect that caused the grep_files silent ~2-minute hang (FIX-HANG-1/2,
 * 26.08.2026) was present verbatim in find_replace_all — abort checks read `signal` destructured from an
 * EMPTY object literal (`const { signal }: { signal?: AbortSignal } = {}`), i.e. a value that was ALWAYS
 * undefined, while no loop ever observed the internal controller's flag (a second controller existed but
 * nothing read it). find_replace_all is worse than grep in one respect: its whole-file
 * content.match(regex) / content.replace(regex, replacement) are each ONE unpreemptible synchronous segment —
 * a spinning call blocks the event loop and with it EVERY timer (deadline, abort, host fallback). Measured
 * 210ms for a single .test() on a 23-char near-miss input, ~x4 growth per character; whole-file ops are an
 * order of magnitude larger inputs. With no backstop race the only way out was a host kill (~120s) with NO
 * result — and in apply mode that meant an unknown set of files already modified (partial batch, unreported).
 *
 * Fix under test:
 *   FIX-HANG-F1: ONE AbortController created before all scan functions; every loop check reads it; the
 *                success path now surfaces `aborted` so a deadline-trimmed scan is never indistinguishable
 *                from a normal completion (in apply mode this doubles as a mid-batch safety report).
 *   FIX-HANG-F2: cooperative wall-clock gates BEFORE every synchronous regex op on file content (.match and
 *                .replace) — JS cannot preempt an in-flight call, so the binding defense is never STARTING
 *                new work once the budget (FRA_SCAN_DEADLINE_MS = 15s) is exhausted.
 *   FIX-HANG-F3: wall-clock backstop race that settles THIS tool call at deadline+5s regardless of what is
 *                still spinning — partial results returned with aborted:true instead of a black hole. The
 *                backstop timer is cleared on settle (no stray warn 20s after healthy scans).
 */

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface FRAFileEntry { file: string; matches: number; }
interface FRAResult {
  success: boolean;
  error?: string;
  data?: {
    dryRun: boolean;
    totalMatches: number;
    filesAffected?: number;
    filesModified?: number;
    files: FRAFileEntry[];
    skipped: Array<{ file: string; reason: string }>;
    aborted?: boolean;
    message: string;
  };
}

describe('find_replace_all hang-fix regression (FIX-HANG-F1/F2/F3)', () => {
  let tools: ReturnType<typeof registerFileSystemTools>;
  let testDir: string;

  beforeAll(async () => {
    testDir = path.join(os.tmpdir(), `fra-hang-test-${Date.now()}`);
    await fs.mkdir(path.join(testDir, 'sub'), { recursive: true });
    // Deterministic fixtures — every file passes all gates (small, short lines)
    await fs.writeFile(path.join(testDir, 'alpha.ts'), 'const ALPHA_MARKER = 1;\nexport const x = 2; ALPHA_MARKER again\n');
    await fs.writeFile(path.join(testDir, 'sub', 'beta.js'), '// BETA_MARKER lives in sub/\nvar y = 3; BETA_MARKER too\n');
    // A file with >5001 lines to exercise the skipped report alongside a normal scan (pre-existing FIX-G3b contract)
    await fs.writeFile(path.join(testDir, 'big_lines.txt'), 'pad\n'.repeat(5001));

    tools = registerFileSystemTools({} as PluginConfig, {} as StateManager);
  });

  afterAll(async () => {
    try { await fs.rm(testDir, { recursive: true, force: true }); } catch (e) { console.error('Cleanup failed:', e); }
  });

  const getFRATool = () => tools.find(t => t.name === 'find_replace_all');

  test('dry-run scan still returns matches through the backstop race (no behavioral regression)', async () => {
    const fraTool = getFRATool();
    if (!fraTool) throw new Error('find_replace_all tool not found');

    const result = await fraTool.implementation({
      pattern: 'ALPHA_MARKER|BETA_MARKER',
      directory: testDir,
      dry_run: true,
      confirm: false,
      file_extensions: undefined,
      max_files: 100,
      max_file_size: 100_000,
    }) as unknown as FRAResult;

    expect(result.success).toBe(true);
    if (result.success) {
      // The Promise.race wrapper must be transparent for normal fast scans — both markers found
      const files = result.data!.files.map(f => f.file.replace(/\\/g, '/'));
      expect(files.some(f => f.includes('alpha.ts'))).toBe(true);
      expect(files.some(f => f.includes('sub/beta.js'))).toBe(true);
      expect(result.data!.totalMatches).toBeGreaterThanOrEqual(4); // 2 alpha + 2 beta occurrences
      // A healthy scan must NOT report itself as aborted (success path now carries the flag — FIX-HANG-F1)
      expect(result.data!.aborted ?? false).toBe(false);
      expect(result.data!.message).toContain('Dry run complete');
      // The >5001-line fixture is reported via skipped (pre-existing contract preserved)
      const skipped = result.data!.skipped.map(s => s.file.replace(/\\/g, '/'));
      expect(skipped.some(f => f.includes('big_lines.txt'))).toBe(true);
      // Dry run must NOT have modified anything
      const untouched = await fs.readFile(path.join(testDir, 'alpha.ts'), 'utf-8');
      expect(untouched).toContain('ALPHA_MARKER');
    }
  });

  test('apply mode (dry_run:false + confirm:true) rewrites files and reports clean success', async () => {
    const fraTool = getFRATool();
    if (!fraTool) throw new Error('find_replace_all tool not found');

    // Isolated fixture so the rewrite is verifiable without disturbing test 1's assertions order-independently
    const applyDir = path.join(os.tmpdir(), `fra-hang-apply-${Date.now()}`);
    await fs.mkdir(applyDir, { recursive: true });
    try {
      const targetFile = path.join(applyDir, 'target.txt');
      await fs.writeFile(targetFile, 'TOKEN one\nno match line\nTOKEN two\n');

      const result = await fraTool.implementation({
        pattern: 'TOKEN',
        replacement: 'REPLACED',
        directory: applyDir,
        dry_run: false,
        confirm: true, // required guard — must be present for any write to happen
        backup: true,
      }) as unknown as FRAResult;

      expect(result.success).toBe(true);
      if (result.success) {
        const newContent = await fs.readFile(targetFile, 'utf-8');
        expect(newContent).toContain('REPLACED one');
        expect(newContent).toContain('REPLACED two');
        expect(newContent).not.toContain('TOKEN');
        expect(result.data!.aborted ?? false).toBe(false);
        expect(result.data!.message).toContain('Changes applied successfully.');
      }

      // Guard: without confirm the tool must refuse to write (pre-existing safety contract)
      await fs.writeFile(targetFile, 'TOKEN one\n');
      const refused = await fraTool.implementation({
        pattern: 'TOKEN',
        replacement: 'X',
        directory: applyDir,
        dry_run: false,
        confirm: false,
      }) as unknown as FRAResult;
      expect(refused.success).toBe(false);
      const stillUntouched = await fs.readFile(targetFile, 'utf-8');
      expect(stillUntouched).toContain('TOKEN one');
    } finally {
      try { await fs.rm(applyDir, { recursive: true, force: true }); } catch {}
    }
  });

  /**
   * THE regression test. Deadlines are wall-clock based (Date.now), so fake time is accelerated
   * deterministically: every Date.now call returns base + realElapsed × SPEEDUP, with SPEED chosen so the
   * full scan (~10–50ms real) spans THOUSANDS of seconds of fake time — guaranteed to cross the 15s deadline
   * long before completion, on any machine. If FIX-HANG-F1's wiring were still dead (checks reading an
   * always-undefined value / unread flag), no abort would ever be set and the result would carry NO `aborted`
   * flag — exactly the old silent-hang contract. With the fix, gates see the deadline overrun at the first
   * file boundary, short-circuit remaining work, and the success path labels the partial results as aborted.
   */
  test('deadline abort is OBSERVABLE: wall-clock overrun → early settle + aborted flag on success path (was dead code)', async () => {
    const fraTool = getFRATool();
    if (!fraTool) throw new Error('find_replace_all tool not found');

    const deadlineDir = path.join(os.tmpdir(), `fra-hang-deadline-${Date.now()}`);
    await fs.mkdir(deadlineDir, { recursive: true });

    let spy: jest.SpyInstance;
    try {
      // Enough files that the walk demonstrably continues across multiple file boundaries (many gate checks)
      const fileCount = 40;
      for (let f = 0; f < fileCount; f++) {
        await fs.writeFile(path.join(deadlineDir, `d${String(f).padStart(2, '0')}.txt`), `marker_${f} plain line\nsecond line ${f}\n`);
      }

      // Capture the REAL clock first (fixtures already written — no Date.now needed during setup below)
      const realNow = () => new Date().getTime(); // bypasses any spy on Date.now
      const t0Real = realNow();
      const base = 1_700_000_000_000;            // arbitrary stable fake epoch
      const SPEEDUP = 250_000;                   // ~30ms real → thousands of fake seconds across the whole scan

      spy = jest.spyOn(Date, 'now').mockImplementation(() => base + (realNow() - t0Real) * SPEEDUP);

      const result = await fraTool.implementation({
        pattern: 'marker_|plain', // matches in every file → the walk would continue through all 40 without the fix
        directory: deadlineDir,
        dry_run: true,
        confirm: false,
      }) as unknown as FRAResult;

      spy.mockRestore();

      expect(result.success).toBe(true);
      if (result.success) {
        // THE assertion: deadline firing is observable end-to-end. Partial results MUST be labeled aborted —
        // old code produced no such flag even under a 2-minute overrun (dead signal wiring).
        expect(result.data!.aborted ?? false).toBe(true);
        // The partial-results message explains why coverage may be incomplete (no more silent trims)
        expect(typeof result.data!.message === 'string').toBe(true);
        expect(result.data!.message.toLowerCase()).toContain('cut short');
        // Sanity: the cut-short scan still returned whatever it had collected up to that point
        expect(Array.isArray(result.data!.files)).toBe(true);
      }
    } finally {
      if (spy) spy.mockRestore();
      try { await fs.rm(deadlineDir, { recursive: true, force: true }); } catch {}
    }
  });
});
