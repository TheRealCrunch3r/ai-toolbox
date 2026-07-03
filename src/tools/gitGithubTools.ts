import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config';

import { validatePath } from '../security.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';

// Minimal interface matching simple-git's public API to ensure strict typing
interface GitInstance {
  cwd(path: string): GitInstance;
  raw(args: string[]): Promise<string>;
  status(): Promise<unknown>;
  diff(paths?: string[]): Promise<string>;
  commit(msg: string): Promise<string>;
  log(maxCount?: number): Promise<{ all: Array<unknown> }>;
  add(paths: string[]): Promise<void>;
  checkout(branch: string): Promise<void>;
  checkoutLocalBranch(branch: string): Promise<void>;
  push(...args: string[]): Promise<void>;
  stash(action?: string | string[], msg?: string): Promise<unknown>;
  stashList(): Promise<{ all: Array<unknown> }>;
  blame(path: string): Promise<{ file: { blame: Array<{ hash: string; author: string; timestamp: number; finalLine: number; originalLine: number; summary: string }> } }>;
}

// Lazy-load simple-git for testability — ASYNC ===
let gitInstance: GitInstance | null = null;

/** Get the absolute working directory, handling Windows paths with spaces */
function getSafeWorkingDir(): string {
  return process.cwd();
}

/** Create a fresh git instance for each operation — ASYNC === */
async function createGit(): Promise<GitInstance> {
  let instance = gitInstance;
  if (!instance) {
    const workTree = getSafeWorkingDir();
    const module = await import('simple-git');
    // Type the ESM default export explicitly to avoid `any` propagation across the file
    instance = ((module.default as unknown) as (path?: string) => GitInstance)(workTree);
    gitInstance = instance;
  }
  return Promise.resolve(instance);
}

/** Reset git instance cache (for testing) */
export function resetGitCache(): void {
  gitInstance = null;
}

/**
 * Extract GitHub repo name from git remote URL or environment variable. — ASYNC ===
 * FIX P1: Replaced child_process.execSync with async simple-git ===
 */
async function getRepoName(): Promise<string | null> {
  // Priority 1: Environment variable (GitHub Actions, CI/CD)
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }

  // Priority 2: Git remote URL parsing via simple-git — ASYNC ===
  try {
    const git = await createGit();  // ASYNC call
    const remotes = await git.raw(['remote', 'get-url', 'origin']);  // ASYNC call
    
    if (remotes) {
      const remoteUrl = remotes.trim();
      
      if (remoteUrl) {
        // Handle SSH format: git@github.com:user/repo.git
        const sshMatch = remoteUrl.match(/git@github\.com[:/]([^/]+\/[^/]+)\.git$/);
        if (sshMatch) return sshMatch[1];
        
        // Handle HTTPS format: https://github.com/user/repo.git
        const httpsMatch = remoteUrl.match(/https:\/\/github\.com\/([^/]+\/[^/]+)\.git$/);
        if (httpsMatch) return httpsMatch[1];
      }
    }
  } catch {
    // Git remote not available, continue to next priority
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

interface GhCreateIssueParams { title: string; body?: string; labels?: string[]; }
interface GhListIssuesParams { state?: 'open' | 'closed'; labels?: string[]; limit?: number; }
interface GhViewCommentsParams { number: number; type?: 'issue' | 'pr'; }
interface GhCreatePrParams { title: string; body?: string; head_branch: string; base_branch?: string; }
interface GhListPrsParams { state?: 'open' | 'closed'; limit?: number; }
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
        const git = await createGit();  // ASYNC call
        const statusResult = await git.status() as Record<string, unknown>;  // ASYNC call
        return { success: true, data: statusResult };
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
        const git = await createGit();  // ASYNC call
        let result: string;
        
        if (file_path) {
          result = await git.diff([file_path]);  // ASYNC call
        } else if (cached) {
          result = await git.diff(['--cached']);  // ASYNC call
        } else {
          result = await git.diff();  // ASYNC call
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
        const git = await createGit();  // ASYNC call
        
        // Stage all changes
        await git.add(['.']);  // ASYNC call
        
        // Commit with message
        const result = await git.commit(message);  // ASYNC call
        
        return { success: true, data: { committed: true, commitMessage: result } };
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
        const git = await createGit();  // ASYNC call
        
        const log = await git.log(max_count || 20);  // ASYNC call
        
        return { success: true, data: { commits: log.all } };
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
        const git = await createGit();  // ASYNC call
        
        if (paths && paths.length > 0) {
          await git.add(paths);  // ASYNC call
        } else {
          await git.add(['.']);  // ASYNC call - stage all changes
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
        const git = await createGit();  // ASYNC call
        
        if (create_new) {
          await git.checkoutLocalBranch(branch_name);  // ASYNC call - creates new branch
        } else {
          await git.checkout(branch_name);  // ASYNC call
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
        const git = await createGit();  // ASYNC call
        
        if (branch) {
          await git.push('origin', branch);  // ASYNC call
        } else {
          (await git.push())  // ASYNC call - push current branch
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
        const git = await createGit();  // ASYNC call
        
        switch (action) {
          case 'save': {
            if (!message) {
              return { success: false, error: 'git_stash save requires a "message" parameter' };
            }
            await git.stash(['save', message]);  // ASYNC call
            return { success: true, data: { stashed: true, message } };
          }
          case 'pop': {
            const result = await git.stash('pop');  // ASYNC call
            return { success: true, data: { popped: true, result } };
          }
          case 'drop': {
            await git.stash('drop');  // ASYNC call
            return { success: true, data: { dropped: true } };
          }
          case 'list': {
            const stashList = await git.stashList();  // ASYNC call
            return { success: true, data: { stashes: stashList.all } };
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
        const git = await createGit();  // ASYNC call
        
        // Validate path
        if (!validatePath(file_path, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        
        const fullPath = resolvePath(file_path);
        
        const blameResult = await git.blame(fullPath);  // ASYNC call
        
        // Filter by line if requested
        const filteredLines = line_number
          ? blameResult.file.blame.filter((b) => b.finalLine === line_number)
          : blameResult.file.blame;
        
        return { success: true, data: { 
          blame: filteredLines.map((b) => ({
            commitHash: b.hash,
            author: b.author,
            timestamp: b.timestamp,
            line: b.finalLine,
            originalLine: b.originalLine,
            summary: b.summary
          }))
        }};
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git blame failed: ${message}` };
      }
    },
  }));


  return tools;

}