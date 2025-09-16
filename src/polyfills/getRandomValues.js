import platform from "../utils/platform";

// Only apply polyfill on web
if (platform.isWeb && typeof global.crypto === "undefined") {
  // Use a more secure approach with Node.js crypto module if available
  let nodeRandomBytes = null;

  try {
    // Try to use Node.js crypto in web environments that support it
    nodeRandomBytes = require('crypto').randomBytes;
  } catch (e) {
    // Not available, will use Math.random as last resort
  }

  global.crypto = {
    getRandomValues: (array) => {
      if (nodeRandomBytes) {
        // Use Node.js crypto if available
        const bytes = nodeRandomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
          array[i] = bytes[i];
        }
      } else {
        // Fallback to Math.random with warning
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using Math.random() as crypto fallback - not cryptographically secure!');
        }
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }
      return array;
    },
  };
}
