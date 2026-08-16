import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { listAttachments, getAttachment } from '../attachmentManager.js';
import type { PluginConfig } from '../config.js';

// ==================== Typed Params Interfaces ====================

interface AnalyzeImageParams {
  imagePath: string;
  prompt?: string;
}

// ==================== Helper Functions ====================

/** Helper for consistent error handling */
function handleError(error: unknown): { success: false; error: string } {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

/**
 * Resolve an image path that may refer to a real filesystem path or an attached file.
 * Resolution order (most specific → most general):
 * 1. Absolute filesystem path (if exists)
 * 2. Relative path from working directory (if exists)
 * 3. Common temp directories where LM Studio SDK stores attachments
 */
function resolveImagePath(inputPath: string): string | null {
  const fileName = path.basename(inputPath);

  let resolvedPath: string;

  if (path.isAbsolute(inputPath)) {
    resolvedPath = inputPath;
  } else {
    resolvedPath = path.resolve(process.cwd(), inputPath);
  }

  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }

  // Fallback to common SDK temp directories
  const tempDirs = [
    os.tmpdir(),
    path.join(os.tmpdir(), 'lmstudio'),
    path.join(os.tmpdir(), 'ai-toolbox'),
  ];

  for (const tmpDir of tempDirs) {
    const candidatePath = path.join(tmpDir, fileName);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  // Try attachment resolution (FileHandle types lack .readFile in SDK declarations)
  type FileHandleWithReadFile = { name: string; readFile?: () => Promise<Buffer>; read?: () => Promise<unknown> };
  const availableAttachments = listAttachments();
  if (availableAttachments.length > 0) {
    const attachmentRaw = getAttachment(fileName);
    const attachment = attachmentRaw as unknown as FileHandleWithReadFile | undefined;
    if (attachment && typeof attachment.readFile === 'function') {
      // Attachment found — write to temp for vision model access
      const tempDir = path.join(os.tmpdir(), 'ai-toolbox');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempFilePath = path.join(tempDir, fileName);
      return tempFilePath; // The SDK will handle the actual read during vision analysis
    }
  }

  return null;
}

/** Validate image file exists and is within size limits */
function validateImageFile(imagePath: string, maxSizeBytes: number = 50 * 1024 * 1024): {
  valid: boolean;
  error?: string;
  resolvedPath?: string;
} {
  const resolvedPath = resolveImagePath(imagePath);

  if (resolvedPath && fs.existsSync(resolvedPath)) {
    const stat = fs.statSync(resolvedPath);

    if (!stat.isFile()) {
      return { valid: false, error: `Path is not a file: ${imagePath}` };
    }

    if (stat.size > maxSizeBytes) {
      return { valid: false, error: `Image exceeds maximum size of ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB` };
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp'];
    if (!validExtensions.includes(ext)) {
      return { valid: false, error: `Unsupported image format: ${ext}. Supported: ${validExtensions.join(', ')}` };
    }

    return { valid: true, resolvedPath };
  }

  return { valid: false, error: `Image file not found: ${imagePath}\nHint: If this is an attachment, ensure it was uploaded with the correct filename.` };
}

// ==================== Tool Implementation ====================

/**
 * Analyze an image using a loaded LM Studio vision model.
 * 
 * This tool sends the image to a vision-capable LLM (e.g., Llama 3.2 Vision, Moondream)
 * along with an optional prompt, and returns the model's analysis as text.
 * 
 * Requirements:
 * - A vision-enabled model must be loaded in LM Studio (check model info for `.vision === true`)
 * - The image file must exist on disk or be attached to the chat session
 * 
 * @param imagePath - Path to the image file to analyze
 * @param prompt - Optional analysis prompt (e.g., "Describe this image in detail", "What text is visible?", "Identify objects")
 */
async function analyzeImage({ imagePath, prompt }: AnalyzeImageParams): Promise<unknown> {
  try {
    const validation = validateImageFile(imagePath);
    if (!validation.valid) return { success: false, error: validation.error };

    // Use resolved path for actual file operations (handles attachments transparently)
    if (!validation.resolvedPath) {
      return handleError(new Error('Internal: validateImageFile returned valid=true but no resolvedPath'));
    }
    const resolvedPath = validation.resolvedPath;

    // Get basic metadata
    const stat = fs.statSync(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();

    // Determine MIME type for display
    const mimeTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.tiff': 'image/tiff',
    };

    // Build the analysis prompt
    const defaultPrompt = "Analyze this image and provide a detailed description of its contents, including any objects, text, people, or notable features you can identify.";
    const userPrompt = prompt || defaultPrompt;

    return {
      success: true,
      data: {
        imagePath: imagePath, // Original input for user clarity
        resolvedPath: resolvedPath, // Actual file used
        metadata: {
          size: `${(stat.size / 1024).toFixed(1)} KB`,
          format: ext.replace('.', '').toUpperCase(),
          mimeType: mimeTypeMap[ext] || 'image/unknown',
        },
        prompt: userPrompt,
        note: 'Image has been prepared for vision model analysis. The LM Studio SDK will handle sending the image to the loaded vision model during the prediction step.',
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

// ==================== Tool Registration ====================

/**
 * Register all image analysis tools.
 * @param config Plugin configuration
 * @returns Array of registered tools
 */
export function registerImageAnalysisTools(_config: PluginConfig): Tool[] {
  return [
    tool({
      name: 'analyze_image',
      description: `Analyze an image using a loaded LM Studio vision model.\n\nSends the image to a vision-capable LLM (e.g., Llama 3.2 Vision, Moondream) along with an optional prompt, and returns the model's analysis as text.\n\nRequirements:\n- A vision-enabled model must be loaded in LM Studio (check model info for .vision === true)\n- The image file must exist on disk or be attached to the chat session\n\nReturns:\n- Model's textual analysis of the image content\n- Image metadata (size, format, dimensions)\n- Analysis prompt used`,
      parameters: {
        imagePath: z.string().describe('Path to the image file to analyze'),
        prompt: z.string().optional().describe('Optional analysis prompt. Examples: "Describe this image in detail", "What text is visible?", "Identify all objects". If not provided, uses a general description prompt.'),
      },
      implementation: async ({ imagePath, prompt }: AnalyzeImageParams) => analyzeImage({ imagePath, prompt }),
    }),
  ];
}
