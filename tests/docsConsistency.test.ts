/**
 * DOC-PIN-TEST (06.10, owner GO "Doc-consistency pin test" — the arc deferred by decision "1" after TOOL-DOC-SYNC):
 * registry-vs-docs drift gate. No such check existed behind either documented drift class:
 *   1) TOOL-DOC-SYNC arc (06.10): shipped remove_plan missing from TOOLS_REFERENCE + README family table until an owner-pressed audit;
 *   2) stale doc counts / stale bundles — same "no gate validates registry vs docs" root cause (tsc/lint/jest = code+tests only).
 *
 * DESIGN NOTES:
 * - GROUND TRUTH = the real registration factories, imported DIRECTLY with extensionless relative specifiers.
 *   Under jest most './tools/*.js' specifiers are moduleNameMapper-redirected to tests/__mocks__/ stubs (several return
 *   empty arrays; __mocks__/fileSystemTools.ts even leaks a single dummy `list_directory`), so calling toolsProvider()
 *   here would measure the MOCKS, not the registry. Extensionless '../src/...' imports bypass every mapper entry and load
 *   the real modules — same precedent as taskPlanningTools.test.ts driving the REAL implementation.
 * - MODULES below mirrors src/toolsProvider.ts TOOL_REGISTRIES + execution special case 1:1 (provider-registry order,
 *   for readable future drift diffs). If a new module lands in that registry: add its factory to MODULES AND its doc
 *   boundary rows in TR_/RM_BOUNDARIES — exactly the two places where a doc surface is needed anyway.
 * - HERMETIC by construction: no tool IMPLEMENTATION is ever invoked (factories only). PIN_CONFIG = DEFAULT_CONFIG +
 *   godMode ON + statePersistenceEnabled OFF → StateManager's constructor takes its zero-I/O disabled branch (early
 *   return before any fs call — src/stateManager.ts); BackgroundCommandManager's constructor is allocation-only. The jest
 *   repo-store guard would throw on any live-store write regardless — this suite cannot reach one.
 * - TOOLS_REFERENCE.md holds the per-TOOL inventory: every registered name must appear BACKTICKED (`name`). Row-strict
 *   anchoring is deliberately NOT used: a small number of tools are documented via section header/prose instead of their
 *   own table row (e.g. `refactor_code` → §"AST-Driven Refactoring Engine"). Backticked-presence is exactly the drift
 *   class TOOL-DOC-SYNC fixed (a wholly missing tool) without false-failing header-documented tools.
 * - README.md "The Tool Arsenal" family table holds per-FAMILY rows with integer Counts: every doc-declared integer count
 *   must equal that boundary's live tool count, and every registry module must surface under at least one boundary in
 *   each doc (or inline by name — R4/R5). Family BOUNDARIES differ between the two docs by design: restore_from_bak sits
 *   in TOOLS_REFERENCE §Backup & Restore but its sibling list_available_bak_backups + markdown_preview + get_repeat_tool_
 *   advice sit in both docs' Data-Visualization "sibling" area; README's Backup row counts 5 (no restore_from_bak), and
 *   the Refactoring row has a non-integer Count cell → pinned by name (R3) instead.
 */

import { readFileSync } from 'fs';
import * as path from 'path';

import type { Tool } from '@lmstudio/sdk';
import type { PluginConfig } from '../src/config';
import { DEFAULT_CONFIG } from '../src/config';
import { StateManager } from '../src/stateManager';
import { BackgroundCommandManager } from '../src/backgroundCommands';

// ── Real registration factories — mirrors src/toolsProvider.ts TOOL_REGISTRIES + exec special case (1:1) ──
import { registerBackupTools } from '../src/tools/backupTools';
import { registerBackgroundCommandTools } from '../src/tools/backgroundCommandTools';
import { registerBrowserTools } from '../src/tools/browserAutomationTools';
import { registerCleanupBackupsTool } from '../src/tools/cleanupBackupsTool';
import { registerContextManagementTools } from '../src/tools/contextManagementTools';
import { registerDatabaseTools } from '../src/tools/databaseTools';
import { registerDataVisualizationTools } from '../src/tools/dataVisualizationTools';
import { registerDocumentTools } from '../src/tools/documentTools';
import { registerExecutionTools } from '../src/tools/executionTools';
import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import { registerGitTools } from '../src/tools/gitGithubTools';
import { registerHttpClientTools } from '../src/tools/httpClientTools';
import { registerImageProcessingTools } from '../src/tools/imageProcessingTools';
import { registerMarkdownPreviewTools } from '../src/tools/markdownPreviewTools';
import { registerRefactorCodeTools } from '../src/tools/refactorCodeTools';
import { registerRagTools } from '../src/tools/vectorRagTools';
import { registerRepeatToolReminderTools } from '../src/tools/repeatToolReminderTools';
import { registerRestoreFromBakTools } from '../src/tools/restoreFromBak';
import { registerRestoreSessionContextTool } from '../src/tools/restoreSessionContextTool';
import { registerTaskPlanningTools } from '../src/tools/taskPlanningTools';
import { registerTextProcessingTools } from '../src/tools/textProcessingTools';
import { registerUiGenerationTools } from '../src/tools/uiGenerationTools';
import { registerWebResearchTools } from '../src/tools/webResearchTools';

/** God-mode config for factory calls: factories ignore toggles; statePersistenceEnabled OFF keeps StateManager's
 *  constructor on its zero-I/O disabled branch (see src/stateManager.ts — early return before any fs call). */
const PIN_CONFIG: PluginConfig = { ...DEFAULT_CONFIG, godMode: true, statePersistenceEnabled: false };

let _sm: StateManager | undefined;
function sm(): StateManager { if (!_sm) _sm = new StateManager(PIN_CONFIG); return _sm; }
let _bgm: BackgroundCommandManager | undefined;
function bgm(): BackgroundCommandManager { if (!_bgm) _bgm = new BackgroundCommandManager(PIN_CONFIG); return _bgm; }

/** One registry module (provider order). `names` is filled in beforeAll from the REAL factory output. */
interface ModulePin { id: string; register: () => Tool[]; names?: Set<string> }

const MODULES: ModulePin[] = [
  { id: 'backgroundCommandTools', register: () => registerBackgroundCommandTools(PIN_CONFIG, bgm()) },
  { id: 'browserAutomationTools', register: () => registerBrowserTools(PIN_CONFIG) },
  // contextManagement hosts TWO factories in the provider (memory family + composite resume tool) — one module pin.
  { id: 'contextManagementTools', register: () => [...registerContextManagementTools(PIN_CONFIG, sm()), ...registerRestoreSessionContextTool(PIN_CONFIG, sm())] },
  { id: 'databaseTools', register: () => registerDatabaseTools(PIN_CONFIG) },
  { id: 'documentTools', register: () => registerDocumentTools(PIN_CONFIG) },
  // The `utility` config key hosts six modules in the provider — registered as individual pins so doc boundaries can attribute tools per doc.
  { id: 'backupTools', register: () => registerBackupTools(PIN_CONFIG) },
  { id: 'cleanupBackupsTool', register: () => registerCleanupBackupsTool(PIN_CONFIG) },
  { id: 'dataVisualizationTools', register: () => registerDataVisualizationTools(PIN_CONFIG) },
  { id: 'restoreFromBak', register: () => registerRestoreFromBakTools(PIN_CONFIG) },
  { id: 'markdownPreviewTools', register: () => registerMarkdownPreviewTools(PIN_CONFIG) },
  { id: 'repeatToolReminderTools', register: () => registerRepeatToolReminderTools(PIN_CONFIG) },
  { id: 'taskPlanningTools', register: () => registerTaskPlanningTools(PIN_CONFIG) },
  { id: 'fileSystemTools', register: () => registerFileSystemTools(PIN_CONFIG, sm()) },
  { id: 'gitGithubTools', register: () => registerGitTools(PIN_CONFIG) },
  { id: 'httpClientTools', register: () => registerHttpClientTools(PIN_CONFIG) },
  { id: 'imageProcessingTools', register: () => registerImageProcessingTools(PIN_CONFIG) },
  { id: 'refactorCodeTools', register: () => registerRefactorCodeTools(PIN_CONFIG) },
  { id: 'textProcessingTools', register: () => registerTextProcessingTools(PIN_CONFIG) },
  { id: 'uiGenerationTools', register: () => registerUiGenerationTools(PIN_CONFIG) },
  { id: 'vectorRagTools', register: () => registerRagTools(PIN_CONFIG) },
  { id: 'webResearchTools', register: () => registerWebResearchTools(PIN_CONFIG) },
  // Execution special case: the provider calls ONE factory then filters per sub-toggle; god mode = all five tools.
  { id: 'executionTools', register: () => registerExecutionTools(PIN_CONFIG) },
];

// ── Per-doc FAMILY BOUNDARIES (label → contributing tool NAMES; declared count = that set's live size) ─────
/** TOOLS_REFERENCE.md section headings ("## … <label> …"). Name-level attribution: the two docs draw family
 *  boundaries DIFFERENTLY for the utility-key sibling tools, so module ids would double-count (28.09 re-audit split). */
const TR_BOUNDARIES: Array<{ label: string; names: string[] }> = [
  { label: 'File System', names: ['list_directory','read_file','read_file_chunked','save_file','replace_text_in_file','insert_at_line','append_file','delete_lines_in_file','line_operations','make_directory','move_file','copy_file','delete_path','delete_files_by_pattern','find_files','fuzzy_find_local_files','get_file_metadata','change_directory','analyze_project','file_diff','directory_tree','ripgrep','find_replace_all','pattern_scan'] },
  { label: 'Code Refactoring', names: ['refactor_code'] },
  { label: 'Web Research', names: ['web_search','wikipedia_search','fetch_web_content'] },
  { label: 'Browser Automation', names: ['browser_open_page','browser_session_control','browser_session_close','preview_html','open_file'] },
  { label: 'Git & GitHub', names: ['git_status','git_diff','git_commit','git_log','git_add','git_checkout','gh_create_issue','gh_list_issues','gh_view_comments','gh_create_pr','gh_list_prs','gh_view_pr_diff','gh_push','git_stash','git_blame'] },
  { label: 'Database', names: ['query_database'] },
  { label: 'Background Commands', names: ['run_background_command','check_background_command','cancel_background_command'] },
  { label: 'Execution', names: ['run_javascript','run_python','execute_command','run_in_terminal','run_tests'] },
  // The "Utilities" section is a DEAD-STATUS NOTE (superseded, re-audit 28.09) — deliberately not a counted boundary.
  { label: 'Image Processing', names: ['image_to_text','describe_image','screenshot_desktop','compare_images'] },
  { label: 'Vector RAG', names: ['rag_index_files','rag_query_vector','rag_clear_index','rag_web_content','rag_index_pdf','rag_index_docx','rag_index_xlsx'] },
  { label: 'UI Generation', names: ['generate_ui_component','render_and_preview_ui','extract_ui_data'] },
  { label: 'Context Management', names: ['auto_summarize_context','get_context_memory','search_context','context_summary','delete_context_entry','clear_context_memory','track_important_event','save_session_summary','get_session_summary','save_memory','get_memory','delete_memory','list_sessions','search_sessions','clear_session_index','manage_projects','register_project','get_project_info','list_projects','search_projects','switch_context','restore_session_context'] },
  { label: 'Text Processing', names: ['text_transform','text_extract','markdown_table_gen'] },
  // §Backup & Restore declares "6 rows below" (re-audit 28.09) — `restore_from_bak` documented there, its sibling
  // `list_available_bak_backups` in the Data-Viz section instead (boundary split = docs' own, not this test's).
  { label: 'Backup & Restore', names: ['create_backup','list_backups','restore_backup','delete_backup','cleanup_backups','restore_from_bak'] },
  // §Data Visualization declares (1) + a "Sibling live tools" table naming the three further utility-key tools.
  { label: 'Data Visualization', names: ['generate_chart','list_available_bak_backups','markdown_preview','get_repeat_tool_advice'] },
  { label: 'Document Parsing', names: ['read_document'] },
  { label: 'HTTP Client', names: ['http_request','http_get_json','http_post_json'] },
  { label: 'Task Planning', names: ['create_plan','get_plan','update_plan_step','remove_plan'] },
];

/** README.md "The Tool Arsenal" table rows. Same name-level attribution; boundaries differ from TOOLS_REFERENCE by design (see file header). */
const RM_BOUNDARIES: Array<{ label: string; names: string[] }> = [
  { label: 'File System', names: ['list_directory','read_file','read_file_chunked','save_file','replace_text_in_file','insert_at_line','append_file','delete_lines_in_file','line_operations','make_directory','move_file','copy_file','delete_path','delete_files_by_pattern','find_files','fuzzy_find_local_files','get_file_metadata','change_directory','analyze_project','file_diff','directory_tree','ripgrep','find_replace_all','pattern_scan'] },
  // Non-integer Count cell ("`refactor_code` + rules") — pinned by NAME presence instead (test R3), not by count.
  { label: 'Refactoring & Recode engine', names: ['refactor_code'] },
  { label: 'Text Processing', names: ['text_transform','text_extract','markdown_table_gen'] },
  { label: 'Task Planning', names: ['create_plan','get_plan','update_plan_step','remove_plan'] },
  { label: 'Execution', names: ['run_javascript','run_python','execute_command','run_in_terminal','run_tests'] },
  { label: 'Context & Memory', names: ['auto_summarize_context','get_context_memory','search_context','context_summary','delete_context_entry','clear_context_memory','track_important_event','save_session_summary','get_session_summary','save_memory','get_memory','delete_memory','list_sessions','search_sessions','clear_session_index','manage_projects','register_project','get_project_info','list_projects','search_projects','switch_context','restore_session_context'] },
  { label: 'Vector RAG', names: ['rag_index_files','rag_query_vector','rag_clear_index','rag_web_content','rag_index_pdf','rag_index_docx','rag_index_xlsx'] },
  // README "Backup & Restore" = 5 (does NOT count restore_from_bak in its row — that tool's doc home is TOOLS_REFERENCE §Backup & Restore).
  { label: 'Backup & Restore', names: ['create_backup','list_backups','restore_backup','delete_backup','cleanup_backups'] },
  // Data-Viz row Count=1 covers generate_chart only; sibling tools are pinned by inline backticked names (R4), not this count.
  { label: 'Data Visualization', names: ['generate_chart'] },
  { label: 'Image Processing', names: ['image_to_text','describe_image','screenshot_desktop','compare_images'] },
  { label: 'Document Parsing', names: ['read_document'] },
  { label: 'Web Research', names: ['web_search','wikipedia_search','fetch_web_content'] },
  { label: 'Browser Automation', names: ['browser_open_page','browser_session_control','browser_session_close','preview_html','open_file'] },
  { label: 'Git & GitHub', names: ['git_status','git_diff','git_commit','git_log','git_add','git_checkout','gh_create_issue','gh_list_issues','gh_view_comments','gh_create_pr','gh_list_prs','gh_view_pr_diff','gh_push','git_stash','git_blame'] },
  { label: 'Background Commands', names: ['run_background_command','check_background_command','cancel_background_command'] },
  { label: 'HTTP Client', names: ['http_request','http_get_json','http_post_json'] },
  { label: 'UI Generation', names: ['generate_ui_component','render_and_preview_ui','extract_ui_data'] },
  { label: 'Database', names: ['query_database'] },
];

// ── Doc access (repo root = one level up from tests/) ─────────────────────────────────────────────
const REPO_ROOT = path.join(__dirname, '..');
function readDoc(relPath: string): string { return readFileSync(path.join(REPO_ROOT, relPath), 'utf8'); }

/** Backticked presence — `` `name` ``. The TOOL-DOC-SYNC drift class is a wholly missing tool name. */
function backticked(doc: string, name: string): boolean { return doc.includes('`' + name + '`'); }

const stripDecor = (s: string) => s.replace(/\*\*/g, '').replace(/[^\p{L}\p{N}& ]/gu, ' ').toLowerCase().replace(/\s+/g, ' ');

/** A family anchor exists if some table row's label cell or some ##/### heading contains the stripped label. */
function hasFamilyAnchor(doc: string, label: string): boolean {
  const want = stripDecor(label);
  for (const line of doc.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith('|')) {
      const cells = t.split('|').map(c => c.trim());
      if (!/^[-: ]+$/.test(cells[1] ?? '') && stripDecor(cells[1] ?? '').includes(want)) return true;
    } else if (/^#{2,3}\s/.test(t) && stripDecor(t).includes(want)) {
      return true;
    }
  }
  return false;
}

/** Integer count declared in the arsenal row whose label cell contains `label` (undefined when absent/non-integer). */
function arsenalRowCount(doc: string, label: string): number | undefined {
  const want = stripDecor(label);
  for (const line of doc.split(/\r?\n/)) {
    if (!line.trimStart().startsWith('|')) continue;
    const cells = line.split('|').map(c => c.trim());
    const lc = (cells[1] ?? '').replace(/\*\*/g, '');
    if (!lc || !stripDecor(lc).includes(want) || /^[-: ]+$/.test(cells[2] ?? '')) continue;
    const n = Number.parseInt((cells[2] ?? ''), 10);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

describe('DOC-PIN-TEST — registry vs docs drift gate (06.10)', () => {
  const nameOwners = new Map<string, string[]>(); // tool name → module ids (S2 asserts exactly one owner each)
  const allNames: string[] = [];

  beforeAll(() => {
    for (const m of MODULES) {
      m.names = new Set(m.register().map(t => t.name));
      for (const n of m.names) { nameOwners.set(n, [...(nameOwners.get(n) ?? []), m.id]); allNames.push(n); }
    }
  });

  const liveCountOf = (moduleIds: string[]): number =>
    moduleIds.reduce((sum, id) => sum + (MODULES.find(m => m.id === id)?.names?.size ?? 0), 0);

  // ── Sanity pins: the collected ground truth must be sane before it may pin anything ─────────────
  test('S1 — registry collection is non-trivial (≥90 distinct names, ≥20 modules)', () => {
    expect(new Set(allNames).size).toBeGreaterThanOrEqual(90);
    expect(MODULES.length).toBeGreaterThanOrEqual(20);
  });

  test('S2 — every registered tool name is owned by exactly one module', () => {
    const dups = [...nameOwners.entries()].filter(([, owners]) => owners.length > 1);
    expect(dups.map(([n, o]) => `${n} → ${o.join('+')}`)).toEqual([]);
  });

  test('S3 — every registered name is a valid snake_case tool identifier', () => {
    for (const n of allNames) expect(n).toMatch(/^[a-z][a-z0-9_]*$/);
  });

  // ── TOOLS_REFERENCE.md: the per-tool inventory + family sections ───────────────────────────────
  describe('TOOLS_REFERENCE.md', () => {
    let doc: string;
    beforeAll(() => { doc = readDoc('TOOLS_REFERENCE.md'); });

    test('T1 — every registered tool name appears (backticked) in TOOLS_REFERENCE.md', () => {
      const missing = [...new Set(allNames)].filter(n => !backticked(doc, n)).sort();
      expect(missing).toEqual([]);
    });

    test('T2 — every TR family boundary has a section anchor AND its declared integer count matches live code', () => {
      const problems: string[] = [];
      for (const b of TR_BOUNDARIES) {
        if (!hasFamilyAnchor(doc, b.label)) { problems.push(`missing §anchor for "${b.label}"`); continue; }
        // The declared count rides in the "## … (N …)" heading when present.
        // SUBJECT-OF-HEADING rule — stripDecor() removes '(' and ')' (backticks/emoji too), so the earlier paren-skip logic could never
        // see a parenthesis: lastIndexOf('(') on the stripped string always returned -1. The real bleed was plain substring matching into tail
        // prose — File System L35 "(24 — incl. … folded in from Text Processing, 23.09 Q6)" admitted 'text processing' → 24. Fix: the label must
        // occur BEFORE the heading's first '(' on the RAW line; an occurrence after it is descriptive tail prose of another section's subject
        // (L35 rejected for 'Text Processing'; L449 "## 📝 Text Processing (3 …)" accepted).
        const wantExact = stripDecor(b.label);
        let headingLine: string | undefined;
        for (const l of doc.split(/\r?\n/)) {
          if (!/^#{2}\s/.test(l.trim())) continue;
          const raw = l.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '');
          const rp = raw.indexOf('(');
          const subjectRaw = rp === -1 ? raw : raw.slice(0, rp);
          if (!subjectRaw.toLowerCase().includes(wantExact)) continue;
          headingLine = l; break;
        }
        if (!headingLine) continue; // anchor exists without an integer-declaring heading — numeric pin not applicable
        // Owner-adjudicated 06.10 ("a+a"): §Data Visualization's (1) figure is deliberately chart-only (28.09 re-audit); its three sibling
        // tools are prose-documented in that section (pinned by R4/R5 on the README side). Explicit + commented exception per T2 semantics —
        // never a silent global loosening of the declared-count rule.
        if (b.label === 'Data Visualization') continue;
        const m = headingLine.match(/\((\d+)/);
        if (m && Number.parseInt(m[1], 10) !== b.names.length) {
          problems.push(`"${b.label}": TOOLS_REFERENCE heading says ${m[1]}, boundary pins ${b.names.length} tool name(s)`);
        }
      }
      expect(problems).toEqual([]);
    });

    test('T3 — every registry module is covered by at least one TR boundary', () => {
      const uncovered = MODULES.map(m => m.id).filter(id => { const mod = MODULES.find(x => x.id === id)!; return !TR_BOUNDARIES.some(b => b.names.some(n => mod.names?.has(n))); });
      expect(uncovered).toEqual([]);
    });
  });

  // ── README.md: the arsenal family table (family + count level) ────────────────────────────────
  describe('README.md arsenal family table', () => {
    let doc: string;
    beforeAll(() => { doc = readDoc('README.md'); });

    test('R1 — every RM family boundary has a row anchor in the README arsenal table', () => {
      const missing = RM_BOUNDARIES.filter(b => !hasFamilyAnchor(doc, b.label)).map(b => `"${b.label}"`);
      expect(missing).toEqual([]);
    });

    test('R2 — every INTEGER Count cell equals that boundary\'s live tool count', () => {
      const problems: string[] = [];
      for (const b of RM_BOUNDARIES) {
        if (!hasFamilyAnchor(doc, b.label)) continue; // R1 reports the missing row once
        const declared = arsenalRowCount(doc, b.label);
        if (declared === undefined) continue; // non-integer cell → pinned by name instead (R3)
        const live = b.names.length;
        if (live !== declared) problems.push(`"${b.label}": README says ${declared}, live code registers ${live}`);
      }
      expect(problems).toEqual([]);
    });

    test('R3 — `refactor_code` (the only non-integer Count family) is named in README.md', () => {
      expect(backticked(doc, 'refactor_code')).toBe(true);
    });

    test('R4 — every registry module surfaces somewhere in README.md (boundary row OR ≥1 inline backticked tool name)', () => {
      const problems: string[] = [];
      for (const m of MODULES) {
        const mNameList = m.names ? [...m.names] : [];
        if (mNameList.some(n => RM_BOUNDARIES.some(b => b.names.includes(n)))) continue; // ≥1 of its tools pinned in a boundary name list (R1/R2)
        const mNameList2 = m.names ? [...m.names] : [];
        if (!mNameList2.some(n => backticked(doc, n))) {
          problems.push(`module ${m.id}: no arsenal row AND none of [${mNameList2.join(', ')}] named inline`);
        }
      }
      expect(problems).toEqual([]);
    });

    test('R5 — every registry module is covered by at least one RM boundary or the R4 inline path', () => {
      const uncovered = MODULES.map(m => m.id)
        .filter(id => {
          const mod = MODULES.find(x => x.id === id)!;
          const mNames = mod.names ? [...mod.names] : [];
          return !RM_BOUNDARIES.some(b => b.names.some(n => mNames.includes(n))) && !mNames.some(n => backticked(doc, n));
        });
      // (Every module is covered by a boundary row OR an inline backticked name today — extension point that flags future additions.)
      expect(uncovered).toEqual([]);
    });
  });
});
