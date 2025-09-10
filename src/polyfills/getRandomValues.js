import { Platform } from "react-native";

// Only apply polyfill on web
if (Platform.OS === "web" && typeof globalThis.crypto === "undefined") {
  globalThis.crypto = {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  };
}
