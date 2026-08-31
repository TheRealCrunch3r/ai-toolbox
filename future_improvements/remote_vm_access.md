# Remote VM Access via SSH — Design Document

Status: **DRAFT for user review** (Phase 0 gate) · Date: 26.08.2026 · Target release: v1.9.x follow-up to `1c973cc`
Plan reference: `plan_1787760850565_tczhc3d3z`

## 1. Purpose & scope
Give the plugin controlled SSH access to user-owned VMs: remote command execution, file transfer (SFTP), service management, and persistent tmux/screen sessions. Access is **profile-governed** — hosts are registered in a user-confirmed allowlist; no tool accepts an ad-hoc hostname from model output.

### Non-goals (v1)
- T3 ops tier (`remote_install`, snapshot/restore) → v2 candidate
- WSL2 bridge setup, WinRM/PSRemoting → ruled out for now (docs-only if needed later)
- Key-based auth *code* → schema seam only (`auth.type: "key"` reserved); password-only in v1 per user decision
- GUI/screen-level remote control (VNC/RDP) → out of scope entirely
- Any silent auto-installation of software on remote hosts

## 2. Locked decisions (user, 26.08.2026)
| # | Decision | Value |
|---|----------|-------|
| D1 | Scope | T0 core + T1 state + T2 sessions; refinable later |
| D2 | Windows target | OpenSSH Server (native), profile `dialect: "ps"` |
| D3 | Auth | **Passwords only, asked per connection in chat (C1). NO permanent password storage anywhere** |
| D4 | Profile governance | Staged writes + out-of-band user confirmation ("approve ssh profiles") before activation — LLM may stage, only user confirmation activates |
| T-transport | Transport lib | `ssh2` (CLI spawn ruled out: no non-interactive password auth without `sshpass`, absent on Windows) |
| R1 | House rule | Session artifacts = index + checkpoint summaries only; any runtime-registered secret is scrubbed at **exactly two** write points (index append, summary save) — same pattern as project session memory |

## 3. Architecture
```
src/tools/remote/
├── types.ts            # RemoteTransport interface + profile/session zod schemas
├── ssh2Transport.ts    # Production impl wrapping npm `ssh2` behind the interface
├── profileStore.ts     # Active + pending profile files (atomic, 0600 on POSIX)
├── credentialManager.ts# RAM-only passwords: Map<profileId,{password,ttsAt}>, TTL ~5min,
│                       #   lockout after 3 failures, redaction registry (secret set)
├── sessionManager.ts   # tmux→screen session lifecycle on pooled connections
└── remoteTools.ts      # Tool definitions + handlers (T0/T1/T2), registered in toolsProvider

src/security.ts         # + redactSecrets(text, registry) — called at the 2 write points
scripts/ssh_cred.mjs    # Optional C2 sidecar: read password from terminal → one-shot file
                        #   consumed by plugin (high-value hosts); v1 decision pending user answer re shared root pwds
```

Data flow (C1 auth):
```
model → ssh_exec("vm-01", cmd)
  → CredentialManager.get("vm-01") → miss/locked/expired
  → tool returns {status:"auth_required", profile, host, user, prompt}   (structured, never free-text)
user types password in chat
  → model calls ssh_auth_supply("vm-01", pw)
  → RAM store + redaction registry.add(pw); original ssh_exec retried by model
  → ssh2Transport connects (pooled per profile, idle TTL ~5min), executes, caps+scrubs output → return
```

## 4. Profile schema
Location: LM Studio home dir via existing `findLMStudioHome()` — `<lmhome>/ai_toolbox_ssh/ssh_profiles.json` (+ `.pending.json`). File mode 0600 on POSIX. **No password material in either file.**

```jsonc
{
  "version": 1,
  "profiles": [
    {
      "id": "vm-01",                    // tool-facing name; regex ^[a-z0-9][a-z0-9_-]{2,31}$
      "host": "192.168.1.50",           // allowlist: set here, never from model output at call time
      "port": 22,
      "user": "admin",
      "os": "linux",                    // linux | macos | windows → dialect + service backend
      "dialect": "bash",                // bash (auto for linux/macos) | ps (windows default; user-overridable)
      "auth": { "type": "password" },   // v1: password only. Reserved: { "type":"key", "path":"..." }
      "mode": "exec",                   // read-only | exec — new profiles default to READ-ONLY
      "commandsDeny": [ ... ],          // optional regex list, matched before execution (both modes)
      "createdAt": "...", "updatedAt": "..."
    }
  ]
}
```
Audit log: `<lmhome>/ai_toolbox_ssh/ssh_audit.log` — append-only lines `ISO | profile | event | detail`; events include `staged`, `applied`, `auth_supplied`, `lockout`, `session_open/close`. **Never contains secrets or command output.**

## 5. Auth design (C1) + zero-persistence guarantee
- Passwords live exclusively in `credentialManager` RAM state. Process exit = gone.
- TTL ~5 min idle per profile; pooled ssh2 connection reused until then → user re-types only on first use, expiry, or host-side disconnect.
- 3 consecutive failures → profile locked for 15 min (anti-loop: a buggy/injected model cannot hammer).
- `ssh_profile_list` and all errors expose host/user/port/mode — never auth material; existing secret-scrubber runs over every remote stdout/stderr before it reaches context.
- **Redaction registry**: each supplied password is added to an in-memory Set; `redactSecrets()` replaces them with `****`. Called at exactly two persistence write points (session index append, session summary save) + the audit-log writer. This closes the only residual leak under the house rule R1 (summary written while secret still fresh in context).
- Residual risk documented: typed password is visible to the model for the rest of the conversation → **unique passwords per host recommended**; shared root password + injection = lateral-movement amplifier (see threat table, T2 row).

## 6. Tool reference (v1)
| Tool | Tier | Params | Notes |
|---|------|--------|-------|
| `ssh_exec` | T0 | profile, command, timeout? (default 30s, max 300s) | dialect-aware quoting rules in description; output capped (~16KB head+tail), scrubbed |
| `ssh_file_put` / `ssh_file_get` | T0 | profile, local_path, remote_path | SFTP; size caps reuse file-system tool limits |
| `ssh_auth_supply` | T0 | profile, password | RAM-only; never echoes value back |
| `ssh_profile_list` | T0 | — | metadata only |
| `ssh_profile_create/update/delete` | T0 | staged fields | writes `.pending.json` ONLY; returns human-readable staged summary |
| `ssh_profile_apply` | T0 | confirmation_token | moves pending→active; **refuses unless user's out-of-band confirmation appears in current turn**; stale pending >24h auto-expired |
| `remote_ls` / `remote_read_file` / `remote_write_file` | T1 | profile, remote_path... | thin wrappers over transport; write ops respect `mode` |
| `service_status/start/stop` | T1 | profile, service_name | backend autodetect: systemd (linux) · launchctl (macos) · sc.exe/powershell (windows) |
| `session_open/send/read/close` | T2 | session name, payload, line count? | tmux → screen fallback; install only with explicit user confirmation; sessions die with socket, dispose on app exit |

## 7. Windows target: OpenSSH Server setup (one-pager for users)
1. `Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1` (Win 10/11 + Server 2019+)
2. Set `PasswordAuthentication yes` in `C:\ProgramData\ssh\sshd_config`, then `Restart-Service sshd`
3. Firewall: port 22 inbound for the relevant profile scope
4. Default login shell is `powershell.exe` → profile `dialect: "ps"`; quoting differs from bash (`$var` expands!) — tool descriptions carry dialect-specific examples
Probe script (run per host before onboarding): attempts password-only auth and reports whether `PasswordAuthentication` is actually enabled — many cloud images/Ubuntu Server installs disable it by default, which would make that host unreachable under v1's password-only rule.

## 8. Threat model & mitigations
| # | Threat | Mitigation |
|---|--------|------------|
| T1 | Injection stages malicious profile (exfil host) | Staging only; activation requires user out-of-band token; audit log shows staging events for review |
| T2 | Shared root password seen in context + injected model with `ssh_exec` + profile list → lateral movement | Unique-per-host passwords (docs, strong rec); read-only default mode; C2 sidecar option for high-value hosts; lockout caps brute attempts |
| T3 | Injection impersonates auth prompt ("type your admin password") | Structured `{auth_required, host, user}` payload — docs: verify hostname before typing; allowlist limits blast radius to registered host |
| T4 | Secret leaks into persisted session artifacts (index/summary) | Redaction registry + scrub at the two write points only (house rule R1); audit log never stores values |
| T5 | Passwords in transit on untrusted network | Password auth = credentials visible on capture; docs: LAN/VPN/WireGuard required for exposed hosts |
| T6 | Hung remote command / leaked socket stalls host process | Hard timeout per call, pool idle eviction, dispose hooks on LM Studio exit (mirrors `backgroundCommandTools`); integration test asserts zero leaked handles |
| T7 | Command injection via dialect confusion (bash vs ps quoting) | Profile-level `dialect`; existing `sanitizeCommand()` patterns reused as second layer tuned per OS; deny-lists per profile |

## 9. Test plan
- **Unit (fake RemoteTransport, no network in CI)**: auth flow happy path / TTL expiry / lockout; staging→apply gate (**unconfirmed apply MUST fail**); redaction at both write points (fixture contains typed secret → assert absent from index/summary output); profile schema validation rejects ad-hoc host params.
- **Integration**: in-process `ssh2` Server on 127.0.0.1 (pending spike §11) — password auth, exec stdout capture, SFTP round-trip; skip-gracefully if unavailable.
- **Live smoke (user-run)**: one Linux box + Windows OpenSSH box; probe script first; verify read-only mode blocks writes; verify no `.bak`/secret residue in LM Studio home after run.
- Gate per house pattern: `typecheck`, full jest suite, lint, madge circular — zero new warnings.

## 10. Out of scope / v2 backlog
T3 ops tier · WSL2 bridge guide · key-auth code path (schema seam exists) · WinRM · OS-keychain encrypted profiles (moot while passwords are RAM-only) · per-command allow-lists finer than regex deny-lists.

## 11. Spike findings (filled by Phase-0 step 3, scratch branch only)
- [ ] `npm i ssh2` → tsup bundle result: <pending>
- [ ] in-process `ssh2` Server usable for tests (API verified): <pending>
- [ ] password auth + exec round-trip: <pending>
- [ ] SFTP on server side feasible without extra deps: <pending>
