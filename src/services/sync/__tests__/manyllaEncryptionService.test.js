/**
 * Comprehensive tests for manyllaEncryptionService
 * Tier 1 Critical Component - Target: 80%+ coverage
 * Focus: Encryption/decryption, key derivation, error handling
 */

import nacl from "tweetnacl";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import encryptionService from "../manyllaEncryptionService";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage");

// Mock crypto polyfill
jest.mock("../../../polyfills/crypto");

// Mock tweetnacl
jest.mock("tweetnacl");

// Mock pako
jest.mock("pako");

// Mock the SecureStorage used by the service
const mockSecureStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Mock SecureStorage globally (used by the service)
global.SecureStorage = mockSecureStorage;

describe("manyllaEncryptionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup nacl mocks
    nacl.hash = jest.fn().mockReturnValue(new Uint8Array(32).fill(1));
    nacl.randomBytes = jest.fn().mockReturnValue(new Uint8Array(16).fill(2));
    nacl.secretbox = jest.fn().mockReturnValue(new Uint8Array(48).fill(3));
    nacl.secretbox.open = jest.fn().mockReturnValue(new Uint8Array(10).fill(4));
    nacl.secretbox.keyLength = 32;
    nacl.secretbox.nonceLength = 24;

    // Mock pako
    const pako = require("pako");
    pako.deflate = jest.fn().mockReturnValue(new Uint8Array([1, 2, 3]));
    pako.inflate = jest.fn().mockReturnValue(new Uint8Array([4, 5, 6]));

    // Mock tweetnacl-util
    // const util = require("tweetnacl-util");
    jest.doMock("tweetnacl-util", () => ({
      encodeBase64: jest.fn().mockReturnValue("base64string"),
      decodeBase64: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    }));

    // Reset SecureStorage mocks
    mockSecureStorage.getItem.mockResolvedValue(null);
    mockSecureStorage.setItem.mockResolvedValue();
    mockSecureStorage.removeItem.mockResolvedValue();
  });

  describe("Recovery Phrase Generation", () => {
    test("should generate recovery phrase", () => {
      const phrase = encryptionService.generateRecoveryPhrase();

      expect(phrase).toBeDefined();
      expect(typeof phrase).toBe("string");
      expect(phrase).toHaveLength(32); // 16 bytes * 2 (hex) as per StackMap format
      expect(/^[a-f0-9]{32}$/.test(phrase)).toBe(true);
      expect(nacl.randomBytes).toHaveBeenCalledWith(16);
    });

    test("should generate unique recovery phrases", () => {
      // Mock different random bytes for each call
      nacl.randomBytes
        .mockReturnValueOnce(new Uint8Array(16).fill(1))
        .mockReturnValueOnce(new Uint8Array(16).fill(2));

      const phrase1 = encryptionService.generateRecoveryPhrase();
      const phrase2 = encryptionService.generateRecoveryPhrase();

      expect(phrase1).not.toBe(phrase2);
      expect(nacl.randomBytes).toHaveBeenCalledTimes(2);
    });
  });

  describe("Key Derivation", () => {
    test("should derive key from recovery phrase", async () => {
      const recoveryPhrase = "a".repeat(32);
      const result =
        await encryptionService.deriveKeyFromPhrase(recoveryPhrase);

      expect(result).toBeDefined();
      expect(result.key).toBeInstanceOf(Uint8Array);
      expect(result.key).toHaveLength(32);
      expect(result.salt).toBeDefined();
      expect(result.syncId).toBeDefined();
      expect(nacl.hash).toHaveBeenCalled();
    });

    test("should derive key with existing salt", async () => {
      const recoveryPhrase = "b".repeat(32);
      const existingSalt = "ZXhpc3Rpbmdfc2FsdA=="; // base64 encoded

      const result = await encryptionService.deriveKeyFromPhrase(
        recoveryPhrase,
        existingSalt,
      );

      expect(result).toBeDefined();
      expect(result.key).toBeInstanceOf(Uint8Array);
      // Salt is returned as base64 string
      expect(result.salt).toBeDefined();
      expect(nacl.hash).toHaveBeenCalled();
    });

    test("should perform correct number of hash iterations", async () => {
      const recoveryPhrase = "c".repeat(32);

      await encryptionService.deriveKeyFromPhrase(recoveryPhrase);

      // The service calls hash twice per iteration (for key derivation + syncId)
      // 100,000 iterations * 2 = 200,000 calls
      expect(nacl.hash).toHaveBeenCalledTimes(200000);
    });
  });

  describe("Service Initialization", () => {
    test("should initialize with recovery phrase", async () => {
      const recoveryPhrase = "d".repeat(32);

      const result = await encryptionService.initialize(recoveryPhrase);

      expect(result).toBeDefined();
      expect(result.syncId).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        "manylla_salt",
        expect.any(String),
      );
      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        "manylla_sync_id",
        expect.any(String),
      );
      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        "manylla_recovery",
        expect.any(String),
      );
    });

    test("should initialize with existing salt", async () => {
      const recoveryPhrase = "e".repeat(32);
      const existingSalt = "ZXhpc3Rpbmdfc2FsdA==";

      const result = await encryptionService.initialize(
        recoveryPhrase,
        existingSalt,
      );

      expect(result).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(mockSecureStorage.setItem).toHaveBeenCalled();
    });

    test("should use init alias for initialize", async () => {
      const recoveryPhrase = "f".repeat(32);

      const result = await encryptionService.init(recoveryPhrase);

      expect(result).toBeDefined();
      expect(result.syncId).toBeDefined();
      expect(mockSecureStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("Encryption and Decryption", () => {
    beforeEach(async () => {
      // Initialize the service before testing encryption/decryption
      await encryptionService.initialize("test".repeat(8));
    });

    test("should encrypt data", async () => {
      const data = { test: "data", number: 123 };

      const encrypted = await encryptionService.encryptData(data);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(nacl.secretbox).toHaveBeenCalled();
    });

    test("should encrypt and decrypt data successfully", async () => {
      const originalData = { message: "test message", value: 42 };

      // Mock successful round-trip
      const jsonString = JSON.stringify({ v: 2, c: false, d: originalData });
      nacl.secretbox.open.mockReturnValue(new TextEncoder().encode(jsonString));

      const encrypted = await encryptionService.encryptData(originalData);
      const decrypted = await encryptionService.decryptData(encrypted);

      expect(decrypted).toEqual(originalData);
    });

    test("should use encrypt/decrypt aliases", async () => {
      const data = { alias: "test" };

      const encrypted = await encryptionService.encrypt(data);
      expect(encrypted).toBeDefined();

      const jsonString = JSON.stringify({ v: 2, c: false, d: data });
      nacl.secretbox.open.mockReturnValue(new TextEncoder().encode(jsonString));

      const decrypted = await encryptionService.decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });
  });

  describe("Data Compression", () => {
    beforeEach(async () => {
      await encryptionService.initialize("test".repeat(8));
    });

    test("should compress large data before encryption", async () => {
      const largeData = { content: "x".repeat(2000) }; // Above compression threshold

      await encryptionService.encryptData(largeData);

      const pako = require("pako");
      expect(pako.deflate).toHaveBeenCalled();
    });

    test("should not compress small data", async () => {
      const smallData = { content: "small" };

      await encryptionService.encryptData(smallData);

      const pako = require("pako");
      expect(pako.deflate).not.toHaveBeenCalled();
    });

    test("should decompress during decryption when needed", async () => {
      const mockCompressedData = JSON.stringify({
        v: 2,
        c: true, // compressed flag
        d: "compressed_data",
      });

      nacl.secretbox.open.mockReturnValue(
        new TextEncoder().encode(mockCompressedData),
      );

      const pako = require("pako");
      pako.inflate.mockReturnValue(
        new TextEncoder().encode('{"decompressed": "data"}'),
      );

      const result = await encryptionService.decryptData("encrypted");

      expect(pako.inflate).toHaveBeenCalled();
      expect(result).toEqual({ decompressed: "data" });
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid recovery phrase in key derivation", async () => {
      const invalidPhrase = "short";

      // The service doesn't validate phrase length, but let's test error handling
      await expect(
        encryptionService.deriveKeyFromPhrase(invalidPhrase),
      ).resolves.toBeDefined(); // Service is permissive with phrase format
    });

    test("should handle decryption failure", async () => {
      await encryptionService.initialize("test".repeat(8));

      nacl.secretbox.open.mockReturnValue(null); // Simulate decryption failure

      await expect(
        encryptionService.decryptData("invalid_data"),
      ).rejects.toThrow();
    });

    test("should handle malformed encrypted data", async () => {
      await encryptionService.initialize("test".repeat(8));

      // Mock util.decodeBase64 to throw
      const util = require("tweetnacl-util");
      util.decodeBase64.mockImplementation(() => {
        throw new Error("Invalid base64");
      });

      await expect(
        encryptionService.decryptData("malformed"),
      ).rejects.toThrow();
    });

    test("should handle JSON parsing errors during decryption", async () => {
      await encryptionService.initialize("test".repeat(8));

      nacl.secretbox.open.mockReturnValue(
        new TextEncoder().encode("invalid_json"),
      );

      await expect(
        encryptionService.decryptData("encrypted"),
      ).rejects.toThrow();
    });

    test("should handle encryption without initialization", async () => {
      // Create a fresh service instance without initialization
      const freshService =
        new (require("../manyllaEncryptionService").default.constructor)();

      await expect(
        freshService.encryptData({ test: "data" }),
      ).rejects.toThrow();
    });
  });

  describe("Service State Management", () => {
    test("should check if encryption is enabled", async () => {
      const isEnabledBefore = await encryptionService.isEnabled();
      expect(isEnabledBefore).toBe(false);

      await encryptionService.initialize("test".repeat(8));

      const isEnabledAfter = await encryptionService.isEnabled();
      expect(isEnabledAfter).toBe(true);
    });

    test("should get sync ID after initialization", async () => {
      await encryptionService.initialize("test".repeat(8));

      const syncId = await encryptionService.getSyncId();
      expect(syncId).toBeDefined();
      expect(typeof syncId).toBe("string");
    });

    test("should clear stored data", async () => {
      await encryptionService.initialize("test".repeat(8));

      await encryptionService.clear();

      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith("manylla_salt");
      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith(
        "manylla_sync_id",
      );
      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith(
        "manylla_recovery",
      );
    });

    test("should restore from stored recovery phrase", async () => {
      // Mock stored data
      mockSecureStorage.getItem.mockImplementation((key) => {
        switch (key) {
          case "manylla_recovery":
            return Promise.resolve("encrypted_phrase");
          case "manylla_salt":
            return Promise.resolve("stored_salt");
          default:
            return Promise.resolve(null);
        }
      });

      // Mock successful decryption of recovery phrase
      nacl.secretbox.open.mockReturnValue(
        new TextEncoder().encode("recovered_phrase"),
      );

      const restored = await encryptionService.restore();

      expect(restored).toBe(true);
      expect(mockSecureStorage.getItem).toHaveBeenCalledWith(
        "manylla_recovery",
      );
      expect(mockSecureStorage.getItem).toHaveBeenCalledWith("manylla_salt");
    });

    test("should fail to restore without stored data", async () => {
      mockSecureStorage.getItem.mockResolvedValue(null);

      const restored = await encryptionService.restore();

      expect(restored).toBe(false);
    });
  });

  describe("Device Key Management", () => {
    test("should get device key consistently", async () => {
      const deviceKey1 = await encryptionService.getDeviceKey();
      const deviceKey2 = await encryptionService.getDeviceKey();

      expect(deviceKey1).toBeDefined();
      expect(deviceKey1).toBeInstanceOf(Uint8Array);
      expect(deviceKey1).toHaveLength(32);
      expect(deviceKey1).toEqual(deviceKey2); // Should be consistent
    });

    test("should encrypt with specific key", async () => {
      const data = "test data";
      const key = new Uint8Array(32).fill(5);

      const encrypted = await encryptionService.encryptWithKey(data, key);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(nacl.secretbox).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        expect.any(Uint8Array),
        key,
      );
    });
  });

  describe("Versioning and Backward Compatibility", () => {
    beforeEach(async () => {
      await encryptionService.initialize("test".repeat(8));
    });

    test("should handle version 1 format during decryption", async () => {
      const v1Data = JSON.stringify({
        v: 1,
        d: { legacy: "data" },
      });

      nacl.secretbox.open.mockReturnValue(new TextEncoder().encode(v1Data));

      const decrypted = await encryptionService.decryptData("encrypted");

      expect(decrypted).toEqual({ legacy: "data" });
    });

    test("should handle version 2 format during decryption", async () => {
      const v2Data = JSON.stringify({
        v: 2,
        c: false,
        d: { current: "data" },
      });

      nacl.secretbox.open.mockReturnValue(new TextEncoder().encode(v2Data));

      const decrypted = await encryptionService.decryptData("encrypted");

      expect(decrypted).toEqual({ current: "data" });
    });

    test("should handle unsupported version gracefully", async () => {
      const futureData = JSON.stringify({
        v: 999,
        d: { future: "data" },
      });

      nacl.secretbox.open.mockReturnValue(new TextEncoder().encode(futureData));

      // The service should handle unknown versions gracefully
      await expect(
        encryptionService.decryptData("encrypted"),
      ).resolves.toBeDefined(); // Or rejects, depending on implementation
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    beforeEach(async () => {
      await encryptionService.initialize("test".repeat(8));
    });

    test("should handle empty data", async () => {
      const emptyData = {};

      const encrypted = await encryptionService.encryptData(emptyData);
      expect(encrypted).toBeDefined();

      const jsonString = JSON.stringify({ v: 2, c: false, d: emptyData });
      nacl.secretbox.open.mockReturnValue(new TextEncoder().encode(jsonString));

      const decrypted = await encryptionService.decryptData(encrypted);
      expect(decrypted).toEqual(emptyData);
    });

    test("should handle large data objects", async () => {
      const largeData = {
        entries: Array(100)
          .fill(null)
          .map((_, i) => ({
            id: `entry-${i}`,
            content: "x".repeat(100),
          })),
      };

      await expect(
        encryptionService.encryptData(largeData),
      ).resolves.toBeDefined();
    });

    test("should handle Unicode data correctly", async () => {
      const unicodeData = {
        message: "Hello 世界 🌍",
        emoji: "😀🎉💯",
        symbols: "©®™",
      };

      const encrypted = await encryptionService.encryptData(unicodeData);
      expect(encrypted).toBeDefined();

      const jsonString = JSON.stringify({ v: 2, c: false, d: unicodeData });
      nacl.secretbox.open.mockReturnValue(new TextEncoder().encode(jsonString));

      const decrypted = await encryptionService.decryptData(encrypted);
      expect(decrypted).toEqual(unicodeData);
    });
  });
});
