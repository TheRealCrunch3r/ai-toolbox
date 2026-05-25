/**
 * Document RAG Prompt Preprocessor + Working Directory Detection + Temporal Awareness
 */

import { type ChatMessage, type FileHandle, type PromptPreprocessorController } from '@lmstudio/sdk';
import { configSchematics } from './config';
import pdfParse from 'pdf-parse';
import { setAttachments, listAttachments } from './attachmentManager';

// --- Temporal Awareness Helpers (merged from up_to_date) ---
interface DateTimeCache {
  compact: string;
  full: string;
}

let cachedDateTimeData: DateTimeCache | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // Refresh every 5 minutes
let cacheTimestamp = 0;

function getCachedDateTime(): DateTimeCache {
  const now = Date.now();
  
  if (cachedDateTimeData && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return cachedDateTimeData;
  }
  
  const date = new Date();
  
  // Compact format: DD.MM.YYYY, HH:mm
  const compact = date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Full format: Wochentag, DD. MMMM YYYY, HH:mm Uhr
  const full = date.toLocaleString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' Uhr';
  
  cachedDateTimeData = { compact, full };
  cacheTimestamp = now;
  
  return cachedDateTimeData;
}

function getTemporalSuffix(ctl: PromptPreprocessorController): string {
  const config = ctl.getPluginConfig(configSchematics);
  
  // Use .get() method with proper defaults - more reliable than direct property access
  const temporalAwarenessEnabled = config.get('temporalAwareness', true); // Default to true if not set
  
  if (!temporalAwarenessEnabled) {
    return '';
  }
  
  const style = config.get('dateFormatStyle', 'standard');
  const { compact, full } = getCachedDateTime();
  
  // DEBUG: Uncomment to verify what's being injected
  console.log(`[TEMPORAL] Injecting: ${style === 'heuteIst' ? `HEUTE IST ${full}` : `[Zeit: ${compact}]`}`);
  
  if (style === 'heuteIst') {
    return `\n\nHEUTE IST ${full}`;
  }
  return `\n\n[Zeit: ${compact}]`;
}

function detectDirectoryPath(text: string): string | null {
  // Remove URLs first to avoid false positives like /medium.com from https://medium.com/...
  const withoutUrls = text.replace(/https?:\/\/[^\s]+|www\.[^\s]+|file:\/\/[^\s]+/g, '');

  // Windows paths: C:\path or D:\folder (must start with drive letter)
  const winMatch = withoutUrls.match(/[A-Za-z]:\\[\w\-_. ]+/);
  if (winMatch) return winMatch[0].trim();

  // Unix absolute paths: /home/user/dir, /var/log, etc.
  const unixMatch = withoutUrls.match(/(?:^|\s)(\/[\w\-_. ]{2,})/);
  if (unixMatch) {
    const path = unixMatch[1].trim();
    // Reject paths that look like URLs or fragments (e.g., / Chat files s)
    if (!path.startsWith('/ ') && !path.includes(' ')) {
      return path;
    }
  }

  // Relative paths: ./folder, ../parent/dir
  const relMatch = withoutUrls.match(/(?:^|\s)(?:\.\/|\.\\.\/|\.\.\/)[\w\-_. ]+/);
  if (relMatch) return relMatch[0].trim();

  return null;
}

function injectWorkingDirectoryPrompt(originalMessage: string, detectedPath: string): string {
  const instruction = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ WORKING DIRECTORY DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user mentioned a directory path in their message:

    ${detectedPath}

Please ask the user for confirmation before changing the working directory.
Example response:

"I noticed you mentioned the directory '${detectedPath}'. 
Would you like me to set this as your working directory? 
All subsequent file operations will use this directory as the base.

Reply 'yes' or 'ja' to confirm, or 'no'/'nein' to decline."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User's original message:
${originalMessage}
`;
  
  return instruction.trim();
}

async function extractPdfText(fileHandle: FileHandle): Promise<string> {
  try {
    const buffer = await fileHandle.read();
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    console.error(`[RAG] Error extracting text from PDF ${fileHandle.name}:`, error);
    throw new Error(`Failed to parse PDF: ${fileHandle.name}`);
  }
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  if (words.length <= chunkSize) {
    return [text];
  }

  let startIndex = 0;
  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkText = words.slice(startIndex, endIndex).join(' ');
    
    chunks.push(chunkText);
    startIndex = endIndex - overlap;
  }

  return chunks.filter(c => c.trim().length > 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface RetrievalResult {
  content: string;
  score: number;
}

async function retrieveFromPdfs(
  ctl: PromptPreprocessorController,
  query: string,
  pdfFiles: FileHandle[],
): Promise<RetrievalResult[]> {
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const retrievalLimit = pluginConfig.get('retrievalLimit') || 5;
  // Lower default threshold to catch more results - was too high at 0.6
  const retrievalAffinityThreshold = pluginConfig.get('retrievalAffinityThreshold') ?? 0.3;

  console.log(`[RAG] Processing ${pdfFiles.length} PDF file(s)`);

  // Extract text from all PDF files
  const fileTexts: { file: FileHandle; text: string }[] = [];
  for (const file of pdfFiles) {
    try {
      const text = await extractPdfText(file);
      if (text.length > 0) {
        console.log(`[RAG] Extracted ${text.length} chars from ${file.name}`);
        fileTexts.push({ file, text });
      } else {
        console.warn(`[RAG] No text extracted from ${file.name}`);
      }
    } catch (error) {
      console.error(`[RAG] Skipping PDF ${file.name} due to error:`, error);
    }
  }

  if (fileTexts.length === 0) {
    console.warn('[RAG] No text extracted from any PDF');
    return [];
  }

  // Chunk the texts
  const chunks: { file: FileHandle; chunk: string }[] = [];
  for (const { file, text } of fileTexts) {
    const fileChunks = chunkText(text);
    console.log(`[RAG] ${file.name}: ${text.length} chars → ${fileChunks.length} chunks`);
    fileChunks.forEach((chunk) => {
      chunks.push({ file, chunk });
    });
  }

  if (chunks.length === 0) return [];

  // Generate embeddings for all chunks using LM Studio's embedding model
  let model;
  try {
    console.log('[RAG] Loading embedding model...');
    model = await ctl.client.embedding.model('nomic-ai/nomic-embed-text-v1.5-GGUF', {
      signal: ctl.abortSignal,
    });
    console.log('[RAG] Embedding model loaded successfully');
  } catch (error) {
    console.error('[RAG] Failed to load embedding model:', error);
    throw new Error(`Embedding model not available: ${error}`);
  }

  const batchSize = 32;
  const allEmbeddings: number[][] = [];

  try {
    for (let i = 0; i < chunks.length; i += batchSize) {
      console.log(`[RAG] Generating embeddings batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}...`);
      const batch = chunks.slice(i, i + batchSize).map(c => c.chunk);
      const embeddings = await model.embed(batch, ctl.abortSignal);
      allEmbeddings.push(...embeddings);
    }
  } catch (error) {
    console.error('[RAG] Error generating embeddings:', error);
    throw new Error(`Embedding generation failed: ${error}`);
  }

  // Generate embedding for the query
  let queryModel;
  try {
    queryModel = await ctl.client.embedding.model('nomic-ai/nomic-embed-text-v1.5-GGUF', {
      signal: ctl.abortSignal,
    });
  } catch (error) {
    console.error('[RAG] Failed to load query embedding model:', error);
    throw new Error(`Query embedding failed: ${error}`);
  }

  let queryEmbedding;
  try {
    queryEmbedding = (await queryModel.embed([query], ctl.abortSignal))[0];
  } catch (error) {
    console.error('[RAG] Error generating query embedding:', error);
    throw new Error(`Query embedding failed: ${error}`);
  }

  // Calculate similarities and retrieve top results
  const scores: { chunkIndex: number; similarity: number }[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const similarity = cosineSimilarity(queryEmbedding, allEmbeddings[i]);
    scores.push({ chunkIndex: i, similarity });
  }

  // Sort by similarity descending and filter by threshold
  scores.sort((a, b) => b.similarity - a.similarity);
  
  console.log(`[RAG] Found ${scores.length} chunks, filtering with threshold ${retrievalAffinityThreshold}`);
  const relevantChunks = scores.filter(
    (s) => s.similarity >= retrievalAffinityThreshold && s.chunkIndex < chunks.length,
  );

  // Limit results
  const limitedResults = relevantChunks.slice(0, retrievalLimit);

  console.log(`[RAG] Returning ${limitedResults.length} results`);
  return limitedResults.map((r) => ({
    content: chunks[r.chunkIndex].chunk,
    score: r.similarity,
  }));
}

export async function preprocess(
  ctl: PromptPreprocessorController,
  userMessage: ChatMessage
): Promise<string | ChatMessage> {
  const userPrompt = userMessage.getText();
  
  // Step 0: Always register attachments so tools can access them by name
  const allFiles = userMessage.getFiles(ctl.client);
  setAttachments(allFiles);
  
  // Build attachment notice to inject into prompt
  let attachmentNotice = '';
  if (allFiles.length > 0) {
    const fileNames = listAttachments();
    attachmentNotice = `\n\n📎 ATTACHED FILES AVAILABLE:\nYou have access to the following attached files. You can read them using the read_document tool by filename:\n${fileNames.map(name => `- ${name}`).join('\n')}`;
  }
  
  // Step 1: Directory detection (highest priority)
  const detectedPath = detectDirectoryPath(userPrompt);
  if (detectedPath) {
    return injectWorkingDirectoryPrompt(userPrompt + attachmentNotice, detectedPath) + getTemporalSuffix(ctl);
  }
  
  // Step 2: Document RAG processing (if enabled)
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const documentRAGEnabled = pluginConfig.get('documentRAG');
  
  console.log(`[RAG] documentRAG enabled: ${documentRAGEnabled}`);
  
  if (!documentRAGEnabled) {
    // If RAG is disabled, just return the message with attachment notice
    const base = userPrompt + attachmentNotice;
    return base + getTemporalSuffix(ctl);
  }

  const newFiles = allFiles.filter(f => f.type !== 'image');
  console.log(`[RAG] Found ${newFiles.length} non-image files`);
  
  if (newFiles.length === 0) {
    const base = userPrompt + attachmentNotice;
    return base + getTemporalSuffix(ctl);
  }

  // Separate PDF files from other file types
  const pdfFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
  const otherFiles = newFiles.filter(f => !f.name.toLowerCase().endsWith('.pdf'));

  console.log(`[RAG] PDFs: ${pdfFiles.length}, Other: ${otherFiles.length}`);

  let allResults: RetrievalResult[] = [];

  // Process PDFs with custom local pipeline (more reliable for complex layouts)
  if (pdfFiles.length > 0) {
    try {
      const pdfResults = await retrieveFromPdfs(ctl, userPrompt, pdfFiles);
      console.log(`[RAG] PDF retrieval returned ${pdfResults.length} results`);
      allResults.push(...pdfResults);
    } catch (error) {
      console.error('[RAG] Error processing PDFs:', error);
    }
  }

  // Process other files with LM Studio's native retrieval API (handles .txt, .md, etc. natively)
  if (otherFiles.length > 0) {
    try {
      const model = await ctl.client.embedding.model('nomic-ai/nomic-embed-text-v1.5-GGUF', {
        signal: ctl.abortSignal,
      });

      const result = await ctl.client.files.retrieve(userPrompt, otherFiles, {
        embeddingModel: model,
        limit: pluginConfig.get('retrievalLimit') || 5,
        signal: ctl.abortSignal,
      });

      // Convert high-level API results to our format
      const filteredEntries = result.entries.filter(
        entry => entry.score > (pluginConfig.get('retrievalAffinityThreshold') ?? 0.3)
      );
      console.log(`[RAG] Native retrieval returned ${filteredEntries.length} results`);
      allResults.push(...filteredEntries.map(e => ({ content: e.content, score: e.score })));
    } catch (error) {
      console.error('[RAG] Error retrieving from other files:', error);
    }
  }

  // Sort and limit results
  allResults.sort((a, b) => b.score - a.score);
  const retrievalLimit = pluginConfig.get('retrievalLimit') || 5;
  allResults = allResults.slice(0, retrievalLimit);

  console.log(`[RAG] Total results after sorting: ${allResults.length}`);

  // Inject context if results found
  if (allResults.length > 0) {
    let contextInjection = '';
    for (const result of allResults) {
      contextInjection += `\n${result.content}\n---\n`;
    }

    return `${userPrompt}${attachmentNotice}\n\n--- RELEVANT DOCUMENT CONTEXT ---\n${contextInjection.trim()}` + getTemporalSuffix(ctl);
  }

  // If no results found, return original message with attachment notice
  console.log('[RAG] No relevant results found');
  const base = userPrompt + attachmentNotice;
  return base + getTemporalSuffix(ctl);
}
