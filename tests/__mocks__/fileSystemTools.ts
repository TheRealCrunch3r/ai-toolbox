/** Manual mock for fileSystemTools — returns a single dummy tool */
export function registerFileSystemTools(_config, _sm, _bg) {
  return [{ name: 'list_directory', description: 'Mock list_directory' }];
}
