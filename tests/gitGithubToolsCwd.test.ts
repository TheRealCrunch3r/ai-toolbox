/**
 * 02.11 Option-1 (CWD seam) — hermetic pin for the Git/GitHub tool working-directory routing.
 *
 * Regression background: every dedicated git tool previously resolved its CWD via
 * process.cwd() (plugin/host process), NOT the session working dir, so all ~15 tools ran in the
 * wrong directory ("Not a git repository", "Could not find HEAD", ...). The legacy suite in
 * gitGithubTools.test.ts mocks the ENTIRE module and therefore cannot see CWD routing at all.
 *
 * This pin exercises the REAL implementation (no self-mock) against real on-disk fixtures:
 *  1. inside a temp-repo fixture → success + probe file visible (CWD = session working dir proven by content, not just by status),
 *  2. outside any repo            → clean structured failure (success:false, non-empty error, no throw),
 *  3. mid-session switch          → per-call re-resolution is picked up immediately (no stale cache).
 *  4. RC4/RC5 (02.11): multi-line commit bodies round-trip VERBATIM through `git commit -F` on argv-array spawn
 *     (pre-RC4 BOTH the cmd.exe -m escaping AND the re-quoted -F path failed live), and files staged-then-deleted
 *     before a commit are reaped pre-commit so they never enter the tree.
 * The seam itself is driven through the real setWorkingDir()/resetWorkingDir() exports — jest-safe:
 * workingDir.ts redirects its persisted state file to a per-run temp dir under JEST_WORKER_ID (FIX #31b).
 */

import { execFileSync } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const gitAvailable = (() => {
  try {
    execFileSync('git', ['--version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false; // no git on PATH (e.g. minimal CI image) — skip, never fail the canon
  }
})();

// Imported AFTER the git guard so a missing binary can't break module load (imports are hoisted anyway;
// the guard only gates describe execution).
import { registerGitTools } from '../src/tools/gitGithubTools';
import { setWorkingDir, resetWorkingDir } from '../src/workingDir';
import type { Tool } from '@lmstudio/sdk';

const FIXTURE_REPO_MSG = 'CWD-PIN-FIXTURE 02.11 option-1';
const PROBE_FILE = 'cwd-pin-probe.txt';

type GitToolResult = { success: boolean; data?: unknown; error?: string };

describe('Git/GitHub tools CWD routing (02.11 Option-1)', () => {
  let tools: Tool[];
  let repoDir: string;
  let nonRepoDir: string;

  const getImpl = (name: string) => tools.find(t => t.name === name)?.implementation as ((p: Record<string, never>) => Promise<GitToolResult>) | undefined;

  beforeAll(async () => {
    if (!gitAvailable) return;

    // Hermetic fixtures under os.tmpdir() — never in the dev repo.
    const base = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-toolbox-cwd-pin-'));
    repoDir = path.join(base, 'fixture-repo');
    nonRepoDir = path.join(base, 'non-repo');
    await fs.mkdir(repoDir, { recursive: true });
    await fs.mkdir(nonRepoDir, { recursive: true });

    // Real fixture repository with a DISTINCTIVE commit so routing is proven by content.
    execFileSync('git', ['init', '-q'], { cwd: repoDir, stdio: 'pipe' });
    // Hermetic identity INSIDE the fixture (never rely on the machine's global git config).
    execFileSync('git', ['config', 'user.email', 'cwd-pin@localhost'], { cwd: repoDir, stdio: 'pipe' });
    execFileSync('git', ['config', 'user.name', 'CWD Pin Fixture'], { cwd: repoDir, stdio: 'pipe' });
    const seed = path.join(repoDir, 'seed.txt');
    await fs.writeFile(seed, 'fixture seed\n', 'utf-8');
    execFileSync('git', ['add', '.'], { cwd: repoDir, stdio: 'pipe' });
    execFileSync(
      'git',
      ['-c', 'user.email=cwd-pin@localhost', '-c', 'user.name=CWD Pin Fixture', 'commit', '-q', '-m', FIXTURE_REPO_MSG],
      { cwd: repoDir, stdio: 'pipe' },
    );
    // Untracked probe file — must surface in git_status output when CWD is the fixture repo.
    await fs.writeFile(path.join(repoDir, PROBE_FILE), 'probe\n', 'utf-8');

    tools = registerGitTools({} as never); // config unused by these tools (typed no-op param)
  }, 60000);

  afterAll(async () => {
    try { resetWorkingDir(); } catch { /* non-fatal — test hygiene only */ }
    if (!gitAvailable) return;
    try { await fs.rm(path.dirname(repoDir), { recursive: true, force: true }); } catch { /* best effort */ }
  }, 60000);

  (gitAvailable ? describe : describe.skip)('with git available', () => {
    test('inside temp-repo fixture: resolves the SESSION working dir, not process.cwd()', async () => {
      expect(setWorkingDir(repoDir)).toBe(true); // seam under test — same one file tools use

      const status = await getImpl('git_status')?.({});
      expect(status).toBeDefined();
      expect((status as GitToolResult).success).toBe(true);
      // Content proof: the untracked probe of THIS fixture repo must be visible (dev-repo CWD could never show it).
      const rendered = JSON.stringify((status as GitToolResult).data ?? {});
      expect(rendered).toContain(PROBE_FILE);

      const log = await getImpl('git_log')?.({ max_count: 5 });
      expect(log).toBeDefined();
      expect((log as GitToolResult).success).toBe(true);
      // Distinctive fixture commit message proves the history came from THIS repo.
      expect(JSON.stringify((log as GitToolResult).data ?? {})).toContain(FIXTURE_REPO_MSG);
    });

    test('mid-session switch: per-call re-resolution picks up the new working dir immediately (no stale cache)', async () => {
      // Currently pointed at the fixture repo by the previous test.
      expect(setWorkingDir(nonRepoDir)).toBe(true);
      const afterSwitch = await getImpl('git_status')?.({});
      expect(afterSwitch).toBeDefined();
      expect((afterSwitch as GitToolResult).success).toBe(false); // would be true if a stale cached dir still pointed at the fixture repo

      // And back — same tool instances, no re-registration.
      expect(setWorkingDir(repoDir)).toBe(true);
      const backInRepo = await getImpl('git_status')?.({});
      expect(backInRepo).toBeDefined();
      expect((backInRepo as GitToolResult).success).toBe(true);
    });

    test('outside any repo: clean structured failure (no throw, actionable error)', async () => {
      expect(setWorkingDir(nonRepoDir)).toBe(true);

      const status = await getImpl('git_status')?.({});
      expect(status).toBeDefined(); // a THROW here would surface as an unhandled rejection instead
      expect((status as GitToolResult).success).toBe(false);
      expect(typeof (status as GitToolResult).error).toBe('string');
      expect(((status as GitToolResult).error ?? '').length).toBeGreaterThan(0);

      const log = await getImpl('git_log')?.({});
      expect(log).toBeDefined();
      expect((log as GitToolResult).success).toBe(false);
    });

    test('RC4 (02.11): git_commit carries a MULTI-LINE body through `git commit -F` verbatim (argv spawn, no shell quoting)', async () => {
      expect(setWorkingDir(repoDir)).toBe(true);

      // Distinctive multi-line body with blank lines + the exact char classes that broke BOTH old string paths on cmd.exe:
      // the -m backslash-escape route (exit 129 'unknown switch') and the -F "path" re-quoting route (exit 128 ENOENT).
      const body = [
        'RC4-PIN (02.11): multi-line commit body through git commit -F',
        '',
        'Root cause: argv-array spawn replaced cmd.exe /c command-string construction.',
        'Quoting-hostile chars that used to break: "double quotes" \\backslash\\ ^caret & ampersand $dollar',
      ].join('\n');

      const commit = await getImpl('git_commit')?.({ message: body });
      expect(commit).toBeDefined();
      expect((commit as GitToolResult).success).toBe(true); // pre-RC4 this failed live on Windows (exit 128/129)

      // Verbatim round-trip proves the -F file path was read intact, not shell-reparsed.
      // --format=%B yields the RAW stored message (no header, no log indentation — default `git log` indents 4 spaces).
      const rawMsg = execFileSync('git', ['log', '-1', '--format=%B'], { cwd: repoDir, encoding: 'utf-8' });
      expect(rawMsg).toContain(body);

      // Temp-file hygiene: finally-cleanup must leave no ai-toolbox-commit-msg-*.txt behind in os.tmpdir().
      const tmpLeftovers = (await fs.readdir(os.tmpdir())).filter(f => f.startsWith('ai-toolbox-commit-msg-') && f.endsWith('.txt'));
      expect(tmpLeftovers).toEqual([]);
    });

    test('RC5 canary (02.11): file staged then deleted before commit does NOT enter the tree', async () => {
      // Recreates today's live incident: .git-commit-msg.txt was `git add`-ed while present, then deleted from disk;
      // its stale index entry (porcelain "AD") survives isomorphic-git auto-stage (dir walk sees only on-disk files),
      // so git_commit must reap it pre-commit via the RC5 porcelain scan + `git rm --cached` guard. Also pins the REAL
      // auto-stage contract: working-tree modifications ARE picked up by add('.') and land in the commit.
      expect(setWorkingDir(repoDir)).toBe(true);

      const draft = path.join(repoDir, '.pin-draft.txt');
      await fs.writeFile(draft, 'draft must NOT land in the tree\n', 'utf-8');
      const add = await getImpl('git_add')?.({ paths: ['.pin-draft.txt'] });
      expect((add as GitToolResult).success).toBe(true);
      await fs.unlink(draft);

      // Real working-tree change so the commit is non-empty.
      await fs.appendFile(path.join(repoDir, PROBE_FILE), 'rc4-canary\n', 'utf-8');

      const commit = await getImpl('git_commit')?.({ message: 'RC4-PIN (02.11): staged-deleted reap canary' });
      expect(commit).toBeDefined();
      expect((commit as GitToolResult).success).toBe(true);

      // The committed tree must NOT contain the deleted draft; status must be clean afterwards.
      const names = execFileSync('git', ['show', '--name-only', '--format=', 'HEAD'], { cwd: repoDir, encoding: 'utf-8' });
      expect(names).not.toContain('.pin-draft.txt');

      const statusAfter = await getImpl('git_status')?.({});
      expect((statusAfter as GitToolResult).success).toBe(true);
      expect(JSON.stringify((statusAfter as GitToolResult).data ?? {})).not.toContain('.pin-draft.txt');
    });
  });
});
