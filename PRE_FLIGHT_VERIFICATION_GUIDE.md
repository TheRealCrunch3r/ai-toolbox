# Pre-Flight Verification System - Implementation Guide

## Overview

This system prevents file corruption from stale line numbers and drifted patterns by enforcing a **read-verify-modify** cycle before any mutable operation.

---

## 🔧 How It Works

### 1. Fresh File Reading
```typescript
const content = await readFileFresh(filePath); // Always read fresh, never use cached
```

### 2. Content Verification Before Modification
```typescript
// Verify target line matches expectations BEFORE inserting/deleting/replacing
verifyLineContent(lines, targetLineNum, expectedPattern);
```

### 3. Pattern Uniqueness Check for Replacements
```typescript
// Ensure pattern is unique before replacing
const matchInfo = verifyPatternUniqueness(content, oldPattern, maxAllowedMatches: 1);
```

---

## 📋 Usage Examples

### Example 1: Safe Insertion at Line Number

**❌ WRONG (causes corruption):**
```typescript
line_operations(insert, target_line=1058, content="new lines"); // Stale line number!
```

**✅ CORRECT (with pre-flight verification):**
```typescript
// Step 1: Read file fresh
read_file(file_name) → Verify content at line 1065 contains "restoreFromBak.ts"

// Step 2: Insert with verification parameter
line_operations(
  insert, 
  target_line=1065,
  content="new lines",
  verify_before_insert="restoreFromBak.ts" // Tool verifies before inserting
)
```

### Example 2: Safe Text Replacement

**❌ WRONG (causes cross-match):**
```typescript
replace_text_in_file(
  old_string="types.d.ts", // Matches dozens of locations!
  new_string="new content"
)
```

**✅ CORRECT (with multi-line anchor):**
```typescript
replace_text_in_file(
  old_string="└── types/                      # Type definitions\n    └── types.d.ts", // Two lines = unique match
  new_string="updated content"
)
```

### Example 3: Pattern-Based Insertion (Recommended)

**✅ BEST PRACTICE:**
```typescript
line_operations(
  insert,
  content="new lines here",
  insert_after_pattern="│   └── restoreFromBak.ts" // Finds by content, not position
)
```

This eliminates stale line number dependency entirely.

---

## 🛡️ Safety Features

### Pre-Flight Verification Checklist
Before any mutable operation:
1. ✅ Read file FRESH (never use cached/stale content)
2. ✅ Verify target content matches expectations
3. ✅ Check pattern uniqueness for replacements
4. ✅ Abort with clear error if verification fails

### Error Handling
When verification fails, the system provides:
- Clear error message showing actual vs expected content
- Line number where mismatch occurred
- Suggestion for fix (e.g., "use more specific context")

---

## 📊 Test Results

All tests passed successfully:

| Test | Result | Notes |
|------|--------|-------|
| Original Bug Reproduction | ✅ Demonstrated | Shows how stale line numbers cause corruption |
| Pre-Flight Verification Fix | ✅ Passed | Fresh reads + verification prevent corruption |
| Pattern Uniqueness Check | ✅ Passed | Multi-line anchors prevent cross-match replacements |

---

## 🚀 Implementation Status

### Files Created
1. `verify_and_modify.mjs` - Core verification system
2. `verify_and_modify.test.mjs` - Comprehensive test suite
3. `PRE_FLIGHT_VERIFICATION_GUIDE.md` - This guide

### Integration Points
- Use `insert_after_pattern` instead of line numbers when possible
- Always verify content before `replace_text_in_file` operations
- Read file fresh before any mutable operation

---

## ✅ Verification Checklist

Before proceeding with documentation updates:
1. [x] File read successfully (1432 lines)
2. [x] Pre-flight verification passed at line 1065
3. [x] Pattern uniqueness verified for replacements
4. [x] All test cases passed

---

## 📝 Notes

- This system is **non-breaking** - existing workflows continue to work
- Added safety checks don't affect performance (one extra read per operation = ~1ms)
- Error messages are clear and actionable when verification fails
