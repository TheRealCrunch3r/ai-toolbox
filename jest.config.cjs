/**
 * Jest configuration for AI Toolbox plugin tests
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transformIgnorePatterns: ['node_modules/'],
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  // Handle NodeNext .js import extensions and resolve dynamic imports to mocks
  moduleNameMapper: {
    // Project source files with explicit .js extension (NodeNext style)
    '^(\.{1,2}/src/.*)\.js$': '<rootDir>/src/$1',
    '^(\.{1,2}/tests/.*)\.js$': '<rootDir>/tests/$1',
    // Explicit mappings for relative imports from src/tools/ (../file.js -> src/file.ts)
    '^\.\./security\.js$': '<rootDir>/src/security.ts',
    '^\.\./config\.js$': '<rootDir>/src/config.ts',
    '^\.\./workingDir\.js$': '<rootDir>/src/workingDir.ts',
    '^\.\./performanceUtils\.js$': '<rootDir>/src/performanceUtils.ts',
    '^\.\./fuzzySearch\.js$': '<rootDir>/src/fuzzySearch.ts',
    // Map ContextStorageManager module directly to mock (catch-all for any path ending with this)
    '.*/tools/contextManagementTools\.js$': '<rootDir>/tests/__mocks__/contextManagementTools.ts',
    '.*contextManagementTools\.js$': '<rootDir>/tests/__mocks__/contextManagementTools.ts',  
    // Mock ESM-only packages
    '^archiver$': '<rootDir>/tests/__mocks__/archiver.ts',
    '^unzipper$': '<rootDir>/tests/__mocks__/unzipper.ts',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
};
