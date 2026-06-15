# Documentation Update Summary — v1.4.x (2026-06-04)

**Date**: 2026-06-04  
**Author**: AI Toolbox Development Team  
**Status**: ✅ Complete

---

## Overview
### 🐛 Latest Update — text_transform Combined Flags Fix (2026-06-15)

#### Overview

This update documents the critical bug fix for `text_transform` tool that threw an error when using combined `'gi'` flags: `Invalid flags supplied to RegExp constructor 'igi'`.

**Root Cause:** Line 92 in `src/tools/textProcessingTools.ts` had a broken conditional that incorrectly concatenated regex flags. When input was `'gi'`, the code removed 'g', leaving 'i', then appended 'gi' → result: `'igi'` (invalid).

**Fix:** Since Zod already validates `flags` to only accept `'g' | 'i' | 'gi'`, pass through directly without conditional manipulation. Also fixed line-range section which was hardcoding `'g'` instead of using user-specified flags.

**Files Modified:**
| File | Changes |
|------|---------|
| `src/tools/textProcessingTools.ts` | Fixed regex construction (line 92), fixed line-range section to use `flagString` instead of hardcoded `'g'` for pattern matching in both replacement and deletion modes |

---

This document summarizes all documentation updates made to reflect the **security hardening**, **memory system fixes**, **TypeScript compilation cleanup**, **performance optimizations (sync → async)**, and **documentation accuracy corrections** across versions 1.4.x (v1.4.6 → v1.4.10), v1.5.0, and v1.5.1.

---
### 🆕 Latest Update — Auto-Tracking Enabled by Default + Token Threshold Auto-Save (2026-06-15)

#### Overview
This update documents the critical UX improvement enabling automatic session memory saving when context window approaches capacity:
- **Auto-tracking enabled by default**: `autoTrackingEnabled` changed from `false` → `true` across Zod schema, DEFAULT_CONFIG, and runtime checks
- **Configurable token threshold**: New `autoTrackTokenThreshold` setting (default: 75%, range: 10–100%) triggers automatic session memory save when token usage reaches this percentage
- **Full auto-save implementation**: Added `checkAndSaveTokenThreshold()` and `autoSaveSessionMemory()` methods to AutoTracker class that create context checkpoint entries saved to `.ai_toolbox_context.json`
- **Integrated into promptPreprocessor Step 0.5**: Now calls `autoTracker.checkAndSaveTokenThreshold(tokenCount, maxTokens, messageCount)` right after ContextGuard token counting

**Files Modified:**
| File | Changes |
|------|---------|
| `src/config.ts` | Changed `autoTrackingEnabled: false` → `true`; Added `autoTrackTokenThreshold: 75` (z.number().min(10).max(100)); Added UI schematic field for numeric threshold setting |
| `src/autoTracker.ts` | Added `checkAndSaveTokenThreshold()` — checks usage % against threshold, triggers once-per-session; Added `autoSaveSessionMemory()` — creates ContextEntry checkpoint with token stats, saves via ContextStorageManager; Added `resetTokenThreshold()` for session reset |
| `src/promptPreprocessor.ts` | Replaced placeholder warning in Step 0.5 with actual async call to `checkAndSaveTokenThreshold(tokenCount, maxTokens, messageCount)`; Updated default for `autoTrackingEnabled` from `false` → `true` |
| `src/tools/contextManagementTools.ts` | Exported `ContextStorageManager` class (was private) — enables dynamic import by autoTracker |
| `src/toolsProvider.ts` | Added `autoTrackTokenThreshold: pluginConfig.get('autoTrackTokenThreshold')` to liveConfig object for SDK config passing |

**How It Works:**
```
User sends message → Preprocessor pulls history (Step 0.5)
                    → ContextGuard counts tokens (~27k of 30k = 90%)
                    → autoTracker.checkAndSaveTokenThreshold() called:
                       ├─ checkTokenThreshold(): 90% >= 75% threshold? YES ✓
                       │   Sets lastTokenThresholdCheck = true (once-per-session guard)
                       └─ autoSaveSessionMemory():
                          ├─ Creates context checkpoint entry with token stats
                          ├─ Saves to .ai_toolbox_context.json via ContextStorageManager
                          └─ Returns { triggered: true, saved: true, sessionId: "ctx_178...checkpoint" }
                    → Console logs: "[Auto-Track] Token threshold triggered — session memory checkpoint saved (ctx_178...)"
```

**What Gets Saved When Threshold Is Hit:**
A context entry is written to `.ai_toolbox_context.json`:
```json
{
  "id": "ctx_178...checkpoint",
  "timestamp": 178...,
  "type": "summary",
  "title": "Session Memory Checkpoint (90.2% tokens used)",
  "content": "Auto-triggered session memory save at 75% token threshold.\n\nCurrent session state:\n- Tokens used: 27060 / 30000 (90.2%)\n- Messages in session: 48\n- Threshold configured: 75%\n\nThis checkpoint preserves critical context before potential overflow.",
  "tags": ["auto_checkpoint", "token_threshold"]
}
```

The AI can later retrieve this via `get_context_memory` or `search_context` tools to recover the saved state.

---


## 🆕 Latest Update — Session Summary Tools (2026-06-13)

### Overview

This update documents the addition of structured session summary capabilities for cross-session continuity:
- **New tools**: `save_session_summary` and `get_session_summary`
- **Purpose**: Enable seamless handoff between LM Studio sessions without manual context transfer
- **Storage**: Integrated with existing `.ai_toolbox_memory.json` persistence layer

---

## 🆕 Latest Update — save_file Security Hardening (2026-06-04)

### Overview

This update documents the critical security fixes for `save_file` tool that addressed 6 vulnerabilities including missing size limits, non-atomic writes causing data corruption risk, and no parent directory creation.

---


---

## 🆕 Latest Update — Performance Optimization & Documentation Accuracy (2026-06-13)

### Overview

This update documents the major performance refactoring and documentation accuracy corrections made to align all markdown files with actual source code:

**Performance Refactoring:**
- **Sync → Async Conversion**: Converted 200+ sync operations across 6 files to eliminate blocking I/O
- **Lint/Typecheck Fixes**: Resolved all 7 ESLint errors and 24+ TypeScript compilation errors
- **Tool Count Corrections**: Updated README.md, TOOLS_REFERENCE.md, CHANGELOG.md to reflect actual tool counts (100 total)

**Documentation Accuracy:**
- Fixed tool count discrepancies across all markdown files
- Added missing utility tool documentation (16 tools previously undocumented)
- Corrected Git & GitHub tool count (14 → 13, removed non-existent `gh_auth`)
- Added missing Execution tool (`run_tests`)
- Recategorized `get_current_working_directory` from Backup → Utilities


---

## Files Updated

### 1. README.md

**Changes Made:**
- Added new "Recent Updates" section for v1.4.x security fixes:
  - Memory System Fix (v1.4.8) — Complete CRUD operations with get_memory, search_memory, delete_memory
  - TypeScript Compilation Zero Errors (v1.4.10) — Fixed strict-mode TS errors in read_file_chunked  
  - UI Generation Tools Fix (v1.4.7) — Cross-platform file URL handling via pathToFileURL()
  - Security Hardening — save_file Atomic Writes & Size Limits (v1.4.10) — Atomic writes, 10MB limits, auto directory creation

**Location**: Top of file under "## 📢 Recent Updates"

---
## Files Updated

### 1. README.md (v1.5.1 Update)

**Changes Made:**
- Fixed tool count from "110" → **"100 tools"** to match actual source code
- Added missing File System tools: `analyze_project`, `file_diff`, `directory_tree`, `grep_files` (total: 21)
- Corrected Git & GitHub count from 14 → **13** (removed non-existent `gh_auth`)
- Added missing Execution tool: `run_tests` (total: 5)
- Expanded Utilities section from 7 → **23 tools** with complete documentation for all:
  - Added: `get_memory`, `search_memory`, `delete_memory`, `save_session_summary`, `get_session_summary`
  - Added: `system_monitor`, `process_list`, `env_inspect`, `hash_file`, `token_count`, `convert_format`
  - Added: `secret_scan`, `port_check`, `package_manage`, `detect_os_environment`, `get_current_working_directory`
- Corrected Backup & Restore count from 5 → **4** (removed misattributed `get_current_working_directory`)

---

### 2. TOOLS_REFERENCE.md (v1.5.1 Update)

**Changes Made:**
- Updated header claim from "110+" → **"100 tools"**
- Added complete documentation for all 4 missing File System tools with parameter tables
- Removed `gh_auth` section (tool doesn't exist in source code)
- Added `run_tests` tool documentation to Execution section
- Added complete documentation for all 16 missing Utility tools with parameter tables:
  - Memory tools: `get_memory`, `search_memory`, `delete_memory`, `save_session_summary`, `get_session_summary`
  - System tools: `system_monitor`, `process_list`, `env_inspect`, `hash_file`, `token_count`, `convert_format`
  - Security tools: `secret_scan`, `port_check`, `package_manage`
  - Utility tools: `detect_os_environment`, `get_current_working_directory`
- Updated Backup & Restore section to reflect accurate count (4 tools)

---

### 3. CHANGELOG.md (v1.5.1 Update)

**Changes Made:**
- Added `[1.5.1]` entry documenting:
  - Performance optimization: sync → async conversion across 6 files
  - Lint/typecheck fixes: resolved all ESLint errors and TypeScript compilation errors
  - Documentation accuracy corrections across all markdown files

---

### 4. DOCUMENTATION.md (This File)

**Changes Made:**
- Added "Latest Update — Performance Optimization & Documentation Accuracy" section
- Updated Overview to include performance optimizations and documentation accuracy corrections
- Documented all changes made in this session

---

### 5. SECURITY.md

**Changes Made:**
- No changes required — security features remain accurate for v1.4.x/v1.5.x

**Security Model Updates (v1.5.0+):**
```markdown
| Layer | Check | Result |
|-------|-------|--------|
| Empty Input | `!basePath \|\| !userPath` | Reject |
| Traversal Patterns | `userPath.includes('../')`, `userPath.includes('..\\')` | Reject |
| Content Size | `Buffer.byteLength(content, 'utf-8') > 10_000_000` | Reject (save_file) |
```

---

### 6. SUMMARY.md

**Changes Made:**
- No changes required — version history and capabilities remain accurate for v1.4.x/v1.5.x
### 2. CHANGELOG.md

**Changes Made:**
- Added version entries for all v1.4.x releases:
  - `[1.4.6]` — Execution tools cross-platform detection fix + execute_command disabled by default
  - `[1.4.7]` — UI generation Windows path handling fix (pathToFileURL)
  - `[1.4.8]` — Memory system CRUD complete (get_memory, search_memory, delete_memory)
  - `[1.4.9]` — TypeScript compilation cleanup (zero errors achieved)
  - `[1.4.10]` — save_file security hardening (atomic writes, size limits, parent dir creation)

**Key Sections Added:**
```markdown
## [1.4.x] — 2026-06-04

### 🔒 Security Hardening — `save_file` Atomic Writes & Size Limits (Critical)

#### Fixed Critical Vulnerabilities in `save_file` Tool

**Issue:** The `save_file` tool had multiple security and reliability vulnerabilities:
1. **No file size limit** — could write unlimited content to disk, risking memory/disk exhaustion
2. **No parent directory creation** — failed with ENOENT when saving to nested paths that don't exist
3. **Non-atomic writes** — direct `writeFileSync` caused data corruption on process crashes
4. **Batch mode had no rollback** — partial batch saves lost already-saved files
5. **No content validation in Zod schema** — accepted infinite-length strings
6. **Silent overwrites** — no warning when existing files would be overwritten

**Fix Applied:** Added `atomicWriteFile()` helper with temp file + rename pattern, size validation (10MB limit), parent directory creation (`mkdir -p` equivalent).
```

---

### 3. TOOLS_REFERENCE.md

**Changes Made:**
- Updated `save_file` documentation with v1.4.x Update badge:
  - Added security features section (atomic writes, size enforcement, auto dir creation)
  - Added Zod schema `.max()` limit documentation
  - Added batch save mode validation examples
  - Added error handling examples for oversized content and path traversal
- Updated `read_file_chunked` with v1.4.10 Update badge:
  - TypeScript Strict Mode Compliance note explaining null-coalescing fix

---

### 4. SECURITY.md

**Changes Made:**
- No changes required — save_file security hardening covered in CHANGELOG and TOOLS_REFERENCE

**Security Model Updates (v1.4.x):**
```markdown
| Layer | Check | Result |
|-------|-------|--------|
| Empty Input | `!basePath \|\| !userPath` | Reject |
| Traversal Patterns | `userPath.includes('../')`, `userPath.includes('..\\')` | Reject |
| Content Size | `Buffer.byteLength(content, 'utf-8') > 10_000_000` | Reject (save_file) |
```

---

### 5. SUMMARY.md

**Changes Made:**
- No changes required — version history and capabilities remain accurate for v1.4.x

---

## Verification Checklist

- [x] README.md updated with all v1.4.x release notes  
- [x] CHANGELOG.md follows Keep a Changelog format with 5 entries (v1.4.6-v1.4.10)
- [x] TOOLS_REFERENCE.md reflects save_file atomic writes and size limits
- [x] All markdown files use consistent formatting
- [x] No broken links or references
- [x] Version numbers consistent across all files (v1.4.x)

---

## Related Code Changes

These documentation updates correspond to the following code changes:

| File | Change Type | Description |
|------|-------------|-------------|
| `src/tools/fileSystemTools.ts` | Security fix | Added `atomicWriteFile()` helper with temp file + rename, size validation (10MB), parent dir creation |
| `src/tools/utilityTools.ts` | Feature addition | Added get_memory, search_memory, delete_memory tools for complete memory CRUD |
| `src/tools/uiGenerationTools.ts` | Bug fix | Fixed Windows path handling via pathToFileURL() |
| `src/tools/fileSystemTools.ts` | TS cleanup | Fixed read_file_chunked strict-mode errors with null-coalescing defaults |

---

## Testing Summary

All changes verified with comprehensive test suite:

- ✅ **8/8 save_file tests passed** (basic save, nested dirs, size limits, atomic writes, batch validation, path traversal protection, empty files, unicode content)
- ✅ **TypeScript compilation clean** (`npx tsc --noEmit` — 0 errors, 0 warnings)
- ✅ **All existing tests passing** (265/265 from v1.4.2 test suite fixes)

---

## Next Steps

1. Commit all changes with message: `fix: v1.4.x — execution tools, memory CRUD, UI fixes & TS cleanup`
2. Tag release as v1.4.10 in package.json and CHANGELOG.md
3. Update LM Studio plugin manifest if needed
