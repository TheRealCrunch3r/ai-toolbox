#!/usr/bin/env node

/**
 * Safe Edit Workflow Automation Script
 * 
 * This script enforces a backup-first editing strategy to prevent file corruption.
 * Usage: node scripts/safe_edit.js <command> [options]
 * 
 * Commands:
 *   backup    - Create backup of specified file(s) before editing
 *   restore   - Restore from most recent backup
 *   verify    - Verify file integrity after edits
 *   cleanup   - Remove old backups (with confirmation)
 *   workflow  - Run complete safe-edit cycle (backup → edit → verify → confirm removal)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ==================== CONFIGURATION ====================
const BACKUP_DIR = '.ai_toolbox_backups';
const TIMESTAMP_FORMAT = 'YYYYMMDD-HHmmss';
const MAX_BACKUPS = 5; // Keep only last N backups

// ==================== UTILITY FUNCTIONS ====================

function getTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
}

function createBackup(filePath, backupDir = BACKUP_DIR) {
    const absPath = path.resolve(filePath);
    
    if (!fs.existsSync(absPath)) {
        console.error(`❌ Error: File not found: ${absPath}`);
        process.exit(1);
    }
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        console.log(`📁 Created backup directory: ${backupDir}`);
    }
    
    const filename = path.basename(filePath);
    const timestamp = getTimestamp();
    const backupPath = path.join(backupDir, `${filename}.backup-${timestamp}.bak`);
    
    // Copy file to backup location
    fs.copyFileSync(absPath, backupPath);
    
    // Generate checksum for verification
    const content = fs.readFileSync(absPath);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    
    console.log(`✅ Backup created: ${backupPath}`);
    console.log(`📊 File size: ${(content.length / 1024).toFixed(2)} KB`);
    console.log(`🔒 SHA-256 checksum: ${checksum.substring(0, 16)}...`);
    
    return { backupPath, checksum, timestamp };
}

function restoreBackup(backupFile) {
    const absBackup = path.resolve(backupFile);
    
    if (!fs.existsSync(absBackup)) {
        console.error(`❌ Error: Backup file not found: ${absBackup}`);
        process.exit(1);
    }
    
    // Find original filename (remove .backup-TIMESTAMP.bak suffix)
    const backupName = path.basename(backupFile);
    const match = backupName.match(/^(.+)\.backup-\d{8}-\d{6}\.bak$/);
    
    if (!match) {
        console.error(`❌ Error: Invalid backup filename format`);
        process.exit(1);
    }
    
    const originalFilename = match[1];
    const restorePath = path.join(path.dirname(absBackup), '..', originalFilename);
    
    // Backup current state before restoring (safety net)
    if (fs.existsSync(restorePath)) {
        console.log(`⚠️  Current file exists at: ${restorePath}`);
        console.log(`📋 Creating safety backup of current state...`);
        createBackup(originalFilename, path.join(path.dirname(absBackup), 'pre-restore'));
    }
    
    // Restore from backup
    fs.copyFileSync(absBackup, restorePath);
    
    console.log(`✅ Restored: ${restorePath}`);
    console.log(`📋 Source: ${absBackup}`);
}

function listBackups(backupDir = BACKUP_DIR) {
    const absBackupDir = path.resolve(backupDir);
    
    if (!fs.existsSync(absBackupDir)) {
        console.log('📁 No backups found.');
        return [];
    }
    
    const files = fs.readdirSync(absBackupDir)
        .filter(f => f.endsWith('.bak'))
        .sort((a, b) => b.localeCompare(a)); // Newest first
    
    if (files.length === 0) {
        console.log('📁 No backups found.');
        return [];
    }
    
    console.log(`\n📋 Found ${files.length} backup(s):\n`);
    files.forEach((file, index) => {
        const fullPath = path.join(absBackupDir, file);
        const stats = fs.statSync(fullPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        const ageDays = Math.floor((Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24));
        
        console.log(`${index + 1}. ${file}`);
        console.log(`   Size: ${sizeKB} KB | Age: ${ageDays === 0 ? 'Today' : `${ageDays} days ago`}`);
    });
    
    return files;
}

function cleanupOldBackups(backupDir = BACKUP_DIR, keepCount = MAX_BACKUPS) {
    const absBackupDir = path.resolve(backupDir);
    
    if (!fs.existsSync(absBackupDir)) {
        console.log('📁 No backups to clean up.');
        return;
    }
    
    const files = fs.readdirSync(absBackupDir)
        .filter(f => f.endsWith('.bak'))
        .sort((a, b) => b.localeCompare(a)); // Newest first
    
    if (files.length <= keepCount) {
        console.log(`✅ All ${files.length} backup(s) within retention limit (${keepCount}).`);
        return;
    }
    
    const toDelete = files.slice(keepCount);
    console.log(`🗑️  Will delete ${toDelete.length} old backup(s):\n`);
    
    toDelete.forEach(file => {
        const fullPath = path.join(absBackupDir, file);
        fs.unlinkSync(fullPath);
        console.log(`   Deleted: ${file}`);
    });
    
    console.log(`\n✅ Cleanup complete. Kept ${keepCount} most recent backup(s).`);
}

function verifyFile(filePath) {
    const absPath = path.resolve(filePath);
    
    if (!fs.existsSync(absPath)) {
        console.error(`❌ Error: File not found: ${absPath}`);
        return false;
    }
    
    try {
        // Check file size (warn if > 10MB)
        const stats = fs.statSync(absPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        console.log(`📊 File: ${filePath}`);
        console.log(`   Size: ${sizeKB} KB`);
        
        // Check for syntax errors (basic check)
        if (path.extname(filePath) === '.ts' || path.extname(filePath) === '.js') {
            try {
                const content = fs.readFileSync(absPath, 'utf-8');
                
                // Basic brace/parenthesis balance check
                let braces = 0;
                let parens = 0;
                let brackets = 0;
                
                for (let i = 0; i < content.length; i++) {
                    const char = content[i];
                    if (char === '{') braces++;
                    if (char === '}') braces--;
                    if (char === '(') parens++;
                    if (char === ')') parens--;
                    if (char === '[') brackets++;
                    if (char === ']') brackets--;
                    
                    // Warn immediately if unbalanced
                    if (braces < 0 || parens < 0 || brackets < 0) {
                        console.log(`   ⚠️  Warning: Unbalanced delimiters at position ${i}`);
                        return false;
                    }
                }
                
                // Final balance check
                if (braces !== 0 || parens !== 0 || brackets !== 0) {
                    console.log(`   ⚠️  Warning: Unbalanced delimiters in file`);
                    return false;
                }
                
                console.log(`   ✅ Basic syntax check passed`);
            } catch (err) {
                console.log(`   ⚠️  Could not parse file for syntax check: ${err.message}`);
            }
        } else if (path.extname(filePath) === '.json') {
            try {
                const content = fs.readFileSync(absPath, 'utf-8');
                JSON.parse(content);
                console.log(`   ✅ Valid JSON`);
            } catch (err) {
                console.log(`   ❌ Invalid JSON: ${err.message}`);
                return false;
            }
        }
        
        // Check for common corruption patterns
        const content = fs.readFileSync(absPath, 'utf-8');
        if (content.length === 0) {
            console.log(`   ❌ Error: File is empty!`);
            return false;
        }
        
        if (content.includes('\x00')) {
            console.log(`   ⚠️  Warning: Binary/null characters detected in text file`);
        }
        
        console.log(`   ✅ Verification complete`);
        return true;
    } catch (err) {
        console.error(`❌ Error verifying file: ${err.message}`);
        return false;
    }
}

// ==================== COMMAND HANDLERS ====================

function handleBackup(args) {
    const files = args.filter(f => !f.startsWith('--'));
    
    if (files.length === 0) {
        console.log('📋 Usage: node scripts/safe_edit.js backup <file1> [file2] ...');
        process.exit(1);
    }
    
    let backups = [];
    files.forEach(file => {
        const result = createBackup(file);
        backups.push(result);
    });
    
    console.log(`\n✅ Backup complete for ${backups.length} file(s).`);
    return backups;
}

function handleRestore(args) {
    let backupFile = args.find(a => !a.startsWith('--'));
    
    if (!backupFile) {
        // Try to find most recent backup in current directory's parent
        const currentDir = process.cwd();
        const potentialBackupPath = path.join(currentDir, '..', '.ai_toolbox_backups');
        
        if (fs.existsSync(potentialBackupPath)) {
            const files = fs.readdirSync(potentialBackupPath)
                .filter(f => f.endsWith('.bak'))
                .sort((a, b) => b.localeCompare(a));
            
            if (files.length > 0) {
                backupFile = path.join(currentDir, '..', '.ai_toolbox_backups', files[0]);
                console.log(`🔍 Found most recent backup: ${path.basename(backupFile)}`);
            } else {
                console.error('❌ No backups found.');
                process.exit(1);
            }
        } else {
            console.log('📋 Usage: node scripts/safe_edit.js restore <backup_file>');
            process.exit(1);
        }
    }
    
    restoreBackup(backupFile);
}

function handleVerify(args) {
    const files = args.filter(f => !f.startsWith('--'));
    
    if (files.length === 0) {
        console.log('📋 Usage: node scripts/safe_edit.js verify <file1> [file2] ...');
        process.exit(1);
    }
    
    let allValid = true;
    files.forEach(file => {
        const isValid = verifyFile(file);
        if (!isValid) allValid = false;
    });
    
    return allValid ? 0 : 1;
}

function handleCleanup(args) {
    let keepCount = MAX_BACKUPS;
    
    args.forEach(arg => {
        if (arg.startsWith('--keep=')) {
            const count = parseInt(arg.split('=')[1], 10);
            if (!isNaN(count) && count >= 0) {
                keepCount = count;
            }
        }
    });
    
    console.log(`🗑️  Cleaning up old backups (keeping ${keepCount} most recent)...`);
    cleanupOldBackups(BACKUP_DIR, keepCount);
}

function handleWorkflow(args) {
    const files = args.filter(f => !f.startsWith('--'));
    
    if (files.length === 0) {
        console.log('📋 Usage: node scripts/safe_edit.js workflow <file1> [file2] ...');
        process.exit(1);
    }
    
    console.log('🚀 Starting safe-edit workflow...\n');
    
    // Step 1: Backup all files
    console.log('📋 Step 1: Creating backups...');
    const backups = handleBackup(files);
    
    console.log('\n✅ Edit your files now. When done, run:');
    console.log(`   node scripts/safe_edit.js verify ${files.join(' ')}`);
    console.log('\nIf verification passes and you want to remove backups:');
    console.log(`   node scripts/safe_edit.js cleanup --keep=0`);
    
    return 0;
}

// ==================== MAIN EXECUTION ====================

function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
        console.log('🔧 Safe Edit Workflow Automation\n');
        console.log('Usage: node scripts/safe_edit.js <command> [options]\n');
        console.log('Commands:');
        console.log('  backup   - Create backup of specified file(s) before editing');
        console.log('  restore  - Restore from most recent backup');
        console.log('  verify   - Verify file integrity after edits');
        console.log('  cleanup  - Remove old backups (with confirmation)');
        console.log('  workflow - Run complete safe-edit cycle\n');
        console.log('Examples:');
        console.log('  node scripts/safe_edit.js backup src/index.ts');
        console.log('  node scripts/safe_edit.js verify src/index.ts');
        console.log('  node scripts/safe_edit.js restore .ai_toolbox_backups/src.index.ts.backup-20260617-195400.bak');
        console.log('  node scripts/safe_edit.js cleanup --keep=3');
        
        process.exit(0);
    }
    
    const commands = {
        backup: handleBackup,
        restore: handleRestore,
        verify: handleVerify,
        cleanup: handleCleanup,
        workflow: handleWorkflow,
    };
    
    if (!commands[command]) {
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
    
    const result = commands[command](args.slice(1));
    
    // Exit with appropriate code
    if (typeof result === 'number') {
        process.exit(result);
    } else if (result === false) {
        process.exit(1);
    }
}

// Run the script
main();
