<div align="center">
<a href="README.md">English</a> ý <b>Deutsch</b> ý <a href="README.es.md">Espaýol</a> ý <a href="README.zh-CN.md">ýS-ý</a> ý <a href="README.zh-TW.md">Aý-ý</a><br/>
<h1>AI Toolbox  All-in-One autonomes KI-Agenten- & Tool-Plugin fýr lokale LLMs in LM Studio</h1><hr/>
<b>117 Tools. Ein Plugin. Keine Cloud nýtig.</b> Das vollstýndigste LM-Studio-Hub-Plugin  macht jedes lokale Modell zu einem fýhigen, selbstverwaltenden AI-Agenten.<br/>Selbstverwaltender Kontext hýlt Marathon-Sessions am Leben ý ein Plugin, kein Glue-Code, standardmýýig vollstýndig offline.
<br/><a href="#"><img src="https://img.shields.io/badge/version-v1.9.24-2f80ed?style=plastic" alt="version v1.9.24"/></a> <a href="#the-tool-arsenal-117-tools-across-every-family-all-yours-to-toggle"><img src="https://img.shields.io/badge/tools-117%20ready--made-7c3aed?style=plastic" alt="tools 117 ready-made"/></a> <a href="#quick-start-2-minutes"><img src="https://img.shields.io/badge/tests-86%20suites%20%C2%B7%201291%20green-3fb950?style=plastic" alt="tests 86 suites ý 1291 green"/></a> <a href="#"><img src="https://img.shields.io/badge/LM%20Studio-Hub%20plugin-e84393?style=plastic" alt="LM Studio Hub plugin"/></a> <a href="LICENSE"><img src="https://img.shields.io/github/license/TheRealCrunch3r/ai-toolbox?style=plastic" alt="license MIT (live-verified from LICENSE)"/></a> <a href="#"><img src="https://img.shields.io/badge/runtime-Node%20%E2%89%A5%2020-83cd29?style=plastic&logo=node.js" alt="runtime Node e 20"/></a><br/>
<b>Docs:</b> <a href="DOCUMENTATION.md">Documentation</a> ý <a href="QUICK_START.md">Quick Start</a> ý <a href="ARCHITECTURE.md">Architecture</a> ý <a href="TOOLS_REFERENCE.md">Tool Reference</a> ý <a href="CHANGELOG_v5.md">Changelog</a><br/>
<a href="CONTRIBUTING.md">Contributing</a> ý <a href="SECURITY.md">Security</a><br/>
<br>
<b>=ý Einfache Installation:</b> <a href="https://lmstudio.ai/crunch3r/ai-toolbox">AI Toolbox aus dem LM Studio Hub</a> <br> OR </br>
<code>Installation: den <b>dist/</b>-Ordner in LM Studio kopieren ý unter Plugins aktivieren (Node.js 20+)</code>
<br>
</div>


**KI-Agenten-Toolkit fýr LM Studio**  117 lokale LLM-Tools: Dateibearbeitung, Codebase-Suche, RAG, Browser-Automatisierung, Git & GitHub.

**116 Tools. Ein Plugin. Keine Cloud nýtig.** Das vollstýndigste Plugin im LM Studio Hub  verwandelt jedes lokale Modell in einen fýhigen, selbstverwaltenden KI-Agenten mit sicherer Dateibearbeitung, hang-sicherer Codebase-Suche, Hintergrund-Builds, headloser Browser-Automatisierung, Git- & GitHub-Workflows, OCR, Chart-Erstellung und semantischem RAG; **selbstverwaltender Kontext** hýlt Marathon-Sitzungen am Leben. Ein Plugin, null Klebcode, standardmýýig vollstýndig offline.

> `v1.9.24` ý `117 fertige Tools` ý `1291 Tests grýn (86 Suiten)` ý `5 Lokalisationen` ý `MIT` ý `Node 20+`

> ý **ýbersetzung**  Deutsche Fassung von [README.md](README.md). Englisch ist die maýgebliche Version (canonical); bei Abweichungen gilt README.md. Diese Datei bei ýnderungen am Original mit synchronisieren.

<div align="center"><table><tr><td style="border-left:4px solid #d1242f; padding:8px 16px;"><b>ý LM Studio unterstýtzt KEINE automatischen Updates.</b><br/>Bei Problemen zuerst manuell aktualisieren: aktuelle Version entfernen und vom Plugin-Website neu herunterladen. Beachten Sie, dass LM Studio selbst bei veralteter Version einen bereits installiert"-Hinweis anzeigen kann.</td></tr></table></div>

## Inhalt

[Warum AI Toolbox (im Vergleich zu anderen Plugins)] ý [Direktvergleich] ý [Funktionen im ýberblick] ý [Schnellstart (2 Minuten)] ý [Konfiguration & Tool-Umschalter  volle Kontrolle, null Code] ý [Sicherheitslage  gebaut wie es wichtig ist] ý [Architektur fýr Neugierige] ý [Waffenkammer: 117 Tools] ý [Release-Highlights  vollstýndiger Verlauf ý CHANGELOG_v5.md  aktiv; v1v4 in docs/history/]

*Verzeichnisliste ohne Ankerlinks; die Sektionstitel entsprechen den ýberschriften weiter unten.*

---

## Warum AI Toolbox (im Vergleich zu anderen LM Studio-Plugins)

*Verglichen mit einer Umfrage von ~115 Plugins im LM Studio Hub aus August 2026 (~40 Toolboxes, nur 9 mit echten Datei-Tools).*
**Legende:** >G einzigartig im gesamten Feld ý P selten (d eine Handvoll) ý =ý herausragende Sicherheits-Engineering

| Fýhigkeit | Was es fýr Sie tut | Stellung im Feld |
|---|---|---|
| >ý **Selbstverwaltender Kontext** (`AutoTracker` + `ContextGuard`) | Token-Schwellen feuern *mitten in der Tool-Kette* (75 % / 90 %), fassen das Gesprých automatisch zusammen und komprimieren es vor dem Overflow  lange Agenten-Sitzungen funktionieren weiter statt zu sterben. Projekt-Keyword-Erkennung in der Prompt-Pipeline. | P **Kein befragtes Gegenstýck hat irgendeine Kontext-/Token-Verwaltung**  jedes andere Memory"-Tool ist nacktes Save/List/Search-CRUD |
| < **Projektýbergreifender Speicher** (`switch_context`, Projekt-Registry) | Rufen Sie ab, was *ein anderes* registriertes Projekt letzte Woche entschieden hat. RecencyýFrequency-Scoring, TTL-Pflege, wechseln erst nach Bestýtigung (Step 0.7). | P **In keinem befragten Plugin vorhanden** |
| <ý **Konfidenz-getaggte Ergebnisse + cluster-bewusste Tool-Auswahl** (`confidenceTypes`, `toolPriority`) | Jedes automatisch erfasste Faktum wird EXTRACTED vs INFERRED vs AMBIGUOUS gelabelt  so trennen Sie, was der Agent *weiý*, von dem, was er ratet; und wenn 117 Tools um einen Zug konkurrieren, hýlt cluster-bewusste Prioritýt die richtigen unter Grammatik-Limits in Reichweite. | >G **Kein befragtes Gegenstýck taggt Ergebnis-Konfidenz**  und kein anderes passt so viele Tools ohne Kontextlimit-Ausfýlle |
| >ý **AST-basiertes Refactoring** (`refactor_code`) | Rename / move-function / extract-function / Dead-Import-Cleanup  syntaksichere AST-Transformationen mit **automatischem Rollback bei Fehlschlag**, kein Regex-Text-Hacking. | >G **Das einzige AST-basierte Refactoring unter ~115 befragten Plugins** |
| = **Suche, die nicht hýngen kann** (`ripgrep`, `find_replace_all`) | Natives ripgrep in einem isolierten Worker auýerhalb des Host-Threads mit 3-s-Wallclock-ýberwachungszeit; Rust-Dialekt-Regexps demoten automatisch zu Fixstrings und verraten das via `pattern_mode`; Dry-Run-Multifilen-Ersetzung. | =ý Konkurrenten liefern grenzenlose grep-Schleifen  dieses kann physisch nicht ewig drehen |
| =ý **Sichere Dateibearbeitung** (`replace_text_in_file`, `line_operations`) | `.bak`-Backup bei jeder Bearbeitung, muster-verankerte Einfýgungen, Zeilen-Fingerprint-Verifikation, MD5-Integritýtscheck nach dem Schreiben. Jede Datei in einem Aufruf wiederherstellen (`restore_from_bak`). | =ý **3-Schicht-Gewýhrleistung** gegen Korruption durch veraltete Zeilennummern  Konkurrenten bieten bestenfalls Rename-Backup-Shims |
| ý **Nicht-blockierende Hintergrundbefehle** (`run_background_command` + monitor/cancel) | Lange Builds & Jobs starten, weiter chatten, Status jederzeit prýfen, bei Bedarf abbrechen. Kein Docker erforderlich. | P Nýchste Konkurrenten **erfordern Docker**; dieses lýuft nativ im Plugin-Host |
| < **Echte Browser-Automatisierung** (Puppeteer-Suite) | Headloser Chromium mit persistenten Sitzungen und UI-Interaktion  kein Einmal-Seite-holen"-Aufruf. | Konkurrenten-Website-besuchen"-Plugins sind ý *nur statische Scraper* |
| =ý **Lokales semantisches RAG, jedes Format** (`rag_index_pdf/docx/xlsx`, `rag_query_vector`, `rag_web_content`) | Indizieren Sie PDFs, Word-Dokumente und Tabellen fýr Vektorsuche  plus abfrage-relevante Web-Extraktion. Eine Toolkit-Einheit ersetzt 24 separate Plugins der Konkurrenten. Nichts verlýsst Ihren Rechner. | =ý Begrenzte Chunking: **kein OOM durch Gift-Lýnge-Dokumente** (gegen ein 1690-Seiten-PDF verifiziert) |
| >ý **Fýhrt Ihre Test-Suite fýr Sie aus** (`run_tests`) | Erkennt Jest / Mocha / Vitest automatisch aus `package.json` und fýhrt sie aus, Ergebnisse zurýck im Chat. | P Keine andere Toolbox im Feld macht das |
| =ý **Datensichtbarwerdung als Tool-Aufruf** (`generate_chart`) | Balken / Linie / Kreis / Donut / Streuung / Radar ý Bilddatei, mit HTML-Fallback, wenn der Renderer nicht verfýgbar ist. | >G **Zum Zeitpunkt der Umfrage gab es im gesamten Feld null Data-Viz-Plugins** |
| =ý **Strukturierte Planung mit Live-Fortschritt** (`create_plan`, `get_plan`, `update_plan_step`) | Mehrstufige Plýne, verfolgt durch eine echte Zustandsmaschine (pending ý in_progress ý done, blocked-retry) mit Abschlussmetriken. | P Selten  die meisten Toolboxes haben gar keine Planungs-Primitiven |

---

## Direktvergleich vs Beledarians LM Studio Tools

Der nýchstliegende direkte Wettbewerber im Hub: gleiche Aufgabe (Tools fýr lokale LLMs), sehr unterschiedlicher Aufbau. Wo AI Toolbox vorn liegt:

| Was AI Toolbox hat und sie nicht |
|---|
|  **AST-level Refactoring** (Rename, Funktionsverschiebung, Dead-Import-Cleanup)  syntaksichere Transformationen mit Auto-Rollback, keine String-Bearbeitungen |
|  **Echtes RAG:** lokaler Vektorindex ýber PDF / DOCX / XLSX mit Seitenebenen-Provenienz  nicht nur Keyword-Suche |
|  **Bilder & Data-Viz:** OCR auf Screenshots und Aufnahmen, Bild-Metadaten + Vergleich, Chart-Erstellung |
|  **117 Tools** vs ~49  gestýtzt durch 1291 bestandene Tests in 86 Suiten |
|  **Crash-resiliente Schreibvorgýnge + Rollback bei Fehlschlag:** eine missglýckte Bearbeitung kann Ihre Datei nie korrupt machen |

Unsere frýhere i18n-Lýcke ist geschlossen: **wir liefern jetzt 5 Lokalisationen** (en ý de ý es ý zh-CN ý zh-TW), jeweils ein vollstýndiger ýbersetzungssatz  und Anti-Stub-Tests bewachen die Suite, damit Alias-/Fallback-Sprachen nie stillschweigend regressieren. Wir sagen Ihnen das lieber, als zu behaupten, es gýbe sie nicht.

---

## Sehen Sie es arbeiten  Ein Zug, zehn Tools

> **Sie:** *Refaktorisches `auth.ts`  extrahiere die Token-Refresh-Logik in ein eigenes Modul, verschiebe den Helper daneben, fýhre unsere Test-Suite aus und ýffne einen PR, wenn er grýn ist."*
>
> ý `refactor_code` (AST-Extraktion + Funktionsverschiebung, Auto-Rollback bereit) ý `run_tests` (automatisch erkannt: **Jest**: alles ) ý `gh_create_pr`  **ein Zug. Null Copy-Paste. Zero Hand-Holding.**

---

## Funktionen im ýberblick

### Sichere Dateibearbeitung & Suche
In-place-Ersetzung ý zeilenverankerte Einfýgungen ý Chunked-Reads auf riesigen Dateien ý Diffs ý Verzeichnisbýume  und **jeder Schreibvorgang wird zuerst gesichert** (`.bak`, Wiederherstellung in einem Aufruf). Projektweite Suche, die physisch nicht hýngen kann (`ripgrep`: worker-isolierte native Scan mit 3-s-Wallclock-ýberwachung, standardmýýig ausgeblýdete Verzeichnisse wie `node_modules`) plus Dry-Run-Multifilen-Ersetzung.

### Syntaxrespektvolles Code-Refactoring
AST-gesteuerte Renames, Funktionsverschiebungen & Extraktionen mit Auto-Rollback  der Agent refaktoriert wie ein Entwickler, nicht wie `sed`.

### Lange Jobs ohne den Faden zu verlieren
Startet Builds und Watcher im **Hintergrund**, bleibt beim Chatten, pollt oder bricht auf Anforderung ab. Gesandboxtes JS/Python fýr schnelle Logik; volle Shell (Pipes, Redirects, Env-Variablen) wenn nýtig  aber *standardmýýig aus*. Ihre Test-Suite fýhrt sich selbst: automatisch erkannter Runner, Ergebnisse zurýck im Chat.

### Web-Recherche & Browser-Automatisierung
Multi-Engine-Suche mit automatischem Fallback ý saubere SeitenText-Extraktion ý ein **echter headloser Browser** mit persistenten Sitzungen (kein Einmal-Scraper) ý HTTP-Client fýr jeden GET/POST-JSON-Aufruf  SSRF-geschýtzt.

### Git & GitHub Workflows, ohne Hýnde
Lokal: status, diff, add, commit, log, checkout, **stash**, **blame**. Remote: Issues, PRs, Kommentare, Diffs, Push  ýber die `gh` CLI, der Sie schon vertrauen.

### Daten, die es wirklich lesen kann
PDFs, Word-Dokumente & Tabellen ý **lokale semantische Vektorsuche** (nichts verlýsst Ihren Rechner). OCR auf Screenshots und Desktop-Aufnahmen; Bild-Metadaten & Vergleich. Read-only-SQLite mit injektionssicheren parametrisierten Queries. Ihr Agent *sieht* wýrtlich Bildschirme.

### Speicher, der das Chat-Fenster ýberlebt
Entscheidungen, Muster und Konfigurationen persistieren pro Projekt  **und quer zu Projekten**: typ-spezifisch, TTL-geschnitten, mit RecencyýFrequency-Scoring abgerufen, wechseln erst nach Bestýtigung (`switch_context`). ContextGuard hýlt Marathon-Sitzungen am Leben: auto-Zusammenfassung bei 75 %, Kompression bei 90 %  mitten in der Kette.

### Ausgabe, die Sie sehen kýnnen
Charts aus Rohdaten gerendert zu Bilddateien (Balken/Linie/Kreis/Donut/Streuung/Radar). Live HTML/CSS/JS-Komponenten generiert und im Browser vorgefýhrt, mit Daten extrahiert zurýck in den Chat.

---

## Schnellstart (2 Minuten)

**Voraussetzungen:** LM Studio (aktuellste Version) ý Node.js 20+ ý *optional:* `gh` CLI fýr GitHub-Remote-Betrieb ý https://cli.github.com/

1. **Installieren**  Ordner ablegen, Plugin in den LM Studio-Einstellungen aktivieren
2. **Umschalter**  die gewýnschten Tool-Kategorien einschalten (Execution & Browser sind aus Designgrýnden deaktiviert)
3. *(Optional)* `gh auth login` einmal im Terminal, um GitHub-Remote-Tools freizuschalten
4. **Chatten**  Ihr Agent hat jetzt **117 Tools** in Reichweite, genau so gated wie konfiguriert

```bash
# Developing instead of using?
npm install && npm run build   # ESM + CJS via tsup
npm test                        # full suite: 86 suites / 1291 tests green (v1.9.24)
```

---

## Konfiguration & Tool-Umschalter  Volle Kontrolle, null Code

| Steuerung | Was sie tut |
|---|---|
| <ý **Feingranuliertes Gating** | Jede Tool-Familie schaltet sich unabhýngig in der LM-Studio-Einstellungs-UI |
| =Q **God Mode** | Ein Schalter aktiviert alles (nur fýr Power-User  Execution ist aus einem Grund standardmýýig deaktiviert) |
| = **ContextGuard** | Token-Schwellen + Zusammenfassungsmodell setzen; beobachten Sie, wie Auto-Kompression lange Sitzungen am Leben erhýlt |
| >ý **Auto-Tracking** | Hintergrund-Tracking von Entscheidungen & Task-Abschlýssen mit Konfidenz-getaggten Ergebnissen |

---

## Sicherheitslage  gebaut, als wýre es wichtig

- =ý Jedes dateimodifizierende Tool schreibt zuerst eine `.bak`  Wiederherstellung ist ein Aufruf (`restore_from_bak`)
- =ý `ripgrep` / `find_replace_all`: worker-isoliertes Scanning (der Host-Thread kann nicht klemmen), 3-s-Wallclock-ýberwachung, automatische Demotion des Rust-Dialekts offengelegt via `pattern_mode` + Hinweis
- =ý RAG & Web-Pfade: begrenzte Reads (250K500K Zeichen-Budgets), 30-s-Abbrýche pro Fetch-Versuch, Chunking-Schleifen, die *terminieren*  kein Plugin-Host-OOM durch Gift-Dokumente
- =ý Gesandboxte JS/Python-Ausfýhrung; volle Shell verfýgbar, aber **standardmýýig aus**
- Vollstýndiges Threat-Modell & Disclosure-Prozess ý [SECURITY.md](SECURITY.md)

---

## Architektur unter der Haube (fýr Neugierige)

Declarative Tool-Registry mit closure-basierter Dependency Injection ý volle Asynchronitýt + crash-resiliente atomare Schreibvorgýnge (`atomicWrite`-Utility, Rollback bei Fehlschlag) ý dynamische Kontextfenster-Erkennung ýber native SDK-APIs ý Konfidenz-getaggte Ergebnisse (`EXTRACTED | INFERRED | AMBIGUOUS`) ý cluster-bewusste Tool-Prioritýt fýr Grammatiklimit-Pflege.

Tiefenblick ý [ARCHITECTURE.md](ARCHITECTURE.md) ý Entwickler-Guide in dieser Datei unten

---

## Die Waffenkammer: 117 Tools ýber alle Familien, alles zum Umschalten

Ein Plugin ersetzt eine ganze Regalwand. Hier ist jede Familie, was sie abdeckt und ihr Standardzustand:

| Familie | Anzahl | Was es Ihrem Agenten gibt | Default |
|---|---|---|---|
| =ý **Dateisystem** | 24 | Lesen/Schreiben/Bearbeiten/Suchen  pfadvalidiert, gesichert, Chunked-Reads auf riesigen Dateien, Diffs, Projektbýume, worker-isolierte `ripgrep`-Suche (3-s-ýberwachung) + strukturiertes Inhalts-Scanning (`pattern_scan`) + Zeilenoperationen mit Fingerprint-Guards (`line_operations`, eingefaltet 23.09 Q6) + byte-exaktes Unified-/Binary-Patching (`apply_patch`, 07.11) |  |
| >ý **Refactoring & Recode-Engine** | `refactor_code` + Regeln | AST-Rename ý move-function ý extract ý Dead-Import-Cleanup  plus eine anpassbare Regel-Engine (Dead-Code-Hinweise, Typinferenz, Async-Modernizer) mit Dry-Run-Diffs |  |
| = **Textverarbeitung** | 3 | Regex-Transformationen (`sed`-Klasse), strukturierte Extraktion (`awk`-Klasse), sofortige Markdown-Tabellen (Zeilenoperationen nach Dateisystem verschoben, 23.09 Q6) |  |
| =ý **Aufgabenplanung** | 4 | Ziel- + Schritt-Plýne durch eine echte Zustandsmaschine mit Live-Abschlussmetriken  blockierte Schritte retry sauber ý bestýtigungsgated `remove_plan` + Auto-Removed bei natýrlicher Vollendung (05.10) |  |
| ý **Execution** | 5 | Gesandboxtes JS & Python (eval/require blockiert) ý volle Shell & natives Terminal (opt-in) ý **fýhrt automatisch die Test-Suite Ihres Projekts aus** (Jest/Mocha/Vitest erkannt) | gemischt |
| >ý **Kontext & Speicher** | 22 | Auto-Zusammenfassung, typisierter Speicher mit TTL-Pflege & Heuristik-Recall, Ereignis-Tracking  **plus projektýbergreifend**: Projekte registrieren/suchen/wechseln, Session-Index-Browser + Ein-Aufruf-read-only-Resume-Bootstrap (`restore_session_context`, 25.09) |  |
| =ý **Vektor-RAG** | 7 | Semantische Suche ýber Ihre Codebase *und* PDFs ý Word-Dokumente ý Tabellen + abfrage-relevante Web-Extraktion  lokal, begrenzt, OOM-sicher |  |
| =ý **Backup & Restore** | 5 | Vollverzeichnis-ZIP-Snapshots (`create_backup`/`restore_backup`), Auflistung, Cleanup  plus das per-Bearbeitung `.bak`-System unter allem |  |
| =ý **Datensichtbarwerdung** | 1 | `generate_chart`: Balken / Linie / Kreis / Donut / Streuung / Radar ý Bilddatei mit HTML-Fallback ý Geschwister am selben Umschalter: `markdown_preview`, `get_repeat_tool_advice` (DOC-PIN) |  |
| =ý **Bildverarbeitung** | 4 | OCR (`image_to_text`) ý Metadaten-Inspektion (`describe_image`) ý Desktop-Aufnahme (`screenshot_desktop`) ý Byte-level-Vergleich (`compare_images`) |  |
| =ý **Dokumenten-Parsing** | 1 | PDF / DOCX / TXT direkt in den Chat, binýrsicher |  |
| < **Web-Recherche** | 3 | Multi-Engine-Suche mit Fallback ý saubere SeitenText-Extraktion |  |
| < **Browser-Automatisierung** | 5 | Echter headloser Chromium: Seiten ýffnen, persistente Sitzungen, UI-Interaktion, HTML vorschauen |  opt-in |
| = **Git & GitHub** | 15 | Voller lokaler git inkl. **stash & blame** ý Issues/PRs/Kommentare/Diffs/Push ýber Ihre `gh` CLI |  opt-in |
| ý **Hintergrundbefehle** | 3 | Lange Jobs ausfýhren ohne den Chat zu blockieren  stdout/stderr ýberwachen, jederzeit abbrechen. Kein Docker erforderlich. |  opt-in |
| =ý **HTTP-Client** | 3 | Requests jeder Methode mit Retry/Timeout, JSON GET/POST-Helfer  SSRF-geschýtzt |  opt-in |
| <ý **UI-Generierung** | 3 | Live HTML/CSS/JS-Komponenten im Browser bauen & vorschauen ý Daten wieder extrahieren (standardmýýig AN seit 10.10, Owner-Entscheidung) |  |
| =ý **Datenbank** | 1 | Read-only-SQLite mit injektionssicheren parametrisierten Queries |  opt-in |

> *Zahlen sind code-verifiziert (Source-of-Truth-Audit, Sept. 2026); die ausgesetzte Tool-Anzahl ist immer umschalterabhýngig.*

> *Per-Tool-Parameter, Defaults und Beispiele ý [TOOLS_REFERENCE.md](TOOLS_REFERENCE.md) (gegen Quellcode auditiert). Walkthroughs: [DOCUMENTATION.md](DOCUMENTATION.md) ý [QUICK_START.md](QUICK_START.md)*

---

## Release-Highlights (voller Verlauf ý CHANGELOG_v5.md  aktiv; v1v4 in docs/history/)

| Version | Schlagzeile |
|---|---|
| **v1.9.24** | =ý Budget-Guard Kontext-Limit-Schutz  M1 Pre-Read-Advisory (`read_file` / `read_document`: selbstbeschreibendes Budget-Advisory statt vollem Dump, wenn die projektive Nutzung 80 % ýberschreiten wýrde), M2 budget-aware Spill-Cap (Spill-Kante 92 %, Sicherheitsmarge 8 %), M3 Versicherungs-Auto-Persist der Session-Memory bei 85 %  Master-Switch standardmýýig AN, explizites AUS stellt das byte-identische Altverhalten wieder her; alle fýnf Einstellungszeilen in allen Locales lokalisiert ý >ý NEUE Suite `tests/budgetGuard.test.ts` (+1 Suite / +18 Tests ý Canon **83 Suiten / 1234 Tests**, gepinnte Dichten 1.3071.670 c/tok; abgelýst 07.11 durch den apply_patch-SHIP  Canon jetzt **84 Suiten / 1262 Tests** ý 116 Tools) |
| **v1.9.23** | >ý `memory_recall` Read-only-Tool  ID-first Index/Fetch ýber Context-Eintrýge, Memory-Facts & Sessions-Index (self-describing Misses; hermetische Byte-Identity-Suite) ý =ý alle Docs auf Live-Canon *82 Suiten / 1216 Tests* re-stamped + MD-Reparatur-Sweep |
| **v1.9.22** | <ý Versions-Verlagerungs-Release, das den CTX-EST-A schlieýt  Provenienz des Shared-Density-Schýtzers per Live-Probe auf qwen3.8-27b-ud festgelegt (Band 1.3071.670 Zeichen/Token, `BIAS`/`FLOOR`-Werte unverýndert; nur Kommentar-Delta in `tokenStatsManager.ts`) ý =ý vollstýndige Docs-Sync auf den Canon **80 Suiten / 1193 Tests** ýber alle Live-Oberflýchen ý = updateChecker-Suite gehýrtet  Versions-Literal-Pins baseline-unabhýngig (`offsetLocalVersion()`), kýnftige Verlagerungen brauchen keine Test-ýnderungen |
| **v1.9.21** | =ý Update-Check-Arc-Familie  Desktop-Toast ý In-Chat-Ankýndigung pro Version wechselseitig exklusiv (SPEC A XOR; Hosts ohne system.notify fallen immer auf Chat zurýck) ý >ý DEFECT #2  `update-check.json` wird nur noch geschrieben, wenn sich der Inhalt ýndert ý <ý HUB-.VERSION-Quellenwechsel  der Produktiv-Update-Check liest die publizierte LM-Studio-Hub-`.VERSION`-Datei statt GitHub `releases/latest`; strenge Shape-1 / rauschtolerante Shape-2-Parsung, schlimmster Fall warn+skip ý >ý +2 Tools mit Locale-Paritýt in allen 5 Sets (utilities) ý Versionsverlagerung v1.9.20 ý **v1.9.21**  Canon **76 Suiten / 1109 Tests**, Zero-Drift |
| **v1.9.20** | =ý Versions-Verlagerungs-Release  der rev-3x-Stapel seit der letzten GitHub-Publikation wird in einer Verlagerung zusammengefýhrt: Session-Memory-Arcs A/B/C Close-out (TTL-Lebenszyklus + Supersede-on-Close-Out + Index-Dedupe / Artefakt-Strip), prýemptive Mid-Loop-Kompression bei fixen 95 % mit nutzer-sichtbarer Schwellen-Benachrichtigung, Tier-2-Zwangs-Save wýhrend des Tool-Loops, messender Token-Schýtzer (`AGENTIC_CHARS_PER_TOKEN` 3.2 ý benutzer-editierbar 3.6) ý = FIX-35c hang-fester ReDoS-Gate + pattern_scan WALK-ABORT (28.09, archiviert in CHANGELOG_v3) ý >ý ARC-RESTORE  One-Shot-`verification_checkpoint`-Lebenszyklus im Context-Store + Restore-Seiten-Hýrtung (Age-Labels pro Eintrag, Top-N-Substanz-Limit, additives `context_stale_fraction`) ý Canon **74 Suiten / 1064 Tests** |
| **v1.9.19** | =ý Nie verýffentlichtes Label  package.json sprang 06.10 bereits von v1.9.18 ý v1.9.20 (Rev-Lock-Auflýsung); das `version`-Feld des Manifests blieb bei v1.9.19 bis zur Versions-Verlagerung vom 15.10, die den angesammelten Stapel fýr die Hub-Publikation erkennbar machte  unter diesem Label wurde kein Code ausgeliefert; siehe v1.9.20 oben |
| **v1.9.18** | = Suite D shared-file lost-write fix  pro-Pfad-In-Prozess-Sperre auf die snapýrename-Kritiksektion (neues `sharedFileLock.ts`, in beide Writer eingewickelt) ý >ý EOL-FIX v4  byte-exakter Zeilenende-Roundtrip fýr `replace_text_in_file` auf gemischten/CRLF-Dateien + Pre-Edit eol/bom-Sichtbarkeit via `get_file_metadata` ý >ý PIPELINE HYGIENE D 25.09  vereinte Outcome-Taxonomie + finalizeContent-Invariante, pro-Zug-toolsProvider-Guard-Reset |
| **v1.9.17** | =ý Tool Gating Profile  persistente Tool-Umschalter ý = ripgrep TOOL SWAP + vereinte Projekt-Registry + Worker-Pool-Flattern-Fix (letzte GitHub-Publikation 15.09)  alle rev-31-Arbeiten (DE-STRAngle, AutoTracker F1+F2, cluster-bewusste Tool-Reihenfolge, CWD-Zustandsverlagerung, SPEC-C) in v1.9.18 ausgeliefert |
| **v1.9.16** | = `web_search` Zero-Ergebnis-Fallback-Fix  toter/leerer Engine stoppt die Kette nicht mehr (blockierter `ddg-api` ýbersprungen ý `ddg-fetch` lieferte Ergebnisse) |
| **v1.9.15** | ý B' ripgrep phase-1 Prefilter fýr `pattern_scan` (byte-identische JS-Fallback-Garantie) ý `ripgrep` zu Laufzeitabhýngigkeit befýrdert, behebt stillen Fast-Pfad-Verlust bei Hub-Installationen  live auf der Benutzermaschine verifiziert |
| **v1.9.14** | >ý `get_memory` lokale-Datei-Parsing-Guard  schlýssellose Auto-Kontext-Aufzeichnungen unterbrechen Reads nicht mehr (Hotfix) |
| **v1.9.13** | = ripgrep-getragener Regex-Motor fýr `grep_files` (in-Prozess-WASM-Prefilter, transparenter Fallback behýlt jeden Hang-Guard; Tool im 14.09 TOOL SWAP entfernt ý eigenstýndige native `ripgrep`) ý `executedTool` Bodenwahrheits-Stempel auf allen Tool-Ergebnissen ý Tier-1 Dead-Code-Entfernung (~90 KB) |
| **v1.9.12** | <ý `pattern_scan` rekursive Inhalts-Suche (unsichere Regexps demoten automatisch zu literal; 256-KB/10k-Zeilen-Hartlimits) ý puppeteer `connected` Eigenschaftslese-Fix ý Dead-Datei-Entfernung  volle MD-Docs-Synchronisierung |
| **v1.9.10** | =' OOM-Hýrtungs-Suite: begrenzte Web/RAG-Reads, Chunking Fixpunkt-Termination, `rag_web_content` Deduplizierung  Plugin-Host-Heap ist jetzt unter Gift-Payloads sicher |
| **v1.9.9** | ý Deadline-begrenztes `grep_files` (Teilergebnisse + `aborted`-Flag) ý AutoTracker Token-Deltas feuern Schwellen *innerhalb* langer Tool-Ketten ý live `chat used H N tok` DELTA-Log |
| **v1.9.8** | = Explizite Projektregistrierung nur ý Hang-Prývention (`max_depth`, Zeilenlimits) ý Step-0.7 Keyword-Erkennung + lazy Registry-Sync týtet die project not found-Schleife |
| **v1.9.7** | =ý Crash-resiliente atomare Schreibvorgýnge ýberall  randomisierte Tempdateinamen, Rollback bei Fehlschlag, null blockierende I/O |
| **v1.9.56** | >ý Graphify-inspirierte Intelligenz: Konfidenz-getaggte Ergebnisse, Hub-Ausschluss-Clustering, cluster-bewusste Tool-Prioritýt ý `shell:true`-Deprecation eliminiert |
| **v1.8.x** | =ý 3-Schicht Zeilenbearbeitungs-Gewýhrleistung ý SDK v1.x Tokenzýhlgenauigkeit (stimmt mit der Seitenleiste innerhalb von 0,3 %) ý deklarativer Registry-Refactoring (~80 Zeilen if/else ý 20-Eintrýge-Registry) |

---

## Kernabhýngigkeiten

`@lmstudio/sdk` ^1.5.0 ý `puppeteer` ^24 ý `isomorphic-git` ^1.38 ý `sharp` ^0.35.3 ý `tesseract.js` ^7 ý `pdf-parse` / `mammoth` / `xlsx` (Dokumenten-Pipeline) ý `ripgrep` ^0.3.1 (WASM-Regex-Motor, lazy geladen) ý `@dqbd/tiktoken` (ContextGuard) ý `zod` (Laufzeitvalidierung)

---

## Lizenz

**MIT**  frei zu verwenden, zu modifizieren, auszuliefern. Siehe [LICENSE](LICENSE).

---

*AI Toolbox ist ein All-in-One-LM-Studio-Plugin und KI-Agenten-Toolkit fýr lokale LLMs: sichere Datei-Tools, hang-sichere Codebase-Suche, Hintergrund-Builds, headlose Browser-Automatisierung, Git & GitHub Workflows, OCR, Datensichtbarwerdung, lokales semantisches RAG ýber PDF/DOCX/XLSX, projektýbergreifender Speicher, selbstverwaltende Kontextfenster  116 fertige Tool-Aufrufe, die Ihr Modell mit null Klebcode verwenden kann.*
