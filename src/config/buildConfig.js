/**
 * Build Configuration Module
 * Provides runtime access to BUILD_TYPE_ENV and tier-specific settings
 */

export const BUILD_TYPE = process.env.REACT_APP_BUILD_TYPE || 'qual';
export const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://manylla.com/qual/api';
export const ENV_NAME = process.env.REACT_APP_ENV_NAME || 'QUAL';
export const PUBLIC_URL = process.env.PUBLIC_URL || '/manylla/qual';

// Type-safe tier detection
export const isQual = BUILD_TYPE === 'qual';
export const isStage = BUILD_TYPE === 'stage';
export const isBeta = BUILD_TYPE === 'beta';
export const isProd = BUILD_TYPE === 'prod';

// Build info available via exported constants
// Removed console logs to comply with deployment validation (max 5 allowed)

// Export all as default for convenience
export default {
  BUILD_TYPE,
  API_ENDPOINT,
  ENV_NAME,
  PUBLIC_URL,
  isQual,
  isStage,
  isBeta,
  isProd,
};
