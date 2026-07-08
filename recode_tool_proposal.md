# Recode Tool Proposal

**Date:** 04.07.2026 (Updated: 06.07.2026)  
**Project:** ai_toolbox (LM Studio Plugin)  
**Base File:** `src/tools/refactorCodeTools.ts`  
**Status:** ✅ Recode Architecture Implemented — Modular Rule Engine Operational in v1.5.34

---

## 🧠 Concept Overview

The existing `refactor_code` tool covers 4 core operations:
- Rename identifiers (AST-based) ✅ Working
- Move functions between files ✅ Now supports Arrow Functions & Class Methods (v1.5.30)
- Extract function ✅ Fully rewritten to AST-based extraction, no more line-splitting bugs (v1.5.30)
- Unused import cleanup ✅ Implemented via Babel AST traversal (v1.5.31)

A **"Recode"** toolset expands this into a comprehensive, AST-driven refactoring engine that helps developers modernize, clean up, and harden their codebases safely.

---

## 📦 Proposed Features by Tier

### 🔹 Tier 1 — High Value, Low Risk (Build First)
| Feature | Why It Matters | Example | Status |
|---------|----------------|---------|--------|
| **Unused import cleanup** ✅ | Reduces bundle size, removes clutter | Removes `import { unused } from '...'` across files | ✅ Implemented v1.5.31 & Integrated |
| **Dead code detection** ✅ | Flags unreachable/never-called functions | Warns about exported functions never imported by anything else | ✅ Implemented v1.5.34 (analyzer rule) |
| **Module path normalization** ✅ | Fixes broken relative imports after moves | Converts `../../utils` → absolute/clean paths | ✅ Implemented v1.5.34 (heuristic normalization) |
| **Type inference / annotation fixes** ✅ | Catches `any` leaks and missing types | Replaces `: any` with inferred type or adds typed placeholders | ✅ Implemented v1.5.34 |

### 🔹 Tier 2 — High Value, Medium Complexity
| Feature | Why It Matters | Example | Status |
|---------|----------------|---------|--------|
| **Callback → async/await conversion** ✅ | Removes callback hell in legacy code | Converts `(err, data) => {...}` chains to `async/await` | ✅ Implemented v1.5.35 (analyzer rule) |
| **Class → functional component migration** (React) | Modernizes React codebases | Class components with lifecycle methods → hooks (`useState`, `useEffect`) | ⏳ Pending |
| **Security pattern hardening** | Auto-fixes common vulnerabilities | Replaces string concat in SQL with parameterized queries, sanitizes user input before `innerHTML` | ⏳ Pending |
| **Duplicate code extraction** | Reduces maintenance burden | Detects identical/mostly-identical function bodies and extracts a shared utility | ⏳ Pending |

### 🔹 Tier 3 — Strategic / Differentiating
| Feature | Why It Matters | Example | Status |
|---------|----------------|---------|--------|
| **Auto-test generation** | Massive time-saver for coverage gaps | Reads function signatures, infers edge cases, generates Jest/Vitest tests | ⏳ Pending |
| **JSDoc auto-generation** | Improves IDE autocomplete & docs | Generates typed documentation from function bodies and types | ⏳ Pending |
| **Architecture linting** | Enforces team conventions across the codebase | Flags direct DB calls in controllers (should be in services), detects circular dependencies beyond existing tool | ⏳ Pending |

---

## ✅ Completed in v1.5.30 (2026-07-05)

### 🔧 `refactor_code` AST Modernization
The following core improvements have been merged into the base engine:

1. **AST-based extract_function** — Replaced fragile line-based string splitting (`content.split('\n')`) with proper Babel AST traversal. Extracted statements are now parsed into valid Babel nodes before being wrapped in a new function body. No more crashes on partial statements or multiline constructs.

2. **Arrow Function & Class Method Support** — `move_function` now correctly extracts:
   - Arrow Functions (`const fn = async () => {}`)
   - Class Methods via `ClassBody` traversal handlers
   - Variable Declarations containing function expressions

3. **ESLint Hardening** — Removed redundant `eslint-disable-line` comments, consolidated global file-level disable blocks for Babel's dynamic typing. Zero ESLint warnings achieved.

4. **Parameter Schema Update** — Deprecated `extraction_lines` in the implementation logic, but kept it in the Zod schema for backward compatibility. The `old_name` parameter now carries the extracted code block string directly when performing AST-based extraction operations. Cleaner API for AI tool calls.

---

## ✅ Completed in v1.5.31 (2026-07-05)

### 🔧 Tier 1 Feature: `unused_import_cleanup`
The first Tier 1 feature from the proposal has been implemented and **fully integrated into the plugin runtime**:

1. **AST-based unused import detection** — Uses Babel AST to parse all imports, tracks which identifiers are actually referenced in the file body (excluding import declarations themselves).

2. **Smart specifier removal** — Handles mixed-import scenarios where some specifiers in a single import statement are used and others are not. Removes only the dead specifiers from the `ImportDeclaration`, preserving formatting and line structure.

3. **TypeScript-aware** — Respects TypeScript's `import type` declarations. Type-only imports that are unused are correctly identified and removed.

4. **Namespace import support** — Detects `import * as X` patterns and determines if the namespace binding is actually referenced in the file.

5. **Runtime Integration** — ✅ Wired into `toolsProvider.ts` via lazy-load map (`refactor: () => import('./tools/refactorCodeTools.js')`). Respects the `"🔧 AST Code Refactoring Tools"` UI toggle and God Mode. Fully operational in LM Studio.

> **Note on Test Coverage**: The claim "All 354 tests pass" refers to the overall project test suite (`tests/` directory). Dedicated unit tests specifically targeting `refactorCodeTools.ts` operations (rename, move, extract, unused_import_cleanup) do not yet exist as a standalone file. This is listed as a pending task below.

---

## 🎯 Recommendation: Start with Tier 1 + One Killer Feature

For maximum immediate utility, propose building:

### 1. `recodesign_imports`
- Analyze all imports across the project
- Detect unused/dead ones via static analysis
- Offer dry-run preview before removing
- Leverages existing Babel AST infrastructure ✅ (base engine ready)

### 2. `recodemodernize_async`
- Convert callback-style code to async/await using AST transformation
- Reuses Babel parser/generator already in place ✅
- Handles common patterns: Node.js callbacks, Promise `.then()` chains, RxJS subscriptions

### 3. `recodesecurity_harden`
- Pattern-based auto-fixes for common security anti-patterns
- Examples: hardcoded secrets, missing input validation, unsafe `eval()`, `innerHTML` without sanitization
- Differentiator: proactive rather than reactive

---

## ⚙️ Key Design Decisions

1. **Dry-run first**: Always show what *would* change before touching files ✅ (base engine supports `.bak`)
2. **AST-based, not regex**: Use Babel properly this time (parse → transform → generate) ✅ (core engine migrated)
3. **Configurable rules**: Users enable/disable specific transformation types via config (like ESLint rules) ✅ (now exposed as `refactorCode` toggle in UI)
4. **Chaining support**: Allow composing multiple recode operations in one call ⏳
5. **Backup & rollback**: Automatic `.bak` creation before any modification, with restore option ✅ (base engine supports this)

---

## 📂 Actual File Structure (as of v1.5.34)

```text
src/tools/
├── refactorCodeTools.ts          (existing — core AST engine, delegates to recodeEngine for unused_import_cleanup)
└── recodeTool/                   (new — modular rule engine as of v1.5.34)
    ├── rules/
    │   ├── unusedImports.ts      ← Tier 1: Implemented ✅
    │   └── deadCodeDetection.ts  ← Tier 1: Analyzer rule implemented ✅
    ├── recodeEngine.ts           ← AST transformation orchestrator with dry-run diff support ✅
    └── recodeTypes.ts            ← Shared interfaces & schemas (RuleContext, RuleResult, etc.) ✅

⚠️ Pending files NOT yet created (Tier 2/3):
    ├── rules/securityHardener.ts      ⏳ Not implemented
    └── rules/duplicateCodeExtraction.ts  ⏳ Not implemented
```

### Engine Features (Implemented)
- ✅ Unified entry point and modular structure (`recodeEngine.ts`)
- ✅ Tier 1 rules: `unusedImports` — AST-based import analysis & removal
- ✅ Analyzer rule: `deadCodeDetection` — single-file export usage detection
- ✅ Tier 1 rule: `modulePathNormalization` — relative path heuristic simplification
- ✅ Tier 1 rule: `typeInference` — explicit `any` annotation detection and inference
- ✅ Tier 2 rule: `asyncModernizer` — callback → async/await conversion analysis
- ✅ Dry-run mode with unified diff output (LCS-based diff generation)
- ✅ Backup & rollback support via `.bak` file creation

---

## ✅ Current Status (Verified 2026-07-07)

| Tier | Feature | File Location | Status |
|------|---------|---------------|--------|
| **Tier 1** | Unused import cleanup | `src/tools/recodeTool/rules/unusedImports.ts` | ✅ Implemented & Integrated |
| **Tier 1** | Dead code detection (single-file) | `src/tools/recodeTool/rules/deadCodeDetection.ts` | ✅ Implemented as Analyzer Rule |
| Tier 1 | Module path normalization | `src/tools/recodeTool/rules/modulePathNormalization.ts` | ✅ Implemented v1.5.34 (heuristic) |
| Tier 1 | Type inference / annotation fixes | `src/tools/recodeTool/rules/typeInference.ts` | ✅ Implemented v1.5.34 |
| **Tier 2** | Callback → async/await conversion | `src/tools/recodeTool/rules/asyncModernizer.ts` | ✅ Implemented v1.5.35 (analyzer) |
| **Tier 2** | Callback → async/await conversion | `rules/asyncModernizer.ts` *(Not Created)* | ⏳ Pending |
| **Tier 2** | Class → functional component migration | *(Not Created)* | ⏳ Pending |
| **Tier 2** | Security pattern hardening | `rules/securityHardener.ts` *(Not Created)* | ⏳ Pending |
| **Tier 2** | Duplicate code extraction | `(Not Created)` | ⏳ Pending |
| **Tier 3** | Auto-test generation | *(Not Created)* | ⏳ Pending |
| **Tier 3** | JSDoc auto-generation | *(Not Created)* | ⏳ Pending |
| **Tier 3** | Architecture linting | *(Not Created)* | ⏳ Pending |

### Engine Capabilities (v1.5.34)
- ✅ Modular rule architecture (`recodeEngine.ts`) with sequential rule application
- ✅ AST-based transformations using Babel parser/generator/traverse
- ✅ Dry-run mode with unified diff output (LCS algorithm)
- ✅ Backup & rollback via `.bak` file creation
- ✅ TypeScript-aware parsing (`plugins: ['typescript']`)
- ✅ Configurable rules via `RecodeConfig.ruleConfigs`

---

## 📝 Notes

This proposal was originally created on 04.07.2026. The base AST engine has been significantly enhanced as of v1.5.30 (05.07.2026), and the full modular Recode architecture with dry-run support was completed in v1.5.34 (06.07.2026). 

**As of 07.07.2026 (v1.5.35):** The core engine and all Tier 1 rules (`unusedImports`, `deadCodeDetection`, `modulePathNormalization`, `typeInference`) plus the first Tier 2 rule (`asyncModernizer`) are operational with strict TypeScript typing and zero ESLint warnings. All remaining Tier 2/3 features remain pending implementation as separate rule files in `src/tools/recodeTool/rules/`.
