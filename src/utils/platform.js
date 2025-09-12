import {
  Platform,
  Dimensions,
  StatusBar,
  PixelRatio,
  Share as NativeShare,
  Clipboard,
  Linking,
} from "react-native";

// ============================================
// CORE PLATFORM DETECTION
// ============================================
export const isWeb = Platform.OS === "web";
export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";
export const isMobile = !isWeb;
export const isNative = isMobile; // Alias for clarity

// ============================================
// DEVICE DETECTION
// ============================================
export const isTablet = () => {
  const { width, height } = Dimensions.get("window");
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);
  const aspectRatio = maxDim / minDim;

  if (isAndroid) return minDim >= 600 && aspectRatio < 1.6;
  if (isIOS) return minDim >= 768;
  return width >= 768; // web
};

export const isPhone = () => !isTablet();

export const isLandscape = () => {
  const { width, height } = Dimensions.get("window");
  return width > height;
};

export const isPortrait = () => !isLandscape();

export const getDeviceType = () => {
  if (isTablet()) return "tablet";
  if (isPhone()) return "phone";
  return "desktop"; // web default
};

// ============================================
// FEATURE DETECTION
// ============================================
export const supportsHaptics = isIOS; // Android haptics unreliable
export const supportsFileInput = true; // All platforms now support
export const supportsTouch = isMobile;
export const supportsHover = isWeb;
export const supportsKeyboard = true;
export const supportsCamera = isMobile;
export const supportsStatusBar = isMobile;
export const supportsSafeArea = isIOS;
export const supportsBackHandler = isAndroid;
export const supportsElevation = isAndroid;
export const supportsShadow = !isAndroid;
export const supportsShare = isMobile || (isWeb && navigator.share);
export const supportsPrint = isWeb;
export const supportsClipboard = true; // All platforms
export const supportsDeepLinks = isMobile;
export const supportsLocalStorage = isWeb;
export const supportsAsyncStorage = true; // Polyfilled on web
export const supportsImagePicker = isMobile;
export const supportsNotifications = isMobile; // Web needs permission

// ============================================
// PLATFORM CAPABILITIES
// ============================================
export const capabilities = {
  maxImageSize: 5 * 1024 * 1024, // 5MB all platforms
  maxStorageSize: isWeb ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
  allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  supportedVideoTypes: isMobile ? ["video/mp4"] : ["video/mp4", "video/webm"],
};

// ============================================
// UNIFIED STYLE HELPERS
// ============================================
export const select = (options) => {
  if (isWeb && options.web !== undefined) return options.web;
  if (isIOS && options.ios !== undefined) return options.ios;
  if (isAndroid && options.android !== undefined) return options.android;
  if (isMobile && options.mobile !== undefined) return options.mobile;
  return options.default !== undefined ? options.default : null;
};

export const shadow = (elevation = 4, color = "#000") => {
  if (isAndroid) {
    return {
      elevation,
      backgroundColor: "white", // Required for Android shadows
    };
  }

  // iOS/Web shadows
  const shadowOpacity = Math.min(0.05 + elevation * 0.025, 0.3);
  const shadowRadius = elevation * 0.8;

  return {
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: Math.max(1, elevation / 2),
    },
    shadowOpacity,
    shadowRadius,
    backgroundColor: "white",
  };
};

export const font = (weight = "400", size = 14) => {
  const style = {
    fontSize: size,
  };

  if (isAndroid) {
    // Android font weight mapping
    const androidFonts = {
      100: "sans-serif-thin",
      200: "sans-serif-light",
      300: "sans-serif-light",
      400: "sans-serif",
      500: "sans-serif-medium",
      600: "sans-serif-medium",
      700: "sans-serif",
      800: "sans-serif",
      900: "sans-serif-black",
      normal: "sans-serif",
      bold: "sans-serif",
    };
    style.fontFamily = androidFonts[weight] || "sans-serif";
    if (weight === "700" || weight === "800" || weight === "bold") {
      style.fontWeight = "bold";
    }
  } else {
    // iOS and Web
    style.fontFamily = "System";
    style.fontWeight = weight;
  }

  return style;
};

// ============================================
// INPUT HELPERS
// ============================================
export const textInput = (multiline = false) => {
  const style = {
    ...font("400", 16),
  };

  if (isAndroid) {
    style.color = "#000000"; // Force black text on Android
    style.includeFontPadding = false; // Better text alignment
    if (multiline) {
      style.textAlignVertical = "top";
    }
  }

  return style;
};

export const textInputProps = () => ({
  underlineColorAndroid: "transparent",
  autoCapitalize: "none",
  autoCorrect: false,
  spellCheck: false,
  ...(isWeb && { autoComplete: "off" }),
});

// ============================================
// SCROLLVIEW CONFIGURATION
// ============================================
export const scrollView = () => ({
  nestedScrollEnabled: isAndroid,
  removeClippedSubviews: isAndroid,
  keyboardShouldPersistTaps: "handled",
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  contentInsetAdjustmentBehavior: isIOS ? "automatic" : undefined,
  bounces: isIOS,
  overScrollMode: isAndroid ? "never" : undefined,
  scrollEventThrottle: 16,
});

// ============================================
// KEYBOARD HANDLING
// ============================================
export const keyboardAvoiding = () => ({
  behavior: isIOS ? "padding" : "height",
  keyboardVerticalOffset: select({
    ios: 0,
    android: StatusBar.currentHeight || 24,
    web: 0,
    default: 0,
  }),
  enabled: isMobile,
});

// ============================================
// LAYOUT METRICS
// ============================================
export const statusBarHeight = () => {
  if (isAndroid) return StatusBar.currentHeight || 24;
  if (isIOS) return 0; // Handled by SafeAreaView
  return 0; // Web has no status bar
};

export const headerHeight = () => {
  const base = 56; // Material Design standard
  return base + statusBarHeight();
};

export const tabBarHeight = () => {
  return select({
    ios: 49,
    android: 56,
    web: 64,
    default: 56,
  });
};

// ============================================
// INTERACTION THRESHOLDS
// ============================================
export const swipeThreshold = () => {
  const { width } = Dimensions.get("window");
  return select({
    android: width * 0.1,
    ios: width * 0.2,
    web: 50, // Fixed pixel value for web
    default: width * 0.15,
  });
};

export const touchSlop = () => ({
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
});

// ============================================
// RESPONSIVE HELPERS
// ============================================
export const cardWidth = (columns = 1, containerWidth = null) => {
  const width = containerWidth || Dimensions.get("window").width;
  const padding = 32;
  const gap = 16;

  if (isAndroid && columns > 1) {
    // Android FlexWrap works better with percentages
    const percentage = 100 / columns - 2;
    return `${percentage}%`;
  }

  // iOS/Web can use calculated values
  return (width - padding - gap * (columns - 1)) / columns;
};

export const responsiveSize = (base, scale = 1) => {
  const { width } = Dimensions.get("window");
  const guidelineBaseWidth = 375; // iPhone X width
  const horizontalScale = width / guidelineBaseWidth;
  return Math.round(base * horizontalScale * scale);
};

// ============================================
// COMPONENT CONFIGURATIONS
// ============================================
export const modalConfig = () => ({
  animationType: isWeb ? "none" : "fade",
  transparent: true,
  statusBarTranslucent: isAndroid,
  hardwareAccelerated: isAndroid,
  presentationStyle: isIOS ? "overFullScreen" : undefined,
});

export const touchableConfig = () => ({
  activeOpacity: select({
    web: 0.7,
    ios: 0.2,
    android: 0.2,
    default: 0.2,
  }),
  delayPressIn: 0,
  delayPressOut: 100,
});

export const rippleConfig = (color = "#A08670") => {
  if (!isAndroid) return null;

  return {
    color,
    borderless: false,
    radius: 20,
  };
};

// ============================================
// API & NETWORK
// ============================================
export const apiBaseUrl = () => {
  if (isWeb) {
    // Use relative path for web to avoid CORS
    return "/manylla/qual/api";
  }
  // Full URL for mobile
  return "https://manylla.com/qual/api";
};

export const fetchConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  ...(isWeb && { credentials: "same-origin" }),
});

// ============================================
// STORAGE HELPERS
// ============================================
export const storage = {
  maxSize: () => capabilities.maxStorageSize,

  async checkQuota() {
    if (isWeb && "storage" in navigator && "estimate" in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      return {
        used: usage,
        total: quota,
        available: quota - usage,
        percentUsed: (usage / quota) * 100,
      };
    }
    // Mobile doesn't have quota API
    return {
      used: 0,
      total: capabilities.maxStorageSize,
      available: capabilities.maxStorageSize,
      percentUsed: 0,
    };
  },
};

// ============================================
// SHARING & CLIPBOARD
// ============================================
export const share = async (data) => {
  const { url, title, message } = data;

  if (isMobile) {
    return NativeShare.share({
      url,
      title,
      message,
    });
  }

  if (isWeb && navigator.share) {
    return navigator.share({
      url,
      title,
      text: message,
    });
  }

  // Fallback: copy to clipboard
  const shareText = `${title}
${message}
${url}`;
  return copyToClipboard(shareText);
};

export const copyToClipboard = async (text) => {
  if (isMobile) {
    return Clipboard.setString(text);
  }

  if (isWeb && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older browsers
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

export const readFromClipboard = async () => {
  if (isMobile) {
    return Clipboard.getString();
  }

  if (isWeb && navigator.clipboard) {
    return navigator.clipboard.readText();
  }

  return ""; // No fallback for reading
};

// ============================================
// PRINT FUNCTIONALITY
// ============================================
export const print = (elementId = null) => {
  if (!isWeb) {
    console.warn("Print not supported on mobile");
    return;
  }

  if (elementId) {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #${elementId}, #${elementId} * { visibility: visible; }
        #${elementId} { position: absolute; left: 0; top: 0; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  } else {
    window.print();
  }
};

// ============================================
// PERFORMANCE MONITORING
// ============================================
export const performance = {
  mark(name) {
    if (isWeb && window.performance) {
      window.performance.mark(name);
    }
  },

  measure(name, startMark, endMark) {
    if (isWeb && window.performance) {
      window.performance.measure(name, startMark, endMark);
    }
  },

  getEntries() {
    if (isWeb && window.performance) {
      return window.performance.getEntries();
    }
    return [];
  },
};

// ============================================
// DEPRECATED TRACKING (for migration)
// ============================================
export const DEPRECATED = {
  logUsage(feature) {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.warn(`DEPRECATED platform feature used: ${feature}`);
    }
  },
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default {
  // Detection
  isWeb,
  isIOS,
  isAndroid,
  isMobile,
  isNative,
  isTablet,
  isPhone,
  isLandscape,
  isPortrait,
  getDeviceType,

  // Features
  supportsHaptics,
  supportsFileInput,
  supportsTouch,
  supportsHover,
  supportsCamera,
  supportsStatusBar,
  supportsSafeArea,
  supportsBackHandler,
  supportsElevation,
  supportsShadow,
  supportsShare,
  supportsPrint,
  supportsClipboard,
  supportsDeepLinks,
  supportsLocalStorage,
  supportsAsyncStorage,
  supportsImagePicker,
  supportsNotifications,

  // Capabilities
  capabilities,

  // Utilities
  select,
  shadow,
  font,
  textInput,
  textInputProps,
  scrollView,
  keyboardAvoiding,
  statusBarHeight,
  headerHeight,
  tabBarHeight,
  swipeThreshold,
  touchSlop,
  cardWidth,
  responsiveSize,

  // Components
  modalConfig,
  touchableConfig,
  rippleConfig,

  // API & Storage
  apiBaseUrl,
  fetchConfig,
  storage,

  // Actions
  share,
  copyToClipboard,
  readFromClipboard,
  print,

  // Performance
  performance,

  // Deprecated
  DEPRECATED,
};

// Platform.OS references should now use specific detection exports:
// Instead of Platform.OS === 'web' → use isWeb
// Instead of Platform.OS === 'ios' → use isIOS
// Instead of Platform.OS === 'android' → use isAndroid
