/**
 * Setup file for mocking dynamic imports in tests
 */

// Helper to get mock ContextStorageManager
function createMockContextStorageManager() {
  class MockContextStorageManager {}
  MockContextStorageManager.prototype.addEntry = jest.fn().mockResolvedValue(undefined);
  MockContextStorageManager.prototype.getEntries = jest.fn().mockResolvedValue([]);
  MockContextStorageManager.prototype.searchEntries = jest.fn().mockResolvedValue({ entries: [], count: 0 });
  MockContextStorageManager.prototype.deleteEntry = jest.fn().mockResolvedValue(true);
  return MockContextStorageManager;
}

// Override require to intercept contextManagementTools imports
const Module = require("module");
const originalRequire = Module.prototype.require;
const mockCache = new Map();

Module.prototype.require = function(id) {
  if (id.includes("contextManagementTools")) {
    // Return cached mock or create new one
    if (!mockCache.has(id)) {
      mockCache.set(id, { ContextStorageManager: createMockContextStorageManager() });
    }
    return mockCache.get(id);
  }
  return originalRequire.apply(this, arguments);
};
