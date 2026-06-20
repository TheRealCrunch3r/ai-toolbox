// External library types (Tesseract.js, sharp) have implicit any — eslint-disable below
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { PluginConfig } from '../config.js';

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

/** Validate image file exists and is within size limits */
function validateImageFile(imagePath: string, maxSizeBytes: number = 50 * 1024 * 1024): {
  valid: boolean;
  error?: string;
} {
  // Check if path exists
  if (!fs.existsSync(imagePath)) {
    return { valid: false, error: `Image file not found: ${imagePath}` };
  }

  const stat = fs.statSync(imagePath);
  
  // Verify it's a file (not directory)
  if (!stat.isFile()) {
    return { valid: false, error: `Path is not a file: ${imagePath}` };
  }

  // Check size limit
  if (stat.size > maxSizeBytes) {
    return { valid: false, error: `Image exceeds maximum size of ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB` };
  }

  // Validate extension
  const ext = path.extname(imagePath).toLowerCase();
  const validExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp'];
  if (!validExtensions.includes(ext)) {
    return { valid: false, error: `Unsupported image format: ${ext}. Supported: ${validExtensions.join(', ')}` };
  }

  return { valid: true };
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
    const validation = validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };

    // Get basic metadata
    const stat = fs.statSync(imagePath);
    const dimensions = getImageDimensions(imagePath);
    const ext = path.extname(imagePath).toLowerCase();

    // Import Tesseract.js dynamically
    // eslint-disable-next-line @typescript-eslint/no-require-imports
const Tesseract = require('tesseract.js');

    console.log(`[AI Toolbox] Starting OCR on ${imagePath} with language '${language}'...`);

    // Perform OCR with progress tracking
     
const result = await Tesseract.recognize(imagePath, language, {
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
          path: imagePath,
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
    const validation = validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };

    const stat = fs.statSync(imagePath);
    const dimensions = getImageDimensions(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    
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
        path: imagePath,
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
      const proc = spawn(cmd, args, { shell: platform === 'win32' });
      
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
    // Validate both files
    const validation1 = validateImageFile(image1Path);
    if (!validation1.valid) return { success: false, error: validation1.error };
    
    const validation2 = validateImageFile(image2Path);
    if (!validation2.valid) return { success: false, error: validation2.error };

    // Read both images
    const buffer1 = fs.readFileSync(image1Path);
    const buffer2 = fs.readFileSync(image2Path);

    // Get dimensions
    const dims1 = getImageDimensions(image1Path);
    const dims2 = getImageDimensions(image2Path);

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
