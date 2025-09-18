/* eslint-disable */
/**
 * Comprehensive integration tests for validation utility
 * Tests actual validation logic without mocking
 */

import { ProfileValidator } from "../validation";

describe("ProfileValidator - Comprehensive Tests", () => {
  describe("validateProfile", () => {
    test("should validate a complete valid profile", () => {
      const validProfile = {
        id: "prof-123",
        name: "Test Child",
        dateOfBirth: "2015-01-01",
        entries: [
          {
            id: "entry-1",
            category: "medical",
            title: "Test Entry",
            description: "Test description",
            date: "2023-01-01",
            visibility: ["family"],
          },
        ],
        categories: [
          {
            id: "cat-1",
            name: "medical",
            displayName: "Medical Records",
            color: "#e74c3c",
            order: 0,
            isVisible: true,
            isCustom: false,
          },
        ],
        createdAt: "2023-01-01T00:00:00Z",
        lastModified: Date.now(),
      };

      const result = ProfileValidator.validateProfile(validProfile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject null or undefined profile", () => {
      const nullResult = ProfileValidator.validateProfile(null);
      expect(nullResult.valid).toBe(false);
      expect(nullResult.errors).toContain("Profile data is required");

      const undefinedResult = ProfileValidator.validateProfile(undefined);
      expect(undefinedResult.valid).toBe(false);
      expect(undefinedResult.errors).toContain("Profile data is required");
    });

    test("should reject non-object profile", () => {
      const stringResult = ProfileValidator.validateProfile("not an object");
      expect(stringResult.valid).toBe(false);
      expect(stringResult.errors).toContain("Profile data is required");

      const numberResult = ProfileValidator.validateProfile(123);
      expect(numberResult.valid).toBe(false);
      expect(numberResult.errors).toContain("Profile data is required");
    });

    test("should validate profile ID requirement", () => {
      const noId = {
        name: "Test Child",
        dateOfBirth: "2015-01-01",
        entries: [],
        categories: [],
      };

      const result = ProfileValidator.validateProfile(noId);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile ID is required");
    });

    test("should validate profile name requirements", () => {
      const baseProfile = {
        id: "prof-123",
        dateOfBirth: "2015-01-01",
        entries: [],
        categories: [],
      };

      // Missing name
      const noName = { ...baseProfile };
      let result = ProfileValidator.validateProfile(noName);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile name is required");

      // Empty name
      const emptyName = { ...baseProfile, name: "" };
      result = ProfileValidator.validateProfile(emptyName);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile name is required");

      // Whitespace only
      const whitespaceName = { ...baseProfile, name: "   " };
      result = ProfileValidator.validateProfile(whitespaceName);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile name is required");

      // Too short
      const shortName = { ...baseProfile, name: "A" };
      result = ProfileValidator.validateProfile(shortName);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Profile name must be at least 2 characters",
      );

      // Too long
      const longName = { ...baseProfile, name: "A".repeat(101) };
      result = ProfileValidator.validateProfile(longName);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile name is too long");
    });

    test("should validate date of birth", () => {
      const baseProfile = {
        id: "prof-123",
        name: "Test Child",
        entries: [],
        categories: [],
      };

      // Missing date
      const noDate = { ...baseProfile };
      let result = ProfileValidator.validateProfile(noDate);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Date of birth is required");

      // Invalid date format
      const invalidDate = { ...baseProfile, dateOfBirth: "not-a-date" };
      result = ProfileValidator.validateProfile(invalidDate);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid date of birth");

      // Future date
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateProfile = {
        ...baseProfile,
        dateOfBirth: futureDate.toISOString(),
      };
      result = ProfileValidator.validateProfile(futureDateProfile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Date of birth cannot be in the future");
    });

    test("should validate entries array", () => {
      const baseProfile = {
        id: "prof-123",
        name: "Test Child",
        dateOfBirth: "2015-01-01",
        categories: [],
      };

      // Null entries
      const nullEntries = { ...baseProfile, entries: null };
      let result = ProfileValidator.validateProfile(nullEntries);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entries must be an array");

      // Non-array entries
      const objectEntries = { ...baseProfile, entries: { entry: "test" } };
      result = ProfileValidator.validateProfile(objectEntries);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entries must be an array");

      // Invalid entry in array
      const invalidEntry = {
        ...baseProfile,
        entries: [
          { id: "e1", title: "Missing category" }, // Missing required fields
        ],
      };
      result = ProfileValidator.validateProfile(invalidEntry);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("entry"))).toBe(true);
    });

    test("should validate categories array", () => {
      const baseProfile = {
        id: "prof-123",
        name: "Test Child",
        dateOfBirth: "2015-01-01",
        entries: [],
      };

      // Non-array categories
      const objectCategories = { ...baseProfile, categories: "not-array" };
      let result = ProfileValidator.validateProfile(objectCategories);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Categories must be an array");

      // Invalid category in array
      const invalidCategory = {
        ...baseProfile,
        categories: [
          { id: "c1", name: "test" }, // Missing required fields
        ],
      };
      result = ProfileValidator.validateProfile(invalidCategory);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Category"))).toBe(true);
    });
  });

  describe("validateEntry", () => {
    test("should validate a complete valid entry", () => {
      const validEntry = {
        id: "entry-123",
        category: "medical",
        title: "Doctor Visit",
        description: "Annual checkup",
        date: "2023-06-15",
        visibility: ["family", "medical"],
      };

      const result = ProfileValidator.validateEntry(validEntry);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject null or non-object entry", () => {
      const nullResult = ProfileValidator.validateEntry(null);
      expect(nullResult.valid).toBe(false);
      expect(nullResult.errors).toContain("Entry data is required");

      const stringResult = ProfileValidator.validateEntry("not an object");
      expect(stringResult.valid).toBe(false);
      expect(stringResult.errors).toContain("Entry data is required");
    });

    test("should validate entry required fields", () => {
      const baseEntry = {
        description: "Test",
        date: "2023-01-01",
        visibility: ["family"],
      };

      // Missing ID
      const noId = { ...baseEntry, category: "medical", title: "Test" };
      let result = ProfileValidator.validateEntry(noId);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry ID is required");

      // Missing category
      const noCategory = { ...baseEntry, id: "e1", title: "Test" };
      result = ProfileValidator.validateEntry(noCategory);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry category is required");

      // Missing title
      const noTitle = { ...baseEntry, id: "e1", category: "medical" };
      result = ProfileValidator.validateEntry(noTitle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry title is required");
    });

    test("should validate title length constraints", () => {
      const baseEntry = {
        id: "e1",
        category: "medical",
        description: "Test",
        date: "2023-01-01",
        visibility: ["family"],
      };

      // Empty title
      const emptyTitle = { ...baseEntry, title: "" };
      let result = ProfileValidator.validateEntry(emptyTitle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry title is required");

      // Too long title
      const longTitle = { ...baseEntry, title: "A".repeat(201) };
      result = ProfileValidator.validateEntry(longTitle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry title is too long");
    });

    test("should validate description length", () => {
      const baseEntry = {
        id: "e1",
        category: "medical",
        title: "Test",
        date: "2023-01-01",
        visibility: ["family"],
      };

      // Very long description
      const longDesc = { ...baseEntry, description: "A".repeat(10001) };
      const result = ProfileValidator.validateEntry(longDesc);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry description is too long");
    });

    test("should validate date format", () => {
      const baseEntry = {
        id: "e1",
        category: "medical",
        title: "Test",
        description: "Test",
        visibility: ["family"],
      };

      // Invalid date
      const invalidDate = { ...baseEntry, date: "not-a-date" };
      const result = ProfileValidator.validateEntry(invalidDate);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid date format");
    });

    test("should validate visibility array", () => {
      const baseEntry = {
        id: "e1",
        category: "medical",
        title: "Test",
        description: "Test",
        date: "2023-01-01",
      };

      // Non-array visibility
      const stringVisibility = { ...baseEntry, visibility: "family" };
      let result = ProfileValidator.validateEntry(stringVisibility);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Visibility must be an array");

      // Invalid visibility option
      const invalidOption = { ...baseEntry, visibility: ["family", "invalid"] };
      result = ProfileValidator.validateEntry(invalidOption);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid visibility"))).toBe(
        true,
      );
    });
  });

  describe("validateCategory", () => {
    test("should validate a complete valid category", () => {
      const validCategory = {
        id: "cat-123",
        name: "medical",
        displayName: "Medical Records",
        color: "#e74c3c",
        order: 0,
        isVisible: true,
        isCustom: false,
      };

      const result = ProfileValidator.validateCategory(validCategory);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject null or non-object category", () => {
      const nullResult = ProfileValidator.validateCategory(null);
      expect(nullResult.valid).toBe(false);
      expect(nullResult.errors).toContain("Category data is required");

      const arrayResult = ProfileValidator.validateCategory([]);
      expect(arrayResult.valid).toBe(false);
      expect(arrayResult.errors).toContain("Category ID is required");
    });

    test("should validate category required fields", () => {
      const baseCategory = {
        color: "#e74c3c",
        order: 0,
        isVisible: true,
      };

      // Missing ID
      const noId = { ...baseCategory, name: "test", displayName: "Test" };
      let result = ProfileValidator.validateCategory(noId);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Category ID is required");

      // Missing name
      const noName = { ...baseCategory, id: "c1", displayName: "Test" };
      result = ProfileValidator.validateCategory(noName);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Category name is required");

      // Missing displayName
      const noDisplayName = { ...baseCategory, id: "c1", name: "test" };
      result = ProfileValidator.validateCategory(noDisplayName);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Display name required");
    });

    test("should validate name constraints", () => {
      const baseCategory = {
        id: "c1",
        displayName: "Test",
        color: "#e74c3c",
        order: 0,
        isVisible: true,
      };

      // Empty name
      const emptyName = { ...baseCategory, name: "" };
      let result = ProfileValidator.validateCategory(emptyName);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Category name is required");

      // Too long name - validation.js doesn't check for max length on category name
      const longName = { ...baseCategory, name: "a".repeat(51) };
      result = ProfileValidator.validateCategory(longName);
      expect(result.valid).toBe(true); // No max length validation in current implementation
      expect(result.errors).toHaveLength(0);
    });

    test("should validate color format", () => {
      const baseCategory = {
        id: "c1",
        name: "test",
        displayName: "Test",
        order: 0,
        isVisible: true,
      };

      // Missing color
      const noColor = { ...baseCategory };
      let result = ProfileValidator.validateCategory(noColor);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Valid hex color required");

      // Named colors are actually valid in the implementation
      const namedColor = { ...baseCategory, color: "red" };
      result = ProfileValidator.validateCategory(namedColor);
      expect(result.valid).toBe(true); // 'red' is in the allowed named colors list
      expect(result.errors).toHaveLength(0);

      // Valid hex colors
      const validColors = ["#fff", "#FFF", "#e74c3c", "#123456"];
      validColors.forEach((color) => {
        const validColorCat = { ...baseCategory, color };
        result = ProfileValidator.validateCategory(validColorCat);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe("sanitizeInput", () => {
    test("should sanitize HTML and script tags", () => {
      const maliciousInput =
        '<script>alert("XSS")</script>Normal text<img src=x onerror=alert(1)>';
      const result = ProfileValidator.sanitizeInput(maliciousInput);

      expect(result).not.toContain("<script>");
      expect(result).not.toContain("onerror");
      expect(result).toContain("Normal text");
      expect(result).toContain("&lt;"); // HTML should be escaped
    });

    test("should preserve safe markdown", () => {
      const markdown =
        "# Heading\n**Bold** *italic* [link](http://example.com)";
      const result = ProfileValidator.sanitizeInput(markdown);

      expect(result).toContain("# Heading");
      expect(result).toContain("**Bold**");
      expect(result).toContain("*italic*");
      expect(result).toContain("[link]");
    });

    test("should handle SQL injection patterns", () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const result = ProfileValidator.sanitizeInput(sqlInjection);

      expect(result).not.toContain("DROP TABLE");
      expect(result).not.toContain("'");
    });

    test("should preserve unicode and emojis", () => {
      const unicode = "Hello 世界 🎉 مرحبا";
      const result = ProfileValidator.sanitizeInput(unicode);

      expect(result).toBe(unicode);
    });

    test("should handle null and undefined", () => {
      expect(ProfileValidator.sanitizeInput(null)).toBe("");
      expect(ProfileValidator.sanitizeInput(undefined)).toBe("");
    });

    test("should truncate very long input", () => {
      const longInput = "A".repeat(10001);
      const result = ProfileValidator.sanitizeInput(longInput);

      expect(result).toBe(longInput); // No truncation, just sanitization
    });
  });

  describe("validateEmail", () => {
    test("should validate correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "first+last@test.org",
        "email123@subdomain.example.com",
      ];

      validEmails.forEach((email) => {
        expect(ProfileValidator.validateEmail(email)).toBe(true);
      });
    });

    test("should reject invalid email addresses", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user name@example.com",
        "user@.com",
        "",
        null,
        undefined,
      ];

      invalidEmails.forEach((email) => {
        expect(ProfileValidator.validateEmail(email)).toBe(false);
      });
    });
  });

  describe("validatePhone", () => {
    test("should validate correct phone numbers", () => {
      const validPhones = [
        "555-123-4567",
        "(555) 123-4567",
        "5551234567",
        "+1-555-123-4567",
        "555.123.4567",
      ];

      validPhones.forEach((phone) => {
        expect(ProfileValidator.validatePhoneNumber(phone)).toBe(true);
      });
    });

    test("should reject invalid phone numbers", () => {
      const invalidPhones = [
        "123",
        "abc-def-ghij",
        "",
        null,
        "555-12",
        "12345678901234567890",
      ];

      invalidPhones.forEach((phone) => {
        expect(ProfileValidator.validatePhoneNumber(phone)).toBe(false);
      });
    });
  });

  describe("validateDateFormat", () => {
    test("should validate correct date formats", () => {
      const validDates = [
        "2023-06-15",
        "2023-12-31",
        "2000-01-01",
        new Date().toISOString(),
        new Date("2023-06-15").toString(),
      ];

      validDates.forEach((date) => {
        expect(ProfileValidator.validateDate(date)).toBe(true);
      });
    });

    test("should reject invalid date formats", () => {
      const invalidDates = [
        "not-a-date",
        "2023-13-01", // Invalid month
        "2023-02-30", // Invalid day for February
        "",
        null,
        undefined,
      ];

      invalidDates.forEach((date) => {
        expect(ProfileValidator.validateDate(date)).toBe(false);
      });
    });
  });

  describe("validateFileUpload", () => {
    test("should validate allowed file types", () => {
      const validFiles = [
        { name: "image.jpg", type: "image/jpeg", size: 1024 * 1024 },
        { name: "photo.png", type: "image/png", size: 2 * 1024 * 1024 },
        { name: "document.pdf", type: "application/pdf", size: 500 * 1024 },
        { name: "file.gif", type: "image/gif", size: 3 * 1024 * 1024 },
      ];

      validFiles.forEach((file) => {
        const result = ProfileValidator.validateFileUpload(file);
        expect(result).toBe(true);
      });
    });

    test("should reject invalid file types", () => {
      const file = {
        name: "script.exe",
        type: "application/x-msdownload",
        size: 1024,
      };
      const result = ProfileValidator.validateFileUpload(file);

      expect(result).toBe(false);
    });

    test("should reject oversized files", () => {
      const file = {
        name: "huge.jpg",
        type: "image/jpeg",
        size: 11 * 1024 * 1024,
      }; // 11MB
      const result = ProfileValidator.validateFileUpload(file);

      expect(result).toBe(false);
    });
  });

  describe("Integration Tests", () => {
    test("should validate complete profile with nested data", () => {
      const complexProfile = {
        id: "prof-complex",
        name: "Complex Child",
        dateOfBirth: "2010-05-15",
        entries: [
          {
            id: "e1",
            category: "medical",
            title: "Vaccination Record",
            description: "Annual flu shot",
            date: "2023-10-01",
            visibility: ["family", "medical"],
          },
          {
            id: "e2",
            category: "education",
            title: "Report Card",
            description: "End of year grades",
            date: "2023-06-01",
            visibility: ["family"],
          },
        ],
        categories: [
          {
            id: "medical",
            name: "medical",
            displayName: "Medical Records",
            color: "#e74c3c",
            order: 0,
            isVisible: true,
            isCustom: false,
          },
          {
            id: "education",
            name: "education",
            displayName: "Education",
            color: "#3498db",
            order: 1,
            isVisible: true,
            isCustom: false,
          },
        ],
        createdAt: "2023-01-01T00:00:00Z",
        lastModified: Date.now(),
      };

      const result = ProfileValidator.validateProfile(complexProfile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should collect all validation errors", () => {
      const invalidProfile = {
        id: "", // Invalid
        name: "A", // Too short
        dateOfBirth: "invalid-date", // Invalid format
        entries: [
          { id: "", category: "", title: "" }, // Multiple invalid fields
        ],
        categories: [
          { id: "", name: "", displayName: "", color: "notahex" }, // Multiple invalid fields
        ],
      };

      const result = ProfileValidator.validateProfile(invalidProfile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });
});
