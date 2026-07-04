# Recode Tool Proposal

**Date:** 04.07.2026  
**Project:** ai_toolbox (LM Studio Plugin)  
**Base File:** `src/tools/refactorCodeTools.ts`

---

## 🧠 Concept Overview

The existing `refactor_code` tool covers only 3 basic operations:
- Rename identifiers (AST-based)
- Move functions between files
- Extract function (poorly implemented — creates empty stubs, doesn't extract actual code)

A **"Recode"** toolset would expand this into a comprehensive, AST-driven refactoring engine that helps developers modernize, clean up, and harden their codebases safely.

---

## 📦 Proposed Features by Tier

### 🔹 Tier 1 — High Value, Low Risk (Build First)
| Feature | Why It Matters | Example |
|---------|----------------|---------|
| **Unused import cleanup** | Reduces bundle size, removes clutter | Removes `import { unused } from '...'` across files |
| **Dead code detection** | Flags unreachable/never-called functions | Warns about exported functions never imported by anything else |
| **Module path normalization** | Fixes broken relative imports after moves | Converts `../../utils` → absolute/clean paths |
| **Type inference / annotation fixes** | Catches `any` leaks and missing types | Replaces `: any` with inferred type or adds typed placeholders |

### 🔹 Tier 2 — High Value, Medium Complexity
| Feature | Why It Matters | Example |
|---------|----------------|---------|
| **Callback → async/await conversion** | Removes callback hell in legacy code | Converts `(err, data) => {...}` chains to `async/await` |
| **Class → functional component migration** (React) | Modernizes React codebases | Class components with lifecycle methods → hooks (`useState`, `useEffect`) |
| **Security pattern hardening** | Auto-fixes common vulnerabilities | Replaces string concat in SQL with parameterized queries, sanitizes user input before `innerHTML` |
| **Duplicate code extraction** | Reduces maintenance burden | Detects identical/mostly-identical function bodies and extracts a shared utility |

### 🔹 Tier 3 — Strategic / Differentiating
| Feature | Why It Matters | Example |
|---------|----------------|---------|
| **Auto-test generation** | Massive time-saver for coverage gaps | Reads function signatures, infers edge cases, generates Jest/Vitest tests |
| **JSDoc auto-generation** | Improves IDE autocomplete & docs | Generates typed documentation from function bodies and types |
| **Architecture linting** | Enforces team conventions across the codebase | Flags direct DB calls in controllers (should be in services), detects circular dependencies beyond existing tool |

---

## 🎯 Recommendation: Start with Tier 1 + One Killer Feature

For maximum immediate utility, propose building:

### 1. `recodesign_imports`
- Analyze all imports across the project
- Detect unused/dead ones via static analysis
- Offer dry-run preview before removing
- Leverages existing Babel AST infrastructure

### 2. `recodemodernize_async`
- Convert callback-style code to async/await using AST transformation
- Reuses Babel parser/generator already in place
- Handles common patterns: Node.js callbacks, Promise `.then()` chains, RxJS subscriptions

### 3. `recodesecurity_harden`
- Pattern-based auto-fixes for common security anti-patterns
- Examples: hardcoded secrets, missing input validation, unsafe `eval()`, `innerHTML` without sanitization
- Differentiator: proactive rather than reactive

---

## ⚙️ Key Design Decisions

1. **Dry-run first**: Always show what *would* change before touching files
2. **AST-based, not regex**: Use Babel properly this time (parse → transform → generate)
3. **Configurable rules**: Users enable/disable specific transformation types via config (like ESLint rules)
4. **Chaining support**: Allow composing multiple recode operations in one call
5. **Backup & rollback**: Automatic `.bak` creation before any modification, with restore option

---

## 📂 Suggested File Structure

```
src/tools/
├── refactorCodeTools.ts          (existing — keep as base)
└── recodeTool.ts                 (new — unified entry point)
    ├── rules/
    │   ├── unusedImports.ts
    │   ├── asyncModernizer.ts
    │   └── securityHardener.ts
    ├── recodeEngine.ts           (AST transformation orchestrator)
    └── recodeTypes.ts            (shared interfaces & schemas)
```

---

## ✅ Next Steps

- [ ] Prototype `unused_import_cleanup` using existing Babel setup
- [ ] Add dry-run mode with diff output
- [ ] Integrate as new tool entry in `toolsProvider.ts`
- [ ] Write unit tests for each transformation rule
- [ ] Document usage examples in `TOOLS_REFERENCE.md`
