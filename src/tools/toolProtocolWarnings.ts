/**
 * CRITICAL TOOL USAGE RULES — Protocol Restrictions
 * 
 * This file contains critical warnings and guidelines for tool usage.
 * These rules prevent the error where local file paths were incorrectly
 * passed to HTTP/HTTPS-only web fetching tools (searxng_batch_fetch, etc.).
 * 
 * IMPORTANT: The searxng_* tools are external LM Studio system tools.
 * Their descriptions cannot be modified in this codebase. Instead,
 * we document the restrictions here and enforce them via tool selection
 * guidelines.
 */

export const TOOL_PROTOCOL_WARNINGS = {
  /**
   * Critical warning for web fetching tools that only accept HTTP/HTTPS URLs
   */
  WEB_FETCHING_TOOLS: `⚠️ CRITICAL PROTOCOL RESTRICTION: The following tools ONLY accept HTTP/HTTPS URLs:
  - searxng_batch_fetch(urls) — Batch fetch multiple REMOTE pages (HTTP/HTTPS only!)
  - searxng_search(query) — Web search (NOT local file access!)
  - searxng_fetch_url(url) — Fetch single remote URL (HTTP/HTTPS only!)
  - fetch_web_content(url) — Fetch single webpage (HTTP/HTTPS only!)

❌ NEVER pass file:// paths or local filesystem paths to these tools!
✅ For LOCAL files, use: read_file(file_name), find_files(pattern), etc.

Example of WRONG usage:
  searxng_batch_fetch(urls=["file:///C:/path/to/file.md"]) // WILL FAIL!

Example of CORRECT usage:
  read_file(file_name="CHANGELOG.md", max_length=5000) // For local files
`,

  /**
   * Tool selection decision tree for quick reference
   */
  TOOL_SELECTION_GUIDE: `
## TOOL SELECTION DECISION TREE

Step 1: Is this a LOCAL file or REMOTE URL?

IF LOCAL FILE (file://, C:/path/, ./relative/):
  → Use read_file(file_name) for single files
  → Use find_files(pattern) to search first, then read each result

IF REMOTE URL (http://, https://):
  → Use fetch_web_content(url) for single page
  → Use searxng_batch_fetch(urls=[...]) for multiple pages at once
  → Use searxng_search(query="...") for web search only

Step 2: Does the tool support my protocol?
  → Verify before calling! Never pass file:// to HTTP/HTTPS-only tools.
`,

  /**
   * Quick reference table for tool protocols
   */
  PROTOCOL_REFERENCE_TABLE: `
## TOOL PROTOCOL REFERENCE TABLE

| Tool | Protocol Support | Use For |
|------|------------------|---------|
| read_file(file_name) | ✅ Local files | Reading local MD, JSON, TXT |
| find_files(pattern) | ✅ Local filesystem | Finding files by name |
| fetch_web_content(url) | ✅ HTTP/HTTPS only | Single remote page |
| searxng_batch_fetch(urls) | ✅ HTTP/HTTPS ONLY | Multiple REMOTE pages (NO file://!) |
| searxng_search(query) | ✅ Web search only | Searching web, NOT local files |
| searxng_fetch_url(url) | ✅ HTTP/HTTPS ONLY | Single remote URL fetch |
`
};

/**
 * Get the complete critical warning message for inclusion in system prompts
 */
export function getCriticalToolWarnings(): string {
  return [
    TOOL_PROTOCOL_WARNINGS.WEB_FETCHING_TOOLS,
    TOOL_PROTOCOL_WARNINGS.TOOL_SELECTION_GUIDE,
    TOOL_PROTOCOL_WARNINGS.PROTOCOL_REFERENCE_TABLE
  ].join('\n\n---\n\n');
}
