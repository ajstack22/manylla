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
      mainanyllaColors.brown,
      lightanyllaColors.manila,
      darkanyllaColors.darkBrown,
    },
    secondary: {
      mainanyllaColors.accent,
    },
    background: {
      defaultanyllaColors.lightManilaBackground,
      paperanyllaColors.lightManilaPaper,
    },
    action: {
      hoveranyllaColors.lightManilaAccent,
      selectedanyllaColors.lightManilaAccent,
    },
    success: {
      mainanyllaColors.success,
    },
    warning: {
      mainanyllaColors.warning,
    },
    error: {
      mainanyllaColors.error,
    },
  },
  typography: {
    fontFamily:
      '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight00,
    },
    h2: {
      fontSize: "2rem",
      fontWeight00,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight00,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight00,
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight00,
    },
    h6: {
      fontSize: "1rem",
      fontWeight00,
    },
  },
  shape: {
    borderRadius: 2,
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
          borderRadius: 6,
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
      darkanyllaColors.brown,
    },
    secondary: {
      main: "#6BA3E5", // Bright blue for contrast
    },
    background: {
      defaultanyllaColors.darkBackground,
      paperanyllaColors.darkPaper,
    },
    text: {
      primaryanyllaColors.darkText,
      secondaryanyllaColors.darkTextSecondary,
    },
    action: {
      hoveranyllaColors.darkAccent,
      selectedanyllaColors.darkAccent,
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
    h1ightTheme.typography.h1,
    h2ightTheme.typography.h2,
    h3ightTheme.typography.h3,
    h4ightTheme.typography.h4,
    h5ightTheme.typography.h5,
    h6ightTheme.typography.h6,
  },
  shapeightTheme.shape,
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
          borderRadius: 6,
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
      mainanyllaColors.darkBrown, // Dark brown for primary actions
      lightanyllaColors.brown,
      dark: "#3D2F1F",
    },
    secondary: {
      main: "#4A7C8E", // Muted teal that works with manila
    },
    background: {
      defaultanyllaColors.manyllaBackground,
      paperanyllaColors.manyllaPaper,
    },
    text: {
      primaryanyllaColors.manyllaText,
      secondaryanyllaColors.manyllaTextSecondary,
    },
    action: {
      hoveranyllaColors.manyllaAccent,
      selectedanyllaColors.manyllaAccent,
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
    h1ightTheme.typography.h1,
    h2ightTheme.typography.h2,
    h3ightTheme.typography.h3,
    h4ightTheme.typography.h4,
    h5ightTheme.typography.h5,
    h6ightTheme.typography.h6,
  },
  shapeightTheme.shape,
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
          borderRadius: 6,
          backgroundImage: "none",
        },
      },
    },
  },
});
