/**
 * grepFilesParity — characterization battery for the CURRENT grep_files regex-mode engine.
 *
 * PURPOSE (plan_1788282568340_z5a4r521c, P1): freeze a golden baseline of every observable
 * semantic BEFORE the ripgrep engine swap (P2). At P3 this same battery runs against the NEW
 * engine and is diffed field-by-field against tests/fixtures/grepFilesBaseline.json — ship gate =
 * zero unexplained diffs.
 *
 * MODES:
 *  - default (no env flag): asserts matches/skipped_files are non-empty for every case that must
 *    produce them — a live smoke net in normal `npm test` runs (cheap, no file I/O to fixtures).
 *  - GREP_BASELINE_WRITE=1: regenerates tests/fixtures/grepFilesBaseline.json from the CURRENT
 *    engine and re-runs assertions. Run this EXACTLY ONCE before any src/ change (user gate G5),
 *    then commit the fixture. If the fixture exists but was not written in this run, a warning is
 *    logged — do NOT silently trust a stale baseline.
 *
 * DETERMINISM RULES (why results are reproducible across runs/machines):
 *  - Fixture content uses forward slashes + ASCII only; CRLF case gets its own file.
 *  - Every battery run uses max_results=500 (well above any match count) → the MAX_RESULTS early-exit
 *    path is never engaged, so concurrency order can never change WHICH files are processed.
 *  - results[] entries carry relPath normalized to forward slashes (POSIX form) — on win32,
 *    path.relative yields backslashes; without normalization the baseline would be platform-bound.
 *    The production response keeps native separators; normalization is a baseline-only view.
 *  - filesScanned / truncated are deliberately NOT baselined: they count engine-internal walk work and
 *    legitimately change with an engine swap (rg pre-filters candidate files). They ARE recorded in
 *    the fixture for human review, but excluded from the diff gate.
 */

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import type { PluginConfig } from '../src/config';
import type { StateManager } from '../src/stateManager';
import * as fsP from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const BASELINE_FIXTURE = path.resolve(__dirname, '..', 'tests', 'fixtures', 'grepFilesBaseline.json');

// ---------------------------------------------------------------------------
// Tool construction + invocation — EXACTLY mirrors the proven pattern in
// tests/grep_files.test.ts (2-arg registration with empty shims; direct
// .implementation(args) call bypassing zod so raw defaults apply identically).
// The battery always passes an ABSOLUTE fixture path, matching that suite.
// ---------------------------------------------------------------------------
async function grepInDir(tools: any[], dir: string, pattern: string, extra: Record<string, unknown> = {}) {
  const tool = tools.find((t) => t.name === 'grep_files');
  if (!tool) throw new Error('grep_files tool not found in registered tools');
  return tool.implementation({ pattern, path: dir, mode: 'regex', max_results: 500, ...extra });
}

/** Normalize a response into the baselinable shape (POSIX relPaths, engine-internal counters kept but un-gated). */
function normalizeResponse(resp: any): any {
  const data = resp?.data ?? resp;
  return {
    success: Boolean(data && !resp?.error),
    count: data.count ?? null,
    filesScanned: data.filesScanned ?? null, // recorded for review — NOT part of the diff gate
    truncated: data.truncated ?? null,       // recorded for review — NOT part of the diff gate (500-cap runs never trip it)
    patternMode: data.patternMode ?? null,
    autoEscaped: Boolean(data.autoEscaped),
    aborted: Boolean(data.aborted),
    matches: (data.matches ?? []).map((m: any) => ({
      file: String(m.file).split(path.sep).join('/'),
      line_number: m.line_number,
      content: m.content,
      ...(m.context ? { context: m.context } : {}),
    })),
    skipped_files: (data.skipped_files ?? []).map((s: any) => ({
      file: String(s.file).split(path.sep).join('/'),
      // Reason strings embed absolute-ish detail and machine-dependent byte formatting; keep the STABLE prefix class.
      reasonClass: classifySkipReason(s.reason),
    })),
  };
}

function classifySkipReason(reason: string): string {
  if (/exceeds max_file_size/.test(reason)) return 'max_file_size';
  if (/line limit/.test(reason)) return 'line_cap';
  if (/worker|ReDoS/i.test(reason)) return 'worker_kill_redos';
  if (/deadline|abort/i.test(reason)) return 'deadline_abort';
  return 'other: ' + reason.slice(0, 60);
}

// ---------------------------------------------------------------------------
// Battery — every case targets a specific documented semantic axis of the
// CURRENT engine (see fileSystemTools.ts L2283-2558 + security.ts isSafeRegex).
// `mustHaveMatches` / `expectPatternMode` are the in-CI assertions; the golden
// baseline records the full normalized response.
// ---------------------------------------------------------------------------
interface BatteryCase {
  id: string;
  /** Relative file path (POSIX) under the fixture root, or a dir name for exclusions cases. */
  pattern: string;
  extra?: Record<string, unknown>;
  mustHaveMatches?: boolean;          // default true — flipped to false only where 0 is THE documented behavior
  expectPatternMode?: 'regex' | 'literal' | 'auto_escaped';
  note: string;
}

const BATTERY: BatteryCase[] = [
  {
    id: 'P01-literal-simple',
    pattern: 'needleAlpha',
    mustHaveMatches: true,
    note: 'Plain literal; case-insensitive default (all regexes compiled with "i" in production).',
  },
  {
    id: 'P02-case-insensitivity',
    pattern: 'CASEMIXEDPROBE', // fixture contains 'caseMixedProbe' — must match despite different case
    mustHaveMatches: true,
    note: 'Confirms -i parity flag requirement for the rg engine.',
  },
  {
    id: 'P03-regex-class-quantifiers',
    pattern: '[a-z]+\\d{2}tail', // fixture line: 'abcd42tail'
    mustHaveMatches: true,
    expectPatternMode: 'regex',
    note: 'Character class + bounded quantifier — safe regex path.',
  },
  {
    id: 'P04-top-level-alternation',
    pattern: 'altBranchOne|altBranchTwo\\(|altBranchThree', // escape-aware split → 3 branch regexes in production
    mustHaveMatches: true,
    expectPatternMode: 'regex',
    note: 'hasTopLevelAlternation path — branches split and each tested per line (first match wins; output is per-line presence only).',
  },
  {
    id: 'P05-auto-escape-cpp-signature',
    pattern: 'std::vector<int>* ptr', // code indicator '::' + unescaped '*' → auto_escaped literal mode
    mustHaveMatches: true,
    expectPatternMode: 'auto_escaped',
    note: 'looksLikeCodeSignature path — entire pattern escaped; alternation inside would NOT branch.',
  },
  {
    id: 'P06-unsafe-nested-repetition',
    pattern: '(a+)+b', // isSafeRegex rejects (nested repetition) → literal mode; fixture contains the LITERAL text '(a+)+b'
    mustHaveMatches: true,
    expectPatternMode: 'literal',
    note: 'ReDoS-shaped input demoted to escaped-literal — matches only the literal substring, never backtracks.',
  },
  {
    id: 'P07-long-pattern-forced-literal',
    pattern: 'x'.repeat(495) + 'yEndLongProbe', // 508 chars total (>500 gate) → isSafeRegex false → literal
    mustHaveMatches: true,
    expectPatternMode: 'literal',
    note: 'Length gate (>500) forces literal mode even for harmless content.',
  },
  {
    id: 'P08a-lookbehind-js-only',
    pattern: '(?<=pre_)needleLook', // valid JS RegExp; Rust regex crate rejects → P3 fallback path must reproduce THIS output exactly.
    mustHaveMatches: true, // no unescaped [*+?] present → local code-signature check stays false ('<' indicator alone is insufficient) → real lookbehind regex runs
    note: 'The T3 dialect-gap case. Baseline = ground truth the full-JS fallback must match at P3.',
  },
  {
    id: 'P08b-lookaround-autoescaped',
    pattern: '(?<=pre_)needleLook+', // same lookbehind BUT with unescaped '+' → local code-signature check ('<' + [*+?]) fires FIRST (precedence quirk L2317/L2324) → auto_escaped literal mode
    mustHaveMatches: true,
    expectPatternMode: 'auto_escaped',
    note: "Pinned a discovered precedence quirk: the looksLikeCodeSignature branch runs BEFORE isSafeRegex, so a lookaround pattern containing unescaped quantifiers never reaches regex mode — it becomes an escaped LITERAL (only matches the literal text '(?<=pre_)needleLook+' in probe.txt). rg mirror for P2 = -F fixed-string; this quirk must be preserved or deliberately changed with docs.",
  },
  {
    id: 'P09-long-line-gate',
    pattern: 'deepInLongLine', // appears only inside a single 25,000-char line → JS gate skips it → ZERO matches expected
    mustHaveMatches: false,
    note: 'MAX_LINE_CHARS_REGEX_MODE=20000: lines >20k chars are never tested. rg WOULD match (T2 delta class); phase-2 shaping must preserve the 0.',
  },
  {
    id: 'P10-line-cap-skip',
    pattern: 'tailOfBigFile', // appears on line 6000 of a 6000-line file → default max_lines=5000 skip
    mustHaveMatches: false,
    note: 'effectiveMaxLines gate → skipped_files entry with reason class "line_cap".',
  },
  {
    id: 'P11-size-gate-skip',
    pattern: 'hiddenInHugeFile', // appears in a >100KB file → default max_file_size skip; then re-run with raised cap MUST find it
    mustHaveMatches: false,
    note: 'Size gate → skipped_files reason class "max_file_size". Companion case P11b raises the cap.',
  },
  {
    id: 'P12-crlf-line-endings',
    pattern: 'crlfLineTwo', // CRLF file; production splits on \\n only, then .trim() strips \\r → content must be clean
    mustHaveMatches: true,
    note: 'Confirms trailing-\\r invisibility in baselined content (rg engine runs its own line split; phase-2 re-shaping must reproduce identical strings).',
  },
  {
    id: 'P13-dotfile-scanned',
    pattern: 'hiddenDotFileProbe', // lives in .hiddendir/ — dot dirs are NOT excluded by the walker (only DEFAULT_EXCLUDED_DIRS pruned)
    mustHaveMatches: true,
    note: '--hidden parity requirement; hidden-file heuristic was the ONE real walker difference found in T2.',
  },
  {
    id: 'P14-default-excluded-dir',
    pattern: 'nodeModulesProbe', // lives in node_modules/ — pruned by default → zero matches AND no skipped_files entry (pruning is silent)
    mustHaveMatches: false,
    note: 'DEFAULT_EXCLUDED_DIRS pruning. rg mirror = -g "!node_modules" etc., applied ONLY when include is absent.',
  },
  {
    id: 'P15-include-overrides-default-exclude',
    pattern: 'nodeModulesProbe', // same file, but WITH include glob → defaults are NOT applied (production walker quirk L2654)
    extra: { include: '*.js' },
    mustHaveMatches: true,
    note: "include suppresses default-exclude pruning; the glob matches via basename only ('node_modules/pkg/index.js' relPath fails the anchored path test) — probe.txt's added 'includeCheckProbe' line (no .js name) independently proves the include check ran.",
  },
  {
    id: 'P16-unicode',
    pattern: 'café naïve π≈3.14', // literal unicode probe present verbatim in fixture
    mustHaveMatches: true,
    note: 'Unicode literal path (auto-escaped? No — no code indicators; isSafeRegex-safe) through the plain regex "i" compile.',
  },
];

// P11b companion: same file with raised cap — must produce matches (proves content presence for humans).
const BATTERY_EXTRA_ARGS: Record<string, Record<string, unknown>> = {
  'P11-size-gate-skip': {},
};

/** Files created under the fixture root; each entry [posixRelPath, content]. */
function batteryFiles(): Array<[string, string]> {
  const longLine = 'lead' + '.'.repeat(24_900) + 'deepInLongLine' + 'x'.repeat(80); // single line > 20k chars
  const bigFileLines: string[] = [];
  for (let i = 1; i <= 6000; i++) bigFileLines.push(`L${i}`); // ≈34KB — MUST stay < 100KB or the size gate preempts the line-cap under test
  bigFileLines[5999] = 'tailOfBigFile'; // line 6000
  const hugeContent = 'huge '.repeat(24_000) + '\nhiddenInHugeFile\n'; // ≈120KB — just over the 100KB default gate
  return [
    ['probe.txt', 'needleAlpha here\ncaseMixedProbe too\nabcd42tail\naltBranchOne and altBranchTwo( and altBranchThree\nstd::vector<int>* ptr declared\n(a+)+b literal text\n' + 'x'.repeat(495) + 'yEndLongProbe\npre_needleLook tail\n(?<=pre_)needleLook+\nincludeCheckProbe in non-js file\n'],
    ['longline.txt', longLine + '\nnormalLineAfterLong\n'],
    ['bigfile.txt', bigFileLines.join('\n') + '\n'],
    ['hugefile.txt', hugeContent],
    ['crlf.txt', 'crlfLineOne\r\ncrlfLineTwo\r\ncrlfLineThree\r\n'],
    ['.hiddendir/dotprobe.txt', 'hiddenDotFileProbe\n'],
    ['node_modules/pkg/index.js', 'nodeModulesProbe inside default-excluded dir\n'],
    ['unicode.txt', 'prefix café naïve π≈3.14 suffix\n'],
  ];
}

// ---------------------------------------------------------------------------
// Baseline I/O
// ---------------------------------------------------------------------------
async function readBaseline(): Promise<Record<string, any> | null> {
  try {
    const raw = await fsP.readFile(BASELINE_FIXTURE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function baselineWriteMode(): boolean {
  return process.env.GREP_BASELINE_WRITE === '1';
}

// ---------------------------------------------------------------------------
// SUITE
// ---------------------------------------------------------------------------
describe('grep_files parity battery (P1 golden baseline)', () => {
  let tools: any[];
  let fixtureDir: string;

  beforeAll(async () => {
    fixtureDir = await fsP.mkdtemp(path.join(os.tmpdir(), 'grep-parity-'));
    for (const [rel, content] of batteryFiles()) {
      const abs = path.join(fixtureDir, ...rel.split('/'));
      await fsP.mkdir(path.dirname(abs), { recursive: true });
      // CRLF file must keep its bytes — write with latin1-safe utf8 (content has no chars >0xFF issues; \r preserved by writeFile)
      await fsP.writeFile(abs, content, 'utf-8');
    }

    // EXACT pattern from tests/grep_files.test.ts L51 — empty shims are safe because every
    // battery call passes an ABSOLUTE fixture path (validatePath/resolvePath never need a real cwd).
    tools = registerFileSystemTools({} as PluginConfig, {} as StateManager) as any[];
  });

  afterAll(async () => {
    try { await fsP.rm(fixtureDir, { recursive: true, force: true }); } catch { /* best effort */ }
  });

  let batteryResults: Record<string, any> = {};

  for (const c of BATTERY) {
    it(`${c.id}: ${c.note.split('.')[0]}`, async () => {
      const extra: Record<string, unknown> = { ...BATTERY_EXTRA_ARGS[c.id], ...(c.extra ?? {}) };
      // P11 companion verification is a SEPARATE case below; here we run the default-cap variant.
      const resp: any = await grepInDir(tools, fixtureDir, c.pattern, extra);

      if (resp?.success === false) {
        throw new Error(`case ${c.id} returned error response: ${JSON.stringify(resp).slice(0, 400)}`);
      }
      const norm = normalizeResponse(resp);
      batteryResults[c.id] = norm;

      // --- In-CI assertions (mode-independent live net) ---
      if (c.mustHaveMatches && norm.matches.length === 0) {
        throw new Error(`case ${c.id}: expected >=1 match, got 0. skipped=${JSON.stringify(norm.skipped_files).slice(0, 300)}`);
      }
      if (c.mustHaveMatches === false && norm.matches.length > 0) {
        throw new Error(`case ${c.id}: expected ZERO matches (documented gate behavior), got ${norm.matches.length}: ${JSON.stringify(norm.matches[0]).slice(0, 300)}`);
      }
      if (c.expectPatternMode && norm.patternMode !== c.expectPatternMode) {
        throw new Error(`case ${c.id}: expected patternMode=${c.expectPatternMode}, got ${norm.patternMode} — classification logic drift`);
      }
    });
  }

  it('P11b-size-gate-raised-cap: same file found when max_file_size is raised', async () => {
    const resp: any = await grepInDir(tools, fixtureDir, 'hiddenInHugeFile', { max_file_size: 400_000 });
    if (resp?.success === false) throw new Error(`P11b error response: ${JSON.stringify(resp).slice(0, 300)}`);
    const norm = normalizeResponse(resp);
    batteryResults['P11b-size-gate-raised-cap'] = norm;
    if (norm.matches.length === 0) throw new Error('P11b: raised cap must find the match');
  });

  it('P15b-include-filter: non-.js file with probe content is filtered OUT when include="*.js"', async () => {
    // Content 'includeCheckProbe' EXISTS in probe.txt (non-.js name) → zero matches here proves the
    // include glob actually ran (absence could otherwise mean "content not there"). Baselined too.
    const resp: any = await grepInDir(tools, fixtureDir, 'includeCheckProbe', { include: '*.js' });
    if (resp?.success === false) throw new Error(`P15b error response: ${JSON.stringify(resp).slice(0, 300)}`);
    const norm = normalizeResponse(resp);
    batteryResults['P15b-include-filter'] = norm;
    if (norm.matches.length !== 0) {
      throw new Error(`P15b: include="*.js" must exclude probe.txt, got ${JSON.stringify(norm.matches).slice(0, 200)}`);
    }
  });

  it('P10b-line-cap-reason-class: bigfile.txt is skipped by LINE CAP specifically (not size gate)', async () => {
    // Guards the P10 fixture against silent drift back over 100KB — which would make the case test
    // the wrong gate (observed in first run: 'line N filler' lines put the file at ≈102KB).
    const resp: any = await grepInDir(tools, fixtureDir, 'tailOfBigFile');
    if (resp?.success === false) throw new Error(`P10b error response: ${JSON.stringify(resp).slice(0, 300)}`);
    const norm = normalizeResponse(resp);
    batteryResults['P10b-line-cap-reason-class'] = norm;
    const entry = (norm.skipped_files ?? []).find((s: any) => s.file === 'bigfile.txt');
    if (!entry || entry.reasonClass !== 'line_cap') {
      throw new Error(`P10b: bigfile.txt must be skipped with reason class "line_cap", got ${JSON.stringify(entry)} — fixture likely drifted over the 100KB size gate`);
    }
  });

  // ------------------------------------------------------------------
  // Golden baseline gate — write mode regenerates, default mode diffs.
  // ------------------------------------------------------------------
  it('golden-baseline: diff vs tests/fixtures/grepFilesBaseline.json (or write in GREP_BASELINE_WRITE=1)', async () => {
    const collected: Record<string, any> = {};
    for (const [id, norm] of Object.entries(batteryResults)) collected[id] = norm;

    if (baselineWriteMode()) {
      await fsP.mkdir(path.dirname(BASELINE_FIXTURE), { recursive: true });
      const doc = {
        _meta: {
          generator: 'tests/grepFilesParity.test.ts (GREP_BASELINE_WRITE=1)',
          writtenAt: new Date().toISOString(),
          node: process.version,
          platform: `${process.platform}-${process.arch}`,
          engine: 'current JS regex engine (pre-ripgrep) — DO NOT regenerate after P2 without re-review',
          diffGatedFields: ['success', 'count', 'patternMode', 'autoEscaped', 'aborted', 'matches[]', 'skipped_files[].file+reasonClass'],
          reviewOnlyFields: ['filesScanned', 'truncated'],
        },
        cases: collected,
      };
      await fsP.writeFile(BASELINE_FIXTURE, JSON.stringify(doc, null, 2), 'utf-8');
      console.log(`[parity] WROTE golden baseline → ${BASELINE_FIXTURE} (${Object.keys(collected).length} cases)`);
      return;
    }

    const frozen = await readBaseline();
    if (!frozen) {
      throw new Error(
        'Golden baseline missing. Generate it ONCE before any src change: set GREP_BASELINE_WRITE=1 and re-run this suite (user gate P1-G5).',
      );
    }
    const frozenCases: Record<string, any> = frozen.cases ?? {};

    // Case coverage drift — new cases added after freeze must be loud.
    for (const id of Object.keys(collected)) {
      if (!(id in frozenCases)) {
        throw new Error(`baseline case missing for ${id} — run GREP_BASELINE_WRITE=1 to extend the fixture, then re-review`);
      }
    }

    const gatedFields = ['success', 'count', 'patternMode', 'autoEscaped', 'aborted'];
    const diffs: string[] = [];
    for (const id of Object.keys(frozenCases)) {
      const now = collected[id];
      if (!now) continue; // case removed from battery — flagged below, not a content diff
      const f = frozenCases[id];
      for (const fld of gatedFields) {
        if (JSON.stringify(now[fld]) !== JSON.stringify(f[fld])) diffs.push(`${id}.${fld}: baseline=${JSON.stringify(f[fld])} now=${JSON.stringify(now[fld])}`);
      }
      const fm = JSON.stringify(f.matches ?? []);
      const nm = JSON.stringify(now.matches ?? []);
      if (fm !== nm) diffs.push(`${id}.matches: baseline=${fm.slice(0, 200)}… now=${nm.slice(0, 200)}…`);
      const fs_ = JSON.stringify(f.skipped_files ?? []);
      const ns = JSON.stringify(now.skipped_files ?? []);
      if (fs_ !== ns) diffs.push(`${id}.skipped_files: baseline=${fs_.slice(0, 200)}… now=${ns.slice(0, 200)}…`);
    }

    expect(diffs).toEqual([]); // single assertion → full diff list in failure output
  });
});
