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
  general: {
    pluginName: 'AI Toolbox 插件',
    enabledTools: '已启用的工具：',
    disabledTools: '禁用的工具：',
    errorPrefix: '错误：',
    successPrefix: '成功：',
  },
};
