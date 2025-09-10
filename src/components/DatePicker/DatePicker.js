import React from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";

const DatePicker = ({ value, onChange, label, ...props }) => {
  if (Platform.OS === "web") {
    // Web implementation - use HTML5 date input
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "12px 15px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #E0E0E0",
          backgroundColor: "#FFFFFF",
          width: "100%",
        }}
        {...props}
      />
    );
  } else {
    // Native implementation - use TextInput for now
    // Could integrate with @react-native-community/datetimepicker
    return (
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="MM/DD/YYYY"
        style={{
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#E0E0E0",
          backgroundColor: "#FFFFFF",
        }}
        {...props}
      />
    );
  }
};

export default DatePicker;
