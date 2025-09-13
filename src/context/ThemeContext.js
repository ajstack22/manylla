/**
 * Cross-Platform Theme Context
 * Works on iOS, Android, and Web
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import platform from "../utils/platform";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme colors (Manila envelope inspired) - EXACT values as required
const lightTheme = {
  primary: "#8B6F47", // Brown color for primary
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
  primary: "#8B6F47", // Brown color for primary (same as light for consistency)
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
  primary: "#5D4E37", // Dark brown for better contrast
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
  if (platform.isWeb) {
    return localStorage.getItem(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
};

const setStorageItem = async (key, value) => {
  if (platform.isWeb) {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

export const ThemeProvider = ({
  children,
  initialThemeMode,
  onThemeChange,
}) => {
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
      } catch (error) {}
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
    } catch (error) {}

    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const setThemeModeState = async (mode) => {
    setTheme(mode);
    setThemeMode(mode);
    
    try {
      await setStorageItem("manylla_theme", mode);
    } catch (error) {}
    
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

  // Theme configuration for React Native components
  const getThemeStyles = () => {
    return {
      borderRadius: 12,
      fontFamily:
        "Atkinson Hyperlegible, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      typography: {
        h1: { fontSize: 40, fontWeight: "600" },
        h2: { fontSize: 32, fontWeight: "600" },
        h3: { fontSize: 24, fontWeight: "500" },
        h4: { fontSize: 20, fontWeight: "500" },
        h5: { fontSize: 18, fontWeight: "500" },
        h6: { fontSize: 16, fontWeight: "500" },
        body1: { fontSize: 16, fontWeight: "400" },
        body2: { fontSize: 14, fontWeight: "400" },
        caption: { fontSize: 12, fontWeight: "400" },
      },
    };
  };

  const themeStyles = getThemeStyles();

  const value = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode: setThemeModeState,
    colors,
    styles: themeStyles,
  };

  // Pure React Native theme context - no Material-UI dependencies

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
