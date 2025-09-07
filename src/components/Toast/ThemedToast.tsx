import React from 'react';
import { Snackbar, Paper, Typography, IconButton, useTheme, alpha } from '@mui/material';
import { Close as CloseIcon, Palette as PaletteIcon } from '@mui/icons-material';
import { SlideProps, Slide } from '@mui/material';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface ThemedToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
  icon?: React.ReactNode;
}

export const ThemedToast: React.FC<ThemedToastProps> = ({ 
  open, 
  message, 
  onClose, 
  duration = 3000,
  icon 
}) => {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  
  // Determine toast styling based on current theme
  const getToastStyles = () => {
    const isManyllaMode = themeMode === 'manylla';
    const isDarkMode = themeMode === 'dark';
    
    if (isManyllaMode) {
      // Manylla mode - rich manila envelope colors
      return {
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        color: theme.palette.text.primary,
        borderColor: theme.palette.primary.dark,
        boxShadow: '0 4px 20px rgba(196, 166, 107, 0.3)',
      };
    } else if (isDarkMode) {
      // Dark mode - elegant dark with subtle accent
      return {
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        color: theme.palette.text.primary,
        borderColor: theme.palette.primary.main,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
      };
    } else {
      // Light mode - warm manila tones
      return {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderColor: alpha(theme.palette.primary.main, 0.3),
        boxShadow: '0 4px 20px rgba(139, 111, 71, 0.15)',
      };
    }
  };
  
  const styles = getToastStyles();
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          minWidth: '240px',
          maxWidth: '360px',
          borderRadius: '16px',
          border: `1px solid ${styles.borderColor}`,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          boxShadow: styles.boxShadow,
          backdropFilter: 'blur(10px)',
        }}
      >
        {icon || <PaletteIcon sx={{ fontSize: '1.4rem', opacity: 0.9 }} />}
        <Typography 
          variant="body2" 
          sx={{ 
            flex: 1,
            fontWeight: 500,
            letterSpacing: '0.3px',
            fontSize: '0.95rem',
          }}
        >
          {message}
        </Typography>
        <IconButton 
          size="small" 
          onClick={onClose}
          sx={{ 
            opacity: 0.6,
            '&:hover': { opacity: 1 }
          }}
        >
          <CloseIcon sx={{ fontSize: '1.1rem' }} />
        </IconButton>
      </Paper>
    </Snackbar>
  );
};