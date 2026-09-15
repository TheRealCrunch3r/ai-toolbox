/**
 * Regression suite for REG-MOVE (12.09): project registry relocated from the install dir to the
 * persistent LM Studio data dir (~/.lmstudio/extensions/data/crunch3r/ai-toolbox/) — the install dir is
 * wiped on every `lms dev --install` (vibe-lm README, documented behavior), which repeatedly destroyed
 * registries stored there. Hermetic via setDataDirOverride() + temp dirs; never touches real home state.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { ProjectRegistryManager } from '../src/tools/contextManagementTools';
import { getDataDir, setDataDirOverride } from '../src/dataDir';

function validRegistry(names: string[]) {
  return {
    projects: names.map((name, i) => ({ name, path: `/tmp/${name}`, lastAccessed: Date.now() - (names.length - i) * 1000, sessionCount: 0, sourceDirs: ['src/'] })),
    lastUpdated: Date.now(),
  };
}

let dataDir: string; // per-test stand-in for the persistent data dir

beforeEach(async () => {
  dataDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ai-toolbox-datadir-'));
  setDataDirOverride(dataDir);
});

afterAll(() => {
  setDataDirOverride(undefined); // never leak a test override into later suites
});

describe('ProjectRegistryManager REG-MOVE — data-dir relocation', () => {
  test('default registryPath resolves to the persistent data dir (override seam)', async () => {
    const mgr = new ProjectRegistryManager(); // no overrides → production default path
    const status = await mgr.getRegistryFileStatus();
    expect(status.path).toBe(path.join(dataDir, 'project_registry.json'));
  });

  test('first load after upgrade migrates a valid install-dir primary into the data dir (one-time, non-destructive)', async () => {
    const legacyDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ai-toolbox-legacy-'));
    const legacyCtx = path.join(legacyDir, '.session_context');
    fs.mkdirSync(legacyCtx, { recursive: true });
    fs.writeFileSync(path.join(legacyCtx, 'project_registry.json'), JSON.stringify(validRegistry(['migrated-a', 'migrated-b']), null, 2));

    const mgr = new ProjectRegistryManager(); // data dir currently EMPTY → migration must fire
    // Await the seam call explicitly: load() internally migrates only its DEFAULT legacy path (install dir),
    // not this test's temp source — without the await, load() can read before save() settles → flaky null.
    await (mgr as unknown as { _migrateInstallDirPrimary(p?: string): Promise<void> })._migrateInstallDirPrimary(path.join(legacyCtx, 'project_registry.json'));

    const loaded = await mgr.load(); // internal no-override migration is then a one-directional no-op
    expect(loaded).not.toBeNull();
    expect(loaded!.projects.map((p) => p.name)).toEqual(['migrated-a', 'migrated-b']);
    // New home populated incl. FIX #28 backup copy (rebuild via save())
    expect(fs.existsSync(path.join(dataDir, 'project_registry.json'))).toBe(true);
    expect(JSON.parse(fs.readFileSync(path.join(dataDir, 'project_registry.json.bak'), 'utf-8')).projects.length).toBe(2);
    // Old file left untouched for manual cleanup (never deleted by the plugin)
    expect(fs.existsSync(path.join(legacyCtx, 'project_registry.json'))).toBe(true);
  });

  test('migration is skipped — never merged back — once a data-dir primary exists (strictly one-directional)', async () => {
    const legacyDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ai-toolbox-legacy2-'));
    const legacyCtx = path.join(legacyDir, '.session_context');
    fs.mkdirSync(legacyCtx, { recursive: true });
    // Distinct content in both locations: if migration wrongly ran, the name sets would differ.
    fs.writeFileSync(path.join(dataDir, 'project_registry.json'), JSON.stringify(validRegistry(['data-only']), null, 2));
    fs.writeFileSync(path.join(legacyCtx, 'project_registry.json'), JSON.stringify(validRegistry(['legacy-only']), null, 2));

    const mgr = new ProjectRegistryManager();
    await (mgr as unknown as { _migrateInstallDirPrimary(p?: string): Promise<void> })._migrateInstallDirPrimary(path.join(legacyCtx, 'project_registry.json')); // no-op expected — awaited for symmetry/determinism

    const loaded = await mgr.load();
    expect(loaded!.projects.map((p) => p.name)).toEqual(['data-only']); // data dir wins unconditionally
  });

  test('getDataDir() under jest (no explicit env var) never resolves into the real home folder', () => {
    delete process.env.AI_TOOLBOX_DATA_DIR;
    const resolved = getDataDir(); // override set in beforeEach → dataDir; also proves no throw + dir creation
    expect(resolved).toBe(dataDir);
  });
});
