// Polyfill for react-native-get-random-values on web
// Web browsers already have crypto.getRandomValues, so this is a no-op

if (typeof window !== "undefined" && !window.crypto) {
  // Fallback for older browsers
  window.crypto = window.msCrypto;
}

export default {};
