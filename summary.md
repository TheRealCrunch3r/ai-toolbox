# AI Toolbox Plugin Summary

## 📖 Overview
**AI Toolbox** is a comprehensive LM Studio plugin designed to extend Large Language Model capabilities with **54+ tools** across 14 distinct categories. It enables LLMs to interact directly with the host system, perform web research, manage code repositories, execute scripts, and automate browser tasks within a secure, sandboxed environment.

## 🚀 Core Capabilities
The plugin provides a unified interface for AI agents to perform complex tasks:

- **📁 File System Management**: Full CRUD operations, recursive search, fuzzy finding, and document parsing (PDF/DOCX).
- **🌐 Web Research**: Multi-engine search (DDG, Google, Bing) with automatic fallbacks, content fetching, and semantic RAG.
- **🖥️ Automation**: Headless browser control via Puppeteer for screenshots and session management; background process handling.
- **🐙 Development Tools**: Full Git/GitHub integration, TypeScript diagnostics, ESLint analysis, and code execution (JS/Python).
- **🗄️ Database**: Read-only SQLite queries with strict SQL validation.
- **🔧 Utilities**: Clipboard management, system info retrieval, desktop notifications, and persistent memory context tracking.

## 🏗️ Architecture Highlights
- **Runtime**: Runs as a Node.js plugin within the LM Studio host environment.
- **Structure**: Modular design centered around a `ToolRegistry` that manages tool registration, parameter validation (Zod), and execution.
- **Configuration**: Dynamic UI configuration allowing users to toggle specific tool categories on/off.
- **State Management**: Persistent JSON state with debounced saves and automatic corruption recovery.

## 🛡️ Security Posture
Security is a primary design principle, implementing defense-in-depth across all tools:
- **Path Containment**: Strict validation prevents directory traversal attacks; operations are restricted to allowed base directories.
- **Command Sanitization**: Regex-based blocking of dangerous shell patterns (e.g., `rm -rf`, injection attempts).
- **SSRF Protection**: Network requests block internal/private IP ranges and non-HTTP protocols.
- **Sandboxing**: Restricted execution environments for JavaScript and Python scripts to prevent system compromise.

## 💻 Tech Stack
- **Language**: TypeScript 5.9 (Strict Mode)
- **Runtime**: Node.js 20+
- **Key Dependencies**: Puppeteer, simple-git, Tesseract.js, node:sqlite, duck-duck-scrape

## 📦 Status
- **Version**: `1.0.0` (Initial Release)
- **License**: MIT
