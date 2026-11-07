const fs = require('fs');
const p = 'src/tools/fileSystemTools.ts';
let s = fs.readFileSync(p, 'utf8');
const bt = String.fromCharCode(96);
const bs = String.fromCharCode(92);
const anchor = "description: `Apply a patch";
const idx = s.indexOf(anchor);
if (idx >= 0) {
  const start = Math.max(0, s.lastIndexOf('\n', idx));
  const end = s.indexOf('\n', idx);
  let seg = s.slice(start, end + 1);
  for (let k = 0; k < 6 && seg.includes(bs + bs + bt); k++) {
    seg = seg.replace(new RegExp(bs + bs + bt, 'g'), bs + bt);
  }
  if (seg.indexOf(bt) >= 0) {
    // ensure only one backslash precedes each backtick inside this template line
  }
  s = s.slice(0, start) + seg + s.slice(end + 1);
  fs.writeFileSync(p, s);
} else console.log('anchor not found');
console.log('done');
