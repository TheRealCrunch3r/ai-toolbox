# Contributing to AI Toolbox

Thank you for your interest in contributing! This guide covers development setup, coding standards, and the pull request process.

---

## 🚀 Development Setup

### Prerequisites

- **Node.js 20+** — Required for `node:sqlite` support and modern JavaScript features
- **npm** — Package manager for dependencies
- **LM Studio** — For testing the plugin in its target environment

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd ai_toolbox

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Workflow

```bash
# Type checking (fast, no emit)
npm run typecheck

# Linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Build for production
npm run build

# Run all tests
npm test
```

---

## 📝 Coding Standards

### TypeScript

This project uses **TypeScript 5.9** with **strict mode** enabled. All code must:

- ✅ Use explicit types (no `any` unless unavoidable)
- ✅ Follow the existing typed params pattern (see `C5 FIX` comments)
- ✅ Use `async/await` instead of callbacks/Promise chains
- ✅ Include JSDoc comments for public functions and classes
- ✅ Handle errors with proper `try/catch` and typed error handling

```typescript
// ✅ GOOD: Typed params interface
interface ReadFileParams {
  file_name: string;
  max_length?: number;
}

// ✅ GOOD: Proper error handling
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

// ❌ BAD: Using 'any'
async function badExample(params: any) { /* ... */ }
```

### Tool Implementation Pattern

All tools follow a consistent pattern:

```typescript
tools.push(tool({
  name: 'tool_name',
  description: 'Clear description of what the tool does.',
  parameters: {
    param1: z.string().describe('Parameter description'),
    param2: z.number().int().min(1).optional().default(5).describe('Optional param'),
  },
  implementation: async ({ param1, param2 }: TypedParamsInterface) => {
    try {
      // 1. Validate inputs
      // 2. Perform operation
      // 3. Return structured result
      return { success: true, data: { /* result */ } };
    } catch (error) {
      return handleError(error);
    }
  },
}));
```

### Naming Conventions

- **Tool names**: `snake_case` (e.g., `read_file`, `web_search`)
- **Functions**: `camelCase` (e.g., `registerFileSystemTools`)
- **Classes**: `PascalCase` (e.g., `ToolRegistry`, `StateManager`)
- **Interfaces**: `PascalCase` with descriptive names (e.g., `ReadFileParams`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_CONFIG`)

### Error Handling

All tool implementations must return a structured result:

```typescript
// Success response
return { success: true, data: { /* result data */ } };

// Error response
return { success: false, error: 'Clear error message' };
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest tests/security.test.ts

# Run with coverage
npx jest --coverage
```

### Writing Tests

Tests are located in the `tests/` directory. Each major module should have a corresponding test file.

```typescript
// Example test structure
describe('Security Module', () => {
  describe('validatePath', () => {
    it('should reject directory traversal', () => {
      expect(validatePath('../etc/passwd', '/safe/dir')).toBe(false);
    });

    it('should allow valid paths', () => {
      expect(validatePath('subdir/file.txt', '/safe/dir')).toBe(true);
    });
  });
});
```

### Test Requirements

- ✅ All new tools must have at least basic tests
- ✅ Security functions must have edge case tests
- ✅ Existing tests must pass before submitting PRs

---

## 🔐 Security Guidelines

### Adding New Tools

When implementing new tools, follow these security principles:

1. **Input Validation**: Always validate user inputs using Zod schemas
2. **Path Validation**: Use `validatePath()` for any file system operations
3. **Command Sanitization**: Use `sanitizeCommand()` for shell commands
4. **SQL Validation**: Use `validateSQLQuery()` for database operations
5. **SSRF Protection**: Use `validateUrl()` for HTTP requests
6. **Size Limits**: Enforce reasonable limits on file sizes, response lengths, etc.

### Security Checklist for New Tools

- [ ] Input parameters validated with Zod
- [ ] Path validation applied (if file operations)
- [ ] Command sanitization applied (if shell execution)
- [ ] No hardcoded credentials or secrets
- [ ] Proper error handling with typed errors
- [ ] Resource cleanup (file handles, connections, timers)
- [ ] Reasonable timeout limits
- [ ] Tool gated behind config flag (if dangerous)

### Dangerous Tool Categories

Tools that execute code, modify files, or access the network should:

1. Be **disabled by default** in configuration
2. Have **clear security warnings** in descriptions
3. Use **granular config toggles** when possible
4. Implement **input sanitization** appropriate to the operation

---

## 📋 Pull Request Process

### Before Submitting

1. **Branch**: Create a feature branch from `main`
   ```bash
   git checkout -b feature/description-of-change
   ```

2. **Test**: Ensure all tests pass
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

3. **Build**: Verify the project builds cleanly
   ```bash
   npm run build
   ```

4. **Commit**: Write clear commit messages
   ```
   feat: add new tool category for image processing
   fix: resolve path validation edge case on Windows
   docs: update README with configuration table
   ```

### PR Template

Include the following in your PR description:

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature/tool
- [ ] Security improvement
- [ ] Documentation update
- [ ] Performance optimization

## Testing
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] New tests added (if applicable)

## Security Review
- [ ] No new security vulnerabilities introduced
- [ ] Input validation implemented
- [ ] Tool gating applied (if dangerous)
```

### Review Process

1. Maintainers review code for correctness and security
2. CI checks must pass (typecheck, lint, tests)
3. At least one maintainer approval required
4. Squash and merge to maintain clean history

---

## 📚 Documentation

### Updating Documentation

When adding new features:

1. **README.md**: Update feature list and tool categories
2. **TOOLS_REFERENCE.md**: Document new tools with parameters
3. **CHANGELOG.md**: Add entry under the appropriate section
4. **ARCHITECTURE.md**: Update diagrams if architecture changes
5. **Inline comments**: Add JSDoc to new functions

### Tool Documentation Format

```markdown
### tool_name

**Description**: What the tool does.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1 | `string` | Yes | Description |
| param2 | `number` | No | Description (default: 5) |

**Returns**: `{ success: boolean, data?: object, error?: string }`

**Example**:
```json
{
  "param1": "value",
  "param2": 10
}
```

**⚠️ Security Warning**: (if applicable)
```

---

## 🏗️ Project Structure Reference

```
src/
├── index.ts              # Entry point — DO NOT ADD TOOLS HERE
├── toolsProvider.ts      # Tool registration — DO NOT ADD TOOLS HERE
├── config.ts             # Configuration schema — add new toggles here
├── security.ts           # Security validators — extend as needed
├── stateManager.ts       # State management
├── workingDir.ts         # Working directory management
├── performanceUtils.ts   # Performance utilities
├── promptPreprocessor.ts # Document RAG + ContextGuard integration
├── backgroundCommands.ts # Background process manager
├── fuzzySearch.ts        # Fuzzy file search implementation
├── contextGuard.ts       # ContextGuard module (infinite context management)
├── tools/                # ADD NEW TOOLS HERE
│   ├── fileSystemTools.ts          # 20 file system tools
│   ├── webResearchTools.ts         # 4 web research tools
│   ├── browserAutomationTools.ts   # 5 browser tools
│   ├── gitGithubTools.ts           # 14 Git/GitHub tools
│   ├── databaseTools.ts            # 1 database tool
│   ├── backgroundCommandTools.ts   # 3 background command tools
│   ├── executionTools.ts           # 5 execution tools
│   ├── utilityTools.ts             # ~20+ utility tools
│   ├── imageProcessingTools.ts     # 4 image processing tools
│   ├── httpClientTools.ts          # 3 HTTP client tools
│   ├── vectorRagTools.ts           # 4 vector RAG tools
│   ├── uiGenerationTools.ts        # 🆕 Interactive UI Generation (3 tools)
│   └── contextManagementTools.ts   # 🆕 Auto-Context Management (7 tools)
├── backupTools.ts                  # 💾 Backup & Restore (4 tools)
└── tests/                # ADD TESTS HERE
```

### Adding a New Tool Category

1. Create a new file in `src/tools/` (e.g., `newCategoryTools.ts`)
2. Export a `registerNewCategoryTools(config)` function
3. Import and register in `src/toolsProvider.ts`
4. Add config toggle in `src/config.ts` (both schema and DEFAULT_CONFIG)
5. Add UI schematic field in `configSchematics` builder chain
6. Add tests in `tests/`
7. Update documentation (README, TOOLS_REFERENCE, CHANGELOG, ARCHITECTURE)

---

## 🆘 Getting Help

- **Issues**: File a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Security Issues**: See [SECURITY.md](SECURITY.md) for responsible disclosure

---

## 📜 Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

---

## 🛡️ Testing ContextGuard Features (v1.4.2)

### UI Controls Verification

```bash
# 1. Open LM Studio → Plugins → AI Toolbox → ⚙️ Settings
# 2. Scroll to "🧠 ContextGuard Token Management" section
# 3. Verify all 6 controls are present:
#    - [ ] 🧠 ContextGuard Token Management (toggle)
#    - [ ] 📊 Token Limit Before Compression (numeric, 1K-200K)
#    - [ ] 🔍 Smart File Reading (toggle)
#    - [ ] 🤖 Summary Model Name (text input)
#    - [ ] 📌 Terminal Output Filtering (toggle)
#    - [ ] 📏 Max Terminal Output Length (numeric, 100-20K)
```

### Visual Indicator Testing

```bash
# 1. Set Token Limit to a low value (e.g., 10,000)
# 2. Have a long conversation or paste large content
# 3. When token count exceeds ~9,000 (90% of limit), compression triggers
# 4. Verify visual indicator appears with:
#    - [ ] 🧠 Emoji header
#    - [ ] Number of messages compressed
#    - [ ] Tokens before → after (e.g., "~85k → ~42k")
#    - [ ] Percentage saved (e.g., "Saved ~43,000 tokens (~51%)")
#    - [ ] Timestamp
#    - [ ] Visual separator lines
```

### Smart File Reading Testing

```bash
# 1. Create a large file (>10KB) with specific keywords:
cat > test_file.js << 'EOF'
// Line 1-100: filler content
function calculateTax(income) {
  return income * 0.25;
}
// More filler...
function processPayment(amount) {
  // Payment logic
}
// Even more filler...
EOF

# 2. Ask the AI about "calculateTax" function
# 3. Verify only relevant lines around that keyword are returned
# 4. Toggle Smart File Reading OFF and verify full file is read instead
```

### Terminal Output Filtering Testing

```bash
# 1. Run a command with large output:
npm install --verbose 2>&1 | head -n 5000

# 2. Verify output is truncated to configured length (default: 2,000 chars)
# 3. Check for truncation indicator: "... [Output truncated: X lines hidden] ..."
# 4. Toggle Terminal Output Filtering OFF and verify full output
```

### Regression Testing Checklist

After making changes to ContextGuard:

- [ ] Build succeeds without errors (`npm run build`)
- [ ] All existing tests pass (`npm test`)
- [ ] UI controls appear in LM Studio settings
- [ ] Compression triggers at correct threshold (90% of token limit)
- [ ] Visual indicator displays correctly
- [ ] Smart file reading extracts keywords properly
- [ ] Terminal filtering truncates at configured length
- [ ] No memory leaks during extended sessions
- [ ] Fallback mode works when summary model unavailable

---

*End of Contributing Guide*
