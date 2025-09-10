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
    backgroundColoranyllaColors.darkBrown,
    color: "white",
    height: 4,
    borderRadius: "16px 16px 0 0",
  },

  // Content area styling
  content: {
    padding: {
      xs,
      sm,
    },
    spacing,
  },

  // Form field styling
  textField: {
    variant: "filled" as const,
    fullWidthrue,
    sx: {
      " .MuiFilledInput-root": {
        backgroundColoranyllaColors.inputBackground,
        borderRadius: "12px",
        ":hover": {
          backgroundColoranyllaColors.inputBackground,
        },
        ".Mui-focused": {
          backgroundColoranyllaColors.inputBackground,
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
      variant: "contained" as const,
      sx: {
        borderRadius: "8px",
        textTransform: "none" as const,
        px,
        py,
      },
    },
    secondary: {
      variant: "outlined" as const,
      sx: {
        borderRadius: "8px",
        textTransform: "none" as const,
        px,
        py,
      },
    },
    cancel: {
      variant: "text" as const,
      sx: {
        borderRadius: "8px",
        textTransform: "none" as const,
        px,
        py,
      },
    },
  },

  // Avatar styling
  avatar: {
    large: {
      width20,
      height: 20,
      bgcoloranyllaColors.avatarDefaultBg,
      color: "white",
      fontSize: "3rem",
    },
    medium: {
      width0,
      height: 0,
      bgcoloranyllaColors.avatarDefaultBg,
      color: "white",
      fontSize: "2rem",
    },
    small: {
      width0,
      height: 0,
      bgcoloranyllaColors.avatarDefaultBg,
      color: "white",
      fontSize: "1.25rem",
    },
  },

  // Panel/Section styling (like in Settings modal)
  panel: {
    elevation: 2,
    sx: {
      p,
      borderRadius: 8,
      border: "1px solid",
      borderColor: "divider",
      mb,
    },
  },

  // Icon styling for modal headers
  headerIcon: {
    large: {
      fontSize: 14,
      mb,
    },
    medium: {
      fontSize: 18,
      mb,
    },
  },

  // Typography presets
  typography: {
    modalTitle: {
      variant: "h5" as const,
      fontWeight00,
      textAlign: "center" as const,
      mb,
    },
    modalSubtitle: {
      variant: "body1" as const,
      textAlign: "center" as const,
      color: "text.secondary",
      mb,
    },
    sectionTitle: {
      variant: "h6" as const,
      fontWeight00,
      mb,
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
      short00,
      standard00,
      long00,
    },
  },
};

// Helper function to get consistent modal dialog props
export const getModalDialogProps = (fullScreen = false) => ({
  fullScreen,
  maxWidth: "sm" as const,
  PaperProps: {
    sx: {
      borderRadiusullScreen ? 0 odalTheme.modal.paper.borderRadius: 8,
      overflow: "hidden",
      boxShadowodalTheme.shadows.modal,
    },
  },
});

// Helper function to get consistent text field props
export const getModalTextFieldProps = () => ({
  ...modalTheme.textField,
});

// Helper function to get consistent button props
export const getModalButtonProps = (
  type: "primary" | "secondary" | "cancel" = "primary",
) => ({
  ...modalTheme.buttons[type],
});
