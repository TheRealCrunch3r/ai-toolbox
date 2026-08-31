# MCP Server Implementation Plan: Option B (Open Core)

**Goal:** Implement an internal MCP Server alongside existing SDK tools to enable external agents to interact with `ai_toolbox` via JSON-RPC.

## 📋 Phase Overview

### Phase 1: Architecture & Core Setup (`src/utils/mcpServer.ts`)
- **Dependency:** Install `@modelcontextprotocol/sdk`.
- **Module Creation:** Create core server module using the SDK's `StdioServerTransport`.
- **Registry Sync:** Hook into existing `toolsProvider()` registry to avoid duplicating tool definitions. We will "read" tools from our existing modules rather than rewriting them.

### Phase 2: Schema Translation (`src/utils/mcpSchemaMapper.ts`)
- **The Bridge:** Create a utility that converts internal Zod schemas (used in SDK tools) into standard MCP JSON Schemas.
- **Mapping Logic:**
    - `z.string()` → `"type": "string"`
    - `z.number().min(1)` → `"type": "number", "minimum": 1`
    - `z.enum(['a', 'b'])` → `"enum": ["a", "b"]`
- **Validation:** Ensure all tool descriptions and parameters are properly escaped for JSON-RPC transmission.

### Phase 3: Execution Engine (`src/utils/mcpRouter.ts`)
- **Shared State:** The MCP server must have access to the same `config`, `stateManager`, and `backgroundCommandManager` as the SDK tools. We will inject these dependencies during initialization.
- **Routing Logic:** Create a unified dispatcher that accepts an MCP tool name (e.g., `list_directory`) and executes the corresponding implementation logic, regardless of whether it came from the SDK or the MCP server.

### Phase 4: Transport & Configuration (`src/index.ts`)
- **Dual-Mode Operation:** Update `main()` to initialize the SDK tools for LM Studio *and* spin up the MCP Server in parallel.
- **Transport Selection:** Default to `Stdio` (for CLI/Script access). Add a configuration flag `mcpHttpEnabled: boolean` in `src/config.ts` to optionally expose an HTTP endpoint (`localhost:3000/mcp`) for local network testing.

### Phase 5: Testing & Documentation
- **Test Suite:** Create `tests/mcpServer.test.ts` using the SDK's built-in test client to verify JSON-RPC routing, schema validation, and error handling.
- **Documentation:** Update `README.md` with an "MCP Integration" section providing curl/Python examples for external access.

---

## 💡 Trade-offs & Risks
1.  **Performance Overhead:** JSON-RPC serialization/deserialization adds ~1-2ms latency per call compared to direct SDK calls. (Acceptable for external agents).
2.  **Schema Drift:** If we change Zod schemas frequently, the MCP server must stay in sync. The translation layer handles this automatically via runtime parsing.
3.  **Security Exposure:** Exposing tools via Stdio/HTTP requires careful handling of authentication or access control if deployed to a network. (Default to local-only).

---

## 🚀 Next Step
Proceed with Phase 1 by analyzing the current provider structure and setting up the core MCP server module.