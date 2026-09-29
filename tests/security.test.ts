/**
 * Tests for security utilities (path validation, binary detection, ReDoS protection)
 */

import { validatePath, isBinaryFile, isSafeRegex, applySecurityChecks, sanitizeCommand, validateSQLQuery } from '../src/security';
import { DEFAULT_CONFIG } from '../src/config';

describe('validatePath', () => {
  test('should allow valid paths', () => {
    expect(validatePath('file.txt', '.')).toBe(true);
    expect(validatePath('subdir/file.txt', '.')).toBe(true);
  });

  test('should reject traversal paths', () => {
    expect(validatePath('../secret.txt', '.')).toBe(false);
    expect(validatePath('../../etc/passwd', '.')).toBe(false);
  });

  test('should handle empty inputs', () => {
    expect(validatePath('', '.')).toBe(false);
    expect(validatePath('file.txt', '')).toBe(false);
  });
});

describe('isBinaryFile', () => {
  test('should detect binary content with null byte', () => {
    expect(isBinaryFile('text\0binary')).toBe(true);
  });

  test('should allow pure text', () => {
    expect(isBinaryFile('pure text content')).toBe(false);
  });

  test('should check only first 8KB', () => {
    // Null byte within first 8KB → should detect binary
    const textWithNullInFirst8KB = 'a'.repeat(5000) + '\0' + 'b'.repeat(5000);
    expect(isBinaryFile(textWithNullInFirst8KB)).toBe(true);

    // Null byte beyond first 8KB → should NOT detect binary (only checks first 8KB)
    const longText = 'a'.repeat(10000) + '\0';
    expect(isBinaryFile(longText)).toBe(false);
  });
});

describe('isSafeRegex', () => {
  test('should reject ReDoS patterns', () => {
    expect(isSafeRegex('(.*)(.*)')).toBe(false);
    expect(isSafeRegex('(.+)+')).toBe(false);
    expect(isSafeRegex('([a-z]+)+')).toBe(false);
  });

  test('should allow safe regex', () => {
    expect(isSafeRegex('[a-z]')).toBe(true);
    expect(isSafeRegex('^hello$')).toBe(true);
  });

  test('should reject overly long patterns', () => {
    const longPattern = 'a'.repeat(600);
    expect(isSafeRegex(longPattern)).toBe(false);
  });

  // ===== REV-24: bare-& false-positive fix (grep_files "Git & GitHub" mega-alternation incident) =====
  test('REV-24: should treat prose with bare & as SAFE regex (no forced literal mode)', () => {
    // "& word" is ordinary markdown section-name prose; & has no metacharacter/backtracking risk.
    expect(isSafeRegex('Git & GitHub')).toBe(true);
    expect(isSafeRegex('Backup & Restore|Database & Storage')).toBe(true);
    expect(
      isSafeRegex(
        'Backup & Restore|Database & Storage|Git & GitHub|Image Analysis|Memory Tools|Project Registry|RAG / Vector Search|Security Utilities'
      )
    ).toBe(true);
    // Escaped form must also stay safe (lookbehind: \& never flagged)
    expect(isSafeRegex('Git \\& GitHub')).toBe(true);
  });

  test('REV-24: should STILL reject code-signature patterns with unescaped *', () => {
    // The original intent of the heuristic must survive the & removal.
    expect(isSafeRegex('List*|const& x')).toBe(false);
    expect(isSafeRegex('std::vector<int>*')).toBe(false);
  });

  test('REV-24: true ReDoS gates remain intact after the & change', () => {
    expect(isSafeRegex('(a|b)+')).toBe(false); // alternation × quantifier (dangerousPatterns list)
    expect(
      isSafeRegex('[a-z]+[0-9]+[a-z]+[0-9]+[a-z]+[0-9]+')
    ).toBe(false); // consecutive quantified character classes
  });

  // ===== D2 (30.08): star-adjacent patterns must NOT be literal-demoted before FIX-HANG-5 triage =====
  // FINDING-1 (FIXHANG-5 redos probe — evidence doc removed 08.09; in git history): the code-signature clause rejected any pattern with a word char
  // directly before an unescaped '*' — e.g. (a*){50} was silently literalized in grep_files BEFORE
  // FIX-HANG-5 worker triage could route it to the killable worker (matches lost). Loosened: only '&'
  // adjacency plus :: / -> / [*&]-whitespace-word forms still flag code signatures.
  test('D2: word char before unescaped * is regex usage — stays SAFE (no literal demotion)', () => {
    expect(isSafeRegex('(a*){50}')).toBe(true); // the live T2 demotion case (FIXHANG-5 redos probe, FINDING-1)
    expect(isSafeRegex('foo*bar')).toBe(true);
  });

  test('D2: code-signature rejections survive the loosening', () => {
    expect(isSafeRegex('List* ptr')).toBe(false);       // [*&] whitespace-word alternative
    expect(isSafeRegex('std::vector<int>*')).toBe(false); // :: alternative (pre-pinned REV-24)
    expect(isSafeRegex('ptr->val*')).toBe(false);        // -> alternative
  });

  // ===== FIX-35c (28.09): isSafeRegex itself must never hang — self-DoS regression class =====
  // Pre-fix clause 1 (/((?:[^()]*|\([^()]*\))*[+*]\)[+*]/) catastrophically backtracked on ordinary patterns with a lone raw
  // "(" (e.g. escaped-literal prose), blocking the event loop so NO wall cap, demotion or host abort could react — this is what
  // locked LM Studio at 18:22 and 19:15 on 28.09. These pins keep both sides honest: incident shapes are rejected AND the gate
  // settles in milliseconds (a hang would fail via jest's per-test timeout, exactly like the original incident).
  test('FIX-35c: 28.09 incident patterns are rejected by the gate', () => {
    // 18:22 screenshot pattern (malformed alternation, one unbalanced group) and its balanced variant — both contained a lone
    // raw "(" that spun clause 1 for >5 min in production; the gate must now reject them in O(n).
    expect(isSafeRegex('contextManagementTools\\.ts # Context management \\(12\\|(12 tools|129 entries / 127|total: 130|Code-defined total: 130|\\*130\\)*')).toBe(false);
    expect(isSafeRegex('contextManagementTools\\.ts # Context management \\(12\\|(12 tools|129 entries / 127|total: 130|Code-defined total: 130|\\*130)*')).toBe(false);
    // Adjacent-quantified-token incident class — previously PASSED the gate, then spun at inline eval (rule 2 coverage).
    expect(isSafeRegex('\\d+\\s*\\d+')).toBe(false);
    expect(isSafeRegex('\\d+\\s*\\d+\\s*\\d+')).toBe(false);
    // Nested repetition stays rejected by the linear rule-1 scan (the class clause 1 was MEANT to catch).
    expect(isSafeRegex('(a+)+')).toBe(false);
    expect(isSafeRegex('(a*)*')).toBe(false);
    expect(isSafeRegex('([x]{2,})+')).toBe(false);
  });

  test('FIX-35c: the patterns that locked LM Studio at 19:15 stay SAFE (no new false positives)', () => {
    // The exact aborted call of 28.09 19:15 — a benign alternation containing escaped parens in prose — must be accepted, and fast.
    expect(isSafeRegex('Only flag genuinely dangerous|dangerousStructures|for \\(const structure of|CRITICAL FIX: Detect multiple consecutive quantified groups')).toBe(true);
    expect(isSafeRegex('management \\(93 tools|total: 130')).toBe(true);
    // Bounded repeats stay safe (D2 contract) even after the rule-1 rewrite.
    expect(isSafeRegex('(a*){50}')).toBe(true);
  });

  test('FIX-35c: gate is LINEAR — adversarial max-length patterns settle in milliseconds', () => {
    // Pre-fix, a single clause-1 .test() on the trigger shape (lone raw "(" per branch) needed >3 s (budgeted repro);
    // post-fix it is one O(n) scan. Budget 200 calls at ~500 chars — generous for any host; an old-code regression fails loud.
    const adversarial = 'x \\( a b c d '.repeat(19).slice(0, 500) + '|y \\( z'; // lone raw "(" per alternation branch
    const t0 = Date.now();
    for (let i = 0; i < 200; i++) {
      expect(typeof isSafeRegex(adversarial)).toBe('boolean');
    }
    expect(Date.now() - t0).toBeLessThan(50); // 200 full gate runs — the old meta-regex exceeded this budget on ONE call
  });
});

describe('applySecurityChecks', () => {
  test('should apply all checks when enabled', () => {
    const result = applySecurityChecks('../evil.txt', 'text\0binary', '(.*)(.*)');
    expect(result.validPath).toBe(false);
    expect(result.isBinary).toBe(true);
    expect(result.safeRegex).toBe(false);
  });

  test('should skip checks when disabled', () => {
    const result = applySecurityChecks('../evil.txt', 'text\0binary', '(.*)(.*)', {
      ...DEFAULT_CONFIG,
      pathValidationEnabled: false,
      binaryFileDetection: false,
      regexReDoSProtection: false,
    });
    expect(result.validPath).toBe(true);
    expect(result.isBinary).toBe(false);
    expect(result.safeRegex).toBe(true);
  });
});

describe('sanitizeCommand', () => {
  test('should allow safe commands', () => {
    expect(sanitizeCommand('ls -la').safe).toBe(true);
    expect(sanitizeCommand('npm install').safe).toBe(true);
    expect(sanitizeCommand('git status').safe).toBe(true);
  });

  test('should reject rm -rf', () => {
    expect(sanitizeCommand('rm -rf /').safe).toBe(false);
    expect(sanitizeCommand('rm -rf node_modules').safe).toBe(false);
  });

  test('should reject sudo commands', () => {
    expect(sanitizeCommand('sudo apt update').safe).toBe(false);
    expect(sanitizeCommand('su root').safe).toBe(false);
  });

  test('should reject command substitution', () => {
    expect(sanitizeCommand('echo $(whoami)').safe).toBe(false);
    expect(sanitizeCommand('echo `id`').safe).toBe(false);
  });

  test('should reject too many pipes', () => {
    expect(sanitizeCommand('cmd1 | cmd2 | cmd3 | cmd4').safe).toBe(false);
  });

  test('should reject multiple semicolons', () => {
    expect(sanitizeCommand('cmd1; cmd2; cmd3').safe).toBe(false);
  });

  test('should handle empty/invalid input', () => {
    expect(sanitizeCommand('').safe).toBe(false);
    expect(sanitizeCommand(null as any).safe).toBe(false);
  });
});

describe('validateSQLQuery', () => {
  test('should allow SELECT queries', () => {
    expect(validateSQLQuery('SELECT * FROM users').valid).toBe(true);
    expect(validateSQLQuery('SELECT id, name FROM users WHERE active = 1').valid).toBe(true);
  });

  test('should allow PRAGMA queries', () => {
    expect(validateSQLQuery('PRAGMA table_info(users)').valid).toBe(true);
  });

  test('should reject DROP', () => {
    expect(validateSQLQuery('DROP TABLE users').valid).toBe(false);
  });

  test('should reject DELETE', () => {
    expect(validateSQLQuery('DELETE FROM users WHERE id = 1').valid).toBe(false);
  });

  test('should reject UPDATE', () => {
    expect(validateSQLQuery('UPDATE users SET name = "John"').valid).toBe(false);
  });

  test('should reject INSERT', () => {
    expect(validateSQLQuery('INSERT INTO users (name) VALUES ("John")').valid).toBe(false);
  });

  test('should reject multiple statements', () => {
    expect(validateSQLQuery('SELECT * FROM users; DROP TABLE users').valid).toBe(false);
  });

  test('should handle empty/invalid input', () => {
    expect(validateSQLQuery('').valid).toBe(false);
    expect(validateSQLQuery(null as any).valid).toBe(false);
  });
});
