# Change Summary: v1.6.0 → v1.6.1

**Release Date:** 2026-07-14  
**Version Bump:** 1.6.0 → 1.6.1 (patch release)  
**Type:** Security & Bug Fix  

---

## 🚨 Critical Fixes

### 1. GOD MODE Execution Tool Bypass (Security)
**Problem:** When GOD MODE was enabled, the execution tools block would execute, but individual tool gates (`executionJavaScript`, `executionPython`, etc.) still required their individual toggles to be ON. This meant GOD MODE could NOT actually enable disabled execution tools — a security bypass vulnerability.

**Solution:** Added `|| isGodMode` fallback to all 5 execution tool gates:
```typescript
// Before (broken):
if (pluginConfig.get('executionShell')) { ... }

// After (fixed):
if (pluginConfig.get('executionShell') || isGodMode) { ... }
```

**Impact:** GOD MODE now correctly enables ALL tools, including execution tools that were individually disabled.

### 2. TypeScript Compilation Error
**Problem:** `isExecutionToolEnabled()` expected a raw `PluginConfig` object but received `ParsedConfig<...>` from the LM Studio SDK's `ctl.getPluginConfig()`. This caused TS2345 compilation errors.

**Solution:** Replaced all `isExecutionToolEnabled(pluginConfig, 'key')` calls with direct property access via `.get()`:
```typescript
// Before:
if (isExecutionToolEnabled(pluginConfig, 'javascript')) { ... }

// After:
if (pluginConfig.get('executionJavaScript')) { ... }
```

**Impact:** Clean TypeScript compilation restored. Removed unused `isExecutionToolEnabled` import from `toolsProvider.ts`.

---

## 📋 Files Changed

| File | Changes | Lines Modified |
|------|---------|----------------|
| `src/toolsProvider.ts` | Fixed execution tool gating, removed unused import | ~10 lines |
| `package.json` | Version bump 1.6.0 → 1.6.1 | 1 line |
| `manifest.json` | Version bump 1.6.0 → 1.6.1 | 1 line |
| `CHANGELOG.md` | Added v1.6.1 entry with full details | ~25 lines added |

---

## 📚 Documentation Updated

The following markdown files were updated to reference v1.6.1:

- ✅ `ARCHITECTURE.md` (6 references)
- ✅ `CHANGELOG.md` (changelog header + new section)
- ✅ `DOCUMENTATION.md` (4 references)
- ✅ `README.md` (1 reference)
- ✅ `SUMMARY.md` (5 references)
- ✅ `TOOLS_REFERENCE.md` (3 references)

---

## 🧪 Verification Results

| Check | Status | Notes |
|-------|--------|-------|
| `npm run typecheck` | ✅ Pass | Zero compilation errors |
| `npm run build` | ✅ Success | ESM + CJS outputs generated |
| `npm run lint` | ⚠️ 35 warnings | All style-related (`@typescript-eslint/no-explicit-any`) — intentional SDK workaround |

---

## 📦 Build Outputs

```
dist/
├── index.js          (CJS) — 12.45 MB
├── index.mjs         (ESM) — 11.87 MB
├── index.d.ts        (TypeScript types)
└── *.map             (Source maps for debugging)
```

---

## 🔍 Technical Deep Dive

### Root Cause Analysis

The LM Studio SDK's `ctl.getPluginConfig(configSchematics)` returns a `ParsedConfig<...>` wrapper object. This wrapper uses `.get(key)` method access to retrieve configuration values, but the type signature doesn't expose raw properties like `config.executionJavaScript` directly on its interface.

**Previous approach:** Used helper function `isExecutionToolEnabled()` which expected direct property access — causing TypeScript errors.

**Current approach:** Direct `.get()` calls match how all other tool categories (fileSystem, webSearch, etc.) are already gated in the codebase.

### GOD MODE Logic Flow

```
GOD MODE ON:
  → isGodMode = true
  
For each tool category:
  if (pluginConfig.get('category') || isGodMode) { ... }
  
Result: All tools enabled regardless of individual toggle state ✅

GOD MODE OFF:
  → isGodMode = false
  
For each execution tool:
  if (pluginConfig.get('executionJavaScript') || isGodMode) { ... }
  // Falls back to individual toggle only
  
Result: Only enabled tools available ✅
```

---

## ⚠️ Known Issues & Trade-offs

### ESLint Warnings (35 total)
All warnings are `@typescript-eslint/no-explicit-any` in `toolsProvider.ts` for the necessary `pluginConfig as any` casts. This is an intentional workaround because:

1. The SDK's `ParsedConfig<...>` wrapper doesn't expose raw config properties on its interface
2. All tool registration functions expect a flat `PluginConfig` object with direct property access
3. Changing this would require refactoring every single tool registration function signature

**Impact:** Zero runtime impact — the casts are only for TypeScript's static analysis. At runtime, the object has all expected properties.

---

## 🔄 Migration Notes

No breaking changes for users. This is a patch release that:
- Fixes GOD MODE behavior (now works correctly)
- Fixes compilation errors
- Does NOT change any tool APIs or configuration schemas

Users upgrading from 1.6.0 should:
1. Replace `dist/` folder with new build outputs
2. Restart LM Studio to load the updated plugin
3. Test GOD MODE functionality if previously affected

---

*Generated on 2026-07-14 for v1.6.1 release.*