// Execute git commands with proper Windows path handling
const exec = (require || globalThis.require)('child_process');
const path = require('path');
const fs = require('fs');

const targetDir = process.cwd();
console.log('=== Git Debug Information ===\n');
console.log(`Target Directory: ${targetDir}`);
console.log(`.git exists: ${fs.existsSync(path.join(targetDir, '.git'))}\n`);

// Check git version
console.log('--- Git Version ---');
const v = exec.execFileSync('git', ['--version'], { cwd: targetDir });
console.log(v.toString().trim());

// Check git status with -C flag (explicit directory)
console.log('\n--- Git Status (-C flag) ---');
try {
  const s = exec.execFileSync('git', ['-C', targetDir, 'status'], { cwd: targetDir, encoding: 'utf8' });
  console.log(s);
} catch(e) {
  console.error(e.message);
}

// Check git remote
console.log('\n--- Git Remote ---');
try {
  const r = exec.execFileSync('git', ['-C', targetDir, 'remote', '-v'], { cwd: targetDir, encoding: 'utf8' });
  console.log(r);
} catch(e) {
  console.error(e.message);
}

// Check git log  
console.log('\n--- Git Log (last 3) ---');
try {
  const l = exec.execFileSync('git', ['-C', targetDir, 'log', '-3', '--oneline'], { cwd: targetDir, encoding: 'utf8' });
  console.log(l);
} catch(e) {
  console.error(e.message);
}
