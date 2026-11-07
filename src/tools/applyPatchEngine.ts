/**
 * apply_patch engine (07.11) — unified-diff + binary byte-anchor patching, fully in-process.
 * No shell processes, no git CLI: parsing and application are pure Node Buffer/string logic.
 *
 * BYTE-EXACT by construction: only the matched byte slice of each hunk is replaced; every byte
 * outside a patched region survives verbatim (23.09 DRIFT-FIX house standard). Replacement bytes use
 * whichever EOL variant matched the anchor, so untouched CRLF/LF regions are never rewritten.
 */

// ==================== Shared limits ====================

/** Hard cap per target file. Patching is surgical, not a bulk transform. 64 MiB. */
export const APPLY_PATCH_MAX_FILE_BYTES = 64 * 1024 * 1024;

/** Payload guard for unified-diff text / hex payloads — stops accidental full-repo paste-in. 1 MiB. */
export const APPLY_PATCH_MAX_PATCH_CHARS = 1_000_000;

/** Hex payload cap (nibbles) for binary mode. 1 MiB of bytes. */
export const APPLY_PATCH_HEX_NIBBLE_MAX = 2_000_000;

/** Diagnostic window (± bytes) surfaced in AnchorMissingError messages for human inspection. */
export const APPLY_PATCH_DIAG_BEFORE = 128;
export const APPLY_PATCH_DIAG_AFTER = 128;

// ==================== Errors ====================

/** Malformed patch document or impossible parameter combination. The target file is never written. */
export class PatchParseError extends Error {
  constructor(message: string) { super(message); this.name = 'PatchParseError'; }
}

/** Anchor absent from the target (stale/drifted patch). Target never written. */
export class AnchorMissingError extends Error {}

// ==================== Data model ====================

export interface Hunk {
  fileName?: string;        // from the +++ header, diagnostics only
  oldLines: string[];       // context + removed lines, in file order (no prefix chars)
  removedCount?: number;    // count of '-' lines among oldLines (context = the rest; re-emitted on apply, 07.11 fix)
  bodyOps?: Array<'a' | 'r' | 'c'>; // per-line op sequence in file order: added / removed / context. Needed because git
                                    // groups '-' lines BEFORE '+' lines — surviving context is NOT a prefix of oldLines.
                                    // Reconstruction must walk this, not assume shape (07.11).
  addedLines: string[];     // '+' content, prefix stripped
  insertOnlyStart: number | null; // 1-based start line for -0,0 inserts (anchor fallback)
}

export interface ParsedPatch { fileName?: string; hunks: Hunk[] }

// ==================== parseUnifiedDiff ====================

const HUNK_HEADER_RE = /^@@ -(\d+)(?:,(\d+))?\s*\+(\d+)(?:,(\d+))\s*@@(.*)$/;

/**
 * Parse a single-file unified diff (git `diff -u` shape):
 *   --- a/path  /  +++ b/path  /  @@ -a,b +c,d @@  /  body ('-' ' +' plain lines)
 * Multiple hunks are supported and applied sequentially, each re-anchoring on the buffer that
 * prior hunks left → drift-tolerant by construction (the drift fix itself).
 */
export function parseUnifiedDiff(diff: string): ParsedPatch {
  if (!diff.trim()) throw new PatchParseError('Patch document is empty.');

  const lines = diff.split(/[\r\n]+/);
  if (lines.length < 3) {
    throw new PatchParseError(
      `Patch is too short to contain a file header + hunk (${Math.min(lines.length, 6)} line(s)).`
    );
  }

  const firstLine = lines[0].trim();
  const secondLine = lines[1].trim();
  if (!firstLine.startsWith('---')) {
    throw new PatchParseError(`Expected file header at line 1 ('--- a/...'), got: "${firstLine}"`);
  }
  if (!secondLine.startsWith('+++')) {
    throw new PatchParseError(`Expected file header at line 2 ('+++ b/...'), got: "${secondLine}"`);
  }

  const plusPath = secondLine.replace(/^\+\+/, '').split(/\s+/)[0];
  if (plusPath === '/dev/null' || /binary/i.test(plusPath)) {
    throw new PatchParseError(
      `Target "${plusPath}" is a binary/device header. mode "unified" patches text only — use ` +
        'mode "binary" with anchor_hex/replacement_hex for byte-level changes.'
    );
  }

  const hunks: Hunk[] = [];
  let i = 2;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.startsWith('@@')) {
      throw new PatchParseError(
        `Expected hunk header at line ${i + 1}, got: "${line}". The patch is missing or truncated its '@@ -a,b +c,d @@' marker.`
      );
    }

    const m = HUNK_HEADER_RE.exec(line);
    if (!m) {
      throw new PatchParseError(
        `Malformed hunk header at line ${i + 1}: "${line}". Expected '@@ -<start>[,<count>] +<start>,<count> @@'.`
      );
    }
    const oldStart = parseInt(m[1], 10);
    const oldCount = m[2] ? parseInt(m[2], 10) : 1;
    const newCount = parseInt(m[4], 10);

    // Insert-only (-0,0) and delete-only (+N,0) hunks are legal git shapes — zero counts on exactly one side.
    if (oldStart < 0 || oldCount < 0 || newCount < 0 || (oldCount === 0 && newCount === 0)) {
      throw new PatchParseError(
        `Invalid hunk numbers at line ${i + 1}: -${oldStart},${oldCount} +?,${newCount}. Expected -<start>[,<count>] +<start>,<count> (a zero count is allowed on exactly one side: insert-only "-0,0" or delete-only "+s,0").`
      );
    }

    const contextAndRemoved: string[] = [];
    const added: string[] = [];
    const bodyOps: Array<'a' | 'r' | 'c'> = []; // per-line ops in file order (a=added, r=removed, c=context) — the 07.11
                                                // reconstruction walks THIS; a bare keptCtx-prefix assumption broke as soon
                                                // as git's '-'-before-'+' grouping put context after removals (multi-hunk run).
    let ctxCount = 0; // git semantics: a context line counts toward BOTH side counts in the header
    let removedCount = 0;
    i += 1;
    while (i < lines.length && !lines[i].startsWith('@@')) {
      const b = lines[i];
      if (b.startsWith('-') || b === '-') {
        contextAndRemoved.push(b.slice(1));
        removedCount += 1;
        bodyOps.push('r');
      } else if (b.startsWith('+') || b === '+') {
        added.push(b.slice(1));
        bodyOps.push('a');
      } else {
        // Context line. Git prefixes EVERY body line with one char (' ' for context — even blank lines are a lone ' ').
        // Strip exactly ONE leading space when present; tolerate patches that omit the prefix (07.11 fix: keeping it
        // made the anchor contain phantom spaces → AnchorMissingError on every real git-generated patch).
        // NOTE: the parser's /[\r\n]+/ split turns a trailing '\n' into one such '' — body text
        // MUST be newline-free (blank source lines are represented as a lone backtick in test patches).
        const ctxContent = b.startsWith(' ') ? b.slice(1) : b;
        contextAndRemoved.push(ctxContent);
        ctxCount += 1;
        bodyOps.push('c');
      }
      i += 1;
    }

    if (contextAndRemoved.length !== oldCount) { // = removed + context, per git -<start>,<count> semantics
      throw new PatchParseError(
        `Malformed diff: header declares ${oldCount} old line(s), body contains ${contextAndRemoved.length}. Regenerate the patch.`
      );
    }
    // git +side semantics: newCount = added + context (context lines appear on both sides of a hunk).
    if (added.length + ctxCount !== newCount) {
      throw new PatchParseError(
        `Malformed diff: header declares ${newCount} new line(s), body contains ${added.length + ctxCount} (${added.length} added + ${ctxCount} context). Regenerate the patch.`
      );
    }

    hunks.push({
      fileName: plusPath,
      oldLines: [...contextAndRemoved], // already in file order (context interleaved with removals)
      removedCount, // how many of those are '-' lines vs context — applyHunk must re-emit the context ones
      bodyOps, // per-line op sequence — applyHunk reconstructs from THIS (shape-agnostic), not from count math
      addedLines: added,
      insertOnlyStart: oldCount === 0 ? parseInt(m[3], 10) : null,
    });
  }

  if (hunks.length === 0) throw new PatchParseError('Patch contains no hunk headers.');
  return { fileName: plusPath, hunks };
}

// ==================== EOL + line offsets ====================

/** Dominant line ending of a buffer. '\r\n' if any CRLF is present; '\n' otherwise (incl. bare-LF). */
export function detectEol(buf: Buffer): string {
  return buf.includes(Buffer.from('\r\n')) ? '\r\n' : '\n';
}

/** Byte offset of every line start in a buffer (EOL-agnostic: CRLF / LF / CR / mixed). offsets[0] === 0. */
function lineStartOffsets(buf: Buffer): number[] {
  const offsets = [0];
  let i = 0;
  while (i < buf.length) {
    const b = buf[i];
    if (b === 0x0d && i + 1 < buf.length && buf[i + 1] === 0x0a) { offsets.push(i + 2); i += 2; } // CRLF
    else if (b === 0x0a || b === 0x0d) { offsets.push(i + 1); i += 1; }                      // LF / CR
    else { i += 1; }
  }
  return offsets;
}

function escapeForLog(s: string): string {
  let out = '';
  for (let k = 0; k < s.length; k++) {
    const c = s.charCodeAt(k);
    out += (c >= 0x00 && c <= 0x1f) || c === 0x7f ? '\\x' + c.toString(16) : s[k];
  }
  return out;
}

function diagnoseAnchor(buf: Buffer, firstAnchorLine: string): string {
  const text = buf.toString('binary');
  const needle = firstAnchorLine.trim();
  if (!needle) return 'first anchor line is empty in this patch.';
  let lastHit = -1;
  let from = 0;
  let found = 0;
  while (found < 5 && (from <= text.length)) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    lastHit = idx;
    found += 1;
    from = idx + needle.length;
  }
  const target = lastHit >= 0 ? lastHit : 0;
  const lo = Math.max(0, target - APPLY_PATCH_DIAG_BEFORE);
  const hi = Math.min(text.length, target + APPLY_PATCH_DIAG_AFTER);
  return (
    `File appears to have drifted since the patch was generated. Window [${lo}..${hi}] of actual content: ...${escapeForLog(text.slice(lo, hi))}...`
  );
}

// ==================== hunk application ====================

function applyHunk(buf: Buffer, hunk: Hunk): { newBuf: Buffer; deltaBytes: number } {
  const oldLines = hunk.oldLines;
  const addedLines = hunk.addedLines;

  let hitIndex = -1; // byte offset of the old region start
  let eol = detectEol(buf);
  let matchedLength = 0;

  if (oldLines.length > 0) {
    const lfAnchor = Buffer.from(oldLines.join('\n'), 'utf8');
    const crlfAnchor = Buffer.from(oldLines.join('\r\n'), 'utf8');
    const hitLf = buf.indexOf(lfAnchor);
    const hitCrlf = buf.indexOf(crlfAnchor);
    if (hitLf >= 0) { hitIndex = hitLf; eol = '\n'; matchedLength = lfAnchor.byteLength; }
    else if (hitCrlf >= 0) { hitIndex = hitCrlf; eol = '\r\n'; matchedLength = crlfAnchor.byteLength; }

    if (hitIndex < 0) {
      throw new AnchorMissingError(
        `Unified-diff hunk anchor not found in target. ${diagnoseAnchor(buf, oldLines[0])}`
      );
    }
  } else {
    // Insert-only: anchor by the header's start line via byte offset map.
    if (hunk.insertOnlyStart == null) {
      throw new AnchorMissingError('Insert-only hunk without a valid start position.');
    }
    const offsets = lineStartOffsets(buf);
    const pos = hunk.insertOnlyStart - 1; // convert 1-based to index
    if (pos < 0 || pos > offsets.length - 1) {
      hitIndex = buf.byteLength; // append at EOF when the header points past the end
      matchedLength = 0;
    } else {
      hitIndex = offsets[pos];
      matchedLength = 0;
    }
  }

  // Byte offset where the untouched tail begins. MUST be computed before any branch that may need it — an
  // earlier revision declared this AFTER the insert-only branch that reads it (TDZ ReferenceError, 07.11 run).
  const tailStart = matchedLength === 0 ? hitIndex : hitIndex + matchedLength;

  // Legacy fallback for Hunks built without bodyOps (direct-API consumers): assumes the PREFIX shape — surviving
  // context first, removals last. An earlier draft tested `removedCount > k`, which is INVERTED (removedCount=0
  // → every line read as removed); the prefix shape must count context = length - removedCount (07.11).
  // A full swap (all old lines replaced by a non-empty '+' block) marks the tail op 'a': the last old line's
  // terminator is KEPT, exactly like parsed hunks ending in an added block — only a true trailing REMOVAL consumes it.
  const fallbackOps: Array<'r' | 'c' | 'a'> = oldLines.map((_, k) => (k < oldLines.length - (hunk.removedCount ?? 0) ? 'c' : 'r'));
  if ((hunk.removedCount ?? 0) === oldLines.length && addedLines.length > 0) fallbackOps.push('a');

  // Reconstruct the replacement span git-accurately for this hunk. 07.11 fix lineage: earlier revisions
  // (a) dropped context lines, (b) double-emitted their terminating EOL (stray blank line), and (c) assumed
  // surviving context is a PREFIX of oldLines — which breaks on git's '-'-before-'+' grouping the moment a
  // removal precedes its trailing context. So reconstruction now walks the per-line op sequence in file order;
  // removed ('r') lines are consumed by the '+' block as a whole, and the span ends after the last line's CONTENT —
  // its terminating EOL belongs to the untouched tail and stays in `buf`.
  const buildSpan = (): Buffer => {
    if (matchedLength > 0) {
      const ops: Array<'a' | 'r' | 'c'> = hunk.bodyOps ?? fallbackOps; // per-line truth when parsed, documented prefix assumption otherwise
      if (ops.filter((o) => o === 'c').length === 0) {
        return Buffer.from(addedLines.join(eol), 'utf8'); // pure replacement of the anchored span — no surviving context.
                                                          // (Identical to the walk for this shape, but O(n) without parts[]; covers legacy Hunks too.)
      }
      const parts: Buffer[] = [];
      let aIdx = 0; // advances on 'a' ops
      let oIdx = 0; // advances on 'c'/'r' ops — 'a' positions shift ops-indices, so one shared index would read past the end (07.11)
      for (let k = 0; k < ops.length; k++) {
        if (ops[k] === 'r') { oIdx += 1; continue; } // removed lines are replaced by the '+' block as a whole
        const content = ops[k] === 'a' ? addedLines[aIdx++] : oldLines[oIdx++];
        if (parts.length > 0) parts.push(Buffer.from(eol, 'utf8')); // EOL BETWEEN lines only — never after the last one
        parts.push(Buffer.from(content, 'utf8'));
      }
      return Buffer.concat(parts);
    }
    // Insert-only: terminate the inserted block with the file's EOL when real content follows, so a
    // line prepended at offset 0 never fuses into the first existing line (07.11). `tailStart` is computed
    // BEFORE this branch — it was declared after its first use here (TDZ ReferenceError in the 07.11 run).
    return Buffer.from(addedLines.join(eol) + (tailStart < buf.length && addedLines.length > 0 ? eol : ''), 'utf8');
  };

  const newBytes = buildSpan();

  // Terminator of the OLD region's LAST line: while it survives (last file-order op is context), its EOL stays in
  // the untouched tail; but when the last old line is REMOVED, nothing re-emits that EOL — the span must consume
  // one matched-EOL after tailStart or delete-only / trailing-removal shapes leave a phantom blank line (07.11).
  const opsForTail: Array<'a' | 'r' | 'c'> = hunk.bodyOps ?? fallbackOps;
  let consumedTailEol = 0;
  if (matchedLength > 0 && opsForTail[opsForTail.length - 1] === 'r') {
    // Inspect the TAIL BYTES themselves, not only the anchor's EOL: for a single-line anchor in a CRLF file the LF
    // variant matches first (substring), so `eol` can be '\n' while the bytes after tailStart are '\r\n'.
    if (buf[tailStart] === 0x0d && buf[tailStart + 1] === 0x0a) consumedTailEol = 2;                       // CRLF
    else if (buf.subarray(tailStart, tailStart + eol.length).equals(Buffer.from(eol, 'utf8'))) consumedTailEol = eol.length; // matched EOL at EOF-safe length
  }

  const newBuf = Buffer.concat([
    buf.subarray(0, hitIndex),
    newBytes,
    buf.subarray(tailStart + consumedTailEol),
  ]);

  return { newBuf, deltaBytes: newBytes.byteLength - matchedLength - consumedTailEol };
}

export function applyUnifiedPatchToBuffer(buf: Buffer, patch: ParsedPatch): { newBuf: Buffer; totalDelta: number } {
  let out = buf;
  let totalDelta = 0;
  for (let hi = 0; hi < patch.hunks.length; hi++) {
    const { newBuf, deltaBytes } = applyHunk(out, patch.hunks[hi]);
    if (newBuf.byteLength > APPLY_PATCH_MAX_FILE_BYTES) {
      throw new PatchParseError(`Result would exceed the 64 MiB file cap (${newBuf.byteLength} bytes).`);
    }
    out = newBuf;
    totalDelta += deltaBytes;
  }
  return { newBuf: out, totalDelta };
}

// ==================== binary byte-anchor hot-patch ====================

export function parseHex(input: string): Buffer {
  if (input === '') return Buffer.alloc(0);
  const cleaned = input.replace(/\s+/g, '');
  if (cleaned.length % 2 !== 0) throw new PatchParseError(`Hex payload must have an even number of nibbles (${cleaned.length}).`);
  for (let i = 0; i < cleaned.length; i++) {
    const hexValid = '0123456789abcdefABCDEF';
    if (!hexValid.includes(cleaned.charAt(i))) throw new PatchParseError(`Invalid hex character "${cleaned.charAt(i)}" at nibble ${i}.`);
  }
  const out = Buffer.alloc(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    out[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  return out;
}

export function applyBinaryPatchToBuffer(
  buf: Buffer,
  args: { anchorHex: string; replacementHex: string; offset?: number },
): { newBuf: Buffer; deltaBytes: number } {
  if (args.anchorHex.length > APPLY_PATCH_HEX_NIBBLE_MAX) throw new PatchParseError('anchor_hex exceeds hex cap.');
  const anchor = parseHex(args.anchorHex);
  const repl = parseHex(args.replacementHex);

  if (anchor.byteLength === 0) throw new PatchParseError('Binary mode requires a non-empty anchor_hex.');

  let hitIndex: number;
  if (args.offset != null && args.offset >= 0) {
    // Strict pin: verify the exact bytes at that position match, or fail. No fuzzy search.
    const end = args.offset + anchor.byteLength;
    const window = end > buf.byteLength ? Buffer.from('') : buf.subarray(args.offset, end);
    if (window.length !== anchor.byteLength || window.compare(anchor) !== 0) {
      throw new AnchorMissingError(
        `Binary offset ${args.offset}: bytes at that position do not match the given anchor. Re-check offset and hex.`
      );
    }
    hitIndex = args.offset;
  } else {
    const idx = buf.indexOf(anchor);
    if (idx < 0) {
      throw new AnchorMissingError(`Binary anchor not found in target file (${anchor.byteLength} bytes). Re-check the hex payload.`);
    }
    hitIndex = idx;
  }

  const newBuf = Buffer.concat([
    buf.subarray(0, hitIndex),
    repl,
    buf.subarray(hitIndex + anchor.byteLength),
  ]);
  if (newBuf.byteLength > APPLY_PATCH_MAX_FILE_BYTES) {
    throw new PatchParseError(`Result exceeds 64 MiB cap: ${newBuf.byteLength} bytes.`);
  }
  return { newBuf, deltaBytes: repl.byteLength - anchor.byteLength };
}
