#!/usr/bin/env node
/**
 * CTX-EST A (01.11, owner GO "write it") — LIVE DENSE-PAYLOAD TOKEN-DENSITY PROBE
 * ================================================================================
 * Purpose: confirm or replace src/tokenStatsManager.ts HIGH_ENTROPY_DENSITY_BIAS/FLOOR.
 * Those constants are INCIDENT-DERIVED from the 29.10 root-cause-C ratio (real effective
 * density on log/hex content ≈ 0.9–1.1 c/tok), NOT probe-justified — per the
 * density-provenance protocol in that file, this live /v1/chat/completions probe must
 * confirm/replace them before either is treated as settled (same discipline as the
 * 15.10 agentic-density raise). Precedent method: the 10.10 agentic-density probe
 * (usage.prompt_tokens, max output tokens pinned to 1; see tokenStatsManager.ts header block).
 *
 * Usage:
 *   node scripts/ctx_est_a_dense_payload_probe.mjs
 * Env overrides (all optional):
 *   LMS_BASE_URL   default http://127.0.0.1:1234   (LM Studio server)
 *   LMS_MODEL      default = first model listed by GET /v1/models
 *   PROBE_CHARS    chars per payload family, default 8000 (min 500; > ~16000 risks truncation warnings)
 *   HE_DENSITY     live menu density used for the applied-density verdict, default 3.6 (= AGENTIC_CHARS_PER_TOKEN default)
 *
 * Method:
 *   controlA : minimal prompt                          → server/protocol overhead tokens (reported only; NOT subtracted)
 *   controlW : wrapper-only request                    → base = wrapper tokenization
 *   family k : fixed wrapper + deterministic payload_k → attributed = usage.prompt_tokens − base
 *   effective c/tok per family = payloadChars / attributed. All payloads are DETERMINISTIC (LCG, no Math.random) — reruns on the same model+size reproduce the dataset exactly.
 *   Note: token attribution subtracts a separate wrapper request; prompt-tokenizer boundary effects add ~±1-2 tok noise at 8k scale (reported per family).
 *
 * Exit codes: 0 = all families measured · 1 = server unreachable / no model · 2 = any family failed to measure
 */

// node:http/node:https stdlib transport (no fetch dependency on older runtimes) — see postJson/getJson below.
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

// Constants mirror src/tokenStatsManager.ts as of this probe — if BIAS/FLOOR change later, the verdict lines below
// must be re-read against the NEW values (the decision rule is printed in full on every run).
const HIGH_ENTROPY_DENSITY_BIAS = 0.4; // applied density = live × 0.4
const HIGH_ENTROPY_DENSITY_FLOOR = 1.0; // hard floor c/tok — est ≤ chars / FLOOR

const BASE_URL = (process.env.LMS_BASE_URL || 'http://127.0.0.1:1234').replace(/\/+$/, '');
const MODEL = process.env.LMS_MODEL || '';
const PROBE_CHARS = Math.max(500, Number.parseInt(process.env.PROBE_CHARS ?? '8000', 10) || 8000);
const HE_DENSITY = Number.parseFloat(process.env.HE_DENSITY ?? '3.6') || 3.6;

const WRAPPER = 'Analyze the following tool output verbatim and reply with a single word.\n\n';

// ---------------------------------------------------------------- deterministic PRNG (LCG) — reproducible payloads, no Math.random
function makeLcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0; // Numerical Recipes LCG
    return s / 4294967296; // [0,1)
  };
}

const HEX_DIGITS = '0123456789abcdef';
function hexBytes(rand, n) {
  let out = '';
  for (let i = 0; i < n * 2; i++) out += HEX_DIGITS[Math.floor(rand() * 16)];
  return out; // n bytes → 2n chars
}

/** Family 1 — hex-dump lines: 8-hex offset + ': ' + 16 spaced byte pairs (47) padded to col 59 + ' <ascii16>' → 77-char stable lines. */
function genHexDump(target) {
  const rand = makeLcg(0xA1B2C3);
  let out = '';
  for (;;) {
    const addr = (Math.floor(rand() * 0xfffff)).toString(16).padStart(8, '0');
    const bytes = hexBytes(rand, 16); // 32 hex chars, 16 bytes
    const ascii = Array.from({ length: 16 }, (_, i) => {
      const c = Number.parseInt(bytes.slice(i * 2, i * 2 + 2), 16);
      return c >= 33 && c < 127 ? String.fromCharCode(c) : '.';
    }).join('');
    const hexCols = [];
    for (let i = 0; i < 16; i++) hexCols.push(bytes.slice(i * 2, i * 2 + 2));
    let line = `${addr}: ${hexCols.join(' ')}`.padEnd(59) + ` <${ascii}>`;
    if (out.length + line.length + 1 > target) break; // whole lines only → stable char count math below
    out += (out ? '\n' : '') + line;
  }
  return out.slice(0, target);
}

/** Family 2 — base64 blob in 76-char MIME lines (embedded-binary / cert class). */
function genBase64(target) {
  const rand = makeLcg(0x5EEDF1);
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  while (out.length < target) {
    // 57 random bytes → exactly 76 base64 chars per block
    const b64 = Array.from({ length: 76 }, () => A[Math.floor(rand() * 64)]).join('');
    if (out.length + b64.length > target) break; // whole lines only
    out += (out ? '\n' : '') + b64;
  }
  return out.slice(0, target);
}

/** Family 3 — structured log storm: the 29.10 incident content class (timestamped log/hex-dense tool output). */
function genLogStorm(target) {
  const rand = makeLcg(0x291011); // seed = incident date, deliberately
  const paths = ['/api/v1/chat/completions', '/v1/models', '/plugins/ai_toolbox/tools/search_files', '/v1/embeddings'];
  let out = '';
  for (let i = 0; ; i++) {
    const ms = String(30 + Math.floor(rand() * 600)).padStart(3, '0');
    const line =
      `2026-11-01T18:09:${String(i % 60).padStart(2, '0')}.${ms}Z [INFO] worker=${1 + (i % 8)} req=${hexBytes(rand, 8)}` +
      ` trace=${hexBytes(rand, 8)} span=0x${hexBytes(rand, 4)} latency_ms=${Math.floor(rand() * 900)} status=${rand() < 0.05 ? 500 : 200} path=${paths[i % paths.length]}`;
    if (out.length + line.length + 1 > target) break;
    out += (out ? '\n' : '') + line;
  }
  return out.slice(0, target);
}

/** Family 4 — JSON tool-result array: the exact shape recordToolResult() prices mid-loop. */
function genJsonToolResults(target) {
  const rand = makeLcg(0x70A21);
  const obj = (i) => ({
    id: `res_${hexBytes(rand, 6)}`,
    name: ['search_files', 'read_file', 'analyze_project'][i % 3],
    status: 'success',
    preview: hexBytes(rand, 48), // dense hex payload inside the JSON string — incident-realistic
    bytes_read: Math.floor(rand() * 262144),
  });
  let items = [obj(0)];
  for (let i = 1; ; i++) {
    const s = JSON.stringify({ ok: true, result: { count: i + 1, results: items } }, null, 2); // pretty-printed like real tool output
    if (s.length > target) break;
    items.push(obj(i));
  }
  let out = JSON.stringify({ ok: true, result: { count: items.length, results: items } });
  while (out.length < target) out += `\n// trailing dense padding ${hexBytes(rand, 40)} //`;
  return out.slice(0, target);
}

const FAMILIES = [
  ['HEXDUMP', genHexDump],
  ['BASE64', genBase64],
  ['LOGSTORM', genLogStorm],
  ['JSON_TOOL_RESULT', genJsonToolResults],
];

// ---------------------------------------------------------------- transport (node:http — stdlib only, no fetch dependency on old runtimes)
function postJson(pathname, body, timeoutMs = 120_000) {
  return new Promise((resolve, reject) => {
    const u = new URL(BASE_URL + pathname);
    const doReq = u.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = doReq(
      { hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80), path: u.pathname, method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      },
    );
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout after ${timeoutMs}ms on ${pathname}`)));
    req.on('error', reject);
    req.end(JSON.stringify(body));
  });
}

function getJson(pathname, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const u = new URL(BASE_URL + pathname);
    const doReq = u.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = doReq({ hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80), path: u.pathname, method: 'GET' }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout after ${timeoutMs}ms on ${pathname}`)));
    req.on('error', reject);
    req.end();
  });
}

/** One /v1/chat/completions call → usage.prompt_tokens (or a descriptive error string). */
async function measurePromptTokens(model, text) {
  const r = await postJson('/v1/chat/completions', { model, messages: [{ role: 'user', content: text }], max_tokens: 1 }); // 10.10 precedent: output pinned minimal so prompt tokenization dominates
  if (r.status !== 200) return `HTTP ${r.status}: ${r.body.slice(0, 300)}`;
  let parsed;
  try { parsed = JSON.parse(r.body); } catch { return 'unparseable response body'; }
  const pt = parsed?.usage?.prompt_tokens;
  if (!Number.isFinite(pt)) return `no usage.prompt_tokens (keys: ${Object.keys(parsed ?? {}).join(',')})`;
  return pt;
}

// ---------------------------------------------------------------- main
const t0 = Date.now();
console.log('CTX-EST A dense-payload probe');
console.log(`server=${BASE_URL} · chars/family=${PROBE_CHARS} · HE menu density (verdict ref)=${HE_DENSITY} c/tok`);
console.log(`applied HE density @ that menu value = max(FLOOR ${HIGH_ENTROPY_DENSITY_FLOOR}, live×BIAS ${HE_DENSITY * HIGH_ENTROPY_DENSITY_BIAS}) = ` + Math.max(HIGH_ENTROPY_DENSITY_FLOOR, +(HE_DENSITY * HIGH_ENTROPY_DENSITY_BIAS).toFixed(4)) + ' c/tok');

// model resolution
let model = MODEL;
if (!model) {
  let m;
  try {
    const r = await getJson('/v1/models');
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    m = JSON.parse(r.body)?.data?.[0]?.id;
  } catch (e) {
    console.error(`✗ cannot reach ${BASE_URL}/v1/models (${e.message}) — is LM Studio running?`);
    process.exit(1);
  }
  if (!m) {
    console.error('✗ no model loaded on the server — load one (or set LMS_MODEL) and rerun');
    process.exit(1);
  }
  model = m; // 01.11 fix: first run resolved into local `m` but never assigned back ⇒ all requests went out with model:"" (server silently used its single loaded model — valid data, unattributable provenance)
} else {
  console.log(`model pinned via LMS_MODEL=${model}`);
}
console.log(`model=${model}\n`);

// controls
const ctrlA = await measurePromptTokens(model, 'Reply ok.');
if (typeof ctrlA !== 'number') {
  console.error(`✗ controlA failed: ${ctrlA}`);
  process.exit(2);
}
const base = await measurePromptTokens(model, WRAPPER + '\n');
if (typeof base !== 'number') {
  console.error(`✗ controlW (wrapper-only) failed: ${base}`);
  process.exit(2);
}
console.log(`controlA minimal-prompt overhead = ${ctrlA} tok · wrapper-only baseline = ${base} tok\n`);

const results = [];
let failures = 0;
for (const [name, gen] of FAMILIES) {
  const payload = gen(PROBE_CHARS); // slice(0,target) inside each generator ⇒ exact length unless a single line > target
  const chars = payload.length;
  const t = await measurePromptTokens(model, WRAPPER + '\n' + payload);
  if (typeof t !== 'number') {
    console.log(`✗ ${name.padEnd(16)} FAILED: ${t}`);
    failures++;
    continue;
  }
  const attributed = Math.max(1, t - base); // ≥1 guards division; boundary noise noted in header
  const cpt = chars / attributed;
  results.push({ name, chars, attributed, cpt });
  console.log(`${name.padEnd(16)} ${chars} chars → ${attributed} tok (raw ${t}) · effective ${cpt.toFixed(3)} c/tok`);
}

// verdict
console.log('\n--- VERDICT ---');
const applied = Math.max(HIGH_ENTROPY_DENSITY_FLOOR, +(HE_DENSITY * HIGH_ENTROPY_DENSITY_BIAS).toFixed(4));
if (results.length) {
  const cpts = results.map((r) => r.cpt);
  const minCpt = Math.min(...cpts); // densest content → most tokens per char → lowest c/tok = worst case for the estimator
  console.log(`effective band: ${Math.max(...cpts).toFixed(3)} … ${minCpt.toFixed(3)} c/tok (densest family = ${results.reduce((a, b) => (a.cpt < b.cpt ? a : b)).name})`);
  if (minCpt < HIGH_ENTROPY_DENSITY_FLOOR - 0.05) {
    console.log(`⚠ REPLACE CANDIDATE — FLOOR ${HIGH_ENTROPY_DENSITY_FLOOR}: densest measured family runs BELOW the floor ⇒ highEntropy estimator still UNDERCOUNTS by ~${Math.round((1 - HIGH_ENTROPY_DENSITY_FLOOR / minCpt) * 100)}% on that class (the 29.10 failure mode). Consider lowering HIGH_ENTROPY_DENSITY_FLOOR toward ${minCpt.toFixed(2)}.`);
  } else if (Math.min(...cpts) > applied * 1.5) {
    console.log(`⚠ RELAX CANDIDATE — BIAS ${HIGH_ENTROPY_DENSITY_BIAS}: ALL families tokenize far sparser than the applied ${applied} c/tok (min ${minCpt.toFixed(3)}) ⇒ highEntropy pricing OVER-counts by up to ~${Math.round((Math.min(...cpts) / applied - 1) * 100)}%. Consider raising BIAS toward ${(HE_DENSITY / minCpt).toFixed(2)} so live×BIAS ≈ densest measured c/tok.`);
  } else {
    console.log(`✔ CONFIRM — measured band covers the applied ${applied} c/tok (FLOOR ${HIGH_ENTROPY_DENSITY_FLOOR} holds: no family below it) ⇒ BIAS/FLOOR adequate on this model; flip 'PENDING' → 'CONFIRMED by 01.11 probe' in tokenStatsManager.ts via ONE dated edit (value + provenance block together).`);
  }
  console.log(`decision rule recap: attributed = usage.prompt_tokens − wrapper-only baseline · c/tok = chars/attributed · applied HE density = max(FLOOR, live×BIAS)`);
} else {
  failures++;
}
console.log(`\nfinished in ${((Date.now() - t0) / 1000).toFixed(1)}s · model=${model} — record this line + the band as provenance for any constant change (density-provenance protocol).`);
process.exit(failures ? 2 : 0);
