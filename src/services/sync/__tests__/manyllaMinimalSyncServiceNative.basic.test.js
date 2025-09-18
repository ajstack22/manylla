/* eslint-disable */
/**
 * Basic tests for manyllaMinimalSyncServiceNative module structure
 * Tests only module exports and static methods to avoid constructor issues
 */

// Mock dependencies to prevent loading errors
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('../../../utils/SecureRandomService', () => ({
  generateTimestampId: jest.fn().mockReturnValue('test-id'),
  generateDeviceId: jest.fn().mockReturnValue('test-device-id'),
}));

global.fetch = jest.fn();

describe('ManyllaMinimalSyncServiceNative basic tests', () => {
  test('should export a default service', () => {
    const module = require('../manyllaMinimalSyncServiceNative');
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('object');
  });

  test('should have required sync methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    // Test that required methods exist
    expect(typeof service.init).toBe('function');
    expect(typeof service.enableSync).toBe('function');
    expect(typeof service.disableSync).toBe('function');
    expect(typeof service.push).toBe('function');
    expect(typeof service.pull).toBe('function');
  });

  test('should have polling control methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.startPolling).toBe('function');
    expect(typeof service.stopPolling).toBe('function');
    expect(typeof service.startPullInterval).toBe('function');
    expect(typeof service.stopPullInterval).toBe('function');
  });

  test('should have listener management methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.addListener).toBe('function');
    expect(typeof service.notifyListeners).toBe('function');
  });

  test('should have utility methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.generateRecoveryPhrase).toBe('function');
    expect(typeof service.getStatus).toBe('function');
    expect(typeof service.getSyncId).toBe('function');
    expect(typeof service.isSyncEnabled).toBe('function');
  });

  test('should have storage methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.saveToStorage).toBe('function');
    expect(typeof service.loadFromStorage).toBe('function');
    expect(typeof service.getLocalData).toBe('function');
  });

  test('should have network management methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.checkHealth).toBe('function');
    expect(typeof service.queueForLater).toBe('function');
    expect(typeof service.processOfflineQueue).toBe('function');
  });

  test('should have invite code methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.generateInviteCode).toBe('function');
    expect(typeof service.joinFromInvite).toBe('function');
  });

  test('should have reset and destroy methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.reset).toBe('function');
    expect(typeof service.destroy).toBe('function');
  });

  test('should have compatible API methods', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.pushData).toBe('function');
    expect(typeof service.pullData).toBe('function');
    expect(typeof service.checkSyncStatus).toBe('function');
    expect(typeof service.setDataCallback).toBe('function');
  });

  test('should have constants and properties', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(typeof service.PULL_INTERVAL).toBe('number');
    expect(typeof service.POLL_INTERVAL).toBe('number');
    expect(typeof service.PUSH_DEBOUNCE).toBe('number');
    expect(typeof service.MAX_RETRIES).toBe('number');
  });

  test('should initialize with correct defaults', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(service.isEnabled).toBe(false);
    expect(service.syncId).toBeNull();
    expect(service.isPolling).toBe(false);
    expect(service.PULL_INTERVAL).toBe(60000);
  });

  test('should have listener set', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(service.listeners).toBeInstanceOf(Set);
    expect(service.listeners.size).toBe(0);
  });

  test('should have offline queue', () => {
    const service = require('../manyllaMinimalSyncServiceNative').default;

    expect(Array.isArray(service.offlineQueue)).toBe(true);
    expect(service.offlineQueue.length).toBe(0);
  });
});