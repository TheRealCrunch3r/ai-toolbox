/**
 * 🔹 REGRESSION — shared-memory-file wipe class (30.08 incident, 2nd/3rd occurrence)
 *
 * Root cause: <cwd>/.session_context/.ai_toolbox_memory.msgpack is written by TWO independent
 * components with different record shapes:
 *   - StateManager          → StateEntry[]    = { key, value, timestamp }     (memory_*, session_summary_latest)
 *   - ContextStorageManager → ContextEntry[]  = { id, type, title, content… }  (track_important_event & co.)
 * ContextStorageManager.load() filters to context entries only; its save(entries) write-back
 * previously persisted ONLY the filtered list — silently DELETING every StateManager record.
 * One track_important_event() call therefore wiped all memory_* facts + session_summary_latest
 * (observed live 30.08 ~11:10: file reduced from 7 records to exactly the one tracked event).
 *
 * These tests are DETERMINISTIC (real fs I/O in os.tmpdir, no mocks of the storage classes):
 * they FAIL against pre-fix code and PASS once save() preserves foreign record shapes.
 */

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { decode } from '@msgpack/msgpack';
import type { PluginConfig } from '../src/config';
import { registerContextManagementTools } from '../src/tools/contextManagementTools';
import { StateManager } from '../src/stateManager';
import { setWorkingDir, resetWorkingDir } from '../src/workingDir';

interface RawRecord { key?: unknown; value?: unknown; timestamp?: unknown; id?: unknown; type?: unknown }

describe('shared memory file — cross-writer data preservation', () => {
  let tmp: string;          // unique scratch root (safe to delete)
  let projectRoot: string;  // nested dir NAMED 'ai_toolbox' — required for the collision condition (below)
  let manager: StateManager;

  beforeEach(async () => {
    // ⚠️ COLLISION CONDITION (why the inner dir must be named exactly 'ai_toolbox'):
    // ContextStorageManager ALWAYS writes .session_context/.ai_toolbox_memory.msgpack (hardcoded name),
    // while StateManager writes .session_context/.<projectName>_memory.msgpack where
    // projectName = basename(cwd).toLowerCase().replace(/[^a-z0-9]/g,'_'). The two writers only collide —
    // and thus the wipe bug is only reachable — when that resolved name is 'ai_toolbox', i.e. for this
    // repo's directory. A mkdtemp()-named dir would make StateManager write a DIFFERENT file, and the
    // buggy code would pass these tests falsely (green on broken). Mirror production layout exactly.
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'atb-memwipe-'));
    projectRoot = path.join(tmp, 'ai_toolbox');
    await fs.mkdir(projectRoot);
    expect(setWorkingDir(projectRoot)).toBe(true); // point all storage at the isolated dir

    manager = new StateManager({ statePersistenceEnabled: true } as Partial<PluginConfig> as PluginConfig);
    await (manager as unknown as { _ready?: Promise<void> })._ready; // settle init load
  });

  afterEach(async () => {
    resetWorkingDir();
    try { await fs.rm(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  /** Decode the shared file (both writers target this exact path here) and return all records (any shape). */
  const readAllRecords = async (): Promise<RawRecord[]> => {
    const p = path.join(projectRoot, '.session_context', '.ai_toolbox_memory.msgpack');
    if (!await fs.access(p).then(() => true).catch(() => false)) return [];
    return (decode(await fs.readFile(p))) as RawRecord[];
  };

  test('track_important_event must not wipe StateManager records (the 30.08 wipe)', async () => {
    // 1) Populate via the REAL tool paths: save_memory fact + session summary (StateManager writer)
    // 🔹 FIX (30.08): STATIC import — tsconfig uses module:NodeNext, where tsc keeps dynamic import() native and
    // Jest (without --experimental-vm-modules) rejects it ("dynamic import callback … without --experimental-vm-modules").
    // Matches the established pattern in memoryApiSelfDescription.test.ts / autoTracker.test.ts. The specifier has no
    // .js suffix, so jest's moduleNameMapper mock for './tools/contextManagementTools.js' does NOT apply — this test
    // deliberately loads the REAL implementation (deterministic regression coverage over real fs I/O).
    const tools = registerContextManagementTools({} as PluginConfig, manager);
    const call = async (name: string, args?: Record<string, unknown>) => {
      const t = tools.find(x => x.name === name);
      expect(t).toBeDefined();
      return await (t as unknown as { implementation: (a?: never) => Promise<unknown> }).implementation(args ?? {}); // SDK tool() zod-validates args — must be an object, even when empty (get_context_memory takes no required params)
    };

    await call('save_memory', { fact: 'D2-style pinned fact' });
    await call('save_session_summary', { task_description: 'closeout summary must survive' });

    const before = await readAllRecords();
    expect(before.some(r => typeof r.key === 'string' && String(r.key).startsWith('memory_'))).toBe(true);
    expect(before.some(r => r.key === 'session_summary_latest')).toBe(true);

    // 2) The wipe trigger: a context-store write (load → filter ctx-only → save write-back)
    await call('track_important_event', { title: 'event X', content: 'body' });

    // 3) ALL prior records must still be present, plus the new context entry
    const after = await readAllRecords();
    expect(after.some(r => typeof r.key === 'string' && String(r.key).startsWith('memory_'))).toBe(true);   // fact survives
    expect(after.some(r => r.key === 'session_summary_latest')).toBe(true);                                  // summary survives
    expect(after.some(r => typeof r.id === 'string' && String(r.id).startsWith('ctx_'))).toBe(true);         // event stored

    const beforeKeys = new Set(before.map(r => (typeof r.key === 'string' ? r.key : undefined)).filter(Boolean));
    const afterStateKeys = new Set(after.filter(r => typeof r.key === 'string').map(r => r.key as string));
    for (const k of beforeKeys) {
      expect(afterStateKeys.has(k)).toBe(true); // no state key may be deleted by a context-store write
    }
  });

  test('clear_context_memory must clear ONLY context entries, keep StateManager records', async () => {
    // 🔹 FIX (30.08): STATIC import — tsconfig uses module:NodeNext, where tsc keeps dynamic import() native and
    // Jest (without --experimental-vm-modules) rejects it ("dynamic import callback … without --experimental-vm-modules").
    // Matches the established pattern in memoryApiSelfDescription.test.ts / autoTracker.test.ts. The specifier has no
    // .js suffix, so jest's moduleNameMapper mock for './tools/contextManagementTools.js' does NOT apply — this test
    // deliberately loads the REAL implementation (deterministic regression coverage over real fs I/O).
    const tools = registerContextManagementTools({} as PluginConfig, manager);
    const call = async (name: string, args?: Record<string, unknown>) => {
      const t = tools.find(x => x.name === name);
      expect(t).toBeDefined();
      return await (t as unknown as { implementation: (a?: never) => Promise<unknown> }).implementation(args ?? {}); // SDK tool() zod-validates args — must be an object, even when empty (get_context_memory takes no required params)
    };

    await call('save_memory', { fact: 'pinned' });
    await call('track_important_event', { title: 'e1', content: 'c1' });

    const cleared = await call('clear_context_memory', { confirm: true }) as { success?: boolean };
    expect(cleared.success).toBe(true);

    const after = await readAllRecords();
    expect(after.some(r => typeof r.id === 'string')).toBe(false);                    // context entries gone (intended)
    expect(after.some(r => typeof r.key === 'string' && String(r.key).startsWith('memory_'))).toBe(true); // fact kept
  });

  test('delete_context_entry must not delete StateManager records sharing the file', async () => {
    // 🔹 FIX (30.08): STATIC import — tsconfig uses module:NodeNext, where tsc keeps dynamic import() native and
    // Jest (without --experimental-vm-modules) rejects it ("dynamic import callback … without --experimental-vm-modules").
    // Matches the established pattern in memoryApiSelfDescription.test.ts / autoTracker.test.ts. The specifier has no
    // .js suffix, so jest's moduleNameMapper mock for './tools/contextManagementTools.js' does NOT apply — this test
    // deliberately loads the REAL implementation (deterministic regression coverage over real fs I/O).
    const tools = registerContextManagementTools({} as PluginConfig, manager);
    const call = async (name: string, args?: Record<string, unknown>) => {
      const t = tools.find(x => x.name === name);
      expect(t).toBeDefined();
      return await (t as unknown as { implementation: (a?: never) => Promise<unknown> }).implementation(args ?? {}); // SDK tool() zod-validates args — must be an object, even when empty (get_context_memory takes no required params)
    };

    await call('save_memory', { fact: 'pinned' });
    const tracked = (await call('track_important_event', { title: 'target', content: 'c' })) as { data?: { entry_id?: string } };
    expect(tracked.data?.entry_id).toBeDefined();

    await call('delete_context_entry', { entry_id: tracked.data!.entry_id! });

    const after = await readAllRecords();
    expect(after.some(r => typeof r.id === 'string' && String(r.id) === tracked.data!.entry_id)).toBe(false); // deleted (intended)
    expect(after.some(r => typeof r.key === 'string' && String(r.key).startsWith('memory_'))).toBe(true);     // fact kept
  });

  test('prune path on read must not rewrite the file and drop foreign records', async () => {
    // 🔹 FIX (30.08): STATIC import — tsconfig uses module:NodeNext, where tsc keeps dynamic import() native and
    // Jest (without --experimental-vm-modules) rejects it ("dynamic import callback … without --experimental-vm-modules").
    // Matches the established pattern in memoryApiSelfDescription.test.ts / autoTracker.test.ts. The specifier has no
    // .js suffix, so jest's moduleNameMapper mock for './tools/contextManagementTools.js' does NOT apply — this test
    // deliberately loads the REAL implementation (deterministic regression coverage over real fs I/O).
    const tools = registerContextManagementTools({} as PluginConfig, manager);
    const call = async (name: string, args?: Record<string, unknown>) => {
      const t = tools.find(x => x.name === name);
      expect(t).toBeDefined();
      return await (t as unknown as { implementation: (a?: never) => Promise<unknown> }).implementation(args ?? {}); // SDK tool() zod-validates args — must be an object, even when empty (get_context_memory takes no required params)
    };

    await call('save_memory', { fact: 'pinned' });

    // get_context_memory triggers load + inline session-prune; with a mixed file it must not destroy state records
    const res = await call('get_context_memory') as { success?: boolean };
    expect(res.success).toBe(true);

    const after = await readAllRecords();
    expect(after.some(r => typeof r.key === 'string' && String(r.key).startsWith('memory_'))).toBe(true);
  });

  test('State write-back must not wipe context entries (REVERSE-direction wipe — proven live 30.08 ~15:30/~15:34; FIX #25)', async () => {
    // Inverse of this file's first test, and the exact incident observed twice on 30.08:
    // saveMemoryFile() previously encoded ONLY its own state map, so EVERY debounced (SAVE_DEBOUNCE_MS = 500 ms)
    // State flush — incl. each save_session_summary / save_memory — erased all context-layer records from disk
    // until a later CSM write. The trigger is therefore the debounce itself: this test waits past it explicitly,
    // so ordering is deterministic (no races on the 500 ms timer).
    const tools = registerContextManagementTools({} as PluginConfig, manager);
    const call = async (name: string, args?: Record<string, unknown>) => {
      const t = tools.find(x => x.name === name);
      expect(t).toBeDefined();
      return await (t as unknown as { implementation: (a?: never) => Promise<unknown> }).implementation(args ?? {}); // SDK tool() zod-validates args — must be an object, even when empty
    };

    // 1) Put a context entry on disk (CSM write) alongside state records (FIX #23 direction already covered above).
    await call('save_memory', { fact: 'fact that must survive the flush' });
    const tracked = (await call('track_important_event', { title: 'survivor event', content: 'body' })) as { data?: { entry_id?: string } };
    expect(tracked.data?.entry_id).toBeDefined();

    // Settle: let the pending State flush (from save_memory) land so disk holds state + context before the trigger.
    await new Promise(r => setTimeout(r, 900));
    const pre = await readAllRecords();
    expect(pre.some(r => typeof r.id === 'string' && String(r.id) === tracked.data!.entry_id)).toBe(true); // ctx present before trigger
    expect(pre.some(r => r.key === 'session_summary_latest')).toBe(false);                                 // no summary yet

    // 2) The wipe trigger: a State write → debounced saveMemoryFile() flush.
    await call('save_session_summary', { task_description: 'summary must not erase context entries' });
    await new Promise(r => setTimeout(r, 900)); // past SAVE_DEBOUNCE_MS — flush has happened by read time

    // 3) The context entry must SURVIVE the State write-back (this assertion fails against pre-FIX-#25 code).
    const after = await readAllRecords();
    expect(after.some(r => typeof r.id === 'string' && String(r.id) === tracked.data!.entry_id)).toBe(true); // ctx survives
    expect(after.some(r => r.key === 'session_summary_latest')).toBe(true);                                   // summary written
    expect(after.some(r => typeof r.key === 'string' && String(r.key).startsWith('memory_'))).toBe(true);      // fact kept

    const preCtxIds = new Set(pre.filter(r => typeof r.id === 'string').map(r => r.id as string));
    const afterCtxIds = new Set(after.filter(r => typeof r.id === 'string').map(r => r.id as string));
    for (const id of preCtxIds) {
      expect(afterCtxIds.has(id)).toBe(true); // no context id may be deleted by a State write-back
    }
  });
});
