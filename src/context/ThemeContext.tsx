import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../theme/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeMode?: 'light' | 'dark';
  onThemeChange?: (mode: 'light' | 'dark') => void;
}

export const ManyllaThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialThemeMode = 'light',
  onThemeChange 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(initialThemeMode === 'dark');

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (onThemeChange) {
      onThemeChange(newMode ? 'dark' : 'light');
    }
  };

  const setThemeMode = (mode: 'light' | 'dark') => {
    const newIsDarkMode = mode === 'dark';
    setIsDarkMode(newIsDarkMode);
    if (onThemeChange) {
      onThemeChange(mode);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setThemeMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};