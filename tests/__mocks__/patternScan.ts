/** Manual mock for patternScan — keeps unrelated suites from loading the real scanner.
 *  Convention: same-dir .js imports from src/tools/ map to __mocks__/ stubs (see jest.config.cjs; RC#4 class).
 *  The REAL module is exercised directly by tests/patternScan.test.ts via the '../src/' mapper. */

import type { PatternScanOptions, PatternScanResult } from '../../src/tools/patternScan';

const EMPTY_RESULT: PatternScanResult = Object.freeze({
  ok: true,
  matches: [],
  skipped: [],
  excludedDirs: [],
  stats: Object.freeze({ filesScanned: 0, totalMatches: 0, durationMs: 0, truncated: false }),
});

export async function patternScan(_options: PatternScanOptions): Promise<PatternScanResult> {
  return EMPTY_RESULT;
}

export default patternScan;
