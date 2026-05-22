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
├── promptPreprocessor.ts # Document RAG
├── backgroundCommands.ts # Background process manager
├── tools/                # ADD NEW TOOLS HERE
│   ├── fileSystemTools.ts
│   ├── webResearchTools.ts
│   ├── browserAutomationTools.ts
│   ├── gitGithubTools.ts
│   ├── databaseTools.ts
│   ├── backgroundCommandTools.ts
│   ├── executionTools.ts
│   ├── utilityTools.ts
│   ├── imageProcessingTools.ts
│   ├── httpClientTools.ts
│   ├── vectorRagTools.ts
│   ├── uiGenerationTools.ts      # 🆕 Interactive UI Generation
│   └── contextManagementTools.ts # 🆕 Auto-Context Management
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
