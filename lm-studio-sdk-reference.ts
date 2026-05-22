/**
 * LM Studio SDK (TypeScript) - Core Interfaces & Classes Reference
 * 
 * Extracted from @lmstudio/sdk type definitions.
 * Use this file as a quick reference for building AI Toolbox plugins and integrations.
 */

// ==========================================
// 1. CLIENT SETUP & CONNECTION
// ==========================================

/** Main entry point to interact with LM Studio */
declare class LMStudioClient {
    readonly llm: LLMNamespace;
    readonly embedding: EmbeddingNamespace;
    readonly system: SystemNamespace;
    readonly plugins: PluginsNamespace;
    
    constructor(opts?: LMStudioClientConstructorOpts);
}

interface LMStudioClientConstructorOpts {
    baseUrl?: string;          // e.g., "ws://127.0.0.1:4438"
    verboseErrorMessages?: boolean;
    clientIdentifier?: string;
    logger?: LoggerInterface;
}

// ==========================================
// 2. LLM PREDICTION & STREAMING
// ==========================================

/** Handle for interacting with a loaded LLM */
declare class LLMDynamicHandle {
    /** Generate text from a prompt (single turn) */
    complete<T>(prompt: string, opts?: LLMPredictionOpts<T>): OngoingPrediction<T>;
    
    /** Generate text based on chat history (multi-turn) */
    respond<T>(chat: ChatLike, opts?: LLMRespondOpts<T>): OngoingPrediction<T>;
    
    /** Advanced tool-use / agent loop */
    act(chat: ChatLike, tools: Array<Tool>, opts?: LLMActionOpts): Promise<ActResult>;
}

/** Represents an ongoing streaming prediction. Acts as both a Promise and AsyncIterable */
declare class OngoingPrediction<TStructuredOutputType = unknown> extends StreamablePromise<LLMPredictionFragment, any> {
    /** Get final result (waits if still streaming) */
    result(): Promise<PredictionResult | StructuredPredictionResult>;
    
    /** Cancel the ongoing generation */
    cancel(): Promise<void>;
}

/** Final result of a prediction */
declare class PredictionResult {
    readonly content: string;           // Generated text
    readonly stats: LLMPredictionStats; // Tokens/sec, time, etc.
    readonly modelInfo: LLMInstanceInfo;
}

interface LLMPredictionOpts<T> {
    maxTokens?: number | false;
    temperature?: number;
    stopStrings?: string[];
    structured?: { parse: (input: any) => T }; // Zod schema integration
    signal?: AbortSignal;
    
    // Streaming callbacks
    onPredictionFragment?: (fragment: LLMPredictionFragment) => void;
    onFirstToken?: () => void;
}

// ==========================================
// 3. TOOLS & FUNCTION CALLING
// ==========================================

/** Define a tool for the LLM to use */
declare function tool<TParams extends Record<string, { parse(input: any): any }>>(config: {
    name: string;
    description: string;
    parameters: TParams; // Zod schemas
    implementation: (params: InferToolParams<TParams>, ctx: ToolCallContext) => any | Promise<any>;
}): Tool;

/** Context provided to tool implementations */
interface ToolCallContext {
    status(text: string): void;   // Update UI status
    warn(text: string): void;     // Report non-fatal errors
    signal: AbortSignal;          // Cancelation signal
    callId: number;               // Unique ID for this tool call
}

// ==========================================
// 4. RETRIEVAL / RAG (Retrieval Augmented Generation)
// ==========================================

/** Options for the retrieval system */
interface RetrievalOpts {
    limit?: number;
    embeddingModel?: EmbeddingDynamicHandle;
    chunkingMethod?: { type: "recursive-v1"; chunkSize: number; chunkOverlap: number };
    signal?: AbortSignal;
}

// ==========================================
// 5. SIGNALS & STATE MANAGEMENT (Reactive)
// ==========================================

/** Basic reactive signal */
declare class Signal<TValue> {
    static create<T>(initial: T, equals?: (a: T, b: T) => boolean): [Signal<T>, Setter<T>];
    get(): TValue;
    subscribe(listener: (val: TValue) => void): () => void; // Returns unsubscribe fn
}

/** Lazy signal that only subscribes when needed */
declare class LazySignal<TData> extends Signal<TData> {
    static create<T>(initial: T, subscribeUpstream: (...args: any[]) => any): LazySignal<T>;
    isStale(): boolean;
    pull(): Promise<StripNotAvailable<TData>>; // Waits for fresh data if stale
}

/** Optimistic Writable Lazy Signal (High performance state management) */
declare class OWLSignal<TData> extends Signal<TData> {
    static create<T>(initial: T, writeUpstream: (...args: any[]) => boolean): [OWLSignal<T>, Setter<T>, ...];
}

type Setter<T> = {
    (value: T): void;
    withProducer(producer: (draft: T) => void): void; // Immer-style updates
};

// ==========================================
// 6. UTILITIES & TYPES
// ==========================================

/** Helper to format multi-line strings cleanly */
declare function text(strings: TemplateStringsArray, ...values: any[]): string;

interface LoggerInterface {
    info(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
}
