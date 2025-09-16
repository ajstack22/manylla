/**
 * SecureRandomService - Cryptographically Secure Random Number Generation
 *
 * Provides secure random number generation across all platforms:
 * - Web: Uses crypto.getRandomValues() (Web Crypto API)
 * - React Native: Uses react-native-get-random-values polyfill
 *
 * Replaces all insecure Math.random() usage with cryptographically secure alternatives.
 */

import platform from "./platform";

// Import the polyfill for React Native
// On web, webpack will alias this to our web polyfill
if (platform.isMobile) {
  try {
    require("react-native-get-random-values");
  } catch (error) {
    // Silently ignore if module not available
  }
}

class SecureRandomService {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Check if secure random is available on this platform
   */
  checkAvailability() {
    if (platform.isWeb) {
      return (
        typeof crypto !== "undefined" &&
        typeof crypto.getRandomValues === "function"
      );
    }

    if (platform.isMobile) {
      // Check if react-native-get-random-values polyfill loaded crypto
      return (
        typeof global.crypto !== "undefined" &&
        typeof global.crypto.getRandomValues === "function"
      );
    }

    return false;
  }

  /**
   * Generate secure random bytes
   * @param {number} length - Number of bytes to generate
   * @returns {Uint8Array} Array of random bytes
   */
  getRandomBytes(length) {
    if (!this.isAvailable) {
      throw new Error(
        "Secure random generation not available on this platform",
      );
    }

    const array = new Uint8Array(length);

    if (platform.isWeb) {
      crypto.getRandomValues(array);
    } else if (platform.isMobile) {
      global.crypto.getRandomValues(array);
    } else {
      throw new Error("Unsupported platform for secure random generation");
    }

    return array;
  }

  /**
   * Generate a secure random integer between 0 (inclusive) and max (exclusive)
   * @param {number} max - Maximum value (exclusive)
   * @returns {number} Secure random integer
   */
  getRandomInt(max) {
    if (max <= 0 || !Number.isInteger(max)) {
      throw new Error("Max must be a positive integer");
    }

    // Use rejection sampling to avoid modulo bias
    const bytesNeeded = Math.ceil(Math.log2(max) / 8);
    const maxValidValue = Math.floor(256 ** bytesNeeded / max) * max;

    let randomValue;
    do {
      const randomBytes = this.getRandomBytes(bytesNeeded);
      randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = (randomValue << 8) + randomBytes[i];
      }
    } while (randomValue >= maxValidValue);

    return randomValue % max;
  }

  /**
   * Generate a secure random float between 0 (inclusive) and 1 (exclusive)
   * Replacement for Math.random()
   * @returns {number} Secure random float
   */
  getRandomFloat() {
    // Use 32 bits of entropy for float generation
    const randomBytes = this.getRandomBytes(4);

    // Convert to 32-bit unsigned integer
    let randomInt = 0;
    for (let i = 0; i < 4; i++) {
      randomInt = (randomInt << 8) + randomBytes[i];
    }

    // Convert to float between 0 and 1
    // Use >>> 0 to ensure unsigned interpretation
    return (randomInt >>> 0) / 2 ** 32;
  }

  /**
   * Generate a secure random hex string
   * @param {number} length - Length of hex string (must be even)
   * @returns {string} Hex string
   */
  getRandomHex(length) {
    if (length % 2 !== 0) {
      throw new Error("Hex string length must be even");
    }

    const bytes = this.getRandomBytes(length / 2);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Generate a secure random string from a character set
   * @param {string} charset - Characters to choose from
   * @param {number} length - Length of string to generate
   * @returns {string} Random string
   */
  getRandomString(charset, length) {
    if (!charset || charset.length === 0) {
      throw new Error("Charset cannot be empty");
    }

    if (length <= 0) {
      throw new Error("Length must be positive");
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = this.getRandomInt(charset.length);
      result += charset[randomIndex];
    }

    return result;
  }

  /**
   * Generate a secure random alphanumeric string
   * @param {number} length - Length of string
   * @param {Object} options - Options object
   * @param {boolean} options.uppercase - Include uppercase letters
   * @param {boolean} options.lowercase - Include lowercase letters
   * @param {boolean} options.numbers - Include numbers
   * @param {string} options.exclude - Characters to exclude
   * @returns {string} Random alphanumeric string
   */
  getRandomAlphanumeric(length, options = {}) {
    const defaults = {
      uppercase: true,
      lowercase: true,
      numbers: true,
      exclude: "",
    };

    const opts = { ...defaults, ...options };

    let charset = "";
    if (opts.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (opts.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (opts.numbers) charset += "0123456789";

    // Remove excluded characters
    if (opts.exclude) {
      for (const char of opts.exclude) {
        charset = charset.replace(new RegExp(char, "g"), "");
      }
    }

    if (charset.length === 0) {
      throw new Error("Charset is empty after applying options");
    }

    return this.getRandomString(charset, length);
  }

  /**
   * Generate a secure device ID
   * @returns {string} 16-character hex device ID
   */
  generateDeviceId() {
    return this.getRandomHex(16);
  }

  /**
   * Generate a secure timestamp-based ID (for compatibility with existing fallbacks)
   * @returns {string} Secure timestamp-based ID
   */
  generateTimestampId() {
    const timestamp = Date.now().toString(36);
    const randomPart = this.getRandomAlphanumeric(9, {
      lowercase: true,
      numbers: true,
      uppercase: false,
    });
    return timestamp + randomPart;
  }

  /**
   * Check if this service is working correctly
   * @returns {boolean} True if secure random is functioning
   */
  selfTest() {
    try {
      // Test basic functionality
      const bytes = this.getRandomBytes(16);
      const int = this.getRandomInt(100);
      const float = this.getRandomFloat();
      const hex = this.getRandomHex(8);
      const string = this.getRandomString("ABC", 5);

      // Basic validation
      return (
        bytes.length === 16 &&
        int >= 0 &&
        int < 100 &&
        float >= 0 &&
        float < 1 &&
        hex.length === 8 &&
        string.length === 5
      );
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const secureRandomService = new SecureRandomService();

// Export both the class and singleton
export { SecureRandomService };
export default secureRandomService;
