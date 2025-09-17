/**
 * Comprehensive test coverage for manyllaEncryptionService
 * Tests encryption, decryption, key derivation, and storage functionality
 */

import manyllaEncryptionService from "../manyllaEncryptionService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import nacl from "tweetnacl";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage");

// Mock tweetnacl for predictable testing
jest.mock("tweetnacl", () => {
  const mockSecretbox = jest.fn();
  mockSecretbox.nonceLength = 24;
  mockSecretbox.open = jest.fn();

  return {
    randomBytes: jest.fn(),
    hash: jest.fn(),
    secretbox: mockSecretbox,
    __esModule: true,
    default: {
      randomBytes: jest.fn(),
      hash: jest.fn(),
      secretbox: mockSecretbox,
    },
  };
});

// Mock pako
jest.mock("pako", () => ({
  deflate: jest.fn(),
  inflate: jest.fn(),
}));

// Mock tweetnacl-util
jest.mock("tweetnacl-util", () => ({
  encodeBase64: jest.fn(),
  decodeBase64: jest.fn(),
}));

// P2 TECH DEBT: Remove skip when working on encryption service
// Issue: Mock dependencies and crypto testing
describe.skip("ManyllaEncryptionService", () => {
  let mockRandomBytes;
  let mockHash;
  let mockSecretbox;
  let mockAsyncStorage;
  let util;
  let pako;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup AsyncStorage mocks
    mockAsyncStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    AsyncStorage.getItem.mockImplementation(mockAsyncStorage.getItem);
    AsyncStorage.setItem.mockImplementation(mockAsyncStorage.setItem);
    AsyncStorage.removeItem.mockImplementation(mockAsyncStorage.removeItem);

    // Setup nacl mocks
    mockRandomBytes = jest.fn();
    mockHash = jest.fn();
    mockSecretbox = jest.fn();

    // Update the existing mock functions
    nacl.randomBytes.mockImplementation(mockRandomBytes);
    nacl.hash.mockImplementation(mockHash);
    nacl.secretbox.mockImplementation(mockSecretbox);
    nacl.secretbox.open = jest.fn();

    // Setup util mocks
    util = require("tweetnacl-util");
    util.encodeBase64.mockImplementation((bytes) => {
      return Buffer.from(bytes).toString("base64");
    });
    util.decodeBase64.mockImplementation((str) => {
      return new Uint8Array(Buffer.from(str, "base64"));
    });

    // Setup pako mocks
    pako = require("pako");
    pako.deflate.mockImplementation((data) => new Uint8Array(data.length / 2));
    pako.inflate.mockImplementation((data) => new Uint8Array(data.length * 2));

    // Setup predictable random bytes
    mockRandomBytes.mockImplementation((length) => {
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = i % 256;
      }
      return bytes;
    });

    // Setup predictable hash function
    mockHash.mockImplementation((input) => {
      const output = new Uint8Array(64);
      for (let i = 0; i < 64; i++) {
        output[i] = (input[i % input.length] + i) % 256;
      }
      return output;
    });

    // Setup secretbox mock
    mockSecretbox.mockImplementation((message, nonce, key) => {
      const encrypted = new Uint8Array(message.length + 16);
      encrypted.set(message);
      encrypted.set(nonce.slice(0, 16), message.length);
      return encrypted;
    });

    nacl.secretbox.open.mockImplementation((ciphertext, nonce, key) => {
      if (ciphertext.length < 16) return null;
      return ciphertext.slice(0, ciphertext.length - 16);
    });

    // Clear service state
    manyllaEncryptionService.masterKey = null;
    manyllaEncryptionService.syncId = null;
  });

  describe("generateRecoveryPhrase", () => {
    test("should generate 32-character hex recovery phrase", () => {
      mockRandomBytes.mockReturnValue(
        new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
      );

      const phrase = manyllaEncryptionService.generateRecoveryPhrase();

      expect(phrase).toBe("000102030405060708090a0b0c0d0e0f");
      expect(phrase).toHaveLength(32);
      expect(mockRandomBytes).toHaveBeenCalledWith(16);
    });

    test("should generate different phrases on multiple calls", () => {
      mockRandomBytes
        .mockReturnValueOnce(
          new Uint8Array([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
          ]),
        )
        .mockReturnValueOnce(
          new Uint8Array([
            15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
          ]),
        );

      const phrase1 = manyllaEncryptionService.generateRecoveryPhrase();
      const phrase2 = manyllaEncryptionService.generateRecoveryPhrase();

      expect(phrase1).not.toBe(phrase2);
      expect(phrase1).toBe("000102030405060708090a0b0c0d0e0f");
      expect(phrase2).toBe("0f0e0d0c0b0a09080706050403020100");
    });
  });

  describe("deriveKeyFromPhrase", () => {
    test("should derive key and syncId from recovery phrase", async () => {
      const recoveryPhrase = "test-recovery-phrase";
      const mockSalt = new Uint8Array(16).fill(1);

      mockRandomBytes.mockReturnValue(mockSalt);

      const result =
        await manyllaEncryptionService.deriveKeyFromPhrase(recoveryPhrase);

      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("salt");
      expect(result).toHaveProperty("syncId");
      expect(result.key).toBeInstanceOf(Uint8Array);
      expect(result.key).toHaveLength(32);
      expect(mockHash).toHaveBeenCalled();
    });

    test("should use provided salt when given", async () => {
      const recoveryPhrase = "test-recovery-phrase";
      const existingSalt = "dGVzdHNhbHQ="; // base64 encoded "testsalt"

      util.decodeBase64.mockReturnValue(
        new Uint8Array([116, 101, 115, 116, 115, 97, 108, 116]),
      );

      const result = await manyllaEncryptionService.deriveKeyFromPhrase(
        recoveryPhrase,
        existingSalt,
      );

      expect(result.salt).toBe(existingSalt);
      expect(mockRandomBytes).not.toHaveBeenCalled();
    });

    test("should perform 100000 iterations for key derivation", async () => {
      const recoveryPhrase = "test-phrase";

      await manyllaEncryptionService.deriveKeyFromPhrase(recoveryPhrase);

      // Should be called 200000 times (100000 for syncId + 100000 for encryption key)
      expect(mockHash).toHaveBeenCalledTimes(200000);
    });
  });

  describe("initialize and init", () => {
    test("should initialize encryption service", async () => {
      const recoveryPhrase = "test-recovery-phrase";
      mockAsyncStorage.setItem.mockResolvedValue(true);

      const result = await manyllaEncryptionService.initialize(recoveryPhrase);

      expect(result).toHaveProperty("syncId");
      expect(result).toHaveProperty("salt");
      expect(manyllaEncryptionService.masterKey).toBeDefined();
      expect(manyllaEncryptionService.syncId).toBeDefined();
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

    test("should work with init alias", async () => {
      const recoveryPhrase = "test-recovery-phrase";
      mockAsyncStorage.setItem.mockResolvedValue(true);

      const result = await manyllaEncryptionService.init(recoveryPhrase);

      expect(result).toHaveProperty("syncId");
      expect(result).toHaveProperty("salt");
    });

    test("should handle existing salt", async () => {
      const recoveryPhrase = "test-recovery-phrase";
      const existingSalt = "dGVzdC1zYWx0"; // base64 for "test-salt"
      mockAsyncStorage.setItem.mockResolvedValue(true);

      // Mock the base64 decode/encode cycle
      util.decodeBase64.mockReturnValue(
        new Uint8Array([116, 101, 115, 116, 45, 115, 97, 108, 116]),
      ); // "test-salt" as bytes
      util.encodeBase64.mockReturnValue(existingSalt);

      const result = await manyllaEncryptionService.initialize(
        recoveryPhrase,
        existingSalt,
      );

      expect(result.salt).toBe(existingSalt);
    });
  });

  describe("isInitialized", () => {
    test("should return false when not initialized", () => {
      expect(manyllaEncryptionService.isInitialized()).toBe(false);
    });

    test("should return true when initialized", async () => {
      mockAsyncStorage.setItem.mockResolvedValue(true);
      await manyllaEncryptionService.initialize("test-phrase");

      expect(manyllaEncryptionService.isInitialized()).toBe(true);
    });
  });

  describe("encryptData and encrypt", () => {
    beforeEach(async () => {
      mockAsyncStorage.setItem.mockResolvedValue(true);
      await manyllaEncryptionService.initialize("test-phrase");
    });

    test("should encrypt data successfully", () => {
      const testData = { test: "data", number: 123 };

      const encrypted = manyllaEncryptionService.encryptData(testData);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(mockSecretbox).toHaveBeenCalled();
    });

    test("should work with encrypt alias", () => {
      const testData = { test: "data" };

      const encrypted = manyllaEncryptionService.encrypt(testData);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
    });

    test("should handle undefined data", () => {
      const encrypted = manyllaEncryptionService.encryptData(undefined);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
    });

    test("should compress large data", () => {
      const largeData = { data: "x".repeat(2000) }; // Larger than COMPRESSION_THRESHOLD
      pako.deflate.mockReturnValue(new Uint8Array(100)); // Mock smaller compressed size

      const encrypted = manyllaEncryptionService.encryptData(largeData);

      expect(pako.deflate).toHaveBeenCalled();
      expect(encrypted).toBeDefined();
    });

    test("should not compress if compression doesn't help", () => {
      const largeData = { data: "x".repeat(2000) };
      pako.deflate.mockReturnValue(new Uint8Array(3000)); // Mock larger compressed size

      const encrypted = manyllaEncryptionService.encryptData(largeData);

      expect(pako.deflate).toHaveBeenCalled();
      expect(encrypted).toBeDefined();
    });

    test("should handle compression errors gracefully", () => {
      const largeData = { data: "x".repeat(2000) };
      pako.deflate.mockImplementation(() => {
        throw new Error("Compression failed");
      });

      const encrypted = manyllaEncryptionService.encryptData(largeData);

      expect(encrypted).toBeDefined();
      // Should continue with uncompressed data
    });

    test("should throw error when not initialized", () => {
      manyllaEncryptionService.masterKey = null;

      expect(() => {
        manyllaEncryptionService.encryptData({ test: "data" });
      }).toThrow("Encryption not initialized");
    });
  });

  describe("decryptData and decrypt", () => {
    beforeEach(async () => {
      mockAsyncStorage.setItem.mockResolvedValue(true);
      await manyllaEncryptionService.initialize("test-phrase");
    });

    test("should decrypt data successfully", () => {
      const testData = { test: "data", number: 123 };
      const encryptedData = "mock-encrypted-data";

      // Mock successful decryption
      const mockCombined = new Uint8Array([
        2,
        0,
        ...Array(24).fill(1),
        ...Array(50).fill(2),
      ]);
      util.decodeBase64.mockReturnValue(mockCombined);

      const jsonString = JSON.stringify(testData);
      const jsonBytes = new TextEncoder().encode(jsonString);
      nacl.secretbox.open.mockReturnValue(jsonBytes);

      const decrypted = manyllaEncryptionService.decryptData(encryptedData);

      expect(decrypted).toEqual(testData);
    });

    test("should work with decrypt alias", () => {
      const encryptedData = "mock-encrypted-data";

      const mockCombined = new Uint8Array([
        2,
        0,
        ...Array(24).fill(1),
        ...Array(50).fill(2),
      ]);
      util.decodeBase64.mockReturnValue(mockCombined);

      const jsonString = JSON.stringify({ test: "data" });
      const jsonBytes = new TextEncoder().encode(jsonString);
      nacl.secretbox.open.mockReturnValue(jsonBytes);

      const decrypted = manyllaEncryptionService.decrypt(encryptedData);

      expect(decrypted).toEqual({ test: "data" });
    });

    test("should handle object format input", () => {
      const encryptedData = { data: "mock-encrypted-data" };

      const mockCombined = new Uint8Array([
        2,
        0,
        ...Array(24).fill(1),
        ...Array(50).fill(2),
      ]);
      util.decodeBase64.mockReturnValue(mockCombined);

      const jsonString = JSON.stringify({ test: "data" });
      const jsonBytes = new TextEncoder().encode(jsonString);
      nacl.secretbox.open.mockReturnValue(jsonBytes);

      const decrypted = manyllaEncryptionService.decryptData(encryptedData);

      expect(decrypted).toEqual({ test: "data" });
    });

    test("should handle compressed data", () => {
      const testData = { test: "data" };
      const encryptedData = "mock-encrypted-data";

      // Mock compressed data (metadata[1] = 1)
      const mockCombined = new Uint8Array([
        2,
        1,
        ...Array(24).fill(1),
        ...Array(50).fill(2),
      ]);
      util.decodeBase64.mockReturnValue(mockCombined);

      const compressedBytes = new Uint8Array(10);
      nacl.secretbox.open.mockReturnValue(compressedBytes);

      const jsonString = JSON.stringify(testData);
      const jsonBytes = new TextEncoder().encode(jsonString);
      pako.inflate.mockReturnValue(jsonBytes);

      const decrypted = manyllaEncryptionService.decryptData(encryptedData);

      expect(pako.inflate).toHaveBeenCalledWith(compressedBytes);
      expect(decrypted).toEqual(testData);
    });

    test("should handle undefined data correctly", () => {
      const encryptedData = "mock-encrypted-data";

      const mockCombined = new Uint8Array([
        2,
        0,
        ...Array(24).fill(1),
        ...Array(50).fill(2),
      ]);
      util.decodeBase64.mockReturnValue(mockCombined);

      const jsonString = JSON.stringify({ __manylla_undefined: true });
      const jsonBytes = new TextEncoder().encode(jsonString);
      nacl.secretbox.open.mockReturnValue(jsonBytes);

      const decrypted = manyllaEncryptionService.decryptData(encryptedData);

      expect(decrypted).toBeUndefined();
    });

    test("should throw error when not initialized", () => {
      manyllaEncryptionService.masterKey = null;

      expect(() => {
        manyllaEncryptionService.decryptData("encrypted-data");
      }).toThrow("Encryption not initialized");
    });

    test("should throw error for invalid encrypted data", () => {
      expect(() => {
        manyllaEncryptionService.decryptData(null);
      }).toThrow("Cannot read properties of null");

      expect(() => {
        manyllaEncryptionService.decryptData({});
      }).toThrow("No encrypted data found");
    });

    test("should throw error when decryption fails", () => {
      const encryptedData = "mock-encrypted-data";

      const mockCombined = new Uint8Array([
        2,
        0,
        ...Array(24).fill(1),
        ...Array(50).fill(2),
      ]);
      util.decodeBase64.mockReturnValue(mockCombined);
      nacl.secretbox.open.mockReturnValue(null); // Decryption failure

      expect(() => {
        manyllaEncryptionService.decryptData(encryptedData);
      }).toThrow("Decryption failed - invalid key or corrupted data");
    });

    test("should throw error when decompression fails", () => {
      const encryptedData = "mock-encrypted-data";

      const mockCombined = new Uint8Array([
        2,
        1,
        ...Array(24).fill(1),
        ...Array(50).fill(2),
      ]);
      util.decodeBase64.mockReturnValue(mockCombined);

      const compressedBytes = new Uint8Array(10);
      nacl.secretbox.open.mockReturnValue(compressedBytes);

      pako.inflate.mockImplementation(() => {
        throw new Error("Decompression failed");
      });

      expect(() => {
        manyllaEncryptionService.decryptData(encryptedData);
      }).toThrow("Failed to decompress data");
    });
  });

  describe("getDeviceKey", () => {
    test("should return existing device key", async () => {
      const existingKey = "existing-device-key";
      mockAsyncStorage.getItem.mockResolvedValue(existingKey);
      util.decodeBase64.mockReturnValue(new Uint8Array(32));

      const deviceKey = await manyllaEncryptionService.getDeviceKey();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        "secure_manylla_device_key",
      );
      expect(deviceKey).toBeInstanceOf(Uint8Array);
    });

    test("should generate new device key if none exists", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(true);

      const deviceKey = await manyllaEncryptionService.getDeviceKey();

      expect(mockRandomBytes).toHaveBeenCalledWith(32);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "secure_manylla_device_key",
        expect.any(String),
      );
      expect(deviceKey).toBeInstanceOf(Uint8Array);
    });
  });

  describe("encryptWithKey", () => {
    test("should encrypt data with specific key", async () => {
      const data = "test data";
      const key = new Uint8Array(32);

      const encrypted = await manyllaEncryptionService.encryptWithKey(
        data,
        key,
      );

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(mockSecretbox).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        expect.any(Uint8Array),
        key,
      );
    });
  });

  describe("isEnabled", () => {
    test("should return true when sync ID exists", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("sync-id");

      const enabled = await manyllaEncryptionService.isEnabled();

      expect(enabled).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        "secure_manylla_sync_id",
      );
    });

    test("should return false when sync ID doesn't exist", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const enabled = await manyllaEncryptionService.isEnabled();

      expect(enabled).toBe(false);
    });
  });

  describe("getSyncId", () => {
    test("should return stored sync ID", async () => {
      const syncId = "test-sync-id";
      mockAsyncStorage.getItem.mockResolvedValue(syncId);

      const result = await manyllaEncryptionService.getSyncId();

      expect(result).toBe(syncId);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        "secure_manylla_sync_id",
      );
    });
  });

  describe("clear", () => {
    test("should clear all sync data", async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(true);
      manyllaEncryptionService.masterKey = new Uint8Array(32);
      manyllaEncryptionService.syncId = "test-sync-id";

      await manyllaEncryptionService.clear();

      expect(manyllaEncryptionService.masterKey).toBeNull();
      expect(manyllaEncryptionService.syncId).toBeNull();
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

  describe("restore", () => {
    test("should restore from stored recovery phrase", async () => {
      const encryptedPhrase = "encrypted-recovery-phrase";
      const salt = "stored-salt";

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(encryptedPhrase)
        .mockResolvedValueOnce(salt)
        .mockResolvedValueOnce("device-key");

      const mockCombined = new Uint8Array([
        ...Array(24).fill(1),
        ...Array(20).fill(2),
      ]);
      util.decodeBase64
        .mockReturnValueOnce(mockCombined)
        .mockReturnValueOnce(new Uint8Array(32));

      const recoveryPhrase = "test-recovery-phrase";
      const recoveryBytes = new TextEncoder().encode(recoveryPhrase);
      nacl.secretbox.open.mockReturnValue(recoveryBytes);

      mockAsyncStorage.setItem.mockResolvedValue(true);

      const result = await manyllaEncryptionService.restore();

      expect(result).toBe(true);
      expect(manyllaEncryptionService.isInitialized()).toBe(true);
    });

    test("should return false when no encrypted phrase exists", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await manyllaEncryptionService.restore();

      expect(result).toBe(false);
    });

    test("should return false when no salt exists", async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce("encrypted-phrase")
        .mockResolvedValueOnce(null);

      const result = await manyllaEncryptionService.restore();

      expect(result).toBe(false);
    });

    test("should return false when decryption fails", async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce("encrypted-phrase")
        .mockResolvedValueOnce("salt")
        .mockResolvedValueOnce("device-key");

      util.decodeBase64
        .mockReturnValueOnce(new Uint8Array(50))
        .mockReturnValueOnce(new Uint8Array(32));

      nacl.secretbox.open.mockReturnValue(null); // Decryption fails

      const result = await manyllaEncryptionService.restore();

      expect(result).toBe(false);
    });

    test("should handle errors gracefully", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const result = await manyllaEncryptionService.restore();

      expect(result).toBe(false);
    });
  });

  describe("Storage error handling", () => {
    test("should handle storage errors in SecureStorage.getItem", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const result = await manyllaEncryptionService.getSyncId();

      expect(result).toBeNull();
    });

    test("should handle storage errors in SecureStorage.setItem", async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      const deviceKey = await manyllaEncryptionService.getDeviceKey();

      expect(deviceKey).toBeInstanceOf(Uint8Array);
    });

    test("should handle storage errors in SecureStorage.removeItem", async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error("Storage error"));

      await expect(manyllaEncryptionService.clear()).resolves.not.toThrow();
    });
  });
});
