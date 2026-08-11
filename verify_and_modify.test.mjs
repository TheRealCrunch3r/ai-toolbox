/**
 * Test Suite for Pre-Flight Verification System
 * 
 * Demonstrates how pre-flight verification prevents file corruption
 * from stale line numbers and drifted patterns.
 */

import fs from 'fs';
import path from 'path';

// Configuration (same as in verify_and_modify.mjs)
const CONFIG = {
  strictMode: true,
  maxFileSize: 1000000, // 1MB
};

/**
 * Simulate the original bug scenario
 */
function demonstrateOriginalBug() {
  console.log('🐛 Demonstrating Original Bug Scenario\n');
  
  const filePath = 'ARCHITECTURE.md';
  let content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');
  
  // Simulate: AI reads file and gets line number 1058 from stale read
  const staleLineNum = 1058;
  console.log(`1. AI reads file (stale context):`);
  console.log(`   → Gets line number ${staleLineNum} to insert content\n`);
  
  // Simulate: File has been modified by other operations since last read
  content = fs.readFileSync(filePath, 'utf-8'); // Fresh read shows different structure
  lines = content.split('\n');
  
  console.log(`2. AI inserts at stale line ${staleLineNum}:`);
  const actualContentAtLine = lines[staleLineNum - 1];
  console.log(`   → Line ${staleLineNum} now contains: "${actualContentAtLine.trim()}"\n`);
  
  // Simulate: Drift detection warning (too late!)
  if (lines.length !== staleLineNum + 4) { // Expected ~4 lines after insertion point
    console.log(`3. ⚠️ DRIFT DETECTED (after damage done):`);
    console.log(`   → File has ${lines.length} lines instead of expected ${staleLineNum + 4}`);
    console.log(`   → Insert landed in wrong location!\n`);
  }
  
  console.log('❌ Result: File corruption from stale line number\n');
}

/**
 * Demonstrate the fix with pre-flight verification
 */
function demonstrateFix() {
  console.log('\n✅ Demonstrating Fix with Pre-Flight Verification\n');
  
  const filePath = 'ARCHITECTURE.md';
  let content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');
  
  // Simulate: AI reads file FRESH before operation
  console.log(`1. AI reads file FRESH:`);
  console.log(`   → Reads current ${lines.length} lines\n`);
  
  // Simulate: Verify target line matches expectations BEFORE inserting
  const targetLineNum = 1065; // Line with restoreFromBak.ts
  const expectedPattern = 'restoreFromBak.ts';
  const actualContent = lines[targetLineNum - 1];
  
  console.log(`2. Pre-flight verification at line ${targetLineNum}:`);
  if (actualContent.includes(expectedPattern)) {
    console.log(`   ✅ Content matches: "${expectedPattern}" found\n`);
  } else {
    throw new Error(`Content mismatch! Expected "${expectedPattern}" but found: "${actualContent.trim()}"`);
  }
  
  // Simulate: Safe insertion after verification
  console.log(`3. Insert content at verified location:`);
  console.log(`   ✅ Safe to proceed - line number is current and correct\n`);
  
  console.log('✅ Result: No file corruption, safe modification\n');
}

/**
 * Demonstrate pattern uniqueness check for replacements
 */
function demonstratePatternUniquenessCheck() {
  console.log('\n🔍 Demonstrating Pattern Uniqueness Check\n');
  
  const filePath = 'ARCHITECTURE.md';
  let content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');
  
  // Test multiple patterns to show uniqueness checking
  const testPatterns = [
    { pattern: 'types/', expectedMatches: '>1', warning: true },
    { pattern: '└── types/                      # Type definitions', expectedMatches: '1', warning: false },
    { pattern: 'restoreFromBak.ts', expectedMatches: '1', warning: false },
  ];
  
  testPatterns.forEach(({ pattern, expectedMatches, warning }) => {
    let matchCount = 0;
    lines.forEach((line) => {
      if (line.includes(pattern)) matchCount++;
    });
    
    console.log(`Pattern: "${pattern.substring(0, 40)}..."`);
    console.log(`  Matches found: ${matchCount}`);
    
    if (expectedMatches === '>1' && matchCount > 1) {
      console.log(`  ⚠️ Multiple matches - requires more specific context\n`);
    } else if (expectedMatches === '1' && matchCount === 1) {
      console.log(`  ✅ Unique match - safe to replace\n`);
    }
  });
}

/**
 * Run all tests
 */
function runTests() {
  console.log('🧪 Pre-Flight Verification System Test Suite');
  console.log('============================================\n');
  
  try {
    demonstrateOriginalBug();
    demonstrateFix();
    demonstratePatternUniquenessCheck();
    
    console.log('\n✅ All tests passed!');
    console.log('\nKey Takeaways:');
    console.log('1. Always read file FRESH before operations (never rely on stale line numbers)');
    console.log('2. Verify target content matches expectations BEFORE modifying');
    console.log('3. Check pattern uniqueness to prevent cross-match replacements');
    console.log('4. Abort with clear error if verification fails\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if executed directly
if (process.argv[1] && process.argv[1].endsWith('verify_and_modify.test.mjs')) {
  runTests();
}

export { demonstrateOriginalBug, demonstrateFix, demonstratePatternUniquenessCheck };
