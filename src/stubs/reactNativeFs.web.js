/**
 * Web stub for react-native-fs
 * File system operations are not supported in web build
 */

export default {
  // Add stubs for any functions that might be called
  writeFile: () => Promise.reject(new Error('File system operations not supported in web')),
  readFile: () => Promise.reject(new Error('File system operations not supported in web')),
  unlink: () => Promise.reject(new Error('File system operations not supported in web')),
};
