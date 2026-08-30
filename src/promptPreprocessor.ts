/**
 * Document RAG Prompt Preprocessor + Working Directory Detection + Temporal Awareness
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { type ChatMessage, type FileHandle, type PromptPreprocessorController } from '@lmstudio/sdk';
import { configSchematics } from './config';
import pdfParse from 'pdf-parse';
import type { ContextGuard } from './contextGuard';
import { setAttachments, listAttachments } from './attachmentManager';
import { autoTracker } from './autoTracker';
import { TokenStatsManager } from './tokenStatsManager';
import { getToolOverheadChars } from './toolOverhead.js';
import { getWorkingDir, setWorkingDir, listRegisteredProjects } from './workingDir.js';

interface ExtendedMessage {
  role?: string;
  content?: unknown;
  toolCalls?: unknown[];
  tool_calls?: unknown[];
  files?: unknown[];
  images?: unknown[];

}


/** Minimal interface for LM Studio LLM model objects with optional metadata */
interface LLMModelWithOptionalFields {
  modelKey?: string;
  id?: string;
}

// --- Temporal Awareness Helpers (merged from up_to_date) ---
interface DateTimeCache {
  compact: string;
  full: string;
}

let cachedDateTimeData: DateTimeCache | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // Refresh every 5 minutes

// ContextGuard integration
let contextGuard: ContextGuard | null = null;

export function setContextGuard(guard: ContextGuard | null): void {
  contextGuard = guard;
}
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
  const temporalAwarenessEnabled = config.get('temporalAwareness') ?? true;
  
  if (!temporalAwarenessEnabled) {
    return '';
  }
  
  const style = config.get('dateFormatStyle') ?? 'standard';
  const { compact, full } = getCachedDateTime();
  
  // DEBUG: Uncomment to verify what's being injected
  console.log(`[TEMPORAL] Injecting: ${style === 'heuteIst' ? `HEUTE IST ${full}` : `[Zeit: ${compact}]`}`);
  
  if (style === 'heuteIst') {
    return `\n\nHEUTE IST ${full}`;
  }
  return `\n\n[Zeit: ${compact}]`;
}

/** Normalizes a project name for fuzzy matching (hyphens ↔ underscores, lowercase) */
function normalizeProjectName(name: string): string {
  return name.toLowerCase().replace(/[-_\s]+/g, '_');
}

/** Generates variants of a project name for fuzzy matching */
function generateNameVariants(name: string): string[] {
  const normalized = normalizeProjectName(name);
  const variants = new Set<string>();
  variants.add(normalized);
  variants.add(normalized.replace(/-/g, '_'));
  variants.add(normalized.replace(/_/g, '-'));
  variants.add(normalized.replace(/[-_\s]/g, ''));
  return Array.from(variants);
}

/** Detect if a user message contains a registered project keyword.
 * Registry resolution chain: <pluginRoot>/.session_context/project_registry.json (primary)
 * → <pluginRoot>/.session_index.json (legacy fallback).
 * The registry is loaded ONCE per invocation and reused across all candidate words
 * (previously re-read from disk for every candidate word, and the fallback was never consulted — dead in installed envs). */
export function detectProjectKeyword(
  text: string,
  options?: { pluginRoot?: string },
): { name: string; path: string } | null {
  // Extract candidate words/phrases from the message (ignore common verbs/prepositions)
  const stopWords = new Set([
    'let', 'us', 'work', 'on', 'the', 'a', 'an', 'in', 'at', 'to', 'for', 'with',
    'about', 'start', 'begin', 'open', 'switch', 'go', 'back', 'continue', 'resume'
  ]);

  // FIX: length >= 2 (was > 2) — short name components like 'my' in "my cool project" were dropped,
// so multi-word names containing 2-letter parts could never match. Digits excluded to avoid
// matching version numbers / years against numeric name variants; stopword list still filters the rest.
const words = text.toLowerCase().split(/\s+/).filter(w => w.length >= 2 && !stopWords.has(w) && !/^\d+$/.test(w));

  if (words.length === 0) return null;

  // Load the registry once per invocation (primary → legacy fallback), then match in memory.
  const projects = listRegisteredProjects(options?.pluginRoot);
  if (projects.length === 0) return null;

  // Precompute fuzzy name variants per project to avoid re-computing them for every candidate word
  const indexed = projects.map(p => ({ variants: new Set(generateNameVariants(p.name)), project: p }));

  // Try matching combinations of 1-3 consecutive words as project name candidates
  for (let len = Math.min(3, words.length); len >= 1; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const candidate = words.slice(i, i + len).join('_');

      for (const entry of indexed) {
        if (entry.variants.has(candidate)) {
          return { name: entry.project.name, path: entry.project.path };
        }
      }
    }
  }

  return null;
}

function detectDirectoryPath(text: string): string | null {
  // Remove URLs first to avoid false positives like /medium.com from https://medium.com/...
  const withoutUrls = text.replace(/https?:\/\/[^\s]+|www\.[^\s]+|file:\/\/[^\s]+/g, '');

  // Windows paths: C:\path or D:\folder (must start with drive letter)
   const winMatch = withoutUrls.match(/[A-Za-z]:\\[\w\-_. \\]+/);
//                                    ^^^^^^^^^^
//                                    Backslash added ✓
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
  // Relative paths: ./folder, ../parent/dir
  const relMatch = withoutUrls.match(/(?:^|\s)(?:\.\/|\.\\.\/)[\w\-_. ]+/);
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
    // Typed interface for FileHandle with optional readFile method
    type FileHandleWithReadFile = { 
      name: string;
      readFile?: () => Promise<Buffer>;
      read?: () => Promise<unknown>;
    };
    const typedHandle = fileHandle as unknown as FileHandleWithReadFile;
    const buffer = typedHandle.readFile 
      ? await typedHandle.readFile()
      : Buffer.from(await (typedHandle.read?.() as Promise<string>) ?? '');
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
        console.log(`[RAG] No text extracted from ${file.name}`);
      }
    } catch (error) {
      console.error(`[RAG] Skipping PDF ${file.name} due to error:`, error);
    }
  }

  if (fileTexts.length === 0) {
    console.log('[RAG] No text extracted from any PDF');
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
    throw new Error(`Embedding model not available: ${error instanceof Error ? error.message : String(error)}`);
  }

  const batchSize = 32;
  const allEmbeddings: number[][] = [];

  try {
    for (let i = 0; i < chunks.length; i += batchSize) {
      console.log(`[RAG] Generating embeddings batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}...`);
      const batch = chunks.slice(i, i + batchSize).map(c => c.chunk);
      const embeddingsResult = await model.embed(batch);
      // Type the embedding result properly
      type EmbeddingResult = { embedding: number[] };
      allEmbeddings.push(...(embeddingsResult as EmbeddingResult[]).map((e) => e.embedding));
    }
  } catch (error) {
    console.error('[RAG] Error generating embeddings:', error);
    throw new Error(`Embedding generation failed: ${(error instanceof Error ? error.message : String(error))}`);
  }

  // Generate embedding for the query
  let queryModel;
  try {
    queryModel = await ctl.client.embedding.model('nomic-ai/nomic-embed-text-v1.5-GGUF', {
      signal: ctl.abortSignal,
    });
  } catch (error) {
    console.error('[RAG] Failed to load query embedding model:', error);
    throw new Error(`Query embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
  }

  let queryEmbedding;
  try {
    const queryResult = await queryModel.embed([query]);
    queryEmbedding = queryResult[0].embedding;
  } catch (error) {
    console.error('[RAG] Error generating query embedding:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Query embedding failed: ${errorMessage}`);
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







// ==================== Step 0.7 Confirm-First Project Switching (Fix A) ====================

/**
 * Pending project-switch confirmation state (Fix A). Set when a registered project is detected in
 * a user message; consumed one-shot only when the user explicitly replies YES/JA on a subsequent
 * message. Cleared on decline, expiry, or successful switch.
 */
let pendingProjectSwitch: { name: string; path: string } | null = null;

/**
 * Normalize a bilingual confirmation reply to the canonical FSM input (Fix B).
 * Accepts English 'YES'/'NO' and German 'JA'/'NEIN'; anything else → null (not a confirmation reply).
 */
export function normalizeConfirmationReply(raw: string): 'YES' | 'NO' | null {
  const u = raw.trim().toUpperCase();
  if (u === 'YES' || u === 'JA') return 'YES';
  if (u === 'NO' || u === 'NEIN') return 'NO';
  return null;
}

/** Outcome of Step 0.7's confirm-first project-switch gate (Fix A). */
export type ProjectSwitchDecision =
  | { kind: 'skip' }
  | { kind: 'banner'; match: { name: string; path: string } }
  | { kind: 'execute'; match: { name: string; path: string } }
  | { kind: 'declined' };

/**
 * Pure decision logic for Step 0.7 (Fix A — v1.9.8+ safety rule in the index.ts docblock):
 * NEVER switch the working directory on detection alone. The banner asks for confirmation;
 * only an explicit YES/JA reply executes the one-shot switch. NO/NEIN or any other reply
 * expires the offer (the "next message" contract).
 */
export function decideProjectSwitch(
  match: { name: string; path: string } | null,
  reply: string,
  currentCwd: string,
  pending: { name: string; path: string } | null,
): ProjectSwitchDecision {
  if (!match) return { kind: 'skip' };

  // Already in the detected project's directory → a switch would be a no-op.
  if (path.resolve(currentCwd) === path.resolve(match.path)) return { kind: 'skip' };

  const normalized = normalizeConfirmationReply(reply);
  if (pending && pending.name === match.name && path.resolve(pending.path) === path.resolve(match.path)) {
    if (normalized === 'YES') return { kind: 'execute', match }; // one-shot switch on explicit confirmation
    return { kind: 'declined' }; // NO/NEIN or any non-confirmation reply → expire the offer
  }

  // New detection, or a different project than the pending offer → confirm-first banner.
  return { kind: 'banner', match };
}

/**
 * Execute a confirmed project CWD switch (Step 0.7, Fix A): canonical persistent state change via
 * setWorkingDir() plus best-effort process.chdir(), then load and inject the target project's
 * session memory (msgpack with plain-JSON fallback). Returns the fully composed prompt for this turn.
 */
async function executeProjectSwitch(
  newCwd: string,
  userPrompt: string,
  attachmentNotice: string,
  checkpointSuffix: string,
  ctl: PromptPreprocessorController,
): Promise<string> {
  console.log(`[ProjectAutoDetect] Switching working directory to: ${newCwd}`);

  try {
    // Canonical CWD change — persistent working-dir state (authoritative for all getWorkingDir() consumers)
    // plus best-effort process.chdir. Previously only process.chdir was called, so tool-level CWD never changed.
    if (!applyProjectCwdSwitch(newCwd)) {
      console.warn(`[ProjectAutoDetect] CWD switch rejected for '${newCwd}' — proceeding without switch`);
      return `${userPrompt}${attachmentNotice}${checkpointSuffix}`.trim() + getTemporalSuffix(ctl);
    }

          // Read session memory from the new working directory (if exists)
          try {
            const msgpackPath = path.join(newCwd, '.session_context', '.ai_toolbox_memory.msgpack');
            
            if (fs.existsSync(msgpackPath)) {
              console.log(`[ProjectAutoDetect] Found session memory at ${msgpackPath}`);
              
              // Load and decode the .ai_toolbox_memory.msgpack file using msgpack library
              try {
                const msgpack = await import('@msgpack/msgpack');
                const rawBytes = fs.readFileSync(msgpackPath);
                
                if (rawBytes.length > 0) {
                  const decoded: unknown = msgpack.decode(rawBytes);
                  
                  // Check for session summary in the decoded data
                  if (decoded && typeof decoded === 'object') {
                    const d = decoded as Record<string, unknown>;
                    
                    // Cast to typed interface for safe property access
                    type SessionSummaryKeys = { latest_session_summary?: string; session_summary_latest?: string };
                    const typedD = d as SessionSummaryKeys;
                    
                    let latestSummary: string | undefined;
                    
                    if ('latest_session_summary' in typedD && typeof typedD.latest_session_summary === 'string') {
                      latestSummary = typedD.latest_session_summary;
                    } else if ('session_summary_latest' in typedD && typeof typedD.session_summary_latest === 'string') {
                      latestSummary = typedD.session_summary_latest;
                    } else if ('latestSummary' in d && typeof d.latestSummary === 'string') {
                      latestSummary = d.latestSummary;
                    }
                    
                    // If found, inject session summary context into the prompt
                    if (latestSummary && latestSummary.length > 0) {
                      console.log(`[ProjectAutoDetect] Loaded session memory from ${newCwd}`);
                      
                      const sessionContext = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 SESSION MEMORY LOADED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPrevious session summary:\n${latestSummary}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
                      
                      return `${userPrompt}${sessionContext}${attachmentNotice}${checkpointSuffix}`.trim() + getTemporalSuffix(ctl);
                    } else {
                      console.log(`[ProjectAutoDetect] Session memory exists but no summary found`);
                    }
                  }
                }
              } catch (decodeError) {
                console.warn(`[ProjectAutoDetect] Failed to decode msgpack from ${msgpackPath}:`, decodeError instanceof Error ? decodeError.message : String(decodeError));
                
                // Fallback: try reading as plain JSON if msgpack fails
                try {
                  const rawJson = fs.readFileSync(msgpackPath, 'utf-8');
                  const parsedJson = JSON.parse(rawJson) as Record<string, unknown>;
                  
                  let summaryText: string | undefined;
                  
                  // Cast to typed interface for safe property access (no eslint-disable needed)
                  type SessionSummaryKeys = { latest_session_summary?: string; session_summary_latest?: string };
                  const typedParsed = parsedJson as SessionSummaryKeys;
                  
                  if ('latest_session_summary' in typedParsed && typeof typedParsed.latest_session_summary === 'string') {
                    summaryText = typedParsed.latest_session_summary;
                  } else if ('session_summary_latest' in typedParsed && typeof typedParsed.session_summary_latest === 'string') {
                    summaryText = typedParsed.session_summary_latest;
                  }
                  
                  if (summaryText && summaryText.length > 0) {
                    console.log(`[ProjectAutoDetect] Loaded session memory from ${newCwd} (JSON fallback)`);
                    
                    const sessionContext = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 SESSION MEMORY LOADED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPrevious session summary:\n${summaryText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
                    
                    return `${userPrompt}${sessionContext}${attachmentNotice}${checkpointSuffix}`.trim() + getTemporalSuffix(ctl);
                  }
                } catch (jsonError) {
                  console.warn(`[ProjectAutoDetect] JSON fallback also failed:`, jsonError instanceof Error ? jsonError.message : String(jsonError));
                }
              }
            } else {
              console.log(`[ProjectAutoDetect] No session memory found at ${msgpackPath}`);
            }
          } catch (e) {
            console.warn(`[ProjectAutoDetect] Failed to load session memory from ${newCwd}:`, e instanceof Error ? e.message : String(e));
          }
  } catch (e) {
    console.error(`[ProjectAutoDetect] Error detecting/switching project:`, e);
  }

    // If automatic switch failed or no session memory found, return original message with context
    return `${userPrompt}${attachmentNotice}${checkpointSuffix}`.trim() + getTemporalSuffix(ctl);
}


/** Apply the project CWD switch (Step 0.7).
 * Canonical change = persistent working-dir state via setWorkingDir() — authoritative for all getWorkingDir() consumers;
 * plus a best-effort process.chdir so raw process.cwd() consumers (git/image tools) follow along too.
 * Previously only process.chdir was called, so the tool-level CWD (state file) never actually changed.
 * Returns false if the switch was rejected (path invalid). */
export function applyProjectCwdSwitch(newCwd: string): boolean {
  if (!setWorkingDir(newCwd)) return false;

  try {
    const oldCwd = process.cwd();
    if (oldCwd !== newCwd && typeof process.chdir === 'function') {
      process.chdir(newCwd);
      console.log(`[ProjectAutoDetect] Working directory changed: ${oldCwd} → ${newCwd}`);
    }
  } catch (chdirError) {
    // Non-fatal — persistent state is already set; only raw process.cwd() consumers stay behind.
    console.warn(`[ProjectAutoDetect] process.chdir failed (non-fatal): ${chdirError instanceof Error ? chdirError.message : String(chdirError)}`);
  }

  return true;
}

export async function preprocess(
  ctl: PromptPreprocessorController,
  userMessage: ChatMessage
): Promise<string | ChatMessage> {
  let userPrompt = '';
  try {
    const rawText = await Promise.resolve(userMessage.getText());
    userPrompt = typeof rawText === 'string' ? rawText : String(rawText ?? '');
  } catch {}

  // ✅ DIAGNOSTIC: Verify preprocessor is actually being called by LM Studio
  console.log(`✅ [Preprocessor] Called. Message length: ${userPrompt.length}`);
  if (!contextGuard) { console.warn('[ContextGuard] contextGuard is NULL!'); }

  // 🔹 FIX #20 (A1): reset the per-turn tool-payload delta. By the time this runs, last turn's tool
  // results are part of pullHistory() and get counted natively below — keeping them in the delta
  // would double-count them on the next mid-loop guard evaluation.
  TokenStatsManager.resetMidLoopDelta();

  // 🔹 Declare variables at top scope so they're accessible across all steps
  let pendingWarning: string | undefined;
  // 🔹 PART B (re-applied 21.08 after restore lost it): set when the pre-compression checkpoint did
  // NOT save but a YES/NO prompt was still pending — a last-chance note is appended to this turn's output.
  let lastChanceNote = false;
  // 🔹 Fix A/B coordination: set when Step 0.6 consumes a checkpoint reply this turn —
  // prevents the same reply from being re-interpreted as a project-switch confirmation in Step 0.7.
  let checkpointConsumedThisTurn = false;
  let messageCount = 0;
  let tokenCount = 0;
  let historyTextLength = 0; // ✅ Moved outside if-block to fix scoping
  
  // Step 0.5: ContextGuard auto-compression & token tracking
  if (contextGuard) {
    try {
      console.log('[ContextGuard DEBUG] Step 1: pullHistory()...');
      const history = await ctl.pullHistory();
      console.log('[ContextGuard DEBUG] Step 2: checking history object...');
      if (!history) { console.warn('[ContextGuard] pullHistory() returned undefined, skipping'); return userPrompt; }
      history.append(userMessage);
      console.log('[ContextGuard DEBUG] Step 3: getMessagesArray()...');
      const messages = history.getMessagesArray() as unknown as { role?: string; content?: unknown; [key: string]: unknown }[] | undefined;
      console.log('[ContextGuard DEBUG] Step 4: messages type:', typeof messages, 'isArray:', Array.isArray(messages));
      
      // Safely extract files/images, handling both arrays and single objects
      let toolCallCount = 0;
      let imageCount = 0;
      if (messages && Array.isArray(messages)) {
        for (const msg of messages) {
          const typedMsg = msg as ExtendedMessage;
          if (typedMsg.toolCalls || typedMsg.tool_calls) {
            toolCallCount += typedMsg.toolCalls?.length || typedMsg.tool_calls?.length || 0;
          }
          
          const fileObj = typedMsg.files || typedMsg.images;
          if (fileObj && Array.isArray(fileObj) && fileObj.length > 0) {
            imageCount += fileObj.length;
          } else if (fileObj && typeof fileObj === 'object') {
            // Handle single object case
            imageCount += 1;
          }
        }
        
        // ✅ Use LM Studio's native history API instead of .content casting (matches vibe-lm approach)
        historyTextLength = 0;
        try {
          const msgCount = history.getLength();
          for (let i = 0; i < msgCount; i++) {
            const msg = history.at(i);
            let msgText = '';
            if (msg.getText) msgText += msg.getText() || '';
            if (msg.getToolCallRequests) msgText += JSON.stringify(msg.getToolCallRequests()) || '';
            if (msg.getToolCallResults) msgText += JSON.stringify(msg.getToolCallResults()) || '';
            historyTextLength += msgText.length;
          }
        } catch (e) {
          console.warn('[TokenDebug] Failed to iterate native history:', e);
        }
        // ✅ v2.x: Include serialized tool definitions in the counted span — LM Studio's sidebar counts them too;
        // previously only message history was counted here (root cause of "sidebar ~265k vs plugin count much lower").
        const toolOverheadChars = getToolOverheadChars();
        if (toolOverheadChars > 0) {
          console.log(`[TokenDebug] Tool-definition overhead: +${toolOverheadChars} chars added to counted span`);
          historyTextLength += toolOverheadChars;
        }

        const estimatedHistoryTokens = Math.ceil(historyTextLength * 0.25 * 1.10); // base × +10% buffer
        console.log(`[TokenDebug] History Text Length: ${historyTextLength} chars | Est. Tokens (x0.25 + 10%): ${estimatedHistoryTokens}`);
      }
      console.log(`[TokenDebug] Total Tool calls: ${toolCallCount}, Total Files/Images: ${imageCount}`);

      // ✅ FIX: Dynamically resolve actual model context length before counting tokens
      console.log('[ContextGuard DEBUG] Step 5: getPluginConfig()...');
      const pluginConfig = ctl.getPluginConfig(configSchematics);
      // Inject LM Studio client from controller for dynamic model queries (SDK v1.x)
      if (ctl.client && contextGuard.setLMClient) {
        contextGuard.setLMClient(ctl.client);
      }

      // Re-seed the user's configured token limit every turn. ContextGuard is constructed in index.ts
      // WITHOUT config access, so this menu value was never applied — detection failures kept a stale
      // startup constant (262144). Precedence: setTokenLimitFromModel() below still overrides with the
      // model's real context window when it can be read from the SDK; otherwise the configured limit wins.
      const menuTokenLimit = pluginConfig.get('contextGuardTokenLimit');
      if (typeof menuTokenLimit === 'number' && Number.isFinite(menuTokenLimit) && menuTokenLimit > 0) {
        contextGuard.updateConfig({ tokenLimit: menuTokenLimit });
      }

      // Auto-detect the currently active model and get its ID for accurate token counting
      let activeModelId = '';
      
      try {
        const llmClient = ctl.client?.llm;
        if (llmClient && typeof llmClient.model === 'function') {
          // Get the active model to extract its ID
          const activeModel = await llmClient.model();
          if (activeModel) {
            const typedModel = activeModel as LLMModelWithOptionalFields;
            activeModelId = typedModel.modelKey || typedModel.id || '';
            console.log(`[ContextGuard] ✅ Auto-detected active model: ${activeModelId}`);
            
            // Update token limit from SDK
            await contextGuard.setTokenLimitFromModel(activeModelId);
          } else {
            const configuredSummaryModel = pluginConfig.get('contextGuardSummaryModel') || '';
            if (configuredSummaryModel) {
              activeModelId = configuredSummaryModel;
              await contextGuard.setTokenLimitFromModel(activeModelId);
              console.log(`[ContextGuard] ✅ Using configured summaryModel: ${activeModelId}`);
            } else {
              console.warn('[ContextGuard] No active model detected. Using default tokenLimit.');
            }
          }
        }
      } catch {
        const configuredSummaryModel = pluginConfig.get('contextGuardSummaryModel') || '';
        if (configuredSummaryModel) {
          activeModelId = configuredSummaryModel;
          console.warn(`[ContextGuard] ⚠️ Auto-detection failed, using summaryModel: ${activeModelId}`);
        } else {
          console.warn('[ContextGuard] ⚠️ No model detected. Using default tokenLimit.');
        }
      }

      // Extract System Prompt from history (usually index 0) to ensure accurate budget tracking
      let extractedSystemPrompt: string | undefined;
      if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'object') {
        const firstMsg = messages[0] as ExtendedMessage & { content?: unknown };
        if ((firstMsg.role === 'system' || firstMsg.role === 'system_prompt') && firstMsg.content) {
          let sysContent: string | undefined;
          if (typeof firstMsg.content === 'string') {
            sysContent = firstMsg.content;
          } else if (Array.isArray(firstMsg.content)) {
            const contentArr = firstMsg.content as Array<{ type?: string; text?: string }>;
            sysContent = contentArr.filter((c) => c.type === 'text').map((c) => c.text ?? '').join(' ');
          }
          if (sysContent && sysContent.trim().length > 0) extractedSystemPrompt = sysContent;
        }
      }

      // Calculate tokens for threshold check using actual model limit & History Text Length × 0.25
      const safeMessages = messages ?? [];
      
      console.log('[ContextGuard DEBUG] Step 6: calling countTokens()...');
      
      try {
        tokenCount = await contextGuard.countTokens(safeMessages, imageCount, activeModelId || undefined, extractedSystemPrompt, historyTextLength);
        console.log('[ContextGuard DEBUG] Step 7: countTokens() succeeded, getting limits...');
      } catch (countError) {
        console.error('[ContextGuard DEBUG] STEP 6 FAILED:', countError);
        throw countError; // Re-throw to see full stack trace
      }
      
      const maxTokens = contextGuard.getTokenLimit();
      const threshold = contextGuard.getThreshold();
      
      // ✅ DIAGNOSTIC: Log accurate token counts against real model limits
      console.log(`✅ [TokenCheck] Model limit: ${maxTokens} | Tokens used: ${tokenCount} | Threshold: ${Math.round(threshold)}`);

      console.log('[ContextGuard DEBUG] Step 8: checking auto-tracker config...');
      
      // 🔹 WIRE UP AUTO-TRACKER THRESHOLD PROMPT — Step 0.5b (uses correct maxTokens)
      const autoTrackingConfig = ctl.getPluginConfig(configSchematics);
      if ((autoTrackingConfig.get('autoTrackingEnabled') ?? true) && maxTokens > 0) {
        console.log('[ContextGuard DEBUG] Step 9: calling checkAndGeneratePrompt()...');
        try {
          const promptResult = autoTracker.checkAndGeneratePrompt(tokenCount, maxTokens);
          if (promptResult.triggered && promptResult.warning) {
            pendingWarning = promptResult.warning;
            console.log(`[AutoTracker] ✅ THRESHOLD PROMPT GENERATED — user will be asked to save session memory`);
          }
        } catch (autoTrackError) {
          console.error('[ContextGuard DEBUG] STEP 9 FAILED:', autoTrackError);
          throw autoTrackError;
        }
      }

      // Capture message count for later use in Step 0.6
      messageCount = history?.getLength() ?? 0;

      if (tokenCount > threshold) {
        console.log(`[ContextGuard] Token count ${tokenCount} exceeds compression threshold ${threshold}, compressing...`);

        // 🔹 PART B — PRE-COMPRESSION CHECKPOINT (awaited BEFORE history is destroyed). Non-fatal by design:
        // any failure only logs; compression must still run (parity with the Part A / YES-reply save paths).
        let snapshotSaved = false;
        try {
          const saveResult = await autoTracker.autoSaveSessionMemory(tokenCount, maxTokens, messageCount);
          snapshotSaved = !!saveResult?.saved;
          if (snapshotSaved) {
            console.log(`[AutoTracker] ✅ Pre-compression checkpoint saved: ${saveResult.sessionId}`);
          } else {
            console.warn('[AutoTracker] ⚠️ Pre-compression checkpoint NOT saved — compressing without a clean checkpoint');
          }
        } catch (e) {
          console.warn(`[AutoTracker] ⚠️ Pre-compression snapshot failed (non-fatal): ${e instanceof Error ? e.message : String(e)}`);
        }

        // 🔹 PART B-2: settle any pending YES/NO prompt — the context it referred to is about to be replaced, so a
        // re-injected <SYSTEM_INSTRUCTION> would demand a reply (and a second save) for history that no longer exists.
        if (!snapshotSaved && autoTracker.hasPendingWarning()) {
          lastChanceNote = true;
        }
        if (autoTracker.hasPendingWarning()) {
          autoTracker.consumePendingConfirmation(); // clear the tracker-side prompt; FSM no longer reports it pending
          pendingWarning = undefined; // drop this turn's locally-captured copy too — the suffix builder must NOT re-inject a YES/NO request about history that is being replaced now
        }

        const compressedMessages = await contextGuard.compressHistory(safeMessages) as unknown as ChatMessage[];
        // Clear history by popping all messages
        while ((history?.getLength() ?? 0) > 0) {
          history.pop();
        }
        compressedMessages.forEach((msg: ChatMessage) => history.append(msg));
        contextGuard.resetTokenCache();

        // 🔹 FIX #20 A2: compression ran this turn — recount the NEW (post-compression) history so the
        // published baseline reflects reality. Without this, the mid-loop guard would evaluate tool-payload
        // growth against a stale pre-compression count and fire on context that no longer exists.
        try {
          const postCompressCount = await contextGuard.countTokens(
            compressedMessages as unknown as typeof safeMessages,
            imageCount,
            activeModelId || undefined,
            extractedSystemPrompt,
          );
          tokenCount = postCompressCount; // also makes the Step 0.6 YES-reply checkpoint report accurate numbers
          console.log(`[ContextGuard] Post-compression count: ${postCompressCount} tokens (baseline updated for FIX #20)`);
        } catch (countErr) {
          // Non-fatal — worst case the guard keeps a stale-HIGH baseline (conservative direction: may snapshot early).
          console.warn('[FIX #20 A2] Post-compression recount failed; keeping pre-compression baseline:', countErr);
        }
      }

      // 🔹 FIX #20 (A2): single publish point — AFTER any same-turn compression. The tool wrapper's mid-loop
      // guard measures growth against this turn-start baseline + model limit until the next preprocess().
      TokenStatsManager.setTurnEvaluation(tokenCount, maxTokens);
    } catch (e) {
      console.error('[ContextGuard] Auto-compression failed:', e);
    }
  }

  // 🔹 UNIFIED CHECKPOINT WARNING INJECTION (Fixes missing prompt when RAG disabled or no files found)
  // CRITICAL FIX: Previous approach appended plain text trailing content — LLMs reliably ignored it.
  // New format uses explicit <SYSTEM_INSTRUCTION> XML-style markers + imperative directives that LLMs process as role-level instructions.
  let checkpointSuffix = '';
  if (pendingWarning) {
    checkpointSuffix = `\n\n<SYSTEM_INSTRUCTION>\n` +
      `TOKEN LIMIT WARNING — ACKNOWLEDGE BEFORE RESPONDING:\n` +
      `${pendingWarning}\n` +
      `---\n` +
      `ACTION REQUIRED: Before responding to the user's message, explicitly acknowledge this token limit warning.\n` +
      `If the user replied 'YES'/'JA' to save session memory → trigger the context management save tool now.\n` +
      `If the user did NOT reply YES/JA or NO/NEIN → ask them if they want to proceed with a context save.\n` +
      `Do not proceed with normal conversation until this warning has been addressed.\n` +
      `</SYSTEM_INSTRUCTION>`;
    pendingWarning = undefined; // Clear to prevent duplication in Step 1/2
  }

  // 🔹 PART B-2 (last chance): the pre-compression snapshot did NOT save, but a YES/NO prompt was still live —
  // tell the user this turn is the last clean opportunity before history is compressed. (One-shot: consumed now.)
  if (lastChanceNote) {
    checkpointSuffix += '\n\n⚠️ LAST chance before history is compressed — no session-memory checkpoint could be saved automatically this turn.';
    lastChanceNote = false;
  }

  // Step 0.6: Auto-tracking analysis + checkpoint reply handling
  try {
    const pluginConfig = ctl.getPluginConfig(configSchematics);
    const autoTrackingEnabled = pluginConfig.get('autoTrackingEnabled') ?? true; // Default to ON
    
    if (autoTrackingEnabled) {
      // Update tracker config from plugin settings (also includes token threshold)
      autoTracker.updateConfig({
        autoTrackingEnabled: true,
        autoTrackDecisions: pluginConfig.get('autoTrackDecisions') ?? true,
        autoTrackCompletions: pluginConfig.get('autoTrackCompletions') ?? true,
        autoTrackErrors: pluginConfig.get('autoTrackErrors') ?? true,
        autoSummaryInterval: pluginConfig.get('autoSummaryInterval') ?? 50,
        autoTrackTokenThreshold: (pluginConfig.get('autoTrackTokenThreshold')) ?? 75,
      });

      // 🔹 CHECK FOR YES/NO (or German JA/NEIN) REPLY TO PENDING CHECKPOINT PROMPT — Fix B
      if (autoTracker.hasPendingWarning()) {
        const replyRaw = userPrompt.trim().toUpperCase();
        // Normalize JA/NEIN onto the canonical 'YES' | 'NO' FSM inputs; null = not a confirmation reply.
        const replyMatch = normalizeConfirmationReply(userPrompt);
        if (replyMatch === 'YES' || replyMatch === 'NO') {
          checkpointConsumedThisTurn = true; // One reply serves one prompt — Step 0.7 must not reuse it as a switch confirmation.
          console.log(`[AutoTracker] ✅ User replied '${replyRaw}' to checkpoint prompt — processing...`);
          autoTracker.processUserReply(replyMatch); // Canonical 'YES' | 'NO' (JA/NEIN normalized above)
          
          // If YES → flush buffered actions + save session memory now
          if (replyMatch === 'YES') {
            const maxTokens = contextGuard?.getTokenLimit() ?? 0;
            
            // 🔹 FIX: Use direct checkpoint path instead of checkAndSaveTokenThreshold()
            // which is designed for independent threshold triggers, not post-confirmation flow.
            console.log(`[AutoTracker DEBUG] Direct save path triggered after user confirmation`);
            
            // Flush buffered actions first
            const flushedCount = await autoTracker.flushActionsToMemory();
            if (flushedCount > 0) {
              console.log(`[AutoTracker] ✅ Flushed ${flushedCount} buffered action(s)`);
            }
            
            // Then save session memory directly
            const saveResult = await autoTracker.autoSaveSessionMemory(
              tokenCount, 
              maxTokens, 
              messageCount
            );
            
            if (saveResult.saved) {
              console.log(`[AutoTracker] ✅ Session memory checkpoint saved: ${saveResult.sessionId}`);
            } else {
              console.error('[AutoTracker] ❌ Checkpoint save failed');
            }
          }
          
          console.log(`[AutoTracker] ✅ Checkpoint reply consumed — FSM state: ${autoTracker.getState()}`);
        }
      }

      // Analyze user message for tracking triggers (silent background)
      const actions = autoTracker.analyzeMessage?.(userPrompt) ?? [];
      
      if (actions.length > 0) {
        console.log(`[Auto-Track] Detected ${actions.length} event(s):`, actions.map(a => `${a.type} (${a.confidence.toFixed(2)})`).join(', '));
        // 🔹 Actions are now buffered in-memory and will be flushed to persistent storage
        // when the token threshold checkpoint fires (with user confirmation)
      }
    } else {
      // Ensure tracker is disabled if config says so
      autoTracker.updateConfig({ 
        autoTrackingEnabled: false,
      });
    }
  } catch (e) {
    console.error('[Auto-Track] Analysis failed:', e);
  }
  
  // Step 0: Always register attachments so tools can access them by name
  const allFiles = userMessage.getFiles?.(ctl.client) ?? [];
  setAttachments(allFiles);
  
  // Build attachment notice to inject into prompt
  let attachmentNotice = '';
  if (allFiles.length > 0) {
    const fileNames = listAttachments();
    attachmentNotice = `\n\n📎 ATTACHED FILES AVAILABLE:\nYou have access to the following attached files. You can read them using the read_document tool by filename:\n${fileNames.map(name => `- ${name}`).join('\n')}`;
  }
  
  // Step 0.7: Project keyword detection — check registered projects before path detection
  const projectMatch = detectProjectKeyword(userPrompt);
  if (projectMatch) {
    console.log(`[ProjectAutoDetect] Found registered project "${projectMatch.name}" at ${projectMatch.path}`);

    // 🔹 Fix A (v1.9.8+ safety rule in index.ts): NEVER auto-switch on detection alone —
    // confirm-first banner; the CWD changes only after an explicit YES/JA reply in a later message.
    const decision = decideProjectSwitch(projectMatch, userPrompt, getWorkingDir(), pendingProjectSwitch);

    if (decision.kind === 'skip') {
      // Already in the detected project's directory — switching would be a no-op.
      if (pendingProjectSwitch && pendingProjectSwitch.name === projectMatch.name) {
        console.log(`[ProjectAutoDetect] Already in "${projectMatch.name}" — dropping stale switch offer`);
        pendingProjectSwitch = null;
      } else {
        console.log('[ProjectAutoDetect] Already in target working directory — no switch needed');
      }
    } else if (decision.kind === 'banner') {
      // New detection → inject the confirm-first banner; do NOT change the working directory this turn.
      pendingProjectSwitch = { name: projectMatch.name, path: projectMatch.path };
      console.log(`[ProjectAutoDetect] Confirmation requested — switch will run only on an explicit YES/JA reply`);

      // Include the checkpoint warning only if it is still live after Step 0.6 ran this turn (avoids re-asking a consumed prompt).
      const activeSuffix = autoTracker.hasPendingWarning() ? checkpointSuffix : '';
      const projectInjectPrompt = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚠️ REGISTERED PROJECT DETECTED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nI found a registered project matching your message:\n\nProject: "${projectMatch.name}"\nPath: ${projectMatch.path}\n\nWould you like me to switch your working directory to this project?\nReply 'yes' or 'ja' to confirm, or 'no'/'nein' to decline.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nUser's original message:\n${userPrompt}${attachmentNotice}\n`;
      return `${projectInjectPrompt.trim()}${activeSuffix}`.trim() + getTemporalSuffix(ctl);
    } else if (decision.kind === 'declined') {
      console.log(`[ProjectAutoDetect] Switch to "${projectMatch.name}" declined — keeping current working directory`);
      pendingProjectSwitch = null;
      // No early return — continue with the normal flow below (Step 1/2).
    } else {
      // decision.kind === 'execute' → explicit YES/JA confirmation: run the one-shot switch now.
      if (checkpointConsumedThisTurn) {
        console.log(`[ProjectAutoDetect] Reply already consumed as checkpoint confirmation — keeping pending offer for "${projectMatch.name}"`);
        // Continue with the normal flow below; re-offer on a later message.
      } else {
        const activeSuffix = autoTracker.hasPendingWarning() ? checkpointSuffix : '';
        pendingProjectSwitch = null;
        console.log(`[ProjectAutoDetect] User confirmed — executing one-shot switch to: ${projectMatch.path}`);
        return await executeProjectSwitch(projectMatch.path, userPrompt, attachmentNotice, activeSuffix, ctl);
      }
    }
  } else if (pendingProjectSwitch) {
    // No fresh keyword match this turn — a pending offer can only be answered by an explicit reply.
    const normalized = normalizeConfirmationReply(userPrompt);

    if (checkpointConsumedThisTurn && (normalized === 'YES' || normalized === 'NO')) {
      console.log(`[ProjectAutoDetect] Reply already consumed as checkpoint confirmation — keeping pending offer for "${pendingProjectSwitch.name}"`);
      // Continue with the normal flow below; re-offer on a later message.
    } else if (normalized === 'YES') {
      const activeSuffix = autoTracker.hasPendingWarning() ? checkpointSuffix : '';
      const target = pendingProjectSwitch;
      pendingProjectSwitch = null;
      console.log(`[ProjectAutoDetect] User confirmed — executing one-shot switch to: ${target.path}`);
      return await executeProjectSwitch(target.path, userPrompt, attachmentNotice, activeSuffix, ctl);
    } else if (normalized === 'NO' || normalized === 'NEIN') {
      console.log(`[ProjectAutoDetect] Switch to "${pendingProjectSwitch.name}" declined — keeping current working directory`);
      pendingProjectSwitch = null;
      // Continue with the normal flow below.
    } else {
      // Non-confirmation reply while an offer is pending → expire it (the "next message" contract).
      console.log(`[ProjectAutoDetect] Non-confirmation reply — expiring switch offer for "${pendingProjectSwitch.name}"`);
      pendingProjectSwitch = null;
    }
  }


  // Step 1: Directory detection (highest priority)
  const detectedPath = detectDirectoryPath(userPrompt);
  if (detectedPath) {
    let base = injectWorkingDirectoryPrompt(userPrompt + attachmentNotice, detectedPath) + checkpointSuffix;
    
    return base + getTemporalSuffix(ctl);
  }
  
  // Step 2: Document RAG processing (if enabled)
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const documentRAGEnabled = pluginConfig.get('documentRAG');
  
  console.log(`[RAG] documentRAG enabled: ${documentRAGEnabled}`);
  
  if (!documentRAGEnabled) {
    // If RAG is disabled, just return the message with attachment notice and checkpoint warning
    const base = userPrompt + attachmentNotice + checkpointSuffix;
    return base + getTemporalSuffix(ctl);
  }

  const newFiles = allFiles.filter(f => f.type !== 'image');
  console.log(`[RAG] Found ${newFiles.length} non-image files`);
  
  if (newFiles.length === 0) {
    const base = userPrompt + attachmentNotice + checkpointSuffix;
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
      const filteredEntries = (result?.entries || []).filter(
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

  // 🔹 Inject checkpoint confirmation prompt if triggered/pending from Step 0.5
  let finalMessage = userPrompt + attachmentNotice + checkpointSuffix;

  // Inject context if results found
  if (allResults.length > 0) {
    let contextInjection = '';
    for (const result of allResults) {
      contextInjection += `\n${result.content}\n---\n`;
    }

    return `${finalMessage}\n\n--- RELEVANT DOCUMENT CONTEXT ---\n${contextInjection.trim()}` + getTemporalSuffix(ctl);
  }

  // If no results found, return original message with attachment notice
  console.log('[RAG] No relevant results found');
  const base = finalMessage;
  return base + getTemporalSuffix(ctl);
}
