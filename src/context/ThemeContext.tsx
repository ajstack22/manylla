import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme, manyllaTheme } from '../theme/theme';

export type ThemeMode = 'light' | 'dark' | 'manylla';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
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
  initialThemeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

export const ManyllaThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialThemeMode = 'dark',
  onThemeChange 
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialThemeMode);

  const toggleTheme = () => {
    // Cycle through: light -> dark -> manylla -> light
    const nextMode: ThemeMode = 
      themeMode === 'light' ? 'dark' : 
      themeMode === 'dark' ? 'manylla' : 
      'light';
    
    setThemeModeState(nextMode);
    if (onThemeChange) {
      onThemeChange(nextMode);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (onThemeChange) {
      onThemeChange(mode);
    }
  };

  const theme = 
    themeMode === 'dark' ? darkTheme : 
    themeMode === 'manylla' ? manyllaTheme : 
    lightTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, setThemeMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};