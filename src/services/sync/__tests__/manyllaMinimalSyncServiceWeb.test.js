import ManyllaMinimalSyncServiceWeb from "../manyllaMinimalSyncServiceWeb";
import manyllaEncryptionService from "../manyllaEncryptionService";
import {
  TEST_RECOVERY_PHRASE,
  createTestProfileData,
} from "../../../test/utils/encryption-helpers";

// Mock the encryption service
jest.mock("../manyllaEncryptionService", () => ({
  __esModule: true,
  default: {
    isInitialized: jest.fn(() => true),
    generateRecoveryPhrase: jest.fn(() => "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"),
    initialize: jest.fn(async () => ({
      syncId: "test_sync_id_12345678",
      salt: "test_salt",
    })),
    init: jest.fn(async () => ({
      syncId: "test_sync_id_12345678",
      salt: "test_salt",
    })),
    encrypt: jest.fn((data) => "encrypted_test_data"),
    encryptData: jest.fn((data) => "encrypted_test_data"),
    decrypt: jest.fn((encrypted) => ({ test: "decrypted data" })),
    decryptData: jest.fn((encrypted) => ({ test: "decrypted data" })),
    clear: jest.fn(async () => {}),
    restore: jest.fn(async () => true),
    isEnabled: jest.fn(async () => true),
    getSyncId: jest.fn(async () => "test_sync_id_12345678"),
    getDeviceKey: jest.fn(async () => new Uint8Array(32)),
    encryptWithKey: jest.fn(async () => "encrypted_with_key"),
    deriveKeyFromPhrase: jest.fn(async (phrase, salt) => ({
      key: new Uint8Array(32),
      salt: salt || "dGVzdF9zYWx0XzEyMzQ1Njc4",
      syncId: "test_sync_id_12345678",
    })),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = mockLocalStorage;

// Define mock services for test usage
const mockEncryptionService = manyllaEncryptionService;

// Mock MSW server and HTTP utilities
const server = {
  use: jest.fn(),
  resetHandlers: jest.fn(),
};
const http = {
  get: jest.fn(),
  post: jest.fn(),
};
const HttpResponse = {
  json: jest.fn(),
  text: jest.fn(),
};

describe("ManyllaMinimalSyncServiceWeb", () => {
  let syncService;

  beforeEach(() => {
    // Use the singleton instance
    syncService = ManyllaMinimalSyncServiceWeb;

    // Reset mocks
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});

    // Reset fetch mock with default successful health response
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "healthy", timestamp: Date.now() }),
    });
  });

  afterEach(() => {
    syncService.stopPolling();
  });

  describe("Initialization", () => {
    test("should initialize with valid recovery phrase", async () => {
      const phrase = TEST_RECOVERY_PHRASE;

      const result = await syncService.init(phrase);

      expect(result).toBe(true);
      expect(mockEncryptionService.init).toHaveBeenCalledWith(phrase);
      expect(syncService.syncId).toBeDefined();
    });

    test("should reject invalid recovery phrase format", async () => {
      const invalidPhrases = [
        "", // empty
        "too_short", // too short
        "toolong1234567890123456789012345", // too long
        "invalid-characters-!@#$%^&*()123", // invalid characters
      ];

      for (const phrase of invalidPhrases) {
        await expect(syncService.init(phrase)).rejects.toThrow(
          "Invalid recovery phrase format",
        );
      }
    });

    test("should handle health check failure gracefully during init", async () => {
      // Mock health check to fail
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await syncService.init(TEST_RECOVERY_PHRASE);

      // Should still succeed even if health check fails
      expect(result).toBe(true);
    });
  });

  describe("Health Check", () => {
    test("should return true for healthy service", async () => {
      const isHealthy = await syncService.checkHealth();

      expect(isHealthy).toBe(true);
    });

    test("should return false for unhealthy service", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: "unhealthy" }),
      });

      const isHealthy = await syncService.checkHealth();

      expect(isHealthy).toBe(false);
    });

    test("should handle network errors", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const isHealthy = await syncService.checkHealth();

      expect(isHealthy).toBe(false);
    });
  });

  describe("Push Operations", () => {
    beforeEach(async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should push data successfully", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const testData = createTestProfileData();
      const result = await syncService.push(testData);

      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sync_push.php"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.any(String),
        }),
      );
    });

    test("should debounce multiple push requests", async () => {
      const testData = createTestProfileData();

      // Make multiple push requests quickly
      const promise1 = syncService.push(testData);
      const promise2 = syncService.push(testData);
      const promise3 = syncService.push(testData);

      const results = await Promise.allSettled([promise1, promise2, promise3]);

      // Only the last one should succeed, others should be cancelled
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    });

    test("should retry on temporary failures", async () => {
      let attemptCount = 0;
      server.use(
        http.post("/qual/api/sync_push.php", () => {
          attemptCount++;
          if (attemptCount < 3) {
            return new HttpResponse(null, { status: 500 });
          }
          return HttpResponse.json({ success: true });
        }),
      );

      const testData = createTestProfileData();
      const result = await syncService.push(testData);

      expect(result).toEqual({ success: true });
      expect(attemptCount).toBe(3);
    });

    test("should throw error when not initialized", async () => {
      // Create a new instance of the service for this test
      const {
        ManyllaMinimalSyncService,
      } = require("../manyllaMinimalSyncServiceWeb");
      const uninitializedService = new ManyllaMinimalSyncService();
      const testData = createTestProfileData();

      await expect(uninitializedService.push(testData)).rejects.toThrow(
        "Sync not initialized",
      );
    });

    test("should handle server errors", async () => {
      server.use(
        http.post("/qual/api/sync_push.php", () => {
          return HttpResponse.json(
            { success: false, error: "Server error" },
            { status: 500 },
          );
        }),
      );

      const testData = createTestProfileData();

      await expect(syncService.push(testData)).rejects.toThrow();
    });

    test("should handle authentication errors", async () => {
      server.use(
        http.post("/qual/api/sync_push.php", () => {
          return new HttpResponse(null, { status: 401 });
        }),
      );

      const testData = createTestProfileData();

      await expect(syncService.push(testData)).rejects.toThrow();
    });
  });

  describe("Pull Operations", () => {
    beforeEach(async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should pull data successfully", async () => {
      const mockData = { test: "pulled data" };
      mockEncryptionService.decrypt.mockReturnValue(mockData);

      const result = await syncService.pull();

      expect(result).toEqual(mockData);
      expect(mockEncryptionService.decrypt).toHaveBeenCalled();
    });

    test("should return null when no data exists", async () => {
      server.use(
        http.get("/qual/api/sync_pull.php", () => {
          return HttpResponse.json({ success: false, error: "No data found" });
        }),
      );

      const result = await syncService.pull();

      expect(result).toBe(null);
    });

    test("should handle conflict resolution with local data", async () => {
      const remoteData = { id: "remote", name: "Remote Profile" };
      const localData = { id: "local", name: "Local Profile" };

      mockEncryptionService.decrypt.mockReturnValue(remoteData);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(localData));

      // Mock conflict resolver
      const mockConflictResolver = {
        resolve: jest
          .fn()
          .mockReturnValue({ id: "merged", name: "Merged Profile" }),
      };
      jest.doMock("../conflictResolver", () => ({
        default: mockConflictResolver,
      }));

      await syncService.pull();

      // Should call conflict resolver and return merged result
      expect(mockConflictResolver.resolve).toHaveBeenCalledWith(
        localData,
        remoteData,
      );
    });

    test("should throw error when not initialized", async () => {
      // Create a new instance of the service for this test
      const {
        ManyllaMinimalSyncService,
      } = require("../manyllaMinimalSyncServiceWeb");
      const uninitializedService = new ManyllaMinimalSyncService();

      await expect(uninitializedService.pull()).rejects.toThrow(
        "Sync not initialized",
      );
    });

    test("should handle server errors", async () => {
      server.use(
        http.get("/qual/api/sync_pull.php", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      await expect(syncService.pull()).rejects.toThrow();
    });

    test("should handle authentication errors", async () => {
      server.use(
        http.get("/qual/api/sync_pull.php", () => {
          return new HttpResponse(null, { status: 401 });
        }),
      );

      await expect(syncService.pull()).rejects.toThrow();
    });
  });

  describe("Polling", () => {
    beforeEach(async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("should start polling successfully", () => {
      syncService.startPolling();

      expect(syncService.isPolling).toBe(true);
    });

    test("should not start polling if already polling", () => {
      syncService.startPolling();
      const firstInterval = syncService.pollInterval;

      syncService.startPolling();

      expect(syncService.pollInterval).toBe(firstInterval);
    });

    test("should perform periodic pulls", async () => {
      const pullSpy = jest.spyOn(syncService, "pull").mockResolvedValue(null);

      syncService.startPolling();

      // Fast-forward time to trigger polling
      jest.advanceTimersByTime(60000); // POLL_INTERVAL is 60 seconds

      expect(pullSpy).toHaveBeenCalled();
    });

    test("should stop polling", () => {
      syncService.startPolling();
      expect(syncService.isPolling).toBe(true);

      syncService.stopPolling();

      expect(syncService.isPolling).toBe(false);
      expect(syncService.pollInterval).toBe(null);
    });

    test("should handle poll errors gracefully", () => {
      const pullSpy = jest
        .spyOn(syncService, "pull")
        .mockRejectedValue(new Error("Pull failed"));

      syncService.startPolling();

      // Should not throw error even if pull fails
      expect(() => {
        jest.advanceTimersByTime(60000);
      }).not.toThrow();

      expect(pullSpy).toHaveBeenCalled();
    });
  });

  describe("Event Listeners", () => {
    test("should add and remove listeners", () => {
      const callback = jest.fn();

      const unsubscribe = syncService.addListener(callback);

      expect(syncService.listeners.has(callback)).toBe(true);

      unsubscribe();

      expect(syncService.listeners.has(callback)).toBe(false);
    });

    test("should notify listeners of events", () => {
      const callback = jest.fn();
      syncService.addListener(callback);

      syncService.notifyListeners("test-event", { data: "test" });

      expect(callback).toHaveBeenCalledWith("test-event", { data: "test" });
    });

    test("should handle listener callback errors", () => {
      const goodCallback = jest.fn();
      const badCallback = jest.fn(() => {
        throw new Error("Callback error");
      });

      syncService.addListener(goodCallback);
      syncService.addListener(badCallback);

      // Should not throw error even if one callback fails
      expect(() => {
        syncService.notifyListeners("test-event", {});
      }).not.toThrow();

      expect(goodCallback).toHaveBeenCalled();
      expect(badCallback).toHaveBeenCalled();
    });
  });

  describe("Data Callbacks", () => {
    test("should set and call data callback on pull", async () => {
      const callback = jest.fn();
      const testData = { test: "data" };

      await syncService.init(TEST_RECOVERY_PHRASE);
      syncService.setDataCallback(callback);

      mockEncryptionService.decrypt.mockReturnValue(testData);

      await syncService.pull();

      expect(callback).toHaveBeenCalledWith(testData);
    });
  });

  describe("Utility Methods", () => {
    beforeEach(async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should generate invite code", () => {
      const phrase = TEST_RECOVERY_PHRASE;

      const inviteCode = syncService.generateInviteCode(phrase);

      expect(inviteCode).toBe(phrase.toUpperCase());
    });

    test("should join from invite code", async () => {
      const inviteCode = TEST_RECOVERY_PHRASE.toUpperCase();
      const mockData = { joined: "data" };

      mockEncryptionService.decrypt.mockReturnValue(mockData);

      const result = await syncService.joinFromInvite(inviteCode);

      expect(result).toEqual(mockData);
      expect(syncService.isPolling).toBe(true);
    });

    test("should reject invalid invite code", async () => {
      const invalidCodes = ["toolong123456789", "short", "invalid-chars-!@#"];

      for (const code of invalidCodes) {
        await expect(syncService.joinFromInvite(code)).rejects.toThrow(
          "Invalid invite code",
        );
      }
    });

    test("should get sync status", () => {
      const status = syncService.getStatus();

      expect(status).toHaveProperty("initialized");
      expect(status).toHaveProperty("polling");
      expect(status).toHaveProperty("lastPull");
      expect(status).toHaveProperty("syncId");
    });

    test("should check if sync is enabled", () => {
      expect(syncService.isSyncEnabled()).toBe(true);
    });

    test("should get sync ID", () => {
      const syncId = syncService.getSyncId();

      expect(syncId).toBeDefined();
    });

    test("should enable sync", async () => {
      const phrase = TEST_RECOVERY_PHRASE;
      const testData = createTestProfileData();

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = await syncService.enableSync(phrase, true);

      expect(result).toBe(true);
      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith(testData);
    });

    test("should disable sync", async () => {
      await syncService.disableSync();

      expect(syncService.syncId).toBe(null);
      expect(syncService.isPolling).toBe(false);
    });

    test("should reset sync data", async () => {
      syncService.startPolling();

      await syncService.reset();

      expect(syncService.syncId).toBe(null);
      expect(syncService.isPolling).toBe(false);
      expect(syncService.lastPullTime).toBe(null);
    });

    test("should push data with alias method", async () => {
      const testData = createTestProfileData();

      const result = await syncService.pushData(testData);

      expect(result).toEqual({ success: true });
    });

    test("should pull data with alias method", async () => {
      const mockData = { test: "pulled data" };
      const callback = jest.fn();

      mockEncryptionService.decrypt.mockReturnValue(mockData);
      syncService.setDataCallback(callback);

      const result = await syncService.pullData();

      expect(result).toEqual(mockData);
      expect(callback).toHaveBeenCalledWith(mockData);
    });

    test("should generate recovery phrase", () => {
      const phrase = syncService.generateRecoveryPhrase();

      expect(phrase).toBeDefined();
      expect(mockEncryptionService.generateRecoveryPhrase).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    test("should handle network timeout", async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);

      server.use(
        http.post("/qual/api/sync_push.php", () => {
          // Simulate network timeout
          return new Promise(() => {}); // Never resolves
        }),
      );

      const testData = createTestProfileData();

      // This would timeout in real scenario, but we can test the setup
      syncService.push(testData);

      // Clean up
      syncService.pendingPush && clearTimeout(syncService.pendingPush);
    });

    test("should handle malformed server responses", async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);

      server.use(
        http.post("/qual/api/sync_push.php", () => {
          return new HttpResponse("invalid json");
        }),
      );

      const testData = createTestProfileData();

      await expect(syncService.push(testData)).rejects.toThrow();
    });

    test("should handle encryption failures", async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);

      mockEncryptionService.encrypt.mockImplementation(() => {
        throw new Error("Encryption failed");
      });

      const testData = createTestProfileData();

      await expect(syncService.push(testData)).rejects.toThrow();
    });

    test("should handle decryption failures", async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);

      mockEncryptionService.decrypt.mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      await expect(syncService.pull()).rejects.toThrow();
    });
  });
});
