import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

/**
 * Test utilities for encryption testing
 * Provides helpers for testing encryption/decryption functionality
 */

// Mock encrypted data that matches the expected format
export const createMockEncryptedData = (plaintext = 'test data') => {
  const data = JSON.stringify({ test: plaintext });
  const key = nacl.randomBytes(32);
  const nonce = nacl.randomBytes(24);

  // Encrypt the data
  const dataBytes = util.decodeUTF8(data);
  const encrypted = nacl.secretbox(dataBytes, nonce, key);

  // Create the format expected by the encryption service
  const metadata = new Uint8Array(2);
  metadata[0] = 2; // version
  metadata[1] = 0; // not compressed

  const combined = new Uint8Array(metadata.length + nonce.length + encrypted.length);
  combined.set(metadata);
  combined.set(nonce, metadata.length);
  combined.set(encrypted, metadata.length + nonce.length);

  return {
    encrypted: util.encodeBase64(combined),
    key: util.encodeBase64(key),
    nonce: util.encodeBase64(nonce),
    plaintext: data,
  };
};

// Create a mock recovery phrase (32 hex characters)
export const createMockRecoveryPhrase = () => {
  const bytes = nacl.randomBytes(16);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Create predictable recovery phrase for consistent tests
export const TEST_RECOVERY_PHRASE = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

// Create predictable sync ID
export const TEST_SYNC_ID = 'test_sync_id_12345678';

// Mock encryption service methods
export const mockEncryptionService = {
  isInitialized: jest.fn(() => true),
  generateRecoveryPhrase: jest.fn(() => createMockRecoveryPhrase()),
  initialize: jest.fn(async () => ({ syncId: TEST_SYNC_ID, salt: 'test_salt' })),
  init: jest.fn(async () => ({ syncId: TEST_SYNC_ID, salt: 'test_salt' })),
  encrypt: jest.fn((data) => createMockEncryptedData(JSON.stringify(data)).encrypted),
  encryptData: jest.fn((data) => createMockEncryptedData(JSON.stringify(data)).encrypted),
  decrypt: jest.fn((encrypted) => ({ test: 'decrypted data' })),
  decryptData: jest.fn((encrypted) => ({ test: 'decrypted data' })),
  clear: jest.fn(async () => {}),
  restore: jest.fn(async () => true),
  isEnabled: jest.fn(async () => true),
  getSyncId: jest.fn(async () => TEST_SYNC_ID),
  getDeviceKey: jest.fn(async () => nacl.randomBytes(32)),
  encryptWithKey: jest.fn(async () => 'encrypted_with_key'),
  deriveKeyFromPhrase: jest.fn(async (phrase, salt) => ({
    key: nacl.randomBytes(32),
    salt: salt || util.encodeBase64(nacl.randomBytes(16)),
    syncId: TEST_SYNC_ID,
  })),
};

// Mock sync service methods
export const mockSyncService = {
  init: jest.fn(async () => true),
  checkHealth: jest.fn(async () => true),
  push: jest.fn(async () => ({ success: true })),
  pull: jest.fn(async () => ({ test: 'pulled data' })),
  startPolling: jest.fn(),
  stopPolling: jest.fn(),
  addListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
  generateRecoveryPhrase: jest.fn(() => createMockRecoveryPhrase()),
  enableSync: jest.fn(async () => true),
  disableSync: jest.fn(async () => {}),
  isSyncEnabled: jest.fn(() => true),
  getSyncId: jest.fn(() => TEST_SYNC_ID),
  pushData: jest.fn(async () => ({ success: true })),
  pullData: jest.fn(async () => ({ test: 'pulled data' })),
  getStatus: jest.fn(() => ({
    initialized: true,
    polling: false,
    lastPull: Date.now(),
    syncId: TEST_SYNC_ID,
  })),
  setDataCallback: jest.fn(),
  generateInviteCode: jest.fn((phrase) => phrase.toUpperCase()),
  joinFromInvite: jest.fn(async () => ({ test: 'joined data' })),
  reset: jest.fn(async () => {}),
};

// Utility to create test profile data
export const createTestProfileData = (overrides = {}) => ({
  id: 'test-profile-1',
  name: 'Test Child',
  dateOfBirth: '2010-01-01',
  categories: [
    {
      id: 'cat-1',
      name: 'Medical',
      color: '#E76F51',
      entries: [
        {
          id: 'entry-1',
          title: 'Test Medical Entry',
          content: 'This is a test entry',
          date: '2024-01-01',
        },
      ],
    },
  ],
  quickInfo: [
    {
      id: 'quick-1',
      title: 'Emergency Contact',
      content: 'Test Contact - 555-0123',
    },
  ],
  photos: [],
  lastModified: Date.now(),
  ...overrides,
});

// Utility to mock encrypted storage operations
export const mockSecureStorage = {
  getItem: jest.fn(async (key) => {
    const storage = {
      'secure_manylla_recovery': 'encrypted_recovery_phrase',
      'secure_manylla_salt': util.encodeBase64(nacl.randomBytes(16)),
      'secure_manylla_sync_id': TEST_SYNC_ID,
      'secure_manylla_device_key': util.encodeBase64(nacl.randomBytes(32)),
    };
    return storage[key] || null;
  }),
  setItem: jest.fn(async () => true),
  removeItem: jest.fn(async () => true),
};

// Helper to wait for async operations
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Encryption test vectors for consistency
export const TEST_VECTORS = {
  phrase: TEST_RECOVERY_PHRASE,
  syncId: TEST_SYNC_ID,
  plaintext: 'Hello, Manylla!',
  salt: 'dGVzdF9zYWx0XzEyMzQ1Njc4', // base64 encoded test salt
};