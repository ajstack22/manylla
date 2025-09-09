/**
 * Cross-Platform Theme Context
 * Works on iOS, Android, and Web
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme colors (Manila envelope inspired)
const lightTheme = {
  primary: "#8B7355",
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
  primary: "#A08C74",
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
  primary: "#8B7355",
  secondary: "#6B5D54",
  background: {
    primary: "#D4B896", // Richer manila (between light and dark)
    secondary: "#E8D4A2", // Slightly lighter manila for contrast
    default: "#D4B896", // Main manila background
    paper: "#E8D4A2", // Lighter manila for cards
    manila: "#C4A66B", // Darker manila accent
  },
  surface: "#E8D4A2",
  text: {
    primary: "#3D2F1F", // Dark brown for good contrast
    secondary: "#5D4A37", // Medium brown
    disabled: "#8B7355",
  },
  border: "#A68B5B",
};

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children, initialThemeMode }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Load saved theme
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("manylla_theme");
        if (savedTheme) {
          setTheme(savedTheme);
        } else if (initialThemeMode) {
          setTheme(initialThemeMode);
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
    try {
      await AsyncStorage.setItem("manylla_theme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors =
    theme === "light"
      ? lightTheme
      : theme === "dark"
        ? darkTheme
        : manyllaTheme;

  // For web, apply Material-UI theme
  const muiTheme =
    Platform.OS === "web"
      ? {
          palette: {
            mode: theme === "manylla" ? "light" : theme, // MUI doesn't have 'manylla' mode, use 'light' as base
            primary: {
              main: colors.primary,
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
            },
            action: {
              active: colors.text.primary,
              hover: "rgba(0, 0, 0, 0.04)",
              selected: "rgba(0, 0, 0, 0.08)",
              disabled: colors.text.disabled,
              disabledBackground: "rgba(0, 0, 0, 0.12)",
            },
          },
        }
      : null;

  const value = {
    theme,
    toggleTheme,
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
      const theme = createTheme(muiTheme);

      return (
        <ThemeContext.Provider value={value}>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </MuiThemeProvider>
        </ThemeContext.Provider>
      );
    } catch (e) {
      // Material-UI not available, just use context
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
