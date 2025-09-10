import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal } from "react-native";

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

export const LoadingOverlay = ({
  open,
  message = "Loading...",
}) => {
  return (
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.contentContainer}>
          <ActivityIndicator
            size="large"
            color={colors.white}
            style={styles.spinner}
          />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  spinner: {
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
  },
});
