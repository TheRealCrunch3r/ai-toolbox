// scripts/pack_hub.js — baut das Publish-Paket publish/ai-toolbox/ für `lms push`.
// WICHTIG: LM Studio läuft vom SOURCE (plattform-seitiger Build, dist ist im Working-Upload leer)
// → src/ + tsup/tsconfig-Konfig gehöören ins Paket. Dev-Artefakte bleiben draußen (WHITELIST unten).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
// ZIP via fflate (s. changelog.zip-Block unten) — kein child_process/PowerShell nötig.
const { zipSync, strToU8, unzipSync } = require('fflate');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'publish', 'ai-toolbox');
// Hub-Dateilimit (owner-Erinnerung); bei Überschreitung bricht der Pack-Step ab.
const LIMIT = 128;

// Root-Dateien: Runtime + Build-Konfig (lms baut selbst) — bewusst kein .gitignore/.editorconfig,
// keine Dev-Doku, keine Test-/Lint-Konfig. .VERSION HÖCHST WICHTIG im Paket (owner-Fund 09.11/17:27):
// Update-Check holt seit 20.10 die publizierte Hub-Datei lmstudio.ai/crunch3r/ai-toolbox/files/.VERSION
// (updateChecker.ts PUBLISHED_VERSION_URL) — ohne Einpacken = 404, realer Update-Pfad tot.
// 5-File-Bump-Regel (GLOSSARY.md): jeder Release-Wert wandert mit ins nächste Paket; gleiche Version → still.
// Test-Suite wird als tests.zip mitgebaut (fflate-Block unten; owner-House-Rule 09.11/17:18).
const ROOT_FILES = [
  'manifest.json', 'package.json', 'package-lock.json', 'LICENSE',
  'tsup.config.ts', 'tsconfig.json', '.VERSION',
];
// READMEs: EN wird von LM Studio als Plugin-Beschreibung angezeigt; die Lokalisierungen
// sind Hub-Listing-Artefakte und landen ohnehin nicht im Runtime-Pfad. Bei Bedarf hier ergänzen.
const README_LOCALES = ['README.md'];
// Von der Paket-README referenzierte Doku → mitpacken, sonst Dead Links im installierten Ordner.
// docs/ (History-Archive) bewusst draußen: wird von keiner gepackten Datei verlinkt.
const DOCS_REFERENCED_BY_README = [
  'DOCUMENTATION.md', 'QUICK_START.md', 'ARCHITECTURE.md',
  'TOOLS_REFERENCE.md', 'CHANGELOG_v5.md', 'CONTRIBUTING.md', 'SECURITY.md',
];

function copyTree(srcDir, dstDir) {
  fs.mkdirSync(dstDir, { recursive: true });
  for (const e of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, e.name), d = path.join(dstDir, e.name);
    if (e.isDirectory()) copyTree(s, d);
    else fs.copyFileSync(s, d);
  }
}
function walkCount(dir) {
  let files = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files += walkCount(p);
    else files++;
  }
  return files;
}

// Staging neu anlegen (copyFile erzeugt keine Verzeichnisse)
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const f of ROOT_FILES) fs.copyFileSync(path.join(root, f), path.join(outDir, f));
for (const r of README_LOCALES) { if (fs.existsSync(path.join(root, r))) fs.copyFileSync(path.join(root, r), path.join(outDir, r)); }
// Referenzierte Doku: fehlende Datei = ABORT (Pack bricht statt mit Dead Links zu shiffen)
{
  const missing = DOCS_REFERENCED_BY_README.filter((d) => !fs.existsSync(path.join(root, d)));
  if (missing.length > 0) { console.error(`[pack_hub] ABORT – referenzierte Doku fehlt im Repo: ${missing.join(', ')}`); process.exit(1); }
  for (const d of DOCS_REFERENCED_BY_README) fs.copyFileSync(path.join(root, d), path.join(outDir, d));
}

// src/ komplett (plattform-seitiger Build benötigt es)
copyTree(path.join(root, 'src'), path.join(outDir, 'src'));

// Paket-README: Remote-Badge-Zeile (img.shields.io) entfernen — Hub rendert externe Bilder nicht
// zuverlässig; Versions-/Tools-Infos bleiben in der Quote-Zeile darunter. EOL byte-exakt erhalten.
// GitHub-Kanone (Repo README.md) bleibt unangetastet.
{
  const readmePkg = path.join(outDir, 'README.md');
  const raw = fs.readFileSync(readmePkg);
  const txt = raw.toString('utf8');
  const eol = /\r\n/.test(txt) ? '\r\n' : '\n';
  let cleaned = txt.split(/\r?\n/).filter((l) => !l.includes('img.shields.io')).join(eol);
  // Locale-Switcher → absolute GitHub-Links: die README.<loc>.md-Dateien sind NICHT im Paket (Whitelist),
  // relative Links wären auf dem Hub tot. Repo-Kanone bleibt unverändert (dort funktionieren Relative).
  const GH = 'https://github.com/TheRealCrunch3r/ai-toolbox/blob/main';
  for (const loc of ['de', 'es', 'zh-CN', 'zh-TW']) {
    cleaned = cleaned.split(`href="README.${loc}.md"`).join(`href="${GH}/README.${loc}.md"`);
  }
  if (cleaned !== txt) fs.writeFileSync(readmePkg, cleaned);
  console.log(`[pack_hub] README.md: ${txt.length - cleaned.length} Bytes entfernt/ersetzt (Badges + GitHub-Locale-Links)`);
}

// docs/history/ → changelog.zip ins Paket (Changelog-Archive, owner-House-Rule 09.11).
// fflate.zipSync = dieselbe in-house Zip-Maschinerie wie create_backup (tools/backupTools.ts):
// synchron, pure JS — kein child_process/PowerShell, keine .ps1-Quote-Ebenen (doppeltes ABORT im 09.11-Build),
// cross-platform und damit im Agent-Sandbox direkt testbar.
{
  const srcHist = path.join(root, 'docs', 'history');
  if (!fs.existsSync(srcHist)) { console.error('[pack_hub] ABORT – docs/history fehlt im Repo'); process.exit(1); }
  // .sort() → deterministische Zip-Reihenfolge; strToU8/utf8 (Changelogs sind reiner Text)
  const histFiles = fs.readdirSync(srcHist).filter((f) => fs.statSync(path.join(srcHist, f)).isFile()).sort();
  if (histFiles.length === 0) { console.error('[pack_hub] ABORT – docs/history ist leer'); process.exitCode = 1; return; }
  // Owner-Entscheid 09.11/17:24: Zip liegt in docs/history/ (spiegelt Quellstruktur) statt Paket-Root; Ordner zählt nicht ins Dateilimit.
  fs.mkdirSync(path.join(outDir, 'docs', 'history'), { recursive: true });
  const zipDst = path.join(outDir, 'docs', 'history', 'changelog.zip');
  const entries = {};
  for (const f of histFiles) entries[f] = strToU8(fs.readFileSync(path.join(srcHist, f), 'utf8')); // flache Basisnamen (Compress-Archive-Äquivalent)
  try {
    fs.writeFileSync(zipDst, zipSync(entries));
    // Read-back statt Blindvertrauen: volles Unzip → Einzahlen + Inhalte byte-exakt gegen Quelle prüfen.
    const back = unzipSync(fs.readFileSync(zipDst));
    const listed = Object.keys(back).sort();
    if (listed.join('\0') !== histFiles.join('\0')) throw new Error(`Eintrag-Drift: ${JSON.stringify(listed)} vs ${JSON.stringify(histFiles)}`);
    for (const f of histFiles) {
      const diff = Buffer.compare(Buffer.from(back[f]), fs.readFileSync(path.join(srcHist, f)));
      if (diff !== 0) throw new Error(`Inhalt-Drift bei ${f} (compare=${diff})`);
    }
    console.log(`[pack_hub] changelog.zip: ${listed.length} Dateien (docs/history, fflate)`);
  } catch (err) {
    try { fs.rmSync(zipDst, { force: true }); } catch (_) {} // kein halbes Zip im Paket
    console.error('[pack_hub] ABORT – changelog.zip:', err && err.message ? String(err.message).slice(0, 400) : String(err));
    process.exitCode = 1;
    return;
  }
}

// tests/ wird NICHT gepackt (owner-Entscheid 09.11/17:32, ersetzt tests.zip von 17:18):
// Hub-Push brach am 128-Datei-Limit ab → Suite bleibt Repo-/GitHub-Artefakt. changelog.zip wird weiter gebaut (Block oben).

// Count-Check vor dem Push
const n = walkCount(outDir);
console.log(`[pack_hub] ${path.relative(root, outDir)}: ${n} Dateien (Limit ${LIMIT})`);
if (n > LIMIT) {
  console.error('[pack_hub] ABORT – Dateilimit überschritten. WHITELIST oben kürzen.');
  process.exitCode = 1;
} else {
  console.log(`[pack_hub] ✔ bereit. Nächstes: cd publish\\ai-toolbox && lms push`);
}
