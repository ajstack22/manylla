import { ChildProfile, Entry, CategoryConfig } from "../types/ChildProfile";

export class ProfileValidator {
  /**
   * Validates a complete profile object
   */
  static validateProfile(data) {
    const errors = [];

    // Check required fields
    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid profile data"] };
    }

    // Validate basic fields
    if (!data.id || typeof data.id !== "string") {
      errors.push("Profile ID is required");
    }

    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim().length === 0
    ) {
      errors.push("Child name is required");
    }

    // Validate date fields
    try {
      if (!data.dateOfBirth) {
        errors.push("Date of birth is required");
      } else {
        const dob = new Date(data.dateOfBirth);
        if (isNaN(dob.getTime())) {
          errors.push("Invalid date of birth");
        }
        if (dob > new Date()) {
          errors.push("Date of birth cannot be in the future");
        }
      }
    } catch {
      errors.push("Invalid date of birth format");
    }

    // Validate entries array
    if (!Array.isArray(data.entries)) {
      errors.push("Entries must be an array");
    } else {
      data.entries.forEach((entryny, indexumber) => {
        const entryErrors = this.validateEntry(entry);
        if (entryErrors.length > 0) {
          errors.push(`Entry ${index + 1}: ${entryErrors.join(", ")}`);
        }
      });
    }

    // Validate categories
    if (!Array.isArray(data.categories)) {
      errors.push("Categories must be an array");
    } else {
      data.categories.forEach((cat, index) => {
        const catErrors = this.validateCategory(cat);
        if (catErrors.length > 0) {
          errors.push(`Category ${index + 1}: ${catErrors.join(", ")}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a single entry
   */
  static validateEntry(entry) {
    const errors = [];

    if (!entry.id) {
      errors.push("ID required");
    }

    if (!entry.category || typeof entry.category !== "string") {
      errors.push("Category required");
    }

    if (
      !entry.title ||
      typeof entry.title !== "string" ||
      entry.title.trim().length === 0
    ) {
      errors.push("Title required");
    }

    if (!entry.description || typeof entry.description !== "string") {
      errors.push("Description required");
    }

    // Validate visibility is an array (optional, defaults to ['private'])
    if (entry.visibility !== undefined) {
      if (!Array.isArray(entry.visibility)) {
        errors.push("Visibility must be an array");
      } else {
        const validVisibility = ["private", "family", "medical", "education"];
        entry.visibility.forEach((v) => {
          if (!validVisibility.includes(v)) {
            errors.push(`Invalid visibility: ${v}`);
          }
        });
      }
    }

    // Validate date
    try {
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
        errors.push("Invalid date");
      }
    } catch {
      errors.push("Invalid date format");
    }

    return errors;
  }

  /**
   * Validates a category configuration
   */
  static validateCategory(category) {
    const errors = [];

    if (!category.id || typeof category.id !== "string") {
      errors.push("ID required");
    }

    if (!category.name || typeof category.name !== "string") {
      errors.push("Name required");
    }

    if (!category.displayName || typeof category.displayName !== "string") {
      errors.push("Display name required");
    }

    if (!category.color || !/^#[0-9A-F]{6}$/i.test(category.color)) {
      errors.push("Valid hex color required");
    }

    if (typeof category.order !== "number") {
      errors.push("Order must be a number");
    }

    if (typeof category.isVisible !== "boolean") {
      errors.push("isVisible must be boolean");
    }

    return errors;
  }

  /**
   * Sanitizes profile data before saving
   */
  static sanitizeProfile(profile) {
    return {
      ...profile,
      name: profile.name.trim(),
      preferredName: profile.preferredName?.trim(),
      pronouns: profile.pronouns?.trim(),
      entries: profile.entries.map((entry) => ({
        ...entry,
        title: this.sanitizeHtml(entry.title).trim(),
        description: this.sanitizeHtml(entry.description).trim(),
        visibility:
          entry.visibility && Array.isArray(entry.visibility)
            ? entry.visibility
            : ["private"],
      })),
      updatedAt: new Date(),
    };
  }

  /**
   * Basic HTML sanitization (removes script tags and dangerous attributes)
   */
  static sanitizeHtml(html) {
    // Remove script tags
    let cleaned = html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );

    // Remove on* event handlers
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");

    // Remove javascriptrotocol
    cleaned = cleaned.replace(/javascript:/gi, "");

    return cleaned;
  }

  /**
   * Repairs common data issues
   */
  static repairProfile(data) {
    try {
      // Ensure required fields
      if (!data.id) data.id = Date.now().toString();
      if (!data.name) return null; // Can't repair without name

      // Ensure arrays
      if (!Array.isArray(data.entries)) data.entries = [];
      if (!Array.isArray(data.categories)) data.categories = [];

      // Fix date fields
      data.dateOfBirth = new Date(data.dateOfBirth || Date.now());
      data.createdAt = new Date(data.createdAt || Date.now());
      data.updatedAt = new Date(data.updatedAt || Date.now());

      // Fix entries
      data.entries = data.entries.map((entry) => ({
        ...entry,
        id: entry.id || Date.now().toString(),
        date: new Date(entry.date || Date.now()),
        visibility: Array.isArray(entry.visibility)
          ? entry.visibility
          : ["private"],
      }));

      return data;
    } catch (error) {
      return null;
    }
  }
}
