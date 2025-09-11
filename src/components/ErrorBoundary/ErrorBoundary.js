import React, { Component, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { ErrorFallback } from "./ErrorFallback";
import { ErrorRecovery } from "./ErrorRecovery";

// Minimal class component wrapper (required until React 19)
// This will be replaced with useErrorBoundary hook when React 19 is released
class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Delegate to callback from functional wrapper
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
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

      // Default fallback if none provided
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Something went wrong</Text>
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
    [FallbackComponent, errorHandler, showRecovery, showRecoveryOptions],
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
