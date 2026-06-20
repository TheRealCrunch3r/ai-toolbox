/**
 * Jest global teardown — lets fire-and-forget async operations complete cleanly
 * before Jest exits, eliminating "Force exiting Jest" warnings.
 */
module.exports = async () => {
  // Give pending saveToFile() / flushActionsToMemory() promises time to resolve
  await new Promise((resolve) => setTimeout(resolve, 200));
};
