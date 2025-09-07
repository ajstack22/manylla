/**
 * Cross-Platform Theme Context
 * Works on iOS, Android, and Web
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme colors (Manila envelope inspired)
const lightTheme = {
  primary: '#8B7355',
  secondary: '#F4E4C1',
  background: {
    primary: '#F5F5F5',
    secondary: '#FFFFFF',
  },
  surface: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
  },
  border: '#E0E0E0',
};

const darkTheme = {
  primary: '#A08C74',
  secondary: '#3A3528',
  background: {
    primary: '#1A1A1A',
    secondary: '#2A2A2A',
  },
  surface: '#2A2A2A',
  text: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    disabled: '#666666',
  },
  border: '#404040',
};

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children, initialThemeMode }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load saved theme
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('manylla_theme');
        if (savedTheme) {
          setTheme(savedTheme);
        } else if (initialThemeMode) {
          setTheme(initialThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, [initialThemeMode]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('manylla_theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  // For web, apply Material-UI theme
  const muiTheme = Platform.OS === 'web' ? {
    palette: {
      mode: theme,
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: colors.background.primary,
        paper: colors.background.secondary,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
    },
  } : null;

  const value = {
    theme,
    toggleTheme,
    colors,
    muiTheme,
  };

  // On web, wrap with Material-UI ThemeProvider if available
  if (Platform.OS === 'web') {
    try {
      const { ThemeProvider: MuiThemeProvider, createTheme } = require('@mui/material/styles');
      const CssBaseline = require('@mui/material/CssBaseline').default;
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
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Backwards compatibility exports
export const ManyllaThemeProvider = ThemeProvider;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};