import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.join(__dirname, 'src/tools');

let total = 0;
const categories = {};

try {
  const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.ts'));
  
  for (const file of files) {
    const filePath = path.join(toolsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Match name: 'tool_name' patterns
    const matches = [...content.matchAll(/name:\s*['"]([^'"]+)['"]/g)];
    const names = matches.map(m => m[1]);
    
    categories[file] = {
      count: names.length,
      tools: names
    };
    total += names.length;
  }

  console.log('=== TOOL COUNTS BY CATEGORY ===\n');
  Object.keys(categories).forEach(file => {
    const cat = categories[file];
    console.log(`${file}: ${cat.count} tools`);
    console.log(`  Tools: ${cat.tools.join(', ')}`);
    console.log();
  });

  console.log('=== TOTAL TOOLS ===');
  console.log(total);
  
  // Save to file for easy reference
  fs.writeFileSync(path.join(__dirname, 'tool_counts.json'), JSON.stringify(categories, null, 2));
} catch (err) {
  console.error('Error:', err.message);
}
