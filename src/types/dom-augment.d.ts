/**
 * DOM Type Augmentation for Missing Iterable Methods
 * 
 * WORKAROUND for TypeScript DOM lib bug (GitHub #1069, #53692):
 * Headers, FormData, and URLSearchParams are iterable at runtime but missing
 * [Symbol.iterator](), .entries(), .keys(), .values() in lib.dom.d.ts type definitions.
 * 
 * This augmentation adds the missing methods to make TypeScript aware of what's
 * already available at runtime in all modern browsers (Chrome, Edge, Firefox).
 * 
 * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1069
 * @see https://github.com/microsoft/TypeScript/issues/53692
 */

interface Headers {
    /** Returns an iterator allowing iteration over all key/value pairs */
    [Symbol.iterator](): IterableIterator<[string, string]>;
    
    /** Returns an iterator allowing iteration over all key/value pairs (equivalent to Symbol.iterator) */
    entries(): IterableIterator<[string, string]>;
    
    /** Returns an iterator allowing iteration over all header names */
    keys(): IterableIterator<string>;
    
    /** Returns an iterator allowing iteration over all header values */
    values(): IterableIterator<string>;
}

interface FormData {
    [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
    entries(): IterableIterator<[string, FormDataEntryValue]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<FormDataEntryValue>;
}

interface URLSearchParams {
    [Symbol.iterator](): IterableIterator<[string, string]>;
    entries(): IterableIterator<[string, string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
}
