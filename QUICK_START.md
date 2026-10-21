# 🚀 Quick Start Guide - AI Toolbox Plugin

## What's ON by Default (v1.9.x)

Every tool category has its own toggle in the plugin settings; what you enable is exposed directly to the LLM — since v1.6.4 no priority tiers or arbitrary truncation apply, and schema minification (`toolsSchemaMinifier.ts`) handles grammar parser compatibility automatically. Default state per `DEFAULT_CONFIG` (src/config.ts), re-grounded 21.10 against v1.9.21 source:

| ON by default | OFF by default (opt-in) |
|---|---|
| fileSystem · webSearch · documentParsing · imageProcessing · vectorRAG · uiGeneration · contextManagement · textProcessing · refactorCode · utility · taskPlanning | browserAutomation · gitOperations · packageManage · databaseQueries · backgroundCommands · httpClient |

Within Execution: sandboxed `run_javascript` / `run_python` are ON; terminal, shell and the test runner start OFF. **🛡️ God Mode** bypasses every toggle at once (power users only).

## How to Use

### 1. Enable/Disable Tool Categories
In LM Studio plugin settings:
- Toggle individual tool categories on/off via the Settings panel
- Use **🛡️ God Mode** to instantly enable all tool categories

### 2. Execution Controls
Execution tools have fine-grained toggles:
- `executionJavaScript` / `executionPython`: Sandboxed code execution (enabled by default)
- `executionTerminal` / `executionShell`: Full shell commands (disabled by default for security)
- `executionTests`: Test suite runner (disabled by default)

### 3. Monitor Tool Availability
All enabled tools are registered directly with the LM Studio SDK. No filtering or priority tiers apply — what you enable is exactly what's available to the AI.

## Recommended Settings

### General Development
```
fileSystem: true, webSearch: true, documentParsing: true, imageProcessing: true
vectorRAG: true, contextManagement: true, uiGeneration: true, taskPlanning: true, textProcessing: true, refactorCode: true
executionJavaScript: true, executionPython: true
browserAutomation: false, gitOperations: false, databaseQueries: false
backgroundCommands: false, httpClient: false
```

### Web Development
```
browserAutomation: true (for browser_open_page, preview_html)
gitOperations: true (for version control workflows)
httpClient: true (for API testing)
```

### Data Science
```
executionPython: true, databaseQueries: true
vectorRAG: true (for semantic search over datasets)
imageProcessing: true (for OCR and image analysis)
```

### DevOps
```
gitOperations: true, httpClient: true
backgroundCommands: true (for long-running deployments)
executionTerminal: true (for shell scripting)
```

## Troubleshooting

**Problem**: Tool not showing up in LM Studio
**Solution**: Ensure its category toggle is enabled in Settings. Check God Mode if you want all tools available.

**Problem**: Grammar parser crashes on first message
**Solution**: This was fixed in v1.5.36+ via schema minification (description truncation, constraint capping); tool schemas are minified automatically on every registration, no setting required.

**Problem**: Tool category toggles don't work
**Solution**: Ensure you're using `.get('key')` pattern if extending the plugin — direct property access on `ParsedConfig` returns `undefined`. See `CONTRIBUTING.md` for extension patterns.

## Next Steps

1. ✅ **Rebuild the plugin**: `npm run build`
2. ✅ **Restart LM Studio**
3. ✅ **Test**: Enable tool categories, verify tools appear in chat
4. ✅ **Customize**: Adjust category toggles based on your workflow needs

## Documentation

- **Tool Reference**: `TOOLS_REFERENCE.md` — Complete parameter documentation for all 124 distinct tool names / 115 locale entries (re-grounded 06.10 against live source; superseded the stale 04.09 stamp "129 entries / 127 names, v1.9.17" — see TOOLS_REFERENCE.md header for audit lineage). Includes the v1.9.8-era Graphify-Inspired Suite: Confidence-Tagged Results, Hub-Exclusion Clustering, Project Auto-Detection, Context Tier Provenance, Cluster-Aware Tool Priority.
- **Architecture**: `ARCHITECTURE.md` — System design, registration pattern, data flows
- **Security**: `SECURITY.md` — Threat model, input validation, secure defaults
- **Contributing**: `CONTRIBUTING.md` — Development workflow, adding new tools
