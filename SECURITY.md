# Security Guidelines

Comprehensive documentation of security features, threat models, and responsible disclosure for the AI Toolbox plugin.

> **v1.6.6 Update**: AST safety layer added to `insert_at_line` and `delete_lines` — both tools now parse file AST before modification to prevent code-breaking operations.

---

## 📋 Table of Contents

- [Security Architecture](#security-architecture)
- [Threat Model](#threat-model)
- [Security Controls](#security-controls)
- [Input Validation](#input-validation)
- [Secure Defaults](#secure-defaults)
- [Dependency Security](#dependency-security)
- [Incident Response](#incident-response)

---

## 🏗️ Security Architecture

The AI Toolbox plugin implements a multi-layered security approach:

```
User Input → Validation Layer → Sanitization → Execution → Output
              (Zod schemas)    (Path/SQL/cmd)  (Gated)     (Truncated)
                    │                │             │           │
                    ▼                ▼             ▼           ▼
            Type & Format    Path Traversal   Category    Content Size
            Validation       Prevention       Enforcement Limits
```

### Layer 1: Input Validation (Zod Schemas)

All user inputs are validated using Zod schemas before processing:

| Parameter | Validation | Purpose |
|-----------|------------|---------|
| `file_name` | `z.string()` + path validation | Prevent empty/malformed paths |
| `max_length` | `z.number().min(1).max(50000)` | Enforce character limits |
| `pattern` (grep) | Regex safety check (`isSafeRegex()`) | Prevent ReDoS attacks |
| `command` | Sanitization (`sanitizeCommand()`) | Block dangerous shell commands |

### Layer 2: Path Validation

All file paths pass through `validatePath()` in `src/security.ts`:

```typescript
function validatePath(userPath: string, basePath: string): boolean {
  // Empty check
  if (!userPath) return false;
  
  // UNC path prevention
  if (userPath.startsWith('\\\\')) return false;
  
  // Resolve against base path and verify within allowed boundaries
  const resolved = resolvePath(userPath);
  return isWithinAllowedBase(resolved, basePath);
}
```

**Threats Mitigated:**
- Directory traversal (`../`, `..\\`)
- UNC path attacks (`\\\\server\\share`)
- Path normalization bypasses
- Symlink abuse (indirectly via base path enforcement)

### Layer 3: Command Sanitization

Shell commands undergo multi-layer sanitization in `sanitizeCommand()`:

```typescript
function sanitizeCommand(command: string): { safe: boolean; reason?: string } {
  // Layer 1: Dangerous pattern blocking
  if (command.includes('rm -rf') || command.includes('sudo')) return { safe: false, reason: 'Dangerous command' };
  
  // Layer 2: Category enforcement
  const categories = classifyCommand(command);
  if (!isCategoryEnabled(categories)) return { safe: false, reason: 'Category disabled' };
  
  return { safe: true };
}
```

**Threats Mitigated:**
- Command injection (`;`, `&&`, `||`)
- Pipe abuse (limit to 2 pipes)
- Environment variable tampering
- Dangerous patterns (`rm -rf`, `sudo`, etc.)

### Layer 4: Category Enforcement

Tools are gated by configuration categories in `src/config.ts`:

| Category | Default State | Purpose |
|----------|--------------|---------|
| `fileSystem` | Enabled | File read/write/search operations |
| `webSearch` | Enabled | Web research tools |
| `browserAutomation` | Disabled | Prevent unauthorized browser control |
| `gitOperations` | Disabled | Require explicit opt-in for Git access |
| `executionJavaScript` | Disabled | Prevent arbitrary code execution |
| `executionPython` | Disabled | Prevent arbitrary code execution |
| `executionShell` | Disabled | Prevent shell command injection |

**God Mode Bypass:** Setting `godMode: true` enables ALL tool categories regardless of individual toggle settings. Use with extreme caution.

---

## 🎯 Threat Model

### Asset Inventory

| Asset | Sensitivity | Protection Level |
|-------|-------------|-----------------|
| User files in working directory | High | Path validation, atomic writes |
| Plugin configuration | Medium | Zod schema validation |
| Session state (JSON/msgpack) | Medium | Atomic file writes, size limits |
| Network requests | Low-Medium | SSRF protection, protocol whitelisting |

### Attack Vectors

#### 1. Directory Traversal
**Risk:** High  
**Mitigation:** `validatePath()` with base path enforcement  
**Test Case:** `file_name=../../../etc/passwd` → Should be rejected

#### 2. Command Injection
**Risk:** Critical  
**Mitigation:** `sanitizeCommand()` blocks dangerous patterns, category enforcement  
**Test Case:** `command="; rm -rf /"` → Should be blocked with reason "Dangerous command"

#### 3. ReDoS (Regex Denial of Service)
**Risk:** Medium  
**Mitigation:** 
- `isSafeRegex()` performs precise pattern analysis to detect genuinely dangerous structures:
  - Nested repetition (`(.+)+`, `(a*)*`) — exponential backtracking risk
  - Alternating groups with quantifiers (`((a|b)+)+`) — catastrophic backtracking
- Safe patterns like `(a|b)+`, `[a-z]+`, `^import\s+` are correctly accepted
- Unsafe patterns are converted to literal matching (not silently dropped)
**Transparency:** The `grep_files` tool returns a `patternMode: 'regex' | 'literal'` field indicating whether the pattern was matched as regex or escaped to literal text  
**Test Case:** `pattern="((a+)+)b"` → Treated as literal string; `pattern="(a|b)+"` → Accepted as valid regex

#### 4. SSRF (Server-Side Request Forgery)
**Risk:** High  
**Mitigation:** URL protocol validation (`http`/`https` only), private IP blocking  
**Test Case:** `url="file:///etc/passwd"` → Should be rejected with "Protocol not allowed"

#### 5. Large File Denial of Service
**Risk:** Medium  
**Mitigation:** Size limits on file operations (10MB for save_file, 50KB for web fetch)  
**Test Case:** `save_file(content="<1GB string>")` → Should be rejected with size limit error

#### 6. Token Explosion via grep_files
**Risk:** High  
**Mitigation:** Three-layer defense-in-depth (`max_content_length`, `max_file_size`, `max_results`)  
**Test Case:** `grep_files(pattern="." , max_results=500)` → Should be capped at default limit (20)

---

## 🛡️ Security Controls

### 1. Input Validation

All user inputs are validated using Zod schemas before processing:

```typescript
// Example from fileSystemTools.ts
parameters: {
  file_name: z.string().describe('The name of the file to read'),
  max_length: z.number().int().min(1).max(50000).optional().default(5000),
}

// Example from executionTools.ts
parameters: {
  javascript: z.string(), // Dangerous pattern detection applied in implementation
  timeout_seconds: z.number().min(0.1).max(60).optional().default(5),
}
```

**Validation Rules Applied:**
- Type checking (string, number, boolean)
- Range validation (min/max values)
- Pattern matching (regex patterns for grep_files)
- Length limits (character counts for content parameters)

### 2. Path Validation

All file paths pass through `validatePath()` before any filesystem operation:

```typescript
// In security.ts
export function validatePath(userPath: string, basePath: string): boolean {
  if (!userPath || userPath.startsWith('\\\\')) return false;
  
  const resolved = resolvePath(userPath);
  return isWithinAllowedBase(resolved, basePath);
}

// Helper to check if path is within allowed boundaries
function isWithinAllowedBase(path: string, base: string): boolean {
  const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
  const normalizedBase = base.replace(/\\/g, '/').toLowerCase();
  return normalizedPath.startsWith(normalizedBase + '/') || normalizedPath === normalizedBase;
}
```

**Edge Cases Handled:**
- Empty paths → Rejected
- UNC paths (`\\server\share`) → Rejected
- Relative paths with `..` traversal → Resolved and validated against base
- Absolute paths outside allowed bases → Rejected

### 3. Command Sanitization

Shell commands undergo multi-layer sanitization:

```typescript
// In security.ts
export function sanitizeCommand(command: string): { safe: boolean; reason?: string } {
  // Layer 1: Dangerous pattern blocking
  const dangerousPatterns = [
    /rm\s+-rf/i,           // Mass deletion
    /sudo\s+/i,            // Privilege escalation
    /;\s*exit\b/i,         // Session termination
    /\$\(/i,               // Command substitution
    /`[^`]+`/i,            // Backtick command execution
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) return { safe: false, reason: 'Dangerous command detected' };
  }
  
  // Layer 2: Pipe and semicolon limits
  const pipeCount = (command.match(/\|/g) || []).length;
  if (pipeCount > 2) return { safe: false, reason: 'Too many pipes' };
  
  const semiCount = (command.match(/;/g) || []).length;
  if (semiCount > 1) return { safe: false, reason: 'Too many semicolons' };
  
  // Layer 3: Category enforcement (checked in toolsProvider.ts)
  return { safe: true };
}
```

### 4. Code Sandboxing (JavaScript/Python Execution)

Execution tools block dangerous patterns before running code:

**JavaScript Sandbox:**
```typescript
const dangerousPatterns = [
  /\beval\s*\(/i,               // Code injection
  /\bexec\s*\(/i,              // Code execution  
  /Function\s*\(/i,            // Function constructor (eval alternative)
  /String\.fromCharCode\s*\(/i, // fromCharCode bypass
  /__proto__/i,                // Prototype pollution
  /require\.resolve/i,         // Module resolution abuse
  /\bchild_process\b/i,        // Process spawning
  /os\.system/i,               // OS command execution
];

for (const pattern of dangerousPatterns) {
  if (pattern.test(code)) return { success: false, error: `Dangerous code detected` };
}
```

**Python Sandbox:**
```typescript
const dangerousPatterns = [
  /\bimport\s+os\b/i,
  /import\s+subprocess\b/i,
  /__import__\s*\(/i,
  /\beval\s*\(/i,
  /\bexec\s*\(/i,
];

for (const pattern of dangerousPatterns) {
  if (pattern.test(code)) return { success: false, error: `Dangerous Python import detected` };
}
```

### 5. SQL Injection Prevention

Database queries are validated against unsafe patterns:

```typescript
export function validateSQLQuery(query: string): { valid: boolean; reason?: string } {
  const dangerousPatterns = [
    /\bDROP\s+/i,           // Destructive operations
    /\bDELETE\s+FROM/i,     // Data deletion
    /\bUPDATE\s+\w+\s+SET\b/i, // Data modification without WHERE
    /;\s*SELECT\b/i,        // Stacked queries
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) return { valid: false, reason: 'Unsafe SQL query detected' };
  }
  
  return { valid: true };
}
```

### 6. SSRF Protection (HTTP Client)

URL validation prevents access to internal/private resources:

```typescript
function validateUrl(url: string): { valid: boolean; error?: string } {
  const parsed = new URL(url);
  
  // Block non-HTTP protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: `Protocol "${parsed.protocol}" is not allowed` };
  }
  
  // Block private IP ranges (basic check)
  const hostname = parsed.hostname;
  const blockedPatterns = [
    /^127\./,           // localhost
    /^10\./,            // 10.0.0.0/8
    /^172\.1[6-9]\./,   // 172.16.0.0/12
    /^172\.2[0-9]\./,   // 172.16.0.0/12  
    /^172\.3[0-1]\./,   // 172.16.0.0/12
    /^192\.168\./,      // 192.168.0.0/16
    /^localhost$/,      // localhost hostname
  ];
  
  if (blockedPatterns.some(pattern => pattern.test(hostname))) {
    return { valid: false, error: `Access to ${hostname} is blocked for security reasons` };
  }
  
  return { valid: true };
}
```

---

## 🔐 Secure Defaults

### Tool Gating Defaults

All dangerous tool categories are **disabled by default**:

| Category | Default State | Rationale |
|----------|--------------|-----------|
| `browserAutomation` | `false` | Prevent unauthorized browser control |
| `gitOperations` | `false` | Require explicit opt-in for Git access |
| `databaseQueries` | `false` | Prevent accidental database modifications |
| `executionJavaScript` | `false` | Prevent arbitrary code execution |
| `executionPython` | `false` | Prevent arbitrary code execution |
| `executionShell` | `false` | Prevent shell command injection |

### Size Limits Defaults

Conservative defaults prevent resource exhaustion:

| Operation | Default Limit | Rationale |
|-----------|--------------|-----------|
| File read (`max_length`) | 5,000 chars | Balance between utility and memory usage |
| File write (`save_file`) | 10 MB | Prevent disk exhaustion |
| Web fetch (`fetch_web_content`) | 50 KB | Prevent OOM from large pages |
| grep search (`max_results`) | 20 results | Prevent token explosion |
| grep content length | 150 chars/line | Balance readability and token economy |

---

## 📦 Dependency Security

### Vulnerability Management

All dependencies are regularly audited for known vulnerabilities:

```bash
# Check for outdated packages with security issues
npm audit

# Update vulnerable dependencies
npm update
```

### Recent Security Fixes

| Date | Package | Issue | Fix Applied |
|------|---------|-------|-------------|
| 2026-05-31 | `glob` v10.3.10 → v13.0.6 | CVE-2025-64756 (command injection) | Upgraded to patched version via overrides |
| 2026-05-31 | `uuid` v8.x → v11.0.4 | Math.random weakness deprecation | Upgraded to cryptographically secure implementation |

### Overrides in package.json

```json
{
  "overrides": {
    "glob": "^13.0.6",
    "uuid": "^11.0.4"
  }
}
```

---

## 🚨 Incident Response

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public issue or pull request
2. Contact the maintainers privately via GitHub issues with `[SECURITY]` in title
3. Provide detailed reproduction steps and impact assessment
4. Allow reasonable time for fix before public disclosure

### Response Timeline

| Stage | Target Timeframe |
|-------|-----------------|
| Acknowledge receipt | 24 hours |
| Assess severity | 48 hours |
| Develop fix | 7 days (critical), 30 days (medium) |
| Release patch | Within SLA timeframe |

### Security Audit Checklist

For each new feature or tool:

- [ ] Input validation using Zod schemas
- [ ] Path traversal prevention via `validatePath()`
- [ ] Command sanitization for shell operations
- [ ] Category gating enabled in config
- [ ] Size limits enforced on all parameters
- [ ] Documentation includes security warnings where applicable
- [ ] Tests cover edge cases and attack vectors

---

## 📝 Notes

This security documentation is based on the actual implementation in `src/security.ts` and individual tool modules. All security controls are actively enforced at runtime, not just documented.

For questions about security features or to report vulnerabilities, please contact the maintainers through secure channels.
