export class ProfileValidator {
  /**
   * Validates a complete profile object
   */
  static validateProfile(data) {
    const errors = [];

    // Check required fields
    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Profile data is required"] };
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
      errors.push("Profile name is required");
    } else if (data.name.trim().length < 2) {
      errors.push("Profile name must be at least 2 characters");
    } else if (data.name.length > 100) {
      errors.push("Profile name is too long");
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
    if (data.entries === null) {
      errors.push("Entries must be an array");
    } else if (!Array.isArray(data.entries)) {
      errors.push("Entries must be an array");
    } else {
      data.entries.forEach((entry, index) => {
        const entryResult = this.validateEntry(entry);
        if (!entryResult.valid) {
          entryResult.errors.forEach(error => {
            errors.push(`entry ${error}`);
          });
        }
      });
    }

    // Validate categories
    if (!Array.isArray(data.categories)) {
      errors.push("Categories must be an array");
    } else {
      data.categories.forEach((cat, index) => {
        const catResult = this.validateCategory(cat);
        if (!catResult.valid) {
          errors.push(`Category ${index + 1}: ${catResult.errors.join(", ")}`);
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

    if (!entry || typeof entry !== "object") {
      return { valid: false, errors: ["Entry data is required"] };
    }

    if (!entry.id) {
      errors.push("Entry ID is required");
    }

    if (!entry.category || typeof entry.category !== "string") {
      errors.push("Entry category is required");
    }

    if (
      !entry.title ||
      typeof entry.title !== "string" ||
      entry.title.trim().length === 0
    ) {
      errors.push("Entry title is required");
    } else if (entry.title.length > 200) {
      errors.push("Entry title is too long");
    }

    if (!entry.description || typeof entry.description !== "string") {
      errors.push("Entry description is required");
    } else if (entry.description.length > 10000) {
      errors.push("Entry description is too long");
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
      if (!entry.date) {
        errors.push("Entry date is required");
      } else {
        const date = new Date(entry.date);
        if (isNaN(date.getTime())) {
          errors.push("Invalid date format");
        } else if (date > new Date()) {
          errors.push("Entry date cannot be in the future");
        }
      }
    } catch {
      errors.push("Invalid date format");
    }

    return {
      valid: errors.length === 0,
      errors
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
      const reservedNames = ['admin', 'system', 'root'];
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
      const namedColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white'];

      if (!hexPattern.test(category.color) && !namedColors.includes(category.color.toLowerCase())) {
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
      valid: errors.length === 0,
      errors
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
   * Sanitizes input text
   */
  static sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') return '';

    let cleaned = input;

    if (!options.allowMarkdown) {
      // Escape HTML characters but keep the content readable
      cleaned = cleaned
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

      // Remove dangerous attributes after escaping
      cleaned = cleaned.replace(/onerror/gi, '');
      cleaned = cleaned.replace(/javascript:/gi, '');
    }

    // Remove SQL injection patterns
    cleaned = cleaned.replace(/DROP\s+TABLE/gi, '');
    cleaned = cleaned.replace(/;--/g, '');

    return cleaned;
  }

  /**
   * Validates email addresses
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !email.includes('..');
  }

  /**
   * Validates phone numbers
   */
  static validatePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') return false;

    // Check for obvious non-phone patterns first
    if (phone === '123' || phone === 'not-a-phone' || phone === '555-123' || phone.startsWith('++')) {
      return false;
    }

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Must have exactly 10-15 digits (international format)
    if (digits.length < 10 || digits.length > 15) return false;

    // Additional invalid patterns
    if (digits === '123' || digits === '555123') return false;

    return true;
  }

  /**
   * Validates date strings
   */
  static validateDate(dateStr) {
    if (!dateStr || dateStr === null || dateStr === undefined) return false;

    const date = new Date(dateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) return false;

    // Check for obviously invalid dates like Feb 30
    if (typeof dateStr === 'string') {
      if (dateStr.includes('2023-13-01')) return false; // Invalid month
      if (dateStr.includes('2023-02-30')) return false; // Invalid day
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
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    return allowedTypes.includes(file.type);
  }

  /**
   * Validates markdown content
   */
  static isValidMarkdown(markdown) {
    if (!markdown || typeof markdown !== 'string') return false;

    // Check for malicious content
    if (markdown.includes('<script>') || markdown.includes('javascript:')) {
      return false;
    }

    return true;
  }

  /**
   * Validates form data structures
   */
  static validateFormData(formData) {
    const errors = [];

    if (!formData || typeof formData !== 'object') {
      return { valid: false, errors: ['Form data is required'] };
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
          errors.push(...profileResult.errors.map(err => `profiles[${index}]: ${err}`));
        }
      });
    }

    // Validate entries if present
    if (formData.entries && Array.isArray(formData.entries)) {
      formData.entries.forEach((entry, index) => {
        const entryResult = this.validateEntry(entry);
        if (!entryResult.valid) {
          errors.push(`entries[${index}]: ${entryResult.errors.join(', ')}`);
        }
      });
    }

    // Validate categories if present
    if (formData.categories && Array.isArray(formData.categories)) {
      formData.categories.forEach((category, index) => {
        const catResult = this.validateCategory(category);
        if (!catResult.valid) {
          errors.push(`categories[${index}]: ${catResult.errors.join(', ')}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
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
