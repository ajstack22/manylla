import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getTextStyle } from "../../utils/platformStyles";

import platform from "../../utils/platform";

const colors = {
  primary: "#A08670",
  secondary: "#A0937D",
  background: "#FDFBF7",
  surface: "#F4E4C1",
  text: "#4A4A4A",
  textSecondary: "#666666",
  border: "#E0E0E0",
  white: "#FFFFFF",
  error: "#D32F2F",
  action: {
    hover: "#F5F5F5",
    selected: "#E3F2FD",
  },
};

export const RichTextInput = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  required = false,
  multiline = true,
  rows = 3,
  autoFocus = false,
}) => {
  const textInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    code: false,
  });

  // Handle input changes
  const handleInput = (text) => {
    onChange(text);
  };

  // Simple format tracking for React Native
  const updateActiveFormats = () => {
    // In React Native, we'll track formats differently
    // This is a simplified version for the demo
  };

  // Apply formatting (simplified for React Native)
  const applyFormat = (command) => {
    // In a full implementation, this would apply formatting to the text
    // For now, we'll just toggle the active state
    setActiveFormats((prev) => ({
      ...prev,
      [command]: !prev[command],
    }));

    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  // Note: React Native handles keyboard shortcuts and paste automatically

  const minHeight = multiline ? rows * 24 : 40;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isFocused ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>

      {/* Formatting Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[
            styles.formatButton,
            {
              backgroundColor: activeFormats.bold
                ? colors.action.selected
                : "transparent",
            },
          ]}
          onPress={() => applyFormat("bold")}
        >
          <Icon name="format-bold" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.formatButton,
            {
              backgroundColor: activeFormats.italic
                ? colors.action.selected
                : "transparent",
            },
          ]}
          onPress={() => applyFormat("italic")}
        >
          <Icon name="format-italic" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.formatButton,
            {
              backgroundColor: activeFormats.code
                ? colors.action.selected
                : "transparent",
            },
          ]}
          onPress={() => applyFormat("code")}
        >
          <Icon name="code" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.formatButton}
          onPress={() => applyFormat("list")}
        >
          <Icon name="format-list-bulleted" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Editor */}
      <View
        style={[
          styles.editorContainer,
          { borderColor: isFocused ? colors.primary : colors.border },
        ]}
      >
        {/* Placeholder is handled by TextInput */}

        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            {
              minHeight,
              maxHeight: multiline ? 300 : minHeight,
              textAlignVertical: multiline ? "top" : "center",
            },
            getTextStyle("input"), // Force black text on Android
            platform.isAndroid && { color: "#000000" }, // Extra insurance
          ]}
          value={value}
          onChangeText={handleInput}
          onFocus={() => {
            setIsFocused(true);
            updateActiveFormats();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={
            platform.isAndroid ? "#999" : colors.textSecondary
          }
          multiline={multiline}
          numberOfLines={multiline ? rows : 1}
          autoFocus={autoFocus}
          selectionColor={colors.primary}
        />
      </View>

      {Boolean(helperText) && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  toolbar: {
    backgroundColor: colors.action.hover,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
  },
  formatButton: {
    minWidth: 36,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  editorContainer: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
