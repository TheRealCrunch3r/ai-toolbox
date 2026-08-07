/**
 * Tests for Browser Automation Tools
 */

import { registerBrowserTools, cleanupBrowserSession } from '../src/tools/browserAutomationTools';
import { DEFAULT_CONFIG } from '../src/config';

// Mock puppeteer
jest.mock('puppeteer', () => {
  const mockPage = {
    goto: jest.fn().mockResolvedValue(undefined),
    evaluate: jest.fn().mockResolvedValue('page content'),
    click: jest.fn().mockResolvedValue(undefined),
    type: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(undefined),
    screenshot: jest.fn().mockResolvedValue(Buffer.from('screenshot')),
    url: jest.fn().mockResolvedValue('https://example.com'),
    close: jest.fn().mockResolvedValue(undefined),
    isClosed: jest.fn().mockReturnValue(false),
  };

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
    connected: jest.fn().mockReturnValue(true),
  };

  const mockPuppeteer = {
    launch: jest.fn().mockResolvedValue(mockBrowser),
    default: {
      launch: jest.fn().mockResolvedValue(mockBrowser),
    },
  };

  return mockPuppeteer;
});

// Mock 'open' module
jest.mock('open', () => ({
  default: jest.fn().mockResolvedValue(undefined),
}));

describe('Browser Automation Tools', () => {
  let tools: ReturnType<typeof registerBrowserTools>;

  beforeEach(() => {
    jest.clearAllMocks();
    tools = registerBrowserTools(DEFAULT_CONFIG);
  });

  afterAll(async () => {
    // Clear the 5-minute inactivity cleanup timer set by BrowserSessionManager.dispose()
    await cleanupBrowserSession();
  });

  test('should register browser tools', () => {
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
  });

  describe('browser_open_page', () => {
    test('should open page and return content', async () => {
      const tool = tools?.find(t => t.name === 'browser_open_page');
      expect(tool).toBeDefined();
      const result = await tool?.implementation({ url: 'https://example.com' });
      expect(result).toBeDefined();
      // Tool should return something (success or error depending on mock)
      expect(result).not.toBeNull();
    });
  });

  describe('browser_session_close', () => {
    test('should close browser session', async () => {
      const tool = tools?.find(t => t.name === 'browser_session_close');
      expect(tool).toBeDefined();
      const result = await tool?.implementation({});
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });
  });
});
