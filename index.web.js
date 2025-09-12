import { AppRegistry } from "react-native";
import { isWeb } from "./src/utils/platform";
import App from "./App";

// Capture share data immediately on web
if (isWeb && window.__earlyShareData) {
  console.log(
    "[index.web.js] Using immediately captured share data:",
    window.__earlyShareData,
  );
  window.shareDataImmediate = {
    shareId: window.__earlyShareData.shareId,
    encryptionKey: window.__earlyShareData.encryptionKey,
  };
}

// Disable useNativeDriver warnings on web
if (isWeb) {
  // Store the original console methods
  const originalWarn = console.warn;

  // In production, disable all console outputs except errors
  if (process.env.NODE_ENV === "production") {
    // Disable console logging in production
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.warn = (...args) => {
      // Only log actual warnings, not React Native compatibility warnings
      const warningString = args.join(" ");
      if (
        !warningString.includes("useNativeDriver") &&
        !warningString.includes("Animated:") &&
        !warningString.includes("ReactNative")
      ) {
        originalWarn(...args);
      }
    };
  } else {
    // In development, filter out specific warnings
    console.warn = (...args) => {
      const warningString = args.join(" ");
      if (
        !warningString.includes("useNativeDriver") &&
        !warningString.includes("Animated:")
      ) {
        originalWarn(...args);
      }
    };
  }
}

// Register the app
AppRegistry.registerComponent("manylla", () => App);

// Run the app on web
const rootTag =
  document.getElementById("root") || document.getElementById("app");
if (rootTag) {
  AppRegistry.runApplication("manylla", { rootTag });
}
