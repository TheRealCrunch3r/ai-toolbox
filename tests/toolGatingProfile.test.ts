/**
 * Tool Gating Profile (v1.9.17) — persistence semantics for user tool toggles.
 *
 * Storage is redirected to a temp file per run via AI_TOOLBOX_GATING_PROFILE_PATH (set in
 * tests/setup.ts), so these suites never touch the real %USERPROFILE%. Each test resets the
 * module cache AND removes the temp path, guaranteeing hermetic state between cases.
 *
 * providerPass() mirrors how src/toolsProvider.ts drives the profile: ONE syncToolGatingProfile()
 * call per pass with a PRISTINE host config (the SDK's getPluginConfig is per-chat scoped, so each
 * "new chat" starts from schematic defaults for unset keys).
 */

import os from 'os';
import path from 'path';
import fsSync from 'fs';
import { DEFAULT_CONFIG } from '../src/config.js';
import {
  applyGatingOverlay,
  clearGatingProfile,
  getLoadedGatingProfile,
  getProfilePath,
  loadGatingProfile,
  resetGatingProfileCache,
  syncToolGatingProfile,
} from '../src/tools/toolGatingProfile.js';

// No jest config in this repo wires setup files, so the storage redirect is self-contained here:
// persistent toggles must never land in the real %USERPROFILE% during tests. Set-once (??=).
if (!process.env.AI_TOOLBOX_GATING_PROFILE_PATH) {
  process.env.AI_TOOLBOX_GATING_PROFILE_PATH = path.join(
    os.tmpdir(),
    `ai_toolbox_gating_profile_test_${process.pid}.json`,
  );
}

const PROFILE_PATH = process.env.AI_TOOLBOX_GATING_PROFILE_PATH;

function seedProfileFile(toggles: Record<string, boolean>): void {
  const dir = path.dirname(PROFILE_PATH!);
  fsSync.mkdirSync(dir, { recursive: true });
  fsSync.writeFileSync(PROFILE_PATH!, JSON.stringify({ toggles }));
}

/** One provider-style pass: pristine host config in, final gated config out + whether storage wrote. */
async function providerPass(
  liveConfig: Record<string, unknown>,
): Promise<{ config: Record<string, unknown>; wrote: boolean }> {
  const draft = { ...liveConfig };
  const wrote = await syncToolGatingProfile(draft);
  return { config: draft, wrote };
}

function readStored(): Record<string, boolean> {
  const raw = JSON.parse(fsSync.readFileSync(PROFILE_PATH!, 'utf-8'));
  return raw.toggles;
}

describe('toolGatingProfile', () => {
  beforeAll(() => {
    // env redirect (top of this file) must be in effect → storage is NOT under the real home dir
    expect(PROFILE_PATH).toBeTruthy();
    expect(getProfilePath()).toBe(PROFILE_PATH);
    expect(path.dirname(PROFILE_PATH!)).toBe(os.tmpdir());
  });

  beforeEach(() => {
    resetGatingProfileCache();
    try {
      fsSync.unlinkSync(PROFILE_PATH!);
    } catch {
      // fine if absent on first run
    }
  });

  test('bootstrap: live non-default choices are captured; storage stays sparse (no defaults written)', async () => {
    const { config, wrote } = await providerPass({ ...DEFAULT_CONFIG, executionShell: true, webSearch: false });
    expect(wrote).toBe(true);
    expect(config.executionShell).toBe(true);
    expect(config.webSearch).toBe(false);

    // EXACTLY the two touched keys on disk — no defaults, nothing else (sparse contract)
    expect(readStored()).toEqual({ executionShell: true, webSearch: false });

    resetGatingProfileCache();
    const reloaded = await loadGatingProfile();
    expect(reloaded).toEqual({ toggles: { executionShell: true, webSearch: false } });

    // stored values apply over a fresh defaults config (sticky overlay unit check)
    const draft = { ...DEFAULT_CONFIG };
    applyGatingOverlay(draft);
    expect(draft.executionShell).toBe(true);
    expect(draft.webSearch).toBe(false);
    expect(draft.fileSystem).toBe(DEFAULT_CONFIG.fileSystem); // untouched key keeps its default
  });

  test('STEADY STATE: repeated passes at identical values perform no disk write', async () => {
    const first = await providerPass({ ...DEFAULT_CONFIG, executionShell: true });
    expect(first.wrote).toBe(true);
    const snapshot = readStored();
    const second = await providerPass({ ...DEFAULT_CONFIG, executionShell: true });
    expect(second.wrote).toBe(false); // idempotent — no I/O in steady state
    expect(readStored()).toEqual(snapshot);
  });

  test('STICKY ACROSS CHATS: fresh-chat defaults-fallback does NOT erase stored choices', async () => {
    // user enabled shell execution + god mode in chat N (both non-default → captured)
    await providerPass({ ...DEFAULT_CONFIG, executionShell: true, godMode: true });

    // "new chat": the per-chat host config hands back pristine defaults for everything.
    // The overlay must restore both stored choices — and no write may occur (nothing changed).
    const { config, wrote } = await providerPass({ ...DEFAULT_CONFIG });
    expect(config.executionShell).toBe(true);
    expect(config.godMode).toBe(true);
    expect(wrote).toBe(false); // sticky values re-applied from memory; disk untouched
    expect(readStored()).toEqual({ executionShell: true, godMode: true });
  });

  test('STICKY ACROSS RESTARTS: a cold module cache still restores stored choices from disk', async () => {
    await providerPass({ ...DEFAULT_CONFIG, executionShell: true });
    resetGatingProfileCache(); // simulate process restart (cache lost, file remains)

    const { config } = await providerPass({ ...DEFAULT_CONFIG }); // fresh chat after restart
    expect(config.executionShell).toBe(true);
  });

  test('NON-DEFAULT LIVE VALUE BEATS STICKY: different non-default re-toggle overwrites storage', async () => {
    // Unit-seeded sticky entry (real sparse capture never stores default-valued toggles —
    // DEFAULT_CONFIG.webSearch is `true`, so an ON entry can only exist via this simulation):
    seedProfileFile({ webSearch: true });
    resetGatingProfileCache();
    await loadGatingProfile();

    // in this chat the user turned web search OFF — live=false is NON-DEFAULT (default=true) and ≠ stored
    const { config, wrote } = await providerPass({ ...DEFAULT_CONFIG, webSearch: false });
    expect(config.webSearch).toBe(false); // live intent honored for THIS pass
    expect(wrote).toBe(true); // storage updated so the new choice persists to future chats
    expect(readStored()).toEqual({ webSearch: false });

    // and it is sticky from here on: a fresh chat keeps webSearch=false even at defaults fallback
    const next = await providerPass({ ...DEFAULT_CONFIG });
    expect(next.config.webSearch).toBe(false);
  });

  test('CONTRACT: default-valued reverts do NOT evict storage (per-chat ambiguity — documented limitation)', async () => {
    // stored godMode=true; a fresh chat looks EXACTLY like "user turned god mode back off"
    // (live=false=default in both cases). Per the agreed conservative contract, sticky wins:
    seedProfileFile({ godMode: true });
    resetGatingProfileCache();
    await loadGatingProfile();

    const { config, wrote } = await providerPass({ ...DEFAULT_CONFIG });
    expect(config.godMode).toBe(true); // sticky preserved — NOT evicted
    expect(wrote).toBe(false);
    expect(readStored()).toEqual({ godMode: true });
  });

  test('capture stores booleans only: strings, numbers and unknown keys are never persisted', async () => {
    const live = {
      ...DEFAULT_CONFIG,
      defaultBranch: 'not-main', // string — must NOT be stored
      stateMaxSize: 12345, // number — must NOT be stored
      totallyUnknownKey: true, // unknown key — must NOT be stored
      executionShell: true, // boolean + non-default → stored
    };
    await providerPass(live);
    expect(readStored()).toEqual({ executionShell: true });
  });

  test('overlay never injects profile entries for keys that are not boolean config fields', async () => {
    seedProfileFile({ bogusKey: true, fileSystem: false });
    resetGatingProfileCache();
    await loadGatingProfile();

    const draft = { ...DEFAULT_CONFIG };
    applyGatingOverlay(draft);
    expect((draft as Record<string, unknown>).bogusKey).toBeUndefined(); // not injected
    expect(draft.fileSystem).toBe(false); // valid sticky key applied
  });

  test('clear removes the file and in-memory state; repeated clear is a no-op without throwing', async () => {
    await providerPass({ ...DEFAULT_CONFIG, executionShell: true });
    expect(fsSync.existsSync(PROFILE_PATH!)).toBe(true);

    resetGatingProfileCache();
    expect(await clearGatingProfile()).toBe(true);
    expect(fsSync.existsSync(PROFILE_PATH!)).toBe(false);

    // subsequent load → empty; a second clear must not throw
    await loadGatingProfile();
    expect(await loadGatingProfile()).toEqual({ toggles: {} });
    expect(await clearGatingProfile()).toBe(true);
  });

  test('missing file, corrupt JSON and wrong shapes all degrade to an empty profile (never throws)', async () => {
    resetGatingProfileCache();
    expect(await loadGatingProfile()).toEqual({ toggles: {} }); // missing file → first run

    fsSync.writeFileSync(PROFILE_PATH!, '{ this is not valid json !!!');
    resetGatingProfileCache();
    expect(await loadGatingProfile()).toEqual({ toggles: {} });

    fsSync.writeFileSync(PROFILE_PATH!, JSON.stringify([1, 2, 3])); // top-level array → wrong shape
    resetGatingProfileCache();
    expect(await loadGatingProfile()).toEqual({ toggles: {} });

    fsSync.writeFileSync(PROFILE_PATH!, JSON.stringify({ toggles: 'nope' })); // non-object toggles map
    resetGatingProfileCache();
    expect(await loadGatingProfile()).toEqual({ toggles: {} });
  });

  test('env override redirects storage and the cache tracks path changes', async () => {
    await providerPass({ ...DEFAULT_CONFIG, executionShell: true });
    expect(getLoadedGatingProfile()?.toggles.executionShell).toBe(true);

    const overridden = path.join(os.tmpdir(), 'toolgating-never-written-here.json');
    process.env.AI_TOOLBOX_GATING_PROFILE_PATH = overridden;
    try {
      expect(getProfilePath()).toBe(overridden);
      // cache belongs to the previous path → must read as "no memory", not stale data
      expect(getLoadedGatingProfile()).toBeNull();

      // and a pass under the new path bootstraps independently (separate file)
      const { wrote } = await providerPass({ ...DEFAULT_CONFIG, webSearch: false });
      expect(wrote).toBe(true);
    } finally {
      process.env.AI_TOOLBOX_GATING_PROFILE_PATH = PROFILE_PATH;
      resetGatingProfileCache();
      try {
        fsSync.unlinkSync(overridden);
      } catch {
        // fine if absent
      }
    }
  });
});
