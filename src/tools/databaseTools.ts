import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '../config.js';
import { validateSQLQuery } from '../security.js';

// Lazy-load node:sqlite (Node.js 23+). Graceful fallback for older Node versions.
let sqliteModule: typeof import('node:sqlite') | null = null;
let sqliteLoadError: string | null = null;

async function getSqlite(): Promise<typeof import('node:sqlite')> {
  if (sqliteModule) return sqliteModule;
  if (sqliteLoadError) throw new Error(sqliteLoadError);

  try {
    sqliteModule = await import('node:sqlite');
    return sqliteModule;
  } catch (err) {
    sqliteLoadError = err instanceof Error ? err.message : String(err);
    throw new Error(
      `SQLite is not available (node:sqlite requires Node.js 23+). ` +
      `Original error: ${sqliteLoadError}. ` +
      `Please disable database queries in plugin settings or upgrade Node.`
    );
  }
}

/** Reset sqlite module cache (for testing) */
export function resetSqliteCache(): void {
  sqliteModule = null;
  sqliteLoadError = null;
}

/** Typed params interface */
interface QueryDatabaseParams {
  query: string;
  db_path?: string;
}

export function registerDatabaseTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // query_database tool — C7 FIX: Added optional db_path parameter
  tools.push(tool({
    name: 'query_database',
    description: 'Run read-only SQLite queries. Defaults to in-memory database; optionally specify a file path.',
    parameters: {
      query: z.string().describe('SQL query string (read-only only)'),
      db_path: z.string().optional().default(':memory:').describe('Path to the SQLite database file (default: :memory:)'),
    },
    implementation: async ({ query, db_path }: QueryDatabaseParams) => { // C5 FIX: typed params
      try {
        // Security check - use robust SQL validation instead of simple regex matching
        const validated = validateSQLQuery(query);
        if (!validated.valid) {
          return { success: false, error: `Unsafe SQL query detected: ${validated.reason}` };
        }

        // Lazy-load node:sqlite with graceful fallback
        const { open } = await getSqlite();
        const db = open(db_path || ':memory:');

        try {
          const stmt = db.prepare(query);
          const results = stmt.all();
          return { success: true, data: { query, results } };
        } finally {
          db.close();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Database query failed: ${message}` };
      }
    },
  }));

  return tools;
}
