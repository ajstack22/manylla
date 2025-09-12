// Crypto polyfill for web platform
// Only loads react-native-get-random-values on native platforms

import platform from "../utils/platform";

if (platform.isMobile) {
  // Only import on native platforms
  try {
    // Use eval to prevent webpack from analyzing this require
    eval("require")("react-native-get-random-values");
  } catch (e) {}
}

// Web already has crypto.getRandomValues
