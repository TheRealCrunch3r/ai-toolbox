#!/usr/bin/env node
/**
 * rg_spike.mjs — ripgrep integration feasibility spike (STANDALONE; zero src/ changes)
 *
 * Purpose: answer the four unknowns BEFORE any ripgrep-backed engine enters src/:
 *   T1  Boot    — does the WASM build start on this host's Node? cold vs warm call cost.
 *   T2  Filter  — rg -l candidate-file list vs a JS walk that mirrors our current walker
 *                 (no gitignore, fixed exclude dirs). Deltas = parity risk.
 *   T3  Dialect — does the Rust-incompatible-pattern probe behave as our fallback trigger?
 *   T4  Speed   — wall-clock: rg filter phase vs full-JS scan over the same tree + pattern.
 *
 * Prereq (user env, NOT this sandbox):  npm i -D ripgrep@0.3.1
 * Run:                                   node scripts/rg_spike.mjs [rootDir]
 * Exit codes: 0 = all probes executed (deltas are DATA, not failure), 2 = package missing/boot failed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : REPO_ROOT;

// Mirrors pattern_scan's DEFAULT_EXCLUDE_DIRS (src/tools/patternScan.ts) — our walker semantics.
const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt',
  '__pycache__', '.venv', 'coverage', '.ai_toolbox_backups',
]);

// Path normalization for cross-format comparison: rg prints paths with forward slashes and
// relative/absolute forms that differ from our native path.join output (mixed slashes on win32).
const normAbs = (p) => { const a = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p); return a.split(path.sep).join('/'); };

// rg flag set mirroring OUR walker: no gitignore (scan everything), but hidden (dot-)paths ARE scanned —
// our walkers prune only the EXCLUDE_DIRS list, so --hidden is required for parity.
const RG_WALK_FLAGS = ['--no-ignore', '--no-require-git', '--hidden', '--color=never'];

const PATTERN = process.env.RG_SPIKE_PATTERN || 'grep_files'; // exists in this repo; low match count, high signal
const INCOMPATIBLE_PROBE = '(?<=foo)bar'; // lookbehind — valid JS RegExp, unsupported by Rust regex crate (no lookarounds by default)

let failures = 0;
function section(title) { console.log(`\n${'='.repeat(64)}\n${title}\n${'='.repeat(64)}`); }
function note(label, value) { console.log(`  ${label.padEnd(28)} ${value}`); }

// ---------------------------------------------------------------------------
// T1 — boot / version / cold vs warm timing
// ---------------------------------------------------------------------------
async function loadRipgrep() {
  try {
    const mod = await import('ripgrep');
    if (typeof mod.ripgrep !== 'function') throw new Error(`module loaded but no "ripgrep" export (got: ${Object.keys(mod).join(',')})`);
    return mod;
  } catch (err) {
    console.error(`[T1] FAIL — could not import 'ripgrep': ${err.message}`);
    console.error('      Fix: run `npm i -D ripgrep@0.3.1` in the project root, then re-run this spike.');
    process.exit(2);
  }
}

function jsWalk(dirAbs, maxDepth = 10) {
  // Mirrors our BFS walker semantics: fixed exclude dirs pruned whole, depth-bounded, files only.
  const out = [];
  const queue = [{ abs: dirAbs, rel: '', depth: 0 }];
  while (queue.length) {
    const cur = queue.shift();
    let entries;
    try { entries = fs.readdirSync(cur.abs, { withFileTypes: true }); } catch { continue; }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      const p = path.join(cur.abs, e.name);
      let isDir = e.isDirectory(), isFile = e.isFile();
      if (!isDir && !isFile && e.isSymbolicLink()) {
        try { const st = fs.statSync(p); isDir = st.isDirectory(); isFile = st.isFile(); } catch { continue; }
      }
      if (isDir) { if (cur.depth + 1 <= maxDepth) queue.push({ abs: p, rel: `${cur.rel ? cur.rel + '/' : ''}${e.name}`, depth: cur.depth + 1 }); }
      else if (isFile) out.push(p);
    }
  }
  return out;
}

function jsScanFiles(files, patternRx) {
  // Mirrors the grep_files regex-mode core: read file, split lines, test per line. Returns matching files + match count.
  const matched = new Set();
  let total = 0;
  for (const f of files) {
    let buf, content;
    try { buf = fs.readFileSync(f); } catch { continue; }
    // Byte-exact NUL binary gate — mirrors the production walker's Buffer.subarray(0,8192) check.
    // (A string-slice + latin1 approximation is WRONG: Node's latin1 encoder writes charCode & 0xFF,
    //  so chars like U+0100 fabricate NUL bytes that don't exist on disk — proven in P0 analysis.)
    if (buf.subarray(0, Math.min(buf.length, 8192)).includes(0)) continue;
    content = buf.toString('utf-8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > 20000) continue; // MAX_LINE_CHARS_REGEX_MODE parity
      if (patternRx.test(lines[i])) { matched.add(f); total++; }
    }
  }
  return { matched, total };
}

const mod = await loadRipgrep();
const { ripgrep } = mod;

section('T1 — BOOT: node:wasi availability + cold/warm call cost');
note('node version', process.version);
note('platform', `${process.platform}/${process.arch}`);
{
  const t0 = performance.now();
  const v1 = await ripgrep(['--version'], { buffer: true });
  const coldMs = performance.now() - t0;
  note('cold call (decode+inflate+compile)', `${v1.code} in ${coldMs.toFixed(1)} ms`);
  note('version output', v1.stdout.trim().split('\n')[0] || '(empty)');
  const t1 = performance.now();
  await ripgrep(['--version'], { buffer: true });
  note('warm call (memoized module)', `${(performance.now() - t1).toFixed(1)} ms`);
}

section(`T2 — FILTER PARITY: rg -l vs JS walk over ${ROOT}`);
{
  const jsFiles = jsWalk(ROOT);
  note('JS-walk candidate files', String(jsFiles.length));

  // Flag set = our walker semantics (see RG_WALK_FLAGS): no gitignore, dot-paths scanned (--hidden),
  // EXCLUDE_DIRS pruned by explicit globs.
  const t0 = performance.now();
  const rg = await ripgrep([
    '-l', '--max-count', '1', ...RG_WALK_FLAGS,
    ...[...EXCLUDE_DIRS].flatMap((d) => ['-g', `!${d}`]),
    PATTERN, ROOT,
  ], { buffer: true });
  const rgMs = performance.now() - t0;
  note('rg exit code', `${rg.code} (0=matches,1=none,2=error)`);
  if (rg.stderr) note('rg stderr', rg.stderr.trim().split('\n').slice(0, 5).join(' | '));

  const rgFiles = new Set(rg.stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
  note('rg files-with-matches', String(rgFiles.size));
  note('rg phase duration', `${rgMs.toFixed(1)} ms`);

  // Ground truth: JS-scan those same candidate files for the pattern (case-insensitive, like grep_files' 'i')
  const t2 = performance.now();
  const jsTruth = jsScanFiles(jsFiles, new RegExp(PATTERN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  note('JS truth: files with match', `${jsTruth.matched.size} (in ${((performance.now() - t2) / 1000).toFixed(2)} s for full scan)`);

  // Compare on normalized absolute paths (rg prints mixed/forward slashes; we print native).
  const rgNormSet = new Set([...rgFiles].map(normAbs));
  const jsNormSet = new Set([...jsTruth.matched].map(normAbs)); // matched is a Set — spread first
  const inRgNotJs = [...rgNormSet].filter((f) => !jsNormSet.has(f)).sort();
  const inJsNotRg = [...jsNormSet].filter((f) => !rgNormSet.has(f)).sort();
  note('delta: rg-only files', String(inRgNotJs.length));
  for (const f of inRgNotJs.slice(0, 8)) console.log(`        + ${f}`);
  note('delta: JS-only files', String(inJsNotRg.length));
  for (const f of inJsNotRg.slice(0, 8)) console.log(`        - ${f}`);

  if (inRgNotJs.length || inJsNotRg.length) {
    failures++;
    console.log('  !! NON-EMPTY DELTA — inspect before GO: likely causes = gitignore/preopen/symlink/binary-gate semantics. This is DATA, not a crash.');
  } else {
    note('parity', 'EXACT — file sets identical');
  }
}

section('T3 — DIALECT PROBE: Rust-incompatible pattern must exit 2 (fallback trigger)');
{
  const t0 = performance.now();
  const probe = await ripgrep(['-l', '--color=never', INCOMPATIBLE_PROBE, ROOT], { buffer: true });
  note('probe pattern', INCOMPATIBLE_PROBE);
  note('exit code', `${probe.code} in ${(performance.now() - t0).toFixed(1)} ms`);
  note('stderr (first line)', probe.stderr.trim().split('\n')[0] || '(none)');
  if (probe.code === 2 && /regex|parse/i.test(probe.stderr)) {
    note('verdict', 'PASS — exit 2 + parse error; this is exactly the JS-fallback trigger condition');
  } else {
    failures++;
    note('verdict', 'UNEXPECTED — fallback design assumes code 2 on dialect mismatch; re-evaluate detection strategy');
  }
}

section(`T4 — SPEED: rg filter phase vs full-JS scan (same tree, pattern "${PATTERN}")`);
{
  const t0 = performance.now();
  await ripgrep(['-l', ...RG_WALK_FLAGS, ...[...EXCLUDE_DIRS].flatMap((d) => ['-g', `!${d}`]), PATTERN, ROOT], { buffer: true });
  const rgTotal = performance.now() - t0;

  const files = jsWalk(ROOT);
  const t1 = performance.now();
  const truth = jsScanFiles(files, new RegExp(PATTERN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  const jsTotal = performance.now() - t1;

  note('rg filter phase (warm)', `${(rgTotal / 1000).toFixed(2)} s`);
  note('full-JS scan (today\'s engine)', `${(jsTotal / 1000).toFixed(2)} s over ${files.length} files, ${truth.total} matches`);
  if (jsTotal > 50) {
    note('speedup factor', `${(jsTotal / Math.max(rgTotal, 1)).toFixed(1)}x on the filter phase alone (phase-2 shaping cost is additive but bounded to matched files only)`);
  } else {
    note('note', 'JS baseline under 50 ms — tree too small to show separation; re-run with a larger root for a meaningful number');
  }
}

section('VERDICT');
if (failures === 0) {
  console.log('  All four probes executed cleanly. Deltas above (if any) are semantic data for the design review — not failures.');
  console.log('  GO/no-GO decision items: (1) T2 delta causes, (2) gitignore semantics flag choice, (3) measured speedup worthiness.');
} else {
  console.log(`  ${failures} probe(s) did not behave as designed. Review the flagged sections above before any integration work.`);
}
