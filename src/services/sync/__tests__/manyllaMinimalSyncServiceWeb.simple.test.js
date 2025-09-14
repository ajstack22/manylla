import ManyllaMinimalSyncServiceWeb from '../manyllaMinimalSyncServiceWeb';
import {
  TEST_RECOVERY_PHRASE,
  createTestProfileData,
} from '../../../test/utils/encryption-helpers';

// Mock the encryption service
jest.mock('../manyllaEncryptionService', () => ({
  __esModule: true,
  default: {
    isInitialized: jest.fn(() => true),
    generateRecoveryPhrase: jest.fn(() => 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'),
    initialize: jest.fn(async () => ({ syncId: 'test_sync_id_12345678', salt: 'test_salt' })),
    init: jest.fn(async () => ({ syncId: 'test_sync_id_12345678', salt: 'test_salt' })),
    encrypt: jest.fn((data) => 'encrypted_test_data'),
    encryptData: jest.fn((data) => 'encrypted_test_data'),
    decrypt: jest.fn((encrypted) => ({ test: 'decrypted data' })),
    decryptData: jest.fn((encrypted) => ({ test: 'decrypted data' })),
    clear: jest.fn(async () => {}),
    restore: jest.fn(async () => true),
    isEnabled: jest.fn(async () => true),
    getSyncId: jest.fn(async () => 'test_sync_id_12345678'),
    getDeviceKey: jest.fn(async () => new Uint8Array(32)),
    encryptWithKey: jest.fn(async () => 'encrypted_with_key'),
    deriveKeyFromPhrase: jest.fn(async (phrase, salt) => ({
      key: new Uint8Array(32),
      salt: salt || 'dGVzdF9zYWx0XzEyMzQ1Njc4',
      syncId: 'test_sync_id_12345678',
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

describe('ManyllaMinimalSyncServiceWeb', () => {
  let syncService;

  beforeEach(() => {
    syncService = ManyllaMinimalSyncServiceWeb;
    jest.clearAllMocks();

    // Mock successful fetch responses
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'healthy', success: true }),
    });

    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
  });

  afterEach(() => {
    if (syncService && syncService.stopPolling) {
      syncService.stopPolling();
    }
  });

  describe('Initialization', () => {
    test('should initialize with valid recovery phrase', async () => {
      const phrase = TEST_RECOVERY_PHRASE;
      const result = await syncService.init(phrase);

      expect(result).toBe(true);
      expect(syncService.syncId).toBeDefined();
    });

    test('should reject invalid recovery phrase format', async () => {
      const invalidPhrases = [
        '', // empty
        'too_short', // too short
        'toolong1234567890123456789012345', // too long
      ];

      for (const phrase of invalidPhrases) {
        await expect(syncService.init(phrase)).rejects.toThrow('Invalid recovery phrase format');
      }
    });
  });

  describe('Health Check', () => {
    test('should return true for healthy service', async () => {
      const isHealthy = await syncService.checkHealth();
      expect(isHealthy).toBe(true);
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      const isHealthy = await syncService.checkHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe('Basic Operations', () => {
    beforeEach(async () => {
      await syncService.init(TEST_RECOVERY_PHRASE);
    });

    test('should push data successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const testData = createTestProfileData();
      const result = await syncService.push(testData);

      expect(result).toEqual({ success: true });
    });

    test('should pull data successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: 'encrypted_data' }),
      });

      const result = await syncService.pull();
      expect(result).toEqual({ test: 'decrypted data' });
    });

    test('should handle no data found during pull', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: false, error: 'No data found' }),
      });

      const result = await syncService.pull();
      expect(result).toBe(null);
    });

    test('should start and stop polling', () => {
      jest.useFakeTimers();

      syncService.startPolling();
      expect(syncService.isPolling).toBe(true);

      syncService.stopPolling();
      expect(syncService.isPolling).toBe(false);

      jest.useRealTimers();
    });

    test('should add and remove listeners', () => {
      const callback = jest.fn();
      const unsubscribe = syncService.addListener(callback);

      expect(syncService.listeners.has(callback)).toBe(true);

      unsubscribe();
      expect(syncService.listeners.has(callback)).toBe(false);
    });

    test('should get status', () => {
      const status = syncService.getStatus();

      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('polling');
      expect(status).toHaveProperty('lastPull');
      expect(status).toHaveProperty('syncId');
    });

    test('should check if sync is enabled', () => {
      expect(syncService.isSyncEnabled()).toBe(true);
    });

    test('should generate recovery phrase', () => {
      const phrase = syncService.generateRecoveryPhrase();
      expect(phrase).toBeDefined();
    });
  });
});