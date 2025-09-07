const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration - Following StackMap's simple approach
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Reset cache on startup
  resetCache: true,
  // Watch for file changes
  watchFolders: [__dirname],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);