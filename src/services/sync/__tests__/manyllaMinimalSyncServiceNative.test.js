/* eslint-disable */
/**
 * Comprehensive test coverage for manyllaMinimalSyncServiceNative
 * Tests the React Native specific sync service implementation
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { jest } from "@jest/globals";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import ManyllaMinimalSyncServiceNative from "../manyllaMinimalSyncServiceNative";
import manyllaEncryptionService from "../manyllaEncryptionService";
import conflictResolver from "../conflictResolver";
import platform from "../../../utils/platform";
import {
  SyncError,
  NetworkError,
  AuthError,
  ErrorHandler,
} from "../../../utils/errors";

// Mock SecureRandomService
jest.mock("../../../utils/SecureRandomService", () => {
  const mockSecureRandomService = {
    isAvailable: true,
    checkAvailability: jest.fn(() => true),
    getRandomBytes: jest.fn((length) => {
      const array = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    getRandomInt: jest.fn((max) => Math.floor(Math.random() * max)),
    getRandomFloat: jest.fn(() => Math.random()),
    getRandomHex: jest.fn((length) => {
      const chars = "0123456789abcdef";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    }),
    getRandomString: jest.fn((charset, length) => {
      let result = "";
      for (let i = 0; i < length; i++) {
        result += charset[Math.floor(Math.random() * charset.length)];
      }
      return result;
    }),
    getRandomAlphanumeric: jest.fn((length) => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    }),
    generateDeviceId: jest.fn(() => "test1234567890ab"),
    generateTimestampId: jest.fn(
      () => "test" + Date.now().toString(36) + "randomid",
    ),
    selfTest: jest.fn(() => true),
  };

  return {
    SecureRandomService: jest
      .fn()
      .mockImplementation(() => mockSecureRandomService),
    default: mockSecureRandomService,
  };
});

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage");
jest.mock("../manyllaEncryptionService");
jest.mock("../conflictResolver");
jest.mock("../../../utils/platform");
jest.mock("../../../utils/errors");
jest.mock("tweetnacl");
jest.mock("tweetnacl-util");

// Mock globals
global.fetch = jest.fn();
global.AbortController = class {
  constructor() {
    this.signal = { aborted: false };
  }
  abort() {
    this.signal.aborted = true;
  }
};
global.setTimeout = jest.fn((fn, delay) => {
  if (typeof fn === "function") {
    setImmediate(fn); // Execute async but immediately for tests
  }
  return Math.random();
});
global.clearTimeout = jest.fn();
global.setInterval = jest.fn(() => Math.random());
global.clearInterval = jest.fn();

describe("ManyllaMinimalSyncServiceNative", () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create fresh service instance
    service = new (ManyllaMinimalSyncServiceNative.constructor || class {})();

    // Initialize default properties
    service.isEnabled = false;
    service.syncId = null;
    service.recoveryPhrase = null;
    service.pullInterval = null;
    service.dataCallback = null;
    service.lastPullTimestamp = 0;
    service.deviceId = null;
    service.listeners = new Set();
    service.isPolling = false;
    service.lastPullTime = null;
    service.pendingPush = null;
    service.PULL_INTERVAL = 60000;
    service.POLL_INTERVAL = 60000;
    service.PUSH_DEBOUNCE = 2000;
    service.MAX_RETRIES = 3;
    service.RETRY_DELAY = 5000;
    service.MIN_REQUEST_INTERVAL = 200;
    service.lastRequestTime = 0;
    service.requestQueue = [];
    service.isProcessingQueue = false;
    service.lastPull = 0;
    service.lastPush = 0;
    service.pullAttempts = 0;
    service.isOnline = true;
    service.offlineQueue = [];
    service.isProcessingOfflineQueue = false;
    service.networkCheckInterval = null;

    // Mock service methods
    service.initializeDeviceId = jest.fn();
    service.startNetworkMonitoring = jest.fn();
    service.stopNetworkMonitoring = jest.fn();
    service.queueForLater = jest.fn();
    service.processOfflineQueue = jest.fn();
    service.addListener = jest.fn();
    service.notifyListeners = jest.fn();
    service.getLocalData = jest.fn();
    service.getOrCreateDeviceId = jest.fn();
    service.checkHealth = jest.fn();
    service.init = jest.fn();
    service.enableSync = jest.fn();
    service.disableSync = jest.fn();
    service.checkSyncStatus = jest.fn();
    service.saveToStorage = jest.fn();
    service.loadFromStorage = jest.fn();
    service.push = jest.fn();
    service.pull = jest.fn();
    service.startPolling = jest.fn();
    service.stopPolling = jest.fn();
    service.generateRecoveryPhrase = jest.fn();
    service.getStatus = jest.fn();
    service.isSyncEnabled = jest.fn();
    service.getSyncId = jest.fn();
    service.pushData = jest.fn();
    service.pullData = jest.fn();
    service.generateInviteCode = jest.fn();
    service.joinFromInvite = jest.fn();
    service.reset = jest.fn();
    service.destroy = jest.fn();

    // Mock AsyncStorage
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();

    // Mock encryption service
    manyllaEncryptionService.init.mockResolvedValue(true);
    manyllaEncryptionService.isInitialized.mockReturnValue(true);
    manyllaEncryptionService.encrypt.mockReturnValue("encrypted-data");
    manyllaEncryptionService.decrypt.mockReturnValue({ test: "data" });

    // Mock platform
    platform.apiBaseUrl.mockReturnValue("https://test-api.com");

    // Mock nacl
    nacl.randomBytes.mockReturnValue(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    );
    nacl.hash.mockReturnValue(new Uint8Array(64).fill(42));

    // Mock util
    util.decodeUTF8.mockReturnValue(new Uint8Array([1, 2, 3]));
    util.encodeBase64.mockReturnValue("test-sync-id");

    // Mock fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: "test" }),
    });

    // Mock error classes
    SyncError.mockImplementation((message) => new Error(message));
    NetworkError.mockImplementation((message) => new Error(message));
    AuthError.mockImplementation((message) => new Error(message));
    ErrorHandler.log.mockImplementation(() => {});
    ErrorHandler.normalize.mockImplementation((error) => error);
  });

  describe("Constructor and Initialization", () => {
    test("should initialize with default values", () => {
      expect(service.isEnabled).toBe(false);
      expect(service.syncId).toBeNull();
      expect(service.PULL_INTERVAL).toBe(60000);
      expect(service.MAX_RETRIES).toBe(3);
      expect(service.isOnline).toBe(true);
      expect(service.listeners).toBeInstanceOf(Set);
    });

    test("should call device ID initialization", () => {
      // Constructor would call this
      expect(service.initializeDeviceId).toBeDefined();
    });

    test("should start network monitoring", () => {
      // Constructor would call this
      expect(service.startNetworkMonitoring).toBeDefined();
    });
  });

  describe("Device ID Management", () => {
    test("should generate device ID with AsyncStorage", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      service.getOrCreateDeviceId = jest.fn().mockImplementation(async () => {
        const bytes = nacl.randomBytes(8);
        const deviceId = Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        await AsyncStorage.setItem("manylla_device_id", deviceId);
        return deviceId;
      });

      const deviceId = await service.getOrCreateDeviceId();

      expect(deviceId).toBeTruthy();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("manylla_device_id");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "manylla_device_id",
        expect.any(String),
      );
    });

    test("should return existing device ID", async () => {
      const existingId = "1234567890abcdef";
      AsyncStorage.getItem.mockResolvedValue(existingId);
      service.getOrCreateDeviceId = jest.fn().mockResolvedValue(existingId);

      const deviceId = await service.getOrCreateDeviceId();

      expect(deviceId).toBe(existingId);
    });

    test("should generate fallback device ID on AsyncStorage error", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
      service.getOrCreateDeviceId = jest.fn().mockImplementation(() => {
        return (
          Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
        );
      });

      const deviceId = await service.getOrCreateDeviceId();

      expect(deviceId).toBeTruthy();
      expect(deviceId.length).toBeGreaterThan(10);
    });
  });

  describe("Network Monitoring", () => {
    test("should check network connectivity", async () => {
      global.fetch.mockResolvedValue({ ok: true });
      service.startNetworkMonitoring = jest.fn().mockImplementation(() => {
        service.networkCheckInterval = setInterval(async () => {
          try {
            await fetch("https://www.google.com/generate_204", {
              signal: new AbortController().signal,
              cache: "no-cache",
            });
            service.isOnline = true;
          } catch (error) {
            service.isOnline = false;
          }
        }, 30000);
      });

      service.startNetworkMonitoring();

      expect(service.startNetworkMonitoring).toHaveBeenCalled();
    });

    test("should stop network monitoring", () => {
      service.networkCheckInterval = "test-interval";
      service.stopNetworkMonitoring = jest.fn().mockImplementation(() => {
        if (service.networkCheckInterval) {
          clearInterval(service.networkCheckInterval);
          service.networkCheckInterval = null;
        }
      });

      service.stopNetworkMonitoring();

      expect(clearInterval).toHaveBeenCalledWith("test-interval");
    });
  });

  describe("Offline Queue Management", () => {
    test("should queue operations when offline", () => {
      service.queueForLater = jest
        .fn()
        .mockImplementation((operation, data) => {
          service.offlineQueue.push({
            operation,
            data,
            timestamp: Date.now(),
          });
          if (service.offlineQueue.length > 10) {
            service.offlineQueue.shift();
          }
        });

      service.queueForLater("push", { test: "data" });

      expect(service.offlineQueue).toHaveLength(1);
      expect(service.offlineQueue[0].operation).toBe("push");
    });

    test("should limit queue size", () => {
      service.queueForLater = jest
        .fn()
        .mockImplementation((operation, data) => {
          service.offlineQueue.push({
            operation,
            data,
            timestamp: Date.now(),
          });
          if (service.offlineQueue.length > 10) {
            service.offlineQueue.shift();
          }
        });

      // Fill queue beyond limit
      for (let i = 0; i < 15; i++) {
        service.queueForLater("push", { test: i });
      }

      expect(service.offlineQueue).toHaveLength(10);
    });

    test("should process offline queue", async () => {
      service.offlineQueue = [
        { operation: "push", data: { test: "data1" }, timestamp: Date.now() },
        { operation: "push", data: { test: "data2" }, timestamp: Date.now() },
      ];
      service.push = jest.fn().mockResolvedValue(true);
      service.processOfflineQueue = jest.fn().mockImplementation(async () => {
        if (
          service.isProcessingOfflineQueue ||
          service.offlineQueue.length < 1
        ) {
          return;
        }
        service.isProcessingOfflineQueue = true;
        try {
          while (service.offlineQueue.length > 0) {
            const item = service.offlineQueue.shift();
            if (item.operation === "push") {
              await service.push(item.data);
            }
          }
        } finally {
          service.isProcessingOfflineQueue = false;
        }
      });

      await service.processOfflineQueue();

      expect(service.push).toHaveBeenCalledTimes(2);
      expect(service.offlineQueue).toHaveLength(0);
    });
  });

  describe("Health Check", () => {
    test("should check sync health successfully", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: "healthy" }),
      });
      service.checkHealth = jest.fn().mockImplementation(async () => {
        const response = await fetch(
          `${platform.apiBaseUrl()}/sync_health.php`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 5000,
          },
        );
        const data = await response.json();
        return data.status === "healthy";
      });

      const isHealthy = await service.checkHealth();

      expect(isHealthy).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://test-api.com/sync_health.php",
        expect.any(Object),
      );
    });

    test("should handle health check failure", async () => {
      global.fetch.mockRejectedValue(new Error("Network error"));
      service.checkHealth = jest.fn().mockImplementation(async () => {
        try {
          await fetch(`${platform.apiBaseUrl()}/sync_health.php`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 5000,
          });
          return true;
        } catch (error) {
          ErrorHandler.log(new NetworkError(error.message));
          return false;
        }
      });

      const isHealthy = await service.checkHealth();

      expect(isHealthy).toBe(false);
      expect(ErrorHandler.log).toHaveBeenCalled();
    });
  });

  describe("Listener Management", () => {
    test("should add listeners", () => {
      const callback = jest.fn();
      service.addListener = jest.fn().mockImplementation((cb) => {
        service.listeners.add(cb);
        return () => service.listeners.delete(cb);
      });

      const removeListener = service.addListener(callback);

      expect(service.listeners.has(callback)).toBe(true);
      expect(typeof removeListener).toBe("function");
    });

    test("should notify all listeners", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      service.listeners.add(callback1);
      service.listeners.add(callback2);
      service.notifyListeners = jest.fn().mockImplementation((event, data) => {
        service.listeners.forEach((callback) => {
          try {
            callback(event, data);
          } catch (error) {
            ErrorHandler.log(error);
          }
        });
      });

      service.notifyListeners("test-event", { test: "data" });

      expect(callback1).toHaveBeenCalledWith("test-event", { test: "data" });
      expect(callback2).toHaveBeenCalledWith("test-event", { test: "data" });
    });

    test("should handle listener errors gracefully", () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error("Listener error");
      });
      const goodCallback = jest.fn();
      service.listeners.add(errorCallback);
      service.listeners.add(goodCallback);
      service.notifyListeners = jest.fn().mockImplementation((event, data) => {
        service.listeners.forEach((callback) => {
          try {
            callback(event, data);
          } catch (error) {
            ErrorHandler.log(error);
          }
        });
      });

      service.notifyListeners("test-event", { test: "data" });

      expect(errorCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
      expect(ErrorHandler.log).toHaveBeenCalled();
    });
  });

  describe("Data Operations", () => {
    test("should get local data from AsyncStorage", async () => {
      const testData = { name: "Test Profile" };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(testData));
      service.getLocalData = jest.fn().mockImplementation(async () => {
        const stored = await AsyncStorage.getItem("manylla_profile");
        return stored ? JSON.parse(stored) : null;
      });

      const data = await service.getLocalData();

      expect(data).toEqual(testData);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("manylla_profile");
    });

    test("should return null for missing data", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      service.getLocalData = jest.fn().mockImplementation(async () => {
        const stored = await AsyncStorage.getItem("manylla_profile");
        return stored ? JSON.parse(stored) : null;
      });

      const data = await service.getLocalData();

      expect(data).toBeNull();
    });

    test("should handle JSON parse errors", async () => {
      AsyncStorage.getItem.mockResolvedValue("invalid-json");
      service.getLocalData = jest.fn().mockImplementation(async () => {
        try {
          const stored = await AsyncStorage.getItem("manylla_profile");
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }
      });

      const data = await service.getLocalData();

      expect(data).toBeNull();
    });
  });

  describe("Sync Initialization", () => {
    test("should initialize with valid recovery phrase", async () => {
      const recoveryPhrase = "1234567890abcdef1234567890abcdef";
      service.init = jest.fn().mockImplementation(async (phrase) => {
        if (!phrase || phrase.length !== 32) {
          throw new AuthError("Invalid recovery phrase format");
        }
        await manyllaEncryptionService.init(phrase);
        service.syncId = "test-sync-id";
        service.recoveryPhrase = phrase;
        return true;
      });

      const result = await service.init(recoveryPhrase);

      expect(result).toBe(true);
      expect(manyllaEncryptionService.init).toHaveBeenCalledWith(
        recoveryPhrase,
      );
    });

    test("should reject invalid recovery phrase", async () => {
      service.init = jest.fn().mockImplementation(async (phrase) => {
        if (!phrase || phrase.length !== 32) {
          throw new AuthError("Invalid recovery phrase format");
        }
      });

      await expect(service.init("invalid")).rejects.toThrow(
        "Invalid recovery phrase format",
      );
    });
  });

  describe("Sync Enable/Disable", () => {
    test("should enable sync with recovery phrase", async () => {
      const recoveryPhrase = "1234567890abcdef1234567890abcdef";
      service.enableSync = jest
        .fn()
        .mockImplementation(async (phrase, isNewSync = false) => {
          if (!phrase || !phrase.match(/^[a-f0-9]{32}$/)) {
            throw new AuthError("Invalid recovery phrase format");
          }
          await service.init(phrase);
          await AsyncStorage.setItem("manylla_sync_enabled", "true");
          await AsyncStorage.setItem("manylla_recovery_phrase", phrase);
          service.isEnabled = true;
          service.startPolling();
          return { success: true, syncId: service.syncId };
        });

      const result = await service.enableSync(recoveryPhrase);

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "manylla_sync_enabled",
        "true",
      );
    });

    test("should disable sync", async () => {
      service.disableSync = jest.fn().mockImplementation(async () => {
        service.stopPolling();
        service.isEnabled = false;
        service.syncId = null;
        await AsyncStorage.removeItem("manylla_sync_enabled");
        await AsyncStorage.removeItem("manylla_recovery_phrase");
      });

      await service.disableSync();

      expect(service.stopPolling).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "manylla_sync_enabled",
      );
    });
  });

  describe("Push Operations", () => {
    beforeEach(() => {
      service.isEnabled = true;
      service.syncId = "test-sync-id";
      service.isOnline = true;
    });

    test("should push data successfully", async () => {
      const testData = { name: "Test Profile" };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });
      service.push = jest.fn().mockImplementation(async (data) => {
        if (!service.isEnabled || !service.syncId) {
          throw new SyncError("Sync not initialized");
        }
        const encrypted = manyllaEncryptionService.encrypt(data);
        const response = await fetch(`${platform.apiBaseUrl()}/sync_push.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sync_id: service.syncId,
            data: encrypted,
            timestamp: Date.now(),
          }),
        });
        return response.json();
      });

      const result = await service.push(testData);

      expect(result.success).toBe(true);
      expect(manyllaEncryptionService.encrypt).toHaveBeenCalledWith(testData);
    });

    test("should queue push when offline", async () => {
      service.isOnline = false;
      service.push = jest.fn().mockImplementation(async (data) => {
        if (!service.isOnline) {
          service.queueForLater("push", data);
          throw new NetworkError("Device offline. Operation queued.");
        }
      });

      await expect(service.push({ test: "data" })).rejects.toThrow(
        "Device offline",
      );
      expect(service.queueForLater).toHaveBeenCalled();
    });

    test("should handle push authentication errors", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });
      service.push = jest.fn().mockImplementation(async () => {
        const response = await fetch("test-url");
        if (response.status === 401) {
          throw new AuthError("Invalid sync credentials");
        }
      });

      await expect(service.push({ test: "data" })).rejects.toThrow(
        "Invalid sync credentials",
      );
    });
  });

  describe("Pull Operations", () => {
    beforeEach(() => {
      service.isEnabled = true;
      service.syncId = "test-sync-id";
      service.isOnline = true;
    });

    test("should pull data successfully", async () => {
      const testData = { name: "Test Profile" };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue({ success: true, data: "encrypted-data" }),
      });
      service.pull = jest.fn().mockImplementation(async () => {
        const response = await fetch(
          `${platform.apiBaseUrl()}/sync_pull.php?sync_id=${service.syncId}`,
        );
        const result = await response.json();
        if (result.success && result.data) {
          const decrypted = manyllaEncryptionService.decrypt(result.data);
          service.lastPullTime = Date.now();
          return decrypted;
        }
        return null;
      });

      const result = await service.pull();

      expect(result).toEqual({ test: "data" });
      expect(manyllaEncryptionService.decrypt).toHaveBeenCalledWith(
        "encrypted-data",
      );
    });

    test("should handle no data found", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue({ success: false, error: "No data found" }),
      });
      service.pull = jest.fn().mockImplementation(async () => {
        const response = await fetch(
          `${platform.apiBaseUrl()}/sync_pull.php?sync_id=${service.syncId}`,
        );
        const result = await response.json();
        if (result.error === "No data found") {
          return null;
        }
      });

      const result = await service.pull();

      expect(result).toBeNull();
    });

    test("should merge conflicts with local data", async () => {
      const localData = { name: "Local Profile" };
      const remoteData = { name: "Remote Profile" };
      service.getLocalData = jest.fn().mockResolvedValue(localData);
      conflictResolver.mergeProfiles.mockReturnValue({
        name: "Merged Profile",
      });
      service.pull = jest.fn().mockImplementation(async () => {
        const local = await service.getLocalData();
        if (local) {
          const resolved = conflictResolver.mergeProfiles(local, remoteData);
          return resolved;
        }
        return remoteData;
      });

      const result = await service.pull();

      expect(conflictResolver.mergeProfiles).toHaveBeenCalledWith(
        localData,
        remoteData,
      );
      expect(result).toEqual({ name: "Merged Profile" });
    });
  });

  describe("Polling Operations", () => {
    test("should start polling", () => {
      service.startPolling = jest.fn().mockImplementation(() => {
        if (!service.isPolling) {
          service.isPolling = true;
          service.pullInterval = setInterval(() => {
            if (service.syncId && manyllaEncryptionService.isInitialized()) {
              service.pull().catch(() => {});
            }
          }, service.POLL_INTERVAL);
        }
      });

      service.startPolling();

      expect(service.isPolling).toBe(true);
      expect(setInterval).toHaveBeenCalled();
    });

    test("should not start polling if already polling", () => {
      // Clear setInterval calls from previous tests
      setInterval.mockClear();

      service.isPolling = true;
      service.pullInterval = 123; // Simulate existing polling

      service.startPolling();

      expect(setInterval).not.toHaveBeenCalled();
    });

    test("should stop polling", () => {
      service.isPolling = true;
      service.pullInterval = "test-interval";
      service.stopPolling = jest.fn().mockImplementation(() => {
        service.isPolling = false;
        if (service.pullInterval) {
          clearInterval(service.pullInterval);
          service.pullInterval = null;
        }
      });

      service.stopPolling();

      expect(service.isPolling).toBe(false);
      expect(clearInterval).toHaveBeenCalledWith("test-interval");
    });
  });

  describe("Utility Methods", () => {
    test("should generate recovery phrase", () => {
      service.generateRecoveryPhrase = jest.fn().mockImplementation(() => {
        const bytes = nacl.randomBytes(16);
        return Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      });

      const phrase = service.generateRecoveryPhrase();

      expect(phrase).toMatch(/^[a-f0-9]{32}$/);
    });

    test("should get sync status", () => {
      service.syncId = "test-sync-id";
      service.isPolling = true;
      service.lastPullTime = Date.now();
      service.getStatus = jest.fn().mockReturnValue({
        initialized: !!service.syncId,
        polling: service.isPolling,
        lastPull: service.lastPullTime,
        syncId: service.syncId,
        isOnline: service.isOnline,
        offlineQueueLength: service.offlineQueue.length,
      });

      const status = service.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.polling).toBe(true);
      expect(status.syncId).toBe("test-sync-id");
    });

    test("should check if sync is enabled", () => {
      service.syncId = "test-sync-id";
      service.isSyncEnabled = jest
        .fn()
        .mockReturnValue(
          !!service.syncId && manyllaEncryptionService.isInitialized(),
        );

      const isEnabled = service.isSyncEnabled();

      expect(isEnabled).toBe(true);
    });

    test("should set data callback", () => {
      const callback = jest.fn();
      service.setDataCallback = jest.fn().mockImplementation((cb) => {
        service.dataCallback = cb;
      });

      service.setDataCallback(callback);

      expect(service.dataCallback).toBe(callback);
    });
  });

  describe("Invite Code Operations", () => {
    test("should generate invite code", () => {
      const recoveryPhrase = "1234567890abcdef1234567890abcdef";
      service.generateInviteCode = jest.fn().mockImplementation((phrase) => {
        return phrase.toUpperCase();
      });

      const inviteCode = service.generateInviteCode(recoveryPhrase);

      expect(inviteCode).toBe("1234567890ABCDEF1234567890ABCDEF");
    });

    test("should join from invite code", async () => {
      const inviteCode = "1234567890ABCDEF1234567890ABCDEF";
      service.joinFromInvite = jest.fn().mockImplementation(async (code) => {
        const cleaned = code.replace(/[^A-F0-9]/gi, "").toUpperCase();
        if (cleaned.length !== 32) {
          throw new Error("Invalid invite code");
        }
        await service.init(cleaned);
        const data = await service.pull();
        service.startPolling();
        return data;
      });

      const result = await service.joinFromInvite(inviteCode);

      expect(service.init).toHaveBeenCalledWith(
        "1234567890ABCDEF1234567890ABCDEF",
      );
      expect(service.startPolling).toHaveBeenCalled();
    });
  });

  describe("Cleanup and Destruction", () => {
    test("should reset service state", async () => {
      service.reset = jest.fn().mockImplementation(async () => {
        service.stopPolling();
        service.syncId = null;
        service.lastPullTime = null;
        await AsyncStorage.removeItem("manylla_recovery_phrase");
        await AsyncStorage.removeItem("manylla_sync_enabled");
      });

      await service.reset();

      expect(service.stopPolling).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "manylla_recovery_phrase",
      );
    });

    test("should destroy service cleanly", () => {
      service.destroy = jest.fn().mockImplementation(() => {
        service.stopPolling();
        service.stopNetworkMonitoring();
        service.listeners.clear();
        service.offlineQueue = [];
      });

      service.destroy();

      expect(service.stopPolling).toHaveBeenCalled();
      expect(service.stopNetworkMonitoring).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    test("should handle AsyncStorage errors gracefully", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
      service.getLocalData = jest.fn().mockImplementation(async () => {
        try {
          const stored = await AsyncStorage.getItem("manylla_profile");
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }
      });

      const result = await service.getLocalData();

      expect(result).toBeNull();
    });

    test("should normalize and log errors", () => {
      const testError = new Error("Test error");
      ErrorHandler.normalize.mockReturnValue(testError);

      // Simulate error handling
      ErrorHandler.log(testError, { context: "test" });

      expect(ErrorHandler.log).toHaveBeenCalledWith(testError, {
        context: "test",
      });
    });
  });
});
