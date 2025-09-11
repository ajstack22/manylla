import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { getScrollViewProps } from "../../utils/platformStyles";
import { useTheme } from "../../context/ThemeContext";
import { useErrorDisplay } from "../../hooks/useErrorDisplay";

export const ErrorFallback = ({
  error,
  errorInfo,
  resetError,
  errorCount,
  onRecover,
  isRecovering,
}) => {
  const { colors, theme } = useTheme();
  const { userMessage, showDetails, reportSent, sendReport, toggleDetails } =
    useErrorDisplay(error, errorInfo);

  const isDevelopment =
    (typeof global !== "undefined" && global.__DEV__) ||
    (Platform.OS === "web" && process?.env?.NODE_ENV === "development");

  const styles = createStyles(colors, theme);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⚠️</Text>

        <Text style={styles.title}>Oops! Something went wrong</Text>

        <Text style={styles.message}>{userMessage}</Text>

        {errorCount > 2 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Multiple errors detected. The app may be unstable.
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={resetError}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          {errorCount > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                if (Platform.OS === "web" && typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Reload App</Text>
            </TouchableOpacity>
          )}

          {(isDevelopment || showDetails) && (
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={toggleDetails}
            >
              <Text style={styles.detailsButtonText}>
                {showDetails ? "Hide" : "Show"} Details
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showDetails && (
          <ScrollView {...getScrollViewProps()} style={styles.errorDetails}>
            {error?.message && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Error Message:</Text>
                <Text style={styles.codeText}>{error.message}</Text>
              </View>
            )}

            {error?.stack && isDevelopment && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Stack Trace:</Text>
                <Text style={styles.stackTrace}>{error.stack}</Text>
              </View>
            )}

            {errorInfo?.componentStack && isDevelopment && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Component Stack:</Text>
                <Text style={styles.stackTrace}>
                  {errorInfo.componentStack}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {!reportSent && isDevelopment && (
          <View style={styles.reportSection}>
            <TouchableOpacity style={styles.reportButton} onPress={sendReport}>
              <Text style={styles.reportButtonText}>📤 Send Error Report</Text>
            </TouchableOpacity>
            <Text style={styles.helpText}>
              Help us improve by reporting this error
            </Text>
          </View>
        )}

        {reportSent && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>
              ✓ Error report sent successfully
            </Text>
          </View>
        )}

        {isRecovering && (
          <View style={styles.recoveringContainer}>
            <Text style={styles.recoveringText}>Attempting recovery...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.background.default,
    },
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      padding: 24,
      maxWidth: 500,
      width: "100%",
      alignItems: "center",
      ...Platform.select({
        web: {
          boxShadow:
            theme === "dark"
              ? "0 2px 8px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "dark" ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 3,
        },
      }),
    },
    icon: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      textAlign: "center",
      color: colors.text.primary,
    },
    message: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 20,
    },
    warningBox: {
      backgroundColor: colors.warning.light || "#FFF3E0",
      borderRadius: 4,
      padding: 12,
      marginBottom: 16,
      width: "100%",
    },
    warningText: {
      color: colors.warning.dark || "#E65100",
      fontSize: 13,
      textAlign: "center",
    },
    actionButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
      marginBottom: 16,
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 4,
      marginHorizontal: 4,
      marginVertical: 4,
    },
    primaryButton: {
      backgroundColor: colors.primary.main || "#A08670",
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary.main || "#A08670",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
    },
    secondaryButtonText: {
      color: colors.primary.main || "#A08670",
      fontSize: 14,
      fontWeight: "500",
    },
    detailsButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    detailsButtonText: {
      color: colors.primary.main || "#A08670",
      fontSize: 13,
      textDecorationLine: "underline",
    },
    errorDetails: {
      backgroundColor: theme === "dark" ? "#1A1A1A" : "#F0F0F0",
      borderRadius: 4,
      padding: 12,
      marginBottom: 16,
      maxHeight: 200,
      width: "100%",
    },
    detailSection: {
      marginBottom: 12,
    },
    detailTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 4,
    },
    codeText: {
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      fontSize: 12,
      color: colors.text.secondary,
    },
    stackTrace: {
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      fontSize: 11,
      color: colors.text.secondary,
      lineHeight: 16,
    },
    reportSection: {
      alignItems: "center",
      marginTop: 8,
    },
    reportButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    reportButtonText: {
      color: colors.primary.main || "#A08670",
      fontSize: 13,
    },
    helpText: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: 4,
    },
    successMessage: {
      backgroundColor: colors.success.light || "#E8F5E9",
      borderRadius: 4,
      padding: 8,
      marginTop: 8,
    },
    successText: {
      color: colors.success.dark || "#2E7D32",
      fontSize: 13,
    },
    recoveringContainer: {
      marginTop: 16,
    },
    recoveringText: {
      color: colors.text.secondary,
      fontSize: 13,
    },
  });
