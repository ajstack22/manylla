import { Platform, StatusBar, Dimensions } from "react-native";

// Typography helpers
export const getFontFamily = (weight) => {
  if (Platform.OS === "android") {
    // Android can't use fontWeight, needs font variants
    if (weight === "bold" || weight === "700" || weight === "600") {
      return "System"; // Will use system bold variant
    }
    return "System"; // Will use system regular
  }
  return "System"; // iOS/Web use fontWeight
};

export const getTextStyle = (variant, weight) => {
  const baseStyle = {
    fontFamily: getFontFamily(weight),
  };

  // Only add fontWeight for non-Android
  if (Platform.OS !== "android" && weight) {
    baseStyle.fontWeight = weight;
  }

  // Force black text on Android TextInputs
  if (Platform.OS === "android" && variant === "input") {
    baseStyle.color = "#000000";
  }

  return baseStyle;
};

// Layout helpers
export const isTablet = () => {
  const { width, height } = Dimensions.get("window");
  const aspectRatio = width / height;
  const minDimension = Math.min(width, height);

  if (Platform.OS === "android") {
    // Android tablet detection
    return minDimension >= 600 && aspectRatio > 1.2;
  }

  // iOS tablet detection
  return minDimension >= 768;
};

export const getNumColumns = () => {
  const { width } = Dimensions.get("window");
  if (isTablet() && width >= 768) {
    return 2;
  }
  return 1;
};

export const getCardWidth = (numColumns = 1) => {
  if (Platform.OS === "android") {
    // Android FlexWrap needs percentage widths
    return numColumns === 2 ? "48%" : "100%";
  }
  // iOS can use calculated widths
  const { width } = Dimensions.get("window");
  const padding = 16;
  const gap = 8;
  return (width - padding * 2 - gap * (numColumns - 1)) / numColumns;
};

// Touch gesture helpers
export const getSwipeThreshold = () => {
  const { width: screenWidth } = Dimensions.get("window");
  // Android needs lower thresholds
  return Platform.OS === "android"
    ? screenWidth * 0.1 // 10% for Android
    : screenWidth * 0.2; // 20% for iOS
};

export const getVelocityThreshold = () => {
  return Platform.OS === "android" ? 0.3 : 0.5;
};

// ScrollView helpers
export const getScrollViewProps = () => ({
  nestedScrollEnabled: Platform.OS === "android",
  removeClippedSubviews: Platform.OS === "android",
  keyboardShouldPersistTaps: "handled",
  showsVerticalScrollIndicator: false,
});

// StatusBar helpers
export const getStatusBarHeight = () => {
  if (Platform.OS === "android") {
    return StatusBar.currentHeight || 24;
  }
  // iOS handled by SafeAreaView
  return 0;
};

// Shadow/Elevation helpers
export const getShadowStyle = (elevation = 4) => {
  if (Platform.OS === "android") {
    return {
      elevation,
      backgroundColor: "white", // Required for elevation to work
    };
  }
  // iOS shadow properties
  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.1 * (elevation / 4),
    shadowRadius: elevation,
    backgroundColor: "white",
  };
};

// Keyboard helpers
export const getKeyboardAvoidingViewProps = () => ({
  behavior: Platform.OS === "ios" ? "padding" : "height",
  keyboardVerticalOffset: Platform.OS === "ios" ? 0 : getStatusBarHeight(),
});

// Export all for convenience
export default {
  getFontFamily,
  getTextStyle,
  isTablet,
  getNumColumns,
  getCardWidth,
  getSwipeThreshold,
  getVelocityThreshold,
  getScrollViewProps,
  getStatusBarHeight,
  getShadowStyle,
  getKeyboardAvoidingViewProps,
};
