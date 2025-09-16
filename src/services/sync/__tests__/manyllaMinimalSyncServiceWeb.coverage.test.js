/**
 * Coverage tests for manyllaMinimalSyncServiceWeb
 * Targets specific uncovered lines to achieve 80%+ coverage
 */

import { jest } from "@jest/globals";
import manyllaEncryptionService from "../manyllaEncryptionService";
import conflictResolver from "../conflictResolver";
import { ManyllaMinimalSyncService } from "../manyllaMinimalSyncServiceWeb";
import { SyncError, NetworkError, ErrorHandler } from "../../../utils/errors";

// Mock dependencies
jest.mock("../manyllaEncryptionService");
jest.mock("../conflictResolver");
jest.mock("../../../utils/errors");

// Mock fetch globally
global.fetch = jest.fn();
const fetch = global.fetch;

// Mock localStorage properly using Object.defineProperty
Object.defineProperty(global, "localStorage", {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe("ManyllaMinimalSyncServiceWeb - Coverage Tests", () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    service = new ManyllaMinimalSyncService();

    // Reduce debounce for faster testing
    service.PUSH_DEBOUNCE = 10; // 10ms instead of 2000ms

    // Mock encryption service
    manyllaEncryptionService.init.mockResolvedValue(true);
    manyllaEncryptionService.isInitialized.mockReturnValue(true);
    manyllaEncryptionService.encrypt.mockReturnValue("encrypted-data");
    manyllaEncryptionService.decrypt.mockReturnValue({ data: "decrypted" });

    // Mock conflict resolver
    conflictResolver.mergeProfiles.mockImplementation(
      (local, remote) => remote,
    );

    // Mock error handler
    ErrorHandler.log.mockImplementation(() => {});
    ErrorHandler.normalize.mockImplementation((error) => error);

    // Mock localStorage
    global.localStorage.getItem.mockReturnValue(null);
    global.localStorage.setItem.mockImplementation(() => {});

    // Set up sync state for tests that need it
    service.syncId = "test-sync-id-12345678901234567890";
    global.localStorage.removeItem.mockImplementation(() => {});
  });

  describe("Health Check Edge Cases", () => {
    test("should handle health check failure during init", async () => {
      const phrase = "a1b2c3d4e5f678901234567890123456";

      // Mock health check to fail
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await service.init(phrase);

      expect(result).toBe(true); // Should still succeed
      expect(ErrorHandler.log).toHaveBeenCalled();
    });

    test("should handle health check returning unhealthy status", async () => {
      const phrase = "a1b2c3d4e5f678901234567890123456";

      // Mock health check to return unhealthy
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: "unhealthy" }),
      });

      const result = await service.init(phrase);

      expect(result).toBe(true); // Should still succeed
      expect(ErrorHandler.log).toHaveBeenCalled();
    });
  });

  describe("Push Error Scenarios", () => {
    test("should handle push with invalid response format", async () => {
      const data = { test: "data" };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, error: "Custom error" }),
      });

      await expect(service.push(data)).rejects.toThrow(SyncError);
    });

    test("should handle push with response missing success field", async () => {
      const data = { test: "data" };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ error: "Missing success field" }),
      });

      await expect(service.push(data)).rejects.toThrow(SyncError);
    });
  });

  describe("Pull Error Scenarios", () => {
    test("should handle pull with server error status", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(service.pull()).rejects.toThrow(NetworkError);
    });

    test("should handle pull with generic error message", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ success: false, error: "Generic pull error" }),
      });

      await expect(service.pull()).rejects.toThrow(SyncError);
    });
  });

  describe("Invite Code Edge Cases", () => {
    test("should handle invalid invite code format in joinFromInvite", async () => {
      await expect(service.joinFromInvite("")).rejects.toThrow(
        "Invalid invite code",
      );
      await expect(service.joinFromInvite("short")).rejects.toThrow(
        "Invalid invite code",
      );
      await expect(
        service.joinFromInvite("TOOLONGTOBEVALIDHEXSTRING123456789"),
      ).rejects.toThrow("Invalid invite code");
    });

    test("should handle null invite code", async () => {
      await expect(service.joinFromInvite(null)).rejects.toThrow(
        "Invalid invite code",
      );
    });

    test("should handle non-hex characters in invite code", async () => {
      await expect(
        service.joinFromInvite("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"),
      ).rejects.toThrow("Invalid invite code");
    });
  });

  describe("Local Data Management", () => {
    test("should handle localStorage errors in getLocalData", () => {
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const result = service.getLocalData();

      expect(result).toBe(null);
    });

    test("should handle invalid JSON in getLocalData", () => {
      global.localStorage.getItem.mockReturnValue("invalid-json");

      const result = service.getLocalData();

      expect(result).toBe(null);
    });

    test("should get local data successfully", () => {
      const testData = { profile: "test" };
      global.localStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = service.getLocalData();

      expect(result).toEqual(testData);
    });
  });

  describe("Reset and Cleanup", () => {
    test("should reset service state", async () => {
      service.isPolling = true;
      service.syncId = "test-id";
      service.lastPullTime = 12345;

      await service.reset();

      expect(service.isPolling).toBe(false);
      expect(service.syncId).toBe(null);
      expect(service.lastPullTime).toBe(null);
      expect(global.localStorage.removeItem).toHaveBeenCalledWith(
        "manylla_recovery_phrase",
      );
    });
  });

  describe("Sync Enablement", () => {
    test("should enable sync with new data push", async () => {
      const phrase = "a1b2c3d4e5f678901234567890123456";
      const localData = { profile: "local" };

      jest.spyOn(service, "getLocalData").mockReturnValue(localData);
      const pushSpy = jest.spyOn(service, "push").mockResolvedValue(true);
      const startPollingSpy = jest.spyOn(service, "startPolling");

      const result = await service.enableSync(phrase, true);

      expect(result).toBe(true);
      expect(pushSpy).toHaveBeenCalledWith(localData);
      expect(startPollingSpy).toHaveBeenCalled();
    });

    test("should enable sync without pushing when no local data", async () => {
      const phrase = "a1b2c3d4e5f678901234567890123456";

      jest.spyOn(service, "getLocalData").mockReturnValue(null);
      const pushSpy = jest.spyOn(service, "push");
      const startPollingSpy = jest.spyOn(service, "startPolling");

      const result = await service.enableSync(phrase, true);

      expect(result).toBe(true);
      expect(pushSpy).not.toHaveBeenCalled();
      expect(startPollingSpy).toHaveBeenCalled();
    });

    test("should enable sync for existing sync without new data", async () => {
      const phrase = "a1b2c3d4e5f678901234567890123456";

      const pushSpy = jest.spyOn(service, "push");
      const startPollingSpy = jest.spyOn(service, "startPolling");

      const result = await service.enableSync(phrase, false);

      expect(result).toBe(true);
      expect(pushSpy).not.toHaveBeenCalled();
      expect(startPollingSpy).toHaveBeenCalled();
    });
  });

  describe("Data Callback Integration", () => {
    test("should call data callback after pullData", async () => {
      service.syncId = "test-sync-id";
      const callback = jest.fn();
      service.setDataCallback(callback);

      const mockData = { profile: "test" };
      jest.spyOn(service, "pull").mockResolvedValue(mockData);

      const result = await service.pullData();

      expect(callback).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
    });

    test("should not call callback when pullData returns null", async () => {
      service.syncId = "test-sync-id";
      const callback = jest.fn();
      service.setDataCallback(callback);

      jest.spyOn(service, "pull").mockResolvedValue(null);

      const result = await service.pullData();

      expect(callback).not.toHaveBeenCalled();
      expect(result).toBe(null);
    });

    test("should handle pullData with force pull parameter", async () => {
      service.syncId = "test-sync-id";
      const mockData = { profile: "test" };
      const pullSpy = jest.spyOn(service, "pull").mockResolvedValue(mockData);

      const result = await service.pullData(true);

      expect(pullSpy).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe("Status and State", () => {
    test("should get sync status", () => {
      service.syncId = "test-id";
      service.isPolling = true;
      service.lastPullTime = 12345;

      const status = service.getStatus();

      expect(status).toEqual({
        initialized: true,
        polling: true,
        lastPull: 12345,
        syncId: "test-id",
      });
    });

    test("should check if sync is enabled", () => {
      service.syncId = "test-id";
      manyllaEncryptionService.isInitialized.mockReturnValue(true);

      expect(service.isSyncEnabled()).toBe(true);

      service.syncId = null;
      expect(service.isSyncEnabled()).toBe(false);
    });

    test("should get sync ID", () => {
      service.syncId = "test-sync-id";

      expect(service.getSyncId()).toBe("test-sync-id");
    });
  });

  describe("Alias Methods", () => {
    test("should use pushData alias", async () => {
      const data = { test: "data" };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await service.pushData(data);

      expect(result.success).toBe(true);
    });

    test("should disable sync using alias", async () => {
      const resetSpy = jest.spyOn(service, "reset");

      await service.disableSync();

      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe("Recovery Phrase Generation", () => {
    test("should generate recovery phrase using encryption service", () => {
      manyllaEncryptionService.generateRecoveryPhrase.mockReturnValue(
        "generated-phrase",
      );

      const phrase = service.generateRecoveryPhrase();

      expect(phrase).toBe("generated-phrase");
      expect(
        manyllaEncryptionService.generateRecoveryPhrase,
      ).toHaveBeenCalled();
    });
  });

  describe("Invite Code Generation", () => {
    test("should generate invite code in uppercase", () => {
      const phrase = "abcdef1234567890abcdef1234567890";
      const inviteCode = service.generateInviteCode(phrase);

      expect(inviteCode).toBe("ABCDEF1234567890ABCDEF1234567890");
    });
  });

  describe("Error Handling in Listeners", () => {
    test("should handle listener callback errors gracefully", () => {
      const faultyListener = jest.fn(() => {
        throw new Error("Listener error");
      });
      const goodListener = jest.fn();

      service.addListener(faultyListener);
      service.addListener(goodListener);

      service.notifyListeners("test-event", { data: "test" });

      expect(faultyListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();
      expect(ErrorHandler.log).toHaveBeenCalled();
    });
  });
});
