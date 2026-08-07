/** Mock for schema minifier — returns tools unchanged */
export function minifyTools(tools: Array<{ name: string; parameters?: Record<string, unknown>; description?: string }>) {
  return tools;
}
