# ⚔️ Competitive Analysis: AI Toolbox vs Beledarian's LM Studio Tools

**Date:** 28.08.2026 · **Our version:** v1.9.11 (rev-24) · **Theirs:** v1.3.x (`Beledarian/Beledarians_LM_Studio_Toolbox`)
**Sources (fetched live):** their README.md, package.json, `instructions/TOOLS_USAGE.md` + local `TOOLS_REFERENCE.md` audit (28.08). No fabricated claims — every row traces to those documents.

---

## 1. Head-to-head matrix

| Dimension | **AI Toolbox v1.9.11** ✅ | Beledarian v1.3.x |
|---|---|---|
| Tools / structure | ~136 registered (~131 unique) across **24 modules**, declarative registry in `toolsProvider.ts` | ~49 documented tools, single flat monolith (`index.js`) |
| Language & tests | Strict TypeScript · **628 tests / 36 suites** (last verified green run, REV-24) | JS + partial TS · ~51+ tests across 9 test files (`node --test`); `ts-morph` dev-dep only |
| i18n | EN + DE | 🏆 **EN / DE / ZH-CN / ZH-TW**, dual-layer (config UI *and* runtime agent messages) + manual locale override |
| Agent / delegation | Single-agent: ContextGuard, autoTracker, auto-summarize — rides on LM Studio's own agent layer | ⚪ **`consult_secondary_agent`** is a plugin-level wrapper over LM Studio's native local API (localhost server + its agent capabilities) — platform-provided, **not a differentiator** (reclassified 28.08.2026 per user ruling) |
| Memory | Scopes (global/project/session), TTL pruning, heuristic retrieval, session index, cross-project registry — deep but **binary store** (`.msgpack`) | 🏆 single human-readable `memory.md` users can open/edit; plus auto-save code blocks + auto-debug modes we lack |
| RAG / docs | 🏆 vector index over **PDF/DOCX/XLSX** (+code/text), cosine top-k, page-number provenance, reindex/clear | keyword-style `rag_local_files`, `rag_web_content`; parses PDF/DOCX (pdf-parse/mammoth) but no visible embedding pipeline |
| Image & viz | 🏆 OCR (`image_to_text`), metadata, compare, desktop screenshot, **vision-model analysis** (`analyze_image`), chart generation | none beyond puppeteer screenshots |
| Code tools | 🏆 AST refactoring engine + Recode rule set (rename/move/extract/dead-imports/type-inference), `analyze_project`, grep hang guards, 3-layer line-op guardrails + MD5 read-back verification | string-based edits; no runtime AST tooling |
| Git / GitHub | **15 tools**: status/diff/log/commit/add/**stash/blame** + 8 gh_* | 6 git (no stash/blame) + 8 gh_*, incl. 🏆 `gh_auth` login-window flow we lack |
| Execution | JS VM sandbox, Python import-blocks, shell sanitization, `run_tests` auto-detect | JS via Deno, Python, execute_command, terminal; also `run_test_command` |
| Safety model | ReDoS split-regex · SSRF private-IP block · SQLi param-binding · 72-bit-entropy atomic writes + rollback-on-failure · dangerous tools off by default (God Mode opt-in) | workspace sandboxing + CLI dependency guards (verify binary before run) — thinner documented layers |

## 2. Where we win (keep these front-and-center)
1. **Breadth:** ~2.7× the tool surface; whole families he has zero of: AST refactoring, vector RAG, image/vision, charts, UI generation, HTTP client suite, DB queries, backup/restore.
2. **Depth per tool:** atomic crash-resilient writes + rollback on *every* file mutation; hang-prevention deadlines in `grep_files`/`find_replace_all`; line-op fingerprint verification; confidence tagging (EXTRACTED/INFERRED/AMBIGUOUS).
3. **Security posture:** documented multi-layer model vs his two bullets. In a local-LLM plugin, this is the differentiator for cautious power users.
4. **Test coverage signal:** 628 tests / 36 suites vs ~51 — roughly 12×.

## 3. Where he wins (honest gaps)
| Gap | Severity | Counter-move |
|---|---|---|
| ~~Sub-agent delegation~~ (`consult_secondary_agent`) | ⚪ **Not a real gap (reclassified 28.08)** — thin wrapper over LM Studio's native `/api/v1/chat` + local-server primitives (stateful continuation, task offload); host app provides this to *both* plugins → not a differentiator, dropped from his wins | None; `sub_agent_implementation_plan.md` downgraded to optional convenience shim only |
| i18n breadth + dual-layer runtime translation (ZH-CN/ZH-TW missing) | 🟡 Med — real distribution loss in CN markets | Add `zh-cn.ts`, `zh-tw.ts` locales; route agent messages through same i18n layer as config UI |
| Transparent memory (`memory.md`) | 🟡 Med — his users can hand-edit/inspect memory; ours is binary (functionally richer, less legible) | Offer optional `export_memory_markdown()` tool + document the store format in README |
| `gh_auth` login-window flow | 🟢 Low | Small addition to `gitGithubTools.ts`: detect missing auth → spawn terminal for `gh auth login` |
| Auto-save code blocks / auto-debug modes | 🟢 Low (autoTracker partially covers tracking) | Evaluate during next roadmap pass; avoid scope creep |

## 4. Distribution reality check
- **Us:** ~7 Hub downloads at last baseline (strategic doc, Aug 17). Quality ≠ visibility yet.
- **Him:** **11.7K downloads** (+ 94 stars / 28 forks) — ✅ **VERIFIED LIVE** from `lmstudio.ai/beledarian/beledarians-lm-studio-tools` on 28.08.2026 via RAG extraction (raw page still exceeds the ~49KB fetch limit). Last revision: May 10 by beledarian. Mirror listings (`kurf`, `rotorshin`, …) carry their own separate counts and are NOT added to this figure.
- **Read-through:** we sat at ~7 Hub downloads at our Aug 17 baseline → he is ahead by roughly **3 orders of magnitude** in installed base, even with ~half the tool surface (49 vs 120+). Distribution ≠ capability — but it is where adoption happens; visibility work (Hub listing quality, mirror strategy) has real upside.

## 5. Suggested README section (ready to paste — pick placement, likely after Standout wins table)

> ### 🆚 vs Beledarian's LM Studio Tools
> The most direct competitor on the Hub. Same job — tools for local LLMs — very different build.
> | You get here that he doesn't have |
> |---|
> | ✅ **AST-level refactoring** (rename, move functions, dead-import cleanup) instead of string edits |
> | ✅ **Real RAG:** vector index over PDF/DOCX/XLSX with provenance — not just keyword search |
> | ✅ **Image & data viz:** OCR, vision-model analysis, chart generation |
> | ✅ **120+ tools** vs ~49 — and ~12× the automated tests behind them |
> | ✅ **Crash-resilient writes + rollback:** a failed edit can never corrupt your file |
> One honest note: his i18n covers 4 languages, we cover 2 — that's the gap we're closing first.

*Tone note: single honest-gap line (i18n) keeps the "feature-first sales copy" framing credible; drop it if you want pure wins-only.*

## 6. Verification anchors
- Our counts: `TOOLS_REFERENCE.md` (audited 28.08 against `src/tools/*.ts` + `toolsProvider.ts`)
- Their tool list: `instructions/TOOLS_USAGE.md` @ main branch, sha `318c9a3`
- Test claims: our last verified Jest run (REV-24 session) — **not** re-run in this analysis
