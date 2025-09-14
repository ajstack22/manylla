import manyllaMinimalSyncService from "../manyllaMinimalSyncServiceWeb";
import manyllaEncryptionService from "../manyllaEncryptionService";
import {
  TEST_RECOVERY_PHRASE,
  createTestProfileData,
  waitForAsync,
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

// Mock conflictResolver
jest.mock("../conflictResolver", () => ({
  resolve: jest.fn((local, remote) => ({
    ...local,
    ...remote,
    resolved: true,
  })),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(global, "localStorage", { value: mockLocalStorage });

// Mock fetch
global.fetch = jest.fn();

describe("ManyllaMinimalSyncService (Comprehensive)", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset service state
    manyllaMinimalSyncService.syncId = null;
    manyllaMinimalSyncService.isPolling = false;
    manyllaMinimalSyncService.pollInterval = null;
    manyllaMinimalSyncService.lastPullTime = null;
    manyllaMinimalSyncService.pendingPush = null;
    manyllaMinimalSyncService.listeners = new Set();
    manyllaMinimalSyncService.dataCallback = null;

    // Mock successful fetch by default
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    // Clean up timers
    manyllaMinimalSyncService.stopPolling();
    if (manyllaMinimalSyncService.pendingPush) {
      clearTimeout(manyllaMinimalSyncService.pendingPush);
    }
  });

  describe("Initialization", () => {
    test("should initialize with valid recovery phrase", async () => {
      const result = await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);

      expect(result).toBe(true);
      expect(manyllaEncryptionService.init).toHaveBeenCalledWith(
        TEST_RECOVERY_PHRASE,
      );
      expect(manyllaMinimalSyncService.syncId).toBeTruthy();
    });

    test("should reject invalid recovery phrase - too short", async () => {
      await expect(manyllaMinimalSyncService.init("tooshort")).rejects.toThrow(
        "Invalid recovery phrase format",
      );
    });

    test("should reject invalid recovery phrase - too long", async () => {
      await expect(
        manyllaMinimalSyncService.init("a".repeat(33)),
      ).rejects.toThrow("Invalid recovery phrase format");
    });

    test("should reject null recovery phrase", async () => {
      await expect(manyllaMinimalSyncService.init(null)).rejects.toThrow(
        "Invalid recovery phrase format",
      );
    });

    test("should handle health check failure during init", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Service Unavailable",
      });

      // Should still succeed but log error
      const result = await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);
      expect(result).toBe(true);
    });

    test("should handle health check network error during init", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      // Should still succeed but log error
      const result = await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);
      expect(result).toBe(true);
    });
  });

  describe("Health Check", () => {
    test("should return true for healthy service", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "healthy" }),
      });

      const isHealthy = await manyllaMinimalSyncService.checkHealth();

      expect(isHealthy).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sync_health.php"),
        expect.objectContaining({
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    test("should return false for unhealthy service", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "unhealthy" }),
      });

      const isHealthy = await manyllaMinimalSyncService.checkHealth();
      expect(isHealthy).toBe(false);
    });

    test("should return false on network error", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const isHealthy = await manyllaMinimalSyncService.checkHealth();
      expect(isHealthy).toBe(false);
    });

    test("should return false on invalid response", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      const isHealthy = await manyllaMinimalSyncService.checkHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe("Push Operation", () => {
    beforeEach(async () => {
      await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should push data successfully", async () => {
      const testData = createTestProfileData();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, timestamp: Date.now() }),
      });

      const result = await manyllaMinimalSyncService.push(testData);

      expect(result.success).toBe(true);
      expect(manyllaEncryptionService.encrypt).toHaveBeenCalledWith(testData);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sync_push.php"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("sync_id"),
        }),
      );
    });

    test("should debounce multiple push calls", async () => {
      const testData = createTestProfileData();

      // Start multiple pushes quickly
      const promise1 = manyllaMinimalSyncService.push(testData);
      const promise2 = manyllaMinimalSyncService.push(testData);
      const promise3 = manyllaMinimalSyncService.push(testData);

      // Wait for debounce period
      await Promise.all([promise1, promise2, promise3]);

      // Should only make one fetch call due to debouncing
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test("should retry on server error", async () => {
      const testData = createTestProfileData();

      fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const result = await manyllaMinimalSyncService.push(testData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries + success
    });

    test("should fail after max retries", async () => {
      const testData = createTestProfileData();

      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(manyllaMinimalSyncService.push(testData)).rejects.toThrow();

      expect(fetch).toHaveBeenCalledTimes(3); // Max retries
    });

    test("should handle 401 unauthorized error", async () => {
      const testData = createTestProfileData();

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(manyllaMinimalSyncService.push(testData)).rejects.toThrow(
        "Invalid sync credentials",
      );
    });

    test("should fail when not initialized", async () => {
      manyllaMinimalSyncService.syncId = null;

      await expect(manyllaMinimalSyncService.push({})).rejects.toThrow(
        "Sync not initialized",
      );
    });

    test("should fail when encryption service not initialized", async () => {
      manyllaEncryptionService.isInitialized.mockReturnValueOnce(false);

      await expect(manyllaMinimalSyncService.push({})).rejects.toThrow(
        "Sync not initialized",
      );
    });

    test("should notify listeners on successful push", async () => {
      const testData = createTestProfileData();
      const listener = jest.fn();

      manyllaMinimalSyncService.addListener(listener);

      await manyllaMinimalSyncService.push(testData);

      expect(listener).toHaveBeenCalledWith("pushed", testData);
    });

    test("should notify listeners on push error", async () => {
      const testData = createTestProfileData();
      const listener = jest.fn();

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      manyllaMinimalSyncService.addListener(listener);

      try {
        await manyllaMinimalSyncService.push(testData);
      } catch (error) {
        // Expected to fail
      }

      expect(listener).toHaveBeenCalledWith("push-error", expect.any(Object));
    });
  });

  describe("Pull Operation", () => {
    beforeEach(async () => {
      await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should pull data successfully", async () => {
      const encryptedData = "encrypted_test_data";
      const decryptedData = createTestProfileData();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: encryptedData,
          }),
      });

      manyllaEncryptionService.decrypt.mockReturnValueOnce(decryptedData);

      const result = await manyllaMinimalSyncService.pull();

      expect(result).toEqual(decryptedData);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sync_pull.php?sync_id="),
        expect.objectContaining({ method: "GET" }),
      );
      expect(manyllaEncryptionService.decrypt).toHaveBeenCalledWith(
        encryptedData,
      );
    });

    test("should return null when no data found", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: "No data found",
          }),
      });

      const result = await manyllaMinimalSyncService.pull();

      expect(result).toBeNull();
    });

    test("should return null when no data in response", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: null,
          }),
      });

      const result = await manyllaMinimalSyncService.pull();

      expect(result).toBeNull();
    });

    test("should handle 401 unauthorized error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(manyllaMinimalSyncService.pull()).rejects.toThrow(
        "Invalid sync credentials",
      );
    });

    test("should handle 500 server error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(manyllaMinimalSyncService.pull()).rejects.toThrow(
        "Server error: Internal Server Error",
      );
    });

    test("should fail when not initialized", async () => {
      manyllaMinimalSyncService.syncId = null;

      await expect(manyllaMinimalSyncService.pull()).rejects.toThrow(
        "Sync not initialized",
      );
    });

    test("should update lastPullTime on successful pull", async () => {
      const before = Date.now();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: "encrypted_data",
          }),
      });

      await manyllaMinimalSyncService.pull();

      expect(manyllaMinimalSyncService.lastPullTime).toBeGreaterThanOrEqual(
        before,
      );
    });

    test("should call data callback on successful pull", async () => {
      const testData = createTestProfileData();
      const callback = jest.fn();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: "encrypted_data",
          }),
      });

      manyllaEncryptionService.decrypt.mockReturnValueOnce(testData);
      manyllaMinimalSyncService.setDataCallback(callback);

      await manyllaMinimalSyncService.pull();

      expect(callback).toHaveBeenCalledWith(testData);
    });

    test("should notify listeners on successful pull", async () => {
      const testData = createTestProfileData();
      const listener = jest.fn();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: "encrypted_data",
          }),
      });

      manyllaEncryptionService.decrypt.mockReturnValueOnce(testData);
      manyllaMinimalSyncService.addListener(listener);

      await manyllaMinimalSyncService.pull();

      expect(listener).toHaveBeenCalledWith("pulled", testData);
    });

    test("should notify listeners on pull error", async () => {
      const listener = jest.fn();

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      manyllaMinimalSyncService.addListener(listener);

      try {
        await manyllaMinimalSyncService.pull();
      } catch (error) {
        // Expected to fail
      }

      expect(listener).toHaveBeenCalledWith("pull-error", expect.any(Object));
    });
  });

  describe("Polling", () => {
    beforeEach(async () => {
      await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should start polling", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: null }),
      });

      manyllaMinimalSyncService.startPolling();

      expect(manyllaMinimalSyncService.isPolling).toBe(true);
      expect(manyllaMinimalSyncService.pollInterval).toBeTruthy();

      // Wait for initial pull
      await waitForAsync(50);
      expect(fetch).toHaveBeenCalled();
    });

    test("should not start polling if already polling", () => {
      manyllaMinimalSyncService.isPolling = true;
      manyllaMinimalSyncService.pollInterval = "existing";

      manyllaMinimalSyncService.startPolling();

      expect(manyllaMinimalSyncService.pollInterval).toBe("existing");
    });

    test("should stop polling", () => {
      manyllaMinimalSyncService.isPolling = true;
      manyllaMinimalSyncService.pollInterval = setTimeout(() => {}, 1000);

      manyllaMinimalSyncService.stopPolling();

      expect(manyllaMinimalSyncService.isPolling).toBe(false);
      expect(manyllaMinimalSyncService.pollInterval).toBeNull();
    });

    test("should handle polling errors gracefully", async () => {
      fetch.mockRejectedValue(new Error("Network error"));

      manyllaMinimalSyncService.startPolling();

      // Should not throw error
      await waitForAsync(100);
      expect(manyllaMinimalSyncService.isPolling).toBe(true);
    });
  });

  describe("Listener Management", () => {
    test("should add and remove listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const unsubscribe1 = manyllaMinimalSyncService.addListener(listener1);
      const unsubscribe2 = manyllaMinimalSyncService.addListener(listener2);

      expect(manyllaMinimalSyncService.listeners.size).toBe(2);

      unsubscribe1();
      expect(manyllaMinimalSyncService.listeners.size).toBe(1);

      unsubscribe2();
      expect(manyllaMinimalSyncService.listeners.size).toBe(0);
    });

    test("should notify all listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const testData = { test: "data" };

      manyllaMinimalSyncService.addListener(listener1);
      manyllaMinimalSyncService.addListener(listener2);

      manyllaMinimalSyncService.notifyListeners("test-event", testData);

      expect(listener1).toHaveBeenCalledWith("test-event", testData);
      expect(listener2).toHaveBeenCalledWith("test-event", testData);
    });

    test("should handle listener errors gracefully", () => {
      const errorListener = jest.fn(() => {
        throw new Error("Listener error");
      });
      const goodListener = jest.fn();

      manyllaMinimalSyncService.addListener(errorListener);
      manyllaMinimalSyncService.addListener(goodListener);

      // Should not throw error
      manyllaMinimalSyncService.notifyListeners("test-event", {});

      expect(errorListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe("Local Data Management", () => {
    test("should get local data from localStorage", () => {
      const testData = createTestProfileData();
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(testData));

      const result = manyllaMinimalSyncService.getLocalData();

      expect(result).toEqual(testData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("manylla_profile");
    });

    test("should return null when localStorage is empty", () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = manyllaMinimalSyncService.getLocalData();

      expect(result).toBeNull();
    });

    test("should return null on localStorage JSON parse error", () => {
      mockLocalStorage.getItem.mockReturnValueOnce("invalid-json");

      const result = manyllaMinimalSyncService.getLocalData();

      expect(result).toBeNull();
    });
  });

  describe("Invite Code Management", () => {
    test("should generate invite code from recovery phrase", () => {
      const phrase = TEST_RECOVERY_PHRASE;

      const inviteCode = manyllaMinimalSyncService.generateInviteCode(phrase);

      expect(inviteCode).toBe(phrase.toUpperCase());
    });

    test("should join from valid invite code", async () => {
      const inviteCode = TEST_RECOVERY_PHRASE.toUpperCase();
      const testData = createTestProfileData();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: "encrypted_data",
          }),
      });

      manyllaEncryptionService.decrypt.mockReturnValueOnce(testData);

      const result = await manyllaMinimalSyncService.joinFromInvite(inviteCode);

      expect(result).toEqual(testData);
      expect(manyllaMinimalSyncService.isPolling).toBe(true);
    });

    test("should reject invalid invite code - too short", async () => {
      await expect(
        manyllaMinimalSyncService.joinFromInvite("short"),
      ).rejects.toThrow("Invalid invite code");
    });

    test("should reject invalid invite code - too long", async () => {
      await expect(
        manyllaMinimalSyncService.joinFromInvite("A".repeat(33)),
      ).rejects.toThrow("Invalid invite code");
    });

    test("should clean invite code with spaces and dashes", async () => {
      const messyCode = "A1B2-C3D4 E5F6-G7H8 I9J0-K1L2 M3N4-O5P6";

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: "encrypted_data",
          }),
      });

      await manyllaMinimalSyncService.joinFromInvite(messyCode);

      // Should have initialized with cleaned code
      expect(manyllaMinimalSyncService.syncId).toBeTruthy();
    });
  });

  describe("Service Status and Management", () => {
    beforeEach(async () => {
      await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should get service status", () => {
      manyllaMinimalSyncService.startPolling();
      manyllaMinimalSyncService.lastPullTime = 12345;

      const status = manyllaMinimalSyncService.getStatus();

      expect(status).toEqual({
        initialized: true,
        polling: true,
        lastPull: 12345,
        syncId: manyllaMinimalSyncService.syncId,
      });
    });

    test("should check if sync is enabled", () => {
      manyllaEncryptionService.isInitialized.mockReturnValueOnce(true);

      const enabled = manyllaMinimalSyncService.isSyncEnabled();

      expect(enabled).toBe(true);
    });

    test("should return false if encryption service not initialized", () => {
      manyllaEncryptionService.isInitialized.mockReturnValueOnce(false);

      const enabled = manyllaMinimalSyncService.isSyncEnabled();

      expect(enabled).toBe(false);
    });

    test("should get sync ID", () => {
      const syncId = manyllaMinimalSyncService.getSyncId();

      expect(syncId).toBe(manyllaMinimalSyncService.syncId);
    });

    test("should set data callback", () => {
      const callback = jest.fn();

      manyllaMinimalSyncService.setDataCallback(callback);

      expect(manyllaMinimalSyncService.dataCallback).toBe(callback);
    });

    test("should reset service state", async () => {
      manyllaMinimalSyncService.startPolling();
      manyllaMinimalSyncService.lastPullTime = 12345;

      await manyllaMinimalSyncService.reset();

      expect(manyllaMinimalSyncService.isPolling).toBe(false);
      expect(manyllaMinimalSyncService.syncId).toBeNull();
      expect(manyllaMinimalSyncService.lastPullTime).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "manylla_recovery_phrase",
      );
    });
  });

  describe("Compatibility Methods", () => {
    beforeEach(async () => {
      await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should enable sync with new sync", async () => {
      const testData = createTestProfileData();
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(testData));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await manyllaMinimalSyncService.enableSync(
        TEST_RECOVERY_PHRASE,
        true,
      );

      expect(result).toBe(true);
      expect(manyllaMinimalSyncService.isPolling).toBe(true);
      // Should push initial data for new sync
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sync_push.php"),
        expect.any(Object),
      );
    });

    test("should enable sync without pushing for existing sync", async () => {
      const result = await manyllaMinimalSyncService.enableSync(
        TEST_RECOVERY_PHRASE,
        false,
      );

      expect(result).toBe(true);
      expect(manyllaMinimalSyncService.isPolling).toBe(true);
      // Should not push for existing sync
      expect(fetch).not.toHaveBeenCalled();
    });

    test("should disable sync", async () => {
      manyllaMinimalSyncService.startPolling();

      await manyllaMinimalSyncService.disableSync();

      expect(manyllaMinimalSyncService.isPolling).toBe(false);
      expect(manyllaMinimalSyncService.syncId).toBeNull();
    });

    test("should push data with compatibility method", async () => {
      const testData = createTestProfileData();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await manyllaMinimalSyncService.pushData(testData);

      expect(result.success).toBe(true);
    });

    test("should pull data with compatibility method and call callback", async () => {
      const testData = createTestProfileData();
      const callback = jest.fn();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: "encrypted_data",
          }),
      });

      manyllaEncryptionService.decrypt.mockReturnValueOnce(testData);
      manyllaMinimalSyncService.setDataCallback(callback);

      const result = await manyllaMinimalSyncService.pullData();

      expect(result).toEqual(testData);
      expect(callback).toHaveBeenCalledWith(testData);
    });

    test("should generate recovery phrase", () => {
      const phrase = manyllaMinimalSyncService.generateRecoveryPhrase();

      expect(
        manyllaEncryptionService.generateRecoveryPhrase,
      ).toHaveBeenCalled();
      expect(typeof phrase).toBe("string");
    });
  });

  describe("Error Edge Cases", () => {
    beforeEach(async () => {
      await manyllaMinimalSyncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should handle network timeout", async () => {
      fetch.mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error("Network timeout")), 100);
          }),
      );

      await expect(manyllaMinimalSyncService.push({})).rejects.toThrow();
    });

    test("should handle malformed JSON response", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(manyllaMinimalSyncService.pull()).rejects.toThrow();
    });

    test("should handle encryption service errors", async () => {
      manyllaEncryptionService.encrypt.mockImplementation(() => {
        throw new Error("Encryption failed");
      });

      await expect(manyllaMinimalSyncService.push({})).rejects.toThrow();
    });

    test("should handle decryption service errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: "encrypted_data",
          }),
      });

      manyllaEncryptionService.decrypt.mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      await expect(manyllaMinimalSyncService.pull()).rejects.toThrow();
    });
  });
});
