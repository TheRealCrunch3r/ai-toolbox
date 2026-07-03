// Test git operations directly via isomorphic-git in our working directory context
const path = require('path');
process.chdir(path.resolve('.'));
const git = require('isomorphic-git');
const fs = require('fs/promises');

async function run() {
  const config = { dir: process.cwd() };
  
  console.log('=== Testing isomorphic-git operations ===\n');
  
  // Test 1: git.add (same as our tool does)
  try {
    console.log('[TEST] git.add({ dir, filepath, fs })');
    await git.add({ ...config, filepath: '.', fs });
    console.log('✅ git.add succeeded\n');
  } catch (err) {
    console.log('❌ git.add FAILED:', err.message);
    console.log(err.stack, '\n');
  }
  
  // Test 2: git.commit (same as our tool does)  
  try {
    console.log('[TEST] git.commit({ dir, message, fs })');
    await git.commit({ ...config, message: 'test commit', fs });
    console.log('✅ git.commit succeeded\n');
  } catch (err) {
    console.log('❌ git.commit FAILED:', err.message);
    // Don't print full stack for expected errors like missing author config
    console.log(err.stack.substring(0, 200), '\n');
  }
  
  // Test 3: Check what .startsWith is looking at in the error
  try {
    const gitAdd = require('isomorphic-git/add');
    console.log('[TEST] Direct add module:', typeof gitAdd);
  } catch (e) {
    console.log('Direct add module not found:', e.message);
  }
}

run();
