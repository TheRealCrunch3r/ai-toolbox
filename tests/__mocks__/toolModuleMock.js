/**
 * Generic mock factory for dynamically imported tool modules.
 * 
 * This is used by jest.config.cjs moduleNameMapper to intercept dynamic imports like:
 *   import('./tools/fileSystemTools.js')  → returns { registerFileSystemTools }
 *   import('./tools/webResearchTools.js') → returns { registerWebResearchTools }
 *   ...etc...
 */

const toolRegistrars = {
  fileSystemTools:          (c) => [],
  webResearchTools:         (c) => [],
  browserAutomationTools:   (c) => [],
  gitGithubTools:           (c) => [],
  databaseTools:            (c) => [],
  documentTools:            (c) => [],
  backgroundCommandTools:   (c, b) => [],
  imageProcessingTools:     (c) => [],
  httpClientTools:          (c) => [],
  vectorRagTools:           (c) => [],
  textProcessingTools:      (c) => [],
  uiGenerationTools:        (c) => [],
  contextManagementTools:   (c) => [],
  executionTools:           (c) => [],
};

/**
 * Determine which tool module was requested based on the path.
 * Called from toolsProvider.ts via dynamic import('./tools/xxx.js')
 */
function getModuleName(importPath) {
  // Handle paths like './tools/fileSystemTools.js' or '../src/tools/fileSystemTools.js'
  const match = importPath.match(/([a-zA-Z]+Tools)\.js$/);
  if (match) return match[1];
  
  // Fallback: try known names
  const keys = Object.keys(toolRegistrars);
  for (const key of keys) {
    if (importPath.includes(key)) return key;
  }
  return 'fileSystemTools'; // default fallback
}

// Create the appropriate mock object with the correct function name
function getMockObject(importPath) {
  const moduleName = getModuleName(importPath);
  
  switch (moduleName) {
    case 'fileSystemTools':           return { registerFileSystemTools: toolRegistrars.fileSystemTools };
    case 'webResearchTools':          return { registerWebResearchTools: toolRegistrars.webResearchTools };
    case 'browserAutomationTools':    return { registerBrowserTools: toolRegistrars.browserAutomationTools };
    case 'gitGithubTools':            return { registerGitTools: toolRegistrars.gitGithubTools };
    case 'databaseTools':             return { registerDatabaseTools: toolRegistrars.databaseTools };
    case 'documentTools':             return { registerDocumentTools: toolRegistrars.documentTools };
    case 'backgroundCommandTools':    return { registerBackgroundCommandTools: toolRegistrars.backgroundCommandTools };
    case 'imageProcessingTools':      return { registerImageProcessingTools: toolRegistrars.imageProcessingTools };
    case 'httpClientTools':           return { registerHttpClientTools: toolRegistrars.httpClientTools };
    case 'vectorRagTools':            return { registerRagTools: toolRegistrars.vectorRagTools };
    case 'textProcessingTools':       return { registerTextProcessingTools: toolRegistrars.textProcessingTools };
    case 'uiGenerationTools':         return { registerUiGenerationTools: toolRegistrars.uiGenerationTools };
    case 'contextManagementTools':    return { registerContextManagementTools: toolRegistrars.contextManagementTools };
    case 'executionTools':            return { registerExecutionTools: toolRegistrars.executionTools };
    default:                          return {};
  }
}

// This file is used as a dynamic import mock — we need to return different objects depending on caller.
// Unfortunately, Jest doesn't support "dynamic factories" natively in moduleNameMapper, so we use this 
// approach: the module exports getMockObject which can be called at runtime with the original path.
export { toolRegistrars, getModuleName, getMockObject };

// Default export will satisfy TypeScript and prevent module resolution errors during ts-jest transform.
// Actual mocking happens via jest.mock() factory or moduleNameMapper redirect in the test file.
