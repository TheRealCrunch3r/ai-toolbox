import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

/**
 * AI Toolbox - Automated Documentation Generator
 * Scans the src/tools directory to extract tool names and descriptions.
 */

function generateDocs() {
  const toolsDir = path.join(process.cwd(), 'src', 'tools');
  const outputFile = path.join(process.cwd(), 'TOOLS_REFERENCE.md');
  
  console.log(`🔍 Scanning directory: ${toolsDir}`);

  // We will use a regex to find: name: 'tool_name' or name: "tool_name"
  // and the following description string.
  // Note: This is a simplified parser for a build script.
  const toolRegex = /name:\s*['"]([^'"]+)['"][\s\S]*?description:\s*['"]([^'"]+)['"]/g;

  let totalToolsFound = 0;
  let content = '# 🛠️ AI Toolbox - Automated Tool Reference\n\n';
  content += `*Generated on: ${new Date().toISOString()}*\n\n`;
  content += '| Tool Name | Description |\n| :--- | :--- |\n';

  // In a real production environment, we would use an AST parser (like TypeScript Compiler API)
  // to be 100% robust. For this generator, we will scan files for the pattern used in register functions.
  
  const files = require('fs').readdirSync(toolsDir).filter(f => f.endsWith('.ts'));

  files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    const fileContent = readFileSync(filePath, 'utf8');
    
    let match;
    // This regex is designed to catch the pattern inside tool({}) calls
    // It looks for name: '...' followed by description: '...' 
    // accounting for potential whitespace/newlines.
    const pattern = /name:\s*['"]([^'"]+)['"][^'"]*?description:\s*['"]([^'"]+)['"]/gs;

    while ((match = pattern.exec(fileContent)) !== null) {
      const [_, name, description] = match;
      content += `| \`${name}\` | ${description.replace(/\n/g, ' ')} |\n`;
      totalToolsFound++;
    }
  });

  if (totalToolsFound === 0) {
    console.error('❌ No tools were found! Check if the regex matches your tool registration pattern.');
    return;
  }

  content += `\n\n**Total Tools Detected: ${totalToolsFound}**\n`;

  writeFileSync(outputFile, content);
  console.log(`✅ Successfully generated ${outputFile}`);
  console.log(`📊 Total tools indexed: ${totalToolsFound}`);
}

generateDocs();
