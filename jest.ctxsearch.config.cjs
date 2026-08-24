/**
 * TEMPORARY scoped config for in-process runs of tests/contextSearch.test.ts only.
 * Based on jest.fulltest.config.cjs (which itself strips globalTeardown/detectOpenHandles/
 * forceExit from the base jest.config.cjs and sets silent:true), restricting testMatch
 * to the contextSearch suite.
 *
 * IMPORTANT for runCLI usage: this file MUST exist at resolution time, because with an
 * explicit --config argument jest-config resolves it directly (no fallback discovery).
 * Delete after use per repo convention.
 */
const base = require('./jest.fulltest.config.cjs');

// 🔹 FIX #17 (19.08.2026): pin the reporter explicitly — inherited from
// jest.fulltest.config.cjs above, but stated here as well so scoped runs stay
// deterministic even if that file is later edited. See FIX #17 comment there (RC#2).
// 🔹 FIX #17b v2 (19.08.2026 ~20:50): scoping via testMatch was a NO-OP — @jest/core@30 feeds
// testMatch globs the RAW absolute file path; micromatch normalizes '\', so '**/tests/x' matches
// every suite (all live under <root>\tests\) → run 20:36 ran all 536 tests while "scoped".
// testPathIgnorePatterns is joined into ONE RegExp and tested against the SAME raw path with NO
// normalization — v1's forward-slash '/tests/...' could never match a backslash Windows path
// (empirically: ignored 0 of 27). v2 escapes the absolute root for regex + ignores every test file
// whose basename is not contextSearch.test.ts. Verified in-sandbox against all 27 real paths:
// exactly 26 ignored, contextSearch kept.
module.exports = { ...base, testMatch: ['**/*.test.ts'], // v3 CORRECTION (~21:05): @jest/core@30 tests testPathIgnorePatterns against the path RELATIVE TO
// rootDir with NATIVE separators — on Windows that is 'tests\\x.test.ts'. The absolute-anchored v2
// could never match a relative path (gate run 21:00 re-ran all suites), and the unanchored forward-slash
// v1 could never match backslash segments. Final form matches the RELATIVE shape directly (no anchoring,
// native separators). Verified in-sandbox against all 27 real relative paths: exactly 26 ignored,
// contextSearch kept; .bak files and non-.test.ts names cannot match (.test\.ts$ + lookahead chain).
testPathIgnorePatterns: ['tests\\\\((?!contextSearch)[^\\\\]*?)\\.test\\.ts'], reporters: [['default', {}]] };
