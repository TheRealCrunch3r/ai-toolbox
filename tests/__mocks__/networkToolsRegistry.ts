/**
 * Mock for networkToolsRegistry — returns empty tool array for tests.
 * Consolidated from httpClientTools + webResearchTools mocks (2026-08-01).
 */

export function registerNetworkTools(_config: unknown) {
  return [];
}
