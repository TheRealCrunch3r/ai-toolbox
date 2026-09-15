/**
 * MANAGE feature — ProjectRegistryManager (contextManagementTools.ts), 12.09.2026:
 *
 * Option B remodel of register_project into manage_projects (actions: register | unregister | update | clear_all).
 * Manager-level guarantees under test here (tool wiring is a thin delegation to these methods):
 *
 * unregisterProject() Removes an entry by canonical working-dir path (F1 pattern) and records the path in the
 *                     bounded `unregistered` tombstone list, so _syncFromSessionMemory() cannot resurrect it
 *                     from stale cross-stamped session-memory entries.
 * updateProject()     Renames / replaces sourceDirs for an EXISTING registration only — never creates entries.
 * registerProject()   Clears any tombstone for the same canonical path (explicit re-registration wins over a prior removal).
 * clearAll()          Wipes all projects but PRESERVES tombstones (a full wipe must not resurrect everything in one sweep).
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { encode } from '@msgpack/msgpack';

import { ProjectRegistryManager } from '../src/tools/contextManagementTools';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'managetest-'));
}

interface RegistryDataShape {
  projects: Array<{ name: string; path: string; sourceDirs?: string[] }>;
  lastUpdated: number;
  unregistered?: string[];
}

function readRegistry(file: string): RegistryDataShape | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as RegistryDataShape;
}

describe('ProjectRegistryManager — MANAGE unregister/update (12.09)', () => {
  let tmp: string;
  let registryPath: string;
  let mgr: ProjectRegistryManager;

  beforeEach(() => {
    tmp = makeTempDir();
    registryPath = path.join(tmp, 'project_registry.json');
    mgr = new ProjectRegistryManager(registryPath);
  });

  afterEach(() => {
    ProjectRegistryManager._sessionIndexPathOverride = undefined; // hermetic between tests
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('unregister removes the entry and records a tombstone (canonical path match)', async () => {
    await mgr.registerProject('alpha', 'C:\\Projects\\Alpha');
    // Different case spelling → still matches via F1 canonicalization on win32.
    const res = await mgr.unregisterProject('c:\\projects\\alpha');
    expect(res.removed).toBe(true);
    expect(res.project?.name).toBe('alpha');

    const persisted = readRegistry(registryPath)!;
    expect(persisted.projects).toHaveLength(0);
    expect(Array.isArray(persisted.unregistered)).toBe(true);
    expect(persisted.unregistered!.length).toBe(1);
  });

  test('unregister is a no-op for unknown paths', async () => {
    await mgr.registerProject('alpha', 'C:\\Projects\\Alpha');
    const res = await mgr.unregisterProject('D:\\Nowhere');
    expect(res.removed).toBe(false);
    expect(res.project).toBeUndefined();

    const persisted = readRegistry(registryPath)!;
    expect(persisted.projects).toHaveLength(1); // untouched
  });

  test('re-registering a tombstoned path clears the tombstone (explicit intent wins)', async () => {
    await mgr.registerProject('alpha', 'C:\\Projects\\Alpha');
    await mgr.unregisterProject('C:\\Projects\\Alpha');
    let persisted = readRegistry(registryPath)!;
    expect(persisted.unregistered!.length).toBe(1);

    await mgr.registerProject('alpha2', 'C:\\Projects\\Alpha');
    persisted = readRegistry(registryPath)!;
    expect(persisted.projects.map(p => p.name)).toEqual(['alpha2']);
    expect(persisted.unregistered ?? []).toHaveLength(0); // tombstone cleared by explicit re-registration
  });

  test('update renames and replaces sourceDirs without creating entries', async () => {
    await mgr.registerProject('alpha', 'C:\\Projects\\Alpha');
    const res = await mgr.updateProject('C:\\Projects\\Alpha', { name: 'ALPHA-RENAMED', sourceDirs: ['lib/'] });
    expect(res.updated).toBe(true);
    expect(res.project?.name).toBe('ALPHA-RENAMED');
    expect(res.project?.sourceDirs).toEqual(['lib/']);

    const persisted = readRegistry(registryPath)!;
    expect(persisted.projects).toHaveLength(1); // never created a second entry
  });

  test('update on an unknown path returns updated:false (no creation)', async () => {
    const res = await mgr.updateProject('E:\\Ghost', { name: 'ghost' });
    expect(res.updated).toBe(false);
    expect(readRegistry(registryPath)?.projects ?? []).toHaveLength(0);
  });

  test('clearAll wipes projects but preserves tombstones', async () => {
    await mgr.registerProject('alpha', 'C:\\Projects\\Alpha');
    await mgr.unregisterProject('C:\\Projects\\Alpha');
    const before = readRegistry(registryPath)!.unregistered!;

    await mgr.clearAll();
    const persisted = readRegistry(registryPath)!;
    expect(persisted.projects).toHaveLength(0);
    expect(persisted.unregistered).toEqual(before); // tombstones survive a full wipe
  });
});

describe('ProjectRegistryManager — MANAGE tombstone blocks auto-resync resurrection (12.09)', () => {
  test('_syncFromSessionMemory skips tombstoned paths even when memory stamps reference them', async () => {
    const tmp = makeTempDir();
    try {
      // Two "projects": keeper (registered — its store IS scanned by the sync) and ghost (tombstoned).
      const registryPath = path.join(tmp, 'project_registry.json');
      const keeperWd = path.join(tmp, 'keeper');
      const ghostWd = path.join(tmp, 'ghost');
      fs.mkdirSync(path.join(keeperWd, '.session_context'), { recursive: true });
      fs.mkdirSync(ghostWd, { recursive: true });

      // Keeper's memory file holds a CROSS-STAMPED entry pointing at the GHOST working dir —
      // exactly the resurrection vector (legacy shared stores / context-switched writes).
      // 🔹 FIX (12.09): written with msgpack encode() to match what ContextStorageManager actually
      // persists — _syncFromSessionMemory() decodes this file as msgpack, so raw JSON bytes would be
      // skipped (first byte 0x5B → fixint) and the control below could never pass.
      const keeperMemPath = path.join(keeperWd, '.session_context', '.ai_toolbox_memory.msgpack');
      fs.writeFileSync(keeperMemPath, encode([
        { id: 'ctx_1', timestamp: Date.now(), type: 'decision', title: 'x', content: 'y', project_path: path.join(ghostWd, '.session_context', '.ai_toolbox_memory.msgpack') },
      ]));

      const mgr = new ProjectRegistryManager(registryPath);
      await mgr.registerProject('keeper', keeperWd);
      await mgr.registerProject('ghost', ghostWd);
      await mgr.unregisterProject(ghostWd); // → tombstone

      // getAllProjects() triggers _syncFromSessionMemory(): the cross-stamp must NOT resurrect ghost.
      const projects = await mgr.getAllProjects();
      expect(projects.map(p => p.path)).toContain(keeperWd);
      expect(projects.some(p => p.path === ghostWd)).toBe(false);

      // Control: WITHOUT a tombstone, the identical cross-stamp WOULD resurrect the path —
      // proves the sync path is actually exercised (and that the tombstone is what blocks it).
      const registryPath2 = path.join(tmp, 'project_registry2.json');
      const mgr2 = new ProjectRegistryManager(registryPath2);
      await mgr2.registerProject('keeper', keeperWd);
      const projects2 = await mgr2.getAllProjects();
      expect(projects2.some(p => p.path === ghostWd)).toBe(true);
    } finally {
      ProjectRegistryManager._sessionIndexPathOverride = undefined;
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});


// ==================== READS-EXTENSION (12.09): manager-level semantics behind manage_projects info/list/search ====================
// Tool wiring is a thin delegation to these methods (manageProjectsImpl cases 'info'/'list'/'search'), so the guarantees under test here are:

describe('ProjectRegistryManager — READS-EXTENSION read-action semantics (12.09)', () => {
  let tmp: string;
  let registryPath: string;
  let mgr: ProjectRegistryManager;

  beforeEach(() => {
    tmp = makeTempDir();
    registryPath = path.join(tmp, 'project_registry.json');
    mgr = new ProjectRegistryManager(registryPath);
  });

  afterEach(() => {
    ProjectRegistryManager._sessionIndexPathOverride = undefined; // hermetic between tests
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('getProjectByPath returns the entry for a registered path (info happy path)', async () => {
    const wd = path.join(tmp, 'alpha');
    await mgr.registerProject('Alpha', wd);
    const found = await mgr.getProjectByPath(wd);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Alpha');
  });

  test('getProjectByPath returns null for an unknown path (info not-found branch)', async () => {
    await mgr.registerProject('Alpha', path.join(tmp, 'alpha'));
    const found = await mgr.getProjectByPath(path.join(tmp, 'does-not-exist'));
    expect(found).toBeNull();
  });

  test('getAllProjects on a fresh registry returns [] (list empty-result input for F1-prime)', async () => {
    // Never-written file: the list action must see "empty" — that is exactly what triggers the
    // self-describing registry diagnostics in manageProjectsImpl ('missing' status itself is pinned
    // in projectRegistryStatusMigration.test.ts, so not re-asserted here).
    expect(fs.existsSync(registryPath)).toBe(false);
    await expect(mgr.getAllProjects()).resolves.toEqual([]);
  });

  test('getAllProjects round-trips registered projects (list has-entries case)', async () => {
    await mgr.registerProject('Alpha', path.join(tmp, 'alpha'));
    await mgr.registerProject('Beta', path.join(tmp, 'beta'));
    const names = (await mgr.getAllProjects()).map(p => p.name).sort();
    expect(names).toEqual(['Alpha', 'Beta']);
  });

  test('search matches by NAME substring, case-insensitively', async () => {
    await mgr.registerProject('Alpha', path.join(tmp, 'dir-alpha'));
    // Uppercase query → case-insensitive name match (exactly one project).
    expect((await mgr.search('ALPHA')).map(p => p.name)).toEqual(['Alpha']);
  });

  test('search matches by PATH substring even when no name contains the query', async () => {
    // The fragment lives in a directory path but in NEITHER registered name — isolates the path branch of the filter.
    const frag = 'pathonly-frag';
    await mgr.registerProject('Alpha', path.join(tmp, frag)); // dir contains the fragment; name does not
    await mgr.registerProject('Beta', path.join(tmp, 'plain-dir')); // control: matches neither
    expect((await mgr.search(frag)).map(p => p.name)).toEqual(['Alpha']);
  });

  test('search honors maxResults cap', async () => {
    for (let i = 0; i < 5; i++) await mgr.registerProject(`P${i}`, path.join(tmp, `d${i}`));
    const results = await mgr.search('p', 2); // lowercase 'p' matches P0..P4 case-insensitively
    expect(results).toHaveLength(2);
    for (const p of results) expect(p.name).toMatch(/^P[0-4]$/);
  });

  test('search returns [] with no match, and the registry is then has_projects (F1-prime gate input: no diagnostics attached)', async () => {
    await mgr.registerProject('Alpha', path.join(tmp, 'alpha'));
    await expect(mgr.search('zz-no-such-project')).resolves.toEqual([]);
    // manageProjectsImpl only attaches registry diagnostics on empty results when status !== 'has_projects' — pin that input.
    expect((await mgr.getRegistryDiagnostics()).status).toBe('has_projects');
  });

  test('search on a fresh (missing) registry returns [] with status missing (F1-prime gate input: diagnostics attached)', async () => {
    await expect(mgr.search('anything')).resolves.toEqual([]);
    // Empty result in a MISSING registry must surface as "nothing registered yet", not "wrong spelling".
    expect((await mgr.getRegistryDiagnostics()).status).toBe('missing');
  });

  // ==================== SEARCH-NORM (15.09): word-separator-insensitive search ====================

  test('search treats space/underscore/hyphen as equivalent separators in NAME matches (SEARCH-NORM)', async () => {
    await mgr.registerProject('ai_toolbox', path.join(tmp, 'ai_toolbox'));
    for (const q of ['ai toolbox', 'AI TOOLBOX', 'ai-toolbox']) {
      expect((await mgr.search(q)).map(p => p.name)).toEqual(['ai_toolbox']);
    }
  });

  test('search treats separators as equivalent in PATH matches too (SEARCH-NORM)', async () => {
    await mgr.registerProject('Alpha', path.join(tmp, 'my_project_dir'));
    expect((await mgr.search('my project dir')).map(p => p.name)).toEqual(['Alpha']);
    expect((await mgr.search('MY-PROJECT-DIR')).map(p => p.name)).toEqual(['Alpha']);
  });

  test('whitespace-only query matches nothing (SEARCH-NORM guard: empty canonical form)', async () => {
    await mgr.registerProject('Omega', path.join(tmp, 'omega'));
    await expect(mgr.search('   ')).resolves.toEqual([]);
  });
});
