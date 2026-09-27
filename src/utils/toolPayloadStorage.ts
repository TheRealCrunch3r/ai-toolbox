/**
 * toolPayloadStorage — C compaction family (24.09): on-disk verbatim store for oversized tool payloads
 * pruned by toolPayloadCompaction BEFORE history summarization. Layout:
 *
 *   <cwd>/.ai_toolbox/compaction/<sha256hex>.payload     (UTF-8, mode 0o600 where the OS honors it)
 *
 * OPAQUE-ID CONTRACT: file names ARE the locator digests (parseLocator/buildLocator in toolPayloadCompaction).
 * Nothing else may write into this directory; retrieval is by locator only. The digest pairs with the
 * stored canonical text via sha256Hex(), so a name+content mismatch means corruption and FAILS LOUD
 * (never silently returns stale bytes under a different hash).
 */

import { createHash } from 'node:crypto';
import { mkdir, open, readFile, stat, writeFile as fsWriteFile } from 'node:fs/promises';
import * as path from 'node:path';
import {
  DEFAULT_MAX_BYTES_PER_RESULT,
  getPrunablePayloadTexts,
  parseLocator,
} from './toolPayloadCompaction.js';

/** Sub-path (relative to the working directory) of the compaction store. */
export const COMPACTION_DIR_REL = path.join('.ai_toolbox', 'compaction');

/** Canonical UTF-8 SHA-256 digest (lowercase hex, 64 chars) — the locator's payload identifier. */
export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Absolute store directory for a working directory (does NOT create it). */
export function compactionDirFor(cwd: string): string {
  return path.join(cwd, COMPACTION_DIR_REL);
}

/** Ensure the store directory exists (0o700 best-effort; Windows ignores mode on mkdir — documented). */
export async function ensureCompactionStore(cwd: string): Promise<string> {
  const dir = compactionDirFor(cwd);
  await mkdir(dir, { recursive: true });
  return dir;
}

/**
 * One digest+payload pair for a single prunable message — same scan order as the policy pass. The
 * canonical stored text is the single payload string, or all block texts joined with '\n' (one storage
 * object per message: every compacted block in that message references this one locator).
 */
export interface PrunedPayloadRef {
  digestHex: string;
  /** Canonical verbatim bytes stored on disk for this message. */
  text: string;
}

/**
 * Digests for exactly the messages toolPayloadCompaction.pruneOversizedToolPayloads WILL prune, in array
 * order — computed with getPrunablePayloadTexts (the policy's own decision function) so pairing can never
 * drift from the rewrite pass. Call this BEFORE pruning on a copy of the original contents is impossible
 * (pruning mutates in place), therefore: scan → digests+text → prune(digests) → store(text).
 */
export function collectPrunedPayloadRefs(
  messages: Array<{ role?: string; content?: unknown }>,
  maxBytesPerResult: number = DEFAULT_MAX_BYTES_PER_RESULT,
): PrunedPayloadRef[] {
  const refs: PrunedPayloadRef[] = [];
  for (const msg of messages) {
    const texts = getPrunablePayloadTexts(msg, maxBytesPerResult);
    if (!texts) continue;
    const text = texts.length === 1 ? texts[0] : texts.join('\n');
    refs.push({ digestHex: sha256Hex(text), text });
  }
  return refs;
}

export interface StorePayloadResult {
  path: string;
  bytes: number;
  /** false when the exact file already existed (idempotent re-compression of identical content). */
  created: boolean;
}

/**
 * Stores a pruned payload VERBATIM under its digest name. Exclusive create (`open(path,'wx')`) so two
 * concurrent writes can never interleave, and a pre-existing SYMLINK at the target is refused by 'wx'
 * semantics (it does not follow through to write — race-safe; documented per C step 2). An existing file
 * must match byte-for-byte or storage fails loud.
 */
export async function storePrunedPayload(
  cwd: string,
  ref: PrunedPayloadRef,
): Promise<StorePayloadResult> {
  const dir = await ensureCompactionStore(cwd);
  const filePath = path.join(dir, `${ref.digestHex}.payload`);
  const bytes = Buffer.byteLength(ref.text, 'utf8');

  try {
    const handle = await open(filePath, 'wx', 0o600); // exclusive create — EEXIST when present/symlinked-over
    try {
      await fsWriteFile(handle, ref.text, 'utf8');
    } finally {
      await handle.close();
    }
    return { path: filePath, bytes, created: true };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      // Idempotency + corruption check: digest names the exact content, so an existing file MUST match.
      const existing = await readFile(filePath, 'utf8');
      if (existing !== ref.text) {
        throw new Error(
          `[toolPayloadStorage] FAIL-LOUD: ${path.basename(filePath)} already exists with DIFFERENT content — ` +
          'digest collision or corrupted store; refusing to overwrite. Manual inspection required.',
        );
      }
      const st = await stat(filePath);
      return { path: filePath, bytes: st.size, created: false };
    }
    throw err;
  }
}

/**
 * Retrieves a stored payload by opaque locator (`compaction://<sha256hex>`). Returns null when the file
 * is absent (pruned content may have been cleaned out) — callers must treat that as "payload unavailable"
 * and say so honestly to the user, never invent content.
 */
export async function retrievePrunedPayload(cwd: string, locator: string): Promise<string | null> {
  const digestHex = parseLocator(locator);
  if (!digestHex) return null; // malformed / foreign scheme — fail loud at the call site (return null here keeps this pure-ish)
  const filePath = path.join(compactionDirFor(cwd), `${digestHex}.payload`);
  try {
    return await readFile(filePath, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err; // permission/IO errors are real failures — surface them
  }
}

/** Relative store path for a locator — the retrieval hint printed next to pruned previews. */
export function relativeStorePath(cwd: string, digestHex: string): string {
  return path.join(COMPACTION_DIR_REL, `${digestHex}.payload`);
}
