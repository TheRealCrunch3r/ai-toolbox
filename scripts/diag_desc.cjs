const fs = require('fs');
const l = fs.readFileSync('src/tools/fileSystemTools.ts', 'utf8').split(/\r?\n/);
const seg = l[2896].slice(205, 240);
const codes = [...seg].map((ch) => ch.charCodeAt(0));
process.stdout.write(seg + '|codes:' + JSON.stringify(codes));
