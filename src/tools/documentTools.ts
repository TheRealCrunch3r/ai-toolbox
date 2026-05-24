import type { Tool, FileHandle } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as path from 'path';
import * as fs from 'fs';
import type { PluginConfig } from '../config.js';
import { getAttachment } from '../attachmentManager';

// ==================== Typed Params Interfaces ====================

interface ReadDocumentParams {
  file_path: string;
}

// ==================== Helper Functions ====================

/** Validate file exists on disk */
function validateFile(filePath: string): { valid: boolean; error?: string } {
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: `File not found on disk: ${filePath}` };
  }
  
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    return { valid: false, error: `Path "${filePath}" is not a file` };
  }
  
  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (stat.size > maxSize) {
    return { valid: false, error: `File too large (${(stat.size / 1024 / 1024).toFixed(1)}MB), max is 50MB` };
  }
  
  return { valid: true };
}

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: `Document reading failed: ${message}` };
}

// ==================== Tool Implementations ====================

/**
 * Read content from PDF or DOCX files.
 * Supports both disk paths and attached files (by filename).
 */
async function readDocument({ file_path }: ReadDocumentParams): Promise<unknown> {
  try {
    // 1. Check if it's an attached file
    const attachment = getAttachment(file_path);
    if (attachment) {
      console.log(`[AI Toolbox] Reading attached file: ${file_path}`);
      const buffer = await attachment.read();
      const ext = path.extname(file_path).toLowerCase();
      
      if (ext === '.pdf') {
        return await readPDFFromBuffer(buffer, file_path);
      } else if (ext === '.docx') {
        return await readDOCXFromBuffer(buffer, file_path);
      } else if (ext === '.txt') {
        return await readTXTFromBuffer(buffer, file_path);
      } else {
        return { 
          success: false, 
          error: `Unsupported attached file format: ${ext}. Only .pdf, .docx, and .txt are supported.` 
        };
      }
    }

    // 2. Fall back to disk path
    const validation = validateFile(file_path);
    if (!validation.valid) {
      // Provide helpful error if it looked like a filename
      return { 
        success: false, 
        error: `${validation.error}\n\nNote: If this is an attached file, use the exact filename from the "ATTACHED FILES AVAILABLE" list.` 
      };
    }

    const ext = path.extname(file_path).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return await readPDF(file_path);
      case '.docx':
        return await readDOCX(file_path);
      case '.txt': {
        const text = fs.readFileSync(file_path, 'utf-8');
        return {
          success: true,
          data: {
            file_path: file_path,
            format: 'TXT',
            word_count: text.split(/\s+/).filter(w => w.length > 0).length,
            size: `${(fs.statSync(file_path).size / 1024).toFixed(1)} KB`,
            text_preview: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
            full_text: text,
          },
        };
      }
      default:
        return { 
          success: false, 
          error: `Unsupported file format: ${ext}. Only .pdf, .docx, and .txt are supported.` 
        };
    }
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Read PDF content from disk path.
 */
async function readPDF(filePath: string): Promise<unknown> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    
    console.log(`[AI Toolbox] Reading PDF from disk: ${filePath}`);
    
    const dataBuffer = fs.readFileSync(filePath);
    const result = await pdfParse(dataBuffer);
    
    console.log(`[AI Toolbox] PDF read complete: ${result.numpages} pages, ${(result.text.length / 1024).toFixed(1)}KB`);
    
    return {
      success: true,
      data: {
        file_path: filePath,
        format: 'PDF',
        pages: result.numpages,
        word_count: result.text.split(/\s+/).filter(w => w.length > 0).length,
        size: `${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`,
        text_preview: result.text.substring(0, 500) + (result.text.length > 500 ? '...' : ''),
        full_text: result.text,
      },
    };
  } catch (error) {
    throw new Error(`PDF reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Read PDF content from buffer (for attachments).
 */
async function readPDFFromBuffer(buffer: Buffer, fileName: string): Promise<unknown> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    
    console.log(`[AI Toolbox] Reading PDF from attachment: ${fileName}`);
    
    const result = await pdfParse(buffer);
    
    console.log(`[AI Toolbox] PDF read complete: ${result.numpages} pages, ${(result.text.length / 1024).toFixed(1)}KB`);
    
    return {
      success: true,
      data: {
        file_path: fileName,
        format: 'PDF',
        pages: result.numpages,
        word_count: result.text.split(/\s+/).filter(w => w.length > 0).length,
        size: `${(buffer.length / 1024).toFixed(1)} KB`,
        text_preview: result.text.substring(0, 500) + (result.text.length > 500 ? '...' : ''),
        full_text: result.text,
        source: 'attachment',
      },
    };
  } catch (error) {
    throw new Error(`PDF reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Read DOCX content from disk path.
 */
async function readDOCX(filePath: string): Promise<unknown> {
  try {
    const mammoth = await import('mammoth');
    
    console.log(`[AI Toolbox] Reading DOCX from disk: ${filePath}`);
    
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    
    const text = result.value;
    const warnings = result.messages.map(m => m.message).join('\n');
    
    console.log(`[AI Toolbox] DOCX read complete: ${(text.length / 1024).toFixed(1)}KB`);
    
    return {
      success: true,
      data: {
        file_path: filePath,
        format: 'DOCX',
        word_count: text.split(/\s+/).filter(w => w.length > 0).length,
        size: `${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`,
        text_preview: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        full_text: text,
        warnings: warnings || undefined,
      },
    };
  } catch (error) {
    throw new Error(`DOCX reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Read DOCX content from buffer (for attachments).
 */
async function readDOCXFromBuffer(buffer: Buffer, fileName: string): Promise<unknown> {
  try {
    const mammoth = await import('mammoth');
    
    console.log(`[AI Toolbox] Reading DOCX from attachment: ${fileName}`);
    
    const result = await mammoth.extractRawText({ buffer });
    
    const text = result.value;
    const warnings = result.messages.map(m => m.message).join('\n');
    
    console.log(`[AI Toolbox] DOCX read complete: ${(text.length / 1024).toFixed(1)}KB`);
    
    return {
      success: true,
      data: {
        file_path: fileName,
        format: 'DOCX',
        word_count: text.split(/\s+/).filter(w => w.length > 0).length,
        size: `${(buffer.length / 1024).toFixed(1)} KB`,
        text_preview: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        full_text: text,
        warnings: warnings || undefined,
        source: 'attachment',
      },
    };
  } catch (error) {
    throw new Error(`DOCX reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Read TXT content from buffer (for attachments).
 */
async function readTXTFromBuffer(buffer: Buffer, fileName: string): Promise<unknown> {
  try {
    console.log(`[AI Toolbox] Reading TXT from attachment: ${fileName}`);
    
    const text = buffer.toString('utf-8');
    
    console.log(`[AI Toolbox] TXT read complete: ${(text.length / 1024).toFixed(1)}KB`);
    
    return {
      success: true,
      data: {
        file_path: fileName,
        format: 'TXT',
        word_count: text.split(/\s+/).filter(w => w.length > 0).length,
        size: `${(buffer.length / 1024).toFixed(1)} KB`,
        text_preview: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        full_text: text,
        source: 'attachment',
      },
    };
  } catch (error) {
    throw new Error(`TXT reading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// ==================== Tool Registration ====================

export function registerDocumentTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // read_document tool
  tools.push(tool({
    name: 'read_document',
    description: 'Read content from PDF, DOCX, or TXT files. Supports both disk paths and attached files (use filename for attachments).',
    parameters: {
      file_path: z.string().describe('Path to the PDF, DOCX, or TXT file, or the filename if it is an attached file'),
    },
    implementation: async (params) => readDocument(params as ReadDocumentParams),
  }));

  return tools;
}
