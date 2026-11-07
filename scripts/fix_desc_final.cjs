const fs = require('fs');
const p = 'src/tools/fileSystemTools.ts';
let s = fs.readFileSync(p, 'utf8');
const bs = String.fromCharCode(92);
const bt = String.fromCharCode(96);
// Two literal backslashes before a backtick, in the regex: needs four raw backslash chars.
const pat = new RegExp(bs + bs + bs + bs + bt, 'g');
s = s.replace(pat, bs + bt);
fs.writeFileSync(p, s);
const seg = s.split(/\r?\n/).find(l => l.indexOf('single-file') >= 0) || '';
const idx2 = seg.indexOf('in ');
console.log(seg.slice(idx2 >= 0 ? idx2 : 0, (idx2 >= 0 ? idx2 : 0) + 40));
