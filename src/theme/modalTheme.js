import { manyllaColors } from "./theme";

// Modal theming configuration for consistency across all modals
export const modalTheme = {
  // Standard modal styling
  modal: {
    backdrop: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
    },
    paper: {
      borderRadius: "16px",
      maxWidth: "600px",
      width: "90vw",
      maxHeight: "90vh",
    },
  },

  // AppBar/Header styling for modals
  header: {
    backgroundColor: manyllaColors.darkBrown,
    color: "white",
    height: 4,
    borderRadius: "16px 16px 0 0",
  },

  // Content area styling
  content: {
    padding: {
      xs: 2,
      sm: 3,
    },
    spacing: 2,
  },

  // Form field styling
  textField: {
    variant: "filled",
    fullWidth: true,
    sx: {
      " .MuiFilledInput-root": {
        backgroundColor: manyllaColors.inputBackground,
        borderRadius: "12px",
        ":hover": {
          backgroundColor: manyllaColors.inputBackground,
        },
        ".Mui-focused": {
          backgroundColor: manyllaColors.inputBackground,
        },
        ":before, :after": {
          display: "none",
        },
      },
    },
  },

  // Button styling
  buttons: {
    primary: {
      variant: "contained",
      sx: {
        borderRadius: "8px",
        textTransform: "none",
        px: 3,
        py: 1.5,
      },
    },
    secondary: {
      variant: "outlined",
      sx: {
        borderRadius: "8px",
        textTransform: "none",
        px: 3,
        py: 1.5,
      },
    },
    cancel: {
      variant: "text",
      sx: {
        borderRadius: "8px",
        textTransform: "none",
        px: 3,
        py: 1.5,
      },
    },
  },

  // Avatar styling
  avatar: {
    large: {
      width: 120,
      height: 120,
      bgcolor: manyllaColors.avatarDefaultBg,
      color: "white",
      fontSize: "3rem",
    },
    medium: {
      width: 80,
      height: 80,
      bgcolor: manyllaColors.avatarDefaultBg,
      color: "white",
      fontSize: "2rem",
    },
    small: {
      width: 80,
      height: 80,
      bgcolor: manyllaColors.avatarDefaultBg,
      color: "white",
      fontSize: "1.25rem",
    },
  },

  // Panel/Section styling (like in Settings modal)
  panel: {
    elevation: 2,
    sx: {
      p: 3,
      borderRadius: 8,
      border: "1px solid",
      borderColor: "divider",
      mb: 2,
    },
  },

  // Icon styling for modal headers
  headerIcon: {
    large: {
      fontSize: 24,
      mb: 2,
    },
    medium: {
      fontSize: 18,
      mb: 2,
    },
  },

  // Typography presets
  typography: {
    modalTitle: {
      variant: "h5",
      fontWeight: 600,
      textAlign: "center",
      mb: 2,
    },
    modalSubtitle: {
      variant: "body1",
      textAlign: "center",
      color: "text.secondary",
      mb: 2,
    },
    sectionTitle: {
      variant: "h6",
      fontWeight: 600,
      mb: 2,
    },
  },

  // Shadows
  shadows: {
    modal: "0 8px 32px rgba(0, 0, 0, 0.12)",
    panel: "0 2px 8px rgba(0, 0, 0, 0.08)",
    button: "0 2px 4px rgba(0, 0, 0, 0.08)",
  },

  // Transitions
  transitions: {
    duration: {
      short: 200,
      standard: 300,
      long: 400,
    },
  },
};

// Helper function to get consistent modal dialog props
export const getModalDialogProps = (fullScreen = false) => ({
  fullScreen,
  maxWidth: "sm",
  PaperProps: {
    sx: {
      borderRadius: fullScreen ? 0 : modalTheme.modal.paper.borderRadius,
      overflow: "hidden",
      boxShadow: modalTheme.shadows.modal,
    },
  },
});

// Helper function to get consistent text field props
export const getModalTextFieldProps = () => ({
  ...modalTheme.textField,
});

// Helper function to get consistent button props
export const getModalButtonProps = (type = "primary") => ({
  ...modalTheme.buttons[type],
});
