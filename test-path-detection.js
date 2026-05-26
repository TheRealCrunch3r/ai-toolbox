/**
 * Test case for Windows path detection regex fix
 * 
 * This demonstrates the bug where paths with spaces were truncated.
 */

// ============================================
// TEST DATA
// ============================================

const testCases = [
  {
    input: "go to C:\\Source Code\\LM Studio Plugins\\ai_toolbox",
    expected: "C:\\Source Code\\LM Studio Plugins\\ai_toolbox"
  },
  {
    input: "open D:\\My Documents\\Projects\\test-app",
    expected: "D:\\My Documents\\Projects\\test-app"
  },
  {
    input: "navigate to C:\\Program Files\\NodeJS",
    expected: "C:\\Program Files\\NodeJS"
  },
  {
    input: "check E:\\Backup 2024\\Important Files",
    expected: "E:\\Backup 2024\\Important Files"
  }
];

// ============================================
// REGEX PATTERNS
// ============================================

// ❌ OLD (BROKEN) - Missing backslash in character class
const oldRegex = /[A-Za-z]:\\[\w\-_. ]+/;

// ✅ NEW (FIXED) - Backslash included in character class
const newRegex = /[A-Za-z]:\\[\w\-_. \\]+/;

// ============================================
// TEST FUNCTION
// ============================================

function runTests() {
  console.log("=".repeat(70));
  console.log("PATH DETECTION REGEX TEST CASES");
  console.log("=".repeat(70));
  
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const oldMatch = testCase.input.match(oldRegex);
    const newMatch = testCase.input.match(newRegex);
    
    const oldResult = oldMatch ? oldMatch[0] : null;
    const newResult = newMatch ? newMatch[0] : null;

    console.log(`\n📝 Input: "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    
    // Test OLD regex (should FAIL)
    if (oldResult === testCase.expected) {
      console.log(`   ❌ OLD regex: PASS (unexpected - should fail)`);
    } else {
      console.log(`   ❌ OLD regex: FAIL → "${oldResult}"`);
      failed++;
    }

    // Test NEW regex (should PASS)
    if (newResult === testCase.expected) {
      console.log(`   ✅ NEW regex: PASS → "${newResult}"`);
      passed++;
    } else {
      console.log(`   ❌ NEW regex: FAIL → "${newResult}"`);
      failed++;
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  
  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${testCases.length * 2} tests (OLD + NEW regex)`);
  
  if (failed === testCases.length) {
    // Expected: all OLD tests fail, all NEW tests pass
    console.log("\n🎉 RESULT: Fix verified! OLD regex fails as expected, NEW regex passes.");
  } else if (failed === 0) {
    console.log("\n⚠️  WARNING: All tests passed - something unexpected happened!");
  } else {
    console.log(`\n⚠️  PARTIAL: ${testCases.length} OLD tests failed (expected), but some NEW tests also failed.`);
  }
}

// ============================================
// RUN TESTS
// ============================================

runTests();
