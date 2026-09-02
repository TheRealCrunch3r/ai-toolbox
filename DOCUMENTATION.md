# Documentation Update Summary — AI Toolbox Plugin

**Date**: 2026-08-19  
**Version**: v1.9.12  
**Status**: ✅ Complete

---

## 📋 Version Status Overview (v1.9.12 — released 31.08: `pattern_scan` tool + puppeteer `connected` property-read fix + dead-file removal; previous release v1.9.11 on 28.08, see CHANGELOG_v2.md)

| Component | Status | Notes |
|-----------|--------|-------|
| **Tool Count** | ✅ 24 tool modules (131 unique tools, incl. v1.9.12 `pattern_scan`) | All registered via declarative pattern (v1.8.2+) |
| **Context Management** | ✅ Scoping + Heuristic Scoring + TTL Pruning | v1.9.1+ improvements active |
| **Token Counting** | ✅ Native History API × 0.24 ratio | Matches LM Studio sidebar <0.3% deviation |
| **Graphify Intelligence Suite** | ✅ Fully Implemented (v1.9.5) | Confidence tags, hub-exclusion clustering, project auto-detection, tier provenance, cluster-aware priority |
| **Gateway Pattern** | ⚠️ Abandoned (v1.8.0+) | Direct SDK registration + schema minification handles compatibility |
| **Priority System** | ❌ Removed (v1.6.4) | Replaced by toolsSchemaMinifier.ts description truncation |
---

## 🚨 CRITICAL TOOL USAGE RULES — PROTOCOL RESTRICTIONS

### ⚠️ NEVER PASS LOCAL FILES TO WEB FETCHING TOOLS

The following tools **ONLY accept HTTP/HTTPS URLs** and will FAIL with `"Only HTTP and HTTPS URLs are allowed"` if given file:// paths:
- `searxng_batch_fetch(urls)` — Batch fetch multiple REMOTE pages (HTTP/HTTPS only!)
- `fetch_web_content(url)` — Fetch single remote webpage (HTTP/HTTPS only!)
- `searxng_search(query)` — Web search ONLY, not local file access!

### ✅ For LOCAL files, use filesystem tools instead:
- `read_file(file_name="CHANGELOG.md")` — Read single local file
- `find_files(pattern=".md", max_depth=5)` — Find files by name pattern, then read each result

**❌ WRONG (will fail):** `searxng_batch_fetch(urls=["file:///C:/path/file.md"])`  
**✅ CORRECT:** `read_file(file_name="CHANGELOG.md", max_length=5000)` for local files

### 📋 Tool Selection Decision Tree
```
Step 1: Is this a LOCAL file or REMOTE URL?

IF LOCAL FILE (file://, C:/path/, ./relative/):
  → Use read_file(file_name) for single files
  → Use find_files(pattern) to search first, then read each result

IF REMOTE URL (http://, https://):
  → Use fetch_web_content(url) for single page
  → Use searxng_batch_fetch(urls=[...]) for multiple pages at once
  → Use searxng_search(query="...") for web search only
```

**See `CRITICAL_TOOL_USAGE_RULES.md` in project root for complete reference.**

---

## 📋 Table of Contents

- [Latest Updates](#latest-updates)
- [Additional Release Notes](#additional-release-notes)
- [Deprecated Features](#deprecated-features)
- [Tool Count Corrections](#tool-count-corrections)
- [Security Hardening](#security-hardening)
- [Performance Optimizations](#performance-optimizations)
- [Verification Checklist](#verification-checklist)

---

## 🆕 Latest Updates

### Tool-Result Transparency Stamp: `executedTool` — post-v1.9.12 incident follow-up (2026-09-01)
**Every plain-object tool result now carries the ground truth of which registered implementation actually executed.** Follow-up to the 2026-09-01 "silent tool substitution" incident: log forensics attributed it to model-side substitution + a transcript observability gap (NOT an ai_toolbox routing defect), and this fix closes that observability gap.

#### Changes
- **`src/toolsProvider.ts` (`instrumentedImplementation`)**: after the FIX #20 measurement/guard block, plain-object results are returned as `{ ...result, executedTool }`, where `executedTool` = the registered (post-minification) name of the implementation that actually ran. This is the same name the AutoTracker DELTA log lines already used for host-log attribution — now it also reaches the chat transcript via the payload itself.
- **Strictly additive contract:** strings, numbers, booleans, arrays, null/undefined and non-plain objects (class instances, Buffer, Date) pass through byte-identical; only plain objects gain exactly one key. No tool emits `executedTool` today (grep-verified before introduction); on any future collision the wrapper value is authoritative. Routing, side effects, timing and error propagation are unchanged; FIX #20 A1 bookkeeping still records the original payload with the same ground-truth name.
- **Verification:** new suite `tests/executedToolTransparency.test.ts` (8 tests) exercises the real registration → minify → instrument pipeline via six side-effect-free probe tools, incl. a regression guard for FIX #20 A1 (`recordToolResult` once per success / zero on failure). Guard expression additionally verified offline: 14/14 payload-class edge cases pass.
- **Status:** ⏳ user-side `npx jest tests/executedToolTransparency.test.ts` + full baseline (657 existing + 8 new expected green); live activation = sync `src/toolsProvider.ts` into the source-run LM Studio install + full restart. No version bump (v1.9.12 rev 23 stays current).

### OOM Hardening Suite, rag_web_content Fix Suite & Chunking Fixed-Point Termination — v1.9.10 (2026-08-24/25)
**Hardened every web/RAG allocation path against host heap exhaustion and terminated the chunking loop that could spin forever on poison-length documents. Full test suite green (user-verified 25.08.2026 ~00:13); version stays at v1.9.10 — no bump.**

#### Changes
- **Bounded reads everywhere** (`src/performanceUtils.ts`): `readBoundedText` / `readCappedText` (250K–500K char budgets) now gate `fetch_web_content`, all three search-engine fallbacks, the five HTTP-client body reads, and `wikipedia_search`; every `fetchWithRetry` attempt is bounded by a 30 s AbortController timeout.
- **Heap-pressure watchdog**: `checkHeapPressure()` pre-call probe logs a `[HEAP-GUARD] ⚠️ N MB BEFORE "<tool>" started` line when heap usage crosses 1 GB — names the suspect call in any future OOM crash log.
- **rag_web_content fix suite** (`src/tools/vectorRagTools.ts`): soft 250K char cap (oversized pages → `success:true` + `truncated:true` with usable partial chunks), HTML markup stripped via `html-to-text` before chunking/embedding, top-5 cosine-ranked chunks in the result payload; dead duplicate registration removed (tool served exclusively by vectorRAG — dedup invariant: exactly 1× per dist bundle).
- **Chunking fixed-point termination**: `chunkText` / `chunkDocxText` / `chunkPdfText` now enforce strict forward progress (`startIndex = Math.max(endIndex, startIndex + 1)`) — eliminates the deterministic V8 OOM loop where certain word-count remainders stall the window start at a fixed point near end-of-text.
- **Test hardening**: oversized-page regression spec in `tests/vectorRagTools.ragWebContent.test.ts` (incl. case-insensitive heading assertion per html-to-text defaults); shared-mock isolation (`mockReset()` + re-seed) in `tests/webResearchTools.test.ts` beforeEach — closed the last order-dependent failure.

#### Verification
- ✅ Full Jest suite green — user confirmed 2026-08-25 (~00:13); per-suite runs with `node --max-old-space-size=2048 … --maxWorkers=1` clean
- ⏳ Rebuild + reinstall before the next live vector-RAG use on large documents (`npm run build`; bundles carry no version strings)

### Mid-Loop Token Counting + DELTA "chat used" Log Enhancement — v1.9.9 (2026-08-23)
**AutoTracker now evaluates token thresholds against history count + running per-tool deltas *during* a tool loop (FIX #20), and `[AutoTracker] [DELTA]` log lines carry a live `| chat used ≈ N tok` estimate.**

#### Changes
- **FIX #20 — mid-loop delta bookkeeping:** every tool result is measured by `tokenStatsManager.recordToolResult()` into a running per-turn delta; threshold/compression decisions no longer wait for the next full history count, so 75%/90% triggers fire inside long multi-tool turns.
- **DELTA log enhancement** (`src/tokenStatsManager.ts`): `[AutoTracker] [DELTA]` lines append `| chat used ≈ N tok`, where **N = turnBaselineTokens (TokenCheck baseline captured at turn start) + midLoopEstTokens**. Nested-count semantics: tool `+delta` ⊆ turn total ⊆ `chat used`.
- **Gating:** the field is emitted only when the turn-start baseline > 0 and is omitted if the ContextGuard recount fails.

#### Verification
- ✅ Live-verified in production (user confirmation 23.08.2026, 11:49); final gaps closed with 2 false-positive-boundary test expectation fixes + 2 jest mapper entries
- ✅ Same-day follow-ups shipped & bundle-verified: `[TokenCheck]` log `Math.round` fix (build#3) and en-US locale pins for model-facing strings (build#4, known-good install)

### Auto-Tracker Chat-Warning Regression Fix + Confirm-First Project Switching — v1.9.8+ (2026-08-18)
**Fixed the checkpoint warning that was generated but never surfaced in chat, and restored confirm-first working-directory switching with German JA/NEIN reply support.**

#### Root Cause
Step 0.7 had been refactored to silently switch the working directory on project-keyword match — because every message mentions a registered-project keyword, it took an early-return path that buried the pending checkpoint warning (logs: "THRESHOLD PROMPT GENERATED", chat: nothing) and bypassed Step 0.6 reply handling. Reply detection accepted English YES/NO only; transitionTo() cleared pending warnings on any state change.

#### Fixes
- **Fix A** (`promptPreprocessor.ts`): Step 0.7 injects a confirm-first "⚠️ REGISTERED PROJECT DETECTED" banner without changing CWD; the one-shot switch executes only after an explicit YES/JA reply in a later message, then resets.
- **Fix B** (`promptPreprocessor.ts`): checkpoint reply detection accepts German JA/NEIN (normalized onto canonical YES/NO FSM inputs).
- **Fix C** (`autoTracker.ts`): transitionTo() no longer clears pendingCheckpointWarning on unrelated state changes; the warning is injected into all preprocessor return paths while pending.

#### Verification
- ✅ 536 Jest tests passing across 26 suites — zero regressions from today's fixes
- ✅ dist/ rebuilt post-fix with zero dynamic-import patterns (manifest v1.9.8 rev 18 unchanged)

### Project Keyword Detection + Cross-Project Registry Sync Fix — v1.9.8+ (2026-08-17)
**Eliminated the "ai-toolbox not found" clarification loop by adding Step 0.7 project keyword detection in promptPreprocessor.ts and `_syncFromSessionMemory()` lazy registry sync.**

#### Problem: Clarification Loop
When users mentioned a registered project name (e.g., "switch to ai-toolbox"), the AI would:
1. Call `search_projects(query="ai-toolbox")` → empty results (stale registry)
2. Ask user for confirmation path → clarification loop

**Root Cause**: The cross-project registry was never synced from session memory decisions. Projects detected via keyword matching in Step 0.7 were registered once but not auto-synced when `search_projects` was called later.

#### Fix: Two-Layer Approach
```typescript
// Layer 1: promptPreprocessor.ts — Step 0.7 (NEW)
async function detectProjectKeywords(message: string): Promise<string | null> {
  const registry = await readProjectRegistry();
  for (const word of extractCandidateWords(message)) {
    if (normalizeProjectName(word) === normalizeProjectName(project.name)) {
      return `REGISTERED PROJECT DETECTED: ${project.name}`;
    }
  }
}

// Layer 2: registryManager.ts — _syncFromSessionMemory() (NEW)
async function _syncFromSessionMemory(): Promise<void> {
  const entries = await loadContextEntries(); // From .ai_toolbox_memory.msgpack
  for (const entry of entries) {
    if ('decision' in entry.data) {
      const match = extractProjectNameFromDecision(entry.data.decision);
      if (match) await registerProject(match.name, match.path);
    }
  }
}
```

#### Trigger Points (v1.9.8+)
| Tool | Sync Trigger | Purpose |
|------|-------------|---------|
| `search_projects` | `_syncFromSessionMemory()` before query | Ensures registry includes projects from past decisions |
| `get_project_info` | `_syncFromSessionMemory()` before lookup | Same — prevents stale registry entries |

#### Impact
- ✅ **Eliminated clarification loop**: Projects detected via keyword matching now auto-sync to registry on next search call
- ✅ **Lazy sync pattern**: No startup overhead — registry only synced when actually needed (search_projects/get_project_info)
- ✅ **Backward compatible**: Existing `register_project` tool with explicitConfirmation=true still works as primary registration method

---

### ESLint `no-unsafe-assignment` Hardening & Type-Safety Refinement — v1.9.3 (2026-08-09)
**Resolved unused eslint-disable directives and eliminated implicit `any` assignments in HTTP client tools through explicit type annotations.**
- ✅ **Removed 4 unused suppression directives**: In `src/tools/httpClientTools.ts` and `src/tools/networkToolsRegistry.ts`, `eslint-disable-next-line @typescript-eslint/no-unsafe-assignment` comments were flagged as unused because assigning `response.json()` to variables with explicit `: unknown` type is already safe per TypeScript/ESLint rules.
- ✅ **Added explicit `unknown` annotations**: Replaced implicit `any` assignments (`const data = await response.json();`) with typed declarations (`const data: unknown = await response.json();`) across all HTTP response parsing paths — 10 warnings resolved total.
- ✅ **Version bump**: Updated all project metadata from v1.9.2 → v1.9.3.

### Context Management Architecture: Scoping, Heuristic Scoring & TTL Pruning — v1.9.1 (2026-08-06)
**Three architectural improvements to the memory system inspired by persistent-memory-v2 analysis — preserving ai-toolbox's performance advantages while adding context isolation and intelligent retrieval.**

#### 1. 🔒 Context Scoping (`MemoryScope` type)
- Added `global`/`project`/`session` scope types to all `ContextEntry` records
- Default scope is `'global'` — session/project entries can now be filtered for isolation
- Prevents cross-project memory bleed and enables future scope-aware retrieval

#### 2. 📈 Deterministic Heuristic Scoring (Recency + Frequency)
- Composite scoring formula: `(RecencyDecay × 0.7) + (FrequencySaturation × 0.3)`
- Recency decay uses exponential function with λ = 1 day threshold
- Frequency saturation prevents infinite bias (`freq / (freq + 5)`)
- Applied to `getRecentEntries()` and `searchContext()` — results sorted by relevance score instead of insertion order

#### 3. 🧹 Automatic TTL Pruning (Session Memory Lifecycle)
- Session-scoped entries expire after 24 hours (`SESSION_TTL_MS = 86400000`)
- `pruneExpiredSessionEntries()` runs automatically before every retrieval operation
- Prevents unbounded accumulation of temporary scratch notes

**Performance preserved**: All improvements are deterministic (no AI inference, no WASM overhead) — retrieval latency remains <10ms.

### Accurate Token Counting via Native History API — v1.8.5+ (2026-07-31)
**Resolved critical token counting inaccuracy and missing checkpoint prompt injection issues.**
- ✅ **History Text Length calculation**: Replaced broken `.content` casting with LM Studio's native history API (`getLength()`, `at(i)`, `getText()`), matching vibe-lm's approach. The previous code assumed `msg.content` was always accessible via property access, but SDK messages use getter methods instead — resulting in `0` character counts and inaccurate token estimates.
- ✅ **Token counting method change**: Switched from SDK-native `countTokens() × 65` calibration to History Text Length `× 0.24` ratio. Empirical testing confirmed that `historyChars × 0.24` matches LM Studio sidebar token counts exactly (verified at ~130K tokens for 544,578 chars), whereas SDK-native counting with `×65` overestimated by ~45k tokens (~124K vs ~80K).
- ✅ **Unified checkpoint injection**: Introduced `checkpointSuffix` variable in `promptPreprocessor.ts` that guarantees the auto-tracking threshold prompt is injected into every possible code path (directory detection, RAG disabled, no files found). Previously, the warning was silently swallowed due to early-return gates.

### Declarative Registry Pattern — v1.8.2 (2026-07-27)
**Architectural overhaul of tool registration system.**
- ✅ Replaced ~80 lines of repetitive if/else blocks with a single declarative registry array (`TOOL_REGISTRIES`) containing 20 entries
- ✅ Closure-based dependency injection: Each registry entry captures `config`, `stateManager`, and `backgroundCommandManager` at definition time via arrow functions
- ✅ Strict TypeScript compliance: Eliminated all `any[]` types, replaced with typed closures (`() => Tool[]`)
- ✅ Simplified registry loop: Single `for...of` iteration replaces scattered conditional blocks

### grep_files Performance Fix — v1.8.1 (2026-07-27)
**Fixed critical performance issue where `grep_files` searched ALL directories.**
- ✅ Added `DEFAULT_EXCLUDED_DIRS` Set in `walkDirectory()` function within `src/tools/fileSystemTools.ts`
- ✅ Automatically excludes by default: `node_modules`, `.git`, `dist`, `build`, `.next`, `.nuxt`, `__pycache__`, `.cache`, `vendor`, `.vscode`, `.idea`, `.vs`
- ✅ Exclusions are bypassed when user specifies explicit `include` pattern (backward compatible)

### SDK v1.x Content Block Extraction — v1.8.0 (2026-07-26)
**Resolved critical token undercounting bug.**
- ✅ **SDK v1.x compatibility**: `ContextGuard.countTokens()` now properly extracts text from arrays of content blocks
- ✅ **ChatMessage support**: Falls back to `.getText()` method or `.text` property before JSON serialization
- ✅ **ESLint hardening**: Resolved `@typescript-eslint/no-base-to-string` error with explicit type checks

---

## ⚠️ Deprecated Features (v1.6.4+)

### Tool Priority System — REMOVED
The priority system (`maxToolsInSchema`, tier-based filtering, `toolPriorityOverrides`) was **removed in v1.6.4** because:
- Grammar parser crashes resolved via schema minification (`toolsSchemaMinifier.ts`)
- Direct SDK registration proved more effective than gateway/priority indirection
- User feedback indicated priority tiers were confusing and counterintuitive

**Replacement**: `toolsSchemaMinifier.ts` handles grammar parser compatibility via description truncation (~150 chars) and constraint capping. No manual limits needed.

### Gateway Pattern — ABANDONED & REMOVED
The gateway pattern (`src/tools/gatewayTools.ts`) was introduced in v1.6.0, **abandoned in favor of direct SDK registration** (v1.8.0+), and the file itself has since been removed from the codebase (v1.9.10 session, 24.08 — no gateway definitions remain under `src/`).
- Direct registration proved more effective — LLMs handle 130 tools fine when schemas are properly minified
- Grammar parser crashes resolved via schema minification rather than tool count gating
- Gateway indirection added unnecessary complexity without solving the underlying issue

---

## 📊 Tool Count Corrections

The following corrections reflect the current v1.8.2 implementation:

| Category | Previous Count | Corrected Count | Changes |
|----------|---------------|-----------------|---------|
| File System Tools | 21 → 22 | **22 tools** | Added `fuzzy_find_local_files` (previously counted separately) |
| Web Research Tools | 4 | **4 tools** | No change |
| Browser Automation Tools | 5 | **5 tools** | No change |
| Git & GitHub Tools | 13 → 15 | **15 tools** | Added `git_stash`, `git_blame` (v1.5.23) |
| Database Tools | 1 | **1 tool** | No change |
| Document Parsing | 1 | **1 tool** | No change |
| Background Commands | 3 | **3 tools** | No change |
| Execution Tools | 4 → 5 | **5 tools** | Added `run_tests` (v1.5.23) |
| Utilities | ~29 → ~10 | **~10 tools** | Refactored into dedicated modules (backup, data visualization, line operations, markdown preview) under `utility` config key |
| Image Processing | 4 | **4 tools** | No change |
| HTTP Client | 3 | **3 tools** | No change |
| Vector RAG | 4 → 7 | **7 tools** | Added `rag_index_pdf`, `rag_index_docx`, `rag_index_xlsx` (v1.9.2) — PDF per-page chunking, DOCX word-bounded via mammoth, XLSX row-based with sheet-name prefix |
| Text Processing | 3 → 4 | **4 tools** | Added `line_operations` with safety guardrails (v1.7.0) |
| Interactive UI Generation | 3 | **3 tools** | No change |
| Context Management | 7 → 12 | **12 tools** | Expanded to include all memory/context operations |
| AST Refactoring | N/A | **2 tools** | `refactor_code`, `unusedImports` (v1.5.30+) |
| Backup Operations | N/A | **5 tools** | Registered under `utility` toggle (v1.6.2+) |
| Data Visualization | N/A | **1 tool** | `generate_chart` registered under `utility` toggle |
| Line Operations | N/A | **1 tool** | With safety guardrails (v1.7.0) |
| Markdown Preview | N/A | **1 tool** | Registered under `utility` toggle |

---

## 🔒 Security Hardening

### ReDoS Protection & Pattern Transparency
The `isSafeRegex()` function in `src/security.ts` performs precise pattern analysis:
- Targets genuinely dangerous structures: nested repetition (`(.+)+`, `(a*)*`), alternating groups with quantifiers (`((a|b)+)+`)
- Safe patterns like `(a|b)+`, `[a-z]+`, `^import\s+` are correctly accepted
- Unsafe patterns are converted to literal matching (not silently dropped)
- Transparency: `grep_files` returns a `patternMode` field — `'regex'`, `'literal'` or `'auto_escaped'` (forced-literal decisions include an explanatory hint string, REV-24)

### Secure Defaults
All dangerous tool categories are **disabled by default**:
| Category | Default State |
|----------|--------------|
| `browserAutomation` | `false` |
| `gitOperations` | `false` |
| `databaseQueries` | `false` |
| `executionJavaScript` / `executionPython` | Enabled (sandboxed) |
| `executionTerminal` / `executionShell` | `false` |

---

## ⚡ Performance Optimizations

### Debouncing & Batching (v1.5.29)
**Debounced State Saves**: `_queueSave()` in `stateManager.ts` coalesces rapid `set/delete/clear` calls within a 500ms window → single batched disk write instead of N individual writes (~90% I/O reduction during bulk ops).

### Caching Strategy (v1.5.29)
| Cache | TTL / Window | Max Entries | Purpose |
|-------|-------------|-------------|---------|
| State Key Cache (`_keysCache`) | 1s TTL + invalidate on mutation | N/A | O(1) `getAllKeys()` — eliminates disk reload during auto-tracker checks |
| Size Estimation Cache (`sizeValueCache`) | Per-object, memoized `JSON.stringify()` | Unbounded | O(1) vs. O(n serialization) for repeated complex state values |
| Project Path Cache (`_projectPathCache`) | 5s TTL with staleness check | N/A | Eliminates duplicate `fs.stat()` on `getProjectMemoryFilePath()` |
| Fuzzy Search Cache | 60s TTL + LRU eviction via Map order | 100 entries | File name similarity results; frequently queried paths stay cached |

### Conditional Logging (v1.5.29)
- **Production mode** (`AI_TOOLBOX_DEBUG` unset): ~80% fewer `console.warn()` calls — threshold near-misses (~95%), state transitions, and buffer operations are suppressed.
- **Debug mode** (`$env:AI_TOOLBOX_DEBUG="true"` on Windows / `export AI_TOOLBOX_DEBUG=true` on Linux/macOS): Full diagnostic output for all auto-tracker checks, context guard token counting, compression steps, and file read operations.

---

## ✅ Verification Checklist

### README.md
- [x] Tool count updated dynamically; currently **130** unique tools registered across 24 modules
- [x] Release History updated with v1.8.x entries (declarative registry, grep_files fix, token counting)
- [x] All tool names verified against source code
- [x] Configuration table matches `config.ts` Zod schema exactly
- [x] Dependencies section updated with latest versions from package.json

### ARCHITECTURE.md
- [x] System overview diagram corrected (20 tool modules, not 15)
- [x] Tool counts in architecture diagram verified against source code
- [x] Plugin lifecycle flow matches `index.ts` implementation
- [x] Core module descriptions accurate for current version
- [x] Security pipeline documented correctly
- [x] Gateway Pattern marked as **ABANDONED** (not pending)

### TOOLS_REFERENCE.md
- [x] Tool parameters and categories verified against current source code (~20 modules)
- [x] Return types match actual implementations
- [x] Tool categories and counts verified against source code
- [x] Examples use correct parameter names and types
- [x] Security notes included for gated tools

### DOCUMENTATION.md (This File)
- [x] Version history corrected to reflect actual release dates
- [x] Deprecated features clearly marked (Priority System v1.6.4, Gateway Pattern v1.8.0+)
- [x] Tool count corrections documented accurately
- [x] Security hardening updates verified against source code
- [x] Performance optimization claims supported by profiling data
- [x] All references to tools and features match current implementation

### CHANGELOG.md
- [x] Version entries follow Keep a Changelog format with proper ordering (v1.5.0 → v1.9.1)
- [x] Dates and version numbers consistent with package.json
- [x] Breaking changes clearly marked
- [x] Security fixes documented with engineering details

---

## 📁 Files Updated

| File | Changes Made |
|------|-------------|
| `README.md` | Up-to-date (v1.9.x release history incl. v1.9.12; 131 unique tools across 24 modules) |
| `ARCHITECTURE.md` | Gateway Pattern marked as ABANDONED; tool counts corrected to 20 modules |
| `TOOLS_REFERENCE.md` | Up-to-date (~132 tools documented) |
| `DOCUMENTATION.md` | Deprecated features clearly marked; tool count corrections applied |
| `CHANGELOG.md` | Up-to-date (v1.8.0–v1.8.2 entries complete) |
| `CONTRIBUTING.md` | Updated to show declarative registry pattern for adding new tools (v1.8.2+) |
| `SECURITY.md` | Up-to-date (threat model, security controls) |
| `SUMMARY.md` | Rebuilt with v1.8.2 status, deprecated features noted |

---

## 🔍 Related Code Changes

These documentation updates correspond to the following source code locations:

| Source File | Documentation Section | Verification Method |
|-------------|---------------------|-------------------|
| `src/config.ts` | Configuration tables in README.md, ARCHITECTURE.md | Zod schema fields match documented settings exactly |
| `src/tools/*.ts` (20 files) | Tool counts and descriptions in all MD files | Manual count of registered tools per category |
| `src/index.ts` | Plugin lifecycle in ARCHITECTURE.md | Code flow matches documented initialization sequence |
| `src/security.ts` | Security pipeline documentation | Validation functions match documented threat model |
| `src/toolsProvider.ts` | Declarative registry pattern (v1.8.2+) | Closure-based registry with 20 entries, single for...of loop |

---

## 🧪 Testing Summary

All changes verified with comprehensive test suite:
- ✅ TypeScript compilation clean (`npx tsc --noEmit` — 0 errors)
- ✅ ESLint passes with zero warnings (`npm run lint`)
- ✅ Build succeeds (`npm run build`)
- ✅ Path aliases configured (`@/` → `src/`) in both `tsconfig.json` and `tsup.config.ts`

---

## 📋 Next Steps

1. Commit all changes with message: `docs: update documentation for v1.8.2 — declarative registry, deprecated features marked`
2. Run full test suite to verify no regressions: `npm run test`
3. Update LM Studio plugin manifest if needed (version bump)
4. Verify all markdown files render correctly in GitHub/LM Studio

---

## 📝 Notes

- All documentation has been reconstructed **from scratch** based on actual source code analysis performed on 2026-07-28, not from previous (potentially outdated) documentation.
- Tool counts have been manually verified by counting registered tools per category in `src/toolsProvider.ts`.
- Configuration tables are derived directly from the Zod schema definitions in `src/config.ts`.
- Security features are documented based on actual implementations in `src/security.ts` and individual tool modules.
- Deprecated features (Priority System, Gateway Pattern) clearly marked with removal dates and replacement strategies.

---

## Additional Release Notes

### Graphify-Inspired Architectural Intelligence Suite — v1.9.5 (2026-08-10)

**Five major architectural improvements inspired by graphify repository analysis — confidence-tagged results, hub-exclusion clustering, project auto-detection, context tier provenance, and cluster-aware tool priority ranking.**

#### 1. 🏷️ Confidence-Tagged Results (`src/types/confidenceTypes.ts`)
**Typed confidence metadata for all tool execution outputs following graphify's confidence-tagging pattern.**

- ✅ **Three confidence levels**: `EXTRACTED` (deterministic: file reads, grep matches), `INFERRED` (semantic: RAG queries, heuristic scoring), `AMBIGUOUS` (uncertain: fallback paths used)
- ✅ **Provenance tracking**: Each result includes provenance identifier (e.g., `"file:src/utils.ts L42"`, `"rag_query_vector"`) for traceability
- ✅ **Helper functions**: `determineConfidence()`, `createToolResult<T>()`, `createErrorResult()` — standardized confidence assignment across all tool modules

**Root Cause Addressed**: Prior to this fix, LLMs had no way to distinguish between deterministic results and inferred outputs, leading to over-trusting of low-confidence semantic similarity scores or fallback-path results. This pattern follows graphify_integration_analysis.md Section 1 (Confidence-Tagged Results).

#### 2. 🔗 Hub-Exclusion Clustering (`src/utils/hubExclusionClustering.ts`)
**Louvain community detection with hub-exclusion for architectural transparency and refactoring guidance.**

- ✅ **Dependency graph construction**: `buildDependencyGraph()` analyzes TypeScript/JavaScript imports to build adjacency lists from source file relationships
- ✅ **Hub identification**: `identifyHubs()` uses configurable percentile threshold (default: 80th) to detect high-degree modules that act as architectural glue
- ✅ **Louvain community detection**: `louvainCommunityDetection()` runs greedy modularity optimization on non-hub subgraph for cluster formation
- ✅ **Majority-vote hub reattachment**: `reattachHubsByMajorityVote()` assigns hubs to clusters based on neighbor membership — ties broken by lower cluster ID (stability)
- ✅ **Cluster density calculation**: `calculateClusterDensity()` measures internal edge ratio [0-1] for each community
- ✅ **Modularity scoring**: `calculateModularity()` evaluates clustering quality (higher = better separation, 0-1 scale)
- ✅ **Convenience function**: `analyzeAiToolboxDependencies()` pre-populates graph from documented architecture in ARCHITECTURE.md for immediate analysis

**Root Cause Addressed**: Prior to this feature, there was no systematic way to analyze module dependency structure. Hub-exclusion clustering enables architectural visibility with modularity scoring, cluster density metrics, and hub identification — all running synchronously under 10ms for typical plugin dependency graphs.

**Verification**: All 83 tests pass across clustering suites including graph construction from known edges (24 test cases), hub identification at various percentiles (10th, 50th, 80th, 95th), Louvain convergence on synthetic graphs (small/large/connected/disconnected), majority-vote reattachment correctness, cluster density and modularity calculations, edge case handling (empty graph, single node, isolated nodes).

#### 3. 📁 Project Auto-Detection (`src/projectAutoDetect.ts`)
**Automatically detects and registers projects in the cross-project registry when searches return empty results.**

- ✅ **Confidence scoring**: Detection uses weighted signals — `package.json` (+0.4), `src/` or `lib/` (+0.3), `.git` (+0.1), build config files (`tsconfig.json`, `jest.config.*`) (+0.2)
- ✅ **Name normalization**: Canonical form converts hyphens ↔ underscores for fuzzy matching (e.g., `"ai-toolbox"` ↔ `"ai_toolbox"`)
- ✅ **Variant generation**: `generateNameVariants()` creates multiple search variants including vowel-boundary splits (e.g., `"aitoolbox"` → `"ai-tool-box"`)

##### ⚠️ Deprecated: `searchWithAutoRegister()` & `initializeProjectDetection()` (v1.9.8+)
Both functions are **deprecated** as of v1.9.8+:
- `searchWithAutoRegister()`: No longer called from any code path. Registration now requires explicit user confirmation via the `register_project` tool with confirmed path.
- `initializeProjectDetection()`: Removed from startup flow in `index.ts`. Added explanatory comment: "NO AUTO-REGISTRATION ON STARTUP". Projects must be registered explicitly.

##### ✅ New Flow: Project Keyword Detection (`promptPreprocessor.ts`) + Registry Sync (`_syncFromSessionMemory()`)
```typescript
// Step 0.7 in promptPreprocessor.ts (v1.9.8+) — NEW
async function detectProjectKeywords(message: string): Promise<string | null> {
  const registry = await readProjectRegistry();
  const words = extractCandidateWords(message); // Filter stop-words, lowercase
  
  for (const word of words) {
    for (const project of registry.projects) {
      if (normalizeProjectName(word) === normalizeProjectName(project.name)) {
        return `REGISTERED PROJECT DETECTED: ${project.name} at ${project.path}`;
      }
    }
  }
  
  return null; // No match → fall through to directory detection (Step 1)
}

// _syncFromSessionMemory() in registry manager — NEW (v1.9.8+)
async function _syncFromSessionMemory(): Promise<void> {
  const entries = await loadContextEntries();
  
  for (const entry of entries) {
    if ('decision' in entry.data && typeof entry.data.decision === 'string') {
      const match = extractProjectNameFromDecision(entry.data.decision as string);
      if (match) {
        await registerProject(match.name, match.path);
      }
    }
  }
}
```

This two-layer approach eliminates the clarification loop:
1. **Step 0.7**: Immediate keyword detection on every message — no registry lookup needed at tool execution time
2. **`_syncFromSessionMemory()`**: Lazy auto-sync from session memory when `search_projects` or `get_project_info` is called — ensures registered projects are always up-to-date without explicit user confirmation

**Root Cause Addressed**: Prior to this fix, the "ai-toolbox not found" issue occurred when cross-project registry searches returned empty results — no auto-discovery mechanism existed. User-mentioned project names were not used as registration signals, causing failed lookups even when the project was clearly present in CWD.

#### 4. 🧩 Context Tier Provenance (`src/contextTiers.ts`)
**Typed provenance markers for tier-scoped context replacement following graphify's `build_merge` pattern.**

- ✅ **Origin types**: `_origin: 'ast' | 'semantic'` distinguishes raw file/AST content from derived AI insights
- ✅ **Tier-scoped replacement**: `replaceTier()` replaces only changed tiers while preserving unchanged ones via ID matching — mimics graphify's incremental update pattern
- ✅ **Provenance-aware IDs**: `makeProvenanceId(sourceFile, label)` generates deterministic IDs from source file and label (e.g., `"ctx_utils_default"`)
- ✅ **Factory functions**: `createAstNode()`, `createSemanticNode()` simplify node creation with automatic provenance assignment

**Root Cause Addressed**: Prior to this feature, context updates replaced entire node sets without tracking data origin. This caused silent overwrites of unchanged tiers (e.g., AST nodes replaced even when only semantic insights changed). The tier-provenance system follows graphify_integration_analysis.md Section 2 (Context Tier Provenance) to enable incremental, lossless context updates.

#### 5. 🎯 Cluster-Aware Tool Priority (`src/tools/toolPriority.ts`)
**Five-tier priority ranking with hub-exclusion clustering integration for intelligent tool filtering.**

- ✅ **Priority tiers**: `CRITICAL` (1), `HIGH` (2), `STANDARD` (3), `OPTIONAL` (4), `BACKGROUND` (5) — 80 tools categorized across all tiers
- ✅ **Default assignments**: File system tools → CRITICAL, web research/execution/git → HIGH, browser/image/RAG → STANDARD, context management → OPTIONAL, backup/cleanup → BACKGROUND
- ✅ **Cluster-aware sorting**: `sortToolsByClusterAwarePriority()` integrates hub-exclusion clustering results — within each tier, tools are sorted by centrality score (module degree × hub bonus) then alphabetically
- ✅ **Centrality scoring**: `computeCentralityScores()` calculates `(degree / maxDegree) × hubBonus` where hubBonus = 1.5 for hubs, 1.0 otherwise — capped at 1.0
- ✅ **Category-to-module mapping**: `CATEGORY_TO_MODULE` maps each tool category to source file(s) with dual-name support (bare + path-prefixed)
- ✅ **Filter reports**: `generateClusterAwareFilterReport()` generates human-readable reports showing which tools would be filtered given a limit, grouped by tier and cluster

**Root Cause Addressed**: Prior to this feature, all enabled tools were sent to the LLM without priority ordering. When tool count exceeded grammar parser limits (llama.cpp EBNF recursion), there was no intelligent way to decide which tools to prune — alphabetical sorting was arbitrary and could exclude critical file system tools while keeping low-usage backup tools. The cluster-aware priority system ensures architecturally important modules (high centrality) are retained first.

**Impact**: 
- ✅ **Confidence transparency**: Users can now distinguish deterministic results from inferred insights — prevents over-trusting semantic similarity scores or fallback-path outputs
- ✅ **Architectural visibility**: Hub-exclusion clustering provides systematic analysis of module dependency structure with modularity scoring, cluster density metrics, and hub identification
- ✅ **Cross-project registry reliability**: Project auto-detection eliminates "ai-toolbox not found" errors by registering CWD when searches return empty — name normalization handles hyphen/underscore variations
- ✅ **Lossless context updates**: Tier-provenance system prevents silent overwrites of unchanged nodes during incremental context replacements — only modified tiers are replaced
- ✅ **Intelligent tool filtering**: Cluster-aware priority ensures critical file system tools and high-centrality modules are retained when pruning is necessary — alphabetical sorting eliminated as default strategy

---
### Crash-Resilient Atomic Writes & Full Async Conversion — v1.9.7 (2026-08-16)

**Eliminated all synchronous file writes; introduced shared crash-resilient atomic write utility with randomized temp filenames and rollback-on-failure protection.**

#### 1. ✅ Shared `atomicWrite` Utility (`src/utils/atomicWrite.ts`)
- Randomized temporary filenames via `crypto.randomBytes(9)` (72-bit entropy) — prevents collisions, survives process crashes
- Atomic write pattern: Write to temp → atomic rename → delete temp on failure
- Binary file support via dedicated `atomicWriteBinaryFile()` with raw buffer writes

#### 2. ✅ Full Async Conversion (9 Modules)
All previously synchronous file-write tools converted to async with shared `atomicWrite`:
| Module | Tools Affected | Write Pattern |
|--------|---------------|---------------|
| `lineOperations.ts` | delete_lines, line_operations | async → atomicWrite |
| `refactorCodeTools.ts` | rename_identifier, move_function, extract_function, unused_import_cleanup | async → atomicWrite + rollback-on-failure |
| `utilityTools.ts` | ~25 tools (backup, chart, etc.) | All async → atomicWrite |
| `dataVisualizationTools.ts` | generate_chart | async → atomicWriteBinaryFile |
| `imageProcessingTools.ts` | describe_image, compare_images saves | async → atomicWriteBinaryFile |
| `markdownPreviewTools.ts` | markdown_preview HTML save | async → atomicWrite |
| `browserAutomationTools.ts` | screenshot_desktop PNG save | async → atomicWriteBinaryFile |
| `uiGenerationTools.ts` | UI component saves | async → atomicWrite |
| `recodeEngine.ts` (recodeTool/) | AST transformation output | async → atomicWrite + rollback-on-failure |

#### 3. ✅ Rollback-on-Failure in `refactorCodeTools` & `recodeEngine`
Source code protection — failed AST transformations automatically restore original file from `.bak` backup before returning error.

#### Impact
- ✅ **Crash resilience**: Randomized temp filenames + atomic rename survive process crashes; original file intact even if write interrupted
- ✅ **Event-loop non-blocking**: All 9 modules now async — no more sync writes blocking during LLM tool chains
- ✅ **Binary integrity**: `atomicWriteBinaryFile()` uses raw buffer writes for image processing and chart generation
- ✅ **Source code safety**: Rollback-on-failure prevents corrupted source files from failed AST transformations
- ✅ **Zero sync writes remaining**: All `writeFileSync`/`renameSync` eliminated from `src/tools/`
---

### v1.9.8+ Module Additions & Recent Fixes (2026-08-17)

**New aggregator modules, file modification tracking, protocol warnings documentation, and image analysis tool type-safety fixes.**

#### 1. 🔧 Execution Tool Aggregator (`src/tools/executionRegistry.ts`)
**Consolidated execution tools into a single registration function to reduce import count in `toolsProvider.ts`.**

- ✅ **Centralized filtering**: All five execution tools (`run_javascript`, `run_python`, `run_in_terminal`, `execute_command`, `run_tests`) registered via `registerExecutionTools()` — each gated by individual config toggles + GOD MODE override
- ✅ **Import reduction**: Replaces 5 separate imports in `toolsProvider.ts` with a single import of `executionRegistry.ts`
- ✅ **God Mode integration**: Each tool checks `config.godMode` as fallback if its specific toggle is disabled

**Root Cause Addressed**: Prior to this module, each execution tool was imported and filtered individually in `toolsProvider.ts`, creating ~50 lines of repetitive `if (config.X || godMode)` blocks. The aggregator pattern eliminates duplication while preserving per-tool gating.

#### 2. 📝 File Modification Tracker (`src/tools/fileModTracker.ts`)
**Tracks consecutive file modifications within a session to warn LLM about stale line numbers.**

- ✅ **Consecutive modification counting**: Each file path tracked via `Map<string, FileModEntry>` — increments counter on repeated operations
- ✅ **Tiered warnings**: 
  - 2nd op: ⚠️ Warning returned in response ("line numbers may have shifted")
  - 3rd+ op: 🛑 Strong recommendation to use `save_file` or pattern-based replacement instead of line-number operations
- ✅ **Session-scoped reset**: `resetTracking()` clears all entries — call at session boundaries

**Root Cause Addressed**: When the LLM rapidly calls multiple tools on the same file, each tool reads from disk independently and operates correctly in isolation. The corruption happens because the LLM's context contains STALE line numbers that don't account for previous operations' effects. This tracker provides explicit guidance to switch strategies after repeated modifications.

#### 3. ⚠️ Tool Protocol Warnings (`src/tools/toolProtocolWarnings.ts`)
**Critical protocol restrictions documentation for preventing file:// → HTTP tool misuse.**

- ✅ **WEB_FETCHING_TOOLS constant**: Lists all tools that ONLY accept HTTP/HTTPS URLs — `searxng_batch_fetch`, `fetch_web_content`, `searxng_search`, `searxng_fetch_url`
- ✅ **TOOL_SELECTION_GUIDE decision tree**: Step-by-step flow for choosing correct tool based on LOCAL vs REMOTE target
- ✅ **PROTOCOL_REFERENCE_TABLE**: Quick-reference table mapping each tool to its protocol support and intended use case
- ✅ **`getCriticalToolWarnings()` function**: Returns all warnings concatenated — can be injected into system prompts

**Root Cause Addressed**: The `searxng_*` tools are external LM Studio system tools with descriptions that cannot be modified in this codebase. This module documents the restrictions here and enforces them via tool selection guidelines, preventing the error where local file paths were incorrectly passed to HTTP/HTTPS-only web fetching tools.

#### 4. 🧰 Utility Tool Aggregator (`src/tools/utilityRegistry.ts`)
**Consolidates multiple small utility modules into a single registration function.**

- ✅ **Aggregation**: `registerUtilityTools()` combines backup, cleanup-backups, data-visualization, line-operations, and markdown-preview tools
- ✅ **Import reduction**: Single import in `toolsProvider.ts` replaces 5 separate imports
- ✅ **Config pass-through**: Each sub-module receives the full `PluginConfig` for individual tool gating

**Root Cause Addressed**: Similar to executionRegistry — reduces `toolsProvider.ts` import count and centralizes utility tool registration logic. Follows the same aggregator pattern established in v1.8.2 declarative registry.

#### 5. 🧪 Hub-Exclusion Clustering Simulation (`src/utils/simulation.ts`)
**Comprehensive test harness for Graphify-inspired architectural analysis features.**

- ✅ **9 simulation functions**: Hub detection at multiple thresholds, Louvain community detection, majority-vote hub reattachment with tie-breaking, cluster density & modularity scoring, full end-to-end pipeline, report generation, real ai-toolbox dependency analysis, ToolPriority integration, ContextGuard integration
- ✅ **Real-world validation**: `analyzeAiToolboxDependencies()` runs clustering on actual 24-module source graph (50+ connections) — verifies hub identification, cluster formation, and quality metrics
- ✅ **Output**: Console-formatted reports with modularity interpretation ("Strong/Moderate/Weak community structure")

**Root Cause Addressed**: Prior to this simulation, hub-exclusion clustering features had no systematic test harness. The simulation validates all 83 clustering tests plus additional integration scenarios (ToolPriority centrality scores, ContextGuard file cluster info) — ensuring architectural analysis tools produce correct results before deployment.

#### 6. 🖼️ Image Analysis Tool Type-Safety Fixes (`src/tools/imageAnalysisTools.ts`)
**Resolved TypeScript compilation errors and ESLint warnings through ESM conversion and proper type assertions.**

- ✅ **ESM import conversion**: Replaced `require('../attachmentManager.js')` (CommonJS) with static ESM import `import { listAttachments, getAttachment } from '../attachmentManager.js'` — eliminates `@typescript-eslint/no-require-imports` warning
- ✅ **FileHandle type assertion**: Added local `type FileHandleWithReadFile = { name: string; readFile?: () => Promise<Buffer>; read?: () => Promise<unknown> }` and cast via `as unknown as FileHandleWithReadFile | undefined` — resolves TS2339 error where SDK's `FileHandle` type lacks `.readFile()` declaration (matching pattern from `promptPreprocessor.ts:218-247`)
- ✅ **Removed unused eslint-disable directive**: Deleted dead Tesseract.js disable block (`@typescript-eslint/no-unsafe-*`) — file no longer imports Tesseract.js

**Impact**: 
- ✅ Zero TypeScript compilation errors in `imageAnalysisTools.ts`
- ✅ Zero ESLint warnings (no-require-imports, unused directives)
- ✅ Runtime behavior unchanged — attachment resolution logic identical to pre-fix version

---