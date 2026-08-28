/**
 * Jest global teardown — lets fire-and-forget async operations complete cleanly
 * before Jest exits, eliminating "Force exiting Jest" warnings.
 */
module.exports = async (globalConfig) => {
  // Give pending saveToFile() / flushActionsToMemory() promises time to resolve
  await new Promise((resolve) => setTimeout(resolve, 200));

  // ── Test-residue sweep (v1.9.11 housekeeping; rev-23) ──────────────────────────────
  // PlanStorageManager.save() syncs every plan to <pluginRoot>/.session_context/ — in jest
  // that resolves to <root>/src/.session_context/. If a suite crashes or bails before its
  // own afterAll, the residue survives. Final-mile cleanup here (runs once per jest
  // invocation, single worker by config → no cross-suite race).
  const fs = require('fs');
  const path = require('path');
  const rootDir = globalConfig.rootDir;

  if (process.env.NODE_ENV === 'test') {
    for (const dir of ['src', 'dist']) {
      const plansFile = path.join(rootDir, dir, '.session_context', '.ai_toolbox_plans.json');
      let removed = false;
      try {
        if (fs.existsSync(plansFile)) { fs.rmSync(plansFile); removed = true; }
      } catch { /* ignore — never fail teardown */ }

      // Safety invariant: only rmdir when EMPTY. A non-empty .session_context may hold
      // live dev-session data (memory msgpack / sessions.json) — NEVER delete it.
      // NOT gated on `removed`: an in-flight async plan sync can land after the suite's
      // synchronous afterAll cleanup, so retry the empty-check here (after the grace delay).
      try { fs.rmdirSync(path.join(rootDir, dir, '.session_context')); } catch { /* not empty — leave */ }

      // Working-dir state file: resetWorkingDir() leaves it as {} after every run.
      // Remove only the exact empty-state remnant — never a populated one (dev data).
      const stateFile = path.join(rootDir, '.ai_toolbox_state.json');
      try {
        if (fs.existsSync(stateFile) && fs.readFileSync(stateFile, 'utf-8').trim() === '{}') {
          fs.rmSync(stateFile);
        }
      } catch { /* ignore */ }
    }
  }
};
