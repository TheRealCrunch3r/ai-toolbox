/**
 * Long-running process tracking and management
 */

import type { PluginConfig} from './config';

export interface BackgroundCommand {
  id: string;
  command: string;
  name: string;
  startTime: number;
  timeoutHours: number;
  status: 'running' | 'completed' | 'cancelled' | 'errored';
  stdout?: string;
  stderr?: string;
}

export class BackgroundCommandManager {
  private commands: Map<string, BackgroundCommand>;
  private maxTimeoutHours: number;
  
  constructor(_config?: PluginConfig) {
    this.commands = new Map();
    this.maxTimeoutHours = 10; // Hard limit from tool specification
  }

  /**
   * Register a new background command
   */
  register(command: string, timeoutHours: number, name: string): string {
    if (timeoutHours < 0.1 || timeoutHours > this.maxTimeoutHours) {
      throw new Error(`Timeout must be between 0.1 and ${this.maxTimeoutHours} hours`);
    }
    
    if (!name || name.length === 0) {
      throw new Error('Command name is mandatory');
    }
    
    const id = this.generateId();
    
    this.commands.set(id, {
      id,
      command,
      name,
      startTime: Date.now(),
      timeoutHours,
      status: 'running',
    });
    
    return id;
  }

  /**
   * Check status and output of a background command
   */
  check(id: string): BackgroundCommand | null {
    const command = this.commands.get(id);
    if (!command) return null;
    
    // Check if timeout exceeded
    const elapsedHours = (Date.now() - command.startTime) / (1000 * 60 * 60);
    if (elapsedHours > command.timeoutHours && command.status === 'running') {
      command.status = 'errored';
      command.stderr = `Command exceeded timeout (${command.timeoutHours} hours)`;
    }
    
    return command;
  }

  /**
   * Cancel a running background command
   */
  cancel(id: string): boolean {
    const command = this.commands.get(id);
    if (!command || command.status !== 'running') return false;
    
    command.status = 'cancelled';
    return true;
  }

  /**
   * Get all active commands
   */
  getActiveCommands(): BackgroundCommand[] {
    return Array.from(this.commands.values())
      .filter(c => c.status === 'running');
  }

  /**
   * Remove completed/errored/cancelled commands after cleanup period
   */
  cleanup(maxAgeHours: number = 24): void {
    const now = Date.now();
    for (const [id, command] of this.commands.entries()) {
      if (command.status !== 'running') {
        const ageHours = (now - command.startTime) / (1000 * 60 * 60);
        if (ageHours > maxAgeHours) {
          this.commands.delete(id);
        }
      }
    }
  }

  /**
   * Generate unique command ID
   */
  private generateId(): string {
    return `bg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Get total count of registered commands
   */
  getCount(): number {
    return this.commands.size;
  }
}
