
// Type declarations for external modules without built-in types

declare module 'node:sqlite' {
  export interface Database {
    prepare(query: string): Statement;
    close(): void;
  }
  
  export interface Statement {
    all(...params: any[]): any[];
    get(...params: any[]): any | undefined;
    run(...params: any[]): { lastInsertRowid: number; changes: number };
    iterate(...params: any[]): IterableIterator<any>;
    values(...params: any[]): IterableIterator<any>;
  }
  
  export function open(path: string): Database;
}

declare module 'html-to-text' {
  function htmlToText(html: string, options?: any): string;
  export { htmlToText };
}

declare module 'puppeteer' {
  interface Browser {
    newPage(): Promise<Page>;
    close(): void;
    readonly connected: boolean; // v24: getter property, NOT a method — matches installed puppeteer 24.43.1 runtime shape
  }
  
  interface Page {
    goto(url: string, options?: any): Promise<void>;
    evaluate<T>(pageFunction: string | ((...args: any[]) => T | Promise<T>), ...args: any[]): Promise<T>;
    click(selector: string): Promise<void>;
    type(selector: string, text: string): Promise<void>;
    waitForSelector(selector: string, options?: any): Promise<void>;
    screenshot(options?: any): Promise<void>;
    url(): Promise<string>;
  }
  
  function launch(options?: any): Promise<Browser>;
}

declare module 'duck-duck-scrape' {
  interface SearchResult {
    results: Array<{ title: string; url: string; description: string }>;
  }
  
  export function search(query: string, options?: any): Promise<SearchResult>;
}

declare module 'simple-git' {
  interface SimpleGit {
    status(): Promise<any>;
    diff(paths?: string[]): Promise<string>;
    commit(message: string): Promise<void>;
    log(count?: number): Promise<{ all: any[] }>;
    add(paths?: string | string[]): Promise<void>;
    checkout(branch: string): Promise<void>;
    checkoutLocalBranch(branch: string): Promise<void>;
    push(remote: string, ref: string): Promise<void>;
    raw(args: string[]): Promise<string>;
  }
  
  function simpleGit(): SimpleGit;
  export default simpleGit;
}

declare module 'open' {
  function open(target: string): Promise<void>;
  export default open;
}

declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    version?: string;
    info?: any;
    metadata?: any;
    refId?: any;
    source?: any;
  }
  
  function pdfParse(data: Buffer, options?: any): Promise<PDFData>;
  export default pdfParse;
}

declare module 'mammoth' {
  interface ExtractRawTextOptions {
    buffer: Buffer | ArrayBuffer;
  }
  
  interface ExtractResult {
    value: string;
    messages: Array<{ type: string; message?: string }>;
  }
  
  function extractRawText(options: ExtractRawTextOptions): Promise<ExtractResult>;
  export default { extractRawText };
}


declare module 'markdown-it' {
  class MarkdownItClass {
    constructor(options?: Record<string, unknown>);
    render(source: string): string;
  }
  export default MarkdownItClass;
}
