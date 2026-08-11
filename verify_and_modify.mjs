/**
 * Robust Pre-Flight Verification & Modification System
 * 
 * Ensures all mutable operations verify fresh content before proceeding,
 * preventing file corruption from stale line numbers or drifted patterns.
 */

import fs from 'fs';
import path from 'path';

// Configuration for verification modes
const CONFIG = {
  // Strict mode: abort on ANY mismatch (recommended for production)
  strictMode: true,
  
  // Maximum file size to read (in bytes) - prevents OOM on huge files
  maxFileSize: 1000000, // 1MB
  
  // Verification timeout in milliseconds
  verificationTimeout: 5000,
};

/**
 * Read file with freshness check and size validation
 */
async function readFileFresh(filePath) {
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.size > CONFIG.maxFileSize) {
      throw new Error(`File ${filePath} exceeds maximum size (${CONFIG.maxFileSize} bytes)`);
    }
    
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Verify content at a specific line number matches expectations
 */
function verifyLineContent(lines, targetLineNum, expectedPattern) {
  const actualIndex = targetLineNum - 1; // Convert to 0-indexed
  
  if (actualIndex < 0 || actualIndex >= lines.length) {
    throw new Error(`Target line ${targetLineNum} out of bounds. File has ${lines.length} lines.`);
  }
  
  const actualContent = lines[actualIndex];
  
  // Check if expected pattern exists in the actual content
  if (typeof expectedPattern === 'string') {
    if (!actualContent.includes(expectedPattern)) {
      throw new Error(
        `Content mismatch at line ${targetLineNum}.\n` +
        `Expected to contain: "${expectedPattern}"\n` +
        `Found instead:       "${actualContent.trim()}"`
      );
    }
  } else if (typeof expectedPattern === 'function') {
    // Allow custom verification functions
    if (!expectedPattern(actualContent)) {
      throw new Error(
        `Custom verification failed at line ${targetLineNum}.\n` +
        `Found: "${actualContent.trim()}"`
      );
    }
  } else {
    throw new Error(`Invalid expected pattern type. Expected string or function.`);
  }
  
  return true;
}

/**
 * Verify multiple lines match expectations (for block replacements)
 */
function verifyBlockContent(lines, startLineNum, expectedLines) {
  const startIndex = startLineNum - 1; // Convert to 0-indexed
  
  if (startIndex + expectedLines.length > lines.length) {
    throw new Error(
      `Expected ${expectedLines.length} starting at line ${startLineNum}, but file only has ${lines.length} lines.`
    );
  }
  
  for (let i = 0; i < expectedLines.length; i++) {
    const actualContent = lines[startIndex + i];
    const expectedPattern = typeof expectedLines[i] === 'string' 
      ? expectedLines[i]
      : null; // Allow custom functions later
      
    if (expectedPattern && !actualContent.includes(expectedPattern)) {
      throw new Error(
        `Block verification failed at line ${startLineNum + i}.\n` +
        `Expected to contain: "${expectedPattern}"\n` +
        `Found instead:       "${actualContent.trim()}"`
      );
    }
  }
  
  return true;
}

/**
 * Find all occurrences of a pattern in file content
 */
function findMatches(content, pattern) {
  const lines = content.split('\n');
  const matches = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(pattern)) {
      matches.push({
        lineNumber: i + 1, // Convert to 1-indexed
        content: lines[i],
        position: lines[i].indexOf(pattern)
      });
    }
  }
  
  return matches;
}

/**
 * Verify pattern uniqueness before replacement
 */
function verifyPatternUniqueness(content, pattern, maxAllowedMatches = 1) {
  const matches = findMatches(content, pattern);
  
  if (matches.length === 0) {
    throw new Error(`Pattern "${pattern}" not found in file.`);
  }
  
  if (matches.length > maxAllowedMatches) {
    throw new Error(
      `Pattern "${pattern}" matches ${matches.length} locations (max allowed: ${maxAllowedMatches}).\n` +
      `\nFound at:\n${matches.map(m => `  Line ${m.lineNumber}: ${m.content.trim()}`).join('\n')}\n\n` +
      `To fix this, use a more specific pattern or provide surrounding context.`
    );
  }
  
  return matches[0]; // Return the unique match
}

/**
 * Robust line operations with pre-flight verification
 */
class RobustLineOperations {
  constructor(filePath) {
    this.filePath = filePath;
    this.lastContent = null;
    this.lines = [];
    this.verified = false;
  }
  
  /**
   * Pre-flight: Read file and verify target content
   */
  async preFlightVerify(targetLineNum, expectedPattern) {
    // Step 1: Read fresh content
    const content = await readFileFresh(this.filePath);
    
    // Step 2: Parse into lines for verification
    this.lines = content.split('\n');
    this.lastContent = content;
    
    // Step 3: Verify target line matches expectations
    verifyLineContent(this.lines, targetLineNum, expectedPattern);
    
    this.verified = true;
    return { success: true, message: 'Pre-flight verification passed' };
  }
  
  /**
   * Insert content at verified location
   */
  insertAtVerifiedLocation(contentToInsert) {
    if (!this.verified) {
      throw new Error('Must call preFlightVerify() before inserting content.');
    }
    
    // This would be the actual insertion logic here
    // For demonstration, we'll show what it should do:
    console.log(`[Pre-Flight Verified] Inserting "${contentToInsert}" at line ${this.targetLineNum}`);
    console.log(`[Verification] Confirmed content matches expected pattern`);
    
    return { success: true };
  }
  
  /**
   * Replace text with pre-flight verification and uniqueness check
   */
  async replaceTextWithVerification(oldPattern, newContent) {
    // Step 1: Read fresh content
    const content = await readFileFresh(this.filePath);
    
    // Step 2: Verify pattern exists and is unique
    const matchInfo = verifyPatternUniqueness(content, oldPattern, 1);
    
    console.log(`[Pre-Flight Verified] Pattern found at line ${matchInfo.lineNumber}`);
    console.log(`[Verification] Pattern is unique (no duplicates)`);
    
    // Step 3: Perform replacement
    const newContent = content.replace(oldPattern, newContent);
    
    return { success: true, location: matchInfo.lineNumber };
  }
}

/**
 * Main execution function with comprehensive error handling
 */
async function main() {
  console.log('🔒 Robust Pre-Flight Verification System');
  console.log('========================================\n');
  
  try {
    // Example usage: Verify before modifying ARCHITECTURE.md tree structure
    const filePath = path.join(process.cwd(), 'ARCHITECTURE.md');
    
    const ops = new RobustLineOperations(filePath);
    
    // Pre-flight verification for line operations
    await ops.preFlightVerify(1065, 'restoreFromBak.ts');
    
    console.log('✅ All verifications passed. Safe to proceed with modifications.');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other modules
export {
  readFileFresh,
  verifyLineContent,
  verifyBlockContent,
  findMatches,
  verifyPatternUniqueness,
  RobustLineOperations,
  CONFIG
};

// Run if executed directly
if (process.argv[1] && process.argv[1].endsWith('verify_and_modify.mjs')) {
  main().catch(console.error);
}
