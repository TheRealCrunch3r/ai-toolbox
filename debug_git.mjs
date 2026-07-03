import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const targetDir = process.cwd();
console.log('=== Git Debug Information ===\n');
console.log(`Target Directory: ${targetDir}`);
console.log(`.git exists: ${fs.existsSync(path.join(targetDir, '.git'))}\n`);

// Check git version
console.log('--- Git Version ---');
const versionResult = spawnSync('git', ['--version'], { cwd: targetDir, encoding: 'utf8' });
console.log(versionResult.stdout || versionResult.stderr);

// Check git status with explicit -C flag
console.log('\n--- Git Status (using -C flag) ---');
const statusResult = spawnSync('git', ['-C', targetDir, 'status'], { cwd: targetDir, encoding: 'utf8' });
if (statusResult.stdout) console.log(statusResult.stdout);
if (statusResult.stderr && !statusResult.stdout) console.error(statusResult.stderr);

// Check git remote
console.log('\n--- Git Remote ---');
const remoteResult = spawnSync('git', ['-C', targetDir, 'remote', '-v'], { cwd: targetDir, encoding: 'utf8' });
if (remoteResult.stdout) console.log(remoteResult.stdout);
if (remoteResult.stderr && !remoteResult.stdout) console.error(remoteResult.stderr);

// Check git branch
console.log('\n--- Git Branch ---');
const branchResult = spawnSync('git', ['-C', targetDir, 'branch', '-a'], { cwd: targetDir, encoding: 'utf8' });
if (branchResult.stdout) console.log(branchResult.stdout);
if (branchResult.stderr && !branchResult.stdout) console.error(branchResult.stderr);

// Check git log
console.log('\n--- Git Log (last 3 commits) ---');
const logResult = spawnSync('git', ['-C', targetDir, 'log', '-3', '--oneline'], { cwd: targetDir, encoding: 'utf8' });
if (logResult.stdout) console.log(logResult.stdout);
if (logResult.stderr && !logResult.stdout) console.error(logResult.stderr);
