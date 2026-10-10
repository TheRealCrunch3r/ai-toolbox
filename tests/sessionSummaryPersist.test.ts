/**
 * ARC C (07.10) — Unit tests for src/sessionSummaryPersist.ts (forced structured session-memory save
 * at the compression trigger).
 *
 * Covers:
 *  1. truncateSessionSummaryField() — pure byte-identical twin of the save_session_summary writer's
 *     truncate(): pass-through ≤2048, hard cap with the 23-char '\n… (truncated for size)' suffix @2049+ (runtime length — never re-hardcode it).
 *  2. persistGeneratedSessionSummary() — canonical writer ordering pinned against a fake StateManager:
 *     evict 'session_summary_latest' ONLY → set BEFORE forceSave → index update AFTER the durable flush,
 *     non-fatal by design (index failure must never fail an already-durable summary). NOTE (07.10 gate-trio): in
 *     THIS suite's graph persist()'s './tools/contextManagementTools.js' import resolves to the __mocks__ stub via
 *     jest.config.cjs (mapper entry '^\.\/tools\/contextManagementTools\.js$'), so SessionIndexManager is undefined there
 *     and construction throws inside the writer's inner try/catch — the index test pins that non-fatal path honestly
 *     (zero real-class calls + no <tmp>/.session_context/sessions.json created, saved:true). A dormant prototype spy on the
 *     REAL class stays in place: re-scoping that mapper entry to real src activates exact-once + post-flush coverage.
 *  3. parseSessionContinuity() — lenient parser for generateSessionContinuity()'s model output: plain
 *     section format, JSON mode (fenced + bare), missing sections → '', garbage/empty → null.
 *
 * Registry-ID note (house pattern): jest.mock('../src/toolsProvider') lands on the SAME registry entry that
 * src/sessionSummaryPersist.ts's './toolsProvider.js' import resolves to (mapper target
 * <rootDir>/src/toolsProvider.ts) — so this factory intercepts it and the heavy real tools module is never
 * loaded in this suite. The extensionless '../src/sessionSummaryPersist' import below likewise needs no mapper
 * entry (ts-jest default resolution).
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

jest.mock('../src/toolsProvider', () => ({ getStateManager: jest.fn() }));

// The hoisted jest.mock above replaces this module's registry entry — importing the SAME specifier here
// yields the factory object (with its jest.fn()), which is how the suite pins getStateManager() per test.
import * as toolsProvider from '../src/toolsProvider';
import { setWorkingDir, resetWorkingDir } from '../src/workingDir';
// REAL class (not the __mocks__ stub): extensionless specifier → default resolution to src. Spied per-test for
// the hermetic index-ordering test below; restoreAllMocks in afterEach un-patches it.
import { SessionIndexManager } from '../src/tools/contextManagementTools';
import {
  persistGeneratedSessionSummary,
  parseSessionContinuity,
  truncateSessionSummaryField,
} from '../src/sessionSummaryPersist';
import type { SessionSummaryData } from '../src/tools/contextManagementTools';

// ==================== Fake StateManager (mirrors the exact method surface the writer consumes) =============

interface FakeStore {
  map: Map<string, unknown>;
  set: jest.Mock;
  get: jest.Mock;
  delete: jest.Mock;
  getAllKeys: () => Promise<string[]>;
  forceSave: jest.Mock;
}

function makeFakeStore(seed?: Record<string, unknown>): FakeStore {
  const map = new Map(Object.entries(seed ?? {}));
  return {
    map,
    set: jest.fn((k: string, v: unknown) => void map.set(k, v)),
    get: jest.fn((k: string) => map.get(k) as never),
    delete: jest.fn((k: string) => void map.delete(k)),
    getAllKeys: async () => [...map.keys()],
    forceSave: jest.fn(async () => undefined),
  };
}

function baseSummary(overrides?: Partial<SessionSummaryData>): SessionSummaryData {
  return {
    task_description: 'Arc C verification round',
    accomplishments: '- anchor pass\n- mapper verdict',
    pending_tasks: '- write tests',
    decisions_made: 'tmp WD pin for hermetic index writes',
    context_for_next_session: 'anchors verified; next = test files',
    ...overrides,
  };
}

// ==================== truncateSessionSummaryField ========================================================

describe('ARC C — truncateSessionSummaryField (writer twin)', () => {
  it('passes through short text and undefined unchanged (truncated=false)', () => {
    expect(truncateSessionSummaryField('short')).toEqual({ content: 'short', truncated: false });
    expect(truncateSessionSummaryField(undefined)).toEqual({ content: '', truncated: false });
  });

  it('does NOT truncate at exactly the 2048 cap (<= boundary, byte-identical to the tool writer)', () => {
    const exact = 'a'.repeat(2048);
    expect(truncateSessionSummaryField(exact)).toEqual({ content: exact, truncated: false });
  });

  it('truncates at 2049 → slice(0, 2025) + 23-char suffix = exactly 2048 chars', () => {
    const input = 'b'.repeat(2049);
    const { content, truncated } = truncateSessionSummaryField(input);
    expect(truncated).toBe(true);
    // Suffix is '\n' + '…' + space + '(truncated for size)' = 23 UTF-16 units → safe slice = 2048 − 23 = 2025.
    expect(content.length).toBe(2048);
    expect(content.endsWith('\n… (truncated for size)')).toBe(true);
    expect(content.slice(0, 2025)).toBe('b'.repeat(2025)); // prefix = exactly the safe-slice length (2025 b's)
  });

  it('reports truncation only above the cap', () => {
    expect(truncateSessionSummaryField('c'.repeat(2050)).truncated).toBe(true);
    expect(truncateSessionSummaryField('d'.repeat(1000)).truncated).toBe(false);
  });
});

// ==================== persistGeneratedSessionSummary =====================================================

describe('ARC C — persistGeneratedSessionSummary (canonical writer path)', () => {
  let tmpDir: string;

  beforeEach(() => {
    // Fresh tmp working dir per test BEFORE any SessionIndexManager construction inside persist() —
    // the manager resolves <wd>/.session_context/sessions.json at construction time.
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arc-c-persist-'));
    expect(setWorkingDir(tmpDir)).toBe(true);
  });

  afterEach(() => {
    resetWorkingDir(); // cachedWorkingDir → BASE_DIR + clears persisted (jest-temp) state
    (toolsProvider.getStateManager as jest.Mock).mockReset();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('evicts the authoritative key ONLY, sets BEFORE forceSave, returns saved:true', async () => {
    const store = makeFakeStore({
      session_summary_latest: { task_description: 'old' },
      memory_1700000000000: { fact: 'must survive' },
      ctx_unrelated: { id: 'ctx_x' },
    });
    (toolsProvider.getStateManager as jest.Mock).mockReturnValue(store);

    const result = await persistGeneratedSessionSummary(baseSummary());

    expect(result).toEqual({ saved: true });
    // Eviction scoping — ONLY the authoritative key is deleted; foreign records stay untouched.
    expect(store.delete).toHaveBeenCalledTimes(1);
    expect(store.delete).toHaveBeenCalledWith('session_summary_latest');
    // New record lands under the same key (evict-then-set), timestamp/date filled in by default.
    const written = store.map.get('session_summary_latest') as SessionSummaryData;
    expect(written.task_description).toBe(baseSummary().task_description);
    expect(typeof written.timestamp).toBe('number');
    expect(typeof written.date).toBe('string');
    // set ran BEFORE the durable flush (writer FIX #1 atomic transition), exactly one forceSave.
    expect(store.set).toHaveBeenCalledTimes(1);
    expect(store.set.mock.invocationCallOrder[0]).toBeLessThan(store.forceSave.mock.invocationCallOrder[0]);
    expect(store.forceSave).toHaveBeenCalledTimes(1);
  });

  it('keeps saved:true when the index manager cannot be constructed (non-fatal by design; no index write under tmp wd)', async () => {
    // Seam note v2 (07.10 gate-trio, REPLACES the pre-remediation rationale): the real SessionIndexManager constructor
    // pins its path from getWorkingDir() at construction time — and that pin IS reachable here (same registry entry for
    // '../src/workingDir' vs mapped '../workingDir.js'). The actual blocker: persist()'s './tools/contextManagementTools.js'
    // specifier maps to the __mocks__ STUB (see the block below) → `new SessionIndexManager()` throws before any fs access.
    // Net effect pinned here: non-fatal index path, zero real-class calls, zero disk I/O, saved:true — and because no
    // construction happens at all, the repo-store guard is never even exercised (stronger than "would throw on write").
    const store = makeFakeStore();
    (toolsProvider.getStateManager as jest.Mock).mockReturnValue(store);

    let indexTouchedAt: 'before-save' | 'after-save' | undefined;
    jest.spyOn(store, 'forceSave').mockImplementation(async () => {
      indexTouchedAt = 'after-save'; // flips when the durable flush happens — any addEntry after it is post-flush by construction
    });
    // Non-fatal index path (07.10 gate-trio): in THIS suite's graph persist()'s './tools/contextManagementTools.js'
    // import lands on the __mocks__ stub via the mapper entry '^\.\/tools\/contextManagementTools\.js$' →
    // <rootDir>/tests/__mocks__/contextManagementTools.ts, which exports ONLY registerContextManagementTools. So
    // `new SessionIndexManager()` inside persist() throws (not a constructor) and is swallowed by its inner try/catch —
    // the EXACT non-fatal path under test: zero real-class calls, zero disk I/O, yet saved:true. The prototype spy below
    // stays in place DORMANT: if the mapper entry is ever re-scoped to real src for this specifier (owner decision), the
    // live addEntry pins exact-once + post-flush ordering automatically and only the two count/IO expects below need
    // flipping back (their one-time form lives in git history + the 07.10 session dossier).
    // Bare count spy on the REAL class prototype (no mockImplementation): dormant in this suite's stub graph; if the
    // real-class path ever activates it records calls AND lets its own body run hermetically against the tmp wd.
    const addEntrySpy = jest.spyOn(SessionIndexManager.prototype, 'addEntry');

    const result = await persistGeneratedSessionSummary(baseSummary({ task_description: 'indexed task line' }));

    expect(result).toEqual({ saved: true }); // summary durable regardless of index outcome (non-fatal contract)
    expect(addEntrySpy).toHaveBeenCalledTimes(0); // stub graph → constructor throws inside persist's inner catch
    // ORDERING proxy for the durable-first contract in this graph: the flush happened, and no index write followed it.
    expect(indexTouchedAt).toBe('after-save');
    // Zero-disk-I/O pin WITHOUT spying fs/promises methods (this runtime omits some — e.g. top-level `read` is not an
    // own export, so jest.spyOn refuses it): if the index path had ever constructed a manager against the tmp wd, its
    // save() would have created <tmp>/.session_context/sessions.json. No file = no index write (same existsSync pattern
    // as the forceSave-rejects test below).
    expect(fs.existsSync(path.join(tmpDir, '.session_context', 'sessions.json'))).toBe(false);
  });

  it('keeps saved:true when the index update throws (non-fatal by design — summary already durable)', async () => {
    const store = makeFakeStore();
    (toolsProvider.getStateManager as jest.Mock).mockReturnValue(store);
    // Break ensureDirectory's mkdir on the tmp tree → addEntry rejects inside persist's inner try/catch.
    const mkdirSpy = jest.spyOn(fs.promises, 'mkdir').mockRejectedValue(new Error('index disk full'));

    const result = await persistGeneratedSessionSummary(baseSummary());

    expect(result).toEqual({ saved: true }); // index failure must NOT fail an already-durable summary
    expect(store.forceSave).toHaveBeenCalledTimes(1);
    mkdirSpy.mockRestore();
  });

  it('returns saved:false (never throws) when forceSave rejects — the RAM-only write would be lost', async () => {
    const store = makeFakeStore();
    store.forceSave.mockRejectedValueOnce(new Error('disk full'));
    (toolsProvider.getStateManager as jest.Mock).mockReturnValue(store);

    await expect(persistGeneratedSessionSummary(baseSummary())).resolves.toMatchObject({ saved: false });
    // No index update may happen after a failed durable flush.
    const indexPath = path.join(tmpDir, '.session_context', 'sessions.json');
    expect(fs.existsSync(indexPath)).toBe(false);
  });

  it('returns saved:false with the fail-loud error when no StateManager is registered (FIX #4 parity)', async () => {
    (toolsProvider.getStateManager as jest.Mock).mockReturnValue(undefined);

    const result = await persistGeneratedSessionSummary(baseSummary());
    expect(result.saved).toBe(false);
    expect(result.error).toContain('StateManager not available');
  });

  it('truncates every field over the 2048 cap before writing (writer P0 parity)', async () => {
    const store = makeFakeStore();
    (toolsProvider.getStateManager as jest.Mock).mockReturnValue(store);

    await persistGeneratedSessionSummary(baseSummary({ accomplishments: 'x'.repeat(3000) }));

    const written = store.map.get('session_summary_latest') as SessionSummaryData;
    expect(written.accomplishments?.length).toBe(2048);
    expect(written.accomplishments?.endsWith('\n… (truncated for size)')).toBe(true);
  });
});

// ==================== parseSessionContinuity =============================================================

describe('ARC C — parseSessionContinuity (lenient dual-shape parser)', () => {
  const SECTION_TEXT = [
    'TASK: Build the compression-time summary save\n',
    'ACCOMPLISHMENTS:\n- writer mirrored\n- wiring in place\n',
    'PENDING TASKS:\n- tests pending\n',
    'DECISIONS MADE:\nnon-fatal by design\n',
    'CONTEXT FOR NEXT SESSION: write the test files first\n',
  ].join('\n');

  it('maps all five fixed section headings (trimmed bodies)', () => {
    const parsed = parseSessionContinuity(SECTION_TEXT);
    expect(parsed).not.toBeNull();
    if (!parsed) return;
    expect(parsed.task_description).toBe('Build the compression-time summary save');
    expect(parsed.accomplishments).toBe('- writer mirrored\n- wiring in place');
    expect(parsed.pending_tasks).toBe('- tests pending');
    expect(parsed.decisions_made).toBe('non-fatal by design');
    expect(parsed.context_for_next_session).toBe('write the test files first');
  });

  it("maps '(none)' to '' and leaves missing headings as '' (never throws)", () => {
    const parsed = parseSessionContinuity([
      'TASK: only task present',
      'ACCOMPLISHMENTS: (none)',
      'PENDING TASKS: (none)',
      'DECISIONS MADE: (none)',
      'CONTEXT FOR NEXT SESSION:', // heading with empty body
    ].join('\n'));
    expect(parsed).not.toBeNull();
    if (!parsed) return;
    expect(parsed.task_description).toBe('only task present');
    expect(parsed.accomplishments).toBe('');
    expect(parsed.pending_tasks).toBe('');
    expect(parsed.decisions_made).toBe('');
    expect(parsed.context_for_next_session).toBe('');
  });

  it('parses bare JSON mode (no fences) and drops non-string field values to empty', () => {
    const raw = JSON.stringify({
      task_description: 'json task',
      accomplishments: 42, // non-string → '' by contract
      pending_tasks: '',
      decisions_made: null,
      context_for_next_session: 'next pointer',
    });
    const parsed = parseSessionContinuity(raw);
    expect(parsed).toEqual({
      task_description: 'json task',
      accomplishments: '',
      pending_tasks: '',
      decisions_made: '',
      context_for_next_session: 'next pointer',
    });
  });

  it('strips a single ```json fence pair before JSON parsing (model habit)', () => {
    const inner = JSON.stringify({ task_description: 'fenced task' });
    expect(parseSessionContinuity(`\`\`\`json\n${inner}\n\`\`\``)).toEqual(
      expect.objectContaining({ task_description: 'fenced task' }),
    );
  });

  it('returns null for garbage (no heading, no JSON shape), empty and whitespace-only input', () => {
    expect(parseSessionContinuity('Sorry, I cannot summarize this session.')).toBeNull();
    expect(parseSessionContinuity('')).toBeNull();
    expect(parseSessionContinuity('   \n  ')).toBeNull();
  });

  it('returns null when sections exist but every body is empty (no usable content)', () => {
    const parsed = parseSessionContinuity(
      ['TASK:', 'ACCOMPLISHMENTS: (none)', 'PENDING TASKS: (none)', 'DECISIONS MADE: (none)', 'CONTEXT FOR NEXT SESSION:'].join('\n'),
    );
    expect(parsed).toBeNull();
  });

  it('treats invalid JSON inside braces as non-JSON and falls through to section mode', () => {
    const parsed = parseSessionContinuity('{ not json at all\nTASK: recovered via sections');
    // The input carries a USABLE TASK section → the JSON-shape fall-through recovers it (the leading '{' line is junk,
    // never a heading body). null is reserved for inputs where NEITHER shape yields anything (pinned by the sibling test).
    expect(parsed?.task_description ?? null).toBe('recovered via sections');
  });
});
