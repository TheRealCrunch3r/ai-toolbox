# [Bug] Prediction loop stalls on tool-call dispatch; abort times out ("Canceling predictions timed out"); app requires force-restart

**App version:** 0.4.23 (beta channel, build 1) — Windows
**Model in use at time of incident:** qwen3.8-27b-ud (~16.3 GB, MTP/spec-decode enabled, Vulkan)
**Repro context:** any chat with a tools-provider plugin active; here the plugin was an internal file-tools provider (`crunch3r/ai-toolbox`). The failing call was a trivial directory search (measured runtime 2–17 ms in every other call of the same session).

## Symptom

Mid-conversation, after a tool call is dispatched, the chat UI's tool card shows a running spinner **indefinitely**. Everything else reports "stopped/idle":

- Developer Logs show the engine already released its slot at the end of the previous generation (`stop processing`, `truncated = 0` — i.e. a natural EOS stop, not a truncation or user abort).
- Local Server page shows **Status: Stopped / Server not running** while the model is still loaded (READY).
- No further log output appears until ~3 minutes later, when the app's own cleanup path fails and the whole application wedges — only a force-restart recovers it.

## Exact sequence from `logs/main.log` (all timestamps local)

```
17:45:50.655 [error] ...[PluginProcess(crunch3r/ai-toolbox)] stderr:
             [grep_files] completed in 5ms — 1 file(s) scanned, 16 match(es), 0 skipped   ← last healthy line

~17:46:13    (Developer Logs) engine slot released after natural EOS stop:
             "eval time = 21979.88 ms / 1140 tokens … release: id 1 | task 3091 |
              stop processing: n_tokens = 28000, truncated = 0"
             → host parses the generated tool-call JSON and starts the next prediction loop

… SILENCE — no further log output for ~3.5 minutes; UI spinner runs forever …

17:49:29.351 [error] Unhandled Rejection at: {} reason: Error: Canceling predictions timed out
17:49:29.354 [error] [CleanupProvider] Error running pre-cleanup: Abort ongoing predictions
             Error: Canceling predictions timed out
17:49:30.527 [error] [LLMProxyObject] Engine protocol runtime exited unexpectedly.
             exitCode=null, signal=SIGTERM

17:49:45.682 [info]  Hardware survey … (app restarted by user — "App starting..." at 17:49:45)
```

## Key observations

1. **No user action was taken** between the tool dispatch and the failure — the stop button was never pressed, so this is not a cancel-path race from UI input. The engine's "stop processing" line predates the stall and corresponds to a normal end-of-generation.
2. The plugin (tools provider) process was idle and healthy: every tool call that reached it during this session logged completion in 2–17 ms with results matching what the model received. The orphaned call left **no trace at all** on the plugin side, which indicates the stall is in LM Studio's host-side prediction-loop/tool-dispatch layer (between generating the tool-call JSON and invoking the provider), not in any plugin code.
3. The app-internal abort/cleanup that should have recovered the loop instead produced an **unhandled rejection** (`Canceling predictions timed out`) and left the engine dead (SIGTERM) with no restart — requiring a full application restart.
4. The same `Canceling predictions timed out` unhandled rejections occur repeatedly across multiple days in the same log file (08-26 18:36, 08-27 17:18, 08-28 16:58/19:07/19:24–19:27, 08-29 20:39/20:50, and this incident at 08-30 17:49), several of them followed by engine SIGTERM + app restart.

## Expected behavior

- A tool call dispatch that fails or stalls should surface an error to the chat UI (tool card transitions to an error state) instead of spinning forever.
- The internal abort path ("Canceling predictions") should either succeed within its timeout or escalate with a recoverable state — not produce an unhandled rejection and kill the engine process silently, leaving the app wedged until force-restart.

## Attachments (4 screenshots)

1. `screenshot 2026-08-30 174715.png` — Developer → Local Server: model READY while server shows "Stopped"; slot release lines visible at bottom of Developer Logs
2. `screenshot 2026-08-30 174735.png` — Chat UI ("ai_toolbox Session Handoff"): tool card stuck in running state after engine already stopped
3. `screenshot 2026-08-30 174801.png` — Zoomed chat view: same stuck "Model is calling grep_files()" spinner, no result/error ever rendered
4. `screenshot 2026-08-30 174846.png` — Developer Logs window: full generation timing for the final successful slot (natural EOS stop) and the subsequent silence

## Suggested diagnostics

- Check what the default prediction-loop handler does when a tool-call dispatch promise neither resolves nor rejects (missing timeout/abort wiring around provider invocations).
- Investigate why "Canceling predictions" times out even though no generation is in flight at that point (engine idle since ~17:46) — suggests the loop was already stuck in a state where its abort check never runs.
