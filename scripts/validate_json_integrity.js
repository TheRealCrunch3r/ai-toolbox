/**
 * validate_json_integrity.js — JSON integrity gate (16.11.2026, package.json corruption postmortem).
 *
 * WHY THIS EXISTS:
 * A doc re-stamp round wrote package.json back via Buffer.from(s, 'binary') after a UTF-8 string read.
 * That is byte-exact for ASCII + CRLF but silently corrupts every non-ASCII char:
 *   U+2014 (E2 80 94) -> single byte 0x14 (DC-4 control char, kills JSON.parse)
 *   U+00B7 (C2 B7)    -> bare byte 0xB7 (invalid UTF-8 -> U+FFFD or "Bad control character")
 * The file still parsed for some tools' expectations / looked fine visually, so it survived every gate.
 * This script is the standing regression guard: run after ANY round of scripted edits to JSON files.
 *
 * CHECKS PER FILE (hard-fail on any violation):
 *   1. Strict-UTF-8 byte validity (TextDecoder fatal) — catches bare continuation bytes like lone 0xB7.
 *   2. No U+FFFD replacement char anywhere in the decoded text.
 *   3. JSON.parse succeeds (strict) — catches control chars inside string literals and syntax damage.
 *   4. No genuine control chars outside TAB/LF/CR (e.g. DC-4, DEL).
 * INFO ONLY (never fails): CRLF vs bare-LF split per file.
 *
 * Usage: node scripts/validate_json_integrity.js [file ...]   (default = DEFAULT_TARGETS below)
 * Exit code 0 = all good, 1 = violations found. No dependencies beyond Node stdlib.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// The parse-critical JSON surfaces for npm/node/jest/tsc/eslint in this repo.
// package-lock.json is excluded from defaults by size; pass it explicitly on version-bump rounds:
//   node scripts/validate_json_integrity.js package-lock.json
const DEFAULT_TARGETS = [
  'package.json',
  'manifest.json',
  'tsconfig.json'
];

function fail(file, msg) {
  console.error(`FAIL ${file}: ${msg}`);
  return false;
}

let allOk = true;
const files = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_TARGETS.map(f => path.join(__dirname, '..', f));

for (const file of files) {
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch (e) {
    allOk = false;
    fail(file, `cannot read: ${e.message}`);
    continue;
  }

  const rel = path.relative(path.join(__dirname, '..'), file) || file;

  // 1) strict UTF-8 byte validity (fatal decoder — any bare continuation/lead byte throws)
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch (e) {
    allOk = false;
    fail(rel, `invalid strict UTF-8 (${e.message}) — classic Buffer.from(s,'binary') re-encoding damage`);
    continue;
  }

  // 2) U+FFFD replacement char must never appear (silent-content corruption marker)
  if (text.includes('\uFFFD')) {
    allOk = false;
    fail(rel, 'U+FFFD replacement character present — non-ASCII content was corrupted');
  } else {
    console.log(`OK   ${rel}: strict UTF-8 valid, no U+FFFD`);
  }

  // 3) JSON.parse (strict) — control chars inside string literals land here ("Bad control character ...")
  try {
    JSON.parse(text);
  } catch (e) {
    allOk = false;
    fail(rel, `JSON.parse failed: ${String(e.message).slice(0, 160)}`);
    continue;
  }
  console.log(`OK   ${rel}: JSON.parse passed`);

  // 4) genuine control chars outside TAB/LF/CR (DEL + C0 block except \t\n\r)
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) {
    allOk = false;
    fail(rel, 'genuine control character present (TAB/LF/CR allowed) — file is not JSON-safe');
  } else {
    console.log(`OK   ${rel}: no stray control characters`);
  }

  // INFO: line-ending split
  let crlf = 0;
  let bareLf = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0a) {
      if (i > 0 && buf[i - 1] === 0x0d) crlf++;
      else bareLf++;
    }
  }
  const style = bareLf === 0 ? 'CRLF' : crlf === 0 ? 'LF' : `MIXED (${crlf} CRLF / ${bareLf} LF)`;
  console.log(`INFO ${rel}: line endings ${style}`);
}

if (!allOk) {
  console.error('\nJSON INTEGRITY GATE: FAILED — do NOT commit/publish. Restore from git or repair byte-exact, then re-run.');
  process.exit(1);
}
console.log('\nJSON INTEGRITY GATE: all files clean');
process.exit(0);
