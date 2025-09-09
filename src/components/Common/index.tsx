import { Platform } from "react-native";

export const LoadingSpinner =
  Platform.OS === "web"
    ? require("./LoadingSpinner").LoadingSpinner
    : require("./LoadingSpinner.native").LoadingSpinner;

export const LoadingOverlay =
  Platform.OS === "web"
    ? require("./LoadingOverlay").LoadingOverlay
    : require("./LoadingOverlay.native").LoadingOverlay;

export const ThemedToast =
  Platform.OS === "web"
    ? require("./ThemedToast").ThemedToast
    : require("./ThemedToast.native").ThemedToast;

export const ErrorBoundary =
  Platform.OS === "web"
    ? require("./ErrorBoundary").ErrorBoundary
    : require("./ErrorBoundary").ErrorBoundary; // Uses Platform.OS internally

export const HighlightedText =
  Platform.OS === "web"
    ? require("./HighlightedText").HighlightedText
    : require("./HighlightedText").HighlightedText; // Uses Platform.OS internally
