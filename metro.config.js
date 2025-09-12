const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

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
  resolver: {
    extraNodeModules: {
      // Platform-specific imports handled via relative paths (migration completed 2025-09-12)
      "@utils": path.resolve(__dirname, "src/utils"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@services": path.resolve(__dirname, "src/services"),
      "@context": path.resolve(__dirname, "src/context"),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
