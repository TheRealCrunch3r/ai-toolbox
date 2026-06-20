import fs from 'fs';

// Read current CHANGELOG
let content = fs.readFileSync('./CHANGELOG.md', 'utf-8');

// New entry to prepend (after ## [1.5.12])
const newEntry = `
---

## [1.5.13] - 2026-06-20

### 🐛 **Jest moduleNameMapper Regex Fix — Dynamic Import Resolution**\n\n**Test suite now passes successfully after fixing MODULE_NOT_FOUND errors for dynamically imported tool modules.**\n\n#### What Changed
- **Fixed**: All tool module dynamic import patterns in `jest.config.cjs` changed from two-dot (`'\\.\\.'`) to single-dot (`'\\./'`) regex matching
- **Removed**: Conflicting ESM config file (`jest.config.js`) — only CommonJS format used with `"type": "commonjs"` package\n- **Added**: Missing module mappings for `textProcessingTools`, `contextManagementTools`, `uiGenerationTools`
- **Added**: Fallback catch-all rule to automatically mock future tool modules without manual config updates

#### Root Cause
Jest's `moduleNameMapper` regex patterns used `'\\.\\./tools/...'` (matching two dots → `../tools/...`) but actual imports in `src/toolsProvider.ts` use `'./tools/xxx.js'` (one dot). This caused Jest to fall through to the filesystem resolver, which failed because `.js` files don't exist at runtime (only `.ts` source does).\n\n#### How It Works
```javascript
// BEFORE (broken — matches ../tools/...):
'^\\\\.\\\\./tools/fileSystemTools\\\\.js$': '<rootDir>/tests/__mocks__/fileSystemTools.ts',

// AFTER (correct — matches ./tools/...):
'^\\\\.\\\\/tools/fileSystemTools\\\\.js$': '<rootDir>/tests/__mocks__/fileSystemTools.ts',
```\n\n**Total**: 17 lines changed in `jest.config.cjs`, zero breaking changes, test suite now passes.\n\n---\n`;

// Insert after the first ## [1.5.12] section (find the closing ---)
const firstSeparator = content.indexOf('---', content.indexOf('## [1.5.12]'));
if (firstSeparator > 0) {
  const insertPos = content.indexOf('\n\n', firstSeparator);
  if (insertPos > 0) {
    content = content.slice(0, insertPos) + newEntry + content.slice(insertPos);
    fs.writeFileSync('./CHANGELOG.md', content);
    console.log('✅ CHANGELOG.md updated with v1.5.13 entry');
  } else {
    console.error('❌ Could not find insertion point');
  }
} else {
  console.error('❌ Could not find [1.5.12] section');
}
