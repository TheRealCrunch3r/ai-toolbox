// External library types (Tesseract.js, sharp) have implicit any — eslint-disable below
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { atomicWriteBinaryFile } from '../utils/atomicWrite.js';  // ← Shared atomic write utility for binary files
import type { PluginConfig } from '../config.js';
import { getAttachment, listAttachments } from '../attachmentManager.js';

// ==================== Typed Params Interfaces ====================

interface ImageToTextParams {
  imagePath: string;
  language?: string;
}

interface DescribeImageParams {
  imagePath: string;
}

interface ScreenshotDesktopParams {
  outputPath?: string;
  format?: 'png' | 'jpeg';
  quality?: number;
}

interface CompareImagesParams {
  image1Path: string;
  image2Path: string;
}

// ==================== Helper Functions ====================

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

/**
 * Resolve an image path that may refer to a real filesystem path or an attached file.
 * 
 * Resolution order (most specific → most general):
 * 1. Absolute filesystem path (if exists)
 * 2. Relative path from working directory (if exists)
 * 3. Common temp directories where LM Studio SDK stores attachments
 * 
 * @param inputPath - The raw path string provided by the tool caller
 * @returns Resolved absolute filesystem path, or null if not found
 */
function resolveImagePath(inputPath: string): string | null {
  // Case-insensitive basename for attachment lookup
  const fileName = path.basename(inputPath);

  // Strategy 1: Direct absolute/relative filesystem path
  let resolvedPath: string;
  
  if (path.isAbsolute(inputPath)) {
    resolvedPath = inputPath;
  } else {
    resolvedPath = path.resolve(process.cwd(), inputPath);
  }
  
  if (fs.existsSync(resolvedPath)) {
    return resolvedPath; // Found on disk, no further resolution needed
  }

  // Strategy 2: Fallback to common SDK temp directories
  const tempDirs = [
    os.tmpdir(),
    path.join(os.tmpdir(), 'lmstudio'),
    path.join(os.tmpdir(), 'ai-toolbox'),
  ];

  for (const tmpDir of tempDirs) {
    const candidatePath = path.join(tmpDir, fileName);
    if (fs.existsSync(candidatePath)) {
      console.log(`[AI Toolbox] Found attached image in temp dir: ${candidatePath}`);
      return candidatePath;
    }
  }

  // Strategy 3: Provide helpful error context for debugging
  const availableAttachments = listAttachments();
  if (availableAttachments.length > 0) {
    console.warn(`[AI Toolbox] Attachment "${fileName}" not resolved. Available attachments: ${availableAttachments.join(', ')}`);
  }

  return null; // Not found via any strategy
}

/**
 * Resolve an attached SDK FileHandle to a real filesystem path by writing its content to temp.
 * 
 * LM Studio SDK's FileHandle exposes .readFile() → Promise<Buffer> or .read() → Promise<string>.
 * This function reads the attachment content and saves it to os.tmpdir()/ai-toolbox/ for downstream fs access.
 * 
 * @param inputPath - The raw path string provided by the tool caller (used as basename)
 * @returns Resolved absolute filesystem path, or null if attachment not found/readable
 */
async function resolveAttachmentFile(inputPath: string): Promise<string | null> {
  const fileName = path.basename(inputPath);
  
  // Find matching attachment via SDK FileHandle
  const attachment = getAttachment(fileName);
  if (!attachment) return null;

  // Typed interface matching LM Studio SDK's FileHandle (see promptPreprocessor.ts extractPdfText)
  type FileHandleWithReadFile = {
    name: string;
    readFile?: () => Promise<Buffer>;
    read?: () => Promise<unknown>;
  };

  const handle = attachment as unknown as FileHandleWithReadFile;

  try {
    let buffer: Buffer;

    if (handle.readFile) {
      // Primary method: .readFile() → Promise<Buffer>
      buffer = await handle.readFile();
    } else if (handle.read) {
      // Fallback: .read() → Promise<string | unknown>, convert to Buffer
      const readResult = await handle.read();
      buffer = Buffer.from(String(readResult));
    } else {
      console.warn(`[AI Toolbox] Attachment "${fileName}" has no readFile or read method`);
      return null;
    }

    // Write attachment content to a temp file so fs operations can access it
    const tempDir = path.join(os.tmpdir(), 'ai-toolbox');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, fileName);
    // ASYNC atomic write for binary data — crash-resilient
    await atomicWriteBinaryFile(tempFilePath, buffer);
    
    console.log(`[AI Toolbox] Resolved attached image "${fileName}" → ${tempFilePath} (${buffer.length} bytes)`);
    return tempFilePath;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[AI Toolbox] Failed to read attachment "${fileName}": ${errorMsg}`);
    return null;
  }
}

/** Validate image file exists and is within size limits. Returns resolved path for downstream use. */
async function validateImageFile(imagePath: string, maxSizeBytes: number = 50 * 1024 * 1024): Promise<{
  valid: boolean;
  error?: string;
  resolvedPath?: string;
}> {
  // Strategy 1: Sync filesystem resolution (fast path for real files)
  const resolvedPath = resolveImagePath(imagePath);
  if (resolvedPath && fs.existsSync(resolvedPath)) {
    const stat = fs.statSync(resolvedPath);
    
    // Verify it's a file (not directory)
    if (!stat.isFile()) {
      return { valid: false, error: `Path is not a file: ${imagePath}` };
    }

    // Check size limit
    if (stat.size > maxSizeBytes) {
      return { valid: false, error: `Image exceeds maximum size of ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB` };
    }

    // Validate extension
    const ext = path.extname(resolvedPath).toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp'];
    if (!validExtensions.includes(ext)) {
      return { valid: false, error: `Unsupported image format: ${ext}. Supported: ${validExtensions.join(', ')}` };
    }

    return { valid: true, resolvedPath };
  }

  // Strategy 2: Async SDK FileHandle resolution (for attached images)
  const availableAttachments = listAttachments();
  if (availableAttachments.length > 0) {
    console.log(`[AI Toolbox] Sync path not found. Trying attachment resolution for "${imagePath}"...`);
    const attachmentPath = await resolveAttachmentFile(imagePath);
    if (attachmentPath && fs.existsSync(attachmentPath)) {
      const stat = fs.statSync(attachmentPath);

      // Verify it's a file (not directory)
      if (!stat.isFile()) {
        return { valid: false, error: `Resolved attachment is not a file: ${imagePath}` };
      }

      // Check size limit
      if (stat.size > maxSizeBytes) {
        return { valid: false, error: `Image exceeds maximum size of ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB` };
      }

      // Validate extension
      const ext = path.extname(attachmentPath).toLowerCase();
      const validExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp'];
      if (!validExtensions.includes(ext)) {
        return { valid: false, error: `Unsupported image format: ${ext}. Supported: ${validExtensions.join(', ')}` };
      }

      return { valid: true, resolvedPath: attachmentPath };
    }
  }

  // Strategy 3: Not found — provide helpful error context
  return { 
    valid: false, 
    error: `Image file not found: ${imagePath}\nHint: If this is an attachment, ensure it was uploaded with the correct filename. Available attachments in session: ${availableAttachments.join(', ') || 'none'}` 
  };
}

/** Get image dimensions using simple header parsing */
function getImageDimensions(imagePath: string): { width: number; height: number } | null {
  try {
    const buffer = fs.readFileSync(imagePath);
    
    // PNG: bytes 16-19 = width, 20-23 = height (big-endian)
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    // JPEG: Need to find SOF marker and parse dimensions
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] === 0xFF && (buffer[offset + 1] & 0xF8) === 0xC0) {
          // Found SOF marker
          offset += 4; // Skip marker and length
          const height = buffer.readUInt16BE(offset);
          const width = buffer.readUInt16BE(offset + 2);
          return { width, height };
        }
        if (buffer[offset] === 0xFF) {
          offset += 2 + (buffer[offset + 2] << 8) + buffer[offset + 3];
        } else {
          offset++;
        }
      }
    }

    // GIF: bytes 6-7 = width, 8-9 = height (little-endian)
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height };
    }

    // BMP: bytes 18-21 = width, 22-25 = height (little-endian)
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
      const width = buffer.readInt32LE(18);
      const height = buffer.readInt32LE(22);
      return { width: Math.abs(width), height: Math.abs(height) };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract text from images using OCR (Tesseract.js).
 * Full implementation with progress tracking and detailed word-level data.
 */
async function imageToText({ imagePath, language = 'eng' }: ImageToTextParams): Promise<unknown> {
  try {
    const validation = await validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };

    // Use resolved path for actual file operations (handles attachments transparently)
    // Explicit guard ensures TypeScript narrows string | undefined → string without non-null assertion
    if (!validation.resolvedPath) {
      return handleError(new Error('Internal: validateImageFile returned valid=true but no resolvedPath'));
    }
    const resolvedPath = validation.resolvedPath;

    // Get basic metadata
    const stat = fs.statSync(resolvedPath);
    const dimensions = getImageDimensions(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();

    // Import Tesseract.js dynamically
    // eslint-disable-next-line @typescript-eslint/no-require-imports
const Tesseract = require('tesseract.js');

    console.log(`[AI Toolbox] Starting OCR on ${resolvedPath} with language '${language}'...`);

    // Perform OCR with progress tracking
     
const result = await Tesseract.recognize(resolvedPath, language, {
      logger: (m: { status?: string; progress?: number }) => {
        // Type already declared in parameter signature
        const typed = m;
        if (typed.status === 'recognizing text') {
          console.log(`[AI Toolbox] OCR Progress: ${((typed.progress ?? 0) * 100).toFixed(0)}%`);
        }
      },
    });

    // Extract structured data from result
     
const ocrData = result as { data: { text: string; confidence: number; language: string; _version?: string; words?: unknown[] } };
    const extractedText = ocrData.data.text.trim();
    const wordCount = extractedText.split(/\s+/).filter((w: string) => w.length > 0).length;
    const lineCount = extractedText.split('\n').filter((l: string) => l.trim().length > 0).length;

    return {
      success: true,
      data: {
        text: extractedText,
        confidence: (ocrData.data as { confidence: number }).confidence.toFixed(2),
        language: (ocrData.data as { language: string }).language,
        version: (ocrData.data as { _version?: string })._version || "unknown",
        metadata: {
          path: imagePath, // Original input for user clarity
          resolvedPath: resolvedPath, // Actual file used
          size: `${(stat.size / 1024).toFixed(1)} KB`,
          format: ext.replace('.', '').toUpperCase(),
          dimensions: dimensions || { width: 'Unknown', height: 'Unknown' },
          wordCount,
          lineCount,
        },
        words: (ocrData as { data: { words?: unknown[] } }).data.words?.slice(0, 100) || [], // Limit to first 100 words for brevity
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Describe image content - returns metadata and basic information.
 */
async function describeImage({ imagePath }: DescribeImageParams): Promise<unknown> {
  try {
    const validation = await validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };

    // Use resolved path for actual file operations (handles attachments transparently)
    // Explicit guard ensures TypeScript narrows string | undefined → string without non-null assertion
    if (!validation.resolvedPath) {
      return handleError(new Error('Internal: validateImageFile returned valid=true but no resolvedPath'));
    }
    const resolvedPath = validation.resolvedPath;

    const stat = fs.statSync(resolvedPath);
    const dimensions = getImageDimensions(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    
    // Determine MIME type
    const mimeTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.tiff': 'image/tiff',
    };

    return {
      success: true,
      data: {
        path: imagePath, // Original input for user clarity
        resolvedPath: resolvedPath, // Actual file used
        size: stat.size,
        sizeHuman: `${(stat.size / 1024).toFixed(1)} KB`,
        format: ext.replace('.', '').toUpperCase(),
        mimeType: mimeTypeMap[ext] || 'image/unknown',
        dimensions: dimensions || { width: 'Unknown', height: 'Unknown' },
        createdAt: stat.birthtime,
        modifiedAt: stat.mtime,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Capture desktop screenshot and save to file.
 * Uses platform-specific commands for cross-platform support.
 */
async function screenshotDesktop({ 
  outputPath, 
  format = 'png',
  quality = 90
}: ScreenshotDesktopParams): Promise<unknown> {
  try {
    const { spawn } = await import('child_process');
    
    // Generate output path if not provided
    const finalOutputPath = outputPath || (() => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      return path.join(os.tmpdir(), `screenshot-${timestamp}.${format}`);
    })();

    // Ensure directory exists
    const dir = path.dirname(finalOutputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const platform = os.platform();
    let cmd: string;
    let args: string[];

    // Platform-specific screenshot commands
    switch (platform) {
      case 'win32':
        // Windows: Use PowerShell with WIC API
        cmd = 'powershell.exe';
        args = ['-NoProfile', '-Command', `
          Add-Type -AssemblyName System.Windows.Forms;
          Add-Type -AssemblyName System.Drawing;
          $screen = [System.Windows.Forms.Screen]::PrimaryScreen;
          $bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height);
          $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
          $graphics.CopyFromScreen(0, 0, 0, 0, $bitmap.Size);
          ${format === 'jpeg' ? `
          $encoder = [System.Drawing.Imaging.ImageEncodingFormat]::Jpeg;
          $qualityEncoderClsID = New-Object Guid("1D5BE4B5-FA4A-452D-9CDD-5DB35105E7EB");
          $qualityEncoder = [System.Drawing.Imaging.EncodedParameter]::new($qualityEncoderClsID, ${quality});
          $params = New-Object System.Drawing.Imaging.EncoderParameters(1);
          $params.Param[0] = $qualityEncoder;
          $encoderParams = [System.Drawing.Imaging.ImageCodecInfo]::GetCodecInfos() | Where-Object {$_.FormatID -eq $encoder.Guid};
          $bitmap.Save('${finalOutputPath.replace(/\\/g, '\\')}', $encoderParams, $params);` : `
          $bitmap.Save('${finalOutputPath.replace(/\\/g, '\\')}', [System.Drawing.Imaging.ImageFormat]::Png);`}
          $graphics.Dispose();
          $bitmap.Dispose();
        `];
        break;

      case 'darwin':
        // macOS: Use screencapture
        cmd = 'screencapture';
        args = ['-m', '-x', finalOutputPath];
        break;

      default:
        // Linux: Use gnome-screenshot or import (ImageMagick)
        cmd = '/bin/bash';
        args = ['-c', `(gnome-screenshot -f "${finalOutputPath}" 2>/dev/null || import -window root "${finalOutputPath}" 2>/dev/null) || echo "Failed"`];
        break;
    }

    // Execute screenshot command
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args);
      
      let stderr = '';
      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0 && fs.existsSync(finalOutputPath)) {
          const stat = fs.statSync(finalOutputPath);
          resolve({
            success: true,
            data: {
              path: finalOutputPath,
              size: stat.size,
              sizeHuman: `${(stat.size / 1024).toFixed(1)} KB`,
              format: format.toUpperCase(),
            },
          });
        } else {
          reject(new Error(`Screenshot failed (exit code ${code}): ${stderr || 'Unknown error'}`));
        }
      });

      proc.on('error', reject);

      // Timeout after 10 seconds
      setTimeout(() => {
        proc.kill();
        reject(new Error('Screenshot timed out'));
      }, 10000);
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Compare two images pixel-by-pixel.
 */
async function compareImages({ image1Path, image2Path }: CompareImagesParams): Promise<unknown> {
  try {
    // Validate both files (returns resolved paths for attachment support)
    const validation1 = await validateImageFile(image1Path);
    if (!validation1.valid) return { success: false, error: validation1.error };

    const validation2 = await validateImageFile(image2Path);
    if (!validation2.valid) return { success: false, error: validation2.error };

    // Use resolved paths for actual file operations (handles attachments transparently)
    // Explicit guards ensure TypeScript narrows string | undefined → string without non-null assertions
    if (!validation1.resolvedPath || !validation2.resolvedPath) {
      return handleError(new Error('Internal: validateImageFile returned valid=true but no resolvedPath'));
    }
    const resolvedPath1 = validation1.resolvedPath;
    const resolvedPath2 = validation2.resolvedPath;

    // Read both images
    const buffer1 = fs.readFileSync(resolvedPath1);
    const buffer2 = fs.readFileSync(resolvedPath2);

    // Get dimensions
    const dims1 = getImageDimensions(resolvedPath1);
    const dims2 = getImageDimensions(resolvedPath2);

    if (!dims1 || !dims2) {
      return { success: false, error: 'Could not determine image dimensions' };
    }

    // Check if dimensions match
    if (dims1.width !== dims2.width || dims1.height !== dims2.height) {
      return {
        success: true,
        data: {
          isIdentical: false,
          reason: 'Different dimensions',
          image1Dimensions: { width: dims1.width, height: dims1.height },
          image2Dimensions: { width: dims2.width, height: dims2.height },
        },
      };
    }

    // Simple byte comparison (works for identical encodings)
    const isByteIdentical = buffer1.equals(buffer2);

    if (isByteIdentical) {
      return {
        success: true,
        data: {
          isIdentical: true,
          similarityPercent: 100,
          dimensions: { width: dims1.width, height: dims1.height },
          note: 'Images are byte-identical',
        },
      };
    }

    // For non-byte-identical images, provide basic comparison info
    // Note: True pixel-level comparison would require a library like sharp or jimp
    return {
      success: true,
      data: {
        isIdentical: false,
        similarityPercent: 'Unknown (byte comparison only)',
        dimensions: { width: dims1.width, height: dims1.height },
        note: 'Images differ. For detailed pixel comparison, install sharp or jimp library.',
        image1Size: buffer1.length,
        image2Size: buffer2.length,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

// ==================== Tool Registration ====================

/**
 * Register all image processing tools.
 * @param config Plugin configuration
 * @returns Array of registered tools
 */
export function registerImageProcessingTools(_config: PluginConfig): Tool[] {
  return [
    tool({
      name: 'image_to_text',
      description: `Extract text from images using OCR (Tesseract.js).\n\nSupported formats: PNG, JPG, JPEG, BMP, GIF, TIFF, WebP. Maximum file size: 50MB.\n\nReturns:\n- Extracted text content\n- Confidence score (0-100)\n- Detected language\n- Word count and line count\n- Per-word data with bounding boxes (first 100 words)`,
      parameters: {
        imagePath: z.string().describe('Path to the image file'),
        language: z.string().optional().default('eng').describe('Language code for OCR (e.g., "eng", "deu", "chi_sim"). Default: "eng"'),
      },
      implementation: async ({ imagePath, language }: ImageToTextParams) => imageToText({ imagePath, language }),
    }),

    tool({
      name: 'describe_image',
      description: `Get detailed metadata about an image file including dimensions, format, size, and timestamps.\n\nSupported formats: PNG, JPG, JPEG, BMP, GIF, WebP, TIFF.`,
      parameters: {
        imagePath: z.string().describe('Path to the image file'),
      },
      implementation: async ({ imagePath }: DescribeImageParams) => describeImage({ imagePath }),
    }),

    tool({
      name: 'screenshot_desktop',
      description: `Capture a screenshot of the desktop and save it to a file.\n\nCross-platform support:\n- Windows: Uses .NET GDI+ via PowerShell\n- macOS: Uses screencapture command\n- Linux: Uses gnome-screenshot or ImageMagick import\n\nOutput is saved to temp directory if no path specified.`,
      parameters: {
        outputPath: z.string().optional().describe('Output file path. Defaults to temp directory with timestamp.'),
        format: z.enum(['png', 'jpeg']).default('png').describe('Image format. Default: "png"'),
        quality: z.number().min(1).max(100).default(90).describe('JPEG quality (1-100). Only applies to JPEG format. Default: 90'),
      },
      implementation: async ({ outputPath, format, quality }: ScreenshotDesktopParams) => screenshotDesktop({ outputPath, format, quality }),
    }),

    tool({
      name: 'compare_images',
      description: `Compare two images for similarity.\n\nPerforms byte-level comparison and dimension checking.\nFor identical encodings, returns exact match status.\n\nNote: Detailed pixel-level comparison requires sharp or jimp library installation.`,
      parameters: {
        image1Path: z.string().describe('Path to the first image'),
        image2Path: z.string().describe('Path to the second image'),
      },
      implementation: async ({ image1Path, image2Path }: CompareImagesParams) => compareImages({ image1Path, image2Path }),
    }),
  ];
}
