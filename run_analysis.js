/**
 * Direct execution of analyze_project tool against the ai_toolbox codebase.
 * Bypasses LM Studio SDK — calls the implementation directly.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// We need to load the compiled JS, but since tsup may not be run yet,
// let's use tsx/esbuild to transpile on-the-fly, or just import the TS directly.

// Actually, let's use a simpler approach: read the fileSystemTools.ts source
// and extract/evaluate the analyze_project implementation.

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');

console.log('='.repeat(70));
console.log('🔍 AI Toolbox — Project Analysis (Direct Execution)');
console.log('='.repeat(70));
console.log(`Working directory: ${projectRoot}`);
console.log();

// ==================== Helper: Safe Subprocess ====================
function spawn(exe, args, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const child_process = require('child_process');
    const proc = child_process.spawn(exe, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: projectRoot,
      shell: false, // No shell interpretation — safe!
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (d) => { stdout += d.toString(); });
    proc.stderr?.on('data', (d) => { stderr += d.toString(); });

    const timerId = setTimeout(() => { proc.kill(); resolve({ success: false, stderr: 'Timeout' }); }, timeoutMs);

    proc.on('close', () => { clearTimeout(timerId); resolve({ success: true, stdout, stderr }); });
    proc.on('error', (err) => { clearTimeout(timerId); resolve({ success: false, stderr: err.message }); });
  });
}

// ==================== A. TypeScript Extended Diagnostics ====================
async function runTypecheckAnalysis() {
  const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) return { skipped: true, reason: 'No tsconfig.json found' };

  // Check tsc availability
  try {
    await spawn('tsc', ['--version'], 5000);
  } catch {
    return { skipped: true, reason: 'TypeScript compiler (tsc) not found in PATH' };
  }

  const result = await spawn('tsc', ['--extendedDiagnostics'], 30000);

  if (!result.success || !result.stdout) {
    return { skipped: true, reason: `tsc failed: ${result.stderr || 'Unknown error'}` };
  }

  // Parse output
  const lines = result.stdout.split('\n');
  let checkTimeMs = 0;
  let memoryUsedMB = 0;
  let filesChecked = 0;
  let emitTimeMs = 0;
  let parseTimeMs = 0;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    const checkMatch = lowerLine.match(/check\s+time:\s+(\d+)\s*ms/);
    if (checkMatch) checkTimeMs = parseInt(checkMatch[1], 10);

    const memMatch = line.match(/memory used:\s+(\d+)\s*(kb|mb)/i);
    if (memMatch) {
      const value = parseInt(memMatch[1], 10);
      memoryUsedMB = memMatch[2].toLowerCase() === 'mb' ? value : Math.round(value / 1024 * 100) / 100;
    }

    const filesMatch = line.match(/files\s+checked:\s+(\d+)/);
    if (filesMatch) filesChecked = parseInt(filesMatch[1], 10);

    const emitMatch = lowerLine.match(/emit\s+time:\s+(\d+)\s*ms/);
    if (emitMatch) emitTimeMs = parseInt(emitMatch[1], 10);

    const parseMatch = lowerLine.match(/parse\s+time:\s+(\d+)\s*ms/);
    if (parseMatch) parseTimeMs = parseInt(parseMatch[1], 10);
  }

  let assessment;
  if (checkTimeMs < 100) assessment = 'fast';
  else if (checkTimeMs <= 500) assessment = 'moderate';
  else assessment = 'slow';

  return { checkTimeMs, memoryUsedMB: Math.round(memoryUsedMB * 100) / 100, filesChecked, emitTimeMs, parseTimeMs, assessment };
}

// ==================== B. Circular Dependency Detection ====================
async function runCircularAnalysis() {
  const entryPoint = path.join(projectRoot, 'src', 'index.ts');
  if (!fs.existsSync(entryPoint)) return { skipped: true, reason: 'No src/index.ts found' };

  const result = await spawn('npx', ['--yes', 'madge', '--circular', entryPoint], 20000);

  if (!result.success) {
    return { skipped: true, reason: `madge failed: ${result.stderr || 'Unknown error'}` };
  }

  const cycles = [];
  for (const line of result.stdout.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('Found') && !trimmed.startsWith('No')) {
      if (trimmed.includes('->') || trimmed.endsWith('.ts')) cycles.push(trimmed);
    }
  }

  return { hasCycles: cycles.length > 0, cycles };
}

// ==================== C. ESLint Integration ====================
async function runEslintAnalysis() {
  const eslintConfigFiles = [
    path.join(projectRoot, 'eslint.config.mjs'),
    path.join(projectRoot, 'eslint.config.js'),
    path.join(projectRoot, '.eslintrc.js'),
    path.join(projectRoot, '.eslintrc.json'),
    path.join(projectRoot, '.eslintrc'),
  ];

  const hasEslintConfig = eslintConfigFiles.some(f => fs.existsSync(f));
  if (!hasEslintConfig) return { skipped: true, reason: 'No ESLint configuration found' };

  try {
    await spawn('npx', ['eslint', '--version'], 5000);
  } catch {
    return { skipped: true, reason: 'ESLint not found in devDependencies or PATH' };
  }

  const result = await spawn('npx', ['eslint', 'src', '--ext', '.ts', '--format', 'json'], 15000);

  if (!result.success) {
    return { skipped: true, reason: `ESLint failed: ${result.stderr || 'Unknown error'}` };
  }

  let errors = 0;
  let warnings = 0;
  const errorMessages = [];
  const warningMessages = [];

  try {
    const parsed = JSON.parse(result.stdout);
    if (parsed.results) {
      for (const fileResult of parsed.results) {
        for (const message of (fileResult.messages || [])) {
          if (message.severity === 2) {
            errors++;
            errorMessages.push(`${fileResult.filePath}: ${message.message} (${message.line}:${message.column})`);
          } else if (message.severity === 1) {
            warnings++;
            warningMessages.push(`${fileResult.filePath}: ${message.message} (${message.line}:${message.column})`);
          }
        }
      }
    }
  } catch {
    const errorLines = result.stdout.split('\n').filter(l => l.includes('error') && !l.includes('warning'));
    errors = errorLines.length;
    const warningLines = result.stdout.split('\n').filter(l => l.includes('warning'));
    warnings = warningLines.length;
  }

  return { errors, warnings, errorMessages: errorMessages.slice(0, 20), warningMessages: warningMessages.slice(0, 20) };
}

// ==================== D. TypeScript Config Analysis ====================
function runConfigAnalysis() {
  const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) return { skipped: true, reason: 'No tsconfig.json found' };

  let tsConfig;
  try {
    tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
  } catch {
    return { skipped: true, reason: 'Invalid tsconfig.json format' };
  }

  const compilerOptions = tsConfig.compilerOptions || {};
  const incremental = !!compilerOptions.incremental;
  const skipLibCheck = !!compilerOptions.skipLibCheck;
  const isolatedModules = !!compilerOptions.isolatedModules;
  const strict = !!compilerOptions.strict;

  const recommendations = [];
  if (!incremental) recommendations.push('Enable "incremental": true in tsconfig.json for faster builds (build caching).');
  if (!skipLibCheck) recommendations.push('Enable "skipLibCheck": true to skip checking .d.ts files in node_modules.');
  if (!isolatedModules) recommendations.push('Consider enabling "isolatedModules": true for faster compilation (especially with Babel/esbuild).');
  if (!strict) recommendations.push('Enable "strict": true for better type safety and fewer runtime errors.');
  if (!compilerOptions.paths || Object.keys(compilerOptions.paths).length === 0) {
    recommendations.push('Consider using "paths" in tsconfig.json to simplify module imports and reduce dependency depth.');
  }

  return { incremental, skipLibCheck, isolatedModules, strict, recommendations };
}

// ==================== E. Import Structure Analysis ====================
function runImportAnalysis() {
  const srcDir = path.join(projectRoot, 'src');
  if (!fs.existsSync(srcDir)) return { skipped: true, reason: 'No src/ directory found' };

  function collectTsFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...collectTsFiles(fullPath));
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) files.push(fullPath);
    }
    return files;
  }

  const tsFiles = collectTsFiles(srcDir);
  const filesWithExcessiveImports = [];
  const declareGlobalUsage = [];

  for (const filePath of tsFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const importStatements = content.match(/^import\s+.*$/gm);
      const importCount = importStatements ? importStatements.length : 0;

      if (importCount > 20) filesWithExcessiveImports.push({ file: path.relative(projectRoot, filePath), count: importCount });

      const declareGlobalMatches = content.match(/declare\s+global/g);
      if (declareGlobalMatches && declareGlobalMatches.length > 0) {
        declareGlobalUsage.push({ file: path.relative(projectRoot, filePath) });
      }
    } catch {}
  }

  return { filesWithExcessiveImports, declareGlobalUsage };
}

// ==================== Run All Categories ====================
async function main() {
  const results = {};

  console.log('📦 Running TypeScript Extended Diagnostics (tsc --extendedDiagnostics)...');
  try {
    results.typecheck = await runTypecheckAnalysis();
  } catch (e) {
    results.typecheck = { skipped: true, reason: e.message };
  }

  console.log('🔗 Running Circular Dependency Detection (madge)...');
  try {
    results.circular = await runCircularAnalysis();
  } catch (e) {
    results.circular = { skipped: true, reason: e.message };
  }

  console.log('🧹 Running ESLint Analysis...');
  try {
    results.eslint = await runEslintAnalysis();
  } catch (e) {
    results.eslint = { skipped: true, reason: e.message };
  }

  console.log('⚙️  Running TypeScript Config Analysis...');
  try {
    results.config = runConfigAnalysis();
  } catch (e) {
    results.config = { skipped: true, reason: e.message };
  }

  console.log('📊 Running Import Structure Analysis...');
  try {
    results.imports = runImportAnalysis();
  } catch (e) {
    results.imports = { skipped: true, reason: e.message };
  }

  // ==================== Print Results ====================
  console.log('\n' + '='.repeat(70));
  console.log('📋 ANALYSIS RESULTS');
  console.log('='.repeat(70));

  if (results.typecheck && !results.typecheck.skipped) {
    const t = results.typecheck;
    console.log(`\n✅ TypeScript Extended Diagnostics:`);
    console.log(`   Check Time:     ${t.checkTimeMs} ms`);
    console.log(`   Memory Used:    ${t.memoryUsedMB} MB`);
    console.log(`   Files Checked:  ${t.filesChecked}`);
    console.log(`   Emit Time:      ${t.emitTimeMs} ms`);
    console.log(`   Parse Time:     ${t.parseTimeMs} ms`);
    console.log(`   Assessment:     ${'🟢'.repeat(t.assessment === 'fast' ? 3 : t.assessment === 'moderate' ? 2 : 1)}${'⚪'.repeat(3 - (t.assessment === 'fast' ? 3 : t.assessment === 'moderate' ? 2 : 1))} ${t.assessment.toUpperCase()}`);
    if (t.checkTimeMs > 500) console.log(`   ⚠️  SLOW: Consider optimizing types, reducing recursion, or splitting tsconfig.`);
  } else {
    console.log(`\n⏭️  TypeScript Extended Diagnostics: ${results.typecheck?.reason || 'skipped'}`);
  }

  if (results.circular && !results.circular.skipped) {
    const c = results.circular;
    console.log(`\n🔗 Circular Dependencies:`);
    if (c.hasCycles) {
      console.log(`   ⚠️  Found ${c.cycles.length} cycle(s):`);
      for (const cycle of c.cycles) console.log(`     - ${cycle}`);
    } else {
      console.log(`   ✅ No circular dependencies detected.`);
    }
  } else {
    console.log(`\n⏭️  Circular Dependencies: ${results.circular?.reason || 'skipped'}`);
  }

  if (results.eslint && !results.eslint.skipped) {
    const e = results.eslint;
    console.log(`\n🧹 ESLint Results:`);
    console.log(`   Errors:   ${e.errors}`);
    console.log(`   Warnings: ${e.warnings}`);
    if (e.errorMessages.length > 0) {
      console.log(`   Top errors:`);
      for (const msg of e.errorMessages.slice(0, 5)) console.log(`     - ${msg}`);
    }
    if (e.warningMessages.length > 0) {
      console.log(`   Top warnings:`);
      for (const msg of e.warningMessages.slice(0, 5)) console.log(`     - ${msg}`);
    }
  } else {
    console.log(`\n⏭️  ESLint: ${results.eslint?.reason || 'skipped'}`);
  }

  if (results.config && !results.config.skipped) {
    const c = results.config;
    console.log(`\n⚙️  TypeScript Config Analysis:`);
    console.log(`   incremental:       ${c.incremental ? '✅ enabled' : '❌ disabled'}`);
    console.log(`   skipLibCheck:      ${c.skipLibCheck ? '✅ enabled' : '❌ disabled'}`);
    console.log(`   isolatedModules:   ${c.isolatedModules ? '✅ enabled' : '❌ disabled'}`);
    console.log(`   strict:            ${c.strict ? '✅ enabled' : '❌ disabled'}`);
    if (c.recommendations.length > 0) {
      console.log(`\n   💡 Recommendations:`);
      for (const rec of c.recommendations) console.log(`     - ${rec}`);
    }
  } else {
    console.log(`\n⏭️  Config Analysis: ${results.config?.reason || 'skipped'}`);
  }

  if (results.imports && !results.imports.skipped) {
    const i = results.imports;
    console.log(`\n📊 Import Structure:`);
    if (i.filesWithExcessiveImports.length > 0) {
      console.log(`   ⚠️  Files with excessive imports (>20):`);
      for (const f of i.filesWithExcessiveImports) console.log(`     - ${f.file} (${f.count} imports)`);
    } else {
      console.log(`   ✅ No files exceed import threshold.`);
    }
    if (i.declareGlobalUsage.length > 0) {
      console.log(`   ⚠️  Files using "declare global" (global type patching):`);
      for (const f of i.declareGlobalUsage) console.log(`     - ${f.file}`);
    } else {
      console.log(`   ✅ No "declare global" usage detected.`);
    }
  } else {
    console.log(`\n⏭️  Import Analysis: ${results.imports?.reason || 'skipped'}`);
  }

  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);
