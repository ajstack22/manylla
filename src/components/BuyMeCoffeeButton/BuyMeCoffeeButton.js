import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

const BuyMeCoffeeButton = ({ onPress, style, disabled = false }) => {
  const styles = createStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Support us on Buy Me a Coffee"
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>☕</Text>
        <Text style={styles.text}>Buy Me a Coffee</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = () => {
  const baseButton = {
    backgroundColor: "#FFDD00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#F7DF1E",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  const baseText = {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  };

  // Add web-specific styles
  if (Platform.OS === "web") {
    baseButton.cursor = "pointer";
    baseText.fontFamily =
      '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif';
    baseText.userSelect = "none";
  }

  return StyleSheet.create({
    button: baseButton,
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    emoji: {
      fontSize: 20,
    },
    text: baseText,
  });
};

export default BuyMeCoffeeButton;
