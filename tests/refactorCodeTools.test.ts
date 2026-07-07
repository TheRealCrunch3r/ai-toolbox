/**
 * Dedicated Unit Tests for refactorCodeTools.ts
 * Covers: rename_identifier, move_function, extract_function, unused_import_cleanup, dead_code_detection, dry_run mode
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { registerRefactorCodeTools } from '../src/tools/refactorCodeTools.js';
import type { PluginConfig } from '../src/config.js';

// Create isolated test directories per suite to prevent cross-contamination
const TEST_ROOT = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ai-toolbox-refactor-'));

describe('refactor_code Tool — rename_identifier', () => {
  const config: PluginConfig = {} as any; // Mock config for tool registration
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(TEST_ROOT, 'rename-'));
    registerRefactorCodeTools(config);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should rename a standard function declaration', async () => {
    const filePath = path.join(tempDir, 'test.ts');
    fs.writeFileSync(filePath, `function oldName() { return 42; }\nconsole.log(oldName());`);

    const tools = registerRefactorCodeTools(config);
    const tool = tools.find(t => t.name === 'refactor_code');
    expect(tool).toBeDefined();

    await (tool as any).implementation({
      file_path: filePath,
      operation: 'rename_identifier',
      old_name: 'oldName',
      new_name: 'newName'
    });

    const updated = fs.readFileSync(filePath, 'utf-8');
    expect(updated).toContain('function newName()');
    expect(updated).toContain('console.log(newName());');
    expect(updated).not.toMatch(/\boldName\b/); // Use word boundary to avoid substring false positives like "oldNames"
  });

  test('should rename variables and identifiers across scope', async () => {
    const filePath = path.join(tempDir, 'scope.ts');
    fs.writeFileSync(filePath, `let count: number; function init() { count = 0; }`);

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: filePath,
      operation: 'rename_identifier',
      old_name: 'count',
      new_name: 'counter'
    });

    const updated = fs.readFileSync(filePath, 'utf-8');
    expect(updated).toContain('let counter: number');
    expect(updated).toContain('counter = 0');
    // Use word boundary \b to ensure we aren't just checking for the substring "count" inside "counter"
    expect(updated).not.toMatch(/\bcount\b/); 
  });
});

describe('refactor_code Tool — move_function', () => {
  const config: PluginConfig = {} as any;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(TEST_ROOT, 'move-'));
    registerRefactorCodeTools(config);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should move a standard function to another file', async () => {
    const sourcePath = path.join(tempDir, 'src.ts');
    const targetPath = path.join(tempDir, 'target.ts');
    fs.writeFileSync(sourcePath, `export function helper() { return "ok"; }\nexport default {}`);
    fs.writeFileSync(targetPath, `const x = 1;`);

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: sourcePath,
      operation: 'move_function',
      old_name: 'export default {}', // dummy for schema
      function_name: 'helper',
      target_path: targetPath
    });

    const src = fs.readFileSync(sourcePath, 'utf-8');
    const tgt = fs.readFileSync(targetPath, 'utf-8');
    expect(src).not.toContain('function helper()');
    expect(tgt).toContain('function helper()');
  });

  test('should move an arrow function declaration', async () => {
    const sourcePath = path.join(tempDir, 'arrow.ts');
    const targetPath = path.join(tempDir, 'target_arrow.ts');
    fs.writeFileSync(sourcePath, `export const myFn = async (x: number) => x * 2;\nconst y = 1;`);
    fs.writeFileSync(targetPath, `let z = 0;`);

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: sourcePath,
      operation: 'move_function',
      old_name: 'const y = 1;',
      function_name: 'myFn',
      target_path: targetPath
    });

    const src = fs.readFileSync(sourcePath, 'utf-8');
    expect(src).not.toContain('const myFn');
    expect(fs.readFileSync(targetPath, 'utf-8')).toContain('const myFn');
  });

  test('should move a class method', async () => {
    const sourcePath = path.join(tempDir, 'class.ts');
    const targetPath = path.join(tempDir, 'target_class.ts');
    fs.writeFileSync(sourcePath, `class Calculator {\n  add(a: number) { return a; }\n} export {};`);
    fs.writeFileSync(targetPath, `// target`);

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: sourcePath,
      operation: 'move_function',
      old_name: 'export {};',
      function_name: 'add',
      target_path: targetPath
    });

    const src = fs.readFileSync(sourcePath, 'utf-8');
    expect(src).not.toContain('add(a'); // Method removed from class
    expect(fs.readFileSync(targetPath, 'utf-8')).toContain('add'); // Added to target
  });
});

describe('refactor_code Tool — extract_function', () => {
  const config: PluginConfig = {} as any;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(TEST_ROOT, 'extract-'));
    registerRefactorCodeTools(config);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should extract code block into a new function', async () => {
    const filePath = path.join(tempDir, 'extract.ts');
    const codeBlock = `const result = value * 2;\nconsole.log(result);`;
    fs.writeFileSync(filePath, `export default {};\n${codeBlock}\n`);

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: filePath,
      operation: 'extract_function',
      old_name: codeBlock, // extracted code block passed here now
      new_name: 'processValue'
    });

    const updated = fs.readFileSync(filePath, 'utf-8');
    expect(updated).toContain('function processValue()');
    expect(updated).not.toContain(codeBlock); // original lines removed
  });
});

describe('refactor_code Tool — unused_import_cleanup', () => {
  const config: PluginConfig = {} as any;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(TEST_ROOT, 'import-'));
    registerRefactorCodeTools(config);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should remove entirely unused imports', async () => {
    const filePath = path.join(tempDir, 'unused.ts');
    fs.writeFileSync(filePath, `import { used } from 'lib';\nimport { unused1, unused2 } from 'other';\nconsole.log(used);`);

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: filePath,
      operation: 'unused_import_cleanup'
    });

    const updated = fs.readFileSync(filePath, 'utf-8');
    expect(updated).toContain("import { used } from 'lib';");
    expect(updated).not.toContain('unused1');
    expect(updated).not.toContain('unused2');
  });

  test('should remove only dead specifiers from mixed imports', async () => {
    const filePath = path.join(tempDir, 'mixed.ts');
    fs.writeFileSync(filePath, `import { used, dead } from 'lib';\nconsole.log(used);`);

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: filePath,
      operation: 'unused_import_cleanup'
    });

    const updated = fs.readFileSync(filePath, 'utf-8');
    expect(updated).toContain("import { used } from 'lib';"); // dead removed, used kept
  });

  test('should respect TypeScript import type declarations', async () => {
    const filePath = path.join(tempDir, 'type.ts');
    fs.writeFileSync(filePath, `import type { TypeA, UnusedType } from 'types';\nconst val: TypeA | null = null;`);

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: filePath,
      operation: 'unused_import_cleanup'
    });

    const updated = fs.readFileSync(filePath, 'utf-8');
    expect(updated).toContain("import type { TypeA } from 'types';");
    expect(updated).not.toContain('UnusedType');
  });
});

describe('refactor_code Tool — dry_run mode', () => {
  const config: PluginConfig = {} as any;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(TEST_ROOT, 'dryrun-'));
    registerRefactorCodeTools(config);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should return diff instead of modifying file on rename_identifier', async () => {
    const filePath = path.join(tempDir, 'test.ts');
    const originalContent = `function oldName() { return 42; }\nconsole.log(oldName());`;
    fs.writeFileSync(filePath, originalContent);

    const tools = registerRefactorCodeTools(config);
    const tool = tools.find(t => t.name === 'refactor_code')!;
    const result = await (tool as any).implementation({
      file_path: filePath,
      operation: 'rename_identifier',
      old_name: 'oldName',
      new_name: 'newName',
      dry_run: true
    });

    expect(result.success).toBe(true);
    expect(result.data.dryRun).toBe(true);
    expect(result.data.diff).toBeDefined();
    expect(result.data.diff).toContain('+ function newName()');
    expect(result.data.diff).toContain('- function oldName()');
    
    // Verify file was NOT modified
    const unchanged = fs.readFileSync(filePath, 'utf-8');
    expect(unchanged).toBe(originalContent);
  });

  test('should return diff instead of modifying file on extract_function', async () => {
    const filePath = path.join(tempDir, 'extract.ts');
    const codeBlock = `const result = value * 2;\nconsole.log(result);`;
    fs.writeFileSync(filePath, `export default {};\n${codeBlock}\n`);
    const originalContent = fs.readFileSync(filePath, 'utf-8');

    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: filePath,
      operation: 'extract_function',
      old_name: codeBlock,
      new_name: 'processValue',
      dry_run: true
    });

    const unchanged = fs.readFileSync(filePath, 'utf-8');
    expect(unchanged).toBe(originalContent); // file untouched in dry run
  });
});

describe('refactor_code Tool — dead_code_detection', () => {
  const config: PluginConfig = {} as any;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(TEST_ROOT, 'deadcode-'));
    registerRefactorCodeTools(config);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should detect unused exported functions', async () => {
    const file1 = path.join(tempDir, 'a.ts');
    const file2 = path.join(tempDir, 'b.ts');
    
    fs.writeFileSync(file1, `export function used() {} export function deadFn() { return true; }`);
    fs.writeFileSync(file2, `import { used } from './a'; console.log(used());`);

    const tools = registerRefactorCodeTools(config);
    const result = await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: tempDir,
      operation: 'dead_code_detection'
    });

    expect(result.success).toBe(true);
    // deadFn is exported but never imported or used elsewhere
    const foundDead = result.data.deadExports.some((e: string) => e.includes('deadFn'));
    expect(foundDead).toBe(true);
  });

  test('should ignore exported functions that are imported elsewhere', async () => {
    const file1 = path.join(tempDir, 'util.ts');
    const file2 = path.join(tempDir, 'main.ts');
    
    fs.writeFileSync(file1, `export function helper() {}`);
    fs.writeFileSync(file2, `import { helper } from './util'; helper();`);

    const tools = registerRefactorCodeTools(config);
    const result = await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: tempDir,
      operation: 'dead_code_detection'
    });

    expect(result.success).toBe(true);
    expect(result.data.deadExports.length).toBe(0); // helper is used
  });

  test('should return empty list when no dead code exists', async () => {
    const file1 = path.join(tempDir, 'index.ts');
    fs.writeFileSync(file1, `export function alwaysUsed() {} import { alwaysUsed } from './index';`);

    const tools = registerRefactorCodeTools(config);
    const result = await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: tempDir,
      operation: 'dead_code_detection'
    });

    expect(result.success).toBe(true);
    expect(result.data.deadExports.length).toBe(0);
  });
});

describe('refactor_code Tool — Error Handling', () => {
  const config: PluginConfig = {} as any;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(TEST_ROOT, 'errors-'));
    registerRefactorCodeTools(config);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should fail gracefully when file does not exist', async () => {
    const tools = registerRefactorCodeTools(config);
    const result = await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: path.join(tempDir, 'nonexistent.ts'),
      operation: 'rename_identifier',
      old_name: 'foo',
      new_name: 'bar'
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('File not found');
  });

  test('should fail when move_function target file is missing (creates it)', async () => {
    const sourcePath = path.join(tempDir, 'src.ts');
    fs.writeFileSync(sourcePath, `export function foo() {}`);
    
    const tools = registerRefactorCodeTools(config);
    await (tools.find((t: any) => t.name === 'refactor_code') as any).implementation({
      file_path: sourcePath,
      operation: 'move_function',
      old_name: '',
      function_name: 'foo',
      target_path: path.join(tempDir, 'new_target.ts')
    });

    expect(fs.existsSync(path.join(tempDir, 'new_target.ts'))).toBe(true);
  });
});
