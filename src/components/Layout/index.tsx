import { Platform } from "react-native";

export const Header =
  Platform.OS === "web"
    ? require("./Header.tsx").Header
    : require("./Header.native.tsx").Header;

export const HEADER_HEIGHT =
  Platform.OS === "web"
    ? require("./Header.tsx").HEADER_HEIGHT
    : require("./Header.native.tsx").HEADER_HEIGHT;
