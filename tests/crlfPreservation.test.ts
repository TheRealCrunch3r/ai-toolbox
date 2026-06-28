/**
 * Automated tests for CRLF line ending preservation across all file-modifying tools
 */

import * as fs from 'fs';
import * as path from 'path';
import { registerFileSystemTools } from '../src/tools/fileSystemTools';
import { registerTextProcessingTools } from '../src/tools/textProcessingTools';
import { registerLineOperationsTools } from '../src/tools/lineOperations';
import { DEFAULT_CONFIG } from '../src/config';
import { StateManager } from '../src/stateManager';

// Mock security and workingDir
jest.mock('../src/security', () => ({
  validatePath: jest.fn().mockReturnValue(true),
  isSafeRegex: jest.fn().mockReturnValue(true),
}));

jest.mock('../src/workingDir', () => ({
  getWorkingDir: jest.fn().mockReturnValue('/test/working/dir'),
  setWorkingDir: jest.fn().mockReturnValue(true),
  resolvePath: jest.fn((p: string) => p), // Return absolute paths as-is (matches real path.resolve behavior)
}));

jest.mock('../src/performanceUtils', () => ({
  levenshteinSimilarity: jest.fn().mockReturnValue(0.8),
  getCachedFuzzyResults: jest.fn().mockReturnValue(null),
  cacheFuzzyResults: jest.fn(),
  findFilesAsync: jest.fn().mockResolvedValue({ files: ['/test/file.ts'], count: 1 }),
  countTypeScriptFiles: jest.fn().mockResolvedValue(5),
  getAnalysisTimeout: jest.fn().mockReturnValue(30000),
}));

describe('CRLF Line Ending Preservation', () => {
  let stateManager: StateManager;
  let fsTools: ReturnType<typeof registerFileSystemTools>;
  let textTools: ReturnType<typeof registerTextProcessingTools>;
  let lineTools: ReturnType<typeof registerLineOperationsTools>;
  let tempDir: string;
  let testFile: string;

  const crlfContent = 'Line 1\r\nLine 2\r\nLine 3\r\nLine 4\r\nLine 5';

  beforeEach(() => {
    jest.clearAllMocks();
    stateManager = new StateManager(DEFAULT_CONFIG);
    fsTools = registerFileSystemTools(DEFAULT_CONFIG, stateManager);
    textTools = registerTextProcessingTools(DEFAULT_CONFIG);
    lineTools = registerLineOperationsTools(DEFAULT_CONFIG);

    // Create temp directory and test file
    tempDir = path.join(__dirname, '..', 'test_crlf_temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    testFile = path.join(tempDir, 'test.txt');
    fs.writeFileSync(testFile, crlfContent, 'utf-8');
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Helper to check if file has CRLF endings
  const hasCRLF = (filePath: string): boolean => {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes('\r\n');
  };

  // Helper to count CRLF occurrences
  const countCRLF = (filePath: string): number => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.match(/\r\n/g);
    return matches ? matches.length : 0;
  };

  describe('fileSystemTools', () => {
    test('replace_text_in_file should preserve CRLF', async () => {
      const tool = fsTools?.find(t => t.name === 'replace_text_in_file');
      await tool?.implementation({
        file_name: testFile,
        old_string: 'Line 2',
        new_string: 'Line 2 Modified',
      });

      expect(hasCRLF(testFile)).toBe(true);
      expect(countCRLF(testFile)).toBe(4);
    });

    test('insert_at_line should preserve CRLF', async () => {
      const tool = fsTools?.find(t => t.name === 'insert_at_line');
      await tool?.implementation({
        file_name: testFile,
        line_number: 3,
        content_to_insert: 'Inserted Line',
      });

      expect(hasCRLF(testFile)).toBe(true);
      expect(countCRLF(testFile)).toBe(5); // Original 4 + 1 inserted line
    });

    test('delete_lines_in_file should preserve CRLF', async () => {
      const tool = fsTools?.find(t => t.name === 'delete_lines_in_file');
      await tool?.implementation({
        file_name: testFile,
        start_line: 3,
        end_line: 3,
      });

      expect(hasCRLF(testFile)).toBe(true);
      expect(countCRLF(testFile)).toBe(3); // Original 4 - 1 deleted line
    });

    test('append_file should preserve existing CRLF', async () => {
      const tool = fsTools?.find(t => t.name === 'append_file');
      await tool?.implementation({
        file_name: testFile,
        content: 'Appended Line',
      });

      expect(hasCRLF(testFile)).toBe(true);
      // Note: append_file does not add a newline before appending, so CRLF count remains the same
      expect(countCRLF(testFile)).toBe(4);
    });
  });

  describe('textProcessingTools', () => {
    test('text_transform should preserve CRLF', async () => {
      const tool = textTools?.find(t => t.name === 'text_transform');
      await tool?.implementation({
        file_name: testFile,
        pattern: 'Line',
        replacement: 'Line',
        flags: 'g',
      });

      expect(hasCRLF(testFile)).toBe(true);
      expect(countCRLF(testFile)).toBe(4);
    });

    test('line_operations should preserve CRLF', async () => {
      const tool = textTools?.find(t => t.name === 'line_operations');
      await tool?.implementation({
        file_name: testFile,
        operation: 'move',
        move_from: 1,
        move_to: 5,
      });

      expect(hasCRLF(testFile)).toBe(true);
      expect(countCRLF(testFile)).toBe(4);
    });
  });

  describe('lineOperations', () => {
    test('delete_lines should preserve CRLF', async () => {
      const tool = lineTools?.find(t => t.name === 'delete_lines');
      await tool?.implementation({
        file_name: testFile,
        start_line: 2,
        end_line: 2,
      });

      expect(hasCRLF(testFile)).toBe(true);
      expect(countCRLF(testFile)).toBe(3); // Original 4 - 1 deleted line
    });
  });
});
