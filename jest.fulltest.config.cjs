/**
 * TEMPORARY config for in-process full-suite regression runs only (deleted after use).
 * Same as jest.config.cjs but strips:
 *  - globalTeardown / detectOpenHandles → hang under programmatic in-process execution
 *  - forceExit → process.exit() kills the sandbox before results can be written to file
 * and silences console output.
 */
const base = require('./jest.config.cjs');

// eslint-disable-next-line no-unused-vars
const { globalTeardown, detectOpenHandles, forceExit, ...rest } = base;

// 🔹 FIX #17 (19.08.2026): pin the reporter explicitly. Without a `reporters` key,
// @jest/core@30 TestScheduler falls back to [detectAgent() ? 'agent' : 'default'] —
// in this sandbox detectAgent() is false -> DefaultReporter, whose constructor binds
// process.stdout/stderr.write AFTER run_ctxsearch.cjs has installed its NUL spies.
// Status.get() then reads process.stdout.columns of the spied WriteStream (undefined/0)
// and can throw inside reporter hooks; BaseReporter._setError converts that into
// success:false even though every test passed (RC#2, verified against the bundled
// @jest/core@30.4.2 source). Pinning 'default' bypasses detectAgent() entirely —
// the alias resolves via the named-export switch in _setupReporters -> DefaultReporter
// (@jest/reporters; its package face has no .default export) — and keeps runs deterministic.
module.exports = { ...rest, silent: true, reporters: [['default', {}]] };
