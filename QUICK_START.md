# 🚀 Quick Start Guide - AI Toolbox Plugin

## ✅ All Tools Enabled by Default (v1.6.4+)

Starting with v1.6.4, the Tool Priority System was removed. **All enabled tools are now exposed directly to the LLM** without arbitrary truncation or priority-based filtering. Schema minification (`toolsSchemaMinifier.ts`) handles grammar parser compatibility automatically.

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
vectorRag: true, contextManagement: true, textProcessing: true, astRefactoring: true
executionJavaScript: true, executionPython: true
browserAutomation: false, gitOperations: false, databaseQueries: false
backgroundCommands: false, httpClient: false, uiGeneration: false
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
vectorRag: true (for semantic search over datasets)
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
**Solution**: This was fixed in v1.5.36+ via schema minification (description truncation, constraint capping). If it persists, try increasing `contextGuardTokenLimit` to reduce payload size.

**Problem**: Tool category toggles don't work
**Solution**: Ensure you're using `.get('key')` pattern if extending the plugin — direct property access on `ParsedConfig` returns `undefined`. See `CONTRIBUTING.md` for extension patterns.

## Next Steps

1. ✅ **Rebuild the plugin**: `npm run build`
2. ✅ **Restart LM Studio**
3. ✅ **Test**: Enable tool categories, verify tools appear in chat
4. ✅ **Customize**: Adjust category toggles based on your workflow needs

## Documentation

- **Tool Reference**: `TOOLS_REFERENCE.md` — Complete parameter documentation for all 131 unique tools across 24 modules (v1.9.8). Includes new v1.9.8 architectural features: Confidence-Tagged Results, Hub-Exclusion Clustering, Project Auto-Detection, Context Tier Provenance, Cluster-Aware Tool Priority.
- **Architecture**: `ARCHITECTURE.md` — System design, registration pattern, data flows
- **Security**: `SECURITY.md` — Threat model, input validation, secure defaults
- **Contributing**: `CONTRIBUTING.md` — Development workflow, adding new tools
