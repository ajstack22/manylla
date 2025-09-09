import React, { createContext, useState, useContext, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'manylla';

// Manylla color palette
const manyllaColors = {
  primary: '#8B7355',        // Brown (manila envelope)
  background: '#F4E4C1',     // Light manila
  surface: '#FFFFFF',        
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3'
};

// Theme configurations
const themes = {
  light: {
    primary: '#8B7355',
    background: {
      primary: '#F5F5F5',
      secondary: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
  },
  dark: {
    primary: '#8B7355',
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#707070',
    },
  },
  manylla: {
    primary: '#8B7355',
    background: {
      primary: '#F4E4C1',
      secondary: '#FDFBF7',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
  },
};

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof themes.light;
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialThemeMode = 'manylla',
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

  const colors = themes[themeMode];

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// For compatibility with web version
export const ManyllaThemeProvider = ThemeProvider;