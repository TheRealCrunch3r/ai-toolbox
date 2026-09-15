/**
 * F1'/G3 fixes — ProjectRegistryManager (contextManagementTools.ts), 11.09.2026:
 *
 * G3   One-time legacy migration: primary registry file MISSING + parseable legacy .session_index.json
 *      present → entries are persisted into the primary on the next read (older builds wrote the legacy
 *      index only; without this their registrations die silently once a primary-writing build boots).
 *      Idempotent: an existing primary is NEVER overwritten by migration.
 * F1'  getRegistryFileStatus()/getRegistryDiagnostics(): self-describing 'missing' | 'empty' |
 *      'has_projects' so an empty list_projects/search_projects result routes the LLM to spec step 2b
 *      ("ask user if NEW project + where it lives, THEN register") instead of guessing paths.
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { ProjectRegistryManager } from '../src/tools/contextManagementTools';

const LEGACY_FORMAT = {
  projects: {
    ai_toolbox: { path: 'C:\\Source Code\\LM Studio Plugins\\ai_toolbox', last_session_saved: 1789084800000, status: 'active' as const },
    troglodyte: { path: 'D:\\Projects\\troglodyte', last_session_saved: 1789000000000, status: 'registered' as const },
  },
  created_at: '2026-09-11T15:01:48.269Z',
  last_updated: '2026-09-11T15:01:48.269Z',
};

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'regtest-'));
}

function writeJson(file: string, obj: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

function readJson<T = unknown>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

interface RegistryDataShape {
  projects: Array<{ name: string; path: string }>;
  lastUpdated: number;
}

describe('ProjectRegistryManager — G3 legacy→primary migration', () => {
  let tmp: string;
  afterEach(() => {
    ProjectRegistryManager._sessionIndexPathOverride = undefined; // hermetic between tests
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('migrates legacy entries into the primary when the primary file is missing', async () => {
    tmp = makeTempDir();
    const registryPath = path.join(tmp, '.session_context', 'project_registry.json');
    const legacyPath = path.join(tmp, '.session_index.json');
    writeJson(legacyPath, LEGACY_FORMAT);

    const mgr = new ProjectRegistryManager(registryPath, legacyPath);
    const projects = await mgr.getAllProjects();

    // Both legacy entries are surfaced…
    const names = projects.map(p => p.name).sort();
    expect(names).toContain('ai_toolbox');
    expect(names).toContain('troglodyte');

    // …and the migration PERSISTED them into the primary file (the actual G3 guarantee)
    expect(fs.existsSync(registryPath)).toBe(true);
    const persisted = readJson<RegistryDataShape>(registryPath);
    const persistedPaths = persisted.projects.map(p => p.path).sort();
    expect(persistedPaths).toContain('C:\\Source Code\\LM Studio Plugins\\ai_toolbox');
    expect(persistedPaths).toContain('D:\\Projects\\troglodyte');

    // A second read still works and the primary now feeds itself (no fallback needed)
    const again = await mgr.getAllProjects();
    expect(again.map(p => p.name).sort()).toEqual(names);
  });

  test('never overwrites an existing primary (idempotent no-op)', async () => {
    tmp = makeTempDir();
    const registryPath = path.join(tmp, '.session_context', 'project_registry.json');
    const legacyPath = path.join(tmp, '.session_index.json');

    writeJson(registryPath, { projects: [{ name: 'existing_primary', path: 'E:\\Primary\\Only', lastAccessed: 1, sessionCount: 0, sourceDirs: [] }], lastUpdated: Date.now() });
    writeJson(legacyPath, LEGACY_FORMAT); // different entries on purpose

    const mgr = new ProjectRegistryManager(registryPath, legacyPath);
    await mgr.getAllProjects(); // would have triggered migration if primary were missing — it is not

    const persisted = readJson<RegistryDataShape>(registryPath);
    expect(persisted.projects).toHaveLength(1);
    expect(persisted.projects[0].name).toBe('existing_primary');
  });

  test('is a no-op when neither file exists', async () => {
    tmp = makeTempDir();
    const registryPath = path.join(tmp, '.session_context', 'project_registry.json');
    const mgr = new ProjectRegistryManager(registryPath, path.join(tmp, '.session_index.json'));

    await expect(mgr.getAllProjects()).resolves.toEqual([]);
    // getAllProjects() may auto-sync from memory files; in this hermetic env none exist → primary stays absent unless a sync wrote it.
    if (fs.existsSync(registryPath)) {
      const persisted = readJson<RegistryDataShape>(registryPath);
      expect(persisted.projects.some(p => p.name === 'ai_toolbox')).toBe(false); // no legacy content leaked in
    }
  });

  test('is a no-op when the legacy index is malformed (non-fatal)', async () => {
    tmp = makeTempDir();
    const registryPath = path.join(tmp, '.session_context', 'project_registry.json');
    fs.mkdirSync(path.dirname(legacyFile()), { recursive: true });
    function legacyFile() { return path.join(tmp, '.session_index.json'); }
    fs.writeFileSync(legacyFile(), '{ this is not valid json !!!');

    const mgr = new ProjectRegistryManager(registryPath, legacyFile());
    await expect(mgr.getAllProjects()).resolves.toEqual([]); // malformed legacy → no entries, no crash
  });
});

describe('ProjectRegistryManager — F1\' self-describing registry status', () => {
  let tmp: string;
  afterEach(() => {
    ProjectRegistryManager._sessionIndexPathOverride = undefined;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test("'missing' when no primary file exists", async () => {
    tmp = makeTempDir();
    const registryPath = path.join(tmp, 'project_registry.json');
    const mgr = new ProjectRegistryManager(registryPath);

    await expect(mgr.getRegistryFileStatus()).resolves.toEqual({ status: 'missing', path: registryPath });

    const diag = await mgr.getRegistryDiagnostics();
    expect(diag.status).toBe('missing');
    // The note is the LLM-facing contract: ask about a NEW project, never guess.
    expect(diag.note).toMatch(/NEW project/i);
    // 🔹 MANAGE (12.09): note now routes to manage_projects(action="register") — register_project is a deprecated alias.
    expect(diag.note).toContain('manage_projects');
  });

  test("'empty' when primary exists with zero projects", async () => {
    tmp = makeTempDir();
    const registryPath = path.join(tmp, 'project_registry.json');
    writeJson(registryPath, { projects: [], lastUpdated: Date.now() });
    const mgr = new ProjectRegistryManager(registryPath);

    await expect(mgr.getRegistryFileStatus()).resolves.toEqual({ status: 'empty', path: registryPath });
    expect((await mgr.getRegistryDiagnostics()).status).toBe('empty');
  });

  test("'has_projects' when primary holds entries", async () => {
    tmp = makeTempDir();
    const registryPath = path.join(tmp, 'project_registry.json');
    writeJson(registryPath, { projects: [{ name: 'x', path: 'E:\\X', lastAccessed: 1 }], lastUpdated: Date.now() });
    const mgr = new ProjectRegistryManager(registryPath);

    await expect(mgr.getRegistryFileStatus()).resolves.toEqual({ status: 'has_projects', path: registryPath });
    // has_projects carries no note (nothing to explain)
    expect((await mgr.getRegistryDiagnostics()).note).toBeUndefined();
  });
});
