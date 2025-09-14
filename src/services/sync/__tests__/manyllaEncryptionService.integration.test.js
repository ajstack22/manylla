/**
 * Integration tests for ManyllaEncryptionService
 * These tests run against a real API when API_ENV is set
 */

const { getTestConfig } = require('../../../config/test-env');

// Use node-fetch for API calls in tests
const fetch = require('node-fetch');

// Only mock AsyncStorage, not the encryption libraries
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const service = require('../manyllaEncryptionService').default;
const syncService = require('../manyllaMinimalSyncServiceWeb').default;

describe('ManyllaEncryptionService Integration Tests', () => {
  const testConfig = getTestConfig();
  const isRealApi = testConfig.isRealApi;

  beforeAll(() => {
    if (isRealApi) {
      console.log(`Running integration tests against ${testConfig.env} API: ${testConfig.apiUrl}`);
    } else {
      console.log('Running tests in mock mode (set API_ENV=dev to test against real API)');
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service.masterKey = null;
    service.syncId = null;
  });

  describe('Real Encryption Operations', () => {
    test('should generate valid recovery phrase', () => {
      const phrase = service.generateRecoveryPhrase();
      expect(phrase).toBeDefined();
      expect(phrase.length).toBe(32);
      expect(phrase).toMatch(/^[a-f0-9]{32}$/);
    });

    test('should derive consistent keys from phrase', async () => {
      const phrase = 'test1234567890abcdef1234567890ab';
      const salt = 'test-salt';

      const result1 = await service.deriveKeyFromPhrase(phrase, salt);
      const result2 = await service.deriveKeyFromPhrase(phrase, salt);

      expect(result1.syncId).toBe(result2.syncId);
      expect(result1.salt).toBe(result2.salt);
    });

    test('should encrypt and decrypt data correctly', async () => {
      // Initialize with a test phrase
      const phrase = service.generateRecoveryPhrase();
      await service.init(phrase);

      const testData = {
        profiles: [{
          id: 'test-profile',
          name: 'Test Child',
          entries: [
            {
              id: 'entry-1',
              title: 'Test Entry',
              description: 'Test description with special chars: 🚀 é ñ'
            }
          ]
        }]
      };

      // Encrypt the data
      const encrypted = service.encrypt(testData);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);

      // Decrypt the data
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toEqual(testData);
    });

    test('should handle large data encryption', async () => {
      const phrase = service.generateRecoveryPhrase();
      await service.init(phrase);

      // Create large dataset
      const largeData = {
        profiles: Array(10).fill(null).map((_, i) => ({
          id: `profile-${i}`,
          name: `Child ${i}`,
          entries: Array(50).fill(null).map((_, j) => ({
            id: `entry-${i}-${j}`,
            title: `Entry ${j}`,
            description: 'Lorem ipsum '.repeat(100)
          }))
        }))
      };

      const encrypted = service.encrypt(largeData);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted.profiles.length).toBe(10);
      expect(decrypted.profiles[0].entries.length).toBe(50);
    });

    test('should fail to decrypt with wrong key', async () => {
      // Encrypt with one key
      const phrase1 = service.generateRecoveryPhrase();
      await service.init(phrase1);

      const data = { test: 'data' };
      const encrypted = service.encrypt(data);

      // Try to decrypt with different key
      const phrase2 = service.generateRecoveryPhrase();
      await service.init(phrase2);

      expect(() => service.decrypt(encrypted)).toThrow();
    });
  });

  describe('API Integration Tests', () => {
    const runIfRealApi = isRealApi ? test : test.skip;

    runIfRealApi('should check API health', async () => {
      const response = await fetch(`${testConfig.apiUrl}/sync_health.php`);
      const data = await response.json();

      expect(data.status).toBe('healthy');
      expect(data.encryption).toBe('enabled');
    }, testConfig.timeout);

    runIfRealApi('should push and pull encrypted data', async () => {
      // Initialize encryption
      const phrase = service.generateRecoveryPhrase();
      await service.init(phrase);
      const syncId = service.syncId;

      // Create test data
      const testData = {
        profiles: [{
          id: `test-${Date.now()}`,
          name: 'Integration Test Child',
          createdAt: new Date().toISOString()
        }]
      };

      // Push data
      const encrypted = service.encrypt(testData);
      const pushResponse = await fetch(`${testConfig.apiUrl}/sync_push.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sync_id: syncId,
          encrypted_data: encrypted,
          version: 1,
          checksum: btoa(encrypted.slice(0, 32))
        })
      });

      const pushResult = await pushResponse.json();
      expect(pushResult.success).toBe(true);

      // Pull data back
      const pullResponse = await fetch(`${testConfig.apiUrl}/sync_pull.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_id: syncId })
      });

      const pullResult = await pullResponse.json();
      expect(pullResult.success).toBe(true);
      expect(pullResult.data.encrypted_data).toBe(encrypted);

      // Decrypt pulled data
      const decrypted = service.decrypt(pullResult.data.encrypted_data);
      expect(decrypted).toEqual(testData);
    }, testConfig.timeout);

    runIfRealApi('should handle concurrent sync operations', async () => {
      const phrase = service.generateRecoveryPhrase();
      await service.init(phrase);
      const syncId = service.syncId;

      // Simulate concurrent updates
      const updates = Array(3).fill(null).map((_, i) => ({
        profiles: [{
          id: 'concurrent-test',
          name: `Update ${i}`,
          timestamp: Date.now() + i
        }]
      }));

      // Push all updates concurrently
      const pushPromises = updates.map((data, i) =>
        fetch(`${testConfig.apiUrl}/sync_push.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sync_id: syncId,
            encrypted_data: service.encrypt(data),
            version: i + 1,
            checksum: 'test'
          })
        })
      );

      const results = await Promise.all(pushPromises);
      const jsonResults = await Promise.all(results.map(r => r.json()));

      // At least one should succeed
      const successCount = jsonResults.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    }, testConfig.timeout);
  });

  describe('Storage Integration', () => {
    test('should persist and restore encryption state', async () => {
      const phrase = service.generateRecoveryPhrase();
      await service.init(phrase);

      // Check that keys were saved
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'secure_manylla_sync_id',
        expect.any(String)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'secure_manylla_key',
        expect.any(String)
      );

      // Simulate app restart
      service.masterKey = null;
      service.syncId = null;

      // Mock stored values
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'secure_manylla_sync_id') return Promise.resolve(phrase.slice(0, 16));
        if (key === 'secure_manylla_key') return Promise.resolve(phrase);
        return Promise.resolve(null);
      });

      // Restore state
      const restored = await service.restore();
      expect(restored).toBe(true);
      expect(service.isInitialized()).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should handle encryption within performance limits', async () => {
      const phrase = service.generateRecoveryPhrase();
      await service.init(phrase);

      const sizes = [
        { name: 'small', entries: 10 },
        { name: 'medium', entries: 100 },
        { name: 'large', entries: 500 }
      ];

      for (const size of sizes) {
        const data = {
          profiles: [{
            entries: Array(size.entries).fill(null).map((_, i) => ({
              id: `entry-${i}`,
              description: 'Test data '.repeat(10)
            }))
          }]
        };

        const start = Date.now();
        const encrypted = service.encrypt(data);
        const encryptTime = Date.now() - start;

        const decryptStart = Date.now();
        service.decrypt(encrypted);
        const decryptTime = Date.now() - decryptStart;

        console.log(`${size.name}: encrypt=${encryptTime}ms, decrypt=${decryptTime}ms`);

        // Should complete within reasonable time
        expect(encryptTime).toBeLessThan(1000);
        expect(decryptTime).toBeLessThan(1000);
      }
    });
  });
});