import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme, manyllaTheme, manyllaColors } from '../theme/theme';

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
  
  // Add colors object for compatibility with native version
  const colors = context.themeMode === 'dark' ? {
    primary: '#D4B896',
    background: { default: manyllaColors.darkBackground, paper: manyllaColors.darkPaper },
    text: { primary: manyllaColors.darkText, secondary: manyllaColors.darkTextSecondary },
    border: 'rgba(232, 220, 192, 0.12)',
  } : context.themeMode === 'manylla' ? {
    primary: manyllaColors.darkBrown,
    background: { default: manyllaColors.manyllaBackground, paper: manyllaColors.manyllaPaper },
    text: { primary: manyllaColors.manyllaText, secondary: manyllaColors.manyllaTextSecondary },
    border: manyllaColors.manyllaBorder,
  } : {
    primary: manyllaColors.brown,
    background: { default: manyllaColors.lightManilaBackground, paper: manyllaColors.lightManilaPaper },
    text: { primary: '#333333', secondary: '#666666' },
    border: '#E0E0E0',
  };
  
  return { ...context, colors, theme: context.themeMode };
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