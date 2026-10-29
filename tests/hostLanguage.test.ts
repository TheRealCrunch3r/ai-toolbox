/**
 * hostLanguage — UNIFIED LANGUAGE v2 step 3 (26.10).
 *
 * Hermetic by construction: every suite pins either the AI_TOOLBOX_LM_HOME env seam or a fake home dir,
 * so NO test can read the developer's real ~/.lmstudio-home-pointer / ~/.lmstudio/settings.json (same
 * isolation intent as dataDir.ts).
 *
 * HOME-DIR CONTROL: via the TEST-ONLY function seam setLmHomeOverride() in src/hostLanguage — a plain in-process
 * variable consulted FIRST by resolveLmHome(), before env and os.homedir(). History: (1) jest.spyOn(os, 'homedir')
 * is impossible in this combo ("TypeError: Cannot redefine property: homedir" — core-module props non-configurable);
 * (2) USERPROFILE/HOME env overrides WORK in plain node but were IGNORED by os.homedir() under this repo's jest
 * runner (26.10 gate: 8 cases leaked the real developer profile, totals still exact at 78/1159 — so it is a
 * platform/jest-specific homedir-resolution quirk). The seam removes all dependence on libuv env behavior; cleared in
 * every afterEach so no suite can leak a pinned home into another.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { LM_HOME_ENV, setLmHomeOverride, resolveLmHome, readHostLanguageSetting, mapHostLanguage, getHostLocale } from '../src/hostLanguage';

/** Create an empty fixture home dir under a fresh tmp root. */
function makeDir(base: string, name: string): string {
  const p = path.join(base, name);
  fs.mkdirSync(p, { recursive: true });
  return p;
}

/** Write settings.json into a fixture home. `raw` may be a JSON string (for corrupt-JSON cases) or an object. */
function writeSettings(home: string, raw: unknown): void {
  fs.writeFileSync(path.join(home, 'settings.json'), typeof raw === 'string' ? raw : JSON.stringify(raw));
}

/** Write the home-pointer file with a given exact content (raw bytes, no newline). */
function writePointer(homedir: string, content: string): void {
  fs.writeFileSync(path.join(homedir, '.lmstudio-home-pointer'), content);
}

// Home-dir control via the TEST-ONLY function seam setLmHomeOverride() (src/hostLanguage), NOT USERPROFILE/HOME env
// writes: under this repo's jest runner os.homedir() IGNORED those overrides (26.10 gate — 8 cases leaked the real
// developer profile while plain node honored them, so the mechanism is platform/jest-specific). The seam is a plain
// in-process variable consulted FIRST by resolveLmHome(), so it cannot be bypassed by libuv. jest.spyOn(os, 'homedir')
// remains impossible (core-module props are non-configurable in this combo — see module docblock).
function pinHome(dir: string): void {
  setLmHomeOverride(dir);
}
function clearPinnedHome(): void {
  setLmHomeOverride();
}

describe('hostLanguage.mapHostLanguage', () => {
  test.each([
    ['en', 'en'],
    ['EN', 'en'],          // case-insensitive
    [' en ', 'en'],        // trimmed
    ['de', 'de'],
    ['DE', 'de'],
    ['es', 'es'],
    ['zh-CN', 'zh-CN'],    // exact key as LM Studio writes it (verified live 26.10)
    ['zh-cn', 'zh-CN'],
    ['ZH-TW', 'zh-TW'],
    ['ja', ''],            // unknown host language → '' (never throws, never guesses)
    ['fr', ''],
    ['', ''],
    ['   ', ''],
  ])('maps %j → %j', (input: string, expected: string) => {
    expect(mapHostLanguage(input)).toBe(expected);
  });

  test('null (no settings / no field) maps to empty string', () => {
    expect(mapHostLanguage(null)).toBe('');
  });
});

describe('hostLanguage.readHostLanguageSetting (fixture homes)', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'hostlang-'));
  });
  afterEach(() => {
    delete process.env[LM_HOME_ENV];
    clearPinnedHome();
    fs.rmSync(root, { recursive: true, force: true });
  });

  test('reads the language string field', () => {
    const home = makeDir(root, 'h1');
    writeSettings(home, { language: 'de' });
    expect(readHostLanguageSetting(home)).toBe('de');
  });

  test('missing settings.json → null (never throws)', () => {
    const home = makeDir(root, 'h2');
    expect(readHostLanguageSetting(home)).toBeNull();
  });

  test('corrupt JSON → null (never throws)', () => {
    const home = makeDir(root, 'h3');
    writeSettings(home, '{ not valid json !!!');
    expect(readHostLanguageSetting(home)).toBeNull();
  });

  test('non-object JSON root (array) → null', () => {
    const home = makeDir(root, 'h4');
    writeSettings(home, '[1,2,3]');
    expect(readHostLanguageSetting(home)).toBeNull();
  });

  test('language field absent → null; non-string language (number/object) → null', () => {
    const a = makeDir(root, 'h5a');
    writeSettings(a, { theme: 'dark' });
    expect(readHostLanguageSetting(a)).toBeNull();

    const b = makeDir(root, 'h5b');
    writeSettings(b, { language: 42 });
    expect(readHostLanguageSetting(b)).toBeNull();

    const c = makeDir(root, 'h5c');
    writeSettings(c, { language: { code: 'de' } });
    expect(readHostLanguageSetting(c)).toBeNull();
  });

  test('home path is a FILE (not dir) → null', () => {
    const file = path.join(root, 'afile.txt');
    fs.writeFileSync(file, '{}');
    expect(readHostLanguageSetting(file)).toBeNull();
  });
});

describe('hostLanguage.resolveLmHome (env seam + pointer precedence)', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'hostlang-home-'));
  });
  afterEach(() => {
    delete process.env[LM_HOME_ENV];
    clearPinnedHome();
    fs.rmSync(root, { recursive: true, force: true });
  });

  test('env seam wins over pointer and default home', () => {
    const envHome = makeDir(root, 'envhome');
    process.env[LM_HOME_ENV] = envHome;

    // Pointer + default both exist — env must still win.
    const fakeProfile = makeDir(root, 'profile');
    writePointer(fakeProfile, JSON.stringify(path.join(root, 'pointer-target')));
    fs.mkdirSync(path.join(root, 'pointer-target'));
    fs.mkdirSync(path.join(fakeProfile, '.lmstudio'));
    pinHome(fakeProfile);

    expect(resolveLmHome()).toBe(envHome);
  });

  test('env seam pointing at a missing dir → null (invalid override is NOT silently ignored)', () => {
    process.env[LM_HOME_ENV] = path.join(root, 'does-not-exist');
    // Pin the homedir too so this case cannot accidentally resolve the developer's real home.
    pinHome(makeDir(root, 'profile-isolate'));
    expect(resolveLmHome()).toBeNull();
  });

  test('pointer target (JSON-encoded path — live LM Studio format) wins over default home', () => {
    const fakeProfile = makeDir(root, 'profile2');
    const pointed = makeDir(root, 'pointed-home');
    writePointer(fakeProfile, JSON.stringify(pointed)); // quoted, as observed on this machine 26.10
    fs.mkdirSync(path.join(fakeProfile, '.lmstudio')); // default exists too — pointer must win
    pinHome(fakeProfile);

    expect(resolveLmHome()).toBe(pointed);
  });

  test('pointer with raw (unquoted) path also resolves', () => {
    const fakeProfile = makeDir(root, 'profile3');
    const pointed = makeDir(root, 'raw-home');
    writePointer(fakeProfile, pointed);
    pinHome(fakeProfile);

    expect(resolveLmHome()).toBe(pointed);
  });

  test('pointer target missing → falls back to ~/.lmstudio default', () => {
    const fakeProfile = makeDir(root, 'profile4');
    writePointer(fakeProfile, JSON.stringify(path.join(root, 'vanished')));
    const def = path.join(fakeProfile, '.lmstudio');
    fs.mkdirSync(def);
    pinHome(fakeProfile);

    expect(resolveLmHome()).toBe(def);
  });

  test('empty pointer file / malformed quoted JSON → falls back to default home', () => {
    const fakeProfile = makeDir(root, 'profile5');
    writePointer(fakeProfile, ''); // empty
    const def = path.join(fakeProfile, '.lmstudio');
    fs.mkdirSync(def);
    pinHome(fakeProfile);
    expect(resolveLmHome()).toBe(def);

    writePointer(fakeProfile, '"truncated-json'); // quoted but malformed
    expect(resolveLmHome()).toBe(def);
  });

  test('no pointer and no default home → null (never throws)', () => {
    const fakeProfile = makeDir(root, 'profile6'); // bare profile dir, nothing else
    pinHome(fakeProfile);
    expect(resolveLmHome()).toBeNull();
  });

  test('env override genuinely controls homedir resolution (pins the mechanism this suite relies on)', () => {
    const fakeProfile = makeDir(root, 'profile7');
    fs.mkdirSync(path.join(fakeProfile, '.lmstudio'));
    pinHome(fakeProfile);
    expect(resolveLmHome()).toBe(path.join(fakeProfile, '.lmstudio'));

    // A SECOND pin in the same process must change the resolution (the seam reads fresh per call — no caching).
    const fakeProfile2 = makeDir(root, 'profile8');
    pinHome(fakeProfile2);
    expect(resolveLmHome()).toBeNull(); // bare second profile — proves the first value was not cached/leaked
  });
});

describe('hostLanguage.getHostLocale (end-to-end, never throws)', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'hostlang-e2e-'));
  });
  afterEach(() => {
    delete process.env[LM_HOME_ENV];
    clearPinnedHome();
    fs.rmSync(root, { recursive: true, force: true });
  });

  test.each([
    ['en', 'en'],
    ['de', 'de'],
    ['es', 'es'],
    ['zh-CN', 'zh-CN'], // exact case as LM Studio writes it (verified live 26.10)
    ['ja', ''],         // shipped-locale gap → '' for the step-4/5 fallback chain
  ])('settings language %j → host locale %j', (lang: string, expected: string) => {
    const home = makeDir(root, `h-${expected === '' ? 'xx' : expected}`);
    writeSettings(home, { language: lang });
    process.env[LM_HOME_ENV] = home;
    expect(getHostLocale()).toBe(expected);
  });

  test('env home without settings.json → "" (never throws)', () => {
    const home = makeDir(root, 'h-nosettings');
    process.env[LM_HOME_ENV] = home;
    expect(getHostLocale()).toBe('');
  });

  test('env home with corrupt settings.json → "" (never throws)', () => {
    const home = makeDir(root, 'h-corrupt');
    writeSettings(home, '{{{{');
    process.env[LM_HOME_ENV] = home;
    expect(getHostLocale()).toBe('');
  });

  test('env seam pointing at a nonexistent dir → "" (never throws)', () => {
    process.env[LM_HOME_ENV] = path.join(root, 'ghost-home');
    pinHome(makeDir(root, 'profile-ghost')); // pin homedir too — no accidental real-profile read
    expect(getHostLocale()).toBe('');
  });

  test('no env + no pointer + no default home → "" via fake homedir (hermetic negative)', () => {
    const fakeProfile = makeDir(root, 'bare-profile');
    pinHome(fakeProfile);
    expect(getHostLocale()).toBe('');
  });

  test('pointer chain end-to-end: profile pointer → fixture home → locale (no env seam)', () => {
    const fakeProfile = makeDir(root, 'profile-e2e');
    const pointed = makeDir(root, 'pointed-e2e');
    writeSettings(pointed, { language: 'zh-TW' });
    writePointer(fakeProfile, JSON.stringify(pointed));
    pinHome(fakeProfile);
    expect(getHostLocale()).toBe('zh-TW');
  });

  test('env seam is read FRESH per call (no caching — step-4 per-turn resolution relies on this)', () => {
    const deHome = makeDir(root, 'de-home');
    writeSettings(deHome, { language: 'de' });
    process.env[LM_HOME_ENV] = deHome;
    expect(getHostLocale()).toBe('de');

    const esHome = makeDir(root, 'es-home');
    writeSettings(esHome, { language: 'es' });
    process.env[LM_HOME_ENV] = esHome; // no reset function — env must simply be re-read
    expect(getHostLocale()).toBe('es');
  });

  test('settings.json changed on disk between calls → new value (fresh read, not cached)', () => {
    const home = makeDir(root, 'mutating-home');
    writeSettings(home, { language: 'en' });
    process.env[LM_HOME_ENV] = home;
    expect(getHostLocale()).toBe('en');

    writeSettings(home, { language: 'de' }); // host user switches app language mid-session
    expect(getHostLocale()).toBe('de');
  });
});
