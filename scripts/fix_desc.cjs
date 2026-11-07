const fs = require('fs');
const p = 'src/tools/fileSystemTools.ts';
let s = fs.readFileSync(p, 'utf8');
const bt = String.fromCharCode(96); // backtick
const bs = String.fromCharCode(92);  // backslash
const anchor = "description: `Apply a patch";
const idx = s.indexOf(anchor);
if (idx >= 0) {
  const start = Math.max(0, s.lastIndexOf('\n', idx));
  const end = s.indexOf('\n', idx);
  let seg = s.slice(start, end + 1);
  seg = seg.replace(new RegExp(bs + bs + bt, 'g'), bs + bt);
  s = s.slice(0, start) + seg + s.slice(end + 1);
  fs.writeFileSync(p, s);
} else {
  console.log('anchor not found');
}
console.log("OK replaced " + (idx >= 0 ? 'yes' : 'no'));
