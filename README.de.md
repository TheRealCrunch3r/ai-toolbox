<div align="center">
<a href="README.md">English</a> · <b>Deutsch</b> · <a href="README.es.md">Español</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a><br/>
<h1>AI Toolbox — All-in-One autonomes KI-Agenten- & Tool-Plugin für lokale LLMs in LM Studio</h1><hr/>
<br/><img src="docs/brand/emblem-256.png" alt="AI Toolbox emblem — konvergente Gitterstruktur mit axialem Strahl (V3)" width="96"/><br/>
<span style="letter-spacing:.28em;font-weight:bold">MÄCHTIGE WERKZEUGE · GESCHÜTZTE HÄNDE</span><br/>
<b>Lokalen LLM echte Hände.</b> Das vollständigste LM-Studio-Hub-Plugin — macht jedes lokale Modell zu einem fähigen, selbstverwaltenden AI-Agenten.<br/>Selbstverwaltender Kontext hält Marathon-Sessions am Leben · ein Plugin, kein Glue-Code, standardmäßig vollständig offline.
<br/><a href="#"><img src="https://img.shields.io/badge/version-v1.9.19-2f80ed?style=flat-square" alt="version v1.9.19"/></a> <a href="#the-tool-arsenal-113-tools-across-every-family-all-yours-to-toggle"><img src="https://img.shields.io/badge/tools-113%20ready--made-7c3aed?style=flat-square" alt="tools 113 ready-made"/></a> <a href="#quick-start-2-minutes"><img src="https://img.shields.io/badge/tests-71%20suites%20%C2%B7%201020%20green-3fb950?style=flat-square" alt="tests 71 suites · 1020 green"/></a> <a href="#"><img src="https://img.shields.io/badge/LM%20Studio-Hub%20plugin-e84393?style=flat-square" alt="LM Studio Hub plugin"/></a> <a href="LICENSE"><img src="https://img.shields.io/github/license/TheRealCrunch3r/ai-toolbox?style=flat-square" alt="license MIT (live-verified from LICENSE)"/></a> <a href="#"><img src="https://img.shields.io/badge/runtime-Node%20%E2%89%A5%2020-83cd29?style=flat-square&logo=node.js" alt="runtime Node ≥ 20"/></a><br/>
<b>Docs:</b> <a href="DOCUMENTATION.md">Documentation</a> · <a href="QUICK_START.md">Quick Start</a> · <a href="ARCHITECTURE.md">Architecture</a> · <a href="TOOLS_REFERENCE.md">Tool Reference</a> · <a href="CHANGELOG_v4.md">Changelog</a><br/>
<a href="CONTRIBUTING.md">Contributing</a> · <a href="SECURITY.md">Security</a><br/>
<code>Installation: den <b>dist/</b>-Ordner in LM Studio kopieren → unter Plugins aktivieren (Node.js 20+)</code>
</div>


**KI-Agenten-Toolkit für LM Studio** — 113 lokale LLM-Tools: Dateibearbeitung, Codebase-Suche, RAG, Browser-Automatisierung, Git & GitHub.

**Geben Sie Ihrem lokalen LLM echte Hände.** Das vollständigste Plugin im LM Studio Hub — verwandelt jedes lokale Modell in einen fähigen, selbstverwaltenden KI-Agenten mit sicherer Dateibearbeitung, hang-sicherer Codebase-Suche, Hintergrund-Builds, headloser Browser-Automatisierung, Git- & GitHub-Workflows, OCR, Chart-Erstellung und semantischem RAG; **selbstverwaltender Kontext** hält Marathon-Sitzungen am Leben. Ein Plugin, null Klebcode, standardmäßig vollständig offline.

> `v1.9.19` · `113 fertige Tools` · `1020 Tests grün (71 Suiten)` · `5 Lokalisationen` · `MIT` · `Node 20+`

> ⚠️ **Übersetzung** — Deutsche Fassung von [README.md](README.md). Englisch ist die maßgebliche Version (canonical); bei Abweichungen gilt README.md. Diese Datei bei Änderungen am Original mit synchronisieren.

[!IMPORTANT] LM Studio unterstützt KEINE automatischen Updates. Bei Problemen zuerst manuell aktualisieren: aktuelle Version entfernen und vom Plugin-Website neu herunterladen. Beachten Sie, dass LM Studio selbst bei veralteter Version einen „bereits installiert"-Hinweis anzeigen kann.

## Inhalt

[Warum AI Toolbox (im Vergleich zu anderen Plugins)] · [Direktvergleich] · [Funktionen im Überblick] · [Schnellstart (2 Minuten)] · [Konfiguration & Tool-Umschalter — volle Kontrolle, null Code] · [Sicherheitslage — gebaut wie es wichtig ist] · [Architektur für Neugierige] · [Waffenkammer: 113 Tools] · [Release-Highlights — vollständiger Verlauf in CHANGELOG_v4.md (aktiv), v1–v3 in docs/history/]

*Verzeichnisliste ohne Ankerlinks; die Sektionstitel entsprechen den Überschriften weiter unten.*

---

## Warum AI Toolbox (im Vergleich zu anderen LM Studio-Plugins)

*Verglichen mit einer Umfrage von ~115 Plugins im LM Studio Hub aus August 2026 (~40 Toolboxes, nur 9 mit echten Datei-Tools).*
**Legende:** 🥇 einzigartig im gesamten Feld · ⭐ selten (≤ eine Handvoll) · 🛡️ herausragende Sicherheits-Engineering

| Fähigkeit | Was es für Sie tut | Stellung im Feld |
|---|---|---|
| 🧠 **Selbstverwaltender Kontext** (`AutoTracker` + `ContextGuard`) | Token-Schwellen feuern *mitten in der Tool-Kette* (75 % / 90 %), fassen das Gespräch automatisch zusammen und komprimieren es vor dem Overflow — lange Agenten-Sitzungen funktionieren weiter statt zu sterben. Projekt-Keyword-Erkennung in der Prompt-Pipeline. | ⭐ **Kein befragtes Gegenstück hat irgendeine Kontext-/Token-Verwaltung** — jedes andere „Memory"-Tool ist nacktes Save/List/Search-CRUD |
| 🌐 **Projektübergreifender Speicher** (`switch_context`, Projekt-Registry) | Rufen Sie ab, was *ein anderes* registriertes Projekt letzte Woche entschieden hat. Recency×Frequency-Scoring, TTL-Pflege, wechseln erst nach Bestätigung (Step 0.7). | ⭐ **In keinem befragten Plugin vorhanden** |
| 🏷️ **Konfidenz-getaggte Ergebnisse + cluster-bewusste Tool-Auswahl** (`confidenceTypes`, `toolPriority`) | Jedes automatisch erfasste Faktum wird EXTRACTED vs INFERRED vs AMBIGUOUS gelabelt — so trennen Sie, was der Agent *weiß*, von dem, was er ratet; und wenn 113 Tools um einen Zug konkurrieren, hält cluster-bewusste Priorität die richtigen unter Grammatik-Limits in Reichweite. | 🥇 **Kein befragtes Gegenstück taggt Ergebnis-Konfidenz** — und kein anderes passt so viele Tools ohne Kontextlimit-Ausfälle |
| 🧬 **AST-basiertes Refactoring** (`refactor_code`) | Rename / move-function / extract-function / Dead-Import-Cleanup — syntaksichere AST-Transformationen mit **automatischem Rollback bei Fehlschlag**, kein Regex-Text-Hacking. | 🥇 **Das einzige AST-basierte Refactoring unter ~115 befragten Plugins** |
| 🔍 **Suche, die nicht hängen kann** (`ripgrep`, `find_replace_all`) | Natives ripgrep in einem isolierten Worker außerhalb des Host-Threads mit 3-s-Wallclock-Überwachungszeit; Rust-Dialekt-Regexps demoten automatisch zu Fixstrings und verraten das via `pattern_mode`; Dry-Run-Multifilen-Ersetzung. | 🛡️ Konkurrenten liefern grenzenlose grep-Schleifen — dieses kann physisch nicht ewig drehen |
| 💾 **Sichere Dateibearbeitung** (`replace_text_in_file`, `line_operations`) | `.bak`-Backup bei jeder Bearbeitung, muster-verankerte Einfügungen, Zeilen-Fingerprint-Verifikation, MD5-Integritätscheck nach dem Schreiben. Jede Datei in einem Aufruf wiederherstellen (`restore_from_bak`). | 🛡️ **3-Schicht-Gewährleistung** gegen Korruption durch veraltete Zeilennummern — Konkurrenten bieten bestenfalls Rename-Backup-Shims |
| ⏸️ **Nicht-blockierende Hintergrundbefehle** (`run_background_command` + monitor/cancel) | Lange Builds & Jobs starten, weiter chatten, Status jederzeit prüfen, bei Bedarf abbrechen. Kein Docker erforderlich. | ⭐ Nächste Konkurrenten **erfordern Docker**; dieses läuft nativ im Plugin-Host |
| 🌍 **Echte Browser-Automatisierung** (Puppeteer-Suite) | Headloser Chromium mit persistenten Sitzungen und UI-Interaktion — kein Einmal-„Seite-holen"-Aufruf. | Konkurrenten-„Website-besuchen"-Plugins sind ⚠️ *nur statische Scraper* |
| 📊 **Lokales semantisches RAG, jedes Format** (`rag_index_pdf/docx/xlsx`, `rag_query_vector`, `rag_web_content`) | Indizieren Sie PDFs, Word-Dokumente und Tabellen für Vektorsuche — plus abfrage-relevante Web-Extraktion. Eine Toolkit-Einheit ersetzt 2–4 separate Plugins der Konkurrenten. Nichts verlässt Ihren Rechner. | 🛡️ Begrenzte Chunking: **kein OOM durch Gift-Länge-Dokumente** (gegen ein 1690-Seiten-PDF verifiziert) |
| 🧪 **Führt Ihre Test-Suite für Sie aus** (`run_tests`) | Erkennt Jest / Mocha / Vitest automatisch aus `package.json` und führt sie aus, Ergebnisse zurück im Chat. | ⭐ Keine andere Toolbox im Feld macht das |
| 📈 **Datensichtbarwerdung als Tool-Aufruf** (`generate_chart`) | Balken / Linie / Kreis / Donut / Streuung / Radar → Bilddatei, mit HTML-Fallback, wenn der Renderer nicht verfügbar ist. | 🥇 **Zum Zeitpunkt der Umfrage gab es im gesamten Feld null Data-Viz-Plugins** |
| 🗺️ **Strukturierte Planung mit Live-Fortschritt** (`create_plan`, `get_plan`, `update_plan_step`) | Mehrstufige Pläne, verfolgt durch eine echte Zustandsmaschine (pending → in_progress → done, blocked-retry) mit Abschlussmetriken. | ⭐ Selten — die meisten Toolboxes haben gar keine Planungs-Primitiven |

---

## Direktvergleich vs Beledarians LM Studio Tools

Der nächstliegende direkte Wettbewerber im Hub: gleiche Aufgabe (Tools für lokale LLMs), sehr unterschiedlicher Aufbau. Wo AI Toolbox vorn liegt:

| Was AI Toolbox hat und sie nicht |
|---|
| ✅ **AST-level Refactoring** (Rename, Funktionsverschiebung, Dead-Import-Cleanup) — syntaksichere Transformationen mit Auto-Rollback, keine String-Bearbeitungen |
| ✅ **Echtes RAG:** lokaler Vektorindex über PDF / DOCX / XLSX mit Seitenebenen-Provenienz — nicht nur Keyword-Suche |
| ✅ **Bilder & Data-Viz:** OCR auf Screenshots und Aufnahmen, Bild-Metadaten + Vergleich, Chart-Erstellung |
| ✅ **113 Tools** vs ~49 — gestützt durch 1020 bestandene Tests in 71 Suiten |
| ✅ **Crash-resiliente Schreibvorgänge + Rollback bei Fehlschlag:** eine missglückte Bearbeitung kann Ihre Datei nie korrupt machen |

Unsere frühere i18n-Lücke ist geschlossen: **wir liefern jetzt 5 Lokalisationen** (en · de · es · zh-CN · zh-TW), jeweils ein vollständiger Übersetzungssatz — und Anti-Stub-Tests bewachen die Suite, damit Alias-/Fallback-Sprachen nie stillschweigend regressieren. Wir sagen Ihnen das lieber, als zu behaupten, es gäbe sie nicht.

---

## Sehen Sie es arbeiten — Ein Zug, zehn Tools

> **Sie:** *„Refaktorisches `auth.ts` — extrahiere die Token-Refresh-Logik in ein eigenes Modul, verschiebe den Helper daneben, führe unsere Test-Suite aus und öffne einen PR, wenn er grün ist."*
>
> → `refactor_code` (AST-Extraktion + Funktionsverschiebung, Auto-Rollback bereit) → `run_tests` (automatisch erkannt: **Jest**: alles ✅) → `gh_create_pr` — **ein Zug. Null Copy-Paste. Zero Hand-Holding.**

---

## Funktionen im Überblick

### Sichere Dateibearbeitung & Suche
In-place-Ersetzung · zeilenverankerte Einfügungen · Chunked-Reads auf riesigen Dateien · Diffs · Verzeichnisbäume — und **jeder Schreibvorgang wird zuerst gesichert** (`.bak`, Wiederherstellung in einem Aufruf). Projektweite Suche, die physisch nicht hängen kann (`ripgrep`: worker-isolierte native Scan mit 3-s-Wallclock-Überwachung, standardmäßig ausgeblüdete Verzeichnisse wie `node_modules`) plus Dry-Run-Multifilen-Ersetzung.

### Syntaxrespektvolles Code-Refactoring
AST-gesteuerte Renames, Funktionsverschiebungen & Extraktionen mit Auto-Rollback — der Agent refaktoriert wie ein Entwickler, nicht wie `sed`.

### Lange Jobs ohne den Faden zu verlieren
Startet Builds und Watcher im **Hintergrund**, bleibt beim Chatten, pollt oder bricht auf Anforderung ab. Gesandboxtes JS/Python für schnelle Logik; volle Shell (Pipes, Redirects, Env-Variablen) wenn nötig — aber *standardmäßig aus*. Ihre Test-Suite führt sich selbst: automatisch erkannter Runner, Ergebnisse zurück im Chat.

### Web-Recherche & Browser-Automatisierung
Multi-Engine-Suche mit automatischem Fallback · saubere SeitenText-Extraktion · ein **echter headloser Browser** mit persistenten Sitzungen (kein Einmal-Scraper) · HTTP-Client für jeden GET/POST-JSON-Aufruf — SSRF-geschützt.

### Git & GitHub Workflows, ohne Hände
Lokal: status, diff, add, commit, log, checkout, **stash**, **blame**. Remote: Issues, PRs, Kommentare, Diffs, Push — über die `gh` CLI, der Sie schon vertrauen.

### Daten, die es wirklich lesen kann
PDFs, Word-Dokumente & Tabellen → **lokale semantische Vektorsuche** (nichts verlässt Ihren Rechner). OCR auf Screenshots und Desktop-Aufnahmen; Bild-Metadaten & Vergleich. Read-only-SQLite mit injektionssicheren parametrisierten Queries. Ihr Agent *sieht* wörtlich Bildschirme.

### Speicher, der das Chat-Fenster überlebt
Entscheidungen, Muster und Konfigurationen persistieren pro Projekt — **und quer zu Projekten**: typ-spezifisch, TTL-geschnitten, mit Recency×Frequency-Scoring abgerufen, wechseln erst nach Bestätigung (`switch_context`). ContextGuard hält Marathon-Sitzungen am Leben: auto-Zusammenfassung bei 75 %, Kompression bei 90 % — mitten in der Kette.

### Ausgabe, die Sie sehen können
Charts aus Rohdaten gerendert zu Bilddateien (Balken/Linie/Kreis/Donut/Streuung/Radar). Live HTML/CSS/JS-Komponenten generiert und im Browser vorgeführt, mit Daten extrahiert zurück in den Chat.

---

## Schnellstart (2 Minuten)

**Voraussetzungen:** LM Studio (aktuellste Version) · Node.js 20+ · *optional:* `gh` CLI für GitHub-Remote-Betrieb → https://cli.github.com/

1. **Installieren** — Ordner ablegen, Plugin in den LM Studio-Einstellungen aktivieren
2. **Umschalter** — die gewünschten Tool-Kategorien einschalten (Execution & Browser sind aus Designgründen deaktiviert)
3. *(Optional)* `gh auth login` einmal im Terminal, um GitHub-Remote-Tools freizuschalten
4. **Chatten** — Ihr Agent hat jetzt **113 Tools** in Reichweite, genau so gated wie konfiguriert

```bash
# Developing instead of using?
npm install && npm run build   # ESM + CJS via tsup
npm test                        # full suite: 71 suites / 1020 tests green (owner-verified 10.10 TWO-TIER CLOSE-OUT — FIX A + FIX B, gate round 3 ~12:05; prior canon 69/1003 @ 09.10 [FIX #21 mid-loop forced-save, r7] · prior arcs: 68/990 @ 08.10 [LEVER-1], 68/987 @ 07.10 [Arc C sweep — entry unlogged], 65/952 @ 06.10 [DOC-PIN gate] 64/941 @ 06.10 [i18n gate], 64/938 @ 06.10 ×2 [F1 ~16:57 · PLAN-SEAM ~18:0x], 63/931 @ 05.10, 63/930 @ 04.10 ×3, 61/917 @ 04.10, 893/59 @ 02.10, 874/58 @ ~21.5 s on 01.10, 860/56 @ 29.09, 857/56 @ 28.09)
```

---

## Konfiguration & Tool-Umschalter — Volle Kontrolle, null Code

| Steuerung | Was sie tut |
|---|---|
| 🎛️ **Feingranuliertes Gating** | Jede Tool-Familie schaltet sich unabhängig in der LM-Studio-Einstellungs-UI |
| 👑 **God Mode** | Ein Schalter aktiviert alles (nur für Power-User — Execution ist aus einem Grund standardmäßig deaktiviert) |
| 🔁 **ContextGuard** | Token-Schwellen + Zusammenfassungsmodell setzen; beobachten Sie, wie Auto-Kompression lange Sitzungen am Leben erhält |
| 🧮 **Auto-Tracking** | Hintergrund-Tracking von Entscheidungen & Task-Abschlüssen mit Konfidenz-getaggten Ergebnissen |

---

## Sicherheitslage — gebaut, als wäre es wichtig

- 🛡️ Jedes dateimodifizierende Tool schreibt zuerst eine `.bak` — Wiederherstellung ist ein Aufruf (`restore_from_bak`)
- 🛡️ `ripgrep` / `find_replace_all`: worker-isoliertes Scanning (der Host-Thread kann nicht klemmen), 3-s-Wallclock-Überwachung, automatische Demotion des Rust-Dialekts offengelegt via `pattern_mode` + Hinweis
- 🛡️ RAG & Web-Pfade: begrenzte Reads (250K–500K Zeichen-Budgets), 30-s-Abbrüche pro Fetch-Versuch, Chunking-Schleifen, die *terminieren* — kein Plugin-Host-OOM durch Gift-Dokumente
- 🛡️ Gesandboxte JS/Python-Ausführung; volle Shell verfügbar, aber **standardmäßig aus**
- Vollständiges Threat-Modell & Disclosure-Prozess → [SECURITY.md](SECURITY.md)

---

## Architektur unter der Haube (für Neugierige)

Declarative Tool-Registry mit closure-basierter Dependency Injection · volle Asynchronität + crash-resiliente atomare Schreibvorgänge (`atomicWrite`-Utility, Rollback bei Fehlschlag) · dynamische Kontextfenster-Erkennung über native SDK-APIs · Konfidenz-getaggte Ergebnisse (`EXTRACTED | INFERRED | AMBIGUOUS`) · cluster-bewusste Tool-Priorität für Grammatiklimit-Pflege.

Tiefenblick → [ARCHITECTURE.md](ARCHITECTURE.md) · Entwickler-Guide in dieser Datei unten

---

## Die Waffenkammer: 113 Tools über alle Familien, alles zum Umschalten

Ein Plugin ersetzt eine ganze Regalwand. Hier ist jede Familie, was sie abdeckt und ihr Standardzustand:

| Familie | Anzahl | Was es Ihrem Agenten gibt | Default |
|---|---|---|---|
| 📁 **Dateisystem** | 24 | Lesen/Schreiben/Bearbeiten/Suchen — pfadvalidiert, gesichert, Chunked-Reads auf riesigen Dateien, Diffs, Projektbäume, worker-isolierte `ripgrep`-Suche (3-s-Überwachung) + strukturiertes Inhalts-Scanning (`pattern_scan`) + Zeilenoperationen mit Fingerprint-Guards (`line_operations`, eingefaltet 23.09 Q6) | ✅ |
| 🧬 **Refactoring & Recode-Engine** | `refactor_code` + Regeln | AST-Rename · move-function · extract · Dead-Import-Cleanup — plus eine anpassbare Regel-Engine (Dead-Code-Hinweise, Typinferenz, Async-Modernizer) mit Dry-Run-Diffs | ✅ |
| 🔍 **Textverarbeitung** | 3 | Regex-Transformationen (`sed`-Klasse), strukturierte Extraktion (`awk`-Klasse), sofortige Markdown-Tabellen (Zeilenoperationen nach Dateisystem verschoben, 23.09 Q6) | ✅ |
| 📋 **Aufgabenplanung** | 4 | Ziel- + Schritt-Pläne durch eine echte Zustandsmaschine mit Live-Abschlussmetriken — blockierte Schritte retry sauber · bestätigungsgated `remove_plan` + Auto-Removed bei natürlicher Vollendung (05.10) | ✅ |
| ⚡ **Execution** | 5 | Gesandboxtes JS & Python (eval/require blockiert) · volle Shell & natives Terminal (opt-in) · **führt automatisch die Test-Suite Ihres Projekts aus** (Jest/Mocha/Vitest erkannt) | gemischt |
| 🧠 **Kontext & Speicher** | 22 | Auto-Zusammenfassung, typisierter Speicher mit TTL-Pflege & Heuristik-Recall, Ereignis-Tracking — **plus projektübergreifend**: Projekte registrieren/suchen/wechseln, Session-Index-Browser + Ein-Aufruf-read-only-Resume-Bootstrap (`restore_session_context`, 25.09) | ✅ |
| 📊 **Vektor-RAG** | 7 | Semantische Suche über Ihre Codebase *und* PDFs · Word-Dokumente · Tabellen + abfrage-relevante Web-Extraktion — lokal, begrenzt, OOM-sicher | ✅ |
| 💾 **Backup & Restore** | 5 | Vollverzeichnis-ZIP-Snapshots (`create_backup`/`restore_backup`), Auflistung, Cleanup — plus das per-Bearbeitung `.bak`-System unter allem | ✅ |
| 📈 **Datensichtbarwerdung** | 1 | `generate_chart`: Balken / Linie / Kreis / Donut / Streuung / Radar → Bilddatei mit HTML-Fallback · Geschwister am selben Umschalter: `markdown_preview`, `get_repeat_tool_advice` (DOC-PIN) | ✅ |
| 🖼️ **Bildverarbeitung** | 4 | OCR (`image_to_text`) · Metadaten-Inspektion (`describe_image`) · Desktop-Aufnahme (`screenshot_desktop`) · Byte-level-Vergleich (`compare_images`) | ✅ |
| 📄 **Dokumenten-Parsing** | 1 | PDF / DOCX / TXT direkt in den Chat, binärsicher | ✅ |
| 🌐 **Web-Recherche** | 3 | Multi-Engine-Suche mit Fallback · saubere SeitenText-Extraktion | ✅ |
| 🌍 **Browser-Automatisierung** | 5 | Echter headloser Chromium: Seiten öffnen, persistente Sitzungen, UI-Interaktion, HTML vorschauen | ✗ opt-in |
| 🐙 **Git & GitHub** | 15 | Voller lokaler git inkl. **stash & blame** · Issues/PRs/Kommentare/Diffs/Push über Ihre `gh` CLI | ✗ opt-in |
| ⏳ **Hintergrundbefehle** | 3 | Lange Jobs ausführen ohne den Chat zu blockieren — stdout/stderr überwachen, jederzeit abbrechen. Kein Docker erforderlich. | ✗ opt-in |
| 📡 **HTTP-Client** | 3 | Requests jeder Methode mit Retry/Timeout, JSON GET/POST-Helfer — SSRF-geschützt | ✗ opt-in |
| 🎨 **UI-Generierung** | 3 | Live HTML/CSS/JS-Komponenten im Browser bauen & vorschauen · Daten wieder extrahieren | ✗ opt-in |
| 🗃️ **Datenbank** | 1 | Read-only-SQLite mit injektionssicheren parametrisierten Queries | ✗ opt-in |

> *Zahlen sind code-verifiziert (Source-of-Truth-Audit, Sept. 2026); die ausgesetzte Tool-Anzahl ist immer umschalterabhängig.*

> *Per-Tool-Parameter, Defaults und Beispiele → [TOOLS_REFERENCE.md](TOOLS_REFERENCE.md) (gegen Quellcode auditiert). Walkthroughs: [DOCUMENTATION.md](DOCUMENTATION.md) · [QUICK_START.md](QUICK_START.md)*

---

## Release-Highlights (voller Verlauf → CHANGELOG_v4.md — aktiv; v1–v3 in docs/history/)

| Version | Schlagzeile |
|---|---|
| **v1.9.18** | 🔒 Suite D shared-file lost-write fix — pro-Pfad-In-Prozess-Sperre auf die snap→rename-Kritiksektion (neues `sharedFileLock.ts`, in beide Writer eingewickelt) · 🧾 EOL-FIX v4 — byte-exakter Zeilenende-Roundtrip für `replace_text_in_file` auf gemischten/CRLF-Dateien + Pre-Edit eol/bom-Sichtbarkeit via `get_file_metadata`-Report (TS7022 tsc-Gate-Blocker im selben Bogen geschlossen) · 🧯 PIPELINE HYGIENE D 25.09 — Tool Execution Pipeline vereinte Outcome-Taxonomie + finalizeContent-Invariante, pro-Zug-toolsProvider-Guard-Reset, describeError lint clean, jest RC#4 mapper; volle Suite 836/51 grün + eslint clean; docs CHANGELOG_v3 + ARCHITECTURE aktualisiert |
| **v1.9.17** | 💾 Tool Gating Profile — persistente Tool-Umschalter (rev 29, publiziert 14.09) · 🔍 ripgrep TOOL SWAP + vereinte Projekt-Registry + Worker-Pool-Flattern-Fix (rev 30, letzte GitHub-Publikation am 15.09) — alle rev-31-Arbeiten (DE-STRAngle, AutoTracker F1+F2, cluster-bewusste Tool-Reihenfolge, CWD-Zustandsverlagerung, SPEC-C) in v1.9.18 ausgeliefert; ⏳ v1.9.18 / rev 33 Publikation ausstehend (Eigentümerentscheidung) |
| **v1.9.16** | 🔍 `web_search` Zero-Ergebnis-Fallback-Fix — toter/leerer Engine stoppt die Kette nicht mehr · rev 28: Reinstall + Restart am selben Tag live-verifiziert (blockierter `ddg-api` übersprungen → `ddg-fetch` lieferte Ergebnisse) |
| **v1.9.15** | ⚡ B' ripgrep phase-1 Prefilter für `pattern_scan` (byte-identische JS-Fallback-Garantie) · rev 27: `ripgrep` zu Laufzeitabhängigkeit befördert, behebt stillen Fast-Pfad-Verlust bei Hub-Installationen — live auf der Benutzermaschine verifiziert |
| **v1.9.14** | 🧠 `get_memory` lokale-Datei-Parsing-Guard — schlüssellose Auto-Kontext-Aufzeichnungen unterbrechen Reads nicht mehr (Hotfix) |
| **v1.9.13** | 🔍 ripgrep-getragener Regex-Motor für `grep_files` (in-Prozess-WASM-Prefilter, transparenter Fallback behält jeden Hang-Guard; Tool im 14.09 TOOL SWAP entfernt → eigenständige native `ripgrep`) · `executedTool` Bodenwahrheits-Stempel auf allen Tool-Ergebnissen · Tier-1 Dead-Code-Entfernung (~90 KB) |
| **v1.9.12** | 🆕 `pattern_scan` rekursive Inhalts-Suche (unsichere Regexps demoten automatisch zu literal; 256-KB/10k-Zeilen-Hartlimits) · puppeteer `connected` Eigenschaftslese-Fix · Dead-Datei-Entfernung — volle MD-Docs-Synchronisierung |
| **v1.9.10** | 🔧 OOM-Härtungs-Suite: begrenzte Web/RAG-Reads, Chunking Fixpunkt-Termination, `rag_web_content` Deduplizierung — Plugin-Host-Heap ist jetzt unter Gift-Payloads sicher |
| **v1.9.9** | ⏱️ Deadline-begrenztes `grep_files` (Teilergebnisse + `aborted`-Flag) · AutoTracker Token-Deltas feuern Schwellen *innerhalb* langer Tool-Ketten · live `chat used ≈ N tok` DELTA-Log |
| **v1.9.8** | 🔒 Explizite Projektregistrierung nur · Hang-Prävention (`max_depth`, Zeilenlimits) · Step-0.7 Keyword-Erkennung + lazy Registry-Sync tötet die „project not found"-Schleife |
| **v1.9.7** | 💾 Crash-resiliente atomare Schreibvorgänge überall — randomisierte Tempdateinamen, Rollback bei Fehlschlag, null blockierende I/O |
| **v1.9.5–6** | 🧠 Graphify-inspirierte Intelligenz: Konfidenz-getaggte Ergebnisse, Hub-Ausschluss-Clustering, cluster-bewusste Tool-Priorität · `shell:true`-Deprecation eliminiert |
| **v1.8.x** | 🛡️ 3-Schicht Zeilenbearbeitungs-Gewährleistung · SDK v1.x Tokenzählgenauigkeit (stimmt mit Seitenleiste innerhall <0,3 %) · deklarativer Registry-Refactoring (~80 Zeilen if/else → 20-Einträge-Registry) |

---

## Kernabhängigkeiten

`@lmstudio/sdk` ^1.5.0 · `puppeteer` ^24 · `isomorphic-git` ^1.38 · `sharp` ^0.35.3 · `tesseract.js` ^7 · `pdf-parse` / `mammoth` / `xlsx` (Dokumenten-Pipeline) · `ripgrep` ^0.3.1 (WASM-Regex-Motor, lazy geladen) · `@dqbd/tiktoken` (ContextGuard) · `zod` (Laufzeitvalidierung)

---

## Lizenz

**MIT** — frei zu verwenden, zu modifizieren, auszuliefern. Siehe [LICENSE](LICENSE).

---

*AI Toolbox ist ein All-in-One-LM-Studio-Plugin und KI-Agenten-Toolkit für lokale LLMs: sichere Datei-Tools, hang-sichere Codebase-Suche, Hintergrund-Builds, headlose Browser-Automatisierung, Git & GitHub Workflows, OCR, Datensichtbarwerdung, lokales semantisches RAG über PDF/DOCX/XLSX, projektübergreifender Speicher, selbstverwaltende Kontextfenster — 113 fertige Tool-Aufrufe, die Ihr Modell mit null Klebcode verwenden kann.*
