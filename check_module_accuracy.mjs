import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');
const toolsDir = path.join(srcDir, 'tools');

console.log('═══════════════════════════════════════════');
console.log('  ACCURATE MODULE COMPARISON (v1.9.6)');
console.log('═══════════════════════════════════════════\n');

// --- Step 1: Get actual tool files ---
const actualToolFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith('.ts')).sort();
const actualSrcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts') || f === 'index.ts').sort();

console.log('[Actual Tool Files in src/tools/]:');
actualToolFiles.forEach(f => console.log(`   - ${f}`));
console.log(`\nTotal: ${actualToolFiles.length} tool files\n`);

// --- Step 2: Check ARCHITECTURE.md for module count claims ---
const archContent = fs.readFileSync(path.join(projectRoot, 'ARCHITECTURE.md'), 'utf-8');

// Look for the file structure reference section
const fileStructureMatch = archContent.match(/### 📁 File Structure Reference[\s\S]*?(?=##|\*\*Total)/);
if (fileStructureMatch) {
  const fileStructureText = fileStructureMatch[0];
  
  // Check if it mentions "19 source files" or similar count
  const countMatches = fileStructureText.match(/(\d+)\s*(?:source|tool)\s*files/gi);
  if (countMatches) {
    console.log('⚠️ ARCHITECTURE.md File Structure Reference claims:');
    countMatches.forEach(m => console.log(`   "${m}"`));
    console.log(`\nActual count is ${actualToolFiles.length} tool files.\n`);
  }
  
  // Check for specific module mentions in the file structure section
  const documentedModules = fileStructureText.match(/`([^`]+\.ts)`/g) || [];
  const documentedBasenameSet = new Set(documentedModules.map(m => m.replace(/`/g, '').replace('.ts', '')));
  
  // Find tool files NOT in the File Structure Reference section
  const missingFromFileStructure = actualToolFiles.filter(f => {
    const basename = f.replace('.ts', '');
    return !documentedBasenameSet.has(basename);
  });
  
  if (missingFromFileStructure.length > 0) {
    console.log(`📝 Tool files NOT in ARCHITECTURE.md File Structure Reference (${missingFromFileStructure.length}):`);
    missingFromFileStructure.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log('✅ All tool files are listed in ARCHITECTURE.md File Structure Reference.');
  }
}

// --- Step 3: Check README.md for tool count claims ---
const readmeContent = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
const readmeToolCount = readmeContent.match(/~(\d+)\s*(?:unique\s+)?tools/gi);
if (readmeToolCount) {
  console.log(`\n📊 README.md claims: ${readmeToolCount[0]}`);
}

// --- Step 4: Check TOOLS_REFERENCE.md for tool count claims ---
const toolsRefContent = fs.readFileSync(path.join(projectRoot, 'TOOLS_REFERENCE.md'), 'utf-8');
const toolsRefOverviewMatch = toolsRefContent.match(/\| Category \| Count/);
if (toolsRefOverviewMatch) {
  console.log('✅ TOOLS_REFERENCE.md has a category count table.');
}

// --- Step 5: Check for missing test files ---
const testsDir = path.join(projectRoot, 'tests');
let actualTestFiles = [];
try {
  const items = fs.readdirSync(testsDir);
  actualTestFiles = items.filter(f => f.endsWith('.test.ts')).sort();
} catch {}

console.log(`\n[Actual Test Files in tests/]: ${actualTestFiles.length}`);
actualTestFiles.forEach(f => console.log(`   - ${f}`));

// --- Summary ---
console.log('\n═══════════════════════════════════════════');
console.log('  SUMMARY');
console.log('═══════════════════════════════════════════\n');
console.log(`- Actual tool files in src/tools/: ${actualToolFiles.length}`);
console.log(`- Actual test files in tests/: ${actualTestFiles.length}`);

// Check for specific known discrepancies
const archFileStructureMatch = archContent.match(/### 📁 File Structure Reference[\s\S]*?(?=##|\*\*Total)/);
if (archFileStructureMatch) {
  const text = archFileStructureMatch[0];
  if (text.includes('19 source files') || text.includes('20 tool modules')) {
    console.log(`- ARCHITECTURE.md File Structure Reference mentions module count that may be outdated`);
  }
}
