/**
 * Mock for unzipper package (ESM-only, not compatible with ts-jest)
 */

export const Open = {
  fromPath: jest.fn().mockResolvedValue({
    entries: jest.fn().mockResolvedValue([]),
    close: jest.fn().mockResolvedValue(undefined),
  }),
};

export default {
  Open,
};
