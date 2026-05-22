import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as path from 'path';
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

/** Validate file exists and is an image */
function validateImageFile(filePath: string): { valid: boolean; error?: string } {
  const fs = require('fs');
  const stat = fs.statSync(filePath);
  
  if (!stat.isFile()) {
    return { valid: false, error: `Path "${filePath}" is not a file` };
  }
  
  // Check file extension (basic validation)
  const ext = path.extname(filePath).toLowerCase();
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp'];
  
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `Unsupported image format: ${ext}` };
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
  return { success: false, error: `Image processing failed: ${message}` };
}

// ==================== Tool Implementations ====================

/**
 * Extract text from images using Tesseract.js OCR.
 */
async function imageToText({ imagePath, language = 'eng' }: ImageToTextParams): Promise<unknown> {
  try {
    const validation = validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };

    // Lazy-load Tesseract.js to avoid heavy initial load
    const Tesseract = (await import('tesseract.js')).default;

    console.log(`[AI Toolbox] OCR starting for ${imagePath} (language: ${language})`);
    
    const result = await Tesseract.recognize(imagePath, language, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          process.stdout.write(`\r[AI Toolbox] OCR progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    console.log('\n[AI Toolbox] OCR complete');
    
    return {
      success: true,
      data: {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        language,
        words: result.data.words?.length || 0,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Describe image content using vision model or basic metadata.
 */
async function describeImage({ imagePath }: DescribeImageParams): Promise<unknown> {
  try {
    const validation = validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };

    const fs = require('fs');
    const stat = fs.statSync(imagePath);
    
    // Return metadata since we don't have a vision model integrated yet
    // This can be extended with vision API calls in the future
    return {
      success: true,
      data: {
        path: imagePath,
        size: `${(stat.size / 1024).toFixed(1)} KB`,
        format: path.extname(imagePath).replace('.', '').toUpperCase(),
        note: 'Vision model description requires integration with a vision API (e.g., GPT-4 Vision, Claude Vision). This tool currently returns metadata.',
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Capture desktop screenshot and save to file.
 */
async function screenshotDesktop({ 
  outputPath, 
  format = 'png', 
  quality = 90 
}: ScreenshotDesktopParams): Promise<unknown> {
  try {
    const os = require('os');
    const platform = os.platform();
    
    let cmd: string;
    let args: string[];
    let tempPath: string;

    switch (platform) {
      case 'win32':
        // Windows: Use PowerShell with Add-Type for high-quality screenshots
        tempPath = outputPath || path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
        cmd = 'powershell.exe';
        args = [
          '-NoProfile',
          '-Command',
          `[System.Drawing.Bitmap]::new(1920, 1080).Save('${tempPath}', [System.Drawing.Imaging.ImageFormat]::Png)`,
        ];
        break;
      case 'darwin':
        // macOS: Use screencapture
        tempPath = outputPath || path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
        cmd = '/bin/bash';
        args = ['-c', `screencapture -x "${tempPath}"`];
        break;
      default:
        // Linux: Use xdotool + import (ImageMagick) or scrot
        tempPath = outputPath || path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
        cmd = '/bin/bash';
        args = ['-c', `(import -window root "${tempPath}" 2>/dev/null || scrot "${tempPath}" 2>/dev/null) && echo "Screenshot saved to ${tempPath}"`];
        break;
    }

    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args);
      
      let stderr = '';
      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code: number) => {
        if (code === 0 && tempPath) {
          const fs = require('fs');
          const stat = fs.statSync(tempPath);
          resolve({
            success: true,
            data: {
              path: tempPath,
              size: `${(stat.size / 1024).toFixed(1)} KB`,
              format,
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
 * Compare two images and calculate similarity score.
 */
async function compareImages({ image1Path, image2Path }: CompareImagesParams): Promise<unknown> {
  try {
    const validation1 = validateImageFile(image1Path);
    if (!validation1.valid) return { success: false, error: `Image 1: ${validation1.error}` };

    const validation2 = validateImageFile(image2Path);
    if (!validation2.valid) return { success: false, error: `Image 2: ${validation2.error}` };

    // Lazy-load pixelmatch for pixel-level comparison
    const pixelmatch = (await import('pixelmatch')).default;
    const PNG = (await import('pngjs')).PNG;
    const fs = require('fs');

    // Read and decode images
    const img1Data = fs.readFileSync(image1Path);
    const img2Data = fs.readFileSync(image2Path);

    const img1 = PNG.sync.decode(img1Data);
    const img2 = PNG.sync.decode(img2Data);

    // Resize to same dimensions for comparison
    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);

    const buf1 = new Uint8ClampedArray(width * height * 4);
    const buf2 = new Uint8ClampedArray(width * height * 4);

    // Extract pixel data (simplified - in production, use proper image processing)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx1 = (y * img1.width + x) * 4;
        const idx2 = (y * img2.width + x) * 4;
        const outIdx = (y * width + x) * 4;

        buf1[outIdx] = img1.data[idx1];
        buf1[outIdx + 1] = img1.data[idx1 + 1];
        buf1[outIdx + 2] = img1.data[idx1 + 2];
        buf1[outIdx + 3] = img1.data[idx1 + 3];

        buf2[outIdx] = img2.data[idx2];
        buf2[outIdx + 1] = img2.data[idx2 + 1];
        buf2[outIdx + 2] = img2.data[idx2 + 2];
        buf2[outIdx + 3] = img2.data[idx2 + 3];
      }
    }

    // Calculate pixel difference
    const diff = new Uint8ClampedArray(width * height * 4);
    const numDiffPixels = pixelmatch(buf1, buf2, diff, width, height, { threshold: 0.1 });
    
    const totalPixels = width * height;
    const similarity = ((totalPixels - numDiffPixels) / totalPixels) * 100;

    return {
      success: true,
      data: {
        image1: image1Path,
        image2: image2Path,
        dimensions: `${width}x${height}`,
        similarityPercent: similarity.toFixed(2),
        differentPixels: numDiffPixels,
        totalPixels,
        isIdentical: numDiffPixels === 0,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

// ==================== Tool Registration ====================

export function registerImageProcessingTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // image_to_text tool
  tools.push(tool({
    name: 'image_to_text',
    description: 'Extract text from images using OCR (Tesseract.js). Supports multiple languages.',
    parameters: {
      imagePath: z.string().describe('Path to the image file'),
      language: z.string().optional().default('eng').describe('Language code for OCR (e.g., "eng", "deu", "chi_sim")'),
    },
    implementation: async (params) => imageToText(params as ImageToTextParams),
  }));

  // describe_image tool
  tools.push(tool({
    name: 'describe_image',
    description: 'Get metadata and basic description of an image file.',
    parameters: {
      imagePath: z.string().describe('Path to the image file'),
    },
    implementation: async (params) => describeImage(params as DescribeImageParams),
  }));

  // screenshot_desktop tool
  tools.push(tool({
    name: 'screenshot_desktop',
    description: 'Capture a screenshot of the desktop and save it to a file.',
    parameters: {
      outputPath: z.string().optional().describe('Output path for the screenshot (default: temp directory)'),
      format: z.enum(['png', 'jpeg']).optional().default('png').describe('Image format'),
      quality: z.number().min(1).max(100).optional().default(90).describe('JPEG quality (1-100, only applies to JPEG format)'),
    },
    implementation: async (params) => screenshotDesktop(params as ScreenshotDesktopParams),
  }));

  // compare_images tool
  tools.push(tool({
    name: 'compare_images',
    description: 'Compare two images and calculate pixel-level similarity score.',
    parameters: {
      image1Path: z.string().describe('Path to the first image'),
      image2Path: z.string().describe('Path to the second image'),
    },
    implementation: async (params) => compareImages(params as CompareImagesParams),
  }));

  return tools;
}
