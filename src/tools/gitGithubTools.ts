import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config';

import { validatePath } from '../security.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';
import * as git from 'isomorphic-git';
import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import fs from 'fs/promises';

// ==================== DEP0190 Fix: Safe shell execution without { shell: true } ===

/**
 * Execute a command as an ARGV array via direct spawn — NO shell layer at all (no DEP0190 warning).
 * Replaces both child_process.exec() and the previous cmd.exe /c string construction.
 */
interface ExecResult {
  stdout: string;
  stderr: string;
}

// 02.11 Option-1 RC4 (observed live today as exit 128 'could not read log file'): the old signature took a
// pre-formatted command STRING and ran it through `cmd.exe /c`. Node escapes embedded double quotes for
// CreateProcessW (\") but cmd.exe does not understand backslash-quote escaping (only ^) — so ANY argument
// containing " or spaces reached git with LITERAL quote characters in the value (e.g. -F received
// `"C:/.../msg.txt"` incl. the quotes -> ENOENT). Fix is structural: argv-array spawn, no shell at all —
// DEP0190-safe by construction and quoting-proof on both platforms; call sites pass raw args, never quote.
function safeExec(commandArgs: readonly string[], options?: { cwd?: string }): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = commandArgs;

    const proc = spawn(cmd, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: options?.cwd ?? getWorkingDir(), // 02.11 Option-1 (CWD seam): default = session working dir, same as file tools
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code === 0 || code === undefined) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new Error(`Command exited with code ${code}: ${stderr.trim()}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// Minimal interface matching isomorphic-git's public API for strict typing
interface GitConfig {
  dir: string;
}

// 02.11 Option-1 (CWD seam): every git invocation resolves the SESSION working dir through
// getWorkingDir() — the same seam the file tools use — instead of process.cwd() (plugin/host CWD),
// which previously ran all ~15 Git/GitHub tools in the wrong directory ("Not a git repository" etc.).
// Resolved per call on purpose: no module-level cache, so working-dir changes mid-session
// (change_directory / switch_context) are picked up immediately.
function getSafeWorkingDir(): string {
  return getWorkingDir();
}

/** Git configuration context — re-resolved per call; see note above why there is no cache */
async function getGitConfig(): Promise<GitConfig> {
  return { dir: getSafeWorkingDir() };
}

/** No-op since 02.11 Option-1 (CWD seam): resolution is per-call, so nothing to reset. Kept exported for API stability. */
export function resetGitCache(): void {
  // intentionally empty — see getSafeWorkingDir note above
}

/**
 * Extract GitHub repo name from .git/config or environment variable. — ASYNC ===
 * FIX P1: Replaced child_process.execSync with pure isomorphic-git/fs parsing ===
 */
async function getRepoName(): Promise<string | null> {
  // Priority 1: Environment variable (GitHub Actions, CI/CD)
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }

  // Priority 2: Parse .git/config to find remote URL — ASYNC ===
  try {
    const workTree = getSafeWorkingDir();
    const gitConfigPath = `${workTree}/.git/config`;
    const configContent = await fs.readFile(gitConfigPath, 'utf-8');
    
    // Look for url = ... under [remote "origin"] section
    const remoteSection = /\[remote "origin"\][\s\S]*?url\s*=\s*(.+?)(?=\n\[|\$)/.exec(configContent);
    if (remoteSection && remoteSection[1]) {
      let remoteUrl = remoteSection[1].trim();
      
      // Handle SSH format: git@github.com:user/repo.git
      const sshMatch = remoteUrl.match(/git@github\.com[:/]([^/]+\/[^/]+)\\.git$/);
      if (sshMatch) return sshMatch[1];
      
      // Handle HTTPS format: https://github.com/user/repo.git
      const httpsMatch = remoteUrl.match(/https:\/\/github\.com\/([^/]+\/[^/]+)\.git$/);
      if (httpsMatch) return httpsMatch[1];
    }
  } catch {
    // Git config not available, continue to next priority
  }

  // Priority 3: Environment variable GITHUB_REPO as fallback
  if (process.env.GITHUB_REPO) {
    return process.env.GITHUB_REPO;
  }

  return null;
}

/**
 * Shared helper: Make GitHub API requests with authentication — ASYNC already ===
 */
async function ghApiRequest<T = unknown>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const githubToken = process.env.GITHUB_TOKEN;
  
  const response = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

/** Typed params interfaces — ASYNC already === */
type GitStatusParams = Record<string, never>;
interface GitDiffParams { file_path?: string; cached?: boolean; }
interface GitCommitParams { message: string; }
interface GitLogParams { max_count?: number; }
interface GitAddParams { paths?: string[]; }
interface GitCheckoutParams { branch_name: string; create_new?: boolean; }
interface GitStashParams { action: 'save' | 'pop' | 'drop' | 'list'; message?: string; }
interface GitBlameParams { file_path: string; line_number?: number; }
interface GitBlameResult { commitHash: string; author: string; timestamp: number; line: number; originalLine: number; summary: string; }

interface GhCreateIssueParams { title: string; body?: string; labels?: string[]; }
interface GhListIssuesParams { state?: 'open' | 'closed'; labels?: string[]; limit?: number; }
interface GhViewCommentsParams { number: number; type?: 'issue' | 'pr'; }
interface GhCreatePrParams { title: string; body?: string; head_branch: string; base_branch?: string; }
interface GhListPrsParams { state?: 'open' | 'closed'; labels?: string[]; limit?: number; }
interface GhViewPrDiffParams { number: number; }
interface GhPushParams { branch?: string; }

export function registerGitTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // git_status tool — ASYNC ===
  tools.push(tool({
    name: 'git_status',
    description: 'Get the current git status of the repository.',
    parameters: {},
    implementation: async (_params: GitStatusParams) => { // C5 FIX: typed params
      try {
        // 02.11 Option-1 (CWD seam + status-API fix): isomorphic-git's public git.status() returns a
        // SINGLE-FILE status string ('*added'|'modified'|...), NOT a repo-wide file listing — the old call
        // with filepath: '.' silently returned that string for every working dir (observed live "*added"),
        // so this tool never showed real repository state. Route through shell spawn like git_diff does:
        // porcelain v1 = machine-readable, token-lean; clean non-zero exit outside a repo.
        const config = await getGitConfig();
        const { stdout } = await safeExec(['git', 'status', '--porcelain'], { cwd: config.dir });
        return { success: true, data: { status: stdout } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git status failed: ${message}` };
      }
    },
  }));

  // git_diff tool — ASYNC ===
  tools.push(tool({
    name: 'git_diff',
    description: 'Get the git diff of the current repository or specific files.',
    parameters: {
      file_path: z.string().optional().describe('Optional: Path to specific file to diff.'),
      cached: z.boolean().optional().default(false).describe('Optional: Show staged changes only (git diff --cached).'),
    },
    implementation: async ({ file_path, cached }: GitDiffParams) => { // C5 FIX: typed params
      try {
        const config = await getGitConfig();
        let result: string;
        
        if (file_path) {
          // 02.11 RC4: argv form — raw path as one argument, no manual quoting (spaces/special chars now safe).
          result = await safeExec(['git', 'diff', file_path], { cwd: config.dir }).then(r => r.stdout);
        } else if (cached) {
          result = await safeExec(['git', 'diff', '--cached'], { cwd: config.dir }).then(r => r.stdout);
        } else {
          result = await safeExec(['git', 'diff'], { cwd: config.dir }).then(r => r.stdout);
        }
        
        return { success: true, data: { diff: result } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git diff failed: ${message}` };
      }
    },
  }));

  // git_commit tool — ASYNC ===
  tools.push(tool({
    name: 'git_commit',
    description: 'Commit changes to the repository.',
    parameters: {
      message: z.string().describe('Commit message'),
    },
    implementation: async ({ message }: GitCommitParams) => { // C5 FIX: typed params
      try {
        const config = await getGitConfig();
        
        // Stage all changes using isomorphic-git (filepath required for add)
        await git.add({ ...config, filepath: '.', fs });

        // 02.11 Option-1 RC5 (observed live today): stale index entries for files that were staged while present and
        // then deleted from disk (porcelain XY "AD"/"MD") SURVIVE isomorphic-git's auto-stage — its dir walk only sees
        // files on disk, so such drafts would silently land in the committed tree. Reap them before committing:
        // porcelain scan + `git rm --cached <path>` per hit (documented native unstage: index entry dropped, worktree
        // untouched; isomorphic-git v1.x exposes no public rm/index API — verified against its .d.ts). Best-effort by
        // design: a reap failure must never abort an otherwise-valid commit.
        const { stdout: statusOut } = await safeExec(['git', 'status', '--porcelain'], { cwd: config.dir });
        for (const line of statusOut.split('\n')) {
          if (!line) continue;
          const xy = line.slice(0, 2);
          let p = line.slice(3).trim();
          // Porcelain v1 quotes paths with spaces/specials — strip a matched pair so git receives the raw path.
          if (p.length > 1 && p.startsWith('"') && p.endsWith('"')) { p = p.slice(1, -1); }
          if (p && xy.length === 2 && 'AMT'.includes(xy[0]) && xy[1] === 'D' && !p.includes(' -> ')) {
            try { await safeExec(['git', 'rm', '--cached', p], { cwd: config.dir }); } catch { /* best-effort reap */ }
          }
        }

        // 02.11 Option-1 follow-up RC3 (commit-msg quoting, observed live today as exit 129 'unknown switch'):
        // cmd.exe does not honor \" escapes inside double quotes (only ^), and embedded newlines break
        // -m parsing — any real-world commit body failed on Windows. House pattern: write the body to a
        // temp file in os.tmpdir() and commit via `git commit -F <file>`; the repo working tree stays clean
        // even if the process dies mid-commit (isomorphic-git commit() still requires author config, so an
        // explicit spawn stays DEP0190-safe).
        // 02.11 Option-1 RC4 (same day, observed live as exit 128 'could not read log file'): RC3's temp-file
        // path was re-quoted inside the old cmd.exe /c command string and reached git WITH literal quote chars —
        // fixed by the argv-array safeExec above; msgFile now travels as a bare argv element, no shell involved.
        const msgFile = path.join(os.tmpdir(), `ai-toolbox-commit-msg-${Date.now()}.txt`);
        await fs.writeFile(msgFile, message, 'utf-8');
        try {
          await safeExec(['git', 'commit', '-F', msgFile], { cwd: config.dir });
        } finally {
          try { await fs.unlink(msgFile); } catch { /* best-effort temp cleanup */ }
        }
        
        return { success: true, data: { committed: true, commitMessage: message } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git commit failed: ${message}` };
      }
    },
  }));

  // git_log tool — ASYNC ===
  tools.push(tool({
    name: 'git_log',
    description: 'View the git commit history.',
    parameters: {
      max_count: z.number().int().min(1).optional().default(20).describe('Maximum number of commits to return (default: 20)'),
    },
    implementation: async ({ max_count }: GitLogParams) => { // C5 FIX: typed params
      try {
        const config = await getGitConfig();
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
        const logResult = await git.log({ ...config, depth: max_count || 20, fs } as any);
        
        return { success: true, data: { commits: logResult } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git log failed: ${message}` };
      }
    },
  }));

  // git_add tool — ASYNC ===
  tools.push(tool({
    name: 'git_add',
    description: 'Stage files for commit.',
    parameters: {
      paths: z.array(z.string()).optional().describe('Optional: Specific file paths to stage. If not provided, stages all changes.'),
    },
    implementation: async ({ paths }: GitAddParams) => { // C5 FIX: typed params
      try {
        const config = await getGitConfig();
        
        if (paths && paths.length > 0) {
          for (const p of paths) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
            await git.add({ ...config, filepath: p, fs } as any);
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
          await git.add({ ...config, filepath: '.', fs } as any);
        }
        
        return { success: true, data: { staged: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git add failed: ${message}` };
      }
    },
  }));

  // git_checkout tool — ASYNC ===
  tools.push(tool({
    name: 'git_checkout',
    description: 'Switch branches or restore working tree files.',
    parameters: {
      branch_name: z.string().describe('Branch name to checkout'),
      create_new: z.boolean().optional().default(false).describe('Create a new branch if it doesn\'t exist'),
    },
    implementation: async ({ branch_name, create_new }: GitCheckoutParams) => { // C5 FIX: typed params
      try {
        const config = await getGitConfig();
        
        if (create_new) {
          // isomorphic-git checkout does not directly support creating new branches in one step like simple-git's checkoutLocalBranch.
          // Fallback to explicit spawn for branch creation (DEP0190-safe; 02.11 RC4 argv form).
          await safeExec(['git', 'checkout', '-b', branch_name], { cwd: config.dir });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
          await git.checkout({ ...config, ref: branch_name, fs } as any);
        }
        
        return { success: true, data: { switchedToBranch: branch_name } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git checkout failed: ${message}` };
      }
    },
  }));

  // ======================================================================
  // GitHub API Tools — ASYNC ===
  // ======================================================================

  // gh_create_issue tool — ASYNC ===
  tools.push(tool({
    name: 'gh_create_issue',
    description: 'Create a new GitHub issue.',
    parameters: {
      title: z.string().describe('Issue title'),
      body: z.string().optional().describe('Issue body (markdown)'),
      labels: z.array(z.string()).optional().describe('Labels to apply'),
    },
    implementation: async ({ title, body, labels }: GhCreateIssueParams) => { // C5 FIX: typed params
      try {
        const repoName = await getRepoName();  // ASYNC call
        if (!repoName) throw new Error('Could not determine repository name');
        
        const issueData = await ghApiRequest('POST', `/repos/${repoName}/issues`, {
          title,
          body,
          labels,
        });
        
        return { success: true, data: { createdIssue: issueData } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub issue creation failed: ${message}` };
      }
    },
  }));

  // gh_list_issues tool — ASYNC ===
  tools.push(tool({
    name: 'gh_list_issues',
    description: 'List GitHub issues in the repository.',
    parameters: {
      state: z.enum(['open', 'closed']).optional().describe('Filter by issue state'),
      labels: z.array(z.string()).optional().describe('Filter by labels'),
      limit: z.number().int().min(1).max(100).optional().default(20).describe('Maximum number of issues to return (default: 20)'),
    },
    implementation: async ({ state, labels, limit }: GhListIssuesParams) => { // C5 FIX: typed params
      try {
        const repoName = await getRepoName();  // ASYNC call
        if (!repoName) throw new Error('Could not determine repository name');
        
        let url = `/repos/${repoName}/issues?state=${state || 'open'}`;
        if (labels && labels.length > 0) {
          url += `&labels=${labels.join(',')}`;
        }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const issues = await ghApiRequest<Array<any>>('GET', url);
        
        return { success: true, data: { issues: issues.slice(0, limit || 20) } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub issue listing failed: ${message}` };
      }
    },
  }));

  // gh_view_comments tool — ASYNC ===
  tools.push(tool({
    name: 'gh_view_comments',
    description: 'View comments on a GitHub issue or pull request.',
    parameters: {
      number: z.number().int().min(1).describe('Issue or PR number'),
      type: z.enum(['issue', 'pr']).optional().default('issue').describe('Type of resource (issue or pr)'),
    },
    implementation: async ({ number, type }: GhViewCommentsParams) => { // C5 FIX: typed params
      try {
        const repoName = await getRepoName();  // ASYNC call
        if (!repoName) throw new Error('Could not determine repository name');
        
        const endpoint = type === 'pr' 
          ? `/repos/${repoName}/issues/${number}/comments`
          : `/repos/${repoName}/issues/${number}/comments`;
          
        const comments = await ghApiRequest('GET', endpoint);
        
        return { success: true, data: { comments } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub comments retrieval failed: ${message}` };
      }
    },
  }));

  // gh_create_pr tool — ASYNC ===
  tools.push(tool({
    name: 'gh_create_pr',
    description: 'Create a new GitHub pull request.',
    parameters: {
      title: z.string().describe('PR title'),
      body: z.string().optional().describe('PR body (markdown)'),
      head_branch: z.string().describe('Head branch (source branch)'),
      base_branch: z.string().optional().default('main').describe('Base branch (target branch, default: main)'),
    },
    implementation: async ({ title, body, head_branch, base_branch }: GhCreatePrParams) => { // C5 FIX: typed params
      try {
        const repoName = await getRepoName();  // ASYNC call
        if (!repoName) throw new Error('Could not determine repository name');
        
        const prData = await ghApiRequest('POST', `/repos/${repoName}/pulls`, {
          title,
          body,
          head: head_branch,
          base: base_branch || 'main',
        });
        
        return { success: true, data: { createdPR: prData } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PR creation failed: ${message}` };
      }
    },
  }));

  // gh_list_prs tool — ASYNC ===
  tools.push(tool({
    name: 'gh_list_prs',
    description: 'List GitHub pull requests in the repository.',
    parameters: {
      state: z.enum(['open', 'closed']).optional().describe('Filter by PR state'),
      limit: z.number().int().min(1).max(100).optional().default(20).describe('Maximum number of PRs to return (default: 20)'),
    },
    implementation: async ({ state, limit }: GhListPrsParams) => { // C5 FIX: typed params
      try {
        const repoName = await getRepoName();  // ASYNC call
        if (!repoName) throw new Error('Could not determine repository name');
        
        const url = `/repos/${repoName}/pulls?state=${state || 'open'}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prs = await ghApiRequest<Array<any>>('GET', url);
        
        return { success: true, data: { prs: prs.slice(0, limit || 20) } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PR listing failed: ${message}` };
      }
    },
  }));

  // gh_view_pr_diff tool — ASYNC ===
  tools.push(tool({
    name: 'gh_view_pr_diff',
    description: 'View the diff of a GitHub pull request.',
    parameters: {
      number: z.number().int().min(1).describe('PR number'),
    },
    implementation: async ({ number }: GhViewPrDiffParams) => { // C5 FIX: typed params
      try {
        const repoName = await getRepoName();  // ASYNC call
        if (!repoName) throw new Error('Could not determine repository name');
        
        const response = await fetch(`https://api.github.com/repos/${repoName}/pulls/${number}`, {
          headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error (${response.status})`);
        }
        
        const prData = (await response.json()) as Record<string, unknown>;
        
        return { success: true, data: { diffUrl: prData.diff_url, patchUrl: prData.patch_url } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PR diff retrieval failed: ${message}` };
      }
    },
  }));

  // gh_push tool — ASYNC ===
  tools.push(tool({
    name: 'gh_push',
    description: 'Push changes to the remote repository.',
    parameters: {
      branch: z.string().optional().describe('Branch to push. Defaults to current branch.'),
    },
    implementation: async ({ branch }: GhPushParams) => { // C5 FIX: typed params
      try {
        const config = await getGitConfig();
        
        if (branch) {
          // isomorphic-git requires an http adapter for remote ops. Fallback to explicit spawn (DEP0190-safe; 02.11 RC4 argv form).
          await safeExec(['git', 'push', 'origin', branch], { cwd: config.dir });
        } else {
          await safeExec(['git', 'push'], { cwd: config.dir });
        }
        
        return { success: true, data: { pushed: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git push failed: ${message}` };
      }
    },
  }));


  // ======================================================================
  // Git Stash & Blame Tools — ASYNC ===
  // ======================================================================

  // git_stash tool — ASYNC ===
  tools.push(tool({
    name: 'git_stash',
    description: 'Manage git stashes: save, pop, drop, or list uncommitted changes. Essential for safe version control workflows.',
    parameters: {
      action: z.enum(['save', 'pop', 'drop', 'list']).describe('Stash action to perform'),
      message: z.string().optional().describe('Optional: Stash message (required for "save" action)'),
    },
    implementation: async ({ action, message }: GitStashParams) => { // C5 FIX: typed params
      try {
        const config = await getGitConfig();
        
        switch (action) {
          case 'save': {
            if (!message) {
              return { success: false, error: 'git_stash save requires a "message" parameter' };
            }
            // isomorphic-git does not support stash. Fallback to explicit spawn (DEP0190-safe; 02.11 RC4 argv form —
            // the old .replace(/"/g, '\\"') backslash-escaping was itself part of the cmd.exe quoting bug).
            await safeExec(['git', 'stash', 'push', '-m', message], { cwd: config.dir });
            return { success: true, data: { stashed: true, message } };
          }
          case 'pop': {
            // DEP0190-safe explicit spawn (02.11 RC4 argv form)
            await safeExec(['git', 'stash', 'pop'], { cwd: config.dir });
            return { success: true, data: { popped: true } };
          }
          case 'drop': {
            // DEP0190-safe explicit spawn (02.11 RC4 argv form)
            await safeExec(['git', 'stash', 'drop'], { cwd: config.dir });
            return { success: true, data: { dropped: true } };
          }
          case 'list': {
            // DEP0190-safe explicit spawn (02.11 RC4 argv form)
            const { stdout } = await safeExec(['git', 'stash', 'list'], { cwd: config.dir });
            return { success: true, data: { stashes: stdout.trim().split('\n').filter(Boolean) } };
          }
          default: {
            return { success: false, error: `Unknown action: ${String(action)}` };
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git stash operation failed: ${message}` };
      }
    },
  }));

  // git_blame tool — ASYNC ===
  tools.push(tool({
    name: 'git_blame',
    description: 'Get commit history for specific lines in a file. Returns author, timestamp, and commit hash for each line.',
    parameters: {
      file_path: z.string().describe('Path to the file to blame'),
      line_number: z.number().int().min(1).optional().describe('Optional: Specific line number to blame. If omitted, blames entire file.'),
    },
    implementation: async ({ file_path, line_number }: GitBlameParams) => { // C5 FIX: typed params
      try {
        const config = await getGitConfig();
        
        // Validate path
        if (!validatePath(file_path, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        
        // isomorphic-git does not support blame. DEP0190-safe explicit spawn for precise output parsing (02.11 RC4 argv form).
        const fullPath = resolvePath(file_path);
        const cmdArgs = ['git', 'blame', fullPath];
        if (line_number) {
          cmdArgs.push('-L', `${line_number},${line_number}`);
        }
        
        const { stdout } = await safeExec(cmdArgs, { cwd: config.dir });
        
        // Parse git blame output manually for structured data
        const lines = stdout.trim().split('\n');
        const parsedBlame: (GitBlameResult | null)[] = lines.map(line => {
          // Format: <hash> <original_line> <final_line> [<author>] (<timestamp>) <summary>
          const parts = line.match(/^([0-9a-f]+)\s+(\d+)\s+(\d+)\s+\[([^\]]+)\]\s+\((\d+)\s+(.+)$/);
          if (parts) {
            return {
              commitHash: parts[1],
              author: parts[4],
              timestamp: parseInt(parts[5], 10),
              line: parseInt(parts[3], 10),
              originalLine: parseInt(parts[2], 10),
              summary: parts[6] || ''
            };
          }
          return null;
        });

        // Filter for non-nulls first to ensure type safety
        const validBlame = parsedBlame.filter((b): b is GitBlameResult => b !== null);
        
        // Then filter by line number if requested
        const filteredLines = line_number 
          ? validBlame.filter(b => b.line === line_number) 
          : validBlame;
        
        return { success: true, data: { blame: filteredLines } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git blame failed: ${message}` };
      }
    },
  }));


  return tools;

}
