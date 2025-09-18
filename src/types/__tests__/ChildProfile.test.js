/* eslint-disable */
import {
  Entry,
  CategoryConfig,
  QuickInfoConfig,
  ChildProfile,
  isEntry,
  isCategoryConfig,
  isChildProfile,
} from "../ChildProfile";

describe("ChildProfile types", () => {
  describe("exported objects", () => {
    test("should export empty type objects for compatibility", () => {
      expect(Entry).toEqual({});
      expect(CategoryConfig).toEqual({});
      expect(QuickInfoConfig).toEqual({});
      expect(ChildProfile).toEqual({});
    });

    test("should be objects", () => {
      expect(typeof Entry).toBe("object");
      expect(typeof CategoryConfig).toBe("object");
      expect(typeof QuickInfoConfig).toBe("object");
      expect(typeof ChildProfile).toBe("object");
    });
  });

  describe("isEntry validation", () => {
    test("should validate valid Entry objects", () => {
      const validEntry = {
        id: "entry-1",
        category: "medical",
        title: "Test Entry",
        description: "Test description",
        date: new Date(),
        visibility: ["private"],
      };

      expect(isEntry(validEntry)).toBe(true);
    });

    test("should validate minimal valid Entry objects", () => {
      const minimalEntry = {
        id: "entry-1",
        category: "medical",
      };

      expect(isEntry(minimalEntry)).toBe(true);
    });

    test("should reject invalid Entry objects", () => {
      expect(isEntry(null)).toBe(false);
      expect(isEntry(undefined)).toBe(false);
      expect(isEntry({})).toBe(false);
      expect(isEntry({ id: "entry-1" })).toBe(false); // Missing category
      expect(isEntry({ category: "medical" })).toBe(false); // Missing id
      expect(isEntry({ id: 123, category: "medical" })).toBe(false); // Wrong id type
      expect(isEntry({ id: "entry-1", category: 123 })).toBe(false); // Wrong category type
    });

    test("should handle edge cases", () => {
      expect(isEntry("")).toBe(false);
      expect(isEntry([])).toBe(false);
      expect(isEntry("string")).toBe(false);
      expect(isEntry(123)).toBe(false);
    });

    test("should work with extra properties", () => {
      const entryWithExtras = {
        id: "entry-1",
        category: "medical",
        title: "Test Entry",
        description: "Test description",
        date: new Date(),
        attachments: [],
        visibility: ["private"],
        extraProperty: "should not matter",
      };

      expect(isEntry(entryWithExtras)).toBe(true);
    });
  });

  describe("isCategoryConfig validation", () => {
    test("should validate valid CategoryConfig objects", () => {
      const validCategory = {
        id: "cat-1",
        name: "medical",
        displayName: "Medical",
        color: "#E76F51",
        order: 0,
        isVisible: true,
        isCustom: false,
      };

      expect(isCategoryConfig(validCategory)).toBe(true);
    });

    test("should validate minimal valid CategoryConfig objects", () => {
      const minimalCategory = {
        id: "cat-1",
        name: "medical",
      };

      expect(isCategoryConfig(minimalCategory)).toBe(true);
    });

    test("should reject invalid CategoryConfig objects", () => {
      expect(isCategoryConfig(null)).toBe(false);
      expect(isCategoryConfig(undefined)).toBe(false);
      expect(isCategoryConfig({})).toBe(false);
      expect(isCategoryConfig({ id: "cat-1" })).toBe(false); // Missing name
      expect(isCategoryConfig({ name: "medical" })).toBe(false); // Missing id
      expect(isCategoryConfig({ id: 123, name: "medical" })).toBe(false); // Wrong id type
      expect(isCategoryConfig({ id: "cat-1", name: 123 })).toBe(false); // Wrong name type
    });

    test("should handle edge cases", () => {
      expect(isCategoryConfig("")).toBe(false);
      expect(isCategoryConfig([])).toBe(false);
      expect(isCategoryConfig("string")).toBe(false);
      expect(isCategoryConfig(123)).toBe(false);
    });

    test("should work with extra properties", () => {
      const categoryWithExtras = {
        id: "cat-1",
        name: "medical",
        displayName: "Medical Records",
        icon: "medical",
        color: "#E76F51",
        order: 0,
        isVisible: true,
        isCustom: false,
        isQuickInfo: false,
        extraProperty: "should not matter",
      };

      expect(isCategoryConfig(categoryWithExtras)).toBe(true);
    });
  });

  describe("isChildProfile validation", () => {
    test("should validate valid ChildProfile objects", () => {
      const validProfile = {
        id: "profile-1",
        name: "Test Child",
        dateOfBirth: "2010-01-01",
        entries: [
          {
            id: "entry-1",
            category: "medical",
            title: "Test Entry",
            description: "Test description",
            date: new Date(),
          },
        ],
        categories: [
          {
            id: "cat-1",
            name: "medical",
            displayName: "Medical",
            color: "#E76F51",
            order: 0,
            isVisible: true,
            isCustom: false,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isChildProfile(validProfile)).toBe(true);
    });

    test("should validate minimal valid ChildProfile objects", () => {
      const minimalProfile = {
        id: "profile-1",
        name: "Test Child",
        entries: [],
      };

      expect(isChildProfile(minimalProfile)).toBe(true);
    });

    test("should reject invalid ChildProfile objects", () => {
      expect(isChildProfile(null)).toBe(false);
      expect(isChildProfile(undefined)).toBe(false);
      expect(isChildProfile({})).toBe(false);
      expect(isChildProfile({ id: "profile-1", name: "Test Child" })).toBe(
        false,
      ); // Missing entries
      expect(isChildProfile({ id: "profile-1", entries: [] })).toBe(false); // Missing name
      expect(isChildProfile({ name: "Test Child", entries: [] })).toBe(false); // Missing id
    });

    test("should require entries to be an array", () => {
      const profileWithInvalidEntries = {
        id: "profile-1",
        name: "Test Child",
        entries: "not an array",
      };

      expect(isChildProfile(profileWithInvalidEntries)).toBe(false);
    });

    test("should require correct types for id and name", () => {
      const profileWithWrongIdType = {
        id: 123,
        name: "Test Child",
        entries: [],
      };

      const profileWithWrongNameType = {
        id: "profile-1",
        name: 123,
        entries: [],
      };

      expect(isChildProfile(profileWithWrongIdType)).toBe(false);
      expect(isChildProfile(profileWithWrongNameType)).toBe(false);
    });

    test("should handle edge cases", () => {
      expect(isChildProfile("")).toBe(false);
      expect(isChildProfile([])).toBe(false);
      expect(isChildProfile("string")).toBe(false);
      expect(isChildProfile(123)).toBe(false);
    });

    test("should work with extra properties", () => {
      const profileWithExtras = {
        id: "profile-1",
        name: "Test Child",
        dateOfBirth: "2010-01-01",
        photo: "base64-photo-data",
        entries: [],
        categories: [],
        quickInfo: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        school: "Test School",
        teacher: "Ms. Smith",
        grade: "5th Grade",
        emergencyContact: "Parent - 555-1234",
        allergies: ["Peanuts", "Shellfish"],
        medications: ["Medication A"],
        diagnoses: ["Diagnosis A", "Diagnosis B"],
        therapists: ["Therapist A"],
        preferences: { theme: "light" },
        extraProperty: "should not matter",
      };

      expect(isChildProfile(profileWithExtras)).toBe(true);
    });

    test("should work with empty entries array", () => {
      const profileWithEmptyEntries = {
        id: "profile-1",
        name: "Test Child",
        entries: [],
      };

      expect(isChildProfile(profileWithEmptyEntries)).toBe(true);
    });

    test("should work with populated entries array", () => {
      const profileWithEntries = {
        id: "profile-1",
        name: "Test Child",
        entries: [
          {
            id: "entry-1",
            category: "medical",
            title: "Entry 1",
            description: "Desc 1",
          },
          {
            id: "entry-2",
            category: "education",
            title: "Entry 2",
            description: "Desc 2",
          },
        ],
      };

      expect(isChildProfile(profileWithEntries)).toBe(true);
    });
  });

  describe("type validation integration", () => {
    test("should validate complete data structure", () => {
      const entry = {
        id: "entry-1",
        category: "medical",
        title: "Medical Entry",
        description: "A medical record entry",
        date: new Date(),
        attachments: [],
        visibility: ["family", "medical"],
      };

      const category = {
        id: "cat-medical",
        name: "medical",
        displayName: "Medical Records",
        icon: "medical-bag",
        color: "#E76F51",
        order: 0,
        isVisible: true,
        isCustom: false,
        isQuickInfo: false,
      };

      const profile = {
        id: "profile-1",
        name: "John Doe",
        dateOfBirth: "2010-05-15",
        photo: "photo-data",
        entries: [entry],
        categories: [category],
        quickInfo: [],
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date(),
        school: "Elementary School",
        teacher: "Ms. Johnson",
        grade: "5th",
        emergencyContact: "Jane Doe - 555-0123",
        allergies: ["Peanuts"],
        medications: ["Inhaler"],
        diagnoses: ["Asthma"],
        therapists: ["Dr. Smith"],
        preferences: { notifications: true },
      };

      expect(isEntry(entry)).toBe(true);
      expect(isCategoryConfig(category)).toBe(true);
      expect(isChildProfile(profile)).toBe(true);
    });

    test("should handle circular references gracefully", () => {
      const circularObj = { id: "test", name: "test" };
      circularObj.self = circularObj;

      // Should not throw errors
      expect(() => isEntry(circularObj)).not.toThrow();
      expect(() => isCategoryConfig(circularObj)).not.toThrow();
      expect(() => isChildProfile(circularObj)).not.toThrow();
    });

    test("should handle deeply nested objects", () => {
      const deepObj = {
        id: "deep",
        name: "deep",
        entries: [],
        level1: {
          level2: {
            level3: {
              level4: {
                deeply: "nested",
              },
            },
          },
        },
      };

      expect(isChildProfile(deepObj)).toBe(true);
    });

    test("should validate array properties correctly", () => {
      const entryWithArrays = {
        id: "entry-with-arrays",
        category: "medical",
        attachments: ["file1.pdf", "file2.jpg"],
        visibility: ["family", "medical"],
      };

      const profileWithArrays = {
        id: "profile-with-arrays",
        name: "Child with Arrays",
        entries: [entryWithArrays],
        allergies: ["Peanuts", "Eggs", "Milk"],
        medications: ["Med1", "Med2"],
        diagnoses: ["Diagnosis1"],
        therapists: [],
      };

      expect(isEntry(entryWithArrays)).toBe(true);
      expect(isChildProfile(profileWithArrays)).toBe(true);
    });
  });
});
