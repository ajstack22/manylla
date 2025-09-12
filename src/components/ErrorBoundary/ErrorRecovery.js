import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Recovery action functions
const clearLocalStorage = async () => {
  try {
    await AsyncStorage.clear();
    // Local storage cleared
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to clear local storage:", error);
    }
    throw error;
  }
};

const disableSync = async () => {
  try {
    await AsyncStorage.setItem("manylla_sync_disabled", "true");
    // Sync disabled
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to disable sync:", error);
    }
    throw error;
  }
};

const resetApplication = async () => {
  try {
    // Clear all storage
    await AsyncStorage.clear();

    // Reset to initial state
    await AsyncStorage.setItem("manylla_onboarding_complete", "false");

    // Application reset
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to reset application:", error);
    }
    throw error;
  }
};

export const ErrorRecovery = ({ error, onRecover, isRecovering }) => {
  const { colors, theme } = useTheme();
  const [recoveryOption, setRecoveryOption] = useState(null);

  const recoveryOptions = useMemo(() => {
    const options = [];

    // Add options based on error type
    if (
      error?.code === "STORAGE_ERROR" ||
      error?.message?.includes("AsyncStorage")
    ) {
      options.push({
        id: "clear-storage",
        label: "Clear Local Storage",
        description: "Remove all local data and start fresh",
        action: clearLocalStorage,
        icon: "🗑️",
      });
    }

    if (error?.code === "SYNC_ERROR" || error?.message?.includes("sync")) {
      options.push({
        id: "disable-sync",
        label: "Disable Sync",
        description: "Continue using app offline",
        action: disableSync,
        icon: "📵",
      });
    }

    // Always include reset option
    options.push({
      id: "reset-app",
      label: "Reset App",
      description: "Clear all data and settings",
      action: resetApplication,
      icon: "🔄",
    });

    return options;
  }, [error]);

  const handleRecover = async () => {
    if (recoveryOption) {
      await onRecover(recoveryOption.action);
    }
  };

  const styles = createStyles(colors, theme);

  if (isRecovering) {
    return (
      <View style={styles.recoveringContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary.main || "#A08670"}
        />
        <Text style={styles.recoveringText}>Attempting recovery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recovery Options</Text>
      <Text style={styles.subtitle}>Choose an option to attempt recovery:</Text>

      <View style={styles.optionsList}>
        {recoveryOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.recoveryOption,
              recoveryOption?.id === option.id && styles.selectedOption,
            ]}
            onPress={() => setRecoveryOption(option)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionTitle,
                  recoveryOption?.id === option.id &&
                    styles.selectedOptionTitle,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.optionDesc}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.recoverButton, !recoveryOption && styles.disabledButton]}
        onPress={handleRecover}
        disabled={!recoveryOption}
      >
        <Text
          style={[
            styles.recoverButtonText,
            !recoveryOption && styles.disabledButtonText,
          ]}
        >
          Perform Recovery
        </Text>
      </TouchableOpacity>

      <Text style={styles.warningText}>
        ⚠️ Recovery actions may result in data loss
      </Text>
    </View>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      padding: 16,
    },
    recoveringContainer: {
      alignItems: "center",
      padding: 24,
    },
    recoveringText: {
      marginTop: 12,
      color: colors.text.secondary,
      fontSize: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 16,
      textAlign: "center",
    },
    optionsList: {
      marginBottom: 20,
    },
    recoveryOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme === "dark" ? "#2A2A2A" : "#F8F8F8",
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectedOption: {
      borderColor: colors.primary.main || "#A08670",
      backgroundColor: theme === "dark" ? "#3A3A3A" : "#FFF",
    },
    optionIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    selectedOptionTitle: {
      color: colors.primary.main || "#A08670",
    },
    optionDesc: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    recoverButton: {
      backgroundColor: colors.primary.main || "#A08670",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 4,
      alignItems: "center",
      marginBottom: 12,
    },
    disabledButton: {
      backgroundColor: colors.action.disabled || "#CCCCCC",
    },
    recoverButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "500",
    },
    disabledButtonText: {
      color: colors.text.disabled || "#999999",
    },
    warningText: {
      fontSize: 12,
      color: colors.warning.main || "#FF9800",
      textAlign: "center",
      fontStyle: "italic",
    },
  });
