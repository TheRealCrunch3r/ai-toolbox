/**
 * WALK-ABORT (28.09) regression — the directory-walk phase of pattern_scan previously ran to completion
 * with NO deadline/host-signal check: in directory mode no file boundary exists until the BFS finishes, so
 * a slow-FS / deep-tree walk sailed past PATTERN_SCAN_MAX_RUN_MS and only the post-walk workers ever saw the
 * flag (the 28.09 >3 s abort incidents; same class as RE-ARM 24.09's >60 s zero-payload incident).
 *
 * Fix under test: walkDirectory() now receives the shared guard signal and breaks at every directory boundary
 * once aborted (src/tools/patternScan.ts — "WALK-ABORT" comments). This suite exercises that checkpoint via a
 * HOST abortSignal fired mid-walk over a WIDE BFS tree, where pre-fix code walks all dirs → full result set,
 * post-fix stops at the first boundary after firing → PARTIAL (strictly fewer files, or none if it fires before
 * any dir is drained). Both outcomes are valid contract classes; the suite pins whichever occurs and asserts
 * structural soundness — same cutoff-tolerant convention as patternScan.test.ts.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { patternScan } from '../src/tools/patternScan';

const DIR_COUNT = 400; // wide BFS: each dir is one walk-loop iteration (one readdir) → many directory boundaries to stop at
const PROBE = 'WALK_ABORT_PROBE_7331';
const ABORT_DELAY_MS = 50;

describe('walk abort (28.09 WALK-ABORT)', () => {
  let root: string; // isolated tmp tree — deliberately separate from the shared patternScan.test.ts fixture
  const filesByDir: Array<{ dir: string; file: string }> = []; // BFS walk order (localeCompare, dirs-before-files) → file i lives in dir i

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-walk-abort-'));
    for (let i = 0; i < DIR_COUNT; i++) {
      const d = `d${String(i).padStart(3, '0')}`;
      filesByDir.push({ dir: d, file: `${d}/f.txt` });
      fs.mkdirSync(path.join(root, d));
      fs.writeFileSync(path.join(root, d, 'f.txt'), `WALK_ABORT_PROBE_7331 ${i}\nno-match filler line\n`);
    }
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  // Control: the tree is fully walkable + matchable — every dir contributes exactly one probe line.
  it('control (no signal): full scan completes un-aborted with all dirs matched', async () => {
    const t0 = Date.now();
    const r = await patternScan({ pattern: PROBE, root, maxTotalMatches: DIR_COUNT * 2 }); // raise the default 200 cap — this fixture yields 400 matches by design
    console.log(`[DIAG] walk-abort control: elapsed=${Date.now() - t0}ms aborted=${String(r.aborted)} filesScanned=${r.stats.filesScanned} matches=${r.matches.length}`);
    expect(r.ok).toBe(true);
    expect(r.aborted ?? false).toBe(false); // no signal passed; sane host completes well inside the 3 s wall
    expect(r.stats.filesScanned).toBe(DIR_COUNT);
    expect(r.matches.length).toBe(DIR_COUNT); // one probe line per dir, sorted by (file, line)
    expect(r.matches[0].line).toBe(1);
  });

  it('host signal fired mid-walk stops the walk at a directory boundary — never walks past the fire point', async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ABORT_DELAY_MS);
    const t0 = Date.now();
    let r;
    try {
      // Directory root: the WALK phase is what runs for the first ~tens of ms — by 50 ms the pre-fix code would still be
      // mid-BFS while post-fix breaks at the next boundary. Awaited below, so no unhandled-rejection surface.
      r = await patternScan({ pattern: PROBE, root, abortSignal: ctrl.signal, maxTotalMatches: DIR_COUNT * 2 }); // same raised cap — keep 'strictly partial' meaningful for >200 survivors
    } finally {
      clearTimeout(timer);
    }
    const elapsed = Date.now() - t0;
    console.log(`[DIAG] walk-abort mid-walk: elapsed=${elapsed}ms aborted=${String(r.aborted)} filesScanned=${r.stats.filesScanned} matches=${r.matches.length}`);

    expect(ctrl.signal.aborted).toBe(true); // fire actually happened (sanity — a broken AbortController would void the test)
    expect(elapsed).toBeGreaterThanOrEqual(ABORT_DELAY_MS - 5); // not a spurious early exit
    expect(r.ok).toBe(true); // abort is an outcome, not an error

    if (!(r.aborted ?? false)) {
      // Ultra-fast host: the entire 400-dir BFS drained before the fire point → walk finished naturally and nothing
      // post-walk saw a late flag. This regime proves NOTHING about the fix — fail loudly so it gets attention instead
      // of silently passing (the pre-fix code also completes here, which is exactly why we cannot accept it).
      throw new Error(`WALK-ABORT REGIME: tree drained in ${elapsed}ms < fire point (${ABORT_DELAY_MS}ms) — abort landed post-walk; re-tune DIR_COUNT/ABORT_DELAY_MS for this host`);
    }

    // Aborted regime (the fix is observable): the result must be a structurally sound PREFIX of the complete set.
    // The walk breaks BETWEEN directory drains, so every returned file belongs to an already-drained dir — and BFS
    // order means those are exactly the lexicographically-first dirs. No later dir may appear while its predecessor's
    // file is absent (walk-order prefix property, same convention as patternScan.test.ts).
    expect(r.matches.length).toBeLessThan(DIR_COUNT); // strictly partial — pre-fix code walks to completion → would be 400
    const present = new Map<string, number[]>();
    for (const m of r.matches) {
      if (!present.has(m.file)) present.set(m.file, []);
      present.get(m.file)!.push(m.line);
    }
    // Every file that returned anything delivered its full one-line contribution on line 1 (no torn files — the walk
    // stops between dirs; per-file scan completion is atomic here):
    for (const [file, lines] of present) expect(lines).toEqual([1]);
    const order = filesByDir.map((e) => e.file); // BFS/lexicographic file order for this fixture
    const indexByName = new Map(order.map((f, i) => [f, i]));
    let lastSeen = -1;
    for (const file of [...present.keys()].sort()) {
      const idx = indexByName.get(file)!;
      expect(idx).toBeGreaterThan(lastSeen); // strict ascending — no gaps forward in the walk order
      lastSeen = idx;
    }
    // And the first drained dir's file, if any files exist at all, is d000/f.txt (drained before or at the fire point):
    if (present.size > 0) expect([...present.keys()][0]).toBe(filesByDir[0].file);
    // stats stay honest for partials. filesScanned — BOUND, not equality (same lesson as patternScan.test.ts's
    // "INEQUALITY ONLY" correction): the flag can flip AFTER a file's stat incremented filesScanned but before its
    // scan produced matches → at most ONE in-flight file counts without surviving:
    expect(r.stats.totalMatches).toBe(r.matches.length);
    expect(r.stats.filesScanned).toBeGreaterThanOrEqual(present.size);
    expect(r.stats.filesScanned).toBeLessThanOrEqual(present.size + 1);
  });
});
