/**
 * Cross-Platform Theme Context
 * Works on iOS, Android, and Web
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme colors (Manila envelope inspired) - EXACT values as required
const lightTheme = {
  primary: "#A08670", // EXACT light primary as required
  secondary: "#F4E4C1",
  background: {
    primary: "#F5F5F5",
    secondary: "#FFFFFF",
    default: "#F5F5F5",
    paper: "#FFFFFF",
    manila: "#F4E4C1",
  },
  surface: "#FFFFFF",
  text: {
    primary: "#333333",
    secondary: "#666666",
    disabled: "#999999",
  },
  border: "#E0E0E0",
};

const darkTheme = {
  primary: "#A08C74", // EXACT dark primary as required
  secondary: "#3A3528",
  background: {
    primary: "#1A1A1A",
    secondary: "#2A2A2A",
    default: "#1A1A1A",
    paper: "#2A2A2A",
    manila: "#3A3528",
  },
  surface: "#2A2A2A",
  text: {
    primary: "#FFFFFF",
    secondary: "#AAAAAA",
    disabled: "#666666",
  },
  border: "#404040",
};

const manyllaTheme = {
  primary: "#9D8B73", // EXACT manylla primary as required
  secondary: "#8A7862",
  background: {
    primary: "#EBD9C3",
    secondary: "#F2E6D5",
    default: "#EBD9C3",
    paper: "#F7F0E6",
    manila: "#DCC8AA",
  },
  surface: "#F7F0E6",
  text: {
    primary: "#3D3028",
    secondary: "#5D4E42",
    disabled: "#8A7862",
  },
  border: "#C8B59B",
};

// Export color values for compatibility (from theme.ts)
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
  lightManilaBackground: "#F5EBDA",
  lightManilaPaper: "#FBF7F0",
  lightManilaAccent: "#EDD9BC",
  // Manylla mode - True manila envelope colors
  manyllaBackground: "#C4A66B",
  manyllaPaper: "#D4B896",
  manyllaAccent: "#E0C9A6",
  manyllaText: "#3D2F1F",
  manyllaTextSecondary: "#5D4A37",
  manyllaBorder: "#A68B5B",
  // Dark mode - Traditional dark theme
  darkBackground: "#1A1611",
  darkPaper: "#2A2319",
  darkAccent: "#3A3328",
  darkText: "#E8DCC0",
  darkTextSecondary: "#B8A888",
  // Component specific colors
  avatarDefaultBg: "#5D4E37",
  inputBackground: "#FFFFFF",
};

const ThemeContext = createContext(undefined);

// Platform-specific storage functions
const getStorageItem = async (key) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
};

const setStorageItem = async (key, value) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

export const ThemeProvider = ({ children, initialThemeMode, onThemeChange }) => {
  const [theme, setTheme] = useState(initialThemeMode || "light");
  const [themeMode, setThemeMode] = useState(initialThemeMode || "light");

  useEffect(() => {
    // Load saved theme
    const loadTheme = async () => {
      try {
        const savedTheme = await getStorageItem("manylla_theme");
        if (savedTheme) {
          setTheme(savedTheme);
          setThemeMode(savedTheme);
        } else if (initialThemeMode) {
          setTheme(initialThemeMode);
          setThemeMode(initialThemeMode);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    loadTheme();
  }, [initialThemeMode]);

  const toggleTheme = async () => {
    // Cycle through: light -> dark -> manylla -> light
    const newTheme =
      theme === "light" ? "dark" : theme === "dark" ? "manylla" : "light";
    setTheme(newTheme);
    setThemeMode(newTheme);
    
    try {
      await setStorageItem("manylla_theme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
    
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const setThemeModeState = (mode) => {
    setTheme(mode);
    setThemeMode(mode);
    if (onThemeChange) {
      onThemeChange(mode);
    }
  };

  const colors =
    theme === "light"
      ? lightTheme
      : theme === "dark"
        ? darkTheme
        : manyllaTheme;

  // Create Material-UI theme for web
  const createMuiTheme = () => {
    if (Platform.OS !== "web") return null;

    return {
      palette: {
        mode: theme === "manylla" ? "light" : theme,
        primary: {
          main: colors.primary,
          light: colors.secondary,
          dark: colors.primary,
        },
        secondary: {
          main: colors.secondary,
        },
        background: {
          default: colors.background.default || colors.background.primary,
          paper: colors.background.paper || colors.background.secondary,
        },
        text: {
          primary: colors.text.primary,
          secondary: colors.text.secondary,
          disabled: colors.text.disabled,
        },
        action: {
          active: colors.text.primary,
          hover: theme === "light" 
            ? manyllaColors.lightManilaAccent 
            : theme === "manylla"
              ? manyllaColors.manyllaAccent
              : manyllaColors.darkAccent,
          selected: theme === "light"
            ? manyllaColors.lightManilaAccent
            : theme === "manylla"
              ? manyllaColors.manyllaAccent
              : manyllaColors.darkAccent,
          disabled: colors.text.disabled,
          disabledBackground: "rgba(0, 0, 0, 0.12)",
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
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
      },
    };
  };

  const muiTheme = createMuiTheme();

  const value = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode: setThemeModeState,
    colors,
    muiTheme,
  };

  // On web, wrap with Material-UI ThemeProvider if available
  if (Platform.OS === "web") {
    try {
      const {
        ThemeProvider: MuiThemeProvider,
        createTheme,
      } = require("@mui/material/styles");
      const CssBaseline = require("@mui/material/CssBaseline").default;
      
      if (muiTheme) {
        const theme = createTheme(muiTheme);

        return (
          <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </MuiThemeProvider>
          </ThemeContext.Provider>
        );
      }
    } catch (e) {
      // Material-UI not available, just use context
      console.log("Material-UI not available, using plain context");
    }
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Backwards compatibility exports
export const ManyllaThemeProvider = ThemeProvider;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Export theme objects for direct import (compatibility with theme.ts)
export { lightTheme, darkTheme, manyllaTheme };