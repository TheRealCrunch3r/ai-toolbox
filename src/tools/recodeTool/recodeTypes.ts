import type { Program } from '@babel/types';

export interface RecodeConfig {
  dryRun?: boolean;
  backup?: boolean;
  ruleConfigs?: Record<string, unknown>;
}

export interface RuleContext {
  filePath: string;
  content: string;
  ast: Program;
  isTypeScript: boolean;
}

export interface RuleResult {
  success: boolean;
  message?: string;
  changes?: {
    original: string;
    modified: string;
    diff: string;
  };
  warnings?: string[];
  data?: unknown;
}

export type RecodeRule = (ctx: RuleContext, config: Record<string, unknown>) => Promise<RuleResult>;

export interface RecodeEngineOptions {
  rules: Array<{ name: string; rule: RecodeRule }>;
  config: RecodeConfig;
}
