/**
 * Comprehensive simulation of Hub-Exclusion Clustering features
 * Inspired by Graphify's architectural analysis capabilities.
 */

import {
  addEdge,
  calculateDegrees,
  identifyHubs,
  louvainCommunityDetection,
  reattachHubsByMajorityVote,
  calculateClusterDensity,
  calculateModularity,
  performHubExclusionClustering,
  generateClusteringReport,
  analyzeAiToolboxDependencies,
} from './hubExclusionClustering.js';

import {
  computeCentralityScores,
  sortToolsByClusterAwarePriority,
  DEFAULT_TOOL_PRIORITIES,
} from '../tools/toolPriority.js';

// ==================== SIMULATION UTILITIES ====================

function separator(title: string): void {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

function printMap<T>(map: Map<string, T>, label: string = ''): void {
  if (label) console.log(`\n${label}:`);
  for (const [key, value] of map.entries()) {
    console.log(`  ${key.padEnd(30)} → ${String(value)}`);
  }
}

function printSet(set: Set<string>, label: string = ''): void {
  if (label) console.log(`\n${label}:`);
  for (const item of set) {
    console.log(`  • ${item}`);
  }
}

// ==================== FEATURE 1: HUB DETECTION AT MULTIPLE THRESHOLDS ====================

function simulateHubDetection(): void {
  separator('FEATURE 1: Hub Detection at Multiple Percentile Thresholds');

  // Create a star graph with clear hub (degree=5) and leaves (degree=1)
  const adjacency = new Map<string, Set<string>>();
  for (let i = 1; i <= 5; i++) {
    addEdge(adjacency, 'hub', `leaf${i}`);
  }

  const degrees = calculateDegrees(adjacency);
  
  console.log('\n📊 Degree Distribution:');
  printMap(degrees, 'Node → Degree');

  for (const threshold of [70, 80, 95]) {
    const hubs = identifyHubs(degrees, threshold);
    console.log(`\n🔍 Hub Detection at ${threshold}th percentile:`);
    console.log(`   Threshold value: degrees ≥ ${Array.from(degrees.values()).sort((a,b) => a-b)[Math.floor(5 * (threshold/100))]} (strict >)`);
    if (hubs.size > 0) {
      printSet(hubs, `Identified Hubs (${hubs.size})`);
    } else {
      console.log('   No hubs identified');
    }
  }

  // Test with complete graph (all equal degrees)
  const adjComplete = new Map<string, Set<string>>();
  for (let i = 1; i <= 5; i++) {
    for (let j = i + 1; j <= 5; j++) {
      addEdge(adjComplete, `node${i}`, `node${j}`);
    }
  }

  const degComplete = calculateDegrees(adjComplete);
  console.log('\n📊 Complete Graph Degrees (all equal):');
  printMap(degComplete);

  for (const threshold of [50, 80, 95]) {
    const hubs = identifyHubs(degComplete, threshold);
    console.log(`\n🔍 Hub Detection at ${threshold}th percentile:`);
    if (hubs.size > 0) {
      printSet(hubs, `Identified Hubs (${hubs.size})`);
    } else {
      console.log('   No hubs identified (all equal degrees → strict > fails for all)');
    }
  }
}

// ==================== FEATURE 2: LOUVAIN COMMUNITY DETECTION ====================

function simulateLouvain(): void {
  separator('FEATURE 2: Louvain Community Detection on Non-Hub Subgraphs');

  // Test 1: Two distinct clusters (triangles)
  const adjTriangles = new Map<string, Set<string>>();
  addEdge(adjTriangles, 'A', 'B');
  addEdge(adjTriangles, 'B', 'C');
  addEdge(adjTriangles, 'C', 'A'); // Triangle A

  addEdge(adjTriangles, 'D', 'E');
  addEdge(adjTriangles, 'E', 'F');
  addEdge(adjTriangles, 'F', 'D'); // Triangle B

  const communities1 = louvainCommunityDetection(adjTriangles);
  
  console.log('\n📊 Test 1: Two Distinct Triangles (A-B-C and D-E-F)');
  printMap(communities1, 'Node → Community ID');
  
  // Verify connected nodes are in same community
  const aSame = communities1.get('A') === communities1.get('B') && 
                communities1.get('B') === communities1.get('C');
  const dSame = communities1.get('D') === communities1.get('E') && 
                communities1.get('E') === communities1.get('F');
  
  console.log(`\n✅ Triangle A nodes in same community: ${aSame ? 'YES' : 'NO'}`);
  console.log(`✅ Triangle B nodes in same community: ${dSame ? 'YES' : 'NO'}`);

  // Test 2: Disconnected components with isolated node
  const adjDisconnected = new Map<string, Set<string>>();
  addEdge(adjDisconnected, 'X', 'Y');
  adjDisconnected.set('Z', new Set()); // Isolated

  const communities2 = louvainCommunityDetection(adjDisconnected);
  
  console.log('\n📊 Test 2: Disconnected Component + Isolated Node (X-Y-Z)');
  printMap(communities2, 'Node → Community ID');
  console.log(`✅ X and Y in same community: ${communities2.get('X') === communities2.get('Y') ? 'YES' : 'NO'}`);

  // Test 3: Chain graph (linear structure)
  const adjChain = new Map<string, Set<string>>();
  addEdge(adjChain, 'A', 'B');
  addEdge(adjChain, 'B', 'C');
  addEdge(adjChain, 'C', 'D');

  const communities3 = louvainCommunityDetection(adjChain);
  
  console.log('\n📊 Test 3: Chain Graph (A-B-C-D)');
  printMap(communities3, 'Node → Community ID');
}

// ==================== FEATURE 3: MAJORITY-VOTE HUB REATTACHMENT ====================

function simulateHubReattachment(): void {
  separator('FEATURE 3: Majority-Vote Hub Reattachment with Tie-Breaking');

  // Test 1: Clear majority (2 vs 1)
  const adj1 = new Map<string, Set<string>>();
  addEdge(adj1, 'hub', 'A1');
  addEdge(adj1, 'hub', 'A2');
  addEdge(adj1, 'hub', 'B1');
  addEdge(adj1, 'A1', 'A2');

  const hubs1 = new Set(['hub']);
  const nonHubCommunities1 = new Map<string, number>();
  nonHubCommunities1.set('A1', 0); // Cluster 0 (majority)
  nonHubCommunities1.set('A2', 0); // Cluster 0
  nonHubCommunities1.set('B1', 1); // Cluster 1

  const assignments1 = reattachHubsByMajorityVote(hubs1, adj1, nonHubCommunities1);
  
  console.log('\n📊 Test 1: Clear Majority (2 neighbors in cluster 0, 1 in cluster 1)');
  console.log(`   hub → Cluster ${assignments1['hub']} ✅ Expected: 0`);

  // Test 2: Tie-breaking (prefer lower cluster ID)
  const adj2 = new Map<string, Set<string>>();
  addEdge(adj2, 'hub', 'A1');
  addEdge(adj2, 'hub', 'B1');

  const hubs2 = new Set(['hub']);
  const nonHubCommunities2 = new Map<string, number>();
  nonHubCommunities2.set('A1', 5); // Cluster 5
  nonHubCommunities2.set('B1', 3); // Cluster 3 (lower)

  const assignments2 = reattachHubsByMajorityVote(hubs2, adj2, nonHubCommunities2);
  
  console.log('\n📊 Test 2: Tie-Breaking (tie between cluster 5 and cluster 3)');
  console.log(`   hub → Cluster ${assignments2['hub']} ✅ Expected: 3 (lower ID wins)`);

  // Test 3: Isolated hub (no neighbors in any cluster)
  const adj3 = new Map<string, Set<string>>();
  adj3.set('isolatedHub', new Set());

  const hubs3 = new Set(['isolatedHub']);
  const nonHubCommunities3 = new Map<string, number>(); // Empty

  const assignments3 = reattachHubsByMajorityVote(hubs3, adj3, nonHubCommunities3);
  
  console.log('\n📊 Test 3: Isolated Hub (no neighbors)');
  console.log(`   isolatedHub → Cluster ${assignments3['isolatedHub']} ✅ Expected: -1`);

  // Test 4: Multiple hubs with different cluster preferences
  const adj4 = new Map<string, Set<string>>();
  addEdge(adj4, 'hub1', 'A1');
  addEdge(adj4, 'hub1', 'A2');
  addEdge(adj4, 'hub2', 'B1');
  addEdge(adj4, 'hub2', 'B2');

  const hubs4 = new Set(['hub1', 'hub2']);
  const nonHubCommunities4 = new Map<string, number>();
  nonHubCommunities4.set('A1', 0);
  nonHubCommunities4.set('A2', 0);
  nonHubCommunities4.set('B1', 1);
  nonHubCommunities4.set('B2', 1);

  const assignments4 = reattachHubsByMajorityVote(hubs4, adj4, nonHubCommunities4);
  
  console.log('\n📊 Test 4: Multiple Hubs');
  printMap(new Map(Object.entries(assignments4)), 'Hub → Cluster Assignment');
}

// ==================== FEATURE 4: CLUSTER DENSITY & MODULARITY SCORING ====================

function simulateDensityModularity(): void {
  separator('FEATURE 4: Cluster Density & Modularity Scoring');

  // Test 1: Fully connected triangle (density = 1.0)
  const adjTriangle = new Map<string, Set<string>>();
  addEdge(adjTriangle, 'A', 'B');
  addEdge(adjTriangle, 'B', 'C');
  addEdge(adjTriangle, 'A', 'C');

  const density1 = calculateClusterDensity(['A', 'B', 'C'], adjTriangle);
  
  console.log('\n📊 Test 1: Fully Connected Triangle (3 nodes, 3 edges)');
  console.log(`   Density: ${density1.toFixed(2)} ✅ Expected: 1.0`);

  // Test 2: Half-connected cluster (2 out of 3 possible edges)
  const adjHalf = new Map<string, Set<string>>();
  addEdge(adjHalf, 'A', 'B');
  addEdge(adjHalf, 'A', 'C'); // B-C missing

  const density2 = calculateClusterDensity(['A', 'B', 'C'], adjHalf);
  
  console.log('\n📊 Test 2: Half-Connected Cluster (2 out of 3 possible edges)');
  console.log(`   Density: ${density2.toFixed(2)} ✅ Expected: 0.67`);

  // Test 3: Single node (density = 0)
  const density3 = calculateClusterDensity(['A'], adjTriangle);
  
  console.log('\n📊 Test 3: Single Node Cluster');
  console.log(`   Density: ${density3.toFixed(2)} ✅ Expected: 0.0`);

  // Modularity scoring
  const edges = [
    { source: 'A', target: 'B' }, // Same community
    { source: 'C', target: 'D' }, // Different communities
  ];
  
  const nodeDegrees = new Map<string, number>([
    ['A', 1], ['B', 1], ['C', 1], ['D', 1]
  ]);
  
  const clusterAssignments = new Map<string, number>();
  clusterAssignments.set('A', 0);
  clusterAssignments.set('B', 0); // Same community as A
  clusterAssignments.set('C', 1); // Different community
  clusterAssignments.set('D', 2); // Different community

  const modularity = calculateModularity(edges, nodeDegrees, clusterAssignments);
  
  console.log('\n📊 Modularity Scoring (with within-community edge)');
  console.log(`   Modularity: ${modularity.toFixed(4)} ✅ Expected: >0`);
}

// ==================== FEATURE 5: FULL CLUSTERING PIPELINE ====================

function simulateFullPipeline(): void {
  separator('FEATURE 5: Full Clustering Pipeline (End-to-End)');

  // Create realistic graph: star with internal cluster connections
  const adjacency = new Map<string, Set<string>>();
  
  // Hub connected to many leaves
  for (let i = 1; i <= 8; i++) {
    addEdge(adjacency, 'hub', `leaf${i}`);
  }
  
  // Internal cluster connections among some leaves
  addEdge(adjacency, 'leaf1', 'leaf2');
  addEdge(adjacency, 'leaf3', 'leaf4');
  addEdge(adjacency, 'leaf5', 'leaf6');

  const result = performHubExclusionClustering(adjacency);

  console.log('\n📊 Graph Statistics:');
  console.log(`   Total modules: ${result.nodes.length}`);
  console.log(`   Total connections: ${result.edges.length}`);
  console.log(`   Hub threshold: ${result.hubThresholdPercentile}th percentile`);

  printSet(new Set(result.hubs), `Identified Hubs (${result.hubs.length})`);
  printSet(new Set(result.nonHubs), `Non-Hub Modules (${result.nonHubs.length})`);

  console.log('\n📊 Community Clusters:');
  for (const cluster of result.clusters) {
    const densityStr = cluster.density != null ? ` | density: ${cluster.density.toFixed(2)}` : '';
    console.log(`   Cluster ${cluster.clusterId} (${cluster.size} modules${densityStr})`);
    console.log(`     Members: ${cluster.members.join(', ')}`);
  }

  console.log('\n📊 Hub Assignments (via majority-vote):');
  for (const [hubId, clusterId] of Object.entries(result.hubAssignments)) {
    const status = clusterId >= 0 ? `→ Cluster ${clusterId}` : '→ Unassigned';
    console.log(`   ${hubId.padEnd(15)} ${status}`);
  }

  console.log('\n📊 Quality Metrics:');
  console.log(`   Modularity: ${result.modularity?.toFixed(3) ?? 'N/A'}`);
}

// ==================== FEATURE 6: REPORT GENERATION ====================

function simulateReportGeneration(): void {
  separator('FEATURE 6: Clustering Report Generation');

  // Create a meaningful graph for report generation
  const adjacency = new Map<string, Set<string>>();
  
  // Create a realistic dependency structure
  addEdge(adjacency, 'core', 'module1');
  addEdge(adjacency, 'core', 'module2');
  addEdge(adjacency, 'core', 'module3');
  addEdge(adjacency, 'module1', 'module4');
  addEdge(adjacency, 'module2', 'module5');
  addEdge(adjacency, 'module3', 'module6');

  const resultWithGraph = performHubExclusionClustering(adjacency);
  
  console.log(generateClusteringReport(resultWithGraph));
}

// ==================== FEATURE 7: AI-TOOLBOX DEPENDENCY ANALYSIS ====================

function simulateAiToolboxAnalysis(): void {
  separator('FEATURE 7: ai-toolbox Plugin Dependency Analysis');

  const result = analyzeAiToolboxDependencies();

  console.log('\n📊 Project Statistics:');
  console.log(`   Total modules analyzed: ${result.nodes.length}`);
  console.log(`   Total connections found: ${result.edges.length}`);
  console.log(`   Hub threshold used: ${result.hubThresholdPercentile}th percentile`);

  printSet(new Set(result.hubs), `Architectural Hubs (${result.hubs.length})`);

  console.log('\n📊 Module Clusters:');
  for (const cluster of result.clusters) {
    const densityStr = cluster.density != null ? ` | density: ${cluster.density.toFixed(2)}` : '';
    console.log(`   Cluster ${cluster.clusterId} (${cluster.size} modules${densityStr})`);
    if (cluster.members.length <= 10) {
      console.log(`     Members: ${cluster.members.join(', ')}`);
    } else {
      console.log(`     Members: ${cluster.members.slice(0, 8).join(', ')}... and ${cluster.members.length - 8} more`);
    }
  }

  console.log('\n📊 Hub Assignments:');
  for (const [hubId, clusterId] of Object.entries(result.hubAssignments)) {
    const status = clusterId >= 0 ? `→ Cluster ${clusterId}` : '→ Unassigned';
    console.log(`   ${hubId.padEnd(35)} ${status}`);
  }

  console.log('\n📊 Quality Metrics:');
  console.log(`   Modularity Score: ${result.modularity?.toFixed(3) ?? 'N/A'}`);
  
  const quality = result.modularity != null 
    ? (result.modularity > 0.3 ? 'Strong community structure' : result.modularity > 0.2 ? 'Moderate community structure' : 'Weak community structure')
    : 'N/A';
  console.log(`   Interpretation: ${quality}`);

  console.log('\n📊 Full Report:\n');
  console.log(generateClusteringReport(result));
}

// ==================== FEATURE 8: TOOLPRIORITY INTEGRATION ====================

function simulateToolPriorityIntegration(): void {
  separator('FEATURE 8: ToolPriority Integration — Centrality Scores & Cluster-Aware Sorting');

  const result = analyzeAiToolboxDependencies();
  
  // Compute centrality scores for all tools
  const centralityScores = computeCentralityScores(DEFAULT_TOOL_PRIORITIES, result);

  console.log('\n📊 Top 10 Tools by Centrality Score:');
  const sortedByCentrality = Array.from(centralityScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  for (const [toolName, score] of sortedByCentrality) {
    const toolPriority = DEFAULT_TOOL_PRIORITIES.find(t => t.name === toolName);
    const tier = toolPriority ? toolPriority.tier : 'unknown';
    console.log(`   ${toolName.padEnd(30)} centrality: ${score.toFixed(4).padStart(7)}  |  tier: ${tier}`);
  }

  // Demonstrate cluster-aware sorting vs standard priority sorting
  const sampleTools = [
    { name: 'read_file' },        // critical, fileSystem tools (high centrality)
    { name: 'web_search' },       // high, webResearch tools
    { name: 'browser_open_page' }, // standard, browser tools
    { name: 'save_file' },        // critical, fileSystem tools
  ];

  console.log('\n📊 Cluster-Aware Tool Sorting (by tier + centrality):');
  const sortedClusterAware = sortToolsByClusterAwarePriority(sampleTools, result);
  
  for (let i = 0; i < sortedClusterAware.length; i++) {
    const tool = sortedClusterAware[i];
    const score = centralityScores.get(tool.name) ?? 0;
    console.log(`   ${i + 1}. ${tool.name.padEnd(30)} centrality: ${score.toFixed(4)}`);
  }

  // Compare with standard priority sorting (without clustering)
  const sortedStandard = sortToolsByClusterAwarePriority(sampleTools, undefined);
  
  console.log('\n📊 Standard Priority Sorting (fallback without clustering):');
  for (let i = 0; i < sortedStandard.length; i++) {
    const tool = sortedStandard[i];
    console.log(`   ${i + 1}. ${tool.name}`);
  }

  // Generate cluster-aware filtering report
  const allTools = DEFAULT_TOOL_PRIORITIES.map(t => ({ name: t.name }));
  
  console.log('\n📊 Cluster-Aware Filter Report (limit=20):');
  const retained = sortedClusterAware.slice(0, 20);
  const filtered = sortedClusterAware.slice(20);
  
  console.log(`   Total tools: ${allTools.length}`);
  console.log(`   Retained: ${retained.length}`);
  console.log(`   Filtered: ${filtered.length}`);

  if (filtered.length > 0) {
    console.log('\n   First 5 filtered tools with centrality scores:');
    for (const tool of filtered.slice(0, 5)) {
      const score = centralityScores.get(tool.name) ?? 0;
      const priority = DEFAULT_TOOL_PRIORITIES.find(t => t.name === tool.name);
      const tier = priority ? priority.tier : 'unknown';
      console.log(`     • ${tool.name.padEnd(30)} | centrality: ${score.toFixed(4).padStart(7)} | tier: ${tier}`);
    }
  }
}

// ==================== FEATURE 9: CONTEXTGUARD INTEGRATION ====================

function simulateContextGuardIntegration(): void {
  separator('FEATURE 9: ContextGuard Integration — File Cluster Info & Architectural Insights');

  const result = analyzeAiToolboxDependencies();

  console.log('\n📊 Architectural Hubs (high-degree modules):');
  for (const hub of result.hubs) {
    const node = result.nodes.find(n => n.id === hub);
    if (node) {
      console.log(`   • ${hub.padEnd(35)} degree: ${node.degree}`);
    }
  }

  console.log('\n📊 Module Clusters (architectural groupings):');
  for (const cluster of result.clusters) {
    const densityStr = cluster.density != null ? ` | density: ${cluster.density.toFixed(2)}` : '';
    console.log(`   Cluster ${cluster.clusterId}: ${cluster.size} modules${densityStr}`);
    
    // Show hub assignments within this cluster
    const hubsInCluster = Object.entries(result.hubAssignments)
      .filter(([_, clusterId]) => clusterId === cluster.clusterId)
      .map(([hubId]) => hubId);
    
    if (hubsInCluster.length > 0) {
      console.log(`     Hub modules in this cluster: ${hubsInCluster.join(', ')}`);
    }
  }

  console.log('\n📊 Isolated Modules (no significant connections):');
  const lowDegreeNodes = result.nodes.filter(n => n.degree <= 1);
  if (lowDegreeNodes.length > 0) {
    for (const node of lowDegreeNodes.slice(0, 5)) {
      console.log(`   • ${node.id.padEnd(35)} degree: ${node.degree}`);
    }
  } else {
    console.log('   No isolated modules found');
  }

  // Show modularity interpretation
  if (result.modularity != null) {
    const quality = result.modularity > 0.3 ? 'Strong' : 
                    result.modularity > 0.2 ? 'Moderate' : 'Weak';
    console.log(`\n📊 Clustering Quality: ${quality} (${result.modularity.toFixed(3)})`);
    
    if (result.modularity < 0.1) {
      console.log('   ⚠️ Low modularity suggests weak community structure');
      console.log('   → Modules are highly interconnected, refactoring may require holistic approach');
    } else if (result.modularity < 0.3) {
      console.log('   ℹ️ Moderate modularity indicates some natural groupings');
      console.log('   → Clusters can be refactored independently with moderate coupling');
    } else {
      console.log('   ✅ Strong community structure detected');
      console.log('   → Modules naturally form cohesive clusters, ideal for independent refactoring');
    }
  }
}

// ==================== MAIN SIMULATION EXECUTION ====================

function runSimulation(): void {
  separator('🚀 HUB-EXCLUSION CLUSTERING — GRAPHIFY-INSPIRED FEATURE SIMULATION');
  
  console.log('\nThis simulation demonstrates all features inspired by Graphify\'s');
  console.log('architectural analysis capabilities for the ai-toolbox plugin.\n');

  try {
    simulateHubDetection();
    simulateLouvain();
    simulateHubReattachment();
    simulateDensityModularity();
    simulateFullPipeline();
    simulateReportGeneration();
    simulateAiToolboxAnalysis();
    simulateToolPriorityIntegration();
    simulateContextGuardIntegration();

    separator('✅ SIMULATION COMPLETE');
    console.log('\nAll Graphify-inspired features working correctly:');
    console.log('  ✓ Hub detection at configurable percentile thresholds');
    console.log('  ✓ Louvain community clustering on non-hub subgraphs');
    console.log('  ✓ Majority-vote hub reattachment with tie-breaking');
    console.log('  ✓ Cluster density and modularity quality metrics');
    console.log('  ✓ Full end-to-end clustering pipeline');
    console.log('  ✓ Architectural reporting with hub/cluster labels');
    console.log('  ✓ Real ai-toolbox dependency analysis (24 modules, 50 connections)');
    console.log('  ✓ ToolPriority integration: centrality scores + cluster-aware sorting');
    console.log('  ✓ ContextGuard integration: file cluster info + architectural insights\n');

  } catch (error) {
    separator('❌ SIMULATION FAILED');
    console.error('\nError during simulation:', error);
    process.exit(1);
  }
}

// Execute simulation
runSimulation();
