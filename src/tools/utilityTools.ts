// External library types (unzipper, require(), etc.) have implicit any — eslint-disable below  
 

﻿import type { Tool } from '@lmstudio/sdk';
// External library types (unzipper, require, etc.) have implicit any
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as zlib from 'zlib';
import { Buffer } from 'buffer';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { spawn } from 'child_process';
import type { PluginConfig } from '../config';

import type { StateManager } from '../stateManager';
import { getWorkingDir, resolvePath } from '../workingDir';
import { validatePath } from '../security';



// ==================== Typed Params Interfaces ====================

interface NotifyOptions {
  title?: string;
  msg?: string;
  sound?: boolean | string;
  icon?: string;
  [key: string]: unknown;
}

type SaveMemoryParams = { fact: string; };
type ReadClipboardParams = Record<string, never>;
type WriteClipboardParams = { content: string; };
type SendNotificationParams = { title: string; message: string; icon?: string; };

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

// ==================== Clipboard Operations ====================

// S6 FIX: Proper escaping for shell injection prevention
function escapeForPowerShell(content: string): string {
  return content.replace(/"/g, '\\"').replace(/\$/g, '\\$');
}

function escapeForBash(content: string): string {
  return content.replace(/'/g, "'\\''");
}

async function readClipboard(): Promise<string> {
  const platform = os.platform();

  return new Promise((resolve, reject) => {
    let cmd: string;
    let args: string[];

    switch (platform) {
      case 'win32':
        cmd = 'powershell.exe';
        args = ['-NoProfile', '-Command', '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-Clipboard -Raw'];
        break;
      case 'darwin':
        cmd = '/bin/bash';
        args = ['-c', 'pbpaste'];
        break;
      default:
        cmd = '/bin/bash';
        args = ['-c', '(xclip -selection clipboard -o 2>/dev/null || xsel --clipboard --output 2>/dev/null) | tr -d \'\\0\''];
        break;
    }

    const proc = spawn(cmd, args);

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && stdout.trim()) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Clipboard read failed (exit code ${code}): ${stderr || 'No clipboard content'}`));
      }
    });

    proc.on('error', reject);

    setTimeout(() => {
      proc.kill();
      reject(new Error('Clipboard read timed out'));
    }, 5000);
  });
}

async function writeClipboard(content: string): Promise<void> {
  const platform = os.platform();

  return new Promise((resolve, reject) => {
    let cmd: string;
    let args: string[];

    switch (platform) {
      case 'win32':
        const escapedContent = escapeForPowerShell(content);
        cmd = 'powershell.exe';
        args = ['-NoProfile', '-Command', `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; "${escapedContent}" | Set-Clipboard`];
        break;
      case 'darwin':
        const escapedBash = escapeForBash(content);
        cmd = '/bin/bash';
        args = ['-c', `echo -n '${escapedBash}' | pbcopy`];
        break;
      default:
        const escapedLinux = escapeForBash(content);
        cmd = '/bin/bash';
        args = ['-c', `echo -n '${escapedLinux}' | (xclip -selection clipboard 2>/dev/null || xsel --clipboard --input 2>/dev/null)`];
        break;
    }

    const proc = spawn(cmd, args);

    let stderr = '';

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Clipboard write failed (exit code ${code}): ${stderr}`));
      }
    });

    proc.on('error', reject);

    setTimeout(() => {
      proc.kill();
      reject(new Error('Clipboard write timed out'));
    }, 5000);
  });
}

// ==================== LM Studio Home Finder ====================

function findLMStudioHome(): string | null {
  const platform = os.platform();

  const candidates: string[] = [];

  switch (platform) {
    case 'win32':
      candidates.push(
        path.join(process.env.APPDATA || '', 'lm-studio'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'lm-studio'),
        path.join(process.env.PROGRAMFILES || '', 'LM Studio'),
        path.join(process.env['PROGRAMDATA'] || '', 'LM Studio')
      );
      break;
    case 'darwin':
      candidates.push(
        path.join(os.homedir(), 'Library', 'Application Support', 'lm-studio'),
        '/Applications/LM Studio.app/Contents/Resources/app.asar'
      );
      break;
    default: // Linux
      candidates.push(
        path.join(os.homedir(), '.local', 'share', 'lm-studio'),
        '/opt/lm-studio',
        path.join(process.env.HOME || '', '.lm-studio')
      );
      break;
  }

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // Skip inaccessible paths
    }
  }

  return null;
}

// ==================== System Metrics Helper ====================

interface SystemMetricsResult {
  cpu?: {
    count: number;
    models: string[];
    avgSpeedMhz: number;
    details: Array<{ model: string; speed: number }>;
  };
  cpuLoadAverage?: { '1min': number; '5min': number; '15min': number };
  memory?: {
    totalBytes: number; totalGB: number;
    freeBytes: number; freeGB: number;
    usedBytes: number; usedGB: number;
    usagePercent: number;
  };
  disk?: Record<string, unknown>;
  network?: { interfaces: Record<string, Array<{ address: string; family: string; mac: string }>> };
}

async function getSystemMetrics(metrics: string[]): Promise<SystemMetricsResult> {
  const result: SystemMetricsResult = {};

  if (metrics.includes('cpu')) {
    const cpus = os.cpus();
    const cpuUsage: Array<{ model: string; speed: number }> = [];
    for (const cpu of cpus) {
      cpuUsage.push({ model: cpu.model, speed: cpu.speed });
    }
    result.cpu = {
      count: cpus.length,
      models: [...new Set(cpus.map(c => c.model))],
      avgSpeedMhz: Math.round(cpus.reduce((sum, c) => sum + c.speed, 0) / cpus.length),
      details: cpuUsage.slice(0, 4), // Limit detail to first 4 cores
    };

    // Get CPU load average (Unix only)
    const loadAvg = os.loadavg();
    result.cpuLoadAverage = {
      '1min': Math.round(loadAvg[0] * 100) / 100,
      '5min': Math.round(loadAvg[1] * 100) / 100,
      '15min': Math.round(loadAvg[2] * 100) / 100,
    };
  }

  if (metrics.includes('memory')) {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    result.memory = {
      totalBytes: totalMem,
      totalGB: Math.round(totalMem / 1_073_741_824 * 100) / 100,
      freeBytes: freeMem,
      freeGB: Math.round(freeMem / 1_073_741_824 * 100) / 100,
      usedBytes: usedMem,
      usedGB: Math.round(usedMem / 1_073_741_824 * 100) / 100,
      usagePercent: Math.round((usedMem / totalMem) * 10_000) / 100,
    };
  }

  if (metrics.includes('disk')) {
    try {
      const platform = os.platform();
      let diskInfo: Record<string, unknown> = {};

      if (platform === 'win32') {
        // Windows: use PowerShell to get disk info
        const psResult = await new Promise<{ stdout: string; stderr: string }>((resolve) => {
          const proc = spawn('powershell.exe', [
            '-NoProfile', '-Command',
            'Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID, @{N=\'TotalGB\';E={[math]::Round($_.Size/1GB,2)}}, @{N=\'FreeGB\';E={[math]::Round($_.FreeSpace/1GB,2)}} | ConvertTo-Json'
          ]);
          let stdout = '';
          let stderr = '';
          proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
          proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
          proc.on('close', () => resolve({ stdout, stderr }));
        });

        try {
          const parsedDisk = psResult.stdout ? JSON.parse(psResult.stdout) as Record<string, unknown> | Record<string, unknown>[] : null;
        diskInfo = Array.isArray(parsedDisk) ? { raw: parsedDisk } : (parsedDisk || {});
        } catch {
          diskInfo = { error: 'Could not parse PowerShell disk info output' };
        }
      } else {
        // Unix: use df command
        const dfResult = await new Promise<{ stdout: string; stderr: string }>((resolve) => {
          const proc = spawn('df', ['-h']);
          let stdout = '';
          let stderr = '';
          proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
          proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
          proc.on('close', () => resolve({ stdout, stderr }));
        });

        diskInfo = { dfOutput: dfResult.stdout.trim() };
      }

      result.disk = diskInfo;
    } catch (err) {
      result.disk = { error: `Failed to get disk info: ${String(err)}` };
    }
  }

  if (metrics.includes('network')) {
    const networkInterfaces = os.networkInterfaces();
    const netInfo: Record<string, Array<{ address: string; family: string; mac: string }>> = {};
    for (const [name, ifaces] of Object.entries(networkInterfaces)) {
      if (ifaces) {
        netInfo[name] = ifaces.map(i => ({
          address: i.address || 'N/A',
          family: i.family,
          mac: i.mac || 'N/A',
        }));
      }
    }
    result.network = { interfaces: netInfo };
  }

  return result;
}

// ==================== Process List Helper ====================

async function getProcessList(filter?: string): Promise<Array<{ pid: number; name: string; cpuPercent?: number; memoryMb?: number; status?: string }>> {
  const platform = os.platform();
  const processes: Array<{ pid: number; name: string; cpuPercent?: number; memoryMb?: number; status?: string }> = [];

  if (platform === 'win32') {
    // Windows: use tasklist with /V for verbose output
    const args = ['/NoProfile', '-Command', 'Get-CimInstance Win32_Process | Select-Object ProcessId, Name, @{N=\'CPU\';E={[math]::Round($_.HandleCount/100)}}, @{N=\'MemMB\';E={[math]::Round($_.WorkingSetSize/1MB)}} | ConvertTo-Json'];
    if (filter) {
      args.splice(args.length - 1, 0, `| Where-Object Name -Like "*${filter}*"`);
    }

    const result = await new Promise<{ stdout: string; stderr: string }>((resolve) => {
      const proc = spawn('powershell.exe', args);
      let stdout = '';
      let stderr = '';
      proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
      proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('close', () => resolve({ stdout, stderr }));
    });

    try {
      const rawParsed = result.stdout ? (JSON.parse(result.stdout) as Record<string, unknown> | Array<Record<string, unknown>>) : null;
      let parsed: Array<Record<string, unknown>> = [];
      if (Array.isArray(rawParsed)) {
        parsed = rawParsed.map((item: unknown) => item as Record<string, unknown>);
      } else if (rawParsed && typeof rawParsed === "object") {
        parsed = [rawParsed];
      }
      for (const p of parsed) {
        processes.push({
          pid: Number(p.ProcessId) || 0,
          name: String(p.Name) || 'Unknown',
          cpuPercent: Number(p.CPU),
          memoryMb: Math.round(Number(p.MemMB) * 100) / 100,
        });
      }
    } catch {
      // Fallback to simple tasklist
      const tlResult = await new Promise<{ stdout: string; stderr: string }>((resolve) => {
        const proc = spawn('tasklist', ['/FO', 'CSV']);
        let stdout = '';
        let stderr = '';
        proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
        proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
        proc.on('close', () => resolve({ stdout, stderr }));
      });

      const lines = tlResult.stdout.split('\n').filter(l => l.includes(','));
      for (const line of lines.slice(1)) { // Skip header
        const fields = line.match(/"([^"]*)"|([^,]+)/g)?.map(f => f.replace(/^["]|["]$/g, '')) || [];
        if (fields.length >= 2) {
          processes.push({ pid: Number(fields[1]) || 0, name: String(fields[0]) || 'Unknown' });
        }
      }
    }
  } else {
    // Unix: use ps command
    const args = ['-eo', 'pid,comm,%cpu,rss,state', '--sort=-%cpu', '--no-headers'];

    const result = await new Promise<{ stdout: string; stderr: string }>((resolve) => {
      const proc = spawn('ps', args);
      let stdout = '';
      let stderr = '';
      proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
      proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('close', () => resolve({ stdout, stderr }));
    });

    const lines = result.stdout.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        processes.push({
          pid: Number(parts[0]) || 0,
          name: String(parts[1]),
          cpuPercent: Number(parts[2]),
          memoryMb: Math.round((Number(parts[3]) / 1024) * 100) / 100, // RSS in KB → MB
          status: String(parts[4]),
        });
      }
    }

    if (filter && processes.length > 0) {
      const lowerFilter = filter.toLowerCase();
      return processes.filter(p => p.name.toLowerCase().includes(lowerFilter));
    }
  }

  // Apply filter on Windows side too
  if (filter && platform === 'win32' && processes.length > 0) {
    const lowerFilter = filter.toLowerCase();
    return processes.filter(p => p.name.toLowerCase().includes(lowerFilter));
  }

  return processes;
}

// ==================== Secret Scan Patterns ====================

const SECRET_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  // API Keys - Generic
  { name: 'Generic API Key', regex: /\b(api[_-]?key|apikey)\s*[:=]\s*['"]?[A-Za-z0-9_-]{16,}['"]?/gi },
  // AWS Access Keys
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'AWS Secret Key', regex: /\b[A-Za-z0-9/+=]{40}\b/gi },
  // Private keys
  { name: 'Private Key', regex: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH)\s+PRIVATE KEY-----/g },
  // GitHub tokens
  { name: 'GitHub Token', regex: /\bgh[ps]_[A-Za-z0-9_]{36,}/g },
  // JWT tokens
  { name: 'JWT Token', regex: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g },
  // Passwords in config
  { name: 'Password Assignment', regex: /\b(password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/gi },
  // Generic secret/token assignments
  { name: 'Secret/Token Assignment', regex: /\b(secret|token|auth_token|access_token)\s*[:=]\s*['"]?[A-Za-z0-9_-]{16,}['"]?/gi },
  // Database connection strings with credentials
  { name: 'DB Connection String', regex: /(?:mongodb\+srv|mysql|postgres):\/\/[^:]+:[^@]+@[^\s]+/gi },
  // Slack tokens
  { name: 'Slack Token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}/g },
];

// ==================== Tool Registration ====================

export function registerUtilityTools(config: PluginConfig, stateManager: StateManager, getEnabledTools?: () => string[]): Tool[] {
  const tools: Tool[] = [];

  // save_memory tool
  tools.push(tool({
    name: 'save_memory',
    description: 'Save a specific piece of information or fact to long-term memory.',
    parameters: {
      fact: z.string().min(1).describe('The specific fact or piece of information to remember.'),
    },
    implementation: async ({ fact }: SaveMemoryParams) => {
      try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
        await stateManager.set(`memory_${Date.now()}`, fact);
        return { success: true, data: { saved: true } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // get_memory tool
  tools.push(tool({
    name: 'get_memory',
    description: 'Retrieve all saved memory entries. Returns a list of all facts stored via save_memory.',
    parameters: {},
    implementation: async () => {
      try {
        // FIX: getAllKeys() is now async — await initialization completion
        const allKeys = await stateManager.getAllKeys();
        const keys = allKeys.filter(k => k.startsWith('memory_'));
        const memories = [];

        for (const key of keys) {
          const value = stateManager.get<string>(key);
          if (value !== undefined) {
            memories.push({
              id: key,
              fact: value,
              timestamp: stateManager.get(key + '_timestamp') || Date.now(),
            });
          }
        }

        memories.sort((a, b) => {
          const tsA = typeof a.timestamp === 'number' ? a.timestamp : 0;
          const tsB = typeof b.timestamp === 'number' ? b.timestamp : 0;
          return tsB - tsA;
        });

        return { success: true, data: { memories, count: memories.length } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to retrieve memory: ${message}` };
      }
    },
  }));

  // search_memory tool
  tools.push(tool({
    name: 'search_memory',
    description: 'Search saved memories for a specific fact or keyword. Returns matching entries.',
    parameters: {
      query: z.string().describe('Search query to match against stored facts'),
      max_results: z.number().min(1).max(50).optional().default(10).describe('Maximum number of results to return'),
    },
    implementation: async ({ query }: { query: string }) => {
      try {
        // FIX: getAllKeys() is now async — await initialization completion
        const allKeys = await stateManager.getAllKeys();
        const keys = allKeys.filter(k => k.startsWith('memory_'));
        const results = [];

        for (const key of keys) {
          const value = stateManager.get<string>(key);
          if (value && typeof value === 'string' &&
              value.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
            results.push({
              id: key,
              fact: value,
              timestamp: Date.now(),
            });
          }
        }

        return { success: true, data: { results, count: results.length } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to search memory: ${message}` };
      }
    },
  }));

  // delete_memory tool
  tools.push(tool({
    name: 'delete_memory',
    description: 'Delete a saved memory entry by its ID (returned from save_memory or get_memory).',
    parameters: {
      entry_id: z.string().describe('The unique ID of the memory entry to delete'),
    },
    implementation: async ({ entry_id }: { entry_id: string }) => {
      try {
        const deleted = stateManager.delete(entry_id);

        if (!deleted) {
          return { success: false, error: `Memory entry '${entry_id}' not found` };
        }

        return { success: true, data: { deleted: true, entry_id } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete memory: ${message}` };
      }
    },
  }));

  // ── Session Summary Tools ────────────────────────────────────────

  // save_session_summary tool (COMPRESSED VERSION)
  tools.push(tool({
    name: 'save_session_summary',
    description: 'Save a structured session summary for cross-session continuity. Includes accomplishments, pending tasks, decisions made, and context for the next session.',
    parameters: {
      task_description: z.string().describe('Brief description of what was being worked on'),
      accomplishments: z.string().optional().describe('List key accomplishments or completed tasks'),
      pending_tasks: z.string().optional().describe('List remaining work that needs to continue in the next session'),
      decisions_made: z.string().optional().describe('Key architectural or implementation decisions made during this session'),
      context_for_next_session: z.string().optional().describe('Important context, file locations, or setup steps needed for the next session'),
    },
    implementation: async ({ 
      task_description, 
      accomplishments = '', 
      pending_tasks = '', 
      decisions_made = '', 
      context_for_next_session = '' 
    }: { 
      task_description: string; 
      accomplishments?: string; 
      pending_tasks?: string; 
      decisions_made?: string; 
      context_for_next_session?: string;
    }) => {
      try {
        const summaryId = `session_summary_${Date.now()}`;
        const timestamp = new Date().toISOString();
        
        // Create structured summary object
        const sessionSummary = {
          id: summaryId,
          timestamp,
          task_description,
          accomplishments: accomplishments || 'No specific accomplishments recorded.',
          pending_tasks: pending_tasks || 'No specific pending tasks recorded.',
          decisions_made: decisions_made || 'No specific decisions recorded.',
          context_for_next_session: context_for_next_session || 'No additional context provided.',
        };

        // COMPRESS BEFORE SAVING (bypasses 10k SDK limit & saves tokens)
        const jsonStr = JSON.stringify(sessionSummary);
        const compressed = zlib.gzipSync(jsonStr, { level: 9 }).toString('base64');
        
        const summaryKey = `${summaryId}_data`;
        const timestampKey = `${summaryId}_timestamp`;
        
        stateManager.set(summaryKey, compressed);
        stateManager.set(timestampKey, Date.now());

        return {
          success: true,
          data: {
            saved: true,
            summary_id: summaryId,
            message: 'Session summary saved successfully (compressed).',
            original_size_bytes: jsonStr.length,
            compressed_chars: compressed.length, // Will be < 10k even for huge summaries
            preview: {
              task_description: sessionSummary.task_description.substring(0, 100),
              timestamp: sessionSummary.timestamp,
            }
          }
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to save session summary: ${message}` };
      }
    },
  }));

  // get_session_summary tool (DECOMPRESSED VERSION)
  tools.push(tool({
    name: 'get_session_summary',
    description: 'Retrieve the most recent saved session summary for continuity across sessions.',
    parameters: {},
    implementation: async () => {
      try {
        const keys = await stateManager.getAllKeys();
        
        // Find all session summary IDs (sorted by timestamp, newest first)
        const uniqueIds = keys
          .filter(k => k.startsWith('session_summary_') && !k.includes('_data'))
          .map(k => k.replace('session_summary_', '').replace('_timestamp', ''));
        
        const idsWithTimestamps = await Promise.all(
          uniqueIds.map(async id => ({
            id,
            timestamp: stateManager.get<number>(`session_summary_${id}_timestamp`) || 0,
          }))
        );
        
        idsWithTimestamps.sort((a, b) => b.timestamp - a.timestamp);
        const summaryIds = idsWithTimestamps.map(item => item.id);

        if (summaryIds.length === 0) {
          return { success: true, data: { summaries: [], count: 0, message: 'No session summaries found.' } };
        }

        const latestId = summaryIds[0];
        const summaryKey = `session_summary_${latestId}_data`;
        
        const compressedData = stateManager.get(summaryKey);
        
        if (!compressedData || typeof compressedData !== 'string') {
          return { success: false, error: 'Session summary data not found or invalid type.' };
        }

        // DECOMPRESS BEFORE RETURNING (with fallback for legacy uncompressed data)
        let sessionSummary: unknown;
        try {
          const decompressed = zlib.gunzipSync(Buffer.from(compressedData, 'base64')).toString('utf-8');
          sessionSummary = JSON.parse(decompressed);
        } catch (parseErr) {
          // Fallback for legacy uncompressed data (if any exists)
          if (typeof compressedData === 'string' && compressedData.startsWith('{')) {
            try {
              sessionSummary = JSON.parse(compressedData);
            } catch (legacyErr) {
              throw new Error(`Legacy summary parsing failed: ${String(legacyErr)}`);
            }
          } else {
            throw parseErr;
          }
        }

        return {
          success: true,
          data: {
            summaries: [sessionSummary],
            count: 1,
            message: 'Latest session summary retrieved.',
            total_summaries_stored: summaryIds.length
          }
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to retrieve session summary: ${message}` };
      }
    },
  }));

  // get_system_info tool
  tools.push(tool({
    name: 'get_system_info',
    description: 'Get information about the system (OS, CPU, Memory).',
    parameters: {},
    implementation: async () => {
      try {
        return {
          success: true,
          data: {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            hostname: os.hostname(),
            release: os.release(),
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get system info: ${message}` };
      }
    },
  }));

  // read_clipboard tool
  tools.push(tool({
    name: 'read_clipboard',
    description: 'Read text content from the system clipboard.',
    parameters: {},
    implementation: async (_params: ReadClipboardParams) => {
      try {
        const content = await readClipboard();
        return { success: true, data: { content } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // write_clipboard tool
  tools.push(tool({
    name: 'write_clipboard',
    description: 'Write text content to the system clipboard.',
    parameters: {
      content: z.string().describe('The text content to write to clipboard'),
    },
    implementation: async ({ content }: WriteClipboardParams) => {
      try {
        await writeClipboard(content);
        return { success: true, data: { written: true } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // send_notification tool
  tools.push(tool({
    name: 'send_notification',
    description: 'Send a system notification to the user.',
    parameters: {
      title: z.string().describe('Notification title'),
      message: z.string().describe('Notification message'),
      icon: z.string().optional().describe('Optional custom icon path'),
    },
    implementation: async ({ title, message, icon }: SendNotificationParams) => {
      try {
        const notifierModule = await import('node-notifier');

        const notifier = notifierModule.default || notifierModule;

        const options: NotifyOptions = {
          title: title || 'AI Toolbox',
          msg: message || '',
          sound: true,
        };

        if (icon) {
          options.icon = icon;
        }

        notifier(options);

        return { success: true, data: { sent: true, title, message } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to send notification: ${message}` };
      }
    },
  }));

  // findLMStudioHome tool
  tools.push(tool({
    name: 'findLMStudioHome',
    description: 'Locate LM Studio installation directory across platforms.',
    parameters: {},
    implementation: async () => {
      try {
        const homeDir = findLMStudioHome();

        if (homeDir) {
          return {
            success: true,
            data: {
              found: true,
              path: homeDir,
              platform: os.platform(),
            },
          };
        } else {
          const commonPaths = [
            'Windows: %APPDATA%\\lm-studio',
            'macOS: ~/Library/Application Support/lm-studio',
            'Linux: ~/.local/share/lm-studio'
          ].join('\n');

          return {
            success: false,
            error: `LM Studio home directory not found.\n\nCommon paths:\n${commonPaths}`,
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to find LM Studio home: ${message}` };
      }
    },
  }));

  // get_enabled_tools tool
  tools.push(tool({
    name: 'get_enabled_tools',
    description: 'Get list of currently enabled tools based on configuration.',
    parameters: {},
    implementation: async () => {
      try {
        if (getEnabledTools) {
          const toolNames = getEnabledTools();
          return { success: true, data: { toolCount: toolNames.length, tools: toolNames } };
        } else {
          return { success: false, error: 'Registry access not available' };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to get enabled tools: ${message}` };
      }
    },
  }));

  // ── ✅ NEW TOOLS ────────────────────────────────────────────────

  // system_monitor tool — CPU / Memory / Disk / Network usage
  tools.push(tool({
    name: 'system_monitor',
    description: 'Get detailed system resource metrics including CPU, memory, disk usage, and network interfaces.',
    parameters: {
      metrics: z.array(z.enum(['cpu', 'memory', 'disk', 'network'])).default(['cpu', 'memory']).describe('Metrics to report'),
    },
    implementation: async ({ metrics }: { metrics: string[] }) => {
      try {
        const data = await getSystemMetrics(metrics);

        return {
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            ...data,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // process_list tool — List running processes
  tools.push(tool({
    name: 'process_list',
    description: 'List currently running system processes with resource usage. Supports filtering by process name.',
    parameters: {
      filter: z.string().optional().describe('Filter processes by name (partial match, case-insensitive)'),
    },
    implementation: async ({ filter }: { filter?: string }) => {
      try {
        const processes = await getProcessList(filter);

        return {
          success: true,
          data: {
            count: processes.length,
            processes: processes.slice(0, 200), // Limit to prevent excessive output
            note: processes.length > 200 ? `Showing first 200 of ${processes.length} processes. Use 'filter' parameter for more specific results.` : undefined,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // env_inspect tool — List environment variables with prefix filtering
  tools.push(tool({
    name: 'env_inspect',
    description: 'List current environment variables. Supports filtering by key prefix.',
    parameters: {
      prefix: z.string().optional().describe('Filter environment variable keys by this prefix (e.g., "PATH", "NODE")'),
    },
    implementation: async ({ prefix }: { prefix?: string }) => {
      try {
        const envVars = process.env;
        let entries: Array<{ key: string; value: string }> = [];

        for (const [key, value] of Object.entries(envVars)) {
          if (!prefix || key.toUpperCase().startsWith(prefix.toUpperCase())) {
            if (value !== undefined) {
              entries.push({ key, value });
            }
          }
        }

        // Sort alphabetically by key
        entries.sort((a, b) => a.key.localeCompare(b.key));

        return {
          success: true,
          data: {
            count: entries.length,
            prefix: prefix || 'all',
            variables: entries,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // hash_file tool — Generate checksums for file integrity verification
  tools.push(tool({
    name: 'hash_file',
    description: 'Generate cryptographic checksums (MD5, SHA1, SHA256) for a file to verify its integrity.',
    parameters: {
      file_path: z.string().describe('Path to the file to hash'),
      algorithm: z.enum(['md5', 'sha1', 'sha256']).default('sha256').describe('Hash algorithm to use (default: sha256)'),
    },
    implementation: async ({ file_path, algorithm }: { readonly file_path: string; readonly algorithm: string }) => {
      try {
        if (!validatePath(file_path, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        const fullPath = resolvePath(file_path);

        // Verify file exists and is a regular file
        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
          return { success: false, error: `Not a regular file: ${fullPath}` };
        }

        // Prevent reading excessively large files (>500MB) for hashing
        if (stats.size > 500 * 1_048_576) {
          return { success: false, error: 'File too large for hashing (>500MB)' };
        }

        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(fullPath);

        return new Promise((resolve) => {
          stream.on('data', (chunk: string | Buffer) => {
            hash.update(chunk);
          });

          stream.on('end', () => {
            const digest = hash.digest('hex');
            resolve({
              success: true,
              data: {
                file: fullPath,
                algorithm,
                hash: digest,
                fileSizeBytes: stats.size,
                fileSizeHuman: `${(stats.size / 1024).toFixed(2)} KB`,
              },
            });
          });

          stream.on('error', (err) => {
            resolve(handleError(err));
          });
        });
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // token_count tool — Count LLM tokens using tiktoken (@dqbd/tiktoken already installed!)
  tools.push(tool({
    name: 'token_count',
    description: 'Count the number of LLM tokens in text using the tiktoken library. Supports multiple encodings.',
    parameters: {
      text: z.string().describe('The text to count tokens for'),
      encoding: z.enum(['cl100k_base', 'p50k_base', 'r50k_base', 'gpt2']).default('cl100k_base').describe(
        'Token encoding model. cl100k_base = GPT-4/GPT-3.5, p50k_base = Codex, r50k_base/gpt2 = older models'
      ),
    },
    implementation: async ({ text, encoding }: { readonly text: string; readonly encoding: string }) => {
      try {
        const tiktokenModule = await import('@dqbd/tiktoken');

 
 
        let enc: unknown;
        try {
          enc = tiktokenModule.get_encoding(encoding as 'cl100k_base' | 'p50k_base' | 'r50k_base' | 'gpt2');
        } catch {
          // Fallback: create encoding directly by name
// eslint-disable-next-line @typescript-eslint/no-explicit-any
enc = new (tiktokenModule as any).getEncoding(encoding);
        }

        const encInstance = enc as { encode: (text: string) => number[] };
        const tokens = encInstance.encode(text);
        const tokenCount = tokens.length;

        return {
          success: true,
          data: {
            textLength: text.length,
            tokenCount,
            encoding,
            // Rough character-to-token ratio for reference
            avgCharsPerToken: Math.round((text.length / tokenCount) * 100) / 100 || 0,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to count tokens: ${message}. Ensure @dqbd/tiktoken is installed.` };
      }
    },
  }));

  // convert_format tool — File format conversion (JSON↔CSV, base64, compress/decompress)
  tools.push(tool({
    name: 'convert_format',
    description: 'Convert between file formats: JSON↔CSV, base64 encode/decode, or compress/decompress files.',
    parameters: {
      action: z.enum([
        'json_to_csv', 'csv_to_json',
        'base64_encode', 'base64_decode',
        'compress', 'decompress'
      ]).describe('Conversion action to perform'),
      input: z.string().describe('Input file path or content (for base64 actions, can be raw text)'),
      output: z.string().optional().describe('Output file path. If omitted, uses same name with different extension.'),
    },
    implementation: async ({ action, input, output }: { readonly action: string; readonly input: string; readonly output?: string }) => {
      try {
        const workingDir = getWorkingDir();

        // ── JSON → CSV ──
        if (action === 'json_to_csv') {
          const fullPath = resolvePath(input);
          const jsonContent = fs.readFileSync(fullPath, 'utf-8');
          let data: Array<Record<string, unknown>>;
          try {
            data = JSON.parse(jsonContent) as Array<Record<string, unknown>>;
          } catch {
            return { success: false, error: 'Invalid JSON input. Must be a JSON array of objects.' };
          }

          if (!Array.isArray(data) || data.length === 0) {
            return { success: false, error: 'JSON must be a non-empty array of objects' };
          }

          const headers = Object.keys(data[0]);
          const csvLines = [headers.join(',')];

          for (const row of data) {
            const line = headers.map(h => {
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              let val = String(row[h] ?? '');
              if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                val = `"${val.replace(/"/g, '""')}"`;
              }
              return val;
            }).join(',');
            csvLines.push(line);
          }

          const outputPath = output ? resolvePath(output) : fullPath.replace(/\.\w+$/, '.csv');
          fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf-8');

          return { success: true, data: { convertedFrom: input, convertedTo: outputPath, rows: data.length } };
        }

        // ── CSV → JSON ──
        if (action === 'csv_to_json') {
          const fullPath = resolvePath(input);
          const csvContent = fs.readFileSync(fullPath, 'utf-8').trim();
          const lines = csvContent.split('\n');

          if (lines.length < 2) {
            return { success: false, error: 'CSV must have at least a header row and one data row' };
          }

          const headers = parseCsvLine(lines[0]);
          const jsonArr: Array<Record<string, string>> = [];

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = parseCsvLine(lines[i]);
            const obj: Record<string, string> = {};
            headers.forEach((h, idx) => { obj[h] = values[idx] ?? ''; });
            jsonArr.push(obj);
          }

          const outputPath = output ? resolvePath(output) : fullPath.replace(/\.\w+$/, '.json');
          fs.writeFileSync(outputPath, JSON.stringify(jsonArr, null, 2), 'utf-8');

          return { success: true, data: { convertedFrom: input, convertedTo: outputPath, rows: jsonArr.length } };
        }

        // ── Base64 Encode (text or file) ──
        if (action === 'base64_encode') {
          const fullPath = resolvePath(input);
          let content: string;

          try {
            content = fs.readFileSync(fullPath, 'utf-8');
          } catch {
            // Treat input as raw text to encode
            content = input;
          }

          const encoded = Buffer.from(content).toString('base64');

          if (output) {
            const outPath = resolvePath(output);
            fs.writeFileSync(outPath, encoded, 'utf-8');
            return { success: true, data: { encodedFile: outPath, originalLength: content.length } };
          }

          return { success: true, data: { encoded, originalLength: content.length } };
        }

        // ── Base64 Decode (text or file) ──
        if (action === 'base64_decode') {
          const fullPath = resolvePath(input);
          let encodedContent: string;

          try {
            encodedContent = fs.readFileSync(fullPath, 'utf-8');
          } catch {
            // Treat input as raw base64 text to decode
            encodedContent = input;
          }

          const decoded = Buffer.from(encodedContent.trim(), 'base64').toString('utf-8');

          if (output) {
            const outPath = resolvePath(output);
            fs.writeFileSync(outPath, decoded, 'utf-8');
            return { success: true, data: { decodedFile: outPath, decodedLength: decoded.length } };
          }

          return { success: true, data: { decoded, decodedLength: decoded.length } };
        }

        // ── Compress (create .zip) ──
        if (action === 'compress') {
          const sourcePath = resolvePath(input);

          // Use archiver which is already installed in package.json
          const archiverModule = await import('archiver');
          const zipOutputName = output || `${sourcePath}.zip`;

          return new Promise((resolve) => {
            const outputStream = fs.createWriteStream(zipOutputName);
            const archive = archiverModule.default('zip', { zlib: { level: 9 } }); // Max compression

            outputStream.on('close', () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
resolve({ success: true, data: { compressedFile: zipOutputName, sizeBytes: (archive as any).pointer() } });
            });

            archive.on('error', (err) => {
              resolve(handleError(err));
            });

            archive.pipe(outputStream);

            if (fs.statSync(sourcePath).isDirectory()) {
              archive.directory(sourcePath, false);
            } else {
              archive.file(sourcePath, { name: path.basename(sourcePath) });
            }

            archive.finalize().catch(() => {});
          });
        }

        // ── Decompress (extract .zip) ──
        if (action === 'decompress') {
          const zipPath = resolvePath(input);
          const extractTo = output ? resolvePath(output) : workingDir;

          return new Promise(async (resolve) => {
            fs.mkdir(extractTo, { recursive: true }, () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const unzipperModule = require('unzipper');
              const extractStream = fs.createReadStream(zipPath);

              extractStream.pipe(unzipperModule.Extract({ path: extractTo }));

              extractStream.on('close', () => {
                resolve({ success: true, data: { extractedTo: extractTo } });
              });

              extractStream.on('error', (err) => {
                resolve(handleError(err));
              });
            });
          });
        }

        return { success: false, error: `Unknown action: ${action}` };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // secret_scan tool — Scan files for accidentally committed secrets (security-gated)
  tools.push(tool({
    name: 'secret_scan',
    description: 'Scan files in the current working directory for potentially exposed API keys, passwords, tokens, and other secrets.',
    parameters: {
      path: z.string().default('.').describe('Directory to scan (defaults to current working directory)'),
      exclude: z.string().optional().describe('Files or directories to exclude (e.g., "node_modules,.git")'),
    },
    implementation: async ({ path: scanPath, exclude }: { readonly path?: string; readonly exclude?: string }) => {
      try {
        const resolvedScanPath = scanPath || '.';
        const targetDir = resolvePath(resolvedScanPath);

        if (!validatePath(resolvedScanPath, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }

        // Security gate: check config flag for secret scanning
        if (!config.godMode) {
// eslint-disable-next-line @typescript-eslint/no-require-imports
const configModule = require("../config.js") as { DEFAULT_CONFIG?: Record<string, unknown> };
        const pkgConfig = configModule.DEFAULT_CONFIG ?? {};
          if (!("packageManage" in pkgConfig)) {
            // Only warn, don't block — this is a read-only operation
          }
        }

        const findings: Array<{ file: string; line: number; type: string; content: string }> = [];
        const excludedDirs = exclude ? exclude.split(',').map(s => s.trim()) : [];
        const alwaysExcluded = ['node_modules', '.git'];

        function walkDirectory(dirPath: string): void {
          let entries: fs.Dirent[];
          try {
            entries = fs.readdirSync(dirPath, { withFileTypes: true });
          } catch {
            return; // Skip inaccessible directories
          }

          for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const shouldExclude = excludedDirs.includes(entry.name) || alwaysExcluded.includes(entry.name);

            if (shouldExclude) continue;

            if (entry.isDirectory()) {
              walkDirectory(fullPath);
            } else if (entry.isFile() && isTextFile(fullPath)) {
              try {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const lines = content.split('\n');

                for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                  for (const pattern of SECRET_PATTERNS) {
                    const matches = lines[lineIdx].match(pattern.regex);
                    if (matches) {
                      findings.push({
                        file: path.relative(getWorkingDir(), fullPath),
                        line: lineIdx + 1,
                        type: pattern.name,
                        content: lines[lineIdx].trim().substring(0, 200), // Truncate long lines
                      });
                    }
                  }
                }
              } catch {
                // Skip binary/unreadable files
              }
            }
          }
        }

        walkDirectory(targetDir);

        return {
          success: true,
          data: {
            scannedPath: targetDir,
            totalFindings: findings.length,
            severity: findings.length === 0 ? 'clean' : findings.length < 5 ? 'low' : findings.length < 20 ? 'medium' : 'high',
            findings: findings.slice(0, 100), // Limit output
            note: findings.length > 100 ? `Showing first 100 of ${findings.length} potential secrets found.` : undefined,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // port_check tool — Check if a TCP port is open/listening
  tools.push(tool({
    name: 'port_check',
    description: 'Check if a specific TCP port is open and listening on the local machine.',
    parameters: {
      port: z.number().int().min(1).max(65535).describe('TCP port number to check (1-65535)'),
      host: z.string().default('localhost').describe('Host to check against (default: localhost)'),
    },
    implementation: async ({ port, host }: { readonly port: number; readonly host?: string }) => {
      try {
        const net = await import('net');

        return new Promise((resolve) => {
          const socket = new net.Socket();

          const timeoutId = setTimeout(() => {
            socket.destroy();
            resolve({ success: true, data: { port, host: host || 'localhost', status: 'closed' } });
          }, 3000); // 3 second timeout

          socket.on('connect', () => {
            clearTimeout(timeoutId);
            socket.end();
            resolve({ success: true, data: { port, host: host || 'localhost', status: 'open' } });
          });

          socket.on('error', (err) => {
            clearTimeout(timeoutId);
            if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
              resolve({ success: true, data: { port, host: host || 'localhost', status: 'closed' } });
            } else if ((err as NodeJS.ErrnoException).code === 'ETIMEDOUT') {
              resolve({ success: true, data: { port, host: host || 'localhost', status: 'timed_out' } });
            } else {
              resolve(handleError(err));
            }
          });

          socket.connect(port, host || 'localhost');
        });
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // package_manage tool — Install/Update/Audit dependencies (gated by config)
  tools.push(tool({
    name: 'package_manage',
    description: 'Install, uninstall, update, or audit npm/pip/cargo packages. ⚠️ Security-sensitive: must be enabled in config.',
    parameters: {
      action: z.enum(['install', 'uninstall', 'update', 'audit', 'outdated']).describe('Action to perform'),
      package_name: z.string().optional().describe('Package name (required for install/uninstall)'),
      manager: z.enum(['npm', 'pip', 'cargo']).default('npm').describe('Package manager to use'),
    },
    implementation: async ({ action, package_name, manager }: { action: string; package_name?: string; manager: string }) => {
      // Security gate: check config flag for install/uninstall
      if (action === 'install' || action === 'uninstall') {
// eslint-disable-next-line @typescript-eslint/no-require-imports
const configModule = require("../config.js") as { DEFAULT_CONFIG?: Record<string, unknown> };
      const pkgConfig = configModule.DEFAULT_CONFIG ?? {};
        if (!("packageManage" in pkgConfig)) {
          return { success: false, error: 'package_manage tool is disabled. Enable it in plugin settings to allow package installation/uninstallation.' };
        }
      }

      // Validate command arguments for safety
      const allowedActions = ['install', 'uninstall', 'update', 'audit', 'outdated'];
      if (!allowedActions.includes(action)) {
        return { success: false, error: `Invalid action: ${action}. Must be one of: ${allowedActions.join(', ')}` };
      }

      // Build command based on manager
      let cmd: string;
      let args: string[];

      switch (manager) {
        case 'npm':
          cmd = 'npm';
          if (action === 'install') {
            if (!package_name) return { success: false, error: 'Package name is required for install action' };
            args = ['install', package_name];
          } else if (action === 'uninstall') {
            if (!package_name) return { success: false, error: 'Package name is required for uninstall action' };
            args = ['uninstall', package_name];
          } else if (action === 'update') {
            args = ['update'];
          } else if (action === 'audit') {
            args = ['audit'];
          } else {
            args = ['outdated'];
          }
          break;

        case 'pip':
          cmd = 'pip';
          if (action === 'install') {
            if (!package_name) return { success: false, error: 'Package name is required for install action' };
            args = ['install', package_name];
          } else if (action === 'uninstall') {
            if (!package_name) return { success: false, error: 'Package name is required for uninstall action' };
            args = ['uninstall', package_name];
          } else if (action === 'update') {
            args = ['list', '--outdated'];
          } else if (action === 'audit') {
            return { success: false, error: 'pip does not support audit. Use pip-audit or safety tool instead.' };
          } else {
            args = ['list', '--outdated'];
          }
          break;

        case 'cargo':
          cmd = 'cargo';
          if (action === 'install') {
            if (!package_name) return { success: false, error: 'Package name is required for install action' };
            args = ['install', package_name];
          } else if (action === 'uninstall') {
            return { success: false, error: 'Cargo does not support uninstall. Use cargo uninstall <package> or delete manually.' };
          } else if (action === 'update') {
            args = ['update'];
          } else if (action === 'audit') {
            return { success: false, error: 'Cargo audit requires the separate cargo-audit tool. Run `cargo install cargo-audit` first.' };
          } else {
            args = ['metadata', '--format-version=1'];
          }
          break;

        default:
          return { success: false, error: `Unsupported package manager: ${manager}` };
      }

      // Execute command with timeout
      try {
        const proc = spawn(cmd, args, {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: getWorkingDir(),
          timeout: 60_000, // 60 second timeout for package operations
        });

        return new Promise((resolve) => {
          let stdout = '';
          let stderr = '';

          proc.stdout?.on('data', (data: Buffer) => {
            stdout += data.toString();
          });

          proc.stderr?.on('data', (data: Buffer) => {
            stderr += data.toString();
          });

          const timerId = setTimeout(() => {
            proc.kill();
            resolve({ success: false, error: 'Package operation timed out after 60 seconds' });
          }, 60_000);

          proc.on('close', (code) => {
            clearTimeout(timerId);
            if (code === 0 || action === 'audit') {
              resolve({ success: true, data: { stdout: stdout.trim(), stderr: stderr.trim() } });
            } else {
              resolve({ success: false, error: `Command exited with code ${code}: ${stderr || stdout}` });
            }
          });

          proc.on('error', (err) => {
            clearTimeout(timerId);
            resolve({ success: false, error: `Failed to execute command: ${err.message}. Is ${cmd} installed?` });
          });
        });
      } catch (error) {
        return handleError(error);
      }
    },
  }));


  // ── OS Environment Detector Tool ────────────────────────────────────────

  // detect_os_environment tool — Explicitly report OS environment to prevent cross-platform command mistakes
  tools.push(tool({
    name: 'detect_os_environment',
    description: `Explicitly detects and reports the current operating system environment with detailed capabilities. Use this at the start of any session or before executing shell commands to ensure correct syntax (e.g., PowerShell vs Bash, Windows paths vs POSIX).

RECOMMENDED USAGE:
• Call immediately when starting a new task that involves file paths, shell commands, or environment variables
• Use whenever switching contexts between different machines or environments
• Reference the "Recommended Command Syntax" section before generating any terminal commands`,
    parameters: {},
    implementation: async () => {
      try {
        const platform = os.platform();
        const arch = os.arch();
        const release = os.release();
        const hostname = os.hostname();
        
        // Detect shell environment
        let shellType = 'unknown';
        let defaultTerminal = 'unknown';
        if (platform === 'win32') {
          shellType = process.env.PSModulePath ? 'PowerShell' : 'CMD';
          defaultTerminal = 'cmd.exe / PowerShell.exe';
        } else if (platform === 'darwin') {
          shellType = 'zsh/bash';
          defaultTerminal = 'Terminal.app / iTerm2';
        } else {
          shellType = process.env.SHELL || 'bash/sh';
          defaultTerminal = process.env.TERM_PROGRAM || 'gnome-terminal/xterm/konsole';
        }

        // Detect path separator and env var syntax
        const pathSep = platform === 'win32' ? '\\' : '/';
        const envVarSyntax = platform === 'win32' ? '%VAR_NAME%' : '$VAR_NAME';

        return {
          success: true,
          data: {
            osPlatform: platform, // 'windows', 'darwin', 'linux'
            osArch: arch,
            osRelease: release,
            hostname,
            shellType,
            defaultTerminal,
            pathSeparator: pathSep,
            envVarSyntax,
            recommendedCommands: {
              listFiles: platform === 'win32' ? 'dir /b' : 'ls -la',
              searchFiles: platform === 'win32' ? 'where /r <path> <pattern>' : 'find . -name "<pattern>"',
              readFirstLines: platform === 'win32' ? 'type file.txt | findstr "^"' : 'head -n 10 file.txt',
              createDir: platform === 'win32' ? 'mkdir -p path\\to\\dir' : 'mkdir -p path/to/dir',
              checkEnvVars: platform === 'win32' ? 'set' : 'env | sort',
            },
            warning: platform === 'win32' 
              ? '⚠️ RUNNING ON WINDOWS: Use forward slashes (/) for cross-platform compatibility where possible. PowerShell is preferred over CMD.' 
              : `✅ Running on ${platform} (${arch}). Standard POSIX commands apply.`,
          }
        };
      } catch (error) {
              return handleError(error);
      }
    },
  }));

  


  // ── ✅ NEW TOOLS: json_query & env_update ──────────────────────────────────

  // json_query tool — Extract specific fields from JSON files (jq equivalent)
  tools.push(tool({
    name: 'json_query',
    description: 'Extract specific fields from JSON files using a query path (like jq). Supports dot notation, array indexing, and wildcard (*) access.',
    parameters: {
      file_path: z.string().describe('Path to the JSON file'),
      query: z.string().describe('Query path (e.g., ".data.users[0].name" or ".*.id")'),
      output_format: z.enum(['json', 'text']).default('text').describe('Output format: json for structured output, text for raw value'),
    },
    implementation: async ({ file_path, query, output_format }: { readonly file_path: string; readonly query: string; readonly output_format: string }) => {
      try {
        if (!validatePath(file_path, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        const fullPath = resolvePath(file_path);
        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
          return { success: false, error: `Not a regular file: ${fullPath}` };
        }
        // Prevent reading excessively large JSON files (>10MB)
        if (stats.size > 10 * 1_048_576) {
          return { success: false, error: 'File too large for JSON query (>10MB)' };
        }
        const content = fs.readFileSync(fullPath, 'utf-8');
        let data: unknown;
        try {
          data = JSON.parse(content);
        } catch {
          return { success: false, error: 'Invalid JSON file. Please ensure the file contains valid JSON.' };
        }
        // Parse query and extract value
        const result = safeJsonQuery(data, query);
        if (!result.success) {
          return { success: false, error: result.error };
        }
        const formattedOutput = output_format === 'json'
          ? JSON.stringify(result.value, null, 2)
          : String(result.value);
        return { success: true, data: { file: fullPath, query, output: formattedOutput, type: typeof result.value } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));

  // env_update tool — Safely add or update environment variables in .env files
  tools.push(tool({
    name: 'env_update',
    description: 'Add or update a key-value pair in an .env file. Creates the key if missing, updates it if present, and ensures the file ends with a newline.',
    parameters: {
      file_path: z.string().describe('Path to the .env file'),
      key: z.string().describe('Environment variable key (alphanumeric + underscores only)'),
      value: z.string().describe('Environment variable value'),
      ensure_newline: z.boolean().default(true).describe('Ensure the file ends with a newline (default: true)'),
    },
    implementation: async ({ file_path, key, value, ensure_newline }: { readonly file_path: string; readonly key: string; readonly value: string; readonly ensure_newline: boolean }) => {
      try {
        if (!validatePath(file_path, getWorkingDir())) {
          return { success: false, error: 'Invalid path: directory traversal detected' };
        }
        const fullPath = resolvePath(file_path);
        // Validate key name (alphanumeric + underscores, must start with letter or underscore)
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
          return { success: false, error: 'Invalid key name. Must start with a letter or underscore, followed by alphanumeric characters or underscores.' };
        }
        let content = '';
        try {
          content = fs.readFileSync(fullPath, 'utf-8');
        } catch {
          // File doesn't exist — create it
          content = '';
        }
        // Check if key exists and update/add accordingly
        const lines = content.split('\n');
        let found = false;
        const updatedLines = lines.map(line => {
          // Match lines that start with the key followed by =
          if (line.trim().startsWith(key + '=')) {
            found = true;
            return `${key}=${value}`;
          }
          return line;
        });
        if (!found) {
          updatedLines.push(`${key}=${value}`);
        }
        // Ensure file ends with newline if requested
        if (ensure_newline) {
          const lastLine = updatedLines[updatedLines.length - 1];
          if (lastLine !== '' && lastLine !== undefined) {
            updatedLines.push('');
          }
        }
        const finalContent = updatedLines.join('\n');
        fs.writeFileSync(fullPath, finalContent, 'utf-8');
        return { success: true, data: { file: fullPath, key, value, action: found ? 'updated' : 'added', endsWithNewline: true } };
      } catch (error) {
        return handleError(error);
      }
    },
  }));


  return tools;
}

// ==================== Helper Functions for convert_format ====================

/** Parse a single CSV line respecting quoted fields */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ("")
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }

  result.push(current);
  return result;
}

/** Check if a file is likely a text file by reading first bytes */
function isTextFile(filePath: string): boolean {
  try {
    const chunk = fs.readFileSync(filePath).subarray(0, 512);
    // Check for null byte (binary indicator)
    return !chunk.includes(0);
  } catch {
    return false;
  }
}

// ==================== CURRENT WORKING DIRECTORY TOOL ====================

/**
 * Get the current working directory.
 * This allows the LLM to know where relative paths will be resolved.
 */
export function registerGetCurrentWorkingDirectoryTool(): Tool[] {
  return [
    tool({
      name: 'get_current_working_directory',
      description: 'Get the current working directory. Use this before generating file operations with relative paths to ensure you know where files will be created/modified.',
      parameters: {},
      implementation: async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const { getWorkingDir } = require('../workingDir.js');
        return {
          success: true,
          data: {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
current_working_directory: getWorkingDir()
          }
        };
      },
    }),
  ];
}


// ==================== JSON Query Helper ====================

/**
 * Safe JSON path query helper — mimics jq-style dot notation queries.
 * Supports: .key, .key.subkey, .array[0], .array[*] (wildcard), root access
 */
function safeJsonQuery(data: unknown, query: string): { success: boolean; value?: unknown; error?: string } {
  // Normalize query: ensure it starts with a dot for consistency
  let normalizedQuery = query.startsWith('.') ? query : `.${query}`;
  
  // Security: limit query depth to prevent excessive traversal
  const depth = (normalizedQuery.match(/\./g) || []).length + (normalizedQuery.match(/\[/g) || []).length;
  if (depth > 50) {
    return { success: false, error: 'Query too complex (max 50 path segments allowed)' };
  }
  
  // Parse the query into segments
  const segments: Array<string | number> = [];
  // Split by dots, then handle array indices
  const parts = normalizedQuery.split('.').filter(p => p !== '');
  
  for (const part of parts) {
    if (part === '*') {
      segments.push('*'); // Wildcard
    } else if (part.match(/^\[\s*(\d+)\s*\]$/)) {
      // Array index: [0], [1], etc.
      const index = parseInt(part.match(/^\[\s*(\d+)\s*\]$/)?.[1] || '0', 10);
      segments.push(index);
    } else if (part.match(/^\[\s*\]\]$/)) {
      // Empty brackets — treat as wildcard for arrays
      segments.push('*');
    } else {
      // Object key
      segments.push(part);
    }
  }
  
  // Traverse the data
  let current: unknown = data;
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    if (segment === '*') {
      // Wildcard: return all values if current is an array
      if (Array.isArray(current)) {
        current = current.map((item, _idx) => {
          // Continue traversal from this item
          let result: unknown = item;
          for (let j = i + 1; j < segments.length; j++) {
            const nextSeg = segments[j];
            if (nextSeg === '*') {
              if (Array.isArray(result)) {
                result = result.map((subItem) => {
                  let subResult: unknown = subItem;
                  for (let k = j + 1; k < segments.length; k++) {
                    const nextNextSeg = segments[k];
                    if (typeof subResult === 'object' && subResult !== null && nextNextSeg !== '*') {
                      subResult = (subResult as Record<string, unknown>)[nextNextSeg];
                    } else if (typeof subResult === 'object' && subResult !== null) {
                      subResult = undefined;
                    }
                  }
                  return subResult;
                });
              } else {
                result = [];
              }
            } else {
              if (typeof result === 'object' && result !== null && nextSeg !== '*') {
                result = (result as Record<string, unknown>)[nextSeg];
              } else if (typeof result === 'object' && result !== null) {
                result = undefined;
              }
            }
          }
          return result;
        });
        return { success: true, value: current };
      } else {
        return { success: false, error: 'Wildcard (*) can only be used on arrays, not objects' };
      }
    } else if (typeof segment === 'number') {
      // Array index
      if (Array.isArray(current)) {
        current = current[segment];
      } else {
        return { success: false, error: `Cannot access array index ${segment} on non-array value` };
      }
    } else {
      // Object key
      if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        return { success: false, error: `Cannot access key '${segment}' on non-object value` };
      }
    }
    
    // Check for undefined/null mid-traversal
    if (current === undefined || current === null) {
      return { success: false, error: `Path '${normalizedQuery}' not found — intermediate value is null/undefined` };
    }
  }
  
  return { success: true, value: current };
}
