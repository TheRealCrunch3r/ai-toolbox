/**
 * Mock for archiver package (ESM-only, not compatible with ts-jest)
 */

export const create = jest.fn(() => ({
  append: jest.fn().mockReturnThis(),
  pipe: jest.fn().mockReturnThis(),
  finalize: jest.fn().mockResolvedValue(undefined),
}));

export default {
  create,
};
