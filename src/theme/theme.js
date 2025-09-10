// React Native theme configuration - no Material-UI dependencies
// Export the color palette for use across the app
export const manyllaColors = {
  manila: "#F4E4C1",
  manilaLight: "#FAF3E3",
  manilaDark: "#E8D4A2",
  brown: "#8B6F47",
  darkBrown: "#5D4E37",
  accent: "#4A90E2",
  success: "#67B26F",
  warning: "#F4A261",
  error: "#E76F51",
  // Light manila tones for light mode
  lightManilaBackground: "#F5EBDA", // Darker warm manila (more saturated)
  lightManilaPaper: "#FBF7F0", // Off-white with manila tint for cards
  lightManilaAccent: "#EDD9BC", // More prominent manila for hover states
  // Manylla mode - True manila envelope colors
  manyllaBackground: "#C4A66B", // Actual manila envelope color
  manyllaPaper: "#D4B896", // Lighter manila for cards/papers
  manyllaAccent: "#E0C9A6", // Even lighter manila for hover states
  manyllaText: "#3D2F1F", // Dark brown text for contrast
  manyllaTextSecondary: "#5D4A37", // Medium brown for secondary text
  manyllaBorder: "#A68B5B", // Darker manila for borders
  // Dark mode - Traditional dark theme
  darkBackground: "#1A1611", // Very dark brown-black
  darkPaper: "#2A2319", // Slightly lighter dark
  darkAccent: "#3A3328", // Dark accent for hover
  darkText: "#E8DCC0", // Warm cream text
  darkTextSecondary: "#B8A888", // Muted cream for secondary
  // Component specific colors
  avatarDefaultBg: "#5D4E37", // Default avatar background (dark brown)
  inputBackground: "#FFFFFF", // White background for form inputs
};

// React Native theme configurations
export const lightTheme = {
  colors: {
    primary: manyllaColors.brown,
    primaryLight: manyllaColors.manila,
    primaryDark: manyllaColors.darkBrown,
    secondary: manyllaColors.accent,
    background: manyllaColors.lightManilaBackground,
    surface: manyllaColors.lightManilaPaper,
    text: "#333333",
    textSecondary: "#666666",
    textDisabled: "#999999",
    border: "#E0E0E0",
    success: manyllaColors.success,
    warning: manyllaColors.warning,
    error: manyllaColors.error,
  },
  typography: {
    fontFamily: 'Atkinson Hyperlegible, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: 40, fontWeight: '600' },
    h2: { fontSize: 32, fontWeight: '600' },
    h3: { fontSize: 24, fontWeight: '500' },
    h4: { fontSize: 20, fontWeight: '500' },
    h5: { fontSize: 18, fontWeight: '500' },
    h6: { fontSize: 16, fontWeight: '500' },
    body1: { fontSize: 16, fontWeight: '400' },
    body2: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    button: {
      borderRadius: 8,
      padding: { vertical: 10, horizontal: 24 },
    },
    card: {
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};

export const darkTheme = {
  colors: {
    primary: "#D4B896", // Manila accent for primary
    primaryLight: "#E8DCC0",
    primaryDark: manyllaColors.brown,
    secondary: "#6BA3E5", // Bright blue for contrast
    background: manyllaColors.darkBackground,
    surface: manyllaColors.darkPaper,
    text: manyllaColors.darkText,
    textSecondary: manyllaColors.darkTextSecondary,
    textDisabled: "#666666",
    border: "rgba(232, 220, 192, 0.12)",
    success: "#7BC47F", // Bright green for visibility
    warning: "#F5B478", // Bright orange for visibility
    error: "#EA8368", // Bright red for visibility
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    card: {
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

export const manyllaTheme = {
  colors: {
    primary: manyllaColors.darkBrown, // Dark brown for primary actions
    primaryLight: manyllaColors.brown,
    primaryDark: "#3D2F1F",
    secondary: "#4A7C8E", // Muted teal that works with manila
    background: manyllaColors.manyllaBackground,
    surface: manyllaColors.manyllaPaper,
    text: manyllaColors.manyllaText,
    textSecondary: manyllaColors.manyllaTextSecondary,
    textDisabled: "#8A7862",
    border: "rgba(61, 47, 31, 0.2)",
    success: "#4A7A51", // Forest green for manila
    warning: "#B87333", // Copper for manila
    error: "#8B3A3A", // Burgundy for manila
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    card: {
      borderRadius: 12,
      shadowColor: 'rgba(61, 47, 31, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};