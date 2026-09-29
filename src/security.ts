/**
 * Security utilities for path validation, binary detection, and ReDoS protection
 */

import type { PluginConfig} from './config';
import { DEFAULT_CONFIG } from './config';
// ✅ FIX: Use proper ESM imports instead of require() to maintain module boundary
import { getWorkingDir } from './workingDir';

/**
 * Validate file path to prevent directory traversal attacks.
 * Checks for: path traversal (../), UNC paths, empty inputs.
 */
export function validatePath(userPath: string, basePath: string): boolean {
  // Reject empty inputs
  if (!userPath || !basePath) {
    return false;
  }

  // Reject path traversal patterns (../ or ..\)
  const normalizedPath = userPath.replace(/\\/g, '/');
  if (normalizedPath.startsWith('../') || 
      normalizedPath === '..' ||
      normalizedPath.includes('/../')) {
    return false;
  }

  // Reject UNC paths (Windows network shares: \\server\share)
  if (userPath.startsWith('\\\\') || userPath.startsWith('//')) {
    return false;
  }

  // Path passed basic security checks
  return true;
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
 * Protect against ReDoS (Regular Expression Denial of Service).
 * Uses precise pattern analysis to detect genuinely dangerous structures.
 * 
 * Safe patterns include: simple quantifiers, character classes [a-z]+, unquantified groups ((a|b)), bounded
 * repeats like (a*){50}. Dangerous patterns include: nested repetition ((a+)+), overlapping quantifiers ((.*)*),
 * alternation inside a repeated group ((a|b)+) and adjacent quantified sequences over overlapping spans.
 * FIX-35c (28.09): every check below is LINEAR-TIME by construction — no meta-pattern may itself contain a nested
 * or ambiguous quantifier: the pre-fix clause 1 (/((?:[^()]*|\([^()]*\))*[+*]\)[+*]/) catastrophically backtracked on
 * ordinary patterns containing one lone raw "(" (e.g. escaped-literal prose searches like "x \(93 tools|y"), blocking
 * the event loop so no wall cap, demotion or abort could react (28.09 18:22 + 19:15 lockups; repro pinned in
 * tests/security.test.ts — a security check that can itself hang is worse than none).
 */

/**
 * FIX-35c (28.09): linear-time replacement for the catastrophic clause-1 meta-regex (see function doc above).
 * One O(n) pass over the pattern source, tracking paren depth while skipping escape sequences:
 *   1. nested repetition — an unescaped group whose body contains an unescaped quantifier (+, *, ?, {n[,m]}) and
 *      which is itself followed by an unescaped quantifier: (a+)+, ((x))* — exponential backtracking in NFA engines;
 *   2. incident class the old regex missed — a top-level sequence of two or more adjacent unescaped-quantified
 *      tokens (e.g. \d+\s*\d+, [0-9]*[0-9]*) where each token can match overlapping spans: on lines that do not
 *      fully satisfy the pattern the NFA enumerates exponentially many decompositions of the run before failing
 *      (this is what spun for >5 min in the 28.09 18:22 incident once clause 1 was removed from the equation).
 * Both checks are pure scanning — no regex meta-patterns, so they cannot hang on any input.
 */
function hasAmbiguousRepetition(pattern: string): boolean {
  // Rule 1 — nested repetition, single O(n) pass. groupHasQuant tracks whether the innermost open group's body
  // contains an unescaped quantifier; escaped chars are skipped wholesale so \+ \( etc. never count as structure.
  let depth = 0;
  const groupHasQuant: boolean[] = [];
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '\\') { i++; continue; } // escape sequence — literal, never structural
    const c = pattern[i];
    if (c === '(') { depth++; groupHasQuant.push(false); continue; }
    if (depth > 0) {
      if ('+*?{'.includes(c)) groupHasQuant[groupHasQuant.length - 1] = true; // quantifier inside innermost open group
      else if (c === ')') {
        depth--;
        const hadInnerQuantifier = groupHasQuant.pop() ?? false;
        // Quantified group with a quantified body: (a+)+, ([x]*)*, ((ab)*)+ — exponential backtracking in NFA engines.
        // Bounded repeats ({n[,m]}) deliberately NOT flagged — D2 (30.08) pins '(a*){50}' as SAFE so grep_files can
        // route it to its killable worker instead of silently literal-demoting it (tests/security.test.ts).
        if (hadInnerQuantifier && i + 1 < pattern.length && '+*?'.includes(pattern[i + 1])) return true;
      }
    }
    // depth === 0: nothing to track here — top-level adjacency is rule-2's job (separate pass below).
  }
  return hasAdjacentQuantifiedTokens(pattern);
}

/** FIX-35c: second O(n) pass — rule 2. A token = maximal run of non-structural chars at depth 0, terminated by a
 * quantifier (+, *, ? or a real {n[,m]} repeat). Two such tokens with only unescaped whitespace between them can
 * each match overlapping spans of the same character run; on input that does not fully satisfy the pattern the NFA
 * enumerates exponentially many decompositions before failing (the 28.09 18:22 incident class, e.g. \d+\s*\d*). */
function hasAdjacentQuantifiedTokens(pattern: string): boolean {
  let depth = 0;
  let prevQuantEnd = -1; // index of the quantifier char ending the previous top-level token, else -1
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '\\') {
      // Escape pair: the escaped char is NEVER structural — but it IS plain token-body content, so we must not
      // `continue` past a would-be token start (that silently dropped '\d+' as a quantified token in 28.09 rule-2
      // verification). Escaped STRUCTURAL chars (\( \) \| \+ ...) are literal prose: they break the adjacency run.
      const e = pattern[i + 1] ?? '';
      if ('+*?|(){}'.includes(e)) { i++; prevQuantEnd = -1; continue; }
      // plain escaped char: fall through — it starts/extends a token body exactly like any other content char
    }
    const c = pattern[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    if (depth !== 0 || '|+*?({'.includes(c)) { prevQuantEnd = -1; continue; } // group content or structural char breaks any adjacency run
    // Consume the token body: plain chars only — stop at ANY structural character so depth tracking stays exact.
    while (i + 1 < pattern.length && '+*?|(){}'.includes(pattern[i + 1]) === false) i++;
    const q = pattern[i + 1]; // first char right after the token body
    let quantEnd = -1;
    // Only unbounded quantifiers create the ambiguity. Bounded repeats {n[,m]} fix their span count (linear cost) —
    // they deliberately do NOT continue a dangerous adjacency run (and literal prose braces can never flag).
    if (q === '+' || q === '*' || q === '?') quantEnd = i + 1;
    if (quantEnd !== -1) {
      // adjacency: only unescaped whitespace may sit between two quantified top-level tokens
      let gap = prevQuantEnd + 1;
      while (gap <= i && ' \t'.includes(pattern[gap])) gap++;
      if (prevQuantEnd !== -1 && gap <= i) return true; // e.g. \d+\s*\d+, [0-9]*[0-9], a+b+c+ runs
      prevQuantEnd = quantEnd;
      i++; // the for-increment must not RE-VISIT this token's own terminating quantifier — that char is structural and would reset prevQuantEnd (lost '\d+\s*\d+' in 28.09 verification)
    } else {
      prevQuantEnd = -1; // unquantified token (or false brace) resets the run
    }
  }
  return false;
}

export function isSafeRegex(pattern: string): boolean {
  if (!pattern || pattern.length > 500) return false;

  // Only flag genuinely dangerous ReDoS structures — not safe alternation or simple quantifiers.
  const dangerousStructures = [
    // Alternation inside group with quantifier: (a|b)+, ([a-z]+)+, etc.
    /\([^)]*\|[^)]*\)[+*]/,
  ];

  for (const structure of dangerousStructures) {
    if (structure.test(pattern)) return false;
  }
  // FIX-35c: linear structural scan — replaces the removed catastrophic clause-1 meta-regex AND covers the
  // adjacent-quantified-token incident class that no prior clause caught.
  if (hasAmbiguousRepetition(pattern)) return false;

  // Fallback: check for known canonical ReDoS patterns as exact substrings.
  const dangerousPatterns = [
    '(.+)+',              // Classic repetition of repetition  
    '(.*)(.*)',           // Nested quantifiers with .* (the full double-group form)
    '(.*?)**',            // Group followed by double star (ReDoS)
    '(a|b)+',             // Alternation with repetition — can cause ReDoS in certain contexts
  ];

  for (const dangerousPattern of dangerousPatterns) {
    if (pattern.includes(dangerousPattern)) return false;
  }

  // CRITICAL FIX: Detect multiple consecutive quantified groups that can cause exponential backtracking.
  // Patterns like [a-z]+[0-9]+[a-z]+ or \w+\s*\w+ on strings with many overlapping matches are dangerous.
  const quantifierCount = (pattern.match(/[+*?]/g) || []).length;
  if (quantifierCount > 5) {
    return false; // More than 5 quantifiers is suspicious — likely ReDoS risk
  }

  // Detect multiple different quantified character classes in sequence.
  // e.g., [a-z]+[0-9]+, \w+\s+, etc. Each pair of adjacent quantified groups increases backtracking risk.
  const consecutiveQuantified = /\[[^\]]+\][+*]\s*\[[^\]]+\][+*]/.test(pattern);
  if (consecutiveQuantified) return false;

  // FIX (REV-24): Detect unescaped special chars in code-like patterns (e.g., C++ signatures with *, ->)
  // Patterns like "List*", "ptr->", "const&" are almost certainly literal code searches, not regex.
  // If the pattern contains code-signature indicators, treat as unsafe to force auto-escape.
  // NOTE: bare & was REMOVED from this char class — '&' is NOT a JS regex metachar (zero backtracking
  // risk), and keeping it false-positive'd on prose like "Git & GitHub" (markdown section names).
  // Code-signature searches with & are STILL caught via clause 2 ([\w][*&] / [\*&]\s+\w) below.
  const hasUnescapedCodeChar = /(?<!\\)[*+?]/.test(pattern);
  // D2 (30.08): '*' removed from the [\w][...] alternative — a word char directly before an unescaped
  // quantifier '*' is normal regex usage ((a*){50}, \w*), not code-signature evidence, and rejecting it here
  // silently demoted such patterns to LITERAL mode (matches lost) BEFORE FIX-HANG-5 worker triage could route
  // them (FIXHANG-5 redos probe, FINDING-1 — evidence doc removed 08.09; in git history). Code-signature positives stay rejected via the surviving
  // alternatives: 'std::vector<int>*' (via ::), 'List* ptr' / 'const& x' (via [*&] whitespace-word), word-char+'&'.
  const looksLikeCodeSignature = /::|->|[\w]&|[*&]\s+\w/.test(pattern);
  if (hasUnescapedCodeChar && looksLikeCodeSignature) {
    return false;  // Force literal/auto-escape mode in grep_files
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
