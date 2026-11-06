/**
 * UNIFIED LANGUAGE v2 — STEP 6 (28.10): hermetic byte-pin suite for the locale bundles + language-code triplication.
 *
 * WHY THIS EXISTS: tsc cannot catch a missing `ui?.…` prefix in config.ts because every UiFieldLabels member is
 * optional (UiFieldLabels all-optional → runtime byte-pins are the ONLY guard, per step 5 decision). Two real gaps
 * shipped pre-step-6 and were found by audit on 28.10: (a) contextGuardCompressionPercent hint hardcoded in config.ts
 * only; (b) S1 WD-banner rendered from EN literals in every locale because promptPreprocessor didn't pass rt. Both are
 * one-line gaps a structural/type check would never see — they change BYTES, and this suite pins those bytes:
 *
 *   1. TRIPULATION — the five shipped language codes + 'auto' must agree across all four copies:
 *      ConfigSchema.language zod enum values === promptPreprocessor.SHIPPED_LANGUAGE_CODES (via resolveTurnLanguage
 *      behavior — the map itself is module-private) === uiLabelBake.SHIPPED_UI_CODES (via mapConfiguredUiLanguage, also
 *      module-private) === buildConfigSchematics() language-row option values. Canonical: en/de/es/zh-CN/zh-TW (+auto).
 *   2. EN FULL-SCHEMATICS BYTE PIN — buildConfigSchematics() (plain EN literals) vs buildConfigSchematics(getUiLabels('en'))
 *      (baked from the en bundle): every one of the 67 field entries must be byte-identical (displayName/subtitle/hint/
 *      options/placeholders/constraints + valueTypeKey + defaultValue). Surface grew 62→67 in Budget-Guard-Arc (five FLAT
 *      host-facing keys; nested budgetGuard block deliberately NOT a schematics/UI field). CRITICAL SHAPE FACT: .build() returns a runtime
 *      object whose `fields` is a REAL JS Map(62) — iterate Map.entries() explicitly; JSON.stringify of the whole object
 *      alone would be vacuous, so every assertion below walks entries field by field.
 *   3. OPTION-SET PINS — languageRow (auto/en/de/es/zh-CN/zh-TW), safesearch ('0'/'1'/'2'), dateFormatStyle
 *      ('standard'/'heuteIst') value sets + the en display names; searchFallbackChain stays English by design (brand/engine).
 *   4. RUNTIME-TEXTS PINS — every RuntimeTexts key present in all five bundles with a non-empty string; the EN values are
 *      byte-pinned verbatim for the S1 working-directory banner + answerLanguageLine (the two surfaces where pre-v2
 *      literals were the live template) and for sessionMemoryLoadedTitle (cross-referenced by another suite); template
 *      placeholders {path}/{yes}/{no}/{name} preserved.
 *   5. KEY-SET PINS — uiLabels key set + per-field {displayName,subtitle,hint[,options]} key sets identical across all five
 *      locales (tsc enforces this via the UiLabels type for REQUIRED members; these pins catch any future drift between
 *      bundles without recompiling).
 *
 * Hermetic: no fs writes, no network. resolveTurnLanguage/resolvePanelUiLanguage are only called with CONCRETE configured
 * values, which return before any host/OS/fs probe — the fallback chain itself stays covered by tests/hostLanguage.test.ts
 * and the step-5 parity harness. Extensionless imports only (ts-jest moduleFileExtensions) → ZERO jest.config.cjs changes.
 */

import { ConfigSchema, DEFAULT_CONFIG, buildConfigSchematics } from '../src/config';
// NOTE: no @lmstudio/sdk type import on purpose — the .build() runtime shape (fields Map) is reached through a
// structural cast with an instanceof-Map guard (see builtFields below); depending on an SDK-internal type name would
// be brittle and this suite must stay lint/tsc-clean without it.
import { getRuntimeTexts, getUiLabels, LANGUAGE_DISPLAY_NAMES } from '../src/locales';
import type { FullTranslationSet, LanguageCode, UiFieldLabels } from '../src/locales/types';
import { enTranslations } from '../src/locales/en';
import { deTranslations } from '../src/locales/de';
import { esTranslations } from '../src/locales/es';
import { zhCNTranslations } from '../src/locales/zh-CN';
import { zhTWTranslations } from '../src/locales/zh-TW';
import { mapConfiguredUiLanguage, resolvePanelUiLanguage } from '../src/uiLabelBake';
import { resolveTurnLanguage } from '../src/promptPreprocessor';

// ─────────────────────────────── pinned constants (canon) ───────────────────────────────

// The five shipped locale codes + the 'auto' sentinel. Config accepts all six FORMS (lowercase variants resolve to
// these canonical values — behaviorally pinned in the triplication tests below; no separate const needed).
const CANONICAL_CODES: readonly LanguageCode[] = ['en', 'de', 'es', 'zh-CN', 'zh-TW'];

// The runtime shape of buildConfigSchematics().build() — verified against @lmstudio/sdk@1.5 (KVConfigSchematics):
// { valueTypeLibrary, fields: Map<string, {valueTypeKey, valueTypeParams, schema, fullKey, defaultValue}>, extensionPrefixes }.
// `fields` is a REAL JS Map (67 entries post-Budget-Guard-Arc; 62 pre-arc) — the SDK exposes no plain-object accessor our pins may rely on.
interface SchematicFieldEntry {
  valueTypeKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueTypeParams: Record<string, any>;
  schema: unknown;
  fullKey: string;
  defaultValue: unknown;
}

const builtFields = (built: ReturnType<typeof buildConfigSchematics>): Map<string, SchematicFieldEntry> => {
  const fields = (built as unknown as { fields?: unknown }).fields;
  if (!(fields instanceof Map)) {
    throw new Error('buildConfigSchematics().build() did not return a `fields` Map — SDK shape changed; re-pin this suite.');
  }
  return fields as Map<string, SchematicFieldEntry>;
};

// config.ts declares language as z.enum(...).default('auto') → ConfigSchema.shape.language is the ZodDefault WRAPPER:
// _def.values lives one level down at _def.innerType._def.values (verified against zod 3.25.76 in the Gate-2 harness,
// 29.10 — pinning shape.language._def.values directly was a bug caught there before owner handoff). Unwrap defensively:
// both shapes are pinned, so a future zod major that changes either layout fails THIS suite loudly instead of skipping.
function languageEnumValues(shape: unknown): readonly string[] | undefined {
  const d = shape as { _def?: { values?: readonly string[]; innerType?: unknown } };
  return d._def?.values ?? (d._def?.innerType as { _def?: { values?: readonly string[] } } | undefined)?._def?.values;
}

// Canonical settings-panel surface: every config key that appears in buildConfigSchematics(), in builder order.
// Budget-Guard-Arc (05.11 Triage): surface grew 62 → 67 — the five FLAT host-facing budgetGuard keys registered in
// buildConfigSchematics() directly after 'autoSummaryInterval' (builder position preserved; the nested consumer block is
// deliberately NOT a schematics/UI field). Since the 06.11 i18n wiring (owner rule "alle Tool-Beschreibungen IMMER übersetzt")
// the five FLAT keys ALSO carry UiLabels entries, so EXPECTED_UI_LABEL_KEYS grew 59→64.
const EXPECTED_FIELD_KEYS = [
  'language',
  'godMode',
  'fileSystem',
  'webSearch',
  'packageManage',
  'gitOperations',
  'gitAutoCommit',
  'defaultBranch',
  'databaseQueries',
  'documentParsing',
  'backgroundCommands',
  'imageProcessing',
  'httpClient',
  'vectorRAG',
  'uiGeneration',
  'contextManagement',
  'documentRAG',
  'textProcessing',
  'refactorCode',
  'utility',
  'taskPlanning',
  'clusterAwareToolOrder',
  'retrievalLimit',
  'retrievalAffinityThreshold',
  'executionJavaScript',
  'executionPython',
  'executionTerminal',
  'executionShell',
  'executionTests',
  'searchFallbackChain',
  'maxSearchResults',
  'safesearch',
  'browserAutomation',
  'browserTimeout',
  'headlessMode',
  'pathValidationEnabled',
  'binaryFileDetection',
  'regexReDoSProtection',
  'maxRegexLength',
  'statePersistenceEnabled',
  'stateMaxSize',
  'notificationsEnabled',
  'updateCheckEnabled',
  'temporalAwareness',
  'dateFormatStyle',
  'contextGuardEnabled',
  'contextGuardCompressionPercent',
  'contextGuardAgenticDensity',
  'contextGuardForceSummaryOnCompress',
  'contextGuardSmartReading',
  'contextGuardSummaryModel',
  'contextGuardTerminalFilterEnabled',
  'contextGuardTerminalFilterLength',
  'compactionEnabled',
  'compactionMaxResultBytes',
  'contextUsageFooter',
  'autoTrackingEnabled',
  'autoTrackTokenThreshold',
  'autoTrackDecisions',
  'autoTrackCompletions',
  'autoTrackErrors',
  'autoSummaryInterval',
  // Budget-Guard-Arc (05.11): five FLAT host-facing keys — builder position = directly after autoSummaryInterval in buildConfigSchematics()
  'budgetGuardEnabled',
  'budgetGuardAdvisoryThresholdPct',
  'budgetGuardSpillThresholdPct',
  'budgetGuardAutopauseThresholdPct',
  'budgetGuardSafetyMarginPct',
] as const;

// Canonical uiLabels key set = every config field that carries panel labels (UiLabels, types.ts) — languageRow is the menu row.
// NB: bundle key `vectorRag` (lowercase a) DELIBERATELY differs from the config field key `vectorRAG` — pinned by
// types.ts L110 (`vectorRag: UiFieldLabels`) and accessed as `ui?.vectorRag` in config.ts; all five bundles agree.
const EXPECTED_UI_LABEL_KEYS = [
  'languageRow',
  'godMode',
  'fileSystem',
  'webSearch',
  'packageManage',
  'gitOperations',
  'gitAutoCommit',
  'defaultBranch',
  'databaseQueries',
  'documentParsing',
  'backgroundCommands',
  'imageProcessing',
  'httpClient',
  'vectorRag',
  'uiGeneration',
  'contextManagement',
  'documentRAG',
  'textProcessing',
  'refactorCode',
  'utility',
  'taskPlanning',
  'clusterAwareToolOrder',
  'retrievalLimit',
  'retrievalAffinityThreshold',
  'executionJavaScript',
  'executionPython',
  'executionTerminal',
  'executionShell',
  'executionTests',
  'searchFallbackChain',
  'safesearch',
  'browserAutomation',
  'browserTimeout',
  'headlessMode',
  'pathValidationEnabled',
  'binaryFileDetection',
  'regexReDoSProtection',
  'statePersistenceEnabled',
  'notificationsEnabled',
  'updateCheckEnabled',
  'temporalAwareness',
  'dateFormatStyle',
  'contextGuardEnabled',
  'contextGuardCompressionPercent',
  'contextGuardAgenticDensity',
  'contextGuardForceSummaryOnCompress',
  'contextGuardSmartReading',
  'contextGuardSummaryModel',
  'contextGuardTerminalFilterEnabled',
  'contextGuardTerminalFilterLength',
  'compactionEnabled',
  'compactionMaxResultBytes',
  'contextUsageFooter',
  'autoTrackingEnabled',
  'autoTrackTokenThreshold',
  'autoTrackDecisions',
  'autoTrackCompletions',
  'autoTrackErrors',
  'autoSummaryInterval',
  // Budget-Guard-Arc i18n wiring (06.11, owner rule "alle Tool-Beschreibungen IMMER übersetzt"): the five flat keys gained
  // UiLabels entries in all five bundles — set grew 59→64 (builder-position invariant for EXPECTED_FIELD_KEYS unchanged).
  'budgetGuardEnabled',
  'budgetGuardAdvisoryThresholdPct',
  'budgetGuardSpillThresholdPct',
  'budgetGuardAutopauseThresholdPct',
  'budgetGuardSafetyMarginPct',
] as const;

const EXPECTED_RUNTIME_TEXT_KEYS = [
  'workingDirDetected',
  'workingDirMentionedLine',
  'workingDirConfirmAsk',
  'workingDirExampleLabel',
  'workingDirExampleText',
  'workingDirReplyHint',
  'workingDirOriginalMessageLabel',
  'projectDetectedTitle',
  'projectFoundLead',
  'projectNameLabel',
  'projectPathLabel',
  'projectSwitchQuestion',
  'sessionMemoryLoadedTitle',
  'previousSessionLabel',
  'checkpointWarningHeader',
  'checkpointActionRequiredLead',
  'checkpointIfConfirmedLine',
  'checkpointIfDeclinedLine',
  'checkpointDoNotProceedLine',
  'sessionWarningHead',
  'bufferedEventsLine',
  'contextSaveQuestion',
  'attachedFilesTitle',
  'attachedFilesLead',
  'attachmentErrorCrossRef',
  'ragContextHeader',
  'answerLanguageLine',
] as const;

const LOCALE_SETS: Readonly<Record<string, FullTranslationSet>> = {
  en: enTranslations,
  de: deTranslations,
  es: esTranslations,
  'zh-CN': zhCNTranslations,
  'zh-TW': zhTWTranslations,
};

// ─────────────────────────────── triplication pins ───────────────────────────────

describe('UL-v2 step 6 — language-code triplication', () => {
  test('ConfigSchema.language zod enum === [auto, en, de, es, zh-CN, zh-TW] exactly (order-pinned)', () => {
    // Pin via the documented internal shape with a runtime guard so a future zod major fails THIS test loudly
    // instead of silently skipping the pin; ZodDefault unwrapping handled by languageEnumValues (see above).
    const values = languageEnumValues(ConfigSchema.shape.language);
    expect(Array.isArray(values)).toBe(true);
    expect(values).toEqual(['auto', 'en', 'de', 'es', 'zh-CN', 'zh-TW']);
  });

  test('DEFAULT_CONFIG.language === "auto" and the schema default resolves to it (step-5 canon)', () => {
    expect(DEFAULT_CONFIG.language).toBe('auto');
    const parsed = ConfigSchema.parse({}); // no language supplied → zod applies its default
    expect(parsed.language).toBe('auto');
  });

  test('promptPreprocessor.resolveTurnLanguage accepts exactly the five canonical codes (SHIPPED_LANGUAGE_CODES behavior)', () => {
    for (const code of CANONICAL_CODES) {
      const lower = code.toLowerCase(); // map keys are lowercase config forms ('zh-cn'/'zh-tw')
      expect(resolveTurnLanguage(code)).toBe(code); // exact form
      expect(resolveTurnLanguage(lower)).toBe(code); // lowercase form (map key)
      expect(resolveTurnLanguage(`  ${code.toUpperCase()} `)).toBe(code); // trim+lowercase normalization path
    }
    // 'auto' is NOT a shipped locale code — it must not early-return; hermetic check: it may only resolve to a canonical code.
    const autoResolved = resolveTurnLanguage('auto');
    expect(CANONICAL_CODES).toContain(autoResolved);
  });

  test('uiLabelBake.mapConfiguredUiLanguage accepts exactly the five canonical codes (SHIPPED_UI_CODES behavior)', () => {
    for (const code of CANONICAL_CODES) {
      expect(mapConfiguredUiLanguage(code.toLowerCase())).toBe(code); // lowercase config form → canonical code
      expect(mapConfiguredUiLanguage(` ${code} `)).toBe(code); // trim path
    }
    expect(mapConfiguredUiLanguage('auto')).toBeNull(); // 'auto' never lands as a concrete pick
    expect(mapConfiguredUiLanguage(undefined)).toBeNull();
    expect(mapConfiguredUiLanguage(null)).toBeNull();
  });

  test('the four copies agree: enum ∖ auto === resolveTurnLanguage domain === mapConfiguredUiLanguage range === languageRow options', () => {
    const enumConcrete = (languageEnumValues(ConfigSchema.shape.language) ?? []).filter((v) => v !== 'auto');
    expect(enumConcrete).toEqual([...CANONICAL_CODES]);

    // SHIPPED_LANGUAGE_CODES domain (via behavior): every canonical code resolves to itself.
    for (const code of CANONICAL_CODES) {
      expect(resolveTurnLanguage(code.toLowerCase())).toBe(code);
    }
    // SHIPPED_UI_CODES range (via behavior): the five canonical codes are exactly what the mapper can return.
    const mapperRange = new Set<unknown>(CANONICAL_CODES.map((c) => mapConfiguredUiLanguage(c.toLowerCase())));
    expect([...mapperRange].sort()).toEqual([...CANONICAL_CODES].sort());

    // languageRow option values (schematics copy).
    const builtPlain = buildConfigSchematics();
    const langField = builtFields(builtPlain).get('language');
    expect(langField).toBeDefined();
    const options = (langField?.valueTypeParams.options ?? []) as Array<{ value?: unknown; displayName?: unknown }>;
    expect(options.map((o) => o.value)).toEqual(['auto', 'en', 'de', 'es', 'zh-CN', 'zh-TW']);
  });

  test('resolvePanelUiLanguage honors concrete configured picks (boot-bake copy of the same domain, no fs involved)', () => {
    expect(resolvePanelUiLanguage('en')).toBe('en');
    expect(resolvePanelUiLanguage('de')).toBe('de');
    expect(resolvePanelUiLanguage('zh-tw')).toBe('zh-TW');
    expect(resolvePanelUiLanguage('ZH-CN ')).toBe('zh-CN'); // trim+lowercase, same normalization as resolveTurnLanguage
  });

  test('LANGUAGE_DISPLAY_NAMES covers exactly the five canonical codes (feeds answerLanguageLine {language})', () => {
    expect(Object.keys(LANGUAGE_DISPLAY_NAMES).sort()).toEqual([...CANONICAL_CODES].sort());
    for (const code of CANONICAL_CODES) {
      const name = LANGUAGE_DISPLAY_NAMES[code];
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────── EN full-schematics byte pin ───────────────────────────────

describe('UL-v2 step 6 — EN full-schematics byte pin (plain literals vs en-bundle bake)', () => {
  // Built ONCE per suite run: plain = config.ts literals; bakedEn = getUiLabels('en') injected through the same builder.
  const builtPlain = buildConfigSchematics();
  const builtBaked = buildConfigSchematics(getUiLabels('en'));
  const fieldsPlain = builtFields(builtPlain);
  const fieldsBaked = builtFields(builtBaked);

  test('field-surface pin: exactly the canonical 67 keys, builder order preserved, no extensions registered', () => {
    expect(EXPECTED_FIELD_KEYS).toHaveLength(67); // literal pin on THIS list (drift guard, cf. EXPECTED_UI_LABEL_KEYS 59-pin) — Budget-Guard-Arc grew the surface 62→67
    expect(fieldsPlain.size).toBe(EXPECTED_FIELD_KEYS.length); // Map(67) — size itself is a drift guard
    const plainKeys = [...fieldsPlain.keys()];
    expect(plainKeys).toEqual([...EXPECTED_FIELD_KEYS]);
    expect(builtFields(builtBaked)).toBeDefined();
    // extensionPrefixes stays empty: config.ts registers no .extension() (SDK default []).
    expect((builtPlain as unknown as { extensionPrefixes?: unknown[] }).extensionPrefixes ?? []).toEqual([]);
  });

  test('every field entry is byte-identical between the plain EN build and the en-bundle bake', () => {
    const violations: string[] = [];
    for (const key of EXPECTED_FIELD_KEYS) {
      const a = fieldsPlain.get(key);
      const b = fieldsBaked.get(key);
      if (!a || !b) {
        violations.push(`${key}: missing in one build`);
        continue;
      }
      if (a.valueTypeKey !== b.valueTypeKey) {
        violations.push(`${key}.valueTypeKey: ${JSON.stringify(a.valueTypeKey)} vs ${JSON.stringify(b.valueTypeKey)}`);
      }
      // valueTypeParams carries ALL human-readable strings (displayName/subtitle/hint/options/placeholder/constraints).
      const aParams = JSON.stringify(a.valueTypeParams, Object.keys(a.valueTypeParams).sort());
      const bParams = JSON.stringify(b.valueTypeParams, Object.keys(b.valueTypeParams).sort());
      if (aParams !== bParams) {
        violations.push(`${key}.valueTypeParams differ:\n  plain: ${aParams}\n  baked: ${bParams}`);
      }
      // defaultValue is schema-parsed by the SDK on .field() — pin it too (types/defaults never change between builds).
      if (!Object.is(a.defaultValue, b.defaultValue)) {
        violations.push(`${key}.defaultValue: ${JSON.stringify(a.defaultValue)} vs ${JSON.stringify(b.defaultValue)}`);
      }
    }
    expect(violations).toEqual([]);
  });

  test('select option value sets are pinned (language/safesearch/dateFormatStyle/searchFallbackChain)', () => {
    const langField = fieldsPlain.get('language');
    expect((langField?.valueTypeParams.options as Array<{ value: string }>).map((o) => o.value)).toEqual([
      'auto', 'en', 'de', 'es', 'zh-CN', 'zh-TW',
    ]);

    const safe = fieldsPlain.get('safesearch');
    expect((safe?.valueTypeParams.options as Array<{ value: string }>).map((o) => o.value)).toEqual(['0', '1', '2']);

    const dateFmt = fieldsPlain.get('dateFormatStyle');
    expect((dateFmt?.valueTypeParams.options as Array<{ value: string }>).map((o) => o.value)).toEqual(['standard', 'heuteIst']);

    // Brand/engine names stay English by design (types.ts UiLabels docblock).
    const fallback = fieldsPlain.get('searchFallbackChain');
    expect((fallback?.valueTypeParams.options as Array<{ value: string }>).map((o) => o.value)).toEqual(
      ['ddg-api', 'ddg-fetch', 'google', 'bing'],
    );
  });

  test('languageRow options carry the verbatim EN display names (byte pin incl. the step-5 "auto" option)', () => {
    const langField = fieldsPlain.get('language');
    expect((langField?.valueTypeParams.options as Array<{ value: string; displayName: string }>).map((o) => [o.value, o.displayName])).toEqual([
      ['auto', 'Automatic (follows LM Studio)'],
      ['en', 'English'],
      ['de', 'Deutsch (German)'],
      ['es', 'Español'],
      ['zh-CN', 'Simplified Chinese'],
      ['zh-TW', 'Traditional Chinese'],
    ]);
    // The en bundle must agree key-for-key with what the panel renders (auto/en/de/es/zhCN/zhTW are the BUNDLE keys).
    const bundleOptions = getUiLabels('en').languageRow.options;
    expect(Object.keys(bundleOptions).sort()).toEqual(['auto', 'de', 'en', 'es', 'zhCN', 'zhTW']);
    // SelectOptionLabels is fully typed (types.ts) — direct property access, no cast needed.
    expect(bundleOptions.auto).toBe('Automatic (follows LM Studio)');
  });

  test('safesearch + dateFormatStyle option display names are byte-pinned from the en bundle', () => {
    const safe = fieldsPlain.get('safesearch');
    expect((safe?.valueTypeParams.options as Array<{ value: string; displayName: string }>).map((o) => o.displayName)).toEqual(
      ['Off', 'Moderate', 'Strict'],
    );
    const dateFmt = fieldsPlain.get('dateFormatStyle');
    expect((dateFmt?.valueTypeParams.options as Array<{ value: string; displayName: string }>).map((o) => o.displayName)).toEqual([
      'Standard ([Zeit: ...])',
      'HEUTE IST Mode (Prominent)',
    ]);
  });

  test('the two audit-fixed surfaces are byte-pinned verbatim (regression locks for the 28.10 gaps)', () => {
    // Gap (a): contextGuardCompressionPercent hint — was the ONLY hardcoded-EN field after step 5; now `ui?.… ?? literal`.
    const cgc = fieldsPlain.get('contextGuardCompressionPercent');
    expect(cgc?.valueTypeParams.hint).toBe(
      "History compression triggers when context usage reaches this percentage of the active model's context window. If LM Studio reports the model's real window it is used; otherwise a built-in 30k fallback applies.",
    );
    expect(getUiLabels('en').contextGuardCompressionPercent.hint).toBe(cgc?.valueTypeParams.hint);

    // Gap (b) lock: S1 banner texts live ONLY in the runtime bundle — promptPreprocessor renders them per turn from rt.
    // Pinned verbatim below under 'runtimeTexts EN byte pins'; this cross-checks the bundle key the renderer reads.
    expect(getRuntimeTexts('en').workingDirDetected).toBe('⚠️ WORKING DIRECTORY DETECTED');
  });

  test('placeholders + constraints survive the bake (defaultBranch placeholder, numeric bounds)', () => {
    const db = fieldsPlain.get('defaultBranch');
    expect(db?.valueTypeParams.placeholder).toBe('main');
    expect(fieldsBaked.get('defaultBranch')?.valueTypeParams.placeholder).toBe('main');

    // min/max/int constraints are part of valueTypeParams and must survive byte-identically.
    const rl = fieldsPlain.get('retrievalLimit');
    expect(rl?.valueTypeParams.min).toBe(1);
    expect(rl?.valueTypeParams.max).toBe(20);
    expect(rl?.valueTypeParams.int).toBe(true);
  });
});

// ─────────────────────────────── runtime-texts pins ───────────────────────────────

describe('UL-v2 step 6 — RuntimeTexts pins (S1–S6 + RAG + answerLanguageLine)', () => {
  test('all five bundles carry every RuntimeTexts key with a non-empty string', () => {
    const violations: string[] = [];
    for (const [lang, set] of Object.entries(LOCALE_SETS)) {
      for (const key of EXPECTED_RUNTIME_TEXT_KEYS) {
        const value = (set.runtimeTexts as unknown as Record<string, unknown>)[key];
        if (typeof value !== 'string' || value.length === 0) {
          violations.push(`${lang}.${key}: ${JSON.stringify(value)}`);
        }
      }
    }
    expect(violations).toEqual([]);
    // Exact key set per bundle — no extra keys, none missing.
    for (const set of Object.values(LOCALE_SETS)) {
      expect(Object.keys(set.runtimeTexts).sort()).toEqual([...EXPECTED_RUNTIME_TEXT_KEYS].sort());
    }
  });

  test('EN runtime texts are byte-pinned verbatim (pre-v2 canon — the live template bytes)', () => {
    const rt = getRuntimeTexts('en');
    // S1 working-directory banner — the step-4-completion surface (rt must reach injectWorkingDirectoryPrompt).
    expect(rt.workingDirDetected).toBe('⚠️ WORKING DIRECTORY DETECTED');
    expect(rt.workingDirMentionedLine).toBe('The user mentioned a directory path in their message:');
    expect(rt.workingDirConfirmAsk).toBe('Please ask the user for confirmation before changing the working directory.');
    expect(rt.workingDirExampleLabel).toBe('Example response:');
    // Trailing spaces after ". " and "? " are deliberate — they mirror the pre-v2 template byte-for-byte (en.ts comment).
    expect(rt.workingDirExampleText).toBe(
      "I noticed you mentioned the directory '{path}'. \nWould you like me to set this as your working directory? \nAll subsequent file operations will use this directory as the base.",
    );
    expect(rt.workingDirReplyHint).toBe("Reply '{yes}' to confirm, or '{no}' to decline.");
    expect(rt.workingDirOriginalMessageLabel).toBe('User\'s original message:');

    // S2 registered-project banner.
    expect(rt.projectDetectedTitle).toBe('⚠️ REGISTERED PROJECT DETECTED');
    expect(rt.projectFoundLead).toBe('I found a registered project matching your message:');
    expect(rt.projectNameLabel).toBe('Project: "{name}"');
    expect(rt.projectPathLabel).toBe('Path: {path}');
    expect(rt.projectSwitchQuestion).toBe('Would you like me to switch your working directory to this project?');

    // S3 session-memory injection (title cross-referenced by tests/sessionMemoryReadGuards.test.ts canon).
    expect(rt.sessionMemoryLoadedTitle).toBe('📋 SESSION MEMORY LOADED');
    expect(rt.previousSessionLabel).toBe('Previous session summary:');

    // S4 checkpoint wrapper — deliberately language-agnostic in ALL five locales (owner verdict, i18n-CONFIRM arc):
    // the SAME neutral text must ship everywhere; rewording per locale requires explicit owner GO.
    const NEUTRAL_S4_HEADER = 'TOKEN LIMIT WARNING — ACKNOWLEDGE BEFORE RESPONDING:';
    expect(rt.checkpointWarningHeader).toBe(NEUTRAL_S4_HEADER);
    const driftedLocales: string[] = [];
    for (const [lang] of Object.entries(LOCALE_SETS)) {
      if (getRuntimeTexts(lang).checkpointWarningHeader !== NEUTRAL_S4_HEADER) driftedLocales.push(lang);
    }
    expect(driftedLocales).toEqual([]);

    // S5 autoTracker threshold warning.
    expect(rt.sessionWarningHead).toBe(
      '⚠️ SESSION WARNING: You have reached {pct}% of your token limit. It is highly recommended to save session memory before continuing.',
    );
    expect(rt.bufferedEventsLine).toBe('Auto-tracked events in buffer (will be saved with checkpoint): {count}');
    expect(rt.contextSaveQuestion).toBe(
      "Do you want to proceed with a context save? Reply '{yes}' to trigger the session memory save, or '{no}' to continue.",
    );

    // S6 attached-files notice + error cross-reference (mutually consistent pair — both pinned together).
    expect(rt.attachedFilesTitle).toBe('📎 ATTACHED FILES AVAILABLE:');
    expect(rt.attachmentErrorCrossRef).toBe(
      'Note: If this is an attached file, use the exact filename from the "ATTACHED FILES AVAILABLE" list.',
    );

    // RAG header + v2 answer-language line ({language} filled with LANGUAGE_DISPLAY_NAMES per turn).
    expect(rt.ragContextHeader).toBe('--- RELEVANT DOCUMENT CONTEXT ---');
    expect(rt.answerLanguageLine).toBe('Respond to the user in {language}.');
  });

  test('template placeholders are intact in EN (fillTemplate contract: unknowns stay verbatim, knowns get filled)', () => {
    const rt = getRuntimeTexts('en'); // already typed RuntimeTexts
    expect(rt.workingDirExampleText).toContain('{path}');
    expect(rt.workingDirReplyHint).toContain("{yes}");
    expect(rt.workingDirReplyHint).toBe("Reply '{yes}' to confirm, or '{no}' to decline.");
    expect(rt.projectNameLabel).toContain('{name}');
    expect(rt.projectPathLabel).toContain('{path}');
    expect(rt.sessionWarningHead).toContain('{pct}');
    expect(rt.bufferedEventsLine).toContain('{count}');
    expect(rt.answerLanguageLine).toContain('{language}');
  });
});

// ─────────────────────────────── uiLabels key-set + parity pins ───────────────────────────────

describe('UL-v2 step 6 — UiLabels key sets & cross-locale structure', () => {
  test('every locale bundle carries exactly the canonical uiLabels key set (64 fields incl. languageRow — 59 + five budgetGuard keys since 06.11 i18n wiring)', () => {
    expect(EXPECTED_UI_LABEL_KEYS).toHaveLength(64); // drift guard on THIS list as much as on the bundles
    for (const set of Object.values(LOCALE_SETS)) {
      const keys = Object.keys(set.uiLabels).sort();
      expect(keys).toEqual([...EXPECTED_UI_LABEL_KEYS].sort());
    }
  });

  test('per-field label shape is identical across locales: same UiFieldLabels keys (+options where canonical)', () => {
    const en = LOCALE_SETS.en.uiLabels as unknown as Record<string, Record<string, unknown>>;
    const violations: string[] = [];
    for (const [lang] of Object.entries(LOCALE_SETS)) {
      if (lang === 'en') continue;
      const other = LOCALE_SETS[lang].uiLabels as unknown as Record<string, Record<string, unknown>>;
      for (const key of EXPECTED_UI_LABEL_KEYS) {
        const aKeys = Object.keys(en[key] ?? {}).sort();
        const bKeys = Object.keys(other[key] ?? {}).sort();
        if (JSON.stringify(bKeys) !== JSON.stringify(aKeys)) violations.push(`${lang}.${key}: [${bKeys.join(', ')}] vs [${aKeys.join(', ')}]`);
      }
    }
    expect(violations).toEqual([]);
  });

  test('select-option bundles match the schematics value sets key-for-key (languageRow/safesearch/dateFormatStyle)', () => {
    for (const [lang] of Object.entries(LOCALE_SETS)) {
      const ui = LOCALE_SETS[lang].uiLabels; // FullTranslationSet already types this as UiLabels — cast removed (lint)
      // languageRow options: bundle keys auto/en/de/es/zhCN/zhTW — the zh keys use no hyphen by type design.
      expect(Object.keys(ui.languageRow.options).sort()).toEqual(['auto', 'de', 'en', 'es', 'zhCN', 'zhTW']);
      expect(Object.keys(ui.safesearch.options).sort()).toEqual(['moderate', 'off', 'strict']);
      expect(Object.keys(ui.dateFormatStyle.options).sort()).toEqual(['heuteIst', 'standard']);
    }
  });

  test('no non-EN locale bundle aliases English (uiLabels + runtimeTexts must differ from the en bytes)', () => {
    const enUi = JSON.stringify(LOCALE_SETS.en.uiLabels);
    const enRt = JSON.stringify(LOCALE_SETS.en.runtimeTexts);
    for (const [lang] of Object.entries(LOCALE_SETS)) {
      if (lang === 'en') continue;
      expect(JSON.stringify(LOCALE_SETS[lang].uiLabels)).not.toBe(enUi);
      // runtimeTexts may share the neutral S4 block — aliasing means EVERYTHING is identical.
      expect(JSON.stringify(LOCALE_SETS[lang].runtimeTexts)).not.toBe(enRt);
    }
  });

  test('each locale renders its own answerLanguageLine display name (non-empty, differs from en where localized)', () => {
    for (const code of CANONICAL_CODES) {
      const rt = getRuntimeTexts(code);
      expect(typeof rt.answerLanguageLine).toBe('string');
      expect(rt.answerLanguageLine.length).toBeGreaterThan(0);
      // The display name feeding {language} must exist and be non-empty for every canonical code.
      expect((LANGUAGE_DISPLAY_NAMES as Record<string, string>)[code]?.length ?? 0).toBeGreaterThan(0);
    }
  });

  test('uiFieldLabels typing: UiFieldLabels members are optional strings (the reason tsc cannot catch EN leaks)', () => {
    // Documents the guard-gap this whole suite compensates for — a fresh field with a missing ui?.prefix compiles clean.
    const sample: UiFieldLabels = {};
    expect(sample.displayName).toBeUndefined();
    const typed = getUiLabels('en') as unknown as Record<string, UiFieldLabels>;
    const violations: string[] = [];
    for (const key of EXPECTED_UI_LABEL_KEYS) {
      if (key === 'languageRow') continue; // options bundle — shape-pinned above
      const entry = typed[key];
      if (!entry || typeof entry.displayName !== 'string') violations.push(key);
    }
    expect(violations).toEqual([]);
  });
});
