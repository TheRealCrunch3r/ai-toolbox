# DRAFT — Memory/Context Tool Consolidation (v1.9.x)

Status: **DRAFT for owner review** — no code changes made yet.
Date: 23.09.2026 · Working tree reference: `main @ 4f7fc76` (clean; v1.9.18/rev-33 pending owner-gated Hub publish)

## 1. Problem

The memory family exposes **two parallel subsystems** that share one storage file
(`<wd>/.session_context/.ai_toolbox_memory.msgpack`) but present as 9 near-synonymous tools:

| Subsystem | Record shape | Write tools | Read tools | Delete tools |
|---|---|---|---|---|
| Context store | rich entry `{id, type, title, content, tags}` | `track_important_event`, `auto_summarize_context` | `get_context_memory`, `search_context`, `context_summary` | `delete_context_entry`, `clear_context_memory` |
| Facts store | state record `{key: "memory_<ts>", value: {fact}}` | `save_memory` | `get_memory` | `delete_memory` |

Evidence this is a live confusion cost, not a theoretical one: in the 23.09 session the agent had to call
*both* `get_session_summary` and `get_memory` (two different diagnostic shapes) to discover that the store
holds **43 records but zero facts** — i.e., every prior `save_memory`-style fact is currently unreadable, and
no single tool could have surfaced that in one call.

Secondary finding: `src/tools/utilityTools.ts` (`registerUtilityTools`) is **dead code** — it holds a third
copy of save/get/delete_memory plus an unregistered `search_memory`. Nothing in `src/` calls it (verified by
grep); the production registry in `toolsProvider.ts` wires only contextManagement for this family.
→ Out of scope for this merge; tracked separately as cleanup debt (§7).

## 2. Target surface — memory family: 9 tools → 4 + 1

| New tool | Replaces | Notes |
|---|---|---|
| `remember` | `save_memory` + `track_important_event` | single write path into the context store (rich shape is a superset of `{fact}`) |
| `recall` | `get_memory` + `get_context_memory` (+ absorbs `context_summary`) | one read view over both record families, in one file |
| `search_context` | unchanged | query semantics ≠ listing; kept as-is |
| `forget` | `delete_memory` + `delete_context_entry` | single delete by opaque id/key, checks both families |

Unchanged (deliberate): `auto_summarize_context` (unique input shape: event arrays), 
`save_session_summary` / `get_session_summary` (different record type + eviction lifecycle),
`clear_context_memory`, `list_sessions`, `search_sessions`, `switch_context`, project-registry tools.

## 3. Merged tool specs

### 3.1 `remember`
```
params:
  fact:   string (required)        — the content to persist
  title?: string                   — optional; sets entry.title (was track_important_event's title)
  tags?: string[]                  — optional (was track_important_event's tags)
writes:  ContextEntry { id, type: 'summary' if no title else 'decision', title: title ?? fact.slice(0,80), content: fact }
returns: { entry_id, remembered: true }
```
Rationale: rich entries are queryable (search_context works on them) and deletable by one id — flat facts were neither.

### 3.2 `recall`
```
params:
  scope?: 'all' | 'facts' | 'entries'   default 'all'
  limit?: number                        default 20, max 50
  type?: entry-type filter              applies to entries only (was get_context_memory's filter)
returns: { facts[], entries[], diagnostics{ total_records_in_file, memory_entries_found, context_entries_found }, summary? }
```
Rationale: both families live in one file; one call must be able to answer "what do you remember?" unambiguously.

### 3.3 `forget`
```
params: entry_id (string) — matches a context-entry id OR a memory_* state key
returns: { deleted: true, family: 'context' | 'facts' } or not-found error naming both stores checked
```

## 4. Compatibility strategy (house pattern)

Follow the 12.09 `manage_projects` precedent exactly:
- Ship new names + **deprecated aliases** in the same rev (`save_memory`, `track_important_event`,
  `get_memory`, `get_context_memory`, `delete_memory`, `delete_context_entry`). Aliases delegate to merged impls,
  keep legacy response shapes where trivially possible, and carry "⚠️ DEPRECATED (1.x): use …" in descriptions.
- `context_summary` → alias of `recall(scope='entries', limit=5)` + summary block; kept one cycle only.
- Removal of aliases lands in the *next* rev (tracked as pending task at publish time).

## 5. Impact list (verified by grep, 23.09)

| File | Change |
|---|---|
| `src/tools/contextManagementTools.ts` | new impls (`remember`, `recall`, `forget`) + alias registrations; remove superseded primary defs after aliases verified |
| `src/tools/toolPriority.ts` (lines ~121–131) | tier table: 9 rows → 4 rows (+alias rows until removal rev) |
| `src/locales/en.ts`, `de.ts`, `es.ts`, `zh-CN.ts`, `zh-TW.ts` (~lines 135–145) | per-tool description rows for the new family; keep alias rows one cycle |
| `tests/memoryApiSelfDescription.test.ts` | re-target `get_memory`/`get_context_memory` assertions to merged tools (diagnostics contract moves into `recall`) |
| `tests/stateManagerDataLoss.test.ts` | rewrite `save_memory`+`track_important_event` write-pairs as `remember`; keep data-loss regression intent intact |
| `tests/toolsProvider.test.ts:136` | ordering assertion references `get_context_memory` — update name |
| `tests/__mocks__/contextManagementTools.ts` | mock exports only `get_context_memory` — extend to new names if any suite depends on it |
| `.lmstudio/dev.js`, `.lmstudio/production.js` | **verify whether generated by the local dev server** (tool names appear at many offsets). If generated → no manual edit. Flag: confirm before touching |

## 6. Verification plan

1. `npx tsc --noEmit` + ESLint clean on touched files.
2. Jest: full suite (`jest.config.cjs`) — the data-loss and self-description suites are the contract gates for this family.
3. Manual smoke in LM Studio dev: call `remember` → `recall(scope='all')` must show the fact under **both** families' diagnostics; `forget(entry_id)` removes it from disk (verify via `.msgpack` read, not just RAM).
4. Token overhead: compare tool-schema payload before/after via existing `toolOverhead.ts` reporting — expected net reduction of ~5 schemas × avg schema size per session (measurable, log both numbers at publish).
5. Backward-compat smoke: invoke each deprecated alias once, assert it routes to the merged impl and returns a deprecation note.

## 7. Non-goals / flagged debt (out of scope here)

- `utilityTools.ts` dead code removal (`registerUtilityTools`, its duplicate memory/session tools, `search_memory`) — separate cleanup PR; deleting it also removes `tests/utilityTools.test.ts`'s coverage target.
- The empty-facts-store mystery itself (43 records / 0 facts; lost "tests.7z PERMANENT KEEP" fact) — pre-existing snapshots exist in `.session_context/`; investigate separately, do not couple to this merge.
- `clear_session_index` vs `clear_context_memory` unification — possible later (`clear(scope)`), deferred: different blast radius per store deserves separate consent gating review.

## 8. Open questions for owner

1. Naming: OK with `remember / recall / search_context / forget`, or keep the verb-less style of this repo elsewhere?
2. Aliases one full release cycle (house standard) — confirm, or two cycles given external agents may have learned the old names?
3. Timing: fold into v1.9.x after the v1.9.18/rev-33 Hub publish (recommended — avoids a second build+publish churn before owner has shipped rev-33), or immediate?
4. `recall` default `scope`: `'all'` (max visibility, recommended) vs `'entries'` (smaller payloads)?

## 8a. Additional owner questions — line-editing family (added 23.09 during CRLF drift work)

5. `delete_lines` (background tier) is a pre-hardening duplicate of `delete_lines_in_file`
   (critical tier; see §9 for evidence). Options: **A** absorb its unique
   `verify_before_delete` capability into `delete_lines_in_file`, register `delete_lines` as a
   deprecated one-cycle alias delegating to it (§4 house pattern); **B** keep both tools and fix
   CRLF handling in `delete_lines` in place (requires creating a test suite that does not exist).
   Recommendation: A — removes the only background-tier duplicate, keeps capability loss at zero.
   **DECIDED = A** (owner 23.09 @18:06; executed same session — status + a defect found while writing the
   test suite: §9a). Q6 was still open at that point — since folded, see item 6 below / §9b.
6. Scope of the line family merge: is it OK to defer folding `line_operations`
   (standard tier; pattern anchoring + move op + hash post-write verify) into fileSystemTools to a
   separate decision? Recommendation: yes — its unique surface is wider, blast radius larger than Q5's pair.
   **DECIDED = YES, folded (owner 23.09; executed same session @~21:0x, Q6)**: `line_operations` moved from
   `textProcessingTools.ts` → `fileSystemTools.ts`; toolPriority category repointed textProcessing→fileSystem with the
   tier INTENTIONALLY kept 'standard' (owner review flag — file-family siblings are critical); locale entry moved to
   the fileSystem block in all five sets. No per-tool config key exists, so toolsProvider.ts needed zero edits;
   total registered surface unchanged (File System 23→24, Text Processing 4→3). Execution log: §9b below.

## 9. Line-editing family — delete-line tools successor question (23.09 addition, separate family)

Context: surfaced while fixing the CRLF false-positive drift on line-based deletes (§7 debt item).
The same capability exists in **four** overlapping tools; this section settles which delete tool is canonical.

| Tool | Module / tier | Safety suite | Unique capability | Tests | Localized (5 locales) |
|---|---|---|---|---|---|
| `insert_at_line` | fileSystemTools · critical | size/binary/backup/restore + STRICT read-back drift detect | strict multi-line insert verification (23.09: both-sides LF-normalized comparison) | in fileSystemTools.test.ts family | yes (with usage warning) |
| `delete_lines_in_file` | fileSystemTools · critical | size/binary/backup(default-true)/restore + atomic write | — | **yes** (`fileSystemTools.test.ts` L207+) | yes |
| `line_operations` | **fileSystemTools** · standard (module home moved 23.09 Q6; tier kept — owner flag) | binary check inlined at the target module per file-system house pattern (stat >10MB + first-8KB null-byte scan — deliberately NOT a cross-module import of readFileWithLimit), atomic write via the shared hoisted writer, post-write line-count+MD5 read-back (byte-exact) | pattern-anchored insert, move op, awk-style range delete | none | yes |
| `delete_lines` | lineOperations.ts · **background** | path validation + stat only — its description *claims* "binary protection, size limits" that the implementation lacks | `verify_before_delete`: content anchor with ±3-line drift-window relocation (23.09 fix) | **none** (`tests/lineOperations.test.ts` does not exist) | no |

Evidence for successor status of `delete_lines_in_file`:
1. Tier: critical vs background — it is what the model sees first; docs actively steer away from the
   lower tiers (en.ts L14 replace_text_in_file description: "NEVER use line_operations…").
2. Hardening: `delete_lines` promises safety features in its description that its code does not implement
   (no binary check, no 10MB cap, no backup) — the classic v1 contract later fulfilled by its successor.
3. Support surface: tests exist only for `delete_lines_in_file`; localization exists only for it;
   `restore_from_bak`'s own description names `delete_lines_in_file`, not `delete_lines`.
4. Registration history: `lineOperations.ts` is registered under toolsProvider key `'utility'` — the same
   group that supplied most of the dead code removed in the 23.09 cleanup PR (§7 item).

**Only capability at stake:** content-anchored deletion (`verify_before_delete`) — absent from both
`delete_lines_in_file` and `line_operations`'s delete path (which has no verify parameter at all).
That is why drift work touched the "wrong" tool: it is the only one that verifies content.

Decision asked (Q5): **A** = absorb + deprecate-alias (one cycle, §4 pattern), then fix CRLF handling in
`delete_lines_in_file`'s new verify path against the CRLF/mixed-EOL fixture plan; **B** = keep both, fix in
place.

**DECIDED (Q5) = A** (owner 23.09 @18:06). Executed same session — implementation status and a defect found
while writing the test suite: §9a below. Either way the verification gate is identical: uniform-CRLF with/without trailing newline + mixed-EOL
fixtures asserting byte-exact results and no false drift errors (empirical sim on 23.09 confirmed current
`delete_lines` logic round-trips uniform CRLF correctly; mixed-EOL files still fail systematically — the
boolean `hasCRLF` split merges bare-LF lines into neighbors, e.g. `"m1\r\nm2\nm3\r\n"` →
`["m1","m2\nm3",""]`).


## 9a. Q5=A execution status + defect found while writing tests (23.09 post-review)

**Executed same session as the decision — source edits verified on disk:**
- `src/tools/fileSystemTools.ts`: EOL-accurate engine exported right after `detectLineEndings` — `segmentLines` /
  `joinWithoutSegments` / `findVerifyWindow`. `delete_lines_in_file` gained `verify_before_delete` (±3-line
  re-anchor window [start−3 … start+2], trim-compared, multi-line aware; absent anchor → block with actualContext).
- New tool `delete_lines` registered immediately after its successor: ⚠️ DEPRECATED (v1.9.18) alias, identical
  params, runtime delegation via narrow cast; success adds `deprecated_alias` + `deprecation_note`; errors carry a
  `[⚠️ deprecated alias 'delete_lines']` prefix (+ ` | data=<json>` when the primary error has a data payload).
- `src/tools/lineOperations.ts` → stub (`registerLineOperationsTools` returns []; export kept for toolsProvider
  compile); `tests/__mocks__/lineOperations.ts` updated to match; `toolPriority.ts` row moved to fileSystem category,
  background tier, deprecation description (stays behind the successor in send-order).

**New test suite `tests/lineOpsCrlf.test.ts`** (40 active + 4 todo): engine unit contracts, byte-exact CRLF / mixed /
pure-LF deletes incl. THE mixed-EOL regression (`m1\r\nm2\nm3\r\n` → del L2 → `m1\r\nm3\r\n`), verify re-anchor/block
semantics (block proves NO write via the atomic-write `.tmp` spy), alias delegation contract, retirement guard
(stub + no double registration). Conventions copied verbatim from `fileSystemTools.test.ts`.

**⚠️ Defect found while writing that suite — introduced by DRIFT-FIX v2, NOT inherited:** for files WITHOUT a
trailing newline, `split(/(\r\n|\n)/)` yields an ODD parts list whose final element is dangling TEXT (not ''), so the
engine's own formula `lineCount = floor(parts.length/2)` undercounts by one. Consequences on every unterminated file:
(1) last line unreachable — valid deletion rejected "exceeds file length (N−1)"; (2) `remainingLines` off by one;
(3) drift-block context window truncated to the undercounted bounds; (4) a verify re-anchor landing past the reported
bounds trips a spurious out-of-bounds error instead of deleting. Mixed-EOL and uniform-CRLF behavior with trailing
terminators is unaffected (verified). The suite pins all six facets as `[pending-fail]` markers that are expected to
FAIL until fixed — do not "fix" the expectations; fix the source.

**Verified minimal fix** (simulated against editor-truth line counts for 8 EOL shapes, incl. trailing/untrailing/
mixed/single-line): `lineCount = parts[parts.length - 1] === '' ? Math.floor(parts.length / 2) : Math.ceil(parts.length / 2)` —
a plain `Math.ceil` would REGRESS the currently-correct trailing-terminated files (their odd list already ends in '').
The engine's doc comment claiming "Line count === ceil(parts.length / 2)" is itself only half-right and needs updating
with the fix.

**Owner verification gate for Q5=A:**
1. `npx jest lineOpsCrlf` → expected: all green EXCEPT the six `[pending-fail]` markers (red by design) + 4 todos skipped.
2. Apply the §9a minimal fix in `fileSystemTools.ts` (+ doc comment), re-run: suite fully green; then full `npx jest`.
3. `npx tsc --noEmit` + ESLint on touched **src** files (`npm run lint`) → git commit (cleanup branch) → `npm run build` before any publish. Note 23.09: the repo lints src ONLY by design — `eslint.config.mjs` ignores `tests/`, its rules block targets `files: ['src/**/*.ts']` with type-checked analysis via tsconfig.json (tests have a separate tsconfig.test.json and NO lint config), and `"lint": "eslint src --ext .ts"`. Passing an explicitly-ignored test path to eslint yields the by-design "File ignored because of a matching ignore pattern" WARNING (not an error); touched test files are verified via the jest suite instead (CLI silencer if a test path must be passed explicitly: `--no-warn-ignored`).

**Gate execution log (23.09 — owner-runs; agent applied fixes):**
- Step 1 run: 8 red vs expected 6 → diffed BEFORE any source edit: the six `[pending-fail]` markers + one UNEXPECTED — `uniform CRLF file (trailing)` (`lineOpsCrlf.test.ts`) expected `'l1\r\nl4'`, but byte-exact truth for deleting L2..L3 of `'l1\r\nl2\r\nl3\r\nl4\r\n'` is `'l1\r\nl4\r\n'` (join never rewrites terminators; sibling crlf3 + mixed-EOL tests pin identical semantics and were green). Classified as an expectation TYPO, not an engine regression → corrected the test (+ comment); the six markers' expectations left untouched per the suite-header contract.
- Step 2 run after the §9a formula fix (`fileSystemTools.ts` ~L1070) + doc-comment correction (~L169): **805 passed / 4 todo / 1 failed** — all six tool-level markers green, other 46 suites untouched. Residual red = marker #0 (`segmentLines('solo')` → `['solo']` vs idealized `['solo','']`): a REPRESENTATION assertion the formula fix cannot flip (prior-session sim had claimed all six would flip; it evidently modeled the padded variant — correction logged here).
- **Owner decision 23.09 @19:08 = Option A:** keep the odd-list shape for unterminated content (padding would flip four active shape-pins); marker #0 converted to an active documentation test asserting `['solo']` + the ceil-derived behavioral contract; remaining titles renamed `[was pending-fail, now fixed]`. **GATE CLOSED 23.09 @19:22 (owner):** re-run exactly as predicted (**806 passed / 4 todo / 0 failed**); `tsc --noEmit` clean; eslint clean on the touched src file (tests/ structurally out of lint scope — see step-3 note added same day); commit + `npm run build` clean. **Q5=A shipped.**

**NEXT-REV alias removal task (log at publish, §4 house pattern):** remove the `delete_lines` tool block in
`fileSystemTools.ts`; delete stub `src/tools/lineOperations.ts` + its import/registration in `toolsProvider.ts`; drop the
`toolPriority.ts` row and the `tests/__mocks__/lineOperations.ts` mock (+ jest.config.cjs mapper line if still present);
strip alias coverage from `tests/lineOpsCrlf.test.ts` (keep engine + verify tests).


**NEXT-REV execution log (agent applied source edits 23.09 @19:4x; owner verification pending):**
- All five checklist regions + the extra touchpoints below were removed in one pass (.bak per edit; the jest.config.cjs mapper line was spliced via a stdlib-fs script after text-replace escape mismatches — read-back verified, CRLF preserved):
  1. `fileSystemTools.ts`: alias tool block (34 lines) deleted; engine section header updated to "used by delete_lines_in_file".
  2. `src/tools/lineOperations.ts` deleted (the original pre-stub implementation survives in-tree as `lineOperations.ts.bak`); import + `{ key: 'utility', register: ... }` entry stripped from `toolsProvider.ts`.
  3. `toolPriority.ts`: alias row dropped AND the orphaned `CATEGORY_TO_MODULE['lineOperations']` map entry removed (it pointed at the deleted file; no tool row used that category since Q5=A moved it to 'fileSystem').
  4. `tests/__mocks__/lineOperations.ts` deleted + jest.config.cjs mapper line (L94) removed — plus a touchpoint NOT in the checklist: the global `jest.mock('../src/tools/lineOperations.js', () => ({...}))` factory in `jest.setup.ts`, which would throw "Cannot find module" once its target is gone.
  5. `tests/lineOpsCrlf.test.ts`: alias describe (5 tests) replaced by a 'delete_lines_in_file — error payload contract' block (2 pins re-pointed per the §9a warning: no-data error shape + data-carrying drift-block shape, now asserted on the primary directly); retirement guard → removal guard (`delete_lines` NOT registered; `lineOperations.ts` absent from tree via `jest.requireActual('fs')` — required because the suite's fs mock hardcodes `existsSync→true`); redundant alias-channel twin of pf4 deleted (pf4 pins the same contract on the primary); header comments updated.
- Extra touchpoint: `config.ts` utility-toggle hint no longer lists delete_lines. Locales verified clean (the alias was never localized — consistent with the §9 table).
- Verification state at log time: structural grep over src/ + tests/ shows zero live alias references (remaining mentions = historical doc comments + .bak restore points); `src/utils` dependency graph unaffected; jest.fulltest/jest.ctxsearch configs clean. **OWNER RUNS:** `npx tsc --noEmit` → `npm run lint` → `npx jest lineOpsCrlf` (expect all green: 40 active in that suite = pre-removal 44 −6 alias-channel tests [5-describe + pf-twin] +2 error-contract pins) → full `npx jest` → git commit on cleanup branch (then delete the .bak chain — note `lineOpsCrlf.test.ts.bak` is a MID-CHAIN post-E4/pre-E5 snapshot, do NOT restore blindly; same class as last cycle's) → `npm run build`.
- Docs still listing the old module (separate docs pass, owner-gated): ARCHITECTURE.md L1120 / L1230 / L1713, DOCUMENTATION.md L531, TOOLS_REFERENCE.md L87.


**NEXT-REV gate CLOSED 23.09 @20:30 (owner runs all green; agent executed docs pass):**
- **Owner verification @20:15–20:20:** `npx tsc --noEmit` → zero diagnostics · `npm run lint` → clean · full `npx jest` → **47/47 suites, 805/805 tests** (20.8s) — exact match with the prediction stated above (baseline Q5=A @19:37 = 809; −6 alias-channel + 2 error-contract pins). `npm run build` → CJS+ESM+DTS success per owner report @20:20. Note: full jest was run in a single pass (no separate `lineOpsCrlf` invocation reported); the suite's 40 active tests incl. removal guard are included in the 805.
- **Static sweep (agent, same session):** grep src/ + tests/ for `delete_lines` / `lineOperations` → zero live references; remaining mentions = primary tool names only, intentional history comments ("absorbed from retired delete_lines tool"), locale entries pointing at the primary, and the lineOpsCrlf.test.ts removal guard (0 bare registrations, exactly 1 primary).
- **`.bak` chain purged @20:17** per owner instruction — all 12 files deleted; full-tree rescan (depth 8) → 0 remaining. Includes `lineOpsCrlf.test.ts.bak` (mid-chain snapshot, gone as intended), the 3-stage `fileSystemTools.ts.{bak,prealias.bak,precore.bak}` chain, and `lineOperations.ts.bak` (sole surviving copy of the original pre-stub implementation — if that file was never committed, recovery is git-only). **No local restore points remain.**
- **Docs pass executed @20:30** (companion to this entry) per the L221 list: ARCHITECTURE.md — tree row → REMOVED tombstone (house style of the 24.08/01.09 entries), Line Operations row dropped from the LIVE module/toggle table, v1.9.8 history row annotated (module removed + `line_operations` attribution corrected to textProcessingTools.ts per v1.8.9 changelog); DOCUMENTATION.md + TOOLS_REFERENCE.md — same annotation on their v1.9.7 history rows (rows KEPT: the tables document the state AT v1.9.7, when the file still existed; "9 modules" counts preserved).
- **Disambiguation for future sessions:** NEXT-REV removed exactly ONE registered surface (the deprecated `delete_lines` alias channel + its stub module) from the `utility` category: 6 entries / 8 tools → 5 entries / 7 tools. The `utility` category itself, the `textProcessing` category (`line_operations` was NEVER in lineOperations.ts — stale doc tables misled on this), and every other registry entry are untouched. No tool named `get_os_info` exists anywhere in this project (zero hits across src/tests/docs).
- **Known residual staleness (out of scope for this pass):** ARCHITECTURE.md "Total Registered 130 live / 22 modules" figure predates the removal — pending owner recount at next full audit; README.md L162 stale text = pre-existing debt.
- **Remaining open item:** owner confirms the git commit landed on the cleanup branch (suggested msg `chore(tools): remove retired delete_lines alias + lineOperations stub (NEXT-REV)`); this docs pass should ride in that commit or land as an immediate follow-up.


## 9b. Q6 execution log — fold line_operations into fileSystemTools (23.09; agent applied edits, owner verification gate pending)

**Decision:** §8a item 6 = YES/fold (owner 23.09). Minimal-scope code move + category repoint only — no new
features, no test changes (no test asserts line_operations gating or locale counts), total registered surface
unchanged (File System 23→24, Text Processing 4→3; grand totals 129 entries / 127 names untouched).

**Code edits applied (.bak per edit):**
- `src/tools/textProcessingTools.ts`: lines 308–625 cut (the whole `line_operations` tool object); orphaned
  `import { createHash } from 'crypto'` removed; seam verified clean both sides (`text_extract` close →
  `markdown_table_gen`). File now ~15.7KB / 383 lines with the remaining 3 tools.
- `src/tools/fileSystemTools.ts`: `createHash` import added beside the existing imports; full tool object inserted
  between `delete_lines_in_file` and `make_directory` (name at L1178). Adaptations ONLY — all logic, guards and
  description verbatim incl. the 23.09 DRIFT-FIX v2 comment: initial read inlined to module pattern (stat >10MB +
  first-8KB null-byte scan; `readFileWithLimit` deliberately NOT imported cross-module — would couple modules),
  post-write verify via direct fs read, write via the hoisted shared atomic writer.
- `src/tools/toolPriority.ts`: row category repointed textProcessing→fileSystem (23.09 Q6 comment at the row);
  tier INTENTIONALLY kept 'standard' — flagged for owner review rather than silently promoted to critical with
  its family; CATEGORY_TO_MODULE unchanged (textProcessing still maps 3 live tools).
- Locales ×5 (`src/locales/{en,de,es,zh-CN,zh-TW}.ts`): `line_operations` entry moved from the textProcessing block
  into the fileSystem block after `delete_lines_in_file` (L18 in all five). Blocks are per-category but lookup is
  name-based → move safe; i18n tests assert categoryTitle only, parity guards unaffected.
- `src/toolsProvider.ts`: correctly UNTOUCHED — family-level gating proven by recon (no per-tool config key exists).

**Verification state at log time:** structural grep — zero line_operations references in textProcessingTools.ts;
exactly one registration site in fileSystemTools.ts (L1178); toolPriority row repointed with comment. No test
covers the moved surface → expected full-suite result unchanged: 805/805.

**Owner verification gate (step 8 — owner runs, agent does NOT nudge; further planned work before committing):**
1. `npx tsc --noEmit` → expect zero diagnostics.
2. `npm run lint` → clean (repo lints src ONLY by design; tests/ structurally out of scope — §9a step-3 note).
3. Full `npx jest` → expect **805 passed / 4 todo / 0 failed** — unchanged vs the NEXT-REV baseline @20:15.
4. Optional line_operations smoke in LM Studio dev (owner's call; no suite covers it — recommend one pattern-anchored
   insert + one range delete on a scratch file to confirm post-write MD5 verify path live).
5. Commit per owner design when ready — suggested msg `refactor(tools): fold line_operations textProcessingTools→fileSystemTools (Q6)`; may ride the NEXT-REV cleanup commit or land as an immediate follow-up.
6. After green: purge session .bak chain (this round adds: textProcessingTools.ts, fileSystemTools.ts, toolPriority.ts,
   5× locale files + docs/tool-consolidation-draft.md + README.md) — same protocol as the @20:17 purge; full-tree
   rescan after.

**Docs pass (step 7 — agent-applied this session, pre-gate; .bak per edit):**
- ARCHITECTURE.md: registration-flow counts (fileSystem 24 / textProcessing 3), file-structure tree rows for both
  modules (+Q6 notes), test-tree row precision note (module now 24; folded tool has no dedicated suite yet), tier
  comment aligned to source truth, Tool Registration Summary table (File System 24, Text Processing 3). Grand-total
  lines and "129/127 / 26 files" figures intentionally UNCHANGED — a fold moves counts between rows only.
- TOOLS_REFERENCE.md: overview counts (24 / 3), §File System header + `line_operations` row added to the Text Editing
  sub-table + guardrails subsection relocated to end of File System section (heading annotated "now in
  fileSystemTools.ts"), §Text Processing header count updated with tombstone comment at the removed block.
- This draft: §8a item 5 OPEN-marker retired, item 6 DECIDED annotation, §9 table row re-pointed (module + inlined
  binary-check note), this §9b entry added. README.md: the prior plan's "no change" call had overlooked the Tool-Arsenal per-family counts —
File System 23→24 and Text Processing 4→3 updated, line-surgery description swapped between the two rows (prose
feature copy otherwise still accurate; untouched). NOTE: its meta line ("770 tests green (47 suites)") was already
stale vs the 805 baseline BEFORE this session — pre-existing debt, not part of Q6.

**GATE CLOSED 23.09 @~21:26 (owner):** `npx tsc --noEmit` → zero diagnostics · `npm run lint` → clean · full
`npx jest` → **47/47 suites, 805/805 tests** (16.2 s) — EXACT match with the predicted baseline (unchanged vs
NEXT-REV @20:15; no test covers the moved surface, as foreseen). Optional line_operations smoke not run this
round (owner's call — still available any time on a scratch file to exercise the post-write MD5 path live).

**Remaining owner actions (agent does NOT nudge):**
- git commit per owner design when ready — suggested msg `refactor(tools): fold line_operations textProcessingTools→fileSystemTools (Q6)`; may ride the NEXT-REV cleanup commit or land as an immediate follow-up.
- `.bak` purge of this round's chain (12 files: ARCHITECTURE.md, TOOLS_REFERENCE.md, README.md, docs/tool-consolidation-draft.md + textProcessingTools.ts, fileSystemTools.ts, toolPriority.ts, 5× locales) — awaiting owner go-ahead; full-tree rescan after.

**Open owner decision carried over:** tier for `line_operations` ('standard' today vs 'critical' with its file-family
siblings) — flagged, not silently changed; a promotion is a one-line edit in toolPriority.ts + this doc's notes.

**Q6 SHIPPED (code + docs); commit pending owner design.**


## 9c. C compaction family — SHIPPED (24.09; code + tests + docs)

**Status: SHIPPED (code + docs); commit pending owner design.** All four gates green on the final code state (test 50/824 identical to baseline, lint/typecheck clean, build OK). The C family prunes oversized tool payloads from chat history BEFORE ContextGuard summarization, so a single giant `read_file` / web-fetch payload can no longer dominate the summarization prompt (the documented "Original content unavailable" fallback class) nor survive verbatim in `keepLast` and re-fire the compression threshold on the very next check. Nothing is lost: every pruned payload is stored verbatim on disk behind an opaque SHA-256 locator. No tool surface changed — this is a preprocessor/context-guard family, not a registered tool; TOOLS_REFERENCE/README counts intentionally untouched (805/47 already claims the C suites).

**Policy — `src/utils/toolPayloadCompaction.ts`** (PURE by design: no fs, no SDK, no globals — jest-testable without mocks, F1-helper pattern):
- Trigger: role `'tool'` messages only (user/assistant/system content is sacred — system carries the compression indicators); payload shapes = string / text-object (`{text}`) / content-block array (the same surface ContextGuard reads when building the summarization prompt).
- Threshold `DEFAULT_MAX_BYTES_PER_RESULT = 16384` UTF-8 bytes STRICT-greater (`Buffer.byteLength`, so multibyte text is measured honestly); preview = head 2048 + tail 512 chars with an elision line; replaced content carries the marker `[ai_toolbox compaction]` (also the idempotency guard — already-pruned text / `__compacted: true` objects are never re-pruned) and the retrieval hint.
- Locator format: `compaction://<sha256hex>` (branded opaque id, 64 hex chars; `buildLocator`/`parseLocator`/`isLocator`). Digest pairing contract: the storage backend supplies exactly one digest per message the policy will rewrite (same scan order via the shared `getPrunablePayloadTexts`); a missing/malformed paired digest → message left UNTOUCHED + loud console error (`pruneOversizedToolPayloads` skips, never mints a fake digest).
- Pruning is IN PLACE on the message array (`pruneOversizedToolPayloads`, returns `{ prunedCount, bytesSaved, locators, skippedCount }`; `bytesSaved` = serialized JSON length before − after).

**Storage — `src/utils/toolPayloadStorage.ts`:**
- Target: `<cwd>/.ai_toolbox/compaction/<sha256>.payload` (relative dir constant imported from the policy module — single source of truth; retrievable by the file-reading tools via that path).
- Writes: `0o600`, `'wx'` exclusive create + symlink refusal on every path segment; EEXIST → byte-compare idempotent reuse (identical bytes = no-op, mismatched bytes under an existing digest = THROW — opaque-id integrity).

**Drain — `src/tokenStatsManager.ts` (`drainActiveToolTurns`, 24.09):**
- Bounded wait before turn-level state mutation (delta reset / history compression): poll interval default **250 ms**, hard cap **15 s** (`DEFAULT_DRAIN_MAX_WAIT_MS = 15_000`) — bounded is MANDATORY by design; on cap-exceeded with tool calls still in flight → loud `[TokenStatsManager] [DRAIN] FAIL-LOUD` log, mutation deferred (never a silent skip).

**Wiring:**
- `src/toolsProvider.ts`: wrapper records active tool turns (start/finish bookkeeping) — NO routing change.
- `src/promptPreprocessor.ts`: serialization guard FIRST in the compaction entry (`preprocess()`), then STEP 3 (~L846–886) = **store-before-prune, default ON**: payloads are persisted to disk before any message is pruned; ANY store failure aborts that turn's prune entirely (degrade-safe: history stays unpruned, no partial state).
- `src/config.ts`: compaction fields per the module headers (toggle + byte budget); toggle OFF = family fully inert.

**Tests — three real suites (draft-planned names retired; these are the on-disk truth):**
| Suite | Cases | Covers |
|---|---|---|
| `tests/compactionPolicy.test.ts` | 9 its | pure policy: threshold strictness, preview shape + marker, locator format round-trip, digest pairing fail-loud skip, idempotency (no re-prune), in-place semantics, role/scope scoping |
| `tests/compactionStorage.test.ts` | 5 | store-before-prune contract: exclusive create 0o600, symlink refusal, EEXIST byte-compare idempotent reuse + mismatch throw, failure → prune aborted |
| `tests/drainGuard.test.ts` | 5 | bounded drain: clean-drain resolve, cap-exceeded FAIL-LOUD path, poll/cap defaults (250 ms / 15 s) |

Zero `.each()`; full baseline unchanged at **824 tests / 50 suites** after the family landed.

## 9d. RE-ARM pending decision — CLOSED (owner GO, option a) + arc note (24.09)

The pattern_scan wall-cap RE-ARM of the day (DE-STRAngle reversal per owner order "abort after 3 seconds";
`PATTERN_SCAN_MAX_RUN_MS = 3_000`, size bounds kept — full record in CHANGELOG_v3 `[24.09] PATTERN_SCAN RE-ARM` +
RELEASE_NOTES) left one pending item: whether to FOLD the cap back into this draft's consolidation narrative or keep it as a standalone entry. **Owner chose (a)** (GO 24.09 ~20:xx): retract/defer any fold; the arc is documented STANDALONE — DE-STRAngle removed, owner order re-armed, tests rewritten for the two-source abort contract. This draft is UNCHANGED by it (its scope remains the memory/context family §1–§8 + line-editing §9–§9b + C compaction §9c); expected full baseline still **824/50** pending owner re-run (the RE-ARM replaced test pins, did not add/remove tests).
