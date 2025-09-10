import { Platform } from "react-native";

// Only apply polyfill on web
if (Platform.OS === "web" && typeof global.crypto === "undefined") {
  global.crypto = {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  };
}
