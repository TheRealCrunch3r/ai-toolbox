# graphify → ai_toolbox Integration Analysis

**Date**: 2026-08-10  
**Source Repository**: https://github.com/Graphify-Labs/graphify (v8, 105k stars)  
**Target Project**: C:\Source Code\LM Studio Plugins\ai_toolbox  

---

## Executive Summary

graphify is a knowledge graph builder that turns codebases into queryable graphs using tree-sitter AST parsing + LLM semantic extraction. While fundamentally different from ai_toolbox (which is an LM Studio AI assistant tool plugin), several architectural patterns from graphify can improve ai_toolbox's:

- **Result reliability** (confidence-tagged outputs)
- **Context management** (tiered replacement, incremental caching)
- **Tool analysis** (hub-exclusion clustering)
- **Memory integrity** (ID remapping, alias resolution)

---

## 1. Confidence-Tagged Results (Medium Priority)

### What
Add `confidence` field to tool execution outputs to indicate result reliability.

### Where in ai_toolbox
- `src/toolsProvider.ts` — Tool registry return types
- `src/tools/contextManagementTools.ts` — Context save/query operations
- `src/tools/vectorRagTools.ts` — RAG query results

### Benefit
Users can filter/rank results by reliability; prevents over-trusting LLM-derived insights.

### Complexity
**Low** — Add Zod schema + propagate through return types.

### Implementation Pattern
```typescript
type Confidence = "EXTRACTED" | "INFERRED" | "AMBIGUOUS";

interface ToolResult {
  data: unknown;
  confidence: Confidence;
  provenance?: string; // e.g., "file:src/utils.ts L42" or "rag_query_vector"
}

// Examples:
// - grep_files → EXTRACTED (direct source match)
// - rag_query_vector → INFERRED (semantic relevance)
// - analyze_project with ambiguous edges → AMBIGUOUS
```

---

## 2. Tiered Context Replacement (High Priority)

### What
Replace only the changed tier during context updates — prevents data loss on incremental saves.

### Where in ai_toolbox
- `src/stateManager.ts` — Context save logic
- `src/tools/contextManagementTools.ts` — addEntry, truncateCache operations
- `src/contextGuard.ts` — Context boundary enforcement

### Benefit
Preserves semantic layer when only file content changes; aligns with v1.9.4 fixes (write/read asymmetry).

### Complexity
**Medium** — Refactor save logic to track `_origin` per node.

### Implementation Pattern
```typescript
interface ContextNode {
  id: string;
  _origin: "ast" | "semantic"; // File content vs derived insight
  label?: string;
  source_file?: string;
  data?: unknown;
}

// Tier-scoped replacement logic (mimics graphify's build_merge):
function replaceTier(oldNodes: ContextNode[], newNodes: ContextNode[]): ContextNode[] {
  const oldAst = oldNodes.filter(n => n._origin === "ast");
  const oldSem = oldNodes.filter(n => n._origin === "semantic");
  
  const newAst = newNodes.filter(n => n._origin === "ast");
  const newSem = newNodes.filter(n => n._origin === "semantic");
  
  // Replace only the tier that changed, keep rest intact
  return [
    ...oldAst.filter(a => !newAst.some(n => n.id === a.id)), // Old AST not replaced
    ...newAst, // New AST
    ...oldSem.filter(s => !newSem.some(n => n.id === s.id)), // Old Sem not replaced
    ...newSem // New Sem
  ];
}
```

---

## 3. Hub-Exclusion Clustering (Medium Priority)

### What
Exclude high-frequency tools from call-pattern clustering to reveal true architectural boundaries.

### Where in ai_toolbox
- `src/contextGuard.ts` — Context analysis logic
- `src/tools/toolPriority.ts` — Tool priority ranking
- `src/analyze_project.ts` — Project-wide analysis

### Benefit
Filters out utility noise (e.g., `fileSystemTools`, `backupTools`) to reveal real architectural boundaries.

### Complexity
**Low-Medium** — Add degree filter before community detection.

### Implementation Pattern
```typescript
// Identify hub tools (degree > 80th percentile)
function getHubThreshold(degrees: Map<string, number>): number {
  const values = Array.from(degrees.values()).sort((a, b) => a - b);
  const idx = Math.floor(values.length * 0.8);
  return values[idx] || 0;
}

// Exclude hubs from clustering
function clusterWithoutHubs(nodes: string[], degrees: Map<string, number>): Cluster[] {
  const threshold = getHubThreshold(degrees);
  const nonHubNodes = nodes.filter(n => degrees.get(n) <= threshold);
  
  // Run community detection on nonHubNodes only
  return runCommunityDetection(nonHubNodes);
}

// Reattach hubs by majority-vote neighbor community (mimics graphify's approach)
function reattachHubs(hubNodes: string[], nodeCommunity: Map<string, number>): void {
  for (const hub of hubNodes) {
    const neighbors = getNeighbors(hub);
    const votes = countNeighborCommunities(neighbors, nodeCommunity);
    const bestCommunity = maxBy(votes, v => v.count);
    nodeCommunity.set(hub, bestCommunity.cid);
  }
}
```

---

## 4. Alias/ID Remapping System (Low Priority - Already Partially Done)

### What
Extend v1.9.4 ID remapping to handle cross-project memory drift and prevent ghost nodes.

### Where in ai_toolbox
- `src/tools/contextManagementTools.ts` — addEntry, duplicate prevention
- `src/stateManager.ts` — Memory persistence layer
- `.ai_toolbox_memory.msgpack` — Persistent storage format

### Benefit
Prevents ghost nodes when same entity exists across projects; handles legacy ID drift gracefully.

### Complexity
**Low** — Extend existing `_semantic_id_remap` logic from v1.9.4 fixes.

### Implementation Pattern
```typescript
// Already implemented in v1.9.4 for session summaries:
function remapLegacyId(oldId: string, sourceFile: string): string {
  // Derive canonical ID from source_file + label, not from cached fragment
  const relPath = Path(sourceFile).relativeTo(projectRoot);
  const stem = makeId(_fileStem(relPath));
  return `${stem}_${entitySuffix}`;
}

// Extend to handle:
// - Cross-project memory contamination (already fixed for session summaries)
// - Future: tool execution results with drifted IDs
// - Incremental cache entries with stale hashes
```

---

## 5. Incremental Cache Layer (Medium Priority)

### What
File-hash based caching for expensive operations to avoid re-extracting unchanged files during context updates.

### Where in ai_toolbox
- `src/performanceUtils.ts` — Performance monitoring
- `src/tools/vectorRagTools.ts` — RAG indexing
- `src/tools/contextManagementTools.ts` — Context save operations

### Benefit
Avoids redundant processing; speeds up incremental saves for large repos.

### Complexity
**Medium** — Add hash computation + cache lookup before processing.

### Implementation Pattern
```typescript
interface CacheEntry {
  fileHash: string; // SHA-256 of file content
  result: ToolResult;
  timestamp: number;
  ttl?: number; // Optional TTL in ms (e.g., 24h = 86400000)
}

class IncrementalCache {
  private cache: Map<string, CacheEntry> = new Map();
  
  async get(filePath: string): Promise<ToolResult | null> {
    const hash = await computeFileHash(filePath);
    const entry = this.cache.get(hash);
    
    if (entry && (!entry.ttl || Date.now() - entry.timestamp < entry.ttl)) {
      return entry.result;
    }
    return null; // Cache miss — process fresh
  }
  
  async set(filePath: string, result: ToolResult): Promise<void> {
    const hash = await computeFileHash(filePath);
    this.cache.set(hash, {
      fileHash: hash,
      result,
      timestamp: Date.now(),
      ttl: 24 * 60 * 60 * 1000 // Default 24h TTL
    });
    
    // Enforce cache size limit (e.g., 1000 entries)
    if (this.cache.size > MAX_CACHE_SIZE) {
      this.evictOldest();
    }
  }
}

// Usage in context save:
async function saveContextWithContextCache(filePath: string): Promise<ToolResult> {
  const cached = await cache.get(filePath);
  if (cached) return cached; // Skip extraction
  
  const result = await extractFileContent(filePath);
  await cache.set(filePath, result);
  return result;
}
```

---

## 6. Surprise Detection / Gap Analysis (Low Priority)

### What
Identify unexpected connections or missing edges in context graph to surface architectural risks.

### Where in ai_toolbox
- `src/contextGuard.ts` — Context boundary enforcement
- `src/analyze_project.ts` — Project-wide analysis
- `src/tools/contextManagementTools.ts` — Context insight generation

### Benefit
Surfaces undocumented dependencies, cross-module coupling risks, and isolated components.

### Complexity
**Medium-High** — Requires full graph traversal + composite scoring.

### Implementation Pattern
```typescript
interface SurpriseEdge {
  source: string;
  target: string;
  score: number; // Composite: confidence + cross-community + peripheral→hub
  why: string;   // e.g., "INFERRED connection bridging auth and database"
}

function detectSurpriseEdges(graph: Graph): SurpriseEdge[] {
  const edges = graph.edges();
  const surprises: SurpriseEdge[] = [];
  
  for (const edge of edges) {
    let score = 0;
    const reasons: string[] = [];
    
    // 1. Confidence bonus (AMBIGUOUS > INFERRED > EXTRACTED)
    if (edge.confidence === "AMBIGUOUS") {
      score += 3;
      reasons.push("uncertain relationship");
    } else if (edge.confidence === "INFERRED") {
      score += 2;
      reasons.push("derived connection");
    }
    
    // 2. Cross-module boundary bonus
    const sourceModule = getModule(edge.source);
    const targetModule = getModule(edge.target);
    if (sourceModule !== targetModule) {
      score += 2;
      reasons.push(`crosses module boundary (${sourceModule} → ${targetModule})`);
    }
    
    // 3. Peripheral→hub bonus
    const sourceDegree = graph.degree(edge.source);
    const targetDegree = graph.degree(edge.target);
    if (Math.min(sourceDegree, targetDegree) < 2 && Math.max(sourceDegree, targetDegree) > 10) {
      score += 1;
      reasons.push("low-degree node connects to high-degree hub");
    }
    
    if (score >= 3) { // Threshold for reporting
      surprises.push({
        source: edge.source.label,
        target: edge.target.label,
        score,
        why: reasons.join("; ")
      });
    }
  }
  
  return surprises.sort((a, b) => b.score - a.score);
}

// Usage in analyze_project:
function runAnalysis(): AnalysisReport {
  const graph = buildContextGraph();
  const surprises = detectSurpriseEdges(graph);
  
  if (surprises.length > 0) {
    console.warn("Architectural risks detected:", surprises);
  }
  
  return { surprises, ...otherMetrics };
}
```

---

## Recommended Implementation Order

| Priority | Integration | Benefit | Risk | Effort |
|----------|-------------|---------|------|--------|
| **1 (High)** | Tiered Context Replacement | Prevents data loss on incremental saves | Low | Medium |
| **2 (Medium)** | Confidence-Tagged Results | Improves user trust in results | Low | Low |
| **3 (Medium)** | Hub-Exclusion Clustering | Better tool priority analysis | Low-Medium | Low |
| **4 (Medium)** | Incremental Cache Layer | Performance optimization for large repos | Medium | Medium |
| **5 (Low)** | Alias/ID Remapping Extension | Already partially done in v1.9.4 | Low | Low |
| **6 (Low)** | Surprise Detection / Gap Analysis | Nice-to-have architectural insights | Medium-High | High |

---

## Trade-offs & Caveats

| Integration | Trade-off | Mitigation |
|-------------|-----------|------------|
| Confidence tags | Slightly larger payloads | Only add to complex operations; omit for simple file reads |
| Tiered replacement | More complex save logic | Add unit tests for each tier combination; monitor data loss incidents |
| Hub exclusion | May miss important utility patterns | Configurable threshold (e.g., 70th, 80th, 90th percentile); allow user override |
| Cache layer | Memory/disk overhead | Size limit + TTL expiration (e.g., 24h); LRU eviction policy |
| Alias remapping | Migration complexity | Backward-compatible; handle legacy IDs gracefully with fallback logic |
| Surprise detection | False positives on small repos | Minimum node/edge thresholds before reporting; configurable sensitivity |

---

## Verification Steps

### For Each Integration:

1. **Unit Tests**
   - Create test cases covering happy path + edge cases
   - Verify backward compatibility with existing behavior

2. **Integration Tests**
   - Test with real ai_toolbox codebase (C:\Source Code\LM Studio Plugins\ai_toolbox)
   - Measure performance impact (CPU, memory, latency)

3. **Regression Tests**
   - Run existing test suite: `npm test`
   - Verify no data loss on incremental saves/updates

4. **Monitoring Metrics**
   - Track cache hit rates (for cache layer integration)
   - Monitor confidence tag distribution (for confidence tagging)
   - Measure hub exclusion impact on clustering quality

---

## References

- **graphify Repository**: https://github.com/Graphify-Labs/graphify (v8 branch)
- **Key Modules Analyzed**:
  - `extract.py` — Deterministic AST extraction + cross-file resolution
  - `build.py` — Graph construction with tier provenance + ghost dedup
  - `cluster.py` — Leiden community detection with hub exclusion
  - `analyze.py` — God nodes, surprise connections, import cycles
- **ai_toolbox Current State**: v1.9.4 (session memory fixes, Zod caps, ESLint crypto import)

---

*Generated: 2026-08-10 | Analysis session with graphify source code review*
