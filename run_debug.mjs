import { spawn } from 'child_process';
import * as path from 'path';

const cwd = process.cwd();
console.log('Running debug script in:', cwd);

const child = spawn('cmd.exe', ['/c', path.join(cwd, 'debug_git.bat')], {
  cwd: cwd,
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  output += 'STDERR: ' + data.toString();
});

child.on('close', (code) => {
  console.log('\n=== Script Output ===');
  console.log(output);
  console.log('\nExit code:', code);
});
