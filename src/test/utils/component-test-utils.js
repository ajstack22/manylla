/**
 * Test utilities for component testing with providers
 * Provides real provider wrappers without excessive mocking
 */

import React from "react";
import { render } from "@testing-library/react";
import { SyncProvider } from "../../context/SyncContext";
import { ThemeProvider } from "../../context/ThemeContext";

/**
 * Render component with all necessary providers
 * @param {React.Component} component - Component to render
 * @param {Object} options - Options for providers
 * @returns {Object} Testing library render result
 */
export const renderWithProviders = (component, options = {}) => {
  const {
    initialSyncState = {},
    initialTheme = "light",
    ...renderOptions
  } = options;

  // Create wrapper with providers
  const Wrapper = ({ children }) => (
    <ThemeProvider initialTheme={initialTheme}>
      <SyncProvider {...initialSyncState}>{children}</SyncProvider>
    </ThemeProvider>
  );

  return render(component, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Mock API response for fetch calls
 * @param {string} endpoint - Endpoint to match
 * @param {Object} response - Response data
 * @param {number} delay - Response delay in ms
 */
export const mockApiResponse = (endpoint, response, delay = 0) => {
  global.fetch.mockImplementation((url) => {
    if (url.includes(endpoint)) {
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve(response),
            }),
          delay,
        ),
      );
    }
    return Promise.reject(new Error(`Unexpected API call to ${url}`));
  });
};

/**
 * Create test profile data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Test profile data
 */
export const createTestProfile = (overrides = {}) => ({
  id: "test-profile-1",
  name: "Test Child",
  dateOfBirth: "2015-01-01",
  entries: [
    {
      id: "test-entry-1",
      category: "medical",
      title: "Test Entry",
      description: "Test description",
      date: new Date().toISOString(),
    },
  ],
  categories: [{ id: "medical", name: "Medical", color: "#e74c3c" }],
  createdAt: new Date().toISOString(),
  lastModified: Date.now(),
  ...overrides,
});

/**
 * Create test entry data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Test entry data
 */
export const createTestEntry = (overrides = {}) => ({
  id: "test-entry",
  category: "medical",
  title: "Test Entry",
  description: "Test description",
  date: new Date().toISOString(),
  visibility: ["family"],
  ...overrides,
});

/**
 * Wait for async operations to complete
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export const waitFor = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fire event and wait for state updates
 * @param {Function} eventFunction - Function that fires the event
 * @param {number} waitTime - Time to wait after event
 * @returns {Promise} Promise that resolves after wait
 */
export const fireEventAndWait = async (eventFunction, waitTime = 100) => {
  eventFunction();
  await waitFor(waitTime);
};

/**
 * Mock localStorage with real-like behavior
 * @returns {Object} Mock localStorage object
 */
export const createMockLocalStorage = () => {
  const storage = {};
  return {
    getItem: jest.fn((key) => storage[key] || null),
    setItem: jest.fn((key, value) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: jest.fn((index) => Object.keys(storage)[index] || null),
  };
};

/**
 * Mock successful API responses for common endpoints
 */
export const mockCommonApiResponses = () => {
  global.fetch.mockImplementation((url) => {
    if (url.includes("/api/sync_health.php")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "healthy" }),
      });
    }
    if (url.includes("/api/sync_push.php")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    if (url.includes("/api/sync_pull.php")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false, error: "No data" }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
};

/**
 * Reset all mocks to clean state
 */
export const resetAllMocks = () => {
  global.fetch.mockClear();
  global.localStorage.clear();
  // Reset any other global mocks
};

export default {
  renderWithProviders,
  mockApiResponse,
  createTestProfile,
  createTestEntry,
  waitFor,
  fireEventAndWait,
  createMockLocalStorage,
  mockCommonApiResponses,
  resetAllMocks,
};
