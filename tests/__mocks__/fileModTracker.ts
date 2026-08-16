/** Manual mock for fileModTracker — prevents LLM context staleness tracking in tests */

export function recordFileModification(_filePath: string, _opType: string) {
  return { guidance: null, count: 1 };
}

export function getFileModCount(_filePath: string): number {
  return 0;
}

export function resetTracking(): void {}
