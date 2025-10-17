/**
 * Build Configuration Module
 * Provides runtime access to BUILD_TYPE_ENV and tier-specific settings
 * Supports both mobile (iOS/Android) and web platforms
 */

// Detect platform - check if react-native Platform API is available
let Platform = null;
let NativeModules = null;
let isMobile = false;

try {
  // Try to import React Native modules (only available on mobile)
  const ReactNative = require('react-native');
  Platform = ReactNative.Platform;
  NativeModules = ReactNative.NativeModules;
  isMobile = Platform && (Platform.OS === 'ios' || Platform.OS === 'android');
} catch (e) {
  // Not a mobile platform, continue with web configuration
  isMobile = false;
}

// Initialize configuration variables with defaults
let BUILD_TYPE_ENV = 'qual';
let API_ENDPOINT_ENV = 'https://manylla.com/qual/api';
let BUNDLE_ID_ENV = 'com.manylla.qual';
let ENV_NAME_ENV = 'QUAL';
let PUBLIC_URL_ENV = '/manylla/qual';

if (isMobile) {
  // Mobile: Get BUILD_TYPE from native module
  try {
    const { BuildConfigModule } = NativeModules;
    if (BuildConfigModule && BuildConfigModule.BUILD_TYPE) {
      BUILD_TYPE_ENV = BuildConfigModule.BUILD_TYPE;
      API_ENDPOINT_ENV = BuildConfigModule.API_ENDPOINT || 'https://manylla.com/qual/api';
      BUNDLE_ID_ENV = BuildConfigModule.BUNDLE_ID || 'com.manylla.qual';
      ENV_NAME_ENV = BUILD_TYPE_ENV.toUpperCase();
    } else {
      console.warn('[BuildConfig] BuildConfigModule not found or incomplete, using default QUAL config');
    }
  } catch (error) {
    console.warn('[BuildConfig] Error reading BuildConfigModule:', error.message);
  }
} else {
  // Web: Get BUILD_TYPE from process.env (set by Webpack at build time)
  BUILD_TYPE_ENV = process.env.REACT_APP_BUILD_TYPE || 'qual';
  API_ENDPOINT_ENV = process.env.REACT_APP_API_ENDPOINT || 'https://manylla.com/qual/api';
  ENV_NAME_ENV = process.env.REACT_APP_ENV_NAME || 'QUAL';
  PUBLIC_URL_ENV = process.env.PUBLIC_URL || '/manylla/qual';
  BUNDLE_ID_ENV = 'com.manylla.web';
}

export const BUILD_TYPE = BUILD_TYPE_ENV;
export const API_ENDPOINT = API_ENDPOINT_ENV;
export const BUNDLE_ID = BUNDLE_ID_ENV;
export const ENV_NAME = ENV_NAME_ENV;
export const PUBLIC_URL = PUBLIC_URL_ENV;

// Type-safe tier detection
export const isQual = BUILD_TYPE === 'qual';
export const isStage = BUILD_TYPE === 'stage';
export const isBeta = BUILD_TYPE === 'beta';
export const isProd = BUILD_TYPE === 'prod';

// Platform detection
export const isMobilePlatform = isMobile;
export const isWebPlatform = !isMobile;
export const isIOS = isMobile && Platform && Platform.OS === 'ios';
export const isAndroid = isMobile && Platform && Platform.OS === 'android';

// Log build configuration on app start (only in non-prod environments)
if (!isProd) {
  const platformName = isMobile ? (isIOS ? 'iOS' : 'Android') : 'Web';
  console.log('=== Manylla Build Configuration ===');
  console.log('Platform:', platformName);
  console.log('BUILD_TYPE:', BUILD_TYPE);
  console.log('API_ENDPOINT:', API_ENDPOINT);
  console.log('BUNDLE_ID:', BUNDLE_ID);
  console.log('ENV_NAME:', ENV_NAME);
  if (!isMobile) {
    console.log('PUBLIC_URL:', PUBLIC_URL);
  }
  console.log('===================================');
}

// Export all as default for convenience
export default {
  BUILD_TYPE,
  API_ENDPOINT,
  BUNDLE_ID,
  ENV_NAME,
  PUBLIC_URL,
  isQual,
  isStage,
  isBeta,
  isProd,
  isMobilePlatform,
  isWebPlatform,
  isIOS,
  isAndroid,
};
