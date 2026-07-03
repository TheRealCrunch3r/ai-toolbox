import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config';

import { validatePath } from '../security.js';
import { getWorkingDir, resolvePath } from '../workingDir.js';
import * as git from 'isomorphic-git';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execPromise = promisify(exec);

// Minimal interface matching isomorphic-git's public API for strict typing
interface GitConfig {
  dir: string;
}

let gitConfig: GitConfig | null = null;

/** Get the absolute working directory, handling Windows paths with spaces */
function getSafeWorkingDir(): string {
  return process.cwd();
}

/** Get or create the git configuration context */
async function getGitConfig(): Promise<GitConfig> {
  if (!gitConfig) {
    gitConfig = { dir: getSafeWorkingDir() };
  }
  return gitConfig;
}

/** Reset git config cache (for testing) */
export function resetGitCache(): void {
  gitConfig = null;
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
        const config = await getGitConfig();
        const statusResult = await git.status({ ...config, filepath: '.', fs }) as unknown as Record<string, unknown>;
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
        // Commit with message using native exec (isomorphic-git requires author config)
        await execPromise(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: config.dir });
          result = await execPromise(`git diff "${file_path}"`, { cwd: config.dir }).then(r => r.stdout);
        } else if (cached) {
          result = await execPromise('git diff --cached', { cwd: config.dir }).then(r => r.stdout);
        } else {
          result = await execPromise('git diff', { cwd: config.dir }).then(r => r.stdout);
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
        
        // Stage all changes using isomorphic-git
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
        await git.add({ ...config, filepath: '.', fs } as any);
        
        // Commit with message using native exec (isomorphic-git requires author config)
        const { stdout, stderr } = await execPromise(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: config.dir });
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
          // Fallback to native exec for branch creation to ensure reliability.
          await execPromise(`git checkout -b "${branch_name}"`, { cwd: config.dir });
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
          // isomorphic-git requires an http adapter for remote ops. Fallback to native exec.
          await execPromise(`git push origin "${branch}"`, { cwd: config.dir });
        } else {
          await execPromise('git push', { cwd: config.dir });
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
            // isomorphic-git does not support stash. Fallback to native exec.
            await execPromise(`git stash push -m "${message.replace(/"/g, '\\"')}"`, { cwd: config.dir });
            return { success: true, data: { stashed: true, message } };
          }
          case 'pop': {
            // Fallback to native exec
            await execPromise('git stash pop', { cwd: config.dir });
            return { success: true, data: { popped: true } };
          }
          case 'drop': {
            // Fallback to native exec
            await execPromise('git stash drop', { cwd: config.dir });
            return { success: true, data: { dropped: true } };
          }
          case 'list': {
            // Fallback to native exec
            const { stdout } = await execPromise('git stash list', { cwd: config.dir });
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
        
        // isomorphic-git does not support blame. Fallback to native exec for precise output parsing.
        const fullPath = resolvePath(file_path);
        let cmd = `git blame "${fullPath}"`;
        if (line_number) {
          cmd += ` -L ${line_number},${line_number}`;
        }
        
        const { stdout } = await execPromise(cmd, { cwd: config.dir });
        
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
