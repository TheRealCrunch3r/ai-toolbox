/**
 * Jest global teardown — lets fire-and-forget async operations complete cleanly
 * before Jest exits, eliminating "Force exiting Jest" warnings.
 */
module.exports = async (globalConfig) => {
  // Give pending saveToFile() / flushActionsToMemory() promises time to resolve
  await new Promise((resolve) => setTimeout(resolve, 200));

  // ── Test-residue sweep (v1.9.11 housekeeping; rev-23 · 🔹 PLAN-SEAM 06.10: the plans-file leg is gone —
  // PlanStorageManager no longer mirrors saves into src/ or dist/, so a crashed suite can no longer leave plan residue) ──
  const fs = require('fs');
  const path = require('path');
  const rootDir = globalConfig.rootDir;

  if (process.env.NODE_ENV === 'test') {
    // Working-dir state file: resetWorkingDir() leaves it as {} after every run.
    // Remove only the exact empty-state remnant — never a populated one (dev data).
    const stateFile = path.join(rootDir, '.ai_toolbox_state.json');
    try {
      if (fs.existsSync(stateFile) && fs.readFileSync(stateFile, 'utf-8').trim() === '{}') {
        fs.rmSync(stateFile);
      }
    } catch { /* ignore */ }
  }
};
