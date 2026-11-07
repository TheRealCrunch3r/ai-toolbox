// temp: print line range from a md file (usage: node tmp_show_lines.cjs <file> <start0> <end0>)
const fs = require('fs');
const [f, s, e] = process.argv.slice(2);
const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
for (let i = Number(s) || 0; i <= Number(e) && i < lines.length; i++) console.log((i + 1) + ': ' + lines[i]);
