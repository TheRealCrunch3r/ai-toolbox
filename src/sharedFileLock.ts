/**
 * In-process serialization for writers that share ONE storage file path (20.09).
 *
 * THE HAZARD THIS MODULE GUARDS: the per-project state store (<wd>/.session_context/.<name>_memory.msgpack) is
 * written by two INDEPENDENT managers — StateManager.saveMemoryFile() and ContextStorageManager.save(). Each runs
 * read-snapshot → merge-foreign → writeTemp(unique name) → rename, then verifies ONLY ITS OWN records after the
 * rename. Run concurrently in one process, a writer whose snapshot predates the OTHER's rename commits stale content
 * — last renamer wins, the earlier record vanishes from disk (lost update). Neither post-rename self-check can detect
 * this: the missing record belongs to the other layer, so it is absent from the final file BY CONSTRUCTION. The bounded
 * clobber-retry loops (see "D-RACE" comments in both save paths) catch only the mirror order ("the other writer renamed
 * AFTER us"). The undetectable stale-snapshot last-writer case was pinned by tests/csmSharedFileRegression.test.ts
 * Suite D: final file = [ctx entry, seed] with the mid-flight SM record gone.
 *
 * THE FIX: serialize each save's snap→rename critical section PER RESOLVED FILE PATH within this process. A writer that
 * commits while holding the lock is necessarily seen by every later snapshot ⇒ cross-writer union is guaranteed for
 * in-process writers. The existing clobber-retry loops remain as the second line of defense for CROSS-PROCESS contention
 * (another host instance on the same store), where no in-memory coordination can reach — untouched here (minimal scope).
 *
 * Single-purpose module by design: imported from BOTH stateManager.ts and tools/contextManagementTools.ts, which do not
 * otherwise import each other's implementation modules. A shared helper cannot live inside either file without creating
 * that coupling; a third leaf module is the project-idiomatic shape (cf. dataDir.ts, contextTiers.ts). No imports of its
 * own ⇒ no circular-dependency surface.
 */

const lockChains = new Map<string, Promise<void>>();

/**
 * Run `criticalSection` exclusively with respect to every other caller using the same `filePath`.
 * Callers queue FIFO per path; a throwing section never wedges the chain (the tail is always released in finally), and
 * its error propagates to this caller only — all writers here are best-effort by contract. The map entry for an idle
 * path is dropped after its last holder releases, so memory does not grow with the number of distinct store paths.
 */
export function withSharedFileLock<T>(filePath: string, criticalSection: () => Promise<T>): Promise<T> {
  const key = filePath; // both writers pass an absolute resolved path ⇒ identical strings ⇒ one queue per shared file
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve; // the executor runs synchronously — assigned before any await below
  });
  const previous = lockChains.get(key);
  lockChains.set(key, gate); // this holder's tail — the next waiter joins here
  return (previous ?? Promise.resolve()).then(() => criticalSection()).finally(() => {
    if (release !== undefined) release();
    // GC: drop the chain entry only when we are still its tail — a later waiter may have already extended it.
    if (lockChains.get(key) === gate) lockChains.delete(key);
  });
}
