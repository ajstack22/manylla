import { createTheme } from '@mui/material/styles';

const manyllaColors = {
  manila: '#F4E4C1',
  manilaLight: '#FAF3E3',
  manilaDark: '#E8D4A2',
  brown: '#8B6F47',
  darkBrown: '#5D4E37',
  accent: '#4A90E2',
  success: '#67B26F',
  warning: '#F4A261',
  error: '#E76F51',
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: manyllaColors.brown,
      light: manyllaColors.manila,
      dark: manyllaColors.darkBrown,
    },
    secondary: {
      main: manyllaColors.accent,
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
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
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
    mode: 'dark',
    primary: {
      main: manyllaColors.manila,
      light: manyllaColors.manilaLight,
      dark: manyllaColors.manilaDark,
    },
    secondary: {
      main: manyllaColors.accent,
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
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
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: lightTheme.components,
});