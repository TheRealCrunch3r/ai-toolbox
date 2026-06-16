#!/usr/bin/env node

/**
 * decode_context.js — CLI Utility to Decode msgpack Context Files to JSON
 * 
 * Usage:
 *   node scripts/decode_context.js <path_to_msgpack_file> [output_json_path]
 *   
 * Examples:
 *   # Decode context storage file and print to stdout
 *   node scripts/decode_context.js .ai_toolbox_context.msgpack
 *   
 *   # Decode and save to a new JSON file
 *   node scripts/decode_context.js .ai_toolbox_context.msgpack decoded_context.json
 *   
 *   # Decode state memory file (also supports manual inspection)
 *   node scripts/decode_context.js .ai_toolbox_memory.msgpack decoded_state.json

Requirements:
  npm install @msgpack/msgpack --save-dev
  
This utility converts binary msgpack files back to pretty-printed JSON for:
- Debugging context entries when something breaks
- Manual inspection of auto-tracked decisions/completions/error fixes
- Migration backups (convert binary → JSON before making schema changes)
*/

const fs = require('fs');
const path = require('path');
const { decode } = require('@msgpack/msgpack');

// ==================== CONFIGURATION ====================

const USAGE = `
Usage: node scripts/decode_context.js <input_msgpack> [output_json]

Arguments:
  input_msgpack    Path to .msgpack file (context storage or state memory)
  output_json      Optional: path for decoded JSON output. If omitted, prints to stdout.

Examples:
  # Print context entries as JSON to terminal
  node scripts/decode_context.js .ai_toolbox_context.msgpack
  
  # Save decoded state to a file for manual inspection
  node scripts/decode_context.js .ai_toolbox_memory.msgpack decoded_state.json
`;

// ==================== MAIN LOGIC ====================

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Error: Input file path required.');
    console.log(USAGE);
    process.exit(1);
  }
  
  const inputFile = path.resolve(args[0]);
  const outputFile = args[1] ? path.resolve(args[1]) : null;
  
  // Validate input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }
  
  try {
    // Read binary file as Buffer
    const buffer = fs.readFileSync(inputFile);
    
    if (buffer.length === 0) {
      console.warn('Warning: File is empty. No entries to decode.');
      
      if (outputFile) {
        fs.writeFileSync(outputFile, '[]', 'utf-8');
        console.log(`Saved empty array to: ${outputFile}`);
      } else {
        console.log('[]');  // Print empty JSON array to stdout
      }
      
      process.exit(0);
    }
    
    // Decode msgpack Buffer → JavaScript object
    const decoded = decode(buffer);
    
    // Validate structure (expect array of entries)
    if (!Array.isArray(decoded)) {
      console.warn('Warning: Decoded data is not an array. Raw output follows:');
      console.log(JSON.stringify(decoded, null, 2));
      
      if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(decoded, null, 2), 'utf-8');
      } else {
        console.log('\n--- RAW OUTPUT ---');
        console.log(JSON.stringify(decoded, null, 2));
      }
      
      process.exit(0);
    }
    
    // Pretty-print as JSON
    const jsonOutput = JSON.stringify(decoded, null, 2);
    
    if (outputFile) {
      // Save to file with UTF-8 encoding and BOM for Windows compatibility
      fs.writeFileSync(outputFile, jsonOutput, 'utf-8');
      console.log(`✅ Decoded ${decoded.length} entries → ${outputFile}`);
      
      // Show size comparison
      const originalSize = buffer.byteLength;
      const jsonSize = Buffer.byteLength(jsonOutput, 'utf-8');
      const compressionRatio = ((1 - (originalSize / jsonSize)) * 100).toFixed(1);
      
      console.log(`📊 Size comparison: ${formatBytes(originalSize)} (msgpack) → ${formatBytes(jsonSize)} (JSON)`);
      console.log(`💾 Space saved by msgpack: ${compressionRatio}%`);
    } else {
      // Print to stdout
      process.stdout.write(jsonOutput + '\n');
      
      // Show summary stats
      const totalEntries = decoded.length;
      const types = {};
      decoded.forEach(entry => {
        if (entry && entry.type) {
          types[entry.type] = (types[entry.type] || 0) + 1;
        }
      });
      
      console.log(`\n--- SUMMARY ---`);
      console.log(`Total entries: ${totalEntries}`);
      console.log(`Entry types:`);
      Object.entries(types).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error decoding file: ${message}`);
    console.error('This usually means the file is corrupted or not a valid msgpack archive.');
    
    // Offer to show raw hex dump for debugging
    if (inputFile) {
      const buffer = fs.readFileSync(inputFile);
      console.log(`\n🔍 First 64 bytes as hex:`);
      console.log(buffer.slice(0, 64).toString('hex'));
    }
    
    process.exit(1);
  }
}

/** Format bytes to human-readable string */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Run main function
main();
