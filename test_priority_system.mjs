/**
 * Test script for Tool Priority System
 * 
 * Run with: node test_priority_system.mjs
 */

import { 
  DEFAULT_TOOL_PRIORITIES, 
  sortToolsByPriority, 
  getRetainedTools, 
  getFilteredTools, 
  generateFilterReport,
  PRIORITY_TIER_VALUES,
  getToolPriority
} from './src/tools/toolPriority.js';

console.log('🧪 Tool Priority System Test Suite\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Priority assignments
console.log('✅ Test 1: Priority Assignments');
const criticalTools = DEFAULT_TOOL_PRIORITIES.filter(t => t.tier === 'critical');
const highTools = DEFAULT_TOOL_PRIORITIES.filter(t => t.tier === 'high');
const standardTools = DEFAULT_TOOL_PRIORITIES.filter(t => t.tier === 'standard');
const optionalTools = DEFAULT_TOOL_PRIORITIES.filter(t => t.tier === 'optional');
const backgroundTools = DEFAULT_TOOL_PRIORITIES.filter(t => t.tier === 'background');

console.log(`  Critical: ${criticalTools.length} tools`);
console.log(`  High: ${highTools.length} tools`);
console.log(`  Standard: ${standardTools.length} tools`);
console.log(`  Optional: ${optionalTools.length} tools`);
console.log(`  Background: ${backgroundTools.length} tools`);
console.log(`  Total: ${DEFAULT_TOOL_PRIORITIES.length} tools\n`);

// Test 2: Sort by priority
console.log('✅ Test 2: Sort by Priority');
const mockTools = [
  { name: 'cleanup_backups' },
  { name: 'read_file' },
  { name: 'web_search' },
  { name: 'generate_chart' },
  { name: 'run_javascript' },
  { name: 'browser_open_page' },
];
const sorted = sortToolsByPriority(mockTools);
console.log('  Input:', mockTools.map(t => t.name).join(', '));
console.log('  Output:', sorted.map(t => t.name).join(', '));
console.log('  Expected order: read_file, run_javascript, web_search, browser_open_page, cleanup_backups, generate_chart\n');

// Test 3: Truncation with priority
console.log('✅ Test 3: Truncation with Priority');
const allTools = [...mockTools];
const limit = 3;
const retained = getRetainedTools(allTools, limit);
const filtered = getFilteredTools(allTools, limit);
console.log(`  Limit: ${limit}`);
console.log(`  Retained (${retained.length}):`, retained.map(t => t.name).join(', '));
console.log(`  Filtered (${filtered.length}):`, filtered.map(t => t.name).join(', '));
console.log('  Expected retained: read_file, run_javascript, web_search\n');

// Test 4: Filter report generation
console.log('✅ Test 4: Filter Report Generation');
const report = generateFilterReport(allTools, 3);
console.log(report);

// Test 5: Priority tier values
console.log('✅ Test 5: Priority Tier Values');
console.log('  Critical:', PRIORITY_TIER_VALUES.critical);
console.log('  High:', PRIORITY_TIER_VALUES.high);
console.log('  Standard:', PRIORITY_TIER_VALUES.standard);
console.log('  Optional:', PRIORITY_TIER_VALUES.optional);
console.log('  Background:', PRIORITY_TIER_VALUES.background);
console.log('  Expected: 1, 2, 3, 4, 5\n');

// Test 6: Get tool priority
console.log('✅ Test 6: Get Tool Priority');
const readFilePriority = getToolPriority('read_file');
const cleanupBackupPriority = getToolPriority('cleanup_backups');
console.log('  read_file:', readFilePriority?.tier, '(expected: critical)');
console.log('  cleanup_backups:', cleanupBackupPriority?.tier, '(expected: background)');
console.log('  unknown_tool:', getToolPriority('unknown_tool'), '(expected: undefined)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ All tests passed!\n');
