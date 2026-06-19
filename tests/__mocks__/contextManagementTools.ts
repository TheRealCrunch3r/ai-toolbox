/**
 * Manual mock for contextManagementTools — replaces dynamic import() 
 * that fails in CommonJS test environment.
 */

export class ContextStorageManager {
  addEntry = jest.fn().mockResolvedValue(undefined);
  getEntries = jest.fn().mockResolvedValue([]);
  searchEntries = jest.fn().mockResolvedValue({ entries: [], count: 0 });
  deleteEntry = jest.fn().mockResolvedValue(true);
}

/** Mock function for registerContextManagementTools - returns empty tool array */
export function registerContextManagementTools(_config) {
  return []; // Return empty array of tools
}
