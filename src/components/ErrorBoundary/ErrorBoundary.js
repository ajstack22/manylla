import React, { Component, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { ErrorFallback } from "./ErrorFallback";
import { ErrorRecovery } from "./ErrorRecovery";
import { ErrorHandler } from "../../utils/errors";

// Minimal class component wrapper (required until React 19)
// This will be replaced with useErrorBoundary hook when React 19 is released
class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Normalize the error to our AppError type
    const normalizedError = ErrorHandler.normalize(error);

    // Log error with context
    ErrorHandler.log(normalizedError, {
      componentStack: errorInfo?.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString(),
    });

    // Delegate to callback from functional wrapper
    this.props.onError?.(normalizedError, errorInfo);

    // Update state with error info
    this.setState({
      error: normalizedError,
      errorInfo,
      errorCount: (this.state.errorCount || 0) + 1,
    });
  }

  resetError = () => {
    // Keep error count for tracking multiple errors
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      lastErrorTime: prevState.error ? new Date().toISOString() : null,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Use the fallback prop if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.resetError,
        });
      }

      // Default fallback with user-friendly message
      const userMessage = ErrorHandler.getUserMessage(this.state.error);
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10 }}>⚠️ Oops!</Text>
          <Text style={{ textAlign: "center", marginBottom: 20 }}>
            {userMessage}
          </Text>
          <TouchableOpacity
            onPress={this.resetError}
            style={{
              padding: 10,
              backgroundColor: "#A08670",
              borderRadius: 4,
            }}
          >
            <Text style={{ color: "white" }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper with hooks
export const ErrorBoundary = ({
  children,
  FallbackComponent = ErrorFallback,
  showRecovery = true,
}) => {
  const errorHandler = useErrorHandler();
  const [showRecoveryOptions, setShowRecoveryOptions] = useState(false);

  const handleError = useCallback(
    (error, errorInfo) => {
      errorHandler.logError(error, errorInfo);
    },
    [errorHandler],
  );

  const fallback = useCallback(
    ({ error, errorInfo, resetError }) => {
      const handleReset = () => {
        resetError();
        errorHandler.resetError();
        setShowRecoveryOptions(false);
      };

      return (
        <View style={{ flex: 1 }}>
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            resetError={handleReset}
            errorCount={errorHandler.errorCount}
            onRecover={errorHandler.recoverError}
            isRecovering={errorHandler.isRecovering}
          />

          {showRecovery && showRecoveryOptions && (
            <ErrorRecovery
              error={error}
              onRecover={async (action) => {
                try {
                  await action();
                  handleReset();
                } catch (err) {
                  console.error("Recovery failed:", err);
                }
              }}
              isRecovering={errorHandler.isRecovering}
            />
          )}

          {showRecovery &&
            !showRecoveryOptions &&
            errorHandler.errorCount > 1 && (
              <TouchableOpacity
                style={{
                  alignSelf: "center",
                  padding: 12,
                  marginTop: 8,
                }}
                onPress={() => setShowRecoveryOptions(true)}
              >
                <Text
                  style={{ color: "#A08670", textDecorationLine: "underline" }}
                >
                  Show Recovery Options
                </Text>
              </TouchableOpacity>
            )}
        </View>
      );
    },
    [errorHandler, showRecovery, showRecoveryOptions],
  );

  return (
    <ErrorBoundaryClass onError={handleError} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
};

// Default export with fallback
export default function ErrorBoundaryWithFallback({ children }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  );
}
