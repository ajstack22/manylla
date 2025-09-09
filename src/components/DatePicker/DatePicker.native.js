import React from "react";
import { TextInput, TouchableOpacity, Text, Platform } from "react-native";

// Simple date input for React Native without external dependencies
const DatePicker = ({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  ...props
}) => {
  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleTextChange = (text) => {
    // Basic date formatting as user types
    let cleaned = text.replace(/[^\d/]/g, "");

    // Auto-add slashes
    if (cleaned.length === 2 && !cleaned.includes("/")) {
      cleaned = cleaned + "/";
    } else if (cleaned.length === 5 && cleaned.split("/").length === 2) {
      cleaned = cleaned + "/";
    }

    // Limit length
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }

    // Try to parse as date
    if (cleaned.length === 10) {
      const parts = cleaned.split("/");
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (
          month >= 1 &&
          month <= 12 &&
          day >= 1 &&
          day <= 31 &&
          year >= 1900
        ) {
          const date = new Date(year, month - 1, day);
          onChange &&
            onChange({
              nativeEvent: { timestamp: date.getTime() },
              target: { value: date },
            });
          return;
        }
      }
    }

    // Otherwise just pass the text
    onChange && onChange({ target: { value: cleaned } });
  };

  return (
    <TextInput
      {...props}
      value={formatDate(value)}
      onChangeText={handleTextChange}
      placeholder={placeholder}
      keyboardType="numbers-and-punctuation"
      maxLength={10}
    />
  );
};

export default DatePicker;
