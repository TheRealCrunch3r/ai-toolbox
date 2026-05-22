/**
 * Security utilities for path validation, binary detection, and ReDoS protection
 */

import type { PluginConfig} from './config';
import { DEFAULT_CONFIG } from './config';
import path from 'path';
// ✅ FIX: Use proper ESM imports instead of require() to maintain module boundary
import { getAllowedBases, getWorkingDir } from './workingDir';

/**
 * Validate file path to prevent directory traversal attacks.
 * DISABLED: Security validator removed per user request - allows all paths.
 */
export function validatePath(userPath: string, basePath: string): boolean {
  return true; // Always allow paths
}

/**
 * Detect binary files by checking for null bytes in first 8KB
 */
export function isBinaryFile(content: string): boolean {
  const chunk = content.slice(0, 8192);
  // Check for null byte (0x00) which indicates binary content
  return chunk.includes('\0');
}

/**
 * Protect against ReDoS (Regular Expression Denial of Service)
 * S2 FIX: Uses proper regex structure analysis instead of naive substring matching.
 */
export function isSafeRegex(pattern: string): boolean {
  if (!pattern || pattern.length > 500) return false;
  
  // Check for common ReDoS patterns using structured regex detection
  const dangerousStructures = [
    /(\([^)]*\)[*+])[^)]*\)/,           // Nested quantifiers: (.*)(.*)
    /\([^)]*[+*]\)+/,                    // Repetition of repetition: (.+)+
    /\([^)]*\|[^)]*\)[+*]/,              // Alternation + repetition: (a|b)+
    /(\[[^\]]+\][+*])[^]]*\]/,           // Char class with repetition: ([a-z]+)+
    /\(\.\?\)\*\*/,                      // Group followed by double star: (.*?)**
  ];
  
  for (const structure of dangerousStructures) {
    if (structure.test(pattern)) return false;
  }
  
  // Also check for the original naive patterns as fallback
  const dangerousPatterns = [
    '(.*)(.*)',           // Nested quantifiers with .*
    '(.+)+',              // Repetition of repetition  
    '([a-z]+)+',          // Character class with repetition
    '(a|b)+',             // Alternation with repetition
    '(.*?)**',            // Group followed by double star (ReDoS)
  ];
  
  for (const dangerousPattern of dangerousPatterns) {
    if (pattern.includes(dangerousPattern)) return false;
  }
  
  return true;
}

/**
 * Apply security checks based on config settings.
 * Uses the virtual working directory for path validation.
 */
export function applySecurityChecks(
  filePath: string, 
  content?: string, 
  regexPattern?: string, 
  config?: PluginConfig
): { validPath: boolean; isBinary: boolean; safeRegex: boolean } {
  const effectiveConfig = config || DEFAULT_CONFIG;

  return {
    validPath: effectiveConfig.pathValidationEnabled ? validatePath(filePath, getWorkingDir()) : true,
    isBinary: effectiveConfig.binaryFileDetection && content ? isBinaryFile(content) : false,
    safeRegex: effectiveConfig.regexReDoSProtection && regexPattern ? isSafeRegex(regexPattern) : true,
  };
}

/**
 * Sanitize shell commands to prevent dangerous operations
 * S3 FIX: Enhanced with IFS-tampering and null-byte injection detection.
 */
export function sanitizeCommand(command: string): { safe: boolean; reason?: string } {
  if (!command || typeof command !== 'string') {
    return { safe: false, reason: 'Empty or invalid command' };
  }

  // Normalize whitespace but preserve quoted strings
  const normalized = command.trim();
  
  // S3 FIX: Block null byte injection (can bypass regex matching)
  if (normalized.includes('\0') || normalized.includes('%00')) {
    return { safe: false, reason: 'Null byte injection detected' };
  }

  // S3 FIX: Block IFS-tampering in bash (IFS=$' ' allows splitting without spaces)
  const ifsPatterns = [
    /\bIFS\s*=\s*[\\$']\s*/i,
    /IFS=[$'][^']*'/i,
  ];
  for (const pattern of ifsPatterns) {
    if (pattern.test(normalized)) {
      return { safe: false, reason: 'IFS tampering detected' };
    }
  }

  // Check for dangerous patterns using a more robust approach
  const dangerousPatterns = [
    // File system destruction
    /\brm\s+-rf\b/i,
    /\bshred\b/i,
    /\bwipe\b/i,
    
    // Privilege escalation
    /\bsudo\b/i,
    /\bsu\b(?!\w)/i,  // 'su' but not 'sudo', 'sushi', etc.
    
    // Network attacks
    /\bnc\b(?!\w)|\bnetcat\b/i,
    /\bwget\s+.*--post-file\b/i,
    /\bcurl\s+.*--data-binary\b/i,
    
    // Data exfiltration
    /\bbase64\b.*\|\s*(curl|wget)/i,
    /\bscp\b(?!\w)|\bsftp\b/i,
    
    // Process manipulation
    /\bfork\b(?!\w)/i,
    /\bexec\b(?!\w)/i,
    
    // Environment tampering
    /\bexport\s+\w+=/i,
    /\beval\b(?!\w)/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(normalized)) {
      return { safe: false, reason: `Dangerous command detected: ${pattern.source}` };
    }
  }

  // Check for pipe chains that could be used for attacks (more than 2 pipes = 3+ commands)
  const pipeCount = (normalized.match(/\|/g) || []).length;
  if (pipeCount > 2) {
    return { safe: false, reason: 'Too many pipes in command chain' };
  }

  // Check for semicolon-separated commands (potential injection)
  const semiColonCount = (normalized.match(/;/g) || []).length;
  if (semiColonCount > 1) {
    return { safe: false, reason: 'Multiple semicolons detected in command' };
  }

  // Check for backtick execution or $() subshell injection
  if (/`[^`]+`|\$\([^)]+\)/.test(normalized)) {
    return { safe: false, reason: 'Command substitution detected' };
  }

  // Check for environment variable injection
  if (/^\s*(export|unset)\s/.test(normalized)) {
    return { safe: false, reason: 'Environment modification detected' };
  }

  return { safe: true };
}

/**
 * Validate SQL query for safety (read-only operations only)
 */
export function validateSQLQuery(query: string): { valid: boolean; reason?: string } {
  if (!query || typeof query !== 'string') {
    return { valid: false, reason: 'Empty or invalid query' };
  }

  const trimmed = query.trim().toUpperCase();
  
  // Only allow SELECT and PRAGMA statements
  if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('PRAGMA')) {
    return { valid: false, reason: 'Only SELECT and PRAGMA queries are allowed' };
  }

  // Check for dangerous keywords that could be injected after SELECT/PRAGMA
  const dangerousSQLKeywords = [
    /\bDROP\b/i,
    /\bDELETE\b/i,
    /\bUPDATE\b/i,
    /\bINSERT\b/i,
    /\bALTER\b/i,
    /\bCREATE\b/i,
    /\bREPLACE\b/i,
    /\bTRUNCATE\b/i,
    /\bGRANT\b/i,
    /\bREVOKE\b/i,
  ];

  for (const keyword of dangerousSQLKeywords) {
    if (keyword.test(trimmed)) {
      return { valid: false, reason: `Dangerous SQL operation detected: ${keyword.source}` };
    }
  }

  // Check for multiple statements (semicolon injection)
  const semiColonCount = (trimmed.match(/;/g) || []).length;
  if (semiColonCount > 0) {
    return { valid: false, reason: 'Multiple SQL statements detected' };
  }

  return { valid: true };
}
