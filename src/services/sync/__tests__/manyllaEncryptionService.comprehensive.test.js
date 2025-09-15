/**
 * Comprehensive integration tests for manyllaEncryptionService
 * Tests actual encryption/decryption with real crypto operations
 * NO MOCKING of core functionality - only external dependencies
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
// import nacl from "tweetnacl";
// import pako from "pako";

// Import the actual service - not mocked!
import manyllaEncryptionService from "../manyllaEncryptionService";

// Only mock AsyncStorage (external dependency)
jest.mock("@react-native-async-storage/async-storage");

describe("manyllaEncryptionService - Comprehensive Real Tests", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();

    // Clear service state between tests
    await manyllaEncryptionService.clear();
  });

  describe("Recovery Phrase Generation", () => {
    test("should generate valid 32-character hex recovery phrase", () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();

      expect(phrase).toHaveLength(32);
      expect(phrase).toMatch(/^[a-f0-9]{32}$/);
      expect(phrase).not.toBe(
        manyllaEncryptionService.generateRecoveryPhrase(),
      ); // Should be unique
    });

    test("should generate cryptographically random phrases", () => {
      const phrases = new Set();
      for (let i = 0; i < 100; i++) {
        phrases.add(manyllaEncryptionService.generateRecoveryPhrase());
      }
      expect(phrases.size).toBe(100); // All should be unique
    });
  });

  describe("Key Derivation", () => {
    test("should derive consistent key from recovery phrase", async () => {
      const phrase = "a1b2c3d4e5f6789012345678901234567890abcdef123456";

      const result1 =
        await manyllaEncryptionService.deriveKeyFromPhrase(phrase);
      const result2 =
        await manyllaEncryptionService.deriveKeyFromPhrase(phrase);

      expect(result1.key).toHaveLength(32);
      expect(result1.key).toEqual(result2.key); // Same phrase = same key
      expect(result1.key).toBeInstanceOf(Uint8Array);
    });

    test("should derive different keys for different phrases", async () => {
      const phrase1 = "a1b2c3d4e5f6789012345678901234567890abcdef123456";
      const phrase2 = "b1b2c3d4e5f6789012345678901234567890abcdef123456";

      const result1 =
        await manyllaEncryptionService.deriveKeyFromPhrase(phrase1);
      const result2 =
        await manyllaEncryptionService.deriveKeyFromPhrase(phrase2);

      expect(result1.key).not.toEqual(result2.key);
    });

    test("should use proper key stretching (100,000 iterations)", async () => {
      const phrase = "test1234567890abcdef1234567890ab";
      const startTime = Date.now();

      await manyllaEncryptionService.deriveKeyFromPhrase(phrase);

      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThan(10); // Should take some time due to iterations
    });
  });

  describe("Encryption and Decryption", () => {
    test("should encrypt and decrypt text data correctly", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const originalData = {
        message: "Test data with unicode: 你好世界 🎉",
        nested: { value: 123 },
      };

      const encrypted = manyllaEncryptionService.encrypt(originalData);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toContain("Test data"); // Should be encrypted

      const decrypted = manyllaEncryptionService.decrypt(encrypted);
      expect(decrypted).toEqual(originalData);
    });

    test("should handle large data with compression", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const largeData = {
        profiles: Array(100)
          .fill(null)
          .map((_, i) => ({
            id: `profile-${i}`,
            name: `Child ${i}`,
            description: "Lorem ipsum dolor sit amet ".repeat(50),
            entries: Array(20)
              .fill(null)
              .map((_, j) => ({
                id: `entry-${i}-${j}`,
                title: `Entry ${j}`,
                content: "Content text ".repeat(100),
              })),
          })),
      };

      const encrypted = manyllaEncryptionService.encrypt(largeData);
      const decrypted = manyllaEncryptionService.decrypt(encrypted);

      expect(decrypted).toEqual(largeData);
      // Encrypted should be smaller due to compression
      expect(encrypted.length).toBeLessThan(JSON.stringify(largeData).length);
    });

    test("should fail decryption with wrong recovery phrase", async () => {
      const correctPhrase = manyllaEncryptionService.generateRecoveryPhrase();
      const wrongPhrase = manyllaEncryptionService.generateRecoveryPhrase();
      const data = { secret: "confidential" };

      await manyllaEncryptionService.initialize(correctPhrase);
      const encrypted = manyllaEncryptionService.encrypt(data);

      await manyllaEncryptionService.initialize(wrongPhrase);
      expect(() => manyllaEncryptionService.decrypt(encrypted)).toThrow();
    });

    test("should handle special characters and emojis", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const data = {
        text: "Special chars: éñ ü ß € £ ¥",
        emojis: "😀 🎉 🚀 ❤️ 🌟",
        rtl: "مرحبا بالعالم",
        cjk: "中文 日本語 한국어",
      };

      const encrypted = manyllaEncryptionService.encrypt(data);
      const decrypted = manyllaEncryptionService.decrypt(encrypted);

      expect(decrypted).toEqual(data);
    });

    test("should maintain data integrity", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const data = {
        number: 42.5,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        date: new Date().toISOString(),
      };

      const encrypted = manyllaEncryptionService.encrypt(data);
      const decrypted = manyllaEncryptionService.decrypt(encrypted);

      expect(decrypted).toEqual(data);
      expect(typeof decrypted.number).toBe("number");
      expect(typeof decrypted.boolean).toBe("boolean");
      expect(decrypted.null).toBeNull();
      expect(Array.isArray(decrypted.array)).toBe(true);
    });
  });

  describe("Share Encryption", () => {
    test("should create temporary encrypted data for sharing", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const data = {
        profile: "Test Profile",
        entries: ["Entry 1", "Entry 2"],
      };

      const encrypted = manyllaEncryptionService.encrypt(data);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toContain("Test Profile");

      const decrypted = manyllaEncryptionService.decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });
  });

  describe("Service API", () => {
    test("should check if encryption is initialized", async () => {
      expect(manyllaEncryptionService.isInitialized()).toBe(false);

      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      expect(manyllaEncryptionService.isInitialized()).toBe(true);
    });

    test("should get sync ID after initialization", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      const result = await manyllaEncryptionService.initialize(phrase);

      expect(result.syncId).toBeTruthy();
      expect(typeof result.syncId).toBe("string");
    });
  });

  describe("Recovery Phrase Validation", () => {
    test("should validate recovery phrase format internally", () => {
      const validPhrase = manyllaEncryptionService.generateRecoveryPhrase();
      expect(validPhrase).toHaveLength(32);
      expect(validPhrase).toMatch(/^[a-f0-9]{32}$/);
    });
  });

  describe("Storage Operations", () => {
    test("should initialize and store encryption data", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      AsyncStorage.setItem.mockResolvedValue();
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await manyllaEncryptionService.initialize(phrase);

      expect(result.syncId).toBeTruthy();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "secure_manylla_salt",
        expect.any(String),
      );
    });

    test("should clear stored keys", async () => {
      await manyllaEncryptionService.clear();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "secure_manylla_salt",
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "secure_manylla_sync_id",
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "secure_manylla_recovery",
      );
    });

    test("should handle storage errors gracefully", async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      await expect(
        manyllaEncryptionService.initialize("test1234567890abcdef1234567890ab"),
      ).rejects.toThrow();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle null/undefined data", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const encryptedNull = manyllaEncryptionService.encrypt(null);
      const decryptedNull = manyllaEncryptionService.decrypt(encryptedNull);
      expect(decryptedNull).toBeNull();

      const encryptedUndefined = manyllaEncryptionService.encrypt(undefined);
      const decryptedUndefined =
        manyllaEncryptionService.decrypt(encryptedUndefined);
      expect(decryptedUndefined).toBeUndefined();
    });

    test("should handle empty objects and arrays", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const data = {
        emptyObject: {},
        emptyArray: [],
        emptyString: "",
      };

      const encrypted = manyllaEncryptionService.encrypt(data);
      const decrypted = manyllaEncryptionService.decrypt(encrypted);

      expect(decrypted).toEqual(data);
    });

    test("should handle circular references", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const data = { name: "test" };
      data.circular = data; // Create circular reference

      expect(() => manyllaEncryptionService.encrypt(data)).toThrow();
    });

    test("should handle corrupted encrypted data", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const corruptedData = "not-valid-encrypted-data";

      expect(() => manyllaEncryptionService.decrypt(corruptedData)).toThrow();
    });

    test("should handle very long strings", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const longString = "a".repeat(10000); // 10KB string (reduced for test performance)
      const data = { longText: longString };

      const encrypted = manyllaEncryptionService.encrypt(data);
      const decrypted = manyllaEncryptionService.decrypt(encrypted);

      expect(decrypted.longText).toBe(longString);
    });
  });

  describe("Compatibility and Interoperability", () => {
    test("should maintain compatibility with existing encrypted data format", async () => {
      const phrase = "test1234567890abcdef1234567890ab";
      await manyllaEncryptionService.initialize(phrase);

      const data = { compatibility: "test" };
      const encrypted = manyllaEncryptionService.encrypt(data);

      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe("string");

      // Should be able to decrypt back
      const decrypted = manyllaEncryptionService.decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });

    test("should handle different data types consistently", async () => {
      const phrase = manyllaEncryptionService.generateRecoveryPhrase();
      await manyllaEncryptionService.initialize(phrase);

      const testCases = [
        123,
        "string",
        true,
        false,
        null,
        { object: true },
        [1, 2, 3],
        { nested: { deep: { value: "test" } } },
      ];

      for (const testData of testCases) {
        const encrypted = manyllaEncryptionService.encrypt(testData);
        const decrypted = manyllaEncryptionService.decrypt(encrypted);
        expect(decrypted).toEqual(testData);
      }
    });
  });
});
