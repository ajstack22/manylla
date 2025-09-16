/**
 * Web polyfill for react-native-get-random-values
 *
 * This file provides a no-op polyfill for web builds since
 * the Web Crypto API is already available in browsers.
 *
 * The actual crypto.getRandomValues is available natively in browsers,
 * so we don't need to polyfill it. This file exists only to satisfy
 * webpack's module resolution when building for web.
 */

// Web browsers already have crypto.getRandomValues available
// This is just an empty module to prevent webpack warnings

export default {};