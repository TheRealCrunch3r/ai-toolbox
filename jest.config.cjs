/**
 * Jest configuration for AI Toolbox plugin tests
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  // Handle NodeNext .js import extensions
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Mock ESM-only packages that ts-jest can't handle
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
