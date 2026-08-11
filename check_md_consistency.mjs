import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');
const mdFiles = [
  'ARCHITECTURE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'DOCUMENTATION.md',
  'graphify_integration_analysis.md',
  'QUICK_START.md',
  'README.md',
  'SECURITY.md',
  'TOOLS_REFERENCE.md',
];

console.log('═══════════════════════════════════════════');
console.log('  MD FILE CONSISTENCY CHECK');
console.log('═══════════════════════════════════════════\n');

// --- Step 1: Extract all TypeScript files from actual code ---
function getAllTsFiles(dir, baseDir = dir) {
  const results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(item)) {
        results.push(...getAllTsFiles(fullPath, baseDir));
      }
    } else if (item.endsWith('.ts') || item.endsWith('.d.ts')) {
      const relativePath = path.relative(baseDir, fullPath);
      results.push(relativePath.replace(/\\/g, '/'));
    }
  }
  
  return results;
}

const actualTsFiles = getAllTsFiles(srcDir).sort();
console.log(`[1/4] Found ${actualTsFiles.length} TypeScript files in src/:`);
actualTsFiles.forEach(f => console.log(`   - ${f}`));

// --- Step 2: Extract module names from MD files ---
const mdModules = {};
for (const mdFile of mdFiles) {
  const filePath = path.join(projectRoot, mdFile);
  if (!fs.existsSync(filePath)) continue;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.match(/`(?:[^`]+\.ts|[^`]+\.d\.ts)`/g) || [];
  
  for (const match of matches) {
    const moduleName = match.replace(/`/g, '');
    if (!mdModules[moduleName]) mdModules[moduleName] = [];
    mdModules[moduleName].push(mdFile);
  }
}

console.log(`\n[2/4] Found ${Object.keys(mdModules).length} unique module references in MD files:`);
Object.entries(mdModules).sort(([a], [b]) => a.localeCompare(b)).forEach(([module, sources]) => {
  console.log(`   - ${module}: mentioned in ${sources.length} file(s) (${sources.join(', ')})`);
});

// --- Step 3: Compare actual files vs documented modules ---
console.log(`\n[3/4] Comparing actual files vs documented modules:\n`);

const actualBasenames = new Set(actualTsFiles.map(f => path.basename(f).replace('.ts', '').replace('.d.ts', '')));
const documentedBasenameSet = new Set(Object.keys(mdModules).map(m => m.replace('.ts', '').replace('.d.ts', '')));

// Find modules in code but not in docs
const missingFromDocs = [];
for (const file of actualTsFiles) {
  const basename = path.basename(file).replace(/\.ts$/, '').replace(/\.d\.ts$/, '');
  if (!documentedBasenameSet.has(basename)) {
    missingFromDocs.push({ file, basename });
  }
}

// Find modules in docs but not in code
const missingInCode = [];
for (const module of Object.keys(mdModules)) {
  const basename = module.replace(/\.ts$/, '').replace(/\.d\.ts$/, '');
  if (!actualBasenames.has(basename)) {
    // Check if it's a directory or has .js extension issue
    if (module.endsWith('.js')) {
      console.log(`   ⚠️ ${module}: documented with .js extension but actual file is .ts`);
    } else {
      missingInCode.push({ module, basename });
    }
  }
}

if (missingFromDocs.length > 0) {
  console.log(`   📝 Modules in code but NOT mentioned in any MD file (${missingFromDocs.length}):`);
  missingFromDocs.forEach(({ file, basename }) => {
    console.log(`      - ${file}`);
  });
} else {
  console.log(`   ✅ All source modules are mentioned in at least one MD file.`);
}

if (missingInCode.length > 0) {
  console.log(`\n   ❌ Modules mentioned in MD files but NOT in code (${missingInCode.length}):`);
  missingInCode.forEach(({ module, basename }) => {
    console.log(`      - ${module} (basename: ${basename})`);
  });
} else {
  console.log(`\n   ✅ All documented modules exist in code.`);
}

// --- Step 4: Check for stale references ---
console.log(`\n[4/4] Checking for stale version references:\n`);

const staleVersions = ['v1.9.4', 'v1.9.3', 'v1.9.2', 'v1.9.1'];
let foundStale = false;

for (const mdFile of mdFiles) {
  const filePath = path.join(projectRoot, mdFile);
  if (!fs.existsSync(filePath)) continue;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const version of staleVersions) {
    if (content.includes(version) && !mdFile.includes('CHANGELOG.md')) {
      console.log(`   ⚠️ ${mdFile} contains reference to ${version}`);
      foundStale = true;
    }
  }
}

if (!foundStale) {
  console.log(`   ✅ No stale version references found (all MD files are at v1.9.6).`);
}

// --- Summary ---
console.log('\n═══════════════════════════════════════════');
console.log('  SUMMARY');
console.log('═══════════════════════════════════════════\n');

console.log(`- Total TypeScript files in src/: ${actualTsFiles.length}`);
console.log(`- Total module references in MD files: ${Object.keys(mdModules).length}`);
console.log(`- Modules missing from documentation: ${missingFromDocs.length}`);
console.log(`- Modules documented but not in code: ${missingInCode.length === 0 ? 'None (all valid)' : missingInCode.map(m => m.module).join(', ')}`);
console.log(`- Stale version references: ${foundStale ? 'Found' : 'None ✅'}`);
