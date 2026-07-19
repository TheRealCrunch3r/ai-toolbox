# 🎯 Tool Priority System

## Overview

The Tool Priority System provides intelligent filtering when the number of enabled tools exceeds the configured limit (`maxToolsInSchema`). Instead of arbitrary alphabetical truncation, tools are now sorted by priority tier, ensuring that critical workflow tools are always retained.

## Priority Tiers

Tools are categorized into 5 priority tiers (lowest number = highest priority):

| Tier | Value | Description | Examples |
|------|-------|-------------|----------|
| **Critical** | 1 | Core workflow tools that must always be present | `read_file`, `save_file`, `grep_files`, `find_files` |
| **High** | 2 | Important tools used in most workflows | `web_search`, `run_javascript`, `run_python`, `git_*` |
| **Standard** | 3 | Useful but not essential | `browser_*`, `image_*`, `http_*`, `rag_*` |
| **Optional** | 4 | Specialized tools, disabled by default or low usage | `context_*`, `explore_tools` |
| **Background** | 5 | Utility/maintenance tools, lowest priority | `create_backup`, `cleanup_backups`, `generate_chart` |

## How It Works

1. **Tool Collection**: All enabled tools are collected based on configuration toggles
2. **Priority Assignment**: Each tool is assigned a priority tier (from defaults or custom overrides)
3. **Sorting**: Tools are sorted by priority (critical first), then alphabetically within each tier
4. **Truncation**: If the total exceeds `maxToolsInSchema`, lower-priority tools are removed
5. **Reporting**: A detailed report is logged showing which tools were filtered and why

## Configuration

### Setting the Tool Limit

In LM Studio's plugin settings:
- **🛡️ Max Tools in Grammar Schema**: Set to any value between 10–109
- Default: `25` (recommended for most users)
- If you have 62+ tools enabled and set this to `60`, the system will keep the 60 highest-priority tools

### Custom Priority Overrides

You can override default priorities using the **🎯 Tool Priority Overrides** setting:

```json
{
  "browser_open_page": "high",
  "run_tests": "critical",
  "cleanup_backups": "optional"
}
```

**Valid priority values:**
- `critical`
- `high`
- `standard`
- `optional`
- `background`

### Example Use Cases

#### Scenario 1: Web Development Focus
```json
{
  "browser_open_page": "critical",
  "preview_html": "high",
  "run_tests": "high",
  "cleanup_backups": "background"
}
```

#### Scenario 2: Data Analysis Focus
```json
{
  "run_python": "critical",
  "query_database": "high",
  "generate_chart": "high",
  "browser_open_page": "background"
}
```

#### Scenario 3: DevOps Focus
```json
{
  "run_in_terminal": "critical",
  "execute_command": "high",
  "git_commit": "high",
  "cleanup_backups": "optional"
}
```

## Default Priority Assignments

See `src/tools/toolPriority.ts` for the complete list of default priority assignments.

### Critical Tier (22 tools)
All file system tools: `read_file`, `save_file`, `append_file`, `replace_text_in_file`, `insert_at_line`, `delete_lines_in_file`, `list_directory`, `find_files`, `grep_files`, `make_directory`, `move_file`, `copy_file`, `delete_path`, `delete_files_by_pattern`, `file_diff`, `directory_tree`, `get_file_metadata`, `change_directory`, `analyze_project`, `find_replace_all`, `read_file_chunked`, `fuzzy_find_local_files`

### High Tier (27 tools)
Web research: `web_search`, `fetch_web_content`, `wikipedia_search`, `rag_web_content`
Execution: `run_javascript`, `run_python`, `execute_command`, `run_in_terminal`, `run_tests`
Git/GitHub: `git_status`, `git_diff`, `git_commit`, `git_log`, `git_add`, `git_checkout`, `git_stash`, `git_blame`, `gh_create_issue`, `gh_list_issues`, `gh_view_comments`, `gh_create_pr`, `gh_list_prs`, `gh_view_pr_diff`, `gh_push`, `check_gh_auth`

### Standard Tier (26 tools)
Browser: `browser_open_page`, `browser_session_control`, `browser_session_close`, `preview_html`, `open_file`
Background commands: `run_background_command`, `check_background_command`, `cancel_background_command`
Image processing: `image_to_text`, `describe_image`, `screenshot_desktop`, `compare_images`
HTTP client: `http_request`, `http_get_json`, `http_post_json`
Vector RAG: `rag_index_files`, `rag_query_vector`, `rag_clear_index`
Database: `query_database`
Document: `read_document`
Data visualization: `generate_chart`
Refactoring: `refactor_code`, `unusedImports`
Text processing: `text_transform`, `text_extract`, `line_operations`, `markdown_table_gen`
UI generation: `generate_ui_component`, `render_and_preview_ui`, `extract_ui_data`

### Optional Tier (13 tools)
Gateway: `explore_tools`, `execute_gateway_tool`
Context management: `auto_summarize_context`, `get_context_memory`, `search_context`, `context_summary`, `delete_context_entry`, `clear_context_memory`, `track_important_event`, `save_session_summary`, `get_session_summary`, `save_memory`, `get_memory`, `delete_memory`

### Background Tier (8 tools)
Backup: `create_backup`, `list_backups`, `restore_backup`, `delete_backup`, `cleanup_backups`
Markdown preview: `markdown_preview`
Line operations: `delete_lines`

## Troubleshooting

### Tools Still Being Filtered Unexpectedly

1. **Check your `maxToolsInSchema` setting** - If it's too low, even high-priority tools may be filtered
2. **Review the console output** - When truncation occurs, a detailed report is logged showing which tools were filtered
3. **Adjust custom priorities** - Use the `toolPriorityOverrides` setting to promote important tools

### Want to Keep Specific Tools

Add them to your `toolPriorityOverrides` with a high priority:

```json
{
  "your_custom_tool": "critical"
}
```

### Disable Priority System

Set `maxToolsInSchema` to a value >= the total number of enabled tools to disable filtering entirely.

## Best Practices

1. **Start with the default priorities** - They're optimized for general development workflows
2. **Use custom overrides sparingly** - Only promote tools that are critical to your specific workflow
3. **Monitor the console** - Check for filtering reports when you enable new tool categories
4. **Keep `maxToolsInSchema` reasonable** - 25-50 is a good range for most users; higher values may impact LLM performance
5. **Test after changes** - After modifying priorities or limits, test that the AI can still access the tools it needs

## Technical Details

- **Location**: `src/tools/toolPriority.ts`
- **Integration**: `src/toolsProvider.ts` (safety limit check section)
- **Config**: `src/config.ts` (`toolPriorityOverrides` field)
- **Sorting**: Priority tier first (ascending), then alphabetically within each tier
- **Override priority**: Custom overrides take precedence over defaults

## Future Enhancements

Potential improvements for future versions:
- Per-context priority profiles (e.g., "web dev", "data science", "devops")
- Automatic priority adjustment based on usage patterns
- Visual priority editor in LM Studio UI
- Export/import priority configurations
