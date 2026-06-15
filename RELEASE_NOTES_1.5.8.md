# Release Notes — v1.5.8 (2026-06-15)

## 📋 Executive Summary

Version 1.5.8 addresses **three critical bugs** discovered and fixed during this session:

| # | Bug | Severity | Impact | Status |
|---|-----|----------|--------|--------|
| 1 | `text_transform` combined `'gi'` flags → Invalid RegExp error | 🔴 Critical | Tool completely unusable with case-insensitive global search | ✅ Fixed |
| 2 | Web content fetch OOM crash (4GB+ heap) on large pages | 🟠 High | Plugin crashes LM Studio entirely, context overflow cascades | ✅ Fixed |
| 3 | Line-range section hardcoded `'g'` flag ignoring user input | 🟡 Medium | Case-insensitive replacements fail in line range mode | ✅ Fixed |

---

## 🔧 Bug Fix #1: text_transform Combined Flags Crash

### Problem
The `text_transform` tool threw an error when using combined flags `'gi'`:
```
Invalid flags supplied to RegExp constructor 'igi'
```

### Root Cause Analysis
Line 92 in `src/tools/textProcessingTools.ts` had a broken conditional flag concatenation:

```typescript
// ❌ OLD (buggy) — produces 'igi' when input is 'gi':
const regex = new RegExp(pattern, 
  flagString.includes('i') ? `${flagString.replace('g', '')}gi` : flagString);
```

**Execution trace with `'gi'`:**
1. `flagString.includes('i')` → `true` (enters the if branch)
2. `flagString.replace('g', '')` → removes 'g' from 'gi' → leaves `'i'`
3. Appends `'gi'` → result: **`'igi'`** — invalid RegExp flag combination

### Fix Applied
Since Zod already validates `flags` to only accept `'g' | 'i' | 'gi'`, the conditional manipulation was unnecessary and buggy. Pass through directly:

```typescript
// ✅ NEW (fixed) — flags are validated by Zod, no conditional needed:
const regex = new RegExp(pattern, flagString);
```

### Files Modified
| File | Line(s) | Change |
|------|---------|--------|
| `src/tools/textProcessingTools.ts` | 92 | Replaced broken conditional with direct `flagString` pass-through |
| `CHANGELOG.md` | Top | Added v1.5.8 release notes |
| `README.md` | Recent Updates section | Added v1.5.8 entry |
| `DOCUMENTATION.md` | Top of file | Added Latest Update section |
| `package.json` | — | Version bumped 1.5.7 → 1.5.8 |

### Verification
- ✅ Manual test: Combined `'gi'` flags correctly match "UPPERCASE" and "Mixed Case" (2 replacements applied)
- ✅ All 265 tests pass
- ✅ Build clean (ESM + CJS ~344 KB, DTS 1.38s)

---

## 🐛 Bug Fix #2: Web Content Fetch OOM Crash Prevention

### Problem
When fetching large web pages (e.g., Red Hat blog at `https://www.redhat.com/en/blog/linux-tool-replacements`), the plugin crashed with:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
4058 MB → 4098 MB before crash
```

This caused a cascading failure:
1. Plugin OOM crash → error response sent to LLM
2. Massive error payload + existing ~83k-token prompt cache (~7.3 GB)
3. Total context reached **222,770 tokens** when model only supports **153,344**
4. LLM rejected request: `request exceeds the available context size`

### Root Cause Analysis
Both `fetch_web_content` and `rag_web_content` in `src/tools/webResearchTools.ts`:
- Fetched entire HTML pages with no size limit
- Passed raw HTML through `htmlToText()` which converted ALL content (including nav menus, product listings, sidebars) to plain text
- Red Hat blog page was ~500KB+ of HTML → massive text output → Node.js heap exceeded 4GB

### Fix Applied
Added a **hard 50KB cap** on raw HTML content BEFORE `htmlToText()` processes it:

```typescript
const MAX_HTML_SIZE = 50_000;
if (html.length > MAX_HTML_SIZE) {
  return { 
    success: false, 
    error: `Page too large (${(html.length / 1024).toFixed(1)} KB). Max allowed is ${MAX_HTML_SIZE / 1024} KB. Use searxng_search + summary_only for large pages.` 
  };
}
```

### Files Modified
| File | Line(s) | Change |
|------|---------|--------|
| `src/tools/webResearchTools.ts` | fetch_web_content implementation | Added 50KB HTML size cap before htmlToText() |
| `src/tools/webResearchTools.ts` | rag_web_content implementation | Added same 50KB HTML size cap |

### Behavior Change
| Scenario | Before (Broken) | After (Fixed) |
|----------|-----------------|---------------|
| Small/medium pages (<50KB) | Works normally ✅ | Works normally ✅ |
| Large pages (>50KB, e.g., Red Hat blog) | Plugin crashes OOM 💥 | Returns clean error message with guidance ✅ |

### Verification
- ✅ Manual test: Attempted fetch of large page → returns graceful error instead of crashing
- ✅ Error message guides users to `searxng_search + summary_only` as alternative
- ✅ All 265 tests pass (no regression)

---

## 🔧 Bug Fix #3: Line-Range Section Flag Hardcoding

### Problem
When using `text_transform` with a line range (`lines.start`, `lines.end`) and combined flags like `'gi'`:
- The replacement mode used user-specified flags ✅
- **But** the deletion mode (when no replacement provided) hardcoded `'g'` flag ❌

This caused case-sensitive matching in delete operations, ignoring user intent.

### Root Cause Analysis
The line-range section had two separate regex constructions:

```typescript
// Replacement mode — correctly used `regex` with user flags ✅
linesArray[i] = linesArray[i].replace(regex, replacement);

// Deletion mode — hardcoded 'g' flag ❌
const matches = linesArray[i].match(new RegExp(pattern, 'g'));
```

### Fix Applied
Both modes now use the same regex (with correct flags):

```typescript
// Replacement mode:
linesArray[i] = linesArray[i].replace(regex, replacement);  // regex has flagString ✅

// Deletion mode — FIXED to use same flags:
const matches = linesArray[i].match(new RegExp(pattern, flagString));  // Uses user's flags ✅
```

### Files Modified
| File | Line(s) | Change |
|------|---------|--------|
| `src/tools/textProcessingTools.ts` | ~140-150 (line range section) | Replaced hardcoded `'g'` with `flagString` in deletion mode regex |

---

## 📊 Testing & Verification Summary

### Test Results
```
Test Suites: 19 passed, 19 total
Tests:       265 passed, 265 total
```

### Build Verification
| Command | Result | Details |
|---------|--------|---------|
| `npm run build` | ✅ Success | ESM + CJS ~344 KB, DTS 1.38s |
| `npm run typecheck` | ✅ Clean | Zero errors (was: 0) |
| `npm test` | ✅ All pass | 265/265 tests, 19 suites |
| `npm run lint` | ⚠️ No new issues | 0 errors, 104 warnings (all pre-existing `any` types from third-party libs) |

### Manual Verification Steps Performed
1. ✅ `text_transform` with `'gi'` flags on test file — 2 replacements applied correctly
2. ✅ `npm run build && npm run typecheck` — clean compilation
3. ✅ Full test suite — no regressions
4. ✅ Web fetch size cap — large pages return graceful error instead of OOM crash

---

## 📁 Complete File Change List (v1.5.8)

| File | Type | Description |
|------|------|-------------|
| `src/tools/textProcessingTools.ts` | Bug Fix | Fixed combined flags regex construction + line-range flag hardcoding |
| `src/tools/webResearchTools.ts` | Bug Fix | Added 50KB HTML size cap to prevent OOM crashes in fetch_web_content & rag_web_content |
| `CHANGELOG.md` | Documentation | Added v1.5.8 release notes with full details |
| `README.md` | Documentation | Updated "Recent Updates" section with v1.5.8 entry |
| `DOCUMENTATION.md` | Documentation | Added Latest Update section documenting all fixes |
| `package.json` | Version Bump | 1.5.7 → 1.5.8 |

---

## 🚀 Release Checklist

- [x] All bugs fixed and tested
- [x] CHANGELOG.md updated with v1.5.8 entry
- [x] README.md Recent Updates section updated
- [x] DOCUMENTATION.md Latest Update section added
- [x] package.json version bumped to 1.5.7
- [x] `npm run build` — success
- [x] `npm run typecheck` — zero errors
- [x] `npm test` — 265/265 passed
- [x] `npm run lint` — no new warnings (104 pre-existing, all third-party)
- [ ] Git commit with proper message
- [ ] Tag as v1.5.8 on GitHub
- [ ] Publish release on GitHub

---

## 📝 Commit Message Template

```
fix: text_transform combined flags + web content OOM prevention (v1.5.8)

Bug Fixes:
- Fixed Invalid RegExp constructor error when using combined 'gi' flags in text_transform
  Root cause: broken conditional concatenated flags incorrectly ('g'+'i' → 'igi')
  Fix: pass Zod-validated flags directly without manipulation (textProcessingTools.ts line 92)
- Added 50KB hard cap on web page fetches to prevent OOM crashes
  Affected tools: fetch_web_content, rag_web_content (webResearchTools.ts)
  Large pages now return graceful error instead of crashing plugin
- Fixed text_transform line-range section to use user-specified flags instead of hardcoded 'g'

Documentation:
- Updated CHANGELOG.md with v1.5.8 release notes
- Updated README.md Recent Updates section
- Updated DOCUMENTATION.md Latest Update section
- Created RELEASE_NOTES_1.5.8.md (this file)

Testing:
- All 265 tests pass, zero regressions
- Build clean: ESM + CJS ~344 KB, DTS 1.38s
- Manual verification of combined 'gi' flags working correctly
```

---

## 🔍 Additional Context

### Why the OOM Crash Was Misleading
The error log showed both `Plugin(crunch3r/ai-toolbox)` AND LLM context overflow messages, making it unclear which was the root cause:

1. **Primary failure**: Plugin tried to fetch massive Red Hat blog page → htmlToText() converted 500KB+ HTML → Node.js heap hit 4GB limit
2. **Secondary effect**: OOM crash sent error response to LLM → context window exceeded (222k tokens vs 153k max)

The searxng-search plugin worked perfectly throughout — it was the ai_toolbox's `fetch_web_content` tool that caused the crash.

### Why We Don't Increase Node.js Heap Limit
Increasing `--max-old-space-size` would only delay the problem, not fix it:
- 500KB HTML → could grow to 1MB+ with textToHtml processing
- Eventually crashes again on even larger pages
- Better to enforce a reasonable cap and guide users to appropriate tools (searxng_search + summary_only)

---

*Document generated: 2026-06-15 21:24 UTC*  
*Version: 1.5.8*  
*Author: AI Toolbox Development Team*
