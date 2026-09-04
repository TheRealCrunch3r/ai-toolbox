/**
 * Traditional Chinese (zh-TW) translations for AI Toolbox plugin
 */

import type { FullTranslationSet } from './types';

export const zhTWTranslations: FullTranslationSet = {
  fileSystem: {
    categoryTitle: '📁 檔案系統工具',
    tools: [
      { toolName: 'list_directory', description: '列出工作區中的檔案與資料夾', parameters: ['path（選填）'] },
      { toolName: 'read_file', description: '讀取文字檔案內容', parameters: ['file_name'] },
      { toolName: 'save_file', description: '建立或覆寫檔案', parameters: ['file_name, content'] },
      { toolName: 'replace_text_in_file', description: '在檔案中替換精確比對的字串（複雜插入／替換務必使用此工具——切勿改用 line_operations）', parameters: ['file_name, old_string, new_string'] },
      { toolName: 'insert_at_line', description: '⚠️ 僅限單次插入——多步驟結構性修改請改用 save_file/replace_text_in_file。於指定行號處插入文字。', parameters: ['file_name, line_number, content'] },
      { toolName: 'append_file', description: '向檔案末尾追加內容', parameters: ['file_name, content'] },
      { toolName: 'delete_lines_in_file', description: '刪除檔案中的指定列', parameters: ['file_name, start_line, end_line（選填）'] },
      { toolName: 'make_directory', description: '建立新資料夾', parameters: ['directory_name'] },
      { toolName: 'move_file', description: '移動或重新命名檔案／資料夾', parameters: ['source, destination'] },
      { toolName: 'copy_file', description: '將檔案複製到新位置', parameters: ['source, destination'] },
      { toolName: 'delete_path', description: '刪除檔案或資料夾（破壞性操作）', parameters: ['path'] },
      { toolName: 'delete_files_by_pattern', description: '依正規表示式模式刪除檔案', parameters: ['pattern（正規表示式）'] },
      { toolName: 'find_files', description: '遞迴搜尋符合名稱模式的檔案', parameters: ['pattern, max_depth（選填）'] },
      { toolName: 'fuzzy_find_local_files', description: '依名稱／路徑相似度模糊搜尋檔案', parameters: ['query, path（選填）, max_results（選填）'] },
      { toolName: 'get_file_metadata', description: '取得檔案大小、日期與型別資訊', parameters: ['path'] },
      { toolName: 'change_directory', description: '變更工作目錄', parameters: ['directory'] },
      { toolName: 'read_document', description: '讀取 PDF 或 DOCX 文件', parameters: ['file_path'] },
      { toolName: 'analyze_project', description: '執行專案層級 lint 分析', parameters: [] },
    ],
  },
  webSearch: {
    categoryTitle: '🌐 網路與研究工具',
    tools: [
      { toolName: 'web_search', description: '透過 DuckDuckGo/Google/Bing 回退鏈搜尋', parameters: ['query, providers（選填）'] },
      { toolName: 'wikipedia_search', description: '在維基百科中搜尋頁面摘要', parameters: ['query, lang（選填）'] },
      { toolName: 'fetch_web_content', description: '擷取網頁的純文字內容', parameters: ['url'] },
      { toolName: 'rag_web_content', description: '基於 RAG 語意式的網頁內容擷取', parameters: ['url, query'] },
      { toolName: 'browser_session_open', description: '開啟持久化瀏覽器工作階段', parameters: ['url, wait_for_selector（選填）'] },
      { toolName: 'browser_session_control', description: '控制瀏覽器操作（點擊、輸入等）', parameters: ['actions 陣列, read_page 旗標'] },
    ],
  },
  browserAutomation: {
    categoryTitle: '🌐 瀏覽器自動化工具',
    tools: [
      { toolName: 'browser_open_page', description: '使用 Puppeteer 一次式渲染頁面', parameters: ['url, screenshot_path（選填）, actions（選填）'] },
    ],
  },
  gitOperations: {
    categoryTitle: '🐙 Git 與 GitHub 工具',
    tools: [
      { toolName: 'git_status', description: '檢視儲存庫中已修改的檔案', parameters: [] },
      { toolName: 'git_diff', description: '詳細檢視變更內容', parameters: ['file_path（選填）, cached（選填）'] },
      { toolName: 'git_commit', description: '提交暫存區的變更', parameters: ['message'] },
      { toolName: 'git_log', description: '檢視提交紀錄', parameters: ['max_count（選填）'] },
      { toolName: 'git_add', description: '將指定檔案或全部變更加入暫存區', parameters: ['paths（選填）'] },
      { toolName: 'git_checkout', description: '切換到既有分支或建立新分支', parameters: ['branch_name, create_new（選填）'] },
      { toolName: 'gh_auth', description: '檢查 GitHub 驗證狀態', parameters: [] },
      { toolName: 'gh_create_issue', description: '建立新的 GitHub issue', parameters: ['title, body（選填）, labels（選填）'] },
      { toolName: 'gh_list_issues', description: '列出儲存庫中的 issues', parameters: ['state（選填）, labels（選填）, limit（選填）'] },
      { toolName: 'gh_view_comments', description: '檢視 issue 或 PR 的留言', parameters: ['number, type（選填）'] },
      { toolName: 'gh_create_pr', description: '建立 Pull Request', parameters: ['title, body, head_branch, base_branch（選填）'] },
      { toolName: 'gh_list_prs', description: '列出 Pull Requests', parameters: ['state（選填）, limit（選填）'] },
      { toolName: 'gh_view_pr_diff', description: '取得 PR 的 diff/patch', parameters: ['number'] },
      { toolName: 'gh_push', description: '將提交推送到遠端儲存庫', parameters: ['branch（選填）'] },
    ],
  },
  databaseQueries: {
    categoryTitle: '💾 資料庫查詢工具',
    tools: [
      { toolName: 'query_database', description: '執行唯讀 SQLite 查詢', parameters: ['query（SQL 字串）'] },
    ],
  },
  documentParsing: {
    categoryTitle: '📄 文件解析工具',
    tools: [
      { toolName: 'read_document', description: '讀取 PDF 或 DOCX 文件', parameters: ['file_path'] },
    ],
  },
  backgroundCommands: {
    categoryTitle: '⏱️ 背景命令工具',
    tools: [
      { toolName: 'run_background_command', description: '在背景啟動長時間運行的行程', parameters: ['command, timeout_hours（必填）, name（必填）'] },
      { toolName: 'check_background_command', description: '檢視執行中命令的狀態與輸出', parameters: ['id'] },
      { toolName: 'cancel_background_command', description: '終止正在執行的背景命令', parameters: ['id'] },
    ],
  },
  general: {
    pluginName: 'AI Toolbox 外掛',
    enabledTools: '已啟用的工具：',
    disabledTools: '已禁用的工具：',
    errorPrefix: '錯誤：',
    successPrefix: '成功：',
  },
};
