const fs = require('fs');
const p = 'src/tools/fileSystemTools.ts';
let s = fs.readFileSync(p, 'utf8');
const bt = String.fromCharCode(96);
const bs = String.fromCharCode(92);
const before = bs + bs + bt;
// Remove the two-backslash+backtick before and after "diff -u" in that line.
if (s.includes(before + 'diff -u' + before)) {
  s = s.replace(new RegExp(before + 'diff -u' + before), 'git diff -u');
  fs.writeFileSync(p, s);
  console.log('removed double-backslash backticks');
} else {
  console.log('pattern not found (already clean or different)');
  // safety: also strip any stray double-backslash+backtick sequences in the file
  const count = (s.split(before).length - 1);
  if (count > 0) { s = s.replace(new RegExp(bs + bs + bt, 'g'), '' ); fs.writeFileSync(p, s); console.log('stripped ' + count); }
}
console.log('done');
