# 🚀 Quick Start Guide

## Overview

AI Toolbox provides **~119 tools** across **18 categories**, fully integrated and ready for use. All enabled tools are now exposed to the LLM — no more tool limiting or filtering.

## v1.6.6 Update: AST Safety Layer

**Important**: `insert_at_line` and `delete_lines` now include AST-aware safety checks to prevent code-breaking modifications. These tools will reject operations inside strings, comments, or literals with clear error messages.

## How to Use

### 1. Load the Plugin
In LM Studio's plugin settings:
- Load the AI Toolbox plugin
- Configure tool access — individual tool categories can be toggled on/off via the Settings panel

### 2. Configure Tool Access
Most tools are enabled by default. Key categories disabled by default:
- **Git & GitHub**: Requires `gitOperations` toggle
- **Browser Automation**: Requires `browserAutomation` toggle
- **Database**: Requires `database` toggle
- **HTTP Client**: Requires `httpClient` toggle
- **UI Generation**: Requires `uiGeneration` toggle

### 3. Start Using Tools
The AI can now use any of the **~119** available tools based on configuration settings.

## Recommended Settings

### General Development
```
All File System tools: Enabled
All Web Research tools: Enabled
All Context Management tools: Enabled
All Text Processing tools: Enabled
```

### Web Development
```
Enable: browserAutomation (for browser_open_page, preview_html)
Enable: httpClient (for http_request, http_get_json, http_post_json)
```

### Data Science
```
Enable: database (for query_database)
Enable: execution (for run_python, run_javascript)
```

### DevOps
```
Enable: gitOperations (for git_status, git_commit, git_log, etc.)
Enable: execution (for execute_command)
```

## Security Notes

- **God Mode**: Instantly enables all tool categories — use cautiously
- **Execution Tools**: JavaScript and Python execution enabled by default; Terminal/Shell disabled by default
- **GitHub CLI**: Requires `gh auth login` in your terminal once to enable remote operations

## Next Steps

1. ✅ **Load the plugin** in LM Studio's plugin settings
2. ✅ **Configure tool access** — toggle categories as needed
3. ✅ **Authenticate with GitHub** (if needed): Run `gh auth login` in your terminal
4. ✅ **Start a chat** and the AI can now use any of the available tools

## Documentation

- **Full documentation**: `DOCUMENTATION.md`
- **Architecture**: `ARCHITECTURE.md`
- **Tool reference**: `TOOLS_REFERENCE.md`
- **Security**: `SECURITY.md`
