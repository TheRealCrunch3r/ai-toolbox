/**
 * Document RAG Prompt Preprocessor + Working Directory Detection
 * 
 * Handles:
 * 1. Document attachments and semantic retrieval for "Chat with Files" feature.
 * 2. Detects directory paths in user messages and prompts LLM to ask for confirmation
 *    before changing the working directory.
 */

import {
  type ChatMessage,
  type FileHandle,
  type PromptPreprocessorController,
} from '@lmstudio/sdk';

import { configSchematics } from './config';

/**
 * Detects directory/file paths in user messages using regex patterns.
 * Supports Windows (C:\...) and Unix (/home/..., /Users/...) formats.
 */
function detectDirectoryPath(text: string): string | null {
  // Windows path pattern: C:\... or D:\... (handles spaces, dots, slashes)
  const windowsPattern = /[A-Za-z]:\\[\w\.\-_ ]+(?:[\/\\][\w\.\-_ ]+)*/g;
  
  // Unix absolute path pattern: /home/..., /Users/..., /opt/...
  const unixPattern = /\/[\w\.\-_ ]+(?:[\/][\w\.\-_ ]+)*/g;
  
  // Try Windows first
  let match = text.match(windowsPattern);
  if (match) {
    return match[0].trim();
  }
  
  // Then Unix
  match = text.match(unixPattern);
  if (match) {
    return match[0].trim();
  }
  
  return null;
}

/**
 * Injects system instruction to prompt LLM for working directory confirmation.
 */
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

/** Typed retrieval entry interface */
interface RetrievalEntry {
  content: string;
  score: number;
}

/**
 * Main prompt preprocessor function.
 * Handles:
 * 1. Working directory detection and confirmation prompting
 * 2. Document RAG for "Chat with Files" feature
 */
export async function preprocess(
  ctl: PromptPreprocessorController,
  userMessage: ChatMessage
): Promise<string | ChatMessage> {
  const userPrompt = userMessage.getText();
  
  // ==========================================
  // STEP 1: Detect directory paths in user message
  // ==========================================
  const detectedPath = detectDirectoryPath(userPrompt);
  
  if (detectedPath) {
    // Directory path found — inject confirmation prompt
    return injectWorkingDirectoryPrompt(userPrompt, detectedPath);
  }
  
  // ==========================================
  // STEP 2: Document RAG processing (if enabled)
  // ==========================================
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const documentRAGEnabled = pluginConfig.get('documentRAG');
  
  if (!documentRAGEnabled) {
    return userMessage; // Feature disabled, pass through unchanged
  }
  
  // Get files attached to this message (non-image only)
  const newFiles = userMessage.getFiles(ctl.client).filter(f => f.type !== 'image');
  
  if (newFiles.length === 0 && !(await hasAttachedFilesInHistory(ctl))) {
    return userMessage; // No documents to process
  }

  // Get all non-image files from current message + chat history
  const allFiles = await getAllNonImageFiles(ctl, userMessage);
  
  if (allFiles.length === 0) {
    return userMessage;
  }

  // Use retrieval-based approach for semantic search
  return prepareRetrievalResultsContextInjection(ctl, userPrompt, allFiles);
}

/**
 * Check if there are any attached files in chat history.
 */
async function hasAttachedFilesInHistory(ctl: PromptPreprocessorController): Promise<boolean> {
  try {
    const history = await ctl.pullHistory();
    return history.getAllFiles(ctl.client).some(f => f.type !== 'image');
  } catch {
    return false;
  }
}

/**
 * Get all non-image files from current message and chat history (merged, deduplicated).
 * Ensures previously attached files remain in context across multi-turn conversations.
 */
async function getAllNonImageFiles(
  ctl: PromptPreprocessorController,
  userMessage: ChatMessage
): Promise<FileHandle[]> {
  const newFiles = userMessage.getFiles(ctl.client).filter(f => f.type !== 'image');
  
  // Always try to merge with history files for multi-turn document context
  try {
    const history = await ctl.pullHistory();
    const historyFiles = history.getAllFiles(ctl.client).filter(f => f.type !== 'image');
    
    if (newFiles.length === 0) {
      return historyFiles; // No new files, return history files
    }
    
    // Deduplicate: merge new files with unique history files (by file identifier)
    const newFileIds = new Set(newFiles.map(f => f.identifier));
    const uniqueHistoryFiles = historyFiles.filter(f => !newFileIds.has(f.identifier));
    
    return [...newFiles, ...uniqueHistoryFiles];
  } catch {
    // Fallback: return only new files if history fetch fails
    return newFiles;
  }
}

/**
 * Perform semantic retrieval and inject relevant chunks into the prompt.
 * Ensures status indicator is always properly cleaned up.
 */
async function prepareRetrievalResultsContextInjection(
  ctl: PromptPreprocessorController,
  originalUserPrompt: string,
  files: FileHandle[]
): Promise<string> {
  const pluginConfig = ctl.getPluginConfig(configSchematics);
  const retrievalLimit = pluginConfig.get('retrievalLimit');
  const affinityThreshold = pluginConfig.get('retrievalAffinityThreshold');

  // Create status indicator for user feedback
  const retrievingStatus = ctl.createStatus({
    status: 'loading',
    text: `Loading embedding model...`,
  });

  try {
    // Proactively load the embedding model (identical to official rag-v1 plugin)
    const embeddingModelId = "nomic-ai/nomic-embed-text-v1.5-GGUF";
    
    const model = await ctl.client.embedding.model(embeddingModelId, {
      signal: ctl.abortSignal,
    });

    // Update status to indicate retrieval start
    retrievingStatus.setState({
      status: 'loading',
      text: `Retrieving relevant citations for user query...`,
    });

    // Use LM Studio's built-in retrieval API with the loaded model
    const result = await ctl.client.files.retrieve(originalUserPrompt, files, {
      embeddingModel: model, // Explicitly pass the loaded model
      limit: retrievalLimit,
      signal: ctl.abortSignal,
      onFileProcessList(filesToProcess) {
        for (const file of filesToProcess) {
          retrievingStatus.setState({
            status: 'loading',
            text: `Processing ${file.name}...`,
          });
        }
      },
      onFileProcessingStart(file) {
        retrievingStatus.setState({
          status: 'loading',
          text: `Embedding chunks from ${file.name}...`,
        });
      },
      onFileProcessingEnd(file) {
        retrievingStatus.setState({
          status: 'done',
          text: `Processed ${file.name}`,
        });
      },
    });

    // Filter results by affinity threshold
    const relevantEntries = result.entries.filter(entry => entry.score >= affinityThreshold);

    if (relevantEntries.length === 0) {
      retrievingStatus.setState({
        status: 'error',
        text: `No relevant content found in attached documents (threshold: ${affinityThreshold})`,
      });
      
      return buildNoResultsMessage(originalUserPrompt);
    }

    // Format retrieval results
    retrievingStatus.setState({
      status: 'done',
      text: `Retrieved ${relevantEntries.length} relevant chunk(s) from ${files.length} document(s)`,
    });

    ctl.debug(`Retrieved ${relevantEntries.length} relevant chunks with affinity threshold ${affinityThreshold}`);

    return buildRetrievalMessage(relevantEntries, originalUserPrompt);

  } catch (error) { // H1 FIX: Properly typed error handling
    // Handle abort signal gracefully
    if (error instanceof Error && (error.name === 'AbortError' || error.message?.includes('abort'))) {
      retrievingStatus.setState({
        status: 'canceled',
        text: 'Retrieval canceled by user',
      });
      throw error; // Re-throw to signal cancellation
    }

    const errorMessage = error instanceof Error ? error : String(error);
    
    // Check if the error is due to missing embedding model
    const messageStr = typeof errorMessage === 'string' ? errorMessage : errorMessage.message || '';
    const isMissingModelError = messageStr.includes('Embedding model');
    
    retrievingStatus.setState({
      status: 'error',
      text: isMissingModelError 
        ? `RAG requires an embedding model. Please load 'nomic-embed-text-v1.5' in LM Studio.`
        : `Retrieval failed: ${messageStr || 'Unknown error'}`,
    });
    
    ctl.debug(`RAG retrieval error:`, errorMessage);
    
    // Fallback: return original prompt so conversation can continue
    return originalUserPrompt;
  }
}

/**
 * Build message when no relevant results are found.
 */
function buildNoResultsMessage(originalUserPrompt: string): string {
  const note = `Important: No citations were found in the attached documents for your query.\n\n`;
  const instruction = `Please respond to the best of your ability without document context.`;
  
  return `${note}\n${instruction}\n\n---\nUser Query:\n\n${originalUserPrompt}`;
}

/**
 * Build message with retrieved document chunks.
 */
function buildRetrievalMessage(
  entries: RetrievalEntry[], // H1 FIX: Properly typed instead of any[]
  originalUserPrompt: string
): string {
  const prefix = `The following excerpts were retrieved from your attached documents based on semantic relevance:\n\n`;
  
  let processedContent = prefix;
  
  entries.forEach((entry, index) => {
    // Truncate very long chunks to avoid context overflow
    const maxChunkLength = 2000;
    let content = entry.content;
    if (content.length > maxChunkLength) {
      content = content.substring(0, maxChunkLength) + '... [truncated]';
    }
    
    processedContent += `**Relevant Excerpt ${index + 1}** (relevance: ${(entry.score * 100).toFixed(0)}%):\n`;
    processedContent += `${content}\n\n---\n\n`;
  });

  const suffix = `Use the excerpts above to inform your response. Only cite information that is directly relevant to the user's query.\n\nUser Query:\n\n${originalUserPrompt}`;
  
  return processedContent + suffix;
}
