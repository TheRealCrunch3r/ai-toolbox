# 📦 Version Bump Summary — v1.5.15

**Date**: 2026-06-24  
**Previous Version**: v1.5.14 (package.json) / v1.5.10 rev 9 (manifest.json)  
**New Version**: v1.5.15 (both files synced)  
**Revision**: 10

---

## ✅ Files Modified

### 1. package.json
- **Change**: `"version": "1.5.14"` → `"version": "1.5.15"`
- **Backup Created**: `package.json.bak`

### 2. manifest.json  
- **Changes**: 
  - `"version": "1.5.10"` → `"version": "1.5.15"`
  - `"revision": 9` → `"revision": 10`
- **Backup Created**: `manifest.json.bak`

### 3. CHANGELOG.md
- **Change**: Added comprehensive v1.5.15 entry documenting:
  - Auto-track token threshold bug fixes (#5, #6)
  - grep_files workaround utility creation
  - Root cause analysis and impact for each fix
- **Backup Created**: `CHANGELOG.md.bak`

### 4. AUTO_TRACK_FIXES.md
- **Change**: 
  - Updated header to v1.5.15 with comprehensive executive summary including all 6 bugs
  - Added new sections documenting Bug #5 (wrong maxTokens denominator) and Bug #6 (missing ?? fallback)
  - Maintained backward compatibility with existing bug documentation
- **Backup Created**: `AUTO_TRACK_FIXES.md.bak`

### 5. DOCUMENTATION.md
- **Change**: Updated all version references from v1.5.14 → v1.5.15 throughout the file (8 replacements)
- **Backup Created**: `DOCUMENTATION.md.bak`

---

## 📝 Documentation Updates Summary

| Document | What Was Added/Updated |
|----------|------------------------|
| `CHANGELOG.md` | Full v1.5.15 release notes with detailed bug descriptions, root causes, fixes, and impact statements |
| `AUTO_TRACK_FIXES.md` | New sections for Bug #5 (maxTokens denominator) and Bug #6 (missing ?? fallback), plus updated executive summary |
| `DOCUMENTATION.md` | All version references bumped to v1.5.15, status table entries updated |
| `docs/GREP_WORKAROUND.md` | Created (new file from earlier session) — comprehensive documentation of grep_files bug and workaround utility |

---

## 🔍 Key Changes in v1.5.15

### Auto-Track Token Threshold Fixes
1. **Bug #5** (HIGH): Fixed `maxTokens` denominator calculation to use `contextGuard.getTokenLimit()` instead of `getThreshold()` — ensures percentage calculations align with actual context window size
2. **Bug #6** (MEDIUM): Added missing `?? 75` fallback in Step 0.6 config update — prevents undefined values from breaking threshold calculations

### grep_files Workaround
- Created `src/utils/fileSearch.ts` utility module with three functions:
  - `grepFile()` — Search within a single file
  - `grepDir()` — Search across multiple files in a directory  
  - `grepSearch()` — Unified search that auto-detects target type
- Created comprehensive documentation at `docs/GREP_WORKAROUND.md`

---

## 📦 Backup Files Created

All original files were backed up before modification:
- `package.json.bak`
- `manifest.json.bak`  
- `CHANGELOG.md.bak`
- `AUTO_TRACK_FIXES.md.bak`
- `DOCUMENTATION.md.bak`

**Full project backup**: `.ai_toolbox_backups/backup-2026-06-24-v1.5.15-bump.zip` (6.7 MB, 127 files)

---

## ✅ Verification Checklist

- [x] package.json version bumped to 1.5.15
- [x] manifest.json version synced to 1.5.15, revision incremented to 10
- [x] CHANGELOG.md has comprehensive v1.5.15 entry documenting both fixes
- [x] AUTO_TRACK_FIXES.md updated with Bug #5 and #6 documentation
- [x] DOCUMENTATION.md version references all bumped to v1.5.15
- [x] All original files backed up before modification
- [x] Full project backup created (.ai_toolbox_backups/)

---

## 🎯 Next Steps

No further action required — all version bumps and documentation updates are complete and verified. The plugin is ready for v1.5.15 release.
