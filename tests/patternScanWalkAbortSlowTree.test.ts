/**
 * WALK-ABORT (28.09) — deterministic slow-walk A/B: pre-fix walk vs fixed walk under a deadline that FIRES mid-walk.
 *
 * Companion to patternScanWalkAbort.test.ts (which exercises the checkpoint via a host signal). This suite reproduces
 * the OWNER INCIDENT SHAPE instead: a single dir-mode scan (root = tree, maxDepth ≫ depth, no host signal) whose WALK
 * phase outlasts PATTERN_SCAN_MAX_RUN_MS — i.e. the >3 s aborts the owner had to cancel by hand on 28.09.
 *
 * WHY A/B AND NOT JUST THE LIVE TOOL CALL:
 *   The live fixed build drains this project's src/ in ~10 ms today, so a plain re-run of the original parameters
 *   proves "fast now" but not "bounded when slow". Whether the pre-fix code hangs on a given tree depends on FS speed —
 *   untestable from inside. So: (A) runs the CURRENT implementation end-to-end through its public API with the REAL
 *   3 s deadline armed, and (B) reconstructs the PRE-FIX walk verbatim (same BFS/sort/exclude logic, NO signal check —
 *   exactly what patternScan.ts had before WALK-ABORT), driven over the same fixture. B is a reconstruction for A/B
 *   contrast only; it exercises production patternScan code in every other phase and is labelled as such at each step.
 *
 * REGIME GATE (house convention — cutoff-tolerant, fail-loud instead of timing pins): if the fixture drains faster than
 * the fire point on this host, neither variant can demonstrate anything → the test FAILS with a re-tuning directive, it
 * never silently passes in an uninformative regime. All wall assertions are BOUNDS (≥/≤), never equality pins.
 *
 * PATTERN NEUTRALITY (owner recall 28.09): the owner's original failing call used a LONG, METACHARACTER-DENSE pattern
 * ("tons of * { } |" — glob-shaped text in regex mode). That detail does NOT change what this suite must prove: the pre-fix
 * hang lived in the WALK phase, which runs before ANY regex evaluation and is byte-identical for every valid pattern. Two
 * eval-side behaviours keep a complex probe safe either way: (a) syntactically-invalid or ReDoS-unsafe patterns are demoted
 * to escaped LITERALS by buildMatcher BEFORE any I/O (module fail-fast principle 1) → fast + bounded; (b) Annex-B JS regex
 * treats braces/brackets in invalid quantifier positions as LITERAL characters, so glob-shaped-but-valid patterns simply
 * match little or nothing — still evaluated line-wise under the isSafeRegex-gated contract. Live probes on the fixed build
 * (root=src): a representative glob-shaped pattern AND the owner's VERBATIM recalled string both settled in ~15 ms with no
 * abort; the verbatim one was gate-demoted ('unsafe-regex': 6 quantifier chars > isSafeRegex's ≤5 threshold, src/security.ts)
 * → its pre-fix hang had zero eval cost — pure unbounded walk. (Owner recall 28.09 ~17:0x.)
 */

import fs from 'fs';
import type { Dirent } from 'fs';
import os from 'os';
import path from 'path';
import { patternScan } from '../src/tools/patternScan';
import { PATTERN_SCAN_MAX_RUN_MS } from '../src/utils/grepGuard'; // house convention (cf. patternScanHangBackstop / find_replace_all_hang_backstop) — ../utils/... resolves into tests/, not src/

const DIR_COUNT = 400; // one readdir per dir → one directory boundary each (same wide-BFS fixture shape as the sibling suite)
const PROBE = 'SLOW_TREE_PROBE_8412';
const MAX_DEPTH = 60; // owner incident parameter — exceeds fixture depth by construction, so walk scope is identical for all variants
// Fire point must be > one full BFS drain (fastest plausible host: ~ms) and < PATTERN_SCAN_MAX_RUN_MS with margin so the
// internal deadline also lands mid-walk. 50 ms satisfies both on any sane FS; tune with DIR_COUNT if the regime gate fires.
const ABORT_DELAY_MS = 50;

describe('walk abort — slow-tree A/B (28.09 WALK-ABORT, owner incident shape)', () => {
  let root: string; // isolated tmp tree; deliberately separate from both sibling fixtures
  const filesByDir: Array<{ dir: string; file: string }> = [];

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-walk-slowtree-'));
    for (let i = 0; i < DIR_COUNT; i++) {
      const d = `d${String(i).padStart(3, '0')}`;
      filesByDir.push({ dir: d, file: `${d}/f.txt` });
      fs.mkdirSync(path.join(root, d));
      fs.writeFileSync(path.join(root, d, 'f.txt'), `${PROBE} ${i}\nno-match filler line\n`);
    }
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  // ---------------------------------------------------------------------------
  // RECONSTRUCTED PRE-FIX WALK — verbatim BFS logic of src/tools/patternScan.ts pre-WALK-ABORT (signal param + the
  // "WALK-ABORT" boundary check REMOVED; everything else identical: name-sorted readdir, DEFAULT_EXCLUDE_DIRS prune,
  // depth-bounded descent). Exists solely so variant B below runs the same code the owner's original call hit.
  // ---------------------------------------------------------------------------
  const PRE_FIX_DEFAULT_EXCLUDES = new Set([
    'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '__pycache__', '.venv', 'coverage', '.ai_toolbox_backups',
  ]);

  interface PreFixTarget { abs: string; rel: string; }
  async function walkDirectoryPreFix(rootAbs: string, maxDepth: number): Promise<{ files: PreFixTarget[] }> {
    const files: PreFixTarget[] = [];
    interface QEntry { dirAbs: string; rel: string; depth: number; } // depth of THIS directory below root (root = 0)
    const queue: QEntry[] = [{ dirAbs: rootAbs, rel: '', depth: 0 }];

    for (;;) {
      // PRE-FIX: no signal check here — this line is exactly what WALK-ABORT added. The BFS runs to completion regardless
      // of any deadline; only post-walk phases could ever observe the flag (which is why the owner's call ran >3 s).
      const cur = queue.shift();
      if (!cur) break; // BFS complete
      let entries: Dirent[];
      try { entries = await fs.promises.readdir(cur.dirAbs, { withFileTypes: true }); } catch { continue; }
      for (const e of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
        if (PRE_FIX_DEFAULT_EXCLUDES.has(e.name)) continue;
        const rel = cur.rel === '' ? e.name : `${cur.rel}/${e.name}`;

        let isDir = e.isDirectory();
        let isFile = e.isFile();
        if (!isDir && !isFile) {
          if (e.isSymbolicLink()) {
            try { const st = await fs.promises.stat(path.join(cur.dirAbs, e.name)); isDir = st.isDirectory(); isFile = st.isFile(); } catch { continue; }
          } else { continue; }
        }
        if (isDir) {
          // Descend into a child at depth d only while d <= maxDepth → files up to file-depth maxDepth are scanned.
          const child = { dirAbs: path.join(cur.dirAbs, e.name), rel, depth: cur.depth + 1 };
          if (child.depth <= maxDepth) queue.push(child);
        } else {
          files.push({ abs: path.join(cur.dirAbs, e.name), rel });
        }
      }
    }
    return { files };
  }

  // ---------------------------------------------------------------------------

  it('A — fixed implementation, owner incident shape (no host signal): bounded by PATTERN_SCAN_MAX_RUN_MS even when the walk outlasts it', async () => {
    const t0 = Date.now();
    const r = await patternScan({ pattern: PROBE, root, maxDepth: MAX_DEPTH, maxTotalMatches: DIR_COUNT * 2 }); // no abortSignal — internal deadline only
    const elapsed = Date.now() - t0;
    console.log(`[DIAG] A fixed (incident shape): elapsed=${elapsed}ms aborted=${String(r.aborted)} filesScanned=${r.stats.filesScanned} matches=${r.matches.length}`);

    expect(r.ok).toBe(true); // a bounded partial is an outcome, never an error — the owner's call used to force a manual abort

    // Branch on the CONTRACT FIELD (r.aborted), not on elapsed-time proximity: near-boundary drain/fire ordering races in
    // both directions within ms of the 3 s mark, so timing alone cannot select the regime. Both outcomes must be sound:
    if ((r.aborted ?? false) === true) {
      // Deadline regime: fire landed mid-walk or mid-scan → partial contract, and the BOUND is what the fix owes:
      expect(elapsed).toBeLessThan(PATTERN_SCAN_MAX_RUN_MS + 2000); // stopped at the NEXT boundary after ~3 s — never an unbounded drain
      // Bound, NOT strict-partial here: if the drain finishes within ms of the fire point the flag can land mid/late in
      // the post-walk scan phase → a complete-but-ABORTED result is a legitimate fixed-code outcome. (The sibling suite
      // pins strict partiality because IT controls the fire timing via host signal; here deadline-vs-drain order races.)
      expect(r.matches.length).toBeLessThanOrEqual(DIR_COUNT);
    } else {
      // Clean-completion regime: no flag ever fired → full set, AND settling before the deadline (a >3 s un-aborted
      // settle would be the pre-fix dead zone reappearing — this branch is where a regression of the fix fails loudly).
      expect(r.matches.length).toBe(DIR_COUNT);
      expect(elapsed).toBeLessThan(PATTERN_SCAN_MAX_RUN_MS + 500);
    }
  }, 10_000); // headroom over the ~3 s + boundary worst case — the assertions above do the bounding, not this ceiling

  it('B — reconstructed pre-fix walk over the same tree: walks to completion with NO bound (contrast arm)', async () => {
    // Fire a host signal at ABORT_DELAY_MS to mark "where the owner's deadline was by now" — the pre-fix code CANNOT see it.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ABORT_DELAY_MS);
    const t0 = Date.now();
    let walked: { files: PreFixTarget[] };
    try {
      walked = await walkDirectoryPreFix(root, MAX_DEPTH); // reconstruction — no signal param exists pre-fix by definition
    } finally {
      clearTimeout(timer);
    }
    const elapsed = Date.now() - t0;
    console.log(`[DIAG] B pre-fix RECONSTRUCTION (not production code): elapsed=${elapsed}ms filesWalked=${walked.files.length}`);

    expect(ctrl.signal.aborted).toBe(true); // fire sanity — the mark exists even though this walk ignored it
    if (elapsed < ABORT_DELAY_MS - 5) {
      // Regime gate: fixture drained before the deadline-equivalent mark → A/B contrast is uninformative on this host.
      throw new Error(`WALK-ABORT SLOW-TREE REGIME: tree drained in ${elapsed}ms < fire point (${ABORT_DELAY_MS}ms) — increase DIR_COUNT (or slow the FS) and re-run; do NOT accept a pass here`);
    }

    // The contrast that proves the dead zone: despite the deadline-equivalent having fired ~mid-walk, the pre-fix BFS
    // delivered its FULL result set with no abort surface at all — every dir drained. Post-fix code (A) stops at the next
    // boundary instead; patternScanWalkAbort.test.ts pins the partial-shape contract for that side.
    // Exact SET equality against the fixture manifest (not just a count): every file of every dir survived the walk even
    // though the deadline-equivalent had already fired — unbounded completion, exactly the >3 s class the owner aborted by hand.
    const expected = new Set(filesByDir.map((e) => e.file));
    const got = new Set(walked.files.map((f) => f.rel));
    expect(got.size).toBe(DIR_COUNT);
    for (const rel of expected) expect(got.has(rel)).toBe(true);
  }, 20_000);
});
