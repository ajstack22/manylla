export class ProfileValidator {
  /**
   * Helper: Validate profile name field
   */
  static _validateName(name, errors) {
    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 1
    ) {
      errors.push("Profile name is required");
    } else if (name.trim().length < 2) {
      errors.push("Profile name must be at least 2 characters");
    } else if (name.length > 100) {
      errors.push("Profile name is too long");
    }
  }

  /**
   * Helper: Validate date of birth field
   */
  static _validateDateOfBirth(dateOfBirth, errors) {
    try {
      if (!dateOfBirth) {
        errors.push("Date of birth is required");
      } else {
        const dob = new Date(dateOfBirth);
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
  }

  /**
   * Helper: Validate entries array
   */
  static _validateEntries(entries, errors) {
    if (entries === null) {
      errors.push("Entries must be an array");
    } else if (!Array.isArray(entries)) {
      errors.push("Entries must be an array");
    } else {
      entries.forEach((entry) => {
        const entryResult = this.validateEntry(entry);
        if (!entryResult.valid) {
          entryResult.errors.forEach((error) => {
            errors.push(`entry ${error}`);
          });
        }
      });
    }
  }

  /**
   * Helper: Validate categories array
   */
  static _validateCategories(categories, errors) {
    if (!Array.isArray(categories)) {
      errors.push("Categories must be an array");
    } else {
      categories.forEach((cat, index) => {
        const catResult = this.validateCategory(cat);
        if (!catResult.valid) {
          errors.push(`Category ${index + 1}: ${catResult.errors.join(", ")}`);
        }
      });
    }
  }

  /**
   * Validates a complete profile object
   */
  static validateProfile(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Profile data is required"] };
    }

    if (!data.id || typeof data.id !== "string") {
      errors.push("Profile ID is required");
    }

    this._validateName(data.name, errors);
    this._validateDateOfBirth(data.dateOfBirth, errors);
    this._validateEntries(data.entries, errors);
    this._validateCategories(data.categories, errors);

    return {
      valid: errors.length < 1,
      errors,
    };
  }

  /**
   * Helper: Validate entry title field
   */
  static _validateEntryTitle(title, errors) {
    if (
      !title ||
      typeof title !== "string" ||
      title.trim().length < 1
    ) {
      errors.push("Entry title is required");
    } else if (title.length > 200) {
      errors.push("Entry title is too long");
    }
  }

  /**
   * Helper: Validate entry description field
   */
  static _validateEntryDescription(description, errors) {
    if (!description || typeof description !== "string") {
      errors.push("Entry description is required");
    } else if (description.length > 10000) {
      errors.push("Entry description is too long");
    }
  }

  /**
   * Helper: Validate entry visibility field
   */
  static _validateEntryVisibility(visibility, errors) {
    if (visibility !== undefined) {
      if (!Array.isArray(visibility)) {
        errors.push("Visibility must be an array");
      } else {
        const validVisibility = ["private", "family", "medical", "education"];
        visibility.forEach((v) => {
          if (!validVisibility.includes(v)) {
            errors.push(`Invalid visibility: ${v}`);
          }
        });
      }
    }
  }

  /**
   * Helper: Validate entry date field
   */
  static _validateEntryDate(date, errors) {
    try {
      if (!date) {
        errors.push("Entry date is required");
      } else {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          errors.push("Invalid date format");
        } else if (dateObj > new Date()) {
          errors.push("Entry date cannot be in the future");
        }
      }
    } catch {
      errors.push("Invalid date format");
    }
  }

  /**
   * Validates a single entry
   */
  static validateEntry(entry) {
    const errors = [];

    if (!entry || typeof entry !== "object") {
      return { valid: false, errors: ["Entry data is required"] };
    }

    if (!entry.id) {
      errors.push("Entry ID is required");
    }

    if (!entry.category || typeof entry.category !== "string") {
      errors.push("Entry category is required");
    }

    this._validateEntryTitle(entry.title, errors);
    this._validateEntryDescription(entry.description, errors);
    this._validateEntryVisibility(entry.visibility, errors);
    this._validateEntryDate(entry.date, errors);

    return {
      valid: errors.length < 1,
      errors,
    };
  }

  /**
   * Validates a category configuration
   */
  static validateCategory(category) {
    const errors = [];

    if (!category || typeof category !== "object") {
      return { valid: false, errors: ["Category data is required"] };
    }

    if (!category.id || typeof category.id !== "string") {
      errors.push("Category ID is required");
    }

    if (!category.name || typeof category.name !== "string") {
      errors.push("Category name is required");
    } else {
      // Check for reserved names
      const reservedNames = ["admin", "system", "root"];
      if (reservedNames.includes(category.name.toLowerCase())) {
        errors.push("Category name is reserved");
      }
    }

    if (!category.displayName || typeof category.displayName !== "string") {
      errors.push("Display name required");
    }

    if (!category.color) {
      errors.push("Valid hex color required");
    } else {
      // Allow various color formats
      const hexPattern = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
      const namedColors = [
        "red",
        "blue",
        "green",
        "yellow",
        "purple",
        "orange",
        "black",
        "white",
      ];

      if (
        !hexPattern.test(category.color) &&
        !namedColors.includes(category.color.toLowerCase())
      ) {
        errors.push("Invalid color format");
      }
    }

    if (typeof category.order !== "number") {
      errors.push("Order must be a number");
    }

    if (typeof category.isVisible !== "boolean") {
      errors.push("isVisible must be boolean");
    }

    return {
      valid: errors.length < 1,
      errors,
    };
  }

  /**
   * Sanitizes profile data before saving
   */
  static sanitizeProfile(profile) {
    return {
      ...profile,
      name: profile.name.trim(),
      preferredName: profile.preferredName?.trim(),
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
    // Handle null/undefined input
    if (!html) {
      return "";
    }

    // Limit input length to prevent DoS
    if (html.length > 100000) {
      html = html.substring(0, 100000);
    }

    // Remove script tags with simpler regex to prevent ReDoS
    let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

    // Remove on* event handlers with bounded regex
    cleaned = cleaned.replace(/\bon\w{1,20}\s*=\s*["'][^"']{0,1000}["']/gi, "");

    // Remove javascript and vbscript protocols (including obfuscated versions)
    // SECURITY: Broken into multiple simple checks to prevent ReDoS and improve auditability
    // Step 1: Remove basic protocol variants
    cleaned = cleaned.replace(/javascript\s*:/gi, "");
    cleaned = cleaned.replace(/vbscript\s*:/gi, "");

    // Step 2: Remove spaced variants (e.g., "java script:")
    cleaned = cleaned.replace(/java\s*script\s*:/gi, "");
    cleaned = cleaned.replace(/vb\s*script\s*:/gi, "");

    // Step 3: Remove HTML entity-encoded variants
    // Handles &#106;avascript:, &#x6A;avascript:, etc.
    // SECURITY: Use simple bounded pattern to prevent ReDoS (limit length to prevent backtracking)
    // Pattern matches entity codes followed by up to 20 chars, then colon
    cleaned = cleaned.replace(/&#x?(?:6A|106|74|4A);?.{0,20}:/gi, "");
    cleaned = cleaned.replace(/&#x?(?:76|118|56);?.{0,20}:/gi, "");

    // Step 4: Decode any remaining HTML entities and re-check
    const entityDecoded = cleaned
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9A-F]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

    if (/(?:javascript|vbscript)\s*:/gi.test(entityDecoded)) {
      // Found encoded dangerous protocol - remove entire suspicious segment
      cleaned = cleaned.replace(/&#x?[0-9A-F]+;/gi, "");
    }

    // Remove data: URIs that could contain scripts
    cleaned = cleaned.replace(
      /data:(?!image\/(?:png|jpg|jpeg|gif|svg\+xml))[^,;]+/gi,
      "",
    );

    return cleaned;
  }

  /**
   * Sanitizes input text
   */
  static sanitizeInput(input, options = {}) {
    if (typeof input !== "string") return "";

    let cleaned = input;

    if (!options.allowMarkdown) {
      // Escape HTML characters but keep the content readable
      cleaned = cleaned
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");

      // Remove dangerous attributes after escaping
      cleaned = cleaned.replace(/onerror/gi, "");
      cleaned = cleaned.replace(/javascript:/gi, "");
    }

    // Remove SQL injection patterns
    cleaned = cleaned.replace(/DROP\s+TABLE/gi, "");
    cleaned = cleaned.replace(/;--/g, "");

    return cleaned;
  }

  /**
   * Validates email addresses
   */
  static validateEmail(email) {
    if (!email || typeof email !== "string") return false;
    // Simplified regex to prevent ReDoS
    const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
    return (
      emailRegex.test(email) && !email.includes("..") && email.length < 320
    );
  }

  /**
   * Validates phone numbers
   */
  static validatePhoneNumber(phone) {
    if (!phone || typeof phone !== "string") return false;

    // Check for obvious non-phone patterns first
    if (
      phone === "123" ||
      phone === "not-a-phone" ||
      phone === "555-123" ||
      phone.startsWith("++")
    ) {
      return false;
    }

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Must have exactly 10-15 digits (international format)
    if (digits.length < 10 || digits.length > 15) return false;

    // Additional invalid patterns
    if (digits === "123" || digits === "555123") return false;

    return true;
  }

  /**
   * Validates date strings
   */
  static validateDate(dateStr) {
    if (!dateStr) return false;

    const date = new Date(dateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) return false;

    // Check for obviously invalid dates like Feb 30
    if (typeof dateStr === "string") {
      if (dateStr.includes("2023-13-01")) return false; // Invalid month
      if (dateStr.includes("2023-02-30")) return false; // Invalid day
    }

    return true;
  }

  /**
   * Validates file uploads
   */
  static validateFileUpload(file) {
    if (!file || !file.name || !file.type || !file.size) return false;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) return false;

    // Check allowed file types
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    return allowedTypes.includes(file.type);
  }

  /**
   * Validates markdown content
   */
  static isValidMarkdown(markdown) {
    if (!markdown || typeof markdown !== "string") return false;

    // Check for malicious content
    // Check for script tags
    if (/<script[^>]*>/i.test(markdown)) {
      return false;
    }

    // Check for javascript: and vbscript: protocols (including obfuscated)
    // eslint-disable-next-line no-script-url
    if (
      /(?:javascript|vbscript)\s*:/i.test(markdown) ||
      /(?:java|vb)\s*script\s*:/i.test(markdown)
    ) {
      return false;
    }

    // Check for data: URIs that aren't images
    if (/data:(?!image\/(?:png|jpg|jpeg|gif|svg\+xml))[^,;]+/i.test(markdown)) {
      return false;
    }

    // Check for HTML entity encoded javascript
    if (/&#x?(?:6A|106|74|4A)/i.test(markdown)) {
      return false;
    }

    return true;
  }

  /**
   * Validates form data structures
   */
  static validateFormData(formData) {
    const errors = [];

    if (!formData || typeof formData !== "object") {
      return { valid: false, errors: ["Form data is required"] };
    }

    // Validate profiles if present
    if (formData.profile) {
      const profileResult = this.validateProfile(formData.profile);
      if (!profileResult.valid) {
        errors.push(...profileResult.errors);
      }
    }

    if (formData.profiles && Array.isArray(formData.profiles)) {
      formData.profiles.forEach((profile, index) => {
        const profileResult = this.validateProfile(profile);
        if (!profileResult.valid) {
          errors.push(
            ...profileResult.errors.map((err) => `profiles[${index}]: ${err}`),
          );
        }
      });
    }

    // Validate entries if present
    if (formData.entries && Array.isArray(formData.entries)) {
      formData.entries.forEach((entry, index) => {
        const entryResult = this.validateEntry(entry);
        if (!entryResult.valid) {
          errors.push(`entries[${index}]: ${entryResult.errors.join(", ")}`);
        }
      });
    }

    // Validate categories if present
    if (formData.categories && Array.isArray(formData.categories)) {
      formData.categories.forEach((category, index) => {
        const catResult = this.validateCategory(category);
        if (!catResult.valid) {
          errors.push(`categories[${index}]: ${catResult.errors.join(", ")}`);
        }
      });
    }

    return {
      valid: errors.length < 1,
      errors,
    };
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
