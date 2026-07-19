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
      { toolName: 'insert_at_line', description: 'Text an spezifischer Zeile einfügen', parameters: ['file_name, line_number, content'] },
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
    categoryTitle: '⏱️ Background Command Tools',
    tools: [
      { toolName: 'run_background_command', description: 'Lang-running Prozess im Background starten', parameters: ['command, timeout_hours (mandatory), name (mandatory)'] },
      { toolName: 'check_background_command', description: 'Status und Output von running Command prüfen', parameters: ['id'] },
      { toolName: 'cancel_background_command', description: 'Running Background Command killen', parameters: ['id'] },
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