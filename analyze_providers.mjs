import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse toolsProvider.ts to get actual imports and registration logic
const providerFile = path.join(__dirname, 'src/toolsProvider.ts');
const providerContent = fs.readFileSync(providerFile, 'utf8');

// Extract category names from comments (e.g., "--- File System Tools ---")
const categoryRegex = /---\s*(.+?)\s*---/g;
const categories = [];
let match;
while ((match = categoryRegex.exec(providerContent)) !== null) {
  categories.push(match[1].trim());
}

// Also extract config keys used for toggling
const configKeys = [...providerContent.matchAll(/pluginConfig\.get\(['"]([^'"]+)['"]/g)]
  .map(m => m[1]);

console.log('=== CATEGORIES FROM TOOLS PROVIDER ===');
categories.forEach((cat, i) => {
  console.log(`${i + 1}. ${cat}`);
});

console.log('\n=== CONFIG KEYS USED FOR GATING ===');
configKeys.forEach(key => console.log(`- ${key}`));

// Now load tool counts from our earlier analysis
const toolsDir = path.join(__dirname, 'src/tools');
const fileToCategoryMap = {
  'fileSystemTools.ts': 'File System',
  'webResearchTools.ts': 'Web Research',
  'gitGithubTools.ts': 'Git & GitHub',
  'browserAutomationTools.ts': 'Browser Automation',
  'databaseTools.ts': 'Database',
  'documentTools.ts': 'Document Parsing',
  'backgroundCommandTools.ts': 'Background Commands',
  'imageProcessingTools.ts': 'Image Processing',
  'httpClientTools.ts': 'HTTP Client',
  'vectorRagTools.ts': 'Vector RAG',
  'uiGenerationTools.ts': 'UI Generation',
  'contextManagementTools.ts': 'Context Management',
  'textProcessingTools.ts': 'Text Processing',
  'refactorCodeTools.ts': 'AST Code Refactoring',
  'executionTools.ts': 'Execution'
};

// Get tool counts from JSON we generated earlier
const toolCountsFile = path.join(__dirname, 'tool_counts.json');
if (fs.existsSync(toolCountsFile)) {
  const toolData = JSON.parse(fs.readFileSync(toolCountsFile, 'utf8'));
  
  console.log('\n=== REGISTERED TOOLS BY CATEGORY ===');
  let totalRegistered = 0;
  Object.keys(fileToCategoryMap).forEach(filename => {
    if (toolData[filename]) {
      const catName = fileToCategoryMap[filename];
      const count = toolData[filename].count;
      totalRegistered += count;
      console.log(`${catName}: ${count} tools`);
    }
  });
  
  console.log(`\n=== TOTAL REGISTERED TOOLS ===`);
  console.log(totalRegistered);
  
  // Unregistered files (exist but not imported)
  const unregistered = Object.keys(toolData).filter(f => !fileToCategoryMap[f]);
  if (unregistered.length > 0) {
    console.log('\n=== UNREGISTERED TOOL FILES ===');
    unregistered.forEach(f => {
      if (toolData[f].count > 0) {
        console.log(`${f}: ${toolData[f].count} tools`);
      }
    });
  }
  
  // Save for reference
  fs.writeFileSync(path.join(__dirname, 'actual_tool_summary.json'), JSON.stringify({
    categories: fileToCategoryMap,
    totalRegistered,
    unregisteredFiles: unregistered.filter(f => toolData[f].count > 0)
  }, null, 2));
}
