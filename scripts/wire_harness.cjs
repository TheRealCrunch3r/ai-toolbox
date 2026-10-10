#!/usr/bin/env node
/**
 * wire_harness.cjs — Wire-payload measurement harness for the ai_toolbox plugin (08.10, Lever-1 arc).
 *
 * Measures EXACTLY what the LM Studio host puts on the wire per request: each tool is serialized as
 *   { name, description, parameters: zodToJsonSchema(tool.parametersSchema) }
 * — the same call chain the SDK itself makes (@lmstudio/sdk 1.5.0 imports `zod-to-json-schema` ^3.22.5;
 * conversion site + field name verified in node_modules/@lmstudio/sdk/dist/index.mjs, 08.10).
 *
 * The harness drives the REAL production path: it loads dist/index.js, stubs the PluginContext
 * (withConfigSchematics / withPromptPreprocessor / withToolsProvider), calls main(), then invokes the
 * captured toolsProvider with a controller whose getPluginConfig() answers every .get(key) from the
 * schematics' own field defaults (= stock LM Studio config state). Add --god for GOD MODE.
 *
 * Usage (from project root):
 *   node scripts/wire_harness.cjs current                 # as-built dist, Lever 1 ACTIVE
 *   node scripts/wire_harness.cjs baseline                # same bundle with truncatePropertyDescribes NO-OP'd (pre-Lever-1 equivalent)
 *   node scripts/wire_harness.cjs both                    # runs both and prints the delta
 *
 * Token estimate: chars/4 heuristic (house convention; NOT exact tokenization).
 * Exit code 0 = ran clean. Baseline mode writes a temp patched copy of dist/index.js INTO dist/ and
 * always removes it again (try/finally); the live bundle is never modified.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'index.js');
const Z2JS_PATH = path.join(ROOT, 'node_modules', 'zod-to-json-schema');

function loadZodToJsonSchema() {
  const m = require(Z2JS_PATH); // zod-to-json-schema v3 (CJS entry)
  const fn = m.zodToJsonSchema || (m.default && m.default.zodToJsonSchema) || m.default || m;
  if (typeof fn !== 'function') throw new Error('zod-to-json-schema: no converter function found at top level');
  return fn;
}

/** Drop signal-handler registration while main() runs (cleanupBrowserSession must never fire from the harness). */
function silenceSignals(fn) {
  const realOn = process.on.bind(process);
  const wrapped = (ev, h) => (ev === 'SIGTERM' || ev === 'SIGINT') ? undefined : realOn(ev, h);
  process.on = wrapped;
  try { return fn(); } finally { process.on = realOn; }
}

/** Load the bundle. baseline mode: no-op truncatePropertyDescribes via a temp patched copy in dist/. */
function loadBundle(mode) {
  const src = fs.readFileSync(DIST, 'utf8');
  let entryPath = DIST;
  let tempFile = null;
  if (mode === 'baseline') {
    const sig = 'function truncatePropertyDescribes(node, depth, seen) {';
    const i = src.indexOf(sig);
    if (i === -1) throw new Error('baseline mode: truncatePropertyDescribes signature not found in dist/index.js — bundle has no Lever-1 walker?');
    const patched = src.slice(0, i + sig.length) + '\n  return; /* WIRE-HARNESS NO-OP */' + src.slice(i + sig.length);
    tempFile = path.join(ROOT, 'dist', '.wire_harness_baseline_tmp.cjs');
    fs.writeFileSync(tempFile, patched, 'utf8');
    entryPath = tempFile;
  }
  try {
    return require(entryPath);
  } finally {
    if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

async function runOnce(mode, god) {
  const zodToJsonSchema = loadZodToJsonSchema();
  let providerFn;
  const ctx = {
    withConfigSchematics: () => {},
    withPromptPreprocessor: () => {},
    withToolsProvider: (fn) => { providerFn = fn; },
  };
  silenceSignals(() => loadBundle(mode).main(ctx));
  if (!providerFn) throw new Error('toolsProvider was never registered — main() path changed?');

  // The built KVConfigSchematics stores fields in a Map (not plain keys) — obtainField().defaultValue
  // is the production default for each toggle (= stock LM Studio config state).
  const ctl = {
    getPluginConfig: (schematics) => ({
      get: (k) => {
        if (god && k === 'godMode') return true;
        try { return schematics.obtainField(k).defaultValue; } catch { return undefined; }
      },
    }),
  };

  const tools = await providerFn(ctl);

  // The SDK's own LLM-tool conversion reads `tool.parametersSchema` (verified in @lmstudio/sdk/dist/index.mjs);
  // keep a fallback to `parameters` for any tool variant that stores the schema there.
  const paramKeySeen = { parametersSchema: 0, parameters: 0 };
  let diagShown = false;
  const rows = [];
  let totalChars = 0, paramChars = 0, descChars = 0, nameChars = 0, convErrors = 0;
  for (const t of tools) {
    const useSchemaKey = t.parametersSchema !== undefined;
    const schemaObj = useSchemaKey ? t.parametersSchema : t.parameters;
    paramKeySeen[useSchemaKey ? 'parametersSchema' : 'parameters'] += 1;
    let paramsJson, convErr;
    try {
      paramsJson = JSON.stringify(zodToJsonSchema(schemaObj));
    } catch (e) {
      paramsJson = null; convErrors += 1; convErr = e && e.message;
      if (!diagShown) {
        diagShown = true;
        console.log('[diag] first conversion error:', String(convErr).slice(0, 200), '| schema is', schemaObj === undefined ? 'undefined' : (schemaObj.constructor && schemaObj.constructor.name));
      }
    }
    const wireFn = {
      name: typeof t.name === 'string' ? t.name : '',
      description: typeof t.description === 'string' ? t.description : '',
      parameters: paramsJson === null ? null : JSON.parse(paramsJson),
    };
    const wireChars = JSON.stringify(wireFn).length;
    totalChars += wireChars;
    paramChars += paramsJson ? paramsJson.length : 0;
    descChars += wireFn.description.length;
    nameChars += wireFn.name.length;
    rows.push({ name: t.name, chars: wireChars });
  }

  return {
    mode, god,
    toolCount: tools.length,
    paramKeySeen, convErrors,
    totalChars,      // Σ full wire function objects (name + description + parameters as the host sends them)
    paramChars,      // Σ parameters JSON only ("param mass")
    descChars,       // Σ tool-level description chars
    nameChars,       // Σ name chars
    tokensEstTotal: Math.round(totalChars / 4),
    tokensEstParams: Math.round(paramChars / 4),
    top10: rows.sort((a, b) => b.chars - a.chars).slice(0, 10),
  };
}

function printReport(r) {
  const tag = '[' + r.mode + (r.god ? ' GOD' : '') + ']';
  console.log('');
  console.log('=== wire harness ' + tag + ' ===');
  console.log('tools:            ' + r.toolCount);
  console.log('schema key seen:  ' + JSON.stringify(r.paramKeySeen) + (r.convErrors ? ' | CONVERSION ERRORS: ' + r.convErrors : ''));
  console.log('total wire chars: ' + r.totalChars);
  console.log('param-only chars: ' + r.paramChars);
  console.log('desc chars:       ' + r.descChars);
  console.log('tokens (chars/4): total=' + r.tokensEstTotal + ' params=' + r.tokensEstParams);
  console.log('top-10 tools by wire size:');
  for (const row of r.top10) console.log('  ' + String(row.chars).padStart(7) + '  ' + row.name);
}

(async () => {
  const args = process.argv.slice(2);
  const god = args.includes('--god');
  const modeArg = args.find(a => !a.startsWith('--')) || 'both';
  if (!['current', 'baseline', 'both'].includes(modeArg)) {
    console.error('usage: node scripts/wire_harness.cjs [current|baseline|both] [--god]');
    process.exit(2);
  }
  const results = [];
  for (const mode of modeArg === 'both' ? ['baseline', 'current'] : [modeArg]) {
    try {
      const r = await runOnce(mode, god);
      printReport(r);
      results.push(r);
    } catch (e) {
      console.error('[' + mode + '] FAILED: ' + e.message);
      process.exitCode = 1;
    }
  }
  if (results.length === 2 && !process.exitCode) {
    const b = results[0], c = results[1]; // baseline first, current second
    console.log('');
    console.log('=== DELTA (baseline -> current) ===');
    console.log('tools:   ' + b.toolCount + ' -> ' + c.toolCount);
    console.log('total chars saved:  ' + Math.max(0, b.totalChars - c.totalChars) + ' (' + ((1 - c.totalChars / b.totalChars) * 100).toFixed(2) + '%)');
    console.log('param chars saved:  ' + Math.max(0, b.paramChars - c.paramChars) + (b.paramChars > 0 ? ' (' + ((1 - c.paramChars / b.paramChars) * 100).toFixed(2) + '%)' : ''));
    console.log('tokens est saved:   total=' + (b.tokensEstTotal - c.tokensEstTotal) + ' params=' + (b.tokensEstParams - c.tokensEstParams));
  }
  // Force exit — the bundle may hold lazy timers/handles (StateManager, browser cleanup) that would keep node alive.
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('harness fatal:', e); process.exit(1); });
