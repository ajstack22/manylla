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
  // Dark manila/gold tones for dark mode
  darkManila: '#2A2319',      // Very dark warm brown-gold (main background)
  darkManilaPaper: '#3A3025',  // Slightly lighter for cards/papers
  darkManilaAccent: '#4A3D2F', // Even lighter for hover states
  darkManilaText: '#D4C4A0',   // Warm cream text color
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
      main: manyllaColors.darkManilaText,
      light: manyllaColors.manila,
      dark: manyllaColors.brown,
    },
    secondary: {
      main: '#6BA3E5', // Slightly lighter blue for better contrast
    },
    background: {
      default: manyllaColors.darkManila,
      paper: manyllaColors.darkManilaPaper,
    },
    text: {
      primary: manyllaColors.darkManilaText,
      secondary: '#B8A888',
    },
    action: {
      hover: manyllaColors.darkManilaAccent,
      selected: manyllaColors.darkManilaAccent,
    },
    divider: 'rgba(212, 196, 160, 0.12)',
    success: {
      main: '#7BC47F', // Slightly lighter for contrast
    },
    warning: {
      main: '#F5B478', // Slightly lighter for contrast
    },
    error: {
      main: '#EA8368', // Slightly lighter for contrast
    },
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
  },
});