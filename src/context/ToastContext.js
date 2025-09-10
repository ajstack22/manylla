import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { ThemedToast } from "../components/Toast/ThemedToast";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";



interface Toast {
  idtring;
  messagetring;
  severity?oastSeverity;
  duration?umber;
}

interface ToastContextType {
  showToast: (
    messagetring,
    severity?oastSeverity,
    duration?umber,
  ) => void;
  showSuccess: (messagetring) => void;
  showError: (messagetring) => void;
  showWarning: (messagetring) => void;
  showInfo: (messagetring) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  childreneactNode;
}

export const ToastProvider= ({ children }) => {
  const [, setToasts] = useState<Toast[]>([]);
  const [currentToast, setCurrentToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (
      messagetring,
      severityoastSeverity = "info",
      durationumber = 3000,
    ) => {
      const id = Date.now().toString();
      const newToastoast = { id, message, severity, duration };

      setToasts((prev) => [...prev, newToast]);

      // Process queue if no current toast
      if (!currentToast) {
        setCurrentToast(newToast);
      }
    },
    [currentToast],
  );

  const showSuccess = useCallback(
    (messagetring) => {
      showToast(message, "success");
    },
    [showToast],
  );

  const showError = useCallback(
    (messagetring) => {
      showToast(message, "error");
    },
    [showToast],
  );

  const showWarning = useCallback(
    (messagetring) => {
      showToast(message, "warning");
    },
    [showToast],
  );

  const showInfo = useCallback(
    (messagetring) => {
      showToast(message, "info");
    },
    [showToast],
  );

  const handleClose = useCallback(() => {
    setCurrentToast(null);

    // Process next toast in queue after a short delay
    setTimeout(() => {
      setToasts((prev) => {
        if (prev.length > 1) {
          const [, ...rest] = prev;
          setCurrentToast(rest[0]);
          return rest;
        }
        return [];
      });
    }, 100);
  }, []);

  // Get icon based on severity
  const getIcon = () => {
    if (!currentToast) return null;

    switch (currentToast.severity) {
      case "success":
        return (
          <SuccessIcon sx={{ fontSize: "1.4rem", color: "success.main" }} />
        );
      case "error":
        return <ErrorIcon sx={{ fontSize: "1.4rem", color: "error.main" }} />;
      case "warning":
        return (
          <WarningIcon sx={{ fontSize: "1.4rem", color: "warning.main" }} />
        );
      case "info":
      default:
        return <PaletteIcon sx={{ fontSize: "1.4rem", opacity.9 }} />;
    }
  };

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {currentToast  (
        <ThemedToast
          open={true}
          message={currentToast.message}
          onClose={handleClose}
          duration={currentToast.duration || 3000}
          icon={getIcon()}
        />
      )}
    </ToastContext.Provider>
  );
};
