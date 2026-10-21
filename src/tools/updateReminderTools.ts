/**
 * 📦 UPDATE-CHECK PHASE 2 (19.10, owner GO): the dismiss-reminder tool — closes Phase 1's open loop where a
 * newer-release notification could NOT be dismissed by the user (dismissVersion/hasBeenDismissed existed in state
 * + tests with zero production callers). One additive LLM tool: records "not now" for the given version →
 * <dataDir>/update-check.json dismissed[] → getUpdateStatus() is quiet for THAT version forever; strictly-newer
 * releases still notify. Gated by the SAME updateCheckEnabled toggle as the check itself (strict ===true, so
 * harness stubs returning undefined skip deterministically — house convention). No new config key, no network,
 * non-fatal by house rule: it only touches the plugin data dir. Sibling pattern: tool() builder + zod params.
 */

import type { Tool } from '@lmstudio/sdk';
import { tool } from '@lmstudio/sdk';
import { z } from 'zod';

import { dismissVersion, getUpdateStatus, LOCAL_VERSION } from '../updateChecker.js';

/** Typed params interface (sibling convention, e.g. markdownPreviewTools.ts). */
interface DismissReminderParams {
  version: string;
}

export function registerUpdateReminderTools(config: { updateCheckEnabled?: unknown }): Tool[] {
  if (config.updateCheckEnabled !== true) return []; // strict gate — mirrors the Phase-1 provider IIFE exactly
  const tools: Tool[] = [];
  tools.push(tool({
    name: 'dismiss_update_reminder',
    description: "Record \"not now\" for an AI Toolbox update reminder version so it stops re-notifying on every turn. Quiet per version forever; strictly-newer releases still notify.",
    parameters: {
      version: z.string().describe("Version to dismiss — the one shown in the 'AI Toolbox vX.Y.Z is available' notification (e.g. '1.9.22')."),
    },
    implementation: async ({ version }: DismissReminderParams) => {
      const v = typeof version === 'string' ? version.trim() : '';
      if (!v) return { success: false, error: "Missing or invalid `version` — pass the version from the notification (e.g. '1.9.22')." };
      try {
        dismissVersion(v); // state-only write into <dataDir>/update-check.json; non-fatal by construction of updateChecker.ts
        return { success: true, dismissed: v, note: `Update reminders for ${v} are off. Newer releases will still notify.` };
      } catch (err) {
        return { success: false, error: `Dismissal failed (non-fatal): ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  }));
  // REPO-LINK B1 (19.10, owner GO): read-only update-status surface for the LLM — answers "is there an update?" and hands
  // back the release page URL so the model can render it as a CLICKABLE Markdown link in chat. Option A puts the same URL
  // into the desktop toast as plain text; the SDK's BackendNotification has no url/action field (verified against installed
  // d.ts + upstream main), so chat is the only plugin-side surface where a working link exists. Same strict gate and same
  // non-fatal house rules as dismiss_update_reminder above; zero NEW state writes — getUpdateStatus() carries its own
  // ≤1-fetch/day TTL stamp (user-initiated read, quiet on fresh cache).
  tools.push(tool({
    name: 'get_update_info',
    description: "Read the current AI Toolbox update status WITHOUT changing anything: installed version, whether a strictly-newer plugin version is published on the LM Studio hub (24h-cached check against the published .VERSION file), and its marketplace page URL when available. Use to answer 'is there an update?' — render `releaseUrl` as a clickable link for the user.",
    parameters: {},
    implementation: async (): Promise<Record<string, unknown>> => {
      try {
        const status = await getUpdateStatus(); // TTL-cached; null when quiet (no newer / dismissed / no data yet) — never throws by construction
        if (!status) {
          return {
            success: true,
            installedVersion: LOCAL_VERSION,
            updateAvailable: false,
            note: 'No strictly-newer release is currently known — either none exists, it was dismissed for its version, or the 24h-cached check has no data yet.',
          };
        }
        return {
          success: true,
          installedVersion: LOCAL_VERSION,
          updateAvailable: true,
          latestVersion: status.version,
          ...(status.url ? { releaseUrl: status.url } : {}),
          note: `Newer release v${status.version} is available (installed ${LOCAL_VERSION}). Render releaseUrl as a link for the user; updates happen in LM Studio settings → extensions.`,
        };
      } catch (err) {
        // Defensive envelope by house rule — getUpdateStatus degrades internally, this makes "never throw into the turn" absolute.
        return { success: false, error: `Update status read failed (non-fatal): ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  }));
  return tools;
}
