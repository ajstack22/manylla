import { useState, useCallback, useEffect } from "react";
import platform from "../utils/platform";

// Helper to show toast messages (simplified version)
const showToast = (message, type) => {
  if (platform.isWeb && typeof window !== "undefined") {
    // Could use a toast library in the future
    // Toast message would be shown here
  }
};

export const useErrorDisplay = (error, errorInfo) => {
  const [showDetails, setShowDetails] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    if (error) {
      // Determine user-friendly message
      let message = "An unexpected error occurred. Please try again.";

      if (error.message) {
        if (error.message.includes("AsyncStorage")) {
          message = "There was a problem accessing your local data.";
        } else if (
          error.message.includes("Network") ||
          error.message.includes("fetch")
        ) {
          message = "Network connection issue. Please check your internet.";
        } else if (
          error.message.includes("undefined") ||
          error.message.includes("null")
        ) {
          message = "Something unexpected happened. Please reload the app.";
        }
      }

      setUserMessage(message);

      // Auto-show details in dev
      const isDevelopment =
        (typeof global !== "undefined" && global.__DEV__) ||
        (platform.isWeb && process?.env?.NODE_ENV === "development");

      if (isDevelopment) {
        setShowDetails(true);
      }
    }
  }, [error]);

  const sendReport = useCallback(async () => {
    try {
      // In a real app, this would send error data to an error tracking service
      // Error report would be sent here

      // Simulate sending report
      await new Promise((resolve) => setTimeout(resolve, 500));

      setReportSent(true);
      showToast("Error report sent. Thank you!", "success");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
      }
      showToast("Failed to send report", "error");
    }
  }, []);

  const toggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);

  return {
    userMessage,
    showDetails,
    reportSent,
    sendReport,
    toggleDetails,
  };
};
