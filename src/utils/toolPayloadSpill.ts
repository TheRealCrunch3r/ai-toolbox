/**
 * toolPayloadSpill — Immediate inline spill of oversized tool results
 * Reuses compaction locator format and storage backend.
 */

import { COMPACTED_STORE_REL, DEFAULT_MAX_BYTES_PER_RESULT, buildCompactedContent } from './toolPayloadCompaction.js';
import { storePrunedPayload } from './toolPayloadStorage.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getWorkingDir } from '../workingDir.js';
import crypto from 'node:crypto';

export const SPILL_MAX_BYTES_DEFAULT = DEFAULT_MAX_BYTES_PER_RESULT;
export const SPILL_STORE_REL = COMPACTED_STORE_REL;

/** Check if a string value is oversized */
export function isOversizedText(text: string, maxBytes: number): boolean {
  return Buffer.byteLength(text, 'utf8') > maxBytes;
}

/** Spill a single oversized text payload immediately.
 * Stores full payload on disk and returns compacted preview + locator.
 * Returns the original text if not oversized or already spilled.
 */
export async function spillTextIfNeeded(text: string, maxBytes = SPILL_MAX_BYTES_DEFAULT): Promise<string> {
  if (!isOversizedText(text, maxBytes)) return text;
  // Idempotency guard
  if (text.startsWith('[ai_toolbox compaction]')) return text;

  const hash = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  const digestHex = hash;
  // Ensure store dir exists
  try { fs.mkdirSync(path.join(getWorkingDir(), SPILL_STORE_REL), { recursive: true }); } catch {}
  await storePrunedPayload(getWorkingDir(), { digestHex, text });

  return buildCompactedContent(text, digestHex, maxBytes);
}
