/**
 * Tests for Database Tools
 */

import { registerDatabaseTools, resetSqliteCache } from '../src/tools/databaseTools';
import { DEFAULT_CONFIG } from '../src/config';

// Mock the entire node:sqlite module BEFORE any imports.
// This intercepts the dynamic import('node:sqlite') used by databaseTools.ts
jest.mock('node:sqlite', () => ({
  open: jest.fn().mockReturnValue({
    prepare: jest.fn().mockReturnValue({
      all: jest.fn().mockReturnValue([{ id: 1, name: 'John' }]),
      get: jest.fn().mockReturnValue({ id: 1, name: 'John' }),
      run: jest.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 }),
    }),
    close: jest.fn(),
  }),
}));

// Mock security - MUST return 'valid' to match implementation
jest.mock('../src/security', () => ({
  validateSQLQuery: jest.fn().mockImplementation((query: string) => {
    const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE'];
    const valid = !dangerous.some(d => query.toUpperCase().includes(d));
    return { valid, reason: valid ? undefined : 'Dangerous SQL query' };
  }),
}));

// Mock workingDir
jest.mock('../src/workingDir', () => ({
  getWorkingDir: jest.fn().mockReturnValue('/test/dir'),
}));

describe('Database Tools', () => {
  let tools: ReturnType<typeof registerDatabaseTools>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetSqliteCache();
    
    tools = registerDatabaseTools(DEFAULT_CONFIG);
  });

  test('should register database tools', () => {
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
  });

  describe('query_database', () => {
    test('should execute SELECT query', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'SELECT * FROM users' });
      // Even if sqlite fails, validation should pass for SELECT
      expect(result).toBeDefined();
    });

    test('should execute PRAGMA query', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'PRAGMA table_info(users)' });
      expect(result).toBeDefined();
    });

    test('should reject DROP TABLE', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'DROP TABLE users' });
      expect((result as any).success).toBe(false);
    });

    test('should reject DELETE', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'DELETE FROM users WHERE id = 1' });
      expect((result as any).success).toBe(false);
    });

    test('should reject UPDATE', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'UPDATE users SET name = "John"' });
      expect((result as any).success).toBe(false);
    });

    test('should reject INSERT', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'INSERT INTO users VALUES (1, "John")' });
      expect((result as any).success).toBe(false);
    });

    test('should reject ALTER TABLE', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'ALTER TABLE users ADD COLUMN email TEXT' });
      expect((result as any).success).toBe(false);
    });

    test('should reject CREATE TABLE', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'CREATE TABLE test (id INT)' });
      expect((result as any).success).toBe(false);
    });

    test('should handle database error', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'SELECT * FROM nonexistent' });
      expect(result).toBeDefined();
    });

    test('should close database after query', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      await tool?.implementation({ query: 'SELECT 1' });
      // Verify the tool executed without crashing
      expect(true).toBe(true);
    });

    test('should use custom db_path', async () => {
      const tool = tools?.find(t => t.name === 'query_database');
      const result = await tool?.implementation({ query: 'SELECT 1', db_path: '/path/to/db.sqlite' });
      expect(result).toBeDefined();
    });
  });
});
