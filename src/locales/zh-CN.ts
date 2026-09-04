/**
 * Simplified Chinese (zh-CN) translations for AI Toolbox plugin
 */

import type { FullTranslationSet } from './types';

export const zhCNTranslations: FullTranslationSet = {
  fileSystem: {
    categoryTitle: '📁 文件系统工具',
    tools: [
      { toolName: 'list_directory', description: '列出工作区中的文件和文件夹', parameters: ['path（可选）'] },
      { toolName: 'read_file', description: '读取文本文件内容', parameters: ['file_name'] },
      { toolName: 'save_file', description: '创建或覆盖文件', parameters: ['file_name, content'] },
      { toolName: 'replace_text_in_file', description: '在文件中替换精确匹配的字符串（复杂插入/替换务必使用此工具——切勿改用 line_operations）', parameters: ['file_name, old_string, new_string'] },
      { toolName: 'insert_at_line', description: '⚠️ 仅限单次插入——多步结构性修改请改用 save_file/replace_text_in_file。在指定行号处插入文本。', parameters: ['file_name, line_number, content'] },
      { toolName: 'append_file', description: '向文件末尾追加内容', parameters: ['file_name, content'] },
      { toolName: 'delete_lines_in_file', description: '删除文件中的指定行', parameters: ['file_name, start_line, end_line（可选）'] },
      { toolName: 'make_directory', description: '创建新目录', parameters: ['directory_name'] },
      { toolName: 'move_file', description: '移动或重命名文件/目录', parameters: ['source, destination'] },
      { toolName: 'copy_file', description: '将文件复制到新位置', parameters: ['source, destination'] },
      { toolName: 'delete_path', description: '删除文件或目录（破坏性操作）', parameters: ['path'] },
      { toolName: 'delete_files_by_pattern', description: '按正则表达式模式删除文件', parameters: ['pattern（正则）'] },
      { toolName: 'find_files', description: '递归查找匹配名称模式的文件', parameters: ['pattern, max_depth（可选）'] },
      { toolName: 'fuzzy_find_local_files', description: '按名称/路径相似度模糊搜索文件', parameters: ['query, path（可选）, max_results（可选）'] },
      { toolName: 'get_file_metadata', description: '获取文件大小、日期与类型信息', parameters: ['path'] },
      { toolName: 'change_directory', description: '更改工作目录', parameters: ['directory'] },
      { toolName: 'read_document', description: '读取 PDF 或 DOCX 文档', parameters: ['file_path'] },
      { toolName: 'analyze_project', description: '运行项目级 lint 分析', parameters: [] },
      { toolName: 'read_file_chunked', description: '以结构化分块读取文件，绕过字符限制；对超大文件返回起止索引以实现流式控制', parameters: ['file_name, chunk_size/max_chunks（可选）'] },
      { toolName: 'grep_files', description: '跨项目的正则或 AST 模式搜索——ReDoS 安全并设 15 秒截止上限；超时时返回部分结果 + 显式 aborted 标志；默认排除 node_modules', parameters: ['pattern (+ include/exclude/limit options)'] },
      { toolName: 'find_replace_all', description: '跨多文件的正则搜索与替换，支持 dry-run 预览、.bak 备份和扩展名过滤——内置深度上限防挂起', parameters: ['pattern, replacement（可选）, directory/dry_run/confirm (+ filters)'] },
      { toolName: 'pattern_scan', description: '递归内容搜索，以 {file, line, content} 返回匹配行；不安全正则自动降级为字面量；每文件 256 KB / 1 万行上限并记录跳过项；ripgrep 第一阶段预过滤（B\'）', parameters: ['pattern (+ root/mode/caps options)'] },
      { toolName: 'directory_tree', description: '以树形格式可视化目录结构，支持最大深度、可选文件大小显示及自动排除大型目录', parameters: ['path/max_depth/show_size（可选）'] },
      { toolName: 'file_diff', description: '比较两个文件并返回带 +/− 标记和行号的统一 diff', parameters: ['file_a, file_b'] },
    ],
  },
  webSearch: {
    categoryTitle: '🌐 网络与研究工具',
    tools: [
      { toolName: 'web_search', description: '通过 DuckDuckGo/Google/Bing 回退链搜索', parameters: ['query, providers（可选）'] },
      { toolName: 'wikipedia_search', description: '在维基百科中搜索页面摘要', parameters: ['query, lang（可选）'] },
      { toolName: 'fetch_web_content', description: '获取网页的纯文本内容', parameters: ['url'] },
      { toolName: 'rag_web_content', description: '基于 RAG 的语义化网页提取', parameters: ['url, query'] },
      { toolName: 'browser_session_open', description: '打开持久化浏览器会话', parameters: ['url, wait_for_selector（可选）'] },
      { toolName: 'browser_session_control', description: '控制浏览器操作（点击、输入等）', parameters: ['actions 数组, read_page 标志'] },
    ],
  },
  browserAutomation: {
    categoryTitle: '🌐 浏览器自动化工具',
    tools: [
      { toolName: 'browser_open_page', description: '使用 Puppeteer 一次性渲染页面', parameters: ['url, screenshot_path（可选）, actions（可选）'] },
      { toolName: 'browser_session_close', description: '优雅关闭持久化浏览器会话，防止遗留的 Chromium 进程', parameters: [] },
      { toolName: 'preview_html', description: '在系统默认浏览器中渲染原始 HTML 或现有 .html 文件', parameters: ['source (HTML string or path)'] },
      { toolName: 'open_file', description: '用系统默认应用打开文件/URL（Windows start / macOS open / Linux xdg-open）', parameters: ['target'] },
    ],
  },
  gitOperations: {
    categoryTitle: '🐙 Git 与 GitHub 工具',
    tools: [
      { toolName: 'git_status', description: '查看仓库中已修改的文件', parameters: [] },
      { toolName: 'git_diff', description: '详细查看变更内容', parameters: ['file_path（可选）, cached（可选）'] },
      { toolName: 'git_commit', description: '提交暂存区的更改', parameters: ['message'] },
      { toolName: 'git_log', description: '查看提交历史', parameters: ['max_count（可选）'] },
      { toolName: 'git_add', description: '暂存指定文件或全部更改', parameters: ['paths（可选）'] },
      { toolName: 'git_checkout', description: '切换到已有分支或创建新分支', parameters: ['branch_name, create_new（可选）'] },
      { toolName: 'gh_auth', description: '检查 GitHub 认证状态', parameters: [] },
      { toolName: 'gh_create_issue', description: '创建新的 GitHub issue', parameters: ['title, body（可选）, labels（可选）'] },
      { toolName: 'gh_list_issues', description: '列出仓库中的 issues', parameters: ['state（可选）, labels（可选）, limit（可选）'] },
      { toolName: 'gh_view_comments', description: '查看 issue 或 PR 的评论', parameters: ['number, type（可选）'] },
      { toolName: 'gh_create_pr', description: '创建 Pull Request', parameters: ['title, body, head_branch, base_branch（可选）'] },
      { toolName: 'gh_list_prs', description: '列出 Pull Requests', parameters: ['state（可选）, limit（可选）'] },
      { toolName: 'gh_view_pr_diff', description: '获取 PR 的 diff/patch', parameters: ['number'] },
      { toolName: 'gh_push', description: '将提交推送到远程仓库', parameters: ['branch（可选）'] },
      { toolName: 'git_stash', description: '管理未提交的更改：保存、弹出、丢弃并列出 stash（原生 Git CLI——isomorphic-git 不支持 stash）', parameters: ['operation (+ options)'] },
      { toolName: 'git_blame', description: '逐行提交历史，显示作者、时间戳和哈希；路径校验可防止遍历攻击', parameters: ['file_path (+ options)'] },
    ],
  },
  databaseQueries: {
    categoryTitle: '💾 数据库查询工具',
    tools: [
      { toolName: 'query_database', description: '运行只读 SQLite 查询', parameters: ['query（SQL 字符串）'] },
    ],
  },
  documentParsing: {
    categoryTitle: '📄 文档解析工具',
    tools: [
      { toolName: 'read_document', description: '读取 PDF 或 DOCX 文档', parameters: ['file_path'] },
    ],
  },
  backgroundCommands: {
    categoryTitle: '⏱️ 后台命令工具',
    tools: [
      { toolName: 'run_background_command', description: '在后台启动长时间运行的进程', parameters: ['command, timeout_hours（必填）, name（必填）'] },
      { toolName: 'check_background_command', description: '查看运行中命令的状态与输出', parameters: ['id'] },
      { toolName: 'cancel_background_command', description: '终止正在运行的后台命令', parameters: ['id'] },
    ],
  },
  codeRefactoring: {
    categoryTitle: '🧬 代码重构工具',
    tools: [
      { toolName: 'refactor_code', description: '基于 AST 的重构（Babel）：重命名标识符、跨文件移动函数、提取函数、清理无用导入——语法安全，带 .bak 备份且失败时自动回滚；支持 dry-run diff', parameters: ['file_path, operation, per-operation fields, dry_run（可选）'] },
    ],
  },
  execution: {
    categoryTitle: '⚡ 执行工具',
    tools: [
      { toolName: 'run_javascript', description: '在隔离的 Node VM 上下文中执行 JavaScript；eval/require/child_process 被阻止，默认超时 5 秒', parameters: ['javascript, timeout_seconds（可选）'] },
      { toolName: 'run_python', description: '在受控沙箱中执行 Python；os/subprocess/sys 导入被阻止，默认超时 10 秒', parameters: ['python, timeout_seconds（可选）'] },
      { toolName: 'execute_command', description: '⚠️ 以多层净化和管道限制运行 shell 命令——默认禁用', parameters: ['command (+ options)'] },
      { toolName: 'run_in_terminal', description: '启动操作系统原生终端窗口（cmd/PowerShell/zsh/bash），支持环境变量与可见性选项', parameters: [] },
      { toolName: 'run_tests', description: '从 package.json 自动检测测试框架（Jest/Mocha/Vitest）并运行项目测试套件，返回结果', parameters: [] },
    ],
  },
  textProcessing: {
    categoryTitle: '📝 文本处理工具',
    tools: [
      { toolName: 'text_transform', description: '基于正则的文本替换，支持捕获组（$1/$2）、行范围及全局/忽略大小写模式——比 shell sed 更安全', parameters: ['file_name, pattern, replacement（可选）, flags（可选）'] },
      { toolName: 'line_operations', description: '类 awk 地插入/删除/重排行，无 shell 依赖；三层护栏（模式锚定、行指纹、边界校验）+ 写入后 MD5 完整性检查', parameters: ['file_name, operation, target_line or pattern anchors (+ options)'] },
      { toolName: 'text_extract', description: '从分隔文本（CSV/TSV/自定义）中按零基字段索引提取结构化字段', parameters: ['file_name, fields, delimiter（可选）, output_format（可选）'] },
      { toolName: 'markdown_table_gen', description: '从对象数组生成有效的 Markdown 表格，支持表头、对齐与截断', parameters: ['data, headers（可选）'] },
    ],
  },
  taskPlanning: {
    categoryTitle: '📋 任务规划工具',
    tools: [
      { toolName: 'create_plan', description: '创建多步骤执行计划（1–30 步）；替换任何活动计划并返回 planId + stepCount', parameters: ['goal, steps'] },
      { toolName: 'get_plan', description: '返回活动计划，含各步骤状态、完成百分比与已用时间；无计划时返回 null', parameters: [] },
      { toolName: 'update_plan_step', description: '通过状态机更新单个计划步骤（pending→in_progress→done；any→blocked；blocked→pending）——阻塞时必须提供 note', parameters: ['planId, index, status, note (required if blocked)'] },
    ],
  },
  contextManagement: {
    categoryTitle: '🧠 上下文与记忆工具',
    tools: [
      { toolName: 'auto_summarize_context', description: '分析近期会话活动中的模式、高频工具使用及值得记住的决策；以全局范围保存到持久化记忆', parameters: ['session_events (+ config_changes)'] },
      { toolName: 'get_context_memory', description: '按类型（decision/pattern/configuration/file_change/error/summary）检索历史上下文条目；近因×频率评分优先呈现最近且常被访问的条目', parameters: ['type（可选）, limit（可选）'] },
      { toolName: 'search_context', description: '对上下文条目的标题、正文与标签进行模糊文本搜索；搜索前清理已过期的会话条目（24 小时 TTL）', parameters: ['query, max_results（可选）'] },
      { toolName: 'context_summary', description: '持久化记忆的统计概览：总条目数、按类型细分及近期活动计数', parameters: [] },
      { toolName: 'delete_context_entry', description: '按唯一 ID 删除特定上下文条目，不清除其余历史', parameters: ['entry_id'] },
      { toolName: 'clear_context_memory', description: '清除所有自动保存的上下文条目（⚠️ 不可逆；需 confirm=true）', parameters: ['confirm'] },
      { toolName: 'track_important_event', description: '手动记录事件、决策或里程碑，可加自定义标签以便分类检索', parameters: ['title, content, tags（可选）'] },
      { toolName: 'save_session_summary', description: '保存结构化会话摘要（成果、待办任务、决策），压缩存储以绕过 10k SDK 限制', parameters: ['task_description (+ optional sections)'] },
      { toolName: 'get_session_summary', description: '获取最近保存的会话摘要，对旧数据提供向后兼容的回退', parameters: [] },
      { toolName: 'save_memory', description: '将事实持久化到 .ai_toolbox_memory.msgpack 以实现跨会话连续性（RAM + 原子磁盘副本）', parameters: ['fact'] },
      { toolName: 'get_memory', description: '检索所有已保存的记忆条目；先查本地项目文件，再查持久化存储', parameters: [] },
      { toolName: 'delete_memory', description: '按唯一键删除特定记忆条目（保存时返回该键）', parameters: ['entry_id'] },
      { toolName: 'list_sessions', description: '分页浏览已保存的会话摘要，支持限制控制', parameters: ['limit（可选）, offset（可选）'] },
      { toolName: 'search_sessions', description: '对已存储的会话摘要进行关键词搜索，最新优先', parameters: ['query, max_results（可选）'] },
      { toolName: 'clear_session_index', description: '仅删除所有轻量级会话索引条目——摘要不受影响（需 confirm=true）', parameters: ['confirm'] },
      { toolName: 'register_project', description: '按名称 + 工作目录路径在跨项目注册表中注册或更新项目（+ 可选源码目录）', parameters: ['project_name, working_dir_path, source_dirs（可选）'] },
      { toolName: 'get_project_info', description: '按工作目录路径检索某个已注册项目的详情', parameters: ['working_dir_path'] },
      { toolName: 'list_projects', description: '列出所有已注册项目，含路径、最后访问时间与会话计数', parameters: [] },
      { toolName: 'search_projects', description: '按名称或路径子串搜索已注册项目；惰性注册表同步会自动注册在会话记忆中发现的项目', parameters: ['query, max_results（可选）'] },
      { toolName: 'switch_context', description: '将上下文存储切换到另一项目的工作目录以回忆其记忆/会话（遵循 Step 0.7 横幅的 confirm-first 原则）', parameters: ['target_working_dir_path'] },
    ],
  },
  vectorRag: {
    categoryTitle: '🔍 向量 RAG 工具',
    tools: [
      { toolName: 'rag_index_files', description: '将目录中的 TS/JS/MD/JSON/YAML/文本文件索引用于语义搜索，支持批处理', parameters: ['directoryPath, filePattern（可选）, batchSize（可选）'] },
      { toolName: 'rag_index_pdf', description: '按页边界分块（每块约 300 词）索引 PDF，带 page_number 来源信息——有界读取防 OOM', parameters: ['filePath, chunkSize/overlap（可选）'] },
      { toolName: 'rag_index_docx', description: '通过 mammoth 提取 DOCX 文本为按词边界的分块，走与 PDF 相同的嵌入流水线', parameters: ['filePath, chunkSize/overlap（可选）'] },
      { toolName: 'rag_index_xlsx', description: '将电子表格的所有工作表索引为行数组，可加工作表名前缀以便追溯', parameters: ['filePath, chunkSize（可选）, includeSheetNames（可选）'] },
      { toolName: 'rag_query_vector', description: '对向量索引进行余弦相似度查询，返回 top-k 分块及其内容与得分', parameters: ['query, topK（可选）'] },
      { toolName: 'rag_clear_index', description: '清空整个向量索引（需 confirm=true）；全量重建索引前使用', parameters: ['confirm'] },
      { toolName: 'rag_web_content', description: '抓取 URL 并仅返回与查询相关的文本分块——有界、去重的提取', parameters: ['url, query'] },
    ],
  },
  uiGeneration: {
    categoryTitle: '🎨 UI 生成工具',
    tools: [
      { toolName: 'generate_ui_component', description: '根据用户描述创建交互式 HTML/CSS/JS 组件（按钮、表单、表格）', parameters: [] },
      { toolName: 'render_and_preview_ui', description: '在浏览器中渲染组件并提供实时预览，便于快速原型开发', parameters: [] },
      { toolName: 'extract_ui_data', description: '通过 CSS 选择器/XPath 从页面提取结构化数据，以表格形式返回到聊天', parameters: [] },
    ],
  },
  httpClient: {
    categoryTitle: '📡 HTTP 客户端工具',
    tools: [
      { toolName: 'http_request', description: '通用 GET/POST/PUT/DELETE/PATCH 客户端，带重试逻辑、超时配置与 multipart 上传——SSRF 防护（⚠️ 默认禁用）', parameters: ['url, method (+ options)'] },
      { toolName: 'http_get_json', description: '期望 JSON 响应的 GET 请求，自动解析并支持可选的 schema 校验', parameters: ['url (+ headers/options)'] },
      { toolName: 'http_post_json', description: '带 JSON 载荷的 POST 请求，自动处理 content-type 并支持认证令牌；返回状态码', parameters: ['url, body (+ options)'] },
    ],
  },
  utilities: {
    categoryTitle: '🔧 实用工具',
    tools: [
      { toolName: 'search_memory', description: '对已存储记忆进行关键词搜索，按匹配项返回相关度置信分数', parameters: ['query (+ options)'] },
      { toolName: 'get_system_info', description: '操作系统类型/版本、CPU 型号/数量、总内存/可用内存及磁盘使用统计', parameters: [] },
      { toolName: 'system_monitor', description: '详细的 CPU、内存、磁盘与网络接口指标，用于性能跟踪', parameters: [] },
      { toolName: 'process_list', description: '运行中的进程及其 CPU%、内存占用与 PID 层级；名称过滤不区分大小写', parameters: ['name_filter（可选）'] },
      { toolName: 'env_inspect', description: '列出环境变量，支持前缀过滤以做定向检查', parameters: ['prefix（可选）'] },
      { toolName: 'detect_os_environment', description: '报告操作系统能力，确保 shell/路径操作前的命令语法正确', parameters: [] },
      { toolName: 'read_clipboard', description: '跨平台读取系统剪贴板（GetClipboardData/pbpaste/xclip）', parameters: [] },
      { toolName: 'write_clipboard', description: '将文本写入系统剪贴板，自动检测平台', parameters: ['text'] },
      { toolName: 'send_notification', description: '发送操作系统原生 toast 通知，含标题、消息正文及可选自定义图标', parameters: ['title, message (+ options)'] },
      { toolName: 'findLMStudioHome', description: '跨平台定位 LM Studio 安装目录，返回模型存储路径', parameters: [] },
      { toolName: 'get_enabled_tools', description: '列出当前启用的工具，校验活动类别与 God Mode 绕过状态', parameters: [] },
      { toolName: 'hash_file', description: '生成 MD5/SHA1/SHA256 校验和以验证文件完整性', parameters: ['file_path, algorithm（可选）'] },
      { toolName: 'token_count', description: '通过 tiktoken 编码（cl100k_base 等）进行 LLM token 计数，用于上下文估算', parameters: ['text or content (+ options)'] },
      { toolName: 'convert_format', description: 'JSON↔CSV 转换、base64 编解码及可配置级别的压缩/解压缩', parameters: [] },
      { toolName: 'secret_scan', description: '扫描文件中泄露的 API 密钥、密码与令牌；支持自定义排除模式——发布前发现秘密', parameters: ['paths (+ options)'] },
      { toolName: 'port_check', description: '检查 localhost 或自定义主机上的 TCP 端口可用性，用于服务验证', parameters: ['port, host（可选）'] },
      { toolName: 'package_manage', description: '安装/卸载/更新/审计 npm/pip/cargo 包（⚠️ 需开启 packageManage 配置开关）', parameters: [] },
    ],
  },
  imageProcessing: {
    categoryTitle: '🖼️ 图像处理与分析工具',
    tools: [
      { toolName: 'image_to_text', description: '通过 Tesseract.js 进行 OCR 文本提取，带置信度分数与语言检测（最大 50 MB）', parameters: ['imagePath, language（可选）'] },
      { toolName: 'describe_image', description: '获取图像元数据：PNG/JPG/BMP/GIF/WebP/TIFF 的尺寸、格式、大小与时间戳', parameters: ['imagePath'] },
      { toolName: 'screenshot_desktop', description: '跨平台截取桌面屏幕截图（GDI+/screencapture/ImageMagick）', parameters: ['outputPath/format/quality（可选）'] },
      { toolName: 'compare_images', description: '对两张图像进行字节级与尺寸比较；相同编码时给出精确匹配状态', parameters: ['image1Path, image2Path'] },
      { toolName: 'analyze_image', description: '将图像发送给已加载的具备视觉能力的 LM Studio 模型，可附提示词；返回文本分析 + 元数据（⚠️ 需要视觉模型）', parameters: ['imagePath, prompt（可选）'] },
    ],
  },
  backupRestore: {
    categoryTitle: '💾 备份与恢复工具',
    tools: [
      { toolName: 'create_backup', description: '将整个工作目录创建为压缩 ZIP 快照，存至 .ai_toolbox_backups/（需 confirm=true）', parameters: ['confirm, destination/targetDirectory（可选）'] },
      { toolName: 'list_backups', description: '按日期或大小排序列出备份，含文件名、路径、大小与创建时间戳', parameters: ['sortBy/limit（可选）'] },
      { toolName: 'restore_backup', description: '从备份归档恢复工作目录（⚠️ 覆盖所有文件；需 confirm=true）', parameters: ['backupFile, confirm'] },
      { toolName: 'delete_backup', description: '删除某个特定备份文件（⚠️ 不可逆；先验证存在性）', parameters: ['backupFile, confirm'] },
      { toolName: 'cleanup_backups', description: '列出并可选删除 .bak 编辑备份——默认 dry-run，删除需确认', parameters: ['confirm（可选）'] },
    ],
  },
  dataVisualization: {
    categoryTitle: '📈 数据可视化工具',
    tools: [
      { toolName: 'generate_chart', description: '从原始数据将 bar/line/pie/doughnut/scatter/radar 图表渲染为 PNG 图像；渲染器不可用时回退到 HTML', parameters: ['type, data (+ title/colors/output_path optional)'] },
    ],
  },
  general: {
    pluginName: 'AI Toolbox 插件',
    enabledTools: '已启用的工具：',
    disabledTools: '禁用的工具：',
    errorPrefix: '错误：',
    successPrefix: '成功：',
  },
};
