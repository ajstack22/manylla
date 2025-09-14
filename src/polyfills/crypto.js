// Crypto polyfill for React Native
// Ensures crypto.getRandomValues is available for nacl

import platform from "../utils/platform";

// React Native needs the polyfill
// Web already has crypto.getRandomValues built-in
if (platform.isMobile) {
  // Import is handled in index.js for React Native
  // This file is kept for backwards compatibility
}

// Verify crypto is available
if (typeof global !== "undefined" && !global.crypto) {
  // Fallback for environments missing crypto
  if (platform.isMobile) {
  }
}
