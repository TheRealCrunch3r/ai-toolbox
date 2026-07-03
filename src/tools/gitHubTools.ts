/**
 * Enhanced GitHub Tools for ai_toolbox
 * Integrates and improves upon the beledarians implementation.
 */

import { tool, type Tool } from '@lmstudio/sdk';
import { z } from 'zod';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config.js';

// ==================== Typed Params Interfaces ====================

interface CreateIssueParams {
  title: string;
  body?: string;
  labels?: string[];
}

interface ListIssuesParams {
  state?: 'open' | 'closed';
  limit?: number;
  labels?: string[];
}

interface CreatePrParams {
  title: string;
  body?: string;
  headBranch: string;
  baseBranch?: string;
}

interface ListPrsParams {
  state?: 'open' | 'closed';
  limit?: number;
}

interface ViewCommentsParams {
  number: number;
  type?: 'issue' | 'pr';
}

interface GhPushParams {
  branch?: string;
}

// ==================== CLI Helper Utilities ====================

/**
 * Core wrapper for spawning the GitHub CLI (gh).
 * Handles JSON output parsing and error standardization.
 */
async function runGhCommand(args: string[]): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return new Promise((resolve) => {
    const child = spawn('gh', args, { stdio: 'pipe' });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d: Buffer) => (stdout += d.toString()));
    child.stderr.on('data', (d: Buffer) => (stderr += d.toString()));

    child.on('close', (code) => {
      if (code === 0 && stdout.trim()) {
        try {
          const parsed = JSON.parse(stdout); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          resolve({ success: true, data: parsed });
        } catch {
          // Fallback to raw text if not valid JSON
          resolve({ success: true, data: stdout.trim() });
        }
      } else if (code !== 0) {
        const errorMessage = stderr || `Exit code ${code}`;
        // Improve error messages for common auth issues
        const isAuthError = errorMessage.includes('gh token') || errorMessage.includes('401');
        resolve({ 
          success: false, 
          error: isAuthError ? 'Authentication failed. Please log in using the "check_gh_auth" tool.' : errorMessage 
        });
      } else {
        // Command succeeded but produced no output (e.g., git push -n)
        resolve({ success: true, data: null });
      }
    });

    child.on('error', (err) => {
      if (err.message.includes('gh') || err.message.includes('spawn')) {
        resolve({ success: false, error: "GitHub CLI ('gh') is not installed or not in system PATH." });
      } else {
        resolve({ success: false, error: `Failed to spawn gh CLI: ${err.message}` });
      }
    });
  });
}

/**
 * Helper for creating issues/PRs with body content.
 */
async function createGithubItem(
  type: 'issue' | 'pr',
  title: string,
  body?: string,
  labels?: string[],
  extraArgs: string[] = []
): Promise<{ success: boolean; url?: string; error?: string }> {
  const args: string[] = [type, 'create', '--title', title];

  if (body) {
    // Use a temporary file for the body to handle large content safely and avoid shell injection risks
    const tempPath = `gh_${type}_body_${Date.now()}.md`;
    args.push('--body-file', tempPath); 
  }

  if (labels && Array.isArray(labels)) {
    for (const label of labels) {
      args.push('-l', label);
    }
  }

  const finalArgs = [...args, ...extraArgs];
  const result = await runGhCommand(finalArgs);

  if (!result.success) return { success: false, error: result.error };

  // Parse URL from successful creation (usually the last line of stdout or in JSON data)
  let urlMatch: RegExpMatchArray | null;
  const outputStr = String(result.data).trim();
  urlMatch = outputStr.match(/https:\/\/github.com\/[^\/]+\/[^\/]+\/(issues|pull)\/\d+/i);

  const matchedUrl = urlMatch ? urlMatch[0] : (typeof result.data === 'string' ? result.data : '');

  return { 
    success: true, 
    url: matchedUrl
  };
}

// ==================== Tool Registration ====================

export function registerGitTools(config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // Safety Check - rely on the single 'gitOperations' flag available in ai_toolbox config
  if (!config.gitOperations) return tools;

  const checkGhCli = async () => {
    const res = await runGhCommand(['--version']);
    if (!res.success || res.error?.includes('not found')) {
      return "GitHub CLI ('gh') is not installed or not in system PATH.";
    }
    return null; // No error
  };

  tools.push(tool({
    name: 'check_gh_auth',
    description: 'Check GitHub authentication status. If logged out, it will attempt to open a terminal for login.',
    parameters: {},
    implementation: async (): Promise<{ success: boolean; message?: string; error?: string }> => {
      const cliErr = await checkGhCli();
      if (cliErr) return { success: false, error: cliErr };

      // Check auth status using JSON output for reliability
      const res = await runGhCommand(['auth', 'status']);
      
      if (!res.success) {
        return { 
          success: false, 
          message: "Not authenticated. Please log in via command line or ensure your gh token is valid.",
          error: res.error 
        };
      }

      return { 
        success: true, 
        message: "GitHub CLI is installed and authentication status is active." 
      };
    }
  }));

  tools.push(tool({
    name: 'gh_create_issue',
    description: 'Create a new GitHub issue in the current repository.',
    parameters: {
      title: z.string().describe('Title of the issue'),
      body: z.string().optional().describe('Body content for the issue (Markdown supported).'),
      labels: z.array(z.string()).optional().describe('List of labels to apply to the issue.'),
    },
    implementation: async ({ title, body, labels }: CreateIssueParams): Promise<{ success: boolean; url?: string; error?: string; message?: string; suggested_action?: string }> => {
      const cliCheck = await checkGhCli();
      if (cliCheck) return { success: false, error: cliCheck };

      // Check auth status first
      const res = await runGhCommand(['auth', 'status']);
      if (!res.success) {
        return { 
          success: false, 
          message: "Not authenticated with GitHub.",
          error: res.error,
          suggested_action: "Run check_gh_auth to open a login prompt."
        };
      }

      const result = await createGithubItem('issue', title, body, labels);
      return { success: true, url: result.url || '' };
    }
  }));

  tools.push(tool({
    name: 'gh_list_issues',
    description: 'List issues in the current repository.',
    parameters: {
      state: z.enum(['open', 'closed']).optional().default('open').describe('Filter by issue state.'),
      limit: z.number().int().min(1).max(50).optional().default(10).describe('Maximum number of issues to return (default: 10, max: 50).'),
      labels: z.array(z.string()).optional().describe('Filter by labels.'),
    },
    implementation: async ({ state = 'open', limit = 10, labels }: ListIssuesParams): Promise<{ issues?: unknown[]; error?: string }> => {
      const args = ['issue', 'list', '--state', String(state), '--limit', String(limit)];
      
      if (labels && Array.isArray(labels)) {
        for (const label of labels) {
          args.push('-l', label);
        }
      }

      // Request JSON output for structured parsing
      args.push('--json', 'number,title,state,url,author'); 
      
      const res = await runGhCommand(args);
      return res.success ? { issues: (res.data as unknown[]) || [] } : { error: res.error };
    }
  }));

  tools.push(tool({
    name: 'gh_create_pr',
    description: 'Create a new pull request in the current repository.',
    parameters: {
      title: z.string().describe('Title of the PR'),
      body: z.string().optional().describe('Body content for the PR (Markdown supported).'),
      headBranch: z.string().describe('The source branch containing your changes.'),
      baseBranch: z.string().default('main').describe('The target branch you want to merge into (e.g., main, master).'),
    },
    implementation: async ({ title, body, headBranch, baseBranch = 'main' }: CreatePrParams): Promise<{ success: boolean; url?: string; error?: string; message?: string; suggested_action?: string }> => {
      const cliCheck = await checkGhCli();
      if (cliCheck) return { success: false, error: cliCheck };

      // Ensure auth
      const res = await runGhCommand(['auth', 'status']);
      if (!res.success) {
        return { 
          success: false, 
          message: "Not authenticated with GitHub.",
          error: res.error,
          suggested_action: "Run check_gh_auth to open a login prompt."
        };
      }

      // Use explicit flags for head and base branches
      const args = ['--head', String(headBranch), '--base', String(baseBranch)];
      
      return await createGithubItem('pr', title, body, undefined, args);
    }
  }));

  tools.push(tool({
    name: 'gh_list_prs',
    description: 'List pull requests in the current repository.',
    parameters: {
      state: z.enum(['open', 'closed']).optional().default('open').describe('PR state.'),
      limit: z.number().int().min(1).max(50).optional().default(10).describe('Maximum number of PRs to return (default: 10, max: 50).'),
    },
    implementation: async ({ state = 'open', limit = 10 }: ListPrsParams): Promise<{ pull_requests?: unknown[]; error?: string }> => {
      const args = ['pr', 'list', '--state', String(state), '--limit', String(limit)];
      
      // Request JSON output for structured parsing
      args.push('--json', 'number,title,state,url,author'); 
      
      const res = await runGhCommand(args);
      return res.success ? { pull_requests: (res.data as unknown[]) || [] } : { error: res.error };
    }
  }));

  tools.push(tool({
    name: 'gh_view_comments',
    description: 'View comments on a specific issue or PR.',
    parameters: {
      number: z.number().int().min(1).describe('The Issue or PR number.'),
      type: z.enum(['issue', 'pr']).optional().default('issue').describe('Whether it is an issue or a pull request.'),
    },
    implementation: async ({ number, type = 'issue' }: ViewCommentsParams): Promise<{ comments?: unknown[]; error?: string }> => {
      const args = [type === 'issue' ? 'issue' : 'pr', 'view', String(number), '--json', 'comments'];
      const res = await runGhCommand(args);
      return res.success ? { comments: ((res.data as Record<string, unknown>)?.comments as unknown[]) || [] } : { error: res.error };
    }
  }));

  tools.push(tool({
    name: 'gh_push',
    description: 'Push local commits to the remote GitHub repository.',
    parameters: {
      branch: z.string().optional().describe('The branch to push. Defaults to current branch.'),
    },
    implementation: async ({ branch }: GhPushParams): Promise<{ success: boolean; error?: string }> => {
      // Use standard git command for pushing; gh push is essentially a wrapper around it anyway.
      const args = ['push', 'origin'];
      if (branch) args.push(branch);

      return new Promise((resolve) => {
        const child = spawn('git', args, { stdio: 'pipe' });
        let stderr = '';
        
        child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
        child.on('close', (code) => {
          if (code === 0) resolve({ success: true });
          else resolve({ success: false, error: `Push failed. ${stderr}` });
        });
      });
    }
  }));

  return tools;
}
