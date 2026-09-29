

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // 🔹 REPO-STORE GUARD (20.09 PM): under jest, THROW on any fs/promises write/rename/mkdir/unlink/rm targeting
  // this repo's own live store (<rootDir>/.session_context) — the 19:20–19:24 clobber incident proved a single
  // unpinned manager in one suite destroys the plugin's real memory file. MUST be setupFiles (runs BEFORE each
  // test file's imports) so its fs/promises require-hook wraps every non-mocked resolution per registry.
  setupFiles: ['<rootDir>/tests/jestRepoStoreGuard.ts'],
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // grep_files_size_limit.test.ts has been converted to Jest-compatible format (19.08.2026)
  maxWorkers: 1, // Prevent OOM — lazy loading 13+ tool modules (up to 76KB) across parallel workers exhausts V8 heap during ts-jest compilation

  transformIgnorePatterns: ['node_modules/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  moduleNameMapper: {
    // ── Source file .js rewrites (NodeNext style — keep for static imports) ──
    '^\\.\\./src/(.*)\\.js$': '<rootDir>/src/$1',
    '^\\.\\./tests/(.*)\\.js$': '<rootDir>/tests/$1',

    // ── executedTool transparency suite (01.09.2026): the test file imports its probe stub via
    // './__mocks__/markdownPreviewTools.js' — same RC#4 class as above (explicit .js-suffixed relative
    // import with no mapper entry → "Cannot find module"). Target MUST equal the tools-fallback target
    // so both requests resolve to ONE registry ID and jest.mock in the suite intercepts it ──
    '^\\.\\/__mocks__/markdownPreviewTools\\.js$': '<rootDir>/tests/__mocks__/markdownPreviewTools.ts',

    // ── Tool modules imported statically by other src files (../foo.js → ../foo.ts) ──
    '^\\.\\./security\\.js$': '<rootDir>/src/security.ts',
    '^\\.\\./config\\.js$': '<rootDir>/src/config.ts',
    // REG-MOVE (12.09): src/tools/contextManagementTools.ts imports '../dataDir.js' — same RC#4 class.
    // 🔹 FIX #30 (12.09): original insertion was double-escaped ('^\\.\\../…') → matched NEITHER form;
    // de-dotted to the working sibling style '^\.\./…' (byte-verified via require+RegExp against both specs).
    '^\\.\\./dataDir\\.js$': '<rootDir>/src/dataDir.ts',

    '^\\.\\./workingDir\\.js$': '<rootDir>/src/workingDir.ts',
    '^\\.\\./performanceUtils\\.js$': '<rootDir>/src/performanceUtils.ts',
    '^\\.\\./fuzzySearch\\.js$': '<rootDir>/src/fuzzySearch.ts',

    // ── Direct relative .js imports from within src/ (e.g., ./config.js → src/config) ──
    '^\\.\\/config\\.js$': '<rootDir>/src/config.ts',
    '^\\.\\/security\\.js$': '<rootDir>/src/security.ts',
    '^\\.\\/workingDir\\.js$': '<rootDir>/src/workingDir.ts',
    '^\\.\\/performanceUtils\\.js$': '<rootDir>/src/performanceUtils.ts',
    '^\\.\\/fuzzySearch\\.js$': '<rootDir>/src/fuzzySearch.ts',
    // REG-MOVE (12.09): src/workingDir.ts imports './dataDir.js' — same RC#4 class; per-file form only (G9 round-2)
    '^\\.\\/dataDir\\.js$': '<rootDir>/src/dataDir.ts',

    '^\\.\\/stateManager\\.js$': '<rootDir>/src/stateManager.ts',
    '^\\.\\/backgroundCommands\\.js$': '<rootDir>/src/backgroundCommands.ts',
    '^\\.\\/toolsSchemaMinifier\\.js$': '<rootDir>/src/toolsSchemaMinifier.ts',

    // ── Tool-definition overhead accounting (token-consolidation 21.08.2026; same RC#4 class as FIX #19 contextTiers:
    // new .js-suffixed import without mapper entry -> "Cannot find module" in 3 suites) ──
    '^\\.\\/toolOverhead\\.js$': '<rootDir>/src/toolOverhead.ts',

    // ── FIX #20 (23.08.2026): tokenStatsManager imports './lmStudioApi.js' — first test suite to load this chain
    // (fix20_midloop_token_counting.test.ts); same RC#4 class as the entries above ──
    '^\\.\\/lmStudioApi\\.js$': '<rootDir>/src/lmStudioApi.ts',

    // ── FIX #20 (23.08.2026, 2nd wave): toolsProvider.ts now STATICALLY imports './autoTracker.js' +
    // './tokenStatsManager.js' for the mid-loop wrapper — first suite to load them is toolsProvider.test.ts;
    // same RC#4 class (new .js-suffixed static import without mapper entry → "Cannot find module") ──
    '^\\.\\/autoTracker\\.js$': '<rootDir>/src/autoTracker.ts',
    '^\\.\\/tokenStatsManager\\.js$': '<rootDir>/src/tokenStatsManager.ts',


    // ── Tool modules dynamically imported by toolsProvider.ts via import('./tools/xxx.js') ──
    // These are resolved relative to <rootDir>/src/, so the path is './tools/xxx.js'
    // We redirect each one to a manual mock in __mocks__/ that returns empty tool arrays.
    '^\\.\\/tools/fileSystemTools\\.js$': '<rootDir>/tests/__mocks__/fileSystemTools.ts',
    '^\\.\\/tools/webResearchTools\\.js$': '<rootDir>/tests/__mocks__/webResearchTools.ts',
    '^\\.\\/tools/browserAutomationTools\\.js$': '<rootDir>/tests/__mocks__/browserAutomationTools.ts',
    '^\\.\\/tools/gitGithubTools\\.js$': '<rootDir>/tests/__mocks__/gitGithubTools.ts',
    '^\\.\\/tools/databaseTools\\.js$': '<rootDir>/tests/__mocks__/databaseTools.ts',
    '^\\.\\/tools/documentTools\\.js$': '<rootDir>/tests/__mocks__/documentTools.ts',
    '^\\.\\/tools/backgroundCommandTools\\.js$': '<rootDir>/tests/__mocks__/backgroundCommandTools.ts',
    '^\\.\\/tools/imageProcessingTools\\.js$': '<rootDir>/tests/__mocks__/imageProcessingTools.ts',
    '^\\.\\/tools/httpClientTools\\.js$': '<rootDir>/tests/__mocks__/httpClientTools.ts',
    '^\\.\\/tools/vectorRagTools\\.js$': '<rootDir>/tests/__mocks__/vectorRagTools.ts',
    '^\\.\\/tools/textProcessingTools\\.js$': '<rootDir>/tests/__mocks__/textProcessingTools.ts',
    '^\\.\\/tools/contextManagementTools\\.js$': '<rootDir>/tests/__mocks__/contextManagementTools.ts',
    '^\\.\\/tools/uiGenerationTools\\.js$': '<rootDir>/tests/__mocks__/uiGenerationTools.ts',

    // ── Always-loaded tool modules (no config toggle) ──
    '^\\.\\/tools/backupTools\\.js$': '<rootDir>/tests/__mocks__/backupTools.ts',
    '^\\.\\/tools/executionTools\\.js$': '<rootDir>/tests/__mocks__/executionTools.ts',

    // CLUSTER-ORDER fix 19.09: src/toolsProvider.ts statically imports './tools/toolPriority.js'; declared BEFORE the tools-fallback below because in jest-resolve (v30) the FIRST matching mapper wins, and no tests/__mocks__/toolPriority.ts exists - must resolve to the real src module
    '^\\.\\/tools/toolPriority\\.js$': '<rootDir>/src/tools/toolPriority.ts',
    // REPEAT-TOOL-REMINDER (25.09): toolsProvider imports './tools/repeatToolReminderTools.js' – must resolve to real src, not mock fallback
    '^\\.\\/tools/repeatToolReminderTools\\.js$': '<rootDir>/src/tools/repeatToolReminderTools.ts',
    // RESTORE-SESSION-CONTEXT (25.09): toolsProvider statically imports './tools/restoreSessionContextTool.js' — same RC#4 class as repeatToolReminder; real src (module is read-only, no mock needed)
    '^\\./tools/restoreSessionContextTool\\.js$': '<rootDir>/src/tools/restoreSessionContextTool.ts',
    // RESTORE-SESSION-CONTEXT (25.09): FIRST tools→tools sibling import in the codebase ('./contextManagementTools.js' / './taskPlanningTools.js' from within src/tools/). Exact per-file single-dot entries only — G9 round-2 rule: never a generic single-dot form (would hijack unrelated specifiers). Emitters verified unique via grep 25.09; real-src targets because the mock stubs export ONLY register functions, not the classes my module imports.
    '^\\./contextManagementTools\\.js$': '<rootDir>/src/tools/contextManagementTools.ts',
    '^\\./taskPlanningTools\\.js$': '<rootDir>/src/tools/taskPlanningTools.ts',

    // ── Fallback: catch any other ./tools/*.js dynamic imports not explicitly mapped ──
    '^\\.\\/tools/(.*)\\.js$': '<rootDir>/tests/__mocks__/$1.ts',

    // ── Same-directory .js imports from src/tools/ (e.g., fileModTracker.js) ──
    '^\\.\\/fileModTracker\\.js$': '<rootDir>/tests/__mocks__/fileModTracker.ts',
    '^\\.\\/restoreFromBak\\.js$': '<rootDir>/tests/__mocks__/restoreFromBak.ts',
    // pattern_scan wiring (30.08): fileSystemTools.ts imports './patternScan.js' - same RC#4 class; single-dot form is NOT caught by the tools-fallback mapper, so it needs its own entry (mock stub keeps unrelated suites isolated)
    '^\\./patternScan\\.js$': '<rootDir>/tests/__mocks__/patternScan.ts',


    // ── Context tier system (v1.9.5; FIX #18 19.08.2026: regex matched "./x.js" but the importer is src/tools/*, whose specifier is "../contextTiers.js" — off-by-one dot made the mapping dead code → "Cannot find module '../contextTiers.js'" crashed contextSearch suite (RC#3)) ──
    '^\\.\\./contextTiers\\.js$': '<rootDir>/src/contextTiers.ts',

    // ── FIX #19 (19.08.2026): single-dot same-dir form — src/stateManager.ts imports './contextTiers.js'; no mapper entry existed → "Cannot find module './contextTiers.js'" crashed 4 suites (RC#4) ──
    '^\\./contextTiers\\.js$': '<rootDir>/src/contextTiers.ts',

    // ── D-LOST-WRITE fix (21.09): src/tools/contextManagementTools.ts imports '../sharedFileLock.js' — same RC#4 class as the entries above
    // (new .js-suffixed relative import without a mapper entry → "Cannot find module"). stateManager's extensionless './sharedFileLock' form
    // resolves via ts-jest moduleFileExtensions and needs no entry. ──
    '^\\.\\./sharedFileLock\\.js$': '<rootDir>/src/sharedFileLock.ts',

    // ── Source file .js rewrites for utils/ directory — PER-FILE entries only (NOT generic).
    // G9 round-2 regression (01.09.2026): the generic rule installed in round 1 ('^\\.\\./utils/(.*)\\.js$') matched ANY
    // '../utils/<name>.js' specifier anywhere in the module graph — including inside node_modules: @babel/types@7.29.7 ships CJS with
    // .js-suffixed relative requires (lib/validators/is.js → require('../utils/shallowEqual.js')); the rule hijacked that to a nonexistent
    // <rootDir>/src/utils/<name> → createNoMappedModuleFoundError in every suite transitively loading @babel/* (refactorCodeTools).
    // moduleNameMapper has no origin filter, so exact per-file entries are the only safe form. Set = pre-G9 rollback-point entries + ripgrepEngine
    // (the actual G9 need: src/tools/fileSystemTools.ts imports '../utils/ripgrepEngine.js').
    '^\\.\\./utils/hubExclusionClustering\\.js$': '<rootDir>/src/utils/hubExclusionClustering.ts',
    // FIX-DEBLOAT (04.09): src/tools/fileSystemTools.ts imports '../utils/grepGuard.js' — same RC#4 class as the entries above; per-file form only (G9 round-2: generic rule hijacks node_modules requires)
    '^\\.\\./utils/grepGuard\\.js$': '<rootDir>/src/utils/grepGuard.ts',
    // C compaction family (24.09): SINGLE-DOT .js import forms — promptPreprocessor.ts './utils/toolPayload{Compaction,Storage}.js' and toolPayloadStorage.ts internal './toolPayloadCompaction.js'; same RC#4 class as the patternScan entry above. (The two-dot '../utils/…' variants that preceded this block were removed 24.09 after a full import-site audit found zero emitters — tests use extensionless '../src/utils/…' specifiers, which need no mapper.)
    '^\\./utils/toolPayloadCompaction\\.js$': '<rootDir>/src/utils/toolPayloadCompaction.ts',
    '^\\./utils/toolPayloadStorage\\.js$': '<rootDir>/src/utils/toolPayloadStorage.ts',
    '^\\./utils/toolPayloadSpill\\.js$': '<rootDir>/src/utils/toolPayloadSpill.ts',
    '^\\./toolPayloadCompaction\\.js$': '<rootDir>/src/utils/toolPayloadCompaction.ts',
'^\\./toolPayloadStorage\\.js$': '<rootDir>/src/utils/toolPayloadStorage.ts',
    // ITEM-B (05.09): src/tools/fileSystemTools.ts + src/tools/patternScan.ts import '../utils/regexWorker.js' — same RC#4 class as grepGuard above; per-file form only (G9 round-2)
    '^\\.\\./utils/regexWorker\\.js$': '<rootDir>/src/utils/regexWorker.ts',
    '^\\.\\./utils/atomicWrite\\.js$': '<rootDir>/src/utils/atomicWrite.ts',
    '^\\.\\./utils/ripgrepEngine\\.js$': '<rootDir>/src/utils/ripgrepEngine.ts',
    // CLUSTER-ORDER fix 19.09: src/toolsProvider.ts statically imports './utils/hubExclusionClustering.js' - no mapper entry (RC#4 class); per-file form only (G9 round-2)
    '^\\./utils/hubExclusionClustering\\.js$': '<rootDir>/src/utils/hubExclusionClustering.ts',

    // PIPELINE-D (25.09): src/toolsProvider.ts statically imports './utils/withPipeline.js' for resetToolGuard - same RC#4 class as the hubExclusionClustering entry above; per-file form only (G9 round-2)
    '^\\./utils/withPipeline\\.js$': '<rootDir>/src/utils/withPipeline.ts',
    // REPEAT-TOOL-REMINDER (25.09): src/toolsProvider.ts statically imports './utils/repeatToolReminder.js' — same RC#4 class as withPipeline
    '^\\./utils/repeatToolReminder\\.js$': '<rootDir>/src/utils/repeatToolReminder.ts',
    '^\\.\\./utils/repeatToolReminder\\.js$': '<rootDir>/src/utils/repeatToolReminder.ts',
    // ── Package-level mock redirects (ESM-only deps) ──
    '^archiver$': '<rootDir>/tests/__mocks__/archiver.ts',
    '^unzipper$': '<rootDir>/tests/__mocks__/unzipper.ts',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
  globalTeardown: '<rootDir>/jest.global-teardown.js',
  forceExit: true,
  detectOpenHandles: true,
};
