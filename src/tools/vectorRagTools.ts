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

interface RagIndexPdfParams {
  filePath: string;
  chunkSize?: number; // Words per chunk (default: 300)
  overlap?: number;   // Overlapping words between chunks (default: 50)
}

interface RagIndexDocxParams {
  filePath: string;
  chunkSize?: number; // Words per chunk (default: 300)
  overlap?: number;   // Overlapping words between chunks (default: 50)
}

interface RagIndexXlsxParams {
  filePath: string;
  chunkSize?: number; // Rows per chunk (default: 100)
  includeSheetNames?: boolean; // Include sheet name in each row (default: true)
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
    page_number?: number;      // PDF-specific: page where this chunk originates
    total_pages?: number;       // PDF-specific: total pages in the source document
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

/** Chunk PDF text per-page with page number metadata */
function chunkPdfText(
  pdfText: string,
  totalPages: number,
  chunkSize: number = 300,
  overlap: number = 50
): DocumentChunk[] {
  const pages = pdfText.split(/(?<=^)\s*Page\s*\d+\s*/m);
  // First element is usually empty preamble — skip it
  const pageContents = pages.filter(p => p.trim().length > 0);

  if (pageContents.length === 0) {
    // Fallback: treat entire text as one "page"
    return chunkText(pdfText, chunkSize, overlap).map(chunk => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        file_path: '',
        file_name: '',
        page_number: 1,
        total_pages: totalPages,
      },
    }));
  }

  const chunks: DocumentChunk[] = [];

  for (let pageIndex = 0; pageIndex < pageContents.length; pageIndex++) {
    const pageText = pageContents[pageIndex];
    const words = pageText.split(/\s+/);

    let startIndex = 0;
    let chunkIndexInPage = 0;

    while (startIndex < words.length) {
      const endIndex = Math.min(startIndex + chunkSize, words.length);
      const chunkWords = words.slice(startIndex, endIndex);
      const chunkTextStr = chunkWords.join(' ');

      chunks.push({
        id: `pdf_chunk_${Date.now()}_${pageIndex}_${chunkIndexInPage}`,
        text: chunkTextStr,
        metadata: {
          file_path: '', // Set later
          file_name: '', // Set later
          chunk_index: pageIndex * 100 + chunkIndexInPage,
          total_chunks: Math.ceil(words.length / (chunkSize - overlap)),
          word_count: endIndex - startIndex,
          page_number: pageIndex + 1, // 1-based
          total_pages: totalPages,
        },
      });

      chunkIndexInPage++;
      startIndex = endIndex - overlap;
    }
  }

  return chunks;
}

/** Chunk DOCX text with word-bounded splitting */
function chunkDocxText(docxText: string, chunkSize: number = 300, overlap: number = 50): DocumentChunk[] {
  const words = docxText.split(/\s+/);

  if (words.length <= chunkSize) {
    return [{
      id: `docx_chunk_${Date.now()}_0`,
      text: docxText,
      metadata: {
        file_path: '', // Set later
        file_name: '', // Set later
        chunk_index: 0,
        total_chunks: 1,
        word_count: words.length,
      },
    }];
  }

  const chunks: DocumentChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkTextStr = words.slice(startIndex, endIndex).join(' ');

    chunks.push({
      id: `docx_chunk_${Date.now()}_${chunkIndex}`,
      text: chunkTextStr,
      metadata: {
        file_path: '', // Set later
        file_name: '', // Set later
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

/** Chunk spreadsheet data into row-based chunks with sheet awareness */
function chunkXlsxData(
  sheets: Array<{ name: string; rows: string[] }>,
  chunkSize: number = 100,
  includeSheetNames: boolean = true
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let globalIndex = 0;

  for (const sheet of sheets) {
    if (sheet.rows.length === 0) continue;

    // Each row becomes a line in the chunk text
    let startIndex = 0;

    while (startIndex < sheet.rows.length) {
      const endIndex = Math.min(startIndex + chunkSize, sheet.rows.length);
      const rowsSlice = sheet.rows.slice(startIndex, endIndex);
      const prefix = includeSheetNames ? `${sheet.name}: ` : '';
      const chunkTextStr = rowsSlice.map(r => prefix + r).join('\n');

      chunks.push({
        id: `xlsx_chunk_${Date.now()}_${globalIndex}`,
        text: chunkTextStr,
        metadata: {
          file_path: '', // Set later
          file_name: '', // Set later
          chunk_index: globalIndex,
          total_chunks: Math.ceil(sheet.rows.length / chunkSize),
          word_count: chunkTextStr.split(/\s+/).length,
          page_number: globalIndex + 1, // Reuse as "chunk number" for consistency
          total_pages: chunks.length + 1,
        },
      });

      globalIndex++;
      startIndex = endIndex;
    }
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
      return { success: false, error: 'No documents indexed. Run rag_index_files, rag_index_pdf, rag_index_docx, or rag_index_xlsx first.' };
    }

    // Generate embedding for the query
    const queryEmbedding = generateEmbedding(query);

    // Search the actual vector store
    const results = store.search(queryEmbedding, topK);

    // Calculate average score for confidence note
    const avgScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
      : 0;
    
    let confidenceNote = `Semantic similarity search — ${results.length} result(s) found`;
    if (avgScore >= 0.7) {
      confidenceNote += ' — high relevance';
    } else if (avgScore >= 0.4) {
      confidenceNote += ' — moderate relevance';
    } else {
      confidenceNote += ' — low relevance';
    }

    return {
      success: true,
      data: {
        query,
        topK,
        totalDocuments: store.count,
        results,
        confidence: 'INFERRED' as const, // Semantic similarity = inferred relevance (graphify pattern)
        provenance: 'rag_query_vector' as const,
        note: confidenceNote,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `RAG query failed: ${message}` };
  }
}

/**
 * Index a PDF file for semantic search by extracting paginated text chunks.
 */
async function ragIndexPdf({ filePath, chunkSize = 300, overlap = 50 }: RagIndexPdfParams): Promise<unknown> {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.pdf') {
      return { success: false, error: `Only PDF files are supported. Got: ${ext}` };
    }

    // Validate file size (max 100MB to prevent OOM)
    const stats = fs.statSync(filePath);
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (stats.size > maxSize) {
      return { success: false, error: `File too large (${(stats.size / 1024 / 1024).toFixed(1)}MB), max is 100MB` };
    }

    const store = getSharedStore();

    // Load PDF and extract text using pdf-parse
    const dataBuffer = fs.readFileSync(filePath);
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(dataBuffer);

    console.log(`[AI Toolbox] PDF loaded: ${result.numpages} pages, ${(result.text.length / 1024).toFixed(1)}KB raw text`);

    // Chunk by page with page number metadata
    const chunks = chunkPdfText(result.text, result.numpages, chunkSize, overlap);

    if (chunks.length === 0) {
      return { success: true, data: { indexedChunks: 0, message: 'PDF contained no extractable text' } };
    }

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

    return {
      success: true,
      data: {
        indexedChunks: chunks.length,
        totalPages: result.numpages,
        rawTextSizeKB: (result.text.length / 1024).toFixed(1),
        chunkSizeWords: chunkSize,
        overlapWords: overlap,
        totalDocumentsAfterIndexing: store.count,
        filePath,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `PDF indexing failed: ${message}` };
  }
}


/**
 * Index a DOCX file for semantic search by extracting text via mammoth.
 */
async function ragIndexDocx({ filePath, chunkSize = 300, overlap = 50 }: RagIndexDocxParams): Promise<unknown> {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.docx') {
      return { success: false, error: `Only DOCX files are supported. Got: ${ext}` };
    }

    // Validate file size (max 50MB)
    const stats = fs.statSync(filePath);
    const maxSize = 50 * 1024 * 1024;
    if (stats.size > maxSize) {
      return { success: false, error: `File too large (${(stats.size / 1024 / 1024).toFixed(1)}MB), max is 50MB` };
    }

    const store = getSharedStore();

    // Load DOCX and extract raw text using mammoth
    const dataBuffer = fs.readFileSync(filePath);
    const mammoth = await import('mammoth');
    const mammothTyped = mammoth as unknown as { extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string; messages: Array<{ message: string }> }> };
    const result = await mammothTyped.extractRawText({ buffer: dataBuffer });

    console.log(`[AI Toolbox] DOCX loaded: ${(result.value.length / 1024).toFixed(1)}KB text`);

    // Chunk the extracted text
    const chunks = chunkDocxText(result.value, chunkSize, overlap);

    if (chunks.length === 0) {
      return { success: true, data: { indexedChunks: 0, message: 'DOCX contained no extractable text' } };
    }

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

    return {
      success: true,
      data: {
        indexedChunks: chunks.length,
        rawTextSizeKB: (result.value.length / 1024).toFixed(1),
        chunkSizeWords: chunkSize,
        overlapWords: overlap,
        totalDocumentsAfterIndexing: store.count,
        filePath,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `DOCX indexing failed: ${message}` };
  }
}

/**
 * Index an XLS/XLSX spreadsheet for semantic search by extracting row data.
 */
async function ragIndexXlsx({ filePath, chunkSize = 100, includeSheetNames }: RagIndexXlsxParams): Promise<unknown> {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      // Try to detect format by extension; xls requires xlsx library which may not be installed
      return { success: false, error: `Only XLSX files are supported. Got: ${ext}. For XLS support, install 'xlsx' package.` };
    }

    // Validate file size (max 50MB)
    const stats = fs.statSync(filePath);
    const maxSize = 50 * 1024 * 1024;
    if (stats.size > maxSize) {
      return { success: false, error: `File too large (${(stats.size / 1024 / 1024).toFixed(1)}MB), max is 50MB` };
    }

    const store = getSharedStore();

    // Load XLSX and extract sheet data using xlsx library
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
    let xlsx: any;
    try {
      xlsx = await import('xlsx');
    } catch {
      return { success: false, error: `xlsx package not installed. Run: npm install xlsx` };
    }

    const dataBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(dataBuffer, { type: 'buffer' });

    // Extract all sheets as arrays of rows (each row is a comma-separated string)
    const sheets: Array<{ name: string; rows: string[] }> = [];
    for (const sheetName of workbook.SheetNames) {
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      // Convert each row to a comma-separated string for readability in chunks
      const rows = sheetData.map((row: any[]) => row.map(cell => cell ?? '').join(', ')) as string[];
      sheets.push({ name: sheetName, rows });
    }

    console.log(`[AI Toolbox] XLSX loaded: ${workbook.SheetNames.length} sheets`);

    // Chunk the spreadsheet data
    const chunks = chunkXlsxData(sheets, chunkSize, includeSheetNames ?? true);

    if (chunks.length === 0) {
      return { success: true, data: { indexedChunks: 0, message: 'XLSX contained no extractable data' } };
    }

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

    return {
      success: true,
      data: {
        indexedChunks: chunks.length,
        sheetsCount: (workbook.SheetNames as string[]).length,
        sheetNames: workbook.SheetNames as string[],
        chunkSizeRows: chunkSize,
        totalDocumentsAfterIndexing: store.count,
        filePath,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `XLSX indexing failed: ${message}` };
  }
}


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


  // rag_index_pdf tool (NEW) — Index PDF files for semantic search with page-aware chunks
  tools.push(tool({
    name: 'rag_index_pdf',
    description: 'Index a PDF file for semantic search by extracting paginated text chunks. Each chunk preserves its page number for traceable results.',
    parameters: {
      filePath: z.string().describe('Path to the PDF file'),
      chunkSize: z.number().min(50).max(1000).optional().default(300).describe('Words per chunk (default: 300)'),
      overlap: z.number().min(0).max(200).optional().default(50).describe('Overlapping words between chunks (default: 50)'),
    },
    implementation: async (params) => ragIndexPdf(params as RagIndexPdfParams),
  }));


  // rag_index_docx tool (NEW) — Index DOCX files for semantic search using mammoth extraction
  tools.push(tool({
    name: 'rag_index_docx',
    description: 'Index a DOCX file for semantic search by extracting text via mammoth. Chunks are word-bounded with configurable size.',
    parameters: {
      filePath: z.string().describe('Path to the DOCX file'),
      chunkSize: z.number().min(50).max(1000).optional().default(300).describe('Words per chunk (default: 300)'),
      overlap: z.number().min(0).max(200).optional().default(50).describe('Overlapping words between chunks (default: 50)'),
    },
    implementation: async (params) => ragIndexDocx(params as RagIndexDocxParams),
  }));

  // rag_index_xlsx tool (NEW) — Index XLSX spreadsheets for semantic search by extracting row data per sheet
  tools.push(tool({
    name: 'rag_index_xlsx',
    description: 'Index an XLSX spreadsheet for semantic search. Each sheet is chunked into rows with optional sheet-name prefix.',
    parameters: {
      filePath: z.string().describe('Path to the XLSX file'),
      chunkSize: z.number().min(10).max(500).optional().default(100).describe('Rows per chunk (default: 100)'),
      includeSheetNames: z.boolean().optional().default(true).describe('Include sheet name prefix in each row (default: true)'),
    },
    implementation: async (params) => ragIndexXlsx(params as RagIndexXlsxParams),
  }));

  return tools;
}
