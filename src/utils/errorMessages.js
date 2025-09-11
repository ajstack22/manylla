/**
 * Centralized Error Messages for Manylla
 * User-friendly, actionable error messages organized by category
 */

export const ErrorMessages = {
  NETWORK_ERROR: {
    timeout: "Request timed out. Please try again.",
    offline: "You appear to be offline. Changes saved locally.",
    serverError: "Server issue. Please try again later.",
    connectionLost: "Connection lost. Reconnecting...",
    slowConnection:
      "Slow connection detected. This may take longer than usual.",
    default: "Connection problem. Please check your internet.",
  },

  VALIDATION_ERROR: {
    required: (field) => `${field} is required`,
    tooLong: (field, max) => `${field} must be less than ${max} characters`,
    tooShort: (field, min) => `${field} must be at least ${min} characters`,
    invalidFormat: (field) => `${field} format is invalid`,
    duplicateName: "A profile with this name already exists",
    invalidDate: "Please enter a valid date",
    futureDate: "Date cannot be in the future",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone number",
    invalidUrl: "Please enter a valid URL",
  },

  SYNC_ERROR: {
    conflict: "Sync conflict detected. Resolving automatically...",
    quotaExceeded: "Storage limit reached. Please remove old data.",
    invalidCode: "Invalid sync code. Please check and try again.",
    versionMismatch: "App update required for sync to work.",
    syncInProgress: "Sync already in progress. Please wait...",
    syncFailed: "Sync failed. Your data is safe locally.",
    noConnection: "Cannot sync offline. Will retry when connected.",
    corruptedData: "Sync data corrupted. Please re-enable sync.",
  },

  STORAGE_ERROR: {
    quotaExceeded: "Device storage full. Please free up space.",
    corrupted: "Data corrupted. Attempting recovery...",
    migrationFailed: "Update failed. Please reinstall the app.",
    saveInProgress: "Save already in progress. Please wait...",
    loadFailed: "Failed to load data. Please refresh.",
    backupFailed: "Backup failed. Your current data is safe.",
    restoreFailed: "Restore failed. Original data unchanged.",
  },

  PROFILE_ERROR: {
    notFound: "Profile not found. It may have been deleted.",
    createFailed: "Failed to create profile. Please try again.",
    updateFailed: "Failed to update profile. Please try again.",
    deleteFailed: "Failed to delete profile. Please try again.",
    duplicateProfile: "A profile with this name already exists.",
    maxProfiles: "Maximum number of profiles reached.",
    emptyName: "Profile name cannot be empty.",
  },

  ENTRY_ERROR: {
    notFound: "Entry not found. It may have been deleted.",
    createFailed: "Failed to create entry. Please try again.",
    updateFailed: "Failed to update entry. Please try again.",
    deleteFailed: "Failed to delete entry. Please try again.",
    attachmentTooLarge: "Attachment too large. Maximum size is 10MB.",
    invalidAttachment: "Invalid attachment type.",
  },

  SHARE_ERROR: {
    createFailed: "Failed to create share link. Please try again.",
    expired: "This share link has expired.",
    notFound: "Share link not found or has been deleted.",
    accessDenied: "You do not have permission to access this share.",
    quotaExceeded: "Share limit reached. Please delete old shares.",
  },

  PRINT_ERROR: {
    unavailable: "Print service unavailable. Please try again.",
    preparing: "Preparing document for printing...",
    failed: "Print failed. Please check your printer.",
    cancelled: "Print cancelled.",
  },

  GENERAL: {
    unexpected: "An unexpected error occurred. Please try again.",
    tryAgain: "Please try again.",
    contactSupport: "If this continues, please contact support.",
    refreshPage: "Please refresh the page and try again.",
    reportSent: "Error report sent. Thank you for your patience.",
    recovered: "Error recovered. You may continue.",
    retrying: "Retrying...",
    actionFailed: (action) => `Failed to ${action}. Please try again.`,
  },
};

/**
 * Helper to get nested error messages safely
 */
export const getErrorMessage = (category, key, ...params) => {
  const categoryMessages = ErrorMessages[category];
  if (!categoryMessages) {
    return ErrorMessages.GENERAL.unexpected;
  }

  const message = categoryMessages[key];
  if (!message) {
    return categoryMessages.default || ErrorMessages.GENERAL.unexpected;
  }

  // If message is a function, call it with parameters
  if (typeof message === "function") {
    return message(...params);
  }

  return message;
};

/**
 * Format field names for user-friendly display
 */
export const formatFieldName = (field) => {
  // Convert camelCase to Title Case
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
