/**
 * Tests for File System Tools
 */

import * as fs from 'fs';
import * as path from 'path';

// Mock fs
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    readFileSync: jest.fn().mockReturnValue('file content'),
    writeFileSync: jest.fn(),
    appendFileSync: jest.fn(),
    readdirSync: jest.fn().mockReturnValue([]),
    statSync: jest.fn().mockReturnValue({
      isDirectory: () => false,
      isFile: () => true,
      size: 100,
      birthtime: new Date(),
      mtime: new Date(),
      atime: new Date(),
    } as fs.Stats),
    existsSync: jest.fn().mockReturnValue(true),
    rmSync: jest.fn(),
    unlinkSync: jest.fn(),
    renameSync: jest.fn(),
    copyFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
      stat: jest.fn().mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        size: 100,
      } as fs.Stats),
      readFile: jest.fn().mockResolvedValue(Buffer.from('file content')),
      readdir: jest.fn().mockResolvedValue([]),
      writeFile: jest.fn().mockResolvedValue(undefined),
      appendFile: jest.fn().mockResolvedValue(undefined),
      mkdir: jest.fn().mockResolvedValue(undefined),
      rm: jest.fn().mockResolvedValue(undefined),
      unlink: jest.fn().mockResolvedValue(undefined),
      rename: jest.fn().mockResolvedValue(undefined),
      copyFile: jest.fn().mockResolvedValue(undefined),
      access: jest.fn(),
    },
  };
});

// Mock security
jest.mock('../src/security', () => ({
  validatePath: jest.fn().mockReturnValue(true),
  isSafeRegex: jest.fn().mockReturnValue(true),
}));

// Mock workingDir
jest.mock('../src/workingDir', () => ({
  getWorkingDir: jest.fn().mockReturnValue('/test/working/dir'),
  setWorkingDir: jest.fn().mockReturnValue(true),
  resolvePath: jest.fn((p: string) => `/test/working/dir/${p}`),
}));

// Mock performanceUtils
jest.mock('../src/performanceUtils', () => ({
  levenshteinSimilarity: jest.fn().mockReturnValue(0.8),
  getCachedFuzzyResults: jest.fn().mockReturnValue(null),
  cacheFuzzyResults: jest.fn(),
  findFilesAsync: jest.fn().mockResolvedValue({ files: ['/test/file.ts'], count: 1 }),
  countTypeScriptFiles: jest.fn().mockResolvedValue(5),
  getAnalysisTimeout: jest.fn().mockReturnValue(30000),
}));

import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import { DEFAULT_CONFIG } from '../src/config';
import { StateManager } from '../src/stateManager';

describe('File System Tools', () => {
  let tools: ReturnType<typeof registerFileSystemTools>;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs = fs as jest.Mocked<typeof fs>;
    const stateManager = new StateManager(DEFAULT_CONFIG);
    tools = registerFileSystemTools(DEFAULT_CONFIG, stateManager);
  });

  test('should register file system tools', () => {
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
  });

  describe('list_directory', () => {
    test('should list directory entries', async () => {
      const tool = tools?.find(t => t.name === 'list_directory');
      (mockFs.promises.readdir as jest.Mock).mockReturnValueOnce([
        { name: 'file.txt', isDirectory: () => false, isFile: () => true } as fs.Dirent,
        { name: 'subdir', isDirectory: () => true, isFile: () => false } as fs.Dirent,
      ]);
      const result = await tool?.implementation({ path: '.' });
      expect((result as any).success).toBe(true);
      expect((result as any).data.length).toBe(2);
    });

    test('should handle directory read error', async () => {
      const tool = tools?.find(t => t.name === 'list_directory');
      (mockFs.promises.readdir as jest.Mock).mockImplementationOnce(() => { throw new Error('EACCES'); });
      const result = await tool?.implementation({ path: '/restricted' });
      expect((result as any).success).toBe(false);
    });
  });

  describe('read_file', () => {
    test('should read file content', async () => {
      const tool = tools?.find(t => t.name === 'read_file');
      const result = await tool?.implementation({ file_name: 'test.txt', max_length: 5000 });
      expect((result as any).success).toBe(true);
    });

    test('should reject file too large (>10MB)', async () => {
      const tool = tools?.find(t => t.name === 'read_file');
      (fs.promises.stat as jest.Mock).mockResolvedValueOnce({ size: 11_000_000 } as fs.Stats);
      const result = await tool?.implementation({ file_name: 'huge.bin' });
      expect((result as any).success).toBe(false);
    });

    test('should reject binary files', async () => {
      const tool = tools?.find(t => t.name === 'read_file');
      (fs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from([0x00, 0x01, 0x02]));
      const result = await tool?.implementation({ file_name: 'binary.exe' });
      expect((result as any).success).toBe(false);
    });
  });

  describe('save_file', () => {
    test('should save single file', async () => {
      const tool = tools?.find(t => t.name === 'save_file');
      const result = await tool?.implementation({ file_name: 'test.txt', content: 'hello' });
      expect((result as any).success).toBe(true);
    });

    test('should save multiple files in batch', async () => {
      const tool = tools?.find(t => t.name === 'save_file');
      const result = await tool?.implementation({
        files: [
          { file_name: 'a.txt', content: 'A' },
          { file_name: 'b.txt', content: 'B' },
        ],
      });
      expect((result as any).success).toBe(true);
    });
  });

  describe('replace_text_in_file', () => {
    test('should replace text', async () => {
      const tool = tools?.find(t => t.name === 'replace_text_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('hello world'));
      const result = await tool?.implementation({
        file_name: 'test.txt',
        old_string: 'world',
        new_string: 'universe',
      });
      expect((result as any).success).toBe(true);
    });

    test('should reject when string not found', async () => {
      const tool = tools?.find(t => t.name === 'replace_text_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('hello world'));
      const result = await tool?.implementation({
        file_name: 'test.txt',
        old_string: 'notfound',
        new_string: 'replacement',
      });
      expect((result as any).success).toBe(false);
    });
  });

  describe('insert_at_line', () => {
    test('should insert at valid line', async () => {
      const tool = tools?.find(t => t.name === 'insert_at_line');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('line1\nline2\nline3'));
      const result = await tool?.implementation({
        file_name: 'test.txt',
        line_number: 2,
        content_to_insert: 'inserted',
      });
      expect((result as any).success).toBe(true);
    });

    test('should reject line out of bounds', async () => {
      const tool = tools?.find(t => t.name === 'insert_at_line');
      (mockFs.promises.readFile as jest.Mock).mockReturnValueOnce(Buffer.from('line1\nline2'));
      const result = await tool?.implementation({
        file_name: 'test.txt',
        line_number: 100,
        content_to_insert: 'nope',
      });
      expect((result as any).success).toBe(false);
    });
  });

  describe('delete_lines_in_file', () => {
    test('should delete single line', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('line1\nline2\nline3'));
      const result = await tool?.implementation({ file_name: 'test.txt', start_line: 2 });
      expect((result as any).success).toBe(true);
    });

    test('should delete line range', async () => {
      const tool = tools?.find(t => t.name === 'delete_lines_in_file');
      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from('line1\nline2\nline3\nline4'));
      const result = await tool?.implementation({
        file_name: 'test.txt',
        start_line: 2,
        end_line: 3,
      });
      expect((result as any).success).toBe(true);
    });
  });

  describe('make_directory', () => {
    test('should create directory', async () => {
      const tool = tools?.find(t => t.name === 'make_directory');
      const result = await tool?.implementation({ directory_name: 'newdir' });
      expect((result as any).success).toBe(true);
    });

    test('should handle error', async () => {
      const tool = tools?.find(t => t.name === 'make_directory');
      (mockFs.promises.mkdir as jest.Mock).mockImplementationOnce(() => { throw new Error('EEXIST'); });
      const result = await tool?.implementation({ directory_name: 'existing' });
      expect((result as any).success).toBe(false);
    });
  });

  describe('delete_path', () => {
    test('should delete file', async () => {
      const tool = tools?.find(t => t.name === 'delete_path');
      mockFs.statSync.mockReturnValueOnce({ isDirectory: () => false, isFile: () => true } as fs.Stats);
      const result = await tool?.implementation({ path: 'file.txt' });
      expect((result as any).success).toBe(true);
    });

    test('should delete directory recursively', async () => {
      const tool = tools?.find(t => t.name === 'delete_path');
      mockFs.statSync.mockReturnValueOnce({ isDirectory: () => true, isFile: () => false } as fs.Stats);
      const result = await tool?.implementation({ path: 'dir' });
      expect((result as any).success).toBe(true);
    });
  });

  describe('delete_files_by_pattern', () => {
    test('should delete matching files', async () => {
      const tool = tools?.find(t => t.name === 'delete_files_by_pattern');
      mockFs.readdirSync.mockReturnValueOnce(['test.log', 'app.log', 'index.ts']);
      const result = await tool?.implementation({ pattern: '\\.log$' });
      expect((result as any).success).toBe(true);
    });
  });

  describe('change_directory', () => {
    test('should change directory', async () => {
      const tool = tools?.find(t => t.name === 'change_directory');
      (fs.promises.stat as jest.Mock).mockResolvedValueOnce({ isDirectory: () => true } as fs.Stats);
      const result = await tool?.implementation({ directory: '/test/dir' });
      expect((result as any).success).toBe(true);
    });

    test('should reject non-directory path', async () => {
      const tool = tools?.find(t => t.name === 'change_directory');
      (fs.promises.stat as jest.Mock).mockResolvedValueOnce({ isDirectory: () => false } as fs.Stats);
      const result = await tool?.implementation({ directory: '/test/file.txt' });
      expect((result as any).success).toBe(false);
    });
  });

  describe('get_file_metadata', () => {
    test('should return file stats', async () => {
      const tool = tools?.find(t => t.name === 'get_file_metadata');
      mockFs.statSync.mockReturnValueOnce({
        size: 1024,
        birthtime: new Date('2024-01-01'),
        mtime: new Date('2024-06-01'),
        atime: new Date('2024-06-10'),
        isDirectory: () => false,
        isFile: () => true,
      } as fs.Stats);
      const result = await tool?.implementation({ path: 'test.txt' });
      expect((result as any).success).toBe(true);
    });
  });

  describe('find_files', () => {
    test('should find files by pattern', async () => {
      const tool = tools?.find(t => t.name === 'find_files');
      const result = await tool?.implementation({ pattern: 'test', max_depth: 5 });
      expect((result as any).success).toBe(true);
    });
  });

  describe('fuzzy_find_local_files', () => {
    test('should search with fuzzy matching', async () => {
      const tool = tools?.find(t => t.name === 'fuzzy_find_local_files');
      const result = await tool?.implementation({ query: 'config', max_results: 5 });
      expect((result as any).success).toBe(true);
    });
  });
});
