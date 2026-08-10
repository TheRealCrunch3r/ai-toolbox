/**
 * Hub-Exclusion Clustering Algorithm
 * 
 * Identifies architectural hubs (high-degree modules) and clusters non-hub modules
 * using Louvain community detection. Hubs are then reattached via majority-vote
 * neighbor assignment.
 * 
 * Use Cases:
 * - Architectural transparency: visualize module dependency structure
 * - Refactoring guidance: identify which modules to refactor together
 * - ContextGuard optimization: compress related clusters efficiently
 * - Tool priority ranking: cluster centrality informs importance scoring
 * 
 * Algorithm:
 * 1. Build adjacency graph from source file imports
 * 2. Calculate node degrees (number of connections)
 * 3. Identify hub nodes at configurable percentile threshold (default: 80th)
 * 4. Run Louvain community detection on non-hub subgraph
 * 5. Reattach hubs by majority-vote neighbor assignment
 */

export type ModuleNode = {
  id: string;          // Unique module identifier (file path or name)
  label?: string;      // Human-readable label
  degree: number;      // Number of connections
};

export type Edge = {
  source: string;      // Source node ID
  target: string;      // Target node ID
  weight?: number;     // Connection strength (default: 1)
};

export type ClusterInfo = {
  clusterId: number;   // Cluster identifier (0-indexed)
  members: string[];   // Module IDs in this cluster
  size: number;        // Number of members
  density?: number;    // Internal edge density [0-1]
};

export type HubExclusionResult = {
  /** All modules with their degrees */
  nodes: ModuleNode[];
  /** All edges in the graph */
  edges: Edge[];
  /** Identified hub module IDs */
  hubs: string[];
  /** Non-hub modules */
  nonHubs: string[];
  /** Community clusters (non-hub only) */
  clusters: ClusterInfo[];
  /** Hub assignments to clusters via majority-vote */
  hubAssignments: Record<string, number>; // moduleId -> clusterId
  /** Hub threshold percentile used */
  hubThresholdPercentile: number;
  /** Overall modularity score (quality of clustering) */
  modularity?: number;
};

/**
 * Build an adjacency graph from source file imports.
 * 
 * Analyzes TypeScript/JavaScript files in the given directory and extracts
 * import relationships to build a directed graph, then converts it to
 * undirected for community detection.
 * 
 * @param sourceDirs - Array of source directories to analyze (relative to project root)
 * @returns Adjacency list representation of the dependency graph
 */
export function buildDependencyGraph(sourceDirs: string[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();

  for (const dir of sourceDirs) {
    // This is a static analysis stub — actual implementation would use
    // AST parsing or import statement regex matching on the source files.
    // For now, we return an empty graph and let callers populate it via
    // addEdge() if they have pre-computed dependency data.
    void dir; // Suppress unused variable warning
  }

  return adjacency;
}

/**
 * Add a directed edge to the adjacency list (for building the graph).
 */
export function addEdge(adjacency: Map<string, Set<string>>, source: string, target: string): void {
  if (!adjacency.has(source)) {
    adjacency.set(source, new Set());
  }
  if (!adjacency.has(target)) {
    adjacency.set(target, new Set());
  }
  const sourceSet = adjacency.get(source);
  if (sourceSet) sourceSet.add(target);
  const targetSet = adjacency.get(target);
  if (targetSet) targetSet.add(source); // Undirected for community detection
}

/**
 * Calculate node degrees from an adjacency list.
 */
export function calculateDegrees(adjacency: Map<string, Set<string>>): Map<string, number> {
  const degrees = new Map<string, number>();
  
  for (const [nodeId, neighbors] of adjacency.entries()) {
    degrees.set(nodeId, neighbors.size);
  }

  return degrees;
}

/**
 * Identify hub nodes based on degree percentile threshold.
 * 
 * Hubs are modules with unusually high connection counts — they act as
 * architectural glue but should not be clustered with regular modules.
 * 
 * @param degrees - Map of module ID to degree count
 * @param thresholdPercentile - Percentile for hub detection (default: 80)
 * @returns Set of hub node IDs
 */
export function identifyHubs(
  degrees: Map<string, number>,
  thresholdPercentile = 80
): Set<string> {
  if (degrees.size === 0) return new Set();

  const degreeValues = Array.from(degrees.values()).sort((a, b) => a - b);
  const thresholdIndex = Math.min(degreeValues.length - 1, Math.max(0, Math.floor(degreeValues.length * (thresholdPercentile / 100))));
  const thresholdValue = degreeValues[Math.min(thresholdIndex, degreeValues.length - 1)];

  const hubs = new Set<string>();
  for (const [nodeId, degree] of degrees.entries()) {
    // Strict greater-than prevents borderline tied-degree nodes from becoming hubs
    if (degree > thresholdValue && thresholdValue > 0) {
      hubs.add(nodeId);
    }
  }

  return hubs;
}

/**
 * Create a subgraph excluding hub nodes.
 */
export function createNonHubSubgraph(
  adjacency: Map<string, Set<string>>,
  hubs: Set<string>
): Map<string, Set<string>> {
  const nonHubAdjacency = new Map<string, Set<string>>();

  for (const [nodeId, neighbors] of adjacency.entries()) {
    if (!hubs.has(nodeId)) {
      // Only include edges to other non-hub nodes
      const filteredNeighbors = new Set<string>();
      for (const neighbor of neighbors) {
        if (!hubs.has(neighbor)) {
          filteredNeighbors.add(neighbor);
        }
      }
      nonHubAdjacency.set(nodeId, filteredNeighbors);
    }
  }

  return nonHubAdjacency;
}

/**
 * Louvain community detection algorithm (simplified implementation).
 * 
 * Uses greedy modularity optimization to identify clusters in the graph.
 * This is a single-pass approximation suitable for real-time analysis.
 * 
 * @param adjacency - Adjacency list of the non-hub subgraph
 * @returns Map from node ID to cluster ID
 */
export function louvainCommunityDetection(
  adjacency: Map<string, Set<string>>
): Map<string, number> {
  const community = new Map<string, number>();
  
  // Initialize: each node in its own community (sequential IDs for deterministic behavior)
  let nextCommId = 0;
  for (const nodeId of adjacency.keys()) {
    community.set(nodeId, nextCommId++);
  }

  // Greedy modularity optimization — move nodes to the community with most connections
  let improved = true;
  while (improved) {
    improved = false;

    const nodes = Array.from(adjacency.keys());
    
    for (const nodeId of nodes) {
      const currentCommunity = community.get(nodeId);
      if (currentCommunity === undefined) continue;
      
      const neighbors = adjacency.get(nodeId);
      if (!neighbors || neighbors.size === 0) continue;

      // Count connections to each neighbor community
      const commCounts = new Map<number, number>();
      for (const neighbor of neighbors) {
        const nComm = community.get(neighbor);
        if (nComm !== undefined) {
          commCounts.set(nComm, (commCounts.get(nComm) || 0) + 1);
        }
      }

      // Find the best community (most connections, excluding current; ties → lower ID)
      let bestCommunity = currentCommunity;
      let bestCount = -1;

      for (const [commId, count] of commCounts.entries()) {
        if (commId === currentCommunity) continue;
        if (count > bestCount || (count === bestCount && commId < bestCommunity)) {
          bestCommunity = commId;
          bestCount = count;
        }
      }

      // Move node only if it gains more connections to the new community than its current one
      const currentConnections = commCounts.get(currentCommunity) || 0;
      if (bestCommunity !== currentCommunity && bestCount > currentConnections) {
        community.set(nodeId, bestCommunity);
        improved = true;
      }
    }
  }

  return community;
}

/**
 * Reattach hub nodes to clusters via majority-vote neighbor assignment.
 * 
 * Each hub is assigned to the cluster that contains the most of its neighbors.
 * Ties are broken by preferring lower cluster IDs (stability).
 * 
 * @param hubs - Set of hub node IDs
 * @param adjacency - Full graph adjacency list
 * @param nonHubCommunities - Map from non-hub node ID to community ID
 * @returns Map from hub node ID to assigned cluster ID
 */
export function reattachHubsByMajorityVote(
  hubs: Set<string>,
  adjacency: Map<string, Set<string>>,
  nonHubCommunities: Map<string, number>
): Record<string, number> {
  const hubAssignments: Record<string, number> = {};

  for (const hubId of hubs) {
    const neighbors = adjacency.get(hubId);
    if (!neighbors || neighbors.size === 0) { hubAssignments[hubId] = -1; continue; }

    // Count neighbor cluster memberships
    const clusterVotes = new Map<number, number>();
    
    for (const neighbor of neighbors) {
      if (!hubs.has(neighbor)) {
        const communityId = nonHubCommunities.get(neighbor);
        if (communityId !== undefined) {
          clusterVotes.set(communityId, (clusterVotes.get(communityId) || 0) + 1);
        }
      }
    }

    // Find the cluster with most votes
    let bestCluster = -1;
    let bestVoteCount = 0;

    for (const [clusterId, voteCount] of clusterVotes.entries()) {
      if (voteCount > bestVoteCount || (voteCount === bestVoteCount && clusterId < bestCluster)) {
        bestCluster = clusterId;
        bestVoteCount = voteCount;
      }
    }

    // If no neighbors in any cluster, assign to a new cluster or keep as unassigned
    if (bestCluster === -1) {
      hubAssignments[hubId] = -1; // Unassigned
    } else {
      hubAssignments[hubId] = bestCluster;
    }
  }

  return hubAssignments;
}

/**
 * Calculate cluster density (internal edge ratio).
 * 
 * Density = actual internal edges / maximum possible internal edges.
 */
export function calculateClusterDensity(
  members: string[],
  adjacency: Map<string, Set<string>>
): number {
  if (members.length <= 1) return 0;

  let internalEdges = 0;
  const memberSet = new Set(members);

  for (const node of members) {
    const neighbors = adjacency.get(node);
    if (!neighbors) continue;

    for (const neighbor of neighbors) {
      if (memberSet.has(neighbor)) {
        internalEdges++;
      }
    }
  }

  // Each edge counted twice, so divide by 2
  internalEdges /= 2;
  
  const maxPossibleEdges = members.length * (members.length - 1) / 2;
  return maxPossibleEdges > 0 ? internalEdges / maxPossibleEdges : 0;
}

/**
 * Calculate modularity score for the clustering.
 * 
 * Modularity measures how well the community structure separates nodes.
 * Higher values (0-1) indicate better clustering.
 */
export function calculateModularity(
  edges: Edge[],
  nodeDegrees: Map<string, number>,
  clusterAssignments: Map<string, number>
): number {
  const totalDegreeSum = Array.from(nodeDegrees.values()).reduce((sum, d) => sum + d, 0);
  if (totalDegreeSum === 0) return 0;

  let modularity = 0;

  for (const edge of edges) {
    const sourceCluster = clusterAssignments.get(edge.source);
    const targetCluster = clusterAssignments.get(edge.target);

    // Only count edges within the same community
    if (sourceCluster === targetCluster && sourceCluster !== undefined) {
      const m = totalDegreeSum;
      const dSource = nodeDegrees.get(edge.source) || 0;
      const dTarget = nodeDegrees.get(edge.target) || 0;

      modularity += 1 - (dSource * dTarget) / (m * m);
    }
  }

  // Normalize by total edges
  return edges.length > 0 ? modularity / edges.length : 0;
}

/**
 * Main function: Perform hub-exclusion clustering on a dependency graph.
 * 
 * @param adjacency - Adjacency list representing the module dependency graph
 * @param hubThresholdPercentile - Percentile for hub detection (default: 80)
 * @returns HubExclusionResult with all analysis data
 */
export function performHubExclusionClustering(
  adjacency: Map<string, Set<string>>,
  hubThresholdPercentile = 80
): HubExclusionResult {
  // Step 1: Calculate degrees for all nodes
  const degrees = calculateDegrees(adjacency);

  // Step 2: Identify hubs
  const hubs = identifyHubs(degrees, hubThresholdPercentile);
  const nonHubs = new Set<string>();
  for (const nodeId of adjacency.keys()) {
    if (!hubs.has(nodeId)) {
      nonHubs.add(nodeId);
    }
  }

  // Step 3: Create non-hub subgraph
  const nonHubAdjacency = createNonHubSubgraph(adjacency, hubs);

  // Step 4: Louvain community detection on non-hub nodes
  const nonHubCommunities = louvainCommunityDetection(nonHubAdjacency);

  // Step 5: Reattach hubs via majority-vote
  const hubAssignments = reattachHubsByMajorityVote(hubs, adjacency, nonHubCommunities);

  // Build clusters from community assignments
  const clusterMap = new Map<number, string[]>();
  for (const [nodeId, communityId] of nonHubCommunities.entries()) {
    if (!clusterMap.has(communityId)) {
      clusterMap.set(communityId, []);
    }
    const members = clusterMap.get(communityId);
    if (members) members.push(nodeId);
  }

  // Calculate cluster densities
  const clusters: ClusterInfo[] = [];
  let nextClusterId = 0;
  
  for (const [originalCommunityId, members] of clusterMap.entries()) {
    if (members.length === 0) continue;

    const density = calculateClusterDensity(members, adjacency);
    
    // Map original community ID to sequential cluster ID
    clusters.push({
      clusterId: nextClusterId,
      members,
      size: members.length,
      density
    });

    // Update hub assignments to use new cluster IDs
    for (const [hubId, assignedCommunity] of Object.entries(hubAssignments)) {
      if (assignedCommunity === originalCommunityId) {
        hubAssignments[hubId] = nextClusterId;
      } else if (assignedCommunity > originalCommunityId && clusters.length >= nextClusterId + 1) {
        // Shift up IDs that are higher than current cluster ID
        const currentClusterId = clusters.find(c => c.clusterId === assignedCommunity);
        if (!currentClusterId) continue;
      }
    }

    nextClusterId++;
  }

  // Rebuild hub assignments with corrected cluster IDs
  for (const [hubId, originalCluster] of Object.entries(hubAssignments)) {
    const matchingCluster = clusters.find(c => c.clusterId === originalCluster);
    if (!matchingCluster) {
      hubAssignments[hubId] = -1; // Unassigned
    }
  }

  // Build edges list from adjacency
  const edges: Edge[] = [];
  const seenEdges = new Set<string>();
  
  for (const [source, neighbors] of adjacency.entries()) {
    for (const target of neighbors) {
      const edgeKey = `${source}<->${target}`;
      if (!seenEdges.has(edgeKey)) {
        seenEdges.add(edgeKey);
        edges.push({ source, target });
      }
    }
  }

  // Build nodes list
  const nodes: ModuleNode[] = Array.from(adjacency.entries()).map(([id, neighbors]) => ({
    id,
    degree: neighbors.size,
    label: id.split('/').pop() || id
  })).sort((a, b) => b.degree - a.degree); // Sort by degree descending

  // Calculate modularity
  const clusterAssignments = new Map<string, number>();
  for (const [nodeId, communityId] of nonHubCommunities.entries()) {
    const matchingCluster = clusters.find(c => c.clusterId === communityId);
    if (matchingCluster) {
      clusterAssignments.set(nodeId, matchingCluster.clusterId);
    } else {
      clusterAssignments.set(nodeId, -1); // Unassigned hub
    }
  }

  const modularity = calculateModularity(edges, degrees, clusterAssignments);

  return {
    nodes,
    edges,
    hubs: Array.from(hubs),
    nonHubs: Array.from(nonHubs),
    clusters,
    hubAssignments,
    hubThresholdPercentile,
    modularity
  };
}

/**
 * Generate a human-readable report of the clustering analysis.
 */
export function generateClusteringReport(result: HubExclusionResult): string {
  let report = '\n🔗 Hub-Exclusion Clustering Report\n';
  report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  // Summary stats
  report += `Total modules: ${result.nodes.length}\n`;
  report += `Total connections: ${result.edges.length}\n`;
  report += `Hub threshold: ${result.hubThresholdPercentile}th percentile\n\n`;

  // Hub nodes — labeled as "Architectural Hubs" for clarity
  if (result.hubs.length > 0) {
    report += `🔶 ARCHITECTURAL HUBS (${result.hubs.length} modules):\n`;
    for (const hubId of result.hubs) {
      const node = result.nodes.find(n => n.id === hubId);
      if (node) {
        report += `  • ${node.label || hubId} (degree: ${node.degree})\n`;
      }
    }
    report += '\n';
  } else {
    report += `🔶 ARCHITECTURAL HUBS (0 modules):\n\n`;
  }

  // Clusters — labeled as "Module Clusters" for clarity
  if (result.clusters.length > 0) {
    report += `📦 MODULE CLUSTERS (${result.clusters.length} communities):\n`;
    for (const cluster of result.clusters) {
      const densityStr = cluster.density != null ? ` | density: ${cluster.density.toFixed(2)}` : '';
      report += `\n  Cluster ${cluster.clusterId} (${cluster.size} modules${densityStr})\n`;
      
      for (const member of cluster.members.slice(0, 10)) { // Limit display
        const node = result.nodes.find(n => n.id === member);
        if (node) {
          report += `    • ${node.label || member}\n`;
        }
      }
      
      if (cluster.members.length > 10) {
        report += `    ... and ${cluster.members.length - 10} more\n`;
      }
    }
  } else {
    report += `\n📦 MODULE CLUSTERS (0 communities):\n`;
  }

  // Cluster density summary
  const avgDensity = result.clusters.length > 0
    ? result.clusters.reduce((sum, c) => sum + (c.density || 0), 0) / result.clusters.length
    : 0;
  report += `\n📈 Average Cluster Density: ${avgDensity.toFixed(3)}\n`;

  // Hub assignments
  const assignedHubs = Object.entries(result.hubAssignments).filter(([_, clusterId]) => clusterId >= 0);
  if (assignedHubs.length > 0) {
    report += `\n🔗 HUB ASSIGNMENTS (${assignedHubs.length} hubs mapped):\n`;
    for (const [hubId, clusterId] of assignedHubs) {
      const node = result.nodes.find(n => n.id === hubId);
      if (node) {
        report += `  • ${node.label || hubId} → Cluster ${clusterId}\n`;
      }
    }
  }

  // Modularity score
  if (result.modularity != null) {
    const quality = result.modularity > 0.3 ? 'Strong' : result.modularity > 0.2 ? 'Moderate' : 'Weak';
    report += `\n📊 Modularity: ${result.modularity.toFixed(3)} (${quality} community structure)\n`;
  }

  return report;
}

/**
 * Analyze the ai-toolbox plugin's internal dependency graph using known source dirs.
 * 
 * This is a convenience function that pre-populates the adjacency list based on
 * the documented module structure from ARCHITECTURE.md.
 */
export function analyzeAiToolboxDependencies(): HubExclusionResult {
  // Pre-defined dependency graph based on ARCHITECTURE.md documentation
  const adjacency = new Map<string, Set<string>>();

  // Core modules and their dependencies (from architecture)
  const knownEdges: [string, string][] = [
    // index.ts imports
    ['index.ts', 'toolsProvider.ts'],
    ['index.ts', 'config.ts'],
    ['index.ts', 'promptPreprocessor.ts'],
    
    // toolsProvider.ts imports
    ['toolsProvider.ts', 'config.ts'],
    ['toolsProvider.ts', 'stateManager.ts'],
    ['toolsProvider.ts', 'backgroundCommands.ts'],
    
    // promptPreprocessor.ts imports
    ['promptPreprocessor.ts', 'config.ts'],
    ['promptPreprocessor.ts', 'contextGuard.ts'],
    ['promptPreprocessor.ts', 'autoTracker.ts'],
    
    // contextGuard.ts imports
    ['contextGuard.ts', 'tokenStatsManager.ts'],
    ['contextGuard.ts', 'performanceUtils.ts'],
    
    // shared utilities used by many tools
    ['security.ts', 'workingDir.ts'],
    
    // Tool modules sharing common dependencies
    ['tools/fileSystemTools.ts', 'security.ts'],
    ['tools/fileSystemTools.ts', 'workingDir.ts'],
    ['tools/webResearchTools.ts', 'security.ts'],
    ['tools/browserAutomationTools.ts', 'performanceUtils.ts'],
    ['tools/gitGithubTools.ts', 'security.ts'],
    ['tools/databaseTools.ts', 'security.ts'],
    ['tools/executionTools.ts', 'security.ts'],
    ['tools/vectorRagTools.ts', 'workingDir.ts'],
    ['tools/contextManagementTools.ts', 'stateManager.ts'],
    ['tools/contextManagementTools.ts', 'performanceUtils.ts'],
    
    // Recode tool internal dependencies
    ['tools/recodeTool/recodeEngine.ts', 'tools/recodeTool/recodeTypes.ts'],
    ['tools/recodeTool/rules/unusedImports.ts', 'tools/recodeTool/recodeEngine.ts'],
    ['tools/recodeTool/rules/deadCodeDetection.ts', 'tools/recodeTool/recodeEngine.ts'],
  ];

  // Build adjacency from known edges
  for (const [source, target] of knownEdges) {
    addEdge(adjacency, source, target);
  }

  return performHubExclusionClustering(adjacency);
}
