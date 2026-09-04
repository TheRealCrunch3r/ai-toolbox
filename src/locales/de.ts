/**
 * German translations for AI Toolbox plugin
 */

import type { FullTranslationSet } from './types';

export const deTranslations: FullTranslationSet = {
  fileSystem: {
    categoryTitle: '📁 Dateisystem-Tools',
    tools: [
      { toolName: 'list_directory', description: 'Dateien und Ordner im Workspace auflisten', parameters: ['path (optional)'] },
      { toolName: 'read_file', description: 'Textdatei-Inhalt lesen', parameters: ['file_name'] },
      { toolName: 'save_file', description: 'Datei erstellen oder überschreiben', parameters: ['file_name, content'] },
      { toolName: 'replace_text_in_file', description: 'Exakten String in Datei ersetzen (VERWENDE DIES FÜR KOMPLEXE EINFÜGEN/ERSETZEN — VERWENDE NIEMALS line_operations dafür)', parameters: ['file_name, old_string, new_string'] },
      { toolName: 'insert_at_line', description: '⚠️ Nur Einzel-Inserts — vermeiden für mehrstufige strukturelle Änderungen (stattdessen save_file/replace_text_in_file verwenden). Text an spezifischer Zeile einfügen.', parameters: ['file_name, line_number, content'] },
      { toolName: 'append_file', description: 'Inhalt ans Dateiende anhängen', parameters: ['file_name, content'] },
      { toolName: 'delete_lines_in_file', description: 'Spezifische Zeilen aus Datei löschen', parameters: ['file_name, start_line, end_line (optional)'] },
      { toolName: 'make_directory', description: 'Neuen Ordner erstellen', parameters: ['directory_name'] },
      { toolName: 'move_file', description: 'Datei/Ordner verschieben oder umbenennen', parameters: ['source, destination'] },
      { toolName: 'copy_file', description: 'Datei an neuen Ort kopieren', parameters: ['source, destination'] },
      { toolName: 'delete_path', description: 'Datei oder Ordner löschen (zerstörerisch)', parameters: ['path'] },
      { toolName: 'delete_files_by_pattern', description: 'Dateien matching Regex-Pattern löschen', parameters: ['pattern (regex)'] },
      { toolName: 'find_files', description: 'Dateien nach Name-Pattern rekursiv finden', parameters: ['pattern, max_depth (optional)'] },
      { toolName: 'fuzzy_find_local_files', description: 'Fuzzy-Suche Dateien nach Name/Pfad-Ähnlichkeit', parameters: ['query, path (optional), max_results (optional)'] },
      { toolName: 'get_file_metadata', description: 'Datei-Größe, Daten, Typ-Info erhalten', parameters: ['path'] },
      { toolName: 'change_directory', description: 'Working Directory wechseln', parameters: ['directory'] },
      { toolName: 'read_document', description: 'PDF oder DOCX Dokumente lesen', parameters: ['file_path'] },
      { toolName: 'analyze_project', description: 'Projekt-weite Linting-Analyse ausführen', parameters: [] },
      { toolName: 'read_file_chunked', description: 'Dateien in strukturierten Chunks lesen, um Zeichenlimits zu umgehen; liefert Start-/End-Indizes für Streaming-Kontrolle bei sehr großen Dateien', parameters: ['file_name, chunk_size/max_chunks (optional)'] },
      { toolName: 'grep_files', description: 'Regex- oder AST-Mustersuche über das gesamte Projekt — ReDoS-sicher mit 15 s Deadline; Teilresultate + explizites aborted-Flag bei Timeout; node_modules standardmäßig ausgeschlossen', parameters: ['pattern (+ include/exclude/limit options)'] },
      { toolName: 'find_replace_all', description: 'Regex-Suche & -Ersetzung über mehrere Dateien mit Dry-Run-Vorschau, .bak-Backups und Endungsfiltern — eingebaute Hang-Prävention durch Depth-Cap', parameters: ['pattern, replacement (optional), directory/dry_run/confirm (+ filters)'] },
      { toolName: 'pattern_scan', description: 'Rekursive Inhalts-Suche, liefert passende Zeilen als {file, line, content}; unsichere Regex wird automatisch zu Literal herabgestuft; 256 KB / 10k-Zeilen Limits pro Datei mit Skip-Aufzeichnungen; ripgrep Phase-1 Prefilter (B\')', parameters: ['pattern (+ root/mode/caps options)'] },
      { toolName: 'directory_tree', description: 'Verzeichnisstruktur in Baumform visualisieren mit Max-Tiefe, optionalen Dateigrößen und automatischem Ausschluss großer Verzeichnisse', parameters: ['path/max_depth/show_size (optional)'] },
      { toolName: 'file_diff', description: 'Zwei Dateien vergleichen und einen Unified Diff mit +/−-Markierungen und Zeilennummern zurückgeben', parameters: ['file_a, file_b'] },
    ],
  },
  webSearch: {
    categoryTitle: '🌐 Web & Recherche-Tools',
    tools: [
      { toolName: 'web_search', description: 'DuckDuckGo/Google/Bing Suche mit Fallback-Kette', parameters: ['query, providers (optional)'] },
      { toolName: 'wikipedia_search', description: 'Wikipedia für Seiten-Zusammenfassungen suchen', parameters: ['query, lang (optional)'] },
      { toolName: 'fetch_web_content', description: 'Webpage clean Text-Inhalt fetchen', parameters: ['url'] },
      { toolName: 'rag_web_content', description: 'RAG-basierte semantische Websuche', parameters: ['url, query'] },
      { toolName: 'browser_session_open', description: 'Persistente Browser-Session öffnen', parameters: ['url, wait_for_selector (optional)'] },
      { toolName: 'browser_session_control', description: 'Browser-Aktionen steuern (click, type, etc.)', parameters: ['actions array, read_page flag'] },
    ],
  },
  browserAutomation: {
    categoryTitle: '🌐 Browser-Automatisierung-Tools',
    tools: [
      { toolName: 'browser_open_page', description: 'One-Shot Page Render mit Puppeteer', parameters: ['url, screenshot_path (optional), actions (optional)'] },
      { toolName: 'browser_session_close', description: 'Persistente Browser-Session sauber schließen und verwaiste Chromium-Prozesse verhindern', parameters: [] },
      { toolName: 'preview_html', description: 'Rohes HTML oder eine bestehende .html-Datei im Systemstandard-Browser rendern', parameters: ['source (HTML string or path)'] },
      { toolName: 'open_file', description: 'Dateien/URLs in der Systemstandardanwendung öffnen (Windows start / macOS open / Linux xdg-open)', parameters: ['target'] },
    ],
  },
  gitOperations: {
    categoryTitle: '🐙 Git & GitHub-Tools',
    tools: [
      { toolName: 'git_status', description: 'Modifizierte Dateien im Repository anzeigen', parameters: [] },
      { toolName: 'git_diff', description: 'Changes in Detail sehen', parameters: ['file_path (optional), cached (optional)'] },
      { toolName: 'git_commit', description: 'Staged Changes commiten', parameters: ['message'] },
      { toolName: 'git_log', description: 'Commit-History anzeigen', parameters: ['max_count (optional)'] },
      { toolName: 'git_add', description: 'Spezifische Dateien oder alle Changes stage', parameters: ['paths (optional)'] },
      { toolName: 'git_checkout', description: 'Zu bestehender oder neuer Branch wechseln', parameters: ['branch_name, create_new (optional)'] },
      { toolName: 'gh_auth', description: 'GitHub-Authentifizierungsstatus prüfen', parameters: [] },
      { toolName: 'gh_create_issue', description: 'Neues GitHub-Issue erstellen', parameters: ['title, body (optional), labels (optional)'] },
      { toolName: 'gh_list_issues', description: 'Issues im Repository auflisten', parameters: ['state (optional), labels (optional), limit (optional)'] },
      { toolName: 'gh_view_comments', description: 'Comments auf Issue oder PR anzeigen', parameters: ['number, type (optional)'] },
      { toolName: 'gh_create_pr', description: 'Pull Request erstellen', parameters: ['title, body, head_branch, base_branch (optional)'] },
      { toolName: 'gh_list_prs', description: 'Pull Requests im Repository auflisten', parameters: ['state (optional), limit (optional)'] },
      { toolName: 'gh_view_pr_diff', description: 'PR diff/patch fetchen', parameters: ['number'] },
      { toolName: 'gh_push', description: 'Commits zu Remote-Repository pushen', parameters: ['branch (optional)'] },
      { toolName: 'git_stash', description: 'Uncommittete Änderungen verwalten: Stashes speichern, poppen, löschen und auflisten (natives Git CLI — isomorphic-git hat keine Stash-Unterstützung)', parameters: ['operation (+ options)'] },
      { toolName: 'git_blame', description: 'Zeilenweise Commit-History mit Autor, Zeitstempel und Hash; Pfadvalidierung verhindert Traversal-Angriffe', parameters: ['file_path (+ options)'] },
    ],
  },
  databaseQueries: {
    categoryTitle: '💾 Datenbank-Query-Tools',
    tools: [
      { toolName: 'query_database', description: 'Read-only SQLite Queries ausführen', parameters: ['query (SQL string)'] },
    ],
  },
  documentParsing: {
    categoryTitle: '📄 Dokument-Parsing-Tools',
    tools: [
      { toolName: 'read_document', description: 'PDF oder DOCX Dokumente lesen', parameters: ['file_path'] },
    ],
  },
  backgroundCommands: {
    categoryTitle: '⏱️ Hintergrund-Kommando-Tools',
    tools: [
      { toolName: 'run_background_command', description: 'Lang-running Prozess im Background starten', parameters: ['command, timeout_hours (mandatory), name (mandatory)'] },
      { toolName: 'check_background_command', description: 'Status und Output von running Command prüfen', parameters: ['id'] },
      { toolName: 'cancel_background_command', description: 'Running Background Command killen', parameters: ['id'] },
    ],
  },
  codeRefactoring: {
    categoryTitle: '🧬 Code-Refactoring-Tools',
    tools: [
      { toolName: 'refactor_code', description: 'AST-basiertes Refactoring (Babel): Identifier umbenennen, Funktionen zwischen Dateien verschieben, Funktionen extrahieren, Dead-Import-Cleanup — syntaxsicher mit .bak-Backup und Auto-Rollback bei Fehler; Dry-Run-Diffs unterstützt', parameters: ['file_path, operation, per-operation fields, dry_run (optional)'] },
    ],
  },
  execution: {
    categoryTitle: '⚡ Execution-Tools',
    tools: [
      { toolName: 'run_javascript', description: 'JavaScript in isoliertem Node-VM-Kontext ausführen; eval/require/child_process blockiert, Standard-Timeout 5 s', parameters: ['javascript, timeout_seconds (optional)'] },
      { toolName: 'run_python', description: 'Python in kontrollierter Sandbox ausführen; os/subprocess/sys Imports blockiert, Standard-Timeout 10 s', parameters: ['python, timeout_seconds (optional)'] },
      { toolName: 'execute_command', description: '⚠️ Shell-Kommandos mit mehrschichtiger Sanitisierung und Pipe-Limits ausführen — standardmäßig deaktiviert', parameters: ['command (+ options)'] },
      { toolName: 'run_in_terminal', description: 'OS-natives Terminal-Fenster (cmd/PowerShell/zsh/bash) mit Umgebungsvariablen und Sichtbarkeits-Optionen starten', parameters: [] },
      { toolName: 'run_tests', description: 'Testframework automatisch aus package.json erkennen (Jest/Mocha/Vitest) und die Projekt-Suite ausführen, Ergebnisse zurückgeben', parameters: [] },
    ],
  },
  textProcessing: {
    categoryTitle: '📝 Textverarbeitung-Tools',
    tools: [
      { toolName: 'text_transform', description: 'Regex-basierte Textsubstitution mit Capture Groups ($1/$2), Zeilenbereichen und global/case-insensitive Modi — sicherer als Shell sed', parameters: ['file_name, pattern, replacement (optional), flags (optional)'] },
      { toolName: 'line_operations', description: 'Zeilen awk-artig einfügen/löschen/neu anordnen ohne Shell-Abhängigkeiten; dreischichtige Guardrails (Pattern-Anker, Zeilen-Fingerprinting, Bounds-Validierung) + MD5 Integritätscheck nach dem Schreiben', parameters: ['file_name, operation, target_line or pattern anchors (+ options)'] },
      { toolName: 'text_extract', description: 'Strukturierte Feldextraktion aus delimitiertem Text (CSV/TSV/custom) mit nullbasierten Feld-Indizes', parameters: ['file_name, fields, delimiter (optional), output_format (optional)'] },
      { toolName: 'markdown_table_gen', description: 'Gültige Markdown-Tabelle aus einem Objektarray erzeugen mit Headern, Ausrichtung und Trunkierung', parameters: ['data, headers (optional)'] },
    ],
  },
  taskPlanning: {
    categoryTitle: '📋 Task-Planung-Tools',
    tools: [
      { toolName: 'create_plan', description: 'Mehrschrittigen Ausführungsplan erstellen (1–30 Schritte); ersetzt jeden aktiven Plan und gibt planId + stepCount zurück', parameters: ['goal, steps'] },
      { toolName: 'get_plan', description: 'Aktiven Plan mit Schritt-Status, Fertigstellungsgrad und Laufzeit zurückgeben; null wenn kein Plan existiert', parameters: [] },
      { toolName: 'update_plan_step', description: 'Einen Planschritt durch die State-Machine aktualisieren (pending→in_progress→done; any→blocked; blocked→pending) — note erforderlich beim Blockieren', parameters: ['planId, index, status, note (required if blocked)'] },
    ],
  },
  contextManagement: {
    categoryTitle: '🧠 Kontext- & Memory-Tools',
    tools: [
      { toolName: 'auto_summarize_context', description: 'Letzte Session-Aktivität auf Muster, häufige Tool-Nutzung und erinnerungswerte Entscheidungen analysieren; wird mit globalem Scope im persistenten Speicher abgelegt', parameters: ['session_events (+ config_changes)'] },
      { toolName: 'get_context_memory', description: 'Frühere Kontext-Einträge nach Typ filtern (decision/pattern/configuration/file_change/error/summary); Recency×Frequency-Scoring stellt kürzlich, häufig genutzte Einträge zuerst dar', parameters: ['type (optional), limit (optional)'] },
      { toolName: 'search_context', description: 'Fuzzy-Textsuche über Kontext-Einträge-Titel, Inhalte und Tags; abgelaufene Session-Einträge werden vor der Suche entfernt (24 h TTL)', parameters: ['query, max_results (optional)'] },
      { toolName: 'context_summary', description: 'Statistischer Überblick des persistenten Speichers: Gesamtzahl Einträge, Typ-Aufschlüsselung und aktuelle Aktivitätszählungen', parameters: [] },
      { toolName: 'delete_context_entry', description: 'Einen spezifischen Kontext-Eintrag per eindeutiger ID entfernen, ohne den restlichen Verlauf zu löschen', parameters: ['entry_id'] },
      { toolName: 'clear_context_memory', description: 'Alle automatisch gespeicherten Kontext-Einträge löschen (⚠️ irreversibel; erfordert confirm=true)', parameters: ['confirm'] },
      { toolName: 'track_important_event', description: 'Ereignis, Entscheidung oder Meilenstein manuell mit eigenen Tags für kategorisierte Abfrage aufzeichnen', parameters: ['title, content, tags (optional)'] },
      { toolName: 'save_session_summary', description: 'Strukturierte Session-Zusammenfassung (accomplishments, pending tasks, decisions) komprimiert speichern, um das 10k SDK-Limit zu umgehen', parameters: ['task_description (+ optional sections)'] },
      { toolName: 'get_session_summary', description: 'Letzte gespeicherte Session-Zusammenfassung mit rückwärtskompatiblem Fallback für Legacy-Daten abrufen', parameters: [] },
      { toolName: 'save_memory', description: 'Fakt in .ai_toolbox_memory.msgpack persistieren für Cross-Session-Kontinuität (RAM + atomare Disk-Kopie)', parameters: ['fact'] },
      { toolName: 'get_memory', description: 'Alle gespeicherten Memory-Einträge abrufen; lokale Projektdatei wird zuerst geprüft, dann persistenter Speicher', parameters: [] },
      { toolName: 'delete_memory', description: 'Einen spezifischen Memory-Eintrag per eindeutiger Key entfernen (wird beim Speichern zurückgegeben)', parameters: ['entry_id'] },
      { toolName: 'list_sessions', description: 'Gespeicherte Session-Zusammenfassungen mit Paginierung und Limit-Steuerung durchblättern', parameters: ['limit (optional), offset (optional)'] },
      { toolName: 'search_sessions', description: 'Keyword-Suche über gespeicherte Session-Zusammenfassungen, neueste zuerst', parameters: ['query, max_results (optional)'] },
      { toolName: 'clear_session_index', description: 'Nur alle leichtgewichtigen Session-Index-Einträge entfernen — Zusammenfassungen bleiben unberührt (erfordert confirm=true)', parameters: ['confirm'] },
      { toolName: 'register_project', description: 'Projekt im Cross-Projekt-Registry per Name + Working-Dir-Pfad registrieren oder aktualisieren (+ optionale Source-Dirs)', parameters: ['project_name, working_dir_path, source_dirs (optional)'] },
      { toolName: 'get_project_info', description: 'Details eines registrierten Projekts per Working-Directory-Pfad abrufen', parameters: ['working_dir_path'] },
      { toolName: 'list_projects', description: 'Alle registrierten Projekte mit Pfaden, letztem Zugriff und Session-Zählungen auflisten', parameters: [] },
      { toolName: 'search_projects', description: 'Registrierte Projekte per Name- oder Pfad-Teilstring suchen; lazy Registry-Sync registriert automatisch in Session-Memory gefundene Projekte', parameters: ['query, max_results (optional)'] },
      { toolName: 'switch_context', description: 'Kontextspeicher auf das Working Directory eines anderen Projekts umschalten für Memory/Session-Recall (confirm-first gemäß Step 0.7 Banner)', parameters: ['target_working_dir_path'] },
    ],
  },
  vectorRag: {
    categoryTitle: '🔍 Vector-RAG-Tools',
    tools: [
      { toolName: 'rag_index_files', description: 'Verzeichnis mit TS/JS/MD/JSON/YAML/Text-Dateien für semantische Suche indexieren, mit Batch-Verarbeitung', parameters: ['directoryPath, filePattern (optional), batchSize (optional)'] },
      { toolName: 'rag_index_pdf', description: 'PDF in seitenbegrenzten Chunks (~300 Wörter je) indexieren mit page_number-Herkunft — OOM-sichere begrenzte Lesezugriffe', parameters: ['filePath, chunkSize/overlap (optional)'] },
      { toolName: 'rag_index_docx', description: 'DOCX-Text via mammoth in wortbegrenzte Chunks extrahieren über dieselbe Embedding-Pipeline wie PDF', parameters: ['filePath, chunkSize/overlap (optional)'] },
      { toolName: 'rag_index_xlsx', description: 'Alle Sheets einer Tabelle als Zeilenarrays indexieren mit optionalem Sheet-Namen-Präfix für Nachvollziehbarkeit', parameters: ['filePath, chunkSize (optional), includeSheetNames (optional)'] },
      { toolName: 'rag_query_vector', description: 'Kosinus-Ähnlichkeitsabfrage über den Vektorindex, gibt top-k Chunks mit Inhalt und Scores zurück', parameters: ['query, topK (optional)'] },
      { toolName: 'rag_clear_index', description: 'Gesamten Vektorindex löschen (erfordert confirm=true); nützlich vor vollständigem Re-Indexing', parameters: ['confirm'] },
      { toolName: 'rag_web_content', description: 'URL abrufen und nur die zur Abfrage relevanten Text-Chunks zurückgeben — begrenzte, deduplizierte Extraktion', parameters: ['url, query'] },
    ],
  },
  uiGeneration: {
    categoryTitle: '🎨 UI-Generierung-Tools',
    tools: [
      { toolName: 'generate_ui_component', description: 'Interaktive HTML/CSS/JS-Komponenten (Buttons, Formulare, Tabellen) aus einer Benutzerbeschreibung erstellen', parameters: [] },
      { toolName: 'render_and_preview_ui', description: 'Komponenten im Browser mit Live-Vorschau rendern für schnelles Prototyping', parameters: [] },
      { toolName: 'extract_ui_data', description: 'Strukturierte Daten von Seiten per CSS-Selektoren/XPath extrahieren, tabellarische Ausgabe zurück in den Chat', parameters: [] },
    ],
  },
  httpClient: {
    categoryTitle: '📡 HTTP-Client-Tools',
    tools: [
      { toolName: 'http_request', description: 'Generischer GET/POST/PUT/DELETE/PATCH Client mit Retry-Logik, Timeout-Konfiguration und Multipart-Upload — SSRF-geschützt (⚠️ standardmäßig deaktiviert)', parameters: ['url, method (+ options)'] },
      { toolName: 'http_get_json', description: 'GET-Anfragen mit erwarteten JSON-Antworten, automatischem Parsing und optionaler Schema-Validierung', parameters: ['url (+ headers/options)'] },
      { toolName: 'http_post_json', description: 'POST-Anfragen mit JSON-Payload, Content-Type Auto-Handling und Auth-Token-Unterstützung; gibt Statuscode zurück', parameters: ['url, body (+ options)'] },
    ],
  },
  utilities: {
    categoryTitle: '🔧 Utility-Tools',
    tools: [
      { toolName: 'search_memory', description: 'Keyword-Suche über gespeicherte Memories, gibt Relevanz-Konfidenz-Scores pro Treffer zurück', parameters: ['query (+ options)'] },
      { toolName: 'get_system_info', description: 'OS-Typ/Version, CPU-Modell/-Anzahl, Gesamt-/verfügbarer Speicher und Disk-Nutzungsstatistiken', parameters: [] },
      { toolName: 'system_monitor', description: 'Detaillierte CPU-, Speicher-, Disk- und Netzwerkinterface-Metriken für Performance-Tracking', parameters: [] },
      { toolName: 'process_list', description: 'Laufende Prozesse mit CPU%, Speicherverbrauch und PID-Hierarchie; case-insensitive Namensfilterung', parameters: ['name_filter (optional)'] },
      { toolName: 'env_inspect', description: 'Umgebungsvariablen auflisten mit optionalem Präfix-Filter für gezielte Inspektion', parameters: ['prefix (optional)'] },
      { toolName: 'detect_os_environment', description: 'OS-Fähigkeiten berichten, um korrekte Kommando-Syntax vor Shell/Pfad-Operationen sicherzustellen', parameters: [] },
      { toolName: 'read_clipboard', description: 'System-Zwischenablage plattformübergreifend lesen (GetClipboardData/pbpaste/xclip)', parameters: [] },
      { toolName: 'write_clipboard', description: 'Text in die System-Zwischenablage schreiben mit automatischer Plattform-Erkennung', parameters: ['text'] },
      { toolName: 'send_notification', description: 'OS-native Toast-Benachrichtigung mit Titel, Nachrichtentext und optionalem Custom-Icon senden', parameters: ['title, message (+ options)'] },
      { toolName: 'findLMStudioHome', description: 'LM Studio Installationsverzeichnis plattformübergreifend lokalisieren, gibt den Modell-Speicherpfad zurück', parameters: [] },
      { toolName: 'get_enabled_tools', description: 'Derzeit aktivierte Tools auflisten, prüft aktive Kategorien und God-Mode-Bypass-Status', parameters: [] },
      { toolName: 'hash_file', description: 'MD5/SHA1/SHA256 Checksummen für Datei-Integritätsverifikation erzeugen', parameters: ['file_path, algorithm (optional)'] },
      { toolName: 'token_count', description: 'LLM-Token-Zählung via tiktoken Encodings (cl100k_base etc.) für Kontext-Schätzung', parameters: ['text or content (+ options)'] },
      { toolName: 'convert_format', description: 'JSON↔CSV Konvertierung, base64 Encode/Decode und Komprimieren/Dekomprimieren mit konfigurierbaren Stufen', parameters: [] },
      { toolName: 'secret_scan', description: 'Dateien auf geleakte API-Keys, Passwörter und Tokens scannen; unterstützt Custom-Ausschluss-Pattern — Secrets finden vor dem Shipment', parameters: ['paths (+ options)'] },
      { toolName: 'port_check', description: 'TCP-Port-Verfügbarkeit auf localhost oder einem Custom-Host für Service-Verifikation prüfen', parameters: ['port, host (optional)'] },
      { toolName: 'package_manage', description: 'npm/pip/cargo Pakete installieren/deinstallieren/aktualisieren/auditen (⚠️ erfordert den packageManage Config-Toggle)', parameters: [] },
    ],
  },
  imageProcessing: {
    categoryTitle: '🖼️ Bildverarbeitung- & Analyse-Tools',
    tools: [
      { toolName: 'image_to_text', description: 'OCR-Textextraktion via Tesseract.js mit Konfidenz-Scores und Spracherkennung (50 MB max)', parameters: ['imagePath, language (optional)'] },
      { toolName: 'describe_image', description: 'Bild-Metadaten erhalten: Dimensionen, Format, Größe und Zeitstempel für PNG/JPG/BMP/GIF/WebP/TIFF', parameters: ['imagePath'] },
      { toolName: 'screenshot_desktop', description: 'Desktop-Screenshot plattformübergreifend aufnehmen (GDI+/screencapture/ImageMagick)', parameters: ['outputPath/format/quality (optional)'] },
      { toolName: 'compare_images', description: 'Byte- und Dimensionsvergleich zweier Bilder; exakter Match-Status für identische Encodings', parameters: ['image1Path, image2Path'] },
      { toolName: 'analyze_image', description: 'Bild an geladenes vision-fähiges LM Studio Modell mit optionalem Prompt senden; gibt textuelle Analyse + Metadaten zurück (⚠️ erfordert ein Vision-Modell)', parameters: ['imagePath, prompt (optional)'] },
    ],
  },
  backupRestore: {
    categoryTitle: '💾 Backup- & Restore-Tools',
    tools: [
      { toolName: 'create_backup', description: 'Komprimiertes ZIP-Snapshot des gesamten Working Directory in .ai_toolbox_backups/ erstellen (erfordert confirm=true)', parameters: ['confirm, destination/targetDirectory (optional)'] },
      { toolName: 'list_backups', description: 'Backups nach Datum oder Größe sortiert auflisten mit Dateiname, Pfad, Größe und Erstellungszeitstempel', parameters: ['sortBy/limit (optional)'] },
      { toolName: 'restore_backup', description: 'Working Directory aus einem Backup-Archiv wiederherstellen (⚠️ überschreibt alle Dateien; erfordert confirm=true)', parameters: ['backupFile, confirm'] },
      { toolName: 'delete_backup', description: 'Eine spezifische Backup-Datei entfernen (⚠️ irreversibel; prüft Existenz zuerst)', parameters: ['backupFile, confirm'] },
      { toolName: 'cleanup_backups', description: '.bak Edit-Backups auflisten und optional löschen — Dry-Run standardmäßig, Bestätigung zum Löschen erforderlich', parameters: ['confirm (optional)'] },
    ],
  },
  dataVisualization: {
    categoryTitle: '📈 Datenvisualisierung-Tools',
    tools: [
      { toolName: 'generate_chart', description: 'Bar/Line/Pie/Doughnut/Scatter/Radar Charts aus Rohdaten als PNG-Bild rendern; HTML-Fallback wenn der Renderer nicht verfügbar ist', parameters: ['type, data (+ title/colors/output_path optional)'] },
    ],
  },
  general: {
    pluginName: 'AI Toolbox Plugin',
    enabledTools: 'Aktivierte Tools:',
    disabledTools: 'Deaktivierte Tools:',
    errorPrefix: 'Fehler:',
    successPrefix: 'Erfolg:',
  },
};