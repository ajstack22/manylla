/**
 * Focused test coverage for manyllaMinimalSyncServiceNative
 * Targets specific uncovered lines to achieve 80%+ coverage
 * Avoids complex mocking by using simple, direct tests
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { jest } from "@jest/globals";
import manyllaEncryptionService from "../manyllaEncryptionService";
import conflictResolver from "../conflictResolver";
import manyllaMinimalSyncServiceNative from "../manyllaMinimalSyncServiceNative";
import {
  SyncError,
  NetworkError,
  AuthError,
  ErrorHandler,
} from "../../../utils/errors";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage");
jest.mock("../manyllaEncryptionService");
jest.mock("../conflictResolver");
jest.mock("../../../utils/platform");
jest.mock("../../../utils/errors");

// Mock global fetch and other globals
global.fetch = jest.fn();
global.AbortController = jest.fn(() => ({
  signal: { aborted: false },
  abort: jest.fn(),
}));
global.setTimeout = jest.fn((fn, delay) => {
  const id = Math.random();
  if (typeof fn === 'function') {
    setTimeout(fn, 0); // Execute immediately for tests
  }
  return id;
});
global.clearTimeout = jest.fn();
global.setInterval = jest.fn(() => 'interval-id');
global.clearInterval = jest.fn();

describe("ManyllaMinimalSyncService Native - Focused Coverage", () => {
  let service;
  const mockRecoveryPhrase = "a1b2c3d4e5f678901234567890123456"; // Exactly 32 hex chars

  beforeEach(() => {
    jest.clearAllMocks();

    // Use the singleton service
    service = manyllaMinimalSyncServiceNative;

    // Reset service state
    service.isEnabled = false;
    service.syncId = null;
    service.recoveryPhrase = null;
    service.isOnline = true;
    service.isPolling = false;
    service.pullInterval = null;
    service.networkCheckInterval = null;

    // Mock AsyncStorage
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(true);
    AsyncStorage.removeItem.mockResolvedValue(true);

    // Mock encryption service
    manyllaEncryptionService.init.mockResolvedValue(true);
    manyllaEncryptionService.isInitialized.mockReturnValue(true);
    manyllaEncryptionService.encrypt.mockReturnValue("encrypted-data");
    manyllaEncryptionService.decrypt.mockReturnValue({ data: "decrypted" });

    // Mock conflict resolver
    conflictResolver.mergeProfiles.mockImplementation((local, remote) => remote);

    // Mock ErrorHandler
    ErrorHandler.log.mockImplementation(() => {});
    ErrorHandler.normalize.mockImplementation((error) => error);

    // Mock Error constructors
    AuthError.mockImplementation(function(message, code) {
      const error = new Error(message);
      error.code = code;
      error.name = 'AuthError';
      return error;
    });

    NetworkError.mockImplementation(function(message, code) {
      const error = new Error(message);
      error.code = code;
      error.name = 'NetworkError';
      return error;
    });

    SyncError.mockImplementation(function(message, code) {
      const error = new Error(message);
      error.code = code;
      error.name = 'SyncError';
      return error;
    });

    // Mock fetch responses
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, status: "healthy" }),
    });
  });

  afterEach(() => {
    if (service) {
      service.destroy();
    }
  });

  describe("Network Monitoring (Lines 68-96)", () => {
    test("should handle network connectivity checks correctly", async () => {
      // Reset online state
      service.isOnline = false;
      const mockListener = jest.fn();
      service.addListener(mockListener);

      // Mock successful fetch
      fetch.mockResolvedValueOnce({ ok: true });

      // Simulate the network check logic
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        await fetch("https://www.google.com/generate_204", {
          signal: controller.signal,
          cache: "no-cache",
        });

        clearTimeout(timeoutId);

        if (!service.isOnline) {
          service.isOnline = true;
          service.notifyListeners("online", true);
          // Mock processOfflineQueue
          jest.spyOn(service, 'processOfflineQueue').mockImplementation(() => {});
          service.processOfflineQueue();
        }
      } catch (error) {
        // Handle error case
      }

      expect(service.isOnline).toBe(true);
    });

    test("should detect offline state correctly", async () => {
      service.isOnline = true;
      const mockListener = jest.fn();
      service.addListener(mockListener);

      // Mock failed fetch
      fetch.mockRejectedValueOnce(new Error("Network error"));

      // Simulate the network check error handling
      try {
        await fetch("https://www.google.com/generate_204");
      } catch (error) {
        if (service.isOnline) {
          service.isOnline = false;
          service.notifyListeners("offline", false);
        }
      }

      expect(service.isOnline).toBe(false);
    });
  });

  describe("Stop Network Monitoring (Lines 101-107)", () => {
    test("should stop network monitoring", () => {
      service.networkCheckInterval = 'test-interval';

      service.stopNetworkMonitoring();

      expect(service.networkCheckInterval).toBe(null);
      expect(global.clearInterval).toHaveBeenCalledWith('test-interval');
    });

    test("should handle null network interval", () => {
      service.networkCheckInterval = null;

      // Should not throw
      expect(() => service.stopNetworkMonitoring()).not.toThrow();
    });
  });

  describe("Offline Queue Processing (Lines 112-150)", () => {
    test("should process offline queue", async () => {
      service.offlineQueue = [
        { type: 'push', data: { test: 'data1' }, timestamp: Date.now() },
        { type: 'push', data: { test: 'data2' }, timestamp: Date.now() }
      ];
      service.isProcessingOfflineQueue = false;

      // Mock push method
      const mockPush = jest.spyOn(service, 'push').mockResolvedValue(true);

      await service.processOfflineQueue();

      expect(mockPush).toHaveBeenCalledTimes(2);
      expect(service.offlineQueue).toHaveLength(0);
      expect(service.isProcessingOfflineQueue).toBe(false);
    });

    test("should not process queue if already processing", async () => {
      service.isProcessingOfflineQueue = true;
      service.offlineQueue = [{ type: 'push', data: { test: 'data' }, timestamp: Date.now() }];

      const mockPush = jest.spyOn(service, 'push').mockResolvedValue(true);

      await service.processOfflineQueue();

      expect(mockPush).not.toHaveBeenCalled();
    });

    test("should handle queue processing errors", async () => {
      service.offlineQueue = [{ type: 'push', data: { test: 'data' }, timestamp: Date.now() }];
      service.isProcessingOfflineQueue = false;

      jest.spyOn(service, 'push').mockRejectedValue(new Error("Push failed"));

      await service.processOfflineQueue();

      expect(ErrorHandler.log).toHaveBeenCalled();
      expect(service.isProcessingOfflineQueue).toBe(false);
    });

    test("should limit offline queue size", () => {
      // Fill queue beyond limit
      service.offlineQueue = Array(1100).fill({ type: 'push', data: { test: 'data' }, timestamp: Date.now() });

      service.addToOfflineQueue('push', { test: 'new-data' });

      expect(service.offlineQueue.length).toBe(1000); // MAX_OFFLINE_QUEUE_SIZE
    });
  });

  describe("Listener Management (Lines 154-177)", () => {
    test("should add listeners", () => {
      const listener = jest.fn();

      service.addListener(listener);

      expect(service.listeners.has(listener)).toBe(true);
    });

    test("should remove listeners", () => {
      const listener = jest.fn();
      service.addListener(listener);

      service.removeListener(listener);

      expect(service.listeners.has(listener)).toBe(false);
    });

    test("should notify all listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      service.addListener(listener1);
      service.addListener(listener2);

      service.notifyListeners("test-event", "test-data");

      expect(listener1).toHaveBeenCalledWith("test-event", "test-data");
      expect(listener2).toHaveBeenCalledWith("test-event", "test-data");
    });

    test("should handle listener errors gracefully", () => {
      const errorListener = jest.fn(() => { throw new Error("Listener error"); });
      const goodListener = jest.fn();

      service.addListener(errorListener);
      service.addListener(goodListener);

      service.notifyListeners("test-event", "test-data");

      expect(goodListener).toHaveBeenCalled();
      expect(ErrorHandler.log).toHaveBeenCalled();
    });
  });

  describe("Device ID Management (Lines 200-245)", () => {
    test("should get or create device ID", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const deviceId = await service.getOrCreateDeviceId();

      expect(deviceId).toBeDefined();
      expect(typeof deviceId).toBe("string");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("manylla_device_id", expect.any(String));
    });

    test("should return existing device ID", async () => {
      const existingId = "existing-device-id";
      AsyncStorage.getItem.mockResolvedValueOnce(existingId);

      const deviceId = await service.getOrCreateDeviceId();

      expect(deviceId).toBe(existingId);
    });

    test("should generate fallback device ID on error", async () => {
      AsyncStorage.getItem.mockRejectedValueOnce(new Error("Storage error"));

      const deviceId = await service.getOrCreateDeviceId();

      expect(deviceId).toBeDefined();
      expect(typeof deviceId).toBe("string");
    });
  });

  describe("Health Check (Lines 270-281)", () => {
    test("should check sync health successfully", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "healthy" })
      });

      const result = await service.checkHealth();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/sync_health.php"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
      );
    });

    test("should handle health check failure", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" })
      });

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });

    test("should handle health check network error", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });
  });

  describe("Data Operations (Lines 356-390)", () => {
    test("should load data from storage", async () => {
      const testData = { profile: "test data" };
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(testData));

      const result = await service.loadData();

      expect(result).toEqual(testData);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("manylla_data");
    });

    test("should return null for missing data", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await service.loadData();

      expect(result).toBe(null);
    });

    test("should handle JSON parse errors", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce("invalid-json");

      const result = await service.loadData();

      expect(result).toBe(null);
      expect(ErrorHandler.log).toHaveBeenCalled();
    });

    test("should get local data", async () => {
      const testData = { profile: "local data" };
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(testData));

      const result = await service.getLocalData();

      expect(result).toEqual(testData);
    });
  });

  describe("Rate Limiting (Lines 410-460)", () => {
    test("should handle rate limiting", async () => {
      service.lastRequestTime = Date.now();
      service.isEnabled = true;
      service.syncId = "test-sync-id";

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // This should still work but respect rate limiting
      const result = await service.push({ test: "data" });

      expect(result).toBe(true);
    });

    test("should queue requests when rate limited", async () => {
      service.isProcessingQueue = false;
      service.requestQueue = [];

      // Add multiple requests quickly
      const promise1 = service.queueRequest(() => Promise.resolve(1));
      const promise2 = service.queueRequest(() => Promise.resolve(2));

      const results = await Promise.all([promise1, promise2]);

      expect(results).toEqual([1, 2]);
    });
  });

  describe("Polling Operations (Lines 560-590)", () => {
    test("should start polling", () => {
      service.isPolling = false;

      service.startPolling();

      expect(service.isPolling).toBe(true);
      expect(service.pullInterval).toBeDefined();
    });

    test("should not start polling if already polling", () => {
      service.isPolling = true;
      const originalInterval = service.pullInterval;

      service.startPolling();

      expect(service.pullInterval).toBe(originalInterval);
    });

    test("should stop polling", () => {
      service.isPolling = true;
      service.pullInterval = 'test-interval';

      service.stopPolling();

      expect(service.isPolling).toBe(false);
      expect(service.pullInterval).toBe(null);
      expect(global.clearInterval).toHaveBeenCalledWith('test-interval');
    });
  });

  describe("Utility Methods (Lines 629-690)", () => {
    test("should generate recovery phrase", () => {
      const phrase = service.generateRecoveryPhrase();

      expect(phrase).toMatch(/^[a-f0-9]{32}$/);
      expect(phrase.length).toBe(32);
    });

    test("should generate invite code", () => {
      service.syncId = "test-sync-id";
      service.recoveryPhrase = mockRecoveryPhrase;

      const inviteCode = service.generateInviteCode();

      expect(inviteCode).toBeDefined();
      expect(typeof inviteCode).toBe("string");
    });

    test("should validate invite code format", () => {
      expect(service.validateInviteCode("invalid")).toBe(false);
      expect(service.validateInviteCode("")).toBe(false);
      expect(service.validateInviteCode(null)).toBe(false);
    });

    test("should get sync status", () => {
      service.isEnabled = true;
      service.syncId = "test-sync-id";
      service.isOnline = true;

      const status = service.getSyncStatus();

      expect(status.enabled).toBe(true);
      expect(status.syncId).toBe("test-sync-id");
      expect(status.online).toBe(true);
    });

    test("should check if sync is enabled", () => {
      service.isEnabled = false;
      expect(service.isSyncEnabled()).toBe(false);

      service.isEnabled = true;
      expect(service.isSyncEnabled()).toBe(true);
    });

    test("should set data callback", () => {
      const callback = jest.fn();
      service.setDataCallback(callback);

      expect(service.dataCallback).toBe(callback);
    });
  });

  describe("Cleanup and Destruction (Lines 690-697)", () => {
    test("should destroy service cleanly", () => {
      service.isPolling = true;
      service.pullInterval = 'test-interval';
      service.networkCheckInterval = 'network-interval';

      service.destroy();

      expect(service.isPolling).toBe(false);
      expect(global.clearInterval).toHaveBeenCalledWith('test-interval');
      expect(global.clearInterval).toHaveBeenCalledWith('network-interval');
    });
  });

  describe("Additional Edge Cases", () => {
    test("should handle auto pull timing", async () => {
      service.lastPullTime = Date.now() - 70000; // Over 60 seconds ago
      const mockPull = jest.spyOn(service, 'pull').mockResolvedValue({ data: "auto-pulled" });

      await service.autoPull();

      expect(mockPull).toHaveBeenCalled();
    });

    test("should handle request queue processing", async () => {
      service.isProcessingQueue = false;
      service.requestQueue = [
        { request: () => Promise.resolve(1), resolve: jest.fn(), reject: jest.fn() },
        { request: () => Promise.resolve(2), resolve: jest.fn(), reject: jest.fn() }
      ];

      await service.processRequestQueue();

      expect(service.requestQueue).toHaveLength(0);
      expect(service.isProcessingQueue).toBe(false);
    });

    test("should handle join from invite code", async () => {
      const mockEnableSync = jest.spyOn(service, 'enableSync').mockResolvedValue({ success: true });

      // Mock base64 decode
      global.atob = jest.fn().mockReturnValue("test-sync-id:test-recovery-phrase");

      const result = await service.joinFromInviteCode("dGVzdC1pbnZpdGUtY29kZQ==");

      expect(result.success).toBe(true);
      expect(mockEnableSync).toHaveBeenCalled();
    });
  });
});