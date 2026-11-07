/**
 * jest moduleNameMapper target for './applyPatchEngine.js' (07.11 — apply_patch tool, same RC#4 class as the
 * patternScan entry in jest.config.cjs): fileSystemTools.ts imports the engine with a single-dot .js specifier that
 * ts-jest would not resolve on its own, so every suite loading fileSystemTools needs this mapping to exist.
 *
 * INTENTIONAL REAL-PASS-THROUGH: the engine is pure (no fs / no timers / no globals — parse + Buffer math only), so
 * re-exporting the real module keeps unrelated suites isolated BY ABSENCE OF SIDE EFFECTS rather than by stubbing,
 * and lets apply_patch contract tests exercise the true patch logic. Extensionless specifier below bypasses the
 * moduleNameMapper entries (they key on '.js' forms) — same precedent as docsConsistency.test.ts's direct imports.
 */

export * from '../../src/tools/applyPatchEngine';
