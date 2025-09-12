module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        alias: {
          "@platform": "./src/utils/platform",
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
