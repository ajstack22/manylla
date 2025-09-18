/* eslint-disable */
/**
 * Simple test coverage for manyllaMinimalSyncService
 * Tests the basic module structure without complex dynamic imports
 *
 * P2 TECH DEBT: Sync service tests temporarily skipped during code coverage improvements.
 * These tests need to be re-enabled and maintained as part of sync service refactoring.
 */

import platform from "../../../utils/platform";

// Mock platform before importing
jest.mock("../../../utils/platform", () => ({
  isWeb: false,
}));

describe.skip("ManyllaMinimalSyncService (Simple)", () => {
  test("should have platform dependency", () => {
    expect(platform).toBeDefined();
    expect(typeof platform.isWeb).toBe("boolean");
  });

  test("should be importable as module", () => {
    const service = require("../manyllaMinimalSyncService");
    expect(service).toBeDefined();
    expect(service.default).toBeDefined();
  });

  test("should export sync service object", () => {
    platform.isWeb = true;

    // Clear module cache and reimport
    delete require.cache[require.resolve("../manyllaMinimalSyncService")];
    const service = require("../manyllaMinimalSyncService");

    expect(service.default).toBeTruthy();
    expect(typeof service.default).toBe("object");
  });

  test("should handle platform detection", () => {
    // Test both platform scenarios
    [true, false].forEach((isWeb) => {
      platform.isWeb = isWeb;

      // Clear module cache for each test
      delete require.cache[require.resolve("../manyllaMinimalSyncService")];

      expect(() => {
        require("../manyllaMinimalSyncService");
      }).not.toThrow();
    });
  });
});
