import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';
import * as path from 'path';
import * as fs from 'fs';
import type { PluginConfig } from '../config.js';

// ==================== Typed Params Interfaces ====================

interface RagIndexFilesParams {
  directoryPath: string;
  filePattern?: string;
  batchSize?: number;
}

interface RagQueryVectorParams {
  query: string;
  topK?: number;
}

interface RagClearIndexParams {
  confirm: boolean;
}

interface RagWebContentParams {
  url: string;
  query: string;
}

// ==================== Types ====================

interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    file_path: string;
    file_name: string;
    chunk_index: number;
    total_chunks: number;
    word_count: number;
  };
}

interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata: DocumentChunk['metadata'];
}

// ==================== Persistent Vector Store (Singleton) ====================

/** Simple persistent vector store using in-memory storage with cosine similarity */
class LocalVectorStore {
  private documents: Map<string, { embedding: Float32Array; chunk: DocumentChunk }> = new Map();
  private indexName: string;

  constructor(indexName: string = 'ai_toolbox_rag') {
    this.indexName = indexName;
  }

  /** Add documents to the store */
  add(documents: DocumentChunk[]): void {
    for (const doc of documents) {
      this.documents.set(doc.id, { embedding: new Float32Array(0), chunk: doc });
    }
  }

  /** Set embeddings for all documents */
  setEmbeddings(ids: string[], embeddings: Float32Array[]): void {
    ids.forEach((id, i) => {
      const entry = this.documents.get(id);
      if (entry) {
        entry.embedding = embeddings[i];
      }
    });
  }

  /** Search for similar documents */
  search(queryEmbedding: Float32Array, topK: number): SearchResult[] {
    const results: Array<{ id: string; score: number }> = [];

    for (const [id, entry] of this.documents.entries()) {
      if (entry.embedding.length === 0) continue;
      
      // Cosine similarity
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      for (let i = 0; i < entry.embedding.length; i++) {
        dotProduct += queryEmbedding[i] * entry.embedding[i];
        normA += entry.embedding[i] * entry.embedding[i];
        normB += queryEmbedding[i] * queryEmbedding[i];
      }

      const similarity = normA > 0 && normB > 0 ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
      
      results.push({ id, score: similarity });
    }

    // Sort by similarity descending and return top K
    return results
      .sort((a, b) => b.score - b.score)
      .slice(0, topK)
      .map(({ id, score }) => {
        const entry = this.documents.get(id);
        if (!entry) return null;
        return {
          id: entry.chunk.id,
          text: entry.chunk.text,
          score,
          metadata: entry.chunk.metadata,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  }

  /** Clear all documents */
  clear(): void {
    this.documents.clear();
  }

  /** Get document count */
  get count(): number {
    return this.documents.size;
  }
}

// Singleton instance that persists across tool calls
let sharedStore: LocalVectorStore | null = null;

function getSharedStore(): LocalVectorStore {
  if (!sharedStore) {
    sharedStore = new LocalVectorStore();
  }
  return sharedStore;
}

// ==================== Text Chunking ====================

/** Split text into chunks with overlap */
function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): DocumentChunk[] {
  const words = text.split(/\s+/);
  const chunks: DocumentChunk[] = [];
  
  if (words.length <= chunkSize) {
    return [{
      id: `chunk_${Date.now()}_0`,
      text: text,
      metadata: {
        file_path: '',
        file_name: '',
        chunk_index: 0,
        total_chunks: 1,
        word_count: words.length,
      },
    }];
  }

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkText = words.slice(startIndex, endIndex).join(' ');
    
    chunks.push({
      id: `chunk_${Date.now()}_${chunkIndex}`,
      text: chunkText,
      metadata: {
        file_path: '', // Will be set later
        file_name: '', // Will be set later
        chunk_index: chunkIndex,
        total_chunks: Math.ceil(words.length / (chunkSize - overlap)),
        word_count: endIndex - startIndex,
      },
    });

    chunkIndex++;
    startIndex = endIndex - overlap;
  }

  return chunks;
}

/** Generate simple TF-IDF-like embeddings for text */
function generateEmbedding(text: string): Float32Array {
  // Simple word frequency-based embedding (dimension: 100)
  const dimensions = 100;
  const embedding = new Float32Array(dimensions);
  
  // Tokenize and hash words to dimensions
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  const wordSet = new Set(words);
  
  for (const word of wordSet) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    const dimIndex = Math.abs(hash % dimensions);
    embedding[dimIndex] += 1.0 / (word.length + 1); // Weight by inverse length
  }

  // Normalize
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += embedding[i] * embedding[i];
  }
  norm = Math.sqrt(norm) || 1;
  
  for (let i = 0; i < dimensions; i++) {
    embedding[i] /= norm;
  }

  return embedding;
}

// ==================== Tool Implementations ====================

/**
 * Index files in a directory for semantic search.
 */
async function ragIndexFiles({ 
  directoryPath, 
  batchSize = 10 
}: RagIndexFilesParams): Promise<unknown> {
  try {
    // Validate directory exists
    if (!fs.existsSync(directoryPath)) {
      return { success: false, error: `Directory not found: ${directoryPath}` };
    }

    const store = getSharedStore();
    let indexedCount = 0;
    let skippedCount = 0;

    // Find files matching pattern
    const findFiles = (dir: string): string[] => {
      let results: string[] = [];
      
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            // Skip node_modules and .git directories
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            results = results.concat(findFiles(fullPath));
          } else if (entry.isFile()) {
            // Check file extension against pattern
            const ext = path.extname(entry.name).toLowerCase();
            const allowedExts = ['.ts', '.js', '.tsx', '.jsx', '.md', '.json', '.yaml', '.yml', '.toml', '.txt'];
            
            if (allowedExts.includes(ext)) {
              results.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.error(`[AI Toolbox] Could not read directory ${dir}:`, error);
      }
      
      return results;
    };

    const files = findFiles(directoryPath);
    
    if (files.length === 0) {
      return { success: true, data: { indexedCount: 0, message: 'No matching files found' } };
    }

    // Process each file
    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Skip large files (>1MB)
        if (content.length > 1024 * 1024) {
          skippedCount++;
          continue;
        }

        // Chunk the text
        const chunks = chunkText(content);
        
        // Set metadata for each chunk
        chunks.forEach(chunk => {
          chunk.metadata.file_path = filePath;
          chunk.metadata.file_name = path.basename(filePath);
        });

        // Generate embeddings and add to store
        const ids = chunks.map(c => c.id);
        const embeddings = chunks.map(c => generateEmbedding(c.text));
        
        store.add(chunks);
        store.setEmbeddings(ids, embeddings);
        
        indexedCount += chunks.length;
      } catch (error) {
        console.error(`[AI Toolbox] Could not index ${filePath}:`, error);
        skippedCount++;
      }

      // Progress callback every batch
      if ((indexedCount + skippedCount) % batchSize === 0) {
        process.stdout.write(`\r[AI Toolbox] Indexed ${(indexedCount + skippedCount)} chunks...`);
      }
    }

    process.stdout.write('\n[AI Toolbox] Indexing complete\n');

    return {
      success: true,
      data: {
        indexedChunks: indexedCount,
        filesProcessed: files.length,
        skippedFiles: skippedCount,
        totalDocuments: store.count,
        directoryPath,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `RAG indexing failed: ${message}` };
  }
}

/**
 * Query the vector index for semantically similar documents.
 */
async function ragQueryVector({ query, topK = 5 }: RagQueryVectorParams): Promise<unknown> {
  try {
    const store = getSharedStore();
    
    if (store.count === 0) {
      return { success: false, error: 'No documents indexed. Run rag_index_files first.' };
    }

    // Generate embedding for the query
    const queryEmbedding = generateEmbedding(query);
    
    // Search the actual vector store
    const results = store.search(queryEmbedding, topK);
    
    return {
      success: true,
      data: {
        query,
        topK,
        totalDocuments: store.count,
        results,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `RAG query failed: ${message}` };
  }
}

/**
 * Clear the vector index.
 */
async function ragClearIndex({ confirm }: RagClearIndexParams): Promise<unknown> {
  if (!confirm) {
    return { success: false, error: 'Confirmation required to clear index' };
  }

  const store = getSharedStore();
  store.clear();

  return {
    success: true,
    data: { message: 'Vector index cleared successfully' },
  };
}

/**
 * Fetch content from a URL and use RAG to find relevant chunks.
 */
async function ragWebContent({ url, query }: RagWebContentParams): Promise<unknown> {
  try {
    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return { success: false, error: `Invalid URL: ${url}` };
    }

    // Fetch the content with proper headers to avoid bot detection
    const response = await fetch(parsedUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    // Read the body ONCE and store it
    const content = await response.text();
    
    // Chunk the text
    const chunks = chunkText(content);
    
    if (chunks.length === 0) {
      return { success: false, error: 'No content could be extracted from URL' };
    }

    // Generate embedding for query and find best matching chunk
    const queryEmbedding = generateEmbedding(query);
    let bestMatch: DocumentChunk | null = null;
    let bestScore = -Infinity;

    for (const chunk of chunks) {
      const chunkEmbedding = generateEmbedding(chunk.text);
      
      // Calculate cosine similarity
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < chunkEmbedding.length; i++) {
        dotProduct += queryEmbedding[i] * chunkEmbedding[i];
        normA += chunkEmbedding[i] * chunkEmbedding[i];
        normB += queryEmbedding[i] * queryEmbedding[i];
      }
      
      const similarity = normA > 0 && normB > 0 
        ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) 
        : 0;

      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = chunk;
      }
    }

    return {
      success: true,
      data: {
        url,
        query,
        totalChunks: chunks.length,
        bestMatch: bestMatch ? {
          text: bestMatch.text,
          score: bestScore,
          metadata: bestMatch.metadata,
        } : null,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `RAG search failed: ${message}` };
  }
}

// ==================== Tool Registration ====================

export function registerRagTools(_config: PluginConfig): Tool[] {
  const tools: Tool[] = [];

  // rag_index_files tool
  tools.push(tool({
    name: 'rag_index_files',
    description: 'Index files in a directory for semantic search. Supports TypeScript, JavaScript, Markdown, JSON, YAML, and text files.',
    parameters: {
      directoryPath: z.string().describe('Directory path to index'),
      filePattern: z.string().optional().default('*.{ts,js,tsx,jsx,md,json,yaml,yml,toml,txt}').describe('File pattern to match (glob syntax)'),
      batchSize: z.number().min(1).max(100).optional().default(10).describe('Batch size for progress reporting'),
    },
    implementation: async (params) => ragIndexFiles(params as RagIndexFilesParams),
  }));

  // rag_query_vector tool
  tools.push(tool({
    name: 'rag_query_vector',
    description: 'Query the vector index for semantically similar documents. Returns top-k most relevant chunks.',
    parameters: {
      query: z.string().describe('Search query text'),
      topK: z.number().min(1).max(20).optional().default(5).describe('Number of results to return'),
    },
    implementation: async (params) => ragQueryVector(params as RagQueryVectorParams),
  }));

  // rag_clear_index tool
  tools.push(tool({
    name: 'rag_clear_index',
    description: 'Clear the vector search index. Requires confirmation.',
    parameters: {
      confirm: z.boolean().describe('Set to true to confirm clearing the index'),
    },
    implementation: async (params) => ragClearIndex(params),
  }));

  // rag_web_content tool (NEW)
  tools.push(tool({
    name: 'rag_web_content',
    description: 'Fetch content from a URL, and then use RAG to find and return only the text chunks most relevant to a specific query.',
    parameters: {
      url: z.string().url().describe('The URL to fetch'),
      query: z.string().describe('The search query for relevance matching'),
    },
    implementation: async (params) => ragWebContent(params),
  }));

  return tools;
}
