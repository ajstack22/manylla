import React from "react";
import { TextInput } from "react-native";
import { getTextStyle } from "../../utils/platformStyles";
import platform from "../../utils/platform";

const DatePicker = ({ value, onChange, label, themeColors, ...props }) => {
  // Default colors if theme not provided
  const defaultColors = {
    text: { primary: "#333333", disabled: "#999999" },
    border: "#E0E0E0",
    surface: "#FFFFFF",
  };
  const activeColors = themeColors || defaultColors;

  if (platform.isWeb) {
    // Web implementation - use HTML5 date input
    // Handle null/undefined values
    const normalizedValue = value || "";

    return (
      <input
        type="date"
        value={normalizedValue}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          padding: "12px 15px",
          fontSize: "16px",
          borderRadius: "8px",
          border: `1px solid ${activeColors.border}`,
          backgroundColor: activeColors.surface || activeColors.background?.paper || "#FFFFFF",
          color: activeColors.text?.primary || activeColors.text.primary || "#333333",
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
        placeholderTextColor={activeColors.text?.disabled || activeColors.text.disabled}
        style={[
          {
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: activeColors.border,
            backgroundColor: activeColors.surface || activeColors.background?.paper || "#FFFFFF",
          },
          getTextStyle("input", undefined, activeColors.text?.primary || activeColors.text.primary),
        ]}
        {...props}
      />
    );
  }
};

export default DatePicker;
