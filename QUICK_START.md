# 🚀 Quick Start Guide - Tool Priority System

## What Changed?

Your AI Toolbox plugin now uses **smart priority-based filtering** instead of arbitrary alphabetical truncation when the tool count exceeds the limit.

## How to Use

### 1. Set Your Tool Limit
In LM Studio plugin settings:
- **🛡️ Max Tools in Grammar Schema**: Set to `25-60` (recommended)
  - `25` = Only critical + high priority tools
  - `50` = Most tools, filters out background utilities
  - `60+` = Almost all tools

### 2. (Optional) Customize Priorities
If you want specific tools to always be kept, add them to **🎯 Tool Priority Overrides**:

```json
{
  "your_important_tool": "critical"
}
```

### 3. Monitor Filtering
When tools are filtered, check the LM Studio console for a report like:
```
📊 Tool Filtering Report (limit: 50)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total tools: 62
Retained: 50
Filtered: 12

🔻 BACKGROUND tier filtered:
  • cleanup_backups (Cleanup backups)
  • delete_lines (Delete lines)
```

## Recommended Settings

### General Development
```
maxToolsInSchema: 50
toolPriorityOverrides: {}
```

### Web Development
```
maxToolsInSchema: 45
toolPriorityOverrides: {
  "browser_open_page": "critical",
  "preview_html": "high"
}
```

### Data Science
```
maxToolsInSchema: 40
toolPriorityOverrides: {
  "run_python": "critical",
  "query_database": "high",
  "generate_chart": "high"
}
```

### DevOps
```
maxToolsInSchema: 45
toolPriorityOverrides: {
  "run_in_terminal": "critical",
  "execute_command": "high",
  "git_commit": "high"
}
```

## Priority Tier Reference

| Tier | Tools | Examples |
|------|-------|----------|
| **Critical** | 22 | `read_file`, `save_file`, `grep_files`, `find_files` |
| **High** | 27 | `web_search`, `run_javascript`, `run_python`, `git_*` |
| **Standard** | 26 | `browser_*`, `image_*`, `http_*`, `rag_*` |
| **Optional** | 13 | `context_*`, `explore_tools` |
| **Background** | 8 | `create_backup`, `cleanup_backups`, `generate_chart` |

## Troubleshooting

**Problem**: Important tool is being filtered
**Solution**: Add it to `toolPriorityOverrides` with a higher priority

**Problem**: Too many tools filtered
**Solution**: Increase `maxToolsInSchema` (e.g., from 25 to 50)

**Problem**: Want to disable filtering
**Solution**: Set `maxToolsInSchema` to >= total enabled tools

## Next Steps

1. ✅ **Rebuild the plugin**: `npm run build`
2. ✅ **Restart LM Studio**
3. ✅ **Test**: Enable multiple tool categories, check console for filtering reports
4. ✅ **Customize**: Adjust priorities based on your workflow

## Documentation

- **Full documentation**: `TOOL_PRIORITY_SYSTEM.md`
- **Implementation details**: `IMPLEMENTATION_SUMMARY.md`
- **Test script**: `node test_priority_system.mjs`
