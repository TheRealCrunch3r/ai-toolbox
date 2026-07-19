/**
 * GitHub CLI Tools Module
 * 
 * Provides GitHub CLI (gh) authentication and utility tools.
 * These tools complement the Git & GitHub tools in gitGithubTools.ts.
 */

import { tool, type Tool } from '@lmstudio/sdk';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config.js';

/**
 * Register GitHub CLI tools
 */
export function registerGitHubTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // check_gh_auth — Verify GitHub CLI authentication status
  tools.push(tool({
    name: 'check_gh_auth',
    description: 'Verify GitHub CLI (gh) authentication status. Check if gh CLI is installed and authenticated with GitHub.com before using other GitHub tools.',
    parameters: {},
    implementation: async () => {
      try {
        // Check if gh CLI is installed
        const checkInstall = await new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
          const proc = spawn('gh', ['--version'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
          });

          let stdout = '';
          let stderr = '';

          proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
          proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
          proc.on('close', (code) => {
            resolve({ stdout, stderr, exitCode: code || 0 });
          });
          proc.on('error', (err) => {
            resolve({ stdout: '', stderr: err.message, exitCode: 1 });
          });
        });

        if (checkInstall.exitCode !== 0) {
          return {
            success: false,
            error: 'GitHub CLI (gh) is not installed or not in PATH. Install it from: https://cli.github.com/',
          };
        }

        // Check authentication status
        const authStatus = await new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
          const proc = spawn('gh', ['auth', 'status'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
          });

          let stdout = '';
          let stderr = '';

          proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
          proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
          proc.on('close', (code) => {
            resolve({ stdout, stderr, exitCode: code || 0 });
          });
          proc.on('error', (err) => {
            resolve({ stdout: '', stderr: err.message, exitCode: 1 });
          });
        });

        if (authStatus.exitCode === 0) {
          return {
            success: true,
            data: {
              authenticated: true,
              ghVersion: checkInstall.stdout.trim().split('\n')[0],
              message: 'GitHub CLI is installed and authenticated.',
            },
          };
        } else {
          return {
            success: false,
            error: 'GitHub CLI is installed but not authenticated. Run "gh auth login" to authenticate.',
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to check gh auth status: ${message}` };
      }
    },
  }));

  return tools;
}
