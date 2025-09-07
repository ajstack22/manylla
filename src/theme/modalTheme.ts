import { manyllaColors } from './theme';

// Modal theming configuration for consistency across all modals
export const modalTheme = {
  // Standard modal styling
  modal: {
    backdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
    },
    paper: {
      borderRadius: '16px',
      maxWidth: '600px',
      width: '90vw',
      maxHeight: '90vh',
    },
  },
  
  // AppBar/Header styling for modals
  header: {
    backgroundColor: manyllaColors.darkBrown,
    color: 'white',
    height: 64,
    borderRadius: '16px 16px 0 0',
  },
  
  // Content area styling
  content: {
    padding: {
      xs: 2,
      sm: 3,
    },
    spacing: 3,
  },
  
  // Form field styling
  textField: {
    variant: 'filled' as const,
    fullWidth: true,
    sx: {
      '& .MuiFilledInput-root': {
        backgroundColor: manyllaColors.inputBackground,
        borderRadius: '12px',
        '&:hover': {
          backgroundColor: manyllaColors.inputBackground,
        },
        '&.Mui-focused': {
          backgroundColor: manyllaColors.inputBackground,
        },
        '&:before, &:after': {
          display: 'none',
        },
      },
    },
  },
  
  // Button styling
  buttons: {
    primary: {
      variant: 'contained' as const,
      sx: {
        borderRadius: '8px',
        textTransform: 'none' as const,
        px: 3,
        py: 1,
      },
    },
    secondary: {
      variant: 'outlined' as const,
      sx: {
        borderRadius: '8px',
        textTransform: 'none' as const,
        px: 3,
        py: 1,
      },
    },
    cancel: {
      variant: 'text' as const,
      sx: {
        borderRadius: '8px',
        textTransform: 'none' as const,
        px: 3,
        py: 1,
      },
    },
  },
  
  // Avatar styling
  avatar: {
    large: {
      width: 120,
      height: 120,
      bgcolor: manyllaColors.avatarDefaultBg,
      color: 'white',
      fontSize: '3rem',
    },
    medium: {
      width: 80,
      height: 80,
      bgcolor: manyllaColors.avatarDefaultBg,
      color: 'white',
      fontSize: '2rem',
    },
    small: {
      width: 40,
      height: 40,
      bgcolor: manyllaColors.avatarDefaultBg,
      color: 'white',
      fontSize: '1.25rem',
    },
  },
  
  // Panel/Section styling (like in Settings modal)
  panel: {
    elevation: 0,
    sx: {
      p: 3,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      mb: 2,
    },
  },
  
  // Icon styling for modal headers
  headerIcon: {
    large: {
      fontSize: 64,
      mb: 2,
    },
    medium: {
      fontSize: 48,
      mb: 1,
    },
  },
  
  // Typography presets
  typography: {
    modalTitle: {
      variant: 'h5' as const,
      fontWeight: 600,
      textAlign: 'center' as const,
      mb: 1,
    },
    modalSubtitle: {
      variant: 'body1' as const,
      textAlign: 'center' as const,
      color: 'text.secondary',
      mb: 3,
    },
    sectionTitle: {
      variant: 'h6' as const,
      fontWeight: 500,
      mb: 2,
    },
  },
  
  // Shadows
  shadows: {
    modal: '0 8px 32px rgba(0, 0, 0, 0.12)',
    panel: '0 2px 8px rgba(0, 0, 0, 0.08)',
    button: '0 2px 4px rgba(0, 0, 0, 0.08)',
  },
  
  // Transitions
  transitions: {
    duration: {
      short: 200,
      standard: 300,
      long: 500,
    },
  },
};

// Helper function to get consistent modal dialog props
export const getModalDialogProps = (fullScreen = false) => ({
  fullScreen,
  maxWidth: 'sm' as const,
  PaperProps: {
    sx: {
      borderRadius: fullScreen ? 0 : modalTheme.modal.paper.borderRadius,
      overflow: 'hidden',
      boxShadow: modalTheme.shadows.modal,
    },
  },
});

// Helper function to get consistent text field props
export const getModalTextFieldProps = () => ({
  ...modalTheme.textField,
});

// Helper function to get consistent button props
export const getModalButtonProps = (type: 'primary' | 'secondary' | 'cancel' = 'primary') => ({
  ...modalTheme.buttons[type],
});