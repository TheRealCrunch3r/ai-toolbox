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
      { toolName: 'read_file_chunked', description: '以結構化分塊讀取檔案，繞過字元限制；對超大檔案傳回起訖索引以實現串流控制', parameters: ['file_name, chunk_size/max_chunks（選填）'] },
      { toolName: 'grep_files', description: '跨專案的正則或 AST 模式搜尋——ReDoS 安全並設 15 秒截止上限；逾時時傳回部分結果 + 顯式 aborted 旗標；預設排除 node_modules', parameters: ['pattern (+ include/exclude/limit options)'] },
      { toolName: 'find_replace_all', description: '跨多檔案的正則搜尋與替換，支援 dry-run 預覽、.bak 備份與副檔名過濾——內建深度上限防掛起', parameters: ['pattern, replacement（選填）, directory/dry_run/confirm (+ filters)'] },
      { toolName: 'pattern_scan', description: '遞迴內容搜尋，以 {file, line, content} 傳回相符列；不安全正則自動降級為字面值；每檔案 256 KB / 1 萬列上限並記錄略過項；ripgrep 第一階段預過濾（B\'）', parameters: ['pattern (+ root/mode/caps options)'] },
      { toolName: 'directory_tree', description: '以樹狀格式視覺化目錄結構，支援最大深度、選填檔案大小顯示及自動排除大型目錄', parameters: ['path/max_depth/show_size（選填）'] },
      { toolName: 'file_diff', description: '比較兩個檔案並傳回帶 +/− 標記與列號的統一 diff', parameters: ['file_a, file_b'] },
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
      { toolName: 'browser_session_close', description: '優雅關閉持久化瀏覽器工作階段，防止遺留的 Chromium 行程', parameters: [] },
      { toolName: 'preview_html', description: '在系統預設瀏覽器中渲染原始 HTML 或現有 .html 檔案', parameters: ['source (HTML string or path)'] },
      { toolName: 'open_file', description: '用系統預設應用程式開啟檔案/URL（Windows start / macOS open / Linux xdg-open）', parameters: ['target'] },
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
      { toolName: 'git_stash', description: '管理未提交的變更：儲存、套用、捨棄並列出 stash（原生 Git CLI——isomorphic-git 不支援 stash）', parameters: ['operation (+ options)'] },
      { toolName: 'git_blame', description: '逐列提交紀錄，顯示作者、時間戳記與雜湊；路徑驗證可防止遍歷攻擊', parameters: ['file_path (+ options)'] },
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
  codeRefactoring: {
    categoryTitle: '🧬 程式碼重構工具',
    tools: [
      { toolName: 'refactor_code', description: '基於 AST 的重構（Babel）：重新命名識別項、跨檔案移動函式、提取函式、清理無用匯入——語法安全，帶 .bak 備份且失敗時自動回滾；支援 dry-run diff', parameters: ['file_path, operation, per-operation fields, dry_run（選填）'] },
    ],
  },
  execution: {
    categoryTitle: '⚡ 執行工具',
    tools: [
      { toolName: 'run_javascript', description: '在隔離的 Node VM 上下文中執行 JavaScript；eval/require/child_process 被阻擋，預設逾時 5 秒', parameters: ['javascript, timeout_seconds（選填）'] },
      { toolName: 'run_python', description: '在受控沙箱中執行 Python；os/subprocess/sys 匯入被阻擋，預設逾時 10 秒', parameters: ['python, timeout_seconds（選填）'] },
      { toolName: 'execute_command', description: '⚠️ 以多層淨化與管線限制執行 shell 指令——預設停用', parameters: ['command (+ options)'] },
      { toolName: 'run_in_terminal', description: '啟動作業系統原生終端機視窗（cmd/PowerShell/zsh/bash），支援環境變數與可見性選項', parameters: [] },
      { toolName: 'run_tests', description: '從 package.json 自動偵測測試框架（Jest/Mocha/Vitest）並執行專案測試套件，傳回結果', parameters: [] },
    ],
  },
  textProcessing: {
    categoryTitle: '📝 文字處理工具',
    tools: [
      { toolName: 'text_transform', description: '基於正則的文字替換，支援擷取群組（$1/$2）、列範圍及全域／不分大小寫模式——比 shell sed 更安全', parameters: ['file_name, pattern, replacement（選填）, flags（選填）'] },
      { toolName: 'line_operations', description: '類 awk 地插入／刪除／重新排列列，無 shell 依賴；三層護欄（模式錨定、列指紋、邊界驗證）+ 寫入後 MD5 完整性檢查', parameters: ['file_name, operation, target_line or pattern anchors (+ options)'] },
      { toolName: 'text_extract', description: '從分隔文字（CSV/TSV/自訂）中依零基欄位索引擷取結構化欄位', parameters: ['file_name, fields, delimiter（選填）, output_format（選填）'] },
      { toolName: 'markdown_table_gen', description: '從物件陣列產生有效的 Markdown 表格，支援標頭、對齊與截斷', parameters: ['data, headers（選填）'] },
    ],
  },
  taskPlanning: {
    categoryTitle: '📋 任務規劃工具',
    tools: [
      { toolName: 'create_plan', description: '建立多步驟執行計畫（1–30 步）；取代任何活動中的計畫並傳回 planId + stepCount', parameters: ['goal, steps'] },
      { toolName: 'get_plan', description: '傳回活動中的計畫，含各步驟狀態、完成百分比與已用時間；無計畫時傳回 null', parameters: [] },
      { toolName: 'update_plan_step', description: '透過狀態機更新單一計畫步驟（pending→in_progress→done；any→blocked；blocked→pending）——封鎖時必須提供 note', parameters: ['planId, index, status, note (required if blocked)'] },
    ],
  },
  contextManagement: {
    categoryTitle: '🧠 上下文與記憶工具',
    tools: [
      { toolName: 'auto_summarize_context', description: '分析近期工作階段活動中的模式、高頻工具使用及值得記住的決定；以全域範圍儲存到持久化記憶', parameters: ['session_events (+ config_changes)'] },
      { toolName: 'get_context_memory', description: '依類型（decision/pattern/configuration/file_change/error/summary）擷取過去上下文項目；近因×頻率評分優先呈現最近且常被存取的項目', parameters: ['type（選填）, limit（選填）'] },
      { toolName: 'search_context', description: '對上下文項目的標題、內文與標籤進行模糊文字搜尋；搜尋前清理已過期的工作階段項目（24 小時 TTL）', parameters: ['query, max_results（選填）'] },
      { toolName: 'context_summary', description: '持久化記憶的統計概觀：總項目數、依類型細分及近期活動計數', parameters: [] },
      { toolName: 'delete_context_entry', description: '依唯一 ID 移除特定上下文項目，不清除其餘歷史', parameters: ['entry_id'] },
      { toolName: 'clear_context_memory', description: '清除所有自動儲存的上下文項目（⚠️ 不可逆；需 confirm=true）', parameters: ['confirm'] },
      { toolName: 'track_important_event', description: '手動記錄事件、決定或里程碑，可加自訂標籤以便分類擷取', parameters: ['title, content, tags（選填）'] },
      { toolName: 'save_session_summary', description: '儲存結構化工作階段摘要（成果、待辦任務、決定），壓縮儲存以繞過 10k SDK 限制', parameters: ['task_description (+ optional sections)'] },
      { toolName: 'get_session_summary', description: '擷取最近儲存的工作階段摘要，對舊資料提供向後相容的回退', parameters: [] },
      { toolName: 'save_memory', description: '將事實持久化到 .ai_toolbox_memory.msgpack 以實現跨工作階段連續性（RAM + 原子磁碟複本）', parameters: ['fact'] },
      { toolName: 'get_memory', description: '擷取所有已儲存的記憶項目；先查本地專案檔案，再查持久化儲存庫', parameters: [] },
      { toolName: 'delete_memory', description: '依唯一金鑰移除特定記憶項目（儲存時傳回該金鑰）', parameters: ['entry_id'] },
      { toolName: 'list_sessions', description: '分頁瀏覽已儲存的工作階段摘要，支援限制控制', parameters: ['limit（選填）, offset（選填）'] },
      { toolName: 'search_sessions', description: '對已儲存的工作階段摘要進行關鍵字搜尋，最新優先', parameters: ['query, max_results（選填）'] },
      { toolName: 'clear_session_index', description: '僅移除所有輕量級工作階段索引項目——摘要不受影響（需 confirm=true）', parameters: ['confirm'] },
      { toolName: 'register_project', description: '依名稱 + 工作目錄路徑在跨專案登錄表中註冊或更新專案（+ 選填來源目錄）', parameters: ['project_name, working_dir_path, source_dirs（選填）'] },
      { toolName: 'get_project_info', description: '依工作目錄路徑擷取某個已註冊專案的詳細資訊', parameters: ['working_dir_path'] },
      { toolName: 'list_projects', description: '列出所有已註冊專案，含路徑、最後存取時間與工作階段計數', parameters: [] },
      { toolName: 'search_projects', description: '依名稱或路徑子字串搜尋已註冊專案；延遲登錄表同步會自動註冊在工作階段記憶中發現的專案', parameters: ['query, max_results（選填）'] },
      { toolName: 'switch_context', description: '將上下文儲存切換到另一專案的工作目錄以回憶其記憶／工作階段（遵循 Step 0.7 橫幅的 confirm-first 原則）', parameters: ['target_working_dir_path'] },
    ],
  },
  vectorRag: {
    categoryTitle: '🔍 向量 RAG 工具',
    tools: [
      { toolName: 'rag_index_files', description: '將目錄中的 TS/JS/MD/JSON/YAML/文字檔案索引用於語意搜尋，支援批次處理', parameters: ['directoryPath, filePattern（選填）, batchSize（選填）'] },
      { toolName: 'rag_index_pdf', description: '以頁邊界分塊（每塊約 300 詞）索引 PDF，附 page_number 來源資訊——有界讀取防 OOM', parameters: ['filePath, chunkSize/overlap（選填）'] },
      { toolName: 'rag_index_docx', description: '透過 mammoth 擷取 DOCX 文字為以詞邊界的分塊，走與 PDF 相同的嵌入流水線', parameters: ['filePath, chunkSize/overlap（選填）'] },
      { toolName: 'rag_index_xlsx', description: '將試算表的所有工作表索引為列陣列，可加工作表名稱前綴以便追溯', parameters: ['filePath, chunkSize（選填）, includeSheetNames（選填）'] },
      { toolName: 'rag_query_vector', description: '對向量索引進行餘弦相似度查詢，傳回 top-k 分塊及其內容與得分', parameters: ['query, topK（選填）'] },
      { toolName: 'rag_clear_index', description: '清空整個向量索引（需 confirm=true）；完整重新索引前使用', parameters: ['confirm'] },
      { toolName: 'rag_web_content', description: '擷取 URL 並僅傳回與查詢相關的文本分塊——有界、去重的擷取', parameters: ['url, query'] },
    ],
  },
  uiGeneration: {
    categoryTitle: '🎨 UI 產生工具',
    tools: [
      { toolName: 'generate_ui_component', description: '依使用者描述建立互動式 HTML/CSS/JS 元件（按鈕、表單、表格）', parameters: [] },
      { toolName: 'render_and_preview_ui', description: '在瀏覽器中渲染元件並提供即時預覽，便於快速原型開發', parameters: [] },
      { toolName: 'extract_ui_data', description: '透過 CSS 選擇器／XPath 從頁面擷取結構化資料，以表格形式傳回聊天', parameters: [] },
    ],
  },
  httpClient: {
    categoryTitle: '📡 HTTP 用戶端工具',
    tools: [
      { toolName: 'http_request', description: '通用 GET/POST/PUT/DELETE/PATCH 用戶端，帶重試邏輯、逾時設定與 multipart 上傳——SSRF 防護（⚠️ 預設停用）', parameters: ['url, method (+ options)'] },
      { toolName: 'http_get_json', description: '預期 JSON 回應的 GET 請求，自動解析並支援選填的 schema 驗證', parameters: ['url (+ headers/options)'] },
      { toolName: 'http_post_json', description: '帶 JSON 負載的 POST 請求，自動處理 content-type 並支援認證權杖；傳回狀態碼', parameters: ['url, body (+ options)'] },
    ],
  },
  utilities: {
    categoryTitle: '🔧 實用工具',
    tools: [
      { toolName: 'search_memory', description: '對已儲存記憶進行關鍵字搜尋，依比中項目傳回相關度置信分數', parameters: ['query (+ options)'] },
      { toolName: 'get_system_info', description: '作業系統類型／版本、CPU 型號／數量、總記憶體／可用記憶體及磁碟使用統計', parameters: [] },
      { toolName: 'system_monitor', description: '詳細的 CPU、記憶體、磁碟與網路介面指標，用於效能追蹤', parameters: [] },
      { toolName: 'process_list', description: '執行中的行程及其 CPU%、記憶體佔用與 PID 層級；名稱過濾不分大小寫', parameters: ['name_filter（選填）'] },
      { toolName: 'env_inspect', description: '列出環境變數，支援前綴過濾以做定向檢查', parameters: ['prefix（選填）'] },
      { toolName: 'detect_os_environment', description: '報告作業系統能力，確保 shell／路徑操作前的指令語法正確', parameters: [] },
      { toolName: 'read_clipboard', description: '跨平台讀取系統剪貼簿（GetClipboardData/pbpaste/xclip）', parameters: [] },
      { toolName: 'write_clipboard', description: '將文字寫入系統剪貼簿，自動偵測平台', parameters: ['text'] },
      { toolName: 'send_notification', description: '傳送作業系統原生 toast 通知，含標題、訊息本文及選填自訂圖示', parameters: ['title, message (+ options)'] },
      { toolName: 'findLMStudioHome', description: '跨平台定位 LM Studio 安裝目錄，傳回模型儲存路徑', parameters: [] },
      { toolName: 'get_enabled_tools', description: '列出目前啟用的工具，驗證活動類別與 God Mode 繞過狀態', parameters: [] },
      { toolName: 'hash_file', description: '產生 MD5/SHA1/SHA256 校驗和以驗證檔案完整性', parameters: ['file_path, algorithm（選填）'] },
      { toolName: 'token_count', description: '透過 tiktoken 編碼（cl100k_base 等）進行 LLM token 計數，用於上下文估算', parameters: ['text or content (+ options)'] },
      { toolName: 'convert_format', description: 'JSON↔CSV 轉換、base64 編解碼及可設定等級的壓縮／解壓縮', parameters: [] },
      { toolName: 'secret_scan', description: '掃描檔案中洩漏的 API 金鑰、密碼與權杖；支援自訂排除模式——發布前發現機密', parameters: ['paths (+ options)'] },
      { toolName: 'port_check', description: '檢查 localhost 或自訂主機上的 TCP 埠可用性，用於服務驗證', parameters: ['port, host（選填）'] },
      { toolName: 'package_manage', description: '安裝／卸載／更新／稽核 npm/pip/cargo 套件（⚠️ 需開啟 packageManage 設定開關）', parameters: [] },
    ],
  },
  imageProcessing: {
    categoryTitle: '🖼️ 圖像處理與分析工具',
    tools: [
      { toolName: 'image_to_text', description: '透過 Tesseract.js 進行 OCR 文字擷取，帶置信度分數與語言偵測（最大 50 MB）', parameters: ['imagePath, language（選填）'] },
      { toolName: 'describe_image', description: '取得圖像中繼資料：PNG/JPG/BMP/GIF/WebP/TIFF 的尺寸、格式、大小與時間戳記', parameters: ['imagePath'] },
      { toolName: 'screenshot_desktop', description: '跨平台擷取桌面截圖（GDI+/screencapture/ImageMagick）', parameters: ['outputPath/format/quality（選填）'] },
      { toolName: 'compare_images', description: '對兩張圖像進行位元組級與尺寸比較；相同編碼時給出精確比對狀態', parameters: ['image1Path, image2Path'] },
      { toolName: 'analyze_image', description: '將圖像傳送至已載入的具視覺能力 LM Studio 模型，可附提示詞；傳回文字分析 + 中繼資料（⚠️ 需要視覺模型）', parameters: ['imagePath, prompt（選填）'] },
    ],
  },
  backupRestore: {
    categoryTitle: '💾 備份與還原工具',
    tools: [
      { toolName: 'create_backup', description: '將整個工作目錄建立為壓縮 ZIP 快照，存至 .ai_toolbox_backups/（需 confirm=true）', parameters: ['confirm, destination/targetDirectory（選填）'] },
      { toolName: 'list_backups', description: '依日期或大小排序列出備份，含檔案名稱、路徑、大小與建立時間戳記', parameters: ['sortBy/limit（選填）'] },
      { toolName: 'restore_backup', description: '從備份存檔還原工作目錄（⚠️ 覆寫所有檔案；需 confirm=true）', parameters: ['backupFile, confirm'] },
      { toolName: 'delete_backup', description: '移除某個特定備份檔案（⚠️ 不可逆；先驗證存在性）', parameters: ['backupFile, confirm'] },
      { toolName: 'cleanup_backups', description: '列出並選填刪除 .bak 編輯備份——預設 dry-run，刪除需確認', parameters: ['confirm（選填）'] },
    ],
  },
  dataVisualization: {
    categoryTitle: '📈 資料視覺化工具',
    tools: [
      { toolName: 'generate_chart', description: '從原始資料將 bar/line/pie/doughnut/scatter/radar 圖表渲染為 PNG 影像；渲染器不可用時回退到 HTML', parameters: ['type, data (+ title/colors/output_path optional)'] },
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
