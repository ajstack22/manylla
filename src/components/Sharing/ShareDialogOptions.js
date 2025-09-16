import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useShareStyles } from "./useShareStyles";

const expirationOptions = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "3 months" },
  { value: 180, label: "6 months" },
];

export const ShareDialogOptions = ({ expirationDays, onExpirationChange }) => {
  const { colors } = useTheme();
  const styles = useShareStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Access expires in</Text>
      <View style={styles.expirationGrid}>
        {expirationOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.expirationButton,
              expirationDays === option.value &&
                styles.expirationButtonSelected,
            ]}
            onPress={() => onExpirationChange(option.value)}
          >
            <Text
              style={[
                styles.expirationButtonText,
                expirationDays === option.value &&
                  styles.expirationButtonTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Export expirationOptions for use in other components
export { expirationOptions };
