# FIX-HANG-5 closeout — live test results (30.08.2026 ~10:07–10:2x local)

Branch `spike/ssh2-transport` @ 43d0934 + UNCOMMITTED FIX-HANG-5 / 5b / 5c in
`src/tools/fileSystemTools.ts` only. Live bundle verified before first test:
dist/index.js + dist/index.mjs mtime `2026-08-30T08:04:3Z`; worker source literal contains
`require("worker_threads").parentPort` (1× each), pre-fix anchored L123 literal count 0,
unanchored prefix form at 5 sites; the single `self.onmessage` occurrence in each bundle is an
inert comment line. Host runtime: Node v24.15.0.

## T1b — catastrophic containment (`((a+){3}){4}x` vs 15k-`a` payload) — **PASS (definitive)**

grep_files(pattern `((a+){3}){4}x`, path `_redos_test/`, include `t1b_worker_redos.txt`,
max_file_size 60000). Returned fast; `filesScanned: 1`; matches 0; skipped_files reason:
`regex evaluation terminated in isolated worker after 2000ms — likely ReDoS-prone pattern`.

main.log (C:\Users\root.MPITS\AppData\Roaming\LM Studio\logs\main.log):

```
[2026-08-30 09:55:57.121] [error] ... stderr: [grep_files] FIX-HANG-5: worker error (self is not defined) — treating as skipped   ← pre-rebuild bundle, known failure mode
[2026-08-30 10:09:37.145] [error] ... stderr: [grep_files] FIX-HANG-5: worker exceeded 2000ms budget — terminated (possible ReDoS) ← live T1b, fresh bundle
```

"exceeded 2000ms budget" can only be emitted by the watchdog firing on a LIVE, spinning worker
→ all three fixes proven live end-to-end for the first time: 5b routing (worker engaged),
5c boot + real regex work (no `self is not defined` in new window), and the load-bearing claim
that `worker.terminate()` preempts an unpreemptible `.test()`. Host never froze.

## T2 — classifier regressions on `_redos_test/t2_classifier.txt` (lines: ab / aab / xab / (ab) / c) — **PASS**

| Pattern | Gate verdict (source-traced) | Path | Live result | Verdict |
|---|---|---|---|---|
| `(a+)b` | false (single split, no explosion) | INLINE | matches lines 1–4 exactly as predicted (`ab`,`aab`,`xab`,`(ab)`); `c` correctly not matched | PASS |
| `(ab){2}` | false (fixed `{n}`, unique partition; null-safe advance) | INLINE | clean zero matches — NO TypeError (latent `null![0]` crash class confirmed dead) | PASS |

## T2c — backreference control (`ab\1a+(\d+)` vs `_redos_test/t2c_backrefs.txt`) — **PASS**

Gate: `sawBackreference=true` → WORKER path (deterministic source trace; live call showed no
anomaly). Result: 0 matches, fast return. Live ground-truth probe in the host runtime
(Node v24, flags `i`, non-global): pattern matches NONE of the three payload lines — including
line "x 42" (earlier expectation that it would match was WRONG; modern V8 backreference
semantics: group-1 capture undefined at `\1` position → no match). Zero is therefore the correct
engine result. SCOPE NOTE (added with D2 resolution): the literal-demotion class behind FINDING-1/D2 is narrower than first implied here — only patterns with a word char directly abutting an unescaped `*` were affected; `(ab){25}` and `([a-z]*){3}x` never demoted. The ~2.9k-q line (ReDoS amplifier) caused no hang — containment holds even if routing were ever bypassed on this shape.

## Worker mechanism for `(a*){50}`-class — offline probe **PASS** (see FINDING 1)

Verbatim shipped worker source run in a real `worker_threads` Worker (same Node runtime),
T2 payload lines, pattern `/(a*){50}/i`: returned `[0,1,2,3,4]` in **17 ms** — all five non-empty
lines match via zero-length matches; first-match-per-line semantics intact.

## T3 — find_replace_all regression (literal replace, backup=true, scoped scratch file) — **PARTIAL PASS + FINDING 2**

Setup: unique token `t3-end-marker` in `_redos_test/t3_fra_scratch.txt` (collision-checked
against pre-existing fixtures before firing). Call: directory `_redos_test/`, ext `txt`,
replacement `T3-END-MODIFIED`, dry_run=false, confirm=true, backup=true.

PASS legs: replacement applied exactly once in the one intended file; all other lines byte-identical;
the two >100 KB payloads were correctly size-gated and skipped; no deadline/abort anomaly —
F1/F2/F3 phases completed cleanly ("Changes applied successfully").

FAIL leg: **no `.bak` exists anywhere after a successful FRA write.** Root cause (source, FRA
implementation): the backup is created pre-write for rollback only and then deleted on success:

```ts
if (backup) { backupPath = fullPath + '.bak'; await fs.copyFile(fullPath, backupPath); }
try { await atomicWriteFile(fullPath, newContent); } catch (err) { /* restore from .bak */ throw ...; }
if (backupPath) { try { await fs.unlink(backupPath); } catch {} }   // ← deleted after success
```

This contradicts: (1) FRA's own schema description ("Create .bak backup before modification"),
(2) TOOLS_REFERENCE.md L112 (`find_replace_all` advertised with "`.bak` backups"), and
(3) every sibling file tool in the same module (replace_text_in_file, insert_at_line,
append_file, delete_lines_in_file persist `.bak` + announce via createBackupAnnouncement for
restore_from_bak). No existing test pins either behavior (tests only mock `unlink`).
Git history unavailable inside the sandbox; user can check intent with:
`git log -S "fs.unlink(backupPath)" -- src/tools/fileSystemTools.ts`.

Scratch artifacts cleaned after verification. Pre-existing `_redos_test/fra_scratch.txt` untouched.

## Open decisions for user (NO code changed this session beyond none — zero source edits)

- **D1 (FINDING 2)**: FRA `.bak` policy — (A) persist backup after success to match docs/siblings
  (clutter managed by cleanup_backups; restores documented workflow), or (B) keep rollback-only
  semantics and correct the schema description + TOOLS_REFERENCE.md wording. Tests can pin either.
- **D2**: pre-existing `isSafeRegex` gate in security.ts demotes `(a*){50}`-class patterns to
  LITERAL mode BEFORE FIX-HANG-5 triage, so such searches silently return literal results (matches lost).
  Worker mechanism proven correct for this class if ever routed. **RESOLVED by user decision D2 this session (~10:3x):** `isSafeRegex` LOOSENED in `src/security.ts` —
codesig clause alternative `[\w][*&]` -> `[\w]&` (drop '*' from word-char adjacency; the redundant `\*` escape
in the following class also dropped, semantically identical). Surviving rejection paths: `::`, `->`,
word-char+'&', and `[*&]`-whitespace-word. VERIFIED against a verbatim disk extraction of the NEW function:
all pinned REV-24/safe/UNSAFE cases hold; D2 targets (`(a*){50}`, `foo*bar`) now SAFE; codesig positives
(`List* ptr`, `std::vector<int>*`, `ptr->val*`) still rejected. One matrix mismatch was a wrong guard
expectation, not a regression: bare-`&` patterns with with no unescaped *, + or ? (`const int& x`) were SAFE pre AND
post — unchanged. Regression tests pinned in `tests/security.test.ts` (D2 blocks). SCOPE PRECISION: the
over-rejection class is NARROWER than first documented here — only word char DIRECTLY ABUTTING an unescaped '*'
((a*){50}, foo*bar); ([a-z]*){3}x and (ab){25} were never demoted. **USER-SIDE VERIFICATION CONFIRMED ALL GREEN ~10:41 30.08 (jest incl. new D2 blocks + tsc).** Remaining: tsup rebuild + full restart (if not yet done) → live re-fire '(a*){50}' (expect patternMode regex, count=5, fast worker completion), then D3 commit ruling for all uncommitted work.
- **D3**: commit approval — all FIX-HANG-5/5b/5c work remains UNCOMMITTED in working tree
  (only `src/tools/fileSystemTools.ts` modified vs 43d0934).
