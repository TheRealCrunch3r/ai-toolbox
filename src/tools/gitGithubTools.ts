import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config';

// Lazy-load simple-git for testability
let simpleGitModule: typeof import('simple-git') | null = null;

async function getSimpleGit(): Promise<typeof import('simple-git')> {
  if (!simpleGitModule) {
    simpleGitModule = await import('simple-git');
  }
  return simpleGitModule;
}

/** Reset git module cache (for testing) */
export function resetGitCache(): void {
  simpleGitModule = null;
}

/** Create a fresh git instance for each operation to avoid cwd issues */
async function createGit() {
  const { default: simpleGit } = await getSimpleGit();
  return simpleGit();
}

/**
 * Shared helper: Extract GitHub repo name from git remote URL
 */
function getRepoName(): string | null {
  const repoMatch = process.env.GITHUB_REPOSITORY?.match(/github\.com[:/]([^/]+\/[^/]+)\.git$/);
  return repoMatch?.[1] || null;
}

/**
 * Shared helper: Make GitHub API requests with authentication
 */
async function ghApiRequest(method: string, endpoint: string, body?: unknown) {
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) throw new Error('GITHUB_TOKEN environment variable is not set');
  
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

  return response.json();
}

/** Typed params interfaces */
type GitStatusParams = Record<string, never>;
interface GitDiffParams { file_path?: string; cached?: boolean; }
interface GitCommitParams { message: string; }
interface GitLogParams { max_count?: number; }
interface GitAddParams { paths?: string[]; }
interface GitCheckoutParams { branch_name: string; create_new?: boolean; }
interface GhCreateIssueParams { title: string; body?: string; labels?: string[]; }
interface GhListIssuesParams { state?: 'open' | 'closed'; labels?: string[]; limit?: number; }
interface GhViewCommentsParams { number: number; type?: 'issue' | 'pr'; }
interface GhCreatePrParams { title: string; body?: string; head_branch: string; base_branch?: string; }
interface GhListPrsParams { state?: 'open' | 'closed'; limit?: number; }
interface GhViewPrDiffParams { number: number; }
interface GhPushParams { branch?: string; }

export function registerGitTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // git_status tool
  tools.push(tool({
    name: 'git_status',
    description: 'Get the current git status of the repository.',
    parameters: {},
    implementation: async (_params: GitStatusParams) => { // C5 FIX: typed params
      try {
        const git = createGit();
        const statusResult = await git.status() as Record<string, unknown>;
        return { success: true, data: statusResult };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git status failed: ${message}` };
      }
    },
  }));

  // git_diff tool
  tools.push(tool({
    name: 'git_diff',
    description: 'Get the git diff of the current repository or specific files.',
    parameters: {
      file_path: z.string().optional().describe('Optional: Path to specific file to diff.'),
      cached: z.boolean().optional().default(false).describe('Optional: Show staged changes only (git diff --cached).'),
    },
    implementation: async ({ file_path, cached }: GitDiffParams) => { // C5 FIX: typed params
      try {
        const git = createGit();
        let diff = '';
        if (file_path) {
          diff = await git.diff([file_path]);
        } else {
          diff = cached ? await git.diff(['--cached']) : await git.diff();
        }
        return { success: true, data: { diff } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git diff failed: ${message}` };
      }
    },
  }));

  // git_commit tool
  tools.push(tool({
    name: 'git_commit',
    description: 'Commit staged changes to the git repository.',
    parameters: {
      message: z.string().describe('The commit message'),
    },
    implementation: async ({ message }: GitCommitParams) => { // C5 FIX: typed params
      try {
        const git = createGit();
        await git.commit(message);
        return { success: true, data: { committed: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git commit failed: ${message}` };
      }
    },
  }));

  // git_log tool
  tools.push(tool({
    name: 'git_log',
    description: 'Get recent git commit history.',
    parameters: {
      max_count: z.number().int().min(1).optional().default(10).describe('Max number of commits to return (default: 10)'),
    },
    implementation: async ({ max_count }: GitLogParams) => { // C5 FIX: typed params
      try {
        const git = createGit();
        const count = max_count || 10;
        const log = await git.log(count);
        return { success: true, data: { commits: log.all } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git log failed: ${message}` };
      }
    },
  }));

  // git_add tool
  tools.push(tool({
    name: 'git_add',
    description: 'Stage specific files or all changes for the next commit.',
    parameters: {
      paths: z.array(z.string()).optional().describe('Optional: Specific file paths to stage. If omitted, stages all changes.'),
    },
    implementation: async ({ paths }: GitAddParams) => { // C5 FIX: typed params
      try {
        const git = createGit();
        if (paths && paths.length > 0) {
          await git.add(paths);
        } else {
          await git.add('.');
        }
        return { success: true, data: { stagedPaths: paths || 'all' } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git add failed: ${message}` };
      }
    },
  }));

  // git_checkout tool
  tools.push(tool({
    name: 'git_checkout',
    description: 'Switch to an existing branch or create and switch to a new one.',
    parameters: {
      branch_name: z.string().describe('Name of the branch to checkout.'),
      create_new: z.boolean().optional().default(false).describe("If true, creates the branch if it doesn't exist (like git checkout -b)."),
    },
    implementation: async ({ branch_name, create_new }: GitCheckoutParams) => { // C5 FIX: typed params
      try {
        const git = createGit();
        if (create_new) {
          await git.checkoutLocalBranch(branch_name);
        } else {
          await git.checkout(branch_name);
        }
        return { success: true, data: { branchName: branch_name } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Git checkout failed: ${message}` };
      }
    },
  }));

  // gh_auth tool
  tools.push(tool({
    name: 'gh_auth',
    description: 'Check GitHub authentication status. If not authenticated, opens a terminal window for the user to sign in.',
    parameters: {},
    implementation: async () => {
      try {
        const githubToken = process.env.GITHUB_TOKEN;
        
        if (!githubToken) {
          return { success: false, error: 'GITHUB_TOKEN environment variable is not set' };
        }
        
        await ghApiRequest('GET', '/user');
        return { success: true, data: { authenticated: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub auth failed: ${message}` };
      }
    },
  }));

  // gh_create_issue tool
  tools.push(tool({
    name: 'gh_create_issue',
    description: 'Create a new GitHub issue in the current repository.',
    parameters: {
      title: z.string().describe('The issue title'),
      body: z.string().optional().describe('The issue body/description'),
      labels: z.array(z.string()).optional().describe('Labels to apply'),
    },
    implementation: async ({ title, body, labels }: GhCreateIssueParams) => { // C5 FIX: typed params
      try {
        const repoName = getRepoName();
        if (!repoName) throw new Error('Could not determine repository name from GITHUB_REPOSITORY env');

        await ghApiRequest('POST', `/repos/${repoName}/issues`, { title, body, labels });
        return { success: true, data: { created: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub issue creation failed: ${message}` };
      }
    },
  }));

  // gh_list_issues tool
  tools.push(tool({
    name: 'gh_list_issues',
    description: 'List issues in the current repository.',
    parameters: {
      state: z.enum(['open', 'closed']).optional().default('open').describe('Filter by issue state'),
      labels: z.array(z.string()).optional().describe('Filter by labels'),
      limit: z.number().int().min(1).max(50).optional().default(10).describe('Max issues to return (default: 10)'),
    },
    implementation: async ({ state, labels, limit }: GhListIssuesParams) => { // C5 FIX: typed params
      try {
        const repoName = getRepoName();
        if (!repoName) throw new Error('Could not determine repository name');

        let query = `state=${state}`;
        if (labels && labels.length > 0) {
          query += `&labels=${labels.join(',')}`;
        }

        const issues = await ghApiRequest('GET', `/repos/${repoName}/issues?${query}&per_page=${limit || 10}`);
        return { success: true, data: { issues } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub issues listing failed: ${message}` };
      }
    },
  }));

  // gh_view_comments tool
  tools.push(tool({
    name: 'gh_view_comments',
    description: 'View comments on a specific issue or pull request.',
    parameters: {
      number: z.number().int().min(1).describe('The issue or PR number'),
      type: z.enum(['issue', 'pr']).optional().default('issue').describe("Whether it's an issue or a pull request"),
    },
    implementation: async ({ number, type }: GhViewCommentsParams) => { // C5 FIX: typed params
      try {
        const repoName = getRepoName();
        if (!repoName) throw new Error('Could not determine repository name');

        const comments = await ghApiRequest('GET', `/repos/${repoName}/${type === 'pr' ? 'pulls' : 'issues'}/${number}/comments`);
        return { success: true, data: { comments } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub comments viewing failed: ${message}` };
      }
    },
  }));

  // gh_create_pr tool
  tools.push(tool({
    name: 'gh_create_pr',
    description: 'Create a new pull request in the current repository.',
    parameters: {
      title: z.string().describe('The PR title'),
      body: z.string().optional().describe('The PR body/description'),
      head_branch: z.string().describe('The branch containing your changes'),
      base_branch: z.string().optional().default('main').describe('The branch you want to merge into (e.g., main, master)'),
    },
    implementation: async ({ title, body, head_branch, base_branch }: GhCreatePrParams) => { // C5 FIX: typed params
      try {
        const repoName = getRepoName();
        if (!repoName) throw new Error('Could not determine repository name');

        const pr = await ghApiRequest('POST', `/repos/${repoName}/pulls`, { title, body, head: head_branch, base: base_branch });
        return { success: true, data: { created: true, url: (pr as Record<string, unknown>).html_url } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PR creation failed: ${message}` };
      }
    },
  }));

  // gh_list_prs tool
  tools.push(tool({
    name: 'gh_list_prs',
    description: 'List pull requests in the current repository.',
    parameters: {
      state: z.enum(['open', 'closed']).optional().default('open').describe('Filter by PR state'),
      limit: z.number().int().min(1).max(50).optional().default(10).describe('Max PRs to return (default: 10)'),
    },
    implementation: async ({ state, limit }: GhListPrsParams) => { // C5 FIX: typed params
      try {
        const repoName = getRepoName();
        if (!repoName) throw new Error('Could not determine repository name');

        const prs = await ghApiRequest('GET', `/repos/${repoName}/pulls?state=${state}&per_page=${limit || 10}`);
        return { success: true, data: { prs } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PRs listing failed: ${message}` };
      }
    },
  }));

  // gh_view_pr_diff tool
  tools.push(tool({
    name: 'gh_view_pr_diff',
    description: 'Fetch the diff/patch of a specific pull request.',
    parameters: {
      number: z.number().int().min(1).describe('The PR number'),
    },
    implementation: async ({ number }: GhViewPrDiffParams) => { // C5 FIX: typed params
      try {
        const repoName = getRepoName();
        if (!repoName) throw new Error('Could not determine repository name');

        const response = await fetch(`https://api.github.com/repos/${repoName}/pulls/${number}/diff`, {
          headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
        });
        
        if (!response.ok) throw new Error(`Failed to fetch diff: ${response.status}`);
        
        const diff = await response.text();
        return { success: true, data: { diff } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub PR diff fetching failed: ${message}` };
      }
    },
  }));

  // gh_push tool
  tools.push(tool({
    name: 'gh_push',
    description: 'Push local commits to the remote GitHub repository.',
    parameters: {
      branch: z.string().optional().describe('Optional: The branch to push. Defaults to current branch.'),
    },
    implementation: async ({ branch }: GhPushParams) => { // C5 FIX: typed params
      try {
        const git = createGit();
        await git.push(branch || 'origin', 'HEAD');
        return { success: true, data: { pushed: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `GitHub push failed: ${message}` };
      }
    },
  }));

  return tools;
}
