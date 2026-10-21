/**
 * UPDATE-CHECK PHASE 2 (19.10, owner GO) — hermetic suite for the dismiss_update_reminder tool + its strict gate.
 * Same conventions as toolsProvider.test.ts: temp dataDir via setDataDirOverride + quiet same-version fetch mock,
 * both restored in afterAll so no other suite inherits them; state file lives ONLY in the temp dir (never real ~/.lmstudio).
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { registerUpdateReminderTools } from '../src/tools/updateReminderTools.js';
import { setDataDirOverride } from '../src/dataDir.js';
import { LOCAL_VERSION, getUpdateStatus, hasBeenDismissed } from '../src/updateChecker.js';

const origFetch = globalThis.fetch;
let tmp: string | undefined;
beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atb-updt-dismiss-'));
  setDataDirOverride(tmp);
  // .VERSION body === LOCAL_VERSION (v-prefixed house format) → getUpdateStatus() is ALWAYS quiet (same version) — no warn lines, no side effects.
  globalThis.fetch = (async () => ({ ok: true, text: async () => LOCAL_VERSION })) as typeof fetch;
});
afterAll(() => {
  setDataDirOverride(undefined); // never leak an override into other suites
  globalThis.fetch = origFetch; // restore the environment fetch exactly
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

describe('dismiss_update_reminder — strict gate', () => {
  test('absent unless updateCheckEnabled === true EXACTLY (undefined/false/non-boolean all skip)', () => {
    expect(registerUpdateReminderTools({})).toEqual([]);
    expect(registerUpdateReminderTools({ updateCheckEnabled: false })).toEqual([]);
    expect((registerUpdateReminderTools({ updateCheckEnabled: 1 as unknown }) as unknown[]).length).toBe(0); // strict ===true house rule (stub parity)
    const on = registerUpdateReminderTools({ updateCheckEnabled: true });
    // REPO-LINK B1 (19.10, owner GO): registration order = dismiss first, read-only info second; pin the full set exactly (house convention).
    expect(on.map((t) => t.name)).toEqual(['dismiss_update_reminder', 'get_update_info']);
    expect(typeof on[0].implementation).toBe('function');
    expect(typeof on[1].implementation).toBe('function');
  });
});

describe('dismiss_update_reminder — behavior (temp dataDir only)', () => {
  test('valid version → success + persisted to dismissed[] in <dataDir>/update-check.json', async () => {
    const [tool] = registerUpdateReminderTools({ updateCheckEnabled: true }) as Array<{ implementation?: (p: Record<string, unknown>) => Promise<unknown> }>;
    const out = (await tool.implementation!({ version: 'v9.8.7' })) as Record<string, unknown>;
    expect(out.success).toBe(true);
    // updateChecker normalizes (strips the v-) before persisting — bare form on disk
    const state = JSON.parse(fs.readFileSync(path.join(tmp!, 'update-check.json'), 'utf8')) as { dismissed?: string[] };
    expect(state.dismissed).toContain('9.8.7');
    expect(hasBeenDismissed('v9.8.7')).toBe(true); // consumer-side parity with the v- form
  });

  test('missing/invalid version → SDK zod guard rejects pre-implementation; whitespace-only reaches my error envelope', async () => {
    const [tool] = registerUpdateReminderTools({ updateCheckEnabled: true }) as Array<{ implementation?: (p: Record<string, unknown>) => Promise<unknown> }>;
    // The SDK tool() builder validates the required z.string('version') BEFORE the implementation runs — missing or
    // wrong-type params are rejected by the SDK itself (that is the guard working; no envelope exists pre-implementation).
    // Robust to sync-throw OR rejected-promise settlement shape:
    const outcomeOf = async (p: Record<string, unknown>): Promise<{ threw: boolean; value?: Record<string, unknown> }> => {
      try {
        return { threw: false, value: (await tool.implementation!(p)) as Record<string, unknown> };
      } catch (e) {
        return { threw: true, value: e instanceof Error ? { error: e.message } : undefined };
      }
    };
    const missing = await outcomeOf({});
    expect(missing.threw).toBe(true); // SDK guard fired (owner-observed 17.05: 'Failed to parse arguments … invalid_type … Required')
    const wrongType = await outcomeOf({ version: 42 });
    expect(wrongType.threw).toBe(true);
    // Whitespace-only passes zod (it IS a string) and reaches MY guard → clean error envelope, no throw.
    const ws = await outcomeOf({ version: '   ' });
    expect(ws.threw).toBe(false);
    expect(ws.value?.success).toBe(false);
  });

  test('dismissed newer release → Phase-1 getUpdateStatus goes quiet (the loop actually closes)', async () => {
    // Seed cached NEWER release directly — exercises the fresh-cache path, zero network.
    fs.writeFileSync(path.join(tmp!, 'update-check.json'), JSON.stringify({ latestVersion: '9.8.7', url: 'https://x', checkedAt: Date.now() }));
    const before = await getUpdateStatus(); // strictly newer → WOULD notify (this is the Phase-1 nag)
    expect(before).toEqual({ version: '9.8.7', url: 'https://x' });

    const [tool] = registerUpdateReminderTools({ updateCheckEnabled: true }) as Array<{ implementation?: (p: Record<string, unknown>) => Promise<unknown> }>;
    await tool.implementation!({ version: before!.version });

    expect(await getUpdateStatus()).toBeNull(); // same tick, fresh cache, now dismissed → quiet forever per version
  });
});


// ==================== REPO-LINK B1 (19.10, owner GO): read-only get_update_info — in-chat link surface ====================

describe('get_update_info — behavior (temp dataDir only)', () => {
  const infoTool = async (): Promise<(p: Record<string, unknown>) => Promise<unknown>> => {
    const tools = registerUpdateReminderTools({ updateCheckEnabled: true }) as Array<{ name?: string; implementation?: (p: Record<string, unknown>) => Promise<unknown> }>;
    const t = tools.find((x) => x.name === 'get_update_info');
    expect(t?.implementation).toBeInstanceOf(Function);
    return t!.implementation!;
  };

  afterEach(() => { fs.rmSync(path.join(tmp!, 'update-check.json'), { force: true }); }); // one seeded file per test — no cross-test state leakage

  test('fresh-cached NEWER release with url → updateAvailable + latestVersion + releaseUrl (zero network)', async () => {
    fs.writeFileSync(path.join(tmp!, 'update-check.json'), JSON.stringify({ latestVersion: '9.8.7', url: 'https://x', checkedAt: Date.now() }));
    const out = (await (await infoTool())({})) as Record<string, unknown>;
    expect(out.success).toBe(true);
    expect(out.installedVersion).toBe(LOCAL_VERSION);
    expect(out.updateAvailable).toBe(true);
    expect(out.latestVersion).toBe('9.8.7');
    expect(out.releaseUrl).toBe('https://x'); // the field option B renders as a clickable Markdown link in chat
    expect(typeof out.note).toBe('string');
  });

  test('fresh-cached SAME version → quiet envelope without url key (the no-update case must not fabricate one)', async () => {
    fs.writeFileSync(path.join(tmp!, 'update-check.json'), JSON.stringify({ latestVersion: LOCAL_VERSION.replace(/^v/i, ''), checkedAt: Date.now() }));
    const out = (await (await infoTool())({})) as Record<string, unknown>;
    expect(out.success).toBe(true);
    expect(out.updateAvailable).toBe(false);
    expect('releaseUrl' in out).toBe(false); // spread-gate verified — no undefined-key noise for the LLM
  });

  test('empty state (no file) → one fetch via TTL, mock answers same-version → quiet envelope', async () => {
    // No update-check.json on disk + checkedAt absent → NOT fresh → exactly ONE outbound attempt; the file-level fetch mock
    // answers tag_name === LOCAL_VERSION → compareVersions 0 → null → quiet path (proves the stale-cache branch is hermetic).
    const out = (await (await infoTool())({})) as Record<string, unknown>;
    expect(out.success).toBe(true);
    expect(out.updateAvailable).toBe(false);
    // The attempt stamps a fresh checkedAt on disk even for quiet outcomes (TTL covers failures too — ≤1 fetch/day house rule)
    const state = JSON.parse(fs.readFileSync(path.join(tmp!, 'update-check.json'), 'utf8')) as { checkedAt?: number };
    expect(typeof state.checkedAt).toBe('number');
  });

  test('dismissed newer release → quiet envelope even though a newer version is cached (loop closes on read too)', async () => {
    fs.writeFileSync(path.join(tmp!, 'update-check.json'), JSON.stringify({ latestVersion: '9.8.7', url: 'https://x', checkedAt: Date.now(), dismissed: ['9.8.7'] }));
    const out = (await (await infoTool())({})) as Record<string, unknown>;
    expect(out.updateAvailable).toBe(false);
    expect('releaseUrl' in out).toBe(false);
  });

  test('read-only contract: NO dismissed[] write and notifiedVersion untouched by any read', async () => {
    fs.writeFileSync(path.join(tmp!, 'update-check.json'), JSON.stringify({ latestVersion: '9.8.7', url: 'https://x', checkedAt: Date.now() }));
    await (await infoTool())({});
    const state = JSON.parse(fs.readFileSync(path.join(tmp!, 'update-check.json'), 'utf8')) as Record<string, unknown>;
    expect('dismissed' in state).toBe(false); // a read must never record a dismissal
    expect(state.notifiedVersion).toBeUndefined(); // and never touch the NOTIF-DEDUPE latch either
  });

  test('gate parity: get_update_info absent whenever the strict gate is not === true', () => {
    for (const cfg of [{}, { updateCheckEnabled: false }, { updateCheckEnabled: 1 as unknown }]) {
      expect(registerUpdateReminderTools(cfg).map((t) => t.name)).toEqual([]);
    }
  });
});
