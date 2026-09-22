/**
 * 🔹 REPO-STORE GUARD (20.09 PM, jest-only): NO test may ever write into this repo's own LIVE store at
 * <repoRoot>/.session_context/ — the 19:20–19:24 incident proved one unpinned manager in a single suite can
 * clobber the plugin's real memory file (utilityTools.test.ts did exactly that). Under JEST_WORKER_ID we throw
 * on any fs/promises write/rename/mkdir/unlink/rm/appendFile targeting that directory tree. READS stay allowed
 * (legitimate read-fallback paths exist and are pinned by other suites).
 *
 * WIRING: listed in jest.config.cjs `setupFiles` — runs BEFORE a test file's imports, so the
 * Module.prototype.require hook below can replace every NON-mocked 'fs/promises' resolution for that file's
 * registry with one shared live PROXY over the real core exports (dynamic property lookup). The proxy defeats
 * ts-jest __importStar namespace-copying: whatever object shape a transformed `import * as fs from 'fs/promises'`
 * produces, write calls route through this guard at call time. Mock-safe by construction: resolutions that do
 * NOT return the real core exports (i.e., jest.mock('fs/promises') factories) pass through untouched — see the
 * identity check in guardedRequire below.
 */
import * as path from 'path';

if (process.env.JEST_WORKER_ID) {
  const REPO_ROOT = path.resolve(__dirname, '..');
  const PROTECTED_PREFIXES: string[] = [path.join(REPO_ROOT, '.session_context')];

  const isProtected = (p: unknown): boolean => {
    if (typeof p !== 'string') return false;
    let resolved: string;
    try { resolved = path.resolve(p); } catch { return false; }
    for (const prefix of PROTECTED_PREFIXES) {
      if (resolved === prefix || resolved.startsWith(prefix + path.sep)) return true;
    }
    return false;
  };

  // The only fs/promises methods that can mutate the protected tree. Path arg positions: index 0, plus both args for rename().
  const GUARDED = new Set(['writeFile', 'rename', 'mkdir', 'unlink', 'rm', 'appendFile']);

  // Real core exports captured ONCE in this setup context — plain CJS require returns the actual module object.
  /* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
  const realFsPromises = require('fs/promises') as Record<string | symbol, unknown>;

  const guardedFs: unknown = new Proxy(realFsPromises, {
    get(target: object, prop: string | symbol) {
      if (typeof prop === 'string' && GUARDED.has(prop)) {
        const orig = Reflect.get(target, prop);
        if (typeof orig !== 'function') return orig;
        return function guardedCall(...args: unknown[]): Promise<unknown> {
          for (let i = 0; i < args.length && i <= 1; i++) {
            if (isProtected(args[i])) {
              throw new Error(
                `JEST REPO-STORE GUARD: ${prop}() targets protected live-store path '${String(args[i])}' under jest. ` +
                'Pin the manager to an os.tmpdir() working dir (setWorkingDir BEFORE construction) or disable persistence for suites that do not assert disk state.'
              );
            }
          }
          return orig.apply(target, args);
        };
      }
      return Reflect.get(target, prop);
    },
  });

  const ModuleCtor = require('module') as { prototype: { require: (id: string) => unknown } };
  const originalRequire = ModuleCtor.prototype.require;

  ModuleCtor.prototype.require = function guardedRequire(id: string): unknown {
    if (typeof id === 'string' && /^(fs\/promises|node:fs\/promises)$/.test(id)) {
      try {
        // Mock-safety gate: only wrap resolutions that return the REAL core exports object. jest.mock()
        // factories resolve to different objects → identity check fails → they pass through untouched.
        const resolved = originalRequire.call(this, id);
        if (resolved === realFsPromises) return guardedFs;
        return resolved;
      } catch { return originalRequire.call(this, id); } // a broken guard must never fail module loading
    }
    return originalRequire.call(this, id);
  };

  void guardedFs; // referenced by the closure above; silences unused-var lints in some configs
}
