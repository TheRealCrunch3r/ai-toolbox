/**
 * RECURSIVE .bak SCAN (21.10, owner order "fix it so it will find the nested ones as well") — hermetic suite.
 * Root cause: cleanup_backups + list_available_bak_backups both scanned with a single-level
 * fs.readdir(workingDir), so nested edit backups (e.g. src/config.ts.bak) were invisible to listing AND
 * deletion — live-observed this session when my own edits to src/tools/*.ts left .bak files the sweep missed.
 * Fix: shared recursive walker src/utils/bakScan.ts used by both tools; exclusions for node_modules/.git/
 * plugin-state dirs (.session_context, .ai_toolbox_backups); symlinks never followed (isFile() gate).
 * Conventions (contextSearch.test.ts): fixtures under os.tmpdir(); setWorkingDir(tmp) per test;
 * resetWorkingDir() in afterEach — the repo's own state is never touched.
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { findBakFiles } from '../src/utils/bakScan';
import { registerCleanupBackupsTool } from '../src/tools/cleanupBackupsTool';
import { registerRestoreFromBakTools } from '../src/tools/restoreFromBak';
import { setWorkingDir, resetWorkingDir } from '../src/workingDir';
import { DEFAULT_CONFIG } from '../src/config';

type ToolFn = (p: Record<string, unknown>) => Promise<Record<string, unknown>>;

let tmpDir: string;

/** Lay down a realistic tree: root + nested edit backups plus decoys in every excluded zone. */
function seedTree(): void {
  fs.writeFileSync(path.join(tmpDir, 'root.txt.bak'), 'r1'); // depth 0 (legacy-visible)
  const srcTools = path.join(tmpDir, 'src', 'tools');
  fs.mkdirSync(srcTools, { recursive: true });
  fs.writeFileSync(path.join(srcTools, 'cleanupBackupsTool.ts.bak'), 'x'.repeat(42)); // the live-missed class
  const deep = path.join(tmpDir, 'a', 'b', 'c');
  fs.mkdirSync(deep, { recursive: true });
  fs.writeFileSync(path.join(deep, 'deep.md.bak'), 'deep'); // depth 3
  fs.writeFileSync(path.join(tmpDir, 'notabak.txt'), 'plain file — never a backup');

  // Decoys the walker must NEVER report (excluded dirs) and confirm-true must NEVER delete.
  const nm = path.join(tmpDir, 'node_modules', 'pkg');
  fs.mkdirSync(nm, { recursive: true });
  fs.writeFileSync(path.join(nm, 'vendor.js.bak'), 'third-party decoy');
  const gitObj = path.join(tmpDir, '.git', 'objects');
  fs.mkdirSync(gitObj, { recursive: true });
  fs.writeFileSync(path.join(gitObj, 'vcs.dat.bak'), 'vcs decoy');
  const sessCtx = path.join(tmpDir, '.session_context');
  fs.mkdirSync(sessCtx, { recursive: true });
  fs.writeFileSync(path.join(sessCtx, 'project_registry.json.bak'), '{ registry safety copy }');
  const zips = path.join(tmpDir, '.ai_toolbox_backups');
  fs.mkdirSync(zips, { recursive: true });
  fs.writeFileSync(path.join(zips, 'archive.zip.bak'), 'zip decoy');

  // A DIRECTORY named like a backup — must not be reported as a file entry.
  fs.mkdirSync(path.join(tmpDir, 'looksLikeBackup.bak'), { recursive: true });
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-bakscan-'));
  seedTree();
});

afterEach(() => {
  resetWorkingDir(); // established convention — never leak CWD state between tests
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ==================== findBakFiles — the shared walker ====================

describe('findBakFiles (src/utils/bakScan.ts)', () => {
  test('recursively finds root + nested .bak files with rel paths, sizes, and deterministic order', async () => {
    const entries = await findBakFiles(tmpDir);
    expect(entries.map(e => e.relPath)).toEqual([
      path.join('a', 'b', 'c', 'deep.md.bak'),       // sorted first (platform separator)
      'root.txt.bak',
      path.join('src', 'tools', 'cleanupBackupsTool.ts.bak'),
    ]);
    const nested = entries.find(e => e.originalRelPath === path.join('src', 'tools', 'cleanupBackupsTool.ts'))!;
    expect(nested.sizeBytes).toBe(42); // exact size survives the walk
    expect(nested.modifiedAtIso).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO-8601 contract (consumers format nothing)
  });

  test('excludes node_modules, .git, and plugin-state dirs (.session_context, .ai_toolbox_backups)', async () => {
    const entries = await findBakFiles(tmpDir);
    for (const e of entries) {
      expect(e.relPath.toLowerCase()).not.toMatch(/node_modules|\.git|\.session_context|\.ai_toolbox_backups/);
    }
    // exactly the three real edit backups — zero decoys leak through
    expect(entries).toHaveLength(3);
  });

  test('directory named *.bak is not reported as a file entry', async () => {
    const entries = await findBakFiles(tmpDir);
    expect(entries.some(e => e.relPath === 'looksLikeBackup.bak')).toBe(false);
  });

  test('missing/empty root returns [] instead of throwing (legacy lenient contract)', async () => {
    expect(await findBakFiles(path.join(tmpDir, 'does-not-exist'))).toEqual([]);
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-bakscan-empty-'));
    try {
      expect(await findBakFiles(empty)).toEqual([]);
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });

  test('case-insensitive suffix match (Windows FS is case-insensitive; .BAK must count too)', async () => {
    fs.writeFileSync(path.join(tmpDir, 'UPPER.BAK'), 'u');
    const entries = await findBakFiles(tmpDir);
    expect(entries.some(e => e.relPath === path.join('UPPER.BAK'))).toBe(true);
  });
});

// ==================== cleanup_backups — the live-missed tool ====================

describe('cleanup_backups (recursive)', () => {
  const getTool = async (): Promise<ToolFn> => {
    setWorkingDir(tmpDir); // BEFORE invocation — the implementation resolves getWorkingDir() itself
    const [t] = registerCleanupBackupsTool(DEFAULT_CONFIG) as unknown as Array<{ implementation: ToolFn }>;
    return t.implementation;
  };

  test('dry-run lists nested backups with ABSOLUTE paths and deletes nothing', async () => {
    const impl = await getTool();
    const out = await impl({}); // no confirm → dry run
    expect(out.success).toBe(true);
    expect(out.action).toBe('list');
    expect(out.totalCount).toBe(3);

    const paths = (out.backups as Array<{ path: string }>).map(b => b.path);
    // absolute, root-anchored — the exact shape consumers/owner have always seen, now incl. nested
    expect(paths).toContain(path.join(tmpDir, 'root.txt.bak'));
    expect(paths).toContain(path.join(tmpDir, 'src', 'tools', 'cleanupBackupsTool.ts.bak'));

    // dry-run is read-only: every file still on disk, decoys untouched too
    expect(fs.existsSync(path.join(tmpDir, 'src', 'tools', 'cleanupBackupsTool.ts.bak'))).toBe(true);
  });

  test('confirm=true deletes root AND nested backups; excluded-dir decoys survive the sweep', async () => {
    const impl = await getTool();
    const out = await impl({ confirm: true });
    expect(out.success).toBe(true);
    expect(out.action).toBe('delete');
    expect(out.totalCount).toBe(3);

    // nothing left of the real edit backups anywhere in the tree
    expect(fs.existsSync(path.join(tmpDir, 'root.txt.bak'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'src', 'tools', 'cleanupBackupsTool.ts.bak'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'a', 'b', 'c', 'deep.md.bak'))).toBe(false);

    // safety boundary: the sweep never reached excluded dirs — session-memory + third-party state intact
    expect(fs.existsSync(path.join(tmpDir, '.session_context', 'project_registry.json.bak'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'node_modules', 'pkg', 'vendor.js.bak'))).toBe(true);
    expect(errorsOf(out)).toEqual([]); // zero errors on a clean tree (no stray error keys in payload)
  });

  test('clean working dir → friendly empty envelopes (both modes)', async () => {
    const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-bakscan-clean-'));
    try {
      setWorkingDir(bare);
      const [t] = registerCleanupBackupsTool(DEFAULT_CONFIG) as unknown as Array<{ implementation: ToolFn }>;
      const listOut = await t.implementation({});
      expect(listOut.totalCount).toBe(0);
      const delOut = await t.implementation({ confirm: true });
      expect(delOut.totalCount).toBe(0);
    } finally {
      fs.rmSync(bare, { recursive: true, force: true });
    }
  });
});

// ==================== list_available_bak_backups + restore_from_bak hint surface ====================

describe('list_available_bak_backups (recursive)', () => {
  const getList = async (): Promise<ToolFn> => {
    setWorkingDir(tmpDir);
    const tools = registerRestoreFromBakTools(DEFAULT_CONFIG) as unknown as Array<{ name: string; implementation: ToolFn }>;
    return tools.find(t => t.name === 'list_available_bak_backups')!.implementation;
  };

  test('lists nested backups with working-dir-relative file/backupFile (root-level stays bare-filename form)', async () => {
    const impl = await getList();
    const out = await impl({});
    expect(out.success).toBe(true);
    expect(out.totalCount).toBe(3);

    const byBackup = new Map((out.backups as Array<{ file: string; backupFile: string; sizeBytes: number }>)
      .map(b => [b.backupFile, b]));
    // root level → legacy bare-filename shape (backward compatible)
    expect(byBackup.get('root.txt.bak')?.file).toBe('root.txt');
    // nested → relative paths disambiguate same-basename backups across subdirs
    const srcBak = byBackup.get(path.join('src', 'tools', 'cleanupBackupsTool.ts.bak'));
    expect(srcBak?.file).toBe(path.join('src', 'tools', 'cleanupBackupsTool.ts'));
    expect(srcBak?.sizeBytes).toBe(42);
  });

  test('restore_from_bak error hint surfaces nested backups too (availableBackups shares the walker)', async () => {
    setWorkingDir(tmpDir);
    const tools = registerRestoreFromBakTools(DEFAULT_CONFIG) as unknown as Array<{ name: string; implementation: ToolFn }>;
    const restore = tools.find(t => t.name === 'restore_from_bak')!.implementation;
    const out = await restore({ file_name: 'never-edited.txt' }); // no .bak for this one → error + hint list
    expect(out.success).toBe(false);
    const hinted = (out.availableBackups as Array<{ backupFile: string }>).map(b => b.backupFile);
    expect(hinted).toContain(path.join('src', 'tools', 'cleanupBackupsTool.ts.bak'));
    // and the failed restore touched nothing on disk
    expect(fs.existsSync(path.join(tmpDir, 'never-edited.txt'))).toBe(false);
  });
});

/** Errors key is omitted entirely when empty (house payload convention) — normalize for assertion. */
function errorsOf(out: Record<string, unknown>): string[] {
  return Array.isArray(out.errors) ? (out.errors as string[]) : [];
}
