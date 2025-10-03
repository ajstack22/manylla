import { StatusBar, Dimensions } from "react-native";
import platform from "./platform";

// Typography helpers
// Returns system font family for all platforms
// Parameter preserved for API compatibility and future custom font support
export const getFontFamily = (weight) => {
  // All platforms use system fonts currently
  // Weight parameter preserved for backward compatibility
  return "System";
};

export const getTextStyle = (variant, weight) => {
  const baseStyle = {
    fontFamily: getFontFamily(weight),
  };

  // Only add fontWeight for non-Android
  if (!platform.isAndroid && weight) {
    baseStyle.fontWeight = weight;
  }

  // Force black text on Android TextInputs
  if (platform.isAndroid && variant === "input") {
    baseStyle.color = "#000000";
  }

  return baseStyle;
};

// Layout helpers
export const isTablet = () => {
  const { width, height } = Dimensions.get("window");
  const aspectRatio = width / height;
  const minDimension = Math.min(width, height);

  if (platform.isAndroid) {
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
  if (platform.isAndroid) {
    // Android FlexWrap needs percentage widths
    return numColumns >= 2 ? "48%" : "100%";
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
  return platform.isAndroid
    ? screenWidth * 0.1 // 10% for Android
    : screenWidth * 0.2; // 20% for iOS
};

export const getVelocityThreshold = () => {
  return platform.isAndroid ? 0.3 : 0.5;
};

// ScrollView helpers
export const getScrollViewProps = () => ({
  nestedScrollEnabled: platform.isAndroid,
  removeClippedSubviews: platform.isAndroid,
  keyboardShouldPersistTaps: "handled",
  showsVerticalScrollIndicator: false,
});

// StatusBar helpers
export const getStatusBarHeight = () => {
  if (platform.isAndroid) {
    return StatusBar.currentHeight || 24;
  }
  // iOS handled by SafeAreaView
  return 0;
};

// Shadow/Elevation helpers
export const getShadowStyle = (elevation = 4) => {
  if (platform.isAndroid) {
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
  behavior: platform.isIOS ? "padding" : "height",
  keyboardVerticalOffset: platform.isIOS ? 0 : getStatusBarHeight(),
});

// Export all for convenience
const platformStyles = {
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

export default platformStyles;
