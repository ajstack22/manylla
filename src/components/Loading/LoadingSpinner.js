import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const colors = {
  primary: "#8B7355",
  secondary: "#A0937D",
  background: "#FDFBF7",
  surface: "#F4E4C1",
  text: "#4A4A4A",
  textSecondary: "#666666",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

export const LoadingSpinner = ({
  message = "Loading...",
  size = "large",
  fullScreen = false,
}) => {
  const content = (
    <>
      <ActivityIndicator
        size={size}
        color={colors.primary}
        style={styles.spinner}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </>
  );

  if (fullScreen) {
    return <View style={[styles.container, styles.fullScreen]}>{content}</View>;
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
    minHeight: "100%",
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});
