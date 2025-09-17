/**
 * Simple working tests for manyllaEncryptionService
 * Uses real encryption with minimal mocking
 */

import manyllaEncryptionService from '../manyllaEncryptionService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

describe('ManyllaEncryptionService simple tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(true);
    AsyncStorage.removeItem.mockResolvedValue(true);

    // Reset service state
    manyllaEncryptionService.masterKey = null;
    manyllaEncryptionService.syncId = null;
  });

  test('should generate recovery phrase', () => {
    const phrase = manyllaEncryptionService.generateRecoveryPhrase();

    expect(phrase).toBeDefined();
    expect(typeof phrase).toBe('string');
    expect(phrase).toHaveLength(32);
    expect(phrase).toMatch(/^[a-f0-9]{32}$/);
  });

  test('should generate different recovery phrases', () => {
    const phrase1 = manyllaEncryptionService.generateRecoveryPhrase();
    const phrase2 = manyllaEncryptionService.generateRecoveryPhrase();

    expect(phrase1).not.toBe(phrase2);
  });

  test('should derive key from recovery phrase', async () => {
    const recoveryPhrase = 'a1b2c3d4e5f6789012345678901234567890abcdef';

    const result = await manyllaEncryptionService.deriveKeyFromPhrase(recoveryPhrase.substring(0, 32));

    expect(result).toHaveProperty('key');
    expect(result).toHaveProperty('salt');
    expect(result).toHaveProperty('syncId');
    expect(result.key).toBeInstanceOf(Uint8Array);
    expect(result.key).toHaveLength(32);
    expect(typeof result.salt).toBe('string');
    expect(typeof result.syncId).toBe('string');
  });

  test('should initialize with recovery phrase', async () => {
    const recoveryPhrase = 'a1b2c3d4e5f6789012345678901234567890abcd';

    const result = await manyllaEncryptionService.initialize(recoveryPhrase);

    expect(result).toHaveProperty('syncId');
    expect(result).toHaveProperty('salt');
    expect(manyllaEncryptionService.isInitialized()).toBe(true);
  });

  test('should encrypt and decrypt data', async () => {
    const recoveryPhrase = 'a1b2c3d4e5f6789012345678901234567890abcd';
    const testData = { name: 'Test Profile', age: 25, active: true };

    await manyllaEncryptionService.initialize(recoveryPhrase);

    const encrypted = manyllaEncryptionService.encryptData(testData);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = manyllaEncryptionService.decryptData(encrypted);
    expect(decrypted).toEqual(testData);
  });

  test('should handle undefined data encryption', async () => {
    const recoveryPhrase = 'a1b2c3d4e5f6789012345678901234567890abcd';

    await manyllaEncryptionService.initialize(recoveryPhrase);

    const encrypted = manyllaEncryptionService.encryptData(undefined);
    const decrypted = manyllaEncryptionService.decryptData(encrypted);

    expect(decrypted).toBeUndefined();
  });

  test('should handle null and empty data', async () => {
    const recoveryPhrase = 'a1b2c3d4e5f6789012345678901234567890abcd';

    await manyllaEncryptionService.initialize(recoveryPhrase);

    const nullEncrypted = manyllaEncryptionService.encryptData(null);
    const nullDecrypted = manyllaEncryptionService.decryptData(nullEncrypted);
    expect(nullDecrypted).toBeNull();

    const emptyEncrypted = manyllaEncryptionService.encryptData({});
    const emptyDecrypted = manyllaEncryptionService.decryptData(emptyEncrypted);
    expect(emptyDecrypted).toEqual({});
  });

  test('should use init alias', async () => {
    const recoveryPhrase = 'a1b2c3d4e5f6789012345678901234567890abcd';

    const result = await manyllaEncryptionService.init(recoveryPhrase);

    expect(result).toHaveProperty('syncId');
    expect(manyllaEncryptionService.isInitialized()).toBe(true);
  });

  test('should use encrypt/decrypt aliases', async () => {
    const recoveryPhrase = 'a1b2c3d4e5f6789012345678901234567890abcd';
    const testData = { test: 'data' };

    await manyllaEncryptionService.init(recoveryPhrase);

    const encrypted = manyllaEncryptionService.encrypt(testData);
    const decrypted = manyllaEncryptionService.decrypt(encrypted);

    expect(decrypted).toEqual(testData);
  });

  test('should check if disabled when no sync ID', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const enabled = await manyllaEncryptionService.isEnabled();

    expect(enabled).toBe(false);
  });

  test('should return null when no sync ID', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const result = await manyllaEncryptionService.getSyncId();

    expect(result).toBeNull();
  });

  test('should clear data', async () => {
    await manyllaEncryptionService.init('a1b2c3d4e5f6789012345678901234567890abcd');

    await manyllaEncryptionService.clear();

    expect(manyllaEncryptionService.masterKey).toBeNull();
    expect(manyllaEncryptionService.syncId).toBeNull();
  });

  test('should throw error when encrypting without initialization', () => {
    expect(() => {
      manyllaEncryptionService.encryptData({ test: 'data' });
    }).toThrow('Encryption not initialized');
  });

  test('should throw error when decrypting without initialization', () => {
    expect(() => {
      manyllaEncryptionService.decryptData('encrypted-data');
    }).toThrow('Encryption not initialized');
  });

  test('should handle large data compression', async () => {
    const recoveryPhrase = 'a1b2c3d4e5f6789012345678901234567890abcd';
    const largeData = { content: 'x'.repeat(2000) }; // Larger than threshold

    await manyllaEncryptionService.initialize(recoveryPhrase);

    const encrypted = manyllaEncryptionService.encryptData(largeData);
    const decrypted = manyllaEncryptionService.decryptData(encrypted);

    expect(decrypted).toEqual(largeData);
  });

  test('should get or create device key', async () => {
    // First call should create new key
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const deviceKey1 = await manyllaEncryptionService.getDeviceKey();
    expect(deviceKey1).toBeInstanceOf(Uint8Array);
    expect(deviceKey1).toHaveLength(32);

    // Second call should use existing key
    const existingKey = 'dGVzdC1kZXZpY2Uta2V5'; // base64
    AsyncStorage.getItem.mockResolvedValueOnce(existingKey);

    const deviceKey2 = await manyllaEncryptionService.getDeviceKey();
    expect(deviceKey2).toBeInstanceOf(Uint8Array);
  });
});