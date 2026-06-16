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

---

## 🆕 Latest Update — `grep_files` Token Consumption Hardening (2026-06-16)

### Overview

This update documents the critical token consumption controls added to the `grep_files` tool to prevent LLM context window overflow from unbounded file search output. The fix implements a **three-layer defense-in-depth strategy** that gates on content length, file size, and result count — ensuring predictable token usage regardless of project size or search pattern selectivity.

---

### 🔴 Problem Statement: Token Explosion Risk

The original `grep_files` implementation had no safeguards against returning excessive output from large codebases:

| Vector | Original Behavior | Impact |
|--------|------------------|--------|
| **Per-line content** | Returned entire line (unlimited) | A single 10KB minified JS file could return a 50KB+ match string |
| **File size gate** | No check — read any file regardless of size | Searching `node_modules` or build artifacts could load multi-MB files |
| **Result count** | Returned every matching line in the directory tree | A broad pattern like `.js` across a 10k-file project could return thousands of results |

This created a **token explosion risk**: a single `grep_files` call with a non-selective pattern on a large project could consume the entire LLM context window (typically 32k–128k tokens) in one response, causing:
- Context overflow errors
- Premature session termination
- Wasted API credits on unparseable output

---

### ✅ Solution: Three-Layer Defense-in-Depth

#### Layer 1 — `max_content_length` (Line Truncation)

**Purpose:** Prevent individual match lines from consuming excessive tokens.

```typescript
// Parameter definition (Zod schema)
max_content_length: z.number().int()
  .min(10).max(500)           // Hard bounds: 10–500 chars
  .optional()                  // Optional — user can override
  .default(150),               // Conservative default for most use cases

// Implementation (line truncation with ellipsis indicator)
const maxCl = max_content_length ?? 150;
content: (rawContent.length > maxCl ? rawContent.slice(0, maxCl) + '…' : rawContent)
```

**Behavior:**
- Default: **150 characters per line** — balances readability with token economy
- Minimum: **10 characters** — prevents truncation to useless fragments
- Maximum: **500 characters** — allows detailed output when needed (e.g., long string literals)
- Truncated lines receive a `…` suffix so the LLM knows more content exists

**Token Impact:** A 10KB line → truncated to ~150 chars (~40 tokens). Without this, a single match could consume 25× more tokens.

---

#### Layer 2 — `max_file_size` (File Size Gate)

**Purpose:** Prevent loading and processing large files that would waste I/O and memory.

```typescript
// Parameter definition (Zod schema)
max_file_size: z.number().int()
  .min(1024)                   // Minimum: 1KB — skip tiny files only if explicitly needed
  .default(100_000),           // Default: 100KB — covers most source files

// Implementation (early stat check before reading content)
const stats = await fs.stat(fullPath);  // ASYNC stat
if (stats.size > MAX_FILE_SIZE) {
  continue;  // Skip large files to prevent token explosion
}
```

**Behavior:**
- Default: **100KB per file** — covers most source code files, excludes build artifacts and minified bundles
- Files exceeding the limit are silently skipped via `fs.stat()` before any content is read
- This prevents loading multi-MB files into memory or returning massive output

**Token Impact:** A 5MB minified JS file → completely excluded. Without this, a single large file could consume 10–20× more tokens than a typical source file.

---

#### Layer 3 — `max_results` (Result Count Cap)

**Purpose:** Prevent unbounded result accumulation across the entire directory tree.

```typescript
// Parameter definition (Zod schema)
max_results: z.number().int()
  .min(1).max(500)             // Hard bounds: 1–500 results
  .optional()                  // Optional — user can override for debugging
  .default(20),                // Conservative default to prevent overflow

// Implementation (dual early-exit strategy)
const MAX_RESULTS = max_results ?? 20;
let resultsCount = 0;

async function walkDirectory(dirPath: string): Promise<void> {
  if (resultsCount >= MAX_RESULTS) return;  // ← Early exit in recursion
  // ...
}

for (const entry of entries) {
  if (resultsCount >= MAX_RESULTS) return;  // ← Early exit inside file loop
```

**Behavior:**
- Default: **20 results** — sufficient for most debugging/search tasks, prevents runaway output
- Minimum: **1 result** — useful for existence checks (`grep_files(pattern="TODO", max_results=1)`)
- Maximum: **500 results** — allows deep debugging when explicitly requested
- The `truncated` field in the response signals whether more results are available

**Token Impact:** A broad pattern like `.js` across 10k files → capped at 20 matches (~400 tokens max). Without this, could return thousands of results (hundreds of kilobytes).

---

### 📊 Combined Token Budget Analysis

| Scenario | Without Fix | With Fix (Defaults) | Reduction |
|----------|-------------|---------------------|-----------|
| **Small file** (1KB source) | ~50 tokens/line × 1 line = **50 tok** | Same (below all thresholds) | No change |
| **Medium file** (10KB source, 1 match) | ~250 tok/line × 1 line = **250 tok** | Truncated to 150 chars = **40 tok** | **84% reduction** |
| **Large file** (1MB build artifact, 1 match) | ~5000 tok/line × 1 line = **5000 tok** | Skipped entirely (**0 tok**) | **100% reduction** |
| **Broad pattern** (`.js` across 10k files) | Thousands of matches = **>100k tok** | Capped at 20 results = **<400 tok** | **99.6% reduction** |

---

### 🔧 Implementation Details

#### File Location
- **Tool definition:** `src/tools/fileSystemTools.ts` (lines ~1350–1450)
- **Helper functions:** `escapeRegExp()` and `matchGlob()` defined in same file (lines ~1460–1475)

#### Helper Functions

```typescript
/** Escape special regex characters for literal string matching */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Simple glob pattern matcher (supports *, ?) */
function matchGlob(filename: string, pattern: string): boolean {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
  return regex.test(filename);
}
```

**Purpose:** These helpers enable the `include` and `exclude` parameters to work with both literal strings (auto-escaped) and glob patterns (`*`, `?`). They are used internally for file filtering before content is read.

#### Safety: ReDoS Protection

The tool integrates with the existing `isSafeRegex()` security check from `src/security.ts`:

```typescript
let regex: RegExp;
try {
  const safePattern = isSafeRegex(pattern) ? pattern : escapeRegExp(pattern);
  regex = new RegExp(safePattern, 'i'); // Case-insensitive by default
} catch {
  return handleError(new Error(`Invalid regex pattern: ${pattern}`));
}
```

**Behavior:** If the user-provided pattern fails the ReDoS safety check (via `isSafeRegex()`), it is treated as a **literal string** rather than rejected. This prevents regex denial-of-service attacks while maintaining usability for non-regex searches.

---

### 🧪 Verification Results

| Test Case | Expected Behavior | Status |
|-----------|------------------|--------|
| Small file, selective pattern | Returns full matches (under all thresholds) | ✅ Pass |
| Large file (>100KB), any pattern | File skipped entirely | ✅ Pass |
| Broad pattern across large project | Capped at 20 results with `truncated: true` | ✅ Pass |
| Per-line content >150 chars | Truncated to 150 + `…` suffix | ✅ Pass |
| Custom overrides (e.g., max_results=500) | Respects user override for debugging | ✅ Pass |
| Invalid regex pattern | Falls back to literal string search | ✅ Pass |

---

### ⚠️ Caveats & Trade-offs

1. **Truncation visibility:** Users may not see the full line content if it exceeds `max_content_length`. The `…` suffix indicates more exists, but they must increase `max_content_length` explicitly to view it.

2. **Silent file skipping:** Files exceeding `max_file_size` are skipped without notification. For debugging purposes, users can set `max_file_size` higher (e.g., 10MB) or inspect the file manually with `read_file`.

3. **Result count vs. completeness:** The `truncated` field signals when results were cut off, but the LLM may not always act on this signal. Users should be aware that a broad search may only return partial results by default.

4. **Performance:** The dual early-exit strategy (recursion + loop) ensures minimal I/O once the cap is reached. However, `fs.stat()` calls for every file add overhead — negligible compared to `fs.readFile()` savings on large files.

---

### 📋 Related Code Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/tools/fileSystemTools.ts` | Feature addition | Added `grep_files` tool with three-layer token consumption controls |
| `src/security.ts` (existing) | Integration | Tool uses `isSafeRegex()` for ReDoS protection fallback to literal matching |

---

### 🔮 Future Considerations

1. **Progressive disclosure:** Could add a `--verbose` flag that returns full content when explicitly requested, overriding defaults.
2. **Streaming output:** For very large projects, consider streaming matches in chunks rather than returning all at once (would require SDK changes).
3. **File type filtering:** The current `include`/`exclude` parameters are basic glob patterns — could be extended to support MIME types or language identifiers.

---
