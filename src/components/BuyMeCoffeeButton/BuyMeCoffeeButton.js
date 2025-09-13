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

  if (Platform.OS === "web") {
    // Web: Show as a visible button that calls onPress
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
  } else {
    // Mobile: Show as button that calls onPress (which opens external link)
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
  }
};

const createStyles = () => {
  return StyleSheet.create({
    button: {
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
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "all 0.2s ease",
          ":hover": {
            backgroundColor: "#FFE135",
            transform: "translateY(-1px)",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
          },
          ":active": {
            transform: "translateY(0px)",
            shadowOffset: { width: 0, height: 1 },
          },
        },
      }),
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    emoji: {
      fontSize: 20,
    },
    text: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      textAlign: "center",
      ...Platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          userSelect: "none",
        },
      }),
    },
  });
};

export default BuyMeCoffeeButton;
