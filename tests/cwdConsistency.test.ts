/**
 * Regression suite for the CWD-consistency fix (ai_toolbox).
 *
 * Covers the defects fixed in this change:
 * 1. Tool-level CWD never actually switched on project detection
 *    (Step 0.7 only called process.chdir; persistent state untouched) → applyProjectCwdSwitch
 * 2. Registry loader dead in installed envs (no legacy .session_index.json fallback,
 *    re-read per candidate word) → listRegisteredProjects / detectProjectKeyword
 * 3. PlanStorageManager captured CWD once at construction → per-call resolution tests
 * 4. Startup restore of last-active project → restoreLastActiveProjectCwd
 *
 * Conventions (see workingDir.test.ts): resetWorkingDir() in afterEach to clear the
 * persisted state file; process.cwd() restored after chdir-based tests.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
  getWorkingDir,
  setWorkingDir,
  resetWorkingDir,
  listRegisteredProjects,
  restoreLastActiveProjectCwd,
} from '../src/workingDir';
import { detectProjectKeyword, applyProjectCwdSwitch, normalizeConfirmationReply, decideProjectSwitch } from '../src/promptPreprocessor';
import { registerTaskPlanningTools } from '../src/tools/taskPlanningTools';
import { DEFAULT_CONFIG } from '../src/config';

// ==================== Helpers & Fixtures ====================

/** Repo root (tests/..). The working-dir state file lives at <root>/.ai_toolbox_state.json. */
const REPO_ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(REPO_ROOT, '.ai_toolbox_state.json');
// PlanStorageManager syncs every save() to the plugin root (src/ in jest, dist/ when built).
const PLUGIN_ROOT_PLAN_FILE = path.join(REPO_ROOT, 'src', '.session_context', '.ai_toolbox_plans.json');

let tempRoot: string; // scratch base dir for registry fixtures + fake project dirs

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/** Write a primary registry file (ProjectRegistryManager format) into baseDir. */
function writeRegistry(baseDir: string, projects: Array<{ name: string; path: string; lastAccessed?: number }>): void {
  writeJson(path.join(baseDir, '.session_context', 'project_registry.json'), { version: 1, projects });
}

/** Write a legacy session index file (StateManager format) into baseDir. */
function writeSessionIndex(baseDir: string, projects: Record<string, { path: string; last_session_saved?: number | null }>): void {
  writeJson(path.join(baseDir, '.session_index.json'), { version: 1, projects });
}

beforeAll(async () => {
  tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ai-toolbox-cwd-test-'));
});

afterAll(async () => {
  resetWorkingDir(); // clear persisted state (leaves file as {})
  if (fs.existsSync(tempRoot)) {
    await fs.promises.rm(tempRoot, { recursive: true, force: true });
  }
});

beforeEach(() => {
  resetWorkingDir(); // clears module cache + persisted state → deterministic start
});

afterEach(() => {
  resetWorkingDir(); // established convention — never leak CWD state between tests
});

// ==================== listRegisteredProjects ====================

describe('listRegisteredProjects', () => {
  test('reads primary project_registry.json (ProjectRegistryManager format)', () => {
    const base = path.join(tempRoot, 'primary-only');
    const projA = path.join(base, 'proj-a');
    writeRegistry(base, [
      { name: 'alpha', path: projA, lastAccessed: 100 },
      { name: 'beta', path: path.join(base, 'proj-b'), lastAccessed: 200 },
    ]);

    const projects = listRegisteredProjects(base);
    expect(projects).toHaveLength(2);
    expect(projects.map(p => p.name)).toEqual(['alpha', 'beta']);
    expect(projects[0].path).toBe(path.resolve(projA));
    expect(projects[0].lastSeen).toBe(100);
  });

  test('falls back to legacy .session_index.json when registry is missing (installed-env fix)', () => {
    const base = path.join(tempRoot, 'legacy-only');
    writeSessionIndex(base, {
      gamma: { path: path.join(base, 'proj-g'), last_session_saved: 300 },
      delta: { path: path.join(base, 'proj-d') }, // no timestamp → lastSeen undefined
    });

    const projects = listRegisteredProjects(base);
    expect(projects).toHaveLength(2);
    const gamma = projects.find(p => p.name === 'gamma');
    expect(gamma?.lastSeen).toBe(300);
    const delta = projects.find(p => p.name === 'delta');
    expect(delta?.lastSeen).toBeUndefined();
  });

  test('merges both sources and dedupes by resolved path, keeping max timestamp', () => {
    const base = path.join(tempRoot, 'merged');
    const sharedDir = path.join(base, 'shared-project');
    writeRegistry(base, [
      { name: 'alpha', path: path.join(base, 'proj-a'), lastAccessed: 100 },
      // Same project as legacy entry below — same resolved path, OLDER timestamp
      { name: 'beta-registry-name', path: sharedDir, lastAccessed: 150 },
    ]);
    writeSessionIndex(base, {
      beta_legacy_name: { path: sharedDir, last_session_saved: 250 }, // NEWER timestamp wins
      gamma: { path: path.join(base, 'proj-g'), last_session_saved: 300 },
    });

    const projects = listRegisteredProjects(base);
    expect(projects).toHaveLength(3); // alpha + shared (deduped) + gamma

    const shared = projects.find(p => p.path === path.resolve(sharedDir));
    expect(shared).toBeDefined();
    expect(shared?.lastSeen).toBe(250); // max(150, 250) — most recent across sources wins
    // First-seen identity is kept (registry entry was added first)
    expect(shared?.name).toBe('beta-registry-name');
  });

  test('returns empty array when no state files exist', () => {
    const base = path.join(tempRoot, 'empty-base');
    fs.mkdirSync(base, { recursive: true });
    expect(listRegisteredProjects(base)).toEqual([]);
  });

  test('tolerates malformed JSON in both sources (no throw)', () => {
    const base = path.join(tempRoot, 'malformed');
    fs.mkdirSync(path.join(base, '.session_context'), { recursive: true });
    fs.writeFileSync(path.join(base, '.session_context', 'project_registry.json'), '{ not valid json');
    fs.writeFileSync(path.join(base, '.session_index.json'), 'also broken');
    expect(listRegisteredProjects(base)).toEqual([]);
  });

  test('skips entries missing name or path', () => {
    const base = path.join(tempRoot, 'partial-entries');
    // Implementation requires BOTH name and path to be strings; an entry missing its
    // path must be dropped while well-formed entries are kept.
    writeRegistry(base, [
      { name: 'good', path: path.join(base, 'proj-good') },
      // @ts-expect-error intentionally malformed entry (missing path) for robustness check
      { name: 'broken' },
    ]);

    const projects = listRegisteredProjects(base);
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe('good');
  });

  test('ignores non-object / array-shaped garbage in both sources', () => {
    const base = path.join(tempRoot, 'garbage-shapes');
    fs.mkdirSync(path.join(base, '.session_context'), { recursive: true });
    fs.writeFileSync(path.join(base, '.session_context', 'project_registry.json'), JSON.stringify({ projects: [null, 42, { name: null }] }));
    // Legacy "projects" as array (wrong shape) must be ignored by the object-only branch
    writeJson(path.join(base, '.session_index.json'), { projects: [{ path: '/should/be/ignored' }] });

    const projects = listRegisteredProjects(base);
    expect(projects).toEqual([]);
  });
});

// ==================== detectProjectKeyword (registry chain via pluginRoot) ====================

describe('detectProjectKeyword', () => {
  test('matches a single-word project name from the primary registry', () => {
    const base = path.join(tempRoot, 'kw-primary');
    writeRegistry(base, [{ name: 'ai_toolbox', path: path.join(base, 'proj') }]);

    const match = detectProjectKeyword('please switch to ai_toolbox now', { pluginRoot: base });
    expect(match).not.toBeNull();
    expect(match?.name).toBe('ai_toolbox');
    expect(match?.path).toBe(path.resolve(path.join(base, 'proj')));
  });

  test('matches via legacy .session_index.json fallback (was dead in installed envs)', () => {
    const base = path.join(tempRoot, 'kw-legacy');
    writeSessionIndex(base, { troglodyte: { path: path.join(base, 'trog'), last_session_saved: 1 } });

    const match = detectProjectKeyword('continue work on troglodyte', { pluginRoot: base });
    expect(match).not.toBeNull();
    expect(match?.name).toBe('troglodyte');
  });

  test('matches multi-word names (up to 3 consecutive words) and fuzzy separators', () => {
    const base = path.join(tempRoot, 'kw-multiword');
    // Registry name with hyphen; user writes it as separate words → variant match
    writeRegistry(base, [{ name: 'my-cool-project', path: path.join(base, 'mcp') }]);

    // NOTE: words must be consecutive — stopwords between name parts break the run.
    const match = detectProjectKeyword('work on my cool project now', { pluginRoot: base });
    expect(match).not.toBeNull();
    expect(match?.name).toBe('my-cool-project');
  });

  test('returns null when no registered name appears in the text', () => {
    const base = path.join(tempRoot, 'kw-nomatch');
    writeRegistry(base, [{ name: 'zzz_unregistered', path: '/nowhere' }]);

    expect(detectProjectKeyword('hello there friend', { pluginRoot: base })).toBeNull();
  });

  test('returns null when the registry is empty (no state files)', () => {
    const base = path.join(tempRoot, 'kw-empty');
    fs.mkdirSync(base, { recursive: true });
    expect(detectProjectKeyword('switch to ai_toolbox', { pluginRoot: base })).toBeNull();
  });

  test('returns null for empty/short input text', () => {
    const base = path.join(tempRoot, 'kw-short');
    writeRegistry(base, [{ name: 'ai_toolbox', path: '/x' }]);
    expect(detectProjectKeyword('', { pluginRoot: base })).toBeNull();
    expect(detectProjectKeyword('go it', { pluginRoot: base })).toBeNull(); // all words ≤ 2 chars or stopwords
  });
});

// ==================== applyProjectCwdSwitch (Step 0.7 canonical switch) ====================

describe('applyProjectCwdSwitch', () => {
  let projectDir: string;
  const originalCwd = process.cwd();

  beforeAll(() => {
    projectDir = path.join(tempRoot, 'switch-target');
    fs.mkdirSync(projectDir, { recursive: true });
  });

  afterEach(() => {
    // applyProjectCwdSwitch does a best-effort real chdir — always restore
    process.chdir(originalCwd);
  });

  test('persists the tool-level CWD (state file) AND chdirs the process', () => {
    const result = applyProjectCwdSwitch(projectDir);

    expect(result).toBe(true);
    // Canonical: persistent working-dir state updated for all getWorkingDir() consumers
    expect(getWorkingDir()).toBe(path.resolve(projectDir));
    // State file on disk reflects the switch (the original defect: it never changed)
    const persisted = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as { workingDir?: string };
    expect(persisted.workingDir).toBe(path.resolve(projectDir));
    // Best-effort raw process.cwd() consumers follow along
    expect(process.cwd()).toBe(path.resolve(projectDir));
  });

  test('returns false and leaves state untouched for a nonexistent path', () => {
    const before = getWorkingDir();
    const ghost = path.join(tempRoot, 'does-not-exist-xyz');

    const result = applyProjectCwdSwitch(ghost);

    expect(result).toBe(false);
    expect(getWorkingDir()).toBe(before);
  });

  test('returns false for a file path (not a directory)', () => {
    const filePath = path.join(tempRoot, 'switch-target', 'a-file.txt');
    fs.writeFileSync(filePath, 'x');

    const result = applyProjectCwdSwitch(filePath);

    expect(result).toBe(false);
  });
});

// ==================== restoreLastActiveProjectCwd (startup) ====================

describe('restoreLastActiveProjectCwd', () => {
  test('restores the most recently seen existing project when no valid persisted state exists', () => {
    const base = path.join(tempRoot, 'restore-most-recent');
    const olderDir = path.join(base, 'older-project');
    const newerDir = path.join(base, 'newer-project');
    fs.mkdirSync(olderDir, { recursive: true });
    fs.mkdirSync(newerDir, { recursive: true });

    writeRegistry(base, [
      { name: 'old_proj', path: olderDir, lastAccessed: 1_000 },
      { name: 'new_proj', path: newerDir, lastAccessed: 2_000 }, // most recent → wins
    ]);

    resetWorkingDir(); // ensure no valid persisted state (simulates fresh install / stale state)
    const result = restoreLastActiveProjectCwd(base);

    expect(result.restored).toBe(true);
    expect(result.project).toBe(path.resolve(newerDir));
    expect(getWorkingDir()).toBe(path.resolve(newerDir));
  });

  test('skips registered projects whose path no longer exists', () => {
    const base = path.join(tempRoot, 'restore-skip-dead');
    const liveDir = path.join(base, 'live-project');
    fs.mkdirSync(liveDir, { recursive: true });

    writeRegistry(base, [
      { name: 'dead_proj', path: path.join(base, 'deleted-project'), lastAccessed: 9_000 }, // newest but gone
      { name: 'live_proj', path: liveDir, lastAccessed: 1_000 },
    ]);

    resetWorkingDir();
    const result = restoreLastActiveProjectCwd(base);

    expect(result.restored).toBe(true);
    expect(result.project).toBe(path.resolve(liveDir)); // fell through to the next-most-recent live dir
  });

  test('is a no-op when valid persisted state already exists (idempotent guard)', () => {
    const base = path.join(tempRoot, 'restore-idempotent');
    const projDir = path.join(base, 'some-project');
    fs.mkdirSync(projDir, { recursive: true });
    writeRegistry(base, [{ name: 'some_proj', path: projDir, lastAccessed: 5_000 }]);

    const keepDir = path.join(tempRoot, 'keep-this-dir');
    fs.mkdirSync(keepDir, { recursive: true });
    setWorkingDir(keepDir); // valid persisted state exists now

    const result = restoreLastActiveProjectCwd(base);

    expect(result).toEqual({ restored: false });
    expect(getWorkingDir()).toBe(path.resolve(keepDir)); // unchanged — no clobbering of active session CWD
  });

  test('returns { restored: false } when no known project is usable', () => {
    const base = path.join(tempRoot, 'restore-none');
    fs.mkdirSync(base, { recursive: true }); // empty registry + index

    resetWorkingDir();
    expect(restoreLastActiveProjectCwd(base)).toEqual({ restored: false });
  });
});

// ==================== PlanStorageManager per-call CWD resolution (via tool API) ====================

describe('PlanStorageManager per-call working-dir resolution', () => {
  let dirA: string;
  let dirB: string;
    beforeAll(() => {
    dirA = path.join(tempRoot, 'plan-dir-a');
    dirB = path.join(tempRoot, 'plan-dir-b');
    fs.mkdirSync(dirA, { recursive: true });
    fs.mkdirSync(dirB, { recursive: true });
  });

  afterAll(() => {
    // save() syncs every plan to the plugin root. In jest runs that file is test residue by
    // definition — even if an EARLIER suite created it (the old pre-existed guard let such
    // residue survive full-suite runs → "stray src/.session_context" defect). Outside tests
    // (e.g. running this suite via ts-node in dev) the file may be a live dev-session plan, so leave it.
    if (process.env.NODE_ENV === 'test' && fs.existsSync(PLUGIN_ROOT_PLAN_FILE)) {
      fs.rmSync(PLUGIN_ROOT_PLAN_FILE);
      const dir = path.dirname(PLUGIN_ROOT_PLAN_FILE);
      // Only rmdir if empty — never destroy a .session_context that holds other content.
      try { fs.rmdirSync(dir); } catch { /* not empty — leave it */ }
    }
  });

  test('save() resolves CWD per call: create_plan after mid-session switch lands in the NEW dir', async () => {
    // Construct the storage manager while CWD = dirA (mirrors old construction-time capture)
    setWorkingDir(dirA);
    const tools = registerTaskPlanningTools(DEFAULT_CONFIG);
    const createPlan = tools.find(t => t.name === 'create_plan');
    expect(createPlan).toBeDefined();

    // Mid-session switch — the exact defect scenario: manager was constructed under dirA
    setWorkingDir(dirB);

    const result = (await createPlan?.implementation({ goal: 'Per-call resolution check', steps: ['step one'] })) as { success?: boolean; data?: { planId?: string } };
    expect(result.success).toBe(true);

    // Plan file MUST exist under dirB (current CWD at save time)…
    const planFileB = path.join(dirB, '.session_context', '.ai_toolbox_plans.json');
    expect(fs.existsSync(planFileB)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(planFileB, 'utf-8')) as { plans?: Record<string, unknown> };
    expect(Object.keys(saved.plans ?? {})).toHaveLength(1);

    // …and must NOT have been (re)created under dirA — proves no stale construction-time path
    const planFileA = path.join(dirA, '.session_context', '.ai_toolbox_plans.json');
    expect(fs.existsSync(planFileA)).toBe(false);
  });

  test('load() resolves CWD per call: get_plan after switch reads from the NEW dir', async () => {
    // Isolated fixture dir — save() syncs every plan to the plugin root, and load() falls back to it.
    // Reusing a dir that another test already saved into would leak that test's plans via the fallback.
    const freshDir = path.join(tempRoot, 'plan-dir-d');
    fs.mkdirSync(freshDir, { recursive: true });

    setWorkingDir(dirA); // construct under A (legacy behavior would pin everything to A)
    const tools = registerTaskPlanningTools(DEFAULT_CONFIG);
    const createPlan = tools.find(t => t.name === 'create_plan')!;
    const getPlan = tools.find(t => t.name === 'get_plan')!;

    setWorkingDir(freshDir); // mid-session switch to an empty dir

    const created = (await createPlan.implementation({ goal: 'Load resolution check', steps: ['x'] })) as { data?: { planId?: string } };
    expect(created.data?.planId).toBeDefined();

    // get_plan must see the plan from the CURRENT working dir (freshDir), not a stale A capture
    const got = (await getPlan.implementation({})) as { success?: boolean; data?: { goal?: string } | null };
    expect(got.success).toBe(true);
    expect(got.data?.goal).toBe('Load resolution check');

    // And the plan file physically lives in freshDir/.session_context, not dirA
    expect(fs.existsSync(path.join(freshDir, '.session_context', '.ai_toolbox_plans.json'))).toBe(true);
    expect(fs.existsSync(path.join(dirA, '.session_context', '.ai_toolbox_plans.json'))).toBe(false);
  });

  test('get_plan returns null when the current working dir has no plans (no plugin-root leakage in fresh state)', async () => {
    // Remove any residue from prior tests so this assertion is deterministic.
    if (fs.existsSync(PLUGIN_ROOT_PLAN_FILE)) fs.rmSync(PLUGIN_ROOT_PLAN_FILE);

    const emptyDir = path.join(tempRoot, 'plan-dir-empty');
    fs.mkdirSync(emptyDir, { recursive: true });

    setWorkingDir(emptyDir);
    const tools = registerTaskPlanningTools(DEFAULT_CONFIG);
    const getPlan = tools.find(t => t.name === 'get_plan')!;

    const got = (await getPlan.implementation({})) as { success?: boolean; data?: unknown };
    expect(got.success).toBe(true);
    expect(got.data).toBeNull();
  });
});


// ==================== normalizeConfirmationReply (Fix B: German JA/NEIN support) ====================

describe('normalizeConfirmationReply', () => {
  test('maps English YES to canonical YES', () => {
    expect(normalizeConfirmationReply('yes')).toBe('YES');
  });

  test('maps German JA to canonical YES', () => {
    expect(normalizeConfirmationReply('ja')).toBe('YES');
  });

  test('maps English NO to canonical NO', () => {
    expect(normalizeConfirmationReply('No')).toBe('NO');
  });

  test('maps German NEIN to canonical NO', () => {
    expect(normalizeConfirmationReply('nein')).toBe('NO');
  });

  test('is case- and whitespace-insensitive for exact replies', () => {
    expect(normalizeConfirmationReply('  YES  ')).toBe('YES');
    expect(normalizeConfirmationReply('jA')).toBe('YES');
    expect(normalizeConfirmationReply('nEiN')).toBe('NO');
  });

  test('returns null for non-confirmation replies (exact match only)', () => {
    expect(normalizeConfirmationReply('yes!')).toBeNull();
    expect(normalizeConfirmationReply('ja please')).toBeNull();
    expect(normalizeConfirmationReply('continue with the build')).toBeNull();
    expect(normalizeConfirmationReply('')).toBeNull();
  });
});

// ==================== decideProjectSwitch (Fix A: confirm-first gate) ====================

describe('decideProjectSwitch', () => {
  const match = { name: 'ai_toolbox', path: '/proj/ai_toolbox' };
  const otherMatch = { name: 'other_proj', path: '/proj/other' };

  test('returns skip when no project keyword matched', () => {
    expect(decideProjectSwitch(null, 'anything', '/cwd/x', null)).toEqual({ kind: 'skip' });
  });

  test('skips when the current working directory already equals the detected project path', () => {
    const decision = decideProjectSwitch(match, 'keep working on ai_toolbox', '/proj/ai_toolbox', null);
    expect(decision).toEqual({ kind: 'skip' });
  });

  test('skips for equivalent paths even with redundant separators (resolve normalization)', () => {
    const decision = decideProjectSwitch(match, 'work on ai_toolbox', '/proj//ai_toolbox', null);
    expect(decision).toEqual({ kind: 'skip' });
  });

  test('issues the confirm-first banner for a fresh detection with no pending offer', () => {
    const decision = decideProjectSwitch(match, 'please switch to ai_toolbox now', '/elsewhere', null);
    expect(decision).toEqual({ kind: 'banner', match });
  });

  test('executes the one-shot switch when the pending project is confirmed with YES or JA', () => {
    expect(decideProjectSwitch(match, 'yes', '/elsewhere', match)).toEqual({ kind: 'execute', match });
    expect(decideProjectSwitch(match, 'ja', '/elsewhere', match)).toEqual({ kind: 'execute', match }); // Fix B normalization
  });

  test('declines when the pending project is answered with NO or NEIN', () => {
    expect(decideProjectSwitch(match, 'no', '/elsewhere', match)).toEqual({ kind: 'declined' });
    expect(decideProjectSwitch(match, 'nein', '/elsewhere', match)).toEqual({ kind: 'declined' });
  });

  test('expires the offer (declines) when a non-confirmation reply arrives while pending', () => {
    expect(decideProjectSwitch(match, 'now fix the parser bug', '/elsewhere', match)).toEqual({ kind: 'declined' });
  });

  test('re-issues the banner when a different project matches than the one pending', () => {
    const decision = decideProjectSwitch(otherMatch, 'switch to other_proj now', '/elsewhere', match);
    expect(decision).toEqual({ kind: 'banner', match: otherMatch });
  });

  test('skips (no banner) when already in the detected project directory even with a stale pending offer', () => {
    const decision = decideProjectSwitch(match, 'continue ai_toolbox work', '/proj/ai_toolbox', match);
    expect(decision).toEqual({ kind: 'skip' });
  });
});
