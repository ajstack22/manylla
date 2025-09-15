// Type definitions for ChildProfile and related data structures
// These are JavaScript objects with JSDoc comments for type hints

/**
 * Entry type definition
 * @typedef {Object} Entry
 * @property {string} id
 * @property {string} category - Now flexible for custom categories
 * @property {string} title
 * @property {string} description
 * @property {Date} date
 * @property {Date} [updatedAt] - Optional field for tracking last modification
 * @property {string[]} [attachments]
 * @property {string[]} [visibility] - Array of visibility options ['family', 'medical', 'education'] or ['all'] or ['private']
 */

/**
 * CategoryConfig type definition
 * @typedef {Object} CategoryConfig
 * @property {string} id
 * @property {string} name
 * @property {string} displayName
 * @property {string} [icon]
 * @property {string} color
 * @property {number} order
 * @property {boolean} isVisible
 * @property {boolean} isCustom
 * @property {boolean} [isQuickInfo] - Categories that were formerly Quick Info panels
 */

/**
 * QuickInfoConfig type definition
 * @typedef {Object} QuickInfoConfig
 * @property {string} id
 * @property {string} name
 * @property {string} displayName
 * @property {string} value - Will be migrated to entries
 * @property {number} order
 * @property {boolean} isVisible
 * @property {boolean} isCustom
 */

/**
 * ChildProfile type definition
 * @typedef {Object} ChildProfile
 * @property {string} id
 * @property {string} name
 * @property {string} [dateOfBirth]
 * @property {string} [photo]
 * @property {Entry[]} entries
 * @property {CategoryConfig[]} categories
 * @property {QuickInfoConfig[]} [quickInfo] - Legacy, will be migrated to entries
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {string} [school]
 * @property {string} [teacher]
 * @property {string} [grade]
 * @property {string} [emergencyContact]
 * @property {string[]} [allergies]
 * @property {string[]} [medications]
 * @property {string[]} [diagnoses]
 * @property {string[]} [therapists]
 * @property {Object} [preferences]
 */

// Export empty objects to maintain compatibility with imports
export const Entry = {};
export const CategoryConfig = {};
export const QuickInfoConfig = {};
export const ChildProfile = {};

// Helper functions for type validation
export const isEntry = (obj) => {
  return !!(
    obj &&
    typeof obj.id === "string" &&
    typeof obj.category === "string"
  );
};

export const isCategoryConfig = (obj) => {
  return !!(obj && typeof obj.id === "string" && typeof obj.name === "string");
};

export const isChildProfile = (obj) => {
  return !!(
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    Array.isArray(obj.entries)
  );
};
