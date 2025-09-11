/**
 * Tests for Error Handling Implementation
 * Demonstrates the comprehensive error handling system
 */

import {
  AppError,
  NetworkError,
  ValidationError,
  SyncError,
  StorageError,
  AuthError,
  EncryptionError,
  ErrorHandler,
} from "../errors";

import {
  ErrorMessages,
  getErrorMessage,
  formatFieldName,
} from "../errorMessages";

describe("Error Classification System", () => {
  describe("AppError Base Class", () => {
    test("creates error with all properties", () => {
      const error = new AppError(
        "Test error",
        "TEST_ERROR",
        "User-friendly message",
        true,
      );

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.userMessage).toBe("User-friendly message");
      expect(error.recoverable).toBe(true);
      expect(error.timestamp).toBeDefined();
      expect(error.name).toBe("AppError");
    });
  });

  describe("NetworkError", () => {
    test("creates network error with default message", () => {
      const error = new NetworkError("Connection failed");

      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.userMessage).toBe(
        "Connection issue. Please check your internet and try again.",
      );
      expect(error.retryable).toBe(true);
    });

    test("creates non-retryable network error", () => {
      const error = new NetworkError("Connection failed", false);

      expect(error.retryable).toBe(false);
      expect(error.recoverable).toBe(false);
    });
  });

  describe("ValidationError", () => {
    test("creates validation error with field", () => {
      const error = new ValidationError("email", "Invalid email format");

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.field).toBe("email");
      expect(error.userMessage).toBe("Invalid email format");
      expect(error.recoverable).toBe(true);
    });
  });

  describe("SyncError", () => {
    test("creates sync error with retry option", () => {
      const error = new SyncError("Sync failed");

      expect(error.code).toBe("SYNC_ERROR");
      expect(error.userMessage).toBe(
        "Unable to sync your data. Your changes are saved locally.",
      );
      expect(error.canRetry).toBe(true);
    });
  });

  describe("StorageError", () => {
    test("creates storage error with specific code", () => {
      const error = new StorageError("Quota exceeded", "QUOTA_EXCEEDED");

      expect(error.code).toBe("QUOTA_EXCEEDED");
      expect(error.userMessage).toBe(
        "Storage full. Please delete old profiles or data.",
      );
    });

    test("creates storage error with default message", () => {
      const error = new StorageError("Unknown storage error", "UNKNOWN");

      expect(error.userMessage).toBe("Storage error. Please try again.");
    });
  });

  describe("AuthError", () => {
    test("creates auth error with invalid code", () => {
      const error = new AuthError("Invalid sync code", "INVALID_CODE");

      expect(error.code).toBe("INVALID_CODE");
      expect(error.userMessage).toBe(
        "Invalid sync code. Please check and try again.",
      );
    });
  });
});

describe("ErrorHandler Utility", () => {
  describe("normalize", () => {
    test("returns AppError unchanged", () => {
      const error = new NetworkError("Test");
      const normalized = ErrorHandler.normalize(error);

      expect(normalized).toBe(error);
    });

    test("converts network-related errors", () => {
      const error = new Error("fetch failed");
      const normalized = ErrorHandler.normalize(error);

      expect(normalized).toBeInstanceOf(NetworkError);
    });

    test("converts quota errors", () => {
      const error = new Error("QuotaExceededError");
      error.name = "QuotaExceededError";
      const normalized = ErrorHandler.normalize(error);

      expect(normalized).toBeInstanceOf(StorageError);
      expect(normalized.code).toBe("QUOTA_EXCEEDED");
    });

    test("converts unknown errors to AppError", () => {
      const error = new Error("Unknown error");
      const normalized = ErrorHandler.normalize(error);

      expect(normalized).toBeInstanceOf(AppError);
      expect(normalized.code).toBe("UNKNOWN_ERROR");
    });
  });

  describe("getUserMessage", () => {
    test("gets message from AppError", () => {
      const error = new ValidationError("email", "Invalid email");
      const message = ErrorHandler.getUserMessage(error);

      expect(message).toBe("Invalid email");
    });

    test("gets default message for non-AppError", () => {
      const error = new Error("Technical error");
      const message = ErrorHandler.getUserMessage(error);

      expect(message).toBe("An unexpected error occurred. Please try again.");
    });
  });

  describe("isRecoverable", () => {
    test("checks AppError recoverability", () => {
      const recoverableError = new NetworkError("Test");
      const nonRecoverableError = new EncryptionError("Test");

      expect(ErrorHandler.isRecoverable(recoverableError)).toBe(true);
      expect(ErrorHandler.isRecoverable(nonRecoverableError)).toBe(false);
    });

    test("defaults to recoverable for unknown errors", () => {
      const error = new Error("Unknown");

      expect(ErrorHandler.isRecoverable(error)).toBe(true);
    });
  });
});

describe("Error Messages", () => {
  describe("getErrorMessage", () => {
    test("gets message from category", () => {
      const message = getErrorMessage("NETWORK_ERROR", "timeout");

      expect(message).toBe("Request timed out. Please try again.");
    });

    test("gets message with parameters", () => {
      const message = getErrorMessage("VALIDATION_ERROR", "required", "Name");

      expect(message).toBe("Name is required");
    });

    test("returns default for unknown category", () => {
      const message = getErrorMessage("UNKNOWN_CATEGORY", "unknown");

      expect(message).toBe(ErrorMessages.GENERAL.unexpected);
    });

    test("returns category default for unknown key", () => {
      const message = getErrorMessage("NETWORK_ERROR", "unknown_key");

      expect(message).toBe("Connection problem. Please check your internet.");
    });
  });

  describe("formatFieldName", () => {
    test("formats camelCase to Title Case", () => {
      expect(formatFieldName("firstName")).toBe("First Name");
      expect(formatFieldName("emailAddress")).toBe("Email Address");
      expect(formatFieldName("phoneNumber")).toBe("Phone Number");
    });
  });
});

describe("Integration Scenarios", () => {
  test("network error with retry flow", () => {
    // Simulate network error
    const error = new NetworkError("Connection lost");

    // Check if retryable
    expect(error.retryable).toBe(true);

    // Get user message
    const message = ErrorHandler.getUserMessage(error);
    expect(message).toContain("Connection issue");

    // Log error
    const logSpy = jest.spyOn(console, "error").mockImplementation();
    ErrorHandler.log(error, { context: "api call" });

    // In production, this would not log
    // Check based on environment
    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment) {
      expect(logSpy).toHaveBeenCalled();
    }

    logSpy.mockRestore();
  });

  test("form validation error flow", () => {
    // Create validation errors
    const errors = {
      email: new ValidationError("email", "Invalid email format"),
      phone: new ValidationError("phone", "Phone number required"),
    };

    // Check all are recoverable
    Object.values(errors).forEach((error) => {
      expect(error.recoverable).toBe(true);
    });

    // Get user messages
    const messages = Object.entries(errors).reduce((acc, [field, error]) => {
      acc[field] = ErrorHandler.getUserMessage(error);
      return acc;
    }, {});

    expect(messages.email).toBe("Invalid email format");
    expect(messages.phone).toBe("Phone number required");
  });

  test("sync error with local save fallback", () => {
    // Simulate sync failure
    const error = new SyncError("Server unavailable");

    // Check recovery options
    expect(error.canRetry).toBe(true);
    expect(error.recoverable).toBe(true);

    // Get user message
    const message = ErrorHandler.getUserMessage(error);
    expect(message).toContain("saved locally");
  });

  test("storage quota exceeded scenario", () => {
    // Simulate quota error
    const error = new StorageError("Storage full", "QUOTA_EXCEEDED");

    // Check user gets actionable message
    const message = ErrorHandler.getUserMessage(error);
    expect(message).toContain("delete old profiles");

    // Error is recoverable
    expect(error.recoverable).toBe(true);
  });

  test("authentication error scenario", () => {
    // Simulate invalid sync code
    const error = new AuthError("Invalid code", "INVALID_CODE");

    // Get user message
    const message = ErrorHandler.getUserMessage(error);
    expect(message).toContain("check and try again");

    // Error is recoverable
    expect(error.recoverable).toBe(true);
  });
});

describe("Error Recovery Patterns", () => {
  test("automatic retry for transient errors", () => {
    const error = new NetworkError("Temporary failure");

    // Should be retryable
    expect(error.retryable).toBe(true);

    // Simulate retry logic
    let retryCount = 0;
    const maxRetries = 3;

    const retry = () => {
      retryCount++;
      if (retryCount < maxRetries) {
        throw error;
      }
      return "Success";
    };

    // Retry with exponential backoff
    let result;
    for (let i = 0; i < maxRetries; i++) {
      try {
        result = retry();
        break;
      } catch (e) {
        if (i === maxRetries - 1) {
          throw e;
        }
      }
    }

    expect(result).toBe("Success");
    expect(retryCount).toBe(maxRetries);
  });

  test("graceful degradation for non-critical errors", () => {
    // Simulate non-critical feature failure
    const error = new AppError(
      "Feature unavailable",
      "FEATURE_ERROR",
      "This feature is temporarily unavailable",
      true,
    );

    // Should be recoverable
    expect(error.recoverable).toBe(true);

    // App continues with degraded functionality
    const fallbackValue = "default";
    let result;

    try {
      throw error;
    } catch (e) {
      if (ErrorHandler.isRecoverable(e)) {
        result = fallbackValue;
      } else {
        throw e;
      }
    }

    expect(result).toBe(fallbackValue);
  });
});
