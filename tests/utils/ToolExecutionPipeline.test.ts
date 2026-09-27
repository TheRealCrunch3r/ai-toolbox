import { ToolExecutionPipeline, deny, abstain } from '../../src/utils/ToolExecutionPipeline';

describe('ToolExecutionPipeline', () => {
  it('should execute success and finalize content', async () => {
    const pipe = new ToolExecutionPipeline();
    const res = await pipe.execute('test', {a:1}, async () => ({value:42}));
    expect(res.success).toBe(true);
    expect(res.kind).toBe('success');
  });

  it('should normalize legacy success shape', async () => {
    const pipe = new ToolExecutionPipeline();
    const res = await pipe.execute('legacy', {}, async () => ({ success: true, data: 'ok' }));
    expect(res.success).toBe(true);
    expect(res.kind).toBe('success');
  });

  it('should normalize legacy error shape', async () => {
    const pipe = new ToolExecutionPipeline();
    const res = await pipe.execute('legacyErr', {}, async () => ({ success: false, error: 'boom' }));
    expect(res.success).toBe(false);
    expect(res.kind).toBe('error');
  });

  it('should catch thrown errors', async () => {
    const pipe = new ToolExecutionPipeline();
    const res = await pipe.execute('thrower', {}, async () => { throw new Error('oops'); });
    expect(res.success).toBe(false);
    expect(res.kind).toBe('error');
    expect(res.error).toContain('oops');
  });

  it('should enforce monotonic guard abstain on repeat', async () => {
    const pipe = new ToolExecutionPipeline({ enableMonotonicGuard: true });
    const args = {x:1};
    await pipe.execute('dup', args, async () => 'first');
    const res = await pipe.execute('dup', args, async () => 'second');
    expect(res.success).toBe(false);
    expect(res.kind).toBe('abstain');
    expect(res.error).toContain('Monotonic guard');
  });

  it('should allow same tool with different args', async () => {
    const pipe = new ToolExecutionPipeline();
    const r1 = await pipe.execute('t', {a:1}, async () => 'a');
    const r2 = await pipe.execute('t', {a:2}, async () => 'b');
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it('should reset guard', async () => {
    const pipe = new ToolExecutionPipeline();
    await pipe.execute('t', {}, async () => 'x');
    pipe.resetGuard();
    const res = await pipe.execute('t', {}, async () => 'y');
    expect(res.success).toBe(true);
  });

  it('deny helper returns correct shape', () => {
    const d = deny('policy');
    expect(d.kind).toBe('deny');
    expect(d.reason).toBe('policy');
  });

  it('abstain helper returns correct shape', () => {
    const a = abstain('no capability');
    expect(a.kind).toBe('abstain');
  });
});

  it('should invoke custom finalizer and keep success', async () => {
    const pipe = new ToolExecutionPipeline();
    const finalizer = jest.fn((raw, outcome) => ({ content: 'custom' }));
    const res = await pipe.execute('fin', {}, async () => 'data', finalizer);
    expect(finalizer).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it('should return deny kind via direct wrap simulation', () => {
    // Verify deny helper integrates with outcome taxonomy
    const d = deny('policy violation');
    expect(d.kind).toBe('deny');
    expect(d.reason).toBe('policy violation');
  });
