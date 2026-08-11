# Contributing to AI Toolbox Plugin

Thank you for your interest in contributing to the AI Toolbox plugin! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Safe Editing Practices](#-safe-editing-practices)

- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Adding New Tools](#-adding-new-tools)
- [Testing Requirements](#-testing-requirements)
- [Documentation Standards](#-documentation-standards)
- [Security Guidelines](#-security-guidelines)
- [Pull Request Process](#-pull-request-process)

---

## 🤝 Code of Conduct

This project follows a simple code of conduct:
- Be respectful and inclusive in all interactions
- Accept constructive feedback gracefully
- Focus on what's best for the community and users
- Exercise good judgment when handling sensitive information

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Node.js 20+** installed
2. **npm** package manager available
3. **Git** for version control
4. **LM Studio** installed (for testing)

### Setup

```bash
# Clone the repository
git clone https://github.com/lmstudio-ai/ai-toolbox.git
cd ai-toolbox

# Install dependencies
npm install

# Build the project
npm run build

# Run type checking
npm run typecheck

# Run tests
npm test
```

---

## 🛠️ Development Workflow

### 1. Create a Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/add-new-tool
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/update-documentation
```

### 2. Make Changes

### Safe Editing Practices

When modifying files, always follow the backup-first workflow to prevent data loss:

1. **Backup first** — Create a `.bak` backup before any file modification (tools like `replace_text_in_file`, `insert_at_line`, `append_file`, and `delete_lines_in_file` automatically create `.bak` backups)
2. **Make changes** — Edit the file using AI Toolbox tools or your editor
3. **Verify after editing** — Check syntax highlighting, run `npx tsc --noEmit`, then `npm test`
4. **Clean up later** — Remove `.bak` files when satisfied with results

For manual recovery if something goes wrong:
- Restore from the `.bak` backup file (rename it back to the original name)
- Or use Git: `git checkout HEAD -- <file>` to revert changes

Follow the project structure when making changes:
- **Tool modules**: Place in `src/tools/` directory
- **Configuration**: Update `src/config.ts` for new settings
- **Tests**: Add corresponding tests in `tests/` directory
- **Documentation**: Update relevant `.md` files

### 3. Test Your Changes

Before committing, ensure all checks pass:

```bash
# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run test suite
npm test

# Build the project
npm run build
```

All checks must pass before submitting a pull request.

---

## 🔧 Adding New Tools

### Step 1: Create Tool Module File

Create a new file in `src/tools/` directory (e.g., `newToolModule.ts`):

```typescript
import { tool, type Tool } from '@lmstudio/sdk';
import { z } from 'zod';
import type { PluginConfig } from '@/config.ts'; // Source file extension (.ts) — runtime uses .js via ESM bundler

interface NewToolParams {
  parameter1: string;
  parameter2?: number;
}

export function registerNewTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // Define the tool using Zod schema for validation
  tools.push(tool({
    name: 'new_tool_name',
    description: 'Clear, concise description of what this tool does.',
    parameters: {
      parameter1: z.string().describe('Description of parameter1'),
      parameter2: z.number().optional().describe('Optional parameter with default'),
    },
    implementation: async ({ parameter1, parameter2 }: NewToolParams) => {
      try {
        // Your tool logic here (must be async)
        
        return { success: true, data: { result: 'success' } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Operation failed: ${message}` };
      }
    },
  }));

  return tools;
}
```

### Step 2: Register in toolsProvider.ts

Add your tool module to the declarative registry array in `src/toolsProvider.ts`:

```typescript
// Import your new tool module (source: .ts, runtime: .js via ESM bundler)
import { registerNewTools } from './tools/newToolModule.ts';

// Add an entry to TOOL_REGISTRIES (v1.8.2+ Declarative Registry Pattern)
const TOOL_REGISTRIES: ToolRegistryEntry[] = [
  // ... existing entries ...
  { key: 'newCategory', register: () => registerNewTools(config, stateManager) },
];

// The for...of loop automatically handles config gating + GOD MODE bypass:
for (const entry of TOOL_REGISTRIES) {
  if (config[entry.key] || isGodMode) {
    tools.push(...entry.register());
  }
}
```

**Note**: Use the declarative registry pattern introduced in v1.8.2. Each registry entry captures dependencies via closures at definition time, eliminating parameter-passing complexity and satisfying strict TypeScript/ESLint rules. See `docs/toolsProvider_registry_pattern.md` for detailed architecture notes.

### Step 3: Add Configuration (if needed)

If your tool requires configuration toggles or settings, update `src/config.ts`:

```typescript
export const ConfigSchema = z.object({
  // ... existing schema ...
  
  newToolEnabled: z.boolean().default(true).describe('Enable the new tool'),
});
```

### Step 4: Add Tests

Create test file in `tests/` directory (e.g., `newToolModule.test.ts`):

```typescript
import { registerNewTools } from '../src/tools/newToolModule';
import type { PluginConfig } from '../src/config';

describe('registerNewTools', () => {
  let config: PluginConfig;
  
  beforeEach(() => {
    // Create a mock config for testing
    config = {
      newToolEnabled: true,
      // ... other required config fields
    } as unknown as PluginConfig;
  });

  test('should register tool with correct name', () => {
    const tools = registerNewTools(config);
    
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('new_tool_name');
  });

  // Add more tests for tool functionality
});
```

### Step 5: Update Documentation

Update the following documentation files to reflect your new tool:

| File | What to Update |
|------|---------------|
| `README.md` | Add tool to category list in Tool Categories section |
| `TOOLS_REFERENCE.md` | Add complete tool reference with parameter table |
| `ARCHITECTURE.md` | Update module count if adding new tool file |
| `CHANGELOG.md` | Document the addition under [Unreleased] or next version |

---

## ✅ Testing Requirements

All contributions must include comprehensive tests:

### 1. Unit Tests

Every tool function should have unit tests covering:
- **Happy path**: Expected successful execution
- **Error handling**: Invalid inputs, missing parameters, runtime errors
- **Edge cases**: Empty strings, null values, boundary conditions
- **Security validation**: Path traversal attempts, injection attacks

### 2. Test Coverage Requirements

| Category | Minimum Coverage |
|----------|-----------------|
| Tool implementations | 80%+ line coverage |
| Security validators | 100% branch coverage |
| Configuration parsing | 90%+ coverage |

### 3. Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- newToolModule.test.ts
```

---

## 📝 Documentation Standards

### README.md

Must include:
- Clear, concise project description
- Complete tool categories and counts
- Accurate configuration tables derived from Zod schema
- Quick Start examples that match actual tool signatures

### TOOLS_REFERENCE.md

Each tool must document:
- **Name**: Exact tool name as registered in SDK
- **Description**: One-line summary of purpose
- **Parameters table**: All parameters with type, required status, and description
- **Return type**: Expected response structure on success/failure
- **Example usage**: Practical example showing typical use case

### ARCHITECTURE.md

Must include:
- Accurate system overview diagram reflecting actual module count
- Correct tool counts per category in architecture sections
- Verified data flow diagrams matching implementation
- Up-to-date security pipeline documentation

---

## 🔒 Security Guidelines

Security is a top priority for this project. Follow these guidelines when contributing:

### 1. Input Validation

All user inputs must be validated using Zod schemas:

```typescript
// ✅ Good - Validate with Zod
parameters: {
  userInput: z.string().min(1).max(1000),
}

// ❌ Bad - No validation
parameters: {
  userInput: z.any(),
}
```

### 2. Path Validation

All file paths must pass through `validatePath()`:

```typescript
import { validatePath } from '../security.js';

if (!validatePath(userPath, getWorkingDir())) {
  return { success: false, error: 'Invalid path: directory traversal detected' };
}
```

### 3. Command Sanitization

Shell commands must be sanitized before execution:

```typescript
import { sanitizeCommand } from '../security.js';

const sanitized = sanitizeCommand(command);
if (!sanitized.safe) {
  return { success: false, error: `Unsafe command detected: ${sanitized.reason}` };
}
```

### 4. No Hardcoded Secrets

Never commit API keys, tokens, or credentials:
- Use environment variables for sensitive configuration
- Add secrets to `.gitignore`
- Document required environment variables in documentation

---

## 📤 Pull Request Process

### 1. Before Submitting

Ensure your PR includes:
- [ ] All tests passing (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated (README, TOOLS_REFERENCE, CHANGELOG)
- [ ] Commit messages follow conventional commits format

### 2. PR Description Template

```markdown
## 📝 Summary
Brief description of changes made.

## 🔍 Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security fix

## ✅ Testing
- [ ] Unit tests added/updated
- [ ] All existing tests passing
- [ ] Manual testing completed

## 📚 Documentation
- [ ] README.md updated
- [ ] TOOLS_REFERENCE.md updated (if adding/changing tools)
- [ ] CHANGELOG.md updated
```

### 3. Review Process

1. **Automated checks**: CI will run tests, linting, and type checking
2. **Code review**: Maintainers will review for:
   - Correctness and logic
   - Security implications
   - Performance considerations
   - Documentation accuracy
3. **Approvals**: Requires at least one maintainer approval
4. **Merge**: Squash merge after all checks pass

---

## 📋 Checklist for Contributors

Before submitting your PR, verify:

- [ ] Code follows TypeScript best practices (strict mode)
- [ ] All async operations use proper error handling
- [ ] Zod schemas validate all user inputs
- [ ] Path validation prevents directory traversal
- [ ] Security-sensitive tools are gated by config
- [ ] Tests cover happy path, errors, and edge cases
- [ ] Documentation matches actual implementation
- [ ] No hardcoded secrets or credentials
- [ ] Commit messages are clear and descriptive

---

## 🆘 Getting Help

If you need help contributing:
1. Check existing issues on GitHub
2. Review existing tool modules for patterns
3. Ask questions in discussions or issues

---

Thank you for helping make AI Toolbox better! 🚀

### 🤖 AI Assistant Protocol
- **NEVER** run `git commit`, `git push`, or other destructive commands without explicit user confirmation.
- **ALWAYS** provide the commands for the user to run in their own terminal.
- **ALWAYS** ask for confirmation before making significant architectural changes.
