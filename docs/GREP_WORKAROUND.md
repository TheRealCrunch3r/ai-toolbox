# 🔧 grep_files — File vs Directory Detection Fix & Workaround

## 📋 Overview

The built-in `grep_files` tool had a known bug that caused silent failures when searching within individual files. This document explains the issue, root cause, the fix implemented in this project (v1.5.17), and the workaround module for advanced use cases.

---

## ✅ Status — Fixed in v1.5.17

**The core bug is now fixed at the source.** Starting with version 1.5.17, `grep_files` auto-detects whether the `path` parameter points to a file or directory and handles both correctly:

| Path Type | Before (v1.5.16) | After (v1.5.17+) |
|-----------|------------------|------------------|
| File path (e.g., `src/file.ts`) | ❌ Silent failure, 0 results | ✅ Works — searches within the file directly |
| Directory path (e.g., `src/`) | ✅ Works correctly | ✅ Still works correctly |

**No changes needed in your code.** The fix is transparent and backward-compatible.

---

### When to Use the Workaround Module (`fileSearch.ts`)

The workaround module is **no longer required for basic file searches**, but it provides advanced features:
- Include/exclude filename filtering on single files (not supported by `grep_files` for files)
- Unified API that auto-detects file vs directory
- Standalone utility functions if you need grep-like behavior outside the plugin tools

---


## ⚠️ The Problem

### Symptom
When calling `grep_files` with a **file path** as the `path` parameter instead of a directory:

```typescript
// ❌ FAILS SILENTLY — returns 0 results even when text exists
grep_files(path="src/promptPreprocessor.ts", pattern="maxTokens = threshold")
```

The tool consistently returns **empty results** (`count: 0`) despite the file clearly containing the search term.

### Reproduction Steps
1. Call `grep_files` with a single file path as the `path` argument
2. Search for text that you can verify exists in the file (via `read_file`)
3. Observe that results are always empty, even when matches exist

---

## 🔍 Root Cause Analysis

### Bug Description
The `grep_files` tool has this signature:
```typescript
grep_files(
  path: string = ".",        // ← Directory to search in (default: current dir)
  pattern: string            // ← Regex or literal string to search for
)
```

**Bug:** When a file path is passed as `path`, the tool attempts to **list its contents as if it were a directory**. Since a file has no sub-contents, it returns empty results silently — without throwing an error or warning.

### Why It Happens
1. The tool expects `path` to be a directory
2. No validation checks whether `path` is actually a directory
3. When passed a file, the internal filesystem listing fails gracefully (returns empty array)
4. The caller receives 0 results with no indication that something went wrong

### Impact
- **Silent failures** — developers waste time debugging when the tool itself is broken for this use case
- **False negatives** — searches return empty even when text clearly exists in files
- **Inconsistent behavior** — works fine on directories, fails on files

---

## ✅ The Workaround Solution

### Implementation: `src/utils/fileSearch.ts`

A utility module was created to provide reliable file searching that handles both single files and directories correctly.

#### API Functions

##### 1. `grepFile(filePath, pattern)`
Search within a **single file** for pattern matches.

```typescript
import { grepFile } from './utils/fileSearch';

const results = await grepFile('src/promptPreprocessor.ts', 'maxTokens');
// Returns: Array<{ file: string; line_number: number; content: string }>
```

##### 2. `grepDir(dirPath, pattern, includePattern?)`
Search across **multiple files in a directory**.

```typescript
import { grepDir } from './utils/fileSearch';

const results = await grepDir('src', 'autoTrackTokenThreshold', '\\.ts$');
// Returns: Array<{ file: string; line_number: number; content: string }>
```

##### 3. `grepSearch(target, pattern, includePattern?)`
**Unified search** — automatically detects whether target is a file or directory.

```typescript
import { grepSearch } from './utils/fileSearch';

// Works with files OR directories!
const results = await grepSearch('src/promptPreprocessor.ts', 'threshold');
// OR
const results = await grepSearch('src', 'autoTracker');
```

---

## 📝 Usage Examples

### Example 1: Search a single file (the problematic case)
```typescript
import { grepFile } from './utils/fileSearch';

// This WORKS — unlike the system-level grep_files tool
const matches = await grepFile(
  'src/promptPreprocessor.ts',
  'maxTokens = threshold'
);

console.log(matches.length, 'matches found');
```

### Example 2: Search across a directory (normal case)
```typescript
import { grepDir } from './utils/fileSearch';

const matches = await grepDir(
  'src',                    // ← Directory path
  'autoTrackTokenThreshold', // ← Pattern to search for
  '\\.ts$'                  // ← Optional: only .ts files
);

matches.forEach(match => {
  console.log(`${match.file}:${match.line_number} — ${match.content}`);
});
```

### Example 3: Unified search (recommended)
```typescript
import { grepSearch } from './utils/fileSearch';

// Automatically detects file vs directory — no need to know in advance!
const target = 'src/promptPreprocessor.ts'; // or 'src' for directory
const matches = await grepSearch(target, 'threshold');
```

---

## 📊 Comparison: System Tool vs Workaround

| Feature | `grep_files` (system tool) | `fileSearch.ts` (workaround) |
|---------|----------------------------|------------------------------|
| **Directory search** | ✅ Works correctly | ✅ Works correctly |
| **Single file search** | ❌ Fails silently (0 results) | ✅ Works correctly |
| **Error handling** | Returns empty array | Throws descriptive errors |
| **Regex support** | ✅ Full regex | ✅ Case-insensitive by default |
| **Include filters** | `include` glob pattern | Optional regex filter |
| **Return format** | `{ file, line_number, content }` | Same structure |

---

## 🚀 Best Practices Going Forward

### 1. Use the Workaround for File Searches
```typescript
// ✅ CORRECT — use grepFile for single files
const matches = await grepFile('src/file.ts', 'pattern');

// ❌ WRONG — this will fail silently
grep_files(path="src/file.ts", pattern="pattern")
```

### 2. Use Directory Search for Project-Wide Searches
```typescript
// ✅ CORRECT — use directory search for broad searches
grep_files(path="src", pattern="autoTracker", include="*.ts")
```

### 3. Always Verify Results When Debugging
If `grep_files` returns 0 results:
1. Check if you passed a file path instead of a directory
2. If so, use `grepSearch()` or `grepFile()` from the workaround module instead

---

## 📝 Notes for System Maintainers

This is not a fix to `grep_files` itself — that's a system-level tool controlled by the infrastructure team. This workaround provides immediate relief while a proper fix can be implemented upstream.

### What Would Fix `grep_files` at the Source:
1. Add validation: check if `path` is a directory before searching
2. If `path` points to a file, either:
   - Throw an error with a helpful message
   - OR automatically search within that single file instead of treating it as a directory
3. Add logging/debug output when results are unexpectedly empty

---

## 📅 Timeline

- **2026-06-24**: Bug discovered during auto-tracking analysis
- **2026-06-24**: Workaround module created (`src/utils/fileSearch.ts`) with three functions: `grepFile()`, `grepDir()`, `grepSearch()`
- **2026-06-24**: Comprehensive test suite written (25 tests, all passing) — fixed critical test isolation bug where shared fixture overwrites caused false negatives
- **2026-06-24**: Documentation written (this file) and added to TOOLS_REFERENCE.md as v1.5.16 entries
- **2026-06-24**: ESLint compliance fixes applied (`console.log` → `console.warn`, removed unused catch parameter)

---

## 🔗 Related Files

- **Workaround implementation:** `src/utils/fileSearch.ts`
- **Bug discovery context:** Session memory entries from 2026-06-24 auto-tracking analysis
- **Backup created:** `.ai_toolbox_backups/backup-2026-06-24-grep-fix-and-auto-track.zip`

---

## ❓ FAQ

**Q: Why not just fix `grep_files` directly?**  
A: The tool is part of the system-level infrastructure, not user-written code in this project. We can only create workarounds at the application level.

**Q: Will this workaround break if `grep_files` gets fixed later?**  
A: No — they're completely independent implementations. Both can coexist safely.

**Q: Can I use `fileSearch.ts` for production code in my plugin?**  
A: Yes, but note it uses Node.js built-in modules (`fs/promises`, `path`). This works fine since the LM Studio SDK runs on Node.js, but keep this constraint in mind if porting to other environments.

**Q: Should I file a bug report with the system maintainers?**  
A: Yes! If you're a plugin developer experiencing this issue, consider reporting it so the infrastructure team can fix `grep_files` at the source for everyone.

---

*Document created: 2026-06-24*  
*Maintained by: AI Toolbox Plugin Team*
