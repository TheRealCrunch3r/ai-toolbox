/**
 * Hermetic read-guard suite for executeProjectSwitch()'s post-switch session-memory load —
 * CONTAMINATION-FIX follow-up C / Gap-2 + Gap-2b (01.10).
 *
 * Why this exists: the switch-time injection previously read ONE hardcoded file
 * <wd>/.session_context/.ai_toolbox_memory.msgpack and understood ONLY the legacy object-map shape — so real
 * StateManager stores (record arrays) were decoded but never yielded a summary ("Session memory exists but no
 * summary found" despite populated files). executeProjectSwitch() was EXPORTED from src/promptPreprocessor.ts
 * specifically for this suite (see its doc comment, 01.10). Pinned here:
 *   Gap-2 : candidate-path loop — per-project .<basename>_memory.msgpack FIRST, legacy fixed-name file as
 *           fallback; reads are scoped to the TARGET cwd only (no cross-project access);
 *   Gap-2b: extractLatestSessionSummary() understands BOTH writer shapes (CURRENT StateManager record array
 *           [{key,value,timestamp}] with key 'session_summary*' AND legacy object maps).
 *
 * Hermetic by design: all I/O goes to os.tmpdir() subdirs with controlled basenames ('alpha'/'beta') — the
 * repo-store guard in jest.config.cjs (setupFiles) still protects <rootDir>/.session_context. Working-dir seam
 * mirrors tests/stateManagerRefreshProject.test.ts (globalThis + module factory):
 *   - ../src/workingDir    → getWorkingDir/setWorkingDir via a globalThis seam (setWorkingDir must return true
 *                            so applyProjectCwdSwitch() proceeds); listRegisteredProjects pinned empty.
 *   - ../src/toolsProvider → getStateManager() => null: skips the Part-A refreshProject identity rebind, which
 *                            is OUT OF SCOPE here and already pinned by stateManagerRefreshProject.test.ts.
 *   - process.chdir        → spied no-op per test so jest's own cwd never changes (applyProjectCwdSwitch calls it
 *                            best-effort when the persistent dir differs from process.cwd()).
 */

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { encode } from '@msgpack/msgpack';
import type { PromptPreprocessorController } from '@lmstudio/sdk';

// ── Seams (globalThis on purpose: jest.mock factory hoisting forbids out-of-scope variable refs) ──────────────
jest.mock('../src/workingDir', () => ({
  getWorkingDir: (): string => (globalThis as Record<string, unknown>).__smrg_wd as string,
  setWorkingDir: (wd: string): boolean => {
    (globalThis as Record<string, unknown>).__smrg_wd = wd;
    return true;
  },
  listRegisteredProjects: (): unknown[] => [],
}));

jest.mock('../src/toolsProvider', () => ({ getStateManager: jest.fn(() => null) }));

// No-op stubs for the preprocess()-path methods (NOT exercised by this suite — keeps module-load side effects inert).
jest.mock('../src/autoTracker', () => ({
  autoTracker: {
    updateConfig: jest.fn(),
    hasPendingWarning: jest.fn(() => false),
    consumePendingConfirmation: jest.fn(),
    checkAndGeneratePrompt: jest.fn(() => ({ triggered: false, warning: undefined })),
    processUserReply: jest.fn(),
    flushActionsToMemory: jest.fn(async () => 0),
    autoSaveSessionMemory: jest.fn(async () => ({ saved: false })),
    analyzeMessage: undefined,
  },
}));

import { executeProjectSwitch } from '../src/promptPreprocessor';

const G = globalThis as Record<string, unknown>;

/** Minimal PromptPreprocessorController stub: config.get() → undefined exercises the documented defaults
 * (temporalAwareness ON, style 'standard'). */
function makeCtl(): PromptPreprocessorController {
  return { getPluginConfig: () => ({ get: () => undefined }) } as unknown as PromptPreprocessorController;
}

const BANNER = '📋 SESSION MEMORY LOADED';

describe('executeProjectSwitch session-memory read guards (CONTAMINATION-FIX follow-up C)', () => {
  let rootDir: string;
  let dirA: string; // basename 'alpha' → per-project store '.alpha_memory.msgpack'
  let dirB: string; // basename 'beta'  → per-project store '.beta_memory.msgpack'

  beforeAll(async () => {
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'smrg-'));
    dirA = path.join(rootDir, 'alpha');
    dirB = path.join(rootDir, 'beta');
    await fs.mkdir(dirA, { recursive: true });
    await fs.mkdir(dirB, { recursive: true });
  });

  afterAll(async () => {
    G.__smrg_wd = undefined;
    jest.restoreAllMocks();
    await fs.rm(rootDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    // The switch always targets B; seed A's store only where a case needs it. Start clean each test.
    G.__smrg_wd = dirA;
    jest.spyOn(process, 'chdir').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await fs.rm(path.join(dirB, '.session_context'), { recursive: true, force: true });
    await fs.rm(path.join(dirA, '.session_context'), { recursive: true, force: true });
  });

  /** Seed a msgpack store file (or raw bytes when payload is a Buffer) under <dir>/.session_context/. */
  async function seedStore(dir: string, fileName: string, payload: unknown): Promise<string> {
    const ctx = path.join(dir, '.session_context');
    await fs.mkdir(ctx, { recursive: true });
    const p = path.join(ctx, fileName);
    if (Buffer.isBuffer(payload)) await fs.writeFile(p, payload);
    else await fs.writeFile(p, encode(payload));
    return p;
  }

  test('Gap-2: per-project store wins when BOTH candidate files exist', async () => {
    // Legacy fixed-name file present too — must be ignored in favor of the per-project name.
    await seedStore(dirB, '.ai_toolbox_memory.msgpack', { latest_session_summary: 'LEGACY-MUST-BE-IGNORED' });
    await seedStore(
      dirB,
      '.beta_memory.msgpack',
      [{ key: 'session_summary_latest', value: { task_description: 'PER-PROJECT-WINS' }, timestamp: Date.now() }],
    );

    const out = await executeProjectSwitch(dirB, 'hello-switch', '', '', makeCtl());

    expect(out).toContain(BANNER);
    expect(out).toContain('PER-PROJECT-WINS');
    expect(out).not.toContain('LEGACY-MUST-BE-IGNORED');
  });

  test('Gap-2: falls back to the legacy fixed-name file when no per-project store exists', async () => {
    await seedStore(dirB, '.ai_toolbox_memory.msgpack', { latest_session_summary: 'LEGACY-FALLBACK-SUMMARY' });

    const out = await executeProjectSwitch(dirB, 'hello-switch', '', '', makeCtl());

    expect(out).toContain(BANNER);
    expect(out).toContain('LEGACY-FALLBACK-SUMMARY');
  });

  test('Gap-2b regression: CURRENT StateManager record-array shape yields a summary (pre-fix: "no summary found")', async () => {
    // Pre-fix, the injection path only understood legacy object maps — a real store decoded fine but NEVER
    // produced text. Pin both value shapes the helper accepts on array records.
    await seedStore(dirB, '.beta_memory.msgpack', [
      { key: 'some_other_key', value: 'irrelevant', timestamp: 1 },
      {
        key: 'session_summary_latest',
        value: { task_description: 'CURRENT-ARRAY-TASK-DESC', accomplishments: 'did stuff' },
        timestamp: Date.now(),
      },
    ]);

    const out = await executeProjectSwitch(dirB, 'hello-switch', '', '', makeCtl());

    expect(out).toContain(BANNER);
    expect(out).toContain('CURRENT-ARRAY-TASK-DESC');
  });

  test('no store file present → original prompt, no banner, no throw', async () => {
    // dirB has no .session_context directory at all.
    const out = await executeProjectSwitch(dirB, 'hello-switch', '', '', makeCtl());

    expect(out).not.toContain(BANNER);
    expect(out.startsWith('hello-switch')).toBe(true);
  });

  test('empty (0-byte) store file → no summary, switch still succeeds', async () => {
    // 0 bytes: msgpack decode throws on the empty buffer AND the JSON fallback sees '' — both must be contained.
    await seedStore(dirB, '.beta_memory.msgpack', Buffer.alloc(0));

    const out = await executeProjectSwitch(dirB, 'hello-switch', '', '', makeCtl());

    expect(out).not.toContain(BANNER);
    expect(out.startsWith('hello-switch')).toBe(true);
  });


  test('malformed msgpack bytes fall back to plain-JSON parse of the same file', async () => {
    // The candidate path is found (existsSync), but the bytes are NOT valid msgpack — decode throws and the
    // JSON fallback must rescue a legacy-shaped map stored as UTF-8 text.
    const jsonBytes = Buffer.from(JSON.stringify({ latest_session_summary: 'JSON-FALLBACK-SUMMARY' }), 'utf-8');
    await seedStore(dirB, '.beta_memory.msgpack', jsonBytes);

    const out = await executeProjectSwitch(dirB, 'hello-switch', '', '', makeCtl());

    expect(out).toContain(BANNER);
    expect(out).toContain('JSON-FALLBACK-SUMMARY');
  });

  test('corrupt store in BOTH shapes → defensive net: switch succeeds without a banner', async () => {
    // Neither valid msgpack NOR valid JSON — both decode paths throw; the switch must still return the prompt.
    const garbage = Buffer.from('\x01\x02 not-msgpack-not-json!!', 'utf-8');
    await seedStore(dirB, '.beta_memory.msgpack', garbage);

    const out = await executeProjectSwitch(dirB, 'hello-switch', '', '', makeCtl());

    expect(out).not.toContain(BANNER);
    expect(out.startsWith('hello-switch')).toBe(true);
  });


  test('reads are scoped to the target cwd — previous project store never accessed', async () => {
    // ALPHA keeps its own live store with a recognizable sentinel; BETA has an EMPTY .session_context dir.
    const alphaStore = await seedStore(
      dirA,
      '.alpha_memory.msgpack',
      [{ key: 'session_summary_latest', value: { task_description: 'ALPHA-NEVER-CROSSED' }, timestamp: Date.now() }],
    );
    const beforeBytes = await fs.readFile(alphaStore);
    await fs.mkdir(path.join(dirB, '.session_context'), { recursive: true });

    const out = await executeProjectSwitch(dirB, 'hello-switch', '', '', makeCtl());

    expect(out).not.toContain(BANNER);
    expect(out).not.toContain('ALPHA-NEVER-CROSSED');
    // The previous project's file must be untouched — the read path is strictly scoped to newCwd.
    expect(await fs.readFile(alphaStore)).toEqual(beforeBytes);
  });
});
