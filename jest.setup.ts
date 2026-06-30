/**
 * Jest setup file — intercepts dynamic import() calls so Jest can mock them
 * without requiring --experimental-vm-modules.
 *
 * Jest's moduleNameMapper only intercepts static import() statements.
 * Dynamic imports (import('./tools/xxx.js')) bypass the mapper and are
 * executed by Node.js's module system, which requires the flag.
 *
 * This file uses jest.mock() with factory functions to replace every
 * dynamic tool module with a mock that returns an empty tool array.
 *
 * IMPORTANT: This file must be listed in the `setupFilesAfterEnv` array
 * of jest.config.cjs so Jest runs it before each test file.
 */

// ── Dynamically loaded tool modules (mapped from toolsProvider.ts) ──
jest.mock('../src/tools/fileSystemTools.js', () => ({
  registerFileSystemTools: jest.fn(() => []),
}));

jest.mock('../src/tools/webResearchTools.js', () => ({
  registerWebResearchTools: jest.fn(() => []),
}));

jest.mock('../src/tools/browserAutomationTools.js', () => ({
  registerBrowserTools: jest.fn(() => []),
}));

jest.mock('../src/tools/gitGithubTools.js', () => ({
  registerGitTools: jest.fn(() => []),
}));

jest.mock('../src/tools/databaseTools.js', () => ({
  registerDatabaseTools: jest.fn(() => []),
}));

jest.mock('../src/tools/documentTools.js', () => ({
  registerDocumentTools: jest.fn(() => []),
}));

jest.mock('../src/tools/backgroundCommandTools.js', () => ({
  registerBackgroundCommandTools: jest.fn((_c, _b) => []),
}));

jest.mock('../src/tools/imageProcessingTools.js', () => ({
  registerImageProcessingTools: jest.fn(() => []),
}));

jest.mock('../src/tools/httpClientTools.js', () => ({
  registerHttpClientTools: jest.fn(() => []),
}));

jest.mock('../src/tools/vectorRagTools.js', () => ({
  registerRagTools: jest.fn(() => []),
}));

jest.mock('../src/tools/textProcessingTools.js', () => ({
  registerTextProcessingTools: jest.fn(() => []),
}));

jest.mock('../src/tools/uiGenerationTools.js', () => ({
  registerUiGenerationTools: jest.fn(() => []),
}));

jest.mock('../src/tools/contextManagementTools.js', () => ({
  registerContextManagementTools: jest.fn(() => []),
}));

jest.mock('../src/tools/markdownPreviewTools.js', () => ({
  registerMarkdownPreviewTools: jest.fn(() => []),
}));

jest.mock('../src/tools/refactorCodeTools.js', () => ({
  registerRefactorCodeTools: jest.fn(() => []),
}));

// ── Always-loaded tool modules ──
jest.mock('../src/tools/lineOperations.js', () => ({
  registerLineOperationsTools: jest.fn(() => []),
}));

jest.mock('../src/tools/backupTools.js', () => ({
  registerBackupTools: jest.fn(() => []),
}));

jest.mock('../src/tools/executionTools.js', () => ({
  registerExecutionTools: jest.fn(() => []),
}));

jest.mock('../src/tools/utilityTools.js', () => ({
  registerUtilityTools: jest.fn(() => []),
}));
