import React, { useEffect } from "react";
import Toast from "react-native-toast-message";

interface ThemedToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error" | "info";
}

export const ThemedToast: React.FC<ThemedToastProps> = ({
  open,
  message,
  onClose,
  duration = 3000,
  type = "info",
}) => {
  useEffect(() => {
    if (open && message) {
      Toast.show({
        type: type,
        text1: message,
        visibilityTime: duration,
        onHide: onClose,
        position: "bottom",
        bottomOffset: 100,
      });
    }
  }, [open, message, duration, type, onClose]);

  // This component doesn't render anything - react-native-toast-message handles the UI
  return null;
};

// Export a helper function to show toasts directly
export const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info",
) => {
  Toast.show({
    type,
    text1: message,
    position: "bottom",
    bottomOffset: 100,
  });
};
