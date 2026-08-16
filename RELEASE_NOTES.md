## Silent Auto-Registration Bug Fixed: Explicit Confirmation Required for Project Registration

**Eliminated silent auto-registration of wrong/stale project paths without user confirmation.**

### What Changed

#### 1. Startup Auto-Registration Removed (src/index.ts)
- **Root Cause**: main() called initializeProjectDetection(cwd) unconditionally during plugin startup - silently registered whatever directory it found instead of the actual project path.
- **Fix**: Removed both the import and the call from index.ts. Added explanatory comment documenting that projects must be registered explicitly via the register_project tool.

#### 2. Safety Gate: explicitConfirmation Parameter (src/projectAutoDetect.ts)
- **Root Cause**: autoDetectAndRegister() and searchWithAutoRegister() had no confirmation gate - they would register any valid project directory without user input.
- **Fix**: Added explicitConfirmation: boolean = false parameter to both functions. Both now return { registered: false } when the flag is not explicitly set to true.

#### 3. initializeProjectDetection() Marked DEPRECATED (src/projectAutoDetect.ts)
- The function still exists for backward compatibility but no longer calls any registration logic - only detects and logs project info + deprecation warning.

### Root Cause Addressed
Prior to this fix, the silent auto-registration bug occurred because:
1. User said "let's work on ai-toolbox" → registry search returned empty (project not yet registered in current session)
2. initializeProjectDetection(cwd) was called unconditionally at startup
3. It detected whatever directory happened to be active and silently registered it
4. The correct project path was never used

### Impact
- ✅ **No more silent registration**: Projects can only be registered via explicit `register_project` tool call with confirmed path
- ✅ **Startup is clean**: main() no longer auto-registers — only logs detection info + deprecation warning if initializeProjectDetection() is called externally
- ✅ **Search is safe**: searchWithAutoRegister() returns empty without registering unless explicitly confirmed
- ✅ **Backward compatible**: All existing APIs preserved; new parameters default to false (blocked) which prevents accidental registration

---

### Crash-Resilient Atomic Writes: Shared atomicWrite Utility and Full Async Conversion Across 9 Modules

**Eliminated all synchronous file writes from the codebase; introduced shared crash-resilient atomic write utility with randomized temp filenames and rollback-on-failure protection.**

#### What Changed

##### New Shared atomicWrite Utility (src/utils/atomicWrite.ts)
- ✅ **Randomized temporary filenames**: Uses `crypto.randomBytes(9)` for unique temp file names — prevents collisions even under rapid concurrent writes, eliminates stale temp files from prior crashes
- ✅ **Atomic write pattern**: Write to temp file → atomic rename → delete temp on failure. Survives process termination mid-write (temp file orphaned but original intact)
- ✅ **Binary file support**: Dedicated `atomicWriteBinaryFile()` function uses raw buffer writes with no text encoding — preserves exact binary content for image processing and other non-text operations

##### Full Async Conversion (9 Modules)
All previously synchronous file-write tools converted to async with shared atomicWrite:
| Module | Tools Affected | Previous State | New State |
|--------|---------------|----------------|-----------|
| lineOperations.ts | delete_lines, line_operations | Sync writes via fs.writeFileSync | Async → atomicWrite |
| refactorCodeTools.ts | rename_identifier, move_function, extract_function, unused_import_cleanup | Sync writes | Async → atomicWrite + **rollback-on-failure** |
| utilityTools.ts | ~25 utility tools (backup, chart, line ops) | Mixed sync/async | All async → atomicWrite |
| dataVisualizationTools.ts | generate_chart | Sync PNG write | Async → atomicWriteBinaryFile |
| imageProcessingTools.ts | describe_image, compare_images output saves | Sync writes | Async → atomicWriteBinaryFile |
| markdownPreviewTools.ts | markdown_preview HTML save | Sync write | Async → atomicWrite |
| browserAutomationTools.ts | screenshot_desktop PNG save | Sync write | Async → atomicWriteBinaryFile |
| uiGenerationTools.ts | UI component saves | Sync writes | Async → atomicWrite |
| recodeEngine.ts (recodeTool/) | AST transformation output | Sync writes | Async → atomicWrite + rollback-on-failure |

##### Rollback-on-Failure in refactorCodeTools and recodeEngine
- ✅ **Source code protection**: When atomic write fails during AST refactoring, tool automatically restores original file from `.bak` backup before returning error — prevents corrupted source files

### Impact
- ✅ **Crash resilience**: Randomized temp filenames + atomic rename survive process crashes; original file intact even if write interrupted mid-operation
- ✅ **Event-loop non-blocking**: All 9 modules now async — no more `writeFileSync` blocking the event loop during LLM tool chains
- ✅ **Binary integrity**: `atomicWriteBinaryFile()` uses raw buffer writes — image processing and chart generation preserve exact binary content
- ✅ **Source code safety**: Rollback-on-failure in refactorCodeTools prevents corrupted source files from failed AST transformations
- ✅ **Zero sync writes remaining**: All file operations use shared async atomic write pattern — consistent error handling across entire codebase

---

### DEP0190 Fix: Eliminate shell:true Deprecation Warning

**Replaced all child_process.exec() calls with explicit shell spawning via spawn(cmd.exe /c, ...) in gitGithubTools.ts. Zero behavioral changes; zero breaking changes.**

#### What Changed
- ✅ **Removed exec import + promisify**: Replaced with single `import { spawn } from 'child_process'`
- ✅ **Added safeExec() helper function**: Explicit shell spawning using `cmd.exe /c` (Windows) or `/bin/sh -c` (Unix/macOS) — never uses `{ shell: true }`, avoiding Node.js DEP0190 warning
- ✅ **All 12 git command invocations updated**: git diff, git commit, git checkout -b, git push, git stash push/pop/drop/list, git blame now use safeExec() instead of execPromise()

### Impact
- ✅ **DEP0190 warning eliminated**: No more shell:true deprecation warnings in logs when using any git/GitHub tools
- ✅ **Behavioral parity preserved**: safeExec() replicates exact semantics of the original execPromise() — same stdout/stderr capture, same cwd support, same error propagation via rejection
- ✅ **Cross-platform correct**: Windows uses cmd.exe /c, Unix/macOS uses /bin/sh -c — matches Node.js's internal exec behavior

---

### Project Keyword Detection + Cross-Project Registry Sync Fix (v1.9.8+)

**Eliminated the "ai-toolbox not found" clarification loop by adding Step 0.7 project keyword detection in promptPreprocessor.ts and _syncFromSessionMemory() lazy registry sync.**

#### Problem: Clarification Loop
When users mentioned a registered project name (e.g., "switch to ai-toolbox"), the AI would:
1. Call `search_projects(query="ai-toolbox")` → empty results (stale registry)
2. Ask user for confirmation path → clarification loop

**Root Cause**: The cross-project registry was never synced from session memory decisions. Projects detected via keyword matching in Step 0.7 were registered once but not auto-synced when search_projects was called later.

#### Fix: Two-Layer Approach
- **Layer 1 — promptPreprocessor.ts (Step 0.7)**: detectProjectKeywords() reads project_registry.json, fuzzy-matches message words against registered projects (hyphen↔underscore normalization), and injects a confirmation prompt before falling through to directory-path detection or RAG.
- **Layer 2 — registryManager.ts (_syncFromSessionMemory())**: Scans .ai_toolbox_memory.msgpack for project_path fields and auto-registers missing projects — called lazily inside search_projects / get_project_info, so no startup overhead.

#### Trigger Points (v1.9.8+)
| Tool | Sync Trigger | Purpose |
|------|-------------|---------|
| search_projects | _syncFromSessionMemory() before query | Ensures registry includes projects from past decisions |
| get_project_info | _syncFromSessionMemory() before lookup | Same — prevents stale registry entries |

#### Impact
- ✅ **Eliminated clarification loop**: Projects detected via keyword matching now auto-sync to registry on next search call
- ✅ **Lazy sync pattern**: No startup overhead — registry only synced when actually needed (search_projects/get_project_info)
- ✅ **Backward compatible**: Existing register_project tool with explicitConfirmation=true still works as primary registration method

---

### Image Analysis Tool Type-Safety Fixes (v1.9.8+)

**Resolved TypeScript compilation errors and ESLint warnings through ESM conversion and proper type assertions.**

#### What Changed in src/tools/imageAnalysisTools.ts
- ✅ **ESM import conversion**: Replaced `require('../attachmentManager.js')` (CommonJS) with static ESM import — eliminates @typescript-eslint/no-require-imports warning
- ✅ **FileHandle type assertion**: Added local type FileHandleWithReadFile = { name: string; readFile?: () => Promise<Buffer> } and cast via as unknown as FileHandleWithReadFile | undefined — resolves TS2339 error where SDK's FileHandle type lacks .readFile() declaration (matching pattern from promptPreprocessor.ts:218-247)
- ✅ **Removed unused eslint-disable directive**: Deleted dead Tesseract.js disable block (@typescript-eslint/no-unsafe-*) — file no longer imports Tesseract

### Impact
- ✅ **Zero TypeScript errors**: tsc --noEmit passes clean
- ✅ **Zero ESLint warnings**: All @typescript-eslint/* rules satisfied
- ✅ **Build verified**: npm run build succeeds (ESM 11.99MB, CJS 12.63MB)

---

### Documentation Sync (v1.9.8+)

**Synchronized version references and added missing module documentation across project files.**

#### What Changed
- ✅ **DOCUMENTATION.md**: Added v1.9.8+ module additions section (+6KB) covering executionRegistry, fileModTracker, toolProtocolWarnings, utilityRegistry, simulation, imageAnalysisTools
- ✅ **TOOLS_REFERENCE.md**: Added Image Analysis tool documentation with parameter specs and type-safety notes (+1.8KB)
- ✅ **CHANGELOG.md**: Inserted v1.9.8+ changelog entry at top of file (+6.3KB)

### Impact
- ✅ All project documentation now reflects current codebase state
- ✅ Zero stale version references found across all MD files
- ✅ New modules properly documented for LLM tool discovery and user reference