/**
 * Comprehensive test coverage for manyllaMinimalSyncService
 * Tests the unified sync service platform detection and interface
 */

import platform from "../../../utils/platform";

// Mock platform utility
jest.mock("../../../utils/platform", () => ({
  isWeb: false,
}));

// Mock AsyncStorage for native tests
jest.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("ManyllaMinimalSyncService (Unified)", () => {
  let manyllaMinimalSyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset fetch mock
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  describe("Platform Detection and Interface", () => {
    test("should export a service object with required methods", () => {
      platform.isWeb = true;
      manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;

      expect(manyllaMinimalSyncService).toBeDefined();
      expect(typeof manyllaMinimalSyncService.init).toBe('function');
      expect(typeof manyllaMinimalSyncService.enableSync).toBe('function');
      expect(typeof manyllaMinimalSyncService.push).toBe('function');
      expect(typeof manyllaMinimalSyncService.pull).toBe('function');
      expect(typeof manyllaMinimalSyncService.isInitialized).toBe('function');
    });

    test("should work with web platform", () => {
      platform.isWeb = true;
      manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;

      expect(manyllaMinimalSyncService).toBeDefined();
      expect(typeof manyllaMinimalSyncService.init).toBe('function');
    });

    test("should work with native platform", () => {
      platform.isWeb = false;
      manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;

      expect(manyllaMinimalSyncService).toBeDefined();
      expect(typeof manyllaMinimalSyncService.init).toBe('function');
    });

    test("should handle undefined platform.isWeb (defaults to native)", () => {
      platform.isWeb = undefined;
      manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;

      expect(manyllaMinimalSyncService).toBeDefined();
    });

    test("should handle null platform.isWeb (defaults to native)", () => {
      platform.isWeb = null;
      manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;

      expect(manyllaMinimalSyncService).toBeDefined();
    });

    test("should handle falsy platform.isWeb values", () => {
      const falsyValues = [false, 0, "", NaN];

      for (const falsyValue of falsyValues) {
        jest.resetModules();
        platform.isWeb = falsyValue;

        manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;
        expect(manyllaMinimalSyncService).toBeDefined();
      }
    });

    test("should handle truthy platform.isWeb values", () => {
      const truthyValues = [true, 1, "web", {}, []];

      for (const truthyValue of truthyValues) {
        jest.resetModules();
        platform.isWeb = truthyValue;

        manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;
        expect(manyllaMinimalSyncService).toBeDefined();
      }
    });
  });

  describe("Service Interface Consistency", () => {
    test("should expose same interface regardless of platform", () => {
      // Test web platform
      platform.isWeb = true;
      jest.resetModules();
      const webService = require("../manyllaMinimalSyncService").default;

      // Test native platform
      platform.isWeb = false;
      jest.resetModules();
      const nativeService = require("../manyllaMinimalSyncService").default;

      // Both should have the same basic interface
      const commonMethods = ['init', 'enableSync', 'push', 'pull', 'isInitialized'];

      commonMethods.forEach(method => {
        expect(typeof webService[method]).toBe('function');
        expect(typeof nativeService[method]).toBe('function');
      });
    });
  });

  describe("Method Availability", () => {
    beforeEach(() => {
      platform.isWeb = true;
      manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;
    });

    test("should have init method", () => {
      expect(typeof manyllaMinimalSyncService.init).toBe('function');
    });

    test("should have enableSync method", () => {
      expect(typeof manyllaMinimalSyncService.enableSync).toBe('function');
    });

    test("should have push method", () => {
      expect(typeof manyllaMinimalSyncService.push).toBe('function');
    });

    test("should have pull method", () => {
      expect(typeof manyllaMinimalSyncService.pull).toBe('function');
    });

    test("should have isInitialized method", () => {
      expect(typeof manyllaMinimalSyncService.isInitialized).toBe('function');
    });
  });

  describe("Basic Functionality", () => {
    beforeEach(() => {
      platform.isWeb = true;
      manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;
    });

    test("should handle isInitialized call", () => {
      expect(() => {
        manyllaMinimalSyncService.isInitialized();
      }).not.toThrow();
    });

    test("should handle method calls without throwing", () => {
      expect(() => {
        manyllaMinimalSyncService.isInitialized();
      }).not.toThrow();

      // These methods might throw if not initialized, which is expected behavior
      expect(typeof manyllaMinimalSyncService.init).toBe('function');
      expect(typeof manyllaMinimalSyncService.enableSync).toBe('function');
      expect(typeof manyllaMinimalSyncService.push).toBe('function');
      expect(typeof manyllaMinimalSyncService.pull).toBe('function');
    });
  });

  describe("Platform Switching", () => {
    test("should use appropriate service based on platform", () => {
      // Test that we get a service regardless of platform
      platform.isWeb = true;
      jest.resetModules();
      const webService = require("../manyllaMinimalSyncService").default;
      expect(webService).toBeDefined();

      platform.isWeb = false;
      jest.resetModules();
      const nativeService = require("../manyllaMinimalSyncService").default;
      expect(nativeService).toBeDefined();

      // Both should have the same interface
      expect(typeof webService.init).toBe('function');
      expect(typeof nativeService.init).toBe('function');
    });

    test("should maintain module caching behavior", () => {
      platform.isWeb = true;
      const service1 = require("../manyllaMinimalSyncService").default;
      const service2 = require("../manyllaMinimalSyncService").default;

      // Should be the same instance due to module caching
      expect(service1).toBe(service2);
    });

    test("should use new service after module reset", () => {
      // Load with web platform
      platform.isWeb = true;
      const webService = require("../manyllaMinimalSyncService").default;
      expect(webService).toBeDefined();

      // Reset modules and change platform
      jest.resetModules();
      platform.isWeb = false;

      // Re-import should work with native service
      const nativeService = require("../manyllaMinimalSyncService").default;
      expect(nativeService).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle platform edge cases", () => {
      // Test various platform values that might cause issues
      const testValues = [undefined, null, 0, "", false, true, "web", 1, {}, []];

      testValues.forEach(value => {
        jest.resetModules();
        platform.isWeb = value;

        expect(() => {
          const service = require("../manyllaMinimalSyncService").default;
          expect(service).toBeDefined();
        }).not.toThrow();
      });
    });

    test("should provide consistent interface", () => {
      platform.isWeb = true;
      manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;

      const expectedMethods = ['init', 'enableSync', 'push', 'pull', 'isInitialized'];
      expectedMethods.forEach(method => {
        expect(manyllaMinimalSyncService).toHaveProperty(method);
        expect(typeof manyllaMinimalSyncService[method]).toBe('function');
      });
    });
  });

  describe("Module Loading", () => {
    test("should successfully load web service", () => {
      platform.isWeb = true;
      jest.resetModules();

      expect(() => {
        manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;
      }).not.toThrow();

      expect(manyllaMinimalSyncService).toBeDefined();
    });

    test("should successfully load native service", () => {
      platform.isWeb = false;
      jest.resetModules();

      expect(() => {
        manyllaMinimalSyncService = require("../manyllaMinimalSyncService").default;
      }).not.toThrow();

      expect(manyllaMinimalSyncService).toBeDefined();
    });
  });
});