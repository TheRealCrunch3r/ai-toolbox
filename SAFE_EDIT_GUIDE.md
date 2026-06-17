# 🛡️ Safe Edit Workflow Guide

## Overview

This guide outlines the **backup-first editing strategy** to prevent file corruption during LLM-assisted development sessions. All edits should follow this workflow to ensure data integrity and enable quick recovery if something goes wrong.

---

## 🚀 Quick Start (Recommended for Most Sessions)

### 1. Backup Before Editing
```bash
node scripts/safe_edit.js backup src/index.ts
# Or multiple files:
node scripts/safe_edit.js backup src/index.ts src/autoTracker.ts
```

### 2. Make Your Edits
- Use `replace_text_in_file` for small, precise changes
- Use `save_file` for large rewrites or when replacements fail repeatedly
- Always verify exact text matches before replacement (use `read_file_chunked` for large files)

### 3. Verify After Editing
```bash
node scripts/safe_edit.js verify src/index.ts
```

### 4. Remove Backups (When Satisfied)
```bash
node scripts/safe_edit.js cleanup --keep=0
# Or keep last 3 backups:
node scripts/safe_edit.js cleanup --keep=3
```

---

## 📋 Decision Tree: Which Tool to Use?

### When Editing Files, Choose the Right Tool:

```text
Is file > 50KB?
├─ YES → Use read_file_chunked() first
│         ├─ Check size and structure
│         └─ Identify exact text blocks to replace
└─ NO → Use read_file() for full content

Can you identify EXACT unique text to replace?
├─ YES (small change, < 20 lines) → Use replace_text_in_file()
│         ├─ Verify old_string is unique in file
│         └─ Check whitespace/comments match exactly
└─ NO OR Replacement fails > 2 times → Use save_file() with complete corrected content

Is the edit a large rewrite (> 50% of file)?
├─ YES → Use save_file() (faster and safer than multiple replacements)
└─ NO → Continue with replace_text_in_file() strategy
```

---

## 🔧 Detailed Workflow Steps

### Step 1: Pre-Edit Verification

**Always read the file before editing:**
```javascript
// For files < 50KB:
read_file(file_name="src/index.ts")

// For files >= 50KB:
read_file_chunked(file_name="src/largeFile.ts", chunk_size=10000)
```

**What to look for:**
- Exact text matches (including whitespace, comments, indentation)
- File structure and boundaries
- Any existing backup files in `.ai_toolbox_backups/`

### Step 2: Create Backup

```bash
# Single file:
node scripts/safe_edit.js backup src/index.ts

# Multiple files:
node scripts/safe_edit.js backup src/index.ts src/autoTracker.ts src/promptPreprocessor.ts

# Or use the automated workflow command:
node scripts/safe_edit.js workflow src/index.ts
```

**Backup location:** `.ai_toolbox_backups/` with timestamped filenames (e.g., `src.index.ts.backup-20260617-195400.bak`)

### Step 3: Make Edits

#### Option A: Small Changes (`replace_text_in_file`)
```javascript
// BEFORE editing, verify exact text exists:
read_file(file_name="src/index.ts", max_length=5000)

// Then replace with EXACT match (including whitespace):
replace_text_in_file(
    file_name="src/index.ts",
    old_string="const x = 10;",      // Must be unique in file!
    new_string="const x = 20;"       // Your replacement text
)
```

**⚠️ Critical Rules:**
- `old_string` MUST be unique in the file (no duplicates)
- Match whitespace, comments, and indentation exactly
- If replacement fails silently, STOP and use `save_file()` instead

#### Option B: Large Rewrites (`save_file`)
```javascript
// When > 50% of file is changing or replacements fail repeatedly:
save_file(
    file_name="src/index.ts",
    content="<complete corrected file content>"
)
```

### Step 4: Post-Edit Verification

```bash
# Verify file integrity:
node scripts/safe_edit.js verify src/index.ts

# Or manually check with read_file_chunked for large files:
read_file_chunked(
    file_name="src/largeFile.ts",
    chunk_size=10000,
    max_chunks=20
)
```

**What the verification checks:**
- File size (warns if > 10MB)
- Basic syntax errors (unbalanced braces/parentheses for TS/JS files)
- Valid JSON structure (for `.json` files)
- Empty file detection
- Binary/null character detection in text files

### Step 5: Cleanup Backups (When Satisfied)

```bash
# Remove ALL backups:
node scripts/safe_edit.js cleanup --keep=0

# Keep last 3 backups:
node scripts/safe_edit.js cleanup --keep=3

# List all existing backups:
node scripts/safe_edit.js list-backups
```

---

## 🚨 Emergency Recovery Procedures

### If File Gets Corrupted During Editing:

1. **STOP making edits immediately**
2. **Check for existing backup:**
   ```bash
   ls .ai_toolbox_backups/
   # or on Windows:
   dir .ai_toolbox_backups\*.bak
   ```
3. **Restore from most recent backup:**
   ```bash
   node scripts/safe_edit.js restore .ai_toolbox_backups/src.index.ts.backup-20260617-195400.bak
   ```
4. **Verify restored file:**
   ```bash
   node scripts/safe_edit.js verify src/index.ts
   ```

### If No Backup Exists:

1. **Check git history:**
   ```bash
   git diff HEAD -- src/index.ts  # See what changed
   git checkout HEAD -- src/index.ts  # Restore from last commit
   ```
2. **If no git backup, use `read_file_chunked` to recover partial content** and manually reconstruct

---

## 📊 Tool Selection Matrix

| Scenario | Recommended Tool | Why? |
|----------|-----------------|------|
| Small change (< 10 lines) | `replace_text_in_file()` | Precise, minimal impact |
| Medium change (10-50% of file) | `replace_text_in_file()` or `save_file()` | Depends on replacement complexity |
| Large rewrite (> 50% of file) | `save_file()` | Faster and less error-prone than multiple replacements |
| File > 50KB | `read_file_chunked()` first | Avoids truncation issues |
| Unknown exact text to replace | `save_file()` with full content | Safer than guessing partial matches |
| Replacement fails > 2 times | Switch to `save_file()` | Indicates approach mismatch |

---

## ⚠️ Common Pitfalls & How to Avoid Them

### ❌ Problem: `replace_text_in_file` doesn't find exact match
**Cause:** Whitespace, comments, or indentation differences  
**Solution:** Use `read_file_chunked` to verify exact content first. If replacement fails, fall back to `save_file()` with complete corrected file.

### ❌ Problem: File becomes empty after edit
**Cause:** Incorrect string matching in `replace_text_in_file` replaced more than intended  
**Solution:** Always backup first! Restore from `.ai_toolbox_backups/` if this happens.

### ❌ Problem: Unbalanced braces/parentheses
**Cause:** Partial replacement or copy-paste errors  
**Solution:** Run `node scripts/safe_edit.js verify <file>` after edits to catch syntax issues early.

### ❌ Problem: LLM loses context during multi-step edits
**Cause:** Too many consecutive operations without verification  
**Solution:** After each major edit, pause and verify with `read_file_chunked` before proceeding.

---

## 🔍 Advanced Usage

### Using read_file_chunked for Large Files

```javascript
// For files > 50KB:
read_file_chunked(
    file_name="src/largeFile.ts",
    chunk_size=10000,      // Characters per chunk (default: 10000)
    max_chunks=20          // Maximum chunks to return (default: 20)
)

// Returns structured output with:
{
    index: 0,
    startChar: 0,
    endChar: 10000,
    truncated: false,     // true if more content exists beyond max_chunks
    content: "chunk content..."
}
```

### Custom Backup Directory

```javascript
// Create backup in custom location:
createBackup("src/index.ts", backupDir="custom_backups")
```

### Automated Pre-Commit Checks (Optional)

Add to your `package.json`:
```json
{
  "scripts": {
    "pre-commit-check": "node scripts/safe_edit.js verify src/**/*.ts"
  }
}
```

---

## 📝 Checklist for Safe Editing Sessions

Before starting any multi-step edit session, confirm:

- [ ] **Backup created** (`node scripts/safe_edit.js backup <files>`)
- [ ] **File read and verified** (using `read_file` or `read_file_chunked`)
- [ ] **Exact text matches identified** for all replacements
- [ ] **Fallback plan ready** (if replacements fail, switch to `save_file()`)
- [ ] **Post-edit verification scheduled** (`node scripts/safe_edit.js verify <files>`)
- [ ] **Cleanup plan defined** (when to remove backups)

---

## 📚 References

- **Backup Script:** `scripts/safe_edit.js`
- **Documentation:** This guide (`SAFE_EDIT_GUIDE.md`)
- **Tool Documentation:** `DOCUMENTATION.md`, `README.md`
- **Architecture Guide:** `ARCHITECTURE.md`

---

*Last Updated: 2026-06-17 | Version: 1.5.9*
