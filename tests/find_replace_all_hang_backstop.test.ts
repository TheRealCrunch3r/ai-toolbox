/**
 * REGRESSION SUITE — find_replace_all hang fixes (FIX-HANG-F1/F2/F3, 27.08; v3 architecture 04.09)
 *
 * Historical incident class: the same defect that caused the grep_files silent ~2-minute hang was present verbatim
 * in find_replace_all — abort checks read `signal` destructured from an EMPTY object literal (ALWAYS undefined), so
 * no loop ever observed any abort. find_replace_all is worse than grep in one respect: its whole-file
 * content.match(regex) / content.replace(regex, replacement) are each ONE unpreemptible synchronous segment — a
 * spinning call blocks the event loop and with it EVERY timer. Measured 210ms for a single .test() on a 23-char
 * near-miss input, ~x4 growth per character; whole-file ops are an order of magnitude larger inputs. With no
 * backstop the only way out was a host kill (~120s) with NO result — and in apply mode that meant an unknown set
 * of files already modified (partial batch, unreported).
 *
 * ARCHITECTURE UNDER TEST (v3, 04.09 FIX-DEBLOAT): the local AbortController + FRA_SCAN_DEADLINE_MS wall-clock race
 * is replaced by ONE shared cancellation primitive per call — src/utils/grepGuard.ts createGrepGuard(undefined,
 * FIND_REPLACE_ALL_MAX_RUN_MS=15_000ms) (host-signal forwarding unavailable: this tool takes no ctx param):
 *   - a single real setTimeout arms the wall-clock cap; at the deadline it calls controller.abort();
 *   - abortIfDeadlineExceeded() now checks ONLY guard.signal.aborted — the cooperative gate before every
 *     synchronous .match()/.replace(); walkDir's entry check reads the same flag;
 *   - disarm() clears the timer on EVERY completion path (healthy, aborted or thrown).
 */

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import { FIND_REPLACE_ALL_MAX_RUN_MS } from '../src/utils/grepGuard'; // static import — keeps this suite in lockstep with production (no hardcoded 15_000)
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

describe('find_replace_all hang-fix regression (FIX-HANG-F1/F2 → v3 shared guard)', () => {
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

  test('dry-run scan still returns matches under the shared guard (no behavioral regression)', async () => {
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
      // The guard's plain await must be transparent for normal fast scans — both markers found
      const files = result.data!.files.map(f => f.file.replace(/\\/g, '/'));
      expect(files.some(f => f.includes('alpha.ts'))).toBe(true);
      expect(files.some(f => f.includes('sub/beta.js'))).toBe(true);
      expect(result.data!.totalMatches).toBeGreaterThanOrEqual(4); // 2 alpha + 2 beta occurrences
      // A healthy scan must NOT report itself as aborted (success path carries the flag — v3 guard)
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
   * THE regression test (rewritten for v3, 04.09). The guard arms a REAL setTimeout(FIND_REPLACE_ALL_MAX_RUN_MS=15s)
   * — the old Date.now SPEEDUP hack cannot fake timer expiry, so this now uses jest modern fake timers:
   * the implementation starts under a frozen clock (guard timer scheduled but not yet fired), real fs I/O proceeds
   * while we advance the fake clock past 15_000ms with advanceTimersByTimeAsync (which also flushes microtasks
   * between steps, letting in-flight native I/O complete). The cap then aborts via the internal controller; every
   * remaining file-boundary gate sees guard.signal.aborted and short-circuits. If the wiring were dead (checks
   * reading an unread flag / undefined value), no abort would ever be set and the result would carry NO `aborted`
   * flag — exactly the old silent-hang contract.
   */
  test('deadline abort is OBSERVABLE: wall-clock cap expiry → early settle + aborted flag on success path', async () => {
    const fraTool = getFRATool();
    if (!fraTool) throw new Error('find_replace_all tool not found');

    const deadlineDir = path.join(os.tmpdir(), `fra-hang-deadline-${Date.now()}`);
    await fs.mkdir(deadlineDir, { recursive: true });

    try {
      // Enough files that the walk demonstrably continues across multiple file boundaries (many gate checks)
      const fileCount = 40;
      for (let f = 0; f < fileCount; f++) {
        await fs.writeFile(path.join(deadlineDir, `d${String(f).padStart(2, '0')}.txt`), `marker_${f} plain line\nsecond line ${f}\n`);
      }

      jest.useFakeTimers();
      try {
        // Start the implementation WITHOUT awaiting — at this instant the guard has scheduled its 15s cap on the
        // FAKE clock and no real time can elapse to fire it prematurely.
        const implPromise = fraTool.implementation({
          pattern: 'marker_|plain', // matches in every file → the walk would continue through all 40 without the abort
          directory: deadlineDir,
          dry_run: true,
          confirm: false,
        }) as Promise<FRAResult>;

        // Advance the fake clock past the cap (with margin). advanceTimersByTimeAsync steps through time in small
        // increments, flushing microtasks after each — that is also where the real (libuv) fs callbacks of the
        // in-flight scan get their chance to run between steps. At 15_000ms the guard timer fires → abort → every
        // subsequent gate stops and the call settles with partial results.
        await jest.advanceTimersByTimeAsync(FIND_REPLACE_ALL_MAX_RUN_MS + 100);

        const result = await implPromise;
        expect(result.success).toBe(true);
        if (result.success) {
          // THE assertion: cap firing is observable end-to-end. Partial results MUST be labeled aborted —
          // old code produced no such flag even under a 2-minute overrun (dead signal wiring).
          expect(result.data!.aborted ?? false).toBe(true);
          // The partial-results message explains why coverage may be incomplete (no more silent trims)
          expect(typeof result.data!.message === 'string').toBe(true);
          expect(result.data!.message.toLowerCase()).toContain('cut short');
          // Sanity: the cut-short scan still returned whatever it had collected up to that point
          expect(Array.isArray(result.data!.files)).toBe(true);
        }
      } finally {
        jest.useRealTimers();
      }
    } finally {
      try { await fs.rm(deadlineDir, { recursive: true, force: true }); } catch {}
    }
  });
});
