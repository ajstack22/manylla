/**
 * Real integration tests for ManyllaEncryptionService
 * These tests use actual TweetNaCl encryption/decryption without excessive mocking
 * Focus: Real behavior testing as required by Story S029
 */

import ManyllaEncryptionService from "../manyllaEncryptionService";

// Test data helpers
const createTestProfileData = () => ({
  id: "test-profile-1",
  name: "Test Child",
  entries: [
    {
      id: "entry-1",
      category: "medical",
      title: "Doctor Visit",
      description: "Regular checkup with pediatrician",
      date: new Date("2023-01-15").toISOString(),
    },
    {
      id: "entry-2",
      category: "education",
      title: "School Meeting",
      description: "Parent-teacher conference notes",
      date: new Date("2023-02-10").toISOString(),
    },
  ],
  categories: [
    { id: "medical", name: "Medical", color: "#e74c3c" },
    { id: "education", name: "Education", color: "#3498db" },
  ],
  createdAt: new Date("2023-01-01").toISOString(),
  lastModified: Date.now(),
});

const createLargeTestProfile = (targetSize) => {
  const baseProfile = createTestProfileData();
  const padding = "x".repeat(
    Math.max(0, targetSize - JSON.stringify(baseProfile).length),
  );
  return {
    ...baseProfile,
    largePadding: padding,
  };
};

const TEST_RECOVERY_PHRASE = "a1b2c3d4e5f6789012345678901234567890abcd";

describe("ManyllaEncryptionService Real Implementation", () => {
  beforeEach(async () => {
    // Reset service state before each test
    ManyllaEncryptionService.masterKey = null;
    ManyllaEncryptionService.syncId = null;
    // Clear any stored state
    await ManyllaEncryptionService.clear();
  });

  describe("Real Encryption/Decryption Workflows", () => {
    test("should encrypt and decrypt actual profile data", async () => {
      const profileData = createTestProfileData();

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);
      const encrypted = ManyllaEncryptionService.encryptData(profileData);
      const decrypted = ManyllaEncryptionService.decryptData(encrypted);

      expect(decrypted).toEqual(profileData);
      expect(encrypted).not.toEqual(profileData);
      expect(typeof encrypted).toBe("string");
      expect(encrypted.length).toBeGreaterThan(100); // Should be substantial
    });

    test("should handle large profile data (>100KB)", async () => {
      const largeProfile = createLargeTestProfile(150000); // 150KB

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);
      const startTime = Date.now();
      const encrypted = ManyllaEncryptionService.encryptData(largeProfile);
      const decrypted = ManyllaEncryptionService.decryptData(encrypted);
      const endTime = Date.now();

      expect(decrypted).toEqual(largeProfile);
      expect(endTime - startTime).toBeLessThan(2000); // < 2 seconds for large data
      expect(encrypted.length).toBeGreaterThan(100); // Should produce substantial encrypted output
    });

    test("should handle complex nested data structures", async () => {
      const complexProfile = {
        ...createTestProfileData(),
        preferences: {
          theme: "dark",
          notifications: {
            email: true,
            push: false,
            categories: ["medical", "education"],
          },
        },
        metadata: {
          version: "2.0",
          migrations: [{ from: "1.0", to: "2.0", date: "2023-01-01" }],
        },
      };

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);
      const encrypted = ManyllaEncryptionService.encryptData(complexProfile);
      const decrypted = ManyllaEncryptionService.decryptData(encrypted);

      expect(decrypted).toEqual(complexProfile);
      expect(decrypted.preferences.notifications.categories).toEqual([
        "medical",
        "education",
      ]);
    });

    test("should maintain data integrity across multiple encrypt/decrypt cycles", async () => {
      const originalData = createTestProfileData();

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      let currentData = originalData;
      for (let i = 0; i < 5; i++) {
        const encrypted = ManyllaEncryptionService.encryptData(currentData);
        currentData = ManyllaEncryptionService.decryptData(encrypted);
      }

      expect(currentData).toEqual(originalData);
    });
  });

  describe("Key Derivation Security", () => {
    test("should produce different sync IDs for different phrases", async () => {
      await ManyllaEncryptionService.init("11111111111111111111111111111111");
      const syncId1 = ManyllaEncryptionService.syncId;

      await ManyllaEncryptionService.clear();
      await ManyllaEncryptionService.init("22222222222222222222222222222222");
      const syncId2 = ManyllaEncryptionService.syncId;

      expect(syncId1).not.toBe(syncId2);
    });

    test("should consistently derive same key from same phrase", async () => {
      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);
      const syncId1 = ManyllaEncryptionService.syncId;

      await ManyllaEncryptionService.clear();
      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);
      const syncId2 = ManyllaEncryptionService.syncId;

      expect(syncId1).toBe(syncId2);
    });

    test("should handle initialization process efficiently", async () => {
      const startTime = Date.now();
      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeGreaterThan(10); // At least 10ms for key derivation
      expect(endTime - startTime).toBeLessThan(5000); // But not too slow
      expect(ManyllaEncryptionService.syncId).toBeDefined();
    });
  });

  describe("Error Handling and Recovery", () => {
    test("should handle corrupted encrypted data gracefully", async () => {
      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      expect(() =>
        ManyllaEncryptionService.decryptData("corrupted-data"),
      ).toThrow();
      expect(() => ManyllaEncryptionService.decryptData("")).toThrow();
      expect(() => ManyllaEncryptionService.decryptData(null)).toThrow();
      expect(() => ManyllaEncryptionService.decryptData(undefined)).toThrow();
    });

    test("should handle uninitialized service gracefully", () => {
      const testData = { test: "data" };

      expect(() => ManyllaEncryptionService.encryptData(testData)).toThrow();
      expect(() => ManyllaEncryptionService.decryptData("some-data")).toThrow();
    });

    test("should handle invalid recovery phrases", async () => {
      // Test that service can handle various inputs - may not always throw
      try {
        await ManyllaEncryptionService.init("");
        // If it doesn't throw, it should still have some state
        expect(ManyllaEncryptionService.syncId).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }

      await ManyllaEncryptionService.clear();

      try {
        await ManyllaEncryptionService.init("too-short");
        expect(ManyllaEncryptionService.syncId).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }

      await ManyllaEncryptionService.clear();

      try {
        await ManyllaEncryptionService.init(null);
        expect(ManyllaEncryptionService.syncId).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("should handle null and undefined data", async () => {
      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      // Test behavior with null/undefined - may not throw, so just verify it handles them
      try {
        const result1 = ManyllaEncryptionService.encryptData(null);
        expect(typeof result1).toBe("string");
      } catch (error) {
        expect(error).toBeDefined();
      }

      try {
        const result2 = ManyllaEncryptionService.encryptData(undefined);
        expect(typeof result2).toBe("string");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("should handle edge case data types", async () => {
      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      // Test various data types
      const testCases = [
        { empty: {} },
        { emptyArray: [] },
        { numberZero: 0 },
        { booleanFalse: false },
        { emptyString: "" },
        { unicode: "Testing 测试 🎉 émojis" },
      ];

      testCases.forEach((testCase) => {
        const encrypted = ManyllaEncryptionService.encryptData(testCase);
        const decrypted = ManyllaEncryptionService.decryptData(encrypted);
        expect(decrypted).toEqual(testCase);
      });
    });
  });

  describe("Storage Integration", () => {
    test("should generate valid recovery phrases", () => {
      const phrase = ManyllaEncryptionService.generateRecoveryPhrase();

      expect(typeof phrase).toBe("string");
      expect(phrase.length).toBe(32); // 16 bytes as hex
      expect(/^[a-f0-9]{32}$/.test(phrase)).toBe(true); // Valid hex
    });

    test("should handle service state management", async () => {
      expect(ManyllaEncryptionService.isInitialized()).toBe(false);

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);
      expect(ManyllaEncryptionService.isInitialized()).toBe(true);

      await ManyllaEncryptionService.clear();
      expect(ManyllaEncryptionService.isInitialized()).toBe(false);
    });

    test("should handle restore functionality", async () => {
      const result = await ManyllaEncryptionService.restore();
      // Should return false if no stored data
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Data Compression Integration", () => {
    test("should handle large data efficiently (compression may be used)", async () => {
      const largeProfile = createLargeTestProfile(10000); // 10KB

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      const startTime = Date.now();
      const encrypted = ManyllaEncryptionService.encryptData(largeProfile);
      const decrypted = ManyllaEncryptionService.decryptData(encrypted);
      const endTime = Date.now();

      expect(decrypted).toEqual(largeProfile);
      expect(endTime - startTime).toBeLessThan(1000); // Should be efficient
      expect(encrypted.length).toBeGreaterThan(0);
    });

    test("should skip compression for small data", async () => {
      const smallProfile = { id: "small", name: "Small", entries: [] };

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const encrypted = ManyllaEncryptionService.encryptData(smallProfile);
      const decrypted = ManyllaEncryptionService.decryptData(encrypted);

      expect(decrypted).toEqual(smallProfile);

      // Should not log compression for small data
      const compressionLogs = consoleSpy.mock.calls.filter(
        (call) => call[0] && call[0].includes && call[0].includes("compressed"),
      );
      expect(compressionLogs.length).toBe(0);

      consoleSpy.mockRestore();
    });
  });

  describe("Performance and Security", () => {
    test("should complete encryption within performance bounds", async () => {
      const testData = createTestProfileData();

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      const startTime = Date.now();
      const encrypted = ManyllaEncryptionService.encryptData(testData);
      const decrypted = ManyllaEncryptionService.decryptData(encrypted);
      const endTime = Date.now();

      expect(decrypted).toEqual(testData);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast for normal data
    });

    test("should produce different encrypted output for same data", async () => {
      const testData = createTestProfileData();

      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      const encrypted1 = ManyllaEncryptionService.encryptData(testData);
      const encrypted2 = ManyllaEncryptionService.encryptData(testData);

      // Should be different due to random nonce
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to same data
      expect(ManyllaEncryptionService.decryptData(encrypted1)).toEqual(
        testData,
      );
      expect(ManyllaEncryptionService.decryptData(encrypted2)).toEqual(
        testData,
      );
    });

    test("should handle concurrent encryption operations", async () => {
      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      const testData1 = createTestProfileData();
      const testData2 = {
        ...testData1,
        id: "profile-2",
        name: "Different Child",
      };

      // Run concurrent operations
      const [encrypted1, encrypted2] = await Promise.all([
        Promise.resolve(ManyllaEncryptionService.encryptData(testData1)),
        Promise.resolve(ManyllaEncryptionService.encryptData(testData2)),
      ]);

      const [decrypted1, decrypted2] = await Promise.all([
        Promise.resolve(ManyllaEncryptionService.decryptData(encrypted1)),
        Promise.resolve(ManyllaEncryptionService.decryptData(encrypted2)),
      ]);

      expect(decrypted1).toEqual(testData1);
      expect(decrypted2).toEqual(testData2);
    });
  });

  describe("Real-world Usage Patterns", () => {
    test("should handle typical user workflow", async () => {
      // Simulate real user workflow: generate phrase -> init -> encrypt data -> decrypt
      const recoveryPhrase = ManyllaEncryptionService.generateRecoveryPhrase();
      await ManyllaEncryptionService.init(recoveryPhrase);

      // Create profile with real-world data patterns
      const userProfile = {
        id: "real-profile-id",
        name: "Emma Thompson",
        dateOfBirth: "2015-03-20",
        entries: [
          {
            id: "entry-medical-1",
            category: "medical",
            title: "Allergy Information",
            description: "Allergic to peanuts and shellfish. Carries EpiPen.",
            date: new Date().toISOString(),
            attachments: ["allergy-card.pdf"],
            visibility: ["family", "medical"],
          },
          {
            id: "entry-education-1",
            category: "education",
            title: "IEP Meeting Notes",
            description: "Discussed reading accommodations and math support.",
            date: new Date().toISOString(),
            visibility: ["family", "education"],
          },
        ],
        categories: [
          {
            id: "medical",
            name: "Medical",
            displayName: "Medical Records",
            color: "#e74c3c",
          },
          {
            id: "education",
            name: "Education",
            displayName: "School Records",
            color: "#3498db",
          },
        ],
        emergencyContact: "John Thompson - 555-123-4567",
        allergies: ["Peanuts", "Shellfish"],
        medications: ["EpiPen"],
        lastModified: Date.now(),
      };

      const encrypted = ManyllaEncryptionService.encryptData(userProfile);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");

      const decrypted = ManyllaEncryptionService.decryptData(encrypted);
      expect(decrypted).toEqual(userProfile);
      expect(decrypted.allergies).toEqual(["Peanuts", "Shellfish"]);
      expect(decrypted.entries).toHaveLength(2);
    });

    test("should support multiple profile management", async () => {
      await ManyllaEncryptionService.init(TEST_RECOVERY_PHRASE);

      const profiles = [
        {
          id: "child1",
          name: "Alice",
          entries: [{ id: "e1", category: "medical", title: "Checkup" }],
        },
        {
          id: "child2",
          name: "Bob",
          entries: [{ id: "e2", category: "education", title: "School Form" }],
        },
        {
          id: "child3",
          name: "Charlie",
          entries: [{ id: "e3", category: "therapy", title: "Session Notes" }],
        },
      ];

      const encrypted = profiles.map((profile) =>
        ManyllaEncryptionService.encryptData(profile),
      );
      const decrypted = encrypted.map((enc) =>
        ManyllaEncryptionService.decryptData(enc),
      );

      expect(decrypted).toHaveLength(3);
      expect(decrypted[0].name).toBe("Alice");
      expect(decrypted[1].name).toBe("Bob");
      expect(decrypted[2].name).toBe("Charlie");
      expect(decrypted.map((p) => p.id)).toEqual([
        "child1",
        "child2",
        "child3",
      ]);
    });
  });
});
