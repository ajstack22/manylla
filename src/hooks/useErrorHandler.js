import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import platform from "../utils/platform";
import {
  ErrorHandler,
} from "../utils/errors";

// Helper function to clear corrupted storage
const clearCorruptedStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const profileKeys = keys.filter(
      (key) =>
        key.startsWith("manylla_profile_") || key === "manylla_all_profiles",
    );
    await AsyncStorage.multiRemove(profileKeys);
  } catch (error) {
    console.error("Failed to clear storage:", error);
  }
};

// Helper function to reset app state
const resetAppState = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Failed to reset app state:", error);
  }
};

// Helper function to get user-friendly error message
const getUserMessage = (error) => {
  return ErrorHandler.getUserMessage(error);
};

// Helper function to send error report
const sendErrorReport = async (errorData) => {
  // Normalize the error first
  const normalizedError = ErrorHandler.normalize(errorData.error);

  // Log with context
  ErrorHandler.log(normalizedError, {
    userReport: true,
    ...errorData,
  });

  // In the future, this could send to an error tracking service
  if (platform.isWeb && typeof window !== "undefined") {
    // Could integrate with Sentry or similar service here
    if (window.Sentry) {
      window.Sentry.captureException(normalizedError, {
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
    // Normalize error to our AppError type
    const normalizedError = ErrorHandler.normalize(error);

    // Log using centralized handler
    ErrorHandler.log(normalizedError, {
      errorInfo,
      component: "ErrorBoundary",
      timestamp: new Date().toISOString(),
    });

    // Log to service
    if (platform.isWeb && typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(normalizedError, {
        contexts: { react: errorInfo },
      });
    }

    // Store for display
    setError(normalizedError);
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
      if (platform.isWeb && typeof window !== "undefined") {
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
    getErrorMessage: getUserMessage,
    sendErrorReport,
  };
};
