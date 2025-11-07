/**
 * Feature Flags for Manylla
 * Controls feature rollout and allows safe disabling if issues arise
 */

// Feature flags configuration
const FEATURE_FLAGS = {
  // File Attachments Feature
  ENABLE_FILE_ATTACHMENTS: true, // Set to false to disable file attachments
  FILE_MAX_SIZE_MB: 50, // Maximum file size in MB
  FILE_MAX_COUNT_PER_ENTRY: 10, // Maximum files per entry
  STORAGE_QUOTA_MB: 500, // Total storage quota per user in MB

  // File type restrictions
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif'
  ],

  // Upload behavior
  CHUNKED_UPLOAD_SIZE_MB: 1, // Size of each upload chunk
  UPLOAD_RETRY_ATTEMPTS: 3, // Number of retry attempts for failed uploads
  UPLOAD_TIMEOUT_SECONDS: 300, // Upload timeout (5 minutes)

  // Cache settings
  FILE_CACHE_DURATION_MINUTES: 5, // How long to cache downloaded files

  // UI settings
  SHOW_UPLOAD_PROGRESS: true, // Show upload progress indicator
  ALLOW_DRAG_DROP: true, // Enable drag-drop on web

  // Debug settings
  LOG_FILE_OPERATIONS: false, // Log file operations for debugging
  SIMULATE_UPLOAD_ERRORS: false, // For testing error handling
};

// Server-side feature flags cache
let serverFlags = null;
let serverFlagsTimestamp = null;
const SERVER_FLAGS_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a feature is enabled
 * @param {string} feature - Feature flag name
 * @returns {boolean} Whether feature is enabled
 */
export function isFeatureEnabled(feature) {
  // Check local flag first
  const localFlag = FEATURE_FLAGS[feature];

  // For critical features, also check server flag if available
  if (feature === 'ENABLE_FILE_ATTACHMENTS' && serverFlags) {
    return localFlag && serverFlags[feature] !== false;
  }

  return localFlag === true;
}

/**
 * Get feature configuration value
 * @param {string} feature - Feature flag name
 * @returns {any} Feature configuration value
 */
export function getFeatureConfig(feature) {
  return FEATURE_FLAGS[feature];
}

/**
 * Check server-side feature flags
 * @param {string} feature - Feature to check
 * @returns {Promise<boolean>} Whether feature is enabled on server
 */
export async function checkServerFeatureFlag(feature) {
  try {
    // Check cache first
    if (serverFlags && serverFlagsTimestamp) {
      const age = Date.now() - serverFlagsTimestamp;
      if (age < SERVER_FLAGS_TTL) {
        return serverFlags[feature] !== false;
      }
    }

    // Fetch from server
    const response = await fetch('https://manylla.com/qual/api/feature_flags.php', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      serverFlags = await response.json();
      serverFlagsTimestamp = Date.now();
      return serverFlags[feature] !== false;
    }
  } catch (error) {
    // Fail open - if we can't check server, use local flag
    // Silent failure to avoid console logs in production
  }

  // Fallback to local flag
  return isFeatureEnabled(feature);
}

/**
 * Get all feature flags
 * @returns {Object} All feature flags
 */
export function getAllFeatureFlags() {
  return { ...FEATURE_FLAGS };
}

/**
 * Update a feature flag (for testing only)
 * @param {string} feature - Feature flag name
 * @param {any} value - New value
 */
export function setFeatureFlag(feature, value) {
  if (process.env.NODE_ENV !== 'production') {
    FEATURE_FLAGS[feature] = value;
  }
}

/**
 * Reset all feature flags to defaults
 */
export function resetFeatureFlags() {
  if (process.env.NODE_ENV !== 'production') {
    Object.assign(FEATURE_FLAGS, getAllFeatureFlags());
  }
}

/**
 * Check if file attachments feature is available
 * @returns {boolean} Whether file attachments can be used
 */
export function canUseFileAttachments() {
  return isFeatureEnabled('ENABLE_FILE_ATTACHMENTS');
}

/**
 * Get file upload limits
 * @returns {Object} Upload limits configuration
 */
export function getFileUploadLimits() {
  return {
    maxSizeMB: getFeatureConfig('FILE_MAX_SIZE_MB'),
    maxSizeBytes: getFeatureConfig('FILE_MAX_SIZE_MB') * 1024 * 1024,
    maxFiles: getFeatureConfig('FILE_MAX_COUNT_PER_ENTRY'),
    quotaMB: getFeatureConfig('STORAGE_QUOTA_MB'),
    quotaBytes: getFeatureConfig('STORAGE_QUOTA_MB') * 1024 * 1024,
    allowedTypes: getFeatureConfig('ALLOWED_FILE_TYPES'),
    chunkSizeBytes: getFeatureConfig('CHUNKED_UPLOAD_SIZE_MB') * 1024 * 1024
  };
}

/**
 * Should show file attachment UI
 * @returns {boolean} Whether to show file UI
 */
export function shouldShowFileUI() {
  return canUseFileAttachments() && !getFeatureConfig('SIMULATE_UPLOAD_ERRORS');
}

/**
 * Log file operation if debugging enabled
 * @param {string} operation - Operation name
 * @param {any} data - Data to log
 */
export function logFileOperation(operation, data) {
  // Logging disabled for production
  // Enable LOG_FILE_OPERATIONS flag and uncomment below for debugging
  // if (getFeatureConfig('LOG_FILE_OPERATIONS')) {
  //   console.log(`[FileOp] ${operation}:`, data);
  // }
}

// Export default flags
export default FEATURE_FLAGS;