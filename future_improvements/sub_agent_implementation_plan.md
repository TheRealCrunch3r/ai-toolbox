# 🤖 Sub-Agent Delegation — Implementation Plan

**Date:** 28.08.2026 · **Status:** ⛔ SUPERSEDED / DEPRIORITIZED (ruling 28.08.2026) — LM Studio provides agent/delegation capabilities natively at the platform level; a plugin-level reimplementation is obsolete per user ruling. This document is **reference-only** (loop-guard, parser-hardening and tool-policy patterns remain useful if an in-process convenience shim ever gets built).
**Originally framed as closing gap vs:** Beledarian `consult_secondary_agent` — now reclassified: their tool wraps LM Studio's native local-server primitives (`/api/v1/chat`, stateful continuation), i.e., host-provided, not plugin-unique. His docs: loop protection, tool-call parsing hardening, unified path/content normalization, explicit `TASK_FAILED`, sub-agents get scoped tools (`multi_replace_text`, `search_directory`, bg command exec), Gemma-format `{\"tool\":..., \"parameters\":{...}}` compatibility, optional `handoff_message` relay to main agent.

---

## 0. Scope decision (needed before any code)
| Option | What it means | Trade-off |
|---|---|---|
| **A. Same-process, same model** | Sub-agent = fresh in-memory context loop reusing our tool executor; "delegation" = isolated scratchpad + restricted tool subset | Cheapest; works with any loaded model; but no true parallelism and no small/fast-model cost win |
| **B. Second LM Studio server/model endpoint** ✅ (recommended) | Talk to a second local server port or a different model via the same `lmStudioApi.ts` transport, exactly as Beledarian does ("secondary model/server") | Real capability split (cheap model for grunt work), matches competitor semantics; needs config fields + robust fallback if 2nd endpoint down |
| C. External API key provider | OpenAI-compatible remote URL option | New surface area, keys in local config — defer until A/B proven |

**Recommendation:** ship **A first as the execution core**, with **B behind a config toggle** (`subAgent.endpoint`, `subAgent.model`) that reuses A's loop when unset. One code path, two runtimes.

## 1. Architecture sketch (fits existing patterns — no new subsystem)
```
src/tools/agentDelegationTools.ts   ← new module, registers tools via declarative registry
        │
src/subAgent/coreLoop.ts            ← bounded tool-call loop (maxTurns, deadline ms)
        │                            parse → validate against subToolWhitelist → execute → feed result back
src/subAgent/toolPolicy.ts          ← whitelist builder: read-only + narrow-write subset of existing toolsProvider entries
        │
lmStudioApi.ts (existing)           ← chat completion transport; add optional {baseUrl, model} override params
stateManager.ts / autoTracker.ts    ← log delegation start/end/verdict for tracking + session summary
config.ts                           ← new toggle: "Sub-Agent Delegation" (default OFF — dangerous-tools philosophy)
```

## 2. Public tools (naming proposal)
| Tool | Purpose |
|---|---|
| `delegate_task` | Main entry point: `{ task, objective?, maxTurns? }` → runs sub-loop → returns `{ status: "completed" \| "failed" \| "aborted", result, turnsUsed, artifacts[] }` |
| `sub_agent_status` | (optionally) inspect/abort an in-flight delegation by id |

Keep **our** naming for consistency with our registry; document equivalence to his tool name so migrating users find it. `TASK_FAILED` semantics: explicit failure verdict string + machine-readable `status:"failed"` (his loop-protection lesson — never let a sub-agent spin silently).

## 3. Tool policy for the sub-loop (security constraint)
- **Whitelist only, resolved from `toolsProvider.ts` at delegation time** — no hardcoded tool names in the loop.
- Default tier: read-heavy + narrow writes: `read_file`, `grep_files`, `find_files`, `list_directory`, `replace_text_in_file`, `save_file`, `run_tests`.
- **Hard exclusions, always:** `delete_path`, `restore_backup`, `create_backup` (destructive/irreversible), all git push-family (`gh_push`), HTTP client, package_manage, background commands in v1 (his team added these later — we can too after reliability data).
- Sub-agent CWD = same working directory; path validation unchanged. All writes still go through `atomicWrite` → rollback-on-failure semantics inherited for free.

## 4. Loop protection (their scar tissue, our design requirements)
1. `maxTurns` default **8**, hard cap **25**; each turn = one model call + tool batch.
2. Wall-clock deadline per delegation: default **5 min** (`Promise.race`, same pattern as `grep_files` hang guards — reuse the deadline utility style, v1.9.9 precedent).
3. Tool-call parsing must survive **both** native function-calling JSON *and* the Gemma-style `{"tool": "...", "parameters": {...}}` text format (he fixed this for Gemma 4 in v1.1.0 — do it day one; add a parser unit test with that exact payload).
4. Path/content normalization: relative→absolute vs CWD, `\r\n`→`\n` before diffing, consistent JSON error envelopes (`success:false, error, hint`) mirroring his `TOOL_VALIDATION_ERROR` feedback pattern — models self-correct on good errors.
5. **No recursion:** a sub-agent cannot call `delegate_task`. Enforced by policy whitelist + runtime guard (throw explicit error).

## 5. Handoff protocol (`handoff_message`)
- Sub-loop's final message must include: verdict, artifacts created/modified (file list), open issues.
- Main agent receives structured payload; autoTracker logs it so the session summary shows delegation outcomes (fits existing `save_session_summary` flow — zero new infra).

## 6. Config UI additions (`config.ts`)
```jsonc
{
  "subAgentEnabled": false,        // toggle: "🤖 Sub-Agent Delegation"
  "subAgentEndpoint": "",          // optional 2nd LM Studio server URL (empty = same model)
  "subAgentModel": null,           // optional model id override
  "subAgentMaxTurns": 8
}
```

## 7. Test plan (minimum before enable-by-default even becomes a question)
| Suite | Cases |
|---|---|
| `tests/subAgentParser.test.ts` | native FC JSON; Gemma-style object-in-text; malformed JSON → validation error with hint; unknown tool in sub-policy → blocked + reason |
| `tests/subAgentLoop.test.ts` | maxTurns stop; deadline abort returns `aborted`; recursion guard (`delegate_task` inside policy throws); failure verdict after N bad parses (no infinite retry) |
| `tests/subAgentPolicy.test.ts` | destructive tools excluded from whitelist snapshot; CWD normalization; atomicWrite rollback path inherited (mock fs failure mid-write → original intact) |
| Integration | end-to-end delegation with mocked model: "summarize repo X" returns artifacts list + verdict in ≤ maxTurns |

## 8. Release plan
1. **v1.9.x**: Option A core + `delegate_task` OFF-by-default toggle (matches dangerous-tools philosophy). Tests green, docs updated (`TOOLS_REFERENCE.md`, README arsenal row "Agent & Delegation").
2. **Next minor**: Option B endpoint override + sub-agent status/abort tool.
3. **Later**: bg-command access for sub-agents *only after* ≥2 real-user sessions logged clean (autoTracker data will show it).

## 9. Risks / trade-offs
- ⚠️ Token cost: every delegation burns a second context window — document loudly; `maxTurns` + deadline are the brakes, not polish.
- ⚠️ Two-model divergence: cheap model may misinterpret tool schemas → the strict validation-with-hints (item 4.4) is the mitigation; keep error messages model-facing.
- ⚠️ Scope discipline: this plan deliberately excludes sub-agent *tool authoring* and multi-sub-agent orchestration — out of v1, revisit with data.

## 10. Open questions for user
1. Ship A-only first (simplest) or A+B together? (I recommend A-first.)
2. Tool naming: `delegate_task` vs matching his `consult_secondary_agent` verbatim for discoverability by users migrating from his plugin?
3. Should the README "honest gap" line in `vs_beledarian_comparison.md` §5 be softened/hardened before we paste it?
