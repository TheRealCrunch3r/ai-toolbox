# Safe Edit Guide

Prevent file corruption during LLM-assisted editing with our backup-first strategy. This guide covers the complete workflow for safely modifying files using AI Toolbox tools.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Why Backup First?](#why-backup-first)
- [Quick Start](#quick-start)
- [Complete Workflow](#complete-workflow)
- [Emergency Recovery](#emergency-recovery)
- [Best Practices](#best-practices)

---

## Overview

The Safe Edit Guide provides a systematic approach to modifying files when working with AI assistants. By creating backups before making changes and verifying after editing, you can prevent data loss and recover from mistakes quickly.

### Key Principles

1. **Backup first** — Always create a backup before editing
2. **Verify after** — Check that edits applied correctly
3. **Clean up later** — Remove backups when satisfied with results

---

## Why Backup First?

LLM-assisted file editing can introduce unexpected changes:
- Syntax errors from incomplete code generation
- Accidental deletions or overwrites
- Encoding issues with special characters
- Inconsistent formatting across files

Backups provide a safety net that allows you to recover quickly if something goes wrong.

---

## Quick Start

### Step 1: Backup Before Editing

```bash
# Create backup of file before editing
node scripts/safe_edit.js backup src/index.ts
```

This creates `src/index.ts.bak` with the original content.

### Step 2: Make Your Edits

Use AI Toolbox tools to modify files as needed:
- `save_file` for complete file replacement
- `replace_text_in_file` for targeted string replacements
- `insert_at_line` for adding lines at specific positions
- `delete_lines_in_file` for removing line ranges

### Step 3: Verify After Editing

```bash
# Check that edits applied correctly
node scripts/safe_edit.js verify src/index.ts
```

This compares your edited file against the backup and reports differences.

### Step 4: Clean Up When Satisfied

```bash
# Remove backups when you're happy with results
node scripts/safe_edit.js cleanup --keep=0
```

---

## Complete Workflow

### Phase 1: Preparation (Before Editing)

#### 1. Identify Files to Edit

List all files that will be modified during the session:

```bash
# View current directory structure
list_directory(path=".")
```

#### 2. Create Backup of Each File

For each file you plan to edit, create a backup:

```bash
node scripts/safe_edit.js backup src/file1.ts
node scripts/safe_edit.js backup src/file2.ts
node scripts/safe_edit.js backup config.json
```

Each backup is stored as `{filename}.bak` in the same directory.

#### 3. Verify Backups Were Created

```bash
# Check that backups exist
ls -la *.bak
# or use file metadata tool
get_file_metadata(path="src/file1.ts.bak")
```

### Phase 2: Editing (While Working)

#### Use AI Toolbox Tools for File Modifications

**Option A: Replace entire file content**

```
Tool: save_file
Params: { 
  "file_name": "src/index.ts", 
  "content": "<new content here>" 
}
```

**Option B: Replace specific text**

```
Tool: replace_text_in_file
Params: {
  "file_name": "src/file1.ts",
  "old_string": "old function body",
  "new_string": "new function body"
}
```

**Option C: Insert lines at specific position**

```
Tool: insert_at_line
Params: {
  "file_name": "src/file2.ts",
  "line_number": 10,
  "content_to_insert": "// New comment line"
}
```

#### Monitor for Errors During Editing

Watch for these common issues during editing:
- Syntax errors in generated code
- Missing closing brackets or quotes
- Incorrect indentation
- Broken imports or references

### Phase 3: Verification (After Editing)

#### Run Verification Checks

For each file you edited, verify the changes:

```bash
# Verify single file
node scripts/safe_edit.js verify src/index.ts

# Check for syntax errors (if TypeScript project)
npx tsc --noEmit

# Run linting
npm run lint

# Run tests
npm test
```

#### Manual Verification Steps

1. **Open the edited file** in your editor
2. **Check syntax highlighting** — red underlines indicate problems
3. **Review the diff** between original and edited versions:
   ```bash
   # Compare with backup
   file_diff(file_a="src/index.ts.bak", file_b="src/index.ts")
   ```

### Phase 4: Cleanup (After Verification)

#### Remove Backups When Satisfied

```bash
# Remove all backups in current directory
node scripts/safe_edit.js cleanup --keep=0

# Keep last N backup files (useful for rolling back to earlier versions)
node scripts/safe_edit.js cleanup --keep=2
```

---

## Emergency Recovery

### If Something Goes Wrong After Editing

#### Option 1: Restore from Backup Immediately

If you notice problems right after editing, restore the backup before doing anything else:

```bash
# Copy backup back to original location
node scripts/safe_edit.js restore src/index.ts
```

This replaces `src/index.ts` with the content from `src/index.ts.bak`.

#### Option 2: Use Git as Backup (If Available)

If you're using version control, revert changes through Git:

```bash
# View what changed
git diff src/index.ts

# Revert to last commit
git checkout HEAD -- src/index.ts
```

#### Option 3: Manual Recovery Steps

If automated tools aren't available, manually restore from backup:

1. **Locate the backup file** (e.g., `src/index.ts.bak`)
2. **Read the backup content**:
   ```
   Tool: read_file
   Params: { "file_name": "src/index.ts.bak" }
   ```
3. **Replace current file with backup content**:
   ```
   Tool: save_file
   Params: { 
     "file_name": "src/index.ts", 
     "content": "<paste backup content here>" 
   }
   ```

---

## Best Practices

### 1. Edit One File at a Time

Always complete and verify changes to one file before moving to the next:

```bash
# ✅ Good approach
backup src/file1.ts → edit → verify → cleanup
backup src/file2.ts → edit → verify → cleanup

# ❌ Bad approach (harder to isolate issues)
backup src/file1.ts, backup src/file2.ts
edit both files
verify both files together
```

### 2. Use Small, Targeted Changes

Break large edits into smaller, manageable changes:

```bash
# ✅ Good — small, focused replacements
replace_text_in_file(old_string="old function", new_string="new function")
replace_text_in_file(old_string="variable = X", new_string="variable = Y")

# ❌ Bad — large, risky overwrites
save_file(content="<entire file replaced>")
```

### 3. Verify Before Moving On

Always verify each file before proceeding to the next:

```bash
verify src/file1.ts    # ✅ Check this is correct
edit src/file2.ts      # ✅ Then move on
verify src/file2.ts    # ✅ Check this too
```

### 4. Keep Backups Until Session Ends

Don't delete backups until you're certain the session is complete and stable:

```bash
# At end of session, after all verification
node scripts/safe_edit.js cleanup --keep=0
```

---

## 📋 Checklist for Safe Editing

Before starting any editing session, follow this checklist:

- [ ] Identified all files that will be modified
- [ ] Created backups for each file (`*.bak` files)
- [ ] Verified backups exist and are readable
- [ ] Planned edits in small, incremental steps
- [ ] Set up verification checks (linting, testing)
- [ ] After editing: verified each file against backup
- [ ] Fixed any issues found during verification
- [ ] Removed backups only after final confirmation

---

## 🆘 Troubleshooting

### Problem: Backup File Not Found

**Symptom**: `node scripts/safe_edit.js verify src/file.ts` reports "Backup not found"

**Solution**: The backup file doesn't exist. Create it first:
```bash
node scripts/safe_edit.js backup src/file.ts
```

### Problem: Verification Shows Unexpected Differences

**Symptom**: File diff shows changes you didn't intend

**Solution**: 
1. Review the diff carefully to understand what changed
2. If incorrect, restore from backup immediately:
   ```bash
   node scripts/safe_edit.js restore src/file.ts
   ```
3. Try smaller, more targeted edits next time

### Problem: Multiple Backups Accumulating

**Symptom**: Too many `.bak` files cluttering directories

**Solution**: Clean up old backups:
```bash
node scripts/safe_edit.js cleanup --keep=0  # Remove all
# or
node scripts/safe_edit.js cleanup --keep=2  # Keep last 2 versions
```

---

## 📚 Related Tools

The Safe Edit Guide complements these AI Toolbox tools:

| Tool | Purpose | Reference |
|------|---------|-----------|
| `save_file` | Write file content with atomic operations | [TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md) |
| `replace_text_in_file` | Replace specific strings in files | [TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md) |
| `insert_at_line` | Insert content at specific line numbers | [TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md) |
| `delete_lines_in_file` | Remove line ranges from files | [TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md) |
| `file_diff` | Compare two files side by side | [TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md) |

---

## 📝 Notes

- This guide assumes you're using AI Toolbox tools for file modifications.
- Always test your edits in a non-production environment first when possible.
- Keep backups until you're confident the changes are correct and complete.
- For large projects, consider using Git for additional version control safety.

---

## 🆘 Getting Help

If you encounter issues with the Safe Edit workflow:
1. Check this guide's troubleshooting section
2. Review the backup files to understand what changed
3. Restore from backup if needed
4. Try smaller, more targeted edits next time
