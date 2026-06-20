/** Manual mock for lineOperations — registered always, no toggle */
export function registerLineOperationsTools(_config: Record<string, unknown>) {
  return [
    { name: 'insert_at_line', description: '', labels: {}, implementation: async () => ({ success: true }) },
    { name: 'delete_lines_in_file', description: '', labels: {}, implementation: async () => ({ success: true }) },
    { name: 'append_file', description: '', labels: {}, implementation: async () => ({ success: true }) },
  ];
}
