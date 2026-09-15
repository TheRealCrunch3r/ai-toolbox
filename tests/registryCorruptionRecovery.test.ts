/**
 * Regression suite for FIX #28 (11.09, registry truncation incident).
 *
 * Incident recap: <pluginRoot>/.session_context/project_registry.json was torn to a 251-byte prefix
 * of valid JSON by an external writer at boot; ProjectRegistryManager.load() swallowed the parse
 * failure ("Failed to load → null"), so every list/search returned [] and nothing could write again
 * until manual repair (observed live: mtime frozen 18:45→19:13).
 *
 * Covered guarantees:
 * 1. save() keeps an identical backup copy (<primary>.bak) in the SAME plugin-dir location, written atomically.
 * 2. load() on a corrupt primary quarantines it (<primary>.corrupt-<ts>) and restores the last known-good
 *    state from the backup — the registry can no longer stay "empty" after corruption.
 * 3. No valid backup → clean null (fresh-install behavior), never a crash; next registerProject rebuilds.
 * 4. Corrupt backup too → clean null, no restore, no crash.
 * 5. Happy path unchanged: valid primary loads normally and leaves the backup untouched.
 *
 * Conventions: hermetic via the F4 registryPathOverride constructor hook (temp dir only — never touches
 * the live plugin-dir registry); temp root cleaned in afterAll. Run with the default jest suite or:
 *   npx jest tests/registryCorruptionRecovery.test.ts
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { ProjectRegistryManager } from '../src/tools/contextManagementTools';

const REGISTRY_NAME = 'project_registry.json';

let tempRoot: string; // scratch "plugin dir" for registry fixtures
let baseDir: string; // <tempRoot>/.session_context parent — mimics plugin root layout
let primaryPath: string;
let bakPath: string;

beforeAll(async () => {
  tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ai-toolbox-registry-fix28-'));
  baseDir = path.join(tempRoot, '.session_context');
  await fs.promises.mkdir(baseDir, { recursive: true });
  primaryPath = path.join(baseDir, REGISTRY_NAME);
  bakPath = `${primaryPath}.bak`;
});

afterAll(async () => {
  if (fs.existsSync(tempRoot)) {
    await fs.promises.rm(tempRoot, { recursive: true, force: true });
  }
});

beforeEach(() => {
  // Clean slate per test — no leftover quarantine/tmp/bak artifacts between cases
  for (const f of fs.readdirSync(baseDir)) {
    fs.rmSync(path.join(baseDir, f), { force: true });
  }
});

function validRegistry(projectsCount = 2) {
  return {
    projects: Array.from({ length: projectsCount }, (_, i) => ({
      name: `proj-${i}`,
      path: `/tmp/proj-${i}`,
      lastAccessed: Date.now() - (projectsCount - i) * 1000,
      sessionCount: 0,
      sourceDirs: ['src/'],
    })),
    lastUpdated: Date.now(),
  };
}

function writeRaw(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content);
}

/** Corrupt the primary exactly like the 11.09 incident: valid-JSON prefix torn mid-object. */
function corruptPrimaryLikeIncident(): void {
  const full = JSON.stringify(validRegistry(2), null, 2);
  writeRaw(primaryPath, full.slice(0, Math.floor(full.length / 3))); // guaranteed unparseable prefix
}

describe('ProjectRegistryManager FIX #28 — save() backup invariant', () => {
  test('save() writes primary AND identical .bak in the same directory (both complete JSON)', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    const data = validRegistry(3);

    await mgr.save(data);

    expect(fs.existsSync(primaryPath)).toBe(true);
    expect(fs.existsSync(bakPath)).toBe(true); // backup lives next to the primary in the plugin dir

    const primaryRaw = fs.readFileSync(primaryPath, 'utf-8');
    const bakRaw = fs.readFileSync(bakPath, 'utf-8');
    expect(JSON.parse(bakRaw)).toEqual(data); // backup is valid JSON with identical content
    expect(bakRaw).toBe(primaryRaw);

    // No leftover temp files — unique tmp names are consumed by rename (no fixed .tmp orphan)
    const leftovers = fs.readdirSync(baseDir).filter(f => f.includes('.tmp'));
    expect(leftovers).toEqual([]);
  });

  test('repeated saves keep the backup in sync (backup tracks the LATEST save)', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    await mgr.save(validRegistry(1));
    const second = validRegistry(4);
    await mgr.save(second);

    expect(JSON.parse(fs.readFileSync(bakPath, 'utf-8'))).toEqual(second); // not the stale first save
  });
});

describe('ProjectRegistryManager FIX #28 — load() corruption recovery', () => {
  test('corrupt primary + valid backup → quarantined and RESTORED from backup (registry NOT empty)', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    await mgr.save(validRegistry(2)); // establish known-good state incl. .bak

    corruptPrimaryLikeIncident(); // simulate the 11.09 torn write

    const restored = await mgr.load();

    expect(restored).not.toBeNull();
    expect(restored!.projects).toHaveLength(2); // recovered, not []
    expect(restored!.projects.map(p => p.name)).toEqual(['proj-0', 'proj-1']);

    // Quarantine artifact exists and holds the corrupt bytes; primary slot now holds restored content
    const quarantined = fs.readdirSync(baseDir).filter(f => f.startsWith(`${REGISTRY_NAME}.corrupt-`));
    expect(quarantined).toHaveLength(1);
    // Quarantine holds the torn bytes for forensics — not "repaired" in place, primary slot re-created from backup
    const quarantinedRaw = fs.readFileSync(path.join(baseDir, quarantined[0]), 'utf-8');
    expect(quarantinedRaw.length).toBeGreaterThan(0);
    expect(() => JSON.parse(quarantinedRaw)).toThrow(); // still unparseable — it IS the corrupt content
  });

  test('after recovery, a subsequent save() rebuilds the backup from the restored state (cycle closes)', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    await mgr.save(validRegistry(2));
    corruptPrimaryLikeIncident();

    const restored = await mgr.load();
    expect(restored).not.toBeNull();

    // Simulate the next real mutation (e.g. register_project after recovery)
    await mgr.registerProject('new-proj', '/tmp/new-proj', ['src/']);

    const afterRebuild = JSON.parse(fs.readFileSync(bakPath, 'utf-8'));
    expect(afterRebuild.projects.some((p: { name?: string }) => p.name === 'new-proj')).toBe(true);
  });

  test('corrupt primary + NO backup → null (fresh-install behavior), quarantined, no crash', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    corruptPrimaryLikeIncident(); // never saved → no .bak exists

    expect(await mgr.load()).toBeNull();

    const quarantined = fs.readdirSync(baseDir).filter(f => f.startsWith(`${REGISTRY_NAME}.corrupt-`));
    expect(quarantined).toHaveLength(1);
    expect(fs.existsSync(primaryPath)).toBe(false); // corrupt file moved away, empty slot left behind
  });

  test('recovery after "no backup" failure: registerProject() rebuilds a working registry', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    corruptPrimaryLikeIncident();
    expect(await mgr.load()).toBeNull(); // quarantine happened here

    await mgr.registerProject('rebuilt-proj', '/tmp/rebuilt-proj');

    const data = await mgr.load();
    expect(data).not.toBeNull();
    expect(data!.projects.map(p => p.name)).toEqual(['rebuilt-proj']);
    expect(fs.existsSync(bakPath)).toBe(true); // backup invariant re-established
  });

  test('corrupt primary + ALSO-corrupt backup → null, no crash, quarantine still happens', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    await mgr.save(validRegistry(1));
    corruptPrimaryLikeIncident();
    writeRaw(bakPath, '{ this is not valid json'); // both sources poisoned

    expect(await mgr.load()).toBeNull();

    const quarantined = fs.readdirSync(baseDir).filter(f => f.startsWith(`${REGISTRY_NAME}.corrupt-`));
    expect(quarantined).toHaveLength(1); // primary quarantined even though restore is impossible
  });

  test('valid shape violation (parseable JSON, wrong format) with valid backup → also recovered', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    await mgr.save(validRegistry(2));

    writeRaw(primaryPath, JSON.stringify({ version: 1, projects: [] })); // no lastUpdated → fails validation

    const restored = await mgr.load();
    expect(restored).not.toBeNull();
    expect(restored!.projects).toHaveLength(2);
  });
});

describe('ProjectRegistryManager FIX #28 — happy path regression', () => {
  test('valid primary loads normally; backup file is NOT modified by a read (reads stay side-effect free)', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    await mgr.save(validRegistry(3));

    const bakRawBefore = fs.readFileSync(bakPath, 'utf-8');
    const data = await mgr.load();
    expect(data!.projects).toHaveLength(3);
    // Clean reads never touch the backup — content byte-identical after load()
    expect(fs.readFileSync(bakPath, 'utf-8')).toBe(bakRawBefore);

    // No quarantine artifacts from a clean load
    const quarantined = fs.readdirSync(baseDir).filter(f => f.includes('.corrupt-'));
    expect(quarantined).toEqual([]);
  });

  test('missing registry (fresh install) → null, no quarantine, no crash', async () => {
    const mgr = new ProjectRegistryManager(primaryPath);
    expect(await mgr.load()).toBeNull();
    expect(fs.readdirSync(baseDir)).toEqual([]);
  });
});
