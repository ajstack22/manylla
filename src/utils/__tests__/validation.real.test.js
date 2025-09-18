/* eslint-disable */
/**
 * Real integration tests for validation utilities
 * Tests actual validation logic with real data patterns
 * Focus: Real behavior testing as required by Story S029
 */

import { ProfileValidator } from "../validation";

// Test data generators
const createValidProfile = (overrides = {}) => ({
  id: "valid-profile-id",
  name: "Test Child",
  dateOfBirth: "2015-01-01",
  entries: [],
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
  ],
  createdAt: new Date().toISOString(),
  lastModified: Date.now(),
  ...overrides,
});

const createValidEntry = (overrides = {}) => ({
  id: "valid-entry-id",
  category: "medical",
  title: "Valid Entry",
  description: "Valid description",
  date: new Date().toISOString(),
  visibility: ["family"],
  ...overrides,
});

const createValidCategory = (overrides = {}) => ({
  id: "valid-category-id",
  name: "medical",
  displayName: "Medical Records",
  color: "#e74c3c",
  order: 0,
  isVisible: true,
  isCustom: false,
  ...overrides,
});

describe("Validation Real Integration Tests", () => {
  describe("Profile Validation", () => {
    test("should validate complete valid profile", () => {
      const validProfile = createValidProfile();
      const result = ProfileValidator.validateProfile(validProfile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should validate profile with extensive data", () => {
      const extensiveProfile = createValidProfile({
        entries: [
          createValidEntry({ id: "entry-1", title: "Medical Entry" }),
          createValidEntry({
            id: "entry-2",
            title: "Educational Entry",
            category: "education",
          }),
        ],
        categories: [
          createValidCategory({ id: "medical", name: "medical" }),
          createValidCategory({ id: "education", name: "education" }),
        ],
        emergencyContact: "John Doe - 555-123-4567",
        allergies: ["Peanuts", "Shellfish"],
        medications: ["EpiPen", "Inhaler"],
        diagnoses: ["Asthma", "Food Allergies"],
        school: "Elementary School",
        teacher: "Ms. Johnson",
        grade: "5th",
      });

      const result = ProfileValidator.validateProfile(extensiveProfile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject profile with missing required fields", () => {
      const invalidProfile = createValidProfile({
        name: "", // Missing name
        id: null, // Missing id
      });

      const result = ProfileValidator.validateProfile(invalidProfile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile name is required");
      expect(result.errors).toContain("Profile ID is required");
    });

    test("should validate profile name constraints", () => {
      // Too short
      let result = ProfileValidator.validateProfile(
        createValidProfile({ name: "A" }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Profile name must be at least 2 characters",
      );

      // Too long
      result = ProfileValidator.validateProfile(
        createValidProfile({
          name: "A".repeat(101), // Assuming 100 char limit
        }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile name is too long");

      // Valid length
      result = ProfileValidator.validateProfile(
        createValidProfile({ name: "Valid Name" }),
      );
      expect(result.valid).toBe(true);
    });

    test("should validate entries array", () => {
      // Null entries
      let result = ProfileValidator.validateProfile(
        createValidProfile({ entries: null }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entries must be an array");

      // Invalid entry in array
      result = ProfileValidator.validateProfile(
        createValidProfile({
          entries: [{ invalidEntry: true }],
        }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes("entry"))).toBe(true);
    });

    test("should handle special characters in profile data", () => {
      const profileWithSpecialChars = createValidProfile({
        name: "José María García-López",
        emergencyContact: "María José - +1 (555) 123-4567 ext. 123",
        school: "École Élémentaire François Mitterrand",
      });

      const result = ProfileValidator.validateProfile(profileWithSpecialChars);
      expect(result.valid).toBe(true);
    });
  });

  describe("Entry Validation", () => {
    test("should validate complete valid entry", () => {
      const validEntry = createValidEntry();
      const result = ProfileValidator.validateEntry(validEntry);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should validate entry with markdown content", () => {
      const markdownEntry = createValidEntry({
        description: `# Medical Visit

**Doctor**: Dr. Smith
**Date**: March 15, 2023
**Notes**:
- Growth charts updated
- Vaccinations up to date
- Next visit in 6 months

*Important*: Remember to bring insurance card.`,
      });

      const result = ProfileValidator.validateEntry(markdownEntry);
      expect(result.valid).toBe(true);
    });

    test("should validate entry with attachments", () => {
      const entryWithAttachments = createValidEntry({
        attachments: [
          {
            name: "medical-report.pdf",
            type: "application/pdf",
            size: 1024000,
          },
          { name: "xray-image.jpg", type: "image/jpeg", size: 512000 },
        ],
      });

      const result = ProfileValidator.validateEntry(entryWithAttachments);
      expect(result.valid).toBe(true);
    });

    test("should reject entry with missing required fields", () => {
      const invalidEntry = createValidEntry({
        title: "", // Missing title
        category: "", // Missing category
      });

      const result = ProfileValidator.validateEntry(invalidEntry);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry title is required");
      expect(result.errors).toContain("Entry category is required");
    });

    test("should validate title length constraints", () => {
      // Too long
      let result = ProfileValidator.validateEntry(
        createValidEntry({
          title: "X".repeat(201), // Assuming 200 char limit
        }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry title is too long");

      // Valid length
      result = ProfileValidator.validateEntry(
        createValidEntry({ title: "Valid Title" }),
      );
      expect(result.valid).toBe(true);
    });

    test("should validate description length", () => {
      // Very long description
      const longDescription = "X".repeat(10001); // Assuming 10000 char limit
      const result = ProfileValidator.validateEntry(
        createValidEntry({
          description: longDescription,
        }),
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry description is too long");
    });

    test("should validate date formats", () => {
      // Invalid date
      let result = ProfileValidator.validateEntry(
        createValidEntry({ date: "invalid-date" }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid date format");

      // Future date
      result = ProfileValidator.validateEntry(
        createValidEntry({
          date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entry date cannot be in the future");

      // Valid date
      result = ProfileValidator.validateEntry(
        createValidEntry({
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        }),
      );
      expect(result.valid).toBe(true);
    });

    test("should validate visibility settings", () => {
      // Invalid visibility
      let result = ProfileValidator.validateEntry(
        createValidEntry({
          visibility: ["invalid-visibility"],
        }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes("visibility"))).toBe(
        true,
      );

      // Valid visibility combinations
      result = ProfileValidator.validateEntry(
        createValidEntry({
          visibility: ["family", "medical"],
        }),
      );
      expect(result.valid).toBe(true);

      result = ProfileValidator.validateEntry(
        createValidEntry({
          visibility: ["private"],
        }),
      );
      expect(result.valid).toBe(true);
    });
  });

  describe("Category Validation", () => {
    test("should validate complete valid category", () => {
      const validCategory = createValidCategory();
      const result = ProfileValidator.validateCategory(validCategory);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject category with missing required fields", () => {
      const invalidCategory = createValidCategory({
        name: "", // Missing name
        id: null, // Missing id
      });

      const result = ProfileValidator.validateCategory(invalidCategory);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Category name is required");
      expect(result.errors).toContain("Category ID is required");
    });

    test("should validate color format", () => {
      // Invalid color format
      let result = ProfileValidator.validateCategory(
        createValidCategory({
          color: "invalid-color",
        }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid color format");

      // Valid color formats
      result = ProfileValidator.validateCategory(
        createValidCategory({ color: "#FF0000" }),
      );
      expect(result.valid).toBe(true);

      result = ProfileValidator.validateCategory(
        createValidCategory({ color: "#f00" }),
      );
      expect(result.valid).toBe(true);

      result = ProfileValidator.validateCategory(
        createValidCategory({ color: "red" }),
      );
      expect(result.valid).toBe(true);
    });

    test("should validate category name constraints", () => {
      // Reserved names
      let result = ProfileValidator.validateCategory(
        createValidCategory({
          name: "admin", // Assuming this is reserved
        }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Category name is reserved");

      // Special characters
      result = ProfileValidator.validateCategory(
        createValidCategory({
          name: "category with spaces",
        }),
      );
      expect(result.valid).toBe(true);

      result = ProfileValidator.validateCategory(
        createValidCategory({
          name: "category-with-hyphens",
        }),
      );
      expect(result.valid).toBe(true);
    });
  });

  describe("Input Sanitization", () => {
    test("should sanitize HTML and script tags", () => {
      const maliciousInput =
        '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
      const sanitized = ProfileValidator.sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("onerror");
      expect(sanitized).toContain("&lt;script&gt;");
    });

    test("should preserve safe HTML in markdown", () => {
      const markdownInput = "**Bold** *italic* [link](https://example.com)";
      const sanitized = ProfileValidator.sanitizeInput(markdownInput, {
        allowMarkdown: true,
      });

      expect(sanitized).toContain("**Bold**");
      expect(sanitized).toContain("*italic*");
      expect(sanitized).toContain("[link]");
    });

    test("should handle SQL injection patterns", () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const sanitized = ProfileValidator.sanitizeInput(sqlInjection);

      expect(sanitized).not.toContain("DROP TABLE");
      expect(sanitized).toContain("&#x27;"); // Escaped quote
    });

    test("should sanitize but preserve Unicode characters", () => {
      const unicodeInput = "Café ñoño 测试 🎉 émojis";
      const sanitized = ProfileValidator.sanitizeInput(unicodeInput);

      expect(sanitized).toBe(unicodeInput); // Should be unchanged
    });

    test("should handle very long inputs", () => {
      const longInput = "A".repeat(100000);
      const startTime = Date.now();
      const sanitized = ProfileValidator.sanitizeInput(longInput);
      const endTime = Date.now();

      expect(sanitized).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });
  });

  describe("Email and Phone Validation", () => {
    test("should validate email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name+tag@domain.co.uk",
        "test.email.with+symbol@example.com",
      ];

      validEmails.forEach((email) => {
        expect(ProfileValidator.validateEmail(email)).toBe(true);
      });

      const invalidEmails = [
        "invalid-email",
        "@domain.com",
        "user@",
        "user..name@domain.com",
      ];

      invalidEmails.forEach((email) => {
        expect(ProfileValidator.validateEmail(email)).toBe(false);
      });
    });

    test("should validate phone numbers", () => {
      const validPhones = [
        "555-123-4567",
        "(555) 123-4567",
        "+1 555 123 4567",
        "5551234567",
        "+1-555-123-4567 ext. 123",
      ];

      validPhones.forEach((phone) => {
        expect(ProfileValidator.validatePhoneNumber(phone)).toBe(true);
      });

      const invalidPhones = [
        "123",
        "not-a-phone",
        "555-123",
        "++1-555-123-4567",
      ];

      invalidPhones.forEach((phone) => {
        expect(ProfileValidator.validatePhoneNumber(phone)).toBe(false);
      });
    });
  });

  describe("Date Validation", () => {
    test("should validate date formats", () => {
      const validDates = [
        new Date().toISOString(),
        "2023-12-25",
        "12/25/2023",
        "December 25, 2023",
      ];

      validDates.forEach((date) => {
        expect(ProfileValidator.validateDate(date)).toBe(true);
      });

      const invalidDates = [
        "invalid-date",
        "2023-13-01", // Invalid month
        "2023-02-30", // Invalid day
        "",
        null,
      ];

      invalidDates.forEach((date) => {
        expect(ProfileValidator.validateDate(date)).toBe(false);
      });
    });

    test("should handle timezone considerations", () => {
      const utcDate = new Date().toISOString();
      const localDate = new Date().toLocaleDateString();

      expect(ProfileValidator.validateDate(utcDate)).toBe(true);
      expect(ProfileValidator.validateDate(localDate)).toBe(true);
    });
  });

  describe("File Upload Validation", () => {
    test("should validate file types", () => {
      const validFile = {
        name: "document.pdf",
        type: "application/pdf",
        size: 1024000, // 1MB
      };

      expect(ProfileValidator.validateFileUpload(validFile)).toBe(true);

      const invalidFile = {
        name: "malicious.exe",
        type: "application/x-msdownload",
        size: 1024000,
      };

      expect(ProfileValidator.validateFileUpload(invalidFile)).toBe(false);
    });

    test("should validate file sizes", () => {
      const tooLargeFile = {
        name: "large.pdf",
        type: "application/pdf",
        size: 50 * 1024 * 1024, // 50MB
      };

      expect(ProfileValidator.validateFileUpload(tooLargeFile)).toBe(false);

      const validSizeFile = {
        name: "normal.pdf",
        type: "application/pdf",
        size: 5 * 1024 * 1024, // 5MB
      };

      expect(ProfileValidator.validateFileUpload(validSizeFile)).toBe(true);
    });
  });

  describe("Markdown Validation", () => {
    test("should validate markdown syntax", () => {
      const validMarkdown = `# Heading

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

[Link](https://example.com)`;

      expect(ProfileValidator.isValidMarkdown(validMarkdown)).toBe(true);
    });

    test("should reject malicious markdown", () => {
      const maliciousMarkdown = `# Heading

<script>alert('XSS')</script>

[Bad link](javascript:alert('XSS'))`;

      expect(ProfileValidator.isValidMarkdown(maliciousMarkdown)).toBe(false);
    });
  });

  describe("Form Data Validation", () => {
    test("should validate complete form submission", () => {
      const formData = {
        profile: createValidProfile(),
        entries: [createValidEntry()],
        categories: [createValidCategory()],
      };

      const result = ProfileValidator.validateFormData(formData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should validate nested data structures", () => {
      const complexFormData = {
        profiles: [
          createValidProfile({ id: "profile-1" }),
          createValidProfile({ id: "profile-2" }),
        ],
        sharedCategories: [
          createValidCategory({ id: "shared-1" }),
          createValidCategory({ id: "shared-2" }),
        ],
        settings: {
          theme: "light",
          notifications: true,
          syncEnabled: false,
        },
      };

      const result = ProfileValidator.validateFormData(complexFormData);
      expect(result.valid).toBe(true);
    });

    test("should provide detailed error paths for nested validation", () => {
      const invalidFormData = {
        profiles: [
          createValidProfile({ name: "" }), // Invalid name
          createValidProfile({ entries: [{ invalidEntry: true }] }), // Invalid entry
        ],
      };

      const result = ProfileValidator.validateFormData(invalidFormData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((error) => error.includes("profiles[0]"))).toBe(
        true,
      );
      expect(result.errors.some((error) => error.includes("profiles[1]"))).toBe(
        true,
      );
    });
  });

  describe("Performance and Edge Cases", () => {
    test("should handle large datasets efficiently", () => {
      const largeProfile = createValidProfile({
        entries: Array.from({ length: 1000 }, (_, i) =>
          createValidEntry({ id: `entry-${i}`, title: `Entry ${i}` }),
        ),
      });

      const startTime = Date.now();
      const result = ProfileValidator.validateProfile(largeProfile);
      const endTime = Date.now();

      expect(result.valid).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });

    test("should handle circular references safely", () => {
      const circularProfile = createValidProfile();
      circularProfile.self = circularProfile; // Create circular reference

      expect(() =>
        ProfileValidator.validateProfile(circularProfile),
      ).not.toThrow();
    });

    test("should handle null and undefined gracefully", () => {
      expect(ProfileValidator.validateProfile(null)).toEqual({
        valid: false,
        errors: ["Profile data is required"],
      });

      expect(ProfileValidator.validateEntry(undefined)).toEqual({
        valid: false,
        errors: ["Entry data is required"],
      });
    });

    test("should handle empty objects", () => {
      const result = ProfileValidator.validateProfile({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
