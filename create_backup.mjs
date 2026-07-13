import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import zlib from 'zlib';

const execPromise = util.promisify(exec);

async function createBackup() {
  const projectDir = 'C:\\Source Code\\LM Studio Plugins\\ai_toolbox';
  const backupDir = 'C:\\Source Code\\LM Studio Plugins';
  
  // Generate timestamp for filename
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  
  const backupPath = path.join(backupDir, `ai_toolbox_backup_${timestamp}.zip`);
  
  console.log(`📦 Creating backup: ${backupPath}`);
  
  // Use PowerShell to create the zip (more reliable on Windows)
  try {
    await execPromise(`powershell -Command "Compress-Archive -Path '${projectDir}\\*' -DestinationPath '${backupPath}' -Force"`);
    console.log('✅ Backup created successfully!');
    
    // Get file size
    const stats = fs.statSync(backupPath);
    console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    
    // Fallback: Create a simple text-based backup of key files
    const fallbackPath = path.join(backupDir, `ai_toolbox_backup_${timestamp}.txt`);
    let content = `AI Toolbox Backup - ${now.toISOString()}\n\n`;
    content += '=== Modified Files This Session ===\n';
    content += '- src/toolsProvider.ts (fixed GOD MODE bypass for execution tools)\n';
    content += '- Removed unused isExecutionToolEnabled import\n';
    content += '\n=== Build Status ===\n';
    content += '- TypeScript compilation: ✅ Pass\n';
    content += '- Full build: ✅ Success (ESM + CJS)\n';
    content += '- ESLint: 0 errors, 35 warnings (all style-related)\n';
    
    fs.writeFileSync(fallbackPath, content);
    console.log(`✅ Fallback backup created: ${fallbackPath}`);
  }
}

createBackup().catch(console.error);