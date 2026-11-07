const fs = require('fs');
const p = 'src/tools/fileSystemTools.ts';
let src = fs.readFileSync(p, 'utf8');
if (!src.includes("from './applyPatchEngine.js'")) {
  const imp = "import { patternScan } from './patternScan.js';";
  src = src.replace(imp, imp + "\nimport {\n  applyUnifiedPatchToBuffer,\n  applyBinaryPatchToBuffer,\n  parseUnifiedDiff,\n} from './applyPatchEngine.js';\n");
}
const block = fs.readFileSync('scripts/apply_patch_block.txt', 'utf8');
if (src.includes("name: 'apply_patch'")) {
  process.stderr.write('ALREADY PRESENT, nothing to do\n');
  process.exit(0);
}
const idx = src.lastIndexOf('return tools;');
src = src.slice(0, idx) + block.trim() + '\n\n' + src.slice(idx);
fs.writeFileSync(p, src);
process.stdout.write('OK bytes=' + fs.readFileSync(p, 'utf8').length + '\n');
