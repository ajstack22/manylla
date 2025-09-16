/**
 * Edge case tests to boost coverage for manyllaMinimalSyncServiceWeb.js
 * Targets specific uncovered lines for error handling and edge cases
 */

import ManyllaMinimalSyncServiceWeb from "../manyllaMinimalSyncServiceWeb";
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

describe("ManyllaMinimalSyncServiceWeb Edge Cases", () => {
  let syncService;

  beforeEach(() => {
    jest.clearAllMocks();
    syncService = ManyllaMinimalSyncServiceWeb;

    // Reset service state
    syncService.syncId = null;
    syncService.lastPullTime = 0;

    // Setup successful health check by default
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "Sync service is healthy" }),
    });
  });

  describe("HTTP Error Status Codes", () => {
    beforeEach(async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should handle 401 unauthorized in push (line 135-136)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(syncService.push(createTestProfileData())).rejects.toThrow(
        "Invalid sync credentials",
      );
    });

    test("should handle 500 server error in push (line 138-139)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(syncService.push(createTestProfileData())).rejects.toThrow(
        "Server error: Internal Server Error",
      );
    });

    test("should handle 400 bad request in push (line 141)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      await expect(syncService.push(createTestProfileData())).rejects.toThrow(
        "Push failed: Bad Request",
      );
    });

    test("should handle 401 unauthorized in pull (line 202-203)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(syncService.pull()).rejects.toThrow(
        "Invalid sync credentials",
      );
    });

    test("should handle 500 server error in pull (line 205-206)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(syncService.pull()).rejects.toThrow(
        "Server error: Internal Server Error",
      );
    });

    test("should handle 400 bad request in pull (line 208)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      await expect(syncService.pull()).rejects.toThrow(
        "Pull failed: Bad Request",
      );
    });

    test("should handle no data found in pull (line 218)", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: "No data found",
        }),
      });

      const result = await syncService.pull();
      expect(result).toBeNull();
    });

    test("should handle 401 unauthorized in share (line 234-235)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(syncService.share(createTestProfileData())).rejects.toThrow(
        "Invalid sync credentials",
      );
    });

    test("should handle 500 server error in share (line 237-238)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(syncService.share(createTestProfileData())).rejects.toThrow(
        "Server error: Internal Server Error",
      );
    });

    test("should handle 400 bad request in share (line 240)", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      await expect(syncService.share(createTestProfileData())).rejects.toThrow(
        "Share failed: Bad Request",
      );
    });

    test("should handle unsuccessful share response (line 246)", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: "Share creation failed",
        }),
      });

      await expect(syncService.share(createTestProfileData())).rejects.toThrow(
        "Share creation failed",
      );
    });
  });

  describe("Access Share Error Handling", () => {
    test("should handle network errors in accessShare (lines 305-308)", async () => {
      global.fetch.mockRejectedValue(new Error("Network error"));

      await expect(
        syncService.accessShare("share123", "key123"),
      ).rejects.toThrow("Network error");
    });

    test("should handle 404 not found in accessShare", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(
        syncService.accessShare("share123", "key123"),
      ).rejects.toThrow("Access failed: Not Found");
    });

    test("should handle unsuccessful access response", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: "Share not found",
        }),
      });

      await expect(
        syncService.accessShare("share123", "key123"),
      ).rejects.toThrow("Share not found");
    });
  });

  describe("Storage and Local Operations", () => {
    test("should handle JSON parse errors in getStoredProfiles (line 322)", async () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      const result = await syncService.getStoredProfiles();
      expect(result).toBeNull();
    });

    test("should handle storage errors gracefully", async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      // Should not throw
      await expect(syncService.storeProfilesLocally([])).resolves.not.toThrow();
    });

    test("should clear stored profiles", async () => {
      await syncService.clearStoredProfiles();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "manylla_stored_profiles",
      );
    });
  });

  describe("Invite Code Functions", () => {
    test("should generate invite code (lines 327-330)", () => {
      const recoveryPhrase = "abc123def456";
      const inviteCode = syncService.generateInviteCode(recoveryPhrase);

      expect(inviteCode).toBe("ABC123DEF456");
    });

    test("should handle null invite code", async () => {
      await expect(syncService.joinFromInvite(null)).rejects.toThrow(
        "Invalid invite code",
      );
    });

    test("should handle non-string invite code", async () => {
      await expect(syncService.joinFromInvite(123)).rejects.toThrow(
        "Invalid invite code",
      );
    });

    test("should handle invalid invite code format", async () => {
      await expect(syncService.joinFromInvite("invalid")).rejects.toThrow(
        "Invalid invite code",
      );
    });

    test("should handle invite code with special characters", async () => {
      const inviteCode = "ABC-DEF-012-345-678-9AB-CDE-F01-234-567-89";

      await syncService.joinFromInvite(inviteCode);

      expect(syncService.encryptionService.init).toHaveBeenCalledWith(
        "ABCDEF0123456789ABCDEF0123456789",
      );
    });

    test("should handle failed data pull after join", async () => {
      const inviteCode = "ABCDEF0123456789ABCDEF0123456789";

      // Mock pull to fail
      const originalPull = syncService.pull;
      syncService.pull = jest.fn().mockRejectedValue(new Error("Pull failed"));

      await expect(syncService.joinFromInvite(inviteCode)).rejects.toThrow(
        "Pull failed",
      );

      // Restore original
      syncService.pull = originalPull;
    });
  });

  describe("Service State and Error Conditions", () => {
    test("should handle sync service not enabled", async () => {
      syncService.encryptionService.isEnabled.mockResolvedValue(false);

      await expect(syncService.push(createTestProfileData())).rejects.toThrow(
        "Sync service unavailable",
      );
    });

    test("should handle missing sync ID", async () => {
      syncService.encryptionService.getSyncId.mockResolvedValue(null);

      await expect(syncService.push(createTestProfileData())).rejects.toThrow(
        "Sync service unavailable",
      );
    });

    test("should handle clear operation", async () => {
      await syncService.clear();

      expect(syncService.encryptionService.clear).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "manylla_stored_profiles",
      );
    });
  });

  describe("Successful Operations", () => {
    beforeEach(async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should handle successful share creation", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          shareId: "share123",
          shareKey: "key123",
        }),
      });

      const result = await syncService.share(createTestProfileData());

      expect(result).toEqual({
        shareId: "share123",
        shareKey: "key123",
      });
    });

    test("should handle successful data access", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: "encrypted-share-data",
        }),
      });

      const result = await syncService.accessShare("share123", "key123");

      expect(result).toEqual({ test: "decrypted data" });
    });
  });

  describe("Additional Edge Cases", () => {
    beforeEach(async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);
    });

    test("should handle fetch failures", async () => {
      global.fetch.mockRejectedValue(new Error("Fetch failed"));

      await expect(syncService.push(createTestProfileData())).rejects.toThrow(
        "Fetch failed",
      );
    });

    test("should handle sync failure with error details", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: "Detailed sync error message",
        }),
      });

      await expect(syncService.push(createTestProfileData())).rejects.toThrow(
        "Detailed sync error message",
      );
    });

    test("should handle pull with malformed response", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: "Malformed response",
        }),
      });

      await expect(syncService.pull()).rejects.toThrow("Malformed response");
    });
  });

  describe("Health Check Edge Cases", () => {
    test("should handle health check network failure (line 96)", async () => {
      global.fetch.mockRejectedValue(new Error("Network timeout"));

      const isHealthy = await syncService.checkHealth();
      expect(isHealthy).toBe(false);
    });

    test("should handle health check HTTP error", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
      });

      const isHealthy = await syncService.checkHealth();
      expect(isHealthy).toBe(false);
    });
  });
});
