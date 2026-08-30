# FIX-HANG-5b — patternNeedsWorkerIsolation anchor-defect probe evidence (30.08)

Branch `spike/ssh2-transport` @ 43d0934 + uncommitted work. Method: verbatim slice of
`patternNeedsWorkerIsolation` extracted from `src/tools/fileSystemTools.ts` by script
(only 4 TS-only constructs stripped — signature x2, `boolean[]`, `string[]`; zero logic changes),
written to `_redos_test/_tmp_pwis.js`, executed via `require()` inside the Node sandbox
(child_process and new Function are banned there). Probe file is REGENERATED from disk after every edit.

## 1. Defect (confirmed empirically, pre-fix)

`((a+){3}){4}x` → **false** = mis-triaged SAFE → inline `.test()` on the 15k-`a` line
(main-thread freeze class; T1b double-fail root cause of 29.08).

Decisive control pair (pre-fix): `((a+){3}){4}` → **true** vs `((a+){3}){4}x` → **false**.
Only difference: the trailing literal `x`. ⇒ L123's `$`-anchored test is the sole cause.

### Why (byte-level)

L123 on disk (pre-fix): `/^{[0-9]+(,[0-9]*)?\}$/` — char codes `[47,94,123,...,63,92,125,36,47]`:
bare `{` (implicit-literal per ES spec), escaped `\}`, `$` anchor. At the `)` of `(a+){3}` in
T1b pattern, j points at the second brace: slice = `{4}x`; anchored test requires ENTIRE
remainder to be exactly `{n[,m]}` → fails on trailing `x` → no `return true` → falls through.

Full byte map of all brace-test sites (disk truth, pre-fix) — only L123 was both anchored AND live:

| Line | Literal (byte-verified) | Anchored? | Role | Pre-fix verdict |
|---|---|---|---|---|
| 104 | `/^\{[0-9]+(,[0-9]*)?\}/` | no | char-class quantifier → mark enclosing body | OK (prefix form) |
| **123** | `/{[0-9]+(,[0-9]*)?\}$/` | **yes ($)** | `)`+brace on quantified body → return true | **BUG — T1b** |
| 135 | `/^\{[0-9]+(,[0-9]*)?\}/` | no | alternation-analysis quantifier detection | OK (prefix form) |
| 166 | `/{[0-9]+(,[0-9*)?}\}$/`-ish, tested vs `qAfter` (single char) | yes | enclosing-scope mark after `)`+quant | DEAD test — a 1-char string can never match this ≥3-char pattern; no behavior either way → left untouched (minimal scope) |
| 170 | `/^\{[0-9]+(,[0-9]*)?\}/` | no | fall-through mark for enclosing body | OK (prefix form — NOTE: last night's note listed it as a second anchored site; disk truth shows it was already fixed/prefix since 29.08 19:59, file mtime) |
| 187 | `/^\{[0-9]+(,[0-9]*)?\}/` (`.match`, advance via `braceM[0]`) | no | consume brace quantifier in body; null-safe (`if (braceM)`) | OK — also fixes yesterday's latent `null![0]` crash class by construction |
| 189 | `/^\{[0-9]+,[0-9]*\}/` | no | mark VARIABLE-length `{n,m}`/`{n,}` body quantifiers only (fixed `{n}` intentionally NOT marked — unique partition) | OK (prefix form; comma required by design) |

## 2. Probe matrices

Pre-fix expectations: the "expected" column is what a CORRECT gate should answer;
rows that disagree pre-fix are defects.

| Pattern | Pre-fix got | Post-fix got | Expected | Note |
|---|---|---|---|---|
| `((a+){3}){4}x` | false ✗ | **true ✓** | true | T1b pattern — THE defect |
| `((a+){3,9})z` | false ✗ | **true ✓** | true | bonus defect found today: var-brace + trailing literal, no outer quantifier needed for explosion (C(n-1,k) ambiguity with k in 3..9 of inner unbounded body) |
| `(a+){5,7}(b+)?` | false ✗ | **true ✓** | true | bonus defect found today: same class |
| `^(a+)+$` | true ✓ | true ✓ | true | canonical ReDoS control |
| `ab\1a+(\d+)` | true ✓ | true ✓ | true | backreference control (T2c) |
| `(a*){50}` | true ✓ | true ✓ | true | deep fixed repetition (comment-cited case — regression guard) |
| `((a+)b)+` | true ✓ | true ✓ | true | yesterday's forward-mark fix (regression guard) |
| `a{5}` | false ✓ | **false ✓** | false | SAFE control: must stay INLINE |
| `(ab){2}` | false ✓ | **false ✓** | false | SAFE control: unquantified body, unique partition — stays INLINE |
| `(a+)b` | false ✓ | **false ✓** | false | T2 latent-crash case; single split → no explosion → inline is fine |
| `foo(bar)?baz` | (added) | **false ✓** | false | plain pattern control — stays INLINE |

Post-fix: 11/11 match. Documented accepted over-triage: `(a+){2}` now → true (worker).
Rationale recorded in gate header comment: mis-triaged-safe can HANG THE HOST; mis-triaged-risky
costs ~one 10–30ms worker spawn per file — the design posture explicitly pays that cost.

## 3. Fix applied (single line, L123)

```diff
- if (q === '{' && /^{[0-9]+(,[0-9]*)?\}$/.test(pattern.slice(j))) return true; // brace-bounded still catastrophic when deeply composed: ((a+){3}){4}… / (a*){50}
+ if (q === '{') return /^\{[0-9]+(,[0-9]*)?\}/.test(pattern.slice(j)); // FIX-HANG-5b (30.08): UNANCHORED prefix test — ...
```

Post-fix byte readback of L123 literal: `[47,94,92,123,...,63,92,125,47]` = `/^\{[0-9]+(,[0-9]*)?\}/`
— escaped braces, NO `$`, proper close. Function span unchanged (L78..L206); file mtime advanced
only by this edit. Backup: `src/tools/fileSystemTools.ts.bak`.

## 4. Remaining verification (requires user action — rebuild + restart)

1. tsup rebuild → confirm dist/index.js contains the new literal (indexOf check, NOT regex).
2. Quit + restart LM Studio (fresh bundle into memory).
3. Re-fire EXACT T1b: grep_files pattern `((a+){3}){4}x`, path `_redos_test/` (include-only
   `t1b_worker_redos.txt`), max_file_size 60000. PASS = ~2–4s return + skipped_files
   "terminated in isolated worker after 2000ms" + FIX-HANG-5 warn lines in main.log.


## 5. FIX-HANG-5c — worker API mismatch (found + fixed 30.08 ~10:0x)

T1b live re-fire after user rebuild+restart returned FAST with the skip message — a superficial
PASS — but `main.log` showed the worker never ran any regex at all:

```
stderr: [grep_files] FIX-HANG-5: worker error (self is not defined) — treating as skipped
stdout: [grep_files] FIX-HANG-5: skipped t1b_worker_redos.txt (worker kill — possible ReDoS)
```

### 5.1 Root cause

`REGEX_TEST_WORKER_SOURCE` was written for the **browser Web Worker** API (`self.onmessage`,
`e.data` envelope), but it is launched via node:worker_threads `new WorkerCtor(src, { eval: true })`.
In Node worker threads (verified on host runtime Node v24.15.0):

- there is NO `self` global → line 1 of the inline source threw `ReferenceError: self is not defined` at boot;
- `parentPort.on('message', handler)` receives the payload **value directly** — no MessageEvent (probe: received arg typeof=object, keys=[lines,patterns], hasDataProp=false);
- main→worker via `worker.postMessage(v)` and worker→main via `parentPort.postMessage(v)` are both direct values.

Net effect: every risky-pattern file was "skipped" through the 'error' event path with ZERO regex work done, while the user-facing reason string (single shared null-resolution in grep_files wiring) claimed a 2000ms watchdog kill. Containment held — but only via the error fallback; the actual
terminate()-of-a-spinning-.test() mechanism had **never been exercised live** (T1's earlier "pass" was plausibly the same silent crash).

### 5.2 Offline verification (this runtime, before any source change)

| Probe | Result | Meaning |
|---|---|---|
| diagnostic parentPort handler on trivial payload | received `{lines,patterns}` directly; `e.data` undefined | confirms direct-value contract → the fix's shape |
| fixed source, safe pattern `a{5}`, lines [nope / aaabbb / aaaaaXtail / aaaax] | returned exactly `[2]` | boot + matching semantics correct (first-match-per-line preserved) |
| fixed source, T1b-exact: 15k-`a` line (literal construction), pattern `((a+){3}){4}x`, prod-style 2000ms watchdog | **WATCHDOG_KILL at 2010 ms** — terminate() resolved the promise while the worker was still spinning | empirically proves `worker.terminate()` preempts an unpreemptible `.test()` on this runtime (the load-bearing FIX-HANG-5 claim, previously docs-only) |

Caveat: a sandbox probe of the OLD source string returned a parse artifact ("Unexpected token '{'")
instead of the live "self is not defined"; main.log remains the authoritative repro. No bearing on fix validity.

### 5.3 Fix applied (src/tools/fileSystemTools.ts, L52–77)

`REGEX_TEST_WORKER_SOURCE` rewritten: `parentPort` (require-guarded), direct-value handler arg named
`data`, internal try/catch now posts `{error}` and RETURNS instead of falling through to post `[indices]`,
final post guarded. Loop body / first-match-per-line semantics byte-identical to before; ES5, no imports
beyond the parentPort require (present in every node worker thread).

Byte readback: 18 string elements on disk === the runtime-proven source (`matchesTestedV2ByteForByte=true`);
no `self.` remaining in code (only inside the explanatory comment at L54). ESLint clean. New `.bak` holds the
pre-5c state (= includes FIX-HANG-5 + 5b; restoring it rolls back only 5c).

### 5.4 Handoff for live re-test (requires user action AGAIN)

1. tsup rebuild → confirm dist contains `parentPort` inside the worker source literal AND that
   `self.onmessage` is GONE from dist/index.js (indexOf checks, NOT regex — hard rule).
2. Full quit + restart LM Studio.
3. Re-fire EXACT T1b (unchanged params: pattern `((a+){3}){4}x`, `_redos_test/` include-only
   `t1b_worker_redos.txt`, max_file_size 60000).

Expected signature on PASS — NOTE it CHANGES vs the 5b-era expectation:
- return ~2–4 s (now dominated by the REAL 2000ms watchdog, not an instant crash);
- main.log stderr gains `[grep_files] FIX-HANG-5: worker exceeded 2000ms budget — terminated (possible ReDoS)`;
- `self is not defined` must be ABSENT from any new log lines.

Known residual limitation (documented, intentionally NOT changed — minimal scope): all null resolutions of
`testLinesInWorker` (watchdog kill / worker 'error' / internal `{error}` message) still share one user-facing
reason string. With 5c in place the dominant path is a genuine watchdog kill; an exotic crash would be
mislabeled as "terminated after 2000ms". Also: the spawn-failure comment at L~231 says "falling back to inline"
but null resolution actually records a SKIP (no inline run) — safe direction, comment only misleading.

