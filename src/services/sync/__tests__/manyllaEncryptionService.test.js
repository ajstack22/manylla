import manyllaEncryptionService from "../manyllaEncryptionService";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import {
  TEST_RECOVERY_PHRASE,
  createTestProfileData,
} from "../../../test/utils/encryption-helpers";

// Mock the polyfill import
jest.mock("../../../polyfills/crypto", () => ({}));

// Mock AsyncStorage for testing
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

describe("ManyllaEncryptionService", () => {
  beforeEach(() => {
    // Reset the service state
    manyllaEncryptionService.masterKey = null;
    manyllaEncryptionService.syncId = null;

    // Reset all mocks
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(true);
    mockAsyncStorage.removeItem.mockResolvedValue(true);
  });

  describe("Recovery Phrase Generation", () => {
    test("should generate 32-character hex recovery phrase", () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();

      expect(phrase).toHaveLength(32);
      expect(phrase).toMatch(/^[a-f0-9]{32}$/);
    });

    test("should generate unique recovery phrases", () => {
      const phrase1 = manyllaEncryptionService.generateRecoveryPhrase();
      const phrase2 = manyllaEncryptionService.generateRecoveryPhrase();

      expect(phrase1).not.toBe(phrase2);
    });
  });

  describe("Key Derivation", () => {
    test("should derive consistent keys from same recovery phrase", async () => {
      const phrase = TEST_RECOVERY_PHRASE;
      const salt = util.encodeBase64(nacl.randomBytes(16));

      const result1 = await manyllaEncryptionService.deriveKeyFromPhrase(
        phrase,
        salt,
      );
      const result2 = await manyllaEncryptionService.deriveKeyFromPhrase(
        phrase,
        salt,
      );

      expect(result1.key).toEqual(result2.key);
      expect(result1.syncId).toBe(result2.syncId);
      expect(result1.salt).toBe(result2.salt);
    });

    test("should generate different keys for different phrases", async () => {
      const phrase1 = TEST_RECOVERY_PHRASE;
      const phrase2 = manyllaEncryptionService.generateRecoveryPhrase();
      const salt = util.encodeBase64(nacl.randomBytes(16));

      const result1 = await manyllaEncryptionService.deriveKeyFromPhrase(
        phrase1,
        salt,
      );
      const result2 = await manyllaEncryptionService.deriveKeyFromPhrase(
        phrase2,
        salt,
      );

      expect(result1.key).not.toEqual(result2.key);
      expect(result1.syncId).not.toBe(result2.syncId);
    });

    test("should generate different keys for same phrase with different salts", async () => {
      const phrase = TEST_RECOVERY_PHRASE;
      const salt1 = util.encodeBase64(nacl.randomBytes(16));
      const salt2 = util.encodeBase64(nacl.randomBytes(16));

      const result1 = await manyllaEncryptionService.deriveKeyFromPhrase(
        phrase,
        salt1,
      );
      const result2 = await manyllaEncryptionService.deriveKeyFromPhrase(
        phrase,
        salt2,
      );

      expect(result1.key).not.toEqual(result2.key);
      expect(result1.salt).not.toBe(result2.salt);
      // Sync ID should be the same as it uses fixed salt
      expect(result1.syncId).toBe(result2.syncId);
    });

    test("should generate salt when not provided", async () => {
      const phrase = TEST_RECOVERY_PHRASE;

      const result = await manyllaEncryptionService.deriveKeyFromPhrase(phrase);

      expect(result.salt).toBeDefined();
      expect(result.salt.length).toBeGreaterThan(0);
    });
  });

  describe("Initialization", () => {
    test("should initialize with recovery phrase", async () => {
      const phrase = TEST_RECOVERY_PHRASE;
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await manyllaEncryptionService.initialize(phrase);

      expect(result).toHaveProperty("syncId");
      expect(result).toHaveProperty("salt");
      expect(manyllaEncryptionService.isInitialized()).toBe(true);
      expect(manyllaEncryptionService.masterKey).toBeDefined();
      expect(manyllaEncryptionService.syncId).toBeDefined();
    });

    test("should initialize with existing salt", async () => {
      const phrase = TEST_RECOVERY_PHRASE;
      const existingSalt = util.encodeBase64(nacl.randomBytes(16));

      const result = await manyllaEncryptionService.initialize(
        phrase,
        existingSalt,
      );

      expect(result.salt).toBe(existingSalt);
    });

    test("should store encrypted recovery phrase and salt", async () => {
      const phrase = TEST_RECOVERY_PHRASE;
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await manyllaEncryptionService.initialize(phrase);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "secure_manylla_salt",
        expect.any(String),
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "secure_manylla_sync_id",
        expect.any(String),
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "secure_manylla_recovery",
        expect.any(String),
      );
    });

    test("init should be alias for initialize", async () => {
      const phrase = TEST_RECOVERY_PHRASE;

      const result = await manyllaEncryptionService.init(phrase);

      expect(result).toHaveProperty("syncId");
      expect(result).toHaveProperty("salt");
      expect(manyllaEncryptionService.isInitialized()).toBe(true);
    });
  });

  describe("Data Encryption/Decryption", () => {
    beforeEach(async () => {
      await manyllaEncryptionService.initialize(TEST_RECOVERY_PHRASE);
    });

    test("should encrypt and decrypt data correctly", () => {
      const testData = createTestProfileData();

      const encrypted = manyllaEncryptionService.encryptData(testData);
      expect(typeof encrypted).toBe("string");
      expect(encrypted.length).toBeGreaterThan(0);

      const decrypted = manyllaEncryptionService.decryptData(encrypted);
      expect(decrypted).toEqual(testData);
    });

    test("should encrypt and decrypt complex objects", () => {
      const complexData = {
        profiles: [createTestProfileData()],
        settings: { theme: "dark", sync: true },
        metadata: { version: "2.0.0", timestamp: Date.now() },
        nested: {
          deep: {
            data: "test",
            array: [1, 2, 3, { nested: "object" }],
          },
        },
      };

      const encrypted = manyllaEncryptionService.encryptData(complexData);
      const decrypted = manyllaEncryptionService.decryptData(encrypted);

      expect(decrypted).toEqual(complexData);
    });

    test("should handle large data with compression", () => {
      // Create large data that should trigger compression
      const largeData = {
        profiles: Array(50).fill(createTestProfileData()),
        largeString: "x".repeat(2000),
      };

      const encrypted = manyllaEncryptionService.encryptData(largeData);
      const decrypted = manyllaEncryptionService.decryptData(encrypted);

      expect(decrypted).toEqual(largeData);
    });

    test("should handle Unicode characters correctly", () => {
      const unicodeData = {
        emoji: "🏥📝👶",
        accents: "Café résumé naïve",
        asian: "你好世界",
        symbols: "∑∏∆√",
      };

      const encrypted = manyllaEncryptionService.encryptData(unicodeData);
      const decrypted = manyllaEncryptionService.decryptData(encrypted);

      expect(decrypted).toEqual(unicodeData);
    });

    test("should throw error when encrypting without initialization", () => {
      manyllaEncryptionService.masterKey = null;

      expect(() => {
        manyllaEncryptionService.encryptData({ test: "data" });
      }).toThrow("Encryption not initialized");
    });

    test("should throw error when decrypting without initialization", () => {
      const encrypted = "some_encrypted_data";
      manyllaEncryptionService.masterKey = null;

      expect(() => {
        manyllaEncryptionService.decryptData(encrypted);
      }).toThrow("Encryption not initialized");
    });

    test("should throw error when decrypting invalid data", () => {
      expect(() => {
        manyllaEncryptionService.decryptData("invalid_encrypted_data");
      }).toThrow();
    });

    test("should throw error when decrypting corrupted data", () => {
      const testData = { test: "data" };
      const encrypted = manyllaEncryptionService.encryptData(testData);

      // Corrupt the encrypted data
      const corrupted = encrypted.slice(0, -10) + "corrupted";

      expect(() => {
        manyllaEncryptionService.decryptData(corrupted);
      }).toThrow();
    });

    test("encrypt and decrypt should be aliases", () => {
      const testData = { test: "data" };

      const encrypted1 = manyllaEncryptionService.encrypt(testData);
      const encrypted2 = manyllaEncryptionService.encryptData(testData);

      expect(typeof encrypted1).toBe("string");
      expect(typeof encrypted2).toBe("string");

      const decrypted1 = manyllaEncryptionService.decrypt(encrypted1);
      const decrypted2 = manyllaEncryptionService.decryptData(encrypted2);

      expect(decrypted1).toEqual(testData);
      expect(decrypted2).toEqual(testData);
    });

    test("should handle empty data", () => {
      const emptyData = {};

      const encrypted = manyllaEncryptionService.encryptData(emptyData);
      const decrypted = manyllaEncryptionService.decryptData(encrypted);

      expect(decrypted).toEqual(emptyData);
    });

    test("should handle null and undefined values", () => {
      const dataWithNulls = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: "",
        zero: 0,
        false: false,
      };

      const encrypted = manyllaEncryptionService.encryptData(dataWithNulls);
      const decrypted = manyllaEncryptionService.decryptData(encrypted);

      // Note: undefined values are lost in JSON serialization
      expect(decrypted).toEqual({
        nullValue: null,
        emptyString: "",
        zero: 0,
        false: false,
      });
    });
  });

  describe("Device Key Management", () => {
    test("should generate device key when none exists", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const deviceKey = await manyllaEncryptionService.getDeviceKey();

      expect(deviceKey).toBeInstanceOf(Uint8Array);
      expect(deviceKey.length).toBe(32);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "secure_manylla_device_key",
        expect.any(String),
      );
    });

    test("should reuse existing device key", async () => {
      const existingKey = util.encodeBase64(nacl.randomBytes(32));
      mockAsyncStorage.getItem.mockResolvedValue(existingKey);

      const deviceKey = await manyllaEncryptionService.getDeviceKey();

      expect(deviceKey).toEqual(util.decodeBase64(existingKey));
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("Key-specific Encryption", () => {
    test("should encrypt with specific key", async () => {
      const testData = "test string";
      const key = nacl.randomBytes(32);

      const encrypted = await manyllaEncryptionService.encryptWithKey(
        testData,
        key,
      );

      expect(typeof encrypted).toBe("string");
      expect(encrypted.length).toBeGreaterThan(0);

      // Decrypt manually to verify
      const combined = util.decodeBase64(encrypted);
      const nonce = combined.slice(0, 24);
      const ciphertext = combined.slice(24);
      const decrypted = nacl.secretbox.open(ciphertext, nonce, key);

      expect(decrypted).toBeTruthy();
    });
  });

  describe("Service State Management", () => {
    test("should check if enabled", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      expect(await manyllaEncryptionService.isEnabled()).toBe(false);

      mockAsyncStorage.getItem.mockResolvedValue("test_sync_id");
      expect(await manyllaEncryptionService.isEnabled()).toBe(true);
    });

    test("should get sync ID", async () => {
      const testSyncId = "test_sync_id_123";
      mockAsyncStorage.getItem.mockResolvedValue(testSyncId);

      const syncId = await manyllaEncryptionService.getSyncId();

      expect(syncId).toBe(testSyncId);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        "secure_manylla_sync_id",
      );
    });

    test("should clear all data", async () => {
      await manyllaEncryptionService.initialize(TEST_RECOVERY_PHRASE);

      await manyllaEncryptionService.clear();

      expect(manyllaEncryptionService.masterKey).toBe(null);
      expect(manyllaEncryptionService.syncId).toBe(null);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "secure_manylla_salt",
      );
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "secure_manylla_sync_id",
      );
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "secure_manylla_recovery",
      );
    });
  });

  describe("Service Restoration", () => {
    test("should restore from stored recovery phrase", async () => {
      const encryptedPhrase = "encrypted_recovery_phrase";
      const salt = util.encodeBase64(nacl.randomBytes(16));

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === "secure_manylla_recovery")
          return Promise.resolve(encryptedPhrase);
        if (key === "secure_manylla_salt") return Promise.resolve(salt);
        if (key === "secure_manylla_device_key")
          return Promise.resolve(util.encodeBase64(nacl.randomBytes(32)));
        return Promise.resolve(null);
      });

      // Mock successful decryption
      const originalDecrypt = nacl.secretbox.open;
      nacl.secretbox.open = jest.fn(() =>
        util.decodeUTF8(TEST_RECOVERY_PHRASE),
      );

      const result = await manyllaEncryptionService.restore();

      expect(result).toBe(true);
      expect(manyllaEncryptionService.isInitialized()).toBe(true);

      // Restore original function
      nacl.secretbox.open = originalDecrypt;
    });

    test("should fail restoration with missing data", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await manyllaEncryptionService.restore();

      expect(result).toBe(false);
      expect(manyllaEncryptionService.isInitialized()).toBe(false);
    });

    test("should fail restoration with invalid encrypted phrase", async () => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === "secure_manylla_recovery")
          return Promise.resolve("invalid_encrypted");
        if (key === "secure_manylla_salt")
          return Promise.resolve(util.encodeBase64(nacl.randomBytes(16)));
        if (key === "secure_manylla_device_key")
          return Promise.resolve(util.encodeBase64(nacl.randomBytes(32)));
        return Promise.resolve(null);
      });

      // Mock failed decryption
      const originalDecrypt = nacl.secretbox.open;
      nacl.secretbox.open = jest.fn(() => null);

      const result = await manyllaEncryptionService.restore();

      expect(result).toBe(false);

      // Restore original function
      nacl.secretbox.open = originalDecrypt;
    });
  });

  describe("Error Handling", () => {
    test("should handle storage errors gracefully", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
      mockAsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      // Should not throw, but return null/false for failures
      expect(await manyllaEncryptionService.isEnabled()).toBe(false);
      expect(await manyllaEncryptionService.getSyncId()).toBe(null);
    });

    test("should handle malformed encrypted data", async () => {
      await manyllaEncryptionService.initialize(TEST_RECOVERY_PHRASE);

      expect(() => {
        manyllaEncryptionService.decryptData("not_base64_data");
      }).toThrow();

      expect(() => {
        manyllaEncryptionService.decryptData(null);
      }).toThrow();

      expect(() => {
        manyllaEncryptionService.decryptData("");
      }).toThrow();
    });

    test("should handle decryption with wrong key", async () => {
      const testData = { test: "data" };

      await manyllaEncryptionService.initialize(TEST_RECOVERY_PHRASE);
      const encrypted = manyllaEncryptionService.encryptData(testData);

      // Initialize with different phrase (different key)
      await manyllaEncryptionService.initialize(
        manyllaEncryptionService.generateRecoveryPhrase(),
      );

      expect(() => {
        manyllaEncryptionService.decryptData(encrypted);
      }).toThrow("Decryption failed");
    });
  });

  describe("UTF-8 Encoding/Decoding", () => {
    test("should handle various UTF-8 characters correctly", () => {
      const testStrings = [
        "Hello, World!",
        "Café résumé naïve",
        "你好世界",
        "🏥📝👶",
        "Ñoño piñata",
        "Москва",
        "∑∏∆√",
        "Mixed: Hello 世界 🌍 café",
      ];

      testStrings.forEach((str) => {
        const data = { text: str };
        const encrypted = manyllaEncryptionService.encryptData(data);
        const decrypted = manyllaEncryptionService.decryptData(encrypted);

        expect(decrypted.text).toBe(str);
      });
    });
  });
});
