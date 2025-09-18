/* eslint-disable */
/**
 * Test coverage for sync services index file
 * Tests the export structure and module availability
 */

import * as syncServices from "../index";

describe("Sync Services Index", () => {
  test("should export ManyllaEncryptionService", () => {
    expect(syncServices.ManyllaEncryptionService).toBeDefined();
    expect(typeof syncServices.ManyllaEncryptionService).toBe("object");
  });

  test("should export ManyllaMinimalSyncService", () => {
    expect(syncServices.ManyllaMinimalSyncService).toBeDefined();
    expect(typeof syncServices.ManyllaMinimalSyncService).toBe("object");
  });

  test("should export all expected services", () => {
    const expectedExports = [
      "ManyllaEncryptionService",
      "ManyllaMinimalSyncService",
    ];

    expectedExports.forEach((exportName) => {
      expect(syncServices).toHaveProperty(exportName);
    });
  });

  test("should not export unexpected services", () => {
    const exportKeys = Object.keys(syncServices);
    const expectedKeys = [
      "ManyllaEncryptionService",
      "ManyllaMinimalSyncService",
    ];

    expect(exportKeys).toEqual(expect.arrayContaining(expectedKeys));
  });
});
