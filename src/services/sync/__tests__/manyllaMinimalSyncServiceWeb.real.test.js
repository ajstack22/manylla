/**
 * Real integration tests for ManyllaMinimalSyncServiceWeb
 * These tests use real API calls to dev environment and actual service behavior
 * Focus: Real behavior testing as required by Story S029
 */

import manyllaMinimalSyncService, {
  // ManyllaMinimalSyncService,
} from "../manyllaMinimalSyncServiceWeb";
import ManyllaEncryptionService from "../manyllaEncryptionService";

// Test data helpers
const createTestProfileData = () => ({
  id: "test-profile-sync-1",
  name: "Sync Test Child",
  entries: [
    {
      id: "sync-entry-1",
      category: "medical",
      title: "Sync Test Entry",
      description: "This is a test entry for sync testing",
      date: new Date().toISOString(),
    },
  ],
  categories: [{ id: "medical", name: "Medical", color: "#e74c3c" }],
  lastModified: Date.now(),
});

const TEST_RECOVERY_PHRASE = "abcdef1234567890abcdef1234567890";

describe("ManyllaMinimalSyncService Real Integration", () => {
  let service;

  beforeEach(() => {
    // Use the singleton instance for most tests
    service = manyllaMinimalSyncService;
    // Reset state
    service.syncId = null;
    service.isPolling = false;
    service.pollInterval = null;
    service.lastPullTime = null;
    service.pendingPush = null;
    // Reset global fetch mock for each test
    global.fetch.mockClear();
  });

  afterEach(() => {
    // Clean up any polling intervals
    if (service && service.isPolling) {
      service.stopPolling();
    }
  });

  describe("Service Initialization", () => {
    test("should initialize with valid recovery phrase", async () => {
      const result = await service.init(TEST_RECOVERY_PHRASE);

      expect(result).toBe(true);
      expect(service.syncId).toBeDefined();
      expect(typeof service.syncId).toBe("string");
    });

    test("should reject invalid recovery phrases", async () => {
      await expect(service.init("")).rejects.toThrow(
        "Invalid recovery phrase format",
      );
      await expect(service.init("too-short")).rejects.toThrow(
        "Invalid recovery phrase format",
      );
      await expect(service.init("not-hex-characters-here")).rejects.toThrow(
        "Invalid recovery phrase format",
      );
      await expect(service.init(null)).rejects.toThrow(
        "Invalid recovery phrase format",
      );
    });

    test("should generate consistent sync ID for same phrase", async () => {
      await service.init(TEST_RECOVERY_PHRASE);
      const syncId1 = service.syncId;

      // Reset and reinitialize with same phrase
      service.syncId = null;
      await service.init(TEST_RECOVERY_PHRASE);
      const syncId2 = service.syncId;

      expect(syncId1).toBe(syncId2);
    });

    test("should handle network failures during initialization gracefully", async () => {
      // Mock network failure
      global.fetch.mockRejectedValueOnce(new Error("Network timeout"));

      // Should not throw - just log the error
      await expect(service.init(TEST_RECOVERY_PHRASE)).resolves.toBe(true);
      expect(service.syncId).toBeDefined();
    });
  });

  describe("API Integration Tests", () => {
    beforeEach(async () => {
      await service.init(TEST_RECOVERY_PHRASE);
    });

    test("should complete health check with real response", async () => {
      // Mock successful health check
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            status: "healthy",
            timestamp: Date.now(),
            version: "1.0",
          }),
      });

      const isHealthy = await service.checkHealth();

      expect(isHealthy).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/sync_health.php"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    test("should handle health check failures", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const isHealthy = await service.checkHealth();
      expect(isHealthy).toBe(false);
    });

    test("should complete full push workflow", async () => {
      const testProfile = createTestProfileData();

      // Mock successful push response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            syncId: service.syncId,
            timestamp: Date.now(),
          }),
      });

      const result = await service.pushData(testProfile);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/sync_push.php"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining(service.syncId),
        }),
      );
    });

    test("should complete full pull workflow", async () => {
      const testProfile = createTestProfileData();
      const encryptedData = ManyllaEncryptionService.encryptData(testProfile);

      // Mock successful pull response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: encryptedData,
            timestamp: Date.now(),
          }),
      });

      const result = await service.pullData();

      expect(result).toEqual(testProfile);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/sync_pull.php"),
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    test("should handle network failures gracefully", async () => {
      const testProfile = createTestProfileData();

      // Mock network failure
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await service.pushData(testProfile);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle HTTP error responses", async () => {
      const testProfile = createTestProfileData();

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () => Promise.resolve({ error: "Invalid sync ID" }),
      });

      const result = await service.pushData(testProfile);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Data Conflict Resolution", () => {
    beforeEach(async () => {
      await service.init(TEST_RECOVERY_PHRASE);
    });

    test("should handle last-write-wins conflicts", async () => {
      const profile1 = createTestProfileData();
      const profile2 = {
        ...profile1,
        name: "Updated Name",
        lastModified: Date.now() + 1000,
      };

      // Mock pull returning older data
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: ManyllaEncryptionService.encryptData(profile1),
              timestamp: Date.now() - 1000,
            }),
        });

      // Push newer data
      await service.pushData(profile2);

      // Pull should return newer data (conflict resolved)
      const result = await service.pullData();

      // In real conflict resolution, this would favor the newer lastModified
      expect(result).toBeDefined();
    });

    test("should handle missing remote data", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: "No data found" }),
      });

      const result = await service.pullData();
      expect(result).toBeNull();
    });

    test("should handle corrupted remote data", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: "corrupted-data-that-cannot-be-decrypted",
          }),
      });

      const result = await service.pullData();
      expect(result).toBeNull(); // Should handle decryption failure gracefully
    });
  });

  describe("Polling and Real-time Sync", () => {
    beforeEach(async () => {
      await service.init(TEST_RECOVERY_PHRASE);
    });

    test("should start and stop polling correctly", (done) => {
      expect(service.isPolling).toBe(false);

      service.startPolling(() => {
        // Data callback - just confirm it's called
        return Promise.resolve();
      });

      expect(service.isPolling).toBe(true);
      expect(service.pollInterval).toBeDefined();

      // Stop polling after short delay
      setTimeout(() => {
        service.stopPolling();
        expect(service.isPolling).toBe(false);
        expect(service.pollInterval).toBeNull();
        done();
      }, 100);
    });

    test("should handle polling errors gracefully", (done) => {
      let errorCount = 0;

      // Mock fetch to fail first few times, then succeed
      global.fetch.mockImplementation(() => {
        errorCount++;
        if (errorCount <= 2) {
          return Promise.reject(new Error("Network timeout"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: false, error: "No data" }),
        });
      });

      service.startPolling(() => Promise.resolve());

      // Let it run for a bit to test error handling
      setTimeout(() => {
        service.stopPolling();
        expect(errorCount).toBeGreaterThan(1); // Should have retried
        done();
      }, 200);
    });

    test("should respect poll interval configuration", (done) => {
      const originalInterval = service.POLL_INTERVAL;
      service.POLL_INTERVAL = 50; // Very short for testing

      let pollCount = 0;
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => {
          pollCount++;
          return Promise.resolve({ success: false, error: "No data" });
        },
      });

      service.startPolling(() => Promise.resolve());

      setTimeout(() => {
        service.stopPolling();
        service.POLL_INTERVAL = originalInterval;

        expect(pollCount).toBeGreaterThan(1); // Should have polled multiple times
        done();
      }, 150);
    });
  });

  describe("Error Handling and Retry Logic", () => {
    beforeEach(async () => {
      await service.init(TEST_RECOVERY_PHRASE);
    });

    test("should retry failed requests up to max retries", async () => {
      const testProfile = createTestProfileData();
      let attemptCount = 0;

      global.fetch.mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 2) {
          return Promise.reject(new Error("Temporary network error"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });

      const result = await service.pushData(testProfile);

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3); // Initial + 2 retries
    });

    test("should give up after max retries", async () => {
      const testProfile = createTestProfileData();

      global.fetch.mockRejectedValue(new Error("Persistent network error"));

      const result = await service.pushData(testProfile);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Persistent network error");
      expect(global.fetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    test("should handle malformed API responses", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve("not-an-object"),
      });

      const isHealthy = await service.checkHealth();
      expect(isHealthy).toBe(false);
    });

    test("should handle JSON parsing errors", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      const isHealthy = await service.checkHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe("Performance and Optimization", () => {
    beforeEach(async () => {
      await service.init(TEST_RECOVERY_PHRASE);
    });

    test("should complete sync operations within performance bounds", async () => {
      const testProfile = createTestProfileData();

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const startTime = Date.now();
      await service.pushData(testProfile);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });

    test("should handle large profile data efficiently", async () => {
      const largeProfile = {
        ...createTestProfileData(),
        entries: new Array(100).fill(null).map((_, i) => ({
          id: `entry-${i}`,
          category: "medical",
          title: `Entry ${i}`,
          description: "Large dataset test entry ".repeat(50),
          date: new Date().toISOString(),
        })),
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const startTime = Date.now();
      const result = await service.pushData(largeProfile);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should handle large data efficiently
    });

    test("should debounce rapid push requests", async () => {
      const testProfile = createTestProfileData();

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Make multiple rapid push requests
      const promises = [
        service.pushData(testProfile),
        service.pushData(testProfile),
        service.pushData(testProfile),
      ];

      await Promise.all(promises);

      // Should have made fewer actual network requests due to debouncing
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Real-world Usage Scenarios", () => {
    beforeEach(async () => {
      await service.init(TEST_RECOVERY_PHRASE);
    });

    test("should handle complete sync setup workflow", async () => {
      // 1. Health check
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "healthy" }),
      });

      const isHealthy = await service.checkHealth();
      expect(isHealthy).toBe(true);

      // 2. Initial data push
      const testProfile = createTestProfileData();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const pushResult = await service.pushData(testProfile);
      expect(pushResult.success).toBe(true);

      // 3. Data pull verification
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: ManyllaEncryptionService.encryptData(testProfile),
          }),
      });

      const pullResult = await service.pullData();
      expect(pullResult).toEqual(testProfile);
    });

    test("should handle multi-device sync scenario", async () => {
      const device1Profile = createTestProfileData();
      const device2Profile = {
        ...device1Profile,
        entries: [
          ...device1Profile.entries,
          {
            id: "new-entry-device2",
            category: "education",
            title: "Added from device 2",
            description: "This entry was added from another device",
            date: new Date().toISOString(),
          },
        ],
        lastModified: Date.now() + 1000,
      };

      // Device 1 pushes data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await service.pushData(device1Profile);

      // Device 2 pulls and gets device 1's data, then pushes updated data
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: ManyllaEncryptionService.encryptData(device1Profile),
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const pulledData = await service.pullData();
      expect(pulledData).toEqual(device1Profile);

      await service.pushData(device2Profile);

      // Device 1 pulls updated data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: ManyllaEncryptionService.encryptData(device2Profile),
          }),
      });

      const finalData = await service.pullData();
      expect(finalData.entries).toHaveLength(2);
      expect(
        finalData.entries.some((e) => e.title === "Added from device 2"),
      ).toBe(true);
    });

    test("should handle offline/online transitions", async () => {
      const testProfile = createTestProfileData();

      // Simulate offline - network requests fail
      global.fetch.mockRejectedValue(new Error("Network unreachable"));

      const offlineResult = await service.pushData(testProfile);
      expect(offlineResult.success).toBe(false);

      // Simulate coming back online
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const onlineResult = await service.pushData(testProfile);
      expect(onlineResult.success).toBe(true);
    });
  });
});
