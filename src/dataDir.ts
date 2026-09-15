/**
 * Persistent plugin data directory (12.09 registry-move).
 *
 * LM Studio extension layout (observed + documented in vibe-lm README):
 *   <home>/.lmstudio/extensions/plugins/<owner>/<name>/  — plugin CODE; wiped on every `lms dev --install`
 *   <home>/.lmstudio/extensions/data/<owner>/<name>/     — per-plugin DATA area; survives reinstalls
 * The SDK does NOT expose the data dir (PluginContext has only with* hooks), so it is constructed from
 * homedir + manifest IDs, mirroring the proven vibe-lm pattern: env override ?? resolve(homedir(), …).
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/** Manifest identity of this plugin (src/manifest.json — keep in sync on rename/owner change). */
const PLUGIN_OWNER = 'crunch3r';
const PLUGIN_NAME = 'ai-toolbox';

let overrideDir: string | undefined;

/** Hermetic-test seam — mirrors the ProjectRegistryManager._sessionIndexPathOverride convention. */
export function setDataDirOverride(dir?: string): void {
  overrideDir = dir;
}

/**
 * Resolve the persistent plugin data directory and ensure it exists (best-effort mkdir).
 * Precedence: explicit env AI_TOOLBOX_DATA_DIR > test override > real LM Studio data dir.
 * Under jest without an explicit choice, falls back to a temp dir so tests NEVER read/write the
 * developer's actual home folder (same isolation intent as workingDir.ts isTestEnvironment guard).
 */
export function getDataDir(): string {
  const dir = process.env.AI_TOOLBOX_DATA_DIR ?? overrideDir
    ?? (process.env.JEST_WORKER_ID ? path.join(os.tmpdir(), 'ai_toolbox_test_data') : undefined)
    ?? path.join(os.homedir(), '.lmstudio', 'extensions', 'data', PLUGIN_OWNER, PLUGIN_NAME);

  try {
    // Sync: called from sync code paths (listRegisteredProjects). Failure is non-fatal — callers
    // tolerate a missing dir (fs.access checks follow), the next async writer creates it properly.
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch { /* non-fatal — best-effort ensure */ }

  return dir;
}
