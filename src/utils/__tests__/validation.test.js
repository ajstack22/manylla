import { ProfileValidator } from "../validation";

describe("ProfileValidator", () => {
  describe("validateProfile", () => {
    const validProfile = {
      id: "test-profile-1",
      name: "Test Child",
      dateOfBirth: "2010-01-01",
      entries: [
        {
          id: "entry-1",
          category: "medical",
          title: "Test Entry",
          description: "Test description",
          date: "2024-01-01",
          visibility: ["private"],
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
        },
      ],
    };

    it("should validate a valid profile", () => {
      const result = ProfileValidator.validateProfile(validProfile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject null or undefined profile", () => {
      expect(ProfileValidator.validateProfile(null).valid).toBe(false);
      expect(ProfileValidator.validateProfile(undefined).valid).toBe(false);
      expect(ProfileValidator.validateProfile("not an object").valid).toBe(
        false,
      );
    });

    it("should require profile ID", () => {
      const profile = { ...validProfile };
      delete profile.id;

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile ID is required");
    });

    it("should require child name", () => {
      const profile = { ...validProfile, name: "" };

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile name is required");
    });

    it("should require valid date of birth", () => {
      let profile = { ...validProfile };
      delete profile.dateOfBirth;

      let result = ProfileValidator.validateProfile(profile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Date of birth is required");

      profile = { ...validProfile, dateOfBirth: "invalid-date" };
      result = ProfileValidator.validateProfile(profile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid date of birth");
    });

    it("should reject future date of birth", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const profile = {
        ...validProfile,
        dateOfBirth: futureDate.toISOString(),
      };

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Date of birth cannot be in the future");
    });

    it("should require entries to be an array", () => {
      const profile = { ...validProfile, entries: "not an array" };

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Entries must be an array");
    });

    it("should require categories to be an array", () => {
      const profile = { ...validProfile, categories: "not an array" };

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Categories must be an array");
    });

    it("should validate individual entries", () => {
      const profile = {
        ...validProfile,
        entries: [
          {
            // Missing required fields
            id: "",
            title: "",
            date: "invalid-date",
          },
        ],
      };

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes("entry"))).toBe(true);
    });

    it("should validate individual categories", () => {
      const profile = {
        ...validProfile,
        categories: [
          {
            // Missing required fields
            id: "",
            name: "",
            color: "invalid-color",
          },
        ],
      };

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes("Category 1:"))).toBe(
        true,
      );
    });
  });

  describe("validateEntry", () => {
    const validEntry = {
      id: "entry-1",
      category: "medical",
      title: "Test Entry",
      description: "Test description",
      date: "2024-01-01",
      visibility: ["private"],
    };

    it("should validate a valid entry", () => {
      const result = ProfileValidator.validateEntry(validEntry);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require ID", () => {
      const entry = { ...validEntry };
      delete entry.id;

      const result = ProfileValidator.validateEntry(entry);

      expect(result.errors).toContain("Entry ID is required");
    });

    it("should require category", () => {
      const entry = { ...validEntry, category: null };

      const result = ProfileValidator.validateEntry(entry);

      expect(result.errors).toContain("Entry category is required");
    });

    it("should require title", () => {
      const entry = { ...validEntry, title: "   " };

      const result = ProfileValidator.validateEntry(entry);

      expect(result.errors).toContain("Entry title is required");
    });

    it("should require description", () => {
      const entry = { ...validEntry, description: null };

      const result = ProfileValidator.validateEntry(entry);

      expect(result.errors).toContain("Entry description is required");
    });

    it("should validate visibility array", () => {
      let entry = { ...validEntry, visibility: "not-array" };
      let result = ProfileValidator.validateEntry(entry);
      expect(result.errors).toContain("Visibility must be an array");

      entry = { ...validEntry, visibility: ["invalid-visibility"] };
      result = ProfileValidator.validateEntry(entry);
      expect(result.errors).toContain("Invalid visibility: invalid-visibility");
    });

    it("should accept valid visibility values", () => {
      const validVisibilityValues = [
        "private",
        "family",
        "medical",
        "education",
      ];

      validVisibilityValues.forEach((visibility) => {
        const entry = { ...validEntry, visibility: [visibility] };
        const result = ProfileValidator.validateEntry(entry);

        expect(result.errors).not.toContain(
          `Invalid visibility: ${visibility}`,
        );
      });
    });

    it("should validate date format", () => {
      const entry = { ...validEntry, date: "invalid-date" };

      const result = ProfileValidator.validateEntry(entry);

      expect(result.errors).toContain("Invalid date format");
    });

    it("should handle undefined visibility (optional field)", () => {
      const entry = { ...validEntry };
      delete entry.visibility;

      const result = ProfileValidator.validateEntry(entry);

      expect(result.errors).not.toContain("Visibility must be an array");
    });
  });

  describe("validateCategory", () => {
    const validCategory = {
      id: "cat-1",
      name: "medical",
      displayName: "Medical",
      color: "#E76F51",
      order: 0,
      isVisible: true,
    };

    it("should validate a valid category", () => {
      const result = ProfileValidator.validateCategory(validCategory);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require ID", () => {
      const category = { ...validCategory, id: null };

      const result = ProfileValidator.validateCategory(category);

      expect(result.errors).toContain("Category ID is required");
    });

    it("should require name", () => {
      const category = { ...validCategory, name: null };

      const result = ProfileValidator.validateCategory(category);

      expect(result.errors).toContain("Category name is required");
    });

    it("should require display name", () => {
      const category = { ...validCategory, displayName: null };

      const result = ProfileValidator.validateCategory(category);

      expect(result.errors).toContain("Display name required");
    });

    it("should validate hex color format", () => {
      let category = { ...validCategory, color: "invalid-color" };
      let result = ProfileValidator.validateCategory(category);
      expect(result.errors).toContain("Invalid color format");

      category = { ...validCategory, color: "#ZZZ" };
      result = ProfileValidator.validateCategory(category);
      expect(result.errors).toContain("Invalid color format");

      category = { ...validCategory, color: "red" };
      result = ProfileValidator.validateCategory(category);
      expect(result.valid).toBe(true); // red is now valid
    });

    it("should accept valid hex colors", () => {
      const validColors = ["#000000", "#FFFFFF", "#e76f51", "#2A9D8F"];

      validColors.forEach((color) => {
        const category = { ...validCategory, color };
        const result = ProfileValidator.validateCategory(category);

        expect(result.valid).toBe(true);
      });
    });

    it("should require order to be a number", () => {
      const category = { ...validCategory, order: "not-a-number" };

      const result = ProfileValidator.validateCategory(category);

      expect(result.errors).toContain("Order must be a number");
    });

    it("should require isVisible to be boolean", () => {
      const category = { ...validCategory, isVisible: "not-boolean" };

      const result = ProfileValidator.validateCategory(category);

      expect(result.errors).toContain("isVisible must be boolean");
    });
  });

  describe("sanitizeProfile", () => {
    it("should trim whitespace from names", () => {
      const profile = {
        name: "  Test Child  ",
        preferredName: "  Nickname  ",
        entries: [],
      };

      const sanitized = ProfileValidator.sanitizeProfile(profile);

      expect(sanitized.name).toBe("Test Child");
      expect(sanitized.preferredName).toBe("Nickname");
    });

    it("should sanitize entry titles and descriptions", () => {
      const profile = {
        name: "Test Child",
        entries: [
          {
            title: "  Test Title  ",
            description: "  Test Description  ",
            visibility: ["private"],
          },
        ],
      };

      const sanitized = ProfileValidator.sanitizeProfile(profile);

      expect(sanitized.entries[0].title).toBe("Test Title");
      expect(sanitized.entries[0].description).toBe("Test Description");
    });

    it("should set default visibility for entries without visibility", () => {
      const profile = {
        name: "Test Child",
        entries: [
          {
            title: "Test Title",
            description: "Test Description",
            // No visibility field
          },
        ],
      };

      const sanitized = ProfileValidator.sanitizeProfile(profile);

      expect(sanitized.entries[0].visibility).toEqual(["private"]);
    });

    it("should preserve valid visibility arrays", () => {
      const profile = {
        name: "Test Child",
        entries: [
          {
            title: "Test Title",
            description: "Test Description",
            visibility: ["family", "medical"],
          },
        ],
      };

      const sanitized = ProfileValidator.sanitizeProfile(profile);

      expect(sanitized.entries[0].visibility).toEqual(["family", "medical"]);
    });

    it("should add updatedAt timestamp", () => {
      const profile = {
        name: "Test Child",
        entries: [],
      };

      const sanitized = ProfileValidator.sanitizeProfile(profile);

      expect(sanitized.updatedAt).toBeInstanceOf(Date);
      expect(sanitized.updatedAt.getTime()).toBeCloseTo(Date.now(), -3); // Within 1 second
    });
  });

  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const html =
        'Safe content <script>alert("dangerous")</script> more content';

      const sanitized = ProfileValidator.sanitizeHtml(html);

      expect(sanitized).toBe("Safe content  more content");
      expect(sanitized).not.toContain("<script>");
    });

    it("should remove event handlers", () => {
      const html =
        '<div onclick="alert(\'click\')" onmouseover="dangerous()">Content</div>';

      const sanitized = ProfileValidator.sanitizeHtml(html);

      expect(sanitized).not.toContain("onclick");
      expect(sanitized).not.toContain("onmouseover");
      expect(sanitized).toContain("Content");
      expect(sanitized).toMatch(/<div[^>]*>Content<\/div>/);
    });

    it("should remove javascript: protocols", () => {
      const html = "<a href=\"javascript:alert('bad')\">Link</a>";

      const sanitized = ProfileValidator.sanitizeHtml(html);

      // eslint-disable-next-line no-script-url
      expect(sanitized).not.toContain("javascript:");
    });

    it("should preserve safe HTML content", () => {
      const html = "<p>This is <strong>safe</strong> <em>content</em></p>";

      const sanitized = ProfileValidator.sanitizeHtml(html);

      expect(sanitized).toBe(html);
    });

    it("should handle complex script variations", () => {
      const html =
        'Content <SCRIPT type="text/javascript">bad code</SCRIPT> more';

      const sanitized = ProfileValidator.sanitizeHtml(html);

      expect(sanitized).toBe("Content  more");
    });
  });

  describe("repairProfile", () => {
    it("should generate ID if missing", () => {
      const profile = {
        name: "Test Child",
        entries: [],
        categories: [],
      };

      const repaired = ProfileValidator.repairProfile(profile);

      expect(repaired.id).toBeDefined();
      expect(typeof repaired.id).toBe("string");
    });

    it("should return null for profiles without name", () => {
      const profile = {
        id: "test-id",
        entries: [],
        categories: [],
      };

      const repaired = ProfileValidator.repairProfile(profile);

      expect(repaired).toBe(null);
    });

    it("should ensure entries and categories are arrays", () => {
      const profile = {
        id: "test-id",
        name: "Test Child",
        entries: "not-array",
        categories: null,
      };

      const repaired = ProfileValidator.repairProfile(profile);

      expect(Array.isArray(repaired.entries)).toBe(true);
      expect(Array.isArray(repaired.categories)).toBe(true);
    });

    it("should fix date fields", () => {
      const profile = {
        id: "test-id",
        name: "Test Child",
        entries: [],
        categories: [],
      };

      const repaired = ProfileValidator.repairProfile(profile);

      expect(repaired.dateOfBirth).toBeInstanceOf(Date);
      expect(repaired.createdAt).toBeInstanceOf(Date);
      expect(repaired.updatedAt).toBeInstanceOf(Date);
    });

    it("should fix entry fields", () => {
      const profile = {
        id: "test-id",
        name: "Test Child",
        entries: [
          {
            title: "Test Entry",
            description: "Description",
            // Missing id, date, visibility
          },
        ],
        categories: [],
      };

      const repaired = ProfileValidator.repairProfile(profile);

      expect(repaired.entries[0].id).toBeDefined();
      expect(repaired.entries[0].date).toBeInstanceOf(Date);
      expect(repaired.entries[0].visibility).toEqual(["private"]);
    });

    it("should preserve existing valid visibility arrays", () => {
      const profile = {
        id: "test-id",
        name: "Test Child",
        entries: [
          {
            title: "Test Entry",
            description: "Description",
            visibility: ["family", "medical"],
          },
        ],
        categories: [],
      };

      const repaired = ProfileValidator.repairProfile(profile);

      expect(repaired.entries[0].visibility).toEqual(["family", "medical"]);
    });

    it("should handle errors gracefully", () => {
      // Test with data that would cause errors during processing
      const profile = {
        name: "Test",
        dateOfBirth: "invalid-date-that-throws",
      };

      // Mock Date constructor to throw
      const originalDate = global.Date;
      global.Date = jest.fn(() => {
        throw new Error("Date error");
      });

      const repaired = ProfileValidator.repairProfile(profile);

      expect(repaired).toBe(null);

      // Restore original Date
      global.Date = originalDate;
    });

    it("should preserve valid date objects", () => {
      const validDate = new Date("2010-01-01");
      const profile = {
        id: "test-id",
        name: "Test Child",
        dateOfBirth: validDate,
        entries: [],
        categories: [],
      };

      const repaired = ProfileValidator.repairProfile(profile);

      expect(repaired.dateOfBirth).toEqual(validDate);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle empty objects gracefully", () => {
      const result = ProfileValidator.validateProfile({});

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle entries with mixed valid/invalid data", () => {
      const profile = {
        id: "test-profile",
        name: "Test Child",
        dateOfBirth: "2010-01-01",
        entries: [
          {
            id: "valid-entry",
            category: "medical",
            title: "Valid Entry",
            description: "Valid description",
            date: "2024-01-01",
          },
          {
            // Invalid entry
            id: "",
            title: "",
            date: "invalid",
          },
        ],
        categories: [],
      };

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes("entry"))).toBe(true);
    });

    it("should handle null and undefined values in nested objects", () => {
      const profile = {
        id: null,
        name: undefined,
        dateOfBirth: null,
        entries: null,
        categories: undefined,
      };

      const result = ProfileValidator.validateProfile(profile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Profile ID is required");
      expect(result.errors).toContain("Profile name is required");
      expect(result.errors).toContain("Date of birth is required");
      expect(result.errors).toContain("Entries must be an array");
      expect(result.errors).toContain("Categories must be an array");
    });
  });
});
