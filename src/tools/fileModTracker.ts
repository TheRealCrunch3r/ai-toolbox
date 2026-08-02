/**
 * File Modification Tracker — Tracks consecutive file modifications per path within a session.
 * 
 * PURPOSE: When the LLM rapidly calls multiple tools on the same file, each tool reads from
 * disk independently and operates correctly in isolation. The corruption happens because the
 * LLM's context contains STALE line numbers that don't account for previous operations' effects.
 * 
 * This tracker counts consecutive modifications per file path and:
 * - 1st op: silent (safe)
 * - 2nd op: warning returned in response
 * - 3rd+ op: strong recommendation to use pattern-based or save_file instead
 * 
 * NOTE: Since Node.js is single-threaded, operations execute sequentially. The lock is NOT
 * needed — each tool naturally waits for the previous one to complete before reading disk.
 */

interface FileModEntry {
    path: string;
    count: number;
    lastOpType: string;
}

const tracker = new Map<string, FileModEntry>();

/**
 * Record a file modification and return guidance for the LLM based on operation count.
 * 
 * @param filePath - The absolute file path that was just modified
 * @param opType - Type of operation performed (e.g., 'insert', 'replace', 'delete')
 * @returns Guidance message if this is a repeated operation on the same file, or null if first-time
 */
export function recordFileModification(
    filePath: string, 
    opType: string
): { guidance: string | null; count: number } {
    const existing = tracker.get(filePath);
    
    if (existing && existing.path === filePath) {
        // Same file modified again — increment counter
        existing.count++;
        existing.lastOpType = opType;
        
        let guidance: string | null = null;
        
        if (existing.count === 2) {
            guidance = `\n⚠️ Note: This is the ${existing.count}nd modification to '${filePath}' in this session. ` +
                `Line numbers from earlier reads may have shifted. Consider using pattern-based operations or re-reading the file for accurate line positions.`;
        } else if (existing.count >= 3) {
            guidance = `\n🛑 WARNING: This is the ${existing.count}th modification to '${filePath}' in this session. ` +
                `Line numbers are highly likely to be stale. ` +
                `ALTERNATIVE: Use 'save_file' with full content replacement, or use \`replace_text_in_file\` with pattern matching instead of line-number-based operations.`;
        }
        
        return { guidance, count: existing.count };
    } else {
        // New file modification — record it
        tracker.set(filePath, { path: filePath, count: 1, lastOpType: opType });
        return { guidance: null, count: 1 };
    }
}

/**
 * Get the current modification count for a specific file.
 */
export function getFileModCount(filePath: string): number {
    const entry = tracker.get(filePath);
    return entry ? entry.count : 0;
}

/**
 * Reset tracking for all files (call at session boundaries).
 */
export function resetTracking(): void {
    tracker.clear();
}
