import { createTheme } from "@mui/material/styles";

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

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: manyllaColors.brown,
      light: manyllaColors.manila,
      dark: manyllaColors.darkBrown,
    },
    secondary: {
      main: manyllaColors.accent,
    },
    background: {
      default: manyllaColors.lightManilaBackground,
      paper: manyllaColors.lightManilaPaper,
    },
    action: {
      hover: manyllaColors.lightManilaAccent,
      selected: manyllaColors.lightManilaAccent,
    },
    success: {
      main: manyllaColors.success,
    },
    warning: {
      main: manyllaColors.warning,
    },
    error: {
      main: manyllaColors.error,
    },
  },
  typography: {
    fontFamily:
      '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 500,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#D4B896", // Manila accent for primary
      light: "#E8DCC0",
      dark: manyllaColors.brown,
    },
    secondary: {
      main: "#6BA3E5", // Bright blue for contrast
    },
    background: {
      default: manyllaColors.darkBackground,
      paper: manyllaColors.darkPaper,
    },
    text: {
      primary: manyllaColors.darkText,
      secondary: manyllaColors.darkTextSecondary,
    },
    action: {
      hover: manyllaColors.darkAccent,
      selected: manyllaColors.darkAccent,
    },
    divider: "rgba(232, 220, 192, 0.12)", // Light divider on dark
    success: {
      main: "#7BC47F", // Bright green for visibility
    },
    warning: {
      main: "#F5B478", // Bright orange for visibility
    },
    error: {
      main: "#EA8368", // Bright red for visibility
    },
  },
  typography: {
    fontFamily:
      '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: lightTheme.typography.h1,
    h2: lightTheme.typography.h2,
    h3: lightTheme.typography.h3,
    h4: lightTheme.typography.h4,
    h5: lightTheme.typography.h5,
    h6: lightTheme.typography.h6,
  },
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          borderRadius: 16,
          backgroundImage: "none",
        },
      },
    },
  },
});

export const manyllaTheme = createTheme({
  palette: {
    mode: "light", // Base it on light mode for better component defaults
    primary: {
      main: manyllaColors.darkBrown, // Dark brown for primary actions
      light: manyllaColors.brown,
      dark: "#3D2F1F",
    },
    secondary: {
      main: "#4A7C8E", // Muted teal that works with manila
    },
    background: {
      default: manyllaColors.manyllaBackground,
      paper: manyllaColors.manyllaPaper,
    },
    text: {
      primary: manyllaColors.manyllaText,
      secondary: manyllaColors.manyllaTextSecondary,
    },
    action: {
      hover: manyllaColors.manyllaAccent,
      selected: manyllaColors.manyllaAccent,
    },
    divider: "rgba(61, 47, 31, 0.2)", // Dark brown divider
    success: {
      main: "#4A7A51", // Forest green for manila
    },
    warning: {
      main: "#B87333", // Copper for manila
    },
    error: {
      main: "#8B3A3A", // Burgundy for manila
    },
  },
  typography: {
    fontFamily:
      '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: lightTheme.typography.h1,
    h2: lightTheme.typography.h2,
    h3: lightTheme.typography.h3,
    h4: lightTheme.typography.h4,
    h5: lightTheme.typography.h5,
    h6: lightTheme.typography.h6,
  },
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(61, 47, 31, 0.15)",
          borderRadius: 16,
          backgroundImage: "none",
        },
      },
    },
  },
});
