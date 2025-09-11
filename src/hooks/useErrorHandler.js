import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Helper function to clear corrupted storage
const clearCorruptedStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const profileKeys = keys.filter(
      (key) =>
        key.startsWith("manylla_profile_") || key === "manylla_all_profiles",
    );
    await AsyncStorage.multiRemove(profileKeys);
    console.log("Cleared corrupted storage");
  } catch (error) {
    console.error("Failed to clear storage:", error);
  }
};

// Helper function to reset app state
const resetAppState = async () => {
  try {
    await AsyncStorage.clear();
    console.log("Reset app state");
  } catch (error) {
    console.error("Failed to reset app state:", error);
  }
};

// Helper function to get user-friendly error message
const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";

  // Check for specific error types
  if (
    error.code === "STORAGE_ERROR" ||
    error.message?.includes("AsyncStorage")
  ) {
    return "There was a problem accessing your local data. You may need to clear storage and start fresh.";
  }

  if (error.code === "SYNC_ERROR" || error.message?.includes("sync")) {
    return "There was a problem syncing your data. You can continue using the app offline.";
  }

  if (error.code === "NETWORK_ERROR" || error.message?.includes("fetch")) {
    return "Network connection issue. Please check your internet connection.";
  }

  if (error.message?.includes("undefined") || error.message?.includes("null")) {
    return "Something unexpected happened. The app encountered missing data.";
  }

  // Default message
  return "An unexpected error occurred. Please try again or reload the app.";
};

// Helper function to send error report (placeholder for future implementation)
const sendErrorReport = async (errorData) => {
  // In the future, this could send to an error tracking service
  console.log("Error report:", errorData);

  // For now, just log to console
  if (Platform.OS === "web" && typeof window !== "undefined") {
    // Could integrate with Sentry or similar service here
    if (window.Sentry) {
      window.Sentry.captureException(new Error(errorData.error), {
        contexts: {
          error: errorData,
        },
      });
    }
  }

  return Promise.resolve();
};

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const resetError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
    setIsRecovering(false);
  }, []);

  const logError = useCallback((error, errorInfo) => {
    // Log to service
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.Sentry
    ) {
      window.Sentry.captureException(error, {
        contexts: { react: errorInfo },
      });
    }

    // Log to console in dev
    const isDevelopment =
      (typeof global !== "undefined" && global.__DEV__) ||
      (Platform.OS === "web" && process?.env?.NODE_ENV === "development");

    if (isDevelopment) {
      console.error("Error caught:", error);
      console.error("Error info:", errorInfo);
    }

    // Store for display
    setError(error);
    setErrorInfo(errorInfo);
    setErrorCount((prev) => prev + 1);
  }, []);

  const recoverError = useCallback(async () => {
    setIsRecovering(true);

    try {
      // Clear corrupted data if needed
      if (error?.code === "STORAGE_ERROR") {
        await clearCorruptedStorage();
      }

      // Reset app state if needed
      if (error?.code === "STATE_ERROR") {
        await resetAppState();
      }

      resetError();
    } catch (recoveryError) {
      console.error("Recovery failed:", recoveryError);
      // Force reload as last resort
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.reload();
      }
    }
  }, [error, resetError]);

  return {
    error,
    errorInfo,
    errorCount,
    isRecovering,
    logError,
    resetError,
    recoverError,
    getErrorMessage,
    sendErrorReport,
  };
};
