/**
 * Jest configuration for AI Toolbox plugin tests
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
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

    // ── Tool modules imported statically by other src files (../foo.js → ../foo.ts) ──
    '^\\.\\./security\\.js$': '<rootDir>/src/security.ts',
    '^\\.\\./config\\.js$': '<rootDir>/src/config.ts',
    '^\\.\\./workingDir\\.js$': '<rootDir>/src/workingDir.ts',
    '^\\.\\./performanceUtils\\.js$': '<rootDir>/src/performanceUtils.ts',
    '^\\.\\./fuzzySearch\\.js$': '<rootDir>/src/fuzzySearch.ts',

    // ── Direct relative .js imports from within src/ (e.g., ./config.js → src/config) ──
    '^\\.\\/config\\.js$': '<rootDir>/src/config.ts',
    '^\\.\\/security\\.js$': '<rootDir>/src/security.ts',
    '^\\.\\/workingDir\\.js$': '<rootDir>/src/workingDir.ts',
    '^\\.\\/performanceUtils\\.js$': '<rootDir>/src/performanceUtils.ts',
    '^\\.\\/fuzzySearch\\.js$': '<rootDir>/src/fuzzySearch.ts',
    '^\\.\\/stateManager\\.js$': '<rootDir>/src/stateManager.ts',
    '^\\.\\/backgroundCommands\\.js$': '<rootDir>/src/backgroundCommands.ts',
    '^\\.\\/toolsSchemaMinifier\\.js$': '<rootDir>/src/toolsSchemaMinifier.ts',

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
    '^\\.\\/tools/lineOperations\\.js$': '<rootDir>/tests/__mocks__/lineOperations.ts',
    '^\\.\\/tools/backupTools\\.js$': '<rootDir>/tests/__mocks__/backupTools.ts',
    '^\\.\\/tools/executionTools\\.js$': '<rootDir>/tests/__mocks__/executionTools.ts',
    '^\\.\\/tools/utilityTools\\.js$': '<rootDir>/tests/__mocks__/utilityTools.ts',

    // ── Fallback: catch any other ./tools/*.js dynamic imports not explicitly mapped ──
    '^\\.\\/tools/(.*)\\.js$': '<rootDir>/tests/__mocks__/$1.ts',

    // ── Same-directory .js imports from src/tools/ (e.g., fileModTracker.js) ──
    '^\\.\\/fileModTracker\\.js$': '<rootDir>/tests/__mocks__/fileModTracker.ts',
    '^\\.\\/restoreFromBak\\.js$': '<rootDir>/tests/__mocks__/restoreFromBak.ts',

    // ── Context tier system (v1.9.6) ──
    '^\\.\\/contextTiers\\.js$': '<rootDir>/src/contextTiers.ts',

    // ── Source file .js rewrites for utils/ directory ──
    '^\\.\\./utils/hubExclusionClustering\\.js$': '<rootDir>/src/utils/hubExclusionClustering.ts',

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
