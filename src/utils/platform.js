import { Platform } from 'react-native';

/**
 * Platform utility module for unified platform detection and selection
 * This module provides a cleaner API for platform-specific logic
 */

// Platform detection helpers
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = Platform.OS !== 'web';

// Platform selection helper (re-export for compatibility)
export const select = Platform.select;

// Default export for @platform import
const platform = {
  isWeb,
  isIOS,
  isAndroid,
  isMobile,
  select: Platform.select,
  OS: Platform.OS,
};

export default platform;