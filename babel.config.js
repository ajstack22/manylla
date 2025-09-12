module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        alias: {
          // Platform-specific imports handled via relative paths (migration completed 2025-09-12)
          "@": "./src",
          "@components": "./src/components",
          "@screens": "./src/screens",
          "@services": "./src/services",
          "@navigation": "./src/navigation",
          "@utils": "./src/utils",
          "@hooks": "./src/hooks",
          "@types": "./src/types",
          "@constants": "./src/constants",
          "@context": "./src/context",
        },
      },
    ],
    "react-native-reanimated/plugin", // Must be last
  ],
};
