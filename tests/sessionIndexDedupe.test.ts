/**
 * ARC C1 (15.10, owner GO) — Unit tests for the SessionIndexManager.addEntry() dedupe guard
 * (src/tools/contextManagementTools.ts L836-958).
 *
 * Observed live 14.10: one logical session wrote FIVE index rows in 38 min (each compression / manual save
 * blindly unshifted its own row), because both writers — the save_session_summary tool and
 * persistGeneratedSessionSummary() — call addEntry(). The guard: if the NEWEST existing row is younger than
 * SESSION_INDEX_DEDUPE_WINDOW_MS it IS that same session → supersede sessions[0] in place (latest description
 * wins, position stays 0) instead of appending; rows at/older than the window append normally. total_count is
 * recomputed from sessions.length after pruning either way.
 *
 * REAL-class import note (house pattern): extensionless '../src/tools/contextManagementTools' resolves to real
 * src under ts-jest default resolution — jest.config.cjs only maps the dot-suffixed specifiers ('./tools/…' and
 * '../…' .js forms), so this suite pins the actual guard, not a stub. Same import idiom as
 * tests/sessionSummaryPersist.test.ts (its dormant prototype spy).
 *
 * Hermeticity: the constructor pins <wd>/.session_context/sessions.json from getWorkingDir() AT CONSTRUCTION —
 * setWorkingDir(tmp) therefore runs BEFORE every `new SessionIndexManager()` (fresh mkdtemp per test), and
 * resetWorkingDir() in afterEach. The load() plugin-root fallback (<src>/.session_context, ts-jest __dirname) is
 * absent on disk by repo invariant, so a fresh tmp wd yields load() === null; after the first save() the wd file
 * exists and wins over the fallback anyway (load order: working dir first).
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { setWorkingDir, resetWorkingDir } from '../src/workingDir';
import { SessionIndexManager } from '../src/tools/contextManagementTools';

// Mirror of the NON-exported src constant (SESSION_INDEX_DEDUPE_WINDOW_MS, L845). Deliberately duplicated rather
// than exported: tests pin production behavior; if an owner tweaks the window, THIS file fails loudly and forces a
// conscious re-pin. 30 min covers the largest same-session gap observed (~22 min) with margin (see src comment).
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

// Deterministic clock base — exact offsets below are the whole point of these pins.
const T0 = 1_800_000_000_000; // arbitrary stable epoch-ms anchor (never Date.now() for entry timestamps)

interface IndexFile { sessions: Array<{ task_description: string; timestamp: number; date: string }>; total_count: number; last_updated: number; }

function indexPath(tmpDir: string): string {
  return path.join(tmpDir, '.session_context', 'sessions.json');
}

function seedIndex(tmpDir: string, data: IndexFile): void {
  fs.mkdirSync(path.dirname(indexPath(tmpDir)), { recursive: true });
  fs.writeFileSync(indexPath(tmpDir), JSON.stringify(data), 'utf-8');
}

describe('ARC C1 — SessionIndexManager.addEntry dedupe guard (exact production shapes)', () => {
  let tmpDir: string;

  beforeEach(() => {
    // Fresh tmp working dir BEFORE construction — the manager pins its path at `new` time.
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arc-c1-dedupe-'));
    expect(setWorkingDir(tmpDir)).toBe(true);
  });

  afterEach(() => {
    resetWorkingDir();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('first entry appends into an empty store (newest-first baseline)', async () => {
    const mgr = new SessionIndexManager();
    await mgr.addEntry('first session task', T0, '2026-10-15T10:00');

    expect(fs.existsSync(indexPath(tmpDir))).toBe(true); // wd-local file created (FIX #24: working dir only)
    const data = JSON.parse(fs.readFileSync(indexPath(tmpDir), 'utf-8')) as IndexFile;
    expect(data.sessions).toHaveLength(1);
    expect(data.total_count).toBe(1);
    expect(data.sessions[0]).toEqual({ task_description: 'first session task', timestamp: T0, date: '2026-10-15T10:00' });
    expect(typeof data.last_updated).toBe('number'); // real clock — shape only, never value-pinned
  });

  it('second write within the window OVERWRITES sessions[0] in place (length and total_count stay flat)', async () => {
    // Seed: a fresh row from 5 min ago + an older distinct session from 2 h ago.
    seedIndex(tmpDir, {
      sessions: [
        { task_description: 'same session — earlier save', timestamp: T0 - 5 * 60_000, date: 'earlier' },
        { task_description: 'older distinct session', timestamp: T0 - 2 * 3_600_000, date: 'old' },
      ],
      total_count: 2,
      last_updated: T0 - 5 * 60_000,
    });

    const mgr = new SessionIndexManager();
    await mgr.addEntry('same session — latest save', T0, 'latest');

    const data = JSON.parse(fs.readFileSync(indexPath(tmpDir), 'utf-8')) as IndexFile;
    expect(data.sessions).toHaveLength(2); // in-place overwrite — NOT a third row
    expect(data.total_count).toBe(2);     // stays consistent (recomputed from sessions.length)
    // Latest description wins at position 0…
    expect(data.sessions[0]).toEqual({ task_description: 'same session — latest save', timestamp: T0, date: 'latest' });
    // …and the distinct older session survives untouched at index 1.
    expect(data.sessions[1]).toEqual({ task_description: 'older distinct session', timestamp: T0 - 2 * 3_600_000, date: 'old' });
  });

  it('a write EXACTLY one window old is NOT deduped (strict < inequality pinned)', async () => {
    // Diff === DEDUPE_WINDOW_MS → guard condition `(timestamp - newest.timestamp) < WINDOW` is false → append.
    seedIndex(tmpDir, {
      sessions: [{ task_description: 'boundary row', timestamp: T0 - DEDUPE_WINDOW_MS, date: 'boundary' }],
      total_count: 1,
      last_updated: T0 - DEDUPE_WINDOW_MS,
    });

    const mgr = new SessionIndexManager();
    await mgr.addEntry('boundary follow-up', T0, 'now');

    const data = JSON.parse(fs.readFileSync(indexPath(tmpDir), 'utf-8')) as IndexFile;
    expect(data.sessions).toHaveLength(2); // appended, not overwritten — the strict < is load-bearing
    expect(data.total_count).toBe(2);
    expect(data.sessions[0].task_description).toBe('boundary follow-up'); // newest first
    expect(data.sessions[1]).toEqual({ task_description: 'boundary row', timestamp: T0 - DEDUPE_WINDOW_MS, date: 'boundary' });
  });

  it('a write just inside the window (WINDOW − 1 ms) IS deduped', async () => {
    seedIndex(tmpDir, {
      sessions: [{ task_description: 'just-inside row', timestamp: T0 - (DEDUPE_WINDOW_MS - 1), date: 'ins' }],
      total_count: 1,
      last_updated: T0 - (DEDUPE_WINDOW_MS - 1),
    });

    const mgr = new SessionIndexManager();
    await mgr.addEntry('just-inside follow-up', T0, 'now');

    const data = JSON.parse(fs.readFileSync(indexPath(tmpDir), 'utf-8')) as IndexFile;
    expect(data.sessions).toHaveLength(1); // deduped: WINDOW−1 < WINDOW holds by one millisecond
    expect(data.total_count).toBe(1);
    expect(data.sessions[0].task_description).toBe('just-inside follow-up');
  });

  it('a write beyond the window appends newest-first (distinct sessions stay distinct rows)', async () => {
    seedIndex(tmpDir, {
      sessions: [{ task_description: 'previous session', timestamp: T0 - (DEDUPE_WINDOW_MS + 1), date: 'prev' }],
      total_count: 1,
      last_updated: T0 - (DEDUPE_WINDOW_MS + 1),
    });

    const mgr = new SessionIndexManager();
    await mgr.addEntry('new session', T0, 'now');

    const data = JSON.parse(fs.readFileSync(indexPath(tmpDir), 'utf-8')) as IndexFile;
    expect(data.sessions).toHaveLength(2);
    expect(data.total_count).toBe(2);
    // Newest-first ordering pinned: the new row is index 0, the previous one demoted to 1.
    expect(data.sessions[0].task_description).toBe('new session');
    expect(data.sessions[1].task_description).toBe('previous session');
  });

  it('dedupe re-reads disk state per call (two managers against the same wd file see each other)', async () => {
    // Both writers (tool + Arc-C persist) construct a FRESH SessionIndexManager per write — the guard must work
    // across constructions, not just within one instance.
    const first = new SessionIndexManager();
    await first.addEntry('writer A save', T0 - 2 * 60_000, 'a');

    const second = new SessionIndexManager();
    await second.addEntry('writer B save (same session)', T0, 'b');

    const parsed = JSON.parse(fs.readFileSync(indexPath(tmpDir), 'utf-8')) as IndexFile;
    expect(parsed.sessions).toHaveLength(1); // cross-construction dedupe — no duplicate row
    expect(parsed.total_count).toBe(1);
    expect(parsed.sessions[0].task_description).toBe('writer B save (same session)');
  });
});
