/**
 * Error Classification System for Manylla
 * Provides centralized error types with user-friendly messages and recovery options
 */

export class AppError extends Error {
  constructor(message, code, userMessage, recoverable = false) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.userMessage = userMessage;
    this.recoverable = recoverable;
    this.timestamp = new Date().toISOString();
  }
}

export class NetworkError extends AppError {
  constructor(message, retryable = true) {
    super(
      message,
      "NETWORK_ERROR",
      "Connection issue. Please check your internet and try again.",
      retryable,
    );
    this.retryable = retryable;
  }
}

export class ValidationError extends AppError {
  constructor(field, message) {
    super(`Validation failed for ${field}`, "VALIDATION_ERROR", message, true);
    this.field = field;
  }
}

export class SyncError extends AppError {
  constructor(message, canRetry = true) {
    super(
      message,
      "SYNC_ERROR",
      "Unable to sync your data. Your changes are saved locally.",
      canRetry,
    );
    this.canRetry = canRetry;
  }
}

export class EncryptionError extends AppError {
  constructor(message) {
    super(
      message,
      "ENCRYPTION_ERROR",
      "Security error. Please try again or contact support.",
      false,
    );
  }
}

export class StorageError extends AppError {
  constructor(message, code = "STORAGE_ERROR") {
    const userMessages = {
      QUOTA_EXCEEDED: "Storage full. Please delete old profiles or data.",
      SAVE_FAILED: "Failed to save. Please try again.",
      LOAD_FAILED: "Failed to load data. Please refresh the page.",
      CORRUPTED: "Data corrupted. Attempting recovery...",
    };

    super(
      message,
      code,
      userMessages[code] || "Storage error. Please try again.",
      code !== "CORRUPTED",
    );
  }
}

export class AuthError extends AppError {
  constructor(message, code = "AUTH_ERROR") {
    const userMessages = {
      INVALID_CODE: "Invalid sync code. Please check and try again.",
      EXPIRED: "Session expired. Please re-enable sync.",
      UNAUTHORIZED: "Access denied. Please check your permissions.",
    };

    super(
      message,
      code,
      userMessages[code] || "Authentication error. Please try again.",
      true,
    );
  }
}

/**
 * Error handler utility
 */
export const ErrorHandler = {
  /**
   * Log error for debugging (production-safe)
   */
  log(error, context = {}) {
    // Error tracking service integration planned for production deployment
    // This console.error is development-only and will not appear in production builds
    // See TECH_DEBT.md for production error tracking implementation
    if (process.env.NODE_ENV !== "production") {
      // Development-only logging for debugging
      // Production builds will use external error tracking service
      console.error("Error occurred:", {
        message: error.message,
        code: error.code,
        context,
        stack: error.stack,
        timestamp: error.timestamp || new Date().toISOString(),
      });
    }

    // In production, errors should be sent to tracking service:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context });
    // }
  },

  /**
   * Convert unknown errors to AppError
   */
  normalize(error) {
    if (error instanceof AppError) {
      return error;
    }

    // Network-related errors
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return new NetworkError(error.message);
    }

    // Storage quota errors
    if (error.name === "QuotaExceededError") {
      return new StorageError(error.message, "QUOTA_EXCEEDED");
    }

    // Default fallback
    return new AppError(
      error.message || "An unexpected error occurred",
      "UNKNOWN_ERROR",
      "Something went wrong. Please try again.",
      true,
    );
  },

  /**
   * Extract user-friendly message from any error
   */
  getUserMessage(error) {
    if (error instanceof AppError) {
      return error.userMessage;
    }
    return "An unexpected error occurred. Please try again.";
  },

  /**
   * Check if error is recoverable
   */
  isRecoverable(error) {
    if (error instanceof AppError) {
      return error.recoverable;
    }
    return true; // Optimistic by default
  },
};
